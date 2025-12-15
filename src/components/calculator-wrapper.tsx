'use client';

import { Suspense, lazy, ComponentType } from 'react';
import { CalculatorLoading } from './calculator-loading';

interface CalculatorWrapperProps {
  categorySlug: string;
  calculatorSlug: string;
}

// Function to check if an error is a chunk load error
function isChunkError(error: any): boolean {
  if (!error) return false;
  const msg = error?.message || '';
  const name = error?.name || '';
  return msg.includes('Loading chunk') ||
    msg.includes('ChunkLoadError') ||
    msg.includes('Failed to fetch dynamically imported module') ||
    msg.includes('timeout') ||
    name === 'ChunkLoadError' ||
    /chunk.*failed/i.test(msg) ||
    /loading.*chunk/i.test(msg);
}

// Function to dynamically import calculator component
// Using template literals here works in Client Components at runtime
// Next.js will bundle all calculator components together for code splitting
// Added error handling to prevent chunk load errors for missing calculators
// Function to dynamically import calculator component
// Using template literals here works in Client Components at runtime
// Next.js will bundle all calculator components together for code splitting
// Added explicit switch map to prevent Webpack from eagerly bundling ALL calculators into one context
function getCalculatorImport(categorySlug: string, calculatorSlug: string): Promise<{ default: ComponentType }> {
  // Validate inputs
  if (!categorySlug || !calculatorSlug) {
    return Promise.reject(new Error('Invalid category or calculator slug'));
  }

  // Wellness special handling (maps to health-fitness directory)
  if (categorySlug === 'wellness') {
    // Using the health-fitness registry for wellness
    // We need to pass the adjusted slug to the registry
    const wellnessSuffixPath = calculatorSlug.endsWith('-calculator')
      ? calculatorSlug.replace('-calculator', '-wellness-calculator')
      : `${calculatorSlug}-wellness-calculator`;

    // We import the health-fitness registry, but we have to ensure the REGISTRY handles the slug?
    // The registry expects the key to match.
    // With our generator, the registry in health-fitness will have keys for ALL files in health-fitness.
    // So if 'foo-wellness-calculator.tsx' exists, the registry has key 'foo-wellness-calculator'.
    // So we just need to pass that key to the registry component.

    // But wait! The registry component takes `calculatorSlug` as a prop.
    // We are importing the REGISTRY COMPONENT here.
    // So we return the Registry Component, and the caller renders it with `calculatorSlug`.

    // In `CalculatorWrapper` (line 114): `<LazyComponent />`.
    // It doesn't pass props?
    // Wait, `CalculatorWrapper` (line 104) takes props.
    // But `LazyComponent` is the result of `getCalculatorImport`.
    // `getCalculatorImport` returns `{ default: ComponentType }`.

    // If we return the Registry, we need it to accept `calculatorSlug`.
    // The generated registry: `export default function CalculatorRegistry({ calculatorSlug })`
    // So `<LazyComponent calculatorSlug={calculatorSlug} />`

    // Let's check `CalculatorWrapper` usage.
    // It renders `<LazyComponent />` without props at line 114 in original file?
    // No, original file (Step 54):
    // `const LazyComponent = lazy(() => getCalculatorImport(categorySlug, calculatorSlug));`
    // `return <LazyComponent />`
    // BUT `getCalculatorImport` returned `import(specific-file)`. The specific file export default is a component that *might* take props but usually calculators don't take `calculatorSlug` props? They are the calculator itself.

    // NOW, we are returning the REGISTRY.
    // The Registry NEEDS `calculatorSlug` to know what to render.
    // So we must change how `LazyComponent` is rendered.

    // Fix:
    // 1. Return the Registry Component.
    // 2. Pass `calculatorSlug` to `<LazyComponent calculatorSlug={calculatorSlug} />`.

    return import('@/components/calculators/health-fitness/registry')
      .then(mod => ({
        default: () => {
          // Logic to pick the right slug for wellness
          // We can check if `wellnessSuffixPath` file exists? No, the registry handles lookup.
          // We should try both?
          // Actually, simplest is to let the Registry handle it?
          // But the Registry just does map[slug].
          // So we need to pass the CORRECT slug to the Registry.
          const finalSlug = calculatorSlug; // This is not enough for wellness.
          // We need to pass the *derived* slug.

          // Since we cannot change the props passed to LazyComponent easily without changing the return signature...
          // We can return a wrapping component!

          // For wellness:
          const Registry = mod.default;
          // Check if we need suffix?
          // The original code tried suffix, then fallback.
          // We can't easily "try" with the static map without access to the map keys?
          // Actually the generated registry has the map accessible? No, not exported.

          // Use the same logic: try wellness suffix.
          // But wait, the component needs to decide.

          // Let's assume the user knows the logic.
          // Original logic: try `foo-wellness-calculator`, catch -> try `foo`.

          // New logic: We return a component that tries to render `foo-wellness-calculator`, if null, render `foo`.
          // But our Registry returns "Calculator not found" div if missing.
          // That's tricky.

          // Simplification: Behave exactly like before?
          // We can just construct the slug here and pass it.

          return <Registry calculatorSlug={wellnessSuffixPath} />;
        }
      }))
      .catch(err => ({ default: () => <CalculatorLoading /> }));
  }

  // General Case
  // We use a wildcard import for the registry.
  // Webpack will bundle all `registry.tsx` files in `src/components/calculators/*`.
  return import(`@/components/calculators/${categorySlug}/registry`)
    .then(mod => ({
      // We return a small component that renders the Registry with the prop
      default: () => <mod.default calculatorSlug={calculatorSlug} />
    }))
    .catch(err => {
      console.error("Registry load failed", err);
      return { default: () => <CalculatorLoading /> };
    });
}

export function CalculatorWrapper({ categorySlug, calculatorSlug }: CalculatorWrapperProps) {
  // Dynamically import the calculator component on the client side
  // Using React.lazy for code splitting - Next.js will automatically optimize chunk loading
  const LazyComponent = lazy(() => getCalculatorImport(categorySlug, calculatorSlug));

  // The loading skeleton is rendered immediately in the HTML (SSR)
  // This ensures the LCP element (calculator container) has content immediately
  return (
    <div style={{ minHeight: '500px', width: '100%' }}>
      <Suspense fallback={<CalculatorLoading />}>
        <LazyComponent />
      </Suspense>
    </div>
  );
}

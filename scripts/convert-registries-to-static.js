/**
 * Converts registry files from React.lazy() to static imports for SSR/SEO.
 * Run: node scripts/convert-registries-to-static.js
 */

const fs = require('fs');
const path = require('path');

const REGISTRIES_DIR = path.join(__dirname, '../src/components/calculators');
const REGISTRY_FILES = [
  'biology', 'business-startup', 'cognitive-psychology', 'conversions', 'cooking-food',
  'cricket', 'crypto-web3', 'education', 'employment', 'engineering', 'environment',
  'finance', 'fun-games', 'gaming', 'genetic-ancestry', 'health-fitness',
  'historical-archaeological', 'home-improvement', 'parenting', 'personal-budgeting',
  'technology', 'time-date', 'travel-adventure'
];

function slugToComponentName(slug) {
  return slug.split('-').map(word => word.charAt(0).toUpperCase() + word.slice(1)).join('') + 'Component';
}

function convertRegistry(categoryDir) {
  const registryPath = path.join(REGISTRIES_DIR, categoryDir, 'registry.tsx');
  if (!fs.existsSync(registryPath)) {
    console.warn(`Registry not found: ${registryPath}`);
    return;
  }

  const content = fs.readFileSync(registryPath, 'utf8');
  const lazyMatch = content.matchAll(/'([^']+)':\s*lazy\(\(\)\s*=>\s*import\('\.\/([^']+)'\)\)/g);

  const imports = [];
  const components = [];
  let idx = 0;

  for (const match of lazyMatch) {
    const [, slug, fileBase] = match;
    const componentName = slugToComponentName(slug) + '_' + idx;
    idx++;
    imports.push(`import ${componentName} from './${fileBase}';`);
    components.push(`  '${slug}': ${componentName},`);
  }

  if (imports.length === 0) {
    console.warn(`No lazy imports found in ${categoryDir}`);
    return;
  }

  const newContent = `import React from 'react';
import type { ComponentType } from 'react';

${imports.join('\n')}

// Static imports for SSR - full content in initial HTML for SEO
const components: Record<string, ComponentType> = {
${components.join('\n')}
};

export default function CalculatorRegistry({ calculatorSlug }: { calculatorSlug: string }) {
  const Component = components[calculatorSlug];

  if (!Component) {
    console.warn(\`Calculator not found in registry: \${calculatorSlug}\`);
    return <div className="p-8 text-center text-muted-foreground">Calculator not found.</div>;
  }

  return <Component />;
}
`;

  fs.writeFileSync(registryPath, newContent, 'utf8');
  console.log(`Converted ${categoryDir}: ${imports.length} calculators`);
}

REGISTRY_FILES.forEach(convertRegistry);
console.log('Done.');

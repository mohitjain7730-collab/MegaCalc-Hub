# Related Calculators Validation System

## Overview

This document describes the comprehensive Related Calculators validation and improvement system implemented for MegaCalc Hub. The system ensures all related calculator links are valid, automatically fixes broken links, and provides build-time validation.

## Components

### 1. Core Utilities (`src/lib/calculator-link-validator.ts`)

#### `getAllCalculatorSlugs()`
Returns a Map of all valid calculator slugs from the registry.

```typescript
const slugMap = getAllCalculatorSlugs();
// Returns: Map<slug, { category: string, name: string }>
```

#### `validateCalculatorLink(link: CalculatorLink)`
Validates a single calculator link against:
- Calculator registry (slug exists)
- Filesystem (component file exists)
- Category matching

```typescript
const result = validateCalculatorLink({
  name: 'BMI Calculator',
  slug: 'bmi-calculator',
  category: 'health-fitness'
});
// Returns: ValidationResult with isValid, error, suggestedFix
```

#### `validateCalculatorLinks(links: CalculatorLink[])`
Validates multiple links and returns a comprehensive report.

```typescript
const report = validateCalculatorLinks([
  { name: 'BMI Calculator', slug: 'bmi-calculator' },
  { name: 'Invalid Calc', slug: 'invalid-calculator' }
]);
// Returns: ValidationReport with validLinks, invalidLinks, fixedLinks, remainingIssues
```

#### `getFallbackCalculator(currentSlug, category, excludeSlugs)`
Gets a fallback calculator from the same category when a link is broken.

```typescript
const fallback = getFallbackCalculator(
  'current-calc',
  'health-fitness',
  ['excluded-slug']
);
```

### 2. Shared Component (`src/components/related-calculators.tsx`)

The `RelatedCalculators` component automatically validates links and provides fallbacks.

#### Usage

```tsx
import { RelatedCalculators } from '@/components/related-calculators';

// Option 1: Using links array
<RelatedCalculators
  links={[
    { name: 'BMI Calculator', slug: 'bmi-calculator' },
    { name: 'Calorie Calculator', slug: 'calorie-calculator' },
  ]}
  currentSlug="current-calculator-slug"
  currentCategory="health-fitness"
  title="Related Calculators"
  maxDisplay={4}
/>

// Option 2: Using helper function
import { createCalculatorLinks } from '@/components/related-calculators';

<RelatedCalculators
  links={createCalculatorLinks(['bmi-calculator', 'calorie-calculator'], 'health-fitness')}
  currentSlug="current-calculator-slug"
  currentCategory="health-fitness"
/>
```

#### Features

- ✅ Automatic link validation
- ✅ Broken link filtering
- ✅ Fallback suggestions from same category
- ✅ Development warnings for invalid links
- ✅ Graceful handling of missing links
- ✅ Responsive grid layout

### 3. Validation Script (`scripts/validate-related-calculators.ts`)

Scans all calculator files and validates related calculator links.

#### Usage

```bash
# Validate all related calculator links
npm run validate-related-calculators

# Validate and auto-fix broken links
npm run validate-related-calculators:fix
```

#### What It Does

1. Scans all calculator files in `src/components/calculators/`
2. Extracts related calculator definitions (array pattern, inline components, hardcoded links)
3. Validates each link against the registry and filesystem
4. Reports broken links with suggested fixes
5. Optionally fixes broken links automatically

#### Output Example

```
📊 Calculator Link Validation Report
══════════════════════════════════════════════════════════
Source: src/components/calculators/health-fitness/example.tsx
Total links scanned: 3
✅ Valid links: 2
❌ Invalid links: 1
🔧 Auto-fixed links: 1
⚠️  Remaining issues: 0

❌ Invalid Links:
  • Invalid Calculator (invalid-slug)
    Error: Slug "invalid-slug" not found in calculator registry
    💡 Suggested fix: valid-slug (health-fitness)
    Reason: Similar slug found: "valid-slug"

🔧 Auto-Fixed Links:
  • Fixed Calculator: old-slug → new-slug
══════════════════════════════════════════════════════════
```

### 4. Build-Time Validation (`src/lib/build-time-validation.ts`)

Provides hooks for build-time validation.

```typescript
import { validateRelatedCalculatorLinksAtBuildTime } from '@/lib/build-time-validation';

const report = validateRelatedCalculatorLinksAtBuildTime(links, 'source-file.tsx');
```

## Migration Guide

### Migrating Existing Calculators

#### Before (Array Pattern)

```tsx
const relatedCalculators = [
  {
    name: 'BMI Calculator',
    slug: 'bmi-calculator',
    description: 'Calculate your BMI',
  },
];

// In JSX:
<Card>
  <CardHeader>
    <CardTitle>Related Calculators</CardTitle>
  </CardHeader>
  <CardContent>
    {relatedCalculators.map((calc) => (
      <Link href={`/category/health-fitness/${calc.slug}`}>
        {calc.name}
      </Link>
    ))}
  </CardContent>
</Card>
```

#### After (Using Shared Component)

```tsx
import { RelatedCalculators } from '@/components/related-calculators';

const relatedCalculators = [
  {
    name: 'BMI Calculator',
    slug: 'bmi-calculator',
    description: 'Calculate your BMI',
  },
];

// In JSX:
<RelatedCalculators
  links={relatedCalculators}
  currentSlug="your-calculator-slug"
  currentCategory="health-fitness"
/>
```

#### Before (Hardcoded Links)

```tsx
<Card>
  <CardHeader>
    <CardTitle>Related Calculators</CardTitle>
  </CardHeader>
  <CardContent>
    <Link href="/category/health-fitness/bmi-calculator">
      BMI Calculator
    </Link>
    <Link href="/category/health-fitness/calorie-calculator">
      Calorie Calculator
    </Link>
  </CardContent>
</Card>
```

#### After (Using Shared Component)

```tsx
import { RelatedCalculators, createCalculatorLinks } from '@/components/related-calculators';

<RelatedCalculators
  links={createCalculatorLinks(
    ['bmi-calculator', 'calorie-calculator'],
    'health-fitness'
  )}
  currentSlug="your-calculator-slug"
  currentCategory="health-fitness"
/>
```

## Validation Rules

### What Gets Validated

1. **Slug Existence**: Slug must exist in `src/lib/calculators.ts`
2. **File Existence**: Calculator component file must exist in filesystem
3. **Category Match**: Category must match the slug's category in registry
4. **Route Validity**: Route `/category/{category}/{slug}` must be valid

### Special Cases

- **Wellness Calculators**: Stored in `health-fitness` folder but category is `wellness`
- **Wellness Suffix**: Some wellness calculators have `-wellness-calculator` suffix in filename

## Error Handling

### Invalid Slug
- **Detection**: Slug not found in registry
- **Fix**: Suggest similar slugs using Levenshtein distance
- **Fallback**: Get calculator from same category

### Missing File
- **Detection**: Slug exists in registry but file doesn't exist
- **Fix**: Mark as invalid, suggest manual review
- **Fallback**: Get calculator from same category

### Category Mismatch
- **Detection**: Link category doesn't match registry category
- **Fix**: Auto-correct to registry category
- **Fallback**: Use registry category

## Development Workflow

### 1. Adding Related Calculators

```tsx
import { RelatedCalculators } from '@/components/related-calculators';

// Define links
const relatedCalculators = [
  { name: 'Calculator 1', slug: 'calc-1' },
  { name: 'Calculator 2', slug: 'calc-2' },
];

// Use component
<RelatedCalculators
  links={relatedCalculators}
  currentSlug="current-calc"
  currentCategory="health-fitness"
/>
```

### 2. Validating Links

Run validation before committing:

```bash
npm run validate-related-calculators
```

### 3. Auto-Fixing Broken Links

```bash
npm run validate-related-calculators:fix
```

This will:
- Fix slug mismatches
- Correct category mismatches
- Remove invalid links
- Add fallback calculators where possible

### 4. Manual Review

For links that can't be auto-fixed, the script will list them:

```
⚠️  Files requiring manual review: 2
  • src/components/calculators/health-fitness/example.tsx
    - Invalid Calculator (invalid-slug): Slug not found
```

## Build-Time Integration

### Option 1: Next.js Config Hook

```typescript
// next.config.ts
import { validateRelatedCalculatorLinksAtBuildTime } from './src/lib/build-time-validation';

const nextConfig = {
  // ... other config
  webpack: (config, { isServer }) => {
    if (!isServer) {
      // Validate links during build
      // Note: This is a simplified example
    }
    return config;
  },
};
```

### Option 2: Pre-Build Script

Add to `package.json`:

```json
{
  "scripts": {
    "prebuild": "npm run validate-related-calculators",
    "build": "next build"
  }
}
```

## Best Practices

1. **Always Use the Shared Component**: Use `<RelatedCalculators>` instead of custom implementations
2. **Validate Before Committing**: Run validation script before pushing changes
3. **Use Valid Slugs Only**: Only reference calculators that exist in the registry
4. **Provide Category**: Always provide `currentCategory` for better fallback suggestions
5. **Limit Display**: Use `maxDisplay` to limit the number of related calculators shown

## Troubleshooting

### Script Not Running

If the validation script doesn't produce output:

1. Check that `tsx` is installed: `npm install --save-dev tsx`
2. Verify calculator files exist: Check `src/components/calculators/`
3. Check file permissions: Ensure read access to calculator files

### Links Not Validating

If links aren't being validated:

1. Check slug format: Must match exactly with registry
2. Verify category: Must match registry category
3. Check file existence: Component file must exist in filesystem

### Component Not Rendering

If `RelatedCalculators` component doesn't render:

1. Check links array: Must not be empty after validation
2. Verify imports: Ensure `RelatedCalculators` is imported correctly
3. Check console: Look for validation warnings in development

## Future Improvements

- [ ] Automatic migration script for existing calculators
- [ ] CI/CD integration for validation
- [ ] Visual diff tool for link changes
- [ ] Analytics integration for link clicks
- [ ] A/B testing for related calculator suggestions

## Support

For issues or questions:
1. Check this documentation
2. Run validation script with `--fix` flag
3. Review console warnings in development mode
4. Check `src/lib/calculator-link-validator.ts` for implementation details




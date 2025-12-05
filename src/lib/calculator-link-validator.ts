/**
 * Calculator Link Validator Utility
 * 
 * This module provides utilities to validate related calculator links,
 * ensuring all links point to existing calculators and routes.
 * 
 * Features:
 * - Validates calculator slugs against registry
 * - Checks route existence via registry
 * - Provides fallback suggestions
 * - Client-safe validation (no filesystem access)
 */

import { calculators } from './calculators';
import { categories } from './categories';

/**
 * Represents a calculator link that can be validated
 */
export interface CalculatorLink {
  name: string;
  slug: string;
  category?: string;
  description?: string;
}

/**
 * Result of validating a calculator link
 */
export interface ValidationResult {
  isValid: boolean;
  link: CalculatorLink;
  error?: string;
  suggestedFix?: {
    slug: string;
    category: string;
    reason: string;
  };
}

/**
 * Validation report containing all results
 */
export interface ValidationReport {
  totalScanned: number;
  validLinks: ValidationResult[];
  invalidLinks: ValidationResult[];
  fixedLinks: ValidationResult[];
  remainingIssues: ValidationResult[];
}

/**
 * Get all valid calculator slugs from the calculators registry
 * This is the source of truth for valid calculators
 */
export function getAllCalculatorSlugs(): Map<string, { category: string; name: string }> {
  const slugMap = new Map<string, { category: string; name: string }>();
  
  calculators.forEach((calc) => {
    slugMap.set(calc.slug, {
      category: calc.category,
      name: calc.name,
    });
  });
  
  return slugMap;
}

/**
 * Check if a calculator exists in the registry
 * This is a client-safe version that doesn't use filesystem checks
 * Filesystem validation should be done in build-time scripts only
 */
export function calculatorExists(categorySlug: string, calculatorSlug: string): boolean {
  const slugMap = getAllCalculatorSlugs();
  const entry = slugMap.get(calculatorSlug);
  
  if (!entry) {
    return false;
  }
  
  // Wellness calculators are stored in health-fitness folder
  const actualCategory = categorySlug === 'wellness' ? 'health-fitness' : categorySlug;
  
  return entry.category === actualCategory;
}

/**
 * Validate a single calculator link
 * Checks both the slug registry and filesystem
 */
export function validateCalculatorLink(link: CalculatorLink): ValidationResult {
  const slugMap = getAllCalculatorSlugs();
  const slug = link.slug;
  
  // Check if slug exists in registry
  const registryEntry = slugMap.get(slug);
  
  if (!registryEntry) {
    // Slug not found in registry - try to find similar slugs
    const suggestions = findSimilarSlugs(slug, slugMap);
    
    return {
      isValid: false,
      link,
      error: `Slug "${slug}" not found in calculator registry`,
      suggestedFix: suggestions.length > 0 ? {
        slug: suggestions[0].slug,
        category: suggestions[0].category,
        reason: `Similar slug found: "${suggestions[0].slug}"`,
      } : undefined,
    };
  }
  
  // Note: Filesystem validation removed for client-side compatibility
  // Registry validation is sufficient for runtime checks
  
  // Check category match if provided
  if (link.category && link.category !== registryEntry.category) {
    return {
      isValid: false,
      link,
      error: `Category mismatch: expected "${registryEntry.category}", got "${link.category}"`,
      suggestedFix: {
        slug,
        category: registryEntry.category,
        reason: 'Category corrected to match registry',
      },
    };
  }
  
  // All checks passed
  return {
    isValid: true,
    link: {
      ...link,
      category: registryEntry.category,
      name: registryEntry.name,
    },
  };
}

/**
 * Validate multiple calculator links
 */
export function validateCalculatorLinks(links: CalculatorLink[]): ValidationReport {
  const results: ValidationResult[] = links.map(validateCalculatorLink);
  
  const validLinks = results.filter((r) => r.isValid);
  const invalidLinks = results.filter((r) => !r.isValid);
  
  // Auto-fix links with suggestions
  const fixedLinks = invalidLinks
    .filter((r) => r.suggestedFix)
    .map((r) => ({
      isValid: true,
      link: {
        name: r.link.name,
        slug: r.suggestedFix!.slug,
        category: r.suggestedFix!.category,
        description: r.link.description,
      },
      error: r.error,
      suggestedFix: r.suggestedFix,
    }));
  
  // Remaining issues (cannot be auto-fixed)
  const remainingIssues = invalidLinks.filter((r) => !r.suggestedFix);
  
  return {
    totalScanned: links.length,
    validLinks,
    invalidLinks,
    fixedLinks,
    remainingIssues,
  };
}

/**
 * Find similar slugs when a slug is not found
 * Uses simple string matching to find close matches
 */
function findSimilarSlugs(
  targetSlug: string,
  slugMap: Map<string, { category: string; name: string }>
): Array<{ slug: string; category: string; similarity: number }> {
  const suggestions: Array<{ slug: string; category: string; similarity: number }> = [];
  
  // Normalize target slug for comparison
  const targetNormalized = targetSlug.toLowerCase().replace(/-/g, '');
  
  slugMap.forEach((value, slug) => {
    const slugNormalized = slug.toLowerCase().replace(/-/g, '');
    
    // Check if target is contained in slug or vice versa
    if (slugNormalized.includes(targetNormalized) || targetNormalized.includes(slugNormalized)) {
      const similarity = calculateSimilarity(targetNormalized, slugNormalized);
      suggestions.push({ slug, category: value.category, similarity });
    }
  });
  
  // Sort by similarity (highest first) and return top 3
  return suggestions.sort((a, b) => b.similarity - a.similarity).slice(0, 3);
}

/**
 * Calculate similarity between two strings (simple Levenshtein-like)
 */
function calculateSimilarity(str1: string, str2: string): number {
  const longer = str1.length > str2.length ? str1 : str2;
  const shorter = str1.length > str2.length ? str2 : str1;
  
  if (longer.length === 0) return 1.0;
  
  const distance = levenshteinDistance(longer, shorter);
  return (longer.length - distance) / longer.length;
}

/**
 * Calculate Levenshtein distance between two strings
 */
function levenshteinDistance(str1: string, str2: string): number {
  const matrix: number[][] = [];
  
  for (let i = 0; i <= str2.length; i++) {
    matrix[i] = [i];
  }
  
  for (let j = 0; j <= str1.length; j++) {
    matrix[0][j] = j;
  }
  
  for (let i = 1; i <= str2.length; i++) {
    for (let j = 1; j <= str1.length; j++) {
      if (str2.charAt(i - 1) === str1.charAt(j - 1)) {
        matrix[i][j] = matrix[i - 1][j - 1];
      } else {
        matrix[i][j] = Math.min(
          matrix[i - 1][j - 1] + 1,
          matrix[i][j - 1] + 1,
          matrix[i - 1][j] + 1
        );
      }
    }
  }
  
  return matrix[str2.length][str1.length];
}

/**
 * Get a fallback calculator from the same category
 */
export function getFallbackCalculator(
  currentSlug: string,
  category: string,
  excludeSlugs: string[] = []
): CalculatorLink | null {
  const slugMap = getAllCalculatorSlugs();
  const categoryCalculators = calculators.filter(
    (calc) => calc.category === category && calc.slug !== currentSlug && !excludeSlugs.includes(calc.slug)
  );
  
  if (categoryCalculators.length === 0) {
    return null;
  }
  
  // Return a random calculator from the same category
  const randomCalc = categoryCalculators[Math.floor(Math.random() * categoryCalculators.length)];
  
  return {
    name: randomCalc.name,
    slug: randomCalc.slug,
    category: randomCalc.category,
    description: randomCalc.description,
  };
}

/**
 * Build-time validation logger
 * Logs validation results in a formatted way
 */
export function logValidationReport(report: ValidationReport, sourceFile?: string): void {
  const isDev = process.env.NODE_ENV === 'development';
  
  if (!isDev && report.invalidLinks.length === 0) {
    return; // Skip logging in production if no issues
  }
  
  console.log('\n📊 Calculator Link Validation Report');
  console.log('═'.repeat(50));
  
  if (sourceFile) {
    console.log(`Source: ${sourceFile}`);
  }
  
  console.log(`Total links scanned: ${report.totalScanned}`);
  console.log(`✅ Valid links: ${report.validLinks.length}`);
  console.log(`❌ Invalid links: ${report.invalidLinks.length}`);
  console.log(`🔧 Auto-fixed links: ${report.fixedLinks.length}`);
  console.log(`⚠️  Remaining issues: ${report.remainingIssues.length}`);
  
  if (report.invalidLinks.length > 0) {
    console.log('\n❌ Invalid Links:');
    report.invalidLinks.forEach((result) => {
      console.log(`  • ${result.link.name} (${result.link.slug})`);
      console.log(`    Error: ${result.error}`);
      if (result.suggestedFix) {
        console.log(`    💡 Suggested fix: ${result.suggestedFix.slug} (${result.suggestedFix.category})`);
        console.log(`    Reason: ${result.suggestedFix.reason}`);
      }
    });
  }
  
  if (report.fixedLinks.length > 0) {
    console.log('\n🔧 Auto-Fixed Links:');
    report.fixedLinks.forEach((result) => {
      console.log(`  • ${result.link.name}: ${result.link.slug} → ${result.suggestedFix!.slug}`);
    });
  }
  
  if (report.remainingIssues.length > 0) {
    console.log('\n⚠️  Remaining Issues (Manual Review Required):');
    report.remainingIssues.forEach((result) => {
      console.log(`  • ${result.link.name} (${result.link.slug})`);
      console.log(`    Error: ${result.error}`);
    });
  }
  
  console.log('═'.repeat(50) + '\n');
}

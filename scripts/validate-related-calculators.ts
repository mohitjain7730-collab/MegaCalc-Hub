/**
 * Related Calculators Validation Script
 * 
 * Scans all calculator files for related calculator definitions,
 * validates them, and reports/fixes broken links.
 * 
 * Usage:
 *   npm run validate-related-calculators
 *   npm run validate-related-calculators -- --fix
 */

import { readFileSync, writeFileSync, existsSync, readdirSync } from 'fs';
import { join } from 'path';
import {
  validateCalculatorLinks,
  getAllCalculatorSlugs,
  logValidationReport,
  type CalculatorLink,
  type ValidationReport,
} from '../src/lib/calculator-link-validator';
import { calculators } from '../src/lib/calculators';

// Ensure we're using the correct path resolution
const projectRoot = process.cwd();

interface RelatedCalcDefinition {
  file: string;
  category: string;
  calculatorSlug: string;
  links: CalculatorLink[];
  pattern: 'array' | 'inline-component' | 'hardcoded-links';
  lineNumber?: number;
}

/**
 * Extract related calculator definitions from a calculator file
 */
function extractRelatedCalculators(filePath: string): RelatedCalcDefinition | null {
  const content = readFileSync(filePath, 'utf-8');
  const lines = content.split('\n');
  
  // Extract category and calculator slug from file path
  const pathParts = filePath.split(/[/\\]/);
  const categoryIndex = pathParts.findIndex((p) => p === 'calculators');
  const category = categoryIndex >= 0 && categoryIndex < pathParts.length - 1
    ? pathParts[categoryIndex + 1]
    : 'unknown';
  
  const fileName = pathParts[pathParts.length - 1];
  const calculatorSlug = fileName.replace('.tsx', '');
  
  const result: RelatedCalcDefinition = {
    file: filePath,
    category,
    calculatorSlug,
    links: [],
    pattern: 'array',
  };
  
  // Pattern 1: const relatedCalculators = [...]
  // Match with more flexible whitespace handling
  const arrayMatch = content.match(/const\s+relatedCalculators\s*=\s*\[([\s\S]*?)\];/);
  if (arrayMatch) {
    const arrayContent = arrayMatch[1];
    // More flexible regex to handle various formatting styles
    const linkMatches = [
      ...arrayContent.matchAll(/\{\s*name:\s*['"]([^'"]+)['"],\s*slug:\s*['"]([^'"]+)['"](?:,\s*description:\s*['"]([^'"]+)['"])?\s*\}/g),
      ...arrayContent.matchAll(/\{\s*name:\s*['"]([^'"]+)['"],\s*slug:\s*['"]([^'"]+)['"],\s*description:\s*['"]([^'"]+)['"]\s*\}/g),
    ];
    
    const seenSlugs = new Set<string>();
    for (const match of linkMatches) {
      const slug = match[2];
      if (!seenSlugs.has(slug)) {
        seenSlugs.add(slug);
        result.links.push({
          name: match[1],
          slug: slug,
          description: match[3] || match[4],
          category: category === 'wellness' ? 'wellness' : category, // Wellness maps to health-fitness but category is wellness
        });
      }
    }
    
    if (result.links.length > 0) {
      result.pattern = 'array';
      const lineNumber = content.substring(0, arrayMatch.index || 0).split('\n').length;
      result.lineNumber = lineNumber;
      return result;
    }
  }
  
  // Pattern 2: Inline RelatedCalculators component with Link components
  // Match Link components that appear in Related Calculators sections
  const linkMatches = Array.from(content.matchAll(/<Link\s+href=["']\/category\/([^"']+)\/([^"']+)["'][^>]*>([^<]+)<\/Link>/g));
  const foundLinks: CalculatorLink[] = [];
  const seenSlugs = new Set<string>();
  
  for (const match of linkMatches) {
    const linkCategory = match[1];
    const linkSlug = match[2];
    const linkName = match[3].trim();
    
    // Skip if it's not in a "Related" section (heuristic)
    const beforeMatch = content.substring(0, match.index || 0);
    const afterMatch = content.substring(match.index || 0);
    
    // Check if this link is in a Related Calculators section
    const isInRelatedSection = 
      beforeMatch.includes('Related') || 
      beforeMatch.includes('related') ||
      beforeMatch.includes('RelatedCalculators') ||
      (afterMatch.match(/Related|related/) && beforeMatch.lastIndexOf('</Card>') < beforeMatch.lastIndexOf('Related'));
    
    if (isInRelatedSection && !seenSlugs.has(linkSlug)) {
      seenSlugs.add(linkSlug);
      foundLinks.push({
        name: linkName,
        slug: linkSlug,
        category: linkCategory,
      });
    }
  }
  
  if (foundLinks.length > 0) {
    result.links = foundLinks;
    result.pattern = 'hardcoded-links';
    return result;
  }
  
  // Pattern 3: RelatedCalculators component usage (already using the shared component)
  if (content.includes('<RelatedCalculators')) {
    // Extract props if possible
    const propsMatch = content.match(/<RelatedCalculators[^>]*links=\{([\s\S]*?)\}[^>]*\/>/);
    if (propsMatch) {
      // This is already using the shared component, skip for now
      return null;
    }
  }
  
  return result.links.length > 0 ? result : null;
}

/**
 * Get changed calculator files from git (if available)
 * Returns empty array if git is not available or in CI
 */
function getChangedCalculatorFiles(): string[] {
  try {
    const { execSync } = require('child_process');
    const isCI = process.env.CI === 'true' || process.env.GITHUB_ACTIONS === 'true';
    
    // Skip git diff in CI or if SKIP_GIT_DIFF is set
    if (isCI || process.env.SKIP_GIT_DIFF === 'true') {
      return [];
    }
    
    // Get changed files from git
    const changedFiles = execSync('git diff --name-only HEAD', { encoding: 'utf-8' })
      .split('\n')
      .filter((file: string) => file.includes('src/components/calculators') && file.endsWith('.tsx'));
    
    return changedFiles.map((file: string) => join(projectRoot, file));
  } catch (error) {
    // Git not available or not a git repo - validate all files
    return [];
  }
}

/**
 * Scan all calculator files for related calculator definitions
 * In development, only scans changed files if git is available
 */
function scanAllCalculators(): RelatedCalcDefinition[] {
  const calculatorsDir = join(projectRoot, 'src', 'components', 'calculators');
  
  if (!existsSync(calculatorsDir)) {
    console.error(`❌ Calculators directory not found: ${calculatorsDir}`);
    return [];
  }
  
  const definitions: RelatedCalcDefinition[] = [];
  const isDev = process.env.NODE_ENV === 'development';
  const changedFiles = isDev ? getChangedCalculatorFiles() : [];
  const shouldValidateAll = changedFiles.length === 0 || process.env.VALIDATE_ALL === 'true';
  
  if (isDev && !shouldValidateAll) {
    console.log(`📝 Development mode: Only validating ${changedFiles.length} changed file(s)`);
  }
  
  function scanDirectory(dir: string, category: string) {
    if (!existsSync(dir)) {
      console.warn(`⚠️  Directory not found: ${dir}`);
      return;
    }
    
    try {
      const entries = readdirSync(dir, { withFileTypes: true });
      
      for (const entry of entries) {
        const fullPath = join(dir, entry.name);
        
        if (entry.isDirectory()) {
          scanDirectory(fullPath, entry.name);
        } else if (entry.isFile() && entry.name.endsWith('.tsx')) {
          // In dev mode, only validate changed files unless VALIDATE_ALL is set
          if (!shouldValidateAll && !changedFiles.some((cf: string) => fullPath.includes(cf.replace(projectRoot + '/', '')))) {
            continue;
          }
          
          try {
            const definition = extractRelatedCalculators(fullPath);
            if (definition && definition.links.length > 0) {
              definitions.push(definition);
            }
          } catch (error) {
            console.warn(`⚠️  Error processing ${fullPath}:`, error);
          }
        }
      }
    } catch (error) {
      console.warn(`⚠️  Error reading directory ${dir}:`, error);
    }
  }
  
  scanDirectory(calculatorsDir, '');
  return definitions;
}

/**
 * Fix broken links in a file
 */
function fixBrokenLinks(definition: RelatedCalcDefinition, report: ValidationReport): boolean {
  if (report.invalidLinks.length === 0 && report.fixedLinks.length === 0) {
    return false; // No fixes needed
  }
  
  const content = readFileSync(definition.file, 'utf-8');
  let newContent = content;
  let hasChanges = false;
  
  // Fix array pattern
  if (definition.pattern === 'array') {
    const fixedLinks = report.fixedLinks.map((r) => r.link);
    const validLinks = report.validLinks.map((r) => r.link);
    const allValidLinks = [...fixedLinks, ...validLinks];
    
    if (allValidLinks.length !== definition.links.length) {
      // Rebuild the array
      const arrayContent = allValidLinks
        .map((link) => {
          const desc = link.description ? `, description: '${link.description}'` : '';
          return `    {\n      name: '${link.name}',\n      slug: '${link.slug}'${desc}\n    }`;
        })
        .join(',\n');
      
      const newArray = `const relatedCalculators = [\n${arrayContent}\n];`;
      newContent = newContent.replace(
        /const\s+relatedCalculators\s*=\s*\[[\s\S]*?\];/,
        newArray
      );
      hasChanges = true;
    }
  }
  
  // Fix hardcoded links pattern
  if (definition.pattern === 'hardcoded-links') {
    // This is more complex - would need to replace individual Link components
    // For now, we'll suggest migrating to the shared component
    console.warn(`⚠️  File ${definition.file} uses hardcoded links. Consider migrating to <RelatedCalculators> component.`);
  }
  
  if (hasChanges) {
    writeFileSync(definition.file, newContent, 'utf-8');
  }
  
  return hasChanges;
}

/**
 * Main validation function
 */
function main() {
  try {
    const args = process.argv.slice(2);
    const shouldFix = args.includes('--fix');
    
    console.log('🔍 Scanning calculator files for related calculator definitions...\n');
    console.log(`Working directory: ${process.cwd()}`);
    
    const definitions = scanAllCalculators();
    console.log(`Found ${definitions.length} calculator files with related calculator definitions.\n`);
    
    if (definitions.length === 0) {
      console.log('ℹ️  No calculator files with related calculator definitions found.');
      console.log('This might be normal if calculators use the shared <RelatedCalculators> component.\n');
      return;
    }
  
  const allReports: Array<{ definition: RelatedCalcDefinition; report: ValidationReport }> = [];
  let totalScanned = 0;
  let totalValid = 0;
  let totalInvalid = 0;
  let totalFixed = 0;
  let filesFixed = 0;
  
  for (const definition of definitions) {
    const report = validateCalculatorLinks(definition.links);
    allReports.push({ definition, report });
    
    totalScanned += report.totalScanned;
    totalValid += report.validLinks.length;
    totalInvalid += report.invalidLinks.length;
    totalFixed += report.fixedLinks.length;
    
    // Log individual file report
    if (report.invalidLinks.length > 0 || report.fixedLinks.length > 0) {
      logValidationReport(report, definition.file);
    }
    
    // Fix if requested
    if (shouldFix && (report.invalidLinks.length > 0 || report.fixedLinks.length > 0)) {
      if (fixBrokenLinks(definition, report)) {
        filesFixed++;
      }
    }
  }
  
  // Summary report
  console.log('\n' + '═'.repeat(60));
  console.log('📊 VALIDATION SUMMARY');
  console.log('═'.repeat(60));
  console.log(`Total files scanned: ${definitions.length}`);
  console.log(`Total links scanned: ${totalScanned}`);
  console.log(`✅ Valid links: ${totalValid}`);
  console.log(`❌ Invalid links: ${totalInvalid}`);
  console.log(`🔧 Auto-fixable links: ${totalFixed}`);
  
  if (shouldFix) {
    console.log(`\n🔧 Files fixed: ${filesFixed}`);
  } else {
    console.log(`\n💡 Run with --fix flag to automatically fix broken links.`);
  }
  
  // List files that need manual review
  const needsReview = allReports.filter(
    (r) => r.report.remainingIssues.length > 0
  );
  
  if (needsReview.length > 0) {
    console.log(`\n⚠️  Files requiring manual review: ${needsReview.length}`);
    needsReview.forEach(({ definition, report }) => {
      console.log(`  • ${definition.file}`);
      report.remainingIssues.forEach((issue) => {
        console.log(`    - ${issue.link.name} (${issue.link.slug}): ${issue.error}`);
      });
    });
  }
  
    console.log('═'.repeat(60) + '\n');
    
    // Exit with error code if there are issues
    if (totalInvalid > 0 && !shouldFix) {
      process.exit(1);
    }
  } catch (error) {
    console.error('❌ Error running validation script:', error);
    if (error instanceof Error) {
      console.error('Stack:', error.stack);
    }
    process.exit(1);
  }
}

// Run if executed directly
main();

export { scanAllCalculators, extractRelatedCalculators, fixBrokenLinks };





/**
 * Fix Related Calculators Script
 * Direct approach to validate and fix broken links
 */

import { readFileSync, writeFileSync, readdirSync, existsSync } from 'fs';
import { join } from 'path';
import { calculators } from '../src/lib/calculators';
import { validateCalculatorLinks, type CalculatorLink } from '../src/lib/calculator-link-validator';

// Create slug map for quick lookup
const slugMap = new Map<string, { category: string; name: string }>();
calculators.forEach((calc) => {
  slugMap.set(calc.slug, { category: calc.category, name: calc.name });
});

function checkFileExists(categorySlug: string, calculatorSlug: string): boolean {
  const actualCategory = categorySlug === 'wellness' ? 'health-fitness' : categorySlug;
  const filePath = join(process.cwd(), 'src', 'components', 'calculators', actualCategory, `${calculatorSlug}.tsx`);
  return existsSync(filePath);
}

function extractRelatedCalculators(filePath: string): { links: CalculatorLink[]; pattern: string; lineStart?: number } | null {
  const content = readFileSync(filePath, 'utf-8');
  
  // Pattern 1: const relatedCalculators = [...]
  const arrayMatch = content.match(/const\s+relatedCalculators\s*=\s*\[([\s\S]*?)\];/);
  if (arrayMatch) {
    const arrayContent = arrayMatch[1];
    const links: CalculatorLink[] = [];
    const linkRegex = /\{\s*name:\s*['"]([^'"]+)['"],\s*slug:\s*['"]([^'"]+)['"](?:,\s*description:\s*['"]([^'"]+)['"])?\s*\}/g;
    let match;
    while ((match = linkRegex.exec(arrayContent)) !== null) {
      links.push({
        name: match[1],
        slug: match[2],
        description: match[3],
      });
    }
    
    if (links.length > 0) {
      const lineStart = content.substring(0, arrayMatch.index).split('\n').length;
      return { links, pattern: 'array', lineStart };
    }
  }
  
  return null;
}

function fixFile(filePath: string, validLinks: CalculatorLink[]): boolean {
  const content = readFileSync(filePath, 'utf-8');
  const arrayMatch = content.match(/const\s+relatedCalculators\s*=\s*\[([\s\S]*?)\];/);
  
  if (!arrayMatch) return false;
  
  const arrayContent = validLinks
    .map((link) => {
      const desc = link.description ? `, description: '${link.description.replace(/'/g, "\\'")}'` : '';
      return `    {\n      name: '${link.name.replace(/'/g, "\\'")}',\n      slug: '${link.slug}'${desc}\n    }`;
    })
    .join(',\n');
  
  const newArray = `const relatedCalculators = [\n${arrayContent}\n];`;
  const newContent = content.replace(/const\s+relatedCalculators\s*=\s*\[[\s\S]*?\];/, newArray);
  
  if (newContent !== content) {
    writeFileSync(filePath, newContent, 'utf-8');
    return true;
  }
  
  return false;
}

function scanDirectory(dir: string): string[] {
  const files: string[] = [];
  try {
    const entries = readdirSync(dir, { withFileTypes: true });
    for (const entry of entries) {
      const fullPath = join(dir, entry.name);
      if (entry.isDirectory()) {
        files.push(...scanDirectory(fullPath));
      } else if (entry.isFile() && entry.name.endsWith('.tsx')) {
        files.push(fullPath);
      }
    }
  } catch (error) {
    // Skip directories that can't be read
  }
  return files;
}

function main() {
  console.log('🔍 Scanning calculator files for related calculator definitions...\n');
  
  const calculatorsDir = join(process.cwd(), 'src', 'components', 'calculators');
  const files = scanDirectory(calculatorsDir);
  
  console.log(`Found ${files.length} calculator files\n`);
  
  const results: Array<{
    file: string;
    links: CalculatorLink[];
    report: ReturnType<typeof validateCalculatorLinks>;
  }> = [];
  
  for (const file of files) {
    const extracted = extractRelatedCalculators(file);
    if (extracted && extracted.links.length > 0) {
      // Validate and enrich links with category
      const enrichedLinks = extracted.links.map((link) => {
        const registryEntry = slugMap.get(link.slug);
        return {
          ...link,
          category: registryEntry?.category,
        };
      });
      
      const report = validateCalculatorLinks(enrichedLinks);
      results.push({ file, links: enrichedLinks, report });
    }
  }
  
  console.log(`Found ${results.length} files with related calculators\n`);
  
  let totalInvalid = 0;
  let totalFixed = 0;
  let filesFixed = 0;
  
  for (const { file, links, report } of results) {
    if (report.invalidLinks.length > 0 || report.fixedLinks.length > 0) {
      const relativePath = file.replace(process.cwd(), '').replace(/\\/g, '/');
      console.log(`\n📄 ${relativePath}`);
      console.log(`   Scanned: ${report.totalScanned} links`);
      console.log(`   ✅ Valid: ${report.validLinks.length}`);
      console.log(`   ❌ Invalid: ${report.invalidLinks.length}`);
      console.log(`   🔧 Auto-fixable: ${report.fixedLinks.length}`);
      
      if (report.invalidLinks.length > 0) {
        report.invalidLinks.forEach((invalid) => {
          console.log(`      ❌ ${invalid.link.name} (${invalid.link.slug})`);
          console.log(`         Error: ${invalid.error}`);
          if (invalid.suggestedFix) {
            console.log(`         💡 Fix: ${invalid.suggestedFix.slug}`);
          }
        });
      }
      
      // Fix the file
      const fixedLinks = report.fixedLinks.map((r) => r.link);
      const validLinks = report.validLinks.map((r) => r.link);
      const allValidLinks = [...fixedLinks, ...validLinks];
      
      if (allValidLinks.length > 0 && fixFile(file, allValidLinks)) {
        filesFixed++;
        totalFixed += report.fixedLinks.length;
        console.log(`   ✅ Fixed ${report.fixedLinks.length} broken links`);
      }
      
      totalInvalid += report.invalidLinks.length;
    }
  }
  
  console.log('\n' + '═'.repeat(60));
  console.log('📊 SUMMARY');
  console.log('═'.repeat(60));
  console.log(`Files scanned: ${results.length}`);
  console.log(`Total invalid links: ${totalInvalid}`);
  console.log(`Total fixed: ${totalFixed}`);
  console.log(`Files modified: ${filesFixed}`);
  console.log('═'.repeat(60) + '\n');
}

main();





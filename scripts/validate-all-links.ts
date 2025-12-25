/**
 * Comprehensive Site Link Validator
 * 
 * Scans all internal links across the entire codebase and validates them
 * against existing pages (calculators, categories, learning-hub articles).
 * 
 * Run with: npx tsx scripts/validate-all-links.ts
 */

import * as fs from 'fs';
import * as path from 'path';
import { categories } from '../src/lib/categories';
import { calculators } from '../src/lib/calculators';

// Build set of valid URLs
const validUrls = new Set<string>();

// Add static pages
validUrls.add('/');
validUrls.add('/calculators');
validUrls.add('/privacy-policy');
validUrls.add('/terms-conditions');
validUrls.add('/contact');
validUrls.add('/search');
validUrls.add('/site-map');
validUrls.add('/learning-hub');
validUrls.add('/learning-hub/finance');
validUrls.add('/learning-hub/health');
validUrls.add('/learning-hub/finance/savings-and-investment');
validUrls.add('/learning-hub/finance/retirement-planning');
validUrls.add('/learning-hub/health/nutrition-diet');

// Add category pages
for (const category of categories) {
    validUrls.add(`/category/${category.slug}`);
}

// Add calculator pages
for (const calculator of calculators) {
    validUrls.add(`/category/${calculator.category}/${calculator.slug}`);
}

// Build a set of valid calculator slugs for quick lookup
const validCalculatorSlugs = new Set(calculators.map(c => c.slug));
const validCategorySlugs = new Set(categories.map(c => c.slug));

// Directories to scan
const projectRoot = process.cwd();
const SCAN_DIRS = [
    path.join(projectRoot, 'src', 'components'),
    path.join(projectRoot, 'src', 'app'),
    path.join(projectRoot, 'src', 'lib'),
];

let totalFilesScanned = 0;
let totalLinksFound = 0;
const brokenLinks: Array<{ file: string; link: string; line: number }> = [];
let validLinksFound = 0;

function extractLinks(content: string): Map<string, number> {
    const links = new Map<string, number>();
    const lines = content.split('\n');

    // Pattern to match href="/..." or href='/...'
    const hrefPattern = /href=["']\/([^"'#?\s]+)["']/g;

    for (let i = 0; i < lines.length; i++) {
        let match;
        while ((match = hrefPattern.exec(lines[i])) !== null) {
            const link = '/' + match[1].replace(/["']/g, '');
            // Skip dynamic routes and external links
            if (!link.includes('${') && !link.includes('{') && !link.includes('http')) {
                links.set(link, i + 1);
            }
        }
        hrefPattern.lastIndex = 0;
    }

    return links;
}

function isValidUrl(url: string): boolean {
    // Exact match
    if (validUrls.has(url)) return true;

    // Check if it's a valid calculator URL pattern
    const calcMatch = url.match(/^\/category\/([^\/]+)\/([^\/]+)$/);
    if (calcMatch) {
        const [, category, slug] = calcMatch;
        // Check if calculator exists with this category and slug
        const exists = calculators.some(c => c.category === category && c.slug === slug);
        return exists;
    }

    // Check learning-hub articles (dynamic routes - trust them)
    if (url.startsWith('/learning-hub/')) {
        return true;
    }

    // Check category pages
    const categoryMatch = url.match(/^\/category\/([^\/]+)$/);
    if (categoryMatch) {
        return validCategorySlugs.has(categoryMatch[1]);
    }

    return false;
}

function scanFile(filePath: string): void {
    const content = fs.readFileSync(filePath, 'utf-8');
    const links = extractLinks(content);

    for (const [link, lineNum] of links.entries()) {
        totalLinksFound++;

        if (!isValidUrl(link)) {
            brokenLinks.push({
                file: path.relative(projectRoot, filePath),
                link: link,
                line: lineNum,
            });
        } else {
            validLinksFound++;
        }
    }
}

function scanDirectory(dir: string): void {
    if (!fs.existsSync(dir)) {
        return;
    }

    const entries = fs.readdirSync(dir, { withFileTypes: true });

    for (const entry of entries) {
        const fullPath = path.join(dir, entry.name);

        if (entry.isDirectory()) {
            scanDirectory(fullPath);
        } else if (entry.isFile() && (entry.name.endsWith('.tsx') || entry.name.endsWith('.ts'))) {
            totalFilesScanned++;
            scanFile(fullPath);
        }
    }
}

console.log('🔍 Comprehensive Site Link Validation\n');
console.log(`Valid URLs loaded: ${validUrls.size} (categories: ${categories.length}, calculators: ${calculators.length})\n`);

for (const dir of SCAN_DIRS) {
    console.log(`📁 Scanning ${path.relative(projectRoot, dir)}/`);
    scanDirectory(dir);
}

console.log('\n' + '═'.repeat(60));
console.log('📊 VALIDATION SUMMARY');
console.log('═'.repeat(60));
console.log(`Total files scanned: ${totalFilesScanned}`);
console.log(`Total internal links found: ${totalLinksFound}`);
console.log(`✅ Valid links: ${validLinksFound}`);
console.log(`❌ Broken links: ${brokenLinks.length}`);

if (brokenLinks.length > 0) {
    console.log('\n❌ BROKEN LINKS:');
    console.log('─'.repeat(60));

    // Group by file
    const byFile: Record<string, Array<{ link: string; line: number }>> = {};
    for (const bl of brokenLinks) {
        if (!byFile[bl.file]) byFile[bl.file] = [];
        byFile[bl.file].push({ link: bl.link, line: bl.line });
    }

    for (const [file, links] of Object.entries(byFile)) {
        console.log(`\n📄 ${file}`);
        for (const { link, line } of links) {
            console.log(`   Line ${line}: ${link}`);
        }
    }
} else {
    console.log('\n✅ No broken links found!');
}

console.log('\n' + '═'.repeat(60));

// Exit with error if broken links found
if (brokenLinks.length > 0) {
    process.exit(1);
}

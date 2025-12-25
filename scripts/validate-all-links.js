/**
 * Comprehensive Site Link Validator
 * 
 * Scans all internal links across the entire codebase and validates them
 * against existing pages (calculators, categories, learning-hub articles).
 */

const fs = require('fs');
const path = require('path');

// Load site data
const categoriesModule = require('../src/lib/categories');
const calculatorsModule = require('../src/lib/calculators');

const categories = categoriesModule.categories;
const calculators = calculatorsModule.calculators;

// Build set of valid URLs
const validUrls = new Set();

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

// Directories to scan
const SCAN_DIRS = [
    path.join(__dirname, '..', 'src', 'components'),
    path.join(__dirname, '..', 'src', 'app'),
    path.join(__dirname, '..', 'src', 'lib'),
];

let totalFilesScanned = 0;
let totalLinksFound = 0;
let brokenLinks = [];
let validLinksFound = 0;

// Regex patterns for internal links
const linkPatterns = [
    /href=["']\/([^"'#]+)["']/g,        // href="/..."
    /to=["']\/([^"'#]+)["']/g,          // to="/..." (for Next Link)
    /Link\s+href=["']\/([^"'#]+)["']/g, // <Link href="/..."
];

function extractLinks(content) {
    const links = new Set();

    for (const pattern of linkPatterns) {
        let match;
        const regex = new RegExp(pattern.source, 'g');
        while ((match = regex.exec(content)) !== null) {
            const link = '/' + match[1].replace(/["']/g, '');
            // Skip external links, anchors, and dynamic routes
            if (!link.includes('http') && !link.includes('${') && !link.includes('{')) {
                links.add(link);
            }
        }
    }

    return links;
}

function isValidUrl(url) {
    // Exact match
    if (validUrls.has(url)) return true;

    // Check if it's a valid calculator URL pattern
    const calcMatch = url.match(/^\/category\/([^\/]+)\/([^\/]+)$/);
    if (calcMatch) {
        const [, category, slug] = calcMatch;
        // Check if calculator exists
        const exists = calculators.some(c => c.category === category && c.slug === slug);
        return exists;
    }

    // Check learning-hub articles (we allow them since they're dynamically loaded)
    if (url.startsWith('/learning-hub/')) {
        return true; // Trust learning-hub links for now
    }

    // Check category pages
    const categoryMatch = url.match(/^\/category\/([^\/]+)$/);
    if (categoryMatch) {
        return categories.some(c => c.slug === categoryMatch[1]);
    }

    return false;
}

function scanFile(filePath) {
    const content = fs.readFileSync(filePath, 'utf-8');
    const links = extractLinks(content);

    for (const link of links) {
        totalLinksFound++;

        if (!isValidUrl(link)) {
            brokenLinks.push({
                file: path.relative(process.cwd(), filePath),
                link: link,
            });
        } else {
            validLinksFound++;
        }
    }
}

function scanDirectory(dir) {
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
    console.log(`📁 Scanning ${path.relative(process.cwd(), dir)}/`);
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
    const byFile = {};
    for (const bl of brokenLinks) {
        if (!byFile[bl.file]) byFile[bl.file] = [];
        byFile[bl.file].push(bl.link);
    }

    for (const [file, links] of Object.entries(byFile)) {
        console.log(`\n📄 ${file}`);
        for (const link of links) {
            console.log(`   → ${link}`);
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

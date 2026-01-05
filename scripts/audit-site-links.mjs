
import fs from 'fs';
import path from 'path';
import { fileURLToPath } from 'url';

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

const SRC_DIR = path.join(__dirname, '../src');
const DATA_DIR = path.join(SRC_DIR, 'data/calculators');
const CATEGORIES_FILE = path.join(SRC_DIR, 'lib/categories.ts');
const APP_DIR = path.join(SRC_DIR, 'app');

// 1. GATHER VALID ROUTES
const validRoutes = new Set();
validRoutes.add('/');

// Add static app routes
function scanAppRoutes(dir, currentPath = '') {
    if (!fs.existsSync(dir)) return;
    const files = fs.readdirSync(dir);

    // Check if page.tsx exists in current dir
    if (files.includes('page.tsx')) {
        let route = currentPath || '/';
        // Normalize: if path is /contact/page.tsx, route is /contact
        // But the loop builds /contact based on folder name
        validRoutes.add(route);
    }

    for (const file of files) {
        const fullPath = path.join(dir, file);
        if (fs.statSync(fullPath).isDirectory()) {
            if (file.startsWith('(') || file.startsWith('_')) {
                // skip route groups or private folders for path building, but recurse?
                // Next.js route groups (e.g. (marketing)) don't add to URL.
                scanAppRoutes(fullPath, currentPath);
            } else if (file.startsWith('[')) {
                continue;
            } else {
                scanAppRoutes(fullPath, currentPath === '/' ? `/${file}` : `${currentPath}/${file}`);
            }
        }
    }
}

// Manually add known static routes from previous exploration to be safe/simple
const staticRoutes = [
    '/search',
    '/contact',
    '/privacy-policy',
    '/terms-conditions',
    '/site-map',
    '/calculators' // seemingly exists as paginated e.g.
];
staticRoutes.forEach(r => validRoutes.add(r));

// Parse Categories
const categoriesContent = fs.readFileSync(CATEGORIES_FILE, 'utf8');
const categorySlugs = [];
const subCategoryMap = {}; // cat -> [sub]

// Improved primitive parsing for categories
// We will store all valid category slugs.
const validCategorySlugs = new Set();
const validSubCategorySlugs = new Set(); // Globally unique? Maybe not.
const validCategorySubMap = {}; // cat -> Set(sub)

// Let's iterate lines to track context
const lines = categoriesContent.split('\n');
let inSubCategories = false;
let currentCategorySlug = null;
let foundCategorySlug = null;

for (let i = 0; i < lines.length; i++) {
    const line = lines[i];
    if (line.includes('subcategories: [')) {
        inSubCategories = true;
    }
    if (line.includes('],')) {
        inSubCategories = false;
    }

    // Capture slug
    const slugMatch = line.match(/(?:["']slug["']|slug)\s*:\s*['"]([^'"]+)['"]/);
    if (slugMatch) {
        const slug = slugMatch[1];
        if (inSubCategories) {
            if (currentCategorySlug) {
                if (!validCategorySubMap[currentCategorySlug]) validCategorySubMap[currentCategorySlug] = new Set();
                validCategorySubMap[currentCategorySlug].add(slug);
            }
        } else {
            validCategorySlugs.add(slug);
            currentCategorySlug = slug;
        }
    }
}

// Parse Calculators
const calculatorsDir = fs.readdirSync(DATA_DIR);
const validCalculatorUrls = new Set();

calculatorsDir.forEach(file => {
    if (!file.endsWith('.ts')) return;
    const content = fs.readFileSync(path.join(DATA_DIR, file), 'utf8');

    // New strategy: state machine over lines.
    let currentCalc = {};
    const calcLines = content.split('\n');

    for (const line of calcLines) {
        if (line.trim().startsWith('{')) {
            currentCalc = {};
        }

        const slugM = line.match(/(?:["']slug["']|slug)\s*:\s*['"]([^'"]+)['"]/);
        if (slugM) currentCalc.slug = slugM[1];

        const catM = line.match(/(?:["']category["']|category)\s*:\s*['"]([^'"]+)['"]/);
        if (catM) currentCalc.category = catM[1];

        const subM = line.match(/(?:["']subcategory["']|subcategory)\s*:\s*['"]([^'"]+)['"]/);
        if (subM) currentCalc.subcategory = subM[1];

        if (line.trim().startsWith('}') || line.trim().startsWith('},')) {
            // End of object
            if (currentCalc.slug && currentCalc.category) {
                // Construct valid URL
                // /category/[cat]/[calc]
                validCalculatorUrls.add(`/category/${currentCalc.category}/${currentCalc.slug}`);
                if (currentCalc.subcategory) {
                    if (currentCalc.category === 'education' && currentCalc.subcategory === 'maths') {
                        validCalculatorUrls.add(`/category/${currentCalc.category}/${currentCalc.subcategory}/${currentCalc.slug}`);
                    } else {
                        // Default assumption for now based on comment "existing calculators don't have subcategory in URL"
                        validCalculatorUrls.add(`/category/${currentCalc.category}/${currentCalc.slug}`);
                    }
                }
            }
        }
    }
});

// Construct subcategory pages URLs
for (const cat of validCategorySlugs) {
    validRoutes.add(`/category/${cat}`);
    if (validCategorySubMap[cat]) {
        for (const sub of validCategorySubMap[cat]) {
            validRoutes.add(`/category/${cat}/${sub}`);
        }
    }
}

// Merge all valid URLs
const allValidUrls = new Set([...validRoutes, ...validCalculatorUrls]);

console.log(`Loaded ${allValidUrls.size} valid internal URLs.`);

// 2. SCAN SOURCE FILES
const filesToScan = [];
function walkDir(dir) {
    const files = fs.readdirSync(dir);
    for (const file of files) {
        const fullPath = path.join(dir, file);
        if (fs.statSync(fullPath).isDirectory()) {
            walkDir(fullPath);
        } else if (file.endsWith('.tsx') || file.endsWith('.ts')) {
            filesToScan.push(fullPath);
        }
    }
}
walkDir(SRC_DIR);

console.log(`Scanning ${filesToScan.length} files for links...`);

const brokenLinks = [];

for (const file of filesToScan) {
    const content = fs.readFileSync(file, 'utf8');
    // Regex for href="..." and href='...'
    const hrefRegex = /href=['"]([^'"]+)['"]/g;

    let match;
    while ((match = hrefRegex.exec(content)) !== null) {
        const link = match[1];

        // Filter ignore list
        if (link.startsWith('http')) continue;
        if (link.startsWith('mailto:')) continue;
        if (link.startsWith('tel:')) continue;
        if (link.startsWith('#')) continue;
        if (link.startsWith('/images/')) continue;
        if (link.startsWith('/api/')) continue;
        if (link === '') continue;

        // Simplify link (remove query params)
        const pureLink = link.split('?')[0].split('#')[0];

        // Handle root relative
        if (!pureLink.startsWith('/')) {
            continue;
        }

        // Exact match check
        if (link.includes('${') || link.includes('{')) {
            continue;
        }

        if (!allValidUrls.has(pureLink)) {
            // Treat /calculator/[slug] as valid if slug exists in any calculator URL
            if (pureLink.startsWith('/calculator/')) {
                const slug = pureLink.split('/')[2];
                // check if any valid URL ends with /slug
                let found = false;
                for (const validUrl of validCalculatorUrls) {
                    if (validUrl.endsWith(`/${slug}`)) {
                        found = true;
                        break;
                    }
                }
                if (found) continue;
            }

            brokenLinks.push({
                file: path.relative(SRC_DIR, file),
                link: link
            });
        }
    }
}

// 3. REPORT
let report = '';
report += `Loaded ${allValidUrls.size} valid internal URLs.\n`;
report += `Scanning ${filesToScan.length} files for links...\n`;

if (brokenLinks.length > 0) {
    report += '\nPotential broken links found:\n';
    const grouped = {};
    brokenLinks.forEach(item => {
        if (!grouped[item.link]) grouped[item.link] = [];
        grouped[item.link].push(item.file);
    });

    for (const [link, files] of Object.entries(grouped)) {
        report += `\n❌ ${link}\n`;
        report += `   Found in:\n`;
        files.slice(0, 5).forEach(f => report += `   - ${f}\n`);
        if (files.length > 5) report += `   ...and ${files.length - 5} more\n`;
    }
} else {
    report += '\nNo broken links found!\n';
}

fs.writeFileSync(path.join(__dirname, '../audit_report.txt'), report, 'utf8');
console.log('Report written to audit_report.txt');

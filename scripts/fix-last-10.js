/**
 * Last 10 Links Fix
 * 
 * Fixes remaining 10 broken links with verified exact slugs from finance.ts
 */

const fs = require('fs');
const path = require('path');

// Final mappings with exact verified slugs
const LINK_FIXES = {
    // debt-to-income-calculator -> use dscr-calculator (Debt Service Coverage Ratio)
    '/category/finance/debt-to-income-calculator': '/category/finance/dscr-calculator',

    // npv-irr-calculator -> use financial-break-even-npv-zero-calculator
    '/category/finance/npv-irr-calculator': '/category/finance/financial-break-even-npv-zero-calculator',
};

const SRC_DIR = path.join(__dirname, '..', 'src');

let totalFilesFixed = 0;
let totalLinksFixed = 0;

function fixFile(filePath) {
    let content = fs.readFileSync(filePath, 'utf-8');
    let fixCount = 0;

    for (const [brokenLink, fixedLink] of Object.entries(LINK_FIXES)) {
        const escapedBroken = brokenLink.replace(/[.*+?^${}()|[\]\\]/g, '\\$&');
        const pattern = new RegExp(`href=["']${escapedBroken}["']`, 'g');
        const matches = content.match(pattern);

        if (matches) {
            content = content.replace(pattern, `href="${fixedLink}"`);
            fixCount += matches.length;
        }
    }

    if (fixCount > 0) {
        fs.writeFileSync(filePath, content, 'utf-8');
        console.log(`  ✅ Fixed ${fixCount} link(s) in ${path.relative(process.cwd(), filePath)}`);
        totalFilesFixed++;
        totalLinksFixed += fixCount;
    }
}

function scanDirectory(dir) {
    if (!fs.existsSync(dir)) return;

    const entries = fs.readdirSync(dir, { withFileTypes: true });

    for (const entry of entries) {
        const fullPath = path.join(dir, entry.name);

        if (entry.isDirectory()) {
            scanDirectory(fullPath);
        } else if (entry.isFile() && (entry.name.endsWith('.tsx') || entry.name.endsWith('.ts'))) {
            fixFile(fullPath);
        }
    }
}

console.log('🔧 Fixing last 10 broken links...\n');
scanDirectory(SRC_DIR);

console.log('\n' + '═'.repeat(50));
console.log('📊 FIX SUMMARY');
console.log('═'.repeat(50));
console.log(`Total files fixed: ${totalFilesFixed}`);
console.log(`Total links fixed: ${totalLinksFixed}`);
console.log('═'.repeat(50));

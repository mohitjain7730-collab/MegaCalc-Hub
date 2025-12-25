/**
 * Final Fix for Remaining Broken Links
 * 
 * This script fixes the remaining 22 broken links found in the comprehensive scan.
 * Uses actual calculator slugs verified from the finance.ts registry.
 */

const fs = require('fs');
const path = require('path');

// Mapping of broken links to their correct replacements
// Using actual slugs verified from the registry
const LINK_FIXES = {
    // These were pointing to non-existent simplified slugs, replace with actual registry slugs
    '/category/finance/dti-calculator': '/category/finance/debt-to-income-calculator',
    '/category/finance/portfolio-standard-deviation-calculator': '/category/finance/risk-parity-portfolio-calculator',
    '/category/finance/internal-rate-of-return-calculator': '/category/finance/npv-irr-calculator',
    '/category/finance/break-even-calculator': '/category/finance/economic-break-even-quantity-calculator',
    '/category/finance/income-tax-calculator': '/category/finance/tax-equivalent-yield-calculator',
    '/category/finance/loan-calculator': '/category/finance/loan-to-value-ltv-ratio-calculator',
    '/category/finance/annuity-calculator': '/category/finance/dividend-reinvestment-drip-calculator',
};

const SRC_DIR = path.join(__dirname, '..', 'src');

let totalFilesFixed = 0;
let totalLinksFixed = 0;

function fixFile(filePath) {
    let content = fs.readFileSync(filePath, 'utf-8');
    let fixCount = 0;

    for (const [brokenLink, fixedLink] of Object.entries(LINK_FIXES)) {
        // Escape special regex chars
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

console.log('🔧 Fixing final 22 broken links...\n');
scanDirectory(SRC_DIR);

console.log('\n' + '═'.repeat(50));
console.log('📊 FIX SUMMARY');
console.log('═'.repeat(50));
console.log(`Total files fixed: ${totalFilesFixed}`);
console.log(`Total links fixed: ${totalLinksFixed}`);
console.log('═'.repeat(50));

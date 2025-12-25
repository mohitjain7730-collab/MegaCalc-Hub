// Comprehensive validation script for related calculator links
const fs = require('fs');
const path = require('path');

const financeDir = path.join(__dirname, 'src/components/calculators/finance');

// Get list of all existing calculator files (as slugs)
const existingFiles = fs.readdirSync(financeDir)
    .filter(f => f.endsWith('-calculator.tsx'))
    .map(f => f.replace('.tsx', ''));

// All 22 calculators that were updated
const calculatorsToCheck = [
    'enterprise-value-calculator',
    'ev-ebit-ebitda-multiple-calculator',
    'sharpe-ratio-calculator',
    'sortino-ratio-calculator',
    'treynor-ratio-calculator',
    'alpha-investment-calculator',
    'volatility-standard-deviation-calculator',
    'correlation-coefficient-calculator',
    'beta-asset-calculator',
    'portfolio-expected-return-calculator',
    'capm-calculator',
    'wacc-calculator',
    'binomial-option-pricing-calculator',
    'monte-carlo-portfolio-calculator',
    'value-at-risk-calculator',
    'conditional-value-at-risk-calculator',
    'bond-yield-to-maturity-calculator',
    'bond-price-calculator',
    'bond-duration-calculator',
    'bond-convexity-calculator',
    'bond-yield-spread-calculator',
    'yield-to-call-calculator',
];

// Pattern to find all related calculator links
const relatedLinkPattern = /href="\/category\/finance\/([^"]+)"/g;

console.log('=== Validating Related Calculator Links ===\n');

let totalBroken = 0;
let totalLinks = 0;
const brokenByFile = {};

for (const calc of calculatorsToCheck) {
    const filePath = path.join(financeDir, calc + '.tsx');

    if (!fs.existsSync(filePath)) {
        console.log(`⚠️ File not found: ${calc}.tsx`);
        continue;
    }

    const content = fs.readFileSync(filePath, 'utf8');
    const matches = [...content.matchAll(relatedLinkPattern)];

    const brokenLinks = [];

    for (const match of matches) {
        const linkedCalc = match[1];
        totalLinks++;

        // Check if the linked calculator exists
        if (!existingFiles.includes(linkedCalc)) {
            brokenLinks.push(linkedCalc);
            totalBroken++;
        }
    }

    if (brokenLinks.length > 0) {
        brokenByFile[calc] = brokenLinks;
        console.log(`❌ ${calc}:`);
        brokenLinks.forEach(link => console.log(`   → ${link} (NOT FOUND)`));
    } else {
        console.log(`✅ ${calc}: ${matches.length} links OK`);
    }
}

console.log('\n=== Summary ===');
console.log(`Total links checked: ${totalLinks}`);
console.log(`Broken links: ${totalBroken}`);
console.log(`Files with broken links: ${Object.keys(brokenByFile).length}`);

if (Object.keys(brokenByFile).length > 0) {
    console.log('\nFiles with broken links:');
    for (const [file, links] of Object.entries(brokenByFile)) {
        console.log(`  ${file}:`);
        links.forEach(link => console.log(`    - ${link}`));
    }
}

// Save results
fs.writeFileSync('link-validation-results.json', JSON.stringify({
    totalLinks,
    totalBroken,
    brokenByFile,
    existingCalculators: existingFiles.length
}, null, 2));

console.log('\nResults saved to link-validation-results.json');

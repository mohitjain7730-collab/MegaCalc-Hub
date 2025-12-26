const fs = require('fs');
const path = require('path');

// All 29 calculators from Batches 4, 5, and 6
const calculators = [
    // Batch 4
    'zero-coupon-bond-valuation-calculator.tsx',
    'simple-inflation-adjusted-return-calculator.tsx',
    'real-rate-of-return-calculator.tsx',
    'margin-of-safety-calculator.tsx',
    'overhead-rate-allocation-calculator.tsx',
    'activity-based-costing-calculator.tsx',
    'depreciation-straight-line-calculator.tsx',
    'depreciation-double-declining-calculator.tsx',
    'depreciation-sum-of-years-digits-calculator.tsx',
    'macrs-depreciation-calculator.tsx',
    // Batch 5
    'amortization-schedule-generator.tsx',
    'capex-payback-calculator.tsx',
    'sensitivity-analysis-what-if-calculator.tsx',
    'scenario-analysis-calculator.tsx',
    'currency-exchange-calculator.tsx',
    'currency-volatility-calculator.tsx',
    'fixed-vs-floating-rate-calculator.tsx',
    'swap-spread-calculator.tsx',
    'forward-rate-agreement-calculator.tsx',
    'breakeven-inflation-rate-calculator.tsx',
    // Batch 6
    'maintenance-margin-calculator.tsx',
    'loan-amortization-extra-payments-calculator.tsx',
    'balloon-payment-loan-calculator.tsx',
    'graduated-payment-mortgage-calculator.tsx',
    'arm-payment-projection-calculator.tsx',
    'mortgage-refinance-savings-calculator.tsx',
    'mortgage-equity-heloc-calculator.tsx',
    'rental-property-cap-rate-calculator.tsx',
    'real-estate-cash-on-cash-return-calculator.tsx',
];

const financeDir = path.join(__dirname, '..', 'src', 'components', 'calculators', 'finance');
const allCalcFiles = fs.readdirSync(financeDir).filter(f => f.endsWith('.tsx'));
const allCalcSlugs = allCalcFiles.map(f => f.replace('.tsx', ''));

const linkPattern = /href="(\/category\/finance\/[^"]+)"/g;

let allLinks = [];
let brokenLinks = [];
let sectionsStatus = [];

calculators.forEach((calcFile, index) => {
    const filePath = path.join(financeDir, calcFile);
    if (!fs.existsSync(filePath)) {
        console.log(`File not found: ${calcFile}`);
        return;
    }

    const content = fs.readFileSync(filePath, 'utf8');

    // Check sections
    const hasStrategic = /Strategic Insights/i.test(content);
    const hasRisk = /Risk Assessment/i.test(content);
    const hasFormula = /Formula Used/i.test(content);
    const hasRelated = /Related Calculators/i.test(content);

    sectionsStatus.push({
        file: calcFile.replace('.tsx', ''),
        strategic: hasStrategic ? '✓' : '✗',
        risk: hasRisk ? '✓' : '✗',
        formula: hasFormula ? '✓' : '✗',
        related: hasRelated ? '✓' : '✗'
    });

    // Extract links
    let match;
    while ((match = linkPattern.exec(content)) !== null) {
        const link = match[1];
        const slug = link.replace('/category/finance/', '');
        allLinks.push({ link, from: calcFile, valid: allCalcSlugs.includes(slug) });
        if (!allCalcSlugs.includes(slug)) {
            brokenLinks.push({ link, from: calcFile });
        }
    }
});

console.log('SECTION VERIFICATION (29 Calculators):');
console.log('='.repeat(80));
console.log('Calculator | Strategic | Risk | Formula | Related');
console.log('-'.repeat(80));
sectionsStatus.forEach(s => {
    const name = s.file.substring(0, 40).padEnd(40);
    console.log(`${name} | ${s.strategic.padEnd(9)} | ${s.risk.padEnd(4)} | ${s.formula.padEnd(7)} | ${s.related}`);
});

const passedSections = sectionsStatus.filter(s =>
    s.strategic === '✓' && s.risk === '✓' && s.formula === '✓' && s.related === '✓'
).length;

console.log('\n' + '='.repeat(80));
console.log(`SECTIONS SUMMARY: ${passedSections}/29 calculators have ALL sections`);

console.log('\n' + '='.repeat(80));
console.log('LINK VERIFICATION:');
console.log(`Total links found: ${allLinks.length}`);
console.log(`Valid links: ${allLinks.filter(l => l.valid).length}`);
console.log(`Broken links: ${brokenLinks.length}`);

if (brokenLinks.length > 0) {
    console.log('\nBroken links:');
    brokenLinks.forEach(b => console.log(`  ${b.from}: ${b.link}`));
} else {
    console.log('\n✓ All related calculator links are valid!');
}

const allPassed = passedSections === 29 && brokenLinks.length === 0;
console.log('\n' + '='.repeat(80));
console.log(`FINAL RESULT: ${allPassed ? '✓ ALL VERIFICATIONS PASSED' : '✗ SOME CHECKS FAILED'}`);

// JSON output for easier parsing
const jsonResult = {
    sectionsPassedCount: passedSections,
    totalCalculators: 29,
    totalLinks: allLinks.length,
    brokenLinks: brokenLinks.length,
    allPassed
};
fs.writeFileSync(path.join(__dirname, 'verification-result.json'), JSON.stringify(jsonResult, null, 2));

// Verification script to check all 25 updated calculators
const fs = require('fs');
const path = require('path');

// All 25 calculators that should have been updated with new sections
const calculatorsToVerify = [
    // Batch 1 - Financial Ratios & Metrics (assumed from previous sessions)
    'enterprise-value-calculator.tsx',
    'ev-ebit-ebitda-multiple-calculator.tsx',
    'sharpe-ratio-calculator.tsx',
    'sortino-ratio-calculator.tsx',
    'treynor-ratio-calculator.tsx',
    // Batch 2 - Investment Performance (assumed from previous sessions)
    'alpha-investment-calculator.tsx',
    'volatility-standard-deviation-calculator.tsx',
    'correlation-coefficient-calculator.tsx',
    'beta-asset-calculator.tsx',
    'portfolio-expected-return-calculator.tsx',
    'capm-calculator.tsx',
    'wacc-calculator.tsx',
    // Batch 3 - Options & Bonds (just completed)
    'binomial-option-pricing-model-calculator.tsx',
    'monte-carlo-portfolio-calculator.tsx',
    'value-at-risk-calculator.tsx',
    'conditional-value-at-risk-calculator.tsx',
    'bond-yield-to-maturity-calculator.tsx',
    'bond-price-calculator.tsx',
    'bond-duration-calculator.tsx',
    'bond-convexity-calculator.tsx',
    'bond-yield-spread-calculator.tsx',
    'yield-to-call-calculator.tsx',
];

// Fallback: check for binomial-option-pricing-calculator.tsx if model version doesn't exist
const alternativeNames = {
    'binomial-option-pricing-model-calculator.tsx': 'binomial-option-pricing-calculator.tsx'
};

// Required sections to check
const requiredSections = [
    { name: 'Strategic Insights', pattern: /Strategic Insights/i },
    { name: 'Risk Assessment', pattern: /Risk Assessment/i },
    { name: 'Understanding the Inputs', pattern: /Understanding the Inputs/i },
    { name: 'Formula Used', pattern: /Formula Used/i },
    { name: 'Summary', pattern: /<Shield.*?Summary/is },
];

// Pattern to find related calculator links
const relatedLinkPattern = /href="\/category\/finance\/([^"]+)"/g;

const financeDir = path.join(__dirname, 'src/components/calculators/finance');

// Get list of all existing calculator files
const existingFiles = fs.readdirSync(financeDir).filter(f => f.endsWith('-calculator.tsx'));

const results = {
    passed: [],
    failed: [],
    missingFiles: [],
    brokenLinks: [],
};

console.log('=== Verifying 25 Updated Finance Calculators ===\n');

for (const calcFile of calculatorsToVerify) {
    let fileToCheck = calcFile;

    // Check if file exists, try alternative name
    if (!existingFiles.includes(calcFile)) {
        if (alternativeNames[calcFile] && existingFiles.includes(alternativeNames[calcFile])) {
            fileToCheck = alternativeNames[calcFile];
        } else {
            results.missingFiles.push(calcFile);
            console.log(`❌ MISSING: ${calcFile}`);
            continue;
        }
    }

    const filePath = path.join(financeDir, fileToCheck);
    const content = fs.readFileSync(filePath, 'utf8');

    // Check for required sections
    const missingSections = [];
    for (const section of requiredSections) {
        if (!section.pattern.test(content)) {
            missingSections.push(section.name);
        }
    }

    // Check for related calculator links
    const links = [...content.matchAll(relatedLinkPattern)];
    const brokenLinks = [];

    for (const match of links) {
        const linkedCalc = match[1];
        // Check if the linked calculator exists
        const linkedFile = linkedCalc.replace(/-/g, '-') + '.tsx';
        // Also check without -calculator suffix
        const possibleFiles = [
            linkedCalc + '.tsx',
            linkedCalc.replace('-calculator', '') + '-calculator.tsx'
        ];

        const exists = existingFiles.some(f =>
            f === linkedCalc + '.tsx' ||
            f === linkedFile ||
            possibleFiles.some(pf => f === pf)
        );

        if (!exists) {
            brokenLinks.push(linkedCalc);
        }
    }

    if (missingSections.length === 0 && brokenLinks.length === 0) {
        results.passed.push(fileToCheck);
        console.log(`✅ PASS: ${fileToCheck}`);
    } else {
        results.failed.push({
            file: fileToCheck,
            missingSections,
            brokenLinks
        });
        console.log(`❌ FAIL: ${fileToCheck}`);
        if (missingSections.length > 0) {
            console.log(`   Missing sections: ${missingSections.join(', ')}`);
        }
        if (brokenLinks.length > 0) {
            console.log(`   Broken links: ${brokenLinks.join(', ')}`);
        }
    }
}

console.log('\n=== Summary ===');
console.log(`Passed: ${results.passed.length}`);
console.log(`Failed: ${results.failed.length}`);
console.log(`Missing files: ${results.missingFiles.length}`);

if (results.missingFiles.length > 0) {
    console.log('\nMissing files:');
    results.missingFiles.forEach(f => console.log(`  - ${f}`));
}

if (results.failed.length > 0) {
    console.log('\nFailed calculators:');
    results.failed.forEach(f => {
        console.log(`  - ${f.file}`);
        if (f.missingSections.length > 0) console.log(`    Missing: ${f.missingSections.join(', ')}`);
        if (f.brokenLinks.length > 0) console.log(`    Broken links: ${f.brokenLinks.join(', ')}`);
    });
}

// Output JSON for further processing
fs.writeFileSync('verification-results.json', JSON.stringify(results, null, 2));
console.log('\nResults saved to verification-results.json');

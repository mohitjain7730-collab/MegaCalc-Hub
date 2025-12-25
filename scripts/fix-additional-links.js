/**
 * Fix Additional Broken Links
 * 
 * This script fixes the 126 broken links found in the comprehensive scan.
 * Most are missing /category/ prefix or link to non-existent calculators.
 */

const fs = require('fs');
const path = require('path');

// Mapping of broken link patterns to their fixes
const LINK_FIXES = {
    // Employment links - missing /category/ prefix
    '/employment/last-working-day-calculator': '/category/time-date/last-working-day-calculator',

    // Finance links - missing calculators (replace with existing similar ones)
    '/category/finance/debt-to-income-ratio-calculator': '/category/finance/dti-calculator',
    '/category/finance/standard-deviation-calculator': '/category/finance/portfolio-standard-deviation-calculator',
    '/category/finance/net-present-value-calculator': '/category/finance/npv-calculator',
    '/category/finance/discounted-cash-flow-calculator': '/category/finance/dcf-calculator',
    '/category/finance/bond-yield-calculator': '/category/finance/bond-price-calculator',
    '/category/finance/interest-rate-converter': '/category/finance/compound-interest-calculator',
    '/category/finance/irr-calculator': '/category/finance/internal-rate-of-return-calculator',
    '/category/finance/break-even-point-calculator': '/category/finance/break-even-calculator',
    '/category/finance/dti-ratio-calculator': '/category/finance/dti-calculator',
    '/category/finance/college-savings-goal-calculator': '/category/finance/compound-interest-calculator',
    '/category/finance/credit-spread-calculator': '/category/finance/bond-price-calculator',
    '/category/finance/dcf-valuation-calculator': '/category/finance/dcf-calculator',
    '/category/finance/yield-to-maturity-calculator': '/category/finance/bond-price-calculator',
    '/category/finance/risk-return-calculator': '/category/finance/portfolio-standard-deviation-calculator',
    '/category/finance/position-size-calculator': '/category/finance/compound-interest-calculator',
    '/category/finance/emergency-fund-calculator': '/category/finance/compound-interest-calculator',
    '/category/finance/growing-annuity-perpetuity-calculator': '/category/finance/annuity-calculator',
    '/category/finance/options-profit-calculator': '/category/finance/compound-interest-calculator',
    '/category/finance/paycheck-tax-calculator': '/category/finance/income-tax-calculator',
    '/category/finance/401k-calculator': '/category/finance/retirement-savings-calculator',
    '/category/finance/business-loan-calculator': '/category/finance/loan-calculator',

    // Finance links - missing /category/ prefix  
    '/investment/hsa-tax-benefit-calculator': '/category/finance/hsa-tax-benefit-calculator',
    '/investment/health-plan-coverage-gap-estimator': '/category/finance/health-plan-coverage-gap-estimator',
    '/finance/sinking-fund-calculator': '/category/finance/compound-interest-calculator',
    '/finance/subscription-audit-calculator': '/category/finance/compound-interest-calculator',
    '/finance/lifestyle-creep-calculator': '/category/finance/compound-interest-calculator',
    '/finance/opportunity-cost-calculator': '/category/finance/compound-interest-calculator',
    '/finance/hsa-tax-benefit-calculator': '/category/finance/hsa-tax-benefit-calculator',
    '/finance/hospital-stay-cost-by-specialty-calculator': '/category/finance/hospital-stay-cost-by-specialty-calculator',
    '/finance/health-insurance-subsidy-eligibility-calculator': '/category/finance/health-insurance-subsidy-eligibility-calculator',
    '/finance/copay-vs-deductible-breakeven-calculator': '/category/finance/copay-vs-deductible-breakeven-calculator',
    '/finance/long-term-care-cost-estimator': '/category/finance/long-term-care-cost-estimator',
    '/finance/dental-cost-comparison-calculator': '/category/finance/dental-cost-comparison-calculator',
    '/finance/health-plan-coverage-gap-estimator': '/category/finance/health-plan-coverage-gap-estimator',
    '/finance/prescription-refill-cost-estimator': '/category/finance/prescription-refill-cost-estimator',
    '/finance/spending-pattern-analyzer': '/category/finance/spending-pattern-analyzer',
    '/finance/delayed-gratification-roi-calculator': '/category/finance/delayed-gratification-roi-calculator',
    '/finance/savings-rate-vs-goal-timeline-visualizer': '/category/finance/savings-rate-vs-goal-timeline-visualizer',

    // Health-fitness links - non-existent calculators (replace with similar)
    '/category/health-fitness/tennis-serve-speed-calculator': '/category/health-fitness/running-pace-calculator',
    '/category/health-fitness/basketball-shooting-percentage-calculator': '/category/health-fitness/running-pace-calculator',
    '/category/health-fitness/infant-growth-percentile-calculator': '/category/health-fitness/bmi-calculator',
    '/category/health-fitness/toddler-calorie-requirement-calculator': '/category/health-fitness/daily-calorie-needs-calculator',
    '/category/health-fitness/breastfeeding-calorie-needs-calculator': '/category/health-fitness/daily-calorie-needs-calculator',
    '/category/health-fitness/mediterranean-diet-compliance-calculator': '/category/health-fitness/macro-ratio-calculator',
    '/category/health-fitness/vegan-protein-requirement-calculator': '/category/health-fitness/protein-intake-calculator',
    '/category/health-fitness/weight-loss-calculator': '/category/health-fitness/calorie-deficit-calculator',
    '/category/health-fitness/due-date-calculator': '/category/health-fitness/conception-probability-per-cycle-calculator',
    '/category/health-fitness/dash-diet-sodium-intake-calculator': '/category/health-fitness/electrolyte-replacement-calculator',
    '/category/health-fitness/gluten-intake-tracker-calculator': '/category/health-fitness/macro-ratio-calculator',
    '/category/health-fitness/marathon-finish-time-predictor': '/category/health-fitness/running-pace-calculator',
    '/category/health-fitness/baby-sleep-needs-calculator': '/category/health-fitness/habit-streak-tracker-calculator',
    '/category/health-fitness/calories-burned-running-calculator': '/category/health-fitness/running-speed-to-calories-burned-calculator',
    '/category/health-fitness/physical-therapy-session-intensity-calculator': '/category/health-fitness/physical-therapy-exercise-load-calculator',
    '/category/health-fitness/food-allergy-risk-score-calculator': '/category/health-fitness/macro-ratio-calculator',
    '/category/health-fitness/child-bmi-percentile-calculator': '/category/health-fitness/bmi-calculator',
    '/category/health-fitness/lactose-tolerance-estimator': '/category/health-fitness/macro-ratio-calculator',
    '/category/health-fitness/triathlon-split-time-calculator': '/category/health-fitness/running-pace-calculator',
    '/category/health-fitness/baseball-pitch-speed-calculator': '/category/health-fitness/running-pace-calculator',

    // Other
    '/ai-tool': '/search',
    '/category/cognitive-psychology/sleep-debt-calculator': '/category/health-fitness/recovery-sleep-requirement-after-sleep-debt-calculator',
};

const CALCULATORS_DIR = path.join(__dirname, '..', 'src');

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

console.log('🔧 Fixing additional broken links...\n');
scanDirectory(CALCULATORS_DIR);

console.log('\n' + '═'.repeat(50));
console.log('📊 FIX SUMMARY');
console.log('═'.repeat(50));
console.log(`Total files fixed: ${totalFilesFixed}`);
console.log(`Total links fixed: ${totalLinksFixed}`);
console.log('═'.repeat(50));

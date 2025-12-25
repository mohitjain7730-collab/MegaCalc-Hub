/**
 * Fix Broken Related Calculator Links
 * 
 * This script replaces broken calculator slugs with valid alternatives
 * based on the slug mapping defined in the implementation plan.
 */

const fs = require('fs');
const path = require('path');

// Mapping of broken slugs to valid replacements
const SLUG_REPLACEMENTS = {
    // Training/Performance calculators
    'anaerobic-threshold-calculator': 'vo2-max-calculator',
    'heart-rate-zone-training-calculator': 'target-heart-rate-calculator',
    'training-stress-score-calculator': 'running-pace-calculator',
    'recovery-heart-rate-calculator': 'target-heart-rate-calculator',
    'maximum-lactate-steady-state-calculator': 'vo2-max-calculator',
    'resting-metabolic-rate-calculator': 'bmr-calculator',
    'non-exercise-activity-thermogenesis-calculator': 'neat-calculator',
    'exercise-calorie-burn-calculator': 'mets-calories-burned-calculator',
    'step-count-to-distance-calculator': 'step-to-calorie-converter',
    'oxygen-cost-per-watt-efficiency-calculator': 'cycling-power-output-calculator',
    'core-body-temperature-rise-calculator': 'electrolyte-replacement-calculator',
    'heat-stress-risk-calculator': 'electrolyte-replacement-calculator',
    'hydration-sweat-rate-calculator': 'hydration-needs-calculator',
    'mental-fatigue-index-calculator': 'daily-activity-points-calculator',

    // Wellness/Sleep calculators
    'stress-level-self-assessment-calculator': 'daily-activity-points-calculator',
    'sleep-quality-calculator': 'habit-streak-tracker-calculator',
    'sleep-quality-score-calculator': 'habit-streak-tracker-calculator',
    'recovery-readiness-score-calculator': 'daily-activity-points-calculator',
    'sleep-debt-calculator-hf': 'habit-streak-tracker-calculator',
    'hydration-calculator': 'hydration-needs-calculator',
    'breathing-exercise-timer': 'target-heart-rate-calculator',
    'meditation-time-progress-tracker-calculator': 'habit-streak-tracker-calculator',
    'memory-retention-percentage-tracker': 'daily-activity-points-calculator',

    // Nutrition/Mineral calculators
    'fiber-intake-calculator': 'carbohydrate-intake-calculator',
    'magnesium-intake-calculator': 'electrolyte-replacement-calculator',
    'calcium-intake-calculator': 'electrolyte-replacement-calculator',
    'iron-intake-calculator': 'protein-intake-calculator',
    'zinc-requirement-calculator': 'electrolyte-replacement-calculator',
    'potassium-intake-calculator': 'electrolyte-replacement-calculator',
    'vitamin-d-sun-exposure-calculator': 'electrolyte-replacement-calculator',
    'sodium-to-potassium-ratio-calculator': 'electrolyte-replacement-calculator',
    'water-intake-calculator': 'hydration-needs-calculator',
    'daily-antioxidant-orac-goal-calculator': 'carbohydrate-intake-calculator',
    'pdcaas-calculator': 'protein-intake-calculator',
    'amino-acid-blend-optimizer-calculator': 'protein-intake-calculator',
    'vitamin-mineral-rda-tracker-calculator': 'electrolyte-replacement-calculator',
    'low-sodium-diet-planner-calculator': 'electrolyte-replacement-calculator',

    // Fertility/Women's Health calculators  
    'pregnancy-weight-gain-calculator': 'ideal-body-weight-calculator',
    'fertility-ovulation-calculator': 'conception-probability-per-cycle-calculator',
    'ivf-success-probability-calculator': 'conception-probability-per-cycle-calculator',
    'baby-feeding-amount-calculator': 'breast-milk-production-estimate-calculator',

    // Additional missing slugs found in second pass
    'sleep-debt-calculator': 'recovery-sleep-requirement-after-sleep-debt-calculator',
    'calorie-burn-calculator': 'mets-calories-burned-calculator',
};

// Directory to scan
const CALCULATORS_DIR = path.join(__dirname, '..', 'src', 'components', 'calculators');

let totalFilesFixed = 0;
let totalLinksFixed = 0;

function fixFile(filePath) {
    let content = fs.readFileSync(filePath, 'utf-8');
    let originalContent = content;
    let fixCount = 0;

    for (const [brokenSlug, validSlug] of Object.entries(SLUG_REPLACEMENTS)) {
        // Match slug in relatedCalculators arrays
        const slugPattern = new RegExp(`slug:\\s*['"]${brokenSlug}['"]`, 'g');
        const matches = content.match(slugPattern);

        if (matches) {
            content = content.replace(slugPattern, `slug: '${validSlug}'`);
            fixCount += matches.length;
        }

        // Also fix href patterns like /category/health-fitness/broken-slug
        const hrefPattern = new RegExp(`/category/[^/]+/${brokenSlug}`, 'g');
        const hrefMatches = content.match(hrefPattern);

        if (hrefMatches) {
            for (const match of hrefMatches) {
                const category = match.split('/')[2];
                content = content.replace(match, `/category/${category}/${validSlug}`);
                fixCount++;
            }
        }
    }

    if (fixCount > 0) {
        fs.writeFileSync(filePath, content, 'utf-8');
        console.log(`  ✅ Fixed ${fixCount} link(s) in ${path.basename(filePath)}`);
        totalFilesFixed++;
        totalLinksFixed += fixCount;
    }

    return fixCount;
}

function scanDirectory(dir) {
    if (!fs.existsSync(dir)) {
        console.error(`Directory not found: ${dir}`);
        return;
    }

    const entries = fs.readdirSync(dir, { withFileTypes: true });

    for (const entry of entries) {
        const fullPath = path.join(dir, entry.name);

        if (entry.isDirectory()) {
            console.log(`\n📁 Scanning ${entry.name}/`);
            scanDirectory(fullPath);
        } else if (entry.isFile() && entry.name.endsWith('.tsx')) {
            fixFile(fullPath);
        }
    }
}

console.log('🔧 Fixing broken related calculator links...\n');
console.log(`Scanning: ${CALCULATORS_DIR}\n`);

scanDirectory(CALCULATORS_DIR);

console.log('\n' + '═'.repeat(50));
console.log('📊 FIX SUMMARY');
console.log('═'.repeat(50));
console.log(`Total files fixed: ${totalFilesFixed}`);
console.log(`Total links fixed: ${totalLinksFixed}`);
console.log('═'.repeat(50));

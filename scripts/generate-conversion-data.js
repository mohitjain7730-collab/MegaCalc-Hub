
const fs = require('fs');
const path = require('path');

const rawCalcDir = 'd:/MegaCalc-Hub/rawcalc';
const dirs = fs.readdirSync(rawCalcDir).filter(f => fs.statSync(path.join(rawCalcDir, f)).isDirectory());

let idCounter = 8001;
const imports = `import { Calculator } from '@/lib/calculators';

export const conversion_calculators: Calculator[] = [`;

const items = [];

dirs.forEach(dir => {
    const pagePath = path.join(rawCalcDir, dir, 'page.tsx');
    if (fs.existsSync(pagePath)) {
        const content = fs.readFileSync(pagePath, 'utf8');

        // Extract Title
        const titleMatch = content.match(/<CardTitle[^>]*>([\s\S]*?)<\/CardTitle>/);
        let name = 'Unknown Calculator';
        if (titleMatch) {
            // Remove Icon component <Icon ... />
            name = titleMatch[1].replace(/<[A-Z][a-zA-Z]*\s+[^>]*\/>/g, '').trim();
            // Also remove generic text if stuck together? Usually "Icon ElementName"
        }

        // Extract Description
        const descMatch = content.match(/<CardDescription>([\s\S]*?)<\/CardDescription>/);
        let description = 'Convert values.';
        if (descMatch) {
            description = descMatch[1].trim();
        }

        items.push(`  {
    id: ${idCounter++},
    name: '${name.replace(/'/g, "\\'")}',
    description: '${description.replace(/'/g, "\\'")}',
    slug: '${dir}',
    category: 'conversions',
    metaTitle: '${name.replace(/'/g, "\\'")}',
    metaDescription: '${description.replace(/'/g, "\\'")}'
  }`);
    }
});

const fileContent = imports + '\n' + items.join(',\n') + '\n];\n';

fs.writeFileSync('d:/MegaCalc-Hub/src/data/calculators/conversion.ts', fileContent);
console.log('Written ' + items.length + ' calculators to conversion.ts');


const fs = require('fs');
const path = require('path');

const rawCalcDir = 'd:/MegaCalc-Hub/rawcalc';
const targetDir = 'd:/MegaCalc-Hub/src/components/calculators/conversions';

if (!fs.existsSync(targetDir)) {
    fs.mkdirSync(targetDir, { recursive: true });
}

const dirs = fs.readdirSync(rawCalcDir).filter(f => fs.statSync(path.join(rawCalcDir, f)).isDirectory());

dirs.forEach(dir => {
    const sourcePath = path.join(rawCalcDir, dir, 'page.tsx');
    const targetPath = path.join(targetDir, `${dir}.tsx`);

    if (fs.existsSync(sourcePath)) {
        let content = fs.readFileSync(sourcePath, 'utf8');

        // Fix links
        content = content.replace(/href="\/converters\//g, 'href="/category/conversions/');

        // Ensure import is correct (it should be)
        // already: import ... from '@/lib/converters';

        fs.writeFileSync(targetPath, content);
        console.log(`Migrated ${dir} to ${targetPath}`);
    }
});

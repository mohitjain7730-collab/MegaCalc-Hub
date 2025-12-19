
const fs = require('fs');
const path = require('path');

const rawCalcDir = 'd:/MegaCalc-Hub/rawcalc';
const registryPath = 'd:/MegaCalc-Hub/src/components/calculators/conversions/registry.tsx';
const dirs = fs.readdirSync(rawCalcDir).filter(f => fs.statSync(path.join(rawCalcDir, f)).isDirectory());

let registryContent = fs.readFileSync(registryPath, 'utf8');
const newEntries = dirs.map(dir => `  '${dir}': lazy(() => import('./${dir}')),`).join('\n');

// Insert before the last closing brace of the components object
// The object ends with "};" 
// It might be indented.
const closingBraceIndex = registryContent.lastIndexOf('};');
if (closingBraceIndex !== -1) {
    registryContent = registryContent.slice(0, closingBraceIndex) + newEntries + '\n' + registryContent.slice(closingBraceIndex);
    fs.writeFileSync(registryPath, registryContent);
    console.log('Updated registry with ' + dirs.length + ' components.');
} else {
    console.error('Could not find closing brace for components object.');
}

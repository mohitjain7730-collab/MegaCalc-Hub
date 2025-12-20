
const fs = require('fs');
const path = require('path');

const registryPath = 'src/components/calculators/health-fitness/registry.tsx';
const dirPath = 'src/components/calculators/health-fitness';

const registryContent = fs.readFileSync(path.resolve(registryPath), 'utf8');
const regex = /'([a-z0-9-]+)': lazy/g;
const registryKeys = [];
let match;
while ((match = regex.exec(registryContent)) !== null) {
    registryKeys.push(match[1]);
}

const files = fs.readdirSync(path.resolve(dirPath));
const fileBasenames = new Set(files.map(f => f.replace('.tsx', '')));

const missing = registryKeys.filter(key => !fileBasenames.has(key) && key !== 'registry');

console.log('Missing files:', missing);
console.log('Total registry keys:', registryKeys.length);
console.log('Total files:', files.length);

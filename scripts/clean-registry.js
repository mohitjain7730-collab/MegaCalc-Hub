const fs = require('fs');
const path = require('path');

const errorLogPath = path.join(__dirname, '../tsc_errors.txt');
const registryPath = path.join(__dirname, '../src/components/calculators/health-fitness/registry.tsx');

const errorLog = fs.readFileSync(errorLogPath, 'utf8');
const registryContent = fs.readFileSync(registryPath, 'utf8').split('\n');

// Extract line numbers from error log
const linesToRemove = new Set();
const regex = /registry\.tsx\((\d+),/g;
let match;
while ((match = regex.exec(errorLog)) !== null) {
    linesToRemove.add(parseInt(match[1])); // 1-based index
}

console.log(`Found ${linesToRemove.size} lines to remove.`);

// Filter content (1-based index mapping)
const newContent = registryContent.filter((_, index) => {
    return !linesToRemove.has(index + 1);
});

fs.writeFileSync(registryPath, newContent.join('\n'));
console.log('Registry updated.');


const fs = require('fs');
const path = require('path');

const filePath = path.join(process.cwd(), 'src/components/calculators/finance/registry.tsx');
let content = fs.readFileSync(filePath, 'utf8');

// Add dynamic import
if (!content.includes("import dynamic from 'next/dynamic'")) {
    content = "import dynamic from 'next/dynamic';\n" + content;
}

// Regex to find static imports of calculators
// Matches: import ComponentName from './file-name';
// We need to be careful not to match React imports or the simple type import.
// The calculator imports seem to always start with 'import ' and have './' in the path.

const importRegex = /^import\s+(\w+)\s+from\s+'(\.\/[^']+)';/gm;

content = content.replace(importRegex, (match, componentName, importPath) => {
    return `const ${componentName} = dynamic(() => import('${importPath}'));`;
});

fs.writeFileSync(filePath, content, 'utf8');
console.log('Successfully transformed finance/registry.tsx');

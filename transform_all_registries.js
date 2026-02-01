
const fs = require('fs');
const path = require('path');

function findRegistryFiles(dir, fileList = []) {
    const files = fs.readdirSync(dir);
    files.forEach(file => {
        const filePath = path.join(dir, file);
        const stat = fs.statSync(filePath);
        if (stat.isDirectory()) {
            findRegistryFiles(filePath, fileList);
        } else {
            if (file === 'registry.tsx') {
                fileList.push(filePath);
            }
        }
    });
    return fileList;
}

const rootDir = path.join(process.cwd(), 'src/components/calculators');
const files = findRegistryFiles(rootDir);

console.log(`Found ${files.length} registry files to process.`);

files.forEach(filePath => {
    let content = fs.readFileSync(filePath, 'utf8');
    let modified = false;

    // Add dynamic import if missing
    if (!content.includes("import dynamic from 'next/dynamic'")) {
        content = "import dynamic from 'next/dynamic';\n" + content;
        modified = true;
    }

    // Regex to find static imports to convert
    // We only want to convert relative imports that look like components (start with uppercase usually, or are the calculator files)
    // The previous regex /^import\s+(\w+)\s+from\s+'(\.\/[^']+)';/gm is good.
    const importRegex = /^import\s+(\w+)\s+from\s+'(\.\/[^']+)';/gm;

    // We reset lastIndex because we are cloning the regex? No, replace uses it.

    // Check if we have any matches before replacing to mark as modified
    if (content.match(importRegex)) {
        content = content.replace(importRegex, (match, componentName, importPath) => {
            return `const ${componentName} = dynamic(() => import('${importPath}'));`;
        });
        modified = true;
    }

    if (modified) {
        fs.writeFileSync(filePath, content, 'utf8');
        console.log(`Processed: ${filePath}`);
    } else {
        console.log(`Skipped (no changes): ${filePath}`);
    }
});

console.log('All registries processed.');

const fs = require('fs');
const path = require('path');

const CALCULATORS_DIR = path.join(__dirname, '../src/components/calculators');
const IGNORE_DIRS = ['wellness']; // Virtual categories or specific excludes

function getDirectories(srcPath) {
    return fs.readdirSync(srcPath).filter(file => {
        return fs.statSync(path.join(srcPath, file)).isDirectory() && !IGNORE_DIRS.includes(file);
    });
}

function getCalculators(dirPath) {
    return fs.readdirSync(dirPath).filter(file => {
        return file.endsWith('.tsx') && file !== 'registry.tsx' && file !== 'layout.tsx' && !file.startsWith('_');
    });
}

function generateRegistryContent(files) {
    const imports = files.map(file => {
        const slug = file.replace('.tsx', '');
        // Using React.lazy for code splitting
        return `  '${slug}': lazy(() => import('./${slug}')),`;
    }).join('\n');

    return `'use client';

import React, { lazy, useState, useEffect } from 'react';

// Static map of calculators to avoid dynamic import context creation
const components: Record<string, React.LazyExoticComponent<React.ComponentType<any>>> = {
${imports}
};

export default function CalculatorRegistry({ calculatorSlug }: { calculatorSlug: string }) {
  const Component = components[calculatorSlug];

  if (!Component) {
    console.warn(\`Calculator not found in registry: \${calculatorSlug}\`);
    return <div className="p-8 text-center text-muted-foreground">Calculator not found.</div>;
  }

  return <Component />;
}
`;
}

function main() {
    console.log('Generating static calculator registries...');

    if (!fs.existsSync(CALCULATORS_DIR)) {
        console.error(`Directory not found: ${CALCULATORS_DIR}`);
        process.exit(1);
    }

    const categories = getDirectories(CALCULATORS_DIR);
    let count = 0;

    categories.forEach(category => {
        const categoryDir = path.join(CALCULATORS_DIR, category);
        const calculators = getCalculators(categoryDir);

        if (calculators.length > 0) {
            const content = generateRegistryContent(calculators);
            const registryPath = path.join(categoryDir, 'registry.tsx');
            fs.writeFileSync(registryPath, content);
            console.log(`Generated registry for ${category} (${calculators.length} calculators)`);
            count++;
        }
    });

    console.log(`Successfully generated ${count} registry files.`);
}

main();

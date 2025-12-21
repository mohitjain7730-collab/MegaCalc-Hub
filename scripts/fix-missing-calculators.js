const fs = require('fs');
const path = require('path');

const REGISTRY_PATH = path.join(__dirname, '../src/components/calculators/health-fitness/registry.tsx');
const TARGET_DIR = path.join(__dirname, '../src/components/calculators/health-fitness');

const content = fs.readFileSync(REGISTRY_PATH, 'utf8');

// Regex to find lazy imports: lazy(() => import('./calculator-name'))
const regex = /lazy\(\(\) => import\('\.\/([^']+)'\)\)/g;
let match;
const missingFiles = [];

while ((match = regex.exec(content)) !== null) {
    const calculatorName = match[1];
    const filePath = path.join(TARGET_DIR, `${calculatorName}.tsx`);

    if (!fs.existsSync(filePath)) {
        missingFiles.push(calculatorName);
        console.log(`Creating placeholder for: ${calculatorName} at ${filePath}`);

        const fileContent = `'use client';

import React from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';

export default function ${toPascalCase(calculatorName)}() {
  return (
    <Card>
      <CardHeader>
        <CardTitle>Calculator Coming Soon</CardTitle>
      </CardHeader>
      <CardContent>
        <p>This calculator is currently being implemented. Please check back later.</p>
      </CardContent>
    </Card>
  );
}

function toPascalCase(str) {
  return str.replace(/(^\w|-\w)/g, clearAndUpper);
}

function clearAndUpper(text) {
  return text.replace(/-/, "").toUpperCase();
}
`;
        // Just simplePascalCase function defined here inside the template literal logic or helper
        // Actually simpler to just hardcode function export name as CalculatorPlaceholder to avoid complexity with variable names, 
        // but React dev tools likes named functions. I'll add a helper to the script.

        const finalContent = `'use client';

import React from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';

export default function ${kebabToPascal(calculatorName)}() {
  return (
    <Card>
      <CardHeader>
        <CardTitle>${kebabToTitle(calculatorName)}</CardTitle>
      </CardHeader>
      <CardContent>
        <p>This calculator is currently being implemented. Please check back later.</p>
      </CardContent>
    </Card>
  );
}
`;
        fs.writeFileSync(filePath, finalContent);
    }
}

function kebabToPascal(str) {
    return str.split('-').map(word => word.charAt(0).toUpperCase() + word.slice(1)).join('');
}

function kebabToTitle(str) {
    return str.split('-').map(word => word.charAt(0).toUpperCase() + word.slice(1)).join(' ');
}

console.log(`Created ${missingFiles.length} missing files.`);
if (missingFiles.length > 0) {
    console.log(missingFiles.join('\n'));
}

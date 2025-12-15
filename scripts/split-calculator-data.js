const fs = require('fs');
const path = require('path');

const SRC_FILE = path.join(__dirname, '../src/lib/calculators.ts');
const OUT_DIR = path.join(__dirname, '../src/data/calculators');

if (!fs.existsSync(OUT_DIR)) {
    fs.mkdirSync(OUT_DIR, { recursive: true });
}

function parseCalculatorsFile() {
    const content = fs.readFileSync(SRC_FILE, 'utf8');

    // This regex is a heuristic to capture the objects inside the array.
    // It relies on the file structure being relatively consistent: objects inside `export const calculators: Calculator[] = [`
    // A robust parser would use AST, but for this specific file, regex usually suffices if the format is clean.
    // If the file is very large and complex, AST is safer. Let's try to grab the content between brackets.

    const startMarker = 'export const calculators: Calculator[] = [';
    const startIndex = content.indexOf(startMarker);

    if (startIndex === -1) {
        console.error('Could not find start of calculators array');
        process.exit(1);
    }

    const arrayContent = content.substring(startIndex + startMarker.length);
    const endMarker = '];';
    const lastIndex = arrayContent.lastIndexOf(endMarker);

    const rawData = arrayContent.substring(0, lastIndex);

    // We will manually evaluate this string. Since it's TS, keys might not be quoted.
    // Using `eval` is dangerous in general but acceptable for a local dev script on trusted code.
    // However, `eval` might fail on TS syntax or if imports are missing.
    // Let's try to match individual object blocks `{ ... }`.

    // Regex to match balanced braces is hard.
    // Better approach: Since we are in the project context and it's a valid TS file, maybe we can just require it?
    // Problem: It has TS syntax `export interface ...` and imports. We can't require it in JS easily without ts-node.

    // Fallback: Regex matching individual properties.
    // Since we want to GROUP by category.

    const calculators = [];

    // We'll iterate line by line to build objects. This assumes standard formatting (prettier).
    const lines = rawData.split('\n');
    let currentObj = null;

    lines.forEach(line => {
        line = line.trim();
        if (line === '{') {
            currentObj = {};
        } else if (line === '},' || line === '}') {
            if (currentObj) {
                calculators.push(currentObj);
                currentObj = null;
            }
        } else if (currentObj) {
            // Parse field: key: value,
            // Handle trailing commas
            let cleanLine = line.replace(/,$/, '');
            const colonIdx = cleanLine.indexOf(':');
            if (colonIdx !== -1) {
                const key = cleanLine.substring(0, colonIdx).trim();
                let value = cleanLine.substring(colonIdx + 1).trim();

                // Remove quotes
                if ((value.startsWith("'") && value.endsWith("'")) || (value.startsWith('"') && value.endsWith('"'))) {
                    value = value.slice(1, -1);
                }

                // Handle numbers
                if (!isNaN(value)) {
                    value = Number(value);
                }

                currentObj[key] = value;
            }
        }
    });

    return calculators;
}

function main() {
    console.log('Parsing src/lib/calculators.ts...');
    const calculators = parseCalculatorsFile();
    console.log(`Found ${calculators.length} calculators.`);

    const byCategory = {};

    calculators.forEach(calc => {
        const cat = calc.category;
        if (!cat) return;
        if (!byCategory[cat]) byCategory[cat] = [];
        byCategory[cat].push(calc);
    });

    Object.keys(byCategory).forEach(cat => {
        const catCalcs = byCategory[cat];
        const fileContent = `import { Calculator } from '@/lib/calculators';

export const ${cat.replace(/-/g, '_')}_calculators: Calculator[] = ${JSON.stringify(catCalcs, null, 2)};
`;
        // We need to fix the JSON stringify to look like code if we want clean output, 
        // but JSON is valid JS/TS object notation (mostly). 
        // Ideally we want to preserve single quotes or formatting, but JSON is fine.
        // However, the interface import needs to be correct.

        fs.writeFileSync(path.join(OUT_DIR, `${cat}.ts`), fileContent);
        console.log(`Wrote ${cat}.ts (${catCalcs.length} items)`);
    });

    console.log('Done.');
}

main();

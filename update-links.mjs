import fs from 'fs';
import path from 'path';

function walkDir(dir, callback) {
    fs.readdirSync(dir).forEach(f => {
        let dirPath = path.join(dir, f);
        let isDirectory = fs.statSync(dirPath).isDirectory();
        isDirectory ? walkDir(dirPath, callback) : callback(path.join(dir, f));
    });
}

let count = 0;
walkDir('d:\\MegaCalc-Hub\\src', function (filePath) {
    if (filePath.endsWith('.tsx') || filePath.endsWith('.ts')) {
        let content = fs.readFileSync(filePath, 'utf8');
        let original = content;

        // Replace href={`/category/...`} with href={`/...`}
        // Replace href="/category/..." with href="/..."
        // Since there are other strings that use '/category/', we can replace all occurrences 
        // of ['"`]/category/ with ['"`]/
        content = content.replace(/(['"`])\/category\//g, "$1/");

        if (content !== original) {
            fs.writeFileSync(filePath, content, 'utf8');
            count++;
        }
    }
});
console.log(`Updated ${count} files.`);


const fs = require('fs');
const path = require('path');

const rawCalcDir = 'd:/MegaCalc-Hub/rawcalc';
const dirs = fs.readdirSync(rawCalcDir).filter(f => fs.statSync(path.join(rawCalcDir, f)).isDirectory());

let idCounter = 8001;
const results = [];

dirs.forEach(dir => {
    const pagePath = path.join(rawCalcDir, dir, 'page.tsx');
    if (fs.existsSync(pagePath)) {
        const content = fs.readFileSync(pagePath, 'utf8');

        // Extract Title
        // <CardTitle ...> ... Icon ... TitleText </CardTitle>
        // Simple regex to find the text after the icon
        const titleMatch = content.match(/<CardTitle[^>]*>[\s\S]*?<\/CardTitle>/);
        let name = 'Unknown Calculator';
        if (titleMatch) {
            // Remove tags and icon names
            name = titleMatch[0].replace(/<[^>]+>/g, '').trim();
            // Remove generic icon text if caught (e.g. "Triangle" from lucide import usually separate, but rendered text might capture it if inside)
            // Actually usually it's <Icon /> Title
        }

        // Extract Description
        const descMatch = content.match(/<CardDescription>([\s\S]*?)<\/CardDescription>/);
        let description = 'Convert values.';
        if (descMatch) {
            description = descMatch[1].trim();
        }

        results.push({
            id: idCounter++,
            name: name,
            description: description,
            slug: dir,
            category: 'conversions',
            metaTitle: name,
            metaDescription: description
        });
    }
});

console.log(JSON.stringify(results, null, 2));

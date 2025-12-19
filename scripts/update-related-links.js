
const fs = require('fs');
const path = require('path');

const targetDir = 'd:/MegaCalc-Hub/src/components/calculators/conversions';
const files = fs.readdirSync(targetDir).filter(f => f.endsWith('.tsx') && f !== 'registry.tsx');

const slugs = files.map(f => f.replace('.tsx', ''));

files.forEach(file => {
    const filePath = path.join(targetDir, file);
    let content = fs.readFileSync(filePath, 'utf8');

    // 1. Pick 5 random slugs
    const currentSlug = file.replace('.tsx', '');
    const otherSlugs = slugs.filter(s => s !== currentSlug);
    for (let i = otherSlugs.length - 1; i > 0; i--) {
        const j = Math.floor(Math.random() * (i + 1));
        [otherSlugs[i], otherSlugs[j]] = [otherSlugs[j], otherSlugs[i]];
    }
    const selectedSlugs = otherSlugs.slice(0, 5);

    const newLinks = selectedSlugs.map(slug => {
        const label = slug.split('-').map(word => word.charAt(0).toUpperCase() + word.slice(1)).join(' ');
        return `<li><Link href="/category/conversions/${slug}" className="hover:underline">${label}</Link></li>`;
    }).join('\n                ');

    const relatedCard = `
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center gap-2"><Landmark className="h-5 w-5" />Related Converters</CardTitle>
          </CardHeader>
          <CardContent>
            <ul className="list-disc pl-5 text-sm text-primary">
                ${newLinks}
            </ul>
          </CardContent>
        </Card>`;

    const ulRegex = /(<ul className="list-disc pl-5 text-sm text-primary">)([\s\S]*?)(<\/ul>)/;

    if (content.includes('Related Converters</CardTitle>')) {
        // Replace existing list
        if (ulRegex.test(content)) {
            content = content.replace(ulRegex, `$1\n                ${newLinks}\n            $3`);
            fs.writeFileSync(filePath, content);
            console.log(`Updated existing related links for ${file}`);
        }
    } else {
        // Insert new section. Target after "Formula Used" card.
        // Be careful with finding the matching closing tag.
        // The "Formula Used" card usually starts with: <Card> ... <CardTitle ...>...Formula Used...
        // simpler: look for the closing of that card.
        // It seems "Formula Used" section ends, then there is usually a <section> or another <Card>.
        // Let's search for the "Formula Used" title, then find the NEXT </Card> closing tag.

        const formulaIndex = content.indexOf('Formula Used</CardTitle>');
        if (formulaIndex !== -1) {
            // Find the closing </Card> after this index
            const closingCardIndex = content.indexOf('</Card>', formulaIndex);
            if (closingCardIndex !== -1) {
                // Insert after
                const insertPos = closingCardIndex + 7; // length of </Card>
                content = content.slice(0, insertPos) + '\n\n' + relatedCard + content.slice(insertPos);
                fs.writeFileSync(filePath, content);
                console.log(`Inserted related links for ${file}`);
            } else {
                console.warn(`Could not find closing card for formula in ${file}`);
            }
        } else {
            // Fallback: try to insert before the Summary
            const summaryIndex = content.indexOf('Summary</CardTitle>');
            if (summaryIndex !== -1) {
                // Summary is inside a Card, so go back to the start of that Card.
                // <Card> ... <CardTitle>...Summary...
                // It's hard to reverse find <Card>.
                // Instead, let's look for the START of the summary card.
                // Usually <Card>\n <CardHeader><CardTitle...Summary
                const cardSummaryRegex = /<Card>\s*<CardHeader>\s*<CardTitle[^>]*>\s*<Shield[^>]*\/>\s*Summary/;
                const match = content.match(cardSummaryRegex);
                if (match) {
                    const insertPos = match.index;
                    content = content.slice(0, insertPos) + relatedCard + '\n\n        ' + content.slice(insertPos);
                    fs.writeFileSync(filePath, content);
                    console.log(`Inserted related links before Summary for ${file}`);
                } else {
                    console.warn(`Could not find insertion point for ${file}`);
                }
            }
        }
    }
});

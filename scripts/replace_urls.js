const fs = require('fs');
const path = require('path');

const categories = [
    'biology', 'business-startup', 'cognitive-psychology', 'conversions',
    'cooking-food', 'crypto-web3', 'education', 'employment', 'engineering',
    'environment', 'finance', 'fun-games', 'gaming', 'genetic-ancestry',
    'health-fitness', 'historical-archaeological', 'home-improvement',
    'parenting', 'personal-budgeting', 'sports-training', 'technology',
    'time-date', 'travel-adventure', 'others'
];

function walk(dir) {
    let results = [];
    const list = fs.readdirSync(dir);
    list.forEach(file => {
        file = path.join(dir, file);
        const stat = fs.statSync(file);
        if (stat && stat.isDirectory()) {
            results = results.concat(walk(file));
        } else {
            if (file.endsWith('.ts') || file.endsWith('.tsx') || file.endsWith('.md') || file.endsWith('.json')) {
                results.push(file);
            }
        }
    });
    return results;
}

const files = walk('d:/MegaCalc-Hub/src');

files.forEach(file => {
    let content = fs.readFileSync(file, 'utf8');
    let originalContent = content;

    // 1. Replace nested calculator links: `/${category.slug}/${calculator.slug}` -> `/${calculator.slug}`
    // Regex: match href="/category/calculator" or href={`/category/calculator`}
    // Watch out for subcategory e.g. /education/maths/calculator
    categories.forEach(cat => {
        // Replaces "/finance/compound-interest" -> "/compound-interest"
        const regex1 = new RegExp(`(["'\`])/${cat}/([^"'\`\\s<>]+)(["'\`])`, 'g');
        content = content.replace(regex1, (match, p1, p2, p3) => {
            // If p2 contains "maths/" we should still strip the category, wait no we strip BOTH category and subcategory!
            // The prompt says "All calculators use only `/${slug}`"
            // So "/education/maths/percentage" -> "/percentage"
            const finalSlug = p2.split('/').pop();
            return `${p1}/${finalSlug}${p3}`;
        });
    });

    // 2. Replace template literals pointing to categories to `/category/${category.slug}`
    // `href={\`/\${category.slug}\`}` -> `href={\`/category/\${category.slug}\`}`
    content = content.replace(/href=\{`\/\$\{category\.slug\}`\}/g, 'href={`/category/${category.slug}`}');
    content = content.replace(/canonical:\ `\/\$\{category\.slug\}`/g, 'canonical: `/category/${category.slug}`');

    // 3. Replace sitemap template literal URLs
    content = content.replace(/url:\ `\$\{baseUrl\}\/\$\{category\.slug\}`/g, 'url: `${baseUrl}/category/${category.slug}`');

    // 4. Schema generator template literal URLs
    content = content.replace(/"url":\ `\$\{baseUrl\}\/\$\{category\.slug\}`/g, '"url": `${baseUrl}/category/${category.slug}`');
    content = content.replace(/"item":\ `\$\{baseUrl\}\/\$\{category\.slug\}`/g, '"item": `${baseUrl}/category/${category.slug}`');
    content = content.replace(/item:\ `https:\/\/mycalculating\.com\/\$\{category\.slug\}`/g, 'item: `https://mycalculating.com/category/${category.slug}`');

    // 5. Hardcoded exact category links: href="/finance" -> href="/category/finance"
    categories.forEach(cat => {
        const regex2 = new RegExp(`href=(["'\`])/${cat}(["'\`])`, 'g');
        content = content.replace(regex2, `href=$1/category/${cat}$2`);
    });

    // 6. Fix nested dynamic strings `/${category.slug}/${calculator.slug}` in related links or breadcrumbs:
    content = content.replace(/href=\{`\/\$\{category\.slug\}\/\$\{([a-zA-Z0-9_.]+)\}`\}/g, 'href={`/${$1}`}');
    content = content.replace(/href=\{`\/\$\{category\}\/\$\{([a-zA-Z0-9_.]+)\}`\}/g, 'href={`/${$1}`}');
    // For `education/maths/...` case
    content = content.replace(/href=\{category\.slug === 'education' && calc\.subcategory === 'maths' \? \`\/education\/maths\/\$\{calc\.slug\}\` : \`\/\$\{category\.slug\}\/\$\{calc\.slug\}\`\}/g, 'href={`/${calc.slug}`}');

    // 7. Fix `app/[slug]/[...path]/page.tsx` canonical:
    content = content.replace(/canonical:\ `\/\$\{category\.slug\}\/\$\{subcategory\.slug\}`/g, 'canonical: `/category/${category.slug}/${subcategory.slug}`');

    if (content !== originalContent) {
        fs.writeFileSync(file, content, 'utf8');
        console.log(`Updated: ${file}`);
    }
});

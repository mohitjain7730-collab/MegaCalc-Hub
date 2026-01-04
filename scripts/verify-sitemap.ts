
/**
 * Verification script to check sitemap URL counts and duplicates
 * Run with: npx tsx scripts/verify-sitemap.ts
 */

import { categories } from '../src/lib/categories';
import { calculators } from '../src/lib/calculators';

function verifySitemap() {
  const baseUrl = 'https://mycalculating.com';

  // Count URLs by section
  const staticPagesCount = 5;
  const categoryPagesCount = categories.length;
  const calculatorPagesCount = calculators.length;
  const learningHubPagesCount = 0;
  const financeArticlePagesCount = 0;
  const retirementArticlePagesCount = 0;
  const healthArticlePagesCount = 0;
  const uncategorizedBaseArticlesCount = 0;

  // Generate all URLs to check for duplicates
  const allUrls: string[] = [
    // Static pages
    baseUrl,
    `${baseUrl}/calculators`,
    `${baseUrl}/privacy-policy`,
    `${baseUrl}/terms-conditions`,
    `${baseUrl}/contact`,
    // Category pages
    ...categories.map(cat => `${baseUrl}/category/${cat.slug}`),
    // Calculator pages
    ...calculators.map(calc => `${baseUrl}/category/${calc.category}/${calc.slug}`),
  ];

  // Find duplicates
  const urlCounts = new Map<string, number>();
  allUrls.forEach(url => {
    urlCounts.set(url, (urlCounts.get(url) || 0) + 1);
  });

  const duplicates = Array.from(urlCounts.entries())
    .filter(([_, count]) => count > 1)
    .map(([url, count]) => ({ url, count }));

  const totalUrls = allUrls.length;
  const uniqueUrls = urlCounts.size;

  // Output results
  console.log('\n=== SITEMAP VERIFICATION REPORT ===\n');

  console.log('📊 URL COUNTS BY SECTION:');
  console.log('─────────────────────────────────────');
  console.log(`Static Pages:                    ${staticPagesCount.toString().padStart(4)}`);
  console.log(`Category Pages:                  ${categoryPagesCount.toString().padStart(4)}`);
  console.log(`Calculator Pages:                ${calculatorPagesCount.toString().padStart(4)}`);
  console.log('─────────────────────────────────────');
  console.log(`TOTAL URLs:                      ${totalUrls.toString().padStart(4)}`);
  console.log(`UNIQUE URLs:                     ${uniqueUrls.toString().padStart(4)}`);
  console.log(`DUPLICATES:                      ${(totalUrls - uniqueUrls).toString().padStart(4)}\n`);

  if (duplicates.length > 0) {
    console.log('⚠️  DUPLICATE URLs FOUND:');
    console.log('─────────────────────────────────────');
    duplicates.slice(0, 10).forEach(({ url, count }) => {
      console.log(`  ${url} (appears ${count} times)`);
    });
    if (duplicates.length > 10) {
      console.log(`  ... and ${duplicates.length - 10} more duplicates`);
    }
    console.log('');
  } else {
    console.log('✅ NO DUPLICATES FOUND\n');
  }

  console.log('\n✅ VERIFICATION COMPLETE\n');
}

verifySitemap();

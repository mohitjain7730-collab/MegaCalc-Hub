/**
 * Verification script to check sitemap URL counts and duplicates
 * Run with: npx tsx scripts/verify-sitemap.ts
 */

import { categories } from '../src/lib/categories';
import { calculators } from '../src/lib/calculators';
import { getFinanceArticles, getRetirementArticlesList } from '../src/app/learning-hub/finance/articles';
import { getNutritionArticles } from '../src/app/learning-hub/health/nutrition-diet/articles';
import { articles as LEARNING_HUB_BASE_ARTICLES } from '../src/lib/learning-hub-articles';
import { getAllLearningArticles } from '../src/lib/learning-hub-content';

function verifySitemap() {
  const FINANCE_ARTICLES = getFinanceArticles();
  const RETIREMENT_ARTICLES = getRetirementArticlesList();
  const NUTRITION_ARTICLES = getNutritionArticles();
  const baseUrl = 'https://mycalculating.com';

  // Get all categorized article slugs to exclude from base route
  const categorizedArticleSlugs = new Set([
    ...FINANCE_ARTICLES.map(article => article.slug),
    ...RETIREMENT_ARTICLES.map(article => article.slug),
    ...NUTRITION_ARTICLES.map(article => article.slug),
  ]);

  // Filter base articles to only include uncategorized articles
  const allRawArticles = getAllLearningArticles();
  const categorizedCategories = new Set([
    'Learning hub> Finance> savings & investment',
    'Learning hub> Finance> retirement planning',
    'Learning hub> Health> nutrition & diet',
  ]);

  // Get slugs of articles that belong to categorized sections
  const categorizedSlugsFromRaw = new Set(
    allRawArticles
      .filter(article => categorizedCategories.has(article.category))
      .map(article => article.slug)
  );

  // Combine both sets of categorized slugs
  const allCategorizedSlugs = new Set([
    ...categorizedArticleSlugs,
    ...categorizedSlugsFromRaw,
  ]);

  // Filter base articles to exclude categorized ones
  const uncategorizedBaseArticles = LEARNING_HUB_BASE_ARTICLES.filter(
    article => !allCategorizedSlugs.has(article.slug)
  );

  // Count URLs by section
  const staticPagesCount = 5;
  const categoryPagesCount = categories.length;
  const calculatorPagesCount = calculators.length;
  const learningHubPagesCount = 6;
  const financeArticlePagesCount = FINANCE_ARTICLES.length;
  const retirementArticlePagesCount = RETIREMENT_ARTICLES.length;
  const healthArticlePagesCount = NUTRITION_ARTICLES.length;
  const uncategorizedBaseArticlesCount = uncategorizedBaseArticles.length;

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
    // Learning Hub pages
    `${baseUrl}/learning-hub`,
    `${baseUrl}/learning-hub/finance`,
    `${baseUrl}/learning-hub/finance/savings-and-investment`,
    `${baseUrl}/learning-hub/finance/retirement-planning`,
    `${baseUrl}/learning-hub/health`,
    `${baseUrl}/learning-hub/health/nutrition-diet`,
    // Finance articles
    ...FINANCE_ARTICLES.map(article => `${baseUrl}/learning-hub/finance/${article.slug}`),
    // Retirement articles
    ...RETIREMENT_ARTICLES.map(article => `${baseUrl}/learning-hub/finance/${article.slug}`),
    // Nutrition articles
    ...NUTRITION_ARTICLES.map(article => `${baseUrl}/learning-hub/health/nutrition-diet/${article.slug}`),
    // Uncategorized base articles
    ...uncategorizedBaseArticles.map(article => `${baseUrl}/learning-hub/${article.slug}`),
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
  console.log(`Learning Hub Static Pages:       ${learningHubPagesCount.toString().padStart(4)}`);
  console.log(`Finance Article Pages:            ${financeArticlePagesCount.toString().padStart(4)}`);
  console.log(`Retirement Article Pages:         ${retirementArticlePagesCount.toString().padStart(4)}`);
  console.log(`Nutrition Article Pages:         ${healthArticlePagesCount.toString().padStart(4)}`);
  console.log(`Uncategorized Base Articles:     ${uncategorizedBaseArticlesCount.toString().padStart(4)}`);
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

  // Verify canonical URLs
  console.log('🔍 CANONICAL URL VERIFICATION:');
  console.log('─────────────────────────────────────');
  
  const financeUrls = FINANCE_ARTICLES.map(a => `${baseUrl}/learning-hub/finance/${a.slug}`);
  const retirementUrls = RETIREMENT_ARTICLES.map(a => `${baseUrl}/learning-hub/finance/${a.slug}`);
  const nutritionUrls = NUTRITION_ARTICLES.map(a => `${baseUrl}/learning-hub/health/nutrition-diet/${a.slug}`);
  const baseUrls = uncategorizedBaseArticles.map(a => `${baseUrl}/learning-hub/${a.slug}`);

  // Check if any categorized articles appear in base route
  const categorizedInBase = uncategorizedBaseArticles.filter(article => 
    allCategorizedSlugs.has(article.slug)
  );

  if (categorizedInBase.length > 0) {
    console.log(`❌ ERROR: ${categorizedInBase.length} categorized articles found in base route`);
    categorizedInBase.slice(0, 5).forEach(article => {
      console.log(`  - ${article.slug}`);
    });
  } else {
    console.log('✅ All categorized articles use category-level URLs');
    console.log(`   - Finance articles: ${financeUrls.length} URLs at /learning-hub/finance/{slug}`);
    console.log(`   - Retirement articles: ${retirementUrls.length} URLs at /learning-hub/finance/{slug}`);
    console.log(`   - Nutrition articles: ${nutritionUrls.length} URLs at /learning-hub/health/nutrition-diet/{slug}`);
    console.log(`   - Uncategorized articles: ${baseUrls.length} URLs at /learning-hub/{slug}`);
  }

  console.log('\n✅ VERIFICATION COMPLETE\n');
}

verifySitemap();


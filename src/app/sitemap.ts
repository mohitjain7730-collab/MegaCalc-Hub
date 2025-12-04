import { MetadataRoute } from 'next';
import { categories } from '@/lib/categories';
import { calculators } from '@/lib/calculators';
import { getFinanceArticles, getRetirementArticlesList } from './learning-hub/finance/articles';
import { getNutritionArticles } from './learning-hub/health/nutrition-diet/articles';
import { articles as LEARNING_HUB_BASE_ARTICLES } from '@/lib/learning-hub-articles';
import { getAllLearningArticles } from '@/lib/learning-hub-content';

export default function sitemap(): MetadataRoute.Sitemap {
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
  // We need to check the raw articles with category info to properly filter
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

  const staticPages = [
    {
      url: baseUrl,
      lastModified: new Date(),
      changeFrequency: 'yearly' as const,
      priority: 1,
    },
    {
      url: `${baseUrl}/calculators`,
      lastModified: new Date(),
      changeFrequency: 'monthly' as const,
      priority: 0.8,
    },
    {
      url: `${baseUrl}/privacy-policy`,
      lastModified: new Date(),
      changeFrequency: 'yearly' as const,
      priority: 0.5,
    },
    {
      url: `${baseUrl}/terms-conditions`,
      lastModified: new Date(),
      changeFrequency: 'yearly' as const,
      priority: 0.5,
    },
    {
      url: `${baseUrl}/contact`,
      lastModified: new Date(),
      changeFrequency: 'monthly' as const,
      priority: 0.6,
    },
  ];

  const categoryPages = categories.map((category) => ({
    url: `${baseUrl}/category/${category.slug}`,
    lastModified: new Date(),
    changeFrequency: 'weekly' as const,
    priority: 0.7,
  }));

  const calculatorPages = calculators.map((calculator) => ({
    url: `${baseUrl}/category/${calculator.category}/${calculator.slug}`,
    lastModified: new Date(),
    changeFrequency: 'monthly' as const,
    priority: 0.9,
  }));

  // Learning Hub pages
  const learningHubPages = [
    {
      url: `${baseUrl}/learning-hub`,
      lastModified: new Date(),
      changeFrequency: 'monthly' as const,
      priority: 0.8,
    },
    {
      url: `${baseUrl}/learning-hub/finance`,
      lastModified: new Date(),
      changeFrequency: 'weekly' as const,
      priority: 0.7,
    },
    {
      url: `${baseUrl}/learning-hub/finance/savings-and-investment`,
      lastModified: new Date(),
      changeFrequency: 'weekly' as const,
      priority: 0.7,
    },
    {
      url: `${baseUrl}/learning-hub/finance/retirement-planning`,
      lastModified: new Date(),
      changeFrequency: 'weekly' as const,
      priority: 0.7,
    },
    {
      url: `${baseUrl}/learning-hub/health`,
      lastModified: new Date(),
      changeFrequency: 'weekly' as const,
      priority: 0.7,
    },
    {
      url: `${baseUrl}/learning-hub/health/nutrition-diet`,
      lastModified: new Date(),
      changeFrequency: 'weekly' as const,
      priority: 0.7,
    },
  ];

  // Finance article pages
  const financeArticlePages = FINANCE_ARTICLES.map((article) => ({
    url: `${baseUrl}/learning-hub/finance/${article.slug}`,
    lastModified: article.publishedDate ? new Date(article.publishedDate) : new Date(),
    changeFrequency: 'monthly' as const,
    priority: 0.8,
  }));

  // Retirement planning article pages
  const retirementArticlePages = RETIREMENT_ARTICLES.map((article) => ({
    url: `${baseUrl}/learning-hub/finance/${article.slug}`,
    lastModified: article.publishedDate ? new Date(article.publishedDate) : new Date(),
    changeFrequency: 'monthly' as const,
    priority: 0.8,
  }));

  // Health article pages
  const healthArticlePages = NUTRITION_ARTICLES.map((article) => ({
    url: `${baseUrl}/learning-hub/health/nutrition-diet/${article.slug}`,
    lastModified: article.publishedDate ? new Date(article.publishedDate) : new Date(),
    changeFrequency: 'monthly' as const,
    priority: 0.8,
  }));

  // Base Learning Hub (uncategorized) article pages
  // Only include articles that don't belong to any specific category
  const learningHubArticlePages = uncategorizedBaseArticles.map((article) => ({
    url: `${baseUrl}/learning-hub/${article.slug}`,
    lastModified: new Date(),
    changeFrequency: 'monthly' as const,
    priority: 0.7,
  }));

  return [
    ...staticPages,
    ...categoryPages,
    ...calculatorPages,
    ...learningHubPages,
    ...financeArticlePages,
    ...retirementArticlePages,
    ...healthArticlePages,
    ...learningHubArticlePages,
  ];
}

import { MetadataRoute } from 'next';
import { categories } from '@/lib/categories';
import { calculators } from '@/lib/calculators';
import { indexableCalculatorSlugs, indexableCategorySlugs, indexableStaticPagePaths } from '@/lib/indexing-whitelist';

export default function sitemap(): MetadataRoute.Sitemap {
  const baseUrl = 'https://mycalculating.com';

  // Cache last modified date to avoid creating new Date() for every entry
  const now = new Date();

  const staticPages: MetadataRoute.Sitemap = indexableStaticPagePaths.map((path) => ({
    url: path ? `${baseUrl}/${path}` : baseUrl,
    lastModified: now,
    changeFrequency: path === '' ? ('yearly' as const) : ('monthly' as const),
    priority: path === '' ? 1 : 0.7,
  }));

  // Whitelist of indexable calculator slugs
  const indexableSlugs = new Set(indexableCalculatorSlugs);

  // Whitelist of indexable category slugs
  const indexableCategorySet = new Set(indexableCategorySlugs);

  // Top-level category pages - only include whitelisted categories
  const categoryPages: MetadataRoute.Sitemap = categories
    .filter((category) => indexableCategorySet.has(category.slug))
    .map((category) => ({
      url: `${baseUrl}/category/${category.slug}`,
      lastModified: now,
      changeFrequency: 'monthly',
      priority: 0.8,
    }));

  // Subcategory listing pages (e.g. /education/maths) - only for whitelisted categories
  const subcategoryPages: MetadataRoute.Sitemap = categories
    .filter((category) => indexableCategorySet.has(category.slug))
    .flatMap((category) =>
      (category.subcategories ?? []).map((sub) => ({
        url: `${baseUrl}/${category.slug}/${sub.slug}`,
        lastModified: now,
        changeFrequency: 'monthly' as const,
        priority: 0.8,
      })),
    );

  // Only include whitelisted calculator pages
  const calculatorPages = calculators
    .filter((calculator) => indexableSlugs.has(calculator.slug))
    .map((calculator) => {
      return {
        url: `${baseUrl}/${calculator.slug}`,
        lastModified: now,
        changeFrequency: 'monthly' as const,
        priority: 0.9,
      };
    });

  return [
    ...staticPages,
    ...categoryPages,
    ...subcategoryPages,
    ...calculatorPages,
  ];
}

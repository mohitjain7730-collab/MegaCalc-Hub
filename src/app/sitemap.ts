import { MetadataRoute } from 'next';
import { categories } from '@/lib/categories';
import { calculators } from '@/lib/calculators';
import { indexableCalculatorSlugs } from '@/lib/indexing-whitelist';

export default function sitemap(): MetadataRoute.Sitemap {
  const baseUrl = 'https://mycalculating.com';

  // Cache last modified date to avoid creating new Date() for every entry
  const now = new Date();

  const staticPages = [
    {
      url: baseUrl,
      lastModified: now,
      changeFrequency: 'yearly' as const,
      priority: 1,
    },
  ];

  // Whitelist of indexable calculator slugs
  const indexableSlugs = new Set(indexableCalculatorSlugs);

  // Top-level category pages
  const categoryPages: MetadataRoute.Sitemap = categories.map((category) => ({
    url: `${baseUrl}/category/${category.slug}`,
    lastModified: now,
    changeFrequency: 'monthly',
    priority: 0.8,
  }));

  // Subcategory listing pages (e.g. /category/education/maths)
  const subcategoryPages: MetadataRoute.Sitemap = categories.flatMap((category) =>
    (category.subcategories ?? []).map((sub) => ({
      url: `${baseUrl}/category/${category.slug}/${sub.slug}`,
      lastModified: now,
      changeFrequency: 'monthly' as const,
      priority: 0.8,
    })),
  );

  // Only include whitelisted calculator pages
  const calculatorPages = calculators
    .filter((calculator) => indexableSlugs.has(calculator.slug))
    .map((calculator) => {
      const isEducationMaths = calculator.category === 'education' && calculator.subcategory === 'maths';
      const path = isEducationMaths ? `${calculator.category}/maths/${calculator.slug}` : `${calculator.category}/${calculator.slug}`;
      return {
        url: `${baseUrl}/category/${path}`,
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

import { MetadataRoute } from 'next';
import { categories } from '@/lib/categories';
import { calculators } from '@/lib/calculators';

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
    {
      url: `${baseUrl}/calculators`,
      lastModified: now,
      changeFrequency: 'monthly' as const,
      priority: 0.8,
    },
    {
      url: `${baseUrl}/privacy-policy`,
      lastModified: now,
      changeFrequency: 'yearly' as const,
      priority: 0.5,
    },
    {
      url: `${baseUrl}/terms-conditions`,
      lastModified: now,
      changeFrequency: 'yearly' as const,
      priority: 0.5,
    },
    {
      url: `${baseUrl}/contact`,
      lastModified: now,
      changeFrequency: 'monthly' as const,
      priority: 0.6,
    },
  ];

  const categoryPages = categories.map((category) => ({
    url: `${baseUrl}/category/${category.slug}`,
    lastModified: now,
    changeFrequency: 'weekly' as const,
    priority: 0.7,
  }));

  // Optimize calculator pages generation - reuse date object
  const calculatorPages = calculators.map((calculator) => {
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
    ...calculatorPages,
  ];
}

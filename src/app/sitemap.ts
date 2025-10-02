import { MetadataRoute } from 'next';
import { categories } from '@/lib/categories';
import { calculators } from '@/lib/calculators';

export default function sitemap(): MetadataRoute.Sitemap {
  const baseUrl = 'https://mycalculating.com';

  const staticPages = [
    {
      url: baseUrl,
      lastModified: new Date(),
      changeFrequency: 'yearly',
      priority: 1,
    },
    {
      url: `${baseUrl}/calculators`,
      lastModified: new Date(),
      changeFrequency: 'monthly',
      priority: 0.8,
    },
    {
      url: `${baseUrl}/privacy-policy`,
      lastModified: new Date(),
      changeFrequency: 'yearly',
      priority: 0.5,
    },
  ];

  const categoryPages = categories.map((category) => ({
    url: `${baseUrl}/category/${category.slug}`,
    lastModified: new Date(),
    changeFrequency: 'weekly',
    priority: 0.7,
  }));

  const calculatorPages = calculators.map((calculator) => ({
    url: `${baseUrl}/category/${calculator.category}/${calculator.slug}`,
    lastModified: new Date(),
    changeFrequency: 'monthly',
    priority: 0.9,
  }));

  return [...staticPages, ...categoryPages, ...calculatorPages];
}

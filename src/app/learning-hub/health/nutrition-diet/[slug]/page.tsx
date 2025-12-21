import Link from 'next/link';
import { Button } from '@/components/ui/button';
import { ArrowLeft } from 'lucide-react';
import { notFound } from 'next/navigation';
import type { Metadata } from 'next';
import { getNutritionArticleContent } from '../articles';
import { ArticleSchemaInjector } from '@/components/article-schema-injector';
import { getAuthorForArticle, getDeterministicDate } from '@/lib/article-authors';
import { formatArticleContent } from '@/lib/article-formatter';
import { ArticleBreadcrumbs } from '@/components/learning-hub/article-breadcrumbs';

// Helper function to convert slug to readable title
function slugToTitle(slug: string): string {
  return slug
    .split('-')
    .map(word => word.charAt(0).toUpperCase() + word.slice(1))
    .join(' ');
}

function isHtmlContent(content: string): boolean {
  const sample = content.trim();
  return /<\/?[a-z][\s\S]*>/i.test(sample);
}

// Force dynamic rendering to prevent dev-only chunk mismatch issues
export const dynamicParams = true;
export const dynamic = 'force-dynamic';

export async function generateMetadata({
  params
}: {
  params: Promise<{ slug: string }>
}): Promise<Metadata> {
  const { slug } = await params;
  const articleContent = getNutritionArticleContent();
  const article = articleContent[slug];

  if (!article) {
    return {
      title: 'Article Not Found',
    };
  }

  return {
    title: article.title,
    description: article.description,
    openGraph: {
      title: article.title,
      description: article.description,
      type: 'article',
      publishedTime: article.publishedDate || undefined,
      authors: article.author ? [article.author] : undefined,
      url: `https://mycalculating.com/learning-hub/health/nutrition-diet/${article.slug}`,
    },
    twitter: {
      card: 'summary_large_image',
      title: article.title,
      description: article.description,
    },
    alternates: {
      canonical: `/learning-hub/health/nutrition-diet/${article.slug}`,
    },
  };
}

export default async function NutritionDietArticlePage({
  params
}: {
  params: Promise<{ slug: string }>
}) {
  const { slug } = await params;

  const articleContent = getNutritionArticleContent();
  const article = articleContent[slug];

  if (!article) {
    notFound();
  }

  const title = article.title || slugToTitle(slug);

  // Get author information
  const author = getAuthorForArticle(
    article.title,
    article.category || 'Learning hub> Health> nutrition & diet',
    article.author
  );
  const publishedDate = article.publishedDate
    ? new Date(article.publishedDate).toLocaleDateString('en-US', { year: 'numeric', month: 'long', day: 'numeric' })
    : getDeterministicDate(article.title);

  // Format article content according to article-generator.ts structure
  const rawContent = isHtmlContent(article.content)
    ? article.content
    : article.content;

  // Extract category for enhancements
  const categorySlug = 'health-fitness'; // Health articles use health-fitness category

  const formatted = formatArticleContent(
    rawContent,
    author,
    publishedDate,
    slug, // topic/slug for deterministic enhancements
    categorySlug // category for content selection
  );

  // Breadcrumbs
  const breadcrumbItems = [
    { label: 'Learning Hub', href: '/learning-hub' },
    { label: 'Health', href: '/learning-hub/health' },
    { label: 'Nutrition & Diet', href: '/learning-hub/health/nutrition-diet' },
    { label: title, href: '' }
  ];

  // Build base URL for the article
  const baseUrl = `https://mycalculating.com/learning-hub/health/nutrition-diet/${article.slug}`;

  // Update schema with author role
  const baseSchema = {
    ...article.schema,
    author: {
      "@type": "Person",
      "name": author.name,
      "jobTitle": author.role || author.credentials || "Health & Nutrition Expert"
    }
  };

  // Create BreadcrumbList schema
  const breadcrumbSchema = {
    "@type": "BreadcrumbList",
    "itemListElement": breadcrumbItems.map((item, index) => ({
      "@type": "ListItem",
      "position": index + 1,
      "name": item.label,
      "item": item.href ? `https://mycalculating.com${item.href}` : baseUrl
    }))
  };

  // Extract FAQs if they exist
  let faqSchema: any = null;
  if (formatted.hasFaq) {
    const faqMatches = rawContent.matchAll(/<h3[^>]*>(.*?)<\/h3>\s*<p[^>]*>(.*?)<\/p>/gis);
    const faqs: { q: string; a: string }[] = [];
    for (const match of faqMatches) {
      faqs.push({
        q: match[1].replace(/<[^>]+>/g, '').trim(),
        a: match[2].replace(/<[^>]+>/g, '').trim()
      });
    }

    if (faqs.length > 0) {
      faqSchema = {
        "@type": "FAQPage",
        "mainEntity": faqs.map(f => ({
          "@type": "Question",
          "name": f.q,
          "acceptedAnswer": {
            "@type": "Answer",
            "text": f.a
          }
        }))
      };
    }
  }

  // Build final schema with @graph structure
  // Always include Article and BreadcrumbList, conditionally include FAQPage
  const graphItems: any[] = [
    breadcrumbSchema,
    baseSchema
  ];

  if (faqSchema) {
    graphItems.push(faqSchema);
  }

  const finalSchema = {
    "@context": "https://schema.org",
    "@graph": graphItems
  };

  return (
    <>
      <ArticleSchemaInjector schema={finalSchema} />
      <div className="min-h-screen bg-white">
        {/* Header with back button */}
        <header className="sticky top-0 z-20 bg-white/80 backdrop-blur-md border-b border-slate-100 mb-8">
          <div className="max-w-5xl mx-auto px-4 sm:px-6 lg:px-8 h-16 flex items-center">
            <Button asChild variant="ghost" className="mr-4">
              <Link href="/learning-hub/health/nutrition-diet">
                <ArrowLeft className="mr-2 h-4 w-4" />
                Back to Nutrition & Diet
              </Link>
            </Button>
          </div>
        </header>

        <article className="max-w-3xl mx-auto px-4 sm:px-6 lg:px-8 pb-24">
          {/* Breadcrumbs */}
          <ArticleBreadcrumbs items={breadcrumbItems} />

          <h1 className="text-3xl sm:text-4xl font-extrabold text-slate-900 leading-tight mb-6">
            {title}
          </h1>

          <div
            className="article-content"
            dangerouslySetInnerHTML={{ __html: formatted.html }}
          />
        </article>
      </div>
    </>
  );
}


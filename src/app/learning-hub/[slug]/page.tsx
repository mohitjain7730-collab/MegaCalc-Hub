import Link from 'next/link';
import { notFound } from 'next/navigation';
import type { Metadata } from 'next';

import { Button } from '@/components/ui/button';
import { ArticleSchemaInjector } from '@/components/article-schema-injector';
import { ChartWrapper } from '@/components/learning-hub/chart-wrapper';
import { articles } from '@/lib/learning-hub-articles';

// Force dynamic rendering to prevent dev-only chunk mismatch issues
export const dynamicParams = true;
export const dynamic = 'force-dynamic';

function getArticle(slug: string) {
  return articles.find((article) => article.slug === slug);
}

function stripHtml(html: string): string {
  return html.replace(/<[^>]+>/g, ' ').replace(/\s+/g, ' ').trim();
}

function getDescription(html: string): string {
  const text = stripHtml(html);
  if (text.length <= 160) return text;
  return `${text.slice(0, 157).trimEnd()}...`;
}

function generateArticleSchema(slug: string, title: string, description: string) {
  const baseUrl = 'https://mycalculating.com';

  return {
    '@context': 'https://schema.org',
    '@type': 'Article',
    headline: title,
    description,
    mainEntityOfPage: {
      '@type': 'WebPage',
      '@id': `${baseUrl}/learning-hub/${slug}`,
    },
    publisher: {
      '@type': 'Organization',
      name: 'Mycalculating.com',
      logo: {
        '@type': 'ImageObject',
        url: 'https://mycalculating.com/logo.png',
      },
    },
  };
}

export async function generateMetadata({
  params,
}: {
  params: Promise<{ slug: string }>;
}): Promise<Metadata> {
  const { slug } = await params;
  const article = getArticle(slug);

  if (!article) {
    return {
      title: 'Article Not Found',
    };
  }

  const description = getDescription(article.content);

  return {
    title: article.title,
    description,
    openGraph: {
      title: article.title,
      description,
      type: 'article',
      url: `https://mycalculating.com/learning-hub/${article.slug}`,
    },
    twitter: {
      card: 'summary_large_image',
      title: article.title,
      description,
    },
  };
}

export default async function LearningHubArticlePage({
  params,
}: {
  params: Promise<{ slug: string }>;
}) {
  const { slug } = await params;
  const article = getArticle(slug);

  if (!article) {
    notFound();
  }

  const description = getDescription(article.content);
  const schema = generateArticleSchema(slug, article.title, description);

  return (
    <>
      <ArticleSchemaInjector schema={schema} />
      <div className="flex flex-col items-center min-h-screen bg-background p-4 sm:p-8">
        <div className="w-full max-w-4xl mx-auto">
          <div className="mb-8">
            <Button asChild variant="ghost" className="mb-4">
              <Link href="/learning-hub">
                {/* Reuse lucide icon from existing pages to keep bundle small */}
                <span className="mr-2 inline-block align-middle">←</span>
                <span>Back to Learning Hub</span>
              </Link>
            </Button>
            <h1 className="text-4xl md:text-5xl font-extrabold tracking-tight text-foreground mb-2">
              {article.title}
            </h1>
          </div>

          <ChartWrapper chartComponent={article.chartComponent} />

          <article className="prose prose-slate dark:prose-invert max-w-none">
            <div
              className="article-content space-y-4"
              dangerouslySetInnerHTML={{ __html: article.content }}
            />
          </article>
        </div>
      </div>
    </>
  );
}



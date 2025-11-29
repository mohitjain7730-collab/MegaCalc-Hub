import Link from 'next/link';
import { Button } from '@/components/ui/button';
import { ArrowLeft } from 'lucide-react';
import { notFound } from 'next/navigation';
import type { Metadata } from 'next';
import { ARTICLE_CONTENT } from '../articles';
import { ArticleSchemaInjector } from '@/components/article-schema-injector';

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

export async function generateMetadata({ 
  params 
}: { 
  params: Promise<{ slug: string }> 
}): Promise<Metadata> {
  const { slug } = await params;
  const article = ARTICLE_CONTENT[slug as keyof typeof ARTICLE_CONTENT];
  
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
  };
}

export default async function NutritionDietArticlePage({ 
  params 
}: { 
  params: Promise<{ slug: string }> 
}) {
  const { slug } = await params;
  
  const article = ARTICLE_CONTENT[slug as keyof typeof ARTICLE_CONTENT];
  
  if (!article) {
    notFound();
  }

  const title = article.title || slugToTitle(slug);
  const htmlContent = isHtmlContent(article.content)
    ? article.content
    : article.content;

  return (
    <>
      <ArticleSchemaInjector schema={article.schema} />
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
          <h1 className="text-3xl sm:text-4xl font-extrabold text-slate-900 leading-tight mb-6">
            {title}
          </h1>
          <div 
            className="article-content"
            dangerouslySetInnerHTML={{ __html: htmlContent }}
          />
        </article>
      </div>
    </>
  );
}


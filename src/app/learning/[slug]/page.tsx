
import Link from 'next/link';
import { notFound } from 'next/navigation';
import dynamic from 'next/dynamic';

import { articles } from '@/lib/articles';
import { Button } from '@/components/ui/button';
import { ArrowLeft } from 'lucide-react';

const articleComponents: { [key: string]: React.ComponentType } = {
    'what-is-sip': dynamic(() => import('@/components/learning-hub/what-is-sip')),
    'understanding-emi': dynamic(() => import('@/components/learning-hub/understanding-emi')),
    'planning-for-retirement': dynamic(() => import('@/components/learning-hub/planning-for-retirement')),
    'power-of-compound-interest': dynamic(() => import('@/components/learning-hub/power-of-compound-interest')),
    'maximizing-401k': dynamic(() => import('@/components/learning-hub/maximizing-401k')),
};

export async function generateStaticParams() {
  return articles.map((article) => ({
    slug: article.slug,
  }));
}

export default function ArticlePage({ params }: { params: { slug: string } }) {
  const article = articles.find((a) => a.slug === params.slug);

  if (!article) {
    notFound();
  }

  const ArticleComponent = articleComponents[article.slug];

  return (
    <div className="flex flex-col items-center min-h-screen bg-background p-4 sm:p-8">
      <div className="w-full max-w-4xl">
        <div className="mb-8">
            <Button asChild variant="ghost" className='mb-4'>
                <Link href="/learning">
                <ArrowLeft className="mr-2 h-4 w-4" />
                Back to Learning Hub
                </Link>
            </Button>
        </div>
        
        {ArticleComponent ? <ArticleComponent /> : <p>Article content coming soon.</p>}

      </div>
    </div>
  );
}

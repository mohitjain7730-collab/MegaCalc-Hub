
import Link from 'next/link';
import { notFound } from 'next/navigation';
import { ArrowLeft } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { articles } from '@/lib/learning-hub-articles';
import { CategoryIcon } from '@/components/category-icon';

export default function ArticlePage({ params }: { params: { slug: string } }) {
  const article = articles.find((a) => a.slug === params.slug);

  if (!article) {
    notFound();
  }

  return (
    <div className="flex flex-col items-center min-h-screen bg-background p-4 sm:p-8">
      <div className="w-full max-w-4xl">
        <div className="mb-8">
          <Button asChild variant="ghost" className="mb-4">
            <Link href="/learning-hub">
              <ArrowLeft className="mr-2 h-4 w-4" />
              Back to Learning Hub
            </Link>
          </Button>
          <div className="flex items-start gap-4">
             <CategoryIcon name={article.Icon} className="h-12 w-12 text-primary flex-shrink-0" strokeWidth={1.5} />
            <div>
                 <h1 className="text-3xl md:text-4xl font-bold text-foreground">
                    {article.title}
                </h1>
            </div>
          </div>
        </div>

        <div 
            className="prose dark:prose-invert max-w-none" 
            dangerouslySetInnerHTML={{ __html: article.content }}
        />

      </div>
    </div>
  );
}

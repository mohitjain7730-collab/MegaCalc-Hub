
import Link from 'next/link';
import { ArrowLeft } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { articles } from '@/lib/learning-hub-articles';
import { LearningHubCard } from '@/components/learning-hub-card';

export default function LearningHubPage() {
  return (
    <div className="flex flex-col items-center min-h-screen bg-background p-4 sm:p-8">
      <div className="w-full max-w-4xl">
        <div className="mb-8">
          <Button asChild variant="ghost" className="mb-4">
            <Link href="/">
              <ArrowLeft className="mr-2 h-4 w-4" />
              Back to Home
            </Link>
          </Button>
          <h1 className="text-4xl md:text-5xl font-extrabold tracking-tight text-foreground">
            Learning Hub
          </h1>
          <p className="mt-2 text-lg text-muted-foreground">
            Expand your knowledge with our collection of finance and science articles.
          </p>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
          {articles.map((article) => (
            <LearningHubCard key={article.slug} {...article} />
          ))}
        </div>
      </div>
    </div>
  );
}


import Link from 'next/link';
import { articles } from '@/lib/articles';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { ArrowLeft, BookOpen, Construction } from 'lucide-react';
import { Button } from '@/components/ui/button';

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
          <div className="flex items-center gap-4">
             <BookOpen className="h-12 w-12 text-primary" strokeWidth={1.5} />
             <div>
                <h1 className="text-4xl md:text-5xl font-extrabold tracking-tight text-foreground">
                    Learning Hub
                </h1>
                <p className="mt-2 text-lg text-muted-foreground">
                    Deep dives into the concepts behind our calculators.
                </p>
             </div>
          </div>
        </div>

        {articles.length > 0 ? (
            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            {articles.map((article) => (
                <Link href={`/learning/${article.slug}`} key={article.slug} className="group block h-full">
                <Card className="h-full transition-all duration-200 ease-in-out group-hover:shadow-lg group-hover:-translate-y-1 group-hover:border-primary/50">
                    <CardHeader>
                    <CardTitle className="text-lg">{article.title}</CardTitle>
                    <CardDescription className="pt-1">{article.description}</CardDescription>
                    </CardHeader>
                </Card>
                </Link>
            ))}
            </div>
        ) : (
             <Card className="w-full text-center shadow-md mt-8">
                <CardHeader>
                    <Construction className="mx-auto h-16 w-16 mb-6 text-primary" strokeWidth={1.5} />
                    <CardTitle className="text-2xl md:text-3xl font-bold text-foreground mb-4">
                        Articles Coming Soon
                    </CardTitle>
                </CardHeader>
                <CardContent className="p-8 pt-0">
                    <p className="text-lg text-muted-foreground">
                        We're hard at work creating detailed articles and guides. Check back soon!
                    </p>
                </CardContent>
            </Card>
        )}
      </div>
    </div>
  );
}

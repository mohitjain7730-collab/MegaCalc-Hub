import Link from 'next/link';
import {
  Card,
  CardDescription,
  CardHeader,
  CardTitle,
} from '@/components/ui/card';
import { CategoryIcon } from '@/components/category-icon';
import { Button } from '@/components/ui/button';
import { ArrowLeft } from 'lucide-react';

const learningHubCategories = [
  {
    name: 'Finance',
    slug: 'finance',
    description: 'Learn about finance topics and concepts.',
    Icon: 'PiggyBank',
  },
  {
    name: 'Health',
    slug: 'health',
    description: 'Explore health and wellness topics.',
    Icon: 'HeartPulse',
  },
];

export default function LearningHubPage() {
  return (
    <div className="flex flex-col items-center min-h-screen bg-background p-4 sm:p-8">
      <div className="w-full max-w-7xl mx-auto">
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
            Explore educational content organized by category.
          </p>
        </div>

        <section className="py-8">
          <div className="text-center mb-12">
            <h2 className="text-3xl font-bold tracking-tight">Categories</h2>
            <p className="mt-2 text-muted-foreground">Choose a category to explore.</p>
          </div>
          <div className="w-full max-w-7xl mx-auto grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-6">
            {learningHubCategories.map((category) => (
              <Link
                key={category.slug}
                href={`/learning-hub/${category.slug}`}
                className="group block h-full"
              >
                <Card className="h-full transition-all duration-200 ease-in-out group-hover:shadow-lg group-hover:-translate-y-1 group-hover:border-primary/50">
                  <CardHeader>
                    <CategoryIcon
                      name={category.Icon}
                      className="h-8 w-8 mb-4 text-primary"
                      strokeWidth={1.5}
                    />
                    <CardTitle className="text-lg">{category.name}</CardTitle>
                    <CardDescription className="pt-1">
                      {category.description}
                    </CardDescription>
                  </CardHeader>
                </Card>
              </Link>
            ))}
          </div>
        </section>
      </div>
    </div>
  );
}



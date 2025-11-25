import Link from 'next/link';
import { Button } from '@/components/ui/button';
import { ArrowLeft } from 'lucide-react';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { CategoryIcon } from '@/components/category-icon';

const financeSections = [
  {
    name: 'Savings & Investment',
    slug: 'savings-and-investment',
    description: 'In-depth guides covering saving habits, automation, and investing fundamentals.',
    icon: 'PiggyBank',
  },
];

export default function FinancePage() {
  return (
    <div className="flex flex-col items-center min-h-screen bg-background p-4 sm:p-8">
      <div className="w-full max-w-7xl mx-auto">
        <div className="mb-8">
          <Button asChild variant="ghost" className="mb-4">
            <Link href="/learning-hub">
              <ArrowLeft className="mr-2 h-4 w-4" />
              Back to Learning Hub
            </Link>
          </Button>
          <h1 className="text-4xl md:text-5xl font-extrabold tracking-tight text-foreground">
            Finance
          </h1>
          <p className="mt-2 text-lg text-muted-foreground">
            Explore finance articles and guides.
          </p>
        </div>

        {financeSections.length > 0 ? (
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
            {financeSections.map((section) => (
              <Link
                key={section.slug}
                href={`/learning-hub/finance/${section.slug}`}
                className="group block h-full"
              >
                <Card className="h-full transition-all duration-200 ease-in-out group-hover:shadow-lg group-hover:-translate-y-1 group-hover:border-primary/50">
                  <CardHeader>
                    <CategoryIcon
                      name={section.icon}
                      className="h-8 w-8 mb-4 text-primary"
                      strokeWidth={1.5}
                    />
                    <CardTitle className="text-lg">{section.name}</CardTitle>
                    <CardDescription className="pt-1">
                      {section.description}
                    </CardDescription>
                  </CardHeader>
                </Card>
              </Link>
            ))}
          </div>
        ) : (
          <Card className="w-full text-center shadow-md">
            <CardHeader>
              <CardTitle className="text-2xl md:text-3xl font-bold">
                Coming soon
              </CardTitle>
            </CardHeader>
            <CardContent>
              <p className="text-lg text-muted-foreground">
                Finance content is coming soon. Check back later!
              </p>
            </CardContent>
          </Card>
        )}
      </div>
    </div>
  );
}



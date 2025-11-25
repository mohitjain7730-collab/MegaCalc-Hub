import Link from 'next/link';
import { Button } from '@/components/ui/button';
import { ArrowLeft } from 'lucide-react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';

export default function HealthPage() {
  return (
    <div className="flex flex-col items-center min-h-screen bg-background p-4 sm:p-8">
      <div className="w-full max-w-4xl mx-auto">
        <div className="mb-8">
          <Button asChild variant="ghost" className="mb-4">
            <Link href="/learning-hub">
              <ArrowLeft className="mr-2 h-4 w-4" />
              Back to Learning Hub
            </Link>
          </Button>
          <h1 className="text-4xl md:text-5xl font-extrabold tracking-tight text-foreground">
            Health
          </h1>
        </div>

        <Card className="w-full text-center shadow-md">
          <CardHeader>
            <CardTitle className="text-2xl md:text-3xl font-bold">
              Coming soon
            </CardTitle>
          </CardHeader>
          <CardContent>
            <p className="text-lg text-muted-foreground">
              Health content is coming soon. Check back later!
            </p>
          </CardContent>
        </Card>
      </div>
    </div>
  );
}




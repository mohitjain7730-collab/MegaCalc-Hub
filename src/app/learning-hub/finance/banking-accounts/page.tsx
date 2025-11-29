import Link from 'next/link';
import { Button } from '@/components/ui/button';
import { ArrowLeft } from 'lucide-react';
import { Card, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { CategoryIcon } from '@/components/category-icon';

export default function BankingAccountsPage() {
  return (
    <div className="flex flex-col items-center min-h-screen bg-background p-4 sm:p-8">
      <div className="w-full max-w-7xl mx-auto">
        <div className="mb-8">
          <Button asChild variant="ghost" className="mb-4">
            <Link href="/learning-hub/finance">
              <ArrowLeft className="mr-2 h-4 w-4" />
              Back to Finance
            </Link>
          </Button>
          <p className="text-sm uppercase tracking-[0.3em] text-primary/70">
            Finance Track
          </p>
          <h1 className="text-4xl md:text-5xl font-extrabold tracking-tight text-foreground">
            Banking & Accounts
          </h1>
          <p className="mt-2 text-lg text-muted-foreground max-w-3xl">
            Choose the right bank accounts, understand fees, and optimize your banking strategy.
          </p>
        </div>

        <Card className="w-full text-center shadow-md">
          <CardHeader>
            <CategoryIcon
              name="Landmark"
              className="h-12 w-12 mb-4 text-primary mx-auto"
              strokeWidth={1.5}
            />
            <CardTitle className="text-2xl md:text-3xl font-bold">
              Coming soon
            </CardTitle>
            <CardDescription className="text-base mt-2">
              Content for Banking & Accounts is coming soon. Check back later!
            </CardDescription>
          </CardHeader>
        </Card>
      </div>
    </div>
  );
}


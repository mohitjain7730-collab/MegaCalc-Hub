import Link from 'next/link';
import { ArrowLeft } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';

export default function FinancePage() {
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
          <h1 className="text-4xl md:text-5xl font-extrabold tracking-tight text-foreground">
            Finance Articles
          </h1>
          <p className="mt-2 text-lg text-muted-foreground">
            Essential financial knowledge for smart borrowing and lending decisions.
          </p>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
          <Link href="/learning-hub/finance/how-to-calculate-loan-interest" className="group block h-full">
            <Card className="h-full transition-all duration-200 ease-in-out group-hover:shadow-lg group-hover:-translate-y-1 group-hover:border-primary/50">
              <CardHeader>
                <CardTitle className="text-lg">How to Calculate Loan Interest</CardTitle>
              </CardHeader>
              <CardContent>
                <p className="text-muted-foreground text-sm">Learn the different methods to calculate loan interest and understand how it affects your payments.</p>
              </CardContent>
            </Card>
          </Link>
          
          <Link href="/learning-hub/finance/fixed-vs-floating-rate-loans" className="group block h-full">
            <Card className="h-full transition-all duration-200 ease-in-out group-hover:shadow-lg group-hover:-translate-y-1 group-hover:border-primary/50">
              <CardHeader>
                <CardTitle className="text-lg">Fixed vs Floating Rate Loans</CardTitle>
              </CardHeader>
              <CardContent>
                <p className="text-muted-foreground text-sm">Compare the pros and cons of fixed and floating interest rate loans to make informed borrowing decisions.</p>
              </CardContent>
            </Card>
          </Link>
          
          <Link href="/learning-hub/finance/common-loan-mistakes" className="group block h-full">
            <Card className="h-full transition-all duration-200 ease-in-out group-hover:shadow-lg group-hover:-translate-y-1 group-hover:border-primary/50">
              <CardHeader>
                <CardTitle className="text-lg">Common Loan Mistakes</CardTitle>
              </CardHeader>
              <CardContent>
                <p className="text-muted-foreground text-sm">Avoid these common pitfalls when taking out loans and protect your financial future.</p>
              </CardContent>
            </Card>
          </Link>
        </div>
      </div>
    </div>
  );
}

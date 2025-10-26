'use client';

import { useState } from 'react';
import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import { z } from 'zod';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Form, FormControl, FormField, FormItem, FormLabel, FormMessage } from '@/components/ui/form';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Landmark, Calculator, Globe, FileText, Info, Home } from 'lucide-react';
import { EmbedWidget } from '@/components/embed-widget';

const formSchema = z.object({
  purchasePrice: z.number().positive(),
  noi: z.number().nonnegative().optional().nullable(),
  grossRentAnnual: z.number().nonnegative().optional().nullable(),
  operatingExpensesAnnual: z.number().nonnegative().optional().nullable(),
});

type FormValues = z.infer<typeof formSchema>;

export default function RentalPropertyCapRateCalculator() {
  const [result, setResult] = useState<{ noi: number; capRatePct: number; opinion: string } | null>(null);

  const form = useForm<FormValues>({
    resolver: zodResolver(formSchema),
    defaultValues: {
      purchasePrice: 0,
      noi: 0,
      grossRentAnnual: 0,
      operatingExpensesAnnual: 0,
    },
  });

  const onSubmit = (v: FormValues) => {
    const computedNoi = v.noi ?? Math.max(0, (v.grossRentAnnual || 0) - (v.operatingExpensesAnnual || 0));
    const capRatePct = v.purchasePrice > 0 ? (computedNoi / v.purchasePrice) * 100 : 0;
    let opinion = 'Compare cap rate to local market norms for property type and risk.';
    if (capRatePct < 4) opinion = 'Low cap rate: priced for appreciation or prime location, not income.';
    else if (capRatePct > 8) opinion = 'High cap rate: higher income but potentially higher risk or deferred maintenance.';
    setResult({ noi: computedNoi, capRatePct, opinion });
  };

  return (
    <div className="space-y-8">
      {/* Input Form */}
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <Calculator className="h-5 w-5" />
            Rental Property Return / Cap Rate Calculator
          </CardTitle>
          <CardDescription>
            Calculate the capitalization rate for rental properties
          </CardDescription>
        </CardHeader>
        <CardContent>
          <Form {...form}>
            <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-6">
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <FormField control={form.control} name="purchasePrice" render={({ field }) => (
                  <FormItem>
                    <FormLabel>Purchase Price ($)</FormLabel>
                    <FormControl>
                      <Input type="number" {...field} value={field.value || ''} onChange={e => field.onChange(parseFloat(e.target.value) || 0)} />
                    </FormControl>
                    <FormMessage />
                  </FormItem>
                )} />
                <FormField control={form.control} name="noi" render={({ field }) => (
                  <FormItem>
                    <FormLabel>Net Operating Income (NOI) – annual ($)</FormLabel>
                    <FormControl>
                      <Input type="number" {...field} value={(field.value as number | undefined) || ''} onChange={e => field.onChange(parseFloat(e.target.value) || 0)} />
                    </FormControl>
                    <FormMessage />
                  </FormItem>
                )} />
                <FormField control={form.control} name="grossRentAnnual" render={({ field }) => (
                  <FormItem>
                    <FormLabel>Gross Rent – annual ($) [optional]</FormLabel>
                    <FormControl>
                      <Input type="number" {...field} value={(field.value as number | undefined) || ''} onChange={e => field.onChange(parseFloat(e.target.value) || 0)} />
                    </FormControl>
                    <FormMessage />
                  </FormItem>
                )} />
                <FormField control={form.control} name="operatingExpensesAnnual" render={({ field }) => (
                  <FormItem>
                    <FormLabel>Operating Expenses – annual ($) [optional]</FormLabel>
                    <FormControl>
                      <Input type="number" {...field} value={(field.value as number | undefined) || ''} onChange={e => field.onChange(parseFloat(e.target.value) || 0)} />
                    </FormControl>
                    <FormMessage />
                  </FormItem>
                )} />
              </div>
              <Button type="submit" className="w-full">
                <Home className="mr-2 h-4 w-4" />
                Calculate Cap Rate
              </Button>
            </form>
          </Form>
        </CardContent>
      </Card>

      {result && (
        <Card className="mt-8">
          <CardHeader>
            <div className='flex items-center gap-4'><Landmark className="h-8 w-8 text-primary" /><CardTitle>Cap Rate Result</CardTitle></div>
            <CardDescription>NOI and cap rate snapshot. Inputs are blank until provided.</CardDescription>
          </CardHeader>
          <CardContent>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4 text-center">
              <div><p className="text-sm text-muted-foreground">NOI</p><p className="text-2xl font-bold">${result.noi.toLocaleString()}</p></div>
              <div><p className="text-sm text-muted-foreground">Cap Rate</p><p className="text-2xl font-bold">{result.capRatePct.toFixed(2)}%</p></div>
            </div>
            <div className="mt-4 text-center"><CardDescription>{result.opinion}</CardDescription></div>
          </CardContent>
        </Card>
      )}

      {/* Related Calculators */}
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <Globe className="h-5 w-5" />
            Related Calculators
          </CardTitle>
          <CardDescription>
            Explore other real estate and investment calculators
          </CardDescription>
        </CardHeader>
        <CardContent>
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div className="p-4 border rounded-lg hover:bg-muted/50 transition-colors">
              <h4 className="font-semibold mb-2">
                <a href="/category/finance/real-estate-cash-on-cash-return-calculator" className="text-primary hover:underline">
                  Real Estate Cash-on-Cash Return
                </a>
              </h4>
              <p className="text-sm text-muted-foreground">
                Calculate cash-on-cash return for rental properties.
              </p>
            </div>
            <div className="p-4 border rounded-lg hover:bg-muted/50 transition-colors">
              <h4 className="font-semibold mb-2">
                <a href="/category/finance/mortgage-payment-calculator" className="text-primary hover:underline">
                  Mortgage Payment Calculator
                </a>
              </h4>
              <p className="text-sm text-muted-foreground">
                Calculate monthly mortgage payments for rental properties.
              </p>
            </div>
            <div className="p-4 border rounded-lg hover:bg-muted/50 transition-colors">
              <h4 className="font-semibold mb-2">
                <a href="/category/finance/mortgage-refinance-savings-calculator" className="text-primary hover:underline">
                  Mortgage Refinance Savings
                </a>
              </h4>
              <p className="text-sm text-muted-foreground">
                Calculate potential savings from refinancing rental property.
              </p>
            </div>
            <div className="p-4 border rounded-lg hover:bg-muted/50 transition-colors">
              <h4 className="font-semibold mb-2">
                <a href="/category/finance/dscr-calculator" className="text-primary hover:underline">
                  DSCR Calculator
                </a>
              </h4>
              <p className="text-sm text-muted-foreground">
                Calculate debt service coverage ratio for investment properties.
              </p>
            </div>
          </div>
        </CardContent>
      </Card>

      {/* Complete Guide */}
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <FileText className="h-5 w-5" />
            Complete Guide to Rental Property Cap Rates
          </CardTitle>
        </CardHeader>
        <CardContent className="prose prose-sm dark:prose-invert max-w-none">
          <p>This is a sample line for the complete guide section. You can add your detailed content here.</p>
          <p>This is another sample line for the guide section. Replace these with your comprehensive guide content.</p>
        </CardContent>
      </Card>

      {/* FAQ */}
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <Info className="h-5 w-5" />
            Frequently Asked Questions
          </CardTitle>
          <CardDescription>
            Common questions about rental property cap rates
          </CardDescription>
        </CardHeader>
        <CardContent className="space-y-6">
          <div>
            <h4 className="font-semibold text-foreground mb-2">What is a cap rate?</h4>
            <p className="text-muted-foreground">
              Cap rate (capitalization rate) is the ratio of net operating income (NOI) to property value. It measures the expected return on an investment property without considering financing costs.
            </p>
          </div>

          <div>
            <h4 className="font-semibold text-foreground mb-2">How do I calculate NOI?</h4>
            <p className="text-muted-foreground">
              Net Operating Income is gross rental income minus all operating expenses (property taxes, insurance, maintenance, property management, utilities, etc.). It does not include debt service or mortgage payments.
            </p>
          </div>

          <div>
            <h4 className="font-semibold text-foreground mb-2">What is a good cap rate?</h4>
            <p className="text-muted-foreground">
              A good cap rate depends on location, property type, and market conditions. Generally, 4-7% is typical for stable markets, while 8%+ may indicate higher risk or upside potential. Compare cap rates to similar properties in your market.
            </p>
          </div>

          <div>
            <h4 className="font-semibold text-foreground mb-2">Is a higher or lower cap rate better?</h4>
            <p className="text-muted-foreground">
              A higher cap rate typically means higher income relative to price, but also may indicate higher risk or lower appreciation potential. Lower cap rates often suggest premium properties in desirable locations with better appreciation potential.
            </p>
          </div>

          <div>
            <h4 className="font-semibold text-foreground mb-2">How does cap rate differ from cash-on-cash return?</h4>
            <p className="text-muted-foreground">
              Cap rate measures unleveraged return (without financing), while cash-on-cash return measures leveraged return based on the actual cash invested. Cap rate helps compare properties, while cash-on-cash shows your actual return.
            </p>
          </div>

          <div>
            <h4 className="font-semibold text-foreground mb-2">What expenses are included in NOI?</h4>
            <p className="text-muted-foreground">
              NOI includes all operating expenses like property taxes, insurance, maintenance, repairs, property management fees, utilities, landscaping, advertising, and legal fees. It excludes mortgage payments, depreciation, and capital improvements.
            </p>
          </div>

          <div>
            <h4 className="font-semibold text-foreground mb-2">Can cap rate change over time?</h4>
            <p className="text-muted-foreground">
              Yes, cap rates can change as rental income fluctuates, expenses change, or property value appreciates. Regular cap rate analysis helps track property performance and market conditions.
            </p>
          </div>

          <div>
            <h4 className="font-semibold text-foreground mb-2">How do I use cap rate to evaluate deals?</h4>
            <p className="text-muted-foreground">
              Compare the cap rate to similar properties in the market. A property with a significantly lower cap rate than comparable properties may be overpriced, while a higher cap rate may indicate a good opportunity or hidden risks.
            </p>
          </div>

          <div>
            <h4 className="font-semibold text-foreground mb-2">What's the difference between cap rate and ROI?</h4>
            <p className="text-muted-foreground">
              Cap rate shows current income return, while ROI (Return on Investment) measures total return including appreciation, tax benefits, and sale proceeds. ROI provides a more comprehensive investment picture.
            </p>
          </div>

          <div>
            <h4 className="font-semibold text-foreground mb-2">Should I use cap rate for all property types?</h4>
            <p className="text-muted-foreground">
              Cap rate is most useful for income-producing properties like rental homes, multifamily, and commercial properties. It's less applicable to primary residences, fix-and-flip projects, or properties with significant development potential.
            </p>
          </div>
        </CardContent>
      </Card>

      <EmbedWidget categorySlug="finance" calculatorSlug="rental-property-cap-rate-calculator" />
    </div>
  );
}



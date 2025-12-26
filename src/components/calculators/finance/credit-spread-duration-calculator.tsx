'use client';

import { useState } from 'react';
import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import { z } from 'zod';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Form, FormControl, FormField, FormItem, FormLabel, FormMessage } from '@/components/ui/form';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Calculator, Info, Activity, Target, AlertCircle, CheckCircle2 } from 'lucide-react';
import { Badge } from '@/components/ui/badge';
import { Alert, AlertDescription } from '@/components/ui/alert';

const formSchema = z.object({
  cleanPrice: z.number().min(0).optional(),
  spreadDurationYears: z.number().min(0).optional(),
  spreadChangeBps: z.number().optional(),
});

type FormValues = z.infer<typeof formSchema>;

export default function CreditSpreadDurationCalculator() {
  const [result, setResult] = useState<{ priceChange: number; newPrice: number; interpretation: string; insights: string[]; considerations: string[] } | null>(null);

  const form = useForm<FormValues>({ resolver: zodResolver(formSchema), defaultValues: { cleanPrice: undefined as unknown as number, spreadDurationYears: undefined as unknown as number, spreadChangeBps: undefined as unknown as number } });

  const onSubmit = (v: FormValues) => {
    if (v.cleanPrice === undefined || v.spreadDurationYears === undefined || v.spreadChangeBps === undefined) { setResult(null); return; }
    const bp = v.spreadChangeBps / 10000; // decimal change
    const priceChange = -v.spreadDurationYears * bp * v.cleanPrice; // linear approx
    const newPrice = v.cleanPrice + priceChange;
    const interpretation = v.spreadChangeBps > 0 ? 'Wider credit spreads reduce price.' : v.spreadChangeBps < 0 ? 'Tighter credit spreads increase price.' : 'No spread change; price unchanged by credit component.';

    setResult({
      priceChange,
      newPrice,
      interpretation,
      insights: [
        'Higher spread duration amplifies impact of credit deterioration.',
        'Tightening spreads offer capital appreciation potential.',
        'Use OAS duration for bonds with embedded options.'
      ],
      considerations: [
        'Linear approximation fails for large spread shocks.',
        'Credit risk often correlates with equity market stress.',
        'Liquidity gaps can widen spreads beyond fundamental reasons.',
        'Total return includes coupon income, not just price change.',
        'Spread duration differs from interest rate duration.'
      ]
    });
  };

  const num = (ph: string, field: any) => (
    <Input type="number" step="0.01" placeholder={ph} {...field}
      value={Number.isFinite(field.value as any) ? (field.value as any) : ''}
      onChange={e => { const v = e.target.value; const n = v === '' ? undefined : Number(v); field.onChange(Number.isFinite(n as any) ? n : undefined); }} />
  );

  return (
    <div className="space-y-8">
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2"><Activity className="h-5 w-5" /> Credit Spread Duration Calculator</CardTitle>
          <CardDescription>Estimate price impact from a change in credit spread using spread duration.</CardDescription>
        </CardHeader>
        <CardContent>
          <Form {...form}>
            <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-6">
              <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
                <FormField control={form.control} name="cleanPrice" render={({ field }) => (<FormItem><FormLabel>Clean Price</FormLabel><FormControl>{num('e.g., 100.50', field)}</FormControl><FormMessage /></FormItem>)} />
                <FormField control={form.control} name="spreadDurationYears" render={({ field }) => (<FormItem><FormLabel>Spread Duration (years)</FormLabel><FormControl>{num('e.g., 4.5', field)}</FormControl><FormMessage /></FormItem>)} />
                <FormField control={form.control} name="spreadChangeBps" render={({ field }) => (<FormItem><FormLabel>Spread Change (bps)</FormLabel><FormControl>{num('e.g., 25', field)}</FormControl><FormMessage /></FormItem>)} />
              </div>
              <Button type="submit" className="w-full md:w-auto">Calculate</Button>
            </form>
          </Form>
        </CardContent>
      </Card>

      {result && (
        <>
          <Card>
            <CardHeader><CardTitle className="flex items-center gap-2"><Calculator className="h-5 w-5" /> Results & Insights</CardTitle><CardDescription>Credit spread sensitivity</CardDescription></CardHeader>
            <CardContent className="space-y-6">
              <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                <div className="p-4 border rounded-lg"><p className="text-sm text-muted-foreground">Estimated Price Change</p><p className={`text-2xl font-bold ${result.priceChange >= 0 ? 'text-green-600' : 'text-red-600'}`}>{result.priceChange.toFixed(4)}</p></div>
                <div className="p-4 border rounded-lg"><p className="text-sm text-muted-foreground">New Price</p><p className="text-2xl font-bold">{result.newPrice.toFixed(4)}</p></div>
                <div className="p-4 border rounded-lg"><p className="text-sm text-muted-foreground">Interpretation</p><p className="font-medium">{result.interpretation}</p></div>
              </div>
            </CardContent>
          </Card>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            <Card className="h-full">
              <CardHeader>
                <CardTitle className="flex items-center gap-2 text-xl text-primary">
                  <Target className="h-6 w-6" />
                  Strategic Insights
                </CardTitle>
                <CardDescription>Portfolio management</CardDescription>
              </CardHeader>
              <CardContent className="space-y-4">
                {result.insights.map((s, i) => (
                  <div key={i} className="flex items-start gap-3 p-3 bg-primary/5 rounded-lg border border-primary/10">
                    <CheckCircle2 className="h-5 w-5 text-primary mt-0.5 shrink-0" />
                    <span className="text-sm font-medium">{s}</span>
                  </div>
                ))}
              </CardContent>
            </Card>

            <Card className="h-full border-red-100 bg-red-50/10 dark:border-red-900/20 dark:bg-red-900/5">
              <CardHeader>
                <CardTitle className="flex items-center gap-2 text-xl text-red-600 dark:text-red-400">
                  <AlertCircle className="h-6 w-6" />
                  Risk Assessment
                </CardTitle>
                <CardDescription>Critical factors</CardDescription>
              </CardHeader>
              <CardContent className="space-y-4">
                {result.considerations.map((s, i) => (
                  <div key={i} className="flex items-start gap-3 p-3 bg-red-50 dark:bg-red-900/10 rounded-lg border border-red-100 dark:border-red-900/20">
                    <AlertCircle className="h-5 w-5 text-red-600 dark:text-red-400 mt-0.5 shrink-0" />
                    <span className="text-sm font-medium text-red-800 dark:text-red-300">{s}</span>
                  </div>
                ))}
              </CardContent>
            </Card>
          </div>
        </>
      )}

      <Card>
        <CardHeader><CardTitle className="flex items-center gap-2"><Calculator className="h-5 w-5" /> Related Calculators</CardTitle><CardDescription>Bonds and credit risk</CardDescription></CardHeader>
        <CardContent>
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div className="p-4 border rounded-lg hover:bg-muted/50 transition-colors"><h4 className="font-semibold mb-2"><a href="/category/finance/bond-duration-calculator" className="text-primary hover:underline">Bond Duration Calculator</a></h4><p className="text-sm text-muted-foreground">Rate duration sensitivity.</p></div>
            <div className="p-4 border rounded-lg hover:bg-muted/50 transition-colors"><h4 className="font-semibold mb-2"><a href="/category/finance/bond-convexity-calculator" className="text-primary hover:underline">Bond Convexity Calculator</a></h4><p className="text-sm text-muted-foreground">Non-linear rate risk.</p></div>
            <div className="p-4 border rounded-lg hover:bg-muted/50 transition-colors"><h4 className="font-semibold mb-2"><a href="/category/finance/pvbp-calculator" className="text-primary hover:underline">PVBP Calculator</a></h4><p className="text-sm text-muted-foreground">Value of a basis point.</p></div>
            <div className="p-4 border rounded-lg hover:bg-muted/50 transition-colors"><h4 className="font-semibold mb-2"><a href="/category/finance/dollar-duration-calculator" className="text-primary hover:underline">Dollar Duration Calculator</a></h4><p className="text-sm text-muted-foreground">Dollar risk per yield move.</p></div>
          </div>
        </CardContent>
      </Card>

      {/* Formula Used */}
      <Card className="mb-6">
        <CardHeader><CardTitle className="flex items-center gap-2"><Calculator className="h-5 w-5" />Formula Used</CardTitle></CardHeader>
        <CardContent className="space-y-4">
          <div className="p-4 bg-muted rounded-lg overflow-x-auto"><p className="font-mono text-sm text-center">ΔPrice ≈ -Spread Duration × Δspread × Price</p></div>
          <p className="text-sm text-muted-foreground">Linear approximation for price change from credit spread movement.</p>
        </CardContent>
      </Card>

      {/* Input Explanations */}
      <Card className="mb-6">
        <CardHeader><CardTitle className="flex items-center gap-2"><Info className="h-5 w-5" />Understanding the Inputs</CardTitle></CardHeader>
        <CardContent><div className="grid grid-cols-1 md:grid-cols-3 gap-4">
          <div className="p-4 bg-muted/50 rounded-lg"><h4 className="font-semibold mb-2">Clean Price</h4><p className="text-sm text-muted-foreground">Current market price excluding accrued interest.</p></div>
          <div className="p-4 bg-muted/50 rounded-lg"><h4 className="font-semibold mb-2">Spread Duration</h4><p className="text-sm text-muted-foreground">Sensitivity to credit spread changes in years.</p></div>
          <div className="p-4 bg-muted/50 rounded-lg"><h4 className="font-semibold mb-2">Spread Change (bps)</h4><p className="text-sm text-muted-foreground">Expected change in credit spread in basis points.</p></div>
        </div></CardContent>
      </Card>

      {/* Complete SEO Guide */}
      <section className="space-y-6 text-muted-foreground leading-relaxed bg-card p-6 md:p-10 rounded-lg shadow-lg">
        <h1 className="text-3xl md:text-4xl font-extrabold text-foreground mb-4">Complete Guide to Credit Spread Duration</h1>
        <p className="text-lg italic">Credit spread duration isolates price sensitivity to credit spread changes, holding interest rates constant.</p>
        <h2 className="text-2xl font-bold text-foreground mt-8 mb-4">OAS-Based Analysis</h2>
        <p>For bonds with embedded options, use option-adjusted spread (OAS) duration rather than nominal spread duration for accurate risk assessment.</p>
        <h2 className="text-2xl font-bold text-foreground pt-8">Conclusion</h2>
        <p>Credit spread duration is essential for credit portfolio management, helping separate rate risk from credit risk.</p>
      </section>

      <Card>
        <CardHeader><CardTitle className="flex items-center gap-2"><Info className="h-5 w-5" /> Frequently Asked Questions</CardTitle><CardDescription>Credit spread risk</CardDescription></CardHeader>
        <CardContent className="space-y-6">
          <div><h4 className="font-semibold mb-2">What is credit spread duration?</h4><p className="text-muted-foreground">It measures a bond's price sensitivity to changes in credit spread, holding interest rates constant.</p></div>
          <div><h4 className="font-semibold mb-2">How is it different from interest-rate duration?</h4><p className="text-muted-foreground">Rate duration captures sensitivity to risk-free yield; spread duration isolates the credit component.</p></div>
          <div><h4 className="font-semibold mb-2">Where do I get spread duration?</h4><p className="text-muted-foreground">From portfolio analytics systems or data vendors that compute OAS-based measures.</p></div>
          <div><h4 className="font-semibold mb-2">Is the price change linear?</h4><p className="text-muted-foreground">Only for small spread moves; large changes require convexity-of-spread adjustments.</p></div>
        </CardContent>
      </Card>

      {/* Summary Section */}
      <Card>
        <CardHeader><CardTitle className="flex items-center gap-2"><Info className="h-5 w-5" />Summary</CardTitle></CardHeader>
        <CardContent><p className="text-muted-foreground">The Credit Spread Duration Calculator estimates price impact from credit spread changes. Use it to decompose total bond risk into rate and credit components for better risk management.</p></CardContent>
      </Card>
    </div>
  );
}



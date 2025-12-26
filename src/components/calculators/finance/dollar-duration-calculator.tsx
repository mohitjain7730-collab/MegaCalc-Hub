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
  modifiedDuration: z.number().min(0).optional(),
});

type FormValues = z.infer<typeof formSchema>;

export default function DollarDurationCalculator() {
  const [result, setResult] = useState<{ dollarDuration: number; interpretation: string; insights: string[]; considerations: string[] } | null>(null);
  const form = useForm<FormValues>({ resolver: zodResolver(formSchema), defaultValues: { cleanPrice: undefined as unknown as number, modifiedDuration: undefined as unknown as number } });

  const onSubmit = (v: FormValues) => {
    if (v.cleanPrice === undefined || v.modifiedDuration === undefined) { setResult(null); return; }
    const dd = v.modifiedDuration * v.cleanPrice; // per 1% move
    const interpretation = 'Dollar price change for a 1% (100 bps) parallel shift in yield.';

    setResult({
      dollarDuration: dd,
      interpretation,
      insights: [
        'Sum dollar durations across portfolio to estimate total rate risk.',
        'Divide by 100 to get PVBP (DV01) for finer hedging.',
        'Use dollar duration to determine hedge notional required.'
      ],
      considerations: [
        'Assumes a parallel shift in the yield curve.',
        'Dollar duration changes as yields and prices change (convexity).',
        'Large rate moves require convexity adjustment.',
        'Effective duration preferred for bonds with options.',
        'Rebalance hedges frequently to maintain dollar neutrality.'
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
          <CardTitle className="flex items-center gap-2"><Activity className="h-5 w-5" /> Dollar Duration Calculator</CardTitle>
          <CardDescription>Compute duration × price to estimate dollar change for a 1% yield move.</CardDescription>
        </CardHeader>
        <CardContent>
          <Form {...form}>
            <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-6">
              <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                <FormField control={form.control} name="cleanPrice" render={({ field }) => (<FormItem><FormLabel>Clean Price</FormLabel><FormControl>{num('e.g., 100.25', field)}</FormControl><FormMessage /></FormItem>)} />
                <FormField control={form.control} name="modifiedDuration" render={({ field }) => (<FormItem><FormLabel>Modified Duration (years)</FormLabel><FormControl>{num('e.g., 6.2', field)}</FormControl><FormMessage /></FormItem>)} />
              </div>
              <Button type="submit" className="w-full md:w-auto">Calculate</Button>
            </form>
          </Form>
        </CardContent>
      </Card>

      {result && (
        <>
          <Card>
            <CardHeader><CardTitle className="flex items-center gap-2"><Calculator className="h-5 w-5" /> Results & Insights</CardTitle><CardDescription>Dollar change per 1% move</CardDescription></CardHeader>
            <CardContent className="space-y-6">
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div className="p-4 border rounded-lg"><p className="text-sm text-muted-foreground">Dollar Duration</p><p className="text-2xl font-bold">{result.dollarDuration.toFixed(4)}</p></div>
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
                <CardDescription>Hedging strategy</CardDescription>
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
                <CardDescription>Limitations</CardDescription>
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
        <CardHeader><CardTitle className="flex items-center gap-2"><Calculator className="h-5 w-5" /> Related Calculators</CardTitle><CardDescription>Duration and risk</CardDescription></CardHeader>
        <CardContent>
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div className="p-4 border rounded-lg hover:bg-muted/50 transition-colors"><h4 className="font-semibold mb-2"><a href="/category/finance/pvbp-calculator" className="text-primary hover:underline">PVBP Calculator</a></h4><p className="text-sm text-muted-foreground">Dollar value per bp.</p></div>
            <div className="p-4 border rounded-lg hover:bg-muted/50 transition-colors"><h4 className="font-semibold mb-2"><a href="/category/finance/bond-duration-calculator" className="text-primary hover:underline">Bond Duration</a></h4><p className="text-sm text-muted-foreground">Duration input.</p></div>
            <div className="p-4 border rounded-lg hover:bg-muted/50 transition-colors"><h4 className="font-semibold mb-2"><a href="/category/finance/bond-convexity-calculator" className="text-primary hover:underline">Bond Convexity</a></h4><p className="text-sm text-muted-foreground">Curvature effects.</p></div>
            <div className="p-4 border rounded-lg hover:bg-muted/50 transition-colors"><h4 className="font-semibold mb-2"><a href="/category/finance/convexity-adjustment-bond-futures-calculator" className="text-primary hover:underline">Convexity Adjustment</a></h4><p className="text-sm text-muted-foreground">Futures vs forwards.</p></div>
          </div>
        </CardContent>
      </Card>

      {/* Formula Used */}
      <Card className="mb-6">
        <CardHeader><CardTitle className="flex items-center gap-2"><Calculator className="h-5 w-5" />Formula Used</CardTitle></CardHeader>
        <CardContent className="space-y-4">
          <div className="p-4 bg-muted rounded-lg overflow-x-auto"><p className="font-mono text-sm text-center">Dollar Duration = Modified Duration × Price</p></div>
          <p className="text-sm text-muted-foreground">Dollar price change for a 1% (100 bps) parallel yield shift.</p>
        </CardContent>
      </Card>

      {/* Input Explanations */}
      <Card className="mb-6">
        <CardHeader><CardTitle className="flex items-center gap-2"><Info className="h-5 w-5" />Understanding the Inputs</CardTitle></CardHeader>
        <CardContent><div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          <div className="p-4 bg-muted/50 rounded-lg"><h4 className="font-semibold mb-2">Clean Price</h4><p className="text-sm text-muted-foreground">Market price excluding accrued interest.</p></div>
          <div className="p-4 bg-muted/50 rounded-lg"><h4 className="font-semibold mb-2">Modified Duration</h4><p className="text-sm text-muted-foreground">Measures price sensitivity per 1% yield change.</p></div>
        </div></CardContent>
      </Card>

      {/* Complete SEO Guide */}
      <section className="space-y-6 text-muted-foreground leading-relaxed bg-card p-6 md:p-10 rounded-lg shadow-lg">
        <h1 className="text-3xl md:text-4xl font-extrabold text-foreground mb-4">Complete Guide to Dollar Duration</h1>
        <p className="text-lg italic">Dollar duration translates percentage duration into absolute dollar terms for practical risk sizing.</p>
        <h2 className="text-2xl font-bold text-foreground mt-8 mb-4">Relationship to PVBP</h2>
        <p>Divide dollar duration by 100 to get PVBP (DV01). Both metrics are essential for hedge ratio calculations.</p>
        <h2 className="text-2xl font-bold text-foreground pt-8">Conclusion</h2>
        <p>Dollar duration provides intuitive risk measurement in monetary terms for portfolio management and hedging.</p>
      </section>

      <Card>
        <CardHeader><CardTitle className="flex items-center gap-2"><Info className="h-5 w-5" /> Frequently Asked Questions</CardTitle><CardDescription>Dollar duration</CardDescription></CardHeader>
        <CardContent className="space-y-6">
          <div><h4 className="font-semibold mb-2">What is dollar duration?</h4><p className="text-muted-foreground">The dollar price change for a 1% parallel yield shift (duration × price).</p></div>
          <div><h4 className="font-semibold mb-2">How do I convert to PVBP?</h4><p className="text-muted-foreground">Divide dollar duration by 100 to get per-basis-point value.</p></div>
          <div><h4 className="font-semibold mb-2">Can I sum across bonds?</h4><p className="text-muted-foreground">Yes—sum dollar durations to estimate portfolio rate sensitivity.</p></div>
          <div><h4 className="font-semibold mb-2">Which duration to use?</h4><p className="text-muted-foreground">Modified duration for bullet bonds; effective duration for options/structures.</p></div>
        </CardContent>
      </Card>

      {/* Summary Section */}
      <Card>
        <CardHeader><CardTitle className="flex items-center gap-2"><Info className="h-5 w-5" />Summary</CardTitle></CardHeader>
        <CardContent><p className="text-muted-foreground">The Dollar Duration Calculator converts duration to dollar terms for intuitive risk assessment. Sum across positions to estimate total portfolio interest rate exposure.</p></CardContent>
      </Card>
    </div>
  );
}



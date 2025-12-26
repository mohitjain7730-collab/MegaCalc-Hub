'use client';

import { useState } from 'react';
import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import { z } from 'zod';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Form, FormControl, FormField, FormItem, FormLabel, FormMessage } from '@/components/ui/form';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Calculator, Info, Activity } from 'lucide-react';

const formSchema = z.object({
  cleanPrice: z.number().min(0).optional(),
  modifiedDuration: z.number().min(0).optional(),
});

type FormValues = z.infer<typeof formSchema>;

export default function PVBPCalculator() {
  const [result, setResult] = useState<{ pvbp: number; interpretation: string; suggestions: string[] } | null>(null);
  const form = useForm<FormValues>({ resolver: zodResolver(formSchema), defaultValues: { cleanPrice: undefined as unknown as number, modifiedDuration: undefined as unknown as number } });

  const onSubmit = (v: FormValues) => {
    if (v.cleanPrice === undefined || v.modifiedDuration === undefined) { setResult(null); return; }
    const pvbp = v.modifiedDuration * v.cleanPrice * 0.0001; // per 1 bp
    const interpretation = 'Price change for a one basis point (0.01%) shift in yield.';
    setResult({ pvbp, interpretation, suggestions: ['Use PVBP to size hedges with Treasury futures.', 'Aggregate PVBPs across holdings to manage total rate risk.', 'Recompute PVBP as price and duration change over time.', 'Combine with spread PVBP to separate rate vs credit risk.'] });
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
          <CardTitle className="flex items-center gap-2"><Activity className="h-5 w-5" /> PVBP (Price Value of a Basis Point) Calculator</CardTitle>
          <CardDescription>Compute the dollar value change for a 1 bp yield move.</CardDescription>
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
        <Card>
          <CardHeader><CardTitle className="flex items-center gap-2"><Calculator className="h-5 w-5" /> Results & Insights</CardTitle><CardDescription>Dollar change per bp</CardDescription></CardHeader>
          <CardContent className="space-y-6">
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div className="p-4 border rounded-lg"><p className="text-sm text-muted-foreground">PVBP</p><p className="text-2xl font-bold">{result.pvbp.toFixed(4)}</p></div>
              <div className="p-4 border rounded-lg"><p className="text-sm text-muted-foreground">Interpretation</p><p className="font-medium">{result.interpretation}</p></div>
            </div>
          </CardContent>
        </Card>
      )}

      <Card>
        <CardHeader><CardTitle className="flex items-center gap-2"><Calculator className="h-5 w-5" /> Related Calculators</CardTitle><CardDescription>Duration and risk</CardDescription></CardHeader>
        <CardContent>
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div className="p-4 border rounded-lg hover:bg-muted/50 transition-colors"><h4 className="font-semibold mb-2"><a href="/category/finance/bond-duration-calculator" className="text-primary hover:underline">Bond Duration</a></h4><p className="text-sm text-muted-foreground">Duration input for PVBP.</p></div>
            <div className="p-4 border rounded-lg hover:bg-muted/50 transition-colors"><h4 className="font-semibold mb-2"><a href="/category/finance/dollar-duration-calculator" className="text-primary hover:underline">Dollar Duration</a></h4><p className="text-sm text-muted-foreground">Duration × price.</p></div>
            <div className="p-4 border rounded-lg hover:bg-muted/50 transition-colors"><h4 className="font-semibold mb-2"><a href="/category/finance/convexity-adjustment-bond-futures-calculator" className="text-primary hover:underline">Convexity Adjustment</a></h4><p className="text-sm text-muted-foreground">Futures vs forward.</p></div>
            <div className="p-4 border rounded-lg hover:bg-muted/50 transition-colors"><h4 className="font-semibold mb-2"><a href="/category/finance/value-at-risk-calculator" className="text-primary hover:underline">Value at Risk</a></h4><p className="text-sm text-muted-foreground">Portfolio risk sizing.</p></div>
          </div>
        </CardContent>
      </Card>

      {/* Formula Used */}
      <Card className="mb-6">
        <CardHeader><CardTitle className="flex items-center gap-2"><Calculator className="h-5 w-5" />Formula Used</CardTitle></CardHeader>
        <CardContent className="space-y-4">
          <div className="p-4 bg-muted rounded-lg overflow-x-auto"><p className="font-mono text-sm text-center">PVBP = Modified Duration × Price × 0.0001</p></div>
          <p className="text-sm text-muted-foreground">Dollar price change for a 1 basis point (0.01%) yield move.</p>
        </CardContent>
      </Card>

      {/* Input Explanations */}
      <Card className="mb-6">
        <CardHeader><CardTitle className="flex items-center gap-2"><Info className="h-5 w-5" />Understanding the Inputs</CardTitle></CardHeader>
        <CardContent><div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          <div className="p-4 bg-muted/50 rounded-lg"><h4 className="font-semibold mb-2">Clean Price</h4><p className="text-sm text-muted-foreground">Market price excluding accrued interest.</p></div>
          <div className="p-4 bg-muted/50 rounded-lg"><h4 className="font-semibold mb-2">Modified Duration</h4><p className="text-sm text-muted-foreground">Price sensitivity per 1% yield change.</p></div>
        </div></CardContent>
      </Card>

      {/* Complete SEO Guide */}
      <section className="space-y-6 text-muted-foreground leading-relaxed bg-card p-6 md:p-10 rounded-lg shadow-lg">
        <h1 className="text-3xl md:text-4xl font-extrabold text-foreground mb-4">Complete Guide to PVBP (DV01)</h1>
        <p className="text-lg italic">PVBP (Price Value of a Basis Point), also known as DV01, measures dollar risk per basis point yield change.</p>
        <h2 className="text-2xl font-bold text-foreground mt-8 mb-4">Hedging Applications</h2>
        <p>Match portfolio PVBP with hedge instrument PVBP to neutralize interest rate risk. Aggregate PVBPs across positions for total exposure.</p>
        <h2 className="text-2xl font-bold text-foreground pt-8">Conclusion</h2>
        <p>PVBP is the standard metric for sizing interest rate hedges using Treasury futures or swaps.</p>
      </section>

      <Card>
        <CardHeader><CardTitle className="flex items-center gap-2"><Info className="h-5 w-5" /> Frequently Asked Questions</CardTitle><CardDescription>PVBP usage</CardDescription></CardHeader>
        <CardContent className="space-y-6">
          <div><h4 className="font-semibold mb-2">What is PVBP?</h4><p className="text-muted-foreground">The dollar price change for a 1 bp yield change; also called DV01.</p></div>
          <div><h4 className="font-semibold mb-2">Is PVBP constant?</h4><p className="text-muted-foreground">It changes with price and duration; recalc as market conditions change.</p></div>
          <div><h4 className="font-semibold mb-2">How do I use PVBP for hedging?</h4><p className="text-muted-foreground">Match portfolio PVBP with hedge PVBP using Treasuries or futures.</p></div>
          <div><h4 className="font-semibold mb-2">PVBP vs Dollar Duration?</h4><p className="text-muted-foreground">PVBP is per bp; dollar duration equals duration × price (per 1% move).</p></div>
        </CardContent>
      </Card>

      {/* Summary Section */}
      <Card>
        <CardHeader><CardTitle className="flex items-center gap-2"><Info className="h-5 w-5" />Summary</CardTitle></CardHeader>
        <CardContent><p className="text-muted-foreground">The PVBP Calculator determines dollar risk per basis point yield change. Use it to size hedges and measure portfolio rate sensitivity in dollar terms.</p></CardContent>
      </Card>
    </div>
  );
}



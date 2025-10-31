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

      <Card>
        <CardHeader><CardTitle className="flex items-center gap-2"><Info className="h-5 w-5" /> Complete Guide to PVBP</CardTitle></CardHeader>
        <CardContent className="prose prose-sm dark:prose-invert max-w-none"><p>Placeholder guide.</p><p>Explain hedging and aggregation.</p></CardContent>
      </Card>

      <Card>
        <CardHeader><CardTitle className="flex items-center gap-2"><Info className="h-5 w-5" /> Frequently Asked Questions</CardTitle><CardDescription>PVBP usage</CardDescription></CardHeader>
        <CardContent className="space-y-6">
          <div><h4 className="font-semibold mb-2">What is PVBP?</h4><p className="text-muted-foreground">The dollar price change for a 1 bp yield change; also called DV01.</p></div>
          <div><h4 className="font-semibold mb-2">Is PVBP constant?</h4><p className="text-muted-foreground">It changes with price and duration; recalc as market conditions change.</p></div>
          <div><h4 className="font-semibold mb-2">How do I use PVBP for hedging?</h4><p className="text-muted-foreground">Match portfolio PVBP with hedge PVBP using Treasuries or futures.</p></div>
          <div><h4 className="font-semibold mb-2">PVBP vs Dollar Duration?</h4><p className="text-muted-foreground">PVBP is per bp; dollar duration equals duration × price (per 1% move).</p></div>
          <div><h4 className="font-semibold mb-2">Does convexity affect PVBP?</h4><p className="text-muted-foreground">PVBP is first-order; convexity adjusts for curvature at larger moves.</p></div>
          <div><h4 className="font-semibold mb-2">Which duration should I use?</h4><p className="text-muted-foreground">Modified duration is standard for PVBP; effective duration for options.</p></div>
          <div><h4 className="font-semibold mb-2">How to aggregate PVBP?</h4><p className="text-muted-foreground">Sum across positions with consistent sign conventions.</p></div>
          <div><h4 className="font-semibold mb-2">Can PVBP be negative?</h4><p className="text-muted-foreground">For inverse floaters or short positions, PVBP can be negative.</p></div>
          <div><h4 className="font-semibold mb-2">How does coupon affect PVBP?</h4><p className="text-muted-foreground">Higher coupon typically lowers duration and PVBP for the same price.</p></div>
          <div><h4 className="font-semibold mb-2">What units?</h4><p className="text-muted-foreground">Dollar change per 1 bp move, in the same currency as price.</p></div>
        </CardContent>
      </Card>
    </div>
  );
}



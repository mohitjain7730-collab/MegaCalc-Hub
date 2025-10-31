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
  spreadDurationYears: z.number().min(0).optional(),
  spreadChangeBps: z.number().optional(),
});

type FormValues = z.infer<typeof formSchema>;

export default function CreditSpreadDurationCalculator() {
  const [result, setResult] = useState<{ priceChange: number; newPrice: number; interpretation: string; suggestions: string[] } | null>(null);

  const form = useForm<FormValues>({ resolver: zodResolver(formSchema), defaultValues: { cleanPrice: undefined as unknown as number, spreadDurationYears: undefined as unknown as number, spreadChangeBps: undefined as unknown as number } });

  const onSubmit = (v: FormValues) => {
    if (v.cleanPrice === undefined || v.spreadDurationYears === undefined || v.spreadChangeBps === undefined) { setResult(null); return; }
    const bp = v.spreadChangeBps / 10000; // decimal change
    const priceChange = -v.spreadDurationYears * bp * v.cleanPrice; // linear approx
    const newPrice = v.cleanPrice + priceChange;
    const interpretation = v.spreadChangeBps > 0 ? 'Wider credit spreads reduce price.' : v.spreadChangeBps < 0 ? 'Tighter credit spreads increase price.' : 'No spread change; price unchanged by credit component.';
    setResult({ priceChange, newPrice, interpretation, suggestions: ['Use spread duration from vendor analytics for accuracy.', 'Combine with interest-rate duration for total risk.', 'Check for non-linear effects at large spread moves.', 'Recompute after changes in coupon/yield or time-to-maturity.'] });
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

      <Card>
        <CardHeader><CardTitle className="flex items-center gap-2"><Info className="h-5 w-5" /> Complete Guide to Credit Spread Duration</CardTitle></CardHeader>
        <CardContent className="prose prose-sm dark:prose-invert max-w-none"><p>Placeholder for a comprehensive guide.</p><p>Cover measurement methods and relation to option-adjusted spread analytics.</p></CardContent>
      </Card>

      <Card>
        <CardHeader><CardTitle className="flex items-center gap-2"><Info className="h-5 w-5" /> Frequently Asked Questions</CardTitle><CardDescription>Credit spread risk</CardDescription></CardHeader>
        <CardContent className="space-y-6">
          <div><h4 className="font-semibold mb-2">What is credit spread duration?</h4><p className="text-muted-foreground">It measures a bond’s price sensitivity to changes in credit spread, holding interest rates constant.</p></div>
          <div><h4 className="font-semibold mb-2">How is it different from interest-rate duration?</h4><p className="text-muted-foreground">Rate duration captures sensitivity to risk-free yield; spread duration isolates the credit component.</p></div>
          <div><h4 className="font-semibold mb-2">Where do I get spread duration?</h4><p className="text-muted-foreground">From portfolio analytics systems or data vendors that compute OAS-based measures.</p></div>
          <div><h4 className="font-semibold mb-2">Is the price change linear?</h4><p className="text-muted-foreground">Only for small spread moves; large changes require convexity-of-spread adjustments.</p></div>
          <div><h4 className="font-semibold mb-2">Should I use OAS or Z-spread?</h4><p className="text-muted-foreground">OAS-based duration is common as it adjusts for optionality; choose consistently across holdings.</p></div>
          <div><h4 className="font-semibold mb-2">How often should I recalc?</h4><p className="text-muted-foreground">Recalculate after material changes in spreads, time, or cash flow profile.</p></div>
          <div><h4 className="font-semibold mb-2">Can spread duration be negative?</h4><p className="text-muted-foreground">Rarely, but callable/puttable structures can create unusual sensitivities.</p></div>
          <div><h4 className="font-semibold mb-2">How to aggregate across portfolio?</h4><p className="text-muted-foreground">Use market-value-weighted average spread duration for portfolio-level estimates.</p></div>
          <div><h4 className="font-semibold mb-2">How do defaults impact the metric?</h4><p className="text-muted-foreground">Extreme credit events fall outside linear approximations; scenario analysis is recommended.</p></div>
          <div><h4 className="font-semibold mb-2">What are typical values?</h4><p className="text-muted-foreground">Investment-grade corporates often show 3–6 years; high yield typically lower due to shorter maturities.</p></div>
        </CardContent>
      </Card>
    </div>
  );
}



'use client';

import { useState } from 'react';
import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import { z } from 'zod';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Form, FormControl, FormField, FormItem, FormLabel, FormMessage } from '@/components/ui/form';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Calculator, Info, Globe } from 'lucide-react';

const formSchema = z.object({
  priceDomestic: z.number().min(0).optional(),
  priceForeign: z.number().min(0).optional(),
  spotRate: z.number().min(0).optional(),
});

type FormValues = z.infer<typeof formSchema>;

export default function PurchasingPowerParityCalculator() {
  const [result, setResult] = useState<{ impliedRate: number; mispricingPct: number; interp: string; suggestions: string[] } | null>(null);

  const form = useForm<FormValues>({ resolver: zodResolver(formSchema), defaultValues: { priceDomestic: undefined as unknown as number, priceForeign: undefined as unknown as number, spotRate: undefined as unknown as number } });

  const onSubmit = (v: FormValues) => {
    if (v.priceDomestic === undefined || v.priceForeign === undefined || v.spotRate === undefined || v.priceForeign === 0) { setResult(null); return; }
    const implied = v.priceDomestic / v.priceForeign;
    const mis = ((v.spotRate - implied) / implied) * 100;
    const interp = Math.abs(mis) < 1e-6 ? 'At parity: prices imply current spot.' : mis > 0 ? 'Spot above PPP implied rate (domestic overvalued vs foreign).' : 'Spot below PPP implied rate (domestic undervalued).';
    setResult({ impliedRate: implied, mispricingPct: mis, interp, suggestions: ['Use standardized baskets for better PPP comparisons.', 'Beware of taxes, tariffs, and non-tradables that distort PPP.', 'For long-run analysis, compare CPI levels rather than a single good.', 'Use logarithms for growth-rate PPP (relative PPP).'] });
  };

  const num = (ph: string, field: any) => (
    <Input type="number" step="0.0001" placeholder={ph} {...field}
      value={Number.isFinite(field.value as any) ? (field.value as any) : ''}
      onChange={e => { const v = e.target.value; const n = v === '' ? undefined : Number(v); field.onChange(Number.isFinite(n as any) ? n : undefined); }} />
  );

  return (
    <div className="space-y-8">
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2"><Globe className="h-5 w-5" /> Purchasing Power Parity (PPP) Calculator</CardTitle>
          <CardDescription>Compute PPP-implied exchange rate and mispricing versus spot.</CardDescription>
        </CardHeader>
        <CardContent>
          <Form {...form}>
            <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-6">
              <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
                <FormField control={form.control} name="priceDomestic" render={({ field }) => (<FormItem><FormLabel>Price Domestic (in domestic currency)</FormLabel><FormControl>{num('e.g., 5.00', field)}</FormControl><FormMessage /></FormItem>)} />
                <FormField control={form.control} name="priceForeign" render={({ field }) => (<FormItem><FormLabel>Price Foreign (in foreign currency)</FormLabel><FormControl>{num('e.g., 3.50', field)}</FormControl><FormMessage /></FormItem>)} />
                <FormField control={form.control} name="spotRate" render={({ field }) => (<FormItem><FormLabel>Spot Rate (domestic per 1 foreign)</FormLabel><FormControl>{num('e.g., 1.1200', field)}</FormControl><FormMessage /></FormItem>)} />
              </div>
              <Button type="submit" className="w-full md:w-auto">Calculate</Button>
            </form>
          </Form>
        </CardContent>
      </Card>

      {result && (
        <Card>
          <CardHeader><CardTitle className="flex items-center gap-2"><Calculator className="h-5 w-5" /> Results & Insights</CardTitle><CardDescription>PPP comparison</CardDescription></CardHeader>
          <CardContent className="space-y-6">
            <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
              <div className="p-4 border rounded-lg"><p className="text-sm text-muted-foreground">PPP-Implied Rate</p><p className="text-2xl font-bold">{result.impliedRate.toFixed(6)}</p></div>
              <div className="p-4 border rounded-lg"><p className="text-sm text-muted-foreground">Mispricing vs Spot</p><p className={`text-2xl font-bold ${result.mispricingPct >= 0 ? 'text-green-600' : 'text-red-600'}`}>{result.mispricingPct.toFixed(3)}%</p></div>
              <div className="p-4 border rounded-lg"><p className="text-sm text-muted-foreground">Interpretation</p><p className="font-medium">{result.interp}</p></div>
            </div>
            <div><h4 className="font-semibold mb-2">Suggestions</h4><ul className="list-disc pl-6 text-muted-foreground space-y-1">{result.suggestions.map((s,i)=>(<li key={i}>{s}</li>))}</ul></div>
          </CardContent>
        </Card>
      )}

      <Card>
        <CardHeader><CardTitle className="flex items-center gap-2"><Calculator className="h-5 w-5" /> Related Calculators</CardTitle><CardDescription>FX and inflation</CardDescription></CardHeader>
        <CardContent>
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div className="p-4 border rounded-lg hover:bg-muted/50 transition-colors"><h4 className="font-semibold mb-2"><a href="/category/finance/inflation-calculator" className="text-primary hover:underline">Inflation Calculator</a></h4><p className="text-sm text-muted-foreground">Context for price levels.</p></div>
            <div className="p-4 border rounded-lg hover:bg-muted/50 transition-colors"><h4 className="font-semibold mb-2"><a href="/category/finance/interest-rate-parity-calculator" className="text-primary hover:underline">Interest Rate Parity</a></h4><p className="text-sm text-muted-foreground">Forward rate parity.</p></div>
            <div className="p-4 border rounded-lg hover:bg-muted/50 transition-colors"><h4 className="font-semibold mb-2"><a href="/category/finance/currency-exchange-calculator" className="text-primary hover:underline">Currency Exchange</a></h4><p className="text-sm text-muted-foreground">Spot conversions for PPP compare.</p></div>
            <div className="p-4 border rounded-lg hover:bg-muted/50 transition-colors"><h4 className="font-semibold mb-2"><a href="/category/finance/currency-forward-points-calculator" className="text-primary hover:underline">Currency Forward Points</a></h4><p className="text-sm text-muted-foreground">Premium/discount vs spot.</p></div>
          </div>
        </CardContent>
      </Card>

      <Card>
        <CardHeader><CardTitle className="flex items-center gap-2"><Info className="h-5 w-5" /> Complete Guide to PPP</CardTitle></CardHeader>
        <CardContent className="prose prose-sm dark:prose-invert max-w-none"><p>Placeholder for PPP guide.</p><p>Discuss absolute vs relative PPP and limitations.</p></CardContent>
      </Card>

      <Card>
        <CardHeader><CardTitle className="flex items-center gap-2"><Info className="h-5 w-5" /> Frequently Asked Questions</CardTitle><CardDescription>PPP and valuation</CardDescription></CardHeader>
        <CardContent className="space-y-6">
          <div><h4 className="font-semibold mb-2">What is PPP?</h4><p className="text-muted-foreground">A theory that exchange rates adjust to equalize the price of identical goods across countries.</p></div>
          <div><h4 className="font-semibold mb-2">Absolute vs relative PPP?</h4><p className="text-muted-foreground">Absolute uses price levels; relative uses inflation differentials over time.</p></div>
          <div><h4 className="font-semibold mb-2">Why does PPP fail short term?</h4><p className="text-muted-foreground">Non-tradables, frictions, and market segmentation cause deviations.</p></div>
          <div><h4 className="font-semibold mb-2">What basket should I use?</h4><p className="text-muted-foreground">Use a representative, tradable basket to reduce bias.</p></div>
          <div><h4 className="font-semibold mb-2">How accurate is PPP?</h4><p className="text-muted-foreground">Better for long-term comparisons than short-term trading signals.</p></div>
          <div><h4 className="font-semibold mb-2">Can I use CPI?</h4><p className="text-muted-foreground">Yes—CPI-based PPP is common for macro comparisons.</p></div>
          <div><h4 className="font-semibold mb-2">What about taxes and tariffs?</h4><p className="text-muted-foreground">They distort prices; PPP should be interpreted with these in mind.</p></div>
          <div><h4 className="font-semibold mb-2">Does PPP imply fair value?</h4><p className="text-muted-foreground">It suggests long-term anchors but markets can deviate for extended periods.</p></div>
          <div><h4 className="font-semibold mb-2">How do I interpret mispricing %?</h4><p className="text-muted-foreground">A positive value suggests domestic currency overvaluation vs PPP; negative implies undervaluation.</p></div>
          <div><h4 className="font-semibold mb-2">How often should I update prices?</h4><p className="text-muted-foreground">Update when CPI changes materially or when product prices change; quarterly is a practical cadence.</p></div>
        </CardContent>
      </Card>
    </div>
  );
}



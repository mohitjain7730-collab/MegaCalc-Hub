'use client';

import { useState } from 'react';
import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import { z } from 'zod';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Form, FormControl, FormField, FormItem, FormLabel, FormMessage } from '@/components/ui/form';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Divide, DollarSign, Hash, Info } from 'lucide-react';
import Link from 'next/link';

const formSchema = z.object({
  currentShares: z.number().min(1).optional(),
  currentPrice: z.number().min(0.01).optional(),
  splitNumerator: z.number().min(1).optional(),
  splitDenominator: z.number().min(1).optional(),
});

type FormValues = z.infer<typeof formSchema>;

export default function StockSplitImpactCalculator() {
  const [result, setResult] = useState<{
    newShares: number;
    newPrice: number;
    marketValueBefore: number;
    marketValueAfter: number;
    interpretation: string;
  } | null>(null);

  const form = useForm<FormValues>({ resolver: zodResolver(formSchema), defaultValues: { currentShares: undefined, currentPrice: undefined, splitNumerator: undefined, splitDenominator: undefined } });

  const onSubmit = (v: FormValues) => {
    if (v.currentShares == null || v.currentPrice == null || v.splitNumerator == null || v.splitDenominator == null) { setResult(null); return; }
    const ratio = v.splitNumerator / v.splitDenominator; // e.g., 2-for-1 => 2
    const newShares = v.currentShares * ratio;
    const newPrice = v.currentPrice / ratio;
    const mvBefore = v.currentShares * v.currentPrice;
    const mvAfter = newShares * newPrice;
    setResult({ newShares, newPrice, marketValueBefore: mvBefore, marketValueAfter: mvAfter, interpretation: 'Stock splits and reverse splits preserve total market value (ignoring frictions). Price and share count adjust inversely.' });
  };

  return (
    <div className="space-y-8">
      <Card>
        <CardHeader><CardTitle className="flex items-center gap-2"><Divide className="h-5 w-5" /> Stock Split / Reverse Split Impact</CardTitle><CardDescription>See how shares and price change under a split</CardDescription></CardHeader>
        <CardContent>
      <Form {...form}>
        <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-6">
          <div className="grid grid-cols-1 md:grid-cols-4 gap-6">
            <FormField control={form.control} name="currentShares" render={({ field }) => (
              <FormItem><FormLabel className="flex items-center gap-2"><Hash className="h-4 w-4" /> Current Shares</FormLabel><FormControl><Input type="number" step="1" placeholder="e.g., 100" {...field} value={field.value ?? ''} onChange={e=>field.onChange(parseFloat(e.target.value) || undefined)} /></FormControl><FormMessage /></FormItem>
            )} />
            <FormField control={form.control} name="currentPrice" render={({ field }) => (
              <FormItem><FormLabel className="flex items-center gap-2"><DollarSign className="h-4 w-4" /> Current Price</FormLabel><FormControl><Input type="number" step="0.01" placeholder="e.g., 120" {...field} value={field.value ?? ''} onChange={e=>field.onChange(parseFloat(e.target.value) || undefined)} /></FormControl><FormMessage /></FormItem>
            )} />
            <FormField control={form.control} name="splitNumerator" render={({ field }) => (
              <FormItem><FormLabel>Split Numerator</FormLabel><FormControl><Input type="number" step="1" placeholder="e.g., 2" {...field} value={field.value ?? ''} onChange={e=>field.onChange(parseFloat(e.target.value) || undefined)} /></FormControl><FormMessage /></FormItem>
            )} />
            <FormField control={form.control} name="splitDenominator" render={({ field }) => (
              <FormItem><FormLabel>Split Denominator</FormLabel><FormControl><Input type="number" step="1" placeholder="e.g., 1" {...field} value={field.value ?? ''} onChange={e=>field.onChange(parseFloat(e.target.value) || undefined)} /></FormControl><FormMessage /></FormItem>
            )} />
          </div>
          <Button type="submit" className="w-full md:w-auto">Calculate Impact</Button>
        </form>
      </Form>
        </CardContent>
      </Card>

      {result && (
        <div className="space-y-6">
          <Card>
            <CardHeader><CardTitle>Split Result</CardTitle><CardDescription>Share count and price adjustment</CardDescription></CardHeader>
            <CardContent>
              <div className="grid grid-cols-1 md:grid-cols-2 gap-6 mb-6">
                <div className="text-center p-6 bg-primary/5 rounded-lg"><div className="text-sm text-muted-foreground mb-1">New Shares</div><p className="text-3xl font-bold text-primary">{result.newShares.toLocaleString()}</p></div>
                <div className="text-center p-6 bg-green-50 dark:bg-green-950/20 rounded-lg"><div className="text-sm text-muted-foreground mb-1">New Price</div><p className="text-3xl font-bold text-green-600">${result.newPrice.toLocaleString()}</p></div>
              </div>
              <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                <div className="p-4 border rounded"><p className="text-sm text-muted-foreground mb-1">Market Value Before</p><p className="text-xl font-semibold">${result.marketValueBefore.toLocaleString()}</p></div>
                <div className="p-4 border rounded"><p className="text-sm text-muted-foreground mb-1">Market Value After</p><p className="text-xl font-semibold">${result.marketValueAfter.toLocaleString()}</p></div>
              </div>
              <p className="text-sm mt-4">{result.interpretation}</p>
            </CardContent>
          </Card>
        </div>
      )}

      <Card>
        <CardHeader><CardTitle>Related Calculators</CardTitle><CardDescription>Valuation & returns</CardDescription></CardHeader>
        <CardContent>
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
            <div className="p-4 border rounded"><h4 className="font-semibold mb-1"><Link href="/category/finance/compound-interest-calculator" className="text-primary hover:underline">Compound Interest</Link></h4><p className="text-sm text-muted-foreground">Growth over time.</p></div>
            <div className="p-4 border rounded"><h4 className="font-semibold mb-1"><Link href="/category/finance/earnings-per-share-calculator" className="text-primary hover:underline">Earnings per Share</Link></h4><p className="text-sm text-muted-foreground">EPS context for splits.</p></div>
            <div className="p-4 border rounded"><h4 className="font-semibold mb-1"><Link href="/category/finance/price-to-earnings-ratio-calculator" className="text-primary hover:underline">P/E Ratio</Link></h4><p className="text-sm text-muted-foreground">Valuation multiple.</p></div>
            <div className="p-4 border rounded"><h4 className="font-semibold mb-1"><Link href="/category/finance/dividend-yield-calculator" className="text-primary hover:underline">Dividend Yield</Link></h4><p className="text-sm text-muted-foreground">Income rate per price.</p></div>
          </div>
        </CardContent>
      </Card>

      <Card>
        <CardHeader><CardTitle>Complete Guide: Stock Splits</CardTitle></CardHeader>
        <CardContent className="prose prose-sm dark:prose-invert max-w-none"><p>This is a sample line for the complete guide section. You can add your detailed content here.</p><p>This is another sample line for the guide section. Replace these with your comprehensive guide content.</p></CardContent>
      </Card>

      <Card>
        <CardHeader><CardTitle>Frequently Asked Questions</CardTitle><CardDescription>Detailed, SEO‑oriented answers</CardDescription></CardHeader>
        <CardContent className="space-y-4">{[
          ['Why do companies split stocks?', 'To improve liquidity and perceived affordability; fundamentals don’t change.'],
          ['What is a reverse split?', 'Consolidates shares (e.g., 1‑for‑10) to raise the per‑share price, often for listing compliance.'],
          ['Does a split change market value?', 'No. Share count and price adjust inversely; total value is unchanged ignoring frictions.'],
          ['How are fractional shares handled?', 'Brokers may credit cash in lieu or round; policies vary.'],
          ['Do splits affect dividends?', 'Per‑share dividend is adjusted proportionally so total cash remains similar.'],
        ].map(([q,a],i)=> (<div key={i}><h4 className="font-semibold mb-1">{q}</h4><p className="text-sm text-muted-foreground">{a}</p></div>))}</CardContent>
      </Card>
    </div>
  );
}



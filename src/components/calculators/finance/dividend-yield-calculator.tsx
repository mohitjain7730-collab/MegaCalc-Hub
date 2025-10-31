'use client';

import { useState } from 'react';
import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import { z } from 'zod';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Form, FormControl, FormField, FormItem, FormLabel, FormMessage } from '@/components/ui/form';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Percent, DollarSign, TrendingUp, Info } from 'lucide-react';
import Link from 'next/link';

const formSchema = z.object({
  annualDividendPerShare: z.number().min(0).optional(),
  currentSharePrice: z.number().min(0.01).optional(),
  originalCostBasis: z.number().min(0.01).optional(),
});

type FormValues = z.infer<typeof formSchema>;

export default function DividendYieldCalculator() {
  const [result, setResult] = useState<{
    currentYield: number;
    yieldOnCost: number;
    interpretation: string;
    recommendations: string[];
    warnings: string[];
  } | null>(null);

  const form = useForm<FormValues>({ resolver: zodResolver(formSchema), defaultValues: { annualDividendPerShare: undefined, currentSharePrice: undefined, originalCostBasis: undefined } });

  const onSubmit = (v: FormValues) => {
    if (v.annualDividendPerShare == null || v.currentSharePrice == null || v.originalCostBasis == null) { setResult(null); return; }
    const currentYield = (v.annualDividendPerShare / v.currentSharePrice) * 100;
    const yieldOnCost = (v.annualDividendPerShare / v.originalCostBasis) * 100;
    const interp = currentYield >= 4 ? 'High current yield—assess payout sustainability and growth.' : currentYield >= 2 ? 'Moderate yield—balance income with growth prospects.' : 'Low yield—may rely more on price appreciation than income.';
    setResult({
      currentYield: Math.round(currentYield * 100) / 100,
      yieldOnCost: Math.round(yieldOnCost * 100) / 100,
      interpretation: interp,
      recommendations: [
        'Compare yield to sector peers and historical averages',
        'Examine payout ratio and dividend growth streak',
        'Diversify income sources across industries',
      ],
      warnings: [
        'A very high yield can indicate distress',
        'Dividends may be reduced or suspended',
        'Taxes and withholding vary by jurisdiction',
      ],
    });
  };

  return (
    <div className="space-y-8">
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2"><Percent className="h-5 w-5" /> Dividend Yield</CardTitle>
          <CardDescription>Calculate current yield and yield on cost</CardDescription>
        </CardHeader>
        <CardContent>
      <Form {...form}>
        <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-6">
          <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
            <FormField control={form.control} name="annualDividendPerShare" render={({ field }) => (
              <FormItem><FormLabel className="flex items-center gap-2"><DollarSign className="h-4 w-4" /> Annual Dividend/Share</FormLabel><FormControl><Input type="number" step="0.01" placeholder="e.g., 2.00" {...field} value={field.value ?? ''} onChange={e=>field.onChange(parseFloat(e.target.value) || undefined)} /></FormControl><FormMessage /></FormItem>
            )} />
            <FormField control={form.control} name="currentSharePrice" render={({ field }) => (
              <FormItem><FormLabel className="flex items-center gap-2"><DollarSign className="h-4 w-4" /> Current Share Price</FormLabel><FormControl><Input type="number" step="0.01" placeholder="e.g., 50" {...field} value={field.value ?? ''} onChange={e=>field.onChange(parseFloat(e.target.value) || undefined)} /></FormControl><FormMessage /></FormItem>
            )} />
            <FormField control={form.control} name="originalCostBasis" render={({ field }) => (
              <FormItem><FormLabel className="flex items-center gap-2"><TrendingUp className="h-4 w-4" /> Original Cost Basis</FormLabel><FormControl><Input type="number" step="0.01" placeholder="e.g., 35" {...field} value={field.value ?? ''} onChange={e=>field.onChange(parseFloat(e.target.value) || undefined)} /></FormControl><FormMessage /></FormItem>
            )} />
          </div>
          <Button type="submit" className="w-full md:w-auto">Calculate Yield</Button>
        </form>
      </Form>
        </CardContent>
      </Card>

      {result && (
        <div className="space-y-6">
          <Card>
            <CardHeader>
              <div className="flex items-center gap-4"><Percent className="h-8 w-8 text-primary" /><div><CardTitle>Yield Results</CardTitle><CardDescription>Income rate metrics</CardDescription></div></div>
            </CardHeader>
            <CardContent>
              <div className="grid grid-cols-1 md:grid-cols-2 gap-6 mb-6">
                <div className="text-center p-6 bg-primary/5 rounded-lg"><div className="text-sm text-muted-foreground mb-1">Current Yield</div><p className="text-3xl font-bold text-primary">{result.currentYield}%</p></div>
                <div className="text-center p-6 bg-green-50 dark:bg-green-950/20 rounded-lg"><div className="text-sm text-muted-foreground mb-1">Yield on Cost</div><p className="text-3xl font-bold text-green-600">{result.yieldOnCost}%</p></div>
              </div>
              <p className="text-sm">{result.interpretation}</p>
            </CardContent>
          </Card>
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            <Card><CardHeader><CardTitle>Recommendations</CardTitle></CardHeader><CardContent><ul className="space-y-2">{result.recommendations.map((r,i)=>(<li key={i} className="text-sm text-muted-foreground">{r}</li>))}</ul></CardContent></Card>
            <Card><CardHeader><CardTitle>Warning Signs</CardTitle></CardHeader><CardContent><ul className="space-y-2">{result.warnings.map((w,i)=>(<li key={i} className="text-sm text-muted-foreground">{w}</li>))}</ul></CardContent></Card>
          </div>
        </div>
      )}

      <Card>
        <CardHeader><CardTitle>Related Calculators</CardTitle><CardDescription>Income & valuation</CardDescription></CardHeader>
        <CardContent>
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
            <div className="p-4 border rounded"><h4 className="font-semibold mb-1"><Link href="/category/finance/dividend-reinvestment-drip-calculator" className="text-primary hover:underline">DRIP</Link></h4><p className="text-sm text-muted-foreground">Reinvest dividends.</p></div>
            <div className="p-4 border rounded"><h4 className="font-semibold mb-1"><Link href="/category/finance/present-value-calculator" className="text-primary hover:underline">Present Value</Link></h4><p className="text-sm text-muted-foreground">Discount streams.</p></div>
            <div className="p-4 border rounded"><h4 className="font-semibold mb-1"><Link href="/category/finance/real-rate-of-return-calculator" className="text-primary hover:underline">Real Return</Link></h4><p className="text-sm text-muted-foreground">Inflation‑adjusted.</p></div>
            <div className="p-4 border rounded"><h4 className="font-semibold mb-1"><Link href="/category/finance/compound-interest-calculator" className="text-primary hover:underline">Compound Interest</Link></h4><p className="text-sm text-muted-foreground">Growth over time.</p></div>
          </div>
        </CardContent>
      </Card>

      <Card>
        <CardHeader><CardTitle>Complete Guide: Dividend Yield</CardTitle></CardHeader>
        <CardContent className="prose prose-sm dark:prose-invert max-w-none"><p>This is a sample line for the complete guide section. You can add your detailed content here.</p><p>This is another sample line for the guide section. Replace these with your comprehensive guide content.</p></CardContent>
      </Card>

      <Card>
        <CardHeader><CardTitle>Frequently Asked Questions</CardTitle><CardDescription>Detailed, SEO‑oriented answers</CardDescription></CardHeader>
        <CardContent className="space-y-4">{[
          ['What is dividend yield?', 'Annual dividend per share divided by current share price; a snapshot of income rate.'],
          ['What is yield on cost?', 'Annual dividend per share divided by your purchase price—useful for historical tracking.'],
          ['Is a higher yield always better?', 'Not necessarily; investigate payout sustainability and growth prospects.'],
          ['Do special dividends count?', 'Typically excluded from forward yield unless they are recurring.'],
          ['Why does yield change?', 'Price moves and dividend changes both affect yield.'],
          ['How does inflation affect dividends?', 'Real purchasing power of dividends depends on inflation and dividend growth.'],
        ].map(([q,a],i)=> (<div key={i}><h4 className="font-semibold mb-1">{q}</h4><p className="text-sm text-muted-foreground">{a}</p></div>))}</CardContent>
      </Card>
    </div>
  );
}



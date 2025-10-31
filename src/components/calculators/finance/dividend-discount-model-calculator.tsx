'use client';

import { useState } from 'react';
import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import { z } from 'zod';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Form, FormControl, FormField, FormItem, FormLabel, FormMessage } from '@/components/ui/form';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { DollarSign, Percent, Info } from 'lucide-react';
import Link from 'next/link';

const formSchema = z.object({
  nextYearDividend: z.number().min(0).optional(), // D1
  requiredReturn: z.number().min(0.1).max(100).optional(), // %
  constantGrowth: z.number().min(-20).max(50).optional(), // %
});

type FormValues = z.infer<typeof formSchema>;

export default function DividendDiscountModelCalculator() {
  const [result, setResult] = useState<{
    intrinsicValue: number;
    interpretation: string;
    recommendations: string[];
    warnings: string[];
  } | null>(null);

  const form = useForm<FormValues>({ resolver: zodResolver(formSchema), defaultValues: { nextYearDividend: undefined, requiredReturn: undefined, constantGrowth: undefined } });

  const onSubmit = (v: FormValues) => {
    if (v.nextYearDividend == null || v.requiredReturn == null || v.constantGrowth == null) { setResult(null); return; }
    const r = v.requiredReturn / 100;
    const g = v.constantGrowth / 100;
    if (r <= g) {
      setResult({ intrinsicValue: NaN, interpretation: 'Model undefined when growth ≥ required return. Increase required return or reduce growth.', recommendations: ['Cross‑check with multi‑stage models', 'Use sensitivity analysis on r and g'], warnings: ['DDM breaks if r ≤ g', 'High growth often fades over time'] });
      return;
    }
    const value = v.nextYearDividend / (r - g);
    setResult({
      intrinsicValue: Math.round(value * 100) / 100,
      interpretation: 'Intrinsic value under constant‑growth DDM (Gordon) using provided r and g.',
      recommendations: ['Compare with market price for margin of safety', 'Stress‑test inputs ±100 bps', 'Consider multi‑stage DDM for early high growth'],
      warnings: ['Assumes perpetual constant growth', 'Ignores capital structure and buybacks'],
    });
  };

  return (
    <div className="space-y-8">
      <Card>
        <CardHeader><CardTitle>Dividend Discount Model (DDM)</CardTitle><CardDescription>Gordon constant‑growth valuation</CardDescription></CardHeader>
        <CardContent>
      <Form {...form}>
        <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-6">
          <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
            <FormField control={form.control} name="nextYearDividend" render={({ field }) => (
              <FormItem><FormLabel className="flex items-center gap-2"><DollarSign className="h-4 w-4" /> D1 (Next Year Dividend)</FormLabel><FormControl><Input type="number" step="0.01" placeholder="e.g., 2.1" {...field} value={field.value ?? ''} onChange={e=>field.onChange(parseFloat(e.target.value) || undefined)} /></FormControl><FormMessage /></FormItem>
            )} />
            <FormField control={form.control} name="requiredReturn" render={({ field }) => (
              <FormItem><FormLabel className="flex items-center gap-2"><Percent className="h-4 w-4" /> Required Return (%)</FormLabel><FormControl><Input type="number" step="0.01" placeholder="e.g., 9" {...field} value={field.value ?? ''} onChange={e=>field.onChange(parseFloat(e.target.value) || undefined)} /></FormControl><FormMessage /></FormItem>
            )} />
            <FormField control={form.control} name="constantGrowth" render={({ field }) => (
              <FormItem><FormLabel className="flex items-center gap-2"><Percent className="h-4 w-4" /> Constant Growth g (%)</FormLabel><FormControl><Input type="number" step="0.01" placeholder="e.g., 3" {...field} value={field.value ?? ''} onChange={e=>field.onChange(parseFloat(e.target.value) || undefined)} /></FormControl><FormMessage /></FormItem>
            )} />
          </div>
          <Button type="submit" className="w-full md:w-auto">Calculate Intrinsic Value</Button>
        </form>
      </Form>
        </CardContent>
      </Card>

      {result && (
        <div className="space-y-6">
          <Card>
            <CardHeader><div className="flex items-center gap-4"><DollarSign className="h-8 w-8 text-primary" /><div><CardTitle>DDM Result</CardTitle><CardDescription>Constant‑growth valuation</CardDescription></div></div></CardHeader>
            <CardContent>
              <div className="text-center p-6 bg-primary/5 rounded-lg"><div className="text-sm text-muted-foreground mb-1">Intrinsic Value</div><p className="text-3xl font-bold text-primary">{isNaN(result.intrinsicValue) ? '—' : `$${result.intrinsicValue.toLocaleString()}`}</p></div>
              <p className="text-sm mt-4">{result.interpretation}</p>
            </CardContent>
          </Card>
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            <Card><CardHeader><CardTitle>Recommendations</CardTitle></CardHeader><CardContent><ul className="space-y-2">{result.recommendations.map((r,i)=>(<li key={i} className="text-sm text-muted-foreground">{r}</li>))}</ul></CardContent></Card>
            <Card><CardHeader><CardTitle>Warning Signs</CardTitle></CardHeader><CardContent><ul className="space-y-2">{result.warnings.map((w,i)=>(<li key={i} className="text-sm text-muted-foreground">{w}</li>))}</ul></CardContent></Card>
          </div>
        </div>
      )}

      <Card>
        <CardHeader><CardTitle>Related Calculators</CardTitle><CardDescription>Valuation toolkit</CardDescription></CardHeader>
        <CardContent>
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
            <div className="p-4 border rounded"><h4 className="font-semibold mb-1"><Link href="/category/finance/present-value-calculator" className="text-primary hover:underline">Present Value</Link></h4><p className="text-sm text-muted-foreground">Discount cash flows.</p></div>
            <div className="p-4 border rounded"><h4 className="font-semibold mb-1"><Link href="/category/finance/dcf-calculator" className="text-primary hover:underline">DCF</Link></h4><p className="text-sm text-muted-foreground">Multi‑stage valuation.</p></div>
            <div className="p-4 border rounded"><h4 className="font-semibold mb-1"><Link href="/category/finance/dividend-yield-calculator" className="text-primary hover:underline">Dividend Yield</Link></h4><p className="text-sm text-muted-foreground">Income rate.</p></div>
            <div className="p-4 border rounded"><h4 className="font-semibold mb-1"><Link href="/category/finance/real-rate-of-return-calculator" className="text-primary hover:underline">Real Return</Link></h4><p className="text-sm text-muted-foreground">Inflation‑adjusted.</p></div>
          </div>
        </CardContent>
      </Card>

      <Card>
        <CardHeader><CardTitle>Complete Guide: Dividend Discount Model</CardTitle></CardHeader>
        <CardContent className="prose prose-sm dark:prose-invert max-w-none"><p>This is a sample line for the complete guide section. You can add your detailed content here.</p><p>This is another sample line for the guide section. Replace these with your comprehensive guide content.</p></CardContent>
      </Card>

      <Card>
        <CardHeader><CardTitle>Frequently Asked Questions</CardTitle><CardDescription>Detailed, SEO‑oriented answers</CardDescription></CardHeader>
        <CardContent className="space-y-4">{[
          ['When is DDM appropriate?', 'For mature, dividend‑paying companies with relatively stable growth trajectories.'],
          ['What if growth exceeds required return?', 'The model breaks (division by near‑zero). Use more conservative inputs or multi‑stage models.'],
          ['How do buybacks affect DDM?', 'DDM focuses on dividends; total shareholder yield considers buybacks in addition to dividends.'],
          ['How to choose required return?', 'Base it on risk (CAPM), inflation expectations, and opportunity cost.'],
          ['Is DDM the same as Gordon Growth?', 'Yes, this is the constant‑growth special case of DDM.'],
        ].map(([q,a],i)=> (<div key={i}><h4 className="font-semibold mb-1">{q}</h4><p className="text-sm text-muted-foreground">{a}</p></div>))}</CardContent>
      </Card>
    </div>
  );
}



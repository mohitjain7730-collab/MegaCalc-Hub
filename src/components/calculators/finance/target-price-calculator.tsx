'use client';

import { useState } from 'react';
import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import { z } from 'zod';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Form, FormControl, FormField, FormItem, FormLabel, FormMessage } from '@/components/ui/form';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Target, DollarSign, Percent } from 'lucide-react';
import Link from 'next/link';

const formSchema = z.object({
  currentPrice: z.number().min(0.01).optional(),
  desiredReturnPct: z.number().min(-100).max(1000).optional(),
  holdingYears: z.number().min(0).max(50).optional(),
});

type FormValues = z.infer<typeof formSchema>;

export default function TargetPriceCalculator() {
  const [result, setResult] = useState<{ targetSimple: number; targetAnnualized: number; interpretation: string } | null>(null);
  const form = useForm<FormValues>({ resolver: zodResolver(formSchema), defaultValues: { currentPrice: undefined, desiredReturnPct: undefined, holdingYears: undefined as any } });

  const onSubmit = (v: FormValues) => {
    if (v.currentPrice == null || v.desiredReturnPct == null || v.holdingYears == null) { setResult(null); return; }
    const targetSimple = v.currentPrice * (1 + v.desiredReturnPct / 100);
    const targetAnnualized = v.holdingYears > 0 ? v.currentPrice * Math.pow(1 + v.desiredReturnPct / 100, v.holdingYears) : targetSimple;
    setResult({ targetSimple, targetAnnualized, interpretation: 'Target prices based on total desired return and annualized compounding over the holding period.' });
  };

  return (
    <div className="space-y-8">
      <Card>
        <CardHeader><CardTitle className="flex items-center gap-2"><Target className="h-5 w-5" /> Target Price</CardTitle><CardDescription>Price needed to meet return goals</CardDescription></CardHeader>
        <CardContent>
      <Form {...form}>
        <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-6">
          <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
            <FormField control={form.control} name="currentPrice" render={({ field }) => (
              <FormItem><FormLabel className="flex items-center gap-2"><DollarSign className="h-4 w-4" /> Current Price</FormLabel><FormControl><Input type="number" step="0.01" placeholder="e.g., 50" {...field} value={field.value ?? ''} onChange={e=>field.onChange(parseFloat(e.target.value) || undefined)} /></FormControl><FormMessage /></FormItem>
            )} />
            <FormField control={form.control} name="desiredReturnPct" render={({ field }) => (
              <FormItem><FormLabel className="flex items-center gap-2"><Percent className="h-4 w-4" /> Desired Return (%)</FormLabel><FormControl><Input type="number" step="0.1" placeholder="e.g., 20" {...field} value={field.value ?? ''} onChange={e=>field.onChange(parseFloat(e.target.value) || undefined)} /></FormControl><FormMessage /></FormItem>
            )} />
            <FormField control={form.control} name="holdingYears" render={({ field }) => (
              <FormItem><FormLabel>Holding Period (years)</FormLabel><FormControl><Input type="number" step="0.1" placeholder="e.g., 2" {...field} value={field.value ?? ''} onChange={e=>field.onChange(parseFloat(e.target.value) || undefined)} /></FormControl><FormMessage /></FormItem>
            )} />
          </div>
          <Button type="submit" className="w-full md:w-auto">Calculate Target</Button>
        </form>
      </Form>
        </CardContent>
      </Card>

      {result && (
        <Card>
          <CardHeader><CardTitle>Result</CardTitle><CardDescription>Required prices</CardDescription></CardHeader>
          <CardContent>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
              <div className="text-center p-6 bg-primary/5 rounded-lg"><div className="text-sm text-muted-foreground mb-1">Simple Target Price</div><p className="text-3xl font-bold text-primary">${result.targetSimple.toFixed(2)}</p></div>
              <div className="text-center p-6 bg-green-50 dark:bg-green-950/20 rounded-lg"><div className="text-sm text-muted-foreground mb-1">Annualized Target Price</div><p className="text-3xl font-bold text-green-600">${result.targetAnnualized.toFixed(2)}</p></div>
            </div>
            <p className="text-sm mt-4">{result.interpretation}</p>
          </CardContent>
        </Card>
      )}

      <Card>
        <CardHeader><CardTitle>Related Calculators</CardTitle><CardDescription>Plan returns and valuation</CardDescription></CardHeader>
        <CardContent>
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
            <div className="p-4 border rounded"><h4 className="font-semibold mb-1"><Link href="/category/finance/cagr-calculator" className="text-primary hover:underline">CAGR</Link></h4><p className="text-sm text-muted-foreground">Annualized returns.</p></div>
            <div className="p-4 border rounded"><h4 className="font-semibold mb-1"><Link href="/category/finance/compound-interest-calculator" className="text-primary hover:underline">Compound Interest</Link></h4><p className="text-sm text-muted-foreground">Growth modeling.</p></div>
            <div className="p-4 border rounded"><h4 className="font-semibold mb-1"><Link href="/category/finance/present-value-calculator" className="text-primary hover:underline">Present Value</Link></h4><p className="text-sm text-muted-foreground">Discounting tool.</p></div>
            <div className="p-4 border rounded"><h4 className="font-semibold mb-1"><Link href="/category/finance/real-rate-of-return-calculator" className="text-primary hover:underline">Real Return</Link></h4><p className="text-sm text-muted-foreground">After inflation.</p></div>
          </div>
        </CardContent>
      </Card>

      <Card>
        <CardHeader><CardTitle>Complete Guide: Setting Target Prices</CardTitle></CardHeader>
        <CardContent className="prose prose-sm dark:prose-invert max-w-none">
          <p>This is a sample line for the complete guide section. You can add your detailed content here.</p>
          <p>This is another sample line for the guide section. Replace these with your comprehensive guide content.</p>
        </CardContent>
      </Card>

      <Card>
        <CardHeader><CardTitle>Frequently Asked Questions</CardTitle><CardDescription>Detailed, SEO‑oriented answers</CardDescription></CardHeader>
        <CardContent className="space-y-4">{[
          ['Should I use simple or annualized target?', 'Use simple for short trades; use annualized when you have a multi‑year horizon to reflect compounding.'],
          ['Do dividends affect targets?', 'Yes—total return includes dividends; this tool focuses on price targets. Combine with dividend estimates for complete planning.'],
          ['What risks matter most?', 'Earnings surprises, valuation compression/expansion, macro rates, and sector rotation can derail targets.'],
          ['How often to revisit targets?', 'Reassess when fundamentals or rates change, or on a quarterly cadence with new financials.'],
          ['What if my holding period changes?', 'Recalculate using the new horizon; annualized targets are sensitive to time.'],
          ['Is desired return nominal or real?', 'This calculator uses nominal percentages; compare with real returns by considering inflation.'],
          ['How to combine with stop‑loss?', 'Set independent risk limits; a target price does not replace prudent downside management.'],
          ['Can I include expected multiple expansion?', 'Yes—translate your thesis into a required price and input it as the desired return.'],
        ].map(([q,a],i)=> (<div key={i}><h4 className="font-semibold mb-1">{q}</h4><p className="text-sm text-muted-foreground">{a}</p></div>))}</CardContent>
      </Card>
    </div>
  );
}



'use client';

import { useState } from 'react';
import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import { z } from 'zod';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Form, FormControl, FormField, FormItem, FormLabel, FormMessage } from '@/components/ui/form';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Percent, DollarSign, Calendar } from 'lucide-react';

const formSchema = z.object({
  beginningValue: z.number().min(0.0001).optional(),
  endingValue: z.number().min(0.0001).optional(),
  years: z.number().min(0.0001).optional(),
});

type FormValues = z.infer<typeof formSchema>;

export default function CagrCalculator() {
  const [result, setResult] = useState<{ cagrPct: number; interpretation: string } | null>(null);
  const form = useForm<FormValues>({ resolver: zodResolver(formSchema), defaultValues: { beginningValue: undefined, endingValue: undefined, years: undefined } });

  const onSubmit = (v: FormValues) => {
    if (v.beginningValue == null || v.endingValue == null || v.years == null) { setResult(null); return; }
    const cagr = Math.pow(v.endingValue / v.beginningValue, 1 / v.years) - 1;
    setResult({ cagrPct: Math.round(cagr * 10000) / 100, interpretation: 'Compound annual growth rate based on start, end, and time horizon.' });
  };

  return (
    <div className="space-y-8">
      <Card>
        <CardHeader><CardTitle>CAGR (Compound Annual Growth Rate)</CardTitle><CardDescription>Annualized growth between two values</CardDescription></CardHeader>
        <CardContent>
      <Form {...form}>
        <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-6">
          <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
            <FormField control={form.control} name="beginningValue" render={({ field }) => (
              <FormItem><FormLabel className="flex items-center gap-2"><DollarSign className="h-4 w-4" /> Beginning Value</FormLabel><FormControl><Input type="number" step="0.01" placeholder="e.g., 10000" {...field} value={field.value ?? ''} onChange={e=>field.onChange(parseFloat(e.target.value) || undefined)} /></FormControl><FormMessage /></FormItem>
            )} />
            <FormField control={form.control} name="endingValue" render={({ field }) => (
              <FormItem><FormLabel><DollarSign className="h-4 w-4" /> Ending Value</FormLabel><FormControl><Input type="number" step="0.01" placeholder="e.g., 15000" {...field} value={field.value ?? ''} onChange={e=>field.onChange(parseFloat(e.target.value) || undefined)} /></FormControl><FormMessage /></FormItem>
            )} />
            <FormField control={form.control} name="years" render={({ field }) => (
              <FormItem><FormLabel className="flex items-center gap-2"><Calendar className="h-4 w-4" /> Years</FormLabel><FormControl><Input type="number" step="0.01" placeholder="e.g., 3" {...field} value={field.value ?? ''} onChange={e=>field.onChange(parseFloat(e.target.value) || undefined)} /></FormControl><FormMessage /></FormItem>
            )} />
          </div>
          <Button type="submit" className="w-full md:w-auto">Calculate CAGR</Button>
        </form>
      </Form>
        </CardContent>
      </Card>

      {result && (
        <Card>
          <CardHeader><CardTitle>Result</CardTitle><CardDescription>Annualized return</CardDescription></CardHeader>
          <CardContent><div className="text-center p-6 bg-primary/5 rounded-lg"><div className="text-sm text-muted-foreground mb-1">CAGR</div><p className="text-3xl font-bold text-primary">{result.cagrPct}%</p></div><p className="text-sm mt-4">{result.interpretation}</p></CardContent>
        </Card>
      )}

      <Card>
        <CardHeader><CardTitle>Related Calculators</CardTitle><CardDescription>Compare return metrics</CardDescription></CardHeader>
        <CardContent>
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
            <div className="p-4 border rounded"><h4 className="font-semibold mb-1"><a href="/category/finance/holding-period-return-hpr-calculator" className="text-primary hover:underline">Holding Period Return</a></h4><p className="text-sm text-muted-foreground">Total period return.</p></div>
            <div className="p-4 border rounded"><h4 className="font-semibold mb-1"><a href="/category/finance/real-rate-of-return-calculator" className="text-primary hover:underline">Real Return</a></h4><p className="text-sm text-muted-foreground">Inflation‑adjusted.</p></div>
            <div className="p-4 border rounded"><h4 className="font-semibold mb-1"><a href="/category/finance/compound-interest-calculator" className="text-primary hover:underline">Compound Interest</a></h4><p className="text-sm text-muted-foreground">Growth projection.</p></div>
            <div className="p-4 border rounded"><h4 className="font-semibold mb-1"><a href="/category/finance/weighted-average-return-calculator" className="text-primary hover:underline">Weighted Return</a></h4><p className="text-sm text-muted-foreground">Portfolio combine.</p></div>
          </div>
        </CardContent>
      </Card>

      <Card>
        <CardHeader><CardTitle>Complete Guide: CAGR</CardTitle></CardHeader>
        <CardContent className="prose prose-sm dark:prose-invert max-w-none"><p>This is a sample line for the complete guide section. You can add your detailed content here.</p><p>This is another sample line for the guide section. Replace these with your comprehensive guide content.</p></CardContent>
      </Card>

      <Card>
        <CardHeader><CardTitle>Frequently Asked Questions</CardTitle><CardDescription>Detailed, SEO‑oriented answers</CardDescription></CardHeader>
        <CardContent className="space-y-4">{[
          ['How is CAGR different from average return?', 'CAGR is the geometric mean, capturing compounding; arithmetic averages can overstate returns with volatility.'],
          ['Does timing of cash flows matter?', 'CAGR ignores intermediate cash flows; use IRR/XIRR when timing matters.'],
          ['What if ending value < beginning?', 'CAGR will be negative, reflecting a compounded decline.'],
          ['Can I compare funds with CAGR?', 'Yes, but also compare volatility, drawdowns, and fees for a fuller picture.'],
          ['Is CAGR sensitive to start/end dates?', 'Yes—different windows can produce very different annualized rates; use multiple horizons.'],
          ['What about fees and taxes?', 'Use after‑fee, after‑tax values to reflect realized investor experience.'],
          ['Is CAGR appropriate for cash flows?', 'No; use money‑weighted returns like IRR when contributions/withdrawals occur.'],
          ['Can CAGR be more than 100%?', 'Yes for fast‑growing assets over short horizons—but sustainability is a separate question.'],
        ].map(([q,a],i)=> (<div key={i}><h4 className="font-semibold mb-1">{q}</h4><p className="text-sm text-muted-foreground">{a}</p></div>))}</CardContent>
      </Card>
    </div>
  );
}



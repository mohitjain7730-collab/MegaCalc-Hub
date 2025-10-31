'use client';

import { useState } from 'react';
import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import { z } from 'zod';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Form, FormControl, FormField, FormItem, FormLabel, FormMessage } from '@/components/ui/form';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Percent, DollarSign } from 'lucide-react';

const formSchema = z.object({
  beginningValue: z.number().min(0.0001).optional(),
  endingValue: z.number().min(0).optional(),
  income: z.number().min(0).optional(), // dividends, coupons, etc.
});

type FormValues = z.infer<typeof formSchema>;

export default function HoldingPeriodReturnCalculator() {
  const [result, setResult] = useState<{ hprPct: number; interpretation: string } | null>(null);
  const form = useForm<FormValues>({ resolver: zodResolver(formSchema), defaultValues: { beginningValue: undefined, endingValue: undefined, income: 0 as any } });

  const onSubmit = (v: FormValues) => {
    if (v.beginningValue == null || v.endingValue == null || v.income == null) { setResult(null); return; }
    const hpr = ((v.endingValue + v.income - v.beginningValue) / v.beginningValue) * 100;
    setResult({ hprPct: Math.round(hpr * 100) / 100, interpretation: 'Total holding period return including income.' });
  };

  return (
    <div className="space-y-8">
      <Card>
        <CardHeader><CardTitle>Holding Period Return (HPR)</CardTitle><CardDescription>Total return including income</CardDescription></CardHeader>
        <CardContent>
      <Form {...form}>
        <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-6">
          <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
            <FormField control={form.control} name="beginningValue" render={({ field }) => (
              <FormItem><FormLabel className="flex items-center gap-2"><DollarSign className="h-4 w-4" /> Beginning Value</FormLabel><FormControl><Input type="number" step="0.01" placeholder="e.g., 1000" {...field} value={field.value ?? ''} onChange={e=>field.onChange(parseFloat(e.target.value) || undefined)} /></FormControl><FormMessage /></FormItem>
            )} />
            <FormField control={form.control} name="endingValue" render={({ field }) => (
              <FormItem><FormLabel>Ending Value</FormLabel><FormControl><Input type="number" step="0.01" placeholder="e.g., 1120" {...field} value={field.value ?? ''} onChange={e=>field.onChange(parseFloat(e.target.value) || undefined)} /></FormControl><FormMessage /></FormItem>
            )} />
            <FormField control={form.control} name="income" render={({ field }) => (
              <FormItem><FormLabel>Income (dividends)</FormLabel><FormControl><Input type="number" step="0.01" placeholder="e.g., 30" {...field} value={field.value ?? ''} onChange={e=>field.onChange(parseFloat(e.target.value) || 0)} /></FormControl><FormMessage /></FormItem>
            )} />
          </div>
          <Button type="submit" className="w-full md:w-auto">Calculate HPR</Button>
        </form>
      </Form>
        </CardContent>
      </Card>

      {result && (
        <Card>
          <CardHeader><CardTitle>Result</CardTitle><CardDescription>Total return</CardDescription></CardHeader>
          <CardContent><div className="text-center p-6 bg-primary/5 rounded-lg"><div className="text-sm text-muted-foreground mb-1">HPR</div><p className="text-3xl font-bold text-primary">{result.hprPct}%</p></div><p className="text-sm mt-4">{result.interpretation}</p></CardContent>
        </Card>
      )}

      <Card>
        <CardHeader><CardTitle>Related Calculators</CardTitle><CardDescription>Compare returns and risk</CardDescription></CardHeader>
        <CardContent>
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
            <div className="p-4 border rounded"><h4 className="font-semibold mb-1"><a href="/category/finance/cagr-calculator" className="text-primary hover:underline">CAGR</a></h4><p className="text-sm text-muted-foreground">Annualized growth.</p></div>
            <div className="p-4 border rounded"><h4 className="font-semibold mb-1"><a href="/category/finance/real-rate-of-return-calculator" className="text-primary hover:underline">Real Return</a></h4><p className="text-sm text-muted-foreground">Inflation‑adjusted.</p></div>
            <div className="p-4 border rounded"><h4 className="font-semibold mb-1"><a href="/category/finance/weighted-average-return-calculator" className="text-primary hover:underline">Weighted Return</a></h4><p className="text-sm text-muted-foreground">Portfolio combine.</p></div>
            <div className="p-4 border rounded"><h4 className="font-semibold mb-1"><a href="/category/finance/capital-gain-loss-calculator" className="text-primary hover:underline">Capital Gain/Loss</a></h4><p className="text-sm text-muted-foreground">Proceeds & taxes.</p></div>
          </div>
        </CardContent>
      </Card>

      <Card>
        <CardHeader><CardTitle>Complete Guide: Holding Period Return</CardTitle></CardHeader>
        <CardContent className="prose prose-sm dark:prose-invert max-w-none"><p>This is a sample line for the complete guide section. You can add your detailed content here.</p><p>This is another sample line for the guide section. Replace these with your comprehensive guide content.</p></CardContent>
      </Card>

      <Card>
        <CardHeader><CardTitle>Frequently Asked Questions</CardTitle><CardDescription>Detailed, SEO‑oriented answers</CardDescription></CardHeader>
        <CardContent className="space-y-4">{[
          ['Is HPR annualized?', 'No. HPR is the total return over the holding period. Use CAGR to annualize.'],
          ['What income counts?', 'Dividends, coupons, or distributions received during the period are included.'],
          ['Do fees matter?', 'Include fees by reducing ending value or adding them to beginning cost; this tool assumes inputs reflect fees as you prefer.'],
          ['How to compare different periods?', 'Convert to CAGR for like‑for‑like comparisons across different durations.'],
          ['Does reinvestment change HPR?', 'Reinvested income increases ending value and therefore lifts the total holding period return.'],
          ['Is HPR impacted by inflation?', 'HPR is nominal; evaluate real return by adjusting for inflation separately.'],
          ['What if the ending value is zero?', 'The return is −100%; consider risk controls to avoid permanent loss.'],
          ['How often to measure?', 'Many investors compute HPR per trade/position and then compare annualized metrics across strategies.'],
        ].map(([q,a],i)=> (<div key={i}><h4 className="font-semibold mb-1">{q}</h4><p className="text-sm text-muted-foreground">{a}</p></div>))}</CardContent>
      </Card>
    </div>
  );
}



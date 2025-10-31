'use client';

import { useState } from 'react';
import { useForm, useFieldArray } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import { z } from 'zod';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Form, FormControl, FormField, FormItem, FormLabel, FormMessage } from '@/components/ui/form';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Percent, Plus, Trash2 } from 'lucide-react';

const itemSchema = z.object({ weightPct: z.number().min(0).max(100).optional(), returnPct: z.number().min(-100).max(1000).optional() });
const formSchema = z.object({ items: z.array(itemSchema).min(1) });
type FormValues = z.infer<typeof formSchema>;

export default function WeightedAverageReturnCalculator() {
  const [result, setResult] = useState<{ weightedReturn: number; interpretation: string } | null>(null);
  const form = useForm<FormValues>({ resolver: zodResolver(formSchema), defaultValues: { items: [{ weightPct: undefined as any, returnPct: undefined as any }] as any } });
  const { fields, append, remove } = useFieldArray({ control: form.control, name: 'items' });

  const onSubmit = (v: FormValues) => {
    const valid = v.items.filter(it => it.weightPct != null && it.returnPct != null);
    const totalW = valid.reduce((s, it) => s + (it.weightPct as number), 0);
    const wr = valid.reduce((s, it) => s + ((it.weightPct as number) / 100) * (it.returnPct as number), 0);
    const interp = Math.abs(totalW - 100) < 0.01 ? 'Portfolio weights sum to 100%.' : `Weights sum to ${totalW}%; results scaled by provided weights.`;
    setResult({ weightedReturn: Math.round(wr * 100) / 100, interpretation: interp });
  };

  return (
    <div className="space-y-8">
      <Card>
        <CardHeader><CardTitle>Weighted Average Return</CardTitle><CardDescription>Combine returns by portfolio weights</CardDescription></CardHeader>
        <CardContent>
      <Form {...form}>
        <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-4">
          {fields.map((f, i) => (
            <div key={f.id} className="grid grid-cols-1 md:grid-cols-3 gap-3 items-end">
              <FormField control={form.control} name={`items.${i}.weightPct` as const} render={({ field }) => (
                <FormItem><FormLabel>Weight (%)</FormLabel><FormControl><Input type="number" step="0.1" {...field} value={field.value as any} onChange={e=>field.onChange(parseFloat(e.target.value))} /></FormControl><FormMessage /></FormItem>
              )} />
              <FormField control={form.control} name={`items.${i}.returnPct` as const} render={({ field }) => (
                <FormItem><FormLabel className="flex items-center gap-2"><Percent className="h-4 w-4" /> Return (%)</FormLabel><FormControl><Input type="number" step="0.1" {...field} value={field.value as any} onChange={e=>field.onChange(parseFloat(e.target.value))} /></FormControl><FormMessage /></FormItem>
              )} />
              <Button type="button" variant="destructive" onClick={() => remove(i)} className="md:w-auto"><Trash2 className="h-4 w-4" /></Button>
            </div>
          ))}
          <div className="flex items-center gap-3">
            <Button type="button" onClick={() => append({ weightPct: undefined as any, returnPct: undefined as any })}><Plus className="h-4 w-4 mr-2" />Add Item</Button>
            <Button type="submit" className="md:w-auto">Calculate Weighted Return</Button>
          </div>
        </form>
      </Form>
        </CardContent>
      </Card>

      {result && (
        <Card>
          <CardHeader><CardTitle>Result</CardTitle><CardDescription>Portfolio weighted return</CardDescription></CardHeader>
          <CardContent><div className="text-center p-6 bg-primary/5 rounded-lg"><div className="text-sm text-muted-foreground mb-1">Weighted Return</div><p className="text-3xl font-bold text-primary">{result.weightedReturn}%</p></div><p className="text-sm mt-4">{result.interpretation}</p></CardContent>
        </Card>
      )}
      <Card>
        <CardHeader><CardTitle>Related Calculators</CardTitle><CardDescription>Portfolio analytics</CardDescription></CardHeader>
        <CardContent>
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
            <div className="p-4 border rounded"><h4 className="font-semibold mb-1"><a href="/category/finance/cagr-calculator" className="text-primary hover:underline">CAGR</a></h4><p className="text-sm text-muted-foreground">Annualized growth.</p></div>
            <div className="p-4 border rounded"><h4 className="font-semibold mb-1"><a href="/category/finance/holding-period-return-hpr-calculator" className="text-primary hover:underline">HPR</a></h4><p className="text-sm text-muted-foreground">Total return.</p></div>
            <div className="p-4 border rounded"><h4 className="font-semibold mb-1"><a href="/category/finance/portfolio-variance-calculator" className="text-primary hover:underline">Portfolio Variance</a></h4><p className="text-sm text-muted-foreground">Risk metric.</p></div>
            <div className="p-4 border rounded"><h4 className="font-semibold mb-1"><a href="/category/finance/return-on-investment-calculator" className="text-primary hover:underline">ROI</a></h4><p className="text-sm text-muted-foreground">Simple return.</p></div>
          </div>
        </CardContent>
      </Card>

      <Card>
        <CardHeader><CardTitle>Complete Guide: Weighted Average Return</CardTitle></CardHeader>
        <CardContent className="prose prose-sm dark:prose-invert max-w-none"><p>This is a sample line for the complete guide section. You can add your detailed content here.</p><p>This is another sample line for the guide section. Replace these with your comprehensive guide content.</p></CardContent>
      </Card>

      <Card>
        <CardHeader><CardTitle>Frequently Asked Questions</CardTitle><CardDescription>Detailed, SEO‑oriented answers</CardDescription></CardHeader>
        <CardContent className="space-y-4">{[
          ['Should weights sum to 100%?', 'Ideally yes. If not, the result reflects the provided scaling as entered.'],
          ['Does this include covariance or risk?', 'No. This is a return aggregator; use variance/Sharpe tools for risk.'],
          ['Can a weight be negative?', 'Short exposures can be modeled with negative weights, but this tool expects non‑negative inputs.'],
          ['What about fees?', 'You can input net returns after fees for each component.'],
          ['What if my weights change over time?', 'This tool assumes a static snapshot; for time‑varying weights, compute period by period and chain the results.'],
          ['Equal‑weight vs cap‑weight?', 'Equal‑weight gives each component the same influence; cap‑weight uses portfolio allocation percentages.'],
          ['How many components can I add?', 'As many as needed—ensure your weights reflect the full portfolio coverage.'],
          ['Does order matter?', 'No; only values matter in the weighted sum.'],
        ].map(([q,a],i)=> (<div key={i}><h4 className="font-semibold mb-1">{q}</h4><p className="text-sm text-muted-foreground">{a}</p></div>))}</CardContent>
      </Card>
    </div>
  );
}



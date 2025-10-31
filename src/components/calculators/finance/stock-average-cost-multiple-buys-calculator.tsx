'use client';

import { useState } from 'react';
import { useForm, useFieldArray } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import { z } from 'zod';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Form, FormControl, FormField, FormItem, FormLabel, FormMessage } from '@/components/ui/form';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Plus, Trash2, DollarSign, Hash } from 'lucide-react';
import Link from 'next/link';

const lotSchema = z.object({ shares: z.number().min(0.0001).optional(), price: z.number().min(0.0001).optional(), fee: z.number().min(0).optional() });
const formSchema = z.object({ lots: z.array(lotSchema).min(1) });
type FormValues = z.infer<typeof formSchema>;

export default function StockAverageCostMultipleBuysCalculator() {
  const [result, setResult] = useState<{ totalShares: number; totalCost: number; averageCost: number; interpretation: string } | null>(null);
  const form = useForm<FormValues>({ resolver: zodResolver(formSchema), defaultValues: { lots: [{ shares: undefined as any, price: undefined as any, fee: undefined as any }] as any } });
  const { fields, append, remove } = useFieldArray({ control: form.control, name: 'lots' });

  const onSubmit = (v: FormValues) => {
    let totalShares = 0; let totalCost = 0;
    v.lots.forEach(l => { if (l.shares != null && l.price != null) { totalShares += l.shares; totalCost += l.shares * l.price + (l.fee ?? 0); } });
    const avg = totalCost / totalShares;
    setResult({ totalShares, totalCost, averageCost: avg, interpretation: 'Average cost per share including fees across all purchase lots.' });
  };

  return (
    <div className="space-y-8">
      <Card>
        <CardHeader><CardTitle>Stock Average Cost (Multiple Buys)</CardTitle><CardDescription>Compute weighted cost basis with fees</CardDescription></CardHeader>
        <CardContent>
      <Form {...form}>
        <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-4">
          <div className="space-y-3">
            {fields.map((f, i) => (
              <div key={f.id} className="grid grid-cols-1 md:grid-cols-4 gap-3 items-end">
                <FormField control={form.control} name={`lots.${i}.shares` as const} render={({ field }) => (
                  <FormItem><FormLabel className="flex items-center gap-2"><Hash className="h-4 w-4" /> Shares</FormLabel><FormControl><Input type="number" step="0.0001" {...field} value={field.value as any} onChange={e=>field.onChange(parseFloat(e.target.value))} /></FormControl><FormMessage /></FormItem>
                )} />
                <FormField control={form.control} name={`lots.${i}.price` as const} render={({ field }) => (
                  <FormItem><FormLabel className="flex items-center gap-2"><DollarSign className="h-4 w-4" /> Price</FormLabel><FormControl><Input type="number" step="0.01" {...field} value={field.value as any} onChange={e=>field.onChange(parseFloat(e.target.value))} /></FormControl><FormMessage /></FormItem>
                )} />
                <FormField control={form.control} name={`lots.${i}.fee` as const} render={({ field }) => (
                  <FormItem><FormLabel>Fee (optional)</FormLabel><FormControl><Input type="number" step="0.01" {...field} value={field.value as any ?? ''} onChange={e=>field.onChange(parseFloat(e.target.value) || 0)} /></FormControl><FormMessage /></FormItem>
                )} />
                <Button type="button" variant="destructive" onClick={() => remove(i)} className="md:w-auto"><Trash2 className="h-4 w-4" /></Button>
              </div>
            ))}
          </div>
          <div className="flex items-center gap-3">
            <Button type="button" onClick={() => append({ shares: undefined as any, price: undefined as any, fee: undefined as any })}><Plus className="h-4 w-4 mr-2" />Add Lot</Button>
            <Button type="submit" className="md:w-auto">Calculate Average Cost</Button>
          </div>
        </form>
      </Form>
        </CardContent>
      </Card>

      {result && (
        <Card>
          <CardHeader><CardTitle>Result</CardTitle><CardDescription>Weighted average cost basis</CardDescription></CardHeader>
          <CardContent>
            <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
              <div className="text-center p-6 bg-primary/5 rounded-lg"><div className="text-sm text-muted-foreground mb-1">Total Shares</div><p className="text-3xl font-bold text-primary">{result.totalShares.toFixed(4)}</p></div>
              <div className="text-center p-6 bg-green-50 dark:bg-green-950/20 rounded-lg"><div className="text-sm text-muted-foreground mb-1">Total Cost</div><p className="text-3xl font-bold text-green-600">${result.totalCost.toLocaleString()}</p></div>
              <div className="text-center p-6 bg-primary/5 rounded-lg"><div className="text-sm text-muted-foreground mb-1">Average Cost / Share</div><p className="text-3xl font-bold text-primary">${result.averageCost.toFixed(4)}</p></div>
            </div>
            <p className="text-sm mt-4">{result.interpretation}</p>
          </CardContent>
        </Card>
      )}

      <Card>
        <CardHeader><CardTitle>Related Calculators</CardTitle><CardDescription>More investing tools</CardDescription></CardHeader>
        <CardContent>
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
            <div className="p-4 border rounded"><h4 className="font-semibold mb-1"><Link href="/category/finance/stock-split-impact-calculator" className="text-primary hover:underline">Stock Split Impact</Link></h4><p className="text-sm text-muted-foreground">Share count changes.</p></div>
            <div className="p-4 border rounded"><h4 className="font-semibold mb-1"><Link href="/category/finance/dividend-yield-calculator" className="text-primary hover:underline">Dividend Yield</Link></h4><p className="text-sm text-muted-foreground">Income rate.</p></div>
            <div className="p-4 border rounded"><h4 className="font-semibold mb-1"><Link href="/category/finance/present-value-calculator" className="text-primary hover:underline">Present Value</Link></h4><p className="text-sm text-muted-foreground">Discount cash flows.</p></div>
            <div className="p-4 border rounded"><h4 className="font-semibold mb-1"><Link href="/category/finance/compound-interest-calculator" className="text-primary hover:underline">Compound Interest</Link></h4><p className="text-sm text-muted-foreground">Growth over time.</p></div>
          </div>
        </CardContent>
      </Card>

      <Card>
        <CardHeader><CardTitle>Complete Guide: Average Cost Basis</CardTitle></CardHeader>
        <CardContent className="prose prose-sm dark:prose-invert max-w-none"><p>This is a sample line for the complete guide section. You can add your detailed content here.</p><p>This is another sample line for the guide section. Replace these with your comprehensive guide content.</p></CardContent>
      </Card>

      <Card>
        <CardHeader><CardTitle>Frequently Asked Questions</CardTitle><CardDescription>Detailed, SEO‑oriented answers</CardDescription></CardHeader>
        <CardContent className="space-y-4">{[
          ['What is average cost basis?', 'The total cost (including fees) divided by total shares acquired across purchase lots.'],
          ['Does FIFO/LIFO matter here?', 'This tool computes average cost; tax reporting may use FIFO, LIFO, or specific identification depending on regulations.'],
          ['Should I include fees?', 'Yes—adding commissions/fees provides a more accurate per‑share cost and aligns with most cost‑basis rules.'],
          ['Can I use fractional shares?', 'Yes. Enter decimal shares; the calculator supports fractional positions common with DRIPs.'],
          ['How do stock splits affect cost?', 'After a split, cost per share adjusts inversely while total cost stays the same. The average cost method reflects this automatically when you update share counts.'],
          ['What about multiple currencies?', 'Convert all lot costs to a single reporting currency before calculating the average.'],
          ['Do dividend reinvestments count as lots?', 'Yes—each reinvestment is a new lot with its own shares, price, and potential fees.'],
          ['How often should I update?', 'Record each purchase, split, or DRIP event promptly to keep your basis accurate.'],
        ].map(([q,a],i)=> (<div key={i}><h4 className="font-semibold mb-1">{q}</h4><p className="text-sm text-muted-foreground">{a}</p></div>))}</CardContent>
      </Card>
    </div>
  );
}



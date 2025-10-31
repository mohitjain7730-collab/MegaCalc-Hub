'use client';

import { useState } from 'react';
import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import { z } from 'zod';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Form, FormControl, FormField, FormItem, FormLabel, FormMessage } from '@/components/ui/form';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { DollarSign, Percent } from 'lucide-react';

const formSchema = z.object({
  averageCost: z.number().min(0.0001).optional(),
  shares: z.number().min(0.0001).optional(),
  sellCommission: z.number().min(0).optional(),
  taxRatePct: z.number().min(0).max(100).optional(), // applies to gains only
});

type FormValues = z.infer<typeof formSchema>;

export default function BreakEvenStockSalePriceCalculator() {
  const [result, setResult] = useState<{ price: number; interpretation: string } | null>(null);
  const form = useForm<FormValues>({ resolver: zodResolver(formSchema), defaultValues: { averageCost: undefined, shares: undefined, sellCommission: undefined as any, taxRatePct: undefined as any } });

  const onSubmit = (v: FormValues) => {
    if (v.averageCost == null || v.shares == null || v.sellCommission == null || v.taxRatePct == null) { setResult(null); return; }
    // Break-even equation: (P*shares - commission - tax_on_gain) = cost_basis
    // tax_on_gain = max(0, (P - cost_per_share) * shares) * tax
    // Solve for P; piecewise because tax applies only if P > cost.
    const basis = v.averageCost * v.shares;
    const t = v.taxRatePct / 100;
    // Assume P >= cost (typical case); P*sh - comm - (P - cost)*sh*t = basis
    // => P*sh*(1 - t) + cost*sh*t - comm = basis => P = (basis + comm - cost*sh*t) / (sh*(1 - t))
    let price = (basis + v.sellCommission - v.averageCost * v.shares * t) / (v.shares * (1 - t || 1));
    if (price < v.averageCost) {
      // In loss region taxes do not apply on negative gain (ignoring deductions): P*sh - comm = basis
      price = (basis + v.sellCommission) / v.shares;
    }
    setResult({ price, interpretation: 'Sale price per share required to break even after commission and taxes on gains.' });
  };

  return (
    <div className="space-y-8">
      <Card>
        <CardHeader><CardTitle>Break-even Stock Sale Price</CardTitle><CardDescription>Account for commission and gain taxes</CardDescription></CardHeader>
        <CardContent>
      <Form {...form}>
        <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-6">
          <div className="grid grid-cols-1 md:grid-cols-4 gap-6">
            <FormField control={form.control} name="averageCost" render={({ field }) => (
              <FormItem><FormLabel className="flex items-center gap-2"><DollarSign className="h-4 w-4" /> Average Cost/Share</FormLabel><FormControl><Input type="number" step="0.0001" placeholder="e.g., 35.25" {...field} value={field.value ?? ''} onChange={e=>field.onChange(parseFloat(e.target.value) || undefined)} /></FormControl><FormMessage /></FormItem>
            )} />
            <FormField control={form.control} name="shares" render={({ field }) => (
              <FormItem><FormLabel>Shares</FormLabel><FormControl><Input type="number" step="0.0001" placeholder="e.g., 150" {...field} value={field.value ?? ''} onChange={e=>field.onChange(parseFloat(e.target.value) || undefined)} /></FormControl><FormMessage /></FormItem>
            )} />
            <FormField control={form.control} name="sellCommission" render={({ field }) => (
              <FormItem><FormLabel>Sell Commission ($)</FormLabel><FormControl><Input type="number" step="0.01" placeholder="e.g., 5" {...field} value={field.value ?? ''} onChange={e=>field.onChange(parseFloat(e.target.value) || 0)} /></FormControl><FormMessage /></FormItem>
            )} />
            <FormField control={form.control} name="taxRatePct" render={({ field }) => (
              <FormItem><FormLabel className="flex items-center gap-2"><Percent className="h-4 w-4" /> Tax Rate on Gain (%)</FormLabel><FormControl><Input type="number" step="0.1" placeholder="e.g., 15" {...field} value={field.value ?? ''} onChange={e=>field.onChange(parseFloat(e.target.value) || 0)} /></FormControl><FormMessage /></FormItem>
            )} />
          </div>
          <Button type="submit" className="w-full md:w-auto">Calculate Break-even Price</Button>
        </form>
      </Form>
        </CardContent>
      </Card>

      {result && (
        <Card>
          <CardHeader><CardTitle>Result</CardTitle><CardDescription>Required sale price</CardDescription></CardHeader>
          <CardContent>
            <div className="text-center p-6 bg-primary/5 rounded-lg"><div className="text-sm text-muted-foreground mb-1">Break-even Price</div><p className="text-3xl font-bold text-primary">${result.price.toFixed(4)}</p></div>
            <p className="text-sm mt-4">{result.interpretation}</p>
          </CardContent>
        </Card>
      )}
      <Card>
        <CardHeader><CardTitle>Related Calculators</CardTitle><CardDescription>Plan exits and taxes</CardDescription></CardHeader>
        <CardContent>
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
            <div className="p-4 border rounded"><h4 className="font-semibold mb-1"><a href="/category/finance/stock-average-cost-multiple-buys-calculator" className="text-primary hover:underline">Average Cost (Multi‑Buys)</a></h4><p className="text-sm text-muted-foreground">Cost basis helper.</p></div>
            <div className="p-4 border rounded"><h4 className="font-semibold mb-1"><a href="/category/finance/capital-gain-loss-calculator" className="text-primary hover:underline">Capital Gain/Loss</a></h4><p className="text-sm text-muted-foreground">Net proceeds.</p></div>
            <div className="p-4 border rounded"><h4 className="font-semibold mb-1"><a href="/category/finance/target-price-calculator" className="text-primary hover:underline">Target Price</a></h4><p className="text-sm text-muted-foreground">Goal based exits.</p></div>
            <div className="p-4 border rounded"><h4 className="font-semibold mb-1"><a href="/category/finance/real-rate-of-return-calculator" className="text-primary hover:underline">Real Return</a></h4><p className="text-sm text-muted-foreground">After‑inflation metric.</p></div>
          </div>
        </CardContent>
      </Card>

      <Card>
        <CardHeader><CardTitle>Complete Guide: Break-even Price</CardTitle></CardHeader>
        <CardContent className="prose prose-sm dark:prose-invert max-w-none"><p>This is a sample line for the complete guide section. You can add your detailed content here.</p><p>This is another sample line for the guide section. Replace these with your comprehensive guide content.</p></CardContent>
      </Card>

      <Card>
        <CardHeader><CardTitle>Frequently Asked Questions</CardTitle><CardDescription>Detailed, SEO‑oriented answers</CardDescription></CardHeader>
        <CardContent className="space-y-4">{[
          ['Is break‑even before or after tax?', 'This tool accounts for commission and applies your tax rate only to positive gains to estimate a post‑tax break‑even price.'],
          ['What if I sell at a loss?', 'The tax on gain becomes zero in this model; jurisdictions may allow loss offsets—consult a tax professional.'],
          ['Do I include platform fees?', 'Yes, include any transaction costs in the commission/fees input.'],
          ['Does dividend income change break‑even?', 'Not directly for the sale price; incorporate dividends separately in total return planning.'],
          ['How do stock splits affect break‑even?', 'Splits change shares and price, but total basis is unchanged. Recalculate average cost first, then recompute break‑even.'],
          ['What tax rate should I use?', 'Use your expected effective rate on capital gains (short‑term vs long‑term may differ).'],
          ['Can I model fees per share?', 'Convert per‑share fees to a total dollar fee for simplicity here.'],
          ['Does slippage matter?', 'Execution price may differ from quoted price; consider adding a small buffer above break‑even.'],
        ].map(([q,a],i)=> (<div key={i}><h4 className="font-semibold mb-1">{q}</h4><p className="text-sm text-muted-foreground">{a}</p></div>))}</CardContent>
      </Card>
    </div>
  );
}



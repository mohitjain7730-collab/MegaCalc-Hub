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
  costBasis: z.number().min(0.0001).optional(),
  sellProceeds: z.number().min(0).optional(),
  fees: z.number().min(0).optional(),
  taxRatePct: z.number().min(0).max(100).optional(),
});

type FormValues = z.infer<typeof formSchema>;

export default function CapitalGainLossCalculator() {
  const [result, setResult] = useState<{ gain: number; gainPct: number; taxOwed: number; netProceeds: number } | null>(null);
  const form = useForm<FormValues>({ resolver: zodResolver(formSchema), defaultValues: { costBasis: undefined, sellProceeds: undefined, fees: undefined as any, taxRatePct: undefined as any } });

  const onSubmit = (v: FormValues) => {
    if (v.costBasis == null || v.sellProceeds == null || v.fees == null || v.taxRatePct == null) { setResult(null); return; }
    const grossGain = v.sellProceeds - v.costBasis - v.fees;
    const tax = grossGain > 0 ? grossGain * (v.taxRatePct / 100) : 0;
    const net = v.sellProceeds - v.fees - tax;
    const pct = v.costBasis > 0 ? (grossGain / v.costBasis) * 100 : 0;
    setResult({ gain: Math.round(grossGain * 100) / 100, gainPct: Math.round(pct * 100) / 100, taxOwed: Math.round(tax * 100) / 100, netProceeds: Math.round(net * 100) / 100 });
  };

  return (
    <div className="space-y-8">
      <Card>
        <CardHeader><CardTitle>Capital Gain / Loss</CardTitle><CardDescription>Estimate tax and net proceeds</CardDescription></CardHeader>
        <CardContent>
      <Form {...form}>
        <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-6">
          <div className="grid grid-cols-1 md:grid-cols-4 gap-6">
            <FormField control={form.control} name="costBasis" render={({ field }) => (
              <FormItem><FormLabel className="flex items-center gap-2"><DollarSign className="h-4 w-4" /> Cost Basis</FormLabel><FormControl><Input type="number" step="0.01" placeholder="e.g., 3000" {...field} value={field.value ?? ''} onChange={e=>field.onChange(parseFloat(e.target.value) || undefined)} /></FormControl><FormMessage /></FormItem>
            )} />
            <FormField control={form.control} name="sellProceeds" render={({ field }) => (
              <FormItem><FormLabel>Sell Proceeds</FormLabel><FormControl><Input type="number" step="0.01" placeholder="e.g., 3800" {...field} value={field.value ?? ''} onChange={e=>field.onChange(parseFloat(e.target.value) || undefined)} /></FormControl><FormMessage /></FormItem>
            )} />
            <FormField control={form.control} name="fees" render={({ field }) => (
              <FormItem><FormLabel>Fees/Commission</FormLabel><FormControl><Input type="number" step="0.01" placeholder="e.g., 5" {...field} value={field.value ?? ''} onChange={e=>field.onChange(parseFloat(e.target.value) || 0)} /></FormControl><FormMessage /></FormItem>
            )} />
            <FormField control={form.control} name="taxRatePct" render={({ field }) => (
              <FormItem><FormLabel className="flex items-center gap-2"><Percent className="h-4 w-4" /> Tax Rate (%)</FormLabel><FormControl><Input type="number" step="0.1" placeholder="e.g., 15" {...field} value={field.value ?? ''} onChange={e=>field.onChange(parseFloat(e.target.value) || 0)} /></FormControl><FormMessage /></FormItem>
            )} />
          </div>
          <Button type="submit" className="w-full md:w-auto">Calculate Gain/Loss</Button>
        </form>
      </Form>
        </CardContent>
      </Card>

      {result && (
        <Card>
          <CardHeader><CardTitle>Result</CardTitle><CardDescription>Gross/Net outcome</CardDescription></CardHeader>
          <CardContent>
            <div className="grid grid-cols-1 md:grid-cols-4 gap-6">
              <div className="text-center p-6 bg-primary/5 rounded-lg"><div className="text-sm text-muted-foreground mb-1">Gain/Loss</div><p className="text-3xl font-bold text-primary">${result.gain.toLocaleString()}</p></div>
              <div className="text-center p-6 bg-primary/5 rounded-lg"><div className="text-sm text-muted-foreground mb-1">Return %</div><p className="text-3xl font-bold text-primary">{result.gainPct}%</p></div>
              <div className="text-center p-6 bg-green-50 dark:bg-green-950/20 rounded-lg"><div className="text-sm text-muted-foreground mb-1">Tax Owed</div><p className="text-3xl font-bold text-green-600">${result.taxOwed.toLocaleString()}</p></div>
              <div className="text-center p-6 bg-green-50 dark:bg-green-950/20 rounded-lg"><div className="text-sm text-muted-foreground mb-1">Net Proceeds</div><p className="text-3xl font-bold text-green-600">${result.netProceeds.toLocaleString()}</p></div>
            </div>
          </CardContent>
        </Card>
      )}

      <Card>
        <CardHeader><CardTitle>Related Calculators</CardTitle><CardDescription>Plan proceeds and returns</CardDescription></CardHeader>
        <CardContent>
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
            <div className="p-4 border rounded"><h4 className="font-semibold mb-1"><a href="/category/finance/break-even-stock-sale-price-calculator" className="text-primary hover:underline">Break‑even Sale Price</a></h4><p className="text-sm text-muted-foreground">Required price.</p></div>
            <div className="p-4 border rounded"><h4 className="font-semibold mb-1"><a href="/category/finance/holding-period-return-hpr-calculator" className="text-primary hover:underline">Holding Period Return</a></h4><p className="text-sm text-muted-foreground">Total return.</p></div>
            <div className="p-4 border rounded"><h4 className="font-semibold mb-1"><a href="/category/finance/cagr-calculator" className="text-primary hover:underline">CAGR</a></h4><p className="text-sm text-muted-foreground">Annualized growth.</p></div>
            <div className="p-4 border rounded"><h4 className="font-semibold mb-1"><a href="/category/finance/stock-average-cost-multiple-buys-calculator" className="text-primary hover:underline">Average Cost</a></h4><p className="text-sm text-muted-foreground">Basis helper.</p></div>
          </div>
        </CardContent>
      </Card>

      <Card>
        <CardHeader><CardTitle>Complete Guide: Capital Gains & Losses</CardTitle></CardHeader>
        <CardContent className="prose prose-sm dark:prose-invert max-w-none"><p>This is a sample line for the complete guide section. You can add your detailed content here.</p><p>This is another sample line for the guide section. Replace these with your comprehensive guide content.</p></CardContent>
      </Card>

      <Card>
        <CardHeader><CardTitle>Frequently Asked Questions</CardTitle><CardDescription>Detailed, SEO‑oriented answers</CardDescription></CardHeader>
        <CardContent className="space-y-4">{[
          ['What is cost basis?', 'Your total acquisition cost including commissions and fees.'],
          ['Are taxes applied on losses?', 'Generally no; some jurisdictions allow loss offsets. Consult a tax professional.'],
          ['Short‑term vs long‑term gains?', 'Tax rates may differ based on holding period—this calculator uses a single rate input for simplicity.'],
          ['Do fees reduce taxable gain?', 'Yes, transaction costs typically reduce the realized gain.'],
          ['How do dividends affect gains?', 'Dividends are typically taxed separately as income; this tool models the sale gain/loss only.'],
          ['What about wash‑sale rules?', 'Selling at a loss and repurchasing shortly after may disallow the loss for tax purposes.'],
          ['Can I model multiple lots?', 'Aggregate lots into a combined basis, or compute per lot and sum the results.'],
          ['Does FX matter?', 'For foreign securities, convert both basis and proceeds to a single currency consistently.'],
        ].map(([q,a],i)=> (<div key={i}><h4 className="font-semibold mb-1">{q}</h4><p className="text-sm text-muted-foreground">{a}</p></div>))}</CardContent>
      </Card>
    </div>
  );
}



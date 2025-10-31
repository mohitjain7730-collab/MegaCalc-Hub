'use client';

import { useState } from 'react';
import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import { z } from 'zod';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Form, FormControl, FormField, FormItem, FormLabel, FormMessage } from '@/components/ui/form';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Calculator, Info, Landmark } from 'lucide-react';

const formSchema = z.object({
  spotRate: z.number().min(0).optional(),
  forwardRate: z.number().min(0).optional(),
  domesticRate: z.number().min(-50).max(200).optional(),
  foreignRate: z.number().min(-50).max(200).optional(),
  timeYears: z.number().min(0).max(100).optional(),
});

type FormValues = z.infer<typeof formSchema>;

export default function CoveredInterestArbitrageCalculator() {
  const [result, setResult] = useState<{ parityForward: number; deviationPct: number; opportunity: string; suggestions: string[] } | null>(null);

  const form = useForm<FormValues>({ resolver: zodResolver(formSchema), defaultValues: { spotRate: undefined as unknown as number, forwardRate: undefined as unknown as number, domesticRate: undefined as unknown as number, foreignRate: undefined as unknown as number, timeYears: undefined as unknown as number } });

  const onSubmit = (v: FormValues) => {
    if (v.spotRate === undefined || v.forwardRate === undefined || v.domesticRate === undefined || v.foreignRate === undefined || v.timeYears === undefined) { setResult(null); return; }
    const rd = v.domesticRate / 100; const rf = v.foreignRate / 100; const t = v.timeYears;
    const fParity = v.spotRate * (1 + rd * t) / (1 + rf * t);
    const dev = ((v.forwardRate - fParity) / fParity) * 100;
    const opportunity = Math.abs(dev) < 1e-6 ? 'No covered arbitrage (at parity).' : dev > 0 ? 'Sell forward (forward too high) and invest foreign.' : 'Buy forward (forward too low) and invest domestic.';
    setResult({ parityForward: fParity, deviationPct: dev, opportunity, suggestions: ['Ensure rates and tenors align with forward maturity.', 'Include transaction costs and credit spreads; real opportunities may vanish.', 'Use consistent quoting (domestic per foreign).', 'Prefer cash-and-carry or reverse cash-and-carry structures.'] });
  };

  const num = (ph: string, field: any) => (
    <Input type="number" step="0.0001" placeholder={ph} {...field}
      value={Number.isFinite(field.value as any) ? (field.value as any) : ''}
      onChange={e => { const v = e.target.value; const n = v === '' ? undefined : Number(v); field.onChange(Number.isFinite(n as any) ? n : undefined); }} />
  );

  return (
    <div className="space-y-8">
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2"><Landmark className="h-5 w-5" /> Covered Interest Arbitrage Calculator</CardTitle>
          <CardDescription>Check deviations from parity and infer arbitrage direction.</CardDescription>
        </CardHeader>
        <CardContent>
          <Form {...form}>
            <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-6">
              <div className="grid grid-cols-1 md:grid-cols-5 gap-6">
                <FormField control={form.control} name="spotRate" render={({ field }) => (<FormItem><FormLabel>Spot Rate</FormLabel><FormControl>{num('e.g., 1.1200', field)}</FormControl><FormMessage /></FormItem>)} />
                <FormField control={form.control} name="forwardRate" render={({ field }) => (<FormItem><FormLabel>Forward Rate</FormLabel><FormControl>{num('e.g., 1.1300', field)}</FormControl><FormMessage /></FormItem>)} />
                <FormField control={form.control} name="domesticRate" render={({ field }) => (<FormItem><FormLabel>Domestic r_d (%)</FormLabel><FormControl>{num('e.g., 4', field)}</FormControl><FormMessage /></FormItem>)} />
                <FormField control={form.control} name="foreignRate" render={({ field }) => (<FormItem><FormLabel>Foreign r_f (%)</FormLabel><FormControl>{num('e.g., 2', field)}</FormControl><FormMessage /></FormItem>)} />
                <FormField control={form.control} name="timeYears" render={({ field }) => (<FormItem><FormLabel>Time (years)</FormLabel><FormControl>{num('e.g., 1', field)}</FormControl><FormMessage /></FormItem>)} />
              </div>
              <Button type="submit" className="w-full md:w-auto">Calculate</Button>
            </form>
          </Form>
        </CardContent>
      </Card>

      {result && (
        <Card>
          <CardHeader><CardTitle className="flex items-center gap-2"><Calculator className="h-5 w-5" /> Results & Insights</CardTitle><CardDescription>Parity deviation</CardDescription></CardHeader>
          <CardContent className="space-y-6">
            <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
              <div className="p-4 border rounded-lg"><p className="text-sm text-muted-foreground">Parity Forward</p><p className="text-2xl font-bold">{result.parityForward.toFixed(6)}</p></div>
              <div className="p-4 border rounded-lg"><p className="text-sm text-muted-foreground">Deviation</p><p className={`text-2xl font-bold ${result.deviationPct >= 0 ? 'text-green-600' : 'text-red-600'}`}>{result.deviationPct.toFixed(3)}%</p></div>
              <div className="p-4 border rounded-lg"><p className="text-sm text-muted-foreground">Opportunity</p><p className="font-medium">{result.opportunity}</p></div>
            </div>
            <div><h4 className="font-semibold mb-2">Suggestions</h4><ul className="list-disc pl-6 text-muted-foreground space-y-1">{result.suggestions.map((s,i)=>(<li key={i}>{s}</li>))}</ul></div>
          </CardContent>
        </Card>
      )}

      <Card>
        <CardHeader><CardTitle className="flex items-center gap-2"><Calculator className="h-5 w-5" /> Related Calculators</CardTitle><CardDescription>FX parity and pricing</CardDescription></CardHeader>
        <CardContent>
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div className="p-4 border rounded-lg hover:bg-muted/50 transition-colors"><h4 className="font-semibold mb-2"><a href="/category/finance/interest-rate-parity-calculator" className="text-primary hover:underline">Interest Rate Parity</a></h4><p className="text-sm text-muted-foreground">Forward parity baseline.</p></div>
            <div className="p-4 border rounded-lg hover:bg-muted/50 transition-colors"><h4 className="font-semibold mb-2"><a href="/category/finance/currency-forward-points-calculator" className="text-primary hover:underline">Forward Points Calculator</a></h4><p className="text-sm text-muted-foreground">Convert forward quotes to premium/discount.</p></div>
            <div className="p-4 border rounded-lg hover:bg-muted/50 transition-colors"><h4 className="font-semibold mb-2"><a href="/category/finance/currency-exchange-calculator" className="text-primary hover:underline">Currency Exchange</a></h4><p className="text-sm text-muted-foreground">Spot conversions used in cash-and-carry steps.</p></div>
            <div className="p-4 border rounded-lg hover:bg-muted/50 transition-colors"><h4 className="font-semibold mb-2"><a href="/category/finance/purchasing-power-parity-calculator" className="text-primary hover:underline">Purchasing Power Parity</a></h4><p className="text-sm text-muted-foreground">Long-run valuation context.</p></div>
          </div>
        </CardContent>
      </Card>

      <Card>
        <CardHeader><CardTitle className="flex items-center gap-2"><Info className="h-5 w-5" /> Complete Guide to Covered Interest Arbitrage</CardTitle></CardHeader>
        <CardContent className="prose prose-sm dark:prose-invert max-w-none"><p>Placeholder for arbitrage guide.</p><p>Describe cash-and-carry and reverse cash-and-carry steps.</p></CardContent>
      </Card>

      <Card>
        <CardHeader><CardTitle className="flex items-center gap-2"><Info className="h-5 w-5" /> Frequently Asked Questions</CardTitle><CardDescription>Arbitrage mechanics</CardDescription></CardHeader>
        <CardContent className="space-y-6">
          <div><h4 className="font-semibold mb-2">What is covered arbitrage?</h4><p className="text-muted-foreground">A risk-free trade using spot, forwards, and interest rates to lock returns.</p></div>
          <div><h4 className="font-semibold mb-2">Why can deviations persist?</h4><p className="text-muted-foreground">Capital controls, costs, balance sheet constraints, and credit limits.</p></div>
          <div><h4 className="font-semibold mb-2">Which way to trade?</h4><p className="text-muted-foreground">If forward &gt; parity, sell forward; if forward &lt; parity, buy forward.</p></div>
          <div><h4 className="font-semibold mb-2">Does compounding matter?</h4><p className="text-muted-foreground">Yes—match conventions to avoid artificial deviations.</p></div>
          <div><h4 className="font-semibold mb-2">Is it feasible for retail?</h4><p className="text-muted-foreground">Often not, due to spreads, financing constraints, and lot sizes.</p></div>
          <div><h4 className="font-semibold mb-2">What risks remain?</h4><p className="text-muted-foreground">Settlement and counterparty risks may remain despite coverage.</p></div>
          <div><h4 className="font-semibold mb-2">How do I annualize arbitrage returns?</h4><p className="text-muted-foreground">Scale the carry component by tenor (e.g., multiply monthly return by 12) while accounting for compounding.</p></div>
          <div><h4 className="font-semibold mb-2">Can forward-dealer margins erase the edge?</h4><p className="text-muted-foreground">Yes—include bid/ask on spot/forward, borrowing/lending spreads, and fees before concluding an opportunity exists.</p></div>
        </CardContent>
      </Card>
    </div>
  );
}



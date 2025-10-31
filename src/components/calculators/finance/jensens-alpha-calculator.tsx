'use client';

import { useState } from 'react';
import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import { z } from 'zod';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Form, FormControl, FormField, FormItem, FormLabel, FormMessage } from '@/components/ui/form';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Calculator, Info, TrendingUp } from 'lucide-react';

const formSchema = z.object({
  portfolioReturn: z.number().min(-100).max(100).optional(),
  marketReturn: z.number().min(-100).max(100).optional(),
  riskFreeRate: z.number().min(-10).max(100).optional(),
  beta: z.number().min(0).max(5).optional(),
});

type FormValues = z.infer<typeof formSchema>;

export default function JensensAlphaCalculator() {
  const [result, setResult] = useState<{ expected: number; alpha: number; interp: string; suggestions: string[] } | null>(null);

  const form = useForm<FormValues>({
    resolver: zodResolver(formSchema),
    defaultValues: {
      portfolioReturn: undefined as unknown as number,
      marketReturn: undefined as unknown as number,
      riskFreeRate: undefined as unknown as number,
      beta: undefined as unknown as number,
    },
  });

  const onSubmit = (v: FormValues) => {
    if (v.portfolioReturn === undefined || v.marketReturn === undefined || v.riskFreeRate === undefined || v.beta === undefined) {
      setResult(null);
      return;
    }
    const exp = v.riskFreeRate + v.beta * (v.marketReturn - v.riskFreeRate);
    const alpha = v.portfolioReturn - exp;
    const interp = alpha > 0 ? 'Positive alpha: portfolio outperformed CAPM expectation.' : alpha < 0 ? 'Negative alpha: underperformed risk-adjusted benchmark.' : 'Alpha near zero: matched CAPM expectation.';
    setResult({ expected: exp, alpha, interp, suggestions: ['Validate beta window and benchmark choice.', 'Incorporate costs and slippage when assessing realized alpha.', 'Review factor exposures beyond market beta.', 'Track rolling alpha to assess persistence.'] });
  };

  const numberField = (placeholder: string, field: any) => (
    <Input type="number" step="0.01" placeholder={placeholder} {...field}
      value={Number.isFinite(field.value as any) ? (field.value as any) : ''}
      onChange={(e) => { const v = e.target.value; const num = v === '' ? undefined : Number(v); field.onChange(Number.isFinite(num as any) ? num : undefined); }} />
  );

  return (
    <div className="space-y-8">
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2"><TrendingUp className="h-5 w-5" /> Jensen’s Alpha Calculator</CardTitle>
          <CardDescription>Estimate alpha relative to CAPM expected return.</CardDescription>
        </CardHeader>
        <CardContent>
          <Form {...form}>
            <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-6">
              <div className="grid grid-cols-1 md:grid-cols-4 gap-6">
                <FormField control={form.control} name="portfolioReturn" render={({ field }) => (
                  <FormItem><FormLabel>Portfolio Return (%)</FormLabel><FormControl>{numberField('e.g., 12', field)}</FormControl><FormMessage /></FormItem>
                )} />
                <FormField control={form.control} name="marketReturn" render={({ field }) => (
                  <FormItem><FormLabel>Market Return (%)</FormLabel><FormControl>{numberField('e.g., 8', field)}</FormControl><FormMessage /></FormItem>
                )} />
                <FormField control={form.control} name="riskFreeRate" render={({ field }) => (
                  <FormItem><FormLabel>Risk-Free Rate (%)</FormLabel><FormControl>{numberField('e.g., 3', field)}</FormControl><FormMessage /></FormItem>
                )} />
                <FormField control={form.control} name="beta" render={({ field }) => (
                  <FormItem><FormLabel>Portfolio Beta</FormLabel><FormControl>{numberField('e.g., 1.1', field)}</FormControl><FormMessage /></FormItem>
                )} />
              </div>
              <Button type="submit" className="w-full md:w-auto">Calculate</Button>
            </form>
          </Form>
        </CardContent>
      </Card>

      {result && (
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center gap-2"><Calculator className="h-5 w-5" /> Results & Insights</CardTitle>
            <CardDescription>Alpha relative to risk</CardDescription>
          </CardHeader>
          <CardContent className="space-y-6">
            <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
              <div className="p-4 border rounded-lg"><p className="text-sm text-muted-foreground">CAPM Expected Return</p><p className="text-2xl font-bold">{result.expected.toFixed(2)}%</p></div>
              <div className="p-4 border rounded-lg"><p className="text-sm text-muted-foreground">Jensen’s Alpha</p><p className={`text-2xl font-bold ${result.alpha >= 0 ? 'text-green-600' : 'text-red-600'}`}>{result.alpha.toFixed(2)}%</p></div>
              <div className="p-4 border rounded-lg"><p className="text-sm text-muted-foreground">Interpretation</p><p className="font-medium">{result.interp}</p></div>
            </div>
            <div><h4 className="font-semibold mb-2">Suggestions</h4><ul className="list-disc pl-6 text-muted-foreground space-y-1">{result.suggestions.map((s,i)=>(<li key={i}>{s}</li>))}</ul></div>
          </CardContent>
        </Card>
      )}

      <Card>
        <CardHeader><CardTitle className="flex items-center gap-2"><Calculator className="h-5 w-5" /> Related Calculators</CardTitle><CardDescription>Risk-adjusted performance</CardDescription></CardHeader>
        <CardContent>
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div className="p-4 border rounded-lg hover:bg-muted/50 transition-colors"><h4 className="font-semibold mb-2"><a href="/category/finance/capm-calculator" className="text-primary hover:underline">CAPM Calculator</a></h4><p className="text-sm text-muted-foreground">Expected return from beta.</p></div>
            <div className="p-4 border rounded-lg hover:bg-muted/50 transition-colors"><h4 className="font-semibold mb-2"><a href="/category/finance/beta-asset-calculator" className="text-primary hover:underline">Beta Calculator</a></h4><p className="text-sm text-muted-foreground">Estimate sensitivity to the market.</p></div>
            <div className="p-4 border rounded-lg hover:bg-muted/50 transition-colors"><h4 className="font-semibold mb-2"><a href="/category/finance/information-ratio-calculator" className="text-primary hover:underline">Information Ratio</a></h4><p className="text-sm text-muted-foreground">Active return per unit of tracking error.</p></div>
            <div className="p-4 border rounded-lg hover:bg-muted/50 transition-colors"><h4 className="font-semibold mb-2"><a href="/category/finance/sharpe-ratio-calculator" className="text-primary hover:underline">Sharpe Ratio</a></h4><p className="text-sm text-muted-foreground">Total risk-adjusted return.</p></div>
          </div>
        </CardContent>
      </Card>

      <Card>
        <CardHeader><CardTitle className="flex items-center gap-2"><Info className="h-5 w-5" /> Complete Guide to Jensen’s Alpha</CardTitle></CardHeader>
        <CardContent className="prose prose-sm dark:prose-invert max-w-none"><p>Placeholder for the full guide content.</p><p>Add methodology and examples.</p></CardContent>
      </Card>

      <Card>
        <CardHeader><CardTitle className="flex items-center gap-2"><Info className="h-5 w-5" /> Frequently Asked Questions</CardTitle><CardDescription>Alpha measurement</CardDescription></CardHeader>
        <CardContent className="space-y-6">
          <div><h4 className="font-semibold mb-2">What is Jensen’s alpha?</h4><p className="text-muted-foreground">The excess return of a portfolio over its CAPM-expected return, indicating manager skill beyond market exposure.</p></div>
          <div><h4 className="font-semibold mb-2">What inputs do I need?</h4><p className="text-muted-foreground">Portfolio return, market return, risk-free rate, and portfolio beta.</p></div>
          <div><h4 className="font-semibold mb-2">Can alpha be compared across periods?</h4><p className="text-muted-foreground">Yes, but keep periodicity consistent and consider rolling windows.</p></div>
          <div><h4 className="font-semibold mb-2">Does positive alpha guarantee outperformance?</h4><p className="text-muted-foreground">Not necessarily; alpha can be noisy and may not persist.</p></div>
          <div><h4 className="font-semibold mb-2">How sensitive is alpha to beta?</h4><p className="text-muted-foreground">Very—ensure beta is estimated over a relevant window with an appropriate benchmark.</p></div>
          <div><h4 className="font-semibold mb-2">Should I include fees?</h4><p className="text-muted-foreground">Yes, use net-of-fee performance when assessing realized alpha.</p></div>
          <div><h4 className="font-semibold mb-2">What if beta is unstable?</h4><p className="text-muted-foreground">Consider multi-factor models or shrinkage techniques to improve robustness.</p></div>
          <div><h4 className="font-semibold mb-2">Is alpha additive across funds?</h4><p className="text-muted-foreground">Not straightforward; diversification and correlations matter.</p></div>
        </CardContent>
      </Card>
    </div>
  );
}



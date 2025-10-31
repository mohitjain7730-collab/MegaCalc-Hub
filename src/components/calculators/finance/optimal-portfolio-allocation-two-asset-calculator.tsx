'use client';

import { useState } from 'react';
import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import { z } from 'zod';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Form, FormControl, FormField, FormItem, FormLabel, FormMessage } from '@/components/ui/form';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Calculator, Target, Info, LineChart } from 'lucide-react';

const formSchema = z.object({
  r1: z.number().min(-100).max(100).optional(),
  r2: z.number().min(-100).max(100).optional(),
  s1: z.number().min(0).max(500).optional(),
  s2: z.number().min(0).max(500).optional(),
  rho: z.number().min(-1).max(1).optional(),
});

type FormValues = z.infer<typeof formSchema>;

type Result = {
  w1: number;
  w2: number;
  portfolioReturn: number;
  portfolioStd: number;
  interpretation: string;
  suggestions: string[];
};

export default function OptimalPortfolioAllocationTwoAssetCalculator() {
  const [result, setResult] = useState<Result | null>(null);

  const form = useForm<FormValues>({
    resolver: zodResolver(formSchema),
    defaultValues: {
      r1: undefined as unknown as number,
      r2: undefined as unknown as number,
      s1: undefined as unknown as number,
      s2: undefined as unknown as number,
      rho: undefined as unknown as number,
    },
  });

  const onSubmit = (v: FormValues) => {
    if (
      v.r1 === undefined || v.r2 === undefined ||
      v.s1 === undefined || v.s2 === undefined || v.rho === undefined
    ) {
      setResult(null);
      return;
    }
    const s1 = v.s1 / 100;
    const s2 = v.s2 / 100;
    const cov = v.rho * s1 * s2;
    const denom = (s1 * s1) + (s2 * s2) - 2 * cov;
    const w1 = denom === 0 ? 0.5 : ((s2 * s2) - cov) / denom; // minimum-variance weight
    const w1Clamped = Math.min(1, Math.max(0, w1));
    const w2Clamped = 1 - w1Clamped;
    const pRet = w1Clamped * v.r1 + w2Clamped * v.r2;
    const pVar = (w1Clamped * w1Clamped * s1 * s1) + (w2Clamped * w2Clamped * s2 * s2) + (2 * w1Clamped * w2Clamped * cov);
    const pStd = Math.sqrt(pVar) * 100;

    const interpretation = `Minimum-variance allocation suggests ${ (w1Clamped*100).toFixed(1) }% in Asset 1 and ${ (w2Clamped*100).toFixed(1) }% in Asset 2.`;
    const suggestions = [
      'Consider constraints (e.g., no shorting, max weights).',
      'Revisit inputs periodically; expected returns and risk change over time.',
      'If rho is low or negative, diversification benefits increase.',
      'Stress test allocations with alternative scenarios.',
    ];

    setResult({ w1: w1Clamped, w2: w2Clamped, portfolioReturn: pRet, portfolioStd: pStd, interpretation, suggestions });
  };

  return (
    <div className="space-y-8">
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <Target className="h-5 w-5" />
            Optimal Portfolio Allocation (Two Asset)
          </CardTitle>
          <CardDescription>Compute the minimum-variance mix for two risky assets.</CardDescription>
        </CardHeader>
        <CardContent>
          <Form {...form}>
            <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-6">
              <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                <FormField control={form.control} name="r1" render={({ field }) => (
                  <FormItem>
                    <FormLabel>Asset 1 Expected Return (%)</FormLabel>
                    <FormControl>
                      <Input type="number" step="0.01" placeholder="e.g., 8" {...field}
                        value={Number.isFinite(field.value as any) ? (field.value as any) : ''}
                        onChange={e => {
                          const v = e.target.value;
                          const num = v === '' ? undefined : Number(v);
                          field.onChange(Number.isFinite(num as any) ? num : undefined);
                        }}
                      />
                    </FormControl>
                    <FormMessage />
                  </FormItem>
                )} />
                <FormField control={form.control} name="r2" render={({ field }) => (
                  <FormItem>
                    <FormLabel>Asset 2 Expected Return (%)</FormLabel>
                    <FormControl>
                      <Input type="number" step="0.01" placeholder="e.g., 6" {...field}
                        value={Number.isFinite(field.value as any) ? (field.value as any) : ''}
                        onChange={e => {
                          const v = e.target.value;
                          const num = v === '' ? undefined : Number(v);
                          field.onChange(Number.isFinite(num as any) ? num : undefined);
                        }}
                      />
                    </FormControl>
                    <FormMessage />
                  </FormItem>
                )} />
                <FormField control={form.control} name="s1" render={({ field }) => (
                  <FormItem>
                    <FormLabel>Asset 1 Standard Deviation (%)</FormLabel>
                    <FormControl>
                      <Input type="number" step="0.01" placeholder="e.g., 15" {...field}
                        value={Number.isFinite(field.value as any) ? (field.value as any) : ''}
                        onChange={e => {
                          const v = e.target.value;
                          const num = v === '' ? undefined : Number(v);
                          field.onChange(Number.isFinite(num as any) ? num : undefined);
                        }}
                      />
                    </FormControl>
                    <FormMessage />
                  </FormItem>
                )} />
                <FormField control={form.control} name="s2" render={({ field }) => (
                  <FormItem>
                    <FormLabel>Asset 2 Standard Deviation (%)</FormLabel>
                    <FormControl>
                      <Input type="number" step="0.01" placeholder="e.g., 10" {...field}
                        value={Number.isFinite(field.value as any) ? (field.value as any) : ''}
                        onChange={e => {
                          const v = e.target.value;
                          const num = v === '' ? undefined : Number(v);
                          field.onChange(Number.isFinite(num as any) ? num : undefined);
                        }}
                      />
                    </FormControl>
                    <FormMessage />
                  </FormItem>
                )} />
                <FormField control={form.control} name="rho" render={({ field }) => (
                  <FormItem>
                    <FormLabel>Correlation (ρ)</FormLabel>
                    <FormControl>
                      <Input type="number" step="0.01" placeholder="e.g., 0.3" {...field}
                        value={Number.isFinite(field.value as any) ? (field.value as any) : ''}
                        onChange={e => {
                          const v = e.target.value;
                          const num = v === '' ? undefined : Number(v);
                          field.onChange(Number.isFinite(num as any) ? num : undefined);
                        }}
                      />
                    </FormControl>
                    <FormMessage />
                  </FormItem>
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
            <CardTitle className="flex items-center gap-2">
              <LineChart className="h-5 w-5" />
              Results & Insights
            </CardTitle>
            <CardDescription>Minimum-variance allocation summary</CardDescription>
          </CardHeader>
          <CardContent className="space-y-6">
            <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
              <div className="p-4 border rounded-lg">
                <p className="text-sm text-muted-foreground">Weight in Asset 1</p>
                <p className="text-2xl font-bold">{(result.w1 * 100).toFixed(1)}%</p>
              </div>
              <div className="p-4 border rounded-lg">
                <p className="text-sm text-muted-foreground">Weight in Asset 2</p>
                <p className="text-2xl font-bold">{(result.w2 * 100).toFixed(1)}%</p>
              </div>
              <div className="p-4 border rounded-lg">
                <p className="text-sm text-muted-foreground">Portfolio Std. Dev.</p>
                <p className="text-2xl font-bold">{result.portfolioStd.toFixed(2)}%</p>
              </div>
            </div>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div className="p-4 border rounded-lg">
                <p className="text-sm text-muted-foreground">Portfolio Expected Return</p>
                <p className="text-2xl font-bold">{result.portfolioReturn.toFixed(2)}%</p>
              </div>
              <div className="p-4 border rounded-lg">
                <p className="text-sm text-muted-foreground">Interpretation</p>
                <p className="font-medium">{result.interpretation}</p>
              </div>
            </div>
            <div>
              <h4 className="font-semibold mb-2">Suggestions</h4>
              <ul className="list-disc pl-6 text-muted-foreground space-y-1">
                {result.suggestions.map((s, i) => (<li key={i}>{s}</li>))}
              </ul>
            </div>
          </CardContent>
        </Card>
      )}

      {/* Related Calculators */}
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <Calculator className="h-5 w-5" />
            Related Calculators
          </CardTitle>
          <CardDescription>Dive deeper into risk and return</CardDescription>
        </CardHeader>
        <CardContent>
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div className="p-4 border rounded-lg hover:bg-muted/50 transition-colors">
              <h4 className="font-semibold mb-2"><a href="/category/finance/standard-deviation-calculator" className="text-primary hover:underline">Standard Deviation Calculator</a></h4>
              <p className="text-sm text-muted-foreground">Measure volatility of returns.</p>
            </div>
            <div className="p-4 border rounded-lg hover:bg-muted/50 transition-colors">
              <h4 className="font-semibold mb-2"><a href="/category/finance/portfolio-variance-calculator" className="text-primary hover:underline">Portfolio Variance Calculator</a></h4>
              <p className="text-sm text-muted-foreground">Estimate total risk across assets.</p>
            </div>
            <div className="p-4 border rounded-lg hover:bg-muted/50 transition-colors">
              <h4 className="font-semibold mb-2"><a href="/category/finance/npv-calculator" className="text-primary hover:underline">Net Present Value (NPV)</a></h4>
              <p className="text-sm text-muted-foreground">Link expected return to valuation.</p>
            </div>
            <div className="p-4 border rounded-lg hover:bg-muted/50 transition-colors">
              <h4 className="font-semibold mb-2"><a href="/category/finance/return-on-investment-calculator" className="text-primary hover:underline">ROI Calculator</a></h4>
              <p className="text-sm text-muted-foreground">Analyze performance outcomes.</p>
            </div>
          </div>
        </CardContent>
      </Card>

      {/* Guide Section */}
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <Info className="h-5 w-5" />
            Complete Guide to Two-Asset Optimization
          </CardTitle>
        </CardHeader>
        <CardContent className="prose prose-sm dark:prose-invert max-w-none">
          <p>Use this guide placeholder to add your comprehensive explanation later.</p>
          <p>Include assumptions, formulas, and illustrative examples.</p>
        </CardContent>
      </Card>

      {/* FAQ Section */}
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <Info className="h-5 w-5" />
            Frequently Asked Questions
          </CardTitle>
          <CardDescription>Two-asset optimization and diversification</CardDescription>
        </CardHeader>
        <CardContent className="space-y-6">
          <div>
            <h4 className="font-semibold mb-2">What is minimum-variance allocation?</h4>
            <p className="text-muted-foreground">It’s the portfolio mix with the lowest possible variance for two assets, given their volatilities and correlation.</p>
          </div>
          <div>
            <h4 className="font-semibold mb-2">Does a lower correlation always reduce risk?</h4>
            <p className="text-muted-foreground">All else equal, lower or negative correlation reduces combined volatility and improves diversification benefits.</p>
          </div>
          <div>
            <h4 className="font-semibold mb-2">Are weights constrained between 0% and 100%?</h4>
            <p className="text-muted-foreground">This calculator clamps weights between 0% and 100%. Shorting would allow weights outside this range.</p>
          </div>
          <div>
            <h4 className="font-semibold mb-2">Should I use historical or forward-looking inputs?</h4>
            <p className="text-muted-foreground">Forward-looking estimates are ideal. Historical data can be a starting point but may not persist.</p>
          </div>
          <div>
            <h4 className="font-semibold mb-2">How often should I rebalance?</h4>
            <p className="text-muted-foreground">Many investors rebalance quarterly or annually to maintain target weights while managing costs and taxes.</p>
          </div>
          <div>
            <h4 className="font-semibold mb-2">What if both assets have high volatility?</h4>
            <p className="text-muted-foreground">Diversification can still help, especially with low correlation, but total risk may remain elevated.</p>
          </div>
          <div>
            <h4 className="font-semibold mb-2">Can expected return be negative?</h4>
            <p className="text-muted-foreground">Yes, especially in risk-off regimes or for hedging assets. Incorporate strategy goals when interpreting.</p>
          </div>
          <div>
            <h4 className="font-semibold mb-2">What inputs most impact the result?</h4>
            <p className="text-muted-foreground">Correlation and relative volatilities drive the minimum-variance weight more than small return changes.</p>
          </div>
        </CardContent>
      </Card>
    </div>
  );
}



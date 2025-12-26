'use client';

import { useState } from 'react';
import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import { z } from 'zod';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Form, FormControl, FormField, FormItem, FormLabel, FormMessage } from '@/components/ui/form';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { TrendingUp, Calculator, Info, Target, LineChart } from 'lucide-react';

const formSchema = z.object({
  actualReturn: z.number().min(-100).max(100).optional(),
  marketReturn: z.number().min(-100).max(100).optional(),
  riskFreeRate: z.number().min(-10).max(50).optional(),
  beta: z.number().min(0).max(5).optional(),
});

type FormValues = z.infer<typeof formSchema>;

type Result = {
  capmExpected: number;
  alpha: number;
  betaAdjustedActual: number;
  interpretation: string;
  suggestions: string[];
};

export default function BetaAdjustedPortfolioReturnCalculator() {
  const [result, setResult] = useState<Result | null>(null);

  const form = useForm<FormValues>({
    resolver: zodResolver(formSchema),
    defaultValues: {
      actualReturn: undefined as unknown as number,
      marketReturn: undefined as unknown as number,
      riskFreeRate: undefined as unknown as number,
      beta: undefined as unknown as number,
    },
  });

  const onSubmit = (values: FormValues) => {
    if (
      values.actualReturn === undefined ||
      values.marketReturn === undefined ||
      values.riskFreeRate === undefined ||
      values.beta === undefined
    ) {
      setResult(null);
      return;
    }
    const rf = values.riskFreeRate;
    const capmExpected = rf + values.beta * (values.marketReturn - rf);
    const alpha = values.actualReturn - capmExpected;
    const betaAdjustedActual = rf + (values.actualReturn - rf) / Math.max(values.beta, 1e-6);

    const interpretation = alpha > 0
      ? 'Positive alpha: the portfolio outperformed its CAPM-expected return for the given risk.'
      : alpha < 0
        ? 'Negative alpha: the portfolio underperformed relative to its risk-adjusted benchmark.'
        : 'Zero alpha: performance matched the CAPM expectation.';

    const suggestions = [
      'Review factor exposures (size, value, momentum) beyond market beta.',
      'Ensure fees and transaction costs are included when assessing alpha.',
      'Consider whether the beta estimate is recent and regime-appropriate.',
      'Compare rolling alpha over multiple periods for stability.',
    ];

    setResult({ capmExpected, alpha, betaAdjustedActual, interpretation, suggestions });
  };

  return (
    <div className="space-y-8">
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <TrendingUp className="h-5 w-5" />
            Beta-Adjusted Portfolio Return Calculator
          </CardTitle>
          <CardDescription>
            Compare actual returns with CAPM-expected return and estimate alpha.
          </CardDescription>
        </CardHeader>
        <CardContent>
          <Form {...form}>
            <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-6">
              <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                <FormField control={form.control} name="actualReturn" render={({ field }) => (
                  <FormItem>
                    <FormLabel>Portfolio Actual Return (%)</FormLabel>
                    <FormControl>
                      <Input type="number" step="0.01" placeholder="e.g., 12" {...field}
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
                <FormField control={form.control} name="marketReturn" render={({ field }) => (
                  <FormItem>
                    <FormLabel>Market Return (%)</FormLabel>
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
                <FormField control={form.control} name="riskFreeRate" render={({ field }) => (
                  <FormItem>
                    <FormLabel>Risk-Free Rate (%)</FormLabel>
                    <FormControl>
                      <Input type="number" step="0.01" placeholder="e.g., 3" {...field}
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
                <FormField control={form.control} name="beta" render={({ field }) => (
                  <FormItem>
                    <FormLabel>Portfolio Beta</FormLabel>
                    <FormControl>
                      <Input type="number" step="0.01" placeholder="e.g., 1.2" {...field}
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
            <CardDescription>Risk-adjusted performance summary</CardDescription>
          </CardHeader>
          <CardContent className="space-y-6">
            <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
              <div className="p-4 border rounded-lg">
                <p className="text-sm text-muted-foreground">CAPM-Expected Return</p>
                <p className="text-2xl font-bold">{result.capmExpected.toFixed(2)}%</p>
              </div>
              <div className="p-4 border rounded-lg">
                <p className="text-sm text-muted-foreground">Alpha (Actual - Expected)</p>
                <p className={`text-2xl font-bold ${result.alpha >= 0 ? 'text-green-600' : 'text-red-600'}`}>{result.alpha.toFixed(2)}%</p>
              </div>
              <div className="p-4 border rounded-lg">
                <p className="text-sm text-muted-foreground">Beta-Adjusted Actual</p>
                <p className="text-2xl font-bold">{result.betaAdjustedActual.toFixed(2)}%</p>
              </div>
            </div>
            <div>
              <h4 className="font-semibold mb-2">Interpretation</h4>
              <p className="text-muted-foreground">{result.interpretation}</p>
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
          <CardDescription>Explore more portfolio analysis tools</CardDescription>
        </CardHeader>
        <CardContent>
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div className="p-4 border rounded-lg hover:bg-muted/50 transition-colors">
              <h4 className="font-semibold mb-2"><a href="/category/finance/return-on-investment-calculator" className="text-primary hover:underline">Return on Investment (ROI) Calculator</a></h4>
              <p className="text-sm text-muted-foreground">Measure total and annualized returns on investments.</p>
            </div>
            <div className="p-4 border rounded-lg hover:bg-muted/50 transition-colors">
              <h4 className="font-semibold mb-2"><a href="/category/finance/npv-calculator" className="text-primary hover:underline">Net Present Value (NPV) Calculator</a></h4>
              <p className="text-sm text-muted-foreground">Discount future cash flows to today’s value.</p>
            </div>
            <div className="p-4 border rounded-lg hover:bg-muted/50 transition-colors">
              <h4 className="font-semibold mb-2"><a href="/category/finance/discount-rate-calculator" className="text-primary hover:underline">Discount Rate Calculator</a></h4>
              <p className="text-sm text-muted-foreground">Estimate required returns and hurdle rates.</p>
            </div>
            <div className="p-4 border rounded-lg hover:bg-muted/50 transition-colors">
              <h4 className="font-semibold mb-2"><a href="/category/finance/return-on-equity-calculator" className="text-primary hover:underline">Return on Equity (ROE) Calculator</a></h4>
              <p className="text-sm text-muted-foreground">Assess profitability relative to shareholder equity.</p>
            </div>
          </div>
        </CardContent>
      </Card>

      {/* Formula Used */}
      <Card className="mb-6">
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <Calculator className="h-5 w-5" />
            Formula Used
          </CardTitle>
        </CardHeader>
        <CardContent className="space-y-4">
          <div className="p-4 bg-muted rounded-lg overflow-x-auto">
            <p className="font-mono text-sm text-center">
              CAPM Expected Return = Rf + β × (Rm - Rf)
            </p>
            <p className="font-mono text-sm text-center mt-2">
              Alpha = Actual Return - CAPM Expected Return
            </p>
          </div>
          <p className="text-sm text-muted-foreground mt-2">
            Where Rf is risk-free rate, β is portfolio beta, and Rm is market return.
          </p>
        </CardContent>
      </Card>

      {/* Input Explanations */}
      <Card className="mb-6">
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <Info className="h-5 w-5" />
            Understanding the Inputs
          </CardTitle>
        </CardHeader>
        <CardContent className="space-y-4">
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div className="p-4 bg-muted/50 rounded-lg">
              <h4 className="font-semibold mb-2">Portfolio Actual Return</h4>
              <p className="text-sm text-muted-foreground">Your portfolio's realized return over the measurement period.</p>
            </div>
            <div className="p-4 bg-muted/50 rounded-lg">
              <h4 className="font-semibold mb-2">Market Return</h4>
              <p className="text-sm text-muted-foreground">Benchmark return (e.g., S&P 500) over the same period.</p>
            </div>
            <div className="p-4 bg-muted/50 rounded-lg">
              <h4 className="font-semibold mb-2">Risk-Free Rate</h4>
              <p className="text-sm text-muted-foreground">Return on risk-free assets (e.g., Treasury bills).</p>
            </div>
            <div className="p-4 bg-muted/50 rounded-lg">
              <h4 className="font-semibold mb-2">Portfolio Beta</h4>
              <p className="text-sm text-muted-foreground">Sensitivity of portfolio returns to market movements. Beta of 1 = market risk.</p>
            </div>
          </div>
        </CardContent>
      </Card>

      {/* Complete SEO Guide */}
      <section className="space-y-6 text-muted-foreground leading-relaxed bg-card p-6 md:p-10 rounded-lg shadow-lg">
        <h1 className="text-3xl md:text-4xl font-extrabold text-foreground mb-4">Complete Guide to Beta-Adjusted Portfolio Returns</h1>
        <p className="text-lg italic text-muted-foreground">Learn how to measure risk-adjusted performance using CAPM and alpha.</p>

        <h2 className="text-2xl font-bold text-foreground mt-8 mb-4">What is Beta-Adjusted Return?</h2>
        <p>Beta-adjusted return compares your actual performance to what CAPM predicts given your risk level. The difference is alpha—a measure of manager skill or stock selection ability.</p>

        <h2 className="text-2xl font-bold text-foreground mt-8 mb-4">Understanding Beta</h2>
        <ul className="list-disc ml-6 space-y-2">
          <li><strong>Beta = 1.0:</strong> Portfolio moves with the market.</li>
          <li><strong>Beta &gt; 1.0:</strong> More volatile than market (higher risk/return potential).</li>
          <li><strong>Beta &lt; 1.0:</strong> Less volatile (defensive positioning).</li>
        </ul>

        <h2 className="text-2xl font-bold text-foreground mt-8 mb-4">Interpreting Alpha</h2>
        <ul className="list-disc ml-6 space-y-2">
          <li><strong>Positive Alpha:</strong> Outperformed risk-adjusted expectations—good stock selection or timing.</li>
          <li><strong>Negative Alpha:</strong> Underperformed—returns didn't compensate for risk taken.</li>
          <li><strong>Zero Alpha:</strong> Performance matched CAPM expectation exactly.</li>
        </ul>

        <h2 className="text-2xl font-bold text-foreground pt-8">Conclusion</h2>
        <p>Beta-adjusted analysis is essential for evaluating whether returns are due to skill or simply taking more risk. Use it to assess portfolio managers and your own investment decisions.</p>
      </section>

      {/* FAQ Section */}
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <Info className="h-5 w-5" />
            Frequently Asked Questions
          </CardTitle>
          <CardDescription>Detailed answers for common portfolio questions</CardDescription>
        </CardHeader>
        <CardContent className="space-y-6">
          <div>
            <h4 className="font-semibold mb-2">What is beta in portfolio management?</h4>
            <p className="text-muted-foreground">Beta measures sensitivity of a portfolio’s returns to market movements (beta 1.0 ≈ market risk). Higher beta implies greater volatility versus the market.</p>
          </div>
          <div>
            <h4 className="font-semibold mb-2">How is CAPM-expected return calculated?</h4>
            <p className="text-muted-foreground">Using CAPM: expected return = risk-free rate + beta × (market return − risk-free rate).</p>
          </div>
          <div>
            <h4 className="font-semibold mb-2">What is alpha?</h4>
            <p className="text-muted-foreground">Alpha is the difference between actual return and CAPM-expected return. Positive alpha indicates risk-adjusted outperformance.</p>
          </div>
          <div>
            <h4 className="font-semibold mb-2">Why adjust actual return by beta?</h4>
            <p className="text-muted-foreground">Beta-adjusting normalizes return for market sensitivity, enabling fair comparisons across portfolios with different risk levels.</p>
          </div>
          <div>
            <h4 className="font-semibold mb-2">Which period should I use for beta?</h4>
            <p className="text-muted-foreground">Use a recent window matching your investment horizon (e.g., 2–5 years) and a relevant benchmark index.</p>
          </div>
          <div>
            <h4 className="font-semibold mb-2">Can alpha be negative and still acceptable?</h4>
            <p className="text-muted-foreground">Yes. If a portfolio targets lower risk or other objectives, slight negative alpha may be acceptable relative to goals.</p>
          </div>
          <div>
            <h4 className="font-semibold mb-2">Does CAPM work for all assets?</h4>
            <p className="text-muted-foreground">CAPM is a simplification. Multi-factor models (e.g., Fama-French) can better explain returns across asset classes.</p>
          </div>
          <div>
            <h4 className="font-semibold mb-2">How often should I recalculate beta?</h4>
            <p className="text-muted-foreground">Re-estimate at least annually or after strategy changes, regime shifts, or major market events.</p>
          </div>
          <div>
            <h4 className="font-semibold mb-2">What if beta is near zero?</h4>
            <p className="text-muted-foreground">Beta-adjusted metrics become less meaningful; consider absolute/relative return or factor analysis instead.</p>
          </div>
          <div>
            <h4 className="font-semibold mb-2">Which benchmark should I pick?</h4>
            <p className="text-muted-foreground">Choose a benchmark aligned with your portfolio’s asset mix and geography (e.g., S&P 500, MSCI ACWI).</p>
          </div>
        </CardContent>
      </Card>
    </div>
  );
}



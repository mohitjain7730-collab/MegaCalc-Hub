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
      <div itemScope itemType="https://schema.org/FinanceSummary">
        <section className="space-y-6 text-muted-foreground leading-relaxed bg-card p-6 md:p-10 rounded-lg shadow-lg">
          <h1 className="text-3xl md:text-4xl font-extrabold text-foreground mb-4" itemProp="name">The Definitive Guide to Beta & CAPM</h1>
          <meta itemProp="description" content="Master risk-adjusted returns with our Beta Adjusted Portfolio Calculator. Understand CAPM, Alpha, and how to evaluate investment performance versus market risk." />
          <meta itemProp="author" content="MegaCalc Hub" />
          <meta itemProp="keywords" content="Beta Adjusted Return, CAPM Calculator, Portfolio Alpha, Investment Risk, Risk-Adjusted Performance, Sharpe Ratio, Treynor Ratio" />

          <p className="text-lg italic text-muted-foreground">Learn how to measure risk-adjusted performance using CAPM and alpha.</p>

          <h2 className="text-2xl font-bold text-foreground mt-8 mb-4" itemProp="articleSection">What is Beta-Adjusted Return?</h2>
          <p>Beta-adjusted return compares your actual performance to what CAPM predicts given your risk level. The difference is alpha—a measure of manager skill or stock selection ability.</p>

          <h2 className="text-2xl font-bold text-foreground mt-8 mb-4" itemProp="articleSection">Understanding Beta</h2>
          <div className="grid grid-cols-1 md:grid-cols-3 gap-4 mb-6">
            <div className="p-4 bg-muted/50 rounded-lg border">
              <h3 className="font-bold text-primary mb-2">Beta = 1.0</h3>
              <p className="text-sm">Portfolio moves in lockstep with the market. Expected return equals market return.</p>
            </div>
            <div className="p-4 bg-muted/50 rounded-lg border">
              <h3 className="font-bold text-green-600 mb-2">Beta &lt; 1.0</h3>
              <p className="text-sm">Less volatile (defensive). Expected return is lower, but capital is safer.</p>
            </div>
            <div className="p-4 bg-muted/50 rounded-lg border">
              <h3 className="font-bold text-red-600 mb-2">Beta &gt; 1.0</h3>
              <p className="text-sm">More volatile (aggressive). Higher potential return, but bigger drawdowns.</p>
            </div>
          </div>

          <h2 className="text-2xl font-bold text-foreground mt-8 mb-4" itemProp="articleSection">Interpreting Alpha</h2>
          <ul className="list-disc ml-6 space-y-2">
            <li><strong>Positive Alpha:</strong> Outperformed risk-adjusted expectations—good stock selection or timing.</li>
            <li><strong>Negative Alpha:</strong> Underperformed—returns didn't compensate for risk taken.</li>
            <li><strong>Zero Alpha:</strong> Performance matched CAPM expectation exactly (typical for index funds).</li>
          </ul>

          <h2 className="text-2xl font-bold text-foreground pt-8">Conclusion</h2>
          <p>Beta-adjusted analysis is essential for evaluating whether returns are due to skill or simply taking more risk. Use it to assess portfolio managers and your own investment decisions.</p>
        </section>

        {/* FAQ Section */}
        <section className="mt-8">
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <Info className="h-5 w-5" />
                Frequently Asked Questions
              </CardTitle>
              <CardDescription>Detailed answers for common portfolio questions</CardDescription>
            </CardHeader>
            <CardContent className="space-y-6">
              <div itemScope itemProp="mainEntity" itemType="https://schema.org/Question">
                <h4 className="font-semibold text-lg mb-3" itemProp="name">What does a Beta greater than 1 mean?</h4>
                <div itemScope itemProp="acceptedAnswer" itemType="https://schema.org/Answer">
                  <p className="text-muted-foreground" itemProp="text">It means the asset is more volatile than the market. If the market goes up 10%, a stock with a beta of 1.5 is expected to go up 15%. Conversely, if the market falls 10%, it's expected to fall 15%.</p>
                </div>
              </div>

              <div itemScope itemProp="mainEntity" itemType="https://schema.org/Question">
                <h4 className="font-semibold text-lg mb-3" itemProp="name">Can Beta be negative?</h4>
                <div itemScope itemProp="acceptedAnswer" itemType="https://schema.org/Answer">
                  <p className="text-muted-foreground" itemProp="text">Yes. A negative beta means the asset tends to move in the opposite direction of the market. Gold or inverse ETFs sometimes exhibit negative beta, serving as a hedge during market downturns.</p>
                </div>
              </div>

              <div itemScope itemProp="mainEntity" itemType="https://schema.org/Question">
                <h4 className="font-semibold text-lg mb-3" itemProp="name">How is CAPM-expected return calculated?</h4>
                <div itemScope itemProp="acceptedAnswer" itemType="https://schema.org/Answer">
                  <p className="text-muted-foreground" itemProp="text">The formula is: <code>Expected Return = Risk-Free Rate + Beta × (Market Return − Risk-Free Rate)</code>. This compensates you for the time value of money (Rf) and the risk taken (Beta).</p>
                </div>
              </div>

              <div itemScope itemProp="mainEntity" itemType="https://schema.org/Question">
                <h4 className="font-semibold text-lg mb-3" itemProp="name">What is Alpha?</h4>
                <div itemScope itemProp="acceptedAnswer" itemType="https://schema.org/Answer">
                  <p className="text-muted-foreground" itemProp="text">Alpha is the excess return above what CAPM predicts. Positive alpha implies the manager added value through skill. Negative alpha implies underperformance relative to the risk taken.</p>
                </div>
              </div>

              <div itemScope itemProp="mainEntity" itemType="https://schema.org/Question">
                <h4 className="font-semibold text-lg mb-3" itemProp="name">What are the limitations of CAPM?</h4>
                <div itemScope itemProp="acceptedAnswer" itemType="https://schema.org/Answer">
                  <p className="text-muted-foreground" itemProp="text">CAPM assumes markets are efficient, investors are rational, and beta is constant. In reality, markets have anomalies, behaviors differ, and beta changes over time. Multi-factor models often provide better explanations.</p>
                </div>
              </div>

              <div itemScope itemProp="mainEntity" itemType="https://schema.org/Question">
                <h4 className="font-semibold text-lg mb-3" itemProp="name">What should I use for the Risk-Free Rate?</h4>
                <div itemScope itemProp="acceptedAnswer" itemType="https://schema.org/Answer">
                  <p className="text-muted-foreground" itemProp="text">Typically, the yield on a 3-month or 10-year US Treasury bond is used as a proxy for the risk-free rate, depending on the investment horizon.</p>
                </div>
              </div>

              <div itemScope itemProp="mainEntity" itemType="https://schema.org/Question">
                <h4 className="font-semibold text-lg mb-3" itemProp="name">How often does Beta change?</h4>
                <div itemScope itemProp="acceptedAnswer" itemType="https://schema.org/Answer">
                  <p className="text-muted-foreground" itemProp="text">Beta is not static. It changes as a company's business model, debt levels, or market conditions evolve. It's recommended to recalculate or check beta regularly (e.g., quarterly).</p>
                </div>
              </div>

              <div itemScope itemProp="mainEntity" itemType="https://schema.org/Question">
                <h4 className="font-semibold text-lg mb-3" itemProp="name">Is a higher Beta always bad?</h4>
                <div itemScope itemProp="acceptedAnswer" itemType="https://schema.org/Answer">
                  <p className="text-muted-foreground" itemProp="text">No. High beta allows for higher expected returns in a bull market. It's only "bad" if you cannot tolerate the associated volatility or if the market turns bearish.</p>
                </div>
              </div>

              <div itemScope itemProp="mainEntity" itemType="https://schema.org/Question">
                <h4 className="font-semibold text-lg mb-3" itemProp="name">What is Jensen's Alpha?</h4>
                <div itemScope itemProp="acceptedAnswer" itemType="https://schema.org/Answer">
                  <p className="text-muted-foreground" itemProp="text">Jensen's Alpha is the technical name for the alpha calculated using the CAPM model, as done in this calculator. It measures the abnormal return of a portfolio over the theoretical expected return.</p>
                </div>
              </div>
            </CardContent>
          </Card>
        </section>

        {/* Summary Section */}
        <div className="mt-8">
          <Card className="mb-6">
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <TrendingUp className="h-5 w-5" />
                Summary
              </CardTitle>
            </CardHeader>
            <CardContent className="space-y-2 text-sm text-muted-foreground">
              <p>The Beta-Adjusted Portfolio Return Calculator helps you assess whether your portfolio's returns justify the risk taken.</p>
              <p>It calculates the expected return based on market risk (beta) and compares it to your actual return to find Alpha.</p>
              <p>Use this to separate luck and general market movements from true investment skill.</p>
            </CardContent>
          </Card>
        </div>
      </div>
    </div>
  );
}



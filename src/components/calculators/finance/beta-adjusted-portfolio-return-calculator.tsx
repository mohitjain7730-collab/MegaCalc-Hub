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
      <section className="space-y-6 text-muted-foreground leading-relaxed bg-card p-6 md:p-10 rounded-lg shadow-lg" itemScope itemType="https://schema.org/FinanceSummary">
        {/* SEO & SCHEMA METADATA */}
        <meta itemProp="name" content="The Definitive Guide to Beta & CAPM: Measuring Risk-Adjusted Returns" />
        <meta itemProp="description" content="Master risk-adjusted returns with our Beta Adjusted Portfolio Calculator. Understand CAPM, Jensen's Alpha, and how to evaluate investment skill versus market luck." />
        <meta itemProp="keywords" content="Beta Adjusted Return, CAPM Calculator, Jensen's Alpha, Portfolio Beta, Risk-Adjusted Performance, Systematic Risk, Market Risk Premium" />
        <meta itemProp="author" content="[Your Site's Financial Analyst Team]" />
        <meta itemProp="datePublished" content="2025-11-15" />
        <meta itemProp="url" content="/definitive-guide-beta-capm" />

        <h1 className="text-3xl md:text-4xl font-extrabold text-foreground mb-4" itemProp="headline">The Definitive Guide to Beta & CAPM: Are You Generating Alpha?</h1>
        <p className="text-lg italic text-muted-foreground">"Don't confuse brains with a bull market." Beta-adjusted returns separate true skill (Alpha) from simply riding a risky wave.</p>

        <h2 className="text-2xl font-bold text-foreground mt-8 mb-4">Table of Contents</h2>
        <ul className="list-disc ml-6 space-y-2 text-primary">
          <li><a href="#what-is-capm" className="hover:underline">What is the Capital Asset Pricing Model?</a></li>
          <li><a href="#understanding-beta" className="hover:underline">Decoding Beta: Volatility Explained</a></li>
          <li><a href="#alpha-vs-beta" className="hover:underline">The Battle: Alpha vs. Beta</a></li>
          <li><a href="#calculation" className="hover:underline">The Formula Breakdown</a></li>
          <li><a href="#weaknesses" className="hover:underline">Blind Spots of the Model</a></li>
        </ul>
        <hr />

        <h2 id="what-is-capm" className="text-2xl font-bold text-foreground pt-8" itemProp="articleSection">What is the Capital Asset Pricing Model (CAPM)?</h2>
        <p>CAPM is a Nobel Prize-winning theory that defines the relationship between risk and expected return. It argues that there are two types of risk:</p>
        <ul className="list-disc ml-6 space-y-2">
          <li><strong>Systematic Risk (Beta):</strong> The inherent risk of the entire market. You cannot diversify this away. You <em>should</em> be compensated for taking it.</li>
          <li><strong>Unsystematic Risk (Alpha):</strong> Company-specific risk (e.g., a CEO scandal). You can diversify this away, so the market <em>does not</em> owe you extra return for taking it.</li>
        </ul>
        <hr />

        <h2 id="understanding-beta" className="text-2xl font-bold text-foreground pt-8" itemProp="articleSection">Decoding Beta: Volatility Explained</h2>
        <p>Beta (β) measures sensitivity to the market.</p>
        <div className="grid grid-cols-1 md:grid-cols-3 gap-4 my-4">
          <div className="p-4 bg-muted/50 rounded-lg border border-l-4 border-emerald-500">
            <h3 className="font-bold mb-2">Beta &lt; 1 (Defensive)</h3>
            <p className="text-sm">Utilities, Consumer Staples. They fall less in crashes but rise less in booms.</p>
          </div>
          <div className="p-4 bg-muted/50 rounded-lg border border-l-4 border-blue-500">
            <h3 className="font-bold mb-2">Beta = 1 (Market)</h3>
            <p className="text-sm">S&P 500 Index Funds. You get the market return, no more, no less.</p>
          </div>
          <div className="p-4 bg-muted/50 rounded-lg border border-l-4 border-red-500">
            <h3 className="font-bold mb-2">Beta &gt; 1 (Aggressive)</h3>
            <p className="text-sm">Tech, Biotech, Small Caps. High voltage. Big swings in both directions.</p>
          </div>
        </div>
        <hr />

        <h2 id="alpha-vs-beta" className="text-2xl font-bold text-foreground pt-8" itemProp="articleSection">The Battle: Alpha vs. Beta</h2>
        <p><strong>Alpha (α)</strong> is the Holy Grail. It is the excess return you earned <em>beyond</em> what your risk level predicted.</p>
        <p>If you took huge risks (Beta 2.0) and made 20% when the market made 10%, your Alpha is 0. You didn't beat the market; you just levered it. But if you took <em>less</em> risk (Beta 0.5) and <em>still</em> made 20%, you are a genius. That's massive Alpha.</p>
        <hr />

        <h2 id="calculation" className="text-2xl font-bold text-foreground pt-8" itemProp="articleSection">The Formula Breakdown</h2>
        <p className="font-mono bg-muted p-2 rounded">Expected Return = Rf + β(Rm - Rf)</p>
        <ul className="list-disc ml-6 space-y-2">
          <li><strong>Rf (Risk-Free Rate):</strong> Usually the 10-Year Treasury yield. The return for taking zero risk.</li>
          <li><strong>Rm (Market Return):</strong> Historical average of the stock market (often used as ~8-10%).</li>
          <li><strong>(Rm - Rf):</strong> The "Equity Risk Premium." The extra juice you get for buying stocks instead of bonds.</li>
        </ul>
      </section>

      {/* FAQs */}
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <Info className="h-5 w-5" />
            Frequently Asked Questions
          </CardTitle>
          <CardDescription>Detailed answers about CAPM and Beta</CardDescription>
        </CardHeader>
        <CardContent className="space-y-6">
          <div>
            <h4 className="font-semibold text-lg mb-3">Is a negative Beta good?</h4>
            <p className="text-muted-foreground">
              It depends. Negative beta assets (like Gold or Put options) tend to rise when the market crashes. They are excellent "insurance" policies that reduce portfolio risk, but they usually drag down performance during normal bull markets.
            </p>
          </div>

          <div>
            <h4 className="font-semibold text-lg mb-3">Why is my Alpha negative even with positive returns?</h4>
            <p className="text-muted-foreground">
              This is the painful truth of risk adjustment. If you made 15% (great!), but you held a risky portfolio that CAPM predicted should make 18% given the bull market, you actually <em>underperformed</em> by -3%. You took risk but didn't get fully paid for it.
            </p>
          </div>

          <div>
            <h4 className="font-semibold text-lg mb-3">Where do I find Beta for my portfolio?</h4>
            <p className="text-muted-foreground">
              Most brokerage platforms show "Portfolio Beta" in their analysis tools. Alternatively, you can take the weighted average of the betas of your individual holdings.
            </p>
          </div>

          <div>
            <h4 className="font-semibold text-lg mb-3">What is "Jensen's Alpha"?</h4>
            <p className="text-muted-foreground">
              Jensen's Alpha is technically what this calculator computes. It's the standard metric for mutual fund managers, quantifying how much they beat the "theoretical machine" of the CAPM model.
            </p>
          </div>

          <div>
            <h4 className="font-semibold text-lg mb-3">Does Alpha persist?</h4>
            <p className="text-muted-foreground">
              Academic research suggests Alpha is fleeting. Managers who beat the market one year rarely do so consistently for decade. This is the core argument for Passive Index Investing (Beta) over Active Management (seeking Alpha).
            </p>
          </div>

          <div>
            <h4 className="font-semibold text-lg mb-3">How does leverage affect Beta?</h4>
            <p className="text-muted-foreground">
              Leverage magnifies Beta. If you own the S&P 500 (Beta 1.0) on 2x margin, your portfolio Beta becomes 2.0. You now need twice the market return just to generate zero Alpha.
            </p>
          </div>

          <div>
            <h4 className="font-semibold text-lg mb-3">Can I use this for crypto?</h4>
            <p className="text-muted-foreground">
              Yes, but define your "Market". If you compare Crypto to the S&P 500, the Beta might be low (uncorrelated), but the volatility is huge, which CAPM imperfectly captures. Better to compare Crypto Portfolio vs. Bitcoin Index.
            </p>
          </div>

          <div>
            <h4 className="font-semibold text-lg mb-3">What are the flaws of CAPM?</h4>
            <p className="text-muted-foreground">
              It assumes normal distributions (no "black swans"), constant correlations, and rational investors. In reality, markets have "fat tails" (crashes happen often) and behavioral biases. Use CAPM as a guideline, not a law of physics.
            </p>
          </div>
        </CardContent>
      </Card>

      {/* Summary Section */}
      <Card className="mb-6">
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <TrendingUp className="h-5 w-5" />
            Summary
          </CardTitle>
        </CardHeader>
        <CardContent className="space-y-2 text-sm text-muted-foreground">
          <p>The Beta-Adjusted Portfolio Return Calculator separates skill (Alpha) from market exposure (Beta).</p>
          <p>It helps you answer the crucial question: "Am I actually a good investor, or did I just take a lot of risk in a bull market?"</p>
          <p>Use it to grade your performance fairly against the risks you undertook.</p>
        </CardContent>
      </Card>
    </div>
  );
}



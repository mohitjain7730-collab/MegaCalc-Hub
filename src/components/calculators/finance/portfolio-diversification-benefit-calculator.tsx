'use client';

import { useState } from 'react';
import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import { z } from 'zod';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Form, FormControl, FormField, FormItem, FormLabel, FormMessage } from '@/components/ui/form';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Calculator, Info, Shield, LineChart, Target, AlertCircle, CheckCircle2 } from 'lucide-react';
import { Badge } from '@/components/ui/badge';
import { Alert, AlertDescription } from '@/components/ui/alert';

const formSchema = z.object({
  w1: z.number().min(0).max(100).optional(),
  w2: z.number().min(0).max(100).optional(),
  s1: z.number().min(0).max(500).optional(),
  s2: z.number().min(0).max(500).optional(),
  rho: z.number().min(-1).max(1).optional(),
});

type FormValues = z.infer<typeof formSchema>;

type Result = {
  weightedStd: number;
  portfolioStd: number;
  diversificationBenefitAbs: number;
  diversificationBenefitPct: number;
  interpretation: string;
  suggestions: string[];
};

export default function PortfolioDiversificationBenefitCalculator() {
  const [result, setResult] = useState<Result | null>(null);

  const form = useForm<FormValues>({
    resolver: zodResolver(formSchema),
    defaultValues: {
      w1: undefined as unknown as number,
      w2: undefined as unknown as number,
      s1: undefined as unknown as number,
      s2: undefined as unknown as number,
      rho: undefined as unknown as number,
    },
  });

  const onSubmit = (v: FormValues) => {
    if (
      v.w1 === undefined || v.w2 === undefined ||
      v.s1 === undefined || v.s2 === undefined || v.rho === undefined
    ) {
      setResult(null);
      return;
    }
    const w1 = v.w1 / 100;
    const w2 = v.w2 / 100;
    const s1 = v.s1 / 100;
    const s2 = v.s2 / 100;
    const cov = v.rho * s1 * s2;
    const weightedStd = (w1 * s1 + w2 * s2) * 100;
    const variance = (w1 * w1 * s1 * s1) + (w2 * w2 * s2 * s2) + (2 * w1 * w2 * cov);
    const portfolioStd = Math.sqrt(variance) * 100;
    const diversificationBenefitAbs = Math.max(0, weightedStd - portfolioStd);
    const diversificationBenefitPct = weightedStd > 0 ? (diversificationBenefitAbs / weightedStd) * 100 : 0;

    const interpretation = v.rho < 1
      ? 'Diversification reduces risk versus the weighted average of individual risks.'
      : 'With perfect correlation, diversification benefit is minimal or zero.';
    const suggestions = [
      'Seek assets with low or negative correlation for stronger benefits.',
      'Avoid excessive concentration; cap max position sizes.',
      'Refresh correlations periodically; relationships can change.',
      'Consider regime shifts that alter co-movement across assets.',
    ];

    setResult({ weightedStd, portfolioStd, diversificationBenefitAbs, diversificationBenefitPct, interpretation, suggestions });
  };

  return (
    <div className="space-y-8">
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <Shield className="h-5 w-5" />
            Portfolio Diversification Benefit Calculator
          </CardTitle>
          <CardDescription>Quantify risk reduction from combining two assets.</CardDescription>
        </CardHeader>
        <CardContent>
          <Form {...form}>
            <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-6">
              <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
                <FormField control={form.control} name="w1" render={({ field }) => (
                  <FormItem>
                    <FormLabel>Weight Asset 1 (%)</FormLabel>
                    <FormControl>
                      <Input type="number" step="0.1" {...field}
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
                <FormField control={form.control} name="w2" render={({ field }) => (
                  <FormItem>
                    <FormLabel>Weight Asset 2 (%)</FormLabel>
                    <FormControl>
                      <Input type="number" step="0.1" {...field}
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
                <div className="text-sm text-muted-foreground self-end">Weights should sum to 100%</div>
                <FormField control={form.control} name="s1" render={({ field }) => (
                  <FormItem>
                    <FormLabel>Asset 1 Std. Dev. (%)</FormLabel>
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
                    <FormLabel>Asset 2 Std. Dev. (%)</FormLabel>
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
        <>
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <LineChart className="h-5 w-5" />
                Results & Insights
              </CardTitle>
              <CardDescription>Risk reduction from diversification</CardDescription>
            </CardHeader>
            <CardContent className="space-y-6">
              <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
                <div className="p-4 border rounded-lg">
                  <p className="text-sm text-muted-foreground">Weighted Average Std</p>
                  <p className="text-2xl font-bold">{result.weightedStd.toFixed(2)}%</p>
                </div>
                <div className="p-4 border rounded-lg">
                  <p className="text-sm text-muted-foreground">Portfolio Std</p>
                  <p className="text-2xl font-bold">{result.portfolioStd.toFixed(2)}%</p>
                </div>
                <div className="p-4 border rounded-lg">
                  <p className="text-sm text-muted-foreground">Benefit (Abs)</p>
                  <p className="text-2xl font-bold">{result.diversificationBenefitAbs.toFixed(2)}%</p>
                </div>
                <div className="p-4 border rounded-lg">
                  <p className="text-sm text-muted-foreground">Benefit (%)</p>
                  <p className="text-2xl font-bold">{result.diversificationBenefitPct.toFixed(2)}%</p>
                </div>
              </div>
              <div>
                <h4 className="font-semibold mb-2">Interpretation</h4>
                <p className="text-muted-foreground">{result.interpretation}</p>
              </div>
            </CardContent>
          </Card>

          {/* Strategic Insights & Risk Assessment */}
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            <Card className="h-full">
              <CardHeader>
                <CardTitle className="flex items-center gap-2 text-xl text-primary">
                  <Target className="h-6 w-6" />
                  Strategic Insights
                </CardTitle>
                <CardDescription>Diversification optimization</CardDescription>
              </CardHeader>
              <CardContent className="space-y-4">
                <div className="flex items-start gap-3 p-3 bg-primary/5 rounded-lg border border-primary/10">
                  <CheckCircle2 className="h-5 w-5 text-primary mt-0.5 shrink-0" />
                  <span className="text-sm font-medium">Diversification benefit of {result.diversificationBenefitPct.toFixed(1)}% risk reduction</span>
                </div>
                <div className="flex items-start gap-3 p-3 bg-primary/5 rounded-lg border border-primary/10">
                  <CheckCircle2 className="h-5 w-5 text-primary mt-0.5 shrink-0" />
                  <span className="text-sm font-medium">Portfolio risk ({result.portfolioStd.toFixed(2)}%) is lower than weighted average ({result.weightedStd.toFixed(2)}%)</span>
                </div>
                {result.suggestions.slice(0, 2).map((s, i) => (
                  <div key={i} className="flex items-start gap-3 p-3 bg-primary/5 rounded-lg border border-primary/10">
                    <CheckCircle2 className="h-5 w-5 text-primary mt-0.5 shrink-0" />
                    <span className="text-sm font-medium">{s}</span>
                  </div>
                ))}
              </CardContent>
            </Card>

            <Card className="h-full border-red-100 bg-red-50/10 dark:border-red-900/20 dark:bg-red-900/5">
              <CardHeader>
                <CardTitle className="flex items-center gap-2 text-xl text-red-600 dark:text-red-400">
                  <AlertCircle className="h-6 w-6" />
                  Risk Assessment
                </CardTitle>
                <CardDescription>Critical factors to monitor</CardDescription>
              </CardHeader>
              <CardContent className="space-y-4">
                {result.suggestions.slice(2).map((s, i) => (
                  <div key={i} className="flex items-start gap-3 p-3 bg-red-50 dark:bg-red-900/10 rounded-lg border border-red-100 dark:border-red-900/20">
                    <AlertCircle className="h-5 w-5 text-red-600 dark:text-red-400 mt-0.5 shrink-0" />
                    <span className="text-sm font-medium text-red-800 dark:text-red-300">{s}</span>
                  </div>
                ))}
                <div className="flex items-start gap-3 p-3 bg-red-50 dark:bg-red-900/10 rounded-lg border border-red-100 dark:border-red-900/20">
                  <AlertCircle className="h-5 w-5 text-red-600 dark:text-red-400 mt-0.5 shrink-0" />
                  <span className="text-sm font-medium text-red-800 dark:text-red-300">Diversification does not eliminate systematic market risk</span>
                </div>
              </CardContent>
            </Card>
          </div>
        </>
      )}

      {/* Related Calculators */}
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <Calculator className="h-5 w-5" />
            Related Calculators
          </CardTitle>
          <CardDescription>More on risk management</CardDescription>
        </CardHeader>
        <CardContent>
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div className="p-4 border rounded-lg hover:bg-muted/50 transition-colors">
              <h4 className="font-semibold mb-2"><a href="/category/finance/risk-parity-portfolio-calculator" className="text-primary hover:underline">Standard Deviation Calculator</a></h4>
              <p className="text-sm text-muted-foreground">Gauge single-asset risk.</p>
            </div>
            <div className="p-4 border rounded-lg hover:bg-muted/50 transition-colors">
              <h4 className="font-semibold mb-2"><a href="/category/finance/inflation-calculator" className="text-primary hover:underline">Inflation Calculator</a></h4>
              <p className="text-sm text-muted-foreground">Adjust returns for inflation impact.</p>
            </div>
            <div className="p-4 border rounded-lg hover:bg-muted/50 transition-colors">
              <h4 className="font-semibold mb-2"><a href="/category/finance/return-on-investment-calculator" className="text-primary hover:underline">ROI Calculator</a></h4>
              <p className="text-sm text-muted-foreground">Evaluate outcome vs. risk taken.</p>
            </div>
            <div className="p-4 border rounded-lg hover:bg-muted/50 transition-colors">
              <h4 className="font-semibold mb-2"><a href="/category/finance/portfolio-variance-calculator" className="text-primary hover:underline">Portfolio Variance Calculator</a></h4>
              <p className="text-sm text-muted-foreground">Estimate total volatility.</p>
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
              Portfolio σ = √(w₁²σ₁² + w₂²σ₂² + 2w₁w₂ρσ₁σ₂)
            </p>
            <p className="font-mono text-sm text-center mt-2">
              Benefit = Weighted Avg σ - Portfolio σ
            </p>
          </div>
          <p className="text-sm text-muted-foreground mt-2">
            When correlation (ρ) is less than 1, portfolio risk is lower than the weighted sum of parts.
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
              <h4 className="font-semibold mb-2">Weights (%)</h4>
              <p className="text-sm text-muted-foreground">Portfolio allocation to each asset. Should sum to 100%.</p>
            </div>
            <div className="p-4 bg-muted/50 rounded-lg">
              <h4 className="font-semibold mb-2">Standard Deviations (%)</h4>
              <p className="text-sm text-muted-foreground">Volatility of each asset's returns (annualized).</p>
            </div>
            <div className="p-4 bg-muted/50 rounded-lg">
              <h4 className="font-semibold mb-2">Correlation (ρ)</h4>
              <p className="text-sm text-muted-foreground">How assets move together (-1 to +1). Lower = better diversification.</p>
            </div>
          </div>
        </CardContent>
      </Card>

      {/* Complete SEO Guide */}
      <section className="space-y-6 text-muted-foreground leading-relaxed bg-card p-6 md:p-10 rounded-lg shadow-lg" itemScope itemType="https://schema.org/FinanceSummary">
        {/* SEO & SCHEMA METADATA */}
        <meta itemProp="name" content="The Definitive Guide to Portfolio Diversification: The Only Free Lunch" />
        <meta itemProp="description" content="Quantify the benefits of diversification. Learn how correlation, covariance, and asset weighting reduce portfolio volatility without sacrificing expected returns." />
        <meta itemProp="keywords" content="Portfolio Diversification Benefit, Correlation Coefficient, Unsystematic Risk, Portfolio Standard Deviation Formula, Volatility Reduction, Asset Allocation Strategy" />
        <meta itemProp="author" content="[Your Site's Financial Analyst Team]" />
        <meta itemProp="datePublished" content="2025-11-15" />
        <meta itemProp="url" content="/definitive-guide-diversification-benefit" />

        <h1 className="text-3xl md:text-4xl font-extrabold text-foreground mb-4" itemProp="headline">The Definitive Guide to Diversification: Why It Works Mathematically</h1>
        <p className="text-lg italic text-muted-foreground">"Diversification is the only free lunch in investing." – Harry Markowitz. This calculator shows you exactly how big that lunch is.</p>

        <h2 className="text-2xl font-bold text-foreground mt-8 mb-4">Table of Contents</h2>
        <ul className="list-disc ml-6 space-y-2 text-primary">
          <li><a href="#definition" className="hover:underline">What is Diversification Benefit?</a></li>
          <li><a href="#systematic-vs-unsystematic" className="hover:underline">Systematic vs. Unsystematic Risk</a></li>
          <li><a href="#correlation-spectrum" className="hover:underline">The Correlation Spectrum</a></li>
          <li><a href="#limitations" className="hover:underline">When Diversification Fails</a></li>
        </ul>
        <hr />

        <h2 id="definition" className="text-2xl font-bold text-foreground pt-8" itemProp="articleSection">What is Diversification Benefit?</h2>
        <p>It is the mathematical reduction in risk that occurs when you combine assets that do not move perfectly in sync.</p>
        <p>If you hold two risky stocks that always move opposite to each other, your <em>average</em> return remains the same, but your volatility (risk) could theoretically drop to zero. That gap—between the weighted average risk and the actual portfolio risk—is the "Benefit."</p>
        <hr />

        <h2 id="systematic-vs-unsystematic" className="text-2xl font-bold text-foreground pt-8" itemProp="articleSection">Systematic vs. Unsystematic Risk</h2>
        <p>Diversification kills <strong>Unsystematic Risk</strong> (Company-specific problems like a CEO quitting or a factory fire). By holding 20-30 stocks, this risk virtually disappears.</p>
        <p>It <em>cannot</em> kill <strong>Systematic Risk</strong> (Market-wide problems like interest rate hikes, inflation, or wars). This baseline risk remains, no matter how many stocks you buy.</p>
        <hr />

        <h2 id="correlation-spectrum" className="text-2xl font-bold text-foreground pt-8" itemProp="articleSection">The Correlation Spectrum</h2>
        <div className="grid grid-cols-1 md:grid-cols-3 gap-4 my-4">
          <div className="p-4 bg-muted/50 rounded-lg border border-l-4 border-red-500">
            <h3 className="font-bold mb-2">+1.0 (Perfect Positive)</h3>
            <p className="text-sm">Two identical index funds. Zero diversification benefit. Risk is additive.</p>
          </div>
          <div className="p-4 bg-muted/50 rounded-lg border border-l-4 border-yellow-500">
            <h3 className="font-bold mb-2">0.0 (Uncorrelated)</h3>
            <p className="text-sm">Stocks vs. Rain in Brazil. Zero relationship. Significant risk reduction.</p>
          </div>
          <div className="p-4 bg-muted/50 rounded-lg border border-l-4 border-emerald-500">
            <h3 className="font-bold mb-2">-1.0 (Perfect Negative)</h3>
            <p className="text-sm">Safety. When one zigs, the other zags. Can create a zero-risk portfolio.</p>
          </div>
        </div>
        <hr />

        <h2 id="limitations" className="text-2xl font-bold text-foreground pt-8" itemProp="articleSection">When Diversification Fails</h2>
        <p>During financial crises (like 2008 or 2020), correlations tend to converge to 1. "In a crisis, all correlations go to one." This means diversification often disappears exactly when you need it most. This is why some investors use "Tail Risk Hedging" (buying insurance options) instead of just relying on diversification.</p>
      </section>

      {/* FAQs */}
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <Info className="h-5 w-5" />
            Frequently Asked Questions
          </CardTitle>
          <CardDescription>Deep dive into risk mechanics</CardDescription>
        </CardHeader>
        <CardContent className="space-y-6">
          <div>
            <h4 className="font-semibold text-lg mb-3">Does diversification lower returns?</h4>
            <p className="text-muted-foreground">
              Not expected returns. It lowers <em>variance</em> around that return. However, it does ensure you will never be the top performer (because you own the losers too), but you will never be the bottom performer (because you own the winners). It narrows the range of outcomes.
            </p>
          </div>

          <div>
            <h4 className="font-semibold text-lg mb-3">How many stocks do I need to be diversified?</h4>
            <p className="text-muted-foreground">
              Old finance textbooks said 20-30 stocks eliminatd 90% of unsystematic risk. Modern research suggests you might need more (50+) due to increased global correlation. An Index Fund (500+ stocks) is the simplest solution.
            </p>
          </div>

          <div>
            <h4 className="font-semibold text-lg mb-3">What is "Di-worse-ification"?</h4>
            <p className="text-muted-foreground">
              A term coined by Peter Lynch. It means adding assets to your portfolio that you don't understand or that have poor expected returns, just for the sake of "diversification." Never buy junk just to be different.
            </p>
          </div>

          <div>
            <h4 className="font-semibold text-lg mb-3">Is International diversification necessary?</h4>
            <p className="text-muted-foreground">
              Debatable. US companies (S&P 500) generate ~40% of revenue overseas. Some argue that's enough global exposure. Others argue you need distinct Emerging Market exposure to capture different growth cycles.
            </p>
          </div>

          <div>
            <h4 className="font-semibold text-lg mb-3">How do I calculate covariance?</h4>
            <p className="text-muted-foreground">
              Covariance = Correlation × StdDev(A) × StdDev(B). It's the "raw" measure of how two variables move together. Correlation is just the standardized version (scaled between -1 and 1) that is easier for humans to understand.
            </p>
          </div>

          <div>
            <h4 className="font-semibold text-lg mb-3">Does this work for Crypto?</h4>
            <p className="text-muted-foreground">
              Only if you diversify <em>outside</em> of crypto. Bitcoin and Ethereum have historically had very high correlation. To get a benefit, you would need to combine Crypto (high risk) with Stablecoins or Traditional Equities.
            </p>
          </div>

          <div>
            <h4 className="font-semibold text-lg mb-3">What is the "Volatility Tax"?</h4>
            <p className="text-muted-foreground">
              It's the mathematical drag on compounding caused by variance. If you lose 50%, you need a 100% gain to get back to even. By reducing volatility (via diversification), you reduce this "tax," allowing your money to compound more efficiently over time.
            </p>
          </div>
        </CardContent>
      </Card>

      {/* Summary Section */}
      <Card className="mb-6">
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <Shield className="h-5 w-5" />
            Summary
          </CardTitle>
        </CardHeader>
        <CardContent className="space-y-2 text-sm text-muted-foreground">
          <p>The Portfolio Diversification Benefit Calculator quantifies the immediate risk reduction from asset mixing.</p>
          <p>It proves that a portfolio is greater than the sum of its parts—offering lower risk for the same return potential.</p>
          <p>Use it to sanity-check your asset allocation and avoid unintended concentration risk.</p>
        </CardContent>
      </Card>
    </div>
  );
}



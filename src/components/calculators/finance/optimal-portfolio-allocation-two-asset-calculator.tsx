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

    const interpretation = `Minimum-variance allocation suggests ${(w1Clamped * 100).toFixed(1)}% in Asset 1 and ${(w2Clamped * 100).toFixed(1)}% in Asset 2.`;
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
              <h4 className="font-semibold mb-2"><a href="/category/finance/risk-parity-portfolio-calculator" className="text-primary hover:underline">Standard Deviation Calculator</a></h4>
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
              w₁ = (σ₂² - ρσ₁σ₂) / (σ₁² + σ₂² - 2ρσ₁σ₂)
            </p>
            <p className="font-mono text-sm text-center mt-2">
              Portfolio σ = √(w₁²σ₁² + w₂²σ₂² + 2w₁w₂ρσ₁σ₂)
            </p>
          </div>
          <p className="text-sm text-muted-foreground mt-2">
            This calculates the minimum-variance portfolio weights for two risky assets.
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
              <h4 className="font-semibold mb-2">Expected Returns</h4>
              <p className="text-sm text-muted-foreground">Anticipated annual returns for each asset (use forward-looking estimates).</p>
            </div>
            <div className="p-4 bg-muted/50 rounded-lg">
              <h4 className="font-semibold mb-2">Standard Deviations</h4>
              <p className="text-sm text-muted-foreground">Volatility measure for each asset—higher means more risk.</p>
            </div>
            <div className="p-4 bg-muted/50 rounded-lg">
              <h4 className="font-semibold mb-2">Correlation (ρ)</h4>
              <p className="text-sm text-muted-foreground">How assets move together. Lower correlation = better diversification.</p>
            </div>
          </div>
        </CardContent>
      </Card>

      {/* Complete SEO Guide */}
      <div itemScope itemType="https://schema.org/FinanceSummary">
        <section className="space-y-6 text-muted-foreground leading-relaxed bg-card p-6 md:p-10 rounded-lg shadow-lg">
          <h1 className="text-3xl md:text-4xl font-extrabold text-foreground mb-4" itemProp="name">The Definitive Guide to Optimal Asset Allocation</h1>
          <meta itemProp="description" content="Calculate the optimal portfolio mix for two assets using modern portfolio theory. Minimize risk and maximize diversification." />
          <meta itemProp="author" content="MegaCalc Hub" />
          <meta itemProp="keywords" content="Optimal Portfolio Allocation, Efficient Frontier, Minimum Variance Portfolio, Asset Allocation Calculator, Portfolio Optimization" />

          <p className="text-lg italic text-muted-foreground">Learn how to calculate the minimum-variance portfolio for two risky assets.</p>

          <h2 className="text-2xl font-bold text-foreground mt-8 mb-4" itemProp="articleSection">What is Minimum-Variance Allocation?</h2>
          <p>The minimum-variance portfolio is the combination of two assets that produces the lowest possible volatility. It's a key point on the efficient frontier.</p>

          <h2 className="text-2xl font-bold text-foreground mt-8 mb-4" itemProp="articleSection">The Power of Diversification</h2>
          <p>When assets aren't perfectly correlated (ρ &lt; 1), combining them reduces total portfolio risk. The lower the correlation, the greater the risk reduction benefit.</p>

          <h2 className="text-2xl font-bold text-foreground mt-8 mb-4" itemProp="articleSection">Key Considerations</h2>
          <ul className="list-disc ml-6 space-y-2">
            <li>This calculator assumes no short-selling (weights between 0% and 100%).</li>
            <li>Forward-looking estimates are more useful than historical averages.</li>
            <li>Rebalancing is needed as weights drift over time due to price changes.</li>
          </ul>

          <h2 className="text-2xl font-bold text-foreground pt-8">Conclusion</h2>
          <p>Two-asset optimization is foundational for portfolio construction. Understanding how correlation and volatility interact helps you build better diversified portfolios.</p>
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
                <h4 className="font-semibold text-lg mb-3" itemProp="name">What is minimum-variance allocation?</h4>
                <div itemScope itemProp="acceptedAnswer" itemType="https://schema.org/Answer">
                  <p className="text-muted-foreground" itemProp="text">It’s the portfolio mix with the lowest possible variance (risk) for two assets, given their individual volatilities and correlation. It doesn't necessarily maximize return, but it minimizes fluctuation.</p>
                </div>
              </div>

              <div itemScope itemProp="mainEntity" itemType="https://schema.org/Question">
                <h4 className="font-semibold text-lg mb-3" itemProp="name">Does a lower correlation always reduce risk?</h4>
                <div itemScope itemProp="acceptedAnswer" itemType="https://schema.org/Answer">
                  <p className="text-muted-foreground" itemProp="text">Yes. As long as correlation is less than +1.0, combining assets will result in a portfolio standard deviation lower than the weighted average of the individual standard deviations.</p>
                </div>
              </div>

              <div itemScope itemProp="mainEntity" itemType="https://schema.org/Question">
                <h4 className="font-semibold text-lg mb-3" itemProp="name">Are allocations constrained?</h4>
                <div itemScope itemProp="acceptedAnswer" itemType="https://schema.org/Answer">
                  <p className="text-muted-foreground" itemProp="text">Yes, this calculator constrains weights between 0% and 100% (long-only). In a mathematical model without constraints, you might get weights &gt;100% (leverage) or &lt;0% (shorting).</p>
                </div>
              </div>

              <div itemScope itemProp="mainEntity" itemType="https://schema.org/Question">
                <h4 className="font-semibold text-lg mb-3" itemProp="name">What is the Sharpe Ratio?</h4>
                <div itemScope itemProp="acceptedAnswer" itemType="https://schema.org/Answer">
                  <p className="text-muted-foreground" itemProp="text">The Sharpe Ratio measures excess return per unit of risk. While this calculator finds the <em>minimum risk</em> portfolio, the <em>optimal</em> portfolio is often defined as the one maximizing the Sharpe Ratio (tangency portfolio).</p>
                </div>
              </div>

              <div itemScope itemProp="mainEntity" itemType="https://schema.org/Question">
                <h4 className="font-semibold text-lg mb-3" itemProp="name">How do I handle a Risk-Free Asset?</h4>
                <div itemScope itemProp="acceptedAnswer" itemType="https://schema.org/Answer">
                  <p className="text-muted-foreground" itemProp="text">A risk-free asset has a standard deviation of 0 and correlation of 0 with everything. To optimize with a risk-free asset, you generally lever up or down the tangency portfolio along the Capital Market Line.</p>
                </div>
              </div>

              <div itemScope itemProp="mainEntity" itemType="https://schema.org/Question">
                <h4 className="font-semibold text-lg mb-3" itemProp="name">Why are my weights 100% and 0%?</h4>
                <div itemScope itemProp="acceptedAnswer" itemType="https://schema.org/Answer">
                  <p className="text-muted-foreground" itemProp="text">This "corner solution" happens when one asset is so much less risky than the other (and correlation isn't low enough) that the math prefers holding only the safer asset to minimize variance within the long-only constraint.</p>
                </div>
              </div>

              <div itemScope itemProp="mainEntity" itemType="https://schema.org/Question">
                <h4 className="font-semibold text-lg mb-3" itemProp="name">How often should I rebalance?</h4>
                <div itemScope itemProp="acceptedAnswer" itemType="https://schema.org/Answer">
                  <p className="text-muted-foreground" itemProp="text">Rebalancing quarterly or annually is standard. Without rebalancing, the higher-return asset will grow to a larger weight, potentially increasing portfolio risk beyond your target.</p>
                </div>
              </div>

              <div itemScope itemProp="mainEntity" itemType="https://schema.org/Question">
                <h4 className="font-semibold text-lg mb-3" itemProp="name">Can Expected Return be negative?</h4>
                <div itemScope itemProp="acceptedAnswer" itemType="https://schema.org/Answer">
                  <p className="text-muted-foreground" itemProp="text">Yes, this model accepts negative returns. For example, you might hold a hedging asset with negative expected returns to protect the portfolio during crashes.</p>
                </div>
              </div>

              <div itemScope itemProp="mainEntity" itemType="https://schema.org/Question">
                <h4 className="font-semibold text-lg mb-3" itemProp="name">What inputs matter most?</h4>
                <div itemScope itemProp="acceptedAnswer" itemType="https://schema.org/Answer">
                  <p className="text-muted-foreground" itemProp="text">For finding the minimum variance weights, only the Standard Deviations and Correlation matter. The Expected Returns determine the resulting portfolio return but do not affect the minimum-variance weight calculation itself.</p>
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
                <Target className="h-5 w-5" />
                Summary
              </CardTitle>
            </CardHeader>
            <CardContent className="space-y-2 text-sm text-muted-foreground">
              <p>The Optimal Portfolio Allocation Calculator determines the ideal mix of two assets to minimize portfolio volatility.</p>
              <p>It helps investors construct efficient portfolios by mathematically balancing risk and diversification benefits.</p>
              <p>Use minimum-variance weights as a starting point for safer portfolio construction.</p>
            </CardContent>
          </Card>
        </div>
      </div>
    </div>
  );
}



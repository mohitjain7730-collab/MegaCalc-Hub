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
      <div itemScope itemType="https://schema.org/FinanceSummary">
        <section className="space-y-6 text-muted-foreground leading-relaxed bg-card p-6 md:p-10 rounded-lg shadow-lg">
          <h1 className="text-3xl md:text-4xl font-extrabold text-foreground mb-4" itemProp="name">The Definitive Guide to Diversification Benefits</h1>
          <meta itemProp="description" content="Quantify the risk reduction from portfolio diversification. Learn how asset correlation impacts portfolio volatility and efficiency." />
          <meta itemProp="author" content="MegaCalc Hub" />
          <meta itemProp="keywords" content="Diversification Benefit, Portfolio Risk, Correlation, Standard Deviation, Modern Portfolio Theory, Risk Reduction, Asset Allocation" />

          <p className="text-lg italic text-muted-foreground">Understand exactly how much risk you're removing by not putting all your eggs in one basket.</p>

          <h2 className="text-2xl font-bold text-foreground mt-8 mb-4" itemProp="articleSection">What is Diversification Benefit?</h2>
          <p>Diversification benefit is the "free lunch" in finance: it's the reduction in portfolio risk (volatility) achieved by combining assets that don't move perfectly in sync. It allows you to maintain the same expected return while lowering your risk.</p>

          <h2 className="text-2xl font-bold text-foreground mt-8 mb-4" itemProp="articleSection">The Role of Correlation</h2>
          <p>The magic ingredient is <strong>correlation</strong>. If two assets rise and fall together (Correlation = +1), there is no diversification benefit. If they move independently (Correlation = 0) or inversely (Correlation &lt; 0), the benefit is substantial.</p>

          <h2 className="text-2xl font-bold text-foreground mt-8 mb-4" itemProp="articleSection">Why It Matters</h2>
          <ul className="list-disc ml-6 space-y-2">
            <li><strong>Smoother Ride:</strong> Lower volatility means smaller drawdowns during market turbulence.</li>
            <li><strong>Compound Returns:</strong> Lower volatility reduces "volatility drag," effectively increasing your long-term compound growth rate.</li>
            <li><strong>Efficiency:</strong> It allows you to take more risk where it pays (e.g., higher return assets) while hedging it elsewhere.</li>
          </ul>

          <h2 className="text-2xl font-bold text-foreground pt-8">Conclusion</h2>
          <p>Don't just guess at diversification—measure it. Use this calculator to ensure your portfolio construction is mathematically sound and truly diversified.</p>
        </section>

        {/* FAQ Section */}
        <section className="mt-8">
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <Info className="h-5 w-5" />
                Frequently Asked Questions
              </CardTitle>
              <CardDescription>Detailed answers for common questions</CardDescription>
            </CardHeader>
            <CardContent className="space-y-6">
              <div itemScope itemProp="mainEntity" itemType="https://schema.org/Question">
                <h4 className="font-semibold text-lg mb-3" itemProp="name">What is the "Diversification Benefit"?</h4>
                <div itemScope itemProp="acceptedAnswer" itemType="https://schema.org/Answer">
                  <p className="text-muted-foreground" itemProp="text">It represents the difference between the weighted average risk of your individual holdings and the actual risk of the combined portfolio. The difference is the risk that has been "diversified away."</p>
                </div>
              </div>

              <div itemScope itemProp="mainEntity" itemType="https://schema.org/Question">
                <h4 className="font-semibold text-lg mb-3" itemProp="name">Can diversification eliminate all risk?</h4>
                <div itemScope itemProp="acceptedAnswer" itemType="https://schema.org/Answer">
                  <p className="text-muted-foreground" itemProp="text">No. It can eliminate <em>unsystematic risk</em> (specific to a company or asset), but it cannot eliminate <em>systematic risk</em> (market-wide risk like recessions or interest rate hikes).</p>
                </div>
              </div>

              <div itemScope itemProp="mainEntity" itemType="https://schema.org/Question">
                <h4 className="font-semibold text-lg mb-3" itemProp="name">Does adding more assets always help?</h4>
                <div itemScope itemProp="acceptedAnswer" itemType="https://schema.org/Answer">
                  <p className="text-muted-foreground" itemProp="text">Not always. Adding an asset that is highly correlated with your existing portfolio adds complexity without significant risk reduction benefit. Use this calculator to test before adding.</p>
                </div>
              </div>

              <div itemScope itemProp="mainEntity" itemType="https://schema.org/Question">
                <h4 className="font-semibold text-lg mb-3" itemProp="name">What is a good correlation number?</h4>
                <div itemScope itemProp="acceptedAnswer" itemType="https://schema.org/Answer">
                  <p className="text-muted-foreground" itemProp="text">Ideally, you want correlations below 0.5 or even negative. Bonds often have low/negative correlation to stocks, which is why the 60/40 portfolio is popular.</p>
                </div>
              </div>

              <div itemScope itemProp="mainEntity" itemType="https://schema.org/Question">
                <h4 className="font-semibold text-lg mb-3" itemProp="name">Do correlations change over time?</h4>
                <div itemScope itemProp="acceptedAnswer" itemType="https://schema.org/Answer">
                  <p className="text-muted-foreground" itemProp="text">Yes! In times of extreme market stress (crashes), correlations often converge to 1 ("everything falls together"). This is a key risk to monitor.</p>
                </div>
              </div>

              <div itemScope itemProp="mainEntity" itemType="https://schema.org/Question">
                <h4 className="font-semibold text-lg mb-3" itemProp="name">Does diversification hurt returns?</h4>
                <div itemScope itemProp="acceptedAnswer" itemType="https://schema.org/Answer">
                  <p className="text-muted-foreground" itemProp="text">It averages returns. You won't get the skyrocketing return of the single best winner, but you also won't suffer the total loss of the worst loser. It smooths the path of wealth accumulation.</p>
                </div>
              </div>

              <div itemScope itemProp="mainEntity" itemType="https://schema.org/Question">
                <h4 className="font-semibold text-lg mb-3" itemProp="name">How do I calculate standard deviation?</h4>
                <div itemScope itemProp="acceptedAnswer" itemType="https://schema.org/Answer">
                  <p className="text-muted-foreground" itemProp="text">You can use historical price data in Excel (STDEV function) or use our discrete Standard Deviation calculator to estimate it based on returns.</p>
                </div>
              </div>

              <div itemScope itemProp="mainEntity" itemType="https://schema.org/Question">
                <h4 className="font-semibold text-lg mb-3" itemProp="name">Is 0% correlation possible?</h4>
                <div itemScope itemProp="acceptedAnswer" itemType="https://schema.org/Answer">
                  <p className="text-muted-foreground" itemProp="text">Yes, assets that are fundamentally disconnected (e.g., weather futures vs. tech stocks) may have near-zero correlation.</p>
                </div>
              </div>

              <div itemScope itemProp="mainEntity" itemType="https://schema.org/Question">
                <h4 className="font-semibold text-lg mb-3" itemProp="name">What about negative correlation?</h4>
                <div itemScope itemProp="acceptedAnswer" itemType="https://schema.org/Answer">
                  <p className="text-muted-foreground" itemProp="text">Negative correlation (-1) is the holy grail of hedging. When one asset zigs, the other zags. This provides the maximum possible diversification benefit.</p>
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
                <Shield className="h-5 w-5" />
                Summary
              </CardTitle>
            </CardHeader>
            <CardContent className="space-y-2 text-sm text-muted-foreground">
              <p>The Portfolio Diversification Benefit Calculator quantifies the exact risk reduction you get from combining assets.</p>
              <p>It demonstrates that portfolio risk is often less than the sum of its parts due to imperfect correlation.</p>
              <p>Use it to build more robust, efficient portfolios that can weather market volatility.</p>
            </CardContent>
          </Card>
        </div>
      </div>
    </div>
  );
}



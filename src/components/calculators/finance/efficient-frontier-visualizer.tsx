'use client';

import { useMemo, useState } from 'react';
import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import { z } from 'zod';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Form, FormControl, FormField, FormItem, FormLabel, FormMessage } from '@/components/ui/form';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { LineChart, Calculator, Info } from 'lucide-react';

const formSchema = z.object({
  r1: z.number().min(-100).max(100).optional(),
  r2: z.number().min(-100).max(100).optional(),
  s1: z.number().min(0).max(500).optional(),
  s2: z.number().min(0).max(500).optional(),
  rho: z.number().min(-1).max(1).optional(),
  steps: z.number().min(5).max(200).optional(),
});

type FormValues = z.infer<typeof formSchema>;

type Point = { w1: number; w2: number; ret: number; std: number };

export default function EfficientFrontierVisualizer() {
  const [points, setPoints] = useState<Point[] | null>(null);

  const form = useForm<FormValues>({
    resolver: zodResolver(formSchema),
    defaultValues: {
      r1: undefined as unknown as number,
      r2: undefined as unknown as number,
      s1: undefined as unknown as number,
      s2: undefined as unknown as number,
      rho: undefined as unknown as number,
      steps: undefined as unknown as number,
    },
  });

  const generate = (v: FormValues) => {
    if (
      v.r1 === undefined || v.r2 === undefined ||
      v.s1 === undefined || v.s2 === undefined ||
      v.rho === undefined || v.steps === undefined
    ) {
      setPoints(null);
      return;
    }
    const s1 = v.s1 / 100;
    const s2 = v.s2 / 100;
    const cov = v.rho * s1 * s2;
    const pts: Point[] = [];
    const n = v.steps;
    for (let i = 0; i < n; i++) {
      const w1 = i / (n - 1);
      const w2 = 1 - w1;
      const ret = w1 * v.r1 + w2 * v.r2;
      const variance = (w1 * w1 * s1 * s1) + (w2 * w2 * s2 * s2) + (2 * w1 * w2 * cov);
      const std = Math.sqrt(variance) * 100;
      pts.push({ w1, w2, ret, std });
    }
    setPoints(pts);
  };

  const bestPoints = useMemo(() => {
    if (!points) return [] as Point[];
    return [...points].sort((a, b) => a.std - b.std).slice(0, 5);
  }, [points]);

  return (
    <div className="space-y-8">
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <LineChart className="h-5 w-5" />
            Efficient Frontier Visualizer (Two Assets)
          </CardTitle>
          <CardDescription>Generate frontier points across weight combinations.</CardDescription>
        </CardHeader>
        <CardContent>
          <Form {...form}>
            <form onSubmit={form.handleSubmit(generate)} className="space-y-6">
              <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
                <FormField control={form.control} name="r1" render={({ field }) => (
                  <FormItem>
                    <FormLabel>Asset 1 Expected Return (%)</FormLabel>
                    <FormControl>
                      <Input type="number" step="0.01" placeholder="e.g., 9" {...field}
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
                <FormField control={form.control} name="steps" render={({ field }) => (
                  <FormItem>
                    <FormLabel>Number of Points</FormLabel>
                    <FormControl>
                      <Input type="number" step="1" placeholder="e.g., 51" {...field}
                        value={Number.isFinite(field.value as any) ? (field.value as any) : ''}
                        onChange={e => {
                          const v = e.target.value;
                          const num = v === '' ? undefined : Number.parseInt(v, 10);
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
                      <Input type="number" step="0.01" placeholder="e.g., 18" {...field}
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
                <FormField control={form.control} name="rho" render={({ field }) => (
                  <FormItem>
                    <FormLabel>Correlation (ρ)</FormLabel>
                    <FormControl>
                      <Input type="number" step="0.01" placeholder="e.g., 0.2" {...field}
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
              <Button type="submit" className="w-full md:w-auto">Generate</Button>
            </form>
          </Form>
        </CardContent>
      </Card>

      {points && (
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <Calculator className="h-5 w-5" />
              Frontier Points (Sample)
            </CardTitle>
            <CardDescription>Best (lowest-risk) sample points and full list</CardDescription>
          </CardHeader>
          <CardContent className="space-y-6">
            <div>
              <h4 className="font-semibold mb-2">Lowest-risk 5 points</h4>
              <div className="grid grid-cols-1 md:grid-cols-5 gap-4">
                {bestPoints.map((p, i) => (
                  <div key={i} className="p-4 border rounded-lg">
                    <p className="text-sm text-muted-foreground">w1 / w2</p>
                    <p className="font-semibold">{(p.w1 * 100).toFixed(0)}% / {(p.w2 * 100).toFixed(0)}%</p>
                    <p className="text-sm text-muted-foreground">Return</p>
                    <p className="font-semibold">{p.ret.toFixed(2)}%</p>
                    <p className="text-sm text-muted-foreground">Std</p>
                    <p className="font-semibold">{p.std.toFixed(2)}%</p>
                  </div>
                ))}
              </div>
            </div>
            <div>
              <h4 className="font-semibold mb-2">All generated points</h4>
              <div className="overflow-x-auto">
                <table className="min-w-full text-sm">
                  <thead>
                    <tr className="text-left">
                      <th className="p-2">Weight 1</th>
                      <th className="p-2">Weight 2</th>
                      <th className="p-2">Return (%)</th>
                      <th className="p-2">Std (%)</th>
                    </tr>
                  </thead>
                  <tbody>
                    {points.map((p, i) => (
                      <tr key={i} className="border-t">
                        <td className="p-2">{(p.w1 * 100).toFixed(1)}%</td>
                        <td className="p-2">{(p.w2 * 100).toFixed(1)}%</td>
                        <td className="p-2">{p.ret.toFixed(2)}</td>
                        <td className="p-2">{p.std.toFixed(2)}</td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
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
          <CardDescription>Explore risk-return analysis tools</CardDescription>
        </CardHeader>
        <CardContent>
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div className="p-4 border rounded-lg hover:bg-muted/50 transition-colors">
              <h4 className="font-semibold mb-2"><a href="/category/finance/risk-parity-portfolio-calculator" className="text-primary hover:underline">Standard Deviation Calculator</a></h4>
              <p className="text-sm text-muted-foreground">Understand asset volatility.</p>
            </div>
            <div className="p-4 border rounded-lg hover:bg-muted/50 transition-colors">
              <h4 className="font-semibold mb-2"><a href="/category/finance/portfolio-variance-calculator" className="text-primary hover:underline">Portfolio Variance Calculator</a></h4>
              <p className="text-sm text-muted-foreground">Estimate combined risk across holdings.</p>
            </div>
            <div className="p-4 border rounded-lg hover:bg-muted/50 transition-colors">
              <h4 className="font-semibold mb-2"><a href="/category/finance/return-on-investment-calculator" className="text-primary hover:underline">ROI Calculator</a></h4>
              <p className="text-sm text-muted-foreground">Quantify returns for specific investments.</p>
            </div>
            <div className="p-4 border rounded-lg hover:bg-muted/50 transition-colors">
              <h4 className="font-semibold mb-2"><a href="/category/finance/npv-calculator" className="text-primary hover:underline">NPV Calculator</a></h4>
              <p className="text-sm text-muted-foreground">Relate expected return to valuation.</p>
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
              Portfolio Return = w₁·r₁ + w₂·r₂
            </p>
            <p className="font-mono text-sm text-center mt-2">
              Portfolio σ = √(w₁²σ₁² + w₂²σ₂² + 2w₁w₂ρσ₁σ₂)
            </p>
          </div>
          <p className="text-sm text-muted-foreground mt-2">
            Generated across all weight combinations from 0% to 100% in Asset 1.
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
          <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
            <div className="p-4 bg-muted/50 rounded-lg">
              <h4 className="font-semibold mb-2">Expected Returns</h4>
              <p className="text-sm text-muted-foreground">Anticipated annual returns for each asset.</p>
            </div>
            <div className="p-4 bg-muted/50 rounded-lg">
              <h4 className="font-semibold mb-2">Standard Deviations</h4>
              <p className="text-sm text-muted-foreground">Volatility of each asset.</p>
            </div>
            <div className="p-4 bg-muted/50 rounded-lg">
              <h4 className="font-semibold mb-2">Correlation & Points</h4>
              <p className="text-sm text-muted-foreground">Asset correlation and number of weight combinations to generate.</p>
            </div>
          </div>
        </CardContent>
      </Card>

      {/* Complete SEO Guide */}
      <div itemScope itemType="https://schema.org/FinanceSummary">
        <section className="space-y-6 text-muted-foreground leading-relaxed bg-card p-6 md:p-10 rounded-lg shadow-lg">
          <h1 className="text-3xl md:text-4xl font-extrabold text-foreground mb-4" itemProp="name">The Definitive Guide to Efficient Frontiers</h1>
          <meta itemProp="description" content="Visualize the Efficient Frontier for your portfolio. Understand the risk-return trade-off and optimize your investment strategy using Modern Portfolio Theory." />
          <meta itemProp="author" content="MegaCalc Hub" />
          <meta itemProp="keywords" content="Efficient Frontier, Modern Portfolio Theory, Portfolio Optimization, Risk-Return Tradeoff, Asset Allocation, Markowitz Model" />

          <p className="text-lg italic text-muted-foreground">Understanding the set of optimal portfolios that offer maximum return for each risk level.</p>

          <h2 className="text-2xl font-bold text-foreground mt-8 mb-4" itemProp="articleSection">What is the Efficient Frontier?</h2>
          <p>The efficient frontier is the set of portfolios offering the highest expected return for each level of risk. Portfolios below the frontier are suboptimal—you can get more return for the same risk.</p>

          <h2 className="text-2xl font-bold text-foreground mt-8 mb-4" itemProp="articleSection">How Correlation Shapes the Frontier</h2>
          <p>Lower correlation between assets "bends" the frontier leftward, creating portfolios with lower risk for the same expected return. This curvature represents the "free lunch" of diversification.</p>

          <h2 className="text-2xl font-bold text-foreground mt-8 mb-4" itemProp="articleSection">Modern Portfolio Theory (MPT)</h2>
          <p>Pioneered by Harry Markowitz, MPT demonstrates that an investment's risk and return should not be viewed alone, but by how it contributes to a portfolio's overall risk and return. The efficient frontier is the graphical representation of this concept.</p>

          <h2 className="text-2xl font-bold text-foreground pt-8">Conclusion</h2>
          <p>The efficient frontier is central to modern portfolio theory. This visualizer helps you understand how different weight combinations affect portfolio risk and return, guiding you toward more efficient allocation.</p>
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
                <h4 className="font-semibold text-lg mb-3" itemProp="name">What is the Efficient Frontier?</h4>
                <div itemScope itemProp="acceptedAnswer" itemType="https://schema.org/Answer">
                  <p className="text-muted-foreground" itemProp="text">It represents the set of "best possible" portfolios—those that offer the maximum expected return for a defined level of risk or the minimum risk for a given level of expected return.</p>
                </div>
              </div>

              <div itemScope itemProp="mainEntity" itemType="https://schema.org/Question">
                <h4 className="font-semibold text-lg mb-3" itemProp="name">Why is the line curved?</h4>
                <div itemScope itemProp="acceptedAnswer" itemType="https://schema.org/Answer">
                  <p className="text-muted-foreground" itemProp="text">The curve exists because assets are rarely perfectly correlated. When correlation is less than 1, diversification reduces portfolio volatility, pushing the risk-return profile to the left (lower risk).</p>
                </div>
              </div>

              <div itemScope itemProp="mainEntity" itemType="https://schema.org/Question">
                <h4 className="font-semibold text-lg mb-3" itemProp="name">What is the Global Minimum Variance Portfolio?</h4>
                <div itemScope itemProp="acceptedAnswer" itemType="https://schema.org/Answer">
                  <p className="text-muted-foreground" itemProp="text">This is the single point on the far left of the efficient frontier curve representing the portfolio with the absolute lowest possible standard deviation (risk) available from the given assets.</p>
                </div>
              </div>

              <div itemScope itemProp="mainEntity" itemType="https://schema.org/Question">
                <h4 className="font-semibold text-lg mb-3" itemProp="name">How does the Risk-Free Rate fit in?</h4>
                <div itemScope itemProp="acceptedAnswer" itemType="https://schema.org/Answer">
                  <p className="text-muted-foreground" itemProp="text">When a risk-free asset is introduced, the efficient frontier becomes a straight line (Capital Market Line) extending from the risk-free rate to the tangency point on the risky asset frontier.</p>
                </div>
              </div>

              <div itemScope itemProp="mainEntity" itemType="https://schema.org/Question">
                <h4 className="font-semibold text-lg mb-3" itemProp="name">Can I be above the Efficient Frontier?</h4>
                <div itemScope itemProp="acceptedAnswer" itemType="https://schema.org/Answer">
                  <p className="text-muted-foreground" itemProp="text">No. By definition, the efficient frontier represents the maximum possible return for each risk level using the available assets. Points above it are impossible without leverage or better-performing assets.</p>
                </div>
              </div>

              <div itemScope itemProp="mainEntity" itemType="https://schema.org/Question">
                <h4 className="font-semibold text-lg mb-3" itemProp="name">Why do some visualizations show dots below the line?</h4>
                <div itemScope itemProp="acceptedAnswer" itemType="https://schema.org/Answer">
                  <p className="text-muted-foreground" itemProp="text">Dots below the frontier represent inefficient portfolios. You could achieve higher returns with the same risk (or lower risk with the same return) by moving up to the frontier line.</p>
                </div>
              </div>

              <div itemScope itemProp="mainEntity" itemType="https://schema.org/Question">
                <h4 className="font-semibold text-lg mb-3" itemProp="name">What are the assumptions of this model?</h4>
                <div itemScope itemProp="acceptedAnswer" itemType="https://schema.org/Answer">
                  <p className="text-muted-foreground" itemProp="text">It assumes normal distribution of returns, constant correlations, rational investors, and no transaction costs or taxes. Real-world markets often deviate from these ideals.</p>
                </div>
              </div>

              <div itemScope itemProp="mainEntity" itemType="https://schema.org/Question">
                <h4 className="font-semibold text-lg mb-3" itemProp="name">How many assets can this visualize?</h4>
                <div itemScope itemProp="acceptedAnswer" itemType="https://schema.org/Answer">
                  <p className="text-muted-foreground" itemProp="text">This specific tool visualizes a two-asset universe. With three or more assets, the frontier becomes a surface or hyper-surface, but the 2D risk-return plot concept remains the same.</p>
                </div>
              </div>

              <div itemScope itemProp="mainEntity" itemType="https://schema.org/Question">
                <h4 className="font-semibold text-lg mb-3" itemProp="name">Is the frontier static?</h4>
                <div itemScope itemProp="acceptedAnswer" itemType="https://schema.org/Answer">
                  <p className="text-muted-foreground" itemProp="text">No. It shifts whenever expected returns, volatilities, or correlations change. It's a snapshot in time based on your inputs.</p>
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
                <LineChart className="h-5 w-5" />
                Summary
              </CardTitle>
            </CardHeader>
            <CardContent className="space-y-2 text-sm text-muted-foreground">
              <p>The Efficient Frontier Visualizer plots the risk-return trade-off for various portfolio combinations.</p>
              <p>It helps you identify the optimal asset mix that maximizes expected return for your risk tolerance.</p>
              <p>Use it to understand the geometry of diversification and why "putting eggs in different baskets" works mathematically.</p>
            </CardContent>
          </Card>
        </div>
      </div>
    </div>
  );
}


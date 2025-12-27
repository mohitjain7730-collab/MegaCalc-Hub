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
      <section className="space-y-6 text-muted-foreground leading-relaxed bg-card p-6 md:p-10 rounded-lg shadow-lg" itemScope itemType="https://schema.org/FinanceSummary">
        {/* SEO & SCHEMA METADATA */}
        <meta itemProp="name" content="The Definitive Guide to the Efficient Frontier: Visualizing Financial Physics" />
        <meta itemProp="description" content="Generate and visualize the Efficient Frontier for two assets. Master the risk-return tradeoff, understand portfolio dominance, and learn why diversification bends the curve." />
        <meta itemProp="keywords" content="Efficient Frontier Graph, Portfolio Optimization, Risk Return Scatter Plot, Markowitz Bullet, Investment Frontier, Capital Allocation Line" />
        <meta itemProp="author" content="[Your Site's Financial Analyst Team]" />
        <meta itemProp="datePublished" content="2025-11-15" />
        <meta itemProp="url" content="/definitive-guide-efficient-frontier" />

        <h1 className="text-3xl md:text-4xl font-extrabold text-foreground mb-4" itemProp="headline">The Definitive Guide to the Efficient Frontier: Visualizing Financial Physics</h1>
        <p className="text-lg italic text-muted-foreground">It's the most famous curve in finance. Understanding its shape is the key to understanding why "High Risk = High Return" is a dangerous oversimplification.</p>

        <h2 className="text-2xl font-bold text-foreground mt-8 mb-4">Table of Contents</h2>
        <ul className="list-disc ml-6 space-y-2 text-primary">
          <li><a href="#the-shape" className="hover:underline">Why is it Curved?</a></li>
          <li><a href="#dominance" className="hover:underline">The Concept of "Dominance"</a></li>
          <li><a href="#cml" className="hover:underline">The Capital Market Line</a></li>
          <li><a href="#limitations" className="hover:underline">The "Garbage In" Problem</a></li>
        </ul>
        <hr />

        <h2 id="the-shape" className="text-2xl font-bold text-foreground pt-8" itemProp="articleSection">Why is it Curved?</h2>
        <p>If assets were perfectly correlated (+1.0), the frontier would be a straight line. You would get zero "free" risk reduction.</p>
        <p>The "Markowitz Bullet" shape (the curve) exists because assets sometimes zigzag. When one zigs while the other zags, the portfolio's volatility cancels out, <em>without</em> hurting the average return. This bending of the curve toward the left (lower risk) is the mathematical manifestation of diversification.</p>
        <hr />

        <h2 id="dominance" className="text-2xl font-bold text-foreground pt-8" itemProp="articleSection">The Concept of "Dominance"</h2>
        <p>Look at the visualizer. Any point on the <strong>bottom half</strong> of the curve is "Dominated."</p>
        <ul className="list-disc ml-6 space-y-2">
          <li><strong>Inefficient:</strong> Why would you accept 5% return for 10% risk, when you could move vertically up to the top half of the curve and get 8% return for the same 10% risk?</li>
          <li><strong>Efficient:</strong> The top half of the curve is the "Efficient Frontier." Every point there is the best possible return for that specific risk level.</li>
        </ul>
        <hr />

        <h2 id="cml" className="text-2xl font-bold text-foreground pt-8" itemProp="articleSection">The Capital Market Line (CML)</h2>
        <p>In the real world, you also have a Risk-Free Asset (Cash/Treasuries). If you draw a straight line from the Risk-Free Rate (Y-axis intercept) that creates a tangent to the Efficient Frontier curve, you get the CML.</p>
        <p><strong>The Insight:</strong> Theoretically, you should never pick a portfolio on the curve itself. You should hold the "Tangency Portfolio" (where the line touches the curve) and then mix it with Cash (to lower risk) or Leverage (to increase risk). This is the foundation of the "Two-Fund Separation Theorem."</p>
        <hr />

        <h2 id="limitations" className="text-2xl font-bold text-foreground pt-8" itemProp="articleSection">The "Garbage In" Problem</h2>
        <p>This visualizer is beautiful, but dangerous. It assumes you <em>know</em> the future returns and correlations.</p>
        <div className="bg-muted p-4 rounded-l-4 border-l-4 border-yellow-500 my-4">
          <p className="font-bold">Warning:</p>
          <p>A slight change in your Expected Return input (e.g., guessing 8% vs 9%) can radically shift the optimal weights. This sensitivity is why many pros prefer "Risk Parity" (ignoring return estimates) over "Mean-Variance Optimization" (this model).</p>
        </div>
      </section>

      {/* FAQs */}
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <Info className="h-5 w-5" />
            Frequently Asked Questions
          </CardTitle>
          <CardDescription>Detailed answers about the Frontier</CardDescription>
        </CardHeader>
        <CardContent className="space-y-6">
          <div>
            <h4 className="font-semibold text-lg mb-3">Does this apply to Crypto?</h4>
            <p className="text-muted-foreground">
              Yes, brutally so. Crypto assets are often highly correlated (Bitcoin moves, everything moves). This results in a very "flat" frontier with little curvature/diversification benefit, unless you mix Crypto with traditional assets like Bonds or Real Estate.
            </p>
          </div>

          <div>
            <h4 className="font-semibold text-lg mb-3">Why are there no points in the top-left corner?</h4>
            <p className="text-muted-foreground">
              The top-left represents "High Return, Low Risk." This is the "Unattainable Region." In efficient markets, you cannot structurally get returns significantly higher than the risk you take. If you see an investment there, it's widely likely a Ponzi scheme or has hidden tail risks.
            </p>
          </div>

          <div>
            <h4 className="font-semibold text-lg mb-3">How does time horizon affect this?</h4>
            <p className="text-muted-foreground">
              This is a single-period model (usually 1 year). Over 20-30 years, "risk" changes definition (volatility matters less, inflation matters more). The frontier for long-term investors might look different, favoring equities even more.
            </p>
          </div>

          <div>
            <h4 className="font-semibold text-lg mb-3">What is the "Global Minimum Variance" point?</h4>
            <p className="text-muted-foreground">
              It is the "nose" of the bullet curve—the absolute left-most point. This is the portfolio for the ultimate pessimist who wants the smoothest possible ride, regardless of how much return they sacrifice (though usually, they don't sacrifice much!).
            </p>
          </div>

          <div>
            <h4 className="font-semibold text-lg mb-3">Can the frontier shift effectively?</h4>
            <p className="text-muted-foreground">
              Yes. If central banks cut rates (Risk-Free rate drops) or productivity explodes (Expected Returns rise), the entire frontier shifts up. Conversely, in a recession, it might shift down and right (higher risk, lower returns).
            </p>
          </div>

          <div>
            <h4 className="font-semibold text-lg mb-3">What about "Black Swans"?</h4>
            <p className="text-muted-foreground">
              This model uses Standard Deviation (bell curve) as the definition of risk. It fails to account for "Fat Tails" (events that should happen once in a trillion years happening every decade). Always assume the real risk is higher than the frontier suggests.
            </p>
          </div>
        </CardContent>
      </Card>

      {/* Summary Section */}
      <Card className="mb-6">
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <LineChart className="h-5 w-5" />
            Summary
          </CardTitle>
        </CardHeader>
        <CardContent className="space-y-2 text-sm text-muted-foreground">
          <p>The Efficient Frontier Visualizer maps the universe of possible portfolios.</p>
          <p>It demonstrates geometrically why diversification is the "only free lunch in finance"—bending the risk curve in your favor.</p>
          <p>Use it to identify dominated (bad) portfolios and target the efficient (good) edge.</p>
        </CardContent>
      </Card>
    </div>
  );
}


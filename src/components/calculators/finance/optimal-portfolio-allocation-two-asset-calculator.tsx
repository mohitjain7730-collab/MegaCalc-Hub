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
      <section className="space-y-6 text-muted-foreground leading-relaxed bg-card p-6 md:p-10 rounded-lg shadow-lg" itemScope itemType="https://schema.org/FinanceSummary">
        {/* SEO & SCHEMA METADATA */}
        <meta itemProp="name" content="The Definitive Guide to Modern Portfolio Theory (MPT) & Asset Allocation" />
        <meta itemProp="description" content="Calculate the optimal portfolio mix for two assets using modern portfolio theory. Learn about the Efficient Frontier, Sharpe Ratio, and the mathematics of diversification." />
        <meta itemProp="keywords" content="Optimal Portfolio Allocation, Efficient Frontier, Minimum Variance Portfolio, Modern Portfolio Theory MPT, Sharpe Ratio, Expected Return Formula, Portfolio Standard Deviation" />
        <meta itemProp="author" content="[Your Site's Financial Analyst Team]" />
        <meta itemProp="datePublished" content="2025-11-15" />
        <meta itemProp="url" content="/definitive-guide-optimal-allocation" />

        <h1 className="text-3xl md:text-4xl font-extrabold text-foreground mb-4" itemProp="headline">The Definitive Guide to Asset Allocation: Building the Perfect Portfolio</h1>
        <p className="text-lg italic text-muted-foreground">"Don't put all your eggs in one basket." That's the cliché. Here is the Nobel Prize-winning math that proves exactly how many eggs to put where.</p>

        <h2 className="text-2xl font-bold text-foreground mt-8 mb-4">Table of Contents</h2>
        <ul className="list-disc ml-6 space-y-2 text-primary">
          <li><a href="#mpt-basics" className="hover:underline">What is Modern Portfolio Theory?</a></li>
          <li><a href="#efficient-frontier" className="hover:underline">The Efficient Frontier Explained</a></li>
          <li><a href="#min-variance-vs-tangency" className="hover:underline">Minimum Variance vs. Maximum Sharpe</a></li>
          <li><a href="#correlation-magic" className="hover:underline">The Magic of Correlation</a></li>
          <li><a href="#rebalancing" className="hover:underline">The Rebalancing Bonus</a></li>
        </ul>
        <hr />

        <h2 id="mpt-basics" className="text-2xl font-bold text-foreground pt-8" itemProp="articleSection">What is Modern Portfolio Theory (MPT)?</h2>
        <p>Published by Harry Markowitz in 1952, MPT revolutionized finance by proving that an investor can construct a portfolio of multiple assets that will maximize returns for a given level of risk.</p>
        <p><strong>Key Insight:</strong> Risk is not just about an individual stock's volatility. It's about how that stock interacts with the rest of your portfolio.</p>
        <hr />

        <h2 id="efficient-frontier" className="text-2xl font-bold text-foreground pt-8" itemProp="articleSection">The Efficient Frontier Explained</h2>
        <p>If you plot every possible combination of assets on a graph (Risk on X-axis, Return on Y-axis), the upper boundary of those dots creates a curve called the <strong>Efficient Frontier</strong>.</p>
        <ul className="list-disc ml-6 space-y-2">
          <li><strong>On the Line:</strong> Optimal. You are getting the max return for that risk.</li>
          <li><strong>Below the Line:</strong> Inefficient. You are taking too much risk for too little return.</li>
          <li><strong>Above the Line:</strong> Impossible (without leverage).</li>
        </ul>
        <hr />

        <h2 id="min-variance-vs-tangency" className="text-2xl font-bold text-foreground pt-8" itemProp="articleSection">Minimum Variance vs. Maximum Sharpe</h2>
        <p>There are two "Optimal" portfolios:</p>
        <ol className="list-decimal ml-6 space-y-2">
          <li><strong>Minimum Variance Portfolio (MVP):</strong> The mix with the absolute lowest risk (volatility). This calculator solves for this. Great for risk-averse investors.</li>
          <li><strong>Tangency Portfolio (Max Sharpe):</strong> The mix with the highest risk-adjusted return (Sharpe Ratio). It’s usually riskier than the MVP but offers better "bang for your buck."</li>
        </ol>
        <hr />

        <h2 id="correlation-magic" className="text-2xl font-bold text-foreground pt-8" itemProp="articleSection">The Magic of Correlation</h2>
        <p>The secret sauce is <strong>Correlation (ρ)</strong>, ranging from -1 to +1.</p>
        <ul className="list-disc ml-6 space-y-2">
          <li><strong>ρ = +1.0:</strong> No diversification benefit. Risk is just the weighted average.</li>
          <li><strong>ρ = 0.0:</strong> Strong diversification. Portfolio risk falls significantly below the weighted average.</li>
          <li><strong>ρ = -1.0:</strong> Perfect hedge. You can theoretically construct a zero-risk portfolio.</li>
        </ul>
      </section>

      {/* FAQs */}
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <Info className="h-5 w-5" />
            Frequently Asked Questions
          </CardTitle>
          <CardDescription>Detailed answers about portfolio optimization</CardDescription>
        </CardHeader>
        <CardContent className="space-y-6">
          <div>
            <h4 className="font-semibold text-lg mb-3">Why does the calculator suggest 100% in one asset?</h4>
            <p className="text-muted-foreground">
              If Asset A has much lower volatility than Asset B, and the correlation isn't low enough to offset it, the math will purely favor the safer asset. This is a "corner solution." To get a mix, you need either closer volatilities or lower correlation.
            </p>
          </div>

          <div>
            <h4 className="font-semibold text-lg mb-3">What is the "Rebalancing Bonus"?</h4>
            <p className="text-muted-foreground">
              By maintaining a fixed asset allocation (e.g., 60/40), you are forced to sell high (the asset that rallied) and buy low (the asset that dropped). Over time, this contrarian discipline can generate returns slightly higher than a buy-and-hold strategy.
            </p>
          </div>

          <div>
            <h4 className="font-semibold text-lg mb-3">Does this work for 3+ assets?</h4>
            <p className="text-muted-foreground">
              Conceptually, yes. The math just gets exponentially more complex (involving Matrices). You have to calculate the covariance of every asset with every other asset. This Two-Asset calculator is the building block for understanding the broader concept.
            </p>
          </div>

          <div>
            <h4 className="font-semibold text-lg mb-3">What inputs should I trust?</h4>
            <p className="text-muted-foreground">
              Garbage In, Garbage Out. Historical returns are notoriously poor predictors of future returns. Historical volatility is <em>somewhat</em> sticky (predictable). Correlations are unstable during crashes (they tend to go to 1). Be conservative with your estimates.
            </p>
          </div>

          <div>
            <h4 className="font-semibold text-lg mb-3">Is lower Standard Deviation always better?</h4>
            <p className="text-muted-foreground">
              Not if it kills your returns. A portfolio of 100% Cash has 0 standard deviation but near-zero real return. The goal is the <em>highest efficiency</em> (Sharpe Ratio), not just the lowest risk.
            </p>
          </div>

          <div>
            <h4 className="font-semibold text-lg mb-3">How does inflation affect this?</h4>
            <p className="text-muted-foreground">
              MPT works with "Nominal" returns. To account for purchasing power, you should subtract expected inflation from your return inputs to optimize for "Real" returns.
            </p>
          </div>

          <div>
            <h4 className="font-semibold text-lg mb-3">Can I use this for Stock vs. Bond?</h4>
            <p className="text-muted-foreground">
              Absolutely. This is the classic 60/40 portfolio use case. Stocks usually have high return/high risk, bonds have lower return/lower risk, and they often have low correlation, making them perfect partners.
            </p>
          </div>

          <div>
            <h4 className="font-semibold text-lg mb-3">What is the Capital Market Line (CML)?</h4>
            <p className="text-muted-foreground">
              The CML is the line drawn from the risk-free rate to the Tangency Portfolio on the Efficient Frontier. It represents the best possible return for any level of risk if you can borrow or lend at the risk-free rate.
            </p>
          </div>
        </CardContent>
      </Card>

      {/* Summary Section */}
      <Card className="mb-6">
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <Target className="h-5 w-5" />
            Summary
          </CardTitle>
        </CardHeader>
        <CardContent className="space-y-2 text-sm text-muted-foreground">
          <p>The Optimal Portfolio Allocation Calculator allows you to find the mathematically perfect balance between two investments.</p>
          <p>By minimizing variance, you protect your capital from unnecessary volatility without sacrificing efficiency.</p>
          <p>Use it to design the core "engine" of your long-term wealth strategy.</p>
        </CardContent>
      </Card>
    </div>
  );
}



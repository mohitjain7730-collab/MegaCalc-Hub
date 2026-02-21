'use client';

import { useState } from 'react';
import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import { z } from 'zod';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Form, FormControl, FormField, FormItem, FormLabel, FormMessage } from '@/components/ui/form';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { DollarSign, Percent, Info, FunctionSquare, HelpCircle, Shield } from 'lucide-react';
import Link from 'next/link';

const formSchema = z.object({
  nextYearDividend: z.number().min(0).optional(), // D1
  requiredReturn: z.number().min(0.1).max(100).optional(), // %
  constantGrowth: z.number().min(-20).max(50).optional(), // %
});

type FormValues = z.infer<typeof formSchema>;

export default function DividendDiscountModelCalculator() {
  const [result, setResult] = useState<{
    intrinsicValue: number;
    interpretation: string;
    recommendations: string[];
    warnings: string[];
  } | null>(null);

  const form = useForm<FormValues>({ resolver: zodResolver(formSchema), defaultValues: { nextYearDividend: undefined, requiredReturn: undefined, constantGrowth: undefined } });

  const onSubmit = (v: FormValues) => {
    if (v.nextYearDividend == null || v.requiredReturn == null || v.constantGrowth == null) { setResult(null); return; }
    const r = v.requiredReturn / 100;
    const g = v.constantGrowth / 100;
    if (r <= g) {
      setResult({ intrinsicValue: NaN, interpretation: 'Model undefined when growth ≥ required return. Increase required return or reduce growth.', recommendations: ['Cross‑check with multi‑stage models', 'Use sensitivity analysis on r and g'], warnings: ['DDM breaks if r ≤ g', 'High growth often fades over time'] });
      return;
    }
    const value = v.nextYearDividend / (r - g);
    setResult({
      intrinsicValue: Math.round(value * 100) / 100,
      interpretation: 'Intrinsic value under constant‑growth DDM (Gordon) using provided r and g.',
      recommendations: ['Compare with market price for margin of safety', 'Stress‑test inputs ±100 bps', 'Consider multi‑stage DDM for early high growth'],
      warnings: ['Assumes perpetual constant growth', 'Ignores capital structure and buybacks'],
    });
  };

  return (
    <div className="space-y-8">
      <Card>
        <CardHeader><CardTitle>Dividend Discount Model (DDM)</CardTitle><CardDescription>Gordon constant‑growth valuation</CardDescription></CardHeader>
        <CardContent>
          <Form {...form}>
            <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-6">
              <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
                <FormField control={form.control} name="nextYearDividend" render={({ field }) => (
                  <FormItem><FormLabel className="flex items-center gap-2"><DollarSign className="h-4 w-4" /> D1 (Next Year Dividend)</FormLabel><FormControl><Input type="number" step="0.01" placeholder="e.g., 2.1" {...field} value={field.value ?? ''} onChange={e => field.onChange(parseFloat(e.target.value) || undefined)} /></FormControl><FormMessage /></FormItem>
                )} />
                <FormField control={form.control} name="requiredReturn" render={({ field }) => (
                  <FormItem><FormLabel className="flex items-center gap-2"><Percent className="h-4 w-4" /> Required Return (%)</FormLabel><FormControl><Input type="number" step="0.01" placeholder="e.g., 9" {...field} value={field.value ?? ''} onChange={e => field.onChange(parseFloat(e.target.value) || undefined)} /></FormControl><FormMessage /></FormItem>
                )} />
                <FormField control={form.control} name="constantGrowth" render={({ field }) => (
                  <FormItem><FormLabel className="flex items-center gap-2"><Percent className="h-4 w-4" /> Constant Growth g (%)</FormLabel><FormControl><Input type="number" step="0.01" placeholder="e.g., 3" {...field} value={field.value ?? ''} onChange={e => field.onChange(parseFloat(e.target.value) || undefined)} /></FormControl><FormMessage /></FormItem>
                )} />
              </div>
              <Button type="submit" className="w-full md:w-auto">Calculate Intrinsic Value</Button>
            </form>
          </Form>
        </CardContent>
      </Card>

      {result && (
        <div className="space-y-6">
          <Card>
            <CardHeader><div className="flex items-center gap-4"><DollarSign className="h-8 w-8 text-primary" /><div><CardTitle>DDM Result</CardTitle><CardDescription>Constant‑growth valuation</CardDescription></div></div></CardHeader>
            <CardContent>
              <div className="text-center p-6 bg-primary/5 rounded-lg"><div className="text-sm text-muted-foreground mb-1">Intrinsic Value</div><p className="text-3xl font-bold text-primary">{isNaN(result.intrinsicValue) ? '—' : `$${result.intrinsicValue.toLocaleString()}`}</p></div>
              <p className="text-sm mt-4">{result.interpretation}</p>
            </CardContent>
          </Card>
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            <Card><CardHeader><CardTitle>Recommendations</CardTitle></CardHeader><CardContent><ul className="space-y-2">{result.recommendations.map((r, i) => (<li key={i} className="text-sm text-muted-foreground">{r}</li>))}</ul></CardContent></Card>
            <Card><CardHeader><CardTitle>Warning Signs</CardTitle></CardHeader><CardContent><ul className="space-y-2">{result.warnings.map((w, i) => (<li key={i} className="text-sm text-muted-foreground">{w}</li>))}</ul></CardContent></Card>
          </div>
        </div>
      )}

      <Card>
        <CardHeader><CardTitle>Related Calculators</CardTitle><CardDescription>Valuation toolkit</CardDescription></CardHeader>
        <CardContent>
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
            <div className="p-4 border rounded"><h4 className="font-semibold mb-1"><Link href="/finance/present-value-calculator" className="text-primary hover:underline">Present Value</Link></h4><p className="text-sm text-muted-foreground">Discount cash flows.</p></div>
            <div className="p-4 border rounded"><h4 className="font-semibold mb-1"><Link href="/finance/dcf-calculator" className="text-primary hover:underline">DCF</Link></h4><p className="text-sm text-muted-foreground">Multi‑stage valuation.</p></div>
            <div className="p-4 border rounded"><h4 className="font-semibold mb-1"><Link href="/finance/dividend-yield-calculator" className="text-primary hover:underline">Dividend Yield</Link></h4><p className="text-sm text-muted-foreground">Income rate.</p></div>
            <div className="p-4 border rounded"><h4 className="font-semibold mb-1"><Link href="/finance/real-rate-of-return-calculator" className="text-primary hover:underline">Real Return</Link></h4><p className="text-sm text-muted-foreground">Inflation‑adjusted.</p></div>
          </div>
        </CardContent>
      </Card>

      {/* Formula Used */}
      <Card className="mb-6">
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <FunctionSquare className="h-5 w-5" />
            Formula Used
          </CardTitle>
        </CardHeader>
        <CardContent className="space-y-4">
          <div className="p-4 bg-muted rounded-lg overflow-x-auto">
            <p className="font-mono text-sm text-center">
              Intrinsic Value = D₁ / (r - g)
            </p>
            <p className="font-mono text-sm text-center mt-2">
              Where: D₁ = Next Year's Expected Dividend, r = Required Rate of Return, g = Constant Growth Rate
            </p>
          </div>
          <p className="text-sm text-muted-foreground mt-2">
            This is the Gordon Growth Model (constant-growth DDM), which calculates the present value of an infinite stream of growing dividends. It works only when r &gt; g.
          </p>
        </CardContent>
      </Card>

      {/* Input Explanations */}
      <Card className="mb-6">
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <HelpCircle className="h-5 w-5" />
            Understanding the Inputs
          </CardTitle>
          <CardDescription>What each parameter means for stock valuation</CardDescription>
        </CardHeader>
        <CardContent className="space-y-4">
          <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
            <div className="p-4 bg-muted/50 rounded-lg">
              <h4 className="font-semibold mb-2 flex items-center gap-2"><DollarSign className="h-4 w-4" /> D₁ (Next Year Dividend)</h4>
              <p className="text-sm text-muted-foreground">The expected dividend per share one year from now. If current dividend is D₀, then D₁ = D₀ × (1 + g). Use analyst estimates or project from recent dividend growth.</p>
            </div>
            <div className="p-4 bg-muted/50 rounded-lg">
              <h4 className="font-semibold mb-2 flex items-center gap-2"><Percent className="h-4 w-4" /> Required Return (r)</h4>
              <p className="text-sm text-muted-foreground">Your expected rate of return, typically derived from CAPM. Represents the opportunity cost of capital and risk compensation.</p>
            </div>
            <div className="p-4 bg-muted/50 rounded-lg">
              <h4 className="font-semibold mb-2 flex items-center gap-2"><Percent className="h-4 w-4" /> Growth Rate (g)</h4>
              <p className="text-sm text-muted-foreground">Expected perpetual dividend growth rate. Use historical dividend growth, analyst forecasts, or sustainable growth rate (ROE × retention ratio). Must be less than r.</p>
            </div>
          </div>
        </CardContent>
      </Card>

      {/* Complete SEO Guide */}
      <section className="space-y-6 text-muted-foreground leading-relaxed bg-card p-6 md:p-10 rounded-lg shadow-lg">
        <h1 className="text-3xl md:text-4xl font-extrabold text-foreground mb-4">The Complete Guide to the Dividend Discount Model (DDM): Stock Valuation Using Future Dividends</h1>
        <p className="text-lg italic text-muted-foreground">Master the fundamental valuation technique that calculates a stock's intrinsic value based on the present value of expected future dividend payments.</p>

        <h2 className="text-2xl font-bold text-foreground mt-8 mb-4">Table of Contents</h2>
        <ul className="list-disc ml-6 space-y-2 text-primary">
          <li><a href="#what-is-ddm" className="hover:underline">What is the Dividend Discount Model?</a></li>
          <li><a href="#gordon-growth" className="hover:underline">The Gordon Growth Model Explained</a></li>
          <li><a href="#ddm-inputs" className="hover:underline">Key Inputs and How to Estimate Them</a></li>
          <li><a href="#when-to-use" className="hover:underline">When DDM Works and When It Doesn't</a></li>
          <li><a href="#multi-stage" className="hover:underline">Multi-Stage DDM for Growth Companies</a></li>
          <li><a href="#ddm-vs-dcf" className="hover:underline">DDM vs. Discounted Cash Flow (DCF)</a></li>
        </ul>
        <hr />

        <h2 id="what-is-ddm" className="text-2xl font-bold text-foreground pt-8">What is the Dividend Discount Model?</h2>
        <p>The Dividend Discount Model (DDM) is a quantitative method for valuing a stock based on the theory that its price equals the present value of all future dividend payments. The core premise: a stock is worth the sum of all future cash flows it will return to shareholders, discounted back to today's value.</p>

        <p className="mt-4">DDM was popularized by John Burr Williams in his 1938 book "The Theory of Investment Value" and has since become a cornerstone of fundamental analysis, particularly for income-oriented investors.</p>

        <h3 className="text-xl font-semibold text-foreground mt-6">The Fundamental Concept</h3>
        <p>At its heart, DDM answers a simple question: "How much should I pay today for a stream of future dividend payments?" The answer depends on three factors:</p>
        <ul className="list-disc ml-6 space-y-2">
          <li><strong>Dividend Amount:</strong> How much cash will the company distribute?</li>
          <li><strong>Growth Rate:</strong> How quickly will dividends grow over time?</li>
          <li><strong>Discount Rate:</strong> What return do you require for the risk involved?</li>
        </ul>
        <hr />

        <h2 id="gordon-growth" className="text-2xl font-bold text-foreground pt-8">The Gordon Growth Model Explained</h2>
        <p>The Gordon Growth Model, also known as the constant-growth DDM, is the most widely used version of DDM. Named after economist Myron Gordon, it assumes dividends grow at a constant rate indefinitely.</p>

        <h3 className="text-xl font-semibold text-foreground mt-6">The Formula</h3>
        <p>The Gordon Growth Model formula is elegantly simple:</p>
        <div className="p-4 bg-muted rounded-lg my-4">
          <p className="font-mono text-center font-bold">P₀ = D₁ / (r - g)</p>
        </div>
        <p>Where P₀ is the intrinsic value, D₁ is next year's expected dividend, r is the required rate of return, and g is the constant dividend growth rate.</p>

        <h3 className="text-xl font-semibold text-foreground mt-6">A Practical Example</h3>
        <p>Consider a stock with these characteristics:</p>
        <ul className="list-disc ml-6 space-y-2">
          <li>Current annual dividend: $2.00 per share</li>
          <li>Expected dividend growth: 5% per year</li>
          <li>Required return: 10%</li>
        </ul>
        <p className="mt-4">First, calculate D₁: $2.00 × 1.05 = $2.10. Then apply the formula: $2.10 / (0.10 - 0.05) = $2.10 / 0.05 = $42.00. According to DDM, this stock is worth $42 per share.</p>
        <hr />

        <h2 id="ddm-inputs" className="text-2xl font-bold text-foreground pt-8">Key Inputs and How to Estimate Them</h2>
        <p>DDM results are highly sensitive to input assumptions. Small changes in r or g can dramatically alter the calculated value.</p>

        <h3 className="text-xl font-semibold text-foreground mt-6">Estimating Required Return (r)</h3>
        <p>The required return represents your opportunity cost and risk compensation. Common approaches include:</p>
        <ul className="list-disc ml-6 space-y-2">
          <li><strong>CAPM:</strong> r = Risk-Free Rate + (Beta × Market Risk Premium). A stock with beta of 1.2, risk-free rate of 4%, and market premium of 5% yields r = 10%.</li>
          <li><strong>Historical Returns:</strong> Examine what returns similar stocks have delivered historically.</li>
          <li><strong>Build-Up Method:</strong> Start with risk-free rate and add premiums for equity risk, size, and company-specific factors.</li>
        </ul>

        <h3 className="text-xl font-semibold text-foreground mt-6">Estimating Growth Rate (g)</h3>
        <p>The perpetual growth rate assumes dividends will grow at this rate forever—so it must be sustainable.</p>
        <ul className="list-disc ml-6 space-y-2">
          <li><strong>Historical Growth:</strong> Analyze 5-10 years of dividend history and calculate compound annual growth rate.</li>
          <li><strong>Sustainable Growth:</strong> g = ROE × (1 - Payout Ratio). A company with 15% ROE paying out 40% of earnings can sustain 9% growth.</li>
          <li><strong>GDP + Inflation:</strong> For mature companies, long-term growth often approximates nominal GDP growth (3-5%).</li>
        </ul>
        <hr />

        <h2 id="when-to-use" className="text-2xl font-bold text-foreground pt-8">When DDM Works and When It Doesn't</h2>
        <p>DDM is powerful but has important limitations that every investor should understand.</p>

        <h3 className="text-xl font-semibold text-foreground mt-6">Ideal Candidates for DDM</h3>
        <ul className="list-disc ml-6 space-y-2">
          <li><strong>Dividend Aristocrats:</strong> Companies with 25+ years of consecutive dividend increases.</li>
          <li><strong>Utilities and REITs:</strong> Regulated earnings and high payout ratios make dividends predictable.</li>
          <li><strong>Mature, Stable Businesses:</strong> Companies past their high-growth phase with consistent dividend policies.</li>
        </ul>

        <h3 className="text-xl font-semibold text-foreground mt-6">When DDM Fails</h3>
        <ul className="list-disc ml-6 space-y-2">
          <li><strong>Non-Dividend Payers:</strong> DDM can't value companies that don't pay dividends.</li>
          <li><strong>Growth Stocks:</strong> High-growth companies reinvest earnings rather than paying dividends.</li>
          <li><strong>Cyclical Companies:</strong> Volatile earnings make dividend projections unreliable.</li>
          <li><strong>When g ≥ r:</strong> The formula produces negative or infinite values—use multi-stage models instead.</li>
        </ul>
        <hr />

        <h2 id="multi-stage" className="text-2xl font-bold text-foreground pt-8">Multi-Stage DDM for Growth Companies</h2>
        <p>When a company's current growth rate exceeds sustainable long-term levels, the single-stage Gordon model breaks down. Multi-stage DDM addresses this by modeling different growth phases.</p>

        <h3 className="text-xl font-semibold text-foreground mt-6">Two-Stage DDM</h3>
        <p>Models an initial high-growth period followed by stable growth:</p>
        <ol className="list-decimal ml-6 space-y-2">
          <li>Calculate present value of dividends during the high-growth phase (years 1-n).</li>
          <li>Calculate terminal value at year n using Gordon model with stable growth rate.</li>
          <li>Discount terminal value back to present.</li>
          <li>Sum both components for total intrinsic value.</li>
        </ol>
        <hr />

        <h2 id="ddm-vs-dcf" className="text-2xl font-bold text-foreground pt-8">DDM vs. Discounted Cash Flow (DCF)</h2>
        <p>DDM and DCF are related but distinct valuation methods. Understanding when to use each is crucial.</p>

        <h3 className="text-xl font-semibold text-foreground mt-6">Key Differences</h3>
        <ul className="list-disc ml-6 space-y-2">
          <li><strong>Cash Flow Source:</strong> DDM uses dividends; DCF uses free cash flow.</li>
          <li><strong>Applicability:</strong> DDM requires dividend-paying companies; DCF works for any company.</li>
          <li><strong>Complexity:</strong> DDM is simpler; DCF requires more detailed forecasting.</li>
        </ul>
        <hr />

        <h2 className="text-2xl font-bold text-foreground pt-8">Conclusion</h2>
        <p>The Dividend Discount Model remains a foundational tool for valuing dividend-paying stocks. Its elegance lies in directly connecting stock value to what investors actually receive—cash dividends.</p>
        <p className="mt-4">While the constant-growth Gordon model works well for mature, stable dividend payers, investors should recognize its limitations and consider multi-stage models for growth companies. Sensitivity analysis is essential given the model's high responsiveness to input changes.</p>
      </section>

      {/* FAQs */}
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <Info className="h-5 w-5" />
            Frequently Asked Questions
          </CardTitle>
          <CardDescription>Detailed answers about the Dividend Discount Model</CardDescription>
        </CardHeader>
        <CardContent className="space-y-6">
          <div>
            <h4 className="font-semibold text-lg mb-3">What is the Dividend Discount Model and when should I use it?</h4>
            <p className="text-muted-foreground">
              The Dividend Discount Model (DDM) is a stock valuation method that calculates intrinsic value based on the present value of expected future dividends. Use it for mature, dividend-paying companies with predictable payout policies—companies like Johnson & Johnson, Procter & Gamble, or utilities. It's less appropriate for growth stocks that reinvest earnings rather than paying dividends.
            </p>
          </div>

          <div>
            <h4 className="font-semibold text-lg mb-3">What happens when the growth rate exceeds the required return?</h4>
            <p className="text-muted-foreground">
              When g ≥ r, the Gordon Growth Model produces meaningless results (infinity or negative values) because the denominator (r - g) becomes zero or negative. This signals that the constant-growth assumption is inappropriate. Use a multi-stage DDM that models high initial growth transitioning to a lower sustainable rate, or use discounted cash flow analysis instead.
            </p>
          </div>

          <div>
            <h4 className="font-semibold text-lg mb-3">How do stock buybacks affect DDM valuation?</h4>
            <p className="text-muted-foreground">
              Traditional DDM only considers dividends, ignoring value returned through share repurchases. This can undervalue companies that prioritize buybacks over dividends. To address this, you can use "total shareholder yield" (dividends + net buybacks) as the cash flow, or switch to free cash flow to equity (FCFE) models that capture all potential distributions.
            </p>
          </div>

          <div>
            <h4 className="font-semibold text-lg mb-3">How do I determine the appropriate required rate of return?</h4>
            <p className="text-muted-foreground">
              The required return (r) should reflect your opportunity cost and the stock's risk. The most common approach is CAPM: r = Risk-Free Rate + (Beta × Market Risk Premium). For example, with a 4% treasury yield, stock beta of 1.2, and 5% market premium: r = 4% + (1.2 × 5%) = 10%. Higher-risk stocks warrant higher required returns.
            </p>
          </div>

          <div>
            <h4 className="font-semibold text-lg mb-3">Is the Gordon Growth Model the same as DDM?</h4>
            <p className="text-muted-foreground">
              The Gordon Growth Model is a specific version of DDM that assumes constant dividend growth forever. It's the simplest and most widely used DDM variant. However, DDM is a broader category that includes multi-stage models (two-stage, three-stage, H-model) for companies whose growth rates will change over time.
            </p>
          </div>

          <div>
            <h4 className="font-semibold text-lg mb-3">How sensitive is DDM to input assumptions?</h4>
            <p className="text-muted-foreground">
              DDM is extremely sensitive to both required return (r) and growth rate (g), especially as they converge. A 1% change in either input can shift value by 20-30% or more. This is why sensitivity analysis is critical—always calculate values across a range of reasonable assumptions rather than relying on a single point estimate.
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
          <p>The Dividend Discount Model Calculator computes intrinsic stock value using the Gordon Growth formula: Value = D₁ / (r - g).</p>
          <p>It's ideal for valuing mature, stable dividend-paying companies with predictable growth patterns.</p>
          <p>Use this tool to estimate fair value, compare against market price for margin of safety analysis, and understand how dividend growth and required returns impact valuation.</p>
        </CardContent>
      </Card>
    </div>
  );
}



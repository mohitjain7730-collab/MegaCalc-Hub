'use client';

import { useState } from 'react';
import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import { z } from 'zod';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Form, FormControl, FormField, FormItem, FormLabel, FormMessage } from '@/components/ui/form';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Calculator, Info, TrendingUp, Target, AlertCircle, CheckCircle2 } from 'lucide-react';
import { Badge } from '@/components/ui/badge';
import { Alert, AlertDescription } from '@/components/ui/alert';

const formSchema = z.object({
  portfolioReturn: z.number().min(-100).max(100).optional(),
  marketReturn: z.number().min(-100).max(100).optional(),
  riskFreeRate: z.number().min(-10).max(100).optional(),
  beta: z.number().min(0).max(5).optional(),
});

type FormValues = z.infer<typeof formSchema>;

export default function JensensAlphaCalculator() {
  const [result, setResult] = useState<{ expected: number; alpha: number; interp: string; suggestions: string[] } | null>(null);

  const form = useForm<FormValues>({
    resolver: zodResolver(formSchema),
    defaultValues: {
      portfolioReturn: undefined as unknown as number,
      marketReturn: undefined as unknown as number,
      riskFreeRate: undefined as unknown as number,
      beta: undefined as unknown as number,
    },
  });

  const onSubmit = (v: FormValues) => {
    if (v.portfolioReturn === undefined || v.marketReturn === undefined || v.riskFreeRate === undefined || v.beta === undefined) {
      setResult(null);
      return;
    }
    const exp = v.riskFreeRate + v.beta * (v.marketReturn - v.riskFreeRate);
    const alpha = v.portfolioReturn - exp;
    const interp = alpha > 0 ? 'Positive alpha: portfolio outperformed CAPM expectation.' : alpha < 0 ? 'Negative alpha: underperformed risk-adjusted benchmark.' : 'Alpha near zero: matched CAPM expectation.';
    setResult({ expected: exp, alpha, interp, suggestions: ['Validate beta window and benchmark choice.', 'Incorporate costs and slippage when assessing realized alpha.', 'Review factor exposures beyond market beta.', 'Track rolling alpha to assess persistence.'] });
  };

  const numberField = (placeholder: string, field: any) => (
    <Input type="number" step="0.01" placeholder={placeholder} {...field}
      value={Number.isFinite(field.value as any) ? (field.value as any) : ''}
      onChange={(e) => { const v = e.target.value; const num = v === '' ? undefined : Number(v); field.onChange(Number.isFinite(num as any) ? num : undefined); }} />
  );

  return (
    <div className="space-y-8">
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2"><TrendingUp className="h-5 w-5" /> Jensen’s Alpha Calculator</CardTitle>
          <CardDescription>Estimate alpha relative to CAPM expected return.</CardDescription>
        </CardHeader>
        <CardContent>
          <Form {...form}>
            <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-6">
              <div className="grid grid-cols-1 md:grid-cols-4 gap-6">
                <FormField control={form.control} name="portfolioReturn" render={({ field }) => (
                  <FormItem><FormLabel>Portfolio Return (%)</FormLabel><FormControl>{numberField('e.g., 12', field)}</FormControl><FormMessage /></FormItem>
                )} />
                <FormField control={form.control} name="marketReturn" render={({ field }) => (
                  <FormItem><FormLabel>Market Return (%)</FormLabel><FormControl>{numberField('e.g., 8', field)}</FormControl><FormMessage /></FormItem>
                )} />
                <FormField control={form.control} name="riskFreeRate" render={({ field }) => (
                  <FormItem><FormLabel>Risk-Free Rate (%)</FormLabel><FormControl>{numberField('e.g., 3', field)}</FormControl><FormMessage /></FormItem>
                )} />
                <FormField control={form.control} name="beta" render={({ field }) => (
                  <FormItem><FormLabel>Portfolio Beta</FormLabel><FormControl>{numberField('e.g., 1.1', field)}</FormControl><FormMessage /></FormItem>
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
              <CardTitle className="flex items-center gap-2"><Calculator className="h-5 w-5" /> Results & Insights</CardTitle>
              <CardDescription>Alpha relative to risk</CardDescription>
            </CardHeader>
            <CardContent className="space-y-6">
              <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                <div className="p-4 border rounded-lg"><p className="text-sm text-muted-foreground">CAPM Expected Return</p><p className="text-2xl font-bold">{result.expected.toFixed(2)}%</p></div>
                <div className="p-4 border rounded-lg"><p className="text-sm text-muted-foreground">Jensen’s Alpha</p><p className={`text-2xl font-bold ${result.alpha >= 0 ? 'text-green-600' : 'text-red-600'}`}>{result.alpha.toFixed(2)}%</p></div>
                <div className="p-4 border rounded-lg"><p className="text-sm text-muted-foreground">Interpretation</p><p className="font-medium">{result.interp}</p></div>
              </div>
            </CardContent>
          </Card>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            <Card className="h-full">
              <CardHeader>
                <CardTitle className="flex items-center gap-2 text-xl text-primary">
                  <Target className="h-6 w-6" />
                  Strategic Insights
                </CardTitle>
                <CardDescription>Performance optimization</CardDescription>
              </CardHeader>
              <CardContent className="space-y-4">
                {result.suggestions.slice(0, 2).map((s, i) => (
                  <div key={i} className="flex items-start gap-3 p-3 bg-primary/5 rounded-lg border border-primary/10">
                    <CheckCircle2 className="h-5 w-5 text-primary mt-0.5 shrink-0" />
                    <span className="text-sm font-medium">{s}</span>
                  </div>
                ))}
                <div className="flex items-start gap-3 p-3 bg-primary/5 rounded-lg border border-primary/10">
                  <CheckCircle2 className="h-5 w-5 text-primary mt-0.5 shrink-0" />
                  <span className="text-sm font-medium">Positive alpha indicates systematic outperformance versus peers</span>
                </div>
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
                  <span className="text-sm font-medium text-red-800 dark:text-red-300">Negative alpha can erode long-term capital despite positive absolute returns</span>
                </div>
              </CardContent>
            </Card>
          </div>
        </>
      )}

      <Card>
        <CardHeader><CardTitle className="flex items-center gap-2"><Calculator className="h-5 w-5" /> Related Calculators</CardTitle><CardDescription>Risk-adjusted performance</CardDescription></CardHeader>
        <CardContent>
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div className="p-4 border rounded-lg hover:bg-muted/50 transition-colors"><h4 className="font-semibold mb-2"><a href="/category/finance/capm-calculator" className="text-primary hover:underline">CAPM Calculator</a></h4><p className="text-sm text-muted-foreground">Expected return from beta.</p></div>
            <div className="p-4 border rounded-lg hover:bg-muted/50 transition-colors"><h4 className="font-semibold mb-2"><a href="/category/finance/beta-asset-calculator" className="text-primary hover:underline">Beta Calculator</a></h4><p className="text-sm text-muted-foreground">Estimate sensitivity to the market.</p></div>
            <div className="p-4 border rounded-lg hover:bg-muted/50 transition-colors"><h4 className="font-semibold mb-2"><a href="/category/finance/information-ratio-calculator" className="text-primary hover:underline">Information Ratio</a></h4><p className="text-sm text-muted-foreground">Active return per unit of tracking error.</p></div>
            <div className="p-4 border rounded-lg hover:bg-muted/50 transition-colors"><h4 className="font-semibold mb-2"><a href="/category/finance/sharpe-ratio-calculator" className="text-primary hover:underline">Sharpe Ratio</a></h4><p className="text-sm text-muted-foreground">Total risk-adjusted return.</p></div>
          </div>
        </CardContent>
      </Card>

      {/* Complete SEO Guide */}
      <section className="space-y-6 text-muted-foreground leading-relaxed bg-card p-6 md:p-10 rounded-lg shadow-lg" itemScope itemType="https://schema.org/FinanceSummary">
        {/* SEO & SCHEMA METADATA */}
        <meta itemProp="name" content="The Definitive Guide to Jensen's Alpha: The Skill Metric" />
        <meta itemProp="description" content="Calculate and interpret Jensen's Alpha. Separate luck from skill by measuring risk-adjusted returns against the Capital Asset Pricing Model (CAPM)." />
        <meta itemProp="keywords" content="Jensen's Alpha, CAPM, Risk-Adjusted Return, Alpha, Beta, Portfolio Performance, Abnormal Return, Investment Skill, Security Market Line" />
        <meta itemProp="author" content="[Your Site's Financial Analyst Team]" />
        <meta itemProp="datePublished" content="2025-11-15" />
        <meta itemProp="url" content="/definitive-guide-jensens-alpha" />

        <h1 className="text-3xl md:text-4xl font-extrabold text-foreground mb-4" itemProp="headline">The Definitive Guide to Jensen's Alpha: Did You Beat the Market?</h1>
        <p className="text-lg italic text-muted-foreground">"Alpha" is the most abused word in finance. Here is what it actually means, and how to verify if you really have it.</p>

        <h2 className="text-2xl font-bold text-foreground mt-8 mb-4">Table of Contents</h2>
        <ul className="list-disc ml-6 space-y-2 text-primary">
          <li><a href="#what-is-alpha" className="hover:underline">The "Excess Return" Myth</a></li>
          <li><a href="#security-market-line" className="hover:underline">The Security Market Line (SML)</a></li>
          <li><a href="#how-to-use" className="hover:underline">How to Use Alpha Correctly</a></li>
          <li><a href="#warnings" className="hover:underline">The "Fake Alpha" Trap</a></li>
        </ul>
        <hr />

        <h2 id="what-is-alpha" className="text-2xl font-bold text-foreground pt-8" itemProp="articleSection">The "Excess Return" Myth</h2>
        <p>If the S&P 500 is up 10%, and your portfolio is up 15%, do you have +5% Alpha? <strong>Probably not.</strong></p>
        <p>If you took 2x leverage to get that 15%, you actually <em>underperformed</em> on a risk-adjusted basis. Jensen's Alpha corrects for this by calculating what you <em>should have earned</em> given your risk (Beta).</p>
        <hr />

        <h2 id="security-market-line" className="text-2xl font-bold text-foreground pt-8" itemProp="articleSection">The Security Market Line (SML)</h2>
        <p>Imagine a line on a chart where the X-axis is Risk (Beta) and the Y-axis is Return.</p>
        <ul className="list-disc ml-6 space-y-2">
          <li><strong>On the Line (Alpha = 0):</strong> You got exactly the return you deserved for the risk you took. (Efficient Market).</li>
          <li><strong>Above the Line (Alpha &gt; 0):</strong> You got <em>more</em> return than your risk implied. This is "True Skill."</li>
          <li><strong>Below the Line (Alpha &lt; 0):</strong> You got <em>less</em> return than your risk implied. You took risk for no reason.</li>
        </ul>
        <hr />

        <h2 id="warnings" className="text-2xl font-bold text-foreground pt-8" itemProp="articleSection">The "Fake Alpha" Trap</h2>
        <p>Warning: Strategies that sell "volatility" (like selling covered calls) often show small positive Alpha for months, and then a massive negative Alpha in a crash. This is called "picking up pennies in front of a steamroller."</p>
        <p><strong>True Alpha</strong> comes from information advantage or structural edge, not just from selling insurance against tail risks.</p>
      </section>

      {/* FAQs */}
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <Info className="h-5 w-5" />
            Frequently Asked Questions
          </CardTitle>
          <CardDescription>Advanced Alpha Topics</CardDescription>
        </CardHeader>
        <CardContent className="space-y-6">
          <div>
            <h4 className="font-semibold text-lg mb-3">Is high Alpha always good?</h4>
            <p className="text-muted-foreground">
              Usually, yes. But if the Alpha comes from a very short track record (e.g., 6 months), it is statistically indistinguishable from luck. You need years of data to confirm Alpha.
            </p>
          </div>

          <div>
            <h4 className="font-semibold text-lg mb-3">Does Alpha persist?</h4>
            <p className="text-muted-foreground">
              Sadly, rarely. Research shows that mutual fund managers who generate Alpha in one period rarely repeat it in the next. This is why "Past performance is not indicative of future results" is on every disclaimer.
            </p>
          </div>

          <div>
            <h4 className="font-semibold text-lg mb-3">Can I get Alpha with ETFs?</h4>
            <p className="text-muted-foreground">
              Traditional passive ETFs have 0 Alpha (or slightly negative due to fees). However, "Smart Beta" ETFs try to systematically harvest factor premiums (Value, Momentum) which can look like Alpha relative to the standard S&P 500 index.
            </p>
          </div>

          <div>
            <h4 className="font-semibold text-lg mb-3">How does leverage affect Alpha?</h4>
            <p className="text-muted-foreground">
              Leverage increases Beta, but it does <em>not</em> increase Alpha. Alpha is the "residual" return. If you lever up a zero-alpha strategy, you just get a volatile zero-alpha strategy. You cannot magnify skill with leverage, only risk.
            </p>
          </div>

          <div>
            <h4 className="font-semibold text-lg mb-3">What if my Beta is negative?</h4>
            <p className="text-muted-foreground">
              If you have a negative Beta (e.g., you are short the market), the CAPM model expects you to lose money during a bull market. If you lose <em>less</em> than expected, that counts as Positive Alpha!
            </p>
          </div>

          <div>
            <h4 className="font-semibold text-lg mb-3">Why is the Risk-Free rate important?</h4>
            <p className="text-muted-foreground">
              It sets the baseline cost of capital. An Alpha of 2% when rates are 0% is impressive. An Alpha of 2% when rates are 10% might still be good, but the <em>total</em> return hurdle is much higher.
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
          <p>Jensen's Alpha allows you to grade your portfolio's report card.</p>
          <p>It strips away the return that the market "gave" you, leaving only the return you earned yourself.</p>
          <p>Positive Alpha is the Holy Grail of investing—elusive, valuable, and hard to verify.</p>
        </CardContent>
      </Card>
    </div>
  );
}



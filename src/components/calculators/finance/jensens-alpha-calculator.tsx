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
      <div itemScope itemType="https://schema.org/FinanceSummary">
        <section className="space-y-6 text-muted-foreground leading-relaxed bg-card p-6 md:p-10 rounded-lg shadow-lg">
          <h1 className="text-3xl md:text-4xl font-extrabold text-foreground mb-4" itemProp="name">The Definitive Guide to Jensen's Alpha</h1>
          <meta itemProp="description" content="Calculate Jensen's Alpha to determine if an investment is outperforming its risk-adjusted benchmark. Essential for evaluating portfolio manager skill." />
          <meta itemProp="author" content="MegaCalc Hub" />
          <meta itemProp="keywords" content="Jensen's Alpha, CAPM, Risk-Adjusted Return, Alpha, Beta, Portfolio Performance, Abnormal Return, Investment Skill" />

          <p className="text-lg italic text-muted-foreground">The classic metric for answering the big question: "Did the manager actually add value, or did they just get lucky riding the market?"</p>

          <h2 className="text-2xl font-bold text-foreground mt-8 mb-4" itemProp="articleSection">What is Jensen's Alpha?</h2>
          <p>Jensen's Alpha (or simply "Alpha") measures the excess return of an investment above what would be predicted by the Capital Asset Pricing Model (CAPM). It isolates the portion of return that cannot be explained by market movements (beta).</p>
          <p>If a fund manager delivers a 15% return in a year where the market was up 30%, that sounds good—until you realize they took twice the risk of the market. Jensen's Alpha corrects for this leverage.</p>

          <h2 className="text-2xl font-bold text-foreground mt-8 mb-4" itemProp="articleSection">The CAPM Connection</h2>
          <p>The calculation relies on the expected return formula according to CAPM:</p>
          <div className="bg-muted/50 p-4 rounded-lg my-4 font-mono text-sm">
            Expected Return = Risk-Free Rate + Beta × (Market Return - Risk-Free Rate)
          </div>
          <p>Alpha is simply the difference between the <strong>Actual Return</strong> and this <strong>Expected Return</strong>.</p>

          <h2 className="text-2xl font-bold text-foreground mt-8 mb-4" itemProp="articleSection">Interpreting Alpha</h2>
          <ul className="list-disc ml-6 space-y-2">
            <li><strong>Positive Alpha (&gt; 0):</strong> The manager has "beaten the market" on a risk-adjusted basis. This implies stock-picking skill or timing ability.</li>
            <li><strong>Zero Alpha:</strong> The manager performed exactly as expected given their risk level. This validates the efficient market hypothesis.</li>
            <li><strong>Negative Alpha (&lt; 0):</strong> The manager underperformed. They took risks that didn't pay off, or fees eroded the value created.</li>
          </ul>

          <h2 className="text-2xl font-bold text-foreground pt-8">Conclusion</h2>
          <p>Jensen's Alpha remains a cornerstone of performance attribution. While modern models (like Fama-French) add more factors, Jensen's Alpha provides the fundamental "skill vs. market" check that every investor needs.</p>
        </section>

        {/* FAQ Section */}
        <section className="mt-8">
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <Info className="h-5 w-5" />
                Frequently Asked Questions
              </CardTitle>
              <CardDescription>Expert answers on Alpha and Beta</CardDescription>
            </CardHeader>
            <CardContent className="space-y-6">
              <div itemScope itemProp="mainEntity" itemType="https://schema.org/Question">
                <h4 className="font-semibold text-lg mb-3" itemProp="name">What is the difference between Alpha and Beta?</h4>
                <div itemScope itemProp="acceptedAnswer" itemType="https://schema.org/Answer">
                  <p className="text-muted-foreground" itemProp="text"><strong>Beta</strong> measures systematic risk—how much the asset moves with the market. <strong>Alpha</strong> measures idiosyncratic return—the value added (or lost) independent of the market movement.</p>
                </div>
              </div>

              <div itemScope itemProp="mainEntity" itemType="https://schema.org/Question">
                <h4 className="font-semibold text-lg mb-3" itemProp="name">Does a high Alpha guarantee future reliability?</h4>
                <div itemScope itemProp="acceptedAnswer" itemType="https://schema.org/Answer">
                  <p className="text-muted-foreground" itemProp="text">No. Alpha is notoriously difficult to persist. A manager with high alpha in one year may regress to the mean regarding alpha in subsequent years. "Past performance is not indicative of future results" applies strongly here.</p>
                </div>
              </div>

              <div itemScope itemProp="mainEntity" itemType="https://schema.org/Question">
                <h4 className="font-semibold text-lg mb-3" itemProp="name">Can Alpha be negative even if returns are positive?</h4>
                <div itemScope itemProp="acceptedAnswer" itemType="https://schema.org/Answer">
                  <p className="text-muted-foreground" itemProp="text">Yes! If a fund returns 10%, but based on its high risk (beta), it <em>should</em> have returned 12%, it has a negative alpha (-2%). It made money, but less efficiently than a simple index fund with leverage would have.</p>
                </div>
              </div>

              <div itemScope itemProp="mainEntity" itemType="https://schema.org/Question">
                <h4 className="font-semibold text-lg mb-3" itemProp="name">How does the Risk-Free Rate affect Alpha?</h4>
                <div itemScope itemProp="acceptedAnswer" itemType="https://schema.org/Answer">
                  <p className="text-muted-foreground" itemProp="text">A higher risk-free rate increases the "hurdle" for the expected return. If risk-free rates rise, the manager needs to generate higher absolute returns just to maintain the same alpha.</p>
                </div>
              </div>

              <div itemScope itemProp="mainEntity" itemType="https://schema.org/Question">
                <h4 className="font-semibold text-lg mb-3" itemProp="name">Is Alpha the same as "Excess Return"?</h4>
                <div itemScope itemProp="acceptedAnswer" itemType="https://schema.org/Answer">
                  <p className="text-muted-foreground" itemProp="text">Not exactly. "Excess Return" usually just means (Portfolio Return - Risk-Free Rate) or (Portfolio Return - Benchmark Return). Alpha is <strong>risk-adjusted</strong> excess return, accounting for Beta.</p>
                </div>
              </div>

              <div itemScope itemProp="mainEntity" itemType="https://schema.org/Question">
                <h4 className="font-semibold text-lg mb-3" itemProp="name">Why is it called "Jensen's" Alpha?</h4>
                <div itemScope itemProp="acceptedAnswer" itemType="https://schema.org/Answer">
                  <p className="text-muted-foreground" itemProp="text">It is named after Michael Jensen, who first introduced the metric in a 1968 paper evaluating the performance of mutual funds.</p>
                </div>
              </div>

              <div itemScope itemProp="mainEntity" itemType="https://schema.org/Question">
                <h4 className="font-semibold text-lg mb-3" itemProp="name">How do fees affect Alpha?</h4>
                <div itemScope itemProp="acceptedAnswer" itemType="https://schema.org/Answer">
                  <p className="text-muted-foreground" itemProp="text">Fees reduce net returns directly. Since the Expected Return (based on market risk) doesn't care about your fees, every dollar of fees reduces Alpha by exactly one dollar. High fees make generating positive Alpha much harder.</p>
                </div>
              </div>

              <div itemScope itemProp="mainEntity" itemType="https://schema.org/Question">
                <h4 className="font-semibold text-lg mb-3" itemProp="name">Is it useful for individual stocks?</h4>
                <div itemScope itemProp="acceptedAnswer" itemType="https://schema.org/Answer">
                  <p className="text-muted-foreground" itemProp="text">Yes, you can calculate the alpha of a single stock over a period to see if it outperformed its theoretical CAPM return, though individual stock alpha is very volatile/noisy compared to diversified portfolios.</p>
                </div>
              </div>

              <div itemScope itemProp="mainEntity" itemType="https://schema.org/Question">
                <h4 className="font-semibold text-lg mb-3" itemProp="name">What is "Smart Beta"?</h4>
                <div itemScope itemProp="acceptedAnswer" itemType="https://schema.org/Answer">
                  <p className="text-muted-foreground" itemProp="text">Smart Beta strategies try to capture specific factors (like value or momentum) in a systematic way. Some argue that what was traditionally called "Alpha" is often just "Smart Beta" (exposure to factors other than the broad market).</p>
                </div>
              </div>

              <div itemScope itemProp="mainEntity" itemType="https://schema.org/Question">
                <h4 className="font-semibold text-lg mb-3" itemProp="name">What if the Alpha is zero?</h4>
                <div itemScope itemProp="acceptedAnswer" itemType="https://schema.org/Answer">
                  <p className="text-muted-foreground" itemProp="text">Zero alpha means the investment lies exactly on the Security Market Line (SML). It is fairly priced for its risk. This is the expected outcome for the average investor in an efficient market.</p>
                </div>
              </div>
            </CardContent>
          </Card>
        </section>
      </div>

      {/* Summary Section */}
      <Card>
        <CardHeader><CardTitle className="flex items-center gap-2"><Info className="h-5 w-5" />Summary</CardTitle></CardHeader>
        <CardContent><p className="text-muted-foreground">Jensen's Alpha isolates the true value-add of a manager by stripping out returns attributable to market risk. It's the litmus test for skill: positive alpha means outperformance that wasn't just "levering up."</p></CardContent>
      </Card>
    </div>
  );
}



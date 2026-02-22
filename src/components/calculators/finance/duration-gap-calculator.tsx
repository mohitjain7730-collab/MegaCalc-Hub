'use client';

import { useState } from 'react';
import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import { z } from 'zod';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Form, FormControl, FormField, FormItem, FormLabel, FormMessage, FormDescription } from '@/components/ui/form';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Activity, Calculator, Info, TrendingUp, AlertCircle, CheckCircle2, Scale, DollarSign, History, Target } from 'lucide-react';
import { Badge } from '@/components/ui/badge';
import { Alert, AlertDescription } from '@/components/ui/alert';
import Link from 'next/link';

const formSchema = z.object({
  assetDuration: z.number().min(0.01, "Duration must be positive"),
  liabilityDuration: z.number().min(0, "Duration must be non-negative"),
  totalAssets: z.number().min(1, "Assets must be positive"),
  totalLiabilities: z.number().min(0, "Liabilities must be non-negative"),
  currentRate: z.number().min(0, "Rate must be non-negative"), // Used for sensitivity
  rateChange: z.number().optional(), // For stress testing (bps)
});

type FormValues = z.infer<typeof formSchema>;

export default function DurationGapCalculator() {
  const [result, setResult] = useState<{
    durationGap: number;
    leverageRatio: number;
    netWorthChangeAmount: number;
    gapStatus: string;
    sensitivity: string;
    recommendation: string;
    insights: string[];
    riskAssessment: string[];
  } | null>(null);

  const form = useForm<FormValues>({
    resolver: zodResolver(formSchema),
    defaultValues: {
      assetDuration: undefined,
      liabilityDuration: undefined,
      totalAssets: undefined,
      totalLiabilities: undefined,
      currentRate: 5,
      rateChange: 100, // Default 100 bps shock
    },
  });

  const calculate = (v: FormValues) => {
    // Formula: DG = Da - (L/A * Dl)
    const leverageRatio = v.totalLiabilities / v.totalAssets;
    const durationGap = v.assetDuration - (leverageRatio * v.liabilityDuration);

    // Calculate sensitivity to rate shock
    // ΔNW ≈ -DG * A * Δi / (1+i)
    // We assume Modified Duration inputs or adjust slightly. Standard formula typically uses Mod Duration.
    // If inputs are Macaulay, we'd div by (1+y), but let's assume Modified for standard risk mgmt.
    const rateChangeDecimal = (v.rateChange || 0) / 10000; // bps to scalar
    const netWorthChangeAmount = -durationGap * v.totalAssets * rateChangeDecimal;

    return {
      durationGap,
      leverageRatio,
      netWorthChangeAmount
    };
  };

  const getStatus = (gap: number) => {
    if (Math.abs(gap) < 0.1) return 'Immunized (Zero Gap)';
    if (gap > 0) return 'Positive Gap (Asset Sensitive)';
    return 'Negative Gap (Liability Sensitive)';
  };

  const getSensitivity = (gap: number) => {
    if (gap > 2) return 'High exposure to rising rates';
    if (gap < -2) return 'High exposure to falling rates';
    return 'Moderate Rate Sensitivity';
  };

  const getRecommendation = (gap: number) => {
    if (Math.abs(gap) < 0.5) return "Portfolio is well-immunized. Net worth is largely protected from small rate shifts.";
    if (gap > 0) return "Positive Gap. You lose equity value if rates RISE. Consider shortening asset duration or lengthening liability duration to immunize.";
    return "Negative Gap. You lose equity value if rates FALL. Consider lengthening asset duration or shortening liability duration to immunize.";
  };

  const getInsights = (gap: number, leverage: number) => {
    const insights = [];
    if (leverage > 0.9) insights.push('High Leverage: Even small duration gaps causes massive equity volatility due to thin capital buffer.');
    if (gap > 0) insights.push('Asset Sensitive: Your assets are locked in longer than your debts. You benefit if rates fall.');
    else insights.push('Liability Sensitive: Your debts reprice slower than your assets. You benefit if rates rise.');
    return insights;
  };

  const getRisks = (gap: number) => {
    const risks = [];
    risks.push('Convexity Risk: Duration is linear. Large rate moves may behave differently than predicted.');
    if (Math.abs(gap) > 3) risks.push('Extreme Mismatch: Significant speculation on interest rate direction.');
    return risks;
  };

  const onSubmit = (values: FormValues) => {
    const calc = calculate(values);
    setResult({
      durationGap: calc.durationGap,
      leverageRatio: calc.leverageRatio,
      netWorthChangeAmount: calc.netWorthChangeAmount,
      gapStatus: getStatus(calc.durationGap),
      sensitivity: getSensitivity(calc.durationGap),
      recommendation: getRecommendation(calc.durationGap),
      insights: getInsights(calc.durationGap, calc.leverageRatio),
      riskAssessment: getRisks(calc.durationGap)
    });
  };

  return (
    <div className="space-y-8">

      {/* Input Form */}
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <Scale className="h-5 w-5" />
            Balance Sheet Parameters
          </CardTitle>
          <CardDescription>
            Input Asset and Liability details to calculate the Duration Gap exposure.
          </CardDescription>
        </CardHeader>
        <CardContent>
          <Form {...form}>
            <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-6">
              <div className="grid grid-cols-1 md:grid-cols-2 gap-x-8 gap-y-4">
                {/* Assets Column */}
                <div className="space-y-4">
                  <h4 className="font-semibold text-sm text-primary flex items-center gap-2"><TrendingUp className="h-4 w-4" /> Assets</h4>
                  <FormField
                    control={form.control}
                    name="totalAssets"
                    render={({ field }) => (
                      <FormItem>
                        <FormLabel>Total Assets ($)</FormLabel>
                        <FormControl>
                          <Input type="number" placeholder="10000000" {...field} onChange={e => field.onChange(parseFloat(e.target.value))} />
                        </FormControl>
                        <FormMessage />
                      </FormItem>
                    )}
                  />
                  <FormField
                    control={form.control}
                    name="assetDuration"
                    render={({ field }) => (
                      <FormItem>
                        <FormLabel>Asset Duration (Years)</FormLabel>
                        <FormControl>
                          <Input type="number" step="0.1" placeholder="5.5" {...field} onChange={e => field.onChange(parseFloat(e.target.value))} />
                        </FormControl>
                        <FormMessage />
                      </FormItem>
                    )}
                  />
                </div>

                {/* Liabilities Column */}
                <div className="space-y-4">
                  <h4 className="font-semibold text-sm text-red-600 flex items-center gap-2"><History className="h-4 w-4" /> Liabilities</h4>
                  <FormField
                    control={form.control}
                    name="totalLiabilities"
                    render={({ field }) => (
                      <FormItem>
                        <FormLabel>Total Liabilities ($)</FormLabel>
                        <FormControl>
                          <Input type="number" placeholder="9000000" {...field} onChange={e => field.onChange(parseFloat(e.target.value))} />
                        </FormControl>
                        <FormMessage />
                      </FormItem>
                    )}
                  />
                  <FormField
                    control={form.control}
                    name="liabilityDuration"
                    render={({ field }) => (
                      <FormItem>
                        <FormLabel>Liability Duration (Years)</FormLabel>
                        <FormControl>
                          <Input type="number" step="0.1" placeholder="2.5" {...field} onChange={e => field.onChange(parseFloat(e.target.value))} />
                        </FormControl>
                        <FormMessage />
                      </FormItem>
                    )}
                  />
                </div>
              </div>

              {/* Scenario */}
              <div className="pt-4 border-t">
                <FormField
                  control={form.control}
                  name="rateChange"
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel className="flex items-center gap-2 font-semibold">
                        <Activity className="h-4 w-4" /> Stress Test: Rate Shock (bps)
                      </FormLabel>
                      <FormControl>
                        <Input type="number" placeholder="100" {...field} onChange={e => field.onChange(parseFloat(e.target.value))} />
                      </FormControl>
                      <FormDescription className="text-xs">
                        Simulate a parallel shift in the yield curve (e.g. 100 bps = 1%).
                      </FormDescription>
                      <FormMessage />
                    </FormItem>
                  )}
                />
              </div>

              <Button type="submit" className="w-full">
                <Calculator className="mr-2 h-4 w-4" />
                Calculate Gap Analysis
              </Button>
            </form>
          </Form>
        </CardContent>
      </Card>

      {/* Results */}
      {result && (
        <div className="space-y-6">
          {/* Main Result Card */}
          <Card>
            <CardHeader>
              <div className="flex items-center gap-4">
                <Scale className="h-8 w-8 text-primary" />
                <div>
                  <CardTitle>ALM Exposure Analysis</CardTitle>
                  <CardDescription>Net Worth Sensitivity</CardDescription>
                </div>
              </div>
            </CardHeader>
            <CardContent className="space-y-6">
              <div className="text-center">
                <p className="text-4xl font-bold text-primary">{result.durationGap.toFixed(2)} Years</p>
                <div className="flex justify-center items-center gap-2 mt-2">
                  <Badge variant={result.durationGap > 0 ? "default" : "secondary"}>
                    {result.gapStatus}
                  </Badge>
                </div>
                <p className="text-lg font-semibold mt-4">
                  Est. Net Worth Impact: <span className={result.netWorthChangeAmount >= 0 ? "text-green-600" : "text-red-600"}>
                    {result.netWorthChangeAmount >= 0 ? "+" : ""}{result.netWorthChangeAmount.toLocaleString('en-US', { style: 'currency', currency: 'USD' })}
                  </span>
                </p>
                <p className="text-xs text-muted-foreground">(For a {form.getValues('rateChange')} bps rate increase)</p>
              </div>

              <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                <div className="text-center p-4 bg-muted/50 rounded-lg">
                  <DollarSign className="h-6 w-6 mx-auto mb-2 text-blue-600" />
                  <p className="font-semibold">Leverage Ratio</p>
                  <p className="font-medium text-lg">{(result.leverageRatio * 100).toFixed(1)}%</p>
                </div>
                <div className="text-center p-4 bg-muted/50 rounded-lg">
                  <Activity className="h-6 w-6 mx-auto mb-2 text-green-600" />
                  <p className="font-semibold">Sensitivity</p>
                  <p className="text-sm font-medium pt-1">{result.sensitivity}</p>
                </div>
                <div className="text-center p-4 bg-muted/50 rounded-lg">
                  <Target className="h-6 w-6 mx-auto mb-2 text-purple-600" />
                  <p className="font-semibold">Target Gap</p>
                  <p className="font-medium text-lg">0.00</p>
                </div>
              </div>

              <Alert>
                <Info className="h-4 w-4" />
                <AlertDescription>
                  <strong>Strategy:</strong> {result.recommendation}
                </AlertDescription>
              </Alert>
            </CardContent>
          </Card>

          {/* Smart Actions & Insights */}
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6 mb-6">
            <Card className="h-full">
              <CardHeader>
                <CardTitle className="flex items-center gap-2 text-xl text-primary">
                  <TrendingUp className="h-6 w-6" />
                  Strategic Insights
                </CardTitle>
                <CardDescription>Optimization opportunities</CardDescription>
              </CardHeader>
              <CardContent className="space-y-4">
                {result.insights.map((insight, index) => (
                  <div key={index} className="flex items-start gap-3 p-3 bg-primary/5 rounded-lg border border-primary/10">
                    <CheckCircle2 className="h-5 w-5 text-primary mt-0.5 shrink-0" />
                    <span className="text-sm font-medium">{insight}</span>
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
                {result.riskAssessment.map((risk, index) => (
                  <div key={index} className="flex items-start gap-3 p-3 bg-red-50 dark:bg-red-900/10 rounded-lg border border-red-100 dark:border-red-900/20">
                    <AlertCircle className="h-5 w-5 text-red-600 dark:text-red-400 mt-0.5 shrink-0" />
                    <span className="text-sm font-medium text-red-800 dark:text-red-300">{risk}</span>
                  </div>
                ))}
              </CardContent>
            </Card>
          </div>
        </div>
      )}

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
              Duration Gap = Duration(Assets) - [ (Liabilities / Assets) × Duration(Liabilities) ]
            </p>
            <p className="font-mono text-xs text-center text-muted-foreground mt-2">
              Δ Net Worth ≈ - Duration Gap × Assets × [ Δi / (1 + i) ]
            </p>
          </div>
          <p className="text-sm text-muted-foreground mt-2">
            The Duration Gap measures the mismatch in timing of cash flows. A gap of zero means Equity value is preserved even if interest rates change (Immunization).
          </p>
        </CardContent>
      </Card>

      {/* Related Calculators */}
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <Calculator className="h-5 w-5" />
            Related Financial Calculators
          </CardTitle>
          <CardDescription>
            Tools for Fixed Income and Risk
          </CardDescription>
        </CardHeader>
        <CardContent>
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
            <Link href="/bond-duration-calculator" className="block">
              <Card className="hover:shadow-md transition-shadow cursor-pointer">
                <CardContent className="p-4">
                  <div className="flex items-center gap-3">
                    <Activity className="h-5 w-5 text-green-600" />
                    <div>
                      <p className="font-medium">Bond Duration</p>
                      <p className="text-sm text-muted-foreground">Macaulay & Modified</p>
                    </div>
                  </div>
                </CardContent>
              </Card>
            </Link>
            <Link href="/bond-convexity-calculator" className="block">
              <Card className="hover:shadow-md transition-shadow cursor-pointer">
                <CardContent className="p-4">
                  <div className="flex items-center gap-3">
                    <TrendingUp className="h-5 w-5 text-blue-600" />
                    <div>
                      <p className="font-medium">Bond Convexity</p>
                      <p className="text-sm text-muted-foreground">Second-order Risk</p>
                    </div>
                  </div>
                </CardContent>
              </Card>
            </Link>
            <Link href="/value-at-risk-calculator" className="block">
              <Card className="hover:shadow-md transition-shadow cursor-pointer">
                <CardContent className="p-4">
                  <div className="flex items-center gap-3">
                    <AlertCircle className="h-5 w-5 text-purple-600" />
                    <div>
                      <p className="font-medium">Value at Risk</p>
                      <p className="text-sm text-muted-foreground">VaR Analysis</p>
                    </div>
                  </div>
                </CardContent>
              </Card>
            </Link>
          </div>
        </CardContent>
      </Card>

      {/* Complete Guide Section */}
      <section className="space-y-6 text-muted-foreground leading-relaxed bg-card p-6 md:p-10 rounded-lg shadow-lg" itemScope itemType="https://schema.org/FinanceSummary">
        {/* SEO & SCHEMA METADATA */}
        <meta itemProp="name" content="The Definitive Guide to Duration Gap Analysis" />
        <meta itemProp="description" content="Master Asset-Liability Management (ALM) with Duration Gap Analysis. Learn to immunize portfolios against interest rate risk and protect Net Worth." />
        <meta itemProp="keywords" content="Duration Gap, Asset Liability Management, ALM, Interest Rate Risk, Immunization, Bank Risk Management, Modified Duration, Convexity" />
        <meta itemProp="author" content="[Your Site's Financial Analyst Team]" />
        <meta itemProp="datePublished" content="2025-11-25" />
        <meta itemProp="url" content="/definitive-guide-duration-gap" />

        <h1 className="text-3xl md:text-4xl font-extrabold text-foreground mb-4" itemProp="headline">The Definitive Guide to Duration Gap: Immunizing Financial Risk</h1>
        <p className="text-lg italic text-muted-foreground">In banking and institutional finance, the greatest threat isn&apos;t always default risk—it&apos;s the silent erosion of equity caused by mismatched interest rate exposures.</p>

        {/* TABLE OF CONTENTS */}
        <h2 className="text-2xl font-bold text-foreground mt-8 mb-4">Table of Contents: Jump to a Section</h2>
        <ul className="list-disc ml-6 space-y-2 text-primary">
          <li><a href="#concept" className="hover:underline">What is Duration Gap?</a></li>
          <li><a href="#formula" className="hover:underline">The Mechanics: Calculating the Gap</a></li>
          <li><a href="#positive-vs-negative" className="hover:underline">Positive vs. Negative Gap Analysis</a></li>
          <li><a href="#immunization" className="hover:underline">The Strategy of Immunization</a></li>
          <li><a href="#limitations" className="hover:underline">Limitations of Duration Analysis</a></li>
        </ul>
        <hr />

        {/* CONCEPT */}
        <h2 id="concept" className="text-2xl font-bold text-foreground pt-8" itemProp="articleSection">What is Duration Gap?</h2>
        <p><strong>Duration Gap</strong> is a financial metric used by banks, pension funds, and insurance companies to measure the sensitivity of their Net Worth (Equity) to changes in interest rates. It compares the weighted average duration of assets to the weighted average duration of liabilities.</p>
        <p>It answers the critical question: <em>&quot;If interest rates rise by 1%, will my firm lose equity value?&quot;</em></p>
        <hr />

        {/* FORMULA */}
        <h2 id="formula" className="text-2xl font-bold text-foreground pt-8" itemProp="articleSection">The Mechanics: Calculating the Gap</h2>
        <p>The calculation considers that Assets are funded by both Liabilities and Equity. Therefore, the duration of liabilities must be adjusted by the Leverage Ratio (Liabilities/Assets) to be comparable.</p>

        <div className="overflow-x-auto my-6 p-4 bg-muted border rounded-lg text-center">
          <p className="font-mono text-xl text-primary font-bold">
            {'DG = D(Assets) - [(L/A) × D(Liabilities)]'}
          </p>
        </div>

        <p>Where:</p>
        <ul className="list-disc ml-6 space-y-2">
          <li><strong>D(Assets):</strong> Macaulay or Modified duration of all assets.</li>
          <li><strong>D(Liabilities):</strong> Duration of all debts and deposits.</li>
          <li><strong>L/A:</strong> Leverage Ratio (Total Liabilities / Total Assets).</li>
        </ul>
        <hr />

        {/* POSITIVE VS NEGATIVE */}
        <h2 id="positive-vs-negative" className="text-2xl font-bold text-foreground pt-8" itemProp="articleSection">Positive vs. Negative Gap Analysis</h2>

        <div className="grid grid-cols-1 md:grid-cols-2 gap-6 my-6">
          <div className="p-4 border rounded-lg bg-blue-50 dark:bg-blue-900/10">
            <h3 className="text-lg font-bold text-blue-700 dark:text-blue-400 mb-2">Positive Gap (+ Years)</h3>
            <p><strong>Asset Duration &gt; Liability Duration</strong></p>
            <p>The institution is &quot;Asset Sensitive.&quot;</p>
            <p><strong>Risk:</strong> Rising interest rates reduce the value of assets more than liabilities, causing Equity to fall.</p>
            <p><strong>Benefit:</strong> Falling rates boost Equity.</p>
          </div>
          <div className="p-4 border rounded-lg bg-orange-50 dark:bg-orange-900/10">
            <h3 className="text-lg font-bold text-orange-700 dark:text-orange-400 mb-2">Negative Gap (- Years)</h3>
            <p><strong>Liability Duration &gt; Asset Duration</strong></p>
            <p>The institution is &quot;Liability Sensitive.&quot;</p>
            <p><strong>Risk:</strong> Falling interest rates increase the value of liabilities more than assets, hurting Equity.</p>
            <p><strong>Benefit:</strong> Rising rates boost Equity.</p>
          </div>
        </div>
        <hr />

        {/* IMMUNIZATION */}
        <h2 id="immunization" className="text-2xl font-bold text-foreground pt-8" itemProp="articleSection">The Strategy of Immunization</h2>
        <p>Immunization is the process of structuring a balance sheet so that the Duration Gap is zero. When the gap is zero, changes in interest rates affect the value of assets and liabilities equally, leaving the Net Worth unchanged.</p>
        <p>This is often achieved using interest rate swaps (e.g., swapping fixed-rate asset income for floating-rate income to lower asset duration).</p>
        <hr />

        {/* LIMITATIONS */}
        <h2 id="limitations" className="text-2xl font-bold text-foreground pt-8" itemProp="articleSection">Limitations of Duration Analysis</h2>
        <p>While powerful, Duration Gap has flaws:</p>
        <ul className="list-disc ml-6 space-y-2">
          <li><strong>Convexity:</strong> It assumes a linear relationship between price and rates. For large rate moves, this is inaccurate.</li>
          <li><strong>Parallel Shifts:</strong> It assumes the entire yield curve moves up or down uniformly. It fails to capture risk from &quot;twists&quot; (e.g., short-term rates rising while long-term rates fall).</li>
          <li><strong>Dynamic Behavior:</strong> Prepayments on mortgages (Assets) or early withdrawals of deposits (Liabilities) change duration dynamically as rates move.</li>
        </ul>
      </section>

      {/* FAQ Section */}
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <Info className="h-5 w-5" />
            Frequently Asked Questions
          </CardTitle>
          <CardDescription>
            Expert answers on ALM and Risk Management
          </CardDescription>
        </CardHeader>
        <CardContent>
          <div className="space-y-6">
            <div>
              <h4 className="font-semibold text-lg mb-3">What is the &quot;Ideal&quot; Duration Gap?</h4>
              <p className="text-muted-foreground">
                For a risk-averse institution, the ideal gap is zero (Immunized). However, many banks intentionally maintain a small gap based on their interest rate forecast to generate speculative profit.
              </p>
            </div>

            <div>
              <h4 className="font-semibold text-lg mb-3">Why are banks typically Asset Sensitive (Positive Gap)?</h4>
              <p className="text-muted-foreground">
                Banks often lend long-term (Mortgages, 30 years) but borrow short-term (Deposits, 0 years). This structural mismatch naturally creates a positive duration gap, making them vulnerable to rising rates.
              </p>
            </div>

            <div>
              <h4 className="font-semibold text-lg mb-3">How does Net Worth change with rates?</h4>
              <p className="text-muted-foreground">
                The formula is intuitive: Change in Equity = - (Duration Gap) × Assets × Change in Rates. The negative sign means that if you have a positive gap, a positive rate change hurts you.
              </p>
            </div>

            <div>
              <h4 className="font-semibold text-lg mb-3">Can I use Modified Duration here?</h4>
              <p className="text-muted-foreground">
                Yes, Modified Duration is preferred as it already accounts for yield levels. Macaulay Duration must be divided by (1+yield) to be accurate for price sensitivity.
              </p>
            </div>

            <div>
              <h4 className="font-semibold text-lg mb-3">What is &quot;Convexity&quot;?</h4>
              <p className="text-muted-foreground">
                Convexity measures the curvature of the price-yield relationship. It is the "second derivative." If duration is speed, convexity is acceleration. A highly convex portfolio is more protected against large rate shocks.
              </p>
            </div>

            <div>
              <h4 className="font-semibold text-lg mb-3">How do swaps affect the gap?</h4>
              <p className="text-muted-foreground">
                A &quot;Pay Fixed / Receive Float&quot; swap reduces asset duration (or increases liability duration), effectively lowering a positive gap. It converts a fixed asset into a floating asset with near-zero duration.
              </p>
            </div>

            <div>
              <h4 className="font-semibold text-lg mb-3">Does this apply to personal finance?</h4>
              <p className="text-muted-foreground">
                Rarely. Individuals don't usually mark their liabilities (mortgage) to market. However, for a bond portfolio, duration gap is crucial to match the time horizon of the investment with the time horizon of the goal.
              </p>
            </div>

            <div>
              <h4 className="font-semibold text-lg mb-3">What is a &quot;Parallel Shift&quot;?</h4>
              <p className="text-muted-foreground">
                It assumes that 1-year, 5-year, and 30-year interest rates all increase by the exact same amount (e.g., +1%). In reality, yield curves often steepen or flatten.
              </p>
            </div>

            <div>
              <h4 className="font-semibold text-lg mb-3">How often should I calculate this?</h4>
              <p className="text-muted-foreground">
                Banks calculate this daily or even intra-day. For general portfolio management, quarterly reviews are typically sufficient.
              </p>
            </div>
          </div>
        </CardContent>
      </Card>

      <Card className="mb-6">
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <CheckCircle2 className="h-5 w-5" />
            Summary
          </CardTitle>
        </CardHeader>
        <CardContent className="space-y-2 text-sm text-muted-foreground">
          <p>The Duration Gap Calculator helps you visualize the interest rate risk embedded in your balance sheet.</p>
          <p>It is the cornerstone of modern Asset-Liability Management (ALM).</p>
          <p>Use it to ensure your net worth is protected against unexpected rate shocks.</p>
        </CardContent>
      </Card>
    </div>
  );
}

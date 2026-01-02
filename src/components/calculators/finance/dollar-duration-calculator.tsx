
'use client';

import { useState } from 'react';
import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import { z } from 'zod';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Form, FormControl, FormField, FormItem, FormLabel, FormMessage } from '@/components/ui/form';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Zap, TrendingUp, AlertCircle, Target, Info, Landmark, Calculator, DollarSign, BarChart3, Shield, TrendingDown, FunctionSquare, CheckCircle2 } from 'lucide-react';
import { Badge } from '@/components/ui/badge';
import { Alert, AlertDescription } from '@/components/ui/alert';
import { Accordion, AccordionContent, AccordionItem, AccordionTrigger } from '@/components/ui/accordion';
import Link from 'next/link';

const formSchema = z.object({
  cleanPrice: z.number().positive(),
  modifiedDuration: z.number().positive(),
  positionSize: z.number().positive().optional(),
});

type FormValues = z.infer<typeof formSchema>;

export default function DollarDurationCalculator() {
  const [result, setResult] = useState<{
    dollarDuration: number;
    pvbp: number;
    totalDollarDuration: number;
    interpretation: string;
    sensitivityLevel: string;
    recommendation: string;
    riskCategory: string;
    insights: string[];
    considerations: string[];
  } | null>(null);

  const form = useForm<FormValues>({
    resolver: zodResolver(formSchema),
    defaultValues: {
      cleanPrice: undefined,
      modifiedDuration: undefined,
      positionSize: 1000000,
    },
  });

  const calculate = (v: FormValues) => {
    if (v.cleanPrice == null || v.modifiedDuration == null) return null;
    const dollarDuration = v.modifiedDuration * v.cleanPrice; // per $100 face, per 1% move
    const pvbp = dollarDuration / 100; // per 1 bp
    const positionSize = v.positionSize || 1000000;
    const totalDollarDuration = (dollarDuration / 100) * positionSize; // scaled to position
    return { dollarDuration, pvbp, totalDollarDuration };
  };

  const interpret = (dollarDuration: number, duration: number) => {
    if (duration >= 10) return 'Very high dollar sensitivity with substantial P&L impact per 1% rate move.';
    if (duration >= 7) return 'High dollar duration indicating significant exposure to yield curve shifts.';
    if (duration >= 4) return 'Moderate dollar duration suitable for balanced fixed income portfolios.';
    if (duration >= 2) return 'Low dollar duration with limited dollar exposure to interest rate changes.';
    return 'Minimal dollar duration with near-zero sensitivity to rate movements.';
  };

  const getSensitivityLevel = (duration: number) => {
    if (duration >= 10) return 'Very High';
    if (duration >= 7) return 'High';
    if (duration >= 4) return 'Moderate';
    if (duration >= 2) return 'Low';
    return 'Very Low';
  };

  const getRecommendation = (dollarDuration: number, duration: number) => {
    if (duration >= 10) return 'Implement active duration hedging using Treasury futures or interest rate swaps to manage large dollar exposures.';
    if (duration >= 7) return 'Monitor dollar duration closely; consider partial hedging to reduce volatility during rate-sensitive periods.';
    if (duration >= 4) return 'Maintain current exposure with periodic rebalancing; suitable for intermediate-term investment horizons.';
    if (duration >= 2) return 'Low hedging urgency; focus on credit risk and other factors; rebalance annually.';
    return 'Dollar duration negligible; no duration hedging required; focus on reinvestment and credit considerations.';
  };

  const getRiskCategory = (duration: number) => {
    if (duration >= 10) return 'Aggressive';
    if (duration >= 7) return 'High Risk';
    if (duration >= 4) return 'Moderate Risk';
    if (duration >= 2) return 'Low Risk';
    return 'Conservative';
  };

  const getInsights = (dollarDuration: number, duration: number) => {
    const insights = [];
    if (duration >= 10) {
      insights.push('Large dollar swings expected from modest rate changes');
      insights.push('Long-duration positions amplify both gains and losses');
      insights.push('Consider immunization strategies for liability matching');
    } else if (duration >= 7) {
      insights.push('Significant P&L impact from parallel yield curve shifts');
      insights.push('Duration overlay with futures can reduce volatility');
      insights.push('Suitable for investors with strong directional rate views');
    } else if (duration >= 4) {
      insights.push('Balanced duration exposure for core fixed income');
      insights.push('Dollar duration manageable for most institutional portfolios');
      insights.push('Good risk-adjusted return potential in stable rate environments');
    } else if (duration >= 2) {
      insights.push('Limited rate exposure reduces portfolio volatility');
      insights.push('Focus shifts to credit selection and sector allocation');
      insights.push('Appropriate for risk-averse or short-horizon investors');
    } else {
      insights.push('Near-zero rate sensitivity in money market-like positions');
      insights.push('Dollar duration essentially negligible');
      insights.push('Ideal for liquidity reserves and cash management');
    }
    return insights;
  };

  const getConsiderations = (duration: number) => {
    const considerations = [];
    considerations.push('Dollar duration assumes parallel yield curve shifts only');
    considerations.push('Convexity effects can alter actual P&L for large rate moves');
    considerations.push('Recalculate as price and duration evolve over time');
    considerations.push('Sum dollar durations across positions for portfolio-level risk');
    considerations.push('Credit spread changes impact prices independently of rate duration');
    return considerations;
  };

  const onSubmit = (values: FormValues) => {
    const calcResult = calculate(values);
    if (calcResult !== null) {
      setResult({
        dollarDuration: calcResult.dollarDuration,
        pvbp: calcResult.pvbp,
        totalDollarDuration: calcResult.totalDollarDuration,
        interpretation: interpret(calcResult.dollarDuration, values.modifiedDuration!),
        sensitivityLevel: getSensitivityLevel(values.modifiedDuration!),
        recommendation: getRecommendation(calcResult.dollarDuration, values.modifiedDuration!),
        riskCategory: getRiskCategory(values.modifiedDuration!),
        insights: getInsights(calcResult.dollarDuration, values.modifiedDuration!),
        considerations: getConsiderations(values.modifiedDuration!)
      });
    }
  };

  return (
    <div className="space-y-8">

      {/* Input Form */}
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <Target className="h-5 w-5" />
            Bond Parameters
          </CardTitle>
          <CardDescription>
            Enter the bond's clean price and modified duration to calculate Dollar Duration
          </CardDescription>
        </CardHeader>
        <CardContent>
          <Form {...form}>
            <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-6">
              <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
                <FormField
                  control={form.control}
                  name="cleanPrice"
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel className="flex items-center gap-2">
                        <DollarSign className="h-4 w-4" />
                        Clean Price ($)
                      </FormLabel>
                      <FormControl>
                        <Input
                          type="number"
                          step="0.01"
                          placeholder="e.g., 100.25"
                          {...field}
                          value={field.value ?? ''}
                          onChange={e => field.onChange(parseFloat(e.target.value) || undefined)}
                        />
                      </FormControl>
                      <FormMessage />
                    </FormItem>
                  )}
                />
                <FormField
                  control={form.control}
                  name="modifiedDuration"
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel className="flex items-center gap-2">
                        <TrendingUp className="h-4 w-4" />
                        Modified Duration (years)
                      </FormLabel>
                      <FormControl>
                        <Input
                          type="number"
                          step="0.01"
                          placeholder="e.g., 6.2"
                          {...field}
                          value={field.value ?? ''}
                          onChange={e => field.onChange(parseFloat(e.target.value) || undefined)}
                        />
                      </FormControl>
                      <FormMessage />
                    </FormItem>
                  )}
                />
                <FormField
                  control={form.control}
                  name="positionSize"
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel className="flex items-center gap-2">
                        <Landmark className="h-4 w-4" />
                        Position Size ($)
                      </FormLabel>
                      <FormControl>
                        <Input
                          type="number"
                          step="1000"
                          placeholder="e.g., 1000000"
                          {...field}
                          value={field.value ?? ''}
                          onChange={e => field.onChange(parseFloat(e.target.value) || undefined)}
                        />
                      </FormControl>
                      <FormMessage />
                    </FormItem>
                  )}
                />
              </div>
              <Button type="submit" className="w-full">
                <Calculator className="mr-2 h-4 w-4" />
                Calculate Dollar Duration
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
                <DollarSign className="h-8 w-8 text-primary" />
                <div>
                  <CardTitle>Dollar Duration Analysis</CardTitle>
                  <CardDescription>Interest Rate Risk in Dollar Terms</CardDescription>
                </div>
              </div>
            </CardHeader>
            <CardContent className="space-y-6">
              <div className="text-center">
                <p className="text-4xl font-bold text-primary">${result.dollarDuration.toFixed(2)}</p>
                <p className="text-sm text-muted-foreground mt-1">per $100 face value per 1% yield change</p>
                <p className="text-lg text-muted-foreground mt-2">{result.interpretation}</p>
              </div>

              <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                <div className="text-center p-4 bg-muted/50 rounded-lg">
                  <Shield className="h-6 w-6 mx-auto mb-2 text-blue-600" />
                  <p className="font-semibold">Sensitivity Level</p>
                  <Badge variant={result.sensitivityLevel === 'Very High' ? 'destructive' : result.sensitivityLevel === 'High' ? 'destructive' : result.sensitivityLevel === 'Moderate' ? 'outline' : 'secondary'}>
                    {result.sensitivityLevel}
                  </Badge>
                </div>
                <div className="text-center p-4 bg-muted/50 rounded-lg">
                  <TrendingUp className="h-6 w-6 mx-auto mb-2 text-green-600" />
                  <p className="font-semibold">Risk Category</p>
                  <Badge variant={result.riskCategory === 'Aggressive' ? 'destructive' : result.riskCategory === 'High Risk' ? 'destructive' : result.riskCategory === 'Moderate Risk' ? 'outline' : 'secondary'}>
                    {result.riskCategory}
                  </Badge>
                </div>
                <div className="text-center p-4 bg-muted/50 rounded-lg">
                  <BarChart3 className="h-6 w-6 mx-auto mb-2 text-purple-600" />
                  <p className="font-semibold">PVBP (DV01)</p>
                  <p className="text-lg font-bold">${result.pvbp.toFixed(4)}</p>
                </div>
              </div>

              <div className="p-4 bg-muted/30 rounded-lg border">
                <div className="flex items-center gap-2 mb-2">
                  <Landmark className="h-5 w-5 text-primary" />
                  <p className="font-semibold">Total Position Dollar Duration</p>
                </div>
                <p className="text-2xl font-bold text-primary">${result.totalDollarDuration.toLocaleString(undefined, { minimumFractionDigits: 2, maximumFractionDigits: 2 })}</p>
                <p className="text-sm text-muted-foreground">P&L impact for a 1% parallel yield curve shift on your position</p>
              </div>

              <Alert>
                <Info className="h-4 w-4" />
                <AlertDescription>
                  <strong>Recommendation:</strong> {result.recommendation}
                </AlertDescription>
              </Alert>
            </CardContent>
          </Card>

          {/* Smart Actions & Recommendations */}
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6 mb-6">
            <Card className="h-full">
              <CardHeader>
                <CardTitle className="flex items-center gap-2 text-xl text-primary">
                  <Target className="h-6 w-6" />
                  Strategic Insights
                </CardTitle>
                <CardDescription>Duration risk management opportunities</CardDescription>
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
                {result.considerations.map((consideration, index) => (
                  <div key={index} className="flex items-start gap-3 p-3 bg-red-50 dark:bg-red-900/10 rounded-lg border border-red-100 dark:border-red-900/20">
                    <AlertCircle className="h-5 w-5 text-red-600 dark:text-red-400 mt-0.5 shrink-0" />
                    <span className="text-sm font-medium text-red-800 dark:text-red-300">{consideration}</span>
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
            <FunctionSquare className="h-5 w-5" />
            Formula Used
          </CardTitle>
        </CardHeader>
        <CardContent className="space-y-4">
          <div className="p-4 bg-muted rounded-lg overflow-x-auto">
            <p className="font-mono text-sm text-center">
              Dollar Duration = Modified Duration × Clean Price
            </p>
          </div>
          <p className="text-sm text-muted-foreground mt-2">
            Measures the dollar price change for a 1% (100 basis points) parallel shift in the yield curve. Divide by 100 to get PVBP (DV01) for per-basis-point sensitivity.
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
            Explore other fixed income and duration analysis tools
          </CardDescription>
        </CardHeader>
        <CardContent>
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
            <Link href="/category/finance/pvbp-calculator" className="block">
              <Card className="hover:shadow-md transition-shadow cursor-pointer">
                <CardContent className="p-4">
                  <div className="flex items-center gap-3">
                    <TrendingUp className="h-5 w-5 text-purple-600" />
                    <div>
                      <p className="font-medium">PVBP (DV01)</p>
                      <p className="text-sm text-muted-foreground">Price value of a basis point</p>
                    </div>
                  </div>
                </CardContent>
              </Card>
            </Link>
            <Link href="/category/finance/bond-duration-calculator" className="block">
              <Card className="hover:shadow-md transition-shadow cursor-pointer">
                <CardContent className="p-4">
                  <div className="flex items-center gap-3">
                    <DollarSign className="h-5 w-5 text-orange-600" />
                    <div>
                      <p className="font-medium">Bond Duration</p>
                      <p className="text-sm text-muted-foreground">Macaulay & Modified Duration</p>
                    </div>
                  </div>
                </CardContent>
              </Card>
            </Link>
            <Link href="/category/finance/bond-convexity-calculator" className="block">
              <Card className="hover:shadow-md transition-shadow cursor-pointer">
                <CardContent className="p-4">
                  <div className="flex items-center gap-3">
                    <BarChart3 className="h-5 w-5 text-blue-600" />
                    <div>
                      <p className="font-medium">Bond Convexity</p>
                      <p className="text-sm text-muted-foreground">Second-order price sensitivity</p>
                    </div>
                  </div>
                </CardContent>
              </Card>
            </Link>
            <Link href="/category/finance/duration-gap-calculator" className="block">
              <Card className="hover:shadow-md transition-shadow cursor-pointer">
                <CardContent className="p-4">
                  <div className="flex items-center gap-3">
                    <TrendingDown className="h-5 w-5 text-green-600" />
                    <div>
                      <p className="font-medium">Duration Gap</p>
                      <p className="text-sm text-muted-foreground">Asset-liability mismatch</p>
                    </div>
                  </div>
                </CardContent>
              </Card>
            </Link>
            <Link href="/category/finance/duration-matching-calculator" className="block">
              <Card className="hover:shadow-md transition-shadow cursor-pointer">
                <CardContent className="p-4">
                  <div className="flex items-center gap-3">
                    <Shield className="h-5 w-5 text-red-600" />
                    <div>
                      <p className="font-medium">Duration Matching</p>
                      <p className="text-sm text-muted-foreground">Immunization strategies</p>
                    </div>
                  </div>
                </CardContent>
              </Card>
            </Link>
            <Link href="/category/finance/convexity-adjustment-bond-futures-calculator" className="block">
              <Card className="hover:shadow-md transition-shadow cursor-pointer">
                <CardContent className="p-4">
                  <div className="flex items-center gap-3">
                    <Zap className="h-5 w-5 text-indigo-600" />
                    <div>
                      <p className="font-medium">Convexity Adjustment</p>
                      <p className="text-sm text-muted-foreground">Futures vs forward pricing</p>
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
        {/* SEO & SCHEMA METADATA (HIGHLY OPTIMIZED) */}
        <meta itemProp="name" content="The Definitive Guide to Dollar Duration: Calculation, Interpretation, and Risk Management Applications" />
        <meta itemProp="description" content="An expert guide detailing the Dollar Duration formula, its role in translating interest rate risk into dollar terms, interpreting sensitivity levels, and its application in portfolio hedging and immunization strategies." />
        <meta itemProp="keywords" content="dollar duration formula, interest rate risk dollar terms, duration times price, PVBP relationship, bond portfolio hedging, dollar sensitivity, fixed income risk management" />
        <meta itemProp="author" content="MegaCalc Financial Analysis Team" />
        <meta itemProp="datePublished" content="2025-10-25" />
        <meta itemProp="url" content="/definitive-dollar-duration-guide" />

        <h1 className="text-3xl md:text-4xl font-extrabold text-foreground mb-4" itemProp="headline">The Definitive Guide to Dollar Duration: Translating Interest Rate Risk into Actionable Dollar Terms</h1>
        <p className="text-lg italic text-muted-foreground">Master the essential metric that converts percentage-based duration into actual dollar P&L sensitivity for practical portfolio management and hedging.</p>

        {/* TABLE OF CONTENTS (INTERNAL LINKS FOR UX AND SEO) */}
        <h2 className="text-2xl font-bold text-foreground mt-8 mb-4">Table of Contents: Jump to a Section</h2>
        <ul className="list-disc ml-6 space-y-2 text-primary">
          <li><a href="#definition" className="hover:underline">Dollar Duration: Definition and Core Purpose</a></li>
          <li><a href="#calculation" className="hover:underline">The Dollar Duration Formula and Components</a></li>
          <li><a href="#interpretation" className="hover:underline">Interpreting Dollar Duration and Risk Levels</a></li>
          <li><a href="#pvbp-relationship" className="hover:underline">Relationship Between Dollar Duration and PVBP</a></li>
          <li><a href="#portfolio" className="hover:underline">Portfolio Aggregation and Risk Limits</a></li>
        </ul>
        <hr />

        {/* DOLLAR DURATION: DEFINITION AND CORE PURPOSE */}
        <h2 id="definition" className="text-2xl font-bold text-foreground pt-8" itemProp="articleSection">Dollar Duration: Definition and Core Purpose</h2>
        <p>**Dollar Duration** is the fundamental metric that translates a bond's interest rate sensitivity from percentage terms into actual dollar values. While modified duration tells you the percentage price change for a 1% yield move, dollar duration tells you the **actual dollar P&L** you'll experience.</p>

        <h3 className="text-xl font-semibold text-foreground mt-6">Why Dollar Terms Matter</h3>
        <p>Percentage-based duration is useful for comparing securities, but portfolio managers and risk officers need to know actual P&L impact. A 5-year duration bond sounds less risky than a 10-year duration bond, but if the 5-year position is $100 million and the 10-year position is $10 million, the dollar risk may be reversed. Dollar duration resolves this ambiguity.</p>

        <h3 className="text-xl font-semibold text-foreground mt-6">The Universal Risk Language</h3>
        <p>Dollar duration has become the standard language for communicating interest rate risk across fixed income desks, asset managers, and risk committees. Unlike percentage measures that require mental scaling, dollar duration immediately conveys the stakes: "A 50-basis-point rate rise costs us $2.5 million" is actionable information.</p>

        <hr />

        {/* THE DOLLAR DURATION FORMULA AND COMPONENTS */}
        <h2 id="calculation" className="text-2xl font-bold text-foreground pt-8" itemProp="articleSection">The Dollar Duration Formula and Components</h2>
        <p>Dollar duration is calculated by multiplying modified duration by the bond's clean price, giving the dollar price change per $100 face value for a 1% (100 bps) yield change.</p>

        <h3 className="text-xl font-semibold text-foreground mt-6">The Calculation Identity</h3>
        <p>The formula for Dollar Duration is:</p>
        <div className="overflow-x-auto my-6 p-4 bg-muted border rounded-lg text-center">
          <p className="font-mono text-xl text-destructive font-bold">
            {'Dollar Duration = Modified Duration × Clean Price'}
          </p>
        </div>

        <h3 className="text-xl font-semibold text-foreground mt-6">Understanding the Components</h3>
        <p>Each component contributes to the final dollar sensitivity:</p>
        <ul className="list-disc ml-6 space-y-2">
          <li>**Modified Duration**: Percentage price sensitivity per 1% yield change. Higher duration means greater sensitivity.</li>
          <li>**Clean Price**: The bond's quoted market price excluding accrued interest. Premium bonds (price &gt; 100) have higher dollar duration than discount bonds, all else equal.</li>
          <li>**Result**: Dollar change per $100 face value for a 100-basis-point yield move.</li>
        </ul>

        <h3 className="text-xl font-semibold text-foreground mt-6">Scaling to Position Size</h3>
        <p>To calculate total position dollar duration, scale by position size:</p>
        <div className="overflow-x-auto my-6 p-4 bg-muted border rounded-lg text-center">
          <p className="font-mono text-xl text-destructive font-bold">
            {'Position Dollar Duration = (Dollar Duration / 100) × Position Face Value'}
          </p>
        </div>
        <p>This gives you the actual P&L in dollars for your specific position when yields change by 1%.</p>

        <hr />

        {/* INTERPRETING DOLLAR DURATION AND RISK LEVELS */}
        <h2 id="interpretation" className="text-2xl font-bold text-foreground pt-8" itemProp="articleSection">Interpreting Dollar Duration and Risk Levels</h2>
        <p>Dollar duration interpretation depends on both the absolute value and your portfolio's risk tolerance and hedging capability.</p>

        <h3 className="text-xl font-semibold text-foreground mt-6">Dollar Duration by Duration Category</h3>
        <ul className="list-disc ml-6 space-y-2">
          <li><strong className="font-semibold">Very High Duration (10+ years):</strong> Dollar duration exceeds $10 per $100 face. Long-dated Treasuries, zero-coupon bonds, and long-duration corporates. Significant P&L volatility from rate changes.</li>
          <li><strong className="font-semibold">High Duration (7-10 years):</strong> Dollar duration around $7-10 per $100 face. Intermediate-to-long corporates and municipalities. Active hedging often appropriate.</li>
          <li><strong className="font-semibold">Moderate Duration (4-7 years):</strong> Dollar duration around $4-7 per $100 face. Core investment-grade bonds. Balanced risk-return for most portfolios.</li>
          <li><strong className="font-semibold">Low Duration (2-4 years):</strong> Dollar duration around $2-4 per $100 face. Short-term notes and floating-rate structures. Manageable rate risk.</li>
          <li><strong className="font-semibold">Very Low Duration (&lt;2 years):</strong> Dollar duration below $2 per $100 face. Money market instruments and near-maturity bonds. Minimal rate sensitivity.</li>
        </ul>

        <h3 className="text-xl font-semibold text-foreground mt-6">Risk Limit Frameworks</h3>
        <p>Institutional investors often establish dollar duration limits:</p>
        <ul className="list-disc ml-6 space-y-2">
          <li>**Absolute Limits**: Maximum dollar duration per sector or portfolio (e.g., $5 million max dollar duration).</li>
          <li>**Relative Limits**: Dollar duration as percentage of AUM (e.g., 1% of portfolio value per 100 bps).</li>
          <li>**VaR Integration**: Dollar duration feeds into Value-at-Risk calculations for comprehensive risk management.</li>
        </ul>

        <hr />

        {/* RELATIONSHIP BETWEEN DOLLAR DURATION AND PVBP */}
        <h2 id="pvbp-relationship" className="text-2xl font-bold text-foreground pt-8" itemProp="articleSection">Relationship Between Dollar Duration and PVBP</h2>
        <p>Dollar Duration and PVBP (DV01) are closely related, differing only by a factor of 100.</p>

        <h3 className="text-xl font-semibold text-foreground mt-6">The Conversion Formula</h3>
        <p>The relationship between Dollar Duration and PVBP is:</p>
        <div className="overflow-x-auto my-6 p-4 bg-muted border rounded-lg text-center">
          <p className="font-mono text-xl text-destructive font-bold">
            {'PVBP (DV01) = Dollar Duration / 100'}
          </p>
        </div>
        <p>This makes intuitive sense: if dollar duration measures change per 100 bps (1%), then PVBP measures change per 1 bp, which is 1/100th of that.</p>

        <h3 className="text-xl font-semibold text-foreground mt-6">When to Use Each Metric</h3>
        <ul className="list-disc ml-6 space-y-2">
          <li>**Dollar Duration**: Best for understanding P&L impact of significant rate moves (25-100+ bps) and for scenario analysis.</li>
          <li>**PVBP (DV01)**: Best for day-to-day hedging, calculating hedge ratios, and fine-tuning duration exposure.</li>
          <li>**Both Together**: Comprehensive risk reporting includes both metrics for different audiences and use cases.</li>
        </ul>

        <hr />

        {/* PORTFOLIO AGGREGATION AND RISK LIMITS */}
        <h2 id="portfolio" className="text-2xl font-bold text-foreground pt-8" itemProp="articleSection">Portfolio Aggregation and Risk Limits</h2>
        <p>Dollar duration's key advantage is simple portfolio-level aggregation since it's denominated in dollars.</p>

        <h3 className="text-xl font-semibold text-foreground mt-6">Summation Property</h3>
        <p>Total portfolio dollar duration equals the sum of individual position dollar durations:</p>
        <ul className="list-disc ml-6 space-y-2">
          <li>Long positions contribute positive dollar duration (lose money when rates rise).</li>
          <li>Short positions contribute negative dollar duration (gain money when rates rise).</li>
          <li>Net dollar duration indicates overall portfolio rate sensitivity in dollar terms.</li>
        </ul>

        <h3 className="text-xl font-semibold text-foreground mt-6">Hedging Applications</h3>
        <p>Dollar duration enables precise hedge ratio calculation:</p>
        <ul className="list-disc ml-6 space-y-2">
          <li>To hedge a $5 million dollar duration exposure, find a hedging instrument with equivalent (negative) dollar duration.</li>
          <li>Treasury futures, interest rate swaps, and inverse ETFs can provide offsetting dollar duration.</li>
          <li>Partial hedging reduces dollar duration to target level rather than zero.</li>
        </ul>

        <h3 className="text-xl font-semibold text-foreground mt-6">Dynamic Risk Management</h3>
        <p>Dollar duration changes continuously as markets move:</p>
        <ul className="list-disc ml-6 space-y-2">
          <li>As yields fall, duration rises, increasing dollar duration exposure.</li>
          <li>As bonds approach maturity, duration and dollar duration decline.</li>
          <li>Portfolio rebalancing and new purchases alter total dollar duration.</li>
        </ul>

        <hr />

        {/* CONCLUSION */}
        <h2 className="text-2xl font-bold text-foreground pt-8" itemProp="articleSection">Conclusion</h2>
        <p>Dollar Duration is the essential metric for translating **interest rate risk** from abstract percentages into actionable dollar P&L. By multiplying modified duration by price, it enables immediate understanding of portfolio stakes.</p>
        <p>Whether you're setting risk limits, calculating hedge ratios, or communicating exposure to stakeholders, dollar duration provides the common language for fixed income risk management. Combined with PVBP for fine-grained hedging and convexity for large rate moves, dollar duration forms the foundation of professional interest rate risk analysis.</p>
      </section>

      {/* FAQ Section */}
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <Info className="h-5 w-5" />
            Frequently Asked Questions
          </CardTitle>
          <CardDescription>
            Common questions about Dollar Duration and interest rate risk
          </CardDescription>
        </CardHeader>
        <CardContent>
          <div className="space-y-6">
            <div>
              <h4 className="font-semibold text-lg mb-3">What is Dollar Duration?</h4>
              <p className="text-muted-foreground">
                Dollar Duration measures the dollar change in a bond's price for a 1% (100 basis points) change in yield. It is calculated as Modified Duration × Clean Price. This metric translates percentage-based duration into actual dollar P&L sensitivity, making risk immediately actionable for portfolio management.
              </p>
            </div>

            <div>
              <h4 className="font-semibold text-lg mb-3">How is Dollar Duration related to PVBP (DV01)?</h4>
              <p className="text-muted-foreground">
                PVBP (DV01) equals Dollar Duration divided by 100. While Dollar Duration measures price change per 1% (100 bps) yield move, PVBP measures price change per 1 bp yield move. Both express rate sensitivity in dollar terms but at different granularities. PVBP is preferred for day-to-day hedging; Dollar Duration for scenario analysis.
              </p>
            </div>

            <div>
              <h4 className="font-semibold text-lg mb-3">Why use Dollar Duration instead of Modified Duration?</h4>
              <p className="text-muted-foreground">
                Modified Duration is percentage-based and requires mental scaling to understand actual P&L impact. Dollar Duration immediately tells you how many dollars you'll gain or lose. For a $50 million portfolio, saying "we'll lose $2.5 million if rates rise 50 bps" is more actionable than saying "duration is 5 years."
              </p>
            </div>

            <div>
              <h4 className="font-semibold text-lg mb-3">How do I aggregate Dollar Duration across a portfolio?</h4>
              <p className="text-muted-foreground">
                Sum individual position dollar durations, treating long positions as positive and short positions as negative. This simple summation works because dollar duration is denominated in dollars. The net sum indicates total portfolio sensitivity to parallel yield curve shifts expressed in P&L terms.
              </p>
            </div>

            <div>
              <h4 className="font-semibold text-lg mb-3">Does Dollar Duration change over time?</h4>
              <p className="text-muted-foreground">
                Yes, Dollar Duration changes continuously. As yields change, duration changes (higher yields compress duration). As bonds approach maturity, duration shortens. Price changes also affect dollar duration since it's duration × price. Regular recalculation is essential for accurate risk measurement.
              </p>
            </div>

            <div>
              <h4 className="font-semibold text-lg mb-3">How do I use Dollar Duration for hedging?</h4>
              <p className="text-muted-foreground">
                Calculate your portfolio's total dollar duration, then find hedging instruments (Treasury futures, swaps) with sufficient dollar duration to offset. If your portfolio has $5 million dollar duration and you want to reduce it to $2 million, sell hedging instruments with $3 million dollar duration.
              </p>
            </div>

            <div>
              <h4 className="font-semibold text-lg mb-3">What are the limitations of Dollar Duration?</h4>
              <p className="text-muted-foreground">
                Dollar Duration assumes parallel yield curve shifts and ignores convexity. For large rate moves, convexity causes actual P&L to deviate from Dollar Duration predictions. It doesn't capture curve steepening/flattening risk. For bonds with embedded options, effective duration must be used instead of modified duration.
              </p>
            </div>

            <div>
              <h4 className="font-semibold text-lg mb-3">How does convexity affect Dollar Duration accuracy?</h4>
              <p className="text-muted-foreground">
                Dollar Duration provides a linear approximation. Positive convexity (most bonds) means bonds gain more than Dollar Duration predicts when rates fall, and lose less when rates rise. For rate moves exceeding 25-50 bps, adding a convexity adjustment improves accuracy significantly.
              </p>
            </div>

            <div>
              <h4 className="font-semibold text-lg mb-3">Should I use modified or effective duration for Dollar Duration?</h4>
              <p className="text-muted-foreground">
                Use modified duration for bullet bonds without embedded options. For callable bonds, putable bonds, MBS, and structured products, use effective duration (calculated from price sensitivity to rate changes). Effective duration captures optionality effects that modified duration misses.
              </p>
            </div>

            <div>
              <h4 className="font-semibold text-lg mb-3">What Dollar Duration level requires active hedging?</h4>
              <p className="text-muted-foreground">
                This depends on risk tolerance and investment horizon. As a general guideline: portfolios with dollar duration exceeding 1-2% of AUM per 100 bps should consider active hedging. Aggressive portfolios may tolerate higher levels, while conservative portfolios (pension funds, insurance) often hedge to much lower thresholds.
              </p>
            </div>
          </div>
        </CardContent>
      </Card>

      <Card className="mb-6">
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <Shield className="h-5 w-5" />
            Summary
          </CardTitle>
        </CardHeader>
        <CardContent className="space-y-2 text-sm text-muted-foreground">
          <p>The Dollar Duration Calculator translates interest rate sensitivity from percentages into actionable dollar P&L terms.</p>
          <p>It is essential for portfolio risk measurement, enabling straightforward aggregation and hedge ratio calculation.</p>
          <p>Use this tool to quantify dollar exposure, set risk limits, and size duration hedges using Treasury futures or swaps.</p>
        </CardContent>
      </Card>
    </div>
  );
}


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

import Link from 'next/link';

const formSchema = z.object({
  cleanPrice: z.number().positive(),
  modifiedDuration: z.number().positive(),
  faceValue: z.number().positive().optional(),
});

type FormValues = z.infer<typeof formSchema>;

export default function PVBPCalculator() {
  const [result, setResult] = useState<{
    pvbp: number;
    dollarDuration: number;
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
      faceValue: 100,
    },
  });

  const calculate = (v: FormValues) => {
    if (v.cleanPrice == null || v.modifiedDuration == null) return null;
    const fv = v.faceValue || 100;
    const pvbp = v.modifiedDuration * v.cleanPrice * 0.0001; // per 1 bp
    const dollarDuration = v.modifiedDuration * v.cleanPrice; // per 1% move
    return { pvbp, dollarDuration };
  };

  const interpret = (pvbp: number, duration: number) => {
    if (duration >= 10) return 'Very high interest rate sensitivity with substantial dollar risk per basis point.';
    if (duration >= 7) return 'High sensitivity to rate changes with significant P&L impact from small yield moves.';
    if (duration >= 4) return 'Moderate rate sensitivity suitable for balanced portfolios.';
    if (duration >= 2) return 'Low rate sensitivity with limited exposure to yield curve shifts.';
    return 'Minimal rate sensitivity with negligible dollar impact per basis point.';
  };

  const getSensitivityLevel = (duration: number) => {
    if (duration >= 10) return 'Very High';
    if (duration >= 7) return 'High';
    if (duration >= 4) return 'Moderate';
    if (duration >= 2) return 'Low';
    return 'Very Low';
  };

  const getRecommendation = (pvbp: number, duration: number) => {
    if (duration >= 10) return 'Consider duration hedging with Treasury futures or interest rate swaps to reduce exposure.';
    if (duration >= 7) return 'Monitor closely and maintain hedging instruments ready; rebalance as yields change.';
    if (duration >= 4) return 'Appropriate for intermediate-term investors; periodic hedge ratio recalibration recommended.';
    if (duration >= 2) return 'Suitable for conservative portfolios; minimal hedging needed unless rates expected volatile.';
    return 'Duration risk minimal; focus on credit risk and other factors for this position.';
  };

  const getRiskCategory = (duration: number) => {
    if (duration >= 10) return 'Aggressive';
    if (duration >= 7) return 'High Risk';
    if (duration >= 4) return 'Moderate Risk';
    if (duration >= 2) return 'Low Risk';
    return 'Conservative';
  };

  const getInsights = (pvbp: number, duration: number) => {
    const insights = [];
    if (duration >= 10) {
      insights.push('PVBP indicates large dollar swings from small rate changes');
      insights.push('Long-duration bonds amplify both gains and losses');
      insights.push('Consider partial hedging to reduce volatility');
    } else if (duration >= 7) {
      insights.push('Significant rate sensitivity requires active monitoring');
      insights.push('Portfolio may benefit from duration overlay strategies');
      insights.push('Ideal for investors with strong rate views');
    } else if (duration >= 4) {
      insights.push('Balanced exposure suitable for core fixed income');
      insights.push('PVBP manageable for most institutional portfolios');
      insights.push('Good risk/return trade-off for intermediate horizons');
    } else if (duration >= 2) {
      insights.push('Limited rate exposure suitable for risk-averse investors');
      insights.push('Focus shifts to credit and liquidity factors');
      insights.push('Low duration buffers against rate volatility');
    } else {
      insights.push('Minimal rate risk in money market-like positions');
      insights.push('PVBP near zero implies cash-like behavior');
      insights.push('Appropriate for liquidity reserves');
    }
    return insights;
  };

  const getConsiderations = (duration: number) => {
    const considerations = [];
    considerations.push('PVBP assumes parallel yield curve shifts only');
    considerations.push('Convexity effects can alter actual P&L for large moves');
    considerations.push('Recompute PVBP as price and duration change over time');
    considerations.push('Aggregate PVBPs across holdings for portfolio-level risk');
    considerations.push('Credit spread changes also impact bond prices separately');
    return considerations;
  };

  const onSubmit = (values: FormValues) => {
    const result = calculate(values);
    if (result !== null) {
      setResult({
        pvbp: result.pvbp,
        dollarDuration: result.dollarDuration,
        interpretation: interpret(result.pvbp, values.modifiedDuration!),
        sensitivityLevel: getSensitivityLevel(values.modifiedDuration!),
        recommendation: getRecommendation(result.pvbp, values.modifiedDuration!),
        riskCategory: getRiskCategory(values.modifiedDuration!),
        insights: getInsights(result.pvbp, values.modifiedDuration!),
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
            Enter the bond's clean price and modified duration to calculate PVBP (DV01)
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
                  name="faceValue"
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel className="flex items-center gap-2">
                        <Landmark className="h-4 w-4" />
                        Face Value ($)
                      </FormLabel>
                      <FormControl>
                        <Input
                          type="number"
                          step="1"
                          placeholder="e.g., 100"
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
                Calculate PVBP (DV01)
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
                <Landmark className="h-8 w-8 text-primary" />
                <div>
                  <CardTitle>PVBP (Price Value of a Basis Point)</CardTitle>
                  <CardDescription>Interest Rate Risk Analysis</CardDescription>
                </div>
              </div>
            </CardHeader>
            <CardContent className="space-y-6">
              <div className="text-center">
                <p className="text-4xl font-bold text-primary">${result.pvbp.toFixed(4)}</p>
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
                  <p className="font-semibold">Dollar Duration</p>
                  <p className="text-lg font-bold">${result.dollarDuration.toFixed(2)}</p>
                </div>
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
              PVBP (DV01) = Modified Duration × Clean Price × 0.0001
            </p>
          </div>
          <p className="text-sm text-muted-foreground mt-2">
            Measures the dollar price change for a one basis point (0.01%) parallel shift in the yield curve. Essential for sizing hedges with Treasury futures or interest rate swaps.
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
            <Link href="/bond-duration-calculator" className="block">
              <Card className="hover:shadow-md transition-shadow cursor-pointer">
                <CardContent className="p-4">
                  <div className="flex items-center gap-3">
                    <TrendingUp className="h-5 w-5 text-purple-600" />
                    <div>
                      <p className="font-medium">Bond Duration</p>
                      <p className="text-sm text-muted-foreground">Macaulay & Modified Duration</p>
                    </div>
                  </div>
                </CardContent>
              </Card>
            </Link>
            <Link href="/dollar-duration-calculator" className="block">
              <Card className="hover:shadow-md transition-shadow cursor-pointer">
                <CardContent className="p-4">
                  <div className="flex items-center gap-3">
                    <DollarSign className="h-5 w-5 text-orange-600" />
                    <div>
                      <p className="font-medium">Dollar Duration</p>
                      <p className="text-sm text-muted-foreground">Duration × Price per 1%</p>
                    </div>
                  </div>
                </CardContent>
              </Card>
            </Link>
            <Link href="/bond-convexity-calculator" className="block">
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
            <Link href="/duration-gap-calculator" className="block">
              <Card className="hover:shadow-md transition-shadow cursor-pointer">
                <CardContent className="p-4">
                  <div className="flex items-center gap-3">
                    <TrendingDown className="h-5 w-5 text-green-600" />
                    <div>
                      <p className="font-medium">Duration Gap</p>
                      <p className="text-sm text-muted-foreground">Asset-liability duration mismatch</p>
                    </div>
                  </div>
                </CardContent>
              </Card>
            </Link>
            <Link href="/value-at-risk-calculator" className="block">
              <Card className="hover:shadow-md transition-shadow cursor-pointer">
                <CardContent className="p-4">
                  <div className="flex items-center gap-3">
                    <Shield className="h-5 w-5 text-red-600" />
                    <div>
                      <p className="font-medium">Value at Risk (VaR)</p>
                      <p className="text-sm text-muted-foreground">Portfolio risk quantification</p>
                    </div>
                  </div>
                </CardContent>
              </Card>
            </Link>
            <Link href="/convexity-adjustment-bond-futures-calculator" className="block">
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
        <meta itemProp="name" content="The Definitive Guide to PVBP (DV01): Price Value of a Basis Point Calculation, Interpretation, and Hedging Applications" />
        <meta itemProp="description" content="An expert guide detailing the PVBP (DV01) formula, its critical role in measuring interest rate risk, interpreting sensitivity levels, and its application in duration hedging with Treasury futures and interest rate swaps." />
        <meta itemProp="keywords" content="PVBP formula explained, DV01 calculation, price value of basis point, interest rate risk, duration hedging, Treasury futures hedging, bond risk management, dollar value 01" />
        <meta itemProp="author" content="MegaCalc Financial Analysis Team" />
        <meta itemProp="datePublished" content="2025-10-25" />
        <meta itemProp="url" content="/definitive-pvbp-dv01-guide" />

        <h1 className="text-3xl md:text-4xl font-extrabold text-foreground mb-4" itemProp="headline">The Definitive Guide to PVBP (DV01): Mastering Interest Rate Risk Measurement</h1>
        <p className="text-lg italic text-muted-foreground">Master the fundamental metric that quantifies dollar exposure to interest rate movements and enables precise hedging of fixed income portfolios.</p>

        {/* TABLE OF CONTENTS (INTERNAL LINKS FOR UX AND SEO) */}
        <h2 className="text-2xl font-bold text-foreground mt-8 mb-4">Table of Contents: Jump to a Section</h2>
        <ul className="list-disc ml-6 space-y-2 text-primary">
          <li><a href="#definition" className="hover:underline">PVBP (DV01): Definition and Core Purpose</a></li>
          <li><a href="#calculation" className="hover:underline">The PVBP Formula and Components</a></li>
          <li><a href="#interpretation" className="hover:underline">Interpreting PVBP Values and Risk Levels</a></li>
          <li><a href="#hedging" className="hover:underline">Hedging Applications: Treasury Futures and Swaps</a></li>
          <li><a href="#portfolio" className="hover:underline">Portfolio-Level PVBP Aggregation</a></li>
        </ul>
        <hr />

        {/* PVBP (DV01): DEFINITION AND CORE PURPOSE */}
        <h2 id="definition" className="text-2xl font-bold text-foreground pt-8" itemProp="articleSection">PVBP (DV01): Definition and Core Purpose</h2>
        <p>The **Price Value of a Basis Point (PVBP)**, also known as **DV01** (Dollar Value of 01), is the fundamental metric for quantifying interest rate risk in fixed income securities. It measures the dollar change in a bond's price for a one basis point (0.01%) parallel shift in the yield curve.</p>

        <h3 className="text-xl font-semibold text-foreground mt-6">The Industry Standard for Rate Risk</h3>
        <p>PVBP (DV01) has become the universal language for expressing interest rate sensitivity across fixed income markets. Unlike percentage-based duration, PVBP translates rate risk into actual dollar terms, making it immediately actionable for traders, portfolio managers, and risk officers. Whether you're managing a $10 million bond portfolio or a $1 billion institutional fund, PVBP tells you exactly how many dollars you'll gain or lose for each basis point move in rates.</p>

        <h3 className="text-xl font-semibold text-foreground mt-6">Why Basis Points Matter</h3>
        <p>Interest rates typically move in small increments measured in basis points. A 25-basis-point Fed rate hike, a 10-basis-point tightening in credit spreads, or a 5-basis-point move in Treasury yields are common occurrences. PVBP allows practitioners to instantly calculate P&L impact: if your portfolio has a PVBP of $50,000, a 10-basis-point rate rise means a $500,000 loss (10 × $50,000).</p>

        <hr />

        {/* THE PVBP FORMULA AND COMPONENTS */}
        <h2 id="calculation" className="text-2xl font-bold text-foreground pt-8" itemProp="articleSection">The PVBP Formula and Components</h2>
        <p>PVBP is calculated by multiplying the bond's modified duration by its price and then scaling to a one-basis-point move.</p>

        <h3 className="text-xl font-semibold text-foreground mt-6">The Calculation Identity</h3>
        <p>The formula for PVBP (DV01) is:</p>
        <div className="overflow-x-auto my-6 p-4 bg-muted border rounded-lg text-center">
          <p className="font-mono text-xl text-destructive font-bold">
            {'PVBP (DV01) = Modified Duration × Clean Price × 0.0001'}
          </p>
        </div>

        <h3 className="text-xl font-semibold text-foreground mt-6">Understanding Modified Duration</h3>
        <p>Modified Duration measures the percentage price change for a 1% (100 basis point) yield change. It is derived from Macaulay Duration adjusted for the yield level:</p>
        <ul className="list-disc ml-6 space-y-2">
          <li>**Macaulay Duration**: Weighted average time to receive cash flows.</li>
          <li>**Modified Duration**: Macaulay Duration / (1 + yield/frequency).</li>
          <li>**Effective Duration**: For bonds with embedded options, calculated numerically.</li>
        </ul>

        <h3 className="text-xl font-semibold text-foreground mt-6">The Role of Clean Price</h3>
        <p>Clean price is the bond's quoted market price excluding accrued interest. For PVBP calculations:</p>
        <ul className="list-disc ml-6 space-y-2">
          <li>Use the clean price for consistent risk measurement.</li>
          <li>The dirty price (clean + accrued) affects settlement but not duration sensitivity.</li>
          <li>Price is typically quoted per $100 face value, so adjust for actual position size.</li>
        </ul>

        <h3 className="text-xl font-semibold text-foreground mt-6">The 0.0001 Multiplier</h3>
        <p>The 0.0001 factor converts the percentage change (from modified duration) into a basis point change. Since modified duration gives percentage change per 1% (100 bps) yield move, dividing by 100 gives per-basis-point sensitivity: 1/100 = 0.01 × 0.01 = 0.0001.</p>

        <hr />

        {/* INTERPRETING PVBP VALUES AND RISK LEVELS */}
        <h2 id="interpretation" className="text-2xl font-bold text-foreground pt-8" itemProp="articleSection">Interpreting PVBP Values and Risk Levels</h2>
        <p>PVBP interpretation depends on both the absolute dollar amount and the context of your portfolio size and risk tolerance.</p>

        <h3 className="text-xl font-semibold text-foreground mt-6">PVBP by Duration Category</h3>
        <ul className="list-disc ml-6 space-y-2">
          <li><strong className="font-semibold">Very High Duration (10+ years):</strong> PVBP can exceed $0.10 per $100 face. Long-dated Treasury bonds and zero-coupon bonds fall here. A 50-bp rate move causes 5%+ price swings.</li>
          <li><strong className="font-semibold">High Duration (7-10 years):</strong> PVBP around $0.07-$0.10 per $100 face. Intermediate-to-long corporates and sovereigns. Significant P&L sensitivity requires active hedging.</li>
          <li><strong className="font-semibold">Moderate Duration (4-7 years):</strong> PVBP around $0.04-$0.07 per $100 face. Core investment-grade corporates. Balanced risk-return profile for most portfolios.</li>
          <li><strong className="font-semibold">Low Duration (2-4 years):</strong> PVBP around $0.02-$0.04 per $100 face. Short-term notes and floating-rate adjustments. Limited but non-trivial rate risk.</li>
          <li><strong className="font-semibold">Very Low Duration (&lt;2 years):</strong> PVBP below $0.02 per $100 face. Money market instruments and near-maturity bonds. Negligible rate sensitivity.</li>
        </ul>

        <h3 className="text-xl font-semibold text-foreground mt-6">Portfolio-Level Thresholds</h3>
        <p>For institutional portfolios, PVBP limits are often set as risk controls:</p>
        <ul className="list-disc ml-6 space-y-2">
          <li>**Conservative**: PVBP limit = 0.5% of portfolio value per 100 bps.</li>
          <li>**Moderate**: PVBP limit = 1-2% of portfolio value per 100 bps.</li>
          <li>**Aggressive**: PVBP limit = 3%+ of portfolio value per 100 bps.</li>
        </ul>

        <hr />

        {/* HEDGING APPLICATIONS: TREASURY FUTURES AND SWAPS */}
        <h2 id="hedging" className="text-2xl font-bold text-foreground pt-8" itemProp="articleSection">Hedging Applications: Treasury Futures and Swaps</h2>
        <p>PVBP is the cornerstone of duration hedging, enabling precise matching of interest rate exposures.</p>

        <h3 className="text-xl font-semibold text-foreground mt-6">Hedge Ratio Calculation</h3>
        <p>The number of hedge contracts required equals:</p>
        <div className="overflow-x-auto my-6 p-4 bg-muted border rounded-lg text-center">
          <p className="font-mono text-xl text-destructive font-bold">
            {'Hedge Ratio = Portfolio PVBP / Hedge Instrument PVBP'}
          </p>
        </div>
        <p>For example, if your bond portfolio has PVBP of $45,000 and 10-year Treasury futures have PVBP of $78 per contract, you need approximately 45,000 / 78 ≈ 577 contracts to neutralize rate risk.</p>

        <h3 className="text-xl font-semibold text-foreground mt-6">Treasury Futures Hedging</h3>
        <p>Treasury futures (2-year, 5-year, 10-year, Ultra 10, Bond, Ultra Bond) are the most liquid instruments for duration hedging:</p>
        <ul className="list-disc ml-6 space-y-2">
          <li>Each contract has a specific PVBP based on the CTD (cheapest-to-deliver) bond.</li>
          <li>PVBP changes as CTD switches or as yield levels change.</li>
          <li>Convexity differences between cash bonds and futures require adjustment.</li>
        </ul>

        <h3 className="text-xl font-semibold text-foreground mt-6">Interest Rate Swap Hedging</h3>
        <p>Swaps offer customized hedging for specific maturities:</p>
        <ul className="list-disc ml-6 space-y-2">
          <li>Swap DV01 is calculated from the present value of fixed leg cash flows.</li>
          <li>Receiver swaps add duration; payer swaps reduce duration.</li>
          <li>Swaps can precisely match portfolio key rate durations.</li>
        </ul>

        <hr />

        {/* PORTFOLIO-LEVEL PVBP AGGREGATION */}
        <h2 id="portfolio" className="text-2xl font-bold text-foreground pt-8" itemProp="articleSection">Portfolio-Level PVBP Aggregation</h2>
        <p>PVBP's dollar-based nature enables simple aggregation across positions for portfolio-level risk measurement.</p>

        <h3 className="text-xl font-semibold text-foreground mt-6">Summation Property</h3>
        <p>Total portfolio PVBP equals the sum of individual position PVBPs (adjusted for long/short positioning):</p>
        <ul className="list-disc ml-6 space-y-2">
          <li>Long positions contribute positive PVBP (lose money when rates rise).</li>
          <li>Short positions contribute negative PVBP (gain money when rates rise).</li>
          <li>Net PVBP indicates overall portfolio rate sensitivity.</li>
        </ul>

        <h3 className="text-xl font-semibold text-foreground mt-6">Key Rate Duration Decomposition</h3>
        <p>Advanced portfolio management decomposes PVBP across yield curve tenors (key rate DV01s) to capture non-parallel curve risk:</p>
        <ul className="list-disc ml-6 space-y-2">
          <li>2-year key rate DV01</li>
          <li>5-year key rate DV01</li>
          <li>10-year key rate DV01</li>
          <li>30-year key rate DV01</li>
        </ul>

        <hr />

        {/* CONCLUSION */}
        <h2 className="text-2xl font-bold text-foreground pt-8" itemProp="articleSection">Conclusion</h2>
        <p>PVBP (DV01) is the essential metric for quantifying **interest rate risk** in fixed income portfolios. By translating duration into dollar terms, it enables precise P&L attribution, risk limit setting, and hedge ratio calculation.</p>
        <p>Whether you're hedging with Treasury futures, structuring interest rate swaps, or simply monitoring portfolio sensitivity, PVBP provides the common language for interest rate risk management. Combined with convexity analysis and key rate duration decomposition, PVBP forms the foundation of professional fixed income risk management.</p>
      </section>

      {/* FAQ Section */}
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <Info className="h-5 w-5" />
            Frequently Asked Questions
          </CardTitle>
          <CardDescription>
            Common questions about PVBP (DV01) and interest rate risk
          </CardDescription>
        </CardHeader>
        <CardContent>
          <div className="space-y-6">
            <div>
              <h4 className="font-semibold text-lg mb-3">What is PVBP (DV01)?</h4>
              <p className="text-muted-foreground">
                PVBP (Price Value of a Basis Point), also called DV01 (Dollar Value of 01), measures the dollar change in a bond's price for a one basis point (0.01%) change in yield. It is calculated as Modified Duration × Price × 0.0001. This metric translates percentage-based duration into actionable dollar terms for risk management and hedging.
              </p>
            </div>

            <div>
              <h4 className="font-semibold text-lg mb-3">How is PVBP different from Dollar Duration?</h4>
              <p className="text-muted-foreground">
                Dollar Duration measures price change per 1% (100 bps) yield move, while PVBP measures price change per 1 bp yield move. PVBP = Dollar Duration / 100. Both metrics express rate sensitivity in dollar terms, but PVBP is more granular and commonly used for day-to-day hedging calculations.
              </p>
            </div>

            <div>
              <h4 className="font-semibold text-lg mb-3">Why is PVBP important for hedging?</h4>
              <p className="text-muted-foreground">
                PVBP enables precise hedge ratio calculation. To neutralize duration risk, match portfolio PVBP with hedge instrument PVBP. For example, if your portfolio PVBP is $50,000 and Treasury futures PVBP is $80/contract, you need 625 contracts. This dollar-based matching ensures accurate risk offsetting regardless of instrument differences.
              </p>
            </div>

            <div>
              <h4 className="font-semibold text-lg mb-3">Does PVBP remain constant over time?</h4>
              <p className="text-muted-foreground">
                No, PVBP changes continuously as yields and prices move. As yields decline, duration increases (and vice versa), causing PVBP to rise. Additionally, as bonds approach maturity, duration shortens and PVBP falls. Effective hedging requires regular recalculation and hedge ratio adjustment.
              </p>
            </div>

            <div>
              <h4 className="font-semibold text-lg mb-3">How do I aggregate PVBP across a portfolio?</h4>
              <p className="text-muted-foreground">
                Portfolio PVBP is the sum of individual position PVBPs, with long positions contributing positive PVBP and short positions contributing negative PVBP. This simple summation works because PVBP is denominated in dollars. The net PVBP indicates overall portfolio sensitivity to parallel yield curve shifts.
              </p>
            </div>

            <div>
              <h4 className="font-semibold text-lg mb-3">What are the limitations of PVBP analysis?</h4>
              <p className="text-muted-foreground">
                PVBP assumes parallel yield curve shifts and ignores convexity effects for larger rate moves. It doesn't capture curve twist or steepening risk. For bonds with embedded options, effective PVBP must be calculated numerically. Additionally, credit spread changes affect bond prices independently of PVBP.
              </p>
            </div>

            <div>
              <h4 className="font-semibold text-lg mb-3">How does convexity affect PVBP accuracy?</h4>
              <p className="text-muted-foreground">
                PVBP provides a linear approximation of price change. For larger rate moves, convexity causes actual price changes to deviate from PVBP predictions. Positive convexity (most bonds) means prices rise more than PVBP predicts when rates fall, and fall less than PVBP predicts when rates rise.
              </p>
            </div>

            <div>
              <h4 className="font-semibold text-lg mb-3">What is key rate DV01?</h4>
              <p className="text-muted-foreground">
                Key rate DV01 decomposes total PVBP across specific yield curve tenors (e.g., 2Y, 5Y, 10Y, 30Y). Instead of assuming parallel shifts, key rate analysis measures sensitivity to changes at each maturity point. This enables more precise hedging of non-parallel curve movements like flattening or steepening.
              </p>
            </div>

            <div>
              <h4 className="font-semibold text-lg mb-3">How do Treasury futures PVBP work?</h4>
              <p className="text-muted-foreground">
                Treasury futures PVBP depends on the cheapest-to-deliver (CTD) bond and its conversion factor. As the CTD switches or yield levels change, futures PVBP changes. Practitioners use the formula: Futures PVBP = CTD Bond PVBP / Conversion Factor. Effective hedging requires monitoring CTD dynamics.
              </p>
            </div>

            <div>
              <h4 className="font-semibold text-lg mb-3">Should I use modified or effective duration for PVBP?</h4>
              <p className="text-muted-foreground">
                Use modified duration for bullet bonds without embedded options. For callable bonds, putable bonds, MBS, or other structured products, use effective duration (calculated numerically from price sensitivity). Effective duration captures the impact of optionality on rate sensitivity, providing accurate PVBP for complex securities.
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
          <p>The PVBP (DV01) Calculator measures the dollar price change per basis point yield movement for fixed income securities.</p>
          <p>It is the essential metric for duration hedging, enabling precise matching with Treasury futures or interest rate swaps.</p>
          <p>Use this tool to quantify interest rate risk, set PVBP limits, and calculate optimal hedge ratios for your bond portfolio.</p>
        </CardContent>
      </Card>
    </div>
  );
}

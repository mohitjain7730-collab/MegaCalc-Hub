'use client';

import { useState } from 'react';
import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import { z } from 'zod';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Form, FormControl, FormField, FormItem, FormLabel, FormMessage } from '@/components/ui/form';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Activity, Calculator, Info, TrendingDown, Target, AlertCircle, CheckCircle2, DollarSign, BarChart3, TrendingUp } from 'lucide-react';
import { Badge } from '@/components/ui/badge';
import { Alert, AlertDescription } from '@/components/ui/alert';
import Link from 'next/link';

const formSchema = z.object({
  bondPrice: z.number().min(0.01, "Price must be positive"),
  spreadDuration: z.number().min(0.01, "Duration must be positive"),
  spreadChange: z.number().refine(val => val !== 0, "Enter a non-zero spread change"),
});

type FormValues = z.infer<typeof formSchema>;

export default function CreditSpreadDurationCalculator() {
  const [result, setResult] = useState<{
    priceChangeAmount: number;
    priceChangePercent: number;
    newPrice: number;
    impactLevel: string;
    direction: string;
    recommendation: string;
    insights: string[];
    riskFactors: string[];
  } | null>(null);

  const form = useForm<FormValues>({
    resolver: zodResolver(formSchema),
    defaultValues: {
      bondPrice: undefined, // User must input
      spreadDuration: undefined, // User must input
      spreadChange: 10, // Default 10 bps
    },
  });

  const calculate = (v: FormValues) => {
    // Formula: ΔP/P ≈ -D_spread * Δs
    // ΔP ≈ -D_spread * Δs * P
    // Inputs: Spread Change in basis points. Convert to decimal (bps / 10000).
    const deltaSpread = v.spreadChange / 10000;

    const priceChangeAmount = - v.spreadDuration * deltaSpread * v.bondPrice;
    const priceChangePercent = - v.spreadDuration * deltaSpread * 100;
    const newPrice = v.bondPrice + priceChangeAmount;

    return {
      priceChangeAmount,
      priceChangePercent,
      newPrice
    };
  };

  const getImpactLevel = (pct: number) => {
    const abs = Math.abs(pct);
    if (abs < 0.5) return 'Low Impact';
    if (abs < 2.0) return 'Moderate Impact';
    return 'High Impact';
  };

  const getRecommendation = (amount: number) => {
    if (amount < 0) return "Projected Loss. If you expect credit spreads to widen (credit quality to worsen), reduce exposure to high Spread Duration assets.";
    return "Projected Gain. Tightening spreads (credit improvement) will boost the value of this bond. Consider holding or adding exposure.";
  };

  const getInsights = (duration: number, change: number) => {
    const insights = [];
    if (duration > 7) insights.push('High Credit Sensitivity: This bond behaves like a long-term credit instrument. Small spread changes cause large price swings.');
    else if (duration < 2) insights.push('Low Credit Sensitivity: Price is relatively immune to minor credit fluctuations.');

    if (change > 0) insights.push('Widening Spreads: Typically associated with economic stress or sector-specific trouble.');
    else insights.push('Tightening Spreads: Typically associated with economic recovery or improving issuer health.');

    return insights;
  };

  const getRiskFactors = (duration: number) => {
    const risks = [];
    risks.push('Default Risk: Duration measures price sensitivity, but not the loss given default (LGD) if the issuer goes bankrupt.');
    if (duration > 5) risks.push('Volatility Risk: High spread duration assets are often more volatile than government bonds.');
    risks.push('Liquidity Risk: In credit events, bid-ask spreads widen significantly, compounding potential losses.');
    return risks;
  };

  const onSubmit = (values: FormValues) => {
    const calc = calculate(values);

    setResult({
      priceChangeAmount: calc.priceChangeAmount,
      priceChangePercent: calc.priceChangePercent,
      newPrice: calc.newPrice,
      impactLevel: getImpactLevel(calc.priceChangePercent),
      direction: calc.priceChangeAmount > 0 ? 'Gain' : 'Loss',
      recommendation: getRecommendation(calc.priceChangeAmount),
      insights: getInsights(values.spreadDuration, values.spreadChange),
      riskFactors: getRiskFactors(values.spreadDuration)
    });
  };

  return (
    <div className="space-y-8">

      {/* Input Form */}
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <Activity className="h-5 w-5" />
            Credit Parameters
          </CardTitle>
          <CardDescription>
            Analyze how credit spread movements affect bond prices.
          </CardDescription>
        </CardHeader>
        <CardContent>
          <Form {...form}>
            <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-6">
              <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
                <FormField
                  control={form.control}
                  name="bondPrice"
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel className="flex items-center gap-2">
                        <DollarSign /> Current Bond Price
                      </FormLabel>
                      <FormControl>
                        <Input type="number" step="0.01" placeholder="98.50" {...field} onChange={e => field.onChange(parseFloat(e.target.value))} />
                      </FormControl>
                      <FormMessage />
                    </FormItem>
                  )}
                />
                <FormField
                  control={form.control}
                  name="spreadDuration"
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel className="flex items-center gap-2">
                        <BarChart3 className="h-4 w-4" /> Spread Duration (Yrs)
                      </FormLabel>
                      <FormControl>
                        <Input type="number" step="0.1" placeholder="4.5" {...field} onChange={e => field.onChange(parseFloat(e.target.value))} />
                      </FormControl>
                      <FormMessage />
                    </FormItem>
                  )}
                />
                <FormField
                  control={form.control}
                  name="spreadChange"
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel className="flex items-center gap-2">
                        <TrendingUp className="h-4 w-4" /> Spread Change (bps)
                      </FormLabel>
                      <FormControl>
                        <Input type="number" step="1" placeholder="25" {...field} onChange={e => field.onChange(parseFloat(e.target.value))} />
                      </FormControl>
                      <FormMessage />
                    </FormItem>
                  )}
                />
              </div>
              <Button type="submit" className="w-full">
                <Calculator className="mr-2 h-4 w-4" />
                Calculate Impact
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
                <Target className="h-8 w-8 text-primary" />
                <div>
                  <CardTitle>Impact Analysis</CardTitle>
                  <CardDescription>Price Sensitivity</CardDescription>
                </div>
              </div>
            </CardHeader>
            <CardContent className="space-y-6">
              <div className="text-center">
                <p className={`text-4xl font-bold ${result.priceChangeAmount >= 0 ? 'text-green-600' : 'text-red-600'}`}>
                  {result.priceChangeAmount >= 0 ? "+" : ""}{result.priceChangeAmount.toFixed(4)} ({result.priceChangePercent.toFixed(2)}%)
                </p>
                <div className="flex justify-center items-center gap-2 mt-2">
                  <span className="text-muted-foreground font-medium">projected price change</span>
                </div>
                <p className="text-xl font-semibold mt-4 text-foreground">
                  New Price: <span className="text-primary">${result.newPrice.toFixed(4)}</span>
                </p>
              </div>

              <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                <div className="text-center p-4 bg-muted/50 rounded-lg">
                  <TrendingUp className="h-6 w-6 mx-auto mb-2 text-blue-600" />
                  <p className="font-semibold">Spread Change</p>
                  <p className="font-medium text-lg">{form.getValues('spreadChange')} bps</p>
                </div>
                <div className="text-center p-4 bg-muted/50 rounded-lg">
                  <Activity className="h-6 w-6 mx-auto mb-2 text-orange-600" />
                  <p className="font-semibold">Sensitivity</p>
                  <p className="font-medium text-lg">{result.impactLevel}</p>
                </div>
                <div className="text-center p-4 bg-muted/50 rounded-lg">
                  <CheckCircle2 className="h-6 w-6 mx-auto mb-2 text-purple-600" />
                  <p className="font-semibold">Outcome</p>
                  <Badge variant={result.priceChangeAmount >= 0 ? 'default' : 'destructive'}>
                    {result.direction}
                  </Badge>
                </div>
              </div>

              <Alert>
                <Info className="h-4 w-4" />
                <AlertDescription>
                  <strong>Assessment:</strong> {result.recommendation}
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
                <CardDescription>Portfolio implications</CardDescription>
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
                <CardDescription>Critical considerations</CardDescription>
              </CardHeader>
              <CardContent className="space-y-4">
                {result.riskFactors.map((risk, index) => (
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
              % Price Change ≈ - Spread Duration × (Spread Change bps / 10000)
            </p>
            <p className="font-mono text-xs text-center text-muted-foreground mt-2">
              New Price = Current Price × (1 + % Price Change)
            </p>
          </div>
          <p className="text-sm text-muted-foreground mt-2">
            This linear approximation estimates the impact of changing credit spreads on bond prices. Note the negative relationship: rising spreads (worsening credit) reduce bond prices.
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
            Tools for Fixed Income Analysis
          </CardDescription>
        </CardHeader>
        <CardContent>
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
            <Link href="/finance/bond-duration-calculator" className="block">
              <Card className="hover:shadow-md transition-shadow cursor-pointer">
                <CardContent className="p-4">
                  <div className="flex items-center gap-3">
                    <Activity className="h-5 w-5 text-green-600" />
                    <div>
                      <p className="font-medium">Bond Duration</p>
                      <p className="text-sm text-muted-foreground">Interest Rate Risk</p>
                    </div>
                  </div>
                </CardContent>
              </Card>
            </Link>
            <Link href="/finance/bond-yield-to-maturity-calculator" className="block">
              <Card className="hover:shadow-md transition-shadow cursor-pointer">
                <CardContent className="p-4">
                  <div className="flex items-center gap-3">
                    <DollarSign className="h-5 w-5 text-blue-600" />
                    <div>
                      <p className="font-medium">YTM Calculator</p>
                      <p className="text-sm text-muted-foreground">Total Return Yield</p>
                    </div>
                  </div>
                </CardContent>
              </Card>
            </Link>
            <Link href="/finance/bond-price-calculator" className="block">
              <Card className="hover:shadow-md transition-shadow cursor-pointer">
                <CardContent className="p-4">
                  <div className="flex items-center gap-3">
                    <TrendingDown className="h-5 w-5 text-purple-600" />
                    <div>
                      <p className="font-medium">Bond Price</p>
                      <p className="text-sm text-muted-foreground">Fair Value</p>
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
        <meta itemProp="name" content="The Definitive Guide to Credit Spread Duration" />
        <meta itemProp="description" content="Calculate the price impact of credit deterioration or improvement. Master Spread Duration to manage corporate bond portfolio risk." />
        <meta itemProp="keywords" content="Credit Spread Duration, Spread Risk, CS01, OAS Duration, Credit Risk Management, Corporate Bonds, High Yield Bonds" />
        <meta itemProp="author" content="[Your Site's Financial Analyst Team]" />
        <meta itemProp="datePublished" content="2025-11-20" />
        <meta itemProp="url" content="/definitive-guide-spread-duration" />

        <h1 className="text-3xl md:text-4xl font-extrabold text-foreground mb-4" itemProp="headline">The Definitive Guide to Credit Spread Duration</h1>
        <p className="text-lg italic text-muted-foreground">While &quot;Duration&quot; tells you how a bond reacts to interest rates, &quot;Spread Duration&quot; tells you how it reacts to fear.</p>

        {/* TABLE OF CONTENTS */}
        <h2 className="text-2xl font-bold text-foreground mt-8 mb-4">Table of Contents: Jump to a Section</h2>
        <ul className="list-disc ml-6 space-y-2 text-primary">
          <li><a href="#concept" className="hover:underline">What is Spread Duration?</a></li>
          <li><a href="#spread-vs-rates" className="hover:underline">Rate Duration vs. Spread Duration</a></li>
          <li><a href="#analyzing" className="hover:underline">Analyzing the Output</a></li>
          <li><a href="#example" className="hover:underline">Real World Example: High Yield vs. Treasuries</a></li>
          <li><a href="#limitations" className="hover:underline">Limitations</a></li>
        </ul>
        <hr />

        {/* CONCEPT */}
        <h2 id="concept" className="text-2xl font-bold text-foreground pt-8" itemProp="articleSection">What is Spread Duration?</h2>
        <p><strong>Spread Duration</strong> measures the approximate percentage change in a bond&apos;s price for a 1% (100 basis point) change in its credit spread, assuming Treasury rates remain constant.</p>
        <p>It isolates the credit risk component of a bond. If a company announces bad earnings and its bonds are perceived as riskier, the spread widens, and the price falls. Spread Duration tells you exactly how much.</p>
        <hr />

        {/* RATES VS SPREADS */}
        <h2 id="spread-vs-rates" className="text-2xl font-bold text-foreground pt-8" itemProp="articleSection">Rate Duration vs. Spread Duration</h2>
        <p>Most traders just say &quot;Duration.&quot; This usually refers to <strong>Interest Rate Duration</strong> (sensitivity to government yields).</p>
        <div className="grid grid-cols-1 md:grid-cols-2 gap-6 my-6">
          <div className="p-4 border rounded-lg bg-gray-50 dark:bg-gray-800/10">
            <h3 className="text-lg font-bold mb-2">Interest Rate Duration</h3>
            <p>Sensitivity to the risk-free rate (e.g., Fed Funds, Treasuries).</p>
            <p><strong>Driven by:</strong> Inflation, monetary policy.</p>
          </div>
          <div className="p-4 border rounded-lg bg-gray-50 dark:bg-gray-800/10">
            <h3 className="text-lg font-bold mb-2">Spread Duration</h3>
            <p>Sensitivity to the extra yield (spread) demanded for credit risk.</p>
            <p><strong>Driven by:</strong> Default risk, economic recessions, issuer health.</p>
          </div>
        </div>
        <p>For standard fixed-rate corporate bonds, Rate Duration and Spread Duration are typically equal. However, for Floating Rate Notes (FRNs), Rate Duration is near-zero, but Spread Duration can be high.</p>
        <hr />

        {/* ANALYZING */}
        <h2 id="analyzing" className="text-2xl font-bold text-foreground pt-8" itemProp="articleSection">Analyzing the Output</h2>
        <p>The relationship is negative:</p>
        <ul className="list-disc ml-6 space-y-2">
          <li><strong>Spreads Widen (Increase):</strong> Perceived risk goes up. Bond price FALLS.</li>
          <li><strong>Spreads Tighten (Decrease):</strong> Perceived risk goes down. Bond price RISES.</li>
        </ul>
        <p>If you own High Yield bonds, you are &quot;Short Spreads&quot; (you profit when spreads fall/tighten).</p>
        <hr />

        {/* EXAMPLE */}
        <h2 id="example" className="text-2xl font-bold text-foreground pt-8" itemProp="articleSection">Real World Example</h2>
        <p><strong>Investment Grade Bond (IBM):</strong> Might have a duration of 8 years. If spreads widen by 10bps (0.10%), the price drops by approximately 0.8%.</p>
        <p><strong>Junk Bond (Distressed):</strong> Might have a duration of 4 years. If spreads widen by 100bps (1.00%) due to recession fears, the price drops by 4%. The impact of spread movement is often the dominant driver of returns for junk bonds.</p>
      </section>

      {/* FAQ Section */}
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <Info className="h-5 w-5" />
            Frequently Asked Questions
          </CardTitle>
          <CardDescription>
            Expert answers on Credit Risk
          </CardDescription>
        </CardHeader>
        <CardContent>
          <div className="space-y-6">
            <div>
              <h4 className="font-semibold text-lg mb-3">Is Spread Duration the same as Modified Duration?</h4>
              <p className="text-muted-foreground">
                For fixed-rate bonds, they are numerically almost identical. However, functionally they measure different risks (Rates vs Credit). For floating rate notes, they are very different.
              </p>
            </div>

            <div>
              <h4 className="font-semibold text-lg mb-3">Does this calculator measure default loss?</h4>
              <p className="text-muted-foreground">
                No. It measures the mark-to-market price loss if the market <em>perceives</em> higher risk. Actual default (where price goes to recovery value) is an extreme event not captured linearly by duration.
              </p>
            </div>

            <div>
              <h4 className="font-semibold text-lg mb-3">What is &quot;OAS&quot;?</h4>
              <p className="text-muted-foreground">
                Option-Adjusted Spread. It is the best spread measure to use for calculation because it strips out the value of any call/put options embedded in the bond.
              </p>
            </div>

            <div>
              <h4 className="font-semibold text-lg mb-3">Why would spreads widen?</h4>
              <p className="text-muted-foreground">
                Spreads widen due to deteriorating economic data, sector-specific news (e.g., oil price crash for energy bonds), or issuer-specific bad news (e.g., failed merger).
              </p>
            </div>

            <div>
              <h4 className="font-semibold text-lg mb-3">Can Spread Duration be negative?</h4>
              <p className="text-muted-foreground">
                Rarely. Some obscure derivatives (Interest Only strips) might have negative duration properties, but for standard bonds, it is positive (meaning price falls when spread rises).
              </p>
            </div>

            <div>
              <h4 className="font-semibold text-lg mb-3">How do I interpret &quot;CS01&quot;?</h4>
              <p className="text-muted-foreground">
                CS01 (Credit Spread 01) is the dollar value change for a 1 basis point change in spreads. It is simply: Spread Duration × Portfolio Value × 0.0001.
              </p>
            </div>

            <div>
              <h4 className="font-semibold text-lg mb-3">Do government bonds have Spread Duration?</h4>
              <p className="text-muted-foreground">
                Technically no, as they are the risk-free benchmark. However, &quot;Swap Spreads&quot; or sovereign credit spreads (for non-US countries) do exist.
              </p>
            </div>

            <div>
              <h4 className="font-semibold text-lg mb-3">What is &quot;DTS&quot;?</h4>
              <p className="text-muted-foreground">
                Duration Times Spread. It is a newer risk metric that suggests volatility is proportional to the spread level. Used heavily in High Yield portfolio management.
              </p>
            </div>

            <div>
              <h4 className="font-semibold text-lg mb-3">Understanding the risk of &quot;safe&quot; bonds</h4>
              <p className="text-muted-foreground">
                Even "safe" investment grade bonds can drop significantly in value if their spread widens, proportional to their duration.
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
          <p>The Credit Spread Duration Calculator isolates the impact of credit risk on your bond portfolio.</p>
          <p>Use it to stress-test your portfolio against widening spreads during economic downturns.</p>
          <p>Understanding this sensitivity is key to avoiding unexpected losses in &quot;safe&quot; corporate bond funds.</p>
        </CardContent>
      </Card>
    </div>
  );
}

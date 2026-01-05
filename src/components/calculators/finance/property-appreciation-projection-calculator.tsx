'use client';

import { useState } from 'react';
import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import { z } from 'zod';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Form, FormControl, FormField, FormItem, FormLabel, FormMessage } from '@/components/ui/form';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import {
  TrendingUp,
  Home,
  Calendar,
  Building,
  Info,
  Calculator,
  Percent,
  LineChart,
  Target,
  AlertTriangle,
  CheckCircle2,
  List,
  Search,
  DollarSign
} from 'lucide-react';
import { Badge } from '@/components/ui/badge';
import { Alert, AlertDescription } from '@/components/ui/alert';
import Link from 'next/link';
import { Separator } from '@/components/ui/separator';

const formSchema = z.object({
  currentValue: z.number().positive(),
  appreciationRate: z.number().min(-100).max(100),
  years: z.number().min(1).max(100),
  inflationRate: z.number().min(0).max(100),
  renovationAddPerYear: z.number().min(0).optional(),
});

type FormValues = z.infer<typeof formSchema>;

export default function PropertyAppreciationProjectionCalculator() {
  const [result, setResult] = useState<{
    futureValue: number;
    inflationAdjustedValue: number;
    totalAppreciation: number;
    realGain: number;
    yearByYear: { year: number; value: number; realValue: number }[];
    doublingTime: number | null; // Rule of 72
    insights: string[];
    risks: string[];
  } | null>(null);

  const form = useForm<FormValues>({
    resolver: zodResolver(formSchema),
    defaultValues: {
      currentValue: 450000,
      appreciationRate: 4.5,
      years: 10,
      inflationRate: 2.5,
      renovationAddPerYear: 0,
    },
  });

  const calculate = (v: FormValues) => {
    let currentValue = v.currentValue;
    const yearByYear = [];
    const annualRateStart = v.appreciationRate / 100;
    const inflationRate = v.inflationRate / 100;

    for (let i = 1; i <= v.years; i++) {
      // Apply Appreciation
      currentValue = currentValue * (1 + annualRateStart);
      // Add Renovation Value (if any)
      if (v.renovationAddPerYear) {
        currentValue += v.renovationAddPerYear;
      }

      const realValue = currentValue / Math.pow(1 + inflationRate, i);

      yearByYear.push({
        year: i,
        value: currentValue,
        realValue: realValue
      });
    }

    const futureValue = currentValue;
    const totalAppreciation = futureValue - v.currentValue;

    // Inflation Adjustment
    const inflationAdjustedValue = futureValue / Math.pow(1 + inflationRate, v.years);
    const realGain = inflationAdjustedValue - v.currentValue;

    // Rule of 72
    const doublingTime = annualRateStart > 0 ? 72 / (v.appreciationRate) : null;

    // Insights
    const insights = [];
    if (annualRateStart > inflationRate) {
      insights.push(`Your property is beating inflation, generating "Real Wealth" of approximately $${realGain.toLocaleString(undefined, { maximumFractionDigits: 0 })} in purchasing power.`);
    } else {
      insights.push(`Warning: Your appreciation rate is lower than or equal to inflation. In real terms, the asset is stagnant or losing purchasing power.`);
    }

    if (doublingTime) {
      if (doublingTime < v.years) {
        insights.push(`At this rate, your property value will double in approx. ${doublingTime.toFixed(1)} years (within your timeframe).`);
      } else {
        insights.push(`At this rate, it will take approx. ${doublingTime.toFixed(1)} years for the property value to double.`);
      }
    }

    if (v.renovationAddPerYear && v.renovationAddPerYear > 0) {
      insights.push(`Your annual renovation inputs contribute significant manual equity, but ensure these improvements actually increase market value 1:1.`);
    }

    // Risks
    const risks = [];
    if (v.appreciationRate > 8) risks.push("Projecting >8% annual growth is aggressive and highly market-dependent. Historically, 3-5% is normal.");
    if (v.years < 5 && totalAppreciation < (v.currentValue * 0.08)) risks.push("In a short timeframe (<5 years), transaction costs (selling fees) might wipe out your appreciation gains.");

    return {
      futureValue,
      inflationAdjustedValue,
      totalAppreciation,
      realGain,
      yearByYear,
      doublingTime,
      insights,
      risks
    };
  };

  const onSubmit = (values: FormValues) => {
    const res = calculate(values);
    if (res) setResult(res);
  };

  return (
    <div className="space-y-8">
      {/* Input Section */}
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <Building className="h-5 w-5" />
            Property Growth Factors
          </CardTitle>
          <CardDescription>
            Input your current value and market expectations to forecast future wealth.
          </CardDescription>
        </CardHeader>
        <CardContent>
          <Form {...form}>
            <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-6">
              <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
                <FormField
                  control={form.control}
                  name="currentValue"
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel className="flex items-center gap-2"><DollarSign className="h-4 w-4" /> Current Market Value</FormLabel>
                      <FormControl><Input type="number" {...field} onChange={e => field.onChange(parseFloat(e.target.value))} /></FormControl>
                      <FormMessage />
                    </FormItem>
                  )}
                />
                <FormField
                  control={form.control}
                  name="years"
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel className="flex items-center gap-2"><Calendar className="h-4 w-4" /> Projection Years</FormLabel>
                      <FormControl><Input type="number" {...field} onChange={e => field.onChange(parseFloat(e.target.value))} /></FormControl>
                      <FormMessage />
                    </FormItem>
                  )}
                />
                <FormField
                  control={form.control}
                  name="appreciationRate"
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel className="flex items-center gap-2"><TrendingUp className="h-4 w-4" /> Annual Appreciation (%)</FormLabel>
                      <FormControl><Input type="number" step="0.1" {...field} onChange={e => field.onChange(parseFloat(e.target.value))} /></FormControl>
                      <FormMessage />
                    </FormItem>
                  )}
                />

                <Separator className="md:col-span-2 lg:col-span-3 my-2" />
                <h4 className="text-sm font-semibold text-muted-foreground md:col-span-2 lg:col-span-3 mb-[-10px]">Advanced Adjustments</h4>

                <FormField
                  control={form.control}
                  name="inflationRate"
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel>Inflation Rate (%)</FormLabel>
                      <FormControl><Input type="number" step="0.1" {...field} onChange={e => field.onChange(parseFloat(e.target.value))} /></FormControl>
                      <CardDescription className="text-xs">To calc. Real Purchasing Power</CardDescription>
                      <FormMessage />
                    </FormItem>
                  )}
                />
                <FormField
                  control={form.control}
                  name="renovationAddPerYear"
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel>Manual Value Add ($/yr)</FormLabel>
                      <FormControl><Input type="number" {...field} onChange={e => field.onChange(parseFloat(e.target.value))} /></FormControl>
                      <CardDescription className="text-xs">Improvements forcing appreciation</CardDescription>
                      <FormMessage />
                    </FormItem>
                  )}
                />
              </div>
              <Button type="submit" className="w-full">
                <LineChart className="mr-2 h-4 w-4" />
                Project Future Value
              </Button>
            </form>
          </Form>
        </CardContent>
      </Card>

      {/* Results Section */}
      {result && (
        <div className="space-y-6">
          <Card>
            <CardHeader>
              <div className="flex items-center gap-4">
                <Target className="h-8 w-8 text-primary" />
                <div>
                  <CardTitle>Valuation Forecast</CardTitle>
                  <CardDescription>In {form.getValues('years')} years</CardDescription>
                </div>
              </div>
            </CardHeader>
            <CardContent className="space-y-6">
              <div className="text-center p-6 bg-primary/5 rounded-xl border border-primary/20">
                <p className="text-lg font-medium text-muted-foreground mb-2">Estimated Future Value</p>
                <div className="flex items-center justify-center gap-2">
                  <span className="text-4xl md:text-5xl font-extrabold text-primary">
                    ${Math.floor(result.futureValue).toLocaleString()}
                  </span>
                </div>
                <div className="mt-4 flex justify-center gap-4 text-sm">
                  <span className="bg-green-100 text-green-800 px-3 py-1 rounded-full font-medium dark:bg-green-900/30 dark:text-green-300">
                    Total Gain: +${Math.floor(result.totalAppreciation).toLocaleString()}
                  </span>
                  <span className="bg-blue-100 text-blue-800 px-3 py-1 rounded-full font-medium dark:bg-blue-900/30 dark:text-blue-300">
                    Total Growth: {((result.totalAppreciation / form.getValues('currentValue')) * 100).toFixed(1)}%
                  </span>
                </div>
              </div>

              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div className="p-4 bg-muted/50 rounded-lg border">
                  <div className="flex items-center gap-2 mb-2">
                    <TrendingUp className="h-4 w-4 text-indigo-600" />
                    <span className="font-semibold text-sm">Rule of 72</span>
                  </div>
                  <p className="text-sm text-muted-foreground">
                    At {form.getValues('appreciationRate')}% growth, your asset value doubles every <strong className="text-foreground">{result.doublingTime?.toFixed(1) ?? 'N/A'} years</strong>.
                  </p>
                </div>
                <div className="p-4 bg-muted/50 rounded-lg border">
                  <div className="flex items-center gap-2 mb-2">
                    <DollarSign className="h-4 w-4 text-amber-600" />
                    <span className="font-semibold text-sm">Inflation Adjusted Val</span>
                  </div>
                  <p className="text-sm text-muted-foreground">
                    In today&apos;s dollars (Real Value): <strong className="text-foreground">${Math.floor(result.inflationAdjustedValue).toLocaleString()}</strong>.
                  </p>
                </div>
              </div>
            </CardContent>
          </Card>

          {/* Smart Insights & Risks */}
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6 mb-6">
            <Card className="h-full">
              <CardHeader>
                <CardTitle className="flex items-center gap-2 text-xl text-primary">
                  <CheckCircle2 className="h-6 w-6" />
                  Growth Insights
                </CardTitle>
                <CardDescription>Analysis of your numbers</CardDescription>
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
                  <AlertTriangle className="h-6 w-6" />
                  Volatility Factors
                </CardTitle>
                <CardDescription>Why these numbers might be wrong</CardDescription>
              </CardHeader>
              <CardContent className="space-y-4">
                {result.risks.length > 0 ? (
                  result.risks.map((item, index) => (
                    <div key={index} className="flex items-start gap-3 p-3 bg-red-50 dark:bg-red-900/10 rounded-lg border border-red-100 dark:border-red-900/20">
                      <AlertTriangle className="h-5 w-5 text-red-600 dark:text-red-400 mt-0.5 shrink-0" />
                      <span className="text-sm font-medium text-red-800 dark:text-red-300">{item}</span>
                    </div>
                  ))
                ) : (
                  <div className="flex items-start gap-3 p-3 bg-green-50 dark:bg-green-900/10 rounded-lg border border-green-100 dark:border-green-900/20">
                    <CheckCircle2 className="h-5 w-5 text-green-600 dark:text-green-400 mt-0.5 shrink-0" />
                    <span className="text-sm font-medium text-green-800 dark:text-green-300">Conservative estimates reduce risk of disappointment.</span>
                  </div>
                )}
              </CardContent>
            </Card>
          </div>
        </div>
      )}

      {/* Understanding Inputs */}
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2"><Info className="h-5 w-5" /> Understanding Appreciation</CardTitle>
          <CardDescription>The forces driving real estate value</CardDescription>
        </CardHeader>
        <CardContent>
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div className="p-4 bg-blue-50 dark:bg-blue-900/10 rounded-lg border border-blue-100 dark:border-blue-900/20">
              <h4 className="font-semibold mb-2 flex items-center gap-2 text-blue-700 dark:text-blue-300">
                <TrendingUp className="h-4 w-4" /> Market Appreciation
              </h4>
              <p className="text-sm text-muted-foreground">The passive increase in value due to supply/demand mechanics, inflation, and local economic growth. Historically averages 3-4% nationally.</p>
            </div>
            <div className="p-4 bg-amber-50 dark:bg-amber-900/10 rounded-lg border border-amber-100 dark:border-amber-900/20">
              <h4 className="font-semibold mb-2 flex items-center gap-2 text-amber-700 dark:text-amber-300">
                <Target className="h-4 w-4" /> Forced Appreciation
              </h4>
              <p className="text-sm text-muted-foreground">Value you actively create through renovations (e.g., adding a bathroom, finishing a basement). This is independent of market conditions.</p>
            </div>
          </div>
        </CardContent>
      </Card>

      {/* Formula Used */}
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2"><Calculator className="h-5 w-5" /> The Math Behind It</CardTitle>
        </CardHeader>
        <CardContent className="space-y-4">
          <div className="p-4 bg-muted rounded-lg overflow-x-auto">
            <p className="font-mono text-sm">
              Future Value = Current Value × (1 + Rate)^Years
            </p>
            <p className="font-mono text-sm mt-2">
              Real Value = Future Value / (1 + Inflation)^Years
            </p>
          </div>
          <p className="text-sm text-muted-foreground">
            We use the standard Compound Interest formula. This assumes the appreciation rate compounds annually (growth upon growth). Real Value adjusts this for purchasing power loss due to inflation.
          </p>
        </CardContent>
      </Card>

      {/* Related Calculators */}
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2"><Calculator className="h-5 w-5" /> Related Financial Calculators</CardTitle>
          <CardDescription>Tools to further analyze your property investment</CardDescription>
        </CardHeader>
        <CardContent>
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
            <Link href="/category/finance/rental-yield-calculator" className="block">
              <Card className="hover:shadow-md transition-shadow cursor-pointer h-full">
                <CardContent className="p-4">
                  <div className="flex items-center gap-3">
                    <Building className="h-5 w-5 text-blue-600" />
                    <div><p className="font-medium">Rental Yield</p><p className="text-sm text-muted-foreground">Cash flow analysis</p></div>
                  </div>
                </CardContent>
              </Card>
            </Link>
            <Link href="/category/finance/rent-vs-buy-home-calculator" className="block">
              <Card className="hover:shadow-md transition-shadow cursor-pointer h-full">
                <CardContent className="p-4">
                  <div className="flex items-center gap-3">
                    <Home className="h-5 w-5 text-green-600" />
                    <div><p className="font-medium">Rent vs Buy</p><p className="text-sm text-muted-foreground">Lifestyle comparison</p></div>
                  </div>
                </CardContent>
              </Card>
            </Link>
            <Link href="/category/finance/return-on-investment-roi-calculator" className="block">
              <Card className="hover:shadow-md transition-shadow cursor-pointer h-full">
                <CardContent className="p-4">
                  <div className="flex items-center gap-3">
                    <Percent className="h-5 w-5 text-orange-600" />
                    <div><p className="font-medium">General ROI</p><p className="text-sm text-muted-foreground">Compare vs Stocks</p></div>
                  </div>
                </CardContent>
              </Card>
            </Link>
            <Link href="/category/finance/mortgage-payoff-calculator" className="block">
              <Card className="hover:shadow-md transition-shadow cursor-pointer h-full">
                <CardContent className="p-4">
                  <div className="flex items-center gap-3">
                    <Calendar className="h-5 w-5 text-purple-600" />
                    <div><p className="font-medium">Mortgage Payoff</p><p className="text-sm text-muted-foreground">Equity build-up speed</p></div>
                  </div>
                </CardContent>
              </Card>
            </Link>
            <Link href="/category/finance/loan-to-value-ltv-ratio-calculator" className="block">
              <Card className="hover:shadow-md transition-shadow cursor-pointer h-full">
                <CardContent className="p-4">
                  <div className="flex items-center gap-3">
                    <List className="h-5 w-5 text-red-600" />
                    <div><p className="font-medium">LTV Ratio</p><p className="text-sm text-muted-foreground">Leverage tracking</p></div>
                  </div>
                </CardContent>
              </Card>
            </Link>
            <Link href="/category/finance/retirement-savings-calculator" className="block">
              <Card className="hover:shadow-md transition-shadow cursor-pointer h-full">
                <CardContent className="p-4">
                  <div className="flex items-center gap-3">
                    <TrendingUp className="h-5 w-5 text-teal-600" />
                    <div><p className="font-medium">Retirement Savings</p><p className="text-sm text-muted-foreground">Long-term wealth</p></div>
                  </div>
                </CardContent>
              </Card>
            </Link>
          </div>
        </CardContent>
      </Card>

      {/* Comprehensive Guide */}
      <section className="space-y-6 text-muted-foreground leading-relaxed bg-card p-6 md:p-10 rounded-lg shadow-lg" itemScope itemType="https://schema.org/Article">
        {/* SEO Metadata */}
        <meta itemProp="name" content="Property Appreciation Calculator: Forecasting Real Estate Wealth" />
        <meta itemProp="description" content="Calculate the future value of your home or investment property. Understand market appreciation, forced appreciation, and the impact of inflation." />
        <meta itemProp="author" content="Financial Analysis Team" />

        <h1 className="text-3xl md:text-4xl font-extrabold text-foreground mb-4" itemProp="headline">Predicting Property Value: The Power of Compounding</h1>
        <p className="text-lg italic text-muted-foreground">Why time in the market usually beats timing the market when it comes to real estate wealth.</p>

        <h2 className="text-2xl font-bold text-foreground mt-8 mb-4">Table of Contents</h2>
        <ul className="list-disc ml-6 space-y-2 text-primary intro-links">
          <li><a href="#how-appreciation-works" className="hover:underline">How Appreciation Works</a></li>
          <li><a href="#historical-rates" className="hover:underline">Historical Growth Rates</a></li>
          <li><a href="#forced-vs-market" className="hover:underline">Market vs. Forced Appreciation</a></li>
          <li><a href="#real-vs-nominal" className="hover:underline">Real Value vs. Nominal Value</a></li>
          <li><a href="#leverage-effect" className="hover:underline">The Leverage Effect</a></li>
        </ul>
        <Separator className="my-6" />

        <h2 id="how-appreciation-works" className="text-2xl font-bold text-foreground pt-8">How Appreciation Works</h2>
        <p>Appreciation is the increase in a property&apos;s value over time. Unlike a car, which depreciates the moment you drive it off the lot, real estate generally trends upward over long horizons. This is due to three main factors:</p>
        <ul className="list-disc ml-6 mt-2 space-y-1">
          <li><strong>Scarcity:</strong> They aren&apos;t making more land (mostly). As population increases, the demand for fixed land rises.</li>
          <li><strong>Inflation:</strong> As the cost of labor, materials, and energy rises, the replacement cost of a home increases. New construction becomes more expensive, pulling up the value of existing inventory.</li>
          <li><strong>Demand Shifts:</strong> Trends like urbanization, migration to sunshine states, or the rise of remote work can create massive demand spikes in specific areas.</li>
        </ul>
        <p className="mt-4">It is important to understand that appreciation is not guaranteed. Local economies, crime rates, and environmental factors can cause values to stagnate or even decline. However, national averages have historically shown a consistent upward trajectory over decades.</p>

        <h2 id="historical-rates" className="text-2xl font-bold text-foreground pt-8">Historical Growth Rates and Benchmarks</h2>
        <p>According to the FHFA and Case-Shiller indices, U.S. residential real estate has appreciated at an average annual rate of roughly <strong>3.5% to 4.5%</strong> over the last 50 years. However, this is smooth data covering the entire nation. In reality, real estate is hyper-local and volatile.</p>
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4 mt-4">
          <div className="bg-muted p-4 rounded-lg">
            <h4 className="font-semibold text-foreground">The "Cyclical" Reality</h4>
            <p className="text-sm mt-1">Real estate moves in cycles. You might see 10% growth for two years, followed by 0% for three years, and then a -5% correction during a recession. A 10-year horizon smooths these bumps out.</p>
          </div>
          <div className="bg-muted p-4 rounded-lg">
            <h4 className="font-semibold text-foreground">Urban vs. Rural</h4>
            <p className="text-sm mt-1">Prime urban centers (NYC, SF, London) have historically seen appreciation rates closer to 6-8%, driven by high wages and extreme scarcity. Rural areas often track closer to inflation (2-3%).</p>
          </div>
        </div>
        <p className="mt-4">Using the <strong>Rule of 72</strong>, you can estimate doubling time. A 4% growth rate means your asset doubles every 18 years (72 / 4 = 18). A 7% rate means doubling every ~10 years. This compounding effect is why long-term holding is so powerful.</p>

        <h2 id="forced-vs-market" className="text-2xl font-bold text-foreground pt-8">Market vs. Forced Appreciation: Active vs. Passive</h2>
        <p>Real estate offers two distinct ways to build wealth, and understanding the difference is critical for your strategy.</p>
        <h3 className="text-xl font-semibold text-foreground mt-4">1. Market Appreciation (Passive)</h3>
        <p>This is the "wait and hold" strategy. You buy a home, live in it or rent it out, and wait for the neighborhood to improve, inflation to do its work, and demand to rise. You have zero control over this. It depends entirely on the economy, interest rates, and local job growth.</p>

        <h3 className="text-xl font-semibold text-foreground mt-4">2. Forced Appreciation (Active)</h3>
        <p>This is where you manufacture equity. By improving the physical condition of the property or its operations (raising rents, decreasing expenses), you increase its value regardless of what the market is doing.</p>
        <ul className="list-disc ml-6 mt-2 space-y-1">
          <li><strong>Renovations:</strong> Adding a bedroom, finishing a basement, or modernizing a kitchen. (e.g., spending $30k to add $50k in value).</li>
          <li><strong> operational Efficiency (Multifamily):</strong> For commercial/multifamily properties, value is based on Net Operating Income (NOI). If you decrease utility costs or add coin-laundry income, you directly increase the property&apos;s saleable value.</li>
        </ul>
        <p className="mt-2 text-sm italic">Pro Tip: Forced appreciation is the fastest way to build wealth because it is independent of the economy. During a downturn, market appreciation might be -2%, but if you add a bathroom, you still create value.</p>

        <h2 id="real-vs-nominal" className="text-2xl font-bold text-foreground pt-8">The Silent Thief: Real vs. Nominal Value</h2>
        <p>Most people look at <strong>Nominal Value</strong>—the number on the price tag. If you bought for $200k and sold for $400k, you doubled your money, right?</p>
        <p className="mt-2">Not necessarily. If inflation ran at 5% per year during that time, everything else costs more too. Your $400k might only buy what $200k bought back then. This is <strong>Real Value</strong>.</p>
        <p className="mt-4"><strong>Real Estate as an Inflation Hedge:</strong><br />
          Real estate is considered one of the best hedges against inflation because:</p>
        <ul className="list-disc ml-6 mt-2 space-y-1">
          <li><strong>Rents Rise:</strong> Landlords can raise rents to match inflation.</li>
          <li><strong>Asset Values Rise:</strong> Replacement costs go up.</li>
          <li><strong>Debt Devaluation:</strong> This is the secret weapon. You pay back your fixed-rate mortgage with "cheaper" future dollars. While your asset value keeps up with inflation, your debt stays nominal. This widens your equity gap massively in real terms.</li>
        </ul>

        <h2 id="leverage-effect" className="text-2xl font-bold text-foreground pt-8">The Leverage Effect: Calculations</h2>
        <p>The magic of real estate isn&apos;t the 4% growth on the asset—it&apos;s the 4% growth <em>on borrowed money</em>. This is called "Positive Leverage."</p>

        <div className="border-l-4 border-primary pl-4 my-4 italic">
          "Give me a lever long enough and a fulcrum on which to place it, and I shall move the world." — Archimedes
        </div>

        <p><strong>Example Scenario:</strong><br />
          You have $50,000 to invest.</p>
        <ul className="space-y-4 mt-2">
          <li>
            <strong>Option A (Stocks):</strong> You buy $50,000 of stock. It grows 5%. You make <strong>$2,500</strong>.
          </li>
          <li>
            <strong>Option B (Real Estate):</strong> You use $50,000 as a 10% down payment on a $500,000 property. The property grows 5% ($25,000). You make <strong>$25,000</strong>.
          </li>
        </ul>
        <p className="mt-2">In Option B, your <strong>Return on Investment (ROI)</strong> is $25k / $50k = 50%. In Option A, it was just 5%. The asset growth was the same, but leverage multiplied your equity return by 10x.</p>
        <p className="mt-2 text-red-600 dark:text-red-400 font-medium">Warning: Leverage works both ways. If the property value drops 5%, you lose $25,000, effectively wiping out 50% of your initial savings.</p>

        <h2 className="text-2xl font-bold text-foreground pt-8">Tax Implications of Appreciation</h2>
        <p>It is worth noting that appreciation is generally "tax-deferred." You do not pay taxes on the growth until you sell (realize the gain). This allows your equity to compound undisturbed for decades.</p>
        <ul className="list-disc ml-6 mt-2 space-y-1">
          <li><strong>Section 121 Exclusion:</strong> In the U.S., if you live in the home for 2 of the last 5 years, you can exclude up to $250k (single) or $500k (married) of capital gains tax-free.</li>
          <li><strong>1031 Exchange:</strong> For investors, you can roll over your gains into a new property to defer paying taxes indefinitely.</li>
          <li><strong>Step-Up in Basis:</strong> Upon death, heirs receive the property at its *current* market value, effectively wiping out all capital gains tax liability for previous generations.</li>
        </ul>
      </section>

      {/* FAQ */}
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2"><Info className="h-5 w-5" /> Frequently Asked Questions</CardTitle>
          <CardDescription>Common questions about property valuation</CardDescription>
        </CardHeader>
        <CardContent className="space-y-6">
          <div>
            <h4 className="font-semibold text-lg mb-2">Is 10% appreciation realistic?</h4>
            <p className="text-muted-foreground">Sustainably? No. While we see "hot" years with double-digit growth (e.g., 2020-2022), expecting that for 10+ years is dangerous. It usually leads to a bubble correction. Sticker to 3-5% for conservative planning.</p>
          </div>
          <div>
            <h4 className="font-semibold text-lg mb-2">Does Zillow predict appreciation?</h4>
            <p className="text-muted-foreground">Zestimates are algorithms based on past sales. They are not crystal balls. They react to market data, they do not foresee economic shifts. Use them as a baseline, but verify with local realtor insights.</p>
          </div>
          <div>
            <h4 className="font-semibold text-lg mb-2">What kills property appreciation?</h4>
            <p className="text-muted-foreground">Rising interest rates (making loans expensive), local job loss (major factory closing), crime spikes, or over-building (too much supply). Environmental factors like flood zone re-mapping can also overnight destroy value.</p>
          </div>
          <div>
            <h4 className="font-semibold text-lg mb-2">Do condos appreciate as fast as houses?</h4>
            <p className="text-muted-foreground">Historically, single-family homes appreciate slightly faster because you own the land. Land appreciates; structures depreciate. Condos have less land value component and can be hurt by rising HOA fees which lower buyer purchasing power.</p>
          </div>
          <div>
            <h4 className="font-semibold text-lg mb-2">Does appreciation help pay off the mortgage?</h4>
            <p className="text-muted-foreground">No. Appreciation increases your Net Worth, but it doesn&apos;t put cash in your pocket to pay bills unless you sell or refinance (Cash-Out Refi). A house can double in value while you struggle to pay the monthly mortgage.</p>
          </div>
          <div>
            <h4 className="font-semibold text-lg mb-2">How do renovations affect taxes?</h4>
            <p className="text-muted-foreground">Repairs (fixing a hole) are deductible expenses for investors. Capital Improvements (new roof, addition) add to your "Cost Basis," which lowers your tax bill when you sell, but they also often trigger a higher property tax assessment immediately.</p>
          </div>
          <div>
            <h4 className="font-semibold text-lg mb-2">What is the "Rule of 72"?</h4>
            <p className="text-muted-foreground">It is a mental math shortcut. Divide 72 by your growth rate to see how many years it takes to double your money. Rate = 6% &rarr; 72/6 = 12 years to double.</p>
          </div>
        </CardContent>
      </Card>

      {/* Usage Section */}
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2"><Search className="h-5 w-5" /> Usage of this Calculator</CardTitle>
          <CardDescription>Who needs this forecast?</CardDescription>
        </CardHeader>
        <CardContent className="space-y-6">
          <div>
            <h4 className="flex items-center gap-2 font-semibold text-lg mb-3">
              <CheckCircle2 className="h-5 w-5 text-blue-600" />
              Who Should Use This?
            </h4>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div className="p-3 bg-muted/50 rounded-lg">
                <strong className="block text-primary mb-1">Long-Term Holders</strong>
                <span className="text-sm text-muted-foreground">Homeowners planning to sell in 10-20 years for retirement funds.</span>
              </div>
              <div className="p-3 bg-muted/50 rounded-lg">
                <strong className="block text-primary mb-1">Flippers / Renovators</strong>
                <span className="text-sm text-muted-foreground">Using the "Manual Value Add" field to see if a project is worth the capital.</span>
              </div>
            </div>
          </div>

          <Separator />

          <div>
            <h4 className="flex items-center gap-2 font-semibold text-lg mb-3">
              <AlertTriangle className="h-5 w-5 text-amber-600" />
              Limitations
            </h4>
            <ul className="space-y-2 text-sm text-muted-foreground">
              <li className="flex gap-2"><CheckCircle2 className="h-4 w-4 text-amber-500 shrink-0" /> <strong>Linear Growth:</strong> Real estate growth is "lumpy." It might be flat for 5 years then jump 20%. This calculator assumes smooth linear compounding.</li>
              <li className="flex gap-2"><CheckCircle2 className="h-4 w-4 text-amber-500 shrink-0" /> <strong>Holding Costs:</strong> This calculates Asset Value, not Profit. It doesn't subtract the taxes, insurance, and maintenance you paid over those 10 years.</li>
            </ul>
          </div>
        </CardContent>
      </Card>

      {/* Summary */}
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2"><List className="h-5 w-5" /> Summary</CardTitle>
        </CardHeader>
        <CardContent className="text-sm text-muted-foreground">
          <p>This projection tool helps visualize the exponential power of compounding on real estate assets. By adjusting inflation and appreciation inputs, you can separate "paper gains" from "real wealth" and set realistic expectations for your property portfolio.</p>
        </CardContent>
      </Card>
    </div>
  );
}

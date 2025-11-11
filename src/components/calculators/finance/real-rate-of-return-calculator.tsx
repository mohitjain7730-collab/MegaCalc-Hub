'use client';

import { useState } from 'react';
import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import { z } from 'zod';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Form, FormControl, FormField, FormItem, FormLabel, FormMessage } from '@/components/ui/form';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Percent, AlertCircle, Target, Info, Landmark, Calculator, DollarSign, TrendingUp, Shield, BarChart3, Activity } from 'lucide-react';
import { Badge } from '@/components/ui/badge';
import { Alert, AlertDescription } from '@/components/ui/alert';
import Link from 'next/link';

const formSchema = z.object({
  nominalRate: z.number(),
  inflationRate: z.number().nonnegative(),
});

type FormValues = z.infer<typeof formSchema>;

export default function RealRateOfReturnCalculator() {
  const [result, setResult] = useState<{ 
    realRate: number;
    interpretation: string; 
    rateLevel: string;
    recommendation: string;
    strength: string;
    insights: string[];
    considerations: string[];
  } | null>(null);

  const form = useForm<FormValues>({
    resolver: zodResolver(formSchema),
    defaultValues: {
      nominalRate: undefined,
      inflationRate: undefined,
    },
  });

  const calculateRealRate = (values: FormValues): number => {
    const { nominalRate, inflationRate } = values;
    
    // Fisher equation: (1 + real rate) = (1 + nominal rate) / (1 + inflation rate)
    const realRate = ((1 + nominalRate / 100) / (1 + inflationRate / 100) - 1) * 100;
    
    return realRate;
  };

  const interpret = (realRate: number, nominalRate: number, inflationRate: number) => {
    if (realRate >= 5) return `Strong real rate of ${realRate.toFixed(2)}% - significantly exceeds inflation (${inflationRate.toFixed(1)}%) and provides excellent purchasing power growth.`;
    if (realRate >= 2) return `Moderate real rate of ${realRate.toFixed(2)}% - exceeds inflation (${inflationRate.toFixed(1)}%) and provides reasonable purchasing power growth.`;
    if (realRate >= 0) return `Low real rate of ${realRate.toFixed(2)}% - barely exceeds inflation (${inflationRate.toFixed(1)}%) with minimal purchasing power growth.`;
    if (realRate >= -2) return `Negative real rate of ${realRate.toFixed(2)}% - below inflation (${inflationRate.toFixed(1)}%) resulting in purchasing power loss.`;
    return `Significant negative real rate of ${realRate.toFixed(2)}% - well below inflation (${inflationRate.toFixed(1)}%) with substantial purchasing power loss.`;
  };

  const getRateLevel = (realRate: number) => {
    if (realRate >= 5) return 'Strong';
    if (realRate >= 2) return 'Moderate';
    if (realRate >= 0) return 'Low';
    if (realRate >= -2) return 'Negative';
    return 'Very Negative';
  };

  const getRecommendation = (realRate: number, nominalRate: number, inflationRate: number) => {
    if (realRate >= 5) return 'Excellent real return - maintain current investment strategy with confidence.';
    if (realRate >= 2) return 'Good real return - consider maintaining strategy with minor adjustments.';
    if (realRate >= 0) return 'Marginal real return - review investment strategy and consider alternatives.';
    if (realRate >= -2) return 'Poor real return - significant strategy review needed to improve real returns.';
    return 'Very poor real return - urgent strategy overhaul required to address negative real returns.';
  };

  const getStrength = (realRate: number) => {
    if (realRate >= 5) return 'Very Strong';
    if (realRate >= 2) return 'Strong';
    if (realRate >= 0) return 'Moderate';
    if (realRate >= -2) return 'Weak';
    return 'Very Weak';
  };

  const getInsights = (realRate: number, nominalRate: number, inflationRate: number) => {
    const insights = [];
    
    if (realRate >= 5) {
      insights.push('Strong purchasing power growth');
      insights.push('Excellent inflation protection');
      insights.push('Superior investment performance');
    } else if (realRate >= 2) {
      insights.push('Good purchasing power growth');
      insights.push('Effective inflation protection');
      insights.push('Solid investment performance');
    } else if (realRate >= 0) {
      insights.push('Limited purchasing power growth');
      insights.push('Basic inflation protection');
      insights.push('Marginal investment performance');
    } else {
      insights.push('Negative purchasing power growth');
      insights.push('Inadequate inflation protection');
      insights.push('Poor investment performance');
    }
    
    if (nominalRate > inflationRate) {
      insights.push('Nominal rate exceeds inflation');
      insights.push('Positive real return achieved');
    } else {
      insights.push('Nominal rate below inflation');
      insights.push('Negative real return experienced');
    }
    
    insights.push(`Real rate: ${realRate.toFixed(2)}%`);
    insights.push('Purchasing power analysis');
    
    return insights;
  };

  const getConsiderations = (realRate: number, inflationRate: number) => {
    const considerations = [];
    considerations.push('Real rate measures purchasing power changes');
    considerations.push('Inflation erodes nominal returns');
    considerations.push('Consider inflation in all investment decisions');
    considerations.push('Historical inflation rates may not predict future');
    considerations.push('Diversification helps manage inflation risk');
    return considerations;
  };

  const onSubmit = (values: FormValues) => {
    const realRate = calculateRealRate(values);
    setResult({
      realRate,
      interpretation: interpret(realRate, values.nominalRate, values.inflationRate),
      rateLevel: getRateLevel(realRate),
      recommendation: getRecommendation(realRate, values.nominalRate, values.inflationRate),
      strength: getStrength(realRate),
      insights: getInsights(realRate, values.nominalRate, values.inflationRate),
      considerations: getConsiderations(realRate, values.inflationRate)
    });
  };

  return (
    <div className="space-y-8">
      <Card>
        <CardHeader>
          <div className="flex items-center gap-2">
            <Percent className="h-6 w-6 text-primary" />
            <CardTitle>Real Rate of Return Calculator</CardTitle>
          </div>
          <CardDescription>
            Calculate the real rate of return by adjusting nominal returns for inflation to measure true purchasing power changes
          </CardDescription>
        </CardHeader>
        <CardContent>
      <Form {...form}>
        <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-6">
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <FormField control={form.control} name="nominalRate" render={({ field }) => (
                <FormItem>
                    <FormLabel className="flex items-center gap-2">
                      <BarChart3 className="h-4 w-4" />
                      Nominal Rate (%)
                    </FormLabel>
                    <FormControl>
                      <Input type="number" placeholder="Enter nominal rate" {...field} value={field.value ?? ''} onChange={e => field.onChange(parseFloat(e.target.value) || undefined)} />
                    </FormControl>
                  <FormMessage />
                </FormItem>
            )} />
            <FormField control={form.control} name="inflationRate" render={({ field }) => (
                <FormItem>
                    <FormLabel className="flex items-center gap-2">
                      <TrendingUp className="h-4 w-4" />
                      Inflation Rate (%)
                    </FormLabel>
                    <FormControl>
                      <Input type="number" placeholder="Enter inflation rate" {...field} value={field.value ?? ''} onChange={e => field.onChange(parseFloat(e.target.value) || undefined)} />
                    </FormControl>
                  <FormMessage />
                </FormItem>
            )} />
          </div>
              <Button type="submit" className="w-full">
                <Calculator className="h-4 w-4 mr-2" />
                Calculate Real Rate of Return
              </Button>
        </form>
      </Form>
        </CardContent>
      </Card>

      {result && (
        <div className="space-y-6">
          <Card>
            <CardHeader>
              <div className="flex items-center justify-between">
                <div className="flex items-center gap-2">
                  <Landmark className="h-6 w-6 text-primary" />
                  <CardTitle>Real Rate of Return Result</CardTitle>
                </div>
                <div className="flex gap-2">
                  <Badge variant={result.rateLevel === 'Strong' ? 'default' : result.rateLevel === 'Moderate' ? 'secondary' : 'destructive'}>
                    {result.rateLevel}
                  </Badge>
                  <Badge variant="outline">{result.strength}</Badge>
                </div>
              </div>
            </CardHeader>
            <CardContent>
              <div className="text-center space-y-4">
                <div className="text-4xl font-bold text-primary">
                  {result.realRate.toFixed(2)}%
                </div>
                <p className="text-lg text-muted-foreground">{result.interpretation}</p>
                <Alert>
                  <AlertCircle className="h-4 w-4" />
                  <AlertDescription>{result.recommendation}</AlertDescription>
                </Alert>
              </div>
            </CardContent>
          </Card>

          <Card>
          <CardHeader>
              <div className="flex items-center gap-2">
                <Info className="h-6 w-6 text-primary" />
                <CardTitle>Insights & Analysis</CardTitle>
              </div>
          </CardHeader>
          <CardContent>
              <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                <div>
                  <h4 className="font-semibold text-lg mb-3 flex items-center gap-2">
                    <TrendingUp className="h-5 w-5 text-green-600" />
                    Strengths & Opportunities
                  </h4>
                  <ul className="space-y-2">
                    {result.insights.map((insight, index) => (
                      <li key={index} className="flex items-start gap-2">
                        <div className="w-2 h-2 bg-green-600 rounded-full mt-2 flex-shrink-0" />
                        <span className="text-muted-foreground">{insight}</span>
                      </li>
                    ))}
                  </ul>
                </div>
                <div>
                  <h4 className="font-semibold text-lg mb-3 flex items-center gap-2">
                    <Shield className="h-5 w-5 text-blue-600" />
                    Important Considerations
                  </h4>
                  <ul className="space-y-2">
                    {result.considerations.map((consideration, index) => (
                      <li key={index} className="flex items-start gap-2">
                        <div className="w-2 h-2 bg-blue-600 rounded-full mt-2 flex-shrink-0" />
                        <span className="text-muted-foreground">{consideration}</span>
                      </li>
                    ))}
                  </ul>
                </div>
              </div>
          </CardContent>
        </Card>
        </div>
      )}

      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <Target className="h-5 w-5" />
            Related Financial Calculators
          </CardTitle>
          <CardDescription>
            Explore other essential financial metrics for comprehensive return analysis
          </CardDescription>
        </CardHeader>
        <CardContent>
          <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
            <Link href="/category/finance/simple-inflation-adjusted-return-calculator" className="group">
              <Card className="group-hover:shadow-md transition-shadow">
                <CardContent className="p-4 text-center">
                  <TrendingUp className="h-8 w-8 mx-auto mb-2 text-primary" />
                  <p className="text-sm font-medium">Inflation-Adjusted Return</p>
                </CardContent>
              </Card>
            </Link>
            <Link href="/category/finance/margin-of-safety-calculator" className="group">
              <Card className="group-hover:shadow-md transition-shadow">
                <CardContent className="p-4 text-center">
                  <Shield className="h-8 w-8 mx-auto mb-2 text-primary" />
                  <p className="text-sm font-medium">Margin of Safety</p>
                </CardContent>
              </Card>
            </Link>
            <Link href="/category/finance/sharpe-ratio-calculator" className="group">
              <Card className="group-hover:shadow-md transition-shadow">
                <CardContent className="p-4 text-center">
                  <BarChart3 className="h-8 w-8 mx-auto mb-2 text-primary" />
                  <p className="text-sm font-medium">Sharpe Ratio</p>
                </CardContent>
              </Card>
            </Link>
            <Link href="/category/finance/portfolio-expected-return-calculator" className="group">
              <Card className="group-hover:shadow-md transition-shadow">
                <CardContent className="p-4 text-center">
                  <Activity className="h-8 w-8 mx-auto mb-2 text-primary" />
                  <p className="text-sm font-medium">Portfolio Expected Return</p>
                </CardContent>
              </Card>
            </Link>
          </div>
        </CardContent>
      </Card>

      <section className="space-y-6 text-muted-foreground leading-relaxed bg-white p-6 md:p-10 rounded-lg shadow-lg" itemScope itemType="https://schema.org/FinanceSummary">
    {/* SEO & SCHEMA METADATA (HIGHLY OPTIMIZED) */}
    <meta itemProp="name" content="The Definitive Guide to Real Rate of Return (Inflation-Adjusted) Calculation, Fisher Formula, and Purchasing Power" />
    <meta itemProp="description" content="An expert guide detailing the Real Rate of Return formula, the critical difference between nominal and real returns, the effect of inflation on purchasing power, and how to use the exact Fisher Equation for accurate investment growth analysis." />
    <meta itemProp="keywords" content="real rate of return formula explained, calculating inflation adjusted return, nominal return vs real return, purchasing power investment analysis, fisher equation exact formula, investment growth inflation" />
    <meta itemProp="author" content="[Your Site's Financial Analyst Team]" />
    <meta itemProp="datePublished" content="2025-11-12" /> 
    <meta itemProp="url" content="/definitive-real-rate-of-return-guide" />

    <h1 className="text-3xl md:text-4xl font-extrabold text-foreground mb-4" itemProp="headline">The Definitive Guide to the Real Rate of Return: Measuring True Purchasing Power Growth</h1>
    <p className="text-lg italic text-gray-700">Master the fundamental calculation that reveals an investment’s profit after the corrosive effect of inflation is removed.</p>
    

[Image of Nominal vs Real Return graph]


    {/* TABLE OF CONTENTS (INTERNAL LINKS FOR UX AND SEO) */}
    <h2 className="text-2xl font-bold text-foreground mt-8 mb-4">Table of Contents: Jump to a Section</h2>
    <ul className="list-disc ml-6 space-y-2 text-blue-600">
        <li><a href="#definition" className="hover:underline">Nominal vs. Real Return: The Distinction</a></li>
        <li><a href="#simple-formula" className="hover:underline">The Simple Real Return Formula (Approximation)</a></li>
        <li><a href="#fisher" className="hover:underline">The Exact Real Return Formula (Fisher Equation)</a></li>
        <li><a href="#purchasing-power" className="hover:underline">Interpreting Changes in Purchasing Power</a></li>
        <li><a href="#applications" className="hover:underline">Applications in Investing and Retirement Planning</a></li>
    </ul>
<hr />

    {/* NOMINAL VS. REAL RETURN: THE DISTINCTION */}
    <h2 id="definition" className="text-2xl font-bold text-foreground pt-8" itemProp="articleSection">Nominal vs. Real Return: The Distinction</h2>
    <p>In financial analysis, it is essential to distinguish between the **Nominal Rate of Return** (the stated, unadjusted return) and the **Real Rate of Return** (the return after adjusting for inflation). The real return dictates whether an investor's wealth and purchasing power have actually increased.</p>

    <h3 className="text-xl font-semibold text-foreground mt-6">Nominal Return</h3>
    <p>The **Nominal Return** is the percentage gain or loss in the monetary value of an investment over a specific period. It is the number you see quoted on a brokerage statement or bond yield. This rate does not account for changes in the general price level.</p>

    <h3 className="text-xl font-semibold text-foreground mt-6">Real Return (Inflation-Adjusted)</h3>
    <p>The **Real Return** is the rate of return measured in terms of goods and services. It quantifies how much the investor's purchasing power has changed. If the nominal return is less than the inflation rate, the real return is negative, meaning the investor can afford less, despite having a larger numerical balance.</p>

<hr />

    {/* THE SIMPLE REAL RETURN FORMULA (APPROXIMATION) */}
    <h2 id="simple-formula" className="text-2xl font-bold text-foreground pt-8" itemProp="articleSection">The Simple Real Return Formula (Approximation)</h2>
    <p>For quick estimates and where inflation rates are low (e.g., under 5%), the real return can be approximated by simply subtracting the inflation rate from the nominal rate.</p>

    <h3 className="text-xl font-semibold text-foreground mt-6">The Calculation Identity (Approximation)</h3>
    <p>The simple formula is:</p>
    <div className="overflow-x-auto my-6 p-4 bg-gray-50 border rounded-lg text-center">
        <p className="font-mono text-xl text-red-700 font-bold">
            {'Real Return ≈ Nominal Return - Inflation Rate'}
        </p>
    </div>

    <h3 className="text-xl font-semibold text-foreground mt-6">Example and Interpretation</h3>
    <p>If an investment grew by 10% (Nominal Return) but inflation was 3%, the simple approximation suggests a real return of 7%. This means the investor's ability to buy goods and services increased by 7%.</p>
    <p>If Nominal Return is 4% and Inflation is 5%, the real return is approximately -1%. The investor lost purchasing power, despite seeing a positive numerical gain in their account balance.</p>

<hr />

    {/* THE EXACT REAL RETURN FORMULA (FISHER EQUATION) */}
    <h2 id="fisher" className="text-2xl font-bold text-foreground pt-8" itemProp="articleSection">The Exact Real Return Formula (Fisher Equation)</h2>
    <p>For maximum accuracy, particularly when dealing with long time horizons or high inflation rates, the exact relationship defined by the **Fisher Equation** should be used. This formula ensures the multiplicative effect of the two rates is correctly calculated.</p>

    <h3 className="text-xl font-semibold text-foreground mt-6">The Calculation Identity (Exact)</h3>
    <p>The exact formula for the real rate of return is:</p>
    <div className="overflow-x-auto my-6 p-4 bg-gray-50 border rounded-lg text-center">
        <p className="font-mono text-xl text-red-700 font-bold">
            {'Real Return = [(1 + Nominal Return) / (1 + Inflation Rate)] - 1'}
        </p>
    </div>
    <p>The formula divides the growth factor of the investment by the growth factor of prices, isolating the true growth in wealth.</p>

<hr />

    {/* INTERPRETING CHANGES IN PURCHASING POWER */}
    <h2 id="purchasing-power" className="text-2xl font-bold text-foreground pt-8" itemProp="articleSection">Interpreting Changes in Purchasing Power</h2>
    <p>The real rate of return is the most important metric for long-term investors because it is the only one that measures the actual growth of wealth and stability of financial planning goals.</p>

    <h3 className="text-xl font-semibold text-foreground mt-6">The Investment Test</h3>
    <p>Any investment that fails to achieve a positive real rate of return is functionally destroying wealth. While a positive nominal return is psychologically reassuring, the true test of an investment's success is its ability to outpace inflation.</p>
    <p>The investor must seek assets that offer a built-in hedge against inflation, such as real estate, commodities, or certain equities, to maximize the probability of a positive real return.</p>

<hr />

    {/* APPLICATIONS IN INVESTING AND RETIREMENT PLANNING */}
    <h2 id="applications" className="text-2xl font-bold text-foreground pt-8" itemProp="articleSection">Applications in Investing and Retirement Planning</h2>
    <p>The real rate of return is a mandatory input for accurate financial forecasting and goal setting.</p>

    <h3 className="text-xl font-semibold text-foreground mt-6">Retirement Corpus Calculation</h3>
    <p>In retirement planning, the required savings contributions (PMT) and the target corpus are often calculated using the real rate of return. This simplifies the model by keeping all figures in constant, present-day dollars, avoiding the distortion of inflated future values.</p>

    <h3 className="text-xl font-semibold text-foreground mt-6">Real Bond Yields (TIPS)</h3>
    <p>Treasury Inflation-Protected Securities (TIPS) are debt instruments designed to offer a guaranteed **real rate of return**. The yield quoted on a TIPS bond is the real rate, as the principal is adjusted for inflation (CPI) over the life of the bond, making them a pure investment vehicle for preserving purchasing power.</p>

<hr />

    {/* CONCLUSION */}
    <h2 className="text-2xl font-bold text-foreground pt-8" itemProp="articleSection">Conclusion</h2>
    <p>The **Real Rate of Return** is the ultimate measure of investment success, quantifying the true growth of purchasing power after the effect of inflation is removed.</p>
    <p>While the approximation (Nominal Rate minus Inflation Rate) is useful for quick assessments, investors must use the **Exact Fisher Equation** for rigorous forecasting, ensuring all long-term financial goals are based on the realistic expectation of achieving a positive return over the rising cost of living.</p>
</section>

      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <Info className="h-5 w-5" />
            Frequently Asked Questions
          </CardTitle>
          <CardDescription>
            Common questions about Real Rate of Return
          </CardDescription>
        </CardHeader>
        <CardContent>
          <div className="space-y-6">
            <div>
              <h4 className="font-semibold text-lg mb-3">What is the real rate of return?</h4>
              <p className="text-muted-foreground">
                The real rate of return measures the actual purchasing power changes of an investment by adjusting nominal returns for inflation. It shows whether an investment truly increased in value relative to the cost of living, providing a more accurate assessment of investment performance than nominal returns alone.
              </p>
            </div>
            
            <div>
              <h4 className="font-semibold text-lg mb-3">How do I calculate the real rate of return?</h4>
              <p className="text-muted-foreground">
                Use the Fisher equation: Real Rate = ((1 + Nominal Rate) / (1 + Inflation Rate)) - 1. This formula adjusts the nominal return for inflation to reveal the true change in purchasing power. The result shows the percentage change in real wealth over the investment period.
              </p>
            </div>
            
            <div>
              <h4 className="font-semibold text-lg mb-3">What's the difference between nominal and real rates?</h4>
              <p className="text-muted-foreground">
                Nominal rates show the raw percentage return without considering inflation, while real rates account for inflation and show the actual change in purchasing power. A 10% nominal return with 3% inflation results in a 6.8% real return, showing the true wealth creation.
              </p>
            </div>
            
            <div>
              <h4 className="font-semibold text-lg mb-3">Why is the real rate of return important?</h4>
              <p className="text-muted-foreground">
                The real rate of return is important because it reveals the true performance of investments. Nominal returns can be misleading - a 5% return with 6% inflation actually represents a loss in purchasing power. Real returns help investors make informed decisions and set realistic financial goals.
              </p>
            </div>
            
            <div>
              <h4 className="font-semibold text-lg mb-3">How does inflation affect real returns?</h4>
              <p className="text-muted-foreground">
                Inflation erodes the purchasing power of money over time, reducing the real value of investment returns. Even positive nominal returns can result in negative real returns if inflation exceeds the nominal return rate. This is why considering inflation is crucial for long-term investment planning.
              </p>
            </div>
            
            <div>
              <h4 className="font-semibold text-lg mb-3">What is a good real rate of return?</h4>
              <p className="text-muted-foreground">
                A good real rate of return depends on your investment objectives and risk tolerance. Generally, real returns above 2-3% are considered good, while returns above 5% are excellent. The key is to achieve returns that exceed inflation while meeting your specific financial goals.
              </p>
            </div>
            
            <div>
              <h4 className="font-semibold text-lg mb-3">How do I use real rates for investment planning?</h4>
              <p className="text-muted-foreground">
                Use real rates to set realistic financial goals, evaluate investment performance, and plan for retirement. Consider real returns when calculating how much you need to save, what returns to expect, and whether your investment strategy will meet your long-term objectives.
              </p>
            </div>
            
            <div>
              <h4 className="font-semibold text-lg mb-3">What investments protect against inflation?</h4>
              <p className="text-muted-foreground">
                Investments that typically protect against inflation include Treasury Inflation-Protected Securities (TIPS), real estate, commodities, and stocks of companies with pricing power. These investments tend to maintain or increase their value as inflation rises, preserving purchasing power.
              </p>
            </div>
            
            <div>
              <h4 className="font-semibold text-lg mb-3">How do I interpret negative real returns?</h4>
              <p className="text-muted-foreground">
                Negative real returns indicate that an investment lost purchasing power, even if it showed positive nominal returns. This means the investment underperformed inflation and failed to preserve wealth. Consider alternative investments or strategies that better protect against inflation.
              </p>
            </div>
            
            <div>
              <h4 className="font-semibold text-lg mb-3">Why is real rate analysis crucial for retirement planning?</h4>
              <p className="text-muted-foreground">
                Real rate analysis is crucial for retirement planning because it ensures that your savings will maintain their purchasing power throughout retirement. Without considering inflation, you may underestimate how much you need to save or overestimate the purchasing power of your retirement funds.
              </p>
            </div>
          </div>
        </CardContent>
      </Card>
    </div>
  );
}
'use client';

import { useState } from 'react';
import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import { z } from 'zod';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Form, FormControl, FormField, FormItem, FormLabel, FormMessage } from '@/components/ui/form';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { TrendingUp, AlertCircle, Target, Info, Landmark, Calculator, DollarSign, BarChart3, Shield, Activity, Percent } from 'lucide-react';
import { Badge } from '@/components/ui/badge';
import { Alert, AlertDescription } from '@/components/ui/alert';
import Link from 'next/link';

const formSchema = z.object({
  initialInvestment: z.number().positive(),
  finalValue: z.number().positive(),
  inflationRate: z.number().nonnegative(),
  timePeriod: z.number().positive(),
});

type FormValues = z.infer<typeof formSchema>;

export default function SimpleInflationAdjustedReturnCalculator() {
  const [result, setResult] = useState<{
    nominalReturn: number;
    annualizedNominalReturn: number;
    realReturn: number;
    inflationAdjustedValue: number;
    interpretation: string;
    returnLevel: string;
    recommendation: string;
    strength: string;
    insights: string[];
    considerations: string[];
  } | null>(null);

  const form = useForm<FormValues>({
    resolver: zodResolver(formSchema),
    defaultValues: {
      initialInvestment: undefined,
      finalValue: undefined,
      inflationRate: undefined,
      timePeriod: undefined,
    },
  });

  const calculateInflationAdjustedReturn = (values: FormValues) => {
    const { initialInvestment, finalValue, inflationRate, timePeriod } = values;
    
    // Handle edge cases
    if (initialInvestment <= 0 || finalValue < 0 || inflationRate < 0 || timePeriod <= 0) {
      return { nominalReturn: 0, realReturn: 0, inflationAdjustedValue: initialInvestment };
    }
    
    // Calculate total nominal return
    const totalNominalReturn = ((finalValue - initialInvestment) / initialInvestment) * 100;
    
    // Calculate annualized nominal return
    const annualizedNominalReturn = (Math.pow(finalValue / initialInvestment, 1 / timePeriod) - 1) * 100;
    
    // Calculate inflation-adjusted value (what the initial investment would be worth after inflation)
    const inflationAdjustedValue = initialInvestment * Math.pow(1 + inflationRate / 100, timePeriod);
    
    // Calculate real return using Fisher equation with annualized rates: (1 + annualized nominal) = (1 + real) × (1 + inflation)
    // Rearranged: real = (1 + annualized nominal) / (1 + inflation) - 1
    const realReturn = ((1 + annualizedNominalReturn / 100) / (1 + inflationRate / 100) - 1) * 100;
    
    return { 
      nominalReturn: totalNominalReturn, 
      annualizedNominalReturn,
      realReturn, 
      inflationAdjustedValue 
    };
  };

  const interpret = (nominalReturn: number, realReturn: number, inflationRate: number) => {
    if (realReturn >= 5) return `Strong real return of ${realReturn.toFixed(2)}% - investment significantly outperformed inflation (${inflationRate.toFixed(1)}%).`;
    if (realReturn >= 2) return `Moderate real return of ${realReturn.toFixed(2)}% - investment moderately outperformed inflation (${inflationRate.toFixed(1)}%).`;
    if (realReturn >= 0) return `Low real return of ${realReturn.toFixed(2)}% - investment barely kept pace with inflation (${inflationRate.toFixed(1)}%).`;
    if (realReturn >= -2) return `Negative real return of ${realReturn.toFixed(2)}% - investment underperformed inflation (${inflationRate.toFixed(1)}%).`;
    return `Significant negative real return of ${realReturn.toFixed(2)}% - investment significantly underperformed inflation (${inflationRate.toFixed(1)}%).`;
  };

  const getReturnLevel = (realReturn: number) => {
    if (realReturn >= 5) return 'Strong';
    if (realReturn >= 2) return 'Moderate';
    if (realReturn >= 0) return 'Low';
    if (realReturn >= -2) return 'Negative';
    return 'Very Negative';
  };

  const getRecommendation = (realReturn: number, nominalReturn: number, inflationRate: number) => {
    if (realReturn >= 5) return 'Excellent performance - maintain current investment strategy with confidence.';
    if (realReturn >= 2) return 'Good performance - consider maintaining strategy with minor adjustments.';
    if (realReturn >= 0) return 'Marginal performance - review investment strategy and consider alternatives.';
    if (realReturn >= -2) return 'Poor performance - significant strategy review needed to improve returns.';
    return 'Very poor performance - urgent strategy overhaul required to address underperformance.';
  };

  const getStrength = (realReturn: number) => {
    if (realReturn >= 5) return 'Very Strong';
    if (realReturn >= 2) return 'Strong';
    if (realReturn >= 0) return 'Moderate';
    if (realReturn >= -2) return 'Weak';
    return 'Very Weak';
  };

  const getInsights = (nominalReturn: number, realReturn: number, inflationRate: number, inflationAdjustedValue: number, initialInvestment: number) => {
    const insights = [];
    
    if (realReturn >= 5) {
      insights.push('Strong inflation-adjusted performance');
      insights.push('Significant real wealth creation');
      insights.push('Excellent investment strategy');
    } else if (realReturn >= 2) {
      insights.push('Good inflation-adjusted performance');
      insights.push('Moderate real wealth creation');
      insights.push('Solid investment strategy');
    } else if (realReturn >= 0) {
      insights.push('Marginal inflation-adjusted performance');
      insights.push('Limited real wealth creation');
      insights.push('Basic investment strategy');
    } else {
      insights.push('Poor inflation-adjusted performance');
      insights.push('Negative real wealth creation');
      insights.push('Underperforming strategy');
    }
    
    if (nominalReturn > inflationRate) {
      insights.push('Nominal returns exceed inflation');
      insights.push('Positive real return achieved');
    } else {
      insights.push('Nominal returns below inflation');
      insights.push('Negative real return experienced');
    }
    
    insights.push(`Inflation-adjusted value: $${inflationAdjustedValue.toLocaleString()}`);
    insights.push('Purchasing power analysis');
    
    return insights;
  };

  const getConsiderations = (realReturn: number, inflationRate: number) => {
    const considerations = [];
    considerations.push('Real returns measure purchasing power changes');
    considerations.push('Inflation erodes nominal returns');
    considerations.push('Consider inflation in investment decisions');
    considerations.push('Historical inflation rates may not predict future');
    considerations.push('Diversification helps manage inflation risk');
    return considerations;
  };

  const onSubmit = (values: FormValues) => {
    const returns = calculateInflationAdjustedReturn(values);
    setResult({
      nominalReturn: returns.nominalReturn,
      annualizedNominalReturn: returns.annualizedNominalReturn,
      realReturn: returns.realReturn,
      inflationAdjustedValue: returns.inflationAdjustedValue,
      interpretation: interpret(returns.nominalReturn, returns.realReturn, values.inflationRate),
      returnLevel: getReturnLevel(returns.realReturn),
      recommendation: getRecommendation(returns.realReturn, returns.nominalReturn, values.inflationRate),
      strength: getStrength(returns.realReturn),
      insights: getInsights(returns.nominalReturn, returns.realReturn, values.inflationRate, returns.inflationAdjustedValue, values.initialInvestment),
      considerations: getConsiderations(returns.realReturn, values.inflationRate)
    });
  };

  return (
    <div className="space-y-8">
      <Card>
        <CardHeader>
          <div className="flex items-center gap-2">
            <TrendingUp className="h-6 w-6 text-primary" />
            <CardTitle>Simple Inflation-Adjusted Return Calculator</CardTitle>
          </div>
          <CardDescription>
            Calculate real returns by adjusting for inflation to measure true purchasing power changes
          </CardDescription>
        </CardHeader>
        <CardContent>
          <Form {...form}>
            <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-6">
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <FormField control={form.control} name="initialInvestment" render={({ field }) => (
                  <FormItem>
                    <FormLabel className="flex items-center gap-2">
                      <DollarSign className="h-4 w-4" />
                      Initial Investment ($)
                    </FormLabel>
                    <FormControl>
                      <Input type="number" placeholder="Enter initial investment" {...field} value={field.value ?? ''} onChange={e => field.onChange(parseFloat(e.target.value) || undefined)} />
                    </FormControl>
                    <FormMessage />
                  </FormItem>
                )} />
                <FormField control={form.control} name="finalValue" render={({ field }) => (
                  <FormItem>
                    <FormLabel className="flex items-center gap-2">
                      <BarChart3 className="h-4 w-4" />
                      Final Value ($)
                    </FormLabel>
                    <FormControl>
                      <Input type="number" placeholder="Enter final value" {...field} value={field.value ?? ''} onChange={e => field.onChange(parseFloat(e.target.value) || undefined)} />
                    </FormControl>
                    <FormMessage />
                  </FormItem>
                )} />
                <FormField control={form.control} name="inflationRate" render={({ field }) => (
                  <FormItem>
                    <FormLabel className="flex items-center gap-2">
                      <Percent className="h-4 w-4" />
                      Annual Inflation Rate (%)
                    </FormLabel>
                    <FormControl>
                      <Input type="number" placeholder="Enter inflation rate" {...field} value={field.value ?? ''} onChange={e => field.onChange(parseFloat(e.target.value) || undefined)} />
                    </FormControl>
                    <FormMessage />
                  </FormItem>
                )} />
                <FormField control={form.control} name="timePeriod" render={({ field }) => (
                  <FormItem>
                    <FormLabel className="flex items-center gap-2">
                      <Activity className="h-4 w-4" />
                      Time Period (Years)
                    </FormLabel>
                    <FormControl>
                      <Input type="number" placeholder="Enter time period" {...field} value={field.value ?? ''} onChange={e => field.onChange(parseFloat(e.target.value) || undefined)} />
                    </FormControl>
                    <FormMessage />
                  </FormItem>
                )} />
              </div>
              <Button type="submit" className="w-full">
                <Calculator className="h-4 w-4 mr-2" />
                Calculate Inflation-Adjusted Return
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
                  <CardTitle>Inflation-Adjusted Return Results</CardTitle>
                </div>
                <div className="flex gap-2">
                  <Badge variant={result.returnLevel === 'Strong' ? 'default' : result.returnLevel === 'Moderate' ? 'secondary' : 'destructive'}>
                    {result.returnLevel}
                  </Badge>
                  <Badge variant="outline">{result.strength}</Badge>
                </div>
              </div>
            </CardHeader>
            <CardContent>
              <div className="text-center space-y-4">
                <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
                  <div>
                    <div className="text-2xl font-bold text-primary">
                      {result.nominalReturn?.toFixed(2) || '0.00'}%
                    </div>
                    <p className="text-sm text-muted-foreground">Total Nominal Return</p>
                  </div>
                  <div>
                    <div className="text-2xl font-bold text-blue-600">
                      {result.annualizedNominalReturn?.toFixed(2) || '0.00'}%
                    </div>
                    <p className="text-sm text-muted-foreground">Annualized Nominal Return</p>
                  </div>
                  <div>
                    <div className="text-2xl font-bold text-green-600">
                      {result.realReturn?.toFixed(2) || '0.00'}%
                    </div>
                    <p className="text-sm text-muted-foreground">Real Return (Annualized)</p>
                  </div>
                  <div>
                    <div className="text-2xl font-bold text-primary">
                      ${result.inflationAdjustedValue?.toLocaleString(undefined, { maximumFractionDigits: 0 }) || '0'}
                    </div>
                    <p className="text-sm text-muted-foreground">Inflation-Adjusted Value</p>
                  </div>
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
            <Link href="/category/finance/real-rate-of-return-calculator" className="group">
              <Card className="group-hover:shadow-md transition-shadow">
                <CardContent className="p-4 text-center">
                  <Percent className="h-8 w-8 mx-auto mb-2 text-primary" />
                  <p className="text-sm font-medium">Real Rate of Return</p>
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
                  <TrendingUp className="h-8 w-8 mx-auto mb-2 text-primary" />
                  <p className="text-sm font-medium">Portfolio Expected Return</p>
                </CardContent>
              </Card>
            </Link>
          </div>
        </CardContent>
      </Card>

      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <Info className="h-5 w-5" />
            Complete Guide to Inflation-Adjusted Returns
          </CardTitle>
          <CardDescription>
            Everything you need to know about calculating and interpreting inflation-adjusted returns
          </CardDescription>
        </CardHeader>
        <CardContent className="space-y-4">
          <p className="text-muted-foreground">
            Inflation-adjusted returns, also known as real returns, measure the true purchasing power changes of investments by accounting for inflation. While nominal returns show the raw percentage gain or loss, real returns reveal whether an investment actually increased in value relative to the cost of living.
          </p>
          <p className="text-muted-foreground">
            Understanding inflation-adjusted returns is crucial for accurate investment evaluation, retirement planning, and long-term financial decision-making. It helps investors distinguish between apparent wealth creation and actual purchasing power preservation, ensuring that investment strategies truly meet financial objectives.
          </p>
        </CardContent>
      </Card>

      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <Info className="h-5 w-5" />
            Frequently Asked Questions
          </CardTitle>
          <CardDescription>
            Common questions about Inflation-Adjusted Returns
          </CardDescription>
        </CardHeader>
        <CardContent>
          <div className="space-y-6">
            <div>
              <h4 className="font-semibold text-lg mb-3">What are inflation-adjusted returns?</h4>
              <p className="text-muted-foreground">
                Inflation-adjusted returns, also known as real returns, measure the true purchasing power changes of investments by accounting for inflation. They show whether an investment actually increased in value relative to the cost of living, providing a more accurate picture of investment performance than nominal returns alone.
              </p>
            </div>
            
            <div>
              <h4 className="font-semibold text-lg mb-3">How do I calculate inflation-adjusted returns?</h4>
              <p className="text-muted-foreground">
                Use the Fisher equation: Real Return = ((1 + Nominal Return) / (1 + Inflation Rate)) - 1. Alternatively, calculate the inflation-adjusted value of your initial investment and compare it to your final value. The real return shows the percentage change in purchasing power over the investment period.
              </p>
            </div>
            
            <div>
              <h4 className="font-semibold text-lg mb-3">What's the difference between nominal and real returns?</h4>
              <p className="text-muted-foreground">
                Nominal returns show the raw percentage gain or loss without considering inflation, while real returns account for inflation and show the actual change in purchasing power. A 10% nominal return with 3% inflation results in a 6.8% real return, showing the true wealth creation.
              </p>
            </div>
            
            <div>
              <h4 className="font-semibold text-lg mb-3">Why are inflation-adjusted returns important?</h4>
              <p className="text-muted-foreground">
                Inflation-adjusted returns are important because they reveal the true performance of investments. Nominal returns can be misleading - a 5% return with 6% inflation actually represents a loss in purchasing power. Real returns help investors make informed decisions and set realistic financial goals.
              </p>
            </div>
            
            <div>
              <h4 className="font-semibold text-lg mb-3">How does inflation affect investment returns?</h4>
              <p className="text-muted-foreground">
                Inflation erodes the purchasing power of money over time, reducing the real value of investment returns. Even positive nominal returns can result in negative real returns if inflation exceeds the nominal return rate. This is why considering inflation is crucial for long-term investment planning.
              </p>
            </div>
            
            <div>
              <h4 className="font-semibold text-lg mb-3">What is a good inflation-adjusted return?</h4>
              <p className="text-muted-foreground">
                A good inflation-adjusted return depends on your investment objectives and risk tolerance. Generally, real returns above 2-3% are considered good, while returns above 5% are excellent. The key is to achieve returns that exceed inflation while meeting your specific financial goals and risk tolerance.
              </p>
            </div>
            
            <div>
              <h4 className="font-semibold text-lg mb-3">How do I use inflation-adjusted returns for planning?</h4>
              <p className="text-muted-foreground">
                Use inflation-adjusted returns to set realistic financial goals, evaluate investment performance, and plan for retirement. Consider real returns when calculating how much you need to save, what returns to expect, and whether your investment strategy will meet your long-term objectives.
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
              <h4 className="font-semibold text-lg mb-3">Why is inflation-adjusted analysis crucial for retirement planning?</h4>
              <p className="text-muted-foreground">
                Inflation-adjusted analysis is crucial for retirement planning because it ensures that your savings will maintain their purchasing power throughout retirement. Without considering inflation, you may underestimate how much you need to save or overestimate the purchasing power of your retirement funds.
              </p>
            </div>
          </div>
        </CardContent>
      </Card>
    </div>
  );
}
'use client';

import { useState } from 'react';
import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import { z } from 'zod';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Form, FormControl, FormField, FormItem, FormLabel, FormMessage } from '@/components/ui/form';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Shield, AlertCircle, Target, Info, Landmark, Calculator, DollarSign, TrendingUp, BarChart3, Activity, Percent } from 'lucide-react';
import { Badge } from '@/components/ui/badge';
import { Alert, AlertDescription } from '@/components/ui/alert';
import Link from 'next/link';

const formSchema = z.object({
  intrinsicValue: z.number().positive(),
  currentPrice: z.number().positive(),
  targetReturn: z.number().optional(),
});

type FormValues = z.infer<typeof formSchema>;

export default function MarginOfSafetyCalculator() {
  const [result, setResult] = useState<{ 
    marginOfSafety: number;
    marginOfSafetyPercentage: number;
    interpretation: string; 
    safetyLevel: string;
    recommendation: string;
    strength: string;
    insights: string[];
    considerations: string[];
  } | null>(null);

  const form = useForm<FormValues>({
    resolver: zodResolver(formSchema),
    defaultValues: {
      intrinsicValue: undefined,
      currentPrice: undefined,
      targetReturn: undefined,
    },
  });

  const calculateMarginOfSafety = (values: FormValues) => {
    const { intrinsicValue, currentPrice } = values;
    
    // Calculate margin of safety in dollars
    const marginOfSafety = intrinsicValue - currentPrice;
    
    // Calculate margin of safety as percentage
    const marginOfSafetyPercentage = (marginOfSafety / intrinsicValue) * 100;
    
    return { marginOfSafety, marginOfSafetyPercentage };
  };

  const interpret = (marginOfSafetyPercentage: number, intrinsicValue: number, currentPrice: number) => {
    if (marginOfSafetyPercentage >= 50) return `Excellent margin of safety of ${marginOfSafetyPercentage.toFixed(1)}% - significant discount to intrinsic value provides substantial downside protection.`;
    if (marginOfSafetyPercentage >= 25) return `Good margin of safety of ${marginOfSafetyPercentage.toFixed(1)}% - reasonable discount to intrinsic value provides adequate downside protection.`;
    if (marginOfSafetyPercentage >= 10) return `Moderate margin of safety of ${marginOfSafetyPercentage.toFixed(1)}% - modest discount to intrinsic value provides basic downside protection.`;
    if (marginOfSafetyPercentage >= 0) return `Minimal margin of safety of ${marginOfSafetyPercentage.toFixed(1)}% - small discount to intrinsic value provides limited downside protection.`;
    return `No margin of safety - current price exceeds intrinsic value by ${Math.abs(marginOfSafetyPercentage).toFixed(1)}%, indicating overvaluation.`;
  };

  const getSafetyLevel = (marginOfSafetyPercentage: number) => {
    if (marginOfSafetyPercentage >= 50) return 'Excellent';
    if (marginOfSafetyPercentage >= 25) return 'Good';
    if (marginOfSafetyPercentage >= 10) return 'Moderate';
    if (marginOfSafetyPercentage >= 0) return 'Minimal';
    return 'None';
  };

  const getRecommendation = (marginOfSafetyPercentage: number, intrinsicValue: number, currentPrice: number) => {
    if (marginOfSafetyPercentage >= 50) return 'Excellent margin of safety - strong buy opportunity with substantial downside protection.';
    if (marginOfSafetyPercentage >= 25) return 'Good margin of safety - attractive investment opportunity with adequate downside protection.';
    if (marginOfSafetyPercentage >= 10) return 'Moderate margin of safety - consider investment with basic downside protection.';
    if (marginOfSafetyPercentage >= 0) return 'Minimal margin of safety - evaluate carefully as downside protection is limited.';
    return 'No margin of safety - avoid investment as current price exceeds intrinsic value.';
  };

  const getStrength = (marginOfSafetyPercentage: number) => {
    if (marginOfSafetyPercentage >= 50) return 'Very Strong';
    if (marginOfSafetyPercentage >= 25) return 'Strong';
    if (marginOfSafetyPercentage >= 10) return 'Good';
    if (marginOfSafetyPercentage >= 0) return 'Moderate';
    return 'Weak';
  };

  const getInsights = (marginOfSafetyPercentage: number, intrinsicValue: number, currentPrice: number) => {
    const insights = [];
    
    if (marginOfSafetyPercentage >= 50) {
      insights.push('Excellent downside protection');
      insights.push('Significant value opportunity');
      insights.push('Strong investment case');
    } else if (marginOfSafetyPercentage >= 25) {
      insights.push('Good downside protection');
      insights.push('Attractive value opportunity');
      insights.push('Solid investment case');
    } else if (marginOfSafetyPercentage >= 10) {
      insights.push('Moderate downside protection');
      insights.push('Reasonable value opportunity');
      insights.push('Basic investment case');
    } else if (marginOfSafetyPercentage >= 0) {
      insights.push('Limited downside protection');
      insights.push('Minimal value opportunity');
      insights.push('Weak investment case');
    } else {
      insights.push('No downside protection');
      insights.push('Overvalued opportunity');
      insights.push('Poor investment case');
    }
    
    if (marginOfSafetyPercentage > 0) {
      insights.push('Price below intrinsic value');
      insights.push('Value investment opportunity');
    } else {
      insights.push('Price above intrinsic value');
      insights.push('Growth investment consideration');
    }
    
    insights.push(`Margin of safety: ${marginOfSafetyPercentage.toFixed(1)}%`);
    insights.push('Risk assessment analysis');
    
    return insights;
  };

  const getConsiderations = (marginOfSafetyPercentage: number) => {
    const considerations = [];
    considerations.push('Margin of safety provides downside protection');
    considerations.push('Intrinsic value estimates may be inaccurate');
    considerations.push('Market conditions affect valuation');
    considerations.push('Consider multiple valuation methods');
    considerations.push('Monitor changes in intrinsic value');
    return considerations;
  };

  const onSubmit = (values: FormValues) => {
    const { marginOfSafety, marginOfSafetyPercentage } = calculateMarginOfSafety(values);
    setResult({
      marginOfSafety,
      marginOfSafetyPercentage,
      interpretation: interpret(marginOfSafetyPercentage, values.intrinsicValue, values.currentPrice),
      safetyLevel: getSafetyLevel(marginOfSafetyPercentage),
      recommendation: getRecommendation(marginOfSafetyPercentage, values.intrinsicValue, values.currentPrice),
      strength: getStrength(marginOfSafetyPercentage),
      insights: getInsights(marginOfSafetyPercentage, values.intrinsicValue, values.currentPrice),
      considerations: getConsiderations(marginOfSafetyPercentage)
    });
  };

  return (
    <div className="space-y-8">
      <Card>
        <CardHeader>
          <div className="flex items-center gap-2">
            <Shield className="h-6 w-6 text-primary" />
            <CardTitle>Margin of Safety Calculator</CardTitle>
          </div>
          <CardDescription>
            Calculate the margin of safety to assess downside protection and investment risk
          </CardDescription>
        </CardHeader>
        <CardContent>
          <Form {...form}>
            <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-6">
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <FormField control={form.control} name="intrinsicValue" render={({ field }) => (
                  <FormItem>
                    <FormLabel className="flex items-center gap-2">
                      <BarChart3 className="h-4 w-4" />
                      Intrinsic Value ($)
                    </FormLabel>
                    <FormControl>
                      <Input type="number" placeholder="Enter intrinsic value" {...field} value={field.value ?? ''} onChange={e => field.onChange(parseFloat(e.target.value) || undefined)} />
                    </FormControl>
                    <FormMessage />
                  </FormItem>
                )} />
                <FormField control={form.control} name="currentPrice" render={({ field }) => (
                  <FormItem>
                    <FormLabel className="flex items-center gap-2">
                      <DollarSign className="h-4 w-4" />
                      Current Price ($)
                    </FormLabel>
                    <FormControl>
                      <Input type="number" placeholder="Enter current price" {...field} value={field.value ?? ''} onChange={e => field.onChange(parseFloat(e.target.value) || undefined)} />
                    </FormControl>
                    <FormMessage />
                  </FormItem>
                )} />
                <FormField control={form.control} name="targetReturn" render={({ field }) => (
                  <FormItem>
                    <FormLabel className="flex items-center gap-2">
                      <Percent className="h-4 w-4" />
                      Target Return (%) - Optional
                    </FormLabel>
                    <FormControl>
                      <Input type="number" placeholder="Enter target return" {...field} value={field.value ?? ''} onChange={e => field.onChange(parseFloat(e.target.value) || undefined)} />
                    </FormControl>
                    <FormMessage />
                  </FormItem>
                )} />
              </div>
              <Button type="submit" className="w-full">
                <Calculator className="h-4 w-4 mr-2" />
                Calculate Margin of Safety
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
                  <CardTitle>Margin of Safety Results</CardTitle>
                </div>
                <div className="flex gap-2">
                  <Badge variant={result.safetyLevel === 'Excellent' ? 'default' : result.safetyLevel === 'Good' ? 'secondary' : 'destructive'}>
                    {result.safetyLevel}
                  </Badge>
                  <Badge variant="outline">{result.strength}</Badge>
                </div>
              </div>
            </CardHeader>
            <CardContent>
              <div className="text-center space-y-4">
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  <div>
                    <div className="text-2xl font-bold text-primary">
                      ${result.marginOfSafety.toFixed(2)}
                    </div>
                    <p className="text-sm text-muted-foreground">Margin of Safety ($)</p>
                  </div>
                  <div>
                    <div className="text-2xl font-bold text-green-600">
                      {result.marginOfSafetyPercentage.toFixed(1)}%
                    </div>
                    <p className="text-sm text-muted-foreground">Margin of Safety (%)</p>
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
            Explore other essential financial metrics for comprehensive investment analysis
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
            <Link href="/category/finance/real-rate-of-return-calculator" className="group">
              <Card className="group-hover:shadow-md transition-shadow">
                <CardContent className="p-4 text-center">
                  <Percent className="h-8 w-8 mx-auto mb-2 text-primary" />
                  <p className="text-sm font-medium">Real Rate of Return</p>
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
            <Link href="/category/finance/value-at-risk-calculator" className="group">
              <Card className="group-hover:shadow-md transition-shadow">
                <CardContent className="p-4 text-center">
                  <Activity className="h-8 w-8 mx-auto mb-2 text-primary" />
                  <p className="text-sm font-medium">Value at Risk</p>
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
            Complete Guide to Margin of Safety
          </CardTitle>
          <CardDescription>
            Everything you need to know about calculating and interpreting margin of safety
          </CardDescription>
        </CardHeader>
        <CardContent className="space-y-4">
          <p className="text-muted-foreground">
            Margin of safety is a fundamental concept in value investing that measures the difference between an asset's intrinsic value and its current market price. It provides downside protection by ensuring that even if the intrinsic value estimate is wrong, investors have a buffer against losses.
          </p>
          <p className="text-muted-foreground">
            Understanding margin of safety is crucial for risk management, investment decision-making, and portfolio construction. It helps investors identify undervalued opportunities, assess investment risk, and build resilient portfolios that can withstand market volatility and valuation errors.
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
            Common questions about Margin of Safety
          </CardDescription>
        </CardHeader>
        <CardContent>
          <div className="space-y-6">
            <div>
              <h4 className="font-semibold text-lg mb-3">What is margin of safety?</h4>
              <p className="text-muted-foreground">
                Margin of safety is the difference between an asset's intrinsic value and its current market price, expressed as a percentage. It provides downside protection by ensuring that even if the intrinsic value estimate is wrong, investors have a buffer against losses. A higher margin of safety indicates greater downside protection.
              </p>
            </div>
            
            <div>
              <h4 className="font-semibold text-lg mb-3">How do I calculate margin of safety?</h4>
              <p className="text-muted-foreground">
                Calculate margin of safety as: Margin of Safety = (Intrinsic Value - Current Price) / Intrinsic Value × 100%. This formula shows the percentage discount to intrinsic value. For example, if intrinsic value is $100 and current price is $75, the margin of safety is 25%.
              </p>
            </div>
            
            <div>
              <h4 className="font-semibold text-lg mb-3">What is a good margin of safety?</h4>
              <p className="text-muted-foreground">
                A good margin of safety depends on your risk tolerance and investment strategy. Generally, 20-30% is considered good, while 30-50% is excellent. Value investors often seek margins of safety above 25% to provide adequate downside protection against valuation errors and market volatility.
              </p>
            </div>
            
            <div>
              <h4 className="font-semibold text-lg mb-3">Why is margin of safety important?</h4>
              <p className="text-muted-foreground">
                Margin of safety is important because it provides downside protection, reduces investment risk, and helps identify undervalued opportunities. It acts as a buffer against valuation errors, market volatility, and unexpected events, making investments more resilient and reducing the likelihood of permanent capital loss.
              </p>
            </div>
            
            <div>
              <h4 className="font-semibold text-lg mb-3">How does margin of safety protect against risk?</h4>
              <p className="text-muted-foreground">
                Margin of safety protects against risk by providing a buffer between the purchase price and intrinsic value. Even if the intrinsic value estimate is wrong or market conditions deteriorate, the margin of safety reduces the likelihood of permanent capital loss and provides room for error in valuation assumptions.
              </p>
            </div>
            
            <div>
              <h4 className="font-semibold text-lg mb-3">What factors affect margin of safety?</h4>
              <p className="text-muted-foreground">
                Key factors include intrinsic value estimates, current market prices, market conditions, investor risk tolerance, and investment time horizon. Market volatility, economic conditions, and company-specific factors also affect margin of safety calculations and investment decisions.
              </p>
            </div>
            
            <div>
              <h4 className="font-semibold text-lg mb-3">How do I use margin of safety for investment decisions?</h4>
              <p className="text-muted-foreground">
                Use margin of safety to identify undervalued opportunities, assess investment risk, and make informed investment decisions. Compare margins of safety across different investments, consider your risk tolerance, and ensure adequate downside protection before investing. Higher margins of safety generally indicate better risk-adjusted opportunities.
              </p>
            </div>
            
            <div>
              <h4 className="font-semibold text-lg mb-3">What are the limitations of margin of safety?</h4>
              <p className="text-muted-foreground">
                Limitations include: intrinsic value estimates may be inaccurate, market conditions can change rapidly, margin of safety doesn't guarantee positive returns, and it may miss growth opportunities. Consider multiple valuation methods and market factors when using margin of safety for investment decisions.
              </p>
            </div>
            
            <div>
              <h4 className="font-semibold text-lg mb-3">How does margin of safety relate to value investing?</h4>
              <p className="text-muted-foreground">
                Margin of safety is a core principle of value investing, popularized by Benjamin Graham. Value investors seek to buy assets at prices significantly below their intrinsic value, providing a margin of safety against losses. This approach focuses on downside protection and long-term wealth creation through disciplined valuation.
              </p>
            </div>
            
            <div>
              <h4 className="font-semibold text-lg mb-3">Why is margin of safety important for portfolio management?</h4>
              <p className="text-muted-foreground">
                Margin of safety is important for portfolio management as it helps assess investment risk, identify opportunities, and build resilient portfolios. It provides a framework for risk management, helps optimize risk-adjusted returns, and ensures that investments align with risk tolerance and investment objectives.
              </p>
            </div>
          </div>
        </CardContent>
      </Card>
    </div>
  );
}
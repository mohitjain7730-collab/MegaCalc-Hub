'use client';

import { useState } from 'react';
import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import { z } from 'zod';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Form, FormControl, FormField, FormItem, FormLabel, FormMessage } from '@/components/ui/form';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { TrendingUp, AlertCircle, Target, Info, Landmark, Calculator, DollarSign, BarChart3, Shield, Activity } from 'lucide-react';
import { Badge } from '@/components/ui/badge';
import { Alert, AlertDescription } from '@/components/ui/alert';
import Link from 'next/link';

const formSchema = z.object({
  portfolioReturn: z.number(),
  riskFreeRate: z.number(),
  portfolioStdDev: z.number().positive(),
});

type FormValues = z.infer<typeof formSchema>;

export default function SharpeRatioCalculator() {
  const [result, setResult] = useState<{ 
    sharpeRatio: number; 
    interpretation: string; 
    riskLevel: string;
    recommendation: string;
    strength: string;
    insights: string[];
    considerations: string[];
  } | null>(null);

  const form = useForm<FormValues>({
    resolver: zodResolver(formSchema),
    defaultValues: {
      portfolioReturn: undefined,
      riskFreeRate: undefined,
      portfolioStdDev: undefined,
    },
  });

  const calculate = (v: FormValues) => {
    if (v.portfolioReturn == null || v.riskFreeRate == null || v.portfolioStdDev == null) return null;
    return (v.portfolioReturn - v.riskFreeRate) / v.portfolioStdDev;
  };

  const interpret = (sharpeRatio: number) => {
    if (sharpeRatio >= 2) return 'Excellent risk-adjusted returns with superior performance.';
    if (sharpeRatio >= 1) return 'Good risk-adjusted returns with solid performance.';
    if (sharpeRatio >= 0.5) return 'Adequate risk-adjusted returns but room for improvement.';
    if (sharpeRatio >= 0) return 'Poor risk-adjusted returns - high risk for low excess return.';
    return 'Negative risk-adjusted returns - portfolio underperforming risk-free rate.';
  };

  const getRiskLevel = (sharpeRatio: number) => {
    if (sharpeRatio >= 2) return 'Excellent';
    if (sharpeRatio >= 1) return 'Good';
    if (sharpeRatio >= 0.5) return 'Adequate';
    if (sharpeRatio >= 0) return 'Poor';
    return 'Very Poor';
  };

  const getRecommendation = (sharpeRatio: number) => {
    if (sharpeRatio >= 2) return 'Maintain current strategy - excellent risk-adjusted performance.';
    if (sharpeRatio >= 1) return 'Continue current approach with minor optimizations.';
    if (sharpeRatio >= 0.5) return 'Focus on improving risk-adjusted returns through diversification.';
    if (sharpeRatio >= 0) return 'Urgent need to improve risk management and return optimization.';
    return 'Critical situation - immediate portfolio restructuring required.';
  };

  const getStrength = (sharpeRatio: number) => {
    if (sharpeRatio >= 2) return 'Very Strong';
    if (sharpeRatio >= 1) return 'Strong';
    if (sharpeRatio >= 0.5) return 'Moderate';
    if (sharpeRatio >= 0) return 'Weak';
    return 'Very Weak';
  };

  const getInsights = (sharpeRatio: number) => {
    const insights = [];
    if (sharpeRatio >= 2) {
      insights.push('Exceptional risk-adjusted performance');
      insights.push('Superior portfolio management');
      insights.push('Excellent risk-return trade-off');
    } else if (sharpeRatio >= 1) {
      insights.push('Strong risk-adjusted performance');
      insights.push('Good portfolio management');
      insights.push('Solid risk-return balance');
    } else if (sharpeRatio >= 0.5) {
      insights.push('Adequate risk-adjusted performance');
      insights.push('Room for optimization');
      insights.push('Monitor risk management');
    } else if (sharpeRatio >= 0) {
      insights.push('Poor risk-adjusted performance');
      insights.push('High risk for low returns');
      insights.push('Urgent need for improvement');
    } else {
      insights.push('Negative risk-adjusted performance');
      insights.push('Portfolio underperforming');
      insights.push('Critical risk management issues');
    }
    return insights;
  };

  const getConsiderations = (sharpeRatio: number) => {
    const considerations = [];
    considerations.push('Sharpe ratio assumes normal distribution of returns');
    considerations.push('Historical performance may not predict future results');
    considerations.push('Risk-free rate varies by market conditions');
    considerations.push('Compare with appropriate benchmarks');
    considerations.push('Consider investment time horizon and objectives');
    return considerations;
  };

  const onSubmit = (values: FormValues) => {
    const sharpeRatio = calculate(values);
    if (sharpeRatio !== null) {
      setResult({
        sharpeRatio,
        interpretation: interpret(sharpeRatio),
        riskLevel: getRiskLevel(sharpeRatio),
        recommendation: getRecommendation(sharpeRatio),
        strength: getStrength(sharpeRatio),
        insights: getInsights(sharpeRatio),
        considerations: getConsiderations(sharpeRatio)
      });
    }
  };

  return (
    <div className="space-y-8">
      <Card>
        <CardHeader>
          <div className="flex items-center gap-2">
            <TrendingUp className="h-6 w-6 text-primary" />
            <CardTitle>Sharpe Ratio Calculator</CardTitle>
          </div>
          <CardDescription>
            Calculate your portfolio's Sharpe ratio to assess risk-adjusted returns and performance
          </CardDescription>
        </CardHeader>
        <CardContent>
          <Form {...form}>
            <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-6">
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <FormField control={form.control} name="portfolioReturn" render={({ field }) => (
                  <FormItem>
                    <FormLabel className="flex items-center gap-2">
                      <DollarSign className="h-4 w-4" />
                      Portfolio Return (%)
                    </FormLabel>
                    <FormControl>
                      <Input type="number" placeholder="Enter portfolio return" {...field} value={field.value ?? ''} onChange={e => field.onChange(parseFloat(e.target.value) || undefined)} />
                    </FormControl>
                    <FormMessage />
                  </FormItem>
                )} />
                <FormField control={form.control} name="riskFreeRate" render={({ field }) => (
                  <FormItem>
                    <FormLabel className="flex items-center gap-2">
                      <Shield className="h-4 w-4" />
                      Risk-Free Rate (%)
                    </FormLabel>
                    <FormControl>
                      <Input type="number" placeholder="Enter risk-free rate" {...field} value={field.value ?? ''} onChange={e => field.onChange(parseFloat(e.target.value) || undefined)} />
                    </FormControl>
                    <FormMessage />
                  </FormItem>
                )} />
                <FormField control={form.control} name="portfolioStdDev" render={({ field }) => (
                  <FormItem>
                    <FormLabel className="flex items-center gap-2">
                      <BarChart3 className="h-4 w-4" />
                      Portfolio Standard Deviation (%)
                    </FormLabel>
                    <FormControl>
                      <Input type="number" placeholder="Enter standard deviation" {...field} value={field.value ?? ''} onChange={e => field.onChange(parseFloat(e.target.value) || undefined)} />
                    </FormControl>
                    <FormMessage />
                  </FormItem>
                )} />
              </div>
              <Button type="submit" className="w-full">
                <Calculator className="h-4 w-4 mr-2" />
                Calculate Sharpe Ratio
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
                  <CardTitle>Sharpe Ratio Result</CardTitle>
                </div>
                <div className="flex gap-2">
                  <Badge variant={result.riskLevel === 'Excellent' ? 'default' : result.riskLevel === 'Good' ? 'secondary' : 'destructive'}>
                    {result.riskLevel}
                  </Badge>
                  <Badge variant="outline">{result.strength}</Badge>
                </div>
              </div>
            </CardHeader>
            <CardContent>
              <div className="text-center space-y-4">
                <div className="text-4xl font-bold text-primary">
                  {result.sharpeRatio.toFixed(3)}
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
            Explore other essential financial metrics for comprehensive portfolio analysis
          </CardDescription>
        </CardHeader>
        <CardContent>
          <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
            <Link href="/category/finance/sortino-ratio-calculator" className="group">
              <Card className="group-hover:shadow-md transition-shadow">
                <CardContent className="p-4 text-center">
                  <TrendingUp className="h-8 w-8 mx-auto mb-2 text-primary" />
                  <p className="text-sm font-medium">Sortino Ratio</p>
                </CardContent>
              </Card>
            </Link>
            <Link href="/category/finance/treynor-ratio-calculator" className="group">
              <Card className="group-hover:shadow-md transition-shadow">
                <CardContent className="p-4 text-center">
                  <BarChart3 className="h-8 w-8 mx-auto mb-2 text-primary" />
                  <p className="text-sm font-medium">Treynor Ratio</p>
                </CardContent>
              </Card>
            </Link>
            <Link href="/category/finance/free-cash-flow-calculator" className="group">
              <Card className="group-hover:shadow-md transition-shadow">
                <CardContent className="p-4 text-center">
                  <DollarSign className="h-8 w-8 mx-auto mb-2 text-primary" />
                  <p className="text-sm font-medium">Free Cash Flow</p>
                </CardContent>
              </Card>
            </Link>
            <Link href="/category/finance/enterprise-value-calculator" className="group">
              <Card className="group-hover:shadow-md transition-shadow">
                <CardContent className="p-4 text-center">
                  <Activity className="h-8 w-8 mx-auto mb-2 text-primary" />
                  <p className="text-sm font-medium">Enterprise Value</p>
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
            Complete Guide to Sharpe Ratio
          </CardTitle>
          <CardDescription>
            Everything you need to know about calculating and interpreting the Sharpe ratio
          </CardDescription>
        </CardHeader>
        <CardContent className="space-y-4">
          <p className="text-muted-foreground">
            The Sharpe Ratio is a fundamental risk-adjusted performance metric that measures how much excess return you receive for the extra volatility you endure for holding a riskier asset. It's calculated as (Portfolio Return - Risk-Free Rate) ÷ Portfolio Standard Deviation.
          </p>
          <p className="text-muted-foreground">
            This ratio helps investors understand whether the returns of an investment are due to smart investment decisions or excessive risk-taking. A higher Sharpe ratio indicates better risk-adjusted performance, making it a crucial tool for portfolio evaluation and comparison.
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
            Common questions about Sharpe Ratio
          </CardDescription>
        </CardHeader>
        <CardContent>
          <div className="space-y-6">
            <div>
              <h4 className="font-semibold text-lg mb-3">What is the Sharpe Ratio?</h4>
              <p className="text-muted-foreground">
                The Sharpe Ratio is a risk-adjusted performance metric that measures how much excess return you receive for the extra volatility you endure for holding a riskier asset. It's calculated as (Portfolio Return - Risk-Free Rate) ÷ Portfolio Standard Deviation. Higher ratios indicate better risk-adjusted performance.
              </p>
            </div>
            
            <div>
              <h4 className="font-semibold text-lg mb-3">How do I calculate the Sharpe Ratio?</h4>
              <p className="text-muted-foreground">
                The formula is: Sharpe Ratio = (Portfolio Return - Risk-Free Rate) ÷ Portfolio Standard Deviation. Portfolio Return is the average return of your investment. Risk-Free Rate is typically the yield on government bonds. Standard Deviation measures the volatility of returns.
              </p>
            </div>
            
            <div>
              <h4 className="font-semibold text-lg mb-3">What is considered a good Sharpe Ratio?</h4>
              <p className="text-muted-foreground">
                Generally, a Sharpe ratio above 1 is considered good, above 2 is excellent, and above 0.5 is acceptable. A ratio below 0 indicates the portfolio is underperforming the risk-free rate. However, what's considered good varies by market conditions and investment objectives.
              </p>
            </div>
            
            <div>
              <h4 className="font-semibold text-lg mb-3">What does a negative Sharpe Ratio mean?</h4>
              <p className="text-muted-foreground">
                A negative Sharpe ratio means the portfolio is underperforming the risk-free rate. This indicates that the investment is not providing adequate returns for the risk taken. It suggests the portfolio should be restructured or the investment strategy should be reconsidered.
              </p>
            </div>
            
            <div>
              <h4 className="font-semibold text-lg mb-3">How does the Sharpe Ratio help with investment decisions?</h4>
              <p className="text-muted-foreground">
                The Sharpe ratio helps investors compare different investments on a risk-adjusted basis. It identifies which investments provide the best returns per unit of risk. This helps in portfolio optimization, asset allocation decisions, and selecting the most efficient investment strategies.
              </p>
            </div>
            
            <div>
              <h4 className="font-semibold text-lg mb-3">What are the limitations of the Sharpe Ratio?</h4>
              <p className="text-muted-foreground">
                The Sharpe ratio assumes returns are normally distributed and may not capture tail risk. It treats all volatility equally, whether upside or downside. It doesn't account for non-linear risks or extreme market events. It's based on historical data and may not predict future performance.
              </p>
            </div>
            
            <div>
              <h4 className="font-semibold text-lg mb-3">How can I improve my Sharpe Ratio?</h4>
              <p className="text-muted-foreground">
                You can improve the Sharpe ratio by increasing returns through better investment selection, reducing volatility through diversification, or optimizing the risk-return trade-off. Focus on investments that provide higher returns with lower volatility, and consider alternative strategies that may offer better risk-adjusted returns.
              </p>
            </div>
            
            <div>
              <h4 className="font-semibold text-lg mb-3">How does the Sharpe Ratio differ from other risk metrics?</h4>
              <p className="text-muted-foreground">
                Unlike total return metrics, the Sharpe ratio considers risk. Unlike volatility alone, it considers the excess return over the risk-free rate. It's more comprehensive than simple return metrics but less sophisticated than downside risk measures like the Sortino ratio.
              </p>
            </div>
            
            <div>
              <h4 className="font-semibold text-lg mb-3">Why is the Sharpe Ratio important for portfolio management?</h4>
              <p className="text-muted-foreground">
                The Sharpe ratio is crucial for portfolio management as it helps optimize the risk-return trade-off. It guides asset allocation decisions, helps identify underperforming investments, and provides a standardized way to compare different strategies. It's essential for building efficient portfolios.
              </p>
            </div>
            
            <div>
              <h4 className="font-semibold text-lg mb-3">How do institutional investors use the Sharpe Ratio?</h4>
              <p className="text-muted-foreground">
                Institutional investors use the Sharpe ratio to evaluate fund managers, compare investment strategies, and optimize portfolio allocation. It's used in performance attribution analysis, risk budgeting, and setting investment guidelines. It helps ensure that risk-taking is appropriately rewarded with returns.
              </p>
            </div>
          </div>
        </CardContent>
      </Card>
    </div>
  );
}
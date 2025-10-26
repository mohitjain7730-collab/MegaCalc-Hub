'use client';

import { useState } from 'react';
import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import { z } from 'zod';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Form, FormControl, FormField, FormItem, FormLabel, FormMessage } from '@/components/ui/form';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { BarChart3, AlertCircle, Target, Info, Landmark, Calculator, DollarSign, TrendingUp, Shield, Activity } from 'lucide-react';
import { Badge } from '@/components/ui/badge';
import { Alert, AlertDescription } from '@/components/ui/alert';
import Link from 'next/link';

const formSchema = z.object({
  portfolioReturn: z.number(),
  riskFreeRate: z.number(),
  beta: z.number().positive(),
});

type FormValues = z.infer<typeof formSchema>;

export default function TreynorRatioCalculator() {
  const [result, setResult] = useState<{ 
    treynorRatio: number; 
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
      beta: undefined,
    },
  });

  const calculate = (v: FormValues) => {
    if (v.portfolioReturn == null || v.riskFreeRate == null || v.beta == null) return null;
    return (v.portfolioReturn - v.riskFreeRate) / v.beta;
  };

  const interpret = (treynorRatio: number) => {
    if (treynorRatio >= 15) return 'Excellent systematic risk-adjusted returns with superior performance.';
    if (treynorRatio >= 10) return 'Good systematic risk-adjusted returns with solid performance.';
    if (treynorRatio >= 5) return 'Adequate systematic risk-adjusted returns but room for improvement.';
    if (treynorRatio >= 0) return 'Poor systematic risk-adjusted returns - high systematic risk.';
    return 'Negative systematic risk-adjusted returns - portfolio underperforming market risk.';
  };

  const getRiskLevel = (treynorRatio: number) => {
    if (treynorRatio >= 15) return 'Excellent';
    if (treynorRatio >= 10) return 'Good';
    if (treynorRatio >= 5) return 'Adequate';
    if (treynorRatio >= 0) return 'Poor';
    return 'Very Poor';
  };

  const getRecommendation = (treynorRatio: number) => {
    if (treynorRatio >= 15) return 'Maintain current strategy - excellent systematic risk management.';
    if (treynorRatio >= 10) return 'Continue current approach with focus on systematic risk optimization.';
    if (treynorRatio >= 5) return 'Focus on improving systematic risk-adjusted returns.';
    if (treynorRatio >= 0) return 'Urgent need to improve systematic risk management strategies.';
    return 'Critical situation - immediate systematic risk management required.';
  };

  const getStrength = (treynorRatio: number) => {
    if (treynorRatio >= 15) return 'Very Strong';
    if (treynorRatio >= 10) return 'Strong';
    if (treynorRatio >= 5) return 'Moderate';
    if (treynorRatio >= 0) return 'Weak';
    return 'Very Weak';
  };

  const getInsights = (treynorRatio: number) => {
    const insights = [];
    if (treynorRatio >= 15) {
      insights.push('Exceptional systematic risk management');
      insights.push('Superior market risk-adjusted performance');
      insights.push('Excellent systematic risk efficiency');
    } else if (treynorRatio >= 10) {
      insights.push('Strong systematic risk management');
      insights.push('Good market risk-adjusted performance');
      insights.push('Solid systematic risk efficiency');
    } else if (treynorRatio >= 5) {
      insights.push('Adequate systematic risk management');
      insights.push('Room for systematic risk optimization');
      insights.push('Monitor market risk exposure');
    } else if (treynorRatio >= 0) {
      insights.push('Poor systematic risk management');
      insights.push('High systematic risk exposure');
      insights.push('Urgent need for systematic risk improvement');
    } else {
      insights.push('Very poor systematic risk management');
      insights.push('Significant systematic risk exposure');
      insights.push('Critical systematic risk management issues');
    }
    return insights;
  };

  const getConsiderations = (treynorRatio: number) => {
    const considerations = [];
    considerations.push('Treynor ratio assumes CAPM model validity');
    considerations.push('Beta may not capture all systematic risks');
    considerations.push('Historical performance may not predict future results');
    considerations.push('Compare with appropriate market benchmarks');
    considerations.push('Consider investment objectives and risk tolerance');
    return considerations;
  };

  const onSubmit = (values: FormValues) => {
    const treynorRatio = calculate(values);
    if (treynorRatio !== null) {
      setResult({
        treynorRatio,
        interpretation: interpret(treynorRatio),
        riskLevel: getRiskLevel(treynorRatio),
        recommendation: getRecommendation(treynorRatio),
        strength: getStrength(treynorRatio),
        insights: getInsights(treynorRatio),
        considerations: getConsiderations(treynorRatio)
      });
    }
  };

  return (
    <div className="space-y-8">
      <Card>
        <CardHeader>
          <div className="flex items-center gap-2">
            <BarChart3 className="h-6 w-6 text-primary" />
            <CardTitle>Treynor Ratio Calculator</CardTitle>
          </div>
          <CardDescription>
            Calculate your portfolio's Treynor ratio to assess systematic risk-adjusted returns
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
                <FormField control={form.control} name="beta" render={({ field }) => (
                  <FormItem>
                    <FormLabel className="flex items-center gap-2">
                      <Activity className="h-4 w-4" />
                      Beta (Systematic Risk)
                    </FormLabel>
                    <FormControl>
                      <Input type="number" placeholder="Enter beta" {...field} value={field.value ?? ''} onChange={e => field.onChange(parseFloat(e.target.value) || undefined)} />
                    </FormControl>
                    <FormMessage />
                  </FormItem>
                )} />
              </div>
              <Button type="submit" className="w-full">
                <Calculator className="h-4 w-4 mr-2" />
                Calculate Treynor Ratio
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
                  <CardTitle>Treynor Ratio Result</CardTitle>
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
                  {result.treynorRatio.toFixed(3)}
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
            <Link href="/category/finance/sharpe-ratio-calculator" className="group">
              <Card className="group-hover:shadow-md transition-shadow">
                <CardContent className="p-4 text-center">
                  <TrendingUp className="h-8 w-8 mx-auto mb-2 text-primary" />
                  <p className="text-sm font-medium">Sharpe Ratio</p>
                </CardContent>
              </Card>
            </Link>
            <Link href="/category/finance/sortino-ratio-calculator" className="group">
              <Card className="group-hover:shadow-md transition-shadow">
                <CardContent className="p-4 text-center">
                  <BarChart3 className="h-8 w-8 mx-auto mb-2 text-primary" />
                  <p className="text-sm font-medium">Sortino Ratio</p>
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
            Complete Guide to Treynor Ratio
          </CardTitle>
          <CardDescription>
            Everything you need to know about calculating and interpreting the Treynor ratio
          </CardDescription>
        </CardHeader>
        <CardContent className="space-y-4">
          <p className="text-muted-foreground">
            The Treynor Ratio is a risk-adjusted performance metric that measures how much excess return you receive for the systematic risk you take. It's calculated as (Portfolio Return - Risk-Free Rate) ÷ Beta, focusing specifically on market risk rather than total volatility.
          </p>
          <p className="text-muted-foreground">
            This ratio is particularly valuable for diversified portfolios where unsystematic risk has been eliminated through diversification. It helps investors understand how well their portfolio performs relative to market risk, making it essential for portfolio evaluation and comparison.
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
            Common questions about Treynor Ratio
          </CardDescription>
        </CardHeader>
        <CardContent>
          <div className="space-y-6">
            <div>
              <h4 className="font-semibold text-lg mb-3">What is the Treynor Ratio?</h4>
              <p className="text-muted-foreground">
                The Treynor Ratio is a risk-adjusted performance metric that measures how much excess return you receive for the systematic risk you take. It's calculated as (Portfolio Return - Risk-Free Rate) ÷ Beta. Unlike the Sharpe ratio, it focuses on market risk rather than total volatility.
              </p>
            </div>
            
            <div>
              <h4 className="font-semibold text-lg mb-3">How do I calculate the Treynor Ratio?</h4>
              <p className="text-muted-foreground">
                The formula is: Treynor Ratio = (Portfolio Return - Risk-Free Rate) ÷ Beta. Portfolio Return is the average return of your investment. Risk-Free Rate is typically the yield on government bonds. Beta measures the systematic risk relative to the market.
              </p>
            </div>
            
            <div>
              <h4 className="font-semibold text-lg mb-3">What is considered a good Treynor Ratio?</h4>
              <p className="text-muted-foreground">
                Generally, a Treynor ratio above 10 is considered good, above 15 is excellent, and above 5 is acceptable. Since it focuses on systematic risk, it's typically higher than Sharpe ratios for the same investment. The threshold depends on market conditions and investment objectives.
              </p>
            </div>
            
            <div>
              <h4 className="font-semibold text-lg mb-3">How does the Treynor Ratio differ from the Sharpe Ratio?</h4>
              <p className="text-muted-foreground">
                The Sharpe ratio considers total volatility (systematic + unsystematic risk), while the Treynor ratio only considers systematic risk (beta). This makes the Treynor ratio more relevant for diversified portfolios where unsystematic risk has been eliminated. It typically provides higher values than the Sharpe ratio.
              </p>
            </div>
            
            <div>
              <h4 className="font-semibold text-lg mb-3">What does a high Treynor Ratio mean?</h4>
              <p className="text-muted-foreground">
                A high Treynor ratio indicates that the investment provides good returns relative to its systematic risk. This suggests effective management of market risk and that the investment is achieving returns without exposing investors to excessive systematic risk. It's particularly valuable for diversified portfolios.
              </p>
            </div>
            
            <div>
              <h4 className="font-semibold text-lg mb-3">What does a low Treynor Ratio mean?</h4>
              <p className="text-muted-foreground">
                A low Treynor ratio indicates that the investment has high systematic risk relative to its returns. This suggests that the investment may not be adequately compensating investors for the market risk they're taking. It may indicate poor systematic risk management or excessive market exposure.
              </p>
            </div>
            
            <div>
              <h4 className="font-semibold text-lg mb-3">What are the limitations of the Treynor Ratio?</h4>
              <p className="text-muted-foreground">
                The Treynor ratio assumes the CAPM model is valid and that beta accurately captures systematic risk. It doesn't account for unsystematic risk, which may be relevant for undiversified portfolios. It's based on historical data and may not predict future performance. Beta can be unstable over time.
              </p>
            </div>
            
            <div>
              <h4 className="font-semibold text-lg mb-3">How can I improve my Treynor Ratio?</h4>
              <p className="text-muted-foreground">
                You can improve the Treynor ratio by reducing systematic risk through better market timing, sector rotation, or hedging strategies. Focus on investments that provide higher returns with lower beta. Consider strategies that generate alpha while maintaining low systematic risk exposure.
              </p>
            </div>
            
            <div>
              <h4 className="font-semibold text-lg mb-3">Why is the Treynor Ratio important for portfolio management?</h4>
              <p className="text-muted-foreground">
                The Treynor ratio is crucial for portfolio management as it helps optimize the risk-return trade-off specifically for systematic risk. It guides asset allocation decisions, helps identify investments with good systematic risk management, and provides a standardized way to compare strategies based on market risk.
              </p>
            </div>
            
            <div>
              <h4 className="font-semibold text-lg mb-3">How do institutional investors use the Treynor Ratio?</h4>
              <p className="text-muted-foreground">
                Institutional investors use the Treynor ratio to evaluate fund managers' systematic risk management, compare investment strategies, and optimize portfolio allocation. It's particularly important for large portfolios where diversification has eliminated most unsystematic risk, making systematic risk the primary concern.
              </p>
            </div>
          </div>
        </CardContent>
      </Card>
    </div>
  );
}
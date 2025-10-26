'use client';

import { useState } from 'react';
import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import { z } from 'zod';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Form, FormControl, FormField, FormItem, FormLabel, FormMessage } from '@/components/ui/form';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { TrendingDown, AlertCircle, Target, Info, Landmark, Calculator, DollarSign, BarChart3, Shield, Activity } from 'lucide-react';
import { Badge } from '@/components/ui/badge';
import { Alert, AlertDescription } from '@/components/ui/alert';
import Link from 'next/link';

const formSchema = z.object({
  portfolioReturn: z.number(),
  riskFreeRate: z.number(),
  downsideDeviation: z.number().positive(),
});

type FormValues = z.infer<typeof formSchema>;

export default function SortinoRatioCalculator() {
  const [result, setResult] = useState<{ 
    sortinoRatio: number; 
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
      downsideDeviation: undefined,
    },
  });

  const calculate = (v: FormValues) => {
    if (v.portfolioReturn == null || v.riskFreeRate == null || v.downsideDeviation == null) return null;
    return (v.portfolioReturn - v.riskFreeRate) / v.downsideDeviation;
  };

  const interpret = (sortinoRatio: number) => {
    if (sortinoRatio >= 2) return 'Excellent downside risk-adjusted returns with superior performance.';
    if (sortinoRatio >= 1.5) return 'Good downside risk-adjusted returns with solid performance.';
    if (sortinoRatio >= 1) return 'Adequate downside risk-adjusted returns but room for improvement.';
    if (sortinoRatio >= 0.5) return 'Poor downside risk-adjusted returns - high downside risk.';
    return 'Very poor downside risk-adjusted returns - significant downside risk exposure.';
  };

  const getRiskLevel = (sortinoRatio: number) => {
    if (sortinoRatio >= 2) return 'Excellent';
    if (sortinoRatio >= 1.5) return 'Good';
    if (sortinoRatio >= 1) return 'Adequate';
    if (sortinoRatio >= 0.5) return 'Poor';
    return 'Very Poor';
  };

  const getRecommendation = (sortinoRatio: number) => {
    if (sortinoRatio >= 2) return 'Maintain current strategy - excellent downside risk management.';
    if (sortinoRatio >= 1.5) return 'Continue current approach with focus on downside protection.';
    if (sortinoRatio >= 1) return 'Focus on improving downside risk management and protection.';
    if (sortinoRatio >= 0.5) return 'Urgent need to improve downside risk management strategies.';
    return 'Critical situation - immediate downside risk management required.';
  };

  const getStrength = (sortinoRatio: number) => {
    if (sortinoRatio >= 2) return 'Very Strong';
    if (sortinoRatio >= 1.5) return 'Strong';
    if (sortinoRatio >= 1) return 'Moderate';
    if (sortinoRatio >= 0.5) return 'Weak';
    return 'Very Weak';
  };

  const getInsights = (sortinoRatio: number) => {
    const insights = [];
    if (sortinoRatio >= 2) {
      insights.push('Exceptional downside risk management');
      insights.push('Superior downside-adjusted performance');
      insights.push('Excellent downside protection');
    } else if (sortinoRatio >= 1.5) {
      insights.push('Strong downside risk management');
      insights.push('Good downside-adjusted performance');
      insights.push('Solid downside protection');
    } else if (sortinoRatio >= 1) {
      insights.push('Adequate downside risk management');
      insights.push('Room for downside optimization');
      insights.push('Monitor downside risk exposure');
    } else if (sortinoRatio >= 0.5) {
      insights.push('Poor downside risk management');
      insights.push('High downside risk exposure');
      insights.push('Urgent need for downside protection');
    } else {
      insights.push('Very poor downside risk management');
      insights.push('Significant downside risk exposure');
      insights.push('Critical downside protection issues');
    }
    return insights;
  };

  const getConsiderations = (sortinoRatio: number) => {
    const considerations = [];
    considerations.push('Sortino ratio focuses only on downside volatility');
    considerations.push('Historical performance may not predict future results');
    considerations.push('Risk-free rate varies by market conditions');
    considerations.push('Compare with appropriate benchmarks');
    considerations.push('Consider investment objectives and risk tolerance');
    return considerations;
  };

  const onSubmit = (values: FormValues) => {
    const sortinoRatio = calculate(values);
    if (sortinoRatio !== null) {
      setResult({
        sortinoRatio,
        interpretation: interpret(sortinoRatio),
        riskLevel: getRiskLevel(sortinoRatio),
        recommendation: getRecommendation(sortinoRatio),
        strength: getStrength(sortinoRatio),
        insights: getInsights(sortinoRatio),
        considerations: getConsiderations(sortinoRatio)
      });
    }
  };

  return (
    <div className="space-y-8">
      <Card>
        <CardHeader>
          <div className="flex items-center gap-2">
            <TrendingDown className="h-6 w-6 text-primary" />
            <CardTitle>Sortino Ratio Calculator</CardTitle>
          </div>
          <CardDescription>
            Calculate your portfolio's Sortino ratio to assess downside risk-adjusted returns
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
                <FormField control={form.control} name="downsideDeviation" render={({ field }) => (
                  <FormItem>
                    <FormLabel className="flex items-center gap-2">
                      <BarChart3 className="h-4 w-4" />
                      Downside Deviation (%)
                    </FormLabel>
                    <FormControl>
                      <Input type="number" placeholder="Enter downside deviation" {...field} value={field.value ?? ''} onChange={e => field.onChange(parseFloat(e.target.value) || undefined)} />
                    </FormControl>
                    <FormMessage />
                  </FormItem>
                )} />
              </div>
              <Button type="submit" className="w-full">
                <Calculator className="h-4 w-4 mr-2" />
                Calculate Sortino Ratio
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
                  <CardTitle>Sortino Ratio Result</CardTitle>
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
                  {result.sortinoRatio.toFixed(3)}
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
                    <TrendingDown className="h-5 w-5 text-green-600" />
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
                  <TrendingDown className="h-8 w-8 mx-auto mb-2 text-primary" />
                  <p className="text-sm font-medium">Sharpe Ratio</p>
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
            Complete Guide to Sortino Ratio
          </CardTitle>
          <CardDescription>
            Everything you need to know about calculating and interpreting the Sortino ratio
          </CardDescription>
        </CardHeader>
        <CardContent className="space-y-4">
          <p className="text-muted-foreground">
            The Sortino Ratio is an enhanced risk-adjusted performance metric that focuses specifically on downside volatility, unlike the Sharpe ratio which considers all volatility. It's calculated as (Portfolio Return - Risk-Free Rate) ÷ Downside Deviation, providing a more targeted measure of downside risk management.
          </p>
          <p className="text-muted-foreground">
            This ratio is particularly valuable for investors who are more concerned about losses than volatility in general. It helps identify investments that provide good returns while minimizing downside risk, making it an essential tool for conservative investors and risk-averse portfolios.
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
            Common questions about Sortino Ratio
          </CardDescription>
        </CardHeader>
        <CardContent>
          <div className="space-y-6">
            <div>
              <h4 className="font-semibold text-lg mb-3">What is the Sortino Ratio?</h4>
              <p className="text-muted-foreground">
                The Sortino Ratio is a risk-adjusted performance metric that focuses specifically on downside volatility. It's calculated as (Portfolio Return - Risk-Free Rate) ÷ Downside Deviation. Unlike the Sharpe ratio, it only considers negative volatility, making it more relevant for investors concerned about losses.
              </p>
            </div>
            
            <div>
              <h4 className="font-semibold text-lg mb-3">How do I calculate the Sortino Ratio?</h4>
              <p className="text-muted-foreground">
                The formula is: Sortino Ratio = (Portfolio Return - Risk-Free Rate) ÷ Downside Deviation. Downside Deviation measures only the volatility of negative returns below a target return (usually the risk-free rate). This focuses the risk measurement on what investors typically want to avoid - losses.
              </p>
            </div>
            
            <div>
              <h4 className="font-semibold text-lg mb-3">What is considered a good Sortino Ratio?</h4>
              <p className="text-muted-foreground">
                Generally, a Sortino ratio above 1.5 is considered good, above 2 is excellent, and above 1 is acceptable. Since it focuses on downside risk, it's typically higher than Sharpe ratios for the same investment. The threshold depends on your risk tolerance and investment objectives.
              </p>
            </div>
            
            <div>
              <h4 className="font-semibold text-lg mb-3">How does the Sortino Ratio differ from the Sharpe Ratio?</h4>
              <p className="text-muted-foreground">
                The Sharpe ratio considers all volatility (both upside and downside), while the Sortino ratio only considers downside volatility. This makes the Sortino ratio more relevant for investors who are primarily concerned about losses rather than overall volatility. It typically provides higher values than the Sharpe ratio.
              </p>
            </div>
            
            <div>
              <h4 className="font-semibold text-lg mb-3">What does a high Sortino Ratio mean?</h4>
              <p className="text-muted-foreground">
                A high Sortino ratio indicates that the investment provides good returns relative to its downside risk. This suggests effective downside risk management and that the investment is achieving returns without exposing investors to significant losses. It's particularly valuable for conservative investors.
              </p>
            </div>
            
            <div>
              <h4 className="font-semibold text-lg mb-3">What does a low Sortino Ratio mean?</h4>
              <p className="text-muted-foreground">
                A low Sortino ratio indicates that the investment has high downside risk relative to its returns. This suggests that the investment may not be adequately compensating investors for the downside risk they're taking. It may indicate poor downside risk management or excessive risk-taking.
              </p>
            </div>
            
            <div>
              <h4 className="font-semibold text-lg mb-3">What are the limitations of the Sortino Ratio?</h4>
              <p className="text-muted-foreground">
                The Sortino ratio assumes that only downside volatility matters, which may not be true for all investors. It requires a target return to calculate downside deviation. It's based on historical data and may not predict future performance. It doesn't account for extreme tail risks or non-normal distributions.
              </p>
            </div>
            
            <div>
              <h4 className="font-semibold text-lg mb-3">How can I improve my Sortino Ratio?</h4>
              <p className="text-muted-foreground">
                You can improve the Sortino ratio by reducing downside volatility through better downside protection strategies, diversification, or hedging. Focus on investments that provide consistent returns with minimal downside risk. Consider strategies that limit losses while maintaining upside potential.
              </p>
            </div>
            
            <div>
              <h4 className="font-semibold text-lg mb-3">Why is the Sortino Ratio important for portfolio management?</h4>
              <p className="text-muted-foreground">
                The Sortino ratio is crucial for portfolio management as it helps optimize the risk-return trade-off specifically for downside risk. It guides asset allocation decisions, helps identify investments with good downside protection, and provides a standardized way to compare strategies based on downside risk management.
              </p>
            </div>
            
            <div>
              <h4 className="font-semibold text-lg mb-3">How do institutional investors use the Sortino Ratio?</h4>
              <p className="text-muted-foreground">
                Institutional investors use the Sortino ratio to evaluate fund managers' downside risk management, compare investment strategies, and optimize portfolio allocation. It's particularly important for pension funds, endowments, and other institutions with fiduciary responsibilities to protect capital while generating returns.
              </p>
            </div>
          </div>
        </CardContent>
      </Card>
    </div>
  );
}
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
  beta: z.number(),
  marketReturn: z.number(),
});

type FormValues = z.infer<typeof formSchema>;

export default function AlphaInvestmentCalculator() {
  const [result, setResult] = useState<{ 
    alpha: number; 
    interpretation: string; 
    performanceLevel: string;
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
      marketReturn: undefined,
    },
  });

  const calculate = (v: FormValues) => {
    if (v.portfolioReturn == null || v.riskFreeRate == null || v.beta == null || v.marketReturn == null) return null;
    const rp = v.portfolioReturn / 100;
    const rf = v.riskFreeRate / 100;
    const beta = v.beta;
    const rm = v.marketReturn / 100;

    const expectedReturn = rf + beta * (rm - rf);
    const alpha = (rp - expectedReturn) * 100;
    
    return alpha;
  };

  const interpret = (alpha: number) => {
    if (alpha >= 5) return 'Excellent alpha generation with superior risk-adjusted performance.';
    if (alpha >= 2) return 'Good alpha generation with solid risk-adjusted performance.';
    if (alpha >= 0) return 'Adequate alpha generation but room for improvement.';
    if (alpha >= -2) return 'Poor alpha generation - underperforming expected returns.';
    return 'Very poor alpha generation - significant underperformance.';
  };

  const getPerformanceLevel = (alpha: number) => {
    if (alpha >= 5) return 'Excellent';
    if (alpha >= 2) return 'Good';
    if (alpha >= 0) return 'Adequate';
    if (alpha >= -2) return 'Poor';
    return 'Very Poor';
  };

  const getRecommendation = (alpha: number) => {
    if (alpha >= 5) return 'Maintain current strategy - excellent alpha generation.';
    if (alpha >= 2) return 'Continue current approach with minor optimizations.';
    if (alpha >= 0) return 'Focus on improving alpha generation through better stock selection.';
    if (alpha >= -2) return 'Urgent need to improve investment strategy and stock selection.';
    return 'Critical situation - immediate investment strategy overhaul required.';
  };

  const getStrength = (alpha: number) => {
    if (alpha >= 5) return 'Very Strong';
    if (alpha >= 2) return 'Strong';
    if (alpha >= 0) return 'Moderate';
    if (alpha >= -2) return 'Weak';
    return 'Very Weak';
  };

  const getInsights = (alpha: number) => {
    const insights = [];
    if (alpha >= 5) {
      insights.push('Exceptional stock selection ability');
      insights.push('Superior risk-adjusted performance');
      insights.push('Excellent market timing skills');
    } else if (alpha >= 2) {
      insights.push('Strong stock selection ability');
      insights.push('Good risk-adjusted performance');
      insights.push('Solid market timing skills');
    } else if (alpha >= 0) {
      insights.push('Adequate stock selection ability');
      insights.push('Room for performance improvement');
      insights.push('Monitor market timing decisions');
    } else if (alpha >= -2) {
      insights.push('Poor stock selection ability');
      insights.push('Underperforming expected returns');
      insights.push('Urgent need for strategy improvement');
    } else {
      insights.push('Very poor stock selection ability');
      insights.push('Significant underperformance');
      insights.push('Critical strategy issues');
    }
    return insights;
  };

  const getConsiderations = (alpha: number) => {
    const considerations = [];
    considerations.push('Alpha assumes CAPM model validity');
    considerations.push('Historical performance may not predict future results');
    considerations.push('Beta may not capture all systematic risks');
    considerations.push('Compare with appropriate benchmarks');
    considerations.push('Consider market conditions and investment horizon');
    return considerations;
  };

  const onSubmit = (values: FormValues) => {
    const alpha = calculate(values);
    if (alpha !== null) {
      setResult({
        alpha,
        interpretation: interpret(alpha),
        performanceLevel: getPerformanceLevel(alpha),
        recommendation: getRecommendation(alpha),
        strength: getStrength(alpha),
        insights: getInsights(alpha),
        considerations: getConsiderations(alpha)
      });
    }
  };

  return (
    <div className="space-y-8">
      <Card>
        <CardHeader>
          <div className="flex items-center gap-2">
            <TrendingUp className="h-6 w-6 text-primary" />
            <CardTitle>Alpha Investment Calculator</CardTitle>
          </div>
          <CardDescription>
            Calculate your portfolio's alpha to assess risk-adjusted performance and stock selection ability
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
                      <BarChart3 className="h-4 w-4" />
                      Beta (Systematic Risk)
                    </FormLabel>
                    <FormControl>
                      <Input type="number" placeholder="Enter beta" {...field} value={field.value ?? ''} onChange={e => field.onChange(parseFloat(e.target.value) || undefined)} />
                    </FormControl>
                    <FormMessage />
                  </FormItem>
                )} />
                <FormField control={form.control} name="marketReturn" render={({ field }) => (
                  <FormItem>
                    <FormLabel className="flex items-center gap-2">
                      <Activity className="h-4 w-4" />
                      Market Return (%)
                    </FormLabel>
                    <FormControl>
                      <Input type="number" placeholder="Enter market return" {...field} value={field.value ?? ''} onChange={e => field.onChange(parseFloat(e.target.value) || undefined)} />
                    </FormControl>
                    <FormMessage />
                  </FormItem>
                )} />
              </div>
              <Button type="submit" className="w-full">
                <Calculator className="h-4 w-4 mr-2" />
                Calculate Alpha
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
                  <CardTitle>Alpha Result</CardTitle>
                </div>
                <div className="flex gap-2">
                  <Badge variant={result.performanceLevel === 'Excellent' ? 'default' : result.performanceLevel === 'Good' ? 'secondary' : 'destructive'}>
                    {result.performanceLevel}
                  </Badge>
                  <Badge variant="outline">{result.strength}</Badge>
                </div>
              </div>
            </CardHeader>
            <CardContent>
              <div className="text-center space-y-4">
                <div className="text-4xl font-bold text-primary">
                  {result.alpha.toFixed(2)}%
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
            <Link href="/category/finance/beta-asset-calculator" className="group">
              <Card className="group-hover:shadow-md transition-shadow">
                <CardContent className="p-4 text-center">
                  <BarChart3 className="h-8 w-8 mx-auto mb-2 text-primary" />
                  <p className="text-sm font-medium">Beta Asset</p>
                </CardContent>
              </Card>
            </Link>
            <Link href="/category/finance/sharpe-ratio-calculator" className="group">
              <Card className="group-hover:shadow-md transition-shadow">
                <CardContent className="p-4 text-center">
                  <TrendingUp className="h-8 w-8 mx-auto mb-2 text-primary" />
                  <p className="text-sm font-medium">Sharpe Ratio</p>
                </CardContent>
              </Card>
            </Link>
            <Link href="/category/finance/treynor-ratio-calculator" className="group">
              <Card className="group-hover:shadow-md transition-shadow">
                <CardContent className="p-4 text-center">
                  <Activity className="h-8 w-8 mx-auto mb-2 text-primary" />
                  <p className="text-sm font-medium">Treynor Ratio</p>
                </CardContent>
              </Card>
            </Link>
            <Link href="/category/finance/volatility-standard-deviation-calculator" className="group">
              <Card className="group-hover:shadow-md transition-shadow">
                <CardContent className="p-4 text-center">
                  <Shield className="h-8 w-8 mx-auto mb-2 text-primary" />
                  <p className="text-sm font-medium">Volatility</p>
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
            Complete Guide to Alpha Investment
          </CardTitle>
          <CardDescription>
            Everything you need to know about calculating and interpreting alpha
          </CardDescription>
        </CardHeader>
        <CardContent className="space-y-4">
          <p className="text-muted-foreground">
            Alpha is a measure of investment performance that indicates how much a portfolio's returns exceed or fall short of the expected returns based on its risk level (beta). It's calculated as the difference between the actual portfolio return and the expected return predicted by the Capital Asset Pricing Model (CAPM).
          </p>
          <p className="text-muted-foreground">
            Positive alpha indicates superior performance after adjusting for risk, suggesting effective stock selection or market timing. Negative alpha indicates underperformance relative to the risk taken. Alpha is a crucial metric for evaluating fund managers and investment strategies.
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
            Common questions about Alpha Investment
          </CardDescription>
        </CardHeader>
        <CardContent>
          <div className="space-y-6">
            <div>
              <h4 className="font-semibold text-lg mb-3">What is Alpha in investing?</h4>
              <p className="text-muted-foreground">
                Alpha is a measure of investment performance that indicates how much a portfolio's returns exceed or fall short of the expected returns based on its risk level. It's calculated as Actual Return - Expected Return (based on CAPM). Positive alpha indicates superior risk-adjusted performance.
              </p>
            </div>
            
            <div>
              <h4 className="font-semibold text-lg mb-3">How do I calculate Alpha?</h4>
              <p className="text-muted-foreground">
                The formula is: Alpha = Portfolio Return - (Risk-Free Rate + Beta × (Market Return - Risk-Free Rate)). This compares the actual portfolio return to the expected return predicted by the CAPM model. The result shows how much the portfolio outperformed or underperformed relative to its risk level.
              </p>
            </div>
            
            <div>
              <h4 className="font-semibold text-lg mb-3">What is considered good Alpha?</h4>
              <p className="text-muted-foreground">
                Generally, alpha above 2% is considered good, above 5% is excellent, and above 0% is acceptable. Negative alpha indicates underperformance. However, what's considered good varies by market conditions, investment strategy, and risk tolerance. Compare alpha to appropriate benchmarks.
              </p>
            </div>
            
            <div>
              <h4 className="font-semibold text-lg mb-3">What does positive Alpha mean?</h4>
              <p className="text-muted-foreground">
                Positive alpha means the portfolio is outperforming its expected return based on its risk level. This indicates superior stock selection, market timing, or risk management. It suggests the investment strategy is adding value beyond what would be expected given the portfolio's systematic risk.
              </p>
            </div>
            
            <div>
              <h4 className="font-semibold text-lg mb-3">What does negative Alpha mean?</h4>
              <p className="text-muted-foreground">
                Negative alpha means the portfolio is underperforming its expected return based on its risk level. This indicates poor stock selection, market timing, or risk management. It suggests the investment strategy is destroying value relative to what would be expected given the portfolio's systematic risk.
              </p>
            </div>
            
            <div>
              <h4 className="font-semibold text-lg mb-3">How does Alpha differ from Beta?</h4>
              <p className="text-muted-foreground">
                Beta measures systematic risk relative to the market, while alpha measures risk-adjusted performance. Beta tells you how much the portfolio moves with the market, while alpha tells you how much value the portfolio manager is adding or subtracting through their investment decisions.
              </p>
            </div>
            
            <div>
              <h4 className="font-semibold text-lg mb-3">What are the limitations of Alpha?</h4>
              <p className="text-muted-foreground">
                Alpha assumes the CAPM model is valid and that beta accurately captures systematic risk. It's based on historical data and may not predict future performance. Alpha can be influenced by luck, market conditions, and measurement errors. It doesn't account for transaction costs or management fees.
              </p>
            </div>
            
            <div>
              <h4 className="font-semibold text-lg mb-3">How can I improve my Alpha?</h4>
              <p className="text-muted-foreground">
                You can improve alpha by improving stock selection through better fundamental analysis, enhancing market timing decisions, reducing transaction costs, or implementing more sophisticated risk management strategies. Focus on investments that provide returns above what would be expected given their risk level.
              </p>
            </div>
            
            <div>
              <h4 className="font-semibold text-lg mb-3">Why is Alpha important for investors?</h4>
              <p className="text-muted-foreground">
                Alpha is crucial for investors as it measures the value added by active management. It helps evaluate fund managers, compare investment strategies, and assess whether active management is worth the additional costs. Positive alpha justifies higher fees, while negative alpha suggests passive investing might be better.
              </p>
            </div>
            
            <div>
              <h4 className="font-semibold text-lg mb-3">How do fund managers use Alpha?</h4>
              <p className="text-muted-foreground">
                Fund managers use alpha to evaluate their performance, justify their fees, and improve their investment strategies. They track alpha over time to identify what's working and what isn't. Alpha helps them communicate their value proposition to investors and benchmark their performance against competitors.
              </p>
            </div>
          </div>
        </CardContent>
      </Card>
    </div>
  );
}
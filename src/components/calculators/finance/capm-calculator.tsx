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
  riskFreeRate: z.number(),
  beta: z.number(),
  marketReturn: z.number(),
});

type FormValues = z.infer<typeof formSchema>;

export default function CAPMCalculator() {
  const [result, setResult] = useState<{ 
    expectedReturn: number; 
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
      riskFreeRate: undefined,
      beta: undefined,
      marketReturn: undefined,
    },
  });

  const calculateCAPM = (v: FormValues) => {
    if (v.riskFreeRate == null || v.beta == null || v.marketReturn == null) return null;
    return v.riskFreeRate + v.beta * (v.marketReturn - v.riskFreeRate);
  };

  const interpret = (expectedReturn: number) => {
    if (expectedReturn >= 15) return 'High expected return - high-risk investment with significant growth potential.';
    if (expectedReturn >= 10) return 'Moderate expected return - balanced risk-return profile.';
    if (expectedReturn >= 5) return 'Conservative expected return - lower risk with modest growth expectations.';
    if (expectedReturn >= 0) return 'Low expected return - very conservative investment.';
    return 'Negative expected return - investment may not meet objectives.';
  };

  const getRiskLevel = (expectedReturn: number) => {
    if (expectedReturn >= 15) return 'High';
    if (expectedReturn >= 10) return 'Moderate';
    if (expectedReturn >= 5) return 'Conservative';
    if (expectedReturn >= 0) return 'Low';
    return 'Negative';
  };

  const getRecommendation = (expectedReturn: number) => {
    if (expectedReturn >= 15) return 'Monitor risk levels closely - high returns come with higher risk.';
    if (expectedReturn >= 10) return 'Maintain balanced approach - good risk-return profile.';
    if (expectedReturn >= 5) return 'Consider if returns meet your investment objectives.';
    if (expectedReturn >= 0) return 'Review investment strategy - returns may be too conservative.';
    return 'Urgent review needed - investment not meeting expectations.';
  };

  const getStrength = (expectedReturn: number) => {
    if (expectedReturn >= 15) return 'Strong';
    if (expectedReturn >= 10) return 'Good';
    if (expectedReturn >= 5) return 'Moderate';
    if (expectedReturn >= 0) return 'Weak';
    return 'Very Weak';
  };

  const getInsights = (expectedReturn: number) => {
    const insights = [];
    if (expectedReturn >= 15) {
      insights.push('High growth potential');
      insights.push('Significant risk exposure');
      insights.push('Aggressive investment profile');
    } else if (expectedReturn >= 10) {
      insights.push('Balanced growth potential');
      insights.push('Moderate risk exposure');
      insights.push('Well-balanced investment profile');
    } else if (expectedReturn >= 5) {
      insights.push('Conservative growth potential');
      insights.push('Lower risk exposure');
      insights.push('Stable investment profile');
    } else if (expectedReturn >= 0) {
      insights.push('Limited growth potential');
      insights.push('Minimal risk exposure');
      insights.push('Very conservative profile');
    } else {
      insights.push('Negative growth potential');
      insights.push('Underperforming investment');
      insights.push('Below-expectation returns');
    }
    return insights;
  };

  const getConsiderations = (expectedReturn: number) => {
    const considerations = [];
    considerations.push('CAPM assumes efficient markets');
    considerations.push('Beta may not capture all risks');
    considerations.push('Historical data may not predict future');
    considerations.push('Market conditions affect results');
    considerations.push('Consider your risk tolerance');
    return considerations;
  };

  const onSubmit = (values: FormValues) => {
    const expectedReturn = calculateCAPM(values);
    if (expectedReturn !== null) {
      setResult({
        expectedReturn,
        interpretation: interpret(expectedReturn),
        riskLevel: getRiskLevel(expectedReturn),
        recommendation: getRecommendation(expectedReturn),
        strength: getStrength(expectedReturn),
        insights: getInsights(expectedReturn),
        considerations: getConsiderations(expectedReturn)
      });
    }
  };

  return (
    <div className="space-y-8">
      <Card>
        <CardHeader>
          <div className="flex items-center gap-2">
            <BarChart3 className="h-6 w-6 text-primary" />
            <CardTitle>Capital Asset Pricing Model (CAPM) Calculator</CardTitle>
          </div>
          <CardDescription>
            Calculate expected return using the Capital Asset Pricing Model based on risk-free rate, beta, and market return
          </CardDescription>
        </CardHeader>
        <CardContent>
          <Form {...form}>
            <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-6">
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
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
                <FormField control={form.control} name="marketReturn" render={({ field }) => (
                  <FormItem>
                    <FormLabel className="flex items-center gap-2">
                      <TrendingUp className="h-4 w-4" />
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
                Calculate Expected Return
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
                  <CardTitle>CAPM Expected Return Result</CardTitle>
                </div>
                <div className="flex gap-2">
                  <Badge variant={result.riskLevel === 'High' ? 'default' : result.riskLevel === 'Moderate' ? 'secondary' : 'destructive'}>
                    {result.riskLevel}
                  </Badge>
                  <Badge variant="outline">{result.strength}</Badge>
                </div>
              </div>
            </CardHeader>
            <CardContent>
              <div className="text-center space-y-4">
                <div className="text-4xl font-bold text-primary">
                  {result.expectedReturn.toFixed(2)}%
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
            <Link href="/category/finance/portfolio-expected-return-calculator" className="group">
              <Card className="group-hover:shadow-md transition-shadow">
                <CardContent className="p-4 text-center">
                  <TrendingUp className="h-8 w-8 mx-auto mb-2 text-primary" />
                  <p className="text-sm font-medium">Portfolio Expected Return</p>
                </CardContent>
              </Card>
            </Link>
            <Link href="/category/finance/beta-asset-calculator" className="group">
              <Card className="group-hover:shadow-md transition-shadow">
                <CardContent className="p-4 text-center">
                  <Activity className="h-8 w-8 mx-auto mb-2 text-primary" />
                  <p className="text-sm font-medium">Beta Asset</p>
                </CardContent>
              </Card>
            </Link>
            <Link href="/category/finance/alpha-investment-calculator" className="group">
              <Card className="group-hover:shadow-md transition-shadow">
                <CardContent className="p-4 text-center">
                  <BarChart3 className="h-8 w-8 mx-auto mb-2 text-primary" />
                  <p className="text-sm font-medium">Alpha Investment</p>
                </CardContent>
              </Card>
            </Link>
            <Link href="/category/finance/sharpe-ratio-calculator" className="group">
              <Card className="group-hover:shadow-md transition-shadow">
                <CardContent className="p-4 text-center">
                  <Shield className="h-8 w-8 mx-auto mb-2 text-primary" />
                  <p className="text-sm font-medium">Sharpe Ratio</p>
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
            Complete Guide to CAPM
          </CardTitle>
          <CardDescription>
            Everything you need to know about calculating and interpreting CAPM
          </CardDescription>
        </CardHeader>
        <CardContent className="space-y-4">
          <p className="text-muted-foreground">
            The Capital Asset Pricing Model (CAPM) is a fundamental financial model that calculates the expected return of an asset based on its systematic risk (beta), the risk-free rate, and the expected market return. The formula is: Expected Return = Risk-Free Rate + Beta × (Market Return - Risk-Free Rate).
          </p>
          <p className="text-muted-foreground">
            CAPM is widely used in portfolio management, investment analysis, and corporate finance for determining appropriate discount rates, evaluating investment opportunities, and assessing risk-adjusted returns. It provides a systematic way to price risk and determine expected returns.
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
            Common questions about CAPM
          </CardDescription>
        </CardHeader>
        <CardContent>
          <div className="space-y-6">
            <div>
              <h4 className="font-semibold text-lg mb-3">What is CAPM?</h4>
              <p className="text-muted-foreground">
                The Capital Asset Pricing Model (CAPM) is a financial model that calculates the expected return of an asset based on its systematic risk. The formula is: Expected Return = Risk-Free Rate + Beta × (Market Return - Risk-Free Rate). It's used to determine appropriate returns for investments based on their risk level.
              </p>
            </div>
            
            <div>
              <h4 className="font-semibold text-lg mb-3">How do I calculate CAPM?</h4>
              <p className="text-muted-foreground">
                The CAPM formula is: E(R) = Rf + β × (Rm - Rf), where E(R) is expected return, Rf is risk-free rate, β is beta (systematic risk), and Rm is market return. You need the risk-free rate (typically government bond yield), the asset's beta, and the expected market return to calculate the expected return.
              </p>
            </div>
            
            <div>
              <h4 className="font-semibold text-lg mb-3">What is the risk-free rate?</h4>
              <p className="text-muted-foreground">
                The risk-free rate is the return on an investment with no risk of financial loss. It's typically represented by the yield on government bonds (like US Treasury bills). This rate serves as the baseline return that investors can earn without taking any risk.
              </p>
            </div>
            
            <div>
              <h4 className="font-semibold text-lg mb-3">What is beta in CAPM?</h4>
              <p className="text-muted-foreground">
                Beta measures the systematic risk of an asset relative to the market. A beta of 1 means the asset moves with the market, a beta greater than 1 means it's more volatile than the market, and a beta less than 1 means it's less volatile. Beta is calculated using historical price data.
              </p>
            </div>
            
            <div>
              <h4 className="font-semibold text-lg mb-3">What are the assumptions of CAPM?</h4>
              <p className="text-muted-foreground">
                CAPM assumes efficient markets, rational investors, no transaction costs, unlimited borrowing and lending at the risk-free rate, and that all investors have the same expectations. These assumptions are often criticized as unrealistic, but CAPM remains widely used despite its limitations.
              </p>
            </div>
            
            <div>
              <h4 className="font-semibold text-lg mb-3">How is CAPM used in practice?</h4>
              <p className="text-muted-foreground">
                CAPM is used to determine discount rates for valuation, evaluate investment performance, assess risk-adjusted returns, and make portfolio allocation decisions. It's commonly used in corporate finance for project evaluation and in portfolio management for risk assessment and performance measurement.
              </p>
            </div>
            
            <div>
              <h4 className="font-semibold text-lg mb-3">What are the limitations of CAPM?</h4>
              <p className="text-muted-foreground">
                CAPM has several limitations: it assumes efficient markets, relies on historical beta which may not predict future risk, doesn't account for unsystematic risk, and assumes investors can borrow unlimited amounts at the risk-free rate. These assumptions often don't hold in real markets.
              </p>
            </div>
            
            <div>
              <h4 className="font-semibold text-lg mb-3">How does CAPM relate to portfolio theory?</h4>
              <p className="text-muted-foreground">
                CAPM is an extension of Modern Portfolio Theory. It provides a way to determine the expected return of individual assets based on their contribution to portfolio risk. CAPM helps investors understand the relationship between risk and return and make informed investment decisions.
              </p>
            </div>
            
            <div>
              <h4 className="font-semibold text-lg mb-3">Why is CAPM important for investors?</h4>
              <p className="text-muted-foreground">
                CAPM is important for investors as it provides a systematic way to assess risk and determine appropriate returns. It helps evaluate whether investments are fairly priced, assess portfolio performance, and make informed decisions about risk-return trade-offs. It's a fundamental tool in investment analysis.
              </p>
            </div>
            
            <div>
              <h4 className="font-semibold text-lg mb-3">How do I interpret CAPM results?</h4>
              <p className="text-muted-foreground">
                Higher CAPM expected returns indicate higher risk investments. Compare the CAPM expected return to actual returns to assess performance. If actual returns exceed CAPM expected returns, the investment is outperforming relative to its risk. Use CAPM results as a benchmark for investment evaluation.
              </p>
            </div>
          </div>
        </CardContent>
      </Card>
    </div>
  );
}
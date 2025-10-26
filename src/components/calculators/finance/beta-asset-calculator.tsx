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
  assetReturns: z.string().min(1, 'At least one return value is required'),
  marketReturns: z.string().min(1, 'At least one return value is required'),
});

type FormValues = z.infer<typeof formSchema>;

export default function BetaAssetCalculator() {
  const [result, setResult] = useState<{ 
    beta: number; 
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
      assetReturns: '',
      marketReturns: '',
    },
  });

  const calculateBeta = (assetReturnsString: string, marketReturnsString: string) => {
    const assetReturns = assetReturnsString.split(',').map(r => parseFloat(r.trim())).filter(r => !isNaN(r));
    const marketReturns = marketReturnsString.split(',').map(r => parseFloat(r.trim())).filter(r => !isNaN(r));
    
    if (assetReturns.length < 2 || marketReturns.length < 2 || assetReturns.length !== marketReturns.length) return null;

    const assetMean = assetReturns.reduce((sum, r) => sum + r, 0) / assetReturns.length;
    const marketMean = marketReturns.reduce((sum, r) => sum + r, 0) / marketReturns.length;

    let covariance = 0;
    let marketVariance = 0;

    for (let i = 0; i < assetReturns.length; i++) {
      const assetDiff = assetReturns[i] - assetMean;
      const marketDiff = marketReturns[i] - marketMean;
      covariance += assetDiff * marketDiff;
      marketVariance += marketDiff * marketDiff;
    }

    const beta = marketVariance === 0 ? 0 : covariance / marketVariance;
    
    return beta;
  };

  const interpret = (beta: number) => {
    if (beta >= 2) return 'Very high systematic risk - asset is extremely sensitive to market movements.';
    if (beta >= 1.5) return 'High systematic risk - asset is highly sensitive to market movements.';
    if (beta >= 1) return 'Above-average systematic risk - asset moves more than the market.';
    if (beta >= 0.5) return 'Below-average systematic risk - asset moves less than the market.';
    if (beta >= 0) return 'Low systematic risk - asset has minimal sensitivity to market movements.';
    return 'Negative systematic risk - asset moves opposite to market movements.';
  };

  const getRiskLevel = (beta: number) => {
    if (beta >= 2) return 'Very High';
    if (beta >= 1.5) return 'High';
    if (beta >= 1) return 'Above Average';
    if (beta >= 0.5) return 'Below Average';
    if (beta >= 0) return 'Low';
    return 'Negative';
  };

  const getRecommendation = (beta: number) => {
    if (beta >= 2) return 'Consider reducing position size - very high market sensitivity.';
    if (beta >= 1.5) return 'Monitor closely - high market sensitivity requires careful risk management.';
    if (beta >= 1) return 'Suitable for growth portfolios - above-average market sensitivity.';
    if (beta >= 0.5) return 'Good for balanced portfolios - moderate market sensitivity.';
    if (beta >= 0) return 'Excellent for conservative portfolios - low market sensitivity.';
    return 'Consider for hedging strategies - negative market sensitivity.';
  };

  const getStrength = (beta: number) => {
    if (beta >= 2) return 'Very Weak';
    if (beta >= 1.5) return 'Weak';
    if (beta >= 1) return 'Moderate';
    if (beta >= 0.5) return 'Strong';
    if (beta >= 0) return 'Very Strong';
    return 'Special';
  };

  const getInsights = (beta: number) => {
    const insights = [];
    if (beta >= 2) {
      insights.push('Extremely high market sensitivity');
      insights.push('Significant systematic risk exposure');
      insights.push('Potential for large gains or losses');
    } else if (beta >= 1.5) {
      insights.push('High market sensitivity');
      insights.push('Substantial systematic risk exposure');
      insights.push('Potential for significant price swings');
    } else if (beta >= 1) {
      insights.push('Above-average market sensitivity');
      insights.push('Moderate systematic risk exposure');
      insights.push('Moves more than market average');
    } else if (beta >= 0.5) {
      insights.push('Below-average market sensitivity');
      insights.push('Lower systematic risk exposure');
      insights.push('Moves less than market average');
    } else if (beta >= 0) {
      insights.push('Low market sensitivity');
      insights.push('Minimal systematic risk exposure');
      insights.push('Stable relative to market');
    } else {
      insights.push('Negative market sensitivity');
      insights.push('Moves opposite to market');
      insights.push('Potential hedging characteristics');
    }
    return insights;
  };

  const getConsiderations = (beta: number) => {
    const considerations = [];
    considerations.push('Beta can change over time');
    considerations.push('Historical beta may not predict future beta');
    considerations.push('Beta assumes CAPM model validity');
    considerations.push('Consider market conditions and economic cycles');
    considerations.push('Beta is just one measure of risk');
    return considerations;
  };

  const onSubmit = (values: FormValues) => {
    const beta = calculateBeta(values.assetReturns, values.marketReturns);
    if (beta !== null) {
      setResult({
        beta,
        interpretation: interpret(beta),
        riskLevel: getRiskLevel(beta),
        recommendation: getRecommendation(beta),
        strength: getStrength(beta),
        insights: getInsights(beta),
        considerations: getConsiderations(beta)
      });
    }
  };

  return (
    <div className="space-y-8">
      <Card>
        <CardHeader>
          <div className="flex items-center gap-2">
            <BarChart3 className="h-6 w-6 text-primary" />
            <CardTitle>Beta Asset Calculator</CardTitle>
          </div>
          <CardDescription>
            Calculate your asset's beta to assess systematic risk and market sensitivity
          </CardDescription>
        </CardHeader>
        <CardContent>
      <Form {...form}>
        <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-6">
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <FormField control={form.control} name="assetReturns" render={({ field }) => (
              <FormItem>
                    <FormLabel className="flex items-center gap-2">
                      <DollarSign className="h-4 w-4" />
                      Asset Returns (%)
                    </FormLabel>
                <FormControl>
                      <Input 
                        type="text" 
                        placeholder="Enter asset returns separated by commas" 
                        {...field} 
                      />
                </FormControl>
                <FormMessage />
              </FormItem>
            )} />
                <FormField control={form.control} name="marketReturns" render={({ field }) => (
              <FormItem>
                    <FormLabel className="flex items-center gap-2">
                      <TrendingUp className="h-4 w-4" />
                      Market Returns (%)
                    </FormLabel>
                <FormControl>
                      <Input 
                        type="text" 
                        placeholder="Enter market returns separated by commas" 
                        {...field} 
                      />
                </FormControl>
                <FormMessage />
              </FormItem>
            )} />
          </div>
              <p className="text-sm text-muted-foreground">
                Enter the same number of return values for both asset and market. Values should be separated by commas (e.g., 5.2, -3.1, 8.7, 2.4).
              </p>
              <Button type="submit" className="w-full">
                <Calculator className="h-4 w-4 mr-2" />
                Calculate Beta
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
                  <CardTitle>Beta Result</CardTitle>
                </div>
                <div className="flex gap-2">
                  <Badge variant={result.riskLevel === 'Low' ? 'default' : result.riskLevel === 'Below Average' ? 'secondary' : 'destructive'}>
                    {result.riskLevel}
                  </Badge>
                  <Badge variant="outline">{result.strength}</Badge>
                </div>
            </div>
          </CardHeader>
          <CardContent>
              <div className="text-center space-y-4">
                <div className="text-4xl font-bold text-primary">
                  {result.beta.toFixed(3)}
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
            <Link href="/category/finance/alpha-investment-calculator" className="group">
              <Card className="group-hover:shadow-md transition-shadow">
                <CardContent className="p-4 text-center">
                  <TrendingUp className="h-8 w-8 mx-auto mb-2 text-primary" />
                  <p className="text-sm font-medium">Alpha Investment</p>
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
            <Link href="/category/finance/correlation-coefficient-calculator" className="group">
              <Card className="group-hover:shadow-md transition-shadow">
                <CardContent className="p-4 text-center">
                  <BarChart3 className="h-8 w-8 mx-auto mb-2 text-primary" />
                  <p className="text-sm font-medium">Correlation</p>
                </CardContent>
              </Card>
            </Link>
            <Link href="/category/finance/portfolio-variance-calculator" className="group">
              <Card className="group-hover:shadow-md transition-shadow">
                <CardContent className="p-4 text-center">
                  <Shield className="h-8 w-8 mx-auto mb-2 text-primary" />
                  <p className="text-sm font-medium">Portfolio Variance</p>
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
            Complete Guide to Beta Asset
          </CardTitle>
          <CardDescription>
            Everything you need to know about calculating and interpreting beta
          </CardDescription>
        </CardHeader>
        <CardContent className="space-y-4">
          <p className="text-muted-foreground">
            Beta is a measure of systematic risk that indicates how much an asset's price moves relative to the overall market. It's calculated as the covariance between the asset's returns and market returns divided by the variance of market returns. Beta helps investors understand an asset's sensitivity to market movements.
          </p>
          <p className="text-muted-foreground">
            Understanding beta is crucial for portfolio construction, risk management, and investment decision-making. It helps investors assess how much systematic risk they're taking and make informed decisions about asset allocation based on their risk tolerance and investment objectives.
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
            Common questions about Beta Asset
          </CardDescription>
        </CardHeader>
        <CardContent>
          <div className="space-y-6">
            <div>
              <h4 className="font-semibold text-lg mb-3">What is Beta?</h4>
              <p className="text-muted-foreground">
                Beta is a measure of systematic risk that indicates how much an asset's price moves relative to the overall market. It's calculated as the covariance between the asset's returns and market returns divided by the variance of market returns. Beta helps investors understand an asset's sensitivity to market movements.
              </p>
            </div>
            
            <div>
              <h4 className="font-semibold text-lg mb-3">How do I calculate Beta?</h4>
              <p className="text-muted-foreground">
                Beta is calculated as: Beta = Covariance(Asset Returns, Market Returns) ÷ Variance(Market Returns). This measures how much the asset's returns change relative to market returns. A beta of 1 means the asset moves with the market, while a beta of 2 means it moves twice as much as the market.
              </p>
            </div>
            
            <div>
              <h4 className="font-semibold text-lg mb-3">What does a Beta of 1 mean?</h4>
              <p className="text-muted-foreground">
                A beta of 1 means the asset moves exactly with the market. If the market goes up 10%, the asset is expected to go up 10%. If the market goes down 10%, the asset is expected to go down 10%. This represents average market sensitivity and systematic risk.
              </p>
            </div>
            
            <div>
              <h4 className="font-semibold text-lg mb-3">What does a Beta greater than 1 mean?</h4>
              <p className="text-muted-foreground">
                A beta greater than 1 means the asset is more volatile than the market. If beta is 1.5, the asset is expected to move 1.5 times as much as the market. This indicates higher systematic risk and greater sensitivity to market movements, potentially offering higher returns but with more risk.
              </p>
            </div>
            
            <div>
              <h4 className="font-semibold text-lg mb-3">What does a Beta less than 1 mean?</h4>
              <p className="text-muted-foreground">
                A beta less than 1 means the asset is less volatile than the market. If beta is 0.5, the asset is expected to move half as much as the market. This indicates lower systematic risk and less sensitivity to market movements, offering more stability but potentially lower returns.
              </p>
            </div>
            
            <div>
              <h4 className="font-semibold text-lg mb-3">What does negative Beta mean?</h4>
              <p className="text-muted-foreground">
                Negative beta means the asset moves opposite to the market. When the market goes up, the asset goes down, and vice versa. This is rare but can occur with certain defensive assets or hedging instruments. Negative beta assets can provide portfolio protection during market downturns.
              </p>
            </div>
            
            <div>
              <h4 className="font-semibold text-lg mb-3">What are the limitations of Beta?</h4>
              <p className="text-muted-foreground">
                Beta assumes the CAPM model is valid and that past relationships will continue. It only measures systematic risk and ignores unsystematic risk. Beta can change over time and may not capture all market relationships. It's based on historical data and may not predict future performance.
              </p>
            </div>
            
            <div>
              <h4 className="font-semibold text-lg mb-3">How can I use Beta in portfolio construction?</h4>
              <p className="text-muted-foreground">
                Use beta to assess systematic risk and build portfolios that match your risk tolerance. High beta assets for growth portfolios, low beta assets for conservative portfolios. Consider beta when determining position sizes and asset allocation. Use beta to understand how your portfolio will respond to market movements.
              </p>
            </div>
            
            <div>
              <h4 className="font-semibold text-lg mb-3">Why is Beta important for investors?</h4>
              <p className="text-muted-foreground">
                Beta is crucial for investors as it helps assess systematic risk and market sensitivity. It guides portfolio construction, risk management, and investment decisions. Understanding beta helps investors build portfolios that match their risk tolerance and investment objectives while managing exposure to market movements.
              </p>
            </div>
            
            <div>
              <h4 className="font-semibold text-lg mb-3">How do institutional investors use Beta?</h4>
              <p className="text-muted-foreground">
                Institutional investors use beta for portfolio optimization, risk management, and performance evaluation. They set beta targets, use beta-based position sizing, and implement beta hedging strategies. Beta helps them assess systematic risk exposure and make informed decisions about asset allocation and risk management.
              </p>
            </div>
          </div>
        </CardContent>
      </Card>
    </div>
  );
}
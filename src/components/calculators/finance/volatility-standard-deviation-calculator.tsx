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
  returns: z.string().min(1, 'At least one return value is required'),
});

type FormValues = z.infer<typeof formSchema>;

export default function VolatilityStandardDeviationCalculator() {
  const [result, setResult] = useState<{ 
    volatility: number; 
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
      returns: '',
    },
  });

  const calculateVolatility = (returnsString: string) => {
    const returns = returnsString.split(',').map(r => parseFloat(r.trim())).filter(r => !isNaN(r));
    if (returns.length < 2) return null;

    const mean = returns.reduce((sum, r) => sum + r, 0) / returns.length;
    const variance = returns.reduce((sum, r) => sum + Math.pow(r - mean, 2), 0) / (returns.length - 1);
    const volatility = Math.sqrt(variance);
    
    return volatility;
  };

  const interpret = (volatility: number) => {
    if (volatility >= 30) return 'Very high volatility - extremely risky investment with significant price swings.';
    if (volatility >= 20) return 'High volatility - risky investment with substantial price fluctuations.';
    if (volatility >= 10) return 'Moderate volatility - moderate risk with reasonable price stability.';
    if (volatility >= 5) return 'Low volatility - conservative investment with stable price movements.';
    return 'Very low volatility - very conservative investment with minimal price changes.';
  };

  const getRiskLevel = (volatility: number) => {
    if (volatility >= 30) return 'Very High';
    if (volatility >= 20) return 'High';
    if (volatility >= 10) return 'Moderate';
    if (volatility >= 5) return 'Low';
    return 'Very Low';
  };

  const getRecommendation = (volatility: number) => {
    if (volatility >= 30) return 'Consider reducing position size or implementing hedging strategies.';
    if (volatility >= 20) return 'Monitor closely and consider diversification to reduce risk.';
    if (volatility >= 10) return 'Maintain current strategy with regular risk monitoring.';
    if (volatility >= 5) return 'Consider increasing position size for potentially higher returns.';
    return 'Very stable investment - consider if returns meet your objectives.';
  };

  const getStrength = (volatility: number) => {
    if (volatility >= 30) return 'Very Weak';
    if (volatility >= 20) return 'Weak';
    if (volatility >= 10) return 'Moderate';
    if (volatility >= 5) return 'Strong';
    return 'Very Strong';
  };

  const getInsights = (volatility: number) => {
    const insights = [];
    if (volatility >= 30) {
      insights.push('Extremely high price volatility');
      insights.push('Significant investment risk');
      insights.push('Potential for large gains or losses');
    } else if (volatility >= 20) {
      insights.push('High price volatility');
      insights.push('Substantial investment risk');
      insights.push('Potential for significant price swings');
    } else if (volatility >= 10) {
      insights.push('Moderate price volatility');
      insights.push('Balanced risk-return profile');
      insights.push('Reasonable price stability');
    } else if (volatility >= 5) {
      insights.push('Low price volatility');
      insights.push('Conservative investment profile');
      insights.push('Stable price movements');
    } else {
      insights.push('Very low price volatility');
      insights.push('Very conservative investment');
      insights.push('Minimal price changes');
    }
    return insights;
  };

  const getConsiderations = (volatility: number) => {
    const considerations = [];
    considerations.push('Volatility varies by market conditions');
    considerations.push('Historical volatility may not predict future volatility');
    considerations.push('Consider your risk tolerance and investment horizon');
    considerations.push('Higher volatility often means higher potential returns');
    considerations.push('Diversification can help reduce portfolio volatility');
    return considerations;
  };

  const onSubmit = (values: FormValues) => {
    const volatility = calculateVolatility(values.returns);
    if (volatility !== null) {
      setResult({
        volatility,
        interpretation: interpret(volatility),
        riskLevel: getRiskLevel(volatility),
        recommendation: getRecommendation(volatility),
        strength: getStrength(volatility),
        insights: getInsights(volatility),
        considerations: getConsiderations(volatility)
      });
    }
  };

  return (
    <div className="space-y-8">
      <Card>
        <CardHeader>
          <div className="flex items-center gap-2">
            <BarChart3 className="h-6 w-6 text-primary" />
            <CardTitle>Volatility / Standard Deviation Calculator</CardTitle>
          </div>
          <CardDescription>
            Calculate your investment's volatility to assess risk and price stability
          </CardDescription>
        </CardHeader>
        <CardContent>
          <Form {...form}>
            <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-6">
              <FormField control={form.control} name="returns" render={({ field }) => (
                <FormItem>
                  <FormLabel className="flex items-center gap-2">
                    <DollarSign className="h-4 w-4" />
                    Historical Returns (%)
                  </FormLabel>
                  <FormControl>
                    <Input 
                      type="text" 
                      placeholder="Enter returns separated by commas (e.g., 5.2, -3.1, 8.7, 2.4)" 
                      {...field} 
                    />
                  </FormControl>
                  <FormMessage />
                  <p className="text-sm text-muted-foreground">
                    Enter at least 2 return values separated by commas. Include both positive and negative returns for accurate calculation.
                  </p>
                </FormItem>
              )} />
              <Button type="submit" className="w-full">
                <Calculator className="h-4 w-4 mr-2" />
                Calculate Volatility
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
                  <CardTitle>Volatility Result</CardTitle>
                </div>
                <div className="flex gap-2">
                  <Badge variant={result.riskLevel === 'Very Low' ? 'default' : result.riskLevel === 'Low' ? 'secondary' : 'destructive'}>
                    {result.riskLevel}
                  </Badge>
                  <Badge variant="outline">{result.strength}</Badge>
                </div>
              </div>
            </CardHeader>
            <CardContent>
              <div className="text-center space-y-4">
                <div className="text-4xl font-bold text-primary">
                  {result.volatility.toFixed(2)}%
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
            <Link href="/category/finance/alpha-investment-calculator" className="group">
              <Card className="group-hover:shadow-md transition-shadow">
                <CardContent className="p-4 text-center">
                  <TrendingUp className="h-8 w-8 mx-auto mb-2 text-primary" />
                  <p className="text-sm font-medium">Alpha Investment</p>
                </CardContent>
              </Card>
            </Link>
            <Link href="/category/finance/sharpe-ratio-calculator" className="group">
              <Card className="group-hover:shadow-md transition-shadow">
                <CardContent className="p-4 text-center">
                  <Activity className="h-8 w-8 mx-auto mb-2 text-primary" />
                  <p className="text-sm font-medium">Sharpe Ratio</p>
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
            Complete Guide to Volatility
          </CardTitle>
          <CardDescription>
            Everything you need to know about calculating and interpreting volatility
          </CardDescription>
        </CardHeader>
        <CardContent className="space-y-4">
          <p className="text-muted-foreground">
            Volatility, measured as standard deviation, is a statistical measure of the dispersion of returns for a given security or market index. It indicates how much the price of an asset fluctuates around its average price over a specific period. Higher volatility means greater price swings and higher risk.
          </p>
          <p className="text-muted-foreground">
            Understanding volatility is crucial for risk management, portfolio construction, and investment decision-making. It helps investors assess the potential for price movements and determine appropriate position sizes based on their risk tolerance and investment objectives.
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
            Common questions about Volatility
          </CardDescription>
        </CardHeader>
        <CardContent>
          <div className="space-y-6">
            <div>
              <h4 className="font-semibold text-lg mb-3">What is Volatility?</h4>
              <p className="text-muted-foreground">
                Volatility is a statistical measure of the dispersion of returns for a given security or market index. It's calculated as the standard deviation of returns and indicates how much the price of an asset fluctuates around its average price over a specific period. Higher volatility means greater price swings and higher risk.
              </p>
            </div>
            
            <div>
              <h4 className="font-semibold text-lg mb-3">How do I calculate Volatility?</h4>
              <p className="text-muted-foreground">
                Volatility is calculated as the standard deviation of returns. First, calculate the mean return. Then, calculate the variance by finding the average of squared differences from the mean. Finally, take the square root of the variance to get the standard deviation (volatility). This measures the dispersion of returns around the average.
              </p>
            </div>
            
            <div>
              <h4 className="font-semibold text-lg mb-3">What is considered high Volatility?</h4>
              <p className="text-muted-foreground">
                Generally, volatility above 20% is considered high, above 30% is very high, 10-20% is moderate, and below 10% is low. However, what's considered high varies by asset class and market conditions. Stocks typically have higher volatility than bonds, and individual stocks have higher volatility than market indices.
              </p>
            </div>
            
            <div>
              <h4 className="font-semibold text-lg mb-3">What does high Volatility mean?</h4>
              <p className="text-muted-foreground">
                High volatility means the asset's price experiences large and frequent fluctuations. This indicates higher risk and uncertainty about future price movements. While high volatility can lead to significant gains, it also increases the risk of substantial losses. It's important for investors to understand their risk tolerance.
              </p>
            </div>
            
            <div>
              <h4 className="font-semibold text-lg mb-3">What does low Volatility mean?</h4>
              <p className="text-muted-foreground">
                Low volatility means the asset's price experiences small and infrequent fluctuations. This indicates lower risk and more predictable price movements. While low volatility reduces the risk of losses, it may also limit the potential for significant gains. It's suitable for conservative investors seeking stability.
              </p>
            </div>
            
            <div>
              <h4 className="font-semibold text-lg mb-3">How does Volatility affect investment decisions?</h4>
              <p className="text-muted-foreground">
                Volatility affects investment decisions by influencing risk assessment, position sizing, and portfolio allocation. High volatility investments may require smaller position sizes and more diversification. Low volatility investments may be suitable for larger allocations in conservative portfolios. Consider your risk tolerance and investment horizon.
              </p>
            </div>
            
            <div>
              <h4 className="font-semibold text-lg mb-3">What are the limitations of Volatility?</h4>
              <p className="text-muted-foreground">
                Volatility is based on historical data and may not predict future volatility. It assumes returns are normally distributed, which may not always be true. It doesn't distinguish between upside and downside volatility. It doesn't account for extreme events or tail risks that may occur infrequently but have significant impact.
              </p>
            </div>
            
            <div>
              <h4 className="font-semibold text-lg mb-3">How can I reduce portfolio Volatility?</h4>
              <p className="text-muted-foreground">
                You can reduce portfolio volatility through diversification across different asset classes, sectors, and geographic regions. Consider adding low-volatility assets like bonds or defensive stocks. Use hedging strategies or volatility-based position sizing. Regular rebalancing can also help maintain target volatility levels.
              </p>
            </div>
            
            <div>
              <h4 className="font-semibold text-lg mb-3">Why is Volatility important for portfolio management?</h4>
              <p className="text-muted-foreground">
                Volatility is crucial for portfolio management as it helps assess risk, determine appropriate position sizes, and optimize the risk-return trade-off. It guides asset allocation decisions, helps set risk budgets, and provides insight into portfolio stability. Understanding volatility helps investors make informed decisions about their investments.
              </p>
            </div>
            
            <div>
              <h4 className="font-semibold text-lg mb-3">How do institutional investors use Volatility?</h4>
              <p className="text-muted-foreground">
                Institutional investors use volatility for risk management, portfolio optimization, and performance evaluation. They set volatility targets, use volatility-based position sizing, and implement volatility hedging strategies. Volatility helps them assess risk-adjusted returns and make informed decisions about asset allocation and risk management.
              </p>
            </div>
          </div>
        </CardContent>
      </Card>
    </div>
  );
}
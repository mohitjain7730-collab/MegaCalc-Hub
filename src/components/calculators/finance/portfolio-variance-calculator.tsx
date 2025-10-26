'use client';

import { useState } from 'react';
import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import { z } from 'zod';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Form, FormControl, FormField, FormItem, FormLabel, FormMessage } from '@/components/ui/form';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Shield, AlertCircle, Target, Info, Landmark, Calculator, DollarSign, TrendingUp, BarChart3, Activity } from 'lucide-react';
import { Badge } from '@/components/ui/badge';
import { Alert, AlertDescription } from '@/components/ui/alert';
import Link from 'next/link';

const formSchema = z.object({
  weights: z.string().min(1, 'At least one weight is required'),
  volatilities: z.string().min(1, 'At least one volatility is required'),
  correlations: z.string().min(1, 'At least one correlation is required'),
});

type FormValues = z.infer<typeof formSchema>;

export default function PortfolioVarianceRiskCalculator() {
  const [result, setResult] = useState<{ 
    portfolioVariance: number;
    portfolioRisk: number; 
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
      weights: '',
      volatilities: '',
      correlations: '',
    },
  });

  const calculatePortfolioVariance = (weightsString: string, volatilitiesString: string, correlationsString: string) => {
    const weights = weightsString.split(',').map(w => parseFloat(w.trim())).filter(w => !isNaN(w));
    const volatilities = volatilitiesString.split(',').map(v => parseFloat(v.trim())).filter(v => !isNaN(v));
    const correlations = correlationsString.split(',').map(c => parseFloat(c.trim())).filter(c => !isNaN(c));
    
    if (weights.length < 2 || volatilities.length < 2) return null;
    if (weights.length !== volatilities.length) return null;

    // Calculate portfolio variance using proper formula
    let portfolioVariance = 0;
    
    // Add weighted variances (diagonal terms)
    for (let i = 0; i < weights.length; i++) {
      const variance = Math.pow(volatilities[i] / 100, 2); // Convert percentage to decimal and square
      portfolioVariance += Math.pow(weights[i] / 100, 2) * variance;
    }
    
    // Add covariance terms (off-diagonal terms)
    for (let i = 0; i < weights.length; i++) {
      for (let j = i + 1; j < weights.length; j++) {
        // Use correlation matrix or default correlation
        const correlation = correlations.length > 0 ? correlations[0] : 0.3; // Default correlation
        const covariance = correlation * (volatilities[i] / 100) * (volatilities[j] / 100);
        portfolioVariance += 2 * (weights[i] / 100) * (weights[j] / 100) * covariance;
      }
    }
    
    const portfolioRisk = Math.sqrt(portfolioVariance) * 100; // Convert back to percentage
    
    return { portfolioVariance: portfolioVariance * 10000, portfolioRisk }; // Convert variance to percentage squared
  };

  const interpret = (portfolioRisk: number) => {
    if (portfolioRisk >= 25) return 'Very high portfolio risk - extremely volatile portfolio with significant price swings.';
    if (portfolioRisk >= 20) return 'High portfolio risk - volatile portfolio with substantial price fluctuations.';
    if (portfolioRisk >= 15) return 'Moderate portfolio risk - balanced portfolio with reasonable volatility.';
    if (portfolioRisk >= 10) return 'Low portfolio risk - conservative portfolio with stable returns.';
    return 'Very low portfolio risk - very conservative portfolio with minimal volatility.';
  };

  const getRiskLevel = (portfolioRisk: number) => {
    if (portfolioRisk >= 25) return 'Very High';
    if (portfolioRisk >= 20) return 'High';
    if (portfolioRisk >= 15) return 'Moderate';
    if (portfolioRisk >= 10) return 'Low';
    return 'Very Low';
  };

  const getRecommendation = (portfolioRisk: number) => {
    if (portfolioRisk >= 25) return 'Consider reducing position sizes and increasing diversification.';
    if (portfolioRisk >= 20) return 'Monitor portfolio closely and consider risk reduction strategies.';
    if (portfolioRisk >= 15) return 'Maintain current strategy with regular risk monitoring.';
    if (portfolioRisk >= 10) return 'Consider increasing position sizes for potentially higher returns.';
    return 'Very stable portfolio - consider if returns meet your objectives.';
  };

  const getStrength = (portfolioRisk: number) => {
    if (portfolioRisk >= 25) return 'Very Weak';
    if (portfolioRisk >= 20) return 'Weak';
    if (portfolioRisk >= 15) return 'Moderate';
    if (portfolioRisk >= 10) return 'Strong';
    return 'Very Strong';
  };

  const getInsights = (portfolioRisk: number) => {
    const insights = [];
    if (portfolioRisk >= 25) {
      insights.push('Extremely high portfolio volatility');
      insights.push('Significant investment risk');
      insights.push('Potential for large gains or losses');
    } else if (portfolioRisk >= 20) {
      insights.push('High portfolio volatility');
      insights.push('Substantial investment risk');
      insights.push('Potential for significant price swings');
    } else if (portfolioRisk >= 15) {
      insights.push('Moderate portfolio volatility');
      insights.push('Balanced risk-return profile');
      insights.push('Reasonable price stability');
    } else if (portfolioRisk >= 10) {
      insights.push('Low portfolio volatility');
      insights.push('Conservative investment profile');
      insights.push('Stable price movements');
    } else {
      insights.push('Very low portfolio volatility');
      insights.push('Very conservative investment');
      insights.push('Minimal price changes');
    }
    return insights;
  };

  const getConsiderations = (portfolioRisk: number) => {
    const considerations = [];
    considerations.push('Portfolio risk varies by market conditions');
    considerations.push('Historical risk may not predict future risk');
    considerations.push('Consider your risk tolerance and investment horizon');
    considerations.push('Higher risk often means higher potential returns');
    considerations.push('Diversification can help reduce portfolio risk');
    return considerations;
  };

  const onSubmit = (values: FormValues) => {
    const result = calculatePortfolioVariance(values.weights, values.volatilities, values.correlations);
    if (result !== null) {
      setResult({
        portfolioVariance: result.portfolioVariance,
        portfolioRisk: result.portfolioRisk,
        interpretation: interpret(result.portfolioRisk),
        riskLevel: getRiskLevel(result.portfolioRisk),
        recommendation: getRecommendation(result.portfolioRisk),
        strength: getStrength(result.portfolioRisk),
        insights: getInsights(result.portfolioRisk),
        considerations: getConsiderations(result.portfolioRisk)
      });
    }
  };

  return (
    <div className="space-y-8">
      <Card>
        <CardHeader>
          <div className="flex items-center gap-2">
            <Shield className="h-6 w-6 text-primary" />
            <CardTitle>Portfolio Variance / Risk Calculator</CardTitle>
          </div>
          <CardDescription>
            Calculate your portfolio's variance and risk to assess overall portfolio volatility
          </CardDescription>
        </CardHeader>
        <CardContent>
      <Form {...form}>
        <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-6">
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <FormField control={form.control} name="weights" render={({ field }) => (
                  <FormItem>
                    <FormLabel className="flex items-center gap-2">
                      <DollarSign className="h-4 w-4" />
                      Portfolio Weights (%)
                    </FormLabel>
                    <FormControl>
                      <Input 
                        type="text" 
                        placeholder="Enter weights separated by commas" 
                        {...field} 
                      />
                    </FormControl>
                    <FormMessage />
                  </FormItem>
                )} />
                <FormField control={form.control} name="volatilities" render={({ field }) => (
                  <FormItem>
                    <FormLabel className="flex items-center gap-2">
                      <TrendingUp className="h-4 w-4" />
                      Asset Volatilities (%)
                    </FormLabel>
                    <FormControl>
                      <Input 
                        type="text" 
                        placeholder="Enter volatilities separated by commas" 
                        {...field} 
                      />
                    </FormControl>
                    <FormMessage />
                  </FormItem>
                )} />
                <FormField control={form.control} name="correlations" render={({ field }) => (
                  <FormItem>
                    <FormLabel className="flex items-center gap-2">
                      <BarChart3 className="h-4 w-4" />
                      Correlations
                    </FormLabel>
                    <FormControl>
                      <Input 
                        type="text" 
                        placeholder="Enter correlations separated by commas" 
                        {...field} 
                      />
                    </FormControl>
                    <FormMessage />
                  </FormItem>
                )} />
          </div>
              <p className="text-sm text-muted-foreground">
                Enter the same number of values for weights and volatilities. Correlations can be single values or multiple values. All values should be separated by commas (e.g., 40, 30, 30 for weights).
              </p>
              <Button type="submit" className="w-full">
                <Calculator className="h-4 w-4 mr-2" />
                Calculate Portfolio Risk
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
                  <CardTitle>Portfolio Risk Result</CardTitle>
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
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  <div>
                    <div className="text-3xl font-bold text-primary">
                      {result.portfolioRisk.toFixed(2)}%
                    </div>
                    <p className="text-sm text-muted-foreground">Portfolio Risk (Standard Deviation)</p>
                  </div>
                  <div>
                    <div className="text-3xl font-bold text-primary">
                      {result.portfolioVariance.toFixed(2)}
                    </div>
                    <p className="text-sm text-muted-foreground">Portfolio Variance</p>
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
            Explore other essential financial metrics for comprehensive portfolio analysis
          </CardDescription>
        </CardHeader>
        <CardContent>
          <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
            <Link href="/category/finance/correlation-coefficient-calculator" className="group">
              <Card className="group-hover:shadow-md transition-shadow">
                <CardContent className="p-4 text-center">
                  <BarChart3 className="h-8 w-8 mx-auto mb-2 text-primary" />
                  <p className="text-sm font-medium">Correlation</p>
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
            <Link href="/category/finance/volatility-standard-deviation-calculator" className="group">
              <Card className="group-hover:shadow-md transition-shadow">
                <CardContent className="p-4 text-center">
                  <TrendingUp className="h-8 w-8 mx-auto mb-2 text-primary" />
                  <p className="text-sm font-medium">Volatility</p>
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
            Complete Guide to Portfolio Variance
          </CardTitle>
          <CardDescription>
            Everything you need to know about calculating and interpreting portfolio variance
          </CardDescription>
        </CardHeader>
        <CardContent className="space-y-4">
          <p className="text-muted-foreground">
            Portfolio variance measures the dispersion of portfolio returns around the expected return. It's calculated by considering the weights of individual assets, their individual variances, and the correlations between them. Portfolio risk (standard deviation) is the square root of portfolio variance.
          </p>
          <p className="text-muted-foreground">
            Understanding portfolio variance is crucial for risk management and portfolio optimization. It helps investors assess the overall risk of their portfolio and make informed decisions about asset allocation, diversification, and risk tolerance. Lower portfolio variance generally indicates more stable returns.
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
            Common questions about Portfolio Variance
          </CardDescription>
        </CardHeader>
        <CardContent>
          <div className="space-y-6">
            <div>
              <h4 className="font-semibold text-lg mb-3">What is Portfolio Variance?</h4>
              <p className="text-muted-foreground">
                Portfolio variance measures the dispersion of portfolio returns around the expected return. It's calculated by considering the weights of individual assets, their individual variances, and the correlations between them. Portfolio risk (standard deviation) is the square root of portfolio variance.
              </p>
            </div>
            
            <div>
              <h4 className="font-semibold text-lg mb-3">How do I calculate Portfolio Variance?</h4>
              <p className="text-muted-foreground">
                Portfolio variance is calculated using the formula: σ²p = Σ(wi² × σi²) + ΣΣ(wi × wj × σi × σj × ρij). This considers individual asset weights (wi), variances (σi²), and correlations (ρij). The formula accounts for both individual asset risks and how assets move together.
              </p>
            </div>
            
            <div>
              <h4 className="font-semibold text-lg mb-3">What is considered high Portfolio Variance?</h4>
              <p className="text-muted-foreground">
                High portfolio variance depends on your risk tolerance and investment objectives. Generally, variance above 400 (20% standard deviation) is considered high, 225-400 (15-20%) is moderate, and below 225 (15%) is low. However, what's considered high varies by asset class and market conditions.
              </p>
            </div>
            
            <div>
              <h4 className="font-semibold text-lg mb-3">What does high Portfolio Variance mean?</h4>
              <p className="text-muted-foreground">
                High portfolio variance means the portfolio experiences large and frequent fluctuations in returns. This indicates higher risk and uncertainty about future performance. While high variance can lead to significant gains, it also increases the risk of substantial losses. It's important to understand your risk tolerance.
              </p>
            </div>
            
            <div>
              <h4 className="font-semibold text-lg mb-3">What does low Portfolio Variance mean?</h4>
              <p className="text-muted-foreground">
                Low portfolio variance means the portfolio experiences small and infrequent fluctuations in returns. This indicates lower risk and more predictable performance. While low variance reduces the risk of losses, it may also limit the potential for significant gains. It's suitable for conservative investors.
              </p>
            </div>
            
            <div>
              <h4 className="font-semibold text-lg mb-3">How does diversification affect Portfolio Variance?</h4>
              <p className="text-muted-foreground">
                Diversification can significantly reduce portfolio variance by combining assets with low correlations. When assets don't move together, their individual risks partially cancel out, reducing overall portfolio risk. Effective diversification is one of the most powerful tools for risk management in portfolio construction.
              </p>
            </div>
            
            <div>
              <h4 className="font-semibold text-lg mb-3">What are the limitations of Portfolio Variance?</h4>
              <p className="text-muted-foreground">
                Portfolio variance assumes returns are normally distributed and may not capture tail risks or extreme events. It's based on historical data and may not predict future variance. It doesn't distinguish between upside and downside volatility. It assumes correlations remain stable, which may not be true during market stress.
              </p>
            </div>
            
              <div>
              <h4 className="font-semibold text-lg mb-3">How can I reduce Portfolio Variance?</h4>
              <p className="text-muted-foreground">
                You can reduce portfolio variance through diversification across different asset classes, sectors, and geographic regions. Consider adding low-volatility assets like bonds or defensive stocks. Use correlation analysis to identify assets that provide good diversification benefits. Regular rebalancing can also help maintain target risk levels.
              </p>
              </div>
            
              <div>
              <h4 className="font-semibold text-lg mb-3">Why is Portfolio Variance important for investors?</h4>
              <p className="text-muted-foreground">
                Portfolio variance is crucial for investors as it helps assess overall portfolio risk and make informed decisions about asset allocation. It guides portfolio construction, risk management, and investment decisions. Understanding variance helps investors build portfolios that match their risk tolerance and investment objectives.
              </p>
              </div>
            
              <div>
              <h4 className="font-semibold text-lg mb-3">How do institutional investors use Portfolio Variance?</h4>
              <p className="text-muted-foreground">
                Institutional investors use portfolio variance for risk management, portfolio optimization, and performance evaluation. They set variance targets, use variance-based position sizing, and implement variance hedging strategies. Portfolio variance helps them assess risk-adjusted returns and make informed decisions about asset allocation and risk management.
              </p>
            </div>
              </div>
        </CardContent>
      </Card>
    </div>
  );
}
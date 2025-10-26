'use client';

import { useState } from 'react';
import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import { z } from 'zod';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Form, FormControl, FormField, FormItem, FormLabel, FormMessage } from '@/components/ui/form';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Activity, AlertCircle, Target, Info, Landmark, Calculator, DollarSign, TrendingUp, Shield, BarChart3 } from 'lucide-react';
import { Badge } from '@/components/ui/badge';
import { Alert, AlertDescription } from '@/components/ui/alert';
import Link from 'next/link';

const formSchema = z.object({
  asset1Returns: z.string().min(1, 'At least one return value is required'),
  asset2Returns: z.string().min(1, 'At least one return value is required'),
});

type FormValues = z.infer<typeof formSchema>;

export default function CorrelationCoefficientCalculator() {
  const [result, setResult] = useState<{ 
    correlation: number; 
    interpretation: string; 
    relationshipLevel: string;
    recommendation: string;
    strength: string;
    insights: string[];
    considerations: string[];
  } | null>(null);

  const form = useForm<FormValues>({
    resolver: zodResolver(formSchema),
    defaultValues: {
      asset1Returns: '',
      asset2Returns: '',
    },
  });

  const calculateCorrelation = (returns1String: string, returns2String: string) => {
    const returns1 = returns1String.split(',').map(r => parseFloat(r.trim())).filter(r => !isNaN(r));
    const returns2 = returns2String.split(',').map(r => parseFloat(r.trim())).filter(r => !isNaN(r));
    
    if (returns1.length < 2 || returns2.length < 2 || returns1.length !== returns2.length) return null;

    const mean1 = returns1.reduce((sum, r) => sum + r, 0) / returns1.length;
    const mean2 = returns2.reduce((sum, r) => sum + r, 0) / returns2.length;

    let numerator = 0;
    let sumSquared1 = 0;
    let sumSquared2 = 0;

    for (let i = 0; i < returns1.length; i++) {
      const diff1 = returns1[i] - mean1;
      const diff2 = returns2[i] - mean2;
      numerator += diff1 * diff2;
      sumSquared1 += diff1 * diff1;
      sumSquared2 += diff2 * diff2;
    }

    const denominator = Math.sqrt(sumSquared1 * sumSquared2);
    const correlation = denominator === 0 ? 0 : numerator / denominator;
    
    return correlation;
  };

  const interpret = (correlation: number) => {
    if (correlation >= 0.8) return 'Very strong positive correlation - assets move together closely.';
    if (correlation >= 0.6) return 'Strong positive correlation - assets tend to move together.';
    if (correlation >= 0.3) return 'Moderate positive correlation - some relationship between assets.';
    if (correlation >= -0.3) return 'Weak correlation - minimal relationship between assets.';
    if (correlation >= -0.6) return 'Moderate negative correlation - assets tend to move opposite.';
    if (correlation >= -0.8) return 'Strong negative correlation - assets move opposite directions.';
    return 'Very strong negative correlation - assets move opposite closely.';
  };

  const getRelationshipLevel = (correlation: number) => {
    if (correlation >= 0.8) return 'Very Strong';
    if (correlation >= 0.6) return 'Strong';
    if (correlation >= 0.3) return 'Moderate';
    if (correlation >= -0.3) return 'Weak';
    if (correlation >= -0.6) return 'Moderate';
    if (correlation >= -0.8) return 'Strong';
    return 'Very Strong';
  };

  const getRecommendation = (correlation: number) => {
    if (correlation >= 0.8) return 'Consider reducing exposure to both assets - limited diversification benefit.';
    if (correlation >= 0.6) return 'Monitor correlation closely - moderate diversification benefit.';
    if (correlation >= 0.3) return 'Good diversification potential - assets provide some risk reduction.';
    if (correlation >= -0.3) return 'Excellent diversification potential - assets provide good risk reduction.';
    if (correlation >= -0.6) return 'Very good diversification potential - assets provide strong risk reduction.';
    if (correlation >= -0.8) return 'Excellent diversification potential - assets provide very strong risk reduction.';
    return 'Perfect diversification potential - assets provide maximum risk reduction.';
  };

  const getStrength = (correlation: number) => {
    if (Math.abs(correlation) >= 0.8) return 'Very Strong';
    if (Math.abs(correlation) >= 0.6) return 'Strong';
    if (Math.abs(correlation) >= 0.3) return 'Moderate';
    return 'Weak';
  };

  const getInsights = (correlation: number) => {
    const insights = [];
    if (correlation >= 0.8) {
      insights.push('Very high correlation between assets');
      insights.push('Limited diversification benefits');
      insights.push('Assets move together closely');
    } else if (correlation >= 0.6) {
      insights.push('High correlation between assets');
      insights.push('Moderate diversification benefits');
      insights.push('Assets tend to move together');
    } else if (correlation >= 0.3) {
      insights.push('Moderate correlation between assets');
      insights.push('Good diversification benefits');
      insights.push('Some relationship between assets');
    } else if (correlation >= -0.3) {
      insights.push('Low correlation between assets');
      insights.push('Excellent diversification benefits');
      insights.push('Minimal relationship between assets');
    } else if (correlation >= -0.6) {
      insights.push('Moderate negative correlation');
      insights.push('Very good diversification benefits');
      insights.push('Assets tend to move opposite');
    } else {
      insights.push('High negative correlation');
      insights.push('Excellent diversification benefits');
      insights.push('Assets move opposite directions');
    }
    return insights;
  };

  const getConsiderations = (correlation: number) => {
    const considerations = [];
    considerations.push('Correlation can change over time');
    considerations.push('Historical correlation may not predict future correlation');
    considerations.push('Consider market conditions and economic cycles');
    considerations.push('Correlation may increase during market stress');
    considerations.push('Use correlation as one factor in portfolio construction');
    return considerations;
  };

  const onSubmit = (values: FormValues) => {
    const correlation = calculateCorrelation(values.asset1Returns, values.asset2Returns);
    if (correlation !== null) {
      setResult({
        correlation,
        interpretation: interpret(correlation),
        relationshipLevel: getRelationshipLevel(correlation),
        recommendation: getRecommendation(correlation),
        strength: getStrength(correlation),
        insights: getInsights(correlation),
        considerations: getConsiderations(correlation)
      });
    }
  };

  return (
    <div className="space-y-8">
      <Card>
        <CardHeader>
          <div className="flex items-center gap-2">
            <Activity className="h-6 w-6 text-primary" />
            <CardTitle>Correlation Coefficient Calculator</CardTitle>
          </div>
          <CardDescription>
            Calculate the correlation between two assets to assess diversification potential
          </CardDescription>
        </CardHeader>
        <CardContent>
      <Form {...form}>
        <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-6">
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <FormField control={form.control} name="asset1Returns" render={({ field }) => (
              <FormItem>
                    <FormLabel className="flex items-center gap-2">
                      <DollarSign className="h-4 w-4" />
                      Asset 1 Returns (%)
                    </FormLabel>
                <FormControl>
                      <Input 
                        type="text" 
                        placeholder="Enter returns separated by commas" 
                        {...field} 
                      />
                </FormControl>
                <FormMessage />
              </FormItem>
            )} />
                <FormField control={form.control} name="asset2Returns" render={({ field }) => (
              <FormItem>
                    <FormLabel className="flex items-center gap-2">
                      <TrendingUp className="h-4 w-4" />
                      Asset 2 Returns (%)
                    </FormLabel>
                <FormControl>
                      <Input 
                        type="text" 
                        placeholder="Enter returns separated by commas" 
                        {...field} 
                      />
                </FormControl>
                <FormMessage />
              </FormItem>
            )} />
          </div>
              <p className="text-sm text-muted-foreground">
                Enter the same number of return values for both assets. Values should be separated by commas (e.g., 5.2, -3.1, 8.7, 2.4).
              </p>
              <Button type="submit" className="w-full">
                <Calculator className="h-4 w-4 mr-2" />
                Calculate Correlation
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
                  <CardTitle>Correlation Result</CardTitle>
                </div>
                <div className="flex gap-2">
                  <Badge variant={result.relationshipLevel === 'Weak' ? 'default' : result.relationshipLevel === 'Moderate' ? 'secondary' : 'destructive'}>
                    {result.relationshipLevel}
                  </Badge>
                  <Badge variant="outline">{result.strength}</Badge>
                </div>
            </div>
          </CardHeader>
          <CardContent>
              <div className="text-center space-y-4">
                <div className="text-4xl font-bold text-primary">
                  {result.correlation.toFixed(3)}
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
            <Link href="/category/finance/portfolio-variance-calculator" className="group">
              <Card className="group-hover:shadow-md transition-shadow">
                <CardContent className="p-4 text-center">
                  <Shield className="h-8 w-8 mx-auto mb-2 text-primary" />
                  <p className="text-sm font-medium">Portfolio Variance</p>
                </CardContent>
              </Card>
            </Link>
            <Link href="/category/finance/volatility-standard-deviation-calculator" className="group">
              <Card className="group-hover:shadow-md transition-shadow">
                <CardContent className="p-4 text-center">
                  <Activity className="h-8 w-8 mx-auto mb-2 text-primary" />
                  <p className="text-sm font-medium">Volatility</p>
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
          </div>
        </CardContent>
      </Card>

      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <Info className="h-5 w-5" />
            Complete Guide to Correlation Coefficient
          </CardTitle>
          <CardDescription>
            Everything you need to know about calculating and interpreting correlation
          </CardDescription>
        </CardHeader>
        <CardContent className="space-y-4">
          <p className="text-muted-foreground">
            The Correlation Coefficient measures the strength and direction of the linear relationship between two variables. It ranges from -1 to +1, where +1 indicates perfect positive correlation, -1 indicates perfect negative correlation, and 0 indicates no linear relationship.
          </p>
          <p className="text-muted-foreground">
            In finance, correlation is crucial for portfolio diversification. Understanding how assets move relative to each other helps investors build portfolios that can reduce overall risk while maintaining desired returns. Lower correlations between assets provide better diversification benefits.
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
            Common questions about Correlation Coefficient
          </CardDescription>
        </CardHeader>
        <CardContent>
          <div className="space-y-6">
            <div>
              <h4 className="font-semibold text-lg mb-3">What is the Correlation Coefficient?</h4>
              <p className="text-muted-foreground">
                The Correlation Coefficient is a statistical measure that quantifies the strength and direction of the linear relationship between two variables. It ranges from -1 to +1, where +1 indicates perfect positive correlation, -1 indicates perfect negative correlation, and 0 indicates no linear relationship.
              </p>
            </div>
            
            <div>
              <h4 className="font-semibold text-lg mb-3">How do I calculate the Correlation Coefficient?</h4>
              <p className="text-muted-foreground">
                The correlation coefficient is calculated using the formula: r = Σ[(xi - x̄)(yi - ȳ)] / √[Σ(xi - x̄)² × Σ(yi - ȳ)²]. This measures the covariance between two variables divided by the product of their standard deviations. The result indicates the strength and direction of their linear relationship.
              </p>
            </div>
            
            <div>
              <h4 className="font-semibold text-lg mb-3">What does a correlation of 1 mean?</h4>
              <p className="text-muted-foreground">
                A correlation of +1 means perfect positive correlation - the two assets move in exactly the same direction with the same magnitude. A correlation of -1 means perfect negative correlation - the assets move in exactly opposite directions with the same magnitude. These are theoretical extremes rarely seen in practice.
              </p>
            </div>
            
            <div>
              <h4 className="font-semibold text-lg mb-3">What does a correlation of 0 mean?</h4>
              <p className="text-muted-foreground">
                A correlation of 0 means there is no linear relationship between the two assets. Their price movements are independent of each other. This provides excellent diversification benefits as the assets don't move together, helping to reduce portfolio risk through diversification.
              </p>
            </div>
            
            <div>
              <h4 className="font-semibold text-lg mb-3">What is considered a good correlation for diversification?</h4>
              <p className="text-muted-foreground">
                For diversification purposes, correlations below 0.3 are considered good, below 0.1 are excellent, and negative correlations provide the best diversification benefits. Correlations above 0.7 indicate limited diversification benefits, while correlations above 0.9 suggest the assets move almost identically.
              </p>
            </div>
            
            <div>
              <h4 className="font-semibold text-lg mb-3">How does correlation affect portfolio risk?</h4>
              <p className="text-muted-foreground">
                Lower correlations between portfolio assets reduce overall portfolio risk through diversification. When assets have low correlation, they don't all move in the same direction simultaneously, which helps smooth out portfolio returns. Higher correlations increase portfolio risk as assets tend to move together.
              </p>
            </div>
            
            <div>
              <h4 className="font-semibold text-lg mb-3">What are the limitations of correlation?</h4>
              <p className="text-muted-foreground">
                Correlation only measures linear relationships and may miss non-linear relationships. It can change over time, especially during market stress when correlations often increase. It doesn't indicate causation and may be influenced by external factors. Historical correlation may not predict future correlation.
              </p>
            </div>
            
            <div>
              <h4 className="font-semibold text-lg mb-3">How can I use correlation in portfolio construction?</h4>
              <p className="text-muted-foreground">
                Use correlation to identify assets that provide good diversification benefits. Include assets with low or negative correlations to reduce portfolio risk. Monitor correlations over time as they can change. Consider correlation as one factor among many in portfolio construction, along with expected returns and individual asset risks.
              </p>
            </div>
            
            <div>
              <h4 className="font-semibold text-lg mb-3">Why is correlation important for investors?</h4>
              <p className="text-muted-foreground">
                Correlation is crucial for investors as it helps assess diversification benefits and portfolio risk. Understanding how assets move relative to each other enables better portfolio construction, risk management, and asset allocation decisions. It's essential for building resilient portfolios that can weather different market conditions.
              </p>
            </div>
            
            <div>
              <h4 className="font-semibold text-lg mb-3">How do institutional investors use correlation?</h4>
              <p className="text-muted-foreground">
                Institutional investors use correlation for portfolio optimization, risk management, and asset allocation. They monitor correlations to maintain target risk levels, implement diversification strategies, and assess portfolio stability. Correlation analysis helps them make informed decisions about asset selection and portfolio construction.
              </p>
            </div>
          </div>
        </CardContent>
      </Card>
    </div>
  );
}
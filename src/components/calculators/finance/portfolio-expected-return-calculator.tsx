'use client';

import { useState } from 'react';
import { useForm, useFieldArray } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import { z } from 'zod';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Form, FormControl, FormField, FormItem, FormLabel, FormMessage } from '@/components/ui/form';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { TrendingUp, AlertCircle, Target, Info, Landmark, Calculator, DollarSign, BarChart3, Shield, Activity, PlusCircle, XCircle } from 'lucide-react';
import { Badge } from '@/components/ui/badge';
import { Alert, AlertDescription } from '@/components/ui/alert';
import Link from 'next/link';

const assetSchema = z.object({
  name: z.string().optional(),
  return: z.number().optional(),
  weight: z.number().optional(),
});

const formSchema = z.object({
  assets: z.array(assetSchema),
}).refine(data => {
    const totalWeight = data.assets.reduce((sum, asset) => sum + (asset.weight || 0), 0);
    return Math.abs(totalWeight - 100) < 0.01;
}, {
    message: "Total portfolio weights must add up to 100%.",
    path: ['assets'],
});

type FormValues = z.infer<typeof formSchema>;

export default function PortfolioExpectedReturnCalculator() {
  const [result, setResult] = useState<{ 
    expectedReturn: number; 
    interpretation: string; 
    returnLevel: string;
    recommendation: string;
    strength: string;
    insights: string[];
    considerations: string[];
  } | null>(null);

  const form = useForm<FormValues>({
    resolver: zodResolver(formSchema),
    defaultValues: {
      assets: [
        { name: 'Asset 1', return: undefined, weight: undefined },
        { name: 'Asset 2', return: undefined, weight: undefined },
      ],
    },
  });

  const { fields, append, remove } = useFieldArray({
    control: form.control,
    name: "assets"
  });

  const calculateExpectedReturn = (assets: any[]) => {
    const validAssets = assets.filter(asset => 
      asset.return !== undefined && 
      asset.weight !== undefined && 
      !isNaN(asset.return) && 
      !isNaN(asset.weight)
    );
    
    if (validAssets.length === 0) return null;
    
    const expectedReturn = validAssets.reduce((sum, asset) => {
      return sum + (asset.return * asset.weight / 100);
    }, 0);
    
    return expectedReturn;
  };

  const interpret = (expectedReturn: number) => {
    if (expectedReturn >= 15) return 'High expected return - aggressive portfolio with significant growth potential.';
    if (expectedReturn >= 10) return 'Moderate expected return - balanced portfolio with reasonable growth prospects.';
    if (expectedReturn >= 5) return 'Conservative expected return - stable portfolio with modest growth expectations.';
    if (expectedReturn >= 0) return 'Low expected return - very conservative portfolio with minimal growth.';
    return 'Negative expected return - portfolio may not meet investment objectives.';
  };

  const getReturnLevel = (expectedReturn: number) => {
    if (expectedReturn >= 15) return 'High';
    if (expectedReturn >= 10) return 'Moderate';
    if (expectedReturn >= 5) return 'Conservative';
    if (expectedReturn >= 0) return 'Low';
    return 'Negative';
  };

  const getRecommendation = (expectedReturn: number) => {
    if (expectedReturn >= 15) return 'Monitor risk levels closely - high returns come with higher risk.';
    if (expectedReturn >= 10) return 'Maintain balanced approach - good risk-return profile.';
    if (expectedReturn >= 5) return 'Consider increasing growth assets if risk tolerance allows.';
    if (expectedReturn >= 0) return 'Review asset allocation - may need more growth-oriented investments.';
    return 'Urgent portfolio review needed - returns below expectations.';
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
      insights.push('Aggressive investment strategy');
      insights.push('Significant return expectations');
    } else if (expectedReturn >= 10) {
      insights.push('Balanced growth potential');
      insights.push('Moderate investment strategy');
      insights.push('Reasonable return expectations');
    } else if (expectedReturn >= 5) {
      insights.push('Conservative growth potential');
      insights.push('Stable investment strategy');
      insights.push('Modest return expectations');
    } else if (expectedReturn >= 0) {
      insights.push('Limited growth potential');
      insights.push('Very conservative strategy');
      insights.push('Low return expectations');
    } else {
      insights.push('Negative growth potential');
      insights.push('Underperforming strategy');
      insights.push('Below-expectation returns');
    }
    return insights;
  };

  const getConsiderations = (expectedReturn: number) => {
    const considerations = [];
    considerations.push('Expected returns are not guaranteed');
    considerations.push('Higher returns typically come with higher risk');
    considerations.push('Consider your investment time horizon');
    considerations.push('Review portfolio regularly for rebalancing');
    considerations.push('Diversification can help manage risk');
    return considerations;
  };

  const onSubmit = (values: FormValues) => {
    const expectedReturn = calculateExpectedReturn(values.assets);
    if (expectedReturn !== null) {
      setResult({
        expectedReturn,
        interpretation: interpret(expectedReturn),
        returnLevel: getReturnLevel(expectedReturn),
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
            <TrendingUp className="h-6 w-6 text-primary" />
            <CardTitle>Portfolio Expected Return Calculator</CardTitle>
          </div>
          <CardDescription>
            Calculate your portfolio's expected return based on asset allocation and individual asset returns
          </CardDescription>
        </CardHeader>
        <CardContent>
          <Form {...form}>
            <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-6">
              <div className="space-y-4">
                {fields.map((field, index) => (
                  <Card key={field.id} className="p-4">
                    <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                      <FormField control={form.control} name={`assets.${index}.name`} render={({ field }) => (
                        <FormItem>
                          <FormLabel className="flex items-center gap-2">
                            <DollarSign className="h-4 w-4" />
                            Asset Name
                          </FormLabel>
                          <FormControl>
                            <Input placeholder={`Asset ${index + 1}`} {...field} />
                          </FormControl>
                          <FormMessage />
                        </FormItem>
                      )} />
                      <FormField control={form.control} name={`assets.${index}.return`} render={({ field }) => (
                        <FormItem>
                          <FormLabel className="flex items-center gap-2">
                            <BarChart3 className="h-4 w-4" />
                            Expected Return (%)
                          </FormLabel>
                          <FormControl>
                            <Input type="number" placeholder="Enter expected return" {...field} value={field.value ?? ''} onChange={e => field.onChange(parseFloat(e.target.value) || undefined)} />
                          </FormControl>
                          <FormMessage />
                        </FormItem>
                      )} />
                      <FormField control={form.control} name={`assets.${index}.weight`} render={({ field }) => (
                        <FormItem>
                          <FormLabel className="flex items-center gap-2">
                            <Activity className="h-4 w-4" />
                            Portfolio Weight (%)
                          </FormLabel>
                          <FormControl>
                            <Input type="number" placeholder="Enter weight" {...field} value={field.value ?? ''} onChange={e => field.onChange(parseFloat(e.target.value) || undefined)} />
                          </FormControl>
                          <FormMessage />
                        </FormItem>
                      )} />
                    </div>
                    {fields.length > 2 && (
                      <Button
                        type="button"
                        variant="outline"
                        size="sm"
                        onClick={() => remove(index)}
                        className="mt-2"
                      >
                        <XCircle className="h-4 w-4 mr-2" />
                        Remove Asset
                      </Button>
                    )}
                  </Card>
                ))}
              </div>
              
              <Button
                type="button"
                variant="outline"
                onClick={() => append({ name: '', return: undefined, weight: undefined })}
                className="w-full"
              >
                <PlusCircle className="h-4 w-4 mr-2" />
                Add Another Asset
              </Button>
              
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
                  <CardTitle>Portfolio Expected Return Result</CardTitle>
                </div>
                <div className="flex gap-2">
                  <Badge variant={result.returnLevel === 'High' ? 'default' : result.returnLevel === 'Moderate' ? 'secondary' : 'destructive'}>
                    {result.returnLevel}
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
            <Link href="/category/finance/capm-calculator" className="group">
              <Card className="group-hover:shadow-md transition-shadow">
                <CardContent className="p-4 text-center">
                  <BarChart3 className="h-8 w-8 mx-auto mb-2 text-primary" />
                  <p className="text-sm font-medium">CAPM</p>
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
            <Link href="/category/finance/sharpe-ratio-calculator" className="group">
              <Card className="group-hover:shadow-md transition-shadow">
                <CardContent className="p-4 text-center">
                  <TrendingUp className="h-8 w-8 mx-auto mb-2 text-primary" />
                  <p className="text-sm font-medium">Sharpe Ratio</p>
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
          </div>
        </CardContent>
      </Card>

      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <Info className="h-5 w-5" />
            Complete Guide to Portfolio Expected Return
          </CardTitle>
          <CardDescription>
            Everything you need to know about calculating and interpreting portfolio expected returns
          </CardDescription>
        </CardHeader>
        <CardContent className="space-y-4">
          <p className="text-muted-foreground">
            Portfolio Expected Return is calculated as the weighted average of individual asset returns, where each asset's expected return is multiplied by its portfolio weight. This provides an estimate of the portfolio's overall expected performance based on current asset allocation.
          </p>
          <p className="text-muted-foreground">
            Understanding expected returns is crucial for portfolio planning, risk assessment, and investment decision-making. It helps investors set realistic expectations and make informed decisions about asset allocation, rebalancing, and risk management strategies.
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
            Common questions about Portfolio Expected Return
          </CardDescription>
        </CardHeader>
        <CardContent>
          <div className="space-y-6">
            <div>
              <h4 className="font-semibold text-lg mb-3">What is Portfolio Expected Return?</h4>
              <p className="text-muted-foreground">
                Portfolio Expected Return is the weighted average of individual asset returns in your portfolio. It's calculated by multiplying each asset's expected return by its portfolio weight and summing the results. This provides an estimate of your portfolio's overall expected performance.
              </p>
            </div>
            
            <div>
              <h4 className="font-semibold text-lg mb-3">How do I calculate Portfolio Expected Return?</h4>
              <p className="text-muted-foreground">
                The formula is: Expected Return = Σ(Weighti × Returni). For each asset, multiply its portfolio weight (as a percentage) by its expected return (as a percentage), then sum all the results. This gives you the portfolio's overall expected return.
              </p>
            </div>
            
            <div>
              <h4 className="font-semibold text-lg mb-3">What is considered a good expected return?</h4>
              <p className="text-muted-foreground">
                Good expected returns depend on your risk tolerance and investment objectives. Generally, 8-12% is considered good for balanced portfolios, 12-15% for growth portfolios, and 4-6% for conservative portfolios. Consider your time horizon and risk tolerance when evaluating expected returns.
              </p>
            </div>
            
            <div>
              <h4 className="font-semibold text-lg mb-3">How does asset allocation affect expected return?</h4>
              <p className="text-muted-foreground">
                Asset allocation significantly affects expected return. Higher allocations to growth assets (stocks) typically increase expected returns but also increase risk. Conservative allocations (bonds) provide lower expected returns but more stability. The key is finding the right balance for your risk tolerance.
              </p>
            </div>
            
            <div>
              <h4 className="font-semibold text-lg mb-3">What are the limitations of expected return calculations?</h4>
              <p className="text-muted-foreground">
                Expected returns are estimates based on historical data and assumptions, not guarantees. They don't account for market volatility, economic changes, or unexpected events. Past performance doesn't predict future results. Use expected returns as planning tools, not as promises of future performance.
              </p>
            </div>
            
            <div>
              <h4 className="font-semibold text-lg mb-3">How often should I recalculate expected returns?</h4>
              <p className="text-muted-foreground">
                Recalculate expected returns whenever you change your asset allocation, add or remove assets, or when market conditions significantly change. Regular portfolio reviews (quarterly or annually) help ensure your expected returns align with your investment objectives and current market conditions.
              </p>
            </div>
            
            <div>
              <h4 className="font-semibold text-lg mb-3">How can I improve my portfolio's expected return?</h4>
              <p className="text-muted-foreground">
                You can improve expected returns by increasing allocations to higher-return assets (within your risk tolerance), rebalancing regularly, and considering alternative investments. However, remember that higher expected returns typically come with higher risk. Balance return objectives with risk management.
              </p>
            </div>
            
            <div>
              <h4 className="font-semibold text-lg mb-3">Why is expected return important for portfolio management?</h4>
              <p className="text-muted-foreground">
                Expected return is crucial for portfolio management as it helps set realistic performance expectations, guides asset allocation decisions, and provides a benchmark for evaluating portfolio performance. It's essential for financial planning, retirement planning, and investment goal setting.
              </p>
            </div>
            
            <div>
              <h4 className="font-semibold text-lg mb-3">How do I use expected return in financial planning?</h4>
              <p className="text-muted-foreground">
                Use expected returns to project future portfolio values, calculate required savings rates, and assess whether your investment strategy can meet your financial goals. Consider different scenarios (conservative, moderate, aggressive) to understand the range of possible outcomes.
              </p>
            </div>
            
            <div>
              <h4 className="font-semibold text-lg mb-3">What's the difference between expected return and actual return?</h4>
              <p className="text-muted-foreground">
                Expected return is a forward-looking estimate based on historical data and assumptions, while actual return is the realized performance over a specific period. Actual returns often differ from expected returns due to market volatility, economic changes, and other unpredictable factors.
              </p>
            </div>
          </div>
        </CardContent>
      </Card>
    </div>
  );
}
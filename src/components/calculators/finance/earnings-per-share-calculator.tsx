'use client';

import { useState } from 'react';
import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import { z } from 'zod';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Form, FormControl, FormField, FormItem, FormLabel, FormMessage } from '@/components/ui/form';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Calculator, DollarSign, TrendingUp, Target, Info, AlertCircle, BarChart3, Percent } from 'lucide-react';
import { Badge } from '@/components/ui/badge';
import { Alert, AlertDescription } from '@/components/ui/alert';

const formSchema = z.object({
  netIncome: z.number().positive(),
  sharesOutstanding: z.number().positive(),
});

type FormValues = z.infer<typeof formSchema>;

export default function EarningsPerShareCalculator() {
  const [result, setResult] = useState<{ 
    eps: number; 
    interpretation: string; 
    recommendation: string;
    profitability: string;
    riskLevel: string;
    insights: string[];
    considerations: string[];
  } | null>(null);

  const form = useForm<FormValues>({
    resolver: zodResolver(formSchema),
    defaultValues: {
      netIncome: undefined,
      sharesOutstanding: undefined,
    },
  });

  const calculate = (v: FormValues) => {
    if (v.netIncome == null || v.sharesOutstanding == null) return null;
    return v.netIncome / v.sharesOutstanding;
  };

  const interpret = (eps: number) => {
    if (eps > 5) return 'High EPS indicates strong profitability and efficient use of shareholder capital.';
    if (eps > 2) return 'Moderate EPS suggests reasonable profitability relative to shares outstanding.';
    if (eps > 0.5) return 'Low EPS may indicate lower profitability or high share count.';
    return 'Very low EPS suggests minimal profitability or significant share dilution.';
  };

  const getProfitability = (eps: number) => {
    if (eps > 5) return 'Highly Profitable';
    if (eps > 2) return 'Profitable';
    if (eps > 0.5) return 'Marginally Profitable';
    return 'Low Profitability';
  };

  const getRiskLevel = (eps: number) => {
    if (eps > 5) return 'Low';
    if (eps > 2) return 'Moderate';
    if (eps > 0.5) return 'High';
    return 'Very High';
  };

  const getInsights = (eps: number) => {
    const insights = [];
    
    if (eps > 5) {
      insights.push('Strong earnings generation per share');
      insights.push('Efficient use of shareholder capital');
    } else if (eps > 2) {
      insights.push('Reasonable profitability per share');
      insights.push('Balanced earnings distribution');
    } else {
      insights.push('Lower earnings per share may indicate challenges');
      insights.push('Consider factors affecting profitability');
    }

    if (eps > 10) {
      insights.push('Exceptional earnings performance');
    }

    return insights;
  };

  const getConsiderations = (eps: number) => {
    const considerations = [];
    
    considerations.push('Compare EPS with industry peers and historical performance');
    considerations.push('Consider the company\'s growth trajectory and market position');
    considerations.push('Evaluate the quality and sustainability of earnings');
    
    if (eps < 1) {
      considerations.push('Low EPS may indicate operational challenges or high share count');
      considerations.push('Investigate reasons for low profitability per share');
    }

    considerations.push('Monitor EPS trends over multiple quarters');
    considerations.push('Consider the impact of share buybacks or dilution on EPS');

    return considerations;
  };

  const recommendation = (eps: number) => {
    if (eps > 5) {
      return 'Strong EPS indicates healthy profitability - consider for investment.';
    } else if (eps > 2) {
      return 'Reasonable EPS suggests decent profitability - evaluate alongside other metrics.';
    } else if (eps > 0.5) {
      return 'Low EPS requires careful analysis of underlying business fundamentals.';
    } else {
      return 'Very low EPS suggests significant challenges - proceed with caution.';
    }
  };

  const onSubmit = (values: FormValues) => {
    const eps = calculate(values);
    if (eps == null) { setResult(null); return; }
    setResult({ 
      eps, 
      interpretation: interpret(eps), 
      recommendation: recommendation(eps),
      profitability: getProfitability(eps),
      riskLevel: getRiskLevel(eps),
      insights: getInsights(eps),
      considerations: getConsiderations(eps)
    });
  };

  return (
    <div className="space-y-8">

      {/* Input Form */}
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <Target className="h-5 w-5" />
            Company Financials
          </CardTitle>
          <CardDescription>
            Enter the company's net income and shares outstanding to calculate EPS
          </CardDescription>
        </CardHeader>
        <CardContent>
      <Form {...form}>
        <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-6">
              <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            <FormField control={form.control} name="netIncome" render={({ field }) => (
              <FormItem>
                    <FormLabel className="flex items-center gap-2">
                      <DollarSign className="h-4 w-4" />
                      Net Income ($)
                    </FormLabel>
                <FormControl>
                      <Input 
                        type="number" 
                        step="0.01"
                        placeholder="e.g., 1000000" 
                        {...field} 
                        value={field.value ?? ''} 
                        onChange={e => field.onChange(parseFloat(e.target.value) || undefined)} 
                      />
                </FormControl>
                <FormMessage />
              </FormItem>
            )} />
                
                <FormField control={form.control} name="sharesOutstanding" render={({ field }) => (
              <FormItem>
                    <FormLabel className="flex items-center gap-2">
                      <BarChart3 className="h-4 w-4" />
                      Shares Outstanding
                    </FormLabel>
                <FormControl>
                      <Input 
                        type="number" 
                        step="1"
                        placeholder="e.g., 1000000" 
                        {...field} 
                        value={field.value ?? ''} 
                        onChange={e => field.onChange(parseFloat(e.target.value) || undefined)} 
                      />
                </FormControl>
                <FormMessage />
              </FormItem>
            )} />
          </div>
              
              <Button type="submit" className="w-full md:w-auto">
                Calculate EPS
              </Button>
        </form>
      </Form>
        </CardContent>
      </Card>

      {result && (
        <div className="space-y-6">
          {/* Main Results Card */}
          <Card>
            <CardHeader>
              <div className="flex items-center gap-4">
                <Calculator className="h-8 w-8 text-primary" />
                <div>
                  <CardTitle>Earnings per Share Analysis</CardTitle>
                  <CardDescription>Profitability assessment and investment insights</CardDescription>
                </div>
              </div>
            </CardHeader>
            <CardContent>
              <div className="grid grid-cols-1 md:grid-cols-3 gap-6 mb-8">
                <div className="text-center p-6 bg-primary/5 rounded-lg">
                  <div className="flex items-center justify-center gap-2 mb-2">
                    <DollarSign className="h-5 w-5 text-primary" />
                    <span className="text-sm font-medium text-muted-foreground">EPS</span>
                  </div>
                  <p className="text-3xl font-bold text-primary">
                    ${result.eps.toFixed(2)}
                  </p>
                  <p className="text-sm text-muted-foreground mt-1">
                    {result.profitability}
                  </p>
                </div>
                
                <div className="text-center p-6 bg-muted/50 rounded-lg">
                  <div className="flex items-center justify-center gap-2 mb-2">
                    <BarChart3 className="h-5 w-5 text-muted-foreground" />
                    <span className="text-sm font-medium text-muted-foreground">Risk Level</span>
                  </div>
                  <div className="text-2xl font-bold">
                    <Badge variant={result.riskLevel === 'Very High' ? 'destructive' : result.riskLevel === 'High' ? 'default' : 'secondary'}>
                      {result.riskLevel}
                    </Badge>
                  </div>
                  <p className="text-sm text-muted-foreground mt-1">
                    {result.interpretation}
                  </p>
                </div>
                
                <div className="text-center p-6 bg-green-50 dark:bg-green-950/20 rounded-lg">
                  <div className="flex items-center justify-center gap-2 mb-2">
                    <TrendingUp className="h-5 w-5 text-green-600" />
                    <span className="text-sm font-medium text-muted-foreground">Recommendation</span>
                  </div>
                  <p className="text-lg font-bold text-green-600">
                    {result.eps > 5 ? 'Strong' : result.eps > 2 ? 'Consider' : 'Caution'}
                  </p>
                  <p className="text-sm text-muted-foreground mt-1">
                    {result.recommendation}
                  </p>
                </div>
              </div>

              {/* Detailed Analysis */}
              <div className="space-y-6">
                <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                  <Card>
                    <CardHeader>
                      <CardTitle className="flex items-center gap-2 text-lg">
                        <Target className="h-5 w-5" />
                        Key Insights
                      </CardTitle>
                    </CardHeader>
                    <CardContent>
                      <ul className="space-y-2">
                        {result.insights.map((insight, index) => (
                          <li key={index} className="flex items-start gap-2">
                            <div className="w-2 h-2 bg-primary rounded-full mt-2 flex-shrink-0" />
                            <span className="text-sm">{insight}</span>
                          </li>
                        ))}
                      </ul>
                    </CardContent>
                  </Card>

                  <Card>
                    <CardHeader>
                      <CardTitle className="flex items-center gap-2 text-lg">
                        <AlertCircle className="h-5 w-5" />
                        Important Considerations
                      </CardTitle>
                    </CardHeader>
                    <CardContent>
                      <ul className="space-y-2">
                        {result.considerations.map((consideration, index) => (
                          <li key={index} className="flex items-start gap-2">
                            <div className="w-2 h-2 bg-destructive rounded-full mt-2 flex-shrink-0" />
                            <span className="text-sm">{consideration}</span>
                          </li>
                        ))}
                      </ul>
                    </CardContent>
                  </Card>
                </div>
              </div>
            </CardContent>
          </Card>
        </div>
      )}

      {/* Educational Content - Expanded Sections */}
      <div className="space-y-6">
        {/* Related Calculators Section */}
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <BarChart3 className="h-5 w-5" />
              Related Calculators
            </CardTitle>
            <CardDescription>
              Explore other financial calculators to enhance your investment analysis
            </CardDescription>
          </CardHeader>
          <CardContent>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div className="p-4 border rounded-lg hover:bg-muted/50 transition-colors">
                <h4 className="font-semibold mb-2">
                  <a href="/category/finance/price-to-earnings-ratio-calculator" className="text-primary hover:underline">
                    P/E Ratio Calculator
                  </a>
                </h4>
                <p className="text-sm text-muted-foreground">
                  Calculate P/E ratio to assess stock valuation relative to earnings.
                </p>
              </div>
              <div className="p-4 border rounded-lg hover:bg-muted/50 transition-colors">
                <h4 className="font-semibold mb-2">
                  <a href="/category/finance/return-on-equity-calculator" className="text-primary hover:underline">
                    Return on Equity Calculator
                  </a>
                </h4>
                <p className="text-sm text-muted-foreground">
                  Calculate ROE to assess management efficiency and profitability.
                </p>
              </div>
              <div className="p-4 border rounded-lg hover:bg-muted/50 transition-colors">
                <h4 className="font-semibold mb-2">
                  <a href="/category/finance/return-on-assets-calculator" className="text-primary hover:underline">
                    Return on Assets Calculator
                  </a>
                </h4>
                <p className="text-sm text-muted-foreground">
                  Calculate ROA to evaluate asset utilization efficiency.
                </p>
              </div>
              <div className="p-4 border rounded-lg hover:bg-muted/50 transition-colors">
                <h4 className="font-semibold mb-2">
                  <a href="/category/finance/net-profit-margin-calculator" className="text-primary hover:underline">
                    Net Profit Margin Calculator
                  </a>
                </h4>
                <p className="text-sm text-muted-foreground">
                  Calculate net profit margin to assess overall profitability.
                </p>
              </div>
            </div>
          </CardContent>
        </Card>

        {/* Guide Section */}
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <Calculator className="h-5 w-5" />
              Complete Guide to Earnings per Share
            </CardTitle>
          </CardHeader>
          <CardContent className="prose prose-sm dark:prose-invert max-w-none">
            <p>This is a sample line for the complete guide section. You can add your detailed content here.</p>
            <p>This is another sample line for the guide section. Replace these with your comprehensive guide content.</p>
          </CardContent>
        </Card>

        {/* FAQ Section */}
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <Info className="h-5 w-5" />
              Frequently Asked Questions
            </CardTitle>
            <CardDescription>
              Common questions about Earnings per Share analysis and profitability
            </CardDescription>
          </CardHeader>
          <CardContent className="space-y-6">
            <div>
              <h4 className="font-semibold text-foreground mb-2">What is Earnings per Share (EPS)?</h4>
              <p className="text-muted-foreground">
                EPS is a financial metric that shows how much profit a company generates for each share of its stock. It's calculated by dividing net income by the number of outstanding shares.
              </p>
            </div>

            <div>
              <h4 className="font-semibold text-foreground mb-2">How do I calculate EPS?</h4>
              <p className="text-muted-foreground">
                EPS = Net Income ÷ Shares Outstanding. For example, if a company has $1 million in net income and 500,000 shares outstanding, the EPS is $2.00.
              </p>
            </div>

            <div>
              <h4 className="font-semibold text-foreground mb-2">What's a good EPS?</h4>
              <p className="text-muted-foreground">
                A "good" EPS depends on the industry and company size. Generally, higher EPS is better, but it should be evaluated relative to the company's historical performance and industry peers.
              </p>
            </div>

            <div>
              <h4 className="font-semibold text-foreground mb-2">What's the difference between basic and diluted EPS?</h4>
              <p className="text-muted-foreground">
                Basic EPS uses only outstanding shares, while diluted EPS includes potential shares from stock options, convertible securities, and other instruments that could increase share count.
              </p>
            </div>

            <div>
              <h4 className="font-semibold text-foreground mb-2">How does EPS growth affect stock price?</h4>
              <p className="text-muted-foreground">
                Consistent EPS growth typically leads to higher stock prices as it indicates improving profitability. Investors often pay premiums for companies with strong EPS growth rates.
              </p>
            </div>

            <div>
              <h4 className="font-semibold text-foreground mb-2">Can EPS be negative?</h4>
              <p className="text-muted-foreground">
                Yes, EPS can be negative when a company has net losses. Negative EPS indicates the company is losing money and may signal financial difficulties or temporary challenges.
              </p>
            </div>

            <div>
              <h4 className="font-semibold text-foreground mb-2">How do stock buybacks affect EPS?</h4>
              <p className="text-muted-foreground">
                Stock buybacks reduce the number of outstanding shares, which increases EPS (assuming net income stays the same). This can make a company appear more profitable per share.
              </p>
            </div>

            <div>
              <h4 className="font-semibold text-foreground mb-2">What are the limitations of EPS?</h4>
              <p className="text-muted-foreground">
                EPS can be manipulated through accounting practices, doesn't account for debt levels, and can be affected by one-time events. It should be used alongside other financial metrics.
              </p>
            </div>

            <div>
              <h4 className="font-semibold text-foreground mb-2">How do I compare EPS across companies?</h4>
              <p className="text-muted-foreground">
                Compare EPS within the same industry and similar business models. Consider company size, growth stage, and business model differences when making comparisons.
              </p>
            </div>

            <div>
              <h4 className="font-semibold text-foreground mb-2">What's the difference between trailing and forward EPS?</h4>
              <p className="text-muted-foreground">
                Trailing EPS uses historical earnings (past 12 months), while forward EPS uses projected earnings. Trailing EPS shows actual performance, while forward EPS reflects growth expectations.
              </p>
            </div>
          </CardContent>
        </Card>
      </div>
    </div>
  );
}
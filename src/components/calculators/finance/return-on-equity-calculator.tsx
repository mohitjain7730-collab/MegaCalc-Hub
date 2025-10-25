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
  shareholdersEquity: z.number().positive(),
});

type FormValues = z.infer<typeof formSchema>;

export default function ReturnOnEquityCalculator() {
  const [result, setResult] = useState<{ 
    roe: number; 
    interpretation: string; 
    recommendation: string;
    efficiency: string;
    riskLevel: string;
    insights: string[];
    considerations: string[];
  } | null>(null);

  const form = useForm<FormValues>({
    resolver: zodResolver(formSchema),
    defaultValues: {
      netIncome: undefined,
      shareholdersEquity: undefined,
    },
  });

  const calculate = (v: FormValues) => {
    if (v.netIncome == null || v.shareholdersEquity == null) return null;
    return (v.netIncome / v.shareholdersEquity) * 100;
  };

  const interpret = (roe: number) => {
    if (roe > 20) return 'Excellent ROE indicates highly efficient use of shareholder equity.';
    if (roe > 15) return 'Good ROE suggests effective management of shareholder capital.';
    if (roe > 10) return 'Moderate ROE indicates reasonable efficiency in equity utilization.';
    if (roe > 5) return 'Low ROE suggests inefficient use of shareholder equity.';
    return 'Very low ROE indicates poor management efficiency or financial challenges.';
  };

  const getEfficiency = (roe: number) => {
    if (roe > 20) return 'Highly Efficient';
    if (roe > 15) return 'Efficient';
    if (roe > 10) return 'Moderately Efficient';
    if (roe > 5) return 'Inefficient';
    return 'Very Inefficient';
  };

  const getRiskLevel = (roe: number) => {
    if (roe > 25) return 'Low';
    if (roe > 15) return 'Moderate';
    if (roe > 10) return 'High';
    return 'Very High';
  };

  const getInsights = (roe: number) => {
    const insights = [];
    
    if (roe > 20) {
      insights.push('Exceptional management efficiency in generating returns');
      insights.push('Strong competitive advantage and operational excellence');
    } else if (roe > 15) {
      insights.push('Good management efficiency and capital utilization');
      insights.push('Solid operational performance');
    } else if (roe > 10) {
      insights.push('Moderate efficiency in equity utilization');
      insights.push('Room for improvement in management effectiveness');
    } else {
      insights.push('Low efficiency suggests management or operational challenges');
      insights.push('May indicate competitive disadvantages or poor capital allocation');
    }

    if (roe > 30) {
      insights.push('Outstanding ROE may indicate exceptional business model or temporary factors');
    }

    return insights;
  };

  const getConsiderations = (roe: number) => {
    const considerations = [];
    
    considerations.push('Compare ROE with industry peers and historical performance');
    considerations.push('Consider the company\'s business model and competitive position');
    considerations.push('Evaluate the sustainability of high ROE levels');
    
    if (roe > 25) {
      considerations.push('Very high ROE may not be sustainable long-term');
      considerations.push('Investigate if high ROE is due to temporary factors or competitive advantages');
    } else if (roe < 10) {
      considerations.push('Low ROE requires investigation of underlying causes');
      considerations.push('Consider if the company is in a turnaround phase or facing challenges');
    }

    considerations.push('Monitor ROE trends over multiple periods');
    considerations.push('Consider the impact of leverage on ROE calculations');

    return considerations;
  };

  const recommendation = (roe: number) => {
    if (roe > 20) {
      return 'Excellent ROE indicates strong management - consider for investment.';
    } else if (roe > 15) {
      return 'Good ROE suggests solid management - evaluate alongside other metrics.';
    } else if (roe > 10) {
      return 'Moderate ROE requires careful analysis of business fundamentals.';
    } else {
      return 'Low ROE suggests management challenges - proceed with caution.';
    }
  };

  const onSubmit = (values: FormValues) => {
    const roe = calculate(values);
    if (roe == null) { setResult(null); return; }
    setResult({ 
      roe, 
      interpretation: interpret(roe), 
      recommendation: recommendation(roe),
      efficiency: getEfficiency(roe),
      riskLevel: getRiskLevel(roe),
      insights: getInsights(roe),
      considerations: getConsiderations(roe)
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
            Enter the company's net income and shareholders' equity to calculate ROE
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
                
                <FormField control={form.control} name="shareholdersEquity" render={({ field }) => (
              <FormItem>
                    <FormLabel className="flex items-center gap-2">
                      <BarChart3 className="h-4 w-4" />
                      Shareholders' Equity ($)
                    </FormLabel>
                <FormControl>
                      <Input 
                        type="number" 
                        step="0.01"
                        placeholder="e.g., 5000000" 
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
                Calculate ROE
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
                  <CardTitle>Return on Equity Analysis</CardTitle>
                  <CardDescription>Management efficiency assessment and investment insights</CardDescription>
                </div>
              </div>
            </CardHeader>
            <CardContent>
              <div className="grid grid-cols-1 md:grid-cols-3 gap-6 mb-8">
                <div className="text-center p-6 bg-primary/5 rounded-lg">
                  <div className="flex items-center justify-center gap-2 mb-2">
                    <Percent className="h-5 w-5 text-primary" />
                    <span className="text-sm font-medium text-muted-foreground">ROE</span>
                  </div>
                  <p className="text-3xl font-bold text-primary">
                    {result.roe.toFixed(2)}%
                  </p>
                  <p className="text-sm text-muted-foreground mt-1">
                    {result.efficiency}
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
                    {result.roe > 20 ? 'Strong' : result.roe > 15 ? 'Consider' : 'Caution'}
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
                  <a href="/category/finance/earnings-per-share-calculator" className="text-primary hover:underline">
                    Earnings per Share Calculator
                  </a>
                </h4>
                <p className="text-sm text-muted-foreground">
                  Calculate EPS to understand company profitability per share.
                </p>
              </div>
              <div className="p-4 border rounded-lg hover:bg-muted/50 transition-colors">
                <h4 className="font-semibold mb-2">
                  <a href="/category/finance/debt-to-equity-ratio-calculator" className="text-primary hover:underline">
                    Debt-to-Equity Ratio Calculator
                  </a>
                </h4>
                <p className="text-sm text-muted-foreground">
                  Calculate debt-to-equity ratio to assess financial leverage.
                </p>
              </div>
              <div className="p-4 border rounded-lg hover:bg-muted/50 transition-colors">
                <h4 className="font-semibold mb-2">
                  <a href="/category/finance/return-on-investment-calculator" className="text-primary hover:underline">
                    ROI Calculator
                  </a>
                </h4>
                <p className="text-sm text-muted-foreground">
                  Calculate ROI to assess investment returns and efficiency.
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
              Complete Guide to Return on Equity
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
              Common questions about Return on Equity analysis and management efficiency
            </CardDescription>
          </CardHeader>
          <CardContent className="space-y-6">
            <div>
              <h4 className="font-semibold text-foreground mb-2">What is Return on Equity (ROE)?</h4>
              <p className="text-muted-foreground">
                ROE measures how efficiently a company uses shareholders' equity to generate profits. It's calculated as Net Income ÷ Shareholders' Equity × 100.
              </p>
            </div>

            <div>
              <h4 className="font-semibold text-foreground mb-2">How do I calculate ROE?</h4>
              <p className="text-muted-foreground">
                ROE = (Net Income ÷ Shareholders' Equity) × 100. For example, if a company has $1 million in net income and $5 million in shareholders' equity, the ROE is 20%.
              </p>
            </div>

            <div>
              <h4 className="font-semibold text-foreground mb-2">What's a good ROE?</h4>
              <p className="text-muted-foreground">
                A good ROE typically ranges from 15-20% or higher. However, this varies by industry. Compare with industry peers and historical performance for better context.
              </p>
            </div>

            <div>
              <h4 className="font-semibold text-foreground mb-2">What does a high ROE indicate?</h4>
              <p className="text-muted-foreground">
                High ROE indicates efficient management of shareholder capital, strong competitive advantages, or effective use of leverage. It suggests the company generates good returns on equity investments.
              </p>
            </div>

            <div>
              <h4 className="font-semibold text-foreground mb-2">What does a low ROE indicate?</h4>
              <p className="text-muted-foreground">
                Low ROE may indicate inefficient management, poor capital allocation, competitive disadvantages, or operational challenges. It suggests the company isn't generating adequate returns on equity.
              </p>
            </div>

            <div>
              <h4 className="font-semibold text-foreground mb-2">How does leverage affect ROE?</h4>
              <p className="text-muted-foreground">
                Higher leverage (debt) can increase ROE when the cost of debt is lower than the return on assets. However, excessive leverage increases financial risk and can lead to volatile ROE.
              </p>
            </div>

            <div>
              <h4 className="font-semibold text-foreground mb-2">Can ROE be negative?</h4>
              <p className="text-muted-foreground">
                Yes, ROE can be negative when a company has net losses. Negative ROE indicates the company is destroying shareholder value and may signal serious financial problems.
              </p>
            </div>

            <div>
              <h4 className="font-semibold text-foreground mb-2">What are the limitations of ROE?</h4>
              <p className="text-muted-foreground">
                ROE can be manipulated through accounting practices, doesn't account for risk, and can be inflated by excessive leverage. It should be used alongside other financial metrics.
              </p>
            </div>

            <div>
              <h4 className="font-semibold text-foreground mb-2">How do I compare ROE across companies?</h4>
              <p className="text-muted-foreground">
                Compare ROE within the same industry and similar business models. Consider company size, growth stage, and leverage levels when making comparisons.
              </p>
            </div>

            <div>
              <h4 className="font-semibold text-foreground mb-2">What's the difference between ROE and ROA?</h4>
              <p className="text-muted-foreground">
                ROE measures returns on shareholders' equity, while ROA measures returns on total assets. ROE includes the effect of leverage, while ROA shows pure operational efficiency.
              </p>
            </div>
          </CardContent>
        </Card>
      </div>
    </div>
  );
}
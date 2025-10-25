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
  totalAssets: z.number().positive(),
});

type FormValues = z.infer<typeof formSchema>;

export default function ReturnOnAssetsCalculator() {
  const [result, setResult] = useState<{ 
    roa: number; 
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
      totalAssets: undefined,
    },
  });

  const calculate = (v: FormValues) => {
    if (v.netIncome == null || v.totalAssets == null) return null;
    return (v.netIncome / v.totalAssets) * 100;
  };

  const interpret = (roa: number) => {
    if (roa > 10) return 'Excellent ROA indicates highly efficient asset utilization.';
    if (roa > 5) return 'Good ROA suggests effective use of company assets.';
    if (roa > 2) return 'Moderate ROA indicates reasonable asset efficiency.';
    if (roa > 0) return 'Low ROA suggests inefficient asset utilization.';
    return 'Negative ROA indicates asset destruction and poor operational efficiency.';
  };

  const getEfficiency = (roa: number) => {
    if (roa > 10) return 'Highly Efficient';
    if (roa > 5) return 'Efficient';
    if (roa > 2) return 'Moderately Efficient';
    if (roa > 0) return 'Inefficient';
    return 'Very Inefficient';
  };

  const getRiskLevel = (roa: number) => {
    if (roa > 8) return 'Low';
    if (roa > 4) return 'Moderate';
    if (roa > 1) return 'High';
    return 'Very High';
  };

  const getInsights = (roa: number) => {
    const insights = [];
    
    if (roa > 10) {
      insights.push('Exceptional asset utilization and operational efficiency');
      insights.push('Strong competitive advantages and operational excellence');
    } else if (roa > 5) {
      insights.push('Good asset utilization and operational efficiency');
      insights.push('Solid operational performance');
    } else if (roa > 2) {
      insights.push('Moderate asset efficiency with room for improvement');
      insights.push('Consider operational optimization opportunities');
    } else {
      insights.push('Low asset efficiency suggests operational challenges');
      insights.push('May indicate competitive disadvantages or poor asset management');
    }

    if (roa > 15) {
      insights.push('Outstanding ROA may indicate exceptional business model or temporary factors');
    }

    return insights;
  };

  const getConsiderations = (roa: number) => {
    const considerations = [];
    
    considerations.push('Compare ROA with industry peers and historical performance');
    considerations.push('Consider the company\'s business model and asset intensity');
    considerations.push('Evaluate the sustainability of high ROA levels');
    
    if (roa > 15) {
      considerations.push('Very high ROA may not be sustainable long-term');
      considerations.push('Investigate if high ROA is due to temporary factors or competitive advantages');
    } else if (roa < 2) {
      considerations.push('Low ROA requires investigation of underlying causes');
      considerations.push('Consider if the company is in a turnaround phase or facing challenges');
    }

    considerations.push('Monitor ROA trends over multiple periods');
    considerations.push('Consider the impact of asset write-downs on ROA calculations');

    return considerations;
  };

  const recommendation = (roa: number) => {
    if (roa > 8) {
      return 'Excellent ROA indicates strong operational efficiency - consider for investment.';
    } else if (roa > 4) {
      return 'Good ROA suggests solid operations - evaluate alongside other metrics.';
    } else if (roa > 1) {
      return 'Moderate ROA requires careful analysis of operational fundamentals.';
    } else {
      return 'Low ROA suggests operational challenges - proceed with caution.';
    }
  };

  const onSubmit = (values: FormValues) => {
    const roa = calculate(values);
    if (roa == null) { setResult(null); return; }
    setResult({ 
      roa, 
      interpretation: interpret(roa), 
      recommendation: recommendation(roa),
      efficiency: getEfficiency(roa),
      riskLevel: getRiskLevel(roa),
      insights: getInsights(roa),
      considerations: getConsiderations(roa)
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
            Enter the company's net income and total assets to calculate ROA
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
                
                <FormField control={form.control} name="totalAssets" render={({ field }) => (
              <FormItem>
                    <FormLabel className="flex items-center gap-2">
                      <BarChart3 className="h-4 w-4" />
                      Total Assets ($)
                    </FormLabel>
                <FormControl>
                      <Input 
                        type="number" 
                        step="0.01"
                        placeholder="e.g., 10000000" 
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
                Calculate ROA
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
                  <CardTitle>Return on Assets Analysis</CardTitle>
                  <CardDescription>Asset utilization efficiency assessment and investment insights</CardDescription>
                </div>
              </div>
            </CardHeader>
            <CardContent>
              <div className="grid grid-cols-1 md:grid-cols-3 gap-6 mb-8">
                <div className="text-center p-6 bg-primary/5 rounded-lg">
                  <div className="flex items-center justify-center gap-2 mb-2">
                    <Percent className="h-5 w-5 text-primary" />
                    <span className="text-sm font-medium text-muted-foreground">ROA</span>
                  </div>
                  <p className="text-3xl font-bold text-primary">
                    {result.roa.toFixed(2)}%
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
                    {result.roa > 8 ? 'Strong' : result.roa > 4 ? 'Consider' : 'Caution'}
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
                  <a href="/category/finance/return-on-investment-calculator" className="text-primary hover:underline">
                    ROI Calculator
                  </a>
                </h4>
                <p className="text-sm text-muted-foreground">
                  Calculate ROI to assess investment returns and efficiency.
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
                  <a href="/category/finance/operating-margin-calculator" className="text-primary hover:underline">
                    Operating Margin Calculator
                  </a>
                </h4>
                <p className="text-sm text-muted-foreground">
                  Calculate operating margin to assess operational profitability.
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
              Complete Guide to Return on Assets
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
              Common questions about Return on Assets analysis and operational efficiency
            </CardDescription>
          </CardHeader>
          <CardContent className="space-y-6">
            <div>
              <h4 className="font-semibold text-foreground mb-2">What is Return on Assets (ROA)?</h4>
              <p className="text-muted-foreground">
                ROA measures how efficiently a company uses its assets to generate profits. It's calculated as Net Income ÷ Total Assets × 100.
              </p>
            </div>

            <div>
              <h4 className="font-semibold text-foreground mb-2">How do I calculate ROA?</h4>
              <p className="text-muted-foreground">
                ROA = (Net Income ÷ Total Assets) × 100. For example, if a company has $1 million in net income and $10 million in total assets, the ROA is 10%.
              </p>
            </div>

            <div>
              <h4 className="font-semibold text-foreground mb-2">What's a good ROA?</h4>
              <p className="text-muted-foreground">
                A good ROA typically ranges from 5-10% or higher. However, this varies by industry. Compare with industry peers and historical performance for better context.
              </p>
            </div>

            <div>
              <h4 className="font-semibold text-foreground mb-2">What does a high ROA indicate?</h4>
              <p className="text-muted-foreground">
                High ROA indicates efficient use of assets, strong operational performance, or competitive advantages. It suggests the company generates good returns on its asset investments.
              </p>
            </div>

            <div>
              <h4 className="font-semibold text-foreground mb-2">What does a low ROA indicate?</h4>
              <p className="text-muted-foreground">
                Low ROA may indicate inefficient asset utilization, operational challenges, or competitive disadvantages. It suggests the company isn't generating adequate returns on its assets.
              </p>
            </div>

            <div>
              <h4 className="font-semibold text-foreground mb-2">How does ROA differ from ROE?</h4>
              <p className="text-muted-foreground">
                ROA measures returns on total assets, while ROE measures returns on shareholders' equity. ROA shows pure operational efficiency, while ROE includes the effect of leverage.
              </p>
            </div>

            <div>
              <h4 className="font-semibold text-foreground mb-2">Can ROA be negative?</h4>
              <p className="text-muted-foreground">
                Yes, ROA can be negative when a company has net losses. Negative ROA indicates the company is destroying asset value and may signal serious operational problems.
              </p>
            </div>

            <div>
              <h4 className="font-semibold text-foreground mb-2">What are the limitations of ROA?</h4>
              <p className="text-muted-foreground">
                ROA can be affected by asset write-downs, doesn't account for risk, and can vary significantly by industry. It should be used alongside other financial metrics.
              </p>
            </div>

            <div>
              <h4 className="font-semibold text-foreground mb-2">How do I compare ROA across companies?</h4>
              <p className="text-muted-foreground">
                Compare ROA within the same industry and similar business models. Consider company size, growth stage, and asset intensity when making comparisons.
              </p>
            </div>

            <div>
              <h4 className="font-semibold text-foreground mb-2">What factors can affect ROA?</h4>
              <p className="text-muted-foreground">
                ROA can be affected by operational efficiency, asset utilization, pricing power, cost management, industry conditions, and economic cycles.
              </p>
            </div>
          </CardContent>
        </Card>
      </div>
    </div>
  );
}
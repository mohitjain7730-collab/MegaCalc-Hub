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
  gainFromInvestment: z.number(),
  costOfInvestment: z.number().positive(),
});

type FormValues = z.infer<typeof formSchema>;

export default function ReturnOnInvestmentCalculator() {
  const [result, setResult] = useState<{ 
    roi: number; 
    interpretation: string; 
    recommendation: string;
    performance: string;
    riskLevel: string;
    insights: string[];
    considerations: string[];
  } | null>(null);

  const form = useForm<FormValues>({
    resolver: zodResolver(formSchema),
    defaultValues: {
      gainFromInvestment: undefined,
      costOfInvestment: undefined,
    },
  });

  const calculate = (v: FormValues) => {
    if (v.gainFromInvestment == null || v.costOfInvestment == null) return null;
    return ((v.gainFromInvestment - v.costOfInvestment) / v.costOfInvestment) * 100;
  };

  const interpret = (roi: number) => {
    if (roi > 50) return 'Excellent ROI indicates highly profitable investment.';
    if (roi > 20) return 'Good ROI suggests solid investment returns.';
    if (roi > 10) return 'Moderate ROI indicates reasonable investment performance.';
    if (roi > 0) return 'Low ROI suggests minimal investment returns.';
    return 'Negative ROI indicates investment losses and poor performance.';
  };

  const getPerformance = (roi: number) => {
    if (roi > 50) return 'Exceptional';
    if (roi > 20) return 'Strong';
    if (roi > 10) return 'Moderate';
    if (roi > 0) return 'Weak';
    return 'Poor';
  };

  const getRiskLevel = (roi: number) => {
    if (roi > 30) return 'Low';
    if (roi > 10) return 'Moderate';
    if (roi > 0) return 'High';
    return 'Very High';
  };

  const getInsights = (roi: number) => {
    const insights = [];
    
    if (roi > 50) {
      insights.push('Exceptional investment performance and returns');
      insights.push('Strong competitive advantages or market opportunities');
    } else if (roi > 20) {
      insights.push('Good investment performance and solid returns');
      insights.push('Effective investment strategy and execution');
    } else if (roi > 10) {
      insights.push('Moderate investment performance with room for improvement');
      insights.push('Consider optimization opportunities');
    } else if (roi > 0) {
      insights.push('Low investment returns suggest challenges or poor timing');
      insights.push('May indicate market conditions or execution issues');
    } else {
      insights.push('Negative returns indicate investment losses');
      insights.push('Requires immediate attention and strategy review');
    }

    if (roi > 100) {
      insights.push('Outstanding ROI may indicate exceptional opportunities or temporary factors');
    }

    return insights;
  };

  const getConsiderations = (roi: number) => {
    const considerations = [];
    
    considerations.push('Compare ROI with alternative investment opportunities');
    considerations.push('Consider the time horizon and risk profile of the investment');
    considerations.push('Evaluate the sustainability of high ROI levels');
    
    if (roi > 50) {
      considerations.push('Very high ROI may not be sustainable long-term');
      considerations.push('Investigate if high ROI is due to temporary factors or competitive advantages');
    } else if (roi < 5) {
      considerations.push('Low ROI requires investigation of underlying causes');
      considerations.push('Consider if the investment is in a turnaround phase or facing challenges');
    }

    considerations.push('Monitor ROI trends over multiple periods');
    considerations.push('Consider the impact of market conditions on ROI calculations');

    return considerations;
  };

  const recommendation = (roi: number) => {
    if (roi > 30) {
      return 'Excellent ROI indicates strong investment performance - consider expanding or replicating.';
    } else if (roi > 15) {
      return 'Good ROI suggests solid investment - evaluate alongside other factors.';
    } else if (roi > 5) {
      return 'Moderate ROI requires careful analysis of investment fundamentals.';
    } else {
      return 'Low ROI suggests investment challenges - consider exit or strategy changes.';
    }
  };

  const onSubmit = (values: FormValues) => {
    const roi = calculate(values);
    if (roi == null) { setResult(null); return; }
    setResult({ 
      roi, 
      interpretation: interpret(roi), 
      recommendation: recommendation(roi),
      performance: getPerformance(roi),
      riskLevel: getRiskLevel(roi),
      insights: getInsights(roi),
      considerations: getConsiderations(roi)
    });
  };

  return (
    <div className="space-y-8">

      {/* Input Form */}
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <Target className="h-5 w-5" />
            Investment Parameters
          </CardTitle>
          <CardDescription>
            Enter your investment details to calculate the return on investment
          </CardDescription>
        </CardHeader>
        <CardContent>
          <Form {...form}>
            <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-6">
              <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                <FormField control={form.control} name="gainFromInvestment" render={({ field }) => (
                  <FormItem>
                    <FormLabel className="flex items-center gap-2">
                      <TrendingUp className="h-4 w-4" />
                      Gain from Investment ($)
                    </FormLabel>
                    <FormControl>
                      <Input 
                        type="number" 
                        step="0.01"
                        placeholder="e.g., 150000" 
                        {...field} 
                        value={field.value ?? ''} 
                        onChange={e => field.onChange(parseFloat(e.target.value) || undefined)} 
                      />
                    </FormControl>
                    <FormMessage />
                  </FormItem>
                )} />
                
                <FormField control={form.control} name="costOfInvestment" render={({ field }) => (
                  <FormItem>
                    <FormLabel className="flex items-center gap-2">
                      <DollarSign className="h-4 w-4" />
                      Cost of Investment ($)
                    </FormLabel>
                    <FormControl>
                      <Input 
                        type="number" 
                        step="0.01"
                        placeholder="e.g., 100000" 
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
                Calculate ROI
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
                  <CardTitle>Return on Investment Analysis</CardTitle>
                  <CardDescription>Investment performance assessment and insights</CardDescription>
                </div>
              </div>
            </CardHeader>
            <CardContent>
              <div className="grid grid-cols-1 md:grid-cols-3 gap-6 mb-8">
                <div className="text-center p-6 bg-primary/5 rounded-lg">
                  <div className="flex items-center justify-center gap-2 mb-2">
                    <Percent className="h-5 w-5 text-primary" />
                    <span className="text-sm font-medium text-muted-foreground">ROI</span>
                  </div>
                  <p className="text-3xl font-bold text-primary">
                    {result.roi.toFixed(2)}%
                  </p>
                  <p className="text-sm text-muted-foreground mt-1">
                    {result.performance}
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
                    {result.roi > 30 ? 'Excellent' : result.roi > 15 ? 'Good' : 'Review'}
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
                  <a href="/category/finance/npv-calculator" className="text-primary hover:underline">
                    Net Present Value Calculator
                  </a>
                </h4>
                <p className="text-sm text-muted-foreground">
                  Calculate NPV to evaluate investment profitability and decision-making.
                </p>
              </div>
              <div className="p-4 border rounded-lg hover:bg-muted/50 transition-colors">
                <h4 className="font-semibold mb-2">
                  <a href="/category/finance/payback-period-calculator" className="text-primary hover:underline">
                    Payback Period Calculator
                  </a>
                </h4>
                <p className="text-sm text-muted-foreground">
                  Calculate payback period to assess investment recovery time.
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
            </div>
          </CardContent>
        </Card>

        {/* Guide Section */}
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <Calculator className="h-5 w-5" />
              Complete Guide to Return on Investment
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
              Common questions about Return on Investment analysis and performance measurement
            </CardDescription>
          </CardHeader>
          <CardContent className="space-y-6">
            <div>
              <h4 className="font-semibold text-foreground mb-2">What is Return on Investment (ROI)?</h4>
              <p className="text-muted-foreground">
                ROI is a performance measure used to evaluate the efficiency of an investment. It's calculated as (Gain from Investment - Cost of Investment) ÷ Cost of Investment × 100.
              </p>
            </div>

            <div>
              <h4 className="font-semibold text-foreground mb-2">How do I calculate ROI?</h4>
              <p className="text-muted-foreground">
                ROI = ((Gain from Investment - Cost of Investment) ÷ Cost of Investment) × 100. For example, if you invest $100,000 and gain $150,000, your ROI is 50%.
              </p>
            </div>

            <div>
              <h4 className="font-semibold text-foreground mb-2">What's a good ROI?</h4>
              <p className="text-muted-foreground">
                A good ROI depends on the investment type and risk level. Generally, 10-20% is considered good for most investments, but this varies significantly by asset class and market conditions.
              </p>
            </div>

            <div>
              <h4 className="font-semibold text-foreground mb-2">What does a high ROI indicate?</h4>
              <p className="text-muted-foreground">
                High ROI indicates efficient use of capital, strong investment performance, or favorable market conditions. It suggests the investment generated significant returns relative to the initial cost.
              </p>
            </div>

            <div>
              <h4 className="font-semibold text-foreground mb-2">What does a low ROI indicate?</h4>
              <p className="text-muted-foreground">
                Low ROI may indicate poor investment performance, unfavorable market conditions, or inefficient use of capital. It suggests the investment didn't generate adequate returns relative to the initial cost.
              </p>
            </div>

            <div>
              <h4 className="font-semibold text-foreground mb-2">Can ROI be negative?</h4>
              <p className="text-muted-foreground">
                Yes, ROI can be negative when the gain from investment is less than the cost of investment. Negative ROI indicates investment losses and poor performance.
              </p>
            </div>

            <div>
              <h4 className="font-semibold text-foreground mb-2">What are the limitations of ROI?</h4>
              <p className="text-muted-foreground">
                ROI doesn't account for the time value of money, risk levels, or the time horizon of the investment. It should be used alongside other metrics like NPV and payback period.
              </p>
            </div>

            <div>
              <h4 className="font-semibold text-foreground mb-2">How do I compare ROI across different investments?</h4>
              <p className="text-muted-foreground">
                Compare ROI within similar asset classes and time horizons. Consider risk levels, market conditions, and investment objectives when making comparisons.
              </p>
            </div>

            <div>
              <h4 className="font-semibold text-foreground mb-2">What's the difference between ROI and ROE?</h4>
              <p className="text-muted-foreground">
                ROI measures returns on any investment, while ROE specifically measures returns on shareholders' equity. ROI is broader and can apply to any investment, while ROE is specific to equity investments.
              </p>
            </div>

            <div>
              <h4 className="font-semibold text-foreground mb-2">How often should I calculate ROI?</h4>
              <p className="text-muted-foreground">
                Calculate ROI regularly to monitor investment performance. The frequency depends on the investment type - daily for trading, monthly for active investments, or annually for long-term investments.
              </p>
            </div>
          </CardContent>
        </Card>
      </div>
    </div>
  );
}
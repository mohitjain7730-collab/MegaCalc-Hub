'use client';

import { useState } from 'react';
import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import { z } from 'zod';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Form, FormControl, FormField, FormItem, FormLabel, FormMessage } from '@/components/ui/form';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Percent, AlertCircle, Target, Info, Landmark, Calculator, DollarSign, TrendingUp, Shield, Award } from 'lucide-react';
import { Badge } from '@/components/ui/badge';
import { Alert, AlertDescription } from '@/components/ui/alert';
import Link from 'next/link';

const formSchema = z.object({
  netIncome: z.number(),
  revenue: z.number().positive(),
});

type FormValues = z.infer<typeof formSchema>;

export default function NetProfitMarginCalculator() {
  const [result, setResult] = useState<{ 
    margin: number; 
    interpretation: string; 
    profitabilityLevel: string;
    recommendation: string;
    strength: string;
    insights: string[];
    considerations: string[];
  } | null>(null);

  const form = useForm<FormValues>({
    resolver: zodResolver(formSchema),
    defaultValues: {
      netIncome: undefined,
      revenue: undefined,
    },
  });

  const calculate = (v: FormValues) => {
    if (v.netIncome == null || v.revenue == null) return null;
    return (v.netIncome / v.revenue) * 100;
  };

  const interpret = (margin: number) => {
    if (margin >= 20) return 'Excellent net profitability with strong overall financial performance.';
    if (margin >= 15) return 'Good net profitability with healthy financial results.';
    if (margin >= 10) return 'Adequate net profitability but monitor overall efficiency.';
    if (margin >= 5) return 'Marginal net profitability - comprehensive financial concerns.';
    return 'Poor net profitability - immediate financial distress.';
  };

  const getProfitabilityLevel = (margin: number) => {
    if (margin >= 20) return 'Excellent';
    if (margin >= 15) return 'Good';
    if (margin >= 10) return 'Adequate';
    if (margin >= 5) return 'Marginal';
    return 'Poor';
  };

  const getRecommendation = (margin: number) => {
    if (margin >= 20) return 'Maintain financial excellence and consider strategic investments.';
    if (margin >= 15) return 'Continue current financial management and optimize further.';
    if (margin >= 10) return 'Focus on comprehensive cost management and revenue optimization.';
    if (margin >= 5) return 'Urgent need to improve overall financial performance.';
    return 'Critical situation - immediate financial restructuring required.';
  };

  const getStrength = (margin: number) => {
    if (margin >= 20) return 'Very Strong';
    if (margin >= 15) return 'Strong';
    if (margin >= 10) return 'Moderate';
    if (margin >= 5) return 'Weak';
    return 'Very Weak';
  };

  const getInsights = (margin: number) => {
    const insights = [];
    if (margin >= 20) {
      insights.push('Exceptional overall profitability');
      insights.push('Strong financial management');
      insights.push('Excellent competitive position');
    } else if (margin >= 15) {
      insights.push('Healthy overall profitability');
      insights.push('Good financial control');
      insights.push('Strong market position');
    } else if (margin >= 10) {
      insights.push('Adequate overall profitability');
      insights.push('Room for financial optimization');
      insights.push('Monitor competitive position');
    } else if (margin >= 5) {
      insights.push('Marginal overall profitability');
      insights.push('High sensitivity to financial changes');
      insights.push('Urgent need for financial improvements');
    } else {
      insights.push('Poor overall profitability');
      insights.push('Immediate financial distress');
      insights.push('Critical financial management issues');
    }
    return insights;
  };

  const getConsiderations = (margin: number) => {
    const considerations = [];
    considerations.push('Industry benchmarks vary significantly');
    considerations.push('Seasonal businesses may have fluctuating margins');
    considerations.push('One-time items can distort net income');
    considerations.push('Compare with historical performance');
    considerations.push('Consider tax rates and interest expenses');
    return considerations;
  };

  const onSubmit = (values: FormValues) => {
    const margin = calculate(values);
    if (margin !== null) {
      setResult({
        margin,
        interpretation: interpret(margin),
        profitabilityLevel: getProfitabilityLevel(margin),
        recommendation: getRecommendation(margin),
        strength: getStrength(margin),
        insights: getInsights(margin),
        considerations: getConsiderations(margin)
      });
    }
  };

  return (
    <div className="space-y-8">
      <Card>
        <CardHeader>
          <div className="flex items-center gap-2">
            <Percent className="h-6 w-6 text-primary" />
            <CardTitle>Net Profit Margin Calculator</CardTitle>
          </div>
          <CardDescription>
            Calculate your company's net profit margin to assess overall profitability and financial health
          </CardDescription>
        </CardHeader>
        <CardContent>
          <Form {...form}>
            <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-6">
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <FormField control={form.control} name="netIncome" render={({ field }) => (
                  <FormItem>
                    <FormLabel className="flex items-center gap-2">
                      <Award className="h-4 w-4" />
                      Net Income (Profit)
                    </FormLabel>
                    <FormControl>
                      <Input type="number" placeholder="Enter net income" {...field} value={field.value ?? ''} onChange={e => field.onChange(parseFloat(e.target.value) || undefined)} />
                    </FormControl>
                    <FormMessage />
                  </FormItem>
                )} />
                <FormField control={form.control} name="revenue" render={({ field }) => (
                  <FormItem>
                    <FormLabel className="flex items-center gap-2">
                      <DollarSign className="h-4 w-4" />
                      Net Sales (Revenue)
                    </FormLabel>
                    <FormControl>
                      <Input type="number" placeholder="Enter net sales" {...field} value={field.value ?? ''} onChange={e => field.onChange(parseFloat(e.target.value) || undefined)} />
                    </FormControl>
                    <FormMessage />
                  </FormItem>
                )} />
              </div>
              <Button type="submit" className="w-full">
                <Calculator className="h-4 w-4 mr-2" />
                Calculate Net Profit Margin
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
                  <CardTitle>Net Profit Margin Result</CardTitle>
                </div>
                <div className="flex gap-2">
                  <Badge variant={result.profitabilityLevel === 'Excellent' ? 'default' : result.profitabilityLevel === 'Good' ? 'secondary' : 'destructive'}>
                    {result.profitabilityLevel}
                  </Badge>
                  <Badge variant="outline">{result.strength}</Badge>
                </div>
              </div>
            </CardHeader>
            <CardContent>
              <div className="text-center space-y-4">
                <div className="text-4xl font-bold text-primary">
                  {result.margin.toFixed(2)}%
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
            Explore other essential financial metrics for comprehensive business analysis
          </CardDescription>
        </CardHeader>
        <CardContent>
          <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
            <Link href="/category/finance/gross-margin-calculator" className="group">
              <Card className="group-hover:shadow-md transition-shadow">
                <CardContent className="p-4 text-center">
                  <TrendingUp className="h-8 w-8 mx-auto mb-2 text-primary" />
                  <p className="text-sm font-medium">Gross Margin</p>
                </CardContent>
              </Card>
            </Link>
            <Link href="/category/finance/operating-margin-calculator" className="group">
              <Card className="group-hover:shadow-md transition-shadow">
                <CardContent className="p-4 text-center">
                  <Percent className="h-8 w-8 mx-auto mb-2 text-primary" />
                  <p className="text-sm font-medium">Operating Margin</p>
                </CardContent>
              </Card>
            </Link>
            <Link href="/category/finance/free-cash-flow-calculator" className="group">
              <Card className="group-hover:shadow-md transition-shadow">
                <CardContent className="p-4 text-center">
                  <DollarSign className="h-8 w-8 mx-auto mb-2 text-primary" />
                  <p className="text-sm font-medium">Free Cash Flow</p>
                </CardContent>
              </Card>
            </Link>
            <Link href="/category/finance/ebitda-ebit-calculator" className="group">
              <Card className="group-hover:shadow-md transition-shadow">
                <CardContent className="p-4 text-center">
                  <Calculator className="h-8 w-8 mx-auto mb-2 text-primary" />
                  <p className="text-sm font-medium">EBITDA/EBIT</p>
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
            Complete Guide to Net Profit Margin
          </CardTitle>
          <CardDescription>
            Everything you need to know about calculating and interpreting net profit margin
          </CardDescription>
        </CardHeader>
        <CardContent className="space-y-4">
          <p className="text-muted-foreground">
            Net Profit Margin is the ultimate profitability ratio that measures how much profit a company makes on each dollar of sales after accounting for all expenses, including operating costs, interest, and taxes. It's calculated by dividing net income by revenue and expressing the result as a percentage.
          </p>
          <p className="text-muted-foreground">
            This metric provides the most comprehensive view of a company's profitability and financial health. It indicates how effectively management converts revenue into profit and is crucial for investors, creditors, and management in assessing overall financial performance.
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
            Common questions about Net Profit Margin
          </CardDescription>
        </CardHeader>
        <CardContent>
          <div className="space-y-6">
            <div>
              <h4 className="font-semibold text-lg mb-3">What is Net Profit Margin?</h4>
              <p className="text-muted-foreground">
                Net Profit Margin is a profitability ratio that measures how much profit a company makes on each dollar of sales after accounting for all expenses, including operating costs, interest, and taxes. It's calculated as Net Income ÷ Revenue × 100, expressed as a percentage.
              </p>
            </div>
            
            <div>
              <h4 className="font-semibold text-lg mb-3">What is considered a good Net Profit Margin?</h4>
              <p className="text-muted-foreground">
                Good net profit margins vary by industry. Generally, margins above 10% are considered good, above 15% are excellent, and above 5% are adequate. Technology companies often have higher margins (15-25%), while retail companies typically have lower margins (2-5%). Always compare within the same industry.
              </p>
            </div>
            
            <div>
              <h4 className="font-semibold text-lg mb-3">How do I calculate Net Profit Margin?</h4>
              <p className="text-muted-foreground">
                The formula is: Net Profit Margin = (Net Income ÷ Revenue) × 100. Net Income is the bottom line profit after all expenses, found at the bottom of the income statement. Revenue is the total sales amount, found at the top of the income statement.
              </p>
            </div>
            
            <div>
              <h4 className="font-semibold text-lg mb-3">What does negative Net Profit Margin mean?</h4>
              <p className="text-muted-foreground">
                A negative net profit margin means the company is losing money overall, spending more than it earns. This indicates serious financial problems and requires immediate attention to cost management, pricing, or operational restructuring. It's unsustainable in the long term.
              </p>
            </div>
            
            <div>
              <h4 className="font-semibold text-lg mb-3">Do Net Profit Margins vary by industry?</h4>
              <p className="text-muted-foreground">
                Yes, net profit margins vary significantly by industry. Software companies often have high margins due to scalable business models. Manufacturing companies typically have moderate margins. Retail companies usually have low margins due to high competition. Always compare within the same industry for meaningful analysis.
              </p>
            </div>
            
            <div>
              <h4 className="font-semibold text-lg mb-3">What are the limitations of Net Profit Margin?</h4>
              <p className="text-muted-foreground">
                Net profit margin is a snapshot in time and doesn't reflect seasonal variations or one-time items. It doesn't consider the quality of earnings or future growth prospects. It can be manipulated through accounting practices. Compare with historical performance and industry benchmarks for better insights.
              </p>
            </div>
            
            <div>
              <h4 className="font-semibold text-lg mb-3">How can a company improve its Net Profit Margin?</h4>
              <p className="text-muted-foreground">
                Companies can improve net profit margin by increasing revenue through growth or price increases, reducing all types of costs (operating, interest, tax), improving operational efficiency, optimizing capital structure, or focusing on higher-margin products. However, these strategies should be balanced with long-term growth objectives.
              </p>
            </div>
            
            <div>
              <h4 className="font-semibold text-lg mb-3">How does Net Profit Margin differ from other margins?</h4>
              <p className="text-muted-foreground">
                Net Profit Margin includes all expenses (operating, interest, taxes), while Gross Margin only considers direct costs and Operating Margin excludes interest and taxes. Net Profit Margin provides the most comprehensive view of profitability and is always the lowest of the three margin ratios.
              </p>
            </div>
            
            <div>
              <h4 className="font-semibold text-lg mb-3">Why is Net Profit Margin important for investors?</h4>
              <p className="text-muted-foreground">
                For investors, net profit margin indicates overall financial health and management effectiveness. Higher margins suggest better ability to generate returns and weather economic downturns. It helps assess the company's competitive position and provides insight into management's ability to control all aspects of the business.
              </p>
            </div>
            
            <div>
              <h4 className="font-semibold text-lg mb-3">How do creditors use Net Profit Margin?</h4>
              <p className="text-muted-foreground">
                Creditors use net profit margin to assess the company's ability to generate profits and service debt. Higher margins suggest better debt service capability and lower credit risk. Creditors often require minimum net profit margin levels in loan covenants to ensure borrowers maintain adequate profitability.
              </p>
            </div>
          </div>
        </CardContent>
      </Card>
    </div>
  );
}
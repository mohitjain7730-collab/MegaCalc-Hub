'use client';

import { useState } from 'react';
import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import { z } from 'zod';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Form, FormControl, FormField, FormItem, FormLabel, FormMessage } from '@/components/ui/form';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { TrendingUp, AlertCircle, Target, Info, Landmark, Calculator, DollarSign, Percent, Shield, Package } from 'lucide-react';
import { Badge } from '@/components/ui/badge';
import { Alert, AlertDescription } from '@/components/ui/alert';
import Link from 'next/link';

const formSchema = z.object({
  revenue: z.number().positive(),
  cogs: z.number().nonnegative(),
});

type FormValues = z.infer<typeof formSchema>;

export default function GrossMarginCalculator() {
  const [result, setResult] = useState<{ 
    margin: number; 
    interpretation: string; 
    efficiencyLevel: string;
    recommendation: string;
    strength: string;
    insights: string[];
    considerations: string[];
  } | null>(null);

  const form = useForm<FormValues>({
    resolver: zodResolver(formSchema),
    defaultValues: {
      revenue: undefined,
      cogs: undefined,
    },
  });

  const calculate = (v: FormValues) => {
    if (v.revenue == null || v.cogs == null) return null;
    return ((v.revenue - v.cogs) / v.revenue) * 100;
  };

  const interpret = (margin: number) => {
    if (margin >= 50) return 'Excellent gross margin with strong pricing power and cost control.';
    if (margin >= 40) return 'Good gross margin with healthy profitability.';
    if (margin >= 30) return 'Adequate gross margin but monitor cost structure.';
    if (margin >= 20) return 'Marginal gross margin - pricing and cost concerns.';
    return 'Poor gross margin - immediate pricing and cost issues.';
  };

  const getEfficiencyLevel = (margin: number) => {
    if (margin >= 50) return 'Excellent';
    if (margin >= 40) return 'Good';
    if (margin >= 30) return 'Adequate';
    if (margin >= 20) return 'Marginal';
    return 'Poor';
  };

  const getRecommendation = (margin: number) => {
    if (margin >= 50) return 'Maintain pricing excellence and consider premium positioning.';
    if (margin >= 40) return 'Continue current pricing strategy and optimize costs.';
    if (margin >= 30) return 'Focus on pricing optimization and cost reduction.';
    if (margin >= 20) return 'Urgent need to improve pricing and reduce direct costs.';
    return 'Critical situation - immediate pricing and cost restructuring required.';
  };

  const getStrength = (margin: number) => {
    if (margin >= 50) return 'Very Strong';
    if (margin >= 40) return 'Strong';
    if (margin >= 30) return 'Moderate';
    if (margin >= 20) return 'Weak';
    return 'Very Weak';
  };

  const getInsights = (margin: number) => {
    const insights = [];
    if (margin >= 50) {
      insights.push('Exceptional pricing power');
      insights.push('Strong competitive advantage');
      insights.push('Excellent cost management');
    } else if (margin >= 40) {
      insights.push('Healthy pricing strategy');
      insights.push('Good cost control');
      insights.push('Strong market position');
    } else if (margin >= 30) {
      insights.push('Adequate pricing strategy');
      insights.push('Room for cost optimization');
      insights.push('Monitor competitive position');
    } else if (margin >= 20) {
      insights.push('Marginal pricing power');
      insights.push('High sensitivity to cost changes');
      insights.push('Urgent need for pricing improvements');
    } else {
      insights.push('Poor pricing power');
      insights.push('Immediate cost management issues');
      insights.push('Critical pricing strategy problems');
    }
    return insights;
  };

  const getConsiderations = (margin: number) => {
    const considerations = [];
    considerations.push('Industry benchmarks vary significantly');
    considerations.push('Seasonal businesses may have fluctuating margins');
    considerations.push('Raw material costs can impact margins');
    considerations.push('Compare with historical performance');
    considerations.push('Consider competitive pricing pressures');
    return considerations;
  };

  const onSubmit = (values: FormValues) => {
    const margin = calculate(values);
    if (margin !== null) {
      setResult({
        margin,
        interpretation: interpret(margin),
        efficiencyLevel: getEfficiencyLevel(margin),
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
            <TrendingUp className="h-6 w-6 text-primary" />
            <CardTitle>Gross Margin Calculator</CardTitle>
          </div>
          <CardDescription>
            Calculate your company's gross margin to assess pricing power and cost efficiency
          </CardDescription>
        </CardHeader>
        <CardContent>
          <Form {...form}>
            <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-6">
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
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
                <FormField control={form.control} name="cogs" render={({ field }) => (
                  <FormItem>
                    <FormLabel className="flex items-center gap-2">
                      <Package className="h-4 w-4" />
                      Cost of Goods Sold (COGS)
                    </FormLabel>
                    <FormControl>
                      <Input type="number" placeholder="Enter COGS" {...field} value={field.value ?? ''} onChange={e => field.onChange(parseFloat(e.target.value) || undefined)} />
                    </FormControl>
                    <FormMessage />
                  </FormItem>
                )} />
              </div>
              <Button type="submit" className="w-full">
                <Calculator className="h-4 w-4 mr-2" />
                Calculate Gross Margin
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
                  <CardTitle>Gross Margin Result</CardTitle>
                </div>
                <div className="flex gap-2">
                  <Badge variant={result.efficiencyLevel === 'Excellent' ? 'default' : result.efficiencyLevel === 'Good' ? 'secondary' : 'destructive'}>
                    {result.efficiencyLevel}
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
            <Link href="/category/finance/operating-margin-calculator" className="group">
              <Card className="group-hover:shadow-md transition-shadow">
                <CardContent className="p-4 text-center">
                  <TrendingUp className="h-8 w-8 mx-auto mb-2 text-primary" />
                  <p className="text-sm font-medium">Operating Margin</p>
                </CardContent>
              </Card>
            </Link>
            <Link href="/category/finance/net-profit-margin-calculator" className="group">
              <Card className="group-hover:shadow-md transition-shadow">
                <CardContent className="p-4 text-center">
                  <Percent className="h-8 w-8 mx-auto mb-2 text-primary" />
                  <p className="text-sm font-medium">Net Profit Margin</p>
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
            Complete Guide to Gross Margin
          </CardTitle>
          <CardDescription>
            Everything you need to know about calculating and interpreting gross margin
          </CardDescription>
        </CardHeader>
        <CardContent className="space-y-4">
          <p className="text-muted-foreground">
            Gross Margin is a fundamental profitability ratio that measures how much profit a company makes on each dollar of sales after accounting for the direct costs of producing goods or services. It's calculated by subtracting Cost of Goods Sold (COGS) from revenue and expressing the result as a percentage.
          </p>
          <p className="text-muted-foreground">
            This metric is essential for assessing pricing power, cost efficiency, and competitive positioning. A higher gross margin indicates better pricing power and more efficient production processes, while a lower margin may suggest pricing pressure or high production costs.
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
            Common questions about Gross Margin
          </CardDescription>
        </CardHeader>
        <CardContent>
          <div className="space-y-6">
            <div>
              <h4 className="font-semibold text-lg mb-3">What is Gross Margin?</h4>
              <p className="text-muted-foreground">
                Gross Margin is a profitability ratio that measures how much profit a company makes on each dollar of sales after accounting for the direct costs of producing goods or services. It's calculated as (Revenue - COGS) ÷ Revenue × 100, expressed as a percentage.
              </p>
            </div>
            
            <div>
              <h4 className="font-semibold text-lg mb-3">What is considered a good Gross Margin?</h4>
              <p className="text-muted-foreground">
                Good gross margins vary by industry. Generally, margins above 40% are considered good, above 50% are excellent, and above 30% are adequate. Technology companies often have high margins (60-80%), while retail companies typically have lower margins (20-30%). Always compare within the same industry.
              </p>
            </div>
            
            <div>
              <h4 className="font-semibold text-lg mb-3">How do I calculate Gross Margin?</h4>
              <p className="text-muted-foreground">
                The formula is: Gross Margin = ((Revenue - COGS) ÷ Revenue) × 100. Revenue is the total sales amount, and COGS includes direct costs like materials, labor, and manufacturing overhead. Both figures are found on the income statement.
              </p>
            </div>
            
            <div>
              <h4 className="font-semibold text-lg mb-3">What does negative Gross Margin mean?</h4>
              <p className="text-muted-foreground">
                A negative gross margin means the company is selling products for less than it costs to produce them. This indicates serious pricing or cost management problems and is unsustainable in the long term. It requires immediate attention to pricing strategy or cost reduction.
              </p>
            </div>
            
            <div>
              <h4 className="font-semibold text-lg mb-3">Do Gross Margins vary by industry?</h4>
              <p className="text-muted-foreground">
                Yes, gross margins vary significantly by industry. Software companies often have high margins due to low production costs. Manufacturing companies typically have moderate margins. Retail companies usually have lower margins due to high competition. Always compare within the same industry for meaningful analysis.
              </p>
            </div>
            
            <div>
              <h4 className="font-semibold text-lg mb-3">What are the limitations of Gross Margin?</h4>
              <p className="text-muted-foreground">
                Gross margin only considers direct production costs and doesn't include operating expenses, interest, or taxes. It's a snapshot in time and doesn't reflect seasonal variations. It doesn't account for the quality of products or services. Compare with historical performance for better insights.
              </p>
            </div>
            
            <div>
              <h4 className="font-semibold text-lg mb-3">How can a company improve its Gross Margin?</h4>
              <p className="text-muted-foreground">
                Companies can improve gross margin by increasing prices, reducing COGS through better supplier negotiations, improving production efficiency, reducing waste, or focusing on higher-margin products. However, these strategies should be balanced with market competitiveness and customer satisfaction.
              </p>
            </div>
            
            <div>
              <h4 className="font-semibold text-lg mb-3">How does Gross Margin differ from Operating Margin?</h4>
              <p className="text-muted-foreground">
                Gross Margin only considers direct production costs (COGS), while Operating Margin includes all operating expenses (SG&A, R&D, etc.). Gross Margin focuses on production efficiency, while Operating Margin reflects overall operational management. Operating Margin is always lower than Gross Margin.
              </p>
            </div>
            
            <div>
              <h4 className="font-semibold text-lg mb-3">Why is Gross Margin important for investors?</h4>
              <p className="text-muted-foreground">
                For investors, gross margin indicates pricing power, cost efficiency, and competitive advantage. Higher margins suggest better ability to generate profits and weather cost increases. It helps assess the company's competitive positioning and management's effectiveness in pricing and cost control.
              </p>
            </div>
            
            <div>
              <h4 className="font-semibold text-lg mb-3">How do creditors use Gross Margin?</h4>
              <p className="text-muted-foreground">
                Creditors use gross margin to assess the company's ability to generate profits from core operations and service debt. Higher margins suggest better debt service capability and lower credit risk. Creditors often monitor gross margin trends to identify potential financial stress early.
              </p>
            </div>
          </div>
        </CardContent>
      </Card>
    </div>
  );
}
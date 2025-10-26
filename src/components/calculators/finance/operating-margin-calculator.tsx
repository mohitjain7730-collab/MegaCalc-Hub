'use client';

import { useState } from 'react';
import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import { z } from 'zod';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Form, FormControl, FormField, FormItem, FormLabel, FormMessage } from '@/components/ui/form';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { BarChart3, TrendingUp, AlertCircle, Target, Info, Landmark, Calculator, DollarSign, Percent, Shield, TrendingDown } from 'lucide-react';
import { Badge } from '@/components/ui/badge';
import { Alert, AlertDescription } from '@/components/ui/alert';
import Link from 'next/link';

const formSchema = z.object({
  operatingIncome: z.number(),
  revenue: z.number().positive(),
});

type FormValues = z.infer<typeof formSchema>;

export default function OperatingMarginCalculator() {
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
      operatingIncome: undefined,
      revenue: undefined,
    },
  });

  const calculate = (v: FormValues) => {
    if (v.operatingIncome == null || v.revenue == null) return null;
    return (v.operatingIncome / v.revenue) * 100;
  };

  const interpret = (margin: number) => {
    if (margin >= 20) return 'Excellent operating efficiency with strong profitability.';
    if (margin >= 15) return 'Good operating efficiency with healthy profitability.';
    if (margin >= 10) return 'Adequate operating efficiency but room for improvement.';
    if (margin >= 5) return 'Marginal operating efficiency - operational concerns.';
    return 'Poor operating efficiency - immediate operational issues.';
  };

  const getEfficiencyLevel = (margin: number) => {
    if (margin >= 20) return 'Excellent';
    if (margin >= 15) return 'Good';
    if (margin >= 10) return 'Adequate';
    if (margin >= 5) return 'Marginal';
    return 'Poor';
  };

  const getRecommendation = (margin: number) => {
    if (margin >= 20) return 'Maintain operational excellence and consider strategic investments.';
    if (margin >= 15) return 'Continue current operations and optimize efficiency further.';
    if (margin >= 10) return 'Focus on cost reduction and operational improvements.';
    if (margin >= 5) return 'Urgent need to improve operational efficiency and reduce costs.';
    return 'Critical situation - immediate operational restructuring required.';
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
      insights.push('Exceptional operational efficiency');
      insights.push('Strong competitive advantage');
      insights.push('Excellent cost management');
    } else if (margin >= 15) {
      insights.push('Healthy operational efficiency');
      insights.push('Good cost control');
      insights.push('Strong market position');
    } else if (margin >= 10) {
      insights.push('Adequate operational efficiency');
      insights.push('Room for cost optimization');
      insights.push('Monitor competitive position');
    } else if (margin >= 5) {
      insights.push('Marginal operational efficiency');
      insights.push('High sensitivity to cost changes');
      insights.push('Urgent need for operational improvements');
    } else {
      insights.push('Poor operational efficiency');
      insights.push('Immediate operational distress');
      insights.push('Critical cost management issues');
    }
    return insights;
  };

  const getConsiderations = (margin: number) => {
    const considerations = [];
    considerations.push('Industry benchmarks vary significantly');
    considerations.push('Seasonal businesses may have fluctuating margins');
    considerations.push('One-time items can distort operating income');
    considerations.push('Compare with historical performance');
    considerations.push('Consider economic cycles and market conditions');
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
            <BarChart3 className="h-6 w-6 text-primary" />
            <CardTitle>Operating Margin Calculator</CardTitle>
          </div>
          <CardDescription>
            Calculate your company's operating margin to assess operational efficiency and profitability
          </CardDescription>
        </CardHeader>
        <CardContent>
          <Form {...form}>
            <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-6">
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <FormField control={form.control} name="operatingIncome" render={({ field }) => (
                  <FormItem>
                    <FormLabel className="flex items-center gap-2">
                      <DollarSign className="h-4 w-4" />
                      Operating Income (EBIT)
                    </FormLabel>
                    <FormControl>
                      <Input type="number" placeholder="Enter operating income" {...field} value={field.value ?? ''} onChange={e => field.onChange(parseFloat(e.target.value) || undefined)} />
                    </FormControl>
                    <FormMessage />
                  </FormItem>
                )} />
                <FormField control={form.control} name="revenue" render={({ field }) => (
                  <FormItem>
                    <FormLabel className="flex items-center gap-2">
                      <Percent className="h-4 w-4" />
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
                Calculate Operating Margin
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
                  <CardTitle>Operating Margin Result</CardTitle>
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
            <Link href="/category/finance/gross-margin-calculator" className="group">
              <Card className="group-hover:shadow-md transition-shadow">
                <CardContent className="p-4 text-center">
                  <BarChart3 className="h-8 w-8 mx-auto mb-2 text-primary" />
                  <p className="text-sm font-medium">Gross Margin</p>
                </CardContent>
              </Card>
            </Link>
            <Link href="/category/finance/net-profit-margin-calculator" className="group">
              <Card className="group-hover:shadow-md transition-shadow">
                <CardContent className="p-4 text-center">
                  <TrendingUp className="h-8 w-8 mx-auto mb-2 text-primary" />
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
            Complete Guide to Operating Margin
          </CardTitle>
          <CardDescription>
            Everything you need to know about calculating and interpreting operating margin
          </CardDescription>
        </CardHeader>
        <CardContent className="space-y-4">
          <p className="text-muted-foreground">
            Operating Margin is a key profitability ratio that measures how much profit a company makes on each dollar of sales after paying for variable costs of production but before paying interest or tax. It's calculated by dividing operating income by revenue and expressing the result as a percentage.
          </p>
          <p className="text-muted-foreground">
            This metric is crucial for assessing operational efficiency and comparing companies within the same industry. A higher operating margin indicates better operational efficiency and stronger competitive positioning in the market.
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
            Common questions about Operating Margin
          </CardDescription>
        </CardHeader>
        <CardContent>
          <div className="space-y-6">
            <div>
              <h4 className="font-semibold text-lg mb-3">What is Operating Margin?</h4>
              <p className="text-muted-foreground">
                Operating Margin is a profitability ratio that measures how much profit a company makes on each dollar of sales after paying for variable costs of production but before paying interest or tax. It's calculated as Operating Income divided by Revenue, expressed as a percentage.
              </p>
            </div>
            
            <div>
              <h4 className="font-semibold text-lg mb-3">What is considered a good Operating Margin?</h4>
              <p className="text-muted-foreground">
                Good operating margins vary by industry. Generally, margins above 15% are considered good, above 20% are excellent, and above 10% are adequate. Technology companies often have higher margins (20-30%), while retail companies typically have lower margins (2-5%). Always compare within the same industry.
              </p>
            </div>
            
            <div>
              <h4 className="font-semibold text-lg mb-3">How do I calculate Operating Margin?</h4>
              <p className="text-muted-foreground">
                The formula is: Operating Margin = (Operating Income ÷ Revenue) × 100. Operating Income (EBIT) is found on the income statement and represents profit from core operations. Revenue is the total sales amount, also found at the top of the income statement.
              </p>
            </div>
            
            <div>
              <h4 className="font-semibold text-lg mb-3">What does negative Operating Margin mean?</h4>
              <p className="text-muted-foreground">
                A negative operating margin means the company is losing money on its core operations before interest and taxes. This indicates serious operational problems, such as high costs, low prices, or inefficient operations. It's a warning sign that requires immediate attention to operational restructuring.
              </p>
            </div>
            
            <div>
              <h4 className="font-semibold text-lg mb-3">Do Operating Margins vary by industry?</h4>
              <p className="text-muted-foreground">
                Yes, operating margins vary significantly by industry. Technology companies often have high margins due to scalable business models. Retail companies typically have low margins due to high competition and costs. Manufacturing companies usually have moderate margins. Always compare within the same industry for meaningful analysis.
              </p>
            </div>
            
            <div>
              <h4 className="font-semibold text-lg mb-3">What are the limitations of Operating Margin?</h4>
              <p className="text-muted-foreground">
                Operating margin doesn't account for interest, taxes, or non-operating items. It's a snapshot in time and doesn't reflect seasonal variations. One-time charges can distort the calculation. It doesn't consider the quality of revenue or future growth prospects. Compare with historical performance for better insights.
              </p>
            </div>
            
            <div>
              <h4 className="font-semibold text-lg mb-3">How can a company improve its Operating Margin?</h4>
              <p className="text-muted-foreground">
                Companies can improve operating margin by increasing revenue through price increases or volume growth, reducing operating costs through efficiency improvements, optimizing supply chains, automating processes, or renegotiating supplier contracts. However, these strategies should be balanced with long-term growth objectives.
              </p>
            </div>
            
            <div>
              <h4 className="font-semibold text-lg mb-3">How does Operating Margin differ from Gross Margin?</h4>
              <p className="text-muted-foreground">
                Gross Margin only considers direct costs of goods sold, while Operating Margin includes all operating expenses (SG&A, R&D, etc.). Operating Margin provides a more comprehensive view of operational efficiency. Gross Margin focuses on production efficiency, while Operating Margin reflects overall operational management.
              </p>
            </div>
            
            <div>
              <h4 className="font-semibold text-lg mb-3">Why is Operating Margin important for investors?</h4>
              <p className="text-muted-foreground">
                For investors, operating margin indicates operational efficiency and competitive advantage. Higher margins suggest better cost management and pricing power. It helps assess the company's ability to generate profits from operations and provides insight into management's operational effectiveness and competitive positioning.
              </p>
            </div>
            
            <div>
              <h4 className="font-semibold text-lg mb-3">How do creditors use Operating Margin?</h4>
              <p className="text-muted-foreground">
                Creditors use operating margin to assess the company's ability to generate operating profits and service debt. Higher margins suggest better debt service capability and lower credit risk. Creditors often require minimum operating margin levels in loan covenants to ensure borrowers maintain adequate operational profitability.
              </p>
            </div>
          </div>
        </CardContent>
      </Card>
    </div>
  );
}

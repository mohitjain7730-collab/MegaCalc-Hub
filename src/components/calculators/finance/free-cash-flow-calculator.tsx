'use client';

import { useState } from 'react';
import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import { z } from 'zod';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Form, FormControl, FormField, FormItem, FormLabel, FormMessage } from '@/components/ui/form';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Zap, TrendingUp, AlertCircle, Target, Info, Landmark, Calculator, DollarSign, BarChart3, Shield, TrendingDown } from 'lucide-react';
import { Badge } from '@/components/ui/badge';
import { Alert, AlertDescription } from '@/components/ui/alert';
import Link from 'next/link';

const formSchema = z.object({
  operatingCashFlow: z.number(),
  capitalExpenditures: z.number().nonnegative(),
});

type FormValues = z.infer<typeof formSchema>;

export default function FreeCashFlowCalculator() {
  const [result, setResult] = useState<{ 
    fcf: number; 
    interpretation: string; 
    healthLevel: string;
    recommendation: string;
    strength: string;
    insights: string[];
    considerations: string[];
  } | null>(null);

  const form = useForm<FormValues>({
    resolver: zodResolver(formSchema),
    defaultValues: {
      operatingCashFlow: undefined,
      capitalExpenditures: undefined,
    },
  });

  const calculate = (v: FormValues) => {
    if (v.operatingCashFlow == null || v.capitalExpenditures == null) return null;
    return v.operatingCashFlow - v.capitalExpenditures;
  };

  const interpret = (fcf: number) => {
    if (fcf >= 1000000) return 'Excellent free cash flow generation with strong financial flexibility.';
    if (fcf >= 500000) return 'Good free cash flow with comfortable financial position.';
    if (fcf >= 100000) return 'Adequate free cash flow but monitor capital allocation.';
    if (fcf >= 0) return 'Marginal free cash flow - potential financial constraints.';
    return 'Negative free cash flow - immediate financial distress risk.';
  };

  const getHealthLevel = (fcf: number) => {
    if (fcf >= 1000000) return 'Excellent';
    if (fcf >= 500000) return 'Good';
    if (fcf >= 100000) return 'Adequate';
    if (fcf >= 0) return 'Marginal';
    return 'Poor';
  };

  const getRecommendation = (fcf: number) => {
    if (fcf >= 1000000) return 'Consider strategic investments, dividends, or debt reduction.';
    if (fcf >= 500000) return 'Maintain current operations and consider growth investments.';
    if (fcf >= 100000) return 'Focus on improving operational efficiency and cash generation.';
    if (fcf >= 0) return 'Urgent need to improve cash flow generation and reduce CapEx.';
    return 'Critical situation - immediate cash flow improvement required.';
  };

  const getStrength = (fcf: number) => {
    if (fcf >= 1000000) return 'Very Strong';
    if (fcf >= 500000) return 'Strong';
    if (fcf >= 100000) return 'Moderate';
    if (fcf >= 0) return 'Weak';
    return 'Very Weak';
  };

  const getInsights = (fcf: number) => {
    const insights = [];
    if (fcf >= 1000000) {
      insights.push('Exceptional cash generation capability');
      insights.push('Strong position for growth investments');
      insights.push('Excellent financial flexibility');
    } else if (fcf >= 500000) {
      insights.push('Healthy cash generation');
      insights.push('Good operational efficiency');
      insights.push('Strong financial position');
    } else if (fcf >= 100000) {
      insights.push('Adequate cash generation');
      insights.push('Room for operational improvements');
      insights.push('Monitor capital allocation');
    } else if (fcf >= 0) {
      insights.push('Marginal cash generation');
      insights.push('High sensitivity to operational changes');
      insights.push('Urgent need for cash flow improvement');
    } else {
      insights.push('Negative cash generation');
      insights.push('Immediate financial distress');
      insights.push('Critical operational issues');
    }
    return insights;
  };

  const getConsiderations = (fcf: number) => {
    const considerations = [];
    considerations.push('Industry benchmarks vary significantly');
    considerations.push('Seasonal businesses may have fluctuating FCF');
    considerations.push('One-time items can distort FCF');
    considerations.push('Compare with historical performance');
    considerations.push('Consider working capital changes');
    return considerations;
  };

  const onSubmit = (values: FormValues) => {
    const fcf = calculate(values);
    if (fcf !== null) {
      setResult({
        fcf,
        interpretation: interpret(fcf),
        healthLevel: getHealthLevel(fcf),
        recommendation: getRecommendation(fcf),
        strength: getStrength(fcf),
        insights: getInsights(fcf),
        considerations: getConsiderations(fcf)
      });
    }
  };

  return (
    <div className="space-y-8">
      <Card>
        <CardHeader>
          <div className="flex items-center gap-2">
            <Zap className="h-6 w-6 text-primary" />
            <CardTitle>Free Cash Flow Calculator</CardTitle>
          </div>
          <CardDescription>
            Calculate your company's free cash flow to assess financial health and investment capacity
          </CardDescription>
        </CardHeader>
        <CardContent>
          <Form {...form}>
            <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-6">
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <FormField control={form.control} name="operatingCashFlow" render={({ field }) => (
                  <FormItem>
                    <FormLabel className="flex items-center gap-2">
                      <DollarSign className="h-4 w-4" />
                      Operating Cash Flow (OCF)
                    </FormLabel>
                    <FormControl>
                      <Input type="number" placeholder="Enter operating cash flow" {...field} value={field.value ?? ''} onChange={e => field.onChange(parseFloat(e.target.value) || undefined)} />
                    </FormControl>
                    <FormMessage />
                  </FormItem>
                )} />
                <FormField control={form.control} name="capitalExpenditures" render={({ field }) => (
                  <FormItem>
                    <FormLabel className="flex items-center gap-2">
                      <BarChart3 className="h-4 w-4" />
                      Capital Expenditures (CapEx)
                    </FormLabel>
                    <FormControl>
                      <Input type="number" placeholder="Enter capital expenditures" {...field} value={field.value ?? ''} onChange={e => field.onChange(parseFloat(e.target.value) || undefined)} />
                    </FormControl>
                    <FormMessage />
                  </FormItem>
                )} />
              </div>
              <Button type="submit" className="w-full">
                <Calculator className="h-4 w-4 mr-2" />
                Calculate Free Cash Flow
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
                  <CardTitle>Free Cash Flow Result</CardTitle>
                </div>
                <div className="flex gap-2">
                  <Badge variant={result.healthLevel === 'Excellent' ? 'default' : result.healthLevel === 'Good' ? 'secondary' : 'destructive'}>
                    {result.healthLevel}
                  </Badge>
                  <Badge variant="outline">{result.strength}</Badge>
                </div>
              </div>
            </CardHeader>
            <CardContent>
              <div className="text-center space-y-4">
                <div className="text-4xl font-bold text-primary">
                  ${result.fcf.toLocaleString(undefined, { maximumFractionDigits: 2 })}
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
                  <BarChart3 className="h-8 w-8 mx-auto mb-2 text-primary" />
                  <p className="text-sm font-medium">Operating Margin</p>
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
            <Link href="/category/finance/ebitda-ebit-calculator" className="group">
              <Card className="group-hover:shadow-md transition-shadow">
                <CardContent className="p-4 text-center">
                  <Calculator className="h-8 w-8 mx-auto mb-2 text-primary" />
                  <p className="text-sm font-medium">EBITDA/EBIT</p>
                </CardContent>
              </Card>
            </Link>
            <Link href="/category/finance/interest-coverage-ratio-calculator" className="group">
              <Card className="group-hover:shadow-md transition-shadow">
                <CardContent className="p-4 text-center">
                  <Shield className="h-8 w-8 mx-auto mb-2 text-primary" />
                  <p className="text-sm font-medium">Interest Coverage</p>
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
            Complete Guide to Free Cash Flow
          </CardTitle>
          <CardDescription>
            Everything you need to know about calculating and interpreting free cash flow
          </CardDescription>
        </CardHeader>
        <CardContent className="space-y-4">
          <p className="text-muted-foreground">
            Free Cash Flow (FCF) is one of the most important financial metrics for evaluating a company's financial health and investment potential. It represents the cash that a company generates after accounting for cash outflows to support operations and maintain its capital assets.
          </p>
          <p className="text-muted-foreground">
            Understanding FCF helps investors, creditors, and management assess the company's ability to generate cash, fund growth initiatives, pay dividends, and reduce debt. A positive FCF indicates strong operational efficiency and financial flexibility.
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
            Common questions about Free Cash Flow
          </CardDescription>
        </CardHeader>
        <CardContent>
          <div className="space-y-6">
            <div>
              <h4 className="font-semibold text-lg mb-3">What is Free Cash Flow?</h4>
              <p className="text-muted-foreground">
                Free Cash Flow (FCF) is the cash that a company generates after accounting for cash outflows to support operations and maintain its capital assets. It's calculated as Operating Cash Flow minus Capital Expenditures. FCF represents the cash available for dividends, debt reduction, share buybacks, or reinvestment in the business.
              </p>
            </div>
            
            <div>
              <h4 className="font-semibold text-lg mb-3">What is considered good Free Cash Flow?</h4>
              <p className="text-muted-foreground">
                Good FCF varies by industry and company size. Generally, positive FCF is good, indicating the company generates more cash than it spends on operations and capital investments. FCF margins of 5-10% are typically healthy, while margins above 15% are excellent. Compare FCF to revenue and industry benchmarks for meaningful analysis.
              </p>
            </div>
            
            <div>
              <h4 className="font-semibold text-lg mb-3">How do I calculate Free Cash Flow?</h4>
              <p className="text-muted-foreground">
                The formula is: FCF = Operating Cash Flow - Capital Expenditures. Operating Cash Flow is found on the Statement of Cash Flows and represents cash from core business operations. Capital Expenditures (CapEx) are also on the cash flow statement and represent investments in property, plant, and equipment.
              </p>
            </div>
            
            <div>
              <h4 className="font-semibold text-lg mb-3">What does negative Free Cash Flow mean?</h4>
              <p className="text-muted-foreground">
                Negative FCF means the company is spending more on operations and capital investments than it's generating in cash. This can indicate growth investments, operational inefficiencies, or financial distress. Young companies often have negative FCF due to heavy growth investments, while mature companies should typically generate positive FCF.
              </p>
            </div>
            
            <div>
              <h4 className="font-semibold text-lg mb-3">Do Free Cash Flow requirements vary by industry?</h4>
              <p className="text-muted-foreground">
                Yes, FCF requirements vary significantly by industry. Capital-intensive industries like manufacturing may have lower FCF margins due to high CapEx requirements. Technology companies often have higher FCF margins due to lower capital requirements. Service companies typically have moderate FCF margins. Always compare within the same industry.
              </p>
            </div>
            
            <div>
              <h4 className="font-semibold text-lg mb-3">What are the limitations of Free Cash Flow?</h4>
              <p className="text-muted-foreground">
                FCF is a snapshot in time and doesn't reflect seasonal variations or one-time items. It doesn't consider the quality of cash flows or future capital requirements. FCF can be manipulated through timing of CapEx or working capital changes. It doesn't account for off-balance sheet items or future growth investments.
              </p>
            </div>
            
            <div>
              <h4 className="font-semibold text-lg mb-3">How can a company improve its Free Cash Flow?</h4>
              <p className="text-muted-foreground">
                Companies can improve FCF by increasing operating cash flow through revenue growth, cost reduction, or working capital optimization. They can also reduce CapEx through better capital allocation, asset efficiency, or outsourcing. However, excessive CapEx reduction may harm long-term growth prospects.
              </p>
            </div>
            
            <div>
              <h4 className="font-semibold text-lg mb-3">How does Free Cash Flow relate to valuation?</h4>
              <p className="text-muted-foreground">
                FCF is crucial for valuation as it represents the actual cash available to shareholders. Many valuation models use FCF as the basis for discounted cash flow (DCF) analysis. Higher FCF typically leads to higher valuations, as it indicates the company's ability to generate returns for investors.
              </p>
            </div>
            
            <div>
              <h4 className="font-semibold text-lg mb-3">Why is Free Cash Flow important for investors?</h4>
              <p className="text-muted-foreground">
                For investors, FCF indicates the company's ability to generate cash returns, pay dividends, reduce debt, or reinvest in growth. It's a more reliable indicator of financial health than earnings, as it's harder to manipulate. Strong FCF suggests the company has financial flexibility and can weather economic downturns.
              </p>
            </div>
            
            <div>
              <h4 className="font-semibold text-lg mb-3">How do creditors use Free Cash Flow?</h4>
              <p className="text-muted-foreground">
                Creditors use FCF to assess the company's ability to service debt and meet financial obligations. Positive FCF suggests the company can make debt payments without additional financing. Creditors often require minimum FCF levels in loan covenants to ensure borrowers maintain adequate cash generation capability.
              </p>
            </div>
          </div>
        </CardContent>
      </Card>
    </div>
  );
}

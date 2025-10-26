'use client';

import { useState } from 'react';
import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import { z } from 'zod';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Form, FormControl, FormField, FormItem, FormLabel, FormMessage } from '@/components/ui/form';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Calculator, AlertCircle, Target, Info, Landmark, DollarSign, TrendingUp, Shield, BarChart3, Activity } from 'lucide-react';
import { Badge } from '@/components/ui/badge';
import { Alert, AlertDescription } from '@/components/ui/alert';
import Link from 'next/link';

const formSchema = z.object({
  netIncome: z.number(),
  interest: z.number().nonnegative(),
  taxes: z.number().nonnegative(),
  depreciation: z.number().nonnegative(),
  amortization: z.number().nonnegative(),
});

type FormValues = z.infer<typeof formSchema>;

export default function EBITDAEBITCalculator() {
  const [result, setResult] = useState<{ 
    ebitda: number;
    ebit: number;
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
      netIncome: undefined,
      interest: undefined,
      taxes: undefined,
      depreciation: undefined,
      amortization: undefined,
    },
  });

  const calculate = (v: FormValues) => {
    if (v.netIncome == null || v.interest == null || v.taxes == null || v.depreciation == null || v.amortization == null) return null;
    const ebit = v.netIncome + v.interest + v.taxes;
    const ebitda = ebit + v.depreciation + v.amortization;
    return { ebit, ebitda };
  };

  const interpret = (ebitda: number, ebit: number) => {
    if (ebitda >= 1000000) return 'Excellent operational performance with strong cash generation capability.';
    if (ebitda >= 500000) return 'Good operational performance with healthy profitability.';
    if (ebitda >= 100000) return 'Adequate operational performance but monitor efficiency.';
    if (ebitda >= 0) return 'Marginal operational performance - operational concerns.';
    return 'Poor operational performance - immediate operational issues.';
  };

  const getHealthLevel = (ebitda: number) => {
    if (ebitda >= 1000000) return 'Excellent';
    if (ebitda >= 500000) return 'Good';
    if (ebitda >= 100000) return 'Adequate';
    if (ebitda >= 0) return 'Marginal';
    return 'Poor';
  };

  const getRecommendation = (ebitda: number) => {
    if (ebitda >= 1000000) return 'Maintain operational excellence and consider strategic investments.';
    if (ebitda >= 500000) return 'Continue current operations and optimize efficiency further.';
    if (ebitda >= 100000) return 'Focus on operational improvements and cost optimization.';
    if (ebitda >= 0) return 'Urgent need to improve operational efficiency and profitability.';
    return 'Critical situation - immediate operational restructuring required.';
  };

  const getStrength = (ebitda: number) => {
    if (ebitda >= 1000000) return 'Very Strong';
    if (ebitda >= 500000) return 'Strong';
    if (ebitda >= 100000) return 'Moderate';
    if (ebitda >= 0) return 'Weak';
    return 'Very Weak';
  };

  const getInsights = (ebitda: number) => {
    const insights = [];
    if (ebitda >= 1000000) {
      insights.push('Exceptional operational efficiency');
      insights.push('Strong cash generation capability');
      insights.push('Excellent competitive position');
    } else if (ebitda >= 500000) {
      insights.push('Healthy operational efficiency');
      insights.push('Good cash generation');
      insights.push('Strong market position');
    } else if (ebitda >= 100000) {
      insights.push('Adequate operational efficiency');
      insights.push('Room for operational improvements');
      insights.push('Monitor competitive position');
    } else if (ebitda >= 0) {
      insights.push('Marginal operational efficiency');
      insights.push('High sensitivity to operational changes');
      insights.push('Urgent need for operational improvements');
    } else {
      insights.push('Poor operational efficiency');
      insights.push('Immediate operational distress');
      insights.push('Critical operational management issues');
    }
    return insights;
  };

  const getConsiderations = (ebitda: number) => {
    const considerations = [];
    considerations.push('Industry benchmarks vary significantly');
    considerations.push('Seasonal businesses may have fluctuating EBITDA');
    considerations.push('One-time items can distort calculations');
    considerations.push('Compare with historical performance');
    considerations.push('Consider capital intensity and depreciation policies');
    return considerations;
  };

  const onSubmit = (values: FormValues) => {
    const calculations = calculate(values);
    if (calculations !== null) {
      setResult({
        ebitda: calculations.ebitda,
        ebit: calculations.ebit,
        interpretation: interpret(calculations.ebitda, calculations.ebit),
        healthLevel: getHealthLevel(calculations.ebitda),
        recommendation: getRecommendation(calculations.ebitda),
        strength: getStrength(calculations.ebitda),
        insights: getInsights(calculations.ebitda),
        considerations: getConsiderations(calculations.ebitda)
      });
    }
  };

  return (
    <div className="space-y-8">
      <Card>
        <CardHeader>
          <div className="flex items-center gap-2">
            <Calculator className="h-6 w-6 text-primary" />
            <CardTitle>EBITDA / EBIT Calculator</CardTitle>
          </div>
          <CardDescription>
            Calculate your company's EBITDA and EBIT to assess operational performance and profitability
          </CardDescription>
        </CardHeader>
        <CardContent>
          <Form {...form}>
            <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-6">
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <FormField control={form.control} name="netIncome" render={({ field }) => (
                  <FormItem>
                    <FormLabel className="flex items-center gap-2">
                      <DollarSign className="h-4 w-4" />
                      Net Income
                    </FormLabel>
                    <FormControl>
                      <Input type="number" placeholder="Enter net income" {...field} value={field.value ?? ''} onChange={e => field.onChange(parseFloat(e.target.value) || undefined)} />
                    </FormControl>
                    <FormMessage />
                  </FormItem>
                )} />
                <FormField control={form.control} name="interest" render={({ field }) => (
                  <FormItem>
                    <FormLabel className="flex items-center gap-2">
                      <BarChart3 className="h-4 w-4" />
                      Interest Expense
                    </FormLabel>
                    <FormControl>
                      <Input type="number" placeholder="Enter interest expense" {...field} value={field.value ?? ''} onChange={e => field.onChange(parseFloat(e.target.value) || undefined)} />
                    </FormControl>
                    <FormMessage />
                  </FormItem>
                )} />
                <FormField control={form.control} name="taxes" render={({ field }) => (
                  <FormItem>
                    <FormLabel className="flex items-center gap-2">
                      <Activity className="h-4 w-4" />
                      Tax Expense
                    </FormLabel>
                    <FormControl>
                      <Input type="number" placeholder="Enter tax expense" {...field} value={field.value ?? ''} onChange={e => field.onChange(parseFloat(e.target.value) || undefined)} />
                    </FormControl>
                    <FormMessage />
                  </FormItem>
                )} />
                <FormField control={form.control} name="depreciation" render={({ field }) => (
                  <FormItem>
                    <FormLabel className="flex items-center gap-2">
                      <TrendingUp className="h-4 w-4" />
                      Depreciation
                    </FormLabel>
                    <FormControl>
                      <Input type="number" placeholder="Enter depreciation" {...field} value={field.value ?? ''} onChange={e => field.onChange(parseFloat(e.target.value) || undefined)} />
                    </FormControl>
                    <FormMessage />
                  </FormItem>
                )} />
                <FormField control={form.control} name="amortization" render={({ field }) => (
                  <FormItem>
                    <FormLabel className="flex items-center gap-2">
                      <Shield className="h-4 w-4" />
                      Amortization
                    </FormLabel>
                    <FormControl>
                      <Input type="number" placeholder="Enter amortization" {...field} value={field.value ?? ''} onChange={e => field.onChange(parseFloat(e.target.value) || undefined)} />
                    </FormControl>
                    <FormMessage />
                  </FormItem>
                )} />
              </div>
              <Button type="submit" className="w-full">
                <Calculator className="h-4 w-4 mr-2" />
                Calculate EBITDA & EBIT
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
                  <CardTitle>EBITDA & EBIT Results</CardTitle>
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
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  <div>
                    <div className="text-3xl font-bold text-primary">
                      ${result.ebitda.toLocaleString(undefined, { maximumFractionDigits: 2 })}
                    </div>
                    <p className="text-sm text-muted-foreground">EBITDA</p>
                  </div>
                  <div>
                    <div className="text-3xl font-bold text-primary">
                      ${result.ebit.toLocaleString(undefined, { maximumFractionDigits: 2 })}
                    </div>
                    <p className="text-sm text-muted-foreground">EBIT</p>
                  </div>
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
            <Link href="/category/finance/gross-margin-calculator" className="group">
              <Card className="group-hover:shadow-md transition-shadow">
                <CardContent className="p-4 text-center">
                  <TrendingUp className="h-8 w-8 mx-auto mb-2 text-primary" />
                  <p className="text-sm font-medium">Gross Margin</p>
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
            Complete Guide to EBITDA & EBIT
          </CardTitle>
          <CardDescription>
            Everything you need to know about calculating and interpreting EBITDA and EBIT
          </CardDescription>
        </CardHeader>
        <CardContent className="space-y-4">
          <p className="text-muted-foreground">
            EBITDA (Earnings Before Interest, Taxes, Depreciation, and Amortization) and EBIT (Earnings Before Interest and Taxes) are key financial metrics that measure a company's operational performance by excluding non-operational expenses. These metrics help assess core business profitability and operational efficiency.
          </p>
          <p className="text-muted-foreground">
            EBITDA provides a clearer view of operational cash generation by excluding depreciation and amortization, while EBIT focuses on operational profitability before financing and tax considerations. Both metrics are widely used by investors, creditors, and analysts to evaluate business performance.
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
            Common questions about EBITDA & EBIT
          </CardDescription>
        </CardHeader>
        <CardContent>
          <div className="space-y-6">
            <div>
              <h4 className="font-semibold text-lg mb-3">What is EBITDA?</h4>
              <p className="text-muted-foreground">
                EBITDA (Earnings Before Interest, Taxes, Depreciation, and Amortization) is a measure of a company's operational performance that excludes non-operational expenses. It's calculated as Net Income + Interest + Taxes + Depreciation + Amortization. EBITDA provides insight into operational cash generation capability.
              </p>
            </div>
            
            <div>
              <h4 className="font-semibold text-lg mb-3">What is EBIT?</h4>
              <p className="text-muted-foreground">
                EBIT (Earnings Before Interest and Taxes) is a measure of a company's operational profitability that excludes financing and tax expenses. It's calculated as Net Income + Interest + Taxes. EBIT focuses on core operational performance before capital structure and tax considerations.
              </p>
            </div>
            
            <div>
              <h4 className="font-semibold text-lg mb-3">How do I calculate EBITDA and EBIT?</h4>
              <p className="text-muted-foreground">
                EBIT = Net Income + Interest Expense + Tax Expense. EBITDA = EBIT + Depreciation + Amortization. All these figures are found on the income statement. Net Income is at the bottom, while Interest, Taxes, Depreciation, and Amortization are listed as separate line items.
              </p>
            </div>
            
            <div>
              <h4 className="font-semibold text-lg mb-3">What does negative EBITDA mean?</h4>
              <p className="text-muted-foreground">
                Negative EBITDA means the company is losing money from its core operations before considering interest, taxes, depreciation, and amortization. This indicates serious operational problems and requires immediate attention to operational restructuring, cost management, or revenue improvement.
              </p>
            </div>
            
            <div>
              <h4 className="font-semibold text-lg mb-3">Do EBITDA and EBIT vary by industry?</h4>
              <p className="text-muted-foreground">
                Yes, EBITDA and EBIT levels vary significantly by industry. Capital-intensive industries may have lower EBITDA due to high depreciation. Technology companies often have high EBITDA margins. Service companies typically have moderate levels. Always compare within the same industry for meaningful analysis.
              </p>
            </div>
            
            <div>
              <h4 className="font-semibold text-lg mb-3">What are the limitations of EBITDA and EBIT?</h4>
              <p className="text-muted-foreground">
                These metrics don't account for capital expenditures, working capital changes, or cash flow timing. They can be manipulated through accounting practices. They don't reflect the quality of earnings or future growth prospects. Compare with historical performance and other financial metrics for better insights.
              </p>
            </div>
            
            <div>
              <h4 className="font-semibold text-lg mb-3">How can a company improve its EBITDA and EBIT?</h4>
              <p className="text-muted-foreground">
                Companies can improve these metrics by increasing revenue through growth or pricing, reducing operating costs, improving operational efficiency, optimizing supply chains, or focusing on higher-margin products. However, these strategies should be balanced with long-term growth and capital investment needs.
              </p>
            </div>
            
            <div>
              <h4 className="font-semibold text-lg mb-3">How do EBITDA and EBIT differ from Net Income?</h4>
              <p className="text-muted-foreground">
                EBITDA and EBIT exclude non-operational expenses to focus on core business performance. Net Income includes all expenses and provides the final profit figure. EBITDA and EBIT are better for comparing operational performance across companies with different capital structures and tax situations.
              </p>
            </div>
            
            <div>
              <h4 className="font-semibold text-lg mb-3">Why are EBITDA and EBIT important for investors?</h4>
              <p className="text-muted-foreground">
                For investors, these metrics indicate operational efficiency and core business strength. They help assess the company's ability to generate cash from operations and provide insight into management's operational effectiveness. They're particularly useful for comparing companies with different capital structures.
              </p>
            </div>
            
            <div>
              <h4 className="font-semibold text-lg mb-3">How do creditors use EBITDA and EBIT?</h4>
              <p className="text-muted-foreground">
                Creditors use these metrics to assess the company's operational cash generation capability and debt service ability. Higher EBITDA suggests better ability to service debt. Creditors often require minimum EBITDA levels in loan covenants to ensure borrowers maintain adequate operational profitability.
              </p>
            </div>
          </div>
        </CardContent>
      </Card>
    </div>
  );
}
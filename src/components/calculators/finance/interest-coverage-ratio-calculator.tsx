
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
import { Accordion, AccordionContent, AccordionItem, AccordionTrigger } from '@/components/ui/accordion';
import Link from 'next/link';

const formSchema = z.object({
  ebit: z.number(),
  interestExpense: z.number().positive(),
});

type FormValues = z.infer<typeof formSchema>;

export default function InterestCoverageRatioCalculator() {
  const [result, setResult] = useState<{ 
    ratio: number; 
    interpretation: string; 
    riskLevel: string;
    recommendation: string;
    strength: string;
    insights: string[];
    considerations: string[];
  } | null>(null);

  const form = useForm<FormValues>({
    resolver: zodResolver(formSchema),
    defaultValues: {
      ebit: undefined,
      interestExpense: undefined,
    },
  });

  const calculate = (v: FormValues) => {
    if (v.ebit == null || v.interestExpense == null) return null;
    return v.ebit / v.interestExpense;
  };

  const interpret = (ratio: number) => {
    if (ratio >= 5) return 'Excellent debt servicing capability with strong financial health.';
    if (ratio >= 2.5) return 'Good ability to cover interest payments with comfortable margin.';
    if (ratio >= 1.5) return 'Adequate coverage but monitor debt levels closely.';
    if (ratio >= 1) return 'Barely sufficient coverage - high risk of default.';
    return 'Insufficient coverage - immediate financial distress risk.';
  };

  const getRiskLevel = (ratio: number) => {
    if (ratio >= 5) return 'Very Low';
    if (ratio >= 2.5) return 'Low';
    if (ratio >= 1.5) return 'Moderate';
    if (ratio >= 1) return 'High';
    return 'Very High';
  };

  const getRecommendation = (ratio: number) => {
    if (ratio >= 5) return 'Maintain current debt structure and consider strategic investments.';
    if (ratio >= 2.5) return 'Continue monitoring and consider debt reduction strategies.';
    if (ratio >= 1.5) return 'Focus on improving profitability and reducing debt burden.';
    if (ratio >= 1) return 'Urgent need to restructure debt and improve cash flow.';
    return 'Critical situation - immediate debt restructuring required.';
  };

  const getStrength = (ratio: number) => {
    if (ratio >= 5) return 'Very Strong';
    if (ratio >= 2.5) return 'Strong';
    if (ratio >= 1.5) return 'Moderate';
    if (ratio >= 1) return 'Weak';
    return 'Very Weak';
  };

  const getInsights = (ratio: number) => {
    const insights = [];
    if (ratio >= 5) {
      insights.push('Company has exceptional financial flexibility');
      insights.push('Low risk of financial distress');
      insights.push('Strong position for growth investments');
    } else if (ratio >= 2.5) {
      insights.push('Healthy debt servicing capacity');
      insights.push('Good financial stability');
      insights.push('Room for strategic debt if needed');
    } else if (ratio >= 1.5) {
      insights.push('Adequate but not optimal coverage');
      insights.push('Monitor cash flow trends closely');
      insights.push('Consider debt reduction strategies');
    } else if (ratio >= 1) {
      insights.push('Marginal debt servicing ability');
      insights.push('High sensitivity to earnings volatility');
      insights.push('Urgent need for financial restructuring');
    } else {
      insights.push('Insufficient earnings to cover interest');
      insights.push('Immediate default risk');
      insights.push('Critical financial distress situation');
    }
    return insights;
  };

  const getConsiderations = (ratio: number) => {
    const considerations = [];
    considerations.push('Industry benchmarks vary significantly');
    considerations.push('Seasonal businesses may have fluctuating ratios');
    considerations.push('One-time charges can distort the ratio');
    considerations.push('Compare with historical performance');
    considerations.push('Consider cash flow timing differences');
    return considerations;
  };

  const onSubmit = (values: FormValues) => {
    const ratio = calculate(values);
    if (ratio !== null) {
      setResult({
        ratio,
        interpretation: interpret(ratio),
        riskLevel: getRiskLevel(ratio),
        recommendation: getRecommendation(ratio),
        strength: getStrength(ratio),
        insights: getInsights(ratio),
        considerations: getConsiderations(ratio)
      });
    }
  };

  return (
    <div className="space-y-8">

      {/* Input Form */}
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <Target className="h-5 w-5" />
            Financial Parameters
          </CardTitle>
          <CardDescription>
            Enter your company's financial data to calculate the Interest Coverage Ratio
          </CardDescription>
        </CardHeader>
        <CardContent>
          <Form {...form}>
            <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-6">
              <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                <FormField 
                  control={form.control} 
                  name="ebit" 
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel className="flex items-center gap-2">
                        <DollarSign className="h-4 w-4" />
                        EBIT ($)
                      </FormLabel>
                      <FormControl>
                        <Input 
                          type="number" 
                          step="0.01" 
                          placeholder="e.g., 500000" 
                          {...field} 
                          value={field.value ?? ''} 
                          onChange={e => field.onChange(parseFloat(e.target.value) || undefined)} 
                        />
                      </FormControl>
                      <FormMessage />
                    </FormItem>
                  )} 
                />
                <FormField 
                  control={form.control} 
                  name="interestExpense" 
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel className="flex items-center gap-2">
                        <AlertCircle className="h-4 w-4" />
                        Interest Expense ($)
                      </FormLabel>
                      <FormControl>
                        <Input 
                          type="number" 
                          step="0.01" 
                          placeholder="e.g., 50000" 
                          {...field} 
                          value={field.value ?? ''} 
                          onChange={e => field.onChange(parseFloat(e.target.value) || undefined)} 
                        />
                      </FormControl>
                      <FormMessage />
                    </FormItem>
                  )} 
                />
              </div>
              <Button type="submit" className="w-full">
                <Calculator className="mr-2 h-4 w-4" />
                Calculate Interest Coverage Ratio
              </Button>
            </form>
          </Form>
        </CardContent>
      </Card>

      {/* Results */}
      {result && (
        <div className="space-y-6">
          {/* Main Result Card */}
          <Card>
            <CardHeader>
              <div className="flex items-center gap-4">
                <Landmark className="h-8 w-8 text-primary" />
                <div>
                  <CardTitle>Interest Coverage Ratio</CardTitle>
                  <CardDescription>Debt Servicing Capability Analysis</CardDescription>
                </div>
              </div>
            </CardHeader>
            <CardContent className="space-y-6">
              <div className="text-center">
                <p className="text-4xl font-bold text-primary">{result.ratio.toFixed(2)}x</p>
                <p className="text-lg text-muted-foreground mt-2">{result.interpretation}</p>
              </div>
              
              <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                <div className="text-center p-4 bg-muted/50 rounded-lg">
                  <Shield className="h-6 w-6 mx-auto mb-2 text-blue-600" />
                  <p className="font-semibold">Risk Level</p>
                  <Badge variant={result.riskLevel === 'Very Low' ? 'default' : result.riskLevel === 'Low' ? 'secondary' : result.riskLevel === 'Moderate' ? 'outline' : 'destructive'}>
                    {result.riskLevel}
                  </Badge>
                </div>
                <div className="text-center p-4 bg-muted/50 rounded-lg">
                  <TrendingUp className="h-6 w-6 mx-auto mb-2 text-green-600" />
                  <p className="font-semibold">Financial Strength</p>
                  <Badge variant={result.strength === 'Very Strong' ? 'default' : result.strength === 'Strong' ? 'secondary' : result.strength === 'Moderate' ? 'outline' : 'destructive'}>
                    {result.strength}
                  </Badge>
                </div>
                <div className="text-center p-4 bg-muted/50 rounded-lg">
                  <BarChart3 className="h-6 w-6 mx-auto mb-2 text-purple-600" />
                  <p className="font-semibold">Coverage Multiple</p>
                  <p className="text-lg font-bold">{result.ratio.toFixed(1)}x</p>
                </div>
              </div>

              <Alert>
                <Info className="h-4 w-4" />
                <AlertDescription>
                  <strong>Recommendation:</strong> {result.recommendation}
                </AlertDescription>
              </Alert>
            </CardContent>
          </Card>

          {/* Insights Card */}
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <Zap className="h-5 w-5" />
                Key Insights
              </CardTitle>
            </CardHeader>
            <CardContent>
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div>
                  <h4 className="font-semibold mb-2 text-green-600">Strengths & Opportunities</h4>
                  <ul className="space-y-1 text-sm">
                    {result.insights.map((insight, index) => (
                      <li key={index} className="flex items-start gap-2">
                        <span className="text-green-600 mt-1">•</span>
                        <span>{insight}</span>
                      </li>
                    ))}
                  </ul>
                </div>
                <div>
                  <h4 className="font-semibold mb-2 text-orange-600">Important Considerations</h4>
                  <ul className="space-y-1 text-sm">
                    {result.considerations.map((consideration, index) => (
                      <li key={index} className="flex items-start gap-2">
                        <span className="text-orange-600 mt-1">•</span>
                        <span>{consideration}</span>
                      </li>
                    ))}
                  </ul>
                </div>
              </div>
            </CardContent>
          </Card>
        </div>
      )}

      {/* Related Calculators */}
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <Calculator className="h-5 w-5" />
            Related Financial Calculators
          </CardTitle>
          <CardDescription>
            Explore other financial ratios and analysis tools
          </CardDescription>
        </CardHeader>
        <CardContent>
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
            <Link href="/category/finance/debt-to-equity-ratio-calculator" className="block">
              <Card className="hover:shadow-md transition-shadow cursor-pointer">
                <CardContent className="p-4">
                  <div className="flex items-center gap-3">
                    <BarChart3 className="h-5 w-5 text-blue-600" />
                    <div>
                      <p className="font-medium">Debt-to-Equity Ratio</p>
                      <p className="text-sm text-muted-foreground">Capital structure analysis</p>
                    </div>
                  </div>
                </CardContent>
              </Card>
            </Link>
            <Link href="/category/finance/current-ratio-calculator" className="block">
              <Card className="hover:shadow-md transition-shadow cursor-pointer">
                <CardContent className="p-4">
                  <div className="flex items-center gap-3">
                    <TrendingUp className="h-5 w-5 text-green-600" />
                    <div>
                      <p className="font-medium">Current Ratio</p>
                      <p className="text-sm text-muted-foreground">Short-term liquidity</p>
                    </div>
                  </div>
                </CardContent>
              </Card>
            </Link>
            <Link href="/category/finance/quick-ratio-calculator" className="block">
              <Card className="hover:shadow-md transition-shadow cursor-pointer">
                <CardContent className="p-4">
                  <div className="flex items-center gap-3">
                    <Shield className="h-5 w-5 text-purple-600" />
                    <div>
                      <p className="font-medium">Quick Ratio</p>
                      <p className="text-sm text-muted-foreground">Acid-test liquidity</p>
                    </div>
                  </div>
                </CardContent>
              </Card>
            </Link>
            <Link href="/category/finance/working-capital-calculator" className="block">
              <Card className="hover:shadow-md transition-shadow cursor-pointer">
                <CardContent className="p-4">
                  <div className="flex items-center gap-3">
                    <DollarSign className="h-5 w-5 text-orange-600" />
                    <div>
                      <p className="font-medium">Working Capital</p>
                      <p className="text-sm text-muted-foreground">Operational liquidity</p>
                    </div>
                  </div>
                </CardContent>
              </Card>
            </Link>
            <Link href="/category/finance/return-on-equity-calculator" className="block">
              <Card className="hover:shadow-md transition-shadow cursor-pointer">
                <CardContent className="p-4">
                  <div className="flex items-center gap-3">
                    <TrendingUp className="h-5 w-5 text-red-600" />
                    <div>
                      <p className="font-medium">Return on Equity</p>
                      <p className="text-sm text-muted-foreground">Profitability analysis</p>
                    </div>
                  </div>
                </CardContent>
              </Card>
            </Link>
            <Link href="/category/finance/ebitda-ebit-calculator" className="block">
              <Card className="hover:shadow-md transition-shadow cursor-pointer">
                <CardContent className="p-4">
                  <div className="flex items-center gap-3">
                    <BarChart3 className="h-5 w-5 text-indigo-600" />
                    <div>
                      <p className="font-medium">EBITDA Calculator</p>
                      <p className="text-sm text-muted-foreground">Earnings analysis</p>
                    </div>
                  </div>
                </CardContent>
              </Card>
            </Link>
          </div>
        </CardContent>
      </Card>

      {/* Complete Guide Section */}
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <Info className="h-5 w-5" />
            Complete Guide to Interest Coverage Ratio
          </CardTitle>
          <CardDescription>
            Comprehensive understanding of debt servicing analysis
          </CardDescription>
        </CardHeader>
        <CardContent className="space-y-4">
          <div className="prose prose-sm max-w-none">
            <p className="text-muted-foreground">
              The Interest Coverage Ratio is a critical financial metric that measures a company's ability to pay interest on its outstanding debt. This comprehensive guide will help you understand how to calculate, interpret, and use this ratio effectively in financial analysis.
            </p>
            <p className="text-muted-foreground">
              Understanding the nuances of debt servicing capability is essential for investors, creditors, and management teams to make informed financial decisions and assess the company's financial health and risk profile.
            </p>
          </div>
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
            Common questions about Interest Coverage Ratio
          </CardDescription>
        </CardHeader>
        <CardContent>
          <div className="space-y-6">
            <div>
              <h4 className="font-semibold text-lg mb-3">What is the Interest Coverage Ratio?</h4>
              <p className="text-muted-foreground">
                The Interest Coverage Ratio is a financial metric that measures a company's ability to pay interest on its outstanding debt. It's calculated by dividing earnings before interest and taxes (EBIT) by interest expense. This ratio indicates how many times a company can cover its interest payments with its current earnings.
              </p>
            </div>
            
            <div>
              <h4 className="font-semibold text-lg mb-3">What is considered a good Interest Coverage Ratio?</h4>
              <p className="text-muted-foreground">
                Generally, a ratio of 2.5 or higher is considered good, indicating the company can comfortably cover its interest payments. A ratio of 5 or higher is excellent, showing strong financial health. Ratios below 1.5 may indicate potential financial distress, while ratios below 1 suggest the company cannot cover its interest payments from current earnings.
              </p>
            </div>
            
            <div>
              <h4 className="font-semibold text-lg mb-3">How do I calculate the Interest Coverage Ratio?</h4>
              <p className="text-muted-foreground">
                The formula is: Interest Coverage Ratio = EBIT ÷ Interest Expense. EBIT (Earnings Before Interest and Taxes) is found on the income statement and represents operating profit. Interest Expense is also on the income statement and represents the cost of debt for the period.
              </p>
            </div>
            
            <div>
              <h4 className="font-semibold text-lg mb-3">Do Interest Coverage Ratios vary by industry?</h4>
              <p className="text-muted-foreground">
                Yes, acceptable ratios vary significantly by industry. Capital-intensive industries like utilities or telecommunications may have lower acceptable ratios due to stable cash flows. Technology companies might have higher ratios due to less debt reliance. Always compare ratios within the same industry for meaningful analysis.
              </p>
            </div>
            
            <div>
              <h4 className="font-semibold text-lg mb-3">What are the limitations of the Interest Coverage Ratio?</h4>
              <p className="text-muted-foreground">
                The ratio doesn't account for principal payments, only interest. It's based on historical data and may not reflect future performance. One-time charges can distort EBIT. It doesn't consider cash flow timing or the quality of earnings. Seasonal businesses may have fluctuating ratios throughout the year.
              </p>
            </div>
            
            <div>
              <h4 className="font-semibold text-lg mb-3">How can a company improve its Interest Coverage Ratio?</h4>
              <p className="text-muted-foreground">
                Companies can improve the ratio by increasing EBIT through revenue growth, cost reduction, or operational efficiency. They can also reduce interest expense by refinancing debt at lower rates, paying down debt, or restructuring debt terms. However, these strategies should be balanced with growth objectives and capital structure optimization.
              </p>
            </div>
            
            <div>
              <h4 className="font-semibold text-lg mb-3">What if EBIT is negative?</h4>
              <p className="text-muted-foreground">
                If EBIT is negative, the Interest Coverage Ratio will also be negative, indicating the company cannot cover its interest payments from current operations. This is a serious financial distress signal. The company would need to rely on cash reserves, asset sales, or additional financing to meet interest obligations.
              </p>
            </div>
            
            <div>
              <h4 className="font-semibold text-lg mb-3">How should I compare Interest Coverage Ratios between companies?</h4>
              <p className="text-muted-foreground">
                Compare companies within the same industry and similar business models. Consider company size, growth stage, and capital structure. Look at historical trends rather than single data points. Also consider other financial ratios and qualitative factors for a complete picture of financial health.
              </p>
            </div>
            
            <div>
              <h4 className="font-semibold text-lg mb-3">Why is the Interest Coverage Ratio important for investors?</h4>
              <p className="text-muted-foreground">
                For investors, this ratio indicates the company's financial stability and ability to meet debt obligations. A strong ratio suggests lower bankruptcy risk and more predictable cash flows. It also indicates whether the company has financial flexibility for growth investments or dividend payments.
              </p>
            </div>
            
            <div>
              <h4 className="font-semibold text-lg mb-3">How do creditors use the Interest Coverage Ratio?</h4>
              <p className="text-muted-foreground">
                Creditors use this ratio to assess credit risk and determine loan terms. Higher ratios may result in better interest rates and loan conditions. Creditors typically require minimum ratios in loan covenants to ensure borrowers maintain adequate debt servicing capability throughout the loan term.
              </p>
            </div>
          </div>
        </CardContent>
      </Card>
    </div>
  );
}

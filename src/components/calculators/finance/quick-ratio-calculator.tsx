
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
  cash: z.number().nonnegative(),
  marketableSecurities: z.number().nonnegative(),
  accountsReceivable: z.number().nonnegative(),
  currentLiabilities: z.number().positive(),
});

type FormValues = z.infer<typeof formSchema>;

export default function QuickRatioCalculator() {
  const [result, setResult] = useState<{ 
    ratio: number; 
    interpretation: string; 
    liquidityLevel: string;
    recommendation: string;
    strength: string;
    insights: string[];
    considerations: string[];
  } | null>(null);

  const form = useForm<FormValues>({
    resolver: zodResolver(formSchema),
    defaultValues: {
      cash: undefined,
      marketableSecurities: undefined,
      accountsReceivable: undefined,
      currentLiabilities: undefined,
    },
  });

  const calculate = (v: FormValues) => {
    if (v.cash == null || v.marketableSecurities == null || v.accountsReceivable == null || v.currentLiabilities == null) return null;
    const quickAssets = v.cash + v.marketableSecurities + v.accountsReceivable;
    return quickAssets / v.currentLiabilities;
  };

  const interpret = (ratio: number) => {
    if (ratio >= 2) return 'Excellent liquidity with very strong acid-test position.';
    if (ratio >= 1.5) return 'Good liquidity position with comfortable quick asset coverage.';
    if (ratio >= 1) return 'Adequate liquidity but monitor cash flow management closely.';
    if (ratio >= 0.5) return 'Marginal liquidity - potential cash flow constraints.';
    return 'Insufficient liquidity - immediate financial distress risk.';
  };

  const getLiquidityLevel = (ratio: number) => {
    if (ratio >= 2) return 'Very High';
    if (ratio >= 1.5) return 'High';
    if (ratio >= 1) return 'Moderate';
    if (ratio >= 0.5) return 'Low';
    return 'Very Low';
  };

  const getRecommendation = (ratio: number) => {
    if (ratio >= 2) return 'Consider optimizing working capital efficiency and investing excess liquidity.';
    if (ratio >= 1.5) return 'Maintain current liquidity levels and monitor cash flow trends.';
    if (ratio >= 1) return 'Focus on improving cash management and reducing current liabilities.';
    if (ratio >= 0.5) return 'Urgent need to improve liquidity through better cash flow management.';
    return 'Critical liquidity crisis - immediate action required to avoid default.';
  };

  const getStrength = (ratio: number) => {
    if (ratio >= 2) return 'Very Strong';
    if (ratio >= 1.5) return 'Strong';
    if (ratio >= 1) return 'Moderate';
    if (ratio >= 0.5) return 'Weak';
    return 'Very Weak';
  };

  const getInsights = (ratio: number) => {
    const insights = [];
    if (ratio >= 2) {
      insights.push('Exceptional acid-test liquidity position');
      insights.push('Low risk of immediate cash flow problems');
      insights.push('Strong position for growth opportunities');
    } else if (ratio >= 1.5) {
      insights.push('Healthy quick asset management');
      insights.push('Good financial stability');
      insights.push('Comfortable liquidity buffer');
    } else if (ratio >= 1) {
      insights.push('Adequate but not optimal liquidity');
      insights.push('Monitor receivables collection closely');
      insights.push('Consider working capital optimization');
    } else if (ratio >= 0.5) {
      insights.push('Marginal liquidity position');
      insights.push('High sensitivity to cash flow timing');
      insights.push('Urgent need for liquidity improvement');
    } else {
      insights.push('Insufficient quick assets to cover liabilities');
      insights.push('Immediate liquidity crisis');
      insights.push('Critical financial distress situation');
    }
    return insights;
  };

  const getConsiderations = (ratio: number) => {
    const considerations = [];
    considerations.push('Industry benchmarks vary significantly');
    considerations.push('Seasonal businesses may have fluctuating ratios');
    considerations.push('Accounts receivable quality affects liquidity');
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
        liquidityLevel: getLiquidityLevel(ratio),
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
            Enter your company's quick assets and current liabilities to calculate the Quick Ratio
          </CardDescription>
        </CardHeader>
        <CardContent>
          <Form {...form}>
            <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-6">
              <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                <FormField 
                  control={form.control} 
                  name="cash" 
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel className="flex items-center gap-2">
                        <DollarSign className="h-4 w-4" />
                        Cash ($)
                      </FormLabel>
                      <FormControl>
                        <Input 
                          type="number" 
                          step="0.01" 
                          placeholder="e.g., 200000" 
                          {...field} 
                          value={field.value ?? ''} 
                          onChange={e => field.onChange(parseFloat(e.target.value) || 0)} 
                        />
                      </FormControl>
                      <FormMessage />
                    </FormItem>
                  )} 
                />
                <FormField 
                  control={form.control} 
                  name="marketableSecurities" 
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel className="flex items-center gap-2">
                        <BarChart3 className="h-4 w-4" />
                        Marketable Securities ($)
                      </FormLabel>
                      <FormControl>
                        <Input 
                          type="number" 
                          step="0.01" 
                          placeholder="e.g., 100000" 
                          {...field} 
                          value={field.value ?? ''} 
                          onChange={e => field.onChange(parseFloat(e.target.value) || 0)} 
                        />
                      </FormControl>
                      <FormMessage />
                    </FormItem>
                  )} 
                />
                <FormField 
                  control={form.control} 
                  name="accountsReceivable" 
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel className="flex items-center gap-2">
                        <TrendingUp className="h-4 w-4" />
                        Accounts Receivable ($)
                      </FormLabel>
                      <FormControl>
                        <Input 
                          type="number" 
                          step="0.01" 
                          placeholder="e.g., 300000" 
                          {...field} 
                          value={field.value ?? ''} 
                          onChange={e => field.onChange(parseFloat(e.target.value) || 0)} 
                        />
                      </FormControl>
                      <FormMessage />
                    </FormItem>
                  )} 
                />
                <FormField 
                  control={form.control} 
                  name="currentLiabilities" 
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel className="flex items-center gap-2">
                        <AlertCircle className="h-4 w-4" />
                        Current Liabilities ($)
                      </FormLabel>
                      <FormControl>
                        <Input 
                          type="number" 
                          step="0.01" 
                          placeholder="e.g., 400000" 
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
                Calculate Quick Ratio
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
                  <CardTitle>Quick Ratio (Acid-Test)</CardTitle>
                  <CardDescription>Conservative Liquidity Analysis</CardDescription>
                </div>
              </div>
            </CardHeader>
            <CardContent className="space-y-6">
              <div className="text-center">
                <p className="text-4xl font-bold text-primary">{result.ratio.toFixed(2)}</p>
                <p className="text-lg text-muted-foreground mt-2">{result.interpretation}</p>
              </div>
              
              <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                <div className="text-center p-4 bg-muted/50 rounded-lg">
                  <Shield className="h-6 w-6 mx-auto mb-2 text-blue-600" />
                  <p className="font-semibold">Liquidity Level</p>
                  <Badge variant={result.liquidityLevel === 'Very High' ? 'default' : result.liquidityLevel === 'High' ? 'secondary' : result.liquidityLevel === 'Moderate' ? 'outline' : 'destructive'}>
                    {result.liquidityLevel}
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
                  <p className="font-semibold">Quick Asset Coverage</p>
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
            Explore other liquidity and financial analysis tools
          </CardDescription>
        </CardHeader>
        <CardContent>
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
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
            <Link href="/category/finance/cash-conversion-cycle-calculator" className="block">
              <Card className="hover:shadow-md transition-shadow cursor-pointer">
                <CardContent className="p-4">
                  <div className="flex items-center gap-3">
                    <BarChart3 className="h-5 w-5 text-blue-600" />
                    <div>
                      <p className="font-medium">Cash Conversion Cycle</p>
                      <p className="text-sm text-muted-foreground">Working capital efficiency</p>
                    </div>
                  </div>
                </CardContent>
              </Card>
            </Link>
            <Link href="/category/finance/interest-coverage-ratio-calculator" className="block">
              <Card className="hover:shadow-md transition-shadow cursor-pointer">
                <CardContent className="p-4">
                  <div className="flex items-center gap-3">
                    <Shield className="h-5 w-5 text-purple-600" />
                    <div>
                      <p className="font-medium">Interest Coverage Ratio</p>
                      <p className="text-sm text-muted-foreground">Debt servicing capability</p>
                    </div>
                  </div>
                </CardContent>
              </Card>
            </Link>
            <Link href="/category/finance/debt-to-equity-ratio-calculator" className="block">
              <Card className="hover:shadow-md transition-shadow cursor-pointer">
                <CardContent className="p-4">
                  <div className="flex items-center gap-3">
                    <BarChart3 className="h-5 w-5 text-red-600" />
                    <div>
                      <p className="font-medium">Debt-to-Equity Ratio</p>
                      <p className="text-sm text-muted-foreground">Capital structure analysis</p>
                    </div>
                  </div>
                </CardContent>
              </Card>
            </Link>
            <Link href="/category/finance/free-cash-flow-calculator" className="block">
              <Card className="hover:shadow-md transition-shadow cursor-pointer">
                <CardContent className="p-4">
                  <div className="flex items-center gap-3">
                    <DollarSign className="h-5 w-5 text-indigo-600" />
                    <div>
                      <p className="font-medium">Free Cash Flow</p>
                      <p className="text-sm text-muted-foreground">Cash generation analysis</p>
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
            Complete Guide to Quick Ratio
          </CardTitle>
          <CardDescription>
            Comprehensive understanding of acid-test liquidity analysis
          </CardDescription>
        </CardHeader>
        <CardContent className="space-y-4">
          <div className="prose prose-sm max-w-none">
            <p className="text-muted-foreground">
              The Quick Ratio, also known as the Acid-Test Ratio, is a conservative liquidity metric that measures a company's ability to pay its short-term obligations using only its most liquid assets. This comprehensive guide will help you understand how to calculate, interpret, and use this ratio effectively in financial analysis.
            </p>
            <p className="text-muted-foreground">
              Understanding conservative liquidity assessment is crucial for investors, creditors, and management teams to evaluate the company's immediate financial flexibility and risk management capabilities.
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
            Common questions about Quick Ratio
          </CardDescription>
        </CardHeader>
        <CardContent>
          <div className="space-y-6">
            <div>
              <h4 className="font-semibold text-lg mb-3">What is the Quick Ratio?</h4>
              <p className="text-muted-foreground">
                The Quick Ratio, also known as the Acid-Test Ratio, is a liquidity ratio that measures a company's ability to pay short-term obligations using only its most liquid assets. It excludes inventory and other less liquid current assets, providing a more conservative assessment of liquidity than the Current Ratio.
              </p>
            </div>
            
            <div>
              <h4 className="font-semibold text-lg mb-3">What is considered a good Quick Ratio?</h4>
              <p className="text-muted-foreground">
                Generally, a ratio of 1 or higher is considered good, indicating the company can cover its current liabilities without selling inventory. A ratio of 1.5 or higher is excellent, showing strong liquidity. Ratios below 0.5 may indicate potential liquidity problems, while ratios below 1 suggest reliance on inventory sales to meet obligations.
              </p>
            </div>
            
            <div>
              <h4 className="font-semibold text-lg mb-3">How do I calculate the Quick Ratio?</h4>
              <p className="text-muted-foreground">
                The formula is: Quick Ratio = (Cash + Marketable Securities + Accounts Receivable) ÷ Current Liabilities. This excludes inventory and other less liquid assets. Cash includes cash equivalents, marketable securities are short-term investments, and accounts receivable are amounts owed by customers.
              </p>
            </div>
            
            <div>
              <h4 className="font-semibold text-lg mb-3">How does Quick Ratio differ from Current Ratio?</h4>
              <p className="text-muted-foreground">
                The Quick Ratio excludes inventory and other less liquid assets, while the Current Ratio includes all current assets. The Quick Ratio is more conservative and provides a stricter test of liquidity. It assumes that inventory may not be easily convertible to cash, making it a better indicator of immediate liquidity.
              </p>
            </div>
            
            <div>
              <h4 className="font-semibold text-lg mb-3">Do Quick Ratios vary by industry?</h4>
              <p className="text-muted-foreground">
                Yes, acceptable ratios vary significantly by industry. Service companies typically have higher ratios due to fewer inventory requirements. Retail companies may have lower ratios due to high inventory levels. Technology companies often have higher ratios due to cash-heavy business models. Always compare within the same industry.
              </p>
            </div>
            
            <div>
              <h4 className="font-semibold text-lg mb-3">What are the limitations of the Quick Ratio?</h4>
              <p className="text-muted-foreground">
                The ratio doesn't consider the quality of accounts receivable or their collection timing. It's a snapshot in time and doesn't reflect cash flow patterns. It doesn't account for credit lines or other financing options. Seasonal businesses may have fluctuating ratios. It assumes all quick assets are equally liquid.
              </p>
            </div>
            
            <div>
              <h4 className="font-semibold text-lg mb-3">How can a company improve its Quick Ratio?</h4>
              <p className="text-muted-foreground">
                Companies can improve the ratio by increasing cash through better cash management, improving receivables collection, or selling marketable securities. They can also reduce current liabilities by paying down short-term debt or extending payment terms. However, excessive liquidity may indicate inefficient capital allocation.
              </p>
            </div>
            
            <div>
              <h4 className="font-semibold text-lg mb-3">What if quick assets are less than current liabilities?</h4>
              <p className="text-muted-foreground">
                A ratio below 1 indicates that quick assets are insufficient to cover current liabilities, suggesting potential liquidity problems. This means the company may need to sell inventory or rely on additional financing to meet short-term obligations. It's a warning sign for creditors and investors.
              </p>
            </div>
            
            <div>
              <h4 className="font-semibold text-lg mb-3">Why is the Quick Ratio important for investors?</h4>
              <p className="text-muted-foreground">
                For investors, this ratio indicates the company's immediate financial flexibility and ability to meet obligations without disrupting operations. A strong ratio suggests lower bankruptcy risk and more predictable cash flows. It also indicates whether the company has sufficient liquidity for growth investments or unexpected expenses.
              </p>
            </div>
            
            <div>
              <h4 className="font-semibold text-lg mb-3">How do creditors use the Quick Ratio?</h4>
              <p className="text-muted-foreground">
                Creditors use this ratio to assess immediate credit risk and determine loan terms. Higher ratios may result in better credit terms and lower interest rates. Creditors often require minimum ratios in loan covenants to ensure borrowers maintain adequate liquidity throughout the loan term, especially for short-term loans.
              </p>
            </div>
          </div>
        </CardContent>
      </Card>
    </div>
  );
}

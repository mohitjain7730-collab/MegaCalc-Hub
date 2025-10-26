
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
  currentAssets: z.number().positive(),
  currentLiabilities: z.number().positive(),
});

type FormValues = z.infer<typeof formSchema>;

export default function CurrentRatioCalculator() {
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
      currentAssets: undefined,
      currentLiabilities: undefined,
    },
  });

  const calculate = (v: FormValues) => {
    if (v.currentAssets == null || v.currentLiabilities == null) return null;
    return v.currentAssets / v.currentLiabilities;
  };

  const interpret = (ratio: number) => {
    if (ratio >= 3) return 'Very high liquidity with excellent short-term financial strength.';
    if (ratio >= 2) return 'Good liquidity position with comfortable short-term coverage.';
    if (ratio >= 1.5) return 'Adequate liquidity but monitor cash flow management.';
    if (ratio >= 1) return 'Marginal liquidity - potential short-term cash flow issues.';
    return 'Insufficient liquidity - immediate financial distress risk.';
  };

  const getLiquidityLevel = (ratio: number) => {
    if (ratio >= 3) return 'Very High';
    if (ratio >= 2) return 'High';
    if (ratio >= 1.5) return 'Moderate';
    if (ratio >= 1) return 'Low';
    return 'Very Low';
  };

  const getRecommendation = (ratio: number) => {
    if (ratio >= 3) return 'Consider optimizing working capital efficiency and investing excess liquidity.';
    if (ratio >= 2) return 'Maintain current liquidity levels and monitor cash flow trends.';
    if (ratio >= 1.5) return 'Focus on improving cash management and reducing current liabilities.';
    if (ratio >= 1) return 'Urgent need to improve liquidity through better cash flow management.';
    return 'Critical liquidity crisis - immediate action required to avoid default.';
  };

  const getStrength = (ratio: number) => {
    if (ratio >= 3) return 'Very Strong';
    if (ratio >= 2) return 'Strong';
    if (ratio >= 1.5) return 'Moderate';
    if (ratio >= 1) return 'Weak';
    return 'Very Weak';
  };

  const getInsights = (ratio: number) => {
    const insights = [];
    if (ratio >= 3) {
      insights.push('Excellent short-term financial flexibility');
      insights.push('Low risk of liquidity problems');
      insights.push('Strong position for growth opportunities');
    } else if (ratio >= 2) {
      insights.push('Healthy liquidity management');
      insights.push('Good financial stability');
      insights.push('Comfortable working capital position');
    } else if (ratio >= 1.5) {
      insights.push('Adequate but not optimal liquidity');
      insights.push('Monitor cash conversion cycles');
      insights.push('Consider working capital optimization');
    } else if (ratio >= 1) {
      insights.push('Marginal liquidity position');
      insights.push('High sensitivity to cash flow timing');
      insights.push('Urgent need for liquidity improvement');
    } else {
      insights.push('Insufficient assets to cover liabilities');
      insights.push('Immediate liquidity crisis');
      insights.push('Critical financial distress situation');
    }
    return insights;
  };

  const getConsiderations = (ratio: number) => {
    const considerations = [];
    considerations.push('Industry benchmarks vary significantly');
    considerations.push('Seasonal businesses may have fluctuating ratios');
    considerations.push('Inventory quality affects liquidity assessment');
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
            Enter your company's current assets and liabilities to calculate the Current Ratio
          </CardDescription>
        </CardHeader>
        <CardContent>
      <Form {...form}>
        <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-6">
              <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                <FormField 
                  control={form.control} 
                  name="currentAssets" 
                  render={({ field }) => (
              <FormItem>
                      <FormLabel className="flex items-center gap-2">
                        <DollarSign className="h-4 w-4" />
                        Total Current Assets ($)
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
                  )} 
                />
                <FormField 
                  control={form.control} 
                  name="currentLiabilities" 
                  render={({ field }) => (
              <FormItem>
                      <FormLabel className="flex items-center gap-2">
                        <AlertCircle className="h-4 w-4" />
                        Total Current Liabilities ($)
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
          </div>
              <Button type="submit" className="w-full">
                <Calculator className="mr-2 h-4 w-4" />
                Calculate Current Ratio
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
              <CardTitle>Current Ratio</CardTitle>
                  <CardDescription>Short-term Liquidity Analysis</CardDescription>
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
                  <p className="font-semibold">Asset Coverage</p>
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
                    <TrendingUp className="h-5 w-5 text-green-600" />
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
            Complete Guide to Current Ratio
          </CardTitle>
          <CardDescription>
            Comprehensive understanding of short-term liquidity analysis
          </CardDescription>
        </CardHeader>
        <CardContent className="space-y-4">
          <div className="prose prose-sm max-w-none">
            <p className="text-muted-foreground">
              The Current Ratio is a fundamental liquidity metric that measures a company's ability to pay its short-term obligations with its short-term assets. This comprehensive guide will help you understand how to calculate, interpret, and use this ratio effectively in financial analysis.
            </p>
            <p className="text-muted-foreground">
              Understanding liquidity management is crucial for investors, creditors, and management teams to assess the company's short-term financial health and operational efficiency.
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
            Common questions about Current Ratio
          </CardDescription>
        </CardHeader>
        <CardContent>
          <div className="space-y-6">
            <div>
              <h4 className="font-semibold text-lg mb-3">What is the Current Ratio?</h4>
              <p className="text-muted-foreground">
                The Current Ratio is a liquidity ratio that measures a company's ability to pay short-term obligations or those due within one year. It's calculated by dividing current assets by current liabilities. This ratio indicates how many times a company can cover its current liabilities with its current assets.
              </p>
            </div>
            
            <div>
              <h4 className="font-semibold text-lg mb-3">What is considered a good Current Ratio?</h4>
              <p className="text-muted-foreground">
                Generally, a ratio between 1.5 and 2 is considered healthy, indicating good short-term financial strength. A ratio above 2 may indicate excess liquidity, while a ratio below 1 suggests potential liquidity problems. However, optimal ratios vary by industry and business model.
              </p>
            </div>
            
            <div>
              <h4 className="font-semibold text-lg mb-3">How do I calculate the Current Ratio?</h4>
              <p className="text-muted-foreground">
                The formula is: Current Ratio = Current Assets ÷ Current Liabilities. Current Assets include cash, accounts receivable, inventory, and other assets expected to be converted to cash within one year. Current Liabilities include accounts payable, short-term debt, and other obligations due within one year.
              </p>
            </div>
            
            <div>
              <h4 className="font-semibold text-lg mb-3">Do Current Ratios vary by industry?</h4>
              <p className="text-muted-foreground">
                Yes, acceptable ratios vary significantly by industry. Retail companies typically have lower ratios due to high inventory turnover. Service companies may have higher ratios due to fewer current assets. Manufacturing companies often have moderate ratios. Always compare within the same industry for meaningful analysis.
              </p>
            </div>
            
            <div>
              <h4 className="font-semibold text-lg mb-3">What are the limitations of the Current Ratio?</h4>
              <p className="text-muted-foreground">
                The ratio doesn't consider the quality or liquidity of specific assets. Inventory may not be easily convertible to cash. It's a snapshot in time and doesn't reflect cash flow timing. Seasonal businesses may have fluctuating ratios. It doesn't account for off-balance sheet obligations or credit lines.
              </p>
            </div>
            
            <div>
              <h4 className="font-semibold text-lg mb-3">How can a company improve its Current Ratio?</h4>
              <p className="text-muted-foreground">
                Companies can improve the ratio by increasing current assets through better cash management, faster receivables collection, or inventory optimization. They can also reduce current liabilities by paying down short-term debt or extending payment terms with suppliers. However, excessive liquidity may indicate inefficient capital allocation.
              </p>
            </div>
            
            <div>
              <h4 className="font-semibold text-lg mb-3">What if current liabilities exceed current assets?</h4>
              <p className="text-muted-foreground">
                A ratio below 1 indicates that current liabilities exceed current assets, suggesting potential liquidity problems. This means the company may struggle to meet its short-term obligations without additional financing, asset sales, or improved cash flow generation. It's a warning sign for creditors and investors.
              </p>
            </div>
            
            <div>
              <h4 className="font-semibold text-lg mb-3">How does Current Ratio differ from Quick Ratio?</h4>
              <p className="text-muted-foreground">
                The Current Ratio includes all current assets (including inventory), while the Quick Ratio excludes inventory and other less liquid assets. The Quick Ratio is more conservative and provides a stricter test of liquidity. Both ratios should be analyzed together for a complete liquidity assessment.
              </p>
            </div>
            
            <div>
              <h4 className="font-semibold text-lg mb-3">Why is the Current Ratio important for investors?</h4>
              <p className="text-muted-foreground">
                For investors, this ratio indicates the company's short-term financial stability and ability to meet obligations without disrupting operations. A healthy ratio suggests lower bankruptcy risk and more predictable cash flows. It also indicates whether the company has sufficient liquidity for growth investments or unexpected expenses.
              </p>
            </div>
            
            <div>
              <h4 className="font-semibold text-lg mb-3">How do creditors use the Current Ratio?</h4>
              <p className="text-muted-foreground">
                Creditors use this ratio to assess short-term credit risk and determine loan terms. Higher ratios may result in better credit terms and lower interest rates. Creditors often require minimum ratios in loan covenants to ensure borrowers maintain adequate liquidity throughout the loan term.
              </p>
            </div>
          </div>
        </CardContent>
      </Card>
    </div>
  );
}

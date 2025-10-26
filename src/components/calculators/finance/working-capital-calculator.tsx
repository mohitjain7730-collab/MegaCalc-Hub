
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
  currentAssets: z.number().nonnegative(),
  currentLiabilities: z.number().nonnegative(),
});

type FormValues = z.infer<typeof formSchema>;

export default function WorkingCapitalCalculator() {
  const [result, setResult] = useState<{ 
    workingCapital: number; 
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
    return v.currentAssets - v.currentLiabilities;
  };

  const interpret = (workingCapital: number) => {
    if (workingCapital >= 1000000) return 'Excellent working capital position with strong operational liquidity.';
    if (workingCapital >= 500000) return 'Good working capital with comfortable operational flexibility.';
    if (workingCapital >= 100000) return 'Adequate working capital but monitor cash flow management.';
    if (workingCapital >= 0) return 'Marginal working capital - potential operational constraints.';
    return 'Negative working capital - immediate operational liquidity risk.';
  };

  const getLiquidityLevel = (workingCapital: number) => {
    if (workingCapital >= 1000000) return 'Very High';
    if (workingCapital >= 500000) return 'High';
    if (workingCapital >= 100000) return 'Moderate';
    if (workingCapital >= 0) return 'Low';
    return 'Very Low';
  };

  const getRecommendation = (workingCapital: number) => {
    if (workingCapital >= 1000000) return 'Consider optimizing working capital efficiency and investing excess liquidity.';
    if (workingCapital >= 500000) return 'Maintain current working capital levels and monitor cash flow trends.';
    if (workingCapital >= 100000) return 'Focus on improving cash management and reducing current liabilities.';
    if (workingCapital >= 0) return 'Urgent need to improve working capital through better cash flow management.';
    return 'Critical working capital crisis - immediate action required to avoid operational disruption.';
  };

  const getStrength = (workingCapital: number) => {
    if (workingCapital >= 1000000) return 'Very Strong';
    if (workingCapital >= 500000) return 'Strong';
    if (workingCapital >= 100000) return 'Moderate';
    if (workingCapital >= 0) return 'Weak';
    return 'Very Weak';
  };

  const getInsights = (workingCapital: number) => {
    const insights = [];
    if (workingCapital >= 1000000) {
      insights.push('Exceptional operational liquidity position');
      insights.push('Low risk of operational cash flow problems');
      insights.push('Strong position for growth opportunities');
    } else if (workingCapital >= 500000) {
      insights.push('Healthy working capital management');
      insights.push('Good operational financial stability');
      insights.push('Comfortable liquidity buffer for operations');
    } else if (workingCapital >= 100000) {
      insights.push('Adequate but not optimal working capital');
      insights.push('Monitor cash conversion cycles closely');
      insights.push('Consider working capital optimization');
    } else if (workingCapital >= 0) {
      insights.push('Marginal working capital position');
      insights.push('High sensitivity to cash flow timing');
      insights.push('Urgent need for working capital improvement');
    } else {
      insights.push('Insufficient assets to cover current liabilities');
      insights.push('Immediate operational liquidity crisis');
      insights.push('Critical financial distress situation');
    }
    return insights;
  };

  const getConsiderations = (workingCapital: number) => {
    const considerations = [];
    considerations.push('Industry benchmarks vary significantly');
    considerations.push('Seasonal businesses may have fluctuating working capital');
    considerations.push('Working capital needs vary by business model');
    considerations.push('Compare with historical performance');
    considerations.push('Consider cash flow timing differences');
    return considerations;
  };

  const onSubmit = (values: FormValues) => {
    const workingCapital = calculate(values);
    if (workingCapital !== null) {
      setResult({
        workingCapital,
        interpretation: interpret(workingCapital),
        liquidityLevel: getLiquidityLevel(workingCapital),
        recommendation: getRecommendation(workingCapital),
        strength: getStrength(workingCapital),
        insights: getInsights(workingCapital),
        considerations: getConsiderations(workingCapital)
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
            Enter your company's current assets and liabilities to calculate Working Capital
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
                        Total Current Liabilities ($)
                      </FormLabel>
                <FormControl>
                        <Input 
                          type="number" 
                          step="0.01" 
                          placeholder="e.g., 500000" 
                          {...field} 
                          value={field.value ?? ''} 
                          onChange={e => field.onChange(parseFloat(e.target.value) || 0)} 
                        />
                </FormControl>
                <FormMessage />
              </FormItem>
                  )} 
                />
          </div>
              <Button type="submit" className="w-full">
                <Calculator className="mr-2 h-4 w-4" />
                Calculate Working Capital
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
              <CardTitle>Working Capital</CardTitle>
                  <CardDescription>Operational Liquidity Analysis</CardDescription>
                </div>
            </div>
          </CardHeader>
            <CardContent className="space-y-6">
              <div className="text-center">
                <p className={`text-4xl font-bold ${result.workingCapital >= 0 ? 'text-primary' : 'text-red-600'}`}>
                  ${result.workingCapital.toLocaleString(undefined, { maximumFractionDigits: 2 })}
                </p>
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
                  <p className="font-semibold">Net Position</p>
                  <p className={`text-lg font-bold ${result.workingCapital >= 0 ? 'text-green-600' : 'text-red-600'}`}>
                    {result.workingCapital >= 0 ? 'Positive' : 'Negative'}
                  </p>
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
          </div>
        </CardContent>
      </Card>

      {/* Complete Guide Section */}
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <Info className="h-5 w-5" />
            Complete Guide to Working Capital
          </CardTitle>
          <CardDescription>
            Comprehensive understanding of operational liquidity analysis
          </CardDescription>
        </CardHeader>
        <CardContent className="space-y-4">
          <div className="prose prose-sm max-w-none">
            <p className="text-muted-foreground">
              Working Capital is a fundamental measure of a company's operational liquidity and short-term financial health. This comprehensive guide will help you understand how to calculate, interpret, and use working capital effectively in financial analysis and business management.
            </p>
            <p className="text-muted-foreground">
              Understanding working capital management is crucial for investors, creditors, and management teams to assess the company's ability to fund day-to-day operations and maintain financial stability.
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
            Common questions about Working Capital
          </CardDescription>
        </CardHeader>
        <CardContent>
          <div className="space-y-6">
            <div>
              <h4 className="font-semibold text-lg mb-3">What is Working Capital?</h4>
              <p className="text-muted-foreground">
                Working Capital is the difference between a company's current assets and current liabilities. It represents the amount of capital available to fund day-to-day operations and indicates the company's short-term financial health and operational liquidity.
              </p>
            </div>
            
            <div>
              <h4 className="font-semibold text-lg mb-3">What is considered good Working Capital?</h4>
              <p className="text-muted-foreground">
                Positive working capital is generally good, indicating the company can cover its short-term obligations. The optimal amount varies by industry and business model. Generally, working capital should be sufficient to cover 1-3 months of operating expenses, but this depends on the company's cash conversion cycle and industry characteristics.
              </p>
            </div>
            
            <div>
              <h4 className="font-semibold text-lg mb-3">How do I calculate Working Capital?</h4>
              <p className="text-muted-foreground">
                The formula is: Working Capital = Current Assets - Current Liabilities. Current Assets include cash, accounts receivable, inventory, and other assets expected to be converted to cash within one year. Current Liabilities include accounts payable, short-term debt, and other obligations due within one year.
              </p>
            </div>
            
            <div>
              <h4 className="font-semibold text-lg mb-3">What does negative Working Capital mean?</h4>
              <p className="text-muted-foreground">
                Negative working capital means current liabilities exceed current assets, indicating potential liquidity problems. This suggests the company may struggle to meet its short-term obligations without additional financing or improved cash flow. However, some businesses (like retail) can operate with negative working capital due to fast inventory turnover.
              </p>
            </div>
            
            <div>
              <h4 className="font-semibold text-lg mb-3">Do Working Capital needs vary by industry?</h4>
              <p className="text-muted-foreground">
                Yes, working capital requirements vary significantly by industry. Manufacturing companies typically need more working capital due to inventory requirements. Service companies may need less working capital. Retail companies often have negative working capital due to fast inventory turnover. Technology companies may have high working capital due to cash reserves.
              </p>
            </div>
            
            <div>
              <h4 className="font-semibold text-lg mb-3">What are the limitations of Working Capital?</h4>
              <p className="text-muted-foreground">
                Working capital is a snapshot in time and doesn't reflect cash flow timing. It doesn't consider the quality of assets or liabilities. Seasonal businesses may have fluctuating working capital. It doesn't account for credit lines or other financing options. It may not reflect the true liquidity of specific assets.
              </p>
            </div>
            
            <div>
              <h4 className="font-semibold text-lg mb-3">How can a company improve its Working Capital?</h4>
              <p className="text-muted-foreground">
                Companies can improve working capital by increasing current assets through better cash management, faster receivables collection, or inventory optimization. They can also reduce current liabilities by paying down short-term debt or extending payment terms with suppliers. However, excessive working capital may indicate inefficient capital allocation.
              </p>
            </div>
            
            <div>
              <h4 className="font-semibold text-lg mb-3">How does Working Capital relate to Cash Flow?</h4>
              <p className="text-muted-foreground">
                Working capital changes affect cash flow. Increases in working capital (more inventory, receivables) reduce cash flow, while decreases in working capital (faster collections, inventory reduction) increase cash flow. Working capital management is crucial for maintaining positive operating cash flow and business sustainability.
              </p>
            </div>
            
            <div>
              <h4 className="font-semibold text-lg mb-3">Why is Working Capital important for investors?</h4>
              <p className="text-muted-foreground">
                For investors, working capital indicates the company's operational efficiency and short-term financial stability. Adequate working capital suggests the company can fund operations without external financing. It also indicates management's ability to optimize cash conversion cycles and maintain operational flexibility for growth opportunities.
              </p>
            </div>
            
            <div>
              <h4 className="font-semibold text-lg mb-3">How do creditors use Working Capital?</h4>
              <p className="text-muted-foreground">
                Creditors use working capital to assess short-term credit risk and determine loan terms. Positive working capital suggests the company can meet short-term obligations. Creditors often require minimum working capital levels in loan covenants to ensure borrowers maintain adequate operational liquidity throughout the loan term.
              </p>
            </div>
          </div>
        </CardContent>
      </Card>
    </div>
  );
}

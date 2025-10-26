'use client';

import { useState } from 'react';
import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import { z } from 'zod';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Form, FormControl, FormField, FormItem, FormLabel, FormMessage } from '@/components/ui/form';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Activity, AlertCircle, Target, Info, Landmark, Calculator, DollarSign, TrendingUp, Shield, BarChart3 } from 'lucide-react';
import { Badge } from '@/components/ui/badge';
import { Alert, AlertDescription } from '@/components/ui/alert';
import Link from 'next/link';

const formSchema = z.object({
  totalDebt: z.number().nonnegative(),
  totalEquity: z.number().positive(),
  interestRate: z.number().nonnegative(),
  taxRate: z.number().min(0).max(100),
});

type FormValues = z.infer<typeof formSchema>;

export default function LeverageDebtRatioImpactCalculator() {
  const [result, setResult] = useState<{ 
    debtToEquityRatio: number;
    debtToAssetsRatio: number;
    interpretation: string; 
    leverageLevel: string;
    recommendation: string;
    strength: string;
    insights: string[];
    considerations: string[];
  } | null>(null);

  const form = useForm<FormValues>({
    resolver: zodResolver(formSchema),
    defaultValues: {
      totalDebt: undefined,
      totalEquity: undefined,
      interestRate: undefined,
      taxRate: undefined,
    },
  });

  const calculateLeverageRatios = (v: FormValues) => {
    if (v.totalDebt == null || v.totalEquity == null) return null;
    
    const debtToEquityRatio = v.totalDebt / v.totalEquity;
    const totalAssets = v.totalDebt + v.totalEquity;
    const debtToAssetsRatio = v.totalDebt / totalAssets;
    
    return { debtToEquityRatio, debtToAssetsRatio };
  };

  const interpret = (debtToEquityRatio: number, debtToAssetsRatio: number) => {
    if (debtToEquityRatio >= 2) return 'High leverage - significant debt burden with elevated financial risk.';
    if (debtToEquityRatio >= 1) return 'Moderate leverage - balanced debt structure with manageable risk.';
    if (debtToEquityRatio >= 0.5) return 'Low leverage - conservative debt structure with lower risk.';
    if (debtToEquityRatio >= 0) return 'Very low leverage - minimal debt with low financial risk.';
    return 'No debt - equity-only financing with minimal financial risk.';
  };

  const getLeverageLevel = (debtToEquityRatio: number) => {
    if (debtToEquityRatio >= 2) return 'High';
    if (debtToEquityRatio >= 1) return 'Moderate';
    if (debtToEquityRatio >= 0.5) return 'Low';
    if (debtToEquityRatio >= 0) return 'Very Low';
    return 'None';
  };

  const getRecommendation = (debtToEquityRatio: number) => {
    if (debtToEquityRatio >= 2) return 'Consider debt reduction strategies to improve financial stability.';
    if (debtToEquityRatio >= 1) return 'Monitor debt levels closely and maintain balanced approach.';
    if (debtToEquityRatio >= 0.5) return 'Consider strategic debt for growth opportunities.';
    if (debtToEquityRatio >= 0) return 'Evaluate opportunities for strategic leverage.';
    return 'Consider debt financing for growth and tax benefits.';
  };

  const getStrength = (debtToEquityRatio: number) => {
    if (debtToEquityRatio >= 2) return 'Weak';
    if (debtToEquityRatio >= 1) return 'Moderate';
    if (debtToEquityRatio >= 0.5) return 'Strong';
    if (debtToEquityRatio >= 0) return 'Very Strong';
    return 'Excellent';
  };

  const getInsights = (debtToEquityRatio: number, debtToAssetsRatio: number) => {
    const insights = [];
    if (debtToEquityRatio >= 2) {
      insights.push('High financial leverage');
      insights.push('Significant debt burden');
      insights.push('Elevated financial risk');
    } else if (debtToEquityRatio >= 1) {
      insights.push('Moderate financial leverage');
      insights.push('Balanced debt structure');
      insights.push('Manageable financial risk');
    } else if (debtToEquityRatio >= 0.5) {
      insights.push('Low financial leverage');
      insights.push('Conservative debt structure');
      insights.push('Lower financial risk');
    } else if (debtToEquityRatio >= 0) {
      insights.push('Very low financial leverage');
      insights.push('Minimal debt burden');
      insights.push('Low financial risk');
    } else {
      insights.push('No financial leverage');
      insights.push('Equity-only financing');
      insights.push('Minimal financial risk');
    }
    return insights;
  };

  const getConsiderations = (debtToEquityRatio: number) => {
    const considerations = [];
    considerations.push('Optimal leverage varies by industry');
    considerations.push('Debt provides tax benefits but increases risk');
    considerations.push('Consider interest rate environment');
    considerations.push('Monitor debt service capacity');
    considerations.push('Balance growth opportunities with financial stability');
    return considerations;
  };

  const onSubmit = (values: FormValues) => {
    const ratios = calculateLeverageRatios(values);
    if (ratios !== null) {
      setResult({
        debtToEquityRatio: ratios.debtToEquityRatio,
        debtToAssetsRatio: ratios.debtToAssetsRatio,
        interpretation: interpret(ratios.debtToEquityRatio, ratios.debtToAssetsRatio),
        leverageLevel: getLeverageLevel(ratios.debtToEquityRatio),
        recommendation: getRecommendation(ratios.debtToEquityRatio),
        strength: getStrength(ratios.debtToEquityRatio),
        insights: getInsights(ratios.debtToEquityRatio, ratios.debtToAssetsRatio),
        considerations: getConsiderations(ratios.debtToEquityRatio)
      });
    }
  };

  return (
    <div className="space-y-8">
      <Card>
        <CardHeader>
          <div className="flex items-center gap-2">
            <Activity className="h-6 w-6 text-primary" />
            <CardTitle>Leverage / Debt Ratio Impact Calculator</CardTitle>
          </div>
          <CardDescription>
            Calculate your company's leverage ratios to assess debt impact and financial risk
          </CardDescription>
        </CardHeader>
        <CardContent>
      <Form {...form}>
        <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-6">
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <FormField control={form.control} name="totalDebt" render={({ field }) => (
              <FormItem>
                    <FormLabel className="flex items-center gap-2">
                      <DollarSign className="h-4 w-4" />
                      Total Debt ($)
                    </FormLabel>
                    <FormControl>
                      <Input type="number" placeholder="Enter total debt" {...field} value={field.value ?? ''} onChange={e => field.onChange(parseFloat(e.target.value) || undefined)} />
                    </FormControl>
                    <FormMessage />
                  </FormItem>
                )} />
                <FormField control={form.control} name="totalEquity" render={({ field }) => (
                  <FormItem>
                    <FormLabel className="flex items-center gap-2">
                      <TrendingUp className="h-4 w-4" />
                      Total Equity ($)
                    </FormLabel>
                    <FormControl>
                      <Input type="number" placeholder="Enter total equity" {...field} value={field.value ?? ''} onChange={e => field.onChange(parseFloat(e.target.value) || undefined)} />
                    </FormControl>
                    <FormMessage />
                  </FormItem>
                )} />
                <FormField control={form.control} name="interestRate" render={({ field }) => (
                  <FormItem>
                    <FormLabel className="flex items-center gap-2">
                      <BarChart3 className="h-4 w-4" />
                      Interest Rate (%)
                    </FormLabel>
                    <FormControl>
                      <Input type="number" placeholder="Enter interest rate" {...field} value={field.value ?? ''} onChange={e => field.onChange(parseFloat(e.target.value) || undefined)} />
                    </FormControl>
                <FormMessage />
              </FormItem>
            )} />
                <FormField control={form.control} name="taxRate" render={({ field }) => (
              <FormItem>
                    <FormLabel className="flex items-center gap-2">
                      <Shield className="h-4 w-4" />
                      Tax Rate (%)
                    </FormLabel>
                    <FormControl>
                      <Input type="number" placeholder="Enter tax rate" {...field} value={field.value ?? ''} onChange={e => field.onChange(parseFloat(e.target.value) || undefined)} />
                    </FormControl>
                <FormMessage />
              </FormItem>
            )} />
          </div>
              <Button type="submit" className="w-full">
                <Calculator className="h-4 w-4 mr-2" />
                Calculate Leverage Ratios
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
                  <CardTitle>Leverage Ratios Result</CardTitle>
                </div>
                <div className="flex gap-2">
                  <Badge variant={result.leverageLevel === 'Low' ? 'default' : result.leverageLevel === 'Moderate' ? 'secondary' : 'destructive'}>
                    {result.leverageLevel}
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
                      {result.debtToEquityRatio.toFixed(2)}
                    </div>
                    <p className="text-sm text-muted-foreground">Debt-to-Equity Ratio</p>
                  </div>
                  <div>
                    <div className="text-3xl font-bold text-primary">
                      {(result.debtToAssetsRatio * 100).toFixed(1)}%
                    </div>
                    <p className="text-sm text-muted-foreground">Debt-to-Assets Ratio</p>
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
            <Link href="/category/finance/wacc-calculator" className="group">
              <Card className="group-hover:shadow-md transition-shadow">
                <CardContent className="p-4 text-center">
                  <Calculator className="h-8 w-8 mx-auto mb-2 text-primary" />
                  <p className="text-sm font-medium">WACC</p>
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
            <Link href="/category/finance/current-ratio-calculator" className="group">
              <Card className="group-hover:shadow-md transition-shadow">
                <CardContent className="p-4 text-center">
                  <Activity className="h-8 w-8 mx-auto mb-2 text-primary" />
                  <p className="text-sm font-medium">Current Ratio</p>
                </CardContent>
              </Card>
            </Link>
            <Link href="/category/finance/debt-to-equity-ratio-calculator" className="group">
              <Card className="group-hover:shadow-md transition-shadow">
                <CardContent className="p-4 text-center">
                  <BarChart3 className="h-8 w-8 mx-auto mb-2 text-primary" />
                  <p className="text-sm font-medium">Debt-to-Equity</p>
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
            Complete Guide to Leverage Ratios
          </CardTitle>
          <CardDescription>
            Everything you need to know about calculating and interpreting leverage ratios
          </CardDescription>
        </CardHeader>
        <CardContent className="space-y-4">
          <p className="text-muted-foreground">
            Leverage ratios measure the extent to which a company uses debt to finance its operations and growth. The Debt-to-Equity ratio compares total debt to total equity, while the Debt-to-Assets ratio shows what percentage of assets are financed by debt. These ratios help assess financial risk and stability.
          </p>
          <p className="text-muted-foreground">
            Understanding leverage ratios is crucial for evaluating a company's financial health, creditworthiness, and risk profile. Higher leverage ratios indicate greater financial risk but may also provide opportunities for higher returns through financial leverage. The optimal level depends on industry standards and business characteristics.
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
            Common questions about Leverage Ratios
          </CardDescription>
        </CardHeader>
        <CardContent>
          <div className="space-y-6">
            <div>
              <h4 className="font-semibold text-lg mb-3">What are leverage ratios?</h4>
              <p className="text-muted-foreground">
                Leverage ratios measure the extent to which a company uses debt to finance its operations. Common ratios include Debt-to-Equity (Total Debt ÷ Total Equity) and Debt-to-Assets (Total Debt ÷ Total Assets). These ratios help assess financial risk, creditworthiness, and the company's ability to meet debt obligations.
              </p>
            </div>
            
            <div>
              <h4 className="font-semibold text-lg mb-3">How do I calculate Debt-to-Equity ratio?</h4>
              <p className="text-muted-foreground">
                The Debt-to-Equity ratio is calculated as: Total Debt ÷ Total Equity. This ratio shows how much debt a company has relative to its equity. A ratio of 1.0 means equal amounts of debt and equity, while ratios above 1.0 indicate more debt than equity.
              </p>
            </div>
            
            <div>
              <h4 className="font-semibold text-lg mb-3">What is considered a good Debt-to-Equity ratio?</h4>
              <p className="text-muted-foreground">
                Good Debt-to-Equity ratios vary by industry. Generally, ratios below 0.5 are considered low leverage, 0.5-1.0 are moderate, and above 1.0 are high leverage. Technology companies often have lower ratios, while capital-intensive industries may have higher acceptable ratios. Compare to industry averages.
              </p>
            </div>
            
            <div>
              <h4 className="font-semibold text-lg mb-3">What does high leverage mean?</h4>
              <p className="text-muted-foreground">
                High leverage means a company has significant debt relative to its equity. This increases financial risk as the company must make regular debt payments regardless of performance. However, it can also amplify returns when the company performs well. High leverage requires careful risk management.
              </p>
            </div>
            
            <div>
              <h4 className="font-semibold text-lg mb-3">What does low leverage mean?</h4>
              <p className="text-muted-foreground">
                Low leverage means a company has minimal debt relative to its equity. This indicates conservative financial management and lower financial risk. However, it may also mean the company is not taking advantage of debt's tax benefits and potential for higher returns through financial leverage.
              </p>
            </div>
            
            <div>
              <h4 className="font-semibold text-lg mb-3">How do leverage ratios affect credit ratings?</h4>
              <p className="text-muted-foreground">
                Credit rating agencies use leverage ratios to assess a company's creditworthiness. Higher leverage ratios typically result in lower credit ratings and higher borrowing costs. Companies with low leverage ratios generally receive better credit ratings and can borrow at more favorable rates.
              </p>
            </div>
            
            <div>
              <h4 className="font-semibold text-lg mb-3">What are the benefits of debt financing?</h4>
              <p className="text-muted-foreground">
                Debt financing provides tax benefits (interest is tax-deductible), allows companies to retain ownership control, and can amplify returns when performance is good. It's often cheaper than equity financing and provides predictable payment schedules. However, it increases financial risk and requires regular payments.
              </p>
            </div>
            
            <div>
              <h4 className="font-semibold text-lg mb-3">What are the risks of high leverage?</h4>
              <p className="text-muted-foreground">
                High leverage increases financial risk, makes companies more vulnerable to economic downturns, and can lead to financial distress if cash flows decline. It reduces financial flexibility and may limit growth opportunities. Companies with high leverage must carefully manage cash flow and debt service requirements.
              </p>
            </div>
            
            <div>
              <h4 className="font-semibold text-lg mb-3">How do I optimize leverage ratios?</h4>
              <p className="text-muted-foreground">
                Optimize leverage ratios by balancing the benefits of debt (tax advantages, lower cost) with the risks (financial distress, reduced flexibility). Consider industry standards, business cycle, growth opportunities, and cash flow stability. Regular monitoring and adjustment help maintain optimal capital structure.
              </p>
            </div>
            
            <div>
              <h4 className="font-semibold text-lg mb-3">Why are leverage ratios important for investors?</h4>
              <p className="text-muted-foreground">
                Leverage ratios help investors assess financial risk, evaluate creditworthiness, and understand the company's capital structure. They indicate how well a company can weather economic downturns and whether it's taking appropriate risks. Investors use these ratios to make informed investment decisions and assess potential returns.
              </p>
            </div>
          </div>
        </CardContent>
      </Card>
    </div>
  );
}
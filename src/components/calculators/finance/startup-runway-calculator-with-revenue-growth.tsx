'use client';

import { useState } from 'react';
import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import { z } from 'zod';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Form, FormControl, FormField, FormItem, FormLabel, FormMessage } from '@/components/ui/form';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Zap, TrendingUp, AlertCircle, Target, Info, Landmark, Calculator, DollarSign, BarChart3, Shield, TrendingDown, FunctionSquare, CheckCircle2, Users, Briefcase, AlertTriangle, Clock, Calendar } from 'lucide-react';
import { Badge } from '@/components/ui/badge';
import { Alert, AlertDescription } from '@/components/ui/alert';
import { Accordion, AccordionContent, AccordionItem, AccordionTrigger } from '@/components/ui/accordion';
import Link from 'next/link';

const formSchema = z.object({
  currentCash: z.number().positive(),
  monthlyBurnRate: z.number().positive(),
  monthlyRevenue: z.number().min(0),
  monthlyRevenueGrowthRate: z.number().min(0).max(100),
});

type FormValues = z.infer<typeof formSchema>;

export default function StartupRunwayCalculatorWithRevenueGrowth() {
  const [result, setResult] = useState<{
    runwayMonths: number;
    runwayDays: number;
    interpretation: string;
    runwayLevel: string;
    recommendation: string;
    strength: string;
    insights: string[];
    considerations: string[];
    monthlyProjections: Array<{
      month: number;
      cashBalance: number;
      revenue: number;
      burnRate: number;
      netBurn: number;
    }>;
  } | null>(null);

  const form = useForm<FormValues>({
    resolver: zodResolver(formSchema),
    defaultValues: {
      currentCash: undefined,
      monthlyBurnRate: undefined,
      monthlyRevenue: undefined,
      monthlyRevenueGrowthRate: undefined,
    },
  });

  const calculateRunway = (v: FormValues) => {
    let cashBalance = v.currentCash;
    let monthlyRevenue = v.monthlyRevenue;
    const monthlyBurnRate = v.monthlyBurnRate;
    const growthRate = v.monthlyRevenueGrowthRate / 100;
    
    const projections: Array<{
      month: number;
      cashBalance: number;
      revenue: number;
      burnRate: number;
      netBurn: number;
    }> = [];
    
    let month = 0;
    while (cashBalance > 0 && month < 120) { // Cap at 10 years
      const netBurn = monthlyBurnRate - monthlyRevenue;
      cashBalance = cashBalance - netBurn;
      monthlyRevenue = monthlyRevenue * (1 + growthRate);
      
      projections.push({
        month: month + 1,
        cashBalance: Math.max(0, cashBalance),
        revenue: monthlyRevenue,
        burnRate: monthlyBurnRate,
        netBurn: netBurn,
      });
      
      if (cashBalance <= 0) break;
      month++;
    }
    
    return { runwayMonths: month, projections };
  };

  const interpret = (runwayMonths: number) => {
    if (runwayMonths >= 18) return 'Excellent runway with strong financial buffer for growth and fundraising.';
    if (runwayMonths >= 12) return 'Good runway providing adequate time for fundraising and strategic planning.';
    if (runwayMonths >= 6) return 'Moderate runway - start fundraising immediately and optimize burn rate.';
    if (runwayMonths >= 3) return 'Critical runway - urgent need to raise capital or reduce expenses.';
    return 'Extremely critical runway - immediate action required to avoid cash crisis.';
  };

  const getRunwayLevel = (runwayMonths: number) => {
    if (runwayMonths >= 18) return 'Excellent';
    if (runwayMonths >= 12) return 'Good';
    if (runwayMonths >= 6) return 'Moderate';
    if (runwayMonths >= 3) return 'Critical';
    return 'Very Critical';
  };

  const getRecommendation = (runwayMonths: number) => {
    if (runwayMonths >= 18) return 'Maintain current trajectory and plan for next funding round. Consider strategic investments.';
    if (runwayMonths >= 12) return 'Begin fundraising process and optimize operational efficiency. Monitor cash flow closely.';
    if (runwayMonths >= 6) return 'Accelerate fundraising efforts immediately. Implement cost-cutting measures.';
    if (runwayMonths >= 3) return 'Emergency fundraising required. Aggressive cost reduction and revenue acceleration needed.';
    return 'Immediate crisis management required. Consider bridge financing and drastic cost cuts.';
  };

  const getStrength = (runwayMonths: number) => {
    if (runwayMonths >= 18) return 'Very Strong';
    if (runwayMonths >= 12) return 'Strong';
    if (runwayMonths >= 6) return 'Moderate';
    if (runwayMonths >= 3) return 'Weak';
    return 'Very Weak';
  };

  const getInsights = (runwayMonths: number, projections: typeof result.monthlyProjections) => {
    const insights = [];
    const lastProjection = projections[projections.length - 1];
    
    if (runwayMonths >= 12) {
      insights.push('Sufficient time to execute fundraising strategy');
      insights.push('Opportunity to focus on growth and product development');
      insights.push('Strong position for negotiating favorable terms');
    } else if (runwayMonths >= 6) {
      insights.push('Fundraising timeline is tight but manageable');
      insights.push('Focus on extending runway through revenue growth');
      insights.push('Consider bridge financing options');
    } else {
      insights.push('Immediate fundraising or cost reduction required');
      insights.push('Revenue growth may not be fast enough to save runway');
      insights.push('Consider emergency financing options');
    }
    
    if (lastProjection && lastProjection.revenue > lastProjection.burnRate) {
      insights.push('Revenue growth trajectory shows path to profitability');
    } else if (lastProjection) {
      insights.push('Revenue growth rate may need acceleration to reach profitability');
    }
    
    return insights;
  };

  const getConsiderations = () => {
    return [
      'Revenue growth assumptions may not materialize as expected',
      'Burn rate can increase with scaling and hiring',
      'Fundraising timelines typically take 3-6 months',
      'Market conditions can affect fundraising success',
      'Consider seasonal variations in revenue',
    ];
  };

  const onSubmit = (values: FormValues) => {
    const { runwayMonths, projections } = calculateRunway(values);
    const runwayDays = Math.floor(runwayMonths * 30);
    
    setResult({
      runwayMonths,
      runwayDays,
      interpretation: interpret(runwayMonths),
      runwayLevel: getRunwayLevel(runwayMonths),
      recommendation: getRecommendation(runwayMonths),
      strength: getStrength(runwayMonths),
      insights: getInsights(runwayMonths, projections),
      considerations: getConsiderations(),
      monthlyProjections: projections.slice(0, Math.min(12, projections.length)),
    });
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
            Enter your startup's financial metrics to calculate runway with revenue growth projections
          </CardDescription>
        </CardHeader>
        <CardContent>
          <Form {...form}>
            <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-6">
              <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                <FormField
                  control={form.control}
                  name="currentCash"
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel className="flex items-center gap-2">
                        <DollarSign className="h-4 w-4" />
                        Current Cash Balance ($)
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
                  name="monthlyBurnRate"
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel className="flex items-center gap-2">
                        <TrendingDown className="h-4 w-4" />
                        Monthly Burn Rate ($)
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
                <FormField
                  control={form.control}
                  name="monthlyRevenue"
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel className="flex items-center gap-2">
                        <TrendingUp className="h-4 w-4" />
                        Current Monthly Revenue ($)
                      </FormLabel>
                      <FormControl>
                        <Input
                          type="number"
                          step="0.01"
                          placeholder="e.g., 20000"
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
                  name="monthlyRevenueGrowthRate"
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel className="flex items-center gap-2">
                        <BarChart3 className="h-4 w-4" />
                        Monthly Revenue Growth Rate (%)
                      </FormLabel>
                      <FormControl>
                        <Input
                          type="number"
                          step="0.01"
                          placeholder="e.g., 10"
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
                Calculate Runway
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
                <Clock className="h-8 w-8 text-primary" />
                <div>
                  <CardTitle>Startup Runway</CardTitle>
                  <CardDescription>Cash Runway with Revenue Growth Projections</CardDescription>
                </div>
              </div>
            </CardHeader>
            <CardContent className="space-y-6">
              <div className="text-center">
                <p className="text-4xl font-bold text-primary">{result.runwayMonths.toFixed(1)} months</p>
                <p className="text-lg text-muted-foreground mt-2">({result.runwayDays} days)</p>
                <p className="text-lg text-muted-foreground mt-2">{result.interpretation}</p>
              </div>

              <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                <div className="text-center p-4 bg-muted/50 rounded-lg">
                  <Shield className="h-6 w-6 mx-auto mb-2 text-blue-600" />
                  <p className="font-semibold">Runway Level</p>
                  <Badge variant={result.runwayLevel === 'Excellent' ? 'default' : result.runwayLevel === 'Good' ? 'secondary' : result.runwayLevel === 'Moderate' ? 'outline' : 'destructive'}>
                    {result.runwayLevel}
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
                  <Calendar className="h-6 w-6 mx-auto mb-2 text-purple-600" />
                  <p className="font-semibold">Time to Act</p>
                  <p className="text-lg font-bold">{result.runwayMonths >= 12 ? 'Comfortable' : result.runwayMonths >= 6 ? 'Moderate' : 'Urgent'}</p>
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

          {/* Monthly Projections */}
          {result.monthlyProjections.length > 0 && (
            <Card>
              <CardHeader>
                <CardTitle className="flex items-center gap-2">
                  <BarChart3 className="h-5 w-5" />
                  Monthly Cash Flow Projections
                </CardTitle>
                <CardDescription>Projected cash balance, revenue, and net burn over time</CardDescription>
              </CardHeader>
              <CardContent>
                <div className="overflow-x-auto">
                  <table className="w-full text-sm">
                    <thead>
                      <tr className="border-b">
                        <th className="text-left p-2">Month</th>
                        <th className="text-right p-2">Cash Balance</th>
                        <th className="text-right p-2">Revenue</th>
                        <th className="text-right p-2">Burn Rate</th>
                        <th className="text-right p-2">Net Burn</th>
                      </tr>
                    </thead>
                    <tbody>
                      {result.monthlyProjections.map((proj) => (
                        <tr key={proj.month} className="border-b">
                          <td className="p-2 font-medium">{proj.month}</td>
                          <td className="text-right p-2">${proj.cashBalance.toLocaleString('en-US', { minimumFractionDigits: 2, maximumFractionDigits: 2 })}</td>
                          <td className="text-right p-2 text-green-600">${proj.revenue.toLocaleString('en-US', { minimumFractionDigits: 2, maximumFractionDigits: 2 })}</td>
                          <td className="text-right p-2 text-red-600">${proj.burnRate.toLocaleString('en-US', { minimumFractionDigits: 2, maximumFractionDigits: 2 })}</td>
                          <td className="text-right p-2">{proj.netBurn >= 0 ? (
                            <span className="text-red-600">${proj.netBurn.toLocaleString('en-US', { minimumFractionDigits: 2, maximumFractionDigits: 2 })}</span>
                          ) : (
                            <span className="text-green-600">${Math.abs(proj.netBurn).toLocaleString('en-US', { minimumFractionDigits: 2, maximumFractionDigits: 2 })}</span>
                          )}</td>
                        </tr>
                      ))}
                    </tbody>
                  </table>
                </div>
              </CardContent>
            </Card>
          )}

          {/* Smart Actions & Recommendations */}
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6 mb-6">
            <Card className="h-full">
              <CardHeader>
                <CardTitle className="flex items-center gap-2 text-xl text-primary">
                  <Target className="h-6 w-6" />
                  Strategic Insights
                </CardTitle>
                <CardDescription>Key considerations for runway management</CardDescription>
              </CardHeader>
              <CardContent className="space-y-4">
                {result.insights.map((insight, index) => (
                  <div key={index} className="flex items-start gap-3 p-3 bg-primary/5 rounded-lg border border-primary/10">
                    <CheckCircle2 className="h-5 w-5 text-primary mt-0.5 shrink-0" />
                    <span className="text-sm font-medium">{insight}</span>
                  </div>
                ))}
              </CardContent>
            </Card>

            <Card className="h-full border-red-100 bg-red-50/10 dark:border-red-900/20 dark:bg-red-900/5">
              <CardHeader>
                <CardTitle className="flex items-center gap-2 text-xl text-red-600 dark:text-red-400">
                  <AlertCircle className="h-6 w-6" />
                  Risk Assessment
                </CardTitle>
                <CardDescription>Critical factors to monitor</CardDescription>
              </CardHeader>
              <CardContent className="space-y-4">
                {result.considerations.map((consideration, index) => (
                  <div key={index} className="flex items-start gap-3 p-3 bg-red-50 dark:bg-red-900/10 rounded-lg border border-red-100 dark:border-red-900/20">
                    <AlertCircle className="h-5 w-5 text-red-600 dark:text-red-400 mt-0.5 shrink-0" />
                    <span className="text-sm font-medium text-red-800 dark:text-red-300">{consideration}</span>
                  </div>
                ))}
              </CardContent>
            </Card>
          </div>
        </div>
      )}

      {/* Understanding the Inputs */}
      <Card className="mb-6">
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <Info className="h-5 w-5" />
            Understanding the Inputs
          </CardTitle>
          <CardDescription>
            Key components required for runway calculation with revenue growth
          </CardDescription>
        </CardHeader>
        <CardContent>
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div className="p-4 bg-blue-50 dark:bg-blue-900/10 rounded-lg border border-blue-100 dark:border-blue-900/20">
              <h4 className="font-semibold mb-2 flex items-center gap-2 text-blue-700 dark:text-blue-300">
                <DollarSign className="h-4 w-4" />
                Current Cash Balance
              </h4>
              <p className="text-sm text-muted-foreground mb-3">
                Total cash and cash equivalents available to the company right now.
              </p>
              <ul className="space-y-2">
                <li className="flex items-start gap-2 text-sm text-muted-foreground">
                  <CheckCircle2 className="h-4 w-4 text-blue-500 mt-0.5 shrink-0" />
                  <span>Bank account balances</span>
                </li>
                <li className="flex items-start gap-2 text-sm text-muted-foreground">
                  <CheckCircle2 className="h-4 w-4 text-blue-500 mt-0.5 shrink-0" />
                  <span>Short-term investments</span>
                </li>
                <li className="flex items-start gap-2 text-sm text-muted-foreground">
                  <CheckCircle2 className="h-4 w-4 text-blue-500 mt-0.5 shrink-0" />
                  <span>Available credit lines</span>
                </li>
              </ul>
            </div>

            <div className="p-4 bg-amber-50 dark:bg-amber-900/10 rounded-lg border border-amber-100 dark:border-amber-900/20">
              <h4 className="font-semibold mb-2 flex items-center gap-2 text-amber-700 dark:text-amber-300">
                <TrendingDown className="h-4 w-4" />
                Monthly Burn Rate
              </h4>
              <p className="text-sm text-muted-foreground mb-3">
                Total monthly operating expenses including salaries, rent, and other costs.
              </p>
              <ul className="space-y-2">
                <li className="flex items-start gap-2 text-sm text-muted-foreground">
                  <CheckCircle2 className="h-4 w-4 text-amber-500 mt-0.5 shrink-0" />
                  <span>Salaries and benefits</span>
                </li>
                <li className="flex items-start gap-2 text-sm text-muted-foreground">
                  <CheckCircle2 className="h-4 w-4 text-amber-500 mt-0.5 shrink-0" />
                  <span>Office rent and utilities</span>
                </li>
                <li className="flex items-start gap-2 text-sm text-muted-foreground">
                  <CheckCircle2 className="h-4 w-4 text-amber-500 mt-0.5 shrink-0" />
                  <span>Marketing and software costs</span>
                </li>
              </ul>
            </div>

            <div className="p-4 bg-green-50 dark:bg-green-900/10 rounded-lg border border-green-100 dark:border-green-900/20">
              <h4 className="font-semibold mb-2 flex items-center gap-2 text-green-700 dark:text-green-300">
                <TrendingUp className="h-4 w-4" />
                Monthly Revenue
              </h4>
              <p className="text-sm text-muted-foreground mb-3">
                Current monthly recurring revenue or total monthly revenue.
              </p>
              <ul className="space-y-2">
                <li className="flex items-start gap-2 text-sm text-muted-foreground">
                  <CheckCircle2 className="h-4 w-4 text-green-500 mt-0.5 shrink-0" />
                  <span>MRR for SaaS companies</span>
                </li>
                <li className="flex items-start gap-2 text-sm text-muted-foreground">
                  <CheckCircle2 className="h-4 w-4 text-green-500 mt-0.5 shrink-0" />
                  <span>Total monthly sales</span>
                </li>
                <li className="flex items-start gap-2 text-sm text-muted-foreground">
                  <CheckCircle2 className="h-4 w-4 text-green-500 mt-0.5 shrink-0" />
                  <span>Subscription revenue</span>
                </li>
              </ul>
            </div>

            <div className="p-4 bg-purple-50 dark:bg-purple-900/10 rounded-lg border border-purple-100 dark:border-purple-900/20">
              <h4 className="font-semibold mb-2 flex items-center gap-2 text-purple-700 dark:text-purple-300">
                <BarChart3 className="h-4 w-4" />
                Monthly Revenue Growth Rate
              </h4>
              <p className="text-sm text-muted-foreground mb-3">
                Expected monthly percentage increase in revenue (e.g., 10% = 10).
              </p>
              <ul className="space-y-2">
                <li className="flex items-start gap-2 text-sm text-muted-foreground">
                  <CheckCircle2 className="h-4 w-4 text-purple-500 mt-0.5 shrink-0" />
                  <span>Based on historical trends</span>
                </li>
                <li className="flex items-start gap-2 text-sm text-muted-foreground">
                  <CheckCircle2 className="h-4 w-4 text-purple-500 mt-0.5 shrink-0" />
                  <span>Projected growth rate</span>
                </li>
                <li className="flex items-start gap-2 text-sm text-muted-foreground">
                  <CheckCircle2 className="h-4 w-4 text-purple-500 mt-0.5 shrink-0" />
                  <span>Conservative estimate recommended</span>
                </li>
              </ul>
            </div>
          </div>
        </CardContent>
      </Card>

      {/* Formula Used */}
      <Card className="mb-6">
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <FunctionSquare className="h-5 w-5" />
            Formula Used
          </CardTitle>
        </CardHeader>
        <CardContent className="space-y-4">
          <div className="p-4 bg-muted rounded-lg overflow-x-auto">
            <p className="font-mono text-sm text-center">
              Runway = Cash Balance / Net Monthly Burn
            </p>
            <p className="font-mono text-sm text-center mt-2">
              Net Monthly Burn = Monthly Burn Rate - Monthly Revenue
            </p>
            <p className="font-mono text-sm text-center mt-2">
              Revenue(t+1) = Revenue(t) × (1 + Growth Rate)
            </p>
          </div>
          <p className="text-sm text-muted-foreground mt-2">
            The calculator projects monthly cash flow by accounting for growing revenue, which extends runway as revenue increases over time. When revenue exceeds burn rate, the company reaches profitability.
          </p>
        </CardContent>
      </Card>

      {/* Related Calculators */}
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <Calculator className="h-5 w-5" />
            Related Financial Calculators
          </CardTitle>
          <CardDescription>
            Explore other startup and financial analysis tools
          </CardDescription>
        </CardHeader>
        <CardContent>
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
            <Link href="/category/finance/startup-runway-calculator" className="block">
              <Card className="hover:shadow-md transition-shadow cursor-pointer">
                <CardContent className="p-4">
                  <div className="flex items-center gap-3">
                    <Clock className="h-5 w-5 text-purple-600" />
                    <div>
                      <p className="font-medium">Startup Runway</p>
                      <p className="text-sm text-muted-foreground">Basic runway calculation</p>
                    </div>
                  </div>
                </CardContent>
              </Card>
            </Link>
            <Link href="/category/finance/burn-rate-calculator" className="block">
              <Card className="hover:shadow-md transition-shadow cursor-pointer">
                <CardContent className="p-4">
                  <div className="flex items-center gap-3">
                    <TrendingDown className="h-5 w-5 text-red-600" />
                    <div>
                      <p className="font-medium">Burn Rate Calculator</p>
                      <p className="text-sm text-muted-foreground">Monthly expense analysis</p>
                    </div>
                  </div>
                </CardContent>
              </Card>
            </Link>
            <Link href="/category/finance/saas-burn-rate-calculator-gross-vs-net" className="block">
              <Card className="hover:shadow-md transition-shadow cursor-pointer">
                <CardContent className="p-4">
                  <div className="flex items-center gap-3">
                    <BarChart3 className="h-5 w-5 text-blue-600" />
                    <div>
                      <p className="font-medium">SaaS Burn Rate</p>
                      <p className="text-sm text-muted-foreground">Gross vs Net analysis</p>
                    </div>
                  </div>
                </CardContent>
              </Card>
            </Link>
          </div>
        </CardContent>
      </Card>

      {/* Complete Guide Section */}
      <section className="space-y-6 text-muted-foreground leading-relaxed bg-card p-6 md:p-10 rounded-lg shadow-lg" itemScope itemType="https://schema.org/FinanceSummary">
        {/* SEO & SCHEMA METADATA */}
        <meta itemProp="name" content="The Definitive Guide to Startup Runway with Revenue Growth: Calculation, Projections, and Strategic Planning" />
        <meta itemProp="description" content="An expert guide to calculating startup runway accounting for revenue growth, understanding cash flow projections, and strategic planning for fundraising and profitability." />
        <meta itemProp="keywords" content="startup runway calculator, revenue growth runway, cash runway calculation, startup financial planning, burn rate analysis, fundraising timeline" />
        <meta itemProp="author" content="[Your Site's Financial Analyst Team]" />
        <meta itemProp="datePublished" content="2025-01-30" />
        <meta itemProp="url" content="/definitive-startup-runway-revenue-growth-guide" />

        <h1 className="text-3xl md:text-4xl font-extrabold text-foreground mb-4" itemProp="headline">The Definitive Guide to Startup Runway with Revenue Growth: Strategic Cash Management</h1>
        <p className="text-lg italic text-muted-foreground">Master the art of calculating runway while accounting for revenue growth, enabling strategic planning for fundraising and path to profitability.</p>

        {/* TABLE OF CONTENTS */}
        <h2 className="text-2xl font-bold text-foreground mt-8 mb-4">Table of Contents: Jump to a Section</h2>
        <ul className="list-disc ml-6 space-y-2 text-primary">
          <li><a href="#definition" className="hover:underline">Startup Runway: Definition and Core Purpose</a></li>
          <li><a href="#calculation" className="hover:underline">Runway Calculation with Revenue Growth</a></li>
          <li><a href="#interpretation" className="hover:underline">Interpreting Runway and Ideal Thresholds</a></li>
          <li><a href="#revenue-growth" className="hover:underline">Impact of Revenue Growth on Runway</a></li>
          <li><a href="#applications" className="hover:underline">Strategic Planning and Fundraising</a></li>
        </ul>
        <hr />

        {/* DEFINITION */}
        <h2 id="definition" className="text-2xl font-bold text-foreground pt-8" itemProp="articleSection">Startup Runway: Definition and Core Purpose</h2>
        <p>The **Startup Runway** is the number of months a company can continue operating before running out of cash, assuming current burn rate and revenue trends. When accounting for revenue growth, runway extends as revenue increases, potentially reaching profitability before cash runs out.</p>

        <h3 className="text-xl font-semibold text-foreground mt-6">A Measure of Financial Sustainability</h3>
        <p>Runway provides a crucial timeline for strategic decisions, including when to start fundraising, when to optimize costs, and when revenue growth will lead to profitability. It's a vital metric for founders, investors, and board members.</p>

        <hr />

        {/* CALCULATION */}
        <h2 id="calculation" className="text-2xl font-bold text-foreground pt-8" itemProp="articleSection">Runway Calculation with Revenue Growth</h2>
        <p>Traditional runway calculation divides cash balance by monthly burn rate. However, accounting for revenue growth provides a more accurate projection by reducing net burn over time.</p>

        <h3 className="text-xl font-semibold text-foreground mt-6">The Calculation Process</h3>
        <p>The formula accounts for growing revenue:</p>
        <div className="overflow-x-auto my-6 p-4 bg-muted border rounded-lg text-center">
          <p className="font-mono text-xl text-destructive font-bold">
            {'Net Monthly Burn = Monthly Burn Rate - Monthly Revenue'}
          </p>
          <p className="font-mono text-lg mt-2">
            {'Revenue(t+1) = Revenue(t) × (1 + Monthly Growth Rate)'}
          </p>
          <p className="font-mono text-lg mt-2">
            {'Runway = Months until Cash Balance ≤ 0'}
          </p>
        </div>

        <h3 className="text-xl font-semibold text-foreground mt-6">Key Components</h3>
        <ul className="list-disc ml-6 space-y-2">
          <li><strong>Current Cash Balance:</strong> Total available cash and cash equivalents</li>
          <li><strong>Monthly Burn Rate:</strong> Total monthly operating expenses</li>
          <li><strong>Monthly Revenue:</strong> Current monthly recurring or total revenue</li>
          <li><strong>Monthly Growth Rate:</strong> Expected percentage increase in revenue each month</li>
        </ul>

        <hr />

        {/* INTERPRETATION */}
        <h2 id="interpretation" className="text-2xl font-bold text-foreground pt-8" itemProp="articleSection">Interpreting Runway and Ideal Thresholds</h2>
        <p>Runway interpretation depends on the company's stage, growth trajectory, and fundraising plans.</p>

        <h3 className="text-xl font-semibold text-foreground mt-6">General Guidelines</h3>
        <ul className="list-disc ml-6 space-y-2">
          <li><strong>18+ months:</strong> Excellent runway with strong buffer for growth and strategic planning</li>
          <li><strong>12-18 months:</strong> Good runway providing adequate time for fundraising</li>
          <li><strong>6-12 months:</strong> Moderate runway - start fundraising immediately</li>
          <li><strong>3-6 months:</strong> Critical runway - urgent fundraising or cost reduction needed</li>
          <li><strong>&lt;3 months:</strong> Extremely critical - immediate action required</li>
        </ul>

        <h3 className="text-xl font-semibold text-foreground mt-6">The 12-Month Rule</h3>
        <p>Most investors recommend maintaining at least **12 months of runway** at all times. This provides sufficient time to execute fundraising (typically 3-6 months) while maintaining operational flexibility.</p>

        <hr />

        {/* REVENUE GROWTH IMPACT */}
        <h2 id="revenue-growth" className="text-2xl font-bold text-foreground pt-8" itemProp="articleSection">Impact of Revenue Growth on Runway</h2>
        <p>Revenue growth significantly extends runway by reducing net burn over time. As revenue approaches and exceeds burn rate, the company moves toward profitability.</p>

        <h3 className="text-xl font-semibold text-foreground mt-6">Path to Profitability</h3>
        <p>When monthly revenue growth is strong, net burn decreases each month. Eventually, revenue may exceed burn rate, creating positive cash flow and effectively infinite runway (assuming sustainable operations).</p>

        <h3 className="text-xl font-semibold text-foreground mt-6">Growth Rate Considerations</h3>
        <p>Conservative growth rate estimates are recommended. Overestimating growth can lead to dangerous runway miscalculations. Consider:</p>
        <ul className="list-disc ml-6 space-y-2">
          <li>Historical growth trends</li>
          <li>Market conditions and competition</li>
          <li>Sales cycle length</li>
          <li>Customer acquisition costs</li>
        </ul>

        <hr />

        {/* APPLICATIONS */}
        <h2 id="applications" className="text-2xl font-bold text-foreground pt-8" itemProp="articleSection">Strategic Planning and Fundraising</h2>
        <p>Runway calculation with revenue growth enables strategic decision-making for fundraising, cost optimization, and growth planning.</p>

        <h3 className="text-xl font-semibold text-foreground mt-6">Fundraising Timeline</h3>
        <p>Start fundraising when runway reaches 12-18 months. This provides adequate time to complete the fundraising process (typically 3-6 months) while maintaining operational buffer.</p>

        <h3 className="text-xl font-semibold text-foreground mt-6">Cost Optimization</h3>
        <p>If runway is below 12 months, prioritize cost reduction and revenue acceleration. Focus on high-impact initiatives that extend runway quickly.</p>

        <hr />

        {/* CONCLUSION */}
        <h2 className="text-2xl font-bold text-foreground pt-8" itemProp="articleSection">Conclusion</h2>
        <p>Startup runway with revenue growth provides a dynamic view of financial sustainability, accounting for the positive impact of growing revenue on cash flow. It enables strategic planning for fundraising, cost management, and path to profitability.</p>
        <p>Maintain at least **12 months of runway** at all times, start fundraising early, and use conservative revenue growth estimates to ensure accurate projections.</p>
      </section>

      {/* FAQ Section */}
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <Info className="h-5 w-5" />
            Frequently Asked Questions
          </CardTitle>
          <CardDescription>
            Common questions about Startup Runway with Revenue Growth
          </CardDescription>
        </CardHeader>
        <CardContent>
          <div className="space-y-6">
            <div>
              <h4 className="font-semibold text-lg mb-3">What is startup runway?</h4>
              <p className="text-muted-foreground">
                Startup runway is the number of months a company can operate before running out of cash, based on current burn rate and revenue. When accounting for revenue growth, runway extends as revenue increases over time.
              </p>
            </div>

            <div>
              <h4 className="font-semibold text-lg mb-3">How does revenue growth affect runway?</h4>
              <p className="text-muted-foreground">
                Revenue growth reduces net burn over time (burn rate minus revenue). As revenue increases, net burn decreases, extending runway. If revenue exceeds burn rate, the company reaches profitability with effectively infinite runway.
              </p>
            </div>

            <div>
              <h4 className="font-semibold text-lg mb-3">What is a good runway for a startup?</h4>
              <p className="text-muted-foreground">
                Most investors recommend maintaining at least 12 months of runway. This provides sufficient time for fundraising (typically 3-6 months) while maintaining operational flexibility. Early-stage startups may operate with 6-12 months, but should start fundraising when runway reaches 12 months.
              </p>
            </div>

            <div>
              <h4 className="font-semibold text-lg mb-3">When should I start fundraising?</h4>
              <p className="text-muted-foreground">
                Start fundraising when runway reaches 12-18 months. Fundraising typically takes 3-6 months, so starting early ensures you have adequate cash throughout the process. Don't wait until runway is critical.
              </p>
            </div>

            <div>
              <h4 className="font-semibold text-lg mb-3">How accurate are revenue growth projections?</h4>
              <p className="text-muted-foreground">
                Revenue growth projections are estimates based on historical trends and market conditions. Use conservative estimates to avoid dangerous runway miscalculations. Actual growth may vary due to market conditions, competition, and execution challenges.
              </p>
            </div>

            <div>
              <h4 className="font-semibold text-lg mb-3">What if my burn rate increases?</h4>
              <p className="text-muted-foreground">
                Burn rate can increase with scaling, hiring, and expansion. Regularly update runway calculations to account for changing expenses. If burn rate increases faster than revenue growth, runway will decrease.
              </p>
            </div>

            <div>
              <h4 className="font-semibold text-lg mb-3">Can runway be extended without fundraising?</h4>
              <p className="text-muted-foreground">
                Yes, runway can be extended by reducing burn rate (cost optimization), increasing revenue growth, or both. However, aggressive cost cutting may impact growth, so balance is important. Revenue growth is the most sustainable way to extend runway.
              </p>
            </div>

            <div>
              <h4 className="font-semibold text-lg mb-3">What happens when revenue exceeds burn rate?</h4>
              <p className="text-muted-foreground">
                When monthly revenue exceeds monthly burn rate, the company generates positive cash flow and reaches profitability. Runway becomes effectively infinite (assuming sustainable operations), though maintaining cash reserves is still important for growth investments.
              </p>
            </div>

            <div>
              <h4 className="font-semibold text-lg mb-3">How do I calculate net burn rate?</h4>
              <p className="text-muted-foreground">
                Net burn rate = Monthly Burn Rate - Monthly Revenue. This represents the actual cash consumption each month after accounting for revenue. As revenue grows, net burn decreases, extending runway.
              </p>
            </div>

            <div>
              <h4 className="font-semibold text-lg mb-3">Should I use MRR or total revenue?</h4>
              <p className="text-muted-foreground">
                For SaaS companies, Monthly Recurring Revenue (MRR) is most appropriate as it represents predictable, recurring revenue. For other business models, use total monthly revenue. The key is consistency in how you measure revenue over time.
              </p>
            </div>
          </div>
        </CardContent>
      </Card>

      {/* Usage Section */}
      <Card className="mb-6">
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <Briefcase className="h-5 w-5" />
            Usage of this Calculator
          </CardTitle>
          <CardDescription>
            Practical applications and real-world context
          </CardDescription>
        </CardHeader>
        <CardContent className="space-y-6">
          <div>
            <h4 className="flex items-center gap-2 font-semibold text-lg mb-3">
              <Users className="h-5 w-5 text-blue-600" />
              Who Should Use This Calculator?
            </h4>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div className="p-3 bg-muted/50 rounded-lg border border-border/50">
                <strong className="block text-primary mb-1">Startup Founders</strong>
                <span className="text-sm text-muted-foreground">To plan fundraising timelines and understand when revenue growth will lead to profitability.</span>
              </div>
              <div className="p-3 bg-muted/50 rounded-lg border border-border/50">
                <strong className="block text-primary mb-1">CFOs & Finance Teams</strong>
                <span className="text-sm text-muted-foreground">To provide accurate cash flow projections and strategic financial planning.</span>
              </div>
              <div className="p-3 bg-muted/50 rounded-lg border border-border/50">
                <strong className="block text-primary mb-1">Investors</strong>
                <span className="text-sm text-muted-foreground">To assess portfolio company financial health and fundraising needs.</span>
              </div>
              <div className="p-3 bg-muted/50 rounded-lg border border-border/50">
                <strong className="block text-primary mb-1">Board Members</strong>
                <span className="text-sm text-muted-foreground">To monitor financial sustainability and make informed strategic decisions.</span>
              </div>
            </div>
          </div>

          <hr className="border-border/50" />

          <div>
            <h4 className="flex items-center gap-2 font-semibold text-lg mb-3">
              <AlertTriangle className="h-5 w-5 text-amber-600" />
              Limitations & Accuracy Considerations
            </h4>
            <ul className="space-y-2 text-sm text-muted-foreground">
              <li className="flex gap-2">
                <CheckCircle2 className="h-4 w-4 text-amber-500 shrink-0 mt-0.5" />
                <span><strong>Revenue Growth Assumptions:</strong> Projections are estimates and actual growth may vary significantly due to market conditions, competition, and execution challenges.</span>
              </li>
              <li className="flex gap-2">
                <CheckCircle2 className="h-4 w-4 text-amber-500 shrink-0 mt-0.5" />
                <span><strong>Burn Rate Variability:</strong> Expenses can increase with scaling, hiring, and expansion. Regularly update calculations to reflect changing costs.</span>
              </li>
              <li className="flex gap-2">
                <CheckCircle2 className="h-4 w-4 text-amber-500 shrink-0 mt-0.5" />
                <span><strong>Seasonal Variations:</strong> Revenue and expenses may fluctuate seasonally. Use average or conservative estimates for more accurate projections.</span>
              </li>
            </ul>
          </div>

          <hr className="border-border/50" />

          <div>
            <h4 className="flex items-center gap-2 font-semibold text-lg mb-3">
              <Landmark className="h-5 w-5 text-green-600" />
              Real-World Examples
            </h4>
            <div className="space-y-3">
              <div className="p-4 rounded-lg bg-green-50 dark:bg-green-900/10 border border-green-100 dark:border-green-900/20">
                <h5 className="font-semibold text-green-800 dark:text-green-300 mb-1">Case A: High-Growth SaaS Startup</h5>
                <p className="text-sm text-green-700/80 dark:text-green-400">
                  A SaaS company with $500K cash, $50K monthly burn, $20K MRR, and 15% monthly growth. Revenue growth extends runway from 10 months (without growth) to 18+ months as revenue approaches burn rate, creating path to profitability.
                </p>
              </div>
              <div className="p-4 rounded-lg bg-blue-50 dark:bg-blue-900/10 border border-blue-100 dark:border-blue-900/20">
                <h5 className="font-semibold text-blue-800 dark:text-blue-300 mb-1">Case B: Pre-Revenue Startup</h5>
                <p className="text-sm text-blue-700/80 dark:text-blue-400">
                  A pre-revenue startup with $300K cash and $40K monthly burn has 7.5 months runway. Without revenue, runway is fixed. Once revenue starts, even modest growth (5-10% monthly) can significantly extend runway.
                </p>
              </div>
            </div>
          </div>
        </CardContent>
      </Card>

      <Card className="mb-6">
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <Shield className="h-5 w-5" />
            Summary
          </CardTitle>
        </CardHeader>
        <CardContent className="space-y-2 text-sm text-muted-foreground">
          <p>The Startup Runway Calculator with Revenue Growth projects cash runway by accounting for growing revenue, which extends runway as revenue increases over time.</p>
          <p>It helps startups plan fundraising timelines and understand when revenue growth will lead to profitability.</p>
          <p>Maintain at least 12 months of runway and start fundraising early to ensure adequate cash throughout the fundraising process.</p>
        </CardContent>
      </Card>
    </div>
  );
}

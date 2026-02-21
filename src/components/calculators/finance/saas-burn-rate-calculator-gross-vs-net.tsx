'use client';

import { useState } from 'react';
import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import { z } from 'zod';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Form, FormControl, FormField, FormItem, FormLabel, FormMessage } from '@/components/ui/form';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Zap, TrendingUp, AlertCircle, Target, Info, Landmark, Calculator, DollarSign, BarChart3, Shield, TrendingDown, FunctionSquare, CheckCircle2, Users, Briefcase, AlertTriangle, ArrowUpDown, Percent } from 'lucide-react';
import { Badge } from '@/components/ui/badge';
import { Alert, AlertDescription } from '@/components/ui/alert';
import { Accordion, AccordionContent, AccordionItem, AccordionTrigger } from '@/components/ui/accordion';
import Link from 'next/link';

const formSchema = z.object({
  monthlyExpenses: z.number().positive(),
  monthlyRevenue: z.number().min(0),
  cogs: z.number().min(0).optional(),
});

type FormValues = z.infer<typeof formSchema>;

export default function SaaSBurnRateCalculatorGrossVsNet() {
  const [result, setResult] = useState<{
    grossBurnRate: number;
    netBurnRate: number;
    grossMargin: number;
    netMargin: number;
    interpretation: string;
    burnRateLevel: string;
    recommendation: string;
    strength: string;
    insights: string[];
    considerations: string[];
    comparison: {
      label: string;
      grossValue: number;
      netValue: number;
      difference: number;
    }[];
  } | null>(null);

  const form = useForm<FormValues>({
    resolver: zodResolver(formSchema),
    defaultValues: {
      monthlyExpenses: undefined,
      monthlyRevenue: undefined,
      cogs: undefined,
    },
  });

  const calculate = (v: FormValues) => {
    const grossBurnRate = v.monthlyExpenses;
    const netBurnRate = v.monthlyExpenses - v.monthlyRevenue;
    const grossMargin = v.monthlyRevenue > 0 ? ((v.monthlyRevenue - (v.cogs || 0)) / v.monthlyRevenue) * 100 : 0;
    const netMargin = v.monthlyRevenue > 0 ? ((v.monthlyRevenue - v.monthlyExpenses) / v.monthlyRevenue) * 100 : 0;
    
    return {
      grossBurnRate,
      netBurnRate,
      grossMargin,
      netMargin,
    };
  };

  const interpret = (netBurnRate: number, grossBurnRate: number, monthlyRevenue: number) => {
    if (netBurnRate <= 0) {
      return 'Company is cash flow positive - generating more revenue than expenses. Excellent financial position.';
    }
    if (netBurnRate < grossBurnRate * 0.3) {
      return 'Strong revenue coverage - net burn is significantly lower than gross burn. Good path to profitability.';
    }
    if (netBurnRate < grossBurnRate * 0.5) {
      return 'Moderate revenue coverage - revenue is reducing net burn meaningfully. Monitor growth trajectory.';
    }
    if (netBurnRate < grossBurnRate * 0.7) {
      return 'Limited revenue coverage - revenue provides some offset but net burn remains high. Focus on growth.';
    }
    return 'Minimal revenue coverage - revenue has little impact on burn rate. Urgent need to accelerate revenue growth.';
  };

  const getBurnRateLevel = (netBurnRate: number, grossBurnRate: number) => {
    const coverageRatio = (grossBurnRate - netBurnRate) / grossBurnRate;
    if (netBurnRate <= 0) return 'Cash Flow Positive';
    if (coverageRatio >= 0.7) return 'Excellent';
    if (coverageRatio >= 0.5) return 'Good';
    if (coverageRatio >= 0.3) return 'Moderate';
    return 'Poor';
  };

  const getRecommendation = (netBurnRate: number, grossBurnRate: number, monthlyRevenue: number) => {
    if (netBurnRate <= 0) {
      return 'Maintain current trajectory and focus on scaling profitably. Consider strategic investments for growth.';
    }
    const coverageRatio = (grossBurnRate - netBurnRate) / grossBurnRate;
    if (coverageRatio >= 0.7) {
      return 'Strong revenue growth is reducing burn effectively. Continue focusing on growth while optimizing costs.';
    }
    if (coverageRatio >= 0.5) {
      return 'Accelerate revenue growth to improve net burn. Consider cost optimization where it doesn\'t impact growth.';
    }
    if (coverageRatio >= 0.3) {
      return 'Urgent need to accelerate revenue growth. Evaluate pricing, sales efficiency, and customer acquisition strategies.';
    }
    return 'Critical situation - revenue growth is insufficient. Immediate action required on both revenue acceleration and cost optimization.';
  };

  const getStrength = (netBurnRate: number, grossBurnRate: number) => {
    const coverageRatio = (grossBurnRate - netBurnRate) / grossBurnRate;
    if (netBurnRate <= 0) return 'Very Strong';
    if (coverageRatio >= 0.7) return 'Strong';
    if (coverageRatio >= 0.5) return 'Moderate';
    if (coverageRatio >= 0.3) return 'Weak';
    return 'Very Weak';
  };

  const getInsights = (netBurnRate: number, grossBurnRate: number, grossMargin: number, netMargin: number) => {
    const insights = [];
    const coverageRatio = (grossBurnRate - netBurnRate) / grossBurnRate;
    
    if (netBurnRate <= 0) {
      insights.push('Company is generating positive cash flow');
      insights.push('Revenue exceeds expenses - path to profitability achieved');
      insights.push('Strong position for sustainable growth');
    } else {
      insights.push(`Revenue covers ${(coverageRatio * 100).toFixed(1)}% of gross burn rate`);
      if (coverageRatio >= 0.5) {
        insights.push('Revenue growth is meaningfully reducing net burn');
        insights.push('Good trajectory toward profitability');
      } else {
        insights.push('Revenue growth needs acceleration to reduce net burn');
        insights.push('Focus on improving revenue-to-expense ratio');
      }
    }
    
    if (grossMargin > 70) {
      insights.push('Excellent gross margin indicates strong unit economics');
    } else if (grossMargin > 50) {
      insights.push('Good gross margin - monitor cost of goods sold');
    } else {
      insights.push('Gross margin may need improvement - review pricing and COGS');
    }
    
    if (netMargin > 0) {
      insights.push('Positive net margin - company is profitable');
    } else {
      insights.push(`Net margin of ${netMargin.toFixed(1)}% indicates need for improvement`);
    }
    
    return insights;
  };

  const getConsiderations = () => {
    return [
      'Gross burn rate shows total cash consumption regardless of revenue',
      'Net burn rate reflects actual cash consumption after revenue',
      'High gross margins indicate strong unit economics',
      'Revenue growth rate directly impacts net burn reduction',
      'Seasonal variations can affect both revenue and expenses',
    ];
  };

  const getComparison = (grossBurnRate: number, netBurnRate: number, monthlyRevenue: number) => {
    return [
      {
        label: 'Monthly Cash Consumption',
        grossValue: grossBurnRate,
        netValue: netBurnRate,
        difference: grossBurnRate - netBurnRate,
      },
      {
        label: 'Annual Cash Consumption',
        grossValue: grossBurnRate * 12,
        netValue: netBurnRate * 12,
        difference: (grossBurnRate - netBurnRate) * 12,
      },
      {
        label: 'Revenue Coverage',
        grossValue: 0,
        netValue: monthlyRevenue,
        difference: monthlyRevenue,
      },
    ];
  };

  const onSubmit = (values: FormValues) => {
    const calculations = calculate(values);
    const comparison = getComparison(calculations.grossBurnRate, calculations.netBurnRate, values.monthlyRevenue);
    
    setResult({
      ...calculations,
      interpretation: interpret(calculations.netBurnRate, calculations.grossBurnRate, values.monthlyRevenue),
      burnRateLevel: getBurnRateLevel(calculations.netBurnRate, calculations.grossBurnRate),
      recommendation: getRecommendation(calculations.netBurnRate, calculations.grossBurnRate, values.monthlyRevenue),
      strength: getStrength(calculations.netBurnRate, calculations.grossBurnRate),
      insights: getInsights(calculations.netBurnRate, calculations.grossBurnRate, calculations.grossMargin, calculations.netMargin),
      considerations: getConsiderations(),
      comparison,
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
            Enter your SaaS company's financial metrics to calculate gross vs net burn rate
          </CardDescription>
        </CardHeader>
        <CardContent>
          <Form {...form}>
            <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-6">
              <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                <FormField
                  control={form.control}
                  name="monthlyExpenses"
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel className="flex items-center gap-2">
                        <TrendingDown className="h-4 w-4" />
                        Total Monthly Expenses ($)
                      </FormLabel>
                      <FormControl>
                        <Input
                          type="number"
                          step="0.01"
                          placeholder="e.g., 100000"
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
                        Monthly Revenue / MRR ($)
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
                  name="cogs"
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel className="flex items-center gap-2">
                        <DollarSign className="h-4 w-4" />
                        Cost of Goods Sold (COGS) - Optional ($)
                      </FormLabel>
                      <FormControl>
                        <Input
                          type="number"
                          step="0.01"
                          placeholder="e.g., 10000"
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
                Calculate Burn Rates
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
                <ArrowUpDown className="h-8 w-8 text-primary" />
                <div>
                  <CardTitle>Burn Rate Analysis</CardTitle>
                  <CardDescription>Gross vs Net Burn Rate Comparison</CardDescription>
                </div>
              </div>
            </CardHeader>
            <CardContent className="space-y-6">
              {/* Burn Rate Comparison */}
              <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                <div className="p-6 bg-red-50 dark:bg-red-900/10 rounded-lg border border-red-100 dark:border-red-900/20">
                  <div className="flex items-center gap-2 mb-3">
                    <TrendingDown className="h-5 w-5 text-red-600" />
                    <h3 className="font-semibold text-red-800 dark:text-red-300">Gross Burn Rate</h3>
                  </div>
                  <p className="text-3xl font-bold text-red-600 mb-2">
                    ${result.grossBurnRate.toLocaleString('en-US', { minimumFractionDigits: 2, maximumFractionDigits: 2 })}
                  </p>
                  <p className="text-sm text-muted-foreground">Total monthly expenses</p>
                </div>
                <div className={`p-6 rounded-lg border ${result.netBurnRate <= 0 ? 'bg-green-50 dark:bg-green-900/10 border-green-100 dark:border-green-900/20' : 'bg-amber-50 dark:bg-amber-900/10 border-amber-100 dark:border-amber-900/20'}`}>
                  <div className="flex items-center gap-2 mb-3">
                    <ArrowUpDown className={`h-5 w-5 ${result.netBurnRate <= 0 ? 'text-green-600' : 'text-amber-600'}`} />
                    <h3 className={`font-semibold ${result.netBurnRate <= 0 ? 'text-green-800 dark:text-green-300' : 'text-amber-800 dark:text-amber-300'}`}>Net Burn Rate</h3>
                  </div>
                  <p className={`text-3xl font-bold mb-2 ${result.netBurnRate <= 0 ? 'text-green-600' : 'text-amber-600'}`}>
                    ${result.netBurnRate.toLocaleString('en-US', { minimumFractionDigits: 2, maximumFractionDigits: 2 })}
                  </p>
                  <p className="text-sm text-muted-foreground">Expenses minus revenue</p>
                </div>
              </div>

              {/* Key Metrics */}
              <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                <div className="text-center p-4 bg-muted/50 rounded-lg">
                  <Shield className="h-6 w-6 mx-auto mb-2 text-blue-600" />
                  <p className="font-semibold">Burn Rate Level</p>
                  <Badge variant={result.burnRateLevel === 'Cash Flow Positive' ? 'default' : result.burnRateLevel === 'Excellent' ? 'secondary' : result.burnRateLevel === 'Good' ? 'outline' : 'destructive'}>
                    {result.burnRateLevel}
                  </Badge>
                </div>
                <div className="text-center p-4 bg-muted/50 rounded-lg">
                  <Percent className="h-6 w-6 mx-auto mb-2 text-green-600" />
                  <p className="font-semibold">Gross Margin</p>
                  <p className="text-lg font-bold">{result.grossMargin.toFixed(1)}%</p>
                </div>
                <div className="text-center p-4 bg-muted/50 rounded-lg">
                  <BarChart3 className="h-6 w-6 mx-auto mb-2 text-purple-600" />
                  <p className="font-semibold">Net Margin</p>
                  <p className={`text-lg font-bold ${result.netMargin >= 0 ? 'text-green-600' : 'text-red-600'}`}>
                    {result.netMargin.toFixed(1)}%
                  </p>
                </div>
              </div>

              <Alert>
                <Info className="h-4 w-4" />
                <AlertDescription>
                  <strong>Analysis:</strong> {result.interpretation}
                </AlertDescription>
              </Alert>

              <Alert>
                <Target className="h-4 w-4" />
                <AlertDescription>
                  <strong>Recommendation:</strong> {result.recommendation}
                </AlertDescription>
              </Alert>
            </CardContent>
          </Card>

          {/* Comparison Table */}
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <BarChart3 className="h-5 w-5" />
                Gross vs Net Comparison
              </CardTitle>
              <CardDescription>Detailed comparison of gross and net burn metrics</CardDescription>
            </CardHeader>
            <CardContent>
              <div className="overflow-x-auto">
                <table className="w-full text-sm">
                  <thead>
                    <tr className="border-b">
                      <th className="text-left p-2">Metric</th>
                      <th className="text-right p-2">Gross Burn</th>
                      <th className="text-right p-2">Net Burn</th>
                      <th className="text-right p-2">Difference</th>
                    </tr>
                  </thead>
                  <tbody>
                    {result.comparison.map((item, index) => (
                      <tr key={index} className="border-b">
                        <td className="p-2 font-medium">{item.label}</td>
                        <td className="text-right p-2 text-red-600">
                          {item.grossValue > 0 ? `$${item.grossValue.toLocaleString('en-US', { minimumFractionDigits: 2, maximumFractionDigits: 2 })}` : '-'}
                        </td>
                        <td className={`text-right p-2 ${item.netValue <= 0 ? 'text-green-600' : 'text-amber-600'}`}>
                          {item.netValue !== 0 ? `$${item.netValue.toLocaleString('en-US', { minimumFractionDigits: 2, maximumFractionDigits: 2 })}` : '-'}
                        </td>
                        <td className="text-right p-2 text-green-600">
                          ${item.difference.toLocaleString('en-US', { minimumFractionDigits: 2, maximumFractionDigits: 2 })}
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            </CardContent>
          </Card>

          {/* Smart Actions & Recommendations */}
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6 mb-6">
            <Card className="h-full">
              <CardHeader>
                <CardTitle className="flex items-center gap-2 text-xl text-primary">
                  <Target className="h-6 w-6" />
                  Strategic Insights
                </CardTitle>
                <CardDescription>Key considerations for burn rate management</CardDescription>
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
            Key components required for burn rate calculation
          </CardDescription>
        </CardHeader>
        <CardContent>
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div className="p-4 bg-red-50 dark:bg-red-900/10 rounded-lg border border-red-100 dark:border-red-900/20">
              <h4 className="font-semibold mb-2 flex items-center gap-2 text-red-700 dark:text-red-300">
                <TrendingDown className="h-4 w-4" />
                Monthly Expenses (Gross Burn)
              </h4>
              <p className="text-sm text-muted-foreground mb-3">
                Total monthly operating expenses including all costs.
              </p>
              <ul className="space-y-2">
                <li className="flex items-start gap-2 text-sm text-muted-foreground">
                  <CheckCircle2 className="h-4 w-4 text-red-500 mt-0.5 shrink-0" />
                  <span>Salaries and benefits</span>
                </li>
                <li className="flex items-start gap-2 text-sm text-muted-foreground">
                  <CheckCircle2 className="h-4 w-4 text-red-500 mt-0.5 shrink-0" />
                  <span>Office rent and utilities</span>
                </li>
                <li className="flex items-start gap-2 text-sm text-muted-foreground">
                  <CheckCircle2 className="h-4 w-4 text-red-500 mt-0.5 shrink-0" />
                  <span>Software subscriptions and tools</span>
                </li>
                <li className="flex items-start gap-2 text-sm text-muted-foreground">
                  <CheckCircle2 className="h-4 w-4 text-red-500 mt-0.5 shrink-0" />
                  <span>Marketing and sales costs</span>
                </li>
              </ul>
            </div>

            <div className="p-4 bg-green-50 dark:bg-green-900/10 rounded-lg border border-green-100 dark:border-green-900/20">
              <h4 className="font-semibold mb-2 flex items-center gap-2 text-green-700 dark:text-green-300">
                <TrendingUp className="h-4 w-4" />
                Monthly Revenue / MRR
              </h4>
              <p className="text-sm text-muted-foreground mb-3">
                Monthly Recurring Revenue (MRR) or total monthly revenue.
              </p>
              <ul className="space-y-2">
                <li className="flex items-start gap-2 text-sm text-muted-foreground">
                  <CheckCircle2 className="h-4 w-4 text-green-500 mt-0.5 shrink-0" />
                  <span>Subscription revenue (MRR)</span>
                </li>
                <li className="flex items-start gap-2 text-sm text-muted-foreground">
                  <CheckCircle2 className="h-4 w-4 text-green-500 mt-0.5 shrink-0" />
                  <span>Recurring contracts</span>
                </li>
                <li className="flex items-start gap-2 text-sm text-muted-foreground">
                  <CheckCircle2 className="h-4 w-4 text-green-500 mt-0.5 shrink-0" />
                  <span>Monthly revenue streams</span>
                </li>
              </ul>
            </div>

            <div className="p-4 bg-blue-50 dark:bg-blue-900/10 rounded-lg border border-blue-100 dark:border-blue-900/20">
              <h4 className="font-semibold mb-2 flex items-center gap-2 text-blue-700 dark:text-blue-300">
                <DollarSign className="h-4 w-4" />
                Cost of Goods Sold (COGS)
              </h4>
              <p className="text-sm text-muted-foreground mb-3">
                Direct costs associated with delivering your service (optional).
              </p>
              <ul className="space-y-2">
                <li className="flex items-start gap-2 text-sm text-muted-foreground">
                  <CheckCircle2 className="h-4 w-4 text-blue-500 mt-0.5 shrink-0" />
                  <span>Hosting and infrastructure costs</span>
                </li>
                <li className="flex items-start gap-2 text-sm text-muted-foreground">
                  <CheckCircle2 className="h-4 w-4 text-blue-500 mt-0.5 shrink-0" />
                  <span>Payment processing fees</span>
                </li>
                <li className="flex items-start gap-2 text-sm text-muted-foreground">
                  <CheckCircle2 className="h-4 w-4 text-blue-500 mt-0.5 shrink-0" />
                  <span>Customer support costs</span>
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
              Gross Burn Rate = Total Monthly Expenses
            </p>
            <p className="font-mono text-sm text-center mt-2">
              Net Burn Rate = Gross Burn Rate - Monthly Revenue
            </p>
            <p className="font-mono text-sm text-center mt-2">
              Gross Margin = ((Revenue - COGS) / Revenue) × 100%
            </p>
            <p className="font-mono text-sm text-center mt-2">
              Net Margin = ((Revenue - Total Expenses) / Revenue) × 100%
            </p>
          </div>
          <p className="text-sm text-muted-foreground mt-2">
            Gross burn rate shows total cash consumption regardless of revenue. Net burn rate reflects actual cash consumption after accounting for revenue. The difference shows how effectively revenue is offsetting expenses.
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
            <Link href="/finance/startup-runway-calculator-with-revenue-growth" className="block">
              <Card className="hover:shadow-md transition-shadow cursor-pointer">
                <CardContent className="p-4">
                  <div className="flex items-center gap-3">
                    <Target className="h-5 w-5 text-purple-600" />
                    <div>
                      <p className="font-medium">Startup Runway</p>
                      <p className="text-sm text-muted-foreground">With revenue growth</p>
                    </div>
                  </div>
                </CardContent>
              </Card>
            </Link>
            <Link href="/finance/burn-rate-calculator" className="block">
              <Card className="hover:shadow-md transition-shadow cursor-pointer">
                <CardContent className="p-4">
                  <div className="flex items-center gap-3">
                    <TrendingDown className="h-5 w-5 text-red-600" />
                    <div>
                      <p className="font-medium">Burn Rate Calculator</p>
                      <p className="text-sm text-muted-foreground">Basic burn rate analysis</p>
                    </div>
                  </div>
                </CardContent>
              </Card>
            </Link>
            <Link href="/finance/startup-runway-calculator" className="block">
              <Card className="hover:shadow-md transition-shadow cursor-pointer">
                <CardContent className="p-4">
                  <div className="flex items-center gap-3">
                    <BarChart3 className="h-5 w-5 text-blue-600" />
                    <div>
                      <p className="font-medium">Startup Runway</p>
                      <p className="text-sm text-muted-foreground">Basic runway calculation</p>
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
        <meta itemProp="name" content="The Definitive Guide to SaaS Burn Rate: Gross vs Net Analysis" />
        <meta itemProp="description" content="An expert guide to understanding gross vs net burn rate for SaaS companies, calculating margins, and strategic financial planning." />
        <meta itemProp="keywords" content="saas burn rate calculator, gross burn rate, net burn rate, MRR analysis, SaaS financial metrics, burn rate comparison" />
        <meta itemProp="author" content="[Your Site's Financial Analyst Team]" />
        <meta itemProp="datePublished" content="2025-01-30" />
        <meta itemProp="url" content="/definitive-saas-burn-rate-guide" />

        <h1 className="text-3xl md:text-4xl font-extrabold text-foreground mb-4" itemProp="headline">The Definitive Guide to SaaS Burn Rate: Gross vs Net Analysis</h1>
        <p className="text-lg italic text-muted-foreground">Master the distinction between gross and net burn rate, understand their implications for SaaS financial health, and learn strategic planning for profitability.</p>

        {/* TABLE OF CONTENTS */}
        <h2 className="text-2xl font-bold text-foreground mt-8 mb-4">Table of Contents: Jump to a Section</h2>
        <ul className="list-disc ml-6 space-y-2 text-primary">
          <li><a href="#definition" className="hover:underline">Burn Rate: Definition and Core Concepts</a></li>
          <li><a href="#gross-vs-net" className="hover:underline">Gross Burn Rate vs Net Burn Rate</a></li>
          <li><a href="#calculation" className="hover:underline">Calculation Methods and Formulas</a></li>
          <li><a href="#interpretation" className="hover:underline">Interpreting Burn Rate Metrics</a></li>
          <li><a href="#applications" className="hover:underline">Strategic Planning and Optimization</a></li>
        </ul>
        <hr />

        {/* DEFINITION */}
        <h2 id="definition" className="text-2xl font-bold text-foreground pt-8" itemProp="articleSection">Burn Rate: Definition and Core Concepts</h2>
        <p>The **Burn Rate** measures how quickly a company consumes its cash reserves. For SaaS companies, understanding both gross and net burn rate is crucial for financial planning and investor communication.</p>

        <h3 className="text-xl font-semibold text-foreground mt-6">Two Critical Metrics</h3>
        <p><strong>Gross Burn Rate</strong> represents total monthly expenses regardless of revenue. <strong>Net Burn Rate</strong> accounts for revenue, showing actual cash consumption after revenue offsets expenses. The difference between these metrics reveals how effectively revenue is reducing cash consumption.</p>

        <hr />

        {/* GROSS VS NET */}
        <h2 id="gross-vs-net" className="text-2xl font-bold text-foreground pt-8" itemProp="articleSection">Gross Burn Rate vs Net Burn Rate</h2>
        <p>Understanding the distinction between gross and net burn is fundamental to SaaS financial analysis.</p>

        <h3 className="text-xl font-semibold text-foreground mt-6">Gross Burn Rate</h3>
        <p>Gross burn rate is the total monthly operating expenses, representing total cash outflow regardless of revenue. It includes:</p>
        <ul className="list-disc ml-6 space-y-2">
          <li>Salaries and employee benefits</li>
          <li>Office rent and utilities</li>
          <li>Software subscriptions and tools</li>
          <li>Marketing and sales expenses</li>
          <li>All other operating costs</li>
        </ul>

        <h3 className="text-xl font-semibold text-foreground mt-6">Net Burn Rate</h3>
        <p>Net burn rate subtracts monthly revenue from gross burn rate, showing actual cash consumption:</p>
        <div className="overflow-x-auto my-6 p-4 bg-muted border rounded-lg text-center">
          <p className="font-mono text-xl text-destructive font-bold">
            {'Net Burn Rate = Gross Burn Rate - Monthly Revenue'}
          </p>
        </div>
        <p>When net burn is negative (revenue exceeds expenses), the company is cash flow positive and profitable.</p>

        <hr />

        {/* CALCULATION */}
        <h2 id="calculation" className="text-2xl font-bold text-foreground pt-8" itemProp="articleSection">Calculation Methods and Formulas</h2>
        <p>Accurate burn rate calculation requires careful tracking of expenses and revenue.</p>

        <h3 className="text-xl font-semibold text-foreground mt-6">Gross Margin Calculation</h3>
        <p>Gross margin measures profitability after direct costs (COGS):</p>
        <div className="overflow-x-auto my-6 p-4 bg-muted border rounded-lg text-center">
          <p className="font-mono text-xl text-destructive font-bold">
            {'Gross Margin = ((Revenue - COGS) / Revenue) × 100%'}
          </p>
        </div>

        <h3 className="text-xl font-semibold text-foreground mt-6">Net Margin Calculation</h3>
        <p>Net margin measures overall profitability after all expenses:</p>
        <div className="overflow-x-auto my-6 p-4 bg-muted border rounded-lg text-center">
          <p className="font-mono text-xl text-destructive font-bold">
            {'Net Margin = ((Revenue - Total Expenses) / Revenue) × 100%'}
          </p>
        </div>

        <hr />

        {/* INTERPRETATION */}
        <h2 id="interpretation" className="text-2xl font-bold text-foreground pt-8" itemProp="articleSection">Interpreting Burn Rate Metrics</h2>
        <p>Effective interpretation requires understanding what different burn rate levels indicate.</p>

        <h3 className="text-xl font-semibold text-foreground mt-6">Net Burn Rate Interpretation</h3>
        <ul className="list-disc ml-6 space-y-2">
          <li><strong>Negative Net Burn:</strong> Company is cash flow positive and profitable</li>
          <li><strong>Net Burn &lt; 30% of Gross:</strong> Excellent revenue coverage</li>
          <li><strong>Net Burn 30-50% of Gross:</strong> Good revenue coverage</li>
          <li><strong>Net Burn 50-70% of Gross:</strong> Moderate revenue coverage</li>
          <li><strong>Net Burn &gt; 70% of Gross:</strong> Poor revenue coverage</li>
        </ul>

        <h3 className="text-xl font-semibold text-foreground mt-6">Gross Margin Benchmarks</h3>
        <p>For SaaS companies, gross margins typically range:</p>
        <ul className="list-disc ml-6 space-y-2">
          <li><strong>70-90%:</strong> Excellent unit economics</li>
          <li><strong>50-70%:</strong> Good margins</li>
          <li><strong>&lt;50%:</strong> May need pricing or cost optimization</li>
        </ul>

        <hr />

        {/* APPLICATIONS */}
        <h2 id="applications" className="text-2xl font-bold text-foreground pt-8" itemProp="articleSection">Strategic Planning and Optimization</h2>
        <p>Burn rate analysis enables strategic decision-making for growth and profitability.</p>

        <h3 className="text-xl font-semibold text-foreground mt-6">Revenue Growth Impact</h3>
        <p>As revenue grows, net burn decreases even if gross burn remains constant. This extends runway and moves the company toward profitability. Focus on accelerating revenue growth to improve net burn.</p>

        <h3 className="text-xl font-semibold text-foreground mt-6">Cost Optimization</h3>
        <p>Reducing gross burn directly improves net burn. However, balance cost optimization with growth investments. Cutting costs that drive revenue growth can be counterproductive.</p>

        <hr />

        {/* CONCLUSION */}
        <h2 className="text-2xl font-bold text-foreground pt-8" itemProp="articleSection">Conclusion</h2>
        <p>Understanding gross vs net burn rate is essential for SaaS financial management. Gross burn shows total cash consumption, while net burn reveals actual cash consumption after revenue. The difference indicates how effectively revenue is offsetting expenses.</p>
        <p>Focus on accelerating revenue growth to improve net burn, maintain strong gross margins, and monitor both metrics regularly for strategic planning.</p>
      </section>

      {/* FAQ Section */}
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <Info className="h-5 w-5" />
            Frequently Asked Questions
          </CardTitle>
          <CardDescription>
            Common questions about SaaS Burn Rate (Gross vs Net)
          </CardDescription>
        </CardHeader>
        <CardContent>
          <div className="space-y-6">
            <div>
              <h4 className="font-semibold text-lg mb-3">What is the difference between gross and net burn rate?</h4>
              <p className="text-muted-foreground">
                Gross burn rate is total monthly expenses regardless of revenue. Net burn rate subtracts monthly revenue from gross burn, showing actual cash consumption. Net burn = Gross burn - Revenue.
              </p>
            </div>

            <div>
              <h4 className="font-semibold text-lg mb-3">Which burn rate is more important?</h4>
              <p className="text-muted-foreground">
                Both metrics are important. Gross burn shows total cash consumption and operational scale. Net burn shows actual cash consumption and path to profitability. Investors typically focus on net burn as it reflects the impact of revenue growth.
              </p>
            </div>

            <div>
              <h4 className="font-semibold text-lg mb-3">What is a good net burn rate?</h4>
              <p className="text-muted-foreground">
                A negative net burn rate (cash flow positive) is ideal. For growing SaaS companies, net burn should be significantly lower than gross burn (ideally less than 50% of gross burn), indicating strong revenue coverage. The goal is to reduce net burn over time through revenue growth.
              </p>
            </div>

            <div>
              <h4 className="font-semibold text-lg mb-3">How does revenue growth affect burn rate?</h4>
              <p className="text-muted-foreground">
                Revenue growth directly reduces net burn rate. As revenue increases, net burn decreases even if gross burn remains constant. Eventually, revenue may exceed gross burn, making net burn negative (cash flow positive). This is the path to profitability.
              </p>
            </div>

            <div>
              <h4 className="font-semibold text-lg mb-3">What is a good gross margin for SaaS?</h4>
              <p className="text-muted-foreground">
                SaaS companies typically target gross margins of 70-90%. Margins above 70% indicate excellent unit economics. Margins below 50% may require pricing optimization or cost reduction. Gross margin = (Revenue - COGS) / Revenue × 100%.
              </p>
            </div>

            <div>
              <h4 className="font-semibold text-lg mb-3">Should I use MRR or total revenue?</h4>
              <p className="text-muted-foreground">
                For SaaS companies, Monthly Recurring Revenue (MRR) is most appropriate as it represents predictable, recurring revenue. Use MRR for consistent burn rate tracking. For other business models, use total monthly revenue.
              </p>
            </div>

            <div>
              <h4 className="font-semibold text-lg mb-3">How do I reduce net burn rate?</h4>
              <p className="text-muted-foreground">
                Reduce net burn by increasing revenue (accelerating growth) or decreasing gross burn (cost optimization), or both. Revenue growth is typically more sustainable than aggressive cost cutting, which may impact growth. Focus on improving revenue-to-expense ratio.
              </p>
            </div>

            <div>
              <h4 className="font-semibold text-lg mb-3">What if net burn is negative?</h4>
              <p className="text-muted-foreground">
                Negative net burn means revenue exceeds expenses - the company is cash flow positive and profitable. This is the goal for sustainable operations. Maintain this while continuing to invest in growth.
              </p>
            </div>

            <div>
              <h4 className="font-semibold text-lg mb-3">How often should I calculate burn rate?</h4>
              <p className="text-muted-foreground">
                Calculate burn rate monthly for regular monitoring. Track trends over time to understand how revenue growth and cost changes affect net burn. Update calculations when expenses or revenue patterns change significantly.
              </p>
            </div>

            <div>
              <h4 className="font-semibold text-lg mb-3">What expenses should be included in gross burn?</h4>
              <p className="text-muted-foreground">
                Include all operating expenses: salaries, benefits, rent, utilities, software subscriptions, marketing, sales costs, professional services, and any other monthly operating costs. Exclude one-time expenses and capital expenditures from monthly burn calculations.
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
                <strong className="block text-primary mb-1">SaaS Founders</strong>
                <span className="text-sm text-muted-foreground">To understand gross vs net burn and plan for profitability.</span>
              </div>
              <div className="p-3 bg-muted/50 rounded-lg border border-border/50">
                <strong className="block text-primary mb-1">CFOs & Finance Teams</strong>
                <span className="text-sm text-muted-foreground">To provide accurate burn rate analysis for investors and board.</span>
              </div>
              <div className="p-3 bg-muted/50 rounded-lg border border-border/50">
                <strong className="block text-primary mb-1">Investors</strong>
                <span className="text-sm text-muted-foreground">To assess portfolio company financial health and growth trajectory.</span>
              </div>
              <div className="p-3 bg-muted/50 rounded-lg border border-border/50">
                <strong className="block text-primary mb-1">Board Members</strong>
                <span className="text-sm text-muted-foreground">To monitor financial metrics and make informed strategic decisions.</span>
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
                <span><strong>Revenue Variability:</strong> MRR may fluctuate with churn, upgrades, and new customers. Use average or trailing MRR for more stable calculations.</span>
              </li>
              <li className="flex gap-2">
                <CheckCircle2 className="h-4 w-4 text-amber-500 shrink-0 mt-0.5" />
                <span><strong>Expense Timing:</strong> Some expenses may be annual or quarterly. Convert to monthly equivalents for accurate burn rate calculation.</span>
              </li>
              <li className="flex gap-2">
                <CheckCircle2 className="h-4 w-4 text-amber-500 shrink-0 mt-0.5" />
                <span><strong>Seasonal Variations:</strong> Revenue and expenses may fluctuate seasonally. Use average or conservative estimates for planning.</span>
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
                  A SaaS company with $100K gross burn and $80K MRR has $20K net burn. Revenue covers 80% of gross burn, showing strong path to profitability. As MRR grows to $100K+, net burn becomes negative (cash flow positive).
                </p>
              </div>
              <div className="p-4 rounded-lg bg-blue-50 dark:bg-blue-900/10 border border-blue-100 dark:border-blue-900/20">
                <h5 className="font-semibold text-blue-800 dark:text-blue-300 mb-1">Case B: Early-Stage SaaS</h5>
                <p className="text-sm text-blue-700/80 dark:text-blue-400">
                  An early-stage SaaS with $50K gross burn and $10K MRR has $40K net burn. Revenue covers only 20% of gross burn. Focus should be on accelerating revenue growth to improve net burn and extend runway.
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
          <p>The SaaS Burn Rate Calculator (Gross vs Net) compares total expenses (gross burn) with actual cash consumption after revenue (net burn).</p>
          <p>It helps SaaS companies understand how effectively revenue is offsetting expenses and plan for profitability.</p>
          <p>Focus on accelerating revenue growth to improve net burn rate and move toward cash flow positive operations.</p>
        </CardContent>
      </Card>
    </div>
  );
}

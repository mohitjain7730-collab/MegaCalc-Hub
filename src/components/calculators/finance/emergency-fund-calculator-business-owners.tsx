'use client';

import { useState } from 'react';
import Script from 'next/script';
import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import { z } from 'zod';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Form, FormControl, FormField, FormItem, FormLabel, FormMessage } from '@/components/ui/form';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Shield, Target, Info, Calculator, DollarSign, BarChart3, Wallet, CheckCircle2, AlertCircle, Users, Briefcase, AlertTriangle, FunctionSquare, Building2 } from 'lucide-react';
import { Badge } from '@/components/ui/badge';
import { Alert, AlertDescription } from '@/components/ui/alert';
import Link from 'next/link';

const formSchema = z.object({
  housing: z.number().min(0, 'Enter housing cost'),
  utilities: z.number().min(0),
  food: z.number().min(0),
  transportation: z.number().min(0),
  debtPayments: z.number().min(0),
  insurance: z.number().min(0),
  otherEssentials: z.number().min(0),
  currentSavings: z.number().min(0),
  incomeSource: z.enum(['salary-plus-draw', 'mostly-draw', 'all-draw']),
  revenueConcentration: z.enum(['diversified', 'few-customers', 'one-main']),
  industryRisk: z.enum(['stable', 'cyclical', 'high-risk']),
  dependents: z.number().min(0).max(20),
}).refine((data) => {
  const total = (data.housing || 0) + (data.utilities || 0) + (data.food || 0) + (data.transportation || 0) + (data.debtPayments || 0) + (data.insurance || 0) + (data.otherEssentials || 0);
  return total > 0;
}, { message: 'Enter at least one monthly expense', path: ['housing'] });

type FormValues = z.infer<typeof formSchema>;

const schemaMarkup = {
  '@context': 'https://schema.org',
  '@graph': [
    {
      '@type': 'SoftwareApplication',
      name: 'Emergency Fund Calculator for Business Owners',
      applicationCategory: 'FinanceApplication',
      operatingSystem: 'Web Browser',
      description: 'Calculate emergency fund target for business owners: recommended 6–12+ months of personal essential expenses given variable draw, business revenue risk, and no employer safety net.',
      url: 'https://mycalculating.com/category/finance/emergency-fund-calculator-business-owners',
      offers: { '@type': 'Offer', price: '0', priceCurrency: 'USD' },
    },
  ],
};

export default function EmergencyFundCalculatorBusinessOwners() {
  const [result, setResult] = useState<{
    monthlyExpenses: number;
    recommendedMonths: number;
    targetFund: number;
    currentGap: number;
    monthsCovered: number;
    status: string;
    recommendation: string;
    insights: string[];
    warnings: string[];
  } | null>(null);

  const form = useForm<FormValues>({
    resolver: zodResolver(formSchema),
    defaultValues: {
      housing: undefined,
      utilities: undefined,
      food: undefined,
      transportation: undefined,
      debtPayments: undefined,
      insurance: undefined,
      otherEssentials: undefined,
      currentSavings: undefined,
      incomeSource: 'salary-plus-draw',
      revenueConcentration: 'diversified',
      industryRisk: 'stable',
      dependents: 0,
    },
  });

  const calculate = (v: FormValues) => {
    const monthlyExpenses = (v.housing || 0) + (v.utilities || 0) + (v.food || 0) + (v.transportation || 0) + (v.debtPayments || 0) + (v.insurance || 0) + (v.otherEssentials || 0);
    if (monthlyExpenses === 0) return null;

    // Business owner base: 6 months (income tied to business; no employer safety net)
    let recommendedMonths = 6;
    if (v.incomeSource === 'mostly-draw') recommendedMonths += 3;
    if (v.incomeSource === 'all-draw') recommendedMonths += 6;
    if (v.revenueConcentration === 'few-customers') recommendedMonths += 3;
    if (v.revenueConcentration === 'one-main') recommendedMonths += 3;
    if (v.industryRisk === 'cyclical') recommendedMonths += 3;
    if (v.industryRisk === 'high-risk') recommendedMonths += 6;
    if (v.dependents > 0) recommendedMonths += 3;
    recommendedMonths = Math.min(Math.max(recommendedMonths, 6), 18);

    const targetFund = monthlyExpenses * recommendedMonths;
    const currentGap = targetFund - (v.currentSavings || 0);
    const monthsCovered = monthlyExpenses > 0 ? (v.currentSavings || 0) / monthlyExpenses : 0;

    return {
      monthlyExpenses,
      recommendedMonths,
      targetFund,
      currentGap,
      monthsCovered,
    };
  };

  const getStatus = (monthsCovered: number, recommendedMonths: number) => {
    if (monthsCovered >= recommendedMonths) return 'Secure';
    if (monthsCovered >= recommendedMonths / 2) return 'Building';
    if (monthsCovered >= 3) return 'Minimal';
    return 'Vulnerable';
  };

  const getRecommendation = (monthsCovered: number, recommendedMonths: number) => {
    if (monthsCovered >= recommendedMonths) return 'Business owner emergency fund is fully funded. Keep funds in a high-yield savings account for liquidity; consider a separate business reserve.';
    if (monthsCovered >= 6) return 'You have a partial buffer. Continue building to the recommended 6–12+ months for business-owner security.';
    if (monthsCovered >= 3) return 'You have minimal coverage. Business owners face revenue and industry risk; prioritize reaching at least 6 months of personal expenses.';
    return 'Immediate action required. Business owners have no employer safety net; build at least 3 months of personal expenses as a first milestone, then aim for 6–12+ months.';
  };

  const getInsights = (v: FormValues, recommendedMonths: number) => {
    const insights = [];
    insights.push('Business owners often rely on draw or profit; income can drop when the business slows. A personal emergency fund (6–12+ months of personal essential expenses) is the standard recommendation.');
    if (v.incomeSource === 'mostly-draw' || v.incomeSource === 'all-draw') {
      insights.push('Income from draw or profit (vs salary) increases recommended months; business downturns can cut personal income sharply.');
    }
    if (v.revenueConcentration === 'few-customers' || v.revenueConcentration === 'one-main') {
      insights.push('Revenue concentration (few or one main customer) increases risk; target includes additional months.');
    }
    if (v.industryRisk === 'cyclical' || v.industryRisk === 'high-risk') {
      insights.push('Cyclical or high-risk industry increases recommended months; downturns can reduce business income.');
    }
    if (v.dependents > 0) {
      insights.push('Dependents increase financial responsibility; target includes additional months.');
    }
    const total = (v.housing || 0) + (v.utilities || 0) + (v.food || 0) + (v.transportation || 0) + (v.debtPayments || 0) + (v.insurance || 0) + (v.otherEssentials || 0);
    if (total > 0 && (v.housing || 0) > total * 0.5) {
      insights.push('High housing cost increases risk; consider reducing fixed costs or building a larger fund.');
    }
    return insights;
  };

  const getWarnings = (monthsCovered: number, recommendedMonths: number) => {
    const warnings = [];
    if (monthsCovered < 1) warnings.push('Less than 1 month covered: extreme risk for business owners with variable income.');
    if (monthsCovered < 3) warnings.push('Below 3 months: minimal buffer; business owners should prioritize reaching at least 6 months of personal expenses.');
    if (monthsCovered < recommendedMonths && monthsCovered >= 3) warnings.push('Below recommended business-owner target (6–12+ months).');
    return warnings;
  };

  const onSubmit = (values: FormValues) => {
    const res = calculate(values);
    if (res) {
      setResult({
        ...res,
        status: getStatus(res.monthsCovered, res.recommendedMonths),
        recommendation: getRecommendation(res.monthsCovered, res.recommendedMonths),
        insights: getInsights(values, res.recommendedMonths),
        warnings: getWarnings(res.monthsCovered, res.recommendedMonths),
      });
    }
  };

  return (
    <div className="space-y-8">
      <Script id="emergency-fund-business-owners-schema" type="application/ld+json" strategy="afterInteractive" dangerouslySetInnerHTML={{ __html: JSON.stringify(schemaMarkup) }} />

      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <Target className="h-5 w-5" />
            Business Owner Profile
          </CardTitle>
          <CardDescription>
            Enter monthly personal essential expenses and business-owner risk factors. Business owners often rely on draw or profit; target is typically 6–12+ months of personal expenses. Keep business and personal reserves separate.
          </CardDescription>
        </CardHeader>
        <CardContent>
          <Form {...form}>
            <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-6">
              <div className="space-y-4">
                <h3 className="font-semibold text-sm text-primary flex items-center gap-2">
                  <DollarSign className="h-4 w-4" /> Monthly Personal Essential Expenses
                </h3>
                <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
                  <FormField control={form.control} name="housing" render={({ field }) => (
                    <FormItem><FormLabel>Housing (rent/mortgage, tax, insurance)</FormLabel><FormControl><Input type="number" placeholder="e.g., 2000" {...field} value={field.value ?? ''} onChange={e => field.onChange(parseFloat(e.target.value) || 0)} /></FormControl><FormMessage /></FormItem>
                  )} />
                  <FormField control={form.control} name="utilities" render={({ field }) => (
                    <FormItem><FormLabel>Utilities</FormLabel><FormControl><Input type="number" placeholder="e.g., 250" {...field} value={field.value ?? ''} onChange={e => field.onChange(parseFloat(e.target.value) || 0)} /></FormControl><FormMessage /></FormItem>
                  )} />
                  <FormField control={form.control} name="food" render={({ field }) => (
                    <FormItem><FormLabel>Food & Groceries</FormLabel><FormControl><Input type="number" placeholder="e.g., 600" {...field} value={field.value ?? ''} onChange={e => field.onChange(parseFloat(e.target.value) || 0)} /></FormControl><FormMessage /></FormItem>
                  )} />
                  <FormField control={form.control} name="transportation" render={({ field }) => (
                    <FormItem><FormLabel>Transportation</FormLabel><FormControl><Input type="number" placeholder="e.g., 400" {...field} value={field.value ?? ''} onChange={e => field.onChange(parseFloat(e.target.value) || 0)} /></FormControl><FormMessage /></FormItem>
                  )} />
                  <FormField control={form.control} name="debtPayments" render={({ field }) => (
                    <FormItem><FormLabel>Minimum Debt Payments</FormLabel><FormControl><Input type="number" placeholder="e.g., 500" {...field} value={field.value ?? ''} onChange={e => field.onChange(parseFloat(e.target.value) || 0)} /></FormControl><FormMessage /></FormItem>
                  )} />
                  <FormField control={form.control} name="insurance" render={({ field }) => (
                    <FormItem><FormLabel>Insurance (health, life, etc.)</FormLabel><FormControl><Input type="number" placeholder="e.g., 400" {...field} value={field.value ?? ''} onChange={e => field.onChange(parseFloat(e.target.value) || 0)} /></FormControl><FormMessage /></FormItem>
                  )} />
                  <FormField control={form.control} name="otherEssentials" render={({ field }) => (
                    <FormItem><FormLabel>Other Essentials</FormLabel><FormControl><Input type="number" placeholder="e.g., 250" {...field} value={field.value ?? ''} onChange={e => field.onChange(parseFloat(e.target.value) || 0)} /></FormControl><FormMessage /></FormItem>
                  )} />
                </div>
              </div>

              <div className="space-y-4 pt-4 border-t">
                <h3 className="font-semibold text-sm text-primary flex items-center gap-2">
                  <Building2 className="h-4 w-4" /> Savings & Risk (Business Owner)
                </h3>
                <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
                  <FormField control={form.control} name="currentSavings" render={({ field }) => (
                    <FormItem><FormLabel>Current Personal Emergency Savings ($)</FormLabel><FormControl><Input type="number" placeholder="e.g., 20000" {...field} value={field.value ?? ''} onChange={e => field.onChange(parseFloat(e.target.value) || 0)} /></FormControl><FormMessage /></FormItem>
                  )} />
                  <FormField control={form.control} name="incomeSource" render={({ field }) => (
                    <FormItem>
                      <FormLabel>Personal Income Source</FormLabel>
                      <Select onValueChange={field.onChange} defaultValue={field.value}>
                        <FormControl>
                          <SelectTrigger>
                            <SelectValue placeholder="Select" />
                          </SelectTrigger>
                        </FormControl>
                        <SelectContent>
                          <SelectItem value="salary-plus-draw">Salary plus draw (mixed)</SelectItem>
                          <SelectItem value="mostly-draw">Mostly draw from business</SelectItem>
                          <SelectItem value="all-draw">All income from business draw</SelectItem>
                        </SelectContent>
                      </Select>
                      <FormMessage />
                    </FormItem>
                  )} />
                  <FormField control={form.control} name="revenueConcentration" render={({ field }) => (
                    <FormItem>
                      <FormLabel>Business Revenue Concentration</FormLabel>
                      <Select onValueChange={field.onChange} defaultValue={field.value}>
                        <FormControl>
                          <SelectTrigger>
                            <SelectValue placeholder="Select" />
                          </SelectTrigger>
                        </FormControl>
                        <SelectContent>
                          <SelectItem value="diversified">Diversified (many customers)</SelectItem>
                          <SelectItem value="few-customers">Few main customers</SelectItem>
                          <SelectItem value="one-main">One main customer</SelectItem>
                        </SelectContent>
                      </Select>
                      <FormMessage />
                    </FormItem>
                  )} />
                  <FormField control={form.control} name="industryRisk" render={({ field }) => (
                    <FormItem>
                      <FormLabel>Industry / Business Risk</FormLabel>
                      <Select onValueChange={field.onChange} defaultValue={field.value}>
                        <FormControl>
                          <SelectTrigger>
                            <SelectValue placeholder="Select" />
                          </SelectTrigger>
                        </FormControl>
                        <SelectContent>
                          <SelectItem value="stable">Stable (recurring revenue)</SelectItem>
                          <SelectItem value="cyclical">Cyclical (seasonal or economic)</SelectItem>
                          <SelectItem value="high-risk">High risk (volatile, startup)</SelectItem>
                        </SelectContent>
                      </Select>
                      <FormMessage />
                    </FormItem>
                  )} />
                  <FormField control={form.control} name="dependents" render={({ field }) => (
                    <FormItem><FormLabel>Number of Dependents</FormLabel><FormControl><Input type="number" min={0} placeholder="0" {...field} value={field.value ?? ''} onChange={e => field.onChange(parseInt(e.target.value, 10) || 0)} /></FormControl><FormMessage /></FormItem>
                  )} />
                </div>
              </div>

              <Button type="submit" className="w-full">
                <Calculator className="mr-2 h-4 w-4" />
                Calculate Emergency Fund Target
              </Button>
            </form>
          </Form>
        </CardContent>
      </Card>

      {result && (
        <div className="space-y-6">
          <Card>
            <CardHeader>
              <div className="flex items-center gap-4">
                <Wallet className="h-8 w-8 text-primary" />
                <div>
                  <CardTitle>Emergency Fund Goal (Business Owner)</CardTitle>
                  <CardDescription>Target based on 6–12+ months of personal essential expenses; income tied to business</CardDescription>
                </div>
              </div>
            </CardHeader>
            <CardContent className="space-y-6">
              <div className="text-center">
                <p className="text-4xl font-bold text-primary">${result.targetFund.toLocaleString()}</p>
                <p className="text-lg text-muted-foreground mt-2">
                  To cover <span className="font-semibold text-foreground">{result.recommendedMonths} months</span> of personal essential expenses
                </p>
                <p className="text-sm text-muted-foreground mt-1">{result.recommendation}</p>
              </div>

              <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                <div className="text-center p-4 bg-muted/50 rounded-lg">
                  <Shield className="h-6 w-6 mx-auto mb-2 text-blue-600" />
                  <p className="font-semibold">Status</p>
                  <Badge variant={result.status === 'Secure' ? 'default' : result.status === 'Building' ? 'secondary' : 'destructive'}>
                    {result.status}
                  </Badge>
                </div>
                <div className="text-center p-4 bg-muted/50 rounded-lg">
                  <BarChart3 className="h-6 w-6 mx-auto mb-2 text-green-600" />
                  <p className="font-semibold">Months Covered</p>
                  <p className="text-lg font-bold">{result.monthsCovered.toFixed(1)}</p>
                </div>
                <div className="text-center p-4 bg-muted/50 rounded-lg">
                  <AlertCircle className={`h-6 w-6 mx-auto mb-2 ${result.currentGap <= 0 ? 'text-green-600' : 'text-red-600'}`} />
                  <p className="font-semibold">Gap to Target</p>
                  <p className="text-lg font-bold">{result.currentGap <= 0 ? 'Fully Funded' : `$${result.currentGap.toLocaleString()}`}</p>
                </div>
              </div>

              <Alert className={result.monthsCovered < result.recommendedMonths ? 'border-amber-200 bg-amber-50 dark:bg-amber-900/10' : 'border-green-200 bg-green-50 dark:bg-green-900/10'}>
                <Info className="h-4 w-4" />
                <AlertDescription>
                  <strong>Recommendation:</strong> {result.recommendation}
                </AlertDescription>
              </Alert>
            </CardContent>
          </Card>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            <Card className="h-full">
              <CardHeader>
                <CardTitle className="flex items-center gap-2 text-xl text-primary">
                  <Target className="h-6 w-6" />
                  Strategic Insights
                </CardTitle>
                <CardDescription>Business-owner specific</CardDescription>
              </CardHeader>
              <CardContent className="space-y-4">
                {result.insights.map((insight, index) => (
                  <div key={index} className="flex items-start gap-3 p-3 bg-primary/5 rounded-lg border border-primary/10">
                    <CheckCircle2 className="h-5 w-5 text-primary mt-0.5 shrink-0" />
                    <span className="text-sm font-medium">{insight}</span>
                  </div>
                ))}
                <div className="flex items-start gap-3 p-3 bg-primary/5 rounded-lg border border-primary/10">
                  <CheckCircle2 className="h-5 w-5 text-primary mt-0.5 shrink-0" />
                  <span className="text-sm font-medium">Keep personal emergency funds in a high-yield savings account; consider a separate business operating reserve.</span>
                </div>
              </CardContent>
            </Card>
            <Card className="h-full border-red-100 bg-red-50/10 dark:border-red-900/20 dark:bg-red-900/5">
              <CardHeader>
                <CardTitle className="flex items-center gap-2 text-xl text-red-600 dark:text-red-400">
                  <AlertCircle className="h-6 w-6" />
                  Risk Assessment
                </CardTitle>
              </CardHeader>
              <CardContent className="space-y-4">
                {result.warnings.length > 0 ? result.warnings.map((warning, index) => (
                  <div key={index} className="flex items-start gap-3 p-3 bg-red-50 dark:bg-red-900/10 rounded-lg border border-red-100 dark:border-red-900/20">
                    <AlertCircle className="h-5 w-5 text-red-600 dark:text-red-400 mt-0.5 shrink-0" />
                    <span className="text-sm font-medium text-red-800 dark:text-red-300">{warning}</span>
                  </div>
                )) : (
                  <div className="flex items-start gap-3 p-3 bg-green-50 dark:bg-green-900/10 rounded-lg border border-green-100 dark:border-green-900/20">
                    <CheckCircle2 className="h-5 w-5 text-green-600 dark:text-green-400 mt-0.5 shrink-0" />
                    <span className="text-sm font-medium text-green-800 dark:text-green-300">Coverage meets or exceeds business-owner recommendation.</span>
                  </div>
                )}
              </CardContent>
            </Card>
          </div>
        </div>
      )}

      <Card className="mb-6">
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <Info className="h-5 w-5" />
            Understanding Business Owner Emergency Funds
          </CardTitle>
          <CardDescription>Why 6–12+ months for business owners</CardDescription>
        </CardHeader>
        <CardContent>
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div className="p-4 bg-blue-50 dark:bg-blue-900/10 rounded-lg border border-blue-100 dark:border-blue-900/20">
              <h4 className="font-semibold mb-2 flex items-center gap-2 text-blue-700 dark:text-blue-300">
                <Building2 className="h-4 w-4" />
                Income Tied to Business & No Employer Safety Net
              </h4>
              <p className="text-sm text-muted-foreground mb-3">
                Business owners often rely on draw or profit; when the business slows, personal income can drop. There is no employer paycheck or unemployment insurance. That is why the base target is 6 months of personal essential expenses and often 9–12+ months with draw-dependent income, revenue concentration, or cyclical industry.
              </p>
              <ul className="space-y-2">
                <li className="flex items-start gap-2 text-sm text-muted-foreground">
                  <CheckCircle2 className="h-4 w-4 text-blue-500 mt-0.5 shrink-0" />
                  <span>Base: 6 months of personal essential expenses</span>
                </li>
                <li className="flex items-start gap-2 text-sm text-muted-foreground">
                  <CheckCircle2 className="h-4 w-4 text-blue-500 mt-0.5 shrink-0" />
                  <span>Draw-dependent income, revenue concentration, or cyclical/high-risk industry: add 3–6 months</span>
                </li>
              </ul>
            </div>
            <div className="p-4 bg-amber-50 dark:bg-amber-900/10 rounded-lg border border-amber-100 dark:border-amber-900/20">
              <h4 className="font-semibold mb-2 flex items-center gap-2 text-amber-700 dark:text-amber-300">
                <DollarSign className="h-4 w-4" />
                Personal vs Business Reserves
              </h4>
              <p className="text-sm text-muted-foreground mb-3">
                This calculator targets personal essential expenses (housing, food, insurance, etc.). Keep a separate business operating reserve for payroll, rent, and vendor obligations. Do not rely on business cash for personal emergencies.
              </p>
            </div>
          </div>
        </CardContent>
      </Card>

      <Card className="mb-6">
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <FunctionSquare className="h-5 w-5" />
            Formula Used
          </CardTitle>
        </CardHeader>
        <CardContent className="space-y-4">
          <div className="p-4 bg-muted rounded-lg overflow-x-auto space-y-2">
            <p className="font-mono text-sm text-center">
              Target Fund = Monthly Personal Essential Expenses × Recommended Months
            </p>
            <p className="font-mono text-sm text-center">
              Business owner base: 6 months. +3 for mostly draw, +6 for all draw; +3 for few/one-main customer; +3 cyclical, +6 high-risk; +3 dependents (capped 6–18 months).
            </p>
          </div>
          <p className="text-sm text-muted-foreground mt-2">
            Months covered = Current personal savings ÷ Monthly personal expenses. Gap = Target fund − Current savings.
          </p>
        </CardContent>
      </Card>

      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <Calculator className="h-5 w-5" />
            Related Financial Calculators
          </CardTitle>
          <CardDescription>Emergency fund and cash flow tools</CardDescription>
        </CardHeader>
        <CardContent>
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
            <Link href="/finance/emergency-fund-calculator-freelancers" className="block">
              <Card className="hover:shadow-md transition-shadow cursor-pointer">
                <CardContent className="p-4">
                  <div className="flex items-center gap-3">
                    <Shield className="h-5 w-5 text-blue-600" />
                    <div>
                      <p className="font-medium">Emergency Fund (Freelancers)</p>
                      <p className="text-sm text-muted-foreground">6–12+ months, variable income</p>
                    </div>
                  </div>
                </CardContent>
              </Card>
            </Link>
            <Link href="/finance/paycheck-to-paycheck-risk-calculator" className="block">
              <Card className="hover:shadow-md transition-shadow cursor-pointer">
                <CardContent className="p-4">
                  <div className="flex items-center gap-3">
                    <AlertCircle className="h-5 w-5 text-amber-600" />
                    <div>
                      <p className="font-medium">Paycheck-to-Paycheck Risk</p>
                      <p className="text-sm text-muted-foreground">Assess buffer and expense ratio</p>
                    </div>
                  </div>
                </CardContent>
              </Card>
            </Link>
            <Link href="/finance/emergency-fund-requirement-calculator" className="block">
              <Card className="hover:shadow-md transition-shadow cursor-pointer">
                <CardContent className="p-4">
                  <div className="flex items-center gap-3">
                    <BarChart3 className="h-5 w-5 text-purple-600" />
                    <div>
                      <p className="font-medium">Emergency Fund Requirement</p>
                      <p className="text-sm text-muted-foreground">General target</p>
                    </div>
                  </div>
                </CardContent>
              </Card>
            </Link>
          </div>
        </CardContent>
      </Card>

      <section className="space-y-6 text-muted-foreground leading-relaxed bg-card p-6 md:p-10 rounded-lg shadow-lg" itemScope itemType="https://schema.org/FinanceSummary">
        <meta itemProp="name" content="Emergency Fund for Business Owners: Why 6–12+ Months" />
        <meta itemProp="description" content="How much emergency fund business owners need: income tied to business, no employer safety net. Recommended 6–12+ months of personal essential expenses, with risk adjustments." />
        <meta itemProp="keywords" content="emergency fund business owner, business owner emergency fund, how much emergency fund self employed business, 6 months expenses business owner" />
        <meta itemProp="author" content="MegaCalc Financial Team" />
        <meta itemProp="datePublished" content="2025-10-25" />
        <meta itemProp="url" content="/finance/emergency-fund-calculator-business-owners" />

        <h1 className="text-3xl md:text-4xl font-extrabold text-foreground mb-4" itemProp="headline">Emergency Fund for Business Owners: Why 6–12+ Months</h1>
        <p className="text-lg italic text-muted-foreground">Business owners often rely on draw or profit; when the business slows, personal income can drop. A larger personal emergency fund (6–12+ months of essential expenses) is the standard recommendation.</p>

        <h2 className="text-2xl font-bold text-foreground mt-8 mb-4">Table of Contents: Jump to a Section</h2>
        <ul className="list-disc ml-6 space-y-2 text-primary">
          <li><a href="#business-owner-risk" className="hover:underline">Why Business Owners Need More</a></li>
          <li><a href="#months-target-business" className="hover:underline">Recommended Months (6–12+)</a></li>
          <li><a href="#what-counts-business" className="hover:underline">What Counts as Personal Essential Expenses</a></li>
          <li><a href="#applications-business" className="hover:underline">Using the Emergency Fund Target</a></li>
          <li><a href="#conclusion-business" className="hover:underline">Conclusion</a></li>
        </ul>
        <hr />

        <h2 id="business-owner-risk" className="text-2xl font-bold text-foreground pt-8" itemProp="articleSection">Why Business Owners Need More</h2>
        <p>Business owners often depend on draw or profit for personal income. When revenue drops, personal income can drop with it. There is no employer paycheck or unemployment insurance. Financial advisors often recommend <strong>6 months</strong> of personal essential expenses as a minimum for business owners, and <strong>9–12+ months</strong> when income is mostly or entirely from the business, revenue is concentrated, or the industry is cyclical or high-risk.</p>

        <h3 className="text-xl font-semibold text-foreground mt-6">Income Tied to Business</h3>
        <p>Unlike salaried employees, business owners do not have a steady employer paycheck. Draw or profit can vary with business performance. That is why the base target for business owners is 6 months of personal expenses and often 9–12+ months when income is draw-dependent or the business has revenue or industry risk.</p>

        <h3 className="text-xl font-semibold text-foreground mt-6">Personal vs Business Reserves</h3>
        <p>This calculator targets personal essential expenses only. Business owners should also maintain a separate business operating reserve for payroll, rent, and vendors. Do not rely on business cash to cover personal emergencies.</p>

        <hr />

        <h2 id="months-target-business" className="text-2xl font-bold text-foreground pt-8" itemProp="articleSection">Recommended Months (6–12+)</h2>
        <p>Base recommendation for business owners: <strong>6 months</strong> of personal essential expenses. Add 3 months for mostly draw, 6 for all draw; add 3 for few or one main customer; add 3 for cyclical industry, 6 for high-risk; add 3 for dependents. Cap at 6–18 months.</p>

        <h3 className="text-xl font-semibold text-foreground mt-6">The Calculation</h3>
        <div className="overflow-x-auto my-6 p-4 bg-muted border rounded-lg text-center">
          <p className="font-mono text-lg text-destructive font-bold">
            Target Fund = Monthly Personal Essential Expenses × Recommended Months
          </p>
        </div>

        <h3 className="text-xl font-semibold text-foreground mt-6">When to Add More Months</h3>
        <p>Draw-dependent income, revenue concentration (few or one main customer), or cyclical/high-risk industry increases the chance of income gaps; the calculator adds months based on your income source, revenue concentration, industry risk, and dependents.</p>

        <hr />

        <h2 id="what-counts-business" className="text-2xl font-bold text-foreground pt-8" itemProp="articleSection">What Counts as Personal Essential Expenses</h2>
        <p>Include only personal, non-discretionary costs: housing, utilities, food, transportation, minimum debt payments, insurance, and other essentials. Exclude business expenses and discretionary spending so the fund covers true personal necessities.</p>

        <h3 className="text-xl font-semibold text-foreground mt-6">Exclude Business Expenses</h3>
        <p>Do not include business payroll, rent, or vendor costs here; those belong in a separate business reserve. This fund is for personal essentials when business income drops.</p>

        <hr />

        <h2 id="applications-business" className="text-2xl font-bold text-foreground pt-8" itemProp="articleSection">Using the Emergency Fund Target</h2>
        <p>Use the target fund and gap to set a savings goal. Keep personal emergency funds in a high-yield savings account (HYSA) for liquidity. Maintain a separate business operating reserve for the business.</p>

        <h3 className="text-xl font-semibold text-foreground mt-6">Where to Keep the Fund</h3>
        <p>Personal emergency funds should be liquid and low-risk. A HYSA or money market account is typical; avoid mixing with business accounts or illiquid assets.</p>

        <hr />

        <h2 id="conclusion-business" className="text-2xl font-bold text-foreground pt-8" itemProp="articleSection">Conclusion</h2>
        <p>Business owners have income tied to the business and no employer safety net; a target of 6–12+ months of personal essential expenses is the standard recommendation, with more months for draw-dependent income, revenue concentration, or industry risk. Use this calculator to set your personal target; keep business and personal reserves separate.</p>
      </section>

      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <Info className="h-5 w-5" />
            Frequently Asked Questions
          </CardTitle>
          <CardDescription>
            Common questions about emergency funds for business owners
          </CardDescription>
        </CardHeader>
        <CardContent className="space-y-6">
          <div>
            <h4 className="font-semibold text-lg mb-3">Why is the emergency fund target higher for business owners?</h4>
            <p className="text-muted-foreground">
              Business owners often rely on draw or profit for personal income; when the business slows, income can drop. There is no employer paycheck or unemployment insurance. So the base target is 6 months of personal expenses and often 9–12+ months when income is draw-dependent, revenue is concentrated, or the industry is cyclical or high-risk.
            </p>
          </div>
          <div>
            <h4 className="font-semibold text-lg mb-3">Should I include business expenses in the target?</h4>
            <p className="text-muted-foreground">
              No. This calculator targets personal essential expenses only (housing, food, insurance, etc.). Maintain a separate business operating reserve for payroll, rent, and vendor obligations. Keep business and personal reserves separate.
            </p>
          </div>
          <div>
            <h4 className="font-semibold text-lg mb-3">How many months should a business owner save?</h4>
            <p className="text-muted-foreground">
              At least 6 months of personal essential expenses is the standard minimum. With mostly or all draw, revenue concentration, or cyclical/high-risk industry, 9–12+ months is often recommended. This calculator adjusts based on your income source, revenue concentration, industry risk, and dependents.
            </p>
          </div>
          <div>
            <h4 className="font-semibold text-lg mb-3">What expenses should I include?</h4>
            <p className="text-muted-foreground">
              Include only personal, non-discretionary costs: housing, utilities, food, transportation, minimum debt payments, insurance, and other essentials. Exclude business expenses and discretionary spending.
            </p>
          </div>
          <div>
            <h4 className="font-semibold text-lg mb-3">Where should I keep my emergency fund?</h4>
            <p className="text-muted-foreground">
              Keep personal emergency funds in a liquid, low-risk account such as a high-yield savings account (HYSA) or money market account. Keep it separate from business accounts so you can access it for personal needs when business income drops.
            </p>
          </div>
          <div>
            <h4 className="font-semibold text-lg mb-3">How does business-owner target compare to freelancer or employee?</h4>
            <p className="text-muted-foreground">
              Business owners and freelancers both have income tied to performance (draw or project income), so base targets are similar (6–12+ months). Employees with stable salary typically aim for 3–6 months (dual income) or 6–12 months (single income). This calculator adjusts for business-specific risk (revenue concentration, industry).</p>
          </div>
          <div>
            <h4 className="font-semibold text-lg mb-3">Should I count business line of credit or savings?</h4>
            <p className="text-muted-foreground">
              Count only personal liquid savings toward this target. Do not rely on business lines of credit or business savings for personal emergencies; those can be revoked or needed for the business. Keep personal and business reserves separate.</p>
          </div>
          <div>
            <h4 className="font-semibold text-lg mb-3">What if my business has a large cash reserve?</h4>
            <p className="text-muted-foreground">
              Business cash is for business obligations (payroll, rent, vendors). For personal emergencies (e.g. family medical, personal job loss if you have other income), use a personal emergency fund. Mixing the two can put the business at risk when you need to draw for personal reasons.</p>
          </div>
          <div>
            <h4 className="font-semibold text-lg mb-3">How often should I revisit my business-owner emergency fund target?</h4>
            <p className="text-muted-foreground">
              Revisit when personal expenses change, income source shifts (e.g. more draw-dependent), revenue concentration changes, or industry risk changes. Also revisit annually; inflation erodes purchasing power.</p>
          </div>
        </CardContent>
      </Card>

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
                <strong className="block text-primary mb-1">Sole Proprietors & Small Business Owners</strong>
                <span className="text-sm text-muted-foreground">To set a personal emergency fund target when income comes from the business (6–12+ months).</span>
              </div>
              <div className="p-3 bg-muted/50 rounded-lg border border-border/50">
                <strong className="block text-primary mb-1">Partners & Draw-Dependent Owners</strong>
                <span className="text-sm text-muted-foreground">To account for revenue concentration and industry risk in the recommended months.</span>
              </div>
              <div className="p-3 bg-muted/50 rounded-lg border border-border/50">
                <strong className="block text-primary mb-1">Startups & High-Risk Industries</strong>
                <span className="text-sm text-muted-foreground">To target 9–12+ months when industry is cyclical or business is early-stage with variable revenue.</span>
              </div>
              <div className="p-3 bg-muted/50 rounded-lg border border-border/50">
                <strong className="block text-primary mb-1">Families with Dependents</strong>
                <span className="text-sm text-muted-foreground">To add months for dependents so personal reserves stay adequate if business income drops.</span>
              </div>
            </div>
          </div>
          <hr className="border-border/50" />
          <div>
            <h4 className="flex items-center gap-2 font-semibold text-lg mb-3">
              <AlertTriangle className="h-5 w-5 text-amber-600" />
              Limitations & Accuracy nuances
            </h4>
            <ul className="space-y-2 text-sm text-muted-foreground">
              <li className="flex gap-2">
                <CheckCircle2 className="h-4 w-4 text-amber-500 shrink-0 mt-0.5" />
                <span><strong>Personal only:</strong> This calculator uses personal essential expenses. Business operating reserves (payroll, rent, vendors) should be planned separately.</span>
              </li>
              <li className="flex gap-2">
                <CheckCircle2 className="h-4 w-4 text-amber-500 shrink-0 mt-0.5" />
                <span><strong>Inflation:</strong> Revisit the target periodically; inflation erodes purchasing power.</span>
              </li>
              <li className="flex gap-2">
                <CheckCircle2 className="h-4 w-4 text-amber-500 shrink-0 mt-0.5" />
                <span><strong>Mixed income:</strong> If you have a stable salary plus business draw, you may use a lower target (e.g. 3–6 months) similar to dual income.</span>
              </li>
            </ul>
          </div>
          <hr className="border-border/50" />
          <div>
            <h4 className="flex items-center gap-2 font-semibold text-lg mb-3">
              <Shield className="h-5 w-5 text-green-600" />
              Real-World Examples
            </h4>
            <div className="space-y-3">
              <div className="p-4 rounded-lg bg-green-50 dark:bg-green-900/10 border border-green-100 dark:border-green-900/20">
                <h5 className="font-semibold text-green-800 dark:text-green-300 mb-1">Case A: Owner with salary plus draw, diversified revenue, stable industry</h5>
                <p className="text-sm text-green-700/80 dark:text-green-400">
                  Base target: 6 months of personal expenses. If monthly personal essentials are $5,000, target fund = $30,000. Build this before relying heavily on draw for lifestyle.
                </p>
              </div>
              <div className="p-4 rounded-lg bg-blue-50 dark:bg-blue-900/10 border border-blue-100 dark:border-blue-900/20">
                <h5 className="font-semibold text-blue-800 dark:text-blue-300 mb-1">Case B: Owner with all draw, one main customer, cyclical industry, 2 dependents</h5>
                <p className="text-sm text-blue-700/80 dark:text-blue-400">
                  All draw + one main + cyclical + dependents: add 6 + 3 + 3 + 3 = 15 months to the base. Target becomes 21 months, capped at 18. If monthly personal essentials are $6,000, target fund = $108,000. Prioritize building this buffer and a separate business reserve.
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
          <p>The Emergency Fund Calculator for Business Owners computes a target fund based on 6–12+ months of personal essential expenses, with income tied to the business and no employer safety net.</p>
          <p>Use it to set and track your personal emergency fund goal; keep business and personal reserves separate.</p>
        </CardContent>
      </Card>
    </div>
  );
}

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
import { Shield, Target, Info, Calculator, DollarSign, BarChart3, Wallet, CheckCircle2, AlertCircle, Users, Briefcase, AlertTriangle, FunctionSquare } from 'lucide-react';
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
  incomeStability: z.enum(['stable-mix', 'variable', 'feast-or-famine']),
  clientConcentration: z.enum(['diversified', 'few-clients', 'one-main']),
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
      name: 'Emergency Fund Calculator for Freelancers',
      applicationCategory: 'FinanceApplication',
      operatingSystem: 'Web Browser',
      description: 'Calculate emergency fund target for freelancers: recommended 6â€“12+ months of essential expenses given variable income, no employer benefits, and client concentration risk.',
      url: 'https://mycalculating.com/finance/emergency-fund-calculator-freelancers',
      offers: { '@type': 'Offer', price: '0', priceCurrency: 'USD' },
    },
  ],
};

export default function EmergencyFundCalculatorFreelancers() {
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
      incomeStability: 'stable-mix',
      clientConcentration: 'diversified',
      dependents: 0,
    },
  });

  const calculate = (v: FormValues) => {
    const monthlyExpenses = (v.housing || 0) + (v.utilities || 0) + (v.food || 0) + (v.transportation || 0) + (v.debtPayments || 0) + (v.insurance || 0) + (v.otherEssentials || 0);
    if (monthlyExpenses === 0) return null;

    // Freelancer base: 6 months (variable income, no employer benefits; one client loss can hurt)
    let recommendedMonths = 6;
    if (v.incomeStability === 'variable') recommendedMonths += 3;
    if (v.incomeStability === 'feast-or-famine') recommendedMonths += 6;
    if (v.clientConcentration === 'few-clients') recommendedMonths += 3;
    if (v.clientConcentration === 'one-main') recommendedMonths += 3;
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
    if (monthsCovered >= recommendedMonths) return 'Freelancer emergency fund is fully funded. Keep funds in a high-yield savings account for liquidity.';
    if (monthsCovered >= 6) return 'You have a partial buffer. Continue building to the recommended 6â€“12+ months for freelancer security.';
    if (monthsCovered >= 3) return 'You have minimal coverage. Freelancers face variable income and client risk; prioritize reaching at least 6 months of expenses.';
    return 'Immediate action required. Freelancers have no employer safety net; build at least 3 months of expenses as a first milestone, then aim for 6â€“12+ months.';
  };

  const getInsights = (v: FormValues, recommendedMonths: number) => {
    const insights = [];
    insights.push('Freelancers have variable income and no employer benefits (no paid leave, no unemployment). A larger emergency fund (6â€“12+ months) is the standard recommendation.');
    if (v.incomeStability === 'variable' || v.incomeStability === 'feast-or-famine') {
      insights.push('Variable or feast-or-famine income increases recommended months (9â€“12+ months).');
    }
    if (v.clientConcentration === 'few-clients' || v.clientConcentration === 'one-main') {
      insights.push('Client concentration (few or one main client) increases risk; target includes additional months.');
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
    if (monthsCovered < 1) warnings.push('Less than 1 month covered: extreme risk for freelancers with variable income.');
    if (monthsCovered < 3) warnings.push('Below 3 months: minimal buffer; freelancers should prioritize reaching at least 6 months.');
    if (monthsCovered < recommendedMonths && monthsCovered >= 3) warnings.push('Below recommended freelancer target (6â€“12+ months).');
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
      <Script id="emergency-fund-freelancers-schema" type="application/ld+json" strategy="afterInteractive" dangerouslySetInnerHTML={{ __html: JSON.stringify(schemaMarkup) }} />

      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <Target className="h-5 w-5" />
            Freelancer Profile
          </CardTitle>
          <CardDescription>
            Enter monthly essential expenses and freelancer-specific risk factors. Freelancers have variable income and no employer safety net; target is typically 6â€“12+ months of expenses.
          </CardDescription>
        </CardHeader>
        <CardContent>
          <Form {...form}>
            <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-6">
              <div className="space-y-4">
                <h3 className="font-semibold text-sm text-primary flex items-center gap-2">
                  <DollarSign className="h-4 w-4" /> Monthly Essential Expenses
                </h3>
                <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
                  <FormField control={form.control} name="housing" render={({ field }) => (
                    <FormItem><FormLabel>Housing (rent/mortgage, tax, insurance)</FormLabel><FormControl><Input type="number" placeholder="e.g., 1800" {...field} value={field.value ?? ''} onChange={e => field.onChange(parseFloat(e.target.value) || 0)} /></FormControl><FormMessage /></FormItem>
                  )} />
                  <FormField control={form.control} name="utilities" render={({ field }) => (
                    <FormItem><FormLabel>Utilities</FormLabel><FormControl><Input type="number" placeholder="e.g., 200" {...field} value={field.value ?? ''} onChange={e => field.onChange(parseFloat(e.target.value) || 0)} /></FormControl><FormMessage /></FormItem>
                  )} />
                  <FormField control={form.control} name="food" render={({ field }) => (
                    <FormItem><FormLabel>Food & Groceries</FormLabel><FormControl><Input type="number" placeholder="e.g., 500" {...field} value={field.value ?? ''} onChange={e => field.onChange(parseFloat(e.target.value) || 0)} /></FormControl><FormMessage /></FormItem>
                  )} />
                  <FormField control={form.control} name="transportation" render={({ field }) => (
                    <FormItem><FormLabel>Transportation</FormLabel><FormControl><Input type="number" placeholder="e.g., 350" {...field} value={field.value ?? ''} onChange={e => field.onChange(parseFloat(e.target.value) || 0)} /></FormControl><FormMessage /></FormItem>
                  )} />
                  <FormField control={form.control} name="debtPayments" render={({ field }) => (
                    <FormItem><FormLabel>Minimum Debt Payments</FormLabel><FormControl><Input type="number" placeholder="e.g., 400" {...field} value={field.value ?? ''} onChange={e => field.onChange(parseFloat(e.target.value) || 0)} /></FormControl><FormMessage /></FormItem>
                  )} />
                  <FormField control={form.control} name="insurance" render={({ field }) => (
                    <FormItem><FormLabel>Insurance (health, life, etc.)</FormLabel><FormControl><Input type="number" placeholder="e.g., 350" {...field} value={field.value ?? ''} onChange={e => field.onChange(parseFloat(e.target.value) || 0)} /></FormControl><FormMessage /></FormItem>
                  )} />
                  <FormField control={form.control} name="otherEssentials" render={({ field }) => (
                    <FormItem><FormLabel>Other Essentials</FormLabel><FormControl><Input type="number" placeholder="e.g., 200" {...field} value={field.value ?? ''} onChange={e => field.onChange(parseFloat(e.target.value) || 0)} /></FormControl><FormMessage /></FormItem>
                  )} />
                </div>
              </div>

              <div className="space-y-4 pt-4 border-t">
                <h3 className="font-semibold text-sm text-primary flex items-center gap-2">
                  <Shield className="h-4 w-4" /> Savings & Risk (Freelancer)
                </h3>
                <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
                  <FormField control={form.control} name="currentSavings" render={({ field }) => (
                    <FormItem><FormLabel>Current Emergency Savings ($)</FormLabel><FormControl><Input type="number" placeholder="e.g., 15000" {...field} value={field.value ?? ''} onChange={e => field.onChange(parseFloat(e.target.value) || 0)} /></FormControl><FormMessage /></FormItem>
                  )} />
                  <FormField control={form.control} name="incomeStability" render={({ field }) => (
                    <FormItem>
                      <FormLabel>Income Stability</FormLabel>
                      <Select onValueChange={field.onChange} defaultValue={field.value}>
                        <FormControl>
                          <SelectTrigger>
                            <SelectValue placeholder="Select" />
                          </SelectTrigger>
                        </FormControl>
                        <SelectContent>
                          <SelectItem value="stable-mix">Stable mix (recurring + some project)</SelectItem>
                          <SelectItem value="variable">Variable (project-based, seasonal)</SelectItem>
                          <SelectItem value="feast-or-famine">Feast or famine (lumpy income)</SelectItem>
                        </SelectContent>
                      </Select>
                      <FormMessage />
                    </FormItem>
                  )} />
                  <FormField control={form.control} name="clientConcentration" render={({ field }) => (
                    <FormItem>
                      <FormLabel>Client Concentration</FormLabel>
                      <Select onValueChange={field.onChange} defaultValue={field.value}>
                        <FormControl>
                          <SelectTrigger>
                            <SelectValue placeholder="Select" />
                          </SelectTrigger>
                        </FormControl>
                        <SelectContent>
                          <SelectItem value="diversified">Diversified (many clients)</SelectItem>
                          <SelectItem value="few-clients">Few clients (2â€“5 main)</SelectItem>
                          <SelectItem value="one-main">One main client</SelectItem>
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
                  <CardTitle>Emergency Fund Goal (Freelancer)</CardTitle>
                  <CardDescription>Target based on 6â€“12+ months of essential expenses; variable income and no employer safety net</CardDescription>
                </div>
              </div>
            </CardHeader>
            <CardContent className="space-y-6">
              <div className="text-center">
                <p className="text-4xl font-bold text-primary">${result.targetFund.toLocaleString()}</p>
                <p className="text-lg text-muted-foreground mt-2">
                  To cover <span className="font-semibold text-foreground">{result.recommendedMonths} months</span> of essential expenses
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
                <CardDescription>Freelancer-specific</CardDescription>
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
                  <span className="text-sm font-medium">Keep emergency funds in a high-yield savings account (HYSA) for liquidity and some growth.</span>
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
                    <span className="text-sm font-medium text-green-800 dark:text-green-300">Coverage meets or exceeds freelancer recommendation.</span>
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
            Understanding Freelancer Emergency Funds
          </CardTitle>
          <CardDescription>Why 6â€“12+ months for freelancers</CardDescription>
        </CardHeader>
        <CardContent>
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div className="p-4 bg-blue-50 dark:bg-blue-900/10 rounded-lg border border-blue-100 dark:border-blue-900/20">
              <h4 className="font-semibold mb-2 flex items-center gap-2 text-blue-700 dark:text-blue-300">
                <Briefcase className="h-4 w-4" />
                Variable Income & No Employer Safety Net
              </h4>
              <p className="text-sm text-muted-foreground mb-3">
                Freelancers often have lumpy income, no paid leave, and no unemployment insurance. Losing one major client can cut income sharply. That is why the base target is 6 months (higher than dual-income) and often 9â€“12+ months with variable income, client concentration, or dependents.
              </p>
              <ul className="space-y-2">
                <li className="flex items-start gap-2 text-sm text-muted-foreground">
                  <CheckCircle2 className="h-4 w-4 text-blue-500 mt-0.5 shrink-0" />
                  <span>Base: 6 months of essential expenses</span>
                </li>
                <li className="flex items-start gap-2 text-sm text-muted-foreground">
                  <CheckCircle2 className="h-4 w-4 text-blue-500 mt-0.5 shrink-0" />
                  <span>Variable income, client concentration, or dependents: add 3â€“6 months</span>
                </li>
              </ul>
            </div>
            <div className="p-4 bg-amber-50 dark:bg-amber-900/10 rounded-lg border border-amber-100 dark:border-amber-900/20">
              <h4 className="font-semibold mb-2 flex items-center gap-2 text-amber-700 dark:text-amber-300">
                <DollarSign className="h-4 w-4" />
                What Counts as Essential
              </h4>
              <p className="text-sm text-muted-foreground mb-3">
                Housing, utilities, food, transportation, minimum debt payments, insurance (including self-paid health), and other non-discretionary costs. Exclude discretionary spending so the fund covers true essentials only.
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
              Target Fund = Monthly Essential Expenses Ã— Recommended Months
            </p>
            <p className="font-mono text-sm text-center">
              Freelancer base: 6 months. +3 for variable income, +6 for feast-or-famine; +3 for few/one-main client; +3 for dependents (capped 6â€“18 months).
            </p>
          </div>
          <p className="text-sm text-muted-foreground mt-2">
            Months covered = Current savings Ã· Monthly expenses. Gap = Target fund âˆ’ Current savings.
          </p>
        </CardContent>
      </Card>

      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <Calculator className="h-5 w-5" />
            Related Financial Calculators
          </CardTitle>
          <CardDescription>Emergency fund and budgeting tools</CardDescription>
        </CardHeader>
        <CardContent>
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
            <Link href="/emergency-fund-calculator-single-income-households" className="block">
              <Card className="hover:shadow-md transition-shadow cursor-pointer">
                <CardContent className="p-4">
                  <div className="flex items-center gap-3">
                    <Shield className="h-5 w-5 text-blue-600" />
                    <div>
                      <p className="font-medium">Emergency Fund (Single Income)</p>
                      <p className="text-sm text-muted-foreground">6â€“12 months, no backup earner</p>
                    </div>
                  </div>
                </CardContent>
              </Card>
            </Link>
            <Link href="/emergency-fund-calculator-dual-income-families" className="block">
              <Card className="hover:shadow-md transition-shadow cursor-pointer">
                <CardContent className="p-4">
                  <div className="flex items-center gap-3">
                    <Shield className="h-5 w-5 text-green-600" />
                    <div>
                      <p className="font-medium">Emergency Fund (Dual Income)</p>
                      <p className="text-sm text-muted-foreground">3â€“9 months, one income backup</p>
                    </div>
                  </div>
                </CardContent>
              </Card>
            </Link>
            <Link href="/emergency-fund-requirement-calculator" className="block">
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
        <meta itemProp="name" content="Emergency Fund for Freelancers: Why 6â€“12+ Months" />
        <meta itemProp="description" content="How much emergency fund freelancers need: variable income, no employer benefits, client concentration risk. Recommended 6â€“12+ months of essential expenses, with risk adjustments." />
        <meta itemProp="keywords" content="emergency fund freelancer, freelancer emergency fund, how much emergency fund self-employed, 6 months expenses freelancer" />
        <meta itemProp="author" content="MegaCalc Financial Team" />
        <meta itemProp="datePublished" content="2025-10-25" />
        <meta itemProp="url" content="/emergency-fund-calculator-freelancers" />

        <h1 className="text-3xl md:text-4xl font-extrabold text-foreground mb-4" itemProp="headline">Emergency Fund for Freelancers: Why 6â€“12+ Months</h1>
        <p className="text-lg italic text-muted-foreground">Freelancers have variable income and no employer safety net. A larger emergency fund (6â€“12+ months of essential expenses) is the standard recommendation.</p>

        <h2 className="text-2xl font-bold text-foreground mt-8 mb-4">Table of Contents: Jump to a Section</h2>
        <ul className="list-disc ml-6 space-y-2 text-primary">
          <li><a href="#freelancer-risk" className="hover:underline">Why Freelancers Need More</a></li>
          <li><a href="#months-target-freelancer" className="hover:underline">Recommended Months (6â€“12+)</a></li>
          <li><a href="#what-counts-freelancer" className="hover:underline">What Counts as Essential Expenses</a></li>
          <li><a href="#applications-freelancer" className="hover:underline">Using the Emergency Fund Target</a></li>
          <li><a href="#conclusion-freelancer" className="hover:underline">Conclusion</a></li>
        </ul>
        <hr />

        <h2 id="freelancer-risk" className="text-2xl font-bold text-foreground pt-8" itemProp="articleSection">Why Freelancers Need More</h2>
        <p>Freelancers typically have variable or lumpy income, no paid leave, and no unemployment insurance. Losing one major client can cut income sharply. Financial advisors often recommend <strong>6 months</strong> of essential expenses as a minimum for freelancers, and <strong>9â€“12+ months</strong> for highly variable income, client concentration, or dependents.</p>

        <h3 className="text-xl font-semibold text-foreground mt-6">Variable Income & No Employer Safety Net</h3>
        <p>Unlike salaried employees, freelancers do not have a steady paycheck or employer benefits. Income can drop when projects end or clients leave. That is why the base target for freelancers is 6 months (similar to single income) and often 9â€“12+ months when income is variable or client concentration is high.</p>

        <h3 className="text-xl font-semibold text-foreground mt-6">Client Concentration Risk</h3>
        <p>If one client represents a large share of income, losing that client can create a sudden income gap. The calculator adds months when you have few clients or one main client to reflect this risk.</p>

        <hr />

        <h2 id="months-target-freelancer" className="text-2xl font-bold text-foreground pt-8" itemProp="articleSection">Recommended Months (6â€“12+)</h2>
        <p>Base recommendation for freelancers: <strong>6 months</strong>. Add 3 months for variable income, 6 for feast-or-famine; add 3 for few or one main client; add 3 for dependents. Cap at 6â€“18 months. This calculator applies these rules to your expense total and risk profile.</p>

        <h3 className="text-xl font-semibold text-foreground mt-6">The Calculation</h3>
        <div className="overflow-x-auto my-6 p-4 bg-muted border rounded-lg text-center">
          <p className="font-mono text-lg text-destructive font-bold">
            Target Fund = Monthly Essential Expenses Ã— Recommended Months
          </p>
        </div>

        <h3 className="text-xl font-semibold text-foreground mt-6">When to Add More Months</h3>
        <p>Variable or feast-or-famine income increases the chance of income gaps; add 3â€“6 months. Client concentration (few or one main client) adds 3 months. Dependents add 3 months. The calculator adjusts recommended months based on your income stability, client concentration, and number of dependents.</p>

        <hr />

        <h2 id="what-counts-freelancer" className="text-2xl font-bold text-foreground pt-8" itemProp="articleSection">What Counts as Essential Expenses</h2>
        <p>Include only essential, non-discretionary costs: housing (rent/mortgage, tax, insurance), utilities, food and groceries, transportation, minimum debt payments, insurance (including self-paid health), and other essentials. Exclude discretionary spending so the fund covers true necessities during income gaps.</p>

        <h3 className="text-xl font-semibold text-foreground mt-6">Exclude Discretionary Spending</h3>
        <p>Do not include dining out, subscriptions, travel, or other non-essential spending. The emergency fund should cover only what you must pay to maintain housing, food, utilities, debt minimums, and essential insurance.</p>

        <hr />

        <h2 id="applications-freelancer" className="text-2xl font-bold text-foreground pt-8" itemProp="articleSection">Using the Emergency Fund Target</h2>
        <p>Use the target fund and gap to set a savings goal. If the gap is large, prioritize building at least 3 months first, then work toward 6, then 9â€“12+ if your risk profile warrants it. Keep the fund in a high-yield savings account (HYSA) for liquidity and some growth.</p>

        <h3 className="text-xl font-semibold text-foreground mt-6">Where to Keep the Fund</h3>
        <p>Emergency funds should be liquid and low-risk. A HYSA or money market account is typical; avoid tying the fund to stocks or illiquid assets so you can access it quickly during income gaps or emergencies.</p>

        <hr />

        <h2 id="conclusion-freelancer" className="text-2xl font-bold text-foreground pt-8" itemProp="articleSection">Conclusion</h2>
        <p>Freelancers have variable income and no employer safety net; a target of 6â€“12+ months of essential expenses is the standard recommendation, with more months for variable income, client concentration, or dependents. Use this calculator to set your target and track the gap; keep the fund in a liquid, low-risk account.</p>
      </section>

      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <Info className="h-5 w-5" />
            Frequently Asked Questions
          </CardTitle>
          <CardDescription>
            Common questions about emergency funds for freelancers
          </CardDescription>
        </CardHeader>
        <CardContent className="space-y-6">
          <div>
            <h4 className="font-semibold text-lg mb-3">Why is the emergency fund target higher for freelancers?</h4>
            <p className="text-muted-foreground">
              Freelancers have variable or lumpy income, no paid leave, and no unemployment insurance. Losing one major client can cut income sharply. So the base target is 6 months (similar to single income) and often 9â€“12+ months with variable income, client concentration, or dependents.
            </p>
          </div>
          <div>
            <h4 className="font-semibold text-lg mb-3">How many months should a freelancer save?</h4>
            <p className="text-muted-foreground">
              At least 6 months of essential expenses is the standard minimum. With variable or feast-or-famine income, client concentration, or dependents, 9â€“12+ months is often recommended. This calculator adjusts recommended months based on your income stability, client concentration, and number of dependents.
            </p>
          </div>
          <div>
            <h4 className="font-semibold text-lg mb-3">What if I have both freelance and salaried income?</h4>
            <p className="text-muted-foreground">
              If you have a stable salaried job plus freelance side income, you might use a lower target (e.g. 3â€“6 months) similar to dual income. If freelance is your primary or only income, use the freelancer target (6â€“12+ months).
            </p>
          </div>
          <div>
            <h4 className="font-semibold text-lg mb-3">What expenses should I include?</h4>
            <p className="text-muted-foreground">
              Include only essential, non-discretionary costs: housing, utilities, food, transportation, minimum debt payments, insurance (including self-paid health), and other essentials. Exclude discretionary spending so the fund covers true necessities.
            </p>
          </div>
          <div>
            <h4 className="font-semibold text-lg mb-3">Where should I keep my emergency fund?</h4>
            <p className="text-muted-foreground">
              Keep the fund in a liquid, low-risk account such as a high-yield savings account (HYSA) or money market account. Avoid stocks or illiquid assets so you can access the money quickly during income gaps or emergencies.
            </p>
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
                <strong className="block text-primary mb-1">Full-Time Freelancers</strong>
                <span className="text-sm text-muted-foreground">To set an emergency fund target with variable income and no employer safety net (6â€“12+ months).</span>
              </div>
              <div className="p-3 bg-muted/50 rounded-lg border border-border/50">
                <strong className="block text-primary mb-1">Contractors & Gig Workers</strong>
                <span className="text-sm text-muted-foreground">To account for client concentration and income stability in the recommended months.</span>
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
                <span><strong>Expense accuracy:</strong> Use actual or realistic essential expenses; understating expenses understates the target.</span>
              </li>
              <li className="flex gap-2">
                <CheckCircle2 className="h-4 w-4 text-amber-500 shrink-0 mt-0.5" />
                <span><strong>Inflation:</strong> Emergency fund targets should be revisited periodically; inflation erodes purchasing power over time.</span>
              </li>
              <li className="flex gap-2">
                <CheckCircle2 className="h-4 w-4 text-amber-500 shrink-0 mt-0.5" />
                <span><strong>Business vs personal:</strong> This calculator uses personal essential expenses. If you have significant business expenses (e.g. equipment, subcontractors), consider a separate business reserve.</span>
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
                <h5 className="font-semibold text-green-800 dark:text-green-300 mb-1">Case A: Freelancer, stable mix of clients, no dependents</h5>
                <p className="text-sm text-green-700/80 dark:text-green-400">
                  Base target: 6 months of essential expenses. If monthly essentials are $4,000, target fund = $24,000. Build this before focusing heavily on discretionary spending or aggressive investing.
                </p>
              </div>
              <div className="p-4 rounded-lg bg-blue-50 dark:bg-blue-900/10 border border-blue-100 dark:border-blue-900/20">
                <h5 className="font-semibold text-blue-800 dark:text-blue-300 mb-1">Case B: Freelancer, feast-or-famine income, one main client, 1 dependent</h5>
                <p className="text-sm text-blue-700/80 dark:text-blue-400">
                  Variable + client concentration + dependents: add 6 + 3 + 3 = 12 months to the base. Target becomes 18 months (capped). If monthly essentials are $4,500, target fund = $81,000. Prioritize building this buffer.
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
          <p>The Emergency Fund Calculator for Freelancers computes a target fund based on 6â€“12+ months of essential expenses, with variable income and no employer safety net.</p>
          <p>Use it to set and track your emergency fund goal and close the gap to the recommended freelancer target.</p>
        </CardContent>
      </Card>
    </div>
  );
}

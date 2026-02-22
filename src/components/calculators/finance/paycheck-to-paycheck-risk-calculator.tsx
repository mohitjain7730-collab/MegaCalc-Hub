'use client';

import { useState } from 'react';
import Script from 'next/script';
import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import { z } from 'zod';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Form, FormControl, FormField, FormItem, FormLabel, FormMessage } from '@/components/ui/form';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Shield, Target, Info, Calculator, DollarSign, BarChart3, Wallet, CheckCircle2, AlertCircle, Users, Briefcase, AlertTriangle, FunctionSquare } from 'lucide-react';
import { Badge } from '@/components/ui/badge';
import { Alert, AlertDescription } from '@/components/ui/alert';
import Link from 'next/link';

const formSchema = z.object({
  monthlyIncome: z.number().min(0.01, 'Enter monthly take-home income'),
  monthlyExpenses: z.number().min(0, 'Enter monthly essential expenses'),
  liquidSavings: z.number().min(0, 'Enter current liquid savings'),
}).refine((data) => data.monthlyIncome > 0, { message: 'Income must be greater than 0', path: ['monthlyIncome'] });

type FormValues = z.infer<typeof formSchema>;

const schemaMarkup = {
  '@context': 'https://schema.org',
  '@graph': [
    {
      '@type': 'SoftwareApplication',
      name: 'Paycheck-to-Paycheck Risk Calculator',
      applicationCategory: 'FinanceApplication',
      operatingSystem: 'Web Browser',
      description: 'Assess paycheck-to-paycheck risk: expense-to-income ratio, months of buffer, and risk level. See how close your income is to covering essential expenses and how much buffer you have.',
      url: 'https://mycalculating.com/finance/paycheck-to-paycheck-risk-calculator',
      offers: { '@type': 'Offer', price: '0', priceCurrency: 'USD' },
    },
  ],
};

export default function PaycheckToPaycheckRiskCalculator() {
  const [result, setResult] = useState<{
    expenseToIncomeRatio: number;
    monthsOfBuffer: number;
    riskLevel: string;
    marginAfterExpenses: number;
    recommendation: string;
    insights: string[];
  } | null>(null);

  const form = useForm<FormValues>({
    resolver: zodResolver(formSchema),
    defaultValues: {
      monthlyIncome: undefined,
      monthlyExpenses: undefined,
      liquidSavings: undefined,
    },
  });

  const calculate = (v: FormValues) => {
    const income = v.monthlyIncome || 0;
    const expenses = v.monthlyExpenses || 0;
    const savings = v.liquidSavings || 0;
    if (income <= 0) return null;

    const expenseToIncomeRatio = expenses > 0 ? (expenses / income) * 100 : 0;
    const monthsOfBuffer = expenses > 0 ? savings / expenses : (savings > 0 ? 999 : 0);
    const marginAfterExpenses = income - expenses;

    let riskLevel = 'Low';
    if (expenseToIncomeRatio >= 95 || monthsOfBuffer < 1) riskLevel = 'High';
    else if (expenseToIncomeRatio >= 80 || monthsOfBuffer < 2) riskLevel = 'Medium';

    return {
      expenseToIncomeRatio,
      monthsOfBuffer,
      riskLevel,
      marginAfterExpenses,
      recommendation: '',
      insights: [] as string[],
    };
  };

  const getRecommendation = (r: NonNullable<ReturnType<typeof calculate>>) => {
    if (r.riskLevel === 'High') {
      return 'You are at high paycheck-to-paycheck risk: expenses consume most or all of income and you have little or no buffer. Prioritize cutting non-essential spending, building at least 1 month of expenses in savings, and increasing income or reducing fixed costs.';
    }
    if (r.riskLevel === 'Medium') {
      return 'You have moderate paycheck-to-paycheck risk: expenses are a high share of income or your buffer is thin. Aim to build at least 2â€“3 months of expenses in savings and reduce the expense-to-income ratio below 80% to lower risk.';
    }
    return 'You have lower paycheck-to-paycheck risk: you have margin after expenses and some buffer. Continue building an emergency fund (3â€“6+ months of expenses) and keep the expense-to-income ratio under 80% to stay resilient.';
  };

  const getInsights = (v: FormValues, r: NonNullable<ReturnType<typeof calculate>>) => {
    const insights = [];
    if (r.expenseToIncomeRatio >= 95) {
      insights.push('Expenses are 95% or more of income; one missed paycheck or unexpected expense can cause shortfall.');
    }
    if (r.expenseToIncomeRatio >= 80 && r.expenseToIncomeRatio < 95) {
      insights.push('Expenses are 80â€“95% of income; little margin for savings or emergencies. Reducing fixed costs or increasing income will help.');
    }
    if (r.monthsOfBuffer < 1 && v.liquidSavings !== undefined) {
      insights.push('Less than 1 month of expenses in savings; high vulnerability to income disruption or emergency.');
    }
    if (r.monthsOfBuffer >= 1 && r.monthsOfBuffer < 3) {
      insights.push('You have 1â€“3 months of buffer; building to 3â€“6 months will significantly reduce paycheck-to-paycheck risk.');
    }
    const income = v.monthlyIncome || 0;
    if (income > 0 && r.marginAfterExpenses > 0 && r.marginAfterExpenses < income * 0.2) {
      insights.push('Margin after essential expenses is under 20% of income; consider redirecting some of this to savings before discretionary spending.');
    }
    return insights;
  };

  const onSubmit = (values: FormValues) => {
    const res = calculate(values);
    if (res) {
      setResult({
        ...res,
        recommendation: getRecommendation(res),
        insights: getInsights(values, res),
      });
    }
  };

  return (
    <div className="space-y-8">
      <Script id="paycheck-risk-schema" type="application/ld+json" strategy="afterInteractive" dangerouslySetInnerHTML={{ __html: JSON.stringify(schemaMarkup) }} />

      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <Target className="h-5 w-5" />
            Paycheck-to-Paycheck Risk Profile
          </CardTitle>
          <CardDescription>
            Enter monthly take-home income, monthly essential expenses, and current liquid savings. The calculator shows your expense-to-income ratio, months of buffer, and risk level.
          </CardDescription>
        </CardHeader>
        <CardContent>
          <Form {...form}>
            <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-6">
              <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
                <FormField control={form.control} name="monthlyIncome" render={({ field }) => (
                  <FormItem>
                    <FormLabel>Monthly Take-Home Income ($)</FormLabel>
                    <FormControl>
                      <Input type="number" placeholder="e.g., 4500" {...field} value={field.value ?? ''} onChange={e => field.onChange(parseFloat(e.target.value) || 0)} />
                    </FormControl>
                    <FormMessage />
                  </FormItem>
                )} />
                <FormField control={form.control} name="monthlyExpenses" render={({ field }) => (
                  <FormItem>
                    <FormLabel>Monthly Essential Expenses ($)</FormLabel>
                    <FormControl>
                      <Input type="number" placeholder="e.g., 3800" {...field} value={field.value ?? ''} onChange={e => field.onChange(parseFloat(e.target.value) || 0)} />
                    </FormControl>
                    <FormMessage />
                  </FormItem>
                )} />
                <FormField control={form.control} name="liquidSavings" render={({ field }) => (
                  <FormItem>
                    <FormLabel>Current Liquid Savings ($)</FormLabel>
                    <FormControl>
                      <Input type="number" placeholder="e.g., 2000" {...field} value={field.value ?? ''} onChange={e => field.onChange(parseFloat(e.target.value) || 0)} />
                    </FormControl>
                    <FormMessage />
                  </FormItem>
                )} />
              </div>

              <Button type="submit" className="w-full">
                <Calculator className="mr-2 h-4 w-4" />
                Calculate Paycheck-to-Paycheck Risk
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
                <AlertCircle className="h-8 w-8 text-primary" />
                <div>
                  <CardTitle>Risk Result</CardTitle>
                  <CardDescription>Expense-to-income ratio, buffer, and risk level</CardDescription>
                </div>
              </div>
            </CardHeader>
            <CardContent className="space-y-6">
              <div className="text-center">
                <Badge variant={result.riskLevel === 'High' ? 'destructive' : result.riskLevel === 'Medium' ? 'secondary' : 'default'} className="text-lg px-4 py-2">
                  {result.riskLevel} Risk
                </Badge>
                <p className="text-sm text-muted-foreground mt-2">{result.recommendation}</p>
              </div>

              <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                <div className="text-center p-4 bg-muted/50 rounded-lg">
                  <BarChart3 className="h-6 w-6 mx-auto mb-2 text-blue-600" />
                  <p className="font-semibold">Expense-to-Income Ratio</p>
                  <p className="text-lg font-bold">{result.expenseToIncomeRatio.toFixed(1)}%</p>
                  <p className="text-xs text-muted-foreground">Essential expenses Ã· income</p>
                </div>
                <div className="text-center p-4 bg-muted/50 rounded-lg">
                  <Wallet className="h-6 w-6 mx-auto mb-2 text-green-600" />
                  <p className="font-semibold">Months of Buffer</p>
                  <p className="text-lg font-bold">{result.monthsOfBuffer >= 999 ? 'â€”' : result.monthsOfBuffer.toFixed(1)}</p>
                  <p className="text-xs text-muted-foreground">Savings Ã· monthly expenses</p>
                </div>
                <div className="text-center p-4 bg-muted/50 rounded-lg">
                  <DollarSign className="h-6 w-6 mx-auto mb-2 text-purple-600" />
                  <p className="font-semibold">Margin After Expenses</p>
                  <p className="text-lg font-bold">${result.marginAfterExpenses.toLocaleString()}</p>
                  <p className="text-xs text-muted-foreground">Income âˆ’ essential expenses</p>
                </div>
              </div>

              <Alert className={result.riskLevel === 'High' ? 'border-red-200 bg-red-50 dark:bg-red-900/10' : result.riskLevel === 'Medium' ? 'border-amber-200 bg-amber-50 dark:bg-amber-900/10' : 'border-green-200 bg-green-50 dark:bg-green-900/10'}>
                <Info className="h-4 w-4" />
                <AlertDescription>
                  <strong>Recommendation:</strong> {result.recommendation}
                </AlertDescription>
              </Alert>

              {result.insights.length > 0 && (
                <div className="space-y-2">
                  <h4 className="font-semibold flex items-center gap-2">
                    <Target className="h-4 w-4" />
                    Insights
                  </h4>
                  <ul className="space-y-2">
                    {result.insights.map((insight, index) => (
                      <li key={index} className="flex items-start gap-2 p-3 bg-primary/5 rounded-lg border border-primary/10 text-sm">
                        <CheckCircle2 className="h-4 w-4 text-primary mt-0.5 shrink-0" />
                        {insight}
                      </li>
                    ))}
                  </ul>
                </div>
              )}
            </CardContent>
          </Card>
        </div>
      )}

      <Card className="mb-6">
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <Info className="h-5 w-5" />
            Understanding Paycheck-to-Paycheck Risk
          </CardTitle>
          <CardDescription>What this calculator measures</CardDescription>
        </CardHeader>
        <CardContent>
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div className="p-4 bg-blue-50 dark:bg-blue-900/10 rounded-lg border border-blue-100 dark:border-blue-900/20">
              <h4 className="font-semibold mb-2 flex items-center gap-2 text-blue-700 dark:text-blue-300">
                <DollarSign className="h-4 w-4" />
                Expense-to-Income Ratio
              </h4>
              <p className="text-sm text-muted-foreground mb-3">
                The share of take-home income consumed by essential expenses. When this ratio is 95% or higher, you are effectively living paycheck to paycheck: little or no margin for savings or emergencies. A ratio under 80% leaves room for savings and buffers.
              </p>
            </div>
            <div className="p-4 bg-amber-50 dark:bg-amber-900/10 rounded-lg border border-amber-100 dark:border-amber-900/20">
              <h4 className="font-semibold mb-2 flex items-center gap-2 text-amber-700 dark:text-amber-300">
                <Wallet className="h-4 w-4" />
                Months of Buffer
              </h4>
              <p className="text-sm text-muted-foreground mb-3">
                How many months of essential expenses your current liquid savings could cover. Less than 1 month means one missed paycheck or emergency can cause shortfall. Building to 3â€“6 months significantly reduces paycheck-to-paycheck risk.
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
              Expense-to-Income Ratio (%) = (Monthly Essential Expenses Ã· Monthly Take-Home Income) Ã— 100
            </p>
            <p className="font-mono text-sm text-center">
              Months of Buffer = Current Liquid Savings Ã· Monthly Essential Expenses
            </p>
            <p className="font-mono text-sm text-center">
              Risk: High if ratio â‰¥ 95% or buffer &lt; 1 month; Medium if ratio â‰¥ 80% or buffer &lt; 2 months; otherwise Low.
            </p>
          </div>
        </CardContent>
      </Card>

      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <Calculator className="h-5 w-5" />
            Related Financial Calculators
          </CardTitle>
          <CardDescription>Emergency fund and budget tools</CardDescription>
        </CardHeader>
        <CardContent>
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
            <Link href="/emergency-fund-requirement-calculator" className="block">
              <Card className="hover:shadow-md transition-shadow cursor-pointer">
                <CardContent className="p-4">
                  <div className="flex items-center gap-3">
                    <Shield className="h-5 w-5 text-blue-600" />
                    <div>
                      <p className="font-medium">Emergency Fund Requirement</p>
                      <p className="text-sm text-muted-foreground">How much to save</p>
                    </div>
                  </div>
                </CardContent>
              </Card>
            </Link>
            <Link href="/emergency-fund-calculator-business-owners" className="block">
              <Card className="hover:shadow-md transition-shadow cursor-pointer">
                <CardContent className="p-4">
                  <div className="flex items-center gap-3">
                    <Shield className="h-5 w-5 text-green-600" />
                    <div>
                      <p className="font-medium">Emergency Fund (Business Owners)</p>
                      <p className="text-sm text-muted-foreground">6â€“12+ months, business risk</p>
                    </div>
                  </div>
                </CardContent>
              </Card>
            </Link>
            <Link href="/monthly-budget-planner-calculator" className="block">
              <Card className="hover:shadow-md transition-shadow cursor-pointer">
                <CardContent className="p-4">
                  <div className="flex items-center gap-3">
                    <BarChart3 className="h-5 w-5 text-purple-600" />
                    <div>
                      <p className="font-medium">Monthly Budget Planner</p>
                      <p className="text-sm text-muted-foreground">Track income and expenses</p>
                    </div>
                  </div>
                </CardContent>
              </Card>
            </Link>
          </div>
        </CardContent>
      </Card>

      <section className="space-y-6 text-muted-foreground leading-relaxed bg-card p-6 md:p-10 rounded-lg shadow-lg" itemScope itemType="https://schema.org/FinanceSummary">
        <meta itemProp="name" content="Paycheck-to-Paycheck Risk: What It Is and How to Reduce It" />
        <meta itemProp="description" content="Understand paycheck-to-paycheck risk: expense-to-income ratio, months of buffer, and how to reduce risk with savings and lower expense ratio." />
        <meta itemProp="keywords" content="paycheck to paycheck risk, expense to income ratio, living paycheck to paycheck, financial buffer, months of expenses" />
        <meta itemProp="author" content="MegaCalc Financial Team" />
        <meta itemProp="datePublished" content="2025-10-25" />
        <meta itemProp="url" content="/paycheck-to-paycheck-risk-calculator" />

        <h1 className="text-3xl md:text-4xl font-extrabold text-foreground mb-4" itemProp="headline">Paycheck-to-Paycheck Risk: What It Is and How to Reduce It</h1>
        <p className="text-lg italic text-muted-foreground">Living paycheck to paycheck means essential expenses consume most or all of income, with little or no buffer. This calculator measures your expense-to-income ratio and months of buffer to assess risk.</p>

        <h2 className="text-2xl font-bold text-foreground mt-8 mb-4">Table of Contents: Jump to a Section</h2>
        <ul className="list-disc ml-6 space-y-2 text-primary">
          <li><a href="#what-is-ptp" className="hover:underline">What Is Paycheck-to-Paycheck Risk?</a></li>
          <li><a href="#how-measured" className="hover:underline">How Risk Is Measured</a></li>
          <li><a href="#reduce-risk" className="hover:underline">How to Reduce Risk</a></li>
          <li><a href="#applications-ptp" className="hover:underline">Using This Calculator</a></li>
          <li><a href="#conclusion-ptp" className="hover:underline">Conclusion</a></li>
        </ul>
        <hr />

        <h2 id="what-is-ptp" className="text-2xl font-bold text-foreground pt-8" itemProp="articleSection">What Is Paycheck-to-Paycheck Risk?</h2>
        <p>Paycheck-to-paycheck means your income barely covers or does not cover essential expenses, leaving little or no margin for savings or emergencies. One missed paycheck, medical bill, or car repair can cause shortfall or debt.</p>

        <h3 className="text-xl font-semibold text-foreground mt-6">Why It Matters</h3>
        <p>High expense-to-income ratios and low savings buffers increase stress and vulnerability. Reducing the ratio (by cutting expenses or increasing income) and building a buffer (3â€“6 months of expenses) significantly lowers paycheck-to-paycheck risk.</p>

        <h3 className="text-xl font-semibold text-foreground mt-6">Who Is Most at Risk</h3>
        <p>Households with essential expenses at or above 95% of take-home income, or with less than 1 month of expenses in liquid savings, are at high risk. Moderate risk typically means 80â€“95% expense ratio or 1â€“2 months of buffer.</p>

        <hr />

        <h2 id="how-measured" className="text-2xl font-bold text-foreground pt-8" itemProp="articleSection">How Risk Is Measured</h2>
        <p>This calculator uses two main metrics: <strong>expense-to-income ratio</strong> (essential expenses Ã· take-home income) and <strong>months of buffer</strong> (liquid savings Ã· monthly essential expenses). High risk: ratio â‰¥ 95% or buffer &lt; 1 month. Medium risk: ratio â‰¥ 80% or buffer &lt; 2 months. Otherwise, risk is lower.</p>

        <h3 className="text-xl font-semibold text-foreground mt-6">Expense-to-Income Ratio</h3>
        <p>The ratio shows what share of income goes to essential expenses. When it is 95% or higher, almost all income is committed; when it is under 80%, there is room for savings and emergencies.</p>

        <h3 className="text-xl font-semibold text-foreground mt-6">Months of Buffer</h3>
        <p>Liquid savings divided by monthly essential expenses gives how many months you could cover expenses without income. Less than 1 month is high risk; 3â€“6 months is a common target for resilience.</p>

        <hr />

        <h2 id="reduce-risk" className="text-2xl font-bold text-foreground pt-8" itemProp="articleSection">How to Reduce Risk</h2>
        <p>Reduce paycheck-to-paycheck risk by: (1) lowering essential expenses or increasing income so the expense-to-income ratio falls below 80%; (2) building liquid savings to at least 3â€“6 months of essential expenses; (3) avoiding new high-interest debt.</p>

        <h3 className="text-xl font-semibold text-foreground mt-6">Increase Margin</h3>
        <p>Cut non-essential spending, refinance or pay down debt to reduce minimum payments, or increase income (side income, raise, or better job). Even a small increase in margin can be directed to savings.</p>

        <h3 className="text-xl font-semibold text-foreground mt-6">Build Buffer First</h3>
        <p>Prioritize building at least 1 month of expenses, then 2â€“3, then 3â€“6 months. Keep the buffer in a high-yield savings account or other liquid account so it is available in an emergency.</p>

        <hr />

        <h2 id="applications-ptp" className="text-2xl font-bold text-foreground pt-8" itemProp="articleSection">Using This Calculator</h2>
        <p>Enter monthly take-home income, monthly essential expenses, and current liquid savings. Use the expense-to-income ratio and months of buffer to see your risk level. Track progress over time as you reduce expenses or increase savings.</p>

        <h3 className="text-xl font-semibold text-foreground mt-6">What Counts as Essential Expenses</h3>
        <p>Use the same essential expenses you would use for an emergency fund: housing, utilities, food, transportation, minimum debt payments, insurance, and other necessities. Exclude discretionary spending.</p>

        <hr />

        <h2 id="conclusion-ptp" className="text-2xl font-bold text-foreground pt-8" itemProp="articleSection">Conclusion</h2>
        <p>Paycheck-to-paycheck risk is driven by high expense-to-income ratios and low savings buffers. Use this calculator to measure your ratio and buffer, then work to bring the ratio below 80% and build at least 3â€“6 months of expenses in liquid savings to reduce risk.</p>
      </section>

      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <Info className="h-5 w-5" />
            Frequently Asked Questions
          </CardTitle>
          <CardDescription>
            Common questions about paycheck-to-paycheck risk
          </CardDescription>
        </CardHeader>
        <CardContent className="space-y-6">
          <div>
            <h4 className="font-semibold text-lg mb-3">What does expense-to-income ratio mean?</h4>
            <p className="text-muted-foreground">
              It is the percentage of your take-home income that goes to essential expenses. If expenses are $3,800 and income is $4,500, the ratio is about 84%. A ratio of 95% or higher means you are effectively living paycheck to paycheck; under 80% leaves room for savings.
            </p>
          </div>
          <div>
            <h4 className="font-semibold text-lg mb-3">What is a good months-of-buffer number?</h4>
            <p className="text-muted-foreground">
              Financial advisors often recommend 3â€“6 months of essential expenses in liquid savings. Less than 1 month is high risk; 1â€“2 months is moderate risk. Building to 3â€“6 months significantly reduces vulnerability to income loss or emergencies.
            </p>
          </div>
          <div>
            <h4 className="font-semibold text-lg mb-3">What if my margin after expenses is negative?</h4>
            <p className="text-muted-foreground">
              If essential expenses exceed income, you are covering the gap with savings or debt. That is unsustainable. Prioritize cutting essential expenses where possible, increasing income, or both, until margin is positive, then build a buffer.
            </p>
          </div>
          <div>
            <h4 className="font-semibold text-lg mb-3">Should I use gross or take-home income?</h4>
            <p className="text-muted-foreground">
              Use take-home (net) income, after taxes and deductions. Essential expenses are paid from take-home pay, so the ratio and margin should be based on what you actually have available to spend.
            </p>
          </div>
          <div>
            <h4 className="font-semibold text-lg mb-3">How often should I check my paycheck-to-paycheck risk?</h4>
            <p className="text-muted-foreground">
              Recheck when income or expenses change (new job, raise, rent change, debt payoff) or quarterly. Tracking over time helps you see if you are reducing the ratio and building buffer.
            </p>
          </div>
          <div>
            <h4 className="font-semibold text-lg mb-3">What if my income varies month to month?</h4>
            <p className="text-muted-foreground">
              Use an average or conservative (lower) estimate of monthly take-home income. If you have a slow month, your ratio will be worse than the average suggests; planning on the conservative side helps you stay resilient.</p>
          </div>
          <div>
            <h4 className="font-semibold text-lg mb-3">Does the calculator include discretionary spending?</h4>
            <p className="text-muted-foreground">
              No. Use only essential expenses (housing, utilities, food, debt minimums, insurance, etc.). Discretionary spending (dining out, subscriptions, travel) should not be in the ratio; the goal is to see if income covers necessities and how much buffer you have.</p>
          </div>
          <div>
            <h4 className="font-semibold text-lg mb-3">How does this relate to an emergency fund?</h4>
            <p className="text-muted-foreground">
              Months of buffer is the same idea as an emergency fund: liquid savings Ã· monthly essential expenses. This calculator shows your risk level; building to 3â€“6 months of buffer is the standard emergency fund target and significantly lowers paycheck-to-paycheck risk.</p>
          </div>
          <div>
            <h4 className="font-semibold text-lg mb-3">What if I have negative margin (expenses exceed income)?</h4>
            <p className="text-muted-foreground">
              You are covering the gap with savings or debt, which is unsustainable. Prioritize cutting essential expenses where possible and increasing income. Until margin is positive, focus on stopping the bleed before targeting a specific buffer size.</p>
          </div>
          <div>
            <h4 className="font-semibold text-lg mb-3">Why use take-home income instead of gross?</h4>
            <p className="text-muted-foreground">
              Essential expenses (rent, utilities, debt payments) are paid from take-home pay, not gross. Using gross would understate your expense-to-income ratio and overstate how much room you have. Take-home gives a true picture of paycheck-to-paycheck risk.</p>
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
                <strong className="block text-primary mb-1">Households Living Paycheck to Paycheck</strong>
                <span className="text-sm text-muted-foreground">To see expense-to-income ratio and buffer and get a clear risk level and next steps.</span>
              </div>
              <div className="p-3 bg-muted/50 rounded-lg border border-border/50">
                <strong className="block text-primary mb-1">Anyone Building an Emergency Fund</strong>
                <span className="text-sm text-muted-foreground">To track progress: as buffer grows and ratio falls, risk drops.</span>
              </div>
              <div className="p-3 bg-muted/50 rounded-lg border border-border/50">
                <strong className="block text-primary mb-1">Budgeters & Planners</strong>
                <span className="text-sm text-muted-foreground">To quantify how close income is to expenses and set targets (e.g. ratio below 80%, buffer 3â€“6 months).</span>
              </div>
              <div className="p-3 bg-muted/50 rounded-lg border border-border/50">
                <strong className="block text-primary mb-1">After a Job or Income Change</strong>
                <span className="text-sm text-muted-foreground">To reassess risk when income or expenses change so you know whether to cut spending or can save more.</span>
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
                <span><strong>Essential expenses:</strong> Use consistent, realistic essential expenses; including discretionary spending overstates the ratio.</span>
              </li>
              <li className="flex gap-2">
                <CheckCircle2 className="h-4 w-4 text-amber-500 shrink-0 mt-0.5" />
                <span><strong>Income:</strong> Use stable monthly take-home income; if income varies, consider an average or conservative estimate.</span>
              </li>
              <li className="flex gap-2">
                <CheckCircle2 className="h-4 w-4 text-amber-500 shrink-0 mt-0.5" />
                <span><strong>Liquid savings:</strong> Include only accessible savings (e.g. checking, savings); exclude retirement or illiquid assets.</span>
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
                <h5 className="font-semibold text-green-800 dark:text-green-300 mb-1">Case A: Income $4,500, expenses $3,600, savings $1,000</h5>
                <p className="text-sm text-green-700/80 dark:text-green-400">
                  Ratio = 80% (medium risk). Buffer = 0.3 months (high risk). Overall: medium/high. Recommendation: build savings to at least 1 month ($3,600), then 3 months; consider reducing expenses to get ratio below 80%.
                </p>
              </div>
              <div className="p-4 rounded-lg bg-blue-50 dark:bg-blue-900/10 border border-blue-100 dark:border-blue-900/20">
                <h5 className="font-semibold text-blue-800 dark:text-blue-300 mb-1">Case B: Income $5,000, expenses $3,500, savings $12,000</h5>
                <p className="text-sm text-blue-700/80 dark:text-blue-400">
                  Ratio = 70% (low risk). Buffer = 3.4 months (low risk). Margin = $1,500/month. Continue building to 6 months buffer and keep ratio under 80%.
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
          <p>The Paycheck-to-Paycheck Risk Calculator assesses risk using your expense-to-income ratio and months of buffer. High risk: ratio â‰¥ 95% or buffer &lt; 1 month. Reduce risk by lowering the ratio and building 3â€“6 months of expenses in liquid savings.</p>
          <p>Use it to see your risk level and track progress as you increase margin and buffer.</p>
        </CardContent>
      </Card>
    </div>
  );
}

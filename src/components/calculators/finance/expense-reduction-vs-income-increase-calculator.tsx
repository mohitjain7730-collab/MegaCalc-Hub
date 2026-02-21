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
import { Scale, Info, Calculator, DollarSign, TrendingUp, TrendingDown, Target, CheckCircle2, Users, Briefcase, AlertTriangle, FunctionSquare, Landmark, Shield } from 'lucide-react';
import { Badge } from '@/components/ui/badge';
import { Alert, AlertDescription } from '@/components/ui/alert';
import Link from 'next/link';

const formSchema = z.object({
  monthlyTakeHome: z.number().min(0.01, 'Enter monthly take-home income'),
  monthlyExpenses: z.number().min(0, 'Enter monthly expenses'),
  targetAdditionalSavings: z.number().min(0.01, 'Enter target additional monthly savings'),
  marginalTaxRatePct: z.number().min(0).max(50).optional(),
}).refine((data) => data.monthlyTakeHome >= (data.monthlyExpenses ?? 0), {
  message: 'Take-home should be at least as large as expenses',
  path: ['monthlyTakeHome'],
});

type FormValues = z.infer<typeof formSchema>;

const schemaMarkup = {
  '@context': 'https://schema.org',
  '@graph': [
    {
      '@type': 'SoftwareApplication',
      name: 'Expense Reduction vs Income Increase Calculator',
      applicationCategory: 'FinanceApplication',
      operatingSystem: 'Web Browser',
      description: 'Compare two ways to boost monthly savings: cut expenses by $X (1:1) or increase income by the equivalent. Shows gross income needed if you enter marginal tax rate.',
      url: 'https://mycalculating.com/finance/expense-reduction-vs-income-increase-calculator',
      offers: { '@type': 'Offer', price: '0', priceCurrency: 'USD' },
    },
  ],
};

export default function ExpenseReductionVsIncomeIncreaseCalculator() {
  const [result, setResult] = useState<{
    expenseCutNeeded: number;
    takeHomeIncreaseNeeded: number;
    grossIncreaseNeeded: number | null;
    currentSavings: number;
    currentSavingsRatePct: number;
    afterExpenseReductionSavingsRatePct: number;
    afterIncomeIncreaseSavingsRatePct: number;
    recommendation: string;
    insights: string[];
  } | null>(null);

  const form = useForm<FormValues>({
    resolver: zodResolver(formSchema),
    defaultValues: {
      monthlyTakeHome: undefined,
      monthlyExpenses: undefined,
      targetAdditionalSavings: undefined,
      marginalTaxRatePct: undefined,
    },
  });

  const calculate = (v: FormValues) => {
    const income = v.monthlyTakeHome ?? 0;
    const expenses = v.monthlyExpenses ?? 0;
    const target = v.targetAdditionalSavings ?? 0;
    const taxPct = v.marginalTaxRatePct != null && v.marginalTaxRatePct > 0 ? v.marginalTaxRatePct / 100 : null;
    if (income <= 0 || target <= 0) return null;

    const currentSavings = Math.max(0, income - expenses);
    const currentSavingsRatePct = income > 0 ? (currentSavings / income) * 100 : 0;
    const expenseCutNeeded = target;
    const takeHomeIncreaseNeeded = target;
    const grossIncreaseNeeded = taxPct != null && taxPct < 1 ? target / (1 - taxPct) : null;
    const afterExpenseReductionSavingsRatePct = income > 0 ? ((currentSavings + target) / income) * 100 : 0;
    const newIncome = income + takeHomeIncreaseNeeded;
    const afterIncomeIncreaseSavingsRatePct = newIncome > 0 ? ((currentSavings + target) / newIncome) * 100 : 0;

    let recommendation = '';
    recommendation = `To save an extra $${target.toFixed(0)}/month: either reduce expenses by $${expenseCutNeeded.toFixed(0)}/month (1:1), or increase take-home by $${takeHomeIncreaseNeeded.toFixed(0)}/month.`;
    if (grossIncreaseNeeded != null && grossIncreaseNeeded > takeHomeIncreaseNeeded) {
      recommendation += ` With a ${(v.marginalTaxRatePct ?? 0)}% marginal tax rate, you'd need to earn about $${grossIncreaseNeeded.toFixed(0)}/month more gross to get $${target.toFixed(0)} more take-home.`;
    }
    recommendation += ' Expense reduction is 1:1 (cut $1 = save $1); income increase requires earning more if taxes apply.';

    const insights: string[] = [];
    insights.push(`Option A â€” Expense reduction: Cut spending by $${expenseCutNeeded.toFixed(0)}/month ($${(expenseCutNeeded * 12).toFixed(0)}/year) to add $${target.toFixed(0)}/month to savings.`);
    insights.push(`Option B â€” Income increase: Increase take-home by $${takeHomeIncreaseNeeded.toFixed(0)}/month ($${(takeHomeIncreaseNeeded * 12).toFixed(0)}/year) and save it; same $${target.toFixed(0)}/month added to savings.`);
    if (grossIncreaseNeeded != null) {
      insights.push(`With ${v.marginalTaxRatePct}% marginal tax: you need ~$${grossIncreaseNeeded.toFixed(0)}/month more gross ($${(grossIncreaseNeeded * 12).toFixed(0)}/year) to get $${target.toFixed(0)} more take-home.`);
    }
    insights.push(`Current savings rate: ${currentSavingsRatePct.toFixed(1)}%. After achieving +$${target.toFixed(0)}/month: ${afterExpenseReductionSavingsRatePct.toFixed(1)}% (expense cut) or ${afterIncomeIncreaseSavingsRatePct.toFixed(1)}% (income increase).`);

    return {
      expenseCutNeeded,
      takeHomeIncreaseNeeded,
      grossIncreaseNeeded,
      currentSavings,
      currentSavingsRatePct,
      afterExpenseReductionSavingsRatePct,
      afterIncomeIncreaseSavingsRatePct,
      recommendation,
      insights,
    };
  };

  const onSubmit = (values: FormValues) => {
    const res = calculate(values);
    if (res) setResult(res);
  };

  return (
    <div className="space-y-8">
      <Script id="expense-reduction-vs-income-schema" type="application/ld+json" strategy="afterInteractive" dangerouslySetInnerHTML={{ __html: JSON.stringify(schemaMarkup) }} />

      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <Scale className="h-5 w-5" />
            Expense Reduction vs Income Increase
          </CardTitle>
          <CardDescription>
            To add the same amount to monthly savings, you can either cut expenses (1:1) or increase take-home income. Enter your take-home, expenses, target additional savings, and optional marginal tax rate to see the exact expense cut or gross income increase needed.
          </CardDescription>
        </CardHeader>
        <CardContent>
          <Form {...form}>
            <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-6">
              <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
                <FormField control={form.control} name="monthlyTakeHome" render={({ field }) => (
                  <FormItem>
                    <FormLabel>Monthly Take-Home Income ($)</FormLabel>
                    <FormControl>
                      <Input type="number" min={0} placeholder="e.g., 5000" {...field} value={field.value ?? ''} onChange={e => field.onChange(parseFloat(e.target.value) || 0)} />
                    </FormControl>
                    <FormMessage />
                  </FormItem>
                )} />
                <FormField control={form.control} name="monthlyExpenses" render={({ field }) => (
                  <FormItem>
                    <FormLabel>Monthly Expenses ($)</FormLabel>
                    <FormControl>
                      <Input type="number" min={0} placeholder="e.g., 3800" {...field} value={field.value ?? ''} onChange={e => field.onChange(parseFloat(e.target.value) || 0)} />
                    </FormControl>
                    <FormMessage />
                  </FormItem>
                )} />
                <FormField control={form.control} name="targetAdditionalSavings" render={({ field }) => (
                  <FormItem>
                    <FormLabel>Target Additional Monthly Savings ($)</FormLabel>
                    <FormControl>
                      <Input type="number" min={0} placeholder="e.g., 500" {...field} value={field.value ?? ''} onChange={e => field.onChange(parseFloat(e.target.value) || 0)} />
                    </FormControl>
                    <FormMessage />
                  </FormItem>
                )} />
                <FormField control={form.control} name="marginalTaxRatePct" render={({ field }) => (
                  <FormItem>
                    <FormLabel>Marginal Tax Rate (%) â€” optional</FormLabel>
                    <FormControl>
                      <Input type="number" min={0} max={50} step={0.5} placeholder="e.g., 22" {...field} value={field.value ?? ''} onChange={e => field.onChange(parseFloat(e.target.value) !== undefined && e.target.value !== '' ? parseFloat(e.target.value) : undefined)} />
                    </FormControl>
                    <FormMessage />
                  </FormItem>
                )} />
              </div>
              <Button type="submit" className="w-full">
                <Calculator className="mr-2 h-4 w-4" />
                Compare Expense Reduction vs Income Increase
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
                <Scale className="h-8 w-8 text-primary" />
                <div>
                  <CardTitle>Result</CardTitle>
                  <CardDescription>Same additional savings: two paths</CardDescription>
                </div>
              </div>
            </CardHeader>
            <CardContent className="space-y-6">
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div className="p-4 rounded-lg border-2 border-green-200 bg-green-50 dark:bg-green-900/10 dark:border-green-800">
                  <TrendingDown className="h-6 w-6 text-green-600 mb-2" />
                  <h4 className="font-semibold text-green-800 dark:text-green-300">Option A: Expense Reduction</h4>
                  <p className="text-2xl font-bold text-green-700 dark:text-green-400 mt-1">Cut $${result.expenseCutNeeded.toFixed(0)}/month</p>
                  <p className="text-sm text-muted-foreground mt-1">${(result.expenseCutNeeded * 12).toFixed(0)}/year Â· 1:1 (cut $1 = save $1)</p>
                </div>
                <div className="p-4 rounded-lg border-2 border-blue-200 bg-blue-50 dark:bg-blue-900/10 dark:border-blue-800">
                  <TrendingUp className="h-6 w-6 text-blue-600 mb-2" />
                  <h4 className="font-semibold text-blue-800 dark:text-blue-300">Option B: Income Increase</h4>
                  <p className="text-2xl font-bold text-blue-700 dark:text-blue-400 mt-1">+${result.takeHomeIncreaseNeeded.toFixed(0)}/month take-home</p>
                  {result.grossIncreaseNeeded != null && (
                    <p className="text-sm text-muted-foreground mt-1">~${result.grossIncreaseNeeded.toFixed(0)}/month gross (${(result.grossIncreaseNeeded * 12).toFixed(0)}/year) after tax</p>
                  )}
                  {result.grossIncreaseNeeded == null && (
                    <p className="text-sm text-muted-foreground mt-1">Add marginal tax % to see gross income needed</p>
                  )}
                </div>
              </div>
              <div className="text-center p-3 bg-muted/50 rounded-lg">
                <p className="text-sm font-medium">Current savings: ${result.currentSavings.toFixed(0)}/month ({result.currentSavingsRatePct.toFixed(1)}% of take-home)</p>
                <p className="text-sm text-muted-foreground">After +target: {result.afterExpenseReductionSavingsRatePct.toFixed(1)}% (expense cut) or {result.afterIncomeIncreaseSavingsRatePct.toFixed(1)}% (income increase)</p>
              </div>
              <Alert className="border-amber-200 bg-amber-50 dark:bg-amber-900/10">
                <Info className="h-4 w-4" />
                <AlertDescription><strong>Recommendation:</strong> {result.recommendation}</AlertDescription>
              </Alert>
              <div className="space-y-2">
                <h4 className="font-semibold flex items-center gap-2">Insights</h4>
                <ul className="space-y-2">
                  {result.insights.map((insight, i) => (
                    <li key={i} className="flex items-start gap-2 p-3 bg-primary/5 rounded-lg border border-primary/10 text-sm">
                      <CheckCircle2 className="h-4 w-4 text-primary mt-0.5 shrink-0" />
                      {insight}
                    </li>
                  ))}
                </ul>
              </div>
            </CardContent>
          </Card>

          {/* Key Takeaways */}
          <Card className="h-full">
            <CardHeader>
              <CardTitle className="flex items-center gap-2 text-xl text-primary">
                <Target className="h-6 w-6" />
                Key Takeaways
              </CardTitle>
              <CardDescription>When to prefer expense reduction vs income increase</CardDescription>
            </CardHeader>
            <CardContent className="space-y-4">
              <div className="flex items-start gap-3 p-3 bg-primary/5 rounded-lg border border-primary/10">
                <CheckCircle2 className="h-5 w-5 text-primary mt-0.5 shrink-0" />
                <span className="text-sm font-medium">Expense reduction is 1:1â€”every dollar cut becomes a dollar saved, with no tax.</span>
              </div>
              <div className="flex items-start gap-3 p-3 bg-primary/5 rounded-lg border border-primary/10">
                <CheckCircle2 className="h-5 w-5 text-primary mt-0.5 shrink-0" />
                <span className="text-sm font-medium">Income increase requires earning more gross if you pay tax; the calculator shows the exact gross needed when you enter your marginal rate.</span>
              </div>
              <div className="flex items-start gap-3 p-3 bg-primary/5 rounded-lg border border-primary/10">
                <CheckCircle2 className="h-5 w-5 text-primary mt-0.5 shrink-0" />
                <span className="text-sm font-medium">You can mix both paths: e.g. cut $250/month and earn $250 more take-home to add $500/month to savings.</span>
              </div>
              <div className="flex items-start gap-3 p-3 bg-primary/5 rounded-lg border border-primary/10">
                <CheckCircle2 className="h-5 w-5 text-primary mt-0.5 shrink-0" />
                <span className="text-sm font-medium">Savings rate rises more with expense reduction (same income, more savings) than with income increase (higher income, same additional savings).</span>
              </div>
            </CardContent>
          </Card>
        </div>
      )}

      <Card className="mb-6">
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <Info className="h-5 w-5" />
            Understanding Expense Reduction vs Income Increase
          </CardTitle>
          <CardDescription>Same outcome, two paths: cut spending or earn more</CardDescription>
        </CardHeader>
        <CardContent>
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div className="p-4 bg-green-50 dark:bg-green-900/10 rounded-lg border border-green-100 dark:border-green-900/20">
              <h4 className="font-semibold mb-2 flex items-center gap-2 text-green-700 dark:text-green-300">Expense reduction (1:1)</h4>
              <p className="text-sm text-muted-foreground mb-3">Every dollar you cut from spending becomes a dollar added to savings, with no tax. To save an extra $500/month, cut expenses by exactly $500/month.</p>
              <ul className="space-y-2">
                <li className="flex items-start gap-2 text-sm text-muted-foreground">
                  <CheckCircle2 className="h-4 w-4 text-green-500 mt-0.5 shrink-0" />
                  <span>No tax on money you don&apos;t spend; full amount goes to savings.</span>
                </li>
                <li className="flex items-start gap-2 text-sm text-muted-foreground">
                  <CheckCircle2 className="h-4 w-4 text-green-500 mt-0.5 shrink-0" />
                  <span>Easier to control if you have discretionary spending to trim.</span>
                </li>
                <li className="flex items-start gap-2 text-sm text-muted-foreground">
                  <CheckCircle2 className="h-4 w-4 text-green-500 mt-0.5 shrink-0" />
                  <span>Savings rate increases because income stays the same.</span>
                </li>
                <li className="flex items-start gap-2 text-sm text-muted-foreground">
                  <CheckCircle2 className="h-4 w-4 text-green-500 mt-0.5 shrink-0" />
                  <span>Best when you can identify specific categories to cut (subscriptions, dining, etc.).</span>
                </li>
              </ul>
            </div>
            <div className="p-4 bg-blue-50 dark:bg-blue-900/10 rounded-lg border border-blue-100 dark:border-blue-900/20">
              <h4 className="font-semibold mb-2 flex items-center gap-2 text-blue-700 dark:text-blue-300">Income increase (tax-aware)</h4>
              <p className="text-sm text-muted-foreground mb-3">To add $500/month to savings from income, you need $500 more take-home. If you enter a marginal tax rate, the calculator shows how much more gross income you need to get that take-home.</p>
              <ul className="space-y-2">
                <li className="flex items-start gap-2 text-sm text-muted-foreground">
                  <CheckCircle2 className="h-4 w-4 text-blue-500 mt-0.5 shrink-0" />
                  <span>Tax applies; gross increase must exceed take-home target.</span>
                </li>
                <li className="flex items-start gap-2 text-sm text-muted-foreground">
                  <CheckCircle2 className="h-4 w-4 text-blue-500 mt-0.5 shrink-0" />
                  <span>Requires raise, side income, or new job; less immediately controllable.</span>
                </li>
                <li className="flex items-start gap-2 text-sm text-muted-foreground">
                  <CheckCircle2 className="h-4 w-4 text-blue-500 mt-0.5 shrink-0" />
                  <span>Savings rate rises less (same extra savings, higher income denominator).</span>
                </li>
                <li className="flex items-start gap-2 text-sm text-muted-foreground">
                  <CheckCircle2 className="h-4 w-4 text-blue-500 mt-0.5 shrink-0" />
                  <span>Best when you&apos;re already lean on expenses or have income upside (negotiation, side hustle).</span>
                </li>
              </ul>
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
            <p className="font-mono text-sm text-center">Expense cut needed = Target additional monthly savings (1:1)</p>
            <p className="font-mono text-sm text-center">Take-home increase needed = Target additional monthly savings</p>
            <p className="font-mono text-sm text-center">Gross income increase needed = Take-home increase Ã· (1 âˆ’ Marginal tax rate)</p>
          </div>
          <p className="text-sm text-muted-foreground mt-2">
            The expense path is dollar-for-dollar with no tax. The income path converts a take-home target into the gross amount needed when you apply a single marginal tax rate to the extra income.
          </p>
        </CardContent>
      </Card>

      <Card className="mb-6">
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <Calculator className="h-5 w-5" />
            Related Financial Calculators
          </CardTitle>
          <CardDescription>Savings and budget tools</CardDescription>
        </CardHeader>
        <CardContent>
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
            <Link href="/finance/monthly-savings-gap-calculator" className="block">
              <Card className="hover:shadow-md transition-shadow cursor-pointer">
                <CardContent className="p-4">
                  <div className="flex items-center gap-3">
                    <Target className="h-5 w-5 text-blue-600" />
                    <div>
                      <p className="font-medium">Monthly Savings Gap</p>
                      <p className="text-sm text-muted-foreground">Required vs current monthly savings</p>
                    </div>
                  </div>
                </CardContent>
              </Card>
            </Link>
            <Link href="/finance/lifestyle-inflation-calculator" className="block">
              <Card className="hover:shadow-md transition-shadow cursor-pointer">
                <CardContent className="p-4">
                  <div className="flex items-center gap-3">
                    <TrendingUp className="h-5 w-5 text-green-600" />
                    <div>
                      <p className="font-medium">Lifestyle Inflation</p>
                      <p className="text-sm text-muted-foreground">Save the raise</p>
                    </div>
                  </div>
                </CardContent>
              </Card>
            </Link>
            <Link href="/finance/sip-vs-lump-sum-return-difference-calculator" className="block">
              <Card className="hover:shadow-md transition-shadow cursor-pointer">
                <CardContent className="p-4">
                  <div className="flex items-center gap-3">
                    <DollarSign className="h-5 w-5 text-purple-600" />
                    <div>
                      <p className="font-medium">SIP vs Lump Sum Return Difference</p>
                      <p className="text-sm text-muted-foreground">Same total invested, different timing</p>
                    </div>
                  </div>
                </CardContent>
              </Card>
            </Link>
            <Link href="/finance/paycheck-to-paycheck-risk-calculator" className="block">
              <Card className="hover:shadow-md transition-shadow cursor-pointer">
                <CardContent className="p-4">
                  <div className="flex items-center gap-3">
                    <Scale className="h-5 w-5 text-amber-600" />
                    <div>
                      <p className="font-medium">Paycheck-to-Paycheck Risk</p>
                      <p className="text-sm text-muted-foreground">Expense-to-income ratio and buffer</p>
                    </div>
                  </div>
                </CardContent>
              </Card>
            </Link>
            <Link href="/finance/side-income-impact-on-savings-calculator" className="block">
              <Card className="hover:shadow-md transition-shadow cursor-pointer">
                <CardContent className="p-4">
                  <div className="flex items-center gap-3">
                    <DollarSign className="h-5 w-5 text-indigo-600" />
                    <div>
                      <p className="font-medium">Side Income Impact on Savings</p>
                      <p className="text-sm text-muted-foreground">How side income boosts savings</p>
                    </div>
                  </div>
                </CardContent>
              </Card>
            </Link>
            <Link href="/finance/cost-of-delaying-savings-by-1-year-calculator" className="block">
              <Card className="hover:shadow-md transition-shadow cursor-pointer">
                <CardContent className="p-4">
                  <div className="flex items-center gap-3">
                    <Target className="h-5 w-5 text-red-600" />
                    <div>
                      <p className="font-medium">Cost of Delaying Savings by 1 Year</p>
                      <p className="text-sm text-muted-foreground">Impact of waiting one year</p>
                    </div>
                  </div>
                </CardContent>
              </Card>
            </Link>
          </div>
        </CardContent>
      </Card>

      <section className="space-y-6 text-muted-foreground leading-relaxed bg-card p-6 md:p-10 rounded-lg shadow-lg" itemScope itemType="https://schema.org/FinanceSummary">
        <meta itemProp="name" content="Expense Reduction vs Income Increase: Same Savings, Two Paths" />
        <meta itemProp="description" content="Compare cutting expenses (1:1) vs increasing income to add the same amount to monthly savings. See exact expense cut or gross income needed with optional tax rate." />
        <meta itemProp="keywords" content="expense reduction vs income increase, boost savings, cut spending or earn more, marginal tax rate, monthly savings" />
        <meta itemProp="author" content="MegaCalc Financial Team" />
        <meta itemProp="datePublished" content="2025-10-25" />
        <meta itemProp="url" content="/finance/expense-reduction-vs-income-increase-calculator" />

        <h1 className="text-3xl md:text-4xl font-extrabold text-foreground mb-4" itemProp="headline">Expense Reduction vs Income Increase: Same Savings, Two Paths</h1>
        <p className="text-lg italic text-muted-foreground">To add a given amount to monthly savings, you can either reduce expenses (dollar-for-dollar) or increase take-home income. This calculator shows the exact expense cut or income increase needed and, with a marginal tax rate, the gross income required.</p>

        <h2 className="text-2xl font-bold text-foreground mt-8 mb-4">Table of Contents: Jump to a Section</h2>
        <ul className="list-disc ml-6 space-y-2 text-primary">
          <li><a href="#what-is-expense-vs-income" className="hover:underline">What Is Expense Reduction vs Income Increase?</a></li>
          <li><a href="#how-calculated-expense-vs-income" className="hover:underline">How It Is Calculated</a></li>
          <li><a href="#why-it-matters-expense-vs-income" className="hover:underline">Why It Matters</a></li>
          <li><a href="#applications-expense-vs-income" className="hover:underline">Using This Calculator</a></li>
          <li><a href="#conclusion-expense-vs-income" className="hover:underline">Conclusion</a></li>
        </ul>
        <hr />

        <h2 id="what-is-expense-vs-income" className="text-2xl font-bold text-foreground pt-8" itemProp="articleSection">What Is Expense Reduction vs Income Increase?</h2>
        <p>Both paths increase the amount you save each month. Expense reduction means cutting spending by $X so that $X goes to savings instead (1:1). Income increase means earning $X more take-home and saving it; the result is the same $X added to savings, but you may need to earn more than $X gross if taxes apply.</p>
        <h3 className="text-xl font-semibold text-foreground mt-6">The 1:1 Rule for Expense Reduction</h3>
        <p>Every dollar you reduce in expenses, without increasing spending elsewhere, becomes one dollar added to savings. There is no tax on &quot;not spending.&quot; This makes expense reduction mathematically efficient: to add $500/month to savings, cut expenses by exactly $500/month.</p>
        <h3 className="text-xl font-semibold text-foreground mt-6">Income Increase and Tax</h3>
        <p>To get $X more take-home, you need $X more after tax. If your marginal tax rate is T, you need gross increase = X Ã· (1 âˆ’ T). For example, at 22% marginal rate, to add $500 take-home you need about $641 more gross per month. The higher your marginal rate, the larger the gross amount required for the same take-home target.</p>
        <ul className="list-disc ml-6 space-y-2 mt-4">
          <li><strong>Expense path:</strong> Cut $500/month â†’ save $500/month (1:1, no tax).</li>
          <li><strong>Income path (22% marginal):</strong> Earn ~$641/month more gross â†’ $500 more take-home â†’ save $500/month.</li>
        </ul>
        <hr />

        <h2 id="how-calculated-expense-vs-income" className="text-2xl font-bold text-foreground pt-8" itemProp="articleSection">How It Is Calculated</h2>
        <p>Expense cut needed = Target additional monthly savings (same number). Take-home increase needed = Target additional monthly savings. Gross income increase = Take-home increase Ã· (1 âˆ’ Marginal tax rate) when marginal rate is provided.</p>
        <h3 className="text-xl font-semibold text-foreground mt-6">The Formula</h3>
        <div className="overflow-x-auto my-6 p-4 bg-muted border rounded-lg text-center">
          <p className="font-mono text-lg text-destructive font-bold">Expense cut = Target | Gross increase = Target Ã· (1 âˆ’ Tax rate)</p>
        </div>
        <h3 className="text-xl font-semibold text-foreground mt-6">What Each Path Delivers</h3>
        <p>Both paths deliver the same additional monthly savings. The calculator also shows your current savings rate and the rate after achieving the target via expense reduction vs income increase. With expense reduction, income is unchanged so the rate rises more; with income increase, income is higher so the rate rises less (but the dollar savings are identical).</p>
        <hr />

        <h2 id="why-it-matters-expense-vs-income" className="text-2xl font-bold text-foreground pt-8" itemProp="articleSection">Why It Matters</h2>
        <p>Seeing the two options side by side helps you choose: cutting $500/month may be easier than earning $641/month more gross, or vice versa depending on your job and lifestyle.</p>
        <h3 className="text-xl font-semibold text-foreground mt-6">Combining Both</h3>
        <p>You can mix both: cut $250 in expenses and increase take-home by $250 to achieve $500/month more in savings. The calculator focuses on &quot;all expense&quot; vs &quot;all income&quot; for a clear comparison. In practice, many people do a mixâ€”e.g. trim subscriptions and put a raise toward savings.</p>
        <h3 className="text-xl font-semibold text-foreground mt-6">When Expense Reduction Is Easier</h3>
        <p>If you have discretionary spending (subscriptions, dining, travel), cutting first is often faster and 1:1. If you&apos;re already lean, earning more (raise, side income) may be the only way to add meaningfully to savings.</p>
        <hr />

        <h2 id="applications-expense-vs-income" className="text-2xl font-bold text-foreground pt-8" itemProp="articleSection">Using This Calculator</h2>
        <p>Enter monthly take-home income, monthly expenses, and target additional monthly savings. Optionally enter your marginal tax rate (e.g. 22 for 22%) to see the gross income increase needed. The calculator shows expense cut (1:1), take-home increase, and gross increase if tax is applied.</p>
        <h3 className="text-xl font-semibold text-foreground mt-6">What to Enter</h3>
        <p>Use consistent monthly figures (take-home after tax, expenses you control). Marginal tax rate is the rate on your next dollar of income (federal + state if applicable). If you leave tax blank, you still see the take-home increase needed; add your marginal rate to see the gross amount.</p>
        <hr />

        <h2 id="conclusion-expense-vs-income" className="text-2xl font-bold text-foreground pt-8" itemProp="articleSection">Conclusion</h2>
        <p>Expense reduction and income increase both can add the same amount to monthly savings. Expense reduction is 1:1â€”every dollar cut becomes a dollar saved, with no tax. Income increase may require a larger gross amount when taxes apply; the calculator shows the exact gross needed when you enter your marginal rate.</p>
        <p>Use this calculator to see the exact numbers for your situation: the expense cut (1:1), the take-home increase, and the gross income increase if you pay tax. Then choose the path (or mix) that fits your lifeâ€”cutting spending, earning more, or both.</p>
      </section>

      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <Info className="h-5 w-5" />
            Frequently Asked Questions
          </CardTitle>
          <CardDescription>Common questions about expense reduction vs income increase</CardDescription>
        </CardHeader>
        <CardContent className="space-y-6">
          <div>
            <h4 className="font-semibold text-lg mb-3">Why is expense reduction 1:1?</h4>
            <p className="text-muted-foreground">Because every dollar you donâ€™t spend is a dollar you can save. Thereâ€™s no tax on reducing expenses; the full amount adds to savings.</p>
          </div>
          <div>
            <h4 className="font-semibold text-lg mb-3">Why do I need to earn more than my target to get the same savings from income?</h4>
            <p className="text-muted-foreground">Taxes. If you want $500 more take-home to save, you need $500 more after tax. If your marginal rate is 22%, that last dollar of income leaves you with $0.78; so you need 500 Ã· 0.78 â‰ˆ $641 gross to get $500 take-home.</p>
          </div>
          <div>
            <h4 className="font-semibold text-lg mb-3">What marginal tax rate should I use?</h4>
            <p className="text-muted-foreground">Use the rate that applies to your next dollar of income (federal + state, if applicable). For many U.S. earners, 22% or 24% federal plus state is a reasonable estimate. The calculator uses it only to convert take-home target to gross income needed.</p>
          </div>
          <div>
            <h4 className="font-semibold text-lg mb-3">Can I combine expense reduction and income increase?</h4>
            <p className="text-muted-foreground">Yes. The calculator shows &quot;all expense&quot; or &quot;all income&quot; to reach the same target. In practice you can mix: e.g. cut $300 and earn $200 more take-home to add $500/month to savings.</p>
          </div>
          <div>
            <h4 className="font-semibold text-lg mb-3">Does this account for lifestyle creep?</h4>
            <p className="text-muted-foreground">No. It assumes you save 100% of the expense cut or the income increase. If you spend part of a raise, youâ€™d need a larger income increase to hit the same savings target. The calculator is a direct comparison: same additional savings, two paths.</p>
          </div>
          <div>
            <h4 className="font-semibold text-lg mb-3">What if my expenses exceed my income?</h4>
            <p className="text-muted-foreground">The form requires take-home â‰¥ expenses. If youâ€™re in a deficit, focus first on cutting expenses or increasing income to reach balance; then use this tool to see how to add a target amount to savings.</p>
          </div>
          <div>
            <h4 className="font-semibold text-lg mb-3">Why show savings rate before and after?</h4>
            <p className="text-muted-foreground">So you can see how the same +$X in savings changes your rate: with expense reduction, income is unchanged so the rate rises more; with income increase, income is higher so the rate rises less (but you still save the same dollar amount).</p>
          </div>
          <div>
            <h4 className="font-semibold text-lg mb-3">Is expense reduction always easier than earning more?</h4>
            <p className="text-muted-foreground">Not always. It depends on your situation. Cutting $500 may be hard if youâ€™re already lean; earning more may be easier with a raise or side income. The calculator gives you the numbers; you choose the path (or mix).</p>
          </div>
          <div>
            <h4 className="font-semibold text-lg mb-3">What counts as &quot;expenses&quot;?</h4>
            <p className="text-muted-foreground">Use the expenses you can control or that you want to compare against (e.g. all discretionary + essential, or just discretionary). Consistency with your budget definition matters for the savings rate shown.</p>
          </div>
          <div>
            <h4 className="font-semibold text-lg mb-3">How often should I revisit this?</h4>
            <p className="text-muted-foreground">When your income or expenses change, or when you set a new savings target. Re-run with new numbers to see updated expense-cut vs income-increase figures.</p>
          </div>
        </CardContent>
      </Card>

      <Card className="mb-6">
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <Briefcase className="h-5 w-5" />
            Usage of this Calculator
          </CardTitle>
          <CardDescription>Practical applications and real-world context</CardDescription>
        </CardHeader>
        <CardContent className="space-y-6">
          <div>
            <h4 className="flex items-center gap-2 font-semibold text-lg mb-3">
              <Users className="h-5 w-5 text-blue-600" />
              Who Should Use This Calculator?
            </h4>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div className="p-3 bg-muted/50 rounded-lg border border-border/50">
                <strong className="block text-primary mb-1">People with a Monthly Savings Target</strong>
                <span className="text-sm text-muted-foreground">To see the exact expense cut or income increase needed to add that amount to savings and to compare both paths (including tax on income).</span>
              </div>
              <div className="p-3 bg-muted/50 rounded-lg border border-border/50">
                <strong className="block text-primary mb-1">Budgeters Deciding Where to Act</strong>
                <span className="text-sm text-muted-foreground">To decide whether to trim spending or pursue a raise/side income to hit a savings goal, with numbers for each.</span>
              </div>
              <div className="p-3 bg-muted/50 rounded-lg border border-border/50">
                <strong className="block text-primary mb-1">High Tax Brackets</strong>
                <span className="text-sm text-muted-foreground">To see how much gross income is required to get a target take-home increase and compare that to the 1:1 expense cut.</span>
              </div>
              <div className="p-3 bg-muted/50 rounded-lg border border-border/50">
                <strong className="block text-primary mb-1">Financial Coaches & Advisors</strong>
                <span className="text-sm text-muted-foreground">To show clients the equivalence of cutting expenses vs earning more and the impact of marginal tax on the income path.</span>
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
                <span><strong>Single marginal rate:</strong> Uses one marginal rate; actual tax is tiered. The gross figure is an approximation.</span>
              </li>
              <li className="flex gap-2">
                <CheckCircle2 className="h-4 w-4 text-amber-500 shrink-0 mt-0.5" />
                <span><strong>No lifestyle creep:</strong> Assumes 100% of expense cut or income increase goes to savings. If you spend part of a raise, youâ€™d need a larger income increase.</span>
              </li>
              <li className="flex gap-2">
                <CheckCircle2 className="h-4 w-4 text-amber-500 shrink-0 mt-0.5" />
                <span><strong>Monthly only:</strong> All figures are per month; annual equivalents are shown for convenience.</span>
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
                <h5 className="font-semibold text-green-800 dark:text-green-300 mb-1">Target: +$500/month savings, 22% marginal tax</h5>
                <p className="text-sm text-green-700/80 dark:text-green-400">Option A: Cut expenses by $500/month ($6,000/year). Option B: Increase take-home by $500/month, or about $641/month gross ($7,692/year) to get $500 after tax. Expense reduction is 1:1; income path requires ~28% more gross.</p>
              </div>
              <div className="p-4 rounded-lg bg-blue-50 dark:bg-blue-900/10 border border-blue-100 dark:border-blue-900/20">
                <h5 className="font-semibold text-blue-800 dark:text-blue-300 mb-1">Target: +$300/month, no tax entered</h5>
                <p className="text-sm text-blue-700/80 dark:text-blue-400">Option A: Cut $300/month. Option B: Increase take-home by $300/month. Without a tax rate, gross income needed isnâ€™t shown; add marginal rate to see it.</p>
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
          <CardDescription>Quick recap</CardDescription>
        </CardHeader>
        <CardContent>
          <p className="text-muted-foreground">This calculator compares two ways to add the same amount to monthly savings: reduce expenses (1:1, no tax) or increase take-home income. You enter take-home, expenses, target additional savings, and optional marginal tax rate. It shows the exact expense cut or take-home increase and, with tax rate, the gross income needed. Use it to decide between cutting spending and earning more.</p>
        </CardContent>
      </Card>
    </div>
  );
}

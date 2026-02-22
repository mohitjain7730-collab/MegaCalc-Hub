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
import { Wallet, Info, Calculator, DollarSign, BarChart3, Target, CheckCircle2, Users, Briefcase, AlertTriangle, FunctionSquare, Landmark } from 'lucide-react';
import { Badge } from '@/components/ui/badge';
import { Alert, AlertDescription } from '@/components/ui/alert';
import Link from 'next/link';

const formSchema = z.object({
  currentMonthlySavings: z.number().min(0, 'Enter current monthly savings'),
  sideIncomePerMonth: z.number().min(0, 'Enter side income per month'),
  pctOfSideIncomeToSave: z.number().min(0).max(100, 'Enter 0â€“100'),
  savingsGoal: z.number().min(0).optional(),
  currentBalance: z.number().min(0).optional(),
});

type FormValues = z.infer<typeof formSchema>;

const schemaMarkup = {
  '@context': 'https://schema.org',
  '@graph': [
    {
      '@type': 'SoftwareApplication',
      name: 'Side Income Impact on Savings Calculator',
      applicationCategory: 'FinanceApplication',
      operatingSystem: 'Web Browser',
      description: 'See how side income boosts your savings. Enter current savings, side income, and % to save; get additional monthly and annual savings and months sooner to goal.',
      url: 'https://mycalculating.com/finance/side-income-impact-on-savings-calculator',
      offers: { '@type': 'Offer', price: '0', priceCurrency: 'USD' },
    },
  ],
};

export default function SideIncomeImpactOnSavingsCalculator() {
  const [result, setResult] = useState<{
    additionalMonthlySavings: number;
    newTotalMonthlySavings: number;
    additionalPerYear: number;
    monthsToGoalBefore: number | null;
    monthsToGoalAfter: number | null;
    monthsSooner: number | null;
    recommendation: string;
    insights: string[];
  } | null>(null);

  const form = useForm<FormValues>({
    resolver: zodResolver(formSchema),
    defaultValues: {
      currentMonthlySavings: undefined,
      sideIncomePerMonth: undefined,
      pctOfSideIncomeToSave: 100,
      savingsGoal: undefined,
      currentBalance: undefined,
    },
  });

  const calculate = (v: FormValues) => {
    const current = v.currentMonthlySavings ?? 0;
    const side = v.sideIncomePerMonth ?? 0;
    const pct = Math.min(100, Math.max(0, v.pctOfSideIncomeToSave ?? 100)) / 100;
    const additionalMonthlySavings = side * pct;
    const newTotalMonthlySavings = current + additionalMonthlySavings;
    const additionalPerYear = additionalMonthlySavings * 12;

    const goal = v.savingsGoal ?? 0;
    const balance = v.currentBalance ?? 0;
    const remaining = goal - balance;
    let monthsToGoalBefore: number | null = null;
    let monthsToGoalAfter: number | null = null;
    let monthsSooner: number | null = null;
    if (goal > 0 && remaining > 0 && current >= 0) {
      monthsToGoalBefore = current > 0 ? remaining / current : Infinity;
      monthsToGoalAfter = newTotalMonthlySavings > 0 ? remaining / newTotalMonthlySavings : Infinity;
      if (monthsToGoalBefore !== Infinity && monthsToGoalAfter !== Infinity) {
        monthsSooner = Math.max(0, Math.ceil(monthsToGoalBefore) - Math.ceil(monthsToGoalAfter));
      }
    }

    let recommendation = '';
    if (additionalMonthlySavings > 0) {
      recommendation = `Saving ${(pct * 100).toFixed(0)}% of your side income adds $${additionalMonthlySavings.toFixed(0)}/month ($${additionalPerYear.toFixed(0)}/year) to savings.`;
      if (monthsSooner !== null && monthsSooner > 0) {
        recommendation += ` You could reach your goal about ${monthsSooner} month(s) sooner.`;
      }
      recommendation += ' Keep side income in a separate account and auto-transfer the savings portion to avoid spending it.';
    } else {
      recommendation = 'Increase the side income amount or the % to save to see the impact. Saving 100% of side income maximizes the boost to savings.';
    }

    const insights: string[] = [];
    insights.push(`Additional monthly savings from side income: $${additionalMonthlySavings.toFixed(0)} ($${additionalPerYear.toFixed(0)}/year).`);
    insights.push(`New total monthly savings: $${newTotalMonthlySavings.toFixed(0)} (was $${current.toFixed(0)}).`);
    if (monthsToGoalBefore != null && monthsToGoalAfter != null && remaining > 0) {
      insights.push(`Months to goal at current rate: ${monthsToGoalBefore < 999 ? Math.ceil(monthsToGoalBefore) : 'â€”'}. With side income: ${monthsToGoalAfter < 999 ? Math.ceil(monthsToGoalAfter) : 'â€”'}.`);
      if (monthsSooner != null && monthsSooner > 0) {
        insights.push(`You could reach your goal about ${monthsSooner} month(s) sooner by saving ${(pct * 100).toFixed(0)}% of side income.`);
      }
    }
    if (pct < 1) {
      insights.push(`Saving 100% of side income would add $${(side * 12).toFixed(0)}/year more; you're currently allocating $${additionalPerYear.toFixed(0)}/year from side income.`);
    }

    return {
      additionalMonthlySavings,
      newTotalMonthlySavings,
      additionalPerYear,
      monthsToGoalBefore: monthsToGoalBefore != null && monthsToGoalBefore < 999 ? monthsToGoalBefore : null,
      monthsToGoalAfter: monthsToGoalAfter != null && monthsToGoalAfter < 999 ? monthsToGoalAfter : null,
      monthsSooner,
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
      <Script id="side-income-impact-schema" type="application/ld+json" strategy="afterInteractive" dangerouslySetInnerHTML={{ __html: JSON.stringify(schemaMarkup) }} />

      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <Wallet className="h-5 w-5" />
            Side Income Impact on Savings
          </CardTitle>
          <CardDescription>
            Enter your current monthly savings, side income per month, and what percent of side income you want to save. Optionally add a savings goal and current balance to see how many months sooner you could reach the goal.
          </CardDescription>
        </CardHeader>
        <CardContent>
          <Form {...form}>
            <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-6">
              <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
                <FormField control={form.control} name="currentMonthlySavings" render={({ field }) => (
                  <FormItem>
                    <FormLabel>Current Monthly Savings ($)</FormLabel>
                    <FormControl>
                      <Input type="number" min={0} placeholder="e.g., 500" {...field} value={field.value ?? ''} onChange={e => field.onChange(parseFloat(e.target.value) || 0)} />
                    </FormControl>
                    <FormMessage />
                  </FormItem>
                )} />
                <FormField control={form.control} name="sideIncomePerMonth" render={({ field }) => (
                  <FormItem>
                    <FormLabel>Side Income per Month ($)</FormLabel>
                    <FormControl>
                      <Input type="number" min={0} placeholder="e.g., 300" {...field} value={field.value ?? ''} onChange={e => field.onChange(parseFloat(e.target.value) || 0)} />
                    </FormControl>
                    <FormMessage />
                  </FormItem>
                )} />
                <FormField control={form.control} name="pctOfSideIncomeToSave" render={({ field }) => (
                  <FormItem>
                    <FormLabel>% of Side Income to Save</FormLabel>
                    <FormControl>
                      <Input type="number" min={0} max={100} placeholder="e.g., 100" {...field} value={field.value ?? ''} onChange={e => field.onChange(parseFloat(e.target.value) ?? 0)} />
                    </FormControl>
                    <FormMessage />
                  </FormItem>
                )} />
              </div>
              <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                <FormField control={form.control} name="savingsGoal" render={({ field }) => (
                  <FormItem>
                    <FormLabel>Savings Goal ($) â€” optional</FormLabel>
                    <FormControl>
                      <Input type="number" min={0} placeholder="e.g., 24000" {...field} value={field.value ?? ''} onChange={e => field.onChange(parseFloat(e.target.value) || 0)} />
                    </FormControl>
                    <FormMessage />
                  </FormItem>
                )} />
                <FormField control={form.control} name="currentBalance" render={({ field }) => (
                  <FormItem>
                    <FormLabel>Current Balance ($) â€” optional</FormLabel>
                    <FormControl>
                      <Input type="number" min={0} placeholder="e.g., 5000" {...field} value={field.value ?? ''} onChange={e => field.onChange(parseFloat(e.target.value) || 0)} />
                    </FormControl>
                    <FormMessage />
                  </FormItem>
                )} />
              </div>
              <Button type="submit" className="w-full">
                <Calculator className="mr-2 h-4 w-4" />
                Calculate Side Income Impact
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
                <DollarSign className="h-8 w-8 text-primary" />
                <div>
                  <CardTitle>Result</CardTitle>
                  <CardDescription>Impact of saving part of side income</CardDescription>
                </div>
              </div>
            </CardHeader>
            <CardContent className="space-y-6">
              <div className="text-center">
                <Badge variant="default" className="text-lg px-4 py-2">
                  +${result.additionalMonthlySavings.toFixed(0)}/month (${result.additionalPerYear.toFixed(0)}/year) from side income
                </Badge>
                <p className="text-sm text-muted-foreground mt-2">{result.recommendation}</p>
              </div>
              <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                <div className="text-center p-4 bg-muted/50 rounded-lg">
                  <Wallet className="h-6 w-6 mx-auto mb-2 text-blue-600" />
                  <p className="font-semibold">Additional Monthly</p>
                  <p className="text-lg font-bold">+${result.additionalMonthlySavings.toLocaleString(undefined, { maximumFractionDigits: 0 })}</p>
                </div>
                <div className="text-center p-4 bg-muted/50 rounded-lg">
                  <BarChart3 className="h-6 w-6 mx-auto mb-2 text-green-600" />
                  <p className="font-semibold">New Total Monthly</p>
                  <p className="text-lg font-bold">${result.newTotalMonthlySavings.toLocaleString(undefined, { maximumFractionDigits: 0 })}</p>
                </div>
                <div className="text-center p-4 bg-muted/50 rounded-lg">
                  <Target className="h-6 w-6 mx-auto mb-2 text-purple-600" />
                  <p className="font-semibold">Additional per Year</p>
                  <p className="text-lg font-bold">${result.additionalPerYear.toLocaleString(undefined, { maximumFractionDigits: 0 })}</p>
                </div>
              </div>
              {result.monthsSooner != null && result.monthsSooner > 0 && (
                <Alert className="border-green-200 bg-green-50 dark:bg-green-900/10">
                  <Target className="h-4 w-4" />
                  <AlertDescription>You could reach your goal about <strong>{result.monthsSooner} month(s) sooner</strong> by saving this portion of side income.</AlertDescription>
                </Alert>
              )}
              <Alert className="border-blue-200 bg-blue-50 dark:bg-blue-900/10">
                <Info className="h-4 w-4" />
                <AlertDescription><strong>Recommendation:</strong> {result.recommendation}</AlertDescription>
              </Alert>
              {result.insights.length > 0 && (
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
              )}
            </CardContent>
          </Card>
        </div>
      )}

      <Card className="mb-6">
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <Info className="h-5 w-5" />
            Understanding Side Income Impact on Savings
          </CardTitle>
          <CardDescription>How saving part of side income boosts your progress</CardDescription>
        </CardHeader>
        <CardContent>
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div className="p-4 bg-blue-50 dark:bg-blue-900/10 rounded-lg border border-blue-100 dark:border-blue-900/20">
              <h4 className="font-semibold mb-2 flex items-center gap-2 text-blue-700 dark:text-blue-300">Additional savings</h4>
              <p className="text-sm text-muted-foreground mb-3">Saving a percentage of side income (e.g. 100%) adds that amount to your monthly savings. Over a year, that can significantly shorten time to a goal or grow your balance faster.</p>
            </div>
            <div className="p-4 bg-amber-50 dark:bg-amber-900/10 rounded-lg border border-amber-100 dark:border-amber-900/20">
              <h4 className="font-semibold mb-2 flex items-center gap-2 text-amber-700 dark:text-amber-300">Months to goal</h4>
              <p className="text-sm text-muted-foreground mb-3">If you enter a savings goal and current balance, the calculator shows how many months to reach the goal at your current rate vs with side income saved, and how many months sooner you could get there.</p>
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
            <p className="font-mono text-sm text-center">Additional Monthly Savings = Side Income per Month Ã— (% to Save Ã· 100)</p>
            <p className="font-mono text-sm text-center">New Total Monthly Savings = Current Monthly Savings + Additional Monthly Savings</p>
            <p className="font-mono text-sm text-center">Months to Goal = (Savings Goal âˆ’ Current Balance) Ã· Monthly Savings</p>
          </div>
        </CardContent>
      </Card>

      <Card className="mb-6">
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <Calculator className="h-5 w-5" />
            Related Financial Calculators
          </CardTitle>
          <CardDescription>Savings and income tools</CardDescription>
        </CardHeader>
        <CardContent>
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
            <Link href="/cost-of-delaying-savings-by-1-year-calculator" className="block">
              <Card className="hover:shadow-md transition-shadow cursor-pointer">
                <CardContent className="p-4">
                  <div className="flex items-center gap-3">
                    <Target className="h-5 w-5 text-blue-600" />
                    <div>
                      <p className="font-medium">Cost of Delaying Savings by 1 Year</p>
                      <p className="text-sm text-muted-foreground">Impact of waiting one year</p>
                    </div>
                  </div>
                </CardContent>
              </Card>
            </Link>
            <Link href="/monthly-savings-gap-calculator" className="block">
              <Card className="hover:shadow-md transition-shadow cursor-pointer">
                <CardContent className="p-4">
                  <div className="flex items-center gap-3">
                    <BarChart3 className="h-5 w-5 text-green-600" />
                    <div>
                      <p className="font-medium">Monthly Savings Gap</p>
                      <p className="text-sm text-muted-foreground">Required vs current monthly</p>
                    </div>
                  </div>
                </CardContent>
              </Card>
            </Link>
            <Link href="/lifestyle-inflation-calculator" className="block">
              <Card className="hover:shadow-md transition-shadow cursor-pointer">
                <CardContent className="p-4">
                  <div className="flex items-center gap-3">
                    <Wallet className="h-5 w-5 text-purple-600" />
                    <div>
                      <p className="font-medium">Lifestyle Inflation</p>
                      <p className="text-sm text-muted-foreground">Save the raise</p>
                    </div>
                  </div>
                </CardContent>
              </Card>
            </Link>
          </div>
        </CardContent>
      </Card>

      <section className="space-y-6 text-muted-foreground leading-relaxed bg-card p-6 md:p-10 rounded-lg shadow-lg" itemScope itemType="https://schema.org/FinanceSummary">
        <meta itemProp="name" content="Side Income Impact on Savings: How Much Faster You Reach Your Goal" />
        <meta itemProp="description" content="See how side income boosts your savings. Enter current savings, side income, and % to save; get additional monthly and annual savings and months sooner to goal." />
        <meta itemProp="keywords" content="side income impact on savings, side hustle savings, additional savings, months to goal" />
        <meta itemProp="author" content="MegaCalc Financial Team" />
        <meta itemProp="datePublished" content="2025-10-25" />
        <meta itemProp="url" content="/side-income-impact-on-savings-calculator" />

        <h1 className="text-3xl md:text-4xl font-extrabold text-foreground mb-4" itemProp="headline">Side Income Impact on Savings: How Much Faster You Reach Your Goal</h1>
        <p className="text-lg italic text-muted-foreground">Saving a portion of side income (e.g. 100%) adds to your monthly savings and can shorten the time to a savings goal. This calculator shows the additional monthly and annual savings and, if you enter a goal and balance, how many months sooner you could get there.</p>

        <h2 className="text-2xl font-bold text-foreground mt-8 mb-4">Table of Contents: Jump to a Section</h2>
        <ul className="list-disc ml-6 space-y-2 text-primary">
          <li><a href="#what-is-side-income-impact" className="hover:underline">What Is Side Income Impact on Savings?</a></li>
          <li><a href="#how-calculated-side" className="hover:underline">How It Is Calculated</a></li>
          <li><a href="#why-save-side-income" className="hover:underline">Why Save Side Income</a></li>
          <li><a href="#applications-side" className="hover:underline">Using This Calculator</a></li>
          <li><a href="#conclusion-side" className="hover:underline">Conclusion</a></li>
        </ul>
        <hr />

        <h2 id="what-is-side-income-impact" className="text-2xl font-bold text-foreground pt-8" itemProp="articleSection">What Is Side Income Impact on Savings?</h2>
        <p>Side income (freelance, gig, part-time job, hobby income) can be used for spending or saving. If you save a percentage of itâ€”ideally 100%â€”you add that amount to your monthly savings. The impact is the extra amount you save each month and each year, and how much sooner you can reach a savings goal.</p>
        <h3 className="text-xl font-semibold text-foreground mt-6">Additional Monthly and Annual Savings</h3>
        <p>Additional monthly savings = Side income per month Ã— (% to save Ã· 100). Additional per year = that amount Ã— 12. The higher the percentage you save, the larger the impact.</p>
        <h3 className="text-xl font-semibold text-foreground mt-6">Months Sooner to Goal</h3>
        <p>If you have a savings goal and current balance, months to goal = (Goal âˆ’ Balance) Ã· Monthly savings. With side income saved, your monthly savings increase, so the number of months to reach the goal drops. The difference is how many months sooner you could get there.</p>
        <hr />

        <h2 id="how-calculated-side" className="text-2xl font-bold text-foreground pt-8" itemProp="articleSection">How It Is Calculated</h2>
        <p>Additional monthly savings = Side income per month Ã— (Percent to save / 100). New total monthly savings = Current monthly savings + Additional monthly savings. Months to goal = (Savings goal âˆ’ Current balance) Ã· Monthly savings (before or after adding side income).</p>
        <h3 className="text-xl font-semibold text-foreground mt-6">The Formula</h3>
        <div className="overflow-x-auto my-6 p-4 bg-muted border rounded-lg text-center">
          <p className="font-mono text-lg text-destructive font-bold">Additional = Side Income Ã— % to Save &nbsp;|&nbsp; Months to Goal = (Goal âˆ’ Balance) Ã· Monthly Savings</p>
        </div>
        <hr />

        <h2 id="why-save-side-income" className="text-2xl font-bold text-foreground pt-8" itemProp="articleSection">Why Save Side Income</h2>
        <p>Side income is often more discretionary than salary; if you don&apos;t need it for bills, saving 100% avoids lifestyle creep and accelerates progress toward emergency fund, down payment, or retirement.</p>
        <h3 className="text-xl font-semibold text-foreground mt-6">Avoid Spending It</h3>
        <p>If side income hits the same account as spending money, it tends to get spent. Automating a transfer of the savings portion (e.g. to a separate savings account) keeps it out of sight and dedicated to the goal.</p>
        <hr />

        <h2 id="applications-side" className="text-2xl font-bold text-foreground pt-8" itemProp="articleSection">Using This Calculator</h2>
        <p>Enter current monthly savings, side income per month, and the percent of side income you want to save (e.g. 100). Optionally enter a savings goal and current balance to see months to goal before and after, and how many months sooner you could reach the goal.</p>
        <h3 className="text-xl font-semibold text-foreground mt-6">What to Enter</h3>
        <p>Use average monthly side income if it varies. Use the same definition of &quot;savings&quot; as for current monthly savings (e.g. 401(k), IRA, savings account). Goal and balance are optional but useful for seeing time-to-goal impact.</p>
        <hr />

        <h2 id="conclusion-side" className="text-2xl font-bold text-foreground pt-8" itemProp="articleSection">Conclusion</h2>
        <p>Side income can meaningfully boost savings when you allocate a high percentage to saving. Use this calculator to see the additional monthly and annual impact and, with a goal and balance, how many months sooner you could reach your target.</p>
      </section>

      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <Info className="h-5 w-5" />
            Frequently Asked Questions
          </CardTitle>
          <CardDescription>Common questions about side income impact on savings</CardDescription>
        </CardHeader>
        <CardContent className="space-y-6">
          <div>
            <h4 className="font-semibold text-lg mb-3">What counts as side income?</h4>
            <p className="text-muted-foreground">Side income is any income beyond your main job: freelance, gig work, part-time job, hobby income, rental income, dividends (if you treat them as income), etc. Use after-tax amounts if you're tracking take-home savings.</p>
          </div>
          <div>
            <h4 className="font-semibold text-lg mb-3">What percent of side income should I save?</h4>
            <p className="text-muted-foreground">Many people aim for 100% so that side income doesn't inflate lifestyle. If you need some for expenses, save at least 50â€“80%. The calculator lets you try any percentage to see the impact.</p>
          </div>
          <div>
            <h4 className="font-semibold text-lg mb-3">How is additional monthly savings calculated?</h4>
            <p className="text-muted-foreground">Additional monthly savings = Side income per month Ã— (Percent to save Ã· 100). For example, $500 side income and 100% to save = $500 additional per month ($6,000 per year).</p>
          </div>
          <div>
            <h4 className="font-semibold text-lg mb-3">What if my side income varies?</h4>
            <p className="text-muted-foreground">Use an average monthly amount or a conservative (lower) estimate. You can run the calculator again when income changes. Automating a fixed transfer (e.g. 80% of last month's side income) can smooth variability.</p>
          </div>
          <div>
            <h4 className="font-semibold text-lg mb-3">How do I see &quot;months sooner to goal&quot;?</h4>
            <p className="text-muted-foreground">Enter a savings goal (e.g. $24,000) and your current balance (e.g. $5,000). The calculator computes months to goal at your current savings rate and at your new rate (including side income saved), and the difference in months.</p>
          </div>
          <div>
            <h4 className="font-semibold text-lg mb-3">Does this account for taxes on side income?</h4>
            <p className="text-muted-foreground">No. Enter after-tax side income if you want the impact in take-home terms, or gross if you're comparing pre-tax. Be consistent with how you define current monthly savings.</p>
          </div>
          <div>
            <h4 className="font-semibold text-lg mb-3">Should I put side income in a separate account?</h4>
            <p className="text-muted-foreground">Keeping it in a separate account and auto-transferring the savings portion (e.g. to your main savings or investment account) helps avoid spending it. Many people never see it in checking.</p>
          </div>
          <div>
            <h4 className="font-semibold text-lg mb-3">What if I have multiple side income sources?</h4>
            <p className="text-muted-foreground">Add them into one total monthly side income and enter that. Use the same percent to save for all, or use an average if you save different percentages from different sources.</p>
          </div>
          <div>
            <h4 className="font-semibold text-lg mb-3">How does this relate to the monthly savings gap calculator?</h4>
            <p className="text-muted-foreground">The savings gap calculator shows how much more you need to save per month to reach a goal on time. Side income can close that gap: add the &quot;additional monthly savings&quot; from this calculator to your current savings and see if you close the gap.</p>
          </div>
          <div>
            <h4 className="font-semibold text-lg mb-3">Why save 100% of side income?</h4>
            <p className="text-muted-foreground">Because you're already living on your main income. Saving 100% of side income avoids lifestyle inflation and can dramatically shorten time to emergency fund, down payment, or retirement. You can always allocate some to fun later once goals are on track.</p>
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
                <strong className="block text-primary mb-1">People with Side Income</strong>
                <span className="text-sm text-muted-foreground">To see how much saving a portion of side income (e.g. 100%) adds to monthly and annual savings and how much sooner you could reach a goal.</span>
              </div>
              <div className="p-3 bg-muted/50 rounded-lg border border-border/50">
                <strong className="block text-primary mb-1">Freelancers & Gig Workers</strong>
                <span className="text-sm text-muted-foreground">To quantify the impact of dedicating side earnings to savings instead of spending and to set a savings rate from variable income.</span>
              </div>
              <div className="p-3 bg-muted/50 rounded-lg border border-border/50">
                <strong className="block text-primary mb-1">Anyone with a Savings Goal</strong>
                <span className="text-sm text-muted-foreground">To see how many months sooner you could reach a goal (emergency fund, down payment) by saving part or all of side income.</span>
              </div>
              <div className="p-3 bg-muted/50 rounded-lg border border-border/50">
                <strong className="block text-primary mb-1">Budgeters & Planners</strong>
                <span className="text-sm text-muted-foreground">To plan &quot;save 100% of side income&quot; and to compare time to goal with and without side income in the mix.</span>
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
                <span><strong>Constant amounts:</strong> Assumes the same side income and savings rate each month. Variable income will change the actual impact over time.</span>
              </li>
              <li className="flex gap-2">
                <CheckCircle2 className="h-4 w-4 text-amber-500 shrink-0 mt-0.5" />
                <span><strong>Months to goal:</strong> Uses simple division (remaining Ã· monthly savings). No interest or growth on the balance; for long goals use a compound-growth calculator for the balance.</span>
              </li>
              <li className="flex gap-2">
                <CheckCircle2 className="h-4 w-4 text-amber-500 shrink-0 mt-0.5" />
                <span><strong>Taxes:</strong> Enter after-tax side income if you want take-home impact; the calculator does not deduct taxes.</span>
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
                <h5 className="font-semibold text-green-800 dark:text-green-300 mb-1">Example: $500 current, $400 side, 100% to save</h5>
                <p className="text-sm text-green-700/80 dark:text-green-400">Additional: $400/month ($4,800/year). New total: $900/month. If goal is $18,000 and balance $3,000: at $500/mo you need 30 months; at $900/mo you need 17 monthsâ€”about 13 months sooner.</p>
              </div>
              <div className="p-4 rounded-lg bg-blue-50 dark:bg-blue-900/10 border border-blue-100 dark:border-blue-900/20">
                <h5 className="font-semibold text-blue-800 dark:text-blue-300 mb-1">Example: $1,000 current, $300 side, 50% to save</h5>
                <p className="text-sm text-blue-700/80 dark:text-blue-400">Additional: $150/month ($1,800/year). New total: $1,150/month. Saving half of side income still adds meaningfully; saving 100% would add $300/month ($3,600/year).</p>
              </div>
            </div>
          </div>
        </CardContent>
      </Card>

      <Card className="mb-6">
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <Target className="h-5 w-5" />
            Summary
          </CardTitle>
          <CardDescription>Quick recap</CardDescription>
        </CardHeader>
        <CardContent>
          <p className="text-muted-foreground">This calculator shows how side income affects your savings when you save a percentage of it. You enter current monthly savings, side income per month, and % to save; it outputs additional monthly and annual savings and new total monthly savings. If you enter a savings goal and current balance, it also shows months to goal before and after and how many months sooner you could reach the goal. Use it to see the impact of &quot;save 100% of side income&quot; and to plan time to goal.</p>
        </CardContent>
      </Card>
    </div>
  );
}

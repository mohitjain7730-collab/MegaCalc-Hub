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
import { Shield, Target, Info, Calculator, DollarSign, BarChart3, TrendingUp, CheckCircle2, AlertCircle, Users, Briefcase, AlertTriangle, FunctionSquare } from 'lucide-react';
import { Badge } from '@/components/ui/badge';
import { Alert, AlertDescription } from '@/components/ui/alert';
import Link from 'next/link';

const formSchema = z.object({
  incomeBefore: z.number().min(0.01, 'Enter income before raise'),
  savingsRateBefore: z.number().min(0).max(100, 'Enter savings rate before (0â€“100%)'),
  incomeAfter: z.number().min(0.01, 'Enter income after raise'),
  savingsRateAfter: z.number().min(0).max(100, 'Enter savings rate after (0â€“100%)'),
}).refine((data) => data.incomeBefore > 0 && data.incomeAfter > 0, { message: 'Income must be positive', path: ['incomeBefore'] });

type FormValues = z.infer<typeof formSchema>;

const schemaMarkup = {
  '@context': 'https://schema.org',
  '@graph': [
    {
      '@type': 'SoftwareApplication',
      name: 'Lifestyle Inflation Calculator',
      applicationCategory: 'FinanceApplication',
      operatingSystem: 'Web Browser',
      description: 'See how lifestyle inflationâ€”spending more as income rises instead of saving the raiseâ€”impacts your savings. Compare income and savings rate before vs after a raise.',
      url: 'https://mycalculating.com/finance/lifestyle-inflation-calculator',
      offers: { '@type': 'Offer', price: '0', priceCurrency: 'USD' },
    },
  ],
};

export default function LifestyleInflationCalculator() {
  const [result, setResult] = useState<{
    spendingBefore: number;
    spendingAfter: number;
    lifestyleInflationAmount: number;
    savingsSacrificedPerYear: number;
    savingsRateDrop: number;
    recommendation: string;
    insights: string[];
  } | null>(null);

  const form = useForm<FormValues>({
    resolver: zodResolver(formSchema),
    defaultValues: {
      incomeBefore: undefined,
      savingsRateBefore: undefined,
      incomeAfter: undefined,
      savingsRateAfter: undefined,
    },
  });

  const calculate = (v: FormValues) => {
    const incomeBefore = v.incomeBefore || 0;
    const incomeAfter = v.incomeAfter || 0;
    const rateBefore = (v.savingsRateBefore ?? 0) / 100;
    const rateAfter = (v.savingsRateAfter ?? 0) / 100;
    if (incomeBefore <= 0 || incomeAfter <= 0) return null;

    const spendingBefore = incomeBefore * (1 - rateBefore);
    const spendingAfter = incomeAfter * (1 - rateAfter);
    const lifestyleInflationAmount = spendingAfter - spendingBefore;
    const savingsSacrificedPerYear = incomeAfter * (rateBefore - rateAfter);
    const savingsRateDrop = (v.savingsRateBefore ?? 0) - (v.savingsRateAfter ?? 0);

    return {
      spendingBefore,
      spendingAfter,
      lifestyleInflationAmount,
      savingsSacrificedPerYear,
      savingsRateDrop,
      recommendation: '',
      insights: [] as string[],
    };
  };

  const getRecommendation = (r: NonNullable<ReturnType<typeof calculate>>) => {
    if (r.savingsRateDrop > 0) {
      return `You are spending $${r.lifestyleInflationAmount.toLocaleString(undefined, { maximumFractionDigits: 0 })} more per year after the raise instead of saving it. That is $${r.savingsSacrificedPerYear.toLocaleString(undefined, { maximumFractionDigits: 0 })} per year that could have been saved. Consider keeping your old spending and saving the raise.`;
    }
    if (r.savingsRateDrop < 0) {
      return `You increased your savings rate after the raise. You are saving $${Math.abs(r.savingsSacrificedPerYear).toLocaleString(undefined, { maximumFractionDigits: 0 })} more per year than if you had kept the old rate on the new income.`;
    }
    return 'Your savings rate stayed the same after the raise. Spending and savings both increased proportionally. To avoid lifestyle inflation, consider saving a larger share of the raise.';
  };

  const getInsights = (v: FormValues, r: NonNullable<ReturnType<typeof calculate>>) => {
    const insights = [];
    if (r.savingsRateDrop > 0) {
      insights.push(`Savings rate dropped ${r.savingsRateDrop.toFixed(1)} percentage points. Even a small drop on a higher income can mean thousands less saved per year.`);
    }
    if (r.lifestyleInflationAmount > 0) {
      insights.push('Lifestyle inflation is the increase in spending when income rises. Resisting itâ€”keeping spending flat and saving the raiseâ€”builds wealth faster.');
    }
    if (r.savingsSacrificedPerYear > 0) {
      insights.push(`Over 10 years, $${r.savingsSacrificedPerYear.toLocaleString(undefined, { maximumFractionDigits: 0 })}/year not saved is $${(r.savingsSacrificedPerYear * 10).toLocaleString(undefined, { maximumFractionDigits: 0 })} in contributions alone (before investment growth).`);
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
      <Script id="lifestyle-inflation-schema" type="application/ld+json" strategy="afterInteractive" dangerouslySetInnerHTML={{ __html: JSON.stringify(schemaMarkup) }} />

      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <TrendingUp className="h-5 w-5" />
            Lifestyle Inflation
          </CardTitle>
          <CardDescription>
            Compare income and savings rate before vs after a raise. See how much extra spending (lifestyle inflation) you have and how much you could have saved by keeping your old savings rate on the new income.
          </CardDescription>
        </CardHeader>
        <CardContent>
          <Form {...form}>
            <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-6">
              <div className="space-y-4">
                <h3 className="font-semibold text-sm text-primary flex items-center gap-2">
                  <DollarSign className="h-4 w-4" /> Before Raise
                </h3>
                <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                  <FormField control={form.control} name="incomeBefore" render={({ field }) => (
                    <FormItem>
                      <FormLabel>Annual Income Before ($)</FormLabel>
                      <FormControl>
                        <Input type="number" placeholder="e.g., 60000" {...field} value={field.value ?? ''} onChange={e => field.onChange(parseFloat(e.target.value) || 0)} />
                      </FormControl>
                      <FormMessage />
                    </FormItem>
                  )} />
                  <FormField control={form.control} name="savingsRateBefore" render={({ field }) => (
                    <FormItem>
                      <FormLabel>Savings Rate Before (%)</FormLabel>
                      <FormControl>
                        <Input type="number" min={0} max={100} placeholder="e.g., 20" {...field} value={field.value ?? ''} onChange={e => field.onChange(parseFloat(e.target.value) || 0)} />
                      </FormControl>
                      <FormMessage />
                    </FormItem>
                  )} />
                </div>
              </div>
              <div className="space-y-4 pt-4 border-t">
                <h3 className="font-semibold text-sm text-primary flex items-center gap-2">
                  <TrendingUp className="h-4 w-4" /> After Raise
                </h3>
                <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                  <FormField control={form.control} name="incomeAfter" render={({ field }) => (
                    <FormItem>
                      <FormLabel>Annual Income After ($)</FormLabel>
                      <FormControl>
                        <Input type="number" placeholder="e.g., 75000" {...field} value={field.value ?? ''} onChange={e => field.onChange(parseFloat(e.target.value) || 0)} />
                      </FormControl>
                      <FormMessage />
                    </FormItem>
                  )} />
                  <FormField control={form.control} name="savingsRateAfter" render={({ field }) => (
                    <FormItem>
                      <FormLabel>Savings Rate After (%)</FormLabel>
                      <FormControl>
                        <Input type="number" min={0} max={100} placeholder="e.g., 15" {...field} value={field.value ?? ''} onChange={e => field.onChange(parseFloat(e.target.value) || 0)} />
                      </FormControl>
                      <FormMessage />
                    </FormItem>
                  )} />
                </div>
              </div>

              <Button type="submit" className="w-full">
                <Calculator className="mr-2 h-4 w-4" />
                Calculate Lifestyle Inflation
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
                <BarChart3 className="h-8 w-8 text-primary" />
                <div>
                  <CardTitle>Result</CardTitle>
                  <CardDescription>Spending change and savings sacrificed</CardDescription>
                </div>
              </div>
            </CardHeader>
            <CardContent className="space-y-6">
              <div className="text-center">
                <Badge variant={result.savingsRateDrop > 0 ? 'destructive' : result.savingsRateDrop < 0 ? 'default' : 'secondary'} className="text-lg px-4 py-2">
                  {result.savingsRateDrop > 0 ? 'Lifestyle inflation' : result.savingsRateDrop < 0 ? 'Savings increased' : 'Same rate'}
                </Badge>
                <p className="text-sm text-muted-foreground mt-2">{result.recommendation}</p>
              </div>

              <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
                <div className="text-center p-4 bg-muted/50 rounded-lg">
                  <DollarSign className="h-6 w-6 mx-auto mb-2 text-blue-600" />
                  <p className="font-semibold">Spending Before</p>
                  <p className="text-lg font-bold">${result.spendingBefore.toLocaleString(undefined, { maximumFractionDigits: 0 })}/yr</p>
                </div>
                <div className="text-center p-4 bg-muted/50 rounded-lg">
                  <DollarSign className="h-6 w-6 mx-auto mb-2 text-green-600" />
                  <p className="font-semibold">Spending After</p>
                  <p className="text-lg font-bold">${result.spendingAfter.toLocaleString(undefined, { maximumFractionDigits: 0 })}/yr</p>
                </div>
                <div className="text-center p-4 bg-muted/50 rounded-lg">
                  <TrendingUp className="h-6 w-6 mx-auto mb-2 text-amber-600" />
                  <p className="font-semibold">Lifestyle Inflation</p>
                  <p className="text-lg font-bold">${result.lifestyleInflationAmount.toLocaleString(undefined, { maximumFractionDigits: 0 })}/yr</p>
                </div>
                <div className="text-center p-4 bg-muted/50 rounded-lg">
                  <Target className="h-6 w-6 mx-auto mb-2 text-purple-600" />
                  <p className="font-semibold">Savings Sacrificed</p>
                  <p className="text-lg font-bold">${result.savingsSacrificedPerYear.toLocaleString(undefined, { maximumFractionDigits: 0 })}/yr</p>
                </div>
              </div>

              <Alert className={result.savingsRateDrop > 0 ? 'border-amber-200 bg-amber-50 dark:bg-amber-900/10' : 'border-green-200 bg-green-50 dark:bg-green-900/10'}>
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
            Understanding Lifestyle Inflation
          </CardTitle>
          <CardDescription>What it is and why it matters</CardDescription>
        </CardHeader>
        <CardContent>
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div className="p-4 bg-blue-50 dark:bg-blue-900/10 rounded-lg border border-blue-100 dark:border-blue-900/20">
              <h4 className="font-semibold mb-2 flex items-center gap-2 text-blue-700 dark:text-blue-300">
                <TrendingUp className="h-4 w-4" />
                What Is Lifestyle Inflation?
              </h4>
              <p className="text-sm text-muted-foreground mb-3">
                Lifestyle inflation is when you spend more as your income rises instead of saving the raise. A lower savings rate on a higher income means more spending and less wealth building. Resisting itâ€”keeping spending flat and saving the raiseâ€”builds wealth faster.
              </p>
            </div>
            <div className="p-4 bg-amber-50 dark:bg-amber-900/10 rounded-lg border border-amber-100 dark:border-amber-900/20">
              <h4 className="font-semibold mb-2 flex items-center gap-2 text-amber-700 dark:text-amber-300">
                <DollarSign className="h-4 w-4" />
                Savings Sacrificed
              </h4>
              <p className="text-sm text-muted-foreground mb-3">
                â€œSavings sacrificedâ€ is how much more you would save per year if you kept your old savings rate on your new income. It is (income after Ã— rate before) âˆ’ (income after Ã— rate after) = income after Ã— (rate before âˆ’ rate after).
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
              Spending = Income Ã— (1 âˆ’ Savings Rate)
            </p>
            <p className="font-mono text-sm text-center">
              Lifestyle Inflation ($/yr) = Spending After âˆ’ Spending Before
            </p>
            <p className="font-mono text-sm text-center">
              Savings Sacrificed ($/yr) = Income After Ã— (Rate Before âˆ’ Rate After)
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
          <CardDescription>Savings and budget tools</CardDescription>
        </CardHeader>
        <CardContent>
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
            <Link href="/monthly-savings-gap-calculator" className="block">
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
            <Link href="/savings-goal-timeline-calculator" className="block">
              <Card className="hover:shadow-md transition-shadow cursor-pointer">
                <CardContent className="p-4">
                  <div className="flex items-center gap-3">
                    <BarChart3 className="h-5 w-5 text-green-600" />
                    <div>
                      <p className="font-medium">Savings Goal Timeline</p>
                      <p className="text-sm text-muted-foreground">When will you hit your target?</p>
                    </div>
                  </div>
                </CardContent>
              </Card>
            </Link>
            <Link href="/cost-of-delay-investing-late-calculator" className="block">
              <Card className="hover:shadow-md transition-shadow cursor-pointer">
                <CardContent className="p-4">
                  <div className="flex items-center gap-3">
                    <Shield className="h-5 w-5 text-purple-600" />
                    <div>
                      <p className="font-medium">Cost of Delay (Investing)</p>
                      <p className="text-sm text-muted-foreground">Impact of starting late</p>
                    </div>
                  </div>
                </CardContent>
              </Card>
            </Link>
          </div>
        </CardContent>
      </Card>

      <section className="space-y-6 text-muted-foreground leading-relaxed bg-card p-6 md:p-10 rounded-lg shadow-lg" itemScope itemType="https://schema.org/FinanceSummary">
        <meta itemProp="name" content="Lifestyle Inflation: What It Is and How to Avoid It" />
        <meta itemProp="description" content="Understand lifestyle inflation: spending more as income rises instead of saving the raise. See how much you could save by keeping your old savings rate on your new income." />
        <meta itemProp="keywords" content="lifestyle inflation calculator, lifestyle creep, savings rate after raise, spending more as income rises" />
        <meta itemProp="author" content="MegaCalc Financial Team" />
        <meta itemProp="datePublished" content="2025-10-25" />
        <meta itemProp="url" content="/lifestyle-inflation-calculator" />

        <h1 className="text-3xl md:text-4xl font-extrabold text-foreground mb-4" itemProp="headline">Lifestyle Inflation: What It Is and How to Avoid It</h1>
        <p className="text-lg italic text-muted-foreground">Lifestyle inflation is when spending rises with income instead of saving the raise. This calculator shows how much more you spend after a raise and how much you could have saved by keeping your old savings rate.</p>

        <h2 className="text-2xl font-bold text-foreground mt-8 mb-4">Table of Contents: Jump to a Section</h2>
        <ul className="list-disc ml-6 space-y-2 text-primary">
          <li><a href="#what-is-li" className="hover:underline">What Is Lifestyle Inflation?</a></li>
          <li><a href="#how-calculated-li" className="hover:underline">How It Is Calculated</a></li>
          <li><a href="#avoid-li" className="hover:underline">How to Avoid It</a></li>
          <li><a href="#applications-li" className="hover:underline">Using This Calculator</a></li>
          <li><a href="#conclusion-li" className="hover:underline">Conclusion</a></li>
        </ul>
        <hr />

        <h2 id="what-is-li" className="text-2xl font-bold text-foreground pt-8" itemProp="articleSection">What Is Lifestyle Inflation?</h2>
        <p>Lifestyle inflation (sometimes called lifestyle creep) is when you spend more as your income rises. Instead of saving the raise, you upgrade housing, cars, or discretionary spending. The result: a lower savings rate on a higher income and slower wealth building.</p>

        <h3 className="text-xl font-semibold text-foreground mt-6">Why It Matters</h3>
        <p>Even a small drop in savings rate after a raise can mean thousands less saved per year. Over decades, that compounds into a much smaller nest egg. Resisting lifestyle inflationâ€”keeping spending flat and saving the raiseâ€”dramatically accelerates wealth building.</p>

        <h3 className="text-xl font-semibold text-foreground mt-6">Who Is Affected</h3>
        <p>Anyone whose spending rises with income: bigger apartment after a raise, new car when salary increases, more dining out. The calculator compares your income and savings rate before vs after a raise to show the increase in spending and the savings sacrificed.</p>

        <hr />

        <h2 id="how-calculated-li" className="text-2xl font-bold text-foreground pt-8" itemProp="articleSection">How It Is Calculated</h2>
        <p>Spending = Income Ã— (1 âˆ’ Savings Rate). Lifestyle inflation (dollars per year) = Spending after âˆ’ Spending before. Savings sacrificed = Income after Ã— (Rate before âˆ’ Rate after): how much more you would save per year if you kept the old rate on the new income.</p>

        <h3 className="text-xl font-semibold text-foreground mt-6">The Formula</h3>
        <div className="overflow-x-auto my-6 p-4 bg-muted border rounded-lg text-center">
          <p className="font-mono text-lg text-destructive font-bold">
            Spending = Income Ã— (1 âˆ’ Savings Rate)
          </p>
          <p className="font-mono text-sm mt-2">
            Savings Sacrificed = Income After Ã— (Rate Before âˆ’ Rate After)
          </p>
        </div>

        <hr />

        <h2 id="avoid-li" className="text-2xl font-bold text-foreground pt-8" itemProp="articleSection">How to Avoid It</h2>
        <p>When you get a raise, keep spending the same and save the difference. Automate the increase: raise your 401(k) or direct deposit to savings by the amount of the raise (after tax). If you never see the extra money in checking, you are less likely to spend it.</p>

        <h3 className="text-xl font-semibold text-foreground mt-6">Save the Raise</h3>
        <p>Commit to saving 50â€“100% of each raise. That way your savings rate rises over time and lifestyle inflation is minimized. You can still allow some spending increase, but the majority of the raise goes to savings.</p>

        <h3 className="text-xl font-semibold text-foreground mt-6">Track Spending</h3>
        <p>Track spending before and after raises. If spending rises in lockstep with income, you are inflating lifestyle. Aim to keep spending flat or growing more slowly than income so your savings rate climbs.</p>

        <hr />

        <h2 id="applications-li" className="text-2xl font-bold text-foreground pt-8" itemProp="articleSection">Using This Calculator</h2>
        <p>Enter annual income and savings rate before the raise, then annual income and savings rate after the raise. The calculator shows spending before/after, lifestyle inflation (increase in spending), and savings sacrificed (how much more you could save per year with the old rate on the new income).</p>

        <h3 className="text-xl font-semibold text-foreground mt-6">What Counts as Savings Rate</h3>
        <p>Savings rate = savings Ã· income (before or after tax, but be consistent). Include 401(k), IRA, taxable savings, and other investments. Exclude one-off windfalls; use ongoing monthly or annual savings and income.</p>

        <hr />

        <h2 id="conclusion-li" className="text-2xl font-bold text-foreground pt-8" itemProp="articleSection">Conclusion</h2>
        <p>Lifestyle inflation slows wealth building by increasing spending when income rises. Use this calculator to see how much more you spend after a raise and how much you could save by keeping your old savings rate. Resist lifestyle creep by saving the raise and keeping spending flat.</p>
      </section>

      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <Info className="h-5 w-5" />
            Frequently Asked Questions
          </CardTitle>
          <CardDescription>
            Common questions about lifestyle inflation
          </CardDescription>
        </CardHeader>
        <CardContent className="space-y-6">
          <div>
            <h4 className="font-semibold text-lg mb-3">What is lifestyle inflation?</h4>
            <p className="text-muted-foreground">
              Lifestyle inflation (lifestyle creep) is when you spend more as your income rises instead of saving the raise. Your savings rate drops on a higher income, so you build wealth more slowly. Resisting it means keeping spending flat and saving the raise.
            </p>
          </div>
          <div>
            <h4 className="font-semibold text-lg mb-3">What is â€œsavings sacrificedâ€?</h4>
            <p className="text-muted-foreground">
              It is how much more you would save per year if you kept your old savings rate on your new income. Formula: Income after Ã— (Rate before âˆ’ Rate after). It shows the opportunity cost of lowering your savings rate after a raise.
            </p>
          </div>
          <div>
            <h4 className="font-semibold text-lg mb-3">Should I use gross or net income?</h4>
            <p className="text-muted-foreground">
              Use the same basis for both before and after (e.g. gross or take-home). Savings rate = savings Ã· income. If you use take-home income, use take-home-based savings (after tax); if gross, include pre-tax 401(k) and gross income.
            </p>
          </div>
          <div>
            <h4 className="font-semibold text-lg mb-3">How do I avoid lifestyle inflation?</h4>
            <p className="text-muted-foreground">
              When you get a raise, save the difference: increase 401(k), IRA, or direct deposit to savings by the amount of the raise (after tax). Automate it so the extra money never hits checking. Commit to saving 50â€“100% of each raise.
            </p>
          </div>
          <div>
            <h4 className="font-semibold text-lg mb-3">What if my savings rate went up after the raise?</h4>
            <p className="text-muted-foreground">
              If you entered a higher savings rate after the raise, â€œsavings sacrificedâ€ will be negativeâ€”meaning you are saving more per year than if you had kept the old rate. That is the opposite of lifestyle inflation and accelerates wealth building.
            </p>
          </div>
          <div>
            <h4 className="font-semibold text-lg mb-3">How much of a raise should I save?</h4>
            <p className="text-muted-foreground">
              A common rule is to save 50â€“100% of each raise. If you save 100%, your spending stays flat and your savings rate rises. Saving 50% still improves the rate while allowing some lifestyle increase. The calculator shows the cost of saving less.</p>
          </div>
          <div>
            <h4 className="font-semibold text-lg mb-3">Does lifestyle inflation affect retirement?</h4>
            <p className="text-muted-foreground">
              Yes. If spending rises with every raise, you need a larger nest egg to maintain that spending in retirement. Resisting lifestyle inflation means a higher savings rate over time and a lower retirement spending target, so you need less to retire.</p>
          </div>
          <div>
            <h4 className="font-semibold text-lg mb-3">What if my â€œafterâ€ income is lower (job change, part-time)?</h4>
            <p className="text-muted-foreground">
              You can still use the calculator: enter the higher income as â€œbeforeâ€ and the lower as â€œafter.â€ If your savings rate stays the same or rises, you are cutting spending rather than inflating lifestyleâ€”which is the right response to lower income.</p>
          </div>
          <div>
            <h4 className="font-semibold text-lg mb-3">How do I track savings rate over time?</h4>
            <p className="text-muted-foreground">
              Savings rate = savings Ã· income (both annual or both monthly; be consistent). Track in a spreadsheet or budget app: each month or year, sum savings (401(k), IRA, taxable, etc.) and divide by income. After each raise, compare new rate to old to see if you inflated lifestyle.</p>
          </div>
          <div>
            <h4 className="font-semibold text-lg mb-3">What counts as â€œsavingsâ€ for the savings rate?</h4>
            <p className="text-muted-foreground">
              Include 401(k), IRA, HSA, taxable brokerage, and savings account contributionsâ€”anything that increases net worth rather than spending. Use the same definition for before and after so the comparison is fair. Employer match can be included in both savings and income if you want to reflect total compensation.</p>
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
                <strong className="block text-primary mb-1">Anyone Who Got a Raise</strong>
                <span className="text-sm text-muted-foreground">To see how much extra spending (lifestyle inflation) you have and how much you could save by keeping your old savings rate.</span>
              </div>
              <div className="p-3 bg-muted/50 rounded-lg border border-border/50">
                <strong className="block text-primary mb-1">Planners and Budgeters</strong>
                <span className="text-sm text-muted-foreground">To quantify the cost of a lower savings rate after income increases and to plan â€œsave the raiseâ€ strategy.</span>
              </div>
              <div className="p-3 bg-muted/50 rounded-lg border border-border/50">
                <strong className="block text-primary mb-1">High Earners & Career Climbers</strong>
                <span className="text-sm text-muted-foreground">To avoid spending every raise and to keep savings rate high as income grows for faster wealth building.</span>
              </div>
              <div className="p-3 bg-muted/50 rounded-lg border border-border/50">
                <strong className="block text-primary mb-1">Retirement Savers</strong>
                <span className="text-sm text-muted-foreground">To see how lifestyle inflation reduces annual savings and extends years to retirement or lowers retirement income.</span>
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
                <span><strong>Consistent basis:</strong> Use the same income and savings definition for before and after (e.g. gross vs net, monthly vs annual).</span>
              </li>
              <li className="flex gap-2">
                <CheckCircle2 className="h-4 w-4 text-amber-500 shrink-0 mt-0.5" />
                <span><strong>One raise:</strong> Calculator compares one â€œbeforeâ€ and one â€œafterâ€ snapshot. For multiple raises, re-run with new before = old after.</span>
              </li>
              <li className="flex gap-2">
                <CheckCircle2 className="h-4 w-4 text-amber-500 shrink-0 mt-0.5" />
                <span><strong>No investment growth:</strong> â€œSavings sacrificedâ€ is contributions only; compound growth over time would increase the gap further.</span>
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
                <h5 className="font-semibold text-green-800 dark:text-green-300 mb-1">Case A: $60k at 20% savings â†’ $75k at 15% savings</h5>
                <p className="text-sm text-green-700/80 dark:text-green-400">
                  Spending before $48k, after $63.75k. Lifestyle inflation $15,750/yr. Savings sacrificed = $75k Ã— (20% âˆ’ 15%) = $3,750/yr. Keeping 20% on $75k would save $15k/yr (vs $11.25k at 15%).
                </p>
              </div>
              <div className="p-4 rounded-lg bg-blue-50 dark:bg-blue-900/10 border border-blue-100 dark:border-blue-900/20">
                <h5 className="font-semibold text-blue-800 dark:text-blue-300 mb-1">Case B: $50k at 10% â†’ $65k at 20% (save the raise)</h5>
                <p className="text-sm text-blue-700/80 dark:text-blue-400">
                  Savings rate increased. Spending before $45k, after $52k. Savings sacrificed is negative: you are saving $6,500 more per year than if you had kept 10% on $65k. You saved the raise and more.
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
          <p>The Lifestyle Inflation Calculator compares income and savings rate before vs after a raise. It shows spending before/after, lifestyle inflation (increase in spending), and savings sacrificed (how much more you could save per year with your old rate on the new income).</p>
          <p>Resist lifestyle creep by saving the raise and keeping spending flat.</p>
        </CardContent>
      </Card>
    </div>
  );
}

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
  savingsGoal: z.number().min(0.01, 'Enter savings goal amount'),
  monthsToGoal: z.number().min(1, 'Enter months to reach goal'),
  currentMonthlySavings: z.number().min(0, 'Enter current monthly savings'),
}).refine((data) => data.savingsGoal > 0 && data.monthsToGoal >= 1, { message: 'Goal and months must be positive', path: ['savingsGoal'] });

type FormValues = z.infer<typeof formSchema>;

const schemaMarkup = {
  '@context': 'https://schema.org',
  '@graph': [
    {
      '@type': 'SoftwareApplication',
      name: 'Monthly Savings Gap Calculator',
      applicationCategory: 'FinanceApplication',
      operatingSystem: 'Web Browser',
      description: 'Calculate the gap between required monthly savings to reach a goal and your current monthly savings. See how much more to save per month or how long it will take at your current rate.',
      url: 'https://mycalculating.com/finance/monthly-savings-gap-calculator',
      offers: { '@type': 'Offer', price: '0', priceCurrency: 'USD' },
    },
  ],
};

export default function MonthlySavingsGapCalculator() {
  const [result, setResult] = useState<{
    requiredMonthlySavings: number;
    gap: number;
    status: string;
    monthsAtCurrentRate: number;
    recommendation: string;
    insights: string[];
  } | null>(null);

  const form = useForm<FormValues>({
    resolver: zodResolver(formSchema),
    defaultValues: {
      savingsGoal: undefined,
      monthsToGoal: undefined,
      currentMonthlySavings: undefined,
    },
  });

  const calculate = (v: FormValues) => {
    const goal = v.savingsGoal || 0;
    const months = Math.max(1, Math.floor(v.monthsToGoal || 1));
    const current = v.currentMonthlySavings || 0;
    if (goal <= 0 || months < 1) return null;

    const requiredMonthlySavings = goal / months;
    const gap = requiredMonthlySavings - current;
    const monthsAtCurrentRate = current > 0 ? goal / current : Infinity;

    let status = 'On track';
    if (gap > 0) status = 'Shortfall';
    else if (gap < 0) status = 'Ahead';

    return {
      requiredMonthlySavings,
      gap,
      status,
      monthsAtCurrentRate: current > 0 ? goal / current : 0,
      recommendation: '',
      insights: [] as string[],
    };
  };

  const getRecommendation = (r: NonNullable<ReturnType<typeof calculate>>) => {
    if (r.gap > 0) {
      return `You need to save $${r.gap.toFixed(0)} more per month to reach your goal on time. Consider cutting expenses, increasing income, or extending the timeline.`;
    }
    if (r.gap < 0) {
      return `You are saving $${Math.abs(r.gap).toFixed(0)} more per month than required. You could reach the goal sooner or increase the goal.`;
    }
    return 'You are on track: your current monthly savings match what is required to reach your goal on time.';
  };

  const getInsights = (v: FormValues, r: NonNullable<ReturnType<typeof calculate>>) => {
    const insights = [];
    if (r.gap > 0 && r.monthsAtCurrentRate < 999) {
      insights.push(`At your current rate ($${(v.currentMonthlySavings || 0).toFixed(0)}/month), you would reach the goal in about ${Math.ceil(r.monthsAtCurrentRate)} months instead of ${Math.ceil(v.monthsToGoal || 1)}.`);
    }
    if (r.gap > 0) {
      insights.push('Closing the gap: increase monthly savings, extend the timeline, or reduce the goal amount.');
    }
    if (r.gap < 0) {
      insights.push('You could shorten the timeline or set a higher goal with your current savings rate.');
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
      <Script id="monthly-savings-gap-schema" type="application/ld+json" strategy="afterInteractive" dangerouslySetInnerHTML={{ __html: JSON.stringify(schemaMarkup) }} />

      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <Target className="h-5 w-5" />
            Monthly Savings Gap
          </CardTitle>
          <CardDescription>
            Enter your savings goal, timeline, and current monthly savings. The calculator shows required monthly savings, the gap (shortfall or surplus), and how long it would take at your current rate.
          </CardDescription>
        </CardHeader>
        <CardContent>
          <Form {...form}>
            <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-6">
              <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
                <FormField control={form.control} name="savingsGoal" render={({ field }) => (
                  <FormItem>
                    <FormLabel>Savings Goal ($)</FormLabel>
                    <FormControl>
                      <Input type="number" placeholder="e.g., 24000" {...field} value={field.value ?? ''} onChange={e => field.onChange(parseFloat(e.target.value) || 0)} />
                    </FormControl>
                    <FormMessage />
                  </FormItem>
                )} />
                <FormField control={form.control} name="monthsToGoal" render={({ field }) => (
                  <FormItem>
                    <FormLabel>Months to Reach Goal</FormLabel>
                    <FormControl>
                      <Input type="number" min={1} placeholder="e.g., 12" {...field} value={field.value ?? ''} onChange={e => field.onChange(parseInt(e.target.value, 10) || 0)} />
                    </FormControl>
                    <FormMessage />
                  </FormItem>
                )} />
                <FormField control={form.control} name="currentMonthlySavings" render={({ field }) => (
                  <FormItem>
                    <FormLabel>Current Monthly Savings ($)</FormLabel>
                    <FormControl>
                      <Input type="number" placeholder="e.g., 1200" {...field} value={field.value ?? ''} onChange={e => field.onChange(parseFloat(e.target.value) || 0)} />
                    </FormControl>
                    <FormMessage />
                  </FormItem>
                )} />
              </div>

              <Button type="submit" className="w-full">
                <Calculator className="mr-2 h-4 w-4" />
                Calculate Savings Gap
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
                  <CardTitle>Result</CardTitle>
                  <CardDescription>Required vs current monthly savings</CardDescription>
                </div>
              </div>
            </CardHeader>
            <CardContent className="space-y-6">
              <div className="text-center">
                <Badge variant={result.status === 'Shortfall' ? 'destructive' : result.status === 'Ahead' ? 'default' : 'secondary'} className="text-lg px-4 py-2">
                  {result.status}
                </Badge>
                <p className="text-sm text-muted-foreground mt-2">{result.recommendation}</p>
              </div>

              <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                <div className="text-center p-4 bg-muted/50 rounded-lg">
                  <DollarSign className="h-6 w-6 mx-auto mb-2 text-blue-600" />
                  <p className="font-semibold">Required Monthly</p>
                  <p className="text-lg font-bold">${result.requiredMonthlySavings.toLocaleString(undefined, { maximumFractionDigits: 0 })}</p>
                </div>
                <div className="text-center p-4 bg-muted/50 rounded-lg">
                  <BarChart3 className="h-6 w-6 mx-auto mb-2 text-green-600" />
                  <p className="font-semibold">Monthly Gap</p>
                  <p className="text-lg font-bold">{result.gap >= 0 ? '+' : ''}${result.gap.toLocaleString(undefined, { maximumFractionDigits: 0 })}</p>
                  <p className="text-xs text-muted-foreground">{result.gap > 0 ? 'Shortfall' : result.gap < 0 ? 'Surplus' : 'On track'}</p>
                </div>
                <div className="text-center p-4 bg-muted/50 rounded-lg">
                  <Target className="h-6 w-6 mx-auto mb-2 text-purple-600" />
                  <p className="font-semibold">Months at Current Rate</p>
                  <p className="text-lg font-bold">{result.monthsAtCurrentRate >= 999 || result.monthsAtCurrentRate <= 0 ? 'â€”' : Math.ceil(result.monthsAtCurrentRate)}</p>
                </div>
              </div>

              <Alert className={result.gap > 0 ? 'border-amber-200 bg-amber-50 dark:bg-amber-900/10' : 'border-green-200 bg-green-50 dark:bg-green-900/10'}>
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
            Understanding the Savings Gap
          </CardTitle>
          <CardDescription>What the gap means and how to close it</CardDescription>
        </CardHeader>
        <CardContent>
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div className="p-4 bg-blue-50 dark:bg-blue-900/10 rounded-lg border border-blue-100 dark:border-blue-900/20">
              <h4 className="font-semibold mb-2 flex items-center gap-2 text-blue-700 dark:text-blue-300">
                <DollarSign className="h-4 w-4" />
                Required vs Current
              </h4>
              <p className="text-sm text-muted-foreground mb-3">
                Required monthly savings = Goal Ã· Months. The gap is required minus what you save now. A positive gap means you need to save more per month (or extend the timeline); a negative gap means you are ahead and could shorten the timeline or increase the goal.
              </p>
            </div>
            <div className="p-4 bg-amber-50 dark:bg-amber-900/10 rounded-lg border border-amber-100 dark:border-amber-900/20">
              <h4 className="font-semibold mb-2 flex items-center gap-2 text-amber-700 dark:text-amber-300">
                <Target className="h-4 w-4" />
                Closing the Gap
              </h4>
              <p className="text-sm text-muted-foreground mb-3">
                To close a shortfall: increase monthly savings (cut spending or raise income), extend the number of months, or reduce the goal. Automating transfers to savings right after payday helps keep you on track.
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
              Required Monthly Savings = Savings Goal Ã· Months to Goal
            </p>
            <p className="font-mono text-sm text-center">
              Monthly Gap = Required Monthly Savings âˆ’ Current Monthly Savings
            </p>
            <p className="font-mono text-sm text-center">
              Months at Current Rate = Savings Goal Ã· Current Monthly Savings (if current &gt; 0)
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
            <Link href="/savings-goal-timeline-calculator" className="block">
              <Card className="hover:shadow-md transition-shadow cursor-pointer">
                <CardContent className="p-4">
                  <div className="flex items-center gap-3">
                    <Target className="h-5 w-5 text-blue-600" />
                    <div>
                      <p className="font-medium">Savings Goal Timeline</p>
                      <p className="text-sm text-muted-foreground">When will you hit your target?</p>
                    </div>
                  </div>
                </CardContent>
              </Card>
            </Link>
            <Link href="/lifestyle-inflation-calculator" className="block">
              <Card className="hover:shadow-md transition-shadow cursor-pointer">
                <CardContent className="p-4">
                  <div className="flex items-center gap-3">
                    <BarChart3 className="h-5 w-5 text-green-600" />
                    <div>
                      <p className="font-medium">Lifestyle Inflation</p>
                      <p className="text-sm text-muted-foreground">Impact of spending more as income rises</p>
                    </div>
                  </div>
                </CardContent>
              </Card>
            </Link>
            <Link href="/emergency-fund-requirement-calculator" className="block">
              <Card className="hover:shadow-md transition-shadow cursor-pointer">
                <CardContent className="p-4">
                  <div className="flex items-center gap-3">
                    <Shield className="h-5 w-5 text-purple-600" />
                    <div>
                      <p className="font-medium">Emergency Fund Requirement</p>
                      <p className="text-sm text-muted-foreground">How much to save</p>
                    </div>
                  </div>
                </CardContent>
              </Card>
            </Link>
          </div>
        </CardContent>
      </Card>

      <section className="space-y-6 text-muted-foreground leading-relaxed bg-card p-6 md:p-10 rounded-lg shadow-lg" itemScope itemType="https://schema.org/FinanceSummary">
        <meta itemProp="name" content="Monthly Savings Gap: How Much More to Save to Reach Your Goal" />
        <meta itemProp="description" content="Calculate the gap between required monthly savings for a goal and your current monthly savings. See how much more to save per month or how long at your current rate." />
        <meta itemProp="keywords" content="monthly savings gap, savings gap calculator, how much to save per month, required monthly savings" />
        <meta itemProp="author" content="MegaCalc Financial Team" />
        <meta itemProp="datePublished" content="2025-10-25" />
        <meta itemProp="url" content="/monthly-savings-gap-calculator" />

        <h1 className="text-3xl md:text-4xl font-extrabold text-foreground mb-4" itemProp="headline">Monthly Savings Gap: How Much More to Save to Reach Your Goal</h1>
        <p className="text-lg italic text-muted-foreground">The savings gap is the difference between what you need to save each month to reach a goal on time and what you are actually saving. This calculator shows the gap and how long it would take at your current rate.</p>

        <h2 className="text-2xl font-bold text-foreground mt-8 mb-4">Table of Contents: Jump to a Section</h2>
        <ul className="list-disc ml-6 space-y-2 text-primary">
          <li><a href="#what-is-gap" className="hover:underline">What Is the Savings Gap?</a></li>
          <li><a href="#how-calculated" className="hover:underline">How It Is Calculated</a></li>
          <li><a href="#close-gap" className="hover:underline">How to Close the Gap</a></li>
          <li><a href="#applications-gap" className="hover:underline">Using This Calculator</a></li>
          <li><a href="#conclusion-gap" className="hover:underline">Conclusion</a></li>
        </ul>
        <hr />

        <h2 id="what-is-gap" className="text-2xl font-bold text-foreground pt-8" itemProp="articleSection">What Is the Savings Gap?</h2>
        <p>The monthly savings gap is the difference between the amount you need to save each month to reach a goal by a target date and the amount you are currently saving. A positive gap means you are short; a negative gap means you are ahead.</p>

        <h3 className="text-xl font-semibold text-foreground mt-6">Why It Matters</h3>
        <p>Knowing the gap helps you decide whether to increase savings, extend the timeline, or adjust the goal. Without it, you may miss the target date or save more than needed without realizing you could reach the goal sooner.</p>

        <h3 className="text-xl font-semibold text-foreground mt-6">Required vs Current</h3>
        <p>Required monthly savings = Goal Ã· Months to goal. Your current monthly savings may be higher or lower. The gap = Required âˆ’ Current. If the gap is positive, you need to save that much more per month (or change timeline/goal).</p>

        <hr />

        <h2 id="how-calculated" className="text-2xl font-bold text-foreground pt-8" itemProp="articleSection">How It Is Calculated</h2>
        <p>Required monthly savings = Savings goal Ã· Number of months to reach the goal. Monthly gap = Required monthly savings âˆ’ Current monthly savings. Months at current rate = Goal Ã· Current monthly savings (shows how long it would take if you never change).</p>

        <h3 className="text-xl font-semibold text-foreground mt-6">The Formula</h3>
        <div className="overflow-x-auto my-6 p-4 bg-muted border rounded-lg text-center">
          <p className="font-mono text-lg text-destructive font-bold">
            Required Monthly = Goal Ã· Months &nbsp;|&nbsp; Gap = Required âˆ’ Current
          </p>
        </div>

        <hr />

        <h2 id="close-gap" className="text-2xl font-bold text-foreground pt-8" itemProp="articleSection">How to Close the Gap</h2>
        <p>To close a shortfall: (1) Increase monthly savings by cutting spending or increasing income; (2) Extend the number of months to the goal; (3) Reduce the goal amount. Automating savings right after payday helps stay on track.</p>

        <h3 className="text-xl font-semibold text-foreground mt-6">Increase Savings</h3>
        <p>Redirect raises, bonuses, or windfalls to savings. Cut non-essential spending and move the difference to savings. Even small increases compound over time.</p>

        <h3 className="text-xl font-semibold text-foreground mt-6">Adjust Timeline or Goal</h3>
        <p>If you cannot save the full gap, extend the timeline so required monthly drops, or lower the goal. Better to hit a slightly smaller or later goal than to give up.</p>

        <hr />

        <h2 id="applications-gap" className="text-2xl font-bold text-foreground pt-8" itemProp="articleSection">Using This Calculator</h2>
        <p>Enter your savings goal (dollar amount), the number of months in which you want to reach it, and your current monthly savings. The calculator shows required monthly savings, the gap, and how many months it would take at your current rate.</p>

        <h3 className="text-xl font-semibold text-foreground mt-6">What Counts as Current Savings</h3>
        <p>Use the amount you actually put toward this goal each month (e.g. emergency fund, down payment, vacation). Include automatic transfers and manual deposits; exclude one-off windfalls unless you expect to repeat them.</p>

        <hr />

        <h2 id="conclusion-gap" className="text-2xl font-bold text-foreground pt-8" itemProp="articleSection">Conclusion</h2>
        <p>The monthly savings gap shows how much more (or less) you need to save each month to reach a goal on time. Use this calculator to see the gap, then close it by increasing savings, extending the timeline, or adjusting the goal.</p>
      </section>

      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <Info className="h-5 w-5" />
            Frequently Asked Questions
          </CardTitle>
          <CardDescription>
            Common questions about the monthly savings gap
          </CardDescription>
        </CardHeader>
        <CardContent className="space-y-6">
          <div>
            <h4 className="font-semibold text-lg mb-3">What is the monthly savings gap?</h4>
            <p className="text-muted-foreground">
              The monthly savings gap is the difference between how much you need to save each month to reach a goal by a target date and how much you are currently saving. A positive gap means you need to save more per month (or extend the timeline); a negative gap means you are ahead.
            </p>
          </div>
          <div>
            <h4 className="font-semibold text-lg mb-3">How do I close a savings gap?</h4>
            <p className="text-muted-foreground">
              Close a shortfall by: increasing monthly savings (cut spending or increase income), extending the number of months to the goal, or reducing the goal amount. Automating savings right after payday helps you stay on track.
            </p>
          </div>
          <div>
            <h4 className="font-semibold text-lg mb-3">Does this account for interest?</h4>
            <p className="text-muted-foreground">
              This calculator uses simple division (goal Ã· months). It does not compound interest. For goals in interest-bearing accounts, required monthly may be slightly lower; use a savings goal or compound-interest calculator if you want growth included.
            </p>
          </div>
          <div>
            <h4 className="font-semibold text-lg mb-3">What if my current savings are zero?</h4>
            <p className="text-muted-foreground">
              If you enter zero current monthly savings, the gap equals the required monthly amount and â€œmonths at current rateâ€ is not defined (you would never reach the goal without saving). Start with any amount you can and increase over time.
            </p>
          </div>
          <div>
            <h4 className="font-semibold text-lg mb-3">Can I use this for multiple goals?</h4>
            <p className="text-muted-foreground">
              Yes. Run the calculator once per goal (e.g. emergency fund, down payment, vacation). Add the required monthly amounts to see total monthly savings needed across goals; compare to your total current savings to see overall gap.
            </p>
          </div>
          <div>
            <h4 className="font-semibold text-lg mb-3">What if I canâ€™t save the full gap?</h4>
            <p className="text-muted-foreground">
              Extend the timeline (more months) so required monthly drops, or reduce the goal. Saving something is better than nothing; you can increase savings later as income or budget allows.</p>
          </div>
          <div>
            <h4 className="font-semibold text-lg mb-3">Should I include windfalls or one-time savings?</h4>
            <p className="text-muted-foreground">
              Use ongoing monthly savings for â€œcurrent monthly savings.â€ One-time windfalls (bonus, tax refund) can close the gap faster but are not repeated monthly; if you get them regularly, you could annualize and divide by 12 to approximate a monthly equivalent.</p>
          </div>
          <div>
            <h4 className="font-semibold text-lg mb-3">How does this differ from a savings goal timeline calculator?</h4>
            <p className="text-muted-foreground">
              A timeline calculator often asks â€œhow long to reach goal at current rate?â€ This calculator asks â€œhow much must I save per month to reach the goal by a target date?â€ and shows the gap between that and what you save now. Both are useful: one fixes timeline, one fixes monthly amount.</p>
          </div>
          <div>
            <h4 className="font-semibold text-lg mb-3">What if my goal is in years, not months?</h4>
            <p className="text-muted-foreground">
              Convert years to months (e.g. 2 years = 24 months) and enter that in â€œMonths to reach goal.â€ The calculator then gives required monthly savings and the gap.</p>
          </div>
          <div>
            <h4 className="font-semibold text-lg mb-3">When should I revisit my savings gap?</h4>
            <p className="text-muted-foreground">
              Revisit when your income or expenses change (raise, new job, rent change), when you get a windfall (bonus, tax refund) that could close the gap, or quarterly. Tracking over time shows whether you are closing the gap and staying on track for the goal.</p>
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
                <strong className="block text-primary mb-1">Anyone with a Savings Goal</strong>
                <span className="text-sm text-muted-foreground">To see how much to save per month and whether you are on track (emergency fund, down payment, vacation, etc.).</span>
              </div>
              <div className="p-3 bg-muted/50 rounded-lg border border-border/50">
                <strong className="block text-primary mb-1">Budgeters and Planners</strong>
                <span className="text-sm text-muted-foreground">To quantify the gap and decide whether to increase savings, extend the timeline, or adjust the goal.</span>
              </div>
              <div className="p-3 bg-muted/50 rounded-lg border border-border/50">
                <strong className="block text-primary mb-1">Emergency Fund or Down Payment Savers</strong>
                <span className="text-sm text-muted-foreground">To check required monthly vs current and close the gap by the target date.</span>
              </div>
              <div className="p-3 bg-muted/50 rounded-lg border border-border/50">
                <strong className="block text-primary mb-1">After a Raise or Side Income</strong>
                <span className="text-sm text-muted-foreground">To see how much of the increase to allocate to a goal so you hit the target on time.</span>
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
                <span><strong>No interest:</strong> Assumes no investment growth. For goals with growth, required monthly may be lower; use a compound-interest or savings-goal calculator for that.</span>
              </li>
              <li className="flex gap-2">
                <CheckCircle2 className="h-4 w-4 text-amber-500 shrink-0 mt-0.5" />
                <span><strong>Stable savings:</strong> Assumes you can save the same amount each month. If income or expenses vary, use an average or conservative estimate.</span>
              </li>
              <li className="flex gap-2">
                <CheckCircle2 className="h-4 w-4 text-amber-500 shrink-0 mt-0.5" />
                <span><strong>One goal at a time:</strong> Enter one goal per calculation; add required monthly amounts across goals to see total needed.</span>
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
                <h5 className="font-semibold text-green-800 dark:text-green-300 mb-1">Case A: Goal $24,000 in 12 months, current $1,200/month</h5>
                <p className="text-sm text-green-700/80 dark:text-green-400">
                  Required = $24,000 Ã· 12 = $2,000/month. Gap = $2,000 âˆ’ $1,200 = $800 shortfall. You need to save $800 more per month, or extend to 20 months at $1,200/month.
                </p>
              </div>
              <div className="p-4 rounded-lg bg-blue-50 dark:bg-blue-900/10 border border-blue-100 dark:border-blue-900/20">
                <h5 className="font-semibold text-blue-800 dark:text-blue-300 mb-1">Case B: Goal $6,000 in 12 months, current $600/month</h5>
                <p className="text-sm text-blue-700/80 dark:text-blue-400">
                  Required = $500/month. Gap = $500 âˆ’ $600 = âˆ’$100 (ahead). You could reach the goal in 10 months or increase the goal to $7,200 and still hit it in 12 months.
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
          <p>The Monthly Savings Gap Calculator shows required monthly savings (goal Ã· months), the gap (required âˆ’ current), and months to goal at your current rate. Use it to see how much more to save per month or how to adjust timeline or goal.</p>
          <p>Close a shortfall by increasing savings, extending the timeline, or reducing the goal.</p>
        </CardContent>
      </Card>
    </div>
  );
}

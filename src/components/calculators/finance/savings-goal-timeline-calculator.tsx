'use client';

import { useState, useEffect } from 'react';
import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import { z } from 'zod';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Form, FormControl, FormField, FormItem, FormLabel, FormMessage } from '@/components/ui/form';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Zap, TrendingUp, AlertCircle, Target, Info, Landmark, Calculator, DollarSign, BarChart3, Shield, Calendar, Clock, PiggyBank, ArrowRight, CheckCircle2, FunctionSquare } from 'lucide-react';
import { Badge } from '@/components/ui/badge';
import { Alert, AlertDescription } from '@/components/ui/alert';
import Link from 'next/link';

const formSchema = z.object({
  goalAmount: z.number().min(1).describe("The total amount you want to save."),
  currentSavings: z.number().min(0).describe("Money you have already saved."),
  monthlyContribution: z.number().min(0.01).describe("Amount you add each month."),
  annualReturn: z.number().min(0).max(100).describe("Expected annual interest rate (APY)."),
});

type FormValues = z.infer<typeof formSchema>;

export default function SavingsGoalTimelineCalculator() {
  const [result, setResult] = useState<{
    months: number;
    years: number;
    totalInterest: number;
    totalPrincipal: number;
    reachDate: string;
    acceleratedContribution: number;
    feasibility: string;
    interpretation: string;
    insights: string[];
    tips: string[];
  } | null>(null);

  const form = useForm<FormValues>({
    resolver: zodResolver(formSchema),
    defaultValues: {
      goalAmount: undefined,
      currentSavings: undefined,
      monthlyContribution: undefined,
      annualReturn: 5,
    },
  });

  const calculate = (v: FormValues) => {
    if (v.goalAmount === undefined || v.currentSavings === undefined || v.monthlyContribution === undefined || v.annualReturn === undefined) return null;

    if (v.currentSavings >= v.goalAmount) {
      return {
        months: 0,
        years: 0,
        totalInterest: 0,
        totalPrincipal: v.currentSavings,
        reachDate: "Already Reached",
        acceleratedContribution: 0,
        feasibility: "Done",
        interpretation: "You have already reached your savings goal!",
        insights: [],
        tips: []
      };
    }

    const r = v.annualReturn / 100 / 12;
    let balance = v.currentSavings;
    let months = 0;
    const maxMonths = 1200; // 100 year cap to prevent crash

    while (balance < v.goalAmount && months < maxMonths) {
      balance = balance * (1 + r) + v.monthlyContribution;
      months++;
    }

    if (months >= maxMonths) return null; // Unreachable

    const years = Math.floor(months / 12);
    const monthsRem = months % 12;

    const reachDate = new Date();
    reachDate.setMonth(reachDate.getMonth() + months);

    const totalContributed = v.currentSavings + (v.monthlyContribution * months);
    const totalInterest = balance - totalContributed;

    // Calculate acceleration: amount needed to finish 1 year earlier (if > 1 year)
    let acceleratedContribution = 0;
    if (years > 1) {
      // Simple iteration to find required contribution for (months - 12)
      const targetMonths = months - 12;
      // This is a complex annuity calc, iteratively solving or using formula is easier.
      // PMT = (FV - PV*(1+r)^n) / (( (1+r)^n - 1 ) / r)
      const n = targetMonths;
      if (n > 0) {
        const numerator = v.goalAmount - (v.currentSavings * Math.pow(1 + r, n));
        const denominator = (Math.pow(1 + r, n) - 1) / r;
        if (denominator > 0 && numerator > 0) {
          const requiredPmt = numerator / denominator;
          acceleratedContribution = requiredPmt - v.monthlyContribution;
        }
      }
    }

    return {
      months: monthsRem,
      years: years,
      totalInterest,
      totalPrincipal: totalContributed,
      reachDate: reachDate.toLocaleDateString('en-US', { month: 'long', year: 'numeric' }),
      acceleratedContribution,
      feasibility: months < 60 ? 'Short Term' : months < 120 ? 'Medium Term' : 'Long Term',
      interpretation: `You will reach your goal of $${v.goalAmount.toLocaleString()} in ${years} years and ${monthsRem} months.`,
      insights: [
        `Total Interest Earned: $${totalInterest.toLocaleString(undefined, { maximumFractionDigits: 0 })}`,
        `Your money is working for you: Interest covers ${(totalInterest / balance * 100).toFixed(1)}% of the goal.`,
        months > 120 ? "Target date is over 10 years away. Consider increasing contributions." : "Target is within a reasonable decade timeframe."
      ],
      tips: [
        acceleratedContribution > 0 ? `To reach goals 1 year sooner, increase monthly savings by +$${acceleratedContribution.toFixed(0)}.` : `Consistency is key. Automate the $${v.monthlyContribution} transfer.`,
        v.annualReturn < 3 ? "Inflation may erode your savings. Consider higher-yield accounts." : "Your assumed return rate is healthy for wealth building."
      ]
    };
  };

  const onSubmit = (values: FormValues) => {
    const res = calculate(values);
    if (res) setResult(res);
  };

  return (
    <div className="space-y-8">

      {/* Input Form */}
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <Target className="h-5 w-5" />
            Define Your Goal
          </CardTitle>
          <CardDescription>
            Enter your target and how much you can save monthly
          </CardDescription>
        </CardHeader>
        <CardContent>
          <Form {...form}>
            <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-6">
              <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                <FormField
                  control={form.control}
                  name="goalAmount"
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel className="flex items-center gap-2">
                        <Target className="h-4 w-4" />
                        Target Amount ($)
                      </FormLabel>
                      <FormControl>
                        <Input
                          type="number"
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
                  name="currentSavings"
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel className="flex items-center gap-2">
                        <PiggyBank className="h-4 w-4" />
                        Current Savings ($)
                      </FormLabel>
                      <FormControl>
                        <Input
                          type="number"
                          placeholder="e.g., 5000"
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
                  name="monthlyContribution"
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel className="flex items-center gap-2">
                        <DollarSign className="h-4 w-4" />
                        Monthly Contribution ($)
                      </FormLabel>
                      <FormControl>
                        <Input
                          type="number"
                          placeholder="e.g., 500"
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
                  name="annualReturn"
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel className="flex items-center gap-2">
                        <TrendingUp className="h-4 w-4" />
                        Annual Interest Rate (%)
                      </FormLabel>
                      <FormControl>
                        <Input
                          type="number"
                          step="0.1"
                          placeholder="e.g., 5.0"
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
                <Clock className="mr-2 h-4 w-4" />
                Calculate Timeline
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
                <Calendar className="h-8 w-8 text-primary" />
                <div>
                  <CardTitle>Goal Timeline</CardTitle>
                  <CardDescription>When you will cross the finish line</CardDescription>
                </div>
              </div>
            </CardHeader>
            <CardContent className="space-y-6">
              <div className="text-center">
                <p className="text-sm font-medium text-muted-foreground uppercase tracking-wider mb-1">Target Date</p>
                <p className="text-4xl font-bold text-primary">{result.reachDate}</p>
                <p className="text-lg text-muted-foreground mt-2">{result.interpretation}</p>
              </div>

              <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                <div className="text-center p-4 bg-muted/50 rounded-lg">
                  <Clock className="h-6 w-6 mx-auto mb-2 text-blue-600" />
                  <p className="font-semibold">Time Remaining</p>
                  <p className="text-xl font-bold">{result.years}Y {result.months}M</p>
                </div>
                <div className="text-center p-4 bg-muted/50 rounded-lg">
                  <TrendingUp className="h-6 w-6 mx-auto mb-2 text-green-600" />
                  <p className="font-semibold">Interest Earned</p>
                  <p className="text-xl font-bold text-green-700">+${result.totalInterest.toLocaleString(undefined, { maximumFractionDigits: 0 })}</p>
                </div>
                <div className="text-center p-4 bg-muted/50 rounded-lg">
                  <PiggyBank className="h-6 w-6 mx-auto mb-2 text-purple-600" />
                  <p className="font-semibold">Principal Saved</p>
                  <p className="text-xl font-bold">${result.totalPrincipal.toLocaleString(undefined, { maximumFractionDigits: 0 })}</p>
                </div>
              </div>

              <Alert className="bg-primary/5 border-primary/20">
                <Info className="h-4 w-4" />
                <AlertDescription>
                  <strong>Insight:</strong> {result.insights[1]}
                </AlertDescription>
              </Alert>
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
                <CardDescription>Accelerate your progress</CardDescription>
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

            <Card className="h-full border-green-100 bg-green-50/10 dark:border-green-900/20 dark:bg-green-900/5">
              <CardHeader>
                <CardTitle className="flex items-center gap-2 text-xl text-green-600 dark:text-green-400">
                  <Zap className="h-6 w-6" />
                  Action Plan
                </CardTitle>
                <CardDescription>Steps to improve</CardDescription>
              </CardHeader>
              <CardContent className="space-y-4">
                {result.tips.map((tip, index) => (
                  <div key={index} className="flex items-start gap-3 p-3 bg-green-50 dark:bg-green-900/10 rounded-lg border border-green-100 dark:border-green-900/20">
                    <ArrowRight className="h-5 w-5 text-green-600 dark:text-green-400 mt-0.5 shrink-0" />
                    <span className="text-sm font-medium text-green-800 dark:text-green-300">{tip}</span>
                  </div>
                ))}
              </CardContent>
            </Card>
          </div>
        </div>
      )}

      {/* Formula Used */}
      <Card className="mb-6">
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <FunctionSquare className="h-5 w-5" />
            Methodology
          </CardTitle>
        </CardHeader>
        <CardContent className="space-y-4">
          <div className="p-4 bg-muted rounded-lg overflow-x-auto">
            <p className="font-mono text-sm text-center">
              A = P(1 + r/n)^(nt) + PMT * [ ((1 + r/n)^(nt) - 1) / (r/n) ]
            </p>
          </div>
          <p className="text-sm text-muted-foreground mt-2">
            The calculator solves for <strong>time (t)</strong> in the Future Value of an Annuity formula, iteratively determining when the Total Value (A) exceeds your Goal Amount.
          </p>
        </CardContent>
      </Card>

      {/* Related Calculators */}
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <Calculator className="h-5 w-5" />
            Related Financial Tools
          </CardTitle>
          <CardDescription>
            Plan your financial future
          </CardDescription>
        </CardHeader>
        <CardContent>
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
            <Link href="/emergency-fund-requirement-calculator" className="block">
              <Card className="hover:shadow-md transition-shadow cursor-pointer">
                <CardContent className="p-4">
                  <div className="flex items-center gap-3">
                    <Shield className="h-5 w-5 text-blue-600" />
                    <div>
                      <p className="font-medium">Emergency Fund</p>
                      <p className="text-sm text-muted-foreground">Safety net planning</p>
                    </div>
                  </div>
                </CardContent>
              </Card>
            </Link>
            <Link href="/monthly-budget-planner-calculator" className="block">
              <Card className="hover:shadow-md transition-shadow cursor-pointer">
                <CardContent className="p-4">
                  <div className="flex items-center gap-3">
                    <BarChart3 className="h-5 w-5 text-green-600" />
                    <div>
                      <p className="font-medium">Budget Planner</p>
                      <p className="text-sm text-muted-foreground">Manage cash flow</p>
                    </div>
                  </div>
                </CardContent>
              </Card>
            </Link>
            <Link href="/compound-interest-calculator" className="block">
              <Card className="hover:shadow-md transition-shadow cursor-pointer">
                <CardContent className="p-4">
                  <div className="flex items-center gap-3">
                    <TrendingUp className="h-5 w-5 text-purple-600" />
                    <div>
                      <p className="font-medium">Compound Interest</p>
                      <p className="text-sm text-muted-foreground">Wealth growth</p>
                    </div>
                  </div>
                </CardContent>
              </Card>
            </Link>
            <Link href="/retirement-savings-calculator" className="block">
              <Card className="hover:shadow-md transition-shadow cursor-pointer">
                <CardContent className="p-4">
                  <div className="flex items-center gap-3">
                    <Landmark className="h-5 w-5 text-orange-600" />
                    <div>
                      <p className="font-medium">Retirement</p>
                      <p className="text-sm text-muted-foreground">Long-term investing</p>
                    </div>
                  </div>
                </CardContent>
              </Card>
            </Link>
            <Link href="/simple-inflation-adjusted-return-calculator" className="block">
              <Card className="hover:shadow-md transition-shadow cursor-pointer">
                <CardContent className="p-4">
                  <div className="flex items-center gap-3">
                    <DollarSign className="h-5 w-5 text-red-600" />
                    <div>
                      <p className="font-medium">Inflation Calc</p>
                      <p className="text-sm text-muted-foreground">Real value check</p>
                    </div>
                  </div>
                </CardContent>
              </Card>
            </Link>
            <Link href="/net-worth-calculator" className="block">
              <Card className="hover:shadow-md transition-shadow cursor-pointer">
                <CardContent className="p-4">
                  <div className="flex items-center gap-3">
                    <Target className="h-5 w-5 text-indigo-600" />
                    <div>
                      <p className="font-medium">Net Worth</p>
                      <p className="text-sm text-muted-foreground">Track total assets</p>
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
        <meta itemProp="name" content="Savings Goal Timeline Calculator: When Will I Reach My Financial Goals?" />
        <meta itemProp="description" content="Calculate exactly when you will achieve your savings goals based on monthly contributions and interest rates. Visualize your financial timeline and learn strategies to accelerate your progress." />
        <meta itemProp="keywords" content="savings goal calculator, time to save calculator, financial goal timeline, compound interest savings, how long to save money" />
        <meta itemProp="author" content="MegaCalc Financial Team" />
        <meta itemProp="datePublished" content="2025-10-20" />
        <meta itemProp="url" content="/savings-timeline-guide" />

        <h1 className="text-3xl md:text-4xl font-extrabold text-foreground mb-4" itemProp="headline">The Science of Time: Calculating Your Savings Timeline</h1>
        <p className="text-lg italic text-muted-foreground">"A goal without a timeline is just a dream." — Robert Herjavec. Learn how to transform your financial aspirations into a concrete schedule.</p>

        {/* TABLE OF CONTENTS */}
        <h2 className="text-2xl font-bold text-foreground mt-8 mb-4">Table of Contents</h2>
        <ul className="list-disc ml-6 space-y-2 text-primary">
          <li><a href="#how-it-works" className="hover:underline">The Mathematics of Goal Achievement</a></li>
          <li><a href="#accelerate" className="hover:underline">3 Ways to Speed Up Your Timeline</a></li>
          <li><a href="#smart-goals" className="hover:underline">Why SMART Goals Work Better</a></li>
          <li><a href="#inflation" className="hover:underline">The Invisible Enemy: Inflation</a></li>
          <li><a href="#automation" className="hover:underline">The Power of Automation</a></li>
        </ul>
        <hr />

        {/* SECTION 1: HOW IT WORKS */}
        <h2 id="how-it-works" className="text-2xl font-bold text-foreground pt-8" itemProp="articleSection">The Mathematics of Goal Achievement</h2>
        <p>Calculating a savings timeline isn't just division ($10,000 / $100 per month). It involves <strong>Compound Interest</strong>. As your savings grow, the interest earns interest, effectively acting as a "second contributor" to your fund.</p>
        <p>In the early months, your contributions do the heavy lifting. In later years (especially for long-term goals like retirement), the interest often contributes more than you do. This calculator accounts for this exponential growth curve.</p>

        <hr />

        {/* SECTION 2: ACCELERATE */}
        <h2 id="accelerate" className="text-2xl font-bold text-foreground pt-8" itemProp="articleSection">3 Ways to Speed Up Your Timeline</h2>
        <p>If the result says "15 Years" and you want it in "10 Years," you have three levers to pull:</p>

        <h3 className="text-xl font-semibold text-foreground mt-6">1. Increase Contributions (Most Effective)</h3>
        <p>This is the only variable 100% in your control. Cutting expenses to add $100/month can shave years off a timeline. The "Strategic Insights" above show exactly how much faster you'd reach the goal with small increases.</p>

        <h3 className="text-xl font-semibold text-foreground mt-6">2. Increase Return Rate (Riskier)</h3>
        <p>Moving from a 0.5% checking account to a 5% High-Yield Savings Account is a no-brainer. But trying to jump from 8% to 15% usually involves taking on significant risk in the stock market. Be careful not to gamble with short-term goal money.</p>

        <h3 className="text-xl font-semibold text-foreground mt-6">3. Decrease the Goal (The Last Resort)</h3>
        <p>Do you really need a $50,000 wedding, or would a $30,000 wedding be just as memorable? Lowering the finish line is the fastest way to cross it.</p>

        <hr />

        {/* SECTION 3: SMART GOALS */}
        <h2 id="smart-goals" className="text-2xl font-bold text-foreground pt-8" itemProp="articleSection">Why SMART Goals Work Better</h2>
        <p>Vague goals like "I want to be rich" never happen. Financial success requires the <strong>SMART</strong> framework:</p>
        <ul className="list-disc ml-6 space-y-2">
          <li><strong>S</strong>pecific: "I want $20,000 for a down payment."</li>
          <li><strong>M</strong>easurable: "I will track it in this calculator."</li>
          <li><strong>A</strong>ttainable: "I can afford $500/month."</li>
          <li><strong>R</strong>ealistic: "I won't assume a 50% return."</li>
          <li><strong>T</strong>ime-bound: "I want it by July 2028."</li>
        </ul>

        <hr />

        {/* SECTION 4: INFLATION */}
        <h2 id="inflation" className="text-2xl font-bold text-foreground pt-8" itemProp="articleSection">The Invisible Enemy: Inflation</h2>
        <p>A goal of $100,000 in 20 years won't buy what $100,000 buys today. At 3% inflation, prices double every 24 years.</p>
        <p><strong>Strategy:</strong> If your goal is long-term (&gt;5 years), aim higher than your sticker price. If you need $50k purchasing power in 10 years, aim for ~$67k to account for inflation.</p>

        <hr />

        {/* SECTION 5: AUTOMATION */}
        <h2 id="automation" className="text-2xl font-bold text-foreground pt-8" itemProp="articleSection">The Power of Automation</h2>
        <p>Willpower is a finite resource. Don't rely on "remembering" to transfer money. Set up an automatic transfer for the day <em>after</em> payday.</p>
        <p>When savings happen automatically, you adjust your lifestyle to the remaining balance. This is the simple secret of "Pay Yourself First."</p>
      </section>

      {/* FAQ Section */}
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <Info className="h-5 w-5" />
            Frequently Asked Questions (FAQ)
          </CardTitle>
          <CardDescription>
            Common questions about goal planning
          </CardDescription>
        </CardHeader>
        <CardContent>
          <div className="space-y-6">
            <div>
              <h4 className="font-semibold text-lg mb-3">What interest rate should I use?</h4>
              <p className="text-muted-foreground">
                For short-term goals (&lt;3 years), use High-Yield Savings rates (approx 4-5%). For medium-term (3-10 years), a conservative portfolio might earn 6-7%. For long-term (10+ years), the S&P 500 historically averages 10% (nominal) or 7% (real).
              </p>
            </div>

            <div>
              <h4 className="font-semibold text-lg mb-3">Does this calculator include taxes?</h4>
              <p className="text-muted-foreground">
                No. If you are saving in a taxable brokerage account, remember that you will owe capital gains tax on the <em>interest/growth</em> portion. You might want to inflate your goal by 15% to cover this.
              </p>
            </div>

            <div>
              <h4 className="font-semibold text-lg mb-3">My timeline is too long. What can I do?</h4>
              <p className="text-muted-foreground">
                Look for "found money." Tax refunds, work bonuses, or selling unused items can be dumped into the fund as one-time contributions, which drastically shortens the timeline.
              </p>
            </div>

            <div>
              <h4 className="font-semibold text-lg mb-3">Should I invest my emergency fund?</h4>
              <p className="text-muted-foreground">
                No. Emergency funds need safety and liquidity, not risk. Keep them in a savings account or money market fund, even if that means a slightly longer timeline to build it.
              </p>
            </div>

            <div>
              <h4 className="font-semibold text-lg mb-3">What if I miss a month?</h4>
              <p className="text-muted-foreground">
                Life happens. If you miss a contribution, try to make it up next month, or simply accept that your timeline will push back by one month (plus a tiny bit of lost interest).
              </p>
            </div>

            <div>
              <h4 className="font-semibold text-lg mb-3">Is it better to save weekly or monthly?</h4>
              <p className="text-muted-foreground">
                Mathematically, weekly contributions compound slightly faster than monthly ones, but the difference is negligible for most people. Choose the frequency that matches your paycheck.
              </p>
            </div>

            <div>
              <h4 className="font-semibold text-lg mb-3">How do I prioritize multiple goals?</h4>
              <p className="text-muted-foreground">
                Rank them by urgency. Emergency Fund is #1. High-interest Debt is #2. Then split remaining cash between other goals (e.g., 70% to House Fund, 30% to Vacation Fund).
              </p>
            </div>

            <div>
              <h4 className="font-semibold text-lg mb-3">Can I use this for retirement planning?</h4>
              <p className="text-muted-foreground">
                Yes, but retirement calculators are better because they account for salary increases, social security, and safe withdrawal rates. This tool is best for fixed-sum goals (House, Car, Wedding).
              </p>
            </div>

            <div>
              <h4 className="font-semibold text-lg mb-3">What is the "Rule of 72"?</h4>
              <p className="text-muted-foreground">
                A shortcut to estimate doubling time. Divide 72 by your interest rate. At 8% return, your money doubles every 9 years (72/8 = 9) even without new contributions.
              </p>
            </div>

            <div>
              <h4 className="font-semibold text-lg mb-3">Why are the first few years so slow?</h4>
              <p className="text-muted-foreground">
                Compounding takes time to "lift off." In the beginning, your balance is low, so interest is small. This is the "Valley of Disappointment." Stick with it—the growth accelerates significantly after the tipping point.
              </p>
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
          <p>The Savings Goal Timeline Calculator is a motivation engine. It translates abstract efforts into a specific finish line.</p>
          <p>By adjusting contributions and seeing the date move closer, you can find the optimal balance between saving aggressively and living comfortably.</p>
          <p>Use it to plan major life events like weddings, home purchases, or sabbaticals with confidence.</p>
        </CardContent>
      </Card>
    </div>
  );
}

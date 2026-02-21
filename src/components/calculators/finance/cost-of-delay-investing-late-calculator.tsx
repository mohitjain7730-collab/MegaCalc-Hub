'use client';

import { useState, useEffect } from 'react';
import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import { z } from 'zod';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Form, FormControl, FormField, FormItem, FormLabel, FormMessage } from '@/components/ui/form';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Zap, TrendingDown, AlertCircle, Target, Info, Landmark, Calculator, DollarSign, BarChart3, Shield, Clock, Hourglass, ArrowUpRight, TrendingUp, CheckCircle2, AlertTriangle, FunctionSquare } from 'lucide-react';
import { Badge } from '@/components/ui/badge';
import { Alert, AlertDescription } from '@/components/ui/alert';
import Link from 'next/link';

const formSchema = z.object({
  monthlyInvestment: z.number().min(1).describe("The amount you plan to invest each month."),
  yearsToGrow: z.number().min(1).max(100).describe("Total investment duration (e.g., years until retirement)."),
  annualReturn: z.number().min(0).max(100).describe("Expected annual rate of return (e.g., 8%)."),
  delayYears: z.number().min(1).max(50).describe("How long you wait to start (e.g., 5 years)."),
});

type FormValues = z.infer<typeof formSchema>;

export default function CostOfDelayInvestingLateCalculator() {
  const [result, setResult] = useState<{
    startNow: number;
    startLater: number;
    costOfDelay: number;
    catchUpMonthly: number;
    percentLost: number;
    interpretation: string;
    impactLevel: string;
    insights: string[];
    actionPlan: string[];
  } | null>(null);

  const form = useForm<FormValues>({
    resolver: zodResolver(formSchema),
    defaultValues: {
      monthlyInvestment: undefined,
      yearsToGrow: undefined,
      annualReturn: 7,
      delayYears: undefined,
    },
  });

  const calculate = (v: FormValues) => {
    if (v.monthlyInvestment === undefined || v.yearsToGrow === undefined || v.annualReturn === undefined || v.delayYears === undefined) return null;

    if (v.delayYears >= v.yearsToGrow) {
      // Technically this means they never invest
      return {
        startNow: 0,
        startLater: 0,
        costOfDelay: 0,
        catchUpMonthly: 0,
        percentLost: 100,
        interpretation: "If you delay for the entire duration, you invest nothing.",
        impactLevel: "Critical",
        insights: [],
        actionPlan: []
      }
    }

    const r = v.annualReturn / 100 / 12;
    const monthsTotal = v.yearsToGrow * 12;
    const monthsDelayed = v.delayYears * 12;
    const monthsActive = monthsTotal - monthsDelayed;

    // Future Value: PMT * (((1 + r)^n - 1) / r)
    // 1. Start Now
    const startNow = v.monthlyInvestment * ((Math.pow(1 + r, monthsTotal) - 1) / r);

    // 2. Start Later
    const startLater = v.monthlyInvestment * ((Math.pow(1 + r, monthsActive) - 1) / r);

    const costOfDelay = startNow - startLater;
    const percentLost = (costOfDelay / startNow) * 100;

    // 3. Catch Up Cost: What PMT is needed over 'monthsActive' to equal 'startNow'?
    // PV of Target = startNow. Formula: PMT = FV / ( ((1+r)^n - 1)/r )
    const requiredPmt = startNow / ((Math.pow(1 + r, monthsActive) - 1) / r);
    const catchUpMonthly = requiredPmt - v.monthlyInvestment;

    return {
      startNow,
      startLater,
      costOfDelay,
      catchUpMonthly,
      percentLost,
      impactLevel: percentLost > 50 ? "Critical" : percentLost > 25 ? "Significant" : "Moderate",
      interpretation: `Waiting ${v.delayYears} years will cost you $${costOfDelay.toLocaleString()} in future wealth.`,
      insights: [
        `You lose ${percentLost.toFixed(1)}% of your potential portfolio by procrastinating.`,
        `To match the "Start Now" result, you'd need to invest $${Math.round(requiredPmt).toLocaleString()}/mo instead of $${v.monthlyInvestment.toLocaleString()}/mo.`,
        `The cost of delay ($${costOfDelay.toLocaleString(undefined, { maximumFractionDigits: 0 })}) is ${(costOfDelay / (v.monthlyInvestment * monthsDelayed)).toFixed(1)}x larger than the money you "saved" by not investing during the delay.`
      ],
      actionPlan: [
        "Start today, even with a smaller amount. The habit matters more than the total.",
        "If you must wait, open a high-yield savings account immediately to build initial capital.",
        "Automate your first contribution right now to break the paralysis analysis."
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
            <Hourglass className="h-5 w-5" />
            Time Value of Money
          </CardTitle>
          <CardDescription>
            See exactly how much procrastination costs your future self.
          </CardDescription>
        </CardHeader>
        <CardContent>
          <Form {...form}>
            <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-6">
              <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                <FormField
                  control={form.control}
                  name="monthlyInvestment"
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel className="flex items-center gap-2">
                        <DollarSign className="h-4 w-4" />
                        Monthly Investment ($)
                      </FormLabel>
                      <FormControl>
                        <Input
                          type="number"
                          placeholder="e.g., 500"
                          {...field}
                          onChange={e => field.onChange(parseFloat(e.target.value) || undefined)}
                        />
                      </FormControl>
                      <FormMessage />
                    </FormItem>
                  )}
                />
                <FormField
                  control={form.control}
                  name="yearsToGrow"
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel className="flex items-center gap-2">
                        <Clock className="h-4 w-4" />
                        Total Time Horizon (Years)
                      </FormLabel>
                      <FormControl>
                        <Input
                          type="number"
                          placeholder="e.g., 30"
                          {...field}
                          onChange={e => field.onChange(parseFloat(e.target.value) || undefined)}
                        />
                      </FormControl>
                      <FormMessage />
                    </FormItem>
                  )}
                />
                <FormField
                  control={form.control}
                  name="delayYears"
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel className="flex items-center gap-2">
                        <TrendingDown className="h-4 w-4" />
                        Delay Period (Years)
                      </FormLabel>
                      <FormControl>
                        <Input
                          type="number"
                          placeholder="e.g., 5"
                          {...field}
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
                        Annual Return (%)
                      </FormLabel>
                      <FormControl>
                        <Input
                          type="number"
                          step="0.1"
                          placeholder="e.g., 7.0"
                          {...field}
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
                Calculate Cost of Delay
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
                <AlertTriangle className="h-8 w-8 text-destructive" />
                <div>
                  <CardTitle>The Price of Waiting</CardTitle>
                  <CardDescription>Opportunity cost analysis</CardDescription>
                </div>
              </div>
            </CardHeader>
            <CardContent className="space-y-6">
              <div className="text-center">
                <p className="text-sm font-medium text-muted-foreground uppercase tracking-wider mb-1">Total Cost of Delay</p>
                <p className="text-4xl font-bold text-destructive">-${result.costOfDelay.toLocaleString(undefined, { maximumFractionDigits: 0 })}</p>
                <p className="text-lg text-muted-foreground mt-2">{result.interpretation}</p>
              </div>

              <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                <div className="text-center p-4 bg-muted/50 rounded-lg">
                  <TrendingUp className="h-6 w-6 mx-auto mb-2 text-green-600" />
                  <p className="font-semibold">Start Now</p>
                  <p className="text-2xl font-bold text-green-700">${result.startNow.toLocaleString(undefined, { maximumFractionDigits: 0 })}</p>
                </div>
                <div className="text-center p-4 bg-muted/50 rounded-lg">
                  <TrendingDown className="h-6 w-6 mx-auto mb-2 text-orange-600" />
                  <p className="font-semibold">Start Later</p>
                  <p className="text-2xl font-bold text-orange-700">${result.startLater.toLocaleString(undefined, { maximumFractionDigits: 0 })}</p>
                </div>
                <div className="text-center p-4 bg-muted/50 rounded-lg">
                  <ArrowUpRight className="h-6 w-6 mx-auto mb-2 text-blue-600" />
                  <p className="font-semibold">Catch Up Cost</p>
                  <p className="text-xl font-bold text-blue-700">+${Math.round(result.catchUpMonthly).toLocaleString()}/mo</p>
                  <p className="text-xs text-muted-foreground">Extra needed to match "Start Now"</p>
                </div>
              </div>

              <Alert className={`bg-primary/5 border-primary/20 ${result.percentLost > 25 ? 'bg-destructive/10 border-destructive/20' : ''}`}>
                <Info className="h-4 w-4" />
                <AlertDescription className="font-medium">
                  <strong>Impact Level: <Badge variant={result.percentLost > 25 ? "destructive" : "default"}>{result.impactLevel}</Badge></strong> You will sacrifice {result.percentLost.toFixed(1)}% of your potential wealth.
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
                  Key Insights
                </CardTitle>
                <CardDescription>Why this happens</CardDescription>
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

            <Card className="h-full border-orange-100 bg-orange-50/10 dark:border-orange-900/20 dark:bg-orange-900/5">
              <CardHeader>
                <CardTitle className="flex items-center gap-2 text-xl text-orange-600 dark:text-orange-400">
                  <Zap className="h-6 w-6" />
                  Action Plan
                </CardTitle>
                <CardDescription>Stop the bleeding</CardDescription>
              </CardHeader>
              <CardContent className="space-y-4">
                {result.actionPlan.map((tip, index) => (
                  <div key={index} className="flex items-start gap-3 p-3 bg-orange-50 dark:bg-orange-900/10 rounded-lg border border-orange-100 dark:border-orange-900/20">
                    <Zap className="h-5 w-5 text-orange-600 dark:text-orange-400 mt-0.5 shrink-0" />
                    <span className="text-sm font-medium text-orange-800 dark:text-orange-300">{tip}</span>
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
            Mathematical Logic
          </CardTitle>
        </CardHeader>
        <CardContent className="space-y-4">
          <div className="p-4 bg-muted rounded-lg overflow-x-auto">
            <p className="font-mono text-sm text-center">
              Cost = FV(Start Now) - FV(Start Later)
            </p>
            <p className="font-mono text-sm text-center mt-2">
              FV = Monthly × [((1 + r/12)^n - 1) / (r/12)]
            </p>
          </div>
          <p className="text-sm text-muted-foreground mt-2">
            The calculator compares two scenarios: investing for the full term (N years) vs. investing for a shortened term (N - Delay years). The difference represents the "Compound Interest Penalty" you pay for waiting.
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
            Optimize your investment strategy
          </CardDescription>
        </CardHeader>
        <CardContent>
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
            <Link href="/finance/compound-interest-calculator" className="block">
              <Card className="hover:shadow-md transition-shadow cursor-pointer">
                <CardContent className="p-4">
                  <div className="flex items-center gap-3">
                    <TrendingUp className="h-5 w-5 text-green-600" />
                    <div>
                      <p className="font-medium">Compound Interest</p>
                      <p className="text-sm text-muted-foreground">See growth potential</p>
                    </div>
                  </div>
                </CardContent>
              </Card>
            </Link>
            <Link href="/finance/savings-goal-timeline-calculator" className="block">
              <Card className="hover:shadow-md transition-shadow cursor-pointer">
                <CardContent className="p-4">
                  <div className="flex items-center gap-3">
                    <Target className="h-5 w-5 text-blue-600" />
                    <div>
                      <p className="font-medium">Goal Timeline</p>
                      <p className="text-sm text-muted-foreground">Planning targets</p>
                    </div>
                  </div>
                </CardContent>
              </Card>
            </Link>
            <Link href="/finance/retirement-savings-calculator" className="block">
              <Card className="hover:shadow-md transition-shadow cursor-pointer">
                <CardContent className="p-4">
                  <div className="flex items-center gap-3">
                    <Landmark className="h-5 w-5 text-orange-600" />
                    <div>
                      <p className="font-medium">Retirement</p>
                      <p className="text-sm text-muted-foreground">Long-term planning</p>
                    </div>
                  </div>
                </CardContent>
              </Card>
            </Link>
            <Link href="/finance/emergency-fund-requirement-calculator" className="block">
              <Card className="hover:shadow-md transition-shadow cursor-pointer">
                <CardContent className="p-4">
                  <div className="flex items-center gap-3">
                    <Shield className="h-5 w-5 text-indigo-600" />
                    <div>
                      <p className="font-medium">Emergency Fund</p>
                      <p className="text-sm text-muted-foreground">Risk protection</p>
                    </div>
                  </div>
                </CardContent>
              </Card>
            </Link>
            <Link href="/finance/monthly-budget-planner-calculator" className="block">
              <Card className="hover:shadow-md transition-shadow cursor-pointer">
                <CardContent className="p-4">
                  <div className="flex items-center gap-3">
                    <BarChart3 className="h-5 w-5 text-yellow-600" />
                    <div>
                      <p className="font-medium">Budget Planner</p>
                      <p className="text-sm text-muted-foreground">Free up cashflow</p>
                    </div>
                  </div>
                </CardContent>
              </Card>
            </Link>
            <Link href="/finance/simple-inflation-adjusted-return-calculator" className="block">
              <Card className="hover:shadow-md transition-shadow cursor-pointer">
                <CardContent className="p-4">
                  <div className="flex items-center gap-3">
                    <DollarSign className="h-5 w-5 text-red-600" />
                    <div>
                      <p className="font-medium">Inflation Calc</p>
                      <p className="text-sm text-muted-foreground">Adjust for purchasing power</p>
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
        <meta itemProp="name" content="Cost of Delay Calculator: The High Price of Procrastination" />
        <meta itemProp="description" content="Calculate exactly how much wealth you lose by delaying your investments. See the impact of compound interest and learn why starting today is your best financial strategy." />
        <meta itemProp="keywords" content="cost of delay calculator, investment delay cost, starting late investing, compound interest penalty, catch up contributions calculator" />
        <meta itemProp="author" content="MegaCalc Financial Team" />
        <meta itemProp="datePublished" content="2025-10-25" />
        <meta itemProp="url" content="/cost-of-delay-guide" />

        <h1 className="text-3xl md:text-4xl font-extrabold text-foreground mb-4" itemProp="headline">The High Cost of Waiting: Why Time in the Market Beats Timing the Market</h1>
        <p className="text-lg italic text-muted-foreground">"The best time to plant a tree was 20 years ago. The second best time is now." — Chinese Proverb. Discover why delaying your investment journey is the most expensive mistake you can make.</p>

        {/* TABLE OF CONTENTS */}
        <h2 className="text-2xl font-bold text-foreground mt-8 mb-4">Table of Contents</h2>
        <ul className="list-disc ml-6 space-y-2 text-primary">
          <li><a href="#compound-interest" className="hover:underline">The 8th Wonder of the World: Compound Interest</a></li>
          <li><a href="#cost-analysis" className="hover:underline">The Math: Why a 5-Year Delay Costs 50%</a></li>
          <li><a href="#how-to-catch-up" className="hover:underline">Strategies to Catch Up (Without Going Broke)</a></li>
          <li><a href="#psychology" className="hover:underline">The Psychology of "Waiting for the Right Time"</a></li>
          <li><a href="#dca" className="hover:underline">Dollar Cost Averaging: The Cure for Hesitation</a></li>
        </ul>
        <hr />

        {/* SECTION 1: COMPOUND INTEREST */}
        <h2 id="compound-interest" className="text-2xl font-bold text-foreground pt-8" itemProp="articleSection">The 8th Wonder of the World: Compound Interest</h2>
        <p>Albert Einstein reportedly called compound interest the "eighth wonder of the world." It is the principle where your money earns interest, and then that interest earns interest.</p>
        <p>When you delay investing, you aren't just missing out on the initial contributions. You are missing out on the <strong>decades of compounding</strong> that those early contributions would have generated. This is why the "Cost of Delay" is always shockingly higher than the amount you failed to save.</p>

        <hr />

        {/* SECTION 2: COST ANALYSIS */}
        <h2 id="cost-analysis" className="text-2xl font-bold text-foreground pt-8" itemProp="articleSection">The Math: Why a 5-Year Delay Costs 50%</h2>
        <p>Let's look at the numbers. Consider two investors, Early Erin and Late Larry. Both save $500/month at 8% return and retire at 65.</p>

        <h3 className="text-xl font-semibold text-foreground mt-6">The Early Bird Advantage</h3>
        <p>Erin starts at 25. By 65, she contributes $240,000 total. Her portfolio grows to approximately <strong>$1.75 Million</strong>.</p>

        <h3 className="text-xl font-semibold text-foreground mt-6">The Procrastination Tax</h3>
        <p>Larry waits until 35 (a 10-year delay). He contributes $180,000 total. His portfolio grows to only <strong>$750,000</strong>.</p>
        <p><strong>The Verdict:</strong> Larry didn't just lose the $60,000 he didn't save. He lost <strong>$1 Million</strong> in growth. That 10-year nap cost him a fortune.</p>

        <hr />

        {/* SECTION 3: HOW TO CATCH UP */}
        <h2 id="how-to-catch-up" className="text-2xl font-bold text-foreground pt-8" itemProp="articleSection">Strategies to Catch Up (Without Going Broke)</h2>
        <p>If you started late, don't panic. You can close the gap, but it requires effort. Use the calculator's "Catch Up Cost" metric to see exactly what is needed.</p>
        <ul className="list-disc ml-6 space-y-2">
          <li><strong>Double Down:</strong> You likely earn more now than you did 10 years ago. Increase your contributions aggressively.</li>
          <li><strong>Work Longer:</strong> Delaying retirement by 3-5 years allows your portfolio to compound for the most powerful years of its cycle.</li>
          <li><strong>Lower Fees:</strong> Switch to low-cost index funds. Saving 1% in fees can add up to 20% to your final portfolio over decades.</li>
        </ul>

        <hr />

        {/* SECTION 4: PSYCHOLOGY */}
        <h2 id="psychology" className="text-2xl font-bold text-foreground pt-8" itemProp="articleSection">The Psychology of "Waiting for the Right Time"</h2>
        <p>Many people delay because they think the market is "too high" or "too volatile." This is a trap.</p>
        <div className="p-4 bg-blue-50 dark:bg-blue-900/20 rounded-lg my-4 border border-blue-100 dark:border-blue-900">
          <h4 className="font-bold text-blue-800 dark:text-blue-300">Time in the Market &gt; Timing the Market</h4>
          <p className="text-sm mt-2">Historically, missing just the 10 best days in the stock market over a 20-year period can cut your returns in half. You cannot predict these days. You just have to be invested.</p>
        </div>

        <hr />

        {/* SECTION 5: DCA */}
        <h2 id="dca" className="text-2xl font-bold text-foreground pt-8" itemProp="articleSection">Dollar Cost Averaging: The Cure for Hesitation</h2>
        <p>Dollar Cost Averaging (DCA) is the strategy of investing a fixed amount every month, regardless of what the market is doing.</p>
        <p>This removes emotion from the equation. When the market is down, your $500 buys more shares. When it's high, it buys fewer. Over time, you pay a fair average price, and most importantly, <strong>you actually defined a starting line.</strong></p>
      </section>

      {/* FAQ Section */}
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <Info className="h-5 w-5" />
            Frequently Asked Questions (FAQ)
          </CardTitle>
          <CardDescription>
            Common questions about investment timing
          </CardDescription>
        </CardHeader>
        <CardContent>
          <div className="space-y-6">
            <div>
              <h4 className="font-semibold text-lg mb-3">Is it too late for me to start investing at 40?</h4>
              <p className="text-muted-foreground">
                Absolutely not. While you missed the "early" window, 40 to 65 is still 25 years of growth. With higher contributions (catch-up contributions), you can still build a substantial nest egg. Starting at 40 is infinitely better than starting at 45.
              </p>
            </div>

            <div>
              <h4 className="font-semibold text-lg mb-3">Should I wait until I have $10,000 to invest?</h4>
              <p className="text-muted-foreground">
                No. This is a common myth. Many platforms allow you to start with as little as $5 or $50. Waiting to accumulate a lump sum often leads to spending that money on other things. Start small and automate it now.
              </p>
            </div>

            <div>
              <h4 className="font-semibold text-lg mb-3">What if the market crashes right after I start?</h4>
              <p className="text-muted-foreground">
                If you are investing for the long term (10+ years), a crash is actually good for you. It means your monthly contributions are buying shares "on sale." History shows markets recover and grow over long horizons.
              </p>
            </div>

            <div>
              <h4 className="font-semibold text-lg mb-3">Does this calculator account for inflation?</h4>
              <p className="text-muted-foreground">
                No, this calculates "nominal" returns. To see "real" purchasing power, subtract the inflation rate (e.g., 3%) from your Return Rate. So enter 5% instead of 8% to see the value in today's dollars.
              </p>
            </div>

            <div>
              <h4 className="font-semibold text-lg mb-3">Why is the "Catch Up" amount so high?</h4>
              <p className="text-muted-foreground">
                Because your new money has less time to grow. In the early years, interest does the heavy lifting. In later years, <em>you</em> have to do the heavy lifting with raw capital to compensate for the lack of time.
              </p>
            </div>

            <div>
              <h4 className="font-semibold text-lg mb-3">Should I pay off debt before investing?</h4>
              <p className="text-muted-foreground">
                It depends. If the debt interest is high (&gt;7%), pay it first—that's a guaranteed return. If it's low (mortgage at 3%), investing usually yields better results. Always get your employer 401k match regardless of debt—that's a 100% return.
              </p>
            </div>

            <div>
              <h4 className="font-semibold text-lg mb-3">What if I can't afford to invest right now?</h4>
              <p className="text-muted-foreground">
                Audit your budget. Even $50/month creates a habit. If you truly have zero margin, focus on increasing income (side hustle, promotion) with the specific goal of funding an investment account.
              </p>
            </div>

            <div>
              <h4 className="font-semibold text-lg mb-3">Does waiting for a higher salary make sense?</h4>
              <p className="text-muted-foreground">
                Rarely. While a higher salary helps, the lost years of compounding are hard to replace. It is better to invest 5% of a small salary at 22 than 10% of a large salary at 35.
              </p>
            </div>

            <div>
              <h4 className="font-semibold text-lg mb-3">How does compound frequency affect this?</h4>
              <p className="text-muted-foreground">
                This calculator assumes monthly compounding, which reflects standard market behavior for regular contributors. Daily or annual compounding would change the numbers slightly, but the lesson remains the same.
              </p>
            </div>

            <div>
              <h4 className="font-semibold text-lg mb-3">What investment vehicle should I use?</h4>
              <p className="text-muted-foreground">
                For long-term growth, broad market index funds (like S&P 500) or Target Date Funds are standard recommendations. They offer diversity and historically consistent returns over decades.
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
          <p>The Cost of Delay Calculator quantifies the exact financial penalty of procrastination.</p>
          <p>It demonstrates that time is your most valuable asset—often more valuable than the amount of money you invest.</p>
          <p>Use this data to motivate yourself to start today, knowing that perfect is the enemy of done.</p>
        </CardContent>
      </Card>
    </div>
  );
}

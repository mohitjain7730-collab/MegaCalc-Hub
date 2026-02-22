'use client';

import { useState, useEffect } from 'react';
import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import { z } from 'zod';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Form, FormControl, FormField, FormItem, FormLabel, FormMessage } from '@/components/ui/form';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Zap, TrendingUp, AlertCircle, Target, Info, Landmark, Calculator, DollarSign, BarChart3, Shield, PieChart, Wallet, CreditCard, ShoppingBag, Home, FunctionSquare, CheckCircle2 } from 'lucide-react';
import { Badge } from '@/components/ui/badge';
import { Alert, AlertDescription } from '@/components/ui/alert';
import Link from 'next/link';

const formSchema = z.object({
  currentNetWorth: z.number().min(0).describe("Total current employment and investment assets"),
  annualSpending: z.number().min(1).describe("Projected yearly expenses in retirement"),
  annualIncome: z.number().min(1).describe("Annual Take-Home Income (Net)"),
  growthRate: z.number().min(0).max(15).describe("Expected return on investments (e.g. 7%)"),
  withdrawalRate: z.number().min(1).max(10).describe("Safe Withdrawal Rate (e.g. 4%)"),
});

type FormValues = z.infer<typeof formSchema>;

export default function FIRECalculator() {
  const [result, setResult] = useState<{
    fireNumber: number;
    yearsToFire: number;
    savingsRate: number;
    fireAge: number | string; // Just strictly string "N/A" if too long
    leanFire: number;
    fatFire: number;
    interpretation: string;
    insights: string[];
    actionPlan: string[];
  } | null>(null);

  const form = useForm<FormValues>({
    resolver: zodResolver(formSchema),
    defaultValues: {
      currentNetWorth: 50000,
      annualSpending: 40000,
      annualIncome: 80000,
      growthRate: 7,
      withdrawalRate: 4,
    },
  });

  const calculate = (v: FormValues) => {
    if (v.annualSpending === undefined || v.withdrawalRate === undefined) return null;

    // 1. Calculate Target (FIRE Number)
    // FIRE Number = Annual Spending / Withdrawal Rate (as decimal)
    // e.g. 40,000 / 0.04 = 1,000,000
    const fireNumber = v.annualSpending / (v.withdrawalRate / 100);
    const leanFire = (v.annualSpending * 0.8) / (v.withdrawalRate / 100);
    const fatFire = (v.annualSpending * 2) / (v.withdrawalRate / 100);

    // 2. Savings Rate logic
    // Savings = Income - Spending
    const annualSavings = v.annualIncome - v.annualSpending;
    const savingsRate = (annualSavings / v.annualIncome) * 100;

    let yearsToFire = 999;

    // 3. Time calculation
    // FV = PV * (1+r)^t + PMT * [((1+r)^t - 1) / r]
    // We need to solve for t. This is hard algebraically, so we iterate.

    if (annualSavings <= 0) {
      yearsToFire = 999; // Never reach it
    } else {
      let currentAmount = v.currentNetWorth;
      let years = 0;
      const r = v.growthRate / 100;

      // Loop up to 100 years
      while (currentAmount < fireNumber && years < 100) {
        currentAmount = (currentAmount * (1 + r)) + annualSavings;
        years++;
      }
      yearsToFire = years;
    }

    // Interpretation
    let interpretation = "";
    if (yearsToFire === 999) {
      interpretation = "At your current spending level, you are not saving any money. You will never reach Financial Independence without reducing expenses or increasing income.";
    } else if (yearsToFire > 50) {
      interpretation = "You are on a very slow path. It will take over 50 years to reach freedom. You need to drastically cut expenses.";
    } else if (yearsToFire < 10) {
      interpretation = "Incredible! You are on the 'Fast Track' to financial freedom. You will likely retire in less than a decade.";
    } else {
      interpretation = `You are on a steady path. Consistent investing will get you there in ${yearsToFire} years.`;
    }

    return {
      fireNumber,
      yearsToFire,
      savingsRate,
      fireAge: yearsToFire === 999 ? "∞" : yearsToFire,
      leanFire,
      fatFire,
      interpretation,
      insights: [
        `Your calculated Savings Rate is ${savingsRate.toFixed(1)}%.`,
        `The difference between a 10% and 50% savings rate is decreasing your working career by approximately 30 years.`,
        annualSavings > 0 ? `You are saving $${annualSavings.toLocaleString()} per year.` : `You are spending more than you earn.`
      ],
      actionPlan: [
        annualSavings <= 0 ? "You have a negative savings rate. Audit your budget immediately." : "Automate your investments so you never see the money.",
        "Ensure your portfolio is 80%+ stocks during the accumulation phase for maximum growth.",
        `Review your "Big 3" expenses: Housing, Transport, Food. Cutting these accelerates FIRE fastest.`
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
            <Zap className="h-5 w-5" />
            FIRE Configuration
          </CardTitle>
          <CardDescription>
            Input your financials to uncover your "Freedom Date".
          </CardDescription>
        </CardHeader>
        <CardContent>
          <Form {...form}>
            <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-6">

              <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                {/* Income & Expense */}
                <div className="space-y-6">
                  <FormField
                    control={form.control}
                    name="annualIncome"
                    render={({ field }) => (
                      <FormItem>
                        <FormLabel className="flex items-center gap-2">
                          <Wallet className="h-4 w-4" />
                          Annual Income (Net)
                        </FormLabel>
                        <FormControl>
                          <Input
                            type="number"
                            placeholder="e.g., 80000"
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
                    name="annualSpending"
                    render={({ field }) => (
                      <FormItem>
                        <FormLabel className="flex items-center gap-2">
                          <ShoppingBag className="h-4 w-4" />
                          Annual Spending
                        </FormLabel>
                        <FormControl>
                          <Input
                            type="number"
                            placeholder="e.g., 40000"
                            {...field}
                            onChange={e => field.onChange(parseFloat(e.target.value) || undefined)}
                          />
                        </FormControl>
                        <FormMessage />
                      </FormItem>
                    )}
                  />
                </div>

                {/* Assets & Assumptions */}
                <div className="space-y-6">
                  <FormField
                    control={form.control}
                    name="currentNetWorth"
                    render={({ field }) => (
                      <FormItem>
                        <FormLabel className="flex items-center gap-2">
                          <Landmark className="h-4 w-4" />
                          Current Portfolio Value
                        </FormLabel>
                        <FormControl>
                          <Input
                            type="number"
                            placeholder="e.g., 50000"
                            {...field}
                            onChange={e => field.onChange(parseFloat(e.target.value) || undefined)}
                          />
                        </FormControl>
                        <FormMessage />
                      </FormItem>
                    )}
                  />
                  <div className="grid grid-cols-2 gap-4">
                    <FormField
                      control={form.control}
                      name="growthRate"
                      render={({ field }) => (
                        <FormItem>
                          <FormLabel className="text-xs">Growth (%)</FormLabel>
                          <FormControl>
                            <Input
                              type="number"
                              placeholder="7"
                              step="0.1"
                              {...field}
                              onChange={e => field.onChange(parseFloat(e.target.value) || undefined)}
                            />
                          </FormControl>
                        </FormItem>
                      )}
                    />
                    <FormField
                      control={form.control}
                      name="withdrawalRate"
                      render={({ field }) => (
                        <FormItem>
                          <FormLabel className="text-xs">SWR (%)</FormLabel>
                          <FormControl>
                            <Input
                              type="number"
                              placeholder="4"
                              step="0.1"
                              {...field}
                              onChange={e => field.onChange(parseFloat(e.target.value) || undefined)}
                            />
                          </FormControl>
                        </FormItem>
                      )}
                    />
                  </div>
                </div>
              </div>

              <Button type="submit" className="w-full">
                <Calculator className="mr-2 h-4 w-4" />
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
                <BarChart3 className="h-8 w-8 text-primary" />
                <div>
                  <CardTitle>Your FIRE Status</CardTitle>
                  <CardDescription>Path to Independence</CardDescription>
                </div>
              </div>
            </CardHeader>
            <CardContent className="space-y-6">
              <div className="text-center">
                <p className="text-sm font-medium text-muted-foreground uppercase tracking-wider mb-1">Your FIRE Number</p>
                <p className="text-4xl font-bold text-primary">${result.fireNumber.toLocaleString(undefined, { maximumFractionDigits: 0 })}</p>
                <Badge variant={result.yearsToFire < 15 ? 'default' : 'secondary'} className="mt-3 text-lg py-1 px-4">
                  {result.yearsToFire === 999 ? "Never" : `${result.yearsToFire} Years to Go`}
                </Badge>
                <p className="text-sm text-muted-foreground mt-4 max-w-lg mx-auto">{result.interpretation}</p>
              </div>

              <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                <div className="text-center p-4 bg-muted/50 rounded-lg border border-border">
                  <PieChart className="h-6 w-6 mx-auto mb-2 text-blue-600" />
                  <p className="font-semibold">Savings Rate</p>
                  <p className="text-2xl font-bold text-blue-700">{result.savingsRate.toFixed(1)}%</p>
                  <p className="text-xs text-muted-foreground">CRITICAL METRIC</p>
                </div>
                <div className="text-center p-4 bg-muted/50 rounded-lg border border-border">
                  <ShoppingBag className="h-6 w-6 mx-auto mb-2 text-orange-600" />
                  <p className="font-semibold">Lean FIRE</p>
                  <p className="text-2xl font-bold text-orange-700">${result.leanFire.toLocaleString(undefined, { maximumFractionDigits: 0 })}</p>
                  <p className="text-xs text-muted-foreground">Minimalist Living</p>
                </div>
                <div className="text-center p-4 bg-muted/50 rounded-lg border border-border">
                  <Target className="h-6 w-6 mx-auto mb-2 text-green-600" />
                  <p className="font-semibold">Fat FIRE</p>
                  <p className="text-2xl font-bold text-green-700">${result.fatFire.toLocaleString(undefined, { maximumFractionDigits: 0 })}</p>
                  <p className="text-xs text-muted-foreground">Luxury Living</p>
                </div>
              </div>
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
                <CardDescription>Understanding your metrics</CardDescription>
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

            <Card className="h-full border-indigo-100 bg-indigo-50/10 dark:border-indigo-900/20 dark:bg-indigo-900/5">
              <CardHeader>
                <CardTitle className="flex items-center gap-2 text-xl text-indigo-600 dark:text-indigo-400">
                  <Zap className="h-6 w-6" />
                  Accelerate FIRE
                </CardTitle>
                <CardDescription>Speed up the process</CardDescription>
              </CardHeader>
              <CardContent className="space-y-4">
                {result.actionPlan.map((tip, index) => (
                  <div key={index} className="flex items-start gap-3 p-3 bg-indigo-50 dark:bg-indigo-900/10 rounded-lg border border-indigo-100 dark:border-indigo-900/20">
                    <Zap className="h-5 w-5 text-indigo-600 dark:text-indigo-400 mt-0.5 shrink-0" />
                    <span className="text-sm font-medium text-indigo-800 dark:text-indigo-300">{tip}</span>
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
            The 4% Rule Math
          </CardTitle>
        </CardHeader>
        <CardContent className="space-y-4">
          <div className="p-4 bg-muted rounded-lg overflow-x-auto">
            <p className="font-mono text-sm text-center">
              Target = Annual Spending / 0.04
            </p>
            <p className="font-mono text-sm text-center mt-2">
              (This equals Spending × 25)
            </p>
          </div>
          <p className="text-sm text-muted-foreground mt-2">
            The Trinity Study (1998) found that a portfolio of 50/50 stocks/bonds could sustain a 4% inflation-adjusted withdrawal rate for 30 years with a 95% success rate.
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
            Tools to help you reach FIRE
          </CardDescription>
        </CardHeader>
        <CardContent>
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
            <Link href="/monthly-budget-planner-calculator" className="block">
              <Card className="hover:shadow-md transition-shadow cursor-pointer">
                <CardContent className="p-4">
                  <div className="flex items-center gap-3">
                    <BarChart3 className="h-5 w-5 text-blue-600" />
                    <div>
                      <p className="font-medium">Budget Planner</p>
                      <p className="text-sm text-muted-foreground">Cut annual spending</p>
                    </div>
                  </div>
                </CardContent>
              </Card>
            </Link>
            <Link href="/cost-of-delay-investing-late-calculator" className="block">
              <Card className="hover:shadow-md transition-shadow cursor-pointer">
                <CardContent className="p-4">
                  <div className="flex items-center gap-3">
                    <AlertCircle className="h-5 w-5 text-red-600" />
                    <div>
                      <p className="font-medium">Cost of Delay</p>
                      <p className="text-sm text-muted-foreground">Start now!</p>
                    </div>
                  </div>
                </CardContent>
              </Card>
            </Link>
            <Link href="/side-income-goal-calculator" className="block">
              <Card className="hover:shadow-md transition-shadow cursor-pointer">
                <CardContent className="p-4">
                  <div className="flex items-center gap-3">
                    <Wallet className="h-5 w-5 text-green-600" />
                    <div>
                      <p className="font-medium">Side Income</p>
                      <p className="text-sm text-muted-foreground">Boost savings rate</p>
                    </div>
                  </div>
                </CardContent>
              </Card>
            </Link>
            <Link href="/savings-goal-timeline-calculator" className="block">
              <Card className="hover:shadow-md transition-shadow cursor-pointer">
                <CardContent className="p-4">
                  <div className="flex items-center gap-3">
                    <Target className="h-5 w-5 text-purple-600" />
                    <div>
                      <p className="font-medium">Goal Timeline</p>
                      <p className="text-sm text-muted-foreground">Track milestones</p>
                    </div>
                  </div>
                </CardContent>
              </Card>
            </Link>
            <Link href="/retirement-savings-calculator" className="block">
              <Card className="hover:shadow-md transition-shadow cursor-pointer">
                <CardContent className="p-4">
                  <div className="flex items-center gap-3">
                    <Landmark className="h-5 w-5 text-indigo-600" />
                    <div>
                      <p className="font-medium">Retirement</p>
                      <p className="text-sm text-muted-foreground">Traditional planning</p>
                    </div>
                  </div>
                </CardContent>
              </Card>
            </Link>
            <Link href="/compound-interest-calculator" className="block">
              <Card className="hover:shadow-md transition-shadow cursor-pointer">
                <CardContent className="p-4">
                  <div className="flex items-center gap-3">
                    <TrendingUp className="h-5 w-5 text-orange-600" />
                    <div>
                      <p className="font-medium">Compound Interest</p>
                      <p className="text-sm text-muted-foreground">See growth curve</p>
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
        <meta itemProp="name" content="FIRE Calculator: How to Retire in Your 30s or 40s" />
        <meta itemProp="description" content="Calculate your Financial Independence Retire Early (FIRE) number. Learn the 4% rule, optimize your savings rate, and design your exit strategy." />
        <meta itemProp="keywords" content="FIRE calculator, financial independence retire early, 4% rule calculator, lean fire vs fat fire, savings rate for retirement" />
        <meta itemProp="author" content="MegaCalc Financial Team" />
        <meta itemProp="datePublished" content="2025-11-01" />
        <meta itemProp="url" content="/fire-calculator-guide" />

        <h1 className="text-3xl md:text-4xl font-extrabold text-foreground mb-4" itemProp="headline">The FIRE Movement: A Mathematical Path to Freedom</h1>
        <p className="text-lg italic text-muted-foreground">"Retirement is not an age. It is a financial status." Discover how high savings rates can buy your freedom decades ahead of schedule.</p>

        {/* TABLE OF CONTENTS */}
        <h2 className="text-2xl font-bold text-foreground mt-8 mb-4">Table of Contents</h2>
        <ul className="list-disc ml-6 space-y-2 text-primary">
          <li><a href="#math" className="hover:underline">The Simple Math: Income - Spending = Freedom</a></li>
          <li><a href="#4percent" className="hover:underline">The 4% Rule Explained</a></li>
          <li><a href="#types" className="hover:underline">LeanFIRE, FatFIRE, and BaristaFIRE</a></li>
          <li><a href="#levers" className="hover:underline">The 3 Levers: Earn, Save, Invest</a></li>
          <li><a href="#healthcare" className="hover:underline">The Elephant in the Room: Healthcare</a></li>
        </ul>
        <hr />

        {/* SECTION 1: THE MATH */}
        <h2 id="math" className="text-2xl font-bold text-foreground pt-8" itemProp="articleSection">The Simple Math: Income - Spending = Freedom</h2>
        <p>In traditional retirement planning, "experts" suggest saving 10% of your income to retire after 45 years of work. The FIRE movement flips this logic.</p>
        <p>If you save 50% of your income, for every year you work, you buy 1 year of freedom. If you save 75% (extreme), for every 1 year you work, you buy 3 years of freedom.</p>
        <p><strong>The Golden Rule:</strong> Your savings rate determines your retirement date, not your income amount.</p>

        <hr />

        {/* SECTION 2: 4% RULE */}
        <h2 id="4percent" className="text-2xl font-bold text-foreground pt-8" itemProp="articleSection">The 4% Rule Explained</h2>
        <p>The "Safe Withdrawal Rate" (SWR) is the percentage of your portfolio you can sell each year to pay bills without running out of money.</p>
        <p>Based on historical stock market data (The Trinity Study), withdrawing 4% annually (inflation-adjusted) is safe for 30 years. This means you need <strong>25 times your annual spending</strong> invested.</p>
        <p><em>Example: Spend $40k/year? You need $1 Million. ($40,000 × 25).</em></p>

        <hr />

        {/* SECTION 3: TYPES */}
        <h2 id="types" className="text-2xl font-bold text-foreground pt-8" itemProp="articleSection">LeanFIRE, FatFIRE, and BaristaFIRE</h2>
        <p>One number doesn't fit all.</p>
        <ul className="list-disc ml-6 space-y-2">
          <li><strong>LeanFIRE:</strong> For the minimalist. Expenses &lt;$30k/yr. Requires ~$750k portfolio. Lifestyle is frugal but free.</li>
          <li><strong>FatFIRE:</strong> For the high-roller. Expenses &gt;$100k/yr. Requires $2.5M+ portfolio. No lifestyle compromise.</li>
          <li><strong>BaristaFIRE:</strong> You hit "Coast" status. You quit the high-stress career but work a low-stress job (like a barista) to cover health insurance and daily bills, letting your portfolio grow untouched.</li>
        </ul>

        <hr />

        {/* SECTION 4: LEVERS */}
        <h2 id="levers" className="text-2xl font-bold text-foreground pt-8" itemProp="articleSection">The 3 Levers: Earn, Save, Invest</h2>
        <div className="grid grid-cols-1 md:grid-cols-3 gap-4 my-6">
          <div className="p-4 bg-muted rounded-lg border">
            <h4 className="font-bold">1. Earn More</h4>
            <p className="text-sm mt-2">Unlimited upside. Side hustles, promotions, job hopping. Just don't let lifestyle creep eat the raise.</p>
          </div>
          <div className="p-4 bg-muted rounded-lg border">
            <h4 className="font-bold">2. Spend Less</h4>
            <p className="text-sm mt-2">Limited downside (you can only cut to zero). But spending less attacks the equation from both ends: you save more AND you need less to retire.</p>
          </div>
          <div className="p-4 bg-muted rounded-lg border">
            <h4 className="font-bold">3. Invest Well</h4>
            <p className="text-sm mt-2">Passive engine. Low-cost index funds (VTSAX, VOO) are the default choice for their simplicity and historical 8-10% return.</p>
          </div>
        </div>

        <hr />

        {/* SECTION 5: HEALTHCARE */}
        <h2 id="healthcare" className="text-2xl font-bold text-foreground pt-8" itemProp="articleSection">The Elephant in the Room: Healthcare</h2>
        <p>In the US, retiring before 65 means no Medicare. You must budget for private insurance or ACA (Obamacare) premiums.</p>
        <p><strong>Strategy:</strong> Many FIRE adherents manage their taxable income to stay low on paper (selling only what they need), which can qualify them for significant ACA subsidies, making healthcare affordable.</p>
      </section>

      {/* FAQ Section */}
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <Info className="h-5 w-5" />
            Frequently Asked Questions (FAQ)
          </CardTitle>
          <CardDescription>
            Common questions about the FIRE movement
          </CardDescription>
        </CardHeader>
        <CardContent>
          <div className="space-y-6">
            <div>
              <h4 className="font-semibold text-lg mb-3">Is the 4% rule safe for a 50-year retirement?</h4>
              <p className="text-muted-foreground">
                There is debate. For longer horizons (40-60 years), many experts suggest a safer withdrawal rate of 3.25% or 3.5%. This lowers the risk of "Sequence of Sustainability Risk"—a market crash in your first year of retirement.
              </p>
            </div>

            <div>
              <h4 className="font-semibold text-lg mb-3">Does FIRE mean I can never work again?</h4>
              <p className="text-muted-foreground">
                No. It means you don't <em>have</em> to work. Many FIRE achievers return to work on passion projects, non-profits, or startups because they enjoy the challenge, not because they need the check.
              </p>
            </div>

            <div>
              <h4 className="font-semibold text-lg mb-3">Where should I invest for FIRE?</h4>
              <p className="text-muted-foreground">
                The standard "Boglehead" portfolio: Total Stock Market Index Fund (VTI or VTSAX) and Total Bond Market (BND). Real estate rental income is also a popular accelerant.
              </p>
            </div>

            <div>
              <h4 className="font-semibold text-lg mb-3">What happens when the market crashes?</h4>
              <p className="text-muted-foreground">
                You must be flexible. If the market drops 30%, you cut your spending (vacations, new cars) temporarily so you don't have to sell stocks at a loss. This "Variable Withdrawal Strategy" virtually guarantees success.
              </p>
            </div>

            <div>
              <h4 className="font-semibold text-lg mb-3">How do I access 401k money before 59.5?</h4>
              <p className="text-muted-foreground">
                <strong>Roth Conversion Ladder:</strong> You convert Traditional IRA funds to Roth IRA, wait 5 years, and then withdraw the principal penalty-free.
                <strong>Rule of 72(t):</strong> Allows substantially equal periodic payments without penalty.
              </p>
            </div>

            <div>
              <h4 className="font-semibold text-lg mb-3">I have kids. Is FIRE impossible?</h4>
              <p className="text-muted-foreground">
                Harder, but not impossible. It requires higher income or stricter budgeting. Many FIRE families find that "time freedom" with their kids is worth the sacrifice of luxury goods.
              </p>
            </div>

            <div>
              <h4 className="font-semibold text-lg mb-3">Should I pay off my mortgage early?</h4>
              <p className="text-muted-foreground">
                Mathematically: Investing usually beats saving 3% mortgage interest. Psychologically: A paid-off house drastically lowers your annual expenses, which lowers your FIRE number. It's a personal choice.
              </p>
            </div>

            <div>
              <h4 className="font-semibold text-lg mb-3">Does Social Security count?</h4>
              <p className="text-muted-foreground">
                Yes, but treat it as a safety buffer. If you retire at 40, you won't see SS for 27+ years. Build your plan to survive without it, and treat any future checks as a bonus.
              </p>
            </div>

            <div>
              <h4 className="font-semibold text-lg mb-3">What is "Coast FIRE"?</h4>
              <p className="text-muted-foreground">
                Coast FIRE is when you have invested enough that, even if you never contribute another dollar, compound interest alone will grow your pot to a full retirement size by age 65. You only need to work to cover current bills.
              </p>
            </div>

            <div>
              <h4 className="font-semibold text-lg mb-3">How do inflation rates affect calculated timelines?</h4>
              <p className="text-muted-foreground">
                This calculator uses "Real Return" assumptions (Growth Rate). The stock market historically returns 10%. Inflation is 3%. So we use 7% to keep everything in "Today's Dollars."
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
          <p>The FIRE Calculator is more than a predictive tool; it is a reality check.</p>
          <p>It demonstrates that reducing your annual spending is the most powerful lever you have. Every $100 you cut from your monthly budget is $30,000 less you need to save.</p>
        </CardContent>
      </Card>
    </div>
  );
}

'use client';

import { useState, useEffect } from 'react';
import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import { z } from 'zod';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Form, FormControl, FormField, FormItem, FormLabel, FormMessage } from '@/components/ui/form';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Zap, TrendingUp, AlertCircle, Target, Info, Landmark, Calculator, DollarSign, BarChart3, Shield, Coins, Wallet, CreditCard, ShoppingBag, PieChart, FunctionSquare, CheckCircle2 } from 'lucide-react';
import { Badge } from '@/components/ui/badge';
import { Alert, AlertDescription } from '@/components/ui/alert';
import Link from 'next/link';

const formSchema = z.object({
  currentPortfolio: z.number().min(0).describe("Current invested assets"),
  monthlyContribution: z.number().min(0).describe("New money added each month"),
  yearsToGrow: z.number().min(1).max(100).describe("Time horizon"),
  annualReturn: z.number().min(0).max(100).describe("Average Portfolio Growth % (Capital Appreciation)"),
  dividendYield: z.number().min(0).max(100).describe("Average Dividend/Yield % (Cash Flow)"),
  reinvestDividends: z.boolean().default(true).describe("DRIP: Reinvest cash flow during growth phase?"),
});

type FormValues = z.infer<typeof formSchema>;

export default function PassiveIncomeProjectionCalculator() {
  const [result, setResult] = useState<{
    futurePortfolio: number;
    annualPassiveIncome: number;
    monthlyPassiveIncome: number;
    yieldOnCost: number;
    totalContributed: number;
    interpretation: string;
    insights: string[];
    actionPlan: string[];
  } | null>(null);

  const form = useForm<FormValues>({
    resolver: zodResolver(formSchema),
    defaultValues: {
      currentPortfolio: 10000,
      monthlyContribution: 500,
      yearsToGrow: 20,
      annualReturn: 5,   // Price appreciation
      dividendYield: 3,  // Cash distribution
      reinvestDividends: true,
    },
  });

  const calculate = (v: FormValues) => {
    if (v.currentPortfolio === undefined || v.monthlyContribution === undefined) return null;

    // We split Total Return into "Growth" (Price) and "Yield" (Cash)
    // If reinvesting, Total Return = Growth + Yield
    // If NOT reinvesting, Total Return = Growth. Yield is just paid out.

    const growthRate = v.annualReturn / 100;
    const yieldRate = v.dividendYield / 100;
    const months = v.yearsToGrow * 12;

    let balance = v.currentPortfolio;
    let totalContributed = v.currentPortfolio;

    // Monthly iterative calculation
    // Monthly Rates
    const monthlyGrowth = growthRate / 12;
    const monthlyYield = yieldRate / 12;

    for (let i = 0; i < months; i++) {
      // 1. Add Contribution
      balance += v.monthlyContribution;
      totalContributed += v.monthlyContribution;

      // 2. Generate Cash Flow (Yield)
      const cashFlow = balance * monthlyYield;

      // 3. Price Appreciation
      balance += balance * monthlyGrowth;

      // 4. Reinvest?
      if (v.reinvestDividends) {
        balance += cashFlow;
      }
    }

    // After N years, calculate final Passive Income Capability
    // We assume the Yield Rate stays constant on the final balance
    const annualPassiveIncome = balance * yieldRate;
    const monthlyPassiveIncome = annualPassiveIncome / 12;

    // Yield on Cost = Annual Income / Total Contributed
    const yieldOnCost = (annualPassiveIncome / totalContributed) * 100;

    return {
      futurePortfolio: balance,
      annualPassiveIncome,
      monthlyPassiveIncome,
      yieldOnCost,
      totalContributed,
      interpretation: `In ${v.yearsToGrow} years, your portfolio could generate $${Math.round(monthlyPassiveIncome).toLocaleString()}/month in passive income while retaining the principal.`,
      insights: [
        v.reinvestDividends ? "Reinvesting dividends accelerated your compounding significantly." : "Not reinvesting dividends slowed your capital growth, but provided cash flow along the way.",
        `Your Yield on Cost is ${yieldOnCost.toFixed(1)}%, meaning for every dollar you put in, you now get ${yieldOnCost.toFixed(1)} cents back every year forever.`,
        `Total contributions: $${totalContributed.toLocaleString()}. Total Value: $${balance.toLocaleString()}. The difference ($${(balance - totalContributed).toLocaleString()}) is pure market growth.`
      ],
      actionPlan: [
        "Focus on increasing your 'Yield on Cost' by buying dividend growers (companies that raise payouts annually).",
        "Keep expenses low so your Portfolio Yield covers your burn rate sooner.",
        "Consider Tax-Advantaged accounts (Roth IRA) to make that passive income tax-free."
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
            <Coins className="h-5 w-5" />
            Income Engine Configuration
          </CardTitle>
          <CardDescription>
            Input your capital and expected yields to forecast your cash flow.
          </CardDescription>
        </CardHeader>
        <CardContent>
          <Form {...form}>
            <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-6">

              <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                {/* Capital Inputs */}
                <div className="space-y-4">
                  <FormField
                    control={form.control}
                    name="currentPortfolio"
                    render={({ field }) => (
                      <FormItem>
                        <FormLabel className="flex items-center gap-2">
                          <Wallet className="h-4 w-4" />
                          Current Portfolio ($)
                        </FormLabel>
                        <FormControl>
                          <Input
                            type="number"
                            placeholder="e.g., 10000"
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
                    name="monthlyContribution"
                    render={({ field }) => (
                      <FormItem>
                        <FormLabel className="flex items-center gap-2">
                          <DollarSign className="h-4 w-4" />
                          Monthly Deposit ($)
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
                          <Coins className="h-4 w-4" />
                          Years to Grow
                        </FormLabel>
                        <FormControl>
                          <Input
                            type="number"
                            placeholder="e.g., 20"
                            {...field}
                            onChange={e => field.onChange(parseFloat(e.target.value) || undefined)}
                          />
                        </FormControl>
                        <FormMessage />
                      </FormItem>
                    )}
                  />
                </div>

                {/* Rate Inputs */}
                <div className="space-y-4">
                  <FormField
                    control={form.control}
                    name="annualReturn"
                    render={({ field }) => (
                      <FormItem>
                        <FormLabel className="flex items-center gap-2">
                          <TrendingUp className="h-4 w-4" />
                          Stock Growth Rate (%)
                        </FormLabel>
                        <FormControl>
                          <Input
                            type="number"
                            placeholder="e.g., 5 (Price appreciation)"
                            step="0.1"
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
                    name="dividendYield"
                    render={({ field }) => (
                      <FormItem>
                        <FormLabel className="flex items-center gap-2">
                          <PieChart className="h-4 w-4" />
                          Dividend Yield (%)
                        </FormLabel>
                        <FormControl>
                          <Input
                            type="number"
                            placeholder="e.g., 3 (Cash payouts)"
                            step="0.1"
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
                    name="reinvestDividends"
                    render={({ field }) => (
                      <FormItem className="flex flex-row items-center justify-between rounded-lg border p-3">
                        <div className="space-y-0.5">
                          <FormLabel className="text-base">Reinvest Dividends (DRIP)</FormLabel>
                          <div className="text-sm text-muted-foreground mr-2">
                            Auto-buy more shares?
                          </div>
                        </div>
                        <FormControl>
                          <input
                            type="checkbox"
                            checked={field.value}
                            onChange={field.onChange}
                            className="accent-primary h-5 w-5"
                          />
                        </FormControl>
                      </FormItem>
                    )}
                  />
                </div>
              </div>

              <Button type="submit" className="w-full">
                <Calculator className="mr-2 h-4 w-4" />
                Project My Income
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
                <Target className="h-8 w-8 text-primary" />
                <div>
                  <CardTitle>Future Income Projection</CardTitle>
                  <CardDescription>Year {form.getValues().yearsToGrow} Snapshot</CardDescription>
                </div>
              </div>
            </CardHeader>
            <CardContent className="space-y-6">
              <div className="text-center">
                <p className="text-sm font-medium text-muted-foreground uppercase tracking-wider mb-1">Projected Monthly Passive Income</p>
                <p className="text-4xl font-bold text-primary">${result.monthlyPassiveIncome.toLocaleString(undefined, { maximumFractionDigits: 0 })}</p>
                <Badge variant="outline" className="mt-3 text-lg py-1 px-4">
                  $ {result.annualPassiveIncome.toLocaleString(undefined, { maximumFractionDigits: 0 })} / Year
                </Badge>
                <p className="text-sm text-muted-foreground mt-4 max-w-lg mx-auto">{result.interpretation}</p>
              </div>

              <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                <div className="text-center p-4 bg-muted/50 rounded-lg border border-border">
                  <Wallet className="h-6 w-6 mx-auto mb-2 text-blue-600" />
                  <p className="font-semibold">Future Portfolio</p>
                  <p className="text-2xl font-bold text-blue-700">${result.futurePortfolio.toLocaleString(undefined, { maximumFractionDigits: 0 })}</p>
                  <p className="text-xs text-muted-foreground">Total Asset Value</p>
                </div>
                <div className="text-center p-4 bg-muted/50 rounded-lg border border-border">
                  <Zap className="h-6 w-6 mx-auto mb-2 text-orange-600" />
                  <p className="font-semibold">Yield on Cost</p>
                  <p className="text-2xl font-bold text-orange-700">{result.yieldOnCost.toFixed(2)}%</p>
                  <p className="text-xs text-muted-foreground">Efficiency Rating</p>
                </div>
                <div className="text-center p-4 bg-muted/50 rounded-lg border border-border">
                  <TrendingUp className="h-6 w-6 mx-auto mb-2 text-green-600" />
                  <p className="font-semibold">Total Profit</p>
                  <p className="text-2xl font-bold text-green-700">${(result.futurePortfolio - result.totalContributed).toLocaleString(undefined, { maximumFractionDigits: 0 })}</p>
                  <p className="text-xs text-muted-foreground">Growth + Reinvestment</p>
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
                <CardDescription>Understanding the growth</CardDescription>
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
                  Action Plan
                </CardTitle>
                <CardDescription>Maximize your yield</CardDescription>
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
            Methodology
          </CardTitle>
        </CardHeader>
        <CardContent className="space-y-4">
          <div className="p-4 bg-muted rounded-lg overflow-x-auto">
            <p className="font-mono text-sm text-center">
              Value = Investment × (1 + Growth + Yield)^Time
            </p>
            <p className="font-mono text-sm text-center mt-2">
              (Assuming DRIP is enabled)
            </p>
          </div>
          <p className="text-sm text-muted-foreground mt-2">
            This calculator treats "Growth" (Share Price Increase) and "Yield" (Dividend Payout) separately. This allows you to model high-yield/low-growth assets (like REITs) vs. low-yield/high-growth assets (like Tech Stocks).
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
            Build your machine
          </CardDescription>
        </CardHeader>
        <CardContent>
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
            <Link href="/dividend-yield-calculator" className="block">
              <Card className="hover:shadow-md transition-shadow cursor-pointer">
                <CardContent className="p-4">
                  <div className="flex items-center gap-3">
                    <PieChart className="h-5 w-5 text-blue-600" />
                    <div>
                      <p className="font-medium">Dividend Yield</p>
                      <p className="text-sm text-muted-foreground">Analyze stocks</p>
                    </div>
                  </div>
                </CardContent>
              </Card>
            </Link>
            <Link href="/compound-interest-calculator" className="block">
              <Card className="hover:shadow-md transition-shadow cursor-pointer">
                <CardContent className="p-4">
                  <div className="flex items-center gap-3">
                    <TrendingUp className="h-5 w-5 text-green-600" />
                    <div>
                      <p className="font-medium">Compound Interest</p>
                      <p className="text-sm text-muted-foreground">Growth basics</p>
                    </div>
                  </div>
                </CardContent>
              </Card>
            </Link>
            <Link href="/fire-financial-independence-retire-early-calculator" className="block">
              <Card className="hover:shadow-md transition-shadow cursor-pointer">
                <CardContent className="p-4">
                  <div className="flex items-center gap-3">
                    <Target className="h-5 w-5 text-red-600" />
                    <div>
                      <p className="font-medium">FIRE Calculator</p>
                      <p className="text-sm text-muted-foreground">Retire early</p>
                    </div>
                  </div>
                </CardContent>
              </Card>
            </Link>
            <Link href="/cost-of-delay-investing-late-calculator" className="block">
              <Card className="hover:shadow-md transition-shadow cursor-pointer">
                <CardContent className="p-4">
                  <div className="flex items-center gap-3">
                    <AlertCircle className="h-5 w-5 text-orange-600" />
                    <div>
                      <p className="font-medium">Cost of Delay</p>
                      <p className="text-sm text-muted-foreground">Time is money</p>
                    </div>
                  </div>
                </CardContent>
              </Card>
            </Link>
            <Link href="/return-on-investment-calculator" className="block">
              <Card className="hover:shadow-md transition-shadow cursor-pointer">
                <CardContent className="p-4">
                  <div className="flex items-center gap-3">
                    <BarChart3 className="h-5 w-5 text-indigo-600" />
                    <div>
                      <p className="font-medium">Investment Return</p>
                      <p className="text-sm text-muted-foreground">Track performance</p>
                    </div>
                  </div>
                </CardContent>
              </Card>
            </Link>
            <Link href="/side-income-goal-calculator" className="block">
              <Card className="hover:shadow-md transition-shadow cursor-pointer">
                <CardContent className="p-4">
                  <div className="flex items-center gap-3">
                    <Wallet className="h-5 w-5 text-yellow-600" />
                    <div>
                      <p className="font-medium">Side Income</p>
                      <p className="text-sm text-muted-foreground">Fund the portfolio</p>
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
        <meta itemProp="name" content="Passive Income Calculator: Project Your Freedom" />
        <meta itemProp="description" content="Calculate your future passive income stream based on contributions, dividend yield, and capital appreciation. See how reinvesting dividends accelerates your timeline." />
        <meta itemProp="keywords" content="passive income calculator, dividend projection, drip calculator, yield on cost, cash flow forecasting" />
        <meta itemProp="author" content="MegaCalc Financial Team" />
        <meta itemProp="datePublished" content="2025-11-05" />
        <meta itemProp="url" content="/passive-income-guide" />

        <h1 className="text-3xl md:text-4xl font-extrabold text-foreground mb-4" itemProp="headline">Building the Perpetual Money Machine: A Guide to Passive Income</h1>
        <p className="text-lg italic text-muted-foreground">"If you don't find a way to make money while you sleep, you will work until you die." — Warren Buffett.</p>

        {/* TABLE OF CONTENTS */}
        <h2 className="text-2xl font-bold text-foreground mt-8 mb-4">Table of Contents</h2>
        <ul className="list-disc ml-6 space-y-2 text-primary">
          <li><a href="#total-return" className="hover:underline">The Two Engines: Growth vs. Yield</a></li>
          <li><a href="#drip" className="hover:underline">The Magic of DRIP (Dividend Reinvestment)</a></li>
          <li><a href="#yield-on-cost" className="hover:underline">Yield on Cost: The Hidden Metric</a></li>
          <li><a href="#assets" className="hover:underline">Top 4 Assets for Passive Income</a></li>
          <li><a href="#timeline" className="hover:underline">The "Snowball Effect" Timeline</a></li>
        </ul>
        <hr />

        {/* SECTION 1: GROWTH VS YIELD */}
        <h2 id="total-return" className="text-2xl font-bold text-foreground pt-8" itemProp="articleSection">The Two Engines: Growth vs. Yield</h2>
        <p>Most calculators lump everything into "Return." We separate them because they serve different purposes.</p>
        <ul className="list-disc ml-6 space-y-2">
          <li><strong>Capital Appreciation (Growth):</strong> The stock price goes up. You only get paid if you <em>sell</em> the asset. (e.g., Tech stocks).</li>
          <li><strong>Yield (Cash Flow):</strong> The asset pays you cash without you selling it. (e.g., Dividends, Rent, Interest).</li>
        </ul>
        <p>For passive income, <strong>Yield</strong> is king. You want to pay bills with the cash flow, never touching the principal.</p>

        <hr />

        {/* SECTION 2: DRIP */}
        <h2 id="drip" className="text-2xl font-bold text-foreground pt-8" itemProp="articleSection">The Magic of DRIP (Dividend Reinvestment)</h2>
        <p>DRIP stands for Dividend Reinvestment Plan. Instead of taking the cash, your broker automatically uses it to buy more shares.</p>
        <p>This creates a feedback loop: More Shares &rarr; More Dividends &rarr; Buy Even More Shares &rarr; Even More Dividends. This is how small portfolios become massive over 20 years.</p>

        <hr />

        {/* SECTION 3: YIELD ON COST */}
        <h2 id="yield-on-cost" className="text-2xl font-bold text-foreground pt-8" itemProp="articleSection">Yield on Cost: The Hidden Metric</h2>
        <p>If you buy a stock at $100 with a $3 dividend, your yield is 3%.</p>
        <p>In 10 years, if the stock goes to $200 and the dividend doubles to $6, your yield on <em>current price</em> is still 3%. But your <strong>Yield on Cost</strong> is 6% ($6 dividend / $100 original cost).</p>
        <p>Long-term investors often see Yield on Costs of 20%, 50%, or even 100% on assets held for decades.</p>

        <hr />

        {/* SECTION 4: ASSETS */}
        <h2 id="assets" className="text-2xl font-bold text-foreground pt-8" itemProp="articleSection">Top 4 Assets for Passive Income</h2>
        <ol className="list-decimal ml-6 space-y-2">
          <li><strong>Dividend Aristocrats:</strong> S&P 500 companies that have increased dividends for 25+ consecutive years. (Reliable).</li>
          <li><strong>REITs (Real Estate Investment Trusts):</strong> Companies that own real estate. By law, they must pay out 90% of profits as dividends. (High Yield).</li>
          <li><strong>Bonds:</strong> Loans to governments or corporations. They pay fixed interest. (Low Risk, Low Growth).</li>
          <li><strong>High-Yield Savings:</strong> The safest option, but returns usually just match inflation. (Zero Risk).</li>
        </ol>

        <hr />

        {/* SECTION 5: TIMELINE */}
        <h2 id="timeline" className="text-2xl font-bold text-foreground pt-8" itemProp="articleSection">The "Snowball Effect" Timeline</h2>
        <p>Building passive income is boring at first.</p>
        <ul className="list-disc ml-6 space-y-2">
          <li><strong>Year 1-5:</strong> The "Slog." Your dividends barely buy a coffee. You must feed the machine with monthly contributions.</li>
          <li><strong>Year 5-10:</strong> Momentum. The dividends now buy a monthly dinner.</li>
          <li><strong>Year 15-20:</strong> The Explosion. The dividends might now exceed your monthly contributions. The snowball is rolling itself.</li>
        </ul>
      </section>

      {/* FAQ Section */}
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <Info className="h-5 w-5" />
            Frequently Asked Questions (FAQ)
          </CardTitle>
          <CardDescription>
            Common questions about income investing
          </CardDescription>
        </CardHeader>
        <CardContent>
          <div className="space-y-6">
            <div>
              <h4 className="font-semibold text-lg mb-3">Is high yield always better?</h4>
              <p className="text-muted-foreground">
                No! A "Yield Trap" is a stock with a massive yield (e.g., 12%) because its share price has crashed due to business failure. These dividends are often cut. Look for sustainable yields (2-5%).
              </p>
            </div>

            <div>
              <h4 className="font-semibold text-lg mb-3">How are dividends taxed?</h4>
              <p className="text-muted-foreground">
                "Qualified Dividends" (held for 60+ days) are taxed at favorable capital gains rates (0%, 15%, or 20%). Non-qualified dividends (like REITs) are taxed as ordinary income (your highest bracket).
              </p>
            </div>

            <div>
              <h4 className="font-semibold text-lg mb-3">Should I use an ETF or individual stocks?</h4>
              <p className="text-muted-foreground">
                For most, ETFs (Exchange Traded Funds) like SCHD or VYM are safer. They hold 100+ dividend-paying companies, so if one cuts its dividend, your income stream isn't destroyed.
              </p>
            </div>

            <div>
              <h4 className="font-semibold text-lg mb-3">Does passive income count toward FIRE?</h4>
              <p className="text-muted-foreground">
                Yes! If your passive income &gt; your expenses, you are Financial Independent. You don't even need to sell shares (withdraw 4%) because the cash protects the principal.
              </p>
            </div>

            <div>
              <h4 className="font-semibold text-lg mb-3">How much to generate $1,000/month?</h4>
              <p className="text-muted-foreground">
                At a 4% yield, you need $300,000 invested. ($300,000 × 0.04 = $12,000/yr = $1,000/mo).
              </p>
            </div>

            <div>
              <h4 className="font-semibold text-lg mb-3">Can I lose money?</h4>
              <p className="text-muted-foreground">
                Yes. If the underlying asset price drops, your Principal Value drops. However, if the company is strong, they will keep paying the dividend. Passive investors focus on the income check, not the daily price.
              </p>
            </div>

            <div>
              <h4 className="font-semibold text-lg mb-3">What is a Dividend Payout Ratio?</h4>
              <p className="text-muted-foreground">
                The percentage of earnings a company pays out. A ratio &lt;60% is healthy (they keep enough cash to grow). A ratio &gt;100% is dangerous (they are borrowing money to pay you).
              </p>
            </div>

            <div>
              <h4 className="font-semibold text-lg mb-3">Are real estate rentals truly passive?</h4>
              <p className="text-muted-foreground">
                Usually, no. They require maintenance, tenant management, and repairs. REITs (Real Estate stocks) are truly passive real estate investments.
              </p>
            </div>

            <div>
              <h4 className="font-semibold text-lg mb-3">What happens during a recession?</h4>
              <p className="text-muted-foreground">
                Stock prices fall, but dividends are "sticky." Companies hate cutting dividends because it signals weakness. Historically, dividends are far less volatile than stock prices during crashes.
              </p>
            </div>

            <div>
              <h4 className="font-semibold text-lg mb-3">Why reinvest? Why not take the cash?</h4>
              <p className="text-muted-foreground">
                In the accumulation phase, you don't need the income. Reinvesting uses the cash to buy more shares when prices are low, supercharging your future income potential.
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
          <p>The Passive Income Projection Calculator helps you transition from "Working for Money" to "Money Working for You."</p>
          <p>By splitting growth and yield, it gives a realistic picture of the cash flow you can expect to live on in the future, independent of market crashes.</p>
        </CardContent>
      </Card>
    </div>
  );
}

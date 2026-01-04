'use client';

import React, { useState, useEffect } from 'react';
import { useForm, useWatch } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import { z } from 'zod';
import {
  BarChart,
  Bar,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip as RechartsTooltip,
  Legend,
  ResponsiveContainer,
  LineChart,
  Line
} from 'recharts';
import {
  Home,
  PiggyBank,
  TrendingUp,
  Calendar,
  AlertTriangle,
  Info,
  CheckCircle2,
  DollarSign,
  Briefcase,
  Shield,
  Calculator,
  ChevronRight,
  Landmark
} from 'lucide-react';

import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Slider } from '@/components/ui/slider';
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
  CardFooter
} from '@/components/ui/card';
import {
  Form,
  FormControl,
  FormField,
  FormItem,
  FormLabel,
  FormMessage,
  FormDescription
} from '@/components/ui/form';
import { Alert, AlertDescription, AlertTitle } from '@/components/ui/alert';
import { Badge } from '@/components/ui/badge';
import Link from 'next/link';
import {
  Accordion,
  AccordionContent,
  AccordionItem,
  AccordionTrigger,
} from "@/components/ui/accordion";
import { Separator } from '@/components/ui/separator';

// --- Zod Schema ---
const formSchema = z.object({
  targetHomePrice: z.number().min(10000, 'Home price must be at least 10,000'),
  downPaymentPercent: z.number().min(0).max(100, 'Percentage must be between 0 and 100'),
  currentSavings: z.number().min(0),
  monthlyContribution: z.number().min(0),
  annualReturn: z.number().min(0).max(20, 'Be realistic with returns (0-20%)'),
  inflationRate: z.number().min(0).max(10, 'Inflation usually 0-10%'),
});

type FormValues = z.infer<typeof formSchema>;

export default function HouseDownPaymentSavingsCalculator() {
  const [isClient, setIsClient] = useState(false);

  useEffect(() => {
    setIsClient(true);
  }, []);

  const [chartData, setChartData] = useState<any[]>([]);
  const [analysis, setAnalysis] = useState<any>(null);

  const form = useForm<FormValues>({
    resolver: zodResolver(formSchema),
    defaultValues: {
      targetHomePrice: 400000,
      downPaymentPercent: 20,
      currentSavings: 10000,
      monthlyContribution: 1500,
      annualReturn: 4.5, // Conservative HYSA rate
      inflationRate: 3.0, // Home price appreciation
    },
    mode: 'onChange',
  });

  const values = useWatch({ control: form.control });

  const calculateResults = (vals: FormValues) => {
    const {
      targetHomePrice,
      downPaymentPercent,
      currentSavings,
      monthlyContribution,
      annualReturn,
      inflationRate
    } = vals;

    const initialGoal = targetHomePrice * (downPaymentPercent / 100);
    const monthsData = [];
    let balance = currentSavings;
    let currentGoal = initialGoal;

    // Monthly rates
    const r = annualReturn / 100 / 12;
    const i = inflationRate / 100 / 12;

    let months = 0;
    const maxMonths = 120; // Cap at 10 years for visualization
    let goalReached = false;

    // Generate data month by month
    while (months <= maxMonths) { // Run up to 10 years
      monthsData.push({
        month: months,
        yearDisplay: (months / 12).toFixed(1),
        savingsKey: Math.round(balance),
        goalKey: Math.round(currentGoal),
      });

      if (!goalReached && balance >= currentGoal) {
        goalReached = true;
        // Record exact time
      }

      // Interest on balance + Contribution
      balance = balance * (1 + r) + monthlyContribution;
      // Goal inflation (home prices rising)
      currentGoal = currentGoal * (1 + i);

      months++;
    }

    setChartData(monthsData);

    // Analyze Timeline
    const reachedIndex = monthsData.findIndex(d => d.savingsKey >= d.goalKey);
    const yearsToGoal = reachedIndex !== -1 ? (reachedIndex / 12) : null;
    const finalGoalAmount = reachedIndex !== -1 ? monthsData[reachedIndex].goalKey : null;

    setAnalysis({
      yearsToGoal,
      initialGoal,
      finalGoalAmount,
      isPossibleIn10Years: reachedIndex !== -1,
      totalSaved: reachedIndex !== -1 ? monthsData[reachedIndex].savingsKey : balance,
      interestEarned: reachedIndex !== -1
        ? monthsData[reachedIndex].savingsKey - (currentSavings + (monthlyContribution * reachedIndex))
        : 0
    });
  };

  useEffect(() => {
    const subscription = form.watch((value) => {
      if (value.targetHomePrice) calculateResults(value as FormValues);
    });
    calculateResults(form.getValues());
    return () => subscription.unsubscribe();
  }, [form.watch]);

  // Formatter for Currency
  const fmt = (n: number) => new Intl.NumberFormat('en-US', { style: 'currency', currency: 'USD', maximumFractionDigits: 0 }).format(n);

  return (
    <div className="space-y-12 max-w-5xl mx-auto px-4 md:px-0 pb-12">

      {/* HEADER */}
      <div className="text-center space-y-4 py-8">
        <h1 className="text-4xl md:text-5xl font-extrabold tracking-tight text-foreground bg-clip-text text-transparent bg-gradient-to-r from-emerald-600 to-cyan-600 pb-2">
          House Down Payment Savings Calculator
        </h1>
        <p className="text-xl text-muted-foreground max-w-2xl mx-auto">
          Visualize your path to homeownership. Factor in savings growth and rising home prices to see exactly when you get the keys.
        </p>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
        {/* INPUTS */}
        <div className="lg:col-span-1 space-y-6">
          <Card className="border-t-4 border-t-emerald-600 shadow-lg">
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <Home className="h-5 w-5 text-emerald-600" />
                Savings Parameters
              </CardTitle>
            </CardHeader>
            <CardContent className="space-y-4">
              <FormField
                control={form.control}
                name="targetHomePrice"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>Target Home Price (Today's $)</FormLabel>
                    <FormControl>
                      <div className="relative">
                        <span className="absolute left-3 top-2.5 text-muted-foreground">$</span>
                        <Input type="number" className="pl-7" {...field} onChange={e => field.onChange(Number(e.target.value))} />
                      </div>
                    </FormControl>
                  </FormItem>
                )}
              />
              <FormField
                control={form.control}
                name="downPaymentPercent"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>Down Payment Goal (%)</FormLabel>
                    <div className="flex items-center gap-4">
                      <Slider
                        value={[field.value]}
                        min={3}
                        max={50}
                        step={1}
                        className="flex-1"
                        onValueChange={(val) => field.onChange(val[0])}
                      />
                      <span className="w-12 text-right font-bold">{field.value}%</span>
                    </div>
                  </FormItem>
                )}
              />
              <FormField
                control={form.control}
                name="inflationRate"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>Home Price Appreciation (%)</FormLabel>
                    <FormControl>
                      <Input type="number" step="0.1" {...field} onChange={e => field.onChange(Number(e.target.value))} />
                    </FormControl>
                    <FormDescription className="text-xs">
                      Historical avg: 3-5%
                    </FormDescription>
                  </FormItem>
                )}
              />
            </CardContent>
          </Card>

          <Card>
            <CardHeader><CardTitle className="text-base">Your Contributions</CardTitle></CardHeader>
            <CardContent className="space-y-4">
              <FormField
                control={form.control}
                name="currentSavings"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>Current Savings Saved</FormLabel>
                    <FormControl>
                      <div className="relative">
                        <span className="absolute left-3 top-2.5 text-muted-foreground">$</span>
                        <Input type="number" className="pl-7" {...field} onChange={e => field.onChange(Number(e.target.value))} />
                      </div>
                    </FormControl>
                  </FormItem>
                )}
              />
              <FormField
                control={form.control}
                name="monthlyContribution"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>Monthly Contribution</FormLabel>
                    <FormControl>
                      <div className="relative">
                        <span className="absolute left-3 top-2.5 text-muted-foreground">$</span>
                        <Input type="number" className="pl-7" {...field} onChange={e => field.onChange(Number(e.target.value))} />
                      </div>
                    </FormControl>
                  </FormItem>
                )}
              />
              <FormField
                control={form.control}
                name="annualReturn"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>Savings Annual Return (%)</FormLabel>
                    <FormControl>
                      <Input type="number" step="0.1" {...field} onChange={e => field.onChange(Number(e.target.value))} />
                    </FormControl>
                    <FormDescription className="text-xs">
                      HYSA avg: 4-5%
                    </FormDescription>
                  </FormItem>
                )}
              />
            </CardContent>
          </Card>
        </div>

        {/* RESULTS */}
        <div className="lg:col-span-2 space-y-6">
          {/* KPI CARDS */}
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
            <Card className="bg-emerald-50 dark:bg-emerald-900/20 border-none">
              <CardHeader className="pb-2">
                <CardTitle className="text-sm font-medium text-emerald-700 dark:text-emerald-400">Target Reached In</CardTitle>
              </CardHeader>
              <CardContent>
                <div className="text-3xl font-bold text-emerald-800 dark:text-emerald-200">
                  {(analysis?.yearsToGoal !== null && analysis?.yearsToGoal !== undefined) ? `${Number(analysis.yearsToGoal).toFixed(1)} Years` : '> 10 Years'}
                </div>
              </CardContent>
            </Card>
            <Card className="bg-slate-50 dark:bg-slate-900 border-none">
              <CardHeader className="pb-2">
                <CardTitle className="text-sm font-medium text-muted-foreground">Future Down Payment</CardTitle>
              </CardHeader>
              <CardContent>
                <div className="text-3xl font-bold">
                  {(analysis?.finalGoalAmount !== null && analysis?.finalGoalAmount !== undefined) ? fmt(analysis.finalGoalAmount) : 'N/A'}
                </div>
                <p className="text-xs text-muted-foreground mt-1">Adjusted for inflation</p>
              </CardContent>
            </Card>
            <Card className="bg-blue-50 dark:bg-blue-900/20 border-none">
              <CardHeader className="pb-2">
                <CardTitle className="text-sm font-medium text-blue-700 dark:text-blue-400">Interest Earned</CardTitle>
              </CardHeader>
              <CardContent>
                <div className="text-3xl font-bold text-blue-800 dark:text-blue-200">
                  {fmt(analysis?.interestEarned || 0)}
                </div>
                <p className="text-xs text-muted-foreground mt-1">Free money working for you</p>
              </CardContent>
            </Card>
          </div>

          {/* CHART */}
          <Card>
            <CardHeader>
              <CardTitle>Savings Race: You vs. Home Prices</CardTitle>
              <CardDescription>Blue line (Savings) must cross Purple line (Required Down Payment) </CardDescription>
            </CardHeader>
            <CardContent>
              <div className="h-[350px] w-full">
                {isClient ? (
                  <ResponsiveContainer width="100%" height="100%">
                    <LineChart data={chartData} margin={{ top: 20, right: 30, left: 20, bottom: 5 }}>
                      <CartesianGrid strokeDasharray="3 3" opacity={0.2} />
                      <XAxis
                        dataKey="yearDisplay"
                        label={{ value: 'Years', position: 'insideBottomRight', offset: -5 }}
                        minTickGap={30}
                      />
                      <YAxis
                        tickFormatter={(val) => `$${val / 1000}k`}
                      />
                      <RechartsTooltip
                        formatter={(val: number) => fmt(val)}
                        labelFormatter={(label) => `Year ${label}`}
                      />
                      <Legend />
                      <Line
                        type="monotone"
                        dataKey="savingsKey"
                        name="Your Savings"
                        stroke="#10b981"
                        strokeWidth={3}
                        dot={false}
                      />
                      <Line
                        type="monotone"
                        dataKey="goalKey"
                        name="Required Down Payment"
                        stroke="#8b5cf6"
                        strokeWidth={3}
                        strokeDasharray="5 5" // Dotted line for target
                        dot={false}
                      />
                    </LineChart>
                  </ResponsiveContainer>
                ) : (
                  <div className="flex h-full w-full items-center justify-center text-muted-foreground">
                    Loading Chart...
                  </div>
                )}
              </div>

              {analysis && !analysis.isPossibleIn10Years && (
                <Alert variant="destructive" className="mt-4">
                  <AlertTriangle className="h-4 w-4" />
                  <AlertTitle>Goal Unobtainable In 10 Years</AlertTitle>
                  <AlertDescription>
                    At your current savings rate, you will not catch up to rising home prices within a decade. Try increasing your monthly contribution or aiming for a lower down payment (e.g., 3.5% FHA).
                  </AlertDescription>
                </Alert>
              )}
            </CardContent>
          </Card>
        </div>
      </div>

      {/* USAGE SECTION */}
      <Card className="mb-8 mt-8">
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <Briefcase className="h-5 w-5" />
            Usage of this Calculator
          </CardTitle>
          <CardDescription>
            Real-world applications
          </CardDescription>
        </CardHeader>
        <CardContent className="space-y-6">
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div className="p-3 bg-muted/50 rounded-lg border border-border/50">
              <strong className="block text-primary mb-1">First-Time Buyers</strong>
              <span className="text-sm text-muted-foreground">To set a realistic timeline for when they can stop renting and start buying.</span>
            </div>
            <div className="p-3 bg-muted/50 rounded-lg border border-border/50">
              <strong className="block text-primary mb-1">Upgraders</strong>
              <span className="text-sm text-muted-foreground">Homeowners planning to sell their current home can input their expected equity as "Current Savings" to see what next tier of home they can afford.</span>
            </div>
          </div>
          <hr className="border-border/50" />
          <div>
            <h4 className="flex items-center gap-2 font-semibold text-lg mb-3">
              <AlertTriangle className="h-5 w-5 text-amber-600" />
              Limitations & Nuances
            </h4>
            <ul className="space-y-2 text-sm text-muted-foreground">
              <li className="flex gap-2">
                <CheckCircle2 className="h-4 w-4 text-amber-500 shrink-0 mt-0.5" />
                <span><strong>Market Volatility:</strong> Home prices don't rise linearly (3% every year). They might jump 15% one year and drop 2% the next. This calculator assumes a smooth average.</span>
              </li>
              <li className="flex gap-2">
                <CheckCircle2 className="h-4 w-4 text-amber-500 shrink-0 mt-0.5" />
                <span><strong>Closing Costs Missing:</strong> Remember to save an <em>additional</em> 3-5% for closing costs. This calculator strictly computes the Down Payment.</span>
              </li>
            </ul>
          </div>
        </CardContent>
      </Card>

      {/* SUMMARY */}
      <Card className="mb-8">
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <Shield className="h-5 w-5" />
            Summary
          </CardTitle>
        </CardHeader>
        <CardContent className="space-y-2 text-sm text-muted-foreground">
          <p>The House Down Payment Calculator is a reality check tool for aspiring homeowners.</p>
          <p>It solves the "Moving Goalpost" problem: as you save, house prices rise. By accounting for both asset appreciation and savings growth.</p>
          <p>Use it to find the "Sweet Spot"—the exact month where your rising savings line crosses the rising home price line.</p>
        </CardContent>
      </Card>

      {/* COMPLETE GUIDE */}
      <section className="space-y-8 text-muted-foreground leading-relaxed bg-card p-8 md:p-12 rounded-xl shadow-sm border border-border" itemScope itemType="https://schema.org/FinanceArticle">
        <meta itemProp="name" content="How to Save for a House: The Strategic Guide" />
        <meta itemProp="description" content="Master the art of saving for a down payment. Learn about PMI, Conventional vs FHA loans, where to park your cash, and how to accelerate your timeline." />
        <meta itemProp="keywords" content="house down payment calculator, save for house, pmi calculator, first time home buyer savings, mortgage planning" />

        <header className="space-y-4 border-b border-border pb-8">
          <Badge variant="secondary" className="mb-2">Homeownership Series</Badge>
          <h1 className="text-3xl md:text-5xl font-extrabold text-foreground tracking-tight" itemProp="headline">The Strategic Guide to Saving for a House</h1>
          <p className="text-xl text-muted-foreground max-w-3xl">
            Buying a home is the biggest purchase of your life. The down payment is the biggest hurdle. Here is how to clear it without stumbling.
          </p>
        </header>

        {/* TABLE OF CONTENTS */}
        <nav className="bg-muted/50 p-6 rounded-lg border border-border/50">
          <h2 className="text-lg font-bold text-foreground mb-4 uppercase tracking-wider text-xs">Table of Contents</h2>
          <ul className="grid grid-cols-1 md:grid-cols-2 gap-3 text-sm">
            <li><a href="#magic-number" className="flex items-center gap-2 hover:text-primary transition-colors"><ChevronRight className="h-3 w-3" /> The Magic Number: 20% vs 3.5%</a></li>
            <li><a href="#PMI" className="flex items-center gap-2 hover:text-primary transition-colors"><ChevronRight className="h-3 w-3" /> Understanding PMI (The "Wasted" Money)</a></li>
            <li><a href="#where-to-save" className="flex items-center gap-2 hover:text-primary transition-colors"><ChevronRight className="h-3 w-3" /> Where to Park Your Cash</a></li>
            <li><a href="#closing-costs" className="flex items-center gap-2 hover:text-primary transition-colors"><ChevronRight className="h-3 w-3" /> The Secret Cost: Closing Fees</a></li>
            <li><a href="#mistakes" className="flex items-center gap-2 hover:text-primary transition-colors"><ChevronRight className="h-3 w-3" /> Common Rookie Mistakes</a></li>
          </ul>
        </nav>

        <article id="magic-number" className="prose prose-slate dark:prose-invert max-w-none">
          <h2 className="text-2xl md:text-3xl font-bold text-foreground pt-4" itemProp="articleSection">The Magic Number: Do You Really Need 20%?</h2>
          <p>
            For decades, "20% Down" was the golden rule. Today, it is more of a "Silver Suggestion."
          </p>
          <div className="grid grid-cols-1 md:grid-cols-3 gap-6 my-6 not-prose">
            <div className="p-6 bg-slate-50 dark:bg-slate-900/50 rounded-xl border border-slate-200">
              <strong className="block text-xl font-bold mb-2">Conventional 20%</strong>
              <div className="text-sm">
                <ul className="list-disc pl-4 space-y-1 text-muted-foreground">
                  <li><strong>Pros:</strong> No PMI. Lower interest rate. Instant equity.</li>
                  <li><strong>Cons:</strong> Takes years to save. Market might outrun you.</li>
                </ul>
              </div>
            </div>
            <div className="p-6 bg-slate-50 dark:bg-slate-900/50 rounded-xl border border-slate-200">
              <strong className="block text-xl font-bold mb-2">Conventional 3-5%</strong>
              <div className="text-sm">
                <ul className="list-disc pl-4 space-y-1 text-muted-foreground">
                  <li><strong>Pros:</strong> Buy sooner. Start building equity now.</li>
                  <li><strong>Cons:</strong> You pay PMI (Private Mortgage Insurance). Monthly payment is higher.</li>
                </ul>
              </div>
            </div>
            <div className="p-6 bg-slate-50 dark:bg-slate-900/50 rounded-xl border border-slate-200">
              <strong className="block text-xl font-bold mb-2">FHA 3.5%</strong>
              <div className="text-sm">
                <ul className="list-disc pl-4 space-y-1 text-muted-foreground">
                  <li><strong>Pros:</strong> Easier credit requirements. Low down payment.</li>
                  <li><strong>Cons:</strong> "Mortgage Insurance Premium" (MIP) usually lasts for the <em>life</em> of the loan (unlike PMI).</li>
                </ul>
              </div>
            </div>
          </div>
        </article>

        <hr className="border-border" />

        <article id="PMI" className="prose prose-slate dark:prose-invert max-w-none">
          <h2 className="text-2xl md:text-3xl font-bold text-foreground pt-4" itemProp="articleSection">Understanding PMI: Is it Evil?</h2>
          <p>
            Private Mortgage Insurance (PMI) is often demonized. It costs about 0.5% - 1% of your loan amount per year. On a $400k home with 5% down, PMI might be $150/month.
          </p>
          <p>
            <strong>The Counter-Argument:</strong> If home prices in your area are rising by 10% a year ($40k on a $400k home), does it make sense to wait another year to save $1,800 in PMI? No. You would lose $40k in appreciation to "save" $1,800.
          </p>
          <p>
            PMI is the "Fee" you pay to buy a house before you can fully afford it. Sometimes, that fee is worth paying to lock in a price.
          </p>
        </article>

        <hr className="border-border" />

        <article id="where-to-save" className="prose prose-slate dark:prose-invert max-w-none">
          <h2 className="text-2xl md:text-3xl font-bold text-foreground pt-4" itemProp="articleSection">Where to Park Your Cash</h2>
          <p>
            Where you put your down payment depends on your timeline.
          </p>
          <ul className="list-disc pl-6 space-y-4 mt-4">
            <li>
              <strong>Timeline: &lt; 2 Years (Safe Zone)</strong><br />
              <em>High Yield Savings Account (HYSA)</em> or <em>CDs</em>. You cannot risk the stock market dropping 20% right before you close. Principal protection is priority #1.
            </li>
            <li>
              <strong>Timeline: 2-5 Years (Gray Zone)</strong><br />
              Conservative Portfolio (20% Stocks / 80% Bonds). Or just stick to HYSA. The potential gain from stocks isn't worth the risk of delay.
            </li>
            <li>
              <strong>Timeline: 5+ Years (Growth Zone)</strong><br />
              You can afford some risk. A balanced brokerage account (60/40 split) might help you beat inflation. But as you get within 2 years, move it to cash.
            </li>
          </ul>
        </article>

        <hr className="border-border" />

        <article id="closing-costs" className="prose prose-slate dark:prose-invert max-w-none">
          <h2 className="text-2xl md:text-3xl font-bold text-foreground pt-4" itemProp="articleSection">The Secret Cost: Closing Fees</h2>
          <p>
            Many first time buyers save exactly 20%, showing up to the table with $80,000 for a $400,000 house, only to realize they are $12,000 short.
          </p>
          <p>
            <strong>Closing Costs</strong> typically run 2% - 5% of the purchase price. This pays for:
          </p>
          <ul className="list-disc pl-6 space-y-1 text-sm">
            <li>Loan Origination Fees</li>
            <li>Appraisal ($500-$800)</li>
            <li>Inspection ($400-$600)</li>
            <li>Title Insurance</li>
            <li>Prepaid Property Taxes</li>
          </ul>
          <p className="mt-4">
            If your goal is $80,000 down, your <em>actual</em> savings goal needs to be ~$95,000.
          </p>
        </article>

      </section>

      {/* RELATED TOOLS */}
      <Card className="bg-muted/40">
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <Calculator className="h-5 w-5" />
            Related Financial Tools
          </CardTitle>
          <CardDescription>
            Calculators to help you map the full property journey
          </CardDescription>
        </CardHeader>
        <CardContent>
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
            <Link href="/category/finance/mortgage-payment-calculator" className="block">
              <Card className="hover:shadow-md transition-shadow cursor-pointer">
                <CardContent className="p-4">
                  <div className="flex items-center gap-3">
                    <Home className="h-5 w-5 text-indigo-600" />
                    <div>
                      <p className="font-medium">Mortgage Payment</p>
                      <p className="text-sm text-muted-foreground">Monthly P&I check</p>
                    </div>
                  </div>
                </CardContent>
              </Card>
            </Link>
            <Link href="/category/finance/rent-vs-buy-calculator" className="block">
              <Card className="hover:shadow-md transition-shadow cursor-pointer">
                <CardContent className="p-4">
                  <div className="flex items-center gap-3">
                    <Landmark className="h-5 w-5 text-amber-600" />
                    <div>
                      <p className="font-medium">Rent vs Buy</p>
                      <p className="text-sm text-muted-foreground">Is it time?</p>
                    </div>
                  </div>
                </CardContent>
              </Card>
            </Link>
            <Link href="/category/finance/credit-utilization-ratio-calculator" className="block">
              <Card className="hover:shadow-md transition-shadow cursor-pointer">
                <CardContent className="p-4">
                  <div className="flex items-center gap-3">
                    <TrendingUp className="h-5 w-5 text-green-600" />
                    <div>
                      <p className="font-medium">Credit Score</p>
                      <p className="text-sm text-muted-foreground">Optimize for loan approval</p>
                    </div>
                  </div>
                </CardContent>
              </Card>
            </Link>
          </div>
        </CardContent>
      </Card>

      {/* FAQ */}
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <Info className="h-5 w-5" />
            Frequently Asked Questions
          </CardTitle>
          <CardDescription>
            Q&A on Home Savings
          </CardDescription>
        </CardHeader>
        <CardContent>
          <Accordion type="single" collapsible className="w-full">
            <AccordionItem value="item-1">
              <AccordionTrigger>What defines a "High Yield" Savings Account?</AccordionTrigger>
              <AccordionContent>
                It is an FDIC-insured bank account that pays 10-12x the national average interest rate. As of 2024-2025, good HYSAs pay around 4.0% - 5.0% APY. Traditional big banks often pay 0.01%.
              </AccordionContent>
            </AccordionItem>
            <AccordionItem value="item-2">
              <AccordionTrigger>Can I withdraw from my 401k for a house?</AccordionTrigger>
              <AccordionContent>
                Yes, but be careful. You can take a <strong>401k Loan</strong> (paying yourself back with interest) or a hardship withdrawal (paying penalties + taxes). Generally, the loan is safer, but if you lose your job, it must be paid back immediately.
              </AccordionContent>
            </AccordionItem>
            <AccordionItem value="item-3">
              <AccordionTrigger>What is the "First-Time Homebuyer Rule" for IRAs?</AccordionTrigger>
              <AccordionContent>
                You can withdraw up to $10,000 of <strong>investment earnings</strong> from a Roth IRA (or Traditional IRA) penalty-free for a first home purchase. However, using retirement funds for current spending is often discouraged.
              </AccordionContent>
            </AccordionItem>
            <AccordionItem value="item-4">
              <AccordionTrigger>Does my credit score affect my down payment?</AccordionTrigger>
              <AccordionContent>
                Indirectly. A lower credit score (under 620) might disqualify you from low-down-payment Conventional loans (3%), forcing you into FHA loans (3.5%) or requiring a larger deposit to mitigate risk.
              </AccordionContent>
            </AccordionItem>
            <AccordionItem value="item-5">
              <AccordionTrigger>Is it better to put 20% down or pay off student loans first?</AccordionTrigger>
              <AccordionContent>
                It depends on the interest rates. If student loans are 7% and mortgage rates are 6%, pay the debt. If student loans are 3% (federal), you are better off keeping the cash for the house down payment.
              </AccordionContent>
            </AccordionItem>
          </Accordion>
        </CardContent>
      </Card>
    </div>
  );
}

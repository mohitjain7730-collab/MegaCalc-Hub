'use client';

import { useState, useEffect } from 'react';
import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import { z } from 'zod';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Form, FormControl, FormField, FormItem, FormLabel, FormMessage } from '@/components/ui/form';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Zap, TrendingUp, AlertCircle, Target, Info, Landmark, Calculator, DollarSign, BarChart3, Shield, Clock, Hourglass, ArrowRight, Briefcase, CheckCircle2, AlertTriangle, PiggyBank, FunctionSquare } from 'lucide-react';
import { Badge } from '@/components/ui/badge';
import { Alert, AlertDescription } from '@/components/ui/alert';
import Link from 'next/link';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';

const formSchema = z.object({
  targetAmount: z.number().min(1).describe("The goal amount (e.g., $1000)."),
  goalType: z.enum(["monthly", "total"]).describe("Is this a recurring monthly goal or a one-time total goal?"),
  hourlyRate: z.number().min(1).describe("Your expected hourly rate."),
  availableHours: z.number().min(0).max(168).describe("Hours per week you can dedicate."),
  taxRate: z.number().min(0).max(50).describe("Estimated tax % for side income (usually 25-30%)."),
});

type FormValues = z.infer<typeof formSchema>;

export default function SideIncomeGoalCalculator() {
  const [result, setResult] = useState<{
    hoursRequiredTotal: number;
    weeksRequired: number;
    netRate: number;
    monthlyPotential: number; // Potential income based on available hours
    feasibility: string;
    gap: number; // Positive if surplus, negative if deficit (for monthly goals)
    interpretation: string;
    insights: string[];
    actionPlan: string[];
  } | null>(null);

  const form = useForm<FormValues>({
    resolver: zodResolver(formSchema),
    defaultValues: {
      targetAmount: undefined,
      goalType: "monthly",
      hourlyRate: undefined,
      availableHours: 10,
      taxRate: 25,
    },
  });

  const calculate = (v: FormValues) => {
    if (v.targetAmount === undefined || v.hourlyRate === undefined || v.availableHours === undefined || v.taxRate === undefined) return null;

    // 1. Calculate Net Rate (After Tax)
    const netRate = v.hourlyRate * (1 - v.taxRate / 100);

    // 2. Calculate Weekly Potential
    const weeklyNetPotential = netRate * v.availableHours;
    const monthlyNetPotential = weeklyNetPotential * 4.33; // Average weeks/month

    let hoursRequiredTotal = 0;
    let weeksRequired = 0;
    let gap = 0;
    let feasibility = "Feasible";
    let interpretation = "";

    if (v.goalType === "monthly") {
      // Goal: Earn $X per month
      hoursRequiredTotal = v.targetAmount / netRate; // Hours needed per month
      const weeklyHoursNeeded = hoursRequiredTotal / 4.33;

      gap = monthlyNetPotential - v.targetAmount;

      if (weeklyHoursNeeded > v.availableHours) {
        feasibility = "Unrealistic";
        interpretation = `You need ${weeklyHoursNeeded.toFixed(1)} hours/week, but only have ${v.availableHours} available.`;
      } else if (weeklyHoursNeeded > v.availableHours * 0.8) {
        feasibility = "Challenging";
        interpretation = `You can reach your goal, but it requires ${weeklyHoursNeeded.toFixed(1)} hours/week (most of your free time).`;
      } else {
        feasibility = "Achievable";
        interpretation = `You can hit your $${v.targetAmount} monthly goal with just ${weeklyHoursNeeded.toFixed(1)} hours/week.`;
      }
    } else {
      // Goal: Earn $X total (One-time)
      hoursRequiredTotal = v.targetAmount / netRate;
      weeksRequired = hoursRequiredTotal / v.availableHours;

      // Gap isn't relevant for one-time, but specific timeline is
      interpretation = `To earn $${v.targetAmount}, you need to work ${Math.ceil(weeksRequired)} weeks at your current pace.`;
      if (weeksRequired > 52) feasibility = "Long Term";
      else feasibility = "Short Term";
    }

    return {
      hoursRequiredTotal,
      weeksRequired,
      netRate,
      monthlyPotential: monthlyNetPotential,
      feasibility,
      gap,
      interpretation,
      insights: [
        `Your actual take-home rate is $${netRate.toFixed(2)}/hr after ${v.taxRate}% tax.`,
        v.goalType === 'monthly' ? `Max potential monthly earnings: $${monthlyNetPotential.toLocaleString()}` : `Total active work time: ${(hoursRequiredTotal).toFixed(0)} hours.`,
        v.hourlyRate < 20 ? "Rate is on the lower end. Increasing rate is more effective than working more hours." : "Strong hourly rate significantly reduces time effort."
      ],
      actionPlan: [
        "Track every billable hour. Unbilled time kills profitability.",
        "Set aside taxes immediately upon payment (don't spend the gross amount).",
        v.goalType === 'monthly' && gap < 0 ? "Raise your rate by 20% to close the gap without working more hours." : "Consider reinvesting 50% of side income into passive assets."
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
            <Briefcase className="h-5 w-5" />
            Hustle Metrics
          </CardTitle>
          <CardDescription>
            Plan your side income strategy based on skills and time.
          </CardDescription>
        </CardHeader>
        <CardContent>
          <Form {...form}>
            <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-6">

              <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                <FormField
                  control={form.control}
                  name="goalType"
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel>Goal Type</FormLabel>
                      <Select onValueChange={field.onChange} defaultValue={field.value}>
                        <FormControl>
                          <SelectTrigger>
                            <SelectValue placeholder="Select type" />
                          </SelectTrigger>
                        </FormControl>
                        <SelectContent>
                          <SelectItem value="monthly">Recurring Monthly Income</SelectItem>
                          <SelectItem value="total">One-Time Savings Goal</SelectItem>
                        </SelectContent>
                      </Select>
                      <FormMessage />
                    </FormItem>
                  )}
                />

                <FormField
                  control={form.control}
                  name="targetAmount"
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel className="flex items-center gap-2">
                        <Target className="h-4 w-4" />
                        Target Amount ($)
                      </FormLabel>
                      <FormControl>
                        <Input
                          type="number"
                          placeholder="e.g., 2000"
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
                  name="hourlyRate"
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel className="flex items-center gap-2">
                        <DollarSign className="h-4 w-4" />
                        Hourly Rate ($)
                      </FormLabel>
                      <FormControl>
                        <Input
                          type="number"
                          placeholder="e.g., 50"
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
                  name="availableHours"
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel className="flex items-center gap-2">
                        <Clock className="h-4 w-4" />
                        Hours Available / Week
                      </FormLabel>
                      <FormControl>
                        <Input
                          type="number"
                          placeholder="e.g., 10"
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
                  name="taxRate"
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel className="flex items-center gap-2">
                        <Shield className="h-4 w-4" />
                        Est. Tax Rate (%)
                      </FormLabel>
                      <FormControl>
                        <Input
                          type="number"
                          placeholder="e.g., 25"
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
                Calculate Feasibility
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
                <TrendingUp className="h-8 w-8 text-primary" />
                <div>
                  <CardTitle>Goal Analysis</CardTitle>
                  <CardDescription>Path to ${form.getValues().targetAmount?.toLocaleString()}</CardDescription>
                </div>
              </div>
            </CardHeader>
            <CardContent className="space-y-6">
              <div className="text-center">
                <Badge variant={result.feasibility === 'Unrealistic' ? 'destructive' : result.feasibility === 'Challenging' ? 'secondary' : 'default'} className="mb-2">
                  {result.feasibility}
                </Badge>
                <p className="text-xl font-medium mt-2">{result.interpretation}</p>
              </div>

              <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                <div className="text-center p-4 bg-muted/50 rounded-lg">
                  <Clock className="h-6 w-6 mx-auto mb-2 text-blue-600" />
                  <p className="font-semibold">Effort Required</p>
                  <p className="text-2xl font-bold text-blue-700">
                    {form.getValues().goalType === 'monthly'
                      ? `${(result.hoursRequiredTotal / 4.33).toFixed(1)} hrs/wk`
                      : `${result.hoursRequiredTotal.toFixed(0)} total hrs`
                    }
                  </p>
                </div>
                <div className="text-center p-4 bg-muted/50 rounded-lg">
                  <DollarSign className="h-6 w-6 mx-auto mb-2 text-green-600" />
                  <p className="font-semibold">True Net Rate</p>
                  <p className="text-2xl font-bold text-green-700">${result.netRate.toFixed(2)}</p>
                  <p className="text-xs text-muted-foreground">After tax</p>
                </div>
                <div className="text-center p-4 bg-muted/50 rounded-lg">
                  <Target className="h-6 w-6 mx-auto mb-2 text-purple-600" />
                  <p className="font-semibold">Monthly Potential</p>
                  <p className="text-2xl font-bold text-purple-700">${result.monthlyPotential.toLocaleString(undefined, { maximumFractionDigits: 0 })}</p>
                  <p className="text-xs text-muted-foreground">Using all available hours</p>
                </div>
              </div>

              <Alert className="bg-primary/5 border-primary/20">
                <Info className="h-4 w-4" />
                <AlertDescription>
                  <strong>Reality Check:</strong> {result.insights[2]}
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
                <CardDescription>Optimize your hustle</CardDescription>
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
                <CardDescription>Steps to success</CardDescription>
              </CardHeader>
              <CardContent className="space-y-4">
                {result.actionPlan.map((tip, index) => (
                  <div key={index} className="flex items-start gap-3 p-3 bg-indigo-50 dark:bg-indigo-900/10 rounded-lg border border-indigo-100 dark:border-indigo-900/20">
                    <ArrowRight className="h-5 w-5 text-indigo-600 dark:text-indigo-400 mt-0.5 shrink-0" />
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
              Hours Needed = Amount / [Rate × (1 - Tax%)]
            </p>
          </div>
          <p className="text-sm text-muted-foreground mt-2">
            The calculator always prioritizes <strong>Net Income</strong> (take-home pay). Most beginners fail to account for the Self-Employment Tax tax, leading to goals that are mathematically impossible to hit with their actual bank deposits.
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
            Grow your extra income
          </CardDescription>
        </CardHeader>
        <CardContent>
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
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
            <Link href="/emergency-fund-requirement-calculator" className="block">
              <Card className="hover:shadow-md transition-shadow cursor-pointer">
                <CardContent className="p-4">
                  <div className="flex items-center gap-3">
                    <Shield className="h-5 w-5 text-blue-600" />
                    <div>
                      <p className="font-medium">Emergency Fund</p>
                      <p className="text-sm text-muted-foreground">Save your earnings</p>
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
                      <p className="text-sm text-muted-foreground">When will you hit it?</p>
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
                      <p className="text-sm text-muted-foreground">Invest the surplus</p>
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
                      <p className="text-sm text-muted-foreground">Long-term goals</p>
                    </div>
                  </div>
                </CardContent>
              </Card>
            </Link>
            <Link href="/credit-card-payoff-calculator" className="block">
              <Card className="hover:shadow-md transition-shadow cursor-pointer">
                <CardContent className="p-4">
                  <div className="flex items-center gap-3">
                    <AlertTriangle className="h-5 w-5 text-red-600" />
                    <div>
                      <p className="font-medium">Debt Payoff</p>
                      <p className="text-sm text-muted-foreground">Clear debt first</p>
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
        <meta itemProp="name" content="Side Income Goal Calculator: Plan Your Hustle" />
        <meta itemProp="description" content="Calculate exactly how many hours you need to work to hit your side income goals. Factor in taxes, hourly rates, and limited availability to create a realistic plan." />
        <meta itemProp="keywords" content="side income calculator, freelance rate calculator, side hustle goals, extra income planner, hourly rate taxable calculator" />
        <meta itemProp="author" content="MegaCalc Financial Team" />
        <meta itemProp="datePublished" content="2025-10-30" />
        <meta itemProp="url" content="/side-income-guide" />

        <h1 className="text-3xl md:text-4xl font-extrabold text-foreground mb-4" itemProp="headline">The Side Hustle Blueprint: Calculating Your Path to Extra Income</h1>
        <p className="text-lg italic text-muted-foreground">"Your 9-to-5 pays the bills. Your 6-to-10 builds the empire." Learn how to mathematically structure your side income to achieve financial freedom faster.</p>

        {/* TABLE OF CONTENTS */}
        <h2 className="text-2xl font-bold text-foreground mt-8 mb-4">Table of Contents</h2>
        <ul className="list-disc ml-6 space-y-2 text-primary">
          <li><a href="#active-vs-passive" className="hover:underline">Active vs. Passive: Choosing Your Lane</a></li>
          <li><a href="#pricing" className="hover:underline">The Pricing Trap: Why You Are Undercharging</a></li>
          <li><a href="#burnout" className="hover:underline">Avoiding Burnout: The "Available Hours" Limit</a></li>
          <li><a href="#taxes" className="hover:underline">Warning: Don't Forget the Tax Man</a></li>
          <li><a href="#scaling" className="hover:underline">Strategy: From Side Hustle to Main Hustle</a></li>
        </ul>
        <hr />

        {/* SECTION 1: ACTIVE VS PASSIVE */}
        <h2 id="active-vs-passive" className="text-2xl font-bold text-foreground pt-8" itemProp="articleSection">Active vs. Passive: Choosing Your Lane</h2>
        <p>This calculator focuses on <strong>Active Income</strong>—trading time for money (freelancing, consulting, driving Uber). This is the fastest way to generate cash <em>now</em>.</p>
        <p><strong>Passive Income</strong> (investments, digital products) requires upfront effort with delayed rewards. If you need $1,000 this month, choose Active. If you want $1,000/month for life starting next year, choose Passive (and use our Passive Income Calculator).</p>

        <hr />

        {/* SECTION 2: PRICING */}
        <h2 id="pricing" className="text-2xl font-bold text-foreground pt-8" itemProp="articleSection">The Pricing Trap: Why You Are Undercharging</h2>
        <p>If you earn $50/hr at your day job, you shouldn't charge $50/hr for freelancing. You should charge $75-$100.</p>
        <p>Why? Because of <strong>Non-Billable Hours</strong>. You spend time finding clients, invoicing, and marketing. None of that is paid. Your "Billable Rate" must be high enough to cover your administrative time.</p>

        <hr />

        {/* SECTION 3: BURNOUT */}
        <h2 id="burnout" className="text-2xl font-bold text-foreground pt-8" itemProp="articleSection">Avoiding Burnout: The "Available Hours" Limit</h2>
        <p>The most common mistake is overestimating availability. You might <em>think</em> you have 20 hours a week, but after a 40-hour job, commuting, and family time, you likely have 5-10 productive hours.</p>
        <p><strong>The Rule of 3:</strong> If you think a project will take 1 hour, budget 3. It's better to Under-Promise and Over-Deliver (and Over-Budget time).</p>

        <hr />

        {/* SECTION 4: TAXES */}
        <h2 id="taxes" className="text-2xl font-bold text-foreground pt-8" itemProp="articleSection">Warning: Don't Forget the Tax Man</h2>
        <p>In a W2 job, your employer pays half your FICA taxes. In a 1099 side hustle, you pay <strong>Self-Employment Tax</strong> (15.3%) PLUS Income Tax.</p>
        <ul className="list-disc ml-6 space-y-2">
          <li><strong>Rule of Thumb:</strong> Save 30% of every check.</li>
          <li><strong>The Mistake:</strong> Spending the gross amount. Come April, you will owe thousands you don't have.</li>
        </ul>

        <hr />

        {/* SECTION 5: SCALING */}
        <h2 id="scaling" className="text-2xl font-bold text-foreground pt-8" itemProp="articleSection">Strategy: From Side Hustle to Main Hustle</h2>
        <p>How do you transition? Use the "Replacement Ratio."</p>
        <p>When your Side Income Net Profit (after tax and expenses) equals 75% of your Day Job Salary, it is generally safe to quit. Don't jump too early. The side hustle provides security <em>because</em> the day job covers the bills.</p>
      </section>

      {/* FAQ Section */}
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <Info className="h-5 w-5" />
            Frequently Asked Questions (FAQ)
          </CardTitle>
          <CardDescription>
            Common questions about extra income
          </CardDescription>
        </CardHeader>
        <CardContent>
          <div className="space-y-6">
            <div>
              <h4 className="font-semibold text-lg mb-3">What is a good hourly rate for a beginner?</h4>
              <p className="text-muted-foreground">
                Research industry standards, but never go below minimum wage. A common starting formula is (Desired Annual Salary / 2000) * 1.5. If you want $50k/yr, charge ~$37/hr ($25 base * 1.5 multiplier).
              </p>
            </div>

            <div>
              <h4 className="font-semibold text-lg mb-3">Should I charge hourly or per project?</h4>
              <p className="text-muted-foreground">
                Beginners charge hourly. Pros charge per project (value-based pricing). Project pricing rewards speed—if you finish faster, your effective hourly rate goes up. Hourly pricing punishes efficiency.
              </p>
            </div>

            <div>
              <h4 className="font-semibold text-lg mb-3">How do I find time to work?</h4>
              <p className="text-muted-foreground">
                Audit your schedule. The average person spends 3-4 hours on phone/TV daily. Reclaim the mornings (5-7 AM) or late evenings. Consistency (1 hour daily) beats binge-working (10 hours Sunday).
              </p>
            </div>

            <div>
              <h4 className="font-semibold text-lg mb-3">Do I need an LLC?</h4>
              <p className="text-muted-foreground">
                Usually, no, not to start. You can operate as a Sole Proprietor using your SSN. An LLC offers liability protection but adds paperwork/cost. Consult a CPA when you exceed $10k-$20k/year.
              </p>
            </div>

            <div>
              <h4 className="font-semibold text-lg mb-3">What are the best side hustles?</h4>
              <p className="text-muted-foreground">
                High skill = High pay (Coding, Consulting, Copywriting). Low barrier = Low pay (Surveys, Data Entry). The "best" one leverages skills you already use at your day job.
              </p>
            </div>

            <div>
              <h4 className="font-semibold text-lg mb-3">Can I get fired for having a side hustle?</h4>
              <p className="text-muted-foreground">
                Check your employment contract for "Moonlighting" clauses or "Non-Competes." Generally, as long as you don't use company time/laptops and aren't stealing clients, it's legal. But proceed with caution.
              </p>
            </div>

            <div>
              <h4 className="font-semibold text-lg mb-3">What expenses can I deduct?</h4>
              <p className="text-muted-foreground">
                Only "ordinary and necessary" business expenses. Software subscriptions, specific equipment, and advertising. You generally cannot deduct your home internet or rent unless you have a dedicated home office.
              </p>
            </div>

            <div>
              <h4 className="font-semibold text-lg mb-3">What if a client doesn't pay?</h4>
              <p className="text-muted-foreground">
                Always use a contract. Ask for a 50% deposit upfront. Stop working immediately if a payment is late. Contracts scare away bad clients.
              </p>
            </div>

            <div>
              <h4 className="font-semibold text-lg mb-3">Is it worth it for just $500/month?</h4>
              <p className="text-muted-foreground">
                Yes. $500 invested monthly at 8% for 30 years becomes $750,000. A "small" side hustle is a massive wealth accelerator.
              </p>
            </div>

            <div>
              <h4 className="font-semibold text-lg mb-3">How do I explain gaps or side work on my resume?</h4>
              <p className="text-muted-foreground">
                Frame it as "Freelance Consultant" or "Entrepreneur." It shows initiative and skill diversity. Employers usually value this, provided it doesn't distract from the main job.
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
          <p>The Side Income Goal Calculator bridges the gap between financial dreams and daily reality.</p>
          <p>By inputting simple variables like tax rate and availability, it generates a feasibility score that prevents burnout and ensures profitability.</p>
          <p>Whether saving for a vacation or building a business, this tool clarifies the "Work" part of the equation.</p>
        </CardContent>
      </Card>
    </div>
  );
}

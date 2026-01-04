'use client';

import { useState } from 'react';
import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import { z } from 'zod';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Form, FormControl, FormField, FormItem, FormLabel, FormMessage } from '@/components/ui/form';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Zap, TrendingUp, AlertCircle, Target, Info, Landmark, Calculator, DollarSign, BarChart3, Shield, TrendingDown, FunctionSquare, CheckCircle2, Users, Briefcase, AlertTriangle, GraduationCap, BookOpen, Clock } from 'lucide-react';
import { Badge } from '@/components/ui/badge';
import { Alert, AlertDescription } from '@/components/ui/alert';
import Link from 'next/link';

const formSchema = z.object({
  childAge: z.number().min(0, 'Age cannot be negative').max(18, 'Calculator assumes planning before age 18'),
  collegeStartAge: z.number().min(16).max(25).default(18),
  currentAnnualCost: z.number().min(0, 'Cost must be positive'),
  courseDuration: z.number().min(1).max(10).default(4),
  educationInflation: z.number().min(0).max(50),
  currentSavings: z.number().min(0).optional(),
  monthlyContribution: z.number().min(0).optional(),
  annualReturn: z.number().min(-100).max(100),
});

type FormValues = z.infer<typeof formSchema>;

export default function ChildEducationFundCalculator() {
  const [result, setResult] = useState<{
    futureCostTotal: number;
    projectedSavings: number;
    shortfall: number;
    monthlyRequired: number;
    yearsToGrow: number;
    costMultiplier: number;
    readiness: number;
    interpretation: string;
    recommendation: string;
    insights: string[];
    risks: string[];
  } | null>(null);

  const form = useForm<FormValues>({
    resolver: zodResolver(formSchema),
    defaultValues: {
      childAge: undefined,
      collegeStartAge: 18,
      currentAnnualCost: undefined,
      courseDuration: 4,
      educationInflation: 6,
      currentSavings: 0,
      monthlyContribution: 0,
      annualReturn: 8,
    },
  });

  const calculate = (v: FormValues) => {
    const yearsToGrow = v.collegeStartAge - v.childAge;
    if (yearsToGrow <= 0) return null;

    const r_infl = v.educationInflation / 100;
    const r_inv = v.annualReturn / 100;
    const r_inv_monthly = r_inv / 12;
    const months = yearsToGrow * 12;

    // 1. Calculate Future Cost of Education
    // We need to sum the cost of each year of college, inflated to that specific year.
    // Year 1 Cost = Current * (1+inf)^YearsToGrow
    // Year 2 Cost = Current * (1+inf)^(YearsToGrow + 1) ...
    let futureCostTotal = 0;
    for (let i = 0; i < v.courseDuration; i++) {
      futureCostTotal += v.currentAnnualCost * Math.pow(1 + r_infl, yearsToGrow + i);
    }

    // 2. Calculate Projected Savings at start of College
    // FV = P*(1+r)^t + PMT*...
    const fv_lump = (v.currentSavings || 0) * Math.pow(1 + r_inv, yearsToGrow);
    let fv_sip = 0;
    if (v.monthlyContribution && v.monthlyContribution > 0) {
      if (r_inv === 0) {
        fv_sip = v.monthlyContribution * months;
      } else {
        fv_sip = v.monthlyContribution * ((Math.pow(1 + r_inv_monthly, months) - 1) / r_inv_monthly);
      }
    }
    const projectedSavings = fv_lump + fv_sip;

    // 3. Shortfall
    const shortfall = Math.max(0, futureCostTotal - projectedSavings);

    // 4. Required Monthly
    // We need to cover the shortfall.
    // Shortfall = PMT_Req * SeriesMultiplier
    let monthlyRequired = 0;
    if (shortfall > 0) {
      if (r_inv === 0) {
        monthlyRequired = shortfall / months;
      } else {
        // We just add this to the existing monthly contribution to find Total Required, or just "Additional Needed".
        // Let's calculated Total Required Monthly from scratch for clarity
        // TotalTarget = FutureCostTotal
        // Target - FV_Lump = SeriesPart
        const targetSeries = futureCostTotal - fv_lump;
        const seriesMultiplier = ((Math.pow(1 + r_inv_monthly, months) - 1) / r_inv_monthly);
        monthlyRequired = targetSeries / seriesMultiplier;
      }
    } else {
      monthlyRequired = 0;
    }

    const costMultiplier = futureCostTotal / (v.currentAnnualCost * v.courseDuration);
    const readiness = Math.min(100, (projectedSavings / futureCostTotal) * 100);

    return { futureCostTotal, projectedSavings, shortfall, monthlyRequired, yearsToGrow, costMultiplier, readiness };
  };

  const getInterpretation = (readiness: number) => {
    if (readiness >= 100) return 'Excellent! You are fully prepared for the projected costs.';
    if (readiness >= 75) return 'Strong position. You are on track to cover most expenses.';
    if (readiness >= 50) return 'Halfway there. Significant adjustments needed to avoid student loans.';
    return 'Critical Gap. Immediate action required to secure funding.';
  };

  const getRecommendation = (shortfall: number, monthlyRequired: number, currentMonthly: number) => {
    if (shortfall <= 0) return 'Maintain your current strategy. Consider shifting to conservative assets as the date approaches.';
    const additional = monthlyRequired - (currentMonthly || 0);
    return `You need to increase your monthly investment by approximately $${additional.toLocaleString(undefined, { maximumFractionDigits: 0 })} to close the gap.`;
  };

  const getInsights = (multiplier: number, years: number, inflation: number) => {
    const insights = [];
    insights.push(`The cost of education is projected to increase by ${(multiplier * 100 - 100).toFixed(0)}% by the time your child enrolls.`);
    if (years > 10) insights.push(`You have ${years} years on your side. High-growth equity funds are recommended for this phase.`);
    if (years < 5) insights.push('Time is short. Focus on capital preservation and secure, fixed-income instruments.');
    if (inflation > 6) insights.push('Education inflation is running hot. Standard savings accounts will likely fail to keep up.');
    return insights;
  };

  const onSubmit = (values: FormValues) => {
    const calc = calculate(values);
    if (!calc) return;

    const { futureCostTotal, projectedSavings, shortfall, monthlyRequired, yearsToGrow, costMultiplier, readiness } = calc;

    setResult({
      futureCostTotal,
      projectedSavings,
      shortfall,
      monthlyRequired,
      yearsToGrow,
      costMultiplier,
      readiness,
      interpretation: getInterpretation(readiness),
      recommendation: getRecommendation(shortfall, monthlyRequired, values.monthlyContribution || 0),
      insights: getInsights(costMultiplier, yearsToGrow, values.educationInflation),
      risks: [
        'Tuition fees often rise faster (8-10%) than general inflation.',
        'Scholarships are competitive and not guaranteed.',
        'Market volatility near withdrawal time can reduce corpus value.'
      ]
    });
  };

  return (
    <div className="space-y-8">

      {/* Input Form */}
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <GraduationCap className="h-5 w-5" />
            Education Planning Inputs
          </CardTitle>
          <CardDescription>
            Map out the financial timeline for your child's future
          </CardDescription>
        </CardHeader>
        <CardContent>
          <Form {...form}>
            <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-6">
              <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                {/* Child Details */}
                <div className="space-y-4">
                  <h4 className="font-medium text-sm text-muted-foreground flex items-center gap-2">
                    <Users className="h-4 w-4" /> Child Profile
                  </h4>
                  <div className="grid grid-cols-2 gap-4">
                    <FormField
                      control={form.control}
                      name="childAge"
                      render={({ field }) => (
                        <FormItem>
                          <FormLabel>Child's Current Age</FormLabel>
                          <FormControl>
                            <Input type="number" placeholder="e.g., 5" {...field} onChange={e => field.onChange(parseFloat(e.target.value))} />
                          </FormControl>
                          <FormMessage />
                        </FormItem>
                      )}
                    />
                    <FormField
                      control={form.control}
                      name="collegeStartAge"
                      render={({ field }) => (
                        <FormItem>
                          <FormLabel>Start Age</FormLabel>
                          <FormControl>
                            <Input type="number" placeholder="e.g., 18" {...field} onChange={e => field.onChange(parseFloat(e.target.value))} />
                          </FormControl>
                          <FormMessage />
                        </FormItem>
                      )}
                    />
                  </div>
                </div>

                {/* Cost Details */}
                <div className="space-y-4">
                  <h4 className="font-medium text-sm text-muted-foreground flex items-center gap-2">
                    <DollarSign className="h-4 w-4" /> Cost Estimation
                  </h4>
                  <div className="grid grid-cols-2 gap-4">
                    <FormField
                      control={form.control}
                      name="currentAnnualCost"
                      render={({ field }) => (
                        <FormItem>
                          <FormLabel>Annual Cost (Today)</FormLabel>
                          <FormControl>
                            <Input type="number" placeholder="e.g., 25000" {...field} onChange={e => field.onChange(parseFloat(e.target.value))} />
                          </FormControl>
                          <FormMessage />
                        </FormItem>
                      )}
                    />
                    <FormField
                      control={form.control}
                      name="courseDuration"
                      render={({ field }) => (
                        <FormItem>
                          <FormLabel>Duration (Years)</FormLabel>
                          <FormControl>
                            <Input type="number" placeholder="e.g., 4" {...field} onChange={e => field.onChange(parseFloat(e.target.value))} />
                          </FormControl>
                          <FormMessage />
                        </FormItem>
                      )}
                    />
                  </div>
                </div>

                {/* Financials */}
                <div className="space-y-4 md:col-span-2">
                  <h4 className="font-medium text-sm text-muted-foreground flex items-center gap-2">
                    <TrendingUp className="h-4 w-4" /> Investment Strategy
                  </h4>
                  <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
                    <FormField
                      control={form.control}
                      name="currentSavings"
                      render={({ field }) => (
                        <FormItem>
                          <FormLabel>Current Fund</FormLabel>
                          <FormControl>
                            <Input type="number" placeholder="0" {...field} onChange={e => field.onChange(parseFloat(e.target.value))} />
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
                          <FormLabel>Monthly SIP</FormLabel>
                          <FormControl>
                            <Input type="number" placeholder="500" {...field} onChange={e => field.onChange(parseFloat(e.target.value))} />
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
                          <FormLabel>Exp. Return (%)</FormLabel>
                          <FormControl>
                            <Input type="number" placeholder="8" {...field} onChange={e => field.onChange(parseFloat(e.target.value))} />
                          </FormControl>
                          <FormMessage />
                        </FormItem>
                      )}
                    />
                    <FormField
                      control={form.control}
                      name="educationInflation"
                      render={({ field }) => (
                        <FormItem>
                          <FormLabel>Edu. Inflation (%)</FormLabel>
                          <FormControl>
                            <Input type="number" placeholder="6" {...field} onChange={e => field.onChange(parseFloat(e.target.value))} />
                          </FormControl>
                          <FormMessage />
                        </FormItem>
                      )}
                    />
                  </div>
                </div>
              </div>
              <Button type="submit" className="w-full">
                <Calculator className="mr-2 h-4 w-4" />
                Calculate Education Corpus
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
                <GraduationCap className="h-8 w-8 text-primary" />
                <div>
                  <CardTitle>Education Fund Projection</CardTitle>
                  <CardDescription>Target Readiness Analysis</CardDescription>
                </div>
              </div>
            </CardHeader>
            <CardContent className="space-y-6">
              <div className="text-center">
                <p className="text-sm font-medium text-muted-foreground uppercase tracking-wider">Required Corpus at Age {form.getValues().collegeStartAge}</p>
                <p className="text-4xl font-extrabold text-primary mt-1">${result.futureCostTotal.toLocaleString(undefined, { maximumFractionDigits: 0 })}</p>
                <p className="text-lg text-muted-foreground mt-2">{result.interpretation}</p>
              </div>

              <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                <div className="text-center p-4 bg-muted/50 rounded-lg">
                  <Shield className="h-6 w-6 mx-auto mb-2 text-blue-600" />
                  <p className="font-semibold">Projected Corpus</p>
                  <p className="text-lg font-bold">${result.projectedSavings.toLocaleString(undefined, { maximumFractionDigits: 0 })}</p>
                  <p className="text-xs text-muted-foreground mt-1">({result.readiness.toFixed(0)}% Readines)</p>
                </div>
                <div className="text-center p-4 bg-muted/50 rounded-lg">
                  <AlertCircle className="h-6 w-6 mx-auto mb-2 text-orange-600" />
                  <p className="font-semibold">Shortfall</p>
                  <p className="text-lg font-bold text-orange-600">${result.shortfall.toLocaleString(undefined, { maximumFractionDigits: 0 })}</p>
                </div>
                <div className="text-center p-4 bg-muted/50 rounded-lg">
                  <TrendingUp className="h-6 w-6 mx-auto mb-2 text-green-600" />
                  <p className="font-semibold">Monthly Goal</p>
                  <p className="text-lg font-bold text-green-600">${result.monthlyRequired.toLocaleString(undefined, { maximumFractionDigits: 0 })}</p>
                </div>
              </div>

              <Alert>
                <Info className="h-4 w-4" />
                <AlertDescription>
                  <strong>Advisor's Note:</strong> {result.recommendation}
                </AlertDescription>
              </Alert>
            </CardContent>
          </Card>

          {/* Smart Actions & Recommendations */}
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6 mb-6">
            <Card className="h-full">
              <CardHeader>
                <CardTitle className="flex items-center gap-2 text-xl text-primary">
                  <BookOpen className="h-6 w-6" />
                  Strategic Insights
                </CardTitle>
                <CardDescription>Key takeaways for your plan</CardDescription>
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

            <Card className="h-full border-red-100 bg-red-50/10 dark:border-red-900/20 dark:bg-red-900/5">
              <CardHeader>
                <CardTitle className="flex items-center gap-2 text-xl text-red-600 dark:text-red-400">
                  <AlertTriangle className="h-6 w-6" />
                  Risk Assessment
                </CardTitle>
                <CardDescription>Factors that could derail the plan</CardDescription>
              </CardHeader>
              <CardContent className="space-y-4">
                {result.risks.map((risk, index) => (
                  <div key={index} className="flex items-start gap-3 p-3 bg-red-50 dark:bg-red-900/10 rounded-lg border border-red-100 dark:border-red-900/20">
                    <AlertCircle className="h-5 w-5 text-red-600 dark:text-red-400 mt-0.5 shrink-0" />
                    <span className="text-sm font-medium text-red-800 dark:text-red-300">{risk}</span>
                  </div>
                ))}
              </CardContent>
            </Card>
          </div>
        </div>
      )}

      {/* Understanding the Inputs */}
      <Card className="mb-6">
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <Info className="h-5 w-5" />
            Understanding Education Inflation
          </CardTitle>
          <CardDescription>
            Why college costs rise faster than everything else
          </CardDescription>
        </CardHeader>
        <CardContent>
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div className="p-4 bg-blue-50 dark:bg-blue-900/10 rounded-lg border border-blue-100 dark:border-blue-900/20">
              <h4 className="font-semibold mb-2 flex items-center gap-2 text-blue-700 dark:text-blue-300">
                <TrendingUp className="h-4 w-4" />
                The "Baumol Effect"
              </h4>
              <p className="text-sm text-muted-foreground mb-3">
                Education is labor-intensive. While factories get more efficient with robots, teaching still requires highly skilled humans.
              </p>
              <ul className="space-y-2">
                <li className="flex items-start gap-2 text-sm text-muted-foreground">
                  <CheckCircle2 className="h-4 w-4 text-blue-500 mt-0.5 shrink-0" />
                  <span><strong>Rising Salaries:</strong> Universities must pay competitive wages to attract top talent.</span>
                </li>
                <li className="flex items-start gap-2 text-sm text-muted-foreground">
                  <CheckCircle2 className="h-4 w-4 text-blue-500 mt-0.5 shrink-0" />
                  <span><strong>Admin Bloat:</strong> Increased spending on student services and administrative overhead.</span>
                </li>
              </ul>
            </div>

            <div className="p-4 bg-amber-50 dark:bg-amber-900/10 rounded-lg border border-amber-100 dark:border-amber-900/20">
              <h4 className="font-semibold mb-2 flex items-center gap-2 text-amber-700 dark:text-amber-300">
                <Clock className="h-4 w-4" />
                The Time Factor
              </h4>
              <p className="text-sm text-muted-foreground mb-3">
                Years to grow vs years of inflation.
              </p>
              <ul className="space-y-2">
                <li className="flex items-start gap-2 text-sm text-muted-foreground">
                  <CheckCircle2 className="h-4 w-4 text-amber-500 mt-0.5 shrink-0" />
                  <span><strong>Compounding Cost:</strong> If costs rise 6% a year, they double every 12 years. A $100k degree today will be $200k for your 6-year-old.</span>
                </li>
              </ul>
            </div>
          </div>
        </CardContent>
      </Card>

      {/* Formula Used */}
      <Card className="mb-6">
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <FunctionSquare className="h-5 w-5" />
            Calculation Methodology
          </CardTitle>
        </CardHeader>
        <CardContent className="space-y-4">
          <div className="p-4 bg-muted rounded-lg overflow-x-auto">
            <p className="font-mono text-sm text-center">
              Target Corpus = Σ [Annual Cost × (1 + Inflation Rate)^(Start Year + k)]
            </p>
          </div>
          <p className="text-sm text-muted-foreground mt-2">
            We calculate the projected cost for <em>each individual year</em> of the degree (e.g., Freshman, Sophomore...) correctly inflated to that specific future year, then sum them up to find the total corpus required at the start date.
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
            More family planning resources
          </CardDescription>
        </CardHeader>
        <CardContent>
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
            <Link href="/category/finance/inflation-adjusted-savings-goal-calculator" className="block">
              <Card className="hover:shadow-md transition-shadow cursor-pointer">
                <CardContent className="p-4">
                  <div className="flex items-center gap-3">
                    <TrendingDown className="h-5 w-5 text-red-600" />
                    <div>
                      <p className="font-medium">Inflation Adjuster</p>
                      <p className="text-sm text-muted-foreground">General cost planning</p>
                    </div>
                  </div>
                </CardContent>
              </Card>
            </Link>
            <Link href="/category/finance/sip-calculator" className="block">
              <Card className="hover:shadow-md transition-shadow cursor-pointer">
                <CardContent className="p-4">
                  <div className="flex items-center gap-3">
                    <TrendingUp className="h-5 w-5 text-green-600" />
                    <div>
                      <p className="font-medium">SIP Calculator</p>
                      <p className="text-sm text-muted-foreground">Monthly investment output</p>
                    </div>
                  </div>
                </CardContent>
              </Card>
            </Link>
            <Link href="/category/finance/investment-goal-tracker-calculator" className="block">
              <Card className="hover:shadow-md transition-shadow cursor-pointer">
                <CardContent className="p-4">
                  <div className="flex items-center gap-3">
                    <Target className="h-5 w-5 text-blue-600" />
                    <div>
                      <p className="font-medium">Goal Tracker</p>
                      <p className="text-sm text-muted-foreground">Track your progress</p>
                    </div>
                  </div>
                </CardContent>
              </Card>
            </Link>
            <Link href="/category/finance/compound-interest-calculator" className="block">
              <Card className="hover:shadow-md transition-shadow cursor-pointer">
                <CardContent className="p-4">
                  <div className="flex items-center gap-3">
                    <BarChart3 className="h-5 w-5 text-purple-600" />
                    <div>
                      <p className="font-medium">Compound Interest</p>
                      <p className="text-sm text-muted-foreground">Long-term growth</p>
                    </div>
                  </div>
                </CardContent>
              </Card>
            </Link>
            <Link href="/category/finance/step-up-sip-calculator" className="block">
              <Card className="hover:shadow-md transition-shadow cursor-pointer">
                <CardContent className="p-4">
                  <div className="flex items-center gap-3">
                    <Zap className="h-5 w-5 text-yellow-600" />
                    <div>
                      <p className="font-medium">Step-Up SIP</p>
                      <p className="text-sm text-muted-foreground">Increasing investments</p>
                    </div>
                  </div>
                </CardContent>
              </Card>
            </Link>
            <Link href="/category/finance/cost-of-delay-investing-late-calculator" className="block">
              <Card className="hover:shadow-md transition-shadow cursor-pointer">
                <CardContent className="p-4">
                  <div className="flex items-center gap-3">
                    <Clock className="h-5 w-5 text-orange-600" />
                    <div>
                      <p className="font-medium">Cost of Delay</p>
                      <p className="text-sm text-muted-foreground">Price of waiting</p>
                    </div>
                  </div>
                </CardContent>
              </Card>
            </Link>
          </div>
        </CardContent>
      </Card>

      {/* Complete Guide Section */}
      <section className="space-y-8 text-muted-foreground leading-relaxed bg-card p-8 md:p-12 rounded-xl shadow-sm border border-border" itemScope itemType="https://schema.org/FinanceArticle">
        {/* SEO & SCHEMA METADATA */}
        <meta itemProp="name" content="The Complete Guide to Child Education Planning: Costs, Inflation, and Investment Strategies" />
        <meta itemProp="description" content="A parent's definitive masterclass on calculating and saving for future university expenses. We break down education inflation, 529 plans vs. Roth IRAs, FAFSA implications, and age-based investment strategies." />
        <meta itemProp="keywords" content="child education plan calculator, college savings calculator, education inflation rate, 529 plan benefits, saving for college, FAFSA strategy, custodial accounts, student loan avoidance" />
        <meta itemProp="author" content="MegaCalc Financial Team" />
        <meta itemProp="datePublished" content="2025-11-28" />
        <meta itemProp="url" content="/child-education-fund-guide" />

        <header className="space-y-4 border-b border-border pb-8">
          <Badge variant="secondary" className="mb-2">Family Financial Planning</Badge>
          <h1 className="text-3xl md:text-5xl font-extrabold text-foreground tracking-tight" itemProp="headline">Securing Their Future: The Master Guide to Education Planning</h1>
          <p className="text-xl text-muted-foreground max-w-3xl">
            The greatest gift you can give your child is a debt-free start to adulthood. But with tuition costs spiraling out of control, hope is not a strategy. This guide provides the tactical roadmap you need.
          </p>
        </header>

        {/* TABLE OF CONTENTS */}
        <nav className="bg-muted/50 p-6 rounded-lg border border-border/50">
          <h2 className="text-lg font-bold text-foreground mb-4 uppercase tracking-wider text-xs">Table of Contents</h2>
          <ul className="grid grid-cols-1 md:grid-cols-2 gap-3 text-sm">
            <li><a href="#reality" className="flex items-center gap-2 hover:text-primary transition-colors"><ChevronRight className="h-3 w-3" /> The Reality Check: True Costs</a></li>
            <li><a href="#inflation" className="flex items-center gap-2 hover:text-primary transition-colors"><ChevronRight className="h-3 w-3" /> The "Education Inflation" Trap</a></li>
            <li><a href="#vehicles" className="flex items-center gap-2 hover:text-primary transition-colors"><ChevronRight className="h-3 w-3" /> Top 4 Investment Vehicles</a></li>
            <li><a href="#timeline" className="flex items-center gap-2 hover:text-primary transition-colors"><ChevronRight className="h-3 w-3" /> Age-Based Strategy (The Glide Path)</a></li>
            <li><a href="#aid" className="flex items-center gap-2 hover:text-primary transition-colors"><ChevronRight className="h-3 w-3" /> Financial Aid & FAFSA</a></li>
            <li><a href="#mistakes" className="flex items-center gap-2 hover:text-primary transition-colors"><ChevronRight className="h-3 w-3" /> Avoiding Common Pitfalls</a></li>
          </ul>
        </nav>

        {/* THE REALITY CHECK */}
        <article id="reality" className="prose prose-slate dark:prose-invert max-w-none">
          <h2 className="text-2xl md:text-3xl font-bold text-foreground pt-4" itemProp="articleSection">The Reality Check: It Costs More Than You Think</h2>
          <p>
            College is expensive. But "expensive" is a vague term that leads to complacency. Let's quantify the financial mountain you are climbing.
          </p>
          <div className="grid grid-cols-1 md:grid-cols-3 gap-6 my-8 not-prose">
            <div className="p-6 bg-slate-50 dark:bg-slate-900/50 rounded-xl border border-slate-200 dark:border-slate-800">
              <strong className="block text-xl font-bold mb-2">Public In-State</strong>
              <div className="text-3xl font-extrabold text-primary mb-1">$25,000</div>
              <span className="text-sm text-muted-foreground">Per Year (Tuition + Room/Board)</span>
            </div>
            <div className="p-6 bg-slate-50 dark:bg-slate-900/50 rounded-xl border border-slate-200 dark:border-slate-800">
              <strong className="block text-xl font-bold mb-2">Private University</strong>
              <div className="text-3xl font-extrabold text-primary mb-1">$55,000</div>
              <span className="text-sm text-muted-foreground">Per Year (Average)</span>
            </div>
            <div className="p-6 bg-slate-50 dark:bg-slate-900/50 rounded-xl border border-slate-200 dark:border-slate-800">
              <strong className="block text-xl font-bold mb-2">Elite / Ivy</strong>
              <div className="text-3xl font-extrabold text-primary mb-1">$85,000+</div>
              <span className="text-sm text-muted-foreground">Per Year (All-in cost)</span>
            </div>
          </div>
          <p>
            An Elite degree today is a <strong>$340,000</strong> commitment. That is the price of a single-family home in many parts of the country. And remember: these are <em>today's</em> prices.
          </p>
        </article>

        <hr className="border-border" />

        {/* INFLATION TRAP */}
        <article id="inflation" className="prose prose-slate dark:prose-invert max-w-none">
          <h2 className="text-2xl md:text-3xl font-bold text-foreground pt-4" itemProp="articleSection">The "Education Inflation" Trap</h2>
          <p>
            While general inflation (CPI) hovers around 3%, higher education plays by its own rules. <strong>Education Inflation averages 6-8% annually</strong>. This means the cost of college doubles roughly every 9-12 years.
          </p>
          <p>
            If you have a newborn today, and a 4-year public degree costs $100,000 total today, it will likely cost <strong>$250,000 to $300,000</strong> by the time they are 18.
          </p>
          <div className="p-4 bg-amber-50 dark:bg-amber-950/20 border-l-4 border-amber-500 my-4 text-sm text-amber-900 dark:text-amber-200">
            <strong>Warning:</strong> Never use a standard "Savings Calculator" for college planning. If you assume 3% inflation, you will arrive at the finish line with only half the money needed. Always use a dedicated Education Calculator like this one.
          </div>
        </article>

        <hr className="border-border" />

        {/* VEHICLES */}
        <article id="vehicles" className="prose prose-slate dark:prose-invert max-w-none">
          <h2 className="text-2xl md:text-3xl font-bold text-foreground pt-4" itemProp="articleSection">Best Investment Vehicles</h2>
          <p>
            Where should you park this money? A savings account earning 1% is a guaranteed way to lose the race against 6% tuition inflation. You need tax-advantaged growth.
          </p>

          <div className="space-y-6 mt-6">
            <div>
              <h3 className="text-xl font-bold text-foreground flex items-center gap-2">
                <span className="flex items-center justify-center w-6 h-6 rounded-full bg-primary text-primary-foreground text-xs font-bold">1</span>
                529 Plans (The Gold Standard)
              </h3>
              <p className="mt-2 text-sm leading-relaxed">
                <strong>Pros:</strong> Money grows tax-free. Withdrawals are tax-free if used for education. High contribution limits. Many states offer state income tax deductions.
                <br />
                <strong>Cons:</strong> Money determines limited investment choices. Penalties if used for non-education (though new rules allow rolling over to Roth IRA).
              </p>
            </div>

            <div>
              <h3 className="text-xl font-bold text-foreground flex items-center gap-2">
                <span className="flex items-center justify-center w-6 h-6 rounded-full bg-primary text-primary-foreground text-xs font-bold">2</span>
                Coverdell ESA
              </h3>
              <p className="mt-2 text-sm leading-relaxed">
                <strong>Pros:</strong> Investment flexibility (buy individual stocks/crypto). Tax-free growth/withdrawal.
                <br />
                <strong>Cons:</strong> Low contribution limit ($2,000/year/child). Income limits apply for contributors.
              </p>
            </div>

            <div>
              <h3 className="text-xl font-bold text-foreground flex items-center gap-2">
                <span className="flex items-center justify-center w-6 h-6 rounded-full bg-primary text-primary-foreground text-xs font-bold">3</span>
                Roth IRA
              </h3>
              <p className="mt-2 text-sm leading-relaxed">
                <strong>Pros:</strong> Ultimate flexibility. Contributions can be withdrawn penalty-free anytime. If child skips college, you keep it for retirement.
                <br />
                <strong>Cons:</strong> Yearly limit ($7,000) is shared with your retirement savings. You might rob your own retirement.
              </p>
            </div>

            <div>
              <h3 className="text-xl font-bold text-foreground flex items-center gap-2">
                <span className="flex items-center justify-center w-6 h-6 rounded-full bg-primary text-primary-foreground text-xs font-bold">4</span>
                Custodial Accounts (UTMA/UGMA)
              </h3>
              <p className="mt-2 text-sm leading-relaxed">
                <strong>Pros:</strong> No contribution limits. No withdrawal restrictions (as long as it benefits the child).
                <br />
                <strong>Cons:</strong> Heavily penalizes Financial Aid (FAFSA). Child gets full control of money at age 18/21 (risk they buy a sports car instead of tuition).
              </p>
            </div>
          </div>
        </article>

        <hr className="border-border" />

        {/* TIMELINE */}
        <article id="timeline" className="prose prose-slate dark:prose-invert max-w-none">
          <h2 className="text-2xl md:text-3xl font-bold text-foreground pt-4" itemProp="articleSection">Timeline Strategy: From Diapers to Dorms</h2>
          <p>
            Your asset allocation should evolve as the child grows. This is known as a <strong>Glide Path</strong>.
          </p>

          <div className="grid grid-cols-1 md:grid-cols-3 gap-4 mt-6 not-prose">
            <div className="p-4 rounded-xl border bg-green-50 dark:bg-green-950/20 border-green-100">
              <strong className="block text-green-800 dark:text-green-300 text-lg mb-2">Age 0-10</strong>
              <div className="text-xs font-bold uppercase tracking-wider text-green-600 mb-2">The Growth Phase</div>
              <p className="text-sm text-green-700/80">
                <strong>Goal:</strong> Maximum Appreciation.
                <br />
                <strong>Portfolio:</strong> 90% Equities / 10% Bonds.
              </p>
              <p className="text-xs mt-2 text-green-600/70">Volatility is irrelevant here. You have 10+ years to recover.</p>
            </div>

            <div className="p-4 rounded-xl border bg-blue-50 dark:bg-blue-950/20 border-blue-100">
              <strong className="block text-blue-800 dark:text-blue-300 text-lg mb-2">Age 11-15</strong>
              <div className="text-xs font-bold uppercase tracking-wider text-blue-600 mb-2">The Consolidation Phase</div>
              <p className="text-sm text-blue-700/80">
                <strong>Goal:</strong> Balance Growth with Safety.
                <br />
                <strong>Portfolio:</strong> 60% Equities / 40% Bonds.
              </p>
              <p className="text-xs mt-2 text-blue-600/70">Start protecting your gains.</p>
            </div>

            <div className="p-4 rounded-xl border bg-slate-50 dark:bg-slate-900/50 border-slate-200">
              <strong className="block text-slate-800 dark:text-slate-300 text-lg mb-2">Age 16-18</strong>
              <div className="text-xs font-bold uppercase tracking-wider text-slate-600 mb-2">The Safety Phase</div>
              <p className="text-sm text-slate-700/80">
                <strong>Goal:</strong> Preservation.
                <br />
                <strong>Portfolio:</strong> 20% Equities / 80% Cash/Bonds.
              </p>
              <p className="text-xs mt-2 text-slate-600/70">You cannot risk a 20% market crash the year before tuition is due.</p>
            </div>
          </div>
        </article>

        <hr className="border-border" />

        {/* AID */}
        <article id="aid" className="prose prose-slate dark:prose-invert max-w-none">
          <h2 className="text-2xl md:text-3xl font-bold text-foreground pt-4" itemProp="articleSection">The Financial Aid Game (FAFSA)</h2>
          <p>
            Saving is great, but don't accidentally sabotage your eligibility for financial aid. The FAFSA formula treats assets differently based on who owns them.
          </p>
          <ul className="list-disc pl-6 space-y-2">
            <li><strong>Parent's Assets:</strong> Assessed at up to <strong>5.64%</strong>. (Saving $10,000 usually lowers aid by only $564).</li>
            <li><strong>Student's Assets (UTMA/UGMA):</strong> Assessed at <strong>20%</strong>. (Saving $10,000 lowers aid by $2,000).</li>
            <li><strong>Grandparent's Assets (529):</strong> Not reported on FAFSA as an asset! However, withdrawals *used* to count as untaxed income for the student, hurting aid the <em>next</em> year. <strong>New Rule Update:</strong> Thanks to FAFSA simplification, grandparent-owned 529s no longer hurt financial aid at all.</li>
          </ul>
        </article>

        <hr className="border-border" />

        {/* MISTAKES */}
        <article id="mistakes" className="prose prose-slate dark:prose-invert max-w-none">
          <h2 className="text-2xl md:text-3xl font-bold text-foreground pt-4" itemProp="articleSection">Common Planning Mistakes</h2>
          <ul className="list-disc ml-6 space-y-3">
            <li><strong>Starting Late:</strong> Just like retirement, compound interest needs time. Starting at birth vs. age 10 cuts your required monthly contribution nearly in half.</li>
            <li><strong>Underestimating Expenses:</strong> Forgetting travel, laptops, books, Greek life, and lifestyle costs. Tuition is often only 60% of the total bill.</li>
            <li><strong>Sacrificing Retirement:</strong> <em>"You can borrow for college, but you cannot borrow for retirement."</em> Do not prioritize your child's education over your own financial security. Put on your own oxygen mask first. If you are broke in old age, you become a burden to the very child you tried to help.</li>
          </ul>
        </article>
      </section>

      {/* FAQ Section */}
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <Info className="h-5 w-5" />
            Frequently Asked Questions
          </CardTitle>
          <CardDescription>
            Q&A on Education Savings
          </CardDescription>
        </CardHeader>
        <CardContent>
          <div className="space-y-6">
            <div>
              <h4 className="font-semibold text-lg mb-3">What happens to a 529 plan if my child gets a full scholarship?</h4>
              <p className="text-muted-foreground">
                You can withdraw the amount equal to the scholarship penalty-free (though you will pay income tax on the earnings portion). Or, you can save it for grad school or transfer it to a sibling.
              </p>
            </div>

            <div>
              <h4 className="font-semibold text-lg mb-3">Does savings hurt financial aid eligibility?</h4>
              <p className="text-muted-foreground">
                Yes, but less than income. Parental assets (like 529s) are assessed at a maximum of 5.64% in the FAFSA calculation. Student-owned assets (UTMA) are assessed at 20%. So, keeping money in a parent-owned 529 is smarter.
              </p>
            </div>

            <div>
              <h4 className="font-semibold text-lg mb-3">Can I use 529 money for K-12 private school?</h4>
              <p className="text-muted-foreground">
                Yes! The Tax Cuts and Jobs Act of 2017 allows you to use up to $10,000 per year per beneficiary for K-12 tuition.
              </p>
            </div>

            <div>
              <h4 className="font-semibold text-lg mb-3">Is it better to pay off my mortgage or save for college?</h4>
              <p className="text-muted-foreground">
                Mathematically, if your investment returns (&gt;7%) exceed your mortgage rate (&lt;4%), saving wins. However, don't sacrifice retirement savings for either.
              </p>
            </div>

            <div>
              <h4 className="font-semibold text-lg mb-3">What if I have multiple children?</h4>
              <p className="text-muted-foreground">
                Open separate accounts for each to track goals clearly. However, you can change beneficiaries. If the oldest doesn't use all their funds, you can roll it over to the younger sibling tax-free.
              </p>
            </div>

            <div>
              <h4 className="font-semibold text-lg mb-3">How much debt is "too much" for a student?</h4>
              <p className="text-muted-foreground">
                A general rule of thumb: Total student loans should not exceed the expected first-year salary of the graduate. If they expect to make $50k, don't borrow $100k.
              </p>
            </div>

            <div>
              <h4 className="font-semibold text-lg mb-3">Are prepaid tuition plans worth it?</h4>
              <p className="text-muted-foreground">
                They lock in today's tuition rates, protecting you from inflation. However, they are rigid—usually restricted to specific in-state schools. If your child wants to go out of state, you might get a lower value back.
              </p>
            </div>

            <div>
              <h4 className="font-semibold text-lg mb-3">When should I stop contributing?</h4>
              <p className="text-muted-foreground">
                Once the fund (projected at conservative growth) covers the estimated remaining cost. Oversaving is less of a problem due to new rules allowing unused 529 funds (up to $35k) to be rolled into a Roth IRA for the child (under specific conditions).
              </p>
            </div>

            <div>
              <h4 className="font-semibold text-lg mb-3">What is the "Grandparent Loophole" in FAFSA?</h4>
              <p className="text-muted-foreground">
                Previously, grandparent-owned 529 withdrawals counted as student income, hurting aid. New FAFSA rules (effective 2024-25) no longer count this distribution as income, making grandparent-owned 529s a powerful tool.
              </p>
            </div>

            <div>
              <h4 className="font-semibold text-lg mb-3">Should I use a robo-advisor?</h4>
              <p className="text-muted-foreground">
                Robo-advisors are excellent for education goals because they automatically handle the "glide path"—shifting from aggressive to conservative investments as the start date approaches.
              </p>
            </div>
          </div>
        </CardContent>
      </Card>

      {/* Usage of this Calculator */}
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
          {/* Who should use */}
          <div>
            <h4 className="flex items-center gap-2 font-semibold text-lg mb-3">
              <Users className="h-5 w-5 text-blue-600" />
              Who Should Use This Calculator?
            </h4>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div className="p-3 bg-muted/50 rounded-lg border border-border/50">
                <strong className="block text-primary mb-1">New Parents</strong>
                <span className="text-sm text-muted-foreground">To start planning early when the "Time Factor" is most potent. Small contributions flow a long way.</span>
              </div>
              <div className="p-3 bg-muted/50 rounded-lg border border-border/50">
                <strong className="block text-primary mb-1">Grandparents</strong>
                <span className="text-sm text-muted-foreground">Planning to leave a legacy or fund a 529 plan without affecting the student's financial aid (thanks to new FAFSA rules).</span>
              </div>
              <div className="p-3 bg-muted/50 rounded-lg border border-border/50">
                <strong className="block text-primary mb-1">High School Parents</strong>
                <span className="text-sm text-muted-foreground">To see the immediate gap and deciding on loan strategies vs. "pay-as-you-go" from income.</span>
              </div>
              <div className="p-3 bg-muted/50 rounded-lg border border-border/50">
                <strong className="block text-primary mb-1">Expats / International</strong>
                <span className="text-sm text-muted-foreground">Planning for children to attend US/UK universities where costs are significantly higher than domestic options.</span>
              </div>
            </div>
          </div>

          <hr className="border-border/50" />

          {/* When it might be inaccurate */}
          <div>
            <h4 className="flex items-center gap-2 font-semibold text-lg mb-3">
              <AlertTriangle className="h-5 w-5 text-amber-600" />
              Limitations & Nuances
            </h4>
            <ul className="space-y-2 text-sm text-muted-foreground">
              <li className="flex gap-2">
                <CheckCircle2 className="h-4 w-4 text-amber-500 shrink-0 mt-0.5" />
                <span><strong>Merit Aid Unknowns:</strong> The calculator assumes "Sticker Price." Many private colleges discount heavily. Your net price might be 40-50% lower if your child qualifies for merit aid.</span>
              </li>
              <li className="flex gap-2">
                <CheckCircle2 className="h-4 w-4 text-amber-500 shrink-0 mt-0.5" />
                <span><strong>Variable Inflation:</strong> Education inflation is not constant. It might slow down due to political pressure or online alternatives, or speed up due to admin costs.</span>
              </li>
              <li className="flex gap-2">
                <CheckCircle2 className="h-4 w-4 text-amber-500 shrink-0 mt-0.5" />
                <span><strong>Investment Glide Path:</strong> The calculator assumes a static return rate. A real strategy moves from Stocks (Age 5, 10% return) to Bonds (Age 17, 4% return). You should use a conservative average.</span>
              </li>
            </ul>
          </div>

          <hr className="border-border/50" />

          {/* Real World Examples */}
          <div>
            <h4 className="flex items-center gap-2 font-semibold text-lg mb-3">
              <Landmark className="h-5 w-5 text-green-600" />
              Historical Context
            </h4>
            <div className="space-y-3">
              <div className="p-4 rounded-lg bg-green-50 dark:bg-green-900/10 border border-green-100 dark:border-green-900/20">
                <h5 className="font-semibold text-green-800 dark:text-green-300 mb-1">The 529 Advantage</h5>
                <p className="text-sm text-green-700/80 dark:text-green-400">
                  A family starting a 529 plan at birth with $200/month (at 7%) would have ~$80,000 by age 18. The same money in a bank account (at 1%) would be only ~$45,000.
                </p>
              </div>
              <div className="p-4 rounded-lg bg-blue-50 dark:bg-blue-900/10 border border-blue-100 dark:border-blue-900/20">
                <h5 className="font-semibold text-blue-800 dark:text-blue-300 mb-1">The Community College Route</h5>
                <p className="text-sm text-blue-700/80 dark:text-blue-400">
                  Calculating for 2 years Community College + 2 years University often cuts the required corpus by 40%, making an "Impossible" goal suddenly "Achievable."
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
          <p>The Child Education Fund Calculator is a strategic planning tool for one of life's largest expenses.</p>
          <p>By accounting for the specific "hyper-inflation" of the education sector, it provides a realistic, albeit sobering, target for parents.</p>
          <p>Use it to determine the monthly savings rate needed to turn your child's academic dreams into a debt-free reality.</p>
        </CardContent>
      </Card>
    </div>
  );
}

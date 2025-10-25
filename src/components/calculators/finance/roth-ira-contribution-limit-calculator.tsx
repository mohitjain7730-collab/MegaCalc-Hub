'use client';

import { useState } from 'react';
import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import { z } from 'zod';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Form, FormControl, FormField, FormItem, FormLabel, FormMessage } from '@/components/ui/form';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { PiggyBank, Calculator, DollarSign, TrendingUp, Info, AlertCircle, Target, Calendar, Users, Building } from 'lucide-react';
import { Badge } from '@/components/ui/badge';
import { Alert, AlertDescription } from '@/components/ui/alert';

const formSchema = z.object({
  age: z.number().min(0).max(120).optional(),
  filingStatus: z.enum(['single', 'married-joint', 'married-separate', 'head-of-household']).optional(),
  modifiedAGI: z.number().min(0).optional(),
  currentYear: z.number().min(2020).max(2030).optional(),
  existingContributions: z.number().min(0).optional(),
});

type FormValues = z.infer<typeof formSchema>;

export default function RothIRAContributionLimitCalculator() {
  const [result, setResult] = useState<{ 
    maxContribution: number;
    reducedContribution: number;
    phaseoutRange: string;
    eligibilityStatus: string;
    interpretation: string;
    recommendations: string[];
    warningSigns: string[];
    contributionBreakdown: { category: string; amount: number; description: string }[];
  } | null>(null);

  const form = useForm<FormValues>({ 
    resolver: zodResolver(formSchema), 
    defaultValues: { 
      age: undefined, 
      filingStatus: undefined, 
      modifiedAGI: undefined, 
      currentYear: undefined,
      existingContributions: undefined
    } 
  });

  const getContributionLimits = (year: number) => {
    // 2024 limits
    const limits = {
      2024: { standard: 7000, catchup: 1000 },
      2023: { standard: 6500, catchup: 1000 },
      2022: { standard: 6000, catchup: 1000 },
      2021: { standard: 6000, catchup: 1000 },
      2020: { standard: 6000, catchup: 1000 }
    };
    return limits[year as keyof typeof limits] || limits[2024];
  };

  const getPhaseoutLimits = (filingStatus: string, year: number) => {
    // 2024 phaseout limits
    const phaseouts = {
      2024: {
        single: { start: 138000, end: 153000 },
        'married-joint': { start: 218000, end: 228000 },
        'married-separate': { start: 0, end: 10000 },
        'head-of-household': { start: 138000, end: 153000 }
      },
      2023: {
        single: { start: 138000, end: 153000 },
        'married-joint': { start: 218000, end: 228000 },
        'married-separate': { start: 0, end: 10000 },
        'head-of-household': { start: 138000, end: 153000 }
      }
    };
    return phaseouts[year as keyof typeof phaseouts] || phaseouts[2024];
  };

  const calculateContribution = (v: FormValues) => {
    if (v.age == null || v.filingStatus == null || v.modifiedAGI == null || v.currentYear == null) return null;
    
    const limits = getContributionLimits(v.currentYear);
    const phaseouts = getPhaseoutLimits(v.filingStatus, v.currentYear);
    const phaseout = phaseouts[v.filingStatus as keyof typeof phaseouts];
    
    let maxContribution = limits.standard;
    if (v.age >= 50) {
      maxContribution += limits.catchup;
    }
    
    let reducedContribution = maxContribution;
    let eligibilityStatus = 'Eligible for full contribution';
    
    if (v.modifiedAGI >= phaseout.start && v.modifiedAGI <= phaseout.end) {
      // Calculate reduced contribution
      const phaseoutRange = phaseout.end - phaseout.start;
      const excessIncome = v.modifiedAGI - phaseout.start;
      const reductionRatio = excessIncome / phaseoutRange;
      reducedContribution = Math.max(0, maxContribution * (1 - reductionRatio));
      eligibilityStatus = 'Eligible for reduced contribution';
    } else if (v.modifiedAGI > phaseout.end) {
      reducedContribution = 0;
      eligibilityStatus = 'Not eligible for Roth IRA contributions';
    }
    
    const remainingContribution = Math.max(0, reducedContribution - (v.existingContributions || 0));
    
    return {
      maxContribution,
      reducedContribution,
      remainingContribution,
      eligibilityStatus,
      phaseoutRange: `$${phaseout.start.toLocaleString()} - $${phaseout.end.toLocaleString()}`
    };
  };

  const interpret = (eligibilityStatus: string, remainingContribution: number, age: number) => {
    if (eligibilityStatus === 'Not eligible for Roth IRA contributions') {
      return 'Your income exceeds the Roth IRA phaseout limits. Consider traditional IRA or backdoor Roth IRA strategies.';
    }
    if (eligibilityStatus === 'Eligible for reduced contribution') {
      return 'Your income is in the phaseout range. You can make a reduced contribution, or consider income reduction strategies.';
    }
    if (remainingContribution === 0) {
      return 'You have already contributed the maximum allowed amount for this year.';
    }
    if (age < 50 && remainingContribution < 7000) {
      return 'You can make additional contributions to reach the annual limit.';
    }
    return 'You are eligible for full Roth IRA contributions. Consider maximizing your contribution for tax-free growth.';
  };

  const getRecommendations = (eligibilityStatus: string, age: number, modifiedAGI: number) => {
    const recommendations = [];
    
    if (eligibilityStatus === 'Not eligible for Roth IRA contributions') {
      recommendations.push('Consider traditional IRA contributions for tax deduction');
      recommendations.push('Explore backdoor Roth IRA conversion strategies');
      recommendations.push('Maximize 401(k) and other employer-sponsored plans');
      recommendations.push('Consider taxable investment accounts for additional savings');
    } else if (eligibilityStatus === 'Eligible for reduced contribution') {
      recommendations.push('Consider reducing MAGI through deductions or deferrals');
      recommendations.push('Maximize pre-tax retirement contributions to lower MAGI');
      recommendations.push('Consider traditional IRA contributions instead');
      recommendations.push('Plan for future years when income might be lower');
    } else {
      recommendations.push('Maximize your Roth IRA contribution for the year');
      recommendations.push('Set up automatic contributions to ensure consistency');
      recommendations.push('Consider increasing contributions if you have extra income');
      recommendations.push('Review your investment allocation within the Roth IRA');
    }
    
    if (age >= 50) {
      recommendations.push('Take advantage of catch-up contributions');
      recommendations.push('Consider Roth IRA conversion strategies');
    }
    
    recommendations.push('Review your overall retirement savings strategy');
    recommendations.push('Consider tax diversification in retirement planning');
    
    return recommendations;
  };

  const getWarningSigns = (eligibilityStatus: string, existingContributions: number, maxContribution: number) => {
    const signs = [];
    
    if (eligibilityStatus === 'Not eligible for Roth IRA contributions') {
      signs.push('Income exceeds Roth IRA phaseout limits');
      signs.push('Contributing when ineligible can result in penalties');
      signs.push('Need alternative retirement savings strategies');
    }
    
    if (existingContributions > maxContribution) {
      signs.push('Excess contributions subject to 6% penalty annually');
      signs.push('Need to withdraw excess contributions before tax deadline');
    }
    
    signs.push('Missing contribution deadline (April 15th)');
    signs.push('Not considering employer match in 401(k) first');
    signs.push('Ignoring traditional IRA as alternative');
    
    return signs;
  };

  const getContributionBreakdown = (maxContribution: number, age: number, reducedContribution: number) => {
    const breakdown = [];
    const limits = getContributionLimits(2024);
    
    breakdown.push({
      category: 'Standard Contribution',
      amount: limits.standard,
      description: 'Base annual contribution limit'
    });
    
    if (age >= 50) {
      breakdown.push({
        category: 'Catch-up Contribution',
        amount: limits.catchup,
        description: 'Additional contribution for age 50+'
      });
    }
    
    if (reducedContribution < maxContribution) {
      breakdown.push({
        category: 'Reduced Contribution',
        amount: reducedContribution,
        description: 'Reduced due to income phaseout'
      });
    }
    
    return breakdown;
  };

  const onSubmit = (values: FormValues) => {
    const calculation = calculateContribution(values);
    if (!calculation) { setResult(null); return; }
    
    setResult({ 
      maxContribution: calculation.maxContribution,
      reducedContribution: calculation.reducedContribution,
      phaseoutRange: calculation.phaseoutRange,
      eligibilityStatus: calculation.eligibilityStatus,
      interpretation: interpret(calculation.eligibilityStatus, calculation.remainingContribution, values.age!),
      recommendations: getRecommendations(calculation.eligibilityStatus, values.age!, values.modifiedAGI!),
      warningSigns: getWarningSigns(calculation.eligibilityStatus, values.existingContributions || 0, calculation.maxContribution),
      contributionBreakdown: getContributionBreakdown(calculation.maxContribution, values.age!, calculation.reducedContribution)
    });
  };

  return (
    <div className="space-y-8">

      {/* Input Form */}
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <PiggyBank className="h-5 w-5" />
            Roth IRA Contribution Information
          </CardTitle>
          <CardDescription>
            Calculate your Roth IRA contribution limits and eligibility
          </CardDescription>
        </CardHeader>
        <CardContent>
      <Form {...form}>
        <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-6">
              <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                <FormField 
                  control={form.control} 
                  name="age" 
                  render={({ field }) => (
              <FormItem>
                      <FormLabel className="flex items-center gap-2">
                        <Calendar className="h-4 w-4" />
                        Your Age
                      </FormLabel>
                <FormControl>
                        <Input 
                          type="number" 
                          step="1" 
                          placeholder="e.g., 35" 
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
                  name="filingStatus" 
                  render={({ field }) => (
              <FormItem>
                      <FormLabel className="flex items-center gap-2">
                        <Users className="h-4 w-4" />
                        Filing Status
                      </FormLabel>
                <FormControl>
                        <select 
                          className="border rounded h-10 px-3 w-full bg-background" 
                          value={field.value ?? ''} 
                          onChange={(e) => field.onChange(e.target.value as any)}
                        >
                          <option value="">Select filing status</option>
                          <option value="single">Single</option>
                          <option value="married-joint">Married Filing Jointly</option>
                          <option value="married-separate">Married Filing Separately</option>
                          <option value="head-of-household">Head of Household</option>
                  </select>
                </FormControl>
                <FormMessage />
              </FormItem>
                  )} 
                />
                <FormField 
                  control={form.control} 
                  name="modifiedAGI" 
                  render={({ field }) => (
              <FormItem>
                      <FormLabel className="flex items-center gap-2">
                        <DollarSign className="h-4 w-4" />
                        Modified Adjusted Gross Income (MAGI)
                      </FormLabel>
                <FormControl>
                        <Input 
                          type="number" 
                          step="0.01" 
                          placeholder="e.g., 120000" 
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
                  name="currentYear" 
                  render={({ field }) => (
              <FormItem>
                      <FormLabel className="flex items-center gap-2">
                        <Calendar className="h-4 w-4" />
                        Tax Year
                      </FormLabel>
                <FormControl>
                        <Input 
                          type="number" 
                          step="1" 
                          placeholder="e.g., 2024" 
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
                  name="existingContributions" 
                  render={({ field }) => (
              <FormItem>
                      <FormLabel className="flex items-center gap-2">
                        <Building className="h-4 w-4" />
                        Existing Contributions This Year
                      </FormLabel>
                <FormControl>
                        <Input 
                          type="number" 
                          step="0.01" 
                          placeholder="e.g., 2000" 
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
              <Button type="submit" className="w-full md:w-auto">
                Calculate Contribution Limits
              </Button>
        </form>
      </Form>
        </CardContent>
      </Card>

      {result && (
        <div className="space-y-6">
          {/* Main Results Card */}
          <Card>
            <CardHeader>
              <div className="flex items-center gap-4">
                <PiggyBank className="h-8 w-8 text-primary" />
                <div>
                  <CardTitle>Your Roth IRA Contribution Analysis</CardTitle>
                  <CardDescription>Contribution limits and eligibility assessment</CardDescription>
                </div>
              </div>
            </CardHeader>
            <CardContent>
              <div className="grid grid-cols-1 md:grid-cols-3 gap-6 mb-8">
                <div className="text-center p-6 bg-primary/5 rounded-lg">
                  <div className="flex items-center justify-center gap-2 mb-2">
                    <DollarSign className="h-5 w-5 text-primary" />
                    <span className="text-sm font-medium text-muted-foreground">Maximum Contribution</span>
                  </div>
                  <p className="text-3xl font-bold text-primary">
                    ${result.maxContribution.toLocaleString()}
                  </p>
                  <p className="text-sm text-muted-foreground mt-1">
                    Annual limit
                  </p>
                </div>
                
                <div className="text-center p-6 bg-green-50 dark:bg-green-950/20 rounded-lg">
                  <div className="flex items-center justify-center gap-2 mb-2">
                    <TrendingUp className="h-5 w-5 text-green-600" />
                    <span className="text-sm font-medium text-muted-foreground">Your Contribution</span>
                  </div>
                  <p className="text-3xl font-bold text-green-600">
                    ${result.reducedContribution.toLocaleString()}
                  </p>
                  <p className="text-sm text-muted-foreground mt-1">
                    Based on your income
                  </p>
                </div>
                
                <div className="text-center p-6 bg-blue-50 dark:bg-blue-950/20 rounded-lg">
                  <div className="flex items-center justify-center gap-2 mb-2">
                    <Target className="h-5 w-5 text-blue-600" />
                    <span className="text-sm font-medium text-muted-foreground">Eligibility Status</span>
                  </div>
                  <p className="text-lg font-bold text-blue-600">
                    <Badge variant={result.eligibilityStatus === 'Not eligible for Roth IRA contributions' ? 'destructive' : result.eligibilityStatus === 'Eligible for reduced contribution' ? 'default' : 'secondary'}>
                      {result.eligibilityStatus}
                    </Badge>
                  </p>
                  <p className="text-sm text-muted-foreground mt-1">
                    {result.phaseoutRange}
                  </p>
                </div>
              </div>

              <Alert className="mb-6">
                <Info className="h-4 w-4" />
                <AlertDescription>
                  {result.interpretation}
                </AlertDescription>
              </Alert>

              {/* Contribution Breakdown */}
              <Card className="mb-6">
                <CardHeader>
                  <CardTitle className="flex items-center gap-2 text-lg">
                    <Calculator className="h-5 w-5" />
                    Contribution Breakdown
                  </CardTitle>
                </CardHeader>
                <CardContent>
                  <div className="space-y-3">
                    {result.contributionBreakdown.map((item, index) => (
                      <div key={index} className="flex justify-between items-center p-3 border rounded-lg">
                        <div>
                          <div className="font-semibold">{item.category}</div>
                          <div className="text-sm text-muted-foreground">{item.description}</div>
                        </div>
                        <div className="text-right">
                          <div className="font-bold">${item.amount.toLocaleString()}</div>
                        </div>
                      </div>
                    ))}
                  </div>
                </CardContent>
              </Card>

              {/* Detailed Recommendations */}
              <div className="space-y-6">
                <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                  <Card>
                    <CardHeader>
                      <CardTitle className="flex items-center gap-2 text-lg">
                        <Target className="h-5 w-5" />
                        Contribution Recommendations
                      </CardTitle>
                    </CardHeader>
                    <CardContent>
                      <ul className="space-y-2">
                        {result.recommendations.map((rec, index) => (
                          <li key={index} className="flex items-start gap-2">
                            <div className="w-2 h-2 bg-primary rounded-full mt-2 flex-shrink-0" />
                            <span className="text-sm">{rec}</span>
                          </li>
                        ))}
                      </ul>
                    </CardContent>
                  </Card>

                  <Card>
                    <CardHeader>
                      <CardTitle className="flex items-center gap-2 text-lg">
                        <AlertCircle className="h-5 w-5" />
                        Warning Signs to Watch
                      </CardTitle>
                    </CardHeader>
                    <CardContent>
                      <ul className="space-y-2">
                        {result.warningSigns.map((sign, index) => (
                          <li key={index} className="flex items-start gap-2">
                            <div className="w-2 h-2 bg-destructive rounded-full mt-2 flex-shrink-0" />
                            <span className="text-sm">{sign}</span>
                          </li>
                        ))}
                      </ul>
                    </CardContent>
                  </Card>
                </div>
              </div>
            </CardContent>
          </Card>
        </div>
      )}

      {/* Educational Content */}
      <div className="space-y-6">
        {/* Explain the Inputs Section */}
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <Info className="h-5 w-5" />
              Understanding Roth IRA Contributions
            </CardTitle>
          </CardHeader>
          <CardContent className="space-y-4">
            <div>
              <h4 className="font-semibold text-foreground mb-2">What is a Roth IRA?</h4>
              <p className="text-muted-foreground">
                A Roth IRA is a retirement account where you contribute after-tax dollars, and qualified withdrawals in retirement are tax-free. Unlike traditional IRAs, you don't get a tax deduction for contributions, but you benefit from tax-free growth.
              </p>
            </div>
            <div>
              <h4 className="font-semibold text-foreground mb-2">Income Phaseout Limits</h4>
              <p className="text-muted-foreground">
                Roth IRA contributions are subject to income limits. If your modified adjusted gross income (MAGI) exceeds certain thresholds, your contribution limit is reduced or eliminated entirely, depending on your filing status.
              </p>
            </div>
            <div>
              <h4 className="font-semibold text-foreground mb-2">Catch-up Contributions</h4>
              <p className="text-muted-foreground">
                Individuals age 50 and older can make additional "catch-up" contributions beyond the standard limit. This allows older savers to accelerate their retirement savings as they approach retirement age.
              </p>
            </div>
          </CardContent>
        </Card>

        {/* Related Calculators Section */}
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <PiggyBank className="h-5 w-5" />
              Related Calculators
            </CardTitle>
            <CardDescription>
              Explore other retirement and investment planning tools
            </CardDescription>
          </CardHeader>
          <CardContent>
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
              <div className="p-4 border rounded-lg hover:bg-muted/50 transition-colors">
                <h4 className="font-semibold mb-2">
                  <a href="/category/finance/401k-contribution-calculator" className="text-primary hover:underline">
                    401k Contribution Calculator
                  </a>
                </h4>
                <p className="text-sm text-muted-foreground">
                  Plan your 401k contributions and growth
                </p>
              </div>
              <div className="p-4 border rounded-lg hover:bg-muted/50 transition-colors">
                <h4 className="font-semibold mb-2">
                  <a href="/category/finance/retirement-savings-calculator" className="text-primary hover:underline">
                    Retirement Savings Calculator
                  </a>
                </h4>
                <p className="text-sm text-muted-foreground">
                  Plan your retirement with comprehensive projections
                </p>
              </div>
              <div className="p-4 border rounded-lg hover:bg-muted/50 transition-colors">
                <h4 className="font-semibold mb-2">
                  <a href="/category/finance/compound-interest-calculator" className="text-primary hover:underline">
                    Compound Interest Calculator
                  </a>
                </h4>
                <p className="text-sm text-muted-foreground">
                  Calculate compound interest growth over time
                </p>
              </div>
              <div className="p-4 border rounded-lg hover:bg-muted/50 transition-colors">
                <h4 className="font-semibold mb-2">
                  <a href="/category/finance/sip-calculator" className="text-primary hover:underline">
                    SIP/DCA Calculator
                  </a>
                </h4>
                <p className="text-sm text-muted-foreground">
                  Calculate systematic investment returns
                </p>
              </div>
            </div>
          </CardContent>
        </Card>

        {/* Guide Section */}
        <section className="space-y-6 text-muted-foreground leading-relaxed bg-white p-6 md:p-10 rounded-lg shadow-lg" itemScope itemType="https://schema.org/InvestmentFund">
    {/* SEO & SCHEMA METADATA (HIGHLY OPTIMIZED) */}
    <meta itemProp="name" content="The Definitive Guide to Roth IRA Contribution Limits, Income Phaseouts, and Tax Strategy" />
    <meta itemProp="description" content="An expert guide detailing the Roth IRA's unique tax structure, annual contribution limits (IRS), Modified Adjusted Gross Income (MAGI) phase-out ranges, and the benefits of tax-free growth in retirement planning." />
    <meta itemProp="keywords" content="Roth IRA contribution limits, MAGI phase-out limits, Roth vs Traditional IRA, tax-free retirement growth, backdoor Roth strategy, catch-up contributions IRA, retirement tax planning" />
    <meta itemProp="author" content="[Your Site's Financial Analyst Team]" />
    <meta itemProp="datePublished" content="2025-10-25" /> 
    <meta itemProp="url" content="/definitive-roth-ira-guide" />

    <h1 className="text-3xl md:text-4xl font-extrabold text-foreground mb-4" itemProp="headline">The Definitive Guide to Roth IRA Contribution Limits: Mastering Tax-Free Retirement Growth</h1>
    <p className="text-lg italic text-gray-700">Understand the critical income phase-outs, annual limits, and the unique benefits of saving for retirement entirely tax-free.</p>

    {/* TABLE OF CONTENTS (INTERNAL LINKS FOR UX AND SEO) */}
    <h2 className="text-2xl font-bold text-foreground mt-8 mb-4">Table of Contents: Jump to a Section</h2>
    <ul className="list-disc ml-6 space-y-2 text-blue-600">
        <li><a href="#mechanics" className="hover:underline">Roth IRA Mechanics and Tax Structure</a></li>
        <li><a href="#limits" className="hover:underline">Annual IRS Contribution Limits and Catch-Up Rules</a></li>
        <li><a href="#magi" className="hover:underline">The Modified Adjusted Gross Income (MAGI) Phase-Out</a></li>
        <li><a href="#roth-vs-trad" className="hover:underline">Roth vs. Traditional IRA: The Tax Trade-Off</a></li>
        <li><a href="#backdoor" className="hover:underline">Advanced Strategy: The Backdoor Roth IRA</a></li>
    </ul>
<hr />

    {/* ROTH IRA MECHANICS AND TAX STRUCTURE */}
    <h2 id="mechanics" className="text-2xl font-bold text-foreground pt-8" itemProp="articleSection">Roth IRA Mechanics and Tax Structure</h2>
    <p>A <strong className="font-semibold">Roth IRA</strong> is an individual retirement arrangement (IRA) created by the Taxpayer Relief Act of 1997. It is defined by its unique "pay taxes now, save taxes later" approach, making it one of the most powerful tools for long-term tax-free wealth accumulation.</p>

    <h3 className="text-xl font-semibold text-foreground mt-6">The "Tax-Free Forever" Advantage</h3>
    <p>The Roth IRA structure works as follows:</p>
    <ul className="list-disc ml-6 space-y-2">
        <li><strong className="font-semibold">Contributions:</strong> Are made with after-tax dollars, meaning the contributor receives no upfront tax deduction.</li>
        <li><strong className="font-semibold">Growth:</strong> All investment earnings and interest grow entirely tax-free within the account.</li>
        <li><strong className="font-semibold">Withdrawals:</strong> Qualified withdrawals of contributions and earnings in retirement are <strong className="font-semibold">100% tax-free</strong>. This guarantees the tax rate on the entire retirement income stream is 0%.</li>
    </ul>
    <p>This tax structure is especially beneficial for young professionals who anticipate being in a significantly higher tax bracket when they retire than they are currently.</p>

<hr />

    {/* ANNUAL IRS CONTRIBUTION LIMITS AND CATCH-UP RULES */}
    <h2 id="limits" className="text-2xl font-bold text-foreground pt-8" itemProp="articleSection">Annual IRS Contribution Limits and Catch-Up Rules</h2>
    <p>The Internal Revenue Service (IRS) imposes an annual ceiling on the total amount an individual can contribute to all their Traditional and Roth IRA accounts combined. These limits are adjusted periodically for inflation.</p>

    <h3 className="text-xl font-semibold text-foreground mt-6">The Base Contribution Limit</h3>
    <p>The standard annual limit applies to individuals under the age of 50. It dictates the maximum total amount that can be contributed for the tax year. This limit is subject to one major caveat: the contribution cannot exceed the individual's <strong className="font-semibold">taxable compensation</strong> for the year.</p>

    <h3 className="text-xl font-semibold text-foreground mt-6">Catch-Up Contributions (Age 50+)</h3>
    <p>Similar to 401(k) plans, the IRS allows individuals age 50 and older to make an additional <strong className="font-semibold">Catch-Up Contribution</strong>. This higher limit is designed to help those approaching retirement maximize their tax-advantaged savings and provides a powerful boost to compound growth in the final years before retirement.</p>
    <p>It is vital to monitor these limits annually, as exceeding the cap results in an excess contribution penalty of 6% per year on the over-contributed amount until it is corrected.</p>

<hr />

    {/* THE MODIFIED ADJUSTED GROSS INCOME (MAGI) PHASE-OUT */}
    <h2 id="magi" className="text-2xl font-bold text-foreground pt-8" itemProp="articleSection">The Modified Adjusted Gross Income (MAGI) Phase-Out</h2>
    <p>The Roth IRA is unique among retirement accounts because eligibility to contribute is strictly limited based on the individual's income. This restriction is controlled by the <strong className="font-semibold">Modified Adjusted Gross Income (MAGI)</strong>.</p>

    <h3 className="text-xl font-semibold text-foreground mt-6">MAGI and the Phase-Out Range</h3>
    <p>Unlike standard gross income, MAGI is calculated by taking your Adjusted Gross Income (AGI) and adding back certain deductions (like foreign earned income exclusions, and, crucially, deductions for Traditional IRA contributions). The IRS sets specific MAGI thresholds based on filing status (Single, Married Filing Jointly):</p>
    <ul className="list-disc ml-6 space-y-2">
        <li><strong className="font-semibold">Full Contribution:</strong> If MAGI is below the bottom of the phase-out range, the full limit is allowed.</li>
        <li><strong className="font-semibold">Partial Contribution:</strong> If MAGI falls within the phase-out range, the allowed contribution limit is gradually reduced on a proportional basis.</li>
        <li><strong className="font-semibold">Zero Contribution:</strong> If MAGI is above the top of the phase-out range, the individual is ineligible to make any direct Roth IRA contribution.</li>
    </ul>

    <h3 className="text-xl font-semibold text-foreground mt-6">Calculating the Reduced Contribution Limit</h3>
    <p>The maximum allowed contribution for those in the phase-out range is determined by a complex linear calculation based on where the individual's MAGI falls within the range defined by the IRS. The reduction ensures that high-income earners benefit from tax-free growth only up to the legislated threshold.</p>

<hr />

    {/* ROTH VS. TRADITIONAL IRA: THE TAX TRADE-OFF */}
    <h2 id="roth-vs-trad" className="text-2xl font-bold text-foreground pt-8" itemProp="articleSection">Roth vs. Traditional IRA: The Tax Trade-Off</h2>
    <p>The decision between funding a Roth IRA (after-tax contribution, tax-free growth) and a Traditional IRA (pretax contribution, tax-deferred growth) revolves entirely around the individual's current tax rate versus their expected future tax rate.</p>

    <h3 className="text-xl font-semibold text-foreground mt-6">Traditional IRA Advantages</h3>
    <ul className="list-disc ml-6 space-y-2">
        <li><strong className="font-semibold">Immediate Tax Savings:</strong> Contributions are often tax-deductible in the present year, reducing current taxable income.</li>
        <li><strong className="font-semibold">Best for:</strong> High earners who expect their income (and marginal tax rate) to be lower in retirement than it is currently.</li>
    </ul>

    <h3 className="text-xl font-semibold text-foreground mt-6">Roth IRA Advantages</h3>
    <ul className="list-disc ml-6 space-y-2">
        <li><strong className="font-semibold">Tax-Free Income Stream:</strong> All qualified withdrawals are tax-free, protecting the retiree from unexpected future tax hikes.</li>
        <li><strong className="font-semibold">No Required Minimum Distributions (RMDs):</strong> Roth IRA owners are not required to take RMDs during their lifetime, allowing wealth to compound tax-free for a longer period.</li>
    </ul>
    <p>For many investors, diversifying retirement holdings across both Traditional (pretax) and Roth (post-tax) accounts provides optimal tax flexibility in retirement.</p>

<hr />

    {/* ADVANCED STRATEGY: THE BACKDOOR ROTH IRA */}
    <h2 id="backdoor" className="text-2xl font-bold text-foreground pt-8" itemProp="articleSection">Advanced Strategy: The Backdoor Roth IRA</h2>
    <p>Because the direct contribution to a Roth IRA is phased out for high-income earners, the <strong className="font-semibold">Backdoor Roth IRA</strong> strategy is commonly employed by those whose MAGI exceeds the maximum IRS threshold. This legal maneuver allows high earners to bypass the income limit and still fund a Roth account.</p>

    <h3 className="text-xl font-semibold text-foreground mt-6">The Two-Step Process</h3>
    <ol className="list-decimal ml-6 space-y-2">
        <li><strong className="font-semibold">Step 1 (Nondeductible Contribution):</strong> The individual contributes to a <strong className="font-semibold">Traditional IRA</strong> using after-tax dollars. Since their income is too high, the contribution is <strong className="font-semibold">nondeductible</strong> (no tax break).</li>
        <li><strong className="font-semibold">Step 2 (Conversion):</strong> The individual immediately converts the balance of the Traditional IRA to a Roth IRA. Since the contribution was already taxed, only any minimal earnings accrued between the contribution and the conversion (the *de minimis* amount) are taxable.</li>
    </ol>
    <p>This strategy effectively "gets money into the Roth" tax-free, provided the investor does not hold significant existing pretax Traditional IRA balances, which would trigger the complex **pro-rata rule** and create a large taxable event upon conversion.</p>

<hr />

    {/* CONCLUSION */}
    <h2 className="text-2xl font-bold text-foreground pt-8" itemProp="articleSection">Conclusion</h2>
    <p>The Roth IRA is an exceptional tool for retirement planning, offering the distinct advantage of tax-free growth and tax-free qualified withdrawals. Optimizing a Roth contribution requires careful annual calculation to ensure compliance with the strictly enforced <strong className="font-semibold">Modified Adjusted Gross Income (MAGI) phase-out limits</strong>.</p>
    <p>Whether through direct contributions or the use of the advanced Backdoor strategy, maximizing Roth funding ensures that a portion of retirement income is forever shielded from future tax liabilities, providing invaluable tax certainty and flexibility for the retirement years.</p>
</section>

        {/* FAQ Section */}
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <Info className="h-5 w-5" />
              Frequently Asked Questions
            </CardTitle>
            <CardDescription>
              Common questions about Roth IRA contributions
            </CardDescription>
          </CardHeader>
          <CardContent className="space-y-6">
            <div>
              <h4 className="font-semibold text-foreground mb-2">What happens if I contribute too much to my Roth IRA?</h4>
              <p className="text-muted-foreground">
                Excess contributions are subject to a 6% penalty for each year the excess remains in your account. You must withdraw the excess contributions and any earnings before the tax filing deadline to avoid penalties.
              </p>
            </div>

            <div>
              <h4 className="font-semibold text-foreground mb-2">Can I contribute to both a Roth IRA and traditional IRA?</h4>
              <p className="text-muted-foreground">
                Yes, you can contribute to both, but your total contributions to all IRAs (Roth and traditional combined) cannot exceed the annual limit. The limit applies to the total, not per account.
              </p>
            </div>

            <div>
              <h4 className="font-semibold text-foreground mb-2">What is a backdoor Roth IRA?</h4>
              <p className="text-muted-foreground">
                A backdoor Roth IRA is a strategy for high earners who exceed income limits. You contribute to a traditional IRA (which has no income limits for contributions) and then convert it to a Roth IRA. This allows you to effectively contribute to a Roth IRA regardless of income.
              </p>
            </div>

            <div>
              <h4 className="font-semibold text-foreground mb-2">When can I withdraw from my Roth IRA without penalties?</h4>
              <p className="text-muted-foreground">
                You can withdraw your contributions (not earnings) at any time without penalties or taxes. For earnings to be tax-free, you must be 59½ or older and the account must be at least 5 years old, or meet other qualifying conditions.
              </p>
            </div>

            <div>
              <h4 className="font-semibold text-foreground mb-2">Should I prioritize Roth IRA or 401(k) contributions?</h4>
              <p className="text-muted-foreground">
                Generally, prioritize 401(k) contributions up to the employer match first, then Roth IRA contributions, then additional 401(k) contributions. This maximizes employer matching while building tax diversification.
              </p>
            </div>
          </CardContent>
        </Card>
    </div>
    </div>
  );
}
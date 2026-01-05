'use client';

import { useState } from 'react';
import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import { z } from 'zod';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Form, FormControl, FormField, FormItem, FormLabel, FormMessage } from '@/components/ui/form';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Activity, AlertCircle, ArrowRightLeft, BookOpen, Calculator, CheckCircle2, DollarSign, HelpCircle, Info, Landmark, Percent, Scale, TrendingUp, Users, AlertTriangle, FileText, Settings2, Briefcase } from 'lucide-react';
import { Badge } from '@/components/ui/badge';
import { Alert, AlertDescription } from '@/components/ui/alert';
import { Accordion, AccordionContent, AccordionItem, AccordionTrigger } from '@/components/ui/accordion';
import Link from 'next/link';

const formSchema = z.object({
  loanAmount: z.number().positive('Loan amount must be positive'),
  initialRate: z.number().min(0).max(100, 'Rate must be between 0 and 100'),
  adjustmentCap: z.number().min(0).max(100, 'Cap must be between 0 and 100'),
  termYears: z.number().min(1).max(50, 'Term must be between 1 and 50'),
  monthsFixed: z.number().min(0).max(120, 'Fixed period months must be reasonable (e.g., 60 for 5/1 ARM)'),
});

type FormValues = z.infer<typeof formSchema>;

export default function AdjustableLoanComparisonCalculator() {
  const [result, setResult] = useState<{
    initialPayment: number;
    maxPayment: number;
    paymentIncrease: number;
    percentIncrease: number;
    totalInterestInitial: number;
    totalInterestWorstCase: number;
    riskLevel: string;
    interpretation: string;
    recommendation: string;
    insights: string[];
    riskFactors: string[];
  } | null>(null);

  const form = useForm<FormValues>({
    resolver: zodResolver(formSchema),
    defaultValues: {
      loanAmount: undefined,
      initialRate: undefined,
      adjustmentCap: undefined,
      termYears: 30,
      monthsFixed: 60,
    },
  });

  const calculateLoanPayment = (principal: number, annualRate: number, years: number) => {
    if (annualRate === 0) return principal / (years * 12);
    const r = annualRate / 100 / 12;
    const n = years * 12;
    return (principal * r * Math.pow(1 + r, n)) / (Math.pow(1 + r, n) - 1);
  };

  const calculate = (v: FormValues) => {
    const { loanAmount, initialRate, adjustmentCap, termYears, monthsFixed } = v;

    // 1. Initial Scenario
    const initialPayment = calculateLoanPayment(loanAmount, initialRate, termYears);

    // Total Interest (Pure Initial Scenario - if rate never changed, unlikely for ARM but a baseline)
    const totalPaymentsInitial = initialPayment * termYears * 12;
    const totalInterestInitial = totalPaymentsInitial - loanAmount;

    // 2. Worst Case Scenario (Rate jumps by full cap immediately after fixed period)
    // Calculate balance remaining after fixed period
    const rInitial = initialRate / 100 / 12;
    const nTotal = termYears * 12;
    const nFixed = monthsFixed;

    // Balance after fixed period
    let balanceAfterFixed = loanAmount;
    if (rInitial > 0) {
      balanceAfterFixed = (loanAmount * (Math.pow(1 + rInitial, nTotal) - Math.pow(1 + rInitial, nFixed))) / (Math.pow(1 + rInitial, nTotal) - 1);
    } else {
      balanceAfterFixed = loanAmount - (initialPayment * nFixed);
    }

    // New Payment at Max Rate
    const maxRate = initialRate + adjustmentCap;
    const remainingYears = (nTotal - nFixed) / 12;
    const maxPayment = calculateLoanPayment(balanceAfterFixed, maxRate, remainingYears);

    // Total Interest (Worst Case Mix)
    const totalFixedPayments = initialPayment * nFixed;
    const totalAdjustedPayments = maxPayment * (nTotal - nFixed);
    const totalCostWorstCase = totalFixedPayments + totalAdjustedPayments;
    const totalInterestWorstCase = totalCostWorstCase - loanAmount;

    // Analysis
    const paymentIncrease = maxPayment - initialPayment;
    const percentIncrease = (paymentIncrease / initialPayment) * 100;

    let riskLevel = 'Low';
    let interpretation = 'Your loan payment variation is minimal.';
    let recommendation = 'This ARM structure offers stability comparable to fixed-rate loans.';

    if (percentIncrease > 50) {
      riskLevel = 'Critical';
      interpretation = `Your monthly payment could skyrocket by ${percentIncrease.toFixed(1)}%, creating a severe payment shock.`;
      recommendation = 'Strongly consider a fixed-rate mortgage or a much lower loan amount to mitigate default risk.';
    } else if (percentIncrease > 25) {
      riskLevel = 'High';
      interpretation = `Expect a significant payment jump of ${percentIncrease.toFixed(1)}%. This is a major budget risk.`;
      recommendation = 'Ensure your future income can comfortably absorb this increase, or cap the adjustment lower.';
    } else if (percentIncrease > 10) {
      riskLevel = 'Moderate';
      interpretation = `Payments could rise by ${percentIncrease.toFixed(1)}%, which is noticeable but manageable with planning.`;
      recommendation = 'Maintain an emergency fund specifically for potential mortgage payment increases.';
    }

    const insights = [
      `Initial 'Teaser' Period: You enjoy ${monthsFixed / 12} years of fixed payments at $${initialPayment.toFixed(2)}.`,
      `The Maximum Rate Cap limits your interest rate to ${maxRate.toFixed(2)}%, preventing unlimited hikes.`,
      `Worst-case scenario adds $${(totalInterestWorstCase - totalInterestInitial).toFixed(0)} in total interest cost.`,
    ];

    const riskFactors = [
      `Payment Shock: A sudden $${paymentIncrease.toFixed(2)} monthly increase could strain your budget.`,
      `Negative Amortization: If payment caps are too low (not modeled here), you might owe more than you borrowed.`,
      `Property Value Risk: If home values drop, refinancing out of a high-rate ARM becomes difficult.`,
    ];

    return {
      initialPayment,
      maxPayment,
      paymentIncrease,
      percentIncrease,
      totalInterestInitial,
      totalInterestWorstCase,
      riskLevel,
      interpretation,
      recommendation,
      insights,
      riskFactors,
    };
  };

  const onSubmit = (values: FormValues) => {
    const res = calculate(values);
    setResult(res);
  };

  return (
    <div className="space-y-8">
      {/* Input Form */}
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <Settings2 className="h-5 w-5" />
            Loan Parameters
          </CardTitle>
          <CardDescription>
            Define the terms of the Adjustable Rate Mortgage (ARM) to simulate scenarios
          </CardDescription>
        </CardHeader>
        <CardContent>
          <Form {...form}>
            <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-6">
              <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                <FormField
                  control={form.control}
                  name="loanAmount"
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel className="flex items-center gap-2">
                        <DollarSign className="h-4 w-4" />
                        Loan Amount ($)
                      </FormLabel>
                      <FormControl>
                        <Input
                          type="number"
                          placeholder="e.g., 400000"
                          {...field}
                          onChange={e => field.onChange(Number(e.target.value) || undefined)}
                        />
                      </FormControl>
                      <FormMessage />
                    </FormItem>
                  )}
                />
                <FormField
                  control={form.control}
                  name="initialRate"
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel className="flex items-center gap-2">
                        <Percent className="h-4 w-4" />
                        Initial Interest Rate (%)
                      </FormLabel>
                      <FormControl>
                        <Input
                          type="number"
                          step="0.01"
                          placeholder="e.g., 4.5"
                          {...field}
                          onChange={e => field.onChange(Number(e.target.value) || undefined)}
                        />
                      </FormControl>
                      <FormMessage />
                    </FormItem>
                  )}
                />
                <FormField
                  control={form.control}
                  name="adjustmentCap"
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel className="flex items-center gap-2">
                        <TrendingUp className="h-4 w-4" />
                        Lifetime Rate Cap Increase (%)
                      </FormLabel>
                      <FormControl>
                        <Input
                          type="number"
                          step="0.1"
                          placeholder="e.g., 5.0 (Max increase over initial)"
                          {...field}
                          onChange={e => field.onChange(Number(e.target.value) || undefined)}
                        />
                      </FormControl>
                      <FormMessage />
                    </FormItem>
                  )}
                />
                <FormField
                  control={form.control}
                  name="monthsFixed"
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel className="flex items-center gap-2">
                        <Activity className="h-4 w-4" />
                        Initial Fixed Period (Months)
                      </FormLabel>
                      <FormControl>
                        <Input
                          type="number"
                          placeholder="e.g., 60 (for 5/1 ARM)"
                          {...field}
                          onChange={e => field.onChange(Number(e.target.value) || undefined)}
                        />
                      </FormControl>
                      <FormMessage />
                    </FormItem>
                  )}
                />
                <FormField
                  control={form.control}
                  name="termYears"
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel className="flex items-center gap-2">
                        <BookOpen className="h-4 w-4" />
                        Total Loan Term (Years)
                      </FormLabel>
                      <FormControl>
                        <Input
                          type="number"
                          placeholder="e.g., 30"
                          {...field}
                          onChange={e => field.onChange(Number(e.target.value) || undefined)}
                        />
                      </FormControl>
                      <FormMessage />
                    </FormItem>
                  )}
                />
              </div>
              <Button type="submit" className="w-full">
                <Calculator className="mr-2 h-4 w-4" />
                Analyze Loan Scenarios
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
                <ArrowRightLeft className="h-8 w-8 text-primary" />
                <div>
                  <CardTitle>Scenario Comparison</CardTitle>
                  <CardDescription>Initial vs. Worst-Case Payment Analysis</CardDescription>
                </div>
              </div>
            </CardHeader>
            <CardContent className="space-y-6">
              <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
                <div className="text-center p-6 bg-green-50/50 dark:bg-green-900/10 rounded-xl border border-green-100 dark:border-green-900/20">
                  <p className="text-sm font-medium text-muted-foreground uppercase tracking-wider mb-2">Initial Monthly Payment</p>
                  <p className="text-4xl font-bold text-green-700 dark:text-green-400">${result.initialPayment.toFixed(2)}</p>
                  <p className="text-xs text-muted-foreground mt-2">For the first {form.getValues('monthsFixed')} months</p>
                </div>
                <div className="text-center p-6 bg-red-50/50 dark:bg-red-900/10 rounded-xl border border-red-100 dark:border-red-900/20">
                  <p className="text-sm font-medium text-muted-foreground uppercase tracking-wider mb-2">Max Potential Payment</p>
                  <p className="text-4xl font-bold text-red-700 dark:text-red-400">${result.maxPayment.toFixed(2)}</p>
                  <p className="text-xs text-muted-foreground mt-2">Maximum possible under cap</p>
                </div>
              </div>

              <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                <div className="text-center p-4 bg-muted/50 rounded-lg">
                  <Scale className="h-6 w-6 mx-auto mb-2 text-blue-600" />
                  <p className="font-semibold">Payment Volatility</p>
                  <Badge variant={result.riskLevel === 'Low' ? 'secondary' : result.riskLevel === 'Moderate' ? 'outline' : 'destructive'}>
                    {result.riskLevel} Risk
                  </Badge>
                </div>
                <div className="text-center p-4 bg-muted/50 rounded-lg">
                  <TrendingUp className="h-6 w-6 mx-auto mb-2 text-amber-600" />
                  <p className="font-semibold">Increase Amount</p>
                  <p className="text-lg font-bold text-amber-600">+${result.paymentIncrease.toFixed(2)}</p>
                </div>
                <div className="text-center p-4 bg-muted/50 rounded-lg">
                  <Percent className="h-6 w-6 mx-auto mb-2 text-purple-600" />
                  <p className="font-semibold">Percent Jump</p>
                  <p className="text-lg font-bold text-purple-600">+{result.percentIncrease.toFixed(1)}%</p>
                </div>
              </div>

              <div className="p-4 bg-muted rounded-lg text-center">
                <p className="text-lg font-medium text-foreground">{result.interpretation}</p>
              </div>

              <Alert>
                <Info className="h-4 w-4" />
                <AlertDescription>
                  <strong>Strategic Recommendation:</strong> {result.recommendation}
                </AlertDescription>
              </Alert>
            </CardContent>
          </Card>

          {/* Smart Actions & Insights */}
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6 mb-6">
            <Card className="h-full">
              <CardHeader>
                <CardTitle className="flex items-center gap-2 text-xl text-primary">
                  <CheckCircle2 className="h-6 w-6" />
                  Strategic Insights
                </CardTitle>
                <CardDescription>Opportunities to optimize your loan structure</CardDescription>
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
                  <AlertCircle className="h-6 w-6" />
                  Risk Assessment
                </CardTitle>
                <CardDescription>Critical vulnerabilities in this loan scenario</CardDescription>
              </CardHeader>
              <CardContent className="space-y-4">
                {result.riskFactors.map((factor, index) => (
                  <div key={index} className="flex items-start gap-3 p-3 bg-red-50 dark:bg-red-900/10 rounded-lg border border-red-100 dark:border-red-900/20">
                    <AlertTriangle className="h-5 w-5 text-red-600 dark:text-red-400 mt-0.5 shrink-0" />
                    <span className="text-sm font-medium text-red-800 dark:text-red-300">{factor}</span>
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
            Understanding the Inputs
          </CardTitle>
          <CardDescription>
            Key components of an Adjustable Rate Mortgage (ARM)
          </CardDescription>
        </CardHeader>
        <CardContent>
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div className="p-4 bg-blue-50 dark:bg-blue-900/10 rounded-lg border border-blue-100 dark:border-blue-900/20">
              <h4 className="font-semibold mb-2 flex items-center gap-2 text-blue-700 dark:text-blue-300">
                <Settings2 className="h-4 w-4" />
                Loan Structure
              </h4>
              <ul className="space-y-2">
                <li className="flex items-start gap-2 text-sm text-muted-foreground">
                  <CheckCircle2 className="h-4 w-4 text-blue-500 mt-0.5 shrink-0" />
                  <span><strong>Loan Amount:</strong> The total principal you are borrowing.</span>
                </li>
                <li className="flex items-start gap-2 text-sm text-muted-foreground">
                  <CheckCircle2 className="h-4 w-4 text-blue-500 mt-0.5 shrink-0" />
                  <span><strong>Initial Rate:</strong> The "teaser" rate applied during the fixed period, usually lower than standard fixed-rate loans.</span>
                </li>
                <li className="flex items-start gap-2 text-sm text-muted-foreground">
                  <CheckCircle2 className="h-4 w-4 text-blue-500 mt-0.5 shrink-0" />
                  <span><strong>Fixed Period:</strong> The number of months the initial rate is guaranteed (e.g., 60 months for a 5/1 ARM).</span>
                </li>
              </ul>
            </div>

            <div className="p-4 bg-amber-50 dark:bg-amber-900/10 rounded-lg border border-amber-100 dark:border-amber-900/20">
              <h4 className="font-semibold mb-2 flex items-center gap-2 text-amber-700 dark:text-amber-300">
                <TrendingUp className="h-4 w-4" />
                Adjustment Factors
              </h4>
              <ul className="space-y-2">
                <li className="flex items-start gap-2 text-sm text-muted-foreground">
                  <CheckCircle2 className="h-4 w-4 text-amber-500 mt-0.5 shrink-0" />
                  <span><strong>Adjustment Cap (%):</strong> The maximum amount the interest rate can increase over the life of the loan above the initial rate.</span>
                </li>
                <li className="flex items-start gap-2 text-sm text-muted-foreground">
                  <CheckCircle2 className="h-4 w-4 text-amber-500 mt-0.5 shrink-0" />
                  <span><strong>Index & Margin:</strong> (Implicit) The variable benchmarks that drive rate changes after the fixed period ends.</span>
                </li>
                <li className="flex items-start gap-2 text-sm text-muted-foreground">
                  <CheckCircle2 className="h-4 w-4 text-amber-500 mt-0.5 shrink-0" />
                  <span><strong>Worst Case:</strong> The potential payment if the index skyrockets and hits your lifetime cap immediately.</span>
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
            <Activity className="h-5 w-5" />
            Formula Used
          </CardTitle>
        </CardHeader>
        <CardContent className="space-y-4">
          <div className="p-4 bg-muted rounded-lg overflow-x-auto">
            <p className="font-mono text-sm text-center">
              P = L[c(1 + c)^n] / [(1 + c)^n - 1]
            </p>
          </div>
          <p className="text-sm text-muted-foreground mt-2 text-center">
            Where <strong>P</strong> is monthly payment, <strong>L</strong> is loan principal, <strong>c</strong> is monthly interest rate, and <strong>n</strong> is total months.
          </p>
          <p className="text-sm text-muted-foreground">
            This calculator runs two variations of the standard amortization formula:
            1. <strong>Initial Phase:</strong> Uses the initial rate for the principal.
            2. <strong>Adjustment Phase (Worst Case):</strong> Re-amortizes the remaining balance (after the fixed period) over the remaining term at the Maximum Capped Rate.
          </p>
        </CardContent>
      </Card>

      {/* Related Calculators */}
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <Calculator className="h-5 w-5" />
            Related Financial Calculators
          </CardTitle>
          <CardDescription>
            Tools to compare simplified options and plan repayments
          </CardDescription>
        </CardHeader>
        <CardContent>
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
            <Link href="/category/finance/mortgage-payment-calculator" className="block">
              <Card className="hover:shadow-md transition-shadow cursor-pointer">
                <CardContent className="p-4">
                  <div className="flex items-center gap-3">
                    <Landmark className="h-5 w-5 text-blue-600" />
                    <div>
                      <p className="font-medium">Mortgage Payment</p>
                      <p className="text-sm text-muted-foreground">Standard Fixed Rate</p>
                    </div>
                  </div>
                </CardContent>
              </Card>
            </Link>
            <Link href="/category/finance/mortgage-refinance-savings-calculator" className="block">
              <Card className="hover:shadow-md transition-shadow cursor-pointer">
                <CardContent className="p-4">
                  <div className="flex items-center gap-3">
                    <Scale className="h-5 w-5 text-green-600" />
                    <div>
                      <p className="font-medium">Refinance Break-Even</p>
                      <p className="text-sm text-muted-foreground">Switching loan analysis</p>
                    </div>
                  </div>
                </CardContent>
              </Card>
            </Link>
            <Link href="/category/finance/loan-amortization-extra-payments-calculator" className="block">
              <Card className="hover:shadow-md transition-shadow cursor-pointer">
                <CardContent className="p-4">
                  <div className="flex items-center gap-3">
                    <DollarSign className="h-5 w-5 text-amber-600" />
                    <div>
                      <p className="font-medium">Extra Payment</p>
                      <p className="text-sm text-muted-foreground">Pay off debt faster</p>
                    </div>
                  </div>
                </CardContent>
              </Card>
            </Link>
            <Link href="/category/finance/amortization-schedule-generator" className="block">
              <Card className="hover:shadow-md transition-shadow cursor-pointer">
                <CardContent className="p-4">
                  <div className="flex items-center gap-3">
                    <FileText className="h-5 w-5 text-indigo-600" />
                    <div>
                      <p className="font-medium">Amortization Schedule</p>
                      <p className="text-sm text-muted-foreground">Detailed payment breakdown</p>
                    </div>
                  </div>
                </CardContent>
              </Card>
            </Link>
            <Link href="/category/finance/loan-to-value-ltv-ratio-calculator" className="block">
              <Card className="hover:shadow-md transition-shadow cursor-pointer">
                <CardContent className="p-4">
                  <div className="flex items-center gap-3">
                    <Percent className="h-5 w-5 text-red-600" />
                    <div>
                      <p className="font-medium">LTV Ratio</p>
                      <p className="text-sm text-muted-foreground">Equity risk assessment</p>
                    </div>
                  </div>
                </CardContent>
              </Card>
            </Link>
            <Link href="/category/finance/dscr-calculator" className="block">
              <Card className="hover:shadow-md transition-shadow cursor-pointer">
                <CardContent className="p-4">
                  <div className="flex items-center gap-3">
                    <Scale className="h-5 w-5 text-teal-600" />
                    <div>
                      <p className="font-medium">DSCR Calculator</p>
                      <p className="text-sm text-muted-foreground">Investment property analysis</p>
                    </div>
                  </div>
                </CardContent>
              </Card>
            </Link>
          </div>
        </CardContent>
      </Card>

      {/* Complete Guide Section */}
      <section className="space-y-6 text-muted-foreground leading-relaxed bg-card p-6 md:p-10 rounded-lg shadow-lg" itemScope itemType="https://schema.org/FinanceArticle">
        <meta itemProp="headline" content="Mastering Adjustable Rate Mortgages: A Complete Comparison Guide" />
        <meta itemProp="description" content="A deep dive into Adjustable Rate Mortgages (ARMs), understanding interest rate caps, calculating payment shocks, and comparing ARMs to fixed-rate loans." />
        <meta itemProp="author" content="Financial Analyst Team" />
        <meta itemProp="datePublished" content="2025-06-15" />

        <h1 className="text-3xl md:text-4xl font-extrabold text-foreground mb-4">Mastering Adjustable Rate Mortgages: The Ultimate Comparison Guide</h1>
        <p className="text-lg italic text-muted-foreground">Navigate the complexities of interest rate adjustments, caps, and index margins to make informed home financing decisions.</p>

        <h2 className="text-2xl font-bold text-foreground mt-8 mb-4">Table of Contents</h2>
        <ul className="list-disc ml-6 space-y-2 text-primary">
          <li><a href="#basics" className="hover:underline">What is an Adjustable Rate Mortgage (ARM)?</a></li>
          <li><a href="#components" className="hover:underline">Core Components: Index, Margin, and Caps</a></li>
          <li><a href="#types" className="hover:underline">Common ARM Types: 5/1, 7/1, and 10/1</a></li>
          <li><a href="#pros-cons" className="hover:underline">Pros and Cons vs. Fixed-Rate Loans</a></li>
          <li><a href="#strategy" className="hover:underline">Strategic Use of ARMs</a></li>
        </ul>
        <hr className="my-6" />

        <h2 id="basics" className="text-2xl font-bold text-foreground pt-8">What is an Adjustable Rate Mortgage (ARM)?</h2>
        <p>An **Adjustable Rate Mortgage (ARM)** is a home loan with an interest rate that can change periodically. Unlike a fixed-rate mortgage where the payment remains constant for 30 years, an ARM typically starts with a lower "teaser" rate for a set period (the fixed period) and then adjusts based on market conditions.</p>

        <h3 className="text-xl font-semibold text-foreground mt-6">The "Teaser" Appeal</h3>
        <p>The primary attraction of an ARM is the initial interest rate, which is usually significantly lower than the going rate for a 30-year fixed mortgage. This allows borrowers to qualify for larger loans or enjoy lower monthly payments during the first few years of homeownership.</p>

        <hr className="my-6" />

        <h2 id="components" className="text-2xl font-bold text-foreground pt-8">Core Components: Index, Margin, and Caps</h2>
        <p>Understanding an ARM requires learning distinct vocabulary. The rate you pay after the fixed period is determined by adding the **Index** to the **Margin**.</p>

        <div className="overflow-x-auto my-6 p-4 bg-muted border rounded-lg text-center">
          <p className="font-mono text-xl text-primary font-bold">
            Fully Indexed Rate = Index Rate + Margin
          </p>
        </div>

        <h3 className="text-xl font-semibold text-foreground mt-6">1. The Index</h3>
        <p>The index is a benchmark interest rate that fluctuates with the economy. Common indexes include the **SOFR** (Secured Overnight Financing Rate) or the **CMT** (Constant Maturity Treasury). When the index goes up, your rate goes up.</p>

        <h3 className="text-xl font-semibold text-foreground mt-6">2. The Margin</h3>
        <p>The margin is a fixed percentage point added index by your lender. It represents the lender's profit and risk premium. It does not change over the life of the loan. For example, if the Index is 3% and your Margin is 2%, your rate is 5%.</p>

        <h3 className="text-xl font-semibold text-foreground mt-6">3. Interest Rate Caps</h3>
        <p>Caps protect borrowers from extreme rate hikes. They are typically expressed in a sequence (e.g., 2/2/5):</p>
        <ul className="list-disc ml-6 space-y-2">
          <li><strong>Initial Adjustment Cap:</strong> Limit on how much the rate can change at the *first* adjustment.</li>
          <li><strong>Subsequent Adjustment Cap:</strong> Limit on how much the rate can change at *each* subsequent period.</li>
          <li><strong>Lifetime Ceilng (Cap):</strong> The absolute maximum interest rate allowed over the life of the loan.</li>
        </ul>

        <hr className="my-6" />

        <h2 id="types" className="text-2xl font-bold text-foreground pt-8">Common ARM Types: 5/1, 7/1, and 10/1</h2>
        <p>ARMs are often described by numbers representing their time periods. The most common are "Hybrid ARMs".</p>
        <ul className="list-disc ml-6 space-y-2">
          <li><strong>5/1 ARM:</strong> Rate is fixed for 5 years, then adjusts every 1 year thereafter.</li>
          <li><strong>7/1 ARM:</strong> Rate is fixed for 7 years, then adjusts every 1 year thereafter.</li>
          <li><strong>10/1 ARM:</strong> Rate is fixed for 10 years, then adjusts every 1 year thereafter.</li>
        </ul>
        <p>Generally, the shorter the fixed period, the lower the initial interest rate.</p>

        <hr className="my-6" />

        <h2 id="pros-cons" className="text-2xl font-bold text-foreground pt-8">Pros and Cons vs. Fixed-Rate Loans</h2>

        <h3 className="text-xl font-semibold text-foreground mt-6">Advantages of ARMs</h3>
        <ul className="list-disc ml-6 space-y-2">
          <li><strong>Lower Initial Payments:</strong> Great for cash flow in the early years.</li>
          <li><strong>Short-Term Ownership:</strong> If you plan to sell the house before the fixed period ends, you save money without ever facing a rate hike.</li>
          <li><strong>Falling Rate Environment:</strong> If rates drop, your payment could decrease without needing to refinance.</li>
        </ul>

        <h3 className="text-xl font-semibold text-foreground mt-6">Risks of ARMs</h3>
        <ul className="list-disc ml-6 space-y-2">
          <li><strong>Payment Shock:</strong> Rates can jump significantly, causing payments to increase by hundreds of dollars overnight.</li>
          <li><strong>Complexity:</strong> Harder to budget for long-term expenses due to uncertainty.</li>
          <li><strong>Negative Amortization (Rare):</strong> Some exotic ARMs might not cover full interest, increasing the loan balance.</li>
        </ul>

        <hr className="my-6" />

        <h2 id="strategy" className="text-2xl font-bold text-foreground pt-8">Strategic Use of ARMs</h2>
        <p>An ARM is a powerful financial tool when matched with the right life strategy. It is ideal for:</p>
        <ul className="list-disc ml-6 space-y-2">
          <li><strong>Medical Residents or Contractors:</strong> People who know they will move in 5-7 years.</li>
          <li><strong>High-Income Earners:</strong> Those who expect significant income growth that can easily cover potential rate hikes.</li>
          <li><strong>Rapid Repayers:</strong> Borrowers who plan to aggressively pay down the principal during the low-rate period.</li>
        </ul>
        <p>However, for a "forever home" where you plan to retire, a Fixed-Rate Mortgage offers the invaluable peace of mind of predictable housing costs.</p>
      </section>

      {/* FAQ Section */}
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <HelpCircle className="h-5 w-5" />
            Frequently Asked Questions
          </CardTitle>
          <CardDescription>
            Common queries about Adjustable Rate Mortgages and comparisons
          </CardDescription>
        </CardHeader>
        <CardContent>
          <div className="space-y-6">
            <div>
              <h4 className="font-semibold text-lg mb-3">What happens when the ARM fixed period ends?</h4>
              <p className="text-muted-foreground">
                When the fixed period ends, your loan enters the "adjustment period." The interest rate is recalculated based on the current Index value plus your Margin. Your monthly payment will likely change (up or down) to amortize the remaining balance over the remaining term at the new rate.
              </p>
            </div>

            <div>
              <h4 className="font-semibold text-lg mb-3">Can my interest rate go down with an ARM?</h4>
              <p className="text-muted-foreground">
                Yes. If the underlying financial index (like SOFR or Treasury rates) drops significantly, your mortgage rate—and your monthly payment—could decrease. This is one advantage ARMs have over fixed-rate mortgages, which require refinancing to take advantage of lower rates.
              </p>
            </div>

            <div>
              <h4 className="font-semibold text-lg mb-3">What is the "Lifetime Cap"?</h4>
              <p className="text-muted-foreground">
                The Lifetime Cap is a clause in your loan contract that sets the absolute maximum interest rate you can be charged, regardless of how high market rates rise. For example, if your start rate is 5% and your lifetime cap is 5%, your rate can never exceed 10%.
              </p>
            </div>

            <div>
              <h4 className="font-semibold text-lg mb-3">Is a 5/1 ARM better than a 30-year fixed?</h4>
              <p className="text-muted-foreground">
                It depends on your timeline. If you plan to move or refinance within 5 years, the 5/1 ARM usually offers a lower rate and saves you money. If you plan to stay for 10+ years, the 30-year fixed provides safety against rising rates.
              </p>
            </div>

            <div>
              <h4 className="font-semibold text-lg mb-3">What if I can't afford the new payment after adjustment?</h4>
              <p className="text-muted-foreground">
                This is the primary risk of an ARM. If rates rise and you cannot afford the new payment, you may need to refinance into a new loan (if you have equity and credit) or sell the home. In worst-case scenarios, it can lead to default.
              </p>
            </div>

            <div>
              <h4 className="font-semibold text-lg mb-3">Can I refinance an ARM into a fixed-rate loan?</h4>
              <p className="text-muted-foreground">
                Yes, you can refinance an ARM into a fixed-rate mortgage at any time. Many borrowers typically do this before their fixed period ends to "lock in" a stable rate, provided that current fixed rates are favorable.
              </p>
            </div>

            <div>
              <h4 className="font-semibold text-lg mb-3">What is "Payment Shock"?</h4>
              <p className="text-muted-foreground">
                Payment shock refers to a significant increase in your monthly mortgage payment when the interest rate adjusts. Lenders qualify borrowers based on the fully indexed rate to ensure they can handle some level of increase, but the reality of a 30-50% payment hike can still be difficult to manage.
              </p>
            </div>

            <div>
              <h4 className="font-semibold text-lg mb-3">Are ARMs more difficult to qualify for?</h4>
              <p className="text-muted-foreground">
                Generally, no. In fact, because the initial payment is lower, it might be easier to qualify for a higher loan amount with an ARM in terms of Debt-to-Income (DTI) ratios, though regulations have tightened to ensure borrowers can afford potential rate increases.
              </p>
            </div>

            <div>
              <h4 className="font-semibold text-lg mb-3">What does "2/2/6" mean in an ARM quote?</h4>
              <p className="text-muted-foreground">
                These numbers represent the rate caps structure. The first number (2) is the max increase at the first adjustment. The second number (2) is the max increase for subsequent adjustments. The third number (6) is the lifetime max increase over the initial rate.
              </p>
            </div>

            <div>
              <h4 className="font-semibold text-lg mb-3">Should I use an ARM for an investment property?</h4>
              <p className="text-muted-foreground">
                Investors often use ARMs to maximize cash flow (via lower payments) in the short term, especially if they intend to flip the property or sell it within a few years. It enhances the Cash-on-Cash return during the fixed period.
              </p>
            </div>
          </div>
        </CardContent>
      </Card>

      {/* Usage of Calculator */}
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
                <strong className="block text-primary mb-1">First-Time Homebuyers</strong>
                <span className="text-sm text-muted-foreground">Trying to decide between the lower payments of an ARM and the safety of a fixed-rate loan.</span>
              </div>
              <div className="p-3 bg-muted/50 rounded-lg border border-border/50">
                <strong className="block text-primary mb-1">Real Estate Investors</strong>
                <span className="text-sm text-muted-foreground">Analyzing short-term cash flow benefits vs. long-term holding risks for rental properties.</span>
              </div>
              <div className="p-3 bg-muted/50 rounded-lg border border-border/50">
                <strong className="block text-primary mb-1">Refinance Candidates</strong>
                <span className="text-sm text-muted-foreground">Homeowners considering switching from a fixed loan to an ARM to lower current payments.</span>
              </div>
              <div className="p-3 bg-muted/50 rounded-lg border border-border/50">
                <strong className="block text-primary mb-1">Financial Planners</strong>
                <span className="text-sm text-muted-foreground">Illustrating "worst-case scenarios" to clients to stress-test their budgets against rate hikes.</span>
              </div>
            </div>
          </div>

          <hr className="border-border/50" />

          {/* Limitations */}
          <div>
            <h4 className="flex items-center gap-2 font-semibold text-lg mb-3">
              <AlertTriangle className="h-5 w-5 text-amber-600" />
              Limitations & Accuracy Nuances
            </h4>
            <ul className="space-y-2 text-sm text-muted-foreground">
              <li className="flex gap-2">
                <CheckCircle2 className="h-4 w-4 text-amber-500 shrink-0 mt-0.5" />
                <span><strong>Index Prediction:</strong> This calculator assumes a "Worst Case" where rates hit the cap immediately. Real rates fluctuate gradually; reality is usually somewhere between the initial and max rate.</span>
              </li>
              <li className="flex gap-2">
                <CheckCircle2 className="h-4 w-4 text-amber-500 shrink-0 mt-0.5" />
                <span><strong>Taxes & Insurance:</strong> The calculation is for Principal & Interest (P&I) only. Real payments will be higher due to property taxes and insurance escrow.</span>
              </li>
              <li className="flex gap-2">
                <CheckCircle2 className="h-4 w-4 text-amber-500 shrink-0 mt-0.5" />
                <span><strong>Complex Caps:</strong> We simulate a simple lifetime cap. Detailed periodic caps (e.g., max 1% per year) would smooth out the payment increase curve, making this a conservative estimate.</span>
              </li>
            </ul>
          </div>

          <hr className="border-border/50" />

          {/* Real World Examples */}
          <div>
            <h4 className="flex items-center gap-2 font-semibold text-lg mb-3">
              <Landmark className="h-5 w-5 text-green-600" />
              Real-World Examples
            </h4>
            <div className="space-y-3">
              <div className="p-4 rounded-lg bg-green-50 dark:bg-green-900/10 border border-green-100 dark:border-green-900/20">
                <h5 className="font-semibold text-green-800 dark:text-green-300 mb-1">Scenario A: The "Starter Home" Strategy</h5>
                <p className="text-sm text-green-700/80 dark:text-green-400">
                  A couple buys a condo using a 5/1 ARM at 4.5% instead of a fixed 6.5%. They save $400/month. They plan to sell the condo in 4 years to buy a larger house. Result: They saved ~$19,000 in interest and never faced a rate adjustment.
                </p>
              </div>
              <div className="p-4 rounded-lg bg-blue-50 dark:bg-blue-900/10 border border-blue-100 dark:border-blue-900/20">
                <h5 className="font-semibold text-blue-800 dark:text-blue-300 mb-1">Scenario B: The 2008 Crisis Trap</h5>
                <p className="text-sm text-blue-700/80 dark:text-blue-400">
                  Borrowers took ARMs with very low "teaser" rates. When the rates adjusted upwards and home values simultaneously fell, they couldn't refinance (no equity) and couldn't afford the new double payments, leading to foreclosure.
                </p>
              </div>
            </div>
          </div>
        </CardContent>
      </Card>

      <Card className="mb-6">
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <CheckCircle2 className="h-5 w-5" />
            Summary
          </CardTitle>
        </CardHeader>
        <CardContent className="space-y-2 text-sm text-muted-foreground">
          <p>The Adjustable Loan Comparison Calculator helps borrowers visualize the financial risks and rewards of an ARM.</p>
          <p>By comparing the stable initial payment against the potential maximum payment, you can determine if your budget is resilient enough for an adjustable-rate product.</p>
          <p>Use this tool to stress-test your finances against worst-case interest rate scenarios before signing a loan agreement.</p>
        </CardContent>
      </Card>
    </div>
  );
}

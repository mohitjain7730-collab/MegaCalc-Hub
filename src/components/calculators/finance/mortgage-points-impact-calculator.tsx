'use client';

import { useState } from 'react';
import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import { z } from 'zod';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Form, FormControl, FormField, FormItem, FormLabel, FormMessage } from '@/components/ui/form';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Calculator, Info, Landmark, DollarSign, Percent, Clock, AlertCircle, CheckCircle2, TrendingDown, Home, TrendingUp, Calendar, PiggyBank, Scale, FileText, ArrowRight, Activity, Shield, Users, Briefcase } from 'lucide-react';
import { Badge } from '@/components/ui/badge';
import { Separator } from '@/components/ui/separator';
import { Alert, AlertDescription } from '@/components/ui/alert';
import Link from 'next/link';

const formSchema = z.object({
  loanAmount: z.number().positive('Loan amount must be positive'),
  interestRate: z.number().min(0.01).max(100),
  termYears: z.number().min(1).max(50),
  pointsCostPercent: z.number().min(0).max(10, 'Points usually do not exceed 10%'),
  rateReductionPercent: z.number().min(0).max(10, 'Rate reduction must be realistic'),
});

type FormValues = z.infer<typeof formSchema>;

export default function MortgagePointsImpactCalculator() {
  const [result, setResult] = useState<{
    monthlyPaymentBase: number;
    monthlyPaymentPoints: number;
    monthlySavings: number;
    upfrontCost: number;
    breakevenMonths: number;
    breakevenYears: number;
    lifetimeSavings: number;
    rec: string;
    insights: string[];
    riskFactors: string[];
  } | null>(null);

  const form = useForm<FormValues>({
    resolver: zodResolver(formSchema),
    defaultValues: {
      loanAmount: undefined,
      interestRate: undefined,
      termYears: 30,
      pointsCostPercent: 1.0,
      rateReductionPercent: 0.25,
    },
  });

  const calculatePayment = (principal: number, annualRate: number, years: number) => {
    if (annualRate === 0) return principal / (years * 12);
    const r = annualRate / 100 / 12;
    const n = years * 12;
    return (principal * r) / (1 - Math.pow(1 + r, -n));
  };

  const calculate = (v: FormValues) => {
    const baseRate = v.interestRate;
    const newRate = Math.max(0, baseRate - v.rateReductionPercent);
    const costOfPoints = v.loanAmount * (v.pointsCostPercent / 100);

    const paymentBase = calculatePayment(v.loanAmount, baseRate, v.termYears);
    const paymentPoints = calculatePayment(v.loanAmount, newRate, v.termYears);

    const monthlySavings = paymentBase - paymentPoints;

    let breakevenMonths = 0;
    if (monthlySavings > 0) {
      breakevenMonths = costOfPoints / monthlySavings;
    } else {
      breakevenMonths = 9999; // Never breaks even if savings are 0 or negative
    }

    const totalLifetimeSavings = (monthlySavings * v.termYears * 12) - costOfPoints;

    const insights = [];
    if (v.pointsCostPercent > 3) insights.push('Buying more than 3 points is historically rare and often fails regulatory "Qualified Mortgage" tests.');
    if (v.rateReductionPercent < 0.2) insights.push('The rate reduction seems low for the cost. Typical ratio is 1 point (1% cost) for 0.25% rate drop.');

    const riskFactors = [];
    if (breakevenMonths > 84) riskFactors.push('Breakeven is over 7 years. The average homeowner moves or refinances every 5-7 years, making this huge risk.');
    if (costOfPoints > 10000) riskFactors.push(`High upfront cash requirement ($${costOfPoints.toLocaleString()}). Ensure this doesn't deplete your emergency fund.`);
    if (v.termYears < 30 && breakevenMonths > (v.termYears * 12) / 2) riskFactors.push('On shorter term loans, buying points is often mathematically harder to justify.');

    let rec = '';
    if (breakevenMonths < 48) rec = 'Strong Buy: You break even in under 4 years. If you plan to stay, this is an excellent investment.';
    else if (breakevenMonths < 84) rec = 'Consider Carefully: Breaks even in 4-7 years. Good for "forever homes", risky for starter homes.';
    else rec = 'Likely avoid: It takes too long to recoup the cost. You are likely to move or refinance before breaking even.';

    setResult({
      monthlyPaymentBase: paymentBase,
      monthlyPaymentPoints: paymentPoints,
      monthlySavings,
      upfrontCost: costOfPoints,
      breakevenMonths,
      breakevenYears: breakevenMonths / 12,
      lifetimeSavings: totalLifetimeSavings,
      rec,
      insights,
      riskFactors,
    });
  };

  return (
    <div className="space-y-8">
      {/* Input Form */}
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <Home className="h-5 w-5" />
            Mortgage Scenario Inputs
          </CardTitle>
          <CardDescription>
            Compare your base loan offer against buying discount points.
          </CardDescription>
        </CardHeader>
        <CardContent>
          <Form {...form}>
            <form onSubmit={form.handleSubmit(calculate)} className="space-y-6">
              <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
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
                        <Input type="number" step="1000" placeholder="e.g. 400000" {...field} onChange={e => field.onChange(parseFloat(e.target.value) || undefined)} />
                      </FormControl>
                      <FormMessage />
                    </FormItem>
                  )}
                />
                <FormField
                  control={form.control}
                  name="interestRate"
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel className="flex items-center gap-2">
                        <Percent className="h-4 w-4" />
                        Base Interest Rate (%)
                      </FormLabel>
                      <FormControl>
                        <Input type="number" step="0.125" placeholder="e.g. 6.5" {...field} onChange={e => field.onChange(parseFloat(e.target.value) || undefined)} />
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
                        <Clock className="h-4 w-4" />
                        Loan Term (Years)
                      </FormLabel>
                      <FormControl>
                        <Input type="number" step="1" placeholder="e.g. 30" {...field} onChange={e => field.onChange(parseFloat(e.target.value) || undefined)} />
                      </FormControl>
                      <FormMessage />
                    </FormItem>
                  )}
                />
              </div>

              <Separator />

              <div className="space-y-4">
                <div className="flex items-center gap-2 mb-2">
                  <h4 className="font-semibold text-sm uppercase text-muted-foreground tracking-wider">Points Details</h4>
                </div>
                <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                  <FormField
                    control={form.control}
                    name="pointsCostPercent"
                    render={({ field }) => (
                      <FormItem>
                        <FormLabel>Cost of Points (% of Loan)</FormLabel>
                        <FormControl>
                          <Input type="number" step="0.125" placeholder="e.g. 1.0 (means 1 point)" {...field} onChange={e => field.onChange(parseFloat(e.target.value) || undefined)} />
                        </FormControl>
                        <FormMessage />
                      </FormItem>
                    )}
                  />
                  <FormField
                    control={form.control}
                    name="rateReductionPercent"
                    render={({ field }) => (
                      <FormItem>
                        <FormLabel>Rate Reduction (e.g. 0.25)</FormLabel>
                        <FormControl>
                          <Input type="number" step="0.01" placeholder="e.g. 0.25 " {...field} onChange={e => field.onChange(parseFloat(e.target.value) || undefined)} />
                        </FormControl>
                        <div className="text-xs text-muted-foreground">Often 1 point = 0.25% drop</div>
                        <FormMessage />
                      </FormItem>
                    )}
                  />
                </div>
              </div>

              <Button type="submit" className="w-full">
                <Calculator className="mr-2 h-4 w-4" />
                Calculate Breakeven
              </Button>
            </form>
          </Form>
        </CardContent>
      </Card>

      {/* Results Section */}
      {result && (
        <div className="space-y-6">
          <Card>
            <CardHeader>
              <div className="flex items-center gap-4">
                <Calendar className="h-8 w-8 text-primary" />
                <div>
                  <CardTitle>Impact Analysis</CardTitle>
                  <CardDescription>Upfront cost vs. Monthly savings</CardDescription>
                </div>
              </div>
            </CardHeader>
            <CardContent className="space-y-6">

              <div className="grid grid-cols-1 md:grid-cols-2 gap-6 text-center">
                <div className="p-6 bg-muted/40 rounded-xl border border-primary/20 shadow-sm relative overflow-hidden">
                  <div className="absolute top-0 right-0 p-2 opacity-10">
                    <Clock className="h-24 w-24" />
                  </div>
                  <p className="text-sm text-muted-foreground uppercase tracking-wider font-semibold mb-2">Breakeven Period</p>
                  <div className="flex items-baseline justify-center gap-2">
                    <p className="text-4xl font-extrabold text-primary">{result.breakevenYears.toFixed(1)}</p>
                    <span className="text-2xl font-normal text-muted-foreground">years</span>
                  </div>
                  <p className="text-xs text-muted-foreground mt-2">{Math.ceil(result.breakevenMonths)} monthly payments to recoup cost</p>
                </div>

                <div className="p-6 bg-muted/40 rounded-xl border shadow-sm">
                  <p className="text-sm text-muted-foreground uppercase tracking-wider font-semibold mb-2">Monthly Savings</p>
                  <p className="text-4xl font-extrabold text-green-600">${result.monthlySavings.toFixed(2)}</p>
                  <p className="text-xs text-muted-foreground mt-2">Saved per month</p>
                  <Badge variant="outline" className="mt-2 text-green-600 border-green-200 bg-green-50 dark:bg-green-900/10">
                    Payment drops to ${result.monthlyPaymentPoints.toLocaleString(undefined, { maximumFractionDigits: 0 })}
                  </Badge>
                </div>
              </div>

              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div className="text-center p-4 bg-muted/50 rounded-lg">
                  <TrendingDown className="h-6 w-6 mx-auto mb-2 text-red-600" />
                  <p className="font-semibold">Upfront Cost (Points)</p>
                  <p className="text-xl font-bold mt-1 text-red-600">${result.upfrontCost.toLocaleString()}</p>
                  <p className="text-xs text-muted-foreground">Cash due at closing</p>
                </div>
                <div className="text-center p-4 bg-muted/50 rounded-lg">
                  <PiggyBank className="h-6 w-6 mx-auto mb-2 text-blue-600" />
                  <p className="font-semibold">Lifetime Savings</p>
                  <p className={`text-xl font-bold mt-1 ${result.lifetimeSavings > 0 ? 'text-blue-600' : 'text-red-600'}`}>
                    ${result.lifetimeSavings.toLocaleString(undefined, { maximumFractionDigits: 0 })}
                  </p>
                  <p className="text-xs text-muted-foreground">If loan held for full {form.getValues('termYears')} years</p>
                </div>
              </div>

              <Alert variant="default" className="bg-primary/5 border-primary/20">
                <Info className="h-4 w-4 text-primary" />
                <AlertDescription className="text-primary/90">
                  <strong>Verdict:</strong> {result.rec}
                </AlertDescription>
              </Alert>
            </CardContent>
          </Card>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-6 mb-6">
            <Card className="h-full border-red-100 bg-red-50/10 dark:border-red-900/20 dark:bg-red-900/5">
              <CardHeader>
                <CardTitle className="flex items-center gap-2 text-xl text-red-600 dark:text-red-400">
                  <AlertCircle className="h-6 w-6" />
                  Risk Factors
                </CardTitle>
                <CardDescription>Why you might lose money</CardDescription>
              </CardHeader>
              <CardContent className="space-y-4">
                {result.riskFactors.length === 0 ? (
                  <div className="flex items-center justify-center p-6 text-green-600">
                    <CheckCircle2 className="h-6 w-6 mr-2" />
                    <span>Breakeven looks reasonable.</span>
                  </div>
                ) : (
                  result.riskFactors.map((factor, index) => (
                    <div key={index} className="flex items-start gap-3 p-3 bg-red-50 dark:bg-red-900/10 rounded-lg border border-red-100 dark:border-red-900/20">
                      <AlertCircle className="h-5 w-5 text-red-600 dark:text-red-400 mt-0.5 shrink-0" />
                      <span className="text-sm font-medium text-red-800 dark:text-red-300">{factor}</span>
                    </div>
                  ))
                )}
                <div className="flex items-start gap-3 p-3 bg-red-50 dark:bg-red-900/10 rounded-lg border border-red-100 dark:border-red-900/20">
                  <AlertCircle className="h-5 w-5 text-red-600 dark:text-red-400 mt-0.5 shrink-0" />
                  <span className="text-sm font-medium text-red-800 dark:text-red-300">If rates drop next year and you refinance, the money you spent on points today is <strong>gone forever</strong>.</span>
                </div>
              </CardContent>
            </Card>

            <Card className="h-full">
              <CardHeader>
                <CardTitle className="flex items-center gap-2 text-xl text-primary">
                  <Info className="h-6 w-6" />
                  Smart Insights
                </CardTitle>
                <CardDescription>Strategic Context</CardDescription>
              </CardHeader>
              <CardContent className="space-y-4">
                {result.insights.map((insight, index) => (
                  <div key={index} className="flex items-start gap-3 p-3 bg-muted/50 rounded-lg">
                    <ArrowRight className="h-5 w-5 text-primary mt-0.5 shrink-0" />
                    <span className="text-sm font-medium">{insight}</span>
                  </div>
                ))}
                <div className="flex items-start gap-3 p-3 bg-muted/50 rounded-lg">
                  <ArrowRight className="h-5 w-5 text-primary mt-0.5 shrink-0" />
                  <span className="text-sm font-medium">Points are tax deductible in the year you pay them (for primary residence purchase), complicating the math. This calculator shows pre-tax savings.</span>
                </div>
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
            Understanding Mortgage Points
          </CardTitle>
          <CardDescription>
            Also known as "Discount Points"
          </CardDescription>
        </CardHeader>
        <CardContent>
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div className="p-4 bg-muted/50 rounded-lg">
              <h4 className="font-semibold mb-2 flex items-center gap-2">
                <CheckCircle2 className="h-4 w-4 text-primary" />
                What is a "Point"?
              </h4>
              <p className="text-sm text-muted-foreground">
                One "point" equals 1% of your loan amount. On a $400k loan, 1 point costs $4,000. It is a fee you pay at closing.
              </p>
            </div>
            <div className="p-4 bg-muted/50 rounded-lg">
              <h4 className="font-semibold mb-2 flex items-center gap-2">
                <TrendingDown className="h-4 w-4 text-primary" />
                The Rate Buy-down
              </h4>
              <p className="text-sm text-muted-foreground">
                In exchange for the fee, the lender lowers your interest rate for the life of the loan. A typical trade is 1 Point cost for 0.25% lower rate.
              </p>
            </div>
          </div>
        </CardContent>
      </Card>

      {/* Formula Used */}
      <Card className="mb-6">
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <Calculator className="h-5 w-5" />
            Formula Used
          </CardTitle>
        </CardHeader>
        <CardContent className="space-y-4">
          <div className="p-4 bg-muted rounded-lg overflow-x-auto space-y-2">
            <p className="font-mono text-sm text-center">
              Breakeven (Months) = Cost of Points / Monthly Savings
            </p>
            <p className="font-mono text-sm text-center mt-2">
              Cost of Points = Loan Amount * (Points % / 100)
            </p>
          </div>
          <p className="text-sm text-muted-foreground mt-2">
            This calculates the "Simple Payback Period". It does not account for the Time Value of Money (opportunity cost of investing that cash instead), which would make the true breakeven slightly longer.
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
            Home buying tools
          </CardDescription>
        </CardHeader>
        <CardContent>
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
            <Link href="/category/finance/mortgage-payment-calculator" className="block">
              <Card className="hover:shadow-md transition-shadow cursor-pointer h-full">
                <CardContent className="p-4">
                  <div className="flex items-center gap-3">
                    <Home className="h-5 w-5 text-blue-600" />
                    <div>
                      <p className="font-medium">Mortgage Payment</p>
                      <p className="text-sm text-muted-foreground">Basic payment calc</p>
                    </div>
                  </div>
                </CardContent>
              </Card>
            </Link>
            <Link href="/category/finance/interest-only-loan-payment-calculator" className="block">
              <Card className="hover:shadow-md transition-shadow cursor-pointer h-full">
                <CardContent className="p-4">
                  <div className="flex items-center gap-3">
                    <Clock className="h-5 w-5 text-green-600" />
                    <div>
                      <p className="font-medium">Interest-Only Loan</p>
                      <p className="text-sm text-muted-foreground">Lower initial payments</p>
                    </div>
                  </div>
                </CardContent>
              </Card>
            </Link>
            <Link href="/category/finance/house-down-payment-savings-calculator" className="block">
              <Card className="hover:shadow-md transition-shadow cursor-pointer h-full">
                <CardContent className="p-4">
                  <div className="flex items-center gap-3">
                    <PiggyBank className="h-5 w-5 text-pink-600" />
                    <div>
                      <p className="font-medium">Down Payment Save</p>
                      <p className="text-sm text-muted-foreground">Savings goal tracker</p>
                    </div>
                  </div>
                </CardContent>
              </Card>
            </Link>
            <Link href="/category/finance/rent-vs-buy-calculator" className="block">
              <Card className="hover:shadow-md transition-shadow cursor-pointer h-full">
                <CardContent className="p-4">
                  <div className="flex items-center gap-3">
                    <Scale className="h-5 w-5 text-orange-600" />
                    <div>
                      <p className="font-medium">Rent vs Buy</p>
                      <p className="text-sm text-muted-foreground">Long-term analysis</p>
                    </div>
                  </div>
                </CardContent>
              </Card>
            </Link>
            <Link href="/category/finance/loan-amortization-calculator" className="block">
              <Card className="hover:shadow-md transition-shadow cursor-pointer h-full">
                <CardContent className="p-4">
                  <div className="flex items-center gap-3">
                    <FileText className="h-5 w-5 text-indigo-600" />
                    <div>
                      <p className="font-medium">Amortization</p>
                      <p className="text-sm text-muted-foreground">Full schedule</p>
                    </div>
                  </div>
                </CardContent>
              </Card>
            </Link>
            <Link href="/category/finance/debt-to-income-ratio-calculator" className="block">
              <Card className="hover:shadow-md transition-shadow cursor-pointer h-full">
                <CardContent className="p-4">
                  <div className="flex items-center gap-3">
                    <AlertCircle className="h-5 w-5 text-red-600" />
                    <div>
                      <p className="font-medium">DTI Ratio</p>
                      <p className="text-sm text-muted-foreground">Qualification check</p>
                    </div>
                  </div>
                </CardContent>
              </Card>
            </Link>
          </div>
        </CardContent>
      </Card>

      {/* Comprehensive Guide */}
      <section className="space-y-6 text-muted-foreground leading-relaxed bg-card p-6 md:p-10 rounded-lg shadow-lg" itemScope itemType="https://schema.org/Article">
        <meta itemProp="headline" content="Mortgage Points (Discount Points): The Definitive Guide to Buydowns" />
        <meta itemProp="description" content="Calculate if buying mortgage discount points is worth it. Learn the breakeven math, tax implications, and strategic reasons to buy down your interest rate." />
        <meta itemProp="author" content="Real Estate Finance Team" />
        <meta itemProp="datePublished" content="2025-09-20" />

        <h1 className="text-3xl md:text-4xl font-extrabold text-foreground mb-4">Mortgage Points Explained: Pay Now, Save Later?</h1>
        <p className="text-lg italic text-muted-foreground">When locking in a mortgage, lenders will often ask, "Do you want to buy points?" It sounds enticing: pay a fee upfront to get a lower interest rate forever. But is it a trap or a smart investment? This guide helps you run the numbers.</p>

        <h2 className="text-2xl font-bold text-foreground mt-8 mb-4">Table of Contents</h2>
        <ul className="list-disc ml-6 space-y-2 text-primary">
          <li><a href="#what-are-points" className="hover:underline">What are Discount Points?</a></li>
          <li><a href="#how-they-work" className="hover:underline">The Mechanics: Buying Down the Rate</a></li>
          <li><a href="#breakeven" className="hover:underline">The All-Important Breakeven Analysis</a></li>
          <li><a href="#taxes" className="hover:underline">Tax Implications</a></li>
          <li><a href="#opportunity-cost" className="hover:underline">The Opportunity Cost Argument</a></li>
          <li><a href="#strategy" className="hover:underline">Strategic Decision Guide</a></li>
          <li><a href="#faq" className="hover:underline">Frequently Asked Questions</a></li>
        </ul>
        <hr className="my-6" />

        <h2 id="what-are-points" className="text-2xl font-bold text-foreground pt-8">What are Discount Points?</h2>
        <p>In the mortgage world, a "point" is simply a unit of measurement equal to <strong>1% of your loan amount</strong>. If you borrow $300,000, one point costs $3,000.</p>
        <p className="mt-4"><strong>"Discount Points"</strong> are essentially prepaid interest. You give the lender cash at closing (increasing your "Closing Costs"), and in exchange, they agree to reduce the interest rate on your note for the entire 30-year term. This is different from "Origination Points", which are just fees for processing the loan and do not lower your rate.</p>

        <h2 id="how-they-work" className="text-2xl font-bold text-foreground pt-8">The Mechanics: Buying Down the Rate</h2>
        <p>There is no federal law setting the price of a rate cut, but the industry standard often hovers around:</p>
        <div className="mt-4 p-4 bg-muted rounded-lg text-center font-semibold">
          1 Point (Cost) &asymp; 0.25% Rate Reduction (Benefit)
        </div>
        <p className="mt-4">Example scenario:</p>
        <ul className="list-disc ml-6 mt-2 space-y-1">
          <li><strong>Base Offer:</strong> 7.00% rate with $0 points.</li>
          <li><strong>Option A:</strong> Pay 1 point ($3,000) to get 6.75%.</li>
          <li><strong>Option B:</strong> Pay 2 points ($6,000) to get 6.50%.</li>
        </ul>
        <p className="mt-4">The lender is indifferent. Mathematically, they earn roughly the same yield either way. The choice depends entirely on YOUR timeline.</p>

        <h2 id="breakeven" className="text-2xl font-bold text-foreground pt-8">The All-Important Breakeven Analysis</h2>
        <p>This is the only metric that matters. You are writing a check for $3,000 today to save, say, $50 a month.</p>
        <p className="mt-2 font-mono bg-muted p-2 rounded inline-block">Breakeven Months = Upfront Cost / Monthly Savings</p>
        <p className="mt-4">In this example: $3,000 / $50 = 60 months (5 years).</p>
        <ul className="list-disc ml-6 mt-4 space-y-2">
          <li>If you sell the house in Year 3, you <strong>LOST</strong> money. You paid $3,000 to save $1,800.</li>
          <li>If you stay for 10 years, you <strong>WON</strong>. You paid $3,000 to save $6,000.</li>
        </ul>
        <div className="mt-4 p-4 bg-amber-50 dark:bg-amber-900/10 border-l-4 border-amber-500 text-sm">
          <strong>The Refinance Trap:</strong> Many people buy points intending to stay for 30 years, but then rates drop 2 years later. They refinance to get the new lower market rate. The points they bought on the <em>original</em> loan are wasted.
        </div>

        <h2 id="taxes" className="text-2xl font-bold text-foreground pt-8">Tax Implications</h2>
        <p>Discount points are considered prepaid mortgage interest, which means they are generally <strong>tax-deductible</strong> on Schedule A if:</p>
        <ol className="list-decimal ml-6 mt-2 space-y-1">
          <li>The loan is for your primary residence.</li>
          <li>You itemize your deductions (instead of taking the Standard Deduction).</li>
          <li>You actually paid cash at closing (didn't roll it into the loan).</li>
        </ol>
        <p className="mt-4">This can effectively lower the "Net Cost" of the points. If you are in the 24% tax bracket, a $4,000 point cost might save you $960 in taxes, bringing the real cost down to $3,040, which shortens your breakeven period. *Always consult a CPA.</p>

        <h2 id="opportunity-cost" className="text-2xl font-bold text-foreground pt-8">The Opportunity Cost Argument</h2>
        <p>Financial purists argue against points because of <strong>Opportunity Cost</strong>. That $4,000 you paid to the lender could have been invested in the Stock Market.</p>
        <p className="mt-2">Buying points is effectively a "Guaranteed Risk-Free Return" equal to the rate reduction. If you lower your rate from 7% to 6.75%, you are "saving" 7% interest on the principal you didn't borrow. Effectively, buying points yields a return roughly equal to the interest rate of the mortgage.</p>
        <p className="mt-2">Use this rule: <strong>If you have high-interest debt (Credit Cards at 20%), NEVER buy mortgage points.</strong> Use the cash to pay off the 20% debt first.</p>

        <h2 id="strategy" className="text-2xl font-bold text-foreground pt-8">Strategic Decision Guide</h2>
        <div className="grid grid-cols-1 md:grid-cols-2 gap-6 mt-6">
          <div className="p-6 bg-green-50 dark:bg-green-900/10 rounded-xl border border-green-200">
            <h3 className="font-bold text-green-800 dark:text-green-300 mb-2">When to BUY Points</h3>
            <ul className="list-disc ml-4 space-y-1 text-sm text-green-700 dark:text-green-400">
              <li>This is your "Forever Home" (10+ year horizon).</li>
              <li>Interest rates are historically low (unlikely to refinance lower).</li>
              <li>You have plenty of cash reserves left over.</li>
              <li>You need a slightly lower monthly payment to qualify for DTI (Debt-to-Income) ratios.</li>
              <li>The seller is offering "Seller Concessions" to pay your closing costs. Use *their* money to buy down *your* rate!</li>
            </ul>
          </div>
          <div className="p-6 bg-red-50 dark:bg-red-900/10 rounded-xl border border-red-200">
            <h3 className="font-bold text-red-800 dark:text-red-300 mb-2">When to SKIP Points</h3>
            <ul className="list-disc ml-4 space-y-1 text-sm text-red-700 dark:text-red-400">
              <li>This is a starter home (planning to move in 5-7 years).</li>
              <li>Interest rates are high (likely to refinance when they drop).</li>
              <li>Cash is tight; you barely have enough for the down payment.</li>
              <li>You prefer liquidity (cash in bank &gt; slightly lower payment).</li>
              <li>The breakeven period is &gt; 7 years.</li>
            </ul>
          </div>
        </div>
      </section>

      {/* FAQ Section */}
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <Info className="h-5 w-5" />
            Frequently Asked Questions
          </CardTitle>
          <CardDescription>
            Common questions about buying points
          </CardDescription>
        </CardHeader>
        <CardContent>
          <div className="space-y-6">
            <div>
              <h4 className="font-semibold text-lg mb-3">What is a "Par Rate"?</h4>
              <p className="text-muted-foreground">
                The "Par Rate" is the interest rate a lender offers with zero points paid and zero credits given. It is the baseline market rate for your credit score.
              </p>
            </div>
            <div>
              <h4 className="font-semibold text-lg mb-3">Can I buy a fraction of a point?</h4>
              <p className="text-muted-foreground">
                Yes. Lenders often offer buydowns in increments like 0.125, 0.25, 0.5, etc. You can buy 0.875 points if that's exactly how much cash you have.
              </p>
            </div>
            <div>
              <h4 className="font-semibold text-lg mb-3">What are "Negative Points"?</h4>
              <p className="text-muted-foreground">
                This is a Lender Credit. Instead of paying a fee, the lender PAYS YOU (usually to cover closing costs) in exchange for a <em>higher</em> interest rate. This is great for short-term ownership.
              </p>
            </div>
            <div>
              <h4 className="font-semibold text-lg mb-3">Is there a limit to how many points I can buy?</h4>
              <p className="text-muted-foreground">
                Yes. "Qualified Mortgage" (QM) rules generally cap total points and fees at 3% of the loan amount. Most lenders won't let you buy more than 2-3 points.
              </p>
            </div>
            <div>
              <h4 className="font-semibold text-lg mb-3">Can I add the cost of points to my loan?</h4>
              <p className="text-muted-foreground">
                Generally, no. Points are a closing cost and usually must be paid in cash. However, slightly flexible lenders might let you roll it in, but this means you are paying interest on your interest, which negates the benefit.
              </p>
            </div>
            <div>
              <h4 className="font-semibold text-lg mb-3">Do points affect APR?</h4>
              <p className="text-muted-foreground">
                Yes! APR (Annual Percentage Rate) includes the interest rate PLUS fees. Since points are a fee, buying points increases the difference between your Note Rate and your APR. If you see a low rate but a huge APR, it's because the lender included points in the calculation.
              </p>
            </div>
            <div>
              <h4 className="font-semibold text-lg mb-3">What if I refinance later?</h4>
              <p className="text-muted-foreground">
                If you refinance, you lose the benefit of the points you paid on the old loan. You have to start over. This is why you should only buy points if you are certain rates won't drop significantly soon.
              </p>
            </div>
          </div>
        </CardContent>
      </Card>

      {/* Usage of this Calculator */}
      <Card className="mb-6">
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <CheckCircle2 className="h-5 w-5" />
            Usage of this Calculator
          </CardTitle>
          <CardDescription>
            Best use cases for this comparison tool
          </CardDescription>
        </CardHeader>
        <CardContent className="space-y-6">
          <div>
            <h4 className="flex items-center gap-2 font-semibold text-lg mb-3">
              <Users className="h-5 w-5 text-blue-600" />
              Target Audience
            </h4>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div className="p-3 bg-muted/50 rounded-lg border border-border/50">
                <strong className="block text-primary mb-1">New Homebuyers</strong>
                <span className="text-sm text-muted-foreground">Deciding how to allocate finite cash reserves between Down Payment vs. Buying Points.</span>
              </div>
              <div className="p-3 bg-muted/50 rounded-lg border border-border/50">
                <strong className="block text-primary mb-1">Refinancers</strong>
                <span className="text-sm text-muted-foreground">Calculating if the cost of a refinance (often including points) is justified by the savings.</span>
              </div>
              <div className="p-3 bg-muted/50 rounded-lg border border-border/50">
                <strong className="block text-primary mb-1">Real Estate Agents</strong>
                <span className="text-sm text-muted-foreground">To explain to sellers how offering concessions for rate buydowns is more attractive to buyers than a simple price cut.</span>
              </div>
              <div className="p-3 bg-muted/50 rounded-lg border border-border/50">
                <strong className="block text-primary mb-1">Mortgage Brokers</strong>
                <span className="text-sm text-muted-foreground">To vividly demonstrate the "Payback Period" to clients who are skeptical about closing costs.</span>
              </div>
            </div>
          </div>

          <hr className="border-border/50" />

          <div>
            <h4 className="flex items-center gap-2 font-semibold text-lg mb-3">
              <Briefcase className="h-5 w-5 text-green-600" />
              Real-World Strategies
            </h4>
            <div className="space-y-3">
              <div className="p-4 rounded-lg bg-green-50 dark:bg-green-900/10 border border-green-100 dark:border-green-900/20">
                <h5 className="font-semibold text-green-800 dark:text-green-300 mb-1">The "Forever Home" Strategy</h5>
                <p className="text-sm text-green-700/80 dark:text-green-400">
                  <strong>Scenario:</strong> You are buying your dream home and never plan to move. Rates are 5%. <br />
                  <strong>Action:</strong> Buy 2 points to get 4.5%. <br />
                  <strong>Result:</strong> Breakeven is 5 years. You enjoy 25 years of "pure savings" after that.
                </p>
              </div>
              <div className="p-4 rounded-lg bg-red-50 dark:bg-red-900/10 border border-red-100 dark:border-red-900/20">
                <h5 className="font-semibold text-red-800 dark:text-red-300 mb-1">The "Temporary 2-1 Buydown"</h5>
                <p className="text-sm text-red-700/80 dark:text-red-400">
                  <strong>Scenario:</strong> You are a builder trying to sell a home. <br />
                  <strong>Action:</strong> Instead of dropping price by $10k, use $10k to buy down the buyer's rate for the first 2 years. <br />
                  <strong>Result:</strong> Buyer qualifies easier, payment is lower, and you sell the house faster.
                </p>
              </div>
            </div>
          </div>
        </CardContent>
      </Card>

      <Card className="mb-6">
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <Activity className="h-5 w-5" />
            Summary
          </CardTitle>
        </CardHeader>
        <CardContent className="space-y-2 text-sm text-muted-foreground">
          <p>The Mortgage Points Impact Calculator quantifies the trade-off between upfront cash and long-term savings.</p>
          <p>It cuts through the sales pitch to show you the exact Breakeven Date.</p>
          <p>Use it to align your mortgage strategy with your life plans (how long you stay) rather than just chasing the lowest advertised rate.</p>
        </CardContent>
      </Card>
    </div>
  );
}

'use client';

import { useState, useEffect } from 'react';
import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import { z } from 'zod';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Form, FormControl, FormField, FormItem, FormLabel, FormMessage } from '@/components/ui/form';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import {
  DollarSign,
  Home,
  Percent,
  Target,
  Info,
  Calculator,
  PieChart as PieIcon,
  Briefcase,
  Landmark,
  Shield,
  TrendingUp,
  AlertCircle,
  Building,
  CheckCircle2,
  AlertTriangle,
  Wallet,
  PiggyBank,
  ArrowRightLeft,
  Users
} from 'lucide-react';
import { Badge } from '@/components/ui/badge';
import { Alert, AlertDescription } from '@/components/ui/alert';
import Link from 'next/link';
import { Separator } from '@/components/ui/separator';

const formSchema = z.object({
  annualIncome: z.number().positive(),
  monthlyDebts: z.number().min(0),
  downPaymentCash: z.number().min(0),
  interestRate: z.number().min(0.1).max(20),
  loanTermYears: z.number().min(5).max(40),
  propertyTaxRate: z.number().min(0).max(10), // % annual
  homeInsuranceAnnual: z.number().min(0),
  hoaFeesMonthly: z.number().min(0),
  frontEndRatio: z.number().min(10).max(60), // Housing ratio (default ~28)
  backEndRatio: z.number().min(10).max(70),  // Total debt ratio (default ~36)
});

type FormValues = z.infer<typeof formSchema>;

export default function HomeAffordabilityCalculator() {
  const [result, setResult] = useState<{
    maxHomePrice: number;
    maxLoanAmount: number;
    maxMonthlyPayment: number;
    principalAndInterest: number;
    monthlyTax: number;
    monthlyInsurance: number;
    limitingFactor: 'front-end' | 'back-end';
    affordabilityRating: string;
    insights: string[];
    risks: string[];
  } | null>(null);

  const form = useForm<FormValues>({
    resolver: zodResolver(formSchema),
    defaultValues: {
      annualIncome: 100000,
      monthlyDebts: 500,
      downPaymentCash: 50000,
      interestRate: 6.5,
      loanTermYears: 30,
      propertyTaxRate: 1.2,
      homeInsuranceAnnual: 1200,
      hoaFeesMonthly: 0,
      frontEndRatio: 28,
      backEndRatio: 36,
    },
  });

  const calculate = (v: FormValues) => {
    const monthlyIncome = v.annualIncome / 12;

    // 1. Calculate Max Payment based on Front-End Ratio (Housing / Income)
    const maxHousingFront = monthlyIncome * (v.frontEndRatio / 100);

    // 2. Calculate Max Payment based on Back-End Ratio ((Housing + Debts) / Income)
    const maxTotalBack = monthlyIncome * (v.backEndRatio / 100);
    const maxHousingBack = maxTotalBack - v.monthlyDebts;

    // 3. Determine Limiting Factor
    const maxAllowedHousingPayment = Math.min(maxHousingFront, maxHousingBack);
    const limitingFactor: 'front-end' | 'back-end' = maxHousingFront < maxHousingBack ? 'front-end' : 'back-end';

    // 4. Subtract Non-Mortgage Housing Costs (Tax, Insurance, HOA)
    // Problem: Tax is usually % of Home Price. We don't know Home Price yet.
    // Solution: Let P = Home Price.
    // Loan = P - DownPayment.
    // Mortgage Payment = Function(Loan).
    // Tax = (P * TaxRate)/12.
    // MaxPayment = Mortgage + Tax + Insurance + HOA.
    // Mortgage + Tax = MaxPayment - Insurance - HOA.

    // Mortgage(P - Down) + (P * TaxRate/12) = AvailableForPrincipalTax
    // Let r = monthly interest rate. n = months.
    // Mortgage = (P - Down) * (r(1+r)^n / ((1+r)^n - 1)) ... let this factor be K.
    // Mortgage = (P - Down) * K = P*K - Down*K.

    // So: P*K - Down*K + P*(TaxRate/12) = MaxPayment - Insurance - HOA
    // P * (K + TaxRate/12) = MaxPayment - Insurance - HOA + Down*K
    // P = (MaxPayment - Insurance - HOA + Down*K) / (K + TaxRate/12)

    const monthlyInsurance = v.homeInsuranceAnnual / 12;
    const availableForMortgageAndTax = maxAllowedHousingPayment - monthlyInsurance - v.hoaFeesMonthly;

    if (availableForMortgageAndTax <= 0) {
      // Debts or HOA too high
      return null;
    }

    const r = v.interestRate / 100 / 12;
    const n = v.loanTermYears * 12;
    // Mortgage Factor K
    const K = r === 0 ? 1 / n : (r * Math.pow(1 + r, n)) / (Math.pow(1 + r, n) - 1);
    const monthlyTaxFactor = v.propertyTaxRate / 100 / 12;

    const numerator = availableForMortgageAndTax + (v.downPaymentCash * K);
    const denominator = K + monthlyTaxFactor;

    let maxHomePrice = numerator / denominator;

    // Constraint: Loan cannot be negative. If Down payment > Max Home Price (math weirdness), clamp properly.
    // Actually, if Max Price < Down Payment, it means we can afford even more, but wait.
    // If availableForMortgageAndTax is very low, maxHomePrice decreases. 
    // If Max Home Price < Down Payment, it means we basically don't need a loan, or standard formula holds.
    // Minimum price is 0.
    if (maxHomePrice < 0) maxHomePrice = 0;

    const maxLoanAmount = Math.max(0, maxHomePrice - v.downPaymentCash);
    const principalAndInterest = maxLoanAmount * K;
    const monthlyTax = maxHomePrice * monthlyTaxFactor;

    // Derived Affordability Rating based on DTI Input
    let rating = "Standard";
    if (v.backEndRatio <= 30) rating = "Conservative";
    else if (v.backEndRatio >= 43) rating = "Aggressive";
    else rating = "Moderate";

    // Insights
    const insights = [];
    if (limitingFactor === 'back-end') {
      const debtImpact = v.monthlyDebts / K; // Roughly how much loan amount is reduced by debt
      insights.push(`Your monthly debts of $${v.monthlyDebts} reduce your buying power by approx. $${Math.round(debtImpact / 1000) * 1000}.`);
      insights.push(`The "Back-End Ratio" (Total Debt) is limiting your budget more than the housing ratio.`);
    } else {
      insights.push(`Your income limit (Front-End Ratio) is the primary constraint.`);
      insights.push(`You have relatively low other debts, which is excellent for qualification.`);
    }

    insights.push(`Estimated Monthly Tax: $${monthlyTax.toFixed(0)}`);

    const risks = [];
    if (v.downPaymentCash < maxHomePrice * 0.2) risks.push("Down payment < 20% may trigger PMI (Private Mortgage Insurance), costing extra $50-$200/mo.");
    if (v.interestRate > 7) risks.push("High interest rates strictly reduce your buying power. Refinancing later could capture savings.");
    if (v.propertyTaxRate > 2) risks.push("High property tax rate (2%+) significantly eats into your monthly payment capacity.");

    return {
      maxHomePrice,
      maxLoanAmount,
      maxMonthlyPayment: maxAllowedHousingPayment + monthlyInsurance + v.hoaFeesMonthly, // reconstruct total
      principalAndInterest,
      monthlyTax,
      monthlyInsurance,
      limitingFactor,
      affordabilityRating: rating,
      insights,
      risks
    };
  };

  const onSubmit = (values: FormValues) => {
    const res = calculate(values);
    if (res) setResult(res);
  };

  // Re-calc when form values change (optional, but let's stick to explicit submit to avoid jitter)

  return (
    <div className="space-y-8">
      {/* Input Section */}
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <Wallet className="h-5 w-5" />
            Financial Profile
          </CardTitle>
          <CardDescription>
            Input your income, debts, and savings to determine your purchasing power.
          </CardDescription>
        </CardHeader>
        <CardContent>
          <Form {...form}>
            <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-6">
              <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
                {/* Income & Debts */}
                <div className="space-y-4 md:col-span-2 lg:col-span-3">
                  <h4 className="text-sm font-semibold text-muted-foreground border-b pb-2">Income & Assets</h4>
                </div>
                <FormField
                  control={form.control}
                  name="annualIncome"
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel className="flex items-center gap-1"><DollarSign className="h-3 w-3" /> Annual Gross Income</FormLabel>
                      <FormControl><Input type="number" {...field} onChange={e => field.onChange(parseFloat(e.target.value))} /></FormControl>
                      <FormMessage />
                    </FormItem>
                  )}
                />
                <FormField
                  control={form.control}
                  name="monthlyDebts"
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel className="flex items-center gap-1"><AlertCircle className="h-3 w-3" /> Monthly Debts (Loans/CC)</FormLabel>
                      <FormControl><Input type="number" {...field} onChange={e => field.onChange(parseFloat(e.target.value))} /></FormControl>
                      <FormMessage />
                    </FormItem>
                  )}
                />
                <FormField
                  control={form.control}
                  name="downPaymentCash"
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel className="flex items-center gap-1"><PiggyBank className="h-3 w-3" /> Cash for Down Payment</FormLabel>
                      <FormControl><Input type="number" {...field} onChange={e => field.onChange(parseFloat(e.target.value))} /></FormControl>
                      <FormMessage />
                    </FormItem>
                  )}
                />

                {/* Loan Specs */}
                <div className="space-y-4 md:col-span-2 lg:col-span-3 mt-2">
                  <h4 className="text-sm font-semibold text-muted-foreground border-b pb-2">Loan & House Details</h4>
                </div>
                <FormField
                  control={form.control}
                  name="interestRate"
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel>Interest Rate (%)</FormLabel>
                      <FormControl><Input type="number" step="0.1" {...field} onChange={e => field.onChange(parseFloat(e.target.value))} /></FormControl>
                      <FormMessage />
                    </FormItem>
                  )}
                />
                <FormField
                  control={form.control}
                  name="loanTermYears"
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel>Loan Term (Years)</FormLabel>
                      <FormControl><Input type="number" {...field} onChange={e => field.onChange(parseFloat(e.target.value))} /></FormControl>
                      <FormMessage />
                    </FormItem>
                  )}
                />
                <FormField
                  control={form.control}
                  name="propertyTaxRate"
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel>Est. Property Tax (%/yr)</FormLabel>
                      <FormControl><Input type="number" step="0.1" {...field} onChange={e => field.onChange(parseFloat(e.target.value))} /></FormControl>
                      <FormMessage />
                    </FormItem>
                  )}
                />
                <FormField
                  control={form.control}
                  name="homeInsuranceAnnual"
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel>Home Insurance ($/yr)</FormLabel>
                      <FormControl><Input type="number" {...field} onChange={e => field.onChange(parseFloat(e.target.value))} /></FormControl>
                      <FormMessage />
                    </FormItem>
                  )}
                />
                <FormField
                  control={form.control}
                  name="hoaFeesMonthly"
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel>HOA Fees ($/mo)</FormLabel>
                      <FormControl><Input type="number" {...field} onChange={e => field.onChange(parseFloat(e.target.value))} /></FormControl>
                      <FormMessage />
                    </FormItem>
                  )}
                />

                {/* Advanced DTI Specs */}
                <div className="space-y-4 md:col-span-2 lg:col-span-3 mt-2">
                  <h4 className="text-sm font-semibold text-muted-foreground border-b pb-2">Advanced: Debt-to-Income Rules</h4>
                </div>
                <FormField
                  control={form.control}
                  name="frontEndRatio"
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel>Front-End Ratio (Housing) %</FormLabel>
                      <FormControl><Input type="number" {...field} onChange={e => field.onChange(parseFloat(e.target.value))} /></FormControl>
                      <CardDescription className="text-xs">Standard is 28%. FHA allows up to 31%.</CardDescription>
                      <FormMessage />
                    </FormItem>
                  )}
                />
                <FormField
                  control={form.control}
                  name="backEndRatio"
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel>Back-End Ratio (Total Debt) %</FormLabel>
                      <FormControl><Input type="number" {...field} onChange={e => field.onChange(parseFloat(e.target.value))} /></FormControl>
                      <CardDescription className="text-xs">Standard is 36%. FHA up to 43%.</CardDescription>
                      <FormMessage />
                    </FormItem>
                  )}
                />


              </div>
              <Button type="submit" className="w-full">
                <Calculator className="mr-2 h-4 w-4" />
                Calculate Max Affordability
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
                <Building className="h-8 w-8 text-primary" />
                <div>
                  <CardTitle>Maximum Home Budget</CardTitle>
                  <CardDescription>Based on your {result.affordabilityRating} ratio settings</CardDescription>
                </div>
              </div>
            </CardHeader>
            <CardContent className="space-y-6">
              <div className="text-center p-8 bg-primary/5 rounded-xl border border-primary/20">
                <p className="text-lg font-medium text-muted-foreground mb-2">You Can Afford a Home Up To</p>
                <div className="flex items-center justify-center gap-2">
                  <span className="text-5xl font-extrabold text-primary">
                    ${Math.floor(result.maxHomePrice).toLocaleString()}
                  </span>
                </div>
                <Badge variant={result.affordabilityRating === "Conservative" ? "default" : result.affordabilityRating === "Aggressive" ? "destructive" : "secondary"} className="mt-4 text-md px-4 py-1">
                  Strategy: {result.affordabilityRating}
                </Badge>
              </div>

              <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                <div className="text-center p-4 bg-muted/50 rounded-lg border">
                  <TrendingUp className="h-5 w-5 mx-auto mb-2 text-indigo-600" />
                  <p className="font-semibold text-sm text-muted-foreground">Max Monthly P&I</p>
                  <p className="text-lg font-bold">${Math.floor(result.principalAndInterest).toLocaleString()}</p>
                </div>
                <div className="text-center p-4 bg-muted/50 rounded-lg border">
                  <Shield className="h-5 w-5 mx-auto mb-2 text-green-600" />
                  <p className="font-semibold text-sm text-muted-foreground">Est. Taxes/Ins/HOA</p>
                  <p className="text-lg font-bold">${Math.floor(result.monthlyTax + result.monthlyInsurance + form.getValues('hoaFeesMonthly')).toLocaleString()}</p>
                </div>
                <div className="text-center p-4 bg-muted/50 rounded-lg border">
                  <DollarSign className="h-5 w-5 mx-auto mb-2 text-blue-600" />
                  <p className="font-semibold text-sm text-muted-foreground">Total Monthly Budget</p>
                  <p className="text-lg font-bold">${Math.floor(result.maxMonthlyPayment).toLocaleString()}</p>
                </div>
              </div>

              <Alert>
                <Info className="h-4 w-4" />
                <AlertDescription>
                  Your <strong>{result.limitingFactor === 'front-end' ? 'Housing Ratio (Income Cap)' : 'Back-End Ratio (Debt Load)'}</strong> is the limiting factor in this calculation.
                </AlertDescription>
              </Alert>
            </CardContent>
          </Card>

          {/* Smart Insights & Risks */}
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6 mb-6">
            <Card className="h-full">
              <CardHeader>
                <CardTitle className="flex items-center gap-2 text-xl text-primary">
                  <Target className="h-6 w-6" />
                  Affordability Insights
                </CardTitle>
                <CardDescription>Tailored feedback</CardDescription>
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
                  Risk Considerations
                </CardTitle>
                <CardDescription>Factors to watch out for</CardDescription>
              </CardHeader>
              <CardContent className="space-y-4">
                {result.risks.length > 0 ? (
                  result.risks.map((item, index) => (
                    <div key={index} className="flex items-start gap-3 p-3 bg-red-50 dark:bg-red-900/10 rounded-lg border border-red-100 dark:border-red-900/20">
                      <AlertTriangle className="h-5 w-5 text-red-600 dark:text-red-400 mt-0.5 shrink-0" />
                      <span className="text-sm font-medium text-red-800 dark:text-red-300">{item}</span>
                    </div>
                  ))
                ) : (
                  <div className="flex items-start gap-3 p-3 bg-green-50 dark:bg-green-900/10 rounded-lg border border-green-100 dark:border-green-900/20">
                    <CheckCircle2 className="h-5 w-5 text-green-600 dark:text-green-400 mt-0.5 shrink-0" />
                    <span className="text-sm font-medium text-green-800 dark:text-green-300">No red flags detected in your inputs.</span>
                  </div>
                )}
              </CardContent>
            </Card>
          </div>
        </div>
      )}

      {/* Understanding Inputs */}
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2"><Info className="h-5 w-5" /> Understanding the Ratios</CardTitle>
          <CardDescription>The rigorous math lenders use to qualify you</CardDescription>
        </CardHeader>
        <CardContent>
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div className="p-4 bg-blue-50 dark:bg-blue-900/10 rounded-lg border border-blue-100 dark:border-blue-900/20">
              <h4 className="font-semibold mb-2 flex items-center gap-2 text-blue-700 dark:text-blue-300">
                <PieIcon className="h-4 w-4" /> Front-End Ratio (28%)
              </h4>
              <p className="text-sm text-muted-foreground">The percentage of your annual gross income that goes toward housing costs (Mortgage + Tax + Insurance). Lenders prefer this to be under 28%.</p>
            </div>
            <div className="p-4 bg-amber-50 dark:bg-amber-900/10 rounded-lg border border-amber-100 dark:border-amber-900/20">
              <h4 className="font-semibold mb-2 flex items-center gap-2 text-amber-700 dark:text-amber-300">
                <Briefcase className="h-4 w-4" /> Back-End Ratio (36%)
              </h4>
              <p className="text-sm text-muted-foreground">The percentage of your gross income that goes toward ALL debts (Housing + Loans + Credit Cards). This is usually the harder limit to satisfy (Typically max 36% - 43%).</p>
            </div>
          </div>
        </CardContent>
      </Card>

      {/* Formula Used */}
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2"><Calculator className="h-5 w-5" /> The Math Behind It</CardTitle>
        </CardHeader>
        <CardContent className="space-y-4">
          <div className="p-4 bg-muted rounded-lg overflow-x-auto">
            <p className="font-mono text-sm">
              Max Payment = Min(Income * FrontEnd, (Income * BackEnd) - Existing Debts)
            </p>
            <p className="font-mono text-sm mt-2">
              Max Price * (MortgageFactor + TaxRate) = Max Payment - Ins - HOA + (DownPayment * MortgageFactor)
            </p>
          </div>
          <p className="text-sm text-muted-foreground">
            The calculator works backwards from your monthly income limits to find the maximum monthly payment you can support. It then deducts fixed costs like taxes, insurance, and HOA to see how much is left for pure mortgage Principal & Interest. Finally, it converts that P&I ability into a loan amount using the interest rate and term, and adds your down payment.
          </p>
        </CardContent>
      </Card>

      {/* Related Calculators */}
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2"><Calculator className="h-5 w-5" /> Related Financial Calculators</CardTitle>
          <CardDescription>Tools to further analyze your purchase</CardDescription>
        </CardHeader>
        <CardContent>
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
            <Link href="/category/finance/mortgage-payment-calculator" className="block">
              <Card className="hover:shadow-md transition-shadow cursor-pointer h-full">
                <CardContent className="p-4">
                  <div className="flex items-center gap-3">
                    <Home className="h-5 w-5 text-blue-600" />
                    <div><p className="font-medium">Mortgage Payment</p><p className="text-sm text-muted-foreground">Check specific payments</p></div>
                  </div>
                </CardContent>
              </Card>
            </Link>
            <Link href="/category/finance/rent-vs-buy-home-calculator" className="block">
              <Card className="hover:shadow-md transition-shadow cursor-pointer h-full">
                <CardContent className="p-4">
                  <div className="flex items-center gap-3">
                    <ArrowRightLeft className="h-5 w-5 text-green-600" />
                    <div><p className="font-medium">Rent vs Buy</p><p className="text-sm text-muted-foreground">Is it better to rent?</p></div>
                  </div>
                </CardContent>
              </Card>
            </Link>
            <Link href="/category/finance/house-down-payment-savings-calculator" className="block">
              <Card className="hover:shadow-md transition-shadow cursor-pointer h-full">
                <CardContent className="p-4">
                  <div className="flex items-center gap-3">
                    <PiggyBank className="h-5 w-5 text-orange-600" />
                    <div><p className="font-medium">Down Payment Goal</p><p className="text-sm text-muted-foreground">Plan your savings</p></div>
                  </div>
                </CardContent>
              </Card>
            </Link>
            <Link href="/category/finance/property-tax-calculator" className="block">
              <Card className="hover:shadow-md transition-shadow cursor-pointer h-full">
                <CardContent className="p-4">
                  <div className="flex items-center gap-3">
                    <Landmark className="h-5 w-5 text-purple-600" />
                    <div><p className="font-medium">Property Tax</p><p className="text-sm text-muted-foreground">Estimate liability</p></div>
                  </div>
                </CardContent>
              </Card>
            </Link>
            <Link href="/category/finance/debt-to-income-ratio-calculator" className="block">
              <Card className="hover:shadow-md transition-shadow cursor-pointer h-full">
                <CardContent className="p-4">
                  <div className="flex items-center gap-3">
                    <Percent className="h-5 w-5 text-red-600" />
                    <div><p className="font-medium">DTI Ratio</p><p className="text-sm text-muted-foreground">Detailed breakdown</p></div>
                  </div>
                </CardContent>
              </Card>
            </Link>
            <Link href="/category/finance/loan-to-value-ltv-ratio-calculator" className="block">
              <Card className="hover:shadow-md transition-shadow cursor-pointer h-full">
                <CardContent className="p-4">
                  <div className="flex items-center gap-3">
                    <PieIcon className="h-5 w-5 text-teal-600" />
                    <div><p className="font-medium">LTV Ratio</p><p className="text-sm text-muted-foreground">Risk assessment</p></div>
                  </div>
                </CardContent>
              </Card>
            </Link>
          </div>
        </CardContent>
      </Card>

      {/* Comprehensive Guide */}
      <section className="space-y-6 text-muted-foreground leading-relaxed bg-card p-6 md:p-10 rounded-lg shadow-lg" itemScope itemType="https://schema.org/Article">
        {/* SEO Metadata */}
        <meta itemProp="name" content="Home Affordability Calculator: How Much House Can You Afford?" />
        <meta itemProp="description" content="Calculate your maximum home budget using the 28/36 rule. Understand debt-to-income ratios, interest rate impacts, and hidden costs like property taxes and insurance." />
        <meta itemProp="author" content="Financial Analysis Team" />

        <h1 className="text-3xl md:text-4xl font-extrabold text-foreground mb-4" itemProp="headline">How Much House Can You Really Afford?</h1>
        <p className="text-lg italic text-muted-foreground">Unlocking the bank\'s secret formula: The 28/36 Rule, DTI limits, and the reality of monthly budgeting.</p>

        <h2 className="text-2xl font-bold text-foreground mt-8 mb-4">Table of Contents</h2>
        <ul className="list-disc ml-6 space-y-2 text-primary intro-links">
          <li><a href="#the-28-36-rule" className="hover:underline">The Golden Standard: The 28/36 Rule</a></li>
          <li><a href="#dti-explained" className="hover:underline">Debt-to-Income (DTI) Explained</a></li>
          <li><a href="#hidden-costs" className="hover:underline">Don\'t Forget the "Hidden" Costs</a></li>
          <li><a href="#interest-rates" className="hover:underline">The Impact of Interest Rates</a></li>
          <li><a href="#strategies" className="hover:underline">Strategies to Afford More</a></li>
        </ul>
        <Separator className="my-6" />

        <h2 id="the-28-36-rule" className="text-2xl font-bold text-foreground pt-8">The Golden Standard: The 28/36 Rule</h2>
        <p>Lenders don\'t guess how much you can borrow; they use a strict formula. The most common is the <strong>28/36 Rule</strong>, which serves as a ceiling for responsible lending.</p>
        <div className="grid grid-cols-1 md:grid-cols-2 gap-6 mt-6">
          <div className="p-4 border rounded-lg">
            <h3 className="font-bold text-lg mb-2 text-primary">1. The Front-End Ratio (28%)</h3>
            <p className="text-sm">No more than <strong>28%</strong> of your gross monthly income should go toward <em>Housing Expenses</em>. This includes:</p>
            <ul className="list-disc ml-4 mt-2 text-sm text-muted-foreground">
              <li>Mortgage Principal & Interest</li>
              <li>Property Taxes</li>
              <li>Homeowners Insurance</li>
              <li>HOA Fees</li>
            </ul>
          </div>
          <div className="p-4 border rounded-lg">
            <h3 className="font-bold text-lg mb-2 text-primary">2. The Back-End Ratio (36%)</h3>
            <p className="text-sm">No more than <strong>36%</strong> of your gross monthly income should go toward <em>Total Debt</em>. This includes Housing Expenses PLUS:</p>
            <ul className="list-disc ml-4 mt-2 text-sm text-muted-foreground">
              <li>Car Loans</li>
              <li>Student Loans</li>
              <li>Credit Card Minimum Payments</li>
              <li>Personal Loans</li>
            </ul>
          </div>
        </div>
        <p className="mt-4"><strong>Note:</strong> Some loan programs (like FHA loans) allow higher ratios (up to 43% or even 50%), but borrowing the maximum amount puts you at higher risk of "house poverty."</p>

        <h2 id="dti-explained" className="text-2xl font-bold text-foreground pt-8">Debt-to-Income (DTI) Explained</h2>
        <p>Your DTI is the single most important number in mortgage qualification. If you have high student loans or a large car payment, your borrowing power is directly reduced dollar-for-dollar.</p>
        <p className="mt-2">For example, a $500/month car payment reduces your affordable mortgage amount by roughly $75,000 to $100,000 (depending on interest rates). Elimination of debt is often the fastest way to increase your home budget.</p>

        <h2 id="hidden-costs" className="text-2xl font-bold text-foreground pt-8">Don\'t Forget the "Hidden" Costs</h2>
        <p>Many first-time buyers only look at the "Mortgage Payment" (Principal & Interest). This is a trap. The "PITI" payment (Principal, Interest, Taxes, Insurance) is what you actually pay.</p>
        <div className="bg-muted p-4 rounded-lg mt-4">
          <h4 className="font-semibold text-foreground">Why Taxes Matter</h4>
          <p className="text-sm mt-1">In high-tax states (like NJ, IL, TX), property taxes can easily be $800-$1,000 per month on an average home. This alone effectively reduces your buying power by $150,000+ compared to low-tax states.</p>
        </div>

        <h2 id="strategies" className="text-2xl font-bold text-foreground pt-8">Strategies to Afford More</h2>
        <ul className="space-y-4 mt-4">
          <li className="flex gap-3">
            <CheckCircle2 className="h-6 w-6 text-green-600 shrink-0" />
            <span><strong>Pay Down Debt:</strong> Eliminating a $300 monthly payment boosts your buying power significantly more than saving $300 more for a down payment.</span>
          </li>
          <li className="flex gap-3">
            <CheckCircle2 className="h-6 w-6 text-green-600 shrink-0" />
            <span><strong>Boost Your Credit Score:</strong> A higher score gets you a lower interest rate. A 1% drop in rate boosts buying power by ~10%.</span>
          </li>
          <li className="flex gap-3">
            <CheckCircle2 className="h-6 w-6 text-green-600 shrink-0" />
            <span><strong>Consider 2-4 Unit Properties:</strong> You can often count 75% of the projected rental income from the other units as "income," boosting your DTI capacity.</span>
          </li>
        </ul>
      </section>

      {/* FAQ */}
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2"><Info className="h-5 w-5" /> Frequently Asked Questions</CardTitle>
          <CardDescription>Common questions about qualifying for a mortgage</CardDescription>
        </CardHeader>
        <CardContent className="space-y-6">
          <div>
            <h4 className="font-semibold text-lg mb-2">Can I afford a house 3x my income?</h4>
            <p className="text-muted-foreground">The "3x Rule" is outdated. With today's interest rates (6-7%), limits are often closer to 3x-4x depending on your debts. In calculation, lender DTI limits matters more than arbitrary multiples.</p>
          </div>
          <div>
            <h4 className="font-semibold text-lg mb-2">What if I have bad credit?</h4>
            <p className="text-muted-foreground">You may still qualify for FHA loans (min 580 score for 3.5% down). However, your interest rate will be higher, reducing the total amount you can borrow.</p>
          </div>
          <div>
            <h4 className="font-semibold text-lg mb-2">Is the affordability estimate a pre-approval?</h4>
            <p className="text-muted-foreground">No. This is a mathematical estimate. A pre-approval requires a hard credit check and verification of income documents (W2s, Paystubs) by a licensed loan officer.</p>
          </div>
          <div>
            <h4 className="font-semibold text-lg mb-2">Does a larger down payment help?</h4>
            <p className="text-muted-foreground">Yes. It helps in two ways: 1) It lowers the loan amount needed, and 2) If &gt;20%, it removes PMI, lowering the monthly payment and freeing up DTI space for more principal.</p>
          </div>
          <div>
            <h4 className="font-semibold text-lg mb-2">Should I spend the maximum amount I qualify for?</h4>
            <p className="text-muted-foreground"><strong>Rarely.</strong> The bank determines the max you can <em>pay back</em>, not the max you can live comfortably with. Leave room for emergency repairs, furniture, and vacations.</p>
          </div>
          <div>
            <h4 className="font-semibold text-lg mb-2">Why is HOA included in DTI?</h4>
            <p className="text-muted-foreground">HOA fees are a mandatory monthly obligation linked to the property. If you don't pay them, the HOA can foreclose. Thus, lenders treat them as a fixed housing debt.</p>
          </div>
        </CardContent>
      </Card>

      {/* Usage Section */}
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2"><Briefcase className="h-5 w-5" /> Usage of this Calculator</CardTitle>
          <CardDescription>Applications and Limitations</CardDescription>
        </CardHeader>
        <CardContent className="space-y-6">
          <div>
            <h4 className="flex items-center gap-2 font-semibold text-lg mb-3">
              <Users className="h-5 w-5 text-blue-600" />
              Who Should Use This?
            </h4>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div className="p-3 bg-muted/50 rounded-lg">
                <strong className="block text-primary mb-1">Active House Hunters</strong>
                <span className="text-sm text-muted-foreground">Filter your Zillow/Redfin searches to a realistic max price to avoid disappointment.</span>
              </div>
              <div className="p-3 bg-muted/50 rounded-lg">
                <strong className="block text-primary mb-1">Debt Optimizers</strong>
                <span className="text-sm text-muted-foreground">See exactly how much "house buying power" you gain by paying off that $400/mo car loan.</span>
              </div>
            </div>
          </div>

          <Separator />

          <div>
            <h4 className="flex items-center gap-2 font-semibold text-lg mb-3">
              <AlertCircle className="h-5 w-5 text-amber-600" />
              Limitations
            </h4>
            <ul className="space-y-2 text-sm text-muted-foreground">
              <li className="flex gap-2"><CheckCircle2 className="h-4 w-4 text-amber-500 shrink-0" /> <strong>PMI Estimates:</strong> We don\'t explicitly calculate varied PMI rates, which depend on credit score. We assume standard costs.</li>
              <li className="flex gap-2"><CheckCircle2 className="h-4 w-4 text-amber-500 shrink-0" /> <strong>Closing Costs:</strong> The Max Price is the sticker price. You will need extra cash (2-5%) for closing costs.</li>
            </ul>
          </div>
        </CardContent>
      </Card>

      {/* Summary */}
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2"><Shield className="h-5 w-5" /> Summary</CardTitle>
        </CardHeader>
        <CardContent className="text-sm text-muted-foreground">
          <p>This calculator uses the industry-standard "Backwards" calculation method: starting from your income caps (28%/36%), deducting your existing obligations, and solving for the maximum loan amount your budget supports.</p>
        </CardContent>
      </Card>
    </div>
  );
}

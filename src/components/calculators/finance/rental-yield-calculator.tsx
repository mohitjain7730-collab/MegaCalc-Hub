'use client';

import { useState } from 'react';
import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import { z } from 'zod';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Form, FormControl, FormField, FormItem, FormLabel, FormMessage } from '@/components/ui/form';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import {
  Building,
  DollarSign,
  Percent,
  Calculator,
  Info,
  TrendingUp,
  PieChart,
  Wallet,
  Wrench,
  CheckCircle2,
  AlertTriangle,
  Home,
  Briefcase,
  Layers,
  BarChart3
} from 'lucide-react';
import { Badge } from '@/components/ui/badge';
import { Alert, AlertDescription } from '@/components/ui/alert';
import Link from 'next/link';
import { Separator } from '@/components/ui/separator';

const formSchema = z.object({
  purchasePrice: z.number().positive(),
  closingCosts: z.number().min(0),
  renovationCosts: z.number().min(0),
  downPaymentPercent: z.number().min(0).max(100),
  interestRate: z.number().min(0).max(100),
  loanTermYears: z.number().min(1).max(50),
  monthlyRent: z.number().positive(),
  vacancyRate: z.number().min(0).max(100),
  managementFeeRate: z.number().min(0).max(100), // % of rent
  propertyTaxAnnual: z.number().min(0),
  insuranceAnnual: z.number().min(0),
  hoaMonthly: z.number().min(0),
  maintenanceRate: z.number().min(0).max(100), // % of rent
});

type FormValues = z.infer<typeof formSchema>;

export default function RentalYieldCalculator() {
  const [result, setResult] = useState<{
    grossYield: number;
    capRate: number; // Net Yield
    cashOnCash: number;
    monthlyCashFlow: number;
    noiAnnual: number;
    totalInitialInvestment: number;
    expenseRatio: number; // Expenses / Income
    insights: string[];
    risks: string[];
  } | null>(null);

  const form = useForm<FormValues>({
    resolver: zodResolver(formSchema),
    defaultValues: {
      purchasePrice: 250000,
      closingCosts: 5000,
      renovationCosts: 0,
      downPaymentPercent: 25,
      interestRate: 6.5,
      loanTermYears: 30,
      monthlyRent: 2000,
      vacancyRate: 5,
      managementFeeRate: 8,
      propertyTaxAnnual: 3000,
      insuranceAnnual: 1200,
      hoaMonthly: 0,
      maintenanceRate: 5,
    },
  });

  const calculate = (v: FormValues) => {
    // 1. Initial Investment
    const downPaymentAmount = v.purchasePrice * (v.downPaymentPercent / 100);
    const loanAmount = v.purchasePrice - downPaymentAmount;
    const totalInitialInvestment = downPaymentAmount + v.closingCosts + v.renovationCosts;
    const totalAssetCost = v.purchasePrice + v.closingCosts + v.renovationCosts;

    // 2. Income
    const maxAnnualRent = v.monthlyRent * 12;
    const vacancyLoss = maxAnnualRent * (v.vacancyRate / 100);
    const effectiveGrossIncome = maxAnnualRent - vacancyLoss;

    // 3. Operating Expenses
    const managementFee = effectiveGrossIncome * (v.managementFeeRate / 100);
    const maintenanceCost = effectiveGrossIncome * (v.maintenanceRate / 100);
    const totalOperatingExpenses =
      v.propertyTaxAnnual +
      v.insuranceAnnual +
      (v.hoaMonthly * 12) +
      managementFee +
      maintenanceCost;

    const noiAnnual = effectiveGrossIncome - totalOperatingExpenses; // Net Operating Income

    // 4. Debt Service (Mortgage)
    let annualDebtService = 0;
    if (loanAmount > 0 && v.interestRate > 0) {
      const r = v.interestRate / 100 / 12;
      const n = v.loanTermYears * 12;
      const monthlyPI = (loanAmount * r * Math.pow(1 + r, n)) / (Math.pow(1 + r, n) - 1);
      annualDebtService = monthlyPI * 12;
    }

    // 5. Metrics
    const annualCashFlow = noiAnnual - annualDebtService;

    const grossYield = (maxAnnualRent / v.purchasePrice) * 100;
    const capRate = (noiAnnual / v.purchasePrice) * 100; // Cap Rate typically uses Purchase Price or Value
    const cashOnCash = totalInitialInvestment > 0 ? (annualCashFlow / totalInitialInvestment) * 100 : 0;

    // Insights
    const insights = [];
    if (cashOnCash > 10) insights.push("Excellent Cash-on-Cash Return (>10%). This property is a strong cash flow generator.");
    else if (cashOnCash > 5) insights.push("Solid Cash-on-Cash Return (5-10%). Typical for stable, decent markets.");
    else insights.push("Low Cash-on-Cash Return (<5%). You might be banking on appreciation rather than cash flow.");

    // The 1% Rule Check
    const onePercentRule = (v.monthlyRent / v.purchasePrice) * 100;
    if (onePercentRule >= 1) insights.push("Passes the '1% Rule' (Monthly Rent is ≥ 1% of Price).");
    else insights.push(`Fails the '1% Rule' (Rent is ${(onePercentRule).toFixed(2)}% of Price). Harder to cash flow positive.`);

    // Risks
    const risks = [];
    if (annualCashFlow < 0) risks.push("Negative Cash Flow! You will be paying out of pocket every month to own this property.");
    if (v.vacancyRate < 5) risks.push("Using <5% vacancy is aggressive. Markets typically average 5-8%.");
    if (v.maintenanceRate < 5) risks.push("Budgeting <5% for maintenance is risky. One broken HVAC can wipe out a year of profits.");
    if (v.managementFeeRate === 0) risks.push("You assumed 0% management fee. Ensure you value your own time (Self-Management).");

    return {
      grossYield,
      capRate,
      cashOnCash,
      monthlyCashFlow: annualCashFlow / 12,
      noiAnnual,
      totalInitialInvestment,
      expenseRatio: (totalOperatingExpenses / effectiveGrossIncome) * 100,
      insights,
      risks
    };
  };

  const onSubmit = (values: FormValues) => {
    const res = calculate(values);
    if (res) setResult(res);
  };

  return (
    <div className="space-y-8">
      {/* Input Section */}
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <Briefcase className="h-5 w-5" />
            Investment Details
          </CardTitle>
          <CardDescription>
            Enter the deal parameters to see if the numbers stack up.
          </CardDescription>
        </CardHeader>
        <CardContent>
          <Form {...form}>
            <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-6">
              <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">

                {/* Acquisition */}
                <div className="space-y-4 md:col-span-2 lg:col-span-3">
                  <h4 className="text-sm font-semibold text-muted-foreground border-b pb-2">Acquisition Costs</h4>
                </div>
                <FormField control={form.control} name="purchasePrice" render={({ field }) => (
                  <FormItem><FormLabel>Purchase Price ($)</FormLabel><FormControl><Input type="number" {...field} onChange={e => field.onChange(parseFloat(e.target.value))} /></FormControl><FormMessage /></FormItem>
                )} />
                <FormField control={form.control} name="closingCosts" render={({ field }) => (
                  <FormItem><FormLabel>Closing Costs ($)</FormLabel><FormControl><Input type="number" {...field} onChange={e => field.onChange(parseFloat(e.target.value))} /></FormControl><FormMessage /></FormItem>
                )} />
                <FormField control={form.control} name="renovationCosts" render={({ field }) => (
                  <FormItem><FormLabel>Renovation Budget ($)</FormLabel><FormControl><Input type="number" {...field} onChange={e => field.onChange(parseFloat(e.target.value))} /></FormControl><FormMessage /></FormItem>
                )} />

                {/* Operating */}
                <div className="space-y-4 md:col-span-2 lg:col-span-3 mt-2">
                  <h4 className="text-sm font-semibold text-muted-foreground border-b pb-2">Income & Expenses</h4>
                </div>
                <FormField control={form.control} name="monthlyRent" render={({ field }) => (
                  <FormItem><FormLabel>Monthly Rent ($)</FormLabel><FormControl><Input type="number" {...field} onChange={e => field.onChange(parseFloat(e.target.value))} /></FormControl><FormMessage /></FormItem>
                )} />
                <FormField control={form.control} name="propertyTaxAnnual" render={({ field }) => (
                  <FormItem><FormLabel>Property Tax ($/yr)</FormLabel><FormControl><Input type="number" {...field} onChange={e => field.onChange(parseFloat(e.target.value))} /></FormControl><FormMessage /></FormItem>
                )} />
                <FormField control={form.control} name="insuranceAnnual" render={({ field }) => (
                  <FormItem><FormLabel>Insurance ($/yr)</FormLabel><FormControl><Input type="number" {...field} onChange={e => field.onChange(parseFloat(e.target.value))} /></FormControl><FormMessage /></FormItem>
                )} />
                <FormField control={form.control} name="hoaMonthly" render={({ field }) => (
                  <FormItem><FormLabel>HOA ($/mo)</FormLabel><FormControl><Input type="number" {...field} onChange={e => field.onChange(parseFloat(e.target.value))} /></FormControl><FormMessage /></FormItem>
                )} />
                <FormField control={form.control} name="managementFeeRate" render={({ field }) => (
                  <FormItem><FormLabel>Mgmt Fee (% of Rent)</FormLabel><FormControl><Input type="number" step="0.1" {...field} onChange={e => field.onChange(parseFloat(e.target.value))} /></FormControl><FormMessage /></FormItem>
                )} />
                <FormField control={form.control} name="vacancyRate" render={({ field }) => (
                  <FormItem><FormLabel>Vacancy Rate (%)</FormLabel><FormControl><Input type="number" step="0.1" {...field} onChange={e => field.onChange(parseFloat(e.target.value))} /></FormControl><FormMessage /></FormItem>
                )} />
                <FormField control={form.control} name="maintenanceRate" render={({ field }) => (
                  <FormItem><FormLabel>Maintenance (% of Rent)</FormLabel><FormControl><Input type="number" step="0.1" {...field} onChange={e => field.onChange(parseFloat(e.target.value))} /></FormControl><FormMessage /></FormItem>
                )} />

                {/* Financing */}
                <div className="space-y-4 md:col-span-2 lg:col-span-3 mt-2">
                  <h4 className="text-sm font-semibold text-muted-foreground border-b pb-2">Financing Details</h4>
                </div>
                <FormField control={form.control} name="downPaymentPercent" render={({ field }) => (
                  <FormItem><FormLabel>Down Payment (%)</FormLabel><FormControl><Input type="number" {...field} onChange={e => field.onChange(parseFloat(e.target.value))} /></FormControl><FormMessage /></FormItem>
                )} />
                <FormField control={form.control} name="interestRate" render={({ field }) => (
                  <FormItem><FormLabel>Interest Rate (%)</FormLabel><FormControl><Input type="number" step="0.1" {...field} onChange={e => field.onChange(parseFloat(e.target.value))} /></FormControl><FormMessage /></FormItem>
                )} />
                <FormField control={form.control} name="loanTermYears" render={({ field }) => (
                  <FormItem><FormLabel>Loan Term (Years)</FormLabel><FormControl><Input type="number" {...field} onChange={e => field.onChange(parseFloat(e.target.value))} /></FormControl><FormMessage /></FormItem>
                )} />

              </div>
              <Button type="submit" className="w-full">
                <Calculator className="mr-2 h-4 w-4" />
                Analyze Deal
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
                <BarChart3 className="h-8 w-8 text-primary" />
                <div>
                  <CardTitle>Investment Performance</CardTitle>
                  <CardDescription>Deal Analysis Summary</CardDescription>
                </div>
              </div>
            </CardHeader>
            <CardContent className="space-y-6">
              <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
                <div className="text-center p-6 bg-primary/5 rounded-xl border border-primary/20">
                  <p className="text-sm font-medium text-muted-foreground mb-1">Cash on Cash Return</p>
                  <span className="text-4xl font-extrabold text-primary">
                    {result.cashOnCash.toFixed(2)}%
                  </span>
                  <p className="text-xs text-muted-foreground mt-2">True ROI on money invested</p>
                </div>
                <div className="text-center p-6 bg-muted/50 rounded-xl border">
                  <p className="text-sm font-medium text-muted-foreground mb-1">Cap Rate (Net Yield)</p>
                  <span className="text-4xl font-bold text-foreground">
                    {result.capRate.toFixed(2)}%
                  </span>
                  <p className="text-xs text-muted-foreground mt-2">Unleveraged Return</p>
                </div>
                <div className="text-center p-6 bg-muted/50 rounded-xl border">
                  <p className="text-sm font-medium text-muted-foreground mb-1">Monthly Cash Flow</p>
                  <span className={`text-4xl font-bold ${result.monthlyCashFlow >= 0 ? 'text-green-600' : 'text-red-600'}`}>
                    {result.monthlyCashFlow >= 0 ? '+' : ''}${Math.floor(result.monthlyCashFlow).toLocaleString()}
                  </span>
                  <p className="text-xs text-muted-foreground mt-2">Net Profit per Month</p>
                </div>
              </div>

              <Separator />

              <div className="grid grid-cols-2 gap-4 text-sm">
                <div className="flex justify-between items-center bg-muted/30 p-2 rounded">
                  <span>Net Operating Income (NOI):</span>
                  <span className="font-semibold">${Math.floor(result.noiAnnual).toLocaleString()}/yr</span>
                </div>
                <div className="flex justify-between items-center bg-muted/30 p-2 rounded">
                  <span>Total Cash Invested:</span>
                  <span className="font-semibold">${Math.floor(result.totalInitialInvestment).toLocaleString()}</span>
                </div>
                <div className="flex justify-between items-center bg-muted/30 p-2 rounded">
                  <span>Expense Ratio:</span>
                  <span className="font-semibold">{result.expenseRatio.toFixed(1)}%</span>
                </div>
                <div className="flex justify-between items-center bg-muted/30 p-2 rounded">
                  <span>Gross Yield:</span>
                  <span className="font-semibold">{result.grossYield.toFixed(2)}%</span>
                </div>
              </div>
            </CardContent>
          </Card>

          {/* Smart Insights & Risks */}
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6 mb-6">
            <Card className="h-full">
              <CardHeader>
                <CardTitle className="flex items-center gap-2 text-xl text-primary">
                  <CheckCircle2 className="h-6 w-6" />
                  Deal Insights
                </CardTitle>
                <CardDescription>Professional analysis</CardDescription>
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
                  Risk Factors
                </CardTitle>
                <CardDescription>Potential pitfalls</CardDescription>
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
                    <span className="text-sm font-medium text-green-800 dark:text-green-300">Your inputs look realistic and safe.</span>
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
          <CardTitle className="flex items-center gap-2"><Info className="h-5 w-5" /> Understanding the Metrics</CardTitle>
          <CardDescription>Which number truly matters?</CardDescription>
        </CardHeader>
        <CardContent>
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div className="p-4 bg-blue-50 dark:bg-blue-900/10 rounded-lg border border-blue-100 dark:border-blue-900/20">
              <h4 className="font-semibold mb-2 flex items-center gap-2 text-blue-700 dark:text-blue-300">
                <Wallet className="h-4 w-4" /> Cash on Cash Return
              </h4>
              <p className="text-sm text-muted-foreground">The most practical metric for investors using leverage. It measures your annual cash profit divided by the actual cash you put into the deal. (Goal: &gt;8-10%)</p>
            </div>
            <div className="p-4 bg-amber-50 dark:bg-amber-900/10 rounded-lg border border-amber-100 dark:border-amber-900/20">
              <h4 className="font-semibold mb-2 flex items-center gap-2 text-amber-700 dark:text-amber-300">
                <Layers className="h-4 w-4" /> Cap Rate (Capitalization Rate)
              </h4>
              <p className="text-sm text-muted-foreground">Measures the property&apos;s raw profitability without considering your loan. It allows you to compare the asset quality itself against other properties in different locations. (Goal: 5-8%)</p>
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
              NOI = (Rent - Vacancy) - (Tax + Ins + HOA + Mgmt + Maint)
            </p>
            <p className="font-mono text-sm mt-2">
              Cap Rate = (NOI / Purchase Price) × 100
            </p>
            <p className="font-mono text-sm mt-2">
              Cash on Cash = ((NOI - Debt Service) / Total Invested Cash) × 100
            </p>
          </div>
          <p className="text-sm text-muted-foreground">
            We perform a full profit and loss (P&L) calculation. We start with Gross Potential Income, subtract Vacancy to get Effective Gross Income. Then we subtract all Operating Expenses to find NOI. Finally, subtract Mortgage Payments to find Cash Flow.
          </p>
        </CardContent>
      </Card>

      {/* Related Calculators */}
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2"><Calculator className="h-5 w-5" /> Related Financial Calculators</CardTitle>
          <CardDescription>Tools to deepen your analysis</CardDescription>
        </CardHeader>
        <CardContent>
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
            <Link href="/category/finance/property-appreciation-projection-calculator" className="block">
              <Card className="hover:shadow-md transition-shadow cursor-pointer h-full">
                <CardContent className="p-4">
                  <div className="flex items-center gap-3">
                    <TrendingUp className="h-5 w-5 text-blue-600" />
                    <div><p className="font-medium">Appreciation</p><p className="text-sm text-muted-foreground">Future value forecast</p></div>
                  </div>
                </CardContent>
              </Card>
            </Link>
            <Link href="/category/finance/real-estate-cap-rate-sensitivity-calculator" className="block">
              <Card className="hover:shadow-md transition-shadow cursor-pointer h-full">
                <CardContent className="p-4">
                  <div className="flex items-center gap-3">
                    <AlertTriangle className="h-5 w-5 text-orange-600" />
                    <div><p className="font-medium">Cap Rate Risk</p><p className="text-sm text-muted-foreground">Sensitivity analysis</p></div>
                  </div>
                </CardContent>
              </Card>
            </Link>
            <Link href="/category/finance/gross-rent-multiplier-grm-calculator" className="block">
              <Card className="hover:shadow-md transition-shadow cursor-pointer h-full">
                <CardContent className="p-4">
                  <div className="flex items-center gap-3">
                    <Calculator className="h-5 w-5 text-green-600" />
                    <div><p className="font-medium">GRM Calculator</p><p className="text-sm text-muted-foreground">Quick screening tool</p></div>
                  </div>
                </CardContent>
              </Card>
            </Link>
            <Link href="/category/finance/mortgage-payment-calculator" className="block">
              <Card className="hover:shadow-md transition-shadow cursor-pointer h-full">
                <CardContent className="p-4">
                  <div className="flex items-center gap-3">
                    <Home className="h-5 w-5 text-purple-600" />
                    <div><p className="font-medium">Mortgage Payment</p><p className="text-sm text-muted-foreground">Estimate debt service</p></div>
                  </div>
                </CardContent>
              </Card>
            </Link>
            <Link href="/category/finance/dscr-calculator" className="block">
              <Card className="hover:shadow-md transition-shadow cursor-pointer h-full">
                <CardContent className="p-4">
                  <div className="flex items-center gap-3">
                    <Briefcase className="h-5 w-5 text-teal-600" />
                    <div><p className="font-medium">DSCR</p><p className="text-sm text-muted-foreground">Lender qualification</p></div>
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
        <meta itemProp="name" content="Rental Yield Calculator: Cash on Cash & Cap Rate Analysis" />
        <meta itemProp="description" content="A professional tool for analyzing rental property investments. Calculate Cash on Cash Return, Cap Rate, and Monthly Cash Flow with adjustable expense ratios." />
        <meta itemProp="author" content="Financial Analysis Team" />

        <h1 className="text-3xl md:text-4xl font-extrabold text-foreground mb-4" itemProp="headline">Analyzing Rental Property Deals Like a Pro</h1>
        <p className="text-lg italic text-muted-foreground">In real estate investing, "Cash Flow is King." Here is how to ensure your kingdom is profitable.</p>

        <h2 className="text-2xl font-bold text-foreground mt-8 mb-4">Table of Contents</h2>
        <ul className="list-disc ml-6 space-y-2 text-primary intro-links">
          <li><a href="#the-1-percent-rule" className="hover:underline">The 1% Rule (Quick Screen)</a></li>
          <li><a href="#cash-on-cash" className="hover:underline">Cash on Cash Return (The Real ROI)</a></li>
          <li><a href="#cap-rate" className="hover:underline">Cap Rate (Asset Quality)</a></li>
          <li><a href="#hidden-killers" className="hover:underline">Profit Killers: Vacancy & Maintenance</a></li>
        </ul>
        <Separator className="my-6" />

        <h2 id="the-1-percent-rule" className="text-2xl font-bold text-foreground pt-8">The 1% Rule: A Quick Screening Tool</h2>
        <p>Before entering detailed data, investors often use the <strong>1% Rule</strong>. It states that the monthly rent should be at least 1% of the purchase price. This is a heuristic, not a law, but it saves time filtering deal flow.</p>
        <ul className="list-disc ml-6 mt-2 space-y-1">
          <li><strong>Example:</strong> A $200,000 house should rent for $2,000/month.</li>
          <li><strong>Why?</strong> If it rents for less (e.g., $1,200, or 0.6%), it is very difficult to cover the mortgage, taxes, insurance, and maintenance and still have positive cash flow.</li>
        </ul>
        <p className="mt-4">In today's high-interest-rate environment, the 1% rule is becoming harder to find in turnkey markets. Investors may need to look for value-add opportunities or accept slightly lower yields in exchange for appreciation.</p>

        <h2 id="cash-on-cash" className="text-2xl font-bold text-foreground pt-8">Cash on Cash Return: Your True Scorecard</h2>
        <p>This is the most critical metric for most investors using leverage. It answers: <em>"For every dollar I put in, how many cents do I get back each year?"</em></p>
        <p className="mt-2">Unlike "ROI" which might include vague appreciation estimates, Cash on Cash is tangible. It uses your actual <strong>Cash Invested</strong> (Down payment + Closing Costs + Rehab) and your actual <strong>Cash Flow</strong> (Rent - Expenses - Mortgage).</p>
        <div className="bg-muted p-4 rounded-lg mt-4">
          <h4 className="font-semibold text-foreground">Target Rates</h4>
          <p className="text-sm mt-1">Historically, stocks return 7-10% (nominal). Therefore, real estate investors typically aim for <strong>8-12% Cash on Cash</strong> to justify the extra work (tenants, toilets, trash) of owning property. If your CoC return is 3%, you might be better off in a high-yield savings account (risk-free).</p>
        </div>

        <h2 className="text-2xl font-bold text-foreground pt-8">Gross Yield vs. Net Yield vs. IRR</h2>
        <p>Real estate has an alphabet soup of metrics. Here is how they differ:</p>
        <ul className="space-y-4 mt-2">
          <li>
            <strong>Gross Yield:</strong> <code>(Annual Rent / Price)</code>. It is the crudest measure. It ignores expenses. Useful only for very high-level comparison between neighborhoods.
          </li>
          <li>
            <strong>Net Yield (Cap Rate):</strong> <code>(NOI / Price)</code>. This measures the property's efficiency. It accounts for taxes, insurance, and maintenance but ignores debt. It allows you to compare a deal in Texas vs. Ohio.
          </li>
          <li>
            <strong>Cash on Cash:</strong> <code>(Cash Flow / Cash Invested)</code>. This measures <em>your</em> efficiency. It accounts for debt. This is what you pay your bills with.
          </li>
          <li>
            <strong>IRR (Internal Rate of Return):</strong> This is the total return over the life of the investment, including cash flow, principal paydown, and appreciation upon sale. It creates a "time-weighted" return.
          </li>
        </ul>

        <h2 id="cap-rate" className="text-2xl font-bold text-foreground pt-8">Cap Rate (Capitalization Rate) Deep Dive</h2>
        <p>Cap rate measures the property, not the investor's financing. It is simply <code>NOI / Price</code>.</p>
        <p className="mt-2">Think of it as the "risk premium" of a neighborhood.</p>
        <ul className="list-disc ml-6 mt-2 space-y-1">
          <li><strong>Low Cap Rate (3-4%):</strong> Class A, prime locations (e.g., Beverly Hills). Low risk, high appreciation, low cash flow.</li>
          <li><strong>High Cap Rate (8-12%):</strong> Class C/D, rougher neighborhoods. Higher risk of vacancy/eviction, low appreciation, high theoretical cash flow (if they pay).</li>
        </ul>
        <p className="mt-2 text-sm text-muted-foreground">Pro Tip: Interest rates affect Cap Rates. If you borrow at 7% to buy a 5% Cap Rate property, you have "Negative Leverage"—you lose money on every dollar borrowed.</p>

        <h2 id="hidden-killers" className="text-2xl font-bold text-foreground pt-8">The Profit Killers: Expenses You Forgot</h2>
        <p>Many beginners assume 100% occupancy and zero repairs. This is why they fail. The "50% Rule" suggests that, over time, 50% of your gross rent will go to operating expenses (not including the mortgage). Watch out for:</p>
        <ul className="list-disc ml-6 mt-2 space-y-1">
          <li><strong>Vacancy (5-8%):</strong> You WILL have empty months between tenants. Even in hot markets, turnover takes time (painting, cleaning, showing). Budget 8.3% (1 month per year) to be safe.</li>
          <li><strong>Maintenance (5-10%):</strong> Roofs leak. Heaters die. Carpet wears out. You must set aside ~5-10% of gross rent for these inevitable costs. CapEx (Capital Expenditures) references the big ticket items (Roof, HVAC) that happen every 15 years.</li>
          <li><strong>Management (8-10%):</strong> Even if you manage it yourself, "charge" yourself this fee in calculations. Your time is not free. If you don't factor this in, you are just buying yourself a low-paying part-time job.</li>
          <li><strong>Utilities:</strong> In multifamily, landlords often pay water/sewer/trash. In single-family, tenants usually pay. Know the local norms.</li>
        </ul>

        <h2 className="text-2xl font-bold text-foreground pt-8">Short-Term vs. Long-Term Rentals</h2>
        <p>The rise of Airbnb has changed the yield game. Short-term rentals (STRs) can often generate 2-3x the gross revenue of a long-term rental.</p>
        <p className="mt-2"><strong>However, expenses are also higher:</strong></p>
        <ul className="list-disc ml-6 mt-2 space-y-1">
          <li>Vacancy is higher and more seasonal.</li>
          <li>Utilities are paid by the landlord.</li>
          <li>Cleaning/Turnover costs are massive.</li>
          <li>Furnishing is a large upfront CapEx.</li>
        </ul>
        <p className="mt-2">Use this calculator for Long-Term rentals. For STRs, you need to adjust the "Vacancy" and "Management" (often 20-30%) inputs significantly.</p>
      </section>

      {/* FAQ */}
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2"><Info className="h-5 w-5" /> Frequently Asked Questions</CardTitle>
          <CardDescription>Common questions about rental profitability</CardDescription>
        </CardHeader>
        <CardContent className="space-y-6">
          <div>
            <h4 className="font-semibold text-lg mb-2">Can I count my principal payment as profit?</h4>
            <p className="text-muted-foreground">Technically, yes (it enters your Net Worth), but it is not <em>Cash Flow</em>. You cannot spend principal paydown at the grocery store. Cash on Cash typically looks at liquid cash only. If you include principal paydown + appreciation, you are calculating "Total Return".</p>
          </div>
          <div>
            <h4 className="font-semibold text-lg mb-2">What is a "good" expense ratio?</h4>
            <p className="text-muted-foreground">The "50% Rule" suggests that over time, operating expenses (taxes, insurance, repairs, vacancy) will eat up 50% of your gross rent. If your ratio is significantly lower (e.g., 20%), you are likely underestimating costs, unless the tenant pays absolutely everything (Triple Net Lease).</p>
          </div>
          <div>
            <h4 className="font-semibold text-lg mb-2">What is the "BRRRR" method?</h4>
            <p className="text-muted-foreground">Buy, Rehab, Rent, Refinance, Repeat. It involves buying a fixer-upper, adding value (forced appreciation), and then refinancing to pull your original cash back out. This calculator helps with the "Rent" and "Refinance" steps by ensuring the property cash flows after the new loan is placed.</p>
          </div>
          <div>
            <h4 className="font-semibold text-lg mb-2">Should I buy for Cash Flow or Appreciation?</h4>
            <p className="text-muted-foreground">New investors should prioritize Cash Flow. It keeps you safe during downturns. Appreciation is the icing on the cake, but you can't eat icing for dinner if the mortgage can't be paid and the bank forecloses. Experienced investors with deep pockets often play the appreciation game (buying break-even properties in prime locations).</p>
          </div>
          <div>
            <h4 className="font-semibold text-lg mb-2">How do financing terms affect my yield?</h4>
            <p className="text-muted-foreground">Lower interest rates increase cash flow. Longer amortization (30yr vs 15yr) lowers monthly payments, boosting cash flow. Higher down payments lower risk but lower your Cash on Cash return (less leverage). Interest-only loans maximize cash flow but build no equity.</p>
          </div>
          <div>
            <h4 className="font-semibold text-lg mb-2">What is DSCR?</h4>
            <p className="text-muted-foreground">Debt Service Coverage Ratio. It compares NOI to Debt Service. Lenders want to see a DSCR &gt; 1.25, meaning the property generates 25% more income than the mortgage payment. If DSCR &lt; 1, the property loses money.</p>
          </div>
          <div>
            <h4 className="font-semibold text-lg mb-2">Why is my Cash-on-Cash infinite?</h4>
            <p className="text-muted-foreground">If you have $0 invested (e.g., you got a 100% loan or seller financing covers the down payment), your divisor is 0. This is an "Infinite Return." It&apos;s the holy grail of investing, but rare.</p>
          </div>
        </CardContent>
      </Card>

      {/* Usage Section */}
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2"><Briefcase className="h-5 w-5" /> Usage of this Calculator</CardTitle>
          <CardDescription>Who is this tool for?</CardDescription>
        </CardHeader>
        <CardContent className="space-y-6">
          <div>
            <h4 className="flex items-center gap-2 font-semibold text-lg mb-3">
              <CheckCircle2 className="h-5 w-5 text-blue-600" />
              Who Should Use This?
            </h4>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div className="p-3 bg-muted/50 rounded-lg">
                <strong className="block text-primary mb-1">Buy & Hold Investors</strong>
                <span className="text-sm text-muted-foreground">Analyzing rental properties for long-term portfolio addition.</span>
              </div>
              <div className="p-3 bg-muted/50 rounded-lg">
                <strong className="block text-primary mb-1">House Hackers</strong>
                <span className="text-sm text-muted-foreground">Evaluating if renting out a portion of their home covers the mortgage.</span>
              </div>
            </div>
          </div>

          <Separator />

          <div>
            <h4 className="flex items-center gap-2 font-semibold text-lg mb-3">
              <AlertTriangle className="h-5 w-5 text-amber-600" />
              Limitations
            </h4>
            <ul className="space-y-2 text-sm text-muted-foreground">
              <li className="flex gap-2"><CheckCircle2 className="h-4 w-4 text-amber-500 shrink-0" /> <strong>Tax Benefits:</strong> This calculator does not model depreciation tax shields or income tax brackets, which often improve the final return.</li>
              <li className="flex gap-2"><CheckCircle2 className="h-4 w-4 text-amber-500 shrink-0" /> <strong>Appreciation:</strong> This is a snapshot of Year 1 performance. It does not project future rent increases or property value growth.</li>
            </ul>
          </div>
        </CardContent>
      </Card>

      {/* Summary */}
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2"><BarChart3 className="h-5 w-5" /> Summary</CardTitle>
        </CardHeader>
        <CardContent className="text-sm text-muted-foreground">
          <p>Successful real estate investing creates a gap between income and expenses. This calculator forces you to honestly account for all expenses—including the invisible ones like vacancy and maintenance—to reveal the true profitability of a potential deal.</p>
        </CardContent>
      </Card>
    </div>
  );
}

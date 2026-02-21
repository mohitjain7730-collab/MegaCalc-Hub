'use client';

import { useState } from 'react';
import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import { z } from 'zod';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Form, FormControl, FormField, FormItem, FormLabel, FormMessage } from '@/components/ui/form';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Alert, AlertDescription, AlertTitle } from '@/components/ui/alert';
import { Separator } from '@/components/ui/separator';
import { Badge } from '@/components/ui/badge';
import {
  Calculator,
  Banknote,
  TrendingUp,
  Calendar,
  Percent,
  AlertTriangle,
  CheckCircle2,
  Info,
  BarChart,
  Home,
  ArrowRight,
  Shield,
  Briefcase,
  HelpCircle,
  Target // Added Target for scenario icon
} from 'lucide-react';
import Link from 'next/link';
import { cn } from '@/lib/utils';

// --- Schema ---
const formSchema = z.object({
  loanAmount: z.number().min(1000, "Loan amount must be significant"),
  interestRate: z.number().min(0.1, "Rate must be positive").max(20, "Rate seems excessive"),
  totalTermYears: z.number().min(5).max(40, "Term typically 10-40 years"),
  ioPeriodYears: z.number().min(1).max(20, "IO period typically 1-10 years"),
}).refine(data => data.ioPeriodYears < data.totalTermYears, {
  message: "IO Period must be shorter than Total Term",
  path: ["ioPeriodYears"],
});

type FormValues = z.infer<typeof formSchema>;

interface CalculationResult {
  ioPayment: number;
  amortizedPayment: number;
  paymentIncreasePercent: number;
  totalInterestIO: number;
  totalInterestAmortized: number;
  grandTotalPaid: number;
  paymentShockDate: string;
  equityGap: number; // How much equity you LOST by not paying principal during IO period
}

export default function InterestOnlyCalculator() {
  const [result, setResult] = useState<CalculationResult | null>(null);

  const form = useForm<FormValues>({
    resolver: zodResolver(formSchema),
    defaultValues: {
      loanAmount: 500000,
      interestRate: 6.5,
      totalTermYears: 30,
      ioPeriodYears: 10,
    },
  });

  const calculate = (values: FormValues) => {
    // 1. IO Phase
    const monthlyRate = values.interestRate / 100 / 12;
    const ioPayment = values.loanAmount * monthlyRate;

    // 2. Amortization Phase
    // Remaining Principal is still 'loanAmount'
    // Remaining Term = Total Term - IO Period
    const remainingMonths = (values.totalTermYears - values.ioPeriodYears) * 12;

    // Formula: M = P [ i(1 + i)^n ] / [ (1 + i)^n – 1 ]
    const numerator = values.loanAmount * monthlyRate * Math.pow(1 + monthlyRate, remainingMonths);
    const denominator = Math.pow(1 + monthlyRate, remainingMonths) - 1;
    const amortizedPayment = numerator / denominator;

    // 3. Totals
    const ioMonths = values.ioPeriodYears * 12;
    const totalInterestIOPhase = ioPayment * ioMonths;
    const totalPaidAmortizedPhase = amortizedPayment * remainingMonths;
    const totalInterestAmortizedPhase = totalPaidAmortizedPhase - values.loanAmount; // Principal is paid back here entirely

    // 4. Comparison (What if it was a standard 30yr fixed from day 1?)
    const standardMonths = values.totalTermYears * 12;
    const stdNumerator = values.loanAmount * monthlyRate * Math.pow(1 + monthlyRate, standardMonths);
    const stdDenominator = Math.pow(1 + monthlyRate, standardMonths) - 1;
    const standardPayment = stdNumerator / stdDenominator;

    // Equity Gap: After 'ioPeriodYears', a standard loan would have paid down X amount
    // Principal Paid in Std Loan after N months?
    // Using simple loop for accuracy
    let stdBalance = values.loanAmount;
    for (let i = 0; i < ioMonths; i++) {
      let int = stdBalance * monthlyRate;
      let prin = standardPayment - int;
      stdBalance -= prin;
    }
    const equityLost = values.loanAmount - stdBalance; // In IO loan, balance is still full amount.

    const today = new Date();
    today.setFullYear(today.getFullYear() + values.ioPeriodYears);

    setResult({
      ioPayment,
      amortizedPayment,
      paymentIncreasePercent: ((amortizedPayment - ioPayment) / ioPayment) * 100,
      totalInterestIO: totalInterestIOPhase,
      totalInterestAmortized: totalInterestAmortizedPhase,
      grandTotalPaid: totalInterestIOPhase + totalPaidAmortizedPhase,
      paymentShockDate: today.toLocaleDateString('en-US', { month: 'long', year: 'numeric' }),
      equityGap: equityLost
    });
  };

  return (
    <div className="space-y-8">

      {/* Input Section */}
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <Home className="h-5 w-5" />
            Loan Parameters
          </CardTitle>
          <CardDescription>
            Configure the terms of your Interest-Only (IO) Loan.
          </CardDescription>
        </CardHeader>
        <CardContent>
          <Form {...form}>
            <form onSubmit={form.handleSubmit(calculate)} className="space-y-6">

              <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                <FormField
                  control={form.control}
                  name="loanAmount"
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel>Loan Amount ($)</FormLabel>
                      <FormControl>
                        <Input type="number" placeholder="500000" {...field} onChange={e => field.onChange(parseFloat(e.target.value) || 0)} />
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
                      <FormLabel>Interest Rate (%)</FormLabel>
                      <FormControl>
                        <Input type="number" placeholder="6.5" step="0.125" {...field} onChange={e => field.onChange(parseFloat(e.target.value) || 0)} />
                      </FormControl>
                      <FormMessage />
                    </FormItem>
                  )}
                />
                <FormField
                  control={form.control}
                  name="totalTermYears"
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel>Total Loan Term (Years)</FormLabel>
                      <FormControl>
                        <Input type="number" placeholder="30" {...field} onChange={e => field.onChange(parseFloat(e.target.value) || 0)} />
                      </FormControl>
                      <FormMessage />
                    </FormItem>
                  )}
                />
                <FormField
                  control={form.control}
                  name="ioPeriodYears"
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel>Interest-Only Period (Years)</FormLabel>
                      <FormControl>
                        <Input type="number" placeholder="10" {...field} onChange={e => field.onChange(parseFloat(e.target.value) || 0)} />
                      </FormControl>
                      <CardDescription>Duration of reduced payments</CardDescription>
                      <FormMessage />
                    </FormItem>
                  )}
                />
              </div>

              <Button type="submit" className="w-full text-lg h-12">
                <Calculator className="mr-2 h-5 w-5" />
                Analyze Payment Shock
              </Button>
            </form>
          </Form>
        </CardContent>
      </Card>

      {/* Results Section */}
      {result && (
        <div className="space-y-6">

          {/* Main Shock Alert */}
          <Alert className={cn(
            "border-l-8",
            result.paymentIncreasePercent > 50 ? "bg-red-50 border-red-600" : "bg-amber-50 border-amber-500"
          )}>
            <div className="flex items-start gap-4">
              <AlertTriangle className={cn("h-6 w-6 mt-1", result.paymentIncreasePercent > 50 ? "text-red-600" : "text-amber-600")} />
              <div>
                <AlertTitle className="text-xl font-bold">
                  Prepare for Payment Shock!
                </AlertTitle>
                <AlertDescription className="text-base mt-2">
                  On <strong>{result.paymentShockDate}</strong>, your monthly payment will jump by <span className="font-bold">{result.paymentIncreasePercent.toFixed(1)}%</span>.
                  It will increase from <span className="font-mono font-bold">${result.ioPayment.toFixed(0)}</span> to <span className="font-mono font-bold">${result.amortizedPayment.toFixed(0)}</span> overnight.
                </AlertDescription>
              </div>
            </div>
          </Alert>

          {/* Comparison Cards */}
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">

            {/* Phase 1 */}
            <Card className="bg-blue-50/50 dark:bg-blue-900/10 border-blue-200">
              <CardHeader>
                <div className="flex justify-between items-start">
                  <div>
                    <CardTitle className="text-blue-700 dark:text-blue-400">Phase 1: Interest Only</CardTitle>
                    <CardDescription>Years 1 - {form.getValues('ioPeriodYears')}</CardDescription>
                  </div>
                  <Badge variant="secondary" className="bg-blue-100 text-blue-700">Current Phase</Badge>
                </div>
              </CardHeader>
              <CardContent>
                <div className="text-4xl font-bold text-blue-800 dark:text-blue-300 mb-2">
                  ${result.ioPayment.toFixed(2)}
                </div>
                <p className="text-sm text-muted-foreground mb-4">Per Month</p>

                <div className="bg-white dark:bg-black/20 p-3 rounded-lg text-sm space-y-2">
                  <div className="flex justify-between">
                    <span>Principal Paid:</span>
                    <span className="font-mono">$0.00</span>
                  </div>
                  <div className="flex justify-between text-destructive">
                    <span>Interest Paid:</span>
                    <span className="font-mono">${result.ioPayment.toFixed(2)}</span>
                  </div>
                </div>
              </CardContent>
            </Card>

            {/* Phase 2 */}
            <Card className="bg-orange-50/50 dark:bg-orange-900/10 border-orange-200">
              <CardHeader>
                <div className="flex justify-between items-start">
                  <div>
                    <CardTitle className="text-orange-700 dark:text-orange-400">Phase 2: Amortization</CardTitle>
                    <CardDescription>Years {form.getValues('ioPeriodYears') + 1} - {form.getValues('totalTermYears')}</CardDescription>
                  </div>
                  <Badge variant="outline" className="border-orange-200 text-orange-700">Future Reality</Badge>
                </div>
              </CardHeader>
              <CardContent>
                <div className="text-4xl font-bold text-orange-800 dark:text-orange-300 mb-2">
                  ${result.amortizedPayment.toFixed(2)}
                </div>
                <p className="text-sm text-muted-foreground mb-4">Per Month (+${(result.amortizedPayment - result.ioPayment).toFixed(0)})</p>

                <div className="bg-white dark:bg-black/20 p-3 rounded-lg text-sm space-y-2">
                  <div className="flex justify-between">
                    <span>Principal Paid:</span>
                    <span className="font-mono">Eventually 100%</span>
                  </div>
                  <div className="flex justify-between text-muted-foreground">
                    <span>Loan Term Left:</span>
                    <span className="font-mono">{form.getValues('totalTermYears') - form.getValues('ioPeriodYears')} Years</span>
                  </div>
                </div>
              </CardContent>
            </Card>

          </div>

          {/* Equity & Total Costs */}
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <Banknote className="h-5 w-5" />
                The Cost of Flexibility
              </CardTitle>
              <CardDescription>What you lose by choosing IO over a standard mortgage</CardDescription>
            </CardHeader>
            <CardContent className="space-y-6">
              <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
                <div className="p-4 border rounded-xl">
                  <p className="text-sm text-muted-foreground mb-1">Total Payment Over Life</p>
                  <p className="text-2xl font-bold">${result.grandTotalPaid.toLocaleString()}</p>
                  <p className="text-xs text-muted-foreground mt-1">Total cash outflow</p>
                </div>
                <div className="p-4 border rounded-xl bg-muted/30">
                  <p className="text-sm text-muted-foreground mb-1">Equity "Lost" in Phase 1</p>
                  <p className="text-2xl font-bold text-amber-600">${Math.round(result.equityGap).toLocaleString()}</p>
                  <p className="text-xs text-muted-foreground mt-1">Principal you <em>would have</em> paid</p>
                </div>
                <div className="p-4 border rounded-xl">
                  <p className="text-sm text-muted-foreground mb-1">Total Interest Cost</p>
                  <p className="text-2xl font-bold text-destructive">${(result.totalInterestIO + result.totalInterestAmortized).toLocaleString()}</p>
                </div>
              </div>
            </CardContent>
          </Card>

          {/* Insights Grid */}
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            <Card className="h-full">
              <CardHeader>
                <CardTitle className="flex items-center gap-2 text-primary">
                  <Briefcase className="h-5 w-5" />
                  Strategic Use Cases
                </CardTitle>
              </CardHeader>
              <CardContent className="space-y-3">
                <div className="text-sm">
                  <strong className="block mb-1 text-foreground">Commission-Based Income</strong>
                  <p className="text-muted-foreground">IO loans allow flexibility. During low income months, pay the minimum IO. During high bonus months, make large principal payments voluntarily.</p>
                </div>
                <Separator />
                <div className="text-sm">
                  <strong className="block mb-1 text-foreground">Short-Term Investors</strong>
                  <p className="text-muted-foreground">If you plan to sell the property in 5-7 years, an IO loan maximizes cash flow while you hold it, assuming the property value (equity) appreciates from market forces.</p>
                </div>
              </CardContent>
            </Card>

            <Card className="h-full border-red-100 bg-red-50/10 dark:border-red-900/20">
              <CardHeader>
                <CardTitle className="flex items-center gap-2 text-red-600 dark:text-red-400">
                  <AlertTriangle className="h-5 w-5" />
                  The "Underwater" Risk
                </CardTitle>
              </CardHeader>
              <CardContent>
                <p className="text-sm text-red-800 dark:text-red-300 leading-relaxed">
                  Because you are not paying down principal, if the real estate market drops by even 1%, you immediately have negative equity (owe more than the house is worth). In a standard loan, your monthly principal payments act as a buffer against small market dips.
                </p>
              </CardContent>
            </Card>
          </div>

        </div>
      )}

      {/* Understanding Inputs */}
      <Card className="mb-6">
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <Info className="h-5 w-5" />
            Understanding Loan Mechanics
          </CardTitle>
          <CardDescription>
            Key terms used in this calculator
          </CardDescription>
        </CardHeader>
        <CardContent>
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div className="p-4 bg-muted/50 rounded-lg">
              <h4 className="font-semibold mb-2 flex items-center gap-2 text-blue-700 dark:text-blue-400">
                <Calendar className="h-4 w-4" /> IO Period (Recast Date)
              </h4>
              <p className="text-sm text-muted-foreground">
                The specific date when the bank recalculates your loan. They take the <em>entire</em> original balance and divide it over your <em>remaining</em> years, causing the payment spike.
              </p>
            </div>
            <div className="p-4 bg-muted/50 rounded-lg">
              <h4 className="font-semibold mb-2 flex items-center gap-2 text-indigo-700 dark:text-indigo-400">
                <TrendingUp className="h-4 w-4" /> Amortization
              </h4>
              <p className="text-sm text-muted-foreground">
                The process of paying off debt over time in regular installments of interest and principal sufficient to repay the loan in full by maturity. IO loans delay this process.
              </p>
            </div>
          </div>
        </CardContent>
      </Card>

      {/* Related Calculators */}
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <Calculator className="h-5 w-5" />
            Related Mortgage Tools
          </CardTitle>
        </CardHeader>
        <CardContent>
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
            {[
              { name: "Mortgage Payment", url: "/finance/mortgage-payment-calculator", icon: <Home className="h-5 w-5 text-indigo-500" />, desc: "Standard P&I Calculation" },
              { name: "Amortization Schedule", url: "/finance/amortization-schedule-generator", icon: <Calendar className="h-5 w-5 text-blue-500" />, desc: "Year-by-year breakdown" },
              { name: "Home Affordability", url: "/finance/home-affordability-calculator", icon: <Shield className="h-5 w-5 text-green-500" />, desc: "What can you borrow?" },
              { name: "DTI Calculator", url: "/finance/dscr-calculator", icon: <Percent className="h-5 w-5 text-red-500" />, desc: "Loan qualification check" },
            ].map((item, i) => (
              <Link key={i} href={item.url} className="block group">
                <Card className="hover:shadow-md transition-all h-full">
                  <CardContent className="p-4 flex gap-3">
                    {item.icon}
                    <div>
                      <p className="font-semibold group-hover:text-primary transition-colors">{item.name}</p>
                      <p className="text-xs text-muted-foreground">{item.desc}</p>
                    </div>
                  </CardContent>
                </Card>
              </Link>
            ))}
          </div>
        </CardContent>
      </Card>

      {/* Complete Guide Section */}
      <section className="space-y-6 text-muted-foreground leading-relaxed bg-card p-6 md:p-10 rounded-lg shadow-sm border" itemScope itemType="https://schema.org/Article">
        <meta itemProp="headline" content="Interest-Only Mortgages: The Strategic Borrower's Guide" />
        <meta itemProp="author" content="Real Estate Finance Team" />
        <meta itemProp="datePublished" content="2025-09-01" />

        <h1 className="text-3xl md:text-4xl font-extrabold text-foreground mb-6">Interest-Only Mortgages: Smart Leverage or Financial Trap?</h1>
        <p className="text-lg text-foreground/80">
          An Interest-Only (IO) mortgage is a specific loan structure where you are mandated to pay <em>only</em> the interest portion of the loan for a set period (typically 5, 7, or 10 years). This lowers your monthly obligation initially but guarantees a significant "Payment Shock" later when the principal repayment kicks in.
        </p>

        <div className="my-8 p-6 bg-muted/30 rounded-xl border">
          <h2 className="text-2xl font-bold text-foreground mb-4">Table of Contents</h2>
          <ul className="grid grid-cols-1 md:grid-cols-2 gap-2 text-primary font-medium">
            <li><a href="#mechanics" className="hover:underline flex items-center gap-2"><ArrowRight className="h-4 w-4" /> How The "Reset" Works</a></li>
            <li><a href="#shock" className="hover:underline flex items-center gap-2"><ArrowRight className="h-4 w-4" /> Understanding Payment Shock</a></li>
            <li><a href="#users" className="hover:underline flex items-center gap-2"><ArrowRight className="h-4 w-4" /> Who Should Use IO Loans?</a></li>
            <li><a href="#risks" className="hover:underline flex items-center gap-2"><ArrowRight className="h-4 w-4" /> The Negative Equity Danger</a></li>
          </ul>
        </div>

        <h2 id="mechanics" className="text-2xl font-bold text-foreground mt-8 mb-4">How The "Reset" Works</h2>
        <p>
          Most borrowers misunderstand the reset. They assume that after the 10-year IO period, they just start paying a normal 30-year mortgage payment. <strong className="text-red-600">This is false.</strong>
        </p>
        <p>
          When the loan resets, you don't get 30 years to pay back the principal. You only get the <em>remaining</em> time. On a 30-year loan with a 10-year IO period, you must payback 100% of the loan balance in just 20 years. This compression forces the monthly principal payment to be much higher than a standard loan.
        </p>

        <h2 id="shock" className="text-2xl font-bold text-foreground mt-8 mb-4">Payment Shock Severity</h2>
        <p>
          As the calculator demonstrates, the jump is rarely small. It is common to see payments increase by 40% to 60% overnight.
        </p>
        <p>
          <em>Example:</em> You are used to paying $2,000/month for 10 years. Suddenly, on month 121, the bill is $3,100. If your income hasn't increased proportionally, this causes default. This specific shock was a major driver of the 2008 Financial Crisis.
        </p>

        <h2 id="users" className="text-2xl font-bold text-foreground mt-8 mb-4">Who Should Use This Product?</h2>
        <p>
          Despite the risks, IO loans are powerful tools for the right borrower:
        </p>
        <ul className="list-disc ml-6 space-y-2 mt-4">
          <li><strong>High-Net-Worth Individuals:</strong> Those who prefer to keep cash liquid for high-yield investments rather than trapping it in home equity (illiquid).</li>
          <li><strong>Commission/Bonus Earners:</strong> People receiving large annual bonuses can pay just interest monthly for cash flow, then make a lump-sum principal paydown once a year.</li>
          <li><strong>Real Estate Investors:</strong> Investors flipping a house or stabilizing a rental property want minimizing holding costs (cash outflow) during the renovation phase.</li>
        </ul>

        <h2 id="risks" className="text-2xl font-bold text-foreground mt-8 mb-4">The Negative Equity Danger</h2>
        <p>
          In a normal mortgage, every payment buys you a tiny slice of the house. If the market drops 5%, you might remain safe because you've paid off 7% of the loan. In an IO loan, you own 0% of the principal. A 5% market drop means you are immediately "underwater"—you cannot sell the house without bringing cash to the closing table.
        </p>
      </section>

      {/* FAQ Section */}
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <HelpCircle className="h-5 w-5" />
            Frequently Asked Questions
          </CardTitle>
          <CardDescription>
            Common queries about IO loans
          </CardDescription>
        </CardHeader>
        <CardContent className="space-y-6">
          {[
            { q: "Can I pay principal during the IO period?", a: "Yes! This is the smartest way to use an IO loan. You are not *required* to pay principal, but you *can*. This reduces the balance so when the reset happens, the payment shock is smaller." },
            { q: "Do I build equity with an interest-only loan?", a: "Only through market appreciation. If the house value goes up, you have equity. If it stays flat, you have $0 equity (beyond your down payment). You build no equity through payments." },
            { q: "Is interest-only easier to qualify for?", a: "No, actually harder. Because they are riskier, banks typically require higher credit scores (700-720+), larger down payments (20-25%), and significant cash reserves." },
            { q: "Can I refinance when the IO period ends?", a: "That is the plan for most borrowers. However, it relies on two gambles: 1) That your home value hasn't dropped, and 2) That you still have a job/income to qualify. If either fails, you are stuck with the high payment." },
            { q: "Are interest rates higher for IO loans?", a: "Typically, yes. You might pay 0.25% to 0.50% higher rate for the privilege of lower monthly payments." },
            { q: "What is a 'Balloon Payment'?", a: "Some IO loans don't amortize at the end; the ENTIRE balance comes due at once. This calculator assumes a standard IO-to-Amortizing structure, which is more common for residential mortgages." },
            { q: "Why did 2008 give these loans a bad name?", a: "In 2008, subprime lenders gave IO loans to people who couldn't afford the *future* amortized payment, assuming they would just refinance later. When home values crashed, they couldn't refinance and defaulted." },
            { q: "How long is the typical IO period?", a: "10 years is the industry standard (on a 30-year loan), written as '10/20 Io'. 5-year and 7-year periods exist but are less common." },
            { q: "Does the calculator account for taxes and insurance?", a: "No. This calculates Principal & Interest (P&I) only. Don't forget to add property taxes and homeowner's insurance to get your true monthly cost." },
            { q: "Is the interest tax-deductible?", a: "Generally yes, on the first $750k of mortgage debt (in the US), just like a standard mortgage. Consult a tax pro." },
          ].map((item, i) => (
            <div key={i}>
              <h4 className="font-semibold text-base mb-1 text-foreground">{item.q}</h4>
              <p className="text-sm text-muted-foreground leading-relaxed">{item.a}</p>
            </div>
          ))}
        </CardContent>
      </Card>

      {/* Usage Section */}
      <Card className="mb-6">
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <Briefcase className="h-5 w-5" />
            Who Should Use This Calculator?
          </CardTitle>
          <CardDescription>
            Scenarios where IO modeling is essential
          </CardDescription>
        </CardHeader>
        <CardContent className="space-y-6">
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div className="p-3 bg-muted/50 rounded-lg border border-border/50">
              <strong className="block text-primary mb-1">Luxury Homebuyers</strong>
              <span className="text-sm text-muted-foreground">Planning to buy a high-value property and want to minimize monthly cashflow while investing capital elsewhere.</span>
            </div>
            <div className="p-3 bg-muted/50 rounded-lg border border-border/50">
              <strong className="block text-primary mb-1">ARM Holders</strong>
              <span className="text-sm text-muted-foreground">Borrowers with Adjustable Rate Mortgages often have IO features. Use this to prepare for the recast.</span>
            </div>
            <div className="p-3 bg-muted/50 rounded-lg border border-border/50">
              <strong className="block text-primary mb-1">Real Estate Flippers</strong>
              <span className="text-sm text-muted-foreground">Investors who intend to sell within 2-3 years and want the lowest possible holding costs during the renovation.</span>
            </div>
            <div className="p-3 bg-muted/50 rounded-lg border border-border/50">
              <strong className="block text-primary mb-1">Gap Year Planners</strong>
              <span className="text-sm text-muted-foreground">Buyers taking a temporary pay cut (e.g., sabbatical) who need lower payments now but expect higher income later.</span>
            </div>
          </div>

          <Separator className="border-border/50" />

          <div>
            <h4 className="flex items-center gap-2 font-semibold text-lg mb-3">
              <Target className="h-5 w-5 text-green-600" />
              Real-World Scenarios
            </h4>
            <div className="space-y-3">
              <div className="p-4 rounded-lg bg-green-50 dark:bg-green-900/10 border border-green-100 dark:border-green-900/20">
                <h5 className="font-semibold text-green-800 dark:text-green-300 mb-1">Case A: The Investment Flip</h5>
                <p className="text-sm text-green-700/80 dark:text-green-400">
                  <strong>Scenario:</strong> You buy a $400k fixer-upper. A standard loan costs $2,500/mo. An IO loan costs $1,500/mo.<br />
                  <strong>Result:</strong> Over a 12-month renovation, you save $12,000 in cash flow. You sell the house for $500k, paying off the principal then.
                </p>
              </div>
              <div className="p-4 rounded-lg bg-red-50 dark:bg-red-900/10 border border-red-100 dark:border-red-900/20">
                <h5 className="font-semibold text-red-800 dark:text-red-300 mb-1">Case B: The "Forever Home" Trap</h5>
                <p className="text-sm text-red-700/80 dark:text-red-400">
                  <strong>Scenario:</strong> You buy your dream home using an IO loan to afford the payments. You plan to "refinance later." 10 years pass.<br />
                  <strong>Result:</strong> The loan resets. Your payment jumps from $2,000 to $3,200. You try to refinance, but rates have risen from 4% to 7%. You are forced to sell.
                </p>
              </div>
            </div>
          </div>

          <Separator className="border-border/50" />

          <div>
            <h4 className="flex items-center gap-2 font-semibold text-lg mb-3">
              <AlertTriangle className="h-5 w-5 text-amber-600" />
              Limitations
            </h4>
            <ul className="space-y-2 text-sm text-muted-foreground">
              <li className="flex gap-2">
                <CheckCircle2 className="h-4 w-4 text-amber-500 shrink-0 mt-0.5" />
                <span><strong>Static Rates:</strong> We assume a fixed interest rate. Many IO loans are also ARMs, meaning the rate could rise *while* the payment amortizes, causing a double-shock.</span>
              </li>
            </ul>
          </div>
        </CardContent>
      </Card>

      {/* Summary Footer */}
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <Shield className="h-5 w-5" />
            Summary
          </CardTitle>
        </CardHeader>
        <CardContent className="space-y-2 text-sm text-muted-foreground">
          <p>The Interest-Only Loan Calculator illuminates the hidden dangers of deferred principal payments.</p>
          <p>While the initial phase offers attractive low payments, the "Recast" at the end of the term forces a massive payment increase.</p>
          <p>This tool helps you visualize that future shock so you can plan your exit strategy (refinance or sell) years in advance.</p>
        </CardContent>
      </Card>

    </div>
  );
}

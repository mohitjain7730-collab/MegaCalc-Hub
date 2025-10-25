
'use client';

import { useState } from 'react';
import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import { z } from 'zod';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Form, FormControl, FormField, FormItem, FormLabel, FormMessage } from '@/components/ui/form';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { HandCoins, DollarSign, TrendingUp, Calendar, Target, Info, AlertCircle, CreditCard, Home, Car } from 'lucide-react';
import { LineChart, Line, XAxis, YAxis, CartesianGrid, Tooltip, Legend, ResponsiveContainer } from 'recharts';
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from '@/components/ui/table';
import { Badge } from '@/components/ui/badge';
import { Alert, AlertDescription } from '@/components/ui/alert';

const formSchema = z.object({
  loanAmount: z.number().positive(),
  annualInterestRate: z.number().positive(),
  loanTenureYears: z.number().positive(),
});

type FormValues = z.infer<typeof formSchema>;

interface CalculationResult {
  emi: number;
  totalPayment: number;
  totalInterest: number;
  chartData: { year: number; remainingBalance: number; totalInterestPaid: number }[];
  interestPercentage: number;
  principalPercentage: number;
  monthlyInterestRate: number;
  totalMonths: number;
  loanType: string;
}

export default function LoanEmiCalculator() {
  const [result, setResult] = useState<CalculationResult | null>(null);

  const form = useForm<FormValues>({
    resolver: zodResolver(formSchema),
    defaultValues: {
      loanAmount: undefined,
      annualInterestRate: undefined,
      loanTenureYears: undefined,
    },
  });

  const onSubmit = (values: FormValues) => {
    const { loanAmount, annualInterestRate, loanTenureYears } = values;
    const P = loanAmount;
    const r = annualInterestRate / 12 / 100;
    const n = loanTenureYears * 12;

    if (r === 0) {
        const emi = P / n;
        const totalPayment = P;
        const totalInterest = 0;
        const chartData = Array.from({ length: loanTenureYears }, (_, i) => {
            const year = i + 1;
            const balance = P - emi * year * 12;
            return {
                year,
                remainingBalance: Math.max(0, balance),
                totalInterestPaid: 0,
            };
        });
        setResult({ emi, totalPayment, totalInterest, chartData });
        return;
    }

    const emi = (P * r * Math.pow(1 + r, n)) / (Math.pow(1 + r, n) - 1);
    const totalPayment = emi * n;
    const totalInterest = totalPayment - P;

    const chartData = [];
    let remainingBalance = P;
    let cumulativeInterest = 0;

    for (let year = 1; year <= loanTenureYears; year++) {
      let yearlyInterest = 0;
      for (let month = 1; month <= 12; month++) {
        const interestPayment = remainingBalance * r;
        const principalPayment = emi - interestPayment;
        yearlyInterest += interestPayment;
        remainingBalance -= principalPayment;
      }
      cumulativeInterest += yearlyInterest;
      chartData.push({
        year: year,
        remainingBalance: Math.max(0, remainingBalance), // Ensure balance doesn't go negative
        totalInterestPaid: Math.round(cumulativeInterest),
      });
    }
    
    const interestPercentage = (totalInterest / totalPayment) * 100;
    const principalPercentage = (loanAmount / totalPayment) * 100;
    const monthlyInterestRate = annualInterestRate / 12;
    const totalMonths = loanTenureYears * 12;
    
    // Determine loan type based on amount and tenure
    let loanType = 'Personal Loan';
    if (loanAmount > 200000 && loanTenureYears >= 15) {
      loanType = 'Mortgage';
    } else if (loanAmount >= 10000 && loanAmount <= 100000 && loanTenureYears <= 7) {
      loanType = 'Auto Loan';
    } else if (loanAmount <= 50000 && loanTenureYears <= 5) {
      loanType = 'Personal Loan';
    }

    setResult({ 
      emi, 
      totalPayment, 
      totalInterest, 
      chartData,
      interestPercentage,
      principalPercentage,
      monthlyInterestRate,
      totalMonths,
      loanType
    });
  };

  return (
    <div className="space-y-8">
      {/* Input Form */}
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <Target className="h-5 w-5" />
            Loan Parameters
          </CardTitle>
          <CardDescription>
            Enter your loan details to calculate your monthly EMI and payment schedule
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
                        Loan Amount
                      </FormLabel>
                      <FormControl>
                        <Input 
                          type="number" 
                          placeholder="e.g., 250000" 
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
                  name="annualInterestRate" 
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel className="flex items-center gap-2">
                        <TrendingUp className="h-4 w-4" />
                        Annual Interest Rate (%)
                      </FormLabel>
                      <FormControl>
                        <Input 
                          type="number" 
                          placeholder="e.g., 6.5" 
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
                  name="loanTenureYears" 
                  render={({ field }) => (
                    <FormItem className="md:col-span-2">
                      <FormLabel className="flex items-center gap-2">
                        <Calendar className="h-4 w-4" />
                        Loan Tenure (Years)
                      </FormLabel>
                      <FormControl>
                        <Input 
                          type="number" 
                          placeholder="e.g., 30" 
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
                Calculate My EMI
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
                <HandCoins className="h-8 w-8 text-primary" />
                <div>
                  <CardTitle>Your Loan Repayment Details</CardTitle>
                  <CardDescription>
                    {result.loanType} • {result.totalMonths} payments • {result.interestPercentage.toFixed(1)}% interest cost
                  </CardDescription>
                </div>
              </div>
            </CardHeader>
            <CardContent>
              <div className="grid grid-cols-1 md:grid-cols-3 gap-6 mb-8">
                <div className="text-center p-6 bg-primary/5 rounded-lg">
                  <div className="flex items-center justify-center gap-2 mb-2">
                    <DollarSign className="h-5 w-5 text-primary" />
                    <span className="text-sm font-medium text-muted-foreground">Monthly EMI</span>
                  </div>
                  <p className="text-3xl font-bold text-primary">
                    ${result.emi.toLocaleString(undefined, { maximumFractionDigits: 2 })}
                  </p>
                  <p className="text-sm text-muted-foreground mt-1">
                    Fixed monthly payment
                  </p>
                </div>
                
                <div className="text-center p-6 bg-muted/50 rounded-lg">
                  <div className="flex items-center justify-center gap-2 mb-2">
                    <CreditCard className="h-5 w-5 text-muted-foreground" />
                    <span className="text-sm font-medium text-muted-foreground">Total Payment</span>
                  </div>
                  <p className="text-2xl font-bold">
                    ${result.totalPayment.toLocaleString(undefined, { maximumFractionDigits: 2 })}
                  </p>
                  <p className="text-sm text-muted-foreground mt-1">
                    Over {result.totalMonths} months
                  </p>
                </div>
                
                <div className="text-center p-6 bg-red-50 dark:bg-red-950/20 rounded-lg">
                  <div className="flex items-center justify-center gap-2 mb-2">
                    <TrendingUp className="h-5 w-5 text-red-600" />
                    <span className="text-sm font-medium text-muted-foreground">Total Interest</span>
                  </div>
                  <p className="text-2xl font-bold text-red-600">
                    ${result.totalInterest.toLocaleString(undefined, { maximumFractionDigits: 2 })}
                  </p>
                  <p className="text-sm text-muted-foreground mt-1">
                    {result.interestPercentage.toFixed(1)}% of total payment
                  </p>
                </div>
              </div>

              {/* Loan Breakdown */}
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4 mb-6">
                <div className="p-4 border rounded-lg">
                  <h4 className="font-semibold mb-2 flex items-center gap-2">
                    <Home className="h-4 w-4" />
                    Principal Amount
                  </h4>
                  <p className="text-2xl font-bold text-primary">
                    ${result.totalPayment.toLocaleString(undefined, { maximumFractionDigits: 2 })}
                  </p>
                  <p className="text-sm text-muted-foreground">
                    {result.principalPercentage.toFixed(1)}% of total payment
                  </p>
                </div>
                
                <div className="p-4 border rounded-lg">
                  <h4 className="font-semibold mb-2 flex items-center gap-2">
                    <AlertCircle className="h-4 w-4" />
                    Interest Cost
                  </h4>
                  <p className="text-2xl font-bold text-red-600">
                    ${result.totalInterest.toLocaleString(undefined, { maximumFractionDigits: 2 })}
                  </p>
                  <p className="text-sm text-muted-foreground">
                    Monthly rate: {result.monthlyInterestRate.toFixed(3)}%
                  </p>
                </div>
              </div>

              {/* Amortization Chart */}
              <div className="space-y-4">
                <h3 className="text-lg font-semibold">Loan Amortization Over Time</h3>
                <div className="h-80">
                  <ResponsiveContainer width="100%" height="100%">
                    <LineChart data={result.chartData} margin={{ top: 5, right: 20, left: 20, bottom: 5 }}>
                      <CartesianGrid strokeDasharray="3 3" />
                      <XAxis 
                        dataKey="year" 
                        unit="yr" 
                        tick={{ fontSize: 12 }}
                        label={{ value: 'Years', position: 'insideBottom', offset: -5 }}
                      />
                      <YAxis 
                        tickFormatter={(value) => `$${(value/1000)}k`} 
                        tick={{ fontSize: 12 }}
                        label={{ value: 'Amount ($)', angle: -90, position: 'insideLeft' }}
                      />
                      <Tooltip 
                        formatter={(value: number, name: string) => [
                          `$${value.toLocaleString()}`, 
                          name === 'totalInterestPaid' ? 'Total Interest Paid' : 'Remaining Balance'
                        ]}
                        labelFormatter={(year) => `Year ${year}`}
                      />
                      <Legend />
                      <Line 
                        type="monotone" 
                        dataKey="totalInterestPaid" 
                        name="Total Interest Paid" 
                        stroke="hsl(var(--muted-foreground))" 
                        strokeWidth={2}
                        activeDot={{ r: 6 }} 
                      />
                      <Line 
                        type="monotone" 
                        dataKey="remainingBalance" 
                        name="Remaining Balance" 
                        stroke="hsl(var(--primary))" 
                        strokeWidth={3}
                        activeDot={{ r: 6 }}
                      />
                    </LineChart>
                  </ResponsiveContainer>
                </div>
              </div>
            </CardContent>
          </Card>
        </div>
      )}
      {/* Educational Content - Expanded Sections */}
      <div className="space-y-6">
        {/* Understanding the Inputs */}
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <Info className="h-5 w-5" />
              Understanding the Inputs
            </CardTitle>
            <CardDescription>
              Detailed explanations for each input parameter
            </CardDescription>
          </CardHeader>
          <CardContent className="space-y-6">
            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
              <div className="space-y-4">
                <div className="p-4 border rounded-lg">
                  <h4 className="font-semibold mb-2 flex items-center gap-2">
                    <DollarSign className="h-4 w-4" />
                    Loan Amount
                  </h4>
                  <p className="text-muted-foreground">
                    The initial amount of money you borrow from the lender. This is the principal amount that you'll be paying back over the loan term.
                  </p>
                </div>
                
                <div className="p-4 border rounded-lg">
                  <h4 className="font-semibold mb-2 flex items-center gap-2">
                    <TrendingUp className="h-4 w-4" />
                    Annual Interest Rate (%)
                  </h4>
                  <p className="text-muted-foreground">
                    The percentage of the principal charged by the lender for the use of its money, on a yearly basis. This directly affects your monthly payment amount.
                  </p>
                </div>
              </div>
              
              <div className="space-y-4">
                <div className="p-4 border rounded-lg">
                  <h4 className="font-semibold mb-2 flex items-center gap-2">
                    <Calendar className="h-4 w-4" />
                    Loan Tenure (Years)
                  </h4>
                  <p className="text-muted-foreground">
                    The total time period over which you will repay the loan. A longer tenure means lower EMIs but higher total interest paid, while a shorter tenure means higher EMIs but lower total interest.
                  </p>
                </div>
                
                <div className="p-4 border rounded-lg">
                  <h4 className="font-semibold mb-2 flex items-center gap-2">
                    <Target className="h-4 w-4" />
                    EMI Calculation
                  </h4>
                  <p className="text-muted-foreground">
                    In the initial years of your loan, a larger portion of your EMI goes towards paying off the interest. As the loan matures, a larger portion goes towards paying off the principal.
                  </p>
                </div>
              </div>
            </div>
          </CardContent>
        </Card>

        {/* Related Calculators */}
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <HandCoins className="h-5 w-5" />
              Related Calculators
            </CardTitle>
            <CardDescription>
              Explore other financial planning tools
            </CardDescription>
          </CardHeader>
          <CardContent>
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
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
                  <a href="/category/finance/401k-contribution-calculator" className="text-primary hover:underline">
                    401(k) Contribution Calculator
                  </a>
                </h4>
                <p className="text-sm text-muted-foreground">
                  Estimate 401(k) growth and contributions
                </p>
              </div>
            </div>
          </CardContent>
        </Card>

        {/* Guide Section */}
        <section className="space-y-6 text-muted-foreground leading-relaxed bg-card p-6 md:p-10 rounded-lg shadow-lg" itemScope itemType="https://schema.org/FinanceSummary">
    {/* SEO & SCHEMA METADATA (HIGHLY OPTIMIZED) */}
    <meta itemProp="name" content="The Comprehensive Guide to Loan Amortization and EMI: Formulas and Debt Management" />
    <meta itemProp="description" content="An expert guide to understanding Equated Monthly Installments (EMI), the amortization formula, and how interest and principal are balanced over the lifecycle of a loan, crucial for mortgages, auto loans, and financial planning." />
    <meta itemProp="keywords" content="EMI calculator mechanics, loan amortization formula, how EMI works, interest calculation on reducing balance, fixed vs reducing balance loan, prepayment impact on EMI, debt management strategy, time value of money loans" />
    <meta itemProp="author" content="[Your Site's Financial Analyst Team]" />
    <meta itemProp="datePublished" content="2025-10-25" /> 
    <meta itemProp="url" content="/definitive-loan-emi-guide" />

    <h1 className="text-3xl md:text-4xl font-extrabold text-foreground mb-4" itemProp="headline">The Definitive Guide to Loan Amortization and EMI: Understanding Your Debt Repayment Schedule</h1>
    <p className="text-lg italic text-muted-foreground">Unlock the complex mechanics of Equated Monthly Installments (EMI) and discover how interest and principal are calculated over the life of your loan.</p>

    {/* TABLE OF CONTENTS (INTERNAL LINKS FOR UX AND SEO) */}
    <h2 className="text-2xl font-bold text-foreground mt-8 mb-4">Table of Contents: Jump to a Section</h2>
    <ul className="list-disc ml-6 space-y-2 text-primary">
        <li><a href="#emi-basics" className="hover:underline">EMI and Amortization: Core Definitions</a></li>
        <li><a href="#formula" className="hover:underline">The Loan Amortization (EMI) Formula Mechanics</a></li>
        <li><a href="#schedule" className="hover://underline">The Amortization Schedule and Interest/Principal Split</a></li>
        <li><a href="#reducing-balance" className="hover:underline">Reducing Balance Method: The True Cost of Interest</a></li>
        <li><a href="#prepayment" className="hover:underline">Impact of Prepayment on Loan Tenure and Interest Saved</a></li>
    </ul>
<hr />

    {/* EMI AND AMORTIZATION: CORE DEFINITIONS */}
    <h2 id="emi-basics" className="text-2xl font-bold text-foreground pt-8" itemProp="articleSection">EMI and Amortization: Core Definitions</h2>
    <p>The concepts of <strong className="font-semibold">Equated Monthly Installment (EMI)</strong> and <strong className="font-semibold">Amortization</strong> are central to understanding structured debt repayment, from home loans (mortgages) to auto and personal financing. EMI is a fixed payment amount that a borrower pays to a lender at a specified date each month.</p>

    <h3 className="text-xl font-semibold text-foreground mt-6">Defining the Terms</h3>
    <ul className="list-disc ml-6 space-y-2">
        <li><strong className="font-semibold">EMI:</strong> The constant amount paid monthly, ensuring the debt is fully paid off (amortized) by the end of the loan tenure. The EMI combines both the interest component and the principal component.</li>
        <li><strong className="font-semibold">Amortization:</strong> The process of gradually paying off a debt over time in fixed, regular installments. It is a structured repayment plan where the outstanding principal balance steadily decreases with each payment.</li>
        <li><strong className="font-semibold">Principal (P):</strong> The initial loan amount borrowed.</li>
        <li><strong className="font-semibold">Rate (r):</strong> The monthly interest rate, calculated by dividing the Annual Percentage Rate (APR) by 12 (e.g., 10% divided by 12 = 0.833% per month).</li>
        <li><strong className="font-semibold">Tenure (n):</strong> The total number of monthly installments over the life of the loan (e.g., 30 years multiplied by 12 months = 360 periods).</li>
    </ul>
    <p>Amortization utilizes the <strong className="font-semibold">Present Value of Annuity</strong> formula, viewing the loan principal (P) as the Present Value, and the stream of EMIs as a series of equal, future payments (PMT) that must exactly equal the value of the principal today.</p>

<hr />

    {/* THE LOAN AMORTIZATION (EMI) FORMULA MECHANICS */}
    <h2 id="formula" className="text-2xl font-bold text-foreground pt-8" itemProp="articleSection">The Loan Amortization (EMI) Formula Mechanics</h2>
    <p>The EMI formula is an algebraic rearrangement of the Present Value of Ordinary Annuity formula, solved for the Payment (PMT). It is the definitive calculation used by all major lending institutions to determine your fixed monthly obligation.</p>

    <h3 className="text-xl font-semibold text-foreground mt-6">The Core EMI Formula</h3>
    <p>The formula calculates the EMI based on the loan principal, the monthly interest rate, and the total number of periods:</p>
    
    <div className="overflow-x-auto my-6 p-4 bg-muted border rounded-lg text-center">
        <p className="font-mono text-xl text-destructive font-bold">
            {'EMI = P * r * [ (1 + r)^n / ((1 + r)^n - 1) ]'}
        </p>
    </div>

    <p>The term {'r * (1 + r)^n / ((1 + r)^n - 1)'} is the <strong className="font-semibold">Capital Recovery Factor</strong> (CRF). It is the multiplier applied to the principal (P) that determines the fixed monthly amount needed to recover the principal and all accrued interest over the entire tenure (n).</p>

    <h3 className="text-xl font-semibold text-foreground mt-6">Why EMI is Equated (Fixed)</h3>
    <p>The EMI is designed to be constant throughout the loan tenure to ensure simplicity and predictability for the borrower. While the total payment is fixed, the split between the interest and principal components within that fixed payment changes dramatically over time. This dynamic split is the focus of the amortization schedule.</p>

<hr />

    {/* THE AMORTIZATION SCHEDULE AND INTEREST/PRINCIPAL SPLIT */}
    <h2 id="schedule" className="text-2xl font-bold text-foreground pt-8" itemProp="articleSection">The Amortization Schedule and Interest/Principal Split</h2>
    <p>An <strong className="font-semibold">Amortization Schedule</strong> is a table detailing every single EMI payment, showing exactly how much of that fixed payment goes toward servicing the interest and how much goes toward reducing the outstanding principal balance.</p>

    <h3 className="text-xl font-semibold text-foreground mt-6">The Front-Loading of Interest</h3>
    <p>The most critical feature of the amortization schedule is the <strong className="font-semibold">front-loading of interest</strong>:</p>
    <ul className="list-disc ml-6 space-y-2">
        <li><strong className="font-semibold">Early Years:</strong> In the beginning of the loan, the principal balance is at its highest. Therefore, the majority of the EMI payment goes toward interest, leaving only a small fraction to reduce the principal.</li>
        <li><strong className="font-semibold">Later Years:</strong> As the principal is gradually reduced, the interest accrued on the smaller balance also falls. Consequently, a larger and larger portion of the fixed EMI payment is redirected toward reducing the principal.</li>
    </ul>
    <p>This front-loaded structure means that if a loan is terminated early, the borrower will have paid a disproportionately high amount of interest relative to the principal reduction achieved.</p>

<hr />

    {/* REDUCING BALANCE METHOD: THE TRUE COST OF INTEREST */}
    <h2 id="reducing-balance" className="text-2xl font-bold text-foreground pt-8" itemProp="articleSection">Reducing Balance Method: The True Cost of Interest</h2>
    <p>Virtually all modern consumer and commercial loans use the <strong className="font-semibold">Reducing Balance Method</strong> for calculating interest. This method ensures that interest is charged only on the <strong className="font-semibold">outstanding principal balance</strong> at the beginning of the payment period, reflecting the fair value of the debt.</p>

    <h3 className="text-xl font-semibold text-foreground mt-6">The Monthly Interest Calculation Step</h3>
    <p>For every EMI payment, the interest component is calculated using this simple formula:</p>
    
    <div className="overflow-x-auto my-6 p-4 bg-muted border rounded-lg text-center">
        <p className="font-mono text-xl text-destructive font-bold">
            {'Monthly Interest = Outstanding Principal * (Annual Rate / 12)'}
        </p>
    </div>

    <p>The remaining amount of the fixed EMI is then applied to the principal:</p>
    <div className="overflow-x-auto my-4 p-2 bg-muted border rounded-lg inline-block">
        <p className="font-mono text-lg text-destructive font-bold">
            {'Principal Paid = EMI - Monthly Interest'}
        </p>
    </div>
    <p>This newly reduced principal is used to calculate the interest for the *next* EMI payment, creating a virtuous circle of debt reduction. The opposite—the <strong className="font-semibold">Flat Rate Method</strong> (where interest is calculated on the original loan amount throughout the tenure)—is considered predatory and is usually confined to specific forms of short-term or subsidized lending.</p>

<hr />

    {/* IMPACT OF PREPAYMENT ON LOAN TENURE AND INTEREST SAVED */}
    <h2 id="prepayment" className="text-2xl font-bold text-foreground pt-8" itemProp="articleSection">Impact of Prepayment on Loan Tenure and Interest Saved</h2>
    <p>Prepaying a loan (making payments in excess of the scheduled EMI) is the single most effective strategy for minimizing the total interest paid and shortening the loan tenure. Because interest is front-loaded, prepayments made early in the loan lifecycle offer the greatest financial benefit.</p>

    <h3 className="text-xl font-semibold text-foreground mt-6">The Mechanics of a Prepayment</h3>
    <p>When an extra payment is made, the entire surplus amount is applied directly and exclusively to the <strong className="font-semibold">outstanding principal balance</strong>. This bypasses the interest component of the next scheduled EMI payments.</p>
    <p>The lender then typically offers the borrower two options:</p>
    <ol className="list-decimal ml-6 space-y-2">
        <li><strong className="font-semibold">Reduce Tenure (Preferred Option):</strong> Keep the EMI fixed but drastically reduce the number of remaining installments, maximizing interest savings.</li>
        <li><strong className="font-semibold">Reduce EMI:</strong> Keep the original loan tenure fixed but reduce the monthly EMI payment. While this improves monthly cash flow, it is less effective at maximizing overall interest savings.</li>
    </ol>
    <p>Analyzing the amortization schedule after a prepayment reveals that the amount of interest saved often far exceeds the value of the prepayment itself, making it a critical tool in advanced debt management.</p>

<hr />

    {/* CONCLUSION */}
    <h2 className="text-2xl font-bold text-foreground pt-8" itemProp="articleSection">Conclusion</h2>
    <p>The architecture of loan amortization and the EMI is a highly sophisticated application of the Time Value of Money principles. By ensuring a fixed monthly payment that incorporates interest on a reducing principal balance, this system provides stability for the borrower and guaranteed return for the lender.</p>
    <p>Understanding the front-loading of interest and the mechanics of the reducing balance method is essential for financial empowerment. Knowledge of the EMI formula and the power of early prepayment are the keys to effectively managing long-term debt, minimizing the total cost of borrowing, and accelerating financial freedom.</p>
</section>

        {/* FAQ Section */}
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <Info className="h-5 w-5" />
              Frequently Asked Questions
            </CardTitle>
            <CardDescription>
              Common questions about loan payments and EMIs
            </CardDescription>
          </CardHeader>
          <CardContent className="space-y-6">
            <div className="space-y-4">
              <div className="p-4 border rounded-lg">
                <h4 className="font-semibold mb-2">What is an EMI?</h4>
                <p className="text-muted-foreground">
                  An Equated Monthly Installment (EMI) is a fixed payment amount made by a borrower to a lender at a specified date each calendar month. EMIs are used to pay off both interest and principal each month so that over a specified number of years, the loan is paid off in full.
                </p>
              </div>
              
              <div className="p-4 border rounded-lg">
                <h4 className="font-semibold mb-2">How is EMI calculated?</h4>
                <p className="text-muted-foreground">
                  EMI is calculated using the formula: EMI = P × r × (1 + r)^n / ((1 + r)^n - 1), where P is the principal loan amount, r is the monthly interest rate, and n is the number of monthly installments.
                </p>
              </div>
              
              <div className="p-4 border rounded-lg">
                <h4 className="font-semibold mb-2">What's the difference between interest rate and APR?</h4>
                <p className="text-muted-foreground">
                  The interest rate is the cost of borrowing the principal. The Annual Percentage Rate (APR) is a broader measure that includes the interest rate plus other lender fees and costs. The APR is the more accurate number to use for comparing loan offers.
                </p>
              </div>
              
              <div className="p-4 border rounded-lg">
                <h4 className="font-semibold mb-2">Can I pay off my loan early?</h4>
                <p className="text-muted-foreground">
                  For most standard loans like conforming mortgages and auto loans, prepayment penalties are rare. However, they can exist on some types of loans, so it's always important to read the fine print of your loan agreement.
                </p>
              </div>
              
              <div className="p-4 border rounded-lg">
                <h4 className="font-semibold mb-2">How can I reduce my EMI?</h4>
                <p className="text-muted-foreground">
                  You can reduce your EMI by: 1) Making a larger down payment to reduce the loan amount, 2) Improving your credit score to get a lower interest rate, 3) Extending the loan tenure (though this increases total interest), or 4) Refinancing to a lower interest rate.
                </p>
              </div>
            </div>
          </CardContent>
        </Card>
      </div>
    </div>
  );
}

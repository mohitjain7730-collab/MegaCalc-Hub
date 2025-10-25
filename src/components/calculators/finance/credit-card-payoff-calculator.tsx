'use client';

import { useState } from 'react';
import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import { z } from 'zod';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Form, FormControl, FormField, FormItem, FormLabel, FormMessage } from '@/components/ui/form';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { CreditCard, Calendar, DollarSign, TrendingDown, Info, AlertCircle, Target, Calculator, Clock, Zap } from 'lucide-react';
import { Badge } from '@/components/ui/badge';
import { Alert, AlertDescription } from '@/components/ui/alert';

const formSchema = z.object({
  currentBalance: z.number().min(0).optional(),
  annualInterestRate: z.number().min(0).max(100).optional(),
  minimumPayment: z.number().min(0).optional(),
  extraPayment: z.number().min(0).optional(),
  payoffStrategy: z.enum(['minimum', 'fixed', 'snowball', 'avalanche']).optional(),
});

type FormValues = z.infer<typeof formSchema>;

export default function CreditCardPayoffCalculator() {
  const [result, setResult] = useState<{ 
    payoffTime: number;
    totalInterest: number;
    totalPayments: number;
    monthlyPayment: number;
    strategy: string;
    interpretation: string;
    recommendations: string[];
    warningSigns: string[];
    paymentSchedule: { month: number; balance: number; payment: number; interest: number; principal: number }[];
  } | null>(null);

  const form = useForm<FormValues>({
    resolver: zodResolver(formSchema),
    defaultValues: {
      currentBalance: undefined, 
      annualInterestRate: undefined, 
      minimumPayment: undefined, 
      extraPayment: undefined,
      payoffStrategy: undefined
    } 
  });

  const calculatePayoff = (balance: number, rate: number, payment: number) => {
    const monthlyRate = rate / 100 / 12;
    let currentBalance = balance;
    let totalInterest = 0;
    let month = 0;
    const schedule = [];

    while (currentBalance > 0.01 && month < 600) { // Max 50 years
      const interestPayment = currentBalance * monthlyRate;
      const principalPayment = Math.min(payment - interestPayment, currentBalance);
      const actualPayment = principalPayment + interestPayment;
      
      totalInterest += interestPayment;
      currentBalance -= principalPayment;
      month++;

      schedule.push({
        month,
        balance: Math.max(0, currentBalance),
        payment: actualPayment,
        interest: interestPayment,
        principal: principalPayment
      });
    }

    return { payoffTime: month, totalInterest, schedule };
  };

  const calculate = (v: FormValues) => {
    if (v.currentBalance == null || v.annualInterestRate == null || v.minimumPayment == null) return null;
    
    const extraPayment = v.extraPayment || 0;
    const totalPayment = v.minimumPayment + extraPayment;
    
    return calculatePayoff(v.currentBalance, v.annualInterestRate, totalPayment);
  };

  const interpret = (payoffTime: number, totalInterest: number, originalBalance: number) => {
    const interestPercentage = (totalInterest / originalBalance) * 100;
    
    if (payoffTime > 300) return 'Very long payoff time—consider debt consolidation or balance transfer.';
    if (payoffTime > 120) return 'Long payoff time—focus on increasing payments and reducing expenses.';
    if (payoffTime > 60) return 'Moderate payoff time—good progress, consider accelerating payments.';
    return 'Short payoff time—excellent debt management strategy.';
  };

  const getStrategy = (strategy: string) => {
    switch (strategy) {
      case 'minimum': return 'Minimum Payment Strategy';
      case 'fixed': return 'Fixed Payment Strategy';
      case 'snowball': return 'Debt Snowball Strategy';
      case 'avalanche': return 'Debt Avalanche Strategy';
      default: return 'Custom Payment Strategy';
    }
  };

  const getRecommendations = (payoffTime: number, totalInterest: number, originalBalance: number) => {
    const recommendations = [];
    
    if (payoffTime > 300) {
      recommendations.push('Consider debt consolidation loan with lower interest rate');
      recommendations.push('Look into balance transfer cards with 0% intro APR');
      recommendations.push('Cut all non-essential expenses immediately');
      recommendations.push('Increase income through side hustles or job change');
      recommendations.push('Seek professional debt counseling');
    } else if (payoffTime > 120) {
      recommendations.push('Increase monthly payments by any amount possible');
      recommendations.push('Use windfalls (tax refunds, bonuses) for extra payments');
      recommendations.push('Consider debt avalanche method (highest interest first)');
      recommendations.push('Track spending to find money for extra payments');
    } else if (payoffTime > 60) {
      recommendations.push('Maintain current payment strategy');
      recommendations.push('Consider debt snowball for psychological wins');
      recommendations.push('Build emergency fund to prevent new debt');
      recommendations.push('Start saving for future goals');
    } else {
      recommendations.push('Excellent debt management!');
      recommendations.push('Focus on building emergency fund');
      recommendations.push('Start investing for long-term goals');
      recommendations.push('Consider debt-free lifestyle maintenance');
    }

    return recommendations;
  };

  const getWarningSigns = (payoffTime: number, totalInterest: number, originalBalance: number) => {
    const signs = [];
    
    if (payoffTime > 300) {
      signs.push('Payoff time exceeds 25 years - unsustainable');
      signs.push('Total interest exceeds original balance');
      signs.push('Minimum payments barely cover interest');
      signs.push('Risk of default and credit damage');
    } else {
      signs.push('High credit utilization ratio');
      signs.push('Missing payments or paying late');
      signs.push('Using credit cards for daily expenses');
      signs.push('No emergency fund to prevent new debt');
    }

    return signs;
  };

  const onSubmit = (values: FormValues) => {
    const calculation = calculate(values);
    if (!calculation) { setResult(null); return; }
    
    const { payoffTime, totalInterest, schedule } = calculation;
    const totalPayments = values.currentBalance! + totalInterest;
    const monthlyPayment = values.minimumPayment! + (values.extraPayment || 0);
    
    setResult({ 
      payoffTime,
      totalInterest,
      totalPayments,
      monthlyPayment,
      strategy: getStrategy(values.payoffStrategy || 'minimum'),
      interpretation: interpret(payoffTime, totalInterest, values.currentBalance!),
      recommendations: getRecommendations(payoffTime, totalInterest, values.currentBalance!),
      warningSigns: getWarningSigns(payoffTime, totalInterest, values.currentBalance!),
      paymentSchedule: schedule.slice(0, 12) // Show first 12 months
    });
  };

  return (
    <div className="space-y-8">

      {/* Input Form */}
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <CreditCard className="h-5 w-5" />
            Credit Card Debt Information
          </CardTitle>
          <CardDescription>
            Enter your credit card details to calculate payoff timeline and strategies
          </CardDescription>
        </CardHeader>
        <CardContent>
      <Form {...form}>
        <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-6">
              <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                <FormField 
                  control={form.control} 
                  name="currentBalance" 
                  render={({ field }) => (
              <FormItem>
                      <FormLabel className="flex items-center gap-2">
                        <DollarSign className="h-4 w-4" />
                        Current Balance
                      </FormLabel>
                <FormControl>
                        <Input 
                          type="number" 
                          step="0.01" 
                          placeholder="e.g., 5000" 
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
                        <TrendingDown className="h-4 w-4" />
                        Annual Interest Rate (%)
                      </FormLabel>
                <FormControl>
                        <Input 
                          type="number" 
                          step="0.01" 
                          placeholder="e.g., 18.99" 
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
                  name="minimumPayment" 
                  render={({ field }) => (
              <FormItem>
                      <FormLabel className="flex items-center gap-2">
                        <Calculator className="h-4 w-4" />
                        Minimum Payment
                      </FormLabel>
                <FormControl>
                        <Input 
                          type="number" 
                          step="0.01" 
                          placeholder="e.g., 150" 
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
                  name="extraPayment" 
                  render={({ field }) => (
              <FormItem>
                      <FormLabel className="flex items-center gap-2">
                        <Zap className="h-4 w-4" />
                        Extra Payment (Optional)
                      </FormLabel>
                <FormControl>
                        <Input 
                          type="number" 
                          step="0.01" 
                          placeholder="e.g., 100" 
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
                  name="payoffStrategy" 
                  render={({ field }) => (
              <FormItem>
                      <FormLabel className="flex items-center gap-2">
                        <Target className="h-4 w-4" />
                        Payoff Strategy
                      </FormLabel>
                <FormControl>
                        <select 
                          className="border rounded h-10 px-3 w-full bg-background" 
                          value={field.value ?? ''} 
                          onChange={(e) => field.onChange(e.target.value as any)}
                        >
                          <option value="">Select strategy</option>
                          <option value="minimum">Minimum Payment</option>
                          <option value="fixed">Fixed Payment</option>
                          <option value="snowball">Debt Snowball</option>
                          <option value="avalanche">Debt Avalanche</option>
                  </select>
                </FormControl>
                      <FormMessage />
              </FormItem>
                  )} 
                />
          </div>
              <Button type="submit" className="w-full md:w-auto">
                Calculate Payoff Plan
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
                <CreditCard className="h-8 w-8 text-primary" />
                <div>
                  <CardTitle>Your Credit Card Payoff Plan</CardTitle>
                  <CardDescription>Timeline and strategy for becoming debt-free</CardDescription>
                </div>
              </div>
            </CardHeader>
            <CardContent>
              <div className="grid grid-cols-1 md:grid-cols-3 gap-6 mb-8">
                <div className="text-center p-6 bg-primary/5 rounded-lg">
                  <div className="flex items-center justify-center gap-2 mb-2">
                    <Calendar className="h-5 w-5 text-primary" />
                    <span className="text-sm font-medium text-muted-foreground">Payoff Time</span>
                  </div>
                  <p className="text-3xl font-bold text-primary">
                    {Math.floor(result.payoffTime / 12)} years {result.payoffTime % 12} months
                  </p>
                  <p className="text-sm text-muted-foreground mt-1">
                    {result.payoffTime} total months
                  </p>
                </div>
                
                <div className="text-center p-6 bg-red-50 dark:bg-red-950/20 rounded-lg">
                  <div className="flex items-center justify-center gap-2 mb-2">
                    <TrendingDown className="h-5 w-5 text-red-600" />
                    <span className="text-sm font-medium text-muted-foreground">Total Interest</span>
                  </div>
                  <p className="text-3xl font-bold text-red-600">
                    ${result.totalInterest.toLocaleString()}
                  </p>
                  <p className="text-sm text-muted-foreground mt-1">
                    Interest cost
                  </p>
                    </div>
                
                <div className="text-center p-6 bg-green-50 dark:bg-green-950/20 rounded-lg">
                  <div className="flex items-center justify-center gap-2 mb-2">
                    <DollarSign className="h-5 w-5 text-green-600" />
                    <span className="text-sm font-medium text-muted-foreground">Monthly Payment</span>
                        </div>
                  <p className="text-3xl font-bold text-green-600">
                    ${result.monthlyPayment.toLocaleString()}
                  </p>
                  <p className="text-sm text-muted-foreground mt-1">
                    {result.strategy}
                  </p>
                        </div>
              </div>

              <Alert className="mb-6">
                <Info className="h-4 w-4" />
                <AlertDescription>
                  {result.interpretation}
                </AlertDescription>
              </Alert>

              {/* Payment Schedule Preview */}
              <Card className="mb-6">
                <CardHeader>
                  <CardTitle className="flex items-center gap-2 text-lg">
                    <Clock className="h-5 w-5" />
                    Payment Schedule (First 12 Months)
                  </CardTitle>
                </CardHeader>
                <CardContent>
                  <div className="overflow-x-auto">
                    <table className="w-full text-sm">
                      <thead>
                        <tr className="border-b">
                          <th className="text-left p-2">Month</th>
                          <th className="text-right p-2">Balance</th>
                          <th className="text-right p-2">Payment</th>
                          <th className="text-right p-2">Interest</th>
                          <th className="text-right p-2">Principal</th>
                        </tr>
                      </thead>
                      <tbody>
                        {result.paymentSchedule.map((payment, index) => (
                          <tr key={index} className="border-b">
                            <td className="p-2">{payment.month}</td>
                            <td className="text-right p-2">${payment.balance.toFixed(2)}</td>
                            <td className="text-right p-2">${payment.payment.toFixed(2)}</td>
                            <td className="text-right p-2">${payment.interest.toFixed(2)}</td>
                            <td className="text-right p-2">${payment.principal.toFixed(2)}</td>
                          </tr>
                        ))}
                      </tbody>
                    </table>
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
                        Payoff Recommendations
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
              Understanding Credit Card Payoff Strategies
            </CardTitle>
          </CardHeader>
          <CardContent className="space-y-4">
            <div>
              <h4 className="font-semibold text-foreground mb-2">Minimum Payment Strategy</h4>
              <p className="text-muted-foreground">
                Paying only the minimum required payment. This results in the longest payoff time and highest total interest cost. Not recommended unless absolutely necessary.
              </p>
            </div>
            <div>
              <h4 className="font-semibold text-foreground mb-2">Debt Snowball Method</h4>
              <p className="text-muted-foreground">
                Pay minimums on all debts, then put extra money toward the smallest balance first. Provides psychological wins and motivation to continue.
              </p>
            </div>
            <div>
              <h4 className="font-semibold text-foreground mb-2">Debt Avalanche Method</h4>
              <p className="text-muted-foreground">
                Pay minimums on all debts, then put extra money toward the highest interest rate first. Mathematically optimal for saving money on interest.
              </p>
            </div>
              <div>
              <h4 className="font-semibold text-foreground mb-2">Fixed Payment Strategy</h4>
              <p className="text-muted-foreground">
                Pay the same amount each month regardless of minimum payment changes. Provides predictable budgeting and faster payoff as balance decreases.
              </p>
            </div>
          </CardContent>
        </Card>

        {/* Related Calculators Section */}
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <CreditCard className="h-5 w-5" />
              Related Calculators
            </CardTitle>
            <CardDescription>
              Explore other debt management and financial planning tools
            </CardDescription>
          </CardHeader>
          <CardContent>
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
              <div className="p-4 border rounded-lg hover:bg-muted/50 transition-colors">
                <h4 className="font-semibold mb-2">
                  <a href="/category/finance/loan-emi-calculator" className="text-primary hover:underline">
                    Loan/EMI Calculator
                  </a>
                </h4>
                <p className="text-sm text-muted-foreground">
                  Calculate loan payments and schedules
                </p>
              </div>
              <div className="p-4 border rounded-lg hover:bg-muted/50 transition-colors">
                <h4 className="font-semibold mb-2">
                  <a href="/category/finance/mortgage-payment-calculator" className="text-primary hover:underline">
                    Mortgage Payment Calculator
                  </a>
                </h4>
                <p className="text-sm text-muted-foreground">
                  Calculate mortgage payments and costs
                </p>
              </div>
              <div className="p-4 border rounded-lg hover:bg-muted/50 transition-colors">
                <h4 className="font-semibold mb-2">
                  <a href="/category/finance/student-loan-repayment-calculator" className="text-primary hover:underline">
                    Student Loan Repayment Calculator
                  </a>
                </h4>
                <p className="text-sm text-muted-foreground">
                  Plan your student loan repayment strategy
                </p>
              </div>
              <div className="p-4 border rounded-lg hover:bg-muted/50 transition-colors">
                <h4 className="font-semibold mb-2">
                  <a href="/category/finance/debt-to-equity-ratio-calculator" className="text-primary hover:underline">
                    Debt-to-Equity Ratio Calculator
                  </a>
                </h4>
                <p className="text-sm text-muted-foreground">
                  Analyze your debt-to-equity ratio
                </p>
              </div>
            </div>
          </CardContent>
        </Card>

        {/* Guide Section */}
        <section className="space-y-6 text-muted-foreground leading-relaxed bg-card p-6 md:p-10 rounded-lg shadow-lg" itemScope itemType="https://schema.org/FinanceSummary">
    {/* SEO & SCHEMA METADATA (HIGHLY OPTIMIZED) */}
    <meta itemProp="name" content="The Definitive Guide to Credit Card Payoff, Amortization, and Interest Cost" />
    <meta itemProp="description" content="An expert guide to calculating credit card payoff time and total interest cost. Covers the compounding structure, minimum payment dynamics, acceleration strategies, and the mechanics of revolving debt amortization." />
    <meta itemProp="keywords" content="credit card payoff calculation, revolving debt amortization, how credit card interest is calculated, minimum payment analysis, reducing credit card debt, compounding interest debt trap, time value of money credit cards" />
    <meta itemProp="author" content="[Your Site's Financial Analyst Team]" />
    <meta itemProp="datePublished" content="2025-10-25" /> 
    <meta itemProp="url" content="/definitive-credit-card-payoff-guide" />

    <h1 className="text-3xl md:text-4xl font-extrabold text-foreground mb-4" itemProp="headline">The Definitive Guide to Credit Card Payoff: Understanding and Conquering High-Interest Revolving Debt</h1>
    <p className="text-lg italic text-muted-foreground">Master the mathematics of credit card debt amortization to calculate your true payoff timeline and minimize exponential interest costs.</p>

    {/* TABLE OF CONTENTS (INTERNAL LINKS FOR UX AND SEO) */}
    <h2 className="text-2xl font-bold text-foreground mt-8 mb-4">Table of Contents: Jump to a Section</h2>
    <ul className="list-disc ml-6 space-y-2 text-primary">
        <li><a href="#mechanics" className="hover:underline">Revolving Debt Mechanics and Daily Compounding</a></li>
        <li><a href="#payoff-formula" className="hover:underline">The Payoff Formula and Solving for Time (NPER)</a></li>
        <li><a href="#minimum-payment" className="hover:underline">The Trap of the Minimum Payment</a></li>
        <li><a href="#cost-reduction" className="hover:underline">Accelerated Payoff Strategies and Interest Cost Reduction</a></li>
        <li><a href="#apr-apy" className="hover:underline">Nominal Rate vs. Effective Annual Rate: The True Cost of Debt</a></li>
    </ul>
<hr />

    {/* REVOLVING DEBT MECHANICS AND DAILY COMPOUNDING */}
    <h2 id="mechanics" className="text-2xl font-bold text-foreground pt-8" itemProp="articleSection">Revolving Debt Mechanics and Daily Compounding</h2>
    <p>Credit card debt is categorized as <strong className="font-semibold">revolving debt</strong>—a line of credit that renews as it is paid off. Unlike installment loans (like mortgages) which have a fixed end date and payment schedule, credit card balances are subject to variable usage and, crucially, <strong className="font-semibold">daily compounding interest</strong>.</p>

    <h3 className="text-xl font-semibold text-foreground mt-6">The Daily Compounding Structure</h3>
    <p>Most credit card companies compound interest daily. This means the **Annual Percentage Rate (APR)** is divided by 365, and that rate is applied to the <strong className="font-semibold">Average Daily Balance (ADB)</strong>. The interest accrued each day is added to the principal, and the next day's interest is charged on that slightly higher balance. This aggressive frequency accelerates the effect of negative compounding.</p>

    <h3 className="text-xl font-semibold text-foreground mt-6">Average Daily Balance (ADB)</h3>
    <p>The ADB is calculated by summing the principal balance for each day in the billing cycle and dividing by the number of days in the cycle. Any payments or new purchases made during the month impact the daily balance, but the high-frequency compounding ensures debt growth is continuous.</p>

<hr />

    {/* THE PAYOFF FORMULA AND SOLVING FOR TIME (NPER) */}
    <h2 id="payoff-formula" className="text-2xl font-bold text-foreground pt-8" itemProp="articleSection">The Payoff Formula and Solving for Time (NPER)</h2>
    <p>Calculating the exact payoff timeline for credit card debt requires solving for the **number of periods** (N) in the Present Value of Annuity formula. In this context, the debt balance is the <strong className="font-semibold">Present Value (PV)</strong>, and the planned fixed monthly payment is the <strong className="font-semibold">Payment (PMT)</strong>. The goal is to find the required number of periods (N) that drives the PV to zero.</p>

    <h3 className="text-xl font-semibold text-foreground mt-6">The Loan Amortization Identity</h3>
    <p>The fundamental equation used to solve for the number of payments is derived from the Present Value of Annuity formula:</p>
    
    <div className="overflow-x-auto my-6 p-4 bg-muted border rounded-lg text-center">
        <p className="font-mono text-xl text-destructive font-bold">
            {'N = -log(1 - (PV * r) / PMT) / log(1 + r)'}
        </p>
    </div>

    <p>Where N is the number of months, PV is the current balance, PMT is the constant monthly payment, and r is the monthly interest rate (the Annual Percentage Rate divided by 12). This logarithm-based formula reveals the highly non-linear relationship between the payment amount and the time required to eliminate the debt.</p>

<hr />

    {/* THE TRAP OF THE MINIMUM PAYMENT */}
    <h2 id="minimum-payment" className="text-2xl font-bold text-foreground pt-8" itemProp="articleSection">The Trap of the Minimum Payment</h2>
    <p>The <strong className="font-semibold">minimum payment</strong> calculation is designed to maximize the lender's interest income over the longest possible time, not to facilitate rapid debt payoff. Relying solely on the minimum payment can turn short-term debt into a decades-long financial burden.</p>

    <h3 className="text-xl font-semibold text-foreground mt-6">Minimum Payment Calculation Dynamics</h3>
    <p>The minimum payment is typically calculated as the greater of two options:</p>
    <ol className="list-decimal ml-6 space-y-2">
        <li>A small percentage (e.g., 1% to 3%) of the outstanding balance, <strong className="font-semibold">plus</strong> the current month's interest, or</li>
        <li>A fixed dollar amount (e.g., $25).</li>
    </ol>
    <p>Since the minimum payment shrinks as the balance decreases, a smaller portion of the payment goes toward the principal reduction over time. This makes the debt payoff period disproportionately long, often extending what should be a three-year debt into a 15- to 20-year commitment with interest costs exceeding the original principal several times over.</p>

<hr />

    {/* ACCELERATED PAYOFF STRATEGIES AND INTEREST COST REDUCTION */}
    <h2 id="cost-reduction" className="text-2xl font-bold text-foreground pt-8" itemProp="articleSection">Accelerated Payoff Strategies and Interest Cost Reduction</h2>
    <p>To break the compounding debt cycle, the payment must be significantly higher than the accrued monthly interest. The goal is to maximize the principal component of the payment.</p>

    <h3 className="text-xl font-semibold text-foreground mt-6">The Power of the Extra Principal Payment</h3>
    <p>The fastest way to reduce the payoff timeline and total interest cost is to pay a fixed amount well above the minimum. Every dollar paid beyond the interest due goes immediately toward reducing the principal balance. Because interest is calculated on the <strong className="font-semibold">reducing principal</strong>, an extra payment made early in the payoff process yields the greatest financial benefit by preventing future interest from accruing.</p>

    <h3 className="text-xl font-semibold text-foreground mt-6">Debt Consolidation and Snowball/Avalanche</h3>
    <ul className="list-disc ml-6 space-y-2">
        <li><strong className="font-semibold">Debt Avalanche:</strong> The financially optimal strategy. Focus all extra payments on the card with the <strong className="font-semibold">highest nominal rate</strong> first, mathematically minimizing total interest paid.</li>
        <li><strong className="font-semibold">Debt Snowball:</strong> The psychologically preferred strategy. Focus on paying off the card with the <strong className="font-semibold">smallest balance</strong> first. The quick wins build momentum, making the user more likely to stick to the plan.</li>
        <li><strong className="font-semibold">Consolidation:</strong> Transferring high-interest balances to a lower-interest loan or a 0% **Annual Percentage Rate** balance transfer card. This strategy provides a temporary reprieve from high interest, accelerating the principal reduction.</li>
    </ul>

<hr />

    {/* APR VS. APY: THE TRUE ANNUAL COST OF DEBT */}
    <h2 id="apr-apy" className="text-2xl font-bold text-foreground pt-8" itemProp="articleSection">Nominal Rate vs. Effective Annual Rate: The True Cost of Debt</h2>
    <p>When dealing with compounding interest, the distinction between the nominal <strong className="font-semibold">Annual Percentage Rate (APR)</strong> and the effective <strong className="font-semibold">Annual Percentage Yield (APY)</strong> is critical for understanding the true cost of credit card debt.</p>

    <h3 className="text-xl font-semibold text-foreground mt-6">Annual Percentage Rate (APR)</h3>
    <p>The **APR** is the nominal, stated annual interest rate, calculated without regard to compounding frequency. For credit cards, this is the rate divided by 365 to calculate the daily interest charged.</p>

    <h3 className="text-xl font-semibold text-foreground mt-6">Annual Percentage Yield (APY) or Effective Annual Rate (EAR)</h3>
    <p>The **APY** (often called **EAR** in debt) is the true annual rate of interest paid, taking the effects of compounding into account. Because credit card debt compounds daily, the APY is always slightly higher than the stated APR:</p>
    <div className="overflow-x-auto my-6 p-4 bg-muted border rounded-lg text-center">
        <p className="font-mono text-xl text-destructive font-bold">
            {'APY = (1 + (APR / 365))^(365) - 1'}
        </p>
    </div>
    <p>This difference, though small on a daily basis, compounds over months and years, making the **APY** the most accurate measure of the total annual cost of maintaining a debt balance.</p>

<hr />

    {/* CONCLUSION */}
    <h2 className="text-2xl font-bold text-foreground pt-8" itemProp="articleSection">Conclusion</h2>
    <p>Credit card payoff is fundamentally an exercise in neutralizing negative compounding. The mechanics of revolving debt—particularly daily compounding and the shrinking nature of minimum payments—are designed to extend the debt cycle.</p>
    <p>Achieving rapid debt freedom requires solving the time equation (NPER) by deliberately exceeding the monthly interest accrual. By strategically increasing the fixed monthly payment, borrowers can dramatically reduce the total interest paid and accelerate their timeline, converting what appears to be decades of obligation into a manageable short-term debt payoff goal.</p>
</section>

        {/* FAQ Section */}
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <Info className="h-5 w-5" />
              Frequently Asked Questions
            </CardTitle>
            <CardDescription>
              Common questions about credit card debt payoff
            </CardDescription>
          </CardHeader>
          <CardContent className="space-y-6">
            <div>
              <h4 className="font-semibold text-foreground mb-2">Should I pay off credit cards or invest?</h4>
              <p className="text-muted-foreground">
                Generally, pay off high-interest credit card debt first. Credit card interest rates (15-25%) are typically much higher than investment returns (7-10%). The guaranteed savings from paying off debt usually outweighs potential investment gains.
              </p>
            </div>

            <div>
              <h4 className="font-semibold text-foreground mb-2">What's the difference between snowball and avalanche methods?</h4>
              <p className="text-muted-foreground">
                Snowball focuses on smallest balances first for psychological wins, while avalanche focuses on highest interest rates first for maximum money savings. Avalanche saves more money, but snowball provides more motivation.
              </p>
            </div>

            <div>
              <h4 className="font-semibold text-foreground mb-2">Should I use a balance transfer card?</h4>
              <p className="text-muted-foreground">
                Balance transfer cards can be helpful if you have good credit and can get a 0% intro APR. However, you must pay off the balance before the intro period ends, and you need to avoid new charges on the old card.
              </p>
            </div>

            <div>
              <h4 className="font-semibold text-foreground mb-2">How much extra should I pay each month?</h4>
              <p className="text-muted-foreground">
                Pay as much extra as possible while maintaining your emergency fund and other financial obligations. Even $25-50 extra per month can significantly reduce payoff time and interest costs.
              </p>
            </div>

            <div>
              <h4 className="font-semibold text-foreground mb-2">What if I can't make the minimum payment?</h4>
              <p className="text-muted-foreground">
                Contact your credit card company immediately to discuss hardship programs, reduced payments, or payment plans. Many companies offer temporary relief options to help avoid default.
              </p>
            </div>

            <div>
              <h4 className="font-semibold text-foreground mb-2">Should I close credit cards after paying them off?</h4>
              <p className="text-muted-foreground">
                Generally, keep the accounts open to maintain your credit utilization ratio and credit history length. However, if you can't control spending, closing them may be necessary for your financial health.
              </p>
            </div>
          </CardContent>
        </Card>
    </div>
    </div>
  );
}
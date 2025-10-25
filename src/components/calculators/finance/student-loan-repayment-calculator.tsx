'use client';

import { useState } from 'react';
import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import { z } from 'zod';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Form, FormControl, FormField, FormItem, FormLabel, FormMessage } from '@/components/ui/form';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { GraduationCap, Calculator, DollarSign, TrendingUp, Info, AlertCircle, Target, Calendar, BookOpen, Users } from 'lucide-react';
import { Badge } from '@/components/ui/badge';
import { Alert, AlertDescription } from '@/components/ui/alert';

const formSchema = z.object({
  loanBalance: z.number().min(0).optional(),
  interestRate: z.number().min(0).max(20).optional(),
  repaymentPlan: z.enum(['standard', 'extended', 'graduated', 'income-driven', 'paye', 'repaye', 'ibr', 'icr']).optional(),
  monthlyIncome: z.number().min(0).optional(),
  familySize: z.number().min(1).optional(),
  extraPayment: z.number().min(0).optional(),
  loanType: z.enum(['federal', 'private']).optional(),
});

type FormValues = z.infer<typeof formSchema>;

export default function StudentLoanRepaymentCalculator() {
  const [result, setResult] = useState<{ 
    monthlyPayment: number;
    totalInterest: number;
    payoffTime: number;
    totalCost: number;
    planDescription: string;
    interpretation: string;
    recommendations: string[];
    warningSigns: string[];
    paymentSchedule: { month: number; payment: number; principal: number; interest: number; balance: number }[];
  } | null>(null);

  const form = useForm<FormValues>({
    resolver: zodResolver(formSchema),
    defaultValues: {
      loanBalance: undefined, 
      interestRate: undefined, 
      repaymentPlan: undefined, 
      monthlyIncome: undefined,
      familySize: undefined,
      extraPayment: undefined,
      loanType: undefined
    } 
  });

  const calculateStandardPayment = (balance: number, rate: number, term: number) => {
    const monthlyRate = rate / 100 / 12;
    const numPayments = term * 12;
    
    if (monthlyRate === 0) {
      return balance / numPayments;
    }
    
    const payment = balance * (monthlyRate * Math.pow(1 + monthlyRate, numPayments)) / 
                   (Math.pow(1 + monthlyRate, numPayments) - 1);
    
    return payment;
  };

  const calculateIncomeDrivenPayment = (balance: number, income: number, familySize: number, plan: string) => {
    const discretionaryIncome = Math.max(0, income - (1.5 * 15060 + (familySize - 1) * 5250)); // 2023 poverty guidelines
    
    switch (plan) {
      case 'paye':
        return Math.min(discretionaryIncome * 0.10, calculateStandardPayment(balance, 6.5, 20));
      case 'repaye':
        return discretionaryIncome * 0.10;
      case 'ibr':
        return discretionaryIncome * 0.15;
      case 'icr':
        return Math.min(discretionaryIncome * 0.20, calculateStandardPayment(balance, 6.5, 12));
      default:
        return discretionaryIncome * 0.10;
    }
  };

  const calculateAmortization = (balance: number, rate: number, payment: number) => {
    const monthlyRate = rate / 100 / 12;
    const schedule = [];
    let currentBalance = balance;
    let month = 0;

    while (currentBalance > 0.01 && month < 600) { // Max 50 years
      const interestPayment = currentBalance * monthlyRate;
      const principalPayment = Math.min(payment - interestPayment, currentBalance);
      const actualPayment = principalPayment + interestPayment;
      
      currentBalance -= principalPayment;
      month++;

      schedule.push({
        month,
        payment: actualPayment,
        principal: principalPayment,
        interest: interestPayment,
        balance: Math.max(0, currentBalance)
      });
    }

    return { schedule, totalMonths: month };
  };

  const calculate = (v: FormValues) => {
    if (v.loanBalance == null || v.interestRate == null || v.repaymentPlan == null) return null;
    
    let monthlyPayment = 0;
    let payoffTime = 0;
    
    if (v.repaymentPlan === 'standard') {
      monthlyPayment = calculateStandardPayment(v.loanBalance, v.interestRate, 10);
      const amortization = calculateAmortization(v.loanBalance, v.interestRate, monthlyPayment);
      payoffTime = amortization.totalMonths;
    } else if (v.repaymentPlan === 'extended') {
      monthlyPayment = calculateStandardPayment(v.loanBalance, v.interestRate, 25);
      const amortization = calculateAmortization(v.loanBalance, v.interestRate, monthlyPayment);
      payoffTime = amortization.totalMonths;
    } else if (v.repaymentPlan === 'graduated') {
      monthlyPayment = calculateStandardPayment(v.loanBalance, v.interestRate, 10) * 0.5; // Starts at 50% of standard
      const amortization = calculateAmortization(v.loanBalance, v.interestRate, monthlyPayment);
      payoffTime = amortization.totalMonths;
    } else if (v.repaymentPlan === 'income-driven' || ['paye', 'repaye', 'ibr', 'icr'].includes(v.repaymentPlan)) {
      if (v.monthlyIncome == null) return null;
      monthlyPayment = calculateIncomeDrivenPayment(v.loanBalance, v.monthlyIncome, v.familySize || 1, v.repaymentPlan);
      const amortization = calculateAmortization(v.loanBalance, v.interestRate, monthlyPayment);
      payoffTime = amortization.totalMonths;
    }
    
    const extraPayment = v.extraPayment || 0;
    const totalPayment = monthlyPayment + extraPayment;
    
    const amortization = calculateAmortization(v.loanBalance, v.interestRate, totalPayment);
    const totalInterest = amortization.schedule.reduce((sum, payment) => sum + payment.interest, 0);
    const totalCost = v.loanBalance + totalInterest;
    
    return { 
      monthlyPayment: totalPayment, 
      totalInterest, 
      payoffTime: amortization.totalMonths,
      totalCost,
      paymentSchedule: amortization.schedule.slice(0, 12)
    };
  };

  const getPlanDescription = (plan: string) => {
    switch (plan) {
      case 'standard': return 'Standard 10-year repayment plan with fixed monthly payments';
      case 'extended': return 'Extended 25-year repayment plan with lower monthly payments';
      case 'graduated': return 'Graduated plan with payments that start low and increase over time';
      case 'paye': return 'Pay As You Earn (PAYE) - 10% of discretionary income, 20-year forgiveness';
      case 'repaye': return 'Revised Pay As You Earn (REPAYE) - 10% of discretionary income, 20-25 year forgiveness';
      case 'ibr': return 'Income-Based Repayment (IBR) - 15% of discretionary income, 20-25 year forgiveness';
      case 'icr': return 'Income-Contingent Repayment (ICR) - 20% of discretionary income, 25-year forgiveness';
      default: return 'Custom repayment plan';
    }
  };

  const interpret = (monthlyPayment: number, loanBalance: number, payoffTime: number, plan: string) => {
    const paymentToIncome = monthlyPayment / (loanBalance * 0.1); // Rough estimate
    
    if (paymentToIncome > 0.15) return 'High payment relative to income—consider income-driven plans.';
    if (payoffTime > 300) return 'Very long payoff time—consider refinancing or extra payments.';
    if (payoffTime > 120) return 'Long payoff time—review your repayment strategy.';
    return 'Reasonable repayment terms—good plan for your situation.';
  };

  const getRecommendations = (plan: string, monthlyPayment: number, loanBalance: number, loanType: string) => {
    const recommendations = [];
    
    if (plan === 'standard' && monthlyPayment > loanBalance * 0.01) {
      recommendations.push('Consider income-driven repayment plans if payment is too high');
      recommendations.push('Look into loan consolidation to simplify payments');
      recommendations.push('Apply for Public Service Loan Forgiveness if eligible');
    }
    
    if (plan.includes('income') || ['paye', 'repaye', 'ibr', 'icr'].includes(plan)) {
      recommendations.push('Recertify your income annually to maintain plan eligibility');
      recommendations.push('Consider tax implications of loan forgiveness');
      recommendations.push('Track qualifying payments for forgiveness programs');
    }
    
    if (loanType === 'federal') {
      recommendations.push('Explore federal loan forgiveness programs');
      recommendations.push('Consider Public Service Loan Forgiveness (PSLF)');
      recommendations.push('Look into Teacher Loan Forgiveness programs');
    }
    
    recommendations.push('Make extra payments when possible to reduce total interest');
    recommendations.push('Consider refinancing if you have good credit and stable income');
    recommendations.push('Build emergency fund to avoid payment disruptions');
    
    return recommendations;
  };

  const getWarningSigns = (plan: string, monthlyPayment: number, loanBalance: number) => {
    const signs = [];
    
    if (monthlyPayment > loanBalance * 0.02) {
      signs.push('Payment may be too high for your income');
      signs.push('Risk of payment default');
      signs.push('Consider income-driven repayment options');
    }
    
    if (plan === 'extended' || plan === 'graduated') {
      signs.push('Extended plans result in higher total interest costs');
      signs.push('Consider if you can afford higher payments');
    }
    
    signs.push('Missing payments can lead to default and wage garnishment');
    signs.push('Interest continues to accrue during forbearance');
    signs.push('Private loans have fewer repayment options');
    
    return signs;
  };

  const onSubmit = (values: FormValues) => {
    const calculation = calculate(values);
    if (!calculation) { setResult(null); return; }
    
    setResult({ 
      ...calculation,
      planDescription: getPlanDescription(values.repaymentPlan!),
      interpretation: interpret(calculation.monthlyPayment, values.loanBalance!, calculation.payoffTime, values.repaymentPlan!),
      recommendations: getRecommendations(values.repaymentPlan!, calculation.monthlyPayment, values.loanBalance!, values.loanType || 'federal'),
      warningSigns: getWarningSigns(values.repaymentPlan!, calculation.monthlyPayment, values.loanBalance!)
    });
  };

  return (
    <div className="space-y-8">

      {/* Input Form */}
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <GraduationCap className="h-5 w-5" />
            Student Loan Information
          </CardTitle>
          <CardDescription>
            Enter your student loan details to calculate repayment options and strategies
          </CardDescription>
        </CardHeader>
        <CardContent>
      <Form {...form}>
        <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-6">
              <div className="space-y-6">
                <div>
                  <h3 className="text-lg font-semibold mb-4 flex items-center gap-2">
                    <Calculator className="h-5 w-5 text-primary" />
                    Loan Details
                  </h3>
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                    <FormField 
                      control={form.control} 
                      name="loanBalance" 
                      render={({ field }) => (
                  <FormItem>
                          <FormLabel className="flex items-center gap-2">
                            <DollarSign className="h-4 w-4" />
                            Loan Balance
                          </FormLabel>
                    <FormControl>
                            <Input 
                              type="number" 
                              step="0.01" 
                              placeholder="e.g., 50000" 
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
                      name="interestRate" 
                      render={({ field }) => (
                  <FormItem>
                          <FormLabel className="flex items-center gap-2">
                            <TrendingUp className="h-4 w-4" />
                            Interest Rate (%)
                          </FormLabel>
                    <FormControl>
                            <Input 
                              type="number" 
                              step="0.01" 
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
                      name="loanType" 
                      render={({ field }) => (
                  <FormItem>
                          <FormLabel className="flex items-center gap-2">
                            <BookOpen className="h-4 w-4" />
                            Loan Type
                          </FormLabel>
                    <FormControl>
                            <select 
                              className="border rounded h-10 px-3 w-full bg-background" 
                              value={field.value ?? ''} 
                              onChange={(e) => field.onChange(e.target.value as any)}
                            >
                              <option value="">Select loan type</option>
                              <option value="federal">Federal Student Loan</option>
                              <option value="private">Private Student Loan</option>
                  </select>
                </FormControl>
                    <FormMessage />
                  </FormItem>
                      )} 
                    />
                    <FormField 
                      control={form.control} 
                      name="repaymentPlan" 
                      render={({ field }) => (
                  <FormItem>
                          <FormLabel className="flex items-center gap-2">
                            <Calendar className="h-4 w-4" />
                            Repayment Plan
                          </FormLabel>
                    <FormControl>
                            <select 
                              className="border rounded h-10 px-3 w-full bg-background" 
                              value={field.value ?? ''} 
                              onChange={(e) => field.onChange(e.target.value as any)}
                            >
                              <option value="">Select repayment plan</option>
                              <option value="standard">Standard (10 years)</option>
                              <option value="extended">Extended (25 years)</option>
                              <option value="graduated">Graduated (10 years)</option>
                              <option value="paye">PAYE (Income-driven)</option>
                              <option value="repaye">REPAYE (Income-driven)</option>
                              <option value="ibr">IBR (Income-driven)</option>
                              <option value="icr">ICR (Income-driven)</option>
                  </select>
                </FormControl>
                    <FormMessage />
                  </FormItem>
                      )} 
                    />
                  </div>
                </div>

                <div>
                  <h3 className="text-lg font-semibold mb-4 flex items-center gap-2">
                    <Users className="h-5 w-5 text-blue-600" />
                    Income Information (for Income-Driven Plans)
                  </h3>
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                    <FormField 
                      control={form.control} 
                      name="monthlyIncome" 
                      render={({ field }) => (
                  <FormItem>
                          <FormLabel className="flex items-center gap-2">
                            <DollarSign className="h-4 w-4" />
                            Monthly Income
                          </FormLabel>
                    <FormControl>
                            <Input 
                              type="number" 
                              step="0.01" 
                              placeholder="e.g., 4000" 
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
                      name="familySize" 
                      render={({ field }) => (
                  <FormItem>
                          <FormLabel className="flex items-center gap-2">
                            <Users className="h-4 w-4" />
                            Family Size
                          </FormLabel>
                    <FormControl>
                            <Input 
                              type="number" 
                              step="1" 
                              placeholder="e.g., 2" 
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
                            <DollarSign className="h-4 w-4" />
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
                  </div>
                </div>
          </div>
              <Button type="submit" className="w-full md:w-auto">
                Calculate Repayment Plan
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
                <GraduationCap className="h-8 w-8 text-primary" />
                <div>
                  <CardTitle>Your Student Loan Repayment Plan</CardTitle>
                  <CardDescription>Complete repayment analysis and recommendations</CardDescription>
                </div>
              </div>
            </CardHeader>
            <CardContent>
              <div className="grid grid-cols-1 md:grid-cols-3 gap-6 mb-8">
                <div className="text-center p-6 bg-primary/5 rounded-lg">
                  <div className="flex items-center justify-center gap-2 mb-2">
                    <DollarSign className="h-5 w-5 text-primary" />
                    <span className="text-sm font-medium text-muted-foreground">Monthly Payment</span>
                  </div>
                  <p className="text-3xl font-bold text-primary">
                    ${result.monthlyPayment.toLocaleString()}
                  </p>
                  <p className="text-sm text-muted-foreground mt-1">
                    {result.planDescription}
                  </p>
                </div>
                
                <div className="text-center p-6 bg-red-50 dark:bg-red-950/20 rounded-lg">
                  <div className="flex items-center justify-center gap-2 mb-2">
                    <TrendingUp className="h-5 w-5 text-red-600" />
                    <span className="text-sm font-medium text-muted-foreground">Total Interest</span>
                  </div>
                  <p className="text-3xl font-bold text-red-600">
                    ${result.totalInterest.toLocaleString()}
                  </p>
                  <p className="text-sm text-muted-foreground mt-1">
                    Interest over loan term
                  </p>
                    </div>
                
                <div className="text-center p-6 bg-green-50 dark:bg-green-950/20 rounded-lg">
                  <div className="flex items-center justify-center gap-2 mb-2">
                    <Calendar className="h-5 w-5 text-green-600" />
                    <span className="text-sm font-medium text-muted-foreground">Payoff Time</span>
                        </div>
                  <p className="text-3xl font-bold text-green-600">
                    {Math.floor(result.payoffTime / 12)} years {result.payoffTime % 12} months
                  </p>
                  <p className="text-sm text-muted-foreground mt-1">
                    {result.payoffTime} total months
                  </p>
                        </div>
                    </div>

              <div className="text-center p-6 bg-purple-50 dark:bg-purple-950/20 rounded-lg mb-6">
                <div className="flex items-center justify-center gap-2 mb-2">
                  <Calculator className="h-5 w-5 text-purple-600" />
                  <span className="text-sm font-medium text-muted-foreground">Total Cost</span>
                </div>
                <p className="text-2xl font-bold text-purple-600">
                  ${result.totalCost.toLocaleString()}
                </p>
                <p className="text-sm text-muted-foreground mt-1">
                  Including principal and interest
                </p>
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
                    <Calendar className="h-5 w-5" />
                    Payment Schedule (First 12 Months)
                  </CardTitle>
                </CardHeader>
                <CardContent>
                  <div className="overflow-x-auto">
                    <table className="w-full text-sm">
                      <thead>
                        <tr className="border-b">
                          <th className="text-left p-2">Month</th>
                          <th className="text-right p-2">Payment</th>
                          <th className="text-right p-2">Principal</th>
                          <th className="text-right p-2">Interest</th>
                          <th className="text-right p-2">Balance</th>
                        </tr>
                      </thead>
                      <tbody>
                        {result.paymentSchedule.map((payment, index) => (
                          <tr key={index} className="border-b">
                            <td className="p-2">{payment.month}</td>
                            <td className="text-right p-2">${payment.payment.toFixed(2)}</td>
                            <td className="text-right p-2">${payment.principal.toFixed(2)}</td>
                            <td className="text-right p-2">${payment.interest.toFixed(2)}</td>
                            <td className="text-right p-2">${payment.balance.toFixed(2)}</td>
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
                        Repayment Recommendations
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
              Understanding Student Loan Repayment Plans
            </CardTitle>
          </CardHeader>
          <CardContent className="space-y-4">
            <div>
              <h4 className="font-semibold text-foreground mb-2">Standard Repayment Plan</h4>
              <p className="text-muted-foreground">
                Fixed monthly payments over 10 years. Results in the lowest total interest paid but highest monthly payments. Best for borrowers who can afford higher payments.
              </p>
            </div>
            <div>
              <h4 className="font-semibold text-foreground mb-2">Income-Driven Repayment Plans</h4>
              <p className="text-muted-foreground">
                Monthly payments based on your income and family size. Payments are typically 10-20% of discretionary income. Remaining balance may be forgiven after 20-25 years.
              </p>
            </div>
            <div>
              <h4 className="font-semibold text-foreground mb-2">Extended Repayment Plan</h4>
              <p className="text-muted-foreground">
                Lower monthly payments over 25 years. Results in higher total interest paid but more manageable monthly payments. Available for loans over $30,000.
              </p>
            </div>
              <div>
              <h4 className="font-semibold text-foreground mb-2">Graduated Repayment Plan</h4>
              <p className="text-muted-foreground">
                Payments start low and increase every 2 years over 10 years. Good for borrowers who expect their income to increase over time.
              </p>
            </div>
          </CardContent>
        </Card>

        {/* Related Calculators Section */}
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <GraduationCap className="h-5 w-5" />
              Related Calculators
            </CardTitle>
            <CardDescription>
              Explore other loan and financial planning tools
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
                  <a href="/category/finance/credit-card-payoff-calculator" className="text-primary hover:underline">
                    Credit Card Payoff Calculator
                  </a>
                </h4>
                <p className="text-sm text-muted-foreground">
                  Plan your credit card debt payoff strategy
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
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <GraduationCap className="h-5 w-5" />
              Complete Guide to Student Loan Repayment
            </CardTitle>
          </CardHeader>
          <CardContent className="prose prose-sm dark:prose-invert max-w-none">
            <h3>Understanding Student Loan Repayment: Your Path to Freedom</h3>
            <p>Student loan repayment can feel overwhelming, but understanding your options is the first step to financial freedom. Federal loans offer multiple repayment plans, while private loans typically have fewer options. The key is finding the plan that fits your current financial situation and long-term goals.</p>
            
            <h3>Federal vs. Private Loans: Know Your Options</h3>
            <p>Federal student loans offer income-driven repayment plans, loan forgiveness programs, and more flexible options. Private loans typically have fixed repayment terms with fewer options for modification. If you have both types, prioritize paying off private loans first, as they're less flexible.</p>
            
            <h3>Income-Driven Repayment Plans: When Payments Are Too High</h3>
            <p>If your standard payment is unaffordable, income-driven plans cap your payment at 10-20% of your discretionary income. These plans can provide relief in the short term, but may result in higher total interest paid over the long term. Consider your career trajectory and income potential.</p>
            
            <h3>Loan Forgiveness Programs: The Long-Term Strategy</h3>
            <p>Public Service Loan Forgiveness (PSLF) forgives remaining federal loan balance after 10 years of qualifying payments while working for qualifying employers. Teacher Loan Forgiveness offers forgiveness for teachers in low-income schools. These programs require careful planning and documentation.</p>
            
            <h3>Building Wealth While Paying Off Student Loans</h3>
            <p>Don't let student loans prevent you from building wealth. If you have low-interest federal loans, consider investing extra money rather than paying off loans early. However, high-interest private loans should be prioritized. Balance debt payoff with other financial goals like retirement savings.</p>
          </CardContent>
        </Card>

        {/* FAQ Section */}
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <Info className="h-5 w-5" />
              Frequently Asked Questions
            </CardTitle>
            <CardDescription>
              Common questions about student loan repayment
            </CardDescription>
          </CardHeader>
          <CardContent className="space-y-6">
            <div>
              <h4 className="font-semibold text-foreground mb-2">What's the difference between federal and private student loans?</h4>
              <p className="text-muted-foreground">
                Federal loans offer income-driven repayment plans, loan forgiveness programs, and more flexible repayment options. Private loans typically have fewer repayment options and no forgiveness programs.
              </p>
            </div>

            <div>
              <h4 className="font-semibold text-foreground mb-2">Should I choose an income-driven repayment plan?</h4>
              <p className="text-muted-foreground">
                Income-driven plans are good if your payments would be unaffordable under standard repayment, or if you're pursuing Public Service Loan Forgiveness. However, you may pay more interest over the long term.
              </p>
            </div>

            <div>
              <h4 className="font-semibold text-foreground mb-2">What is Public Service Loan Forgiveness (PSLF)?</h4>
              <p className="text-muted-foreground">
                PSLF forgives remaining federal student loan balance after 120 qualifying payments (10 years) while working full-time for a qualifying employer. You must be on an income-driven repayment plan.
              </p>
            </div>

            <div>
              <h4 className="font-semibold text-foreground mb-2">Should I refinance my student loans?</h4>
              <p className="text-muted-foreground">
                Refinancing can lower your interest rate and monthly payment, but you'll lose federal loan benefits like income-driven repayment and forgiveness programs. Consider your job security and career goals.
              </p>
            </div>

            <div>
              <h4 className="font-semibold text-foreground mb-2">What happens if I can't make my payments?</h4>
              <p className="text-muted-foreground">
                Contact your loan servicer immediately. You may qualify for deferment, forbearance, or income-driven repayment plans. Defaulting can result in wage garnishment, tax refund seizure, and credit damage.
              </p>
            </div>

            <div>
              <h4 className="font-semibold text-foreground mb-2">How do I qualify for loan forgiveness?</h4>
              <p className="text-muted-foreground">
                Federal loans may be forgiven through PSLF (10 years of qualifying payments), Teacher Loan Forgiveness (5 years of teaching), or income-driven repayment (20-25 years of payments). Private loans typically don't offer forgiveness.
              </p>
            </div>
          </CardContent>
        </Card>
    </div>
    </div>
  );
}
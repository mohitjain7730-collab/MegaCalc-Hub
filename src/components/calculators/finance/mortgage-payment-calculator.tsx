'use client';

import { useState } from 'react';
import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import { z } from 'zod';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Form, FormControl, FormField, FormItem, FormLabel, FormMessage } from '@/components/ui/form';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Home, Calculator, DollarSign, TrendingUp, Info, AlertCircle, Target, Calendar, Building, Shield } from 'lucide-react';
import { Badge } from '@/components/ui/badge';
import { Alert, AlertDescription } from '@/components/ui/alert';

const formSchema = z.object({
  loanAmount: z.number().min(0).optional(),
  interestRate: z.number().min(0).max(50).optional(),
  loanTerm: z.number().min(1).max(50).optional(),
  propertyTax: z.number().min(0).optional(),
  homeInsurance: z.number().min(0).optional(),
  pmi: z.number().min(0).optional(),
  hoa: z.number().min(0).optional(),
  downPayment: z.number().min(0).optional(),
  propertyValue: z.number().min(0).optional(),
});

type FormValues = z.infer<typeof formSchema>;

export default function MortgagePaymentCalculator() {
  const [result, setResult] = useState<{ 
    principalAndInterest: number;
    totalMonthlyPayment: number;
    totalInterest: number;
    totalCost: number;
    loanToValue: number;
    interpretation: string;
    recommendations: string[];
    warningSigns: string[];
    amortizationSchedule: { month: number; payment: number; principal: number; interest: number; balance: number }[];
  } | null>(null);

  const form = useForm<FormValues>({
    resolver: zodResolver(formSchema),
    defaultValues: {
      loanAmount: undefined,
      interestRate: undefined, 
      loanTerm: undefined, 
      propertyTax: undefined,
      homeInsurance: undefined,
      pmi: undefined,
      hoa: undefined,
      downPayment: undefined,
      propertyValue: undefined
    } 
  });

  const calculateMortgagePayment = (principal: number, rate: number, term: number) => {
    const monthlyRate = rate / 100 / 12;
    const numPayments = term * 12;
    
    if (monthlyRate === 0) {
      return principal / numPayments;
    }
    
    const payment = principal * (monthlyRate * Math.pow(1 + monthlyRate, numPayments)) / 
                   (Math.pow(1 + monthlyRate, numPayments) - 1);
    
    return payment;
  };

  const calculateAmortization = (principal: number, rate: number, term: number, payment: number) => {
    const monthlyRate = rate / 100 / 12;
    const numPayments = term * 12;
    const schedule = [];
    let balance = principal;

    for (let month = 1; month <= Math.min(numPayments, 12); month++) {
      const interestPayment = balance * monthlyRate;
      const principalPayment = payment - interestPayment;
      balance -= principalPayment;

      schedule.push({
        month,
        payment,
        principal: principalPayment,
        interest: interestPayment,
        balance: Math.max(0, balance)
      });
    }

    return schedule;
  };

  const calculate = (v: FormValues) => {
    if (v.loanAmount == null || v.interestRate == null || v.loanTerm == null) return null;
    
    const principalAndInterest = calculateMortgagePayment(v.loanAmount, v.interestRate, v.loanTerm);
    const propertyTax = (v.propertyTax || 0) / 12;
    const homeInsurance = (v.homeInsurance || 0) / 12;
    const pmi = (v.pmi || 0) / 12;
    const hoa = (v.hoa || 0) / 12;
    
    const totalMonthlyPayment = principalAndInterest + propertyTax + homeInsurance + pmi + hoa;
    const totalInterest = (principalAndInterest * v.loanTerm * 12) - v.loanAmount;
    const totalCost = v.loanAmount + totalInterest + (v.propertyTax || 0) * v.loanTerm + (v.homeInsurance || 0) * v.loanTerm + (v.pmi || 0) * v.loanTerm + (v.hoa || 0) * v.loanTerm;
    
    const loanToValue = v.propertyValue ? (v.loanAmount / v.propertyValue) * 100 : 0;
    
    return { 
      principalAndInterest, 
      totalMonthlyPayment, 
      totalInterest, 
      totalCost, 
      loanToValue,
      amortizationSchedule: calculateAmortization(v.loanAmount, v.interestRate, v.loanTerm, principalAndInterest)
    };
  };

  const interpret = (totalPayment: number, loanAmount: number, loanToValue: number) => {
    const paymentToIncome = (totalPayment * 12) / (loanAmount * 0.1); // Rough estimate
    
    if (loanToValue > 95) return 'High LTV—consider larger down payment to avoid PMI.';
    if (paymentToIncome > 0.3) return 'High payment-to-income ratio—ensure you can afford this payment.';
    if (totalPayment > loanAmount * 0.01) return 'Moderate payment—review your budget carefully.';
    return 'Reasonable payment—good mortgage terms.';
  };

  const getRecommendations = (loanToValue: number, totalPayment: number, loanAmount: number) => {
    const recommendations = [];
    
    if (loanToValue > 95) {
      recommendations.push('Consider larger down payment to eliminate PMI');
      recommendations.push('Look into first-time homebuyer programs');
      recommendations.push('Save more before purchasing');
    } else if (loanToValue > 80) {
      recommendations.push('Make extra principal payments to reach 80% LTV');
      recommendations.push('Consider PMI removal options');
      recommendations.push('Build equity faster with additional payments');
    }
    
    if (totalPayment > loanAmount * 0.01) {
      recommendations.push('Ensure emergency fund covers 3-6 months of payments');
      recommendations.push('Consider shorter loan term if budget allows');
      recommendations.push('Shop around for better interest rates');
    }
    
    recommendations.push('Get pre-approved before house hunting');
    recommendations.push('Factor in maintenance costs (1-2% of home value annually)');
    recommendations.push('Consider future income stability');
    
    return recommendations;
  };

  const getWarningSigns = (loanToValue: number, totalPayment: number, loanAmount: number) => {
    const signs = [];
    
    if (loanToValue > 95) {
      signs.push('Very high loan-to-value ratio');
      signs.push('PMI will be required and expensive');
      signs.push('Little equity cushion for market downturns');
    }
    
    if (totalPayment > loanAmount * 0.015) {
      signs.push('Payment may be too high for your income');
      signs.push('Little room for unexpected expenses');
      signs.push('Risk of becoming house poor');
    }
    
    signs.push('No emergency fund for unexpected repairs');
    signs.push('Interest rate may be too high');
    signs.push('Loan term may be too long');
    
    return signs;
  };

  const onSubmit = (values: FormValues) => {
    const calculation = calculate(values);
    if (!calculation) { setResult(null); return; }
    
    setResult({ 
      ...calculation,
      interpretation: interpret(calculation.totalMonthlyPayment, values.loanAmount!, calculation.loanToValue),
      recommendations: getRecommendations(calculation.loanToValue, calculation.totalMonthlyPayment, values.loanAmount!),
      warningSigns: getWarningSigns(calculation.loanToValue, calculation.totalMonthlyPayment, values.loanAmount!)
    });
  };

  return (
    <div className="space-y-8">

      {/* Input Form */}
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <Home className="h-5 w-5" />
            Mortgage Information
          </CardTitle>
          <CardDescription>
            Enter your mortgage details to calculate monthly payments and total costs
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
                              step="0.01" 
                              placeholder="e.g., 300000" 
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
                      name="loanTerm" 
                      render={({ field }) => (
                  <FormItem>
                          <FormLabel className="flex items-center gap-2">
                            <Calendar className="h-4 w-4" />
                            Loan Term (Years)
                          </FormLabel>
                    <FormControl>
                            <Input 
                              type="number" 
                              step="1" 
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
                    <FormField 
                      control={form.control} 
                      name="downPayment" 
                      render={({ field }) => (
                  <FormItem>
                          <FormLabel className="flex items-center gap-2">
                            <DollarSign className="h-4 w-4" />
                            Down Payment
                          </FormLabel>
                    <FormControl>
                            <Input 
                              type="number" 
                              step="0.01" 
                              placeholder="e.g., 60000" 
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
                      name="propertyValue" 
                      render={({ field }) => (
                  <FormItem>
                          <FormLabel className="flex items-center gap-2">
                            <Home className="h-4 w-4" />
                            Property Value
                          </FormLabel>
                    <FormControl>
                            <Input 
                              type="number" 
                              step="0.01" 
                              placeholder="e.g., 400000" 
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

                <div>
                  <h3 className="text-lg font-semibold mb-4 flex items-center gap-2">
                    <Building className="h-5 w-5 text-blue-600" />
                    Additional Costs
                  </h3>
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                    <FormField 
                      control={form.control} 
                      name="propertyTax" 
                      render={({ field }) => (
                  <FormItem>
                          <FormLabel className="flex items-center gap-2">
                            <Building className="h-4 w-4" />
                            Annual Property Tax
                          </FormLabel>
                    <FormControl>
                            <Input 
                              type="number" 
                              step="0.01" 
                              placeholder="e.g., 4800" 
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
                      name="homeInsurance" 
                      render={({ field }) => (
                  <FormItem>
                          <FormLabel className="flex items-center gap-2">
                            <Shield className="h-4 w-4" />
                            Annual Home Insurance
                          </FormLabel>
                    <FormControl>
                            <Input 
                              type="number" 
                              step="0.01" 
                              placeholder="e.g., 1200" 
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
                      name="pmi" 
                      render={({ field }) => (
                  <FormItem>
                          <FormLabel className="flex items-center gap-2">
                            <Shield className="h-4 w-4" />
                            Annual PMI
                          </FormLabel>
                    <FormControl>
                            <Input 
                              type="number" 
                              step="0.01" 
                              placeholder="e.g., 2400" 
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
                      name="hoa" 
                      render={({ field }) => (
                  <FormItem>
                          <FormLabel className="flex items-center gap-2">
                            <Building className="h-4 w-4" />
                            Annual HOA Fees
                          </FormLabel>
                    <FormControl>
                            <Input 
                              type="number" 
                              step="0.01" 
                              placeholder="e.g., 2400" 
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
                Calculate Mortgage Payment
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
                <Home className="h-8 w-8 text-primary" />
                <div>
                  <CardTitle>Your Mortgage Payment Breakdown</CardTitle>
                  <CardDescription>Complete monthly payment analysis and recommendations</CardDescription>
                </div>
              </div>
            </CardHeader>
            <CardContent>
              <div className="grid grid-cols-1 md:grid-cols-3 gap-6 mb-8">
                <div className="text-center p-6 bg-primary/5 rounded-lg">
                  <div className="flex items-center justify-center gap-2 mb-2">
                    <DollarSign className="h-5 w-5 text-primary" />
                    <span className="text-sm font-medium text-muted-foreground">Principal & Interest</span>
                  </div>
                  <p className="text-3xl font-bold text-primary">
                    ${result.principalAndInterest.toLocaleString()}
                  </p>
                  <p className="text-sm text-muted-foreground mt-1">
                    Monthly P&I payment
                  </p>
                </div>
                
                <div className="text-center p-6 bg-green-50 dark:bg-green-950/20 rounded-lg">
                  <div className="flex items-center justify-center gap-2 mb-2">
                    <Calculator className="h-5 w-5 text-green-600" />
                    <span className="text-sm font-medium text-muted-foreground">Total Monthly Payment</span>
                  </div>
                  <p className="text-3xl font-bold text-green-600">
                    ${result.totalMonthlyPayment.toLocaleString()}
                  </p>
                  <p className="text-sm text-muted-foreground mt-1">
                    Including taxes, insurance, PMI, HOA
                  </p>
                    </div>
                
                <div className="text-center p-6 bg-blue-50 dark:bg-blue-950/20 rounded-lg">
                  <div className="flex items-center justify-center gap-2 mb-2">
                    <TrendingUp className="h-5 w-5 text-blue-600" />
                    <span className="text-sm font-medium text-muted-foreground">Total Interest</span>
                        </div>
                  <p className="text-3xl font-bold text-blue-600">
                    ${result.totalInterest.toLocaleString()}
                  </p>
                  <p className="text-sm text-muted-foreground mt-1">
                    Interest over loan term
                  </p>
                        </div>
                    </div>

              <div className="grid grid-cols-1 md:grid-cols-2 gap-6 mb-8">
                <div className="text-center p-6 bg-purple-50 dark:bg-purple-950/20 rounded-lg">
                  <div className="flex items-center justify-center gap-2 mb-2">
                    <Calculator className="h-5 w-5 text-purple-600" />
                    <span className="text-sm font-medium text-muted-foreground">Total Cost</span>
                  </div>
                  <p className="text-2xl font-bold text-purple-600">
                    ${result.totalCost.toLocaleString()}
                  </p>
                  <p className="text-sm text-muted-foreground mt-1">
                    Including all costs over loan term
                  </p>
                </div>
                
                <div className="text-center p-6 bg-orange-50 dark:bg-orange-950/20 rounded-lg">
                  <div className="flex items-center justify-center gap-2 mb-2">
                    <Home className="h-5 w-5 text-orange-600" />
                    <span className="text-sm font-medium text-muted-foreground">Loan-to-Value</span>
                  </div>
                  <p className="text-2xl font-bold text-orange-600">
                    {result.loanToValue.toFixed(1)}%
                  </p>
                  <p className="text-sm text-muted-foreground mt-1">
                    {result.loanToValue > 80 ? 'PMI Required' : 'No PMI Required'}
                  </p>
                </div>
              </div>

              <Alert className="mb-6">
                <Info className="h-4 w-4" />
                <AlertDescription>
                  {result.interpretation}
                </AlertDescription>
              </Alert>

              {/* Amortization Schedule Preview */}
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
                        {result.amortizationSchedule.map((payment, index) => (
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
                        Mortgage Recommendations
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
              Understanding Mortgage Payments
            </CardTitle>
          </CardHeader>
          <CardContent className="space-y-4">
            <div>
              <h4 className="font-semibold text-foreground mb-2">Principal and Interest (P&I)</h4>
              <p className="text-muted-foreground">
                The core mortgage payment that goes toward paying down the loan balance and interest. This is calculated using the loan amount, interest rate, and term.
              </p>
            </div>
              <div>
              <h4 className="font-semibold text-foreground mb-2">Property Taxes</h4>
              <p className="text-muted-foreground">
                Annual taxes assessed by local government, typically paid monthly through escrow. Rates vary by location and property value.
              </p>
              </div>
              <div>
              <h4 className="font-semibold text-foreground mb-2">Home Insurance</h4>
              <p className="text-muted-foreground">
                Required insurance to protect against damage to the property. Lenders require this coverage and it's often paid through escrow.
              </p>
              </div>
              <div>
              <h4 className="font-semibold text-foreground mb-2">PMI (Private Mortgage Insurance)</h4>
              <p className="text-muted-foreground">
                Required when down payment is less than 20% of the home value. PMI protects the lender and adds to monthly costs until 80% LTV is reached.
              </p>
              </div>
          </CardContent>
        </Card>

        {/* Related Calculators Section */}
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <Home className="h-5 w-5" />
              Related Calculators
            </CardTitle>
            <CardDescription>
              Explore other home buying and financial planning tools
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
                  <a href="/category/finance/mortgage-refinance-savings-calculator" className="text-primary hover:underline">
                    Mortgage Refinance Calculator
                  </a>
                </h4>
                <p className="text-sm text-muted-foreground">
                  Calculate refinancing savings and costs
                </p>
              </div>
              <div className="p-4 border rounded-lg hover:bg-muted/50 transition-colors">
                <h4 className="font-semibold mb-2">
                  <a href="/category/finance/real-estate-cash-on-cash-return-calculator" className="text-primary hover:underline">
                    Real Estate Cash-on-Cash Return
                  </a>
                </h4>
                <p className="text-sm text-muted-foreground">
                  Calculate real estate investment returns
                </p>
              </div>
              <div className="p-4 border rounded-lg hover:bg-muted/50 transition-colors">
                <h4 className="font-semibold mb-2">
                  <a href="/category/finance/rental-property-cap-rate-calculator" className="text-primary hover:underline">
                    Rental Property Cap Rate Calculator
                  </a>
                </h4>
                <p className="text-sm text-muted-foreground">
                  Calculate rental property capitalization rates
                </p>
              </div>
            </div>
          </CardContent>
        </Card>

        {/* Guide Section */}
        <section className="space-y-6 text-muted-foreground leading-relaxed bg-card p-6 md:p-10 rounded-lg shadow-lg" itemScope itemType="https://schema.org/FinanceSummary">
    {/* SEO & SCHEMA METADATA (HIGHLY OPTIMIZED) */}
    <meta itemProp="name" content="The Definitive Guide to Mortgage Payments, Amortization, and Total Interest Cost" />
    <meta itemProp="description" content="An expert guide detailing the mortgage payment (PMT) formula, the mechanics of fixed-rate amortization, how to calculate the principal-interest split, and strategies for accelerating mortgage payoff." />
    <meta itemProp="keywords" content="mortgage payment formula explained, loan amortization schedule, principal and interest split, fixed-rate mortgage mechanics, private mortgage insurance (PMI), escrow and taxes in mortgage payment, debt service ratio" />
    <meta itemProp="author" content="[Your Site's Financial Analyst Team]" />
    <meta itemProp="datePublished" content="2025-10-25" /> 
    <meta itemProp="url" content="/definitive-mortgage-payment-guide" />

    <h1 className="text-3xl md:text-4xl font-extrabold text-foreground mb-4" itemProp="headline">The Definitive Guide to Mortgage Payments: Mastering Amortization and Homeownership Costs</h1>
    <p className="text-lg italic text-muted-foreground">Unlock the exact calculation that determines your monthly housing cost and understand the process of building home equity over decades.</p>

    {/* TABLE OF CONTENTS (INTERNAL LINKS FOR UX AND SEO) */}
    <h2 className="text-2xl font-bold text-foreground mt-8 mb-4">Table of Contents: Jump to a Section</h2>
    <ul className="list-disc ml-6 space-y-2 text-primary">
        <li><a href="#payment-components" className="hover:underline">The Four Components of a Total Mortgage Payment</a></li>
        <li><a href="#amortization-pmt" className="hover:underline">The Amortization Formula and Monthly Payment Calculation</a></li>
        <li><a href="#principal-interest" className="hover:underline">Principal vs. Interest: The Amortization Split</a></li>
        <li><a href="#equity-building" className="hover:underline">Building Equity and the Role of Prepayments</a></li>
        <li><a href="#cost-analysis" className="hover:underline">Loan Structure Variables and Total Cost Analysis</a></li>
    </ul>
<hr />

    {/* THE FOUR COMPONENTS OF A TOTAL MORTGAGE PAYMENT */}
    <h2 id="payment-components" className="text-2xl font-bold text-foreground pt-8" itemProp="articleSection">The Four Components of a Total Mortgage Payment</h2>
    <p>While the core mortgage payment is calculated using a strict financial formula, the total monthly amount paid by a homeowner often includes three other components, frequently bundled together into what is known as the <strong className="font-semibold">PITI</strong> payment.</p>

    <h3 className="text-xl font-semibold text-foreground mt-6">PITI Breakdown</h3>
    <ol className="list-decimal ml-6 space-y-2">
        <li><strong className="font-semibold">Principal:</strong> The portion of the payment that reduces the outstanding loan balance.</li>
        <li><strong className="font-semibold">Interest:</strong> The charge levied by the lender, calculated on the remaining principal balance. This is the cost of borrowing.</li>
        <li><strong className="font-semibold">Taxes (Property):</strong> An estimated portion of the annual property taxes, collected monthly by the lender and held in escrow.</li>
        <li><strong className="font-semibold">Insurance (Homeowner’s and Mortgage):</strong> Includes the monthly portion of the annual homeowner’s insurance premium, plus, potentially, Private Mortgage Insurance (PMI).</li>
    </ol>
    <p>Only the <strong className="font-semibold">Principal</strong> and <strong className="font-semibold">Interest</strong> components are calculated using the amortization formula, which is the focus of financial analysis. The Taxes and Insurance components vary based on the property and local rates, not the loan amount itself.</p>

<hr />

    {/* THE AMORTIZATION FORMULA AND MONTHLY PAYMENT (PMT) */}
    <h2 id="amortization-pmt" className="text-2xl font-bold text-foreground pt-8" itemProp="articleSection">The Amortization Formula and Monthly Payment Calculation</h2>
    <p>The mortgage payment is the most complex and long-lasting application of the <strong className="font-semibold">Present Value of Annuity</strong> formula. The loan principal is the <strong className="font-semibold">Present Value</strong> (PV), and the mortgage payment is the fixed monthly payment required to fully pay off that Present Value over a set tenure (n).</p>

    <h3 className="text-xl font-semibold text-foreground mt-6">The Fixed-Rate Mortgage Payment (PMT) Formula</h3>
    <p>This is the standard formula for a conventional fixed-rate loan, solving for the monthly Principal and Interest payment</p>
    
    <div className="overflow-x-auto my-6 p-4 bg-muted border rounded-lg text-center">
        <p className="font-mono text-xl text-destructive font-bold">
            {'PMT = P * r * [ (1 + r)^n / ((1 + r)^n - 1) ]'}
        </p>
    </div>

    <p>Where:</p>
    <ul className="list-disc ml-6 space-y-2">
        <li>P = Principal (Initial Loan Amount)</li>
        <li>r = Monthly Interest Rate (Annual Rate $\div$ 12)</li>
        <li>n = Total Number of Payments (Loan Term in Years $\times$ 12)</li>
    </ul>
    <p>The <strong className="font-semibold">Capital Recovery Factor</strong> (the bracketed term) ensures that the fixed monthly payment exactly covers the interest charged on the reducing principal and fully repays the loan by the end of the term (e.g., 360 months for a 30-year loan).</p>

<hr />

    {/* PRINCIPAL VS. INTEREST: THE AMORTIZATION SPLIT */}
    <h2 id="principal-interest" className="text-2xl font-bold text-foreground pt-8" itemProp="articleSection">Principal vs. Interest: The Amortization Split</h2>
    <p>While the Principal and Interest payment is fixed, the way that payment is split between interest and principal changes monthly, following a strict <strong className="font-semibold">amortization schedule</strong>. This schedule is based on the <strong className="font-semibold">reducing balance method</strong>.</p>

    <h3 className="text-xl font-semibold text-foreground mt-6">The Front-Loaded Cost Structure</h3>
    <p>The mortgage amortization schedule is heavily <strong className="font-semibold">front-loaded with interest</strong>:</p>
    <ol className="list-decimal ml-6 space-y-2">
        <li><strong className="font-semibold">Interest First:</strong> For any given month, the interest due is calculated on the <strong className="font-semibold">entire remaining Principal balance</strong> from the prior month.</li>
        <li><strong className="font-semibold">Early Years:</strong> In the first few years of a 30-year mortgage, typically 70% to 90% of the fixed monthly payment is dedicated to interest, with only 10% to 30% reducing the Principal.</li>
        <li><strong className="font-semibold">Later Years:</strong> This ratio gradually flips. By the final years, nearly 100% of the payment goes toward the Principal, as the remaining balance is very small.</li>
    </ol>
    <p>This front-loaded structure means that if a loan is terminated early, the borrower will have paid a disproportionately high amount of interest relative to the principal reduction achieved.</p>

<hr />

    {/* BUILDING EQUITY AND THE ROLE OF PREPAYMENTS */}
    <h2 id="equity-building" className="text-2xl font-bold text-foreground pt-8" itemProp="articleSection">Building Equity and the Role of Prepayments</h2>
    <p><strong className="font-semibold">Home Equity</strong> is the difference between the current market value of the home and the outstanding mortgage balance. Mortgage payments build equity through the principal repayment component, while property appreciation contributes to the overall value.</p>

    <h3 className="text-xl font-semibold text-foreground mt-6">The Power of Extra Principal Payments</h3>
    <p>Because interest is calculated only on the remaining Principal, prepayments made early in the loan lifecycle yield the greatest financial return. Any payment exceeding the required Principal and Interest amount is immediately applied to the Principal, effectively reducing the interest base for all subsequent months.</p>
    <p>For example, adding one extra Principal payment per year to a 30-year mortgage typically reduces the loan term by four to seven years and saves tens of thousands in interest, without changing the calculated monthly payment.</p>

    <h3 className="text-xl font-semibold text-foreground mt-6">Private Mortgage Insurance (PMI)</h3>
    <p>If the borrower makes a down payment of less than 20% of the home's value, the lender typically requires the purchase of **Private Mortgage Insurance (PMI)**, which protects the lender against default. PMI is usually included in the PITI payment. Homeowners can request to have PMI removed once their Loan-to-Value (LTV) ratio reaches 80% (i.e., when they have 20% equity), further reducing their total monthly cost.</p>

<hr />

    {/* LOAN STRUCTURE VARIABLES AND TOTAL COST ANALYSIS */}
    <h2 id="cost-analysis" className="text-2xl font-bold text-foreground pt-8" itemProp="articleSection">Loan Structure Variables and Total Cost Analysis</h2>
    <p>The structure of the loan—rate, term, and frequency—dramatically affects the monthly payment and the total interest paid over the life of the mortgage.</p>

    <h3 className="text-xl font-semibold text-foreground mt-6">Impact of Loan Term</h3>
    <p>The choice between a 30-year and a 15-year mortgage involves a critical trade-off:</p>
    <ul className="list-disc ml-6 space-y-2">
        <li><strong className="font-semibold">30-Year Term:</strong> Offers a lower monthly payment, improving cash flow and debt-to-income ratio, but results in a significantly higher total interest cost.</li>
        <li><strong className="font-semibold">15-Year Term:</strong> Requires a much higher monthly payment but drastically reduces the total interest paid (often saving the borrower hundreds of thousands of dollars) and accelerates equity growth.</li>
    </ul>

    <h3 className="text-xl font-semibold text-foreground mt-6">Interest Rate Sensitivity</h3>
    <p>Because the mortgage term is so long (360 payments for 30 years), the monthly payment is highly sensitive to the interest rate. A 1% increase in the rate can increase the monthly payment by 10% to 15% and increase the total interest paid by over 20%.</p>

<hr />

    {/* CONCLUSION */}
    <h2 className="text-2xl font-bold text-foreground pt-8" itemProp="articleSection">Conclusion</h2>
    <p>The mortgage payment is the primary financial mechanism of homeownership, defined by the rigorous mathematics of the amortization formula. It serves as an annuity calculation that determines the fixed monthly Principal and Interest payment necessary to repay the loan Principal and accrued interest over the loan term.</p>
    <p>True financial literacy in homeownership lies in understanding the <strong className="font-semibold">front-loaded interest structure</strong> and recognizing the financial power of targeted Principal prepayments. By optimizing the loan term and consistently accelerating Principal reduction, homeowners can minimize total cost and rapidly transform debt into valuable home equity.</p>
</section>

        {/* FAQ Section */}
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <Info className="h-5 w-5" />
              Frequently Asked Questions
            </CardTitle>
            <CardDescription>
              Common questions about mortgage payments and home buying
            </CardDescription>
          </CardHeader>
          <CardContent className="space-y-6">
            <div>
              <h4 className="font-semibold text-foreground mb-2">What's the difference between fixed and adjustable rate mortgages?</h4>
              <p className="text-muted-foreground">
                Fixed-rate mortgages have the same interest rate for the entire loan term, providing predictable payments. Adjustable-rate mortgages (ARMs) have rates that can change after an initial fixed period, potentially offering lower initial rates but with payment uncertainty.
              </p>
            </div>

            <div>
              <h4 className="font-semibold text-foreground mb-2">How much house can I afford?</h4>
              <p className="text-muted-foreground">
                Generally, your total monthly housing payment (P&I, taxes, insurance, PMI, HOA) should not exceed 28% of your gross monthly income. Your total debt payments should not exceed 36% of your gross monthly income.
              </p>
            </div>

            <div>
              <h4 className="font-semibold text-foreground mb-2">Should I make extra principal payments?</h4>
              <p className="text-muted-foreground">
                Extra principal payments can significantly reduce total interest paid and loan term. However, consider if you could earn more by investing the extra money, especially if your mortgage rate is low.
              </p>
            </div>

            <div>
              <h4 className="font-semibold text-foreground mb-2">What is PMI and when can I remove it?</h4>
              <p className="text-muted-foreground">
                PMI is required when your loan-to-value ratio exceeds 80%. You can typically remove it when you reach 80% LTV through payments or home value appreciation, or when you reach 78% LTV automatically.
              </p>
            </div>

            <div>
              <h4 className="font-semibold text-foreground mb-2">Should I choose a 15-year or 30-year mortgage?</h4>
              <p className="text-muted-foreground">
                15-year mortgages have higher monthly payments but lower interest rates and total interest costs. 30-year mortgages have lower monthly payments but higher total interest. Choose based on your budget and financial goals.
              </p>
            </div>

            <div>
              <h4 className="font-semibold text-foreground mb-2">What closing costs should I expect?</h4>
              <p className="text-muted-foreground">
                Closing costs typically range from 2-5% of the loan amount and include loan origination fees, appraisal, title insurance, attorney fees, and prepaid items like taxes and insurance.
              </p>
            </div>
          </CardContent>
        </Card>
    </div>
    </div>
  );
}
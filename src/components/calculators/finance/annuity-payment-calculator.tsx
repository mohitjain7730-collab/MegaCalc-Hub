'use client';

import { useState } from 'react';
import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import { z } from 'zod';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Form, FormControl, FormField, FormItem, FormLabel, FormMessage } from '@/components/ui/form';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Calculator, DollarSign, TrendingUp, Info, AlertCircle, Target, Calendar, BarChart, CreditCard } from 'lucide-react';
import { Badge } from '@/components/ui/badge';
import { Alert, AlertDescription } from '@/components/ui/alert';

const formSchema = z.object({
  presentValue: z.number().min(0).optional(),
  futureValue: z.number().min(0).optional(),
  interestRate: z.number().min(0).max(100).optional(),
  timePeriod: z.number().min(1).max(100).optional(),
  compoundingFrequency: z.enum(['annual', 'semi-annual', 'quarterly', 'monthly', 'daily']).optional(),
  calculationType: z.enum(['present-value', 'future-value', 'loan-payment', 'retirement-income']).optional(),
  annuityType: z.enum(['ordinary', 'due']).optional(),
});

type FormValues = z.infer<typeof formSchema>;

export default function AnnuityPaymentCalculator() {
  const [result, setResult] = useState<{ 
    paymentAmount: number;
    totalPayments: number;
    totalInterest: number;
    interpretation: string;
    recommendations: string[];
    warningSigns: string[];
    paymentSchedule: { period: number; payment: number; principal: number; interest: number; balance: number }[];
    calculationType: string;
  } | null>(null);

  const form = useForm<FormValues>({ 
    resolver: zodResolver(formSchema), 
    defaultValues: { 
      presentValue: undefined, 
      futureValue: undefined, 
      interestRate: undefined, 
      timePeriod: undefined, 
      compoundingFrequency: undefined,
      calculationType: undefined,
      annuityType: undefined
    } 
  });

  const getCompoundingFrequency = (frequency: string) => {
    const frequencies = {
      'annual': 1,
      'semi-annual': 2,
      'quarterly': 4,
      'monthly': 12,
      'daily': 365
    };
    return frequencies[frequency as keyof typeof frequencies] || 1;
  };

  const calculateAnnuityPayment = (presentValue: number, rate: number, periods: number, compounding: number, isDue: boolean = false) => {
    const periodicRate = rate / 100 / compounding;
    const totalPeriods = periods * compounding;
    
    if (periodicRate === 0) {
      return presentValue / totalPeriods;
    }
    
    const payment = presentValue * (periodicRate * Math.pow(1 + periodicRate, totalPeriods)) / 
                   (Math.pow(1 + periodicRate, totalPeriods) - 1);
    
    return isDue ? payment / (1 + periodicRate) : payment;
  };

  const calculateAnnuityFromFV = (futureValue: number, rate: number, periods: number, compounding: number, isDue: boolean = false) => {
    const periodicRate = rate / 100 / compounding;
    const totalPeriods = periods * compounding;
    
    if (periodicRate === 0) {
      return futureValue / totalPeriods;
    }
    
    const payment = futureValue * periodicRate / (Math.pow(1 + periodicRate, totalPeriods) - 1);
    
    return isDue ? payment * (1 + periodicRate) : payment;
  };

  const calculate = (v: FormValues) => {
    if (v.interestRate == null || v.timePeriod == null || v.calculationType == null) return null;
    
    const compounding = getCompoundingFrequency(v.compoundingFrequency || 'annual');
    const isDue = v.annuityType === 'due';
    let paymentAmount = 0;
    let totalPayments = 0;
    let totalInterest = 0;
    
    switch (v.calculationType) {
      case 'present-value':
        if (v.presentValue == null) return null;
        paymentAmount = calculateAnnuityPayment(v.presentValue, v.interestRate, v.timePeriod, compounding, isDue);
        totalPayments = paymentAmount * v.timePeriod * compounding;
        totalInterest = totalPayments - v.presentValue;
        break;
      case 'future-value':
        if (v.futureValue == null) return null;
        paymentAmount = calculateAnnuityFromFV(v.futureValue, v.interestRate, v.timePeriod, compounding, isDue);
        totalPayments = paymentAmount * v.timePeriod * compounding;
        totalInterest = v.futureValue - totalPayments;
        break;
      case 'loan-payment':
        if (v.presentValue == null) return null;
        paymentAmount = calculateAnnuityPayment(v.presentValue, v.interestRate, v.timePeriod, compounding, isDue);
        totalPayments = paymentAmount * v.timePeriod * compounding;
        totalInterest = totalPayments - v.presentValue;
        break;
      case 'retirement-income':
        if (v.presentValue == null) return null;
        paymentAmount = calculateAnnuityPayment(v.presentValue, v.interestRate, v.timePeriod, compounding, isDue);
        totalPayments = paymentAmount * v.timePeriod * compounding;
        totalInterest = totalPayments - v.presentValue;
        break;
    }
    
    // Generate payment schedule
    const paymentSchedule = [];
    let balance = v.presentValue || 0;
    const totalPeriods = v.timePeriod * compounding;
    
    for (let period = 1; period <= Math.min(totalPeriods, 12); period++) {
      const interestPayment = balance * (v.interestRate! / 100 / compounding);
      const principalPayment = paymentAmount - interestPayment;
      balance -= principalPayment;
      
      paymentSchedule.push({
        period,
        payment: paymentAmount,
        principal: principalPayment,
        interest: interestPayment,
        balance: Math.max(0, balance)
      });
    }
    
    return { paymentAmount, totalPayments, totalInterest, paymentSchedule };
  };

  const interpret = (paymentAmount: number, totalInterest: number, interestRate: number, calculationType: string) => {
    const interestPercentage = (totalInterest / (paymentAmount * 12)) * 100;
    
    if (calculationType === 'loan-payment') {
      if (interestPercentage > 50) return 'High interest cost relative to payment amount. Consider refinancing or paying extra principal.';
      if (interestPercentage > 25) return 'Moderate interest cost. Review your loan terms and consider acceleration strategies.';
      return 'Reasonable interest cost. Your loan terms appear favorable.';
    }
    
    if (calculationType === 'retirement-income') {
      if (paymentAmount < 1000) return 'Low retirement income. Consider increasing savings or working longer.';
      if (paymentAmount < 3000) return 'Moderate retirement income. Review your retirement goals and savings strategy.';
      return 'Good retirement income level. Your savings strategy appears effective.';
    }
    
    return 'Annuity payment calculated successfully. Review the terms and ensure they meet your financial goals.';
  };

  const getCalculationType = (type: string) => {
    switch (type) {
      case 'present-value': return 'Present Value Annuity Payment';
      case 'future-value': return 'Future Value Annuity Payment';
      case 'loan-payment': return 'Loan Payment Calculation';
      case 'retirement-income': return 'Retirement Income Annuity';
      default: return 'Annuity Payment Calculation';
    }
  };

  const getRecommendations = (calculationType: string, paymentAmount: number, interestRate: number, totalInterest: number) => {
    const recommendations = [];
    
    if (calculationType === 'loan-payment') {
      if (interestRate > 10) {
        recommendations.push('High interest rate - consider refinancing if rates have dropped');
        recommendations.push('Make extra principal payments to reduce total interest cost');
        recommendations.push('Consider shorter loan term if payment is affordable');
      } else {
        recommendations.push('Reasonable interest rate - focus on consistent payments');
        recommendations.push('Consider making extra payments when possible');
        recommendations.push('Review your overall debt management strategy');
      }
    }
    
    if (calculationType === 'retirement-income') {
      recommendations.push('Consider inflation impact on future purchasing power');
      recommendations.push('Review your retirement savings goals and timeline');
      recommendations.push('Consider tax implications of retirement withdrawals');
      recommendations.push('Evaluate your overall retirement income strategy');
    }
    
    if (calculationType === 'present-value' || calculationType === 'future-value') {
      recommendations.push('Compare with other investment options');
      recommendations.push('Consider the risk level of the investment');
      recommendations.push('Review the stability of the income source');
      recommendations.push('Evaluate tax implications of the payments');
    }
    
    recommendations.push('Review your overall financial plan');
    recommendations.push('Consider consulting with a financial advisor');
    recommendations.push('Regularly review and adjust your strategy');
    
    return recommendations;
  };

  const getWarningSigns = (calculationType: string, paymentAmount: number, interestRate: number, totalInterest: number) => {
    const signs = [];
    
    if (calculationType === 'loan-payment') {
      if (paymentAmount > 5000) {
        signs.push('Very high payment amount may strain your budget');
        signs.push('Consider if you can afford this payment long-term');
        signs.push('Review your debt-to-income ratio');
      }
      
      if (interestRate > 15) {
        signs.push('Very high interest rate - consider refinancing');
        signs.push('High interest cost relative to principal');
        signs.push('Review your credit score and loan options');
      }
    }
    
    if (calculationType === 'retirement-income') {
      if (paymentAmount < 1000) {
        signs.push('Low retirement income may not meet your needs');
        signs.push('Consider increasing your retirement savings');
        signs.push('Review your retirement timeline and goals');
      }
    }
    
    signs.push('Not accounting for inflation in long-term planning');
    signs.push('Ignoring tax implications of payments');
    signs.push('Not considering alternative investment options');
    
    return signs;
  };

  const onSubmit = (values: FormValues) => {
    const calculation = calculate(values);
    if (!calculation) { setResult(null); return; }
    
    setResult({ 
      ...calculation,
      interpretation: interpret(calculation.paymentAmount, calculation.totalInterest, values.interestRate!, values.calculationType!),
      recommendations: getRecommendations(values.calculationType!, calculation.paymentAmount, values.interestRate!, calculation.totalInterest),
      warningSigns: getWarningSigns(values.calculationType!, calculation.paymentAmount, values.interestRate!, calculation.totalInterest),
      calculationType: getCalculationType(values.calculationType!)
    });
  };

  return (
    <div className="space-y-8">

      {/* Input Form */}
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <Calculator className="h-5 w-5" />
            Annuity Payment Calculation
          </CardTitle>
          <CardDescription>
            Calculate annuity payments for loans, investments, and retirement income
          </CardDescription>
        </CardHeader>
        <CardContent>
      <Form {...form}>
        <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-6">
              <div className="space-y-6">
                <div>
                  <h3 className="text-lg font-semibold mb-4 flex items-center gap-2">
                    <Calculator className="h-5 w-5 text-primary" />
                    Basic Parameters
                  </h3>
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
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
                      name="timePeriod" 
                      render={({ field }) => (
                  <FormItem>
                          <FormLabel className="flex items-center gap-2">
                            <Calendar className="h-4 w-4" />
                            Time Period (Years)
                          </FormLabel>
                    <FormControl>
                            <Input 
                              type="number" 
                              step="0.1" 
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
                      name="compoundingFrequency" 
                      render={({ field }) => (
                  <FormItem>
                          <FormLabel className="flex items-center gap-2">
                            <BarChart className="h-4 w-4" />
                            Payment Frequency
                          </FormLabel>
                    <FormControl>
                            <select 
                              className="border rounded h-10 px-3 w-full bg-background" 
                              value={field.value ?? ''} 
                              onChange={(e) => field.onChange(e.target.value as any)}
                            >
                              <option value="">Select frequency</option>
                              <option value="annual">Annual</option>
                              <option value="semi-annual">Semi-Annual</option>
                              <option value="quarterly">Quarterly</option>
                              <option value="monthly">Monthly</option>
                              <option value="daily">Daily</option>
                  </select>
                </FormControl>
                    <FormMessage />
                  </FormItem>
                      )} 
                    />
                    <FormField 
                      control={form.control} 
                      name="calculationType" 
                      render={({ field }) => (
                  <FormItem>
                          <FormLabel className="flex items-center gap-2">
                            <Target className="h-4 w-4" />
                            Calculation Type
                          </FormLabel>
                    <FormControl>
                            <select 
                              className="border rounded h-10 px-3 w-full bg-background" 
                              value={field.value ?? ''} 
                              onChange={(e) => field.onChange(e.target.value as any)}
                            >
                              <option value="">Select calculation type</option>
                              <option value="present-value">Present Value Annuity</option>
                              <option value="future-value">Future Value Annuity</option>
                              <option value="loan-payment">Loan Payment</option>
                              <option value="retirement-income">Retirement Income</option>
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
                    <DollarSign className="h-5 w-5 text-blue-600" />
                    Financial Information
                  </h3>
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                    <FormField 
                      control={form.control} 
                      name="presentValue" 
                      render={({ field }) => (
                  <FormItem>
                          <FormLabel className="flex items-center gap-2">
                            <DollarSign className="h-4 w-4" />
                            Present Value (Loan Amount, Investment)
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
                      name="futureValue" 
                      render={({ field }) => (
                  <FormItem>
                          <FormLabel className="flex items-center gap-2">
                            <TrendingUp className="h-4 w-4" />
                            Future Value (Target Amount)
                          </FormLabel>
                    <FormControl>
                            <Input 
                              type="number" 
                              step="0.01" 
                              placeholder="e.g., 1000000" 
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
                      name="annuityType" 
                      render={({ field }) => (
                  <FormItem>
                          <FormLabel className="flex items-center gap-2">
                            <CreditCard className="h-4 w-4" />
                            Annuity Type
                          </FormLabel>
                    <FormControl>
                            <select 
                              className="border rounded h-10 px-3 w-full bg-background" 
                              value={field.value ?? ''} 
                              onChange={(e) => field.onChange(e.target.value as any)}
                            >
                              <option value="">Select annuity type</option>
                              <option value="ordinary">Ordinary Annuity (End of Period)</option>
                              <option value="due">Annuity Due (Beginning of Period)</option>
                  </select>
                </FormControl>
                    <FormMessage />
                  </FormItem>
                      )} 
                    />
                  </div>
                </div>
          </div>
              <Button type="submit" className="w-full md:w-auto">
                Calculate Annuity Payment
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
                <Calculator className="h-8 w-8 text-primary" />
                <div>
                  <CardTitle>{result.calculationType}</CardTitle>
                  <CardDescription>Annuity payment analysis and recommendations</CardDescription>
                </div>
              </div>
            </CardHeader>
            <CardContent>
              <div className="grid grid-cols-1 md:grid-cols-3 gap-6 mb-8">
                <div className="text-center p-6 bg-primary/5 rounded-lg">
                  <div className="flex items-center justify-center gap-2 mb-2">
                    <DollarSign className="h-5 w-5 text-primary" />
                    <span className="text-sm font-medium text-muted-foreground">Payment Amount</span>
                  </div>
                  <p className="text-3xl font-bold text-primary">
                    ${result.paymentAmount.toLocaleString()}
                  </p>
                  <p className="text-sm text-muted-foreground mt-1">
                    Per payment period
                  </p>
                </div>
                
                <div className="text-center p-6 bg-green-50 dark:bg-green-950/20 rounded-lg">
                  <div className="flex items-center justify-center gap-2 mb-2">
                    <CreditCard className="h-5 w-5 text-green-600" />
                    <span className="text-sm font-medium text-muted-foreground">Total Payments</span>
                  </div>
                  <p className="text-3xl font-bold text-green-600">
                    ${result.totalPayments.toLocaleString()}
                  </p>
                  <p className="text-sm text-muted-foreground mt-1">
                    Over entire period
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
                    Interest cost
                  </p>
                </div>
              </div>

              <Alert className="mb-6">
                <Info className="h-4 w-4" />
                <AlertDescription>
                  {result.interpretation}
                </AlertDescription>
              </Alert>

              {/* Payment Schedule */}
              <Card className="mb-6">
                <CardHeader>
                  <CardTitle className="flex items-center gap-2 text-lg">
                    <BarChart className="h-5 w-5" />
                    Payment Schedule (First 12 Periods)
                  </CardTitle>
                </CardHeader>
                <CardContent>
                  <div className="overflow-x-auto">
                    <table className="w-full text-sm">
                      <thead>
                        <tr className="border-b">
                          <th className="text-left p-2">Period</th>
                          <th className="text-right p-2">Payment</th>
                          <th className="text-right p-2">Principal</th>
                          <th className="text-right p-2">Interest</th>
                          <th className="text-right p-2">Balance</th>
                        </tr>
                      </thead>
                      <tbody>
                        {result.paymentSchedule.map((payment, index) => (
                          <tr key={index} className="border-b">
                            <td className="p-2">{payment.period}</td>
                            <td className="text-right p-2">${payment.payment.toLocaleString()}</td>
                            <td className="text-right p-2">${payment.principal.toLocaleString()}</td>
                            <td className="text-right p-2">${payment.interest.toLocaleString()}</td>
                            <td className="text-right p-2">${payment.balance.toLocaleString()}</td>
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
                        Payment Recommendations
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
              Understanding Annuity Payments
            </CardTitle>
          </CardHeader>
          <CardContent className="space-y-4">
            <div>
              <h4 className="font-semibold text-foreground mb-2">What is an Annuity?</h4>
              <p className="text-muted-foreground">
                An annuity is a series of equal payments made at regular intervals. Common examples include loan payments, mortgage payments, and retirement income streams. The payments can be made at the beginning or end of each period.
              </p>
            </div>
            <div>
              <h4 className="font-semibold text-foreground mb-2">Ordinary vs. Annuity Due</h4>
              <p className="text-muted-foreground">
                Ordinary annuities have payments at the end of each period, while annuity due has payments at the beginning. Annuity due payments are higher because you receive the money earlier, but the present value is also higher.
              </p>
            </div>
            <div>
              <h4 className="font-semibold text-foreground mb-2">Payment Frequency Impact</h4>
              <p className="text-muted-foreground">
                More frequent payments (monthly vs. annual) result in lower individual payment amounts but the same total interest cost. The frequency affects the calculation of interest and principal components of each payment.
              </p>
            </div>
          </CardContent>
        </Card>

        {/* Related Calculators Section */}
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <Calculator className="h-5 w-5" />
              Related Calculators
            </CardTitle>
            <CardDescription>
              Explore other financial planning and investment tools
            </CardDescription>
          </CardHeader>
          <CardContent>
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
              <div className="p-4 border rounded-lg hover:bg-muted/50 transition-colors">
                <h4 className="font-semibold mb-2">
                  <a href="/category/finance/present-value-calculator" className="text-primary hover:underline">
                    Present Value Calculator
                  </a>
                </h4>
                <p className="text-sm text-muted-foreground">
                  Calculate present value of future cash flows
                </p>
              </div>
              <div className="p-4 border rounded-lg hover:bg-muted/50 transition-colors">
                <h4 className="font-semibold mb-2">
                  <a href="/category/finance/future-value-calculator" className="text-primary hover:underline">
                    Future Value Calculator
                  </a>
                </h4>
                <p className="text-sm text-muted-foreground">
                  Calculate future value of investments
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
                  <a href="/category/finance/perpetuity-calculator" className="text-primary hover:underline">
                    Perpetuity Calculator
                  </a>
                </h4>
                <p className="text-sm text-muted-foreground">
                  Calculate perpetuity values and payments
                </p>
              </div>
            </div>
          </CardContent>
        </Card>

        {/* Guide Section */}
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <Calculator className="h-5 w-5" />
              Complete Guide to Annuity Payments
            </CardTitle>
          </CardHeader>
          <CardContent className="prose prose-sm dark:prose-invert max-w-none">
            <h3>Understanding Annuity Payments: Regular Income Streams</h3>
            <p>Annuity payments are regular, equal payments made over a specific period. They're used in loans, mortgages, retirement planning, and investment strategies. Understanding how to calculate and optimize these payments is crucial for financial planning.</p>
            
            <h3>Loan Payments: Managing Debt Effectively</h3>
            <p>Loan payments are the most common type of annuity. They consist of principal and interest components, with interest being higher in early payments and principal being higher in later payments. Understanding this structure helps you make informed decisions about extra payments and refinancing.</p>
            
            <h3>Retirement Income: Planning for the Future</h3>
            <p>Retirement annuities provide regular income during retirement. They can be calculated based on your retirement savings, expected lifespan, and desired income level. Consider inflation, taxes, and healthcare costs when planning your retirement income strategy.</p>
            
            <h3>Investment Annuities: Building Wealth Over Time</h3>
            <p>Investment annuities help you accumulate wealth through regular contributions. They're particularly powerful when combined with compound interest over long periods. Consider your risk tolerance, time horizon, and financial goals when choosing investment annuity strategies.</p>
            
            <h3>Optimizing Your Annuity Strategy</h3>
            <p>To optimize your annuity payments, consider the timing of payments, frequency of contributions, and overall financial strategy. Regular reviews and adjustments ensure your annuity strategy continues to meet your financial goals as your circumstances change.</p>
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
              Common questions about annuity payments
            </CardDescription>
          </CardHeader>
          <CardContent className="space-y-6">
            <div>
              <h4 className="font-semibold text-foreground mb-2">What's the difference between ordinary annuity and annuity due?</h4>
              <p className="text-muted-foreground">
                Ordinary annuities have payments at the end of each period, while annuity due has payments at the beginning. Annuity due payments are higher because you receive the money earlier, but the present value is also higher due to the earlier receipt of funds.
              </p>
            </div>

            <div>
              <h4 className="font-semibold text-foreground mb-2">How does payment frequency affect my total cost?</h4>
              <p className="text-muted-foreground">
                More frequent payments (monthly vs. annual) result in lower individual payment amounts but the same total interest cost over the life of the loan. However, more frequent payments can help you pay off debt faster if you make extra payments.
              </p>
            </div>

            <div>
              <h4 className="font-semibold text-foreground mb-2">Should I make extra payments on my loan?</h4>
              <p className="text-muted-foreground">
                Extra payments can significantly reduce your total interest cost and loan term. However, consider your opportunity cost - if you can earn more by investing the extra money, that might be a better strategy. Evaluate your overall financial situation and goals.
              </p>
            </div>

            <div>
              <h4 className="font-semibold text-foreground mb-2">How do I choose between different loan terms?</h4>
              <p className="text-muted-foreground">
                Shorter terms have higher payments but lower total interest costs. Longer terms have lower payments but higher total interest costs. Choose based on your budget, financial goals, and ability to make payments. Consider your overall debt-to-income ratio.
              </p>
            </div>

            <div>
              <h4 className="font-semibold text-foreground mb-2">What factors should I consider for retirement annuities?</h4>
              <p className="text-muted-foreground">
                Consider your expected lifespan, inflation, healthcare costs, and other income sources. Factor in Social Security, pensions, and other retirement accounts. Ensure your retirement income strategy provides enough income to maintain your desired lifestyle.
              </p>
            </div>
          </CardContent>
        </Card>
    </div>
    </div>
  );
}
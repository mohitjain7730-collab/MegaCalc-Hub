'use client';

import { useState } from 'react';
import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import { z } from 'zod';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Form, FormControl, FormField, FormItem, FormLabel, FormMessage } from '@/components/ui/form';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Calculator, TrendingUp, DollarSign, Calendar, Globe, FileText, Info } from 'lucide-react';
import Link from 'next/link';
import { EmbedWidget } from '@/components/embed-widget';

const formSchema = z.object({
  loanAmount: z.number().positive('Enter loan amount'),
  interestRate: z.number().min(0).max(50, 'Interest rate too high'),
  loanTerm: z.number().min(1).max(50, 'Loan term too long'),
  extraPayment: z.number().min(0, 'Extra payment cannot be negative').optional(),
  extraPaymentFrequency: z.enum(['monthly', 'yearly', 'one-time']).optional(),
  startDate: z.string().optional(),
  paymentFrequency: z.enum(['monthly', 'bi-weekly', 'weekly']).optional(),
});

type FormValues = z.infer<typeof formSchema>;

const calculateAmortization = (values: FormValues) => {
  const {
    loanAmount,
    interestRate,
    loanTerm,
    extraPayment = 0,
    extraPaymentFrequency = 'monthly',
    startDate,
    paymentFrequency = 'monthly'
  } = values;

  // Convert to monthly values
  const monthlyRate = interestRate / 100 / 12;
  const totalPayments = loanTerm * 12;
  
  // Calculate regular monthly payment
  const monthlyPayment = loanAmount * (monthlyRate * Math.pow(1 + monthlyRate, totalPayments)) / 
                       (Math.pow(1 + monthlyRate, totalPayments) - 1);
  
  // Calculate extra payment amount per period
  let extraPaymentPerPeriod = 0;
  if (extraPayment > 0) {
    switch (extraPaymentFrequency) {
      case 'monthly':
        extraPaymentPerPeriod = extraPayment;
        break;
      case 'yearly':
        extraPaymentPerPeriod = extraPayment / 12;
        break;
      case 'one-time':
        extraPaymentPerPeriod = 0; // Will be applied once
        break;
    }
  }
  
  // Calculate amortization schedule
  let balance = loanAmount;
  let totalInterest = 0;
  let totalExtraPayments = 0;
  let actualPayments = 0;
  let extraPaymentApplied = false;
  
  const schedule = [];
  
  for (let month = 1; month <= totalPayments && balance > 0.01; month++) {
    const interestPayment = balance * monthlyRate;
    let principalPayment = monthlyPayment - interestPayment;
    
    // Apply extra payment
    let currentExtraPayment = 0;
    if (extraPayment > 0 && !extraPaymentApplied) {
      if (extraPaymentFrequency === 'one-time' && month === 1) {
        currentExtraPayment = extraPayment;
        extraPaymentApplied = true;
      } else if (extraPaymentFrequency === 'monthly') {
        currentExtraPayment = extraPaymentPerPeriod;
      } else if (extraPaymentFrequency === 'yearly' && month % 12 === 1) {
        currentExtraPayment = extraPayment;
      }
    }
    
    // Apply extra payment to principal
    principalPayment += currentExtraPayment;
    totalExtraPayments += currentExtraPayment;
    
    // Ensure we don't overpay
    if (principalPayment > balance) {
      principalPayment = balance;
    }
    
    balance -= principalPayment;
    totalInterest += interestPayment;
    actualPayments++;
    
    schedule.push({
      month,
      payment: monthlyPayment + currentExtraPayment,
      principal: principalPayment,
      interest: interestPayment,
      extraPayment: currentExtraPayment,
      balance: Math.max(0, balance)
    });
  }
  
  // Calculate savings
  const totalPaid = (monthlyPayment * actualPayments) + totalExtraPayments;
  const totalPaidWithoutExtra = monthlyPayment * totalPayments;
  const interestSavings = totalPaidWithoutExtra - totalPaid;
  const timeSavings = totalPayments - actualPayments;
  
  // Calculate new payoff date
  const payoffDate = new Date();
  if (startDate) {
    payoffDate.setTime(new Date(startDate).getTime());
  }
  payoffDate.setMonth(payoffDate.getMonth() + actualPayments);
  
  return {
    monthlyPayment,
    totalInterest,
    totalPaid,
    totalExtraPayments,
    interestSavings,
    timeSavings,
    actualPayments,
    payoffDate,
    schedule,
    finalBalance: balance
  };
};

const getAmortizationStatus = (result: ReturnType<typeof calculateAmortization>, values: FormValues) => {
  let status = 'standard';
  let statusColor = 'text-blue-600';
  let bgColor = 'bg-blue-50';
  let borderColor = 'border-blue-200';
  let icon = Calculator;
  let statusText = 'Standard Amortization';
  let description = 'Regular loan payment schedule';

  if (values.extraPayment && values.extraPayment > 0) {
    if (result.timeSavings > 60) {
      status = 'excellent';
      statusColor = 'text-green-600';
      bgColor = 'bg-green-50';
      borderColor = 'border-green-200';
      icon = TrendingUp;
      statusText = 'Excellent Savings';
      description = 'Significant interest savings and time reduction';
    } else if (result.timeSavings > 24) {
      status = 'good';
      statusColor = 'text-green-600';
      bgColor = 'bg-green-50';
      borderColor = 'border-green-200';
      icon = TrendingUp;
      statusText = 'Good Savings';
      description = 'Moderate interest savings and time reduction';
    } else if (result.timeSavings > 0) {
      status = 'moderate';
      statusColor = 'text-blue-600';
      bgColor = 'bg-blue-50';
      borderColor = 'border-blue-200';
      icon = Calculator;
      statusText = 'Moderate Savings';
      description = 'Some interest savings and time reduction';
    }
  }

  return { status, statusColor, bgColor, borderColor, icon, statusText, description };
};

const getDetailedInterpretation = (result: ReturnType<typeof calculateAmortization>, values: FormValues) => {
  const interpretations = [];
  
  // Extra payment analysis
  if (values.extraPayment && values.extraPayment > 0) {
    interpretations.push(`Your extra payments of $${values.extraPayment.toFixed(2)} ${values.extraPaymentFrequency} will save you $${result.interestSavings.toFixed(2)} in interest`);
    interpretations.push(`You will pay off your loan ${result.timeSavings} months early`);
    interpretations.push(`Total extra payments: $${result.totalExtraPayments.toFixed(2)}`);
    
    if (result.interestSavings > result.totalExtraPayments) {
      interpretations.push('Your extra payments will save you more in interest than you pay extra');
      interpretations.push('This is an excellent investment in your financial future');
    } else if (result.interestSavings > result.totalExtraPayments * 0.5) {
      interpretations.push('Your extra payments provide good interest savings');
      interpretations.push('Consider if the extra payments fit your budget and goals');
    } else {
      interpretations.push('Your extra payments provide some interest savings');
      interpretations.push('Consider if the extra payments are worth the opportunity cost');
    }
  } else {
    interpretations.push('No extra payments - you will pay the full interest amount');
    interpretations.push('Consider making extra payments to save on interest');
    interpretations.push('Even small extra payments can make a significant difference');
  }
  
  // Payment analysis
  interpretations.push(`Your monthly payment is $${result.monthlyPayment.toFixed(2)}`);
  interpretations.push(`Total interest over the life of the loan: $${result.totalInterest.toFixed(2)}`);
  interpretations.push(`Total amount paid: $${result.totalPaid.toFixed(2)}`);
  
  // Time analysis
  if (result.actualPayments < values.loanTerm * 12) {
    interpretations.push(`Loan will be paid off in ${result.actualPayments} months instead of ${values.loanTerm * 12} months`);
    interpretations.push(`You will save ${result.timeSavings} months of payments`);
  } else {
    interpretations.push(`Loan will be paid off in the standard ${values.loanTerm * 12} months`);
  }

  return interpretations;
};

const getPersonalizedRecommendations = (result: ReturnType<typeof calculateAmortization>, values: FormValues) => {
  const recommendations = [];
  
  // Extra payment recommendations
  if (!values.extraPayment || values.extraPayment === 0) {
    recommendations.push('Consider making extra payments to save on interest');
    recommendations.push('Even $50-100 extra per month can make a significant difference');
    recommendations.push('Start with small extra payments and increase over time');
    recommendations.push('Consider making one extra payment per year');
  } else {
    recommendations.push('Your extra payment strategy is good for saving interest');
    recommendations.push('Consider increasing extra payments if your budget allows');
    recommendations.push('Monitor your progress and adjust as needed');
    recommendations.push('Consider making extra payments to principal only');
  }
  
  // Payment frequency recommendations
  if (values.paymentFrequency === 'monthly') {
    recommendations.push('Consider bi-weekly payments to make one extra payment per year');
    recommendations.push('Bi-weekly payments can save significant interest over time');
    recommendations.push('Check if your lender offers bi-weekly payment options');
  } else if (values.paymentFrequency === 'bi-weekly') {
    recommendations.push('Bi-weekly payments are excellent for saving interest');
    recommendations.push('You are already making one extra payment per year');
    recommendations.push('Consider additional extra payments if budget allows');
  }
  
  // Budget recommendations
  if (result.monthlyPayment > values.loanAmount * 0.01) {
    recommendations.push('Your monthly payment is significant - ensure it fits your budget');
    recommendations.push('Consider if you can afford extra payments without straining your budget');
    recommendations.push('Build an emergency fund before making extra payments');
  } else {
    recommendations.push('Your monthly payment is manageable');
    recommendations.push('Consider if you can afford to make extra payments');
    recommendations.push('Focus on building wealth through extra payments');
  }
  
  // Interest rate recommendations
  if (values.interestRate > 6) {
    recommendations.push('High interest rate - extra payments are very beneficial');
    recommendations.push('Consider refinancing if rates have dropped significantly');
    recommendations.push('Focus on paying down high-interest debt first');
  } else if (values.interestRate > 4) {
    recommendations.push('Moderate interest rate - extra payments provide good savings');
    recommendations.push('Consider your other financial goals before making extra payments');
    recommendations.push('Balance extra payments with other investments');
  } else {
    recommendations.push('Low interest rate - consider other investment opportunities');
    recommendations.push('Extra payments may not be the best use of your money');
    recommendations.push('Consider investing in higher-return opportunities');
  }

  return recommendations;
};

const getPaymentStrategies = (result: ReturnType<typeof calculateAmortization>, values: FormValues) => {
  const strategies = [];
  
  strategies.push('Make extra payments to principal only, not interest');
  strategies.push('Consider making one extra payment per year');
  strategies.push('Use tax refunds or bonuses for extra payments');
  strategies.push('Round up your monthly payment to the nearest $50 or $100');
  
  if (values.interestRate > 5) {
    strategies.push('High interest rate - prioritize extra payments over other investments');
    strategies.push('Consider refinancing if rates have dropped significantly');
  } else {
    strategies.push('Low interest rate - consider other investment opportunities');
    strategies.push('Balance extra payments with other financial goals');
  }
  
  if (result.monthlyPayment > values.loanAmount * 0.01) {
    strategies.push('High monthly payment - ensure extra payments fit your budget');
    strategies.push('Build emergency fund before making extra payments');
  } else {
    strategies.push('Manageable monthly payment - consider increasing extra payments');
    strategies.push('Focus on building wealth through extra payments');
  }

  return strategies;
};

export default function LoanAmortizationExtraPaymentsCalculator() {
  const [result, setResult] = useState<ReturnType<typeof calculateAmortization> | null>(null);

  const form = useForm<FormValues>({
    resolver: zodResolver(formSchema),
    defaultValues: {
      loanAmount: 0,
      interestRate: 0,
      loanTerm: 0,
      extraPayment: 0,
      extraPaymentFrequency: 'monthly',
      startDate: '',
      paymentFrequency: 'monthly',
    },
  });

  const onSubmit = (values: FormValues) => {
    const calculation = calculateAmortization(values);
    setResult(calculation);
  };

  return (
    <div className="space-y-8">
      {/* Input Form */}
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <Calculator className="h-5 w-5" />
            Loan Amortization with Extra Payments Calculation
          </CardTitle>
          <CardDescription>
            Calculate loan amortization schedules with extra payments to save interest and pay off loans faster
          </CardDescription>
        </CardHeader>
        <CardContent>
          <Form {...form}>
            <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-6">
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <FormField control={form.control} name="loanAmount" render={({ field }) => (
                  <FormItem>
                    <FormLabel>Loan Amount ($)</FormLabel>
                    <FormControl>
                      <Input 
                        type="number" 
                        step="0.01" 
                        placeholder="e.g., 300000"
                        {...field} 
                        value={field.value || ''} 
                        onChange={e => field.onChange(parseFloat(e.target.value) || 0)} 
                      />
                    </FormControl>
                    <FormMessage />
                    <p className="text-sm text-muted-foreground">Total amount of the loan</p>
                  </FormItem>
                )} />
                
                <FormField control={form.control} name="interestRate" render={({ field }) => (
                  <FormItem>
                    <FormLabel>Interest Rate (%)</FormLabel>
                    <FormControl>
                      <Input 
                        type="number" 
                        step="0.01" 
                        placeholder="e.g., 6.5"
                        {...field} 
                        value={field.value || ''} 
                        onChange={e => field.onChange(parseFloat(e.target.value) || 0)} 
                      />
                    </FormControl>
                    <FormMessage />
                    <p className="text-sm text-muted-foreground">Annual interest rate</p>
                  </FormItem>
                )} />
              </div>

              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <FormField control={form.control} name="loanTerm" render={({ field }) => (
                  <FormItem>
                    <FormLabel>Loan Term (years)</FormLabel>
                    <FormControl>
                      <Input 
                        type="number" 
                        step="1" 
                        placeholder="e.g., 30"
                        {...field} 
                        value={field.value || ''} 
                        onChange={e => field.onChange(parseInt(e.target.value) || 0)} 
                      />
                    </FormControl>
                    <FormMessage />
                    <p className="text-sm text-muted-foreground">Length of the loan in years</p>
                  </FormItem>
                )} />
                
                <FormField control={form.control} name="extraPayment" render={({ field }) => (
                  <FormItem>
                    <FormLabel>Extra Payment ($) - Optional</FormLabel>
                    <FormControl>
                      <Input 
                        type="number" 
                        step="0.01" 
                        placeholder="e.g., 200"
                        {...field} 
                        value={field.value || ''} 
                        onChange={e => field.onChange(parseFloat(e.target.value) || 0)} 
                      />
                    </FormControl>
                    <FormMessage />
                    <p className="text-sm text-muted-foreground">Additional payment amount</p>
                  </FormItem>
                )} />
              </div>

              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <FormField control={form.control} name="extraPaymentFrequency" render={({ field }) => (
                  <FormItem>
                    <FormLabel>Extra Payment Frequency</FormLabel>
                    <FormControl>
                      <select 
                        {...field} 
                        className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
                      >
                        <option value="monthly">Monthly</option>
                        <option value="yearly">Yearly</option>
                        <option value="one-time">One-time</option>
                      </select>
                    </FormControl>
                    <FormMessage />
                    <p className="text-sm text-muted-foreground">How often to make extra payments</p>
                  </FormItem>
                )} />
                
                <FormField control={form.control} name="paymentFrequency" render={({ field }) => (
                  <FormItem>
                    <FormLabel>Payment Frequency</FormLabel>
                    <FormControl>
                      <select 
                        {...field} 
                        className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
                      >
                        <option value="monthly">Monthly</option>
                        <option value="bi-weekly">Bi-weekly</option>
                        <option value="weekly">Weekly</option>
                      </select>
                    </FormControl>
                    <FormMessage />
                    <p className="text-sm text-muted-foreground">How often you make regular payments</p>
                  </FormItem>
                )} />
              </div>

              <FormField control={form.control} name="startDate" render={({ field }) => (
                <FormItem>
                  <FormLabel>Loan Start Date - Optional</FormLabel>
                  <FormControl>
                    <Input 
                      type="date" 
                      {...field} 
                      value={field.value || ''} 
                      onChange={e => field.onChange(e.target.value || '')} 
                    />
                  </FormControl>
                  <FormMessage />
                  <p className="text-sm text-muted-foreground">When the loan begins</p>
                </FormItem>
              )} />

              <Button type="submit" className="w-full">
                <Calculator className="mr-2 h-4 w-4" />
                Calculate Amortization
              </Button>
            </form>
          </Form>
        </CardContent>
      </Card>

      {result && (
        <Card className="mt-8">
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <Calculator className="h-5 w-5 text-primary" />
              Loan Amortization Analysis
            </CardTitle>
            <CardDescription>
              Your loan payment schedule and savings analysis
            </CardDescription>
          </CardHeader>
          <CardContent className="space-y-6">
            <div className={`p-6 rounded-lg border ${getAmortizationStatus(result, form.getValues()).bgColor} ${getAmortizationStatus(result, form.getValues()).borderColor}`}>
              <div className="text-center space-y-4">
                <div>
                  <p className="text-4xl font-bold">${result.monthlyPayment.toFixed(2)}</p>
                  <p className={`text-lg font-semibold ${getAmortizationStatus(result, form.getValues()).statusColor}`}>
                    {getAmortizationStatus(result, form.getValues()).statusText}
                  </p>
                  <p className="text-sm text-muted-foreground">
                    {getAmortizationStatus(result, form.getValues()).description}
                  </p>
                </div>
                <div className="grid grid-cols-1 md:grid-cols-3 gap-4 text-sm">
                  <div>
                    <p className="text-muted-foreground">Total Interest</p>
                    <p className="font-semibold">${result.totalInterest.toFixed(2)}</p>
                  </div>
                  <div>
                    <p className="text-muted-foreground">Interest Savings</p>
                    <p className="font-semibold">${result.interestSavings.toFixed(2)}</p>
                  </div>
                  <div>
                    <p className="text-muted-foreground">Time Savings</p>
                    <p className="font-semibold">{result.timeSavings} months</p>
                  </div>
                </div>
              </div>
            </div>

            <div className="space-y-4">
              <h3 className="font-semibold text-foreground">Detailed Interpretation</h3>
              <ul className="space-y-2">
                {getDetailedInterpretation(result, form.getValues()).map((interpretation, index) => (
                  <li key={index} className="flex items-start gap-2">
                    <DollarSign className="h-4 w-4 text-green-600 mt-0.5 flex-shrink-0" />
                    <span className="text-sm">{interpretation}</span>
                  </li>
                ))}
              </ul>
            </div>

            <div className="space-y-4">
              <h3 className="font-semibold text-foreground">Personalized Recommendations</h3>
              <ul className="space-y-2">
                {getPersonalizedRecommendations(result, form.getValues()).map((recommendation, index) => (
                  <li key={index} className="flex items-start gap-2">
                    <TrendingUp className="h-4 w-4 text-blue-600 mt-0.5 flex-shrink-0" />
                    <span className="text-sm">{recommendation}</span>
                  </li>
                ))}
              </ul>
            </div>

            <div className="space-y-4">
              <h3 className="font-semibold text-foreground">Payment Strategies</h3>
              <ul className="space-y-2">
                {getPaymentStrategies(result, form.getValues()).map((strategy, index) => (
                  <li key={index} className="flex items-start gap-2">
                    <Calendar className="h-4 w-4 text-purple-600 mt-0.5 flex-shrink-0" />
                    <span className="text-sm">{strategy}</span>
                  </li>
                ))}
              </ul>
            </div>
          </CardContent>
        </Card>
      )}

      {/* Related Calculators */}
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <Globe className="h-5 w-5" />
            Related Calculators
          </CardTitle>
          <CardDescription>
            Explore other loan and mortgage calculators
          </CardDescription>
        </CardHeader>
        <CardContent>
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div className="p-4 border rounded-lg hover:bg-muted/50 transition-colors">
              <h4 className="font-semibold mb-2">
                <a href="/category/finance/mortgage-payment-calculator" className="text-primary hover:underline">
                  Mortgage Payment Calculator
                </a>
              </h4>
              <p className="text-sm text-muted-foreground">
                Calculate monthly mortgage payments for fixed-rate loans.
              </p>
            </div>
            <div className="p-4 border rounded-lg hover:bg-muted/50 transition-colors">
              <h4 className="font-semibold mb-2">
                <a href="/category/finance/balloon-payment-loan-calculator" className="text-primary hover:underline">
                  Balloon Payment Loan Calculator
                </a>
              </h4>
              <p className="text-sm text-muted-foreground">
                Calculate balloon payment loans with lower monthly payments.
              </p>
            </div>
            <div className="p-4 border rounded-lg hover:bg-muted/50 transition-colors">
              <h4 className="font-semibold mb-2">
                <a href="/category/finance/graduated-payment-mortgage-calculator" className="text-primary hover:underline">
                  Graduated Payment Mortgage Calculator
                </a>
              </h4>
              <p className="text-sm text-muted-foreground">
                Calculate graduated payment mortgages with increasing payments.
              </p>
            </div>
            <div className="p-4 border rounded-lg hover:bg-muted/50 transition-colors">
              <h4 className="font-semibold mb-2">
                <a href="/category/finance/arm-payment-projection-calculator" className="text-primary hover:underline">
                  ARM Payment Projection Calculator
                </a>
              </h4>
              <p className="text-sm text-muted-foreground">
                Project how ARM interest rates and payments may change.
              </p>
            </div>
          </div>
        </CardContent>
      </Card>

      {/* Complete Guide */}
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <FileText className="h-5 w-5" />
            Complete Guide to Loan Amortization with Extra Payments
          </CardTitle>
        </CardHeader>
        <CardContent className="prose prose-sm dark:prose-invert max-w-none">
          <p>This is a sample line for the complete guide section. You can add your detailed content here.</p>
          <p>This is another sample line for the guide section. Replace these with your comprehensive guide content.</p>
        </CardContent>
      </Card>

      {/* FAQ */}
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <Info className="h-5 w-5" />
            Frequently Asked Questions
          </CardTitle>
          <CardDescription>
            Common questions about loan amortization and extra payments
          </CardDescription>
        </CardHeader>
        <CardContent className="space-y-6">
          <div>
            <h4 className="font-semibold text-foreground mb-2">Should I make extra payments or invest the money?</h4>
            <p className="text-muted-foreground">
              This depends on your interest rate and investment returns. If your loan interest rate is higher than your expected investment returns, extra payments are usually better. If you can earn more investing, consider that option instead.
            </p>
          </div>

          <div>
            <h4 className="font-semibold text-foreground mb-2">When is the best time to make extra payments?</h4>
            <p className="text-muted-foreground">
              Earlier is always better. Extra payments made in the first few years of a loan have the most impact because they reduce the principal balance when interest charges are highest.
            </p>
          </div>

          <div>
            <h4 className="font-semibold text-foreground mb-2">Can I make extra payments on any type of loan?</h4>
            <p className="text-muted-foreground">
              Most loans allow extra payments, but some may have prepayment penalties. Always check your loan terms before making extra payments. Mortgages, auto loans, and personal loans typically allow extra payments.
            </p>
          </div>

          <div>
            <h4 className="font-semibold text-foreground mb-2">How much should I pay extra?</h4>
            <p className="text-muted-foreground">
              Start with what you can afford consistently. Even $50-100 extra per month can make a significant difference. Consider your overall financial situation and other financial goals before committing to large extra payments.
            </p>
          </div>

          <div>
            <h4 className="font-semibold text-foreground mb-2">What is loan amortization?</h4>
            <p className="text-muted-foreground">
              Loan amortization is the process of paying off a loan through regular payments over time. Each payment consists of both principal and interest, with the proportion changing over the life of the loan.
            </p>
          </div>

          <div>
            <h4 className="font-semibold text-foreground mb-2">How do extra payments save me interest?</h4>
            <p className="text-muted-foreground">
              Extra payments are applied directly to the principal balance, which immediately reduces the amount of interest that will accrue on the remaining balance. This creates a compounding effect that accelerates loan payoff and reduces total interest paid.
            </p>
          </div>

          <div>
            <h4 className="font-semibold text-foreground mb-2">Are there prepayment penalties on my loan?</h4>
            <p className="text-muted-foreground">
              Some loans have prepayment penalties that charge a fee for paying off the loan early or making large extra payments. Always check your loan terms before making extra payments. Most mortgages and loans don't have prepayment penalties, but it's important to verify.
            </p>
          </div>

          <div>
            <h4 className="font-semibold text-foreground mb-2">Should I pay extra toward principal or interest?</h4>
            <p className="text-muted-foreground">
              Always pay extra toward the principal, not interest. Extra payments applied to principal immediately reduce your loan balance and decrease future interest charges. Payments toward interest don't reduce your principal balance and won't save you money over the life of the loan.
            </p>
          </div>
        </CardContent>
      </Card>

      <EmbedWidget categorySlug="finance" calculatorSlug="loan-amortization-extra-payments-calculator" />
    </div>
  );
}

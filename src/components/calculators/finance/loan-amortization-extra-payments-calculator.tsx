'use client';

import { useState } from 'react';
import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import { z } from 'zod';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Form, FormControl, FormField, FormItem, FormLabel, FormMessage } from '@/components/ui/form';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Calculator, TrendingUp, DollarSign, Calendar } from 'lucide-react';
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
      loanAmount: undefined,
      interestRate: undefined,
      loanTerm: undefined,
      extraPayment: undefined,
      extraPaymentFrequency: 'monthly',
      startDate: undefined,
      paymentFrequency: 'monthly',
    },
  });

  const onSubmit = (values: FormValues) => {
    const calculation = calculateAmortization(values);
    setResult(calculation);
  };

  return (
    <div className="space-y-8">
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
                    value={field.value ?? ''} 
                    onChange={e => field.onChange(parseFloat(e.target.value) || undefined)} 
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
                    value={field.value ?? ''} 
                    onChange={e => field.onChange(parseFloat(e.target.value) || undefined)} 
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
                    value={field.value ?? ''} 
                    onChange={e => field.onChange(parseInt(e.target.value) || undefined)} 
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
                    value={field.value ?? ''} 
                    onChange={e => field.onChange(parseFloat(e.target.value) || undefined)} 
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
                  value={field.value ?? ''} 
                  onChange={e => field.onChange(e.target.value || undefined)} 
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

      <LoanAmortizationGuide />
      
      <EmbedWidget calculatorSlug="loan-amortization-extra-payments-calculator" calculatorName="Loan Amortization Extra Payments Calculator" />
    </div>
  );
}

function LoanAmortizationGuide() {
  return (
    <section className="space-y-6 text-muted-foreground leading-relaxed bg-white p-6 md:p-10 rounded-lg shadow-lg" itemScope itemType="https://schema.org/Calculator">
      <meta itemProp="name" content="Loan Amortization Calculator with Extra Payments" />
      <meta itemProp="description" content="Calculate loan amortization schedules with extra payments to save interest and pay off loans faster. See the impact of additional payments on your loan." />
      <meta itemProp="keywords" content="loan amortization calculator, extra payments, loan payoff, interest savings, mortgage calculator" />
      
      <h1 className="text-3xl md:text-4xl font-extrabold text-foreground mb-4" itemProp="headline">Loan Amortization Calculator with Extra Payments</h1>
      
      <h2 className="text-2xl font-bold text-foreground mt-8 mb-4">Table of Contents</h2>
      <ul className="list-disc ml-6 space-y-2 text-blue-600">
        <li><a href="#what-is-amortization" className="hover:underline">What is Loan Amortization?</a></li>
        <li><a href="#extra-payments" className="hover:underline">How Extra Payments Work</a></li>
        <li><a href="#interest-savings" className="hover:underline">Calculating Interest Savings</a></li>
        <li><a href="#payment-strategies" className="hover:underline">Extra Payment Strategies</a></li>
        <li><a href="#bi-weekly-payments" className="hover:underline">Bi-weekly Payment Benefits</a></li>
        <li><a href="#faq" className="hover:underline">Loan Amortization FAQs</a></li>
      </ul>

      <hr />

      <h2 id="what-is-amortization" className="text-2xl font-bold text-foreground pt-8" itemProp="articleSection">What is Loan Amortization?</h2>
      <p><strong>Loan amortization</strong> is the process of paying off a loan through regular payments over time. Each payment consists of both principal and interest, with the proportion changing over the life of the loan.</p>
      
      <h3 className="text-xl font-semibold text-foreground mt-6">How Amortization Works</h3>
      <p>In the early years of a loan, most of your payment goes toward interest, with only a small portion reducing the principal. As the loan matures, more of each payment goes toward principal, and less toward interest.</p>
      
      <h3 className="text-xl font-semibold text-foreground mt-6">The Amortization Formula</h3>
      <pre className="bg-gray-200 p-3 rounded-md my-4"><code>Monthly Payment = P × [r(1+r)^n] / [(1+r)^n - 1]</code></pre>
      <p>Where P = Principal, r = Monthly interest rate, n = Number of payments</p>

      <hr />

      <h2 id="extra-payments" className="text-2xl font-bold text-foreground pt-8" itemProp="articleSection">How Extra Payments Work</h2>
      <p><strong>Extra payments</strong> are additional amounts paid toward your loan principal beyond the required monthly payment. These payments can significantly reduce the total interest paid and shorten the loan term.</p>
      
      <h3 className="text-xl font-semibold text-foreground mt-6">Benefits of Extra Payments</h3>
      <ul className="list-disc ml-6 space-y-2">
        <li>Reduce total interest paid over the life of the loan</li>
        <li>Shorten the loan term and pay off the loan faster</li>
        <li>Build equity faster, especially important for home loans</li>
        <li>Provide financial flexibility and peace of mind</li>
      </ul>
      
      <h3 className="text-xl font-semibold text-foreground mt-6">How Extra Payments Are Applied</h3>
      <p>Extra payments are typically applied directly to the principal balance, which immediately reduces the amount of interest that will accrue on the remaining balance. This creates a compounding effect that accelerates loan payoff.</p>

      <hr />

      <h2 id="interest-savings" className="text-2xl font-bold text-foreground pt-8" itemProp="articleSection">Calculating Interest Savings</h2>
      <p>The amount of interest you save with extra payments depends on several factors:</p>
      
      <h3 className="text-xl font-semibold text-foreground mt-6">Key Factors</h3>
      <ul className="list-disc ml-6 space-y-2">
        <li><strong>Interest Rate:</strong> Higher rates mean more potential savings</li>
        <li><strong>Loan Amount:</strong> Larger loans offer more savings opportunities</li>
        <li><strong>Extra Payment Amount:</strong> Larger extra payments save more interest</li>
        <li><strong>Timing:</strong> Earlier extra payments have more impact</li>
      </ul>
      
      <h3 className="text-xl font-semibold text-foreground mt-6">Savings Calculation</h3>
      <p>Interest savings are calculated by comparing the total interest paid with and without extra payments. The difference represents your savings from making extra payments.</p>

      <hr />

      <h2 id="payment-strategies" className="text-2xl font-bold text-foreground pt-8" itemProp="articleSection">Extra Payment Strategies</h2>
      <p>There are several strategies for making extra payments, each with different benefits:</p>
      
      <h3 className="text-xl font-semibold text-foreground mt-6">Monthly Extra Payments</h3>
      <ul className="list-disc ml-6 space-y-2">
        <li>Make a fixed extra payment each month</li>
        <li>Provides consistent progress and predictable savings</li>
        <li>Easier to budget and plan for</li>
        <li>Good for long-term wealth building</li>
      </ul>
      
      <h3 className="text-xl font-semibold text-foreground mt-6">Annual Extra Payments</h3>
      <ul className="list-disc ml-6 space-y-2">
        <li>Make one large extra payment per year</li>
        <li>Use tax refunds, bonuses, or windfalls</li>
        <li>Requires discipline to save for the payment</li>
        <li>Good for irregular income situations</li>
      </ul>
      
      <h3 className="text-xl font-semibold text-foreground mt-6">One-time Extra Payments</h3>
      <ul className="list-disc ml-6 space-y-2">
        <li>Make a single large extra payment</li>
        <li>Use inheritance, sale of assets, or large windfalls</li>
        <li>Provides immediate impact on loan balance</li>
        <li>Good for specific financial events</li>
      </ul>

      <hr />

      <h2 id="bi-weekly-payments" className="text-2xl font-bold text-foreground pt-8" itemProp="articleSection">Bi-weekly Payment Benefits</h2>
      <p><strong>Bi-weekly payments</strong> can significantly reduce your loan term and interest paid without requiring large extra payments.</p>
      
      <h3 className="text-xl font-semibold text-foreground mt-6">How Bi-weekly Payments Work</h3>
      <p>Instead of making 12 monthly payments per year, you make 26 bi-weekly payments. This results in 13 full payments per year (26 ÷ 2 = 13), effectively making one extra payment annually.</p>
      
      <h3 className="text-xl font-semibold text-foreground mt-6">Benefits of Bi-weekly Payments</h3>
      <ul className="list-disc ml-6 space-y-2">
        <li>Automatically makes one extra payment per year</li>
        <li>Reduces loan term by several years</li>
        <li>Saves significant interest over the life of the loan</li>
        <li>Requires no additional budgeting or planning</li>
      </ul>
      
      <h3 className="text-xl font-semibold text-foreground mt-6">Bi-weekly Payment Example</h3>
      <p>For a $300,000 loan at 6% interest for 30 years:</p>
      <ul className="list-disc ml-6 space-y-2">
        <li>Monthly payment: $1,799</li>
        <li>Bi-weekly payment: $899.50</li>
        <li>Time savings: 4 years, 8 months</li>
        <li>Interest savings: $67,000+</li>
      </ul>

      <hr />

      <h2 id="faq" className="text-2xl font-bold text-foreground pt-8" itemProp="articleSection">Loan Amortization FAQs</h2>
      
      <h3 className="text-xl font-semibold text-foreground mt-6">Should I make extra payments or invest the money?</h3>
      <p>This depends on your interest rate and investment returns. If your loan interest rate is higher than your expected investment returns, extra payments are usually better. If you can earn more investing, consider that option instead.</p>
      
      <h3 className="text-xl font-semibold text-foreground mt-6">When is the best time to make extra payments?</h3>
      <p>Earlier is always better. Extra payments made in the first few years of a loan have the most impact because they reduce the principal balance when interest charges are highest.</p>
      
      <h3 className="text-xl font-semibold text-foreground mt-6">Can I make extra payments on any type of loan?</h3>
      <p>Most loans allow extra payments, but some may have prepayment penalties. Always check your loan terms before making extra payments. Mortgages, auto loans, and personal loans typically allow extra payments.</p>
      
      <h3 className="text-xl font-semibold text-foreground mt-6">How much should I pay extra?</h3>
      <p>Start with what you can afford consistently. Even $50-100 extra per month can make a significant difference. Consider your overall financial situation and other financial goals before committing to large extra payments.</p>

      <div className="text-sm italic text-center mt-8 pt-4 border-t border-gray-200">
        <p>This tool is provided by mycalculating.com. Always consult with a financial advisor before making major financial decisions.</p>
      </div>
    </section>
  );
}

'use client';

import { useState } from 'react';
import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import { z } from 'zod';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Form, FormControl, FormField, FormItem, FormLabel, FormMessage } from '@/components/ui/form';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { AlertTriangle, CheckCircle, Info, DollarSign, Calculator, Globe, FileText } from 'lucide-react';
import Link from 'next/link';
import { EmbedWidget } from '@/components/embed-widget';

const formSchema = z.object({
  loanAmount: z.number().positive('Enter loan amount'),
  interestRate: z.number().min(0).max(50, 'Interest rate too high'),
  loanTerm: z.number().min(1).max(50, 'Loan term too long'),
  balloonPayment: z.number().positive('Enter balloon payment amount'),
  balloonTerm: z.number().min(1).max(50, 'Balloon term too long'),
  paymentFrequency: z.enum(['monthly', 'bi-weekly', 'weekly']).optional(),
});

type FormValues = z.infer<typeof formSchema>;

const calculateBalloonLoan = (values: FormValues) => {
  const {
    loanAmount,
    interestRate,
    loanTerm,
    balloonPayment,
    balloonTerm,
    paymentFrequency = 'monthly'
  } = values;

  // Convert to monthly values
  const monthlyRate = interestRate / 100 / 12;
  const totalPayments = balloonTerm * 12;
  
  // Calculate regular payment (excluding balloon)
  const regularPayment = (loanAmount - balloonPayment) * (monthlyRate * Math.pow(1 + monthlyRate, totalPayments)) / 
                        (Math.pow(1 + monthlyRate, totalPayments) - 1);
  
  // Calculate total interest
  const totalInterest = (regularPayment * totalPayments) + balloonPayment - loanAmount;
  
  // Calculate balloon payment percentage
  const balloonPercentage = (balloonPayment / loanAmount) * 100;
  
  // Calculate remaining balance at balloon term
  const remainingBalance = balloonPayment;
  
  // Calculate total paid
  const totalPaid = (regularPayment * totalPayments) + balloonPayment;
  
  // Calculate interest savings vs traditional loan
  const traditionalPayment = loanAmount * (monthlyRate * Math.pow(1 + monthlyRate, loanTerm * 12)) / 
                           (Math.pow(1 + monthlyRate, loanTerm * 12) - 1);
  const traditionalTotal = traditionalPayment * loanTerm * 12;
  const interestSavings = traditionalTotal - totalPaid;
  
  return {
    regularPayment,
    balloonPayment,
    totalInterest,
    balloonPercentage,
    remainingBalance,
    totalPaid,
    interestSavings,
    traditionalPayment,
    traditionalTotal,
    totalPayments
  };
};

const getBalloonStatus = (result: ReturnType<typeof calculateBalloonLoan>, values: FormValues) => {
  let status = 'moderate';
  let statusColor = 'text-blue-600';
  let bgColor = 'bg-blue-50';
  let borderColor = 'border-blue-200';
  let icon = Info;
  let statusText = 'Moderate Balloon Risk';
  let description = 'Balloon payment requires planning and preparation';

  if (result.balloonPercentage > 50) {
    status = 'high';
    statusColor = 'text-red-600';
    bgColor = 'bg-red-50';
    borderColor = 'border-red-200';
    icon = AlertTriangle;
    statusText = 'High Balloon Risk';
    description = 'Large balloon payment requires significant planning';
  } else if (result.balloonPercentage > 30) {
    status = 'moderate';
    statusColor = 'text-orange-600';
    bgColor = 'bg-orange-50';
    borderColor = 'border-orange-200';
    icon = AlertTriangle;
    statusText = 'Moderate Balloon Risk';
    description = 'Balloon payment requires careful planning';
  } else {
    status = 'low';
    statusColor = 'text-green-600';
    bgColor = 'bg-green-50';
    borderColor = 'border-green-200';
    icon = CheckCircle;
    statusText = 'Low Balloon Risk';
    description = 'Manageable balloon payment';
  }

  return { status, statusColor, bgColor, borderColor, icon, statusText, description };
};

const getDetailedInterpretation = (result: ReturnType<typeof calculateBalloonLoan>, values: FormValues) => {
  const interpretations = [];
  
  // Balloon payment analysis
  interpretations.push(`Your balloon payment of $${result.balloonPayment.toFixed(2)} represents ${result.balloonPercentage.toFixed(1)}% of the original loan amount`);
  interpretations.push(`Regular monthly payment: $${result.regularPayment.toFixed(2)}`);
  interpretations.push(`Total interest over the loan term: $${result.totalInterest.toFixed(2)}`);
  
  // Risk assessment
  if (result.balloonPercentage > 50) {
    interpretations.push('High balloon payment risk - requires significant planning');
    interpretations.push('Consider if you can afford the balloon payment when due');
    interpretations.push('Plan for refinancing or selling the asset');
  } else if (result.balloonPercentage > 30) {
    interpretations.push('Moderate balloon payment risk - requires careful planning');
    interpretations.push('Consider your ability to make the balloon payment');
    interpretations.push('Plan for refinancing or other payment options');
  } else {
    interpretations.push('Low balloon payment risk - manageable payment');
    interpretations.push('Good balance between low payments and balloon risk');
    interpretations.push('Consider if this fits your financial situation');
  }
  
  // Interest analysis
  if (result.interestSavings > 0) {
    interpretations.push(`You will save $${result.interestSavings.toFixed(2)} compared to a traditional loan`);
    interpretations.push('Balloon loan provides interest savings through lower payments');
    interpretations.push('Consider if the savings justify the balloon payment risk');
  } else {
    interpretations.push('Balloon loan may not provide significant interest savings');
    interpretations.push('Consider if a traditional loan might be better');
    interpretations.push('Evaluate the trade-offs carefully');
  }

  return interpretations;
};

const getPersonalizedRecommendations = (result: ReturnType<typeof calculateBalloonLoan>, values: FormValues) => {
  const recommendations = [];
  
  // Balloon payment planning
  if (result.balloonPercentage > 50) {
    recommendations.push('Start saving for the balloon payment immediately');
    recommendations.push('Consider refinancing options well before the balloon date');
    recommendations.push('Plan for selling the asset if you cannot afford the balloon payment');
    recommendations.push('Set up a dedicated savings account for the balloon payment');
  } else if (result.balloonPercentage > 30) {
    recommendations.push('Plan for the balloon payment several years in advance');
    recommendations.push('Consider refinancing options before the balloon date');
    recommendations.push('Build up savings to cover the balloon payment');
    recommendations.push('Monitor your financial situation regularly');
  } else {
    recommendations.push('Plan for the balloon payment but risk is manageable');
    recommendations.push('Consider if you can afford the balloon payment when due');
    recommendations.push('Monitor your financial situation and adjust as needed');
  }
  
  // Interest rate recommendations
  if (values.interestRate > 6) {
    recommendations.push('High interest rate - consider refinancing if rates drop');
    recommendations.push('Monitor interest rate trends for refinancing opportunities');
    recommendations.push('Consider if the balloon loan is worth the risk');
  } else if (values.interestRate > 4) {
    recommendations.push('Moderate interest rate - monitor for refinancing opportunities');
    recommendations.push('Consider your long-term financial goals');
    recommendations.push('Balance the benefits and risks of the balloon loan');
  } else {
    recommendations.push('Low interest rate - balloon loan may be beneficial');
    recommendations.push('Consider if the lower payments are worth the balloon risk');
    recommendations.push('Plan for the balloon payment but enjoy the low payments');
  }
  
  // Term recommendations
  if (values.balloonTerm < 5) {
    recommendations.push('Short balloon term - plan for the payment soon');
    recommendations.push('Consider if you can afford the balloon payment in a few years');
    recommendations.push('Start saving for the balloon payment immediately');
  } else if (values.balloonTerm < 10) {
    recommendations.push('Medium balloon term - plan for the payment in several years');
    recommendations.push('Consider your financial situation at the balloon date');
    recommendations.push('Start planning for the balloon payment');
  } else {
    recommendations.push('Long balloon term - you have time to plan');
    recommendations.push('Consider your long-term financial goals');
    recommendations.push('Monitor your financial situation over time');
  }

  return recommendations;
};

const getBalloonStrategies = (result: ReturnType<typeof calculateBalloonLoan>, values: FormValues) => {
  const strategies = [];
  
  strategies.push('Start saving for the balloon payment immediately');
  strategies.push('Consider refinancing options well before the balloon date');
  strategies.push('Plan for selling the asset if you cannot afford the balloon payment');
  strategies.push('Set up a dedicated savings account for the balloon payment');
  
  if (result.balloonPercentage > 50) {
    strategies.push('High balloon payment - consider if this loan is right for you');
    strategies.push('Plan for multiple payment options (refinance, sell, save)');
    strategies.push('Consider a traditional loan instead');
  } else {
    strategies.push('Moderate balloon payment - plan for the payment');
    strategies.push('Consider your ability to make the balloon payment');
    strategies.push('Balance the benefits and risks');
  }
  
  if (values.interestRate > 5) {
    strategies.push('High interest rate - monitor for refinancing opportunities');
    strategies.push('Consider if the balloon loan is worth the risk');
  } else {
    strategies.push('Low interest rate - balloon loan may be beneficial');
    strategies.push('Enjoy the low payments but plan for the balloon');
  }

  return strategies;
};

export default function BalloonPaymentLoanCalculator() {
  const [result, setResult] = useState<ReturnType<typeof calculateBalloonLoan> | null>(null);

  const form = useForm<FormValues>({
    resolver: zodResolver(formSchema),
    defaultValues: {
      loanAmount: 0,
      interestRate: 0,
      loanTerm: 0,
      balloonPayment: 0,
      balloonTerm: 0,
      paymentFrequency: 'monthly',
    },
  });

  const onSubmit = (values: FormValues) => {
    const calculation = calculateBalloonLoan(values);
    setResult(calculation);
  };

  return (
    <div className="space-y-8">
      {/* Input Form */}
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <Calculator className="h-5 w-5" />
            Balloon Payment Loan Calculation
          </CardTitle>
          <CardDescription>
            Calculate balloon payment loans with lower monthly payments and large final payments
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
                    <FormLabel>Total Loan Term (years)</FormLabel>
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
                    <p className="text-sm text-muted-foreground">Total length of the loan</p>
                  </FormItem>
                )} />
                
                <FormField control={form.control} name="balloonTerm" render={({ field }) => (
                  <FormItem>
                    <FormLabel>Balloon Term (years)</FormLabel>
                    <FormControl>
                      <Input 
                        type="number" 
                        step="1" 
                        placeholder="e.g., 5"
                        {...field} 
                        value={field.value || ''} 
                        onChange={e => field.onChange(parseInt(e.target.value) || 0)} 
                      />
                    </FormControl>
                    <FormMessage />
                    <p className="text-sm text-muted-foreground">When balloon payment is due</p>
                  </FormItem>
                )} />
              </div>

              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <FormField control={form.control} name="balloonPayment" render={({ field }) => (
                  <FormItem>
                    <FormLabel>Balloon Payment ($)</FormLabel>
                    <FormControl>
                      <Input 
                        type="number" 
                        step="0.01" 
                        placeholder="e.g., 250000"
                        {...field} 
                        value={field.value || ''} 
                        onChange={e => field.onChange(parseFloat(e.target.value) || 0)} 
                      />
                    </FormControl>
                    <FormMessage />
                    <p className="text-sm text-muted-foreground">Amount due at balloon term</p>
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
                    <p className="text-sm text-muted-foreground">How often you make payments</p>
                  </FormItem>
                )} />
              </div>

              <Button type="submit" className="w-full">
                <DollarSign className="mr-2 h-4 w-4" />
                Calculate Balloon Loan
              </Button>
            </form>
          </Form>
        </CardContent>
      </Card>

      {result && (
        <Card className="mt-8">
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <DollarSign className="h-5 w-5 text-primary" />
              Balloon Loan Analysis
            </CardTitle>
            <CardDescription>
              Your balloon loan payment schedule and risk assessment
            </CardDescription>
          </CardHeader>
          <CardContent className="space-y-6">
            <div className={`p-6 rounded-lg border ${getBalloonStatus(result, form.getValues()).bgColor} ${getBalloonStatus(result, form.getValues()).borderColor}`}>
              <div className="text-center space-y-4">
                <div>
                  <p className="text-4xl font-bold">${result.regularPayment.toFixed(2)}</p>
                  <p className={`text-lg font-semibold ${getBalloonStatus(result, form.getValues()).statusColor}`}>
                    {getBalloonStatus(result, form.getValues()).statusText}
                  </p>
                  <p className="text-sm text-muted-foreground">
                    {getBalloonStatus(result, form.getValues()).description}
                  </p>
                </div>
                <div className="grid grid-cols-1 md:grid-cols-3 gap-4 text-sm">
                  <div>
                    <p className="text-muted-foreground">Balloon Payment</p>
                    <p className="font-semibold">${result.balloonPayment.toFixed(2)}</p>
                  </div>
                  <div>
                    <p className="text-muted-foreground">Balloon %</p>
                    <p className="font-semibold">{result.balloonPercentage.toFixed(1)}%</p>
                  </div>
                  <div>
                    <p className="text-muted-foreground">Interest Savings</p>
                    <p className="font-semibold">${result.interestSavings.toFixed(2)}</p>
                  </div>
                </div>
              </div>
            </div>

            <div className="space-y-4">
              <h3 className="font-semibold text-foreground">Detailed Interpretation</h3>
              <ul className="space-y-2">
                {getDetailedInterpretation(result, form.getValues()).map((interpretation, index) => (
                  <li key={index} className="flex items-start gap-2">
                    <Info className="h-4 w-4 text-blue-600 mt-0.5 flex-shrink-0" />
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
                    <CheckCircle className="h-4 w-4 text-green-600 mt-0.5 flex-shrink-0" />
                    <span className="text-sm">{recommendation}</span>
                  </li>
                ))}
              </ul>
            </div>

            <div className="space-y-4">
              <h3 className="font-semibold text-foreground">Balloon Payment Strategies</h3>
              <ul className="space-y-2">
                {getBalloonStrategies(result, form.getValues()).map((strategy, index) => (
                  <li key={index} className="flex items-start gap-2">
                    <AlertTriangle className="h-4 w-4 text-orange-600 mt-0.5 flex-shrink-0" />
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
                <a href="/category/finance/loan-amortization-extra-payments-calculator" className="text-primary hover:underline">
                  Loan Amortization Calculator
                </a>
              </h4>
              <p className="text-sm text-muted-foreground">
                Calculate loan amortization schedules with extra payments.
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
          </div>
        </CardContent>
      </Card>

      {/* Complete Guide */}
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <FileText className="h-5 w-5" />
            Complete Guide to Balloon Payment Loans
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
            Common questions about balloon payment loans
          </CardDescription>
        </CardHeader>
        <CardContent className="space-y-6">
          <div>
            <h4 className="font-semibold text-foreground mb-2">What happens if I can't make the balloon payment?</h4>
            <p className="text-muted-foreground">
              If you can't make the balloon payment, you'll need to refinance, sell the asset, or default on the loan. Defaulting can result in foreclosure and damage to your credit score.
            </p>
          </div>

          <div>
            <h4 className="font-semibold text-foreground mb-2">Can I refinance a balloon loan?</h4>
            <p className="text-muted-foreground">
              Yes, you can refinance a balloon loan, but you'll need to qualify for a new loan. This depends on your credit score, income, and the value of the asset at the time of refinancing.
            </p>
          </div>

          <div>
            <h4 className="font-semibold text-foreground mb-2">Are balloon loans good for investment properties?</h4>
            <p className="text-muted-foreground">
              Balloon loans can be good for investment properties if you plan to sell or refinance before the balloon date. They offer lower monthly payments and better cash flow for investors.
            </p>
          </div>

          <div>
            <h4 className="font-semibold text-foreground mb-2">How much should I save for a balloon payment?</h4>
            <p className="text-muted-foreground">
              You should save enough to cover the entire balloon payment, plus some extra for unexpected expenses. Consider your income, expenses, and other financial goals when determining how much to save.
            </p>
          </div>

          <div>
            <h4 className="font-semibold text-foreground mb-2">What is a balloon payment loan?</h4>
            <p className="text-muted-foreground">
              A balloon payment loan is a type of loan that has lower monthly payments for most of the loan term, but requires a large final payment (the "balloon") at the end of the loan period.
            </p>
          </div>

          <div>
            <h4 className="font-semibold text-foreground mb-2">What are the risks of balloon loans?</h4>
            <p className="text-muted-foreground">
              Balloon payment loans carry significant risks including refinancing risk, interest rate risk, credit risk, and market risk. You may not be able to refinance when the balloon is due, and interest rates may be higher at that time.
            </p>
          </div>

          <div>
            <h4 className="font-semibold text-foreground mb-2">Can I make extra payments on a balloon loan?</h4>
            <p className="text-muted-foreground">
              Yes, most balloon loans allow extra payments. Making extra payments can reduce the balloon amount and help you save on interest. Always check with your lender about prepayment policies.
            </p>
          </div>

          <div>
            <h4 className="font-semibold text-foreground mb-2">How do I prepare for a balloon payment?</h4>
            <p className="text-muted-foreground">
              Start saving for the balloon payment immediately, set up a dedicated savings account, monitor interest rates and refinancing options, and plan for multiple payment scenarios including refinancing, selling the asset, or making the payment in full.
            </p>
          </div>
        </CardContent>
      </Card>
      
      <EmbedWidget categorySlug="finance" calculatorSlug="balloon-payment-loan-calculator" />
    </div>
  );
}

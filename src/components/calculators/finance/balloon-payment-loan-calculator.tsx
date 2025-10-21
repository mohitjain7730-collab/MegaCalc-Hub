'use client';

import { useState } from 'react';
import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import { z } from 'zod';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Form, FormControl, FormField, FormItem, FormLabel, FormMessage } from '@/components/ui/form';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { AlertTriangle, CheckCircle, Info, DollarSign } from 'lucide-react';
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
      loanAmount: undefined,
      interestRate: undefined,
      loanTerm: undefined,
      balloonPayment: undefined,
      balloonTerm: undefined,
      paymentFrequency: 'monthly',
    },
  });

  const onSubmit = (values: FormValues) => {
    const calculation = calculateBalloonLoan(values);
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
                <FormLabel>Total Loan Term (years)</FormLabel>
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
                    value={field.value ?? ''} 
                    onChange={e => field.onChange(parseInt(e.target.value) || undefined)} 
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
                    value={field.value ?? ''} 
                    onChange={e => field.onChange(parseFloat(e.target.value) || undefined)} 
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

      <BalloonPaymentGuide />
      
      <EmbedWidget calculatorSlug="balloon-payment-loan-calculator" calculatorName="Balloon Payment Loan Calculator" />
    </div>
  );
}

function BalloonPaymentGuide() {
  return (
    <section className="space-y-6 text-muted-foreground leading-relaxed bg-white p-6 md:p-10 rounded-lg shadow-lg" itemScope itemType="https://schema.org/Calculator">
      <meta itemProp="name" content="Balloon Payment Loan Calculator - Loan Risk Assessment" />
      <meta itemProp="description" content="Calculate balloon payment loans with lower monthly payments and large final payments. Assess balloon payment risk and plan for loan payoff." />
      <meta itemProp="keywords" content="balloon payment calculator, balloon loan, loan risk, mortgage calculator, loan payoff" />
      
      <h1 className="text-3xl md:text-4xl font-extrabold text-foreground mb-4" itemProp="headline">Balloon Payment Loan Calculator: Assess Your Loan Risk</h1>
      
      <h2 className="text-2xl font-bold text-foreground mt-8 mb-4">Table of Contents</h2>
      <ul className="list-disc ml-6 space-y-2 text-blue-600">
        <li><a href="#what-is-balloon" className="hover:underline">What is a Balloon Payment Loan?</a></li>
        <li><a href="#how-balloon-works" className="hover:underline">How Balloon Payments Work</a></li>
        <li><a href="#balloon-risks" className="hover:underline">Balloon Payment Risks</a></li>
        <li><a href="#balloon-benefits" className="hover:underline">Benefits of Balloon Loans</a></li>
        <li><a href="#balloon-strategies" className="hover:underline">Balloon Payment Strategies</a></li>
        <li><a href="#faq" className="hover:underline">Balloon Payment FAQs</a></li>
      </ul>

      <hr />

      <h2 id="what-is-balloon" className="text-2xl font-bold text-foreground pt-8" itemProp="articleSection">What is a Balloon Payment Loan?</h2>
      <p>A <strong>balloon payment loan</strong> is a type of loan that has lower monthly payments for most of the loan term, but requires a large final payment (the "balloon") at the end of the loan period.</p>
      
      <h3 className="text-xl font-semibold text-foreground mt-6">Key Characteristics</h3>
      <ul className="list-disc ml-6 space-y-2">
        <li>Lower monthly payments during the loan term</li>
        <li>Large final payment (balloon) due at the end</li>
        <li>Shorter loan term than traditional loans</li>
        <li>Higher risk due to the large final payment</li>
      </ul>
      
      <h3 className="text-xl font-semibold text-foreground mt-6">Common Uses</h3>
      <ul className="list-disc ml-6 space-y-2">
        <li>Real estate investments</li>
        <li>Business loans</li>
        <li>Auto loans for high-value vehicles</li>
        <li>Construction loans</li>
      </ul>

      <hr />

      <h2 id="how-balloon-works" className="text-2xl font-bold text-foreground pt-8" itemProp="articleSection">How Balloon Payments Work</h2>
      <p>Balloon payment loans work by structuring payments so that only a portion of the principal is paid off during the loan term, with the remaining balance due as a large final payment.</p>
      
      <h3 className="text-xl font-semibold text-foreground mt-6">Payment Structure</h3>
      <ul className="list-disc ml-6 space-y-2">
        <li>Regular monthly payments cover interest and some principal</li>
        <li>Balloon payment covers the remaining principal balance</li>
        <li>Total interest is typically lower than traditional loans</li>
        <li>Risk is concentrated in the final payment</li>
      </ul>
      
      <h3 className="text-xl font-semibold text-foreground mt-6">Balloon Payment Calculation</h3>
      <pre className="bg-gray-200 p-3 rounded-md my-4"><code>Balloon Payment = Original Loan Amount - (Regular Payments × Number of Payments)</code></pre>
      <p>The balloon payment represents the remaining principal balance after all regular payments have been made.</p>

      <hr />

      <h2 id="balloon-risks" className="text-2xl font-bold text-foreground pt-8" itemProp="articleSection">Balloon Payment Risks</h2>
      <p>Balloon payment loans carry significant risks that borrowers must understand and plan for:</p>
      
      <h3 className="text-xl font-semibold text-foreground mt-6">Primary Risks</h3>
      <ul className="list-disc ml-6 space-y-2">
        <li><strong>Refinancing Risk:</strong> May not be able to refinance when balloon is due</li>
        <li><strong>Interest Rate Risk:</strong> Rates may be higher when refinancing</li>
        <li><strong>Credit Risk:</strong> Credit may be worse when balloon is due</li>
        <li><strong>Market Risk:</strong> Asset value may be lower than expected</li>
      </ul>
      
      <h3 className="text-xl font-semibold text-foreground mt-6">Risk Mitigation</h3>
      <ul className="list-disc ml-6 space-y-2">
        <li>Start planning for the balloon payment early</li>
        <li>Build up savings to cover the balloon payment</li>
        <li>Monitor interest rates and refinancing options</li>
        <li>Consider selling the asset if needed</li>
      </ul>

      <hr />

      <h2 id="balloon-benefits" className="text-2xl font-bold text-foreground pt-8" itemProp="articleSection">Benefits of Balloon Loans</h2>
      <p>Despite the risks, balloon payment loans offer several benefits for certain borrowers:</p>
      
      <h3 className="text-xl font-semibold text-foreground mt-6">Financial Benefits</h3>
      <ul className="list-disc ml-6 space-y-2">
        <li>Lower monthly payments during the loan term</li>
        <li>Lower total interest paid over the life of the loan</li>
        <li>Better cash flow management</li>
        <li>Potential for higher returns on invested savings</li>
      </ul>
      
      <h3 className="text-xl font-semibold text-foreground mt-6">Strategic Benefits</h3>
      <ul className="list-disc ml-6 space-y-2">
        <li>Allows for higher loan amounts</li>
        <li>Useful for investment properties</li>
        <li>Good for short-term ownership plans</li>
        <li>Flexible payment structure</li>
      </ul>

      <hr />

      <h2 id="balloon-strategies" className="text-2xl font-bold text-foreground pt-8" itemProp="articleSection">Balloon Payment Strategies</h2>
      <p>Successful balloon loan management requires careful planning and strategy:</p>
      
      <h3 className="text-xl font-semibold text-foreground mt-6">Planning Strategies</h3>
      <ul className="list-disc ml-6 space-y-2">
        <li>Start saving for the balloon payment immediately</li>
        <li>Set up a dedicated savings account</li>
        <li>Monitor interest rates and refinancing options</li>
        <li>Plan for multiple payment scenarios</li>
      </ul>
      
      <h3 className="text-xl font-semibold text-foreground mt-6">Payment Strategies</h3>
      <ul className="list-disc ml-6 space-y-2">
        <li>Make extra payments to reduce the balloon amount</li>
        <li>Consider refinancing before the balloon date</li>
        <li>Plan for selling the asset if needed</li>
        <li>Have backup financing options ready</li>
      </ul>
      
      <h3 className="text-xl font-semibold text-foreground mt-6">Risk Management</h3>
      <ul className="list-disc ml-6 space-y-2">
        <li>Monitor your financial situation regularly</li>
        <li>Keep your credit score high</li>
        <li>Diversify your investments</li>
        <li>Have contingency plans ready</li>
      </ul>

      <hr />

      <h2 id="faq" className="text-2xl font-bold text-foreground pt-8" itemProp="articleSection">Balloon Payment FAQs</h2>
      
      <h3 className="text-xl font-semibold text-foreground mt-6">What happens if I can't make the balloon payment?</h3>
      <p>If you can't make the balloon payment, you'll need to refinance, sell the asset, or default on the loan. Defaulting can result in foreclosure and damage to your credit score.</p>
      
      <h3 className="text-xl font-semibold text-foreground mt-6">Can I refinance a balloon loan?</h3>
      <p>Yes, you can refinance a balloon loan, but you'll need to qualify for a new loan. This depends on your credit score, income, and the value of the asset at the time of refinancing.</p>
      
      <h3 className="text-xl font-semibold text-foreground mt-6">Are balloon loans good for investment properties?</h3>
      <p>Balloon loans can be good for investment properties if you plan to sell or refinance before the balloon date. They offer lower monthly payments and better cash flow for investors.</p>
      
      <h3 className="text-xl font-semibold text-foreground mt-6">How much should I save for a balloon payment?</h3>
      <p>You should save enough to cover the entire balloon payment, plus some extra for unexpected expenses. Consider your income, expenses, and other financial goals when determining how much to save.</p>

      <div className="text-sm italic text-center mt-8 pt-4 border-t border-gray-200">
        <p>This tool is provided by mycalculating.com. Always consult with a financial advisor before making major financial decisions.</p>
      </div>
    </section>
  );
}

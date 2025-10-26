'use client';

import { useState } from 'react';
import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import { z } from 'zod';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Form, FormControl, FormField, FormItem, FormLabel, FormMessage } from '@/components/ui/form';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { TrendingUp, CheckCircle, Info, Home, Calculator, Globe, FileText } from 'lucide-react';
import Link from 'next/link';
import { EmbedWidget } from '@/components/embed-widget';

const formSchema = z.object({
  loanAmount: z.number().positive('Enter loan amount'),
  interestRate: z.number().min(0).max(50, 'Interest rate too high'),
  loanTerm: z.number().min(1).max(50, 'Loan term too long'),
  graduationPeriod: z.number().min(1).max(20, 'Graduation period too long'),
  graduationRate: z.number().min(0).max(50, 'Graduation rate too high'),
  paymentFrequency: z.enum(['monthly', 'bi-weekly', 'weekly']).optional(),
});

type FormValues = z.infer<typeof formSchema>;

const calculateGPM = (values: FormValues) => {
  const {
    loanAmount,
    interestRate,
    loanTerm,
    graduationPeriod,
    graduationRate,
    paymentFrequency = 'monthly'
  } = values;

  // Convert to monthly values
  const monthlyRate = interestRate / 100 / 12;
  const totalPayments = loanTerm * 12;
  const graduationPayments = graduationPeriod * 12;
  
  // Calculate initial payment
  const initialPayment = loanAmount * (monthlyRate * Math.pow(1 + monthlyRate, totalPayments)) / 
                        (Math.pow(1 + monthlyRate, totalPayments) - 1);
  
  // Calculate graduated payments
  const graduatedPayment = initialPayment * (1 + graduationRate / 100);
  
  // Calculate total interest
  let totalInterest = 0;
  let balance = loanAmount;
  
  // First phase: initial payments
  for (let month = 1; month <= graduationPayments; month++) {
    const interestPayment = balance * monthlyRate;
    const principalPayment = initialPayment - interestPayment;
    balance -= principalPayment;
    totalInterest += interestPayment;
  }
  
  // Second phase: graduated payments
  for (let month = graduationPayments + 1; month <= totalPayments && balance > 0.01; month++) {
    const interestPayment = balance * monthlyRate;
    const principalPayment = graduatedPayment - interestPayment;
    balance -= principalPayment;
    totalInterest += interestPayment;
  }
  
  // Calculate total paid
  const totalPaid = (initialPayment * graduationPayments) + (graduatedPayment * (totalPayments - graduationPayments));
  
  // Calculate interest savings vs traditional loan
  const traditionalPayment = loanAmount * (monthlyRate * Math.pow(1 + monthlyRate, totalPayments)) / 
                           (Math.pow(1 + monthlyRate, totalPayments) - 1);
  const traditionalTotal = traditionalPayment * totalPayments;
  const interestSavings = traditionalTotal - totalPaid;
  
  return {
    initialPayment,
    graduatedPayment,
    totalInterest,
    totalPaid,
    interestSavings,
    traditionalPayment,
    traditionalTotal,
    graduationPayments,
    totalPayments
  };
};

const getGPMStatus = (result: ReturnType<typeof calculateGPM>, values: FormValues) => {
  let status = 'moderate';
  let statusColor = 'text-blue-600';
  let bgColor = 'bg-blue-50';
  let borderColor = 'border-blue-200';
  let icon = Info;
  let statusText = 'Moderate GPM Risk';
  let description = 'Graduated payment requires careful planning';

  if (result.graduatedPayment > result.initialPayment * 1.5) {
    status = 'high';
    statusColor = 'text-orange-600';
    bgColor = 'bg-orange-50';
    borderColor = 'border-orange-200';
    icon = TrendingUp;
    statusText = 'High GPM Risk';
    description = 'Large payment increase requires significant planning';
  } else if (result.graduatedPayment > result.initialPayment * 1.2) {
    status = 'moderate';
    statusColor = 'text-blue-600';
    bgColor = 'bg-blue-50';
    borderColor = 'border-blue-200';
    icon = Info;
    statusText = 'Moderate GPM Risk';
    description = 'Graduated payment requires careful planning';
  } else {
    status = 'low';
    statusColor = 'text-green-600';
    bgColor = 'bg-green-50';
    borderColor = 'border-green-200';
    icon = CheckCircle;
    statusText = 'Low GPM Risk';
    description = 'Manageable graduated payment';
  }

  return { status, statusColor, bgColor, borderColor, icon, statusText, description };
};

const getDetailedInterpretation = (result: ReturnType<typeof calculateGPM>, values: FormValues) => {
  const interpretations = [];
  
  // Payment analysis
  interpretations.push(`Initial payment: $${result.initialPayment.toFixed(2)} for ${result.graduationPayments} months`);
  interpretations.push(`Graduated payment: $${result.graduatedPayment.toFixed(2)} for remaining ${result.totalPayments - result.graduationPayments} months`);
  interpretations.push(`Total interest over the loan term: $${result.totalInterest.toFixed(2)}`);
  
  // Risk assessment
  const paymentIncrease = ((result.graduatedPayment - result.initialPayment) / result.initialPayment) * 100;
  if (paymentIncrease > 50) {
    interpretations.push('High payment increase risk - requires significant planning');
    interpretations.push('Consider if you can afford the graduated payment when due');
    interpretations.push('Plan for the payment increase several years in advance');
  } else if (paymentIncrease > 20) {
    interpretations.push('Moderate payment increase risk - requires careful planning');
    interpretations.push('Consider your ability to make the graduated payment');
    interpretations.push('Plan for the payment increase');
  } else {
    interpretations.push('Low payment increase risk - manageable payment');
    interpretations.push('Good balance between low initial payments and graduated risk');
    interpretations.push('Consider if this fits your financial situation');
  }
  
  // Interest analysis
  if (result.interestSavings > 0) {
    interpretations.push(`You will save $${result.interestSavings.toFixed(2)} compared to a traditional loan`);
    interpretations.push('GPM provides interest savings through lower initial payments');
    interpretations.push('Consider if the savings justify the graduated payment risk');
  } else {
    interpretations.push('GPM may not provide significant interest savings');
    interpretations.push('Consider if a traditional loan might be better');
    interpretations.push('Evaluate the trade-offs carefully');
  }

  return interpretations;
};

const getPersonalizedRecommendations = (result: ReturnType<typeof calculateGPM>, values: FormValues) => {
  const recommendations = [];
  
  // Payment planning
  const paymentIncrease = ((result.graduatedPayment - result.initialPayment) / result.initialPayment) * 100;
  if (paymentIncrease > 50) {
    recommendations.push('Start planning for the graduated payment immediately');
    recommendations.push('Consider increasing your income or reducing expenses');
    recommendations.push('Plan for the payment increase several years in advance');
    recommendations.push('Consider if this loan is right for your situation');
  } else if (paymentIncrease > 20) {
    recommendations.push('Plan for the graduated payment several years in advance');
    recommendations.push('Consider your ability to make the graduated payment');
    recommendations.push('Build up savings to cover the payment increase');
    recommendations.push('Monitor your financial situation regularly');
  } else {
    recommendations.push('Plan for the graduated payment but risk is manageable');
    recommendations.push('Consider if you can afford the graduated payment when due');
    recommendations.push('Monitor your financial situation and adjust as needed');
  }
  
  // Interest rate recommendations
  if (values.interestRate > 6) {
    recommendations.push('High interest rate - consider refinancing if rates drop');
    recommendations.push('Monitor interest rate trends for refinancing opportunities');
    recommendations.push('Consider if the GPM is worth the risk');
  } else if (values.interestRate > 4) {
    recommendations.push('Moderate interest rate - monitor for refinancing opportunities');
    recommendations.push('Consider your long-term financial goals');
    recommendations.push('Balance the benefits and risks of the GPM');
  } else {
    recommendations.push('Low interest rate - GPM may be beneficial');
    recommendations.push('Consider if the lower initial payments are worth the risk');
    recommendations.push('Plan for the graduated payment but enjoy the low initial payments');
  }
  
  // Term recommendations
  if (values.graduationPeriod < 3) {
    recommendations.push('Short graduation period - plan for the payment increase soon');
    recommendations.push('Consider if you can afford the graduated payment in a few years');
    recommendations.push('Start planning for the graduated payment immediately');
  } else if (values.graduationPeriod < 7) {
    recommendations.push('Medium graduation period - plan for the payment increase in several years');
    recommendations.push('Consider your financial situation at the graduation date');
    recommendations.push('Start planning for the graduated payment');
  } else {
    recommendations.push('Long graduation period - you have time to plan');
    recommendations.push('Consider your long-term financial goals');
    recommendations.push('Monitor your financial situation over time');
  }

  return recommendations;
};

const getGPMStrategies = (result: ReturnType<typeof calculateGPM>, values: FormValues) => {
  const strategies = [];
  
  strategies.push('Start planning for the graduated payment immediately');
  strategies.push('Consider increasing your income or reducing expenses');
  strategies.push('Build up savings to cover the payment increase');
  strategies.push('Monitor your financial situation regularly');
  
  const paymentIncrease = ((result.graduatedPayment - result.initialPayment) / result.initialPayment) * 100;
  if (paymentIncrease > 50) {
    strategies.push('High payment increase - consider if this loan is right for you');
    strategies.push('Plan for multiple payment scenarios');
    strategies.push('Consider a traditional loan instead');
  } else {
    strategies.push('Moderate payment increase - plan for the payment');
    strategies.push('Consider your ability to make the graduated payment');
    strategies.push('Balance the benefits and risks');
  }
  
  if (values.interestRate > 5) {
    strategies.push('High interest rate - monitor for refinancing opportunities');
    strategies.push('Consider if the GPM is worth the risk');
  } else {
    strategies.push('Low interest rate - GPM may be beneficial');
    strategies.push('Enjoy the low initial payments but plan for the graduated payment');
  }

  return strategies;
};

export default function GraduatedPaymentMortgageCalculator() {
  const [result, setResult] = useState<ReturnType<typeof calculateGPM> | null>(null);

  const form = useForm<FormValues>({
    resolver: zodResolver(formSchema),
    defaultValues: {
      loanAmount: 0,
      interestRate: 0,
      loanTerm: 0,
      graduationPeriod: 0,
      graduationRate: 0,
      paymentFrequency: 'monthly',
    },
  });

  const onSubmit = (values: FormValues) => {
    const calculation = calculateGPM(values);
    setResult(calculation);
  };

  return (
    <div className="space-y-8">
      {/* Input Form */}
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <Calculator className="h-5 w-5" />
            Graduated Payment Mortgage Calculation
          </CardTitle>
          <CardDescription>
            Calculate graduated payment mortgages with increasing payments over time
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
                    <p className="text-sm text-muted-foreground">Total length of the loan</p>
                  </FormItem>
                )} />
                
                <FormField control={form.control} name="graduationPeriod" render={({ field }) => (
                  <FormItem>
                    <FormLabel>Graduation Period (years)</FormLabel>
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
                    <p className="text-sm text-muted-foreground">Years before payment increases</p>
                  </FormItem>
                )} />
              </div>

              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <FormField control={form.control} name="graduationRate" render={({ field }) => (
                  <FormItem>
                    <FormLabel>Graduation Rate (%)</FormLabel>
                    <FormControl>
                      <Input 
                        type="number" 
                        step="0.1" 
                        placeholder="e.g., 7.5"
                        {...field} 
                        value={field.value || ''} 
                        onChange={e => field.onChange(parseFloat(e.target.value) || 0)} 
                      />
                    </FormControl>
                    <FormMessage />
                    <p className="text-sm text-muted-foreground">Annual payment increase rate</p>
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
                <Home className="mr-2 h-4 w-4" />
                Calculate GPM
              </Button>
            </form>
          </Form>
        </CardContent>
      </Card>

      {result && (
        <Card className="mt-8">
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <Home className="h-5 w-5 text-primary" />
              Graduated Payment Mortgage Analysis
            </CardTitle>
            <CardDescription>
              Your GPM payment schedule and risk assessment
            </CardDescription>
          </CardHeader>
          <CardContent className="space-y-6">
            <div className={`p-6 rounded-lg border ${getGPMStatus(result, form.getValues()).bgColor} ${getGPMStatus(result, form.getValues()).borderColor}`}>
              <div className="text-center space-y-4">
                <div>
                  <p className="text-4xl font-bold">${result.initialPayment.toFixed(2)}</p>
                  <p className={`text-lg font-semibold ${getGPMStatus(result, form.getValues()).statusColor}`}>
                    {getGPMStatus(result, form.getValues()).statusText}
                  </p>
                  <p className="text-sm text-muted-foreground">
                    {getGPMStatus(result, form.getValues()).description}
                  </p>
                </div>
                <div className="grid grid-cols-1 md:grid-cols-3 gap-4 text-sm">
                  <div>
                    <p className="text-muted-foreground">Graduated Payment</p>
                    <p className="font-semibold">${result.graduatedPayment.toFixed(2)}</p>
                  </div>
                  <div>
                    <p className="text-muted-foreground">Total Interest</p>
                    <p className="font-semibold">${result.totalInterest.toFixed(2)}</p>
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
              <h3 className="font-semibold text-foreground">GPM Strategies</h3>
              <ul className="space-y-2">
                {getGPMStrategies(result, form.getValues()).map((strategy, index) => (
                  <li key={index} className="flex items-start gap-2">
                    <TrendingUp className="h-4 w-4 text-purple-600 mt-0.5 flex-shrink-0" />
                    <span className="text-sm">{strategy}</span>
                  </li>
                ))}
              </ul>
            </div>
          </CardContent>
        </Card>
      )}

      {/* Related Calculators */}
      <Card className="mt-8">
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <Globe className="h-5 w-5 text-primary" />
            Related Calculators
          </CardTitle>
          <CardDescription>
            Explore other financial calculators
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
      <Card className="mt-8">
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <FileText className="h-5 w-5 text-primary" />
            Complete Guide to Graduated Payment Mortgages
          </CardTitle>
          <CardDescription>
            A comprehensive guide to understanding and managing graduated payment mortgages
          </CardDescription>
        </CardHeader>
        <CardContent className="prose prose-sm dark:prose-invert max-w-none">
          <p>This is a sample line for the complete guide section. You can add your detailed content here.</p>
          <p>This is another sample line for the guide section. Replace these with your comprehensive guide content.</p>
        </CardContent>
      </Card>

      {/* FAQ */}
      <Card className="mt-8">
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <Info className="h-5 w-5 text-primary" />
            Frequently Asked Questions
          </CardTitle>
          <CardDescription>
            Answers to common questions about Graduated Payment Mortgages
          </CardDescription>
        </CardHeader>
        <CardContent className="space-y-6">
          <div>
            <h4 className="font-semibold text-foreground mb-2">What is a Graduated Payment Mortgage?</h4>
            <p className="text-muted-foreground">
              A Graduated Payment Mortgage (GPM) is a type of mortgage that starts with lower monthly payments that gradually increase over time, typically for the first 5-10 years of the loan. This structure allows borrowers to qualify for a larger loan amount or afford higher monthly payments later in the loan term.
            </p>
          </div>

          <div>
            <h4 className="font-semibold text-foreground mb-2">How does GPM work?</h4>
            <p className="text-muted-foreground">
              GPM works by structuring payments so that initial payments are lower than what would be required to fully amortize the loan, with payments increasing over time to catch up. The graduation rate determines how much the payment increases each year.
            </p>
          </div>

          <div>
            <h4 className="font-semibold text-foreground mb-2">What are the risks of a GPM?</h4>
            <p className="text-muted-foreground">
              GPM loans come with several risks including higher payments in later years, potential negative amortization initially, higher total interest paid over the loan term, and risk of payment shock when payments increase.
            </p>
          </div>

          <div>
            <h4 className="font-semibold text-foreground mb-2">What happens if I can't afford the graduated payment?</h4>
            <p className="text-muted-foreground">
              If you can't afford the graduated payment, you'll need to refinance, sell the property, or default on the loan. Defaulting can result in foreclosure and damage to your credit score.
            </p>
          </div>

          <div>
            <h4 className="font-semibold text-foreground mb-2">Can I refinance a GPM loan?</h4>
            <p className="text-muted-foreground">
              Yes, you can refinance a GPM loan, but you'll need to qualify for a new loan. This depends on your credit score, income, and the value of the property at the time of refinancing.
            </p>
          </div>

          <div>
            <h4 className="font-semibold text-foreground mb-2">Are GPM loans good for first-time homebuyers?</h4>
            <p className="text-muted-foreground">
              GPM loans can be good for first-time homebuyers who expect their income to increase over time. However, they require careful planning and risk management.
            </p>
          </div>

          <div>
            <h4 className="font-semibold text-foreground mb-2">How much should I plan for payment increases?</h4>
            <p className="text-muted-foreground">
              You should plan for payment increases based on the graduation rate and your expected income growth. Consider your ability to make higher payments and have backup plans ready.
            </p>
          </div>

          <div>
            <h4 className="font-semibold text-foreground mb-2">What is negative amortization?</h4>
            <p className="text-muted-foreground">
              Negative amortization occurs when your monthly payment is less than the interest charge on your loan, causing your loan balance to increase over time rather than decrease.
            </p>
          </div>

          <div>
            <h4 className="font-semibold text-foreground mb-2">How do GPM payments compare to traditional mortgages?</h4>
            <p className="text-muted-foreground">
              GPM payments start lower than traditional mortgage payments but increase over time. After the graduation period, GPM payments are typically higher than traditional mortgage payments to compensate for the lower initial payments.
            </p>
          </div>
        </CardContent>
      </Card>
      
      <EmbedWidget categorySlug="finance" calculatorSlug="graduated-payment-mortgage-calculator" />
    </div>
  );
}

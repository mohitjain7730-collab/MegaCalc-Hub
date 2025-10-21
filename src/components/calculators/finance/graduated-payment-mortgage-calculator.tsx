'use client';

import { useState } from 'react';
import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import { z } from 'zod';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Form, FormControl, FormField, FormItem, FormLabel, FormMessage } from '@/components/ui/form';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { TrendingUp, CheckCircle, Info, Home } from 'lucide-react';
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
      loanAmount: undefined,
      interestRate: undefined,
      loanTerm: undefined,
      graduationPeriod: undefined,
      graduationRate: undefined,
      paymentFrequency: 'monthly',
    },
  });

  const onSubmit = (values: FormValues) => {
    const calculation = calculateGPM(values);
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
                    value={field.value ?? ''} 
                    onChange={e => field.onChange(parseInt(e.target.value) || undefined)} 
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
                    value={field.value ?? ''} 
                    onChange={e => field.onChange(parseFloat(e.target.value) || undefined)} 
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

      <GPMGuide />
      
      <EmbedWidget calculatorSlug="graduated-payment-mortgage-calculator" calculatorName="Graduated Payment Mortgage Calculator" />
    </div>
  );
}

function GPMGuide() {
  return (
    <section className="space-y-6 text-muted-foreground leading-relaxed bg-white p-6 md:p-10 rounded-lg shadow-lg" itemScope itemType="https://schema.org/Calculator">
      <meta itemProp="name" content="Graduated Payment Mortgage Calculator - GPM Analysis" />
      <meta itemProp="description" content="Calculate graduated payment mortgages with lower initial payments and increasing payments over time. Assess GPM risk and plan for payment increases." />
      <meta itemProp="keywords" content="graduated payment mortgage calculator, GPM calculator, mortgage payment, payment increase, mortgage risk" />
      
      <h1 className="text-3xl md:text-4xl font-extrabold text-foreground mb-4" itemProp="headline">Graduated Payment Mortgage Calculator: Assess Your Payment Risk</h1>
      
      <h2 className="text-2xl font-bold text-foreground mt-8 mb-4">Table of Contents</h2>
      <ul className="list-disc ml-6 space-y-2 text-blue-600">
        <li><a href="#what-is-gpm" className="hover:underline">What is a Graduated Payment Mortgage?</a></li>
        <li><a href="#how-gpm-works" className="hover:underline">How GPM Works</a></li>
        <li><a href="#gpm-risks" className="hover:underline">GPM Risks and Benefits</a></li>
        <li><a href="#gpm-strategies" className="hover:underline">GPM Strategies</a></li>
        <li><a href="#faq" className="hover:underline">GPM FAQs</a></li>
      </ul>

      <hr />

      <h2 id="what-is-gpm" className="text-2xl font-bold text-foreground pt-8" itemProp="articleSection">What is a Graduated Payment Mortgage?</h2>
      <p>A <strong>Graduated Payment Mortgage (GPM)</strong> is a type of mortgage that starts with lower monthly payments that gradually increase over time, typically for the first 5-10 years of the loan.</p>
      
      <h3 className="text-xl font-semibold text-foreground mt-6">Key Characteristics</h3>
      <ul className="list-disc ml-6 space-y-2">
        <li>Lower initial monthly payments</li>
        <li>Payments increase at a predetermined rate</li>
        <li>Higher payments in later years</li>
        <li>May result in negative amortization initially</li>
      </ul>
      
      <h3 className="text-xl font-semibold text-foreground mt-6">Common Uses</h3>
      <ul className="list-disc ml-6 space-y-2">
        <li>First-time homebuyers with expected income growth</li>
        <li>Young professionals with career advancement potential</li>
        <li>Borrowers who expect higher income in the future</li>
        <li>Investment properties with expected appreciation</li>
      </ul>

      <hr />

      <h2 id="how-gpm-works" className="text-2xl font-bold text-foreground pt-8" itemProp="articleSection">How GPM Works</h2>
      <p>GPM works by structuring payments so that initial payments are lower than what would be required to fully amortize the loan, with payments increasing over time to catch up.</p>
      
      <h3 className="text-xl font-semibold text-foreground mt-6">Payment Structure</h3>
      <ul className="list-disc ml-6 space-y-2">
        <li>Initial payments may be lower than interest-only</li>
        <li>Payments increase at a predetermined rate</li>
        <li>Final payments are higher than traditional mortgages</li>
        <li>Total interest may be higher than traditional loans</li>
      </ul>
      
      <h3 className="text-xl font-semibold text-foreground mt-6">Payment Calculation</h3>
      <pre className="bg-gray-200 p-3 rounded-md my-4"><code>Initial Payment = Loan Amount × (Monthly Rate × (1 + Monthly Rate)^Total Payments) / ((1 + Monthly Rate)^Total Payments - 1) × Graduation Factor</code></pre>
      <p>The graduation factor determines how much lower the initial payment is compared to a traditional mortgage.</p>

      <hr />

      <h2 id="gpm-risks" className="text-2xl font-bold text-foreground pt-8" itemProp="articleSection">GPM Risks and Benefits</h2>
      <p>GPM loans offer both benefits and risks that borrowers must carefully consider:</p>
      
      <h3 className="text-xl font-semibold text-foreground mt-6">Benefits</h3>
      <ul className="list-disc ml-6 space-y-2">
        <li>Lower initial payments for easier qualification</li>
        <li>Better cash flow management in early years</li>
        <li>Allows for higher loan amounts</li>
        <li>Good for borrowers with expected income growth</li>
      </ul>
      
      <h3 className="text-xl font-semibold text-foreground mt-6">Risks</h3>
      <ul className="list-disc ml-6 space-y-2">
        <li>Higher payments in later years</li>
        <li>May result in negative amortization</li>
        <li>Total interest may be higher</li>
        <li>Risk of payment shock when payments increase</li>
      </ul>

      <hr />

      <h2 id="gpm-strategies" className="text-2xl font-bold text-foreground pt-8" itemProp="articleSection">GPM Strategies</h2>
      <p>Successful GPM management requires careful planning and strategy:</p>
      
      <h3 className="text-xl font-semibold text-foreground mt-6">Planning Strategies</h3>
      <ul className="list-disc ml-6 space-y-2">
        <li>Plan for payment increases well in advance</li>
        <li>Build up savings to cover higher payments</li>
        <li>Consider refinancing before payments increase</li>
        <li>Monitor your income growth and financial situation</li>
      </ul>
      
      <h3 className="text-xl font-semibold text-foreground mt-6">Payment Strategies</h3>
      <ul className="list-disc ml-6 space-y-2">
        <li>Make extra payments during low-payment years</li>
        <li>Consider refinancing to a traditional loan</li>
        <li>Plan for selling the property if needed</li>
        <li>Have backup financing options ready</li>
      </ul>
      
      <h3 className="text-xl font-semibold text-foreground mt-6">Risk Management</h3>
      <ul className="list-disc ml-6 space-y-2">
        <li>Monitor your financial situation regularly</li>
        <li>Plan for multiple payment scenarios</li>
        <li>Consider your long-term financial goals</li>
        <li>Have contingency plans ready</li>
      </ul>

      <hr />

      <h2 id="faq" className="text-2xl font-bold text-foreground pt-8" itemProp="articleSection">GPM FAQs</h2>
      
      <h3 className="text-xl font-semibold text-foreground mt-6">What happens if I can't afford the graduated payment?</h3>
      <p>If you can't afford the graduated payment, you'll need to refinance, sell the property, or default on the loan. Defaulting can result in foreclosure and damage to your credit score.</p>
      
      <h3 className="text-xl font-semibold text-foreground mt-6">Can I refinance a GPM loan?</h3>
      <p>Yes, you can refinance a GPM loan, but you'll need to qualify for a new loan. This depends on your credit score, income, and the value of the property at the time of refinancing.</p>
      
      <h3 className="text-xl font-semibold text-foreground mt-6">Are GPM loans good for first-time homebuyers?</h3>
      <p>GPM loans can be good for first-time homebuyers who expect their income to increase over time. However, they require careful planning and risk management.</p>
      
      <h3 className="text-xl font-semibold text-foreground mt-6">How much should I plan for payment increases?</h3>
      <p>You should plan for payment increases based on the graduation rate and your expected income growth. Consider your ability to make higher payments and have backup plans ready.</p>

      <div className="text-sm italic text-center mt-8 pt-4 border-t border-gray-200">
        <p>This tool is provided by mycalculating.com. Always consult with a financial advisor before making major financial decisions.</p>
      </div>
    </section>
  );
}

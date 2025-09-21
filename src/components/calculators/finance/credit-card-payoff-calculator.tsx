
'use client';

import { useState } from 'react';
import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import { z } from 'zod';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Form, FormControl, FormField, FormItem, FormLabel, FormMessage } from '@/components/ui/form';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { CreditCard } from 'lucide-react';
import { Accordion, AccordionContent, AccordionItem, AccordionTrigger } from '@/components/ui/accordion';

const formSchema = z.object({
  balance: z.number().positive(),
  apr: z.number().positive(),
  monthlyPayment: z.number().positive(),
}).refine(data => {
    const monthlyInterest = (data.apr / 100 / 12) * data.balance;
    return data.monthlyPayment > monthlyInterest;
}, {
    message: "Monthly payment must be greater than the interest to pay off the balance.",
    path: ["monthlyPayment"],
});

type FormValues = z.infer<typeof formSchema>;

interface CalculationResult {
  monthsToPayOff: number;
  totalInterest: number;
  totalPaid: number;
}

export default function CreditCardPayoffCalculator() {
  const [result, setResult] = useState<CalculationResult | null>(null);

  const form = useForm<FormValues>({
    resolver: zodResolver(formSchema),
    defaultValues: {
      balance: undefined,
      apr: undefined,
      monthlyPayment: undefined,
    },
  });

  const onSubmit = (values: FormValues) => {
    const { balance, apr, monthlyPayment } = values;
    const B = balance;
    const r = apr / 100 / 12; // monthly interest rate
    const M = monthlyPayment;

    // Formula: n = -log(1 - (r * B) / M) / log(1 + r)
    const n = -Math.log(1 - (r * B) / M) / Math.log(1 + r);
    const months = Math.ceil(n);
    const totalPaid = M * months;
    const totalInterest = totalPaid - B;
    
    setResult({ monthsToPayOff: months, totalInterest, totalPaid });
  };

  const formatMonths = (months: number) => {
      const years = Math.floor(months / 12);
      const remainingMonths = months % 12;
      let result = '';
      if (years > 0) {
          result += `${years} year${years > 1 ? 's' : ''}`;
      }
      if (remainingMonths > 0) {
          result += `${years > 0 ? ' and ' : ''}${remainingMonths} month${remainingMonths > 1 ? 's' : ''}`;
      }
      return result;
  }

  return (
    <div className="space-y-8">
      <Form {...form}>
        <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-6">
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <FormField control={form.control} name="balance" render={({ field }) => (
                <FormItem><FormLabel>Credit Card Balance</FormLabel><FormControl><Input type="number" {...field} value={field.value ?? ''} onChange={e => field.onChange(parseFloat(e.target.value) || undefined)} /></FormControl><FormMessage /></FormItem>
            )} />
            <FormField control={form.control} name="apr" render={({ field }) => (
                <FormItem><FormLabel>Annual Interest Rate (APR) (%)</FormLabel><FormControl><Input type="number" {...field} value={field.value ?? ''} onChange={e => field.onChange(parseFloat(e.target.value) || undefined)} /></FormControl><FormMessage /></FormItem>
            )} />
            <FormField control={form.control} name="monthlyPayment" render={({ field }) => (
                <FormItem className="md:col-span-2"><FormLabel>Monthly Payment</FormLabel><FormControl><Input type="number" {...field} value={field.value ?? ''} onChange={e => field.onChange(parseFloat(e.target.value) || undefined)} /></FormControl><FormMessage /></FormItem>
            )} />
          </div>
          <Button type="submit">Calculate Payoff</Button>
        </form>
      </Form>
      {result && (
        <Card className="mt-8">
            <CardHeader><div className='flex items-center gap-4'><CreditCard className="h-8 w-8 text-primary" /><CardTitle>Debt Payoff Plan</CardTitle></div></CardHeader>
            <CardContent>
                <div className="text-center space-y-4">
                    <div>
                        <CardDescription>Time to Pay Off</CardDescription>
                        <p className="text-3xl font-bold">{formatMonths(result.monthsToPayOff)}</p>
                    </div>
                    <div className="grid grid-cols-2 gap-4 pt-4 border-t">
                        <div>
                            <CardDescription>Total Interest Paid</CardDescription>
                            <p className="text-xl font-semibold">${result.totalInterest.toLocaleString(undefined, { maximumFractionDigits: 2 })}</p>
                        </div>
                        <div>
                            <CardDescription>Total Amount Paid</CardDescription>
                            <p className="text-xl font-semibold">${result.totalPaid.toLocaleString(undefined, { maximumFractionDigits: 2 })}</p>
                        </div>
                    </div>
                </div>
            </CardContent>
        </Card>
      )}
       <Accordion type="single" collapsible className="w-full">
        <AccordionItem value="how-it-works">
            <AccordionTrigger>How The Calculation Works</AccordionTrigger>
            <AccordionContent className="text-muted-foreground space-y-2">
                <p>This calculator determines how many months it will take to pay off a credit card balance using a logarithmic formula derived from the standard loan amortization equation. It solves for the number of payment periods (`n`).</p>
                <ul className="list-disc list-inside space-y-1">
                    <li>It calculates the number of months required to bring the balance to zero based on your fixed monthly payment and APR.</li>
                    <li>The result is rounded up to the next whole month.</li>
                    <li>The total amount paid is your monthly payment multiplied by the number of months.</li>
                    <li>The total interest is the total amount paid minus the original balance.</li>
                </ul>
            </AccordionContent>
        </AccordionItem>
        <AccordionItem value="further-reading">
            <AccordionTrigger>Further Reading</AccordionTrigger>
            <AccordionContent className="text-muted-foreground space-y-2">
              <p>For more information on managing credit card debt, consult these reliable sources:</p>
               <ul className="list-disc list-inside space-y-1 pl-4">
                  <li><a href="https://www.experian.com/blogs/ask-experian/credit-education/paying-down-credit-card-debt/" target="_blank" rel="noopener noreferrer" className="text-primary underline">Experian: Credit Card Payoff Strategies</a></li>
                  <li><a href="https://www.consumerfinance.gov/consumer-tools/credit-cards/credit-card-payoff-calculator/" target="_blank" rel="noopener noreferrer" className="text-primary underline">CFPB: Credit Card Payoff Calculator</a></li>
              </ul>
            </AccordionContent>
        </AccordionItem>
      </Accordion>
    </div>
  );
}

    
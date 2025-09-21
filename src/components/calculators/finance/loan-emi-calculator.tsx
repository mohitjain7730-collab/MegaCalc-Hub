
'use client';

import { useState } from 'react';
import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import { z } from 'zod';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Form, FormControl, FormField, FormItem, FormLabel, FormMessage } from '@/components/ui/form';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { HandCoins } from 'lucide-react';
import { Accordion, AccordionContent, AccordionItem, AccordionTrigger } from '@/components/ui/accordion';
import { LineChart, Line, XAxis, YAxis, CartesianGrid, Tooltip, Legend, ResponsiveContainer } from 'recharts';

const formSchema = z.object({
  loanAmount: z.number().positive(),
  annualInterestRate: z.number().positive(),
  loanTenureYears: z.number().positive(),
});

type FormValues = z.infer<typeof formSchema>;

interface CalculationResult {
  emi: number;
  totalPayment: number;
  totalInterest: number;
  chartData: { year: number; remainingBalance: number; totalInterestPaid: number }[];
}

export default function LoanEmiCalculator() {
  const [result, setResult] = useState<CalculationResult | null>(null);

  const form = useForm<FormValues>({
    resolver: zodResolver(formSchema),
    defaultValues: {
      loanAmount: undefined,
      annualInterestRate: undefined,
      loanTenureYears: undefined,
    },
  });

  const onSubmit = (values: FormValues) => {
    const { loanAmount, annualInterestRate, loanTenureYears } = values;
    const P = loanAmount;
    const r = annualInterestRate / 12 / 100;
    const n = loanTenureYears * 12;

    if (r === 0) {
        const emi = P / n;
        const totalPayment = P;
        const totalInterest = 0;
        const chartData = Array.from({ length: loanTenureYears }, (_, i) => {
            const year = i + 1;
            const balance = P - emi * year * 12;
            return {
                year,
                remainingBalance: Math.max(0, balance),
                totalInterestPaid: 0,
            };
        });
        setResult({ emi, totalPayment, totalInterest, chartData });
        return;
    }

    const emi = (P * r * Math.pow(1 + r, n)) / (Math.pow(1 + r, n) - 1);
    const totalPayment = emi * n;
    const totalInterest = totalPayment - P;

    const chartData = [];
    let remainingBalance = P;
    let cumulativeInterest = 0;

    for (let year = 1; year <= loanTenureYears; year++) {
      let yearlyInterest = 0;
      for (let month = 1; month <= 12; month++) {
        const interestPayment = remainingBalance * r;
        const principalPayment = emi - interestPayment;
        yearlyInterest += interestPayment;
        remainingBalance -= principalPayment;
      }
      cumulativeInterest += yearlyInterest;
      chartData.push({
        year: year,
        remainingBalance: Math.max(0, remainingBalance), // Ensure balance doesn't go negative
        totalInterestPaid: Math.round(cumulativeInterest),
      });
    }
    
    setResult({ emi, totalPayment, totalInterest, chartData });
  };

  return (
    <div className="space-y-8">
      <Form {...form}>
        <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-6">
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <FormField control={form.control} name="loanAmount" render={({ field }) => (
                <FormItem><FormLabel>Loan Amount</FormLabel><FormControl><Input type="number" {...field} value={field.value ?? ''} onChange={e => field.onChange(parseFloat(e.target.value) || undefined)} /></FormControl><FormMessage /></FormItem>
            )} />
            <FormField control={form.control} name="annualInterestRate" render={({ field }) => (
                <FormItem><FormLabel>Annual Interest Rate (%)</FormLabel><FormControl><Input type="number" {...field} value={field.value ?? ''} onChange={e => field.onChange(parseFloat(e.target.value) || undefined)} /></FormControl><FormMessage /></FormItem>
            )} />
            <FormField control={form.control} name="loanTenureYears" render={({ field }) => (
                <FormItem className="md:col-span-2"><FormLabel>Loan Tenure (Years)</FormLabel><FormControl><Input type="number" {...field} value={field.value ?? ''} onChange={e => field.onChange(parseFloat(e.target.value) || undefined)} /></FormControl><FormMessage /></FormItem>
            )} />
          </div>
          <Button type="submit">Calculate EMI</Button>
        </form>
      </Form>
      {result && (
        <Card className="mt-8">
            <CardHeader><div className='flex items-center gap-4'><HandCoins className="h-8 w-8 text-primary" /><CardTitle>Loan Repayment Details</CardTitle></div></CardHeader>
            <CardContent>
                <div className="text-center space-y-4">
                    <div>
                        <CardDescription>Monthly EMI</CardDescription>
                        <p className="text-3xl font-bold">${result.emi.toLocaleString(undefined, { maximumFractionDigits: 2 })}</p>
                    </div>
                    <div className="grid grid-cols-2 gap-4 pt-4 border-t">
                        <div>
                            <CardDescription>Total Payment</CardDescription>
                            <p className="text-xl font-semibold">${result.totalPayment.toLocaleString(undefined, { maximumFractionDigits: 2 })}</p>
                        </div>
                        <div>
                            <CardDescription>Total Interest Paid</CardDescription>
                            <p className="text-xl font-semibold">${result.totalInterest.toLocaleString(undefined, { maximumFractionDigits: 2 })}</p>
                        </div>
                    </div>
                </div>
                 <div className="mt-8 h-80">
                  <ResponsiveContainer width="100%" height="100%">
                    <LineChart data={result.chartData} margin={{ top: 5, right: 20, left: 20, bottom: 5 }}>
                      <CartesianGrid strokeDasharray="3 3" />
                      <XAxis dataKey="year" unit="yr" />
                      <YAxis tickFormatter={(value) => `$${(value/1000)}k`} />
                      <Tooltip formatter={(value: number) => `$${value.toLocaleString()}`} />
                      <Legend />
                      <Line type="monotone" dataKey="totalInterestPaid" name="Total Interest Paid" stroke="hsl(var(--muted-foreground))" activeDot={{ r: 8 }} />
                      <Line type="monotone" dataKey="remainingBalance" name="Remaining Balance" stroke="hsl(var(--primary))" />
                    </LineChart>
                  </ResponsiveContainer>
                </div>
            </CardContent>
        </Card>
      )}
       <Accordion type="single" collapsible className="w-full">
        <AccordionItem value="what-is-emi">
          <AccordionTrigger>What is an EMI?</AccordionTrigger>
          <AccordionContent className="text-muted-foreground space-y-2">
            <p>An Equated Monthly Installment (EMI) is a fixed payment amount made by a borrower to a lender at a specified date each calendar month. EMIs are used to pay off both interest and principal each month so that over a specified number of years, the loan is paid off in full.</p>
          </AccordionContent>
        </AccordionItem>
        <AccordionItem value="understanding-loan">
          <AccordionTrigger>Understanding Your Loan</AccordionTrigger>
          <AccordionContent className="text-muted-foreground space-y-2">
             <ul className="list-disc list-inside space-y-1 pl-4">
                <li><strong>Principal (Loan Amount):</strong> The initial amount of money you borrow from the lender.</li>
                <li><strong>Interest Rate:</strong> The percentage of the principal charged by the lender for the use of its money.</li>
                <li><strong>Tenure:</strong> The total time period over which you will repay the loan. A longer tenure means lower EMIs but higher total interest paid, while a shorter tenure means higher EMIs but lower total interest.</li>
            </ul>
            <p className="mt-2 font-semibold">In the initial years of your loan, a larger portion of your EMI goes towards paying off the interest. As the loan matures, a larger portion goes towards paying off the principal.</p>
          </AccordionContent>
        </AccordionItem>
        <AccordionItem value="how-it-works">
            <AccordionTrigger>How The Calculation Works</AccordionTrigger>
            <AccordionContent className="text-muted-foreground space-y-2">
                <p>This calculator uses the standard formula for an Equated Monthly Installment (EMI) to determine your fixed monthly payment. The formula accounts for the loan principal, the monthly interest rate (annual rate divided by 12), and the total number of payments (tenure in years multiplied by 12).</p>
            </AccordionContent>
        </AccordionItem>
        <AccordionItem value="further-reading">
            <AccordionTrigger>Further Reading</AccordionTrigger>
            <AccordionContent className="text-muted-foreground space-y-2">
              <p>To learn more about EMIs and loan amortization, you can visit these credible resources:</p>
               <ul className="list-disc list-inside space-y-1 pl-4">
                  <li><a href="https://www.investopedia.com/terms/e/emi.asp" target="_blank" rel="noopener noreferrer" className="text-primary underline">Investopedia: Equated Monthly Installment (EMI)</a></li>
                  <li><a href="https://www.consumerfinance.gov/owning-a-home/loan-options/" target="_blank" rel="noopener noreferrer" className="text-primary underline">Consumer Financial Protection Bureau: Loan Options</a></li>
              </ul>
            </AccordionContent>
        </AccordionItem>
      </Accordion>
    </div>
  );
}

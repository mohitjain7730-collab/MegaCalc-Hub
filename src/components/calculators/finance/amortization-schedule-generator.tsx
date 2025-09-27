
'use client';

import { useState } from 'react';
import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import { z } from 'zod';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Form, FormControl, FormField, FormItem, FormLabel, FormMessage } from '@/components/ui/form';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { CalendarDays } from 'lucide-react';
import { Accordion, AccordionContent, AccordionItem, AccordionTrigger } from '@/components/ui/accordion';
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from '@/components/ui/table';

const formSchema = z.object({
  loanAmount: z.number().positive(),
  annualRate: z.number().positive(),
  loanTerm: z.number().int().positive(),
  paymentsPerYear: z.number().int().positive(),
});

type FormValues = z.infer<typeof formSchema>;
type ScheduleItem = { paymentNumber: number; payment: number; principal: number; interest: number; balance: number };

export default function AmortizationScheduleGenerator() {
  const [schedule, setSchedule] = useState<ScheduleItem[] | null>(null);

  const form = useForm<FormValues>({
    resolver: zodResolver(formSchema),
    defaultValues: {
      loanAmount: undefined,
      annualRate: undefined,
      loanTerm: undefined,
      paymentsPerYear: undefined,
    },
  });

  const onSubmit = (values: FormValues) => {
    const { loanAmount, annualRate, loanTerm, paymentsPerYear } = values;
    const r = (annualRate / 100) / paymentsPerYear;
    const n = loanTerm * paymentsPerYear;
    const M = loanAmount * (r * Math.pow(1 + r, n)) / (Math.pow(1 + r, n) - 1);
    
    let balance = loanAmount;
    const newSchedule: ScheduleItem[] = [];

    for (let i = 1; i <= n; i++) {
      const interest = balance * r;
      const principal = M - interest;
      balance -= principal;
      newSchedule.push({ paymentNumber: i, payment: M, principal, interest, balance });
    }
    setSchedule(newSchedule);
  };

  return (
    <div className="space-y-8">
      <Form {...form}>
        <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-6">
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <FormField control={form.control} name="loanAmount" render={({ field }) => (<FormItem><FormLabel>Loan Amount ($)</FormLabel><FormControl><Input type="number" {...field} value={field.value ?? ''} onChange={e => field.onChange(parseFloat(e.target.value) || undefined)} /></FormControl></FormItem>)} />
            <FormField control={form.control} name="annualRate" render={({ field }) => (<FormItem><FormLabel>Annual Rate (%)</FormLabel><FormControl><Input type="number" {...field} value={field.value ?? ''} onChange={e => field.onChange(parseFloat(e.target.value) || undefined)} /></FormControl></FormItem>)} />
            <FormField control={form.control} name="loanTerm" render={({ field }) => (<FormItem><FormLabel>Loan Term (Years)</FormLabel><FormControl><Input type="number" {...field} value={field.value ?? ''} onChange={e => field.onChange(parseInt(e.target.value) || undefined)} /></FormControl></FormItem>)} />
            <FormField control={form.control} name="paymentsPerYear" render={({ field }) => (<FormItem><FormLabel>Payments per Year</FormLabel><FormControl><Input type="number" {...field} value={field.value ?? ''} onChange={e => field.onChange(parseInt(e.target.value) || undefined)} /></FormControl></FormItem>)} />
          </div>
          <Button type="submit">Generate Schedule</Button>
        </form>
      </Form>
      {schedule && (
        <Card className="mt-8">
          <CardHeader><div className='flex items-center gap-4'><CalendarDays className="h-8 w-8 text-primary" /><CardTitle>Amortization Schedule</CardTitle></div></CardHeader>
          <CardContent>
            <Table>
              <TableHeader><TableRow><TableHead>Pmt #</TableHead><TableHead>Payment</TableHead><TableHead>Principal</TableHead><TableHead>Interest</TableHead><TableHead>Balance</TableHead></TableRow></TableHeader>
              <TableBody>
                {schedule.map(item => (
                  <TableRow key={item.paymentNumber}>
                    <TableCell>{item.paymentNumber}</TableCell>
                    <TableCell>${item.payment.toFixed(2)}</TableCell>
                    <TableCell>${item.principal.toFixed(2)}</TableCell>
                    <TableCell>${item.interest.toFixed(2)}</TableCell>
                    <TableCell>${item.balance.toFixed(2)}</TableCell>
                  </TableRow>
                ))}
              </TableBody>
            </Table>
          </CardContent>
        </Card>
      )}
      <Accordion type="single" collapsible className="w-full">
        <AccordionItem value="understanding-inputs">
            <AccordionTrigger>Understanding the Inputs</AccordionTrigger>
            <AccordionContent className="text-muted-foreground space-y-4">
                <div>
                    <h4 className="font-semibold text-foreground mb-1">Principal Loan Amount</h4>
                    <p>The total amount borrowed.</p>
                </div>
                <div>
                    <h4 className="font-semibold text-foreground mb-1">Annual Interest Rate</h4>
                    <p>The nominal yearly interest rate for the loan.</p>
                </div>
                 <div>
                    <h4 className="font-semibold text-foreground mb-1">Loan Term & Payments per Year</h4>
                    <p>The total duration of the loan and how frequently payments are made (e.g., 12 for monthly).</p>
                </div>
            </AccordionContent>
        </AccordionItem>
        <AccordionItem value="how-it-works">
          <AccordionTrigger>How An Amortization Schedule Works</AccordionTrigger>
          <AccordionContent className="text-muted-foreground space-y-2">
            <p>An amortization schedule details each payment of a loan over its lifetime. It provides a clear picture of how your debt is paid down over time.</p>
            <ol className='list-decimal list-inside space-y-2 mt-2'>
              <li><strong>Calculate Periodic Payment (M):</strong> First, it calculates the fixed payment amount for each period using the loan details.</li>
              <li><strong>Generate Schedule:</strong> It then iterates through each payment period. For each payment, it calculates how much goes toward interest (based on the current loan balance) and how much goes toward reducing the principal. In early payments, a larger portion covers interest; this gradually shifts toward principal over the life of the loan.</li>
            </ol>
            </AccordionContent>
        </AccordionItem>
      </Accordion>
    </div>
  );
}


'use client';

import { useState } from 'react';
import { useForm, useFieldArray } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import { z } from 'zod';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Form, FormControl, FormField, FormItem, FormLabel, FormMessage } from '@/components/ui/form';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { LineChart, Line, XAxis, YAxis, CartesianGrid, Tooltip, Legend, ResponsiveContainer } from 'recharts';
import { PlusCircle, XCircle, Handshake } from 'lucide-react';
import { Accordion, AccordionContent, AccordionItem, AccordionTrigger } from '@/components/ui/accordion';

const rateChangeSchema = z.object({
  year: z.number().int().positive(),
  rate: z.number(),
});

const formSchema = z.object({
  principal: z.number().positive(),
  term: z.number().int().positive(),
  fixedRate: z.number().positive(),
  initialFloatingRate: z.number().positive(),
  rateChanges: z.array(rateChangeSchema),
});

type FormValues = z.infer<typeof formSchema>;

interface Result {
    fixed: { totalInterest: number, monthlyPayment: number },
    floating: { totalInterest: number },
    chartData: { year: number, fixedInterest: number, floatingInterest: number }[]
}

export default function FixedVsFloatingRateCalculator() {
  const [result, setResult] = useState<Result | null>(null);

  const form = useForm<FormValues>({
    resolver: zodResolver(formSchema),
    defaultValues: {
      principal: undefined,
      term: undefined,
      fixedRate: undefined,
      initialFloatingRate: undefined,
      rateChanges: [{ year: undefined, rate: undefined }],
    },
  });

  const { fields, append, remove } = useFieldArray({
    control: form.control,
    name: "rateChanges",
  });

  const calculateAmortization = (
      principal: number,
      termYears: number,
      initialRate: number,
      rateChanges: { year?: number; rate?: number }[] = []
  ) => {
      const n = termYears * 12;
      let balance = principal;
      let totalInterest = 0;
      let monthlyPayment = 0;
      const interestPaidByYear: number[] = Array(termYears).fill(0);
      
      let currentRate = initialRate / 100 / 12;

      for (let i = 0; i < n; i++) {
          const year = Math.floor(i / 12) + 1;
          const rateChange = rateChanges.find(rc => rc.year === year);
          if (rateChange && rateChange.rate !== undefined && i % 12 === 0) {
              currentRate = rateChange.rate / 100 / 12;
          }
          
          if(i === 0 || (rateChange && rateChange.rate !== undefined && i % 12 === 0)) {
            const remainingPeriods = n - i;
            if (currentRate > 0) {
                monthlyPayment = balance * (currentRate * Math.pow(1 + currentRate, remainingPeriods)) / (Math.pow(1 + currentRate, remainingPeriods) - 1);
            } else {
                monthlyPayment = balance / remainingPeriods;
            }
          }

          const interest = balance * currentRate;
          const principalPaid = monthlyPayment - interest;
          balance -= principalPaid;
          totalInterest += interest;
          interestPaidByYear[year - 1] += interest;
      }
      
      return { totalInterest, monthlyPayment, interestPaidByYear };
  };

  const onSubmit = (values: FormValues) => {
    const validRateChanges = values.rateChanges.filter(rc => rc.year && rc.rate !== undefined) as { year: number; rate: number }[];
    const fixedRateData = calculateAmortization(values.principal, values.term, values.fixedRate);
    const floatingRateData = calculateAmortization(values.principal, values.term, values.initialFloatingRate, validRateChanges);

    const chartData = Array.from({ length: values.term }, (_, i) => ({
        year: i + 1,
        fixedInterest: parseFloat(fixedRateData.interestPaidByYear.slice(0, i + 1).reduce((a, b) => a + b, 0).toFixed(0)),
        floatingInterest: parseFloat(floatingRateData.interestPaidByYear.slice(0, i + 1).reduce((a, b) => a + b, 0).toFixed(0)),
    }));

    setResult({
        fixed: { totalInterest: fixedRateData.totalInterest, monthlyPayment: fixedRateData.monthlyPayment },
        floating: { totalInterest: floatingRateData.totalInterest },
        chartData
    });
  };

  return (
    <div className="space-y-8">
      <Form {...form}>
        <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-6">
            <Card>
                <CardHeader><CardTitle>Loan Details</CardTitle></CardHeader>
                <CardContent className="grid grid-cols-1 md:grid-cols-2 gap-4">
                    <FormField control={form.control} name="principal" render={({ field }) => ( <FormItem><FormLabel>Loan Principal ($)</FormLabel><FormControl><Input type="number" {...field} value={field.value ?? ''} onChange={e => field.onChange(parseFloat(e.target.value) || undefined)} /></FormControl><FormMessage /></FormItem> )} />
                    <FormField control={form.control} name="term" render={({ field }) => ( <FormItem><FormLabel>Loan Term (Years)</FormLabel><FormControl><Input type="number" {...field} value={field.value ?? ''} onChange={e => field.onChange(parseInt(e.target.value) || undefined)} /></FormControl><FormMessage /></FormItem> )} />
                </CardContent>
            </Card>
            <div className="grid grid-cols-1 lg:grid-cols-2 gap-4">
                <Card>
                    <CardHeader><CardTitle>Fixed Rate</CardTitle></CardHeader>
                    <CardContent>
                         <FormField control={form.control} name="fixedRate" render={({ field }) => ( <FormItem><FormLabel>Annual Interest Rate (%)</FormLabel><FormControl><Input type="number" {...field} value={field.value ?? ''} onChange={e => field.onChange(parseFloat(e.target.value) || undefined)} /></FormControl><FormMessage /></FormItem> )} />
                    </CardContent>
                </Card>
                <Card>
                    <CardHeader><CardTitle>Floating Rate</CardTitle></CardHeader>
                    <CardContent className="space-y-4">
                        <FormField control={form.control} name="initialFloatingRate" render={({ field }) => ( <FormItem><FormLabel>Initial Annual Rate (%)</FormLabel><FormControl><Input type="number" {...field} value={field.value ?? ''} onChange={e => field.onChange(parseFloat(e.target.value) || undefined)} /></FormControl><FormMessage /></FormItem> )} />
                        <div>
                            <FormLabel>Projected Rate Changes</FormLabel>
                            {fields.map((field, index) => (
                                <div key={field.id} className="flex gap-2 items-center mt-2">
                                     <FormField control={form.control} name={`rateChanges.${index}.year`} render={({ field }) => ( <FormItem className="flex-1"><FormLabel className="text-xs">In Year</FormLabel><FormControl><Input type="number" {...field} value={field.value ?? ''} onChange={e => field.onChange(parseInt(e.target.value) || undefined)} /></FormControl></FormItem> )} />
                                     <FormField control={form.control} name={`rateChanges.${index}.rate`} render={({ field }) => ( <FormItem className="flex-1"><FormLabel className="text-xs">New Rate (%)</FormLabel><FormControl><Input type="number" {...field} value={field.value ?? ''} onChange={e => field.onChange(parseFloat(e.target.value) || undefined)} /></FormControl></FormItem> )} />
                                     <Button type="button" variant="ghost" size="icon" onClick={() => remove(index)} className="self-end"><XCircle className="h-5 w-5 text-destructive" /></Button>
                                </div>
                            ))}
                            <Button type="button" variant="outline" size="sm" className="mt-2" onClick={() => append({ year: undefined, rate: undefined })}><PlusCircle className="mr-2 h-4 w-4" /> Add Change</Button>
                        </div>
                    </CardContent>
                </Card>
            </div>
            <Button type="submit" className="w-full">Compare Scenarios</Button>
        </form>
      </Form>

      {result && (
        <Card className="mt-8">
          <CardHeader><div className='flex items-center gap-4'><Handshake className="h-8 w-8 text-primary" /><CardTitle>Comparison Result</CardTitle></div></CardHeader>
          <CardContent>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4 text-center">
                <div className="p-4 bg-muted rounded-lg">
                    <p className="font-bold text-lg">Fixed Rate Scenario</p>
                    <p className="text-sm">Initial Monthly Payment: <span className="font-semibold">${result.fixed.monthlyPayment.toFixed(2)}</span></p>
                    <p className="text-sm mt-2">Total Interest Paid: <span className="font-semibold">${result.fixed.totalInterest.toFixed(2)}</span></p>
                </div>
                <div className="p-4 bg-muted rounded-lg">
                    <p className="font-bold text-lg">Floating Rate Scenario</p>
                    <p className="text-sm">Total Interest Paid: <span className="font-semibold">${result.floating.totalInterest.toFixed(2)}</span></p>
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
                        <Line type="monotone" name="Fixed Rate Interest" dataKey="fixedInterest" stroke="hsl(var(--muted-foreground))" strokeWidth={2} />
                        <Line type="monotone" name="Floating Rate Interest" dataKey="floatingInterest" stroke="hsl(var(--primary))" strokeWidth={2} />
                    </LineChart>
                </ResponsiveContainer>
            </div>
          </CardContent>
        </Card>
      )}
      <Accordion type="single" collapsible className="w-full">
        <AccordionItem value="how-it-works">
            <AccordionTrigger>How It Works</AccordionTrigger>
            <AccordionContent className="text-muted-foreground space-y-2">
                <p>This calculator runs two separate loan amortization simulations based on your inputs.</p>
                <ul className="list-disc list-inside space-y-2 mt-2">
                  <li><strong>Fixed Rate:</strong> It calculates a standard amortization schedule with one constant interest rate to find the total interest paid over the loan term.</li>
                  <li><strong>Floating Rate:</strong> It simulates an adjustable-rate loan. For each year you specify a rate change, the calculator adjusts the interest rate and recalculates the monthly payment for the remaining balance. It then sums up the interest paid across all periods to find the total.</li>
                </ul>
                <p className="mt-2">This allows you to compare the total cost of borrowing under the stability of a fixed rate versus the uncertainty and potential volatility of a floating rate.</p>
            </AccordionContent>
        </AccordionItem>
      </Accordion>
    </div>
  );
}

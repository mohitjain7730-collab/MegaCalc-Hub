
'use client';

import { useState } from 'react';
import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import { z } from 'zod';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Form, FormControl, FormField, FormItem, FormLabel, FormMessage } from '@/components/ui/form';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Landmark } from 'lucide-react';
import { Accordion, AccordionContent, AccordionItem, AccordionTrigger } from '@/components/ui/accordion';
import { RadioGroup, RadioGroupItem } from '@/components/ui/radio-group';

const formSchema = z.object({
  value: z.number().positive(),
  rate: z.number().positive(),
  periods: z.number().int().positive(),
  valueType: z.enum(['pv', 'fv']),
});

type FormValues = z.infer<typeof formSchema>;

export default function AnnuityPaymentCalculator() {
  const [result, setResult] = useState<number | null>(null);

  const form = useForm<FormValues>({
    resolver: zodResolver(formSchema),
    defaultValues: {
      value: undefined,
      rate: undefined,
      periods: undefined,
      valueType: 'pv',
    },
  });

  const onSubmit = (values: FormValues) => {
    const { value, rate, periods, valueType } = values;
    const r = rate / 100;
    let pmt;

    if (valueType === 'pv') {
      // PMT = PV * [r / (1 - (1 + r)^-n)]
      pmt = value * (r / (1 - Math.pow(1 + r, -periods)));
    } else {
      // PMT = FV * [r / ((1 + r)^n - 1)]
      pmt = value * (r / (Math.pow(1 + r, periods) - 1));
    }
    
    setResult(pmt);
  };
  
  const valueType = form.watch('valueType');

  return (
    <div className="space-y-8">
      <Form {...form}>
        <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-6">
          <FormField control={form.control} name="valueType" render={({ field }) => (
            <FormItem className="space-y-3">
              <FormLabel>Calculate Payment based on:</FormLabel>
              <FormControl>
                <RadioGroup onValueChange={field.onChange} defaultValue={field.value} className="flex space-x-4">
                  <FormItem className="flex items-center space-x-2"><FormControl><RadioGroupItem value="pv" /></FormControl><FormLabel className="font-normal">Loan Amount (Present Value)</FormLabel></FormItem>
                  <FormItem className="flex items-center space-x-2"><FormControl><RadioGroupItem value="fv" /></FormControl><FormLabel className="font-normal">Savings Goal (Future Value)</FormLabel></FormItem>
                </RadioGroup>
              </FormControl>
            </FormItem>
          )} />
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <FormField control={form.control} name="value" render={({ field }) => (
                <FormItem><FormLabel>{valueType === 'pv' ? 'Present Value (PV)' : 'Future Value (FV)'} in USD</FormLabel><FormControl><Input type="number" {...field} value={field.value ?? ''} onChange={e => field.onChange(parseFloat(e.target.value) || undefined)} /></FormControl><FormMessage /></FormItem>
            )} />
            <FormField control={form.control} name="rate" render={({ field }) => (
                <FormItem><FormLabel>Interest Rate per Period (%)</FormLabel><FormControl><Input type="number" {...field} value={field.value ?? ''} onChange={e => field.onChange(parseFloat(e.target.value) || undefined)} /></FormControl><FormMessage /></FormItem>
            )} />
            <FormField control={form.control} name="periods" render={({ field }) => (
                <FormItem><FormLabel>Number of Periods (n)</FormLabel><FormControl><Input type="number" {...field} value={field.value ?? ''} onChange={e => field.onChange(parseInt(e.target.value) || undefined)} /></FormControl><FormMessage /></FormItem>
            )} />
          </div>
          <Button type="submit">Calculate Payment</Button>
        </form>
      </Form>
      {result !== null && (
        <Card className="mt-8">
            <CardHeader><div className='flex items-center gap-4'><Landmark className="h-8 w-8 text-primary" /><CardTitle>Periodic Payment (PMT)</CardTitle></div></CardHeader>
            <CardContent>
                <p className="text-3xl font-bold text-center">${result.toLocaleString(undefined, { maximumFractionDigits: 2 })}</p>
                <CardDescription className='mt-4 text-center'>This is the regular payment required each period.</CardDescription>
            </CardContent>
        </Card>
      )}
       <Accordion type="single" collapsible className="w-full">
        <AccordionItem value="how-it-works">
            <AccordionTrigger>How It Works</AccordionTrigger>
            <AccordionContent className="text-muted-foreground space-y-2">
                <p>An annuity is a series of equal payments made at regular intervals. This calculator finds the payment amount (PMT) for an ordinary annuity, where payments are made at the end of each period.</p>
                <p>If you're solving for a loan (based on its Present Value), it calculates the payment needed to amortize the loan over the periods. If you're solving for a savings goal (based on its Future Value), it calculates the payment you must invest each period to reach that goal.</p>
            </AccordionContent>
        </AccordionItem>
        <AccordionItem value="further-reading">
            <AccordionTrigger>Further Reading</AccordionTrigger>
            <AccordionContent className="text-muted-foreground">
                 <a href="https://www.finra.org/investors/learn-to-invest/types-investments/annuities" target="_blank" rel="noopener noreferrer" className="text-primary underline">FINRA – Annuities: Understanding Your Options</a>
            </AccordionContent>
        </AccordionItem>
      </Accordion>
    </div>
  );
}

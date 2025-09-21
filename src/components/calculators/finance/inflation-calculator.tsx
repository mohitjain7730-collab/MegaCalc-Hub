
'use client';

import { useState } from 'react';
import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import { z } from 'zod';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Form, FormControl, FormField, FormItem, FormLabel, FormMessage } from '@/components/ui/form';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { TrendingDown } from 'lucide-react';
import { Accordion, AccordionContent, AccordionItem, AccordionTrigger } from '@/components/ui/accordion';

const formSchema = z.object({
  initialAmount: z.number().positive(),
  inflationRate: z.number().positive(),
  years: z.number().int().positive(),
});

type FormValues = z.infer<typeof formSchema>;

export default function InflationCalculator() {
  const [result, setResult] = useState<number | null>(null);

  const form = useForm<FormValues>({
    resolver: zodResolver(formSchema),
    defaultValues: {
      initialAmount: 10000,
      inflationRate: 3,
      years: 10,
    },
  });

  const onSubmit = (values: FormValues) => {
    const { initialAmount, inflationRate, years } = values;
    const i = inflationRate / 100;
    const futureValue = initialAmount / Math.pow(1 + i, years);
    setResult(futureValue);
  };

  return (
    <div className="space-y-8">
      <Form {...form}>
        <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-6">
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <FormField control={form.control} name="initialAmount" render={({ field }) => (
                <FormItem><FormLabel>Initial Amount</FormLabel><FormControl><Input type="number" {...field} value={field.value ?? ''} onChange={e => field.onChange(parseFloat(e.target.value) || undefined)} /></FormControl><FormMessage /></FormItem>
            )} />
            <FormField control={form.control} name="inflationRate" render={({ field }) => (
                <FormItem><FormLabel>Annual Inflation Rate (%)</FormLabel><FormControl><Input type="number" {...field} value={field.value ?? ''} onChange={e => field.onChange(parseFloat(e.target.value) || undefined)} /></FormControl><FormMessage /></FormItem>
            )} />
            <FormField control={form.control} name="years" render={({ field }) => (
                <FormItem className="md:col-span-2"><FormLabel>Number of Years</FormLabel><FormControl><Input type="number" {...field} value={field.value ?? ''} onChange={e => field.onChange(parseInt(e.target.value) || undefined)} /></FormControl><FormMessage /></FormItem>
            )} />
          </div>
          <Button type="submit">Calculate</Button>
        </form>
      </Form>
      {result !== null && (
        <Card className="mt-8">
            <CardHeader><div className='flex items-center gap-4'><TrendingDown className="h-8 w-8 text-primary" /><CardTitle>Future Purchasing Power</CardTitle></div></CardHeader>
            <CardContent>
                <div className="text-center space-y-2">
                    <p className="text-lg">In {form.getValues('years')} years, your ${form.getValues('initialAmount').toLocaleString()} will have the same purchasing power as</p>
                    <p className="text-4xl font-bold">${result.toLocaleString(undefined, { maximumFractionDigits: 2 })}</p>
                    <p className="text-lg">today.</p>
                </div>
            </CardContent>
        </Card>
      )}
       <Accordion type="single" collapsible className="w-full">
        <AccordionItem value="what-is-inflation">
          <AccordionTrigger>What is Inflation?</AccordionTrigger>
          <AccordionContent className="text-muted-foreground">
            <p>Inflation is the rate at which the general level of prices for goods and services is rising, and subsequently, purchasing power of currency is falling. This calculator shows you how the value of your money can decrease over time.</p>
          </AccordionContent>
        </AccordionItem>
        <AccordionItem value="how-it-works">
            <AccordionTrigger>How The Calculation Works</AccordionTrigger>
            <AccordionContent className="text-muted-foreground">
                <p>The calculator uses the formula for present value to determine the future purchasing power of your money. It discounts the initial amount by the annual inflation rate over the number of years specified.</p>
            </AccordionContent>
        </AccordionItem>
        <AccordionItem value="further-reading">
            <AccordionTrigger>Further Reading</AccordionTrigger>
            <AccordionContent className="text-muted-foreground space-y-2">
              <p>For more detailed information on inflation and its impact, consult these authoritative sources:</p>
               <ul className="list-disc list-inside space-y-1 pl-4">
                  <li><a href="https://www.bls.gov/data/inflation_calculator.htm" target="_blank" rel="noopener noreferrer" className="text-primary underline">U.S. Bureau of Labor Statistics: CPI Inflation Calculator</a></li>
                  <li><a href="https://www.investopedia.com/inflation-calculator-5185330" target="_blank" rel="noopener noreferrer" className="text-primary underline">Investopedia: Inflation Calculator</a></li>
              </ul>
            </AccordionContent>
        </AccordionItem>
      </Accordion>
    </div>
  );
}

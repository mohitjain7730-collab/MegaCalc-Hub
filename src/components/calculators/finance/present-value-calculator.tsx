
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

const formSchema = z.object({
  fv: z.number().positive(),
  rate: z.number().positive(),
  years: z.number().positive(),
});

type FormValues = z.infer<typeof formSchema>;

export default function PresentValueCalculator() {
  const [result, setResult] = useState<number | null>(null);

  const form = useForm<FormValues>({
    resolver: zodResolver(formSchema),
    defaultValues: {
      fv: undefined,
      rate: undefined,
      years: undefined,
    },
  });

  const onSubmit = (values: FormValues) => {
    const { fv, rate, years } = values;
    const r = rate / 100;
    const pv = fv / Math.pow(1 + r, years);
    setResult(pv);
  };

  return (
    <div className="space-y-8">
      <Form {...form}>
        <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-6">
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <FormField control={form.control} name="fv" render={({ field }) => (
                <FormItem><FormLabel>Future Value (FV) in USD</FormLabel><FormControl><Input type="number" {...field} value={field.value ?? ''} onChange={e => field.onChange(parseFloat(e.target.value) || undefined)} /></FormControl><FormMessage /></FormItem>
            )} />
            <FormField control={form.control} name="rate" render={({ field }) => (
                <FormItem><FormLabel>Annual Discount Rate (%)</FormLabel><FormControl><Input type="number" {...field} value={field.value ?? ''} onChange={e => field.onChange(parseFloat(e.target.value) || undefined)} /></FormControl><FormMessage /></FormItem>
            )} />
            <FormField control={form.control} name="years" render={({ field }) => (
                <FormItem className="md:col-span-2"><FormLabel>Number of Years (t)</FormLabel><FormControl><Input type="number" {...field} value={field.value ?? ''} onChange={e => field.onChange(parseInt(e.target.value) || undefined)} /></FormControl><FormMessage /></FormItem>
            )} />
          </div>
          <Button type="submit">Calculate PV</Button>
        </form>
      </Form>
      {result !== null && (
        <Card className="mt-8">
            <CardHeader><div className='flex items-center gap-4'><Landmark className="h-8 w-8 text-primary" /><CardTitle>Present Value</CardTitle></div></CardHeader>
            <CardContent>
                <p className="text-3xl font-bold text-center">${result.toLocaleString(undefined, { maximumFractionDigits: 2 })}</p>
                <CardDescription className='mt-4 text-center'>This is the value today of a future sum of money, discounted at the specified annual rate.</CardDescription>
            </CardContent>
        </Card>
      )}
       <Accordion type="single" collapsible className="w-full">
        <AccordionItem value="how-it-works">
            <AccordionTrigger>How It Works</AccordionTrigger>
            <AccordionContent className="text-muted-foreground space-y-2">
                <p>The Present Value (PV) calculator determines the current worth of a future sum of money. The concept is based on the time value of money, which states that a dollar today is worth more than a dollar tomorrow because it can be invested and earn interest.</p>
                <p className='font-mono p-4 bg-muted rounded-md'>PV = FV / (1 + r)^t</p>
                <p>The formula discounts the Future Value (FV) by the annual rate (r) over a number of years (t).</p>
            </AccordionContent>
        </AccordionItem>
        <AccordionItem value="further-reading">
            <AccordionTrigger>Further Reading</AccordionTrigger>
            <AccordionContent className="text-muted-foreground">
                 <a href="https://www.sec.gov/node/10521" target="_blank" rel="noopener noreferrer" className="text-primary underline">U.S. Securities and Exchange Commission – Understanding Discounted Cash Flow</a>
            </AccordionContent>
        </AccordionItem>
      </Accordion>
    </div>
  );
}

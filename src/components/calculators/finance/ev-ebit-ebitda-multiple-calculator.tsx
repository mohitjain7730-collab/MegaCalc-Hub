
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
  ev: z.number().positive(),
  ebit: z.number().positive(),
  ebitda: z.number().positive(),
});

type FormValues = z.infer<typeof formSchema>;

export default function EvEbitEbitdaMultipleCalculator() {
  const [result, setResult] = useState<{ evEbit: number; evEbitda: number } | null>(null);

  const form = useForm<FormValues>({
    resolver: zodResolver(formSchema),
    defaultValues: {
      ev: undefined,
      ebit: undefined,
      ebitda: undefined,
    },
  });

  const onSubmit = (values: FormValues) => {
    setResult({
      evEbit: values.ev / values.ebit,
      evEbitda: values.ev / values.ebitda,
    });
  };

  return (
    <div className="space-y-8">
      <Form {...form}>
        <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-6">
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <FormField control={form.control} name="ev" render={({ field }) => (
              <FormItem>
                <FormLabel>Enterprise Value (EV)</FormLabel>
                <FormControl>
                  <Input type="number" {...field} value={field.value ?? ''} onChange={e => field.onChange(parseFloat(e.target.value) || undefined)} />
                </FormControl>
                <FormMessage />
              </FormItem>
            )} />
            <FormField control={form.control} name="ebit" render={({ field }) => (
              <FormItem>
                <FormLabel>EBIT</FormLabel>
                <FormControl>
                  <Input type="number" {...field} value={field.value ?? ''} onChange={e => field.onChange(parseFloat(e.target.value) || undefined)} />
                </FormControl>
                <FormMessage />
              </FormItem>
            )} />
             <FormField control={form.control} name="ebitda" render={({ field }) => (
              <FormItem>
                <FormLabel>EBITDA</FormLabel>
                <FormControl>
                  <Input type="number" {...field} value={field.value ?? ''} onChange={e => field.onChange(parseFloat(e.target.value) || undefined)} />
                </FormControl>
                <FormMessage />
              </FormItem>
            )} />
          </div>
          <Button type="submit">Calculate Multiples</Button>
        </form>
      </Form>
      {result !== null && (
        <Card className="mt-8">
          <CardHeader>
            <div className='flex items-center gap-4'>
              <Landmark className="h-8 w-8 text-primary" />
              <CardTitle>Valuation Multiples</CardTitle>
            </div>
          </CardHeader>
          <CardContent className="grid grid-cols-1 md:grid-cols-2 gap-4 text-center">
             <div>
              <p className="font-semibold text-lg">EV/EBIT</p>
              <p className="text-2xl font-bold">{result.evEbit.toFixed(2)}x</p>
            </div>
            <div>
              <p className="font-semibold text-lg">EV/EBITDA</p>
              <p className="text-2xl font-bold">{result.evEbitda.toFixed(2)}x</p>
            </div>
          </CardContent>
        </Card>
      )}
      <Accordion type="single" collapsible className="w-full">
        <AccordionItem value="understanding-inputs">
            <AccordionTrigger>Understanding the Inputs</AccordionTrigger>
            <AccordionContent className="text-muted-foreground space-y-4">
                <div>
                    <h4 className="font-semibold text-foreground mb-1">Enterprise Value (EV)</h4>
                    <p>The total value of a company, often considered its theoretical takeover price. You can calculate this with the EV Calculator.</p>
                </div>
                <div>
                    <h4 className="font-semibold text-foreground mb-1">EBIT &amp; EBITDA</h4>
                    <p>Earnings Before Interest and Taxes (EBIT) and Earnings Before Interest, Taxes, Depreciation, and Amortization (EBITDA). These are measures of a company's operating profitability. You can calculate these with the EBITDA/EBIT Calculator.</p>
                </div>
            </AccordionContent>
        </AccordionItem>
        <AccordionItem value="how-it-works">
          <AccordionTrigger>How It Works</AccordionTrigger>
          <AccordionContent className="text-muted-foreground">
            <p>EV/EBITDA and EV/EBIT are valuation multiples used to compare the value of a company to its earnings. They are often preferred over the P/E ratio because they are not affected by a company's capital structure (the mix of debt and equity). A lower multiple may indicate a company is undervalued, while a higher multiple may suggest it is overvalued, relative to its peers.</p>
          </AccordionContent>
        </AccordionItem>
      </Accordion>
    </div>
  );
}

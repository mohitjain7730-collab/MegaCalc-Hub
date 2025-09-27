
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
  ebit: z.number(),
  interestExpense: z.number().positive(),
});

type FormValues = z.infer<typeof formSchema>;

export default function InterestCoverageRatioCalculator() {
  const [result, setResult] = useState<number | null>(null);

  const form = useForm<FormValues>({
    resolver: zodResolver(formSchema),
    defaultValues: {
      ebit: undefined,
      interestExpense: undefined,
    },
  });

  const onSubmit = (values: FormValues) => {
    setResult(values.ebit / values.interestExpense);
  };

  return (
    <div className="space-y-8">
      <Form {...form}>
        <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-6">
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <FormField control={form.control} name="ebit" render={({ field }) => (
              <FormItem>
                <FormLabel>EBIT ($)</FormLabel>
                <FormControl>
                  <Input type="number" {...field} value={field.value ?? ''} onChange={e => field.onChange(parseFloat(e.target.value) || undefined)} />
                </FormControl>
                <FormMessage />
              </FormItem>
            )} />
            <FormField control={form.control} name="interestExpense" render={({ field }) => (
              <FormItem>
                <FormLabel>Interest Expense ($)</FormLabel>
                <FormControl>
                  <Input type="number" {...field} value={field.value ?? ''} onChange={e => field.onChange(parseFloat(e.target.value) || undefined)} />
                </FormControl>
                <FormMessage />
              </FormItem>
            )} />
          </div>
          <Button type="submit">Calculate Ratio</Button>
        </form>
      </Form>
      {result !== null && (
        <Card className="mt-8">
          <CardHeader>
            <div className='flex items-center gap-4'>
              <Landmark className="h-8 w-8 text-primary" />
              <CardTitle>Interest Coverage Ratio</CardTitle>
            </div>
          </CardHeader>
          <CardContent>
            <p className="text-3xl font-bold text-center">{result.toFixed(2)}x</p>
            <CardDescription className='mt-4 text-center'>The company's earnings can cover its interest expenses {result.toFixed(2)} times over.</CardDescription>
          </CardContent>
        </Card>
      )}
      <Accordion type="single" collapsible className="w-full">
        <AccordionItem value="understanding-inputs">
            <AccordionTrigger>Understanding the Inputs</AccordionTrigger>
            <AccordionContent className="text-muted-foreground space-y-4">
                <div>
                    <h4 className="font-semibold text-foreground mb-1">EBIT ($)</h4>
                    <p>Earnings Before Interest and Taxes. This figure is found on a company's income statement and represents its operating profit.</p>
                </div>
                <div>
                    <h4 className="font-semibold text-foreground mb-1">Interest Expense ($)</h4>
                    <p>The cost of a company's debt for the period, also found on the income statement.</p>
                </div>
            </AccordionContent>
        </AccordionItem>
        <AccordionItem value="how-it-works">
          <AccordionTrigger>How It Works</AccordionTrigger>
          <AccordionContent className="text-muted-foreground">
            <p>The Interest Coverage Ratio is a debt and profitability ratio used to determine how easily a company can pay interest on its outstanding debt. The ratio is calculated by dividing a company's earnings before interest and taxes (EBIT) by its interest expense during a given period. A higher ratio is generally better, indicating a company is in a good position to meet its interest obligations.</p>
          </AccordionContent>
        </AccordionItem>
         <AccordionItem value="further-reading">
            <AccordionTrigger>Further Reading</AccordionTrigger>
            <AccordionContent className="text-muted-foreground">
                 <a href="https://www.sec.gov/oiea/investor-alerts-and-bulletins/ib_investing-in-corporate-bonds" target="_blank" rel="noopener noreferrer" className="text-primary underline">U.S. SEC – Investing in Corporate Bonds</a>
            </AccordionContent>
        </AccordionItem>
      </Accordion>
    </div>
  );
}


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
  totalLiabilities: z.number().positive(),
  shareholdersEquity: z.number().positive(),
});

type FormValues = z.infer<typeof formSchema>;

export default function DebtToEquityRatioCalculator() {
  const [result, setResult] = useState<number | null>(null);

  const form = useForm<FormValues>({
    resolver: zodResolver(formSchema),
    defaultValues: {
      totalLiabilities: undefined,
      shareholdersEquity: undefined,
    },
  });

  const onSubmit = (values: FormValues) => {
    setResult(values.totalLiabilities / values.shareholdersEquity);
  };

  return (
    <div className="space-y-8">
      <Form {...form}>
        <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-6">
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <FormField control={form.control} name="totalLiabilities" render={({ field }) => (
              <FormItem>
                <FormLabel>Total Liabilities ($)</FormLabel>
                <FormControl>
                  <Input type="number" {...field} value={field.value ?? ''} onChange={e => field.onChange(parseFloat(e.target.value) || undefined)} />
                </FormControl>
                <FormMessage />
              </FormItem>
            )} />
            <FormField control={form.control} name="shareholdersEquity" render={({ field }) => (
              <FormItem>
                <FormLabel>Shareholders' Equity ($)</FormLabel>
                <FormControl>
                  <Input type="number" {...field} value={field.value ?? ''} onChange={e => field.onChange(parseFloat(e.target.value) || undefined)} />
                </FormControl>
                <FormMessage />
              </FormItem>
            )} />
          </div>
          <Button type="submit">Calculate D/E Ratio</Button>
        </form>
      </Form>
      {result !== null && (
        <Card className="mt-8">
          <CardHeader>
            <div className='flex items-center gap-4'>
              <Landmark className="h-8 w-8 text-primary" />
              <CardTitle>Debt-to-Equity (D/E) Ratio</CardTitle>
            </div>
          </CardHeader>
          <CardContent>
            <p className="text-3xl font-bold text-center">{result.toFixed(2)}</p>
            <CardDescription className='mt-4 text-center'>A ratio of {result.toFixed(2)} means the company has ${result.toFixed(2)} of debt for every $1 of equity.</CardDescription>
          </CardContent>
        </Card>
      )}
      <Accordion type="single" collapsible className="w-full">
        <AccordionItem value="understanding-inputs">
            <AccordionTrigger>Understanding the Inputs</AccordionTrigger>
            <AccordionContent className="text-muted-foreground space-y-4">
                <div>
                    <h4 className="font-semibold text-foreground mb-1">Total Liabilities ($)</h4>
                    <p>Found on the company's balance sheet, this is the sum of all its debts and obligations, both short-term and long-term.</p>
                </div>
                <div>
                    <h4 className="font-semibold text-foreground mb-1">Shareholders' Equity ($)</h4>
                    <p>Also found on the balance sheet, this represents the value that would be returned to shareholders if all assets were liquidated and all debts repaid. It is calculated as Total Assets - Total Liabilities.</p>
                </div>
            </AccordionContent>
        </AccordionItem>
        <AccordionItem value="how-it-works">
          <AccordionTrigger>How It Works</AccordionTrigger>
          <AccordionContent className="text-muted-foreground">
            <p>The Debt-to-Equity (D/E) ratio is a key financial leverage ratio that measures the extent to which a company is financing its operations through debt versus wholly-owned funds. A high D/E ratio generally means that a company has been aggressive in financing its growth with debt, which can result in volatile earnings due to the additional interest expense.</p>
          </AccordionContent>
        </AccordionItem>
         <AccordionItem value="further-reading">
            <AccordionTrigger>Further Reading</AccordionTrigger>
            <AccordionContent className="text-muted-foreground">
                 <a href="https://www.sec.gov/oiea/investor-alerts-and-bulletins/ib_understanding-financial-ratios" target="_blank" rel="noopener noreferrer" className="text-primary underline">U.S. SEC – Financial Ratios</a>
            </AccordionContent>
        </AccordionItem>
      </Accordion>
    </div>
  );
}

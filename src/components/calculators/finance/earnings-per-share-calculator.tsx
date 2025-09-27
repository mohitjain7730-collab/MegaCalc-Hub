
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
  netIncome: z.number(),
  preferredDividends: z.number().nonnegative(),
  sharesOutstanding: z.number().positive(),
});

type FormValues = z.infer<typeof formSchema>;

export default function EarningsPerShareCalculator() {
  const [result, setResult] = useState<number | null>(null);

  const form = useForm<FormValues>({
    resolver: zodResolver(formSchema),
    defaultValues: {
      netIncome: undefined,
      preferredDividends: undefined,
      sharesOutstanding: undefined,
    },
  });

  const onSubmit = (values: FormValues) => {
    setResult((values.netIncome - values.preferredDividends) / values.sharesOutstanding);
  };

  return (
    <div className="space-y-8">
      <Form {...form}>
        <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-6">
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <FormField control={form.control} name="netIncome" render={({ field }) => (
              <FormItem>
                <FormLabel>Net Income ($)</FormLabel>
                <FormControl>
                  <Input type="number" {...field} value={field.value ?? ''} onChange={e => field.onChange(parseFloat(e.target.value) || undefined)} />
                </FormControl>
                <FormMessage />
              </FormItem>
            )} />
            <FormField control={form.control} name="preferredDividends" render={({ field }) => (
              <FormItem>
                <FormLabel>Preferred Dividends ($)</FormLabel>
                <FormControl>
                  <Input type="number" {...field} value={field.value ?? ''} onChange={e => field.onChange(parseFloat(e.target.value) || undefined)} />
                </FormControl>
                <FormMessage />
              </FormItem>
            )} />
            <FormField control={form.control} name="sharesOutstanding" render={({ field }) => (
              <FormItem className="md:col-span-2">
                <FormLabel>Weighted Average Shares Outstanding</FormLabel>
                <FormControl>
                  <Input type="number" {...field} value={field.value ?? ''} onChange={e => field.onChange(parseFloat(e.target.value) || undefined)} />
                </FormControl>
                <FormMessage />
              </FormItem>
            )} />
          </div>
          <Button type="submit">Calculate EPS</Button>
        </form>
      </Form>
      {result !== null && (
        <Card className="mt-8">
          <CardHeader>
            <div className='flex items-center gap-4'>
              <Landmark className="h-8 w-8 text-primary" />
              <CardTitle>Earnings per Share (EPS)</CardTitle>
            </div>
          </CardHeader>
          <CardContent>
            <p className="text-3xl font-bold text-center">${result.toFixed(2)}</p>
            <CardDescription className='mt-4 text-center'>This is the portion of the company's profit allocated to each outstanding share of common stock.</CardDescription>
          </CardContent>
        </Card>
      )}
      <Accordion type="single" collapsible className="w-full">
        <AccordionItem value="how-it-works">
          <AccordionTrigger>How It Works</AccordionTrigger>
          <AccordionContent className="text-muted-foreground space-y-2">
            <p>Earnings per Share (EPS) is a widely used metric to estimate corporate value. A higher EPS indicates greater value because investors will pay more for a company's shares if they think the company has higher profits relative to its share price. The calculator subtracts preferred dividends from net income and divides the result by the number of weighted average shares outstanding.</p>
          </AccordionContent>
        </AccordionItem>
        <AccordionItem value="further-reading">
            <AccordionTrigger>Further Reading</AccordionTrigger>
            <AccordionContent className="text-muted-foreground">
                 <a href="https://www.sec.gov/oiea/investor-alerts-and-bulletins/investor-bulletin-understanding-earnings-share" target="_blank" rel="noopener noreferrer" className="text-primary underline">SEC – EPS Definition</a>
            </AccordionContent>
        </AccordionItem>
      </Accordion>
    </div>
  );
}

    
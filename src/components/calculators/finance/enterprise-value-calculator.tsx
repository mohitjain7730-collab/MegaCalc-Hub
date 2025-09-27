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
  marketCap: z.number().positive(),
  totalDebt: z.number().nonnegative(),
  cash: z.number().nonnegative(),
});

type FormValues = z.infer<typeof formSchema>;

export default function EnterpriseValueCalculator() {
  const [result, setResult] = useState<number | null>(null);

  const form = useForm<FormValues>({
    resolver: zodResolver(formSchema),
    defaultValues: {
      marketCap: undefined,
      totalDebt: undefined,
      cash: undefined,
    },
  });

  const onSubmit = (values: FormValues) => {
    setResult(values.marketCap + values.totalDebt - values.cash);
  };

  return (
    <div className="space-y-8">
      <Form {...form}>
        <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-6">
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <FormField control={form.control} name="marketCap" render={({ field }) => (
              <FormItem>
                <FormLabel>Market Capitalization ($)</FormLabel>
                <FormControl>
                  <Input type="number" {...field} value={field.value ?? ''} onChange={e => field.onChange(parseFloat(e.target.value) || undefined)} />
                </FormControl>
                <FormMessage />
              </FormItem>
            )} />
            <FormField control={form.control} name="totalDebt" render={({ field }) => (
              <FormItem>
                <FormLabel>Total Debt ($)</FormLabel>
                <FormControl>
                  <Input type="number" {...field} value={field.value ?? ''} onChange={e => field.onChange(parseFloat(e.target.value) || undefined)} />
                </FormControl>
                <FormMessage />
              </FormItem>
            )} />
            <FormField control={form.control} name="cash" render={({ field }) => (
              <FormItem className="md:col-span-2">
                <FormLabel>Cash and Cash Equivalents ($)</FormLabel>
                <FormControl>
                  <Input type="number" {...field} value={field.value ?? ''} onChange={e => field.onChange(parseFloat(e.target.value) || undefined)} />
                </FormControl>
                <FormMessage />
              </FormItem>
            )} />
          </div>
          <Button type="submit">Calculate EV</Button>
        </form>
      </Form>
      {result !== null && (
        <Card className="mt-8">
          <CardHeader>
            <div className='flex items-center gap-4'>
              <Landmark className="h-8 w-8 text-primary" />
              <CardTitle>Enterprise Value (EV)</CardTitle>
            </div>
          </CardHeader>
          <CardContent>
            <p className="text-3xl font-bold text-center">${result.toLocaleString(undefined, { maximumFractionDigits: 2 })}</p>
            <CardDescription className='mt-4 text-center'>This represents the total value of the company, often seen as the theoretical takeover price.</CardDescription>
          </CardContent>
        </Card>
      )}
      <Accordion type="single" collapsible className="w-full">
        <AccordionItem value="understanding-inputs">
            <AccordionTrigger>Understanding the Inputs</AccordionTrigger>
            <AccordionContent className="text-muted-foreground space-y-4">
                <div>
                    <h4 className="font-semibold text-foreground mb-1">Market Capitalization ($)</h4>
                    <p>The total market value of a company's outstanding shares (Share Price × Number of Shares).</p>
                </div>
                <div>
                    <h4 className="font-semibold text-foreground mb-1">Total Debt ($)</h4>
                    <p>The sum of all a company's interest-bearing debt, both short-term and long-term.</p>
                </div>
                <div>
                    <h4 className="font-semibold text-foreground mb-1">Cash and Cash Equivalents ($)</h4>
                    <p>The company's most liquid assets, found on its balance sheet.</p>
                </div>
            </AccordionContent>
        </AccordionItem>
        <AccordionItem value="how-it-works">
          <AccordionTrigger>How It Works</AccordionTrigger>
          <AccordionContent className="text-muted-foreground">
            <p>Enterprise Value (EV) is a measure of a company's total value, often used as a more comprehensive alternative to market capitalization. EV includes in its calculation the market capitalization of a company but also short-term and long-term debt as well as any cash on the company's balance sheet. By adding debt and subtracting cash, it gives a more accurate picture of the company's theoretical takeover price.</p>
          </AccordionContent>
        </AccordionItem>
      </Accordion>
    </div>
  );
}
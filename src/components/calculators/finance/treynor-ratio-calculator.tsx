
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
  portfolioReturn: z.number(),
  riskFreeRate: z.number(),
  beta: z.number().positive("Beta must be positive to calculate the ratio"),
});

type FormValues = z.infer<typeof formSchema>;

export default function TreynorRatioCalculator() {
  const [result, setResult] = useState<number | null>(null);

  const form = useForm<FormValues>({
    resolver: zodResolver(formSchema),
    defaultValues: {
      portfolioReturn: undefined,
      riskFreeRate: undefined,
      beta: undefined,
    },
  });

  const onSubmit = (values: FormValues) => {
    const { portfolioReturn, riskFreeRate, beta } = values;
    const rp = portfolioReturn / 100;
    const rf = riskFreeRate / 100;
    setResult((rp - rf) / beta);
  };

  return (
    <div className="space-y-8">
      <Form {...form}>
        <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-6">
          <CardDescription>All inputs should be in percentage terms, except for Beta.</CardDescription>
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <FormField control={form.control} name="portfolioReturn" render={({ field }) => (
              <FormItem>
                <FormLabel>Portfolio Return (Rp) %</FormLabel>
                <FormControl>
                  <Input type="number" step="any" {...field} value={field.value ?? ''} onChange={e => field.onChange(parseFloat(e.target.value) || 0)} />
                </FormControl>
                <FormMessage />
              </FormItem>
            )} />
             <FormField control={form.control} name="riskFreeRate" render={({ field }) => (
              <FormItem>
                <FormLabel>Risk-Free Rate (Rf) %</FormLabel>
                <FormControl>
                  <Input type="number" step="any" {...field} value={field.value ?? ''} onChange={e => field.onChange(parseFloat(e.target.value) || 0)} />
                </FormControl>
                <FormMessage />
              </FormItem>
            )} />
             <FormField control={form.control} name="beta" render={({ field }) => (
              <FormItem className="md:col-span-2">
                <FormLabel>Portfolio Beta (βp)</FormLabel>
                <FormControl>
                  <Input type="number" step="any" {...field} value={field.value ?? ''} onChange={e => field.onChange(parseFloat(e.target.value) || 0)} />
                </FormControl>
                <FormMessage />
              </FormItem>
            )} />
          </div>
          <Button type="submit">Calculate Treynor Ratio</Button>
        </form>
      </Form>
      {result !== null && (
        <Card className="mt-8">
          <CardHeader>
            <div className='flex items-center gap-4'>
              <Landmark className="h-8 w-8 text-primary" />
              <CardTitle>Treynor Ratio</CardTitle>
            </div>
          </CardHeader>
          <CardContent>
            <p className="text-3xl font-bold text-center">{result.toFixed(4)}</p>
            <CardDescription className='mt-4 text-center'>A higher Treynor Ratio indicates a better return for each unit of systematic risk taken.</CardDescription>
          </CardContent>
        </Card>
      )}
      <Accordion type="single" collapsible className="w-full">
        <AccordionItem value="understanding-inputs">
            <AccordionTrigger>Understanding the Inputs</AccordionTrigger>
            <AccordionContent className="text-muted-foreground space-y-4">
                <div>
                    <h4 className="font-semibold text-foreground mb-1">Portfolio Return (Rp)</h4>
                    <p>The average rate of return for your investment portfolio.</p>
                </div>
                <div>
                    <h4 className="font-semibold text-foreground mb-1">Risk-Free Rate (Rf)</h4>
                    <p>The rate of return of a risk-free investment, like a U.S. Treasury bill.</p>
                </div>
                 <div>
                    <h4 className="font-semibold text-foreground mb-1">Portfolio Beta (βp)</h4>
                    <p>A measure of the portfolio's volatility or systematic risk in relation to the overall market. A beta of 1 means the portfolio moves in line with the market.</p>
                </div>
            </AccordionContent>
        </AccordionItem>
        <AccordionItem value="how-it-works">
          <AccordionTrigger>How It Works</AccordionTrigger>
          <AccordionContent className="text-muted-foreground">
            <p>The Treynor Ratio is a risk-adjusted measure of return based on systematic risk. It is similar to the Sharpe Ratio, but uses the portfolio's beta as the measure of risk instead of total standard deviation. It shows the excess return generated for each unit of market risk taken on.</p>
          </AccordionContent>
        </AccordionItem>
        <AccordionItem value="further-reading">
            <AccordionTrigger>Further Reading</AccordionTrigger>
            <AccordionContent className="text-muted-foreground">
                 <a href="https://www.investopedia.com/terms/t/treynorratio.asp" target="_blank" rel="noopener noreferrer" className="text-primary underline">Investopedia – Treynor Ratio</a>
            </AccordionContent>
        </AccordionItem>
      </Accordion>
    </div>
  );
}

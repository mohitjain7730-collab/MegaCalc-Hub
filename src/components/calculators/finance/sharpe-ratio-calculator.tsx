
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
  stdDevPortfolio: z.number().positive("Standard deviation must be positive"),
});

type FormValues = z.infer<typeof formSchema>;

export default function SharpeRatioCalculator() {
  const [result, setResult] = useState<number | null>(null);

  const form = useForm<FormValues>({
    resolver: zodResolver(formSchema),
    defaultValues: {
      portfolioReturn: undefined,
      riskFreeRate: undefined,
      stdDevPortfolio: undefined,
    },
  });

  const onSubmit = (values: FormValues) => {
    const { portfolioReturn, riskFreeRate, stdDevPortfolio } = values;
    const rp = portfolioReturn / 100;
    const rf = riskFreeRate / 100;
    const sd = stdDevPortfolio / 100;
    setResult((rp - rf) / sd);
  };

  return (
    <div className="space-y-8">
      <Form {...form}>
        <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-6">
          <CardDescription>All inputs should be in percentage terms.</CardDescription>
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
             <FormField control={form.control} name="stdDevPortfolio" render={({ field }) => (
              <FormItem className="md:col-span-2">
                <FormLabel>Std. Deviation of Portfolio (σp) %</FormLabel>
                <FormControl>
                  <Input type="number" step="any" {...field} value={field.value ?? ''} onChange={e => field.onChange(parseFloat(e.target.value) || 0)} />
                </FormControl>
                <FormMessage />
              </FormItem>
            )} />
          </div>
          <Button type="submit">Calculate Sharpe Ratio</Button>
        </form>
      </Form>
      {result !== null && (
        <Card className="mt-8">
          <CardHeader>
            <div className='flex items-center gap-4'>
              <Landmark className="h-8 w-8 text-primary" />
              <CardTitle>Sharpe Ratio</CardTitle>
            </div>
          </CardHeader>
          <CardContent>
            <p className="text-3xl font-bold text-center">{result.toFixed(2)}</p>
            <CardDescription className='mt-4 text-center'>A higher Sharpe Ratio indicates a better risk-adjusted return. A ratio &gt; 1 is generally considered good.</CardDescription>
          </CardContent>
        </Card>
      )}
      <Accordion type="single" collapsible className="w-full">
        <AccordionItem value="understanding-inputs">
            <AccordionTrigger>Understanding the Inputs</AccordionTrigger>
            <AccordionContent className="text-muted-foreground space-y-4">
                <div>
                    <h4 className="font-semibold text-foreground mb-1">Portfolio Return (Rp)</h4>
                    <p>The average rate of return for your investment portfolio over a specific period.</p>
                </div>
                <div>
                    <h4 className="font-semibold text-foreground mb-1">Risk-Free Rate (Rf)</h4>
                    <p>The theoretical rate of return of an investment with zero risk. The yield on a U.S. Treasury bill is often used as a proxy for the risk-free rate.</p>
                </div>
                 <div>
                    <h4 className="font-semibold text-foreground mb-1">Standard Deviation of Portfolio (σp)</h4>
                    <p>A measure of the portfolio's volatility. It indicates how much the portfolio's returns fluctuate around its average return. A higher standard deviation means higher risk.</p>
                </div>
            </AccordionContent>
        </AccordionItem>
        <AccordionItem value="how-it-works">
          <AccordionTrigger>How It Works</AccordionTrigger>
          <AccordionContent className="text-muted-foreground">
            <p>The Sharpe Ratio measures the performance of an investment compared to a risk-free asset, after adjusting for its risk. It is defined as the difference between the returns of the investment and the risk-free return, divided by the standard deviation of the investment (its volatility). It represents the additional amount of return that an investor receives per unit of increase in risk.</p>
          </AccordionContent>
        </AccordionItem>
        <AccordionItem value="further-reading">
            <AccordionTrigger>Further Reading</AccordionTrigger>
            <AccordionContent className="text-muted-foreground">
                 <a href="https://www.cfainstitute.org/en/membership/professional-development/refresher-readings" target="_blank" rel="noopener noreferrer" className="text-primary underline">CFA Institute – Sharpe Ratio</a>
            </AccordionContent>
        </AccordionItem>
      </Accordion>
    </div>
  );
}

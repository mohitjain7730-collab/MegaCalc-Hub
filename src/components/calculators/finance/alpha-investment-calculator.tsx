
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
  beta: z.number(),
  marketReturn: z.number(),
});

type FormValues = z.infer<typeof formSchema>;

export default function AlphaInvestmentCalculator() {
  const [result, setResult] = useState<number | null>(null);

  const form = useForm<FormValues>({
    resolver: zodResolver(formSchema),
    defaultValues: {
      portfolioReturn: undefined,
      riskFreeRate: undefined,
      beta: undefined,
      marketReturn: undefined,
    },
  });

  const onSubmit = (values: FormValues) => {
    const rp = values.portfolioReturn / 100;
    const rf = values.riskFreeRate / 100;
    const beta = values.beta;
    const rm = values.marketReturn / 100;

    const expectedReturn = rf + beta * (rm - rf);
    const alpha = (rp - expectedReturn) * 100;
    
    setResult(alpha);
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
                  <Input type="number" {...field} value={field.value ?? ''} onChange={e => field.onChange(parseFloat(e.target.value) || 0)} />
                </FormControl>
                <FormMessage />
              </FormItem>
            )} />
             <FormField control={form.control} name="riskFreeRate" render={({ field }) => (
              <FormItem>
                <FormLabel>Risk-Free Rate (Rf) %</FormLabel>
                <FormControl>
                  <Input type="number" {...field} value={field.value ?? ''} onChange={e => field.onChange(parseFloat(e.target.value) || 0)} />
                </FormControl>
                <FormMessage />
              </FormItem>
            )} />
             <FormField control={form.control} name="beta" render={({ field }) => (
              <FormItem>
                <FormLabel>Portfolio Beta (βp)</FormLabel>
                <FormControl>
                  <Input type="number" {...field} value={field.value ?? ''} onChange={e => field.onChange(parseFloat(e.target.value) || 0)} />
                </FormControl>
                <FormMessage />
              </FormItem>
            )} />
            <FormField control={form.control} name="marketReturn" render={({ field }) => (
              <FormItem>
                <FormLabel>Market Return (Rm) %</FormLabel>
                <FormControl>
                  <Input type="number" {...field} value={field.value ?? ''} onChange={e => field.onChange(parseFloat(e.target.value) || 0)} />
                </FormControl>
                <FormMessage />
              </FormItem>
            )} />
          </div>
          <Button type="submit">Calculate Alpha</Button>
        </form>
      </Form>
      {result !== null && (
        <Card className="mt-8">
          <CardHeader>
            <div className='flex items-center gap-4'>
              <Landmark className="h-8 w-8 text-primary" />
              <CardTitle>Investment Alpha</CardTitle>
            </div>
          </CardHeader>
          <CardContent>
            <p className="text-3xl font-bold text-center">{result.toFixed(2)}%</p>
            <CardDescription className='mt-4 text-center'>A positive Alpha indicates the investment has outperformed its expected return, given its risk.</CardDescription>
          </CardContent>
        </Card>
      )}
      <Accordion type="single" collapsible className="w-full">
        <AccordionItem value="understanding-inputs">
            <AccordionTrigger>Understanding the Inputs</AccordionTrigger>
            <AccordionContent className="text-muted-foreground space-y-4">
                <div>
                    <h4 className="font-semibold text-foreground mb-1">Portfolio Return (Rp)</h4>
                    <p>The actual return of your investment portfolio over a specific period, expressed as a percentage.</p>
                </div>
                <div>
                    <h4 className="font-semibold text-foreground mb-1">Risk-Free Rate (Rf)</h4>
                    <p>The rate of return of a virtually risk-free investment, like a U.S. Treasury bill, expressed as a percentage.</p>
                </div>
                 <div>
                    <h4 className="font-semibold text-foreground mb-1">Portfolio Beta (βp)</h4>
                    <p>A measure of your portfolio's volatility, or systematic risk, in comparison to the market as a whole. A beta of 1 means it moves with the market; a beta > 1 is more volatile.</p>
                </div>
                <div>
                    <h4 className="font-semibold text-foreground mb-1">Market Return (Rm)</h4>
                    <p>The return of the overall market over the same period, often represented by a broad market index like the S&P 500, expressed as a percentage.</p>
                </div>
            </AccordionContent>
        </AccordionItem>
        <AccordionItem value="how-it-works">
          <AccordionTrigger>How It Works</AccordionTrigger>
          <AccordionContent className="text-muted-foreground">
            <p>Alpha represents the excess return of an investment relative to the return of a benchmark index. It's a measure of performance on a risk-adjusted basis. This calculator uses the Capital Asset Pricing Model (CAPM) to find the expected return of the portfolio `(Rf + βp * (Rm - Rf))`, and then subtracts this from the portfolio's actual return to find the Alpha.</p>
          </AccordionContent>
        </AccordionItem>
        <AccordionItem value="further-reading">
            <AccordionTrigger>Further Reading</AccordionTrigger>
            <AccordionContent className="text-muted-foreground">
                 <a href="https://www.cfainstitute.org/en/membership/professional-development/refresher-readings/introduction-to-risk-management" target="_blank" rel="noopener noreferrer" className="text-primary underline">CFA Institute – Investment Alpha</a>
            </AccordionContent>
        </AccordionItem>
      </Accordion>
    </div>
  );
}

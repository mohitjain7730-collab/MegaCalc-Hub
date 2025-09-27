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
  downsideDeviation: z.number().positive("Downside deviation must be positive"),
});

type FormValues = z.infer<typeof formSchema>;

export default function SortinoRatioCalculator() {
  const [result, setResult] = useState<number | null>(null);

  const form = useForm<FormValues>({
    resolver: zodResolver(formSchema),
    defaultValues: {
      portfolioReturn: undefined,
      riskFreeRate: undefined,
      downsideDeviation: undefined,
    },
  });

  const onSubmit = (values: FormValues) => {
    const { portfolioReturn, riskFreeRate, downsideDeviation } = values;
    const rp = portfolioReturn / 100;
    const rf = riskFreeRate / 100;
    const dd = downsideDeviation / 100;
    setResult((rp - rf) / dd);
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
             <FormField control={form.control} name="downsideDeviation" render={({ field }) => (
              <FormItem className="md:col-span-2">
                <FormLabel>Downside Deviation (σd) %</FormLabel>
                <FormControl>
                  <Input type="number" step="any" {...field} value={field.value ?? ''} onChange={e => field.onChange(parseFloat(e.target.value) || 0)} />
                </FormControl>
                <FormMessage />
              </FormItem>
            )} />
          </div>
          <Button type="submit">Calculate Sortino Ratio</Button>
        </form>
      </Form>
      {result !== null && (
        <Card className="mt-8">
          <CardHeader>
            <div className='flex items-center gap-4'>
              <Landmark className="h-8 w-8 text-primary" />
              <CardTitle>Sortino Ratio</CardTitle>
            </div>
          </CardHeader>
          <CardContent>
            <p className="text-3xl font-bold text-center">{result.toFixed(2)}</p>
            <CardDescription className='mt-4 text-center'>A higher Sortino Ratio indicates a better return for the amount of "bad" risk taken.</CardDescription>
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
                    <h4 className="font-semibold text-foreground mb-1">Downside Deviation (σd)</h4>
                    <p>Similar to standard deviation, but it only considers returns that fall below a minimum acceptable return (the "bad" volatility).</p>
                </div>
            </AccordionContent>
        </AccordionItem>
        <AccordionItem value="how-it-works">
          <AccordionTrigger>How It Works</AccordionTrigger>
          <AccordionContent className="text-muted-foreground">
            <p>The Sortino Ratio is a modification of the Sharpe Ratio that differentiates harmful volatility from total overall volatility. It does this by using the asset's downside deviation in the denominator instead of the total standard deviation. Because it only penalizes returns falling below a user-specified target or required rate of return, it is thought to give a better view of an investment's risk-adjusted performance.</p>
          </AccordionContent>
        </AccordionItem>
        <AccordionItem value="further-reading">
            <AccordionTrigger>Further Reading</AccordionTrigger>
            <AccordionContent className="text-muted-foreground">
                 <a href="https://www.cfainstitute.org/en/membership/professional-development/refresher-readings" target="_blank" rel="noopener noreferrer" className="text-primary underline">CFA Institute – Risk-Adjusted Metrics</a>
            </AccordionContent>
        </AccordionItem>
      </Accordion>
    </div>
  );
}

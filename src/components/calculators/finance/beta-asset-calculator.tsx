
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
  covariance: z.number(),
  variance: z.number().positive("Market variance must be positive"),
});

type FormValues = z.infer<typeof formSchema>;

export default function BetaAssetCalculator() {
  const [result, setResult] = useState<number | null>(null);

  const form = useForm<FormValues>({
    resolver: zodResolver(formSchema),
    defaultValues: {
      covariance: undefined,
      variance: undefined,
    },
  });

  const onSubmit = (values: FormValues) => {
    setResult(values.covariance / values.variance);
  };

  return (
    <div className="space-y-8">
      <Form {...form}>
        <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-6">
           <CardDescription>Calculates the beta of an asset, a measure of its volatility in relation to the market.</CardDescription>
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <FormField control={form.control} name="covariance" render={({ field }) => (
              <FormItem>
                <FormLabel>Covariance(Asset, Market)</FormLabel>
                <FormControl>
                  <Input type="number" step="any" {...field} value={field.value ?? ''} onChange={e => field.onChange(parseFloat(e.target.value) || 0)} />
                </FormControl>
                <FormMessage />
              </FormItem>
            )} />
            <FormField control={form.control} name="variance" render={({ field }) => (
              <FormItem>
                <FormLabel>Variance(Market)</FormLabel>
                <FormControl>
                  <Input type="number" step="any" {...field} value={field.value ?? ''} onChange={e => field.onChange(parseFloat(e.target.value) || 0)} />
                </FormControl>
                <FormMessage />
              </FormItem>
            )} />
          </div>
          <Button type="submit">Calculate Beta</Button>
        </form>
      </Form>
      {result !== null && (
        <Card className="mt-8">
          <CardHeader>
            <div className='flex items-center gap-4'>
              <Landmark className="h-8 w-8 text-primary" />
              <CardTitle>Asset Beta (β)</CardTitle>
            </div>
          </CardHeader>
          <CardContent>
            <p className="text-3xl font-bold text-center">{result.toFixed(2)}</p>
            <CardDescription className='mt-4 text-center'>
              A beta of 1 means the asset moves with the market. &gt;1 is more volatile, and &lt;1 is less volatile than the market.
            </CardDescription>
          </CardContent>
        </Card>
      )}
      <Accordion type="single" collapsible className="w-full">
        <AccordionItem value="understanding-inputs">
            <AccordionTrigger>Understanding the Inputs</AccordionTrigger>
            <AccordionContent className="text-muted-foreground space-y-4">
                <div>
                    <h4 className="font-semibold text-foreground mb-1">Covariance(Asset, Market)</h4>
                    <p>A measure of how the asset's returns move in relation to the market's returns. A positive covariance means they tend to move together.</p>
                </div>
                <div>
                    <h4 className="font-semibold text-foreground mb-1">Variance(Market)</h4>
                    <p>A measure of the market's own volatility. It is the standard deviation of the market's returns, squared.</p>
                </div>
            </AccordionContent>
        </AccordionItem>
        <AccordionItem value="how-it-works">
          <AccordionTrigger>How It Works</AccordionTrigger>
          <AccordionContent className="text-muted-foreground">
            <p>Beta (β) is a key concept in the Capital Asset Pricing Model (CAPM). It measures the volatility—or systematic risk—of a security or a portfolio in comparison to the market as a whole. The calculator simply divides the covariance of the asset with the market by the variance of the market.</p>
          </AccordionContent>
        </AccordionItem>
        <AccordionItem value="further-reading">
            <AccordionTrigger>Further Reading</AccordionTrigger>
            <AccordionContent className="text-muted-foreground">
                 <a href="https://www.sec.gov/oiea/investor-alerts-and-bulletins/ib_alphabeta" target="_blank" rel="noopener noreferrer" className="text-primary underline">U.S. SEC – Risk and Beta Overview</a>
            </AccordionContent>
        </AccordionItem>
      </Accordion>
    </div>
  );
}

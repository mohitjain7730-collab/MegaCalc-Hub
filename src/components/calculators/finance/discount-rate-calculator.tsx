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
  riskFreeRate: z.number().positive(),
  beta: z.number(),
  marketReturn: z.number().positive(),
});

type FormValues = z.infer<typeof formSchema>;

export default function DiscountRateCalculator() {
  const [result, setResult] = useState<number | null>(null);

  const form = useForm<FormValues>({
    resolver: zodResolver(formSchema),
    defaultValues: {
      riskFreeRate: undefined,
      beta: undefined,
      marketReturn: undefined,
    },
  });

  const onSubmit = (values: FormValues) => {
    const r = values.riskFreeRate / 100;
    const b = values.beta;
    const m = values.marketReturn / 100;
    const discountRate = (r + b * (m - r)) * 100;
    setResult(discountRate);
  };

  return (
    <div className="space-y-8">
      <Form {...form}>
        <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-6">
          <CardDescription>Estimate the discount rate using the Capital Asset Pricing Model (CAPM).</CardDescription>
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <FormField control={form.control} name="riskFreeRate" render={({ field }) => (
              <FormItem>
                <FormLabel>Risk-Free Rate (%)</FormLabel>
                <FormControl>
                  <Input type="number" placeholder="e.g., 4.5" {...field} value={field.value ?? ''} onChange={e => field.onChange(parseFloat(e.target.value) || undefined)} />
                </FormControl>
                <FormMessage />
              </FormItem>
            )} />
            <FormField control={form.control} name="beta" render={({ field }) => (
              <FormItem>
                <FormLabel>Investment Beta (β)</FormLabel>
                <FormControl>
                  <Input type="number" placeholder="e.g., 1.2" {...field} value={field.value ?? ''} onChange={e => field.onChange(parseFloat(e.target.value) || undefined)} />
                </FormControl>
                <FormMessage />
              </FormItem>
            )} />
            <FormField control={form.control} name="marketReturn" render={({ field }) => (
              <FormItem className="md:col-span-2">
                <FormLabel>Expected Market Return (%)</FormLabel>
                <FormControl>
                  <Input type="number" placeholder="e.g., 10" {...field} value={field.value ?? ''} onChange={e => field.onChange(parseFloat(e.target.value) || undefined)} />
                </FormControl>
                <FormMessage />
              </FormItem>
            )} />
          </div>
          <Button type="submit">Calculate Discount Rate</Button>
        </form>
      </Form>
      {result !== null && (
        <Card className="mt-8">
          <CardHeader>
            <div className='flex items-center gap-4'>
              <Landmark className="h-8 w-8 text-primary" />
              <CardTitle>Required Rate of Return (Discount Rate)</CardTitle>
            </div>
          </CardHeader>
          <CardContent>
            <p className="text-3xl font-bold text-center">{result.toFixed(2)}%</p>
            <CardDescription className='mt-4 text-center'>This is the estimated required rate of return for the investment, which can be used as a discount rate in DCF analysis.</CardDescription>
          </CardContent>
        </Card>
      )}
      <Accordion type="single" collapsible className="w-full">
        <AccordionItem value="how-it-works">
          <AccordionTrigger>How It Works (CAPM)</AccordionTrigger>
          <AccordionContent className="text-muted-foreground space-y-2">
            <p>This calculator uses the Capital Asset Pricing Model (CAPM) to estimate the expected return on an investment. It's a foundational model in finance for pricing risky securities. It calculates the required return by adding a risk premium to the risk-free rate. The risk premium is determined by the investment's beta, which measures its volatility relative to the overall market.</p>
          </AccordionContent>
        </AccordionItem>
      </Accordion>
    </div>
  );
}

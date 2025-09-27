
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
  riskFreeRate: z.number(),
  beta: z.number(),
  marketReturn: z.number(),
});

type FormValues = z.infer<typeof formSchema>;

export default function CapmCalculator() {
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
    const expectedReturn = (r + b * (m - r)) * 100;
    setResult(expectedReturn);
  };

  return (
    <div className="space-y-8">
      <Form {...form}>
        <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-6">
          <CardDescription>Calculate the expected return of an asset using the Capital Asset Pricing Model (CAPM).</CardDescription>
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <FormField control={form.control} name="riskFreeRate" render={({ field }) => (
              <FormItem>
                <FormLabel>Risk-Free Rate (Rf) %</FormLabel>
                <FormControl>
                  <Input type="number" placeholder="e.g., 4.5" {...field} value={field.value ?? ''} onChange={e => field.onChange(parseFloat(e.target.value))} />
                </FormControl>
                <FormMessage />
              </FormItem>
            )} />
            <FormField control={form.control} name="beta" render={({ field }) => (
              <FormItem>
                <FormLabel>Asset Beta (β)</FormLabel>
                <FormControl>
                  <Input type="number" placeholder="e.g., 1.2" {...field} value={field.value ?? ''} onChange={e => field.onChange(parseFloat(e.target.value))} />
                </FormControl>
                <FormMessage />
              </FormItem>
            )} />
            <FormField control={form.control} name="marketReturn" render={({ field }) => (
              <FormItem className="md:col-span-2">
                <FormLabel>Expected Market Return (Rm) %</FormLabel>
                <FormControl>
                  <Input type="number" placeholder="e.g., 10" {...field} value={field.value ?? ''} onChange={e => field.onChange(parseFloat(e.target.value))} />
                </FormControl>
                <FormMessage />
              </FormItem>
            )} />
          </div>
          <Button type="submit">Calculate Expected Return</Button>
        </form>
      </Form>
      {result !== null && (
        <Card className="mt-8">
          <CardHeader>
            <div className='flex items-center gap-4'><Landmark className="h-8 w-8 text-primary" /><CardTitle>Expected Return E(Ri)</CardTitle></div>
          </CardHeader>
          <CardContent>
            <p className="text-3xl font-bold text-center">{result.toFixed(2)}%</p>
            <CardDescription className='mt-4 text-center'>This is the return an investor should expect for taking on the risk of this particular asset.</CardDescription>
          </CardContent>
        </Card>
      )}
      <Accordion type="single" collapsible className="w-full">
        <AccordionItem value="how-it-works">
          <AccordionTrigger>How CAPM Works</AccordionTrigger>
          <AccordionContent className="text-muted-foreground space-y-2">
            <p>The Capital Asset Pricing Model (CAPM) provides a framework for determining the expected return on an asset. It adds a risk premium to the risk-free rate, where the premium is based on the asset's specific risk (beta) relative to the overall market.</p>
          </AccordionContent>
        </AccordionItem>
      </Accordion>
    </div>
  );
}

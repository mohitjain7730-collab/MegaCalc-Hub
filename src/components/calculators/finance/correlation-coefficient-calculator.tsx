
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
  stdDevX: z.number().positive(),
  stdDevY: z.number().positive(),
});

type FormValues = z.infer<typeof formSchema>;

export default function CorrelationCoefficientCalculator() {
  const [result, setResult] = useState<number | null>(null);

  const form = useForm<FormValues>({
    resolver: zodResolver(formSchema),
    defaultValues: {
      covariance: undefined,
      stdDevX: undefined,
      stdDevY: undefined,
    },
  });

  const onSubmit = (values: FormValues) => {
    setResult(values.covariance / (values.stdDevX * values.stdDevY));
  };

  return (
    <div className="space-y-8">
      <Form {...form}>
        <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-6">
           <CardDescription>Calculates the correlation between two assets based on their covariance and standard deviations.</CardDescription>
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <FormField control={form.control} name="covariance" render={({ field }) => (
              <FormItem>
                <FormLabel>Covariance (Asset X, Asset Y)</FormLabel>
                <FormControl>
                  <Input type="number" step="any" {...field} value={field.value ?? ''} onChange={e => field.onChange(parseFloat(e.target.value))} />
                </FormControl>
                <FormMessage />
              </FormItem>
            )} />
            <FormField control={form.control} name="stdDevX" render={({ field }) => (
              <FormItem>
                <FormLabel>Std. Deviation of Asset X (σX)</FormLabel>
                <FormControl>
                  <Input type="number" step="any" {...field} value={field.value ?? ''} onChange={e => field.onChange(parseFloat(e.target.value))} />
                </FormControl>
                <FormMessage />
              </FormItem>
            )} />
            <FormField control={form.control} name="stdDevY" render={({ field }) => (
              <FormItem className="md:col-span-2">
                <FormLabel>Std. Deviation of Asset Y (σY)</FormLabel>
                <FormControl>
                  <Input type="number" step="any" {...field} value={field.value ?? ''} onChange={e => field.onChange(parseFloat(e.target.value))} />
                </FormControl>
                <FormMessage />
              </FormItem>
            )} />
          </div>
          <Button type="submit">Calculate Correlation</Button>
        </form>
      </Form>
      {result !== null && (
        <Card className="mt-8">
          <CardHeader>
            <div className='flex items-center gap-4'>
              <Landmark className="h-8 w-8 text-primary" />
              <CardTitle>Correlation Coefficient (ρ)</CardTitle>
            </div>
          </CardHeader>
          <CardContent>
            <p className="text-3xl font-bold text-center">{result.toFixed(4)}</p>
            <CardDescription className='mt-4 text-center'>A value close to +1 indicates a strong positive correlation, close to -1 indicates a strong negative correlation, and close to 0 indicates no correlation.</CardDescription>
          </CardContent>
        </Card>
      )}
      <Accordion type="single" collapsible className="w-full">
        <AccordionItem value="understanding-inputs">
            <AccordionTrigger>Understanding the Inputs</AccordionTrigger>
            <AccordionContent className="text-muted-foreground space-y-4">
                <div>
                    <h4 className="font-semibold text-foreground mb-1">Covariance</h4>
                    <p>A measure of how two assets' returns move together. A positive covariance means they tend to move in the same direction, while a negative covariance means they move in opposite directions.</p>
                </div>
                <div>
                    <h4 className="font-semibold text-foreground mb-1">Standard Deviation (σ)</h4>
                    <p>A measure of the volatility or riskiness of an asset. It indicates how much the asset's returns deviate from their average return.</p>
                </div>
            </AccordionContent>
        </AccordionItem>
        <AccordionItem value="how-it-works">
          <AccordionTrigger>How It Works</AccordionTrigger>
          <AccordionContent className="text-muted-foreground">
            <p>The correlation coefficient standardizes the covariance to provide a value between -1 and +1, making it easier to interpret the strength and direction of the relationship between two assets. It is a fundamental concept in portfolio diversification.</p>
          </AccordionContent>
        </AccordionItem>
        <AccordionItem value="further-reading">
            <AccordionTrigger>Further Reading</AccordionTrigger>
            <AccordionContent className="text-muted-foreground">
                 <a href="https://www.cfainstitute.org/en/membership/professional-development/refresher-readings" target="_blank" rel="noopener noreferrer" className="text-primary underline">CFA Institute – Correlation in Finance</a>
            </AccordionContent>
        </AccordionItem>
      </Accordion>
    </div>
  );
}

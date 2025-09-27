
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
  w1: z.number().min(0).max(100),
  w2: z.number().min(0).max(100),
  s1: z.number().positive(),
  s2: z.number().positive(),
  corr: z.number().min(-1).max(1),
}).refine(data => Math.abs(data.w1 + data.w2 - 100) < 0.01, {
    message: "Weights must add up to 100%",
    path: ['w2'],
});

type FormValues = z.infer<typeof formSchema>;

export default function PortfolioVarianceCalculator() {
  const [result, setResult] = useState<{ variance: number; stdDev: number } | null>(null);

  const form = useForm<FormValues>({
    resolver: zodResolver(formSchema),
    defaultValues: { w1: 50, w2: 50, s1: undefined, s2: undefined, corr: undefined },
  });

  const onSubmit = (values: FormValues) => {
    const { w1, w2, s1, s2, corr } = values;
    const weight1 = w1 / 100;
    const weight2 = w2 / 100;
    const stdDev1 = s1 / 100;
    const stdDev2 = s2 / 100;

    const variance = Math.pow(weight1, 2) * Math.pow(stdDev1, 2) + Math.pow(weight2, 2) * Math.pow(stdDev2, 2) + 2 * weight1 * weight2 * stdDev1 * stdDev2 * corr;
    const stdDev = Math.sqrt(variance);

    setResult({ variance: variance * 10000, stdDev: stdDev * 100 });
  };

  return (
    <div className="space-y-8">
      <CardDescription>Calculates the variance and standard deviation for a two-asset portfolio.</CardDescription>
      <Form {...form}>
        <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-6">
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <FormField control={form.control} name="w1" render={({ field }) => ( <FormItem><FormLabel>Weight of Asset 1 (%)</FormLabel><FormControl><Input type="number" {...field} onChange={e => field.onChange(parseFloat(e.target.value))} /></FormControl><FormMessage /></FormItem> )}/>
            <FormField control={form.control} name="s1" render={({ field }) => ( <FormItem><FormLabel>Std. Dev. of Asset 1 (%)</FormLabel><FormControl><Input type="number" {...field} onChange={e => field.onChange(parseFloat(e.target.value))} /></FormControl><FormMessage /></FormItem> )}/>
            <FormField control={form.control} name="w2" render={({ field }) => ( <FormItem><FormLabel>Weight of Asset 2 (%)</FormLabel><FormControl><Input type="number" {...field} onChange={e => field.onChange(parseFloat(e.target.value))} /></FormControl><FormMessage /></FormItem> )}/>
            <FormField control={form.control} name="s2" render={({ field }) => ( <FormItem><FormLabel>Std. Dev. of Asset 2 (%)</FormLabel><FormControl><Input type="number" {...field} onChange={e => field.onChange(parseFloat(e.target.value))} /></FormControl><FormMessage /></FormItem> )}/>
            <FormField control={form.control} name="corr" render={({ field }) => ( <FormItem className="md:col-span-2"><FormLabel>Correlation Coefficient (-1 to 1)</FormLabel><FormControl><Input type="number" step="0.01" {...field} onChange={e => field.onChange(parseFloat(e.target.value))} /></FormControl><FormMessage /></FormItem> )}/>
          </div>
          <Button type="submit">Calculate Risk</Button>
        </form>
      </Form>
      {result !== null && (
        <Card className="mt-8">
            <CardHeader><div className='flex items-center gap-4'><Landmark className="h-8 w-8 text-primary" /><CardTitle>Portfolio Risk</CardTitle></div></CardHeader>
            <CardContent className="grid grid-cols-2 gap-4 text-center">
                <div>
                    <p className="font-semibold text-lg">Portfolio Variance (σ²)</p>
                    <p className="text-2xl font-bold">{result.variance.toFixed(4)}</p>
                </div>
                <div>
                    <p className="font-semibold text-lg">Portfolio Std. Dev. (σ)</p>
                    <p className="text-2xl font-bold">{result.stdDev.toFixed(2)}%</p>
                </div>
            </CardContent>
        </Card>
      )}
       <Accordion type="single" collapsible className="w-full">
        <AccordionItem value="how-it-works">
            <AccordionTrigger>How It Works</AccordionTrigger>
            <AccordionContent className="text-muted-foreground">
                <p>This calculator computes the risk of a two-asset portfolio. Variance and standard deviation are measures of how much the portfolio's returns are expected to fluctuate. The formula shows that the portfolio's total risk depends not only on the risk of individual assets but also on how they move in relation to each other (their correlation).</p>
            </AccordionContent>
        </AccordionItem>
      </Accordion>
    </div>
  );
}

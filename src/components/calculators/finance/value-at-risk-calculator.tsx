'use client';

import { useState } from 'react';
import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import { z } from 'zod';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Form, FormControl, FormField, FormItem, FormLabel, FormMessage } from '@/components/ui/form';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { TrendingDown } from 'lucide-react';
import { Accordion, AccordionContent, AccordionItem, AccordionTrigger } from '@/components/ui/accordion';

const formSchema = z.object({
  portfolioValue: z.number().positive(),
  expectedReturn: z.number(),
  stdDev: z.number().positive(),
  confidenceLevel: z.coerce.number().min(0),
  timeHorizon: z.number().int().positive(),
});

type FormValues = z.infer<typeof formSchema>;

const zScores: { [key: number]: number } = {
  90: 1.28,
  95: 1.645,
  99: 2.33,
};

export default function ValueAtRiskCalculator() {
  const [result, setResult] = useState<number | null>(null);

  const form = useForm<FormValues>({
    resolver: zodResolver(formSchema),
    defaultValues: {
      portfolioValue: undefined,
      expectedReturn: undefined,
      stdDev: undefined,
      confidenceLevel: 95,
      timeHorizon: undefined,
    },
  });

  const onSubmit = (values: FormValues) => {
    const { portfolioValue, expectedReturn, stdDev, confidenceLevel, timeHorizon } = values;
    const P = portfolioValue;
    const mu = expectedReturn / 100;
    const sigma = stdDev / 100;
    const Z = zScores[confidenceLevel];
    const t = timeHorizon;
    const tradingDays = 252;

    const mu_daily = mu / tradingDays;
    const sigma_daily = sigma / Math.sqrt(tradingDays);

    const var_value = P * (Z * sigma_daily * Math.sqrt(t) - mu_daily * t);
    
    setResult(var_value);
  };

  return (
    <div className="space-y-8">
      <Form {...form}>
        <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-6">
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <FormField control={form.control} name="portfolioValue" render={({ field }) => ( <FormItem><FormLabel>Portfolio Value ($)</FormLabel><FormControl><Input type="number" {...field} value={field.value ?? ''} onChange={e => field.onChange(parseFloat(e.target.value) || undefined)} /></FormControl><FormMessage /></FormItem> )}/>
            <FormField control={form.control} name="expectedReturn" render={({ field }) => ( <FormItem><FormLabel>Expected Annual Return (%)</FormLabel><FormControl><Input type="number" {...field} value={field.value ?? ''} onChange={e => field.onChange(parseFloat(e.target.value) || undefined)} /></FormControl><FormMessage /></FormItem> )}/>
            <FormField control={form.control} name="stdDev" render={({ field }) => ( <FormItem><FormLabel>Annual Standard Deviation (%)</FormLabel><FormControl><Input type="number" {...field} value={field.value ?? ''} onChange={e => field.onChange(parseFloat(e.target.value) || undefined)} /></FormControl><FormMessage /></FormItem> )}/>
            <FormField control={form.control} name="confidenceLevel" render={({ field }) => (
                <FormItem><FormLabel>Confidence Level</FormLabel>
                <Select onValueChange={field.onChange} defaultValue={String(field.value)}><FormControl><SelectTrigger><SelectValue /></SelectTrigger></FormControl><SelectContent>
                    <SelectItem value="90">90%</SelectItem>
                    <SelectItem value="95">95%</SelectItem>
                    <SelectItem value="99">99%</SelectItem>
                </SelectContent></Select>
                </FormItem>
            )} />
             <FormField control={form.control} name="timeHorizon" render={({ field }) => ( <FormItem className="md:col-span-2"><FormLabel>Time Horizon (Days)</FormLabel><FormControl><Input type="number" {...field} value={field.value ?? ''} onChange={e => field.onChange(parseInt(e.target.value) || undefined)} /></FormControl><FormMessage /></FormItem> )}/>
          </div>
          <Button type="submit">Calculate VaR</Button>
        </form>
      </Form>
      {result !== null && (
        <Card className="mt-8">
            <CardHeader><div className='flex items-center gap-4'><TrendingDown className="h-8 w-8 text-primary" /><CardTitle>Value at Risk (VaR)</CardTitle></div></CardHeader>
            <CardContent>
                <div className="text-center">
                    <p className="text-3xl font-bold">${result.toLocaleString(undefined, { maximumFractionDigits: 2 })}</p>
                    <CardDescription className='mt-2'>With {form.getValues('confidenceLevel')}% confidence, your maximum expected loss over the next {form.getValues('timeHorizon')} day(s) is ${result.toLocaleString(undefined, { maximumFractionDigits: 2 })}.</CardDescription>
                </div>
            </CardContent>
        </Card>
      )}
       <Accordion type="single" collapsible className="w-full">
        <AccordionItem value="what-is-var">
          <AccordionTrigger>What is Value at Risk (VaR)?</AccordionTrigger>
          <AccordionContent className="text-muted-foreground">VaR is a statistic used to quantify the level of financial risk within a firm, portfolio, or position over a specific time frame. It estimates how much a set of investments might lose (with a certain probability), given normal market conditions, in a set time period such as a day.</AccordionContent>
        </AccordionItem>
      </Accordion>
    </div>
  );
}
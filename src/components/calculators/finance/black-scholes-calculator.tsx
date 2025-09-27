
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
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';

const formSchema = z.object({
  s: z.number().positive(),
  k: z.number().positive(),
  t: z.number().positive(),
  timeUnit: z.enum(['years', 'months', 'days']),
  r: z.number().nonnegative(),
  v: z.number().positive(),
});

type FormValues = z.infer<typeof formSchema>;

// Abramowitz and Stegun approximation for the cumulative normal distribution function
function CND(x: number) {
  const a1 = 0.31938153;
  const a2 = -0.356563782;
  const a3 = 1.781477937;
  const a4 = -1.821255978;
  const a5 = 1.330274429;
  const p = 0.2316419;
  const c2 = 0.3989423;

  const a = Math.abs(x);
  const t = 1.0 / (1.0 + a * p);
  const b = c2 * Math.exp((-x * x) / 2.0);
  let n = ((((a5 * t + a4) * t + a3) * t + a2) * t + a1) * t;
  n = 1.0 - b * n;
  if (x < 0) n = 1.0 - n;
  return n;
}

export default function BlackScholesCalculator() {
  const [result, setResult] = useState<{ call: number; put: number } | null>(null);

  const form = useForm<FormValues>({
    resolver: zodResolver(formSchema),
    defaultValues: { s: undefined, k: undefined, t: undefined, r: undefined, v: undefined, timeUnit: 'years' },
  });

  const onSubmit = (values: FormValues) => {
    const { s, k, t, timeUnit, r, v } = values;
    const rate = r / 100;
    const volatility = v / 100;

    let tInYears = t;
    if (timeUnit === 'months') tInYears /= 12;
    if (timeUnit === 'days') tInYears /= 365;

    const d1 = (Math.log(s / k) + (rate + Math.pow(volatility, 2) / 2) * tInYears) / (volatility * Math.sqrt(tInYears));
    const d2 = d1 - volatility * Math.sqrt(tInYears);

    const callPrice = s * CND(d1) - k * Math.exp(-rate * tInYears) * CND(d2);
    const putPrice = k * Math.exp(-rate * tInYears) * CND(-d2) - s * CND(-d1);
    
    setResult({ call: callPrice, put: putPrice });
  };

  return (
    <div className="space-y-8">
      <Form {...form}>
        <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-6">
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <FormField control={form.control} name="s" render={({ field }) => ( <FormItem><FormLabel>Stock Price (S)</FormLabel><FormControl><Input type="number" {...field} value={field.value ?? ''} onChange={e => field.onChange(parseFloat(e.target.value) || undefined)} /></FormControl><FormMessage /></FormItem> )}/>
            <FormField control={form.control} name="k" render={({ field }) => ( <FormItem><FormLabel>Strike Price (K)</FormLabel><FormControl><Input type="number" {...field} value={field.value ?? ''} onChange={e => field.onChange(parseFloat(e.target.value) || undefined)} /></FormControl><FormMessage /></FormItem> )}/>
            <div className="grid grid-cols-2 gap-2">
                <FormField control={form.control} name="t" render={({ field }) => ( <FormItem><FormLabel>Time to Expiration</FormLabel><FormControl><Input type="number" {...field} value={field.value ?? ''} onChange={e => field.onChange(parseFloat(e.target.value) || undefined)} /></FormControl><FormMessage /></FormItem> )}/>
                <FormField control={form.control} name="timeUnit" render={({ field }) => (
                    <FormItem><FormLabel>Unit</FormLabel>
                        <Select onValueChange={field.onChange} defaultValue={field.value}>
                            <FormControl><SelectTrigger><SelectValue/></SelectTrigger></FormControl>
                            <SelectContent>
                                <SelectItem value="years">Years</SelectItem>
                                <SelectItem value="months">Months</SelectItem>
                                <SelectItem value="days">Days</SelectItem>
                            </SelectContent>
                        </Select>
                    </FormItem>
                )} />
            </div>
            <FormField control={form.control} name="r" render={({ field }) => ( <FormItem><FormLabel>Risk-Free Rate (r) %</FormLabel><FormControl><Input type="number" {...field} value={field.value ?? ''} onChange={e => field.onChange(parseFloat(e.target.value) || undefined)} /></FormControl><FormMessage /></FormItem> )}/>
            <FormField control={form.control} name="v" render={({ field }) => ( <FormItem className="md:col-span-2"><FormLabel>Volatility (σ) %</FormLabel><FormControl><Input type="number" {...field} value={field.value ?? ''} onChange={e => field.onChange(parseFloat(e.target.value) || undefined)} /></FormControl><FormMessage /></FormItem> )}/>
          </div>
          <Button type="submit">Calculate</Button>
        </form>
      </Form>
      {result !== null && (
        <Card className="mt-8">
            <CardHeader><div className='flex items-center gap-4'><Landmark className="h-8 w-8 text-primary" /><CardTitle>Theoretical Option Prices</CardTitle></div></CardHeader>
            <CardContent className="grid grid-cols-2 gap-4 text-center">
                <div>
                    <p className="font-semibold text-lg">Call Price</p>
                    <p className="text-2xl font-bold">${result.call.toFixed(2)}</p>
                </div>
                <div>
                    <p className="font-semibold text-lg">Put Price</p>
                    <p className="text-2xl font-bold">${result.put.toFixed(2)}</p>
                </div>
            </CardContent>
        </Card>
      )}
       <Accordion type="single" collapsible className="w-full">
         <AccordionItem value="understanding-inputs">
            <AccordionTrigger>Understanding the Inputs</AccordionTrigger>
            <AccordionContent className="text-muted-foreground space-y-4">
                <div>
                    <h4 className="font-semibold text-foreground mb-1">Stock Price (S)</h4>
                    <p>The current market price of the underlying asset.</p>
                </div>
                <div>
                    <h4 className="font-semibold text-foreground mb-1">Strike Price (K)</h4>
                    <p>The price at which the option can be exercised.</p>
                </div>
                 <div>
                    <h4 className="font-semibold text-foreground mb-1">Time to Expiration (T)</h4>
                    <p>The time remaining until the option expires, expressed in years.</p>
                </div>
                 <div>
                    <h4 className="font-semibold text-foreground mb-1">Risk-Free Rate (r)</h4>
                    <p>The annualized rate of return on a risk-free investment (e.g., a government bond).</p>
                </div>
                 <div>
                    <h4 className="font-semibold text-foreground mb-1">Volatility (σ)</h4>
                    <p>The annualized standard deviation of the stock's returns, representing its expected price fluctuations.</p>
                </div>
            </AccordionContent>
        </AccordionItem>
        <AccordionItem value="how-it-works">
            <AccordionTrigger>How It Works</AccordionTrigger>
            <AccordionContent className="text-muted-foreground">
                The Black-Scholes model is a mathematical equation used to price European-style options, which can only be exercised at expiration. It calculates a theoretical value for call and put options by considering the six key variables you provide. This implementation uses a mathematical approximation for the cumulative normal distribution function (CNDF), a core component of the model.
            </AccordionContent>
        </AccordionItem>
      </Accordion>
    </div>
  );
}

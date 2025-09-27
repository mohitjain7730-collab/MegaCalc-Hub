
'use client';

import { useState } from 'react';
import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import { z } from 'zod';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Form, FormControl, FormField, FormItem, FormLabel, FormMessage } from '@/components/ui/form';
import { RadioGroup, RadioGroupItem } from '@/components/ui/radio-group';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Landmark } from 'lucide-react';
import { Accordion, AccordionContent, AccordionItem, AccordionTrigger } from '@/components/ui/accordion';

const formSchema = z.object({
  s: z.number().positive(),
  k: z.number().positive(),
  t: z.number().positive(),
  r: z.number().nonnegative(),
  marketPrice: z.number().positive(),
  optionType: z.enum(['call', 'put']),
});

type FormValues = z.infer<typeof formSchema>;

// Black-Scholes model and its CNDF approximation
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

function blackScholes(s: number, k: number, t: number, r: number, v: number, type: 'call' | 'put') {
    const d1 = (Math.log(s / k) + (r + Math.pow(v, 2) / 2) * t) / (v * Math.sqrt(t));
    const d2 = d1 - v * Math.sqrt(t);
    if (type === 'call') {
        return s * CND(d1) - k * Math.exp(-r * t) * CND(d2);
    } else {
        return k * Math.exp(-r * t) * CND(-d2) - s * CND(-d1);
    }
}

export default function ImpliedVolatilityCalculator() {
  const [result, setResult] = useState<number | null>(null);
  const [error, setError] = useState<string | null>(null);

  const form = useForm<FormValues>({
    resolver: zodResolver(formSchema),
    defaultValues: { s: undefined, k: undefined, t: undefined, r: undefined, marketPrice: undefined, optionType: 'call' },
  });

  const onSubmit = (values: FormValues) => {
    setResult(null);
    setError(null);
    const { s, k, t, r, marketPrice, optionType } = values;
    const rate = r / 100;
    
    let low = 0;
    let high = 5; // Start with a high volatility range (500%)
    let mid = (low + high) / 2;
    const maxIterations = 100;
    let i = 0;

    while (i < maxIterations) {
        mid = (low + high) / 2;
        if (mid < 1e-5) { // Prevent volatility from being too low
            mid = 1e-5;
        }
        const price = blackScholes(s, k, t, rate, mid, optionType);
        
        if (Math.abs(price - marketPrice) < 1e-5) { // Found a close enough value
            setResult(mid * 100);
            return;
        }

        if (price > marketPrice) {
            high = mid;
        } else {
            low = mid;
        }
        i++;
    }
    setError("Could not converge on a volatility. Check input values.");
  };

  return (
    <div className="space-y-8">
      <Form {...form}>
        <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-6">
          <FormField control={form.control} name="optionType" render={({ field }) => (
            <FormItem className="space-y-3"><FormLabel>Option Type</FormLabel><FormControl>
                <RadioGroup onValueChange={field.onChange} defaultValue={field.value} className="flex space-x-4">
                  <FormItem className="flex items-center space-x-2"><FormControl><RadioGroupItem value="call" /></FormControl><FormLabel className="font-normal">Call</FormLabel></FormItem>
                  <FormItem className="flex items-center space-x-2"><FormControl><RadioGroupItem value="put" /></FormControl><FormLabel className="font-normal">Put</FormLabel></FormItem>
                </RadioGroup>
            </FormControl></FormItem>
          )} />
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <FormField control={form.control} name="marketPrice" render={({ field }) => ( <FormItem><FormLabel>Option Market Price</FormLabel><FormControl><Input type="number" {...field} value={field.value ?? ''} onChange={e => field.onChange(parseFloat(e.target.value) || undefined)} /></FormControl><FormMessage /></FormItem> )}/>
            <FormField control={form.control} name="s" render={({ field }) => ( <FormItem><FormLabel>Stock Price (S)</FormLabel><FormControl><Input type="number" {...field} value={field.value ?? ''} onChange={e => field.onChange(parseFloat(e.target.value) || undefined)} /></FormControl><FormMessage /></FormItem> )}/>
            <FormField control={form.control} name="k" render={({ field }) => ( <FormItem><FormLabel>Strike Price (K)</FormLabel><FormControl><Input type="number" {...field} value={field.value ?? ''} onChange={e => field.onChange(parseFloat(e.target.value) || undefined)} /></FormControl><FormMessage /></FormItem> )}/>
            <FormField control={form.control} name="t" render={({ field }) => ( <FormItem><FormLabel>Time to Expiration (T, years)</FormLabel><FormControl><Input type="number" {...field} value={field.value ?? ''} onChange={e => field.onChange(parseFloat(e.target.value) || undefined)} /></FormControl><FormMessage /></FormItem> )}/>
            <FormField control={form.control} name="r" render={({ field }) => ( <FormItem className="md:col-span-2"><FormLabel>Risk-Free Rate (r) %</FormLabel><FormControl><Input type="number" {...field} value={field.value ?? ''} onChange={e => field.onChange(parseFloat(e.target.value) || undefined)} /></FormControl><FormMessage /></FormItem> )}/>
          </div>
          <Button type="submit">Calculate Implied Volatility</Button>
        </form>
      </Form>
      {error && <p className="text-red-500 mt-4">{error}</p>}
      {result !== null && (
        <Card className="mt-8">
            <CardHeader><div className='flex items-center gap-4'><Landmark className="h-8 w-8 text-primary" /><CardTitle>Implied Volatility (σ)</CardTitle></div></CardHeader>
            <CardContent>
                <p className="text-3xl font-bold text-center">{result.toFixed(2)}%</p>
                <CardDescription className='mt-4 text-center'>This is the market's expectation of the stock's future volatility.</CardDescription>
            </CardContent>
        </Card>
      )}
       <Accordion type="single" collapsible className="w-full">
        <AccordionItem value="how-it-works">
            <AccordionTrigger>How It Works</AccordionTrigger>
            <AccordionContent className="text-muted-foreground">
                Implied volatility is the one input to the Black-Scholes model that is not directly observable. Instead, it is solved for by using the market price of the option. This calculator uses an iterative bisection method to find the volatility value that makes the theoretical price from the Black-Scholes formula match the given market price.
            </AccordionContent>
        </AccordionItem>
      </Accordion>
    </div>
  );
}


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
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';

const formSchema = z.object({
  s: z.number().positive(), // Spot price
  k: z.number().positive(), // Strike price
  t: z.number().positive(), // Time to expiration
  timeUnit: z.enum(['years', 'months', 'days']),
  r: z.number().positive(), // Risk-free rate
  u: z.number().positive(), // Up factor
  d: z.number().positive(), // Down factor
  optionType: z.enum(['call', 'put']),
}).refine(data => data.u > 1, {
  message: 'Up factor (u) must be > 1',
  path: ['u'],
}).refine(data => data.d < 1, {
  message: 'Down factor (d) must be < 1',
  path: ['d'],
}).refine(data => {
    if(!data.r) return true;
    let tInYears = data.t;
    if (data.timeUnit === 'months') tInYears /= 12;
    if (data.timeUnit === 'days') tInYears /= 365;

    return (Math.exp(data.r / 100 * tInYears)) > data.d && (Math.exp(data.r / 100 * tInYears)) < data.u
}, {
    message: 'Arbitrage opportunity exists. Ensure d < e^(r*t) < u.',
    path: ['r'],
});

type FormValues = z.infer<typeof formSchema>;

export default function BinomialOptionPricingCalculator() {
  const [result, setResult] = useState<number | null>(null);

  const form = useForm<FormValues>({
    resolver: zodResolver(formSchema),
    defaultValues: { s: undefined, k: undefined, t: undefined, r: undefined, u: undefined, d: undefined, optionType: 'call', timeUnit: 'years' },
  });

  const onSubmit = (values: FormValues) => {
    const { s, k, t, timeUnit, r, u, d, optionType } = values;
    const rate = r / 100;

    let tInYears = t;
    if (timeUnit === 'months') {
        tInYears = t / 12;
    } else if (timeUnit === 'days') {
        tInYears = t / 365;
    }

    // 1. Calculate risk-neutral probability 'p'
    const p = (Math.exp(rate * tInYears) - d) / (u - d);
    if(p < 0 || p > 1) {
        form.setError("r", { message: "Invalid risk-neutral probability. Check inputs."});
        setResult(null);
        return;
    }

    // 2. Calculate stock prices at expiration
    const s_up = s * u;
    const s_down = s * d;

    // 3. Calculate option values at expiration
    const c_up = optionType === 'call' ? Math.max(0, s_up - k) : Math.max(0, k - s_up);
    const c_down = optionType === 'call' ? Math.max(0, s_down - k) : Math.max(0, k - s_down);

    // 4. Discount back to present value
    const optionPrice = Math.exp(-rate * tInYears) * (p * c_up + (1 - p) * c_down);
    setResult(optionPrice);
  };

  return (
    <div className="space-y-8">
      <Form {...form}>
        <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-6">
          <CardDescription>Calculates option price using a one-step binomial model.</CardDescription>
          <FormField control={form.control} name="optionType" render={({ field }) => (
            <FormItem className="space-y-3"><FormLabel>Option Type</FormLabel><FormControl>
                <RadioGroup onValueChange={field.onChange} defaultValue={field.value} className="flex space-x-4">
                  <FormItem className="flex items-center space-x-2"><FormControl><RadioGroupItem value="call" /></FormControl><FormLabel className="font-normal">Call</FormLabel></FormItem>
                  <FormItem className="flex items-center space-x-2"><FormControl><RadioGroupItem value="put" /></FormControl><FormLabel className="font-normal">Put</FormLabel></FormItem>
                </RadioGroup>
            </FormControl></FormItem>
          )} />
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <FormField control={form.control} name="s" render={({ field }) => ( <FormItem><FormLabel>Spot Price (S)</FormLabel><FormControl><Input type="number" {...field} value={field.value ?? ''} onChange={e => field.onChange(e.target.value === '' ? undefined : parseFloat(e.target.value))} /></FormControl><FormMessage /></FormItem> )}/>
            <FormField control={form.control} name="k" render={({ field }) => ( <FormItem><FormLabel>Strike Price (K)</FormLabel><FormControl><Input type="number" {...field} value={field.value ?? ''} onChange={e => field.onChange(e.target.value === '' ? undefined : parseFloat(e.target.value))} /></FormControl><FormMessage /></FormItem> )}/>
            <div className="grid grid-cols-2 gap-2">
                <FormField control={form.control} name="t" render={({ field }) => ( <FormItem><FormLabel>Time to Expiration</FormLabel><FormControl><Input type="number" {...field} value={field.value ?? ''} onChange={e => field.onChange(e.target.value === '' ? undefined : parseFloat(e.target.value))} /></FormControl><FormMessage /></FormItem> )}/>
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
            <FormField control={form.control} name="r" render={({ field }) => ( <FormItem><FormLabel>Risk-Free Rate (r) %</FormLabel><FormControl><Input type="number" {...field} value={field.value ?? ''} onChange={e => field.onChange(e.target.value === '' ? undefined : parseFloat(e.target.value))} /></FormControl><FormMessage /></FormItem> )}/>
            <FormField control={form.control} name="u" render={({ field }) => ( <FormItem><FormLabel>Up Factor (u)</FormLabel><FormControl><Input type="number" step="any" {...field} value={field.value ?? ''} onChange={e => field.onChange(e.target.value === '' ? undefined : parseFloat(e.target.value))} /></FormControl><FormMessage /></FormItem> )}/>
            <FormField control={form.control} name="d" render={({ field }) => ( <FormItem><FormLabel>Down Factor (d)</FormLabel><FormControl><Input type="number" step="any" {...field} value={field.value ?? ''} onChange={e => field.onChange(e.target.value === '' ? undefined : parseFloat(e.target.value))} /></FormControl><FormMessage /></FormItem> )}/>
          </div>
          <Button type="submit">Calculate Option Price</Button>
        </form>
      </Form>
      {result !== null && (
        <Card className="mt-8">
            <CardHeader><div className='flex items-center gap-4'><Landmark className="h-8 w-8 text-primary" /><CardTitle>Theoretical Option Price</CardTitle></div></CardHeader>
            <CardContent>
                <p className="text-3xl font-bold text-center">${result.toFixed(2)}</p>
                <CardDescription className='mt-4 text-center'>This is the estimated value based on a one-step binomial model.</CardDescription>
            </CardContent>
        </Card>
      )}
       <Accordion type="single" collapsible className="w-full">
         <AccordionItem value="understanding-inputs">
            <AccordionTrigger>Understanding the Inputs</AccordionTrigger>
            <AccordionContent className="text-muted-foreground space-y-4">
                <div>
                    <h4 className="font-semibold text-foreground mb-1">Spot Price (S)</h4>
                    <p>The current market price of the underlying asset (e.g., the stock).</p>
                </div>
                <div>
                    <h4 className="font-semibold text-foreground mb-1">Strike Price (K)</h4>
                    <p>The price at which the option holder can buy (call) or sell (put) the underlying asset.</p>
                </div>
                 <div>
                    <h4 className="font-semibold text-foreground mb-1">Time to Expiration (T)</h4>
                    <p>The time remaining until the option expires.</p>
                </div>
                <div>
                    <h4 className="font-semibold text-foreground mb-1">Risk-Free Rate (r) %</h4>
                    <p>The annualized rate of return of a virtually risk-free investment, like a government bond.</p>
                </div>
                 <div>
                    <h4 className="font-semibold text-foreground mb-1">Up Factor (u) & Down Factor (d)</h4>
                    <p>These represent the multiplicative factors for the two possible movements of the stock price in one time step. `u` must be greater than 1, and `d` must be less than 1.</p>
                </div>
            </AccordionContent>
        </AccordionItem>
        <AccordionItem value="how-it-works">
            <AccordionTrigger>How It Works</AccordionTrigger>
            <AccordionContent className="text-muted-foreground space-y-2">
                <p>The binomial model simplifies the possible evolution of the stock price into a tree of discrete up or down movements over time. This one-step version calculates the option's value at two possible future states (up or down) and then discounts it back to the present using risk-neutral probabilities.</p>
                <ol className="list-decimal list-inside space-y-2">
                  <li><strong>Calculate Future Stock Prices:</strong> The model determines two possible stock prices at expiration: an "up" price (S * u) and a "down" price (S * d).</li>
                  <li><strong>Calculate Option Payoffs:</strong> It calculates the option's value (payoff) at each of these two future prices. For a call, this is `max(0, Future Price - Strike Price)`; for a put, it's `max(0, Strike Price - Future Price)`.</li>
                  <li><strong>Calculate Risk-Neutral Probability (p):</strong> It calculates the probability of an upward movement in a risk-neutral world. This isn't the real-world probability, but a theoretical one that ensures the option price is arbitrage-free.</li>
                  <li><strong>Discount to Present Value:</strong> The expected future payoff (a weighted average of the up and down payoffs using the risk-neutral probability) is discounted back to today using the risk-free rate. The result is the theoretical price of the option.</li>
                </ol>
            </AccordionContent>
        </AccordionItem>
      </Accordion>
    </div>
  );
}


'use client';

import { useState } from 'react';
import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import { z } from 'zod';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Form, FormControl, FormField, FormItem, FormLabel, FormMessage } from '@/components/ui/form';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Bot } from 'lucide-react';
import { Alert, AlertTitle, AlertDescription } from '@/components/ui/alert';
import { Accordion, AccordionContent, AccordionItem, AccordionTrigger } from '@/components/ui/accordion';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';

const formSchema = z.object({
  stockPrice: z.number().positive(),
  strikePrice: z.number().positive(),
  callPrice: z.number().positive(),
  putPrice: z.number().positive(),
  rate: z.number().nonnegative(),
  time: z.number().positive(),
  timeUnit: z.enum(['years', 'months', 'days']),
});

type FormValues = z.infer<typeof formSchema>;

interface Result {
    leftSide: number;
    rightSide: number;
    difference: number;
    arbitrage: string | null;
}

export default function PutCallParityCalculator() {
  const [result, setResult] = useState<Result | null>(null);

  const form = useForm<FormValues>({
    resolver: zodResolver(formSchema),
    defaultValues: {
      stockPrice: undefined,
      strikePrice: undefined,
      callPrice: undefined,
      putPrice: undefined,
      rate: undefined,
      time: undefined,
      timeUnit: 'years',
    },
  });

  const onSubmit = (values: FormValues) => {
    const { stockPrice, strikePrice, callPrice, putPrice, rate, time, timeUnit } = values;
    const r = rate / 100;
    
    let tInYears = time;
    if (timeUnit === 'months') tInYears /= 12;
    if (timeUnit === 'days') tInYears /= 365;
    
    const leftSide = putPrice + stockPrice;
    const rightSide = callPrice + strikePrice * Math.exp(-r * tInYears);
    const difference = leftSide - rightSide;
    
    let arbitrage = null;
    if (Math.abs(difference) > 0.01) { // Allowing for small rounding differences
        if (difference > 0) {
            arbitrage = "The protective put is overpriced. Strategy: Sell the put, sell the stock, buy the call, and invest the present value of the strike price.";
        } else {
            arbitrage = "The fiduciary call is overpriced. Strategy: Buy the put, buy the stock, sell the call, and borrow the present value of the strike price.";
        }
    }

    setResult({ leftSide, rightSide, difference, arbitrage });
  };

  return (
    <div className="space-y-8">
      <Form {...form}>
        <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-6">
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <FormField control={form.control} name="stockPrice" render={({ field }) => (<FormItem><FormLabel>Stock Price ($)</FormLabel><FormControl><Input type="number" {...field} value={field.value ?? ''} onChange={e => field.onChange(parseFloat(e.target.value) || undefined)} /></FormControl><FormMessage /></FormItem>)} />
            <FormField control={form.control} name="strikePrice" render={({ field }) => (<FormItem><FormLabel>Strike Price ($)</FormLabel><FormControl><Input type="number" {...field} value={field.value ?? ''} onChange={e => field.onChange(parseFloat(e.target.value) || undefined)} /></FormControl><FormMessage /></FormItem>)} />
            <FormField control={form.control} name="callPrice" render={({ field }) => (<FormItem><FormLabel>Call Option Price ($)</FormLabel><FormControl><Input type="number" {...field} value={field.value ?? ''} onChange={e => field.onChange(parseFloat(e.target.value) || undefined)} /></FormControl><FormMessage /></FormItem>)} />
            <FormField control={form.control} name="putPrice" render={({ field }) => (<FormItem><FormLabel>Put Option Price ($)</FormLabel><FormControl><Input type="number" {...field} value={field.value ?? ''} onChange={e => field.onChange(parseFloat(e.target.value) || undefined)} /></FormControl><FormMessage /></FormItem>)} />
            <FormField control={form.control} name="rate" render={({ field }) => (<FormItem><FormLabel>Risk-Free Rate (%)</FormLabel><FormControl><Input type="number" {...field} value={field.value ?? ''} onChange={e => field.onChange(parseFloat(e.target.value) || undefined)} /></FormControl><FormMessage /></FormItem>)} />
            <div className="grid grid-cols-2 gap-2">
                <FormField control={form.control} name="time" render={({ field }) => ( <FormItem><FormLabel>Time to Expiration</FormLabel><FormControl><Input type="number" {...field} value={field.value ?? ''} onChange={e => field.onChange(e.target.value === '' ? undefined : parseFloat(e.target.value))} /></FormControl><FormMessage /></FormItem> )}/>
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
          </div>
          <Button type="submit">Check Parity</Button>
        </form>
      </Form>
      {result && (
        <Card className="mt-8">
          <CardHeader><div className='flex items-center gap-4'><Bot className="h-8 w-8 text-primary" /><CardTitle>Put-Call Parity Analysis</CardTitle></div></CardHeader>
          <CardContent>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4 text-center mb-6">
              <div><p className="font-semibold">Put + Stock (P + S₀)</p><p className="text-xl font-mono">${result.leftSide.toFixed(4)}</p></div>
              <div><p className="font-semibold">Call + PV(Strike) (C + Ke⁻ʳᵀ)</p><p className="text-xl font-mono">${result.rightSide.toFixed(4)}</p></div>
            </div>
            {result.arbitrage ? (
                <Alert variant="destructive">
                    <AlertTitle>Arbitrage Opportunity Detected!</AlertTitle>
                    <AlertDescription>{result.arbitrage}</AlertDescription>
                </Alert>
            ) : (
                <Alert>
                    <AlertTitle>Parity Holds</AlertTitle>
                    <AlertDescription>No arbitrage opportunity detected based on these prices.</AlertDescription>
                </Alert>
            )}
          </CardContent>
        </Card>
      )}
       <Accordion type="single" collapsible className="w-full">
        <AccordionItem value="how-it-works">
            <AccordionTrigger>How It Works</AccordionTrigger>
            <AccordionContent className="text-muted-foreground">
                <p>Put-call parity is a fundamental principle in options pricing that shows the relationship between the price of a European call option and a European put option, both with the same underlying asset, strike price, and expiration date. In an efficient market, the relationship must hold true to prevent risk-free arbitrage opportunities.</p>
                <p className="mt-2">This calculator checks if the two sides of the parity equation are equal. If they are not, it suggests a strategy to capture a risk-free profit by buying the underpriced portfolio and selling the overpriced one.</p>
            </AccordionContent>
        </AccordionItem>
        <AccordionItem value="formula-explained">
            <AccordionTrigger>Understanding the Formula</AccordionTrigger>
            <AccordionContent className="text-muted-foreground space-y-2">
                <p className='font-mono p-4 bg-muted rounded-md'>P + S₀ = C + Ke⁻ʳᵀ</p>
                <ul className="list-disc list-inside space-y-2">
                    <li><strong>P + S₀ (Protective Put):</strong> The value of a portfolio containing one put option plus one share of the underlying stock. This combination guarantees a minimum sale price (the strike price) for the stock.</li>
                    <li><strong>C + Ke⁻ʳᵀ (Fiduciary Call):</strong> The value of a portfolio containing one call option plus a risk-free bond that will be worth the strike price (K) at expiration. The `e⁻ʳᵀ` term calculates the present value of that future strike price.</li>
                    <li>The principle states that these two portfolios must have the same value today because they have the exact same payoff at expiration.</li>
                </ul>
            </AccordionContent>
        </AccordionItem>
      </Accordion>
    </div>
  );
}

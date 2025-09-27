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

const formSchema = z.object({
  stockPrice: z.number().positive(),
  strikePrice: z.number().positive(),
  callPrice: z.number().positive(),
  putPrice: z.number().positive(),
  rate: z.number().nonnegative(),
  time: z.number().positive(),
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
    },
  });

  const onSubmit = (values: FormValues) => {
    const { stockPrice, strikePrice, callPrice, putPrice, rate, time } = values;
    const r = rate / 100;
    
    const leftSide = putPrice + stockPrice;
    const rightSide = callPrice + strikePrice * Math.exp(-r * time);
    const difference = leftSide - rightSide;
    
    let arbitrage = null;
    if (Math.abs(difference) > 0.01) { // Allowing for small rounding differences
        if (difference > 0) {
            arbitrage = "Left side is greater. Strategy: Sell the put, sell the stock, buy the call, and invest the present value of the strike price.";
        } else {
            arbitrage = "Right side is greater. Strategy: Sell the call, short the stock, buy the put, and borrow the present value of the strike price.";
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
            <FormField control={form.control} name="time" render={({ field }) => (<FormItem><FormLabel>Time to Expiration (Years)</FormLabel><FormControl><Input type="number" {...field} value={field.value ?? ''} onChange={e => field.onChange(parseFloat(e.target.value) || undefined)} /></FormControl><FormMessage /></FormItem>)} />
          </div>
          <Button type="submit">Check Parity</Button>
        </form>
      </Form>
      {result && (
        <Card className="mt-8">
          <CardHeader><div className='flex items-center gap-4'><Bot className="h-8 w-8 text-primary" /><CardTitle>Put-Call Parity Analysis</CardTitle></div></CardHeader>
          <CardContent>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4 text-center mb-6">
              <div><p className="font-semibold">Put + Stock</p><p className="text-xl font-mono">${result.leftSide.toFixed(4)}</p></div>
              <div><p className="font-semibold">Call + PV(Strike)</p><p className="text-xl font-mono">${result.rightSide.toFixed(4)}</p></div>
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
    </div>
  );
}

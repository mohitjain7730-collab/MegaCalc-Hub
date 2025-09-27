
'use client';

import { useState } from 'react';
import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import { z } from 'zod';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Form, FormControl, FormField, FormItem, FormLabel, FormMessage } from '@/components/ui/form';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { PhoneCall } from 'lucide-react';
import { Accordion, AccordionContent, AccordionItem, AccordionTrigger } from '@/components/ui/accordion';

const formSchema = z.object({
  currentPrice: z.number().positive(),
  faceValue: z.number().positive(),
  couponRate: z.number().nonnegative(),
  yearsToCall: z.number().positive(),
  callPrice: z.number().positive(),
  paymentsPerYear: z.number().int().positive(),
  yearsToMaturity: z.number().positive(),
});

type FormValues = z.infer<typeof formSchema>;

export default function YieldToCallCalculator() {
  const [result, setResult] = useState<{ ytc: number; ytm: number, ytw: number } | null>(null);

  const form = useForm<FormValues>({
    resolver: zodResolver(formSchema),
    defaultValues: {
        currentPrice: undefined,
        faceValue: undefined,
        couponRate: undefined,
        yearsToCall: undefined,
        callPrice: undefined,
        paymentsPerYear: undefined,
        yearsToMaturity: undefined,
    },
  });

  const calculatePresentValue = (yieldRate: number, values: FormValues, useCallDate: boolean): number => {
    const { faceValue, couponRate, yearsToCall, callPrice, paymentsPerYear, yearsToMaturity } = values;
    const y = yieldRate / paymentsPerYear;
    const C = (couponRate / 100) * faceValue / paymentsPerYear;
    
    const n = useCallDate ? yearsToCall * paymentsPerYear : yearsToMaturity * paymentsPerYear;
    const finalValue = useCallDate ? callPrice : faceValue;

    let price = 0;
    for (let t = 1; t <= n; t++) {
      price += C / Math.pow(1 + y, t);
    }
    price += finalValue / Math.pow(1 + y, n);
    return price;
  };

  const solveForYield = (values: FormValues, useCallDate: boolean): number => {
    let low = 0;
    let high = 1; // 100%
    let yieldRate = 0;

    for (let i = 0; i < 100; i++) {
      yieldRate = (low + high) / 2;
      const priceAtYield = calculatePresentValue(yieldRate, values, useCallDate);
      if (priceAtYield > values.currentPrice) {
        low = yieldRate;
      } else {
        high = yieldRate;
      }
    }
    return yieldRate * 100;
  };

  const onSubmit = (values: FormValues) => {
    const ytc = solveForYield(values, true);
    const ytm = solveForYield(values, false);
    const ytw = Math.min(ytc, ytm);
    setResult({ ytc, ytm, ytw });
  };

  return (
    <div className="space-y-8">
      <Form {...form}>
        <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-6">
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <FormField control={form.control} name="currentPrice" render={({ field }) => (<FormItem><FormLabel>Current Price ($)</FormLabel><FormControl><Input type="number" {...field} value={field.value ?? ''} onChange={e => field.onChange(parseFloat(e.target.value) || undefined)} /></FormControl><FormMessage /></FormItem>)} />
            <FormField control={form.control} name="faceValue" render={({ field }) => (<FormItem><FormLabel>Face Value ($)</FormLabel><FormControl><Input type="number" {...field} value={field.value ?? ''} onChange={e => field.onChange(parseFloat(e.target.value) || undefined)} /></FormControl><FormMessage /></FormItem>)} />
            <FormField control={form.control} name="couponRate" render={({ field }) => (<FormItem><FormLabel>Annual Coupon Rate (%)</FormLabel><FormControl><Input type="number" {...field} value={field.value ?? ''} onChange={e => field.onChange(parseFloat(e.target.value) || undefined)} /></FormControl><FormMessage /></FormItem>)} />
            <FormField control={form.control} name="paymentsPerYear" render={({ field }) => (<FormItem><FormLabel>Payments per Year</FormLabel><FormControl><Input type="number" {...field} value={field.value ?? ''} onChange={e => field.onChange(parseInt(e.target.value) || undefined)} /></FormControl><FormMessage /></FormItem>)} />
            <FormField control={form.control} name="yearsToCall" render={({ field }) => (<FormItem><FormLabel>Years to Call</FormLabel><FormControl><Input type="number" {...field} value={field.value ?? ''} onChange={e => field.onChange(parseFloat(e.target.value) || undefined)} /></FormControl><FormMessage /></FormItem>)} />
            <FormField control={form.control} name="callPrice" render={({ field }) => (<FormItem><FormLabel>Call Price ($)</FormLabel><FormControl><Input type="number" {...field} value={field.value ?? ''} onChange={e => field.onChange(parseFloat(e.target.value) || undefined)} /></FormControl><FormMessage /></FormItem>)} />
             <FormField control={form.control} name="yearsToMaturity" render={({ field }) => (<FormItem className="md:col-span-2"><FormLabel>Years to Maturity</FormLabel><FormControl><Input type="number" {...field} value={field.value ?? ''} onChange={e => field.onChange(parseFloat(e.target.value) || undefined)} /></FormControl><FormMessage /></FormItem>)} />
          </div>
          <Button type="submit">Calculate</Button>
        </form>
      </Form>
      {result !== null && (
        <Card className="mt-8">
          <CardHeader><div className='flex items-center gap-4'><PhoneCall className="h-8 w-8 text-primary" /><CardTitle>Bond Yields</CardTitle></div></CardHeader>
          <CardContent>
            <div className="grid grid-cols-1 md:grid-cols-3 gap-4 text-center">
              <div><CardDescription>Yield to Call (YTC)</CardDescription><p className="text-xl font-bold">{result.ytc.toFixed(4)}%</p></div>
              <div><CardDescription>Yield to Maturity (YTM)</CardDescription><p className="text-xl font-bold">{result.ytm.toFixed(4)}%</p></div>
              <div className="p-4 bg-primary/10 rounded-lg"><CardDescription>Yield to Worst (YTW)</CardDescription><p className="text-2xl font-bold text-primary">{result.ytw.toFixed(4)}%</p></div>
            </div>
            <CardDescription className='mt-4 text-center'>Yield to Worst is the lowest possible yield an investor can expect, making it a crucial metric for risk assessment.</CardDescription>
          </CardContent>
        </Card>
      )}
      <Accordion type="single" collapsible className="w-full">
        <AccordionItem value="how-it-works">
          <AccordionTrigger>How It Works</AccordionTrigger>
          <AccordionContent className="text-muted-foreground">YTC is calculated like YTM, but using the call date and call price instead of the maturity date and face value. The calculator then compares the YTC to the YTM and reports the lower of the two as the Yield to Worst (YTW). This gives investors the most conservative scenario for their potential return.</AccordionContent>
        </AccordionItem>
      </Accordion>
    </div>
  );
}

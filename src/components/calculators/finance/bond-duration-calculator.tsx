'use client';

import { useState } from 'react';
import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import { z } from 'zod';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Form, FormControl, FormField, FormItem, FormLabel, FormMessage } from '@/components/ui/form';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Clock } from 'lucide-react';
import { Accordion, AccordionContent, AccordionItem, AccordionTrigger } from '@/components/ui/accordion';

const formSchema = z.object({
  faceValue: z.number().positive(),
  couponRate: z.number().nonnegative(),
  years: z.number().positive(),
  paymentsPerYear: z.number().int().positive(),
  ytm: z.number().positive(),
});

type FormValues = z.infer<typeof formSchema>;

export default function BondDurationCalculator() {
  const [result, setResult] = useState<{ macaulay: number; modified: number } | null>(null);

  const form = useForm<FormValues>({
    resolver: zodResolver(formSchema),
    defaultValues: {
      faceValue: 1000,
      couponRate: undefined,
      years: undefined,
      paymentsPerYear: 2,
      ytm: undefined,
    },
  });

  const onSubmit = (values: FormValues) => {
    const { faceValue, couponRate, years, paymentsPerYear, ytm } = values;
    const y = (ytm / 100) / paymentsPerYear;
    const C = (couponRate / 100) * faceValue / paymentsPerYear;
    const N = years * paymentsPerYear;

    let bondPrice = 0;
    let weightedCashFlowSum = 0;
    
    for (let t = 1; t <= N; t++) {
        const pvFactor = Math.pow(1 + y, t);
        let cashFlow = C;
        if (t === N) {
            cashFlow += faceValue;
        }
        const pvCashFlow = cashFlow / pvFactor;
        bondPrice += pvCashFlow;
        weightedCashFlowSum += t * pvCashFlow;
    }

    const macaulayDuration = weightedCashFlowSum / bondPrice;
    const modifiedDuration = macaulayDuration / (1 + y);
    
    setResult({ macaulay: macaulayDuration / paymentsPerYear, modified: modifiedDuration / paymentsPerYear });
  };

  return (
    <div className="space-y-8">
      <Form {...form}>
        <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-6">
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <FormField control={form.control} name="faceValue" render={({ field }) => ( <FormItem><FormLabel>Face Value ($)</FormLabel><FormControl><Input type="number" {...field} value={field.value ?? ''} onChange={e => field.onChange(parseFloat(e.target.value) || undefined)} /></FormControl><FormMessage /></FormItem> )}/>
            <FormField control={form.control} name="couponRate" render={({ field }) => ( <FormItem><FormLabel>Annual Coupon Rate (%)</FormLabel><FormControl><Input type="number" {...field} value={field.value ?? ''} onChange={e => field.onChange(parseFloat(e.target.value) || undefined)} /></FormControl><FormMessage /></FormItem> )}/>
            <FormField control={form.control} name="years" render={({ field }) => ( <FormItem><FormLabel>Years to Maturity</FormLabel><FormControl><Input type="number" {...field} value={field.value ?? ''} onChange={e => field.onChange(parseFloat(e.target.value) || undefined)} /></FormControl><FormMessage /></FormItem> )}/>
            <FormField control={form.control} name="paymentsPerYear" render={({ field }) => ( <FormItem><FormLabel>Coupon Payments per Year</FormLabel><FormControl><Input type="number" {...field} value={field.value ?? ''} onChange={e => field.onChange(parseInt(e.target.value) || undefined)} /></FormControl><FormMessage /></FormItem> )}/>
            <FormField control={form.control} name="ytm" render={({ field }) => ( <FormItem className="md:col-span-2"><FormLabel>Yield to Maturity (YTM) (%)</FormLabel><FormControl><Input type="number" {...field} value={field.value ?? ''} onChange={e => field.onChange(parseFloat(e.target.value) || undefined)} /></FormControl><FormMessage /></FormItem> )}/>
          </div>
          <Button type="submit">Calculate Duration</Button>
        </form>
      </Form>
      {result !== null && (
        <Card className="mt-8">
            <CardHeader><div className='flex items-center gap-4'><Clock className="h-8 w-8 text-primary" /><CardTitle>Bond Duration</CardTitle></div></CardHeader>
            <CardContent>
                <div className="grid grid-cols-2 gap-4 text-center">
                    <div>
                        <p className="font-semibold text-lg">Macaulay Duration</p>
                        <p className="text-2xl font-bold">{result.macaulay.toFixed(2)} years</p>
                    </div>
                    <div>
                        <p className="font-semibold text-lg">Modified Duration</p>
                        <p className="text-2xl font-bold">{result.modified.toFixed(2)}</p>
                    </div>
                </div>
                <CardDescription className='mt-4 text-center'>A Modified Duration of {result.modified.toFixed(2)} means the bond's price will change by approximately {result.modified.toFixed(2)}% for a 1% change in interest rates.</CardDescription>
            </CardContent>
        </Card>
      )}
      <Accordion type="single" collapsible className="w-full">
        <AccordionItem value="what-is-duration">
          <AccordionTrigger>What is Bond Duration?</AccordionTrigger>
          <AccordionContent className="text-muted-foreground">Bond duration is a measure of a bond's price sensitivity to interest rate changes. Macaulay Duration is the weighted average time an investor must hold a bond until the present value of the bond's cash flows equals the amount paid. Modified Duration provides a more direct estimate of the percentage price change for a 1% change in yield.</AccordionContent>
        </AccordionItem>
      </Accordion>
    </div>
  );
}
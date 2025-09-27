'use client';

import { useState } from 'react';
import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import { z } from 'zod';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Form, FormControl, FormField, FormItem, FormLabel, FormMessage } from '@/components/ui/form';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Percent } from 'lucide-react';
import { Accordion, AccordionContent, AccordionItem, AccordionTrigger } from '@/components/ui/accordion';

const formSchema = z.object({
  currentPrice: z.number().positive(),
  faceValue: z.number().positive(),
  couponRate: z.number().nonnegative(),
  years: z.number().positive(),
  paymentsPerYear: z.number().int().positive(),
});

type FormValues = z.infer<typeof formSchema>;

export default function BondYieldToMaturityCalculator() {
  const [result, setResult] = useState<number | null>(null);

  const form = useForm<FormValues>({
    resolver: zodResolver(formSchema),
    defaultValues: {
      currentPrice: undefined,
      faceValue: 1000,
      couponRate: undefined,
      years: undefined,
      paymentsPerYear: 2,
    },
  });

  const bondPrice = (ytm: number, values: FormValues): number => {
    const { faceValue, couponRate, years, paymentsPerYear } = values;
    const y = ytm / paymentsPerYear;
    const c = (couponRate / 100) * faceValue / paymentsPerYear;
    const n = years * paymentsPerYear;

    let price = 0;
    for (let t = 1; t <= n; t++) {
      price += c / Math.pow(1 + y, t);
    }
    price += faceValue / Math.pow(1 + y, n);
    return price;
  };

  const onSubmit = (values: FormValues) => {
    let low = 0;
    let high = 1; // 100%
    let ytm = 0;

    for (let i = 0; i < 100; i++) { // Bisection method
      ytm = (low + high) / 2;
      const priceAtYtm = bondPrice(ytm, values);
      if (priceAtYtm > values.currentPrice) {
        low = ytm;
      } else {
        high = ytm;
      }
    }
    setResult(ytm * 100);
  };

  return (
    <div className="space-y-8">
      <Form {...form}>
        <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-6">
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <FormField control={form.control} name="currentPrice" render={({ field }) => ( <FormItem><FormLabel>Current Bond Price ($)</FormLabel><FormControl><Input type="number" {...field} value={field.value ?? ''} onChange={e => field.onChange(parseFloat(e.target.value) || undefined)} /></FormControl><FormMessage /></FormItem> )}/>
            <FormField control={form.control} name="faceValue" render={({ field }) => ( <FormItem><FormLabel>Face Value ($)</FormLabel><FormControl><Input type="number" {...field} value={field.value ?? ''} onChange={e => field.onChange(parseFloat(e.target.value) || undefined)} /></FormControl><FormMessage /></FormItem> )}/>
            <FormField control={form.control} name="couponRate" render={({ field }) => ( <FormItem><FormLabel>Annual Coupon Rate (%)</FormLabel><FormControl><Input type="number" {...field} value={field.value ?? ''} onChange={e => field.onChange(parseFloat(e.target.value) || undefined)} /></FormControl><FormMessage /></FormItem> )}/>
            <FormField control={form.control} name="years" render={({ field }) => ( <FormItem><FormLabel>Years to Maturity</FormLabel><FormControl><Input type="number" {...field} value={field.value ?? ''} onChange={e => field.onChange(parseFloat(e.target.value) || undefined)} /></FormControl><FormMessage /></FormItem> )}/>
            <FormField control={form.control} name="paymentsPerYear" render={({ field }) => ( <FormItem className="md:col-span-2"><FormLabel>Coupon Payments per Year</FormLabel><FormControl><Input type="number" {...field} value={field.value ?? ''} onChange={e => field.onChange(parseInt(e.target.value) || undefined)} /></FormControl><FormMessage /></FormItem> )}/>
          </div>
          <Button type="submit">Calculate YTM</Button>
        </form>
      </Form>
      {result !== null && (
        <Card className="mt-8">
            <CardHeader><div className='flex items-center gap-4'><Percent className="h-8 w-8 text-primary" /><CardTitle>Yield to Maturity (YTM)</CardTitle></div></CardHeader>
            <CardContent>
                <p className="text-3xl font-bold text-center">{result.toFixed(4)}%</p>
                <CardDescription className='mt-2 text-center'>This is the total annualized rate of return an investor will earn if they hold the bond until it matures.</CardDescription>
            </CardContent>
        </Card>
      )}
       <Accordion type="single" collapsible className="w-full">
        <AccordionItem value="what-is-ytm">
          <AccordionTrigger>What is Yield to Maturity (YTM)?</AccordionTrigger>
          <AccordionContent className="text-muted-foreground">YTM is the total return anticipated on a bond if the bond is held until it matures. It is expressed as an annual rate. The YTM is considered a long-term bond yield but is expressed as an annual rate. It is the internal rate of return (IRR) of an investment in a bond if the investor holds the bond until maturity.</AccordionContent>
        </AccordionItem>
      </Accordion>
    </div>
  );
}
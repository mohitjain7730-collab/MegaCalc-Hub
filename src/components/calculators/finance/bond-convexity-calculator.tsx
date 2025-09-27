
'use client';

import { useState } from 'react';
import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import { z } from 'zod';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Form, FormControl, FormField, FormItem, FormLabel, FormMessage } from '@/components/ui/form';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Gem } from 'lucide-react';
import { Accordion, AccordionContent, AccordionItem, AccordionTrigger } from '@/components/ui/accordion';

const formSchema = z.object({
  faceValue: z.number().positive(),
  couponRate: z.number().nonnegative(),
  years: z.number().positive(),
  paymentsPerYear: z.number().int().positive(),
  ytm: z.number().positive(),
});

type FormValues = z.infer<typeof formSchema>;

export default function BondConvexityCalculator() {
  const [result, setResult] = useState<number | null>(null);

  const form = useForm<FormValues>({
    resolver: zodResolver(formSchema),
    defaultValues: {
      faceValue: undefined,
      couponRate: undefined,
      years: undefined,
      paymentsPerYear: undefined,
      ytm: undefined,
    },
  });

  const onSubmit = (values: FormValues) => {
    const { faceValue, couponRate, years, paymentsPerYear, ytm } = values;
    const y = (ytm / 100) / paymentsPerYear;
    const C = (couponRate / 100) * faceValue / paymentsPerYear;
    const N = years * paymentsPerYear;

    let bondPrice = 0;
    let convexitySum = 0;
    
    for (let t = 1; t <= N; t++) {
        const pvFactor = Math.pow(1 + y, t);
        let cashFlow = C;
        if (t === N) {
            cashFlow += faceValue;
        }
        bondPrice += cashFlow / pvFactor;
        convexitySum += (cashFlow * (t * t + t)) / pvFactor;
    }

    const convexity = (1 / (bondPrice * Math.pow(1 + y, 2))) * convexitySum;
    
    setResult(convexity / Math.pow(paymentsPerYear, 2));
  };

  return (
    <div className="space-y-8">
      <Form {...form}>
        <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-6">
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <FormField control={form.control} name="faceValue" render={({ field }) => ( <FormItem><FormLabel>Face Value ($)</FormLabel><FormControl><Input type="number" {...field} value={field.value ?? ''} onChange={e => field.onChange(parseFloat(e.target.value) || undefined)} /></FormControl><FormMessage /></FormItem> )}/>
            <FormField control={form.control} name="couponRate" render={({ field }) => ( <FormItem><FormLabel>Annual Coupon Rate (%)</FormLabel><FormControl><Input type="number" {...field} value={field.value ?? ''} onChange={e => field.onChange(parseFloat(e.target.value) || undefined)} /></FormControl><FormMessage /></FormMessage /></FormItem> )}/>
            <FormField control={form.control} name="years" render={({ field }) => ( <FormItem><FormLabel>Years to Maturity</FormLabel><FormControl><Input type="number" {...field} value={field.value ?? ''} onChange={e => field.onChange(parseFloat(e.target.value) || undefined)} /></FormControl><FormMessage /></FormItem> )}/>
            <FormField control={form.control} name="paymentsPerYear" render={({ field }) => ( <FormItem><FormLabel>Coupon Payments per Year</FormLabel><FormControl><Input type="number" {...field} value={field.value ?? ''} onChange={e => field.onChange(parseInt(e.target.value) || undefined)} /></FormControl><FormMessage /></FormItem> )}/>
            <FormField control={form.control} name="ytm" render={({ field }) => ( <FormItem className="md:col-span-2"><FormLabel>Yield to Maturity (YTM) (%)</FormLabel><FormControl><Input type="number" {...field} value={field.value ?? ''} onChange={e => field.onChange(parseFloat(e.target.value) || undefined)} /></FormControl><FormMessage /></FormItem> )}/>
          </div>
          <Button type="submit">Calculate Convexity</Button>
        </form>
      </Form>
      {result !== null && (
        <Card className="mt-8">
            <CardHeader><div className='flex items-center gap-4'><Gem className="h-8 w-8 text-primary" /><CardTitle>Bond Convexity</CardTitle></div></CardHeader>
            <CardContent>
                <p className="text-3xl font-bold text-center">{result.toFixed(4)}</p>
                <CardDescription className='mt-2 text-center'>Convexity measures the curvature in the bond price-yield relationship, providing a more accurate estimate of interest rate risk than duration alone.</CardDescription>
            </CardContent>
        </Card>
      )}
      <Accordion type="single" collapsible className="w-full">
        <AccordionItem value="what-is-convexity">
          <AccordionTrigger>What is Bond Convexity?</AccordionTrigger>
          <AccordionContent className="text-muted-foreground">Convexity is a measure of the non-linear relationship between bond prices and yields. While duration provides a linear estimate of a bond's price sensitivity to interest rate changes, convexity refines this estimate. It accounts for the fact that the price-yield curve is not a straight line. For a given yield change, convexity helps to more accurately predict the change in bond price, especially for larger shifts in interest rates.</AccordionContent>
        </AccordionItem>
      </Accordion>
    </div>
  );
}

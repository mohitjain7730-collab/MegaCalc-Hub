
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
  rate: z.number().positive(),
  years: z.number().positive(),
  periods: z.number().int().positive(),
});

type FormValues = z.infer<typeof formSchema>;

export default function ZeroCouponBondValuationCalculator() {
  const [result, setResult] = useState<number | null>(null);

  const form = useForm<FormValues>({
    resolver: zodResolver(formSchema),
    defaultValues: {
      faceValue: 1000,
      rate: undefined,
      years: undefined,
      periods: 2,
    },
  });

  const onSubmit = (values: FormValues) => {
    const { faceValue, rate, years, periods } = values;
    const r = rate / 100;
    const pv = faceValue / Math.pow(1 + r / periods, years * periods);
    setResult(pv);
  };

  return (
    <div className="space-y-8">
      <Form {...form}>
        <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-6">
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <FormField control={form.control} name="faceValue" render={({ field }) => (<FormItem><FormLabel>Face Value ($)</FormLabel><FormControl><Input type="number" {...field} value={field.value ?? ''} onChange={e => field.onChange(parseFloat(e.target.value) || undefined)} /></FormControl><FormMessage /></FormItem>)} />
            <FormField control={form.control} name="rate" render={({ field }) => (<FormItem><FormLabel>Required Rate of Return (%)</FormLabel><FormControl><Input type="number" {...field} value={field.value ?? ''} onChange={e => field.onChange(parseFloat(e.target.value) || undefined)} /></FormControl><FormMessage /></FormItem>)} />
            <FormField control={form.control} name="years" render={({ field }) => (<FormItem><FormLabel>Years to Maturity</FormLabel><FormControl><Input type="number" {...field} value={field.value ?? ''} onChange={e => field.onChange(parseFloat(e.target.value) || undefined)} /></FormControl><FormMessage /></FormItem>)} />
            <FormField control={form.control} name="periods" render={({ field }) => (<FormItem><FormLabel>Compounding Periods per Year</FormLabel><FormControl><Input type="number" {...field} value={field.value ?? ''} onChange={e => field.onChange(parseInt(e.target.value) || undefined)} /></FormControl><FormMessage /></FormItem>)} />
          </div>
          <Button type="submit">Calculate Price</Button>
        </form>
      </Form>
      {result !== null && (
        <Card className="mt-8">
          <CardHeader><div className='flex items-center gap-4'><Gem className="h-8 w-8 text-primary" /><CardTitle>Fair Price of Zero-Coupon Bond</CardTitle></div></CardHeader>
          <CardContent>
            <p className="text-3xl font-bold text-center">${result.toFixed(2)}</p>
            <CardDescription className='mt-4 text-center'>This is the present value of the bond's single future payment (its face value).</CardDescription>
          </CardContent>
        </Card>
      )}
      <Accordion type="single" collapsible className="w-full">
        <AccordionItem value="how-it-works">
          <AccordionTrigger>How It Works</AccordionTrigger>
          <AccordionContent className="text-muted-foreground">A zero-coupon bond doesn't pay interest. Instead, it's bought at a deep discount to its face value and pays out the full face value at maturity. This calculator finds the fair price by discounting the future face value back to today using the market's required rate of return.</AccordionContent>
        </AccordionItem>
      </Accordion>
    </div>
  );
}

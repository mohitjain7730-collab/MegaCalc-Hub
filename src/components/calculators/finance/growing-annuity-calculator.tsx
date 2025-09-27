
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
import { RadioGroup, RadioGroupItem } from '@/components/ui/radio-group';

const formSchema = z.object({
  payment: z.number().positive(),
  rate: z.number().positive(),
  growth: z.number(),
  periods: z.number().int().optional(),
  valueType: z.enum(['annuity', 'perpetuity']),
}).refine(data => data.rate > data.growth, {
    message: "Rate of return must be greater than the growth rate.",
    path: ["growth"],
});

type FormValues = z.infer<typeof formSchema>;

export default function GrowingAnnuityCalculator() {
  const [result, setResult] = useState<number | null>(null);

  const form = useForm<FormValues>({
    resolver: zodResolver(formSchema),
    defaultValues: {
      payment: undefined,
      rate: undefined,
      growth: undefined,
      periods: undefined,
      valueType: 'annuity',
    },
  });

  const onSubmit = (values: FormValues) => {
    const { payment, rate, growth, periods, valueType } = values;
    const r = rate / 100;
    const g = growth / 100;
    let pv;

    if (valueType === 'perpetuity') {
      // PV = C1 / (r - g)
      pv = payment / (r - g);
    } else {
      if (!periods || periods <= 0) {
        form.setError("periods", { type: "manual", message: "Number of periods is required for an annuity." });
        return;
      }
      // PV = C1 / (r - g) * [1 - ((1 + g) / (1 + r))^n]
      pv = (payment / (r - g)) * (1 - Math.pow((1 + g) / (1 + r), periods));
    }
    
    setResult(pv);
  };
  
  const valueType = form.watch('valueType');

  return (
    <div className="space-y-8">
      <Form {...form}>
        <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-6">
          <FormField control={form.control} name="valueType" render={({ field }) => (
            <FormItem className="space-y-3">
              <FormLabel>Calculation Type:</FormLabel>
              <FormControl>
                <RadioGroup onValueChange={field.onChange} defaultValue={field.value} className="flex space-x-4">
                  <FormItem className="flex items-center space-x-2"><FormControl><RadioGroupItem value="annuity" /></FormControl><FormLabel className="font-normal">Growing Annuity (Finite)</FormLabel></FormItem>
                  <FormItem className="flex items-center space-x-2"><FormControl><RadioGroupItem value="perpetuity" /></FormControl><FormLabel className="font-normal">Growing Perpetuity (Infinite)</FormLabel></FormItem>
                </RadioGroup>
              </FormControl>
            </FormItem>
          )} />
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <FormField control={form.control} name="payment" render={({ field }) => (
                <FormItem><FormLabel>First Payment (C₁) in USD</FormLabel><FormControl><Input type="number" {...field} value={field.value ?? ''} onChange={e => field.onChange(parseFloat(e.target.value) || undefined)} /></FormControl><FormMessage /></FormItem>
            )} />
            <FormField control={form.control} name="rate" render={({ field }) => (
                <FormItem><FormLabel>Rate of Return (r) %</FormLabel><FormControl><Input type="number" {...field} value={field.value ?? ''} onChange={e => field.onChange(parseFloat(e.target.value) || undefined)} /></FormControl><FormMessage /></FormItem>
            )} />
            <FormField control={form.control} name="growth" render={({ field }) => (
                <FormItem><FormLabel>Growth Rate of Payments (g) %</FormLabel><FormControl><Input type="number" {...field} value={field.value ?? ''} onChange={e => field.onChange(parseFloat(e.target.value) || undefined)} /></FormControl><FormMessage /></FormItem>
            )} />
            {valueType === 'annuity' && (
              <FormField control={form.control} name="periods" render={({ field }) => (
                  <FormItem><FormLabel>Number of Periods (n)</FormLabel><FormControl><Input type="number" {...field} value={field.value ?? ''} onChange={e => field.onChange(parseInt(e.target.value) || undefined)} /></FormControl><FormMessage /></FormItem>
              )} />
            )}
          </div>
          <Button type="submit">Calculate Present Value</Button>
        </form>
      </Form>
      {result !== null && (
        <Card className="mt-8">
            <CardHeader><div className='flex items-center gap-4'><Landmark className="h-8 w-8 text-primary" /><CardTitle>Present Value of {valueType === 'annuity' ? 'Growing Annuity' : 'Growing Perpetuity'}</CardTitle></div></CardHeader>
            <CardContent>
                <p className="text-3xl font-bold text-center">${result.toLocaleString(undefined, { maximumFractionDigits: 2 })}</p>
                <CardDescription className='mt-4 text-center'>This is the total value today of the growing stream of cash flows.</CardDescription>
            </CardContent>
        </Card>
      )}
       <Accordion type="single" collapsible className="w-full">
        <AccordionItem value="how-it-works">
            <AccordionTrigger>How It Works</AccordionTrigger>
            <AccordionContent className="text-muted-foreground space-y-2">
                <p>This calculator values a series of cash flows that are not constant but grow at a steady rate. This is common for things like dividend stocks or rental income that is expected to increase over time.</p>
                <p><strong>Growing Perpetuity:</strong> A stream of cash flows that grow at a constant rate forever. The formula is `PV = C₁ / (r - g)`.</p>
                <p><strong>Growing Annuity:</strong> A stream of cash flows that grow at a constant rate for a finite number of periods. The formula is more complex, accounting for the limited number of payments.</p>
                <p>In both cases, the rate of return (r) must be greater than the growth rate (g) for the formula to be valid.</p>
            </AccordionContent>
        </AccordionItem>
        <AccordionItem value="further-reading">
            <AccordionTrigger>Further Reading</AccordionTrigger>
            <AccordionContent className="text-muted-foreground">
                 <a href="https://www.cfainstitute.org/en/membership/professional-development/refresher-readings" target="_blank" rel="noopener noreferrer" className="text-primary underline">CFA Institute – Valuation of Growing Cash Flows</a>
            </AccordionContent>
        </AccordionItem>
      </Accordion>
    </div>
  );
}

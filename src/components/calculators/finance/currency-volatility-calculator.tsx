
'use client';

import { useState } from 'react';
import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import { z } from 'zod';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Form, FormControl, FormField, FormItem, FormLabel, FormMessage } from '@/components/ui/form';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { BarChart2 } from 'lucide-react';
import { Accordion, AccordionContent, AccordionItem, AccordionTrigger } from '@/components/ui/accordion';

const formSchema = z.object({
  amountForeign: z.number().positive(),
  currentRate: z.number().positive(),
  fluctuation: z.number(),
});

type FormValues = z.infer<typeof formSchema>;

export default function CurrencyVolatilityCalculator() {
  const [result, setResult] = useState<{ initialValue: number; newValue: number; impact: number } | null>(null);

  const form = useForm<FormValues>({
    resolver: zodResolver(formSchema),
    defaultValues: {
      amountForeign: undefined,
      currentRate: undefined,
      fluctuation: undefined,
    },
  });

  const onSubmit = (values: FormValues) => {
    const { amountForeign, currentRate, fluctuation } = values;
    const initialValue = amountForeign * currentRate;
    const newRate = currentRate * (1 + (fluctuation / 100));
    const newValue = amountForeign * newRate;
    const impact = newValue - initialValue;
    setResult({ initialValue, newValue, impact });
  };

  return (
    <div className="space-y-8">
      <Form {...form}>
        <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-6">
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <FormField control={form.control} name="amountForeign" render={({ field }) => (
                <FormItem><FormLabel>Amount in Foreign Currency</FormLabel><FormControl><Input type="number" {...field} value={field.value ?? ''} onChange={e => field.onChange(parseFloat(e.target.value) || undefined)} /></FormControl><FormMessage /></FormItem>
            )} />
            <FormField control={form.control} name="currentRate" render={({ field }) => (
                <FormItem><FormLabel>Current Exchange Rate</FormLabel><FormControl><Input type="number" step="any" {...field} value={field.value ?? ''} onChange={e => field.onChange(parseFloat(e.target.value) || undefined)} /></FormControl><FormMessage /></FormItem>
            )} />
            <FormField control={form.control} name="fluctuation" render={({ field }) => (
                <FormItem className="md:col-span-2"><FormLabel>Expected Fluctuation (%)</FormLabel><FormControl><Input type="number" {...field} value={field.value ?? ''} onChange={e => field.onChange(parseFloat(e.target.value) || undefined)} /></FormControl><FormMessage /></FormItem>
            )} />
          </div>
          <Button type="submit">Calculate Impact</Button>
        </form>
      </Form>
      {result !== null && (
        <Card className="mt-8">
          <CardHeader><div className='flex items-center gap-4'><BarChart2 className="h-8 w-8 text-primary" /><CardTitle>Financial Impact of Fluctuation</CardTitle></div></CardHeader>
          <CardContent>
            <div className="grid grid-cols-1 md:grid-cols-3 gap-4 text-center">
              <div><CardDescription>Initial Value</CardDescription><p className="font-bold">${result.initialValue.toLocaleString(undefined, {maximumFractionDigits: 2})}</p></div>
              <div><CardDescription>New Value</CardDescription><p className="font-bold">${result.newValue.toLocaleString(undefined, {maximumFractionDigits: 2})}</p></div>
              <div className={result.impact >= 0 ? 'text-green-500' : 'text-red-500'}><CardDescription>Gain / Loss</CardDescription><p className="font-bold">${result.impact.toLocaleString(undefined, {maximumFractionDigits: 2})}</p></div>
            </div>
          </CardContent>
        </Card>
      )}
       <Accordion type="single" collapsible className="w-full">
        <AccordionItem value="understanding-inputs">
            <AccordionTrigger>Understanding the Inputs</AccordionTrigger>
            <AccordionContent className="text-muted-foreground space-y-4">
                <div>
                    <h4 className="font-semibold text-foreground mb-1">Amount in Foreign Currency</h4>
                    <p>The value of your transaction or asset in its original currency (e.g., 50,000 JPY).</p>
                </div>
                <div>
                    <h4 className="font-semibold text-foreground mb-1">Current Exchange Rate</h4>
                    <p>The rate for converting 1 unit of the foreign currency into your domestic currency.</p>
                </div>
                 <div>
                    <h4 className="font-semibold text-foreground mb-1">Expected Fluctuation (%)</h4>
                    <p>The percentage change you want to model. Use a positive number for an appreciation of the foreign currency and a negative number for a depreciation.</p>
                </div>
            </AccordionContent>
        </AccordionItem>
        <AccordionItem value="how-it-works">
            <AccordionTrigger>How It Works</AccordionTrigger>
            <AccordionContent className="text-muted-foreground">
                <ol className="list-decimal list-inside space-y-2">
                  <li>It calculates the initial value of your holding in your domestic currency.</li>
                  <li>It adjusts the current exchange rate by the fluctuation percentage you provided to find the new rate.</li>
                  <li>It calculates the new value of your holding using this new rate.</li>
                  <li>Finally, it shows the difference between the new and initial values, quantifying the gain or loss due to currency movement.</li>
                </ol>
            </AccordionContent>
        </AccordionItem>
      </Accordion>
    </div>
  );
}


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
  avgPurchaseValue: z.number().positive(),
  purchaseFrequency: z.number().positive(),
  customerLifespan: z.number().positive(),
});

type FormValues = z.infer<typeof formSchema>;

export default function LifetimeValueCalculator() {
  const [result, setResult] = useState<number | null>(null);

  const form = useForm<FormValues>({
    resolver: zodResolver(formSchema),
    defaultValues: {
        avgPurchaseValue: undefined,
        purchaseFrequency: undefined,
        customerLifespan: undefined,
    },
  });

  const onSubmit = (values: FormValues) => {
    setResult(values.avgPurchaseValue * values.purchaseFrequency * values.customerLifespan);
  };

  return (
    <div className="space-y-8">
      <Form {...form}>
        <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-6">
          <CardDescription>Estimate the total revenue a single customer generates.</CardDescription>
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <FormField control={form.control} name="avgPurchaseValue" render={({ field }) => (
                <FormItem><FormLabel>Average Purchase Value ($)</FormLabel><FormControl><Input type="number" placeholder="e.g., 50" {...field} value={field.value ?? ''} onChange={e => field.onChange(parseFloat(e.target.value) || undefined)} /></FormControl><FormMessage /></FormItem>
            )} />
            <FormField control={form.control} name="purchaseFrequency" render={({ field }) => (
                <FormItem><FormLabel>Purchase Frequency (per year)</FormLabel><FormControl><Input type="number" placeholder="e.g., 4" {...field} value={field.value ?? ''} onChange={e => field.onChange(parseFloat(e.target.value) || undefined)} /></FormControl><FormMessage /></FormItem>
            )} />
             <FormField control={form.control} name="customerLifespan" render={({ field }) => (
                <FormItem className='md:col-span-2'><FormLabel>Average Customer Lifespan (years)</FormLabel><FormControl><Input type="number" placeholder="e.g., 3" {...field} value={field.value ?? ''} onChange={e => field.onChange(parseFloat(e.target.value) || undefined)} /></FormControl><FormMessage /></FormItem>
            )} />
          </div>
          <Button type="submit">Calculate LTV</Button>
        </form>
      </Form>
      
      {result !== null && (
        <Card className="mt-8">
            <CardHeader><div className='flex items-center gap-4'><Gem className="h-8 w-8 text-primary" /><CardTitle>Customer Lifetime Value (LTV)</CardTitle></div></CardHeader>
            <CardContent>
                <p className="text-3xl font-bold text-center">${result.toFixed(2)}</p>
                <CardDescription className='mt-4 text-center'>This is the estimated total revenue you can expect from an average customer over their entire relationship with your business.</CardDescription>
            </CardContent>
        </Card>
      )}

      <Accordion type="single" collapsible className="w-full">
        <AccordionItem value="understanding-inputs">
            <AccordionTrigger>Understanding the Inputs</AccordionTrigger>
            <AccordionContent className="text-muted-foreground space-y-4">
                <div>
                    <h4 className="font-semibold text-foreground mb-1">Average Purchase Value ($)</h4>
                    <p>The average amount a customer spends in a single transaction.</p>
                </div>
                <div>
                    <h4 className="font-semibold text-foreground mb-1">Purchase Frequency (per year)</h4>
                    <p>How many times an average customer makes a purchase from you in a year.</p>
                </div>
                <div>
                    <h4 className="font-semibold text-foreground mb-1">Average Customer Lifespan (years)</h4>
                    <p>The average length of time a person remains a customer.</p>
                </div>
            </AccordionContent>
        </AccordionItem>
        <AccordionItem value="how-it-works">
            <AccordionTrigger>How It Works</AccordionTrigger>
            <AccordionContent className="text-muted-foreground">
                <p>This provides a simple, yet powerful, estimation of Customer Lifetime Value (LTV). It multiplies the average value of a sale by the number of times the customer is expected to buy in a year, and then multiplies that by the number of years they are expected to remain a customer. A high LTV indicates a healthy, sustainable business model, especially when compared to the Customer Acquisition Cost (CAC).</p>
            </AccordionContent>
        </AccordionItem>
      </Accordion>
    </div>
  );
}

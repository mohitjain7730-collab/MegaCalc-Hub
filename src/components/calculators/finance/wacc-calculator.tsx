
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

const formSchema = z.object({
  costOfEquity: z.number().positive(),
  costOfDebt: z.number().positive(),
  marketValueEquity: z.number().positive(),
  marketValueDebt: z.number().positive(),
  taxRate: z.number().min(0).max(100),
});

type FormValues = z.infer<typeof formSchema>;

export default function WaccCalculator() {
  const [result, setResult] = useState<number | null>(null);

  const form = useForm<FormValues>({
    resolver: zodResolver(formSchema),
    defaultValues: {
      costOfEquity: undefined,
      costOfDebt: undefined,
      marketValueEquity: undefined,
      marketValueDebt: undefined,
      taxRate: undefined,
    },
  });

  const onSubmit = (values: FormValues) => {
    const { costOfEquity, costOfDebt, marketValueEquity, marketValueDebt, taxRate } = values;
    const E = marketValueEquity;
    const D = marketValueDebt;
    const V = E + D;
    const Re = costOfEquity / 100;
    const Rd = costOfDebt / 100;
    const Tc = taxRate / 100;

    const wacc = ((E / V) * Re) + (((D / V) * Rd) * (1 - Tc));
    setResult(wacc * 100);
  };

  return (
    <div className="space-y-8">
      <Form {...form}>
        <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-6">
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <FormField control={form.control} name="marketValueEquity" render={({ field }) => ( <FormItem><FormLabel>Market Value of Equity (E)</FormLabel><FormControl><Input type="number" {...field} value={field.value ?? ''} onChange={e => field.onChange(parseFloat(e.target.value))} /></FormControl><FormMessage /></FormItem> )}/>
            <FormField control={form.control} name="marketValueDebt" render={({ field }) => ( <FormItem><FormLabel>Market Value of Debt (D)</FormLabel><FormControl><Input type="number" {...field} value={field.value ?? ''} onChange={e => field.onChange(parseFloat(e.target.value))} /></FormControl><FormMessage /></FormItem> )}/>
            <FormField control={form.control} name="costOfEquity" render={({ field }) => ( <FormItem><FormLabel>Cost of Equity (Re) %</FormLabel><FormControl><Input type="number" {...field} value={field.value ?? ''} onChange={e => field.onChange(parseFloat(e.target.value))} /></FormControl><FormMessage /></FormItem> )}/>
            <FormField control={form.control} name="costOfDebt" render={({ field }) => ( <FormItem><FormLabel>Cost of Debt (Rd) %</FormLabel><FormControl><Input type="number" {...field} value={field.value ?? ''} onChange={e => field.onChange(parseFloat(e.target.value))} /></FormControl><FormMessage /></FormItem> )}/>
            <FormField control={form.control} name="taxRate" render={({ field }) => ( <FormItem className='md:col-span-2'><FormLabel>Corporate Tax Rate (Tc) %</FormLabel><FormControl><Input type="number" {...field} value={field.value ?? ''} onChange={e => field.onChange(parseFloat(e.target.value))} /></FormControl><FormMessage /></FormItem> )}/>
          </div>
          <Button type="submit">Calculate WACC</Button>
        </form>
      </Form>
      {result !== null && (
        <Card className="mt-8">
            <CardHeader><div className='flex items-center gap-4'><Landmark className="h-8 w-8 text-primary" /><CardTitle>Weighted Average Cost of Capital (WACC)</CardTitle></div></CardHeader>
            <CardContent>
                <p className="text-3xl font-bold text-center">{result.toFixed(2)}%</p>
                <CardDescription className='mt-4 text-center'>This is the blended rate a company is expected to pay to finance its assets. It's a common discount rate for DCF analysis.</CardDescription>
            </CardContent>
        </Card>
      )}
       <Accordion type="single" collapsible className="w-full">
        <AccordionItem value="how-it-works">
            <AccordionTrigger>How It Works</AccordionTrigger>
            <AccordionContent className="text-muted-foreground">
                <p>WACC calculates a company's cost of financing by proportionally weighting the cost of equity and the after-tax cost of debt. It represents the average rate of return a company must earn on its existing asset base to satisfy its creditors, owners, and other providers of capital.</p>
            </AccordionContent>
        </AccordionItem>
      </Accordion>
    </div>
  );
}

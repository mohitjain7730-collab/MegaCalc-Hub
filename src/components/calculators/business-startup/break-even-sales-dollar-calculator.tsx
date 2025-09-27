
'use client';

import { useState } from 'react';
import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import { z } from 'zod';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Form, FormControl, FormField, FormItem, FormLabel, FormMessage } from '@/components/ui/form';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Target } from 'lucide-react';
import { Accordion, AccordionContent, AccordionItem, AccordionTrigger } from '@/components/ui/accordion';

const formSchema = z.object({
  fixedCosts: z.number().positive(),
  pricePerUnit: z.number().positive(),
  variableCost: z.number().nonnegative(),
}).refine(data => data.pricePerUnit > data.variableCost, {
    message: "Price must be greater than variable cost.",
    path: ["pricePerUnit"],
});

type FormValues = z.infer<typeof formSchema>;

export default function BreakEvenSalesDollarCalculator() {
  const [result, setResult] = useState<number | null>(null);

  const form = useForm<FormValues>({
    resolver: zodResolver(formSchema),
    defaultValues: {
      fixedCosts: undefined,
      pricePerUnit: undefined,
      variableCost: undefined,
    },
  });

  const onSubmit = (values: FormValues) => {
    const contributionMarginRatio = (values.pricePerUnit - values.variableCost) / values.pricePerUnit;
    const breakEvenDollars = values.fixedCosts / contributionMarginRatio;
    setResult(breakEvenDollars);
  };

  return (
    <div className="space-y-8">
      <Form {...form}>
        <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-6">
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <FormField control={form.control} name="fixedCosts" render={({ field }) => (
                <FormItem><FormLabel>Total Fixed Costs ($)</FormLabel><FormControl><Input type="number" {...field} value={field.value ?? ''} onChange={e => field.onChange(parseFloat(e.target.value) || undefined)} /></FormControl><FormMessage /></FormItem>
            )} />
            <FormField control={form.control} name="pricePerUnit" render={({ field }) => (
                <FormItem><FormLabel>Selling Price per Unit ($)</FormLabel><FormControl><Input type="number" {...field} value={field.value ?? ''} onChange={e => field.onChange(parseFloat(e.target.value) || undefined)} /></FormControl><FormMessage /></FormItem>
            )} />
            <FormField control={form.control} name="variableCost" render={({ field }) => (
                <FormItem className="md:col-span-2"><FormLabel>Variable Cost per Unit ($)</FormLabel><FormControl><Input type="number" {...field} value={field.value ?? ''} onChange={e => field.onChange(parseFloat(e.target.value) || undefined)} /></FormControl><FormMessage /></FormItem>
            )} />
          </div>
          <Button type="submit">Calculate Break-Even Sales</Button>
        </form>
      </Form>
      {result !== null && (
        <Card className="mt-8">
          <CardHeader>
            <div className='flex items-center gap-4'><Target className="h-8 w-8 text-primary" /><CardTitle>Break-Even Point in Sales Dollars</CardTitle></div>
          </CardHeader>
          <CardContent>
            <p className="text-3xl font-bold text-center">${result.toLocaleString(undefined, { maximumFractionDigits: 2 })}</p>
            <CardDescription className='mt-4 text-center'>This is the total sales revenue required to cover all your costs. Sales beyond this point generate profit.</CardDescription>
          </CardContent>
        </Card>
      )}
      <Accordion type="single" collapsible className="w-full">
        <AccordionItem value="how-it-works">
          <AccordionTrigger>How It Works</AccordionTrigger>
          <AccordionContent className="text-muted-foreground">The calculator first determines the Contribution Margin Ratio ((Price - Variable Cost) / Price), which is the percentage of each sale that contributes to covering fixed costs. It then divides the Total Fixed Costs by this ratio to find the total sales dollars needed to break even.</AccordionContent>
        </AccordionItem>
      </Accordion>
    </div>
  );
}

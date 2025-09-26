
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
  variableCost: z.number().nonnegative(),
  pricePerUnit: z.number().positive(),
}).refine(data => data.pricePerUnit > data.variableCost, {
    message: "Selling price must be greater than the variable cost per unit.",
    path: ["pricePerUnit"],
});

type FormValues = z.infer<typeof formSchema>;

export default function BreakEvenPointCalculator() {
  const [result, setResult] = useState<number | null>(null);

  const form = useForm<FormValues>({
    resolver: zodResolver(formSchema),
    defaultValues: {
        fixedCosts: undefined,
        variableCost: undefined,
        pricePerUnit: undefined,
    },
  });

  const onSubmit = (values: FormValues) => {
    const breakEvenUnits = values.fixedCosts / (values.pricePerUnit - values.variableCost);
    setResult(breakEvenUnits);
  };

  return (
    <div className="space-y-8">
      <Form {...form}>
        <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-6">
          <CardDescription>Find the sales volume required to cover all fixed and variable costs.</CardDescription>
          <div className="grid grid-cols-1 gap-4">
            <FormField control={form.control} name="fixedCosts" render={({ field }) => (
                <FormItem><FormLabel>Total Fixed Costs ($)</FormLabel><FormControl><Input type="number" placeholder="e.g., 10000" {...field} value={field.value ?? ''} onChange={e => field.onChange(parseFloat(e.target.value) || undefined)} /></FormControl><FormMessage /></FormItem>
            )} />
            <FormField control={form.control} name="variableCost" render={({ field }) => (
                <FormItem><FormLabel>Variable Cost per Unit ($)</FormLabel><FormControl><Input type="number" placeholder="e.g., 25" {...field} value={field.value ?? ''} onChange={e => field.onChange(parseFloat(e.target.value) || undefined)} /></FormControl><FormMessage /></FormItem>
            )} />
            <FormField control={form.control} name="pricePerUnit" render={({ field }) => (
                <FormItem><FormLabel>Selling Price per Unit ($)</FormLabel><FormControl><Input type="number" placeholder="e.g., 50" {...field} value={field.value ?? ''} onChange={e => field.onChange(parseFloat(e.target.value) || undefined)} /></FormControl><FormMessage /></FormItem>
            )} />
          </div>
          <Button type="submit">Calculate Break-Even Point</Button>
        </form>
      </Form>
      
      {result !== null && (
        <Card className="mt-8">
            <CardHeader><div className='flex items-center gap-4'><Target className="h-8 w-8 text-primary" /><CardTitle>Break-Even Point</CardTitle></div></CardHeader>
            <CardContent>
                <p className="text-3xl font-bold text-center">{Math.ceil(result).toLocaleString()} units</p>
                <CardDescription className='mt-4 text-center'>You need to sell {Math.ceil(result).toLocaleString()} units to cover your costs. Every unit sold after this point is profit.</CardDescription>
            </CardContent>
        </Card>
      )}

      <Accordion type="single" collapsible className="w-full">
        <AccordionItem value="understanding-inputs">
            <AccordionTrigger>Understanding the Inputs</AccordionTrigger>
            <AccordionContent className="text-muted-foreground space-y-4">
                <div>
                    <h4 className="font-semibold text-foreground mb-1">Fixed Costs ($)</h4>
                    <p>Costs that do not change with the number of units produced or sold (e.g., rent, salaries, insurance).</p>
                </div>
                <div>
                    <h4 className="font-semibold text-foreground mb-1">Variable Cost per Unit ($)</h4>
                    <p>The cost directly associated with producing one unit (e.g., materials, direct labor).</p>
                </div>
                 <div>
                    <h4 className="font-semibold text-foreground mb-1">Selling Price per Unit ($)</h4>
                    <p>The price at which you sell one unit to a customer.</p>
                </div>
            </AccordionContent>
        </AccordionItem>
        <AccordionItem value="how-it-works">
            <AccordionTrigger>How It Works</AccordionTrigger>
            <AccordionContent className="text-muted-foreground">
                <p>The break-even point is where Total Revenue equals Total Costs. This calculator first finds the "contribution margin" (Selling Price - Variable Cost), which is the profit made on each unit. It then divides the Total Fixed Costs by the contribution margin to determine how many units must be sold to cover all fixed expenses.</p>
            </AccordionContent>
        </AccordionItem>
      </Accordion>
    </div>
  );
}

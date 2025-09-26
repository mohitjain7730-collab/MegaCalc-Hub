
'use client';

import { useState } from 'react';
import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import { z } from 'zod';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Form, FormControl, FormField, FormItem, FormLabel, FormMessage } from '@/components/ui/form';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Flame } from 'lucide-react';
import { Accordion, AccordionContent, AccordionItem, AccordionTrigger } from '@/components/ui/accordion';

const formSchema = z.object({
  startingCash: z.number().nonnegative(),
  endingCash: z.number().nonnegative(),
  months: z.number().int().positive(),
}).refine(data => data.startingCash >= data.endingCash, {
    message: "Starting cash must be greater than or equal to ending cash.",
    path: ["startingCash"],
});

type FormValues = z.infer<typeof formSchema>;

export default function BurnRateCalculator() {
  const [result, setResult] = useState<number | null>(null);

  const form = useForm<FormValues>({
    resolver: zodResolver(formSchema),
    defaultValues: {
        startingCash: undefined,
        endingCash: undefined,
        months: undefined,
    },
  });

  const onSubmit = (values: FormValues) => {
    setResult((values.startingCash - values.endingCash) / values.months);
  };

  return (
    <div className="space-y-8">
      <Form {...form}>
        <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-6">
          <CardDescription>Track how quickly your startup is using its available cash.</CardDescription>
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <FormField control={form.control} name="startingCash" render={({ field }) => (
                <FormItem><FormLabel>Starting Cash Balance ($)</FormLabel><FormControl><Input type="number" placeholder="e.g., 100000" {...field} value={field.value ?? ''} onChange={e => field.onChange(parseFloat(e.target.value) || undefined)} /></FormControl><FormMessage /></FormItem>
            )} />
            <FormField control={form.control} name="endingCash" render={({ field }) => (
                <FormItem><FormLabel>Ending Cash Balance ($)</FormLabel><FormControl><Input type="number" placeholder="e.g., 70000" {...field} value={field.value ?? ''} onChange={e => field.onChange(parseFloat(e.target.value) || undefined)} /></FormControl><FormMessage /></FormItem>
            )} />
            <FormField control={form.control} name="months" render={({ field }) => (
                <FormItem className="md:col-span-2"><FormLabel>Time Period (months)</FormLabel><FormControl><Input type="number" placeholder="e.g., 3" {...field} value={field.value ?? ''} onChange={e => field.onChange(parseInt(e.target.value) || undefined)} /></FormControl><FormMessage /></FormItem>
            )} />
          </div>
          <Button type="submit">Calculate Burn Rate</Button>
        </form>
      </Form>
      
      {result !== null && (
        <Card className="mt-8">
            <CardHeader><div className='flex items-center gap-4'><Flame className="h-8 w-8 text-primary" /><CardTitle>Average Monthly Burn Rate</CardTitle></div></CardHeader>
            <CardContent>
                <p className="text-3xl font-bold text-center">${result.toLocaleString(undefined, {maximumFractionDigits: 0})}</p>
                <CardDescription className='mt-4 text-center'>This is the average amount of cash your company is spending per month.</CardDescription>
            </CardContent>
        </Card>
      )}

      <Accordion type="single" collapsible className="w-full">
        <AccordionItem value="understanding-inputs">
            <AccordionTrigger>Understanding the Inputs</AccordionTrigger>
            <AccordionContent className="text-muted-foreground space-y-4">
                <div>
                    <h4 className="font-semibold text-foreground mb-1">Starting & Ending Cash Balance ($)</h4>
                    <p>The amount of cash your business had at the beginning and end of the chosen time period.</p>
                </div>
                <div>
                    <h4 className="font-semibold text-foreground mb-1">Time Period (months)</h4>
                    <p>The number of months between the starting and ending cash balances.</p>
                </div>
            </AccordionContent>
        </AccordionItem>
        <AccordionItem value="how-it-works">
            <AccordionTrigger>How It Works</AccordionTrigger>
            <AccordionContent className="text-muted-foreground">
                <p>Burn rate is a critical metric for startups, indicating the rate at which a company is losing money. This calculator finds the total cash spent during the period (Starting Cash - Ending Cash) and then divides it by the number of months to find the average monthly cash burn. This helps in forecasting how much time (runway) the company has before it runs out of money.</p>
            </AccordionContent>
        </AccordionItem>
      </Accordion>
    </div>
  );
}


'use client';

import { useState } from 'react';
import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import { z } from 'zod';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Form, FormControl, FormField, FormItem, FormLabel, FormMessage } from '@/components/ui/form';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { ShieldCheck } from 'lucide-react';
import { Accordion, AccordionContent, AccordionItem, AccordionTrigger } from '@/components/ui/accordion';

const formSchema = z.object({
  currentSales: z.number().positive(),
  breakEvenSales: z.number().positive(),
}).refine(data => data.currentSales > data.breakEvenSales, {
  message: 'Current sales must be greater than break-even sales.',
  path: ['currentSales'],
});

type FormValues = z.infer<typeof formSchema>;

export default function MarginOfSafetyCalculator() {
  const [result, setResult] = useState<{ dollars: number; percentage: number } | null>(null);

  const form = useForm<FormValues>({
    resolver: zodResolver(formSchema),
    defaultValues: {
      currentSales: undefined,
      breakEvenSales: undefined,
    },
  });

  const onSubmit = (values: FormValues) => {
    const marginOfSafetyDollars = values.currentSales - values.breakEvenSales;
    const marginOfSafetyPercentage = (marginOfSafetyDollars / values.currentSales) * 100;
    setResult({ dollars: marginOfSafetyDollars, percentage: marginOfSafetyPercentage });
  };

  return (
    <div className="space-y-8">
      <Form {...form}>
        <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-6">
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <FormField control={form.control} name="currentSales" render={({ field }) => (
              <FormItem>
                <FormLabel>Current or Forecasted Sales ($)</FormLabel>
                <FormControl>
                  <Input type="number" {...field} value={field.value ?? ''} onChange={e => field.onChange(parseFloat(e.target.value) || undefined)} />
                </FormControl>
                <FormMessage />
              </FormItem>
            )} />
            <FormField control={form.control} name="breakEvenSales" render={({ field }) => (
              <FormItem>
                <FormLabel>Break-Even Sales ($)</FormLabel>
                <FormControl>
                  <Input type="number" {...field} value={field.value ?? ''} onChange={e => field.onChange(parseFloat(e.target.value) || undefined)} />
                </FormControl>
                <FormMessage />
              </FormItem>
            )} />
          </div>
          <Button type="submit">Calculate Margin of Safety</Button>
        </form>
      </Form>
      {result !== null && (
        <Card className="mt-8">
          <CardHeader>
            <div className='flex items-center gap-4'><ShieldCheck className="h-8 w-8 text-primary" /><CardTitle>Margin of Safety</CardTitle></div>
          </CardHeader>
          <CardContent>
            <div className="grid grid-cols-2 gap-4 text-center">
              <div>
                <p className="font-semibold text-lg">In Dollars</p>
                <p className="text-2xl font-bold">${result.dollars.toLocaleString()}</p>
              </div>
              <div>
                <p className="font-semibold text-lg">In Percentage</p>
                <p className="text-2xl font-bold">{result.percentage.toFixed(2)}%</p>
              </div>
            </div>
            <CardDescription className='mt-4 text-center'>Sales can decline by this amount before the company starts incurring a loss.</CardDescription>
          </CardContent>
        </Card>
      )}
      <Accordion type="single" collapsible className="w-full">
        <AccordionItem value="how-it-works">
          <AccordionTrigger>How It Works</AccordionTrigger>
          <AccordionContent className="text-muted-foreground">The Margin of Safety quantifies the difference between actual sales and the sales level required to break even. A higher margin indicates a lower risk of not breaking even and provides a cushion against sales declines.</AccordionContent>
        </AccordionItem>
      </Accordion>
    </div>
  );
}

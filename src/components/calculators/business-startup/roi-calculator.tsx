
'use client';

import { useState } from 'react';
import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import { z } from 'zod';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Form, FormControl, FormField, FormItem, FormLabel, FormMessage } from '@/components/ui/form';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { TrendingUp } from 'lucide-react';
import { Accordion, AccordionContent, AccordionItem, AccordionTrigger } from '@/components/ui/accordion';

const formSchema = z.object({
  netProfit: z.number(),
  totalInvestment: z.number().positive("Investment must be positive"),
});

type FormValues = z.infer<typeof formSchema>;

export default function RoiCalculator() {
  const [result, setResult] = useState<number | null>(null);

  const form = useForm<FormValues>({
    resolver: zodResolver(formSchema),
    defaultValues: {
        netProfit: undefined,
        totalInvestment: undefined,
    },
  });

  const onSubmit = (values: FormValues) => {
    setResult((values.netProfit / values.totalInvestment) * 100);
  };

  return (
    <div className="space-y-8">
      <Form {...form}>
        <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-6">
          <CardDescription>Measure the profitability of a business investment.</CardDescription>
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <FormField control={form.control} name="netProfit" render={({ field }) => (
                <FormItem><FormLabel>Net Profit ($)</FormLabel><FormControl><Input type="number" placeholder="e.g., 20000" {...field} value={field.value ?? ''} onChange={e => field.onChange(parseFloat(e.target.value) || undefined)} /></FormControl><FormMessage /></FormItem>
            )} />
            <FormField control={form.control} name="totalInvestment" render={({ field }) => (
                <FormItem><FormLabel>Total Investment ($)</FormLabel><FormControl><Input type="number" placeholder="e.g., 100000" {...field} value={field.value ?? ''} onChange={e => field.onChange(parseFloat(e.target.value) || undefined)} /></FormControl><FormMessage /></FormItem>
            )} />
          </div>
          <Button type="submit">Calculate ROI</Button>
        </form>
      </Form>
      
      {result !== null && (
        <Card className="mt-8">
            <CardHeader><div className='flex items-center gap-4'><TrendingUp className="h-8 w-8 text-primary" /><CardTitle>Return on Investment (ROI)</CardTitle></div></CardHeader>
            <CardContent>
                <p className="text-3xl font-bold text-center">{result.toFixed(2)}%</p>
                <CardDescription className='mt-4 text-center'>This is the gain or loss on your investment relative to its cost.</CardDescription>
            </CardContent>
        </Card>
      )}

      <Accordion type="single" collapsible className="w-full">
        <AccordionItem value="understanding-inputs">
            <AccordionTrigger>Understanding the Inputs</AccordionTrigger>
            <AccordionContent className="text-muted-foreground space-y-4">
                <div>
                    <h4 className="font-semibold text-foreground mb-1">Net Profit ($)</h4>
                    <p>The final profit from the investment after all costs have been subtracted. This can be calculated as `(Final Value of Investment - Initial Investment)`. A negative value indicates a loss.</p>
                </div>
                <div>
                    <h4 className="font-semibold text-foreground mb-1">Total Investment ($)</h4>
                    <p>The total cost of the investment.</p>
                </div>
            </AccordionContent>
        </AccordionItem>
        <AccordionItem value="how-it-works">
            <AccordionTrigger>How It Works</AccordionTrigger>
            <AccordionContent className="text-muted-foreground">
                <p>Return on Investment (ROI) is a performance measure used to evaluate the efficiency or profitability of an investment. It directly measures the amount of return on a particular investment, relative to the investment’s cost. The calculation is straightforward: `(Net Profit / Total Investment) * 100`.</p>
            </AccordionContent>
        </AccordionItem>
      </Accordion>
    </div>
  );
}

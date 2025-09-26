
'use client';

import { useState } from 'react';
import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import { z } from 'zod';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Form, FormControl, FormField, FormItem, FormLabel, FormMessage } from '@/components/ui/form';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { UserPlus } from 'lucide-react';
import { Accordion, AccordionContent, AccordionItem, AccordionTrigger } from '@/components/ui/accordion';

const formSchema = z.object({
  marketingExpenses: z.number().positive(),
  newCustomers: z.number().int().positive(),
});

type FormValues = z.infer<typeof formSchema>;

export default function CustomerAcquisitionCostCalculator() {
  const [result, setResult] = useState<number | null>(null);

  const form = useForm<FormValues>({
    resolver: zodResolver(formSchema),
    defaultValues: {
        marketingExpenses: undefined,
        newCustomers: undefined,
    },
  });

  const onSubmit = (values: FormValues) => {
    setResult(values.marketingExpenses / values.newCustomers);
  };

  return (
    <div className="space-y-8">
      <Form {...form}>
        <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-6">
          <CardDescription>Measure the cost of acquiring one paying customer.</CardDescription>
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <FormField control={form.control} name="marketingExpenses" render={({ field }) => (
                <FormItem><FormLabel>Total Sales & Marketing Expenses ($)</FormLabel><FormControl><Input type="number" placeholder="e.g., 5000" {...field} value={field.value ?? ''} onChange={e => field.onChange(parseFloat(e.target.value) || undefined)} /></FormControl><FormMessage /></FormItem>
            )} />
            <FormField control={form.control} name="newCustomers" render={({ field }) => (
                <FormItem><FormLabel>New Customers Acquired</FormLabel><FormControl><Input type="number" placeholder="e.g., 100" {...field} value={field.value ?? ''} onChange={e => field.onChange(parseInt(e.target.value) || undefined)} /></FormControl><FormMessage /></FormItem>
            )} />
          </div>
          <Button type="submit">Calculate CAC</Button>
        </form>
      </Form>
      
      {result !== null && (
        <Card className="mt-8">
            <CardHeader><div className='flex items-center gap-4'><UserPlus className="h-8 w-8 text-primary" /><CardTitle>Customer Acquisition Cost (CAC)</CardTitle></div></CardHeader>
            <CardContent>
                <p className="text-3xl font-bold text-center">${result.toFixed(2)}</p>
                <CardDescription className='mt-4 text-center'>This is the average amount you spent to acquire each new customer in the specified period.</CardDescription>
            </CardContent>
        </Card>
      )}

      <Accordion type="single" collapsible className="w-full">
        <AccordionItem value="understanding-inputs">
            <AccordionTrigger>Understanding the Inputs</AccordionTrigger>
            <AccordionContent className="text-muted-foreground space-y-4">
                <div>
                    <h4 className="font-semibold text-foreground mb-1">Total Sales & Marketing Expenses ($)</h4>
                    <p>The total cost of your sales and marketing efforts over a specific period (e.g., one quarter). Include ad spend, salaries of sales/marketing teams, tool subscriptions, etc.</p>
                </div>
                <div>
                    <h4 className="font-semibold text-foreground mb-1">New Customers Acquired</h4>
                    <p>The total number of new, paying customers you acquired during that same period.</p>
                </div>
            </AccordionContent>
        </AccordionItem>
        <AccordionItem value="how-it-works">
            <AccordionTrigger>How It Works</AccordionTrigger>
            <AccordionContent className="text-muted-foreground">
                <p>The Customer Acquisition Cost (CAC) calculator provides a crucial metric for understanding your business's marketing efficiency. It simply divides the total sales and marketing expenses by the number of new customers acquired in that period. A lower CAC is generally better. It's often compared with the Customer Lifetime Value (LTV) to assess the long-term profitability of your acquisition strategy (ideally, LTV should be significantly higher than CAC).</p>
            </AccordionContent>
        </AccordionItem>
      </Accordion>
    </div>
  );
}

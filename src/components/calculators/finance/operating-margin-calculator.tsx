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
  operatingIncome: z.number(),
  revenue: z.number().positive(),
});

type FormValues = z.infer<typeof formSchema>;

export default function OperatingMarginCalculator() {
  const [result, setResult] = useState<number | null>(null);

  const form = useForm<FormValues>({
    resolver: zodResolver(formSchema),
    defaultValues: {
      operatingIncome: undefined,
      revenue: undefined,
    },
  });

  const onSubmit = (values: FormValues) => {
    setResult((values.operatingIncome / values.revenue) * 100);
  };

  return (
    <div className="space-y-8">
      <Form {...form}>
        <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-6">
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <FormField control={form.control} name="operatingIncome" render={({ field }) => (
              <FormItem>
                <FormLabel>Operating Income (EBIT)</FormLabel>
                <FormControl>
                  <Input type="number" {...field} value={field.value ?? ''} onChange={e => field.onChange(parseFloat(e.target.value) || undefined)} />
                </FormControl>
                <FormMessage />
              </FormItem>
            )} />
            <FormField control={form.control} name="revenue" render={({ field }) => (
              <FormItem>
                <FormLabel>Net Sales (Revenue)</FormLabel>
                <FormControl>
                  <Input type="number" {...field} value={field.value ?? ''} onChange={e => field.onChange(parseFloat(e.target.value) || undefined)} />
                </FormControl>
                <FormMessage />
              </FormItem>
            )} />
          </div>
          <Button type="submit">Calculate Operating Margin</Button>
        </form>
      </Form>
      {result !== null && (
        <Card className="mt-8">
          <CardHeader>
            <div className='flex items-center gap-4'><Landmark className="h-8 w-8 text-primary" /><CardTitle>Operating Margin</CardTitle></div>
          </CardHeader>
          <CardContent>
            <p className="text-3xl font-bold text-center">{result.toFixed(2)}%</p>
            <CardDescription className='mt-4 text-center'>For every dollar of revenue, the company keeps {result.toFixed(2)} cents after paying for operating costs.</CardDescription>
          </CardContent>
        </Card>
      )}
      <Accordion type="single" collapsible className="w-full">
        <AccordionItem value="understanding-inputs">
            <AccordionTrigger>Understanding the Inputs</AccordionTrigger>
            <AccordionContent className="text-muted-foreground space-y-4">
                <div>
                    <h4 className="font-semibold text-foreground mb-1">Operating Income (EBIT)</h4>
                    <p>Earnings Before Interest and Taxes, found on the income statement. It's the profit a company generates from its core business operations, without taking into account interest or tax expenses.</p>
                </div>
                <div>
                    <h4 className="font-semibold text-foreground mb-1">Net Sales (Revenue)</h4>
                    <p>The total amount of money generated from sales of goods and services, also found at the top of the income statement.</p>
                </div>
            </AccordionContent>
        </AccordionItem>
        <AccordionItem value="how-it-works">
          <AccordionTrigger>How It Works</AccordionTrigger>
          <AccordionContent className="text-muted-foreground">
            <p>Operating margin is a profitability ratio that measures how much profit a company makes on a dollar of sales, after paying for variable costs of production, such as wages and raw materials, but before paying interest or tax. A higher operating margin is generally better, indicating the company is efficient at its core business.</p>
          </AccordionContent>
        </AccordionItem>
         <AccordionItem value="further-reading">
            <AccordionTrigger>Further Reading</AccordionTrigger>
            <AccordionContent className="text-muted-foreground">
                 <a href="https://www.sec.gov/oiea/investor-alerts-and-bulletins/ib_understanding-financial-ratios" target="_blank" rel="noopener noreferrer" className="text-primary underline">U.S. SEC – Financial Ratios Overview</a>
            </AccordionContent>
        </AccordionItem>
      </Accordion>
    </div>
  );
}

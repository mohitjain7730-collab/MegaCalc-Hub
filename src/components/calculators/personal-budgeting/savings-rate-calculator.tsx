
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
  savings: z.number().positive(),
  income: z.number().positive(),
});

type FormValues = z.infer<typeof formSchema>;

const getSavingsCategory = (rate: number) => {
    if (rate < 5) return { name: 'Low', color: 'text-red-500' };
    if (rate < 15) return { name: 'Building', color: 'text-yellow-500' };
    if (rate < 25) return { name: 'Healthy', color: 'text-green-500' };
    return { name: 'Excellent', color: 'text-emerald-500' };
};

export default function SavingsRateCalculator() {
  const [result, setResult] = useState<{ rate: number, category: { name: string, color: string } } | null>(null);

  const form = useForm<FormValues>({
    resolver: zodResolver(formSchema),
    defaultValues: {
      savings: undefined,
      income: undefined,
    },
  });

  const onSubmit = (values: FormValues) => {
    const rate = (values.savings / values.income) * 100;
    setResult({ rate, category: getSavingsCategory(rate) });
  };

  return (
    <div className="space-y-8">
      <Form {...form}>
        <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-6">
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <FormField control={form.control} name="savings" render={({ field }) => (
              <FormItem>
                <FormLabel>Total Monthly Savings</FormLabel>
                <FormControl>
                  <Input type="number" placeholder="e.g., 750" {...field} value={field.value ?? ''} onChange={e => field.onChange(parseFloat(e.target.value) || undefined)} />
                </FormControl>
                <FormMessage />
              </FormItem>
            )} />
            <FormField control={form.control} name="income" render={({ field }) => (
              <FormItem>
                <FormLabel>Gross Monthly Income</FormLabel>
                <FormControl>
                  <Input type="number" placeholder="e.g., 5000" {...field} value={field.value ?? ''} onChange={e => field.onChange(parseFloat(e.target.value) || undefined)} />
                </FormControl>
                <FormMessage />
              </FormItem>
            )} />
          </div>
          <Button type="submit">Calculate Savings Rate</Button>
        </form>
      </Form>

      {result && (
        <Card className="mt-8">
          <CardHeader>
            <div className='flex items-center gap-4'>
              <TrendingUp className="h-8 w-8 text-primary" />
              <CardTitle>Your Savings Rate</CardTitle>
            </div>
          </CardHeader>
          <CardContent className="text-center">
             <p className="text-4xl font-bold">{result.rate.toFixed(1)}%</p>
             <p className={`mt-2 text-xl font-semibold ${result.category.color}`}>{result.category.name}</p>
             <CardDescription className="mt-4">
                This is the percentage of your gross income you are saving. Financial planners often recommend a savings rate of at least 15% for a healthy financial future.
             </CardDescription>
          </CardContent>
        </Card>
      )}

      <Accordion type="single" collapsible className="w-full">
        <AccordionItem value="understanding-inputs">
          <AccordionTrigger>Understanding the Inputs</AccordionTrigger>
          <AccordionContent className="text-muted-foreground space-y-4">
            <div>
              <h4 className="font-semibold text-foreground">Total Monthly Savings</h4>
              <p>The total amount of money you put into savings and investments each month. This includes contributions to retirement accounts (like a 401(k)), brokerage accounts, and regular savings accounts.</p>
            </div>
            <div>
              <h4 className="font-semibold text-foreground">Gross Monthly Income</h4>
              <p>Your total income for the month before any taxes or deductions are taken out.</p>
            </div>
          </AccordionContent>
        </AccordionItem>
        <AccordionItem value="how-it-works">
          <AccordionTrigger>How It Works</AccordionTrigger>
          <AccordionContent className="text-muted-foreground">
            <p>The Savings Rate calculator shows what percentage of your income you are saving. It's a key indicator of your financial discipline and progress toward long-term goals. The calculation is straightforward: your total monthly savings is divided by your gross monthly income, and the result is multiplied by 100 to get a percentage.</p>
          </AccordionContent>
        </AccordionItem>
      </Accordion>
    </div>
  );
}

    
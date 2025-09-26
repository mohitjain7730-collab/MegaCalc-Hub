
'use client';

import { useState } from 'react';
import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import { z } from 'zod';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Form, FormControl, FormField, FormItem, FormLabel, FormMessage } from '@/components/ui/form';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Scale } from 'lucide-react';
import { Accordion, AccordionContent, AccordionItem, AccordionTrigger } from '@/components/ui/accordion';

const formSchema = z.object({
  income: z.number().positive(),
  expenses: z.number().positive(),
});

type FormValues = z.infer<typeof formSchema>;

export default function MonthlyBudgetSurplusDeficitCalculator() {
  const [result, setResult] = useState<number | null>(null);

  const form = useForm<FormValues>({
    resolver: zodResolver(formSchema),
    defaultValues: {
      income: undefined,
      expenses: undefined,
    },
  });

  const onSubmit = (values: FormValues) => {
    setResult(values.income - values.expenses);
  };

  return (
    <div className="space-y-8">
      <Form {...form}>
        <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-6">
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <FormField control={form.control} name="income" render={({ field }) => (
              <FormItem>
                <FormLabel>Total Monthly Income</FormLabel>
                <FormControl>
                  <Input type="number" placeholder="e.g., 5000" {...field} value={field.value ?? ''} onChange={e => field.onChange(parseFloat(e.target.value) || undefined)} />
                </FormControl>
                <FormMessage />
              </FormItem>
            )} />
            <FormField control={form.control} name="expenses" render={({ field }) => (
              <FormItem>
                <FormLabel>Total Monthly Expenses</FormLabel>
                <FormControl>
                  <Input type="number" placeholder="e.g., 4500" {...field} value={field.value ?? ''} onChange={e => field.onChange(parseFloat(e.target.value) || undefined)} />
                </FormControl>
                <FormMessage />
              </FormItem>
            )} />
          </div>
          <Button type="submit">Calculate</Button>
        </form>
      </Form>

      {result !== null && (
        <Card className="mt-8">
          <CardHeader>
            <div className='flex items-center gap-4'>
              <Scale className="h-8 w-8 text-primary" />
              <CardTitle>Your Monthly Budget Balance</CardTitle>
            </div>
          </CardHeader>
          <CardContent className="text-center">
            {result >= 0 ? (
              <div>
                <CardDescription>You have a monthly surplus of:</CardDescription>
                <p className="text-3xl font-bold text-green-600">${result.toLocaleString()}</p>
              </div>
            ) : (
              <div>
                <CardDescription>You have a monthly deficit of:</CardDescription>
                <p className="text-3xl font-bold text-red-600">${Math.abs(result).toLocaleString()}</p>
              </div>
            )}
            <p className="text-sm text-muted-foreground mt-4">A surplus means you can save or invest more, while a deficit indicates you're spending more than you earn.</p>
          </CardContent>
        </Card>
      )}

      <Accordion type="single" collapsible className="w-full">
        <AccordionItem value="understanding-inputs">
          <AccordionTrigger>Understanding the Inputs</AccordionTrigger>
          <AccordionContent className="text-muted-foreground space-y-4">
            <div>
              <h4 className="font-semibold text-foreground">Total Monthly Income</h4>
              <p>Enter your total combined income from all sources for one month, after taxes.</p>
            </div>
            <div>
              <h4 className="font-semibold text-foreground">Total Monthly Expenses</h4>
              <p>Enter your total combined spending for one month. Include everything from housing and food to entertainment and debt payments.</p>
            </div>
          </AccordionContent>
        </AccordionItem>
        <AccordionItem value="how-it-works">
          <AccordionTrigger>How It Works</AccordionTrigger>
          <AccordionContent className="text-muted-foreground">
            <p>This calculator performs a simple but critical financial health check. It subtracts your total monthly expenses from your total monthly income. A positive result is a budget surplus, meaning you have money left over. A negative result is a budget deficit, indicating that your expenses exceed your income.</p>
          </AccordionContent>
        </AccordionItem>
      </Accordion>
    </div>
  );
}

    
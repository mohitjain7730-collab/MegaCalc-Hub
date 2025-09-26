
'use client';

import { useState } from 'react';
import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import { z } from 'zod';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Form, FormControl, FormField, FormItem, FormLabel, FormMessage } from '@/components/ui/form';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Percent } from 'lucide-react';
import { Accordion, AccordionContent, AccordionItem, AccordionTrigger } from '@/components/ui/accordion';

const formSchema = z.object({
  debt: z.number().positive(),
  income: z.number().positive(),
});

type FormValues = z.infer<typeof formSchema>;

const getDtiCategory = (dti: number) => {
    if (dti <= 36) return { name: 'Healthy', color: 'text-green-500' };
    if (dti <= 43) return { name: 'Manageable', color: 'text-yellow-500' };
    if (dti <= 50) return { name: 'Concerning', color: 'text-orange-500' };
    return { name: 'High Risk', color: 'text-red-500' };
};

export default function DtiRatioCalculator() {
  const [result, setResult] = useState<{ dti: number, category: { name: string, color: string } } | null>(null);

  const form = useForm<FormValues>({
    resolver: zodResolver(formSchema),
    defaultValues: {
      debt: undefined,
      income: undefined,
    },
  });

  const onSubmit = (values: FormValues) => {
    const dti = (values.debt / values.income) * 100;
    setResult({ dti, category: getDtiCategory(dti) });
  };

  return (
    <div className="space-y-8">
      <Form {...form}>
        <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-6">
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <FormField control={form.control} name="debt" render={({ field }) => (
              <FormItem>
                <FormLabel>Total Monthly Debt Payments</FormLabel>
                <FormControl>
                  <Input type="number" placeholder="e.g., 1500" {...field} value={field.value ?? ''} onChange={e => field.onChange(parseFloat(e.target.value) || undefined)} />
                </FormControl>
                <FormMessage />
              </FormItem>
            )} />
            <FormField control={form.control} name="income" render={({ field }) => (
              <FormItem>
                <FormLabel>Gross Monthly Income</FormLabel>
                <FormControl>
                  <Input type="number" placeholder="e.g., 6000" {...field} value={field.value ?? ''} onChange={e => field.onChange(parseFloat(e.target.value) || undefined)} />
                </FormControl>
                <FormMessage />
              </FormItem>
            )} />
          </div>
          <Button type="submit">Calculate DTI</Button>
        </form>
      </Form>

      {result && (
        <Card className="mt-8">
          <CardHeader>
            <div className='flex items-center gap-4'>
              <Percent className="h-8 w-8 text-primary" />
              <CardTitle>Your Debt-to-Income (DTI) Ratio</CardTitle>
            </div>
          </CardHeader>
          <CardContent className="text-center">
            <p className="text-4xl font-bold">{result.dti.toFixed(1)}%</p>
            <p className={`mt-2 text-xl font-semibold ${result.category.color}`}>{result.category.name}</p>
            <CardDescription className="mt-4">
              Lenders use DTI to assess your ability to manage monthly payments and repay debts. A ratio of 36% or lower is generally considered ideal.
            </CardDescription>
          </CardContent>
        </Card>
      )}

      <Accordion type="single" collapsible className="w-full">
        <AccordionItem value="understanding-inputs">
          <AccordionTrigger>Understanding the Inputs</AccordionTrigger>
          <AccordionContent className="text-muted-foreground space-y-4">
            <div>
              <h4 className="font-semibold text-foreground">Total Monthly Debt Payments</h4>
              <p>The sum of all your required minimum monthly debt payments, including rent/mortgage, car loans, student loans, credit card minimums, and other personal loans.</p>
            </div>
            <div>
              <h4 className="font-semibold text-foreground">Gross Monthly Income</h4>
              <p>Your total income before any taxes or deductions are taken out.</p>
            </div>
          </AccordionContent>
        </AccordionItem>
        <AccordionItem value="how-it-works">
          <AccordionTrigger>How It Works</AccordionTrigger>
          <AccordionContent className="text-muted-foreground">
            <p>The Debt-to-Income (DTI) ratio is a key financial metric that compares your total monthly debt payments to your gross monthly income. The calculator divides your total debt payments by your gross income and expresses the result as a percentage. This percentage shows lenders how much of your income is already committed to debt, indicating your capacity to take on new credit.</p>
          </AccordionContent>
        </AccordionItem>
      </Accordion>
    </div>
  );
}

    
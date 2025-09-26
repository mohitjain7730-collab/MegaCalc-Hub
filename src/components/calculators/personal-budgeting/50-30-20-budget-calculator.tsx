
'use client';

import { useState } from 'react';
import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import { z } from 'zod';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Form, FormControl, FormField, FormItem, FormLabel, FormMessage } from '@/components/ui/form';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { PieChart as PieChartIcon } from 'lucide-react';
import { Accordion, AccordionContent, AccordionItem, AccordionTrigger } from '@/components/ui/accordion';
import { PieChart, Pie, Cell, Tooltip, ResponsiveContainer, Legend } from 'recharts';

const formSchema = z.object({
  income: z.number().positive(),
});

type FormValues = z.infer<typeof formSchema>;

interface Result {
  needs: number;
  wants: number;
  savings: number;
}

const COLORS = ['hsl(var(--primary))', 'hsl(var(--chart-2))', 'hsl(var(--chart-3))'];

export default function FiftyThirtyTwentyBudgetCalculator() {
  const [result, setResult] = useState<Result | null>(null);

  const form = useForm<FormValues>({
    resolver: zodResolver(formSchema),
    defaultValues: {
      income: undefined,
    },
  });

  const onSubmit = (values: FormValues) => {
    const needs = values.income * 0.5;
    const wants = values.income * 0.3;
    const savings = values.income * 0.2;
    setResult({ needs, wants, savings });
  };

  const chartData = result ? [
    { name: 'Needs (50%)', value: result.needs },
    { name: 'Wants (30%)', value: result.wants },
    { name: 'Savings (20%)', value: result.savings },
  ] : [];

  return (
    <div className="space-y-8">
      <Form {...form}>
        <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-6">
          <FormField control={form.control} name="income" render={({ field }) => (
            <FormItem>
              <FormLabel>Monthly After-Tax Income</FormLabel>
              <FormControl>
                <Input type="number" placeholder="e.g., 4000" {...field} value={field.value ?? ''} onChange={e => field.onChange(parseFloat(e.target.value) || undefined)} />
              </FormControl>
              <FormMessage />
            </FormItem>
          )} />
          <Button type="submit">Calculate Budget</Button>
        </form>
      </Form>

      {result && (
        <Card className="mt-8">
          <CardHeader>
            <div className='flex items-center gap-4'>
              <PieChartIcon className="h-8 w-8 text-primary" />
              <CardTitle>Your 50/30/20 Budget</CardTitle>
            </div>
          </CardHeader>
          <CardContent>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-8 items-center">
              <div className="space-y-4">
                <div>
                  <p className="text-muted-foreground">Needs (50%)</p>
                  <p className="text-2xl font-bold">${result.needs.toLocaleString()}</p>
                </div>
                <div>
                  <p className="text-muted-foreground">Wants (30%)</p>
                  <p className="text-2xl font-bold">${result.wants.toLocaleString()}</p>
                </div>
                <div>
                  <p className="text-muted-foreground">Savings (20%)</p>
                  <p className="text-2xl font-bold">${result.savings.toLocaleString()}</p>
                </div>
              </div>
              <div className="h-64">
                <ResponsiveContainer width="100%" height="100%">
                  <PieChart>
                    <Pie data={chartData} cx="50%" cy="50%" labelLine={false} outerRadius={80} fill="#8884d8" dataKey="value">
                      {chartData.map((entry, index) => (
                        <Cell key={`cell-${index}`} fill={COLORS[index % COLORS.length]} />
                      ))}
                    </Pie>
                    <Tooltip formatter={(value: number) => `$${value.toLocaleString()}`} />
                    <Legend />
                  </PieChart>
                </ResponsiveContainer>
              </div>
            </div>
          </CardContent>
        </Card>
      )}

      <Accordion type="single" collapsible className="w-full">
        <AccordionItem value="understanding-inputs">
          <AccordionTrigger>Understanding the Inputs</AccordionTrigger>
          <AccordionContent className="text-muted-foreground">
            <div>
              <h4 className="font-semibold text-foreground">Monthly After-Tax Income</h4>
              <p>This is your total take-home pay each month after taxes and other deductions have been taken out of your paycheck.</p>
            </div>
          </AccordionContent>
        </AccordionItem>
        <AccordionItem value="how-it-works">
          <AccordionTrigger>How It Works</AccordionTrigger>
          <AccordionContent className="text-muted-foreground space-y-4">
            <p>The 50/30/20 rule is a simple budgeting guideline to help you manage your money. It allocates your income into three main categories:</p>
            <ul className="list-disc list-inside space-y-2">
              <li><strong>50% for Needs:</strong> Essential expenses required for survival, such as housing, utilities, groceries, and transportation.</li>
              <li><strong>30% for Wants:</strong> Non-essential expenses that improve your quality of life, like dining out, hobbies, and entertainment.</li>
              <li><strong>20% for Savings:</strong> This category includes saving for retirement, building an emergency fund, and paying off debt beyond minimum payments.</li>
            </ul>
          </AccordionContent>
        </AccordionItem>
      </Accordion>
    </div>
  );
}

    
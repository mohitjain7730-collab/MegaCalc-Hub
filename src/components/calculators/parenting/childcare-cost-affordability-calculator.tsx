
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
  householdIncome: z.number().positive(),
  childcareCost: z.number().positive(),
});

type FormValues = z.infer<typeof formSchema>;

const getAffordability = (percentage: number) => {
    if (percentage <= 7) return { text: "Affordable", color: "text-green-500", description: "Your costs are within the U.S. federal affordability benchmark." };
    if (percentage <= 10) return { text: "Manageable", color: "text-yellow-500", description: "Costs are above the federal benchmark but may be manageable." };
    if (percentage <= 20) return { text: "Strained", color: "text-orange-500", description: "Costs are a significant portion of your income, likely causing financial strain." };
    return { text: "High Burden", color: "text-red-500", description: "Costs represent a very high and likely unsustainable portion of your household income." };
}

export default function ChildcareCostAffordabilityCalculator() {
  const [result, setResult] = useState<{ percentage: number; affordability: ReturnType<typeof getAffordability> } | null>(null);

  const form = useForm<FormValues>({
    resolver: zodResolver(formSchema),
    defaultValues: {
      householdIncome: undefined,
      childcareCost: undefined,
    },
  });

  const onSubmit = (values: FormValues) => {
    const percentage = (values.childcareCost / values.householdIncome) * 100;
    setResult({ percentage, affordability: getAffordability(percentage) });
  };

  return (
    <div className="space-y-8">
      <Form {...form}>
        <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-6">
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <FormField control={form.control} name="householdIncome" render={({ field }) => (
              <FormItem>
                <FormLabel>Annual Household Income</FormLabel>
                <FormControl>
                  <Input type="number" placeholder="e.g., 85000" {...field} value={field.value ?? ''} onChange={e => field.onChange(parseFloat(e.target.value) || undefined)} />
                </FormControl>
                <FormMessage />
              </FormItem>
            )} />
            <FormField control={form.control} name="childcareCost" render={({ field }) => (
              <FormItem>
                <FormLabel>Annual Childcare Costs</FormLabel>
                <FormControl>
                  <Input type="number" placeholder="e.g., 15000" {...field} value={field.value ?? ''} onChange={e => field.onChange(parseFloat(e.target.value) || undefined)} />
                </FormControl>
                <FormMessage />
              </FormItem>
            )} />
          </div>
          <Button type="submit">Calculate Affordability</Button>
        </form>
      </Form>

      {result && (
        <Card className="mt-8">
          <CardHeader>
            <div className='flex items-center gap-4'>
              <Percent className="h-8 w-8 text-primary" />
              <CardTitle>Childcare Cost Burden</CardTitle>
            </div>
          </CardHeader>
          <CardContent className="text-center">
            <p className="text-lg">Your childcare costs represent</p>
            <p className="text-4xl font-bold my-2">{result.percentage.toFixed(1)}%</p>
            <p className="text-lg">of your household income.</p>
            <p className={`mt-4 text-xl font-semibold ${result.affordability.color}`}>{result.affordability.text}</p>
            <CardDescription className="mt-1">{result.affordability.description}</CardDescription>
          </CardContent>
        </Card>
      )}

      <Accordion type="single" collapsible className="w-full">
        <AccordionItem value="understanding-inputs">
          <AccordionTrigger>Understanding the Inputs</AccordionTrigger>
          <AccordionContent className="text-muted-foreground space-y-4">
            <div>
              <h4 className="font-semibold text-foreground">Annual Household Income</h4>
              <p>Your total combined income from all sources for one year, before taxes.</p>
            </div>
            <div>
              <h4 className="font-semibold text-foreground">Annual Childcare Costs</h4>
              <p>The total amount you spend on childcare for all your children in one year.</p>
            </div>
          </AccordionContent>
        </AccordionItem>
        <AccordionItem value="how-it-works">
          <AccordionTrigger>How It Works</AccordionTrigger>
          <AccordionContent className="text-muted-foreground">
            <p>This calculator determines what percentage of your gross annual income is consumed by childcare costs. The U.S. Department of Health and Human Services (HHS) has set a benchmark that affordable childcare should cost no more than 7% of a family's household income. This tool compares your percentage to that benchmark to help you assess your financial situation.</p>
          </AccordionContent>
        </AccordionItem>
      </Accordion>
    </div>
  );
}

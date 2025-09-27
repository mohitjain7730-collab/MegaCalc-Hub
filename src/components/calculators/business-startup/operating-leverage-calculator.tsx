
'use client';

import { useState } from 'react';
import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import { z } from 'zod';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Form, FormControl, FormField, FormItem, FormLabel, FormMessage } from '@/components/ui/form';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { SlidersHorizontal } from 'lucide-react';
import { Accordion, AccordionContent, AccordionItem, AccordionTrigger } from '@/components/ui/accordion';

const formSchema = z.object({
  contributionMargin: z.number().positive(),
  operatingIncome: z.number().positive(),
});

type FormValues = z.infer<typeof formSchema>;

export default function OperatingLeverageCalculator() {
  const [result, setResult] = useState<number | null>(null);

  const form = useForm<FormValues>({
    resolver: zodResolver(formSchema),
    defaultValues: {
      contributionMargin: undefined,
      operatingIncome: undefined,
    },
  });

  const onSubmit = (values: FormValues) => {
    setResult(values.contributionMargin / values.operatingIncome);
  };

  return (
    <div className="space-y-8">
      <Form {...form}>
        <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-6">
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <FormField control={form.control} name="contributionMargin" render={({ field }) => (
                <FormItem>
                  <FormLabel>Contribution Margin ($)</FormLabel>
                  <FormControl><Input type="number" {...field} value={field.value ?? ''} onChange={e => field.onChange(parseFloat(e.target.value) || undefined)} /></FormControl>
                  <FormMessage />
                </FormItem>
            )} />
            <FormField control={form.control} name="operatingIncome" render={({ field }) => (
                <FormItem>
                  <FormLabel>Operating Income (EBIT, $)</FormLabel>
                  <FormControl><Input type="number" {...field} value={field.value ?? ''} onChange={e => field.onChange(parseFloat(e.target.value) || undefined)} /></FormControl>
                  <FormMessage />
                </FormItem>
            )} />
          </div>
          <Button type="submit">Calculate DOL</Button>
        </form>
      </Form>
      {result !== null && (
        <Card className="mt-8">
          <CardHeader>
            <div className='flex items-center gap-4'><SlidersHorizontal className="h-8 w-8 text-primary" /><CardTitle>Degree of Operating Leverage (DOL)</CardTitle></div>
          </CardHeader>
          <CardContent>
            <p className="text-3xl font-bold text-center">{result.toFixed(2)}</p>
            <CardDescription className='mt-4 text-center'>A DOL of {result.toFixed(2)} means a 1% change in sales will result in a {result.toFixed(2)}% change in operating income. Higher DOL means higher business risk.</CardDescription>
          </CardContent>
        </Card>
      )}
      <Accordion type="single" collapsible className="w-full">
        <AccordionItem value="how-it-works">
          <AccordionTrigger>How It Works</AccordionTrigger>
          <AccordionContent className="text-muted-foreground">Operating leverage measures how sensitive a company's operating income is to a change in its sales. It's determined by the proportion of fixed costs to variable costs. This calculator divides the Contribution Margin (Sales - Variable Costs) by the Operating Income to find the DOL, a key metric for understanding business risk.</AccordionContent>
        </AccordionItem>
      </Accordion>
    </div>
  );
}

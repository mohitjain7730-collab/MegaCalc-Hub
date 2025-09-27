
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
  netIncome: z.number(),
  interest: z.number(),
  taxes: z.number(),
  depreciation: z.number().nonnegative(),
  amortization: z.number().nonnegative(),
});

type FormValues = z.infer<typeof formSchema>;

export default function EbitdaEbitCalculator() {
  const [result, setResult] = useState<{ ebit: number; ebitda: number } | null>(null);

  const form = useForm<FormValues>({
    resolver: zodResolver(formSchema),
    defaultValues: {
      netIncome: undefined,
      interest: undefined,
      taxes: undefined,
      depreciation: undefined,
      amortization: undefined,
    },
  });

  const onSubmit = (values: FormValues) => {
    const ebit = values.netIncome + values.interest + values.taxes;
    const ebitda = ebit + values.depreciation + values.amortization;
    setResult({ ebit, ebitda });
  };

  return (
    <div className="space-y-8">
      <Form {...form}>
        <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-6">
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <FormField control={form.control} name="netIncome" render={({ field }) => (
              <FormItem><FormLabel>Net Income ($)</FormLabel><FormControl><Input type="number" {...field} value={field.value ?? ''} onChange={e => field.onChange(parseFloat(e.target.value))} /></FormControl><FormMessage /></FormItem>
            )} />
            <FormField control={form.control} name="interest" render={({ field }) => (
              <FormItem><FormLabel>Interest Expense ($)</FormLabel><FormControl><Input type="number" {...field} value={field.value ?? ''} onChange={e => field.onChange(parseFloat(e.target.value))} /></FormControl><FormMessage /></FormItem>
            )} />
            <FormField control={form.control} name="taxes" render={({ field }) => (
              <FormItem><FormLabel>Taxes ($)</FormLabel><FormControl><Input type="number" {...field} value={field.value ?? ''} onChange={e => field.onChange(parseFloat(e.target.value))} /></FormControl><FormMessage /></FormItem>
            )} />
            <FormField control={form.control} name="depreciation" render={({ field }) => (
              <FormItem><FormLabel>Depreciation ($)</FormLabel><FormControl><Input type="number" {...field} value={field.value ?? ''} onChange={e => field.onChange(parseFloat(e.target.value))} /></FormControl><FormMessage /></FormItem>
            )} />
            <FormField control={form.control} name="amortization" render={({ field }) => (
              <FormItem><FormLabel>Amortization ($)</FormLabel><FormControl><Input type="number" {...field} value={field.value ?? ''} onChange={e => field.onChange(parseFloat(e.target.value))} /></FormControl><FormMessage /></FormItem>
            )} />
          </div>
          <Button type="submit">Calculate</Button>
        </form>
      </Form>
      {result !== null && (
        <Card className="mt-8">
          <CardHeader>
            <div className='flex items-center gap-4'>
              <Landmark className="h-8 w-8 text-primary" />
              <CardTitle>EBIT & EBITDA</CardTitle>
            </div>
          </CardHeader>
          <CardContent className="grid grid-cols-1 md:grid-cols-2 gap-4 text-center">
            <div>
              <p className="font-semibold text-lg">EBIT</p>
              <p className="text-2xl font-bold">${result.ebit.toLocaleString()}</p>
            </div>
            <div>
              <p className="font-semibold text-lg">EBITDA</p>
              <p className="text-2xl font-bold">${result.ebitda.toLocaleString()}</p>
            </div>
          </CardContent>
        </Card>
      )}
      <Accordion type="single" collapsible className="w-full">
        <AccordionItem value="understanding-inputs">
          <AccordionTrigger>Understanding the Inputs</AccordionTrigger>
          <AccordionContent className="text-muted-foreground space-y-4">
            <p>All inputs can typically be found on a company's income statement.</p>
            <ul className="list-disc list-inside space-y-1">
              <li><strong>Net Income:</strong> The company's profit after all expenses, including taxes and interest, have been deducted.</li>
              <li><strong>Interest & Taxes:</strong> The amounts paid for interest on debt and corporate taxes.</li>
              <li><strong>Depreciation & Amortization:</strong> Non-cash expenses that account for the reduction in value of tangible (depreciation) and intangible (amortization) assets over time.</li>
            </ul>
          </AccordionContent>
        </AccordionItem>
        <AccordionItem value="how-it-works">
          <AccordionTrigger>How It Works</AccordionTrigger>
          <AccordionContent className="text-muted-foreground">
            <p>EBIT (Earnings Before Interest and Taxes) and EBITDA (Earnings Before Interest, Taxes, Depreciation, and Amortization) are metrics used to analyze a company's operating performance without the distortion of accounting and financing decisions. This calculator adds back interest and tax expenses to net income to find EBIT, and then adds back depreciation and amortization to find EBITDA.</p>
          </AccordionContent>
        </AccordionItem>
      </Accordion>
    </div>
  );
}

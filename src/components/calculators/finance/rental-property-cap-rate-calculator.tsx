'use client';

import { useState } from 'react';
import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import { z } from 'zod';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Form, FormControl, FormField, FormItem, FormLabel, FormMessage } from '@/components/ui/form';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Accordion, AccordionContent, AccordionItem, AccordionTrigger } from '@/components/ui/accordion';
import { Landmark } from 'lucide-react';

const formSchema = z.object({
  purchasePrice: z.number().positive(),
  noi: z.number().nonnegative().optional().nullable(),
  grossRentAnnual: z.number().nonnegative().optional().nullable(),
  operatingExpensesAnnual: z.number().nonnegative().optional().nullable(),
});

type FormValues = z.infer<typeof formSchema>;

export default function RentalPropertyCapRateCalculator() {
  const [result, setResult] = useState<{ noi: number; capRatePct: number; opinion: string } | null>(null);

  const form = useForm<FormValues>({
    resolver: zodResolver(formSchema),
    defaultValues: {
      purchasePrice: undefined,
      noi: undefined,
      grossRentAnnual: undefined,
      operatingExpensesAnnual: undefined,
    },
  });

  const onSubmit = (v: FormValues) => {
    const computedNoi = v.noi ?? Math.max(0, (v.grossRentAnnual || 0) - (v.operatingExpensesAnnual || 0));
    const capRatePct = v.purchasePrice > 0 ? (computedNoi / v.purchasePrice) * 100 : 0;
    let opinion = 'Compare cap rate to local market norms for property type and risk.';
    if (capRatePct < 4) opinion = 'Low cap rate: priced for appreciation or prime location, not income.';
    else if (capRatePct > 8) opinion = 'High cap rate: higher income but potentially higher risk or deferred maintenance.';
    setResult({ noi: computedNoi, capRatePct, opinion });
  };

  return (
    <div className="space-y-8">
      <Form {...form}>
        <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-6">
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <FormField control={form.control} name="purchasePrice" render={({ field }) => (
              <FormItem><FormLabel>Purchase Price ($)</FormLabel><FormControl><Input type="number" {...field} value={field.value ?? ''} onChange={e=>field.onChange(parseFloat(e.target.value)||undefined)} /></FormControl><FormMessage /></FormItem>
            )} />
            <FormField control={form.control} name="noi" render={({ field }) => (
              <FormItem><FormLabel>Net Operating Income (NOI) – annual ($)</FormLabel><FormControl><Input type="number" {...field} value={(field.value as number|undefined) ?? ''} onChange={e=>field.onChange(parseFloat(e.target.value)||undefined)} /></FormControl><FormMessage /></FormItem>
            )} />
            <FormField control={form.control} name="grossRentAnnual" render={({ field }) => (
              <FormItem><FormLabel>Gross Rent – annual ($) [optional]</FormLabel><FormControl><Input type="number" {...field} value={(field.value as number|undefined) ?? ''} onChange={e=>field.onChange(parseFloat(e.target.value)||undefined)} /></FormControl><FormMessage /></FormItem>
            )} />
            <FormField control={form.control} name="operatingExpensesAnnual" render={({ field }) => (
              <FormItem><FormLabel>Operating Expenses – annual ($) [optional]</FormLabel><FormControl><Input type="number" {...field} value={(field.value as number|undefined) ?? ''} onChange={e=>field.onChange(parseFloat(e.target.value)||undefined)} /></FormControl><FormMessage /></FormItem>
            )} />
          </div>
          <Button type="submit">Calculate Cap Rate</Button>
        </form>
      </Form>

      {result && (
        <Card className="mt-8">
          <CardHeader>
            <div className='flex items-center gap-4'><Landmark className="h-8 w-8 text-primary" /><CardTitle>Cap Rate Result</CardTitle></div>
            <CardDescription>NOI and cap rate snapshot. Inputs are blank until provided.</CardDescription>
          </CardHeader>
          <CardContent>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4 text-center">
              <div><p className="text-sm text-muted-foreground">NOI</p><p className="text-2xl font-bold">${result.noi.toLocaleString()}</p></div>
              <div><p className="text-sm text-muted-foreground">Cap Rate</p><p className="text-2xl font-bold">{result.capRatePct.toFixed(2)}%</p></div>
            </div>
            <div className="mt-4 text-center"><CardDescription>{result.opinion}</CardDescription></div>
          </CardContent>
        </Card>
      )}

      <Accordion type="single" collapsible className="w-full">
        <AccordionItem value="related"><AccordionTrigger>Related calculators</AccordionTrigger><AccordionContent className="text-muted-foreground space-y-2"><ul className="list-disc list-inside"><li>Real Estate Cash-on-Cash Return</li><li>Mortgage Payment</li><li>Mortgage Refinance Savings</li></ul></AccordionContent></AccordionItem>
        <AccordionItem value="guide"><AccordionTrigger>Cap Rate Guide</AccordionTrigger><AccordionContent className="text-muted-foreground space-y-3 prose prose-sm dark:prose-invert max-w-none"><h3>What is cap rate?</h3><p>Capitalization rate equals NOI divided by purchase price. It reflects unlevered yield before financing.</p><h4>How to use</h4><ul><li>Compare properties within the same market and class.</li><li>Check that NOI excludes debt service and capital expenditures.</li></ul><p className="text-xs">Disclaimer: Informational only, not financial advice.</p></AccordionContent></AccordionItem>
      </Accordion>
    </div>
  );
}



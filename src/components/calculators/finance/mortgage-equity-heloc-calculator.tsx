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
  homeValue: z.number().positive(),
  firstMortgageBalance: z.number().nonnegative(),
  secondMortgageBalance: z.number().nonnegative().optional().nullable(),
  lenderMaxLtvPercent: z.number().positive(),
});

type FormValues = z.infer<typeof formSchema>;

type EquityResult = {
  equity: number;
  cltvPercent: number;
  estimatedMaxHeloc: number;
  opinion: string;
};

export default function MortgageEquityHelocCalculator() {
  const [res, setRes] = useState<EquityResult | null>(null);
  const form = useForm<FormValues>({
    resolver: zodResolver(formSchema),
    defaultValues: {
      homeValue: undefined,
      firstMortgageBalance: undefined,
      secondMortgageBalance: undefined,
      lenderMaxLtvPercent: undefined,
    },
  });

  const onSubmit = (v: FormValues) => {
    const totalLiens = (v.firstMortgageBalance || 0) + (v.secondMortgageBalance || 0);
    const equity = Math.max(0, v.homeValue - totalLiens);
    const cltv = v.homeValue > 0 ? (totalLiens / v.homeValue) * 100 : 0;
    const maxAllowedLiens = (v.lenderMaxLtvPercent / 100) * v.homeValue;
    const estimatedMaxHeloc = Math.max(0, maxAllowedLiens - totalLiens);
    let opinion = 'Healthy equity improves approval odds and terms. Keep CLTV within lender limits.';
    if (cltv > v.lenderMaxLtvPercent) opinion = 'Current CLTV exceeds typical limits. You may need to reduce balances or wait for appreciation.';
    setRes({ equity, cltvPercent: cltv, estimatedMaxHeloc, opinion });
  };

  return (
    <div className="space-y-8">
      <Form {...form}>
        <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-6">
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <FormField control={form.control} name="homeValue" render={({ field }) => (
              <FormItem><FormLabel>Home Value ($)</FormLabel><FormControl><Input type="number" {...field} value={field.value ?? ''} onChange={e=>field.onChange(parseFloat(e.target.value)||undefined)} /></FormControl><FormMessage /></FormItem>
            )} />
            <FormField control={form.control} name="firstMortgageBalance" render={({ field }) => (
              <FormItem><FormLabel>1st Mortgage Balance ($)</FormLabel><FormControl><Input type="number" {...field} value={field.value ?? ''} onChange={e=>field.onChange(parseFloat(e.target.value)||undefined)} /></FormControl><FormMessage /></FormItem>
            )} />
            <FormField control={form.control} name="secondMortgageBalance" render={({ field }) => (
              <FormItem><FormLabel>2nd Mortgage/HELOC Balance ($)</FormLabel><FormControl><Input type="number" {...field} value={(field.value as number|undefined) ?? ''} onChange={e=>field.onChange(parseFloat(e.target.value)||undefined)} /></FormControl><FormMessage /></FormItem>
            )} />
            <FormField control={form.control} name="lenderMaxLtvPercent" render={({ field }) => (
              <FormItem><FormLabel>Lender Max CLTV (%)</FormLabel><FormControl><Input type="number" step="0.1" {...field} value={field.value ?? ''} onChange={e=>field.onChange(parseFloat(e.target.value)||undefined)} /></FormControl><FormMessage /></FormItem>
            )} />
          </div>
          <Button type="submit">Estimate Equity & HELOC</Button>
        </form>
      </Form>

      {res && (
        <Card className="mt-8">
          <CardHeader>
            <div className='flex items-center gap-4'><Landmark className="h-8 w-8 text-primary" /><CardTitle>Home Equity & HELOC Estimate</CardTitle></div>
            <CardDescription>Inputs stay blank so you can enter your values.</CardDescription>
          </CardHeader>
          <CardContent>
            <div className="grid grid-cols-1 md:grid-cols-3 gap-4 text-center">
              <div><p className="text-sm text-muted-foreground">Equity</p><p className="text-2xl font-bold">${res.equity.toLocaleString()}</p></div>
              <div><p className="text-sm text-muted-foreground">CLTV</p><p className="text-2xl font-bold">{res.cltvPercent.toFixed(1)}%</p></div>
              <div><p className="text-sm text-muted-foreground">Est. Max HELOC</p><p className="text-2xl font-bold">${res.estimatedMaxHeloc.toLocaleString()}</p></div>
            </div>
            <div className="mt-4 text-center"><CardDescription>{res.opinion}</CardDescription></div>
          </CardContent>
        </Card>
      )}

      <Accordion type="single" collapsible className="w-full">
        <AccordionItem value="related"><AccordionTrigger>Related calculators</AccordionTrigger><AccordionContent className="text-muted-foreground space-y-2"><ul className="list-disc list-inside"><li>Mortgage Refinance Savings</li><li>ARM Payment Projection</li><li>Mortgage Payment</li></ul></AccordionContent></AccordionItem>
        <AccordionItem value="guide"><AccordionTrigger>Home Equity & HELOC Guide</AccordionTrigger><AccordionContent className="text-muted-foreground space-y-3 prose prose-sm dark:prose-invert max-w-none"><h3>Understanding equity</h3><p>Home equity equals your property value minus all mortgage balances. Lenders often cap combined loan-to-value (CLTV) between 75–90% depending on credit and property type.</p><h4>HELOC vs. Home Equity Loan</h4><ul><li>HELOC: revolving line, variable rate.</li><li>Home equity loan: lump sum, fixed rate.</li></ul><h4>Tips</h4><ul><li>Keep CLTV below lender thresholds for best terms.</li><li>Have a payoff plan for variable-rate risk.</li></ul><p className="text-xs">Disclaimer: Informational only, not financial advice.</p></AccordionContent></AccordionItem>
      </Accordion>
    </div>
  );
}



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
  downPayment: z.number().nonnegative(),
  closingCosts: z.number().nonnegative(),
  rehabCosts: z.number().nonnegative(),
  noiAnnual: z.number().nonnegative(),
  annualDebtService: z.number().nonnegative(),
});

type FormValues = z.infer<typeof formSchema>;

export default function RealEstateCashOnCashReturnCalculator() {
  const [res, setRes] = useState<{ cashInvested: number; annualCashFlow: number; cocPct: number; opinion: string } | null>(null);
  const form = useForm<FormValues>({
    resolver: zodResolver(formSchema),
    defaultValues: { downPayment: undefined, closingCosts: undefined, rehabCosts: undefined, noiAnnual: undefined, annualDebtService: undefined },
  });

  const onSubmit = (v: FormValues) => {
    const cashInvested = (v.downPayment || 0) + (v.closingCosts || 0) + (v.rehabCosts || 0);
    const annualCashFlow = Math.max(0, (v.noiAnnual || 0) - (v.annualDebtService || 0));
    const cocPct = cashInvested > 0 ? (annualCashFlow / cashInvested) * 100 : 0;
    let opinion = 'Use cash-on-cash to compare leveraged returns across deals.';
    if (cocPct < 6) opinion = 'Low cash-on-cash. Consider improving NOI or negotiating price.';
    else if (cocPct > 12) opinion = 'Strong cash-on-cash, verify assumptions and risk (vacancy, capex).';
    setRes({ cashInvested, annualCashFlow, cocPct, opinion });
  };

  return (
    <div className="space-y-8">
      <Form {...form}>
        <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-6">
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <FormField control={form.control} name="downPayment" render={({ field }) => (
              <FormItem><FormLabel>Down Payment ($)</FormLabel><FormControl><Input type="number" {...field} value={field.value ?? ''} onChange={e=>field.onChange(parseFloat(e.target.value)||undefined)} /></FormControl><FormMessage /></FormItem>
            )} />
            <FormField control={form.control} name="closingCosts" render={({ field }) => (
              <FormItem><FormLabel>Closing Costs ($)</FormLabel><FormControl><Input type="number" {...field} value={field.value ?? ''} onChange={e=>field.onChange(parseFloat(e.target.value)||undefined)} /></FormControl><FormMessage /></FormItem>
            )} />
            <FormField control={form.control} name="rehabCosts" render={({ field }) => (
              <FormItem><FormLabel>Rehab/Upfront CapEx ($)</FormLabel><FormControl><Input type="number" {...field} value={field.value ?? ''} onChange={e=>field.onChange(parseFloat(e.target.value)||undefined)} /></FormControl><FormMessage /></FormItem>
            )} />
            <FormField control={form.control} name="noiAnnual" render={({ field }) => (
              <FormItem><FormLabel>NOI – annual ($)</FormLabel><FormControl><Input type="number" {...field} value={field.value ?? ''} onChange={e=>field.onChange(parseFloat(e.target.value)||undefined)} /></FormControl><FormMessage /></FormItem>
            )} />
            <FormField control={form.control} name="annualDebtService" render={({ field }) => (
              <FormItem><FormLabel>Annual Debt Service ($)</FormLabel><FormControl><Input type="number" {...field} value={field.value ?? ''} onChange={e=>field.onChange(parseFloat(e.target.value)||undefined)} /></FormControl><FormMessage /></FormItem>
            )} />
          </div>
          <Button type="submit">Calculate Cash-on-Cash Return</Button>
        </form>
      </Form>

      {res && (
        <Card className="mt-8">
          <CardHeader>
            <div className='flex items-center gap-4'><Landmark className="h-8 w-8 text-primary" /><CardTitle>Cash-on-Cash ROI</CardTitle></div>
            <CardDescription>Shows leveraged return on your cash invested.</CardDescription>
          </CardHeader>
          <CardContent>
            <div className="grid grid-cols-1 md:grid-cols-3 gap-4 text-center">
              <div><p className="text-sm text-muted-foreground">Cash Invested</p><p className="text-2xl font-bold">${res.cashInvested.toLocaleString()}</p></div>
              <div><p className="text-sm text-muted-foreground">Annual Cash Flow</p><p className="text-2xl font-bold">${res.annualCashFlow.toLocaleString()}</p></div>
              <div><p className="text-sm text-muted-foreground">Cash-on-Cash</p><p className="text-2xl font-bold">{res.cocPct.toFixed(2)}%</p></div>
            </div>
            <div className="mt-4 text-center"><CardDescription>{res.opinion}</CardDescription></div>
          </CardContent>
        </Card>
      )}

      <Accordion type="single" collapsible className="w-full">
        <AccordionItem value="related"><AccordionTrigger>Related calculators</AccordionTrigger><AccordionContent className="text-muted-foreground space-y-2"><ul className="list-disc list-inside"><li>Rental Property Cap Rate</li><li>Mortgage Payment</li><li>Mortgage Refinance Savings</li></ul></AccordionContent></AccordionItem>
        <AccordionItem value="guide"><AccordionTrigger>Cash-on-Cash ROI Guide</AccordionTrigger><AccordionContent className="text-muted-foreground space-y-3 prose prose-sm dark:prose-invert max-w-none"><h3>What is cash-on-cash?</h3><p>Cash-on-cash return equals annual pre-tax cash flow divided by total cash invested. It isolates the impact of leverage and operations on your out-of-pocket cash.</p><h4>Improve CoC</h4><ul><li>Increase NOI by optimizing rent and reducing controllable expenses.</li><li>Lower acquisition costs or increase leverage prudently.</li></ul><p className="text-xs">Disclaimer: Informational only, not financial advice.</p></AccordionContent></AccordionItem>
      </Accordion>
    </div>
  );
}



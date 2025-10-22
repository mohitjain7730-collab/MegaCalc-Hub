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
  currentBalance: z.number().positive(),
  currentRatePercent: z.number().nonnegative(),
  remainingTermYears: z.number().positive(),
  newRatePercent: z.number().nonnegative(),
  newTermYears: z.number().positive(),
  closingCosts: z.number().nonnegative(),
});

type FormValues = z.infer<typeof formSchema>;

type RefiResult = {
  currentPayment: number;
  newPayment: number;
  monthlySavings: number;
  breakevenMonths: number | null;
  totalInterestRemainingCurrent: number;
  totalInterestNew: number;
  totalSavings: number;
  opinion: string;
};

function monthlyPayment(principal: number, annualRatePct: number, months: number): number {
  const r = annualRatePct / 100 / 12;
  if (r === 0) return principal / months;
  return (principal * r * Math.pow(1 + r, months)) / (Math.pow(1 + r, months) - 1);
}

export default function MortgageRefinanceSavingsCalculator() {
  const [res, setRes] = useState<RefiResult | null>(null);

  const form = useForm<FormValues>({
    resolver: zodResolver(formSchema),
    defaultValues: {
      currentBalance: undefined,
      currentRatePercent: undefined,
      remainingTermYears: undefined,
      newRatePercent: undefined,
      newTermYears: undefined,
      closingCosts: undefined,
    },
  });

  const onSubmit = (v: FormValues) => {
    const remainingMonths = v.remainingTermYears * 12;
    const currentPmt = monthlyPayment(v.currentBalance, v.currentRatePercent, remainingMonths);
    const newMonths = v.newTermYears * 12;
    const newPmt = monthlyPayment(v.currentBalance, v.newRatePercent, newMonths);
    const monthlySavings = Math.max(0, currentPmt - newPmt);

    // Interest remaining (approx) using payment schedule without extra payments
    const totalPaidCurrent = currentPmt * remainingMonths;
    const totalInterestRemainingCurrent = Math.max(0, totalPaidCurrent - v.currentBalance);
    const totalPaidNew = newPmt * newMonths;
    const totalInterestNew = Math.max(0, totalPaidNew - v.currentBalance);

    const breakevenMonths = monthlySavings > 0 ? Math.ceil(v.closingCosts / monthlySavings) : null;
    const totalSavings = (totalInterestRemainingCurrent - totalInterestNew) - v.closingCosts;

    let opinion = 'Refinance may help if you plan to keep the loan long enough to recoup closing costs.';
    if (monthlySavings <= 0) opinion = 'New payment is not lower. Consider staying with your current loan.';
    else if (breakevenMonths !== null && breakevenMonths > 48) opinion = 'Long breakeven period. Refi only if you expect to hold the loan for many years.';
    else if (totalSavings > 0) opinion = 'Refi appears favorable: lower payment and positive lifetime savings after costs.';

    setRes({ currentPayment: currentPmt, newPayment: newPmt, monthlySavings, breakevenMonths, totalInterestRemainingCurrent, totalInterestNew, totalSavings, opinion });
  };

  return (
    <div className="space-y-8">
      <Form {...form}>
        <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-6">
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <FormField control={form.control} name="currentBalance" render={({ field }) => (
              <FormItem><FormLabel>Current Loan Balance ($)</FormLabel><FormControl><Input type="number" {...field} value={field.value ?? ''} onChange={e=>field.onChange(parseFloat(e.target.value)||undefined)} /></FormControl><FormMessage /></FormItem>
            )} />
            <FormField control={form.control} name="currentRatePercent" render={({ field }) => (
              <FormItem><FormLabel>Current Rate (%)</FormLabel><FormControl><Input type="number" step="0.01" {...field} value={field.value ?? ''} onChange={e=>field.onChange(parseFloat(e.target.value)||undefined)} /></FormControl><FormMessage /></FormItem>
            )} />
            <FormField control={form.control} name="remainingTermYears" render={({ field }) => (
              <FormItem><FormLabel>Remaining Term (years)</FormLabel><FormControl><Input type="number" {...field} value={field.value ?? ''} onChange={e=>field.onChange(parseFloat(e.target.value)||undefined)} /></FormControl><FormMessage /></FormItem>
            )} />
            <FormField control={form.control} name="newRatePercent" render={({ field }) => (
              <FormItem><FormLabel>New Rate (%)</FormLabel><FormControl><Input type="number" step="0.01" {...field} value={field.value ?? ''} onChange={e=>field.onChange(parseFloat(e.target.value)||undefined)} /></FormControl><FormMessage /></FormItem>
            )} />
            <FormField control={form.control} name="newTermYears" render={({ field }) => (
              <FormItem><FormLabel>New Term (years)</FormLabel><FormControl><Input type="number" {...field} value={field.value ?? ''} onChange={e=>field.onChange(parseFloat(e.target.value)||undefined)} /></FormControl><FormMessage /></FormItem>
            )} />
            <FormField control={form.control} name="closingCosts" render={({ field }) => (
              <FormItem className="md:col-span-2"><FormLabel>Closing Costs ($)</FormLabel><FormControl><Input type="number" {...field} value={field.value ?? ''} onChange={e=>field.onChange(parseFloat(e.target.value)||undefined)} /></FormControl><FormMessage /></FormItem>
            )} />
          </div>
          <Button type="submit">Calculate Refinance Savings</Button>
        </form>
      </Form>

      {res && (
        <Card className="mt-8">
          <CardHeader>
            <div className='flex items-center gap-4'><Landmark className="h-8 w-8 text-primary" /><CardTitle>Refinance Comparison</CardTitle></div>
            <CardDescription>Your personalized comparison. Inputs remain blank until you enter values.</CardDescription>
          </CardHeader>
          <CardContent>
            <div className="grid grid-cols-1 md:grid-cols-3 gap-4 text-center">
              <div><p className="text-sm text-muted-foreground">Current Payment</p><p className="text-2xl font-bold">${res.currentPayment.toLocaleString(undefined,{maximumFractionDigits:2})}</p></div>
              <div><p className="text-sm text-muted-foreground">New Payment</p><p className="text-2xl font-bold">${res.newPayment.toLocaleString(undefined,{maximumFractionDigits:2})}</p></div>
              <div><p className="text-sm text-muted-foreground">Monthly Savings</p><p className="text-2xl font-bold">${res.monthlySavings.toLocaleString(undefined,{maximumFractionDigits:2})}</p></div>
            </div>
            <div className="grid grid-cols-1 md:grid-cols-3 gap-4 text-center mt-6">
              <div><p className="text-sm text-muted-foreground">Breakeven</p><p className="text-xl font-semibold">{res.breakevenMonths === null ? 'N/A' : `${res.breakevenMonths} mo`}</p></div>
              <div><p className="text-sm text-muted-foreground">Interest Remaining (Current)</p><p className="text-xl font-semibold">${res.totalInterestRemainingCurrent.toLocaleString(undefined,{maximumFractionDigits:0})}</p></div>
              <div><p className="text-sm text-muted-foreground">Interest (New)</p><p className="text-xl font-semibold">${res.totalInterestNew.toLocaleString(undefined,{maximumFractionDigits:0})}</p></div>
            </div>
            <div className="text-center mt-6"><p className="text-sm text-muted-foreground">Estimated Lifetime Savings after costs</p><p className="text-2xl font-bold">${res.totalSavings.toLocaleString(undefined,{maximumFractionDigits:0})}</p></div>
            <div className="mt-4 text-center"><CardDescription>{res.opinion}</CardDescription></div>
          </CardContent>
        </Card>
      )}

      <Accordion type="single" collapsible className="w-full">
        <AccordionItem value="related"><AccordionTrigger>Related calculators</AccordionTrigger><AccordionContent className="text-muted-foreground space-y-2"><ul className="list-disc list-inside"><li>Mortgage Payment Calculator</li><li>ARM Payment Projection</li><li>Loan Amortization with Extra Payments</li></ul></AccordionContent></AccordionItem>
        <AccordionItem value="guide"><AccordionTrigger>Refinance Guide: Rates, terms, and breakeven</AccordionTrigger><AccordionContent className="text-muted-foreground space-y-3 prose prose-sm dark:prose-invert max-w-none"><h3>When does refinancing make sense?</h3><p>Refinancing replaces your existing mortgage with a new one, ideally at a lower rate or shorter term. Weigh lower monthly payments against closing costs and the time you expect to keep the loan.</p><h4>Breakeven math</h4><p>Divide closing costs by monthly savings to estimate months to recoup costs. If you plan to keep the home longer than breakeven, refinancing can be attractive.</p><h4>Other considerations</h4><ul><li>Resetting to a longer term can increase lifetime interest.</li><li>Consider no-cost loans (higher rate) vs. paying points.</li><li>Confirm no prepayment penalty on your current loan.</li></ul><p className="text-xs">Disclaimer: Informational only, not financial advice.</p></AccordionContent></AccordionItem>
      </Accordion>
    </div>
  );
}



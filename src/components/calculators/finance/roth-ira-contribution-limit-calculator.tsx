
'use client';

import { useState } from 'react';
import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import { z } from 'zod';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Form, FormControl, FormField, FormItem, FormLabel, FormMessage } from '@/components/ui/form';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Target } from 'lucide-react';
import { Accordion, AccordionContent, AccordionItem, AccordionTrigger } from '@/components/ui/accordion';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';

const formSchema = z.object({
  filingStatus: z.enum(['single', 'mfj', 'mfs']),
  magi: z.number().nonnegative(),
  age: z.number().int().positive(),
});

type FormValues = z.infer<typeof formSchema>;

// Using 2024 IRS data
const year = 2024;
const limits = {
  standard: 7000,
  catchUp: 1000,
};
const phaseOuts = {
  single: { start: 146000, end: 161000, range: 15000 },
  mfj: { start: 230000, end: 240000, range: 10000 },
  mfs: { start: 0, end: 10000, range: 10000 },
};

export default function RothIraContributionLimitCalculator() {
  const [result, setResult] = useState<number | null>(null);

  const form = useForm<FormValues>({
    resolver: zodResolver(formSchema),
    defaultValues: {
      filingStatus: 'single',
      magi: undefined,
      age: undefined,
    },
  });

  const onSubmit = (values: FormValues) => {
    const { filingStatus, magi, age } = values;
    const baseLimit = age >= 50 ? limits.standard + limits.catchUp : limits.standard;
    const phaseOut = phaseOuts[filingStatus];

    if (magi >= phaseOut.end) {
      setResult(0);
      return;
    }

    if (magi > phaseOut.start) {
      const reduction = (magi - phaseOut.start) / phaseOut.range;
      const reducedLimit = baseLimit * (1 - reduction);
      setResult(Math.max(200, Math.floor(reducedLimit / 10) * 10)); // Round down to nearest $10, min $200
      return;
    }

    setResult(baseLimit);
  };

  return (
    <div className="space-y-8">
      <Form {...form}>
        <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-6">
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <FormField control={form.control} name="filingStatus" render={({ field }) => (
                <FormItem>
                    <FormLabel>Filing Status ({year})</FormLabel>
                    <Select onValueChange={field.onChange} defaultValue={field.value}>
                        <FormControl><SelectTrigger><SelectValue /></SelectTrigger></FormControl>
                        <SelectContent>
                            <SelectItem value="single">Single, Head of Household, or Married Filing Separately (didn't live with spouse)</SelectItem>
                            <SelectItem value="mfj">Married Filing Jointly or Qualifying Widow(er)</SelectItem>
                            <SelectItem value="mfs">Married Filing Separately (lived with spouse)</SelectItem>
                        </SelectContent>
                    </Select>
                </FormItem>
            )} />
            <FormField control={form.control} name="age" render={({ field }) => (
                <FormItem><FormLabel>Your Age (years)</FormLabel><FormControl><Input type="number" {...field} value={field.value ?? ''} onChange={e => field.onChange(parseInt(e.target.value) || undefined)} /></FormControl><FormMessage /></FormItem>
            )} />
             <FormField control={form.control} name="magi" render={({ field }) => (
                <FormItem className="md:col-span-2"><FormLabel>Modified Adjusted Gross Income (MAGI)</FormLabel><FormControl><Input type="number" {...field} value={field.value ?? ''} onChange={e => field.onChange(parseFloat(e.target.value) || undefined)} /></FormControl><FormMessage /></FormItem>
            )} />
          </div>
          <Button type="submit">Calculate Limit</Button>
        </form>
      </Form>
      {result !== null && (
        <Card className="mt-8">
            <CardHeader><div className='flex items-center gap-4'><Target className="h-8 w-8 text-primary" /><CardTitle>Maximum Roth IRA Contribution</CardTitle></div></CardHeader>
            <CardContent>
                <div className="text-center space-y-2">
                    <p className="text-4xl font-bold">${result.toLocaleString()}</p>
                    <CardDescription>This is your maximum allowed contribution for tax year {year}.</CardDescription>
                </div>
            </CardContent>
        </Card>
      )}
       <Accordion type="single" collapsible className="w-full">
        <AccordionItem value="what-is-roth">
          <AccordionTrigger>What is a Roth IRA?</AccordionTrigger>
          <AccordionContent className="text-muted-foreground">
            <p>A Roth IRA is an individual retirement account that offers tax-free growth and tax-free withdrawals in retirement. Unlike a traditional IRA, your contributions are not tax-deductible. The amount you can contribute each year is limited by the IRS and depends on your income and filing status.</p>
          </AccordionContent>
        </AccordionItem>
        <AccordionItem value="understanding-inputs">
            <AccordionTrigger>Understanding the Inputs</AccordionTrigger>
            <AccordionContent className="text-muted-foreground space-y-4">
              <div>
                  <h4 className="font-semibold text-foreground mb-1">Filing Status</h4>
                  <p>Your tax filing status as reported to the IRS. This determines the income limits for contributions.</p>
              </div>
              <div>
                  <h4 className="font-semibold text-foreground mb-1">Your Age</h4>
                  <p>Your age determines if you are eligible for "catch-up" contributions, which allow individuals aged 50 and over to contribute an additional amount.</p>
              </div>
              <div>
                  <h4 className="font-semibold text-foreground mb-1">Modified Adjusted Gross Income (MAGI)</h4>
                  <p>This is a specific calculation used by the IRS to determine eligibility for certain tax benefits. For most people, it's very close to their Adjusted Gross Income (AGI). Your eligibility to contribute to a Roth IRA is phased out and eventually eliminated as your MAGI increases.</p>
              </div>
            </AccordionContent>
        </AccordionItem>
        <AccordionItem value="how-it-works">
            <AccordionTrigger>How The Calculation Works</AccordionTrigger>
            <AccordionContent className="text-muted-foreground space-y-2">
                <p>This calculator uses the official IRS rules for the specified tax year to determine your contribution limit.</p>
                <ol className="list-decimal list-inside space-y-1">
                    <li>It determines the base contribution limit, adding the "catch-up" amount if you are age 50 or over.</li>
                    <li>It checks your Modified Adjusted Gross Income (MAGI) against the phase-out range for your filing status.</li>
                    <li>If your MAGI is within the phase-out range, your contribution limit is reduced proportionally. If it's above the range, your limit is $0.</li>
                </ol>
            </AccordionContent>
        </AccordionItem>
        <AccordionItem value="further-reading">
            <AccordionTrigger>Further Reading</AccordionTrigger>
            <AccordionContent className="text-muted-foreground space-y-2">
              <p>For the most current and detailed rules, always consult the official IRS publications.</p>
               <ul className="list-disc list-inside space-y-1 pl-4">
                  <li><a href="https://www.irs.gov/retirement-plans/amount-of-roth-ira-contributions-that-you-can-make-for-2024" target="_blank" rel="noopener noreferrer" className="text-primary underline">IRS.gov: Roth IRA Contribution Limits</a></li>
                  <li><a href="https://www.investopedia.com/roth-ira-contribution-and-income-limits-5071277" target="_blank" rel="noopener noreferrer" className="text-primary underline">Investopedia: Roth IRA Contribution & Income Limits</a></li>
              </ul>
            </AccordionContent>
        </AccordionItem>
      </Accordion>
    </div>
  );
}

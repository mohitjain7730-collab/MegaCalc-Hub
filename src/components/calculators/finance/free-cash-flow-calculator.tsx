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
  operatingCashFlow: z.number(),
  capitalExpenditures: z.number().nonnegative(),
});

type FormValues = z.infer<typeof formSchema>;

export default function FreeCashFlowCalculator() {
  const [result, setResult] = useState<number | null>(null);

  const form = useForm<FormValues>({
    resolver: zodResolver(formSchema),
    defaultValues: {
      operatingCashFlow: undefined,
      capitalExpenditures: undefined,
    },
  });

  const onSubmit = (values: FormValues) => {
    setResult(values.operatingCashFlow - values.capitalExpenditures);
  };

  return (
    <div className="space-y-8">
      <Form {...form}>
        <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-6">
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <FormField control={form.control} name="operatingCashFlow" render={({ field }) => (
              <FormItem>
                <FormLabel>Operating Cash Flow (OCF)</FormLabel>
                <FormControl>
                  <Input type="number" {...field} value={field.value ?? ''} onChange={e => field.onChange(parseFloat(e.target.value) || undefined)} />
                </FormControl>
                <FormMessage />
              </FormItem>
            )} />
            <FormField control={form.control} name="capitalExpenditures" render={({ field }) => (
              <FormItem>
                <FormLabel>Capital Expenditures (CapEx)</FormLabel>
                <FormControl>
                  <Input type="number" {...field} value={field.value ?? ''} onChange={e => field.onChange(parseFloat(e.target.value) || undefined)} />
                </FormControl>
                <FormMessage />
              </FormItem>
            )} />
          </div>
          <Button type="submit">Calculate FCF</Button>
        </form>
      </Form>
      {result !== null && (
        <Card className="mt-8">
          <CardHeader>
            <div className='flex items-center gap-4'><Landmark className="h-8 w-8 text-primary" /><CardTitle>Free Cash Flow (FCF)</CardTitle></div>
          </CardHeader>
          <CardContent>
            <p className="text-3xl font-bold text-center">${result.toLocaleString(undefined, { maximumFractionDigits: 2 })}</p>
            <CardDescription className='mt-4 text-center'>This is the cash available to the company after maintaining its operations and assets.</CardDescription>
          </CardContent>
        </Card>
      )}
      <Accordion type="single" collapsible className="w-full">
        <AccordionItem value="understanding-inputs">
            <AccordionTrigger>Understanding the Inputs</AccordionTrigger>
            <AccordionContent className="text-muted-foreground space-y-4">
                <div>
                    <h4 className="font-semibold text-foreground mb-1">Operating Cash Flow (OCF)</h4>
                    <p>The cash generated from a company's normal business operations. It's typically found on the Statement of Cash Flows.</p>
                </div>
                <div>
                    <h4 className="font-semibold text-foreground mb-1">Capital Expenditures (CapEx)</h4>
                    <p>Funds used by a company to acquire, upgrade, and maintain physical assets such as property, plants, buildings, technology, or equipment. This is also found on the Statement of Cash Flows.</p>
                </div>
            </AccordionContent>
        </AccordionItem>
        <AccordionItem value="how-it-works">
          <AccordionTrigger>How It Works</AccordionTrigger>
          <AccordionContent className="text-muted-foreground">
            <p>Free Cash Flow (FCF) represents the cash that a company is able to generate after spending the money required to maintain or expand its asset base. It's a crucial measure of profitability and a company's financial health. Investors use FCF to see how much cash is available to be distributed among investors in the form of dividends and stock buybacks, or to be used for debt repayment and reinvestment.</p>
          </AccordionContent>
        </AccordionItem>
         <AccordionItem value="further-reading">
            <AccordionTrigger>Further Reading</AccordionTrigger>
            <AccordionContent className="text-muted-foreground">
                 <a href="https://www.sec.gov/news/speech/2004-10-21-spch" target="_blank" rel="noopener noreferrer" className="text-primary underline">U.S. SEC – Understanding Cash Flow</a>
            </AccordionContent>
        </AccordionItem>
      </Accordion>
    </div>
  );
}

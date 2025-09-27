
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
  cash: z.number().nonnegative(),
  marketableSecurities: z.number().nonnegative(),
  accountsReceivable: z.number().nonnegative(),
  currentLiabilities: z.number().positive(),
});

type FormValues = z.infer<typeof formSchema>;

export default function QuickRatioCalculator() {
  const [result, setResult] = useState<number | null>(null);

  const form = useForm<FormValues>({
    resolver: zodResolver(formSchema),
    defaultValues: {
      cash: undefined,
      marketableSecurities: undefined,
      accountsReceivable: undefined,
      currentLiabilities: undefined,
    },
  });

  const onSubmit = (values: FormValues) => {
    const quickAssets = values.cash + values.marketableSecurities + values.accountsReceivable;
    setResult(quickAssets / values.currentLiabilities);
  };

  return (
    <div className="space-y-8">
      <Form {...form}>
        <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-6">
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <FormField control={form.control} name="cash" render={({ field }) => (
              <FormItem><FormLabel>Cash ($)</FormLabel><FormControl><Input type="number" {...field} value={field.value ?? ''} onChange={e => field.onChange(parseFloat(e.target.value) || 0)} /></FormControl><FormMessage /></FormItem>
            )} />
            <FormField control={form.control} name="marketableSecurities" render={({ field }) => (
              <FormItem><FormLabel>Marketable Securities ($)</FormLabel><FormControl><Input type="number" {...field} value={field.value ?? ''} onChange={e => field.onChange(parseFloat(e.target.value) || 0)} /></FormControl><FormMessage /></FormItem>
            )} />
            <FormField control={form.control} name="accountsReceivable" render={({ field }) => (
              <FormItem><FormLabel>Accounts Receivable ($)</FormLabel><FormControl><Input type="number" {...field} value={field.value ?? ''} onChange={e => field.onChange(parseFloat(e.target.value) || 0)} /></FormControl><FormMessage /></FormItem>
            )} />
            <FormField control={form.control} name="currentLiabilities" render={({ field }) => (
              <FormItem><FormLabel>Current Liabilities ($)</FormLabel><FormControl><Input type="number" {...field} value={field.value ?? ''} onChange={e => field.onChange(parseFloat(e.target.value) || undefined)} /></FormControl><FormMessage /></FormItem>
            )} />
          </div>
          <Button type="submit">Calculate Quick Ratio</Button>
        </form>
      </Form>
      {result !== null && (
        <Card className="mt-8">
          <CardHeader>
            <div className='flex items-center gap-4'>
              <Landmark className="h-8 w-8 text-primary" />
              <CardTitle>Quick Ratio (Acid-Test)</CardTitle>
            </div>
          </CardHeader>
          <CardContent>
            <p className="text-3xl font-bold text-center">{result.toFixed(2)}</p>
            <CardDescription className='mt-4 text-center'>A ratio of 1 or greater is generally considered healthy, showing the company can cover its short-term liabilities without selling inventory.</CardDescription>
          </CardContent>
        </Card>
      )}
      <Accordion type="single" collapsible className="w-full">
        <AccordionItem value="understanding-inputs">
            <AccordionTrigger>Understanding the Inputs</AccordionTrigger>
            <AccordionContent className="text-muted-foreground space-y-4">
                <div>
                    <h4 className="font-semibold text-foreground mb-1">Cash & Marketable Securities ($)</h4>
                    <p>The most liquid assets a company holds, which can be converted to cash almost immediately.</p>
                </div>
                 <div>
                    <h4 className="font-semibold text-foreground mb-1">Accounts Receivable ($)</h4>
                    <p>The money owed to a company by its customers for goods or services delivered.</p>
                </div>
                <div>
                    <h4 className="font-semibold text-foreground mb-1">Current Liabilities ($)</h4>
                    <p>A company's short-term financial obligations that are due within one year.</p>
                </div>
            </AccordionContent>
        </AccordionItem>
        <AccordionItem value="how-it-works">
          <AccordionTrigger>How It Works</AccordionTrigger>
          <AccordionContent className="text-muted-foreground">
            <p>The quick ratio, also known as the acid-test ratio, is a liquidity ratio that measures a company's ability to pay all of its current liabilities without relying on the sale of inventory. It is more conservative than the current ratio because it excludes inventory, which may not be easily converted to cash.</p>
          </AccordionContent>
        </AccordionItem>
         <AccordionItem value="further-reading">
            <AccordionTrigger>Further Reading</AccordionTrigger>
            <AccordionContent className="text-muted-foreground">
                 <a href="https://www.sec.gov/oiea/investor-alerts-and-bulletins/ib_understanding-financial-ratios" target="_blank" rel="noopener noreferrer" className="text-primary underline">U.S. SEC – Financial Ratios</a>
            </AccordionContent>
        </AccordionItem>
      </Accordion>
    </div>
  );
}

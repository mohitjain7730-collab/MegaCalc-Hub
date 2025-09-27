
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
  currentAssets: z.number().positive(),
  currentLiabilities: z.number().positive(),
});

type FormValues = z.infer<typeof formSchema>;

export default function CurrentRatioCalculator() {
  const [result, setResult] = useState<number | null>(null);

  const form = useForm<FormValues>({
    resolver: zodResolver(formSchema),
    defaultValues: {
      currentAssets: undefined,
      currentLiabilities: undefined,
    },
  });

  const onSubmit = (values: FormValues) => {
    setResult(values.currentAssets / values.currentLiabilities);
  };

  return (
    <div className="space-y-8">
      <Form {...form}>
        <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-6">
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <FormField control={form.control} name="currentAssets" render={({ field }) => (
              <FormItem>
                <FormLabel>Total Current Assets ($)</FormLabel>
                <FormControl>
                  <Input type="number" {...field} value={field.value ?? ''} onChange={e => field.onChange(parseFloat(e.target.value) || undefined)} />
                </FormControl>
                <FormMessage />
              </FormItem>
            )} />
            <FormField control={form.control} name="currentLiabilities" render={({ field }) => (
              <FormItem>
                <FormLabel>Total Current Liabilities ($)</FormLabel>
                <FormControl>
                  <Input type="number" {...field} value={field.value ?? ''} onChange={e => field.onChange(parseFloat(e.target.value) || undefined)} />
                </FormControl>
                <FormMessage />
              </FormItem>
            )} />
          </div>
          <Button type="submit">Calculate Ratio</Button>
        </form>
      </Form>
      {result !== null && (
        <Card className="mt-8">
          <CardHeader>
            <div className='flex items-center gap-4'>
              <Landmark className="h-8 w-8 text-primary" />
              <CardTitle>Current Ratio</CardTitle>
            </div>
          </CardHeader>
          <CardContent>
            <p className="text-3xl font-bold text-center">{result.toFixed(2)}</p>
            <CardDescription className='mt-4 text-center'>The company has ${result.toFixed(2)} in current assets for every $1 in current liabilities.</CardDescription>
          </CardContent>
        </Card>
      )}
      <Accordion type="single" collapsible className="w-full">
        <AccordionItem value="understanding-inputs">
            <AccordionTrigger>Understanding the Inputs</AccordionTrigger>
            <AccordionContent className="text-muted-foreground space-y-4">
                <div>
                    <h4 className="font-semibold text-foreground mb-1">Total Current Assets ($)</h4>
                    <p>All assets of a company that are expected to be sold, consumed, used, or exhausted through standard business operations within one year. This includes cash, cash equivalents, accounts receivable, and inventory.</p>
                </div>
                <div>
                    <h4 className="font-semibold text-foreground mb-1">Total Current Liabilities ($)</h4>
                    <p>A company's short-term financial obligations that are due within one year or within a normal operating cycle. This includes accounts payable, short-term debt, and accrued liabilities.</p>
                </div>
            </AccordionContent>
        </AccordionItem>
        <AccordionItem value="how-it-works">
          <AccordionTrigger>How It Works</AccordionTrigger>
          <AccordionContent className="text-muted-foreground">
            <p>The current ratio is a liquidity ratio that measures a company's ability to pay short-term obligations or those due within one year. A ratio between 1.5 and 2 is generally considered healthy, indicating good short-term financial strength.</p>
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

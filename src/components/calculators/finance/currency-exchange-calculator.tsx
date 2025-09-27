
'use client';

import { useState } from 'react';
import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import { z } from 'zod';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Form, FormControl, FormField, FormItem, FormLabel, FormMessage } from '@/components/ui/form';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { RefreshCw } from 'lucide-react';
import { Alert, AlertTitle, AlertDescription } from '@/components/ui/alert';
import { Accordion, AccordionContent, AccordionItem, AccordionTrigger } from '@/components/ui/accordion';

const formSchema = z.object({
  amount: z.number().positive(),
  fromCurrency: z.string().min(3, "Use 3-letter code").max(3, "Use 3-letter code"),
  toCurrency: z.string().min(3, "Use 3-letter code").max(3, "Use 3-letter code"),
  rate: z.number().positive(),
});

type FormValues = z.infer<typeof formSchema>;

export default function CurrencyExchangeCalculator() {
  const [result, setResult] = useState<number | null>(null);

  const form = useForm<FormValues>({
    resolver: zodResolver(formSchema),
    defaultValues: {
      amount: undefined,
      fromCurrency: undefined,
      toCurrency: undefined,
      rate: undefined,
    },
  });

  const onSubmit = (values: FormValues) => {
    setResult(values.amount * values.rate);
  };

  return (
    <div className="space-y-8">
      <Alert>
        <AlertTitle>Live Rates Not Available</AlertTitle>
        <AlertDescription>This calculator requires you to manually enter the current exchange rate. For live rates, please consult a financial data provider.</AlertDescription>
      </Alert>
      <Form {...form}>
        <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-6">
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <FormField control={form.control} name="amount" render={({ field }) => (
                <FormItem><FormLabel>Amount</FormLabel><FormControl><Input type="number" {...field} value={field.value ?? ''} onChange={e => field.onChange(parseFloat(e.target.value) || undefined)} /></FormControl><FormMessage /></FormItem>
            )} />
            <FormField control={form.control} name="fromCurrency" render={({ field }) => (
                <FormItem><FormLabel>From Currency (e.g., USD)</FormLabel><FormControl><Input {...field} /></FormControl><FormMessage /></FormItem>
            )} />
            <FormField control={form.control} name="toCurrency" render={({ field }) => (
                <FormItem><FormLabel>To Currency (e.g., EUR)</FormLabel><FormControl><Input {...field} /></FormControl><FormMessage /></FormItem>
            )} />
            <FormField control={form.control} name="rate" render={({ field }) => (
                <FormItem><FormLabel>Exchange Rate (1 From = ? To)</FormLabel><FormControl><Input type="number" step="any" {...field} value={field.value ?? ''} onChange={e => field.onChange(parseFloat(e.target.value) || undefined)} /></FormControl><FormMessage /></FormItem>
            )} />
          </div>
          <Button type="submit">Convert</Button>
        </form>
      </Form>
      {result !== null && (
        <Card className="mt-8">
          <CardHeader><div className='flex items-center gap-4'><RefreshCw className="h-8 w-8 text-primary" /><CardTitle>Converted Amount</CardTitle></div></CardHeader>
          <CardContent>
            <p className="text-3xl font-bold text-center">
              {result.toLocaleString(undefined, { style: 'currency', currency: form.getValues('toCurrency').toUpperCase() || 'USD', maximumFractionDigits: 2 })}
            </p>
          </CardContent>
        </Card>
      )}
      <Accordion type="single" collapsible className="w-full">
        <AccordionItem value="understanding-inputs">
            <AccordionTrigger>Understanding the Inputs</AccordionTrigger>
            <AccordionContent className="text-muted-foreground space-y-4">
                <div>
                    <h4 className="font-semibold text-foreground mb-1">Amount</h4>
                    <p>The amount of money you wish to convert.</p>
                </div>
                <div>
                    <h4 className="font-semibold text-foreground mb-1">From/To Currency</h4>
                    <p>The three-letter currency codes for the currencies you are converting between (e.g., USD for United States Dollar, EUR for Euro, JPY for Japanese Yen).</p>
                </div>
                <div>
                    <h4 className="font-semibold text-foreground mb-1">Exchange Rate</h4>
                    <p>The current market rate for the currency pair. It's crucial to enter this as `1 unit of 'From Currency' = X units of 'To Currency'`.</p>
                </div>
            </AccordionContent>
        </AccordionItem>
        <AccordionItem value="how-it-works">
            <AccordionTrigger>How It Works</AccordionTrigger>
            <AccordionContent className="text-muted-foreground">
                <p>This calculator performs a straightforward multiplication to convert between currencies. It takes the `Amount` you want to convert and multiplies it by the `Exchange Rate` you provide. Because live market data is required for real-world conversions, this tool is designed to perform the calculation once you have obtained a rate from a reliable financial source.</p>
            </AccordionContent>
        </AccordionItem>
      </Accordion>
    </div>
  );
}

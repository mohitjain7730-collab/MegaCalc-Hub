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

const formSchema = z.object({
  amount: z.number().positive(),
  fromCurrency: z.string().min(3).max(3),
  toCurrency: z.string().min(3).max(3),
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
              {result.toLocaleString(undefined, { style: 'currency', currency: form.getValues('toCurrency') || 'USD', maximumFractionDigits: 2 })}
            </p>
          </CardContent>
        </Card>
      )}
    </div>
  );
}

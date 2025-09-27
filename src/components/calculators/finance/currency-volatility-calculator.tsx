'use client';

import { useState } from 'react';
import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import { z } from 'zod';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Form, FormControl, FormField, FormItem, FormLabel, FormMessage } from '@/components/ui/form';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { BarChart2 } from 'lucide-react';

const formSchema = z.object({
  amountForeign: z.number().positive(),
  currentRate: z.number().positive(),
  fluctuation: z.number(),
});

type FormValues = z.infer<typeof formSchema>;

export default function CurrencyVolatilityCalculator() {
  const [result, setResult] = useState<{ initialValue: number; newValue: number; impact: number } | null>(null);

  const form = useForm<FormValues>({
    resolver: zodResolver(formSchema),
    defaultValues: {
      amountForeign: undefined,
      currentRate: undefined,
      fluctuation: undefined,
    },
  });

  const onSubmit = (values: FormValues) => {
    const { amountForeign, currentRate, fluctuation } = values;
    const initialValue = amountForeign * currentRate;
    const newRate = currentRate * (1 + (fluctuation / 100));
    const newValue = amountForeign * newRate;
    const impact = newValue - initialValue;
    setResult({ initialValue, newValue, impact });
  };

  return (
    <div className="space-y-8">
      <Form {...form}>
        <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-6">
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <FormField control={form.control} name="amountForeign" render={({ field }) => (
                <FormItem><FormLabel>Amount in Foreign Currency</FormLabel><FormControl><Input type="number" {...field} value={field.value ?? ''} onChange={e => field.onChange(parseFloat(e.target.value) || undefined)} /></FormControl><FormMessage /></FormItem>
            )} />
            <FormField control={form.control} name="currentRate" render={({ field }) => (
                <FormItem><FormLabel>Current Exchange Rate</FormLabel><FormControl><Input type="number" step="any" {...field} value={field.value ?? ''} onChange={e => field.onChange(parseFloat(e.target.value) || undefined)} /></FormControl><FormMessage /></FormItem>
            )} />
            <FormField control={form.control} name="fluctuation" render={({ field }) => (
                <FormItem className="md:col-span-2"><FormLabel>Expected Fluctuation (%)</FormLabel><FormControl><Input type="number" {...field} value={field.value ?? ''} onChange={e => field.onChange(parseFloat(e.target.value) || undefined)} /></FormControl><FormMessage /></FormItem>
            )} />
          </div>
          <Button type="submit">Calculate Impact</Button>
        </form>
      </Form>
      {result !== null && (
        <Card className="mt-8">
          <CardHeader><div className='flex items-center gap-4'><BarChart2 className="h-8 w-8 text-primary" /><CardTitle>Financial Impact of Fluctuation</CardTitle></div></CardHeader>
          <CardContent>
            <div className="grid grid-cols-1 md:grid-cols-3 gap-4 text-center">
              <div><CardDescription>Initial Value</CardDescription><p className="font-bold">${result.initialValue.toLocaleString(undefined, {maximumFractionDigits: 2})}</p></div>
              <div><CardDescription>New Value</CardDescription><p className="font-bold">${result.newValue.toLocaleString(undefined, {maximumFractionDigits: 2})}</p></div>
              <div className={result.impact >= 0 ? 'text-green-500' : 'text-red-500'}><CardDescription>Gain / Loss</CardDescription><p className="font-bold">${result.impact.toLocaleString(undefined, {maximumFractionDigits: 2})}</p></div>
            </div>
          </CardContent>
        </Card>
      )}
    </div>
  );
}

'use client';

import { useState } from 'react';
import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import { z } from 'zod';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Form, FormControl, FormField, FormItem, FormLabel, FormMessage } from '@/components/ui/form';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Handshake } from 'lucide-react';

const formSchema = z.object({
  notional: z.number().positive(),
  contractRate: z.number().positive(),
  marketRate: z.number().positive(),
  days: z.number().int().positive(),
});

type FormValues = z.infer<typeof formSchema>;

export default function ForwardRateAgreementCalculator() {
  const [result, setResult] = useState<{ amount: number, direction: string } | null>(null);

  const form = useForm<FormValues>({
    resolver: zodResolver(formSchema),
    defaultValues: {
      notional: undefined,
      contractRate: undefined,
      marketRate: undefined,
      days: undefined,
    },
  });

  const onSubmit = (values: FormValues) => {
    const { notional, contractRate, marketRate, days } = values;
    const rk = contractRate / 100;
    const rm = marketRate / 100;

    const numerator = notional * (rm - rk) * (days / 360);
    const denominator = 1 + (rm * (days / 360));
    const settlementAmount = numerator / denominator;
    
    setResult({
      amount: Math.abs(settlementAmount),
      direction: settlementAmount > 0 ? "Seller pays Buyer" : "Buyer pays Seller",
    });
  };

  return (
    <div className="space-y-8">
      <Form {...form}>
        <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-6">
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <FormField control={form.control} name="notional" render={({ field }) => (<FormItem><FormLabel>Notional Principal ($)</FormLabel><FormControl><Input type="number" {...field} value={field.value ?? ''} onChange={e => field.onChange(parseFloat(e.target.value) || undefined)} /></FormControl><FormMessage /></FormItem>)} />
            <FormField control={form.control} name="contractRate" render={({ field }) => (<FormItem><FormLabel>Contract Rate (%)</FormLabel><FormControl><Input type="number" {...field} value={field.value ?? ''} onChange={e => field.onChange(parseFloat(e.target.value) || undefined)} /></FormControl><FormMessage /></FormItem>)} />
            <FormField control={form.control} name="marketRate" render={({ field }) => (<FormItem><FormLabel>Reference/Market Rate (%)</FormLabel><FormControl><Input type="number" {...field} value={field.value ?? ''} onChange={e => field.onChange(parseFloat(e.target.value) || undefined)} /></FormControl><FormMessage /></FormItem>)} />
            <FormField control={form.control} name="days" render={({ field }) => (<FormItem><FormLabel>Days in Contract Period</FormLabel><FormControl><Input type="number" {...field} value={field.value ?? ''} onChange={e => field.onChange(parseInt(e.target.value) || undefined)} /></FormControl><FormMessage /></FormItem>)} />
          </div>
          <Button type="submit">Calculate Settlement</Button>
        </form>
      </Form>
      {result !== null && (
        <Card className="mt-8">
          <CardHeader><div className='flex items-center gap-4'><Handshake className="h-8 w-8 text-primary" /><CardTitle>FRA Settlement</CardTitle></div></CardHeader>
          <CardContent className="text-center">
            <p className="text-3xl font-bold">${result.amount.toLocaleString(undefined, {maximumFractionDigits: 2})}</p>
            <p className="text-lg font-semibold mt-2">{result.direction}</p>
          </CardContent>
        </Card>
      )}
    </div>
  );
}

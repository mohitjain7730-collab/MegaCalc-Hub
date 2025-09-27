'use client';

import { useState } from 'react';
import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import { z } from 'zod';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Form, FormControl, FormField, FormItem, FormLabel, FormMessage } from '@/components/ui/form';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { ArrowRightLeft } from 'lucide-react';

const formSchema = z.object({
  swapRate: z.number(),
  bondYield: z.number(),
});

type FormValues = z.infer<typeof formSchema>;

export default function SwapSpreadCalculator() {
  const [result, setResult] = useState<number | null>(null);

  const form = useForm<FormValues>({
    resolver: zodResolver(formSchema),
    defaultValues: {
      swapRate: undefined,
      bondYield: undefined,
    },
  });

  const onSubmit = (values: FormValues) => {
    setResult((values.swapRate - values.bondYield) * 100);
  };

  return (
    <div className="space-y-8">
      <Form {...form}>
        <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-6">
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <FormField control={form.control} name="swapRate" render={({ field }) => (
                <FormItem><FormLabel>Swap Rate (%)</FormLabel><FormControl><Input type="number" {...field} value={field.value ?? ''} onChange={e => field.onChange(parseFloat(e.target.value) || undefined)} /></FormControl><FormMessage /></FormItem>
            )} />
            <FormField control={form.control} name="bondYield" render={({ field }) => (
                <FormItem><FormLabel>Government Bond Yield (%)</FormLabel><FormControl><Input type="number" {...field} value={field.value ?? ''} onChange={e => field.onChange(parseFloat(e.target.value) || undefined)} /></FormControl><FormMessage /></FormItem>
            )} />
          </div>
          <Button type="submit">Calculate Spread</Button>
        </form>
      </Form>
      {result !== null && (
        <Card className="mt-8">
          <CardHeader><div className='flex items-center gap-4'><ArrowRightLeft className="h-8 w-8 text-primary" /><CardTitle>Swap Spread</CardTitle></div></CardHeader>
          <CardContent>
            <p className="text-3xl font-bold text-center">{result.toFixed(2)} bps</p>
            <CardDescription className='mt-4 text-center'>The spread is {result.toFixed(2)} basis points (1 bp = 0.01%).</CardDescription>
          </CardContent>
        </Card>
      )}
    </div>
  );
}

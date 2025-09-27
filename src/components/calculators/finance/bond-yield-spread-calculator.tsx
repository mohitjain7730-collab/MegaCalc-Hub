
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
import { Accordion, AccordionContent, AccordionItem, AccordionTrigger } from '@/components/ui/accordion';

const formSchema = z.object({
  bondYield: z.number().positive(),
  benchmarkYield: z.number().positive(),
});

type FormValues = z.infer<typeof formSchema>;

export default function BondYieldSpreadCalculator() {
  const [result, setResult] = useState<{ spreadPercent: number; spreadBps: number } | null>(null);

  const form = useForm<FormValues>({
    resolver: zodResolver(formSchema),
    defaultValues: {
      bondYield: undefined,
      benchmarkYield: undefined,
    },
  });

  const onSubmit = (values: FormValues) => {
    const spreadPercent = values.bondYield - values.benchmarkYield;
    const spreadBps = spreadPercent * 100;
    setResult({ spreadPercent, spreadBps });
  };

  return (
    <div className="space-y-8">
      <Form {...form}>
        <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-6">
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <FormField control={form.control} name="bondYield" render={({ field }) => (
                <FormItem>
                  <FormLabel>Bond Yield (%)</FormLabel>
                  <FormControl><Input type="number" placeholder="e.g., 6.5" {...field} value={field.value ?? ''} onChange={e => field.onChange(parseFloat(e.target.value) || undefined)} /></FormControl>
                  <FormMessage />
                </FormItem>
            )} />
            <FormField control={form.control} name="benchmarkYield" render={({ field }) => (
                <FormItem>
                  <FormLabel>Benchmark Yield (%)</FormLabel>
                  <FormControl><Input type="number" placeholder="e.g., 4.2" {...field} value={field.value ?? ''} onChange={e => field.onChange(parseFloat(e.target.value) || undefined)} /></FormControl>
                  <FormMessage />
                </FormItem>
            )} />
          </div>
          <Button type="submit">Calculate Spread</Button>
        </form>
      </Form>
      {result !== null && (
        <Card className="mt-8">
          <CardHeader>
            <div className='flex items-center gap-4'><ArrowRightLeft className="h-8 w-8 text-primary" /><CardTitle>Yield Spread</CardTitle></div>
          </CardHeader>
          <CardContent>
            <div className="grid grid-cols-2 gap-4 text-center">
              <div>
                <p className="font-semibold text-lg">In Percentage</p>
                <p className="text-2xl font-bold">{result.spreadPercent.toFixed(2)}%</p>
              </div>
              <div>
                <p className="font-semibold text-lg">In Basis Points</p>
                <p className="text-2xl font-bold">{result.spreadBps.toFixed(0)} bps</p>
              </div>
            </div>
            <CardDescription className='mt-4 text-center'>This spread represents the additional return for taking on the credit risk of the bond compared to the benchmark.</CardDescription>
          </CardContent>
        </Card>
      )}
      <Accordion type="single" collapsible className="w-full">
        <AccordionItem value="how-it-works">
          <AccordionTrigger>How It Works</AccordionTrigger>
          <AccordionContent className="text-muted-foreground">The calculator subtracts the benchmark yield (like a government bond) from the corporate bond's yield. The result is the "credit spread," which is the extra compensation an investor demands for taking on the risk that the company might default. One basis point (bps) is equal to 0.01%.</AccordionContent>
        </AccordionItem>
      </Accordion>
    </div>
  );
}

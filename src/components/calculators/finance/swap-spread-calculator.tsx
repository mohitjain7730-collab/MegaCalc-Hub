
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
       <Accordion type="single" collapsible className="w-full">
        <AccordionItem value="understanding-inputs">
            <AccordionTrigger>Understanding the Inputs</AccordionTrigger>
            <AccordionContent className="text-muted-foreground space-y-4">
                <div>
                    <h4 className="font-semibold text-foreground mb-1">Swap Rate (%)</h4>
                    <p>The fixed rate component of an interest rate swap for a specific maturity (e.g., the 10-year swap rate). This rate reflects the market's expectation of future short-term interest rates plus a premium for interbank credit risk.</p>
                </div>
                <div>
                    <h4 className="font-semibold text-foreground mb-1">Government Bond Yield (%)</h4>
                    <p>The yield on a government bond of the same maturity as the swap. This is considered the "risk-free" benchmark rate.</p>
                </div>
            </AccordionContent>
        </AccordionItem>
        <AccordionItem value="how-it-works">
            <AccordionTrigger>How It Works</AccordionTrigger>
            <AccordionContent className="text-muted-foreground">
                <p>The calculator simply subtracts the benchmark government bond yield from the swap rate. The resulting difference, known as the swap spread, is a key market indicator. It essentially represents the additional premium the market demands for the credit risk of lending between banks compared to lending to the government. A widening spread often signals increasing stress or perceived risk in the financial system.</p>
            </AccordionContent>
        </AccordionItem>
      </Accordion>
    </div>
  );
}

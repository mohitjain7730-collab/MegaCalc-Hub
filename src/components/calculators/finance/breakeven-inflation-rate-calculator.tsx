
'use client';

import { useState } from 'react';
import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import { z } from 'zod';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Form, FormControl, FormField, FormItem, FormLabel, FormMessage } from '@/components/ui/form';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { TrendingUp } from 'lucide-react';
import { Accordion, AccordionContent, AccordionItem, AccordionTrigger } from '@/components/ui/accordion';

const formSchema = z.object({
  nominalYield: z.number(),
  realYield: z.number(),
});

type FormValues = z.infer<typeof formSchema>;

export default function BreakevenInflationRateCalculator() {
  const [result, setResult] = useState<number | null>(null);

  const form = useForm<FormValues>({
    resolver: zodResolver(formSchema),
    defaultValues: {
      nominalYield: undefined,
      realYield: undefined,
    },
  });

  const onSubmit = (values: FormValues) => {
    const nominal = values.nominalYield / 100;
    const real = values.realYield / 100;
    const breakevenRate = ((1 + nominal) / (1 + real)) - 1;
    setResult(breakevenRate * 100);
  };

  return (
    <div className="space-y-8">
      <Form {...form}>
        <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-6">
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <FormField control={form.control} name="nominalYield" render={({ field }) => (
                <FormItem><FormLabel>Nominal Bond Yield (%)</FormLabel><FormControl><Input type="number" {...field} value={field.value ?? ''} onChange={e => field.onChange(parseFloat(e.target.value) || undefined)} /></FormControl><FormMessage /></FormItem>
            )} />
            <FormField control={form.control} name="realYield" render={({ field }) => (
                <FormItem><FormLabel>Real Yield (TIPS) (%)</FormLabel><FormControl><Input type="number" {...field} value={field.value ?? ''} onChange={e => field.onChange(parseFloat(e.target.value) || undefined)} /></FormControl><FormMessage /></FormItem>
            )} />
          </div>
          <Button type="submit">Calculate Breakeven Rate</Button>
        </form>
      </Form>
      {result !== null && (
        <Card className="mt-8">
          <CardHeader><div className='flex items-center gap-4'><TrendingUp className="h-8 w-8 text-primary" /><CardTitle>Breakeven Inflation Rate</CardTitle></div></CardHeader>
          <CardContent>
            <p className="text-3xl font-bold text-center">{result.toFixed(2)}%</p>
            <CardDescription className='mt-4 text-center'>This is the market's expectation for average annual inflation over the bond's maturity.</CardDescription>
          </CardContent>
        </Card>
      )}
      <Accordion type="single" collapsible className="w-full">
        <AccordionItem value="understanding-inputs">
            <AccordionTrigger>Understanding the Inputs</AccordionTrigger>
            <AccordionContent className="text-muted-foreground space-y-4">
                <div>
                    <h4 className="font-semibold text-foreground mb-1">Nominal Bond Yield (%)</h4>
                    <p>The yield on a standard government bond of a certain maturity (e.g., 10-year Treasury Note). This yield includes both the real return and an expected inflation component.</p>
                </div>
                <div>
                    <h4 className="font-semibold text-foreground mb-1">Real Yield (%)</h4>
                    <p>The yield on an inflation-protected government bond of the same maturity (e.g., 10-year TIPS). The principal of this bond adjusts with inflation, so its yield represents a "real" return above inflation.</p>
                </div>
            </AccordionContent>
        </AccordionItem>
        <AccordionItem value="how-it-works">
            <AccordionTrigger>How It Works (Fisher Effect)</AccordionTrigger>
            <AccordionContent className="text-muted-foreground">
                <p>The breakeven inflation rate represents the inflation rate at which the return on a nominal bond and an inflation-protected bond (like TIPS) would be the same. It is calculated by finding the difference in their yields and is considered a measure of the market's inflation expectations.</p>
                <p className='mt-2'>This calculator uses the precise Fisher Equation `(1 + Nominal) = (1 + Real) * (1 + Inflation)` and solves for the inflation rate, providing a more accurate result than simple subtraction.</p>
            </AccordionContent>
        </AccordionItem>
      </Accordion>
    </div>
  );
}

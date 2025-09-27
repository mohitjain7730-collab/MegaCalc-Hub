
'use client';

import { useState } from 'react';
import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import { z } from 'zod';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Form, FormControl, FormField, FormItem, FormLabel, FormMessage } from '@/components/ui/form';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Gem } from 'lucide-react';
import { Accordion, AccordionContent, AccordionItem, AccordionTrigger } from '@/components/ui/accordion';

const formSchema = z.object({
  nominalReturn: z.number(),
  inflationRate: z.number(),
});

type FormValues = z.infer<typeof formSchema>;

export default function RealRateOfReturnCalculator() {
  const [result, setResult] = useState<number | null>(null);

  const form = useForm<FormValues>({
    resolver: zodResolver(formSchema),
    defaultValues: {
      nominalReturn: undefined,
      inflationRate: undefined,
    },
  });

  const onSubmit = (values: FormValues) => {
    const nominal = values.nominalReturn / 100;
    const inflation = values.inflationRate / 100;
    const realReturn = ((1 + nominal) / (1 + inflation)) - 1;
    setResult(realReturn * 100);
  };

  return (
    <div className="space-y-8">
      <Form {...form}>
        <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-6">
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <FormField control={form.control} name="nominalReturn" render={({ field }) => (
                <FormItem>
                  <FormLabel>Nominal Return Rate (%)</FormLabel>
                  <FormControl><Input type="number" placeholder="e.g., 7" {...field} value={field.value ?? ''} onChange={e => field.onChange(parseFloat(e.target.value) || undefined)} /></FormControl>
                  <FormMessage />
                </FormItem>
            )} />
            <FormField control={form.control} name="inflationRate" render={({ field }) => (
                <FormItem>
                  <FormLabel>Inflation Rate (%)</FormLabel>
                  <FormControl><Input type="number" placeholder="e.g., 3" {...field} value={field.value ?? ''} onChange={e => field.onChange(parseFloat(e.target.value) || undefined)} /></FormControl>
                  <FormMessage />
                </FormItem>
            )} />
          </div>
          <Button type="submit">Calculate Return</Button>
        </form>
      </Form>
      {result !== null && (
        <Card className="mt-8">
          <CardHeader>
            <div className='flex items-center gap-4'><Gem className="h-8 w-8 text-primary" /><CardTitle>Real Rate of Return</CardTitle></div>
          </CardHeader>
          <CardContent>
            <p className="text-3xl font-bold text-center">{result.toFixed(2)}%</p>
            <CardDescription className='mt-4 text-center'>This is the true gain or loss in your purchasing power after accounting for inflation.</CardDescription>
          </CardContent>
        </Card>
      )}
      <Accordion type="single" collapsible className="w-full">
        <AccordionItem value="how-it-works">
          <AccordionTrigger>How It Works (Fisher Equation)</AccordionTrigger>
          <AccordionContent className="text-muted-foreground">This calculator uses the Fisher Equation to provide a precise measure of your real rate of return. Unlike the simple subtraction method, this formula correctly accounts for the compounding effects of both your return and inflation, giving a true picture of your change in purchasing power.</AccordionContent>
        </AccordionItem>
      </Accordion>
    </div>
  );
}

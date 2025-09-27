
'use client';

import { useState } from 'react';
import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import { z } from 'zod';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Form, FormControl, FormField, FormItem, FormLabel, FormMessage } from '@/components/ui/form';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { TrendingDown } from 'lucide-react';
import { Accordion, AccordionContent, AccordionItem, AccordionTrigger } from '@/components/ui/accordion';

const formSchema = z.object({
  initialCount: z.number().positive(),
  finalCount: z.number().nonnegative(),
}).refine(data => data.finalCount < data.initialCount, {
    message: 'Final count must be less than initial count.',
    path: ['finalCount']
});

type FormValues = z.infer<typeof formSchema>;

export default function LogReductionCalculator() {
  const [result, setResult] = useState<{ log: number; percent: number } | null>(null);

  const form = useForm<FormValues>({
    resolver: zodResolver(formSchema),
    defaultValues: { initialCount: undefined, finalCount: undefined },
  });

  const onSubmit = (values: FormValues) => {
    const logReduction = Math.log10(values.initialCount / values.finalCount);
    const percentReduction = (1 - (values.finalCount / values.initialCount)) * 100;
    setResult({ log: logReduction, percent: percentReduction });
  };

  return (
    <div className="space-y-8">
      <Form {...form}>
        <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-6">
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <FormField control={form.control} name="initialCount" render={({ field }) => (
                <FormItem><FormLabel>Initial Microbial Count</FormLabel><FormControl><Input type="number" placeholder="e.g., 1000000" {...field} value={field.value ?? ''} onChange={e => field.onChange(e.target.value === '' ? undefined : parseFloat(e.target.value))} /></FormControl><FormMessage /></FormItem>
            )} />
            <FormField control={form.control} name="finalCount" render={({ field }) => (
                <FormItem><FormLabel>Final Microbial Count</FormLabel><FormControl><Input type="number" placeholder="e.g., 100" {...field} value={field.value ?? ''} onChange={e => field.onChange(e.target.value === '' ? undefined : parseFloat(e.target.value))} /></FormControl><FormMessage /></FormItem>
            )} />
          </div>
          <Button type="submit">Calculate Reduction</Button>
        </form>
      </Form>
      
      {result !== null && (
        <Card className="mt-8">
            <CardHeader><div className='flex items-center gap-4'><TrendingDown className="h-8 w-8 text-primary" /><CardTitle>Reduction Results</CardTitle></div></CardHeader>
            <CardContent className="grid grid-cols-2 gap-4 text-center">
                <div>
                    <p className="font-bold text-lg">Log Reduction</p>
                    <p className="text-xl font-bold">{result.log.toFixed(2)}</p>
                </div>
                 <div>
                    <p className="font-bold text-lg">Percent Reduction</p>
                    <p className="text-xl font-bold">{result.percent.toFixed(2)}%</p>
                </div>
            </CardContent>
        </Card>
      )}

      <Accordion type="single" collapsible className="w-full">
        <AccordionItem value="how-it-works">
            <AccordionTrigger>How It Works</AccordionTrigger>
            <AccordionContent className="text-muted-foreground">
                <p>Log reduction is a measure of how thoroughly a decontamination process reduces the concentration of a contaminant. It is calculated as the base-10 logarithm of the ratio of initial to final concentration. A 1-log reduction corresponds to a 90% reduction, a 2-log reduction to 99%, and so on.</p>
            </AccordionContent>
        </AccordionItem>
      </Accordion>
    </div>
  );
}

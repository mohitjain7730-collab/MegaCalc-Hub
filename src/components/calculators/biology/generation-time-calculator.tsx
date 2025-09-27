
'use client';

import { useState } from 'react';
import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import { z } from 'zod';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Form, FormControl, FormField, FormItem, FormLabel, FormMessage } from '@/components/ui/form';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Clock } from 'lucide-react';
import { Accordion, AccordionContent, AccordionItem, AccordionTrigger } from '@/components/ui/accordion';

const formSchema = z.object({
  n0: z.number().positive('Initial population must be positive'),
  nt: z.number().positive('Final population must be positive'),
  t: z.number().positive('Time must be positive'),
}).refine(data => data.nt > data.n0, {
    message: "Final population must be greater than the initial population.",
    path: ["nt"],
});

type FormValues = z.infer<typeof formSchema>;

export default function GenerationTimeCalculator() {
  const [result, setResult] = useState<number | null>(null);

  const form = useForm<FormValues>({
    resolver: zodResolver(formSchema),
    defaultValues: { n0: undefined, nt: undefined, t: undefined },
  });

  const onSubmit = (values: FormValues) => {
    const { n0, nt, t } = values;
    const n = Math.log2(nt / n0);
    const g = t / n;
    setResult(g);
  };

  return (
    <div className="space-y-8">
      <Form {...form}>
        <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-6">
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <FormField control={form.control} name="n0" render={({ field }) => (
                <FormItem><FormLabel>Initial Population (N₀)</FormLabel><FormControl><Input type="number" placeholder="e.g., 1000" {...field} value={field.value ?? ''} onChange={e => field.onChange(e.target.value === '' ? undefined : parseFloat(e.target.value))} /></FormControl><FormMessage /></FormItem>
            )} />
            <FormField control={form.control} name="nt" render={({ field }) => (
                <FormItem><FormLabel>Final Population (Nₜ)</FormLabel><FormControl><Input type="number" placeholder="e.g., 1000000" {...field} value={field.value ?? ''} onChange={e => field.onChange(e.target.value === '' ? undefined : parseFloat(e.target.value))} /></FormControl><FormMessage /></FormItem>
            )} />
            <FormField control={form.control} name="t" render={({ field }) => (
                <FormItem className="md:col-span-2"><FormLabel>Time (t, in minutes)</FormLabel><FormControl><Input type="number" placeholder="e.g., 120" {...field} value={field.value ?? ''} onChange={e => field.onChange(e.target.value === '' ? undefined : parseFloat(e.target.value))} /></FormControl><FormMessage /></FormItem>
            )} />
          </div>
          <Button type="submit">Calculate Generation Time</Button>
        </form>
      </Form>
      
      {result !== null && (
        <Card className="mt-8">
            <CardHeader><div className='flex items-center gap-4'><Clock className="h-8 w-8 text-primary" /><CardTitle>Generation Time (G)</CardTitle></div></CardHeader>
            <CardContent>
                <p className="text-3xl font-bold text-center">{result.toFixed(2)} minutes</p>
                <CardDescription className='mt-4 text-center'>This is the average time it takes for one cell to divide into two.</CardDescription>
            </CardContent>
        </Card>
      )}

      <Accordion type="single" collapsible className="w-full">
        <AccordionItem value="how-it-works">
            <AccordionTrigger>How It Works</AccordionTrigger>
            <AccordionContent className="text-muted-foreground">
                <p>This calculator first determines the number of generations (n) that occurred using the formula `n = log₂(Nₜ / N₀)`. It then calculates the generation time (G) by dividing the total time (t) by the number of generations.</p>
            </AccordionContent>
        </AccordionItem>
      </Accordion>
    </div>
  );
}

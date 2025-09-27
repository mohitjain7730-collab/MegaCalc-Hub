
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
  initialCount: z.number().positive(),
  finalCount: z.number().positive(),
  time: z.number().positive(),
}).refine(data => data.finalCount > data.initialCount, {
    message: "Final count must be greater than initial count.",
    path: ["finalCount"],
});

type FormValues = z.infer<typeof formSchema>;

export default function CellDoublingTimeCalculator() {
  const [result, setResult] = useState<number | null>(null);

  const form = useForm<FormValues>({
    resolver: zodResolver(formSchema),
    defaultValues: { initialCount: undefined, finalCount: undefined, time: undefined },
  });

  const onSubmit = (values: FormValues) => {
    const { initialCount, finalCount, time } = values;
    const doublingTime = time * (Math.log(2) / Math.log(finalCount / initialCount));
    setResult(doublingTime);
  };

  return (
    <div className="space-y-8">
      <Form {...form}>
        <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-6">
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <FormField control={form.control} name="initialCount" render={({ field }) => (
                <FormItem><FormLabel>Initial Cell Count</FormLabel><FormControl><Input type="number" placeholder="e.g., 50000" {...field} value={field.value ?? ''} onChange={e => field.onChange(e.target.value === '' ? undefined : parseFloat(e.target.value))} /></FormControl><FormMessage /></FormItem>
            )} />
            <FormField control={form.control} name="finalCount" render={({ field }) => (
                <FormItem><FormLabel>Final Cell Count</FormLabel><FormControl><Input type="number" placeholder="e.g., 500000" {...field} value={field.value ?? ''} onChange={e => field.onChange(e.target.value === '' ? undefined : parseFloat(e.target.value))} /></FormControl><FormMessage /></FormItem>
            )} />
            <FormField control={form.control} name="time" render={({ field }) => (
                <FormItem className="md:col-span-2"><FormLabel>Time (in hours)</FormLabel><FormControl><Input type="number" placeholder="e.g., 24" {...field} value={field.value ?? ''} onChange={e => field.onChange(e.target.value === '' ? undefined : parseFloat(e.target.value))} /></FormControl><FormMessage /></FormItem>
            )} />
          </div>
          <Button type="submit">Calculate Doubling Time</Button>
        </form>
      </Form>
      
      {result !== null && (
        <Card className="mt-8">
            <CardHeader><div className='flex items-center gap-4'><Clock className="h-8 w-8 text-primary" /><CardTitle>Cell Doubling Time</CardTitle></div></CardHeader>
            <CardContent>
                <p className="text-3xl font-bold text-center">{result.toFixed(2)} hours</p>
            </CardContent>
        </Card>
      )}

      <Accordion type="single" collapsible className="w-full">
        <AccordionItem value="how-it-works">
            <AccordionTrigger>How It Works</AccordionTrigger>
            <AccordionContent className="text-muted-foreground">
                <p>This calculator uses the formula for exponential growth to determine the doubling time of a cell population. The formula is: `Doubling Time = Time * log(2) / log(Final Count / Initial Count)`.</p>
            </AccordionContent>
        </AccordionItem>
      </Accordion>
    </div>
  );
}

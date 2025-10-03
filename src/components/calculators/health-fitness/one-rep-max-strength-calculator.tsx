
'use client';

import { useState } from 'react';
import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import { z } from 'zod';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Form, FormControl, FormField, FormItem, FormLabel, FormMessage } from '@/components/ui/form';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Dumbbell } from 'lucide-react';
import { Accordion, AccordionContent, AccordionItem, AccordionTrigger } from '@/components/ui/accordion';

const formSchema = z.object({
  weight: z.number().positive(),
  reps: z.number().int().positive().max(10),
});

type FormValues = z.infer<typeof formSchema>;

export default function OneRepMaxStrengthCalculator() {
  const [result, setResult] = useState<number | null>(null);

  const form = useForm<FormValues>({
    resolver: zodResolver(formSchema),
    defaultValues: {
      weight: undefined,
      reps: undefined,
    },
  });

  const onSubmit = (values: FormValues) => {
    // Brzycki formula
    const oneRepMax = values.weight / (1.0278 - 0.0278 * values.reps);
    setResult(oneRepMax);
  };

  return (
    <div className="space-y-8">
      <Accordion type="single" collapsible className="w-full">
        <AccordionItem value="how-it-works">
          <AccordionTrigger>How It Works (Brzycki Formula)</AccordionTrigger>
          <AccordionContent>This calculator uses the Brzycki formula to estimate your 1RM. This is a widely used, validated formula in strength training. It creates a mathematical curve to predict the 1RM based on the observed relationship between weight and repetitions.</AccordionContent>
        </AccordionItem>
      </Accordion>
      <Form {...form}>
        <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-6">
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <FormField control={form.control} name="weight" render={({ field }) => (
                <FormItem><FormLabel>Weight Lifted</FormLabel><FormControl><Input type="number" {...field} value={field.value ?? ''} onChange={e => field.onChange(parseFloat(e.target.value) || undefined)}/></FormControl><FormMessage /></FormItem>
            )} />
            <FormField control={form.control} name="reps" render={({ field }) => (
                <FormItem><FormLabel>Repetitions Completed</FormLabel><FormControl><Input type="number" {...field} value={field.value ?? ''} onChange={e => field.onChange(parseInt(e.target.value) || undefined)}/></FormControl><FormMessage /></FormItem>
            )} />
          </div>
          <Button type="submit">Calculate 1RM</Button>
        </form>
      </Form>
      {result !== null && (
        <Card className="mt-8">
          <CardHeader><div className='flex items-center gap-4'><Dumbbell className="h-8 w-8 text-primary" /><CardTitle>Estimated 1-Rep Max</CardTitle></div></CardHeader>
          <CardContent>
            <p className="text-3xl font-bold text-center">{result.toFixed(1)}</p>
            <CardDescription className='mt-2 text-center'>This is an estimate. Do not attempt a true 1-rep max without a spotter and proper warm-up.</CardDescription>
          </CardContent>
        </Card>
      )}
    </div>
  );
}

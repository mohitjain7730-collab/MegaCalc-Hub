
'use client';

import { useState } from 'react';
import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import { z } from 'zod';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Form, FormControl, FormField, FormItem, FormLabel, FormMessage } from '@/components/ui/form';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { BatteryWarning } from 'lucide-react';
import { Accordion, AccordionContent, AccordionItem, AccordionTrigger } from '@/components/ui/accordion';

const formSchema = z.object({
  preTaskScore: z.number().min(1).max(10),
  postTaskScore: z.number().min(1).max(10),
  durationMinutes: z.number().positive(),
}).refine(data => data.postTaskScore >= data.preTaskScore, {
    message: 'Post-task score cannot be lower than pre-task score.',
    path: ['postTaskScore'],
});

type FormValues = z.infer<typeof formSchema>;

export default function MentalFatigueIndexCalculator() {
  const [result, setResult] = useState<number | null>(null);

  const form = useForm<FormValues>({
    resolver: zodResolver(formSchema),
    defaultValues: {
      preTaskScore: undefined,
      postTaskScore: undefined,
      durationMinutes: undefined,
    },
  });

  const onSubmit = (values: FormValues) => {
    const { preTaskScore, postTaskScore, durationMinutes } = values;
    const durationHours = durationMinutes / 60;
    const index = (postTaskScore - preTaskScore) / durationHours;
    setResult(index);
  };

  return (
    <div className="space-y-8">
        <CardDescription>On a scale of 1 (Not tired) to 10 (Completely exhausted), rate your subjective feeling of mental fatigue.</CardDescription>
      <Form {...form}>
        <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-6">
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <FormField control={form.control} name="preTaskScore" render={({ field }) => (
                <FormItem><FormLabel>Pre-Task Fatigue Score (1-10)</FormLabel><FormControl><Input type="number" {...field} value={field.value ?? ''} onChange={e => field.onChange(parseInt(e.target.value) || undefined)} /></FormControl><FormMessage /></FormItem>
            )} />
            <FormField control={form.control} name="postTaskScore" render={({ field }) => (
                <FormItem><FormLabel>Post-Task Fatigue Score (1-10)</FormLabel><FormControl><Input type="number" {...field} value={field.value ?? ''} onChange={e => field.onChange(parseInt(e.target.value) || undefined)} /></FormControl><FormMessage /></FormItem>
            )} />
            <FormField control={form.control} name="durationMinutes" render={({ field }) => (
                <FormItem className="md:col-span-2"><FormLabel>Task Duration (minutes)</FormLabel><FormControl><Input type="number" {...field} value={field.value ?? ''} onChange={e => field.onChange(parseInt(e.target.value) || undefined)} /></FormControl><FormMessage /></FormItem>
            )} />
          </div>
          <Button type="submit">Calculate Fatigue Index</Button>
        </form>
      </Form>
      {result !== null && (
        <Card className="mt-8">
            <CardHeader><div className='flex items-center gap-4'><BatteryWarning className="h-8 w-8 text-primary" /><CardTitle>Mental Fatigue Index</CardTitle></div></CardHeader>
            <CardContent>
                <p className="text-3xl font-bold text-center">{result.toFixed(2)} points/hour</p>
                <CardDescription className='mt-4 text-center'>A higher index indicates a faster rate of mental exhaustion during the task.</CardDescription>
            </CardContent>
        </Card>
      )}
      <Accordion type="single" collapsible className="w-full">
        <AccordionItem value="how-it-works">
            <AccordionTrigger>How It Works</AccordionTrigger>
            <AccordionContent className="text-muted-foreground space-y-2">
                <p>This calculator provides a simplified index to quantify the rate at which mental fatigue develops during a cognitive task.</p>
                <ol className="list-decimal list-inside space-y-1">
                    <li>It takes the difference between your subjective fatigue rating after a task and before the task.</li>
                    <li>It then normalizes this change by dividing it by the duration of the task in hours.</li>
                    <li>The result is an index representing the 'points' of fatigue gained per hour. This can be used to compare the cognitive strain of different activities.</li>
                </ol>
            </AccordionContent>
        </AccordionItem>
      </Accordion>
    </div>
  );
}

    
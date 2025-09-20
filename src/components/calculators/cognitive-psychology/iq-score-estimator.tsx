'use client';

import { useState } from 'react';
import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import { z } from 'zod';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Form, FormControl, FormField, FormItem, FormLabel, FormMessage } from '@/components/ui/form';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { BrainCircuit } from 'lucide-react';
import { Accordion, AccordionContent, AccordionItem, AccordionTrigger } from '@/components/ui/accordion';

const formSchema = z.object({
  rawScore: z.number().nonnegative(),
  totalQuestions: z.number().positive(),
  age: z.number().positive(),
});

type FormValues = z.infer<typeof formSchema>;

export default function IqScoreEstimator() {
  const [result, setResult] = useState<number | null>(null);

  const form = useForm<FormValues>({
    resolver: zodResolver(formSchema),
    defaultValues: {
      rawScore: undefined,
      totalQuestions: undefined,
      age: undefined,
    },
  });

  const onSubmit = (values: FormValues) => {
    const { rawScore, totalQuestions } = values;
    const iq = 100 + 15 * ((rawScore / totalQuestions * 100 - 50) / 10);
    setResult(iq);
  };

  return (
    <div className="space-y-8">
      <Form {...form}>
        <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-6">
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <FormField control={form.control} name="rawScore" render={({ field }) => (
                <FormItem><FormLabel>Raw Score (Correct Answers)</FormLabel><FormControl><Input type="number" {...field} value={field.value ?? ''} onChange={e => field.onChange(parseInt(e.target.value) || undefined)} /></FormControl><FormMessage /></FormItem>
            )} />
            <FormField control={form.control} name="totalQuestions" render={({ field }) => (
                <FormItem><FormLabel>Total Questions</FormLabel><FormControl><Input type="number" {...field} value={field.value ?? ''} onChange={e => field.onChange(parseInt(e.target.value) || undefined)} /></FormControl><FormMessage /></FormItem>
            )} />
            <FormField control={form.control} name="age" render={({ field }) => (
                <FormItem className="md:col-span-2"><FormLabel>Age of Test Taker</FormLabel><FormControl><Input type="number" {...field} value={field.value ?? ''} onChange={e => field.onChange(parseInt(e.target.value) || undefined)} /></FormControl><FormMessage /></FormItem>
            )} />
          </div>
          <Button type="submit">Estimate IQ</Button>
        </form>
      </Form>
      {result !== null && (
        <Card className="mt-8">
            <CardHeader><div className='flex items-center gap-4'><BrainCircuit className="h-8 w-8 text-primary" /><CardTitle>Estimated IQ Score</CardTitle></div></CardHeader>
            <CardContent>
                <p className="text-3xl font-bold text-center">{result.toFixed(0)}</p>
                <CardDescription className='mt-4 text-center'>This is a statistical estimation and not a clinical diagnosis. The age input helps contextualize the score but is not used in this simplified formula.</CardDescription>
            </CardContent>
        </Card>
      )}
       <Accordion type="single" collapsible className="w-full">
        <AccordionItem value="how-it-works">
            <AccordionTrigger>How It Works</AccordionTrigger>
            <AccordionContent className="text-muted-foreground space-y-2">
                <p>This calculator provides a rough estimation of an IQ score based on a simplified statistical conversion. It is not a substitute for a professionally administered psychometric test.</p>
                <ol className="list-decimal list-inside space-y-1">
                    <li>It calculates a percentile-like score from your raw score.</li>
                    <li>It then standardizes this score onto a normal distribution curve with a mean (average) of 100 and a standard deviation of 15, which is the standard scale for most IQ tests.</li>
                </ol>
            </AccordionContent>
        </AccordionItem>
      </Accordion>
    </div>
  );
}

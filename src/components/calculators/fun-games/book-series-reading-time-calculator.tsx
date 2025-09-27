
'use client';

import { useState } from 'react';
import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import { z } from 'zod';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Form, FormControl, FormField, FormItem, FormLabel, FormMessage } from '@/components/ui/form';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { BookOpen } from 'lucide-react';
import { Accordion, AccordionContent, AccordionItem, AccordionTrigger } from '@/components/ui/accordion';

const formSchema = z.object({
  wordCount: z.number().int().positive(),
  readingSpeed: z.number().int().positive(),
});

type FormValues = z.infer<typeof formSchema>;

function formatDuration(totalHours: number) {
    const hours = Math.floor(totalHours);
    const minutes = Math.round((totalHours - hours) * 60);
    return `${hours} hour${hours !== 1 ? 's' : ''}, ${minutes} minute${minutes !== 1 ? 's' : ''}`;
}

export default function BookSeriesReadingTimeCalculator() {
  const [result, setResult] = useState<string | null>(null);

  const form = useForm<FormValues>({
    resolver: zodResolver(formSchema),
    defaultValues: {
      wordCount: undefined,
      readingSpeed: undefined,
    },
  });

  const onSubmit = (values: FormValues) => {
    const totalMinutes = values.wordCount / values.readingSpeed;
    const totalHours = totalMinutes / 60;
    setResult(formatDuration(totalHours));
  };

  return (
    <div className="space-y-8">
      <Form {...form}>
        <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-6">
          <CardDescription>Estimate how long it will take to read a book or series based on the total word count and your reading speed.</CardDescription>
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <FormField control={form.control} name="wordCount" render={({ field }) => (
                <FormItem><FormLabel>Total Word Count</FormLabel><FormControl><Input type="number" placeholder="e.g., 470000" {...field} value={field.value ?? ''} onChange={e => field.onChange(parseInt(e.target.value) || undefined)} /></FormControl><FormMessage /></FormItem>
            )} />
            <FormField control={form.control} name="readingSpeed" render={({ field }) => (
                <FormItem><FormLabel>Your Reading Speed (WPM)</FormLabel><FormControl><Input type="number" placeholder="e.g., 250" {...field} value={field.value ?? ''} onChange={e => field.onChange(parseInt(e.target.value) || undefined)} /></FormControl><FormMessage /></FormItem>
            )} />
          </div>
          <Button type="submit">Calculate Reading Time</Button>
        </form>
      </Form>
      
      {result !== null && (
        <Card className="mt-8">
            <CardHeader><div className='flex items-center gap-4'><BookOpen className="h-8 w-8 text-primary" /><CardTitle>Estimated Reading Time</CardTitle></div></CardHeader>
            <CardContent>
                <p className="text-3xl font-bold text-center">{result}</p>
            </CardContent>
        </Card>
      )}

      <Accordion type="single" collapsible className="w-full">
        <AccordionItem value="how-it-works">
            <AccordionTrigger>How It Works</AccordionTrigger>
            <AccordionContent className="text-muted-foreground">
                <p>This calculator divides the total word count of the book or series by your reading speed in words per minute (WPM) to find the total minutes required. It then converts this duration into hours and minutes for easier understanding.</p>
            </AccordionContent>
        </AccordionItem>
      </Accordion>
    </div>
  );
}


'use client';

import { useState } from 'react';
import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import { z } from 'zod';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Form, FormControl, FormField, FormItem, FormLabel, FormMessage } from '@/components/ui/form';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Mic } from 'lucide-react';
import { Accordion, AccordionContent, AccordionItem, AccordionTrigger } from '@/components/ui/accordion';

const formSchema = z.object({
  singersAhead: z.number().int().nonnegative(),
  avgSongLength: z.number().positive(),
});

type FormValues = z.infer<typeof formSchema>;

export default function KaraokeQueueTimeCalculator() {
  const [result, setResult] = useState<number | null>(null);

  const form = useForm<FormValues>({
    resolver: zodResolver(formSchema),
    defaultValues: {
      singersAhead: undefined,
      avgSongLength: undefined,
    },
  });

  const onSubmit = (values: FormValues) => {
    const waitTime = values.singersAhead * values.avgSongLength;
    setResult(waitTime);
  };

  return (
    <div className="space-y-8">
      <Form {...form}>
        <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-6">
          <CardDescription>Estimate how long you have to wait until your turn to sing.</CardDescription>
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <FormField control={form.control} name="singersAhead" render={({ field }) => (
                <FormItem><FormLabel>Singers Ahead of You</FormLabel><FormControl><Input type="number" {...field} value={field.value ?? ''} onChange={e => field.onChange(parseInt(e.target.value) || 0)} /></FormControl><FormMessage /></FormItem>
            )} />
            <FormField control={form.control} name="avgSongLength" render={({ field }) => (
                <FormItem><FormLabel>Average Song Length (mins)</FormLabel><FormControl><Input type="number" step="0.5" placeholder="e.g., 3.5" {...field} value={field.value ?? ''} onChange={e => field.onChange(parseFloat(e.target.value) || 0)} /></FormControl><FormMessage /></FormItem>
            )} />
          </div>
          <Button type="submit">Estimate Wait Time</Button>
        </form>
      </Form>
      
      {result !== null && (
        <Card className="mt-8">
            <CardHeader><div className='flex items-center gap-4'><Mic className="h-8 w-8 text-primary" /><CardTitle>Estimated Wait Time</CardTitle></div></CardHeader>
            <CardContent>
                <p className="text-3xl font-bold text-center">{result.toFixed(0)} minutes</p>
                <CardDescription className='mt-4 text-center'>This doesn't account for setup time between singers or duets!</CardDescription>
            </CardContent>
        </Card>
      )}

       <Accordion type="single" collapsible className="w-full">
        <AccordionItem value="how-it-works">
            <AccordionTrigger>How It Works</AccordionTrigger>
            <AccordionContent className="text-muted-foreground">
                <p>This is a simple calculator that multiplies the number of singers in the queue ahead of you by the average song length to give a rough estimate of your wait time in minutes.</p>
            </AccordionContent>
        </AccordionItem>
      </Accordion>
    </div>
  );
}

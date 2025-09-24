
'use client';

import { useState } from 'react';
import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import { z } from 'zod';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Form, FormControl, FormField, FormItem, FormLabel, FormMessage } from '@/components/ui/form';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Gauge } from 'lucide-react';
import { Accordion, AccordionContent, AccordionItem, AccordionTrigger } from '@/components/ui/accordion';

const formSchema = z.object({
  requests: z.number().int().positive(),
  timeValue: z.number().int().positive(),
  timeUnit: z.enum(['seconds', 'minutes', 'hours']),
});

type FormValues = z.infer<typeof formSchema>;

export default function ApiRateLimitPlanner() {
  const [result, setResult] = useState<{ perSecond: number; perMinute: number; perHour: number } | null>(null);

  const form = useForm<FormValues>({
    resolver: zodResolver(formSchema),
    defaultValues: {
        requests: undefined,
        timeValue: undefined,
        timeUnit: 'minutes',
    },
  });

  const onSubmit = (values: FormValues) => {
    const { requests, timeValue, timeUnit } = values;
    let totalSeconds = timeValue;
    if (timeUnit === 'minutes') {
      totalSeconds *= 60;
    } else if (timeUnit === 'hours') {
      totalSeconds *= 3600;
    }

    const perSecond = requests / totalSeconds;
    const perMinute = perSecond * 60;
    const perHour = perMinute * 60;
    
    setResult({ perSecond, perMinute, perHour });
  };

  return (
    <div className="space-y-8">
      <Form {...form}>
        <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-6">
          <CardDescription>Enter your API's rate limit quota to see the equivalent rates per second, minute, and hour.</CardDescription>
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <FormField control={form.control} name="requests" render={({ field }) => (
                <FormItem><FormLabel>Number of Requests</FormLabel><FormControl><Input type="number" {...field} value={field.value ?? ''} onChange={e => field.onChange(parseInt(e.target.value) || undefined)} /></FormControl><FormMessage /></FormItem>
            )} />
            <FormField control={form.control} name="timeValue" render={({ field }) => (
                <FormItem><FormLabel>Time Value</FormLabel><FormControl><Input type="number" {...field} value={field.value ?? ''} onChange={e => field.onChange(parseInt(e.target.value) || undefined)} /></FormControl><FormMessage /></FormItem>
            )} />
            <FormField control={form.control} name="timeUnit" render={({ field }) => (
                <FormItem className="md:col-span-2"><FormLabel>Time Unit</FormLabel>
                <select {...field} className="w-full h-10 rounded-md border border-input bg-background px-3 py-2 text-sm">
                    <option value="seconds">Seconds</option>
                    <option value="minutes">Minutes</option>
                    <option value="hours">Hours</option>
                </select>
                <FormMessage /></FormItem>
            )} />
          </div>
          <Button type="submit">Calculate Rates</Button>
        </form>
      </Form>
      
      {result !== null && (
        <Card className="mt-8">
            <CardHeader><div className='flex items-center gap-4'><Gauge className="h-8 w-8 text-primary" /><CardTitle>Equivalent API Rates</CardTitle></div></CardHeader>
            <CardContent>
                <div className="grid grid-cols-1 md:grid-cols-3 gap-4 text-center">
                    <div>
                        <p className="text-muted-foreground">Per Second</p>
                        <p className="text-2xl font-bold">{result.perSecond.toFixed(2)}</p>
                    </div>
                    <div>
                        <p className="text-muted-foreground">Per Minute</p>
                        <p className="text-2xl font-bold">{result.perMinute.toFixed(2)}</p>
                    </div>
                    <div>
                        <p className="text-muted-foreground">Per Hour</p>
                        <p className="text-2xl font-bold">{result.perHour.toLocaleString(undefined, {maximumFractionDigits: 0})}</p>
                    </div>
                </div>
            </CardContent>
        </Card>
      )}

      <Accordion type="single" collapsible className="w-full">
        <AccordionItem value="how-it-works">
            <AccordionTrigger>How It Works</AccordionTrigger>
            <AccordionContent className="text-muted-foreground">
                This tool helps you understand your API usage limits. It first calculates the rate per second by dividing the total number of requests by the total time window in seconds. It then scales this base rate up to show the equivalent number of requests you could make per minute and per hour, assuming a constant rate.
            </AccordionContent>
        </AccordionItem>
      </Accordion>
    </div>
  );
}

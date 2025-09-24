
'use client';

import { useState } from 'react';
import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import { z } from 'zod';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Form, FormControl, FormField, FormItem, FormLabel, FormMessage } from '@/components/ui/form';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Map, Waves } from 'lucide-react';
import { Accordion, AccordionContent, AccordionItem, AccordionTrigger } from '@/components/ui/accordion';

const SPEED_OF_LIGHT_IN_FIBER = 200000; // km/s, approx 2/3 speed of light

const formSchema = z.object({
  ping: z.number().positive(),
});

type FormValues = z.infer<typeof formSchema>;

export default function PingLatencyDistanceCalculator() {
  const [result, setResult] = useState<number | null>(null);

  const form = useForm<FormValues>({
    resolver: zodResolver(formSchema),
    defaultValues: { ping: undefined },
  });

  const onSubmit = (values: FormValues) => {
    const oneWayTime_s = (values.ping / 1000) / 2;
    const distance_km = oneWayTime_s * SPEED_OF_LIGHT_IN_FIBER;
    setResult(distance_km);
  };

  return (
    <div className="space-y-8">
      <Form {...form}>
        <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-6">
          <FormField control={form.control} name="ping" render={({ field }) => (
              <FormItem><FormLabel>Round-Trip Ping Time (ms)</FormLabel><FormControl><Input type="number" placeholder="e.g., 50" {...field} value={field.value ?? ''} onChange={e => field.onChange(parseFloat(e.target.value) || undefined)} /></FormControl><FormMessage /></FormItem>
          )} />
          <Button type="submit">Estimate Distance</Button>
        </form>
      </Form>

      {result !== null && (
        <Card className="mt-8">
            <CardHeader><div className='flex items-center gap-4'><Map className="h-8 w-8 text-primary" /><CardTitle>Theoretical Minimum Distance</CardTitle></div></CardHeader>
            <CardContent>
                <p className="text-3xl font-bold text-center">{result.toLocaleString(undefined, {maximumFractionDigits: 0})} km</p>
                <CardDescription className='mt-4 text-center'>This is the straight-line distance the signal would travel in a vacuum. Real-world distance will be shorter as fiber optic cables do not follow straight paths.</CardDescription>
            </CardContent>
        </Card>
      )}

      <Accordion type="single" collapsible className="w-full">
        <AccordionItem value="how-it-works">
            <AccordionTrigger>How It Works</AccordionTrigger>
            <AccordionContent className="text-muted-foreground space-y-2">
                <p>This calculator provides a fun, theoretical estimate of distance based on network latency.</p>
                 <ol className="list-decimal list-inside space-y-1">
                    <li><strong>One-Way Time:</strong> Ping measures the "round-trip time" for a signal to go to a server and come back. The calculator divides this by two to get the one-way travel time in milliseconds, then converts it to seconds.</li>
                    <li><strong>Speed of Light in Fiber:</strong> Light travels slower in fiber optic cable than in a vacuum. We use an approximate speed of 200,000 kilometers per second.</li>
                    <li><strong>Distance Calculation:</strong> It multiplies the one-way time in seconds by the speed of light in fiber to get the minimum theoretical distance the signal traveled. In reality, network paths are not straight lines and involve processing delays at each hop, so the actual geographic distance is shorter.</li>
                </ol>
            </AccordionContent>
        </AccordionItem>
      </Accordion>
    </div>
  );
}

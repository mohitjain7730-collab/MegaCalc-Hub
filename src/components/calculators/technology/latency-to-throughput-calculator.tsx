
'use client';

import { useState } from 'react';
import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import { z } from 'zod';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Form, FormControl, FormField, FormItem, FormLabel, FormMessage } from '@/components/ui/form';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { ArrowRightLeft } from 'lucide-react';
import { Accordion, AccordionContent, AccordionItem, AccordionTrigger } from '@/components/ui/accordion';

const formSchema = z.object({
  windowSize: z.number().positive(),
  latency: z.number().positive(),
});

type FormValues = z.infer<typeof formSchema>;

export default function LatencyToThroughputCalculator() {
  const [result, setResult] = useState<number | null>(null);

  const form = useForm<FormValues>({
    resolver: zodResolver(formSchema),
    defaultValues: {
        windowSize: undefined,
        latency: undefined,
    },
  });

  const onSubmit = (values: FormValues) => {
    const { windowSize, latency } = values;
    const windowSizeBytes = windowSize * 1024;
    const latencySeconds = latency / 1000;
    
    const throughputBps = windowSizeBytes / latencySeconds;
    const throughputMbps = (throughputBps * 8) / (1000 * 1000);
    
    setResult(throughputMbps);
  };

  return (
    <div className="space-y-8">
      <Form {...form}>
        <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-6">
          <CardDescription>Calculate the maximum theoretical throughput (Bandwidth-Delay Product).</CardDescription>
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <FormField control={form.control} name="windowSize" render={({ field }) => (
                <FormItem><FormLabel>TCP Receive Window Size (KB)</FormLabel><FormControl><Input type="number" {...field} value={field.value ?? ''} onChange={e => field.onChange(parseFloat(e.target.value) || undefined)} /></FormControl><FormMessage /></FormItem>
            )} />
            <FormField control={form.control} name="latency" render={({ field }) => (
                <FormItem><FormLabel>Round-Trip Latency (ms)</FormLabel><FormControl><Input type="number" {...field} value={field.value ?? ''} onChange={e => field.onChange(parseFloat(e.target.value) || undefined)} /></FormControl><FormMessage /></FormItem>
            )} />
          </div>
          <Button type="submit">Calculate Throughput</Button>
        </form>
      </Form>
      
      {result !== null && (
        <Card className="mt-8">
            <CardHeader><div className='flex items-center gap-4'><ArrowRightLeft className="h-8 w-8 text-primary" /><CardTitle>Maximum Throughput</CardTitle></div></CardHeader>
            <CardContent>
                <p className="text-3xl font-bold text-center">{result.toFixed(2)} Mbps</p>
                <CardDescription className='mt-4 text-center'>This is the theoretical maximum data rate limited by latency and TCP window size.</CardDescription>
            </CardContent>
        </Card>
      )}

      <Accordion type="single" collapsible className="w-full">
        <AccordionItem value="how-it-works">
            <AccordionTrigger>How It Works</AccordionTrigger>
            <AccordionContent className="text-muted-foreground">
                This calculator determines the Bandwidth-Delay Product (BDP), which represents the maximum amount of data that can be "in flight" on a network path at any given time. The TCP Receive Window must be large enough to hold this amount of data to achieve maximum throughput. The formula is `Max Throughput = TCP Window Size / Latency`. The result shows the bottleneck created by latency, regardless of the available physical bandwidth.
            </AccordionContent>
        </AccordionItem>
      </Accordion>
    </div>
  );
}

'use client';

import { useState } from 'react';
import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import { z } from 'zod';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Form, FormControl, FormField, FormItem, FormLabel, FormMessage } from '@/components/ui/form';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Network } from 'lucide-react';
import { Accordion, AccordionContent, AccordionItem, AccordionTrigger } from '@/components/ui/accordion';

const formSchema = z.object({
  users: z.number().int().positive(),
  bitrate: z.number().positive(),
});

type FormValues = z.infer<typeof formSchema>;

export default function NetworkBandwidthCalculator() {
  const [result, setResult] = useState<number | null>(null);

  const form = useForm<FormValues>({
    resolver: zodResolver(formSchema),
    defaultValues: { users: 10, bitrate: 4 },
  });

  const onSubmit = (values: FormValues) => {
    setResult(values.users * values.bitrate);
  };

  return (
    <div className="space-y-8">
      <Form {...form}>
        <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-6">
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <FormField control={form.control} name="users" render={({ field }) => (
                <FormItem><FormLabel>Number of Concurrent Users/Streams</FormLabel><FormControl><Input type="number" {...field} value={field.value ?? ''} onChange={e => field.onChange(parseInt(e.target.value) || undefined)} /></FormControl><FormMessage /></FormItem>
            )} />
            <FormField control={form.control} name="bitrate" render={({ field }) => (
                <FormItem><FormLabel>Average Bitrate per User (Mbps)</FormLabel><FormControl><Input type="number" {...field} value={field.value ?? ''} onChange={e => field.onChange(parseFloat(e.target.value) || undefined)} /></FormControl><FormMessage /></FormItem>
            )} />
          </div>
          <Button type="submit">Calculate Bandwidth</Button>
        </form>
      </Form>

      {result !== null && (
        <Card className="mt-8">
            <CardHeader><div className='flex items-center gap-4'><Network className="h-8 w-8 text-primary" /><CardTitle>Required Network Bandwidth</CardTitle></div></CardHeader>
            <CardContent>
                <p className="text-3xl font-bold text-center">{result.toFixed(2)} Mbps</p>
                <CardDescription className='mt-4 text-center'>This is the estimated total bandwidth needed to support all users simultaneously. Add a 20-30% buffer for overhead and peak usage.</CardDescription>
            </CardContent>
        </Card>
      )}

      <Accordion type="single" collapsible className="w-full">
        <AccordionItem value="how-it-works">
            <AccordionTrigger>How It Works</AccordionTrigger>
            <AccordionContent className="text-muted-foreground">
                <p>This calculator provides a simple estimate for network capacity planning. It multiplies the number of concurrent users (or streams) by the average data rate (bitrate) required for each one. The result is the total bandwidth in Megabits per second (Mbps) needed to serve all users at the same time.</p>
            </AccordionContent>
        </AccordionItem>
        <AccordionItem value="common-bitrates">
            <AccordionTrigger>Common Bitrate Examples (per stream)</AccordionTrigger>
            <AccordionContent className="text-muted-foreground space-y-2">
                <ul className="list-disc list-inside">
                    <li><strong>HD (1080p) Video Stream:</strong> 4-6 Mbps</li>
                    <li><strong>4K (UHD) Video Stream:</strong> 15-25 Mbps</li>
                    <li><strong>Online Gaming:</strong> 1-3 Mbps</li>
                    <li><strong>High-Quality Music Stream:</strong> 0.32 Mbps (320 kbps)</li>
                    <li><strong>Video Conferencing (per user):</strong> 1-4 Mbps</li>
                </ul>
            </AccordionContent>
        </AccordionItem>
      </Accordion>
    </div>
  );
}

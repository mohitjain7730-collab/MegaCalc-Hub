
'use client';

import { useState } from 'react';
import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import { z } from 'zod';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Form, FormControl, FormField, FormItem, FormLabel, FormMessage } from '@/components/ui/form';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Zap } from 'lucide-react';
import { Accordion, AccordionContent, AccordionItem, AccordionTrigger } from '@/components/ui/accordion';

const formSchema = z.object({
  voltage: z.number().positive(),
  current: z.number().positive(),
  powerFactor: z.number().min(0).max(1),
});

type FormValues = z.infer<typeof formSchema>;

export default function ElectricalPowerCalculator() {
  const [result, setResult] = useState<number | null>(null);

  const form = useForm<FormValues>({
    resolver: zodResolver(formSchema),
    defaultValues: {
      voltage: undefined,
      current: undefined,
      powerFactor: undefined,
    },
  });

  const onSubmit = (values: FormValues) => {
    const { voltage, current, powerFactor } = values;
    const power = Math.sqrt(3) * voltage * current * powerFactor;
    setResult(power);
  };

  return (
    <div className="space-y-8">
      <Form {...form}>
        <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-6">
          <CardDescription>Calculate real power in a balanced 3-phase system.</CardDescription>
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <FormField control={form.control} name="voltage" render={({ field }) => (
                <FormItem><FormLabel>Line-to-Line Voltage (V)</FormLabel><FormControl><Input type="number" {...field} value={field.value ?? ''} onChange={e => field.onChange(parseFloat(e.target.value) || undefined)} /></FormControl><FormMessage /></FormItem>
            )} />
            <FormField control={form.control} name="current" render={({ field }) => (
                <FormItem><FormLabel>Line Current (I, Amps)</FormLabel><FormControl><Input type="number" {...field} value={field.value ?? ''} onChange={e => field.onChange(parseFloat(e.target.value) || undefined)} /></FormControl><FormMessage /></FormItem>
            )} />
            <FormField control={form.control} name="powerFactor" render={({ field }) => (
                <FormItem className="md:col-span-2"><FormLabel>Power Factor (PF)</FormLabel><FormControl><Input type="number" step="0.01" {...field} value={field.value ?? ''} onChange={e => field.onChange(parseFloat(e.target.value) || undefined)} placeholder="e.g., 0.85" /></FormControl><FormMessage /></FormItem>
            )} />
          </div>
          <Button type="submit">Calculate Power</Button>
        </form>
      </Form>
      {result !== null && (
        <Card className="mt-8">
            <CardHeader><div className='flex items-center gap-4'><Zap className="h-8 w-8 text-primary" /><CardTitle>Total Real Power</CardTitle></div></CardHeader>
            <CardContent>
                <p className="text-3xl font-bold text-center">{result.toFixed(2)} Watts</p>
                <CardDescription className='mt-4 text-center'>This is the actual power consumed by the load to do useful work.</CardDescription>
            </CardContent>
        </Card>
      )}
       <Accordion type="single" collapsible className="w-full">
        <AccordionItem value="how-it-works">
            <AccordionTrigger>How It Works</AccordionTrigger>
            <AccordionContent className="text-muted-foreground space-y-2">
                <p>This calculator computes the real power (P) in a balanced three-phase AC electrical system using the standard formula.</p>
                <p className='font-mono p-4 bg-muted rounded-md'>P = √3 × V × I × PF</p>
                 <ul className="list-disc list-inside space-y-1 pl-4">
                    <li><strong>P</strong> is the real power in Watts (W), which performs the actual work.</li>
                    <li><strong>√3</strong> (approximately 1.732) is a constant used for three-phase calculations.</li>
                    <li><strong>V</strong> is the RMS line-to-line voltage.</li>
                    <li><strong>I</strong> is the RMS line current.</li>
                    <li><strong>PF</strong> is the Power Factor, the ratio of real power to apparent power. A purely resistive load has a PF of 1.</li>
                </ul>
            </AccordionContent>
        </AccordionItem>
      </Accordion>
    </div>
  );
}

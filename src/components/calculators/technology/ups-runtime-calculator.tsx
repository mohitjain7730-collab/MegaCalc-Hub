
'use client';

import { useState } from 'react';
import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import { z } from 'zod';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Form, FormControl, FormField, FormItem, FormLabel, FormMessage } from '@/components/ui/form';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Power } from 'lucide-react';
import { Accordion, AccordionContent, AccordionItem, AccordionTrigger } from '@/components/ui/accordion';

const formSchema = z.object({
  batteryCapacity: z.number().positive(),
  batteryVoltage: z.number().positive(),
  load: z.number().positive(),
  upsEfficiency: z.number().min(0).max(100).default(85),
});

type FormValues = z.infer<typeof formSchema>;

export default function UpsRuntimeCalculator() {
  const [result, setResult] = useState<number | null>(null);

  const form = useForm<FormValues>({
    resolver: zodResolver(formSchema),
    defaultValues: {
        batteryCapacity: undefined,
        batteryVoltage: undefined,
        load: undefined,
        upsEfficiency: 85,
    },
  });

  const onSubmit = (values: FormValues) => {
    const { batteryCapacity, batteryVoltage, load, upsEfficiency } = values;
    
    const runtimeHours = (batteryCapacity * batteryVoltage) / (load / (upsEfficiency / 100));
    const runtimeMinutes = runtimeHours * 60;
    
    setResult(runtimeMinutes);
  };

  return (
    <div className="space-y-8">
      <Form {...form}>
        <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-6">
          <CardDescription>Estimate the backup runtime of a UPS (Uninterruptible Power Supply).</CardDescription>
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <FormField control={form.control} name="batteryCapacity" render={({ field }) => (
                <FormItem><FormLabel>Battery Capacity (Ah)</FormLabel><FormControl><Input type="number" {...field} value={field.value ?? ''} onChange={e => field.onChange(parseFloat(e.target.value) || undefined)} /></FormControl><FormMessage /></FormItem>
            )} />
            <FormField control={form.control} name="batteryVoltage" render={({ field }) => (
                <FormItem><FormLabel>Battery Voltage (V)</FormLabel><FormControl><Input type="number" {...field} value={field.value ?? ''} onChange={e => field.onChange(parseFloat(e.target.value) || undefined)} /></FormControl><FormMessage /></FormItem>
            )} />
            <FormField control={form.control} name="load" render={({ field }) => (
                <FormItem><FormLabel>Load (Watts)</FormLabel><FormControl><Input type="number" {...field} value={field.value ?? ''} onChange={e => field.onChange(parseFloat(e.target.value) || undefined)} /></FormControl><FormMessage /></FormItem>
            )} />
            <FormField control={form.control} name="upsEfficiency" render={({ field }) => (
                <FormItem><FormLabel>UPS Efficiency (%)</FormLabel><FormControl><Input type="number" {...field} value={field.value ?? ''} onChange={e => field.onChange(parseFloat(e.target.value) || 0)} /></FormControl><FormMessage /></FormItem>
            )} />
          </div>
          <Button type="submit">Estimate Runtime</Button>
        </form>
      </Form>
      
      {result !== null && (
        <Card className="mt-8">
            <CardHeader><div className='flex items-center gap-4'><Power className="h-8 w-8 text-primary" /><CardTitle>Estimated UPS Runtime</CardTitle></div></CardHeader>
            <CardContent>
                <p className="text-3xl font-bold text-center">{result.toFixed(0)} minutes</p>
                <CardDescription className='mt-4 text-center'>This is an ideal estimate. Real runtime will be lower due to battery age and temperature.</CardDescription>
            </CardContent>
        </Card>
      )}

      <Accordion type="single" collapsible className="w-full">
        <AccordionItem value="how-it-works">
            <AccordionTrigger>How It Works</AccordionTrigger>
            <AccordionContent className="text-muted-foreground">
                This calculator first determines the total energy stored in the battery (in Watt-hours) by multiplying capacity (Ah) by voltage (V). It then divides this energy by the power draw of your equipment, adjusted for the UPS's own inefficiency (the energy it loses as heat during the power conversion process). The result is the estimated runtime in hours, which is then converted to minutes.
            </AccordionContent>
        </AccordionItem>
      </Accordion>
    </div>
  );
}

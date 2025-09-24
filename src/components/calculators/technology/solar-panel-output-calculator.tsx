
'use client';

import { useState } from 'react';
import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import { z } from 'zod';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Form, FormControl, FormField, FormItem, FormLabel, FormMessage } from '@/components/ui/form';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Sun } from 'lucide-react';
import { Accordion, AccordionContent, AccordionItem, AccordionTrigger } from '@/components/ui/accordion';

const formSchema = z.object({
  panelWattage: z.number().positive(),
  peakSunHours: z.number().positive(),
  efficiencyLoss: z.number().min(0).max(100).default(25),
});

type FormValues = z.infer<typeof formSchema>;

export default function SolarPanelOutputCalculator() {
  const [result, setResult] = useState<number | null>(null);

  const form = useForm<FormValues>({
    resolver: zodResolver(formSchema),
    defaultValues: {
        panelWattage: undefined,
        peakSunHours: undefined,
        efficiencyLoss: 25,
    },
  });

  const onSubmit = (values: FormValues) => {
    const { panelWattage, peakSunHours, efficiencyLoss } = values;
    const dailyOutputWh = panelWattage * peakSunHours * (1 - efficiencyLoss / 100);
    setResult(dailyOutputWh);
  };

  return (
    <div className="space-y-8">
      <Form {...form}>
        <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-6">
          <CardDescription>Estimate the daily energy output of a solar panel.</CardDescription>
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <FormField control={form.control} name="panelWattage" render={({ field }) => (
                <FormItem><FormLabel>Panel Wattage (Watts)</FormLabel><FormControl><Input type="number" {...field} value={field.value ?? ''} onChange={e => field.onChange(parseFloat(e.target.value) || undefined)} /></FormControl><FormMessage /></FormItem>
            )} />
            <FormField control={form.control} name="peakSunHours" render={({ field }) => (
                <FormItem><FormLabel>Peak Sun Hours per Day</FormLabel><FormControl><Input type="number" {...field} value={field.value ?? ''} onChange={e => field.onChange(parseFloat(e.target.value) || undefined)} /></FormControl><FormMessage /></FormItem>
            )} />
            <FormField control={form.control} name="efficiencyLoss" render={({ field }) => (
                <FormItem className="md:col-span-2"><FormLabel>System Efficiency Loss (%)</FormLabel><FormControl><Input type="number" {...field} value={field.value ?? ''} onChange={e => field.onChange(parseFloat(e.target.value) || 0)} /></FormControl><FormMessage /></FormItem>
            )} />
          </div>
          <Button type="submit">Estimate Output</Button>
        </form>
      </Form>
      
      {result !== null && (
        <Card className="mt-8">
            <CardHeader><div className='flex items-center gap-4'><Sun className="h-8 w-8 text-primary" /><CardTitle>Estimated Daily Energy Output</CardTitle></div></CardHeader>
            <CardContent>
                <p className="text-3xl font-bold text-center">{result.toFixed(0)} Wh</p>
                <CardDescription className='mt-4 text-center'>This is the estimated Watt-hours your panel will generate on an average day.</CardDescription>
            </CardContent>
        </Card>
      )}

      <Accordion type="single" collapsible className="w-full">
        <AccordionItem value="how-it-works">
            <AccordionTrigger>How It Works</AccordionTrigger>
            <AccordionContent className="text-muted-foreground">
                The calculator multiplies the panel's rated wattage by the number of peak sun hours. This ideal output is then reduced by a system efficiency loss factor, which accounts for real-world conditions like temperature, dirt, inverter inefficiency, and wiring losses. A 25% loss is a common general estimate.
            </AccordionContent>
        </AccordionItem>
      </Accordion>
    </div>
  );
}

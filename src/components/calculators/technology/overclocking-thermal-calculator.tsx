'use client';

import { useState } from 'react';
import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import { z } from 'zod';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Form, FormControl, FormField, FormItem, FormLabel, FormMessage } from '@/components/ui/form';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Thermometer } from 'lucide-react';
import { Alert, AlertDescription, AlertTitle } from '@/components/ui/alert';
import { Accordion, AccordionContent, AccordionItem, AccordionTrigger } from '@/components/ui/accordion';

const formSchema = z.object({
  p1: z.number().positive("Must be positive"),
  v1: z.number().positive("Must be positive"),
  f1: z.number().positive("Must be positive"),
  v2: z.number().positive("Must be positive"),
  f2: z.number().positive("Must be positive"),
  tAmbient: z.number().positive("Must be positive"),
  thetaJA: z.number().positive("Must be positive"),
});

type FormValues = z.infer<typeof formSchema>;

export default function OverclockingThermalCalculator() {
  const [result, setResult] = useState<number | null>(null);

  const form = useForm<FormValues>({
    resolver: zodResolver(formSchema),
    defaultValues: {
        p1: 95, // Watts
        v1: 1.25, // Volts
        f1: 3.6, // GHz
        v2: 1.35, // Volts
        f2: 4.0, // GHz
        tAmbient: 25, // Celsius
        thetaJA: 0.5, // °C/W
    },
  });

  const onSubmit = (values: FormValues) => {
    const { p1, v1, f1, v2, f2, tAmbient, thetaJA } = values;
    const p2 = p1 * Math.pow(v2 / v1, 2) * (f2 / f1);
    const t2 = tAmbient + (p2 * thetaJA);
    setResult(t2);
  };

  return (
    <div className="space-y-8">
      <Alert variant="destructive">
          <Thermometer className="h-4 w-4" />
          <AlertTitle>Warning: For Educational Use Only</AlertTitle>
          <AlertDescription>
            This is a highly simplified model. Overclocking can damage your hardware. Actual temperatures depend heavily on your specific cooler, case airflow, and component architecture. Do not rely on this calculator for making real-world overclocking decisions.
          </AlertDescription>
      </Alert>
      <Form {...form}>
        <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-6">
          <div className="grid grid-cols-1 md:grid-cols-2 gap-x-6 gap-y-4">
              <div>
                  <h3 className="text-lg font-medium mb-2 border-b pb-2">Base Settings</h3>
                  <div className="space-y-4 pt-2">
                    <FormField control={form.control} name="p1" render={({ field }) => (<FormItem><FormLabel>Base Power (P1, Watts)</FormLabel><FormControl><Input type="number" {...field} value={field.value ?? ''} onChange={e => field.onChange(parseFloat(e.target.value) || undefined)}/></FormControl><FormMessage/></FormItem>)} />
                    <FormField control={form.control} name="v1" render={({ field }) => (<FormItem><FormLabel>Base Voltage (V1, Volts)</FormLabel><FormControl><Input type="number" {...field} value={field.value ?? ''} onChange={e => field.onChange(parseFloat(e.target.value) || undefined)} /></FormControl><FormMessage/></FormItem>)} />
                    <FormField control={form.control} name="f1" render={({ field }) => (<FormItem><FormLabel>Base Frequency (f1, GHz)</FormLabel><FormControl><Input type="number" {...field} value={field.value ?? ''} onChange={e => field.onChange(parseFloat(e.target.value) || undefined)} /></FormControl><FormMessage/></FormItem>)} />
                  </div>
              </div>
               <div>
                  <h3 className="text-lg font-medium mb-2 border-b pb-2">Overclock Settings</h3>
                  <div className="space-y-4 pt-2">
                    <FormField control={form.control} name="v2" render={({ field }) => (<FormItem><FormLabel>New Voltage (V2, Volts)</FormLabel><FormControl><Input type="number" {...field} value={field.value ?? ''} onChange={e => field.onChange(parseFloat(e.target.value) || undefined)}/></FormControl><FormMessage/></FormItem>)} />
                    <FormField control={form.control} name="f2" render={({ field }) => (<FormItem><FormLabel>New Frequency (f2, GHz)</FormLabel><FormControl><Input type="number" {...field} value={field.value ?? ''} onChange={e => field.onChange(parseFloat(e.target.value) || undefined)} /></FormControl><FormMessage/></FormItem>)} />
                  </div>
              </div>
              <div className="md:col-span-2">
                  <h3 className="text-lg font-medium mb-2 border-b pb-2">Thermal Environment</h3>
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-x-6 gap-y-4 pt-2">
                    <FormField control={form.control} name="tAmbient" render={({ field }) => (<FormItem><FormLabel>Ambient Temp (°C)</FormLabel><FormControl><Input type="number" {...field} value={field.value ?? ''} onChange={e => field.onChange(parseFloat(e.target.value) || undefined)} /></FormControl><FormMessage/></FormItem>)} />
                    <FormField control={form.control} name="thetaJA" render={({ field }) => (<FormItem><FormLabel>Cooler Resistance (θJA, °C/W)</FormLabel><FormControl><Input type="number" {...field} value={field.value ?? ''} onChange={e => field.onChange(parseFloat(e.target.value) || undefined)} /></FormControl><FormMessage/></FormItem>)} />
                  </div>
              </div>
          </div>
          <Button type="submit">Estimate Temperature</Button>
        </form>
      </Form>

      {result !== null && (
        <Card className="mt-8">
            <CardHeader><div className='flex items-center gap-4'><Thermometer className="h-8 w-8 text-primary" /><CardTitle>Estimated New Temperature</CardTitle></div></CardHeader>
            <CardContent>
                <p className="text-3xl font-bold text-center">{result.toFixed(1)} °C</p>
                <CardDescription className='mt-4 text-center'>This theoretical value represents the estimated steady-state temperature under full load with your new settings.</CardDescription>
            </CardContent>
        </Card>
      )}

      <Accordion type="single" collapsible className="w-full">
        <AccordionItem value="how-it-works">
            <AccordionTrigger>How It Works</AccordionTrigger>
            <AccordionContent className="text-muted-foreground space-y-2">
                <ol className="list-decimal list-inside space-y-1">
                    <li><strong>Estimate New Power (P₂):</strong> It first calculates the new power consumption based on the principle that power scales linearly with frequency and with the square of the voltage. `P₂ = P₁ * (V₂/V₁)² * (f₂/f₁)`.</li>
                    <li><strong>Estimate New Temperature (T₂):</strong> It then estimates the new temperature using the formula `T₂ = T_ambient + (P₂ * θJA)`. `θJA` (Theta-JA) is the thermal resistance from the component's junction to the ambient air, a property of your cooling solution (heatsink + fan). A lower `θJA` means a better cooler.</li>
                </ol>
            </AccordionContent>
        </AccordionItem>
      </Accordion>
    </div>
  );
}

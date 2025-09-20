'use client';

import { useState } from 'react';
import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import { z } from 'zod';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Form, FormControl, FormField, FormItem, FormLabel, FormMessage } from '@/components/ui/form';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Droplets } from 'lucide-react';

const formSchema = z.object({
  flowRate: z.number().positive(),
  head: z.number().positive(),
  fluidDensity: z.number().positive(),
  pumpEfficiency: z.number().min(0).max(100),
});

type FormValues = z.infer<typeof formSchema>;

export default function PumpPowerCalculator() {
  const [result, setResult] = useState<{ hydraulicPower: number, shaftPower: number } | null>(null);

  const form = useForm<FormValues>({
    resolver: zodResolver(formSchema),
    defaultValues: {
      flowRate: undefined,
      head: undefined,
      fluidDensity: 1000, // kg/m^3 for water
      pumpEfficiency: 75,
    },
  });

  const onSubmit = (values: FormValues) => {
    const { flowRate, head, fluidDensity, pumpEfficiency } = values;
    
    // Using metric units: flow (m^3/s), head (m), density (kg/m^3)
    const hydraulicPower = (flowRate * head * fluidDensity * 9.81) / 1000; // in kW
    const shaftPower = hydraulicPower / (pumpEfficiency / 100);
    
    setResult({ hydraulicPower, shaftPower });
  };

  return (
    <div className="space-y-8">
      <Form {...form}>
        <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-6">
            <CardDescription>Use consistent metric units (m³/s, m, kg/m³) for accurate results in kilowatts (kW).</CardDescription>
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <FormField control={form.control} name="flowRate" render={({ field }) => (
                <FormItem><FormLabel>Flow Rate (Q)</FormLabel><FormControl><Input type="number" {...field} onChange={e => field.onChange(parseFloat(e.target.value))} /></FormControl><FormMessage /></FormItem>
            )} />
            <FormField control={form.control} name="head" render={({ field }) => (
                <FormItem><FormLabel>Head (H)</FormLabel><FormControl><Input type="number" {...field} onChange={e => field.onChange(parseFloat(e.target.value))} /></FormControl><FormMessage /></FormItem>
            )} />
            <FormField control={form.control} name="fluidDensity" render={({ field }) => (
                <FormItem><FormLabel>Fluid Density (ρ)</FormLabel><FormControl><Input type="number" {...field} onChange={e => field.onChange(parseFloat(e.target.value))} /></FormControl><FormMessage /></FormItem>
            )} />
            <FormField control={form.control} name="pumpEfficiency" render={({ field }) => (
                <FormItem><FormLabel>Pump Efficiency (%)</FormLabel><FormControl><Input type="number" min="0" max="100" {...field} onChange={e => field.onChange(parseFloat(e.target.value))} /></FormControl><FormMessage /></FormItem>
            )} />
          </div>
          <Button type="submit">Calculate</Button>
        </form>
      </Form>
      {result && (
        <Card className="mt-8">
          <CardHeader><div className='flex items-center gap-4'><Droplets className="h-8 w-8 text-primary" /><CardTitle>Pump Power Requirements</CardTitle></div></CardHeader>
          <CardContent>
            <ul className="list-disc pl-5 text-lg space-y-2">
                <li><strong>Hydraulic Power (Water Horsepower):</strong> {result.hydraulicPower.toFixed(2)} kW</li>
                <li><strong>Shaft Power (Brake Horsepower):</strong> {result.shaftPower.toFixed(2)} kW</li>
            </ul>
            <CardDescription className='mt-4'>Hydraulic power is the theoretical power to move the fluid. Shaft power is the actual power required from the motor, accounting for pump inefficiency.</CardDescription>
          </CardContent>
        </Card>
      )}
    </div>
  );
}

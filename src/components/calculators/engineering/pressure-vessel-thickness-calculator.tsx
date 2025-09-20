'use client';

import { useState } from 'react';
import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import { z } from 'zod';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Form, FormControl, FormField, FormItem, FormLabel, FormMessage } from '@/components/ui/form';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Layers } from 'lucide-react';

const formSchema = z.object({
  pressure: z.number().positive(),
  radius: z.number().positive(),
  allowableStress: z.number().positive(),
  jointEfficiency: z.number().min(0).max(1),
  vesselType: z.enum(['cylindrical', 'spherical']),
});

type FormValues = z.infer<typeof formSchema>;

export default function PressureVesselThicknessCalculator() {
  const [result, setResult] = useState<number | null>(null);

  const form = useForm<FormValues>({
    resolver: zodResolver(formSchema),
    defaultValues: {
      pressure: undefined,
      radius: undefined,
      allowableStress: 20000,
      jointEfficiency: 0.85,
      vesselType: 'cylindrical',
    },
  });

  const onSubmit = (values: FormValues) => {
    const { pressure, radius, allowableStress, jointEfficiency, vesselType } = values;
    let thickness;

    if (vesselType === 'cylindrical') {
      thickness = (pressure * radius) / ((allowableStress * jointEfficiency) - 0.6 * pressure);
    } else { // spherical
      thickness = (pressure * radius) / ((2 * allowableStress * jointEfficiency) - 0.2 * pressure);
    }
    
    setResult(thickness);
  };

  return (
    <div className="space-y-8">
      <Form {...form}>
        <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-6">
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <FormField control={form.control} name="vesselType" render={({ field }) => (
                <FormItem><FormLabel>Vessel Type</FormLabel><Select onValuechange={field.onChange} defaultValue={field.value}><FormControl><SelectTrigger><SelectValue /></SelectTrigger></FormControl><SelectContent>
                    <SelectItem value="cylindrical">Cylindrical</SelectItem>
                    <SelectItem value="spherical">Spherical</SelectItem>
                </SelectContent></Select></FormItem>
            )} />
            <FormField control={form.control} name="jointEfficiency" render={({ field }) => (
                <FormItem><FormLabel>Joint Efficiency (E)</FormLabel><FormControl><Input type="number" step="0.01" min="0" max="1" {...field} onChange={e => field.onChange(parseFloat(e.target.value))} /></FormControl><FormMessage /></FormItem>
            )} />
             <FormField control={form.control} name="pressure" render={({ field }) => (
                <FormItem><FormLabel>Internal Pressure (P)</FormLabel><FormControl><Input type="number" {...field} onChange={e => field.onChange(parseFloat(e.target.value))} /></FormControl><FormMessage /></FormItem>
            )} />
            <FormField control={form.control} name="radius" render={({ field }) => (
                <FormItem><FormLabel>Inner Radius (R)</FormLabel><FormControl><Input type="number" {...field} onChange={e => field.onChange(parseFloat(e.target.value))} /></FormControl><FormMessage /></FormItem>
            )} />
            <FormField control={form.control} name="allowableStress" render={({ field }) => (
                <FormItem className="md:col-span-2"><FormLabel>Allowable Stress (S)</FormLabel><FormControl><Input type="number" {...field} onChange={e => field.onChange(parseFloat(e.target.value))} /></FormControl><FormMessage /></FormItem>
            )} />
          </div>
          <Button type="submit">Calculate</Button>
        </form>
      </Form>
      {result !== null && (
        <Card className="mt-8">
          <CardHeader><div className='flex items-center gap-4'><Layers className="h-8 w-8 text-primary" /><CardTitle>Minimum Required Thickness</CardTitle></div></CardHeader>
          <CardContent>
            <p className="text-xl">The minimum required wall thickness is <strong>{result.toFixed(4)}</strong>.</p>
            <CardDescription className='mt-4'>This is a simplified calculation based on ASME code for thin-walled vessels. All units must be consistent (e.g., PSI and inches).</CardDescription>
          </CardContent>
        </Card>
      )}
    </div>
  );
}

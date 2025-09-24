
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
import { Calculator } from 'lucide-react';
import { Accordion, AccordionContent, AccordionItem, AccordionTrigger } from '@/components/ui/accordion';

const formSchema = z.object({
  length: z.number().positive(),
  width: z.number().positive(),
  thickness: z.number().positive(),
  unit: z.enum(['feet', 'meters']),
});

type FormValues = z.infer<typeof formSchema>;

export default function ConcreteVolumeCalculator() {
  const [result, setResult] = useState<{ volume: number; bags: number } | null>(null);

  const form = useForm<FormValues>({
    resolver: zodResolver(formSchema),
    defaultValues: {
      unit: 'feet',
      length: undefined,
      width: undefined,
      thickness: undefined,
    },
  });

  const onSubmit = (values: FormValues) => {
    const { length, width, thickness, unit } = values;
    let volume;
    if (unit === 'feet') {
      volume = (length * width * (thickness / 12)) / 27; // cubic yards
    } else {
      volume = length * width * (thickness / 100); // cubic meters
    }
    
    const bagVolume = unit === 'feet' ? 0.0148 : 0.0113; // cubic yards/meter per 60lb bag
    const bagsNeeded = Math.ceil(volume / bagVolume);

    setResult({ volume: volume, bags: bagsNeeded });
  };

  const unit = form.watch('unit');

  return (
    <div className="space-y-8">
      <Form {...form}>
        <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-6">
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <FormField control={form.control} name="unit" render={({ field }) => (
                <FormItem className="md:col-span-2"><FormLabel>Units</FormLabel><Select onValueChange={field.onChange} defaultValue={field.value}><FormControl><SelectTrigger><SelectValue /></SelectTrigger></FormControl><SelectContent><SelectItem value="feet">Feet / Inches</SelectItem><SelectItem value="meters">Meters / CM</SelectItem></SelectContent></Select></FormItem>
            )} />
            <FormField control={form.control} name="length" render={({ field }) => (
                <FormItem><FormLabel>Length ({unit})</FormLabel><FormControl><Input type="number" {...field} value={field.value ?? ''} onChange={e => field.onChange(parseFloat(e.target.value) || undefined)} /></FormControl><FormMessage /></FormItem>
            )} />
            <FormField control={form.control} name="width" render={({ field }) => (
                <FormItem><FormLabel>Width ({unit})</FormLabel><FormControl><Input type="number" {...field} value={field.value ?? ''} onChange={e => field.onChange(parseFloat(e.target.value) || undefined)} /></FormControl><FormMessage /></FormItem>
            )} />
            <FormField control={form.control} name="thickness" render={({ field }) => (
                <FormItem><FormLabel>Thickness ({unit === 'feet' ? 'in' : 'cm'})</FormLabel><FormControl><Input type="number" {...field} value={field.value ?? ''} onChange={e => field.onChange(parseFloat(e.target.value) || undefined)} /></FormControl><FormMessage /></FormItem>
            )} />
          </div>
          <Button type="submit">Calculate</Button>
        </form>
      </Form>
      {result && (
        <Card className="mt-8">
          <CardHeader><div className='flex items-center gap-4'><Calculator className="h-8 w-8 text-primary" /><CardTitle>Result</CardTitle></div></CardHeader>
          <CardContent>
            <p className="text-lg">Volume needed: <strong>{result.volume.toFixed(2)} cubic {unit === 'feet' ? 'yards' : 'meters'}</strong>.</p>
            <p className="text-lg mt-2">You will need approximately <strong>{result.bags} bags (60lb)</strong> of concrete mix.</p>
            <CardDescription className='mt-4'>Ordering by volume is for ready-mix trucks. For small jobs, use the bag count. Add 5-10% extra.</CardDescription>
          </CardContent>
        </Card>
      )}
      <Accordion type="single" collapsible className="w-full">
         <AccordionItem value="understanding-inputs">
            <AccordionTrigger>Understanding the Inputs</AccordionTrigger>
            <AccordionContent className="text-muted-foreground space-y-4">
              <div>
                  <h4 className="font-semibold text-foreground mb-1">Dimensions (Length, Width, Thickness)</h4>
                  <p>Enter the three dimensions of the slab or footing you are pouring. Ensure your units are consistent: if you select 'Feet/Inches', the length and width should be in feet, and the thickness in inches. If you select 'Meters/CM', length and width should be in meters, and thickness in centimeters.</p>
              </div>
            </AccordionContent>
        </AccordionItem>
        <AccordionItem value="how-it-works">
            <AccordionTrigger>How It Works</AccordionTrigger>
            <AccordionContent className="text-muted-foreground space-y-2">
                <p>Calculates the total volume by multiplying Length x Width x Thickness. It converts thickness from inches/cm to feet/meters to maintain consistent units, then provides the final volume in standard cubic yards or cubic meters.</p>
            </AccordionContent>
        </AccordionItem>
      </Accordion>
    </div>
  );
}

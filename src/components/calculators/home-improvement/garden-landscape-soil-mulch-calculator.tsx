
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
import { Sprout } from 'lucide-react';
import { Accordion, AccordionContent, AccordionItem, AccordionTrigger } from '@/components/ui/accordion';

const formSchema = z.object({
  length: z.number().positive(),
  width: z.number().positive(),
  depth: z.number().positive(),
  unit: z.enum(['feet', 'meters']),
});

type FormValues = z.infer<typeof formSchema>;

export default function GardenLandscapeSoilMulchCalculator() {
  const [result, setResult] = useState<{ volume: number; bags: number; unit: string } | null>(null);

  const form = useForm<FormValues>({
    resolver: zodResolver(formSchema),
    defaultValues: {
      unit: 'feet',
      length: undefined,
      width: undefined,
      depth: undefined,
    },
  });

  const onSubmit = (values: FormValues) => {
    const { length, width, depth, unit } = values;
    let volume, bags, volumeUnit;

    if (unit === 'feet') {
      volume = length * width * (depth / 12); // cubic feet
      // standard bag is 2 cubic feet
      bags = Math.ceil(volume / 2);
      volumeUnit = 'cubic feet';
    } else {
      volume = length * width * (depth / 100); // cubic meters
      // standard bag is 50 liters (0.05 cubic meters)
      bags = Math.ceil(volume / 0.05);
      volumeUnit = 'cubic meters';
    }
    
    setResult({ volume, bags, unit: volumeUnit });
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
                <FormItem><FormLabel>Bed Length ({unit})</FormLabel><FormControl><Input type="number" {...field} value={field.value ?? ''} onChange={e => field.onChange(parseFloat(e.target.value) || undefined)} /></FormControl><FormMessage /></FormItem>
            )} />
            <FormField control={form.control} name="width" render={({ field }) => (
                <FormItem><FormLabel>Bed Width ({unit})</FormLabel><FormControl><Input type="number" {...field} value={field.value ?? ''} onChange={e => field.onChange(parseFloat(e.target.value) || undefined)} /></FormControl><FormMessage /></FormItem>
            )} />
            <FormField control={form.control} name="depth" render={({ field }) => (
                <FormItem><FormLabel>Desired Depth ({unit === 'feet' ? 'in' : 'cm'})</FormLabel><FormControl><Input type="number" {...field} value={field.value ?? ''} onChange={e => field.onChange(parseFloat(e.target.value) || undefined)} /></FormControl><FormMessage /></FormItem>
            )} />
          </div>
          <Button type="submit">Calculate</Button>
        </form>
      </Form>
      {result && (
        <Card className="mt-8">
            <CardHeader><div className='flex items-center gap-4'><Sprout className="h-8 w-8 text-primary" /><CardTitle>Material Needed</CardTitle></div></CardHeader>
            <CardContent>
                 <p className="text-lg">Total volume needed: <strong>{result.volume.toFixed(2)} {result.unit}</strong>.</p>
                <p className="text-lg mt-2">You will need approximately <strong>{result.bags} bags</strong>.</p>
                <CardDescription className='mt-4'>Bag count is based on a common size (2 cu ft or 50L). Check the volume of your specific bags.</CardDescription>
            </CardContent>
        </Card>
      )}
      <Accordion type="single" collapsible className="w-full">
         <AccordionItem value="understanding-inputs">
            <AccordionTrigger>Understanding the Inputs</AccordionTrigger>
            <AccordionContent className="text-muted-foreground space-y-4">
              <div>
                  <h4 className="font-semibold text-foreground mb-1">Bed Dimensions (Length, Width)</h4>
                  <p>The length and width of your garden bed or landscape area.</p>
              </div>
              <div>
                  <h4 className="font-semibold text-foreground mb-1">Desired Depth</h4>
                  <p>The thickness of the layer of soil or mulch you want to add. For mulch, 2-3 inches is common. For a new garden bed, 6-12 inches might be needed.</p>
              </div>
            </AccordionContent>
        </AccordionItem>
        <AccordionItem value="how-it-works">
            <AccordionTrigger>How It Works</AccordionTrigger>
            <AccordionContent className="text-muted-foreground">
                <p>The calculator computes the total volume of material needed by multiplying the length, width, and depth of your area. It then estimates the number of bags required based on standard bag sizes (2 cubic feet or 50 liters).</p>
            </AccordionContent>
        </AccordionItem>
      </Accordion>
    </div>
  );
}

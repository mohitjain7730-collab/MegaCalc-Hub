
'use client';

import { useState } from 'react';
import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import { z } from 'zod';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Form, FormControl, FormField, FormItem, FormLabel, FormMessage } from '@/components/ui/form';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Cube, Clock } from 'lucide-react';
import { Accordion, AccordionContent, AccordionItem, AccordionTrigger } from '@/components/ui/accordion';

const formSchema = z.object({
  filamentLength: z.number().positive(),
  printSpeed: z.number().positive(),
  filamentDiameter: z.number().positive().default(1.75),
  filamentDensity: z.number().positive().default(1.24), // PLA density
});

type FormValues = z.infer<typeof formSchema>;

function formatDuration(hours: number) {
    if (hours < 1) {
        return `${Math.round(hours * 60)} minutes`;
    }
    const h = Math.floor(hours);
    const m = Math.round((hours - h) * 60);
    return `${h} hour${h > 1 ? 's' : ''} and ${m} minute${m > 1 ? 's' : ''}`;
}

export default function ThreeDPrintTimeMaterialCalculator() {
  const [result, setResult] = useState<{ time: string; weight: number } | null>(null);

  const form = useForm<FormValues>({
    resolver: zodResolver(formSchema),
    defaultValues: {
        filamentLength: undefined,
        printSpeed: undefined,
        filamentDiameter: 1.75,
        filamentDensity: 1.24,
    },
  });

  const onSubmit = (values: FormValues) => {
    const { filamentLength, printSpeed, filamentDiameter, filamentDensity } = values;
    
    // Time in hours
    const timeHours = (filamentLength / 1000) / (printSpeed * 60 * 60 / 1000);

    // Volume in cm^3
    const radius = filamentDiameter / 2 / 10; // mm to cm
    const volume = Math.PI * Math.pow(radius, 2) * (filamentLength * 100); // meters to cm

    // Weight in grams
    const weight = volume * filamentDensity;
    
    setResult({ time: formatDuration(timeHours), weight });
  };

  return (
    <div className="space-y-8">
      <Form {...form}>
        <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-6">
          <CardDescription>Enter details from your slicer software to estimate print time and material usage.</CardDescription>
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <FormField control={form.control} name="filamentLength" render={({ field }) => (
                <FormItem><FormLabel>Filament Length (meters)</FormLabel><FormControl><Input type="number" {...field} value={field.value ?? ''} onChange={e => field.onChange(parseFloat(e.target.value) || undefined)} /></FormControl><FormMessage /></FormItem>
            )} />
            <FormField control={form.control} name="printSpeed" render={({ field }) => (
                <FormItem><FormLabel>Average Print Speed (mm/s)</FormLabel><FormControl><Input type="number" {...field} value={field.value ?? ''} onChange={e => field.onChange(parseFloat(e.target.value) || undefined)} /></FormControl><FormMessage /></FormItem>
            )} />
            <FormField control={form.control} name="filamentDiameter" render={({ field }) => (
                <FormItem><FormLabel>Filament Diameter (mm)</FormLabel><FormControl><Input type="number" {...field} value={field.value ?? ''} onChange={e => field.onChange(parseFloat(e.target.value) || undefined)} /></FormControl><FormMessage /></FormItem>
            )} />
             <FormField control={form.control} name="filamentDensity" render={({ field }) => (
                <FormItem><FormLabel>Filament Density (g/cm³)</FormLabel><FormControl><Input type="number" {...field} value={field.value ?? ''} onChange={e => field.onChange(parseFloat(e.target.value) || undefined)} /></FormControl><FormMessage /></FormItem>
            )} />
          </div>
          <Button type="submit">Estimate</Button>
        </form>
      </Form>
      
      {result !== null && (
        <Card className="mt-8">
            <CardHeader><div className='flex items-center gap-4'><Cube className="h-8 w-8 text-primary" /><CardTitle>Print Estimate</CardTitle></div></CardHeader>
            <CardContent>
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4 text-center">
                    <div>
                        <p className="text-muted-foreground">Estimated Print Time</p>
                        <p className="text-2xl font-bold">{result.time}</p>
                    </div>
                    <div>
                        <p className="text-muted-foreground">Estimated Material Weight</p>
                        <p className="text-2xl font-bold">{result.weight.toFixed(2)} g</p>
                    </div>
                </div>
            </CardContent>
        </Card>
      )}

      <Accordion type="single" collapsible className="w-full">
        <AccordionItem value="how-it-works">
            <AccordionTrigger>How It Works</AccordionTrigger>
            <AccordionContent className="text-muted-foreground">
                This is a simplified estimation. Print time is estimated by dividing the total filament length by the average print speed. Material weight is calculated from the volume of the filament (as a cylinder) multiplied by its density. Real print times will be longer due to acceleration/deceleration, travel moves, and layer changes.
            </AccordionContent>
        </AccordionItem>
      </Accordion>
    </div>
  );
}

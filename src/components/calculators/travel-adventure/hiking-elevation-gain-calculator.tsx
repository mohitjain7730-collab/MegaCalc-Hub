
'use client';

import { useState } from 'react';
import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import { z } from 'zod';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Form, FormControl, FormField, FormItem, FormLabel, FormMessage } from '@/components/ui/form';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Mountain } from 'lucide-react';
import { Accordion, AccordionContent, AccordionItem, AccordionTrigger } from '@/components/ui/accordion';

const formSchema = z.object({
  distance: z.number().positive(),
  startElevation: z.number().nonnegative(),
  endElevation: z.number().nonnegative(),
  unit: z.enum(['feet', 'meters']),
});

type FormValues = z.infer<typeof formSchema>;

export default function HikingElevationGainCalculator() {
  const [result, setResult] = useState<{ grade: number; gain: number } | null>(null);

  const form = useForm<FormValues>({
    resolver: zodResolver(formSchema),
    defaultValues: {
      distance: undefined,
      startElevation: undefined,
      endElevation: undefined,
      unit: 'feet',
    },
  });

  const onSubmit = (values: FormValues) => {
    const elevationGain = values.endElevation - values.startElevation;
    const grade = (elevationGain / values.distance) * 100;
    setResult({ grade, gain: elevationGain });
  };
  
  const unit = form.watch('unit');

  return (
    <div className="space-y-8">
      <Form {...form}>
        <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-6">
          <CardDescription>Ensure all inputs use the same unit of measurement (feet or meters).</CardDescription>
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <FormField control={form.control} name="unit" render={({ field }) => (
                <FormItem className="md:col-span-2"><FormLabel>Unit</FormLabel>
                <select {...field} className="w-full h-10 rounded-md border border-input bg-background px-3 py-2 text-sm"><option value="feet">Feet</option><option value="meters">Meters</option></select>
                <FormMessage /></FormItem>
            )} />
            <FormField control={form.control} name="distance" render={({ field }) => (
                <FormItem><FormLabel>Hike Distance ({unit})</FormLabel><FormControl><Input type="number" placeholder="e.g., 5280" {...field} value={field.value ?? ''} onChange={e => field.onChange(parseFloat(e.target.value) || undefined)} /></FormControl><FormMessage /></FormItem>
            )} />
             <FormField control={form.control} name="startElevation" render={({ field }) => (
                <FormItem><FormLabel>Starting Elevation ({unit})</FormLabel><FormControl><Input type="number" placeholder="e.g., 1000" {...field} value={field.value ?? ''} onChange={e => field.onChange(parseFloat(e.target.value) || undefined)} /></FormControl><FormMessage /></FormItem>
            )} />
             <FormField control={form.control} name="endElevation" render={({ field }) => (
                <FormItem><FormLabel>Ending Elevation ({unit})</FormLabel><FormControl><Input type="number" placeholder="e.g., 2500" {...field} value={field.value ?? ''} onChange={e => field.onChange(parseFloat(e.target.value) || undefined)} /></FormControl><FormMessage /></FormItem>
            )} />
          </div>
          <Button type="submit">Calculate Grade</Button>
        </form>
      </Form>
      
      {result !== null && (
        <Card className="mt-8">
            <CardHeader><div className='flex items-center gap-4'><Mountain className="h-8 w-8 text-primary" /><CardTitle>Hike Difficulty Analysis</CardTitle></div></CardHeader>
            <CardContent className="text-center space-y-4">
                <div>
                    <CardDescription>Total Elevation Gain</CardDescription>
                    <p className="text-2xl font-bold">{result.gain.toLocaleString()} {unit}</p>
                </div>
                 <div className="pt-4 border-t">
                    <CardDescription>Average Grade</CardDescription>
                    <p className="text-2xl font-bold">{result.grade.toFixed(1)}%</p>
                </div>
            </CardContent>
        </Card>
      )}

      <Accordion type="single" collapsible className="w-full">
         <AccordionItem value="understanding-inputs">
            <AccordionTrigger>Understanding the Inputs</AccordionTrigger>
            <AccordionContent className="text-muted-foreground space-y-4">
              <div>
                  <h4 className="font-semibold text-foreground mb-1">Hike Distance</h4>
                  <p>The total horizontal distance of the hike, from start to finish. Use the same unit (feet or meters) as your elevation.</p>
              </div>
              <div>
                  <h4 className="font-semibold text-foreground mb-1">Starting & Ending Elevation</h4>
                  <p>The altitude at the start and end points of your hike. For a loop or out-and-back trail where you end at the same elevation you started, the net elevation gain will be zero, but this calculator focuses on the grade of a single segment.</p>
              </div>
            </AccordionContent>
        </AccordionItem>
        <AccordionItem value="how-it-works">
            <AccordionTrigger>How It Works</AccordionTrigger>
            <AccordionContent className="text-muted-foreground">
                <p>This calculator provides two key metrics for understanding the steepness of a trail segment.</p>
                 <ul className="list-disc list-inside space-y-2 mt-2">
                    <li><strong>Total Elevation Gain:</strong> This is a simple subtraction of the starting elevation from the ending elevation. It tells you the total vertical distance you will climb.</li>
                    <li><strong>Average Grade:</strong> This measures the steepness of the trail. It's calculated using the formula `(Rise / Run) * 100`, where 'Rise' is the elevation gain and 'Run' is the horizontal distance. A 10% grade means you climb 10 feet for every 100 feet you walk horizontally.</li>
                </ul>
            </AccordionContent>
        </AccordionItem>
      </Accordion>
    </div>
  );
}

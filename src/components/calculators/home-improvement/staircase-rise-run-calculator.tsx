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
  totalRise: z.number().positive(),
  unit: z.enum(['inches', 'cm']),
});

type FormValues = z.infer<typeof formSchema>;

export default function StaircaseRiseRunCalculator() {
  const [result, setResult] = useState<{ steps: number; riserHeight: number; treadDepth: number; totalRun: number; } | null>(null);

  const form = useForm<FormValues>({
    resolver: zodResolver(formSchema),
    defaultValues: {
      unit: 'inches',
      totalRise: undefined,
    },
  });

  const onSubmit = (values: FormValues) => {
    const { totalRise, unit } = values;
    const isImperial = unit === 'inches';
    const idealRiser = isImperial ? 7.5 : 19; // Ideal riser height in inches or cm

    const numberOfRisers = Math.round(totalRise / idealRiser);
    const actualRiserHeight = totalRise / numberOfRisers;
    
    // Rule: 2 x Riser Height + Tread Depth = 24 to 25 inches (or 61-63.5 cm)
    const idealTreadDepth = (isImperial ? 24.5 : 62) - (2 * actualRiserHeight);
    
    const totalRun = idealTreadDepth * (numberOfRisers - 1);

    setResult({ steps: numberOfRisers, riserHeight: actualRiserHeight, treadDepth: idealTreadDepth, totalRun });
  };

  const unit = form.watch('unit');

  return (
    <div className="space-y-8">
      <Form {...form}>
        <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-6">
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
             <FormField control={form.control} name="unit" render={({ field }) => (
                <FormItem><FormLabel>Units</FormLabel><Select onValueChange={field.onChange} defaultValue={field.value}><FormControl><SelectTrigger><SelectValue /></SelectTrigger></FormControl><SelectContent><SelectItem value="inches">Inches</SelectItem><SelectItem value="cm">Centimeters</SelectItem></SelectContent></Select></FormItem>
            )} />
            <FormField control={form.control} name="totalRise" render={({ field }) => (
                <FormItem><FormLabel>Total Rise (floor to floor)</FormLabel><FormControl><Input type="number" {...field} onChange={e => field.onChange(parseFloat(e.target.value))} /></FormControl><FormMessage /></FormItem>
            )} />
          </div>
          <Button type="submit">Calculate</Button>
        </form>
      </Form>
      {result && (
        <Card className="mt-8">
            <CardHeader><div className='flex items-center gap-4'><Calculator className="h-8 w-8 text-primary" /><CardTitle>Staircase Dimensions</CardTitle></div></CardHeader>
            <CardContent>
                <ul className="list-disc pl-5 text-lg space-y-2">
                    <li><strong>Number of Steps (Risers):</strong> {result.steps}</li>
                    <li><strong>Riser Height:</strong> {result.riserHeight.toFixed(2)} {unit}</li>
                    <li><strong>Tread Depth:</strong> {result.treadDepth.toFixed(2)} {unit}</li>
                    <li><strong>Total Run (horizontal distance):</strong> {result.totalRun.toFixed(2)} {unit}</li>
                </ul>
                <CardDescription className='mt-4'>Check local building codes. These are standard calculations but codes can vary.</CardDescription>
            </CardContent>
        </Card>
      )}
    </div>
  );
}

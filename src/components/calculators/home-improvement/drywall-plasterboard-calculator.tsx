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
  roomLength: z.number().positive(),
  roomWidth: z.number().positive(),
  roomHeight: z.number().positive(),
  sheetSize: z.enum(['4x8', '4x12']),
  includeCeiling: z.boolean().default(true),
  unit: z.enum(['feet', 'meters']),
});

type FormValues = z.infer<typeof formSchema>;

export default function DrywallPlasterboardCalculator() {
  const [result, setResult] = useState<{ sheets: number; compound: number } | null>(null);

  const form = useForm<FormValues>({
    resolver: zodResolver(formSchema),
    defaultValues: {
      unit: 'feet',
      sheetSize: '4x8',
      includeCeiling: true,
    },
  });

  const onSubmit = (values: FormValues) => {
    let { roomLength, roomWidth, roomHeight, sheetSize, includeCeiling, unit } = values;
    
    // Convert to feet if in meters
    if (unit === 'meters') {
        roomLength *= 3.28084;
        roomWidth *= 3.28084;
        roomHeight *= 3.28084;
    }

    const wallArea = (roomLength * roomHeight * 2) + (roomWidth * roomHeight * 2);
    const ceilingArea = includeCeiling ? roomLength * roomWidth : 0;
    const totalArea = wallArea + ceilingArea;

    const sheetArea = sheetSize === '4x8' ? 32 : 48;
    const sheetsNeeded = Math.ceil(totalArea / sheetArea);
    
    // Joint compound: ~1.5 gallons (or 1 bucket) per 3-4 sheets (or per 100 sq ft)
    const compoundNeeded = Math.ceil(totalArea / 100 / 0.7); // 0.7 buckets per 100 sqft approx.

    setResult({ sheets: sheetsNeeded, compound: compoundNeeded });
  };
  
  const unit = form.watch('unit');

  return (
    <div className="space-y-8">
        <Form {...form}>
            <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-6">
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                    <FormField control={form.control} name="unit" render={({ field }) => (
                        <FormItem><FormLabel>Units</FormLabel><Select onValueChange={field.onChange} defaultValue={field.value}><FormControl><SelectTrigger><SelectValue /></SelectTrigger></FormControl><SelectContent><SelectItem value="feet">Feet</SelectItem><SelectItem value="meters">Meters</SelectItem></SelectContent></Select></FormItem>
                    )} />
                    <FormField control={form.control} name="sheetSize" render={({ field }) => (
                        <FormItem><FormLabel>Sheet Size</FormLabel><Select onValueChange={field.onChange} defaultValue={field.value}><FormControl><SelectTrigger><SelectValue /></SelectTrigger></FormControl><SelectContent><SelectItem value="4x8">4ft x 8ft</SelectItem><SelectItem value="4x12">4ft x 12ft</SelectItem></SelectContent></Select></FormItem>
                    )} />
                    <FormField control={form.control} name="roomLength" render={({ field }) => (
                        <FormItem><FormLabel>Room Length ({unit})</FormLabel><FormControl><Input type="number" {...field} onChange={e => field.onChange(parseFloat(e.target.value))} /></FormControl><FormMessage /></FormItem>
                    )} />
                    <FormField control={form.control} name="roomWidth" render={({ field }) => (
                        <FormItem><FormLabel>Room Width ({unit})</FormLabel><FormControl><Input type="number" {...field} onChange={e => field.onChange(parseFloat(e.target.value))} /></FormControl><FormMessage /></FormItem>
                    )} />
                    <FormField control={form.control} name="roomHeight" render={({ field }) => (
                        <FormItem><FormLabel>Room Height ({unit})</FormLabel><FormControl><Input type="number" {...field} onChange={e => field.onChange(parseFloat(e.target.value))} /></FormControl><FormMessage /></FormItem>
                    )} />
                    <FormField control={form.control} name="includeCeiling" render={({ field }) => (
                        <FormItem className="flex flex-row items-center justify-between rounded-lg border p-3 shadow-sm md:col-span-2"><div className="space-y-0.5"><FormLabel>Include Ceiling?</FormLabel></div><FormControl><Input type="checkbox" checked={field.value} onChange={field.onChange} className="h-5 w-5" /></FormControl></FormItem>
                    )} />
                </div>
                <Button type="submit">Calculate</Button>
            </form>
        </Form>
        {result && (
            <Card className="mt-8">
                <CardHeader><div className='flex items-center gap-4'><Calculator className="h-8 w-8 text-primary" /><CardTitle>Result</CardTitle></div></CardHeader>
                <CardContent>
                    <p className="text-lg">You'll need approximately:</p>
                    <ul className="list-disc pl-5 mt-2 text-lg">
                        <li><strong>{result.sheets} sheets</strong> of drywall.</li>
                        <li><strong>{result.compound} buckets</strong> of joint compound.</li>
                    </ul>
                    <CardDescription className='mt-2'>This is an estimate. Add 10-15% for wastage and cuts.</CardDescription>
                </CardContent>
            </Card>
        )}
        <Accordion type="single" collapsible className="w-full">
            <AccordionItem value="how-it-works">
                <AccordionTrigger>How It Works</AccordionTrigger>
                <AccordionContent className="text-muted-foreground space-y-2">
                    <ol className="list-decimal list-inside space-y-1">
                        <li>It calculates the total surface area of the walls.</li>
                        <li>If selected, it adds the ceiling area.</li>
                        <li>The total area is divided by the area of a single drywall sheet (32 or 48 sq. ft.) to get the number of sheets.</li>
                        <li>Joint compound is estimated based on the total square footage.</li>
                    </ol>
                </AccordionContent>
            </AccordionItem>
        </Accordion>
    </div>
  );
}

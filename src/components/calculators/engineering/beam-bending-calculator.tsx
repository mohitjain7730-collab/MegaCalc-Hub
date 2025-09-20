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
  load: z.number().positive(),
  length: z.number().positive(),
  momentOfInertia: z.number().positive(),
  modulusOfElasticity: z.number().positive(),
  distanceFromSupport: z.number().positive(),
  beamType: z.enum(['simply-supported-center', 'cantilever-end']),
});

type FormValues = z.infer<typeof formSchema>;

export default function BeamBendingCalculator() {
  const [result, setResult] = useState<{ maxBendingStress: number; maxDeflection: number } | null>(null);

  const form = useForm<FormValues>({
    resolver: zodResolver(formSchema),
    defaultValues: {
        load: undefined,
        length: undefined,
        momentOfInertia: undefined,
        modulusOfElasticity: 29000, // E for steel in ksi
        distanceFromSupport: undefined,
        beamType: 'simply-supported-center',
    },
  });

  const onSubmit = (values: FormValues) => {
    const { load, length, momentOfInertia, modulusOfElasticity, distanceFromSupport, beamType } = values;

    let maxBendingMoment, maxDeflection;

    if (beamType === 'simply-supported-center') {
      maxBendingMoment = (load * length) / 4;
      maxDeflection = (load * Math.pow(length, 3)) / (48 * modulusOfElasticity * momentOfInertia);
    } else { // cantilever-end
      maxBendingMoment = load * length;
      maxDeflection = (load * Math.pow(length, 3)) / (3 * modulusOfElasticity * momentOfInertia);
    }

    const maxBendingStress = (maxBendingMoment * distanceFromSupport) / momentOfInertia;
    
    setResult({ maxBendingStress, maxDeflection });
  };

  return (
    <div className="space-y-8">
      <Form {...form}>
        <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-6">
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <FormField control={form.control} name="beamType" render={({ field }) => (
                <FormItem className="md:col-span-2"><FormLabel>Beam Type & Load</FormLabel><Select onValueChange={field.onChange} defaultValue={field.value}><FormControl><SelectTrigger><SelectValue /></SelectTrigger></FormControl><SelectContent><SelectItem value="simply-supported-center">Simply Supported (Load at Center)</SelectItem><SelectItem value="cantilever-end">Cantilever (Load at End)</SelectItem></SelectContent></Select></FormItem>
            )} />
            <FormField control={form.control} name="load" render={({ field }) => (
                <FormItem><FormLabel>Load (P)</FormLabel><FormControl><Input type="number" {...field} value={field.value ?? ''} onChange={e => field.onChange(parseFloat(e.target.value))} /></FormControl><FormMessage /></FormItem>
            )} />
            <FormField control={form.control} name="length" render={({ field }) => (
                <FormItem><FormLabel>Beam Length (L)</FormLabel><FormControl><Input type="number" {...field} value={field.value ?? ''} onChange={e => field.onChange(parseFloat(e.target.value))} /></FormControl><FormMessage /></FormItem>
            )} />
            <FormField control={form.control} name="momentOfInertia" render={({ field }) => (
                <FormItem><FormLabel>Moment of Inertia (I)</FormLabel><FormControl><Input type="number" {...field} value={field.value ?? ''} onChange={e => field.onChange(parseFloat(e.target.value))} /></FormControl><FormMessage /></FormItem>
            )} />
            <FormField control={form.control} name="modulusOfElasticity" render={({ field }) => (
                <FormItem><FormLabel>Modulus of Elasticity (E)</FormLabel><FormControl><Input type="number" {...field} value={field.value ?? ''} onChange={e => field.onChange(parseFloat(e.target.value))} /></FormControl><FormMessage /></FormItem>
            )} />
            <FormField control={form.control} name="distanceFromSupport" render={({ field }) => (
                <FormItem className="md:col-span-2"><FormLabel>Distance from neutral axis to outer fiber (c)</FormLabel><FormControl><Input type="number" {...field} value={field.value ?? ''} onChange={e => field.onChange(parseFloat(e.target.value))} /></FormControl><FormMessage /></FormItem>
            )} />
          </div>
          <Button type="submit">Calculate</Button>
        </form>
      </Form>
      {result && (
        <Card className="mt-8">
            <CardHeader><div className='flex items-center gap-4'><Calculator className="h-8 w-8 text-primary" /><CardTitle>Results</CardTitle></div></CardHeader>
            <CardContent>
                <ul className="list-disc pl-5 text-lg space-y-2">
                    <li><strong>Max Bending Stress (σ):</strong> {result.maxBendingStress.toFixed(4)}</li>
                    <li><strong>Max Deflection (δ):</strong> {result.maxDeflection.toFixed(6)}</li>
                </ul>
                <CardDescription className='mt-4'>Units must be consistent (e.g., lbs & inches, or N & meters). The results will be in the corresponding stress (psi, Pa) and length units.</CardDescription>
            </CardContent>
        </Card>
      )}
       <Accordion type="single" collapsible className="w-full">
        <AccordionItem value="how-it-works">
            <AccordionTrigger>How It Works</AccordionTrigger>
            <AccordionContent className="text-muted-foreground space-y-2">
                <ol className="list-decimal list-inside space-y-1">
                    <li>Calculates the maximum bending moment (M) based on beam type.</li>
                    <li>Calculates bending stress (σ) using the formula σ = (M * c) / I.</li>
                    <li>Calculates the maximum deflection (δ) using standard formulas for the selected beam type.</li>
                </ol>
            </AccordionContent>
        </AccordionItem>
      </Accordion>
    </div>
  );
}

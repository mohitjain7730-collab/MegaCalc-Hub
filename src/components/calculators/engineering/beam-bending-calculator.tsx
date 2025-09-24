
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
import { Calculator, HelpCircle } from 'lucide-react';
import { Accordion, AccordionContent, AccordionItem, AccordionTrigger } from '@/components/ui/accordion';
import { Tooltip, TooltipProvider, TooltipContent, TooltipTrigger } from '@/components/ui/tooltip';


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
                <FormItem className="md:col-span-2">
                     <FormLabel className="flex items-center gap-2">
                        Distance from neutral axis (c)
                         <TooltipProvider>
                            <Tooltip>
                                <TooltipTrigger asChild><button type="button" className='p-0 m-0'><HelpCircle className="h-4 w-4 text-muted-foreground" /></button></TooltipTrigger>
                                <TooltipContent><p className="max-w-xs">The distance from the center of the beam's cross-section to its outermost edge.</p></TooltipContent>
                            </Tooltip>
                        </TooltipProvider>
                    </FormLabel>
                    <FormControl><Input type="number" {...field} value={field.value ?? ''} onChange={e => field.onChange(parseFloat(e.target.value))} /></FormControl><FormMessage /></FormItem>
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
         <AccordionItem value="understanding-inputs">
            <AccordionTrigger>Understanding the Inputs</AccordionTrigger>
            <AccordionContent className="text-muted-foreground space-y-4">
                <div>
                    <h4 className="font-semibold text-foreground mb-1">Load (P)</h4>
                    <p>The force applied to the beam. For a center-loaded beam, this is a single point load at the middle. For a cantilever, it's at the unsupported end. Units: Pounds (lbs) or Newtons (N).</p>
                </div>
                <div>
                    <h4 className="font-semibold text-foreground mb-1">Beam Length (L)</h4>
                    <p>The total length of the beam between its supports. For a cantilever beam, this is the length from the fixed support to the end where the load is applied. Units: Inches (in) or Meters (m).</p>
                </div>
                 <div>
                    <h4 className="font-semibold text-foreground mb-1">Modulus of Elasticity (E)</h4>
                    <p>A material property indicating its stiffness. It's a measure of how much a material will deform under stress and then return to its original shape. You can find this value in engineering handbooks or material datasheets.</p>
                     <ul className="list-disc list-inside space-y-1 pl-4 mt-1">
                        <li><strong>Steel:</strong> ~29,000,000 psi (or 29,000 ksi) / 200 GPa</li>
                        <li><strong>Aluminum:</strong> ~10,000,000 psi (or 10,000 ksi) / 69 GPa</li>
                    </ul>
                </div>
                <div>
                    <h4 className="font-semibold text-foreground mb-1">Moment of Inertia (I)</h4>
                    <p>A property of the beam's cross-sectional shape that measures its resistance to bending. A higher value means more resistance. It depends entirely on the geometry of the beam. This can be calculated with a Moment of Inertia calculator or found in tables for standard structural shapes (like I-beams).</p>
                     <ul className="list-disc list-inside space-y-1 pl-4 mt-1">
                        <li><strong>For a rectangular beam:</strong> I = (base * height³) / 12</li>
                        <li><strong>Units:</strong> Inches⁴ (in⁴) or Meters⁴ (m⁴).</li>
                    </ul>
                </div>
                <div>
                    <h4 className="font-semibold text-foreground mb-1">Distance from neutral axis (c)</h4>
                    <p>This is the distance from the geometric center (neutral axis) of the beam's cross-section to its outermost fiber (the top or bottom edge). For a symmetrical shape like a rectangle or circle, this is simply half the total height. Units: Inches (in) or Meters (m).</p>
                </div>
            </AccordionContent>
        </AccordionItem>
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

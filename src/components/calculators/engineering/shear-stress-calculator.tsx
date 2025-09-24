'use client';

import { useState } from 'react';
import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import { z } from 'zod';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Form, FormControl, FormField, FormItem, FormLabel, FormMessage } from '@/components/ui/form';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { RefreshCw } from 'lucide-react';
import { Accordion, AccordionContent, AccordionItem, AccordionTrigger } from '@/components/ui/accordion';

const formSchema = z.object({
  torque: z.number().positive(),
  radius: z.number().positive(),
});

type FormValues = z.infer<typeof formSchema>;

export default function ShearStressCalculator() {
  const [result, setResult] = useState<{ shearStress: number; polarMoment: number } | null>(null);

  const form = useForm<FormValues>({
    resolver: zodResolver(formSchema),
    defaultValues: {
      torque: undefined,
      radius: undefined,
    },
  });

  const onSubmit = (values: FormValues) => {
    const { torque, radius } = values;
    const J = (Math.PI * Math.pow(radius, 4)) / 2;
    const shearStress = (torque * radius) / J;
    setResult({ shearStress, polarMoment: J });
  };

  return (
    <div className="space-y-8">
      <Form {...form}>
        <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-6">
          <CardDescription>Calculates maximum shear stress for a solid circular shaft. Ensure consistent units (N·m, m).</CardDescription>
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <FormField control={form.control} name="torque" render={({ field }) => (
                <FormItem><FormLabel>Applied Torque (T)</FormLabel><FormControl><Input type="number" {...field} value={field.value ?? ''} onChange={e => field.onChange(parseFloat(e.target.value) || undefined)} /></FormControl><FormMessage /></FormItem>
            )} />
            <FormField control={form.control} name="radius" render={({ field }) => (
                <FormItem><FormLabel>Outer Radius (r)</FormLabel><FormControl><Input type="number" {...field} value={field.value ?? ''} onChange={e => field.onChange(parseFloat(e.target.value) || undefined)} /></FormControl><FormMessage /></FormItem>
            )} />
          </div>
          <Button type="submit">Calculate Shear Stress</Button>
        </form>
      </Form>
      {result !== null && (
        <Card className="mt-8">
            <CardHeader><div className='flex items-center gap-4'><RefreshCw className="h-8 w-8 text-primary" /><CardTitle>Shaft Shear Stress</CardTitle></div></CardHeader>
            <CardContent>
                <div className="text-center space-y-2">
                    <p className="text-lg">Maximum Shear Stress (τ_max)</p>
                    <p className="text-3xl font-bold">{result.shearStress.toExponential(4)} Pa</p>
                </div>
                <CardDescription className='mt-4 text-center'>Based on a calculated Polar Moment of Inertia (J) of {result.polarMoment.toExponential(4)} m⁴.</CardDescription>
            </CardContent>
        </Card>
      )}
       <Accordion type="single" collapsible className="w-full">
         <AccordionItem value="understanding-inputs">
            <AccordionTrigger>Understanding the Inputs</AccordionTrigger>
            <AccordionContent className="text-muted-foreground space-y-4">
                <div>
                    <h4 className="font-semibold text-foreground mb-1">Applied Torque (T)</h4>
                    <p>The twisting force applied to the shaft. Units: Newton-meters (N·m).</p>
                </div>
                <div>
                    <h4 className="font-semibold text-foreground mb-1">Outer Radius (r)</h4>
                    <p>The radius of the solid circular shaft from the center to the outer edge. Units: Meters (m).</p>
                </div>
            </AccordionContent>
        </AccordionItem>
        <AccordionItem value="how-it-works">
            <AccordionTrigger>How It Works</AccordionTrigger>
            <AccordionContent className="text-muted-foreground space-y-2">
                <p>This calculator first determines the Polar Moment of Inertia (J) for the solid circular shaft, which is a measure of its ability to resist twisting. Then it uses the classical torsion formula to find the maximum shear stress, which occurs at the outermost surface of the shaft.</p>
                <p className='font-mono p-4 bg-muted rounded-md'>J = (π * r⁴) / 2</p>
                <p className='font-mono p-4 bg-muted rounded-md'>τ_max = (T * r) / J</p>
            </AccordionContent>
        </AccordionItem>
      </Accordion>
    </div>
  );
}

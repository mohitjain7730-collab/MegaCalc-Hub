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

const formSchema = z.object({
  cohesion: z.number().positive(),
  frictionAngle: z.number().min(0).max(90),
  slopeAngle: z.number().min(0).max(90),
  unitWeight: z.number().positive(),
  height: z.number().positive(),
});

type FormValues = z.infer<typeof formSchema>;

export default function SlopeStabilityCalculator() {
  const [result, setResult] = useState<number | null>(null);

  const form = useForm<FormValues>({
    resolver: zodResolver(formSchema),
    defaultValues: {
      cohesion: undefined,
      frictionAngle: undefined,
      slopeAngle: undefined,
      unitWeight: undefined,
      height: undefined,
    },
  });

  const onSubmit = (values: FormValues) => {
    const { cohesion, frictionAngle, slopeAngle, unitWeight, height } = values;
    
    const phi_rad = frictionAngle * (Math.PI / 180);
    const beta_rad = slopeAngle * (Math.PI / 180);

    // Using a simplified Ordinary Method of Slices / Fellenius Method
    // This is a major simplification. Real analysis is much more complex.
    const resistingForce = cohesion * height / Math.sin(beta_rad) + (unitWeight * Math.pow(height, 2) / 2) * Math.tan(phi_rad) * (1/Math.tan(beta_rad) - Math.tan(beta_rad));
    const drivingForce = (unitWeight * Math.pow(height, 2) / 2) * (1 / Math.sin(beta_rad));
    
    // A more direct, but still simplified formula for Factor of Safety (FS) for an infinite slope
    const factorOfSafety = (cohesion / (unitWeight * height * Math.cos(beta_rad) * Math.sin(beta_rad))) + (Math.tan(phi_rad) / Math.tan(beta_rad));

    setResult(factorOfSafety);
  };

  return (
    <div className="space-y-8">
      <Card>
          <CardHeader>
              <CardTitle>Simplified Slope Stability</CardTitle>
              <CardDescription>This calculator uses the 'infinite slope' method for a basic analysis. It is not suitable for complex or critical designs.</CardDescription>
          </CardHeader>
          <CardContent>
            <Form {...form}>
                <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-6">
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                    <FormField control={form.control} name="cohesion" render={({ field }) => (
                        <FormItem><FormLabel>Soil Cohesion (c)</FormLabel><FormControl><Input type="number" {...field} onChange={e => field.onChange(parseFloat(e.target.value))} /></FormControl><FormMessage /></FormItem>
                    )} />
                    <FormField control={form.control} name="frictionAngle" render={({ field }) => (
                        <FormItem><FormLabel>Friction Angle (φ) in degrees</FormLabel><FormControl><Input type="number" {...field} onChange={e => field.onChange(parseFloat(e.target.value))} /></FormControl><FormMessage /></FormItem>
                    )} />
                    <FormField control={form.control} name="slopeAngle" render={({ field }) => (
                        <FormItem><FormLabel>Slope Angle (β) in degrees</FormLabel><FormControl><Input type="number" {...field} onChange={e => field.onChange(parseFloat(e.target.value))} /></FormControl><FormMessage /></FormItem>
                    )} />
                    <FormField control={form.control} name="unitWeight" render={({ field }) => (
                        <FormItem><FormLabel>Soil Unit Weight (γ)</FormLabel><FormControl><Input type="number" {...field} onChange={e => field.onChange(parseFloat(e.target.value))} /></FormControl><FormMessage /></FormItem>
                    )} />
                     <FormField control={form.control} name="height" render={({ field }) => (
                        <FormItem className="md:col-span-2"><FormLabel>Slope Height (H)</FormLabel><FormControl><Input type="number" {...field} onChange={e => field.onChange(parseFloat(e.target.value))} /></FormControl><FormMessage /></FormItem>
                    )} />
                </div>
                <Button type="submit">Calculate</Button>
                </form>
            </Form>
          </CardContent>
      </Card>
      {result !== null && (
        <Card className="mt-8">
          <CardHeader><div className='flex items-center gap-4'><Mountain className="h-8 w-8 text-primary" /><CardTitle>Factor of Safety (FS)</CardTitle></div></CardHeader>
          <CardContent>
            <p className="text-xl">The Factor of Safety is approximately <strong>{result.toFixed(3)}</strong>.</p>
            <CardDescription className='mt-4'>A value greater than 1.5 is typically considered stable for permanent slopes. Ensure all units are consistent (e.g., psf for cohesion and unit weight, feet for height).</CardDescription>
          </CardContent>
        </Card>
      )}
    </div>
  );
}

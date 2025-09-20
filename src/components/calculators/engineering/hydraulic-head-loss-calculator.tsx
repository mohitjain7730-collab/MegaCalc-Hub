'use client';

import { useState } from 'react';
import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import { z } from 'zod';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Form, FormControl, FormField, FormItem, FormLabel, FormMessage } from '@/components/ui/form';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Calculator } from 'lucide-react';

const formSchema = z.object({
  frictionFactor: z.number().positive(),
  pipeLength: z.number().positive(),
  pipeDiameter: z.number().positive(),
  fluidVelocity: z.number().positive(),
});

type FormValues = z.infer<typeof formSchema>;

const GRAVITY = 9.81; // m/s^2
const GRAVITY_FT = 32.2; // ft/s^2

export default function HydraulicHeadLossCalculator() {
  const [result, setResult] = useState<number | null>(null);

  const form = useForm<FormValues>({
    resolver: zodResolver(formSchema),
    defaultValues: {
      frictionFactor: 0.02,
      pipeLength: undefined,
      pipeDiameter: undefined,
      fluidVelocity: undefined,
    },
  });

  const onSubmit = (values: FormValues) => {
    const { frictionFactor, pipeLength, pipeDiameter, fluidVelocity } = values;
    
    // Using Darcy-Weisbach equation. Assumes user provides consistent units.
    const headLoss = frictionFactor * (pipeLength / pipeDiameter) * (Math.pow(fluidVelocity, 2) / (2 * GRAVITY));
    // The gravity constant here depends on the unit system, for simplicity we use metric. The user must be consistent.
    setResult(headLoss);
  };

  return (
    <div className="space-y-8">
      <Form {...form}>
        <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-6">
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <FormField control={form.control} name="frictionFactor" render={({ field }) => (
                <FormItem><FormLabel>Friction Factor (f)</FormLabel><FormControl><Input type="number" step="0.001" {...field} onChange={e => field.onChange(parseFloat(e.target.value))} /></FormControl><FormMessage /></FormItem>
            )} />
            <FormField control={form.control} name="pipeLength" render={({ field }) => (
                <FormItem><FormLabel>Pipe Length (L)</FormLabel><FormControl><Input type="number" {...field} onChange={e => field.onChange(parseFloat(e.target.value))} /></FormControl><FormMessage /></FormItem>
            )} />
            <FormField control={form.control} name="pipeDiameter" render={({ field }) => (
                <FormItem><FormLabel>Pipe Diameter (D)</FormLabel><FormControl><Input type="number" {...field} onChange={e => field.onChange(parseFloat(e.target.value))} /></FormControl><FormMessage /></FormItem>
            )} />
            <FormField control={form.control} name="fluidVelocity" render={({ field }) => (
                <FormItem><FormLabel>Fluid Velocity (v)</FormLabel><FormControl><Input type="number" {...field} onChange={e => field.onChange(parseFloat(e.target.value))} /></FormControl><FormMessage /></FormItem>
            )} />
          </div>
          <Button type="submit">Calculate</Button>
        </form>
      </Form>
      {result !== null && (
        <Card className="mt-8">
          <CardHeader><div className='flex items-center gap-4'><Calculator className="h-8 w-8 text-primary" /><CardTitle>Head Loss</CardTitle></div></CardHeader>
          <CardContent>
            <p className="text-xl">The calculated head loss is <strong>{result.toFixed(4)}</strong>.</p>
            <CardDescription className='mt-4'>This is calculated using the Darcy-Weisbach equation. Ensure you are using consistent units (e.g., all metric or all imperial) as the gravitational constant is assumed based on your inputs.</CardDescription>
          </CardContent>
        </Card>
      )}
    </div>
  );
}

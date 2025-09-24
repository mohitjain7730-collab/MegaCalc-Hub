'use client';

import { useState } from 'react';
import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import { z } from 'zod';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Form, FormControl, FormField, FormItem, FormLabel, FormMessage } from '@/components/ui/form';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Wind } from 'lucide-react';
import { Accordion, AccordionContent, AccordionItem, AccordionTrigger } from '@/components/ui/accordion';

const formSchema = z.object({
  density: z.number().positive(),
  velocity: z.number().positive(),
  diameter: z.number().positive(),
  viscosity: z.number().positive(),
});

type FormValues = z.infer<typeof formSchema>;

export default function ReynoldsNumberCalculator() {
  const [result, setResult] = useState<{ re: number; flowType: string } | null>(null);

  const form = useForm<FormValues>({
    resolver: zodResolver(formSchema),
    defaultValues: {
      density: undefined,
      velocity: undefined,
      diameter: undefined,
      viscosity: undefined,
    },
  });

  const onSubmit = (values: FormValues) => {
    const { density, velocity, diameter, viscosity } = values;
    const re = (density * velocity * diameter) / viscosity;
    let flowType = 'Transitional';
    if (re < 2000) {
      flowType = 'Laminar';
    } else if (re > 4000) {
      flowType = 'Turbulent';
    }
    setResult({ re, flowType });
  };

  return (
    <div className="space-y-8">
      <Form {...form}>
        <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-6">
          <CardDescription>Ensure all inputs use consistent SI units (kg/m³, m/s, m, Pa·s).</CardDescription>
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <FormField control={form.control} name="density" render={({ field }) => (
                <FormItem><FormLabel>Fluid Density (ρ)</FormLabel><FormControl><Input placeholder="e.g., 1000 for water" type="number" {...field} value={field.value ?? ''} onChange={e => field.onChange(parseFloat(e.target.value) || undefined)} /></FormControl><FormMessage /></FormItem>
            )} />
            <FormField control={form.control} name="velocity" render={({ field }) => (
                <FormItem><FormLabel>Flow Velocity (v)</FormLabel><FormControl><Input type="number" {...field} value={field.value ?? ''} onChange={e => field.onChange(parseFloat(e.target.value) || undefined)} /></FormControl><FormMessage /></FormItem>
            )} />
            <FormField control={form.control} name="diameter" render={({ field }) => (
                <FormItem><FormLabel>Pipe Diameter (D)</FormLabel><FormControl><Input type="number" {...field} value={field.value ?? ''} onChange={e => field.onChange(parseFloat(e.target.value) || undefined)} /></FormControl><FormMessage /></FormItem>
            )} />
            <FormField control={form.control} name="viscosity" render={({ field }) => (
                <FormItem><FormLabel>Dynamic Viscosity (μ)</FormLabel><FormControl><Input placeholder="e.g., 0.001 for water" type="number" {...field} value={field.value ?? ''} onChange={e => field.onChange(parseFloat(e.target.value) || undefined)} /></FormControl><FormMessage /></FormItem>
            )} />
          </div>
          <Button type="submit">Calculate Reynolds Number</Button>
        </form>
      </Form>
      {result !== null && (
        <Card className="mt-8">
            <CardHeader><div className='flex items-center gap-4'><Wind className="h-8 w-8 text-primary" /><CardTitle>Flow Characteristics</CardTitle></div></CardHeader>
            <CardContent>
                <div className="text-center space-y-2">
                    <p className="text-lg">Reynolds Number (Re)</p>
                    <p className="text-3xl font-bold">{result.re.toLocaleString(undefined, { maximumFractionDigits: 0 })}</p>
                    <p className="text-xl font-semibold">{result.flowType} Flow</p>
                </div>
            </CardContent>
        </Card>
      )}
       <Accordion type="single" collapsible className="w-full">
         <AccordionItem value="understanding-inputs">
            <AccordionTrigger>Understanding the Inputs</AccordionTrigger>
            <AccordionContent className="text-muted-foreground space-y-4">
                <div>
                    <h4 className="font-semibold text-foreground mb-1">Fluid Density (ρ)</h4>
                    <p>The mass of the fluid per unit volume. For water at room temperature, this is approximately 1000 kg/m³. For air, it's about 1.225 kg/m³.</p>
                </div>
                <div>
                    <h4 className="font-semibold text-foreground mb-1">Flow Velocity (v)</h4>
                    <p>The average speed of the fluid flowing through the pipe, in meters per second (m/s).</p>
                </div>
                <div>
                    <h4 className="font-semibold text-foreground mb-1">Characteristic Diameter (D)</h4>
                    <p>The internal diameter of the pipe, in meters (m).</p>
                </div>
                <div>
                    <h4 className="font-semibold text-foreground mb-1">Dynamic Viscosity (μ)</h4>
                    <p>A measure of a fluid's resistance to flow (its "thickness"). For water at room temperature, this is about 0.001 Pa·s. For air, it's about 1.81 x 10⁻⁵ Pa·s.</p>
                </div>
            </AccordionContent>
        </AccordionItem>
        <AccordionItem value="how-it-works">
            <AccordionTrigger>How It Works</AccordionTrigger>
            <AccordionContent className="text-muted-foreground space-y-2">
                <p>The Reynolds number is a dimensionless quantity in fluid mechanics that helps predict flow patterns. It represents the ratio of inertial forces to viscous forces.</p>
                 <ul className="list-disc list-inside space-y-1 pl-4">
                    <li><strong>Re &lt; 2000:</strong> The flow is typically smooth and orderly (Laminar).</li>
                    <li><strong>2000 &lt; Re &lt; 4000:</strong> The flow is in a transitional state, unpredictable.</li>
                    <li><strong>Re &gt; 4000:</strong> The flow is chaotic and disordered (Turbulent). This is the most common type of flow in engineering applications.</li>
                </ul>
                <p className='mt-2 font-mono p-4 bg-muted rounded-md'>Re = (ρ * v * D) / μ</p>
            </AccordionContent>
        </AccordionItem>
      </Accordion>
    </div>
  );
}

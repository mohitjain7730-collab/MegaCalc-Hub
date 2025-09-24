'use client';

import { useState } from 'react';
import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import { z } from 'zod';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Form, FormControl, FormField, FormItem, FormLabel, FormMessage } from '@/components/ui/form';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Waves } from 'lucide-react';
import { Accordion, AccordionContent, AccordionItem, AccordionTrigger } from '@/components/ui/accordion';

const formSchema = z.object({
  frictionFactor: z.number().positive(),
  pipeLength: z.number().positive(),
  pipeDiameter: z.number().positive(),
  flowVelocity: z.number().positive(),
});

type FormValues = z.infer<typeof formSchema>;

export default function HydraulicPipeFlowCalculator() {
  const [result, setResult] = useState<number | null>(null);

  const form = useForm<FormValues>({
    resolver: zodResolver(formSchema),
    defaultValues: {
      frictionFactor: undefined,
      pipeLength: undefined,
      pipeDiameter: undefined,
      flowVelocity: undefined,
    },
  });

  const onSubmit = (values: FormValues) => {
    const { frictionFactor, pipeLength, pipeDiameter, flowVelocity } = values;
    const g = 9.81; // gravitational acceleration in m/s^2
    const headLoss = frictionFactor * (pipeLength / pipeDiameter) * (Math.pow(flowVelocity, 2) / (2 * g));
    setResult(headLoss);
  };

  return (
    <div className="space-y-8">
      <Form {...form}>
        <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-6">
          <CardDescription>All inputs must be in metric units (meters, m/s).</CardDescription>
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <FormField control={form.control} name="frictionFactor" render={({ field }) => (
                <FormItem><FormLabel>Darcy Friction Factor (f)</FormLabel><FormControl><Input type="number" {...field} value={field.value ?? ''} onChange={e => field.onChange(parseFloat(e.target.value) || undefined)} /></FormControl><FormMessage /></FormItem>
            )} />
            <FormField control={form.control} name="pipeLength" render={({ field }) => (
                <FormItem><FormLabel>Pipe Length (L, meters)</FormLabel><FormControl><Input type="number" {...field} value={field.value ?? ''} onChange={e => field.onChange(parseFloat(e.target.value) || undefined)} /></FormControl><FormMessage /></FormItem>
            )} />
            <FormField control={form.control} name="pipeDiameter" render={({ field }) => (
                <FormItem><FormLabel>Pipe Diameter (D, meters)</FormLabel><FormControl><Input type="number" {...field} value={field.value ?? ''} onChange={e => field.onChange(parseFloat(e.target.value) || undefined)} /></FormControl><FormMessage /></FormItem>
            )} />
            <FormField control={form.control} name="flowVelocity" render={({ field }) => (
                <FormItem><FormLabel>Flow Velocity (v, m/s)</FormLabel><FormControl><Input type="number" {...field} value={field.value ?? ''} onChange={e => field.onChange(parseFloat(e.target.value) || undefined)} /></FormControl><FormMessage /></FormItem>
            )} />
          </div>
          <Button type="submit">Calculate Head Loss</Button>
        </form>
      </Form>
      {result !== null && (
        <Card className="mt-8">
            <CardHeader><div className='flex items-center gap-4'><Waves className="h-8 w-8 text-primary" /><CardTitle>Head Loss due to Friction</CardTitle></div></CardHeader>
            <CardContent>
                <p className="text-3xl font-bold text-center">{result.toFixed(4)} meters</p>
                <CardDescription className='mt-4 text-center'>This is the pressure loss expressed as the height of an equivalent column of the fluid.</CardDescription>
            </CardContent>
        </Card>
      )}
       <Accordion type="single" collapsible className="w-full">
         <AccordionItem value="understanding-inputs">
            <AccordionTrigger>Understanding the Inputs</AccordionTrigger>
            <AccordionContent className="text-muted-foreground space-y-4">
                <div>
                    <h4 className="font-semibold text-foreground mb-1">Darcy Friction Factor (f)</h4>
                    <p>A dimensionless value that accounts for the roughness of the pipe's inner surface and the nature of the fluid flow (laminar or turbulent). It is the most complex variable to determine and is often found using the Moody chart, which requires the Reynolds number and relative roughness of the pipe. For turbulent flow in common pipes, values often range from 0.015 to 0.03.</p>
                </div>
                <div>
                    <h4 className="font-semibold text-foreground mb-1">Pipe Length (L)</h4>
                    <p>The total length of the pipe section being analyzed, in meters.</p>
                </div>
                <div>
                    <h4 className="font-semibold text-foreground mb-1">Pipe Diameter (D)</h4>
                    <p>The internal diameter of the pipe, in meters.</p>
                </div>
                <div>
                    <h4 className="font-semibold text-foreground mb-1">Flow Velocity (v)</h4>
                    <p>The average speed of the fluid moving through the pipe, in meters per second (m/s).</p>
                </div>
            </AccordionContent>
        </AccordionItem>
        <AccordionItem value="how-it-works">
            <AccordionTrigger>How It Works</AccordionTrigger>
            <AccordionContent className="text-muted-foreground space-y-2">
                <p>This calculator uses the Darcy-Weisbach equation to determine the head loss (pressure loss) in a pipe due to friction. Head loss is a measure of the energy lost by the fluid as it flows through the pipe.</p>
                <p className='font-mono p-4 bg-muted rounded-md'>h_f = f * (L/D) * (v²/2g)</p>
                 <ul className="list-disc list-inside space-y-1 pl-4">
                    <li><strong>h_f</strong> is the head loss in meters.</li>
                    <li><strong>f</strong> is the Darcy friction factor.</li>
                    <li><strong>L</strong> is the pipe length in meters.</li>
                    <li><strong>D</strong> is the pipe's inner diameter in meters.</li>
                    <li><strong>v</strong> is the average flow velocity in m/s.</li>
                    <li><strong>g</strong> is the acceleration due to gravity (9.81 m/s²).</li>
                </ul>
            </AccordionContent>
        </AccordionItem>
      </Accordion>
    </div>
  );
}

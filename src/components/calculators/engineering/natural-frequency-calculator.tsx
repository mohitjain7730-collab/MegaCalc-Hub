
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
  stiffness: z.number().positive(),
  mass: z.number().positive(),
});

type FormValues = z.infer<typeof formSchema>;

export default function NaturalFrequencyCalculator() {
  const [result, setResult] = useState<number | null>(null);

  const form = useForm<FormValues>({
    resolver: zodResolver(formSchema),
    defaultValues: {
      stiffness: undefined,
      mass: undefined,
    },
  });

  const onSubmit = (values: FormValues) => {
    const { stiffness, mass } = values;
    const frequency = (1 / (2 * Math.PI)) * Math.sqrt(stiffness / mass);
    setResult(frequency);
  };

  return (
    <div className="space-y-8">
      <Form {...form}>
        <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-6">
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <FormField control={form.control} name="stiffness" render={({ field }) => (
                <FormItem><FormLabel>Spring Stiffness (k, N/m)</FormLabel><FormControl><Input type="number" {...field} value={field.value ?? ''} onChange={e => field.onChange(parseFloat(e.target.value) || undefined)} /></FormControl><FormMessage /></FormItem>
            )} />
            <FormField control={form.control} name="mass" render={({ field }) => (
                <FormItem><FormLabel>Mass (m, kg)</FormLabel><FormControl><Input type="number" {...field} value={field.value ?? ''} onChange={e => field.onChange(parseFloat(e.target.value) || undefined)} /></FormControl><FormMessage /></FormItem>
            )} />
          </div>
          <Button type="submit">Calculate Frequency</Button>
        </form>
      </Form>
      {result !== null && (
        <Card className="mt-8">
            <CardHeader><div className='flex items-center gap-4'><Waves className="h-8 w-8 text-primary" /><CardTitle>Natural Frequency</CardTitle></div></CardHeader>
            <CardContent>
                <p className="text-3xl font-bold text-center">{result.toFixed(2)} Hz</p>
                <CardDescription className='mt-4 text-center'>This is the frequency at which the system will oscillate if disturbed from its equilibrium position without any damping.</CardDescription>
            </CardContent>
        </Card>
      )}
       <Accordion type="single" collapsible className="w-full">
         <AccordionItem value="understanding-inputs">
            <AccordionTrigger>Understanding the Inputs</AccordionTrigger>
            <AccordionContent className="text-muted-foreground space-y-4">
                <div>
                    <h4 className="font-semibold text-foreground mb-1">Spring Stiffness (k)</h4>
                    <p>A measure of how much force is required to stretch or compress a spring by a certain distance. A higher value means a stiffer spring. Units: Newtons per meter (N/m).</p>
                </div>
                <div>
                    <h4 className="font-semibold text-foreground mb-1">Mass (m)</h4>
                    <p>The mass attached to the end of the spring. Units: Kilograms (kg).</p>
                </div>
            </AccordionContent>
        </AccordionItem>
        <AccordionItem value="how-it-works">
            <AccordionTrigger>How It Works</AccordionTrigger>
            <AccordionContent className="text-muted-foreground space-y-2">
                <p>This calculator computes the natural frequency for a simple, undamped spring-mass system. The natural frequency is an inherent property of the system, determined by its mass and stiffness. If an external force is applied at this frequency, the system will experience resonance, leading to large amplitude oscillations.</p>
                <p className='font-mono p-4 bg-muted rounded-md'>f_n = (1 / 2π) * √(k / m)</p>
            </AccordionContent>
        </AccordionItem>
      </Accordion>
    </div>
  );
}

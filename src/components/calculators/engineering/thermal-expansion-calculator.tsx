'use client';

import { useState } from 'react';
import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import { z } from 'zod';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Form, FormControl, FormField, FormItem, FormLabel, FormMessage } from '@/components/ui/form';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Thermometer } from 'lucide-react';
import { Accordion, AccordionContent, AccordionItem, AccordionTrigger } from '@/components/ui/accordion';

const formSchema = z.object({
  originalLength: z.number().positive(),
  alpha: z.number().positive(),
  tempChange: z.number(),
});

type FormValues = z.infer<typeof formSchema>;

export default function ThermalExpansionCalculator() {
  const [result, setResult] = useState<number | null>(null);

  const form = useForm<FormValues>({
    resolver: zodResolver(formSchema),
    defaultValues: {
      originalLength: undefined,
      alpha: undefined,
      tempChange: undefined,
    },
  });

  const onSubmit = (values: FormValues) => {
    const { originalLength, alpha, tempChange } = values;
    const lengthChange = alpha * originalLength * tempChange;
    setResult(lengthChange);
  };

  return (
    <div className="space-y-8">
      <Form {...form}>
        <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-6">
          <CardDescription>Ensure all inputs use consistent units (m, 1/°C, °C).</CardDescription>
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <FormField control={form.control} name="originalLength" render={({ field }) => (
                <FormItem><FormLabel>Original Length (L₀)</FormLabel><FormControl><Input type="number" {...field} value={field.value ?? ''} onChange={e => field.onChange(parseFloat(e.target.value) || undefined)} /></FormControl><FormMessage /></FormItem>
            )} />
            <FormField control={form.control} name="alpha" render={({ field }) => (
                <FormItem><FormLabel>Coefficient of Linear Thermal Expansion (α)</FormLabel><FormControl><Input type="number" placeholder="e.g., 1.2e-5 for steel" {...field} value={field.value ?? ''} onChange={e => field.onChange(parseFloat(e.target.value) || undefined)} /></FormControl><FormMessage /></FormItem>
            )} />
            <FormField control={form.control} name="tempChange" render={({ field }) => (
                <FormItem className="md:col-span-2"><FormLabel>Temperature Change (ΔT, °C)</FormLabel><FormControl><Input type="number" {...field} value={field.value ?? ''} onChange={e => field.onChange(parseFloat(e.target.value) || undefined)} /></FormControl><FormMessage /></FormItem>
            )} />
          </div>
          <Button type="submit">Calculate Expansion</Button>
        </form>
      </Form>
      {result !== null && (
        <Card className="mt-8">
            <CardHeader><div className='flex items-center gap-4'><Thermometer className="h-8 w-8 text-primary" /><CardTitle>Change in Length</CardTitle></div></CardHeader>
            <CardContent>
                <p className="text-3xl font-bold text-center">{result.toExponential(4)} meters</p>
                <CardDescription className='mt-4 text-center'>This is the amount the material will expand or contract.</CardDescription>
            </CardContent>
        </Card>
      )}
       <Accordion type="single" collapsible className="w-full">
         <AccordionItem value="understanding-inputs">
            <AccordionTrigger>Understanding the Inputs</AccordionTrigger>
            <AccordionContent className="text-muted-foreground space-y-4">
                <div>
                    <h4 className="font-semibold text-foreground mb-1">Original Length (L₀)</h4>
                    <p>The length of the material at the initial temperature, in meters (m).</p>
                </div>
                <div>
                    <h4 className="font-semibold text-foreground mb-1">Coefficient of Linear Thermal Expansion (α)</h4>
                    <p>An intrinsic property of a material that describes how its size changes with a change in temperature. It is specific to each material. Units: per degree Celsius (1/°C). Common values: Steel ≈ 12x10⁻⁶, Aluminum ≈ 23x10⁻⁶, Concrete ≈ 12x10⁻⁶.</p>
                </div>
                <div>
                    <h4 className="font-semibold text-foreground mb-1">Temperature Change (ΔT)</h4>
                    <p>The final temperature minus the initial temperature, in degrees Celsius (°C). A positive value means heating (expansion), and a negative value means cooling (contraction).</p>
                </div>
            </AccordionContent>
        </AccordionItem>
        <AccordionItem value="how-it-works">
            <AccordionTrigger>How It Works</AccordionTrigger>
            <AccordionContent className="text-muted-foreground space-y-2">
                <p>This calculator uses the basic formula for linear thermal expansion, which is a good approximation for most engineering materials over moderate temperature changes.</p>
                <p className='font-mono p-4 bg-muted rounded-md'>ΔL = α * L₀ * ΔT</p>
                 <p>The formula states that the change in length (ΔL) is directly proportional to the original length, the temperature change, and the material's coefficient of expansion.</p>
            </AccordionContent>
        </AccordionItem>
      </Accordion>
    </div>
  );
}

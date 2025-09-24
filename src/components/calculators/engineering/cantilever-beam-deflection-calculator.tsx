
'use client';

import { useState } from 'react';
import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import { z } from 'zod';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Form, FormControl, FormField, FormItem, FormLabel, FormMessage } from '@/components/ui/form';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { ArrowDownToLine } from 'lucide-react';
import { Accordion, AccordionContent, AccordionItem, AccordionTrigger } from '@/components/ui/accordion';

const formSchema = z.object({
  load: z.number().positive(),
  length: z.number().positive(),
  modulusOfElasticity: z.number().positive(),
  momentOfInertia: z.number().positive(),
});

type FormValues = z.infer<typeof formSchema>;

export default function CantileverBeamDeflectionCalculator() {
  const [result, setResult] = useState<number | null>(null);

  const form = useForm<FormValues>({
    resolver: zodResolver(formSchema),
    defaultValues: {
      load: undefined,
      length: undefined,
      modulusOfElasticity: undefined,
      momentOfInertia: undefined,
    },
  });

  const onSubmit = (values: FormValues) => {
    const { load, length, modulusOfElasticity, momentOfInertia } = values;
    const deflection = (load * Math.pow(length, 3)) / (3 * modulusOfElasticity * momentOfInertia);
    setResult(deflection);
  };

  return (
    <div className="space-y-8">
      <Form {...form}>
        <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-6">
          <CardDescription>Ensure all inputs use consistent units (e.g., N, m, Pa, m⁴).</CardDescription>
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <FormField control={form.control} name="load" render={({ field }) => (
                <FormItem><FormLabel>Load at Tip (P)</FormLabel><FormControl><Input type="number" {...field} value={field.value ?? ''} onChange={e => field.onChange(parseFloat(e.target.value) || undefined)} /></FormControl><FormMessage /></FormItem>
            )} />
            <FormField control={form.control} name="length" render={({ field }) => (
                <FormItem><FormLabel>Beam Length (L)</FormLabel><FormControl><Input type="number" {...field} value={field.value ?? ''} onChange={e => field.onChange(parseFloat(e.target.value) || undefined)} /></FormControl><FormMessage /></FormItem>
            )} />
            <FormField control={form.control} name="modulusOfElasticity" render={({ field }) => (
                <FormItem><FormLabel>Modulus of Elasticity (E)</FormLabel><FormControl><Input type="number" {...field} value={field.value ?? ''} onChange={e => field.onChange(parseFloat(e.target.value) || undefined)} /></FormControl><FormMessage /></FormItem>
            )} />
            <FormField control={form.control} name="momentOfInertia" render={({ field }) => (
                <FormItem><FormLabel>Moment of Inertia (I)</FormLabel><FormControl><Input type="number" {...field} value={field.value ?? ''} onChange={e => field.onChange(parseFloat(e.target.value) || undefined)} /></FormControl><FormMessage /></FormItem>
            )} />
          </div>
          <Button type="submit">Calculate Deflection</Button>
        </form>
      </Form>
      {result !== null && (
        <Card className="mt-8">
            <CardHeader><div className='flex items-center gap-4'><ArrowDownToLine className="h-8 w-8 text-primary" /><CardTitle>Tip Deflection</CardTitle></div></CardHeader>
            <CardContent>
                <p className="text-3xl font-bold text-center">{result.toExponential(4)} meters</p>
                <CardDescription className='mt-4 text-center'>This is the vertical displacement at the free end of the beam.</CardDescription>
            </CardContent>
        </Card>
      )}
       <Accordion type="single" collapsible className="w-full">
         <AccordionItem value="understanding-inputs">
            <AccordionTrigger>Understanding the Inputs</AccordionTrigger>
            <AccordionContent className="text-muted-foreground space-y-4">
                <div>
                    <h4 className="font-semibold text-foreground mb-1">Load at Tip (P)</h4>
                    <p>The point force applied at the very end of the cantilever beam. Units: Newtons (N).</p>
                </div>
                <div>
                    <h4 className="font-semibold text-foreground mb-1">Beam Length (L)</h4>
                    <p>The total length of the beam from the fixed support to the tip. Units: Meters (m).</p>
                </div>
                 <div>
                    <h4 className="font-semibold text-foreground mb-1">Modulus of Elasticity (E)</h4>
                    <p>A material's resistance to being elastically deformed. Common values: Steel is ~200 GPa (200e9 Pa), Aluminum is ~69 GPa (69e9 Pa). Units: Pascals (Pa).</p>
                </div>
                <div>
                    <h4 className="font-semibold text-foreground mb-1">Moment of Inertia (I)</h4>
                    <p>A geometric property of the beam's cross-section that measures its resistance to bending. For a rectangular beam: I = (base * height³) / 12. Units: Meters⁴ (m⁴).</p>
                </div>
            </AccordionContent>
        </AccordionItem>
        <AccordionItem value="how-it-works">
            <AccordionTrigger>How It Works</AccordionTrigger>
            <AccordionContent className="text-muted-foreground space-y-2">
                <p>This calculator uses the standard formula for deflection of a cantilever beam with a point load at the free end. The formula shows that deflection increases significantly with length (to the power of 3).</p>
                <p className='font-mono p-4 bg-muted rounded-md'>δ_tip = (P * L³) / (3 * E * I)</p>
            </AccordionContent>
        </AccordionItem>
      </Accordion>
    </div>
  );
}

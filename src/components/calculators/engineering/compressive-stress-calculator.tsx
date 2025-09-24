'use client';

import { useState } from 'react';
import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import { z } from 'zod';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Form, FormControl, FormField, FormItem, FormLabel, FormMessage } from '@/components/ui/form';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { UnfoldVertical } from 'lucide-react';
import { Accordion, AccordionContent, AccordionItem, AccordionTrigger } from '@/components/ui/accordion';

const formSchema = z.object({
  force: z.number().positive(),
  area: z.number().positive(),
});

type FormValues = z.infer<typeof formSchema>;

export default function CompressiveStressCalculator() {
  const [result, setResult] = useState<number | null>(null);

  const form = useForm<FormValues>({
    resolver: zodResolver(formSchema),
    defaultValues: {
      force: undefined,
      area: undefined,
    },
  });

  const onSubmit = (values: FormValues) => {
    const { force, area } = values;
    const stress = force / area;
    setResult(stress);
  };

  return (
    <div className="space-y-8">
      <Form {...form}>
        <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-6">
          <CardDescription>Ensure all inputs use consistent units (e.g., Newtons and m²).</CardDescription>
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <FormField control={form.control} name="force" render={({ field }) => (
                <FormItem><FormLabel>Compressive Force (F)</FormLabel><FormControl><Input type="number" {...field} value={field.value ?? ''} onChange={e => field.onChange(parseFloat(e.target.value) || undefined)} /></FormControl><FormMessage /></FormItem>
            )} />
            <FormField control={form.control} name="area" render={({ field }) => (
                <FormItem><FormLabel>Cross-sectional Area (A)</FormLabel><FormControl><Input type="number" {...field} value={field.value ?? ''} onChange={e => field.onChange(parseFloat(e.target.value) || undefined)} /></FormControl><FormMessage /></FormItem>
            )} />
          </div>
          <Button type="submit">Calculate Stress</Button>
        </form>
      </Form>
      {result !== null && (
        <Card className="mt-8">
            <CardHeader><div className='flex items-center gap-4'><UnfoldVertical className="h-8 w-8 text-primary" /><CardTitle>Compressive Stress</CardTitle></div></CardHeader>
            <CardContent>
                <p className="text-3xl font-bold text-center">{result.toLocaleString()} Pa</p>
                <CardDescription className='mt-4 text-center'>This is the internal pressure within the material resisting the compressive force, measured in Pascals (N/m²).</CardDescription>
            </CardContent>
        </Card>
      )}
       <Accordion type="single" collapsible className="w-full">
         <AccordionItem value="understanding-inputs">
            <AccordionTrigger>Understanding the Inputs</AccordionTrigger>
            <AccordionContent className="text-muted-foreground space-y-4">
                <div>
                    <h4 className="font-semibold text-foreground mb-1">Compressive Force (F)</h4>
                    <p>The total force applied perpendicular to the surface area of the object, pushing it together. For consistency, use Newtons (N).</p>
                </div>
                <div>
                    <h4 className="font-semibold text-foreground mb-1">Cross-sectional Area (A)</h4>
                    <p>The area over which the force is distributed. For example, for a square column, this would be `side * side`. For consistency, use square meters (m²).</p>
                </div>
            </AccordionContent>
        </AccordionItem>
        <AccordionItem value="how-it-works">
            <AccordionTrigger>How It Works</AccordionTrigger>
            <AccordionContent className="text-muted-foreground space-y-2">
                <p>This calculator determines the compressive stress (σ) on a material using the fundamental stress formula. Stress is defined as the force applied per unit of area.</p>
                <p className='font-mono p-4 bg-muted rounded-md'>σ = F / A</p>
                 <ul className="list-disc list-inside space-y-1 pl-4">
                    <li><strong>σ (sigma)</strong> is the compressive stress in Pascals (Pa).</li>
                    <li><strong>F</strong> is the compressive force applied perpendicular to the cross-sectional area, measured in Newtons (N).</li>
                    <li><strong>A</strong> is the cross-sectional area over which the force is distributed, measured in square meters (m²).</li>
                </ul>
            </AccordionContent>
        </AccordionItem>
      </Accordion>
    </div>
  );
}


'use client';

import { useState } from 'react';
import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import { z } from 'zod';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Form, FormControl, FormField, FormItem, FormLabel, FormMessage } from '@/components/ui/form';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Beaker } from 'lucide-react';
import { Accordion, AccordionContent, AccordionItem, AccordionTrigger } from '@/components/ui/accordion';

const formSchema = z.object({
  c1: z.number().positive(),
  v1: z.number().positive(),
  c2: z.number().positive(),
}).refine(data => data.c1 > data.c2, {
    message: "Initial concentration must be greater than final concentration.",
    path: ["c2"],
});

type FormValues = z.infer<typeof formSchema>;

export default function CellDilutionCalculator() {
  const [result, setResult] = useState<{v2: number, diluent: number} | null>(null);

  const form = useForm<FormValues>({
    resolver: zodResolver(formSchema),
    defaultValues: { c1: undefined, v1: undefined, c2: undefined },
  });

  const onSubmit = (values: FormValues) => {
    const { c1, v1, c2 } = values;
    const v2 = (c1 * v1) / c2;
    const diluent = v2 - v1;
    setResult({v2, diluent});
  };

  return (
    <div className="space-y-8">
      <Form {...form}>
        <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-6">
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <FormField control={form.control} name="c1" render={({ field }) => (
                <FormItem><FormLabel>Initial Concentration (C₁)</FormLabel><FormControl><Input type="number" placeholder="e.g., 1000 cells/mL" {...field} value={field.value ?? ''} onChange={e => field.onChange(e.target.value === '' ? undefined : parseFloat(e.target.value))} /></FormControl><FormMessage /></FormItem>
            )} />
            <FormField control={form.control} name="v1" render={({ field }) => (
                <FormItem><FormLabel>Initial Volume (V₁)</FormLabel><FormControl><Input type="number" placeholder="e.g., 10 mL" {...field} value={field.value ?? ''} onChange={e => field.onChange(e.target.value === '' ? undefined : parseFloat(e.target.value))} /></FormControl><FormMessage /></FormItem>
            )} />
            <FormField control={form.control} name="c2" render={({ field }) => (
                <FormItem className="md:col-span-2"><FormLabel>Final Concentration (C₂)</FormLabel><FormControl><Input type="number" placeholder="e.g., 100 cells/mL" {...field} value={field.value ?? ''} onChange={e => field.onChange(e.target.value === '' ? undefined : parseFloat(e.target.value))} /></FormControl><FormMessage /></FormItem>
            )} />
          </div>
          <Button type="submit">Calculate Dilution</Button>
        </form>
      </Form>
      
      {result !== null && (
        <Card className="mt-8">
            <CardHeader><div className='flex items-center gap-4'><Beaker className="h-8 w-8 text-primary" /><CardTitle>Dilution Recipe</CardTitle></div></CardHeader>
            <CardContent>
                <div className="grid grid-cols-2 gap-4 text-center">
                    <div>
                        <p className="font-bold text-lg">Final Volume (V₂)</p>
                        <p className="text-xl font-bold">{result.v2.toFixed(2)} mL</p>
                    </div>
                     <div>
                        <p className="font-bold text-lg">Diluent to Add</p>
                        <p className="text-xl font-bold">{result.diluent.toFixed(2)} mL</p>
                    </div>
                </div>
            </CardContent>
        </Card>
      )}

      <Accordion type="single" collapsible className="w-full">
        <AccordionItem value="how-it-works">
            <AccordionTrigger>How It Works</AccordionTrigger>
            <AccordionContent className="text-muted-foreground">
                <p>This calculator uses the dilution equation M₁V₁ = M₂V₂ (or C₁V₁ = C₂V₂), where C is concentration and V is volume. It solves for the final volume (V₂) required to achieve the desired final concentration (C₂). The amount of diluent to add is then calculated by subtracting the initial volume (V₁) from the final volume (V₂).</p>
            </AccordionContent>
        </AccordionItem>
      </Accordion>
    </div>
  );
}

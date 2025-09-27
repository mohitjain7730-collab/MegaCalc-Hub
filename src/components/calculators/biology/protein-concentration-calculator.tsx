
'use client';

import { useState } from 'react';
import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import { z } from 'zod';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Form, FormControl, FormField, FormItem, FormLabel, FormMessage } from '@/components/ui/form';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { FlaskConical } from 'lucide-react';
import { Accordion, AccordionContent, AccordionItem, AccordionTrigger } from '@/components/ui/accordion';

const formSchema = z.object({
  a280: z.number().positive(),
  extinctionCoeff: z.number().positive(),
  pathLength: z.number().positive(),
});

type FormValues = z.infer<typeof formSchema>;

export default function ProteinConcentrationCalculator() {
  const [result, setResult] = useState<number | null>(null);

  const form = useForm<FormValues>({
    resolver: zodResolver(formSchema),
    defaultValues: { a280: undefined, extinctionCoeff: undefined, pathLength: 1 },
  });

  const onSubmit = (values: FormValues) => {
    const concentration = (values.a280 / (values.extinctionCoeff * values.pathLength));
    setResult(concentration * 1000); // Convert M to mM
  };

  return (
    <div className="space-y-8">
      <Form {...form}>
        <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-6">
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <FormField control={form.control} name="a280" render={({ field }) => (
                <FormItem><FormLabel>Absorbance at 280nm (A280)</FormLabel><FormControl><Input type="number" step="0.001" placeholder="e.g., 0.75" {...field} value={field.value ?? ''} onChange={e => field.onChange(parseFloat(e.target.value))} /></FormControl><FormMessage /></FormItem>
            )} />
            <FormField control={form.control} name="extinctionCoeff" render={({ field }) => (
                <FormItem><FormLabel>Molar Extinction Coeff. (M⁻¹cm⁻¹)</FormLabel><FormControl><Input type="number" placeholder="e.g., 5500" {...field} value={field.value ?? ''} onChange={e => field.onChange(parseFloat(e.target.value))} /></FormControl><FormMessage /></FormItem>
            )} />
            <FormField control={form.control} name="pathLength" render={({ field }) => (
                <FormItem className="md:col-span-2"><FormLabel>Path Length (cm)</FormLabel><FormControl><Input type="number" placeholder="1" {...field} value={field.value ?? ''} onChange={e => field.onChange(parseFloat(e.target.value))} /></FormControl><FormMessage /></FormItem>
            )} />
          </div>
          <Button type="submit">Calculate Concentration</Button>
        </form>
      </Form>
      
      {result !== null && (
        <Card className="mt-8">
            <CardHeader><div className='flex items-center gap-4'><FlaskConical className="h-8 w-8 text-primary" /><CardTitle>Protein Concentration</CardTitle></div></CardHeader>
            <CardContent>
                <p className="text-3xl font-bold text-center">{result.toFixed(4)} mM</p>
            </CardContent>
        </Card>
      )}

      <Accordion type="single" collapsible className="w-full">
        <AccordionItem value="how-it-works">
            <AccordionTrigger>How It Works</AccordionTrigger>
            <AccordionContent className="text-muted-foreground">
                <p>This calculator uses the Beer-Lambert Law (A = εcl) to determine the concentration of a protein sample. The formula is rearranged to c = A / (εl), where 'A' is the absorbance, 'ε' is the molar extinction coefficient, and 'l' is the path length.</p>
            </AccordionContent>
        </AccordionItem>
      </Accordion>
    </div>
  );
}

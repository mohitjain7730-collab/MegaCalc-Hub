
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
  a260: z.number().positive(),
  dilutionFactor: z.number().positive().default(1),
});

type FormValues = z.infer<typeof formSchema>;

export default function DnaConcentrationCalculator() {
  const [result, setResult] = useState<{conc: number, purity: number | null} | null>(null);

  const form = useForm<FormValues>({
    resolver: zodResolver(formSchema),
    defaultValues: { a260: undefined, dilutionFactor: 1 },
  });

  const onSubmit = (values: FormValues) => {
    const concentration = values.a260 * 50 * values.dilutionFactor;
    setResult({ conc: concentration, purity: null });
  };

  return (
    <div className="space-y-8">
      <Form {...form}>
        <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-6">
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <FormField control={form.control} name="a260" render={({ field }) => (
                <FormItem><FormLabel>Absorbance at 260nm (A260)</FormLabel><FormControl><Input type="number" step="0.001" placeholder="e.g., 0.5" {...field} value={field.value ?? ''} onChange={e => field.onChange(e.target.value === '' ? undefined : parseFloat(e.target.value))} /></FormControl><FormMessage /></FormItem>
            )} />
            <FormField control={form.control} name="dilutionFactor" render={({ field }) => (
                <FormItem><FormLabel>Dilution Factor</FormLabel><FormControl><Input type="number" placeholder="e.g., 10" {...field} value={field.value ?? ''} onChange={e => field.onChange(e.target.value === '' ? undefined : parseFloat(e.target.value))} /></FormControl><FormMessage /></FormItem>
            )} />
          </div>
          <Button type="submit">Calculate Concentration</Button>
        </form>
      </Form>
      
      {result !== null && (
        <Card className="mt-8">
            <CardHeader><div className='flex items-center gap-4'><FlaskConical className="h-8 w-8 text-primary" /><CardTitle>DNA Concentration</CardTitle></div></CardHeader>
            <CardContent>
                <p className="text-3xl font-bold text-center">{result.conc.toFixed(2)} µg/mL</p>
            </CardContent>
        </Card>
      )}

      <Accordion type="single" collapsible className="w-full">
        <AccordionItem value="how-it-works">
            <AccordionTrigger>How It Works</AccordionTrigger>
            <AccordionContent className="text-muted-foreground">
                <p>This calculator estimates the concentration of double-stranded DNA (dsDNA) in a sample based on its absorbance at 260nm. The standard conversion factor is that an A260 reading of 1.0 corresponds to a dsDNA concentration of 50 µg/mL. This value is then multiplied by the dilution factor to get the concentration of the original, undiluted sample.</p>
            </AccordionContent>
        </AccordionItem>
      </Accordion>
    </div>
  );
}

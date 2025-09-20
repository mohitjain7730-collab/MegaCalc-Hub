'use client';

import { useState } from 'react';
import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import { z } from 'zod';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Form, FormControl, FormField, FormItem, FormLabel, FormMessage } from '@/components/ui/form';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Thermometer } from 'lucide-react';
import { Accordion, AccordionContent, AccordionItem, AccordionTrigger } from '@/components/ui/accordion';

const climates = {
  hot: 30,
  moderate: 25,
  cool: 20,
};

const formSchema = z.object({
  area: z.number().positive(),
  climate: z.nativeEnum(climates),
  unit: z.enum(['feet', 'meters']),
});

type FormValues = z.infer<typeof formSchema>;

export default function HvacSizingCalculator() {
  const [result, setResult] = useState<{ btu: number; tons: number } | null>(null);

  const form = useForm<FormValues>({
    resolver: zodResolver(formSchema),
    defaultValues: {
      unit: 'feet',
      climate: climates.moderate,
      area: undefined,
    },
  });

  const onSubmit = (values: FormValues) => {
    let { area, climate, unit } = values;

    if (unit === 'meters') {
        area *= 10.7639; // to sq ft
    }

    const btuNeeded = area * climate;
    const tonsNeeded = btuNeeded / 12000;

    setResult({ btu: btuNeeded, tons: tonsNeeded });
  };

  const unit = form.watch('unit');

  return (
    <div className="space-y-8">
      <Form {...form}>
        <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-6">
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <FormField control={form.control} name="unit" render={({ field }) => (
                <FormItem><FormLabel>Units</FormLabel><Select onValueChange={field.onChange} defaultValue={field.value}><FormControl><SelectTrigger><SelectValue /></SelectTrigger></FormControl><SelectContent><SelectItem value="feet">Square Feet</SelectItem><SelectItem value="meters">Square Meters</SelectItem></SelectContent></Select></FormItem>
            )} />
            <FormField control={form.control} name="climate" render={({ field }) => (
                <FormItem><FormLabel>Climate Zone</FormLabel><Select onValueChange={(v) => field.onChange(parseFloat(v))} defaultValue={String(field.value)}><FormControl><SelectTrigger><SelectValue /></SelectTrigger></FormControl><SelectContent>
                    {Object.entries(climates).map(([key, value]) => (<SelectItem key={key} value={String(value)}>{key.charAt(0).toUpperCase() + key.slice(1)}</SelectItem>))}
                </SelectContent></Select></FormItem>
            )} />
             <FormField control={form.control} name="area" render={({ field }) => (
                <FormItem className="md:col-span-2"><FormLabel>Conditioned Area ({unit === 'feet' ? 'sq ft' : 'sq m'})</FormLabel><FormControl><Input type="number" {...field} onChange={e => field.onChange(parseFloat(e.target.value))} /></FormControl><FormMessage /></FormItem>
            )} />
          </div>
          <Button type="submit">Calculate</Button>
        </form>
      </Form>
      {result && (
        <Card className="mt-8">
          <CardHeader><div className='flex items-center gap-4'><Thermometer className="h-8 w-8 text-primary" /><CardTitle>Estimated HVAC Size</CardTitle></div></CardHeader>
          <CardContent>
            <p className="text-lg">You need a system with approximately:</p>
            <ul className="list-disc pl-5 mt-2 text-lg">
                <li><strong>{result.btu.toFixed(0)} BTU/hr</strong></li>
                <li><strong>{result.tons.toFixed(2)} tons</strong> of cooling capacity.</li>
            </ul>
            <CardDescription className='mt-4'>This is a rough estimate (Manual J is the professional standard). Factors like window quality, insulation, and ceiling height have a large impact.</CardDescription>
          </CardContent>
        </Card>
      )}
       <Accordion type="single" collapsible className="w-full">
        <AccordionItem value="how-it-works">
            <AccordionTrigger>How It Works</AccordionTrigger>
            <AccordionContent className="text-muted-foreground space-y-2">
                <p>This provides a very basic estimate based on square footage and a general climate factor (BTUs needed per square foot).</p>
                <ol className="list-decimal list-inside space-y-1">
                    <li><strong>Total BTUs:</strong> Multiplies the area by the climate factor to get a total British Thermal Unit (BTU) per hour requirement.</li>
                    <li><strong>Tonnage:</strong> Converts BTUs to "tons" of cooling, the standard industry measurement. One ton of cooling is 12,000 BTU/hr.</li>
                </ol>
            </AccordionContent>
        </AccordionItem>
      </Accordion>
    </div>
  );
}

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
import { Calculator } from 'lucide-react';
import { Accordion, AccordionContent, AccordionItem, AccordionTrigger } from '@/components/ui/accordion';

const renovationCosts = {
  basicKitchen: 150,
  midKitchen: 250,
  highKitchen: 400,
  basicBathroom: 200,
  midBathroom: 350,
  highBathroom: 500,
  basement: 50,
};

const formSchema = z.object({
  area: z.number().positive(),
  renovationType: z.nativeEnum(renovationCosts),
  unit: z.enum(['feet', 'meters']),
});

type FormValues = z.infer<typeof formSchema>;

export default function CostEstimatorRenovationCalculator() {
  const [result, setResult] = useState<{ low: number; high: number } | null>(null);

  const form = useForm<FormValues>({
    resolver: zodResolver(formSchema),
    defaultValues: {
      unit: 'feet',
      renovationType: renovationCosts.basicKitchen,
      area: undefined,
    },
  });

  const onSubmit = (values: FormValues) => {
    let { area, renovationType, unit } = values;

    if (unit === 'meters') {
        area *= 10.7639; // to sq ft
    }
    
    const baseCost = area * renovationType;
    setResult({ low: baseCost * 0.8, high: baseCost * 1.2 });
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
            <FormField control={form.control} name="renovationType" render={({ field }) => (
                <FormItem><FormLabel>Renovation Type</FormLabel><Select onValueChange={(v) => field.onChange(parseFloat(v))} defaultValue={String(field.value)}><FormControl><SelectTrigger><SelectValue /></SelectTrigger></FormControl><SelectContent>
                    {Object.entries(renovationCosts).map(([key, value]) => (<SelectItem key={key} value={String(value)}>{key.replace(/([A-Z])/g, ' $1').replace(/^./, str => str.toUpperCase())}</SelectItem>))}
                </SelectContent></Select></FormItem>
            )} />
            <FormField control={form.control} name="area" render={({ field }) => (
                <FormItem className="md:col-span-2"><FormLabel>Area ({unit === 'feet' ? 'sq ft' : 'sq m'})</FormLabel><FormControl><Input type="number" {...field} value={field.value ?? ''} onChange={e => field.onChange(parseFloat(e.target.value) || undefined)} /></FormControl><FormMessage /></FormItem>
            )} />
          </div>
          <Button type="submit">Estimate Cost</Button>
        </form>
      </Form>
      {result && (
        <Card className="mt-8">
            <CardHeader><div className='flex items-center gap-4'><Calculator className="h-8 w-8 text-primary" /><CardTitle>Estimated Cost Range</CardTitle></div></CardHeader>
            <CardContent>
                <p className="text-xl">
                    Your estimated renovation cost is between <strong>${result.low.toLocaleString(undefined, {maximumFractionDigits: 0})}</strong> and <strong>${result.high.toLocaleString(undefined, {maximumFractionDigits: 0})}</strong>.
                </p>
                <CardDescription className='mt-4'>This is a rough, ballpark estimate. Costs vary widely by location, material choices, and labor rates. Get multiple quotes from contractors.</CardDescription>
            </CardContent>
        </Card>
      )}
    </div>
  );
}

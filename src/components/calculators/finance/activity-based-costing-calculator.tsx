
'use client';

import { useState } from 'react';
import { useForm, useFieldArray } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import { z } from 'zod';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Form, FormControl, FormField, FormItem, FormLabel, FormMessage } from '@/components/ui/form';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Target, PlusCircle, XCircle } from 'lucide-react';
import { Accordion, AccordionContent, AccordionItem, AccordionTrigger } from '@/components/ui/accordion';

const costPoolSchema = z.object({
  activity: z.string().min(1),
  totalCost: z.number().positive(),
  totalDriverVolume: z.number().positive(),
  productConsumption: z.number().nonnegative(),
  driverUnit: z.string().min(1),
});

const formSchema = z.object({
  costPools: z.array(costPoolSchema).min(1),
});

type FormValues = z.infer<typeof formSchema>;
type Result = {
  totalAllocatedCost: number;
  details: { activity: string; rate: number; allocatedCost: number; unit: string }[];
};

export default function ActivityBasedCostingCalculator() {
  const [result, setResult] = useState<Result | null>(null);

  const form = useForm<FormValues>({
    resolver: zodResolver(formSchema),
    defaultValues: {
      costPools: [
        { activity: 'Machine Setups', totalCost: undefined, totalDriverVolume: undefined, productConsumption: undefined, driverUnit: 'setups' },
        { activity: 'Quality Inspections', totalCost: undefined, totalDriverVolume: undefined, productConsumption: undefined, driverUnit: 'inspections' },
      ],
    },
  });

  const { fields, append, remove } = useFieldArray({
    control: form.control,
    name: "costPools"
  });

  const onSubmit = (values: FormValues) => {
    let totalAllocatedCost = 0;
    const details = values.costPools.map(pool => {
      const rate = pool.totalCost / pool.totalDriverVolume;
      const allocatedCost = rate * pool.productConsumption;
      totalAllocatedCost += allocatedCost;
      return { activity: pool.activity, rate, allocatedCost, unit: pool.driverUnit };
    });
    setResult({ totalAllocatedCost, details });
  };

  return (
    <div className="space-y-8">
      <Form {...form}>
        <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-6">
          <Card>
            <CardHeader><CardTitle>Cost Pools & Drivers</CardTitle></CardHeader>
            <CardContent>
              {fields.map((field, index) => (
                <div key={field.id} className="p-4 border rounded-lg mb-4">
                  <FormField control={form.control} name={`costPools.${index}.activity`} render={({ field }) => (
                    <FormItem className="mb-2"><FormLabel>Activity</FormLabel><FormControl><Input {...field} /></FormControl></FormItem>
                  )} />
                  <div className="grid grid-cols-2 gap-2 mb-2">
                    <FormField control={form.control} name={`costPools.${index}.totalCost`} render={({ field }) => (<FormItem><FormLabel>Total Cost ($)</FormLabel><FormControl><Input type="number" {...field} value={field.value ?? ''} onChange={e => field.onChange(parseFloat(e.target.value) || undefined)} /></FormControl></FormItem>)} />
                    <FormField control={form.control} name={`costPools.${index}.totalDriverVolume`} render={({ field }) => (<FormItem><FormLabel>Total Driver Volume</FormLabel><FormControl><Input type="number" {...field} value={field.value ?? ''} onChange={e => field.onChange(parseFloat(e.target.value) || undefined)} /></FormControl></FormItem>)} />
                    <FormField control={form.control} name={`costPools.${index}.productConsumption`} render={({ field }) => (<FormItem><FormLabel>Product Consumption</FormLabel><FormControl><Input type="number" {...field} value={field.value ?? ''} onChange={e => field.onChange(parseFloat(e.target.value) || undefined)} /></FormControl></FormItem>)} />
                    <FormField control={form.control} name={`costPools.${index}.driverUnit`} render={({ field }) => (<FormItem><FormLabel>Driver Unit</FormLabel><FormControl><Input {...field} /></FormControl></FormItem>)} />
                  </div>
                  <Button type="button" variant="destructive" size="sm" onClick={() => remove(index)}>Remove</Button>
                </div>
              ))}
              <Button type="button" variant="outline" size="sm" onClick={() => append({ activity: '', totalCost: undefined, totalDriverVolume: undefined, productConsumption: undefined, driverUnit: '' })}><PlusCircle className="mr-2 h-4 w-4" /> Add Activity</Button>
            </CardContent>
          </Card>
          <Button type="submit">Calculate Allocated Cost</Button>
        </form>
      </Form>
      {result && (
        <Card className="mt-8">
          <CardHeader>
            <div className='flex items-center gap-4'><Target className="h-8 w-8 text-primary" /><CardTitle>Total Overhead Allocated to Product</CardTitle></div>
          </CardHeader>
          <CardContent>
            <p className="text-3xl font-bold text-center">${result.totalAllocatedCost.toFixed(2)}</p>
            <div className="mt-4 space-y-2">
                {result.details.map(detail => (
                    <p key={detail.activity} className="text-sm text-muted-foreground">{detail.activity}: ${detail.rate.toFixed(2)} per {detail.unit} -> ${detail.allocatedCost.toFixed(2)}</p>
                ))}
            </div>
          </CardContent>
        </Card>
      )}
      <Accordion type="single" collapsible className="w-full">
        <AccordionItem value="how-it-works">
          <AccordionTrigger>How Activity-Based Costing Works</AccordionTrigger>
          <AccordionContent className="text-muted-foreground">ABC provides a more accurate cost picture by assigning overhead based on the activities that cause costs to be incurred. This calculator first determines the cost per activity (e.g., cost per machine setup), then multiplies that rate by how many times a specific product uses that activity to find its share of the overhead.</AccordionContent>
        </AccordionItem>
      </Accordion>
    </div>
  );
}

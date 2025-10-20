
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
            <CardHeader>
                <CardTitle>Cost Pools & Drivers</CardTitle>
                <CardDescription>Define activities, their total costs, and how a specific product consumes them.</CardDescription>
            </CardHeader>
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
                  <Button type="button" variant="destructive" size="sm" onClick={() => remove(index)} disabled={fields.length < 2}>Remove</Button>
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
                    <p key={detail.activity} className="text-sm text-muted-foreground text-center">{detail.activity}: ${detail.rate.toFixed(2)} per {detail.unit} → ${detail.allocatedCost.toFixed(2)}</p>
                ))}
            </div>
          </CardContent>
        </Card>
      )}
       <Accordion type="single" collapsible className="w-full">
        <AccordionItem value="understanding-inputs">
            <AccordionTrigger>Understanding the Inputs</AccordionTrigger>
            <AccordionContent className="text-muted-foreground space-y-4">
                <div>
                    <h4 className="font-semibold text-foreground mb-1">Activity</h4>
                    <p>A specific task or event that drives costs (e.g., 'Machine Setups', 'Purchase Orders', 'Quality Inspections').</p>
                </div>
                <div>
                    <h4 className="font-semibold text-foreground mb-1">Total Cost ($)</h4>
                    <p>The total overhead cost associated with that specific activity pool for the period.</p>
                </div>
                 <div>
                    <h4 className="font-semibold text-foreground mb-1">Total Driver Volume & Unit</h4>
                    <p>The total number of times the activity is performed for all products (e.g., 500 total 'setups').</p>
                </div>
                <div>
                    <h4 className="font-semibold text-foreground mb-1">Product Consumption</h4>
                    <p>How many units of the cost driver the specific product you are analyzing consumes (e.g., the product requires 20 'setups').</p>
                </div>
            </AccordionContent>
        </AccordionItem>
        <AccordionItem value="how-it-works">
          <AccordionTrigger>How Activity-Based Costing Works</AccordionTrigger>
          <AccordionContent className="text-muted-foreground">
            <p>Activity-Based Costing (ABC) provides a more accurate method for allocating overhead than traditional methods. It operates in two stages:</p>
            <ol className='list-decimal list-inside space-y-2 mt-2'>
              <li><strong>Calculate Activity Rate:</strong> For each activity, it calculates a rate by dividing the `Total Cost` of the activity pool by the `Total Driver Volume`. This gives a cost per activity (e.g., $100 per machine setup).</li>
              <li><strong>Allocate Costs:</strong> It then multiplies this activity rate by the `Product Consumption` volume to assign a share of the overhead to the specific product. The total allocated cost is the sum of the costs allocated from all activity pools.</li>
            </ol>
            <p className='mt-2'>This method results in more accurate product costing, leading to better pricing decisions and profitability analysis.</p>
          </AccordionContent>
        </AccordionItem>
      </Accordion>
    </div>
  );
}

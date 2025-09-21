'use client';

import { useState } from 'react';
import { useForm, useFieldArray } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import { z } from 'zod';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Form, FormControl, FormField, FormItem, FormLabel, FormMessage } from '@/components/ui/form';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Zap, PlusCircle, XCircle } from 'lucide-react';
import { Accordion, AccordionContent, AccordionItem, AccordionTrigger } from '@/components/ui/accordion';

const componentSchema = z.object({
  name: z.string().min(1, "Name is required"),
  tdp: z.number().positive("TDP must be positive"),
});

const formSchema = z.object({
  components: z.array(componentSchema).min(1, "Add at least one component."),
});

type FormValues = z.infer<typeof formSchema>;

export default function PowerSupplyWattageCalculator() {
  const [result, setResult] = useState<number | null>(null);

  const form = useForm<FormValues>({
    resolver: zodResolver(formSchema),
    defaultValues: {
      components: [
        { name: 'CPU', tdp: 95 },
        { name: 'GPU', tdp: 250 },
        { name: 'Motherboard', tdp: 50 },
        { name: 'RAM (per stick)', tdp: 5 },
      ],
    },
  });

  const { fields, append, remove } = useFieldArray({
    control: form.control,
    name: "components"
  });

  const onSubmit = (values: FormValues) => {
    const totalTDP = values.components.reduce((sum, comp) => sum + comp.tdp, 0);
    const recommendedWattage = totalTDP * 1.2;
    setResult(Math.ceil(recommendedWattage / 50) * 50); // Round up to nearest 50W
  };

  return (
    <div className="space-y-8">
      <Card>
          <CardHeader>
              <CardTitle>PC Component Power Draw</CardTitle>
              <CardDescription>Enter the Thermal Design Power (TDP) for your major components. You can find this on the manufacturer's spec sheet.</CardDescription>
          </CardHeader>
          <CardContent>
            <Form {...form}>
                <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-6">
                <div>
                    {fields.map((field, index) => (
                        <div key={field.id} className="grid grid-cols-[1fr,100px,auto] gap-2 items-start mb-2">
                        <FormField control={form.control} name={`components.${index}.name`} render={({ field }) => (
                            <FormItem><FormLabel className="sr-only">Name</FormLabel><FormControl><Input placeholder="Component Name" {...field} /></FormControl><FormMessage /></FormItem>
                        )} />
                        <FormField control={form.control} name={`components.${index}.tdp`} render={({ field }) => (
                             <FormItem><FormLabel className="sr-only">TDP</FormLabel><FormControl><Input type="number" placeholder="TDP (Watts)" {...field} value={field.value ?? ''} onChange={e => field.onChange(parseInt(e.target.value) || 0)} /></FormControl><FormMessage /></FormItem>
                        )} />
                        <Button type="button" variant="ghost" size="icon" onClick={() => remove(index)} disabled={fields.length <= 1}>
                            <XCircle className="h-5 w-5 text-destructive" />
                        </Button>
                        </div>
                    ))}
                    <Button type="button" variant="outline" size="sm" className="mt-2" onClick={() => append({ name: '', tdp: 0 })}>
                        <PlusCircle className="mr-2 h-4 w-4" /> Add Component
                    </Button>
                </div>
                <Button type="submit">Calculate Wattage</Button>
                </form>
            </Form>
          </CardContent>
      </Card>
      
      {result !== null && (
        <Card className="mt-8">
            <CardHeader><div className='flex items-center gap-4'><Zap className="h-8 w-8 text-primary" /><CardTitle>Recommended PSU Wattage</CardTitle></div></CardHeader>
            <CardContent>
                <p className="text-3xl font-bold text-center">{result} W</p>
                <CardDescription className='mt-4 text-center'>This provides a 20% headroom over total component TDP, which is recommended for system stability and future upgrades.</CardDescription>
            </CardContent>
        </Card>
      )}

      <Accordion type="single" collapsible className="w-full">
        <AccordionItem value="how-it-works">
            <AccordionTrigger>How It Works</AccordionTrigger>
            <AccordionContent className="text-muted-foreground space-y-2">
                <p>This calculator gives a straightforward recommendation for a Power Supply Unit (PSU) for a PC build.</p>
                 <ol className="list-decimal list-inside space-y-1">
                    <li><strong>Total TDP:</strong> It sums the Thermal Design Power (TDP) in watts for all the components you list. TDP is a measure of the maximum heat a component is expected to generate, which is a good proxy for its maximum power draw.</li>
                    <li><strong>Safety Headroom:</strong> It multiplies the total TDP by 1.2. This adds a 20% "headroom" to ensure the PSU is not constantly running at its maximum capacity, which improves efficiency, lifespan, and system stability.</li>
                    <li><strong>Rounding Up:</strong> The final result is rounded up to the nearest 50 watts, as PSUs are typically sold in increments of 50W or 100W.</li>
                </ol>
            </AccordionContent>
        </AccordionItem>
      </Accordion>
    </div>
  );
}


'use client';

import { useState } from 'react';
import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import { z } from 'zod';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Form, FormControl, FormField, FormItem, FormLabel, FormMessage } from '@/components/ui/form';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Thermometer } from 'lucide-react';
import { Accordion, AccordionContent, AccordionItem, AccordionTrigger } from '@/components/ui/accordion';

const formSchema = z.object({
  thermalConductivity: z.number().positive(),
  area: z.number().positive(),
  tempDifference: z.number().positive(),
  thickness: z.number().positive(),
});

type FormValues = z.infer<typeof formSchema>;

export default function HeatTransferCalculator() {
  const [result, setResult] = useState<number | null>(null);

  const form = useForm<FormValues>({
    resolver: zodResolver(formSchema),
    defaultValues: {
      thermalConductivity: undefined,
      area: undefined,
      tempDifference: undefined,
      thickness: undefined,
    },
  });

  const onSubmit = (values: FormValues) => {
    const { thermalConductivity, area, tempDifference, thickness } = values;
    const heatTransferRate = (thermalConductivity * area * tempDifference) / thickness;
    setResult(heatTransferRate);
  };

  return (
    <div className="space-y-8">
      <Form {...form}>
        <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-6">
          <CardDescription>All inputs must be in standard metric units (W/m·K, m², K, m).</CardDescription>
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <FormField control={form.control} name="thermalConductivity" render={({ field }) => (
                <FormItem><FormLabel>Thermal Conductivity (k, W/m·K)</FormLabel><FormControl><Input type="number" {...field} value={field.value ?? ''} onChange={e => field.onChange(parseFloat(e.target.value) || undefined)} /></FormControl><FormMessage /></FormItem>
            )} />
            <FormField control={form.control} name="area" render={({ field }) => (
                <FormItem><FormLabel>Area (A, m²)</FormLabel><FormControl><Input type="number" {...field} value={field.value ?? ''} onChange={e => field.onChange(parseFloat(e.target.value) || undefined)} /></FormControl><FormMessage /></FormItem>
            )} />
            <FormField control={form.control} name="tempDifference" render={({ field }) => (
                <FormItem><FormLabel>Temperature Difference (ΔT, K or °C)</FormLabel><FormControl><Input type="number" {...field} value={field.value ?? ''} onChange={e => field.onChange(parseFloat(e.target.value) || undefined)} /></FormControl><FormMessage /></FormItem>
            )} />
            <FormField control={form.control} name="thickness" render={({ field }) => (
                <FormItem><FormLabel>Wall Thickness (d, meters)</FormLabel><FormControl><Input type="number" {...field} value={field.value ?? ''} onChange={e => field.onChange(parseFloat(e.target.value) || undefined)} /></FormControl><FormMessage /></FormItem>
            )} />
          </div>
          <Button type="submit">Calculate Heat Transfer</Button>
        </form>
      </Form>
      {result !== null && (
        <Card className="mt-8">
            <CardHeader><div className='flex items-center gap-4'><Thermometer className="h-8 w-8 text-primary" /><CardTitle>Heat Transfer Rate</CardTitle></div></CardHeader>
            <CardContent>
                <p className="text-3xl font-bold text-center">{result.toFixed(2)} Watts</p>
                <CardDescription className='mt-4 text-center'>This is the rate of heat energy moving through the material per second.</CardDescription>
            </CardContent>
        </Card>
      )}
       <Accordion type="single" collapsible className="w-full">
        <AccordionItem value="understanding-inputs">
            <AccordionTrigger>Understanding the Inputs</AccordionTrigger>
            <AccordionContent className="text-muted-foreground space-y-4">
                <div>
                    <h4 className="font-semibold text-foreground mb-1">Thermal Conductivity (k)</h4>
                    <p>A property of a material that indicates its ability to conduct heat. You can find this value in engineering handbooks or online material property databases. Units: W/m·K.</p>
                    <ul className="list-disc list-inside space-y-1 pl-4 mt-1">
                        <li><strong>Copper:</strong> ~400</li>
                        <li><strong>Concrete:</strong> ~1.7</li>
                        <li><strong>Glass:</strong> ~1.1</li>
                        <li><strong>Fiberglass Insulation:</strong> ~0.04</li>
                    </ul>
                </div>
                <div>
                    <h4 className="font-semibold text-foreground mb-1">Area (A)</h4>
                    <p>The cross-sectional area through which heat is being transferred, in square meters (m²).</p>
                </div>
                <div>
                    <h4 className="font-semibold text-foreground mb-1">Temperature Difference (ΔT)</h4>
                    <p>The difference in temperature between the two sides of the material. Since it's a difference, you can use either Kelvin (K) or Celsius (°C) as the units are equivalent for changes in temperature.</p>
                </div>
                 <div>
                    <h4 className="font-semibold text-foreground mb-1">Wall Thickness (d)</h4>
                    <p>The thickness of the material that the heat must travel through, in meters (m).</p>
                </div>
            </AccordionContent>
        </AccordionItem>
        <AccordionItem value="how-it-works">
            <AccordionTrigger>How It Works</AccordionTrigger>
            <AccordionContent className="text-muted-foreground space-y-2">
                <p>This calculator uses Fourier's Law of Conduction to find the steady-state heat transfer rate through a flat material (like a wall).</p>
                <p className='font-mono p-4 bg-muted rounded-md'>Q = (k * A * ΔT) / d</p>
                 <ul className="list-disc list-inside space-y-1 pl-4">
                    <li><strong>Q</strong> is the heat transfer rate in Watts (Joules per second).</li>
                    <li><strong>k</strong> is the thermal conductivity of the material.</li>
                    <li><strong>A</strong> is the cross-sectional area.</li>
                    <li><strong>ΔT</strong> is the temperature difference.</li>
                    <li><strong>d</strong> is the thickness of the material.</li>
                </ul>
            </AccordionContent>
        </AccordionItem>
      </Accordion>
    </div>
  );
}

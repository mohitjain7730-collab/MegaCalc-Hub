
'use client';

import { useState } from 'react';
import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import { z } from 'zod';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Form, FormControl, FormField, FormItem, FormLabel, FormMessage } from '@/components/ui/form';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Recycle } from 'lucide-react';
import { Accordion, AccordionContent, AccordionItem, AccordionTrigger } from '@/components/ui/accordion';

// Savings per ton of material (approximations from EPA data)
const savingsFactors = {
  paper: { kwh: 4100, water_gallons: 7000, co2_kg: 1000 },
  plastic: { kwh: 5774, water_gallons: 2500, co2_kg: 1000 },
  glass: { kwh: 42, water_gallons: 10, co2_kg: 250 },
  aluminum: { kwh: 14000, water_gallons: 1600, co2_kg: 9000 },
};

const formSchema = z.object({
  paper: z.number().nonnegative().optional(),
  plastic: z.number().nonnegative().optional(),
  glass: z.number().nonnegative().optional(),
  aluminum: z.number().nonnegative().optional(),
});

type FormValues = z.infer<typeof formSchema>;
type Result = { kwh: number; water_gallons: number; co2_kg: number };

export default function RecyclingImpactCalculator() {
  const [result, setResult] = useState<Result | null>(null);

  const form = useForm<FormValues>({
    resolver: zodResolver(formSchema),
    defaultValues: { paper: undefined, plastic: undefined, glass: undefined, aluminum: undefined },
  });

  const onSubmit = (values: FormValues) => {
    const kgToTon = 0.00110231;
    const totalSavings: Result = { kwh: 0, water_gallons: 0, co2_kg: 0 };

    Object.keys(values).forEach(keyStr => {
        const key = keyStr as keyof FormValues;
        const amount = values[key] || 0;
        if (amount > 0) {
            const factors = savingsFactors[key as keyof typeof savingsFactors];
            const tons = amount * kgToTon;
            totalSavings.kwh += tons * factors.kwh;
            totalSavings.water_gallons += tons * factors.water_gallons;
            totalSavings.co2_kg += tons * factors.co2_kg;
        }
    });
    setResult(totalSavings);
  };

  return (
    <div className="space-y-8">
      <Form {...form}>
        <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-6">
          <CardDescription>Enter the weight of materials you recycle each month (in kg) to see your environmental impact.</CardDescription>
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <FormField control={form.control} name="paper" render={({ field }) => (
                <FormItem><FormLabel>Paper & Cardboard (kg)</FormLabel><FormControl><Input type="number" placeholder="e.g., 5" {...field} value={field.value ?? ''} onChange={e => field.onChange(parseFloat(e.target.value) || undefined)} /></FormControl><FormMessage /></FormItem>
            )} />
            <FormField control={form.control} name="plastic" render={({ field }) => (
                <FormItem><FormLabel>Plastic (kg)</FormLabel><FormControl><Input type="number" placeholder="e.g., 2" {...field} value={field.value ?? ''} onChange={e => field.onChange(parseFloat(e.target.value) || undefined)} /></FormControl><FormMessage /></FormItem>
            )} />
            <FormField control={form.control} name="glass" render={({ field }) => (
                <FormItem><FormLabel>Glass (kg)</FormLabel><FormControl><Input type="number" placeholder="e.g., 3" {...field} value={field.value ?? ''} onChange={e => field.onChange(parseFloat(e.target.value) || undefined)} /></FormControl><FormMessage /></FormItem>
            )} />
            <FormField control={form.control} name="aluminum" render={({ field }) => (
                <FormItem><FormLabel>Aluminum Cans (kg)</FormLabel><FormControl><Input type="number" placeholder="e.g., 1" {...field} value={field.value ?? ''} onChange={e => field.onChange(parseFloat(e.target.value) || undefined)} /></FormControl><FormMessage /></FormItem>
            )} />
          </div>
          <Button type="submit">Calculate Impact</Button>
        </form>
      </Form>
      
      {result !== null && (
        <Card className="mt-8">
            <CardHeader><div className='flex items-center gap-4'><Recycle className="h-8 w-8 text-primary" /><CardTitle>Your Estimated Monthly Impact</CardTitle></div></CardHeader>
            <CardContent>
                <div className="grid grid-cols-1 md:grid-cols-3 gap-4 text-center">
                    <div>
                        <p className="text-muted-foreground">Energy Saved</p>
                        <p className="text-2xl font-bold">{result.kwh.toFixed(0)} kWh</p>
                        <CardDescription className="text-xs mt-1">Enough to power an average home for {(result.kwh / 900).toFixed(1)} days.</CardDescription>
                    </div>
                     <div>
                        <p className="text-muted-foreground">Water Saved</p>
                        <p className="text-2xl font-bold">{result.water_gallons.toFixed(0)} Gallons</p>
                         <CardDescription className="text-xs mt-1">Equivalent to {(result.water_gallons / 2).toFixed(0)} 8-minute showers.</CardDescription>
                    </div>
                     <div>
                        <p className="text-muted-foreground">CO₂ Emissions Reduced</p>
                        <p className="text-2xl font-bold">{result.co2_kg.toFixed(0)} kg</p>
                         <CardDescription className="text-xs mt-1">Like taking a car off the road for {(result.co2_kg / 13).toFixed(1)} days.</CardDescription>
                    </div>
                </div>
            </CardContent>
        </Card>
      )}

      <Accordion type="single" collapsible className="w-full">
         <AccordionItem value="understanding-inputs">
            <AccordionTrigger>Understanding the Inputs</AccordionTrigger>
            <AccordionContent className="text-muted-foreground space-y-4">
              <p>Enter the total weight in kilograms (kg) for each type of material you typically recycle in a month.</p>
            </AccordionContent>
        </AccordionItem>
        <AccordionItem value="how-it-works">
            <AccordionTrigger>How It Works</AccordionTrigger>
            <AccordionContent className="text-muted-foreground">
                <p>This calculator uses data from environmental agencies like the EPA to estimate the resources saved when you recycle. Manufacturing goods from recycled materials uses significantly less energy and water and produces fewer greenhouse gas emissions than making them from virgin raw materials. The calculator multiplies the weight of the material you recycle by these savings factors to quantify your positive impact.</p>
            </AccordionContent>
        </AccordionItem>
      </Accordion>
    </div>
  );
}

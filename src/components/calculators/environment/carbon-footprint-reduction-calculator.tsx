
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
import { Leaf } from 'lucide-react';
import { Accordion, AccordionContent, AccordionItem, AccordionTrigger } from '@/components/ui/accordion';

// Emission factors (approximations)
const emissionFactors = {
  driving: 0.12, // kg CO2e per km
  flightShort: 250, // kg CO2e per short-haul round trip
  flightLong: 1000, // kg CO2e per long-haul round trip
  diet: {
    high: 3300, // kg CO2e per year
    medium: 2500, // kg CO2e per year
    low: 1800, // kg CO2e per year
  },
};

const formSchema = z.object({
  drivingKm: z.number().nonnegative().optional(),
  flightsShort: z.number().int().nonnegative().optional(),
  flightsLong: z.number().int().nonnegative().optional(),
  diet: z.enum(['high', 'medium', 'low']),
});

type FormValues = z.infer<typeof formSchema>;

export default function CarbonFootprintCalculator() {
  const [result, setResult] = useState<{ total: number; driving: number; flights: number; diet: number } | null>(null);

  const form = useForm<FormValues>({
    resolver: zodResolver(formSchema),
    defaultValues: {
      drivingKm: undefined,
      flightsShort: undefined,
      flightsLong: undefined,
      diet: 'medium',
    },
  });

  const onSubmit = (values: FormValues) => {
    const drivingFootprint = (values.drivingKm || 0) * 52 * emissionFactors.driving;
    const flightsFootprint = ((values.flightsShort || 0) * emissionFactors.flightShort) + ((values.flightsLong || 0) * emissionFactors.flightLong);
    const dietFootprint = emissionFactors.diet[values.diet];
    
    const totalFootprint = drivingFootprint + flightsFootprint + dietFootprint;

    setResult({
        total: totalFootprint,
        driving: drivingFootprint,
        flights: flightsFootprint,
        diet: dietFootprint,
    });
  };

  return (
    <div className="space-y-8">
      <Form {...form}>
        <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-6">
          <CardDescription>Estimate your annual carbon footprint from key lifestyle areas.</CardDescription>
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <FormField control={form.control} name="drivingKm" render={({ field }) => (
                <FormItem><FormLabel>Weekly Driving Distance (km)</FormLabel><FormControl><Input type="number" placeholder="e.g., 100" {...field} value={field.value ?? ''} onChange={e => field.onChange(parseFloat(e.target.value) || undefined)} /></FormControl><FormMessage /></FormItem>
            )} />
            <FormField control={form.control} name="diet" render={({ field }) => (
                <FormItem>
                    <FormLabel>Diet</FormLabel>
                    <Select onValueChange={field.onChange} defaultValue={field.value}>
                        <FormControl><SelectTrigger><SelectValue /></SelectTrigger></FormControl>
                        <SelectContent>
                            <SelectItem value="high">High Meat Consumption</SelectItem>
                            <SelectItem value="medium">Average (Mixed)</SelectItem>
                            <SelectItem value="low">Vegetarian/Vegan</SelectItem>
                        </SelectContent>
                    </Select>
                </FormItem>
            )} />
            <FormField control={form.control} name="flightsShort" render={({ field }) => (
                <FormItem><FormLabel>Short-Haul Flights per Year</FormLabel><FormControl><Input type="number" placeholder="e.g., 2" {...field} value={field.value ?? ''} onChange={e => field.onChange(parseInt(e.target.value) || undefined)} /></FormControl><FormMessage /></FormItem>
            )} />
             <FormField control={form.control} name="flightsLong" render={({ field }) => (
                <FormItem><FormLabel>Long-Haul Flights per Year</FormLabel><FormControl><Input type="number" placeholder="e.g., 1" {...field} value={field.value ?? ''} onChange={e => field.onChange(parseInt(e.target.value) || undefined)} /></FormControl><FormMessage /></FormItem>
            )} />
          </div>
          <Button type="submit">Calculate Footprint</Button>
        </form>
      </Form>
      
      {result !== null && (
        <Card className="mt-8">
            <CardHeader><div className='flex items-center gap-4'><Leaf className="h-8 w-8 text-primary" /><CardTitle>Estimated Annual Carbon Footprint</CardTitle></div></CardHeader>
            <CardContent>
                <div className="text-center space-y-2">
                    <p className="text-4xl font-bold">{result.total.toFixed(0)} kg CO₂e</p>
                    <CardDescription>This is your estimated carbon equivalent emissions per year.</CardDescription>
                </div>
                 <div className="mt-6 grid grid-cols-3 gap-4 text-center">
                    <div><p className='font-semibold text-muted-foreground'>Driving</p><p>{result.driving.toFixed(0)} kg</p></div>
                    <div><p className='font-semibold text-muted-foreground'>Flights</p><p>{result.flights.toFixed(0)} kg</p></div>
                    <div><p className='font-semibold text-muted-foreground'>Diet</p><p>{result.diet.toFixed(0)} kg</p></div>
                </div>
            </CardContent>
        </Card>
      )}

      <Accordion type="single" collapsible className="w-full">
         <AccordionItem value="understanding-inputs">
            <AccordionTrigger>Understanding the Inputs</AccordionTrigger>
            <AccordionContent className="text-muted-foreground space-y-4">
              <div><h4 className="font-semibold text-foreground">Weekly Driving Distance</h4><p>Your average distance driven per week in a standard gasoline car.</p></div>
              <div><h4 className="font-semibold text-foreground">Diet</h4><p>Your general dietary habits. Meat, especially red meat, has a significantly higher carbon footprint than plant-based foods.</p></div>
              <div><h4 className="font-semibold text-foreground">Flights per Year</h4><p>The number of round-trip flights you take. A short-haul flight is typically under 3 hours, while a long-haul is over 6 hours.</p></div>
            </AccordionContent>
        </AccordionItem>
        <AccordionItem value="how-it-works">
            <AccordionTrigger>How It Works</AccordionTrigger>
            <AccordionContent className="text-muted-foreground">
                <p>This calculator provides a simplified estimate of your carbon footprint. It multiplies your inputs by standard emission factors for each activity to calculate the emissions in kilograms of carbon dioxide equivalent (kg CO₂e). The total is the sum of emissions from driving, flying, and diet.</p>
                <CardDescription className="mt-2 text-xs">Note: These are rough estimates. Real-world emissions vary based on car model, flight details, specific food choices, and many other factors.</CardDescription>
            </AccordionContent>
        </AccordionItem>
      </Accordion>
    </div>
  );
}

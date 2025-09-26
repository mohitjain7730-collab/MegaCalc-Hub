
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
import { Droplets } from 'lucide-react';
import { Accordion, AccordionContent, AccordionItem, AccordionTrigger } from '@/components/ui/accordion';

// Data from Water Footprint Network (waterfootprint.org), global averages in liters/kg
const foodWaterFootprints = {
  beef: { name: 'Beef', value: 15415, green: 0.94, blue: 0.04, grey: 0.02 },
  pork: { name: 'Pork', value: 5988, green: 0.90, blue: 0.07, grey: 0.03 },
  chicken: { name: 'Chicken', value: 4325, green: 0.82, blue: 0.12, grey: 0.06 },
  rice: { name: 'Rice', value: 2497, green: 0.45, blue: 0.48, grey: 0.07 },
  wheat: { name: 'Wheat Bread', value: 1608, green: 0.70, blue: 0.19, grey: 0.11 },
  soybeans: { name: 'Soybeans', value: 2145, green: 0.97, blue: 0.01, grey: 0.02 },
  potatoes: { name: 'Potatoes', value: 287, green: 0.55, blue: 0.23, grey: 0.22 },
  lettuce: { name: 'Lettuce', value: 237, green: 0.57, blue: 0.29, grey: 0.14 },
  tomatoes: { name: 'Tomatoes', value: 214, green: 0.35, blue: 0.50, grey: 0.15 },
  milk: { name: 'Milk', value: 1020, green: 0.85, blue: 0.08, grey: 0.07 },
  cheese: { name: 'Cheese', value: 5060, green: 0.85, blue: 0.08, grey: 0.07 }, // Assumes milk ratios
  eggs: { name: 'Eggs', value: 3265, green: 0.83, blue: 0.11, grey: 0.06 }, // Assumes chicken ratios
};

const formSchema = z.object({
  food: z.string().min(1),
  quantity: z.number().positive(),
});

type FormValues = z.infer<typeof formSchema>;
type Result = {
    total: number;
    green: number;
    blue: number;
    grey: number;
};

export default function SustainableDietImpactCalculator() {
  const [result, setResult] = useState<Result | null>(null);

  const form = useForm<FormValues>({
    resolver: zodResolver(formSchema),
    defaultValues: {
      food: 'beef',
      quantity: 1,
    },
  });

  const onSubmit = (values: FormValues) => {
    const foodData = foodWaterFootprints[values.food as keyof typeof foodWaterFootprints];
    const total = foodData.value * values.quantity;
    setResult({
        total,
        green: total * foodData.green,
        blue: total * foodData.blue,
        grey: total * foodData.grey,
    });
  };

  return (
    <div className="space-y-8">
      <Form {...form}>
        <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-6">
          <CardDescription>Estimate the total volume of water required to produce different food items.</CardDescription>
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <FormField control={form.control} name="food" render={({ field }) => (
                <FormItem>
                  <FormLabel>Food Item</FormLabel>
                  <Select onValueChange={field.onChange} defaultValue={field.value}>
                    <FormControl><SelectTrigger><SelectValue /></SelectTrigger></FormControl>
                    <SelectContent>
                        {Object.entries(foodWaterFootprints).map(([key, data]) => (
                            <SelectItem key={key} value={key}>{data.name}</SelectItem>
                        ))}
                    </SelectContent>
                  </Select>
                </FormItem>
            )} />
            <FormField control={form.control} name="quantity" render={({ field }) => (
                <FormItem><FormLabel>Quantity (kg)</FormLabel><FormControl><Input type="number" placeholder="e.g., 1" {...field} value={field.value ?? ''} onChange={e => field.onChange(parseFloat(e.target.value) || undefined)} /></FormControl><FormMessage /></FormItem>
            )} />
          </div>
          <Button type="submit">Calculate Footprint</Button>
        </form>
      </Form>
      
      {result && (
        <Card className="mt-8">
            <CardHeader><div className='flex items-center gap-4'><Droplets className="h-8 w-8 text-primary" /><CardTitle>Estimated Water Footprint</CardTitle></div></CardHeader>
            <CardContent>
                <div className="text-center space-y-2">
                    <p className="text-4xl font-bold">{result.total.toLocaleString(undefined, {maximumFractionDigits: 0})} Liters</p>
                    <CardDescription>To produce {form.getValues('quantity')}kg of {foodWaterFootprints[form.getValues('food') as keyof typeof foodWaterFootprints].name}.</CardDescription>
                </div>
                 <div className="mt-6 grid grid-cols-3 gap-4 text-center">
                    <div><p className='font-semibold text-green-500'>Green</p><p>{result.green.toLocaleString(undefined, {maximumFractionDigits: 0})} L</p></div>
                    <div><p className='font-semibold text-blue-500'>Blue</p><p>{result.blue.toLocaleString(undefined, {maximumFractionDigits: 0})} L</p></div>
                    <div><p className='font-semibold text-gray-500'>Grey</p><p>{result.grey.toLocaleString(undefined, {maximumFractionDigits: 0})} L</p></div>
                </div>
            </CardContent>
        </Card>
      )}

      <Accordion type="single" collapsible className="w-full">
         <AccordionItem value="understanding-inputs">
            <AccordionTrigger>Understanding the Inputs</AccordionTrigger>
            <AccordionContent className="text-muted-foreground space-y-4">
              <div><h4 className="font-semibold text-foreground">Food Item</h4><p>Select the type of food for which you want to calculate the water footprint.</p></div>
              <div><h4 className="font-semibold text-foreground">Quantity (kg)</h4><p>The weight of the food item in kilograms.</p></div>
            </AccordionContent>
        </AccordionItem>
        <AccordionItem value="how-it-works">
            <AccordionTrigger>How It Works & Water Types</AccordionTrigger>
            <AccordionContent className="text-muted-foreground space-y-4">
                <p>This calculator uses global average data from the Water Footprint Network to estimate the volume of water required to produce different food items. The total footprint is broken down into three components:</p>
                 <ul className="list-disc list-inside space-y-2">
                    <li><strong className='text-green-500'>Green Water:</strong> The volume of rainwater consumed (e.g., for crop growth). This is the water from precipitation that is stored in the root zone of the soil and evaporated, transpired or incorporated by plants.</li>
                    <li><strong className='text-blue-500'>Blue Water:</strong> The volume of surface and groundwater withdrawn from rivers, lakes, or aquifers for irrigation.</li>
                    <li><strong className='text-gray-500'>Grey Water:</strong> The volume of freshwater required to assimilate pollutants (e.g., from fertilizer runoff) to meet specific water quality standards.</li>
                </ul>
                <CardDescription className="mt-2 text-xs">Note: These are global averages. The actual water footprint can vary significantly based on the region of production, farming techniques, and other factors.</CardDescription>
            </AccordionContent>
        </AccordionItem>
      </Accordion>
    </div>
  );
}

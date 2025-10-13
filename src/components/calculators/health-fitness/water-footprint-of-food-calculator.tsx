
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
import Link from 'next/link';

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

export default function WaterFootprintOfFoodCalculator() {
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
                <FormItem><FormLabel>Quantity (kg)</FormLabel><FormControl><Input type="number" {...field} value={field.value ?? ''} onChange={e => field.onChange(parseFloat(e.target.value) || undefined)} /></FormControl><FormMessage /></FormItem>
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
              <div>
                  <h4 className="font-semibold text-foreground mb-1">Food Item</h4>
                  <p>Select the type of food for which you want to calculate the water footprint.</p>
              </div>
              <div>
                  <h4 className="font-semibold text-foreground mb-1">Quantity (kg)</h4>
                  <p>The weight of the food item in kilograms.</p>
              </div>
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
                <CardDescription>Note: These are global averages. The actual water footprint can vary significantly based on the region of production, farming techniques, and other factors.</CardDescription>
            </AccordionContent>
        </AccordionItem>
        <AccordionItem value="further-reading">
            <AccordionTrigger>Further Reading & Official Sources</AccordionTrigger>
            <AccordionContent className="text-muted-foreground space-y-2">
              <p>For more detailed information, databases, and research on water footprints, consult these authoritative sources:</p>
               <ul className="list-disc list-inside space-y-1 pl-4">
                  <li><a href="https://waterfootprint.org/en/water-footprint/what-is-water-footprint/" target="_blank" rel="noopener noreferrer" className="text-primary underline">Water Footprint Network</a></li>
                  <li><a href="https://www.fao.org/aquastat/en/" target="_blank" rel="noopener noreferrer" className="text-primary underline">FAO AQUASTAT</a></li>
                  <li><a href="https://waterfootprint.org/media/downloads/Hoekstra_2008_WaterFootprintOfFood.pdf" target="_blank" rel="noopener noreferrer" className="text-primary underline">Study: "The Water Footprint of Food" by Arjen Y. Hoekstra (2008)</a></li>
              </ul>
            </AccordionContent>
        </AccordionItem>
      </Accordion>
      <section
        className="space-y-4 text-muted-foreground leading-relaxed"
        itemScope
        itemType="https://schema.org/Article"
      >
        <meta itemProp="headline" content="Water Footprint of Food – Understand Green, Blue, and Grey Water" />
        <meta itemProp="author" content="MegaCalc Hub Team" />
        <meta itemProp="about" content="How different foods use water, why location matters, and how to lower your dietary water footprint without compromising nutrition." />

        <h2 itemProp="name" className="text-xl font-bold text-foreground">What Is the Water Footprint of Food?</h2>
        <p itemProp="description">It’s the total volume of freshwater used to produce food, including rainwater (green), irrigation (blue), and water to dilute pollution (grey). Values vary by region, farming method, and yield.</p>

        <h3 className="font-semibold text-foreground mt-6">How to Interpret Results</h3>
        <ul className="list-disc ml-6 space-y-1">
          <li>Compare similar foods (e.g., beef vs chicken vs legumes) to find lower‑impact swaps.</li>
          <li>Consider nutrition per liter: protein, vitamins, and minerals matter—don’t optimize water alone.</li>
          <li>Local conditions can outweigh global averages—water scarcity makes blue water more critical.</li>
        </ul>

        <h3 className="font-semibold text-foreground mt-6">Ways to Reduce Your Dietary Water Footprint</h3>
        <ul className="list-disc ml-6 space-y-1">
          <li>Shift some animal protein to legumes, soy, eggs, or poultry where appropriate.</li>
          <li>Choose seasonal and local produce to reduce blue/grey water burdens.</li>
          <li>Cut food waste: plan menus, store properly, and use leftovers creatively.</li>
        </ul>

        <h3 className="font-semibold text-foreground mt-6">Related Tools</h3>
        <div className="space-y-2">
          <p><Link href="/category/health-fitness/carbohydrate-intake-calculator" className="text-primary underline">Carbohydrate Intake Calculator</Link></p>
          <p><Link href="/category/health-fitness/protein-intake-calculator" className="text-primary underline">Protein Intake Calculator</Link></p>
        </div>
      </section>
    </div>
  );
}


'use client';

import { useState } from 'react';
import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import { z } from 'zod';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Form, FormControl, FormField, FormItem, FormLabel, FormMessage } from '@/components/ui/form';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Beaker } from 'lucide-react';
import { Accordion, AccordionContent, AccordionItem, AccordionTrigger } from '@/components/ui/accordion';

const formSchema = z.object({
  waterVolume: z.number().positive(),
  concentration: z.number().min(1).max(20),
  sugarPercent: z.number().min(0).max(100).optional(),
});

type FormValues = z.infer<typeof formSchema>;

interface Result {
  saltGrams: number;
  sugarGrams?: number;
}

export default function BriningSolutionCalculator() {
  const [result, setResult] = useState<Result | null>(null);

  const form = useForm<FormValues>({
    resolver: zodResolver(formSchema),
    defaultValues: {
      waterVolume: undefined,
      concentration: 5,
      sugarPercent: undefined,
    },
  });

  const onSubmit = (values: FormValues) => {
    const { waterVolume, concentration, sugarPercent } = values;
    const saltGrams = waterVolume * concentration * 10;
    let sugarGrams;
    if (sugarPercent) {
      sugarGrams = saltGrams * (sugarPercent / 100);
    }
    setResult({ saltGrams, sugarGrams });
  };

  return (
    <div className="space-y-8">
      <Form {...form}>
        <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-6">
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <FormField control={form.control} name="waterVolume" render={({ field }) => (
                <FormItem><FormLabel>Water Volume (Liters)</FormLabel><FormControl><Input type="number" placeholder="e.g., 4" {...field} value={field.value ?? ''} onChange={e => field.onChange(parseFloat(e.target.value) || undefined)} /></FormControl><FormMessage /></FormItem>
            )} />
            <FormField control={form.control} name="concentration" render={({ field }) => (
                <FormItem><FormLabel>Desired Brine Concentration (%)</FormLabel><FormControl><Input type="number" placeholder="e.g., 5" {...field} value={field.value ?? ''} onChange={e => field.onChange(parseFloat(e.target.value) || undefined)} /></FormControl><FormMessage /></FormItem>
            )} />
            <FormField control={form.control} name="sugarPercent" render={({ field }) => (
                <FormItem className="md:col-span-2"><FormLabel>Sugar (as % of salt weight, optional)</FormLabel><FormControl><Input type="number" placeholder="e.g., 50 for 50%" {...field} value={field.value ?? ''} onChange={e => field.onChange(parseFloat(e.target.value) || undefined)} /></FormControl><FormMessage /></FormItem>
            )} />
          </div>
          <Button type="submit">Calculate Solution</Button>
        </form>
      </Form>

      {result && (
        <Card className="mt-8">
            <CardHeader><div className='flex items-center gap-4'><Beaker className="h-8 w-8 text-primary" /><CardTitle>Your Brine Recipe</CardTitle></div></CardHeader>
            <CardContent>
                <CardDescription>For {form.getValues('waterVolume')} liters of water:</CardDescription>
                <ul className="mt-4 text-center space-y-4">
                    <li className="p-4 bg-muted rounded-lg">
                        <p className="font-bold text-xl">Salt</p>
                        <p className="text-3xl font-bold">{result.saltGrams.toFixed(1)} g</p>
                    </li>
                    {result.sugarGrams !== undefined && (
                         <li className="p-4 bg-muted rounded-lg">
                            <p className="font-bold text-xl">Sugar</p>
                            <p className="text-3xl font-bold">{result.sugarGrams.toFixed(1)} g</p>
                        </li>
                    )}
                </ul>
            </CardContent>
        </Card>
      )}
       <Accordion type="single" collapsible className="w-full">
        <AccordionItem value="understanding-inputs">
            <AccordionTrigger>Understanding the Inputs</AccordionTrigger>
            <AccordionContent className="text-muted-foreground space-y-4">
              <div><h4 className="font-semibold text-foreground">Water Volume (Liters)</h4><p>The total amount of water you will use for your brine.</p></div>
              <div><h4 className="font-semibold text-foreground">Desired Brine Concentration (%)</h4><p>The strength of the brine, expressed as a percentage of salt to water by weight. A 5% brine is common for poultry.</p></div>
              <div><h4 className="font-semibold text-foreground">Sugar (% of salt weight, optional)</h4><p>If you want to add sugar for flavor and browning, enter the amount as a percentage of the salt's weight. For example, entering '50' would add half as much sugar as salt by weight.</p></div>
            </AccordionContent>
        </AccordionItem>
        <AccordionItem value="how-it-works">
            <AccordionTrigger>How It Works</AccordionTrigger>
            <AccordionContent className="text-muted-foreground">
                <p>The calculator uses the standard formula for creating a brine solution based on percentage. Since 1 liter of water weighs 1000 grams, a 1% brine requires 10 grams of salt per liter. The calculator multiplies your desired concentration by this factor and the total volume of water to determine the required weight of salt. The sugar is then calculated based on your specified percentage of the salt's weight.</p>
            </AccordionContent>
        </AccordionItem>
      </Accordion>
    </div>
  );
}

    
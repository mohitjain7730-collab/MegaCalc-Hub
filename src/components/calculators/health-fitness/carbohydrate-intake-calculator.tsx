
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
import { Wheat } from 'lucide-react';
import { Accordion, AccordionContent, AccordionItem, AccordionTrigger } from '@/components/ui/accordion';

const activityLevels = {
    low: { name: 'Low Intensity / Sedentary', range: '2-3' },
    moderate: { name: 'Moderate Activity (~1 hr/day)', range: '3-5' },
    high: { name: 'High Activity (1-3 hr/day)', range: '5-8' },
    veryHigh: { name: 'Very High Activity (4-5+ hr/day)', range: '8-10' },
};

type ActivityLevel = keyof typeof activityLevels;

const formSchema = z.object({
  weight: z.number().positive(),
  unit: z.enum(['kg', 'lbs']),
  activityLevel: z.string(),
});

type FormValues = z.infer<typeof formSchema>;

export default function CarbohydrateIntakeCalculator() {
  const [result, setResult] = useState<{ min: number; max: number } | null>(null);

  const form = useForm<FormValues>({
    resolver: zodResolver(formSchema),
    defaultValues: {
      unit: 'kg',
      activityLevel: 'moderate',
    },
  });

  const onSubmit = (values: FormValues) => {
    let weightInKg = values.weight;
    if (values.unit === 'lbs') {
      weightInKg = values.weight / 2.20462;
    }
    
    const activity = activityLevels[values.activityLevel as ActivityLevel];
    const [minMultiplier, maxMultiplier] = activity.range.split('-').map(Number);
    
    setResult({
        min: weightInKg * minMultiplier,
        max: weightInKg * maxMultiplier,
    });
  };
  
  const unit = form.watch('unit');

  return (
    <div className="space-y-8">
      <Form {...form}>
        <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-6">
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <FormField control={form.control} name="weight" render={({ field }) => (<FormItem><FormLabel>Weight ({unit})</FormLabel><FormControl><Input type="number" {...field} value={field.value ?? ''} onChange={e => field.onChange(parseFloat(e.target.value) || undefined)} /></FormControl><FormMessage /></FormItem>)} />
            <FormField control={form.control} name="activityLevel" render={({ field }) => (
                <FormItem>
                  <FormLabel>Activity Level</FormLabel>
                  <Select onValueChange={field.onChange} defaultValue={field.value}>
                    <FormControl><SelectTrigger><SelectValue /></SelectTrigger></FormControl>
                    <SelectContent>
                        {Object.entries(activityLevels).map(([key, value]) => (
                            <SelectItem key={key} value={key}>{value.name}</SelectItem>
                        ))}
                    </SelectContent>
                  </Select>
                </FormItem>
            )} />
             <FormField control={form.control} name="unit" render={({ field }) => (
                <FormItem className="md:col-span-2">
                  <FormLabel>Unit</FormLabel>
                  <Select onValueChange={field.onChange} defaultValue={field.value}>
                    <FormControl><SelectTrigger><SelectValue /></SelectTrigger></FormControl>
                    <SelectContent>
                      <SelectItem value="kg">Kilograms (kg)</SelectItem>
                      <SelectItem value="lbs">Pounds (lbs)</SelectItem>
                    </SelectContent>
                  </Select>
                </FormItem>
            )} />
          </div>
          <Button type="submit">Calculate</Button>
        </form>
      </Form>
      {result && (
        <Card className="mt-8">
            <CardHeader><div className='flex items-center gap-4'><Wheat className="h-8 w-8 text-primary" /><CardTitle>Recommended Daily Carbohydrate Intake</CardTitle></div></CardHeader>
            <CardContent>
                <div className="text-center space-y-2">
                    <p className="text-4xl font-bold">{result.min.toFixed(0)} - {result.max.toFixed(0)} g</p>
                    <CardDescription>This range is based on your body weight and activity level to properly fuel performance and recovery.</CardDescription>
                </div>
            </CardContent>
        </Card>
      )}
       <Accordion type="single" collapsible className="w-full">
         <AccordionItem value="understanding-inputs">
            <AccordionTrigger>Understanding the Inputs</AccordionTrigger>
            <AccordionContent className="text-muted-foreground space-y-4">
              <div>
                  <h4 className="font-semibold text-foreground mb-1">Weight & Unit</h4>
                  <p>Your current body weight is used as the basis for calculating your carbohydrate needs.</p>
              </div>
               <div>
                  <h4 className="font-semibold text-foreground mb-1">Daily Activity Level</h4>
                  <p>Choose the level that best describes your daily physical activity. Carbohydrates are the body's primary fuel source, so your needs increase significantly with activity level.</p>
              </div>
            </AccordionContent>
        </AccordionItem>
        <AccordionItem value="how-it-works">
            <AccordionTrigger>How It Works</AccordionTrigger>
            <AccordionContent className="text-muted-foreground">
                <p>This calculator uses evidence-based guidelines from sports nutrition to estimate daily carbohydrate needs. The formula multiplies your body weight in kilograms by a factor that corresponds to your activity level. This provides a recommended range in grams per day.</p>
            </AccordionContent>
        </AccordionItem>
      </Accordion>
    </div>
  );
}

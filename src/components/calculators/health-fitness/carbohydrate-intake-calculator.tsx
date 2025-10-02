
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
import { Utensils } from 'lucide-react';
import { Accordion, AccordionContent, AccordionItem, AccordionTrigger } from '@/components/ui/accordion';

const activityLevels = {
  low: { min: 2, max: 3, description: 'Low Intensity / Sedentary' },
  moderate: { min: 3, max: 5, description: 'Moderate Activity (~1 hr/day)' },
  high: { min: 5, max: 8, description: 'High Activity (1-3 hr/day)' },
  veryHigh: { min: 8, max: 10, description: 'Very High Activity (4-5+ hr/day)' },
};

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
      activityLevel: 'moderate',
    },
  });

  const onSubmit = (values: FormValues) => {
    let weightInKg = values.weight;
    if (values.unit === 'lbs') {
      weightInKg *= 0.453592;
    }
    
    const level = activityLevels[values.activityLevel as keyof typeof activityLevels];
    
    setResult({
        min: weightInKg * level.min,
        max: weightInKg * level.max,
    });
  };
  
  const unit = form.watch('unit');

  return (
    <div className="space-y-8">
      <Form {...form}>
        <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-6">
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <FormField control={form.control} name="weight" render={({ field }) => (
                <FormItem><FormLabel>Weight ({unit})</FormLabel><FormControl><Input type="number" {...field} value={field.value ?? ''} onChange={e => field.onChange(parseFloat(e.target.value) || undefined)} /></FormControl><FormMessage /></FormItem>
            )} />
             <FormField control={form.control} name="unit" render={({ field }) => (
                <FormItem><FormLabel>Unit</FormLabel><Select onValueChange={field.onChange} defaultValue={field.value}><FormControl><SelectTrigger><SelectValue /></SelectTrigger></FormControl><SelectContent><SelectItem value="kg">Kilograms (kg)</SelectItem><SelectItem value="lbs">Pounds (lbs)</SelectItem></SelectContent></Select></FormItem>
            )} />
            <FormField control={form.control} name="activityLevel" render={({ field }) => (
                <FormItem className="md:col-span-2"><FormLabel>Daily Activity Level</FormLabel><Select onValueChange={field.onChange} defaultValue={field.value}><FormControl><SelectTrigger><SelectValue /></SelectTrigger></FormControl><SelectContent>{Object.entries(activityLevels).map(([key, value]) => <SelectItem key={key} value={key}>{value.description}</SelectItem>)}</SelectContent></Select></FormItem>
            )} />
          </div>
          <Button type="submit">Calculate</Button>
        </form>
      </Form>
      {result && (
        <Card className="mt-8">
            <CardHeader><div className='flex items-center gap-4'><Utensils className="h-8 w-8 text-primary" /><CardTitle>Recommended Daily Carb Intake</CardTitle></div></CardHeader>
            <CardContent>
                <div className="text-center space-y-2">
                    <p className="text-4xl font-bold">{result.min.toFixed(0)} - {result.max.toFixed(0)} g</p>
                    <CardDescription>This range is an estimate to fuel your activity level and replenish glycogen stores.</CardDescription>
                </div>
            </CardContent>
        </Card>
      )}
       <Accordion type="single" collapsible className="w-full">
         <AccordionItem value="how-it-works">
            <AccordionTrigger>How It Works</AccordionTrigger>
            <AccordionContent className="text-muted-foreground">
                <p>This calculator uses a common method among sports nutritionists to estimate daily carbohydrate needs based on body weight and activity volume. Carbohydrates are the body's primary fuel source for moderate to high-intensity exercise. The multiplier for each activity level reflects the increased demand for glucose to fuel muscles and replenish glycogen stores post-exercise.</p>
            </AccordionContent>
        </AccordionItem>
      </Accordion>
    </div>
  );
}

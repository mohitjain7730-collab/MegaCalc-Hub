
'use client';

import { useState } from 'react';
import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import { z } from 'zod';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Form, FormControl, FormField, FormItem, FormLabel, FormMessage } from '@/components/ui/form';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Droplets } from 'lucide-react';
import { Accordion, AccordionContent, AccordionItem, AccordionTrigger } from '@/components/ui/accordion';
import { RadioGroup, RadioGroupItem } from '@/components/ui/radio-group';

const formSchema = z.object({
  tdee: z.number().positive(),
  method: z.enum(['percentage', 'remainder']),
  fatPercentage: z.number().min(0).max(100).optional(),
  proteinGrams: z.number().nonnegative().optional(),
  carbGrams: z.number().nonnegative().optional(),
}).refine(data => {
    if (data.method === 'percentage') {
        return data.fatPercentage !== undefined;
    }
    return true;
}, {
    message: 'Fat percentage is required.',
    path: ['fatPercentage'],
}).refine(data => {
    if (data.method === 'remainder') {
        return data.proteinGrams !== undefined && data.carbGrams !== undefined;
    }
    return true;
}, {
    message: 'Protein and Carb grams are required.',
    path: ['proteinGrams'], // or carbGrams
});


type FormValues = z.infer<typeof formSchema>;

export default function FatIntakeCalculator() {
  const [result, setResult] = useState<number | null>(null);

  const form = useForm<FormValues>({
    resolver: zodResolver(formSchema),
    defaultValues: {
        tdee: undefined,
        method: 'percentage',
        fatPercentage: undefined,
    },
  });

  const onSubmit = (values: FormValues) => {
    let fatGrams;
    if (values.method === 'percentage' && values.fatPercentage) {
        fatGrams = (values.tdee * (values.fatPercentage / 100)) / 9;
    } else if (values.method === 'remainder' && values.proteinGrams !== undefined && values.carbGrams !== undefined) {
        const proteinCalories = values.proteinGrams * 4;
        const carbCalories = values.carbGrams * 4;
        const remainingCalories = values.tdee - (proteinCalories + carbCalories);
        fatGrams = remainingCalories / 9;
    }
    setResult(fatGrams ? Math.max(0, fatGrams) : null);
  };
  
  const method = form.watch('method');

  return (
    <div className="space-y-8">
      <Form {...form}>
        <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-6">
          <FormField control={form.control} name="tdee" render={({ field }) => (
            <FormItem><FormLabel>Total Daily Calories (TDEE)</FormLabel><FormControl><Input type="number" {...field} value={field.value ?? ''} onChange={e => field.onChange(parseFloat(e.target.value) || undefined)} /></FormControl><FormMessage /></FormItem>
          )} />

          <FormField
            control={form.control}
            name="method"
            render={({ field }) => (
              <FormItem className="space-y-3">
                <FormLabel>Calculation Method</FormLabel>
                <FormControl>
                  <RadioGroup onValueChange={field.onChange} defaultValue={field.value} className="flex flex-col space-y-1">
                    <FormItem className="flex items-center space-x-3 space-y-0"><FormControl><RadioGroupItem value="percentage" /></FormControl><FormLabel className="font-normal">By Percentage</FormLabel></FormItem>
                    <FormItem className="flex items-center space-x-3 space-y-0"><FormControl><RadioGroupItem value="remainder" /></FormControl><FormLabel className="font-normal">By Remainder</FormLabel></FormItem>
                  </RadioGroup>
                </FormControl>
              </FormItem>
            )}
          />

          {method === 'percentage' ? (
            <FormField control={form.control} name="fatPercentage" render={({ field }) => (
              <FormItem><FormLabel>Desired Fat Percentage (%)</FormLabel><FormControl><Input type="number" {...field} value={field.value ?? ''} onChange={e => field.onChange(parseFloat(e.target.value) || undefined)} /></FormControl><FormMessage /></FormItem>
            )} />
          ) : (
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <FormField control={form.control} name="proteinGrams" render={({ field }) => (
                <FormItem><FormLabel>Daily Protein Goal (g)</FormLabel><FormControl><Input type="number" {...field} value={field.value ?? ''} onChange={e => field.onChange(parseFloat(e.target.value) || undefined)} /></FormControl><FormMessage /></FormItem>
              )} />
              <FormField control={form.control} name="carbGrams" render={({ field }) => (
                <FormItem><FormLabel>Daily Carb Goal (g)</FormLabel><FormControl><Input type="number" {...field} value={field.value ?? ''} onChange={e => field.onChange(parseFloat(e.target.value) || undefined)} /></FormControl><FormMessage /></FormItem>
              )} />
            </div>
          )}

          <Button type="submit">Calculate</Button>
        </form>
      </Form>
      {result !== null && (
        <Card className="mt-8">
            <CardHeader><div className='flex items-center gap-4'><Droplets className="h-8 w-8 text-primary" /><CardTitle>Recommended Daily Fat Intake</CardTitle></div></CardHeader>
            <CardContent>
                <div className="text-center space-y-2">
                    <p className="text-4xl font-bold">{result.toFixed(0)} g</p>
                    <CardDescription>A healthy range for fat intake is typically 20-35% of total daily calories.</CardDescription>
                </div>
            </CardContent>
        </Card>
      )}
       <Accordion type="single" collapsible className="w-full">
         <AccordionItem value="how-it-works">
            <AccordionTrigger>How It Works</AccordionTrigger>
            <AccordionContent className="text-muted-foreground">
                <p>This calculator determines your daily fat intake goal based on your total calorie needs using one of two methods:</p>
                <ul className="list-disc list-inside mt-2 space-y-2">
                  <li><strong>By Percentage:</strong> It calculates the number of calories from fat based on your desired percentage of total calories, then divides by 9 (the number of calories in one gram of fat).</li>
                  <li><strong>By Remainder:</strong> It first calculates the calories from your protein and carbohydrate goals (at 4 calories per gram each). It subtracts this from your total daily calories, and the remaining calories are allocated to fat, divided by 9 to get the gram amount.</li>
                </ul>
            </AccordionContent>
        </AccordionItem>
      </Accordion>
    </div>
  );
}


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
import { Baby } from 'lucide-react';
import { Accordion, AccordionContent, AccordionItem, AccordionTrigger } from '@/components/ui/accordion';

const formSchema = z.object({
  weight: z.number().positive(),
  unit: z.enum(['lbs', 'kg']),
});

type FormValues = z.infer<typeof formSchema>;

export default function BabyFeedingAmountCalculator() {
  const [result, setResult] = useState<{ minIntake: number; maxIntake: number } | null>(null);

  const form = useForm<FormValues>({
    resolver: zodResolver(formSchema),
    defaultValues: {
      weight: undefined,
      unit: 'lbs',
    },
  });

  const onSubmit = (values: FormValues) => {
    let weightInLbs = values.weight;
    if (values.unit === 'kg') {
      weightInLbs *= 2.20462;
    }
    
    // Formula: 1.5 to 2.5 oz per lb of body weight per 24 hrs
    const minIntake = 1.5 * weightInLbs;
    const maxIntake = 2.5 * weightInLbs;
    
    setResult({ minIntake, maxIntake });
  };

  const unit = form.watch('unit');

  return (
    <div className="space-y-8">
      <Form {...form}>
        <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-6">
          <CardDescription>Estimate the daily formula or breastmilk needs for an infant. This is a general guideline.</CardDescription>
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <FormField control={form.control} name="weight" render={({ field }) => (
                <FormItem><FormLabel>Baby's Weight</FormLabel><FormControl><Input type="number" placeholder="e.g., 10" {...field} value={field.value ?? ''} onChange={e => field.onChange(parseFloat(e.target.value) || undefined)} /></FormControl><FormMessage /></FormItem>
            )} />
            <FormField control={form.control} name="unit" render={({ field }) => (
                <FormItem><FormLabel>Unit</FormLabel><Select onValueChange={field.onChange} defaultValue={field.value}><FormControl><SelectTrigger><SelectValue /></SelectTrigger></FormControl><SelectContent><SelectItem value="lbs">Pounds (lbs)</SelectItem><SelectItem value="kg">Kilograms (kg)</SelectItem></SelectContent></Select></FormItem>
            )} />
          </div>
          <Button type="submit">Calculate Feeding Amount</Button>
        </form>
      </Form>
      
      {result && (
        <Card className="mt-8">
            <CardHeader><div className='flex items-center gap-4'><Baby className="h-8 w-8 text-primary" /><CardTitle>Recommended Daily Intake</CardTitle></div></CardHeader>
            <CardContent className="text-center">
                <p className="text-3xl font-bold">{result.minIntake.toFixed(1)} - {result.maxIntake.toFixed(1)} oz</p>
                <CardDescription className='mt-2'>({(result.minIntake * 29.57).toFixed(0)} - {(result.maxIntake * 29.57).toFixed(0)} ml) per 24 hours.</CardDescription>
                <CardDescription className='mt-4'>This is a general estimate. Every baby is different. Consult your pediatrician for personalized advice.</CardDescription>
            </CardContent>
        </Card>
      )}

      <Accordion type="single" collapsible className="w-full">
         <AccordionItem value="understanding-inputs">
            <AccordionTrigger>Understanding the Inputs</AccordionTrigger>
            <AccordionContent className="text-muted-foreground">
              <h4 className="font-semibold text-foreground">Baby's Weight</h4>
              <p>Your baby's current weight. The calculation is based on weight, as it's a key factor in determining caloric and fluid needs.</p>
            </AccordionContent>
        </AccordionItem>
        <AccordionItem value="how-it-works">
            <AccordionTrigger>How It Works</AccordionTrigger>
            <AccordionContent className="text-muted-foreground">
                <p>This calculator uses a common guideline from the American Academy of Pediatrics for formula-fed infants, which suggests a daily intake of approximately 1.5 to 2.5 ounces of formula per pound of body weight. The calculator provides this range as a general estimate for a 24-hour period. Breastfed babies often self-regulate, but this can still be a useful guide for pumped milk.</p>
            </AccordionContent>
        </AccordionItem>
      </Accordion>
    </div>
  );
}

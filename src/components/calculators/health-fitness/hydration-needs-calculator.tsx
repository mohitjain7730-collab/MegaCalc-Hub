
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

const formSchema = z.object({
  weight: z.number().positive(),
  unit: z.enum(['kg', 'lbs']),
  exerciseDuration: z.number().nonnegative().optional(),
});

type FormValues = z.infer<typeof formSchema>;

export default function HydrationNeedsCalculator() {
  const [result, setResult] = useState<number | null>(null);

  const form = useForm<FormValues>({
    resolver: zodResolver(formSchema),
    defaultValues: {
      unit: 'lbs',
      weight: undefined,
      exerciseDuration: undefined,
    },
  });

  const onSubmit = (values: FormValues) => {
    let weightInKg = values.weight;
    if (values.unit === 'lbs') {
      weightInKg *= 0.453592;
    }

    const baseIntake = weightInKg * 35;
    const exerciseWater = values.exerciseDuration ? (values.exerciseDuration / 30) * 350 : 0;
    const totalIntake = baseIntake + exerciseWater;
    
    setResult(totalIntake);
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
            <FormField control={form.control} name="exerciseDuration" render={({ field }) => (
                <FormItem className="md:col-span-2"><FormLabel>Daily Exercise Duration (minutes)</FormLabel><FormControl><Input type="number" {...field} value={field.value ?? ''} onChange={e => field.onChange(parseFloat(e.target.value) || undefined)} /></FormControl><FormMessage /></FormItem>
            )} />
          </div>
          <Button type="submit">Calculate</Button>
        </form>
      </Form>
      {result && (
        <Card className="mt-8">
            <CardHeader><div className='flex items-center gap-4'><Droplets className="h-8 w-8 text-primary" /><CardTitle>Recommended Daily Water Intake</CardTitle></div></CardHeader>
            <CardContent>
                <div className="text-center space-y-2">
                    <p className="text-4xl font-bold">{result.toLocaleString(undefined, {maximumFractionDigits: 0})} ml</p>
                    <CardDescription>
                        Approximately {(result / 1000).toFixed(1)} liters or {(result / 236.6).toFixed(1)} glasses (8 oz).
                    </CardDescription>
                </div>
            </CardContent>
        </Card>
      )}
       <Accordion type="single" collapsible className="w-full">
         <AccordionItem value="how-it-works">
            <AccordionTrigger>How It Works</AccordionTrigger>
            <AccordionContent className="text-muted-foreground">
                <p>This calculator estimates your daily water needs using a common activity-based method. It calculates a baseline requirement from your body weight (35 ml per kg) and adds a supplemental amount to compensate for fluid loss during exercise (approximately 350 ml for every 30 minutes of activity).</p>
            </AccordionContent>
        </AccordionItem>
      </Accordion>
      <section
        className="space-y-4 text-muted-foreground leading-relaxed"
        itemScope
        itemType="https://schema.org/Article"
      >
        <meta itemProp="headline" content="Hydration Needs Calculator – Daily Water Intake, Electrolytes, and Practical Tips" />
        <meta itemProp="author" content="MegaCalc Hub Team" />
        <meta itemProp="about" content="How much water to drink each day, how exercise, heat, altitude, and diet change needs, signs of dehydration, and hydration strategies." />

        <h2 itemProp="name" className="text-xl font-bold text-foreground">How Much Water Do You Need Per Day?</h2>
        <p itemProp="description">A common starting point is <strong>~30–40 ml per kg</strong> bodyweight, plus extra during exercise and hot/humid days. Our calculator uses 35 ml/kg and adds ~350 ml per 30 minutes of activity.</p>

        <h3 className="font-semibold text-foreground mt-6">Factors That Increase Fluid Needs</h3>
        <ul className="list-disc ml-6 space-y-1">
          <li><strong>Exercise & heat:</strong> Higher sweat rates raise water and electrolyte requirements.</li>
          <li><strong>Altitude & dry air:</strong> Faster breathing and low humidity increase losses.</li>
          <li><strong>Diet:</strong> High‑fiber, high‑protein, or very salty/spicy meals can increase thirst.</li>
          <li><strong>Illness:</strong> Fever, vomiting, diarrhea, or certain medications elevate needs—seek medical guidance.</li>
        </ul>

        <h3 className="font-semibold text-foreground mt-6">Electrolytes 101</h3>
        <ul className="list-disc ml-6 space-y-1">
          <li><strong>Sodium:</strong> primary sweat electrolyte; replace during long sessions/hot weather.</li>
          <li><strong>Potassium & Magnesium:</strong> found in fruits/veg, dairy, beans, nuts; consider electrolyte mixes for prolonged exercise.</li>
          <li>Clear, pale‑yellow urine across the day is a simple hydration check.</li>
        </ul>

        <h3 className="font-semibold text-foreground mt-6">Practical Strategies</h3>
        <ul className="list-disc ml-6 space-y-1">
          <li>Front‑load fluids earlier in the day; sip regularly rather than chug all at once.</li>
          <li>Use a bottle with volume markings; aim to finish set amounts by certain times.</li>
          <li>Include hydrating foods: fruit, vegetables, soups, yogurt.</li>
        </ul>

        <h3 className="font-semibold text-foreground mt-6">Related Tools</h3>
        <div className="space-y-2">
          <p><Link href="/category/health-fitness/electrolyte-replacement-calculator" className="text-primary underline">Electrolyte Replacement Calculator</Link></p>
          <p><Link href="/category/health-fitness/daily-calorie-needs-calculator" className="text-primary underline">Daily Calorie Needs (TDEE)</Link></p>
        </div>
      </section>
    </div>
  );
}

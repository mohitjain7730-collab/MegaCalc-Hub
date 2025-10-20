'use client';

import { useState } from 'react';
import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import { z } from 'zod';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Form, FormControl, FormField, FormItem, FormLabel, FormMessage } from '@/components/ui/form';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Accordion, AccordionContent, AccordionItem, AccordionTrigger } from '@/components/ui/accordion';
import { Zap } from 'lucide-react';

const formSchema = z.object({
  bodyMassKg: z.number().positive('Enter body mass in kg').optional(),
  skeletalMusclePercent: z.number().min(10).max(60).optional(),
  myoglobinConcMgPerG: z.number().min(2).max(10).optional(),
});

type FormValues = z.infer<typeof formSchema>;

export default function MyoglobinOxygenStorageCalculator() {
  const [result, setResult] = useState<{ totalMyoglobinG: number; o2StorageMl: number; interpretation: string; opinion: string } | null>(null);

  const form = useForm<FormValues>({
    resolver: zodResolver(formSchema),
    defaultValues: {
      bodyMassKg: undefined,
      skeletalMusclePercent: undefined,
      myoglobinConcMgPerG: undefined,
    },
  });

  const calculate = (v: FormValues) => {
    if (v.bodyMassKg == null || v.skeletalMusclePercent == null || v.myoglobinConcMgPerG == null) return null;
    const muscleMassKg = v.bodyMassKg * (v.skeletalMusclePercent / 100);
    const muscleMassG = muscleMassKg * 1000;
    const totalMyoglobinG = (v.myoglobinConcMgPerG / 1000) * muscleMassG;
    // Approx 1 g myoglobin binds ~1.34 ml O2 similar to hemoglobin (simplified assumption)
    const o2StorageMl = totalMyoglobinG * 1.34;
    return { totalMyoglobinG, o2StorageMl };
  };

  const interpret = (o2Ml: number) => {
    if (o2Ml > 700) return 'Very high myoglobin oxygen reserve, typical of highly trained endurance athletes.';
    if (o2Ml >= 350) return 'Moderate to high oxygen reserve, supportive of sustained aerobic work.';
    return 'Lower reserve; aerobic capacity may rely more on cardiovascular delivery than muscle stores.';
  };

  const opinion = (o2Ml: number) => {
    if (o2Ml > 700) return 'Great foundation—maintain with consistent endurance volume and occasional high-intensity efforts.';
    if (o2Ml >= 350) return 'Good level—build with steady-state mileage, hills, and iron-rich nutrition.';
    return 'Focus on progressive aerobic training and ensure adequate iron, B12, and recovery.';
  };

  const onSubmit = (values: FormValues) => {
    const res = calculate(values);
    if (!res) { setResult(null); return; }
    setResult({
      totalMyoglobinG: Math.round(res.totalMyoglobinG * 100) / 100,
      o2StorageMl: Math.round(res.o2StorageMl * 100) / 100,
      interpretation: interpret(res.o2StorageMl),
      opinion: opinion(res.o2StorageMl),
    });
  };

  return (
    <div className="space-y-8">
      <Form {...form}>
        <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-6">
          <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
            <FormField control={form.control} name="bodyMassKg" render={({ field }) => (
              <FormItem>
                <FormLabel>Body Mass (kg)</FormLabel>
                <FormControl>
                  <Input type="number" step="0.1" placeholder="Enter mass in kg" {...field} value={field.value ?? ''} onChange={e => field.onChange(parseFloat(e.target.value) || undefined)} />
                </FormControl>
                <FormMessage />
              </FormItem>
            )} />
            <FormField control={form.control} name="skeletalMusclePercent" render={({ field }) => (
              <FormItem>
                <FormLabel>Skeletal Muscle (% body mass)</FormLabel>
                <FormControl>
                  <Input type="number" step="0.1" placeholder="e.g., 40" {...field} value={field.value ?? ''} onChange={e => field.onChange(parseFloat(e.target.value) || undefined)} />
                </FormControl>
                <FormMessage />
              </FormItem>
            )} />
            <FormField control={form.control} name="myoglobinConcMgPerG" render={({ field }) => (
              <FormItem>
                <FormLabel>Myoglobin Conc. (mg/g muscle)</FormLabel>
                <FormControl>
                  <Input type="number" step="0.1" placeholder="e.g., 4" {...field} value={field.value ?? ''} onChange={e => field.onChange(parseFloat(e.target.value) || undefined)} />
                </FormControl>
                <FormMessage />
              </FormItem>
            )} />
          </div>
          <Button type="submit">Estimate O2 Storage</Button>
        </form>
      </Form>

      {result && (
        <div className="space-y-6">
          <Card>
            <CardHeader>
              <div className="flex items-center gap-4">
                <Zap className="h-8 w-8 text-primary" />
                <CardTitle>Myoglobin Oxygen Reserve</CardTitle>
              </div>
              <CardDescription>Estimated oxygen bound in muscle myoglobin</CardDescription>
            </CardHeader>
            <CardContent className="space-y-2">
              <p className="text-3xl font-bold text-primary">{result.o2StorageMl} ml O2</p>
              <p className="text-muted-foreground">Total myoglobin: {result.totalMyoglobinG} g</p>
              <p className="text-muted-foreground">{result.interpretation}</p>
            </CardContent>
          </Card>

          <Card>
            <CardHeader><CardTitle>Our Opinion</CardTitle></CardHeader>
            <CardContent><p className="text-muted-foreground">{result.opinion}</p></CardContent>
          </Card>
        </div>
      )}

      <Accordion type="single" collapsible className="w-full">
        <AccordionItem value="guide">
          <AccordionTrigger>Complete Guide: Myoglobin & Oxygen Storage</AccordionTrigger>
          <AccordionContent className="text-muted-foreground space-y-3">
            <h4 className="font-semibold text-foreground">What This Estimates</h4>
            <p>Myoglobin in skeletal muscle binds oxygen and facilitates intramuscular transport, supporting aerobic metabolism during exercise.</p>
            <h4 className="font-semibold text-foreground">Factors That Increase Reserve</h4>
            <ul className="list-disc list-inside space-y-1">
              <li>Higher muscle mass and slow-twitch fiber proportion</li>
              <li>Endurance training adaptations and altitude exposure</li>
              <li>Nutritional adequacy, especially iron status</li>
            </ul>
          </AccordionContent>
        </AccordionItem>
        <AccordionItem value="related">
          <AccordionTrigger>Related Calculators</AccordionTrigger>
          <AccordionContent className="text-muted-foreground">
            <ul className="space-y-1">
              <li><a href="/category/health-fitness/vo2-max-calculator" className="text-primary underline">VO2 Max Calculator</a></li>
              <li><a href="/category/health-fitness/hemoglobin-level-impact-calculator" className="text-primary underline">Hemoglobin Impact Calculator</a></li>
            </ul>
          </AccordionContent>
        </AccordionItem>
      </Accordion>
    </div>
  );
}



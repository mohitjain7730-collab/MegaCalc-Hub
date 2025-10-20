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
  maintenanceKcal: z.number().min(1200).max(6000).optional(),
  proteinGPerKg: z.number().min(1.2).max(2.6).optional(),
  bodyMassKg: z.number().min(30).max(200).optional(),
  lowCarbPct: z.number().min(10).max(40).optional(),
  highCarbPct: z.number().min(40).max(70).optional(),
});

type FormValues = z.infer<typeof formSchema>;

export default function CarbCyclingMacroCalculator() {
  const [result, setResult] = useState<{ low: {kcal:number; proteinG:number; fatG:number; carbsG:number}; high: {kcal:number; proteinG:number; fatG:number; carbsG:number}; interpretation: string; opinion: string } | null>(null);
  const form = useForm<FormValues>({ resolver: zodResolver(formSchema), defaultValues: { maintenanceKcal: undefined, proteinGPerKg: undefined, bodyMassKg: undefined, lowCarbPct: undefined, highCarbPct: undefined } });

  const computeDay = (kcal: number, proteinG: number, carbPct: number) => {
    const carbsKcal = kcal * (carbPct / 100);
    const carbsG = carbsKcal / 4;
    const proteinKcal = proteinG * 4;
    const fatKcal = Math.max(0, kcal - carbsKcal - proteinKcal);
    const fatG = fatKcal / 9;
    return { kcal: Math.round(kcal), proteinG: Math.round(proteinG), fatG: Math.round(fatG), carbsG: Math.round(carbsG) };
  };

  const onSubmit = (v: FormValues) => {
    if (v.maintenanceKcal == null || v.proteinGPerKg == null || v.bodyMassKg == null || v.lowCarbPct == null || v.highCarbPct == null) { setResult(null); return; }
    const proteinG = v.proteinGPerKg * v.bodyMassKg;
    const low = computeDay(v.maintenanceKcal * 0.9, proteinG, v.lowCarbPct);
    const high = computeDay(v.maintenanceKcal * 1.05, proteinG, v.highCarbPct);
    const interpretation = 'Low days slightly below maintenance; high days slightly above to support training.';
    const opinion = 'Align high-carb days with hard training; keep protein stable and adjust fats to fit calories.';
    setResult({ low, high, interpretation, opinion });
  };

  return (
    <div className="space-y-8">
      <Form {...form}>
        <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-6">
          <div className="grid grid-cols-1 md:grid-cols-5 gap-4">
            <FormField control={form.control} name="maintenanceKcal" render={({ field }) => (
              <FormItem>
                <FormLabel>Maintenance (kcal)</FormLabel>
                <FormControl>
                  <Input type="number" step="10" placeholder="e.g., 2400" {...(field as any)} value={field.value ?? ''} onChange={e=>field.onChange(parseFloat(e.target.value)||undefined)} />
                </FormControl>
                <FormMessage />
              </FormItem>
            )} />
            <FormField control={form.control} name="proteinGPerKg" render={({ field }) => (
              <FormItem>
                <FormLabel>Protein (g/kg)</FormLabel>
                <FormControl>
                  <Input type="number" step="0.1" placeholder="e.g., 1.8" {...(field as any)} value={field.value ?? ''} onChange={e=>field.onChange(parseFloat(e.target.value)||undefined)} />
                </FormControl>
                <FormMessage />
              </FormItem>
            )} />
            <FormField control={form.control} name="bodyMassKg" render={({ field }) => (
              <FormItem>
                <FormLabel>Body Mass (kg)</FormLabel>
                <FormControl>
                  <Input type="number" step="0.1" placeholder="e.g., 80" {...(field as any)} value={field.value ?? ''} onChange={e=>field.onChange(parseFloat(e.target.value)||undefined)} />
                </FormControl>
                <FormMessage />
              </FormItem>
            )} />
            <FormField control={form.control} name="lowCarbPct" render={({ field }) => (
              <FormItem>
                <FormLabel>Low Day Carbs (%)</FormLabel>
                <FormControl>
                  <Input type="number" step="1" placeholder="e.g., 25" {...(field as any)} value={field.value ?? ''} onChange={e=>field.onChange(parseFloat(e.target.value)||undefined)} />
                </FormControl>
                <FormMessage />
              </FormItem>
            )} />
            <FormField control={form.control} name="highCarbPct" render={({ field }) => (
              <FormItem>
                <FormLabel>High Day Carbs (%)</FormLabel>
                <FormControl>
                  <Input type="number" step="1" placeholder="e.g., 55" {...(field as any)} value={field.value ?? ''} onChange={e=>field.onChange(parseFloat(e.target.value)||undefined)} />
                </FormControl>
                <FormMessage />
              </FormItem>
            )} />
          </div>
          <Button type="submit">Calculate Carb Cycling Macros</Button>
        </form>
      </Form>

      {result && (
        <div className="space-y-6">
          <Card>
            <CardHeader>
              <div className="flex items-center gap-4">
                <Zap className="h-8 w-8 text-primary" />
                <CardTitle>Macro Targets (Low vs High)</CardTitle>
              </div>
              <CardDescription>Align high days with hardest sessions</CardDescription>
            </CardHeader>
            <CardContent className="space-y-2">
              <p className="text-muted-foreground">Low Day: {result.low.kcal} kcal | P {result.low.proteinG}g | C {result.low.carbsG}g | F {result.low.fatG}g</p>
              <p className="text-muted-foreground">High Day: {result.high.kcal} kcal | P {result.high.proteinG}g | C {result.high.carbsG}g | F {result.high.fatG}g</p>
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
          <AccordionTrigger>Complete Guide: Carb Cycling</AccordionTrigger>
          <AccordionContent className="text-muted-foreground space-y-3">
            <ul className="list-disc list-inside space-y-1">
              <li>Keep protein steady; flex carbs and fats by day.</li>
              <li>Match carbs to training load; taper on recovery days.</li>
              <li>Monitor performance and body composition to refine.</li>
            </ul>
          </AccordionContent>
        </AccordionItem>
        <AccordionItem value="related">
          <AccordionTrigger>Related Calculators</AccordionTrigger>
          <AccordionContent className="text-muted-foreground">
            <ul className="space-y-1">
              <li><a href="/category/health-fitness/macro-ratio-calculator" className="text-primary underline">Macro Ratio</a></li>
              <li><a href="/category/health-fitness/training-volume-calculator" className="text-primary underline">Training Volume</a></li>
            </ul>
          </AccordionContent>
        </AccordionItem>
      </Accordion>
    </div>
  );
}



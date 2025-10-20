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
  ambientTempC: z.number().min(-20).max(30).optional(),
  exposureMinutes: z.number().min(5).max(300).optional(),
  clothingInsulationClo: z.number().min(0).max(4).optional(),
});

type FormValues = z.infer<typeof formSchema>;

export default function CaloricCostOfColdExposureCalculator() {
  const [result, setResult] = useState<{ kcal: number; perHour: number; interpretation: string; opinion: string } | null>(null);
  const form = useForm<FormValues>({ resolver: zodResolver(formSchema), defaultValues: { ambientTempC: undefined, exposureMinutes: undefined, clothingInsulationClo: undefined } });

  const calculate = (v: FormValues) => {
    if (v.ambientTempC == null || v.exposureMinutes == null || v.clothingInsulationClo == null) return null;
    const tempDelta = Math.max(0, 22 - v.ambientTempC);
    const cloFactor = Math.max(0.2, 1 - v.clothingInsulationClo * 0.2);
    const kcalPerHour = tempDelta * 3 * cloFactor; // heuristic for non-shivering thermogenesis
    const kcal = (kcalPerHour * v.exposureMinutes) / 60;
    return { kcal, perHour: kcalPerHour };
  };

  const interpret = (kph: number) => {
    if (kph >= 40) return 'High thermogenic demand—significant extra calories burned.';
    if (kph >= 15) return 'Moderate demand—noticeable contribution to daily burn.';
    return 'Low demand—minor effect on total energy expenditure.';
  };

  const opinion = (kph: number) => {
    if (kph >= 40) return 'Use cautiously; prioritize safety and rewarming.';
    if (kph >= 15) return 'Combine with training; avoid impairing recovery.';
    return 'Focus on consistent diet and activity for larger impact.';
  };

  const onSubmit = (values: FormValues) => {
    const res = calculate(values);
    if (!res) { setResult(null); return; }
    setResult({ kcal: Math.round(res.kcal), perHour: Math.round(res.perHour), interpretation: interpret(res.perHour), opinion: opinion(res.perHour) });
  };

  return (
    <div className="space-y-8">
      <Form {...form}>
        <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-6">
          <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
            <FormField control={form.control} name="ambientTempC" render={({ field }) => (
              <FormItem>
                <FormLabel>Ambient Temp (°C)</FormLabel>
                <FormControl>
                  <Input type="number" step="0.1" placeholder="e.g., 10" {...field} value={field.value ?? ''} onChange={e=>field.onChange(parseFloat(e.target.value)||undefined)} />
                </FormControl>
                <FormMessage />
              </FormItem>
            )} />
            <FormField control={form.control} name="exposureMinutes" render={({ field }) => (
              <FormItem>
                <FormLabel>Exposure (minutes)</FormLabel>
                <FormControl>
                  <Input type="number" step="1" placeholder="e.g., 30" {...field} value={field.value ?? ''} onChange={e=>field.onChange(parseFloat(e.target.value)||undefined)} />
                </FormControl>
                <FormMessage />
              </FormItem>
            )} />
            <FormField control={form.control} name="clothingInsulationClo" render={({ field }) => (
              <FormItem>
                <FormLabel>Clothing Insulation (clo)</FormLabel>
                <FormControl>
                  <Input type="number" step="0.1" placeholder="e.g., 1.0" {...field} value={field.value ?? ''} onChange={e=>field.onChange(parseFloat(e.target.value)||undefined)} />
                </FormControl>
                <FormMessage />
              </FormItem>
            )} />
          </div>
          <Button type="submit">Estimate Caloric Cost</Button>
        </form>
      </Form>

      {result && (
        <div className="space-y-6">
          <Card>
            <CardHeader>
              <div className="flex items-center gap-4">
                <Zap className="h-8 w-8 text-primary" />
                <CardTitle>Cold Exposure Energy Cost</CardTitle>
              </div>
              <CardDescription>Estimated additional calories burned</CardDescription>
            </CardHeader>
            <CardContent className="space-y-2">
              <p className="text-3xl font-bold text-primary">{result.kcal} kcal</p>
              <p className="text-muted-foreground">≈ {result.perHour} kcal/hour</p>
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
          <AccordionTrigger>Complete Guide: Cold Exposure & Metabolism</AccordionTrigger>
          <AccordionContent className="text-muted-foreground space-y-3">
            <ul className="list-disc list-inside space-y-1">
              <li>Colder temps and lighter clothing raise thermogenic demand.</li>
              <li>Don’t rely solely on cold exposure for fat loss; prioritize training and diet.</li>
              <li>Safety first—avoid hypothermia and consider health conditions.</li>
            </ul>
          </AccordionContent>
        </AccordionItem>
        <AccordionItem value="related">
          <AccordionTrigger>Related Calculators</AccordionTrigger>
          <AccordionContent className="text-muted-foreground">
            <ul className="space-y-1">
              <li><a href="/category/health-fitness/ice-bath-duration-temp-calculator" className="text-primary underline">Ice Bath Duration & Temp</a></li>
              <li><a href="/category/health-fitness/core-body-temperature-rise-calculator" className="text-primary underline">Core Body Temperature Rise</a></li>
            </ul>
          </AccordionContent>
        </AccordionItem>
      </Accordion>
    </div>
  );
}



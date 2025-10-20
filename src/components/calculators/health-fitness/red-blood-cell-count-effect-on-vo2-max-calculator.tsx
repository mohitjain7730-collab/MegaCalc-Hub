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
  baselineVo2Max: z.number().positive('Enter baseline VO2 Max (ml/kg/min)').optional(),
  hemoglobinGdl: z.number().min(8).max(20).optional(),
  rbcCountMillionPerUl: z.number().min(3).max(7).optional(),
});

type FormValues = z.infer<typeof formSchema>;

export default function RedBloodCellCountEffectOnVO2MaxCalculator() {
  const [result, setResult] = useState<{ adjustedVo2Max: number; delta: number; interpretation: string; opinion: string } | null>(null);

  const form = useForm<FormValues>({ resolver: zodResolver(formSchema), defaultValues: { baselineVo2Max: undefined, hemoglobinGdl: undefined, rbcCountMillionPerUl: undefined } });

  const calculate = (v: FormValues) => {
    if (v.baselineVo2Max == null || v.hemoglobinGdl == null || v.rbcCountMillionPerUl == null) return null;
    // Simplified model: oxygen carrying capacity scales ~linearly with Hb; normative Hb ~ 15 g/dL
    const hbFactor = v.hemoglobinGdl / 15;
    // RBC count correlates with Hb but provide small independent scaling around 5.0
    const rbcFactor = v.rbcCountMillionPerUl / 5;
    const factor = 0.8 * hbFactor + 0.2 * rbcFactor;
    const adjusted = v.baselineVo2Max * factor;
    return { adjusted, delta: adjusted - v.baselineVo2Max };
  };

  const interpret = (delta: number) => {
    if (delta > 5) return 'Substantially increased oxygen transport capacity; potential for notable VO2 Max improvement.';
    if (delta >= 1) return 'Slight improvement in oxygen transport; may aid endurance performance.';
    if (delta > -1) return 'Minimal expected change in VO2 Max from blood metrics alone.';
    return 'Potential reduction in oxygen transport; investigate nutrition, altitude, or medical causes.';
  };

  const opinion = (delta: number) => {
    if (delta > 5) return 'Capitalize with structured endurance blocks and careful recovery.';
    if (delta >= 1) return 'Maintain iron status and consistency; small gains accumulate over time.';
    if (delta > -1) return 'Focus on training quality; small lab variations are normal.';
    return 'Consider bloodwork review with a clinician; ensure adequate iron and B12 intake.';
  };

  const onSubmit = (values: FormValues) => {
    const res = calculate(values);
    if (!res) { setResult(null); return; }
    setResult({
      adjustedVo2Max: Math.round(res.adjusted * 100) / 100,
      delta: Math.round(res.delta * 100) / 100,
      interpretation: interpret(res.delta),
      opinion: opinion(res.delta),
    });
  };

  return (
    <div className="space-y-8">
      <Form {...form}>
        <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-6">
          <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
            <FormField control={form.control} name="baselineVo2Max" render={({ field }) => (
              <FormItem>
                <FormLabel>Baseline VO2 Max (ml/kg/min)</FormLabel>
                <FormControl>
                  <Input type="number" step="0.1" placeholder="e.g., 45" {...field} value={field.value ?? ''} onChange={e => field.onChange(parseFloat(e.target.value) || undefined)} />
                </FormControl>
                <FormMessage />
              </FormItem>
            )} />
            <FormField control={form.control} name="hemoglobinGdl" render={({ field }) => (
              <FormItem>
                <FormLabel>Hemoglobin (g/dL)</FormLabel>
                <FormControl>
                  <Input type="number" step="0.1" placeholder="e.g., 15" {...field} value={field.value ?? ''} onChange={e => field.onChange(parseFloat(e.target.value) || undefined)} />
                </FormControl>
                <FormMessage />
              </FormItem>
            )} />
            <FormField control={form.control} name="rbcCountMillionPerUl" render={({ field }) => (
              <FormItem>
                <FormLabel>RBC Count (million/µL)</FormLabel>
                <FormControl>
                  <Input type="number" step="0.1" placeholder="e.g., 5.0" {...field} value={field.value ?? ''} onChange={e => field.onChange(parseFloat(e.target.value) || undefined)} />
                </FormControl>
                <FormMessage />
              </FormItem>
            )} />
          </div>
          <Button type="submit">Estimate VO2 Max Change</Button>
        </form>
      </Form>

      {result && (
        <div className="space-y-6">
          <Card>
            <CardHeader>
              <div className="flex items-center gap-4">
                <Zap className="h-8 w-8 text-primary" />
                <CardTitle>Adjusted VO2 Max</CardTitle>
              </div>
              <CardDescription>Estimated effect of blood metrics</CardDescription>
            </CardHeader>
            <CardContent className="space-y-2">
              <p className="text-3xl font-bold text-primary">{result.adjustedVo2Max} ml/kg/min</p>
              <p className="text-muted-foreground">Change: {result.delta} ml/kg/min</p>
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
          <AccordionTrigger>Complete Guide: RBC, Hemoglobin & VO2 Max</AccordionTrigger>
          <AccordionContent className="text-muted-foreground space-y-3">
            <p>Hemoglobin concentration largely determines blood oxygen carrying capacity. RBC count correlates with hemoglobin and total red cell mass.</p>
            <ul className="list-disc list-inside space-y-1">
              <li>Adequate iron and B12 are essential for erythropoiesis.</li>
              <li>Altitude exposure and endurance training can increase total hemoglobin mass.</li>
              <li>Hydration status acutely alters measured concentrations.</li>
            </ul>
          </AccordionContent>
        </AccordionItem>
        <AccordionItem value="related">
          <AccordionTrigger>Related Calculators</AccordionTrigger>
          <AccordionContent className="text-muted-foreground">
            <ul className="space-y-1">
              <li><a href="/category/health-fitness/vo2-max-calculator" className="text-primary underline">VO2 Max Calculator</a></li>
              <li><a href="/category/health-fitness/vitamin-d-sun-exposure-calculator" className="text-primary underline">Vitamin D Sun Exposure</a></li>
            </ul>
          </AccordionContent>
        </AccordionItem>
      </Accordion>
    </div>
  );
}



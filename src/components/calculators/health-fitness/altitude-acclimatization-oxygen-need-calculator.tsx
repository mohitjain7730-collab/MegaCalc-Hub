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
  altitudeMeters: z.number().min(0).max(6000).optional(),
  baselineVo2RequirementMlMinKg: z.number().positive('Enter baseline oxygen need').optional(),
});

type FormValues = z.infer<typeof formSchema>;

export default function AltitudeAcclimatizationOxygenNeedCalculator() {
  const [result, setResult] = useState<{ adjustedNeed: number; factor: number; interpretation: string; opinion: string } | null>(null);

  const form = useForm<FormValues>({ resolver: zodResolver(formSchema), defaultValues: { altitudeMeters: undefined, baselineVo2RequirementMlMinKg: undefined } });

  const calculate = (v: FormValues) => {
    if (v.altitudeMeters == null || v.baselineVo2RequirementMlMinKg == null) return null;
    // Simplified inspired O2 drop: factor increases ~2% per 300m above 1500m
    const extra = Math.max(0, v.altitudeMeters - 1500);
    const increments = extra / 300 * 0.02;
    const factor = 1 + Math.max(0, increments);
    const adjusted = v.baselineVo2RequirementMlMinKg * factor;
    return { adjusted, factor };
  };

  const interpret = (factor: number) => {
    if (factor > 1.2) return 'Significant increase in oxygen requirement—acclimatization and pacing are crucial.';
    if (factor >= 1.05) return 'Mild to moderate increase—expect elevated breathing and HR.';
    return 'Minimal change at this altitude.';
  };

  const opinion = (factor: number) => {
    if (factor > 1.2) return 'Plan staged ascent, lighter intensities, and increased recovery between sessions.';
    if (factor >= 1.05) return 'Allow extra warm-up, hydrate well, and adjust pacing by feel and HR.';
    return 'Proceed with normal training while monitoring how you feel.';
  };

  const onSubmit = (values: FormValues) => {
    const res = calculate(values);
    if (!res) { setResult(null); return; }
    setResult({
      adjustedNeed: Math.round(res.adjusted * 100) / 100,
      factor: Math.round(res.factor * 100) / 100,
      interpretation: interpret(res.factor),
      opinion: opinion(res.factor),
    });
  };

  return (
    <div className="space-y-8">
      <Form {...form}>
        <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-6">
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <FormField control={form.control} name="altitudeMeters" render={({ field }) => (
              <FormItem>
                <FormLabel>Altitude (meters)</FormLabel>
                <FormControl>
                  <Input type="number" step="1" placeholder="e.g., 2500" {...field} value={field.value ?? ''} onChange={e => field.onChange(parseFloat(e.target.value) || undefined)} />
                </FormControl>
                <FormMessage />
              </FormItem>
            )} />
            <FormField control={form.control} name="baselineVo2RequirementMlMinKg" render={({ field }) => (
              <FormItem>
                <FormLabel>Baseline O2 Need (ml/kg/min)</FormLabel>
                <FormControl>
                  <Input type="number" step="0.1" placeholder="e.g., 30" {...field} value={field.value ?? ''} onChange={e => field.onChange(parseFloat(e.target.value) || undefined)} />
                </FormControl>
                <FormMessage />
              </FormItem>
            )} />
          </div>
          <Button type="submit">Adjust for Altitude</Button>
        </form>
      </Form>

      {result && (
        <div className="space-y-6">
          <Card>
            <CardHeader>
              <div className="flex items-center gap-4">
                <Zap className="h-8 w-8 text-primary" />
                <CardTitle>Adjusted Oxygen Requirement</CardTitle>
              </div>
              <CardDescription>Factor due to altitude: ×{result.factor}</CardDescription>
            </CardHeader>
            <CardContent className="space-y-2">
              <p className="text-3xl font-bold text-primary">{result.adjustedNeed} ml/kg/min</p>
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
          <AccordionTrigger>Complete Guide: Training at Altitude</AccordionTrigger>
          <AccordionContent className="text-muted-foreground space-y-3">
            <p>Lower barometric pressure reduces inspired oxygen, increasing physiological strain. Acclimatization improves ventilation, hematology, and efficiency.</p>
            <ul className="list-disc list-inside space-y-1">
              <li>Ascend gradually and schedule easy days.</li>
              <li>Monitor hydration, sleep, and training response.</li>
              <li>Use HR and RPE rather than sea-level paces.</li>
            </ul>
          </AccordionContent>
        </AccordionItem>
        <AccordionItem value="related">
          <AccordionTrigger>Related Calculators</AccordionTrigger>
          <AccordionContent className="text-muted-foreground">
            <ul className="space-y-1">
              <li><a href="/category/health-fitness/vo2-max-calculator" className="text-primary underline">VO2 Max Calculator</a></li>
              <li><a href="/category/health-fitness/recovery-heart-rate-calculator" className="text-primary underline">Recovery Heart Rate</a></li>
            </ul>
          </AccordionContent>
        </AccordionItem>
      </Accordion>
    </div>
  );
}



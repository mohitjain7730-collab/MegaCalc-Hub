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
  bodyMassKg: z.number().positive('Enter mass').optional(),
  verticalJumpCm: z.number().min(5).max(120).optional(),
  timeToPeakSec: z.number().min(0.1).max(3).optional(),
});

type FormValues = z.infer<typeof formSchema>;

export default function AnaerobicPowerOutputCalculator() {
  const [result, setResult] = useState<{ peakPowerW: number; powerToWeight: number; interpretation: string; opinion: string } | null>(null);
  const form = useForm<FormValues>({ resolver: zodResolver(formSchema), defaultValues: { bodyMassKg: undefined, verticalJumpCm: undefined, timeToPeakSec: undefined } });

  const calculate = (v: FormValues) => {
    if (v.bodyMassKg == null || v.verticalJumpCm == null || v.timeToPeakSec == null) return null;
    const h = v.verticalJumpCm / 100; // m
    // Simple power estimate: P = m*g*h / t
    const workJ = v.bodyMassKg * 9.80665 * h;
    const peakPower = workJ / v.timeToPeakSec;
    const p2w = peakPower / v.bodyMassKg;
    return { peakPower, p2w };
  };

  const interpret = (p2w: number) => {
    if (p2w > 60) return 'Elite anaerobic power relative to body mass.';
    if (p2w >= 40) return 'High power—excellent explosive capability.';
    if (p2w >= 25) return 'Moderate power—room for speed-strength development.';
    return 'Low to moderate—focus on strength and plyometrics.';
  };

  const opinion = (p2w: number) => {
    if (p2w > 60) return 'Maintain with contrast training and adequate recovery.';
    if (p2w >= 40) return 'Use Olympic lifts, loaded jumps, and sprint work.';
    if (p2w >= 25) return 'Build max strength then add plyometric progression.';
    return 'Start with foundational strength, then progress to low-impact plyos.';
  };

  const onSubmit = (values: FormValues) => {
    const res = calculate(values);
    if (!res) { setResult(null); return; }
    setResult({ peakPowerW: Math.round(res.peakPower), powerToWeight: Math.round(res.p2w * 10) / 10, interpretation: interpret(res.p2w), opinion: opinion(res.p2w) });
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
                  <Input type="number" step="0.1" placeholder="e.g., 75" {...field} value={field.value ?? ''} onChange={e => field.onChange(parseFloat(e.target.value) || undefined)} />
                </FormControl>
                <FormMessage />
              </FormItem>
            )} />
            <FormField control={form.control} name="verticalJumpCm" render={({ field }) => (
              <FormItem>
                <FormLabel>Vertical Jump (cm)</FormLabel>
                <FormControl>
                  <Input type="number" step="0.1" placeholder="e.g., 45" {...field} value={field.value ?? ''} onChange={e => field.onChange(parseFloat(e.target.value) || undefined)} />
                </FormControl>
                <FormMessage />
              </FormItem>
            )} />
            <FormField control={form.control} name="timeToPeakSec" render={({ field }) => (
              <FormItem>
                <FormLabel>Time to Peak (s)</FormLabel>
                <FormControl>
                  <Input type="number" step="0.01" placeholder="e.g., 0.4" {...field} value={field.value ?? ''} onChange={e => field.onChange(parseFloat(e.target.value) || undefined)} />
                </FormControl>
                <FormMessage />
              </FormItem>
            )} />
          </div>
          <Button type="submit">Estimate Anaerobic Power</Button>
        </form>
      </Form>

      {result && (
        <div className="space-y-6">
          <Card>
            <CardHeader>
              <div className="flex items-center gap-4">
                <Zap className="h-8 w-8 text-primary" />
                <CardTitle>Peak Power Output</CardTitle>
              </div>
              <CardDescription>Estimated from jump height and time to peak</CardDescription>
            </CardHeader>
            <CardContent className="space-y-2">
              <p className="text-3xl font-bold text-primary">{result.peakPowerW} W</p>
              <p className="text-muted-foreground">Power-to-weight: {result.powerToWeight} W/kg</p>
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
          <AccordionTrigger>Complete Guide: Building Anaerobic Power</AccordionTrigger>
          <AccordionContent className="text-muted-foreground space-y-3">
            <ul className="list-disc list-inside space-y-1">
              <li>Develop max strength first, then convert to power.</li>
              <li>Use plyometrics, sprints, and Olympic lift derivatives.</li>
              <li>Prioritize recovery to preserve CNS freshness.</li>
            </ul>
          </AccordionContent>
        </AccordionItem>
        <AccordionItem value="related">
          <AccordionTrigger>Related Calculators</AccordionTrigger>
          <AccordionContent className="text-muted-foreground">
            <ul className="space-y-1">
              <li><a href="/category/health-fitness/one-rep-max-strength-calculator" className="text-primary underline">One Rep Max</a></li>
              <li><a href="/category/health-fitness/critical-power-calculator" className="text-primary underline">Critical Power</a></li>
            </ul>
          </AccordionContent>
        </AccordionItem>
      </Accordion>
    </div>
  );
}



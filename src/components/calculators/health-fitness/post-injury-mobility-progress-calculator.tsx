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
  baselineROMdeg: z.number().min(0).max(200).optional(),
  currentROMdeg: z.number().min(0).max(200).optional(),
  targetROMdeg: z.number().min(0).max(200).optional(),
  weeksSinceStart: z.number().min(0).max(52).optional(),
});

type FormValues = z.infer<typeof formSchema>;

export default function PostInjuryMobilityProgressCalculator() {
  const [result, setResult] = useState<{ progressPercent: number; weeklyRate: number; interpretation: string; opinion: string } | null>(null);
  const form = useForm<FormValues>({ resolver: zodResolver(formSchema), defaultValues: { baselineROMdeg: undefined, currentROMdeg: undefined, targetROMdeg: undefined, weeksSinceStart: undefined } });

  const calculate = (v: FormValues) => {
    if (v.baselineROMdeg == null || v.currentROMdeg == null || v.targetROMdeg == null || v.weeksSinceStart == null) return null;
    const totalGainNeeded = v.targetROMdeg - v.baselineROMdeg;
    const achieved = v.currentROMdeg - v.baselineROMdeg;
    if (totalGainNeeded <= 0) return { progressPercent: 100, weeklyRate: 0 };
    const progressPercent = Math.max(0, Math.min(100, (achieved / totalGainNeeded) * 100));
    const weeklyRate = v.weeksSinceStart > 0 ? achieved / v.weeksSinceStart : 0;
    return { progressPercent, weeklyRate };
  };

  const interpret = (p: number) => {
    if (p >= 80) return 'Excellent progress toward target range of motion.';
    if (p >= 40) return 'Moderate progress; continue progressing loading and mobility.';
    return 'Early-stage progress; focus on frequent, gentle mobility and adherence.';
  };

  const opinion = (rate: number) => {
    if (rate >= 5) return 'Strong weekly gains—maintain current plan and monitor symptoms.';
    if (rate >= 2) return 'Steady gains—consider adding light strengthening in available range.';
    return 'Slow gains—review exercise technique, frequency, and pain thresholds.';
  };

  const onSubmit = (values: FormValues) => {
    const res = calculate(values);
    if (!res) { setResult(null); return; }
    setResult({
      progressPercent: Math.round(res.progressPercent * 10) / 10,
      weeklyRate: Math.round(res.weeklyRate * 10) / 10,
      interpretation: interpret(res.progressPercent),
      opinion: opinion(res.weeklyRate),
    });
  };

  return (
    <div className="space-y-8">
      <Form {...form}>
        <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-6">
          <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
            <FormField control={form.control} name="baselineROMdeg" render={({ field }) => (
              <FormItem>
                <FormLabel>Baseline ROM (°)</FormLabel>
                <FormControl>
                  <Input type="number" step="0.1" placeholder="e.g., 60" {...field} value={field.value ?? ''} onChange={e => field.onChange(parseFloat(e.target.value) || undefined)} />
                </FormControl>
                <FormMessage />
              </FormItem>
            )} />
            <FormField control={form.control} name="currentROMdeg" render={({ field }) => (
              <FormItem>
                <FormLabel>Current ROM (°)</FormLabel>
                <FormControl>
                  <Input type="number" step="0.1" placeholder="e.g., 90" {...field} value={field.value ?? ''} onChange={e => field.onChange(parseFloat(e.target.value) || undefined)} />
                </FormControl>
                <FormMessage />
              </FormItem>
            )} />
            <FormField control={form.control} name="targetROMdeg" render={({ field }) => (
              <FormItem>
                <FormLabel>Target ROM (°)</FormLabel>
                <FormControl>
                  <Input type="number" step="0.1" placeholder="e.g., 120" {...field} value={field.value ?? ''} onChange={e => field.onChange(parseFloat(e.target.value) || undefined)} />
                </FormControl>
                <FormMessage />
              </FormItem>
            )} />
            <FormField control={form.control} name="weeksSinceStart" render={({ field }) => (
              <FormItem>
                <FormLabel>Weeks Since Start</FormLabel>
                <FormControl>
                  <Input type="number" step="0.1" placeholder="e.g., 4" {...field} value={field.value ?? ''} onChange={e => field.onChange(parseFloat(e.target.value) || undefined)} />
                </FormControl>
                <FormMessage />
              </FormItem>
            )} />
          </div>
          <Button type="submit">Evaluate Mobility Progress</Button>
        </form>
      </Form>

      {result && (
        <div className="space-y-6">
          <Card>
            <CardHeader>
              <div className="flex items-center gap-4">
                <Zap className="h-8 w-8 text-primary" />
                <CardTitle>Mobility Progress</CardTitle>
              </div>
              <CardDescription>Relative to your target range</CardDescription>
            </CardHeader>
            <CardContent className="space-y-2">
              <p className="text-3xl font-bold text-primary">{result.progressPercent}%</p>
              <p className="text-muted-foreground">Weekly gain: {result.weeklyRate}°/week</p>
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
          <AccordionTrigger>Complete Guide: Restoring Mobility Post-Injury</AccordionTrigger>
          <AccordionContent className="text-muted-foreground space-y-3">
            <ul className="list-disc list-inside space-y-1">
              <li>Respect pain thresholds and monitor next-day response.</li>
              <li>Use frequent low-load mobility and isometrics early.</li>
              <li>Progress to loaded end-range and functional patterns.</li>
            </ul>
          </AccordionContent>
        </AccordionItem>
        <AccordionItem value="related">
          <AccordionTrigger>Related Calculators</AccordionTrigger>
          <AccordionContent className="text-muted-foreground">
            <ul className="space-y-1">
              <li><a href="/category/health-fitness/physical-therapy-session-intensity-calculator" className="text-primary underline">PT Session Intensity</a></li>
              <li><a href="/category/health-fitness/range-of-motion-progress-calculator" className="text-primary underline">ROM Progress</a></li>
            </ul>
          </AccordionContent>
        </AccordionItem>
      </Accordion>
    </div>
  );
}



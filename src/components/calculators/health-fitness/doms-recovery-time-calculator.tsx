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
  sessionIntensity1to10: z.number().min(1).max(10).optional(),
  eccentricFocusPercent: z.number().min(0).max(100).optional(),
  setsPerMuscle: z.number().min(1).max(40).optional(),
  trainingStatus: z.enum(['novice','intermediate','advanced']).optional(),
});

type FormValues = z.infer<typeof formSchema>;

export default function DOMSRecoveryTimeCalculator() {
  const [result, setResult] = useState<{ recoveryHours: number; interpretation: string; opinion: string } | null>(null);

  const form = useForm<FormValues>({ resolver: zodResolver(formSchema), defaultValues: { sessionIntensity1to10: undefined, eccentricFocusPercent: undefined, setsPerMuscle: undefined, trainingStatus: undefined } });

  const calculate = (v: FormValues) => {
    if (v.sessionIntensity1to10 == null || v.eccentricFocusPercent == null || v.setsPerMuscle == null || v.trainingStatus == null) return null;
    let base = 24 + (v.sessionIntensity1to10 - 5) * 6 + (v.setsPerMuscle - 10) * 1.5 + (v.eccentricFocusPercent/100) * 24;
    const statusFactor = v.trainingStatus === 'novice' ? 1.2 : v.trainingStatus === 'advanced' ? 0.85 : 1.0;
    const hours = Math.max(12, base * statusFactor);
    return Math.round(hours);
  };

  const interpret = (h: number) => {
    if (h > 72) return 'High recovery need—DOMS likely to persist for several days.';
    if (h >= 36) return 'Moderate recovery need—expect DOMS for 1–2 days.';
    return 'Light recovery need—minor soreness expected.';
  };

  const opinion = (h: number) => {
    if (h > 72) return 'Use deloads, massage, sleep 8–9h, and nutrition to aid recovery.';
    if (h >= 36) return 'Active recovery, gentle mobility, and protein + carbs will help.';
    return 'You can resume training sooner; still prioritize hydration and sleep.';
  };

  const onSubmit = (values: FormValues) => {
    const hours = calculate(values);
    if (hours == null) { setResult(null); return; }
    setResult({ recoveryHours: hours, interpretation: interpret(hours), opinion: opinion(hours) });
  };

  return (
    <div className="space-y-8">
      <Form {...form}>
        <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-6">
          <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
            <FormField control={form.control} name="sessionIntensity1to10" render={({ field }) => (
              <FormItem>
                <FormLabel>Intensity (1–10)</FormLabel>
                <FormControl>
                  <Input type="number" step="1" placeholder="e.g., 7" {...field} value={field.value ?? ''} onChange={e => field.onChange(parseFloat(e.target.value) || undefined)} />
                </FormControl>
                <FormMessage />
              </FormItem>
            )} />
            <FormField control={form.control} name="eccentricFocusPercent" render={({ field }) => (
              <FormItem>
                <FormLabel>Eccentric Focus (%)</FormLabel>
                <FormControl>
                  <Input type="number" step="1" placeholder="e.g., 40" {...field} value={field.value ?? ''} onChange={e => field.onChange(parseFloat(e.target.value) || undefined)} />
                </FormControl>
                <FormMessage />
              </FormItem>
            )} />
            <FormField control={form.control} name="setsPerMuscle" render={({ field }) => (
              <FormItem>
                <FormLabel>Sets per Muscle</FormLabel>
                <FormControl>
                  <Input type="number" step="1" placeholder="e.g., 14" {...field} value={field.value ?? ''} onChange={e => field.onChange(parseFloat(e.target.value) || undefined)} />
                </FormControl>
                <FormMessage />
              </FormItem>
            )} />
            <FormField control={form.control} name="trainingStatus" render={({ field }) => (
              <FormItem>
                <FormLabel>Training Status</FormLabel>
                <FormControl>
                  <select className="border rounded h-10 px-3 w-full bg-background" value={field.value ?? ''} onChange={(e) => field.onChange(e.target.value as any)}>
                    <option value="">Select status</option>
                    <option value="novice">Novice</option>
                    <option value="intermediate">Intermediate</option>
                    <option value="advanced">Advanced</option>
                  </select>
                </FormControl>
                <FormMessage />
              </FormItem>
            )} />
          </div>
          <Button type="submit">Estimate Recovery Time</Button>
        </form>
      </Form>

      {result && (
        <div className="space-y-6">
          <Card>
            <CardHeader>
              <div className="flex items-center gap-4">
                <Zap className="h-8 w-8 text-primary" />
                <CardTitle>DOMS Recovery Estimate</CardTitle>
              </div>
              <CardDescription>Time until soreness meaningfully subsides</CardDescription>
            </CardHeader>
            <CardContent className="space-y-2">
              <p className="text-3xl font-bold text-primary">{result.recoveryHours} hours</p>
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
          <AccordionTrigger>Complete Guide: Managing DOMS</AccordionTrigger>
          <AccordionContent className="text-muted-foreground space-y-3">
            <ul className="list-disc list-inside space-y-1">
              <li>Progress volume gradually; avoid sudden spikes.</li>
              <li>Prioritize sleep, protein intake, and hydration.</li>
              <li>Use light movement and mobility to relieve stiffness.</li>
            </ul>
          </AccordionContent>
        </AccordionItem>
        <AccordionItem value="related">
          <AccordionTrigger>Related Calculators</AccordionTrigger>
          <AccordionContent className="text-muted-foreground">
            <ul className="space-y-1">
              <li><a href="/category/health-fitness/recovery-heart-rate-calculator" className="text-primary underline">Recovery Heart Rate</a></li>
              <li><a href="/category/health-fitness/training-volume-calculator" className="text-primary underline">Training Volume</a></li>
            </ul>
          </AccordionContent>
        </AccordionItem>
      </Accordion>
    </div>
  );
}



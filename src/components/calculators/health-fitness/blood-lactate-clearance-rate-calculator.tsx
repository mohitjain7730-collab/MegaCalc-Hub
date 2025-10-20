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
  lactateStartMmolL: z.number().min(0).max(25).optional(),
  lactateEndMmolL: z.number().min(0).max(25).optional(),
  timeMinutes: z.number().min(1).max(240).optional(),
});

type FormValues = z.infer<typeof formSchema>;

export default function BloodLactateClearanceRateCalculator() {
  const [result, setResult] = useState<{ clearanceMmolLPerMin: number; halfLifeMin: number; interpretation: string; opinion: string } | null>(null);
  const form = useForm<FormValues>({ resolver: zodResolver(formSchema), defaultValues: { lactateStartMmolL: undefined, lactateEndMmolL: undefined, timeMinutes: undefined } });

  const calculate = (v: FormValues) => {
    if (v.lactateStartMmolL == null || v.lactateEndMmolL == null || v.timeMinutes == null) return null;
    const delta = v.lactateStartMmolL - v.lactateEndMmolL;
    const rate = delta / v.timeMinutes;
    // Approximate half-life using first-order decay: k ~ rate / start; t1/2 = ln(2)/k
    const k = v.lactateStartMmolL > 0 ? rate / v.lactateStartMmolL : 0;
    const halfLife = k > 0 ? Math.log(2) / k : 0;
    return { rate, halfLife };
  };

  const interpret = (rate: number) => {
    if (rate >= 0.1) return 'Fast clearance—strong aerobic recovery and metabolic flexibility.';
    if (rate >= 0.05) return 'Moderate clearance—typical trained response.';
    return 'Slow clearance—build aerobic base and active recovery capacity.';
  };

  const opinion = (rate: number) => {
    if (rate >= 0.1) return 'Maintain aerobic conditioning with threshold and tempo work.';
    if (rate >= 0.05) return 'Include steady-state and low-intensity volume to improve further.';
    return 'Emphasize Zone 2 volume and gentle active recovery sessions.';
  };

  const onSubmit = (values: FormValues) => {
    const res = calculate(values);
    if (!res) { setResult(null); return; }
    setResult({
      clearanceMmolLPerMin: Math.round(res.rate * 1000) / 1000,
      halfLifeMin: Math.round(res.halfLife * 10) / 10,
      interpretation: interpret(res.rate),
      opinion: opinion(res.rate),
    });
  };

  return (
    <div className="space-y-8">
      <Form {...form}>
        <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-6">
          <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
            <FormField control={form.control} name="lactateStartMmolL" render={({ field }) => (
              <FormItem>
                <FormLabel>Starting Lactate (mmol/L)</FormLabel>
                <FormControl>
                  <Input type="number" step="0.1" placeholder="e.g., 8.0" {...field} value={field.value ?? ''} onChange={e => field.onChange(parseFloat(e.target.value) || undefined)} />
                </FormControl>
                <FormMessage />
              </FormItem>
            )} />
            <FormField control={form.control} name="lactateEndMmolL" render={({ field }) => (
              <FormItem>
                <FormLabel>Ending Lactate (mmol/L)</FormLabel>
                <FormControl>
                  <Input type="number" step="0.1" placeholder="e.g., 2.5" {...field} value={field.value ?? ''} onChange={e => field.onChange(parseFloat(e.target.value) || undefined)} />
                </FormControl>
                <FormMessage />
              </FormItem>
            )} />
            <FormField control={form.control} name="timeMinutes" render={({ field }) => (
              <FormItem>
                <FormLabel>Time (minutes)</FormLabel>
                <FormControl>
                  <Input type="number" step="1" placeholder="e.g., 30" {...field} value={field.value ?? ''} onChange={e => field.onChange(parseFloat(e.target.value) || undefined)} />
                </FormControl>
                <FormMessage />
              </FormItem>
            )} />
          </div>
          <Button type="submit">Estimate Clearance Rate</Button>
        </form>
      </Form>

      {result && (
        <div className="space-y-6">
          <Card>
            <CardHeader>
              <div className="flex items-center gap-4">
                <Zap className="h-8 w-8 text-primary" />
                <CardTitle>Lactate Clearance</CardTitle>
              </div>
              <CardDescription>Rate and estimated half-life</CardDescription>
            </CardHeader>
            <CardContent className="space-y-2">
              <p className="text-3xl font-bold text-primary">{result.clearanceMmolLPerMin} mmol/L/min</p>
              <p className="text-muted-foreground">Estimated half-life: {result.halfLifeMin} min</p>
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
          <AccordionTrigger>Complete Guide: Improving Lactate Clearance</AccordionTrigger>
          <AccordionContent className="text-muted-foreground space-y-3">
            <ul className="list-disc list-inside space-y-1">
              <li>Build aerobic base with Zone 2 and tempo sessions.</li>
              <li>Use active recovery to accelerate clearance post-intense efforts.</li>
              <li>Periodize training to balance high-intensity with recovery.</li>
            </ul>
          </AccordionContent>
        </AccordionItem>
        <AccordionItem value="related">
          <AccordionTrigger>Related Calculators</AccordionTrigger>
          <AccordionContent className="text-muted-foreground">
            <ul className="space-y-1">
              <li><a href="/category/health-fitness/anaerobic-threshold-calculator" className="text-primary underline">Anaerobic Threshold</a></li>
              <li><a href="/category/health-fitness/maximum-lactate-steady-state-calculator" className="text-primary underline">MLSS Calculator</a></li>
            </ul>
          </AccordionContent>
        </AccordionItem>
      </Accordion>
    </div>
  );
}



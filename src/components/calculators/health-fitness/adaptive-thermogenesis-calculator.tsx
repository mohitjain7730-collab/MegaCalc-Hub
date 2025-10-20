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
  baselineMaintenanceKcal: z.number().min(1000).max(5000).optional(),
  recentWeightChangeKg: z.number().min(-20).max(20).optional(),
  weeks: z.number().min(1).max(52).optional(),
});

type FormValues = z.infer<typeof formSchema>;

export default function AdaptiveThermogenesisCalculator() {
  const [result, setResult] = useState<{ adjustedMaintenance: number; adaptationKcal: number; interpretation: string; opinion: string } | null>(null);
  const form = useForm<FormValues>({ resolver: zodResolver(formSchema), defaultValues: { baselineMaintenanceKcal: undefined, recentWeightChangeKg: undefined, weeks: undefined } });

  const calculate = (v: FormValues) => {
    if (v.baselineMaintenanceKcal == null || v.recentWeightChangeKg == null || v.weeks == null) return null;
    // Heuristic: For rapid weight loss, metabolic rate may adapt downward ~5-15% depending on rate
    const ratePerWeek = v.recentWeightChangeKg / v.weeks; // kg/week, negative is loss
    let adaptPct = 0;
    if (ratePerWeek <= -0.5) adaptPct = 0.12;
    else if (ratePerWeek <= -0.25) adaptPct = 0.08;
    else if (ratePerWeek <= -0.1) adaptPct = 0.05;
    const adaptation = v.baselineMaintenanceKcal * adaptPct;
    const adjusted = v.baselineMaintenanceKcal - adaptation;
    return { adaptation, adjusted };
  };

  const interpret = (adapt: number) => {
    if (adapt >= 300) return 'Notable adaptive thermogenesis—expect lower-than-predicted maintenance.';
    if (adapt >= 100) return 'Moderate adaptation—monitor intake and biofeedback.';
    return 'Minimal adaptation—standard calculations may suffice.';
  };

  const opinion = (adaptPctStr: string) => `Use diet breaks, resistance training, and adequate protein to mitigate a ${adaptPctStr} reduction.`;

  const onSubmit = (values: FormValues) => {
    const res = calculate(values);
    if (!res) { setResult(null); return; }
    const adaptPctStr = Math.round((res.adaptation / values.baselineMaintenanceKcal!) * 1000) / 10 + '%';
    setResult({ adjustedMaintenance: Math.round(res.adjusted), adaptationKcal: Math.round(res.adaptation), interpretation: interpret(res.adaptation), opinion: opinion(adaptPctStr) });
  };

  return (
    <div className="space-y-8">
      <Form {...form}>
        <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-6">
          <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
            <FormField control={form.control} name="baselineMaintenanceKcal" render={({ field }) => (
              <FormItem>
                <FormLabel>Baseline Maintenance (kcal/day)</FormLabel>
                <FormControl>
                  <Input type="number" step="10" placeholder="e.g., 2300" {...(field as any)} value={field.value ?? ''} onChange={e => field.onChange(parseFloat(e.target.value) || undefined)} />
                </FormControl>
                <FormMessage />
              </FormItem>
            )} />
            <FormField control={form.control} name="recentWeightChangeKg" render={({ field }) => (
              <FormItem>
                <FormLabel>Recent Weight Change (kg)</FormLabel>
                <FormControl>
                  <Input type="number" step="0.1" placeholder="e.g., -3" {...(field as any)} value={field.value ?? ''} onChange={e => field.onChange(parseFloat(e.target.value) || undefined)} />
                </FormControl>
                <FormMessage />
              </FormItem>
            )} />
            <FormField control={form.control} name="weeks" render={({ field }) => (
              <FormItem>
                <FormLabel>Weeks</FormLabel>
                <FormControl>
                  <Input type="number" step="1" placeholder="e.g., 6" {...(field as any)} value={field.value ?? ''} onChange={e => field.onChange(parseFloat(e.target.value) || undefined)} />
                </FormControl>
                <FormMessage />
              </FormItem>
            )} />
          </div>
          <Button type="submit">Estimate Adaptation</Button>
        </form>
      </Form>

      {result && (
        <div className="space-y-6">
          <Card>
            <CardHeader>
              <div className="flex items-center gap-4">
                <Zap className="h-8 w-8 text-primary" />
                <CardTitle>Adaptive Thermogenesis</CardTitle>
              </div>
              <CardDescription>Estimated maintenance reduction</CardDescription>
            </CardHeader>
            <CardContent className="space-y-2">
              <p className="text-muted-foreground">Adjustment: <span className="font-semibold text-foreground">-{result.adaptationKcal} kcal/day</span></p>
              <p className="text-muted-foreground">Adjusted maintenance: <span className="font-semibold text-foreground">{result.adjustedMaintenance} kcal/day</span></p>
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
          <AccordionTrigger>Complete Guide: Adaptive Thermogenesis</AccordionTrigger>
          <AccordionContent className="text-muted-foreground space-y-3">
            <ul className="list-disc list-inside space-y-1">
              <li>Faster weight loss increases metabolic adaptation risk.</li>
              <li>Diet breaks, strength training, and protein help preserve expenditure.</li>
              <li>Use trends over weeks to re-calibrate targets.</li>
            </ul>
          </AccordionContent>
        </AccordionItem>
        <AccordionItem value="related">
          <AccordionTrigger>Related Calculators</AccordionTrigger>
          <AccordionContent className="text-muted-foreground">
            <ul className="space-y-1">
              <li><a href="/category/health-fitness/daily-calorie-needs-calculator" className="text-primary underline">Daily Calorie Needs</a></li>
              <li><a href="/category/health-fitness/resting-metabolic-rate-calculator" className="text-primary underline">RMR Calculator</a></li>
            </ul>
          </AccordionContent>
        </AccordionItem>
      </Accordion>
    </div>
  );
}



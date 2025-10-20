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
  vo2MaxMlMin: z.number().positive('Enter VO2 (ml/min)').optional(),
  bodyMassKg: z.number().positive('Enter mass (kg)').optional(),
  bodyFatPercent: z.number().min(0).max(60).optional(),
});

type FormValues = z.infer<typeof formSchema>;

export default function VO2PerKgLeanMassCalculator() {
  const [result, setResult] = useState<{ vo2PerKg: number; vo2PerKgLean: number; interpretation: string; opinion: string } | null>(null);
  const form = useForm<FormValues>({ resolver: zodResolver(formSchema), defaultValues: { vo2MaxMlMin: undefined, bodyMassKg: undefined, bodyFatPercent: undefined } });

  const calculate = (v: FormValues) => {
    if (v.vo2MaxMlMin == null || v.bodyMassKg == null || v.bodyFatPercent == null) return null;
    const vo2PerKg = v.vo2MaxMlMin / v.bodyMassKg;
    const leanMassKg = v.bodyMassKg * (1 - v.bodyFatPercent / 100);
    const vo2PerKgLean = v.vo2MaxMlMin / leanMassKg;
    return { vo2PerKg, vo2PerKgLean };
  };

  const interpret = (vkg: number, vkgLean: number) => {
    const note = vkgLean - vkg > 10 ? 'Lean-mass normalization highlights aerobic capacity independent of fat mass.' : 'Similar normalized values suggest stable composition effect.';
    return note;
  };

  const opinion = (vkg: number) => {
    if (vkg >= 60) return 'Excellent aerobic fitness; maintain with structured endurance and thresholds.';
    if (vkg >= 40) return 'Good fitness; add tempo and intervals to raise ceiling.';
    return 'Build aerobic base with consistent Zone 2 and moderate volume.';
  };

  const onSubmit = (values: FormValues) => {
    const res = calculate(values);
    if (!res) { setResult(null); return; }
    setResult({
      vo2PerKg: Math.round(res.vo2PerKg * 10) / 10,
      vo2PerKgLean: Math.round(res.vo2PerKgLean * 10) / 10,
      interpretation: interpret(res.vo2PerKg, res.vo2PerKgLean),
      opinion: opinion(res.vo2PerKg),
    });
  };

  return (
    <div className="space-y-8">
      <Form {...form}>
        <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-6">
          <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
            <FormField control={form.control} name="vo2MaxMlMin" render={({ field }) => (
              <FormItem>
                <FormLabel>VO2 Max (ml/min)</FormLabel>
                <FormControl>
                  <Input type="number" step="1" placeholder="e.g., 3200" {...field} value={field.value ?? ''} onChange={e => field.onChange(parseFloat(e.target.value) || undefined)} />
                </FormControl>
                <FormMessage />
              </FormItem>
            )} />
            <FormField control={form.control} name="bodyMassKg" render={({ field }) => (
              <FormItem>
                <FormLabel>Body Mass (kg)</FormLabel>
                <FormControl>
                  <Input type="number" step="0.1" placeholder="e.g., 68" {...field} value={field.value ?? ''} onChange={e => field.onChange(parseFloat(e.target.value) || undefined)} />
                </FormControl>
                <FormMessage />
              </FormItem>
            )} />
            <FormField control={form.control} name="bodyFatPercent" render={({ field }) => (
              <FormItem>
                <FormLabel>Body Fat (%)</FormLabel>
                <FormControl>
                  <Input type="number" step="0.1" placeholder="e.g., 20" {...field} value={field.value ?? ''} onChange={e => field.onChange(parseFloat(e.target.value) || undefined)} />
                </FormControl>
                <FormMessage />
              </FormItem>
            )} />
          </div>
          <Button type="submit">Calculate VO2 Normalizations</Button>
        </form>
      </Form>

      {result && (
        <div className="space-y-6">
          <Card>
            <CardHeader>
              <div className="flex items-center gap-4">
                <Zap className="h-8 w-8 text-primary" />
                <CardTitle>VO2 Normalized Results</CardTitle>
              </div>
              <CardDescription>Per kg total mass vs per kg lean mass</CardDescription>
            </CardHeader>
            <CardContent className="space-y-2">
              <p className="text-3xl font-bold text-primary">{result.vo2PerKg} ml/min/kg</p>
              <p className="text-muted-foreground">Lean-mass normalized: {result.vo2PerKgLean} ml/min/kg</p>
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
          <AccordionTrigger>Complete Guide: VO2 Normalization</AccordionTrigger>
          <AccordionContent className="text-muted-foreground space-y-3">
            <ul className="list-disc list-inside space-y-1">
              <li>Per-kg metrics allow fair comparisons across body sizes.</li>
              <li>Lean-mass normalization can reveal cardiorespiratory capacity independent of fat mass.</li>
              <li>Train both aerobic base and economy to improve VO2-related performance.</li>
            </ul>
          </AccordionContent>
        </AccordionItem>
        <AccordionItem value="related">
          <AccordionTrigger>Related Calculators</AccordionTrigger>
          <AccordionContent className="text-muted-foreground">
            <ul className="space-y-1">
              <li><a href="/category/health-fitness/vo2-max-calculator" className="text-primary underline">VO2 Max</a></li>
              <li><a href="/category/health-fitness/lean-body-mass-calculator" className="text-primary underline">Lean Body Mass</a></li>
            </ul>
          </AccordionContent>
        </AccordionItem>
      </Accordion>
    </div>
  );
}



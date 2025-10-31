'use client';

import { useState } from 'react';
import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import { z } from 'zod';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Form, FormControl, FormField, FormItem, FormLabel, FormMessage } from '@/components/ui/form';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import Link from 'next/link';
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

      <Card>
        <CardHeader>
          <CardTitle>Related Calculators</CardTitle>
          <CardDescription>Explore connected physiology</CardDescription>
        </CardHeader>
        <CardContent>
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div className="p-4 border rounded"><h4 className="font-semibold mb-1"><Link href="/category/health-fitness/vo2-max-calculator" className="text-primary hover:underline">VO₂ Max Calculator</Link></h4><p className="text-sm text-muted-foreground">Aerobic capacity baseline.</p></div>
            <div className="p-4 border rounded"><h4 className="font-semibold mb-1"><Link href="/category/health-fitness/capillary-density-estimator" className="text-primary hover:underline">Capillary Density</Link></h4><p className="text-sm text-muted-foreground">Peripheral oxygen delivery.</p></div>
            <div className="p-4 border rounded"><h4 className="font-semibold mb-1"><Link href="/category/health-fitness/myoglobin-oxygen-storage-calculator" className="text-primary hover:underline">Myoglobin O₂ Storage</Link></h4><p className="text-sm text-muted-foreground">Intramuscular reserve.</p></div>
            <div className="p-4 border rounded"><h4 className="font-semibold mb-1"><Link href="/category/health-fitness/altitude-acclimatization-oxygen-need-calculator" className="text-primary hover:underline">Altitude O₂ Need</Link></h4><p className="text-sm text-muted-foreground">Training at elevation.</p></div>
          </div>
        </CardContent>
      </Card>

      <Card>
        <CardHeader><CardTitle>Complete Guide: RBC, Hemoglobin & VO₂ Max</CardTitle></CardHeader>
        <CardContent className="prose prose-sm dark:prose-invert max-w-none">
          <p>This is a sample line for the complete guide section. You can add your detailed content here.</p>
          <p>This is another sample line for the guide section. Replace these with your comprehensive guide content.</p>
        </CardContent>
      </Card>

      <Card>
        <CardHeader>
          <CardTitle>Frequently Asked Questions</CardTitle>
          <CardDescription>SEO‑oriented explanations</CardDescription>
        </CardHeader>
        <CardContent className="space-y-4">
          {[
            ['How do hemoglobin and RBC affect VO₂ Max?', 'They determine blood oxygen carrying capacity. Higher hemoglobin and total red cell mass can raise the ceiling for aerobic performance.'],
            ['What is a typical hemoglobin level?', 'Around 15 g/dL for many adults; hydration, sex, altitude, and lab methods influence results.'],
            ['Can training raise hemoglobin?', 'Endurance training, especially at altitude, can increase total hemoglobin mass over time.'],
            ['Do supplements help?', 'Only if a deficiency exists. Iron and B12 should be targeted based on testing and clinical advice.'],
            ['Why does hydration change readings?', 'Plasma volume shifts dilute or concentrate blood, altering measured g/dL without changing red cell mass.'],
            ['Is this calculator medical advice?', 'No—estimates are educational and should not replace clinical assessment or treatment.'],
            ['How accurate is the adjustment?', 'It uses a simplified model emphasizing hemoglobin with a minor RBC contribution; individual physiology varies.'],
            ['What else limits VO₂ Max?', 'Cardiac output, muscle oxidative capacity, and biomechanics are major determinants alongside hematology.'],
          ].map(([q,a],i)=> (<div key={i}><h4 className="font-semibold mb-1">{q}</h4><p className="text-sm text-muted-foreground">{a}</p></div>))}
        </CardContent>
      </Card>
    </div>
  );
}



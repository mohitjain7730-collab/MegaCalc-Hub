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
import { Zap, TestTube, Timer, Calendar } from 'lucide-react';

const formSchema = z.object({
  lactateStartMmolL: z.number().min(0).max(25).optional(),
  lactateEndMmolL: z.number().min(0).max(25).optional(),
  timeMinutes: z.number().min(1).max(240).optional(),
});

type FormValues = z.infer<typeof formSchema>;

export default function BloodLactateClearanceRateCalculator() {
  const [result, setResult] = useState<{ clearanceMmolLPerMin: number; halfLifeMin: number; interpretation: string; recommendations: string[]; warnings: string[]; plan: { week: number; focus: string }[] } | null>(null);
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

  const recs = (rate: number) => {
    if (rate >= 0.1) return ['Maintain threshold/tempo blocks', 'Use active recovery after hard efforts'];
    if (rate >= 0.05) return ['Increase steady‑state volume', 'Add aerobic intervals near LT1‑LT2'];
    return ['Emphasize Zone 2 volume', 'Short easy spins/jogs for active recovery'];
  };
  const warns = () => ['Avoid stacking high‑intensity days back‑to‑back', 'Monitor HRV/resting HR for accumulated fatigue', 'Hydrate and fuel to aid clearance'];
  const plan = () => ([
    { week: 1, focus: 'Baseline easy volume + one tempo' },
    { week: 2, focus: 'Add long Zone 2; short threshold set' },
    { week: 3, focus: 'Progress tempo duration' },
    { week: 4, focus: 'Deload; emphasize recovery' },
    { week: 5, focus: 'Rebuild volume; add aerobic intervals' },
    { week: 6, focus: 'Slight intensity progression' },
    { week: 7, focus: 'Race‑specific workouts or bricks' },
    { week: 8, focus: 'Re‑test lactate or field proxy' },
  ]);

  const onSubmit = (values: FormValues) => {
    const res = calculate(values);
    if (!res) { setResult(null); return; }
    setResult({
      clearanceMmolLPerMin: Math.round(res.rate * 1000) / 1000,
      halfLifeMin: Math.round(res.halfLife * 10) / 10,
      interpretation: interpret(res.rate),
      recommendations: recs(res.rate),
      warnings: warns(),
      plan: plan(),
    });
  };

  return (
    <div className="space-y-8">
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2"><TestTube className="h-5 w-5" /> Lactate Clearance Estimator</CardTitle>
          <CardDescription>Compute clearance rate and approximate half‑life</CardDescription>
        </CardHeader>
        <CardContent>
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
                <FormLabel className="flex items-center gap-2"><Timer className="h-4 w-4" /> Time (minutes)</FormLabel>
                <FormControl>
                  <Input type="number" step="1" placeholder="e.g., 30" {...field} value={field.value ?? ''} onChange={e => field.onChange(parseFloat(e.target.value) || undefined)} />
                </FormControl>
                <FormMessage />
              </FormItem>
            )} />
          </div>
          <Button type="submit" className="w-full md:w-auto">Estimate Clearance Rate</Button>
        </form>
      </Form>
        </CardContent>
      </Card>

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
            <CardContent className="space-y-4">
              <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                <div className="text-center p-6 bg-primary/5 rounded-lg"><p className="text-sm text-muted-foreground mb-1">Clearance Rate</p><p className="text-3xl font-bold text-primary">{result.clearanceMmolLPerMin} mmol/L/min</p></div>
                <div className="text-center p-6 bg-green-50 dark:bg-green-950/20 rounded-lg"><p className="text-sm text-muted-foreground mb-1">Estimated Half‑life</p><p className="text-3xl font-bold text-green-600">{result.halfLifeMin} min</p></div>
              </div>
              <p className="text-sm">{result.interpretation}</p>
            </CardContent>
          </Card>
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            <Card><CardHeader><CardTitle>Recommendations</CardTitle></CardHeader><CardContent><ul className="space-y-2">{result.recommendations.map((r,i)=>(<li key={i} className="text-sm text-muted-foreground">{r}</li>))}</ul></CardContent></Card>
            <Card><CardHeader><CardTitle>Warning Signs</CardTitle></CardHeader><CardContent><ul className="space-y-2">{result.warnings.map((w,i)=>(<li key={i} className="text-sm text-muted-foreground">{w}</li>))}</ul></CardContent></Card>
          </div>
          <Card>
            <CardHeader><CardTitle className="flex items-center gap-2"><Calendar className="h-5 w-5" /> 8‑Week Plan</CardTitle></CardHeader>
            <CardContent><div className="overflow-x-auto"><table className="w-full text-sm"><thead><tr className="border-b"><th className="text-left p-2">Week</th><th className="text-left p-2">Focus</th></tr></thead><tbody>{result.plan.map(p=> (<tr key={p.week} className="border-b"><td className="p-2">{p.week}</td><td className="p-2">{p.focus}</td></tr>))}</tbody></table></div></CardContent>
          </Card>
        </div>
      )}

      <Card>
        <CardHeader><CardTitle>Related Calculators</CardTitle><CardDescription>Thresholds and endurance</CardDescription></CardHeader>
        <CardContent>
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div className="p-4 border rounded"><h4 className="font-semibold mb-1"><Link href="/category/health-fitness/anaerobic-threshold-calculator" className="text-primary hover:underline">Anaerobic Threshold</Link></h4><p className="text-sm text-muted-foreground">Set training zones.</p></div>
            <div className="p-4 border rounded"><h4 className="font-semibold mb-1"><Link href="/category/health-fitness/maximum-lactate-steady-state-calculator" className="text-primary hover:underline">MLSS Calculator</Link></h4><p className="text-sm text-muted-foreground">Sustainable hard pace.</p></div>
            <div className="p-4 border rounded"><h4 className="font-semibold mb-1"><Link href="/category/health-fitness/heart-rate-zone-training-calculator" className="text-primary hover:underline">Heart Rate Zones</Link></h4><p className="text-sm text-muted-foreground">Guide intensities.</p></div>
            <div className="p-4 border rounded"><h4 className="font-semibold mb-1"><Link href="/category/health-fitness/vo2-max-calculator" className="text-primary hover:underline">VO₂ Max</Link></h4><p className="text-sm text-muted-foreground">Aerobic ceiling.</p></div>
          </div>
        </CardContent>
      </Card>

      <Card>
        <CardHeader><CardTitle>Complete Guide: Improving Lactate Clearance</CardTitle></CardHeader>
        <CardContent className="prose prose-sm dark:prose-invert max-w-none"><p>This is a sample line for the complete guide section. You can add your detailed content here.</p><p>This is another sample line for the guide section. Replace these with your comprehensive guide content.</p></CardContent>
      </Card>

      <Card>
        <CardHeader><CardTitle>Frequently Asked Questions</CardTitle><CardDescription>Detailed, SEO‑oriented answers</CardDescription></CardHeader>
        <CardContent className="space-y-4">{[
          ['What is lactate clearance?', 'The rate at which blood lactate declines after intense work, reflecting aerobic recovery and metabolic flexibility.'],
          ['Do I need lactate testing?', 'Field proxies (HR recovery, RPE) are helpful, but periodic lactate testing offers precise insights for advanced athletes.'],
          ['How can I improve clearance?', 'Build aerobic base, add tempo/threshold, and use active recovery after hard sessions.'],
          ['Is high clearance always good?', 'Faster clearance usually indicates better recovery, but context matters—consider performance and fatigue together.'],
          ['Does hydration affect lactate?', 'Yes, dehydration impairs clearance and increases cardiovascular strain.'],
          ['How often to test?', 'Every 6–8 weeks or at the end of training blocks to guide progression.'],
          ['Can diet influence clearance?', 'Adequate carbs support glycolytic work and subsequent clearance; overall energy availability is key.'],
        ].map(([q,a],i)=> (<div key={i}><h4 className="font-semibold mb-1">{q}</h4><p className="text-sm text-muted-foreground">{a}</p></div>))}</CardContent>
      </Card>
    </div>
  );
}



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
import { Zap, Info } from 'lucide-react';

// Simplified model: capillary-to-fiber ratio increases with endurance training volume and weeks
const formSchema = z.object({
  baselineCFR: z.number().min(1).max(3).optional(), // capillaries per fiber
  weeklyAerobicHrs: z.number().min(0).max(20).optional(),
  weeksOfTraining: z.number().min(0).max(52).optional(),
});

type FormValues = z.infer<typeof formSchema>;

export default function CapillaryDensityEstimator() {
  const [result, setResult] = useState<{ cfr: number; percentGain: number; interpretation: string } | null>(null);
  const form = useForm<FormValues>({ resolver: zodResolver(formSchema), defaultValues: { baselineCFR: undefined, weeklyAerobicHrs: undefined, weeksOfTraining: undefined } });

  const calculate = (v: FormValues) => {
    if (v.baselineCFR == null || v.weeklyAerobicHrs == null || v.weeksOfTraining == null) return null;
    // Simple heuristic: ~0.5% gain per aerobic hour per week up to 8h, attenuated by weeks
    const hrs = Math.min(8, v.weeklyAerobicHrs);
    const weeklyGain = 0.005 * hrs;
    const cap = 0.25; // max 25% over baseline in this heuristic horizon
    const totalGain = Math.min(cap, weeklyGain * Math.sqrt(v.weeksOfTraining));
    const cfr = v.baselineCFR * (1 + totalGain);
    return { cfr, percentGain: totalGain * 100 };
  };

  const interpret = (gain: number) => {
    if (gain >= 15) return 'Meaningful microvascular remodeling expected; may improve oxygen delivery and endurance.';
    if (gain >= 5) return 'Moderate capillarization; continue progressive volume and include tempo work.';
    return 'Early adaptations; build frequency and consistency to drive structural changes.';
  };

  const onSubmit = (v: FormValues) => {
    const r = calculate(v);
    if (!r) { setResult(null); return; }
    setResult({ cfr: Math.round(r.cfr * 100) / 100, percentGain: Math.round(r.percentGain * 10) / 10, interpretation: interpret(r.percentGain) });
  };

  return (
    <div className="space-y-8">
      <Form {...form}>
        <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-6">
          <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
            <FormField control={form.control} name="baselineCFR" render={({ field }) => (
              <FormItem>
                <FormLabel>Baseline Capillaries/Fiber</FormLabel>
                <FormControl><Input type="number" step="0.01" placeholder="e.g., 1.8" {...field} value={field.value ?? ''} onChange={e=>field.onChange(parseFloat(e.target.value) || undefined)} /></FormControl>
                <FormMessage />
              </FormItem>
            )} />
            <FormField control={form.control} name="weeklyAerobicHrs" render={({ field }) => (
              <FormItem>
                <FormLabel>Aerobic Hours/Week</FormLabel>
                <FormControl><Input type="number" step="0.1" placeholder="e.g., 5" {...field} value={field.value ?? ''} onChange={e=>field.onChange(parseFloat(e.target.value) || undefined)} /></FormControl>
                <FormMessage />
              </FormItem>
            )} />
            <FormField control={form.control} name="weeksOfTraining" render={({ field }) => (
              <FormItem>
                <FormLabel>Weeks of Training</FormLabel>
                <FormControl><Input type="number" step="1" placeholder="e.g., 12" {...field} value={field.value ?? ''} onChange={e=>field.onChange(parseInt(e.target.value,10) || undefined)} /></FormControl>
                <FormMessage />
              </FormItem>
            )} />
          </div>
          <Button type="submit"><Zap className="h-4 w-4 mr-2" />Estimate Capillary Density</Button>
        </form>
      </Form>

      {result && (
        <Card>
          <CardHeader>
            <div className="flex items-center gap-4"><Zap className="h-8 w-8 text-primary" /><div><CardTitle>Estimated Capillary-to-Fiber Ratio</CardTitle><CardDescription>Training‑driven remodeling</CardDescription></div></div>
          </CardHeader>
          <CardContent>
            <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
              <div className="text-center p-6 bg-primary/5 rounded-lg"><p className="text-sm text-muted-foreground mb-1">C/F Ratio</p><p className="text-3xl font-bold text-primary">{result.cfr}</p></div>
              <div className="text-center p-6 bg-muted/50 rounded-lg"><p className="text-sm text-muted-foreground mb-1">Estimated Gain</p><p className="text-2xl font-bold">{result.percentGain}%</p></div>
              <div className="text-center p-6 bg-green-50 dark:bg-green-950/20 rounded-lg"><p className="text-sm text-muted-foreground mb-1">Summary</p><p className="text-sm">{result.interpretation}</p></div>
            </div>
          </CardContent>
        </Card>
      )}

      <Card>
        <CardHeader>
          <CardTitle>Related Calculators</CardTitle>
          <CardDescription>Explore aerobic physiology tools</CardDescription>
        </CardHeader>
        <CardContent>
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div className="p-4 border rounded"><h4 className="font-semibold mb-1"><Link href="/category/health-fitness/vo2-max-calculator" className="text-primary hover:underline">VO₂ Max Calculator</Link></h4><p className="text-sm text-muted-foreground">Assess cardiorespiratory fitness.</p></div>
            <div className="p-4 border rounded"><h4 className="font-semibold mb-1"><Link href="/category/health-fitness/maximal-aerobic-speed-mas-calculator" className="text-primary hover:underline">Maximal Aerobic Speed</Link></h4><p className="text-sm text-muted-foreground">Set endurance training paces.</p></div>
            <div className="p-4 border rounded"><h4 className="font-semibold mb-1"><Link href="/category/health-fitness/red-blood-cell-count-effect-on-vo2-max-calculator" className="text-primary hover:underline">RBC Effect on VO₂ Max</Link></h4><p className="text-sm text-muted-foreground">O₂ transport and performance.</p></div>
            <div className="p-4 border rounded"><h4 className="font-semibold mb-1"><Link href="/category/health-fitness/altitude-acclimatization-oxygen-need-calculator" className="text-primary hover:underline">Altitude O₂ Need</Link></h4><p className="text-sm text-muted-foreground">Plan training at elevation.</p></div>
          </div>
        </CardContent>
      </Card>

      <Card>
        <CardHeader><CardTitle>Complete Guide to Capillarization</CardTitle></CardHeader>
        <CardContent className="prose prose-sm dark:prose-invert max-w-none">
          <p>This is a sample line for the complete guide section. You can add your detailed content here.</p>
          <p>This is another sample line for the guide section. Replace these with your comprehensive guide content.</p>
        </CardContent>
      </Card>

      <Card>
        <CardHeader>
          <CardTitle>Frequently Asked Questions</CardTitle>
          <CardDescription>SEO‑focused answers about capillary density</CardDescription>
        </CardHeader>
        <CardContent className="space-y-4">
          {[
            ['What is capillary density?', 'It is the number of small blood vessels per muscle fiber or area, improving oxygen delivery and waste removal.'],
            ['How fast does capillarization occur?', 'Structural changes emerge over weeks; consistent aerobic training accelerates remodeling.'],
            ['What sessions stimulate capillaries?', 'Zone 2 volume, long runs/rides, and tempo efforts promote angiogenesis.'],
            ['Does HIIT help?', 'Intervals complement volume but chronic aerobic load is the main driver of capillary growth.'],
            ['How does density affect endurance?', 'More capillaries shorten diffusion distance, improving O₂ delivery and lactate clearance.'],
            ['Is there a limit?', 'Gains plateau; this tool caps at ~25% in the given horizon to reflect diminishing returns.'],
            ['How to support angiogenesis nutritionally?', 'Adequate iron, nitrates (beet), polyphenols, and overall energy availability help.'],
            ['Does altitude change density?', 'Chronic hypoxia may aid vascular remodeling but requires careful load management.'],
          ].map(([q,a],i)=> (<div key={i}><h4 className="font-semibold mb-1">{q}</h4><p className="text-sm text-muted-foreground">{a}</p></div>))}
        </CardContent>
      </Card>
    </div>
  );
}

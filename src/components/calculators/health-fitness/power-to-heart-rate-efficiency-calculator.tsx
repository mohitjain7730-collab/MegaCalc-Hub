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
import { Zap, Gauge, HeartPulse, Timer, Calendar } from 'lucide-react';

const formSchema = z.object({
  averagePowerW: z.number().min(50).max(600).optional(),
  averageHrBpm: z.number().min(40).max(220).optional(),
  durationMinutes: z.number().min(10).max(300).optional(),
});

type FormValues = z.infer<typeof formSchema>;

type ResultPayload = {
  status: string;
  interpretation: string;
  recommendations: string[];
  warningSigns: string[];
  plan: { week: number; focus: string }[];
  wattsPerBpm: number;
};

const plan = (): { week: number; focus: string }[] => [
  { week: 1, focus: 'Collect steady-state ride data (power, HR) under similar conditions' },
  { week: 2, focus: 'Add aerobic volume at low HR to build cardiac efficiency' },
  { week: 3, focus: 'Introduce tempo sessions to improve power at sub-threshold HR' },
  { week: 4, focus: 'Deload slightly; assess hydration and fueling for steady rides' },
  { week: 5, focus: 'Include long endurance rides to raise stroke volume and economy' },
  { week: 6, focus: 'Perform one threshold session to shift power-HR relationship' },
  { week: 7, focus: 'Re-test watts per bpm on a standardized route' },
  { week: 8, focus: 'Update training zones and fueling to reflect improvements' },
];

const faqs: [string, string][] = [
  ['What is watts per bpm?', 'Watts per bpm indicates how much power you produce per heartbeat at a steady effort. Higher values suggest better efficiency.'],
  ['How should I collect data?', 'Use steady routes or indoor trainer sessions. Stay at a consistent perceived effort and avoid surges, heat, or dehydration that inflate HR.'],
  ['What is a good value?', 'It varies by athlete and discipline. Track your own trends over time under consistent conditions.'],
  ['Does cadence matter?', 'Yes. Cadence influences cardiovascular strain and muscular demand. Keep it consistent between tests.'],
  ['How often should I re-test?', 'Every 4–8 weeks or after a training phase aimed at aerobic efficiency.'],
  ['Does temperature affect results?', 'Yes. Heat elevates HR and can reduce watts per bpm. Compare data from similar environments.'],
  ['Is this a replacement for FTP or VO₂max?', 'No. It complements those metrics by showing cardiovascular economy at steady efforts.'],
  ['Should I test fasted?', 'Use your normal fueling strategy for long rides to avoid HR drift from glycogen depletion.'],
  ['What about HR drift?', 'Even with steady power, HR can rise during long rides (cardiac drift). Compare similar durations to limit drift effects.'],
  ['Can runners use this?', 'Analogous metrics exist (pace per bpm). This calculator targets cycling power specifically.'],
];

const understandingInputs = [
  { label: 'Average Power (W)', description: 'Mean power across a steady state ride or trainer session.' },
  { label: 'Average Heart Rate (bpm)', description: 'Mean heart rate across the same period, excluding warm-up and cool-down if possible.' },
  { label: 'Duration (minutes)', description: 'Duration of the steady effort used for the calculation.' },
];

const interpret = (wpb: number) => {
  if (wpb >= 1.6) return 'High power-to-HR efficiency for steady aerobic work—endurance engine is strong.';
  if (wpb >= 1.2) return 'Moderate efficiency—continue building aerobic base and tempo durability.';
  return 'Develop aerobic foundation, hydration, and pacing to improve watts per bpm.';
};

const recommendations = (wpb: number) => [
  wpb < 1.2 ? 'Increase low-intensity volume and keep HR controlled to build stroke volume' : 'Add tempo and long steady rides to raise power without elevating HR',
  'Hydrate and fuel consistently to reduce cardiac drift on longer efforts',
  'Standardize test conditions (terrain, temperature, cadence) when comparing sessions',
];

const warningSigns = () => [
  'Unusual tachycardia or palpitations—seek medical advice before continuing intense training',
  'Large day-to-day swings may reflect poor recovery, dehydration, or illness',
  'Stop tests if you experience chest pain, severe dizziness, or shortness of breath',
];

export default function PowerToHeartRateEfficiencyCalculator() {
  const [result, setResult] = useState<ResultPayload | null>(null);
  const form = useForm<FormValues>({ resolver: zodResolver(formSchema), defaultValues: { averagePowerW: undefined, averageHrBpm: undefined, durationMinutes: undefined } });

  const onSubmit = (v: FormValues) => {
    const { averagePowerW, averageHrBpm, durationMinutes } = v;
    if (averagePowerW == null || averageHrBpm == null || durationMinutes == null) { setResult(null); return; }
    if (averageHrBpm <= 0) { setResult(null); return; }

    const wattsPerBpm = averagePowerW / averageHrBpm;

    setResult({
      status: 'Calculated',
      interpretation: interpret(wattsPerBpm),
      recommendations: recommendations(wattsPerBpm),
      warningSigns: warningSigns(),
      plan: plan(),
      wattsPerBpm: Math.round(wattsPerBpm * 100) / 100,
    });
  };

  return (
    <div className="space-y-8">
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2"><HeartPulse className="h-5 w-5" /> Power-to-Heart Rate Efficiency</CardTitle>
          <CardDescription>Estimate watts per bpm during steady aerobic work.</CardDescription>
        </CardHeader>
        <CardContent>
          <Form {...form}>
            <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-6">
              <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                <FormField control={form.control} name="averagePowerW" render={({ field }) => (
                  <FormItem>
                    <FormLabel className="flex items-center gap-2"><Gauge className="h-4 w-4" /> Average Power (W)</FormLabel>
                    <FormControl><Input type="number" step="1" placeholder="e.g., 220" value={field.value ?? ''} onChange={(e)=>field.onChange(e.target.value===''?undefined:Number(e.target.value))} /></FormControl>
                    <FormMessage />
                  </FormItem>
                )} />
                <FormField control={form.control} name="averageHrBpm" render={({ field }) => (
                  <FormItem>
                    <FormLabel className="flex items-center gap-2"><HeartPulse className="h-4 w-4" /> Average HR (bpm)</FormLabel>
                    <FormControl><Input type="number" step="1" placeholder="e.g., 140" value={field.value ?? ''} onChange={(e)=>field.onChange(e.target.value===''?undefined:Number(e.target.value))} /></FormControl>
                    <FormMessage />
                  </FormItem>
                )} />
                <FormField control={form.control} name="durationMinutes" render={({ field }) => (
                  <FormItem>
                    <FormLabel className="flex items-center gap-2"><Timer className="h-4 w-4" /> Duration (min)</FormLabel>
                    <FormControl><Input type="number" step="1" placeholder="e.g., 60" value={field.value ?? ''} onChange={(e)=>field.onChange(e.target.value===''?undefined:Number(e.target.value))} /></FormControl>
                    <FormMessage />
                  </FormItem>
                )} />
              </div>
              <Button type="submit" className="w-full md:w-auto">Calculate Efficiency</Button>
            </form>
          </Form>
        </CardContent>
      </Card>

      {result && (
        <div className="space-y-6">
          <Card>
            <CardHeader>
              <div className="flex items-center gap-4"><Zap className="h-8 w-8 text-primary" /><CardTitle>Efficiency Summary</CardTitle></div>
              <CardDescription>Watts per heartbeat during steady efforts</CardDescription>
            </CardHeader>
            <CardContent className="space-y-4">
              <div className="p-4 border rounded"><h4 className="text-sm font-semibold text-muted-foreground">Watts per bpm</h4><p className="text-2xl font-bold text-primary">{result.wattsPerBpm} W/bpm</p></div>
              <p className="text-sm text-muted-foreground">{result.interpretation}</p>
            </CardContent>
          </Card>
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            <Card>
              <CardHeader><CardTitle>Recommendations</CardTitle></CardHeader>
              <CardContent><ul className="space-y-2">{result.recommendations.map((r,i)=>(<li key={i} className="text-sm text-muted-foreground">{r}</li>))}</ul></CardContent>
            </Card>
            <Card>
              <CardHeader><CardTitle>Warning Signs</CardTitle></CardHeader>
              <CardContent><ul className="space-y-2">{result.warningSigns.map((w,i)=>(<li key={i} className="text-sm text-muted-foreground">{w}</li>))}</ul></CardContent>
            </Card>
          </div>
          <Card>
            <CardHeader><CardTitle className="flex items-center gap-2"><Calendar className="h-5 w-5" /> 8‑Week Aerobic Efficiency Plan</CardTitle></CardHeader>
            <CardContent>
              <div className="overflow-x-auto"><table className="w-full text-sm"><thead><tr className="border-b"><th className="text-left p-2">Week</th><th className="text-left p-2">Focus</th></tr></thead><tbody>{plan().map(p=>(<tr key={p.week} className="border-b"><td className="p-2">{p.week}</td><td className="p-2">{p.focus}</td></tr>))}</tbody></table></div>
            </CardContent>
          </Card>
        </div>
      )}

      <Card>
        <CardHeader>
          <CardTitle>Understanding the Inputs</CardTitle>
          <CardDescription>Standardize conditions for reliable comparisons</CardDescription>
        </CardHeader>
        <CardContent>
          <ul className="space-y-2">{understandingInputs.map((it)=>(<li key={it.label}><span className="font-semibold text-foreground">{it.label}:</span><span className="text-sm text-muted-foreground"> {it.description}</span></li>))}</ul>
        </CardContent>
      </Card>

      <Card>
        <CardHeader>
          <CardTitle>Related Calculators</CardTitle>
          <CardDescription>Pair efficiency with capacity and workload tools</CardDescription>
        </CardHeader>
        <CardContent>
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div className="p-4 border rounded"><h4 className="font-semibold mb-1"><Link href="/category/health-fitness/vo2-max-calculator" className="text-primary hover:underline">VO₂ Max Calculator</Link></h4><p className="text-sm text-muted-foreground">Assess capacity alongside efficiency.</p></div>
            <div className="p-4 border rounded"><h4 className="font-semibold mb-1"><Link href="/category/health-fitness/training-stress-score-calculator" className="text-primary hover:underline">Training Stress Score</Link></h4><p className="text-sm text-muted-foreground">Balance workload and recovery.</p></div>
            <div className="p-4 border rounded"><h4 className="font-semibold mb-1"><Link href="/category/health-fitness/critical-power-calculator" className="text-primary hover:underline">Critical Power</Link></h4><p className="text-sm text-muted-foreground">Anchor sustainable power targets.</p></div>
            <div className="p-4 border rounded"><h4 className="font-semibold mb-1"><Link href="/category/health-fitness/running-economy-calculator" className="text-primary hover:underline">Running Economy</Link></h4><p className="text-sm text-muted-foreground">Economy principles across sports.</p></div>
          </div>
        </CardContent>
      </Card>

      <Card>
        <CardHeader><CardTitle>Complete Guide: Improving Power–HR Efficiency</CardTitle></CardHeader>
        <CardContent className="prose prose-sm dark:prose-invert max-w-none">
          <p>Steady aerobic development, consistent fueling, and heat management improve watts per bpm. Use periodic benchmarks on the same route or trainer protocol to quantify progress independent of maximal tests.</p>
        </CardContent>
      </Card>

      <Card>
        <CardHeader>
          <CardTitle>Frequently Asked Questions</CardTitle>
          <CardDescription>Detailed, SEO-oriented answers</CardDescription>
        </CardHeader>
        <CardContent className="space-y-4">{faqs.map(([q,a],i)=>(<div key={i}><h4 className="font-semibold mb-1">{q}</h4><p className="text-sm text-muted-foreground">{a}</p></div>))}</CardContent>
      </Card>
    </div>
  );
}

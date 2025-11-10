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
import { Zap, Flame, Gauge, Scale, Timer, Calendar } from 'lucide-react';

const formSchema = z.object({
  bodyWeightKg: z.number().min(30).max(200).optional(),
  power30s: z.number().min(100).max(2000).optional(),
  power5min: z.number().min(50).max(1000).optional(),
});

type FormValues = z.infer<typeof formSchema>;

type ResultPayload = {
  status: string;
  interpretation: string;
  recommendations: string[];
  warningSigns: string[];
  plan: { week: number; focus: string }[];
  anaerobicCapacityKjKg: number;
  category: string;
};

const plan = (): { week: number; focus: string }[] => [
  { week: 1, focus: 'Baseline testing: 30s max power and 5min steady power on bike or rower' },
  { week: 2, focus: 'Add 2–3 short sprint sessions (10–30s all-out efforts) with full recovery' },
  { week: 3, focus: 'Include hill sprints or resisted sprints to build power output' },
  { week: 4, focus: 'Deload week: reduce volume 20%, maintain technique work' },
  { week: 5, focus: 'Introduce plyometrics: box jumps, bounds, and explosive movements' },
  { week: 6, focus: 'Combine strength training (heavy, explosive lifts) with sprint work' },
  { week: 7, focus: 'Re-test anaerobic capacity to assess improvements' },
  { week: 8, focus: 'Adjust training based on results and plan next cycle' },
];

const faqs: [string, string][] = [
  ['What is anaerobic capacity?', 'Anaerobic capacity is your ability to produce high power output for short durations (10–60 seconds) using energy systems that don\'t require oxygen. It\'s crucial for sprinting, jumping, and explosive movements.'],
  ['How is anaerobic capacity calculated?', 'This calculator uses the difference between 30-second max power and 5-minute steady power, normalized to body weight. The formula: (Power30s − Power5min) × 30s / (Body Weight × 1000).'],
  ['What is a good anaerobic capacity value?', 'Values vary by sport and individual. Higher values (≥2.0 kJ/kg) indicate excellent power output. Track your own improvements over time.'],
  ['How do I test for anaerobic capacity?', 'Perform a 30-second all-out effort on a bike ergometer, rower, or similar device. Also test 5-minute steady power. Enter both values with body weight.'],
  ['Does body weight affect the calculation?', 'Yes, capacity is normalized to body weight (kJ/kg) to allow comparisons across different body sizes.'],
  ['Can I improve anaerobic capacity?', 'Yes, through short sprints, hill sprints, plyometrics, heavy weight training, and high-intensity interval training.'],
  ['How often should I train anaerobically?', 'Limit to 2–3 sessions per week with adequate recovery. Anaerobic work is highly fatiguing and requires proper rest.'],
  ['Is anaerobic capacity the same as power?', 'Related but distinct. Power is instantaneous output; anaerobic capacity reflects sustained high power over 10–60 seconds.'],
  ['Can endurance athletes benefit from anaerobic training?', 'Yes, adding anaerobic work can improve finishing kicks, hill climbing, and overall power-to-weight ratio.'],
  ['What recovery is needed between anaerobic sessions?', 'Allow 48–72 hours between intense anaerobic sessions. Monitor for overtraining signs like persistent fatigue or declining performance.'],
];

const understandingInputs = [
  { label: 'Body Weight (kg)', description: 'Your current body weight in kilograms for normalization of power output.' },
  { label: '30s Max Power (W)', description: 'Maximum average power output (watts) during a 30-second all-out effort.' },
  { label: '5min Power (W)', description: 'Steady-state power output (watts) maintained during a 5-minute effort.' },
];

const interpret = (capacity: number) => {
  if (capacity >= 2.0) return 'High anaerobic capacity—excellent power output for sprint and explosive activities.';
  if (capacity >= 1.0) return 'Developing anaerobic capacity—room for improvement with targeted training.';
  if (capacity >= 0.5) return 'Low anaerobic capacity—focus on power development and sprint work.';
  return 'Very low capacity—prioritize foundational strength and power training.';
};

const recommendations = (capacity: number) => [
  'Include 2–3 anaerobic sessions per week: short sprints (10–30s), hill sprints, or resisted sprints',
  capacity < 1.0 ? 'Prioritize foundational strength training and plyometrics before high-intensity intervals' : 'Balance anaerobic work with aerobic base to maintain overall fitness',
  'Allow 2–3 minutes rest between efforts and 48–72 hours between intense anaerobic sessions',
];

const warningSigns = () => [
  'Persistent muscle soreness or fatigue may indicate overreaching—reduce anaerobic volume',
  'Stop immediately if you experience chest pain, dizziness, or severe shortness of breath during testing',
  'Avoid maximal efforts without proper warm-up and supervision when needed',
];

export default function AnaerobicCapacityCalculator() {
  const [result, setResult] = useState<ResultPayload | null>(null);
  const form = useForm<FormValues>({
    resolver: zodResolver(formSchema),
    defaultValues: {
      bodyWeightKg: undefined,
      power30s: undefined,
      power5min: undefined,
    },
  });

  const onSubmit = (values: FormValues) => {
    const { bodyWeightKg, power30s, power5min } = values;
    if (bodyWeightKg == null || power30s == null || power5min == null) {
      setResult(null);
      return;
    }
    if (power30s <= power5min || bodyWeightKg <= 0) {
      setResult(null);
      return;
    }

    const powerDifference = power30s - power5min;
    const anaerobicCapacityKjKg = (powerDifference * 30) / (bodyWeightKg * 1000);

    let category = 'Moderate';
    if (anaerobicCapacityKjKg >= 2.0) category = 'High';
    else if (anaerobicCapacityKjKg >= 1.0) category = 'Developing';
    else if (anaerobicCapacityKjKg >= 0.5) category = 'Low';
    else category = 'Very Low';

    setResult({
      status: 'Calculated',
      interpretation: interpret(anaerobicCapacityKjKg),
      recommendations: recommendations(anaerobicCapacityKjKg),
      warningSigns: warningSigns(),
      plan: plan(),
      anaerobicCapacityKjKg: Math.round(anaerobicCapacityKjKg * 100) / 100,
      category,
    });
  };

  return (
    <div className="space-y-8">
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2"><Flame className="h-5 w-5" /> Anaerobic Capacity Calculator</CardTitle>
          <CardDescription>Estimate anaerobic power capacity from 30-second and 5-minute power tests.</CardDescription>
        </CardHeader>
        <CardContent>
          <Form {...form}>
            <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-6">
              <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                <FormField control={form.control} name="bodyWeightKg" render={({ field }) => (
                  <FormItem>
                    <FormLabel className="flex items-center gap-2"><Scale className="h-4 w-4" /> Body Weight (kg)</FormLabel>
                    <FormControl>
                      <Input type="number" step="0.1" placeholder="e.g., 70" value={field.value ?? ''} onChange={(e)=>field.onChange(e.target.value===''?undefined:Number(e.target.value))} />
                    </FormControl>
                    <FormMessage />
                  </FormItem>
                )} />
                <FormField control={form.control} name="power30s" render={({ field }) => (
                  <FormItem>
                    <FormLabel className="flex items-center gap-2"><Gauge className="h-4 w-4" /> 30s Max Power (W)</FormLabel>
                    <FormControl>
                      <Input type="number" step="1" placeholder="e.g., 400" value={field.value ?? ''} onChange={(e)=>field.onChange(e.target.value===''?undefined:Number(e.target.value))} />
                    </FormControl>
                    <FormMessage />
                  </FormItem>
                )} />
                <FormField control={form.control} name="power5min" render={({ field }) => (
                  <FormItem>
                    <FormLabel className="flex items-center gap-2"><Timer className="h-4 w-4" /> 5min Power (W)</FormLabel>
                    <FormControl>
                      <Input type="number" step="1" placeholder="e.g., 250" value={field.value ?? ''} onChange={(e)=>field.onChange(e.target.value===''?undefined:Number(e.target.value))} />
                    </FormControl>
                    <FormMessage />
                  </FormItem>
                )} />
              </div>
              <Button type="submit" className="w-full md:w-auto">Calculate Anaerobic Capacity</Button>
            </form>
          </Form>
        </CardContent>
      </Card>

      {result && (
        <div className="space-y-6">
          <Card>
            <CardHeader>
              <div className="flex items-center gap-4"><Zap className="h-8 w-8 text-primary" /><CardTitle>Anaerobic Capacity Summary</CardTitle></div>
              <CardDescription>Power output capacity for short, high-intensity efforts</CardDescription>
            </CardHeader>
            <CardContent className="space-y-4">
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div className="p-4 border rounded"><h4 className="text-sm font-semibold text-muted-foreground">Anaerobic Capacity</h4><p className="text-2xl font-bold text-primary">{result.anaerobicCapacityKjKg} kJ/kg</p></div>
                <div className="p-4 border rounded"><h4 className="text-sm font-semibold text-muted-foreground">Category</h4><p className="text-2xl font-bold text-primary">{result.category}</p></div>
              </div>
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
            <CardHeader><CardTitle className="flex items-center gap-2"><Calendar className="h-5 w-5" /> 8‑Week Anaerobic Development Plan</CardTitle></CardHeader>
            <CardContent>
              <div className="overflow-x-auto">
                <table className="w-full text-sm">
                  <thead><tr className="border-b"><th className="text-left p-2">Week</th><th className="text-left p-2">Focus</th></tr></thead>
                  <tbody>{plan().map(p=>(<tr key={p.week} className="border-b"><td className="p-2">{p.week}</td><td className="p-2">{p.focus}</td></tr>))}</tbody>
                </table>
              </div>
            </CardContent>
          </Card>
        </div>
      )}

      <Card>
        <CardHeader>
          <CardTitle>Understanding the Inputs</CardTitle>
          <CardDescription>Ensure accurate power measurements for reliable results</CardDescription>
        </CardHeader>
        <CardContent>
          <ul className="space-y-2">{understandingInputs.map((it)=>(<li key={it.label}><span className="font-semibold text-foreground">{it.label}:</span><span className="text-sm text-muted-foreground"> {it.description}</span></li>))}</ul>
        </CardContent>
      </Card>

      <Card>
        <CardHeader>
          <CardTitle>Related Calculators</CardTitle>
          <CardDescription>Complementary tools for power and performance</CardDescription>
        </CardHeader>
        <CardContent>
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div className="p-4 border rounded"><h4 className="font-semibold mb-1"><Link href="/category/health-fitness/cycling-power-output-calculator" className="text-primary hover:underline">Cycling Power Output</Link></h4><p className="text-sm text-muted-foreground">Track power production across different durations.</p></div>
            <div className="p-4 border rounded"><h4 className="font-semibold mb-1"><Link href="/category/health-fitness/one-rep-max-strength-calculator" className="text-primary hover:underline">1-Rep Max</Link></h4><p className="text-sm text-muted-foreground">Assess maximal strength for power training.</p></div>
            <div className="p-4 border rounded"><h4 className="font-semibold mb-1"><Link href="/category/health-fitness/vo2-reserve-calculator" className="text-primary hover:underline">VO₂ Reserve</Link></h4><p className="text-sm text-muted-foreground">Balance anaerobic work with aerobic capacity.</p></div>
            <div className="p-4 border rounded"><h4 className="font-semibold mb-1"><Link href="/category/health-fitness/lactate-accumulation-rate-calculator" className="text-primary hover:underline">Lactate Accumulation</Link></h4><p className="text-sm text-muted-foreground">Understand metabolic response to high-intensity efforts.</p></div>
          </div>
        </CardContent>
      </Card>

      <Card>
        <CardHeader><CardTitle>Complete Guide: Anaerobic Capacity Training</CardTitle></CardHeader>
        <CardContent className="prose prose-sm dark:prose-invert max-w-none">
          <p>Anaerobic capacity represents your ability to produce high power for short durations (10–60 seconds). Improve it through short sprints, hill sprints, plyometrics, heavy weight training, and high-intensity intervals. Limit to 2–3 sessions per week with adequate recovery, as anaerobic work is highly fatiguing. Balance with aerobic base training for overall performance.</p>
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

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
import { Zap, Activity, ArrowUpToLine, Timer, Scale, Calendar } from 'lucide-react';

const formSchema = z.object({
  bodyMassKg: z.number().positive('Enter mass').optional(),
  verticalJumpCm: z.number().min(5).max(120).optional(),
  timeToPeakSec: z.number().min(0.1).max(3).optional(),
});

type FormValues = z.infer<typeof formSchema>;

export default function AnaerobicPowerOutputCalculator() {
  const [result, setResult] = useState<{ peakPowerW: number; powerToWeight: number; interpretation: string; recommendations: string[]; warnings: string[]; plan: { week: number; focus: string }[] } | null>(null);
  const form = useForm<FormValues>({ resolver: zodResolver(formSchema), defaultValues: { bodyMassKg: undefined, verticalJumpCm: undefined, timeToPeakSec: undefined } });

  const calculate = (v: FormValues) => {
    if (v.bodyMassKg == null || v.verticalJumpCm == null || v.timeToPeakSec == null) return null;
    const h = v.verticalJumpCm / 100; // m
    // Simple power estimate: P = m*g*h / t
    const workJ = v.bodyMassKg * 9.80665 * h;
    const peakPower = workJ / v.timeToPeakSec;
    const p2w = peakPower / v.bodyMassKg;
    return { peakPower, p2w };
  };

  const interpret = (p2w: number) => {
    if (p2w > 60) return 'Elite anaerobic power relative to body mass.';
    if (p2w >= 40) return 'High power—excellent explosive capability.';
    if (p2w >= 25) return 'Moderate power—room for speed-strength development.';
    return 'Low to moderate—focus on strength and plyometrics.';
  };

  const recs = (p2w: number) => {
    if (p2w > 60) return ['Maintain with contrast training and high‑quality sleep', 'Cycle intensity blocks; avoid chronic fatigue'];
    if (p2w >= 40) return ['Olympic‑lift derivatives and loaded jumps 1–2×/wk', 'Sprint sessions with full recovery; strength maintenance'];
    if (p2w >= 25) return ['Prioritize max strength (squats, pulls)', 'Progress to plyometrics after strength base'];
    return ['Foundational strength and technique first', 'Low‑impact plyos; progress landing mechanics'];
  };

  const warnings = () => ['Avoid excessive plyo volume initially', 'Stop sessions if landing mechanics degrade', 'Respect 48–72h recovery between intense power days'];

  const plan = () => ([
    { week: 1, focus: 'Technique + submax strength; low‑impact jumps' },
    { week: 2, focus: 'Add sprint accelerations; maintain strength' },
    { week: 3, focus: 'Introduce loaded jumps; monitor shins/Achilles' },
    { week: 4, focus: 'Deload; mobility and tendon care' },
    { week: 5, focus: 'Heavier strength + moderate plyos' },
    { week: 6, focus: 'Contrast sets; sprint volume steady' },
    { week: 7, focus: 'Peak with quality, not quantity' },
    { week: 8, focus: 'Re‑test jump and power metrics' },
  ]);

  const onSubmit = (values: FormValues) => {
    const res = calculate(values);
    if (!res) { setResult(null); return; }
    setResult({ peakPowerW: Math.round(res.peakPower), powerToWeight: Math.round(res.p2w * 10) / 10, interpretation: interpret(res.p2w), recommendations: recs(res.p2w), warnings: warnings(), plan: plan() });
  };

  return (
    <div className="space-y-8">
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2"><Activity className="h-5 w-5" /> Anaerobic Power Output</CardTitle>
          <CardDescription>Estimate peak power from jump height and time</CardDescription>
        </CardHeader>
        <CardContent>
      <Form {...form}>
        <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-6">
          <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
            <FormField control={form.control} name="bodyMassKg" render={({ field }) => (
              <FormItem>
                <FormLabel className="flex items-center gap-2"><Scale className="h-4 w-4" /> Body Mass (kg)</FormLabel>
                <FormControl>
                  <Input type="number" step="0.1" placeholder="e.g., 75" {...field} value={field.value ?? ''} onChange={e => field.onChange(parseFloat(e.target.value) || undefined)} />
                </FormControl>
                <FormMessage />
              </FormItem>
            )} />
            <FormField control={form.control} name="verticalJumpCm" render={({ field }) => (
              <FormItem>
                <FormLabel className="flex items-center gap-2"><ArrowUpToLine className="h-4 w-4" /> Vertical Jump (cm)</FormLabel>
                <FormControl>
                  <Input type="number" step="0.1" placeholder="e.g., 45" {...field} value={field.value ?? ''} onChange={e => field.onChange(parseFloat(e.target.value) || undefined)} />
                </FormControl>
                <FormMessage />
              </FormItem>
            )} />
            <FormField control={form.control} name="timeToPeakSec" render={({ field }) => (
              <FormItem>
                <FormLabel className="flex items-center gap-2"><Timer className="h-4 w-4" /> Time to Peak (s)</FormLabel>
                <FormControl>
                  <Input type="number" step="0.01" placeholder="e.g., 0.4" {...field} value={field.value ?? ''} onChange={e => field.onChange(parseFloat(e.target.value) || undefined)} />
                </FormControl>
                <FormMessage />
              </FormItem>
            )} />
          </div>
          <Button type="submit" className="w-full md:w-auto">Estimate Anaerobic Power</Button>
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
                <CardTitle>Peak Power Output</CardTitle>
              </div>
              <CardDescription>Estimated from jump height and time to peak</CardDescription>
            </CardHeader>
            <CardContent className="space-y-4">
              <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                <div className="text-center p-6 bg-primary/5 rounded-lg"><p className="text-sm text-muted-foreground mb-1">Peak Power</p><p className="text-3xl font-bold text-primary">{result.peakPowerW} W</p></div>
                <div className="text-center p-6 bg-green-50 dark:bg-green-950/20 rounded-lg"><p className="text-sm text-muted-foreground mb-1">Power‑to‑Weight</p><p className="text-3xl font-bold text-green-600">{result.powerToWeight} W/kg</p></div>
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
        <CardHeader><CardTitle>Related Calculators</CardTitle><CardDescription>Power and performance</CardDescription></CardHeader>
        <CardContent>
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div className="p-4 border rounded"><h4 className="font-semibold mb-1"><Link href="/category/health-fitness/one-rep-max-strength-calculator" className="text-primary hover:underline">One‑Rep Max</Link></h4><p className="text-sm text-muted-foreground">Strength baseline for power.</p></div>
            <div className="p-4 border rounded"><h4 className="font-semibold mb-1"><Link href="/category/health-fitness/critical-power-calculator" className="text-primary hover:underline">Critical Power</Link></h4><p className="text-sm text-muted-foreground">Sustainable power model.</p></div>
            <div className="p-4 border rounded"><h4 className="font-semibold mb-1"><Link href="/category/health-fitness/anaerobic-threshold-calculator" className="text-primary hover:underline">Anaerobic Threshold</Link></h4><p className="text-sm text-muted-foreground">Intensity domains.</p></div>
            <div className="p-4 border rounded"><h4 className="font-semibold mb-1"><Link href="/category/health-fitness/training-volume-calculator" className="text-primary hover:underline">Training Volume</Link></h4><p className="text-sm text-muted-foreground">Manage workload.</p></div>
          </div>
        </CardContent>
      </Card>

      <Card>
        <CardHeader><CardTitle>Complete Guide: Building Anaerobic Power</CardTitle></CardHeader>
        <CardContent className="prose prose-sm dark:prose-invert max-w-none"><p>This is a sample line for the complete guide section. You can add your detailed content here.</p><p>This is another sample line for the guide section. Replace these with your comprehensive guide content.</p></CardContent>
      </Card>

      <Card>
        <CardHeader><CardTitle>Frequently Asked Questions</CardTitle><CardDescription>Detailed, SEO‑oriented answers</CardDescription></CardHeader>
        <CardContent className="space-y-4">{[
          ['How accurate is jump‑based power?', 'It is a practical field proxy; force plates provide higher fidelity but trends are still useful for programming.'],
          ['Do I need heavy lifting for power?', 'Max strength raises the ceiling for power expression; combine with velocity‑focused work.'],
          ['How many plyo sessions per week?', 'Typically 1–2 high‑quality sessions with 48–72 hours between for tendon and CNS recovery.'],
          ['What causes plateaus?', 'Insufficient recovery, too much volume, or lack of progressive overload and velocity intent.'],
          ['Is sprinting enough?', 'Sprinting is excellent for power; pair with strength to improve force production across the curve.'],
          ['How to reduce injury risk?', 'Progress landing forces gradually, maintain calf/Achilles strength, and keep technique crisp.'],
          ['Should I cut weight to raise W/kg?', 'Only if appropriate for health and performance; maintain muscle and power while adjusting mass cautiously.'],
        ].map(([q,a],i)=> (<div key={i}><h4 className="font-semibold mb-1">{q}</h4><p className="text-sm text-muted-foreground">{a}</p></div>))}</CardContent>
      </Card>
    </div>
  );
}



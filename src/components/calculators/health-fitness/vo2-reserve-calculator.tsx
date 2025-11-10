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
import { Zap, Activity, HeartPulse, Gauge, Calendar } from 'lucide-react';

const formSchema = z.object({
  vo2Max: z.number().min(20).max(100).optional(),
  vo2Rest: z.number().min(3).max(5).optional(),
});

type FormValues = z.infer<typeof formSchema>;

type ResultPayload = {
  status: string;
  interpretation: string;
  recommendations: string[];
  warningSigns: string[];
  plan: { week: number; focus: string }[];
  vo2Reserve: number;
  zone50Percent: number;
  zone60Percent: number;
  zone70Percent: number;
  zone80Percent: number;
  zone90Percent: number;
};

const plan = (): { week: number; focus: string }[] => [
  { week: 1, focus: 'Establish baseline VO₂max and resting VO₂ through testing or estimation' },
  { week: 2, focus: 'Train in Zone 2 (60–70% VO₂R) for 3–4 easy aerobic sessions' },
  { week: 3, focus: 'Add Zone 3 (70–80% VO₂R) tempo work for 1–2 sessions' },
  { week: 4, focus: 'Deload week: reduce volume by 20% and focus on recovery' },
  { week: 5, focus: 'Introduce Zone 4 (80–90% VO₂R) intervals for VO₂max development' },
  { week: 6, focus: 'Balance Zone 2 volume with Zone 4 intensity sessions' },
  { week: 7, focus: 'Re-test VO₂max or reassess training zones' },
  { week: 8, focus: 'Adjust training intensities based on updated VO₂R zones' },
];

const faqs: [string, string][] = [
  ['What is VO₂ Reserve (VO₂R)?', 'VO₂ Reserve is the difference between VO₂max and resting VO₂. It provides a more accurate way to set training zones than using percentages of VO₂max alone.'],
  ['How is VO₂R calculated?', 'VO₂R = VO₂max − VO₂rest. Training zones are then set as percentages of this reserve added back to resting VO₂.'],
  ['Why use VO₂R instead of VO₂max?', 'VO₂R accounts for individual differences in resting metabolism, providing more personalized and accurate training zones.'],
  ['What are the training zones?', 'Zone 1: 50–60% VO₂R (recovery), Zone 2: 60–70% VO₂R (aerobic), Zone 3: 70–80% VO₂R (tempo), Zone 4: 80–90% VO₂R (threshold), Zone 5: 90–100% VO₂R (VO₂max).'],
  ['How do I know my VO₂max?', 'VO₂max can be measured via laboratory testing, field tests (e.g., Cooper test, beep test), or estimated using calculators.'],
  ['What is a typical resting VO₂?', 'Resting VO₂ is typically around 3.5 mL/kg/min (1 MET) for most adults, but can vary based on body composition and fitness.'],
  ['Can VO₂R change with training?', 'Yes, as VO₂max improves and potentially as resting metabolism adapts, VO₂R will increase, requiring zone recalibration.'],
  ['How often should I update my zones?', 'Reassess every 6–12 weeks or after significant fitness improvements, especially if you\'ve completed a training block targeting VO₂max.'],
  ['Is VO₂R better than heart rate zones?', 'Both have value. VO₂R provides precise metabolic targets, while HR zones offer practical, real-time feedback during training.'],
  ['Can I use VO₂R for all sports?', 'Yes, VO₂R training zones apply to any aerobic activity: running, cycling, swimming, rowing, and more.'],
];

const understandingInputs = [
  { label: 'VO₂max (mL/kg/min)', description: 'Maximum oxygen consumption capacity, typically measured via testing or estimated from performance tests.' },
  { label: 'Resting VO₂ (mL/kg/min)', description: 'Oxygen consumption at rest, typically around 3.5 mL/kg/min (1 MET) for most adults.' },
];

const interpret = (vo2r: number) => {
  if (vo2r >= 50) return 'Very high VO₂ Reserve—excellent aerobic capacity. Focus on maintaining fitness and event-specific training.';
  if (vo2r >= 35) return 'High VO₂ Reserve—strong aerobic base. Continue structured training across zones.';
  if (vo2r >= 25) return 'Moderate VO₂ Reserve—room for improvement. Prioritize Zone 2 and Zone 4 work.';
  return 'Lower VO₂ Reserve—focus on building aerobic base with consistent Zone 2 training.';
};

const recommendations = (vo2r: number) => [
  'Use VO₂R zones to structure training: 60–70% for aerobic base, 80–90% for threshold work',
  vo2r < 25 ? 'Prioritize Zone 2 training to build aerobic capacity before adding high-intensity work' : 'Balance Zone 2 volume (70–80% of training) with Zone 4 intervals (20–30%)',
  'Re-test VO₂max periodically to keep zones accurate as fitness improves',
];

const warningSigns = () => [
  'Avoid training exclusively in high-intensity zones—this can lead to overtraining and burnout',
  'If you experience chest pain, severe shortness of breath, or dizziness during testing, stop immediately',
  'Consult a healthcare provider before maximal testing if you have cardiovascular risk factors',
];

export default function Vo2ReserveCalculator() {
  const [result, setResult] = useState<ResultPayload | null>(null);
  const form = useForm<FormValues>({
    resolver: zodResolver(formSchema),
    defaultValues: { vo2Max: undefined, vo2Rest: undefined },
  });

  const onSubmit = (v: FormValues) => {
    const { vo2Max, vo2Rest } = v;
    if (vo2Max == null || vo2Rest == null) { setResult(null); return; }
    if (vo2Max <= vo2Rest) { setResult(null); return; }

    const vo2Reserve = vo2Max - vo2Rest;
    const zone50Percent = vo2Rest + (vo2Reserve * 0.5);
    const zone60Percent = vo2Rest + (vo2Reserve * 0.6);
    const zone70Percent = vo2Rest + (vo2Reserve * 0.7);
    const zone80Percent = vo2Rest + (vo2Reserve * 0.8);
    const zone90Percent = vo2Rest + (vo2Reserve * 0.9);

    setResult({
      status: 'Calculated',
      interpretation: interpret(vo2Reserve),
      recommendations: recommendations(vo2Reserve),
      warningSigns: warningSigns(),
      plan: plan(),
      vo2Reserve: Math.round(vo2Reserve * 10) / 10,
      zone50Percent: Math.round(zone50Percent * 10) / 10,
      zone60Percent: Math.round(zone60Percent * 10) / 10,
      zone70Percent: Math.round(zone70Percent * 10) / 10,
      zone80Percent: Math.round(zone80Percent * 10) / 10,
      zone90Percent: Math.round(zone90Percent * 10) / 10,
    });
  };

  return (
    <div className="space-y-8">
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2"><Activity className="h-5 w-5" /> VO₂ Reserve Calculator</CardTitle>
          <CardDescription>Calculate your VO₂ Reserve and training zones for precise aerobic training prescription.</CardDescription>
        </CardHeader>
        <CardContent>
          <Form {...form}>
            <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-6">
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <FormField control={form.control} name="vo2Max" render={({ field }) => (
                  <FormItem>
                    <FormLabel className="flex items-center gap-2"><Gauge className="h-4 w-4" /> VO₂max (mL/kg/min)</FormLabel>
                    <FormControl>
                      <Input type="number" step="0.1" placeholder="e.g., 45" value={field.value ?? ''} onChange={(e)=>field.onChange(e.target.value===''?undefined:Number(e.target.value))} />
                    </FormControl>
                    <FormMessage />
                  </FormItem>
                )} />
                <FormField control={form.control} name="vo2Rest" render={({ field }) => (
                  <FormItem>
                    <FormLabel className="flex items-center gap-2"><HeartPulse className="h-4 w-4" /> Resting VO₂ (mL/kg/min)</FormLabel>
                    <FormControl>
                      <Input type="number" step="0.1" placeholder="e.g., 3.5" value={field.value ?? ''} onChange={(e)=>field.onChange(e.target.value===''?undefined:Number(e.target.value))} />
                    </FormControl>
                    <FormMessage />
                  </FormItem>
                )} />
              </div>
              <Button type="submit" className="w-full md:w-auto">Calculate VO₂ Reserve</Button>
            </form>
          </Form>
        </CardContent>
      </Card>

      {result && (
        <div className="space-y-6">
          <Card>
            <CardHeader>
              <div className="flex items-center gap-4"><Zap className="h-8 w-8 text-primary" /><CardTitle>VO₂ Reserve Summary</CardTitle></div>
              <CardDescription>Personalized training zones based on your VO₂R</CardDescription>
            </CardHeader>
            <CardContent className="space-y-4">
              <div className="p-4 border rounded">
                <h4 className="text-sm font-semibold text-muted-foreground">VO₂ Reserve</h4>
                <p className="text-2xl font-bold text-primary">{result.vo2Reserve} mL/kg/min</p>
              </div>
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div className="p-4 border rounded"><h4 className="text-sm font-semibold text-muted-foreground">Zone 1 (50% VO₂R)</h4><p className="text-lg font-bold">{result.zone50Percent} mL/kg/min</p></div>
                <div className="p-4 border rounded"><h4 className="text-sm font-semibold text-muted-foreground">Zone 2 (60% VO₂R)</h4><p className="text-lg font-bold">{result.zone60Percent} mL/kg/min</p></div>
                <div className="p-4 border rounded"><h4 className="text-sm font-semibold text-muted-foreground">Zone 3 (70% VO₂R)</h4><p className="text-lg font-bold">{result.zone70Percent} mL/kg/min</p></div>
                <div className="p-4 border rounded"><h4 className="text-sm font-semibold text-muted-foreground">Zone 4 (80% VO₂R)</h4><p className="text-lg font-bold">{result.zone80Percent} mL/kg/min</p></div>
                <div className="p-4 border rounded"><h4 className="text-sm font-semibold text-muted-foreground">Zone 5 (90% VO₂R)</h4><p className="text-lg font-bold">{result.zone90Percent} mL/kg/min</p></div>
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
            <CardHeader><CardTitle className="flex items-center gap-2"><Calendar className="h-5 w-5" /> 8‑Week VO₂R Training Plan</CardTitle></CardHeader>
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
          <CardDescription>Accurate inputs ensure precise training zone calculation</CardDescription>
        </CardHeader>
        <CardContent>
          <ul className="space-y-2">{understandingInputs.map((it)=>(<li key={it.label}><span className="font-semibold text-foreground">{it.label}:</span><span className="text-sm text-muted-foreground"> {it.description}</span></li>))}</ul>
        </CardContent>
      </Card>

      <Card>
        <CardHeader>
          <CardTitle>Related Calculators</CardTitle>
          <CardDescription>Complementary tools for aerobic training</CardDescription>
        </CardHeader>
        <CardContent>
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div className="p-4 border rounded"><h4 className="font-semibold mb-1"><Link href="/category/health-fitness/vo2-max-calculator" className="text-primary hover:underline">VO₂ Max Calculator</Link></h4><p className="text-sm text-muted-foreground">Estimate or track your maximum oxygen consumption.</p></div>
            <div className="p-4 border rounded"><h4 className="font-semibold mb-1"><Link href="/category/health-fitness/critical-power-calculator" className="text-primary hover:underline">Critical Power</Link></h4><p className="text-sm text-muted-foreground">Set power-based training zones for cycling and running.</p></div>
            <div className="p-4 border rounded"><h4 className="font-semibold mb-1"><Link href="/category/health-fitness/maximal-aerobic-speed-mas-calculator" className="text-primary hover:underline">Maximal Aerobic Speed</Link></h4><p className="text-sm text-muted-foreground">Determine MAS for running speed-based training.</p></div>
            <div className="p-4 border rounded"><h4 className="font-semibold mb-1"><Link href="/category/health-fitness/running-economy-calculator" className="text-primary hover:underline">Running Economy</Link></h4><p className="text-sm text-muted-foreground">Improve efficiency to maximize VO₂ utilization.</p></div>
          </div>
        </CardContent>
      </Card>

      <Card>
        <CardHeader><CardTitle>Complete Guide: Training with VO₂ Reserve</CardTitle></CardHeader>
        <CardContent className="prose prose-sm dark:prose-invert max-w-none">
          <p>VO₂ Reserve provides a more accurate framework for setting training zones than VO₂max alone. It accounts for individual resting metabolism, making zones more personalized. Use Zone 2 (60–70% VO₂R) for aerobic base building, Zone 4 (80–90% VO₂R) for threshold development, and Zone 5 (90–100% VO₂R) for VO₂max improvements. Reassess regularly as fitness improves.</p>
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

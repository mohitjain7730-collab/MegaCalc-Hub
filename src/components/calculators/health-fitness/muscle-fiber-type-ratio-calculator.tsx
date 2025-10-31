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
import { Zap, Activity, Timer, BatteryCharging, Calendar } from 'lucide-react';

const formSchema = z.object({
  twitchTestTimeToPeakMs: z.number().min(10).max(200).optional(),
  fatigueIndexPercentDrop: z.number().min(0).max(100).optional(),
});

type FormValues = z.infer<typeof formSchema>;

export default function MuscleFiberTypeRatioCalculator() {
  const [result, setResult] = useState<{ typeIpercent: number; typeIIpercent: number; interpretation: string; recommendations: string[]; warnings: string[]; plan: { week: number; focus: string }[] } | null>(null);
  const form = useForm<FormValues>({ resolver: zodResolver(formSchema), defaultValues: { twitchTestTimeToPeakMs: undefined, fatigueIndexPercentDrop: undefined } });

  const calculate = (v: FormValues) => {
    if (v.twitchTestTimeToPeakMs == null || v.fatigueIndexPercentDrop == null) return null;
    // Heuristic: slower time-to-peak and lower fatigue drop -> more Type I
    const speedFactor = Math.max(0, Math.min(1, (v.twitchTestTimeToPeakMs - 40) / 100));
    const fatigueFactor = 1 - v.fatigueIndexPercentDrop / 100;
    let typeI = 50 + (speedFactor * 25) + (fatigueFactor * 25) - 25; // center around 50
    typeI = Math.max(20, Math.min(80, typeI));
    const typeII = 100 - typeI;
    return { typeI, typeII };
  };

  const interpret = (typeI: number) => {
    if (typeI >= 60) return 'Endurance-leaning profile with higher Type I proportion.';
    if (typeI <= 40) return 'Power-leaning profile with higher Type II proportion.';
    return 'Mixed fiber profile—balanced endurance and power potential.';
  };

  const recs = (typeI: number) => {
    if (typeI >= 60) return [
      'Prioritize aerobic base, tempo runs/rides, and longer intervals',
      'Include 1–2 strength sessions weekly to support power output',
      'Use strides or short sprints to maintain neuromuscular speed',
    ];
    if (typeI <= 40) return [
      'Focus on max strength, Olympic lift derivatives, and plyometrics',
      'Sprint training with full recovery; maintain low‑intensity aerobic base',
      'Monitor fatigue to protect CNS freshness',
    ];
    return [
      'Blend aerobic base, threshold, and strength work for versatility',
      'Alternate power blocks with aerobic development weeks',
      'Retest performance markers every 6–8 weeks',
    ];
  };

  const warn = () => [
    'Avoid abrupt volume or intensity spikes (>10% per week)',
    'Persistent DOMS or sleep disruption signals under‑recovery',
    'Technique first on power lifts to reduce injury risk',
  ];

  const plan = () => ([
    { week: 1, focus: 'Baseline testing; establish easy aerobic sessions' },
    { week: 2, focus: 'Introduce strength (2×/wk) and short strides' },
    { week: 3, focus: 'Progress intensity: threshold or power lifts' },
    { week: 4, focus: 'Deload 20–30%; technique and mobility' },
    { week: 5, focus: 'Rebuild volume; add plyometrics or longer tempos' },
    { week: 6, focus: 'Sprint/interval emphasis with full recoveries' },
    { week: 7, focus: 'Race‑specific or sport‑specific sessions' },
    { week: 8, focus: 'Assessment and plan next block' },
  ]);

  const onSubmit = (values: FormValues) => {
    const res = calculate(values);
    if (!res) { setResult(null); return; }
    setResult({ typeIpercent: Math.round(res.typeI), typeIIpercent: Math.round(res.typeII), interpretation: interpret(res.typeI), recommendations: recs(res.typeI), warnings: warn(), plan: plan() });
  };

  return (
    <div className="space-y-8">
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2"><Activity className="h-5 w-5" /> Muscle Fiber Type Estimator</CardTitle>
          <CardDescription>Heuristic from contraction speed and fatigue characteristics</CardDescription>
        </CardHeader>
        <CardContent>
      <Form {...form}>
        <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-6">
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <FormField control={form.control} name="twitchTestTimeToPeakMs" render={({ field }) => (
              <FormItem>
                <FormLabel className="flex items-center gap-2"><Timer className="h-4 w-4" /> Time‑to‑Peak Force (ms)</FormLabel>
                <FormControl>
                  <Input type="number" step="1" placeholder="e.g., 80" {...field} value={field.value ?? ''} onChange={e => field.onChange(parseFloat(e.target.value) || undefined)} />
                </FormControl>
                <FormMessage />
              </FormItem>
            )} />
            <FormField control={form.control} name="fatigueIndexPercentDrop" render={({ field }) => (
              <FormItem>
                <FormLabel className="flex items-center gap-2"><BatteryCharging className="h-4 w-4" /> Fatigue Index (% drop)</FormLabel>
                <FormControl>
                  <Input type="number" step="1" placeholder="e.g., 35" {...field} value={field.value ?? ''} onChange={e => field.onChange(parseFloat(e.target.value) || undefined)} />
                </FormControl>
                <FormMessage />
              </FormItem>
            )} />
          </div>
          <Button type="submit" className="w-full md:w-auto">Estimate Fiber Ratio</Button>
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
                <CardTitle>Muscle Fiber Composition</CardTitle>
              </div>
              <CardDescription>Estimated proportion of Type I vs Type II</CardDescription>
            </CardHeader>
            <CardContent className="space-y-4">
              <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                <div className="text-center p-6 bg-primary/5 rounded-lg"><p className="text-sm text-muted-foreground mb-1">Type I</p><p className="text-3xl font-bold text-primary">{result.typeIpercent}%</p></div>
                <div className="text-center p-6 bg-green-50 dark:bg-green-950/20 rounded-lg"><p className="text-sm text-muted-foreground mb-1">Type II</p><p className="text-3xl font-bold text-green-600">{result.typeIIpercent}%</p></div>
              </div>
              <p className="text-sm">{result.interpretation}</p>
            </CardContent>
          </Card>
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            <Card>
              <CardHeader><CardTitle>Recommendations</CardTitle></CardHeader>
              <CardContent><ul className="space-y-2">{result.recommendations.map((r,i)=>(<li key={i} className="text-sm text-muted-foreground">{r}</li>))}</ul></CardContent>
            </Card>
            <Card>
              <CardHeader><CardTitle>Warning Signs</CardTitle></CardHeader>
              <CardContent><ul className="space-y-2">{result.warnings.map((w,i)=>(<li key={i} className="text-sm text-muted-foreground">{w}</li>))}</ul></CardContent>
            </Card>
          </div>
          <Card>
            <CardHeader><CardTitle className="flex items-center gap-2"><Calendar className="h-5 w-5" /> 8‑Week Plan</CardTitle></CardHeader>
            <CardContent>
              <div className="overflow-x-auto"><table className="w-full text-sm"><thead><tr className="border-b"><th className="text-left p-2">Week</th><th className="text-left p-2">Focus</th></tr></thead><tbody>{result.plan.map(p => (<tr key={p.week} className="border-b"><td className="p-2">{p.week}</td><td className="p-2">{p.focus}</td></tr>))}</tbody></table></div>
            </CardContent>
          </Card>
        </div>
      )}

      <Card>
        <CardHeader>
          <CardTitle>Related Calculators</CardTitle>
          <CardDescription>Training and physiology</CardDescription>
        </CardHeader>
        <CardContent>
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div className="p-4 border rounded"><h4 className="font-semibold mb-1"><Link href="/category/health-fitness/one-rep-max-strength-calculator" className="text-primary hover:underline">One‑Rep Max</Link></h4><p className="text-sm text-muted-foreground">Strength baseline.</p></div>
            <div className="p-4 border rounded"><h4 className="font-semibold mb-1"><Link href="/category/health-fitness/anaerobic-threshold-calculator" className="text-primary hover:underline">Anaerobic Threshold</Link></h4><p className="text-sm text-muted-foreground">Intensity domains.</p></div>
            <div className="p-4 border rounded"><h4 className="font-semibold mb-1"><Link href="/category/health-fitness/critical-power-calculator" className="text-primary hover:underline">Critical Power</Link></h4><p className="text-sm text-muted-foreground">Power profiles.</p></div>
            <div className="p-4 border rounded"><h4 className="font-semibold mb-1"><Link href="/category/health-fitness/training-volume-calculator" className="text-primary hover:underline">Training Volume</Link></h4><p className="text-sm text-muted-foreground">Plan workload.</p></div>
          </div>
        </CardContent>
      </Card>

      <Card>
        <CardHeader><CardTitle>Complete Guide: Muscle Fiber Types</CardTitle></CardHeader>
        <CardContent className="prose prose-sm dark:prose-invert max-w-none">
          <p>This is a sample line for the complete guide section. You can add your detailed content here.</p>
          <p>This is another sample line for the guide section. Replace these with your comprehensive guide content.</p>
        </CardContent>
      </Card>

      <Card>
        <CardHeader>
          <CardTitle>Frequently Asked Questions</CardTitle>
          <CardDescription>Detailed, SEO‑oriented answers</CardDescription>
        </CardHeader>
        <CardContent className="space-y-4">
          {[
            ['What determines my fiber type split?', 'Genetics set a baseline, but training shifts characteristics—endurance work promotes oxidative traits; power work improves fast‑twitch function.'],
            ['Is a lab biopsy required?', 'No. Field heuristics from performance and fatigue patterns can approximate tendencies; biopsies are rarely necessary.'],
            ['How often should I test?', 'Every 6–8 weeks is typical to observe adaptations and refine programming.'],
            ['Can Type II fibers become more fatigue‑resistant?', 'Yes—tempo work and aerobic intervals improve oxidative capacity of fast‑twitch fibers.'],
            ['Why do I fatigue quickly in sets?', 'A higher Type II tendency and/or insufficient aerobic base often causes steep fatigue curves.'],
            ['What sports favor Type I vs Type II?', 'Marathons and long cycling favor Type I; sprints, weightlifting, and jumps favor Type II.'],
            ['Should I train weaknesses or double down on strengths?', 'Do both: retain strengths while raising limiting qualities for balanced performance and resilience.'],
            ['Is soreness a good indicator?', 'DOMS is not a reliable proxy for adaptation; track performance trends and recovery markers.'],
          ].map(([q,a],i)=> (<div key={i}><h4 className="font-semibold mb-1">{q}</h4><p className="text-sm text-muted-foreground">{a}</p></div>))}
        </CardContent>
      </Card>
    </div>
  );
}



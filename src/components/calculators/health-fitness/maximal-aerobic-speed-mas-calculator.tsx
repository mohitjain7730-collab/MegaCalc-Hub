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
import { Zap, Activity, Timer, Ruler, Calendar } from 'lucide-react';

const formSchema = z.object({
  trialDistanceM: z.number().min(100).max(5000).optional(),
  timeMinutes: z.number().min(0).max(60).optional(),
  timeSeconds: z.number().min(0).max(59).optional(),
});

type FormValues = z.infer<typeof formSchema>;

type ResultPayload = {
  status: string;
  interpretation: string;
  recommendations: string[];
  warningSigns: string[];
  plan: { week: number; focus: string }[];
  masMs: number;
  masKmh: number;
  pacePerKm: string;
};

const plan = (): { week: number; focus: string }[] => [
  { week: 1, focus: 'Establish baseline MAS with a 3–6 minute all-out time trial' },
  { week: 2, focus: 'Add 1–2 VO₂max interval sessions (e.g., 30/30s) at 100–110% MAS' },
  { week: 3, focus: 'Keep long runs easy (60–75% MAS) to build aerobic base' },
  { week: 4, focus: 'Progress VO₂ blocks with slightly longer reps (e.g., 2–4 min at ~100% MAS)' },
  { week: 5, focus: 'Introduce strides and technique drills to improve economy' },
  { week: 6, focus: 'Consolidate training load—reduce volume by ~10–20% for recovery' },
  { week: 7, focus: 'Repeat MAS test or field session to gauge improvements' },
  { week: 8, focus: 'Adjust training paces and repeat the cycle' },
];

const faqs: [string, string][] = [
  ['What is MAS?', 'Maximal Aerobic Speed (MAS) is the minimal running speed at which VO₂max occurs. It is typically derived from an all-out time trial of 3–6 minutes and used to set training intensities.'],
  ['How do I test for MAS?', 'Perform an all-out time trial on flat terrain or a track. Enter the distance covered and total time; the calculator outputs speed and training guidance.'],
  ['What is a good MAS value?', 'Values vary widely by fitness level. Track your own changes over time rather than comparing to others.'],
  ['How do I use MAS in training?', 'Intervals at ~100–120% MAS improve VO₂max and speed; easy runs at 60–75% MAS build aerobic base.'],
  ['How often should I retest?', 'Every 6–8 weeks is typical, or after a block of VO₂-focused training.'],
  ['Does terrain affect MAS?', 'Yes—hills, wind, and surface type can skew results. Test in consistent conditions.'],
  ['Is heart rate useful with MAS?', 'Yes. Use HR to monitor internal load while MAS provides external intensity.'],
  ['Can beginners use MAS?', 'Yes, but start conservatively and prioritize technique and aerobic base.'],
  ['Is MAS the same as vVO₂max?', 'Closely related; MAS is often used interchangeably with vVO₂max in field settings.'],
  ['Should I warm up before testing?', 'Absolutely—include easy running and strides to ensure an accurate, safe maximal effort.'],
];

const understandingInputs = [
  { label: 'Time trial distance (m)', description: 'Meters covered during an all-out effort (commonly 1000–2000 m).' },
  { label: 'Minutes', description: 'Whole minutes of trial time.' },
  { label: 'Seconds', description: 'Remaining seconds of trial time (0–59).' },
];

const toPacePerKm = (speedMs: number) => {
  if (speedMs <= 0) return '—';
  const secPerKm = 1000 / speedMs;
  const m = Math.floor(secPerKm / 60);
  const s = Math.round(secPerKm % 60);
  return `${m}:${s.toString().padStart(2, '0')} /km`;
};

const interpret = (kmh: number) => {
  if (kmh >= 19) return 'High MAS—strong aerobic capacity. Structure training to convert speed into event-specific performance.';
  if (kmh >= 15) return 'Solid MAS—continue VO₂max intervals and economy work to progress.';
  return 'Develop aerobic base and technique with gradual intervals and consistent easy mileage.';
};

const recommendations = (kmh: number) => [
  'Schedule a thorough warm-up (easy jog + strides) before MAS tests and VO₂ sessions',
  kmh < 15 ? 'Prioritize easy aerobic volume and short intervals at 95–105% MAS' : 'Use mixed intervals (30/30s, 3–4 min reps) between 100–115% MAS',
  'Track perceived exertion and heart rate to balance external and internal load',
];

const warningSigns = () => [
  'Persistent soreness, sleep issues, or elevated resting HR indicate overreaching—reduce load',
  'Stop testing if you feel chest pain, dizziness, or severe shortness of breath',
  'Consult a professional before maximal tests if you have cardiovascular risk factors',
];

export default function MaximalAerobicSpeedMasCalculator() {
  const [result, setResult] = useState<ResultPayload | null>(null);
  const form = useForm<FormValues>({
    resolver: zodResolver(formSchema),
    defaultValues: { trialDistanceM: undefined, timeMinutes: undefined, timeSeconds: undefined },
  });

  const onSubmit = (values: FormValues) => {
    const { trialDistanceM, timeMinutes, timeSeconds } = values;
    if (trialDistanceM == null || timeMinutes == null || timeSeconds == null) {
      setResult(null);
      return;
    }
    const totalSeconds = timeMinutes * 60 + timeSeconds;
    if (totalSeconds <= 0) { setResult(null); return; }

    const masMs = trialDistanceM / totalSeconds;
    const masKmh = masMs * 3.6;

    setResult({
      status: 'Calculated',
      interpretation: interpret(masKmh),
      recommendations: recommendations(masKmh),
      warningSigns: warningSigns(),
      plan: plan(),
      masMs: Math.round(masMs * 100) / 100,
      masKmh: Math.round(masKmh * 10) / 10,
      pacePerKm: toPacePerKm(masMs),
    });
  };

  return (
    <div className="space-y-8">
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2"><Activity className="h-5 w-5" /> Maximal Aerobic Speed (MAS)</CardTitle>
          <CardDescription>Estimate MAS from a 3–6 minute all-out time trial.</CardDescription>
        </CardHeader>
        <CardContent>
          <Form {...form}>
            <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-6">
              <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                <FormField control={form.control} name="trialDistanceM" render={({ field }) => (
                  <FormItem>
                    <FormLabel className="flex items-center gap-2"><Ruler className="h-4 w-4" /> Time Trial Distance (m)</FormLabel>
                    <FormControl>
                      <Input type="number" step="1" placeholder="e.g., 1500" value={field.value ?? ''} onChange={(e)=>field.onChange(e.target.value===''?undefined:Number(e.target.value))} />
                    </FormControl>
                    <FormMessage />
                  </FormItem>
                )} />
                <FormField control={form.control} name="timeMinutes" render={({ field }) => (
                  <FormItem>
                    <FormLabel className="flex items-center gap-2"><Timer className="h-4 w-4" /> Minutes</FormLabel>
                    <FormControl>
                      <Input type="number" step="1" placeholder="e.g., 5" value={field.value ?? ''} onChange={(e)=>field.onChange(e.target.value===''?undefined:Number(e.target.value))} />
                    </FormControl>
                    <FormMessage />
                  </FormItem>
                )} />
                <FormField control={form.control} name="timeSeconds" render={({ field }) => (
                  <FormItem>
                    <FormLabel className="flex items-center gap-2"><Timer className="h-4 w-4" /> Seconds</FormLabel>
                    <FormControl>
                      <Input type="number" step="1" placeholder="e.g., 30" value={field.value ?? ''} onChange={(e)=>field.onChange(e.target.value===''?undefined:Number(e.target.value))} />
                    </FormControl>
                    <FormMessage />
                  </FormItem>
                )} />
              </div>
              <Button type="submit" className="w-full md:w-auto">Calculate MAS</Button>
            </form>
          </Form>
        </CardContent>
      </Card>

      {result && (
        <div className="space-y-6">
          <Card>
            <CardHeader>
              <div className="flex items-center gap-4"><Zap className="h-8 w-8 text-primary" /><CardTitle>MAS Summary</CardTitle></div>
              <CardDescription>Training paces derived from field-tested speed</CardDescription>
            </CardHeader>
            <CardContent className="space-y-4">
              <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                <div className="p-4 border rounded"><h4 className="font-semibold text-sm text-muted-foreground">MAS</h4><p className="text-2xl font-bold text-primary">{result.masMs} m/s</p></div>
                <div className="p-4 border rounded"><h4 className="font-semibold text-sm text-muted-foreground">MAS</h4><p className="text-2xl font-bold text-primary">{result.masKmh} km/h</p></div>
                <div className="p-4 border rounded"><h4 className="font-semibold text-sm text-muted-foreground">Equivalent Pace</h4><p className="text-2xl font-bold text-primary">{result.pacePerKm}</p></div>
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
            <CardHeader><CardTitle className="flex items-center gap-2"><Calendar className="h-5 w-5" /> 8‑Week VO₂ Block</CardTitle></CardHeader>
            <CardContent>
              <div className="overflow-x-auto">
                <table className="w-full text-sm"><thead><tr className="border-b"><th className="text-left p-2">Week</th><th className="text-left p-2">Focus</th></tr></thead><tbody>{plan().map((p)=>(<tr key={p.week} className="border-b"><td className="p-2">{p.week}</td><td className="p-2">{p.focus}</td></tr>))}</tbody></table>
              </div>
            </CardContent>
          </Card>
        </div>
      )}

      <Card>
        <CardHeader>
          <CardTitle>Understanding the Inputs</CardTitle>
          <CardDescription>Ensure an accurate, safe maximal effort</CardDescription>
        </CardHeader>
        <CardContent>
          <ul className="space-y-2">{understandingInputs.map((it)=>(<li key={it.label}><span className="font-semibold text-foreground">{it.label}:</span><span className="text-sm text-muted-foreground"> {it.description}</span></li>))}</ul>
        </CardContent>
      </Card>

      <Card>
        <CardHeader>
          <CardTitle>Related Calculators</CardTitle>
          <CardDescription>Layer MAS with other endurance tools</CardDescription>
        </CardHeader>
        <CardContent>
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div className="p-4 border rounded"><h4 className="font-semibold mb-1"><Link href="/category/health-fitness/vo2-max-calculator" className="text-primary hover:underline">VO₂ Max Calculator</Link></h4><p className="text-sm text-muted-foreground">Track aerobic capacity side-by-side with MAS.</p></div>
            <div className="p-4 border rounded"><h4 className="font-semibold mb-1"><Link href="/category/health-fitness/running-economy-calculator" className="text-primary hover:underline">Running Economy</Link></h4><p className="text-sm text-muted-foreground">Improve efficiency to translate MAS into performance.</p></div>
            <div className="p-4 border rounded"><h4 className="font-semibold mb-1"><Link href="/category/health-fitness/critical-power-calculator" className="text-primary hover:underline">Critical Power</Link></h4><p className="text-sm text-muted-foreground">Set endurance training zones with power-duration data.</p></div>
            <div className="p-4 border rounded"><h4 className="font-semibold mb-1"><Link href="/category/health-fitness/intermittent-fasting-calculator" className="text-primary hover:underline">Intermittent Fasting</Link></h4><p className="text-sm text-muted-foreground">Coordinate fueling strategies with hard sessions.</p></div>
          </div>
        </CardContent>
      </Card>

      <Card>
        <CardHeader><CardTitle>Complete Guide: Using MAS in Training</CardTitle></CardHeader>
        <CardContent className="prose prose-sm dark:prose-invert max-w-none">
          <p>MAS provides a practical anchor for VO₂max intervals and easy-run pacing. Pair it with economy drills, long easy mileage, and progressive overload. Retest every cycle to recalibrate paces and track progress without laboratory testing.</p>
        </CardContent>
      </Card>

      <Card>
        <CardHeader>
          <CardTitle>Frequently Asked Questions</CardTitle>
          <CardDescription>Detailed, SEO-oriented answers</CardDescription>
        </CardHeader>
        <CardContent className="space-y-4">
          {faqs.map(([q,a],i)=>(
            <div key={i}><h4 className="font-semibold mb-1">{q}</h4><p className="text-sm text-muted-foreground">{a}</p></div>
          ))}
        </CardContent>
      </Card>
    </div>
  );
}

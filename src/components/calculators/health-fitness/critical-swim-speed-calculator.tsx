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
  t200Min: z.number().min(0).max(30).optional(),
  t200Sec: z.number().min(0).max(59).optional(),
  t400Min: z.number().min(0).max(60).optional(),
  t400Sec: z.number().min(0).max(59).optional(),
});

type FormValues = z.infer<typeof formSchema>;

type ResultPayload = {
  status: string;
  interpretation: string;
  recommendations: string[];
  warningSigns: string[];
  plan: { week: number; focus: string }[];
  cssPacePer100m: string;
  cssSpeedMs: number;
};

const plan = (): { week: number; focus: string }[] => [
  { week: 1, focus: 'Baseline CSS from 400m and 200m time trials (separate, same session with rest)' },
  { week: 2, focus: 'Intervals at CSS (e.g., 10 × 100m with 10–15s rest) for aerobic endurance' },
  { week: 3, focus: 'Technique emphasis: streamline, catch, and rotation drills' },
  { week: 4, focus: 'Progress volume or reduce rest slightly on CSS sets' },
  { week: 5, focus: 'Include threshold work (e.g., 5 × 200m near CSS)' },
  { week: 6, focus: 'Deload week: reduce volume ~20% and refine technique' },
  { week: 7, focus: 'Re-test CSS and adjust training paces accordingly' },
  { week: 8, focus: 'Plan next cycle with new CSS-based sets' },
];

const faqs: [string, string][] = [
  ['What is Critical Swim Speed (CSS)?', 'CSS is the theoretical speed you can sustain continuously without exhaustion. It is often used to set aerobic training paces in swimming.'],
  ['How is CSS calculated?', 'CSS ≈ (T400 − T200) / 200, yielding a pace per meter. We present pace per 100m and an equivalent speed in m/s.'],
  ['Why use both 200m and 400m?', 'Using two distances helps estimate a sustainable threshold pace rather than maximal sprint speed.'],
  ['How accurate is CSS?', 'It is a field estimate; pool conditions, pacing, and technique affect results. Keep test conditions consistent.'],
  ['What rest should I use between trials?', 'Allow full recovery (e.g., 10–15 minutes easy swimming) between the 400m and 200m efforts in the same session.'],
  ['How often should I re-test?', 'Every 6–8 weeks or after a training block that targets threshold improvements.'],
  ['Does stroke type matter?', 'CSS is typically assessed with freestyle, but you can adapt testing for other strokes with consistent protocol.'],
  ['How do I convert CSS to training sets?', 'Use CSS for aerobic intervals (e.g., 100m repeats at CSS with short rest) and threshold work (e.g., 200m repeats near CSS).'],
  ['Can I use yards instead of meters?', 'Yes, but the formula and outputs then apply to yards. This calculator assumes meters. Convert times accordingly.'],
  ['What if my 200m is not faster than half my 400m?', 'Re-test with better pacing. The 200m time should be faster; otherwise the CSS estimate will be skewed.'],
];

const understandingInputs = [
  { label: '200m time', description: 'Enter minutes and seconds for an all-out 200m swim.' },
  { label: '400m time', description: 'Enter minutes and seconds for an all-out 400m swim (same session, paced well).' },
];

const toCss = (t200s: number, t400s: number) => {
  const diff = t400s - t200s;
  if (diff <= 0) return { pacePer100m: '—', speedMs: 0 };
  const secPerM = diff / 200;
  const secPer100 = secPerM * 100;
  const m = Math.floor(secPer100 / 60);
  const s = Math.round(secPer100 % 60);
  const paceStr = `${m}:${s.toString().padStart(2, '0')} /100m`;
  const speedMs = 1 / secPerM;
  return { pacePer100m: paceStr, speedMs };
};

const interpret = (speedMs: number) => {
  if (speedMs >= 1.4) return 'Strong CSS—solid aerobic threshold speed. Build volume and refine technique to sustain pace.';
  if (speedMs >= 1.2) return 'Moderate CSS—consistent threshold sets will raise sustainable speed.';
  return 'CSS indicates room for aerobic and technique development—focus on economy and regular threshold practice.';
};

const recommendations = (speedMs: number) => [
  'Keep technique priority high: streamline, catch efficiency, and hip-driven rotation',
  speedMs < 1.2 ? 'Emphasize easy aerobic volume and short intervals at CSS' : 'Progress to longer CSS sets with minimal rest to improve durability',
  'Use fins or pull buoy sparingly to reinforce mechanics without masking inefficiencies',
];

const warningSigns = () => [
  'Shoulder pain or elbow discomfort—reduce load and address technique before resuming intensity',
  'Shortness of breath or dizziness—stop immediately and recover safely',
  'Avoid maximal tests without adequate warm-up and supervision when needed',
];

export default function CriticalSwimSpeedCalculator() {
  const [result, setResult] = useState<ResultPayload | null>(null);
  const form = useForm<FormValues>({ resolver: zodResolver(formSchema), defaultValues: { t200Min: undefined, t200Sec: undefined, t400Min: undefined, t400Sec: undefined } });

  const onSubmit = (v: FormValues) => {
    const { t200Min, t200Sec, t400Min, t400Sec } = v;
    if (t200Min == null || t200Sec == null || t400Min == null || t400Sec == null) { setResult(null); return; }
    const t200s = t200Min * 60 + t200Sec;
    const t400s = t400Min * 60 + t400Sec;
    const { pacePer100m, speedMs } = toCss(t200s, t400s);
    if (speedMs <= 0) { setResult(null); return; }

    setResult({
      status: 'Calculated',
      interpretation: interpret(speedMs),
      recommendations: recommendations(speedMs),
      warningSigns: warningSigns(),
      plan: plan(),
      cssPacePer100m: pacePer100m,
      cssSpeedMs: Math.round(speedMs * 100) / 100,
    });
  };

  return (
    <div className="space-y-8">
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2"><Activity className="h-5 w-5" /> Critical Swim Speed (CSS)</CardTitle>
          <CardDescription>Estimate CSS from 200m and 400m time trials to set training pace.</CardDescription>
        </CardHeader>
        <CardContent>
          <Form {...form}>
            <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-6">
              <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
                <FormField control={form.control} name="t200Min" render={({ field }) => (
                  <FormItem>
                    <FormLabel className="flex items-center gap-2"><Timer className="h-4 w-4" /> 200m Minutes</FormLabel>
                    <FormControl>
                      <Input type="number" step="1" placeholder="e.g., 3" value={field.value ?? ''} onChange={(e)=>field.onChange(e.target.value===''?undefined:Number(e.target.value))} />
                    </FormControl>
                    <FormMessage />
                  </FormItem>
                )} />
                <FormField control={form.control} name="t200Sec" render={({ field }) => (
                  <FormItem>
                    <FormLabel className="flex items-center gap-2"><Timer className="h-4 w-4" /> 200m Seconds</FormLabel>
                    <FormControl>
                      <Input type="number" step="1" placeholder="e.g., 10" value={field.value ?? ''} onChange={(e)=>field.onChange(e.target.value===''?undefined:Number(e.target.value))} />
                    </FormControl>
                    <FormMessage />
                  </FormItem>
                )} />
                <FormField control={form.control} name="t400Min" render={({ field }) => (
                  <FormItem>
                    <FormLabel className="flex items-center gap-2"><Timer className="h-4 w-4" /> 400m Minutes</FormLabel>
                    <FormControl>
                      <Input type="number" step="1" placeholder="e.g., 6" value={field.value ?? ''} onChange={(e)=>field.onChange(e.target.value===''?undefined:Number(e.target.value))} />
                    </FormControl>
                    <FormMessage />
                  </FormItem>
                )} />
                <FormField control={form.control} name="t400Sec" render={({ field }) => (
                  <FormItem>
                    <FormLabel className="flex items-center gap-2"><Timer className="h-4 w-4" /> 400m Seconds</FormLabel>
                    <FormControl>
                      <Input type="number" step="1" placeholder="e.g., 30" value={field.value ?? ''} onChange={(e)=>field.onChange(e.target.value===''?undefined:Number(e.target.value))} />
                    </FormControl>
                    <FormMessage />
                  </FormItem>
                )} />
              </div>
              <Button type="submit" className="w-full md:w-auto">Calculate CSS</Button>
            </form>
          </Form>
        </CardContent>
      </Card>

      {result && (
        <div className="space-y-6">
          <Card>
            <CardHeader>
              <div className="flex items-center gap-4"><Zap className="h-8 w-8 text-primary" /><CardTitle>CSS Summary</CardTitle></div>
              <CardDescription>Threshold pace guidance for aerobic sets</CardDescription>
            </CardHeader>
            <CardContent className="space-y-4">
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div className="p-4 border rounded"><h4 className="text-sm font-semibold text-muted-foreground">CSS Pace</h4><p className="text-2xl font-bold text-primary">{result.cssPacePer100m}</p></div>
                <div className="p-4 border rounded"><h4 className="text-sm font-semibold text-muted-foreground">CSS Speed</h4><p className="text-2xl font-bold text-primary">{result.cssSpeedMs} m/s</p></div>
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
            <CardHeader><CardTitle className="flex items-center gap-2"><Calendar className="h-5 w-5" /> 8‑Week CSS Plan</CardTitle></CardHeader>
            <CardContent>
              <div className="overflow-x-auto">
                <table className="w-full text-sm"><thead><tr className="border-b"><th className="text-left p-2">Week</th><th className="text-left p-2">Focus</th></tr></thead><tbody>{plan().map(p=>(<tr key={p.week} className="border-b"><td className="p-2">{p.week}</td><td className="p-2">{p.focus}</td></tr>))}</tbody></table>
              </div>
            </CardContent>
          </Card>
        </div>
      )}

      <Card>
        <CardHeader>
          <CardTitle>Understanding the Inputs</CardTitle>
          <CardDescription>Ensure consistent pacing and full recovery between trials</CardDescription>
        </CardHeader>
        <CardContent>
          <ul className="space-y-2">{understandingInputs.map((it)=>(<li key={it.label}><span className="font-semibold text-foreground">{it.label}:</span><span className="text-sm text-muted-foreground"> {it.description}</span></li>))}</ul>
        </CardContent>
      </Card>

      <Card>
        <CardHeader>
          <CardTitle>Related Calculators</CardTitle>
          <CardDescription>Round out your swim training toolkit</CardDescription>
        </CardHeader>
        <CardContent>
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div className="p-4 border rounded"><h4 className="font-semibold mb-1"><Link href="/category/health-fitness/running-economy-calculator" className="text-primary hover:underline">Running Economy</Link></h4><p className="text-sm text-muted-foreground">Endurance economy concepts transfer across sports.</p></div>
            <div className="p-4 border rounded"><h4 className="font-semibold mb-1"><Link href="/category/health-fitness/critical-power-calculator" className="text-primary hover:underline">Critical Power</Link></h4><p className="text-sm text-muted-foreground">Use power-duration methods in other disciplines.</p></div>
            <div className="p-4 border rounded"><h4 className="font-semibold mb-1"><Link href="/category/health-fitness/vo2-max-calculator" className="text-primary hover:underline">VO₂ Max</Link></h4><p className="text-sm text-muted-foreground">Anchor aerobic capacity alongside CSS.</p></div>
            <div className="p-4 border rounded"><h4 className="font-semibold mb-1"><Link href="/category/health-fitness/hydration-needs-calculator" className="text-primary hover:underline">Hydration Needs</Link></h4><p className="text-sm text-muted-foreground">Pool sessions demand consistent hydration strategies.</p></div>
          </div>
        </CardContent>
      </Card>

      <Card>
        <CardHeader><CardTitle>Complete Guide: Training with CSS</CardTitle></CardHeader>
        <CardContent className="prose prose-sm dark:prose-invert max-w-none">
          <p>CSS sets provide sustainable threshold work that builds aerobic endurance and technique under moderate fatigue. Keep rest short, volume appropriate, and technique crisp. Retest regularly to keep paces aligned with your fitness.</p>
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

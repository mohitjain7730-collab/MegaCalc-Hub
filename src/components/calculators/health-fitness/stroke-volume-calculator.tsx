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
import { Zap, HeartPulse, Gauge, Calendar } from 'lucide-react';

const formSchema = z.object({
  cardiacOutputLMin: z.number().min(1).max(30).optional(),
  heartRateBpm: z.number().min(30).max(220).optional(),
});

type FormValues = z.infer<typeof formSchema>;

type ResultPayload = {
  status: string;
  interpretation: string;
  recommendations: string[];
  warningSigns: string[];
  plan: { week: number; focus: string }[];
  strokeVolumeMl: number;
};

const plan = (): { week: number; focus: string }[] => [
  { week: 1, focus: 'Measure resting HR consistently on waking for a reliable baseline' },
  { week: 2, focus: 'Add easy aerobic sessions to improve stroke volume' },
  { week: 3, focus: 'Incorporate tempo intervals to challenge cardiac output safely' },
  { week: 4, focus: 'Deload 10–20% for recovery; monitor resting HR changes' },
  { week: 5, focus: 'Combine aerobic volume with strength training for peripheral adaptations' },
  { week: 6, focus: 'Repeat submax assessments to track HR at known workloads' },
  { week: 7, focus: 'Adjust training intensity based on fatigue and progress' },
  { week: 8, focus: 'Reassess and plan next cycle' },
];

const faqs: [string, string][] = [
  ['What is stroke volume?', 'Stroke volume (SV) is the amount of blood pumped from the left ventricle per heartbeat.'],
  ['How do I calculate SV?', 'SV = Cardiac Output (L/min) × 1000 ÷ Heart Rate (bpm). This calculator performs that conversion.'],
  ['What are typical SV values?', 'At rest, SV commonly ranges from ~60–100 mL/beat, varying by size and fitness.'],
  ['Does training increase SV?', 'Endurance training often increases stroke volume and reduces resting HR.'],
  ['How accurate is this?', 'SV typically requires clinical tools for precise measurement. This is an educational estimate based on provided values.'],
  ['Why does hydration matter?', 'Dehydration reduces plasma volume, potentially lowering stroke volume.'],
  ['Can medications affect SV?', 'Yes—cardiac medications and conditions alter HR and contractility, affecting SV and CO.'],
  ['When should I re-check?', 'Reassess after training blocks or when changing routines that affect cardiovascular status.'],
  ['Is a very high SV good?', 'Context matters. Consult a clinician to interpret unusually high or low values.'],
  ['Is this medical advice?', 'No—educational only. Seek professional evaluation for health concerns.'],
];

const understandingInputs = [
  { label: 'Cardiac Output (L/min)', description: 'Total blood volume pumped by the heart each minute.' },
  { label: 'Heart Rate (bpm)', description: 'Beats per minute at the time of the cardiac output measurement.' },
];

const interpret = (sv: number) => {
  if (sv < 50) return 'Lower than typical resting range—verify inputs and measurement context.';
  if (sv <= 100) return 'Within typical resting range for many adults, depending on size and fitness.';
  return 'Above typical resting range—ensure context (athletic heart, exercise) or consult a clinician if unsure.';
};

const recommendations = () => [
  'Take measurements under similar conditions (time of day, position, hydration)',
  'Use aerobic training and adequate recovery to support cardiovascular function',
  'Discuss unusual values with healthcare providers for proper evaluation',
];

const warningSigns = () => [
  'Seek urgent care for chest pain, fainting, or severe shortness of breath',
  'Do not change medications based on estimates alone',
  'Persistent abnormalities require clinical assessment',
];

export default function StrokeVolumeCalculator() {
  const [result, setResult] = useState<ResultPayload | null>(null);
  const form = useForm<FormValues>({ resolver: zodResolver(formSchema), defaultValues: { cardiacOutputLMin: undefined, heartRateBpm: undefined } });

  const onSubmit = (v: FormValues) => {
    const { cardiacOutputLMin, heartRateBpm } = v;
    if (cardiacOutputLMin == null || heartRateBpm == null || heartRateBpm <= 0) { setResult(null); return; }
    const strokeVolumeMl = (cardiacOutputLMin * 1000) / heartRateBpm;

    setResult({
      status: 'Calculated',
      interpretation: interpret(strokeVolumeMl),
      recommendations: recommendations(),
      warningSigns: warningSigns(),
      plan: plan(),
      strokeVolumeMl: Math.round(strokeVolumeMl),
    });
  };

  return (
    <div className="space-y-8">
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2"><Gauge className="h-5 w-5" /> Stroke Volume</CardTitle>
          <CardDescription>Estimate stroke volume (mL/beat) from cardiac output and heart rate.</CardDescription>
        </CardHeader>
        <CardContent>
          <Form {...form}>
            <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-6">
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <FormField control={form.control} name="cardiacOutputLMin" render={({ field }) => (
                  <FormItem>
                    <FormLabel className="flex items-center gap-2"><Gauge className="h-4 w-4" /> Cardiac Output (L/min)</FormLabel>
                    <FormControl><Input type="number" step="0.1" placeholder="e.g., 5.2" value={field.value ?? ''} onChange={(e)=>field.onChange(e.target.value===''?undefined:Number(e.target.value))} /></FormControl>
                    <FormMessage />
                  </FormItem>
                )} />
                <FormField control={form.control} name="heartRateBpm" render={({ field }) => (
                  <FormItem>
                    <FormLabel className="flex items-center gap-2"><HeartPulse className="h-4 w-4" /> Heart Rate (bpm)</FormLabel>
                    <FormControl><Input type="number" step="1" placeholder="e.g., 60" value={field.value ?? ''} onChange={(e)=>field.onChange(e.target.value===''?undefined:Number(e.target.value))} /></FormControl>
                    <FormMessage />
                  </FormItem>
                )} />
              </div>
              <Button type="submit" className="w-full md:w-auto">Calculate Stroke Volume</Button>
            </form>
          </Form>
        </CardContent>
      </Card>

      {result && (
        <div className="space-y-6">
          <Card>
            <CardHeader>
              <div className="flex items-center gap-4"><Zap className="h-8 w-8 text-primary" /><CardTitle>Stroke Volume Summary</CardTitle></div>
              <CardDescription>Educational interpretation only</CardDescription>
            </CardHeader>
            <CardContent className="space-y-4">
              <div className="p-4 border rounded"><h4 className="text-sm font-semibold text-muted-foreground">Stroke Volume</h4><p className="text-2xl font-bold text-primary">{result.strokeVolumeMl} mL/beat</p></div>
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
            <CardHeader><CardTitle className="flex items-center gap-2"><Calendar className="h-5 w-5" /> 8‑Week Cardio Support Plan</CardTitle></CardHeader>
            <CardContent>
              <div className="overflow-x-auto"><table className="w-full text-sm"><thead><tr className="border-b"><th className="text-left p-2">Week</th><th className="text-left p-2">Focus</th></tr></thead><tbody>{plan().map(p=>(<tr key={p.week} className="border-b"><td className="p-2">{p.week}</td><td className="p-2">{p.focus}</td></tr>))}</tbody></table></div>
            </CardContent>
          </Card>
        </div>
      )}

      <Card>
        <CardHeader>
          <CardTitle>Understanding the Inputs</CardTitle>
          <CardDescription>Use consistent, rested conditions when possible</CardDescription>
        </CardHeader>
        <CardContent>
          <ul className="space-y-2">{understandingInputs.map((it)=>(<li key={it.label}><span className="font-semibold text-foreground">{it.label}:</span><span className="text-sm text-muted-foreground"> {it.description}</span></li>))}</ul>
        </CardContent>
      </Card>

      <Card>
        <CardHeader>
          <CardTitle>Related Calculators</CardTitle>
          <CardDescription>Connect heart function estimates</CardDescription>
        </CardHeader>
        <CardContent>
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div className="p-4 border rounded"><h4 className="font-semibold mb-1"><Link href="/category/health-fitness/cardiac-output-calculator" className="text-primary hover:underline">Cardiac Output</Link></h4><p className="text-sm text-muted-foreground">Compute CO from HR and SV.</p></div>
            <div className="p-4 border rounded"><h4 className="font-semibold mb-1"><Link href="/category/health-fitness/power-to-heart-rate-efficiency-calculator" className="text-primary hover:underline">Power-to-HR Efficiency</Link></h4><p className="text-sm text-muted-foreground">Relate output to cardiovascular effort.</p></div>
            <div className="p-4 border rounded"><h4 className="font-semibold mb-1"><Link href="/category/health-fitness/vo2-max-calculator" className="text-primary hover:underline">VO₂ Max</Link></h4><p className="text-sm text-muted-foreground">Capacity context for stroke volume.</p></div>
            <div className="p-4 border rounded"><h4 className="font-semibold mb-1"><Link href="/category/health-fitness/hydration-needs-calculator" className="text-primary hover:underline">Hydration Needs</Link></h4><p className="text-sm text-muted-foreground">Support blood volume for cardiac output.</p></div>
          </div>
        </CardContent>
      </Card>

      <Card>
        <CardHeader><CardTitle>Complete Guide: Stroke Volume in Context</CardTitle></CardHeader>
        <CardContent className="prose prose-sm dark:prose-invert max-w-none">
          <p>Stroke volume interacts with heart rate and vascular resistance to determine cardiac output. Training, hydration, and recovery all shape these variables. Use this estimate to inform, not replace, professional assessment.</p>
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

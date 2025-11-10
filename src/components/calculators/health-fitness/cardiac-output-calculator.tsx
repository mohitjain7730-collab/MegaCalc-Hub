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
  heartRateBpm: z.number().min(30).max(220).optional(),
  strokeVolumeMl: z.number().min(20).max(200).optional(),
});

type FormValues = z.infer<typeof formSchema>;

type ResultPayload = {
  status: string;
  interpretation: string;
  recommendations: string[];
  warningSigns: string[];
  plan: { week: number; focus: string }[];
  cardiacOutputLMin: number;
};

const plan = (): { week: number; focus: string }[] => [
  { week: 1, focus: 'Track resting HR and perceived exertion; establish baseline cardiovascular metrics' },
  { week: 2, focus: 'Begin aerobic base training (3–4 sessions/week) to improve stroke volume' },
  { week: 3, focus: 'Add tempo intervals to enhance cardiac output at submax intensities' },
  { week: 4, focus: 'Prioritize recovery (sleep, hydration); reassess resting HR' },
  { week: 5, focus: 'Introduce strength training to support peripheral adaptations' },
  { week: 6, focus: 'Perform a standardized submax test to compare HR responses' },
  { week: 7, focus: 'Deload slightly; assess progress and adjust training' },
  { week: 8, focus: 'Plan next cycle; maintain aerobic consistency' },
];

const faqs: [string, string][] = [
  ['What is cardiac output?', 'Cardiac output (CO) is the volume of blood the heart pumps per minute. It equals stroke volume (SV) times heart rate (HR).'],
  ['What are typical values?', 'At rest, CO is around 4–7 L/min in healthy adults. During intense exercise, it can exceed 20 L/min.'],
  ['Does training affect CO?', 'Endurance training increases stroke volume and can lower resting HR, improving cardiac efficiency.'],
  ['How do I measure stroke volume?', 'SV is typically measured via echocardiography. This calculator is educational and uses any provided estimate.'],
  ['Can wearables estimate CO?', 'Some devices estimate CO indirectly, but accuracy varies. Clinical measurements are more reliable.'],
  ['Is a high resting CO good?', 'Not necessarily. Context matters. Consult a clinician for interpretation relative to symptoms and measurements.'],
  ['What influences CO?', 'Blood volume, contractility, venous return, and systemic resistance all influence cardiac output.'],
  ['Can dehydration affect CO?', 'Yes, dehydration reduces plasma volume and can lower stroke volume and cardiac output.'],
  ['When should I seek help?', 'Chest pain, dizziness, fainting, or palpitations warrant medical evaluation.'],
  ['Is this calculator medical advice?', 'No. It is an educational tool and not a diagnostic device.'],
];

const understandingInputs = [
  { label: 'Heart Rate (bpm)', description: 'Beats per minute at the time of measurement.' },
  { label: 'Stroke Volume (mL/beat)', description: 'Volume of blood pumped by the left ventricle per beat.' },
];

const interpret = (co: number) => {
  if (co < 4) return 'Below typical resting range—verify measurement conditions and consult a clinician if symptoms exist.';
  if (co <= 7) return 'Within typical resting range for healthy adults.';
  return 'Above typical resting range—ensure context (exercise, stress) or consult a professional if concerned.';
};

const recommendations = (co: number) => [
  'Measure at consistent times and positions (e.g., seated, rested) for comparability',
  'Prioritize aerobic training, hydration, and sleep to support cardiac function',
  'Discuss unusual values with a healthcare professional—context is critical',
];

const warningSigns = () => [
  'Chest pain, severe shortness of breath, or syncope require immediate medical attention',
  'Do not self-diagnose or change medications based on calculator output',
  'Persistent abnormalities should be evaluated clinically',
];

export default function CardiacOutputCalculator() {
  const [result, setResult] = useState<ResultPayload | null>(null);
  const form = useForm<FormValues>({ resolver: zodResolver(formSchema), defaultValues: { heartRateBpm: undefined, strokeVolumeMl: undefined } });

  const onSubmit = (v: FormValues) => {
    const { heartRateBpm, strokeVolumeMl } = v;
    if (heartRateBpm == null || strokeVolumeMl == null) { setResult(null); return; }
    const coLMin = (heartRateBpm * strokeVolumeMl) / 1000; // mL/min to L/min

    setResult({
      status: 'Calculated',
      interpretation: interpret(coLMin),
      recommendations: recommendations(coLMin),
      warningSigns: warningSigns(),
      plan: plan(),
      cardiacOutputLMin: Math.round(coLMin * 10) / 10,
    });
  };

  return (
    <div className="space-y-8">
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2"><HeartPulse className="h-5 w-5" /> Cardiac Output</CardTitle>
          <CardDescription>Estimate cardiac output (L/min) from heart rate and stroke volume.</CardDescription>
        </CardHeader>
        <CardContent>
          <Form {...form}>
            <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-6">
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <FormField control={form.control} name="heartRateBpm" render={({ field }) => (
                  <FormItem>
                    <FormLabel className="flex items-center gap-2"><HeartPulse className="h-4 w-4" /> Heart Rate (bpm)</FormLabel>
                    <FormControl><Input type="number" step="1" placeholder="e.g., 60" value={field.value ?? ''} onChange={(e)=>field.onChange(e.target.value===''?undefined:Number(e.target.value))} /></FormControl>
                    <FormMessage />
                  </FormItem>
                )} />
                <FormField control={form.control} name="strokeVolumeMl" render={({ field }) => (
                  <FormItem>
                    <FormLabel className="flex items-center gap-2"><Gauge className="h-4 w-4" /> Stroke Volume (mL/beat)</FormLabel>
                    <FormControl><Input type="number" step="1" placeholder="e.g., 70" value={field.value ?? ''} onChange={(e)=>field.onChange(e.target.value===''?undefined:Number(e.target.value))} /></FormControl>
                    <FormMessage />
                  </FormItem>
                )} />
              </div>
              <Button type="submit" className="w-full md:w-auto">Calculate Cardiac Output</Button>
            </form>
          </Form>
        </CardContent>
      </Card>

      {result && (
        <div className="space-y-6">
          <Card>
            <CardHeader>
              <div className="flex items-center gap-4"><Zap className="h-8 w-8 text-primary" /><CardTitle>Output Summary</CardTitle></div>
              <CardDescription>Interpretation is for educational purposes</CardDescription>
            </CardHeader>
            <CardContent className="space-y-4">
              <div className="p-4 border rounded"><h4 className="text-sm font-semibold text-muted-foreground">Cardiac Output</h4><p className="text-2xl font-bold text-primary">{result.cardiacOutputLMin} L/min</p></div>
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
            <CardHeader><CardTitle className="flex items-center gap-2"><Calendar className="h-5 w-5" /> 8‑Week Cardio Plan</CardTitle></CardHeader>
            <CardContent>
              <div className="overflow-x-auto"><table className="w-full text-sm"><thead><tr className="border-b"><th className="text-left p-2">Week</th><th className="text-left p-2">Focus</th></tr></thead><tbody>{plan().map(p=>(<tr key={p.week} className="border-b"><td className="p-2">{p.week}</td><td className="p-2">{p.focus}</td></tr>))}</tbody></table></div>
            </CardContent>
          </Card>
        </div>
      )}

      <Card>
        <CardHeader>
          <CardTitle>Understanding the Inputs</CardTitle>
          <CardDescription>Measure under consistent resting or steady conditions</CardDescription>
        </CardHeader>
        <CardContent>
          <ul className="space-y-2">{understandingInputs.map((it)=>(<li key={it.label}><span className="font-semibold text-foreground">{it.label}:</span><span className="text-sm text-muted-foreground"> {it.description}</span></li>))}</ul>
        </CardContent>
      </Card>

      <Card>
        <CardHeader>
          <CardTitle>Related Calculators</CardTitle>
          <CardDescription>Explore complementary cardiovascular tools</CardDescription>
        </CardHeader>
        <CardContent>
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div className="p-4 border rounded"><h4 className="font-semibold mb-1"><Link href="/category/health-fitness/stroke-volume-calculator" className="text-primary hover:underline">Stroke Volume</Link></h4><p className="text-sm text-muted-foreground">Derive SV from cardiac output and heart rate.</p></div>
            <div className="p-4 border rounded"><h4 className="font-semibold mb-1"><Link href="/category/health-fitness/power-to-heart-rate-efficiency-calculator" className="text-primary hover:underline">Power-to-HR Efficiency</Link></h4><p className="text-sm text-muted-foreground">Relate mechanical output to cardiovascular effort.</p></div>
            <div className="p-4 border rounded"><h4 className="font-semibold mb-1"><Link href="/category/health-fitness/vo2-max-calculator" className="text-primary hover:underline">VO₂ Max</Link></h4><p className="text-sm text-muted-foreground">Capacity benchmark for endurance training.</p></div>
            <div className="p-4 border rounded"><h4 className="font-semibold mb-1"><Link href="/category/health-fitness/hydration-needs-calculator" className="text-primary hover:underline">Hydration Needs</Link></h4><p className="text-sm text-muted-foreground">Support plasma volume and performance.</p></div>
          </div>
        </CardContent>
      </Card>

      <Card>
        <CardHeader><CardTitle>Complete Guide: Cardiac Output Basics</CardTitle></CardHeader>
        <CardContent className="prose prose-sm dark:prose-invert max-w-none">
          <p>Cardiac output responds dynamically to posture, hydration, temperature, and exercise intensity. Pair this estimate with professional evaluation when interpreting unusual values or symptoms. For training, focus on consistent aerobic work, strength, and recovery.</p>
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

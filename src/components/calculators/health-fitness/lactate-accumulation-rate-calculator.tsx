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
import { Zap, TrendingUp, Droplet, Timer, Gauge, Calendar } from 'lucide-react';

const formSchema = z.object({
  lactateStart: z.number().min(0.5).max(10).optional(),
  lactateEnd: z.number().min(0.5).max(20).optional(),
  durationMin: z.number().min(5).max(120).optional(),
  intensityPercent: z.number().min(50).max(100).optional(),
});

type FormValues = z.infer<typeof formSchema>;

type ResultPayload = {
  status: string;
  interpretation: string;
  recommendations: string[];
  warningSigns: string[];
  plan: { week: number; focus: string }[];
  accumulationRate: number;
  category: string;
};

const plan = (): { week: number; focus: string }[] => [
  { week: 1, focus: 'Establish baseline lactate levels at rest and during steady exercise' },
  { week: 2, focus: 'Train below lactate threshold (1–2 mmol/L) for long aerobic sessions' },
  { week: 3, focus: 'Add threshold work (2–4 mmol/L) to raise lactate threshold' },
  { week: 4, focus: 'Deload week: reduce volume 20%, focus on recovery and technique' },
  { week: 5, focus: 'Introduce high-intensity intervals (4+ mmol/L) to improve lactate clearance' },
  { week: 6, focus: 'Balance aerobic base (70–80% of volume) with threshold and interval work' },
  { week: 7, focus: 'Re-test lactate accumulation at standardized intensities' },
  { week: 8, focus: 'Adjust training zones based on new lactate profiles' },
];

const faqs: [string, string][] = [
  ['What is lactate accumulation rate?', 'Lactate accumulation rate measures how quickly blood lactate levels rise during exercise. It indicates metabolic stress and helps identify training zones.'],
  ['How is lactate accumulation calculated?', 'The rate is calculated as (Ending Lactate − Starting Lactate) / Duration in minutes, expressed as mmol/L/min.'],
  ['What are normal lactate values?', 'Resting lactate is typically 0.5–1.5 mmol/L. During exercise, values range from 1–2 mmol/L (aerobic) to 4+ mmol/L (anaerobic threshold and above).'],
  ['What causes lactate accumulation?', 'Lactate is produced when energy demand exceeds oxygen supply (anaerobic glycolysis). It\'s not the cause of fatigue but an indicator of metabolic stress.'],
  ['What is lactate threshold?', 'Lactate threshold is the exercise intensity at which lactate begins to accumulate rapidly (typically 2–4 mmol/L). It represents sustainable high intensity.'],
  ['How do I improve lactate handling?', 'Improve through aerobic base training, threshold work to raise the threshold, and high-intensity intervals to enhance clearance capacity.'],
  ['Can I train above lactate threshold?', 'Yes, but sparingly. Training above threshold (4+ mmol/L) improves clearance but requires adequate recovery between sessions.'],
  ['How often should I test lactate?', 'Re-test every 6–8 weeks or after training blocks targeting lactate threshold improvements. Regular testing helps track progress.'],
  ['Does fitness level affect lactate accumulation?', 'Yes, fitter athletes typically have lower lactate at the same intensity and a higher threshold, indicating better aerobic capacity.'],
  ['Is lactate bad for performance?', 'No, lactate is a fuel source. High accumulation indicates you\'re above threshold, but proper training can improve both threshold and clearance.'],
];

const understandingInputs = [
  { label: 'Starting Lactate (mmol/L)', description: 'Blood lactate level at the beginning of the exercise period (typically resting or low-intensity baseline).' },
  { label: 'Ending Lactate (mmol/L)', description: 'Blood lactate level at the end of the exercise period after sustained effort.' },
  { label: 'Duration (minutes)', description: 'Duration of the exercise period between lactate measurements.' },
  { label: 'Intensity (% max)', description: 'Exercise intensity as a percentage of maximum effort during the test period.' },
];

const interpret = (rate: number) => {
  if (rate >= 2.0) return 'Very high accumulation—unsustainable intensity. Reduce pace or duration to maintain performance.';
  if (rate >= 1.0) return 'High accumulation—above lactate threshold. Suitable for short intervals, not sustained efforts.';
  if (rate >= 0.5) return 'Moderate accumulation—near lactate threshold. Good for threshold training sessions.';
  return 'Low accumulation—well below threshold. Sustainable intensity for long aerobic sessions.';
};

const recommendations = (rate: number) => [
  'Stay below 2 mmol/L for long endurance sessions to build aerobic base',
  rate >= 1.0 ? 'Use 2–4 mmol/L for threshold work and 4+ mmol/L sparingly for high-intensity intervals' : 'Continue building aerobic capacity with consistent low-intensity volume',
  'Monitor recovery between sessions—high lactate accumulation requires adequate rest',
];

const warningSigns = () => [
  'Stop testing if you experience chest pain, dizziness, or severe shortness of breath',
  'Very high lactate accumulation (>4 mmol/L) during steady efforts may indicate poor pacing or overreaching',
  'Consult a healthcare provider before lactate testing if you have cardiovascular conditions',
];

export default function LactateAccumulationRateCalculator() {
  const [result, setResult] = useState<ResultPayload | null>(null);
  const form = useForm<FormValues>({
    resolver: zodResolver(formSchema),
    defaultValues: {
      lactateStart: undefined,
      lactateEnd: undefined,
      durationMin: undefined,
      intensityPercent: undefined,
    },
  });

  const onSubmit = (values: FormValues) => {
    const { lactateStart, lactateEnd, durationMin, intensityPercent } = values;
    if (lactateStart == null || lactateEnd == null || durationMin == null || intensityPercent == null) {
      setResult(null);
      return;
    }
    if (lactateEnd <= lactateStart || durationMin <= 0) {
      setResult(null);
      return;
    }

    const lactateIncrease = lactateEnd - lactateStart;
    const accumulationRate = lactateIncrease / durationMin;

    let category = 'Moderate';
    if (accumulationRate >= 2.0) category = 'Very High';
    else if (accumulationRate >= 1.0) category = 'High';
    else if (accumulationRate >= 0.5) category = 'Moderate';
    else category = 'Low';

    setResult({
      status: 'Calculated',
      interpretation: interpret(accumulationRate),
      recommendations: recommendations(accumulationRate),
      warningSigns: warningSigns(),
      plan: plan(),
      accumulationRate: Math.round(accumulationRate * 100) / 100,
      category,
    });
  };

  return (
    <div className="space-y-8">
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2"><TrendingUp className="h-5 w-5" /> Lactate Accumulation Rate Calculator</CardTitle>
          <CardDescription>Calculate lactate buildup rate during exercise to identify training zones and metabolic stress.</CardDescription>
        </CardHeader>
        <CardContent>
          <Form {...form}>
            <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-6">
              <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
                <FormField control={form.control} name="lactateStart" render={({ field }) => (
                  <FormItem>
                    <FormLabel className="flex items-center gap-2"><Droplet className="h-4 w-4" /> Starting Lactate (mmol/L)</FormLabel>
                    <FormControl>
                      <Input type="number" step="0.1" placeholder="e.g., 1.2" value={field.value ?? ''} onChange={(e)=>field.onChange(e.target.value===''?undefined:Number(e.target.value))} />
                    </FormControl>
                    <FormMessage />
                  </FormItem>
                )} />
                <FormField control={form.control} name="lactateEnd" render={({ field }) => (
                  <FormItem>
                    <FormLabel className="flex items-center gap-2"><Droplet className="h-4 w-4" /> Ending Lactate (mmol/L)</FormLabel>
                    <FormControl>
                      <Input type="number" step="0.1" placeholder="e.g., 4.5" value={field.value ?? ''} onChange={(e)=>field.onChange(e.target.value===''?undefined:Number(e.target.value))} />
                    </FormControl>
                    <FormMessage />
                  </FormItem>
                )} />
                <FormField control={form.control} name="durationMin" render={({ field }) => (
                  <FormItem>
                    <FormLabel className="flex items-center gap-2"><Timer className="h-4 w-4" /> Duration (min)</FormLabel>
                    <FormControl>
                      <Input type="number" step="1" placeholder="e.g., 20" value={field.value ?? ''} onChange={(e)=>field.onChange(e.target.value===''?undefined:Number(e.target.value))} />
                    </FormControl>
                    <FormMessage />
                  </FormItem>
                )} />
                <FormField control={form.control} name="intensityPercent" render={({ field }) => (
                  <FormItem>
                    <FormLabel className="flex items-center gap-2"><Gauge className="h-4 w-4" /> Intensity (% max)</FormLabel>
                    <FormControl>
                      <Input type="number" step="1" placeholder="e.g., 85" value={field.value ?? ''} onChange={(e)=>field.onChange(e.target.value===''?undefined:Number(e.target.value))} />
                    </FormControl>
                    <FormMessage />
                  </FormItem>
                )} />
              </div>
              <Button type="submit" className="w-full md:w-auto">Calculate Accumulation Rate</Button>
            </form>
          </Form>
        </CardContent>
      </Card>

      {result && (
        <div className="space-y-6">
          <Card>
            <CardHeader>
              <div className="flex items-center gap-4"><Zap className="h-8 w-8 text-primary" /><CardTitle>Lactate Accumulation Summary</CardTitle></div>
              <CardDescription>Metabolic stress indicator for training zone prescription</CardDescription>
            </CardHeader>
            <CardContent className="space-y-4">
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div className="p-4 border rounded"><h4 className="text-sm font-semibold text-muted-foreground">Accumulation Rate</h4><p className="text-2xl font-bold text-primary">{result.accumulationRate} mmol/L/min</p></div>
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
            <CardHeader><CardTitle className="flex items-center gap-2"><Calendar className="h-5 w-5" /> 8‑Week Lactate Training Plan</CardTitle></CardHeader>
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
          <CardDescription>Use consistent measurement protocols for reliable comparisons</CardDescription>
        </CardHeader>
        <CardContent>
          <ul className="space-y-2">{understandingInputs.map((it)=>(<li key={it.label}><span className="font-semibold text-foreground">{it.label}:</span><span className="text-sm text-muted-foreground"> {it.description}</span></li>))}</ul>
        </CardContent>
      </Card>

      <Card>
        <CardHeader>
          <CardTitle>Related Calculators</CardTitle>
          <CardDescription>Complementary tools for metabolic and training analysis</CardDescription>
        </CardHeader>
        <CardContent>
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div className="p-4 border rounded"><h4 className="font-semibold mb-1"><Link href="/category/health-fitness/anaerobic-threshold-calculator" className="text-primary hover:underline">Anaerobic Threshold</Link></h4><p className="text-sm text-muted-foreground">Identify sustainable high-intensity training zones.</p></div>
            <div className="p-4 border rounded"><h4 className="font-semibold mb-1"><Link href="/category/health-fitness/vo2-reserve-calculator" className="text-primary hover:underline">VO₂ Reserve</Link></h4><p className="text-sm text-muted-foreground">Set training zones based on oxygen consumption reserve.</p></div>
            <div className="p-4 border rounded"><h4 className="font-semibold mb-1"><Link href="/category/health-fitness/training-stress-score-calculator" className="text-primary hover:underline">Training Stress Score</Link></h4><p className="text-sm text-muted-foreground">Quantify training load and recovery needs.</p></div>
            <div className="p-4 border rounded"><h4 className="font-semibold mb-1"><Link href="/category/health-fitness/anaerobic-capacity-calculator" className="text-primary hover:underline">Anaerobic Capacity</Link></h4><p className="text-sm text-muted-foreground">Assess power output for short, high-intensity efforts.</p></div>
          </div>
        </CardContent>
      </Card>

      <Card>
        <CardHeader><CardTitle>Complete Guide: Understanding Lactate Accumulation</CardTitle></CardHeader>
        <CardContent className="prose prose-sm dark:prose-invert max-w-none">
          <p>Lactate accumulation rate helps identify training zones and metabolic stress. Stay below 2 mmol/L for long aerobic sessions, train at 2–4 mmol/L for threshold work, and use 4+ mmol/L sparingly for high-intensity intervals. Regular testing helps track improvements in lactate threshold and clearance capacity. Balance aerobic base training with threshold and interval work for optimal performance.</p>
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

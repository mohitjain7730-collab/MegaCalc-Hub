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
import { Zap, HeartPulse, Calendar, Timer } from 'lucide-react';

const formSchema = z.object({
  age: z.number().min(18).max(100).optional(),
  rmssd: z.number().min(5).max(200).optional(),
});

type FormValues = z.infer<typeof formSchema>;

type ResultPayload = {
  status: string;
  interpretation: string;
  recommendations: string[];
  warningSigns: string[];
  plan: { week: number; focus: string }[];
  hrvScore: number;
  rmssd: number;
  category: string;
};

const plan = (): { week: number; focus: string }[] => [
  { week: 1, focus: 'Establish baseline HRV by measuring RMSSD consistently (same time, same conditions)' },
  { week: 2, focus: 'Prioritize 7–9 hours of quality sleep per night to support autonomic recovery' },
  { week: 3, focus: 'Add stress management: 10–15 minutes daily meditation or breathing exercises' },
  { week: 4, focus: 'Maintain consistent sleep schedule and reduce evening screen time' },
  { week: 5, focus: 'Include regular aerobic exercise (3–4 sessions/week) to improve HRV' },
  { week: 6, focus: 'Limit alcohol and caffeine, especially in the evening' },
  { week: 7, focus: 'Reassess HRV score and compare to baseline' },
  { week: 8, focus: 'Continue healthy habits and track HRV trends over time' },
];

const faqs: [string, string][] = [
  ['What is Heart Rate Variability (HRV)?', 'HRV measures the variation in time between heartbeats. Higher HRV generally indicates better autonomic nervous system balance, recovery, and stress resilience.'],
  ['What is RMSSD?', 'RMSSD (Root Mean Square of Successive Differences) is a time-domain HRV metric that reflects parasympathetic (rest-and-digest) nervous system activity.'],
  ['How is HRV score calculated?', 'The score compares your RMSSD to age-expected values. Higher RMSSD relative to age expectations results in a higher HRV score (0–100 scale).'],
  ['What is a good HRV score?', 'Scores above 50 are generally good, above 80 excellent. However, track your own trends over time rather than comparing to others, as individual baselines vary.'],
  ['How do I measure HRV?', 'Use a chest strap heart rate monitor or smartwatch with HRV capability. Measure consistently at the same time (e.g., upon waking) under similar conditions.'],
  ['Why does HRV vary day to day?', 'HRV fluctuates based on stress, sleep, exercise, recovery, illness, and lifestyle factors. Track trends over weeks rather than focusing on single readings.'],
  ['Can I improve my HRV?', 'Yes, through quality sleep (7–9 hours), stress management (meditation, breathing), regular exercise, limiting alcohol/caffeine, and maintaining consistent routines.'],
  ['Does age affect HRV?', 'Yes, HRV typically decreases with age. The calculator adjusts for age to provide meaningful comparisons across different age groups.'],
  ['When should I measure HRV?', 'Measure at consistent times, ideally upon waking or during rest periods. Avoid measuring immediately after exercise or during high stress.'],
  ['Is low HRV dangerous?', 'Low HRV may indicate poor recovery or high stress, but it\'s not inherently dangerous. Focus on improving lifestyle factors and consult healthcare providers if concerned.'],
];

const understandingInputs = [
  { label: 'Age (years)', description: 'Your age in years (18–100). HRV typically decreases with age, so age adjustment is important for accurate scoring.' },
  { label: 'RMSSD (ms)', description: 'Root Mean Square of Successive Differences, a time-domain HRV metric measured in milliseconds. Typically ranges from 10–100+ ms.' },
];

const interpret = (score: number) => {
  if (score >= 80) return 'Excellent HRV—well recovered and strong autonomic balance. Maintain current healthy habits.';
  if (score >= 50) return 'Good HRV—solid recovery status. Continue stress management and recovery practices.';
  if (score >= 30) return 'Fair HRV—monitor stress and recovery. Focus on sleep, stress management, and adequate rest.';
  return 'Poor HRV—prioritize recovery. Focus on sleep, stress reduction, and reducing training load if applicable.';
};

const recommendations = (score: number) => [
  'Prioritize 7–9 hours of quality sleep per night with consistent sleep schedule',
  score < 50 ? 'Increase stress management: daily meditation (10–20 min), breathing exercises, or relaxation techniques' : 'Maintain current stress management practices',
  'Engage in regular aerobic exercise (3–4 sessions/week) but allow adequate recovery between intense sessions',
  'Limit alcohol and caffeine, especially in the evening, as they can negatively impact HRV',
];

const warningSigns = () => [
  'HRV is an indicator, not a diagnosis. Consult healthcare providers if you have cardiovascular concerns or symptoms.',
  'Persistent low HRV despite lifestyle improvements may warrant medical evaluation.',
  'Avoid overtraining—excessive exercise without recovery can lower HRV.',
];

export default function HeartRateVariabilityHrvScoreCalculator() {
  const [result, setResult] = useState<ResultPayload | null>(null);
  const form = useForm<FormValues>({
    resolver: zodResolver(formSchema),
    defaultValues: {
      age: undefined,
      rmssd: undefined,
    },
  });

  const onSubmit = (values: FormValues) => {
    const { age, rmssd } = values;
    if (age == null || rmssd == null) {
      setResult(null);
      return;
    }

    // Age-adjusted HRV score
    const expectedRmssd = 50 - (age * 0.5);
    const hrvScore = Math.max(0, Math.min(100, (rmssd / expectedRmssd) * 50));

    let category = 'Good';
    if (hrvScore < 30) category = 'Poor';
    else if (hrvScore < 50) category = 'Fair';
    else if (hrvScore >= 80) category = 'Excellent';

    setResult({
      status: 'Calculated',
      interpretation: interpret(hrvScore),
      recommendations: recommendations(hrvScore),
      warningSigns: warningSigns(),
      plan: plan(),
      hrvScore: Math.round(hrvScore),
      rmssd: Math.round(rmssd * 10) / 10,
      category,
    });
  };

  return (
    <div className="space-y-8">
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2"><HeartPulse className="h-5 w-5" /> Heart Rate Variability (HRV) Score</CardTitle>
          <CardDescription>Calculate your HRV score from RMSSD and age to assess recovery and autonomic balance.</CardDescription>
        </CardHeader>
        <CardContent>
          <Form {...form}>
            <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-6">
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <FormField control={form.control} name="age" render={({ field }) => (
                  <FormItem>
                    <FormLabel className="flex items-center gap-2"><Calendar className="h-4 w-4" /> Age (years)</FormLabel>
                    <FormControl>
                      <Input type="number" step="1" placeholder="e.g., 30" value={field.value ?? ''} onChange={(e)=>field.onChange(e.target.value===''?undefined:Number(e.target.value))} />
                    </FormControl>
                    <FormMessage />
                  </FormItem>
                )} />
                <FormField control={form.control} name="rmssd" render={({ field }) => (
                  <FormItem>
                    <FormLabel className="flex items-center gap-2"><Timer className="h-4 w-4" /> RMSSD (ms)</FormLabel>
                    <FormControl>
                      <Input type="number" step="0.1" placeholder="e.g., 35.2" value={field.value ?? ''} onChange={(e)=>field.onChange(e.target.value===''?undefined:Number(e.target.value))} />
                    </FormControl>
                    <FormMessage />
                  </FormItem>
                )} />
              </div>
              <Button type="submit" className="w-full md:w-auto">Calculate HRV Score</Button>
            </form>
          </Form>
        </CardContent>
      </Card>

      {result && (
        <div className="space-y-6">
          <Card>
            <CardHeader>
              <div className="flex items-center gap-4"><Zap className="h-8 w-8 text-primary" /><CardTitle>HRV Score Summary</CardTitle></div>
              <CardDescription>Recovery and autonomic nervous system balance assessment</CardDescription>
            </CardHeader>
            <CardContent className="space-y-4">
              <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                <div className="p-4 border rounded"><h4 className="text-sm font-semibold text-muted-foreground">HRV Score</h4><p className="text-2xl font-bold text-primary">{result.hrvScore}/100</p></div>
                <div className="p-4 border rounded"><h4 className="text-sm font-semibold text-muted-foreground">RMSSD</h4><p className="text-2xl font-bold text-primary">{result.rmssd} ms</p></div>
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
            <CardHeader><CardTitle className="flex items-center gap-2"><Calendar className="h-5 w-5" /> 8‑Week HRV Improvement Plan</CardTitle></CardHeader>
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
          <CardDescription>Measure consistently for reliable HRV tracking</CardDescription>
        </CardHeader>
        <CardContent>
          <ul className="space-y-2">{understandingInputs.map((it,i)=>(<li key={i}><span className="font-semibold text-foreground">{it.label}:</span><span className="text-sm text-muted-foreground"> {it.description}</span></li>))}</ul>
        </CardContent>
      </Card>

      <Card>
        <CardHeader>
          <CardTitle>Related Calculators</CardTitle>
          <CardDescription>Complementary tools for recovery and stress management</CardDescription>
        </CardHeader>
        <CardContent>
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div className="p-4 border rounded"><h4 className="font-semibold mb-1"><Link href="/category/health-fitness/recovery-heart-rate-calculator" className="text-primary hover:underline">Recovery Heart Rate</Link></h4><p className="text-sm text-muted-foreground">Assess cardiovascular recovery after exercise.</p></div>
            <div className="p-4 border rounded"><h4 className="font-semibold mb-1"><Link href="/category/health-fitness/stress-level-self-assessment-calculator" className="text-primary hover:underline">Stress Level Assessment</Link></h4><p className="text-sm text-muted-foreground">Evaluate stress levels and coping strategies.</p></div>
            <div className="p-4 border rounded"><h4 className="font-semibold mb-1"><Link href="/category/health-fitness/meditation-breathing-rate-calculator" className="text-primary hover:underline">Meditation Breathing Rate</Link></h4><p className="text-sm text-muted-foreground">Practice breathing techniques to improve HRV.</p></div>
            <div className="p-4 border rounded"><h4 className="font-semibold mb-1"><Link href="/category/health-fitness/cortisol-stress-response-estimator" className="text-primary hover:underline">Cortisol Stress Response</Link></h4><p className="text-sm text-muted-foreground">Understand stress hormone response patterns.</p></div>
          </div>
        </CardContent>
      </Card>

      <Card>
        <CardHeader><CardTitle>Complete Guide: Understanding HRV</CardTitle></CardHeader>
        <CardContent className="prose prose-sm dark:prose-invert max-w-none">
          <p>HRV measures variation in time between heartbeats, reflecting autonomic nervous system balance. Higher HRV indicates better recovery, stress resilience, and overall health. Improve HRV through quality sleep, stress management, regular exercise, and healthy lifestyle habits. Track trends over weeks rather than focusing on daily fluctuations.</p>
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

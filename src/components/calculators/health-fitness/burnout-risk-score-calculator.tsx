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
import { Zap, AlertTriangle, Clock, Moon, Users, Calendar, TrendingDown } from 'lucide-react';

const formSchema = z.object({
  weeklyWorkHours: z.number().min(0).max(168).optional(),
  stressLevel: z.number().min(1).max(10).optional(),
  sleepHoursPerNight: z.number().min(0).max(24).optional(),
  supportNetworkScore: z.number().min(1).max(10).optional(),
  workLifeBalanceScore: z.number().min(1).max(10).optional(),
});

type FormValues = z.infer<typeof formSchema>;

type ResultPayload = {
  status: string;
  interpretation: string;
  recommendations: string[];
  warningSigns: string[];
  plan: { week: number; focus: string }[];
  burnoutRiskScore: number;
  riskLevel: string;
};

const plan = (): { week: number; focus: string }[] => [
  { week: 1, focus: 'Assess current workload and identify non-essential tasks to reduce' },
  { week: 2, focus: 'Establish boundaries: set work hours, limit after-hours communication' },
  { week: 3, focus: 'Prioritize sleep: aim for 7–9 hours with consistent bedtime routine' },
  { week: 4, focus: 'Build support network: schedule regular check-ins with friends/family' },
  { week: 5, focus: 'Introduce stress management: 10–15 minutes daily meditation or breathing' },
  { week: 6, focus: 'Take regular breaks: 5–10 minutes every 90 minutes during work' },
  { week: 7, focus: 'Reassess workload and delegate where possible' },
  { week: 8, focus: 'Maintain new routines and continue monitoring stress levels' },
];

const faqs: [string, string][] = [
  ['What is burnout?', 'Burnout is a state of emotional, physical, and mental exhaustion caused by prolonged stress. It often results from chronic workplace stress and can impact performance and well-being.'],
  ['How is the burnout risk score calculated?', 'The score considers work hours, stress levels, sleep quality, social support, and work-life balance. Higher scores indicate greater risk.'],
  ['What is a high risk score?', 'Scores above 70 indicate high risk, 50–70 moderate risk, and below 50 lower risk. Context matters—individual resilience varies.'],
  ['Can I prevent burnout?', 'Yes. Setting boundaries, prioritizing sleep, maintaining social connections, and managing workload can help prevent burnout.'],
  ['How often should I reassess?', 'Reassess monthly or when work demands change significantly. Regular monitoring helps catch early warning signs.'],
  ['Does exercise help with burnout?', 'Yes, regular physical activity can reduce stress, improve sleep, and boost mood. Start with manageable intensity.'],
  ['What if my score is very high?', 'Consider professional support (therapist, counselor) and discuss workload with supervisors. Prioritize self-care immediately.'],
  ['Is burnout the same as depression?', 'No, but they can overlap. Burnout is typically work-related; depression is a medical condition requiring professional diagnosis.'],
  ['Can work-life balance improve my score?', 'Yes, improving work-life balance directly reduces burnout risk by creating separation between work and personal time.'],
  ['Should I tell my employer about burnout?', 'Consider discussing workload and boundaries with HR or management. Many employers have resources to support employee well-being.'],
];

const understandingInputs = [
  { label: 'Weekly Work Hours', description: 'Total hours worked per week, including overtime and work taken home.' },
  { label: 'Stress Level (1–10)', description: 'Self-reported stress level where 1 is minimal and 10 is extreme.' },
  { label: 'Sleep Hours Per Night', description: 'Average hours of sleep per night over the past week.' },
  { label: 'Support Network Score (1–10)', description: 'Quality of social support where 10 is excellent support and 1 is minimal.' },
  { label: 'Work-Life Balance Score (1–10)', description: 'How well work and personal life are balanced, where 10 is excellent balance.' },
];

const interpret = (score: number): { level: string; message: string } => {
  if (score >= 70) {
    return {
      level: 'Heavier strain pattern',
      message:
        'Your answers suggest your current routines may feel quite demanding right now. It could be a good time to explore gentler boundaries, more rest, and extra support where possible.',
    };
  }
  if (score >= 50) {
    return {
      level: 'Moderate strain pattern',
      message:
        'There are meaningful pressures in your week, and some simple tweaks to work, rest, and support may help things feel more sustainable.',
    };
  }
  return {
    level: 'Lighter strain pattern',
    message:
      'Your current pattern may feel more manageable, though it can still be helpful to keep checking in with your stress and energy over time.',
  };
};

const recommendations = (score: number) => {
  const base = [
    'Notice one or two times during the week when you can step away briefly to reset—such as a short walk or quiet break.',
    'Gently protect a basic sleep window that feels realistic most nights, even if it is not perfect.',
    'Stay connected with at least one person you feel comfortable sharing your experience with.',
  ];
  if (score >= 70) {
    return [
      ...base,
      'If it feels accessible, consider talking with a trusted professional or support person about how your days have been feeling.',
      'Look for small ways to soften your workload or say “not now” to lower‑priority tasks when possible.',
      'Experiment with short, regular pauses during work to breathe, stretch, or simply look away from screens.',
    ];
  }
  if (score >= 50) {
    return [
      ...base,
      'Try adding a few minutes of winding‑down time at the end of your workday before switching to personal time.',
      'Schedule one or two low‑pressure activities that feel nourishing (hobbies, time outdoors, or creative play).',
    ];
  }
  return [
    ...base,
    'Keep an eye on how your stress and energy change when your workload shifts, and adjust when you can.',
  ];
};

const warningSigns = () => [
  'If you feel persistently exhausted or overwhelmed, it can be a signal to pause and gently reassess your routines.',
  'Notice if work thoughts are crowding out most of your downtime or if you frequently feel detached from things you usually enjoy.',
  'If you experience ongoing changes in mood, sleep, or focus that worry you, consider talking with a qualified health professional.',
];

export default function BurnoutRiskScoreCalculator() {
  const [result, setResult] = useState<ResultPayload | null>(null);
  const form = useForm<FormValues>({
    resolver: zodResolver(formSchema),
    defaultValues: {
      weeklyWorkHours: undefined,
      stressLevel: undefined,
      sleepHoursPerNight: undefined,
      supportNetworkScore: undefined,
      workLifeBalanceScore: undefined,
    },
  });

  const onSubmit = (v: FormValues) => {
    const { weeklyWorkHours, stressLevel, sleepHoursPerNight, supportNetworkScore, workLifeBalanceScore } = v;
    if (
      weeklyWorkHours == null ||
      stressLevel == null ||
      sleepHoursPerNight == null ||
      supportNetworkScore == null ||
      workLifeBalanceScore == null
    ) {
      setResult(null);
      return;
    }

    // Calculate risk score (0-100 scale)
    // Higher work hours, stress, and lower sleep/support/balance = higher risk
    const workHoursScore = Math.min((weeklyWorkHours / 60) * 30, 30); // Max 30 points for >60 hours
    const stressScore = (stressLevel / 10) * 25; // Max 25 points
    const sleepScore = sleepHoursPerNight < 7 ? (7 - sleepHoursPerNight) * 5 : 0; // Max 15 points for <4 hours
    const supportScore = ((11 - supportNetworkScore) / 10) * 15; // Reverse: lower support = higher risk
    const balanceScore = ((11 - workLifeBalanceScore) / 10) * 15; // Reverse: lower balance = higher risk

    const totalScore = Math.min(workHoursScore + stressScore + sleepScore + supportScore + balanceScore, 100);
    const { level, message } = interpret(totalScore);

    setResult({
      status: 'Calculated',
      interpretation: message,
      recommendations: recommendations(totalScore),
      warningSigns: warningSigns(),
      plan: plan(),
      burnoutRiskScore: Math.round(totalScore),
      riskLevel: level,
    });
  };

  return (
    <div className="space-y-8">
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <AlertTriangle className="h-5 w-5" /> Burnout Tendency & Strain Check‑In
          </CardTitle>
          <CardDescription>
            Reflect on how your work, rest, and support patterns feel right now. This is a general wellness insight, not a
            diagnosis or clinical risk score.
          </CardDescription>
        </CardHeader>
        <CardContent>
          <Form {...form}>
            <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-6">
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <FormField control={form.control} name="weeklyWorkHours" render={({ field }) => (
                  <FormItem>
                    <FormLabel className="flex items-center gap-2"><Clock className="h-4 w-4" /> Weekly Work Hours</FormLabel>
                    <FormControl>
                      <Input type="number" step="1" placeholder="e.g., 50" value={field.value ?? ''} onChange={(e)=>field.onChange(e.target.value===''?undefined:Number(e.target.value))} />
                    </FormControl>
                    <FormMessage />
                  </FormItem>
                )} />
                <FormField control={form.control} name="stressLevel" render={({ field }) => (
                  <FormItem>
                    <FormLabel className="flex items-center gap-2"><TrendingDown className="h-4 w-4" /> Stress Level (1–10)</FormLabel>
                    <FormControl>
                      <Input type="number" step="1" min="1" max="10" placeholder="e.g., 7" value={field.value ?? ''} onChange={(e)=>field.onChange(e.target.value===''?undefined:Number(e.target.value))} />
                    </FormControl>
                    <FormMessage />
                  </FormItem>
                )} />
                <FormField control={form.control} name="sleepHoursPerNight" render={({ field }) => (
                  <FormItem>
                    <FormLabel className="flex items-center gap-2"><Moon className="h-4 w-4" /> Sleep Hours Per Night</FormLabel>
                    <FormControl>
                      <Input type="number" step="0.5" placeholder="e.g., 7" value={field.value ?? ''} onChange={(e)=>field.onChange(e.target.value===''?undefined:Number(e.target.value))} />
                    </FormControl>
                    <FormMessage />
                  </FormItem>
                )} />
                <FormField control={form.control} name="supportNetworkScore" render={({ field }) => (
                  <FormItem>
                    <FormLabel className="flex items-center gap-2"><Users className="h-4 w-4" /> Support Network Score (1–10)</FormLabel>
                    <FormControl>
                      <Input type="number" step="1" min="1" max="10" placeholder="e.g., 6" value={field.value ?? ''} onChange={(e)=>field.onChange(e.target.value===''?undefined:Number(e.target.value))} />
                    </FormControl>
                    <FormMessage />
                  </FormItem>
                )} />
                <FormField control={form.control} name="workLifeBalanceScore" render={({ field }) => (
                  <FormItem>
                    <FormLabel className="flex items-center gap-2"><Clock className="h-4 w-4" /> Work-Life Balance Score (1–10)</FormLabel>
                    <FormControl>
                      <Input type="number" step="1" min="1" max="10" placeholder="e.g., 5" value={field.value ?? ''} onChange={(e)=>field.onChange(e.target.value===''?undefined:Number(e.target.value))} />
                    </FormControl>
                    <FormMessage />
                  </FormItem>
                )} />
              </div>
              <Button type="submit" className="w-full md:w-auto">Calculate Burnout Risk</Button>
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
                <CardTitle>Burnout Strain Pattern Insight</CardTitle>
              </div>
              <CardDescription>A wellness‑focused look at how demanding your current week feels.</CardDescription>
            </CardHeader>
            <CardContent className="space-y-4">
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div className="p-4 border rounded">
                  <h4 className="text-sm font-semibold text-muted-foreground">Strain score</h4>
                  <p className="text-2xl font-bold text-primary">{result.burnoutRiskScore}/100</p>
                </div>
                <div className="p-4 border rounded">
                  <h4 className="text-sm font-semibold text-muted-foreground">Pattern label</h4>
                  <p className="text-2xl font-bold text-primary">{result.riskLevel}</p>
                </div>
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
            <CardHeader><CardTitle className="flex items-center gap-2"><Calendar className="h-5 w-5" /> 8‑Week Burnout Prevention Plan</CardTitle></CardHeader>
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
          <CardDescription>Use these questions as a self‑check, not as a formal assessment.</CardDescription>
        </CardHeader>
        <CardContent>
          <ul className="space-y-2">{understandingInputs.map((it)=>(<li key={it.label}><span className="font-semibold text-foreground">{it.label}:</span><span className="text-sm text-muted-foreground"> {it.description}</span></li>))}</ul>
        </CardContent>
      </Card>

      <Card>
        <CardHeader>
          <CardTitle>Related Calculators</CardTitle>
          <CardDescription>Complementary tools for well-being and stress management</CardDescription>
        </CardHeader>
        <CardContent>
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div className="p-4 border rounded"><h4 className="font-semibold mb-1"><Link href="/category/health-fitness/stress-level-self-assessment-calculator" className="text-primary hover:underline">Stress Level Assessment</Link></h4><p className="text-sm text-muted-foreground">Evaluate stress levels and coping strategies.</p></div>
            <div className="p-4 border rounded"><h4 className="font-semibold mb-1"><Link href="/category/health-fitness/sleep-quality-score-calculator" className="text-primary hover:underline">Sleep Quality Score</Link></h4><p className="text-sm text-muted-foreground">Assess sleep patterns and quality.</p></div>
            <div className="p-4 border rounded"><h4 className="font-semibold mb-1"><Link href="/category/health-fitness/recovery-readiness-score-calculator" className="text-primary hover:underline">Recovery Readiness</Link></h4><p className="text-sm text-muted-foreground">Monitor recovery and readiness for training.</p></div>
            <div className="p-4 border rounded"><h4 className="font-semibold mb-1"><Link href="/category/health-fitness/meditation-breathing-rate-calculator" className="text-primary hover:underline">Meditation Breathing</Link></h4><p className="text-sm text-muted-foreground">Practice stress reduction techniques.</p></div>
          </div>
        </CardContent>
      </Card>

      <Card>
        <CardHeader><CardTitle>Complete Guide: Preventing Burnout</CardTitle></CardHeader>
        <CardContent className="prose prose-sm dark:prose-invert max-w-none">
          <p>
            Caring for your energy over the long term often involves a mix of boundaries, rest, meaningful connection, and small
            recovery rituals. This tool can highlight patterns, but only you—and, if you wish, a trusted professional—can fully
            understand your situation.
          </p>
          <p>
            You might start with small, realistic shifts such as pausing between tasks, setting a simple “end of work” ritual, or
            scheduling time for things that feel restorative. Over time, these gentle adjustments can help your days feel more
            sustainable.
          </p>
          <p>
            If you ever feel that work strain is seriously affecting your health, mood, or safety, consider speaking with a
            qualified health or mental‑health professional as soon as you can. This tool is only for wellness reflection.
          </p>
        </CardContent>
      </Card>

      <Card>
        <CardHeader>
          <CardTitle>Frequently Asked Questions</CardTitle>
          <CardDescription>Putting this burnout tendency snapshot in perspective</CardDescription>
        </CardHeader>
        <CardContent className="space-y-4">{faqs.map(([q,a],i)=>(<div key={i}><h4 className="font-semibold mb-1">{q}</h4><p className="text-sm text-muted-foreground">{a}</p></div>))}</CardContent>
      </Card>

      <p className="mt-6 text-xs text-muted-foreground text-center">
        Disclaimer: This tool provides general wellness and lifestyle insights for educational purposes only. It is not a
        medical or psychological diagnosis. For any health concerns, please consult a qualified professional.
      </p>
    </div>
  );
}

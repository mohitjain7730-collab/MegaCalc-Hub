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
import { Zap, AlertTriangle, Moon, Activity, Wind, Calendar } from 'lucide-react';

const formSchema = z.object({
  sleepHours: z.number().min(4).max(12).optional(),
  stressLevel: z.number().min(1).max(10).optional(),
  exerciseDays: z.number().min(0).max(7).optional(),
  meditationMinutes: z.number().min(0).max(120).optional(),
});

type FormValues = z.infer<typeof formSchema>;

type ResultPayload = {
  status: string;
  interpretation: string;
  recommendations: string[];
  warningSigns: string[];
  plan: { week: number; focus: string }[];
  stressScore: number;
  category: string;
};

const plan = (): { week: number; focus: string }[] => [
  { week: 1, focus: 'Gently notice your current sleep, stress, movement, and unwind habits without judging them.' },
  { week: 2, focus: 'Protect a more consistent sleep window and add one small wind‑down cue before bed.' },
  { week: 3, focus: 'Try a brief daily reset (5–15 minutes) such as breathing, stretching, or a quiet walk.' },
  { week: 4, focus: 'Include light to moderate movement on most days while still leaving space for rest.' },
  { week: 5, focus: 'Experiment with earlier caffeine and lighter evening screens to see how you feel.' },
  { week: 6, focus: 'Keep one simple “pause ritual” for busy days (for example three slow breaths before big tasks).' },
  { week: 7, focus: 'Check in with this score again and reflect on any changes in how your days feel overall.' },
  { week: 8, focus: 'Keep the habits that feel sustainable and adjust anything that feels rigid or stressful.' },
];

const faqs: [string, string][] = [
  ['What does this Daily Stress & Recovery Balance tool show?', 'It offers a simple score that reflects how your recent sleep, stress, movement, and unwind time might be working together on a typical day.'],
  ['Why does it only use lifestyle inputs?', 'This tool is intentionally non‑clinical. It focuses on everyday habits you can observe and adjust yourself rather than medical tests or diagnoses.'],
  ['Can this score tell me if something is wrong with my health?', 'No. It is not a medical test and cannot detect illnesses. It is only a gentle reflection of self‑reported routines and how restoring they may feel.'],
  ['How often should I use this?', 'Many people like to check once every week or two, especially when they are changing their schedule, workload, or bedtime routine.'],
  ['What if my score feels low even when I am trying?', 'That can simply mean your current season is demanding. You might experiment with one small change at a time—such as slightly more sleep or one extra unwind pause—and see how you feel over a few days.'],
  ['Is this tool a substitute for talking to a professional?', 'No. It is only an educational wellness helper. If you are worried about your physical or emotional health, a qualified professional is the best person to guide you.'],
];

const understandingInputs = [
  { label: 'Sleep Hours (per night)', description: 'Your average nightly sleep over the last week. Many adults feel best around 7–9 hours, but needs are individual.' },
  { label: 'Stress Level (1–10)', description: 'How intense your days have felt recently, on a simple 1–10 self‑rating from very light to very heavy.' },
  { label: 'Exercise Days (per week)', description: 'Roughly how many days you move your body in a way that feels at least a little active (walking, stretching, workouts, etc.).' },
  { label: 'Meditation / unwind minutes (per day)', description: 'Minutes you usually spend in calming activities like breathing, reading, gentle stretching, or quiet hobbies.' },
];

const interpret = (score: number) => {
  if (score >= 80) return 'Your daily habits currently look very supportive of unwinding and recharging after stress.';
  if (score >= 50) return 'Your balance between demands and recovery looks mixed, with room for gentle upgrades to sleep and reset time.';
  if (score >= 30) return 'Your day‑to‑day pattern may feel a bit heavy right now. This can be a good moment to add small pockets of rest and movement.';
  return 'Your current pattern may feel especially draining. Treat this as a kind reminder to go slower where you can and to stack in extra care where life allows.';
};

const recommendations = (score: number) => [
  'Give yourself permission to wind down before bed with a simple routine (dim lights, slower breathing, less scrolling).',
  score < 50
    ? 'Experiment with one extra calming pause in your day—such as a short outside walk, quiet tea break, or brief guided relaxation.'
    : 'Keep up the calming habits that already help you feel more steady, and revisit them during busier weeks.',
  'Add gentle movement on most days, even if it is just a few minutes of stretching or walking between tasks.',
  'Notice which habits (late caffeine, back‑to‑back meetings, constant notifications) make you feel more wired and see where tiny adjustments feel realistic.',
];

const warningSigns = () => [
  'This tool is a general wellness reflection only and does not measure hormones or diagnose any condition.',
  'If you notice ongoing exhaustion, sleep problems, or mood changes that worry you, it is important to talk with a qualified professional.',
  'Always treat this score as a gentle check‑in rather than a verdict—your own experience of your days matters most.',
];

export default function CortisolStressResponseEstimator() {
  const [result, setResult] = useState<ResultPayload | null>(null);
  const form = useForm<FormValues>({
    resolver: zodResolver(formSchema),
    defaultValues: {
      sleepHours: undefined,
      stressLevel: undefined,
      exerciseDays: undefined,
      meditationMinutes: undefined,
    },
  });

  const onSubmit = (values: FormValues) => {
    const { sleepHours, stressLevel, exerciseDays, meditationMinutes } = values;
    if (sleepHours == null || stressLevel == null || exerciseDays == null || meditationMinutes == null) {
      setResult(null);
      return;
    }

    let score = 50; // baseline
    
    // Sleep impact
    if (sleepHours >= 8) score += 15;
    else if (sleepHours >= 7) score += 10;
    else if (sleepHours >= 6) score += 5;
    else score -= 10;
    
    // Stress level impact
    score -= (stressLevel - 5) * 8;
    
    // Exercise impact
    if (exerciseDays >= 5) score += 10;
    else if (exerciseDays >= 3) score += 5;
    else if (exerciseDays === 0) score -= 5;
    
    // Meditation impact
    if (meditationMinutes >= 20) score += 10;
    else if (meditationMinutes >= 10) score += 5;
    else if (meditationMinutes === 0) score -= 5;
    
    score = Math.max(0, Math.min(100, score));

    let category = 'Moderate';
    if (score < 30) category = 'High';
    else if (score < 50) category = 'Elevated';
    else if (score >= 80) category = 'Low';

    setResult({
      status: 'Calculated',
      interpretation: interpret(score),
      recommendations: recommendations(score),
      warningSigns: warningSigns(),
      plan: plan(),
      stressScore: Math.round(score),
      category,
    });
  };

  return (
    <div className="space-y-8">
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2"><AlertTriangle className="h-5 w-5" /> Cortisol Stress Response Estimator</CardTitle>
          <CardDescription>Estimate your stress hormone response based on lifestyle factors.</CardDescription>
        </CardHeader>
        <CardContent>
          <Form {...form}>
            <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-6">
              <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
                <FormField control={form.control} name="sleepHours" render={({ field }) => (
                  <FormItem>
                    <FormLabel className="flex items-center gap-2"><Moon className="h-4 w-4" /> Sleep Hours (per night)</FormLabel>
                    <FormControl>
                      <Input type="number" step="0.5" placeholder="e.g., 7.5" value={field.value ?? ''} onChange={(e)=>field.onChange(e.target.value===''?undefined:Number(e.target.value))} />
                    </FormControl>
                    <FormMessage />
                  </FormItem>
                )} />
                <FormField control={form.control} name="stressLevel" render={({ field }) => (
                  <FormItem>
                    <FormLabel className="flex items-center gap-2"><AlertTriangle className="h-4 w-4" /> Stress Level (1–10)</FormLabel>
                    <FormControl>
                      <Input type="number" step="1" min="1" max="10" placeholder="e.g., 6" value={field.value ?? ''} onChange={(e)=>field.onChange(e.target.value===''?undefined:Number(e.target.value))} />
                    </FormControl>
                    <FormMessage />
                  </FormItem>
                )} />
                <FormField control={form.control} name="exerciseDays" render={({ field }) => (
                  <FormItem>
                    <FormLabel className="flex items-center gap-2"><Activity className="h-4 w-4" /> Exercise Days/week</FormLabel>
                    <FormControl>
                      <Input type="number" step="1" min="0" max="7" placeholder="e.g., 4" value={field.value ?? ''} onChange={(e)=>field.onChange(e.target.value===''?undefined:Number(e.target.value))} />
                    </FormControl>
                    <FormMessage />
                  </FormItem>
                )} />
                <FormField control={form.control} name="meditationMinutes" render={({ field }) => (
                  <FormItem>
                    <FormLabel className="flex items-center gap-2"><Wind className="h-4 w-4" /> Meditation (min/day)</FormLabel>
                    <FormControl>
                      <Input type="number" step="1" min="0" placeholder="e.g., 15" value={field.value ?? ''} onChange={(e)=>field.onChange(e.target.value===''?undefined:Number(e.target.value))} />
                    </FormControl>
                    <FormMessage />
                  </FormItem>
                )} />
              </div>
              <Button type="submit" className="w-full md:w-auto">Estimate Stress Response</Button>
            </form>
          </Form>
        </CardContent>
      </Card>

      {result && (
        <div className="space-y-6">
          <Card>
            <CardHeader>
              <div className="flex items-center gap-4"><Zap className="h-8 w-8 text-primary" /><CardTitle>Stress Response Summary</CardTitle></div>
              <CardDescription>Estimated cortisol stress response based on lifestyle factors</CardDescription>
            </CardHeader>
            <CardContent className="space-y-4">
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div className="p-4 border rounded"><h4 className="text-sm font-semibold text-muted-foreground">Stress Score</h4><p className="text-2xl font-bold text-primary">{result.stressScore}/100</p></div>
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
            <CardHeader><CardTitle className="flex items-center gap-2"><Calendar className="h-5 w-5" /> 8‑Week Stress Management Plan</CardTitle></CardHeader>
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
          <CardDescription>Simple self‑check questions about how your days feel</CardDescription>
        </CardHeader>
        <CardContent>
          <ul className="space-y-2">{understandingInputs.map((it,i)=>(<li key={i}><span className="font-semibold text-foreground">{it.label}:</span><span className="text-sm text-muted-foreground"> {it.description}</span></li>))}</ul>
        </CardContent>
      </Card>

      <Card>
        <CardHeader>
          <CardTitle>Related Calculators</CardTitle>
          <CardDescription>Companion tools for everyday balance and rest</CardDescription>
        </CardHeader>
        <CardContent>
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div className="p-4 border rounded"><h4 className="font-semibold mb-1"><Link href="/category/health-fitness/heart-rate-variability-hrv-score-calculator" className="text-primary hover:underline">Heart Rhythm Wellness Score</Link></h4><p className="text-sm text-muted-foreground">See how your heartbeat variation trends alongside your routines.</p></div>
            <div className="p-4 border rounded"><h4 className="font-semibold mb-1"><Link href="/category/health-fitness/sleep-debt-calculator-hf" className="text-primary hover:underline">Sleep Balance Check-In</Link></h4><p className="text-sm text-muted-foreground">Compare recent sleep time to your chosen target.</p></div>
            <div className="p-4 border rounded"><h4 className="font-semibold mb-1"><Link href="/category/health-fitness/meditation-breathing-rate-calculator" className="text-primary hover:underline">Meditation Breathing Rhythm Helper</Link></h4><p className="text-sm text-muted-foreground">Try a breathing pace that feels comfortable and calming.</p></div>
            <div className="p-4 border rounded"><h4 className="font-semibold mb-1"><Link href="/category/health-fitness/stress-level-self-assessment-calculator" className="text-primary hover:underline">Daily Stress Tendency Check-In</Link></h4><p className="text-sm text-muted-foreground">Gently rate how overloaded or steady recent days feel.</p></div>
          </div>
        </CardContent>
      </Card>

      <Card>
        <CardHeader><CardTitle>Complete Guide: Balancing Daily Demands and Recovery</CardTitle></CardHeader>
        <CardContent className="prose prose-sm dark:prose-invert max-w-none">
          <p>
            Many people find that how they sleep, move, pause, and connect during the day shapes how “wired” or “settled” they feel. Instead of trying to
            remove all stress, it can be more helpful to build small, reliable pockets of recovery into your routine.
          </p>
          <p>
            This page is meant as a gentle companion as you experiment: going to bed a bit more consistently, sprinkling in short walks or stretches, taking
            fuller breaths before big tasks, and keeping some time each week that is just for you. Small, steady shifts often add up more than big overhauls.
          </p>
        </CardContent>
      </Card>

      <Card>
        <CardHeader>
          <CardTitle>Frequently Asked Questions</CardTitle>
          <CardDescription>Supportive answers about using this as a wellness tool</CardDescription>
        </CardHeader>
        <CardContent className="space-y-4">{faqs.map(([q,a],i)=>(<div key={i}><h4 className="font-semibold mb-1">{q}</h4><p className="text-sm text-muted-foreground">{a}</p></div>))}</CardContent>
      </Card>

      <p className="text-xs text-muted-foreground mt-6">
        Disclaimer: This tool provides general wellness and lifestyle insights for educational purposes only. It is not a medical or psychological
        diagnosis. For any health concerns, please consult a qualified professional.
      </p>
    </div>
  );
}

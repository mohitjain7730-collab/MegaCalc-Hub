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
      ['What is heart rhythm variability?', 'Heart rhythm variability simply describes how the time between beats naturally changes from moment to moment. Many people use it as a gentle wellness signal for how rested or stressed their body feels.'],
      ['What is RMSSD?', 'RMSSD (Root Mean Square of Successive Differences) is one way devices summarize heartbeat changes over time. You can think of it as a raw “variation” number your watch or strap can show you.'],
      ['How is this wellness score calculated?', 'The score compares your RMSSD to a simple age‑based reference and scales it to 0–100 so it is easier to read as a personal wellness index.'],
      ['Is there a “good” score?', 'Rather than chasing a perfect number, it’s more helpful to notice your own trends over time—what makes your score drift up or down when you change sleep, stress, or movement.'],
      ['How do I measure RMSSD?', 'Most people use a chest strap heart monitor, smartwatch, or wellness app. Try to measure in similar conditions (for example, seated and relaxed at roughly the same time of day).'],
      ['Why does the score vary day to day?', 'Changes in stress, sleep, movement, hydration, and even heavy meals can shift the score. Looking at weekly patterns is usually more helpful than focusing on a single day.'],
      ['Can lifestyle habits influence this score?', 'Many people see a more stable score when they sleep consistently, manage stress gently (breathing, walks, hobbies), move their body regularly, and limit very late caffeine or screen time.'],
      ['Does age matter here?', 'This tool lightly adjusts the score based on age so that it acts as a relative wellness guide rather than a performance test.'],
      ['When is a good time to check?', 'Checking in calm conditions—often in the morning or during a quiet break—helps you compare like with like over time.'],
      ['Is this a medical test?', 'No. It is a personal wellness insight based on heartbeat variation, not a medical test or diagnosis.'],
];

const understandingInputs = [
  { label: 'Age (years)', description: 'Your age in years (18–100). HRV typically decreases with age, so age adjustment is important for accurate scoring.' },
  { label: 'RMSSD (ms)', description: 'Root Mean Square of Successive Differences, a time-domain HRV metric measured in milliseconds. Typically ranges from 10–100+ ms.' },
];

const interpret = (score: number) => {
  if (score >= 80) return 'Your heart rhythm variability looks very strong for this snapshot. Keep leaning on the routines that help you feel rested and grounded.';
  if (score >= 50) return 'Your wellness score suggests a generally supportive balance between demand and recovery. Small tweaks to sleep and stress habits can still make it even smoother.';
  if (score >= 30) return 'Your wellness score is in a middle range. This can be a gentle nudge to protect sleep, add small movement breaks, and create simple wind‑down time.';
  return 'Your current wellness score is on the lower side for this moment. It may be a sign to ease up a little, protect rest, and add small calming habits into your day.';
};

const recommendations = (score: number) => [
  'Protect a fairly regular sleep window where you feel you can wind down, sleep, and wake at similar times most days.',
  score < 50
    ? 'Experiment with one simple relaxation habit most days (for example 5–10 minutes of calm breathing, a short walk, or quiet reading without screens).'
    : 'Keep the small relaxation habits that already seem to work for you and revisit them during busier weeks.',
  'Include light to moderate movement on most days—such as walking, stretching, or gentle exercise—paired with at least one easier day each week.',
  'Notice how late‑day caffeine, heavy meals, or intense screen time affect your wind‑down and adjust them if they seem to make rest harder.',
];

const warningSigns = () => [
  'This heart rhythm wellness score is a general lifestyle insight, not a diagnosis or medical evaluation.',
  'If you feel unwell, dizzy, short of breath, or notice unexpected changes in your health, it is important to talk with a qualified professional.',
  'Treat this tool as one reflection point among many—your own sense of energy, mood, and comfort matters most.',
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
          <CardDescription>Use the same conditions each time for a fair comparison</CardDescription>
        </CardHeader>
        <CardContent>
          <ul className="space-y-2">{understandingInputs.map((it,i)=>(<li key={i}><span className="font-semibold text-foreground">{it.label}:</span><span className="text-sm text-muted-foreground"> {it.description}</span></li>))}</ul>
        </CardContent>
      </Card>

      <Card>
        <CardHeader>
          <CardTitle>Related Calculators</CardTitle>
          <CardDescription>Optional tools that look at nearby lifestyle patterns</CardDescription>
        </CardHeader>
        <CardContent>
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div className="p-4 border rounded"><h4 className="font-semibold mb-1"><Link href="/category/health-fitness/recovery-heart-rate-calculator" className="text-primary hover:underline">Recovery Heart Rhythm Check-In</Link></h4><p className="text-sm text-muted-foreground">Reflect on how quickly your pulse settles after effort.</p></div>
            <div className="p-4 border rounded"><h4 className="font-semibold mb-1"><Link href="/category/health-fitness/stress-level-self-assessment-calculator" className="text-primary hover:underline">Daily Stress Tendency Check-In</Link></h4><p className="text-sm text-muted-foreground">Gently score how overloaded or steady your day feels.</p></div>
            <div className="p-4 border rounded"><h4 className="font-semibold mb-1"><Link href="/category/health-fitness/meditation-breathing-rate-calculator" className="text-primary hover:underline">Meditation Breathing Rhythm Helper</Link></h4><p className="text-sm text-muted-foreground">Explore a comfortable breathing pace for calmer sessions.</p></div>
            <div className="p-4 border rounded"><h4 className="font-semibold mb-1"><Link href="/category/health-fitness/cortisol-stress-response-estimator" className="text-primary hover:underline">Daily Stress & Recovery Balance Score</Link></h4><p className="text-sm text-muted-foreground">Look at how your sleep, movement, and downtime stack together.</p></div>
          </div>
        </CardContent>
      </Card>

      <Card>
        <CardHeader><CardTitle>Complete Guide: Heart Rhythm Wellness as a Gentle Check-In</CardTitle></CardHeader>
        <CardContent className="prose prose-sm dark:prose-invert max-w-none">
          <p>
            Heart rhythm variability can be a friendly, numbers-based way to notice how your body is responding to everyday life. Instead of treating it as a
            test you must “pass,” you can use it as a soft nudge toward habits that leave you feeling more rested, clear, and steady.
          </p>
          <p>
            Over time, many people see more stable patterns when they combine enough sleep, small movement breaks, nourishing food, and regular moments of
            calm. This tool is just one lens on that bigger picture—how you feel in your own body is always the most important signal.
          </p>
        </CardContent>
      </Card>

      <Card>
        <CardHeader>
          <CardTitle>Frequently Asked Questions</CardTitle>
          <CardDescription>Supportive, wellness‑oriented answers</CardDescription>
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

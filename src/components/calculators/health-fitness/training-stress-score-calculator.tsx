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
import { Dumbbell, Activity, Calendar } from 'lucide-react';

const formSchema = z.object({
  durationMinutes: z.number().positive().optional(),
  intensityFactor: z.number().min(0).max(1.5).optional(),
});

type FormValues = z.infer<typeof formSchema>;

type ResultPayload = {
  tss: number;
  tssPerHour: number;
  interpretation: string;
  recommendations: string[];
  warningSigns: string[];
  plan: { week: number; focus: string }[];
};

const thresholds = [
  { max: 50, label: 'Easy', guidance: 'Light aerobic stimulus with minimal fatigue. Ideal for recovery rides or technique sessions.' },
  { max: 100, label: 'Solid', guidance: 'Moderate challenge that supports aerobic development with manageable recovery needs.' },
  { max: 150, label: 'Challenging', guidance: 'High-load workout requiring planned recovery or lighter sessions afterward.' },
  { max: 200, label: 'Very Demanding', guidance: 'Significant stress; monitor fatigue and nutrition closely to avoid cumulative overload.' },
];

const plan = (): { week: number; focus: string }[] => [
  { week: 1, focus: 'Baseline assessment: record FTP/threshold pace and log typical weekly TSS.' },
  { week: 2, focus: 'Introduce structured intervals that elevate intensity factor while keeping total TSS sustainable.' },
  { week: 3, focus: 'Add a progressive long session to build aerobic durability; monitor heart rate recovery.' },
  { week: 4, focus: 'Schedule a recovery week with 30–40% less TSS to consolidate gains.' },
  { week: 5, focus: 'Resume build phase with tempo and sweet-spot efforts targeting higher but controlled daily TSS.' },
  { week: 6, focus: 'Incorporate high-intensity interval training to lift intensity factor while shortening duration.' },
  { week: 7, focus: 'Practice race pacing and simulate event conditions; refine fueling and hydration strategies.' },
  { week: 8, focus: 'Taper or deload: reduce TSS but keep some intensity to maintain neuromuscular readiness.' },
];

const faqs: [string, string][] = [
  ['What is Training Stress Score (TSS)?', 'TSS quantifies the workload of a session by combining duration and intensity relative to your threshold (FTP or functional threshold pace). One hour at threshold typically equals 100 TSS.'],
  ['How do I find my intensity factor (IF)?', 'Intensity factor equals normalized power (or normalized graded pace) divided by your functional threshold. Many bike computers and training apps calculate IF automatically.'],
  ['Do I need a power meter?', 'Power meters provide the most precise TSS values, but runners can use pace-based or heart-rate approximations. Some platforms offer hrTSS or rTSS metrics.'],
  ['Is higher TSS always better?', 'No. TSS reflects stress; too much without recovery leads to fatigue and performance decline. Aim for progressive, sustainable increases with regular recovery weeks.'],
  ['What weekly TSS should I target?', 'Experienced athletes often range between 400–800 TSS per week depending on goals. Beginners may start around 250–350. Adjust based on age, training history, and recovery capacity.'],
  ['How does TSS relate to CTL and ATL?', 'Chronic Training Load (CTL) is the rolling average of daily TSS (long-term fitness), while Acute Training Load (ATL) captures recent stress. TSS feeds both metrics to monitor fatigue (Training Stress Balance).'],
  ['Can TSS help prevent overtraining?', 'Yes. Tracking TSS alongside subjective metrics and sleep/HRV helps identify fatigue trends early, allowing you to adjust workload before burnout occurs.'],
  ['What if my IF is greater than 1.0?', 'Values above 1.0 indicate segments performed above threshold—common in short, intense intervals. Sustaining IF ≥ 1.0 for long durations is highly taxing and should be used sparingly.'],
  ['How often should I update FTP?', 'Reassess FTP every 4–8 weeks or after noticeable performance changes. Accurate FTP ensures TSS values remain meaningful.'],
  ['Is TSS useful for strength training?', 'You can approximate a session TSS using session RPE × duration × factor, but heart rate and power-based TSS are more precise for endurance sports.'],
];

const understandingInputs = [
  { label: 'Duration (minutes)', description: 'Total time spent in the workout. Include warm-up and cool-down if they contribute to training stress.' },
  { label: 'Intensity Factor (IF)', description: 'Relative intensity of the session. An IF of 1.0 equals threshold effort, 0.7 is endurance pace, and values above 1.0 indicate supra-threshold work.' },
];

const warningSigns = () => [
  'Consistently high daily TSS without scheduled recovery elevates injury and illness risk.',
  'Training with an outdated FTP inflates or deflates TSS, leading to misguided load management.',
  'Sudden spikes of 50% or more in weekly TSS can overwhelm recovery systems—progress gradually.',
];

const recommendations = (tss: number, tssPerHour: number) => {
  const base = [
    'Maintain accurate FTP or threshold pace testing every training block to keep TSS meaningful.',
    'Log subjective metrics (energy, mood, soreness) alongside TSS for a holistic fatigue picture.',
    'Match nutrition and hydration strategies to session load, especially for TSS-heavy days.',
  ];

  if (tssPerHour < 70) {
    return [
      ...base,
      'Introduce controlled surges or tempo intervals to raise intensity without drastically extending duration.',
      'Review bike fit or running mechanics to ensure low intensity is not due to technique limitations.',
    ];
  }

  if (tss < 120) {
    return [
      ...base,
      'Alternate moderate TSS days with easy recovery sessions to balance load and adaptation.',
      'Consider polarized training (80/20 distribution) to combine easy aerobic work with purposeful intensity.',
    ];
  }

  return [
    ...base,
    'Schedule restorative modalities (sleep extension, mobility, massage) following high-stress workouts.',
    'Monitor Training Stress Balance (TSB) to ensure cumulative fatigue trends downward before key events.',
  ];
};

const interpretTSS = (tss: number) => {
  const threshold = thresholds.find((entry) => tss <= entry.max) ?? { label: 'Extreme', guidance: 'Extreme workload—reserved for epic events or very advanced athletes. Allow extensive recovery.' };
  return `${threshold.label} Load – ${threshold.guidance}`;
};

const calculateTss = (values: FormValues) => {
  if (!values.durationMinutes || !values.intensityFactor) return null;
  const hours = values.durationMinutes / 60;
  const tss = hours * Math.pow(values.intensityFactor, 2) * 100;
  const tssPerHour = Math.pow(values.intensityFactor, 2) * 100;
  return { tss, tssPerHour };
};

export default function TrainingStressScoreCalculator() {
  const [result, setResult] = useState<ResultPayload | null>(null);

  const form = useForm<FormValues>({
    resolver: zodResolver(formSchema),
    defaultValues: {
      durationMinutes: undefined,
      intensityFactor: undefined,
    },
  });

  const onSubmit = (values: FormValues) => {
    const calc = calculateTss(values);
    if (!calc) {
      setResult(null);
      return;
    }
    setResult({
      tss: calc.tss,
      tssPerHour: calc.tssPerHour,
      interpretation: interpretTSS(calc.tss),
      recommendations: recommendations(calc.tss, calc.tssPerHour),
      warningSigns: warningSigns(),
      plan: plan(),
    });
  };

  return (
    <div className="space-y-8">
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2"><Dumbbell className="h-5 w-5" /> Training Stress Score (TSS) Calculator</CardTitle>
          <CardDescription>Estimate session workload using duration and intensity factor to plan training and recovery.</CardDescription>
        </CardHeader>
        <CardContent>
          <Form {...form}>
            <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-6">
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <FormField control={form.control} name="durationMinutes" render={({ field }) => (
                  <FormItem>
                    <FormLabel>Duration (minutes)</FormLabel>
                    <FormControl>
                      <Input type="number" step="1" placeholder="e.g., 90" value={field.value ?? ''} onChange={(e)=>field.onChange(e.target.value === '' ? undefined : Number(e.target.value))} />
                    </FormControl>
                    <FormMessage />
                  </FormItem>
                )} />
                <FormField control={form.control} name="intensityFactor" render={({ field }) => (
                  <FormItem>
                    <FormLabel>Intensity Factor (0.0–1.5)</FormLabel>
                    <FormControl>
                      <Input type="number" step="0.01" placeholder="e.g., 0.82" value={field.value ?? ''} onChange={(e)=>field.onChange(e.target.value === '' ? undefined : Number(e.target.value))} />
                    </FormControl>
                    <FormMessage />
                  </FormItem>
                )} />
              </div>
              <Button type="submit" className="w-full md:w-auto">Calculate TSS</Button>
            </form>
          </Form>
        </CardContent>
      </Card>

      {result && (
        <div className="space-y-6">
          <Card>
            <CardHeader>
              <div className="flex items-center gap-4"><Activity className="h-8 w-8 text-primary" /><CardTitle>Workout Load Summary</CardTitle></div>
              <CardDescription>Insights based on session TSS</CardDescription>
            </CardHeader>
            <CardContent className="space-y-4">
              <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                <div className="p-4 border rounded">
                  <h4 className="text-sm font-semibold text-muted-foreground">Training Stress Score</h4>
                  <p className="text-2xl font-bold text-primary">{result.tss.toFixed(0)} TSS</p>
                </div>
                <div className="p-4 border rounded">
                  <h4 className="text-sm font-semibold text-muted-foreground">TSS per Hour</h4>
                  <p className="text-2xl font-bold text-primary">{result.tssPerHour.toFixed(1)} /hr</p>
                </div>
                <div className="p-4 border rounded">
                  <h4 className="text-sm font-semibold text-muted-foreground">Duration Entered</h4>
                  <p className="text-lg font-bold text-primary">{form.getValues('durationMinutes') ?? 0} min</p>
                </div>
              </div>
              <p className="text-sm text-muted-foreground">{result.interpretation}</p>
            </CardContent>
          </Card>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            <Card>
              <CardHeader><CardTitle>Recommendations</CardTitle></CardHeader>
              <CardContent>
                <ul className="space-y-2">
                  {result.recommendations.map((item, index) => (
                    <li key={index} className="text-sm text-muted-foreground">{item}</li>
                  ))}
                </ul>
              </CardContent>
            </Card>
            <Card>
              <CardHeader><CardTitle>Warning Signs</CardTitle></CardHeader>
              <CardContent>
                <ul className="space-y-2">
                  {result.warningSigns.map((item, index) => (
                    <li key={index} className="text-sm text-muted-foreground">{item}</li>
                  ))}
                </ul>
              </CardContent>
            </Card>
          </div>

          <Card>
            <CardHeader><CardTitle className="flex items-center gap-2"><Calendar className="h-5 w-5" /> 8‑Week Load Progression Plan</CardTitle></CardHeader>
            <CardContent>
              <div className="overflow-x-auto">
                <table className="w-full text-sm">
                  <thead>
                    <tr className="border-b">
                      <th className="text-left p-2">Week</th>
                      <th className="text-left p-2">Focus</th>
                    </tr>
                  </thead>
                  <tbody>
                    {result.plan.map(({ week, focus }) => (
                      <tr key={week} className="border-b">
                        <td className="p-2">{week}</td>
                        <td className="p-2">{focus}</td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            </CardContent>
          </Card>
        </div>
      )}

      <Card>
        <CardHeader>
          <CardTitle>Understanding the Inputs</CardTitle>
          <CardDescription>Collect accurate metrics for reliable TSS</CardDescription>
        </CardHeader>
        <CardContent>
          <ul className="space-y-2">
            {understandingInputs.map((item, index) => (
              <li key={index}>
                <span className="font-semibold text-foreground">{item.label}:</span>
                <span className="text-sm text-muted-foreground"> {item.description}</span>
              </li>
            ))}
          </ul>
        </CardContent>
      </Card>

      <Card>
        <CardHeader>
          <CardTitle>Related Calculators</CardTitle>
          <CardDescription>Track complementary training metrics</CardDescription>
        </CardHeader>
        <CardContent>
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div className="p-4 border rounded">
              <h4 className="font-semibold mb-1"><Link href="/category/health-fitness/chronic-training-load-calculator" className="text-primary hover:underline">Chronic Training Load (CTL)</Link></h4>
              <p className="text-sm text-muted-foreground">Monitor long-term fitness trends informed by daily TSS.</p>
            </div>
            <div className="p-4 border rounded">
              <h4 className="font-semibold mb-1"><Link href="/category/health-fitness/acute-training-load-calculator" className="text-primary hover:underline">Acute Training Load (ATL)</Link></h4>
              <p className="text-sm text-muted-foreground">Gauge short-term fatigue to balance training stress.</p>
            </div>
            <div className="p-4 border rounded">
              <h4 className="font-semibold mb-1"><Link href="/category/health-fitness/training-impulse-trimp-calculator" className="text-primary hover:underline">Training Impulse (TRIMP)</Link></h4>
              <p className="text-sm text-muted-foreground">Estimate load using heart-rate-based scoring.</p>
            </div>
            <div className="p-4 border rounded">
              <h4 className="font-semibold mb-1"><Link href="/category/health-fitness/power-to-heart-rate-efficiency-calculator" className="text-primary hover:underline">Power-to-HR Efficiency</Link></h4>
              <p className="text-sm text-muted-foreground">Track aerobic efficiency alongside TSS trends.</p>
            </div>
          </div>
        </CardContent>
      </Card>

      <Card>
        <CardHeader>
          <CardTitle>Complete Guide: Using TSS to Manage Training Load</CardTitle>
          <CardDescription>Turn data into actionable performance insights</CardDescription>
        </CardHeader>
        <CardContent className="prose prose-sm dark:prose-invert max-w-none">
          <p>Training Stress Score provides a consistent way to quantify how demanding a workout is. By multiplying duration and relative intensity, TSS helps endurance athletes compare workouts, plan progressive overload, and prevent excessive fatigue. Pair TSS analysis with subjective feedback, recovery metrics, and periodized planning to ensure the stress applied translates into long-term adaptation rather than burnout.</p>
          <p>Successful programs cycle through build and recovery phases, adjusting weekly TSS to align with upcoming races or goals. Use this calculator to validate session design, monitor weekly totals, and inform decisions about when to push or pull back. Remember that the goal is not to chase ever-higher numbers but to apply the right dose of stress at the right time.</p>
        </CardContent>
      </Card>

      <Card>
        <CardHeader>
          <CardTitle>Frequently Asked Questions</CardTitle>
          <CardDescription>TSS fundamentals for smarter training</CardDescription>
        </CardHeader>
        <CardContent className="space-y-4">
          {faqs.map(([question, answer], index) => (
            <div key={index}>
              <h4 className="font-semibold mb-1">{question}</h4>
              <p className="text-sm text-muted-foreground">{answer}</p>
            </div>
          ))}
        </CardContent>
      </Card>
    </div>
  );
}



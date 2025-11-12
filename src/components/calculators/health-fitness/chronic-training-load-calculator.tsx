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
import { TrendingUp, Activity, Calendar } from 'lucide-react';

const formSchema = z.object({
  currentCtl: z.number().min(0).optional(),
  dailyTss: z.number().min(0).optional(),
  timeConstant: z.number().min(7).max(60).optional(),
});

type FormValues = z.infer<typeof formSchema>;

type ResultPayload = {
  newCtl: number;
  delta: number;
  interpretation: string;
  recommendations: string[];
  warningSigns: string[];
  plan: { week: number; focus: string }[];
};

const understandingInputs = [
  { label: 'Current CTL (optional)', description: 'Existing chronic training load value. Leave blank if starting from zero or calculating from scratch.' },
  { label: 'Daily TSS', description: 'Average Training Stress Score for the day. Use the value from your workout or daily training log.' },
  { label: 'Time Constant (days)', description: 'The decay constant that governs fitness response. Common defaults: 42 days for cycling/running, 30 for swimming.' },
];

const faqs: [string, string][] = [
  ['What is Chronic Training Load (CTL)?', 'CTL is the exponentially weighted average of daily TSS over several weeks. It reflects long-term fitness or training capacity rather than acute fatigue.'],
  ['How is the CTL formula derived?', 'CTL = CTL_previous × e^(−1/TC) + TSS_today × (1 − e^(−1/TC)), where TC is the time constant (usually 42 days). This gives more weight to recent workouts while preserving historical contributions.'],
  ['What CTL range is appropriate?', 'Recreational athletes might maintain CTL between 40–60, while competitive endurance athletes may accumulate 80–120 or more, depending on discipline and experience.'],
  ['How quickly can CTL increase?', 'A safe ramp rate is typically 5–8 CTL points per week. Aggressive jumps beyond 10 points can elevate injury or burnout risk.'],
  ['Why does CTL drop during rest weeks?', 'Because older workouts decay exponentially, reduced TSS during recovery weeks lowers CTL slightly—this is normal and necessary for supercompensation.'],
  ['How does CTL relate to ATL and TSB?', 'ATL (Acute Training Load) tracks short-term fatigue, while TSB (Training Stress Balance) = CTL − ATL. Positive TSB indicates freshness, negative values signal accumulated fatigue.'],
  ['Can CTL be sport-specific?', 'Yes. Many athletes track separate CTL values for swim, bike, and run disciplines to tailor training stress per sport.'],
  ['What happens if I miss days of training?', 'Daily TSS of zero causes CTL to decay toward zero over time. Longer breaks will reduce CTL but allow for recovery; ramp back up gradually.'],
  ['Is a higher CTL always better?', 'Not necessarily. CTL should align with performance goals, recovery capacity, and life stressors. Sustainably maintaining a moderate CTL often yields better outcomes than chasing extremes.'],
  ['How often should I monitor CTL?', 'Daily monitoring helps spot trends, but weekly reviews are sufficient for most athletes. Pay attention to how CTL interacts with subjective fatigue and performance.'],
];

const warningSigns = () => [
  'Rapid CTL increases (>10 points per week) raise injury risk and may indicate insufficient recovery.',
  'Persistently high CTL with low motivation, poor sleep, or mood changes can signal overreaching.',
  'Ignoring illness or musculoskeletal pain to keep CTL elevated undermines long-term progress.',
];

const plan = (): { week: number; focus: string }[] => [
  { week: 1, focus: 'Assess FTP/threshold and establish baseline CTL and weekly TSS averages.' },
  { week: 2, focus: 'Add consistent endurance sessions to build volume without drastic intensity spikes.' },
  { week: 3, focus: 'Layer in threshold or tempo work to raise daily TSS strategically.' },
  { week: 4, focus: 'Insert a recovery week (reduce TSS by ~40%) to consolidate fitness and adjust CTL expectations.' },
  { week: 5, focus: 'Resume progressive overload: increase weekly TSS by 5–10% while tracking CTL ramp rate.' },
  { week: 6, focus: 'Include race-specific intensity and fueling practice to support higher CTL.' },
  { week: 7, focus: 'Monitor ATL/CTL balance and adjust sessions if Training Stress Balance stays deeply negative.' },
  { week: 8, focus: 'Plan upcoming taper or peak period by lowering ATL while stabilizing CTL.' },
];

const recommendations = (newCtl: number, delta: number) => {
  const base = [
    'Track weekly CTL ramp rates; aim for steady progress rather than sudden spikes.',
    'Align sleep, nutrition, and stress management with increases in training load.',
    'Review discipline-specific CTL (swim/bike/run) if training for multisport events.',
  ];

  if (newCtl < 40) {
    return [
      ...base,
      'Focus on consistency—prioritize completing planned sessions over pushing intensity.',
      'Incorporate strength and mobility to support higher future training loads.',
    ];
  }

  if (newCtl < 70) {
    return [
      ...base,
      'Introduce structured tempo or sweet-spot workouts to lift average TSS.',
      'Schedule periodic lab or field testing to validate threshold improvements.',
    ];
  }

  if (delta > 6) {
    return [
      ...base,
      'Ensure future weeks alternate between build and recovery to avoid chronic fatigue.',
      'Use monitoring tools (HRV, mood logs) to confirm you are adapting positively.',
    ];
  }

  return [
    ...base,
    'Plan a recovery block if negative Training Stress Balance persists for more than a week.',
    'Coordinate with a coach or medical professional when sustaining very high CTL levels.',
  ];
};

const interpretCtl = (newCtl: number, delta: number) => {
  if (newCtl < 30) return 'Foundational Load – Ideal for beginners, recovery phases, or offseason maintenance.';
  if (newCtl < 60) return 'Developing Load – Consistent training with growing aerobic fitness; sustainable for most athletes.';
  if (newCtl < 90) return 'High Load – Demands disciplined recovery and monitoring; often used during build phases.';
  return delta >= 0 ? 'Peak Load – Elite-level stress requiring meticulous recovery and periodization.' : 'Peak Load Declining – CTL trending down; potentially tapering toward key events.';
};

const calculateCtl = (values: FormValues) => {
  if (!values.dailyTss || !values.timeConstant) return null;
  const previous = values.currentCtl ?? 0;
  const decayFactor = Math.exp(-1 / values.timeConstant);
  const newCtl = previous * decayFactor + values.dailyTss * (1 - decayFactor);
  return { newCtl, delta: newCtl - previous };
};

export default function ChronicTrainingLoadCalculator() {
  const [result, setResult] = useState<ResultPayload | null>(null);

  const form = useForm<FormValues>({
    resolver: zodResolver(formSchema),
    defaultValues: {
      currentCtl: undefined,
      dailyTss: undefined,
      timeConstant: 42,
    },
  });

  const onSubmit = (values: FormValues) => {
    const calc = calculateCtl(values);
    if (!calc) {
      setResult(null);
      return;
    }
    setResult({
      newCtl: calc.newCtl,
      delta: calc.delta,
      interpretation: interpretCtl(calc.newCtl, calc.delta),
      recommendations: recommendations(calc.newCtl, calc.delta),
      warningSigns: warningSigns(),
      plan: plan(),
    });
  };

  return (
    <div className="space-y-8">
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2"><TrendingUp className="h-5 w-5" /> Chronic Training Load (CTL) Calculator</CardTitle>
          <CardDescription>Estimate long-term fitness by updating CTL using daily Training Stress Scores and time constants.</CardDescription>
        </CardHeader>
        <CardContent>
          <Form {...form}>
            <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-6">
              <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                <FormField control={form.control} name="currentCtl" render={({ field }) => (
                  <FormItem>
                    <FormLabel>Current CTL (optional)</FormLabel>
                    <FormControl>
                      <Input type="number" step="0.1" placeholder="e.g., 55" value={field.value ?? ''} onChange={(e)=>field.onChange(e.target.value === '' ? undefined : Number(e.target.value))} />
                    </FormControl>
                    <FormMessage />
                  </FormItem>
                )} />
                <FormField control={form.control} name="dailyTss" render={({ field }) => (
                  <FormItem>
                    <FormLabel>Daily TSS</FormLabel>
                    <FormControl>
                      <Input type="number" step="0.1" placeholder="e.g., 75" value={field.value ?? ''} onChange={(e)=>field.onChange(e.target.value === '' ? undefined : Number(e.target.value))} />
                    </FormControl>
                    <FormMessage />
                  </FormItem>
                )} />
                <FormField control={form.control} name="timeConstant" render={({ field }) => (
                  <FormItem>
                    <FormLabel>Time Constant (days)</FormLabel>
                    <FormControl>
                      <Input type="number" step="1" placeholder="e.g., 42" value={field.value ?? ''} onChange={(e)=>field.onChange(e.target.value === '' ? undefined : Number(e.target.value))} />
                    </FormControl>
                    <FormMessage />
                  </FormItem>
                )} />
              </div>
              <Button type="submit" className="w-full md:w-auto">Update CTL</Button>
            </form>
          </Form>
        </CardContent>
      </Card>

      {result && (
        <div className="space-y-6">
          <Card>
            <CardHeader>
              <div className="flex items-center gap-4"><Activity className="h-8 w-8 text-primary" /><CardTitle>CTL Summary</CardTitle></div>
              <CardDescription>Evaluate fitness trends based on the latest training data</CardDescription>
            </CardHeader>
            <CardContent className="space-y-4">
              <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                <div className="p-4 border rounded">
                  <h4 className="text-sm font-semibold text-muted-foreground">Updated CTL</h4>
                  <p className="text-2xl font-bold text-primary">{result.newCtl.toFixed(1)} TSS</p>
                </div>
                <div className="p-4 border rounded">
                  <h4 className="text-sm font-semibold text-muted-foreground">Change vs. Previous</h4>
                  <p className="text-2xl font-bold text-primary">{result.delta >= 0 ? '+' : ''}{result.delta.toFixed(1)}</p>
                </div>
                <div className="p-4 border rounded">
                  <h4 className="text-sm font-semibold text-muted-foreground">Time Constant Used</h4>
                  <p className="text-lg font-bold text-primary">{form.getValues('timeConstant') ?? 0} days</p>
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
            <CardHeader><CardTitle className="flex items-center gap-2"><Calendar className="h-5 w-5" /> 8‑Week Fitness Progression Plan</CardTitle></CardHeader>
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
          <CardDescription>Ensure reliable CTL projections with accurate data</CardDescription>
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
          <CardDescription>Monitor complementary training load metrics</CardDescription>
        </CardHeader>
        <CardContent>
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div className="p-4 border rounded">
              <h4 className="font-semibold mb-1"><Link href="/category/health-fitness/acute-training-load-calculator" className="text-primary hover:underline">Acute Training Load (ATL)</Link></h4>
              <p className="text-sm text-muted-foreground">Understand short-term fatigue alongside long-term fitness.</p>
            </div>
            <div className="p-4 border rounded">
              <h4 className="font-semibold mb-1"><Link href="/category/health-fitness/training-stress-score-calculator" className="text-primary hover:underline">Training Stress Score (TSS)</Link></h4>
              <p className="text-sm text-muted-foreground">Daily TSS values feed CTL calculations—plan each workout accordingly.</p>
            </div>
            <div className="p-4 border rounded">
              <h4 className="font-semibold mb-1"><Link href="/category/health-fitness/training-impulse-trimp-calculator" className="text-primary hover:underline">Training Impulse (TRIMP)</Link></h4>
              <p className="text-sm text-muted-foreground">Heart-rate-based load metric to correlate with CTL trends.</p>
            </div>
            <div className="p-4 border rounded">
              <h4 className="font-semibold mb-1"><Link href="/category/health-fitness/power-to-heart-rate-efficiency-calculator" className="text-primary hover:underline">Power-to-HR Efficiency</Link></h4>
              <p className="text-sm text-muted-foreground">Diagnose aerobic efficiency changes as CTL evolves.</p>
            </div>
          </div>
        </CardContent>
      </Card>

      <Card>
        <CardHeader>
          <CardTitle>Complete Guide: Managing Long-Term Training Load</CardTitle>
          <CardDescription>Use CTL to balance fitness and recovery</CardDescription>
        </CardHeader>
        <CardContent className="prose prose-sm dark:prose-invert max-w-none">
          <p>Chronic Training Load reflects the cumulative effect of your workouts. Tracking CTL helps athletes periodize training, minimize surprise fatigue, and align workload with competition schedules. Combine CTL with qualitative feedback—sleep quality, mood, appetite—and objective markers like heart rate variability for a comprehensive view of readiness.</p>
          <p>Remember that CTL is a tool, not a goal. Deliberate rises followed by strategic recovery maintain performance momentum while protecting long-term health. Adjust CTL targets according to personal history, available training time, and life demands.</p>
        </CardContent>
      </Card>

      <Card>
        <CardHeader>
          <CardTitle>Frequently Asked Questions</CardTitle>
          <CardDescription>CTL essentials for endurance planning</CardDescription>
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

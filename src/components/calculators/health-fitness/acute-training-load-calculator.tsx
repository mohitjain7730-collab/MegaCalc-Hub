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
import { Activity, Calendar, AlertTriangle } from 'lucide-react';

const formSchema = z.object({
  currentAtl: z.number().min(0).optional(),
  dailyTss: z.number().min(0).optional(),
  timeConstant: z.number().min(3).max(14).optional(),
});

type FormValues = z.infer<typeof formSchema>;

type ResultPayload = {
  newAtl: number;
  delta: number;
  interpretation: string;
  recommendations: string[];
  warningSigns: string[];
  plan: { week: number; focus: string }[];
};

const understandingInputs = [
  { label: 'Current ATL (optional)', description: 'Existing acute training load value representing short-term fatigue. Leave blank to calculate from zero.' },
  { label: 'Daily TSS', description: 'Training Stress Score for today’s session or daily total. Higher TSS generates greater acute fatigue.' },
  { label: 'Time Constant (days)', description: 'Decay constant used for acute load. Seven days is standard; shorter values emphasize recent workouts even more.' },
];

const faqs: [string, string][] = [
  ['What is Acute Training Load (ATL)?', 'ATL is the exponentially weighted average of recent TSS (typically last 7 days) and indicates short-term fatigue or training stress.'],
  ['How is ATL different from CTL?', 'ATL captures short-term stress while CTL describes long-term fitness. Comparing them helps determine fatigue via Training Stress Balance (TSB = CTL − ATL).'],
  ['Why use a time constant of seven days?', 'Seven days approximates one week of training microcycles. You can adjust between 5–9 days depending on sport and personal recovery dynamics.'],
  ['What ATL range should I target?', 'The absolute value depends on discipline and fitness. Focus on how ATL compares to CTL and how it trends week to week rather than chasing a fixed number.'],
  ['How fast can ATL change?', 'Because ATL weights recent workouts heavily, it responds quickly to high-TSS days. Expect noticeable jumps after intense sessions, followed by declines during rest days.'],
  ['What happens if ATL stays higher than CTL?', 'Persistently high ATL indicates accumulating fatigue. Training Stress Balance becomes negative, signaling the need for recovery or reduced load.' ],
  ['How does ATL inform tapering?', 'Reducing ATL while keeping CTL stable helps shed fatigue before A-races. Track ATL drops to ensure you arrive fresh but still fit.'],
  ['Should strength workouts contribute to ATL?', 'If quantified with TSS or a reliable load metric, yes. Many athletes approximate strength sessions using session RPE × duration to capture their contribution.'],
  ['Can I run separate ATL calculations for different sports?', 'Yes. Triathletes often maintain sport-specific ATL/CTL to tailor fatigue management per discipline.'],
  ['How often should I update ATL?', 'Update daily with new TSS data. Monitoring trends every few days helps adjust training before fatigue becomes unmanageable.'],
];

const warningSigns = () => [
  'Back-to-back spikes in ATL without recovery days elevate injury risk and degrade performance.',
  'Large negative Training Stress Balance (CTL − ATL < −25) for extended periods suggests excessive fatigue.',
  'Ignoring illness, soreness, or sleep disruption to preserve ATL can derail long-term progress.',
];

const plan = (): { week: number; focus: string }[] => [
  { week: 1, focus: 'Record daily TSS accurately and note subjective fatigue to correlate with ATL updates.' },
  { week: 2, focus: 'Establish a rhythm of loading and lighter days (e.g., hard/easy pattern) to control ATL swings.' },
  { week: 3, focus: 'Introduce structured intervals that raise daily TSS while keeping overall ATL manageable.' },
  { week: 4, focus: 'Schedule mini recovery block with reduced ATL to absorb training stress.' },
  { week: 5, focus: 'Resume build with progressive overload, watching ATL ramp no more than 30% week to week.' },
  { week: 6, focus: 'Add race-specific workouts but couple them with low-TSS recovery sessions immediately afterward.' },
  { week: 7, focus: 'Evaluate ATL vs. CTL and ensure Training Stress Balance doesn’t remain highly negative.' },
  { week: 8, focus: 'Plan taper or maintenance block: gradually lower ATL while preserving key intensity to stay sharp.' },
];

const recommendations = (newAtl: number, delta: number) => {
  const base = [
    'Log both objective metrics (ATL, CTL, TSB) and subjective cues (sleep, RPE) daily.',
    'Alternate high and low TSS days to avoid cumulative fatigue spikes.',
    'Refuel within 30–60 minutes after high-ATL workouts to accelerate recovery.',
  ];

  if (newAtl < 30) {
    return [
      ...base,
      'If preparing for competition, add moderately intense workouts to increase ATL transiently.',
      'Use light days to refine technique and mobility without overly suppressing ATL.',
    ];
  }

  if (newAtl < 60) {
    return [
      ...base,
      'Maintain balanced load by planning two “key” sessions per week, supported by aerobic maintenance days.',
      'Monitor Training Stress Balance to confirm adequate freshness before demanding workouts.',
    ];
  }

  if (delta > 8) {
    return [
      ...base,
      'Consider an immediate easy day or active recovery to prevent overreaching.',
      'Increase sleep duration and evaluate hydration/electrolyte intake during heavy weeks.',
    ];
  }

  return [
    ...base,
    'Schedule regular biomechanical or technique assessments to ensure fatigue is not altering form.',
    'Coordinate with a coach to integrate restorative weeks whenever ATL remains elevated for more than 10 days.',
  ];
};

const interpretAtl = (newAtl: number, delta: number) => {
  if (newAtl < 20) return 'Low Acute Load – Recovery oriented; useful for deloads and early base phases.';
  if (newAtl < 40) return 'Moderate Acute Load – Balanced workload supporting steady progress.';
  if (newAtl < 60) return 'High Acute Load – Demands attentive recovery and stress management.';
  return delta >= 0 ? 'Very High Acute Load – Significant fatigue accumulation; plan immediate recovery.' : 'Declining Acute Load – Fatigue is dissipating; ensure sharpness by retaining some intensity.';
};

const calculateAtl = (values: FormValues) => {
  if (!values.dailyTss || !values.timeConstant) return null;
  const previous = values.currentAtl ?? 0;
  const decay = Math.exp(-1 / values.timeConstant);
  const newAtl = previous * decay + values.dailyTss * (1 - decay);
  return { newAtl, delta: newAtl - previous };
};

export default function AcuteTrainingLoadCalculator() {
  const [result, setResult] = useState<ResultPayload | null>(null);

  const form = useForm<FormValues>({
    resolver: zodResolver(formSchema),
    defaultValues: {
      currentAtl: undefined,
      dailyTss: undefined,
      timeConstant: 7,
    },
  });

  const onSubmit = (values: FormValues) => {
    const calc = calculateAtl(values);
    if (!calc) {
      setResult(null);
      return;
    }
    setResult({
      newAtl: calc.newAtl,
      delta: calc.delta,
      interpretation: interpretAtl(calc.newAtl, calc.delta),
      recommendations: recommendations(calc.newAtl, calc.delta),
      warningSigns: warningSigns(),
      plan: plan(),
    });
  };

  return (
    <div className="space-y-8">
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2"><Activity className="h-5 w-5" /> Acute Training Load (ATL) Calculator</CardTitle>
          <CardDescription>Assess short-term training stress by updating ATL with today’s TSS and decay constants.</CardDescription>
        </CardHeader>
        <CardContent>
          <Form {...form}>
            <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-6">
              <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                <FormField control={form.control} name="currentAtl" render={({ field }) => (
                  <FormItem>
                    <FormLabel>Current ATL (optional)</FormLabel>
                    <FormControl>
                      <Input type="number" step="0.1" placeholder="e.g., 45" value={field.value ?? ''} onChange={(e)=>field.onChange(e.target.value === '' ? undefined : Number(e.target.value))} />
                    </FormControl>
                    <FormMessage />
                  </FormItem>
                )} />
                <FormField control={form.control} name="dailyTss" render={({ field }) => (
                  <FormItem>
                    <FormLabel>Daily TSS</FormLabel>
                    <FormControl>
                      <Input type="number" step="0.1" placeholder="e.g., 85" value={field.value ?? ''} onChange={(e)=>field.onChange(e.target.value === '' ? undefined : Number(e.target.value))} />
                    </FormControl>
                    <FormMessage />
                  </FormItem>
                )} />
                <FormField control={form.control} name="timeConstant" render={({ field }) => (
                  <FormItem>
                    <FormLabel>Time Constant (days)</FormLabel>
                    <FormControl>
                      <Input type="number" step="1" placeholder="e.g., 7" value={field.value ?? ''} onChange={(e)=>field.onChange(e.target.value === '' ? undefined : Number(e.target.value))} />
                    </FormControl>
                    <FormMessage />
                  </FormItem>
                )} />
              </div>
              <Button type="submit" className="w-full md:w-auto">Update ATL</Button>
            </form>
          </Form>
        </CardContent>
      </Card>

      {result && (
        <div className="space-y-6">
          <Card>
            <CardHeader>
              <div className="flex items-center gap-4"><AlertTriangle className="h-8 w-8 text-primary" /><CardTitle>ATL Summary</CardTitle></div>
              <CardDescription>Gauge short-term fatigue and adjust upcoming sessions</CardDescription>
            </CardHeader>
            <CardContent className="space-y-4">
              <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                <div className="p-4 border rounded">
                  <h4 className="text-sm font-semibold text-muted-foreground">Updated ATL</h4>
                  <p className="text-2xl font-bold text-primary">{result.newAtl.toFixed(1)} TSS</p>
                </div>
                <div className="p-4 border rounded">
                  <h4 className="text-sm font-semibold text-muted-foreground">Change vs. Previous</h4>
                  <p className="text-2xl font-bold text-primary">{result.delta >= 0 ? '+' : ''}{result.delta.toFixed(1)}</p>
                </div>
                <div className="p-4 border rounded">
                  <h4 className="text-sm font-semibold text-muted-foreground">Daily TSS Input</h4>
                  <p className="text-lg font-bold text-primary">{form.getValues('dailyTss') ?? 0}</p>
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
            <CardHeader><CardTitle className="flex items-center gap-2"><Calendar className="h-5 w-5" /> 8‑Week Fatigue Management Plan</CardTitle></CardHeader>
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
          <CardDescription>Accurate ATL depends on reliable training data</CardDescription>
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
          <CardDescription>Track training load holistically</CardDescription>
        </CardHeader>
        <CardContent>
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div className="p-4 border rounded">
              <h4 className="font-semibold mb-1"><Link href="/category/health-fitness/chronic-training-load-calculator" className="text-primary hover:underline">Chronic Training Load (CTL)</Link></h4>
              <p className="text-sm text-muted-foreground">Pair ATL with CTL to compute Training Stress Balance.</p>
            </div>
            <div className="p-4 border rounded">
              <h4 className="font-semibold mb-1"><Link href="/category/health-fitness/training-stress-score-calculator" className="text-primary hover:underline">Training Stress Score (TSS)</Link></h4>
              <p className="text-sm text-muted-foreground">Daily TSS updates drive ATL changes—plan workouts accordingly.</p>
            </div>
            <div className="p-4 border rounded">
              <h4 className="font-semibold mb-1"><Link href="/category/health-fitness/training-impulse-trimp-calculator" className="text-primary hover:underline">Training Impulse (TRIMP)</Link></h4>
              <p className="text-sm text-muted-foreground">Use heart-rate-based loading when power data are unavailable.</p>
            </div>
            <div className="p-4 border rounded">
              <h4 className="font-semibold mb-1"><Link href="/category/health-fitness/power-to-heart-rate-efficiency-calculator" className="text-primary hover:underline">Power-to-HR Efficiency</Link></h4>
              <p className="text-sm text-muted-foreground">See how fatigue alters efficiency as ATL fluctuates.</p>
            </div>
          </div>
        </CardContent>
      </Card>

      <Card>
        <CardHeader>
          <CardTitle>Complete Guide: Managing Acute Fatigue</CardTitle>
          <CardDescription>Use ATL to steer daily training decisions</CardDescription>
        </CardHeader>
        <CardContent className="prose prose-sm dark:prose-invert max-w-none">
          <p>Acute Training Load reflects how taxing recent workouts are. Tracking ATL helps you recognize when to push harder and when to schedule recovery. Combine ATL with CTL to calculate Training Stress Balance, a quick indicator of freshness. Remember that physiological signals—resting heart rate, mood, appetite, soreness—should corroborate load metrics before major decisions.</p>
          <p>Sustainable progression hinges on balancing load and recovery. Use ATL to ensure hard sessions are followed by easy ones, monitor taper effectiveness, and prevent overreaching before competitions. Adjust the time constant for your sport and individual response to capture fatigue accurately.</p>
        </CardContent>
      </Card>

      <Card>
        <CardHeader>
          <CardTitle>Frequently Asked Questions</CardTitle>
          <CardDescription>Short-term load management essentials</CardDescription>
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
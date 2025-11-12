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
import { Zap, Activity, Gauge, Target, Calendar } from 'lucide-react';

const formSchema = z.object({
  power1: z.number().positive().optional(),
  duration1: z.number().positive().optional(),
  power2: z.number().positive().optional(),
  duration2: z.number().positive().optional(),
});

type FormValues = z.infer<typeof formSchema>;

type ResultPayload = {
  cp: number;
  wPrime: number;
  interpretation: string;
  recommendations: string[];
  warningSigns: string[];
  plan: { week: number; focus: string }[];
};

const plan = (): { week: number; focus: string }[] => [
  { week: 1, focus: 'Perform baseline CP test with two all-out efforts (3–5 min and 12–20 min) and record data accurately.' },
  { week: 2, focus: 'Build aerobic base with long endurance rides at 65–75% of CP to improve sustainability.' },
  { week: 3, focus: 'Introduce sweet-spot and threshold intervals (2 × 12 min at 90–95% CP) with equal recovery.' },
  { week: 4, focus: 'Add anaerobic capacity work: 6–8 × 1 min at 120% CP with 2 min recovery to develop W′.' },
  { week: 5, focus: 'Progress to VO₂ max intervals (4 × 4 min at 105–110% CP) and maintain endurance volume.' },
  { week: 6, focus: 'Practice race-specific efforts combining CP and supra-threshold intervals to simulate course demands.' },
  { week: 7, focus: 'Reassess CP/W′ with updated test efforts to track improvement and adjust training zones.' },
  { week: 8, focus: 'Taper volume slightly, maintain intensity, and prepare for goal event or new testing block.' },
];

const faqs: [string, string][] = [
  ['What is critical power (CP)?', 'Critical power (CP) is the highest power output you can sustain over a longer duration without fatigue rapidly increasing. It reflects aerobic endurance capacity and is typically determined from two or more maximal efforts.'],
  ['What is W′ (W prime)?', 'W′ represents your finite anaerobic work capacity above CP. It is the energy reserve you can use for surges, attacks, and short high-intensity efforts before needing to recover below CP.'],
  ['How do I collect data for CP testing?', 'Perform two or more all-out efforts at different durations (e.g., 3–5 minutes and 12–20 minutes). Record average power and duration for each effort. The calculator uses these inputs to estimate CP and W′.'],
  ['Can I use more than two data points?', 'This calculator uses two data points for simplicity. Using three or more maximal efforts improves accuracy. For advanced analysis, consider software that supports multi-point CP modelling.'],
  ['How often should I retest critical power?', 'Retest every 6–8 weeks or after completing a focused training block. Retesting helps update training zones and monitor adaptations in both aerobic and anaerobic systems.'],
  ['What is a good CP value?', 'CP varies by rider size, discipline, and training background. Recreational cyclists may have CP values under 250 W, while competitive cyclists often exceed 300 W. Track progress relative to your baseline.'],
  ['How can I increase my CP?', 'Combine endurance rides, tempo/threshold intervals, and VO₂ max efforts while progressively increasing training volume. Adequate recovery, nutrition, and strength training also support CP improvements.'],
  ['How can I improve W′?', 'Target high-intensity interval training above CP, sprint intervals, and repeated anaerobic efforts with controlled recovery. Ensure you also build aerobic fitness to replenish W′ more efficiently.'],
  ['Is CP the same as FTP?', 'Functional Threshold Power (FTP) is similar but not identical. FTP is typically defined as 95% of a 20-minute effort or 60-minute power. CP is derived mathematically from multiple efforts and can be slightly higher or lower than FTP depending on individual physiology.'],
  ['Can I use heart rate instead of power?', 'Accurate CP and W′ calculations require consistent power data. Heart rate responds more slowly and is influenced by many factors, so it is not suitable for CP calculations without power measurements.'],
];

const understandingInputs = [
  { label: 'Power 1 (watts)', description: 'Average power from your shorter maximal effort (e.g., 3–5 minutes). Use calibrated power meter data.' },
  { label: 'Duration 1 (minutes)', description: 'Duration of the first effort in minutes. Convert seconds to decimal (e.g., 4 minutes 30 seconds = 4.5).' },
  { label: 'Power 2 (watts)', description: 'Average power from your longer maximal effort (e.g., 12–20 minutes). Keep conditions consistent with the first test.' },
  { label: 'Duration 2 (minutes)', description: 'Duration of the second effort in minutes. Ensure it is meaningfully longer than duration 1 for accurate results.' },
];

const calculateCriticalPower = (values: FormValues) => {
  if (!values.power1 || !values.duration1 || !values.power2 || !values.duration2) return null;

  const t1 = values.duration1 * 60;
  const t2 = values.duration2 * 60;

  if (t1 === t2) return null;

  const w1 = values.power1 * t1;
  const w2 = values.power2 * t2;
  const cp = (w2 - w1) / (t2 - t1);
  const wPrime = w1 - cp * t1;

  if (!Number.isFinite(cp) || !Number.isFinite(wPrime) || cp <= 0 || wPrime <= 0) return null;

  return { cp, wPrime };
};

const interpret = (cp: number) => {
  if (cp < 200) return 'Critical power is below typical trained levels. Focus on building aerobic base and consistent training volume.';
  if (cp < 275) return 'Critical power falls within the recreational endurance range. Structured training can produce solid gains.';
  if (cp < 350) return 'Critical power is strong for competitive amateurs. Continue refining training distribution and recovery.';
  return 'Critical power is at an elite level. Maintain high-quality training, recovery, and monitoring to sustain performance.';
};

const recommendations = (cp: number, wPrime: number) => {
  const recs = [
    'Use CP to set accurate training zones for endurance, tempo, threshold, and VO₂ max work.',
    'Plan rides with a balance of 80% endurance volume and 20% high-intensity intervals for sustainable progress.',
    'Schedule recovery days or active recovery rides when training above CP to replenish W′.',
  ];

  if (wPrime < 12000) {
    recs.push('Increase anaerobic capacity with short, high-intensity intervals (30s–2min) and sprint work.');
  } else if (wPrime > 25000) {
    recs.push('Focus on long threshold intervals to better utilise large W′ without excessive fatigue.');
  }

  if (cp < 250) {
    recs.push('Build aerobic base with longer steady-state rides and gradual volume increases.');
  } else {
    recs.push('Incorporate race-specific workouts combining threshold and supra-threshold efforts.');
  }

  return recs;
};

const warningSigns = () => [
  'This calculator assumes maximal, well-paced efforts. Submaximal inputs will underestimate CP and W′.',
  'Avoid testing when fatigued, ill, or under-recovered. Poor data leads to inaccurate training zones.',
  'Always consider environmental conditions (heat, altitude) when interpreting results and planning training.',
];

export default function CriticalPowerCalculator() {
  const [result, setResult] = useState<ResultPayload | null>(null);

  const form = useForm<FormValues>({
    resolver: zodResolver(formSchema),
    defaultValues: {
      power1: undefined,
      duration1: undefined,
      power2: undefined,
      duration2: undefined,
    },
  });

  const onSubmit = (values: FormValues) => {
    const calc = calculateCriticalPower(values);
    if (!calc) {
      setResult(null);
      return;
    }

    setResult({
      cp: calc.cp,
      wPrime: calc.wPrime,
      interpretation: interpret(calc.cp),
      recommendations: recommendations(calc.cp, calc.wPrime),
      warningSigns: warningSigns(),
      plan: plan(),
    });
  };

  return (
    <div className="space-y-8">
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2"><Zap className="h-5 w-5" /> Critical Power Calculator</CardTitle>
          <CardDescription>Estimate your critical power (CP) and anaerobic work capacity (W′) using two maximal efforts.</CardDescription>
        </CardHeader>
        <CardContent>
          <Form {...form}>
            <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-6">
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <FormField control={form.control} name="power1" render={({ field }) => (
                  <FormItem>
                    <FormLabel className="flex items-center gap-2"><Gauge className="h-4 w-4" /> Power 1 (watts)</FormLabel>
                    <FormControl>
                      <Input type="number" step="1" placeholder="e.g., 320" value={field.value ?? ''} onChange={(e)=>field.onChange(e.target.value === '' ? undefined : Number(e.target.value))} />
                    </FormControl>
                    <FormMessage />
                  </FormItem>
                )} />
                <FormField control={form.control} name="duration1" render={({ field }) => (
                  <FormItem>
                    <FormLabel className="flex items-center gap-2"><Calendar className="h-4 w-4" /> Duration 1 (minutes)</FormLabel>
                    <FormControl>
                      <Input type="number" step="0.1" placeholder="e.g., 4.5" value={field.value ?? ''} onChange={(e)=>field.onChange(e.target.value === '' ? undefined : Number(e.target.value))} />
                    </FormControl>
                    <FormMessage />
                  </FormItem>
                )} />
                <FormField control={form.control} name="power2" render={({ field }) => (
                  <FormItem>
                    <FormLabel className="flex items-center gap-2"><Gauge className="h-4 w-4" /> Power 2 (watts)</FormLabel>
                    <FormControl>
                      <Input type="number" step="1" placeholder="e.g., 260" value={field.value ?? ''} onChange={(e)=>field.onChange(e.target.value === '' ? undefined : Number(e.target.value))} />
                    </FormControl>
                    <FormMessage />
                  </FormItem>
                )} />
                <FormField control={form.control} name="duration2" render={({ field }) => (
                  <FormItem>
                    <FormLabel className="flex items-center gap-2"><Calendar className="h-4 w-4" /> Duration 2 (minutes)</FormLabel>
                    <FormControl>
                      <Input type="number" step="0.1" placeholder="e.g., 18" value={field.value ?? ''} onChange={(e)=>field.onChange(e.target.value === '' ? undefined : Number(e.target.value))} />
                    </FormControl>
                    <FormMessage />
                  </FormItem>
                )} />
              </div>
              <Button type="submit" className="w-full md:w-auto">Calculate Critical Power</Button>
            </form>
          </Form>
        </CardContent>
      </Card>

      {result && (
        <div className="space-y-6">
          <Card>
            <CardHeader>
              <div className="flex items-center gap-4"><Activity className="h-8 w-8 text-primary" /><CardTitle>Critical Power Analysis</CardTitle></div>
              <CardDescription>Overview of your aerobic and anaerobic capabilities</CardDescription>
            </CardHeader>
            <CardContent className="space-y-4">
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div className="p-4 border rounded">
                  <h4 className="text-sm font-semibold text-muted-foreground">Critical Power (CP)</h4>
                  <p className="text-2xl font-bold text-primary">{result.cp.toFixed(1)} W</p>
                </div>
                <div className="p-4 border rounded">
                  <h4 className="text-sm font-semibold text-muted-foreground">W′ (Anaerobic Work Capacity)</h4>
                  <p className="text-2xl font-bold text-primary">{result.wPrime.toFixed(0)} J</p>
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
            <CardHeader><CardTitle className="flex items-center gap-2"><Calendar className="h-5 w-5" /> 8‑Week CP & W′ Training Plan</CardTitle></CardHeader>
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
          <CardDescription>Measure efforts consistently for accurate CP estimates</CardDescription>
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
          <CardDescription>Explore additional performance analytics</CardDescription>
        </CardHeader>
        <CardContent>
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div className="p-4 border rounded">
              <h4 className="font-semibold mb-1"><Link href="/category/health-fitness/power-to-heart-rate-efficiency-calculator" className="text-primary hover:underline">Power-to-Heart Rate Efficiency</Link></h4>
              <p className="text-sm text-muted-foreground">Analyse power and heart rate coupling for training readiness.</p>
            </div>
            <div className="p-4 border rounded">
              <h4 className="font-semibold mb-1"><Link href="/category/health-fitness/anaerobic-capacity-calculator" className="text-primary hover:underline">Anaerobic Capacity</Link></h4>
              <p className="text-sm text-muted-foreground">Estimate high-intensity energy reserves for repeated efforts.</p>
            </div>
            <div className="p-4 border rounded">
              <h4 className="font-semibold mb-1"><Link href="/category/health-fitness/maximal-aerobic-speed-mas-calculator" className="text-primary hover:underline">Maximal Aerobic Speed</Link></h4>
              <p className="text-sm text-muted-foreground">Translate aerobic capacity into running training zones.</p>
            </div>
            <div className="p-4 border rounded">
              <h4 className="font-semibold mb-1"><Link href="/category/health-fitness/oxygen-debt-epoc-calculator" className="text-primary hover:underline">Oxygen Debt (EPOC)</Link></h4>
              <p className="text-sm text-muted-foreground">Understand post-exercise oxygen needs after intense sessions.</p>
            </div>
          </div>
        </CardContent>
      </Card>

      <Card>
        <CardHeader>
          <CardTitle>Complete Guide: Using Critical Power in Training</CardTitle>
        </CardHeader>
        <CardContent className="prose prose-sm dark:prose-invert max-w-none">
          <p>Critical power (CP) helps separate sustainable aerobic output from finite anaerobic capacity (W′). Testing with two maximal efforts enables precise training zone prescription. Use CP for pacing time trials, planning interval intensity, and monitoring long-term progress. Track W′ to gauge anaerobic reserves for surges and sprint finishes. Combine consistent testing, balanced training distribution, and adequate recovery to maximise performance gains.</p>
        </CardContent>
      </Card>

      <Card>
        <CardHeader>
          <CardTitle>Frequently Asked Questions</CardTitle>
          <CardDescription>Detailed, SEO-oriented answers</CardDescription>
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
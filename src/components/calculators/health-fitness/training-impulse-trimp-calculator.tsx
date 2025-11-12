'use client';

import { useState } from 'react';
import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import { z } from 'zod';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Form, FormControl, FormField, FormItem, FormLabel, FormMessage } from '@/components/ui/form';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import Link from 'next/link';
import { Heart, Activity, Calendar } from 'lucide-react';

const formSchema = z.object({
  durationMinutes: z.number().positive().optional(),
  averageHr: z.number().min(40).max(220).optional(),
  restingHr: z.number().min(30).max(120).optional(),
  maxHr: z.number().min(120).max(230).optional(),
  gender: z.enum(['male', 'female']).optional(),
});

type FormValues = z.infer<typeof formSchema>;

type ResultPayload = {
  trimp: number;
  relativeLoad: number;
  interpretation: string;
  recommendations: string[];
  warningSigns: string[];
  plan: { week: number; focus: string }[];
};

const genderFactor = {
  male: 0.64,
  female: 0.86,
};

const understandingInputs = [
  { label: 'Duration (minutes)', description: 'Total session length contributing to cardiovascular load.' },
  { label: 'Average Heart Rate', description: 'Mean heart rate during the session. Ensure your device is properly calibrated.' },
  { label: 'Resting Heart Rate', description: 'Morning resting HR or a consistent baseline measured when fully rested.' },
  { label: 'Maximum Heart Rate', description: 'Measured or estimated HRmax. Accurate values improve TRIMP precision.' },
  { label: 'Gender', description: 'Determines the exponential weighting factor used in the Bannister TRIMP formula.' },
];

const faqs: [string, string][] = [
  ['What is TRIMP?', 'Training Impulse (TRIMP) quantifies workout load using heart rate data. It multiplies duration by relative heart rate and applies an exponential weighting that captures how intensity rises non-linearly.'],
  ['How is TRIMP different from TSS?', 'TRIMP relies on heart rate, while TSS is power- or pace-based. TRIMP can be used when power meters are unavailable or when you want a heart-rate-informed view of internal load.'],
  ['Which TRIMP method does this calculator use?', 'It implements the classic Bannister TRIMP formula using gender-specific exponential weighting factors (0.64 for males, 0.86 for females).'],
  ['Do I need exact resting and max heart rate values?', 'More accurate inputs produce better TRIMP estimates. Measure resting HR over several mornings and test or estimate HRmax using lab or field protocols.'],
  ['What is a good TRIMP score?', 'Short recovery workouts may score below 50 TRIMP, steady endurance sessions 60–120, and intense interval sets 120+. Context (fitness level, goals) determines whether a score is appropriate.'],
  ['Can TRIMP detect overtraining?', 'Use TRIMP trends with other metrics (sleep, mood, HRV). Sudden spikes or consistently high daily TRIMP without rest can signal excessive load and risk of overreaching.'],
  ['How often should I log TRIMP?', 'Logging every session creates a clear picture of cardiovascular stress. Aggregating weekly TRIMP helps plan rest days and monitor training cycles.'],
  ['Is TRIMP useful for multisport athletes?', 'Yes. TRIMP is modality-agnostic—swimming, cycling, running, or rowing can be evaluated as long as heart rate data are available.'],
  ['Why might TRIMP underestimate sprint sessions?', 'Heart rate responds with a lag, so very short, explosive intervals may produce lower TRIMP than perceived effort. Combine TRIMP with session RPE for such workouts.'],
  ['Can medications affect TRIMP?', 'Beta-blockers or heart-rate altering medications can reduce HR response, lowering TRIMP. Adjust interpretation accordingly and consult healthcare professionals.'],
];

const warningSigns = () => [
  'If relative heart rate regularly exceeds 90% of reserve, incorporate recovery days to avoid autonomic fatigue.',
  'Monitor for symptoms such as dizziness, chest discomfort, or unusual shortness of breath—stop training and seek medical advice if they occur.',
  'Consistently high TRIMP combined with elevated resting heart rate can signal insufficient recovery.',
];

const plan = (): { week: number; focus: string }[] => [
  { week: 1, focus: 'Record baseline TRIMP values for typical easy, moderate, and hard sessions.' },
  { week: 2, focus: 'Introduce structured endurance workouts aiming for steady TRIMP accumulation.' },
  { week: 3, focus: 'Add interval training to elevate TRIMP while practicing pacing and recovery strategies.' },
  { week: 4, focus: 'Include a recovery-focused week with TRIMP reduced by ~40% to consolidate adaptations.' },
  { week: 5, focus: 'Resume build phase, targeting incremental TRIMP increases of 5–10% per week.' },
  { week: 6, focus: 'Incorporate sport-specific drills or tempo efforts to increase cardiovascular efficiency.' },
  { week: 7, focus: 'Track morning resting HR and HRV to correlate with TRIMP trends and adjust as needed.' },
  { week: 8, focus: 'Plan taper or maintenance block: lower TRIMP while retaining sharpness with short, intense bursts.' },
];

const recommendations = (trimp: number, relativeLoad: number) => {
  const base = [
    'Hydrate and refuel promptly after high-TRIMP sessions to support cardiovascular recovery.',
    'Pair TRIMP tracking with subjective metrics (RPE, mood) for a complete training picture.',
    'Reevaluate HR zones quarterly to keep heart-rate based training accurate.',
  ];

  if (relativeLoad < 0.4) {
    return [
      ...base,
      'If this was meant to be a key workout, increase intensity or duration slightly next time.',
      'Focus on technique and aerobic base before progressing to harder sessions.',
    ];
  }

  if (trimp < 120) {
    return [
      ...base,
      'Alternate moderate TRIMP days with lighter recovery sessions to prevent monotonous load.',
      'Integrate strides or surges to stimulate heart rate without overly extending duration.',
    ];
  }

  return [
    ...base,
    'Schedule at least one low-TRIMP day following this session to allow autonomic recovery.',
    'Monitor resting HR and sleep quality closely after repeated high-TRIMP workouts.',
  ];
};

const interpretTrimp = (trimp: number) => {
  if (trimp < 60) return 'Low Cardiovascular Stress – Recovery or easy endurance focus.';
  if (trimp < 120) return 'Moderate Cardiovascular Stress – Fitness-building workload with manageable recovery.';
  if (trimp < 180) return 'High Cardiovascular Stress – Significant stimulus; plan supportive recovery strategies.';
  return 'Very High Cardiovascular Stress – Demanding session; ensure adequate rest and nutrition afterwards.';
};

const calculateTrimp = (values: FormValues) => {
  if (!values.durationMinutes || !values.averageHr || !values.restingHr || !values.maxHr || !values.gender) return null;
  const hrReserve = values.maxHr - values.restingHr;
  if (hrReserve <= 0) return null;
  const relativeHr = (values.averageHr - values.restingHr) / hrReserve;
  if (relativeHr <= 0) return null;
  const factor = genderFactor[values.gender];
  const trimp = values.durationMinutes * relativeHr * Math.exp(factor * relativeHr);
  return { trimp, relativeLoad: relativeHr };
};

export default function TrainingImpulseTRIMPCalculator() {
  const [result, setResult] = useState<ResultPayload | null>(null);

  const form = useForm<FormValues>({
    resolver: zodResolver(formSchema),
    defaultValues: {
      durationMinutes: undefined,
      averageHr: undefined,
      restingHr: undefined,
      maxHr: undefined,
      gender: 'male',
    },
  });

  const onSubmit = (values: FormValues) => {
    const calc = calculateTrimp(values);
    if (!calc) {
      setResult(null);
      return;
    }
    setResult({
      trimp: calc.trimp,
      relativeLoad: calc.relativeLoad,
      interpretation: interpretTrimp(calc.trimp),
      recommendations: recommendations(calc.trimp, calc.relativeLoad),
      warningSigns: warningSigns(),
      plan: plan(),
    });
  };

  return (
    <div className="space-y-8">
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2"><Heart className="h-5 w-5" /> Training Impulse (TRIMP) Calculator</CardTitle>
          <CardDescription>Quantify heart-rate-based training load using session duration, intensity, and gender-specific weighting.</CardDescription>
        </CardHeader>
        <CardContent>
          <Form {...form}>
            <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-6">
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <FormField control={form.control} name="durationMinutes" render={({ field }) => (
                  <FormItem>
                    <FormLabel>Duration (minutes)</FormLabel>
                    <FormControl>
                      <Input type="number" step="1" placeholder="e.g., 75" value={field.value ?? ''} onChange={(e)=>field.onChange(e.target.value === '' ? undefined : Number(e.target.value))} />
                    </FormControl>
                    <FormMessage />
                  </FormItem>
                )} />
                <FormField control={form.control} name="averageHr" render={({ field }) => (
                  <FormItem>
                    <FormLabel>Average Heart Rate (bpm)</FormLabel>
                    <FormControl>
                      <Input type="number" step="1" placeholder="e.g., 152" value={field.value ?? ''} onChange={(e)=>field.onChange(e.target.value === '' ? undefined : Number(e.target.value))} />
                    </FormControl>
                    <FormMessage />
                  </FormItem>
                )} />
                <FormField control={form.control} name="restingHr" render={({ field }) => (
                  <FormItem>
                    <FormLabel>Resting Heart Rate (bpm)</FormLabel>
                    <FormControl>
                      <Input type="number" step="1" placeholder="e.g., 55" value={field.value ?? ''} onChange={(e)=>field.onChange(e.target.value === '' ? undefined : Number(e.target.value))} />
                    </FormControl>
                    <FormMessage />
                  </FormItem>
                )} />
                <FormField control={form.control} name="maxHr" render={({ field }) => (
                  <FormItem>
                    <FormLabel>Maximum Heart Rate (bpm)</FormLabel>
                    <FormControl>
                      <Input type="number" step="1" placeholder="e.g., 190" value={field.value ?? ''} onChange={(e)=>field.onChange(e.target.value === '' ? undefined : Number(e.target.value))} />
                    </FormControl>
                    <FormMessage />
                  </FormItem>
                )} />
                <FormField control={form.control} name="gender" render={({ field }) => (
                  <FormItem>
                    <FormLabel>Gender</FormLabel>
                    <Select onValueChange={field.onChange} value={field.value}>
                      <FormControl>
                        <SelectTrigger>
                          <SelectValue placeholder="Select gender" />
                        </SelectTrigger>
                      </FormControl>
                      <SelectContent>
                        <SelectItem value="male">Male</SelectItem>
                        <SelectItem value="female">Female</SelectItem>
                      </SelectContent>
                    </Select>
                    <FormMessage />
                  </FormItem>
                )} />
              </div>
              <Button type="submit" className="w-full md:w-auto">Calculate TRIMP</Button>
            </form>
          </Form>
        </CardContent>
      </Card>

      {result && (
        <div className="space-y-6">
          <Card>
            <CardHeader>
              <div className="flex items-center gap-4"><Activity className="h-8 w-8 text-primary" /><CardTitle>TRIMP Summary</CardTitle></div>
              <CardDescription>Heart-rate-based load insights for the session</CardDescription>
            </CardHeader>
            <CardContent className="space-y-4">
              <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                <div className="p-4 border rounded">
                  <h4 className="text-sm font-semibold text-muted-foreground">TRIMP Score</h4>
                  <p className="text-2xl font-bold text-primary">{result.trimp.toFixed(1)}</p>
                </div>
                <div className="p-4 border rounded">
                  <h4 className="text-sm font-semibold text-muted-foreground">Relative HR Load</h4>
                  <p className="text-2xl font-bold text-primary">{(result.relativeLoad * 100).toFixed(0)}%</p>
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
            <CardHeader><CardTitle className="flex items-center gap-2"><Calendar className="h-5 w-5" /> 8‑Week Heart Rate Load Plan</CardTitle></CardHeader>
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
          <CardDescription>Gather dependable heart-rate data for meaningful TRIMP values</CardDescription>
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
          <CardDescription>Integrate TRIMP with other training metrics</CardDescription>
        </CardHeader>
        <CardContent>
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div className="p-4 border rounded">
              <h4 className="font-semibold mb-1"><Link href="/category/health-fitness/training-stress-score-calculator" className="text-primary hover:underline">Training Stress Score (TSS)</Link></h4>
              <p className="text-sm text-muted-foreground">Compare heart-rate load with power or pace-based TSS values.</p>
            </div>
            <div className="p-4 border rounded">
              <h4 className="font-semibold mb-1"><Link href="/category/health-fitness/chronic-training-load-calculator" className="text-primary hover:underline">Chronic Training Load (CTL)</Link></h4>
              <p className="text-sm text-muted-foreground">Feed TRIMP-derived TSS into CTL for long-term planning.</p>
            </div>
            <div className="p-4 border rounded">
              <h4 className="font-semibold mb-1"><Link href="/category/health-fitness/acute-training-load-calculator" className="text-primary hover:underline">Acute Training Load (ATL)</Link></h4>
              <p className="text-sm text-muted-foreground">Monitor short-term fatigue alongside TRIMP scores.</p>
            </div>
            <div className="p-4 border rounded">
              <h4 className="font-semibold mb-1"><Link href="/category/health-fitness/power-to-heart-rate-efficiency-calculator" className="text-primary hover:underline">Power-to-HR Efficiency</Link></h4>
              <p className="text-sm text-muted-foreground">Observe how heart rate efficiency changes as TRIMP varies.</p>
            </div>
          </div>
        </CardContent>
      </Card>

      <Card>
        <CardHeader>
          <CardTitle>Complete Guide: Applying TRIMP in Training</CardTitle>
          <CardDescription>Use heart-rate load to steer endurance development</CardDescription>
        </CardHeader>
        <CardContent className="prose prose-sm dark:prose-invert max-w-none">
          <p>TRIMP reflects the internal strain of a workout. By tracking daily scores, you can identify when cardiovascular load is climbing too quickly, when recovery is required, and how different workout types contribute to fitness. Pair TRIMP with power or pace metrics for a comprehensive view of both internal and external load.</p>
          <p>Keep heart-rate monitors maintained and calibrated, monitor environmental factors (heat, humidity) that affect HR response, and adjust expectations accordingly. Integrating TRIMP with CTL, ATL, and subjective feedback ensures smarter training decisions and long-term consistency.</p>
        </CardContent>
      </Card>

      <Card>
        <CardHeader>
          <CardTitle>Frequently Asked Questions</CardTitle>
          <CardDescription>TRIMP fundamentals and best practices</CardDescription>
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
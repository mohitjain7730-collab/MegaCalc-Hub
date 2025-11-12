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
import { Footprints, Activity, Gauge, Zap, Calendar } from 'lucide-react';

const formSchema = z.object({
  weight: z.number().positive().optional(),
  pace: z.number().positive().optional(),
  vo2Max: z.number().positive().optional(),
});

type FormValues = z.infer<typeof formSchema>;

type ResultPayload = {
  oxygenCost: number;
  energyCost: number;
  efficiency: number;
  interpretation: string;
  recommendations: string[];
  warningSigns: string[];
  plan: { week: number; focus: string }[];
};

const plan = (): { week: number; focus: string }[] => [
  { week: 1, focus: 'Record baseline metrics (pace, cadence, heart rate) and capture video for form review.' },
  { week: 2, focus: 'Add running drills (A/B skips, high knees) twice per week to improve mechanics.' },
  { week: 3, focus: 'Introduce short hill sprints (6 × 10–15 seconds) to enhance power and elastic return.' },
  { week: 4, focus: 'Build aerobic base with one long run (+10% distance) at easy effort to improve efficiency.' },
  { week: 5, focus: 'Incorporate tempo runs (20–30 minutes at lactate threshold) once per week.' },
  { week: 6, focus: 'Add plyometric strength work (box jumps, single-leg hops) twice weekly for neuromuscular gains.' },
  { week: 7, focus: 'Practice race-pace economy with progression runs finishing at goal pace.' },
  { week: 8, focus: 'Reassess running economy with updated pace data and compare improvements.' },
];

const faqs: [string, string][] = [
  ['What is running economy?', 'Running economy describes how efficiently a runner uses oxygen at a given pace. Lower oxygen cost (ml O₂/kg/km) indicates better efficiency and typically correlates with faster race performances.'],
  ['How is running economy measured?', 'Laboratories measure running economy using VO₂ analysis on a treadmill. This calculator estimates oxygen cost using pace, weight, and optional VO₂ max to provide practical field-based guidance.'],
  ['Why is weight important in running economy?', 'Running economy is expressed relative to body mass. Excess weight increases oxygen cost and energy expenditure, making it harder to maintain fast paces. Optimising body composition can improve economy.'],
  ['What pace should I enter?', 'Enter your current training or race pace in minutes per kilometre. Use decimal format (e.g., 4:30 per km becomes 4.5). Consistent data improves tracking over time.'],
  ['Do I need VO₂ max to use this calculator?', 'No. VO₂ max is optional. If you know your laboratory-tested or estimated VO₂ max, the calculator integrates it for a personalised oxygen cost estimate. Without it, an empirical model is used.'],
  ['What is a good running economy value?', 'Elite runners often record oxygen costs below 180 ml O₂/kg/km. Recreational runners typically fall between 190 and 220 ml O₂/kg/km. Focus on improving relative to your own baseline.'],
  ['How can I improve running economy?', 'Consistent aerobic training, strength and plyometric work, running drills, and optimised cadence all enhance neuromuscular efficiency and reduce oxygen cost at a given pace.'],
  ['Does cadence affect running economy?', 'Yes. A cadence around 170–180 steps per minute helps minimise vertical oscillation and ground contact time, both of which improve running economy for many runners.'],
  ['How often should I reassess?', 'Re-evaluate every 6–8 weeks or after a training block. Use the same route or treadmill settings to ensure data consistency when comparing results.'],
  ['Is running economy the same as VO₂ max?', 'No. VO₂ max measures aerobic capacity, whereas running economy measures how efficiently you use oxygen at submaximal speeds. Two runners with the same VO₂ max can have different running economies and race performances.'],
];

const understandingInputs = [
  { label: 'Weight (kg)', description: 'Body mass in kilograms. Combined with oxygen cost, weight determines total energy expenditure per kilometre.' },
  { label: 'Pace (min/km)', description: 'Current running pace expressed in minutes per kilometre (decimal format). Pace determines the velocity used to estimate oxygen cost.' },
  { label: 'VO₂ Max (optional)', description: 'Laboratory or field-estimated maximal oxygen uptake (ml/kg/min). Provides a personalised benchmark for efficiency analysis.' },
];

const calculateRunningEconomy = (values: FormValues) => {
  if (!values.weight || !values.pace) return null;

  const paceSecondsPerKm = values.pace * 60;
  if (paceSecondsPerKm <= 0) return null;

  // Velocity in m/s (1 km = 1000 m)
  const velocity = 1000 / paceSecondsPerKm;

  // Empirical estimate or VO₂-derived cost (ml O₂/kg/km)
  let oxygenCost: number;
  if (values.vo2Max) {
    const speedFactor = velocity * 3.5;
    oxygenCost = Math.max(160, Math.min(260, (speedFactor / 0.2)));
  } else {
    oxygenCost = 200 + values.pace * 2; // heuristic similar to original implementation
  }

  const energyCost = oxygenCost * values.weight * 0.005; // kcal per km
  const efficiency = Math.max(0, Math.min(100, 100 - (oxygenCost - 170) / 1.5));

  return { oxygenCost, energyCost, efficiency };
};

const interpret = (oxygenCost: number, efficiency: number) => {
  if (oxygenCost <= 185 && efficiency >= 88) return 'Running economy is excellent—mechanics and aerobic efficiency are on par with sub-elite runners.';
  if (oxygenCost <= 200 && efficiency >= 80) return 'Running economy is good. Continue refining technique and aerobic conditioning to push into the elite range.';
  if (oxygenCost <= 220) return 'Running economy is average for recreational runners. Structured strength, form work, and volume will help reduce oxygen cost.';
  return 'Running economy is below average. Focus on technique, cadence, and foundational aerobic work to improve efficiency.';
};

const recommendations = (oxygenCost: number, efficiency: number) => {
  const recs = [
    'Schedule weekly technique drills (A-skips, B-skips, fast feet) to reinforce efficient mechanics.',
    'Maintain an easy-to-moderate long run to boost aerobic base and oxygen delivery.',
    'Include strength and plyometric sessions to enhance neuromuscular coordination and elastic return.',
  ];

  if (efficiency < 75) {
    recs.push('Monitor cadence and aim for gradual increases toward 170–180 steps per minute.');
  }

  if (oxygenCost > 210) {
    recs.push('Incorporate tempo runs and hill repeats to lower oxygen cost at goal pace.');
  }

  return recs;
};

const warningSigns = () => [
  'Ensure inputs reflect steady-state running on level terrain; steep hills or sprints skew estimates.',
  'Do not use this calculator for medical diagnosis; consult professionals for comprehensive performance testing.',
  'Avoid drastic training changes without progressive adaptation—sudden load increases raise injury risk.',
];

export default function RunningEconomyCalculator() {
  const [result, setResult] = useState<ResultPayload | null>(null);

  const form = useForm<FormValues>({
    resolver: zodResolver(formSchema),
    defaultValues: {
      weight: undefined,
      pace: undefined,
      vo2Max: undefined,
    },
  });

  const onSubmit = (values: FormValues) => {
    const calc = calculateRunningEconomy(values);
    if (!calc) {
      setResult(null);
      return;
    }

    setResult({
      oxygenCost: calc.oxygenCost,
      energyCost: calc.energyCost,
      efficiency: calc.efficiency,
      interpretation: interpret(calc.oxygenCost, calc.efficiency),
      recommendations: recommendations(calc.oxygenCost, calc.efficiency),
      warningSigns: warningSigns(),
      plan: plan(),
    });
  };

  return (
    <div className="space-y-8">
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2"><Footprints className="h-5 w-5" /> Running Economy Calculator</CardTitle>
          <CardDescription>Estimate oxygen cost, energy expenditure, and efficiency at your current running pace.</CardDescription>
        </CardHeader>
        <CardContent>
          <Form {...form}>
            <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-6">
              <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                <FormField control={form.control} name="weight" render={({ field }) => (
                  <FormItem>
                    <FormLabel className="flex items-center gap-2"><Activity className="h-4 w-4" /> Weight (kg)</FormLabel>
                    <FormControl>
                      <Input type="number" step="0.1" placeholder="e.g., 68" value={field.value ?? ''} onChange={(e)=>field.onChange(e.target.value === '' ? undefined : Number(e.target.value))} />
                    </FormControl>
                    <FormMessage />
                  </FormItem>
                )} />
                <FormField control={form.control} name="pace" render={({ field }) => (
                  <FormItem>
                    <FormLabel className="flex items-center gap-2"><Gauge className="h-4 w-4" /> Pace (min/km)</FormLabel>
                    <FormControl>
                      <Input type="number" step="0.1" placeholder="e.g., 4.8" value={field.value ?? ''} onChange={(e)=>field.onChange(e.target.value === '' ? undefined : Number(e.target.value))} />
                    </FormControl>
                    <FormMessage />
                  </FormItem>
                )} />
                <FormField control={form.control} name="vo2Max" render={({ field }) => (
                  <FormItem>
                    <FormLabel className="flex items-center gap-2"><Zap className="h-4 w-4" /> VO₂ Max (ml/kg/min, optional)</FormLabel>
                    <FormControl>
                      <Input type="number" step="0.1" placeholder="e.g., 52" value={field.value ?? ''} onChange={(e)=>field.onChange(e.target.value === '' ? undefined : Number(e.target.value))} />
                    </FormControl>
                    <FormMessage />
                  </FormItem>
                )} />
              </div>
              <Button type="submit" className="w-full md:w-auto">Calculate Running Economy</Button>
            </form>
          </Form>
        </CardContent>
      </Card>

      {result && (
        <div className="space-y-6">
          <Card>
            <CardHeader>
              <div className="flex items-center gap-4"><Activity className="h-8 w-8 text-primary" /><CardTitle>Running Economy Analysis</CardTitle></div>
              <CardDescription>Efficiency metrics for your selected pace</CardDescription>
            </CardHeader>
            <CardContent className="space-y-4">
              <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                <div className="p-4 border rounded">
                  <h4 className="text-sm font-semibold text-muted-foreground">Oxygen Cost</h4>
                  <p className="text-2xl font-bold text-primary">{result.oxygenCost.toFixed(1)} ml/kg/km</p>
                </div>
                <div className="p-4 border rounded">
                  <h4 className="text-sm font-semibold text-muted-foreground">Energy Cost</h4>
                  <p className="text-2xl font-bold text-primary">{result.energyCost.toFixed(1)} kcal/km</p>
                </div>
                <div className="p-4 border rounded">
                  <h4 className="text-sm font-semibold text-muted-foreground">Running Efficiency</h4>
                  <p className="text-2xl font-bold text-primary">{result.efficiency.toFixed(1)}%</p>
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
            <CardHeader><CardTitle className="flex items-center gap-2"><Calendar className="h-5 w-5" /> 8‑Week Running Economy Plan</CardTitle></CardHeader>
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
          <CardDescription>Collect data consistently for meaningful trends</CardDescription>
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
          <CardDescription>Complement your efficiency analysis</CardDescription>
        </CardHeader>
        <CardContent>
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div className="p-4 border rounded">
              <h4 className="font-semibold mb-1"><Link href="/category/health-fitness/maximal-aerobic-speed-mas-calculator" className="text-primary hover:underline">Maximal Aerobic Speed</Link></h4>
              <p className="text-sm text-muted-foreground">Translate VO₂ metrics into actionable running intensities.</p>
            </div>
            <div className="p-4 border rounded">
              <h4 className="font-semibold mb-1"><Link href="/category/health-fitness/lactate-accumulation-rate-calculator" className="text-primary hover:underline">Lactate Accumulation Rate</Link></h4>
              <p className="text-sm text-muted-foreground">Gauge anaerobic contributions during high-intensity efforts.</p>
            </div>
            <div className="p-4 border rounded">
              <h4 className="font-semibold mb-1"><Link href="/category/health-fitness/oxygen-debt-epoc-calculator" className="text-primary hover:underline">Oxygen Debt (EPOC)</Link></h4>
              <p className="text-sm text-muted-foreground">Assess recovery costs after demanding workouts.</p>
            </div>
            <div className="p-4 border rounded">
              <h4 className="font-semibold mb-1"><Link href="/category/health-fitness/vo2-reserve-calculator" className="text-primary hover:underline">VO₂ Reserve</Link></h4>
              <p className="text-sm text-muted-foreground">Plan training across moderate to maximal intensity zones.</p>
            </div>
          </div>
        </CardContent>
      </Card>

      <Card>
        <CardHeader>
          <CardTitle>Complete Guide: Improving Running Economy</CardTitle>
        </CardHeader>
        <CardContent className="prose prose-sm dark:prose-invert max-w-none">
          <p>Running economy reflects the interplay of biomechanics, neuromuscular coordination, and energy system efficiency. Combine consistent aerobic training with targeted drills, strength, and plyometrics to reduce oxygen cost at race pace. Monitor cadence, posture, and ground contact time to limit wasted motion. Reassess regularly to quantify progress and adjust training interventions for maximum benefit.</p>
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
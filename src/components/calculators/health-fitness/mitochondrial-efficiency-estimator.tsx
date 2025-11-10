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
import { Zap, Gauge, Activity, Battery, Calendar } from 'lucide-react';

const formSchema = z.object({
  vo2AtSubmax: z.number().min(500).max(8000).optional(),
  powerOutput: z.number().min(20).max(600).optional(),
});

type FormValues = z.infer<typeof formSchema>;

type PlanStep = { week: number; focus: string };

type ResultPayload = {
  status: string;
  interpretation: string;
  recommendations: string[];
  warningSigns: string[];
  plan: PlanStep[];
  o2CostPerWatt: number;
  efficiencyScore: number;
};

const plan = (): PlanStep[] => [
  { week: 1, focus: 'Record baseline VO₂ and submaximal power outputs during familiar workouts' },
  { week: 2, focus: 'Implement two additional low-intensity aerobic sessions to build mitochondrial density' },
  { week: 3, focus: 'Add one tempo or sweet-spot workout to refine submax efficiency' },
  { week: 4, focus: 'Evaluate cadence/technique and adjust equipment fit to reduce wasted motion' },
  { week: 5, focus: 'Incorporate strength work to support neuromuscular efficiency and power production' },
  { week: 6, focus: 'Track sleep, nutrition, and iron status to ensure mitochondrial support' },
  { week: 7, focus: 'Retest VO₂ at the same workload; compare oxygen cost per watt' },
  { week: 8, focus: 'Adjust training blocks and recovery based on improvements or plateaus' },
];

const faqs: [string, string][] = [
  ['What is mitochondrial efficiency?', 'Mitochondrial efficiency refers to how much oxygen your body consumes to produce a given amount of mechanical power. Lower oxygen cost per watt indicates better efficiency and endurance performance.'],
  ['How do I measure VO₂ at a submaximal workload?', 'Use a metabolic cart during an incremental test, or estimate using wearable sensors that report VO₂ at a specific steady-state workload. Ensure pacing and equipment are consistent between tests.'],
  ['Why does efficiency matter for endurance athletes?', 'Improved efficiency means you can produce more power with less oxygen, delaying fatigue and improving performance in cycling, running, rowing, and other aerobic sports.'],
  ['Can strength training improve mitochondrial efficiency?', 'Yes. Strength work enhances neuromuscular coordination and reduces the oxygen cost of producing force, especially when combined with aerobic base training.'],
  ['How often should I test?', 'Every 6–8 weeks is sufficient for most athletes. Testing too frequently can introduce fatigue and variability, while longer gaps may miss training adaptations.'],
  ['Does diet influence mitochondrial efficiency?', 'Adequate calories, protein, omega-3 fats, and micronutrients such as iron, B vitamins, and magnesium support mitochondrial function. Overly restrictive diets can impair energy production.'],
  ['What if my efficiency worsens?', 'Check for accumulated fatigue, inadequate recovery, illness, or inconsistencies in testing protocol. Adjust training load and revisit recovery habits before retesting.'],
  ['How does cadence or technique affect efficiency?', 'Poor movement economy (e.g., low cadence, inefficient stride) increases oxygen cost. Technique drills, bike/rower fit, and running form work can meaningfully improve efficiency.'],
  ['Is a higher VO₂ max always better?', 'VO₂ max indicates capacity, but efficiency determines how well you use that capacity at race intensities. Improving both VO₂ max and efficiency yields the best endurance performance.'],
  ['Can I use this calculator without lab equipment?', 'Yes, if you have reliable estimates of VO₂ and power from smart trainers, wearables, or field testing. The results remain an approximation but still help track trends over time.'],
];

const interpret = (o2Cost: number) => {
  if (o2Cost < 10) return 'Excellent efficiency—oxygen cost per watt is very low compared with trained endurance athletes.';
  if (o2Cost < 13) return 'Good efficiency—continue structured aerobic and tempo training to refine economy.';
  if (o2Cost < 16) return 'Moderate efficiency—opportunity to improve base fitness, technique, and fueling strategies.';
  return 'High oxygen cost—prioritize aerobic base, movement economy, and recovery practices.';
};

const recommendations = (o2Cost: number) => [
  'Maintain at least 2–3 low-intensity aerobic sessions each week to support mitochondrial density',
  'Schedule weekly tempo or sweet-spot workouts to enhance submaximal efficiency',
  o2Cost > 13
    ? 'Incorporate technique drills and cadence work; small mechanical gains reduce oxygen cost'
    : 'Continue pairing endurance work with strength training to preserve power output',
];

const warningSigns = () => [
  'Sudden drops in efficiency may indicate illness, anemia, or overtraining—consult a clinician if symptoms persist',
  'Inconsistent testing protocols (different equipment, pacing, or environmental conditions) can skew results',
  'Chronically high oxygen cost with declining performance warrants professional evaluation of training load and nutrition',
];

export default function MitochondrialEfficiencyEstimator() {
  const [result, setResult] = useState<ResultPayload | null>(null);
  const form = useForm<FormValues>({
    resolver: zodResolver(formSchema),
    defaultValues: {
      vo2AtSubmax: undefined,
      powerOutput: undefined,
    },
  });

  const onSubmit = (values: FormValues) => {
    const { vo2AtSubmax, powerOutput } = values;
    if (vo2AtSubmax == null || powerOutput == null) {
      setResult(null);
      return;
    }

    const o2CostPerWatt = vo2AtSubmax / powerOutput; // ml/min per watt
    const efficiencyScore = Math.round((1000 / o2CostPerWatt) * 10) / 10; // higher is better (arbitrary scale)

    setResult({
      status: 'Calculated',
      interpretation: interpret(o2CostPerWatt),
      recommendations: recommendations(o2CostPerWatt),
      warningSigns: warningSigns(),
      plan: plan(),
      o2CostPerWatt: Math.round(o2CostPerWatt * 10) / 10,
      efficiencyScore,
    });
  };

  return (
    <div className="space-y-8">
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2"><Gauge className="h-5 w-5" /> Mitochondrial Efficiency Estimator</CardTitle>
          <CardDescription>Estimate oxygen cost per watt at a steady-state workload</CardDescription>
        </CardHeader>
        <CardContent>
          <Form {...form}>
            <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-6">
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <FormField
                  control={form.control}
                  name="vo2AtSubmax"
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel className="flex items-center gap-2"><Activity className="h-4 w-4" /> VO₂ at Submax (ml/min)</FormLabel>
                      <FormControl>
                        <Input
                          type="number"
                          step="10"
                          placeholder="e.g., 2200"
                          value={field.value ?? ''}
                          onChange={(e) => field.onChange(e.target.value === '' ? undefined : Number(e.target.value))}
                        />
                      </FormControl>
                      <FormMessage />
                    </FormItem>
                  )}
                />
                <FormField
                  control={form.control}
                  name="powerOutput"
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel className="flex items-center gap-2"><Battery className="h-4 w-4" /> Power Output (watts)</FormLabel>
                      <FormControl>
                        <Input
                          type="number"
                          step="1"
                          placeholder="e.g., 200"
                          value={field.value ?? ''}
                          onChange={(e) => field.onChange(e.target.value === '' ? undefined : Number(e.target.value))}
                        />
                      </FormControl>
                      <FormMessage />
                    </FormItem>
                  )}
                />
              </div>
              <Button type="submit" className="w-full md:w-auto">Estimate Efficiency</Button>
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
                <CardTitle>Efficiency Summary</CardTitle>
              </div>
              <CardDescription>Lower oxygen cost per watt indicates greater mitochondrial efficiency</CardDescription>
            </CardHeader>
            <CardContent className="space-y-4">
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div className="p-4 border rounded">
                  <h4 className="font-semibold text-sm text-muted-foreground">O₂ Cost per Watt</h4>
                  <p className="text-2xl font-bold text-primary">{result.o2CostPerWatt} ml/min/W</p>
                </div>
                <div className="p-4 border rounded">
                  <h4 className="font-semibold text-sm text-muted-foreground">Efficiency Index</h4>
                  <p className="text-2xl font-bold text-primary">{result.efficiencyScore}</p>
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
            <CardHeader>
              <CardTitle className="flex items-center gap-2"><Calendar className="h-5 w-5" /> 8-Week Aerobic Efficiency Plan</CardTitle>
            </CardHeader>
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
                    {result.plan.map((step) => (
                      <tr key={step.week} className="border-b">
                        <td className="p-2">{step.week}</td>
                        <td className="p-2">{step.focus}</td>
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
          <CardTitle>Related Calculators</CardTitle>
          <CardDescription>Endurance & energy system planning</CardDescription>
        </CardHeader>
        <CardContent>
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div className="p-4 border rounded"><h4 className="font-semibold mb-1"><Link href="/category/health-fitness/vo2-max-calculator" className="text-primary hover:underline">VO₂ Max Calculator</Link></h4><p className="text-sm text-muted-foreground">Track maximal oxygen uptake alongside efficiency.</p></div>
            <div className="p-4 border rounded"><h4 className="font-semibold mb-1"><Link href="/category/health-fitness/running-economy-calculator" className="text-primary hover:underline">Running Economy Calculator</Link></h4><p className="text-sm text-muted-foreground">Evaluate stride efficiency for runners.</p></div>
            <div className="p-4 border rounded"><h4 className="font-semibold mb-1"><Link href="/category/health-fitness/critical-power-calculator" className="text-primary hover:underline">Critical Power Calculator</Link></h4><p className="text-sm text-muted-foreground">Set training zones based on power-duration curves.</p></div>
            <div className="p-4 border rounded"><h4 className="font-semibold mb-1"><Link href="/category/health-fitness/intermittent-fasting-calculator" className="text-primary hover:underline">Intermittent Fasting Calculator</Link></h4><p className="text-sm text-muted-foreground">Coordinate fueling strategies with endurance training.</p></div>
          </div>
        </CardContent>
      </Card>

      <Card>
        <CardHeader><CardTitle>Complete Guide: Improving Mitochondrial Efficiency</CardTitle></CardHeader>
        <CardContent className="prose prose-sm dark:prose-invert max-w-none">
          <p>Mitochondrial efficiency improves when consistent aerobic training, strength work, quality nutrition, and adequate recovery converge. Track oxygen cost, heart rate, and perceived exertion at standardized workloads to monitor progress.</p>
          <p>Periodize training with base, build, and recovery phases. Support mitochondria with sleep, stress management, and micronutrients, and retest periodically to quantify adaptation.</p>
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



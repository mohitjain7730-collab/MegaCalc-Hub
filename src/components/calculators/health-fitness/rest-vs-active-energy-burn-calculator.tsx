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
import { Zap, Timer, Activity, Gauge, Calendar } from 'lucide-react';

const formSchema = z.object({
  restingMetabolicRate: z.number().min(800).max(4000).optional(),
  bodyWeightKg: z.number().min(30).max(200).optional(),
  metValue: z.number().min(1).max(20).optional(),
  durationMinutes: z.number().min(5).max(600).optional(),
});

type FormValues = z.infer<typeof formSchema>;

type ResultPayload = {
  status: string;
  interpretation: string;
  recommendations: string[];
  warningSigns: string[];
  plan: { week: number; focus: string }[];
  restCalories: number;
  activeCalories: number;
  deltaCalories: number;
};

const plan = (): { week: number; focus: string }[] => [
  { week: 1, focus: 'Record daily activity, steps, and exercise intensity to establish a baseline' },
  { week: 2, focus: 'Add one interval or tempo workout to raise MET output once per week' },
  { week: 3, focus: 'Incorporate low-intensity movement (walking meetings, mobility) on rest days' },
  { week: 4, focus: 'Assess recovery metrics (sleep, soreness) and adjust training volume accordingly' },
  { week: 5, focus: 'Increase resistance training load to build muscle and elevate resting expenditure' },
  { week: 6, focus: 'Experiment with active commuting or standing breaks to boost NEAT' },
  { week: 7, focus: 'Recalculate energy burn using updated weight or RMR measurements' },
  { week: 8, focus: 'Set long-term training cycles balancing performance, recovery, and calorie targets' },
];

const faqs: [string, string][] = [
  ['What does MET mean?', 'MET stands for Metabolic Equivalent of Task. 1 MET equals resting energy use. Higher MET values represent more demanding activities.'],
  ['How do I find the MET value of an activity?', 'Use MET tables from exercise physiology resources or wearable data. For example, brisk walking is ~4 METs, while running at 8 km/h is ~8 METs.'],
  ['Why compare rest vs active calories?', 'Knowing the difference shows how much additional energy a workout requires compared with simply resting, helping with calorie budgeting and training decisions.'],
  ['Does body weight affect energy burn?', 'Yes. Heavier individuals expend more calories for the same MET value and duration because more energy is needed to move mass.'],
  ['How accurate are these estimates?', 'MET-based calculations provide reasonable estimates but do not account for individual metabolism, environment, or technique. Use them as guides and compare with wearable data.'],
  ['Should I use measured RMR or calculated?', 'Measured RMR from indirect calorimetry is most accurate, but reliable calculator estimates are acceptable for planning if measurements are unavailable.'],
  ['Can I improve the calorie gap?', 'Increase workout intensity, duration, or frequency while also elevating NEAT (non-exercise movement). Resistance training can raise resting expenditure over time.'],
  ['Why is rest calorie burn important?', 'Resting energy shows the baseline cost of simply existing. Comparing it with activity calories helps you quantify the true incremental benefit of workouts.'],
  ['How long should sessions be?', 'Balance duration and intensity with recovery ability. Longer sessions burn more, but shorter high-intensity workouts can achieve similar deltas in less time.'],
  ['Is this tool for athletes only?', 'No. It suits anyone tracking energy balance—from weight-loss seekers to endurance athletes determining fuel needs.'],
];

const understandingInputs = [
  { label: 'RMR (kcal/day)', description: 'Your resting metabolic rate. Use lab data or a reliable calculator.' },
  { label: 'Body Weight (kg)', description: 'Current body mass used in the MET calorie formula.' },
  { label: 'Activity MET', description: 'Metabolic equivalent for the activity. Higher numbers mean higher intensity.' },
  { label: 'Duration (minutes)', description: 'Length of the activity session you want to evaluate.' },
];

const calculateBurn = ({ restingMetabolicRate, bodyWeightKg, metValue, durationMinutes }: Required<FormValues>) => {
  const restCaloriesPerMinute = restingMetabolicRate / 1440; // minutes per day
  const restCalories = restCaloriesPerMinute * durationMinutes;
  const activeCaloriesPerMinute = (metValue * 3.5 * bodyWeightKg) / 200;
  const activeCalories = activeCaloriesPerMinute * durationMinutes;
  const delta = activeCalories - restCalories;
  return {
    restCalories,
    activeCalories,
    delta,
  };
};

const interpret = (delta: number) => {
  if (delta >= 400) return 'This is a high-energy session with substantial calorie expenditure above rest. Ensure fueling and recovery match the training load.';
  if (delta >= 150) return 'Moderate calorie gap—ideal for improving fitness while balancing recovery.';
  return 'Incremental calorie burn is modest. Combine with additional activity or NEAT if your goal is higher daily expenditure.';
};

const recommendations = (delta: number) => [
  delta < 150
    ? 'Increase intensity or duration, or add intervals to boost energy burn when appropriate'
    : 'Prioritize protein and carbohydrates post-workout to support recovery and adaptation',
  'Track weekly training load and adjust rest days to avoid overtraining',
  'Incorporate NEAT strategies (steps, standing, mobility) to elevate baseline activity',
];

const warningSigns = () => [
  'Persistent fatigue, irritability, or declining performance may signal overtraining—scale back or rest',
  'Consult a healthcare professional before initiating high-intensity exercise if you have cardiovascular risk factors',
  'Hydrate adequately; dehydration reduces performance and increases cardiovascular strain',
];

export default function RestVsActiveEnergyBurnCalculator() {
  const [result, setResult] = useState<ResultPayload | null>(null);
  const form = useForm<FormValues>({
    resolver: zodResolver(formSchema),
    defaultValues: {
      restingMetabolicRate: undefined,
      bodyWeightKg: undefined,
      metValue: undefined,
      durationMinutes: undefined,
    },
  });

  const onSubmit = (values: FormValues) => {
    const { restingMetabolicRate, bodyWeightKg, metValue, durationMinutes } = values;
    if (
      restingMetabolicRate == null ||
      bodyWeightKg == null ||
      metValue == null ||
      durationMinutes == null
    ) {
      setResult(null);
      return;
    }

    const { restCalories, activeCalories, delta } = calculateBurn({
      restingMetabolicRate,
      bodyWeightKg,
      metValue,
      durationMinutes,
    });

    setResult({
      status: 'Calculated',
      interpretation: interpret(delta),
      recommendations: recommendations(delta),
      warningSigns: warningSigns(),
      plan: plan(),
      restCalories: Math.round(restCalories),
      activeCalories: Math.round(activeCalories),
      deltaCalories: Math.round(delta),
    });
  };

  return (
    <div className="space-y-8">
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2"><Timer className="h-5 w-5" /> Rest vs Active Energy Burn</CardTitle>
          <CardDescription>Compare resting energy cost to exercise expenditure using MET values.</CardDescription>
        </CardHeader>
        <CardContent>
          <Form {...form}>
            <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-6">
              <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
                <FormField
                  control={form.control}
                  name="restingMetabolicRate"
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel className="flex items-center gap-2"><Gauge className="h-4 w-4" /> RMR (kcal/day)</FormLabel>
                      <FormControl>
                        <Input
                          type="number"
                          step="10"
                          placeholder="e.g., 1600"
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
                  name="bodyWeightKg"
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel className="flex items-center gap-2"><Activity className="h-4 w-4" /> Body Weight (kg)</FormLabel>
                      <FormControl>
                        <Input
                          type="number"
                          step="0.1"
                          placeholder="e.g., 70"
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
                  name="metValue"
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel className="flex items-center gap-2"><Activity className="h-4 w-4" /> Activity MET</FormLabel>
                      <FormControl>
                        <Input
                          type="number"
                          step="0.1"
                          placeholder="e.g., 8"
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
                  name="durationMinutes"
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel className="flex items-center gap-2"><Timer className="h-4 w-4" /> Duration (minutes)</FormLabel>
                      <FormControl>
                        <Input
                          type="number"
                          step="1"
                          placeholder="e.g., 45"
                          value={field.value ?? ''}
                          onChange={(e) => field.onChange(e.target.value === '' ? undefined : Number(e.target.value))}
                        />
                      </FormControl>
                      <FormMessage />
                    </FormItem>
                  )}
                />
              </div>
              <Button type="submit" className="w-full md:w-auto">Calculate Energy Burn</Button>
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
                <CardTitle>Energy Burn Summary</CardTitle>
              </div>
              <CardDescription>Comparison between resting and active calorie expenditure</CardDescription>
            </CardHeader>
            <CardContent className="space-y-4">
              <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                <div className="p-4 border rounded">
                  <h4 className="font-semibold text-sm text-muted-foreground">Resting Calories (session)</h4>
                  <p className="text-2xl font-bold text-primary">{result.restCalories} kcal</p>
                </div>
                <div className="p-4 border rounded">
                  <h4 className="font-semibold text-sm text-muted-foreground">Active Calories</h4>
                  <p className="text-2xl font-bold text-primary">{result.activeCalories} kcal</p>
                </div>
                <div className="p-4 border rounded">
                  <h4 className="font-semibold text-sm text-muted-foreground">Extra vs Rest</h4>
                  <p className="text-2xl font-bold text-primary">{result.deltaCalories} kcal</p>
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
              <CardTitle className="flex items-center gap-2"><Calendar className="h-5 w-5" /> 8-Week Energy Burn Plan</CardTitle>
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
          <CardTitle>Understanding the Inputs</CardTitle>
          <CardDescription>Clarify the data needed for accurate comparisons</CardDescription>
        </CardHeader>
        <CardContent>
          <ul className="space-y-2">
            {understandingInputs.map((item) => (
              <li key={item.label}>
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
          <CardDescription>Integrate more tools into your training plan</CardDescription>
        </CardHeader>
        <CardContent>
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div className="p-4 border rounded"><h4 className="font-semibold mb-1"><Link href="/category/health-fitness/resting-metabolic-rate-calculator" className="text-primary hover:underline">Resting Metabolic Rate</Link></h4><p className="text-sm text-muted-foreground">Measure or estimate baseline energy use.</p></div>
            <div className="p-4 border rounded"><h4 className="font-semibold mb-1"><Link href="/category/health-fitness/mets-calories-burned-calculator" className="text-primary hover:underline">METs to Calories</Link></h4><p className="text-sm text-muted-foreground">Explore calorie burn across different activities.</p></div>
            <div className="p-4 border rounded"><h4 className="font-semibold mb-1"><Link href="/category/health-fitness/standing-vs-sitting-calorie-burn-calculator" className="text-primary hover:underline">Standing vs Sitting</Link></h4><p className="text-sm text-muted-foreground">Boost daily NEAT with small posture changes.</p></div>
            <div className="p-4 border rounded"><h4 className="font-semibold mb-1"><Link href="/category/health-fitness/non-exercise-activity-thermogenesis-calculator" className="text-primary hover:underline">NEAT Calculator</Link></h4><p className="text-sm text-muted-foreground">Track non-exercise activity contributions.</p></div>
          </div>
        </CardContent>
      </Card>

      <Card>
        <CardHeader><CardTitle>Complete Guide: Balancing Rest and Activity</CardTitle></CardHeader>
        <CardContent className="prose prose-sm dark:prose-invert max-w-none">
          <p>Strategic training balances high-energy sessions with adequate recovery. Use energy comparisons to plan caloric intake, prioritize fueling for intense days, and avoid under-recovery that hampers progress.</p>
          <p>Combine these estimates with wearable data, perceived exertion, and long-term performance trends for the most informed programming decisions.</p>
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

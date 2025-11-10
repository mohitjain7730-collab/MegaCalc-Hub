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
import { Zap, Footprints, Gauge, Timer, Calendar, Activity } from 'lucide-react';

const formSchema = z.object({
  bodyWeightKg: z.number().min(30).max(200).optional(),
  dailySteps: z.number().min(0).max(40000).optional(),
  standingMinutes: z.number().min(0).max(600).optional(),
  lightActivityMinutes: z.number().min(0).max(600).optional(),
});

type FormValues = z.infer<typeof formSchema>;

type NeatBreakdown = {
  stepsCalories: number;
  standingCalories: number;
  lightActivityCalories: number;
};

type ResultPayload = {
  status: string;
  interpretation: string;
  recommendations: string[];
  warningSigns: string[];
  plan: { week: number; focus: string }[];
  totalCalories: number;
  breakdown: NeatBreakdown;
};

const plan = (): { week: number; focus: string }[] => [
  { week: 1, focus: 'Track baseline steps, standing time, and light chores without changing habits' },
  { week: 2, focus: 'Add 1–2 short walking breaks (5–10 minutes) to workdays to raise NEAT gradually' },
  { week: 3, focus: 'Use a standing desk or posture reminders to reduce long sitting blocks' },
  { week: 4, focus: 'Incorporate light chores or mobility sessions during TV or podcast time' },
  { week: 5, focus: 'Schedule active social activities (walk-and-talk meetings, weekend hikes)' },
  { week: 6, focus: 'Improve sleep and stress management to maintain energy for daily movement' },
  { week: 7, focus: 'Set step or movement challenges to keep NEAT engaging' },
  { week: 8, focus: 'Review progress, adjust goals, and align NEAT with ongoing body composition targets' },
];

const faqs: [string, string][] = [
  ['What is NEAT?', 'Non-exercise activity thermogenesis (NEAT) is the energy you burn through daily movement outside of formal workouts—walking, standing, fidgeting, chores, and more.'],
  ['Why is NEAT important?', 'NEAT can vary by hundreds of calories per day between individuals, making it a major driver of energy balance, weight management, and metabolic health.'],
  ['How accurate is this calculator?', 'Calculations use average energy expenditure formulas. Real-world values depend on stride length, pace, muscle efficiency, and environment, so treat results as estimates.'],
  ['Can I increase NEAT without workouts?', 'Yes. Add short walks, use stairs, stand during calls, garden, or perform household chores to raise NEAT without structured exercise.'],
  ['How many calories does standing burn?', 'Standing typically uses 1.5–2.0 METs. That equates to roughly 0.8–1.6 kcal per minute for most adults, depending on weight.'],
  ['Do steps matter more than light chores?', 'Both contribute. Steps often provide the largest share, but consistent standing and chores add small increments that accumulate over time.'],
  ['Will higher NEAT affect appetite?', 'Some people experience modest appetite increases with higher activity. Monitor hunger cues and adjust meal timing to maintain energy without overeating.'],
  ['Does NEAT help prevent weight regain?', 'Yes. Sustaining higher daily movement after weight loss helps keep energy expenditure elevated and supports long-term maintenance.'],
  ['How does desk work affect NEAT?', 'Sedentary jobs can suppress NEAT. Deliberate movement breaks, standing desks, and active commuting offset prolonged sitting.'],
  ['Should I track NEAT daily?', 'Tracking for 1–2 weeks helps build awareness. Over time, focus on consistent habits rather than constant logging.'],
];

const understandingInputs = [
  { label: 'Body weight (kg)', description: 'Used to estimate energy cost for steps, standing, and light activity.' },
  { label: 'Steps per day', description: 'Average daily steps captured from wearables or pedometers.' },
  { label: 'Standing time (minutes)', description: 'Minutes spent standing (not walking) outside of structured exercise.' },
  { label: 'Light activity (minutes)', description: 'Time spent in light chores or casual movement (MET ~2.5), excluding workouts.' },
];

const calculateNeat = ({ bodyWeightKg, dailySteps = 0, standingMinutes = 0, lightActivityMinutes = 0 }: Required<FormValues>): NeatBreakdown & { total: number } => {
  const caloriesPerStep = 0.0005 * bodyWeightKg * 1.036; // approx kcal per step scaled by weight
  const stepsCalories = dailySteps * caloriesPerStep;
  const standingCalories = ((1.5 * 3.5 * bodyWeightKg) / 200) * standingMinutes;
  const lightActivityCalories = ((2.5 * 3.5 * bodyWeightKg) / 200) * lightActivityMinutes;
  const total = stepsCalories + standingCalories + lightActivityCalories;
  return {
    stepsCalories,
    standingCalories,
    lightActivityCalories,
    total,
  };
};

const interpret = (total: number) => {
  if (total >= 500) return 'Excellent NEAT! You are adding significant daily energy expenditure outside the gym. Keep habits sustainable and monitor recovery.';
  if (total >= 250) return 'Solid NEAT contribution. Small additions—extra steps, standing breaks—can push it even higher.';
  return 'NEAT is on the low side. Introduce frequent movement snacks (walks, chores) to elevate daily burn gradually.';
};

const recommendations = (total: number) => [
  total < 250
    ? 'Schedule 3–4 five-minute walking breaks across the day to raise NEAT quickly'
    : 'Maintain active commuting, walking meetings, or standing breaks to keep NEAT consistent',
  'Blend movement with routine tasks—phone calls, emails, or TV time are opportunities to stand or pace',
  'Prioritize supportive footwear and workspace ergonomics to stay comfortable with more standing/walking',
];

const warningSigns = () => [
  'Sudden drops in energy or soreness may mean you increased NEAT too quickly—add movement gradually',
  'Joint discomfort or foot pain warrants supportive shoes or alternating standing and sitting',
  'Consult a healthcare provider if you have mobility limitations or chronic conditions before large increases in daily movement',
];

export default function NeatCalculator() {
  const [result, setResult] = useState<ResultPayload | null>(null);
  const form = useForm<FormValues>({
    resolver: zodResolver(formSchema),
    defaultValues: {
      bodyWeightKg: undefined,
      dailySteps: undefined,
      standingMinutes: undefined,
      lightActivityMinutes: undefined,
    },
  });

  const onSubmit = (values: FormValues) => {
    const { bodyWeightKg, dailySteps, standingMinutes, lightActivityMinutes } = values;
    if (bodyWeightKg == null) {
      setResult(null);
      return;
    }

    const { stepsCalories, standingCalories, lightActivityCalories, total } = calculateNeat({
      bodyWeightKg,
      dailySteps: dailySteps ?? 0,
      standingMinutes: standingMinutes ?? 0,
      lightActivityMinutes: lightActivityMinutes ?? 0,
    });

    setResult({
      status: 'Calculated',
      interpretation: interpret(total),
      recommendations: recommendations(total),
      warningSigns: warningSigns(),
      plan: plan(),
      totalCalories: Math.round(total),
      breakdown: {
        stepsCalories: Math.round(stepsCalories),
        standingCalories: Math.round(standingCalories),
        lightActivityCalories: Math.round(lightActivityCalories),
      },
    });
  };

  return (
    <div className="space-y-8">
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2"><Footprints className="h-5 w-5" /> NEAT (Non-Exercise Activity Thermogenesis)</CardTitle>
          <CardDescription>Estimate daily calories burned from steps, standing, and light activity.</CardDescription>
        </CardHeader>
        <CardContent>
          <Form {...form}>
            <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-6">
              <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
                <FormField
                  control={form.control}
                  name="bodyWeightKg"
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel className="flex items-center gap-2"><Gauge className="h-4 w-4" /> Body Weight (kg)</FormLabel>
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
                  name="dailySteps"
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel className="flex items-center gap-2"><Footprints className="h-4 w-4" /> Steps (per day)</FormLabel>
                      <FormControl>
                        <Input
                          type="number"
                          step="100"
                          placeholder="e.g., 8000"
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
                  name="standingMinutes"
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel className="flex items-center gap-2"><Timer className="h-4 w-4" /> Standing (min)</FormLabel>
                      <FormControl>
                        <Input
                          type="number"
                          step="5"
                          placeholder="e.g., 120"
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
                  name="lightActivityMinutes"
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel className="flex items-center gap-2"><Activity className="h-4 w-4" /> Light Activity (min)</FormLabel>
                      <FormControl>
                        <Input
                          type="number"
                          step="5"
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
              <Button type="submit" className="w-full md:w-auto">Estimate NEAT</Button>
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
                <CardTitle>Daily NEAT Summary</CardTitle>
              </div>
              <CardDescription>Breakdown of calories burned through daily movement</CardDescription>
            </CardHeader>
            <CardContent className="space-y-4">
              <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
                <div className="p-4 border rounded">
                  <h4 className="font-semibold text-sm text-muted-foreground">Total NEAT</h4>
                  <p className="text-2xl font-bold text-primary">{result.totalCalories} kcal/day</p>
                </div>
                <div className="p-4 border rounded">
                  <h4 className="font-semibold text-sm text-muted-foreground">Steps Contribution</h4>
                  <p className="text-2xl font-bold text-primary">{result.breakdown.stepsCalories} kcal</p>
                </div>
                <div className="p-4 border rounded">
                  <h4 className="font-semibold text-sm text-muted-foreground">Standing Contribution</h4>
                  <p className="text-2xl font-bold text-primary">{result.breakdown.standingCalories} kcal</p>
                </div>
                <div className="p-4 border rounded">
                  <h4 className="font-semibold text-sm text-muted-foreground">Light Activity Contribution</h4>
                  <p className="text-2xl font-bold text-primary">{result.breakdown.lightActivityCalories} kcal</p>
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
              <CardTitle className="flex items-center gap-2"><Calendar className="h-5 w-5" /> 8-Week NEAT Habit Plan</CardTitle>
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
          <CardDescription>Know your data before estimating NEAT</CardDescription>
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
          <CardDescription>Extend your daily energy planning</CardDescription>
        </CardHeader>
        <CardContent>
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div className="p-4 border rounded"><h4 className="font-semibold mb-1"><Link href="/category/health-fitness/daily-calorie-needs-calculator" className="text-primary hover:underline">Daily Calorie Needs</Link></h4><p className="text-sm text-muted-foreground">Integrate NEAT estimates into total energy targets.</p></div>
            <div className="p-4 border rounded"><h4 className="font-semibold mb-1"><Link href="/category/health-fitness/standing-vs-sitting-calorie-burn-calculator" className="text-primary hover:underline">Standing vs Sitting Burn</Link></h4><p className="text-sm text-muted-foreground">Quantify posture changes during desk work.</p></div>
            <div className="p-4 border rounded"><h4 className="font-semibold mb-1"><Link href="/category/health-fitness/step-count-to-distance-calculator" className="text-primary hover:underline">Step Count to Distance</Link></h4><p className="text-sm text-muted-foreground">Translate step goals into kilometers or miles.</p></div>
            <div className="p-4 border rounded"><h4 className="font-semibold mb-1"><Link href="/category/health-fitness/habit-streak-tracker-calculator" className="text-primary hover:underline">Habit Streak Tracker</Link></h4><p className="text-sm text-muted-foreground">Build consistency around daily movement habits.</p></div>
          </div>
        </CardContent>
      </Card>

      <Card>
        <CardHeader><CardTitle>Complete Guide: Elevating Daily NEAT</CardTitle></CardHeader>
        <CardContent className="prose prose-sm dark:prose-invert max-w-none">
          <p>NEAT is a powerful lever for long-term weight management and metabolic health. Combine deliberate movement breaks, active hobbies, and ergonomics to sustain higher daily energy use without overwhelming your schedule.</p>
          <p>Monitor progress through step counts, wearables, or mood and energy logs. Adjust gradually—the goal is a lifestyle shift that feels natural, not forced.</p>
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

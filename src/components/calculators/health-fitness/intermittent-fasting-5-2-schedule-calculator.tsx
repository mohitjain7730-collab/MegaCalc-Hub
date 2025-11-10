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
import { Zap, Timer, Flame, Calendar, UtensilsCrossed } from 'lucide-react';

const formSchema = z.object({
  maintenanceKcal: z.number().min(1200).max(4500).optional(),
  fastingDayKcal: z.number().min(200).max(1500).optional(),
});

type FormValues = z.infer<typeof formSchema>;

type PlanStep = { week: number; focus: string };

type DailySchedule = { day: string; calories: number; note: string };

type ResultPayload = {
  status: string;
  interpretation: string;
  recommendations: string[];
  warningSigns: string[];
  plan: PlanStep[];
  weeklyBalance: number;
  schedule: DailySchedule[];
};

const days = ['Monday', 'Tuesday', 'Wednesday', 'Thursday', 'Friday', 'Saturday', 'Sunday'];

const plan = (): PlanStep[] => [
  { week: 1, focus: 'Establish maintenance calories and pick two non-consecutive fasting days (e.g., Mon/Thu)' },
  { week: 2, focus: 'Plan meals ahead—focus on protein, vegetables, and hydration on fasting days' },
  { week: 3, focus: 'Schedule strength or intense training on non-fasting days; keep fasting days low intensity' },
  { week: 4, focus: 'Monitor sleep, cravings, and mood; adjust fasting day calories if energy crashes' },
  { week: 5, focus: 'Add electrolyte support or broths during fasting windows to maintain performance' },
  { week: 6, focus: 'Review progress photos and weight trends; ensure deficits are moderate (0.5–1% bodyweight per week)' },
  { week: 7, focus: 'Introduce diet breaks or higher-calorie days if recovery declines' },
  { week: 8, focus: 'Set maintenance protocol (e.g., 6:1 or 5:2 rotation) and reassess when goals change' },
];

const faqs: [string, string][] = [
  ['What is the 5:2 fasting schedule?', 'The 5:2 approach includes five normal-calorie days and two low-calorie fasting days (typically 400–700 kcal) each week. Fasting days are usually non-consecutive to aid recovery.'],
  ['How much should I eat on fasting days?', 'Many protocols allow 25% of maintenance calories (400–700 kcal). Prioritize lean protein, vegetables, and hydration so you feel satiated while keeping calories low.'],
  ['Can I exercise on fasting days?', 'Light cardio, mobility, or walking is typically fine. Reserve intense strength or endurance sessions for non-fasting days when you have more energy and fuel.'],
  ['Does 5:2 work for weight loss?', 'Yes, if the weekly calorie average creates a moderate deficit. Track progress and adjust fasting day calories or frequency if weight loss stalls.'],
  ['Is 5:2 safe for everyone?', 'People with diabetes, eating disorders, pregnancy, or specific medical conditions should consult healthcare professionals before fasting. Listen to your body and discontinue if negative symptoms occur.'],
  ['Should I skip breakfast or dinner?', 'Choose a meal structure that supports energy and adherence. Many prefer two small meals on fasting days instead of prolonged water fasts.'],
  ['Do I need fasting supplements?', 'Not necessarily. Some benefit from electrolytes, tea, coffee, or broth to manage hunger and hydration. Avoid excessive stimulants that mask fatigue.'],
  ['How long should I follow 5:2?', 'Use it in cycles (6–12 weeks) or alternate with maintenance phases to avoid burnout. Reassess health markers, energy, and goals regularly.'],
  ['Can I adjust the plan to 6:1 or 4:3?', 'Yes. Flex the number of fasting days based on goals and recovery. Ensure weekly calories still align with your desired deficit or maintenance target.'],
  ['What if I overeat after fasting?', 'Plan balanced meals, include protein and fiber, and break the fast slowly. Emotional or binge eating indicates the fasting days may be too aggressive or frequent.'],
];

const interpret = (weeklyBalance: number) => {
  if (weeklyBalance < 0) {
    if (weeklyBalance <= -3500) return 'Large weekly deficit—monitor recovery and consider slightly higher calories on fasting days or more refeeds.';
    return 'Moderate deficit—suitable for gradual fat loss if sustainable.';
  }
  if (weeklyBalance === 0) return 'Maintenance energy balance—useful for metabolic flexibility without weight change.';
  return 'Calorie surplus—adjust fasting day calories or add activity if fat loss is the goal.';
};

const recommendations = (weeklyBalance: number) => [
  'Keep fasting days non-consecutive (e.g., Monday and Thursday) for better recovery',
  'Anchor meals around protein and high-volume vegetables to maintain satiety with minimal calories',
  weeklyBalance < 0
    ? 'Ensure non-fasting days include sufficient nutrients and sleep to support recovery in a deficit'
    : 'If maintenance is desired, balance fasting days with slightly higher non-fasting intake to avoid sluggishness',
];

const warningSigns = () => [
  'Persistent fatigue, dizziness, or disrupted sleep can signal fasting days are too aggressive',
  'Binge eating after fasting indicates the need for higher fasting day calories or fewer fasting days',
  'People with a history of disordered eating should avoid unsupervised fasting protocols',
];

const buildSchedule = (maintenanceKcal: number, fastingDayKcal: number): DailySchedule[] => {
  return days.map((day, index) => {
    const isFasting = index === 1 || index === 4; // default Tue/Fri as fasting; users can adapt as guidance
    return {
      day,
      calories: isFasting ? fastingDayKcal : maintenanceKcal,
      note: isFasting ? 'Fasting Day (~25% of maintenance)' : 'Normal Day (maintenance intake)',
    };
  });
};

export default function IntermittentFastingFiveTwoScheduleCalculator() {
  const [result, setResult] = useState<ResultPayload | null>(null);
  const form = useForm<FormValues>({
    resolver: zodResolver(formSchema),
    defaultValues: {
      maintenanceKcal: undefined,
      fastingDayKcal: undefined,
    },
  });

  const onSubmit = (values: FormValues) => {
    const { maintenanceKcal, fastingDayKcal } = values;
    if (maintenanceKcal == null || fastingDayKcal == null) {
      setResult(null);
      return;
    }

    const normalDaysTotal = maintenanceKcal * 5;
    const fastingDaysTotal = fastingDayKcal * 2;
    const weeklyIntake = normalDaysTotal + fastingDaysTotal;
    const weeklyMaintenance = maintenanceKcal * 7;
    const weeklyBalance = Math.round(weeklyIntake - weeklyMaintenance);

    setResult({
      status: 'Calculated',
      interpretation: interpret(weeklyBalance),
      recommendations: recommendations(weeklyBalance),
      warningSigns: warningSigns(),
      plan: plan(),
      weeklyBalance,
      schedule: buildSchedule(maintenanceKcal, fastingDayKcal),
    });
  };

  return (
    <div className="space-y-8">
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2"><Timer className="h-5 w-5" /> Intermittent Fasting 5:2 Planner</CardTitle>
          <CardDescription>Compare fasting-day calories against weekly maintenance targets</CardDescription>
        </CardHeader>
        <CardContent>
          <Form {...form}>
            <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-6">
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <FormField
                  control={form.control}
                  name="maintenanceKcal"
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel className="flex items-center gap-2"><Flame className="h-4 w-4" /> Maintenance Calories (kcal/day)</FormLabel>
                      <FormControl>
                        <Input
                          type="number"
                          step="10"
                          placeholder="e.g., 2300"
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
                  name="fastingDayKcal"
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel className="flex items-center gap-2"><UtensilsCrossed className="h-4 w-4" /> Fasting Day Calories (kcal)</FormLabel>
                      <FormControl>
                        <Input
                          type="number"
                          step="10"
                          placeholder="e.g., 600"
                          value={field.value ?? ''}
                          onChange={(e) => field.onChange(e.target.value === '' ? undefined : Number(e.target.value))}
                        />
                      </FormControl>
                      <FormMessage />
                    </FormItem>
                  )}
                />
              </div>
              <Button type="submit" className="w-full md:w-auto">Create 5:2 Schedule</Button>
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
                <CardTitle>Weekly Calorie Balance</CardTitle>
              </div>
              <CardDescription>Negative values indicate a deficit; positive values indicate surplus</CardDescription>
            </CardHeader>
            <CardContent className="space-y-2">
              <p className="text-3xl font-bold text-primary">{result.weeklyBalance} kcal / week</p>
              <p className="text-sm text-muted-foreground">{result.interpretation}</p>
            </CardContent>
          </Card>
          <Card>
            <CardHeader>
              <CardTitle>Suggested Weekly Schedule</CardTitle>
              <CardDescription>Adjust fasting days as needed for your lifestyle</CardDescription>
            </CardHeader>
            <CardContent>
              <div className="overflow-x-auto">
                <table className="w-full text-sm">
                  <thead>
                    <tr className="border-b">
                      <th className="text-left p-2">Day</th>
                      <th className="text-left p-2">Planned Calories</th>
                      <th className="text-left p-2">Notes</th>
                    </tr>
                  </thead>
                  <tbody>
                    {result.schedule.map((entry) => (
                      <tr key={entry.day} className="border-b">
                        <td className="p-2">{entry.day}</td>
                        <td className="p-2">{entry.calories}</td>
                        <td className="p-2">{entry.note}</td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
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
              <CardTitle className="flex items-center gap-2"><Calendar className="h-5 w-5" /> 8-Week 5:2 Implementation Plan</CardTitle>
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
          <CardDescription>Align fasting with overall nutrition strategy</CardDescription>
        </CardHeader>
        <CardContent>
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div className="p-4 border rounded"><h4 className="font-semibold mb-1"><Link href="/category/health-fitness/daily-calorie-needs-calculator" className="text-primary hover:underline">Daily Calorie Needs</Link></h4><p className="text-sm text-muted-foreground">Confirm maintenance before planning fasting deficits.</p></div>
            <div className="p-4 border rounded"><h4 className="font-semibold mb-1"><Link href="/category/health-fitness/intermittent-fasting-calculator" className="text-primary hover:underline">Time-Restricted Eating Calculator</Link></h4><p className="text-sm text-muted-foreground">Coordinate 16:8 or OMAD windows with 5:2 structure.</p></div>
            <div className="p-4 border rounded"><h4 className="font-semibold mb-1"><Link href="/category/health-fitness/cheat-meal-impact-on-weekly-calories-calculator" className="text-primary hover:underline">Cheat Meal Impact</Link></h4><p className="text-sm text-muted-foreground">Balance social meals with planned fasting deficits.</p></div>
            <div className="p-4 border rounded"><h4 className="font-semibold mb-1"><Link href="/category/health-fitness/hydration-needs-calculator" className="text-primary hover:underline">Hydration Needs</Link></h4><p className="text-sm text-muted-foreground">Set water and electrolyte targets to support fasting days.</p></div>
          </div>
        </CardContent>
      </Card>

      <Card>
        <CardHeader><CardTitle>Complete Guide: Thriving on 5:2 Intermittent Fasting</CardTitle></CardHeader>
        <CardContent className="prose prose-sm dark:prose-invert max-w-none">
          <p>The 5:2 method provides structured flexibility—two controlled-calorie days create a weekly deficit while maintaining higher energy on training days. Success relies on nutrient-dense meals, adequate protein, hydration, and sleep.</p>
          <p>Cycle fasting protocols with maintenance periods, adjust for athletic demands, and monitor biofeedback. Personalized experimentation keeps fasting sustainable rather than restrictive.</p>
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



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
import { Zap, Repeat, Flame, BarChart3, UtensilsCrossed, Calendar } from 'lucide-react';

const formSchema = z.object({
  maintenanceKcal: z.number().min(1200).max(6000).optional(),
  proteinGPerKg: z.number().min(1).max(3).optional(),
  bodyMassKg: z.number().min(35).max(200).optional(),
  lowCarbPct: z.number().min(10).max(45).optional(),
  highCarbPct: z.number().min(40).max(75).optional(),
});

type FormValues = z.infer<typeof formSchema>;

type DayMacros = {
  label: string;
  kcal: number;
  proteinG: number;
  carbsG: number;
  fatG: number;
};

type PlanStep = { week: number; focus: string };

type ResultPayload = {
  status: string;
  interpretation: string;
  recommendations: string[];
  warningSigns: string[];
  plan: PlanStep[];
  lowDay: DayMacros;
  highDay: DayMacros;
};

const computeDay = (label: string, targetKcal: number, proteinG: number, carbPct: number): DayMacros => {
  const carbKcal = targetKcal * (carbPct / 100);
  const carbsG = carbKcal / 4;
  const proteinKcal = proteinG * 4;
  const fatKcal = Math.max(0, targetKcal - carbKcal - proteinKcal);
  const fatG = fatKcal / 9;

  return {
    label,
    kcal: Math.round(targetKcal),
    proteinG: Math.round(proteinG),
    carbsG: Math.round(carbsG),
    fatG: Math.round(fatG),
  };
};

const interpret = (low: DayMacros, high: DayMacros) => {
  const carbSwing = Math.max(high.carbsG - low.carbsG, 0);
  if (carbSwing >= 200) return 'Aggressive carb swing: align high days with heavy lifting and ensure digestion supports the jump.';
  if (carbSwing >= 120) return 'Balanced cycling: expect noticeable training fuel on high days with leaner recovery on low days.';
  return 'Mild cycling: useful for consistency without large swings—monitor body composition and energy.';
};

const buildRecommendations = (low: DayMacros, high: DayMacros) => [
  'Plan high-carb days on the hardest training sessions for glycogen replenishment',
  'Keep protein steady daily; adjust fats to fit calories once carbs are set',
  `Aim for at least ${Math.max(low.fatG, 45)} g of fat on low days to support hormones and satiety`,
];

const buildWarnings = () => [
  'Very low fat intakes (<40 g) can impair hormone production—avoid extreme cuts',
  'Large carb swings may disrupt digestion; add fiber and micronutrients from vegetables on all days',
  'Monitor scale weight and training performance weekly; adjust if recovery or mood suffers',
];

const plan = (): PlanStep[] => [
  { week: 1, focus: 'Calculate maintenance calories and baseline macro targets' },
  { week: 2, focus: 'Introduce low/high days with modest 10% calorie swing' },
  { week: 3, focus: 'Stack high-carb days next to heavy resistance training' },
  { week: 4, focus: 'Review digestion, sleep, and energy across each day type' },
  { week: 5, focus: 'Increase or decrease carb swing by ~10% based on recovery' },
  { week: 6, focus: 'Adjust fats to keep hormones and satiety stable on low days' },
  { week: 7, focus: 'Evaluate progress photos and performance PRs; tweak as needed' },
  { week: 8, focus: 'Set long-term cadence (e.g., 2 high, 3 moderate, 2 low days)' },
];

const faqs: [string, string][] = [
  ['What is carb cycling?', 'Carb cycling alternates higher- and lower-carbohydrate days throughout the week to better match energy intake with training demands, aid body composition changes, and manage hunger or adherence.'],
  ['How many high-carb days should I have?', 'Most lifters use 2–3 high-carb days placed near their most demanding sessions. Endurance athletes may need more. Beginners can start with one or two and track recovery before adding more.'],
  ['Do I keep protein the same every day?', 'Yes. Protein is typically held constant to support muscle repair, immune health, and satiety. Only carbs and fats usually fluctuate between high and low days.'],
  ['How low should fat go on high-carb days?', 'Keep dietary fat above ~40–50 g daily for hormone support. When increasing carbs, reduce fat moderately but do not eliminate it entirely.'],
  ['Can carb cycling help with fat loss?', 'It can support fat loss by creating a weekly calorie deficit while boosting training performance on select days. Results still depend on overall weekly calorie balance and adherence.'],
  ['Is carb cycling suitable for beginners?', 'Beginners often do well with consistent macros first. Carb cycling is best introduced after you have tracked your intake reliably and understand your maintenance calories.'],
  ['What foods should I emphasize on high-carb days?', 'Choose easily digestible carbs such as rice, potatoes, oats, fruit, and whole grains. Pair them with lean protein sources and vegetables for micronutrients.'],
  ['How do I manage low-carb days without feeling fatigued?', 'Schedule lower training intensity, eat plenty of non-starchy vegetables, include healthy fats, and stay hydrated. Caffeine or electrolyte drinks can also help energy levels.'],
  ['Can I carb cycle while intermittent fasting?', 'Yes, but ensure total calories and protein targets are still met within your eating window. High-carb days may require slightly longer feeding windows or more frequent meals.'],
  ['What if my weight stalls?', 'Review your overall weekly calorie intake, adjust the size of high or low days, ensure accurate tracking, and verify that recovery, sleep, and stress management support your goals.'],
];

export default function CarbCyclingMacroCalculator() {
  const [result, setResult] = useState<ResultPayload | null>(null);
  const form = useForm<FormValues>({
    resolver: zodResolver(formSchema),
    defaultValues: {
      maintenanceKcal: undefined,
      proteinGPerKg: undefined,
      bodyMassKg: undefined,
      lowCarbPct: undefined,
      highCarbPct: undefined,
    },
  });

  const onSubmit = (values: FormValues) => {
    const { maintenanceKcal, proteinGPerKg, bodyMassKg, lowCarbPct, highCarbPct } = values;
    if (
      maintenanceKcal == null ||
      proteinGPerKg == null ||
      bodyMassKg == null ||
      lowCarbPct == null ||
      highCarbPct == null
    ) {
      setResult(null);
      return;
    }

    const proteinG = proteinGPerKg * bodyMassKg;
    const lowDay = computeDay('Low Day', maintenanceKcal * 0.9, proteinG, lowCarbPct);
    const highDay = computeDay('High Day', maintenanceKcal * 1.05, proteinG, highCarbPct);

    setResult({
      status: 'Calculated',
      interpretation: interpret(lowDay, highDay),
      recommendations: buildRecommendations(lowDay, highDay),
      warningSigns: buildWarnings(),
      plan: plan(),
      lowDay,
      highDay,
    });
  };

  return (
    <div className="space-y-8">
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2"><Repeat className="h-5 w-5" /> Carb Cycling Macro Planner</CardTitle>
          <CardDescription>Set low- and high-carb day macros around your maintenance calories</CardDescription>
        </CardHeader>
        <CardContent>
          <Form {...form}>
            <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-6">
              <div className="grid grid-cols-1 md:grid-cols-5 gap-4">
                <FormField
                  control={form.control}
                  name="maintenanceKcal"
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel className="flex items-center gap-2"><Flame className="h-4 w-4" /> Maintenance Calories</FormLabel>
                      <FormControl>
                        <Input
                          type="number"
                          step="10"
                          placeholder="e.g., 2400"
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
                  name="proteinGPerKg"
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel className="flex items-center gap-2"><UtensilsCrossed className="h-4 w-4" /> Protein (g/kg)</FormLabel>
                      <FormControl>
                        <Input
                          type="number"
                          step="0.1"
                          placeholder="e.g., 1.8"
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
                  name="bodyMassKg"
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel className="flex items-center gap-2"><BarChart3 className="h-4 w-4" /> Body Mass (kg)</FormLabel>
                      <FormControl>
                        <Input
                          type="number"
                          step="0.1"
                          placeholder="e.g., 80"
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
                  name="lowCarbPct"
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel className="flex items-center gap-2"><BarChart3 className="h-4 w-4" /> Low Day Carbs (%)</FormLabel>
                      <FormControl>
                        <Input
                          type="number"
                          step="1"
                          placeholder="e.g., 25"
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
                  name="highCarbPct"
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel className="flex items-center gap-2"><BarChart3 className="h-4 w-4" /> High Day Carbs (%)</FormLabel>
                      <FormControl>
                        <Input
                          type="number"
                          step="1"
                          placeholder="e.g., 55"
                          value={field.value ?? ''}
                          onChange={(e) => field.onChange(e.target.value === '' ? undefined : Number(e.target.value))}
                        />
                      </FormControl>
                      <FormMessage />
                    </FormItem>
                  )}
                />
              </div>
              <Button type="submit" className="w-full md:w-auto">Calculate Carb Cycling Macros</Button>
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
                <CardTitle>Carb Cycling Overview</CardTitle>
              </div>
              <CardDescription>Macro targets for low and high days</CardDescription>
            </CardHeader>
            <CardContent className="space-y-4">
              <p className="text-sm text-muted-foreground">{result.interpretation}</p>
              <div className="overflow-x-auto">
                <table className="w-full text-sm">
                  <thead>
                    <tr className="border-b">
                      <th className="text-left p-2">Day Type</th>
                      <th className="text-left p-2">Calories</th>
                      <th className="text-left p-2">Protein (g)</th>
                      <th className="text-left p-2">Carbs (g)</th>
                      <th className="text-left p-2">Fat (g)</th>
                    </tr>
                  </thead>
                  <tbody>
                    {[result.lowDay, result.highDay].map((day) => (
                      <tr key={day.label} className="border-b">
                        <td className="p-2 font-medium">{day.label}</td>
                        <td className="p-2">{day.kcal}</td>
                        <td className="p-2">{day.proteinG}</td>
                        <td className="p-2">{day.carbsG}</td>
                        <td className="p-2">{day.fatG}</td>
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
              <CardTitle className="flex items-center gap-2"><Calendar className="h-5 w-5" /> 8-Week Implementation Plan</CardTitle>
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
          <CardDescription>Nutrition & performance planning tools</CardDescription>
        </CardHeader>
        <CardContent>
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div className="p-4 border rounded">
              <h4 className="font-semibold mb-1"><Link href="/category/health-fitness/macro-ratio-calculator" className="text-primary hover:underline">Macro Ratio Calculator</Link></h4>
              <p className="text-sm text-muted-foreground">Set balanced macros for maintenance or cutting.</p>
            </div>
            <div className="p-4 border rounded">
              <h4 className="font-semibold mb-1"><Link href="/category/health-fitness/keto-macro-calculator" className="text-primary hover:underline">Keto Macro Calculator</Link></h4>
              <p className="text-sm text-muted-foreground">Find ketogenic macro targets for low-carb phases.</p>
            </div>
            <div className="p-4 border rounded">
              <h4 className="font-semibold mb-1"><Link href="/category/health-fitness/intermittent-fasting-calculator" className="text-primary hover:underline">Intermittent Fasting Planner</Link></h4>
              <p className="text-sm text-muted-foreground">Coordinate fasting windows with training days.</p>
            </div>
            <div className="p-4 border rounded">
              <h4 className="font-semibold mb-1"><Link href="/category/health-fitness/daily-calorie-needs-calculator" className="text-primary hover:underline">Daily Calorie Needs</Link></h4>
              <p className="text-sm text-muted-foreground">Estimate maintenance calories to anchor your cycle.</p>
            </div>
          </div>
        </CardContent>
      </Card>

      <Card>
        <CardHeader><CardTitle>Complete Guide: Carb Cycling Essentials</CardTitle></CardHeader>
        <CardContent className="prose prose-sm dark:prose-invert max-w-none">
          <p>Carb cycling manipulates daily carbohydrate and calorie intake to better match training load, encourage fat loss, and support lean mass retention. Higher-carb days promote glycogen replenishment and training performance, while lower-carb days create a caloric buffer for the week.</p>
          <p>An effective plan balances macronutrients, preserves adequate fat intake for hormones, and keeps micronutrient density high regardless of the day type. Track sleep, mood, and strength to refine the approach and avoid the extremes that can hinder recovery.</p>
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



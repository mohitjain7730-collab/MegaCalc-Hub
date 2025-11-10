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
import { Zap, Coffee, Flame, BarChart3, Droplets, Calendar } from 'lucide-react';

const formSchema = z.object({
  cupsPerDay: z.number().min(0).max(5).optional(),
  butterTbspPerCup: z.number().min(0).max(3).optional(),
  mctTbspPerCup: z.number().min(0).max(3).optional(),
  weeklyBaselineCalories: z.number().min(5000).max(50000).optional(),
});

type FormValues = z.infer<typeof formSchema>;

type PlanStep = { week: number; focus: string };

type ResultPayload = {
  status: string;
  interpretation: string;
  recommendations: string[];
  warningSigns: string[];
  plan: PlanStep[];
  dailyCalories: number;
  weeklyCalories: number;
  weeklyImpactPct: number;
};

const kcalPerButterTbsp = 100;
const kcalPerMctTbsp = 115;

const plan = (): PlanStep[] => [
  { week: 1, focus: 'Track current Bulletproof coffee recipe and frequency' },
  { week: 2, focus: 'Log weight, appetite, and energy after each serving' },
  { week: 3, focus: 'Adjust fat amounts to match weekly calorie targets' },
  { week: 4, focus: 'Introduce protein-rich breakfasts on strength-training days' },
  { week: 5, focus: 'Evaluate biomarkers: hunger, sleep, digestion, and focus' },
  { week: 6, focus: 'Swap butter for lower-calorie additions if weight loss stalls' },
  { week: 7, focus: 'Schedule refeed meals or carb-heavy breakfasts around training' },
  { week: 8, focus: 'Set a maintenance routine and revisit intake every quarter' },
];

const faqs: [string, string][] = [
  ['How many calories are in Bulletproof coffee?', 'A typical Bulletproof coffee made with 1 tbsp butter and 1 tbsp MCT oil contains roughly 215 calories. Multiply by the number of cups per day to gauge total intake.'],
  ['Does Bulletproof coffee break a fast?', 'Yes. The fat calories trigger digestion and technically break a fast, though some people use it to blunt hunger during intermittent fasting while still consuming calories.'],
  ['Can Bulletproof coffee help with weight loss?', 'It can if it replaces higher-calorie meals and you remain in a weekly calorie deficit. However, the added fats can easily push you into surplus if other meals are not adjusted.'],
  ['Is MCT oil necessary?', 'No. MCT oil provides rapidly absorbed fats that may enhance ketone production, but you can reduce or omit it if you prefer fewer calories or experience digestive distress.'],
  ['Should I add protein to Bulletproof coffee?', 'Adding protein powder can improve satiety and muscle recovery. Without protein, Bulletproof coffee is high in fat but lacks amino acids needed for lean mass maintenance.'],
  ['How do I offset the calories from a Bulletproof coffee?', 'Reduce calories at other meals, focus on lean proteins and vegetables, increase activity, or limit Bulletproof coffee to specific days such as long fasting or endurance sessions.'],
  ['Is it safe to drink Bulletproof coffee every day?', 'Most healthy adults can consume it daily, but monitor cholesterol, digestion, and energy. Those with gallbladder or lipid issues should consult a healthcare professional before regular high-fat drinks.'],
  ['Does Bulletproof coffee provide micronutrients?', 'It contributes minimal vitamins and minerals. Pair it with nutrient-dense foods throughout the day—fruits, vegetables, lean proteins—to avoid micronutrient gaps.'],
  ['Can Bulletproof coffee replace breakfast?', 'It can serve as breakfast if it keeps you satiated and your overall diet remains balanced. Consider adding protein or pairing it with a small meal to round out nutrition.'],
  ['What are alternatives to Bulletproof coffee?', 'Try black coffee with a splash of milk, coffee blended with collagen protein, or whole-food breakfasts containing eggs, oats, yogurt, fruit, and nuts for more balanced nutrition.'],
];

export default function BulletproofCoffeeCalorieImpactCalculator() {
  const [result, setResult] = useState<ResultPayload | null>(null);
  const form = useForm<FormValues>({
    resolver: zodResolver(formSchema),
    defaultValues: {
      cupsPerDay: undefined,
      butterTbspPerCup: undefined,
      mctTbspPerCup: undefined,
      weeklyBaselineCalories: undefined,
    },
  });

  const onSubmit = (values: FormValues) => {
    const { cupsPerDay, butterTbspPerCup, mctTbspPerCup, weeklyBaselineCalories } = values;
    if (
      cupsPerDay == null ||
      butterTbspPerCup == null ||
      mctTbspPerCup == null ||
      weeklyBaselineCalories == null
    ) {
      setResult(null);
      return;
    }

    const perCup = butterTbspPerCup * kcalPerButterTbsp + mctTbspPerCup * kcalPerMctTbsp;
    const dailyCalories = perCup * cupsPerDay;
    const weeklyCalories = dailyCalories * 7;
    const weeklyImpactPct = (weeklyCalories / weeklyBaselineCalories) * 100;

    const interpretation =
      weeklyImpactPct >= 20
        ? 'High calorie contribution—adjust meal timing or portion sizes to stay on target.'
        : weeklyImpactPct >= 10
        ? 'Moderate impact—plan lighter meals or extra activity on Bulletproof days.'
        : 'Minor impact—fits within most calorie budgets if the rest of the diet is balanced.';

    const recommendations = [
      'Log total daily calories so Bulletproof coffee fits into your weekly plan',
      'Consider halving butter or MCT portions on lower-activity days',
      'Pair with protein or fiber later in the morning to enhance satiety and nutrient density',
    ];

    const warningSigns = [
      'Digestive distress may indicate too much MCT oil—reduce dose and build tolerance slowly',
      'Rapid weight gain or stalled fat loss suggests calories are exceeding your weekly target',
      'High LDL cholesterol or lipid disorders warrant discussing saturated fat intake with your doctor',
    ];

    setResult({
      status: 'Calculated',
      interpretation,
      recommendations,
      warningSigns,
      plan: plan(),
      dailyCalories: Math.round(dailyCalories),
      weeklyCalories: Math.round(weeklyCalories),
      weeklyImpactPct: Math.round(weeklyImpactPct * 10) / 10,
    });
  };

  return (
    <div className="space-y-8">
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2"><Coffee className="h-5 w-5" /> Bulletproof Coffee Calorie Impact</CardTitle>
          <CardDescription>Estimate daily and weekly calories from butter/MCT coffee</CardDescription>
        </CardHeader>
        <CardContent>
          <Form {...form}>
            <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-6">
              <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
                <FormField
                  control={form.control}
                  name="cupsPerDay"
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel className="flex items-center gap-2"><Coffee className="h-4 w-4" /> Cups per Day</FormLabel>
                      <FormControl>
                        <Input
                          type="number"
                          step="1"
                          placeholder="e.g., 1"
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
                  name="butterTbspPerCup"
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel className="flex items-center gap-2"><Flame className="h-4 w-4" /> Butter (tbsp)</FormLabel>
                      <FormControl>
                        <Input
                          type="number"
                          step="0.5"
                          placeholder="e.g., 1"
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
                  name="mctTbspPerCup"
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel className="flex items-center gap-2"><Droplets className="h-4 w-4" /> MCT Oil (tbsp)</FormLabel>
                      <FormControl>
                        <Input
                          type="number"
                          step="0.5"
                          placeholder="e.g., 1"
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
                  name="weeklyBaselineCalories"
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel className="flex items-center gap-2"><BarChart3 className="h-4 w-4" /> Weekly Baseline Calories</FormLabel>
                      <FormControl>
                        <Input
                          type="number"
                          step="50"
                          placeholder="e.g., 14000"
                          value={field.value ?? ''}
                          onChange={(e) => field.onChange(e.target.value === '' ? undefined : Number(e.target.value))}
                        />
                      </FormControl>
                      <FormMessage />
                    </FormItem>
                  )}
                />
              </div>
              <Button type="submit" className="w-full md:w-auto">Calculate Impact</Button>
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
                <CardTitle>Calorie Summary</CardTitle>
              </div>
              <CardDescription>Daily and weekly totals from Bulletproof coffee</CardDescription>
            </CardHeader>
            <CardContent className="space-y-4">
              <p className="text-3xl font-bold text-primary">{result.dailyCalories} kcal / day</p>
              <p className="text-muted-foreground">{result.weeklyCalories} kcal per week · {result.weeklyImpactPct}% of your weekly calories</p>
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
              <CardTitle className="flex items-center gap-2"><Calendar className="h-5 w-5" /> 8-Week Adjustment Plan</CardTitle>
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
          <CardDescription>Calories, macros, and fasting tools</CardDescription>
        </CardHeader>
        <CardContent>
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div className="p-4 border rounded"><h4 className="font-semibold mb-1"><Link href="/category/health-fitness/daily-calorie-needs-calculator" className="text-primary hover:underline">Daily Calorie Needs</Link></h4><p className="text-sm text-muted-foreground">Estimate maintenance calories before adding fat-heavy drinks.</p></div>
            <div className="p-4 border rounded"><h4 className="font-semibold mb-1"><Link href="/category/health-fitness/macro-ratio-calculator" className="text-primary hover:underline">Macro Ratio Calculator</Link></h4><p className="text-sm text-muted-foreground">Balance carbs, fat, and protein alongside Bulletproof coffee.</p></div>
            <div className="p-4 border rounded"><h4 className="font-semibold mb-1"><Link href="/category/health-fitness/intermittent-fasting-calculator" className="text-primary hover:underline">Intermittent Fasting Planner</Link></h4><p className="text-sm text-muted-foreground">Coordinate coffee timing with fasting windows.</p></div>
            <div className="p-4 border rounded"><h4 className="font-semibold mb-1"><Link href="/category/health-fitness/alcohol-calorie-impact-calculator" className="text-primary hover:underline">Alcohol Calorie Impact</Link></h4><p className="text-sm text-muted-foreground">Compare occasional drinks to Bulletproof coffee calories.</p></div>
          </div>
        </CardContent>
      </Card>

      <Card>
        <CardHeader><CardTitle>Complete Guide: Managing High-Fat Coffee</CardTitle></CardHeader>
        <CardContent className="prose prose-sm dark:prose-invert max-w-none">
          <p>Butter and MCT oil can provide sustained energy but deliver substantial calories. Align servings with your activity level and overall calorie budget. When weight loss or metabolic markers stall, dial down portions or frequency.</p>
          <p>Prioritize whole-food meals rich in protein, fiber, and micronutrients throughout the rest of the day. Track weekly averages to ensure Bulletproof coffee supports rather than hinders your nutrition goals.</p>
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



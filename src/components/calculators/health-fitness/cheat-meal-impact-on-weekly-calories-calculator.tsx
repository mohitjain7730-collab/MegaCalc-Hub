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
import { Zap, UtensilsCrossed, PieChart, Scale, Calendar } from 'lucide-react';

const formSchema = z.object({
  cheatMealCalories: z.number().min(100).max(5000).optional(),
  weeklyTargetCalories: z.number().min(5000).max(50000).optional(),
});

type FormValues = z.infer<typeof formSchema>;

type PlanStep = { week: number; focus: string };

type ResultPayload = {
  status: string;
  interpretation: string;
  recommendations: string[];
  warningSigns: string[];
  plan: PlanStep[];
  impactPct: number;
};

const plan = (): PlanStep[] => [
  { week: 1, focus: 'Log current cheat meals and weekly calorie targets' },
  { week: 2, focus: 'Pair indulgent meals with high-protein, high-fiber sides' },
  { week: 3, focus: 'Plan lighter meals before and after cheat meals to balance calories' },
  { week: 4, focus: 'Add low-intensity activity the day after a large surplus' },
  { week: 5, focus: 'Assess progress photos, body weight, and cravings' },
  { week: 6, focus: 'Adjust portion size or frequency based on weekly results' },
  { week: 7, focus: 'Experiment with calorie banking or higher-carb training days' },
  { week: 8, focus: 'Set long-term guidelines for celebrations, travel, or social events' },
];

const faqs: [string, string][] = [
  ['What counts as a cheat meal?', 'A cheat meal is an intentional indulgence that exceeds usual calorie or macro targets. It can be a single entrée, dessert, or social meal where food quality and quantity differ from your daily plan.'],
  ['How often should I have a cheat meal?', 'Many people do well with one planned indulgence per week, but frequency depends on your goals, calorie budget, and how easily you can resume normal eating the next day.'],
  ['Will a cheat meal ruin my diet?', 'One meal will not derail progress if the rest of the week remains on target. The key is keeping weekly averages aligned with your goals and avoiding extended binge behavior.'],
  ['Should I skip meals before a cheat meal?', 'Lightly reducing calories earlier in the day can create a buffer, but avoid arriving overly hungry as it may trigger excessive overeating. Focus on protein and vegetables before the event.'],
  ['Can cheat meals boost metabolism?', 'Large refeeds may temporarily raise energy expenditure and replenish glycogen, but the effect is modest. The psychological break and adherence boost often matter more.'],
  ['How do I manage water retention after a cheat meal?', 'Expect temporary water weight from carbs and sodium. Hydrate, prioritize potassium-rich foods, and return to your normal plan. Water weight typically subsides within 24–48 hours.'],
  ['Is there a difference between a cheat meal and a cheat day?', 'A cheat day often creates a massive calorie surplus and is harder to control. A single meal or controlled refeed is easier to integrate without overshooting weekly goals.'],
  ['Should I exercise after a cheat meal?', 'Light activity the same day or the next can use the extra carbs for glycogen replenishment. Avoid punishing workouts—focus on movement that supports recovery and adherence.'],
  ['How can I enjoy social events without overdoing it?', 'Plan ahead, share entrées or desserts, eat slowly, drink water between alcoholic beverages, and focus on the social experience rather than solely the food.'],
  ['What if cheat meals trigger binge eating?', 'If indulgent meals lead to loss of control, replace the “cheat” mindset with flexible dieting. Include favorite foods in small portions throughout the week and seek professional support if needed.'],
];

export default function CheatMealImpactOnWeeklyCaloriesCalculator() {
  const [result, setResult] = useState<ResultPayload | null>(null);
  const form = useForm<FormValues>({
    resolver: zodResolver(formSchema),
    defaultValues: {
      cheatMealCalories: undefined,
      weeklyTargetCalories: undefined,
    },
  });

  const onSubmit = (values: FormValues) => {
    const { cheatMealCalories, weeklyTargetCalories } = values;
    if (cheatMealCalories == null || weeklyTargetCalories == null) {
      setResult(null);
      return;
    }

    const impactPct = (cheatMealCalories / weeklyTargetCalories) * 100;
    const interpretation =
      impactPct >= 20
        ? 'Large impact—one meal can erase a weekly deficit. Adjust portion sizes or frequency.'
        : impactPct >= 10
        ? 'Moderate impact—balance with lighter meals or additional activity within the same week.'
        : 'Small impact—fits within most plans if other meals remain nutrient-dense and on target.';

    const recommendations = [
      'Log the meal in your tracker so weekly calories stay accurate',
      'Increase lean protein and vegetables earlier in the day for satiety',
      'Consider “calorie banking”: reduce intake by 100–200 kcal on surrounding days',
    ];

    const warningSigns = [
      'If weight spikes for multiple days, the overall surplus may be too high',
      'Emotional or mindless eating can turn planned treats into binges—slow down and stay mindful',
      'Excess alcohol alongside rich meals compounds calories and impairs recovery',
    ];

    setResult({
      status: 'Calculated',
      interpretation,
      recommendations,
      warningSigns,
      plan: plan(),
      impactPct: Math.round(impactPct * 10) / 10,
    });
  };

  return (
    <div className="space-y-8">
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2"><UtensilsCrossed className="h-5 w-5" /> Cheat Meal Impact Planner</CardTitle>
          <CardDescription>Estimate how a single indulgent meal affects weekly calorie goals</CardDescription>
        </CardHeader>
        <CardContent>
          <Form {...form}>
            <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-6">
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <FormField
                  control={form.control}
                  name="cheatMealCalories"
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel className="flex items-center gap-2"><PieChart className="h-4 w-4" /> Cheat Meal Calories</FormLabel>
                      <FormControl>
                        <Input
                          type="number"
                          step="10"
                          placeholder="e.g., 1200"
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
                  name="weeklyTargetCalories"
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel className="flex items-center gap-2"><Scale className="h-4 w-4" /> Weekly Target Calories</FormLabel>
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
                <CardTitle>Weekly Calorie Impact</CardTitle>
              </div>
              <CardDescription>Understand how one meal changes your energy balance</CardDescription>
            </CardHeader>
            <CardContent className="space-y-2">
              <p className="text-3xl font-bold text-primary">{result.impactPct}% of weekly calories</p>
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
              <CardTitle className="flex items-center gap-2"><Calendar className="h-5 w-5" /> 8-Week Flexibility Plan</CardTitle>
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
          <CardDescription>Keep weekly calories aligned with your goals</CardDescription>
        </CardHeader>
        <CardContent>
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div className="p-4 border rounded"><h4 className="font-semibold mb-1"><Link href="/category/health-fitness/daily-calorie-needs-calculator" className="text-primary hover:underline">Daily Calorie Needs</Link></h4><p className="text-sm text-muted-foreground">Establish maintenance before planning indulgences.</p></div>
            <div className="p-4 border rounded"><h4 className="font-semibold mb-1"><Link href="/category/health-fitness/calorie-deficit-calculator" className="text-primary hover:underline">Calorie Deficit Calculator</Link></h4><p className="text-sm text-muted-foreground">Gauge how deficits change with cheat meals.</p></div>
            <div className="p-4 border rounded"><h4 className="font-semibold mb-1"><Link href="/category/health-fitness/calorie-surplus-calculator" className="text-primary hover:underline">Calorie Surplus Calculator</Link></h4><p className="text-sm text-muted-foreground">Plan refeeds while bulking responsibly.</p></div>
            <div className="p-4 border rounded"><h4 className="font-semibold mb-1"><Link href="/category/health-fitness/macro-ratio-calculator" className="text-primary hover:underline">Macro Ratio Calculator</Link></h4><p className="text-sm text-muted-foreground">Set daily macros around planned treats.</p></div>
          </div>
        </CardContent>
      </Card>

      <Card>
        <CardHeader><CardTitle>Complete Guide: Smart Cheat Meals</CardTitle></CardHeader>
        <CardContent className="prose prose-sm dark:prose-invert max-w-none">
          <p>Cheat meals can support adherence by offering flexibility and psychological relief. The key is tracking weekly energy balance so one meal does not derail progress. Focus on mindful eating, adequate protein, and hydration to minimize negative impacts.</p>
          <p>Use data—calories, macros, weight trends, and performance markers—to determine how indulgent meals fit into your long-term nutrition strategy. Adjust portion sizes or frequency as your body composition goals evolve.</p>
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



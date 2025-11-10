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
import { Zap, Activity, Wind, Gauge, Calendar } from 'lucide-react';

const intensityOptions = [
  { value: 'moderate', label: 'Moderate steady cardio', factor: 0.06 },
  { value: 'high', label: 'High intensity', factor: 0.12 },
  { value: 'very_high', label: 'Very high / HIIT / heavy strength', factor: 0.15 },
];

const formSchema = z.object({
  exerciseCalories: z.number().min(50).max(2000).optional(),
  intensity: z.enum(['moderate', 'high', 'very_high']).optional(),
});

type FormValues = z.infer<typeof formSchema>;

type ResultPayload = {
  status: string;
  interpretation: string;
  recommendations: string[];
  warningSigns: string[];
  plan: { week: number; focus: string }[];
  epocCalories: number;
  epocPercent: number;
};

const plan = (): { week: number; focus: string }[] => [
  { week: 1, focus: 'Log exercise modalities, durations, and estimated calories for a baseline week' },
  { week: 2, focus: 'Introduce one high-intensity or heavy resistance session to elevate EPOC' },
  { week: 3, focus: 'Add active recovery (walking, mobility) post-workout to capitalize on elevated metabolism' },
  { week: 4, focus: 'Prioritize protein and sleep on EPOC-heavy days for recovery' },
  { week: 5, focus: 'Rotate interval protocols (Tabata, 30/30, tempo runs) to avoid plateaus' },
  { week: 6, focus: 'Monitor resting heart rate and fatigue—deload if recovery markers worsen' },
  { week: 7, focus: 'Pair strength and cardio strategically (lift first, intervals later) for maximal afterburn' },
  { week: 8, focus: 'Reassess goals, update calorie targets, and maintain a balanced program' },
];

const faqs: [string, string][] = [
  ['What is EPOC?', 'Excess post-exercise oxygen consumption (EPOC) is the elevated oxygen and calorie expenditure that occurs after a workout as the body restores homeostasis.'],
  ['Which workouts create the highest EPOC?', 'High-intensity interval training, heavy resistance sessions, sprint circuits, and metabolic conditioning produce greater EPOC than moderate steady-state cardio.'],
  ['How accurate is this calculator?', 'It provides a heuristic based on the percentage of exercise calories contributed by EPOC. Individual responses vary with fitness, genetics, workout structure, and recovery habits.'],
  ['Can I rely on EPOC for fat loss?', 'EPOC contributes modestly (typically 6–15% of exercise calories). Use it as a bonus while maintaining a consistent calorie deficit and overall training volume.'],
  ['Does nutrition affect EPOC?', 'Adequate protein, carbohydrates, and hydration support recovery processes that underpin EPOC. Severe calorie deficits may blunt the response.'],
  ['How often should I train intensely?', 'Most lifters benefit from 2–3 high-intensity sessions per week. Balance intensity with recovery to avoid overtraining and diminishing returns.'],
  ['What about steady cardio?', 'Moderate cardio produces lower EPOC but still improves cardiovascular health, aids recovery, and contributes to daily calorie burn.'],
  ['Can beginners perform HIIT for EPOC?', 'Start with foundational cardio and strength work before progressing to HIIT. Build aerobic base and technique to reduce injury risk.'],
  ['How long does EPOC last?', 'EPOC from intense sessions can last 12–24 hours, but the magnitude declines over time. Light workouts may yield a shorter 1–4 hour elevation.'],
  ['Should I adjust calorie intake on EPOC days?', 'Track trends. If weight loss stalls, consider applying a slight calorie buffer on high-EPOC days while keeping weekly targets in check.'],
];

const understandingInputs = [
  {
    label: 'Exercise calories',
    description: 'Estimated calories burned during the workout (from a heart-rate monitor, wearable, or reliable calculator).',
  },
  {
    label: 'Intensity',
    description: 'Select the effort profile that best reflects the workout—higher intensity raises EPOC percentage.',
  },
];

const interpret = (percent: number) => {
  if (percent >= 12) return 'Large afterburn effect—expect noticeable calorie carryover into recovery.';
  if (percent >= 8) return 'Moderate afterburn—great for fat-loss blocks and metabolic conditioning.';
  return 'Small afterburn—focus on progressive overload or intervals to elevate EPOC if desired.';
};

const recommendations = (percent: number) => [
  'Log both exercise calories and EPOC estimates to assess weekly totals accurately',
  percent >= 12
    ? 'Allow 24 hours of quality recovery—sleep, hydration, and nutrition sustain the afterburn effect'
    : 'Introduce periodic HIIT or heavy circuits if you want to increase EPOC contribution',
  'Combine EPOC sessions with strength training phases for metabolic and performance benefits',
];

const warningSigns = () => [
  'Excessive soreness, fatigue, or elevated resting heart rate can indicate too many high-intensity sessions',
  'Relying solely on wearables may misestimate calories—use weight trends and energy levels to validate data',
  'People with cardiovascular or metabolic conditions should consult professionals before engaging in intense intervals',
];

export default function PostExerciseOxygenConsumptionCalculator() {
  const [result, setResult] = useState<ResultPayload | null>(null);
  const form = useForm<FormValues>({
    resolver: zodResolver(formSchema),
    defaultValues: {
      exerciseCalories: undefined,
      intensity: undefined,
    },
  });

  const onSubmit = (values: FormValues) => {
    const { exerciseCalories, intensity } = values;
    if (exerciseCalories == null || intensity == null) {
      setResult(null);
      return;
    }

    const option = intensityOptions.find((item) => item.value === intensity) ?? intensityOptions[0];
    const epocCalories = exerciseCalories * option.factor;
    const percent = option.factor * 100;

    setResult({
      status: 'Calculated',
      interpretation: interpret(percent),
      recommendations: recommendations(percent),
      warningSigns: warningSigns(),
      plan: plan(),
      epocCalories: Math.round(epocCalories),
      epocPercent: Math.round(percent * 10) / 10,
    });
  };

  return (
    <div className="space-y-8">
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2"><Wind className="h-5 w-5" /> Post-Exercise Oxygen Consumption (EPOC)</CardTitle>
          <CardDescription>Estimate the afterburn calories generated by your workout.</CardDescription>
        </CardHeader>
        <CardContent>
          <Form {...form}>
            <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-6">
              <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                <FormField
                  control={form.control}
                  name="exerciseCalories"
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel className="flex items-center gap-2"><Gauge className="h-4 w-4" /> Exercise Calories (kcal)</FormLabel>
                      <FormControl>
                        <Input
                          type="number"
                          step="10"
                          placeholder="e.g., 500"
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
                  name="intensity"
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel className="flex items-center gap-2"><Activity className="h-4 w-4" /> Intensity</FormLabel>
                      <FormControl>
                        <select
                          className="border rounded-md h-10 px-3 w-full bg-background"
                          value={field.value ?? ''}
                          onChange={(e) => field.onChange(e.target.value === '' ? undefined : (e.target.value as FormValues['intensity']))}
                        >
                          <option value="">Select intensity</option>
                          {intensityOptions.map((option) => (
                            <option key={option.value} value={option.value}>{option.label}</option>
                          ))}
                        </select>
                      </FormControl>
                      <FormMessage />
                    </FormItem>
                  )}
                />
              </div>
              <Button type="submit" className="w-full md:w-auto">Estimate EPOC</Button>
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
                <CardTitle>EPOC Summary</CardTitle>
              </div>
              <CardDescription>Estimated afterburn calories and percentage of workout expenditure</CardDescription>
            </CardHeader>
            <CardContent className="space-y-4">
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div className="p-4 border rounded">
                  <h4 className="font-semibold text-sm text-muted-foreground">EPOC Calories</h4>
                  <p className="text-2xl font-bold text-primary">{result.epocCalories} kcal</p>
                </div>
                <div className="p-4 border rounded">
                  <h4 className="font-semibold text-sm text-muted-foreground">EPOC Share</h4>
                  <p className="text-2xl font-bold text-primary">{result.epocPercent}%</p>
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
              <CardTitle className="flex items-center gap-2"><Calendar className="h-5 w-5" /> 8-Week Afterburn Plan</CardTitle>
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
          <CardDescription>Clarify what each field represents before entering your data</CardDescription>
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
          <CardDescription>Build a complete conditioning strategy</CardDescription>
        </CardHeader>
        <CardContent>
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div className="p-4 border rounded"><h4 className="font-semibold mb-1"><Link href="/category/health-fitness/mets-calories-burned-calculator" className="text-primary hover:underline">METs to Calories</Link></h4><p className="text-sm text-muted-foreground">Estimate workout energy expenditure before EPOC.</p></div>
            <div className="p-4 border rounded"><h4 className="font-semibold mb-1"><Link href="/category/health-fitness/training-stress-score-calculator" className="text-primary hover:underline">Training Stress Score</Link></h4><p className="text-sm text-muted-foreground">Quantify workload to balance intensity and recovery.</p></div>
            <div className="p-4 border rounded"><h4 className="font-semibold mb-1"><Link href="/category/health-fitness/recovery-heart-rate-calculator" className="text-primary hover:underline">Recovery Heart Rate</Link></h4><p className="text-sm text-muted-foreground">Monitor recovery health alongside EPOC trends.</p></div>
            <div className="p-4 border rounded"><h4 className="font-semibold mb-1"><Link href="/category/health-fitness/cheat-meal-impact-on-weekly-calories-calculator" className="text-primary hover:underline">Cheat Meal Impact</Link></h4><p className="text-sm text-muted-foreground">Balance nutrition on high-intensity training weeks.</p></div>
          </div>
        </CardContent>
      </Card>

      <Card>
        <CardHeader><CardTitle>Complete Guide: Maximizing the Afterburn Effect</CardTitle></CardHeader>
        <CardContent className="prose prose-sm dark:prose-invert max-w-none">
          <p>EPOC reflects the energetic cost of restoring homeostasis after intense exercise. Prioritize structured intervals, heavy resistance work, and strategic recovery habits to elevate EPOC while avoiding overtraining. Use the calculator to track how programming tweaks influence total energy expenditure.</p>
          <p>Combine data with sleep quality, hunger cues, and performance trends to calibrate training blocks. EPOC is a supportive metric—not a replacement for consistent nutrition, strength progression, and aerobic base development.</p>
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

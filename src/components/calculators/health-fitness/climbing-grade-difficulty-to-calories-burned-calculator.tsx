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
import { Mountain, Flame, Activity, Calendar } from 'lucide-react';

const formSchema = z.object({
  weight: z.number().positive().optional(),
  grade: z.number().min(5).max(5.15).optional(),
  duration: z.number().positive().optional(),
  climbingType: z.enum(['indoor', 'bouldering', 'outdoor']).optional(),
});

type FormValues = z.infer<typeof formSchema>;

type ResultPayload = {
  caloriesPerHour: number;
  totalCalories: number;
  intensity: string;
  interpretation: string;
  recommendations: string[];
  warningSigns: string[];
  plan: { week: number; focus: string }[];
};

const plan = (): { week: number; focus: string }[] => [
  { week: 1, focus: 'Log current climbing sessions (grades, attempts, rest) to establish baseline caloric expenditure.' },
  { week: 2, focus: 'Add strength sessions (fingerboard, pull-ups) to support higher-grade projects.' },
  { week: 3, focus: 'Incorporate endurance circuits (4 × 4 problems/routes) to extend time on wall.' },
  { week: 4, focus: 'Practice efficient movement: footwork drills and silent feet sessions to reduce wasted energy.' },
  { week: 5, focus: 'Introduce interval climbing (on/off sets) to elevate MET intensity safely.' },
  { week: 6, focus: 'Track nutrition relative to calorie expenditure to ensure adequate fueling and recovery.' },
  { week: 7, focus: 'Simulate outdoor projects or competitions with sustained efforts at target grade.' },
  { week: 8, focus: 'Reassess calorie burn with updated grade and duration to gauge progress.' },
];

const faqs: [string, string][] = [
  ['How are climbing calories estimated?', 'Calories are estimated using metabolic equivalent (MET) values adjusted for climbing grade, style, and body weight. The calculator converts METs into calories per hour and total session calories.'],
  ['What climbing grade scale is used?', 'Grades reference the Yosemite Decimal System (5.x). Enter the decimal form (e.g., 5.10 becomes 5.10). Higher numbers indicate more difficult climbs requiring greater energy expenditure.'],
  ['Does climbing type affect calories?', 'Yes. Bouldering, indoor routes, and outdoor routes impose different metabolic demands. The calculator adjusts MET values based on selected climbing type.'],
  ['Can I track multiple climbs in one session?', 'Yes. Sum total climbing duration (time actively climbing) across routes or problems. For more granular tracking, run the calculator per attempt and combine totals.'],
  ['Is rest time included?', 'Only active climbing time should be entered. Rest periods drastically reduce energy expenditure and are not included in the calculation for accuracy.'],
  ['How accurate is this estimate?', 'Calorie estimates are approximations using published MET data. Actual expenditure varies with technique, efficiency, environment, and individual fitness. Use results for comparative, not clinical, purposes.'],
  ['How can I burn more calories while climbing?', 'Increase session duration, choose higher grades, reduce rest intervals, and incorporate interval-based climbing or circuits to maintain elevated heart rate.'],
  ['Why does body weight matter?', 'Calories burned are proportional to body mass. Heavier climbers expend more energy moving vertically, so weight significantly influences caloric output.'],
  ['Can I use this for bouldering and rope climbing?', 'Yes. Select “Bouldering” for short, powerful sessions and “Indoor” or “Outdoor” for roped climbs. The calculator adjusts MET values appropriately.'],
  ['How often should I recalculate?', 'Recalculate whenever you change climbing intensity, grade, duration, or body weight. Regular tracking helps align nutrition and recovery with training load.'],
];

const understandingInputs = [
  { label: 'Weight (kg)', description: 'Current body weight. Use recent measurements for accurate calorie estimates.' },
  { label: 'Climbing Grade (5.x)', description: 'Difficulty level in Yosemite Decimal form (e.g., 5.9, 5.11). Higher grades generally require more energy.' },
  { label: 'Duration (minutes)', description: 'Total time spent actively climbing (excluding rest). Convert partial minutes (e.g., 45.5) for precision.' },
  { label: 'Climbing Type', description: 'Choose indoor routes, outdoor routes, or bouldering to account for style-specific intensity.' },
];

const calculateCalories = (values: FormValues) => {
  if (!values.weight || !values.grade || !values.duration) return null;

  let baseMET: number;
  switch (values.climbingType) {
    case 'bouldering':
      baseMET = 6.5 + (values.grade - 5) * 2.5;
      break;
    case 'outdoor':
      baseMET = 7.0 + (values.grade - 5) * 2.0;
      break;
    default:
      baseMET = 6.0 + (values.grade - 5) * 1.8;
  }

  baseMET = Math.max(4, Math.min(baseMET, 14));

  const caloriesPerHour = (baseMET * values.weight * 3.5) / 200;
  const totalCalories = caloriesPerHour * (values.duration / 60);

  let intensity: string;
  if (baseMET < 6) intensity = 'Light';
  else if (baseMET < 8) intensity = 'Moderate';
  else if (baseMET < 10) intensity = 'Vigorous';
  else intensity = 'Very Vigorous';

  return { caloriesPerHour, totalCalories, intensity };
};

const interpret = (intensity: string, totalCalories: number) => {
  if (intensity === 'Very Vigorous') return 'This session demanded maximal effort and significant caloric expenditure. Prioritise recovery nutrition and adequate rest before the next high-intensity climb.';
  if (intensity === 'Vigorous') return 'A challenging session delivering meaningful fitness gains. Balance hard days with technique or endurance-focused climbs for sustainable progress.';
  if (intensity === 'Moderate') return 'A solid training session supporting endurance and skill development. Gradually introduce harder grades or interval circuits to increase caloric impact.';
  return 'Light-intensity climbing is ideal for warm-ups, active recovery, or skill work. Consider longer durations or higher grades when targeting calorie burn.';
};

const recommendations = (intensity: string, duration: number) => {
  const recs = [
    'Log sessions in a training journal to correlate grade progression with caloric output.',
    'Fuel climbs with balanced carbohydrates and protein to sustain energy and aid recovery.',
    'Incorporate mobility and antagonist training to prevent injuries during higher-intensity phases.',
  ];

  if (intensity === 'Light') {
    recs.push('Increase session length or reduce rest intervals to raise total energy expenditure.');
  }

  if (duration < 45) {
    recs.push('Extend active climbing time to at least 45–60 minutes for substantial caloric impact.');
  }

  return recs;
};

const warningSigns = () => [
  'Calorie estimates are approximate; listen to your body and adjust nutrition accordingly.',
  'Rapid grade jumps without conditioning increase injury risk—progress gradually.',
  'Ensure proper hydration and rest, particularly during outdoor climbs with environmental stressors.',
];

export default function ClimbingGradeDifficultyToCaloriesBurnedCalculator() {
  const [result, setResult] = useState<ResultPayload | null>(null);

  const form = useForm<FormValues>({
    resolver: zodResolver(formSchema),
    defaultValues: {
      weight: undefined,
      grade: undefined,
      duration: undefined,
      climbingType: 'indoor',
    },
  });

  const onSubmit = (values: FormValues) => {
    const calc = calculateCalories(values);
    if (!calc) {
      setResult(null);
      return;
    }

    setResult({
      caloriesPerHour: calc.caloriesPerHour,
      totalCalories: calc.totalCalories,
      intensity: calc.intensity,
      interpretation: interpret(calc.intensity, calc.totalCalories),
      recommendations: recommendations(calc.intensity, values.duration ?? 0),
      warningSigns: warningSigns(),
      plan: plan(),
    });
  };

  return (
    <div className="space-y-8">
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2"><Mountain className="h-5 w-5" /> Climbing Grade to Calories Calculator</CardTitle>
          <CardDescription>Estimate caloric expenditure based on climbing grade, duration, and style.</CardDescription>
        </CardHeader>
        <CardContent>
          <Form {...form}>
            <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-6">
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <FormField control={form.control} name="weight" render={({ field }) => (
                  <FormItem>
                    <FormLabel className="flex items-center gap-2"><Activity className="h-4 w-4" /> Weight (kg)</FormLabel>
                    <FormControl>
                      <Input type="number" step="0.1" placeholder="e.g., 68" value={field.value ?? ''} onChange={(e)=>field.onChange(e.target.value === '' ? undefined : Number(e.target.value))} />
                    </FormControl>
                    <FormMessage />
                  </FormItem>
                )} />
                <FormField control={form.control} name="grade" render={({ field }) => (
                  <FormItem>
                    <FormLabel className="flex items-center gap-2"><Flame className="h-4 w-4" /> Climbing Grade (5.0–5.15)</FormLabel>
                    <FormControl>
                      <Input type="number" step="0.01" placeholder="e.g., 5.11" value={field.value ?? ''} onChange={(e)=>field.onChange(e.target.value === '' ? undefined : Number(e.target.value))} />
                    </FormControl>
                    <FormMessage />
                  </FormItem>
                )} />
                <FormField control={form.control} name="duration" render={({ field }) => (
                  <FormItem>
                    <FormLabel className="flex items-center gap-2"><Calendar className="h-4 w-4" /> Duration (minutes)</FormLabel>
                    <FormControl>
                      <Input type="number" step="0.1" placeholder="e.g., 75" value={field.value ?? ''} onChange={(e)=>field.onChange(e.target.value === '' ? undefined : Number(e.target.value))} />
                    </FormControl>
                    <FormMessage />
                  </FormItem>
                )} />
                <FormField control={form.control} name="climbingType" render={({ field }) => (
                  <FormItem>
                    <FormLabel className="flex items-center gap-2"><Mountain className="h-4 w-4" /> Climbing Type</FormLabel>
                    <Select onValueChange={field.onChange} value={field.value}>
                      <FormControl>
                        <SelectTrigger>
                          <SelectValue placeholder="Select climbing type" />
                        </SelectTrigger>
                      </FormControl>
                      <SelectContent>
                        <SelectItem value="indoor">Indoor Climbing</SelectItem>
                        <SelectItem value="bouldering">Bouldering</SelectItem>
                        <SelectItem value="outdoor">Outdoor Climbing</SelectItem>
                      </SelectContent>
                    </Select>
                    <FormMessage />
                  </FormItem>
                )} />
              </div>
              <Button type="submit" className="w-full md:w-auto">Calculate Calories Burned</Button>
            </form>
          </Form>
        </CardContent>
      </Card>

      {result && (
        <div className="space-y-6">
          <Card>
            <CardHeader>
              <div className="flex items-center gap-4"><Flame className="h-8 w-8 text-primary" /><CardTitle>Caloric Expenditure Summary</CardTitle></div>
              <CardDescription>Energy output for your climbing session</CardDescription>
            </CardHeader>
            <CardContent className="space-y-4">
              <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                <div className="p-4 border rounded">
                  <h4 className="text-sm font-semibold text-muted-foreground">Calories per Hour</h4>
                  <p className="text-2xl font-bold text-primary">{result.caloriesPerHour.toFixed(0)} kcal</p>
                </div>
                <div className="p-4 border rounded">
                  <h4 className="text-sm font-semibold text-muted-foreground">Total Session Calories</h4>
                  <p className="text-2xl font-bold text-primary">{result.totalCalories.toFixed(0)} kcal</p>
                </div>
                <div className="p-4 border rounded">
                  <h4 className="text-sm font-semibold text-muted-foreground">Intensity Level</h4>
                  <p className="text-lg font-bold text-primary">{result.intensity}</p>
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
            <CardHeader><CardTitle className="flex items-center gap-2"><Calendar className="h-5 w-5" /> 8‑Week Climbing Energy Plan</CardTitle></CardHeader>
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
          <CardDescription>Use consistent metrics for reliable comparisons</CardDescription>
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
          <CardDescription>Track training load and recovery holistically</CardDescription>
        </CardHeader>
        <CardContent>
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div className="p-4 border rounded">
              <h4 className="font-semibold mb-1"><Link href="/category/health-fitness/post-exercise-oxygen-consumption-calculator" className="text-primary hover:underline">Post-Exercise Oxygen Consumption</Link></h4>
              <p className="text-sm text-muted-foreground">Estimate recovery demands after intense climbing days.</p>
            </div>
            <div className="p-4 border rounded">
              <h4 className="font-semibold mb-1"><Link href="/category/health-fitness/neat-calculator" className="text-primary hover:underline">NEAT Calculator</Link></h4>
              <p className="text-sm text-muted-foreground">Understand daily activity calories alongside training.</p>
            </div>
            <div className="p-4 border rounded">
              <h4 className="font-semibold mb-1"><Link href="/category/health-fitness/adaptive-thermogenesis-calculator" className="text-primary hover:underline">Adaptive Thermogenesis</Link></h4>
              <p className="text-sm text-muted-foreground">Monitor metabolic shifts during rigorous training cycles.</p>
            </div>
            <div className="p-4 border rounded">
              <h4 className="font-semibold mb-1"><Link href="/category/health-fitness/seasonal-energy-expenditure-calculator" className="text-primary hover:underline">Seasonal Energy Expenditure</Link></h4>
              <p className="text-sm text-muted-foreground">Plan energy needs across different climbing seasons.</p>
            </div>
          </div>
        </CardContent>
      </Card>

      <Card>
        <CardHeader>
          <CardTitle>Complete Guide: Managing Climbing Energy Output</CardTitle>
        </CardHeader>
        <CardContent className="prose prose-sm dark:prose-invert max-w-none">
          <p>Climbing combines strength, power, and endurance, leading to substantial caloric expenditure. Understanding how grade, session length, and body weight influence energy burn helps climbers plan nutrition, manage training load, and track progress. Pair calorie estimates with recovery strategies, periodised training, and technique work to climb harder while staying healthy.</p>
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
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
import { Zap, Snowflake, Thermometer, Calendar, Shield, Clock } from 'lucide-react';

const formSchema = z.object({
  ambientTemp: z.number().min(-30).max(30).optional(),
  exposureMinutes: z.number().min(5).max(300).optional(),
  clothingClo: z.number().min(0).max(4).optional(),
});

type FormValues = z.infer<typeof formSchema>;

type ResultPayload = {
  status: string;
  interpretation: string;
  recommendations: string[];
  warningSigns: string[];
  plan: { week: number; focus: string }[];
  totalKcal: number;
  kcalPerHour: number;
};

const plan = (): { week: number; focus: string }[] => [
  { week: 1, focus: 'Record daily outdoor exposure, clothing choices, and perceived exertion' },
  { week: 2, focus: 'Introduce brief cold walks or contrast showers while monitoring comfort' },
  { week: 3, focus: 'Pair cold exposure with light movement (walking, mobility) for added caloric output' },
  { week: 4, focus: 'Evaluate recovery, sleep, and energy—reduce duration if fatigue rises' },
  { week: 5, focus: 'Experiment with breathing exercises and rewarming routines to improve tolerance' },
  { week: 6, focus: 'Cycle exposure days with rest days; integrate thermogenic foods or warm beverages after sessions' },
  { week: 7, focus: 'Assess body composition and weight trends to ensure calorie adjustments align with goals' },
  { week: 8, focus: 'Adjust seasonal wardrobe (clo value) or duration for sustainable long-term use' },
];

const faqs: [string, string][] = [
  ['How does cold exposure increase calorie burn?', 'Cold environments require extra energy to maintain core temperature. The body increases non-shivering thermogenesis and, at lower temperatures, shivering to produce heat.'],
  ['What is a clo value?', 'Clo measures clothing insulation. Higher clo values (heavy coats) reduce heat loss and thermogenic demand; lighter clothing increases it.'],
  ['Is cold exposure a significant fat-loss tool?', 'It provides a modest calorie boost. Use it alongside consistent nutrition, strength training, and aerobic activity for meaningful fat loss.'],
  ['Can I combine cold exposure with workouts?', 'Yes, but ensure adequate warm-up and cool-down. Many prefer cold exposure after training or on rest days to avoid impairing performance.'],
  ['How long should sessions last?', 'Start with 5–10 minutes and monitor comfort. Gradually increase duration as tolerated while avoiding hypothermia or numbness.'],
  ['What safety precautions should I take?', 'Avoid prolonged exposure in extreme cold, monitor for early hypothermia signs, stay hydrated, and consult a doctor if you have cardiovascular or metabolic conditions.'],
  ['Does body fat level change the effect?', 'Lean individuals feel cold faster and may burn fewer calories due to limited insulation. Body composition influences tolerance and thermogenesis.'],
  ['Should I eat more on cold exposure days?', 'If weight loss stalls, consider the additional calories. Otherwise, keep nutrition consistent and adjust only if chronic fatigue or hunger occurs.'],
  ['Can cold exposure improve recovery?', 'Short bouts may improve inflammation control for some people, but excess cold can hinder muscle growth. Balance exposure with training goals.'],
  ['What’s the difference between ice baths and mild cold exposure?', 'Ice baths provoke intense, short-term stress responses. Mild cold walks or cool showers provide smaller, sustainable thermogenic benefits with lower risk.'],
];

const understandingInputs = [
  { label: 'Ambient Temperature (°C)', description: 'Average outdoor temperature during exposure. Lower temperatures increase thermogenic demand.' },
  { label: 'Exposure Minutes', description: 'Total duration spent in the cold environment for the session you want to analyze.' },
  { label: 'Clothing Insulation (clo)', description: 'Estimated insulation value of clothing; 1 clo ≈ typical indoor clothing, higher values mean warmer attire.' },
];

const calculateThermogenesis = ({ ambientTemp, exposureMinutes, clothingClo }: Required<FormValues>) => {
  const tempDelta = Math.max(0, 22 - ambientTemp); // relative to thermoneutral
  const cloFactor = Math.max(0.2, 1 - clothingClo * 0.2); // heavier clothing reduces demand
  const kcalPerHour = tempDelta * 3 * cloFactor; // heuristic
  const totalKcal = (kcalPerHour * exposureMinutes) / 60;
  return { kcalPerHour, totalKcal };
};

const interpret = (kcalPerHour: number) => {
  if (kcalPerHour >= 40) return 'High thermogenic demand—energy expenditure is notably elevated. Limit duration and prioritize safety.';
  if (kcalPerHour >= 15) return 'Moderate thermogenic demand—meaningful calorie contribution alongside regular training.';
  return 'Low thermogenic demand—useful for acclimation, but calorie impact is small.';
};

const recommendations = (kcalPerHour: number) => [
  'Warm up before exposure and reheat gradually afterward to protect joints and muscles',
  kcalPerHour >= 15
    ? 'Schedule exposure after easier training sessions to avoid compounding fatigue'
    : 'Combine cold walks with light cardio to enhance total energy expenditure',
  'Stay hydrated and monitor skin sensation; add layers or cut sessions short if discomfort rises',
];

const warningSigns = () => [
  'Shivering, numbness, or slurred speech indicate excessive cold—end the session immediately',
  'Individuals with Raynaud’s, cardiovascular issues, or hypothyroidism should obtain medical clearance',
  'Prolonged exposure without sufficient calories can hinder recovery and immune function',
];

export default function CaloricCostOfColdExposureCalculator() {
  const [result, setResult] = useState<ResultPayload | null>(null);
  const form = useForm<FormValues>({
    resolver: zodResolver(formSchema),
    defaultValues: {
      ambientTemp: undefined,
      exposureMinutes: undefined,
      clothingClo: undefined,
    },
  });

  const onSubmit = (values: FormValues) => {
    const { ambientTemp, exposureMinutes, clothingClo } = values;
    if (ambientTemp == null || exposureMinutes == null || clothingClo == null) {
      setResult(null);
      return;
    }

    const { kcalPerHour, totalKcal } = calculateThermogenesis({ ambientTemp, exposureMinutes, clothingClo });

    setResult({
      status: 'Calculated',
      interpretation: interpret(kcalPerHour),
      recommendations: recommendations(kcalPerHour),
      warningSigns: warningSigns(),
      plan: plan(),
      totalKcal: Math.round(totalKcal),
      kcalPerHour: Math.round(kcalPerHour),
    });
  };

  return (
    <div className="space-y-8">
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2"><Snowflake className="h-5 w-5" /> Caloric Cost of Cold Exposure</CardTitle>
          <CardDescription>Estimate extra calories burned while spending time in cold environments.</CardDescription>
        </CardHeader>
        <CardContent>
          <Form {...form}>
            <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-6">
              <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                <FormField
                  control={form.control}
                  name="ambientTemp"
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel className="flex items-center gap-2"><Thermometer className="h-4 w-4" /> Ambient Temperature (°C)</FormLabel>
                      <FormControl>
                        <Input
                          type="number"
                          step="0.1"
                          placeholder="e.g., 5"
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
                  name="exposureMinutes"
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel className="flex items-center gap-2"><Clock className="h-4 w-4" /> Exposure (minutes)</FormLabel>
                      <FormControl>
                        <Input
                          type="number"
                          step="1"
                          placeholder="e.g., 30"
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
                  name="clothingClo"
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel className="flex items-center gap-2"><Shield className="h-4 w-4" /> Clothing Insulation (clo)</FormLabel>
                      <FormControl>
                        <Input
                          type="number"
                          step="0.1"
                          placeholder="e.g., 1.0"
                          value={field.value ?? ''}
                          onChange={(e) => field.onChange(e.target.value === '' ? undefined : Number(e.target.value))}
                        />
                      </FormControl>
                      <FormMessage />
                    </FormItem>
                  )}
                />
              </div>
              <Button type="submit" className="w-full md:w-auto">Estimate Caloric Cost</Button>
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
                <CardTitle>Cold Exposure Summary</CardTitle>
              </div>
              <CardDescription>Thermogenic demand based on temperature, time, and clothing</CardDescription>
            </CardHeader>
            <CardContent className="space-y-4">
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div className="p-4 border rounded">
                  <h4 className="font-semibold text-sm text-muted-foreground">Total Calories Burned</h4>
                  <p className="text-2xl font-bold text-primary">{result.totalKcal} kcal</p>
                </div>
                <div className="p-4 border rounded">
                  <h4 className="font-semibold text-sm text-muted-foreground">Per-Hour Estimate</h4>
                  <p className="text-2xl font-bold text-primary">{result.kcalPerHour} kcal/hour</p>
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
              <CardTitle className="flex items-center gap-2"><Calendar className="h-5 w-5" /> 8-Week Cold Exposure Plan</CardTitle>
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
          <CardDescription>Ensure each value reflects your cold exposure session</CardDescription>
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
          <CardDescription>Complement cold exposure with additional recovery tools</CardDescription>
        </CardHeader>
        <CardContent>
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div className="p-4 border rounded"><h4 className="font-semibold mb-1"><Link href="/category/health-fitness/ice-bath-duration-temp-calculator" className="text-primary hover:underline">Ice Bath Duration</Link></h4><p className="text-sm text-muted-foreground">Plan immersion sessions safely.</p></div>
            <div className="p-4 border rounded"><h4 className="font-semibold mb-1"><Link href="/category/health-fitness/seasonal-energy-expenditure-calculator" className="text-primary hover:underline">Seasonal Energy Expenditure</Link></h4><p className="text-sm text-muted-foreground">Estimate daily thermogenic shifts across seasons.</p></div>
            <div className="p-4 border rounded"><h4 className="font-semibold mb-1"><Link href="/category/health-fitness/daily-calorie-needs-calculator" className="text-primary hover:underline">Daily Calorie Needs</Link></h4><p className="text-sm text-muted-foreground">Integrate cold exposure into your calorie plan.</p></div>
            <div className="p-4 border rounded"><h4 className="font-semibold mb-1"><Link href="/category/health-fitness/hydration-needs-calculator" className="text-primary hover:underline">Hydration Needs</Link></h4><p className="text-sm text-muted-foreground">Support circulatory responses with proper hydration.</p></div>
          </div>
        </CardContent>
      </Card>

      <Card>
        <CardHeader><CardTitle>Complete Guide: Leveraging Cold Exposure</CardTitle></CardHeader>
        <CardContent className="prose prose-sm dark:prose-invert max-w-none">
          <p>Cold environments increase metabolic demand but should be used alongside comprehensive nutrition and training habits. Track how different temperatures, durations, and clothing choices affect recovery, energy, and mood. Safety and gradual progression are paramount.</p>
          <p>Use this calculator to estimate calorie contribution, then evaluate whether adjustments to diet or training are necessary based on weight trends and athletic goals.</p>
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



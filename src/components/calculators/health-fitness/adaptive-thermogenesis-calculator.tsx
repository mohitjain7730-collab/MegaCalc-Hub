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
import { Zap, Gauge, Scale, Timer, Calendar } from 'lucide-react';

const formSchema = z.object({
  baselineMaintenance: z.number().min(1200).max(5000).optional(),
  weightChange: z.number().min(-20).max(10).optional(),
  weeks: z.number().min(1).max(52).optional(),
});

type FormValues = z.infer<typeof formSchema>;

type ResultPayload = {
  status: string;
  interpretation: string;
  recommendations: string[];
  warningSigns: string[];
  plan: { week: number; focus: string }[];
  adaptationKcal: number;
  adjustedMaintenance: number;
  adaptationPercent: number;
};

const plan = (): { week: number; focus: string }[] => [
  { week: 1, focus: 'Audit calorie intake, protein, and resistance training frequency' },
  { week: 2, focus: 'Track daily steps, sleep, and stress to identify hidden adaptation drivers' },
  { week: 3, focus: 'Introduce or maintain heavy compound lifts 2–3 times weekly to preserve lean mass' },
  { week: 4, focus: 'Schedule a refeed or diet break if progress or energy stalls' },
  { week: 5, focus: 'Evaluate hormone and energy markers—adjust training volume if fatigue climbs' },
  { week: 6, focus: 'Recalculate maintenance using updated bodyweight and activity data' },
  { week: 7, focus: 'Periodize cardio and NEAT (non-exercise activity) to maintain energy expenditure' },
  { week: 8, focus: 'Plan the next phase—continued deficit, maintenance, or surplus based on goals' },
];

const faqs: [string, string][] = [
  ['What is adaptive thermogenesis?', 'Adaptive thermogenesis is the reduction in energy expenditure that occurs during weight loss beyond what body mass changes predict. It includes lower resting metabolism, reduced NEAT, and hormonal shifts.'],
  ['Why does my maintenance drop during dieting?', 'The body conserves energy in response to calorie deficits and weight loss. Hormonal changes reduce metabolic rate, and spontaneous movement often decreases.'],
  ['How does this calculator estimate adaptation?', 'It uses recent weight change per week to assign a heuristic percentage (5–12%) reduction of baseline maintenance calories. It is an approximation meant for planning.'],
  ['Can I prevent adaptive thermogenesis?', 'You can mitigate it with resistance training, adequate protein, sufficient sleep, and occasional diet breaks. Complete prevention is unlikely during aggressive deficits.'],
  ['What are diet breaks?', 'Diet breaks are 1–2 week returns to maintenance calories. They can restore hormones, improve training performance, and reduce adaptation.'],
  ['When should I take a refeed?', 'If weight loss stalls, energy crashes, or cravings spike, a 1–2 day refeed at maintenance with higher carbohydrates may help.'],
  ['Does adaptive thermogenesis reverse?', 'Yes, partially. Returning to maintenance calories, regaining some weight, and reducing stress can raise energy expenditure back toward baseline.'],
  ['Should I lower calories further when adaptation occurs?', 'First verify tracking accuracy, training quality, and recovery. If needed, reduce calories modestly (5–10%) or increase activity after considering these factors.'],
  ['How often should I recalculate maintenance?', 'Every 4–6 weeks during active weight change, or sooner if progress stalls and lifestyle factors shift significantly.'],
  ['Is this calculator medical advice?', 'No. It is an educational tool. Consult healthcare providers for personalized nutrition, hormonal, or medical guidance.'],
];

const understandingInputs = [
  { label: 'Baseline Maintenance (kcal)', description: 'Estimated daily calories required to maintain weight before adaptations (from calculators or prior tracking).' },
  { label: 'Recent Weight Change (kg)', description: 'Total change in body weight over the dieting period. Enter negative values for weight loss.' },
  { label: 'Weeks', description: 'Number of weeks over which the weight change occurred to determine rate per week.' },
];

const computeAdaptation = ({ baselineMaintenance, weightChange, weeks }: Required<FormValues>) => {
  const rate = weightChange / weeks; // negative = loss
  let adaptPercent = 0;
  if (rate <= -0.5) adaptPercent = 0.12;
  else if (rate <= -0.35) adaptPercent = 0.1;
  else if (rate <= -0.25) adaptPercent = 0.08;
  else if (rate <= -0.1) adaptPercent = 0.05;
  const adaptationKcal = baselineMaintenance * adaptPercent;
  const adjustedMaintenance = baselineMaintenance - adaptationKcal;
  return { adaptationKcal, adjustedMaintenance, adaptPercent };
};

const interpret = (adaptationKcal: number) => {
  if (adaptationKcal >= 300) return 'Significant adaptive thermogenesis—expect maintenance to run lower than predicted. Plan refeeds or diet breaks.';
  if (adaptationKcal >= 120) return 'Moderate adaptation—monitor hunger, energy, and progress closely.';
  return 'Minimal adaptation—standard calorie calculations remain reliable.';
};

const recommendations = (adaptPercent: number) => [
  adaptPercent >= 0.08
    ? 'Schedule a 1–2 week maintenance break or higher-carb refeeds to alleviate adaptation'
    : 'Maintain a moderate deficit and prioritize resistance training to sustain energy output',
  'Aim for protein intake of 1.6–2.2 g/kg to preserve lean mass during dieting',
  'Track daily steps and spontaneous movement—NEAT often declines during aggressive cuts',
];

const warningSigns = () => [
  'Persistent fatigue, cold intolerance, or menstrual disruption indicate the diet may be too aggressive',
  'Rapid weight regain after the diet suggests metabolic slowdown or unsustainable habits—plan a reverse diet',
  'Consult healthcare providers if thyroid, hormonal, or metabolic issues are suspected',
];

export default function AdaptiveThermogenesisCalculator() {
  const [result, setResult] = useState<ResultPayload | null>(null);
  const form = useForm<FormValues>({
    resolver: zodResolver(formSchema),
    defaultValues: {
      baselineMaintenance: undefined,
      weightChange: undefined,
      weeks: undefined,
    },
  });

  const onSubmit = (values: FormValues) => {
    const { baselineMaintenance, weightChange, weeks } = values;
    if (baselineMaintenance == null || weightChange == null || weeks == null) {
      setResult(null);
      return;
    }

    const { adaptationKcal, adjustedMaintenance, adaptPercent } = computeAdaptation({ baselineMaintenance, weightChange, weeks });

    setResult({
      status: 'Calculated',
      interpretation: interpret(Math.round(adaptationKcal)),
      recommendations: recommendations(adaptPercent),
      warningSigns: warningSigns(),
      plan: plan(),
      adaptationKcal: Math.round(adaptationKcal),
      adjustedMaintenance: Math.round(adjustedMaintenance),
      adaptationPercent: Math.round(adaptPercent * 1000) / 10,
    });
  };

  return (
    <div className="space-y-8">
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2"><Gauge className="h-5 w-5" /> Adaptive Thermogenesis Calculator</CardTitle>
          <CardDescription>Estimate how dieting adapts your maintenance calories over time.</CardDescription>
        </CardHeader>
        <CardContent>
          <Form {...form}>
            <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-6">
              <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                <FormField
                  control={form.control}
                  name="baselineMaintenance"
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel className="flex items-center gap-2"><Gauge className="h-4 w-4" /> Baseline Maintenance (kcal/day)</FormLabel>
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
                  name="weightChange"
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel className="flex items-center gap-2"><Scale className="h-4 w-4" /> Recent Weight Change (kg)</FormLabel>
                      <FormControl>
                        <Input
                          type="number"
                          step="0.1"
                          placeholder="e.g., -3"
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
                  name="weeks"
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel className="flex items-center gap-2"><Timer className="h-4 w-4" /> Weeks</FormLabel>
                      <FormControl>
                        <Input
                          type="number"
                          step="1"
                          placeholder="e.g., 6"
                          value={field.value ?? ''}
                          onChange={(e) => field.onChange(e.target.value === '' ? undefined : Number(e.target.value))}
                        />
                      </FormControl>
                      <FormMessage />
                    </FormItem>
                  )}
                />
              </div>
              <Button type="submit" className="w-full md:w-auto">Estimate Adaptation</Button>
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
                <CardTitle>Adaptive Thermogenesis Summary</CardTitle>
              </div>
              <CardDescription>Estimated reduction from baseline maintenance calories</CardDescription>
            </CardHeader>
            <CardContent className="space-y-4">
              <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                <div className="p-4 border rounded">
                  <h4 className="font-semibold text-sm text-muted-foreground">Maintenance Reduction</h4>
                  <p className="text-2xl font-bold text-primary">-{result.adaptationKcal} kcal/day</p>
                </div>
                <div className="p-4 border rounded">
                  <h4 className="font-semibold text-sm text-muted-foreground">Adjusted Maintenance</h4>
                  <p className="text-2xl font-bold text-primary">{result.adjustedMaintenance} kcal/day</p>
                </div>
                <div className="p-4 border rounded">
                  <h4 className="font-semibold text-sm text-muted-foreground">Adaptation Percent</h4>
                  <p className="text-2xl font-bold text-primary">{result.adaptationPercent}%</p>
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
              <CardTitle className="flex items-center gap-2"><Calendar className="h-5 w-5" /> 8-Week Adaptation Management Plan</CardTitle>
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
          <CardDescription>Gather accurate data before estimating adaptations</CardDescription>
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
          <CardDescription>Round out your energy expenditure tracking</CardDescription>
        </CardHeader>
        <CardContent>
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div className="p-4 border rounded"><h4 className="font-semibold mb-1"><Link href="/category/health-fitness/thyroid-function-basal-energy-calculator" className="text-primary hover:underline">Thyroid Basal Energy</Link></h4><p className="text-sm text-muted-foreground">Assess how thyroid markers influence metabolism.</p></div>
            <div className="p-4 border rounded"><h4 className="font-semibold mb-1"><Link href="/category/health-fitness/daily-calorie-needs-calculator" className="text-primary hover:underline">Daily Calorie Needs</Link></h4><p className="text-sm text-muted-foreground">Translate maintenance shifts into daily targets.</p></div>
            <div className="p-4 border rounded"><h4 className="font-semibold mb-1"><Link href="/category/health-fitness/caloric-cost-of-cold-exposure-calculator" className="text-primary hover:underline">Cold Exposure Cost</Link></h4><p className="text-sm text-muted-foreground">See how environmental factors alter energy requirements.</p></div>
            <div className="p-4 border rounded"><h4 className="font-semibold mb-1"><Link href="/category/health-fitness/cheat-meal-impact-on-weekly-calories-calculator" className="text-primary hover:underline">Cheat Meal Impact</Link></h4><p className="text-sm text-muted-foreground">Balance refeeds and indulgences within weekly totals.</p></div>
          </div>
        </CardContent>
      </Card>

      <Card>
        <CardHeader><CardTitle>Complete Guide: Managing Adaptive Thermogenesis</CardTitle></CardHeader>
        <CardContent className="prose prose-sm dark:prose-invert max-w-none">
          <p>Adaptive thermogenesis is a normal response to energy deficits. Combine resistance training, strategic refeeds, and monitored activity levels to keep metabolism resilient. Reassess maintenance calories periodically and adjust the plan before plateaus become frustrating.</p>
          <p>Use this calculator as a planning aid, not a definitive measurement. Pair estimates with body composition metrics, hunger cues, and athletic performance for informed decisions.</p>
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



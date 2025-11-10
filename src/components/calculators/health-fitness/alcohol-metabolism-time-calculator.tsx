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
import { Zap, Wine, Timer, Droplets, Calendar } from 'lucide-react';

const formSchema = z.object({
  standardDrinks: z.number().min(0).max(20).optional(),
  metabolismRateMgDlHr: z.number().min(5).max(25).optional(),
});

type FormValues = z.infer<typeof formSchema>;

type PlanStep = { week: number; focus: string };

type ResultPayload = {
  status: string;
  interpretation: string;
  recommendations: string[];
  warningSigns: string[];
  plan: PlanStep[];
  hoursToZero: number;
};

const plan = (): PlanStep[] => [
  { week: 1, focus: 'Log typical drinking occasions and number of standard drinks' },
  { week: 2, focus: 'Introduce alcohol-free days and ensure adequate hydration' },
  { week: 3, focus: 'Pair drinks with meals rich in protein and healthy fats to slow absorption' },
  { week: 4, focus: 'Schedule transportation and recovery time before late-night events' },
  { week: 5, focus: 'Monitor sleep, HRV, or morning readiness scores after drinking' },
  { week: 6, focus: 'Reduce total drinks or pace (one drink per hour) to shorten clearance time' },
  { week: 7, focus: 'Experiment with lower-alcohol beverages or mocktails' },
  { week: 8, focus: 'Reassess habits and set guidelines aligned with health and performance goals' },
];

const faqs: [string, string][] = [
  ['What is a standard drink?', 'In the U.S., a standard drink contains about 14 g of pure alcohol: 12 oz beer (5%), 5 oz wine (12%), or 1.5 oz distilled spirits (40%). Tracking standard drinks helps estimate blood alcohol concentration accurately.'],
  ['How long does it take to metabolize one drink?', 'On average, the liver metabolizes roughly one standard drink per hour, though genetics, sex, body mass, and liver health influence the exact rate.'],
  ['Does food affect metabolism time?', 'Food slows absorption, resulting in lower peak BAC but not necessarily faster clearance. Eating before or while drinking can temper spikes and support gut health.'],
  ['Can hydration speed up alcohol metabolism?', 'Hydration supports recovery but does not significantly accelerate liver metabolism. It helps dilute acetaldehyde, reduces hangover severity, and supports sleep quality.'],
  ['How accurate is this calculator?', 'It provides an estimate based on average BAC changes. Individual variation is high, so never rely solely on calculations to determine driving fitness or sobriety.'],
  ['Do women metabolize alcohol differently?', 'Yes. Due to lower body water and different enzyme activity, women often reach higher BAC levels with the same number of drinks. Many metabolize alcohol slightly slower.'],
  ['What if I mix alcohol with medication?', 'Combining alcohol with sedatives, pain relievers, or certain prescriptions can be dangerous and may extend impairment. Consult your physician and avoid mixing without medical guidance.'],
  ['How does sleep impact recovery?', 'Alcohol disrupts REM sleep, increases wakefulness, and impairs recovery. Allow extra sleep opportunity and prioritize alcohol-free nights before demanding training or work.'],
  ['Can exercise help me sober up?', 'Exercise may make you feel alert but does not speed hepatic metabolism. Always wait until you are fully sober—ideally confirmed by time, breathalyzer, or medical advice—before driving.'],
  ['What are safer drinking practices?', 'Set drink limits, alternate alcoholic beverages with water, avoid binge drinking, arrange transportation, and check in with healthcare professionals if alcohol use affects health or wellbeing.'],
];

export default function AlcoholMetabolismTimeCalculator() {
  const [result, setResult] = useState<ResultPayload | null>(null);
  const form = useForm<FormValues>({
    resolver: zodResolver(formSchema),
    defaultValues: {
      standardDrinks: undefined,
      metabolismRateMgDlHr: undefined,
    },
  });

  const onSubmit = (values: FormValues) => {
    const { standardDrinks, metabolismRateMgDlHr } = values;
    if (standardDrinks == null || metabolismRateMgDlHr == null) {
      setResult(null);
      return;
    }

    const startingBacMgDl = standardDrinks * 0.02 * 100; // 0.02% BAC per drink → mg/dL
    const hoursToZero = startingBacMgDl / metabolismRateMgDlHr;

    const interpretation =
      hoursToZero >= 12
        ? 'Expect prolonged clearance—plan safe transportation, hydration, and ample sleep.'
        : hoursToZero >= 6
        ? 'Several hours to metabolize—avoid driving or complex tasks until fully sober.'
        : 'Clearance within a few hours—still allow extra time and monitor how you feel before driving.';

    const recommendations = [
      'Cap sessions to a number of drinks that fits your planned recovery window',
      'Schedule protein-rich meals and plenty of water before, during, and after drinking',
      'Leave 8+ hours between last drink and strenuous training or work requiring precision',
    ];

    const warningSigns = [
      'Feeling impaired despite calculated clearance indicates individual variation—never rely solely on estimates',
      'Mixing alcohol with sedatives or poor sleep magnifies impairment even after BAC appears low',
      'Regular heavy drinking can slow metabolism and damage liver health—seek medical advice if concerned',
    ];

    setResult({
      status: 'Calculated',
      interpretation,
      recommendations,
      warningSigns,
      plan: plan(),
      hoursToZero: Math.round(Math.max(hoursToZero, 0) * 10) / 10,
    });
  };

  return (
    <div className="space-y-8">
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2"><Wine className="h-5 w-5" /> Alcohol Metabolism Time</CardTitle>
          <CardDescription>Estimate how long it takes to metabolize your alcohol intake</CardDescription>
        </CardHeader>
        <CardContent>
          <Form {...form}>
            <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-6">
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <FormField
                  control={form.control}
                  name="standardDrinks"
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel className="flex items-center gap-2"><Wine className="h-4 w-4" /> Standard Drinks</FormLabel>
                      <FormControl>
                        <Input
                          type="number"
                          step="1"
                          placeholder="e.g., 3"
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
                  name="metabolismRateMgDlHr"
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel className="flex items-center gap-2"><Timer className="h-4 w-4" /> Metabolism Rate (mg/dL/hr)</FormLabel>
                      <FormControl>
                        <Input
                          type="number"
                          step="0.5"
                          placeholder="e.g., 15"
                          value={field.value ?? ''}
                          onChange={(e) => field.onChange(e.target.value === '' ? undefined : Number(e.target.value))}
                        />
                      </FormControl>
                      <FormMessage />
                    </FormItem>
                  )}
                />
              </div>
              <Button type="submit" className="w-full md:w-auto">Estimate Metabolism Time</Button>
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
                <CardTitle>Estimated Hours to Sober</CardTitle>
              </div>
              <CardDescription>Approximate time for BAC to reach zero</CardDescription>
            </CardHeader>
            <CardContent className="space-y-2">
              <p className="text-3xl font-bold text-primary">{result.hoursToZero} hours</p>
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
              <CardTitle className="flex items-center gap-2"><Calendar className="h-5 w-5" /> 8-Week Safer Drinking Plan</CardTitle>
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
          <CardDescription>Plan recovery and hydration after alcohol</CardDescription>
        </CardHeader>
        <CardContent>
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div className="p-4 border rounded"><h4 className="font-semibold mb-1"><Link href="/category/health-fitness/alcohol-calorie-impact-calculator" className="text-primary hover:underline">Alcohol Calorie Impact</Link></h4><p className="text-sm text-muted-foreground">Track liquid calories alongside metabolism estimates.</p></div>
            <div className="p-4 border rounded"><h4 className="font-semibold mb-1"><Link href="/category/health-fitness/hydration-needs-calculator" className="text-primary hover:underline">Hydration Needs Calculator</Link></h4><p className="text-sm text-muted-foreground">Set water targets to aid recovery and reduce hangovers.</p></div>
            <div className="p-4 border rounded"><h4 className="font-semibold mb-1"><Link href="/category/health-fitness/daily-calorie-needs-calculator" className="text-primary hover:underline">Daily Calorie Needs</Link></h4><p className="text-sm text-muted-foreground">Factor alcohol energy into your total daily intake.</p></div>
            <div className="p-4 border rounded"><h4 className="font-semibold mb-1"><Link href="/category/cognitive-psychology/sleep-debt-calculator" className="text-primary hover:underline">Sleep Debt Calculator</Link></h4><p className="text-sm text-muted-foreground">Assess sleep recovery after late-night drinking.</p></div>
          </div>
        </CardContent>
      </Card>

      <Card>
        <CardHeader><CardTitle>Complete Guide: Alcohol Clearance & Safety</CardTitle></CardHeader>
        <CardContent className="prose prose-sm dark:prose-invert max-w-none">
          <p>Alcohol metabolism occurs primarily in the liver at a relatively fixed rate. While caffeine, cold showers, or exercise can improve alertness, they do not speed hepatic clearance. Plan ahead so you never drive or operate machinery before full sobriety.</p>
          <p>Hydration, nutrient-dense meals, and adequate sleep are essential to recover from even moderate drinking. Monitor how alcohol affects your mood, performance, and health markers, and seek professional advice if consumption becomes difficult to control.</p>
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



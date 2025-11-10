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
import { Zap, Snowflake, Thermometer, Timer, Calendar, Gauge } from 'lucide-react';

const formSchema = z.object({
  ambientTemp: z.number().min(0).max(30).optional(),
  exposureMinutes: z.number().min(5).max(240).optional(),
  restingMetabolicRate: z.number().min(800).max(4000).optional(),
});

type FormValues = z.infer<typeof formSchema>;

type ResultPayload = {
  status: string;
  interpretation: string;
  recommendations: string[];
  warningSigns: string[];
  plan: { week: number; focus: string }[];
  extraCalories: number;
  totalCalories: number;
  percentIncrease: number;
};

const plan = (): { week: number; focus: string }[] => [
  { week: 1, focus: 'Log current cold exposure habits and note perceived comfort and shivering onset' },
  { week: 2, focus: 'Introduce short (10–15 min) mild cold sessions with light movement after warm-up' },
  { week: 3, focus: 'Pair cold exposure with breathing exercises to improve tolerance and relaxation' },
  { week: 4, focus: 'Alternate exposure days with active recovery to prevent chronic fatigue' },
  { week: 5, focus: 'Assess skin responses and adjust clothing layers; avoid numbing extremities' },
  { week: 6, focus: 'Coordinate caloric intake on heavy training days to avoid energy deficits' },
  { week: 7, focus: 'Experiment with contrasting warm-cold showers for circulation benefits' },
  { week: 8, focus: 'Review progress; set sustainable cold exposure frequency for long-term use' },
];

const faqs: [string, string][] = [
  ['What is brown fat?', 'Brown adipose tissue (BAT) is metabolically active fat that burns energy to generate heat, especially during cold exposure.'],
  ['How does cold activate brown fat?', 'Temperatures below thermoneutral (~24°C) stimulate sympathetic nerves, increasing BAT activity and non-shivering thermogenesis.'],
  ['How accurate is this estimator?', 'It provides a heuristic based on ambient temperature, exposure duration, and resting metabolism. Individual responses vary widely due to acclimation, body composition, and genetics.'],
  ['Can brown fat aid fat loss?', 'BAT activation adds small to moderate calorie burn. It should complement, not replace, consistent nutrition and exercise habits.'],
  ['Is shivering necessary?', 'No. Mild cold that avoids shivering can still activate brown fat. Shivering significantly raises calorie burn but may be uncomfortable and unsustainable.'],
  ['What temperatures work best?', 'Many protocols use 10–18°C environments. Lower temperatures increase thermogenic demand but require more caution to avoid hypothermia.'],
  ['Should I eat differently on cold exposure days?', 'Ensure adequate calories and micronutrients, especially if using cold exposure alongside heavy training or dieting. Warm post-session meals improve comfort.'],
  ['Can anyone try cold exposure?', 'People with cardiovascular, respiratory, or thyroid conditions should consult healthcare providers before starting. Gradual progression is recommended for everyone.'],
  ['How long do sessions need to be?', 'Start with 5–10 minutes and gradually increase to 20–60 minutes as tolerated. Quality and safety outweigh duration.'],
  ['What about contrast therapy?', 'Alternating hot and cold can improve circulation and recovery. This calculator focuses on steady cold exposure but contrast protocols may deliver similar benefits with less discomfort.'],
];

const understandingInputs = [
  { label: 'Ambient temperature (°C)', description: 'Average temperature of the cold environment. Lower values increase thermogenic demand.' },
  { label: 'Exposure duration (minutes)', description: 'Total time spent in the cold environment for the planned session.' },
  { label: 'Resting metabolic rate (kcal/day)', description: 'Baseline daily calorie expenditure used to estimate session energy cost.' },
];

const calculateActivation = ({ ambientTemp, exposureMinutes, restingMetabolicRate }: Required<FormValues>) => {
  const thermoneutral = 24; // °C
  const temperatureDrop = Math.max(0, thermoneutral - ambientTemp);
  const increasePercent = Math.min(0.5, temperatureDrop * 0.02); // cap at 50%
  const restCaloriesPerMinute = restingMetabolicRate / 1440;
  const baselineCalories = restCaloriesPerMinute * exposureMinutes;
  const extraCalories = baselineCalories * increasePercent;
  const totalCalories = baselineCalories + extraCalories;
  return { extraCalories, totalCalories, increasePercent };
};

const interpret = (increasePercent: number) => {
  if (increasePercent >= 0.4) return 'Large thermogenic response—ensure gradual progression and monitor comfort to avoid overexposure.';
  if (increasePercent >= 0.2) return 'Moderate brown fat activation expected. Pair sessions with adequate nutrition and recovery.';
  return 'Mild activation—use consistent sessions and supportive lifestyle habits for cumulative benefits.';
};

const recommendations = (increasePercent: number) => [
  increasePercent < 0.2
    ? 'Consider slightly cooler environments or longer sessions once you tolerate the current protocol'
    : 'Balance cold days with rest or light activity to maintain recovery',
  'Perform gentle movement (walking, mobility) during exposure to stay comfortable and enhance heat generation',
  'Warm up gradually afterward with layers, warm fluids, and nutrient-dense meals',
];

const warningSigns = () => [
  'Shivering, numbness, or confusion indicate overexposure—stop and rewarm immediately',
  'People with cardiovascular, respiratory, or thyroid issues need medical clearance before cold exposure routines',
  'Avoid combining severe calorie deficits with frequent cold sessions; energy availability is essential for health',
];

export default function BrownFatActivationEstimator() {
  const [result, setResult] = useState<ResultPayload | null>(null);
  const form = useForm<FormValues>({
    resolver: zodResolver(formSchema),
    defaultValues: {
      ambientTemp: undefined,
      exposureMinutes: undefined,
      restingMetabolicRate: undefined,
    },
  });

  const onSubmit = (values: FormValues) => {
    const { ambientTemp, exposureMinutes, restingMetabolicRate } = values;
    if (ambientTemp == null || exposureMinutes == null || restingMetabolicRate == null) {
      setResult(null);
      return;
    }

    const { extraCalories, totalCalories, increasePercent } = calculateActivation({
      ambientTemp,
      exposureMinutes,
      restingMetabolicRate,
    });

    setResult({
      status: 'Calculated',
      interpretation: interpret(increasePercent),
      recommendations: recommendations(increasePercent),
      warningSigns: warningSigns(),
      plan: plan(),
      extraCalories: Math.round(extraCalories),
      totalCalories: Math.round(totalCalories),
      percentIncrease: Math.round(increasePercent * 1000) / 10,
    });
  };

  return (
    <div className="space-y-8">
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2"><Snowflake className="h-5 w-5" /> Brown Fat Activation Estimator</CardTitle>
          <CardDescription>Approximate additional calories burned during mild cold exposure.</CardDescription>
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
                          placeholder="e.g., 18"
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
                      <FormLabel className="flex items-center gap-2"><Timer className="h-4 w-4" /> Exposure Duration (minutes)</FormLabel>
                      <FormControl>
                        <Input
                          type="number"
                          step="1"
                          placeholder="e.g., 45"
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
                  name="restingMetabolicRate"
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel className="flex items-center gap-2"><Gauge className="h-4 w-4" /> RMR (kcal/day)</FormLabel>
                      <FormControl>
                        <Input
                          type="number"
                          step="10"
                          placeholder="e.g., 1600"
                          value={field.value ?? ''}
                          onChange={(e) => field.onChange(e.target.value === '' ? undefined : Number(e.target.value))}
                        />
                      </FormControl>
                      <FormMessage />
                    </FormItem>
                  )}
                />
              </div>
              <Button type="submit" className="w-full md:w-auto">Estimate Activation</Button>
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
                <CardTitle>Activation Summary</CardTitle>
              </div>
              <CardDescription>Estimated thermogenic response to the cold session</CardDescription>
            </CardHeader>
            <CardContent className="space-y-4">
              <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                <div className="p-4 border rounded">
                  <h4 className="font-semibold text-sm text-muted-foreground">Extra Calories</h4>
                  <p className="text-2xl font-bold text-primary">{result.extraCalories} kcal</p>
                </div>
                <div className="p-4 border rounded">
                  <h4 className="font-semibold text-sm text-muted-foreground">Total Session Calories</h4>
                  <p className="text-2xl font-bold text-primary">{result.totalCalories} kcal</p>
                </div>
                <div className="p-4 border rounded">
                  <h4 className="font-semibold text-sm text-muted-foreground">Increase vs Rest</h4>
                  <p className="text-2xl font-bold text-primary">{result.percentIncrease}%</p>
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
              <CardTitle className="flex items-center gap-2"><Calendar className="h-5 w-5" /> 8-Week Cold Adaptation Plan</CardTitle>
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
          <CardDescription>Collect accurate exposure data before estimating</CardDescription>
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
          <CardDescription>Plan thermogenesis sessions with additional tools</CardDescription>
        </CardHeader>
        <CardContent>
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div className="p-4 border rounded"><h4 className="font-semibold mb-1"><Link href="/category/health-fitness/caloric-cost-of-cold-exposure-calculator" className="text-primary hover:underline">Caloric Cost of Cold Exposure</Link></h4><p className="text-sm text-muted-foreground">Estimate thermogenesis across various temperatures and clothing.</p></div>
            <div className="p-4 border rounded"><h4 className="font-semibold mb-1"><Link href="/category/health-fitness/seasonal-energy-expenditure-calculator" className="text-primary hover:underline">Seasonal Energy Expenditure</Link></h4><p className="text-sm text-muted-foreground">Adjust calorie targets across temperature swings.</p></div>
            <div className="p-4 border rounded"><h4 className="font-semibold mb-1"><Link href="/category/health-fitness/adaptive-thermogenesis-calculator" className="text-primary hover:underline">Adaptive Thermogenesis</Link></h4><p className="text-sm text-muted-foreground">Manage metabolic changes during weight loss phases.</p></div>
            <div className="p-4 border rounded"><h4 className="font-semibold mb-1"><Link href="/category/health-fitness/daily-calorie-needs-calculator" className="text-primary hover:underline">Daily Calorie Needs</Link></h4><p className="text-sm text-muted-foreground">Anchor cold exposure routines to overall energy planning.</p></div>
          </div>
        </CardContent>
      </Card>

      <Card>
        <CardHeader><CardTitle>Complete Guide: Leveraging Brown Fat</CardTitle></CardHeader>
        <CardContent className="prose prose-sm dark:prose-invert max-w-none">
          <p>Cold exposure can modestly increase energy expenditure by activating brown adipose tissue. Combine controlled exposure with balanced nutrition, resistance training, and adequate sleep to maximize benefits while protecting recovery.</p>
          <p>Start gradually, monitor how your body responds, and consult healthcare professionals when integrating cold protocols into comprehensive fitness or weight-management strategies.</p>
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

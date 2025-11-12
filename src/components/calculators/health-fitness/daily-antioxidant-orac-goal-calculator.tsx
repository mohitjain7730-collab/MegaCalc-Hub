'use client';

import { useState } from 'react';
import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import { z } from 'zod';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Form, FormControl, FormField, FormItem, FormLabel, FormMessage } from '@/components/ui/form';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import Link from 'next/link';
import { Leaf, Activity, Calendar, AlertTriangle } from 'lucide-react';

const activitySchema = z.enum(['low', 'moderate', 'high']);

const formSchema = z.object({
  activityLevel: activitySchema,
  servingsFruitVeg: z
    .number({ invalid_type_error: 'Enter number of servings' })
    .min(0, 'Use non-negative servings')
    .max(30, 'Enter a realistic number of servings'),
  averageOracPerServing: z
    .number({ invalid_type_error: 'Enter average ORAC score' })
    .min(0, 'Use non-negative ORAC values')
    .max(50000, 'ORAC per serving is unusually high'),
  additionalOrac: z
    .number({ invalid_type_error: 'Enter additional ORAC' })
    .min(0)
    .max(50000)
    .optional(),
});

type FormValues = z.infer<typeof formSchema>;

type ResultPayload = {
  totalOrac: number;
  targetMin: number;
  targetMax: number;
  deltaFromMin: number;
  interpretation: string;
  recommendations: string[];
  warningSigns: string[];
  plan: { week: number; focus: string }[];
};

const understandingInputs = [
  {
    label: 'Activity Level',
    description: 'Higher activity and stress increase oxidative load and raise the suggested antioxidant range.',
  },
  {
    label: 'Fruit & Vegetable Servings',
    description: 'Count standard servings (1 cup raw leafy greens, ½ cup cooked vegetables, 1 medium fruit, etc.).',
  },
  {
    label: 'Average ORAC per Serving',
    description: 'Estimate the typical antioxidant content of your produce choices (berries and spices are higher than pale produce).',
  },
  {
    label: 'Additional ORAC Sources',
    description: 'Optional field for tea, coffee, dark chocolate, supplements, or concentrated powders.',
  },
];

const faqs: [string, string][] = [
  ['What is an ORAC score?', 'ORAC (Oxygen Radical Absorbance Capacity) measures how well foods neutralize free radicals. Higher scores indicate stronger antioxidant capacity.'],
  ['What is a good daily ORAC target?', 'Most experts recommend at least 5,000 ORAC units daily, with 10,000–15,000 for highly active or stressed individuals.'],
  ['Why did the USDA stop publishing ORAC data?', 'Concerns about misuse in marketing led to discontinuation, but ORAC is still useful for comparing antioxidant density when interpreted responsibly.'],
  ['Which foods are highest in antioxidants?', 'Wild berries, colorful fruits, leafy greens, herbs, spices (clove, cinnamon, oregano), cocoa, nuts, and legumes rank among the top.'],
  ['Do antioxidant supplements replace food?', 'Whole foods deliver fiber, vitamins, minerals, and phytochemicals. Supplements may support gaps but should not replace a produce-rich diet.'],
  ['Can you have too many antioxidants?', 'Food-based antioxidants are generally safe. Excessive supplemental doses can interfere with beneficial oxidative signaling.'],
  ['Does cooking reduce antioxidant content?', 'Some compounds like vitamin C decrease with heat, while others (lycopene, beta-carotene) become more bioavailable. Combine raw and cooked options.'],
  ['How fast can I improve my ORAC score?', 'Adding two extra servings of colorful produce and antioxidant beverages can raise daily totals by 3,000–5,000 units within days.'],
  ['How do antioxidants affect recovery?', 'They help reduce exercise-induced oxidative stress, supporting immune function and recovery. Timing matters—priority is overall dietary pattern.'],
  ['Should I track ORAC daily?', 'Use ORAC as a periodic audit tool. Monitoring weekly averages is sufficient unless following a clinical protocol.'],
];

const plan = (): { week: number; focus: string }[] => [
  { week: 1, focus: 'Log current antioxidant-rich foods to identify baseline ORAC intake.' },
  { week: 2, focus: 'Add at least one deeply colored fruit (berries, cherries) to breakfast or snacks.' },
  { week: 3, focus: 'Incorporate leafy greens and cruciferous vegetables into lunch and dinner.' },
  { week: 4, focus: 'Use herbs and spices (turmeric, oregano, cinnamon) daily—small amounts yield big ORAC boosts.' },
  { week: 5, focus: 'Swap sugary drinks for green tea, hibiscus tea, or unsweetened cocoa beverages.' },
  { week: 6, focus: 'Include legumes or dark beans three times per week to raise polyphenol intake.' },
  { week: 7, focus: 'Review stress levels, sleep quality, and adjust antioxidant intake accordingly.' },
  { week: 8, focus: 'Recalculate ORAC totals, adjust servings, and plan seasonal produce rotations.' },
];

const warningSigns = () => [
  'Extremely high-dose antioxidant supplements (vitamin E, beta-carotene) may interact with medications—consult a professional.',
  'Individuals undergoing chemotherapy or radiation should discuss antioxidant use with their care team.',
  'Food allergies or FODMAP sensitivities may limit certain antioxidant sources; personalize choices accordingly.',
];

const activityTargets: Record<FormValues['activityLevel'], { min: number; max: number }> = {
  low: { min: 3000, max: 5000 },
  moderate: { min: 5000, max: 10000 },
  high: { min: 10000, max: 15000 },
};

const interpretOrac = (total: number, min: number, max: number): string => {
  if (total < min) {
    return `Your estimated daily ORAC (${total.toLocaleString()} units) is below the suggested range (${min.toLocaleString()}–${max.toLocaleString()}). Add more colorful produce, herbs, and antioxidant beverages.`;
  }
  if (total > max) {
    return `Your ORAC score (${total.toLocaleString()} units) exceeds the typical range. Food-based antioxidants are safe, but review supplement doses to avoid over-supplementation.`;
  }
  return `Great job! Your ORAC score (${total.toLocaleString()} units) sits within the targeted range. Maintain variety in fruits, vegetables, and spices for broad-spectrum protection.`;
};

const recommendations = (total: number, min: number, max: number) => {
  const base = [
    'Build meals around a rainbow of produce—dark greens, reds, blues, purples, and oranges provide diverse antioxidants.',
    'Flavor foods with herbs and spices; even a teaspoon of turmeric or oregano significantly boosts ORAC.',
    'Choose minimally processed foods to preserve polyphenols and vitamins.',
  ];
  if (total < min) {
    return [
      ...base,
      'Add two antioxidant-rich servings daily (e.g., berries with breakfast, leafy greens at lunch).',
      'Sip green tea, hibiscus tea, or fresh-pressed juices instead of sugary drinks.',
    ];
  }
  if (total > max) {
    return [
      ...base,
      'Assess supplemental antioxidants and adjust doses if exceeding recommended amounts.',
      'Prioritize whole foods over concentrated powders unless guided by a clinician.',
    ];
  }
  return [
    ...base,
    'Maintain variety by rotating seasonal produce and experimenting with global spice blends.',
    'Pair antioxidants with healthy fats (avocado, olive oil, nuts) to improve absorption of fat-soluble compounds.',
  ];
};

const calculateOrac = (values: FormValues): ResultPayload => {
  const total = Math.round(values.servingsFruitVeg * values.averageOracPerServing + (values.additionalOrac ?? 0));
  const { min, max } = activityTargets[values.activityLevel];
  const delta = total - min;
  return {
    totalOrac: total,
    targetMin: min,
    targetMax: max,
    deltaFromMin: delta,
    interpretation: interpretOrac(total, min, max),
    recommendations: recommendations(total, min, max),
    warningSigns: warningSigns(),
    plan: plan(),
  };
};

export default function DailyAntioxidantOracGoalCalculator() {
  const [result, setResult] = useState<ResultPayload | null>(null);

  const form = useForm<FormValues>({
    resolver: zodResolver(formSchema),
    defaultValues: {
      activityLevel: undefined,
      servingsFruitVeg: undefined,
      averageOracPerServing: undefined,
      additionalOrac: undefined,
    },
  });

  const onSubmit = (values: FormValues) => {
    setResult(calculateOrac(values));
  };

  return (
    <div className="space-y-8">
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2"><Leaf className="h-5 w-5" /> Daily Antioxidant (ORAC) Goal Calculator</CardTitle>
          <CardDescription>Estimate daily antioxidant load and compare it with activity-based targets for oxidative stress defense.</CardDescription>
        </CardHeader>
        <CardContent>
          <Form {...form}>
            <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-6">
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <FormField control={form.control} name="activityLevel" render={({ field }) => (
                  <FormItem>
                    <FormLabel>Activity / Stress Level</FormLabel>
                    <Select onValueChange={field.onChange} value={field.value}>
                      <FormControl>
                        <SelectTrigger>
                          <SelectValue placeholder="Select activity level" />
                        </SelectTrigger>
                      </FormControl>
                      <SelectContent>
                        <SelectItem value="low">Low – sedentary or light activity</SelectItem>
                        <SelectItem value="moderate">Moderate – regular exercise or moderate stress</SelectItem>
                        <SelectItem value="high">High – intense training, high stress, or polluted environment</SelectItem>
                      </SelectContent>
                    </Select>
                    <FormMessage />
                  </FormItem>
                )} />
                <FormField control={form.control} name="servingsFruitVeg" render={({ field }) => (
                  <FormItem>
                    <FormLabel>Fruit & Vegetable Servings (per day)</FormLabel>
                    <FormControl>
                      <Input
                        type="number"
                        step="0.5"
                        placeholder="e.g., 8"
                        value={field.value ?? ''}
                        onChange={(event) => field.onChange(event.target.value === '' ? undefined : Number(event.target.value))}
                      />
                    </FormControl>
                    <FormMessage />
                  </FormItem>
                )} />
                <FormField control={form.control} name="averageOracPerServing" render={({ field }) => (
                  <FormItem>
                    <FormLabel>Average ORAC per Serving</FormLabel>
                    <FormControl>
                      <Input
                        type="number"
                        step="100"
                        placeholder="e.g., 1200"
                        value={field.value ?? ''}
                        onChange={(event) => field.onChange(event.target.value === '' ? undefined : Number(event.target.value))}
                      />
                    </FormControl>
                    <FormMessage />
                  </FormItem>
                )} />
                <FormField control={form.control} name="additionalOrac" render={({ field }) => (
                  <FormItem>
                    <FormLabel>Additional ORAC (tea, cocoa, supplements)</FormLabel>
                    <FormControl>
                      <Input
                        type="number"
                        step="100"
                        placeholder="Optional, e.g., 1500"
                        value={field.value ?? ''}
                        onChange={(event) => field.onChange(event.target.value === '' ? undefined : Number(event.target.value))}
                      />
                    </FormControl>
                    <FormMessage />
                  </FormItem>
                )} />
              </div>
              <Button type="submit" className="w-full md:w-auto">Estimate Daily ORAC</Button>
            </form>
          </Form>
        </CardContent>
      </Card>

      {result && (
        <div className="space-y-6">
          <Card>
            <CardHeader>
              <div className="flex items-center gap-4"><Activity className="h-8 w-8 text-primary" /><CardTitle>Antioxidant Summary</CardTitle></div>
              <CardDescription>Compare your ORAC score with target ranges</CardDescription>
            </CardHeader>
            <CardContent className="space-y-4">
              <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                <div className="p-4 border rounded">
                  <h4 className="text-sm font-semibold text-muted-foreground">Estimated Daily ORAC</h4>
                  <p className="text-2xl font-bold text-primary">{result.totalOrac.toLocaleString()} units</p>
                </div>
                <div className="p-4 border rounded">
                  <h4 className="text-sm font-semibold text-muted-foreground">Target Range</h4>
                  <p className="text-lg font-bold text-primary">
                    {result.targetMin.toLocaleString()}–{result.targetMax.toLocaleString()}
                  </p>
                </div>
                <div className="p-4 border rounded">
                  <h4 className="text-sm font-semibold text-muted-foreground">Gap vs. Minimum</h4>
                  <p className="text-lg font-bold text-primary">
                    {result.deltaFromMin >= 0 ? '+' : ''}{result.deltaFromMin.toLocaleString()} units
                  </p>
                </div>
              </div>
              <p className="text-sm text-muted-foreground">{result.interpretation}</p>
            </CardContent>
          </Card>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            <Card>
              <CardHeader>
                <CardTitle>Recommendations</CardTitle>
              </CardHeader>
              <CardContent>
                <ul className="space-y-2">
                  {result.recommendations.map((item, index) => (
                    <li key={index} className="text-sm text-muted-foreground">{item}</li>
                  ))}
                </ul>
              </CardContent>
            </Card>
            <Card>
              <CardHeader>
                <CardTitle className="flex items-center gap-2"><AlertTriangle className="h-4 w-4" /> Warning Signs & Precautions</CardTitle>
              </CardHeader>
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
              <CardTitle className="flex items-center gap-2"><Calendar className="h-5 w-5" /> 8‑Week Antioxidant Upgrade Plan</CardTitle>
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
          <CardDescription>Collect the right data for accurate ORAC estimates</CardDescription>
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
          <CardDescription>Pair antioxidants with complementary nutrition tools</CardDescription>
        </CardHeader>
        <CardContent>
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div className="p-4 border rounded">
              <h4 className="font-semibold mb-1">
                <Link href="/category/health-fitness/fiber-intake-calculator" className="text-primary hover:underline">
                  Fiber Intake Calculator
                </Link>
              </h4>
              <p className="text-sm text-muted-foreground">Fiber-rich foods often deliver high ORAC values—combine both goals.</p>
            </div>
            <div className="p-4 border rounded">
              <h4 className="font-semibold mb-1">
                <Link href="/category/health-fitness/sodium-to-potassium-ratio-calculator" className="text-primary hover:underline">
                  Sodium-to-Potassium Ratio Calculator
                </Link>
              </h4>
              <p className="text-sm text-muted-foreground">Balance electrolytes while increasing produce-based antioxidants.</p>
            </div>
            <div className="p-4 border rounded">
              <h4 className="font-semibold mb-1">
                <Link href="/category/health-fitness/magnesium-intake-calculator" className="text-primary hover:underline">
                  Magnesium Intake Calculator
                </Link>
              </h4>
              <p className="text-sm text-muted-foreground">Support enzymatic antioxidant systems with adequate magnesium.</p>
            </div>
            <div className="p-4 border rounded">
              <h4 className="font-semibold mb-1">
                <Link href="/category/health-fitness/pdcaas-calculator" className="text-primary hover:underline">
                  PDCAAS Calculator
                </Link>
              </h4>
              <p className="text-sm text-muted-foreground">Pair quality proteins with antioxidant nutrients for recovery.</p>
            </div>
          </div>
        </CardContent>
      </Card>

      <Card>
        <CardHeader>
          <CardTitle>Complete Guide: Elevating Antioxidant Intake</CardTitle>
          <CardDescription>Actionable strategies for combating oxidative stress</CardDescription>
        </CardHeader>
        <CardContent className="prose prose-sm dark:prose-invert max-w-none">
          <p>
            Antioxidants defend against free radicals generated by stress, pollution, UV exposure, and exercise. Focus on diverse, deeply colored plant foods, rotate seasonal produce, and integrate herbs and spices into cooking. Combine antioxidants with healthy fats to improve absorption of carotenoids and polyphenols.
          </p>
          <p>
            Track your ORAC score periodically and adjust with teas, cocoa, or targeted supplements when necessary. Remember that lifestyle factors—sleep, stress management, hydration—work synergistically with nutrition to control oxidative stress.
          </p>
        </CardContent>
      </Card>

      <Card>
        <CardHeader>
          <CardTitle>Frequently Asked Questions</CardTitle>
          <CardDescription>Antioxidant fundamentals and troubleshooting tips</CardDescription>
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



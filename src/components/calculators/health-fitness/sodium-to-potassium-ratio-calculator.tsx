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
import { Scale, Activity, Calendar, AlertTriangle } from 'lucide-react';
import { EmbedWidget } from '@/components/embed-widget';

const formSchema = z.object({
  sodiumMg: z
    .number({ invalid_type_error: 'Enter sodium in milligrams' })
    .min(0, 'Sodium must be 0 or greater')
    .max(10000, 'Please enter a realistic sodium intake'),
  potassiumMg: z
    .number({ invalid_type_error: 'Enter potassium in milligrams' })
    .min(0, 'Potassium must be 0 or greater')
    .max(12000, 'Please enter a realistic potassium intake'),
});

type FormValues = z.infer<typeof formSchema>;

type ResultPayload = {
  ratio: number | null;
  classification: 'optimal' | 'elevated' | 'high' | null;
  interpretation: string;
  recommendations: string[];
  warningSigns: string[];
  plan: { week: number; focus: string }[];
};

const understandingInputs = [
  {
    label: 'Daily Sodium Intake',
    description: 'Total sodium from food, beverages, and supplements. Most comes from processed or restaurant foods.',
  },
  {
    label: 'Daily Potassium Intake',
    description: 'Potassium primarily comes from fruits, vegetables, legumes, dairy, and fish. Higher intakes counterbalance sodium.',
  },
];

const faqs: [string, string][] = [
  ['What is the ideal sodium-to-potassium ratio?', 'Most public-health agencies recommend keeping the ratio at or below 1.0 (equal milligrams of sodium and potassium), while many experts aim for 0.5 (twice as much potassium as sodium).'],
  ['Why does the ratio matter?', 'Higher ratios are linked to increased blood pressure, cardiovascular disease, and stroke risk. Adequate potassium intake helps relax blood vessels and promotes sodium excretion.'],
  ['How much sodium should adults consume?', 'The World Health Organization suggests less than 2,000 mg per day (≈5 g salt). The American Heart Association recommends 1,500 mg for optimal heart health.'],
  ['What is the potassium recommendation?', 'Most guidelines advise at least 3,400 mg per day for men and 2,600 mg for women, with an overall target of 3,500 mg for blood-pressure control.'],
  ['Does cooking affect sodium or potassium?', 'Cooking does not significantly change sodium, but boiling can leach potassium into water. Steaming or roasting helps retain potassium.'],
  ['How can I lower my ratio quickly?', 'Reduce processed foods, rinse canned goods, cook with herbs instead of salt, and increase produce, legumes, and dairy intake.'],
  ['Is sea salt better than table salt?', 'Sea salt contains trace minerals but similar sodium content per gram. The ratio depends on total sodium, not salt type.'],
  ['Can supplements improve potassium intake?', 'Potassium supplements are regulated and may be limited to 99 mg per dose. Focus on food unless directed by a healthcare provider.'],
  ['Who should monitor potassium closely?', 'Individuals with kidney disease or on potassium-altering medications (ACE inhibitors, potassium-sparing diuretics) must consult their clinician before increasing potassium.'],
  ['How often should I reassess?', 'Check your ratio whenever you track nutrition (monthly or quarterly) or after major dietary changes.'],
];

const plan = (): { week: number; focus: string }[] => [
  { week: 1, focus: 'Audit packaged foods and restaurant meals to identify top sodium contributors.' },
  { week: 2, focus: 'Swap one processed meal for a home-cooked alternative with fresh herbs each day.' },
  { week: 3, focus: 'Add potassium-rich produce (leafy greens, bananas, potatoes) to two meals per day.' },
  { week: 4, focus: 'Experiment with low-sodium cooking techniques—acid (lemon, vinegar) and spices for flavor.' },
  { week: 5, focus: 'Batch-prep bean or lentil dishes to replace high-sodium sides.' },
  { week: 6, focus: 'Evaluate hydration and include electrolyte balance if training heavily or sweating often.' },
  { week: 7, focus: 'Review food labels—aim for ≤140 mg sodium per serving for "low sodium" options.' },
  { week: 8, focus: 'Reassess the ratio, schedule a blood pressure check, and plan follow-up adjustments.' },
];

const warningSigns = () => [
  'High sodium intake increases risk of hypertension, especially when potassium is inadequate.',
  'Individuals with kidney disease, adrenal disorders, or on diuretics should adjust sodium or potassium only under medical supervision.',
  'Potassium supplements can interact with medications (ACE inhibitors, ARBs); obtain professional guidance before use.',
];

const classifyRatio = (ratio: number | null): ResultPayload['classification'] => {
  if (ratio === null) return null;
  if (ratio <= 1) return 'optimal';
  if (ratio <= 1.5) return 'elevated';
  return 'high';
};

const interpretRatio = (ratio: number | null) => {
  if (ratio === null) return 'Enter both values to evaluate your sodium-to-potassium balance.';
  if (ratio <= 1)
    return 'Excellent balance—potassium intake is sufficient to buffer sodium. Maintain a produce-focused meal plan and monitor hidden sodium sources.';
  if (ratio <= 1.5)
    return 'Ratio is slightly elevated. Moderate sodium additions and increase potassium-rich foods (fruits, vegetables, legumes, dairy).';
  return 'High ratio detected. Reduce processed, salty foods and increase potassium-dense choices. Schedule a blood pressure check and consult a clinician if levels stay high.';
};

const recommendations = (classification: ResultPayload['classification']) => {
  const base = [
    'Limit restaurant meals, deli meats, canned soups, and salty snacks that contribute large sodium loads.',
    'Prioritize potassium-rich foods: leafy greens, bananas, oranges, potatoes, beans, lentils, yogurt, salmon.',
    'Cook at home more often—season with herbs, citrus, garlic, and pepper instead of salt shakers.',
  ];
  if (classification === 'optimal') {
    return [
      ...base,
      'Continue balancing plates with half vegetables/fruits to keep potassium intake robust.',
      'Monitor sodium in condiments and sauces; choose low-sodium versions to preserve your ratio.',
    ];
  }
  if (classification === 'elevated') {
    return [
      ...base,
      'Aim to cut daily sodium by 400–600 mg (e.g., fewer packaged meals) and add an extra cup of vegetables or beans.',
      'Use potassium-enhanced salt substitutes only if cleared by your healthcare provider.',
    ];
  }
  return [
    ...base,
    'Reduce high-sodium foods systematically—start with breakfast spreads, processed meats, and snack foods.',
    'Add two potassium-focused meals daily (e.g., spinach salad with beans, baked potato with yogurt, fruit smoothie).',
    'Track blood pressure weekly to see how dietary changes influence readings.',
  ];
};

const calculateRatio = (values: FormValues): ResultPayload => {
  if (values.potassiumMg === 0) {
    return {
      ratio: null,
      classification: null,
      interpretation: 'Potassium intake is zero. Increase potassium-rich foods immediately and consult a clinician if this reflects a medical restriction.',
      recommendations: recommendations('high'),
      warningSigns: warningSigns(),
      plan: plan(),
    };
  }
  const ratio = values.sodiumMg / values.potassiumMg;
  const classification = classifyRatio(ratio);
  return {
    ratio,
    classification,
    interpretation: interpretRatio(ratio),
    recommendations: recommendations(classification),
    warningSigns: warningSigns(),
    plan: plan(),
  };
};

export default function SodiumToPotassiumRatioCalculator() {
  const [result, setResult] = useState<ResultPayload | null>(null);

  const form = useForm<FormValues>({
    resolver: zodResolver(formSchema),
    defaultValues: {
      sodiumMg: undefined,
      potassiumMg: undefined,
    },
  });

  const onSubmit = (values: FormValues) => {
    setResult(calculateRatio(values));
  };

  return (
    <div className="space-y-8">
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2"><Scale className="h-5 w-5" /> Sodium-to-Potassium Ratio Calculator</CardTitle>
          <CardDescription>Compare daily sodium and potassium intake to assess cardiovascular risk and electrolyte balance.</CardDescription>
        </CardHeader>
        <CardContent>
          <Form {...form}>
            <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-6">
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <FormField control={form.control} name="sodiumMg" render={({ field }) => (
                  <FormItem>
                    <FormLabel>Sodium Intake (mg/day)</FormLabel>
                    <FormControl>
                      <Input
                        type="number"
                        step="10"
                        placeholder="e.g., 3200"
                        value={field.value ?? ''}
                        onChange={(event) => field.onChange(event.target.value === '' ? undefined : Number(event.target.value))}
                      />
                    </FormControl>
                    <FormMessage />
                  </FormItem>
                )} />
                <FormField control={form.control} name="potassiumMg" render={({ field }) => (
                  <FormItem>
                    <FormLabel>Potassium Intake (mg/day)</FormLabel>
                    <FormControl>
                      <Input
                        type="number"
                        step="10"
                        placeholder="e.g., 2800"
                        value={field.value ?? ''}
                        onChange={(event) => field.onChange(event.target.value === '' ? undefined : Number(event.target.value))}
                      />
                    </FormControl>
                    <FormMessage />
                  </FormItem>
                )} />
              </div>
              <Button type="submit" className="w-full md:w-auto">Calculate Ratio</Button>
            </form>
          </Form>
        </CardContent>
      </Card>

      {result && (
        <div className="space-y-6">
          <Card>
            <CardHeader>
              <div className="flex items-center gap-4"><Activity className="h-8 w-8 text-primary" /><CardTitle>Electrolyte Balance Summary</CardTitle></div>
              <CardDescription>Your sodium/potassium relationship at a glance</CardDescription>
            </CardHeader>
            <CardContent className="space-y-4">
              <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                <div className="p-4 border rounded">
                  <h4 className="text-sm font-semibold text-muted-foreground">Na:K Ratio</h4>
                  <p className="text-2xl font-bold text-primary">
                    {result.ratio === null ? '—' : result.ratio.toFixed(2)}
                  </p>
                </div>
                <div className="p-4 border rounded">
                  <h4 className="text-sm font-semibold text-muted-foreground">Classification</h4>
                  <p className="text-lg font-bold text-primary">
                    {result.classification === 'optimal' && 'Optimal'}
                    {result.classification === 'elevated' && 'Elevated'}
                    {result.classification === 'high' && 'High'}
                    {!result.classification && 'Needs Data'}
                  </p>
                </div>
                <div className="p-4 border rounded">
                  <h4 className="text-sm font-semibold text-muted-foreground">Recommended Goal</h4>
                  <p className="text-lg font-bold text-primary">≤ 1.0</p>
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
              <CardTitle className="flex items-center gap-2"><Calendar className="h-5 w-5" /> 8‑Week Sodium & Potassium Roadmap</CardTitle>
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
          <CardDescription>Measure accurately for meaningful results</CardDescription>
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
          <CardDescription>Build a heart-healthy nutrition toolkit</CardDescription>
        </CardHeader>
        <CardContent>
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div className="p-4 border rounded">
              <h4 className="font-semibold mb-1">
                <Link href="/category/health-fitness/low-sodium-diet-planner-calculator" className="text-primary hover:underline">
                  Low-Sodium Diet Planner
                </Link>
              </h4>
              <p className="text-sm text-muted-foreground">Create a step-by-step plan for reducing sodium in everyday meals.</p>
            </div>
            <div className="p-4 border rounded">
              <h4 className="font-semibold mb-1">
                <Link href="/category/health-fitness/potassium-intake-calculator" className="text-primary hover:underline">
                  Potassium Intake Calculator
                </Link>
              </h4>
              <p className="text-sm text-muted-foreground">Confirm you reach the daily potassium goal to counterbalance sodium.</p>
            </div>
            <div className="p-4 border rounded">
              <h4 className="font-semibold mb-1">
                <Link href="/category/health-fitness/hypertension-stage-calculator" className="text-primary hover:underline">
                  Hypertension Stage Calculator
                </Link>
              </h4>
              <p className="text-sm text-muted-foreground">Understand blood-pressure risk alongside sodium/potassium balance.</p>
            </div>
            <div className="p-4 border rounded">
              <h4 className="font-semibold mb-1">
                <Link href="/category/health-fitness/electrolyte-replacement-calculator" className="text-primary hover:underline">
                  Electrolyte Replacement Calculator
                </Link>
              </h4>
              <p className="text-sm text-muted-foreground">Tailor sodium and potassium needs for training or hot-weather conditions.</p>
            </div>
          </div>
        </CardContent>
      </Card>

      <Card>
        <CardHeader>
          <CardTitle>Complete Guide: Mastering Sodium & Potassium Balance</CardTitle>
          <CardDescription>Nutrition strategies for cardiovascular resilience</CardDescription>
        </CardHeader>
        <CardContent className="prose prose-sm dark:prose-invert max-w-none">
          <p>
            Maintaining a low sodium-to-potassium ratio is one of the most effective dietary levers for controlling blood pressure. Emphasize whole foods, cook at home, and flavor meals with herbs, spices, citrus, and vinegars. Read labels—sodium hides in breads, sauces, deli meats, frozen meals, and snack foods. Rinse canned beans and vegetables to remove excess salt.
          </p>
          <p>
            For potassium, diversify produce, include potatoes or leafy greens, and add legumes, dairy, or fish to meals. Monitor hydration and discuss goals with your healthcare provider if you have kidney concerns or take potassium-sensitive medications. Reassess your ratio regularly to stay on track.
          </p>
        </CardContent>
      </Card>

      <Card>
        <CardHeader>
          <CardTitle>Frequently Asked Questions</CardTitle>
          <CardDescription>Key insights on sodium, potassium, and heart health</CardDescription>
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

      <EmbedWidget calculatorSlug="sodium-to-potassium-ratio-calculator" calculatorName="Sodium-to-Potassium Ratio Calculator" />
    </div>
  );
}
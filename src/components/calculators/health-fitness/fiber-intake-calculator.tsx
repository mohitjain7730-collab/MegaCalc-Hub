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
import { Utensils, Activity, Calendar, AlertTriangle } from 'lucide-react';
import { EmbedWidget } from '@/components/embed-widget';

const lifeStageSchema = z.enum(['none', 'pregnant', 'lactating']);

const formSchema = z
  .object({
    age: z.number({ invalid_type_error: 'Enter age in years' }).int().min(1).max(120),
    sex: z.enum(['male', 'female']),
    lifeStage: lifeStageSchema.optional(),
    calories: z.number({ invalid_type_error: 'Enter daily calories' }).min(500).max(6000).optional(),
    currentIntake: z.number({ invalid_type_error: 'Enter current fiber intake' }).min(0).max(120).optional(),
  })
  .refine(
    ({ sex, lifeStage }) => {
      if (!lifeStage || lifeStage === 'none') return true;
      return sex === 'female';
    },
    { message: 'Pregnancy and lactation apply to females only.', path: ['lifeStage'] },
  );

type FormValues = z.infer<typeof formSchema>;

type ResultPayload = {
  recommendedFiber: number;
  calorieBasedTarget: number | null;
  delta: number | null;
  status: 'low' | 'adequate' | 'high' | null;
  interpretation: string;
  recommendations: string[];
  warningSigns: string[];
  plan: { week: number; focus: string }[];
};

const understandingInputs = [
  { label: 'Age & Sex', description: 'Daily fiber recommendations shift with age and differ for men and women because of calorie needs.' },
  { label: 'Life Stage', description: 'Pregnancy and lactation increase fiber goals to support digestion, nutrient absorption, and blood sugar control.' },
  { label: 'Daily Calories (optional)', description: 'Provides a personalized estimate using the guideline of 14 g of fiber per 1,000 kcal consumed.' },
  { label: 'Current Fiber Intake (optional)', description: 'Log your usual intake from a food diary or tracking app to see the gap between recommended and actual intake.' },
];

const faqs: [string, string][] = [
  ['Why is fiber important?', 'Fiber feeds gut bacteria, improves bowel regularity, stabilizes blood sugar, supports cholesterol management, and helps regulate appetite.'],
  ['How much fiber do adults need?', 'General guidance recommends 25–38 grams per day depending on age and sex. Pregnant and breastfeeding individuals aim for ~28–29 grams daily.'],
  ['Is there such a thing as too much fiber?', 'Very high intakes (60+ grams) without adequate hydration may cause bloating, gas, or reduced absorption of minerals. Increase gradually and drink water.'],
  ['What is soluble vs. insoluble fiber?', 'Soluble fiber dissolves in water and helps regulate blood sugar and cholesterol (oats, beans). Insoluble fiber adds bulk to stool and aids regularity (whole grains, vegetables).'],
  ['Do fiber supplements count?', 'Yes, they can help fill gaps, but whole foods deliver additional micronutrients, phytochemicals, and satiety benefits.'],
  ['How can I track fiber intake?', 'Use nutrition tracking apps, food labels, or a simple food diary noting grams of fiber per serving.'],
  ['Does cooking reduce fiber content?', 'Cooking softens fiber but does not significantly decrease total fiber. Leaving edible skins on fruits and vegetables helps retain it.'],
  ['Can fiber help with weight management?', 'High-fiber foods are filling and slow digestion, which supports appetite control and steady energy levels.'],
  ['What if fiber upsets my stomach?', 'Increase intake gradually (5 g per week) and pair with adequate fluids. Consider diverse sources and consult a clinician if symptoms persist.'],
  ['How often should I reassess my fiber goal?', 'Every few months or whenever calories, diet pattern, pregnancy status, or digestive comfort changes.'],
];

const plan = (): { week: number; focus: string }[] => [
  { week: 1, focus: 'Log all meals for 3 days to baseline current fiber intake and identify low-fiber meals.' },
  { week: 2, focus: 'Swap refined grains for whole-grain options at one meal per day.' },
  { week: 3, focus: 'Add a fruit or vegetable snack in the afternoon to boost soluble fiber and micronutrients.' },
  { week: 4, focus: 'Introduce legumes (lentils, beans, chickpeas) to lunches or dinners three times per week.' },
  { week: 5, focus: 'Experiment with high-fiber toppers like chia seeds, flax, or hemp in smoothies and yogurt.' },
  { week: 6, focus: 'Assess hydration; aim for at least 30–35 ml of water per kg of body weight to support fiber digestion.' },
  { week: 7, focus: 'Review portion sizes and diversify colors of produce to broaden prebiotic variety.' },
  { week: 8, focus: 'Recalculate fiber intake, adjust supplements if needed, and plan long-term maintenance habits.' },
];

const warningSigns = () => [
  'Increase fiber gradually; sudden jumps of 15–20 grams may cause bloating or cramping.',
  'Individuals with inflammatory bowel disease, IBS, or recent GI surgery should personalize fiber goals with a clinician.',
  'Excessive reliance on fiber supplements without water can worsen constipation.',
];

const baseFiberRecommendation = (age: number, sex: 'male' | 'female'): number => {
  if (age <= 3) return 19;
  if (age <= 8) return 25;
  if (age <= 13) return sex === 'male' ? 31 : 26;
  if (age <= 18) return sex === 'male' ? 38 : 25;
  if (age <= 50) return sex === 'male' ? 38 : 25;
  return sex === 'male' ? 30 : 21;
};

const adjustForLifeStage = (base: number, lifeStage: FormValues['lifeStage'], age: number): number => {
  if (!lifeStage || lifeStage === 'none') return base;
  if (age < 14) return base;
  if (lifeStage === 'pregnant') return 28;
  if (lifeStage === 'lactating') return 29;
  return base;
};

const calorieBasedFiber = (calories?: number) => (calories ? Math.round((calories / 1000) * 14) : null);

const interpretStatus = (delta: number | null): { status: ResultPayload['status']; message: string } => {
  if (delta === null) {
    return { status: null, message: 'Enter your current fiber intake to see if you meet or exceed the target.' };
  }
  if (delta > 5) {
    return {
      status: 'low',
      message: 'Fiber intake appears below the recommended range. Add higher-fiber foods gradually and hydrate well.',
    };
  }
  if (delta < -10) {
    return {
      status: 'high',
      message:
        'Fiber intake exceeds the target by a significant margin. Ensure adequate water intake and monitor digestion to avoid discomfort.',
    };
  }
  return { status: 'adequate', message: 'Great job—your fiber intake is aligned with the recommended target for your profile.' };
};

const recommendations = (status: ResultPayload['status']) => {
  const base = [
    'Distribute fiber across meals to support sustained energy and digestion.',
    'Combine soluble fiber (oats, beans, fruit) with insoluble fiber (whole grains, vegetables) for balanced gut support.',
    'Pair fiber increases with 1–2 extra glasses of water per day to prevent constipation.',
  ];
  if (status === 'low') {
    return [
      ...base,
      'Start by adding 5 grams per day (e.g., chia pudding or a legume serving) until you reach the target.',
      'Explore fermented foods (yogurt, kefir, kimchi) to help gut bacteria adapt to higher fiber.',
    ];
  }
  if (status === 'high') {
    return [
      ...base,
      'If using fiber supplements, reassess dosage and spread intake throughout the day.',
      'Monitor mineral absorption (iron, zinc) if sustaining very high fiber from supplements.',
    ];
  }
  return [
    ...base,
    'Rotate produce choices weekly to increase phytonutrient diversity and prebiotic variety.',
    'Keep a few high-fiber staples prepped (cooked beans, roasted vegetables, overnight oats) for convenience.',
  ];
};

const calculateFiber = (values: FormValues): ResultPayload => {
  const base = baseFiberRecommendation(values.age, values.sex);
  const adjusted = adjustForLifeStage(base, values.lifeStage, values.age);
  const calorieTarget = calorieBasedFiber(values.calories);
  const recommended = calorieTarget ? Math.round((adjusted + calorieTarget) / 2) : adjusted;
  const delta = values.currentIntake !== undefined ? recommended - values.currentIntake : null;
  const interpretation = interpretStatus(delta);

  return {
    recommendedFiber: recommended,
    calorieBasedTarget: calorieTarget,
    delta,
    status: interpretation.status,
    interpretation: interpretation.message,
    recommendations: recommendations(interpretation.status),
    warningSigns: warningSigns(),
    plan: plan(),
  };
};

export default function FiberIntakeCalculator() {
  const [result, setResult] = useState<ResultPayload | null>(null);

  const form = useForm<FormValues>({
    resolver: zodResolver(formSchema),
    defaultValues: {
      age: undefined,
      sex: undefined,
      lifeStage: 'none',
      calories: undefined,
      currentIntake: undefined,
    },
  });

  const onSubmit = (values: FormValues) => {
    setResult(calculateFiber(values));
  };

  return (
    <div className="space-y-8">
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2"><Utensils className="h-5 w-5" /> Fiber Intake Calculator</CardTitle>
          <CardDescription>Find your personalized daily fiber target and see how your current diet measures up.</CardDescription>
        </CardHeader>
        <CardContent>
          <Form {...form}>
            <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-6">
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <FormField control={form.control} name="age" render={({ field }) => (
                  <FormItem>
                    <FormLabel>Age (years)</FormLabel>
                    <FormControl>
                      <Input
                        type="number"
                        step="1"
                        placeholder="e.g., 28"
                        value={field.value ?? ''}
                        onChange={(event) => field.onChange(event.target.value === '' ? undefined : Number(event.target.value))}
                      />
                    </FormControl>
                    <FormMessage />
                  </FormItem>
                )} />
                <FormField control={form.control} name="sex" render={({ field }) => (
                  <FormItem>
                    <FormLabel>Sex</FormLabel>
                    <Select onValueChange={field.onChange} value={field.value}>
                      <FormControl>
                        <SelectTrigger>
                          <SelectValue placeholder="Select sex" />
                        </SelectTrigger>
                      </FormControl>
                      <SelectContent>
                        <SelectItem value="male">Male</SelectItem>
                        <SelectItem value="female">Female</SelectItem>
                      </SelectContent>
                    </Select>
                    <FormMessage />
                  </FormItem>
                )} />
                <FormField control={form.control} name="lifeStage" render={({ field }) => (
                  <FormItem>
                    <FormLabel>Life Stage</FormLabel>
                    <Select onValueChange={field.onChange} value={field.value}>
                      <FormControl>
                        <SelectTrigger>
                          <SelectValue placeholder="Select life stage" />
                        </SelectTrigger>
                      </FormControl>
                      <SelectContent>
                        <SelectItem value="none">None / Not Applicable</SelectItem>
                        <SelectItem value="pregnant">Pregnant</SelectItem>
                        <SelectItem value="lactating">Lactating</SelectItem>
                      </SelectContent>
                    </Select>
                    <FormMessage />
                  </FormItem>
                )} />
                <FormField control={form.control} name="calories" render={({ field }) => (
                  <FormItem>
                    <FormLabel>Daily Calories (optional)</FormLabel>
                    <FormControl>
                      <Input
                        type="number"
                        step="50"
                        placeholder="e.g., 2200"
                        value={field.value ?? ''}
                        onChange={(event) => field.onChange(event.target.value === '' ? undefined : Number(event.target.value))}
                      />
                    </FormControl>
                    <FormMessage />
                  </FormItem>
                )} />
                <FormField control={form.control} name="currentIntake" render={({ field }) => (
                  <FormItem>
                    <FormLabel>Current Fiber Intake (g/day)</FormLabel>
                    <FormControl>
                      <Input
                        type="number"
                        step="1"
                        placeholder="Optional, e.g., 18"
                        value={field.value ?? ''}
                        onChange={(event) => field.onChange(event.target.value === '' ? undefined : Number(event.target.value))}
                      />
                    </FormControl>
                    <FormMessage />
                  </FormItem>
                )} />
              </div>
              <Button type="submit" className="w-full md:w-auto">Calculate Fiber Target</Button>
            </form>
          </Form>
        </CardContent>
      </Card>

      {result && (
        <div className="space-y-6">
          <Card>
            <CardHeader>
              <div className="flex items-center gap-4"><Activity className="h-8 w-8 text-primary" /><CardTitle>Daily Fiber Summary</CardTitle></div>
              <CardDescription>Recommended intake based on evidence-based dietary guidelines</CardDescription>
            </CardHeader>
            <CardContent className="space-y-4">
              <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                <div className="p-4 border rounded">
                  <h4 className="text-sm font-semibold text-muted-foreground">Recommended Fiber</h4>
                  <p className="text-2xl font-bold text-primary">{result.recommendedFiber} g</p>
                </div>
                <div className="p-4 border rounded">
                  <h4 className="text-sm font-semibold text-muted-foreground">Calorie-Based Target</h4>
                  <p className="text-lg font-bold text-primary">{result.calorieBasedTarget ? `${result.calorieBasedTarget} g` : '—'}</p>
                </div>
                <div className="p-4 border rounded">
                  <h4 className="text-sm font-semibold text-muted-foreground">Gap to Goal</h4>
                  <p className="text-lg font-bold text-primary">
                    {result.delta === null ? '—' : `${result.delta > 0 ? '+' : ''}${Math.round(result.delta)}`}
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
              <CardTitle className="flex items-center gap-2"><Calendar className="h-5 w-5" /> 8‑Week Fiber Habit Builder</CardTitle>
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
          <CardDescription>Gather the right information for accurate results</CardDescription>
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
          <CardDescription>Design a gut-friendly nutrition plan</CardDescription>
        </CardHeader>
        <CardContent>
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div className="p-4 border rounded">
              <h4 className="font-semibold mb-1">
                <Link href="/category/health-fitness/magnesium-intake-calculator" className="text-primary hover:underline">
                  Magnesium Intake Calculator
                </Link>
              </h4>
              <p className="text-sm text-muted-foreground">Pair fiber-rich foods with magnesium to support muscle and nerve function.</p>
            </div>
            <div className="p-4 border rounded">
              <h4 className="font-semibold mb-1">
                <Link href="/category/health-fitness/daily-antioxidant-orac-goal-calculator" className="text-primary hover:underline">
                  Antioxidant (ORAC) Goal Calculator
                </Link>
              </h4>
              <p className="text-sm text-muted-foreground">Boost colorful produce intake alongside fiber for comprehensive gut health.</p>
            </div>
            <div className="p-4 border rounded">
              <h4 className="font-semibold mb-1">
                <Link href="/category/health-fitness/sodium-to-potassium-ratio-calculator" className="text-primary hover:underline">
                  Sodium-to-Potassium Ratio Calculator
                </Link>
              </h4>
              <p className="text-sm text-muted-foreground">Balance electrolytes while adjusting fiber-rich produce choices.</p>
            </div>
            <div className="p-4 border rounded">
              <h4 className="font-semibold mb-1">
                <Link href="/category/health-fitness/glycemic-load-calculator" className="text-primary hover:underline">
                  Glycemic Load Calculator
                </Link>
              </h4>
              <p className="text-sm text-muted-foreground">Assess carbohydrate quality alongside fiber density.</p>
            </div>
          </div>
        </CardContent>
      </Card>

      <Card>
        <CardHeader>
          <CardTitle>Complete Guide: Building a Fiber-Rich Plate</CardTitle>
          <CardDescription>Evidence-backed strategies for digestive resilience</CardDescription>
        </CardHeader>
        <CardContent className="prose prose-sm dark:prose-invert max-w-none">
          <p>
            Dietary fiber is the foundation of gut and metabolic health. Gradually increase intake by emphasizing whole grains, legumes, fruits, vegetables, nuts, and seeds. Spread fiber throughout the day to avoid discomfort and pair each increase with hydration. Track how you feel—regularity, energy, cravings—and adjust the mix of soluble and insoluble fiber accordingly.
          </p>
          <p>
            Consider prebiotic-rich foods (garlic, onions, asparagus) and fermented foods (yogurt, kefir, kimchi) to nurture beneficial microbes. If supplements are needed, start with small doses of psyllium or partially hydrolyzed guar gum. Reassess regularly to keep fiber aligned with your lifestyle, caloric needs, and digestive comfort.
          </p>
        </CardContent>
      </Card>

      <Card>
        <CardHeader>
          <CardTitle>Frequently Asked Questions</CardTitle>
          <CardDescription>Fiber fundamentals and troubleshooting tips</CardDescription>
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

      <EmbedWidget calculatorSlug="fiber-intake-calculator" calculatorName="Fiber Intake Calculator" />
    </div>
  );
}

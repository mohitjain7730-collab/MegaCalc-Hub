'use client';

import { useMemo, useState } from 'react';
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
    age: z
      .number({ invalid_type_error: 'Enter age in years' })
      .int()
      .min(1)
      .max(120),
    sex: z.enum(['male', 'female']),
    lifeStage: lifeStageSchema.optional(),
    currentIntake: z
      .number({ invalid_type_error: 'Enter current intake in mg' })
      .min(0)
      .max(2000)
      .optional(),
  })
  .refine(
    ({ sex, lifeStage }) => {
      if (!lifeStage || lifeStage === 'none') return true;
      return sex === 'female';
    },
    { message: 'Pregnancy and lactation selections apply to females only.', path: ['lifeStage'] },
  );

type FormValues = z.infer<typeof formSchema>;

type ResultPayload = {
  recommendedMg: number;
  upperLimitMg: number | null;
  delta: number | null;
  status: 'low' | 'adequate' | 'high' | null;
  interpretation: string;
  recommendations: string[];
  warningSigns: string[];
  plan: { week: number; focus: string }[];
};

const understandingInputs = [
  {
    label: 'Age',
    description: 'Daily Recommended Dietary Allowances (RDA) rise as metabolic demand increases with age.',
  },
  {
    label: 'Sex',
    description: 'Men typically require slightly more magnesium because of higher lean mass and basal energy expenditure.',
  },
  {
    label: 'Life Stage',
    description:
      'Pregnancy and lactation increase magnesium needs to support fetal development, nutrient transfer, and milk production.',
  },
  {
    label: 'Current Intake (optional)',
    description: 'Enter your usual daily magnesium intake (food + supplements) to see whether you are hitting the target.',
  },
];

const faqs: [string, string][] = [
  [
    'What does magnesium do in the body?',
    'It supports more than 300 enzymatic reactions, including muscle and nerve function, blood pressure regulation, bone mineralization, glucose metabolism, and DNA/RNA synthesis.',
  ],
  [
    'How much magnesium do adults need each day?',
    'Most adult men require 400–420 mg and women 310–320 mg. Needs rise modestly during pregnancy (350–360 mg) and lactation (310–320 mg).',
  ],
  [
    'Can I take too much magnesium?',
    'Magnesium from food is safe, but large supplemental doses above the tolerable upper intake level (350 mg/day for adults) may cause diarrhea, nausea, or dangerous interactions for those with kidney issues.',
  ],
  [
    'Which foods are highest in magnesium?',
    'Leafy greens, nuts, seeds, legumes, whole grains, dark chocolate, and fatty fish are excellent sources. Fortified foods can also help close gaps.',
  ],
  [
    'Does exercise increase magnesium requirements?',
    'Athletes and highly active individuals may need slightly more to replace sweat and support energy metabolism. Focus on magnesium-rich meals post-training.',
  ],
  [
    'Should I prioritize supplements or food?',
    'Food-first is ideal because whole foods supply synergistic nutrients and fiber. Supplements are helpful when intake is consistently low or absorption is impaired.',
  ],
  [
    'What are signs of magnesium deficiency?',
    'Common symptoms include muscle cramps, twitching, low energy, poor sleep, headaches, and irregular heart rhythm. Persistent issues warrant lab testing.',
  ],
  [
    'Does coffee or alcohol deplete magnesium?',
    'Excess caffeine or alcohol can increase urinary magnesium losses. Hydrate well and include magnesium sources in meals when consuming them.',
  ],
  [
    'Can magnesium support sleep or relaxation?',
    'Yes. Magnesium plays a role in melatonin production and helps muscles relax. Many people take a gentle form (glycinate) 1–2 hours before bed.',
  ],
  [
    'How often should I reassess my intake?',
    'Review every few months or whenever your diet, activity level, or health status changes. Pregnant and breastfeeding individuals should monitor more frequently.',
  ],
];

const plan = (): { week: number; focus: string }[] => [
  { week: 1, focus: 'Track current intake for 3–5 days; note magnesium-rich foods and gaps.' },
  { week: 2, focus: 'Add one leafy-green serving and one nut/seed snack daily to raise baseline intake.' },
  { week: 3, focus: 'Integrate magnesium-supportive habits: hydrate, moderate caffeine, pair magnesium with vitamin D.' },
  { week: 4, focus: 'Evaluate sleep quality, recovery, and digestion; adjust timing (morning vs. evening) if supplementing.' },
  { week: 5, focus: 'Introduce legumes or whole grains to two meals per day to sustain intake diversity.' },
  { week: 6, focus: 'Schedule a mid-program check-in—compare actual intake vs. calculator target and tweak meal prep.' },
  { week: 7, focus: 'Layer complementary nutrients (calcium, potassium, B vitamins) and stress-management practices.' },
  { week: 8, focus: 'Reassess labs or symptoms if available; plan ongoing maintenance or higher intake strategies as needed.' },
];

const warningSigns = () => [
  'Individuals with kidney disease or on magnesium-containing medications should seek medical supervision before supplementing.',
  'High-dose supplemental magnesium (especially oxide) may cause gastrointestinal upset or diarrhea—start low and titrate.',
  'Severe deficiency symptoms (arrhythmia, persistent numbness, seizures) require urgent medical evaluation, not self-treatment.',
];

const baseRda = (age: number, sex: 'male' | 'female') => {
  if (age <= 3) return 80;
  if (age <= 8) return 130;
  if (age <= 13) return 240;
  if (age <= 18) return sex === 'male' ? 410 : 360;
  if (age <= 30) return sex === 'male' ? 400 : 310;
  return sex === 'male' ? 420 : 320;
};

const applyLifeStageAdjustment = (rda: number, lifeStage: FormValues['lifeStage'], age: number) => {
  if (!lifeStage || lifeStage === 'none') return rda;
  if (age < 14) return rda;
  if (lifeStage === 'pregnant') {
    if (age <= 18) return 400;
    if (age <= 30) return 350;
    return 360;
  }
  if (lifeStage === 'lactating') {
    if (age <= 18) return 360;
    if (age <= 30) return 360;
    return 320;
  }
  return rda;
};

const tolerableUpperIntake = (age: number): number | null => {
  if (age < 9) return null;
  if (age <= 13) return 350;
  return 350;
};

const interpretStatus = (delta: number | null, ul: number | null): { status: ResultPayload['status']; message: string } => {
  if (delta === null) return { status: null, message: 'Enter your current intake to see how it compares with the recommended target.' };
  if (delta > 50) return { status: 'low', message: 'Your current intake appears below the RDA. Add magnesium-rich foods or discuss supplements with a professional.' };
  if (delta < -50) {
    if (ul && delta + ul < 0) {
      return {
        status: 'high',
        message:
          'Intake exceeds common supplemental upper limits. Monitor for side effects and consult your healthcare provider about safe dosing.',
      };
    }
    return { status: 'high', message: 'You are consuming more magnesium than required. Excess from food is typically safe but monitor supplements.' };
  }
  return { status: 'adequate', message: 'Nice work—your magnesium intake is close to the recommended range. Maintain diverse food sources for balance.' };
};

const recommendations = (status: ResultPayload['status']) => {
  const base = [
    'Aim to include magnesium-rich foods (leafy greens, nuts, legumes, whole grains) at most meals.',
    'Pair magnesium with vitamin D and healthy fats to support absorption and utilization.',
    'Stay hydrated and moderate excessive caffeine or alcohol, which can increase magnesium losses.',
  ];

  if (status === 'low') {
    return [
      ...base,
      'Start by adding one high-magnesium snack (pumpkin seeds, almonds) every day.',
      'Consider a chelated supplement (citrate, glycinate) if dietary changes are insufficient—begin with 100–150 mg taken with food.',
    ];
  }

  if (status === 'high') {
    return [
      ...base,
      'Review supplement labels to ensure total elemental magnesium stays within safe limits.',
      'If you experience loose stools or cramping, reduce supplemental doses or switch to slower-release forms.',
    ];
  }

  return [
    ...base,
    'Continue rotating magnesium sources to cover additional micronutrients like potassium and fiber.',
    'Schedule periodic intake checks to adapt as training load, stress, or life stage shifts.',
  ];
};

const calculateMagnesium = (values: FormValues): ResultPayload => {
  const base = baseRda(values.age, values.sex);
  const adjusted = applyLifeStageAdjustment(base, values.lifeStage, values.age);
  const upper = tolerableUpperIntake(values.age);
  const delta = values.currentIntake !== undefined ? adjusted - values.currentIntake : null;
  const interpretation = interpretStatus(delta, upper);

  return {
    recommendedMg: adjusted,
    upperLimitMg: upper,
    delta,
    status: interpretation.status,
    interpretation: interpretation.message,
    recommendations: recommendations(interpretation.status),
    warningSigns: warningSigns(),
    plan: plan(),
  };
};

export default function MagnesiumIntakeCalculator() {
  const [result, setResult] = useState<ResultPayload | null>(null);

  const form = useForm<FormValues>({
    resolver: zodResolver(formSchema),
    defaultValues: {
      age: undefined,
      sex: undefined,
      lifeStage: 'none',
      currentIntake: undefined,
    },
  });

  const lifeStageOptions = useMemo(() => {
    const baseOptions = [
      { value: 'none', label: 'None / Not Applicable' },
      { value: 'pregnant', label: 'Pregnant' },
      { value: 'lactating', label: 'Lactating' },
    ] as const;
    return baseOptions;
  }, []);

  const onSubmit = (values: FormValues) => {
    setResult(calculateMagnesium(values));
  };

  return (
    <div className="space-y-8">
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2"><Utensils className="h-5 w-5" /> Magnesium Intake Calculator</CardTitle>
          <CardDescription>Estimate recommended magnesium intake by age, sex, and life stage, and compare it with your current diet.</CardDescription>
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
                        placeholder="e.g., 32"
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
                        {lifeStageOptions.map((option) => (
                          <SelectItem key={option.value} value={option.value}>
                            {option.label}
                          </SelectItem>
                        ))}
                      </SelectContent>
                    </Select>
                    <FormMessage />
                  </FormItem>
                )} />
                <FormField control={form.control} name="currentIntake" render={({ field }) => (
                  <FormItem>
                    <FormLabel>Current Magnesium Intake (mg/day)</FormLabel>
                    <FormControl>
                      <Input
                        type="number"
                        step="1"
                        placeholder="Optional, e.g., 280"
                        value={field.value ?? ''}
                        onChange={(event) => field.onChange(event.target.value === '' ? undefined : Number(event.target.value))}
                      />
                    </FormControl>
                    <FormMessage />
                  </FormItem>
                )} />
              </div>
              <Button type="submit" className="w-full md:w-auto">Calculate Recommended Intake</Button>
            </form>
          </Form>
        </CardContent>
      </Card>

      {result && (
        <div className="space-y-6">
          <Card>
            <CardHeader>
              <div className="flex items-center gap-4"><Activity className="h-8 w-8 text-primary" /><CardTitle>Daily Magnesium Summary</CardTitle></div>
              <CardDescription>Personalized guidance based on dietary reference intakes</CardDescription>
            </CardHeader>
            <CardContent className="space-y-4">
              <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                <div className="p-4 border rounded">
                  <h4 className="text-sm font-semibold text-muted-foreground">Recommended Intake</h4>
                  <p className="text-2xl font-bold text-primary">{result.recommendedMg} mg</p>
                </div>
                <div className="p-4 border rounded">
                  <h4 className="text-sm font-semibold text-muted-foreground">Optional Upper Limit*</h4>
                  <p className="text-lg font-bold text-primary">{result.upperLimitMg ? `${result.upperLimitMg} mg` : 'Not established'}</p>
                </div>
                <div className="p-4 border rounded">
                  <h4 className="text-sm font-semibold text-muted-foreground">Intake Gap</h4>
                  <p className="text-lg font-bold text-primary">
                    {result.delta === null ? '—' : `${result.delta > 0 ? '+' : ''}${Math.round(result.delta)}`}
                  </p>
                </div>
              </div>
              <p className="text-sm text-muted-foreground">{result.interpretation}</p>
              <p className="text-xs text-muted-foreground">*Upper limit reflects supplemental magnesium intake for healthy individuals aged 9+. Food-based magnesium does not have an established upper limit.</p>
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
              <CardTitle className="flex items-center gap-2"><Calendar className="h-5 w-5" /> 8‑Week Magnesium Optimization Plan</CardTitle>
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
          <CardDescription>Collect accurate information for meaningful results</CardDescription>
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
          <CardDescription>Build a comprehensive micronutrient strategy</CardDescription>
        </CardHeader>
        <CardContent>
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div className="p-4 border rounded">
              <h4 className="font-semibold mb-1">
                <Link href="/category/health-fitness/calcium-intake-calculator" className="text-primary hover:underline">
                  Calcium Intake Calculator
                </Link>
              </h4>
              <p className="text-sm text-muted-foreground">Balance calcium and magnesium to support bone density and muscle function.</p>
            </div>
            <div className="p-4 border rounded">
              <h4 className="font-semibold mb-1">
                <Link href="/category/health-fitness/zinc-requirement-calculator" className="text-primary hover:underline">
                  Zinc Requirement Calculator
                </Link>
              </h4>
              <p className="text-sm text-muted-foreground">Plan synergistic micronutrients that aid immunity and metabolism.</p>
            </div>
            <div className="p-4 border rounded">
              <h4 className="font-semibold mb-1">
                <Link href="/category/health-fitness/potassium-intake-calculator" className="text-primary hover:underline">
                  Potassium Intake Calculator
                </Link>
              </h4>
              <p className="text-sm text-muted-foreground">Compare magnesium and potassium targets for nervous system balance.</p>
            </div>
            <div className="p-4 border rounded">
              <h4 className="font-semibold mb-1">
                <Link href="/category/health-fitness/fiber-intake-calculator" className="text-primary hover:underline">
                  Fiber Intake Calculator
                </Link>
              </h4>
              <p className="text-sm text-muted-foreground">Pair magnesium-rich plant foods with fiber to improve gut health.</p>
            </div>
          </div>
        </CardContent>
      </Card>

      <Card>
        <CardHeader>
          <CardTitle>Complete Guide: Mastering Magnesium Intake</CardTitle>
          <CardDescription>Practical strategies for meeting daily requirements</CardDescription>
        </CardHeader>
        <CardContent className="prose prose-sm dark:prose-invert max-w-none">
          <p>
            Magnesium is essential for energy production, muscle contraction, nervous system regulation, and electrolyte balance. Modern diets rich in processed foods can make it challenging to meet the RDA, so plan meals around whole-food sources and consider supplementation if intake remains low. Track symptoms like muscle cramps, low energy, or poor sleep—they may hint at insufficient magnesium.
          </p>
          <p>
            Combine leafy greens, legumes, nuts, seeds, and whole grains across the day. If you choose supplements, prioritize well-absorbed forms (glycinate, citrate) and stay within safe upper limits. Pair magnesium with potassium, calcium, and vitamin D, manage stress, and maintain hydration to maximize benefits.
          </p>
        </CardContent>
      </Card>

      <Card>
        <CardHeader>
          <CardTitle>Frequently Asked Questions</CardTitle>
          <CardDescription>Magnesium basics and best practices</CardDescription>
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

      <EmbedWidget calculatorSlug="magnesium-intake-calculator" calculatorName="Magnesium Intake Calculator" />
    </div>
  );
}



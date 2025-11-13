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

const lifeStageSchema = z.enum(['none', 'pregnant', 'lactating']);

const formSchema = z
  .object({
    age: z.number({ invalid_type_error: 'Enter age in years' }).int().min(1).max(120),
  sex: z.enum(['male', 'female']),
    lifeStage: lifeStageSchema.optional(),
    currentIntake: z.number({ invalid_type_error: 'Enter current intake in mg' }).min(0).max(3000).optional(),
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
  recommendedCalcium: number;
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
    description: 'Calcium needs peak during adolescence (1,300 mg/day) and increase again after age 50 for women (1,200 mg/day) to protect bone density.',
  },
  {
    label: 'Sex',
    description: 'Women over 50 require more calcium (1,200 mg/day) than men of the same age (1,000 mg/day) due to postmenopausal bone loss.',
  },
  {
    label: 'Life Stage',
    description: 'Pregnancy and lactation maintain calcium needs at 1,000–1,300 mg/day to support fetal development and milk production while protecting maternal bone.',
  },
  {
    label: 'Current Intake (optional)',
    description: 'Enter your usual daily calcium intake from food and supplements to see whether you meet the recommended target.',
  },
];

const faqs: [string, string][] = [
  [
    'What does calcium do in the body?',
    'Calcium builds and maintains bones and teeth (99% of body calcium), supports muscle contraction, nerve transmission, blood clotting, and enzyme function.',
  ],
  [
    'How much calcium do adults need each day?',
    'Adults 19–50 need 1,000 mg/day. Women 51+ and men 71+ need 1,200 mg/day. Adolescents need 1,300 mg/day for peak bone building.',
  ],
  [
    'Can I get enough calcium from food alone?',
    'Yes, with a diet rich in dairy, fortified plant milks, leafy greens (low-oxalate), canned fish with bones, and calcium-set tofu. Supplements can fill gaps.',
  ],
  [
    'What is the best source of calcium?',
    'Dairy products provide highly bioavailable calcium. Fortified plant milks, leafy greens (kale, bok choy), canned sardines/salmon, and calcium-set tofu are excellent alternatives.',
  ],
  [
    'Does vitamin D affect calcium absorption?',
    'Yes. Vitamin D is essential for calcium absorption. Without adequate vitamin D, even high calcium intake may not support bone health effectively.',
  ],
  [
    'Can I take too much calcium?',
    'Yes. The upper limit is 2,000–2,500 mg/day for adults. Excessive supplementation may increase kidney stone risk and interfere with iron/zinc absorption.',
  ],
  [
    'What are signs of calcium deficiency?',
    'Mild deficiency may be asymptomatic. Severe deficiency can cause muscle cramps, numbness, brittle nails, and over time, osteoporosis and increased fracture risk.',
  ],
  [
    'Do oxalates in spinach reduce calcium absorption?',
    'Yes. Spinach and other high-oxalate greens bind calcium. Choose low-oxalate options like kale, bok choy, and broccoli for better calcium availability.',
  ],
  [
    'Should I take calcium supplements?',
    'Supplements help when dietary intake is insufficient, especially for postmenopausal women and those avoiding dairy. Split doses (≤500 mg) for better absorption.',
  ],
  [
    'How often should I reassess my calcium intake?',
    'Review every few months or when life stage changes (pregnancy, menopause). Bone density scans (DEXA) can assess long-term calcium adequacy after age 50.',
  ],
];

const plan = (): { week: number; focus: string }[] => [
  { week: 1, focus: 'Track current calcium intake for 3–5 days; identify dairy, fortified foods, and plant sources.' },
  { week: 2, focus: 'Add one calcium-rich food daily: dairy, fortified plant milk, or low-oxalate leafy greens.' },
  { week: 3, focus: 'Ensure adequate vitamin D intake (sunlight, supplements) to support calcium absorption.' },
  { week: 4, focus: 'Time calcium supplements away from iron-rich meals to avoid absorption competition.' },
  { week: 5, focus: 'Include weight-bearing exercise (walking, strength training) to maximize bone-building benefits of calcium.' },
  { week: 6, focus: 'Review supplement labels—aim for ≤500 mg per dose and account for dietary calcium to stay within safe limits.' },
  { week: 7, focus: 'Pair calcium with magnesium and vitamin K2 for optimal bone health and utilization.' },
  { week: 8, focus: 'Reassess intake, consider bone density testing if over 50, and plan long-term maintenance strategies.' },
];

const warningSigns = () => [
  'Excessive calcium supplementation (>2,500 mg/day) may increase kidney stone risk and interfere with absorption of iron, zinc, and magnesium.',
  'Individuals with kidney disease, hypercalcemia, or on certain medications (thiazides, lithium) should consult a healthcare provider before supplementing.',
  'Calcium carbonate requires stomach acid—take with meals. Calcium citrate can be taken anytime and is better for those on acid blockers.',
];

function rdaCalciumMg(age: number, sex: 'male' | 'female'): number {
  if (age >= 1 && age <= 3) return 700;
  if (age >= 4 && age <= 8) return 1000;
  if (age >= 9 && age <= 18) return 1300;
  if (age >= 19 && age <= 50) return 1000;
  if (age >= 51 && sex === 'female') return 1200;
  if (age >= 71) return 1200;
  return 1000;
}

const applyLifeStageAdjustment = (rda: number, lifeStage: FormValues['lifeStage'], age: number) => {
  if (!lifeStage || lifeStage === 'none') return rda;
  if (age < 14) return rda;
  if (lifeStage === 'pregnant' || lifeStage === 'lactating') {
    if (age <= 18) return 1300;
    return 1000;
  }
  return rda;
};

const tolerableUpperIntake = (age: number): number | null => {
  if (age < 9) return null;
  if (age <= 18) return 3000;
  return 2500;
};

const interpretStatus = (delta: number | null, ul: number | null): { status: ResultPayload['status']; message: string } => {
  if (delta === null) return { status: null, message: 'Enter your current intake to see how it compares with the recommended target.' };
  if (delta > 200) return { status: 'low', message: 'Your current intake appears below the RDA. Add calcium-rich foods or discuss supplements with a professional.' };
  if (delta < -500) {
    if (ul && delta + ul < 0) {
      return {
        status: 'high',
        message:
          'Intake exceeds the upper limit. Reduce supplemental calcium and monitor for kidney stone risk or absorption interference.',
      };
    }
    return { status: 'high', message: 'You are consuming more calcium than required. Excess from food is typically safe but monitor supplements.' };
  }
  return { status: 'adequate', message: 'Your calcium intake aligns with recommendations. Maintain diverse sources and ensure adequate vitamin D.' };
};

const recommendations = (status: ResultPayload['status']) => {
  const base = [
    'Include calcium-rich foods at most meals: dairy, fortified plant milks, leafy greens, or canned fish with bones.',
    'Pair calcium with vitamin D (sunlight or supplements) to maximize absorption and bone-building benefits.',
    'Time calcium supplements away from iron-rich meals and split doses (≤500 mg) for better absorption.',
  ];

  if (status === 'low') {
    return [
      ...base,
      'Add one high-calcium food daily: a cup of milk/yogurt, fortified cereal, or calcium-set tofu.',
      'Consider a calcium supplement (citrate or carbonate) if dietary changes are insufficient—begin with 500 mg taken with food.',
    ];
  }

  if (status === 'high') {
    return [
      ...base,
      'Review supplement labels to ensure total elemental calcium stays within safe limits (2,000–2,500 mg/day).',
      'If you experience kidney stones or constipation, reduce supplemental doses or switch to food-based sources.',
    ];
  }

  return [
    ...base,
    'Continue rotating calcium sources to cover additional nutrients like protein, vitamin D, and magnesium.',
    'Include weight-bearing exercise to maximize bone-building benefits of adequate calcium intake.',
  ];
};

const calculateCalcium = (values: FormValues): ResultPayload => {
  const base = rdaCalciumMg(values.age, values.sex);
  const adjusted = applyLifeStageAdjustment(base, values.lifeStage, values.age);
  const upper = tolerableUpperIntake(values.age);
  const delta = values.currentIntake !== undefined ? adjusted - values.currentIntake : null;
  const interpretation = interpretStatus(delta, upper);

  return {
    recommendedCalcium: adjusted,
    upperLimitMg: upper,
    delta,
    status: interpretation.status,
    interpretation: interpretation.message,
    recommendations: recommendations(interpretation.status),
    warningSigns: warningSigns(),
    plan: plan(),
  };
};

export default function CalciumIntakeCalculator() {
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
    setResult(calculateCalcium(values));
  };

  return (
    <div className="space-y-8">
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2"><Utensils className="h-5 w-5" /> Calcium Intake Calculator</CardTitle>
          <CardDescription>Estimate recommended calcium intake by age, sex, and life stage, and compare it with your current diet.</CardDescription>
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
                    <FormLabel>Current Calcium Intake (mg/day)</FormLabel>
                    <FormControl>
                      <Input
                        type="number"
                        step="1"
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
              <div className="flex items-center gap-4"><Activity className="h-8 w-8 text-primary" /><CardTitle>Daily Calcium Summary</CardTitle></div>
              <CardDescription>Personalized guidance based on dietary reference intakes</CardDescription>
            </CardHeader>
            <CardContent className="space-y-4">
              <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                <div className="p-4 border rounded">
                  <h4 className="text-sm font-semibold text-muted-foreground">Recommended Intake</h4>
                  <p className="text-2xl font-bold text-primary">{result.recommendedCalcium} mg</p>
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
              <p className="text-xs text-muted-foreground">*Upper limit reflects total calcium from all sources. Food-based calcium is generally safe; monitor supplements.</p>
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
              <CardTitle className="flex items-center gap-2"><Calendar className="h-5 w-5" /> 8‑Week Calcium Optimization Plan</CardTitle>
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
                <Link href="/category/health-fitness/magnesium-intake-calculator" className="text-primary hover:underline">
                  Magnesium Intake Calculator
                </Link>
              </h4>
              <p className="text-sm text-muted-foreground">Balance calcium and magnesium to support bone density and muscle function.</p>
  </div>
            <div className="p-4 border rounded">
              <h4 className="font-semibold mb-1">
                <Link href="/category/health-fitness/vitamin-d-sun-exposure-calculator" className="text-primary hover:underline">
        Vitamin D Sun Exposure Calculator
      </Link>
              </h4>
              <p className="text-sm text-muted-foreground">Ensure adequate vitamin D to maximize calcium absorption and bone health.</p>
            </div>
            <div className="p-4 border rounded">
              <h4 className="font-semibold mb-1">
                <Link href="/category/health-fitness/iron-intake-calculator" className="text-primary hover:underline">
                  Iron Intake Calculator
                </Link>
              </h4>
              <p className="text-sm text-muted-foreground">Time calcium supplements away from iron-rich meals to avoid absorption competition.</p>
            </div>
            <div className="p-4 border rounded">
              <h4 className="font-semibold mb-1">
                <Link href="/category/health-fitness/zinc-requirement-calculator" className="text-primary hover:underline">
                  Zinc Requirement Calculator
      </Link>
              </h4>
              <p className="text-sm text-muted-foreground">Balance calcium with zinc to support immune function and mineral absorption.</p>
            </div>
          </div>
        </CardContent>
      </Card>

      <Card>
        <CardHeader>
          <CardTitle>Complete Guide: Mastering Calcium Intake</CardTitle>
          <CardDescription>Practical strategies for meeting daily requirements</CardDescription>
        </CardHeader>
        <CardContent className="prose prose-sm dark:prose-invert max-w-none">
          <p>
            Calcium is essential for bone and tooth health, muscle function, and nerve transmission. Needs peak during adolescence (1,300 mg/day) and increase after age 50 for women (1,200 mg/day). Include dairy, fortified plant milks, low-oxalate leafy greens, and canned fish with bones. Pair with vitamin D for optimal absorption.
    </p>
    <p>
            Split supplemental doses (≤500 mg) and time them away from iron-rich meals. Excessive supplementation (>2,500 mg/day) may increase kidney stone risk. Include weight-bearing exercise to maximize bone-building benefits.
          </p>
        </CardContent>
      </Card>

      <Card>
        <CardHeader>
          <CardTitle>Frequently Asked Questions</CardTitle>
          <CardDescription>Calcium basics and best practices</CardDescription>
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

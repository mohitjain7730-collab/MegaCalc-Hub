'use client';

import { useEffect, useMemo, useState } from 'react';
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

const formSchema = z
  .object({
    age: z.number({ invalid_type_error: 'Enter age in years' }).int().min(1).max(120),
    sex: z.enum(['male', 'female']),
    pregnant: z.boolean().default(false),
    lactating: z.boolean().default(false),
    currentIntake: z.number({ invalid_type_error: 'Enter current intake in mg' }).min(0).max(100).optional(),
  })
  .refine(
    ({ sex, pregnant, lactating }) => {
      if (sex === 'male') return !pregnant && !lactating;
      return true;
    },
    { message: 'Pregnancy and lactation apply to females only.', path: ['pregnant'] },
  );

type FormValues = z.infer<typeof formSchema>;

type ResultPayload = {
  recommendedIron: number;
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
    description: 'Iron requirements vary significantly by age, with adolescents and premenopausal women needing more due to growth and menstrual losses.',
  },
  {
    label: 'Sex',
    description: 'Premenopausal women require more iron (18 mg/day) than men (8 mg/day) due to monthly blood loss. After menopause, needs equalize.',
  },
  {
    label: 'Pregnancy Status',
    description: 'Pregnancy dramatically increases iron needs (27 mg/day) to support expanding blood volume and fetal development.',
  },
  {
    label: 'Lactation Status',
    description: 'Breastfeeding increases iron needs (9–10 mg/day) to support milk production and maternal recovery.',
  },
  {
    label: 'Current Intake (optional)',
    description: 'Enter your usual daily iron intake from food and supplements to compare with the recommended target.',
  },
];

const faqs: [string, string][] = [
  [
    'What does iron do in the body?',
    'Iron is essential for oxygen transport (hemoglobin), energy production, immune function, and cognitive development. It supports muscle function and neurotransmitter synthesis.',
  ],
  [
    'How much iron do adults need each day?',
    'Adult men need 8 mg/day, while premenopausal women need 18 mg/day. Pregnant women require 27 mg/day, and needs decrease after menopause.',
  ],
  [
    'What is the difference between heme and non-heme iron?',
    'Heme iron (from animal sources like meat, fish, poultry) is absorbed 15–35% efficiently. Non-heme iron (from plants, eggs, dairy) has 2–20% absorption but can be enhanced with vitamin C.',
  ],
  [
    'Which foods are highest in iron?',
    'Red meat, organ meats, poultry, fish, legumes, fortified cereals, spinach, and pumpkin seeds are excellent sources. Pair plant sources with vitamin C for better absorption.',
  ],
  [
    'Can I take too much iron?',
    'Yes. Excessive iron can cause toxicity, especially in individuals with hemochromatosis. The upper limit is 45 mg/day for adults. Never take iron supplements unless prescribed or confirmed deficient.',
  ],
  [
    'What are signs of iron deficiency?',
    'Fatigue, weakness, pale skin, brittle nails, hair loss, cold hands/feet, headaches, and difficulty concentrating. Severe deficiency leads to anemia requiring medical treatment.',
  ],
  [
    'How can vegetarians meet iron needs?',
    'Include legumes, fortified cereals, nuts, seeds, and dark leafy greens. Pair with vitamin C-rich foods (citrus, peppers, tomatoes) and avoid tea/coffee with iron-rich meals.',
  ],
  [
    'Should I take iron supplements?',
    'Only if diagnosed with deficiency or prescribed by a healthcare provider. Self-supplementation can mask underlying conditions and cause toxicity. Get tested first.',
  ],
  [
    'Does cooking affect iron content?',
    'Cooking can slightly reduce iron in some foods but also improves bioavailability by breaking down compounds that inhibit absorption. Use cast-iron cookware to add iron to meals.',
  ],
  [
    'How often should I check my iron levels?',
    'If you have symptoms of deficiency, heavy periods, are pregnant, or follow a restrictive diet, consult a healthcare provider for blood tests (ferritin, hemoglobin) annually or as recommended.',
  ],
];

const plan = (): { week: number; focus: string }[] => [
  { week: 1, focus: 'Track current iron intake for 3–5 days; identify heme and non-heme sources and absorption enhancers/inhibitors.' },
  { week: 2, focus: 'Add one iron-rich food daily (red meat, legumes, or fortified cereal) and pair plant sources with vitamin C.' },
  { week: 3, focus: 'Optimize meal timing—avoid tea, coffee, and calcium supplements within 1 hour of iron-rich meals.' },
  { week: 4, focus: 'Evaluate symptoms (fatigue, pallor); consider blood testing if deficiency is suspected.' },
  { week: 5, focus: 'Introduce cast-iron cookware for cooking acidic foods (tomatoes, citrus) to boost iron content.' },
  { week: 6, focus: 'Plan iron-rich meals around your cycle (for menstruating individuals) to compensate for losses.' },
  { week: 7, focus: 'Review supplement use with a healthcare provider if dietary intake remains insufficient after optimization.' },
  { week: 8, focus: 'Reassess intake and symptoms; establish long-term maintenance habits based on your needs and test results.' },
];

const warningSigns = () => [
  'Never self-supplement with iron unless diagnosed with deficiency—excess iron can cause organ damage and mask underlying conditions.',
  'Individuals with hemochromatosis or iron-loading disorders must avoid iron supplements and limit heme iron intake under medical supervision.',
  'Severe iron deficiency anemia requires medical treatment with prescription iron and investigation of underlying causes (bleeding, malabsorption).',
];

function rdaIronMg(age: number, sex: 'male' | 'female', pregnant: boolean, lactating: boolean): number {
  if (age >= 1 && age <= 3) return 7;
  if (age >= 4 && age <= 8) return 10;
  if (age >= 9 && age <= 13) return 8;
  if (age >= 14 && age <= 18) {
    if (pregnant) return 27;
    if (lactating) return 10;
    return sex === 'male' ? 11 : 15;
  }
  if (age >= 19 && age <= 50) {
    if (pregnant) return 27;
    if (lactating) return 9;
    return sex === 'male' ? 8 : 18;
  }
  return 8;
}

const interpretStatus = (delta: number | null): { status: ResultPayload['status']; message: string } => {
  if (delta === null) return { status: null, message: 'Enter your current intake to see how it compares with the recommended target.' };
  if (delta > 5) return { status: 'low', message: 'Your current intake appears below the RDA. Focus on iron-rich foods and consider testing if symptoms persist.' };
  if (delta < -10) {
    return {
      status: 'high',
      message:
        'Intake exceeds recommended levels. If using supplements, review dosage with a healthcare provider. Excess iron can be harmful.',
    };
  }
  return { status: 'adequate', message: 'Your iron intake aligns with recommendations. Maintain diverse sources and monitor for deficiency symptoms.' };
};

const recommendations = (status: ResultPayload['status']) => {
  const base = [
    'Prioritize heme iron sources (meat, fish, poultry) for better absorption, or pair plant sources with vitamin C.',
    'Avoid tea, coffee, and calcium supplements within 1 hour of iron-rich meals to maximize absorption.',
    'Use cast-iron cookware when preparing acidic foods to boost iron content naturally.',
  ];

  if (status === 'low') {
    return [
      ...base,
      'Include iron-rich foods at most meals: red meat, legumes, fortified cereals, or dark leafy greens.',
      'If symptoms persist after dietary changes, consult a healthcare provider for blood testing and potential supplementation.',
    ];
  }

  if (status === 'high') {
    return [
      ...base,
      'Review supplement labels and reduce doses if exceeding recommended amounts without medical supervision.',
      'Monitor for signs of iron overload (joint pain, fatigue, abdominal pain) and consult a healthcare provider.',
    ];
  }

  return [
    ...base,
    'Continue rotating iron sources to cover both heme and non-heme options for balanced nutrition.',
    'Schedule periodic blood tests if you have risk factors (heavy periods, restrictive diet, pregnancy).',
  ];
};

const calculateIron = (values: FormValues): ResultPayload => {
  const recommended = rdaIronMg(values.age, values.sex, values.pregnant, values.lactating);
  const delta = values.currentIntake !== undefined ? recommended - values.currentIntake : null;
  const interpretation = interpretStatus(delta);

  return {
    recommendedIron: recommended,
    delta,
    status: interpretation.status,
    interpretation: interpretation.message,
    recommendations: recommendations(interpretation.status),
    warningSigns: warningSigns(),
    plan: plan(),
  };
};

export default function IronIntakeCalculator() {
  const [result, setResult] = useState<ResultPayload | null>(null);

  const form = useForm<FormValues>({
    resolver: zodResolver(formSchema),
    defaultValues: {
      age: undefined,
      sex: undefined,
      pregnant: false,
      lactating: false,
      currentIntake: undefined,
    },
  });

  const sex = form.watch('sex');
  useEffect(() => {
    if (sex === 'male') {
      form.setValue('pregnant', false, { shouldValidate: false, shouldDirty: false });
      form.setValue('lactating', false, { shouldValidate: false, shouldDirty: false });
    }
  }, [sex, form]);

  const onSubmit = (values: FormValues) => {
    setResult(calculateIron(values));
  };

  return (
    <div className="space-y-8">
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2"><Utensils className="h-5 w-5" /> Iron Intake Calculator</CardTitle>
          <CardDescription>Estimate recommended iron intake by age, sex, and life stage, and compare it with your current diet.</CardDescription>
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
                {sex === 'female' && (
                  <>
                    <FormField control={form.control} name="pregnant" render={({ field }) => (
                      <FormItem>
                        <FormLabel>Pregnant</FormLabel>
                        <Select
                          onValueChange={(v) => field.onChange(v === 'true')}
                          value={String(field.value)}
                        >
                          <FormControl>
                            <SelectTrigger>
                              <SelectValue placeholder="Select" />
                            </SelectTrigger>
                          </FormControl>
                          <SelectContent>
                            <SelectItem value="false">No</SelectItem>
                            <SelectItem value="true">Yes</SelectItem>
                          </SelectContent>
                        </Select>
                        <FormMessage />
                      </FormItem>
                    )} />
                    <FormField control={form.control} name="lactating" render={({ field }) => (
                      <FormItem>
                        <FormLabel>Lactating</FormLabel>
                        <Select
                          onValueChange={(v) => field.onChange(v === 'true')}
                          value={String(field.value)}
                        >
                          <FormControl>
                            <SelectTrigger>
                              <SelectValue placeholder="Select" />
                            </SelectTrigger>
                          </FormControl>
                          <SelectContent>
                            <SelectItem value="false">No</SelectItem>
                            <SelectItem value="true">Yes</SelectItem>
                          </SelectContent>
                        </Select>
                        <FormMessage />
                      </FormItem>
                    )} />
                  </>
                )}
                <FormField control={form.control} name="currentIntake" render={({ field }) => (
                  <FormItem>
                    <FormLabel>Current Iron Intake (mg/day)</FormLabel>
                    <FormControl>
                      <Input
                        type="number"
                        step="0.1"
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
              <div className="flex items-center gap-4"><Activity className="h-8 w-8 text-primary" /><CardTitle>Daily Iron Summary</CardTitle></div>
              <CardDescription>Personalized guidance based on dietary reference intakes</CardDescription>
            </CardHeader>
            <CardContent className="space-y-4">
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div className="p-4 border rounded">
                  <h4 className="text-sm font-semibold text-muted-foreground">Recommended Intake</h4>
                  <p className="text-2xl font-bold text-primary">{result.recommendedIron} mg</p>
                </div>
                <div className="p-4 border rounded">
                  <h4 className="text-sm font-semibold text-muted-foreground">Intake Gap</h4>
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
              <CardTitle className="flex items-center gap-2"><Calendar className="h-5 w-5" /> 8‑Week Iron Optimization Plan</CardTitle>
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
                <Link href="/category/health-fitness/zinc-requirement-calculator" className="text-primary hover:underline">
                  Zinc Requirement Calculator
                </Link>
              </h4>
              <p className="text-sm text-muted-foreground">Balance iron and zinc intake, as high iron can interfere with zinc absorption.</p>
            </div>
            <div className="p-4 border rounded">
              <h4 className="font-semibold mb-1">
                <Link href="/category/health-fitness/calcium-intake-calculator" className="text-primary hover:underline">
                  Calcium Intake Calculator
                </Link>
              </h4>
              <p className="text-sm text-muted-foreground">Time calcium supplements away from iron-rich meals to avoid absorption competition.</p>
            </div>
            <div className="p-4 border rounded">
              <h4 className="font-semibold mb-1">
                <Link href="/category/health-fitness/magnesium-intake-calculator" className="text-primary hover:underline">
                  Magnesium Intake Calculator
                </Link>
              </h4>
              <p className="text-sm text-muted-foreground">Support overall mineral balance alongside iron optimization.</p>
            </div>
            <div className="p-4 border rounded">
              <h4 className="font-semibold mb-1">
                <Link href="/category/health-fitness/vitamin-d-sun-exposure-calculator" className="text-primary hover:underline">
                  Vitamin D Sun Exposure Calculator
                </Link>
              </h4>
              <p className="text-sm text-muted-foreground">Ensure adequate vitamin D, which supports iron absorption and immune function.</p>
            </div>
          </div>
        </CardContent>
      </Card>

      <Card>
        <CardHeader>
          <CardTitle>Complete Guide: Mastering Iron Intake</CardTitle>
          <CardDescription>Practical strategies for meeting daily requirements</CardDescription>
        </CardHeader>
        <CardContent className="prose prose-sm dark:prose-invert max-w-none">
          <p>
            Iron is essential for oxygen transport, energy production, and immune function. Premenopausal women need significantly more iron (18 mg/day) than men (8 mg/day) due to menstrual losses. Pregnancy increases needs to 27 mg/day. Focus on heme iron sources (meat, fish) for better absorption, or pair plant sources with vitamin C. Avoid tea, coffee, and calcium supplements near iron-rich meals.
          </p>
          <p>
            Never self-supplement with iron unless diagnosed with deficiency—excess iron can be harmful. If you experience fatigue, pallor, or other deficiency symptoms, consult a healthcare provider for blood testing (ferritin, hemoglobin) before starting supplements.
          </p>
        </CardContent>
      </Card>

      <Card>
        <CardHeader>
          <CardTitle>Frequently Asked Questions</CardTitle>
          <CardDescription>Iron basics and best practices</CardDescription>
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

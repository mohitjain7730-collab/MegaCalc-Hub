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
    currentIntake: z.number({ invalid_type_error: 'Enter current intake in mg' }).min(0).max(50).optional(),
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
  recommendedZinc: number;
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
    description: 'Zinc requirements increase during growth periods (adolescence) and remain higher for men (11 mg/day) than women (8 mg/day) in adulthood.',
  },
  {
    label: 'Sex',
    description: 'Men typically need more zinc (11 mg/day) than women (8 mg/day) due to higher lean mass and testosterone production.',
  },
  {
    label: 'Life Stage',
    description: 'Pregnancy increases zinc needs to 11–12 mg/day for fetal development, while lactation requires 12–13 mg/day to support milk production.',
  },
  {
    label: 'Current Intake (optional)',
    description: 'Enter your usual daily zinc intake from food and supplements to see whether you meet the recommended target.',
  },
];

const faqs: [string, string][] = [
  [
    'What does zinc do in the body?',
    'Zinc supports immune function, wound healing, DNA synthesis, growth, taste/smell, hormone production (testosterone), and over 300 enzyme reactions.',
  ],
  [
    'How much zinc do adults need each day?',
    'Adult men need 11 mg/day and women 8 mg/day. Pregnant women need 11 mg/day, and lactating women need 12–13 mg/day.',
  ],
  [
    'Which foods are highest in zinc?',
    'Oysters (best source), red meat, poultry, seafood, legumes, nuts, seeds, whole grains, and fortified cereals. Animal sources are more bioavailable.',
  ],
  [
    'Can I take too much zinc?',
    'Yes. The upper limit is 40 mg/day for adults. Excessive zinc can cause nausea, copper deficiency, and suppressed immunity. Avoid long-term high-dose supplements.',
  ],
  [
    'What are signs of zinc deficiency?',
    'Weakened immunity, frequent colds, delayed wound healing, hair loss, loss of taste/smell, skin rashes, stunted growth (children), and fertility issues.',
  ],
  [
    'How can vegetarians meet zinc needs?',
    'Include legumes, nuts, seeds, whole grains, and fortified foods. Soak, sprout, or ferment grains/legumes to reduce phytates that inhibit absorption.',
  ],
  [
    'Does zinc help with colds?',
    'Zinc lozenges or supplements taken at the onset of illness may reduce cold duration. However, excessive zinc can suppress immunity—stay within recommended limits.',
  ],
  [
    'Should I take zinc supplements?',
    'Supplements help when dietary intake is low or absorption is impaired. Most people can meet needs through food. Consult a healthcare provider before supplementing.',
  ],
  [
    'What interferes with zinc absorption?',
    'Phytates in whole grains and legumes, high iron/calcium supplements, and excessive fiber can reduce zinc absorption. Pair zinc-rich foods with protein for better uptake.',
  ],
  [
    'How often should I reassess my zinc intake?',
    'Review every few months or when diet, activity level, pregnancy status, or immune function changes. Athletes and those with digestive issues may need more.',
  ],
];

const plan = (): { week: number; focus: string }[] => [
  { week: 1, focus: 'Track current zinc intake for 3–5 days; note animal vs. plant sources and phytate-rich foods.' },
  { week: 2, focus: 'Add one zinc-rich food daily: oysters, red meat, poultry, legumes, or pumpkin seeds.' },
  { week: 3, focus: 'Soak or sprout legumes and grains to reduce phytates and improve zinc bioavailability.' },
  { week: 4, focus: 'Time zinc supplements away from iron/calcium supplements to avoid absorption competition.' },
  { week: 5, focus: 'Include protein-rich meals with zinc sources to enhance absorption and utilization.' },
  { week: 6, focus: 'Evaluate immune function, wound healing, and taste/smell—consider testing if deficiency is suspected.' },
  { week: 7, focus: 'Review supplement labels and ensure total zinc stays within safe limits (≤40 mg/day from all sources).' },
  { week: 8, focus: 'Reassess intake, adjust as needed, and plan long-term maintenance habits based on your needs.' },
];

const warningSigns = () => [
  'Excessive zinc supplementation (>40 mg/day long-term) can cause copper deficiency, nausea, and suppressed immunity—monitor total intake from all sources.',
  'Individuals with kidney disease or on zinc-altering medications should adjust intake only under medical supervision.',
  'Zinc supplements can interact with antibiotics, diuretics, and other medications—consult a healthcare provider before use.',
];

function rdaZincMg(age: number, sex: 'male' | 'female'): number {
  if (age >= 1 && age <= 3) return 3;
  if (age >= 4 && age <= 8) return 5;
  if (age >= 9 && age <= 13) return 8;
  if (age >= 14 && age <= 18) return sex === 'male' ? 11 : 9;
  return sex === 'male' ? 11 : 8;
}

const applyLifeStageAdjustment = (rda: number, lifeStage: FormValues['lifeStage'], age: number) => {
  if (!lifeStage || lifeStage === 'none') return rda;
  if (age < 14) return rda;
  if (lifeStage === 'pregnant') {
    if (age <= 18) return 12;
    return 11;
  }
  if (lifeStage === 'lactating') {
    if (age <= 18) return 13;
    return 12;
  }
  return rda;
};

const tolerableUpperIntake = (age: number): number | null => {
  if (age < 4) return null;
  if (age <= 8) return 12;
  if (age <= 13) return 23;
  if (age <= 18) return 34;
  return 40;
};

const interpretStatus = (delta: number | null, ul: number | null): { status: ResultPayload['status']; message: string } => {
  if (delta === null) return { status: null, message: 'Enter your current intake to see how it compares with the recommended target.' };
  if (delta > 3) return { status: 'low', message: 'Your current intake appears below the RDA. Add zinc-rich foods or discuss supplements with a professional.' };
  if (delta < -10) {
    if (ul && delta + ul < 0) {
      return {
        status: 'high',
        message:
          'Intake exceeds the upper limit. Reduce supplemental zinc and monitor for copper deficiency or gastrointestinal side effects.',
      };
    }
    return { status: 'high', message: 'You are consuming more zinc than required. Excess from food is typically safe but monitor supplements.' };
  }
  return { status: 'adequate', message: 'Your zinc intake aligns with recommendations. Maintain diverse sources and support absorption with protein.' };
};

const recommendations = (status: ResultPayload['status']) => {
  const base = [
    'Prioritize animal-based zinc sources (oysters, meat, poultry) for better bioavailability, or pair plant sources with protein.',
    'Soak, sprout, or ferment grains and legumes to reduce phytates that inhibit zinc absorption.',
    'Time zinc supplements away from iron and calcium supplements to avoid absorption competition.',
  ];

  if (status === 'low') {
    return [
      ...base,
      'Add one zinc-rich food daily: oysters, red meat, poultry, legumes, or pumpkin seeds.',
      'Consider a zinc supplement (8–11 mg) if dietary changes are insufficient—begin with food-based sources first.',
    ];
  }

  if (status === 'high') {
    return [
      ...base,
      'Review supplement labels to ensure total elemental zinc stays within safe limits (≤40 mg/day for adults).',
      'If you experience nausea, copper deficiency symptoms, or suppressed immunity, reduce supplemental doses.',
    ];
  }

  return [
    ...base,
    'Continue rotating zinc sources to cover both animal and plant options for balanced nutrition.',
    'Monitor immune function, wound healing, and taste/smell as indicators of zinc status.',
  ];
};

const calculateZinc = (values: FormValues): ResultPayload => {
  const base = rdaZincMg(values.age, values.sex);
  const adjusted = applyLifeStageAdjustment(base, values.lifeStage, values.age);
  const upper = tolerableUpperIntake(values.age);
  const delta = values.currentIntake !== undefined ? adjusted - values.currentIntake : null;
  const interpretation = interpretStatus(delta, upper);

  return {
    recommendedZinc: adjusted,
    upperLimitMg: upper,
    delta,
    status: interpretation.status,
    interpretation: interpretation.message,
    recommendations: recommendations(interpretation.status),
    warningSigns: warningSigns(),
    plan: plan(),
  };
};

export default function ZincRequirementCalculator() {
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
    setResult(calculateZinc(values));
  };

  return (
    <div className="space-y-8">
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2"><Utensils className="h-5 w-5" /> Zinc Requirement Calculator</CardTitle>
          <CardDescription>Estimate recommended zinc intake by age, sex, and life stage, and compare it with your current diet.</CardDescription>
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
                    <FormLabel>Current Zinc Intake (mg/day)</FormLabel>
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
              <div className="flex items-center gap-4"><Activity className="h-8 w-8 text-primary" /><CardTitle>Daily Zinc Summary</CardTitle></div>
              <CardDescription>Personalized guidance based on dietary reference intakes</CardDescription>
            </CardHeader>
            <CardContent className="space-y-4">
              <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                <div className="p-4 border rounded">
                  <h4 className="text-sm font-semibold text-muted-foreground">Recommended Intake</h4>
                  <p className="text-2xl font-bold text-primary">{result.recommendedZinc} mg</p>
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
              <p className="text-xs text-muted-foreground">*Upper limit reflects total zinc from all sources. Food-based zinc is generally safe; monitor supplements.</p>
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
              <CardTitle className="flex items-center gap-2"><Calendar className="h-5 w-5" /> 8‑Week Zinc Optimization Plan</CardTitle>
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
                <Link href="/category/health-fitness/iron-intake-calculator" className="text-primary hover:underline">
                  Iron Intake Calculator
                </Link>
              </h4>
              <p className="text-sm text-muted-foreground">Balance zinc and iron intake, as high iron can interfere with zinc absorption.</p>
            </div>
            <div className="p-4 border rounded">
              <h4 className="font-semibold mb-1">
                <Link href="/category/health-fitness/magnesium-intake-calculator" className="text-primary hover:underline">
                  Magnesium Intake Calculator
                </Link>
              </h4>
              <p className="text-sm text-muted-foreground">Support overall mineral balance alongside zinc optimization.</p>
            </div>
            <div className="p-4 border rounded">
              <h4 className="font-semibold mb-1">
                <Link href="/category/health-fitness/calcium-intake-calculator" className="text-primary hover:underline">
                  Calcium Intake Calculator
                </Link>
              </h4>
              <p className="text-sm text-muted-foreground">Time calcium supplements away from zinc-rich meals to avoid absorption competition.</p>
            </div>
            <div className="p-4 border rounded">
              <h4 className="font-semibold mb-1">
                <Link href="/category/health-fitness/protein-intake-calculator" className="text-primary hover:underline">
                  Protein Intake Calculator
                </Link>
              </h4>
              <p className="text-sm text-muted-foreground">Pair zinc-rich foods with adequate protein to enhance absorption and utilization.</p>
            </div>
          </div>
        </CardContent>
      </Card>

      <Card>
        <CardHeader>
          <CardTitle>Complete Guide: Mastering Zinc Intake</CardTitle>
          <CardDescription>Practical strategies for meeting daily requirements</CardDescription>
        </CardHeader>
        <CardContent className="prose prose-sm dark:prose-invert max-w-none">
          <p>
            Zinc is essential for immune function, wound healing, growth, and over 300 enzyme reactions. Men need 11 mg/day and women 8 mg/day, with increases during pregnancy (11 mg) and lactation (12–13 mg). Prioritize animal sources (oysters, meat, poultry) for better bioavailability, or pair plant sources with protein and reduce phytates through soaking/sprouting.
          </p>
          <p>
            Avoid excessive supplementation (>40 mg/day) which can cause copper deficiency and suppressed immunity. Time zinc supplements away from iron and calcium supplements. Monitor immune function, wound healing, and taste/smell as indicators of zinc status.
          </p>
        </CardContent>
      </Card>

      <Card>
        <CardHeader>
          <CardTitle>Frequently Asked Questions</CardTitle>
          <CardDescription>Zinc basics and best practices</CardDescription>
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

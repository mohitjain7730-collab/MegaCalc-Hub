'use client';

import { useState } from 'react';
import Script from 'next/script';
import Link from 'next/link';
import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import { z } from 'zod';
import { AlertTriangle, Zap, Target, Activity, Shield } from 'lucide-react';

import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Form, FormControl, FormField, FormItem, FormLabel, FormMessage } from '@/components/ui/form';
import { Input } from '@/components/ui/input';

const formSchema = z.object({
  hemoglobinLevel: z.number({ invalid_type_error: 'Enter hemoglobin level' }).min(5).max(20),
  ironIntake: z.number({ invalid_type_error: 'Enter iron intake' }).min(0).max(50),
  age: z.number({ invalid_type_error: 'Enter age' }).min(1).max(100),
  gender: z.enum(['male', 'female'], { invalid_type_error: 'Select gender' }),
});

type FormValues = z.infer<typeof formSchema>;

type ResultPayload = {
  hemoglobinLevel: number;
  ironIntake: number;
  riskScore: number;
  riskPercentage: number;
  status: 'optimal' | 'good' | 'moderate' | 'low';
  interpretation: string;
  recommendations: string[];
  plan: { label: string; detail: string }[];
};

const steps = [
  'Enter hemoglobin level (g/dL) from blood test.',
  'Enter daily iron intake (mg) from diet and supplements.',
  'Enter your age (iron needs vary by age).',
  'Select gender (iron needs differ for males and females).',
  'Review iron deficiency anemia risk, status, and recommendations.',
];

const faqs = [
  {
    question: 'What is iron deficiency anemia?',
    answer:
      'Iron deficiency anemia is a condition where the body lacks sufficient iron to produce adequate hemoglobin and red blood cells. It is the most common type of anemia worldwide.',
  },
  {
    question: 'What are symptoms of iron deficiency anemia?',
    answer:
      'Symptoms include fatigue, weakness, pale skin, shortness of breath, dizziness, cold hands and feet, brittle nails, and unusual cravings (pica). Severe cases can cause heart problems.',
  },
  {
    question: 'What causes iron deficiency anemia?',
    answer:
      'Causes include inadequate iron intake, blood loss (menstruation, gastrointestinal bleeding), increased iron needs (pregnancy, growth), poor iron absorption, or chronic disease.',
  },
  {
    question: 'What are normal hemoglobin levels?',
    answer:
      'Normal hemoglobin: Men 13.5-17.5 g/dL, Women 12.0-15.5 g/dL. Levels below these ranges may indicate anemia. Iron deficiency is a common cause of low hemoglobin.',
  },
  {
    question: 'How much iron do I need?',
    answer:
      'Recommended daily iron: Men 8 mg, Women 18 mg (menstruating), 8 mg (postmenopausal), Pregnant women 27 mg. Higher needs during growth, pregnancy, and with blood loss.',
  },
  {
    question: 'How can I increase iron intake?',
    answer:
      'Include iron-rich foods: red meat, poultry, fish, leafy greens, beans, lentils, fortified cereals, and nuts. Pair with vitamin C to enhance absorption. Consider supplements if needed.',
  },
  {
    question: 'Does gender affect iron needs?',
    answer:
      'Yes. Menstruating women have higher iron needs (18 mg/day) due to monthly blood loss. Men and postmenopausal women need less (8 mg/day). Pregnancy increases needs significantly (27 mg/day).',
  },
  {
    question: 'What about iron absorption?',
    answer:
      'Iron absorption is enhanced by vitamin C, meat, and acidic foods. It is inhibited by calcium, tea, coffee, and phytates. Timing of iron intake and food combinations affect absorption.',
  },
  {
    question: 'Can I track iron deficiency at home?',
    answer:
      'Home iron tests are limited. Blood tests through healthcare providers (hemoglobin, ferritin, iron studies) provide accurate assessment. Regular monitoring is important for at-risk individuals.',
  },
  {
    question: 'When should I consult a healthcare provider?',
    answer:
      'Consult a healthcare provider if hemoglobin is low, if you have symptoms of anemia, if iron intake is inadequate, or if you have risk factors (heavy periods, gastrointestinal issues, pregnancy).',
  },
];

const relatedCalculators = [
  {
    name: 'Hemoglobin (Hb) Level Estimator',
    slug: 'hemoglobin-hb-level-estimator',
    description: 'Estimate hemoglobin levels alongside iron deficiency risk.',
  },
  {
    name: 'Red Blood Cell Count to Oxygen Capacity Calculator',
    slug: 'red-blood-cell-count-to-oxygen-capacity-calculator',
    description: 'Assess blood health comprehensively.',
  },
  {
    name: 'Iron Intake Calculator',
    slug: 'protein-intake-calculator',
    description: 'Track iron intake that affects anemia risk.',
  },
];

const baseUrl = 'https://mycalculating.com/health-fitness/iron-deficiency-anemia-risk-calculator';

const schemaMarkup = {
  '@context': 'https://schema.org',
  '@graph': [
    {
      '@type': 'BreadcrumbList',
      itemListElement: [
        { '@type': 'ListItem', position: 1, name: 'Home', item: 'https://mycalculating.com' },
        { '@type': 'ListItem', position: 2, name: 'Health & Fitness', item: 'https://mycalculating.com/health-fitness' },
        { '@type': 'ListItem', position: 3, name: 'Iron Deficiency Anemia Risk Calculator', item: baseUrl },
      ],
    },
    {
      '@type': 'SoftwareApplication',
      name: 'Iron Deficiency Anemia Risk Calculator',
      applicationCategory: 'Calculator',
      operatingSystem: 'Web Browser',
      description: 'Calculate iron deficiency anemia risk from hemoglobin level, iron intake, age, and gender.',
      url: baseUrl,
      offers: { '@type': 'Offer', price: '0', priceCurrency: 'USD' },
    },
  ],
};

const clamp = (value: number, min: number, max: number) => Math.min(max, Math.max(min, value));

const calculateResult = (values: FormValues): ResultPayload => {
  const hemoglobinLevel = values.hemoglobinLevel;
  const ironIntake = values.ironIntake;
  
  // Determine normal hemoglobin range
  const minNormal = values.gender === 'male' ? 13.5 : 12.0;
  const maxNormal = values.gender === 'male' ? 17.5 : 15.5;
  
  // Determine recommended iron intake
  let recommendedIron: number;
  if (values.gender === 'female') {
    if (values.age >= 14 && values.age <= 50) {
      recommendedIron = 18; // Menstruating women
    } else {
      recommendedIron = 8; // Postmenopausal
    }
  } else {
    recommendedIron = 8; // Men
  }
  
  // Calculate risk score (0-100, higher = lower risk)
  let riskScore = 50;
  
  // Hemoglobin component (0-50 points)
  if (hemoglobinLevel >= minNormal && hemoglobinLevel <= maxNormal) {
    riskScore += 40; // Normal range
  } else if (hemoglobinLevel >= minNormal - 1 && hemoglobinLevel < minNormal) {
    riskScore += 20; // Slightly low
  } else if (hemoglobinLevel >= minNormal - 2 && hemoglobinLevel < minNormal - 1) {
    riskScore -= 10; // Low
  } else if (hemoglobinLevel < minNormal - 2) {
    riskScore -= 40; // Very low, high risk
  } else if (hemoglobinLevel > maxNormal) {
    riskScore += 10; // Above normal (not anemia)
  }
  
  // Iron intake component (0-50 points)
  if (ironIntake >= recommendedIron) {
    riskScore += 40; // Adequate intake
  } else if (ironIntake >= recommendedIron * 0.7) {
    riskScore += 20; // Slightly low
  } else if (ironIntake >= recommendedIron * 0.5) {
    riskScore -= 10; // Low intake
  } else {
    riskScore -= 30; // Very low intake, high risk
  }
  
  riskScore = clamp(riskScore, 0, 100);
  const riskPercentage = 100 - riskScore; // Invert for risk percentage

  let status: ResultPayload['status'] = 'optimal';
  let interpretation = 'Your iron deficiency anemia risk appears low. Continue maintaining adequate iron intake and healthy hemoglobin levels.';

  if (hemoglobinLevel < minNormal - 2 || riskScore < 30) {
    status = 'low';
    interpretation = 'Your iron deficiency anemia risk is high. Hemoglobin is low and/or iron intake is inadequate. Consult a healthcare provider immediately for evaluation and treatment.';
  } else if (hemoglobinLevel < minNormal || riskScore < 50) {
    status = 'moderate';
    interpretation = 'Your iron deficiency anemia risk is moderate. Hemoglobin may be low or iron intake may be inadequate. Increase iron intake and monitor closely.';
  } else if (riskScore < 70) {
    status = 'good';
    interpretation = 'Your iron deficiency anemia risk is low. Continue maintaining adequate iron intake and monitor hemoglobin levels.';
  }

  const recommendations = [
    'Increase iron intake through diet: include red meat, poultry, fish, leafy greens, beans, lentils, fortified cereals, and nuts in your meals.',
    'Enhance iron absorption by pairing iron-rich foods with vitamin C sources (citrus fruits, bell peppers, tomatoes) and avoiding calcium, tea, or coffee with iron-rich meals.',
    'Consider iron supplements if dietary intake is insufficient or if recommended by healthcare provider, especially for menstruating women, pregnant women, or those with low hemoglobin.',
  ];
  if (status === 'low' || status === 'moderate') {
    recommendations.push('Consult a healthcare provider for comprehensive evaluation, including blood tests (hemoglobin, ferritin, iron studies) and appropriate treatment if anemia is confirmed.');
  }
  if (hemoglobinLevel < minNormal) {
    recommendations.push('Address low hemoglobin promptly. Iron deficiency anemia can cause fatigue, weakness, and other symptoms that improve with iron supplementation.');
  }
  if (ironIntake < recommendedIron) {
    recommendations.push(`Increase daily iron intake to meet recommended levels (${recommendedIron} mg/day for your age and gender). Consider dietary changes and supplements if needed.`);
  }

  const plan = [
    { label: 'This Week', detail: 'Review blood test results for hemoglobin level. Assess current iron intake and calculate iron deficiency anemia risk.' },
    { label: 'This Month', detail: 'Implement dietary changes to increase iron intake: add iron-rich foods, pair with vitamin C, and consider supplements if recommended by healthcare provider.' },
    { label: 'Ongoing', detail: 'Monitor hemoglobin and iron status regularly through healthcare provider. Address any persistent low levels with medical guidance and appropriate treatment.' },
  ];

  return { hemoglobinLevel, ironIntake, riskScore, riskPercentage, status, interpretation, recommendations, plan };
};

export default function IronDeficiencyAnemiaRiskCalculator() {
  const [result, setResult] = useState<ResultPayload | null>(null);

  const form = useForm<FormValues>({
    resolver: zodResolver(formSchema),
    defaultValues: {
      hemoglobinLevel: undefined,
      ironIntake: undefined,
      age: undefined,
      gender: undefined,
    },
  });

  return (
    <div className="space-y-8">
      <Script id="iron-anemia-risk-schema" type="application/ld+json" strategy="afterInteractive" dangerouslySetInnerHTML={{ __html: JSON.stringify(schemaMarkup) }} />

      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <AlertTriangle className="h-5 w-5" />
            Iron Deficiency Anemia Risk Calculator
          </CardTitle>
          <CardDescription>Calculate iron deficiency anemia risk from hemoglobin level, iron intake, age, and gender.</CardDescription>
        </CardHeader>
      </Card>

      <Card>
        <CardHeader>
          <CardTitle>Input your iron deficiency risk data</CardTitle>
        </CardHeader>
        <CardContent>
          <Form {...form}>
            <form onSubmit={form.handleSubmit((values) => setResult(calculateResult(values)))} className="space-y-6">
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <FormField
                  control={form.control}
                  name="hemoglobinLevel"
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel>Hemoglobin level (g/dL)</FormLabel>
                      <FormControl>
                        <Input type="number" step="0.1" placeholder="e.g., 14.5" value={field.value ?? ''} onChange={(e) => field.onChange(e.target.value === '' ? undefined : Number(e.target.value))} />
                      </FormControl>
                      <FormMessage />
                    </FormItem>
                  )}
                />
                <FormField
                  control={form.control}
                  name="ironIntake"
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel>Daily iron intake (mg)</FormLabel>
                      <FormControl>
                        <Input type="number" step="0.1" placeholder="e.g., 15" value={field.value ?? ''} onChange={(e) => field.onChange(e.target.value === '' ? undefined : Number(e.target.value))} />
                      </FormControl>
                      <FormMessage />
                    </FormItem>
                  )}
                />
                <FormField
                  control={form.control}
                  name="age"
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel>Age (years)</FormLabel>
                      <FormControl>
                        <Input type="number" step="1" placeholder="e.g., 35" value={field.value ?? ''} onChange={(e) => field.onChange(e.target.value === '' ? undefined : Number(e.target.value))} />
                      </FormControl>
                      <FormMessage />
                    </FormItem>
                  )}
                />
                <FormField
                  control={form.control}
                  name="gender"
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel>Gender</FormLabel>
                      <FormControl>
                        <select
                          value={field.value ?? ''}
                          onChange={(e) => field.onChange(e.target.value as 'male' | 'female')}
                          className="flex h-10 w-full rounded-md border border-input bg-background px-3 py-2 text-sm ring-offset-background file:border-0 file:bg-transparent file:text-sm file:font-medium placeholder:text-muted-foreground focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2 disabled:cursor-not-allowed disabled:opacity-50"
                        >
                          <option value="">Select gender</option>
                          <option value="male">Male</option>
                          <option value="female">Female</option>
                        </select>
                      </FormControl>
                      <FormMessage />
                    </FormItem>
                  )}
                />
              </div>
              <Button type="submit" className="w-full md:w-auto">
                Calculate anemia risk
              </Button>
            </form>
          </Form>
        </CardContent>
      </Card>

      {result && (
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <Zap className="h-5 w-5 text-primary" />
              Interactive results
            </CardTitle>
            <CardDescription>See iron deficiency anemia risk, status, and recommendations.</CardDescription>
          </CardHeader>
          <CardContent className="space-y-6">
            <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
              <div className="p-4 border rounded">
                <p className="text-sm text-muted-foreground">Hemoglobin level</p>
                <p className="text-2xl font-semibold text-primary">{result.hemoglobinLevel.toFixed(1)}</p>
                <p className="text-xs text-muted-foreground">g/dL</p>
              </div>
              <div className="p-4 border rounded">
                <p className="text-sm text-muted-foreground">Iron intake</p>
                <p className="text-2xl font-semibold text-primary">{result.ironIntake.toFixed(1)}</p>
                <p className="text-xs text-muted-foreground">mg/day</p>
              </div>
              <div className="p-4 border rounded">
                <p className="text-sm text-muted-foreground">Risk percentage</p>
                <p className="text-2xl font-semibold text-primary">{result.riskPercentage.toFixed(0)}%</p>
                <p className="text-xs text-muted-foreground">Anemia risk</p>
              </div>
              <div className="p-4 border rounded">
                <p className="text-sm text-muted-foreground">Status</p>
                <p className="text-2xl font-semibold text-primary capitalize">{result.status}</p>
                <p className="text-xs text-muted-foreground">{result.interpretation}</p>
              </div>
            </div>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <Card>
                <CardHeader>
                  <CardTitle className="text-base flex items-center gap-2">
                    <Target className="h-4 w-4" />
                    Recommendations
                  </CardTitle>
                </CardHeader>
                <CardContent>
                  <ul className="list-disc pl-4 space-y-1 text-sm text-muted-foreground">
                    {result.recommendations.map((rec) => (
                      <li key={rec}>{rec}</li>
                    ))}
                  </ul>
                </CardContent>
              </Card>
              <Card>
                <CardHeader>
                  <CardTitle className="text-base flex items-center gap-2">
                    <Activity className="h-4 w-4" />
                    Action plan
                  </CardTitle>
                </CardHeader>
                <CardContent>
                  <ul className="space-y-1 text-sm text-muted-foreground">
                    {result.plan.map((step) => (
                      <li key={step.label}>
                        <span className="font-semibold">{step.label}:</span> {step.detail}
                      </li>
                    ))}
                  </ul>
                </CardContent>
              </Card>
            </div>
          </CardContent>
        </Card>
      )}

      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <Shield className="h-5 w-5" />
            Formula
          </CardTitle>
        </CardHeader>
        <CardContent className="text-sm text-muted-foreground space-y-2">
          <p>
            <strong>Risk score</strong> = calculated from hemoglobin level (normal ranges: Men 13.5-17.5 g/dL, Women 12.0-15.5 g/dL) and iron intake (recommended: Men 8 mg, Women 18 mg for menstruating, 8 mg postmenopausal).
          </p>
          <p>
            <strong>Risk percentage</strong> = 100 - risk score (higher percentage indicates higher risk).
          </p>
          <p>
            <strong>Normal hemoglobin</strong>: Men: 13.5-17.5 g/dL, Women: 12.0-15.5 g/dL. Levels below these ranges may indicate anemia.
          </p>
          <p>Iron deficiency anemia risk is affected by hemoglobin level, iron intake, age, gender, blood loss, and iron absorption factors.</p>
        </CardContent>
      </Card>

      <Card>
        <CardHeader>
          <CardTitle>Steps</CardTitle>
        </CardHeader>
        <CardContent>
          <ul className="list-disc pl-5 space-y-2 text-sm text-muted-foreground">
            {steps.map((step) => (
              <li key={step}>{step}</li>
            ))}
          </ul>
        </CardContent>
      </Card>

      <Card>
        <CardHeader>
          <CardTitle>Additional calculations</CardTitle>
        </CardHeader>
        <CardContent>
          {result ? (
            <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
              <div className="p-4 border rounded">
                <p className="text-sm text-muted-foreground">Target hemoglobin (gender-based)</p>
                <p className="text-xl font-semibold text-primary">
                  {(() => {
                    const gender = form.getValues().gender;
                    return gender === 'male' ? '13.5-17.5 g/dL' : '12.0-15.5 g/dL';
                  })()}
                </p>
                <p className="text-xs text-muted-foreground">Normal range</p>
              </div>
              <div className="p-4 border rounded">
                <p className="text-sm text-muted-foreground">Recommended iron intake</p>
                <p className="text-xl font-semibold text-primary">
                  {(() => {
                    const gender = form.getValues().gender;
                    const age = form.getValues().age ?? 30;
                    if (gender === 'female' && age >= 14 && age <= 50) return '18 mg/day';
                    return '8 mg/day';
                  })()}
                </p>
                <p className="text-xs text-muted-foreground">For your age/gender</p>
              </div>
              <div className="p-4 border rounded">
                <p className="text-sm text-muted-foreground">Risk score</p>
                <p className="text-xl font-semibold text-primary">{result.riskScore.toFixed(0)}</p>
                <p className="text-xs text-muted-foreground">Out of 100 (higher = safer)</p>
              </div>
            </div>
          ) : (
            <p className="text-sm text-muted-foreground">Enter your iron deficiency risk data to see additional insights.</p>
          )}
        </CardContent>
      </Card>

      <Card>
        <CardHeader>
          <CardTitle>Related calculators</CardTitle>
        </CardHeader>
        <CardContent className="grid grid-cols-1 md:grid-cols-2 gap-4">
          {relatedCalculators.map((calc) => (
            <div key={calc.slug} className="p-4 border rounded">
              <h4 className="font-semibold mb-1">
                <Link href={`/health-fitness/${calc.slug}`} className="text-primary hover:underline">
                  {calc.name}
                </Link>
              </h4>
              <p className="text-sm text-muted-foreground">{calc.description}</p>
            </div>
          ))}
        </CardContent>
      </Card>

      <Card>
        <CardHeader>
          <CardTitle>Complete guide snapshot</CardTitle>
        </CardHeader>
        <CardContent className="prose prose-sm dark:prose-invert max-w-none">
          <p>Iron deficiency anemia is the most common type of anemia, caused by inadequate iron to produce hemoglobin and red blood cells. Normal hemoglobin: Men 13.5-17.5 g/dL, Women 12.0-15.5 g/dL. Recommended iron: Men 8 mg/day, Menstruating women 18 mg/day.</p>
          <p>Use this calculator to assess iron deficiency anemia risk from hemoglobin level, iron intake, age, and gender.</p>
        </CardContent>
      </Card>

      <Card>
        <CardHeader>
          <CardTitle>FAQs</CardTitle>
        </CardHeader>
        <CardContent className="space-y-4">
          {faqs.map((faq) => (
            <div key={faq.question}>
              <h4 className="font-semibold">{faq.question}</h4>
              <p className="text-sm text-muted-foreground">{faq.answer}</p>
            </div>
          ))}
        </CardContent>
      </Card>

      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <Shield className="h-5 w-5" />
            Summary
          </CardTitle>
        </CardHeader>
        <CardContent className="space-y-2 text-sm text-muted-foreground">
          <p>This tool calculates iron deficiency anemia risk from hemoglobin level, iron intake, age, and gender.</p>
          <p>Outputs include hemoglobin level, iron intake, risk score, risk percentage, status, recommendations, an action plan, and supporting metrics.</p>
          <p>Formula, steps, guide content, related tools, and FAQs ensure humans or AI assistants can interpret the methodology instantly.</p>
        </CardContent>
      </Card>
    </div>
  );
}



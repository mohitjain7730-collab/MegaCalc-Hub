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
  age: z.number({ invalid_type_error: 'Enter age' }).min(18).max(100),
  bmi: z.number({ invalid_type_error: 'Enter BMI' }).min(15).max(50),
  stressLevel: z.number({ invalid_type_error: 'Enter stress level' }).min(1).max(10),
  alcoholUnits: z.number({ invalid_type_error: 'Enter alcohol units' }).min(0).max(20),
  processedFoodScore: z.number({ invalid_type_error: 'Enter processed food score' }).min(1).max(10),
  exerciseFrequency: z.number({ invalid_type_error: 'Enter exercise frequency' }).min(0).max(7),
});

type FormValues = z.infer<typeof formSchema>;

type ResultPayload = {
  riskScore: number;
  dominanceLevel: number;
  status: 'low-risk' | 'moderate-risk' | 'high-risk';
  interpretation: string;
  recommendations: string[];
  plan: { label: string; detail: string }[];
};

const steps = [
  'Enter your age and current BMI.',
  'Rate your stress level (1-10) and count weekly alcohol units (1 unit = 1 drink).',
  'Score processed food intake (1 = whole foods, 10 = highly processed).',
  'Count exercise sessions per week.',
  'Review risk score and dominance level to identify potential contributing factors.',
];

const faqs = [
  {
    question: 'What is estrogen dominance?',
    answer:
      'Estrogen dominance occurs when estrogen levels are high relative to progesterone, potentially causing symptoms like weight gain, mood changes, and hormonal imbalances.',
  },
  {
    question: 'Is this a medical diagnosis?',
    answer:
      'No. This is an educational tool. Consult healthcare providers for actual hormone testing and diagnosis. Blood tests are needed to confirm hormone levels.',
  },
  {
    question: 'What factors increase risk?',
    answer:
      'High BMI, chronic stress, excessive alcohol, processed foods, low exercise, and age-related hormonal changes can contribute to estrogen dominance risk.',
  },
  {
    question: 'Can men have estrogen dominance?',
    answer:
      'Yes, though less common. Men can experience elevated estrogen relative to testosterone, often related to body fat, alcohol, or other factors.',
  },
  {
    question: 'How does stress affect hormones?',
    answer:
      'Chronic stress can disrupt hormone balance, affect cortisol, and indirectly impact estrogen and progesterone ratios.',
  },
  {
    question: 'Does alcohol increase estrogen?',
    answer:
      'Excessive alcohol can affect liver function, which processes hormones, and may contribute to estrogen dominance in some individuals.',
  },
  {
    question: 'Can diet help?',
    answer:
      'Yes. Reducing processed foods, increasing fiber, cruciferous vegetables, and supporting liver health may help balance hormones.',
  },
  {
    question: 'Does exercise help?',
    answer:
      'Yes. Regular exercise supports hormone balance, helps maintain healthy weight, and can reduce stress—all factors that support hormonal health.',
  },
  {
    question: 'What are common symptoms?',
    answer:
      'Symptoms may include weight gain (especially around hips/thighs), mood swings, fatigue, irregular periods, bloating, and sleep issues. See a doctor for evaluation.',
  },
  {
    question: 'Should I get hormone testing?',
    answer:
      'If you have symptoms or risk factors, consult a healthcare provider. Blood tests can measure estrogen, progesterone, and other hormones to guide treatment.',
  },
];

const relatedCalculators = [
  {
    name: 'Progesterone-to-Estrogen Ratio Calculator',
    slug: 'progesterone-to-estrogen-ratio-calculator',
    description: 'Calculate progesterone-to-estrogen ratio for hormonal balance.',
  },
  {
    name: 'BMI Calculator',
    slug: 'bmi-calculator',
    description: 'Track BMI as a factor in hormonal health.',
  },
  {
    name: 'Stress Hormone Balance Calculator',
    slug: 'stress-hormone-balance-calculator',
    description: 'Monitor cortisol and stress impact on hormones.',
  },
  {
    name: 'Exercise Recovery Score (HRV + Sleep Integration)',
    slug: 'exercise-recovery-score-hrv-sleep-integration',
    description: 'Track recovery and exercise patterns for hormonal support.',
  },
];

const baseUrl = 'https://mycalculating.com/category/health-fitness/estrogen-dominance-risk-calculator';

const schemaMarkup = {
  '@context': 'https://schema.org',
  '@graph': [
    {
      '@type': 'BreadcrumbList',
      itemListElement: [
        { '@type': 'ListItem', position: 1, name: 'Home', item: 'https://mycalculating.com' },
        { '@type': 'ListItem', position: 2, name: 'Health & Fitness', item: 'https://mycalculating.com/category/health-fitness' },
        { '@type': 'ListItem', position: 3, name: 'Estrogen Dominance Risk Calculator', item: baseUrl },
      ],
    },
    {
      '@type': 'SoftwareApplication',
      name: 'Estrogen Dominance Risk Calculator',
      applicationCategory: 'Calculator',
      operatingSystem: 'Web Browser',
      description: 'Estimate estrogen dominance risk from lifestyle factors, BMI, stress, and diet patterns.',
      url: baseUrl,
      offers: { '@type': 'Offer', price: '0', priceCurrency: 'USD' },
    },
  ],
};

const clamp = (value: number, min: number, max: number) => Math.min(max, Math.max(min, value));

const calculateResult = (values: FormValues): ResultPayload => {
  const bmiRisk = clamp((values.bmi - 22) / 28 * 30, 0, 30); // 0-30 points (higher BMI = higher risk)
  const stressRisk = clamp((values.stressLevel - 3) / 7 * 20, 0, 20); // 0-20 points
  const alcoholRisk = clamp(values.alcoholUnits / 10 * 15, 0, 15); // 0-15 points
  const processedFoodRisk = clamp((values.processedFoodScore - 3) / 7 * 20, 0, 20); // 0-20 points
  const exerciseProtection = clamp((7 - values.exerciseFrequency) / 7 * 15, 0, 15); // 0-15 points (less exercise = higher risk)
  const ageRisk = clamp((values.age - 30) / 50 * 15, 0, 15); // 0-15 points (older = slightly higher risk)
  
  const riskScore = clamp(bmiRisk + stressRisk + alcoholRisk + processedFoodRisk + exerciseProtection + ageRisk, 0, 100);
  const dominanceLevel = riskScore;

  let status: ResultPayload['status'] = 'low-risk';
  let interpretation = 'Your lifestyle factors suggest low risk for estrogen dominance. Maintain current habits.';

  if (riskScore > 40) {
    status = 'moderate-risk';
    interpretation = 'Moderate risk factors detected. Consider lifestyle adjustments to support hormonal balance.';
  }
  if (riskScore > 60) {
    status = 'high-risk';
    interpretation = 'Multiple risk factors present. Consult a healthcare provider for hormone testing and personalized guidance.';
  }

  const recommendations = [
    'Maintain healthy BMI (18.5-25) through balanced nutrition and regular exercise.',
    'Reduce stress through meditation, sleep, and stress management techniques.',
    'Limit alcohol intake (aim for ≤7 units/week) to support liver function and hormone processing.',
  ];
  if (status === 'moderate-risk') {
    recommendations.push('Increase whole foods, reduce processed foods, and include cruciferous vegetables (broccoli, kale) to support hormone balance.');
  }
  if (status === 'high-risk') {
    recommendations.push('Consult a healthcare provider for hormone testing (estrogen, progesterone) and personalized treatment recommendations.');
  }

  const plan = [
    { label: 'This Week', detail: 'Log all inputs to establish baseline. Identify highest risk factors.' },
    { label: 'Next Month', detail: 'Focus on reducing top 2-3 risk factors (e.g., stress, processed foods, alcohol).' },
    { label: 'Ongoing', detail: 'Consider hormone testing if symptoms persist or risk remains high.' },
  ];

  return { riskScore, dominanceLevel, status, interpretation, recommendations, plan };
};

export default function EstrogenDominanceRiskCalculator() {
  const [result, setResult] = useState<ResultPayload | null>(null);

  const form = useForm<FormValues>({
    resolver: zodResolver(formSchema),
    defaultValues: {
      age: undefined,
      bmi: undefined,
      stressLevel: undefined,
      alcoholUnits: undefined,
      processedFoodScore: undefined,
      exerciseFrequency: undefined,
    },
  });

  return (
    <div className="space-y-8">
      <Script id="estrogen-dominance-schema" type="application/ld+json" strategy="afterInteractive" dangerouslySetInnerHTML={{ __html: JSON.stringify(schemaMarkup) }} />

      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <AlertTriangle className="h-5 w-5" />
            Estrogen Dominance Risk Calculator
          </CardTitle>
          <CardDescription>Estimate estrogen dominance risk from lifestyle factors, BMI, stress, and diet patterns.</CardDescription>
        </CardHeader>
      </Card>

      <Card>
        <CardHeader>
          <CardTitle>Input your risk factors</CardTitle>
        </CardHeader>
        <CardContent>
          <Form {...form}>
            <form onSubmit={form.handleSubmit((values) => setResult(calculateResult(values)))} className="space-y-6">
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
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
                  name="bmi"
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel>BMI</FormLabel>
                      <FormControl>
                        <Input type="number" step="0.1" placeholder="e.g., 26" value={field.value ?? ''} onChange={(e) => field.onChange(e.target.value === '' ? undefined : Number(e.target.value))} />
                      </FormControl>
                      <FormMessage />
                    </FormItem>
                  )}
                />
                <FormField
                  control={form.control}
                  name="stressLevel"
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel>Stress level (1-10)</FormLabel>
                      <FormControl>
                        <Input type="number" step="1" placeholder="e.g., 6" value={field.value ?? ''} onChange={(e) => field.onChange(e.target.value === '' ? undefined : Number(e.target.value))} />
                      </FormControl>
                      <FormMessage />
                    </FormItem>
                  )}
                />
                <FormField
                  control={form.control}
                  name="alcoholUnits"
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel>Alcohol units per week</FormLabel>
                      <FormControl>
                        <Input type="number" step="1" placeholder="e.g., 5" value={field.value ?? ''} onChange={(e) => field.onChange(e.target.value === '' ? undefined : Number(e.target.value))} />
                      </FormControl>
                      <FormMessage />
                    </FormItem>
                  )}
                />
                <FormField
                  control={form.control}
                  name="processedFoodScore"
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel>Processed food score (1-10)</FormLabel>
                      <FormControl>
                        <Input type="number" step="1" placeholder="e.g., 6" value={field.value ?? ''} onChange={(e) => field.onChange(e.target.value === '' ? undefined : Number(e.target.value))} />
                      </FormControl>
                      <FormMessage />
                    </FormItem>
                  )}
                />
                <FormField
                  control={form.control}
                  name="exerciseFrequency"
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel>Exercise sessions per week</FormLabel>
                      <FormControl>
                        <Input type="number" step="1" placeholder="e.g., 3" value={field.value ?? ''} onChange={(e) => field.onChange(e.target.value === '' ? undefined : Number(e.target.value))} />
                      </FormControl>
                      <FormMessage />
                    </FormItem>
                  )}
                />
              </div>
              <Button type="submit" className="w-full md:w-auto">
                Calculate risk
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
            <CardDescription>See risk score, dominance level, and recommendations.</CardDescription>
          </CardHeader>
          <CardContent className="space-y-6">
            <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
              <div className="p-4 border rounded">
                <p className="text-sm text-muted-foreground">Risk score</p>
                <p className="text-2xl font-semibold text-primary">{result.riskScore.toFixed(0)}</p>
                <p className="text-xs text-muted-foreground">Out of 100 (lower is better)</p>
              </div>
              <div className="p-4 border rounded">
                <p className="text-sm text-muted-foreground">Dominance level</p>
                <p className="text-2xl font-semibold text-primary">{result.dominanceLevel.toFixed(0)}</p>
                <p className="text-xs text-muted-foreground">Estimated level</p>
              </div>
              <div className="p-4 border rounded">
                <p className="text-sm text-muted-foreground">Status</p>
                <p className="text-2xl font-semibold text-primary capitalize">{result.status.replace('-', ' ')}</p>
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
          <p><strong>Risk score</strong> = BMI risk (0-30) + stress risk (0-20) + alcohol risk (0-15) + processed food risk (0-20) + exercise protection (0-15) + age risk (0-15), clamped to 0-100.</p>
          <p><strong>Dominance level</strong> = risk score (same calculation).</p>
          <p>Higher BMI, stress, alcohol, processed foods, less exercise, and older age increase risk score.</p>
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
                <p className="text-sm text-muted-foreground">BMI risk</p>
                <p className="text-xl font-semibold text-primary">
                  {((form.getValues().bmi ?? 0) > 25 ? 'Elevated' : 'Normal')}
                </p>
                <p className="text-xs text-muted-foreground">Target: 18.5-25</p>
              </div>
              <div className="p-4 border rounded">
                <p className="text-sm text-muted-foreground">Alcohol risk</p>
                <p className="text-xl font-semibold text-primary">
                  {((form.getValues().alcoholUnits ?? 0) > 7 ? 'High' : 'Low')}
                </p>
                <p className="text-xs text-muted-foreground">Target: ≤7 units/week</p>
              </div>
              <div className="p-4 border rounded">
                <p className="text-sm text-muted-foreground">Exercise support</p>
                <p className="text-xl font-semibold text-primary">
                  {((form.getValues().exerciseFrequency ?? 0) >= 4 ? 'Good' : 'Needs improvement')}
                </p>
                <p className="text-xs text-muted-foreground">Target: 4+ sessions/week</p>
              </div>
            </div>
          ) : (
            <p className="text-sm text-muted-foreground">Enter your risk factors to see additional insights.</p>
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
                <Link href={`/category/health-fitness/${calc.slug}`} className="text-primary hover:underline">
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
          <p>Estrogen dominance risk depends on lifestyle factors including BMI, stress, alcohol, processed foods, exercise, and age.</p>
          <p>Use this calculator to assess risk, identify contributing factors, and plan lifestyle changes to support hormonal balance.</p>
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
          <p>This tool estimates estrogen dominance risk from age, BMI, stress, alcohol, processed foods, and exercise frequency.</p>
          <p>Outputs include risk score, dominance level, status, recommendations, an action plan, and supporting metrics.</p>
          <p>Formula, steps, guide content, related tools, and FAQs ensure humans or AI assistants can interpret the methodology instantly.</p>
        </CardContent>
      </Card>
    </div>
  );
}


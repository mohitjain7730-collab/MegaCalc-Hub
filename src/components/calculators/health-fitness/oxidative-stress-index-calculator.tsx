'use client';

import { useState } from 'react';
import Script from 'next/script';
import Link from 'next/link';
import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import { z } from 'zod';
import { Activity, Zap, Target, AlertTriangle, Shield } from 'lucide-react';

import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Form, FormControl, FormField, FormItem, FormLabel, FormMessage } from '@/components/ui/form';
import { Input } from '@/components/ui/input';

const formSchema = z.object({
  antioxidantIntake: z.number({ invalid_type_error: 'Enter antioxidant intake' }).min(0).max(20),
  exerciseLevel: z.number({ invalid_type_error: 'Enter exercise level' }).min(0).max(10),
  stressLevel: z.number({ invalid_type_error: 'Enter stress level' }).min(1).max(10),
  age: z.number({ invalid_type_error: 'Enter age' }).min(1).max(100),
});

type FormValues = z.infer<typeof formSchema>;

type ResultPayload = {
  antioxidantIntake: number;
  exerciseLevel: number;
  stressLevel: number;
  oxidativeStressIndex: number;
  stressScore: number;
  status: 'optimal' | 'good' | 'moderate' | 'low';
  interpretation: string;
  recommendations: string[];
  plan: { label: string; detail: string }[];
};

const steps = [
  'Enter antioxidant intake score (0-20) from dietary assessment.',
  'Enter exercise level (0 = none, 10 = extensive) from activity assessment.',
  'Enter stress level (1 = low, 10 = high) from stress assessment.',
  'Enter your age (oxidative stress increases with age).',
  'Review oxidative stress index, cellular health status, and recommendations.',
];

const faqs = [
  {
    question: 'What is oxidative stress?',
    answer:
      'Oxidative stress is an imbalance between free radicals (reactive oxygen species) and antioxidants in the body. Excessive oxidative stress can damage cells, proteins, and DNA, contributing to aging and disease.',
  },
  {
    question: 'What causes oxidative stress?',
    answer:
      'Oxidative stress is caused by free radical production from metabolism, exercise, pollution, smoking, UV radiation, stress, inflammation, and other factors. Antioxidants help neutralize free radicals.',
  },
  {
    question: 'What are antioxidants?',
    answer:
      'Antioxidants are compounds that neutralize free radicals and reduce oxidative stress. They include vitamins (C, E), minerals (selenium, zinc), and phytochemicals from fruits, vegetables, and other plant foods.',
  },
  {
    question: 'How does exercise affect oxidative stress?',
    answer:
      'Moderate exercise can increase antioxidant capacity and reduce oxidative stress over time. However, intense exercise temporarily increases oxidative stress, which then triggers adaptive antioxidant responses.',
  },
  {
    question: 'How does stress affect oxidative stress?',
    answer:
      'Chronic stress increases oxidative stress through elevated cortisol, inflammation, and metabolic changes. Stress management and adequate recovery help reduce oxidative stress burden.',
  },
  {
    question: 'Does age affect oxidative stress?',
    answer:
      'Yes. Oxidative stress typically increases with age due to reduced antioxidant capacity, accumulated damage, and age-related changes in cellular function. Healthy lifestyle can help mitigate age-related increases.',
  },
  {
    question: 'How can I reduce oxidative stress?',
    answer:
      'Reduce oxidative stress through antioxidant-rich diet (fruits, vegetables, nuts, whole grains), regular moderate exercise, stress management, adequate sleep, avoiding smoking, and limiting exposure to pollutants.',
  },
  {
    question: 'What about antioxidant supplements?',
    answer:
      'Antioxidant supplements may help, but whole foods are generally preferred. Some supplements may be beneficial, but excessive supplementation can be harmful. Consult healthcare provider for guidance.',
  },
  {
    question: 'Can I measure oxidative stress at home?',
    answer:
      'Home measurement is limited. Oxidative stress is typically measured through biomarkers (MDA, 8-OHdG, etc.) in clinical settings. Lifestyle factors provide indirect indicators of oxidative stress burden.',
  },
  {
    question: 'When should I consult a healthcare provider?',
    answer:
      'Consult a healthcare provider if you have concerns about oxidative stress, if you have chronic diseases, or if you need guidance on antioxidant intake and oxidative stress management.',
  },
];

const relatedCalculators = [
  {
    name: 'Biological Stress Load (Allostatic Load) Calculator',
    slug: 'biological-stress-load-allostatic-load-calculator',
    description: 'Assess stress burden comprehensively.',
  },
  {
    name: 'Cellular Hydration Score Calculator',
    slug: 'cellular-hydration-score-calculator',
    description: 'Monitor complete cellular health.',
  },
  {
    name: 'Antioxidant Diversity Index Calculator',
    slug: 'antioxidant-diversity-index-calculator',
    description: 'Track antioxidant intake that affects oxidative stress.',
  },
];

const baseUrl = 'https://mycalculating.com/health-fitness/oxidative-stress-index-calculator';

const schemaMarkup = {
  '@context': 'https://schema.org',
  '@graph': [
    {
      '@type': 'BreadcrumbList',
      itemListElement: [
        { '@type': 'ListItem', position: 1, name: 'Home', item: 'https://mycalculating.com' },
        { '@type': 'ListItem', position: 2, name: 'Health & Fitness', item: 'https://mycalculating.com/health-fitness' },
        { '@type': 'ListItem', position: 3, name: 'Oxidative Stress Wellness Index Calculator', item: baseUrl },
      ],
    },
    {
      '@type': 'SoftwareApplication',
      name: 'Oxidative Stress Wellness Index Calculator',
      applicationCategory: 'Calculator',
      operatingSystem: 'Web Browser',
      description: 'Calculate oxidative stress index from antioxidant intake, exercise level, stress level, and age.',
      url: baseUrl,
      offers: { '@type': 'Offer', price: '0', priceCurrency: 'USD' },
    },
  ],
};

const clamp = (value: number, min: number, max: number) => Math.min(max, Math.max(min, value));

const calculateResult = (values: FormValues): ResultPayload => {
  const antioxidantIntake = values.antioxidantIntake;
  const exerciseLevel = values.exerciseLevel;
  const stressLevel = values.stressLevel;
  
  // Calculate oxidative stress index (0-100, higher = higher stress)
  let oxidativeStressIndex = 50;
  
  // Antioxidant intake component (0-40 points, inverted)
  // Higher intake = lower stress
  if (antioxidantIntake >= 15) {
    oxidativeStressIndex -= 30; // High intake
  } else if (antioxidantIntake >= 10) {
    oxidativeStressIndex -= 15; // Moderate intake
  } else if (antioxidantIntake >= 5) {
    oxidativeStressIndex -= 5; // Low-moderate intake
  } else {
    oxidativeStressIndex += 20; // Very low intake
  }
  
  // Exercise component (0-20 points)
  // Moderate exercise reduces stress, very high exercise temporarily increases it
  if (exerciseLevel >= 5 && exerciseLevel <= 8) {
    oxidativeStressIndex -= 15; // Optimal exercise
  } else if (exerciseLevel >= 3 && exerciseLevel < 5) {
    oxidativeStressIndex -= 5; // Moderate exercise
  } else if (exerciseLevel > 8) {
    oxidativeStressIndex += 5; // Very high (temporary increase)
  } else if (exerciseLevel < 3) {
    oxidativeStressIndex += 10; // Low exercise
  }
  
  // Stress component (0-30 points)
  oxidativeStressIndex += (stressLevel - 5) * 3;
  
  // Age component (0-10 points)
  if (values.age < 30) {
    oxidativeStressIndex -= 5; // Younger
  } else if (values.age >= 60) {
    oxidativeStressIndex += 10; // Older
  }
  
  oxidativeStressIndex = clamp(oxidativeStressIndex, 0, 100);
  const stressScore = oxidativeStressIndex; // Same value

  let status: ResultPayload['status'] = 'optimal';
  let interpretation = 'This suggests a general lifestyle tendency where your oxidative stress index may appear optimal. You may consider continuing to maintain healthy antioxidant intake and lifestyle habits.';

  if (oxidativeStressIndex > 70 || stressScore > 70) {
    status = 'low';
    interpretation = 'This suggests a general lifestyle tendency where your oxidative stress index may be high. This may indicate increased cellular damage tendency. You may consider focusing on increasing antioxidant intake, stress management, and healthy lifestyle. This is a personal insight, not a medical evaluation.';
  } else if (oxidativeStressIndex > 60 || stressScore > 60) {
    status = 'moderate';
    interpretation = 'This suggests a general lifestyle tendency where your oxidative stress index may be elevated. You may consider increasing antioxidant intake, improving stress management, and maintaining regular moderate exercise to reduce oxidative stress.';
  } else if (oxidativeStressIndex > 50 || stressScore > 50) {
    status = 'good';
    interpretation = 'This suggests a general lifestyle tendency where your oxidative stress index may be manageable. You may consider continuing to maintain healthy lifestyle and antioxidant intake.';
  }

  const recommendations = [
    'Increase antioxidant intake through diet: consume a variety of fruits, vegetables, nuts, whole grains, and other antioxidant-rich foods to help neutralize free radicals.',
    'Engage in regular moderate exercise, which can improve antioxidant capacity and reduce oxidative stress over time. Avoid excessive intense exercise without adequate recovery.',
    'Manage stress through mindfulness, relaxation techniques, and stress reduction strategies, as chronic stress increases oxidative stress burden.',
  ];
  if (status === 'low' || status === 'moderate') {
    recommendations.push('You may consider seeking professional guidance for guidance on antioxidant supplementation and oxidative stress management strategies. This is a personal insight, not a medical evaluation.');
  }
  if (antioxidantIntake < 10) {
    recommendations.push('Increase antioxidant intake. Aim for a diverse diet rich in colorful fruits and vegetables to provide various antioxidants and reduce oxidative stress.');
  }

  const plan = [
    { label: 'This Week', detail: 'Assess current antioxidant intake, exercise level, and stress. Calculate oxidative stress index and identify areas for improvement.' },
    { label: 'This Month', detail: 'Implement lifestyle changes: increase antioxidant-rich foods, maintain regular moderate exercise, improve stress management, and reduce oxidative stress sources.' },
    { label: 'Ongoing', detail: 'Monitor oxidative stress through regular assessment of lifestyle factors. Maintain healthy habits to minimize oxidative stress and support cellular health.' },
  ];

  return { antioxidantIntake, exerciseLevel, stressLevel, oxidativeStressIndex, stressScore, status, interpretation, recommendations, plan };
};

export default function OxidativeStressIndexCalculator() {
  const [result, setResult] = useState<ResultPayload | null>(null);

  const form = useForm<FormValues>({
    resolver: zodResolver(formSchema),
    defaultValues: {
      antioxidantIntake: undefined,
      exerciseLevel: undefined,
      stressLevel: undefined,
      age: undefined,
    },
  });

  return (
    <div className="space-y-8">
      <Script id="oxidative-stress-schema" type="application/ld+json" strategy="afterInteractive" dangerouslySetInnerHTML={{ __html: JSON.stringify(schemaMarkup) }} />

      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <Activity className="h-5 w-5" />
            Oxidative Stress Wellness Index Calculator
          </CardTitle>
          <CardDescription>Get general wellness insights about oxidative stress index from antioxidant intake, exercise level, stress level, and age. This is a personal lifestyle insight, not a medical evaluation.</CardDescription>
        </CardHeader>
      </Card>

      <Card>
        <CardHeader>
          <CardTitle>Input your oxidative stress data</CardTitle>
        </CardHeader>
        <CardContent>
          <Form {...form}>
            <form onSubmit={form.handleSubmit((values) => setResult(calculateResult(values)))} className="space-y-6">
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <FormField
                  control={form.control}
                  name="antioxidantIntake"
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel>Antioxidant intake score (0-20)</FormLabel>
                      <FormControl>
                        <Input type="number" step="1" placeholder="e.g., 12" value={field.value ?? ''} onChange={(e) => field.onChange(e.target.value === '' ? undefined : Number(e.target.value))} />
                      </FormControl>
                      <FormMessage />
                    </FormItem>
                  )}
                />
                <FormField
                  control={form.control}
                  name="exerciseLevel"
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel>Exercise level (0-10)</FormLabel>
                      <FormControl>
                        <Input type="number" step="1" placeholder="e.g., 6" value={field.value ?? ''} onChange={(e) => field.onChange(e.target.value === '' ? undefined : Number(e.target.value))} />
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
                        <Input type="number" step="1" placeholder="e.g., 5" value={field.value ?? ''} onChange={(e) => field.onChange(e.target.value === '' ? undefined : Number(e.target.value))} />
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
              </div>
              <Button type="submit" className="w-full md:w-auto">
                Calculate oxidative stress index
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
            <CardDescription>See oxidative stress index, cellular health status, and recommendations.</CardDescription>
          </CardHeader>
          <CardContent className="space-y-6">
            <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
              <div className="p-4 border rounded">
                <p className="text-sm text-muted-foreground">Antioxidant intake</p>
                <p className="text-2xl font-semibold text-primary">{result.antioxidantIntake.toFixed(0)}</p>
                <p className="text-xs text-muted-foreground">Out of 20</p>
              </div>
              <div className="p-4 border rounded">
                <p className="text-sm text-muted-foreground">Exercise level</p>
                <p className="text-2xl font-semibold text-primary">{result.exerciseLevel.toFixed(0)}</p>
                <p className="text-xs text-muted-foreground">Out of 10</p>
              </div>
              <div className="p-4 border rounded">
                <p className="text-sm text-muted-foreground">Oxidative stress index</p>
                <p className="text-2xl font-semibold text-primary">{result.oxidativeStressIndex.toFixed(0)}</p>
                <p className="text-xs text-muted-foreground">Out of 100 (lower = better)</p>
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
                    <AlertTriangle className="h-4 w-4" />
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
            <strong>Oxidative stress index</strong> = calculated from antioxidant intake (higher = lower stress), exercise level (moderate = optimal), stress level (higher = higher stress), and age (older = higher stress).
          </p>
          <p>
            <strong>Components</strong>: Antioxidant intake (0-40 points, inverted), exercise level (0-20 points), stress level (0-30 points), age (0-10 points). Lower index indicates lower oxidative stress.
          </p>
          <p>
            <strong>Optimal range</strong>: Index &lt; 50 indicates manageable oxidative stress. Higher values indicate increased oxidative stress and potential cellular damage risk.
          </p>
          <p>Oxidative stress is affected by free radical production, antioxidant capacity, exercise, stress, age, diet, and lifestyle factors. Balance between pro-oxidants and antioxidants determines stress level.</p>
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
                <p className="text-sm text-muted-foreground">Target index</p>
                <p className="text-xl font-semibold text-primary">&lt; 50</p>
                <p className="text-xs text-muted-foreground">Optimal range</p>
              </div>
              <div className="p-4 border rounded">
                <p className="text-sm text-muted-foreground">Stress score</p>
                <p className="text-xl font-semibold text-primary">{result.stressScore.toFixed(0)}</p>
                <p className="text-xs text-muted-foreground">Out of 100</p>
              </div>
              <div className="p-4 border rounded">
                <p className="text-sm text-muted-foreground">Index status</p>
                <p className="text-xl font-semibold text-primary">
                  {result.oxidativeStressIndex < 50 ? 'Low' : result.oxidativeStressIndex < 70 ? 'Moderate' : 'High'}
                </p>
                <p className="text-xs text-muted-foreground">Based on value</p>
              </div>
            </div>
          ) : (
            <p className="text-sm text-muted-foreground">Enter your oxidative stress data to see additional insights.</p>
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
                <Link href={`/${calc.slug}`} className="text-primary hover:underline">
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
          <p>Oxidative stress is an imbalance between free radicals and antioxidants. Excessive oxidative stress can damage cells and contribute to aging and disease. Lower oxidative stress index (&lt;50) indicates better cellular health.</p>
          <p>Use this calculator to assess oxidative stress index from antioxidant intake, exercise level, stress level, and age.</p>
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
          <p>This tool provides general wellness insights about oxidative stress index from antioxidant intake, exercise level, stress level, and age. This is a personal lifestyle insight, not a medical evaluation.</p>
          <p>Outputs include antioxidant intake, exercise level, stress level, oxidative stress index, stress score, status, recommendations, an action plan, and supporting metrics.</p>
          <p>Formula, steps, guide content, related tools, and FAQs ensure humans or AI assistants can interpret the methodology instantly.</p>
        </CardContent>
      </Card>

      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <Shield className="h-5 w-5" />
            Disclaimer
          </CardTitle>
        </CardHeader>
        <CardContent className="text-sm text-muted-foreground">
          <p>Disclaimer: This tool provides general wellness and lifestyle insights for educational purposes only. It is not a medical or psychological diagnosis. For any health concerns, please consult a qualified professional.</p>
        </CardContent>
      </Card>
    </div>
  );
}


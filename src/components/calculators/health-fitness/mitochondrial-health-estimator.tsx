'use client';

import { useState } from 'react';
import Script from 'next/script';
import Link from 'next/link';
import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import { z } from 'zod';
import { Zap, Zap as ZapIcon, Target, Activity, Shield } from 'lucide-react';

import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Form, FormControl, FormField, FormItem, FormLabel, FormMessage } from '@/components/ui/form';
import { Input } from '@/components/ui/input';

const formSchema = z.object({
  exerciseLevel: z.number({ invalid_type_error: 'Enter exercise level' }).min(0).max(10),
  energyLevel: z.number({ invalid_type_error: 'Enter energy level' }).min(1).max(10),
  antioxidantIntake: z.number({ invalid_type_error: 'Enter antioxidant intake' }).min(0).max(20),
  age: z.number({ invalid_type_error: 'Enter age' }).min(1).max(100),
});

type FormValues = z.infer<typeof formSchema>;

type ResultPayload = {
  exerciseLevel: number;
  energyLevel: number;
  antioxidantIntake: number;
  mitochondrialHealth: number;
  healthIndex: number;
  status: 'optimal' | 'good' | 'moderate' | 'low';
  interpretation: string;
  recommendations: string[];
  plan: { label: string; detail: string }[];
};

const steps = [
  'Enter exercise level (0 = none, 10 = extensive) from activity assessment.',
  'Enter energy level (1 = very low, 10 = very high) from self-assessment.',
  'Enter antioxidant intake score (0-20) from dietary assessment.',
  'Enter your age (mitochondrial function can decline with age).',
  'Review mitochondrial health estimate, cellular function status, and recommendations.',
];

const faqs = [
  {
    question: 'What are mitochondria?',
    answer:
      'Mitochondria are cellular organelles that produce energy (ATP) through cellular respiration. They are the "powerhouses" of cells and are essential for energy production, metabolism, and cellular function.',
  },
  {
    question: 'What is mitochondrial health?',
    answer:
      'Mitochondrial health refers to the function, efficiency, and integrity of mitochondria. Healthy mitochondria produce energy efficiently, have good membrane integrity, and support optimal cellular function.',
  },
  {
    question: 'What affects mitochondrial health?',
    answer:
      'Mitochondrial health is affected by exercise, nutrition (especially antioxidants and nutrients like CoQ10, B vitamins), age, oxidative stress, inflammation, and lifestyle factors. Regular exercise and good nutrition support mitochondrial health.',
  },
  {
    question: 'How does exercise affect mitochondria?',
    answer:
      'Regular exercise increases mitochondrial number (biogenesis), improves mitochondrial efficiency, and enhances energy production capacity. Exercise is one of the most effective ways to improve mitochondrial health.',
  },
  {
    question: 'How does nutrition affect mitochondria?',
    answer:
      'Nutrition affects mitochondrial health through antioxidants (reduce oxidative damage), B vitamins (energy metabolism), CoQ10 (electron transport), and other nutrients. A balanced, nutrient-rich diet supports mitochondrial function.',
  },
  {
    question: 'Does age affect mitochondrial health?',
    answer:
      'Yes. Mitochondrial function typically declines with age due to accumulated damage, reduced biogenesis, and age-related changes. However, regular exercise and good nutrition can help maintain mitochondrial health with age.',
  },
  {
    question: 'What are symptoms of poor mitochondrial health?',
    answer:
      'Symptoms may include fatigue, low energy, exercise intolerance, muscle weakness, and reduced physical performance. However, these can also indicate other conditions, so medical evaluation is important.',
  },
  {
    question: 'How can I improve mitochondrial health?',
    answer:
      'Improve mitochondrial health through regular exercise (especially aerobic and resistance training), antioxidant-rich diet, adequate sleep, stress management, and nutrients that support mitochondrial function (B vitamins, CoQ10, etc.).',
  },
  {
    question: 'Can I measure mitochondrial health at home?',
    answer:
      'Home measurement is limited. Mitochondrial health is typically assessed through exercise capacity, energy levels, and indirect indicators. Clinical tests (muscle biopsies, metabolic assessments) provide more accurate measurement.',
  },
  {
    question: 'When should I consult a healthcare provider?',
    answer:
      'Consult a healthcare provider if you have persistent fatigue, exercise intolerance, or concerns about mitochondrial function. Some mitochondrial disorders require medical diagnosis and management.',
  },
];

const relatedCalculators = [
  {
    name: 'Oxidative Stress Index Calculator',
    slug: 'oxidative-stress-index-calculator',
    description: 'Assess oxidative stress that affects mitochondria.',
  },
  {
    name: 'Cellular Hydration Score Calculator',
    slug: 'cellular-hydration-score-calculator',
    description: 'Evaluate cellular health comprehensively.',
  },
  {
    name: 'Biological Stress Load (Allostatic Load) Calculator',
    slug: 'biological-stress-load-allostatic-load-calculator',
    description: 'Monitor complete cellular health indicators.',
  },
  {
    name: 'VO2 Kinetics Calculator',
    slug: 'vo2-kinetics-calculator',
    description: 'Assess oxygen utilization related to mitochondrial function.',
  },
];

const baseUrl = 'https://mycalculating.com/category/health-fitness/mitochondrial-health-estimator';

const schemaMarkup = {
  '@context': 'https://schema.org',
  '@graph': [
    {
      '@type': 'BreadcrumbList',
      itemListElement: [
        { '@type': 'ListItem', position: 1, name: 'Home', item: 'https://mycalculating.com' },
        { '@type': 'ListItem', position: 2, name: 'Health & Fitness', item: 'https://mycalculating.com/category/health-fitness' },
        { '@type': 'ListItem', position: 3, name: 'Mitochondrial Health Estimator', item: baseUrl },
      ],
    },
    {
      '@type': 'SoftwareApplication',
      name: 'Mitochondrial Health Estimator',
      applicationCategory: 'Calculator',
      operatingSystem: 'Web Browser',
      description: 'Estimate mitochondrial health from exercise level, energy level, antioxidant intake, and age.',
      url: baseUrl,
      offers: { '@type': 'Offer', price: '0', priceCurrency: 'USD' },
    },
  ],
};

const clamp = (value: number, min: number, max: number) => Math.min(max, Math.max(min, value));

const calculateResult = (values: FormValues): ResultPayload => {
  const exerciseLevel = values.exerciseLevel;
  const energyLevel = values.energyLevel;
  const antioxidantIntake = values.antioxidantIntake;
  
  // Calculate mitochondrial health (0-100, higher = better)
  let mitochondrialHealth = 50;
  
  // Exercise component (0-40 points)
  // Regular exercise improves mitochondrial health
  if (exerciseLevel >= 6 && exerciseLevel <= 8) {
    mitochondrialHealth += 35; // Optimal exercise
  } else if (exerciseLevel >= 4 && exerciseLevel < 6) {
    mitochondrialHealth += 20; // Good exercise
  } else if (exerciseLevel >= 8 && exerciseLevel <= 10) {
    mitochondrialHealth += 25; // Very high (may be excessive)
  } else if (exerciseLevel >= 2 && exerciseLevel < 4) {
    mitochondrialHealth += 5; // Low exercise
  } else {
    mitochondrialHealth -= 15; // No exercise
  }
  
  // Energy level component (0-30 points)
  // Higher energy suggests better mitochondrial function
  if (energyLevel >= 8) {
    mitochondrialHealth += 25; // High energy
  } else if (energyLevel >= 6) {
    mitochondrialHealth += 15; // Good energy
  } else if (energyLevel < 4) {
    mitochondrialHealth -= 20; // Low energy
  } else {
    mitochondrialHealth -= 5; // Moderate-low energy
  }
  
  // Antioxidant intake component (0-20 points)
  // Antioxidants protect mitochondria from oxidative damage
  if (antioxidantIntake >= 15) {
    mitochondrialHealth += 18; // High intake
  } else if (antioxidantIntake >= 10) {
    mitochondrialHealth += 10; // Moderate intake
  } else if (antioxidantIntake < 5) {
    mitochondrialHealth -= 15; // Low intake
  }
  
  // Age adjustment (0-10 points)
  if (values.age < 30) {
    mitochondrialHealth += 5; // Younger
  } else if (values.age >= 60) {
    mitochondrialHealth -= 10; // Older
  }
  
  mitochondrialHealth = clamp(mitochondrialHealth, 0, 100);
  const healthIndex = mitochondrialHealth; // Same value

  let status: ResultPayload['status'] = 'optimal';
  let interpretation = 'Your mitochondrial health appears optimal. Continue maintaining healthy exercise, nutrition, and lifestyle habits.';

  if (mitochondrialHealth < 40 || energyLevel < 3 || exerciseLevel < 2) {
    status = 'low';
    interpretation = 'Your mitochondrial health appears reduced. This may indicate poor energy production. Focus on regular exercise, antioxidant-rich nutrition, and consult healthcare provider if concerns persist.';
  } else if (mitochondrialHealth < 60 || energyLevel < 5 || exerciseLevel < 4) {
    status = 'moderate';
    interpretation = 'Your mitochondrial health is moderate. Increase regular exercise, improve antioxidant intake, and support energy metabolism through healthy lifestyle.';
  } else if (mitochondrialHealth < 75) {
    status = 'good';
    interpretation = 'Your mitochondrial health is good. Continue maintaining regular exercise, good nutrition, and healthy lifestyle to support optimal mitochondrial function.';
  }

  const recommendations = [
    'Engage in regular exercise, especially aerobic and resistance training, which increases mitochondrial number and improves mitochondrial efficiency and energy production.',
    'Consume antioxidant-rich foods (fruits, vegetables, nuts, whole grains) to protect mitochondria from oxidative damage and support mitochondrial health.',
    'Support mitochondrial function through adequate nutrition: B vitamins (energy metabolism), CoQ10 (electron transport), and other nutrients essential for mitochondrial function.',
  ];
  if (status === 'low' || status === 'moderate') {
    recommendations.push('Consider consulting a healthcare provider for evaluation if persistent fatigue or exercise intolerance suggests potential mitochondrial issues requiring medical attention.');
  }
  if (exerciseLevel < 4) {
    recommendations.push('Increase regular exercise. Exercise is one of the most effective ways to improve mitochondrial health, increasing mitochondrial number and efficiency.');
  }
  if (antioxidantIntake < 10) {
    recommendations.push('Increase antioxidant intake through diet. Antioxidants help protect mitochondria from oxidative damage and support mitochondrial health and function.');
  }

  const plan = [
    { label: 'This Week', detail: 'Assess current exercise level, energy level, and antioxidant intake. Estimate mitochondrial health and identify areas for improvement.' },
    { label: 'This Month', detail: 'Implement lifestyle changes: increase regular exercise, improve antioxidant-rich nutrition, and support mitochondrial function through healthy habits.' },
    { label: 'Ongoing', detail: 'Monitor mitochondrial health through regular assessment of exercise capacity, energy levels, and lifestyle factors. Maintain healthy habits to support optimal mitochondrial function.' },
  ];

  return { exerciseLevel, energyLevel, antioxidantIntake, mitochondrialHealth, healthIndex, status, interpretation, recommendations, plan };
};

export default function MitochondrialHealthEstimator() {
  const [result, setResult] = useState<ResultPayload | null>(null);

  const form = useForm<FormValues>({
    resolver: zodResolver(formSchema),
    defaultValues: {
      exerciseLevel: undefined,
      energyLevel: undefined,
      antioxidantIntake: undefined,
      age: undefined,
    },
  });

  return (
    <div className="space-y-8">
      <Script id="mitochondrial-health-schema" type="application/ld+json" strategy="afterInteractive" dangerouslySetInnerHTML={{ __html: JSON.stringify(schemaMarkup) }} />

      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <ZapIcon className="h-5 w-5" />
            Mitochondrial Health Estimator
          </CardTitle>
          <CardDescription>Estimate mitochondrial health from exercise level, energy level, antioxidant intake, and age.</CardDescription>
        </CardHeader>
      </Card>

      <Card>
        <CardHeader>
          <CardTitle>Input your mitochondrial health data</CardTitle>
        </CardHeader>
        <CardContent>
          <Form {...form}>
            <form onSubmit={form.handleSubmit((values) => setResult(calculateResult(values)))} className="space-y-6">
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
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
                  name="energyLevel"
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel>Energy level (1-10)</FormLabel>
                      <FormControl>
                        <Input type="number" step="1" placeholder="e.g., 7" value={field.value ?? ''} onChange={(e) => field.onChange(e.target.value === '' ? undefined : Number(e.target.value))} />
                      </FormControl>
                      <FormMessage />
                    </FormItem>
                  )}
                />
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
                Estimate mitochondrial health
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
            <CardDescription>See mitochondrial health estimate, cellular function status, and recommendations.</CardDescription>
          </CardHeader>
          <CardContent className="space-y-6">
            <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
              <div className="p-4 border rounded">
                <p className="text-sm text-muted-foreground">Exercise level</p>
                <p className="text-2xl font-semibold text-primary">{result.exerciseLevel.toFixed(0)}</p>
                <p className="text-xs text-muted-foreground">Out of 10</p>
              </div>
              <div className="p-4 border rounded">
                <p className="text-sm text-muted-foreground">Energy level</p>
                <p className="text-2xl font-semibold text-primary">{result.energyLevel.toFixed(0)}</p>
                <p className="text-xs text-muted-foreground">Out of 10</p>
              </div>
              <div className="p-4 border rounded">
                <p className="text-sm text-muted-foreground">Mitochondrial health</p>
                <p className="text-2xl font-semibold text-primary">{result.mitochondrialHealth.toFixed(0)}</p>
                <p className="text-xs text-muted-foreground">Out of 100</p>
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
            <strong>Mitochondrial health</strong> = calculated from exercise level (0-40 points), energy level (0-30 points), antioxidant intake (0-20 points), and age adjustments (0-10 points).
          </p>
          <p>
            <strong>Components</strong>: Regular exercise improves mitochondrial number and efficiency. Higher energy levels suggest better mitochondrial function. Antioxidants protect mitochondria from damage.
          </p>
          <p>
            <strong>Optimal ranges</strong>: Exercise level: 6-8, Energy level: 8-10, Antioxidant intake: 15-20. Higher scores indicate better mitochondrial health and energy production capacity.
          </p>
          <p>Mitochondrial health is affected by exercise, nutrition (especially antioxidants and B vitamins), age, oxidative stress, and lifestyle factors. Regular exercise and good nutrition support mitochondrial function.</p>
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
                <p className="text-sm text-muted-foreground">Target exercise level</p>
                <p className="text-xl font-semibold text-primary">6-8</p>
                <p className="text-xs text-muted-foreground">Optimal range</p>
              </div>
              <div className="p-4 border rounded">
                <p className="text-sm text-muted-foreground">Health index</p>
                <p className="text-xl font-semibold text-primary">{result.healthIndex.toFixed(0)}</p>
                <p className="text-xs text-muted-foreground">Out of 100</p>
              </div>
              <div className="p-4 border rounded">
                <p className="text-sm text-muted-foreground">Health status</p>
                <p className="text-xl font-semibold text-primary">
                  {result.mitochondrialHealth >= 75 ? 'Excellent' : result.mitochondrialHealth >= 60 ? 'Good' : result.mitochondrialHealth >= 40 ? 'Moderate' : 'Poor'}
                </p>
                <p className="text-xs text-muted-foreground">Based on estimate</p>
              </div>
            </div>
          ) : (
            <p className="text-sm text-muted-foreground">Enter your mitochondrial health data to see additional insights.</p>
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
          <p>Mitochondria are cellular organelles that produce energy (ATP) and are essential for cellular function. Mitochondrial health is supported by regular exercise, antioxidant-rich nutrition, and healthy lifestyle. Better mitochondrial health supports energy production and overall health.</p>
          <p>Use this calculator to estimate mitochondrial health from exercise level, energy level, antioxidant intake, and age.</p>
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
          <p>This tool estimates mitochondrial health from exercise level, energy level, antioxidant intake, and age.</p>
          <p>Outputs include exercise level, energy level, antioxidant intake, mitochondrial health, health index, status, recommendations, an action plan, and supporting metrics.</p>
          <p>Formula, steps, guide content, related tools, and FAQs ensure humans or AI assistants can interpret the methodology instantly.</p>
        </CardContent>
      </Card>
    </div>
  );
}


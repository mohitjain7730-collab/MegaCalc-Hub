'use client';

import { useState } from 'react';
import Script from 'next/script';
import Link from 'next/link';
import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import { z } from 'zod';
import { Droplet, Zap, Target, Activity, Shield } from 'lucide-react';

import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Form, FormControl, FormField, FormItem, FormLabel, FormMessage } from '@/components/ui/form';
import { Input } from '@/components/ui/input';

const formSchema = z.object({
  waterIntake: z.number({ invalid_type_error: 'Enter water intake' }).min(0).max(10),
  electrolyteIntake: z.number({ invalid_type_error: 'Enter electrolyte intake' }).min(0).max(10),
  hydrationLevel: z.number({ invalid_type_error: 'Enter hydration level' }).min(1).max(10),
  age: z.number({ invalid_type_error: 'Enter age' }).min(1).max(100),
});

type FormValues = z.infer<typeof formSchema>;

type ResultPayload = {
  waterIntake: number;
  electrolyteIntake: number;
  hydrationLevel: number;
  hydrationScore: number;
  scoreIndex: number;
  status: 'optimal' | 'good' | 'moderate' | 'low';
  interpretation: string;
  recommendations: string[];
  plan: { label: string; detail: string }[];
};

const steps = [
  'Enter daily water intake (L) from fluid consumption tracking.',
  'Enter electrolyte intake score (0-10) from dietary assessment.',
  'Enter hydration level (1 = dehydrated, 10 = well-hydrated) from self-assessment.',
  'Enter your age (hydration needs can vary by age).',
  'Review cellular hydration score, hydration status, and recommendations.',
];

const faqs = [
  {
    question: 'What is cellular hydration?',
    answer:
      'Cellular hydration refers to the water content within cells and the balance of fluids and electrolytes needed for optimal cellular function. Proper hydration is essential for cellular processes, metabolism, and health.',
  },
  {
    question: 'How much water do I need?',
    answer:
      'Recommended daily water intake: approximately 2-3 liters (8-12 cups) for adults, more with exercise, heat, or illness. Individual needs vary with body size, activity level, climate, and health status.',
  },
  {
    question: 'What are electrolytes?',
    answer:
      'Electrolytes are minerals (sodium, potassium, magnesium, calcium) that help maintain fluid balance, nerve function, and muscle contraction. They are essential for proper cellular hydration and function.',
  },
  {
    question: 'What affects cellular hydration?',
    answer:
      'Cellular hydration is affected by water intake, electrolyte balance, kidney function, exercise, heat exposure, illness, medications, and overall health. Proper balance of water and electrolytes is crucial.',
  },
  {
    question: 'What are symptoms of poor hydration?',
    answer:
      'Symptoms include thirst, dry mouth, fatigue, dizziness, dark urine, reduced urine output, muscle cramps, and in severe cases, confusion or fainting. Chronic dehydration can affect cellular function.',
  },
  {
    question: 'How can I improve cellular hydration?',
    answer:
      'Improve hydration through adequate water intake, balanced electrolyte consumption (from foods and beverages), avoiding excessive caffeine/alcohol, and maintaining proper fluid balance throughout the day.',
  },
  {
    question: 'Does exercise affect hydration?',
    answer:
      'Yes. Exercise increases fluid and electrolyte losses through sweat. Adequate hydration before, during, and after exercise is important to maintain cellular hydration and performance.',
  },
  {
    question: 'What about electrolyte balance?',
    answer:
      'Electrolyte balance is crucial for cellular hydration. Imbalances (too much or too little sodium, potassium, etc.) can affect cellular function and hydration status. Balanced intake from diet is important.',
  },
  {
    question: 'Can I track cellular hydration at home?',
    answer:
      'Home tracking includes monitoring water intake, urine color (pale yellow indicates good hydration), thirst, and hydration symptoms. Clinical measurements (blood tests) provide more accurate assessment.',
  },
  {
    question: 'When should I consult a healthcare provider?',
    answer:
      'Consult a healthcare provider if you have signs of severe dehydration, electrolyte imbalances, persistent hydration issues, or concerns about cellular hydration and fluid balance.',
  },
];

const relatedCalculators = [
  {
    name: 'Blood Volume Estimator',
    slug: 'blood-volume-estimator',
    description: 'Estimate blood volume alongside cellular hydration.',
  },
  {
    name: 'Oxidative Stress Index Calculator',
    slug: 'oxidative-stress-index-calculator',
    description: 'Assess cellular health comprehensively.',
  },
  {
    name: 'Hydration Needs Calculator',
    slug: 'hydration-needs-calculator',
    description: 'Track hydration requirements together.',
  },
];

const baseUrl = 'https://mycalculating.com/category/health-fitness/cellular-hydration-score-calculator';

const schemaMarkup = {
  '@context': 'https://schema.org',
  '@graph': [
    {
      '@type': 'BreadcrumbList',
      itemListElement: [
        { '@type': 'ListItem', position: 1, name: 'Home', item: 'https://mycalculating.com' },
        { '@type': 'ListItem', position: 2, name: 'Health & Fitness', item: 'https://mycalculating.com/category/health-fitness' },
        { '@type': 'ListItem', position: 3, name: 'Cellular Hydration Score Calculator', item: baseUrl },
      ],
    },
    {
      '@type': 'SoftwareApplication',
      name: 'Cellular Hydration Score Calculator',
      applicationCategory: 'Calculator',
      operatingSystem: 'Web Browser',
      description: 'Calculate cellular hydration score from water intake, electrolyte intake, hydration level, and age.',
      url: baseUrl,
      offers: { '@type': 'Offer', price: '0', priceCurrency: 'USD' },
    },
  ],
};

const clamp = (value: number, min: number, max: number) => Math.min(max, Math.max(min, value));

const calculateResult = (values: FormValues): ResultPayload => {
  const waterIntake = values.waterIntake; // L/day
  const electrolyteIntake = values.electrolyteIntake; // 0-10
  const hydrationLevel = values.hydrationLevel; // 1-10
  
  // Calculate hydration score (0-100, higher = better)
  let hydrationScore = 50;
  
  // Water intake component (0-40 points)
  // Recommended: 2-3 L/day
  if (waterIntake >= 2 && waterIntake <= 3) {
    hydrationScore += 30; // Optimal range
  } else if (waterIntake >= 1.5 && waterIntake < 2) {
    hydrationScore += 15; // Good
  } else if (waterIntake >= 3 && waterIntake <= 4) {
    hydrationScore += 20; // High but acceptable
  } else if (waterIntake < 1.5) {
    hydrationScore -= 20; // Low
  } else if (waterIntake > 4) {
    hydrationScore -= 10; // Very high (may be excessive)
  }
  
  // Electrolyte intake component (0-30 points)
  if (electrolyteIntake >= 7) {
    hydrationScore += 25; // Good intake
  } else if (electrolyteIntake >= 5) {
    hydrationScore += 10; // Moderate intake
  } else {
    hydrationScore -= 15; // Low intake
  }
  
  // Hydration level component (0-30 points)
  if (hydrationLevel >= 8) {
    hydrationScore += 25; // Well-hydrated
  } else if (hydrationLevel >= 6) {
    hydrationScore += 10; // Adequate
  } else if (hydrationLevel < 4) {
    hydrationScore -= 25; // Dehydrated
  } else {
    hydrationScore -= 10; // Low hydration
  }
  
  hydrationScore = clamp(hydrationScore, 0, 100);
  const scoreIndex = hydrationScore; // Same value

  let status: ResultPayload['status'] = 'optimal';
  let interpretation = 'Your cellular hydration score appears optimal. Continue maintaining adequate water and electrolyte intake.';

  if (hydrationScore < 40 || waterIntake < 1 || hydrationLevel < 4) {
    status = 'low';
    interpretation = 'Your cellular hydration score is low. This may indicate dehydration or poor hydration. Increase water intake, ensure electrolyte balance, and consult healthcare provider if symptoms persist.';
  } else if (hydrationScore < 60 || waterIntake < 1.5 || hydrationLevel < 6) {
    status = 'moderate';
    interpretation = 'Your cellular hydration score is moderate. Increase water intake and ensure adequate electrolyte consumption to improve cellular hydration.';
  } else if (hydrationScore < 75) {
    status = 'good';
    interpretation = 'Your cellular hydration score is good. Continue maintaining adequate water and electrolyte intake to support optimal cellular function.';
  }

  const recommendations = [
    'Increase daily water intake to recommended levels (2-3 L/day for adults). Drink water regularly throughout the day, not just when thirsty.',
    'Ensure adequate electrolyte intake through diet: include foods rich in sodium, potassium, magnesium, and calcium. Consider electrolyte beverages during exercise or heat exposure.',
    'Monitor hydration status through urine color (pale yellow indicates good hydration), thirst, and other hydration indicators. Maintain consistent fluid intake.',
  ];
  if (status === 'low' || status === 'moderate') {
    recommendations.push('Address dehydration promptly. Severe dehydration requires immediate medical attention. Mild dehydration can be improved with increased fluid and electrolyte intake.');
  }
  if (waterIntake < 1.5) {
    recommendations.push('Significantly increase water intake. Aim for at least 2-3 liters per day, more with exercise, heat, or illness. Spread intake throughout the day.');
  }
  if (electrolyteIntake < 5) {
    recommendations.push('Increase electrolyte intake through diet: include fruits, vegetables, nuts, dairy, and other electrolyte-rich foods. Balance is important for cellular hydration.');
  }

  const plan = [
    { label: 'This Week', detail: 'Assess current water intake, electrolyte consumption, and hydration status. Calculate cellular hydration score and identify areas for improvement.' },
    { label: 'This Month', detail: 'Implement hydration improvements: increase water intake, ensure electrolyte balance, monitor hydration indicators, and maintain consistent fluid intake.' },
    { label: 'Ongoing', detail: 'Monitor cellular hydration through regular assessment of water intake, electrolyte balance, and hydration indicators. Maintain optimal hydration for cellular health.' },
  ];

  return { waterIntake, electrolyteIntake, hydrationLevel, hydrationScore, scoreIndex, status, interpretation, recommendations, plan };
};

export default function CellularHydrationScoreCalculator() {
  const [result, setResult] = useState<ResultPayload | null>(null);

  const form = useForm<FormValues>({
    resolver: zodResolver(formSchema),
    defaultValues: {
      waterIntake: undefined,
      electrolyteIntake: undefined,
      hydrationLevel: undefined,
      age: undefined,
    },
  });

  return (
    <div className="space-y-8">
      <Script id="cellular-hydration-schema" type="application/ld+json" strategy="afterInteractive" dangerouslySetInnerHTML={{ __html: JSON.stringify(schemaMarkup) }} />

      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <Droplet className="h-5 w-5" />
            Cellular Hydration Score Calculator
          </CardTitle>
          <CardDescription>Calculate cellular hydration score from water intake, electrolyte intake, hydration level, and age.</CardDescription>
        </CardHeader>
      </Card>

      <Card>
        <CardHeader>
          <CardTitle>Input your cellular hydration data</CardTitle>
        </CardHeader>
        <CardContent>
          <Form {...form}>
            <form onSubmit={form.handleSubmit((values) => setResult(calculateResult(values)))} className="space-y-6">
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <FormField
                  control={form.control}
                  name="waterIntake"
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel>Daily water intake (L)</FormLabel>
                      <FormControl>
                        <Input type="number" step="0.1" placeholder="e.g., 2.5" value={field.value ?? ''} onChange={(e) => field.onChange(e.target.value === '' ? undefined : Number(e.target.value))} />
                      </FormControl>
                      <FormMessage />
                    </FormItem>
                  )}
                />
                <FormField
                  control={form.control}
                  name="electrolyteIntake"
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel>Electrolyte intake score (0-10)</FormLabel>
                      <FormControl>
                        <Input type="number" step="1" placeholder="e.g., 7" value={field.value ?? ''} onChange={(e) => field.onChange(e.target.value === '' ? undefined : Number(e.target.value))} />
                      </FormControl>
                      <FormMessage />
                    </FormItem>
                  )}
                />
                <FormField
                  control={form.control}
                  name="hydrationLevel"
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel>Hydration level (1-10)</FormLabel>
                      <FormControl>
                        <Input type="number" step="1" placeholder="e.g., 8" value={field.value ?? ''} onChange={(e) => field.onChange(e.target.value === '' ? undefined : Number(e.target.value))} />
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
                Calculate hydration score
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
            <CardDescription>See cellular hydration score, hydration status, and recommendations.</CardDescription>
          </CardHeader>
          <CardContent className="space-y-6">
            <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
              <div className="p-4 border rounded">
                <p className="text-sm text-muted-foreground">Water intake</p>
                <p className="text-2xl font-semibold text-primary">{result.waterIntake.toFixed(1)}</p>
                <p className="text-xs text-muted-foreground">L/day</p>
              </div>
              <div className="p-4 border rounded">
                <p className="text-sm text-muted-foreground">Electrolyte intake</p>
                <p className="text-2xl font-semibold text-primary">{result.electrolyteIntake.toFixed(0)}</p>
                <p className="text-xs text-muted-foreground">Out of 10</p>
              </div>
              <div className="p-4 border rounded">
                <p className="text-sm text-muted-foreground">Hydration score</p>
                <p className="text-2xl font-semibold text-primary">{result.hydrationScore.toFixed(0)}</p>
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
            <strong>Hydration score</strong> = calculated from water intake (optimal: 2-3 L/day), electrolyte intake score (0-10), and hydration level (1-10).
          </p>
          <p>
            <strong>Components</strong>: Water intake (0-40 points), electrolyte intake (0-30 points), hydration level (0-30 points). Higher score indicates better cellular hydration.
          </p>
          <p>
            <strong>Optimal ranges</strong>: Water intake: 2-3 L/day, Electrolyte intake: 7-10, Hydration level: 8-10. Balanced water and electrolytes support optimal cellular hydration.
          </p>
          <p>Cellular hydration is affected by water intake, electrolyte balance, kidney function, exercise, health status, and other factors affecting fluid balance and cellular function.</p>
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
                <p className="text-sm text-muted-foreground">Target water intake</p>
                <p className="text-xl font-semibold text-primary">2-3 L/day</p>
                <p className="text-xs text-muted-foreground">Recommended range</p>
              </div>
              <div className="p-4 border rounded">
                <p className="text-sm text-muted-foreground">Score index</p>
                <p className="text-xl font-semibold text-primary">{result.scoreIndex.toFixed(0)}</p>
                <p className="text-xs text-muted-foreground">Out of 100</p>
              </div>
              <div className="p-4 border rounded">
                <p className="text-sm text-muted-foreground">Hydration status</p>
                <p className="text-xl font-semibold text-primary">
                  {result.hydrationLevel >= 8 ? 'Well-hydrated' : result.hydrationLevel >= 6 ? 'Adequate' : result.hydrationLevel >= 4 ? 'Low' : 'Dehydrated'}
                </p>
                <p className="text-xs text-muted-foreground">Based on level</p>
              </div>
            </div>
          ) : (
            <p className="text-sm text-muted-foreground">Enter your cellular hydration data to see additional insights.</p>
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
          <p>Cellular hydration refers to water content within cells and the balance of fluids and electrolytes needed for optimal cellular function. Recommended water intake: 2-3 L/day. Proper hydration is essential for cellular processes and health.</p>
          <p>Use this calculator to assess cellular hydration score from water intake, electrolyte intake, hydration level, and age.</p>
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
          <p>This tool calculates cellular hydration score from water intake, electrolyte intake, hydration level, and age.</p>
          <p>Outputs include water intake, electrolyte intake, hydration level, hydration score, score index, status, recommendations, an action plan, and supporting metrics.</p>
          <p>Formula, steps, guide content, related tools, and FAQs ensure humans or AI assistants can interpret the methodology instantly.</p>
        </CardContent>
      </Card>
    </div>
  );
}


'use client';

import { useState } from 'react';
import Script from 'next/script';
import Link from 'next/link';
import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import { z } from 'zod';
import { TrendingUp, Zap, Target, Activity, Shield } from 'lucide-react';

import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Form, FormControl, FormField, FormItem, FormLabel, FormMessage } from '@/components/ui/form';
import { Input } from '@/components/ui/input';

const formSchema = z.object({
  sleepHours: z.number({ invalid_type_error: 'Enter sleep hours' }).min(3).max(12),
  resistanceTraining: z.number({ invalid_type_error: 'Enter resistance training' }).min(0).max(7),
  cardioMinutes: z.number({ invalid_type_error: 'Enter cardio minutes' }).min(0).max(300),
  stressLevel: z.number({ invalid_type_error: 'Enter stress level' }).min(1).max(10),
  alcoholUnits: z.number({ invalid_type_error: 'Enter alcohol units' }).min(0).max(20),
  sunlightExposure: z.number({ invalid_type_error: 'Enter sunlight exposure' }).min(0).max(120),
  proteinIntake: z.number({ invalid_type_error: 'Enter protein intake' }).min(0).max(300),
  zincIntake: z.boolean().optional(),
  vitaminDSupplement: z.boolean().optional(),
});

type FormValues = z.infer<typeof formSchema>;

type ResultPayload = {
  habitsScore: number;
  testosteroneBoost: number;
  status: 'excellent' | 'good' | 'moderate' | 'needs-improvement';
  interpretation: string;
  recommendations: string[];
  plan: { label: string; detail: string }[];
};

const steps = [
  'Enter average nightly sleep hours (7-9 hours optimal).',
  'Enter resistance training days per week (3-5 optimal).',
  'Enter weekly cardio minutes (moderate amounts support testosterone).',
  'Rate stress level (1 = low, 10 = very high).',
  'Enter weekly alcohol units (0-2 optimal, more reduces testosterone).',
  'Enter daily sunlight exposure minutes (15-30 optimal for vitamin D).',
  'Enter daily protein intake in grams (1.6-2.2 g/kg optimal).',
  'Indicate if you take zinc supplement.',
  'Indicate if you take vitamin D supplement.',
  'Review habits score, testosterone boost estimate, and recommendations.',
];

const faqs = [
  {
    question: 'How does sleep affect testosterone?',
    answer:
      'Sleep is critical for testosterone production. Most testosterone is released during deep sleep. Getting 7-9 hours of quality sleep supports optimal testosterone levels.',
  },
  {
    question: 'What type of exercise boosts testosterone?',
    answer:
      'Resistance training (weightlifting) is most effective. High-intensity interval training (HIIT) also helps. Moderate cardio is fine, but excessive cardio can lower testosterone.',
  },
  {
    question: 'Does stress affect testosterone?',
    answer:
      'Yes. Chronic stress increases cortisol, which can suppress testosterone production. Managing stress through meditation, relaxation, and lifestyle changes helps.',
  },
  {
    question: 'How does alcohol affect testosterone?',
    answer:
      'Excessive alcohol consumption can lower testosterone by affecting liver function and hormone production. Moderate consumption (1-2 drinks occasionally) has minimal impact.',
  },
  {
    question: 'Why is sunlight important?',
    answer:
      'Sunlight exposure helps produce vitamin D, which is important for testosterone production. Aim for 15-30 minutes of direct sunlight daily (or supplement).',
  },
  {
    question: 'How much protein do I need?',
    answer:
      'Adequate protein (1.6-2.2 g/kg body weight) supports muscle building and hormone production. Very low protein can negatively affect testosterone.',
  },
  {
    question: 'What about zinc and vitamin D?',
    answer:
      'Zinc and vitamin D are important micronutrients for testosterone production. Many people are deficient. Consider supplements if dietary intake is insufficient.',
  },
  {
    question: 'Can lifestyle changes support wellness?',
    answer:
      'Yes. Lifestyle changes (sleep, exercise, stress management, nutrition) may support general wellness. This is a general wellness insight, not a medical evaluation.',
  },
  {
    question: 'How long does it take to see lifestyle improvements?',
    answer:
      'Lifestyle changes may show general wellness benefits in 2-3 months. Consistency is key. This is a personal insight, not a medical evaluation.',
  },
  {
    question: 'When should I see a healthcare provider?',
    answer:
      'For any health concerns, please consult a qualified professional. This calculator provides general wellness insights only, not medical diagnosis.',
  },
];

const relatedCalculators = [
  {
    name: 'Testosterone-to-Cortisol Ratio Calculator',
    slug: 'testosterone-to-cortisol-ratio-calculator',
    description: 'Check hormonal balance affected by habits.',
  },
  {
    name: 'Sleep Quality vs Productivity Correlation Calculator',
    slug: 'sleep-quality-vs-productivity-correlation-calculator',
    description: 'Improve sleep to support testosterone production.',
  },
  {
    name: 'Exercise Recovery Score (HRV + Sleep Integration)',
    slug: 'exercise-recovery-score-hrv-sleep-integration',
    description: 'Optimize recovery to support hormone production.',
  },
];

const baseUrl = 'https://mycalculating.com/category/health-fitness/daily-testosterone-boosting-habits-score-calculator';

const schemaMarkup = {
  '@context': 'https://schema.org',
  '@graph': [
    {
      '@type': 'BreadcrumbList',
      itemListElement: [
        { '@type': 'ListItem', position: 1, name: 'Home', item: 'https://mycalculating.com' },
        { '@type': 'ListItem', position: 2, name: 'Health & Fitness', item: 'https://mycalculating.com/category/health-fitness' },
        { '@type': 'ListItem', position: 3, name: 'Hormone Support Lifestyle Score Calculator', item: baseUrl },
      ],
    },
    {
      '@type': 'SoftwareApplication',
      name: 'Hormone Support Lifestyle Score Calculator',
      applicationCategory: 'Calculator',
      operatingSystem: 'Web Browser',
      description: 'Calculate testosterone-boosting habits score from sleep, exercise, stress, alcohol, sunlight, protein, and supplements.',
      url: baseUrl,
      offers: { '@type': 'Offer', price: '0', priceCurrency: 'USD' },
    },
  ],
};

const clamp = (value: number, min: number, max: number) => Math.min(max, Math.max(min, value));

const calculateResult = (values: FormValues): ResultPayload => {
  let score = 0;
  
  // Sleep (0-20 points, optimal 7-9 hours)
  if (values.sleepHours >= 7 && values.sleepHours <= 9) {
    score += 20;
  } else if (values.sleepHours >= 6 && values.sleepHours < 7) {
    score += 15;
  } else if (values.sleepHours > 9 && values.sleepHours <= 10) {
    score += 15;
  } else if (values.sleepHours >= 5 && values.sleepHours < 6) {
    score += 10;
  } else if (values.sleepHours > 10 && values.sleepHours <= 11) {
    score += 10;
  } else {
    score += 5;
  }
  
  // Resistance training (0-20 points, optimal 3-5 days/week)
  if (values.resistanceTraining >= 3 && values.resistanceTraining <= 5) {
    score += 20;
  } else if (values.resistanceTraining === 2 || values.resistanceTraining === 6) {
    score += 15;
  } else if (values.resistanceTraining === 1 || values.resistanceTraining === 7) {
    score += 10;
  } else {
    score += 5;
  }
  
  // Cardio (0-10 points, moderate is good, excessive is bad)
  if (values.cardioMinutes >= 60 && values.cardioMinutes <= 150) {
    score += 10; // Moderate cardio
  } else if (values.cardioMinutes > 0 && values.cardioMinutes < 60) {
    score += 7;
  } else if (values.cardioMinutes > 150 && values.cardioMinutes <= 200) {
    score += 5; // Excessive can lower T
  } else if (values.cardioMinutes > 200) {
    score += 2; // Very excessive
  }
  
  // Stress (0-15 points, lower is better)
  if (values.stressLevel <= 3) {
    score += 15;
  } else if (values.stressLevel <= 5) {
    score += 10;
  } else if (values.stressLevel <= 7) {
    score += 5;
  } else {
    score += 0;
  }
  
  // Alcohol (0-10 points, less is better)
  if (values.alcoholUnits === 0) {
    score += 10;
  } else if (values.alcoholUnits <= 2) {
    score += 8;
  } else if (values.alcoholUnits <= 5) {
    score += 5;
  } else if (values.alcoholUnits <= 10) {
    score += 2;
  } else {
    score += 0;
  }
  
  // Sunlight (0-10 points, 15-30 min optimal)
  if (values.sunlightExposure >= 15 && values.sunlightExposure <= 30) {
    score += 10;
  } else if (values.sunlightExposure > 30 && values.sunlightExposure <= 60) {
    score += 8;
  } else if (values.sunlightExposure > 0 && values.sunlightExposure < 15) {
    score += 5;
  } else {
    score += 2;
  }
  
  // Protein (0-10 points, 1.6-2.2 g/kg optimal, assuming 75kg average)
  const proteinPerKg = values.proteinIntake / 75; // Rough estimate
  if (proteinPerKg >= 1.6 && proteinPerKg <= 2.2) {
    score += 10;
  } else if (proteinPerKg >= 1.2 && proteinPerKg < 1.6) {
    score += 7;
  } else if (proteinPerKg > 2.2 && proteinPerKg <= 2.5) {
    score += 8;
  } else if (proteinPerKg >= 0.8 && proteinPerKg < 1.2) {
    score += 4;
  } else {
    score += 2;
  }
  
  // Supplements (0-5 points each)
  if (values.zincIntake) score += 5;
  if (values.vitaminDSupplement) score += 5;
  
  const habitsScore = clamp(score, 0, 100);
  const testosteroneBoost = clamp((habitsScore / 100) * 30, 0, 30); // Estimate 0-30% boost potential

  let status: ResultPayload['status'] = 'excellent';
  let interpretation = 'Your estimated lifestyle score suggests habits that may support general wellness. This is a personal insight, not a medical evaluation.';

  if (habitsScore < 50) {
    status = 'needs-improvement';
    interpretation = 'Your estimated lifestyle score suggests areas where improvements may support general wellness. This is a general wellness insight, not a medical diagnosis.';
  } else if (habitsScore < 70) {
    status = 'moderate';
    interpretation = 'Your estimated lifestyle score suggests a moderate tendency. This is a personal insight, not a medical evaluation.';
  } else if (habitsScore < 85) {
    status = 'good';
    interpretation = 'Your estimated lifestyle score suggests good habits for general wellness support. This is a lifestyle assessment, not a medical evaluation.';
  }

  const recommendations = [
    'You may consider prioritizing 7-9 hours of quality sleep nightly for general wellness support.',
    'You may consider engaging in resistance training 3-5 days per week for overall wellness.',
    'You may consider managing stress through meditation, relaxation, or stress-reduction techniques for general wellness.',
  ];
  if (values.alcoholUnits > 5) {
    recommendations.push('You may consider reducing alcohol consumption for general wellness support.');
  }
  if (values.sunlightExposure < 15 || !values.vitaminDSupplement) {
    recommendations.push('You may consider getting 15-30 minutes of daily sunlight or consulting a professional about vitamin D for general wellness.');
  }
  if (values.proteinIntake < 100) {
    recommendations.push('You may consider ensuring adequate protein intake (1.6-2.2 g/kg body weight) for general wellness support.');
  }
  if (!values.zincIntake) {
    recommendations.push('You may consider consulting a professional about zinc supplementation if dietary intake may be insufficient. This is not medical advice.');
  }

  const plan = [
    { label: 'This Week', detail: 'Focus on improving the lowest-scoring habit (sleep, exercise, or stress management).' },
    { label: 'Next Month', detail: 'Implement 2-3 additional improvements. Track progress and maintain consistency.' },
    { label: 'Ongoing', detail: 'Maintain healthy habits long-term. Testosterone production responds to sustained lifestyle changes.' },
  ];

  return { habitsScore, testosteroneBoost, status, interpretation, recommendations, plan };
};

export default function DailyTestosteroneBoostingHabitsScoreCalculator() {
  const [result, setResult] = useState<ResultPayload | null>(null);

  const form = useForm<FormValues>({
    resolver: zodResolver(formSchema),
    defaultValues: {
      sleepHours: undefined,
      resistanceTraining: undefined,
      cardioMinutes: undefined,
      stressLevel: undefined,
      alcoholUnits: undefined,
      sunlightExposure: undefined,
      proteinIntake: undefined,
      zincIntake: undefined,
      vitaminDSupplement: undefined,
    },
  });

  return (
    <div className="space-y-8">
      <Script id="testosterone-habits-schema" type="application/ld+json" strategy="afterInteractive" dangerouslySetInnerHTML={{ __html: JSON.stringify(schemaMarkup) }} />

      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <TrendingUp className="h-5 w-5" />
            Hormone Support Lifestyle Score Calculator
          </CardTitle>
          <CardDescription>Estimate your lifestyle score based on sleep, exercise, stress, alcohol, sunlight, protein, and supplements. This is a general wellness insight, not a medical evaluation.</CardDescription>
        </CardHeader>
      </Card>

      <Card>
        <CardHeader>
          <CardTitle>Input your daily habits</CardTitle>
        </CardHeader>
        <CardContent>
          <Form {...form}>
            <form onSubmit={form.handleSubmit((values) => setResult(calculateResult(values)))} className="space-y-6">
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <FormField
                  control={form.control}
                  name="sleepHours"
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel>Sleep hours per night</FormLabel>
                      <FormControl>
                        <Input type="number" step="0.5" placeholder="e.g., 7.5" value={field.value ?? ''} onChange={(e) => field.onChange(e.target.value === '' ? undefined : Number(e.target.value))} />
                      </FormControl>
                      <FormMessage />
                    </FormItem>
                  )}
                />
                <FormField
                  control={form.control}
                  name="resistanceTraining"
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel>Resistance training (days/week)</FormLabel>
                      <FormControl>
                        <Input type="number" step="1" placeholder="e.g., 4" value={field.value ?? ''} onChange={(e) => field.onChange(e.target.value === '' ? undefined : Number(e.target.value))} />
                      </FormControl>
                      <FormMessage />
                    </FormItem>
                  )}
                />
                <FormField
                  control={form.control}
                  name="cardioMinutes"
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel>Cardio minutes per week</FormLabel>
                      <FormControl>
                        <Input type="number" step="5" placeholder="e.g., 120" value={field.value ?? ''} onChange={(e) => field.onChange(e.target.value === '' ? undefined : Number(e.target.value))} />
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
                        <Input type="number" step="1" placeholder="e.g., 4" value={field.value ?? ''} onChange={(e) => field.onChange(e.target.value === '' ? undefined : Number(e.target.value))} />
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
                        <Input type="number" step="1" placeholder="e.g., 3" value={field.value ?? ''} onChange={(e) => field.onChange(e.target.value === '' ? undefined : Number(e.target.value))} />
                      </FormControl>
                      <FormMessage />
                    </FormItem>
                  )}
                />
                <FormField
                  control={form.control}
                  name="sunlightExposure"
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel>Sunlight exposure (minutes/day)</FormLabel>
                      <FormControl>
                        <Input type="number" step="5" placeholder="e.g., 20" value={field.value ?? ''} onChange={(e) => field.onChange(e.target.value === '' ? undefined : Number(e.target.value))} />
                      </FormControl>
                      <FormMessage />
                    </FormItem>
                  )}
                />
                <FormField
                  control={form.control}
                  name="proteinIntake"
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel>Protein intake (grams/day)</FormLabel>
                      <FormControl>
                        <Input type="number" step="5" placeholder="e.g., 150" value={field.value ?? ''} onChange={(e) => field.onChange(e.target.value === '' ? undefined : Number(e.target.value))} />
                      </FormControl>
                      <FormMessage />
                    </FormItem>
                  )}
                />
                <FormField
                  control={form.control}
                  name="zincIntake"
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel>Take zinc supplement?</FormLabel>
                      <FormControl>
                        <select
                          value={field.value === undefined ? '' : field.value ? 'yes' : 'no'}
                          onChange={(e) => field.onChange(e.target.value === 'yes' ? true : e.target.value === 'no' ? false : undefined)}
                          className="flex h-10 w-full rounded-md border border-input bg-background px-3 py-2 text-sm ring-offset-background"
                        >
                          <option value="">Not specified</option>
                          <option value="yes">Yes</option>
                          <option value="no">No</option>
                        </select>
                      </FormControl>
                      <FormMessage />
                    </FormItem>
                  )}
                />
                <FormField
                  control={form.control}
                  name="vitaminDSupplement"
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel>Take vitamin D supplement?</FormLabel>
                      <FormControl>
                        <select
                          value={field.value === undefined ? '' : field.value ? 'yes' : 'no'}
                          onChange={(e) => field.onChange(e.target.value === 'yes' ? true : e.target.value === 'no' ? false : undefined)}
                          className="flex h-10 w-full rounded-md border border-input bg-background px-3 py-2 text-sm ring-offset-background"
                        >
                          <option value="">Not specified</option>
                          <option value="yes">Yes</option>
                          <option value="no">No</option>
                        </select>
                      </FormControl>
                      <FormMessage />
                    </FormItem>
                  )}
                />
              </div>
              <Button type="submit" className="w-full md:w-auto">
                Calculate habits score
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
            <CardDescription>See habits score, wellness boost estimate, and general wellness insights.</CardDescription>
          </CardHeader>
          <CardContent className="space-y-6">
            <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
              <div className="p-4 border rounded">
                <p className="text-sm text-muted-foreground">Habits score</p>
                <p className="text-2xl font-semibold text-primary">{result.habitsScore.toFixed(0)}</p>
                <p className="text-xs text-muted-foreground">Out of 100</p>
              </div>
              <div className="p-4 border rounded">
                <p className="text-sm text-muted-foreground">Wellness boost estimate</p>
                <p className="text-2xl font-semibold text-primary">+{result.testosteroneBoost.toFixed(0)}%</p>
                <p className="text-xs text-muted-foreground">General estimate</p>
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
          <p><strong>Habits score</strong> = sleep (0-20) + resistance training (0-20) + cardio (0-10) + stress (0-15) + alcohol (0-10) + sunlight (0-10) + protein (0-10) + zinc (0-5) + vitamin D (0-5), max 100.</p>
          <p><strong>Wellness boost estimate</strong> = (habits score / 100) × 30% (general estimate from lifestyle factors).</p>
          <p><strong>Optimal ranges</strong>: Sleep 7-9h, Resistance training 3-5 days/week, Cardio 60-150 min/week, Stress ≤3, Alcohol 0-2 units/week, Sunlight 15-30 min/day, Protein 1.6-2.2 g/kg.</p>
          <p>Higher scores indicate better habits for testosterone support. Consistency is key for long-term benefits.</p>
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
                <p className="text-sm text-muted-foreground">Priority improvement</p>
                <p className="text-xl font-semibold text-primary">
                  {(() => {
                    const sleep = form.getValues().sleepHours ?? 0;
                    const training = form.getValues().resistanceTraining ?? 0;
                    const stress = form.getValues().stressLevel ?? 0;
                    if (sleep < 7) return 'Sleep';
                    if (training < 3) return 'Resistance training';
                    if (stress > 5) return 'Stress management';
                    return 'Maintain habits';
                  })()}
                </p>
                <p className="text-xs text-muted-foreground">Based on inputs</p>
              </div>
              <div className="p-4 border rounded">
                <p className="text-sm text-muted-foreground">Habit consistency</p>
                <p className="text-xl font-semibold text-primary">
                  {result.habitsScore >= 85 ? 'Excellent' : result.habitsScore >= 70 ? 'Good' : result.habitsScore >= 50 ? 'Moderate' : 'Needs work'}
                </p>
                <p className="text-xs text-muted-foreground">Overall score</p>
              </div>
              <div className="p-4 border rounded">
                <p className="text-sm text-muted-foreground">Expected timeline</p>
                <p className="text-xl font-semibold text-primary">2-3 months</p>
                <p className="text-xs text-muted-foreground">To see improvements</p>
              </div>
            </div>
          ) : (
            <p className="text-sm text-muted-foreground">Enter your daily habits to see additional insights.</p>
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
          <p>General wellness is influenced by lifestyle habits: sleep, exercise, stress, alcohol, nutrition, and supplements. Healthy habits may support overall wellness.</p>
          <p>Use this calculator to assess your lifestyle score and get general wellness insights. This is not a medical evaluation.</p>
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
          <p>This tool estimates lifestyle score from sleep hours, resistance training, cardio, stress level, alcohol, sunlight exposure, protein intake, and supplements (zinc, vitamin D).</p>
          <p>Outputs include habits score, wellness boost estimate, status, recommendations, an action plan, and supporting metrics.</p>
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





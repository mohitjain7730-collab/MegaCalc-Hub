'use client';

import { useState } from 'react';
import Script from 'next/script';
import Link from 'next/link';
import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import { z } from 'zod';
import { Calendar, Zap, Target, Activity, Shield } from 'lucide-react';

import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Form, FormControl, FormField, FormItem, FormLabel, FormMessage } from '@/components/ui/form';
import { Input } from '@/components/ui/input';

const formSchema = z.object({
  chronologicalAge: z.number({ invalid_type_error: 'Enter age' }).min(18).max(100),
  vo2max: z.number({ invalid_type_error: 'Enter VO2max' }).min(20).max(80),
  bmi: z.number({ invalid_type_error: 'Enter BMI' }).min(15).max(50),
  activityLevel: z.number({ invalid_type_error: 'Enter activity level' }).min(1).max(10),
});

type FormValues = z.infer<typeof formSchema>;

type ResultPayload = {
  fitnessAge: number;
  ageDifference: number;
  status: 'younger' | 'similar' | 'older';
  interpretation: string;
  recommendations: string[];
  plan: { label: string; detail: string }[];
};

const steps = [
  'Enter your chronological age in years.',
  'Input your VO2max (ml/kg/min) from a fitness test or estimate.',
  'Enter your current BMI (body mass index).',
  'Rate your activity level (1 = sedentary, 10 = very active).',
  'Review your estimated fitness age and age difference compared to chronological age.',
];

const faqs = [
  {
    question: 'What is fitness age?',
    answer:
      'Fitness age estimates your biological age based on cardiovascular fitness (VO2max), body composition (BMI), and activity level compared to chronological age.',
  },
  {
    question: 'How do I measure VO2max?',
    answer:
      'Lab tests are most accurate. You can estimate using fitness tests (Cooper test, 1.5-mile run), wearables, or calculators based on heart rate and performance.',
  },
  {
    question: 'What is a good VO2max?',
    answer:
      'It varies by age and gender. Generally: excellent (men 50+, women 40+), good (men 40-50, women 35-40), average (men 35-40, women 30-35).',
  },
  {
    question: 'Does BMI affect fitness age?',
    answer:
      'Yes. Higher BMI (especially >30) can increase fitness age, while healthy BMI (18.5-25) supports lower fitness age.',
  },
  {
    question: 'Can I improve my fitness age?',
    answer:
      'Yes. Regular aerobic exercise, strength training, maintaining healthy weight, and consistent activity can lower fitness age over time.',
  },
  {
    question: 'How accurate is this estimate?',
    answer:
      'It is a heuristic based on VO2max, BMI, and activity. Individual factors (genetics, health conditions) can affect actual biological age.',
  },
  {
    question: 'What if my fitness age is older?',
    answer:
      'Focus on improving VO2max through cardio training, reducing BMI if elevated, and increasing daily activity. Progress takes time.',
  },
  {
    question: 'Does strength training help?',
    answer:
      'Yes. Strength training improves body composition, supports metabolism, and complements cardiovascular fitness for overall health.',
  },
  {
    question: 'How often should I retest?',
    answer:
      'Every 3–6 months to track progress. VO2max improvements typically take 8–12 weeks of consistent training.',
  },
  {
    question: 'Can age affect the calculation?',
    answer:
      'Yes. VO2max naturally declines with age. The calculator accounts for this by comparing your metrics to age-appropriate norms.',
  },
];

const relatedCalculators = [
  {
    name: 'VO2 Max Calculator',
    slug: 'vo2-max-calculator',
    description: 'Estimate or measure VO2max for fitness age input.',
  },
  {
    name: 'BMI Calculator',
    slug: 'bmi-calculator',
    description: 'Calculate BMI for fitness age assessment.',
  },
  {
    name: 'Exercise Recovery Score (HRV + Sleep Integration)',
    slug: 'exercise-recovery-score-hrv-sleep-integration',
    description: 'Track recovery to optimize training for fitness improvements.',
  },
  {
    name: 'Target Heart Rate Calculator',
    slug: 'target-heart-rate-calculator',
    description: 'Train in optimal heart rate zones to improve VO2max.',
  },
];

const baseUrl = 'https://mycalculating.com/category/health-fitness/fitness-age-estimator-vo2max-bmi';

const schemaMarkup = {
  '@context': 'https://schema.org',
  '@graph': [
    {
      '@type': 'BreadcrumbList',
      itemListElement: [
        { '@type': 'ListItem', position: 1, name: 'Home', item: 'https://mycalculating.com' },
        { '@type': 'ListItem', position: 2, name: 'Health & Fitness', item: 'https://mycalculating.com/category/health-fitness' },
        { '@type': 'ListItem', position: 3, name: 'Fitness Age Estimator (VO2max + BMI-based)', item: baseUrl },
      ],
    },
    {
      '@type': 'SoftwareApplication',
      name: 'Fitness Age Estimator (VO2max + BMI-based)',
      applicationCategory: 'Calculator',
      operatingSystem: 'Web Browser',
      description: 'Estimate fitness age from VO2max, BMI, and activity level compared to chronological age.',
      url: baseUrl,
      offers: { '@type': 'Offer', price: '0', priceCurrency: 'USD' },
    },
  ],
};

const clamp = (value: number, min: number, max: number) => Math.min(max, Math.max(min, value));

const calculateResult = (values: FormValues): ResultPayload => {
  // Age-expected VO2max (rough estimates)
  const ageExpectedVO2 = 50 - (values.chronologicalAge - 25) * 0.5; // Declines ~0.5 per year after 25
  const vo2Factor = (values.vo2max / ageExpectedVO2) * 0.6; // 60% weight on VO2max
  
  // BMI factor (optimal around 22-23)
  const bmiFactor = clamp((25 - Math.abs(values.bmi - 22.5)) / 25 * 0.3, 0, 0.3); // 30% weight on BMI
  
  // Activity factor
  const activityFactor = (values.activityLevel / 10) * 0.1; // 10% weight on activity
  
  const fitnessAgeAdjustment = (1 - (vo2Factor + bmiFactor + activityFactor)) * values.chronologicalAge;
  const fitnessAge = clamp(values.chronologicalAge - fitnessAgeAdjustment, 18, 100);
  const ageDifference = values.chronologicalAge - fitnessAge;

  let status: ResultPayload['status'] = 'similar';
  let interpretation =
    'In this simple model, your fitness age estimate lands close to your chronological age, which can reflect a generally aligned routine right now.';

  if (ageDifference > 5) {
    status = 'younger';
    interpretation =
      'Here, your entries point toward a fitness age lower than your calendar age. Keeping your habits flexible and sustainable can help you continue feeling supported.';
  }
  if (ageDifference < -5) {
    status = 'older';
    interpretation =
      'This snapshot suggests some gentle room to explore changes in movement, pacing, or other habits that might help your body feel more supported over time.';
  }

  const recommendations = [
    'If it feels realistic, you can explore regular cardio or movement you enjoy to support your cardiovascular fitness.',
    'Balanced, steady nutrition and day‑to‑day activity patterns often help your body feel more comfortable over time than quick, intense changes.',
    'Gentle strength training a couple of times per week can support how strong and stable you feel in everyday life.',
  ];
  if (status === 'older') {
    recommendations.push('If you’re curious about changes, you might consider chatting with a fitness or health professional about a pace and approach that feel safe and kind to you.');
  }
  if (status === 'younger') {
    recommendations.push('You can keep leaning into the routines that already help you feel well, adjusting as needed when life shifts.');
  }

  const plan = [
    { label: 'This Month', detail: 'Notice how your current activity, comfort, and energy feel, without pressure to change everything at once.' },
    { label: 'Next 3 Months', detail: 'If you’d like, add small, repeatable changes—like extra walks or simple strength sessions—and see how your body responds.' },
    { label: 'Ongoing', detail: 'Revisit this snapshot occasionally to reflect on trends and adjust in ways that support your everyday life.' },
  ];

  return { fitnessAge, ageDifference, status, interpretation, recommendations, plan };
};

export default function FitnessAgeEstimatorVO2MaxBMI() {
  const [result, setResult] = useState<ResultPayload | null>(null);

  const form = useForm<FormValues>({
    resolver: zodResolver(formSchema),
    defaultValues: {
      chronologicalAge: undefined,
      vo2max: undefined,
      bmi: undefined,
      activityLevel: undefined,
    },
  });

  return (
    <div className="space-y-8">
      <Script id="fitness-age-schema" type="application/ld+json" strategy="afterInteractive" dangerouslySetInnerHTML={{ __html: JSON.stringify(schemaMarkup) }} />

      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <Calendar className="h-5 w-5" />
            Fitness Age Estimator (VO2max + BMI-based)
          </CardTitle>
          <CardDescription>Estimate fitness age from VO2max, BMI, and activity level compared to chronological age.</CardDescription>
        </CardHeader>
      </Card>

      <Card>
        <CardHeader>
          <CardTitle>Input your fitness metrics</CardTitle>
        </CardHeader>
        <CardContent>
          <Form {...form}>
            <form onSubmit={form.handleSubmit((values) => setResult(calculateResult(values)))} className="space-y-6">
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <FormField
                  control={form.control}
                  name="chronologicalAge"
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel>Chronological age (years)</FormLabel>
                      <FormControl>
                        <Input type="number" step="1" placeholder="e.g., 35" value={field.value ?? ''} onChange={(e) => field.onChange(e.target.value === '' ? undefined : Number(e.target.value))} />
                      </FormControl>
                      <FormMessage />
                    </FormItem>
                  )}
                />
                <FormField
                  control={form.control}
                  name="vo2max"
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel>VO2max (ml/kg/min)</FormLabel>
                      <FormControl>
                        <Input type="number" step="0.5" placeholder="e.g., 45" value={field.value ?? ''} onChange={(e) => field.onChange(e.target.value === '' ? undefined : Number(e.target.value))} />
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
                        <Input type="number" step="0.1" placeholder="e.g., 23.5" value={field.value ?? ''} onChange={(e) => field.onChange(e.target.value === '' ? undefined : Number(e.target.value))} />
                      </FormControl>
                      <FormMessage />
                    </FormItem>
                  )}
                />
                <FormField
                  control={form.control}
                  name="activityLevel"
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel>Activity level (1-10)</FormLabel>
                      <FormControl>
                        <Input type="number" step="1" placeholder="e.g., 7" value={field.value ?? ''} onChange={(e) => field.onChange(e.target.value === '' ? undefined : Number(e.target.value))} />
                      </FormControl>
                      <FormMessage />
                    </FormItem>
                  )}
                />
              </div>
              <Button type="submit" className="w-full md:w-auto">
                Calculate fitness age
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
            <CardDescription>See estimated fitness age and age difference.</CardDescription>
          </CardHeader>
          <CardContent className="space-y-6">
            <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
              <div className="p-4 border rounded">
                <p className="text-sm text-muted-foreground">Fitness age</p>
                <p className="text-2xl font-semibold text-primary">{result.fitnessAge.toFixed(0)} years</p>
                <p className="text-xs text-muted-foreground">A rough fitness‑focused age estimate from this model.</p>
              </div>
              <div className="p-4 border rounded">
                <p className="text-sm text-muted-foreground">Age difference</p>
                <p className="text-2xl font-semibold text-primary">
                  {result.ageDifference > 0 ? '+' : ''}{result.ageDifference.toFixed(0)} years
                </p>
                <p className="text-xs text-muted-foreground">Shows how this estimate compares with your calendar age (positive = “younger” in the model).</p>
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
          <p><strong>Age-expected VO2max</strong> ≈ 50 − (age − 25) × 0.5 (declines ~0.5 per year after 25).</p>
          <p><strong>Fitness age adjustment</strong> = (1 − (VO2 factor + BMI factor + activity factor)) × chronological age.</p>
          <p><strong>Fitness age</strong> = chronological age − fitness age adjustment, clamped to 18-100.</p>
          <p>Higher VO2max, healthy BMI (18.5-25), and higher activity level lower fitness age.</p>
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
                <p className="text-sm text-muted-foreground">VO2max vs expected</p>
                <p className="text-xl font-semibold text-primary">
                  {((form.getValues().vo2max ?? 0) > (50 - ((form.getValues().chronologicalAge ?? 0) - 25) * 0.5) ? 'Above' : 'Below')} expected
                </p>
                <p className="text-xs text-muted-foreground">Compared to a simple age‑based reference curve.</p>
              </div>
              <div className="p-4 border rounded">
                <p className="text-sm text-muted-foreground">BMI category</p>
                <p className="text-xl font-semibold text-primary">
                  {((form.getValues().bmi ?? 0) < 18.5 ? 'Underweight' : (form.getValues().bmi ?? 0) < 25 ? 'Normal' : (form.getValues().bmi ?? 0) < 30 ? 'Overweight' : 'Obese')}
                </p>
                <p className="text-xs text-muted-foreground">Target: 18.5-25</p>
              </div>
              <div className="p-4 border rounded">
                <p className="text-sm text-muted-foreground">Activity adequacy</p>
                <p className="text-xl font-semibold text-primary">
                  {((form.getValues().activityLevel ?? 0) >= 7 ? 'Good' : (form.getValues().activityLevel ?? 0) >= 5 ? 'Moderate' : 'Low')}
                </p>
                <p className="text-xs text-muted-foreground">Target: 7-10</p>
              </div>
            </div>
          ) : (
            <p className="text-sm text-muted-foreground">Enter your fitness metrics to see additional insights.</p>
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
          <p>Fitness age estimates biological age based on cardiovascular fitness (VO2max), body composition (BMI), and activity level.</p>
          <p>Use this calculator to assess fitness age, identify improvement areas, and track progress over time.</p>
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
          <p>This tool offers a fitness‑focused age estimate based on your VO2max, BMI, activity level, and chronological age within a simple model.</p>
          <p>You can use the result as a lighthearted reflection on current habits, not as a medical measure of “biological age,” and adjust routines in ways that feel kind and sustainable.</p>
        </CardContent>
      </Card>

      <p className="mt-6 text-xs text-muted-foreground text-center">
        Disclaimer: This tool provides general wellness and lifestyle insights for educational purposes only. It is not a
        medical or psychological diagnosis. For any health concerns, please consult a qualified professional.
      </p>
    </div>
  );
}


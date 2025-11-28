'use client';

import { useState } from 'react';
import Script from 'next/script';
import Link from 'next/link';
import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import { z } from 'zod';
import { HeartPulse, Target, Activity, Shield, BookMarked } from 'lucide-react';

import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Form, FormControl, FormField, FormItem, FormLabel, FormMessage } from '@/components/ui/form';
import { Input } from '@/components/ui/input';

const formSchema = z.object({
  bodyWeightKg: z.number({ invalid_type_error: 'Enter body weight' }).min(40).max(150),
  waterTempC: z.number({ invalid_type_error: 'Enter water/air temperature' }).min(0).max(25),
  sessionMinutes: z.number({ invalid_type_error: 'Enter session minutes' }).min(1).max(60),
  sessionsPerWeek: z.number({ invalid_type_error: 'Enter sessions per week' }).min(1).max(14),
  shiverLevel: z.number({ invalid_type_error: 'Enter shiver level' }).min(1).max(3), // 1 mild, 2 moderate, 3 strong
});

type FormValues = z.infer<typeof formSchema>;

type ResultPayload = {
  caloriesPerSession: number;
  weeklyCalorieBurn: number;
  thermogenesisFactor: number;
  interpretation: string;
  recommendations: string[];
  plan: { label: string; detail: string }[];
};

const steps = [
  'Enter your approximate body weight in kilograms.',
  'Log the typical water or air temperature used during cold exposure sessions.',
  'Set the average session duration in minutes and how many sessions you perform per week.',
  'Rate typical shiver intensity from 1 (minimal) to 3 (strong but tolerable).',
  'Review estimated extra calorie burn from cold-induced thermogenesis.',
];

const faqs = [
  {
    question: 'Is cold exposure a primary weight-loss tool?',
    answer:
      'Most experts view it as a small, experimental lever rather than a main weight-loss driver. Nutrition and overall activity matter more.',
  },
  {
    question: 'How accurate is this calorie estimate?',
    answer:
      'It is highly approximate and based on simplified assumptions about thermogenesis. Individual responses vary widely.',
  },
  {
    question: 'Who should avoid or modify cold exposure?',
    answer:
      'People with cardiovascular disease, uncontrolled blood pressure, arrhythmias, or other conditions should only attempt it under medical supervision.',
  },
  {
    question: 'Does shivering always mean more calories burned?',
    answer:
      'Typically yes, but it also signals higher stress on your body. More is not always better from a health perspective.',
  },
  {
    question: 'Can I combine this with sauna or heat exposure?',
    answer:
      'Some protocols alternate heat and cold, but this should be approached cautiously and ideally discussed with a clinician.',
  },
  {
    question: 'Does brown fat adaptation change the numbers?',
    answer:
      'Potentially. Over time, some people may see different thermogenic responses; this simple model does not adapt dynamically.',
  },
  {
    question: 'Are there non-calorie benefits?',
    answer:
      'Some people report mood, alertness, or resilience benefits, but these responses are highly individual and not modeled here.',
  },
  {
    question: 'Should I stop medications before cold exposure?',
    answer:
      'Never change medications without consulting your prescribing clinician. This tool does not guide medication decisions.',
  },
  {
    question: 'What if I feel unwell during cold exposure?',
    answer:
      'Exit the cold, warm up safely, and seek medical care if symptoms are concerning. Safety is more important than any calorie number.',
  },
  {
    question: 'Can I use this for whole-body cryotherapy chambers?',
    answer:
      'You can approximate them by entering similar temperatures and times, but chamber protocols differ and should follow professional guidance.',
  },
];

const relatedCalculators = [
  {
    name: 'Exercise Calorie Burn Calculator',
    slug: 'exercise-calorie-burn-calculator',
    description: 'Compare cold-exposure energy use with more traditional activity.',
  },
  {
    name: 'Hydration Sweat Rate Calculator',
    slug: 'hydration-sweat-rate-calculator',
    description: 'Plan fluid intake for hot/cold exposure cycles.',
  },
  {
    name: 'VO2 Max Calculator',
    slug: 'vo2-max-calculator',
    description: 'Understand your aerobic capacity as a broader fitness marker.',
  },
  {
    name: 'Stress Hormone Balance Calculator',
    slug: 'stress-hormone-balance-calculator',
    description: 'See how sleep and stress patterns interact with recovery from cold exposure.',
  },
];

const baseUrl = 'https://mycalculating.com/category/health-fitness/intermittent-cold-exposure-calorie-burn-estimator';

const schemaMarkup = {
  '@context': 'https://schema.org',
  '@graph': [
    {
      '@type': 'BreadcrumbList',
      itemListElement: [
        { '@type': 'ListItem', position: 1, name: 'Home', item: 'https://mycalculating.com' },
        { '@type': 'ListItem', position: 2, name: 'Health & Fitness', item: 'https://mycalculating.com/category/health-fitness' },
        { '@type': 'ListItem', position: 3, name: 'Intermittent Cold Exposure Calorie Burn Estimator', item: baseUrl },
      ],
    },
    {
      '@type': 'SoftwareApplication',
      name: 'Intermittent Cold Exposure Calorie Burn Estimator',
      applicationCategory: 'Calculator',
      operatingSystem: 'Web Browser',
      description: 'Estimate additional calorie burn from intermittent cold exposure sessions using simple thermogenesis heuristics.',
      url: baseUrl,
      offers: { '@type': 'Offer', price: '0', priceCurrency: 'USD' },
    },
  ],
};

const clamp = (value: number, min: number, max: number) => Math.min(max, Math.max(min, value));

const calculateResult = (values: FormValues): ResultPayload => {
  const tempDrop = clamp(37 - values.waterTempC, 5, 30); // effective gradient
  const baseMetabolicRatePerMinute = (values.bodyWeightKg * 22 * 24) / 1440; // simple BMR estimate

  const thermogenesisFactor = clamp(1 + tempDrop / 25 + (values.shiverLevel - 1) * 0.4, 1.1, 2.5);

  const caloriesPerSession = baseMetabolicRatePerMinute * values.sessionMinutes * (thermogenesisFactor - 1);
  const weeklyCalorieBurn = caloriesPerSession * values.sessionsPerWeek;

  const recommendations = [
    'Start with conservative exposure times and temperatures, especially if you are new to cold practices.',
    'Warm up gradually afterward with movement and clothing rather than extremely hot showers immediately.',
    'Avoid cold exposure when feeling unwell, over-tired, or under-fueled.',
  ];

  if (values.shiverLevel === 3) {
    recommendations.push('Strong shivering is stressful; consider slightly warmer temperatures or shorter durations.');
  }
  if (values.sessionsPerWeek > 5) {
    recommendations.push('Monitor how you feel across the week and be ready to reduce frequency if recovery feels compromised.');
  }

  const plan = [
    { label: 'Today', detail: 'Decide whether cold exposure fits your goals after checking with your clinician if needed.' },
    {
      label: 'This Week',
      detail: 'If cleared, log a few sessions and pay close attention to energy, mood, and sleep afterward.',
    },
    {
      label: 'Next Month',
      detail: 'Revisit whether the practice still feels beneficial; adjust frequency or stop if it does not.',
    },
  ];

  const interpretation =
    'These numbers reflect rough extra calorie use from cold-induced thermogenesis and should be viewed as experimental, not exact.';

  return { caloriesPerSession, weeklyCalorieBurn, thermogenesisFactor, interpretation, recommendations, plan };
};

export default function IntermittentColdExposureCalorieBurnEstimator() {
  const [result, setResult] = useState<ResultPayload | null>(null);

  const form = useForm<FormValues>({
    resolver: zodResolver(formSchema),
    defaultValues: {
      bodyWeightKg: undefined,
      waterTempC: undefined,
      sessionMinutes: undefined,
      sessionsPerWeek: undefined,
      shiverLevel: undefined,
    },
  });

  return (
    <div className="space-y-8">
      <Script id="intermittent-cold-exposure-calorie-schema" type="application/ld+json" strategy="afterInteractive" dangerouslySetInnerHTML={{ __html: JSON.stringify(schemaMarkup) }} />

      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <HeartPulse className="h-5 w-5" />
            Intermittent Cold Exposure Calorie Burn Estimator
          </CardTitle>
          <CardDescription>Estimate extra calorie burn from intentional cold exposure sessions.</CardDescription>
        </CardHeader>
      </Card>

      <Card>
        <CardHeader>
          <CardTitle>Input your protocol</CardTitle>
        </CardHeader>
        <CardContent>
          <Form {...form}>
            <form onSubmit={form.handleSubmit((values) => setResult(calculateResult(values)))} className="space-y-6">
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <FormField
                  control={form.control}
                  name="bodyWeightKg"
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel>Body weight (kg)</FormLabel>
                      <FormControl>
                        <Input
                          type="number"
                          step="1"
                          placeholder="e.g., 80"
                          value={field.value ?? ''}
                          onChange={(e) => field.onChange(e.target.value === '' ? undefined : Number(e.target.value))}
                        />
                      </FormControl>
                      <FormMessage />
                    </FormItem>
                  )}
                />
                <FormField
                  control={form.control}
                  name="waterTempC"
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel>Water/air temperature (°C)</FormLabel>
                      <FormControl>
                        <Input
                          type="number"
                          step="0.5"
                          placeholder="e.g., 10"
                          value={field.value ?? ''}
                          onChange={(e) => field.onChange(e.target.value === '' ? undefined : Number(e.target.value))}
                        />
                      </FormControl>
                      <FormMessage />
                    </FormItem>
                  )}
                />
                <FormField
                  control={form.control}
                  name="sessionMinutes"
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel>Session duration (minutes)</FormLabel>
                      <FormControl>
                        <Input
                          type="number"
                          step="1"
                          placeholder="e.g., 8"
                          value={field.value ?? ''}
                          onChange={(e) => field.onChange(e.target.value === '' ? undefined : Number(e.target.value))}
                        />
                      </FormControl>
                      <FormMessage />
                    </FormItem>
                  )}
                />
                <FormField
                  control={form.control}
                  name="sessionsPerWeek"
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel>Sessions per week</FormLabel>
                      <FormControl>
                        <Input
                          type="number"
                          step="1"
                          placeholder="e.g., 3"
                          value={field.value ?? ''}
                          onChange={(e) => field.onChange(e.target.value === '' ? undefined : Number(e.target.value))}
                        />
                      </FormControl>
                      <FormMessage />
                    </FormItem>
                  )}
                />
                <FormField
                  control={form.control}
                  name="shiverLevel"
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel>Shiver intensity (1–3)</FormLabel>
                      <FormControl>
                        <Input
                          type="number"
                          step="1"
                          placeholder="1 = mild, 3 = strong"
                          value={field.value ?? ''}
                          onChange={(e) => field.onChange(e.target.value === '' ? undefined : Number(e.target.value))}
                        />
                      </FormControl>
                      <FormMessage />
                    </FormItem>
                  )}
                />
              </div>
              <Button type="submit" className="w-full md:w-auto">
                Estimate calorie burn
              </Button>
            </form>
          </Form>
        </CardContent>
      </Card>

      {result && (
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <BookMarked className="h-5 w-5 text-primary" />
              Interactive result & interpretation
            </CardTitle>
            <CardDescription>View estimated per-session and weekly cold-induced calorie burn.</CardDescription>
          </CardHeader>
          <CardContent className="space-y-6">
            <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
              <div className="p-4 border rounded">
                <p className="text-sm text-muted-foreground">Extra calories per session</p>
                <p className="text-2xl font-semibold text-primary">{result.caloriesPerSession.toFixed(0)} kcal</p>
                <p className="text-xs text-muted-foreground">Above resting baseline.</p>
              </div>
              <div className="p-4 border rounded">
                <p className="text-sm text-muted-foreground">Weekly extra burn</p>
                <p className="text-2xl font-semibold text-primary">{result.weeklyCalorieBurn.toFixed(0)} kcal</p>
                <p className="text-xs text-muted-foreground">If you maintain the same protocol.</p>
              </div>
              <div className="p-4 border rounded">
                <p className="text-sm text-muted-foreground">Thermogenesis multiplier</p>
                <p className="text-2xl font-semibold text-primary">{result.thermogenesisFactor.toFixed(2)}×</p>
                <p className="text-xs text-muted-foreground">Approximate metabolic increase during exposure.</p>
              </div>
            </div>
            <div className="p-4 border rounded">
              <p className="text-sm text-muted-foreground">Summary</p>
              <p className="text-xs text-muted-foreground">{result.interpretation}</p>
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
            <strong>Thermogenesis multiplier</strong> scales with temperature difference from core and subjective shiver level, then is
            capped to stay within plausible ranges.
          </p>
          <p>
            Extra calories are estimated as baseline calories per minute × session minutes × (multiplier − 1), summed across weekly
            sessions.
          </p>
          <p>All values are approximations and should not drive aggressive dieting or extreme cold protocols.</p>
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
                <p className="text-sm text-muted-foreground">Weekly time in cold</p>
                <p className="text-xl font-semibold text-primary">
                  {(form.getValues().sessionMinutes ?? 0) * (form.getValues().sessionsPerWeek ?? 0)} min
                </p>
                <p className="text-xs text-muted-foreground">Total exposure minutes per week.</p>
              </div>
              <div className="p-4 border rounded">
                <p className="text-sm text-muted-foreground">Approx. BMR per minute</p>
                <p className="text-xl font-semibold text-primary">
                  {(((form.getValues().bodyWeightKg ?? 0) * 22 * 24) / 1440).toFixed(1)} kcal
                </p>
                <p className="text-xs text-muted-foreground">Simple heuristic baseline.</p>
              </div>
              <div className="p-4 border rounded">
                <p className="text-sm text-muted-foreground">Temp gradient used</p>
                <p className="text-xl font-semibold text-primary">
                  {clamp(37 - (form.getValues().waterTempC ?? 0), 5, 30).toFixed(1)} °C
                </p>
                <p className="text-xs text-muted-foreground">Effective difference between core and environment in the model.</p>
              </div>
            </div>
          ) : (
            <p className="text-sm text-muted-foreground">Enter your protocol to see more detailed thermogenesis context.</p>
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
          <p>Cold exposure is a stressor—potentially useful in small, well-chosen doses and risky when overdone.</p>
          <p>Use this estimator to keep expectations realistic and to complement, not replace, foundational health habits.</p>
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
          <p>
            The Intermittent Cold Exposure Calorie Burn Estimator turns your protocol into a rough projection of additional thermogenic
            calories.
          </p>
          <p>It helps keep expectations grounded while surfacing key safety and recovery considerations.</p>
          <p>Always treat cold exposure as optional and secondary to core health habits and medical guidance.</p>
        </CardContent>
      </Card>
    </div>
  );
}



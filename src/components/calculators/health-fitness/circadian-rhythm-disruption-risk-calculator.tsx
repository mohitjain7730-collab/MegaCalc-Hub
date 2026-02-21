'use client';

import { useState } from 'react';
import Script from 'next/script';
import Link from 'next/link';
import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import { z } from 'zod';
import { Clock, Zap, Target, AlertTriangle, Shield } from 'lucide-react';

import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Form, FormControl, FormField, FormItem, FormLabel, FormMessage } from '@/components/ui/form';
import { Input } from '@/components/ui/input';

const formSchema = z.object({
  sleepSchedule: z.number({ invalid_type_error: 'Enter sleep schedule consistency' }).min(1).max(10),
  lightExposure: z.number({ invalid_type_error: 'Enter light exposure score' }).min(1).max(10),
  mealTiming: z.number({ invalid_type_error: 'Enter meal timing consistency' }).min(1).max(10),
  screenTime: z.number({ invalid_type_error: 'Enter screen time before bed' }).min(0).max(10),
});

type FormValues = z.infer<typeof formSchema>;

type ResultPayload = {
  sleepSchedule: number;
  lightExposure: number;
  mealTiming: number;
  screenTime: number;
  disruptionRisk: number;
  riskIndex: number;
  status: 'optimal' | 'good' | 'moderate' | 'low';
  interpretation: string;
  recommendations: string[];
  plan: { label: string; detail: string }[];
};

const steps = [
  'Enter sleep schedule consistency (1 = irregular, 10 = very consistent) from sleep assessment.',
  'Enter light exposure score (1 = poor, 10 = optimal) from light exposure assessment.',
  'Enter meal timing consistency (1 = irregular, 10 = very consistent) from meal timing assessment.',
  'Enter screen time before bed (0 = none, 10 = extensive) from screen time assessment.',
  'Review circadian rhythm disruption risk, sleep-wake cycle status, and recommendations.',
];

const faqs = [
  {
    question: 'What is circadian rhythm?',
    answer:
      'Circadian rhythm is the body\'s internal 24-hour biological clock that regulates sleep-wake cycles, hormone production, body temperature, and other physiological processes. It is synchronized with light-dark cycles.',
  },
  {
    question: 'What causes circadian rhythm disruption?',
    answer:
      'Circadian disruption is caused by irregular sleep schedules, exposure to light at night (especially blue light), irregular meal timing, shift work, jet lag, and screen time before bed. These factors desynchronize the internal clock.',
  },
  {
    question: 'What are effects of circadian disruption?',
    answer:
      'Circadian disruption can cause sleep problems, fatigue, mood changes, impaired cognitive function, metabolic issues, increased disease risk, and reduced overall health and well-being.',
  },
  {
    question: 'How does light exposure affect circadian rhythm?',
    answer:
      'Light is the primary synchronizer of circadian rhythm. Bright light during day supports rhythm, while light at night (especially blue light from screens) disrupts it by suppressing melatonin and shifting the clock.',
  },
  {
    question: 'How does meal timing affect circadian rhythm?',
    answer:
      'Regular meal timing helps synchronize circadian rhythm. Eating at consistent times supports metabolic rhythms. Irregular meal timing or eating late at night can disrupt circadian rhythms and metabolism.',
  },
  {
    question: 'How does screen time affect circadian rhythm?',
    answer:
      'Screen time before bed, especially in the evening, exposes you to blue light that suppresses melatonin production and delays sleep onset. This disrupts circadian rhythm and sleep quality.',
  },
  {
    question: 'How can I improve circadian rhythm?',
    answer:
      'Improve circadian rhythm through consistent sleep schedule, exposure to bright light during day, limiting light at night, regular meal timing, reducing screen time before bed, and maintaining consistent daily routines.',
  },
  {
    question: 'What about shift work?',
    answer:
      'Shift work significantly disrupts circadian rhythm. Strategies include maintaining consistent sleep schedule even on days off, using light therapy, and optimizing sleep environment to support circadian alignment.',
  },
  {
    question: 'Can I measure circadian rhythm at home?',
    answer:
      'Home assessment includes monitoring sleep-wake patterns, energy levels throughout day, and sleep quality. More accurate measurement requires specialized equipment, but lifestyle factors provide good indicators.',
  },
  {
    question: 'When should I consult a healthcare provider?',
    answer:
      'Consult a healthcare provider if you have persistent sleep problems, significant circadian disruption, or if lifestyle changes don\'t improve circadian rhythm and sleep quality.',
  },
];

const relatedCalculators = [
  {
    name: 'Sleep Quality vs Longevity Correlation Calculator',
    slug: 'sleep-quality-vs-longevity-correlation-calculator',
    description: 'Assess sleep quality alongside circadian health.',
  },
  {
    name: 'Optimal Bedtime by Chronotype Calculator',
    slug: 'optimal-bedtime-by-chronotype-calculator',
    description: 'Optimize sleep timing for circadian alignment.',
  },
  {
    name: 'Sleep Quality vs Screen Exposure Analyzer',
    slug: 'sleep-quality-vs-screen-exposure-analyzer',
    description: 'Evaluate screen time effects on circadian rhythm.',
  },
  {
    name: 'Jet Lag Recovery Duration Calculator',
    slug: 'jet-lag-recovery-duration-calculator',
    description: 'Assess circadian disruption from travel.',
  },
];

const baseUrl = 'https://mycalculating.com/category/health-fitness/circadian-rhythm-disruption-risk-calculator';

const schemaMarkup = {
  '@context': 'https://schema.org',
  '@graph': [
    {
      '@type': 'BreadcrumbList',
      itemListElement: [
        { '@type': 'ListItem', position: 1, name: 'Home', item: 'https://mycalculating.com' },
        { '@type': 'ListItem', position: 2, name: 'Health & Fitness', item: 'https://mycalculating.com/category/health-fitness' },
        { '@type': 'ListItem', position: 3, name: 'Circadian Rhythm Disruption Tendency Wellness Calculator', item: baseUrl },
      ],
    },
    {
      '@type': 'SoftwareApplication',
      name: 'Circadian Rhythm Disruption Tendency Wellness Calculator',
      applicationCategory: 'Calculator',
      operatingSystem: 'Web Browser',
      description: 'Calculate circadian rhythm disruption risk from sleep schedule, light exposure, meal timing, and screen time.',
      url: baseUrl,
      offers: { '@type': 'Offer', price: '0', priceCurrency: 'USD' },
    },
  ],
};

const clamp = (value: number, min: number, max: number) => Math.min(max, Math.max(min, value));

const calculateResult = (values: FormValues): ResultPayload => {
  const sleepSchedule = values.sleepSchedule;
  const lightExposure = values.lightExposure;
  const mealTiming = values.mealTiming;
  const screenTime = values.screenTime;
  
  // Calculate disruption risk (0-100, higher = higher risk)
  let disruptionRisk = 50;
  
  // Sleep schedule component (0-30 points, inverted)
  // Lower consistency = higher risk
  if (sleepSchedule >= 8) {
    disruptionRisk -= 25; // Very consistent
  } else if (sleepSchedule >= 6) {
    disruptionRisk -= 15; // Good consistency
  } else if (sleepSchedule < 4) {
    disruptionRisk += 25; // Very irregular
  } else {
    disruptionRisk += 10; // Moderate irregularity
  }
  
  // Light exposure component (0-25 points, inverted)
  // Lower exposure = higher risk
  if (lightExposure >= 8) {
    disruptionRisk -= 20; // Optimal
  } else if (lightExposure >= 6) {
    disruptionRisk -= 10; // Good
  } else if (lightExposure < 4) {
    disruptionRisk += 20; // Poor
  } else {
    disruptionRisk += 5; // Moderate
  }
  
  // Meal timing component (0-20 points, inverted)
  // Lower consistency = higher risk
  if (mealTiming >= 8) {
    disruptionRisk -= 15; // Very consistent
  } else if (mealTiming >= 6) {
    disruptionRisk -= 8; // Good consistency
  } else if (mealTiming < 4) {
    disruptionRisk += 15; // Very irregular
  } else {
    disruptionRisk += 5; // Moderate irregularity
  }
  
  // Screen time component (0-25 points)
  // Higher screen time = higher risk
  if (screenTime >= 8) {
    disruptionRisk += 25; // Extensive
  } else if (screenTime >= 5) {
    disruptionRisk += 15; // Moderate
  } else if (screenTime >= 2) {
    disruptionRisk += 5; // Low
  }
  // No screen time = no additional risk
  
  disruptionRisk = clamp(disruptionRisk, 0, 100);
  const riskIndex = disruptionRisk; // Same value

  let status: ResultPayload['status'] = 'optimal';
  let interpretation = 'This suggests a general lifestyle tendency where your circadian rhythm disruption tendency may appear low. You may consider continuing to maintain consistent sleep schedule and healthy light exposure habits.';

  if (disruptionRisk > 70 || sleepSchedule < 4 || screenTime > 7) {
    status = 'low';
    interpretation = 'This suggests a general lifestyle tendency where your circadian rhythm disruption tendency may be high. This may significantly affect sleep, health, and well-being. You may consider focusing on improving sleep schedule, reducing screen time, and optimizing light exposure. This is a personal insight, not a medical evaluation.';
  } else if (disruptionRisk > 60 || sleepSchedule < 6 || screenTime > 5) {
    status = 'moderate';
    interpretation = 'This suggests a general lifestyle tendency where your circadian rhythm disruption tendency may be moderate. You may consider improving sleep schedule consistency, reducing screen time before bed, and optimizing light exposure to lower tendency.';
  } else if (disruptionRisk > 50) {
    status = 'good';
    interpretation = 'This suggests a general lifestyle tendency where your circadian rhythm disruption tendency may be manageable. You may consider continuing to maintain consistent routines and healthy habits to support optimal circadian alignment.';
  }

  const recommendations = [
    'Maintain consistent sleep schedule: go to bed and wake up at the same times every day, even on weekends, to support circadian rhythm alignment.',
    'Optimize light exposure: get bright light during the day (especially morning), and limit light exposure in the evening. Use blue light filters or avoid screens 1-2 hours before bed.',
    'Establish regular meal timing: eat meals at consistent times to support metabolic rhythms and circadian alignment. Avoid large meals close to bedtime.',
  ];
  if (status === 'low' || status === 'moderate') {
    recommendations.push('Reduce screen time before bed. Avoid screens 1-2 hours before sleep, or use blue light filters and night mode to minimize circadian disruption.');
  }
  if (sleepSchedule < 6) {
    recommendations.push('Improve sleep schedule consistency. Irregular sleep-wake times significantly disrupt circadian rhythm. Aim for consistent bed and wake times.');
  }
  if (lightExposure < 6) {
    recommendations.push('Optimize light exposure: get bright natural light during the day, especially in the morning, and create a dark sleep environment at night.');
  }

  const plan = [
    { label: 'This Week', detail: 'Assess current sleep schedule, light exposure, meal timing, and screen time. Calculate circadian disruption risk and identify areas for improvement.' },
    { label: 'This Month', detail: 'Implement circadian optimization: establish consistent sleep schedule, optimize light exposure, regularize meal timing, and reduce screen time before bed.' },
    { label: 'Ongoing', detail: 'Monitor circadian rhythm through regular assessment of sleep patterns and lifestyle factors. Maintain consistent routines to support optimal circadian alignment.' },
  ];

  return { sleepSchedule, lightExposure, mealTiming, screenTime, disruptionRisk, riskIndex, status, interpretation, recommendations, plan };
};

export default function CircadianRhythmDisruptionRiskCalculator() {
  const [result, setResult] = useState<ResultPayload | null>(null);

  const form = useForm<FormValues>({
    resolver: zodResolver(formSchema),
    defaultValues: {
      sleepSchedule: undefined,
      lightExposure: undefined,
      mealTiming: undefined,
      screenTime: undefined,
    },
  });

  return (
    <div className="space-y-8">
      <Script id="circadian-rhythm-schema" type="application/ld+json" strategy="afterInteractive" dangerouslySetInnerHTML={{ __html: JSON.stringify(schemaMarkup) }} />

      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <Clock className="h-5 w-5" />
            Circadian Rhythm Disruption Tendency Wellness Calculator
          </CardTitle>
          <CardDescription>Get general wellness insights about circadian rhythm disruption tendency from sleep schedule, light exposure, meal timing, and screen time. This is a personal lifestyle insight, not a medical evaluation.</CardDescription>
        </CardHeader>
      </Card>

      <Card>
        <CardHeader>
          <CardTitle>Input your circadian rhythm data</CardTitle>
        </CardHeader>
        <CardContent>
          <Form {...form}>
            <form onSubmit={form.handleSubmit((values) => setResult(calculateResult(values)))} className="space-y-6">
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <FormField
                  control={form.control}
                  name="sleepSchedule"
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel>Sleep schedule consistency (1-10)</FormLabel>
                      <FormControl>
                        <Input type="number" step="1" placeholder="e.g., 7" value={field.value ?? ''} onChange={(e) => field.onChange(e.target.value === '' ? undefined : Number(e.target.value))} />
                      </FormControl>
                      <FormMessage />
                    </FormItem>
                  )}
                />
                <FormField
                  control={form.control}
                  name="lightExposure"
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel>Light exposure score (1-10)</FormLabel>
                      <FormControl>
                        <Input type="number" step="1" placeholder="e.g., 6" value={field.value ?? ''} onChange={(e) => field.onChange(e.target.value === '' ? undefined : Number(e.target.value))} />
                      </FormControl>
                      <FormMessage />
                    </FormItem>
                  )}
                />
                <FormField
                  control={form.control}
                  name="mealTiming"
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel>Meal timing consistency (1-10)</FormLabel>
                      <FormControl>
                        <Input type="number" step="1" placeholder="e.g., 7" value={field.value ?? ''} onChange={(e) => field.onChange(e.target.value === '' ? undefined : Number(e.target.value))} />
                      </FormControl>
                      <FormMessage />
                    </FormItem>
                  )}
                />
                <FormField
                  control={form.control}
                  name="screenTime"
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel>Screen time before bed (0-10)</FormLabel>
                      <FormControl>
                        <Input type="number" step="1" placeholder="e.g., 3" value={field.value ?? ''} onChange={(e) => field.onChange(e.target.value === '' ? undefined : Number(e.target.value))} />
                      </FormControl>
                      <FormMessage />
                    </FormItem>
                  )}
                />
              </div>
              <Button type="submit" className="w-full md:w-auto">
                Calculate disruption risk
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
            <CardDescription>See circadian rhythm disruption tendency, sleep-wake cycle status, and recommendations.</CardDescription>
          </CardHeader>
          <CardContent className="space-y-6">
            <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
              <div className="p-4 border rounded">
                <p className="text-sm text-muted-foreground">Sleep schedule</p>
                <p className="text-2xl font-semibold text-primary">{result.sleepSchedule.toFixed(0)}</p>
                <p className="text-xs text-muted-foreground">Out of 10</p>
              </div>
              <div className="p-4 border rounded">
                <p className="text-sm text-muted-foreground">Light exposure</p>
                <p className="text-2xl font-semibold text-primary">{result.lightExposure.toFixed(0)}</p>
                <p className="text-xs text-muted-foreground">Out of 10</p>
              </div>
              <div className="p-4 border rounded">
                <p className="text-sm text-muted-foreground">Disruption risk</p>
                <p className="text-2xl font-semibold text-primary">{result.disruptionRisk.toFixed(0)}</p>
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
            <strong>Circadian disruption risk</strong> = calculated from sleep schedule consistency (0-30 points, inverted), light exposure (0-25 points, inverted), meal timing consistency (0-20 points, inverted), and screen time before bed (0-25 points).
          </p>
          <p>
            <strong>Components</strong>: Consistent sleep schedule and meal timing reduce risk. Optimal light exposure (bright day, dark night) reduces risk. Screen time before bed increases risk.
          </p>
          <p>
            <strong>Optimal ranges</strong>: Sleep schedule: 8-10, Light exposure: 8-10, Meal timing: 8-10, Screen time: 0-2. Lower disruption risk (&lt;50) indicates better circadian alignment.
          </p>
          <p>Circadian disruption risk is affected by sleep-wake patterns, light-dark cycles, meal timing, screen exposure, and lifestyle factors that desynchronize the internal biological clock.</p>
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
                <p className="text-sm text-muted-foreground">Target risk</p>
                <p className="text-xl font-semibold text-primary">&lt; 50</p>
                <p className="text-xs text-muted-foreground">Optimal range</p>
              </div>
              <div className="p-4 border rounded">
                <p className="text-sm text-muted-foreground">Risk index</p>
                <p className="text-xl font-semibold text-primary">{result.riskIndex.toFixed(0)}</p>
                <p className="text-xs text-muted-foreground">Out of 100</p>
              </div>
              <div className="p-4 border rounded">
                <p className="text-sm text-muted-foreground">Risk status</p>
                <p className="text-xl font-semibold text-primary">
                  {result.disruptionRisk < 50 ? 'Low' : result.disruptionRisk < 70 ? 'Moderate' : 'High'}
                </p>
                <p className="text-xs text-muted-foreground">Based on value</p>
              </div>
            </div>
          ) : (
            <p className="text-sm text-muted-foreground">Enter your circadian rhythm data to see additional insights.</p>
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
          <p>Circadian rhythm is the body's internal 24-hour biological clock regulating sleep-wake cycles and physiological processes. Disruption is caused by irregular sleep, light exposure at night, irregular meal timing, and screen time before bed.</p>
          <p>Use this calculator to assess circadian rhythm disruption risk from sleep schedule, light exposure, meal timing, and screen time.</p>
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
          <p>This tool provides general wellness insights about circadian rhythm disruption tendency from sleep schedule, light exposure, meal timing, and screen time. This is a personal lifestyle insight, not a medical evaluation.</p>
          <p>Outputs include sleep schedule, light exposure, meal timing, screen time, disruption tendency, tendency index, status, recommendations, an action plan, and supporting metrics.</p>
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

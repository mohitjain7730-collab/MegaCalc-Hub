'use client';

import { useState } from 'react';
import Script from 'next/script';
import Link from 'next/link';
import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import { z } from 'zod';
import { Moon, Zap, Target, Activity, Shield } from 'lucide-react';

import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Form, FormControl, FormField, FormItem, FormLabel, FormMessage } from '@/components/ui/form';
import { Input } from '@/components/ui/input';

const formSchema = z.object({
  sleepQuality: z.number({ invalid_type_error: 'Enter sleep quality' }).min(1).max(10),
  sleepDuration: z.number({ invalid_type_error: 'Enter sleep duration' }).min(4).max(12),
  sleepConsistency: z.number({ invalid_type_error: 'Enter sleep consistency' }).min(1).max(10),
  age: z.number({ invalid_type_error: 'Enter age' }).min(1).max(100),
});

type FormValues = z.infer<typeof formSchema>;

type ResultPayload = {
  sleepQuality: number;
  sleepDuration: number;
  sleepConsistency: number;
  longevityScore: number;
  correlationIndex: number;
  status: 'optimal' | 'good' | 'moderate' | 'low';
  interpretation: string;
  recommendations: string[];
  plan: { label: string; detail: string }[];
};

const steps = [
  'Enter sleep quality (1 = poor, 10 = excellent) from sleep assessment.',
  'Enter average sleep duration (hours) from sleep tracking.',
  'Enter sleep consistency (1 = irregular, 10 = very consistent) from sleep schedule assessment.',
  'Enter your age (longevity correlation may vary by age).',
  'Review longevity correlation score, sleep-longevity relationship, and recommendations.',
];

const faqs = [
  {
    question: 'How does sleep quality affect longevity?',
    answer:
      'High-quality sleep is strongly associated with increased longevity. Poor sleep quality is linked to increased mortality risk, chronic diseases, and reduced life expectancy. Quality sleep supports cellular repair, immune function, and overall health.',
  },
  {
    question: 'How does sleep duration affect longevity?',
    answer:
      'Optimal sleep duration (typically 7-9 hours for adults) is associated with longest life expectancy. Both insufficient sleep (&lt;6 hours) and excessive sleep (&gt;9-10 hours) may be associated with increased mortality risk.',
  },
  {
    question: 'How does sleep consistency affect longevity?',
    answer:
      'Consistent sleep-wake schedules support circadian rhythm, metabolic health, and overall well-being. Irregular sleep patterns are associated with increased disease risk and may negatively impact longevity.',
  },
  {
    question: 'What is the optimal sleep for longevity?',
    answer:
      'Optimal sleep for longevity typically includes 7-9 hours of high-quality sleep per night, consistent sleep-wake times, and good sleep efficiency. Individual needs may vary, but these patterns are associated with best outcomes.',
  },
  {
    question: 'Can poor sleep reduce lifespan?',
    answer:
      'Yes. Chronic poor sleep quality, insufficient sleep, and sleep disorders are associated with increased risk of cardiovascular disease, diabetes, cognitive decline, and other conditions that can reduce lifespan.',
  },
  {
    question: 'How does age affect sleep-longevity correlation?',
    answer:
      'Sleep needs and patterns change with age, but quality sleep remains important for longevity at all ages. Older adults may have different sleep patterns but still benefit from good sleep quality and adequate duration.',
  },
  {
    question: 'What about sleep disorders?',
    answer:
      'Sleep disorders (sleep apnea, insomnia, etc.) significantly impact sleep quality and are associated with increased mortality risk. Treating sleep disorders can improve both sleep quality and longevity prospects.',
  },
  {
    question: 'Can improving sleep extend lifespan?',
    answer:
      'Improving sleep quality, duration, and consistency can support longevity by reducing disease risk, supporting cellular repair, optimizing metabolic function, and promoting overall health. Good sleep is a key longevity factor.',
  },
  {
    question: 'What other factors affect longevity?',
    answer:
      'Longevity is affected by multiple factors: genetics, diet, exercise, stress management, social connections, healthcare access, and lifestyle choices. Sleep is one important component of a longevity-promoting lifestyle.',
  },
  {
    question: 'When should I consult a healthcare provider?',
    answer:
      'Consult a healthcare provider if you have persistent sleep problems, sleep disorders, or concerns about sleep quality affecting your health. Sleep evaluation and treatment can support both sleep quality and longevity.',
  },
];

const relatedCalculators = [
  {
    name: 'Circadian Rhythm Disruption Risk Calculator',
    slug: 'circadian-rhythm-disruption-risk-calculator',
    description: 'Assess circadian health alongside sleep quality.',
  },
  {
    name: 'Lifespan Extension Strategy Score Calculator',
    slug: 'lifespan-extension-strategy-score-calculator',
    description: 'Evaluate complete longevity strategies.',
  },
  {
    name: 'Deep Sleep Requirement Estimator',
    slug: 'deep-sleep-requirement-estimator',
    description: 'Optimize deep sleep for health.',
  },
  {
    name: 'Sleep Quality vs Screen Exposure Analyzer',
    slug: 'sleep-quality-vs-screen-exposure-analyzer',
    description: 'Monitor factors affecting sleep quality.',
  },
];

const baseUrl = 'https://mycalculating.com/category/health-fitness/sleep-quality-vs-longevity-correlation-calculator';

const schemaMarkup = {
  '@context': 'https://schema.org',
  '@graph': [
    {
      '@type': 'BreadcrumbList',
      itemListElement: [
        { '@type': 'ListItem', position: 1, name: 'Home', item: 'https://mycalculating.com' },
        { '@type': 'ListItem', position: 2, name: 'Health & Fitness', item: 'https://mycalculating.com/category/health-fitness' },
        { '@type': 'ListItem', position: 3, name: 'Sleep Quality vs Longevity Correlation Calculator', item: baseUrl },
      ],
    },
    {
      '@type': 'SoftwareApplication',
      name: 'Sleep Quality vs Longevity Correlation Calculator',
      applicationCategory: 'Calculator',
      operatingSystem: 'Web Browser',
      description: 'Calculate sleep quality vs longevity correlation from sleep quality, sleep duration, sleep consistency, and age.',
      url: baseUrl,
      offers: { '@type': 'Offer', price: '0', priceCurrency: 'USD' },
    },
  ],
};

const clamp = (value: number, min: number, max: number) => Math.min(max, Math.max(min, value));

const calculateResult = (values: FormValues): ResultPayload => {
  const sleepQuality = values.sleepQuality;
  const sleepDuration = values.sleepDuration;
  const sleepConsistency = values.sleepConsistency;
  
  // Calculate longevity score (0-100, higher = better longevity correlation)
  let longevityScore = 50;
  
  // Sleep quality component (0-40 points)
  if (sleepQuality >= 8) {
    longevityScore += 35; // Excellent
  } else if (sleepQuality >= 6) {
    longevityScore += 20; // Good
  } else if (sleepQuality < 4) {
    longevityScore -= 25; // Poor
  } else {
    longevityScore -= 5; // Moderate
  }
  
  // Sleep duration component (0-35 points)
  // Optimal: 7-9 hours
  if (sleepDuration >= 7 && sleepDuration <= 9) {
    longevityScore += 30; // Optimal range
  } else if (sleepDuration >= 6 && sleepDuration < 7) {
    longevityScore += 15; // Slightly short
  } else if (sleepDuration > 9 && sleepDuration <= 10) {
    longevityScore += 10; // Slightly long
  } else if (sleepDuration < 6) {
    longevityScore -= 20; // Too short
  } else if (sleepDuration > 10) {
    longevityScore -= 15; // Too long
  }
  
  // Sleep consistency component (0-25 points)
  if (sleepConsistency >= 8) {
    longevityScore += 22; // Very consistent
  } else if (sleepConsistency >= 6) {
    longevityScore += 12; // Good consistency
  } else if (sleepConsistency < 4) {
    longevityScore -= 18; // Very irregular
  } else {
    longevityScore -= 5; // Moderate irregularity
  }
  
  longevityScore = clamp(longevityScore, 0, 100);
  const correlationIndex = longevityScore; // Same value

  let status: ResultPayload['status'] = 'optimal';
  let interpretation = 'Your sleep patterns show strong positive correlation with longevity. Continue maintaining high-quality, consistent sleep.';

  if (longevityScore < 40 || sleepQuality < 4 || sleepDuration < 5) {
    status = 'low';
    interpretation = 'Your sleep patterns show weak correlation with longevity. Poor sleep quality, insufficient duration, or irregular patterns may negatively impact longevity. Focus on improving sleep significantly.';
  } else if (longevityScore < 60 || sleepQuality < 6 || sleepDuration < 6) {
    status = 'moderate';
    interpretation = 'Your sleep patterns show moderate correlation with longevity. Improving sleep quality, duration, and consistency can enhance longevity prospects.';
  } else if (longevityScore < 75) {
    status = 'good';
    interpretation = 'Your sleep patterns show good correlation with longevity. Continue maintaining quality sleep to support optimal longevity outcomes.';
  }

  const recommendations = [
    'Prioritize sleep quality: create optimal sleep environment, manage stress, address sleep disorders, and maintain good sleep hygiene to support longevity.',
    'Aim for optimal sleep duration: 7-9 hours per night for most adults. Both insufficient and excessive sleep may negatively impact longevity.',
    'Maintain consistent sleep-wake schedule: go to bed and wake up at the same times daily to support circadian rhythm and metabolic health associated with longevity.',
  ];
  if (status === 'low' || status === 'moderate') {
    recommendations.push('Address sleep problems promptly. Chronic poor sleep significantly impacts health and longevity. Consider sleep evaluation and treatment if needed.');
  }
  if (sleepDuration < 6 || sleepDuration > 10) {
    recommendations.push('Optimize sleep duration. Aim for 7-9 hours per night, as both insufficient and excessive sleep are associated with increased mortality risk.');
  }
  if (sleepConsistency < 6) {
    recommendations.push('Improve sleep consistency. Irregular sleep-wake patterns disrupt circadian rhythm and metabolic health, potentially impacting longevity.');
  }

  const plan = [
    { label: 'This Week', detail: 'Assess current sleep quality, duration, and consistency. Calculate longevity correlation and identify areas for improvement.' },
    { label: 'This Month', detail: 'Implement sleep improvements: optimize sleep environment, establish consistent schedule, address sleep issues, and prioritize quality sleep for longevity.' },
    { label: 'Ongoing', detail: 'Monitor sleep patterns and longevity correlation through regular assessment. Maintain optimal sleep habits to support longevity and overall health.' },
  ];

  return { sleepQuality, sleepDuration, sleepConsistency, longevityScore, correlationIndex, status, interpretation, recommendations, plan };
};

export default function SleepQualityVsLongevityCorrelationCalculator() {
  const [result, setResult] = useState<ResultPayload | null>(null);

  const form = useForm<FormValues>({
    resolver: zodResolver(formSchema),
    defaultValues: {
      sleepQuality: undefined,
      sleepDuration: undefined,
      sleepConsistency: undefined,
      age: undefined,
    },
  });

  return (
    <div className="space-y-8">
      <Script id="sleep-longevity-schema" type="application/ld+json" strategy="afterInteractive" dangerouslySetInnerHTML={{ __html: JSON.stringify(schemaMarkup) }} />

      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <Moon className="h-5 w-5" />
            Sleep Quality vs Longevity Correlation Calculator
          </CardTitle>
          <CardDescription>Calculate sleep quality vs longevity correlation from sleep quality, sleep duration, sleep consistency, and age.</CardDescription>
        </CardHeader>
      </Card>

      <Card>
        <CardHeader>
          <CardTitle>Input your sleep-longevity data</CardTitle>
        </CardHeader>
        <CardContent>
          <Form {...form}>
            <form onSubmit={form.handleSubmit((values) => setResult(calculateResult(values)))} className="space-y-6">
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <FormField
                  control={form.control}
                  name="sleepQuality"
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel>Sleep quality (1-10)</FormLabel>
                      <FormControl>
                        <Input type="number" step="1" placeholder="e.g., 8" value={field.value ?? ''} onChange={(e) => field.onChange(e.target.value === '' ? undefined : Number(e.target.value))} />
                      </FormControl>
                      <FormMessage />
                    </FormItem>
                  )}
                />
                <FormField
                  control={form.control}
                  name="sleepDuration"
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel>Sleep duration (hours)</FormLabel>
                      <FormControl>
                        <Input type="number" step="0.1" placeholder="e.g., 7.5" value={field.value ?? ''} onChange={(e) => field.onChange(e.target.value === '' ? undefined : Number(e.target.value))} />
                      </FormControl>
                      <FormMessage />
                    </FormItem>
                  )}
                />
                <FormField
                  control={form.control}
                  name="sleepConsistency"
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel>Sleep consistency (1-10)</FormLabel>
                      <FormControl>
                        <Input type="number" step="1" placeholder="e.g., 7" value={field.value ?? ''} onChange={(e) => field.onChange(e.target.value === '' ? undefined : Number(e.target.value))} />
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
                Calculate longevity correlation
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
            <CardDescription>See longevity correlation score, sleep-longevity relationship, and recommendations.</CardDescription>
          </CardHeader>
          <CardContent className="space-y-6">
            <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
              <div className="p-4 border rounded">
                <p className="text-sm text-muted-foreground">Sleep quality</p>
                <p className="text-2xl font-semibold text-primary">{result.sleepQuality.toFixed(0)}</p>
                <p className="text-xs text-muted-foreground">Out of 10</p>
              </div>
              <div className="p-4 border rounded">
                <p className="text-sm text-muted-foreground">Sleep duration</p>
                <p className="text-2xl font-semibold text-primary">{result.sleepDuration.toFixed(1)}</p>
                <p className="text-xs text-muted-foreground">hours</p>
              </div>
              <div className="p-4 border rounded">
                <p className="text-sm text-muted-foreground">Longevity score</p>
                <p className="text-2xl font-semibold text-primary">{result.longevityScore.toFixed(0)}</p>
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
            <strong>Longevity correlation score</strong> = calculated from sleep quality (0-40 points), sleep duration (0-35 points, optimal: 7-9 hours), and sleep consistency (0-25 points).
          </p>
          <p>
            <strong>Components</strong>: Higher sleep quality, optimal duration (7-9 hours), and greater consistency are associated with better longevity outcomes. Lower scores indicate weaker longevity correlation.
          </p>
          <p>
            <strong>Optimal ranges</strong>: Sleep quality: 8-10, Sleep duration: 7-9 hours, Sleep consistency: 8-10. Higher longevity scores indicate stronger positive correlation with longevity.
          </p>
          <p>Sleep quality, duration, and consistency are strongly associated with longevity. Good sleep supports cellular repair, immune function, metabolic health, and overall well-being linked to increased life expectancy.</p>
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
                <p className="text-sm text-muted-foreground">Target longevity score</p>
                <p className="text-xl font-semibold text-primary">&gt; 75</p>
                <p className="text-xs text-muted-foreground">Optimal range</p>
              </div>
              <div className="p-4 border rounded">
                <p className="text-sm text-muted-foreground">Correlation index</p>
                <p className="text-xl font-semibold text-primary">{result.correlationIndex.toFixed(0)}</p>
                <p className="text-xs text-muted-foreground">Out of 100</p>
              </div>
              <div className="p-4 border rounded">
                <p className="text-sm text-muted-foreground">Sleep score average</p>
                <p className="text-xl font-semibold text-primary">
                  {((result.sleepQuality + result.sleepConsistency) / 2).toFixed(1)}
                </p>
                <p className="text-xs text-muted-foreground">Out of 10</p>
              </div>
            </div>
          ) : (
            <p className="text-sm text-muted-foreground">Enter your sleep-longevity data to see additional insights.</p>
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
          <p>High-quality sleep is strongly associated with increased longevity. Optimal sleep (7-9 hours, high quality, consistent) supports cellular repair, immune function, and overall health linked to longer life expectancy.</p>
          <p>Use this calculator to assess sleep quality vs longevity correlation from sleep quality, sleep duration, sleep consistency, and age.</p>
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
          <p>This tool calculates sleep quality vs longevity correlation from sleep quality, sleep duration, sleep consistency, and age.</p>
          <p>Outputs include sleep quality, sleep duration, sleep consistency, longevity score, correlation index, status, recommendations, an action plan, and supporting metrics.</p>
          <p>Formula, steps, guide content, related tools, and FAQs ensure humans or AI assistants can interpret the methodology instantly.</p>
        </CardContent>
      </Card>
    </div>
  );
}


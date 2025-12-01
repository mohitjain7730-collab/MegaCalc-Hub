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
  age: z.number({ invalid_type_error: 'Enter age' }).min(35).max(60),
  cycleIrregularity: z.number({ invalid_type_error: 'Enter irregularity score' }).min(0).max(10),
  hotFlashFrequency: z.number({ invalid_type_error: 'Enter hot flash frequency' }).min(0).max(10),
  sleepQuality: z.number({ invalid_type_error: 'Enter sleep quality' }).min(1).max(10),
  moodChanges: z.number({ invalid_type_error: 'Enter mood changes' }).min(0).max(10),
  periodChanges: z.enum(['regular', 'slightly-irregular', 'very-irregular', 'missed']),
});

type FormValues = z.infer<typeof formSchema>;

type ResultPayload = {
  transitionScore: number;
  stage: 'early' | 'mid' | 'late' | 'post-menopause';
  yearsToMenopause: number;
  status: 'pre-perimenopause' | 'early-perimenopause' | 'mid-perimenopause' | 'late-perimenopause' | 'post-menopause';
  interpretation: string;
  recommendations: string[];
  plan: { label: string; detail: string }[];
};

const steps = [
  'Enter your current age (typically perimenopause starts 35-50).',
  'Rate cycle irregularity (0 = regular, 10 = very irregular or missed periods).',
  'Rate hot flash frequency (0 = none, 10 = multiple daily).',
  'Rate sleep quality (1 = poor, 10 = excellent).',
  'Rate mood changes (0 = stable, 10 = significant mood swings).',
  'Select period changes: regular, slightly irregular, very irregular, or missed.',
  'Review transition stage, years to menopause estimate, and recommendations.',
];

const faqs = [
  {
    question: 'What is perimenopause?',
    answer:
      'Perimenopause is the transition period before menopause (when periods stop for 12 months). It typically starts in the 40s but can begin in the 30s. Symptoms include irregular periods, hot flashes, and hormonal fluctuations.',
  },
  {
    question: 'How long does perimenopause last?',
    answer:
      'Perimenopause typically lasts 4-8 years, but can range from 2-10 years. It ends when you have not had a period for 12 consecutive months (menopause).',
  },
  {
    question: 'What are the stages of perimenopause?',
    answer:
      'Early: cycles may shorten, some symptoms. Mid: more irregular cycles, increased symptoms. Late: very irregular or missed periods, stronger symptoms. Post-menopause: 12+ months without a period.',
  },
  {
    question: 'Can I still get pregnant during perimenopause?',
    answer:
      'Yes. Ovulation can still occur, though fertility declines. Use contraception if not trying to conceive until 12 months after your last period.',
  },
  {
    question: 'What causes hot flashes?',
    answer:
      'Hot flashes are caused by hormonal fluctuations, particularly declining estrogen. They affect 75-85% of women during perimenopause and menopause.',
  },
  {
    question: 'How do I manage symptoms?',
    answer:
      'Lifestyle changes (exercise, stress management, sleep hygiene), diet adjustments, and possibly hormone therapy (HRT) or other medications. Consult a healthcare provider.',
  },
  {
    question: 'Does age matter?',
    answer:
      'Yes. Perimenopause typically starts in the 40s (average 47), but can begin earlier. Early perimenopause (before 40) may require medical evaluation.',
  },
  {
    question: 'What about irregular periods?',
    answer:
      'Irregular periods are common. Cycles may shorten, lengthen, or skip. Very heavy bleeding or periods lasting >7 days should be evaluated by a doctor.',
  },
  {
    question: 'Can symptoms be managed naturally?',
    answer:
      'Some symptoms may improve with lifestyle changes (exercise, diet, stress reduction, sleep), but severe symptoms may require medical treatment.',
  },
  {
    question: 'When should I see a doctor?',
    answer:
      'See a doctor if symptoms are severe, periods are very heavy/prolonged, or if you have concerns. Early perimenopause (<40) or severe symptoms warrant evaluation.',
  },
];

const relatedCalculators = [
  {
    name: 'Sleep Quality vs Productivity Correlation Calculator',
    slug: 'sleep-quality-vs-productivity-correlation-calculator',
    description: 'Manage sleep issues common during perimenopause.',
  },
  {
    name: 'Stress Hormone Balance Calculator',
    slug: 'stress-hormone-balance-calculator',
    description: 'Monitor stress and cortisol during hormonal transitions.',
  },
];

const baseUrl = 'https://mycalculating.com/category/health-fitness/perimenopause-transition-stage-estimator';

const schemaMarkup = {
  '@context': 'https://schema.org',
  '@graph': [
    {
      '@type': 'BreadcrumbList',
      itemListElement: [
        { '@type': 'ListItem', position: 1, name: 'Home', item: 'https://mycalculating.com' },
        { '@type': 'ListItem', position: 2, name: 'Health & Fitness', item: 'https://mycalculating.com/category/health-fitness' },
        { '@type': 'ListItem', position: 3, name: 'Perimenopause Transition Stage Estimator', item: baseUrl },
      ],
    },
    {
      '@type': 'SoftwareApplication',
      name: 'Perimenopause Transition Stage Estimator',
      applicationCategory: 'Calculator',
      operatingSystem: 'Web Browser',
      description: 'Estimate perimenopause transition stage, years to menopause, and get symptom management recommendations.',
      url: baseUrl,
      offers: { '@type': 'Offer', price: '0', priceCurrency: 'USD' },
    },
  ],
};

const clamp = (value: number, min: number, max: number) => Math.min(max, Math.max(min, value));

const calculateResult = (values: FormValues): ResultPayload => {
  // Age factor (earlier = more transition points)
  const ageFactor = values.age < 40 ? 20 : values.age < 45 ? 15 : values.age < 50 ? 10 : 5;
  
  // Symptom scoring
  const cycleScore = (values.cycleIrregularity / 10) * 25; // 0-25 points
  const hotFlashScore = (values.hotFlashFrequency / 10) * 20; // 0-20 points
  const sleepScore = ((10 - values.sleepQuality) / 10) * 15; // 0-15 points (inverted)
  const moodScore = (values.moodChanges / 10) * 15; // 0-15 points
  
  // Period changes scoring
  const periodScores: Record<string, number> = {
    'regular': 0,
    'slightly-irregular': 10,
    'very-irregular': 20,
    'missed': 25,
  };
  const periodScore = periodScores[values.periodChanges] || 0;
  
  const transitionScore = clamp(ageFactor + cycleScore + hotFlashScore + sleepScore + moodScore + periodScore, 0, 100);
  
  // Stage determination
  let stage: ResultPayload['stage'] = 'early';
  let status: ResultPayload['status'] = 'pre-perimenopause';
  let yearsToMenopause = 5;
  
  if (transitionScore < 20) {
    status = 'pre-perimenopause';
    yearsToMenopause = 8;
  } else if (transitionScore < 40) {
    status = 'early-perimenopause';
    stage = 'early';
    yearsToMenopause = 6;
  } else if (transitionScore < 65) {
    status = 'mid-perimenopause';
    stage = 'mid';
    yearsToMenopause = 3;
  } else if (transitionScore < 85) {
    status = 'late-perimenopause';
    stage = 'late';
    yearsToMenopause = 1;
  } else {
    status = 'post-menopause';
    stage = 'post-menopause';
    yearsToMenopause = 0;
  }
  
  let interpretation = 'You appear to be in early perimenopause. Symptoms are mild and cycles may be slightly irregular.';
  
  if (status === 'pre-perimenopause') {
    interpretation = 'You may be approaching perimenopause. Continue monitoring symptoms and cycle changes.';
  } else if (status === 'mid-perimenopause') {
    interpretation = 'You appear to be in mid-perimenopause. Symptoms are more noticeable and cycles are irregular.';
  } else if (status === 'late-perimenopause') {
    interpretation = 'You appear to be in late perimenopause. Periods are very irregular or missed, and symptoms may be stronger.';
  } else if (status === 'post-menopause') {
    interpretation = 'You appear to be post-menopause (12+ months without a period). Symptoms may persist but typically stabilize.';
  }

  const recommendations = [
    'Track your cycles and symptoms to identify patterns and discuss with your healthcare provider.',
    'Manage hot flashes with lifestyle changes (cool environment, layered clothing, stress reduction).',
    'Prioritize sleep hygiene: consistent schedule, cool room, avoid caffeine/alcohol before bed.',
  ];
  if (status === 'mid-perimenopause' || status === 'late-perimenopause') {
    recommendations.push('Consider discussing hormone therapy (HRT) or other treatments with your healthcare provider if symptoms are severe.');
  }
  if (status === 'post-menopause') {
    recommendations.push('Focus on long-term health: bone density, heart health, and maintaining healthy lifestyle habits.');
  }

  const plan = [
    { label: 'This Month', detail: 'Track all symptoms and cycle changes. Document patterns to share with healthcare provider.' },
    { label: 'Next 3 Months', detail: 'Continue tracking. Implement lifestyle changes (exercise, diet, stress management) to manage symptoms.' },
    { label: 'Ongoing', detail: 'Regular check-ups with healthcare provider. Discuss treatment options if symptoms interfere with daily life.' },
  ];

  return { transitionScore, stage, yearsToMenopause, status, interpretation, recommendations, plan };
};

export default function PerimenopauseTransitionStageEstimator() {
  const [result, setResult] = useState<ResultPayload | null>(null);

  const form = useForm<FormValues>({
    resolver: zodResolver(formSchema),
    defaultValues: {
      age: undefined,
      cycleIrregularity: undefined,
      hotFlashFrequency: undefined,
      sleepQuality: undefined,
      moodChanges: undefined,
      periodChanges: 'regular',
    },
  });

  return (
    <div className="space-y-8">
      <Script id="perimenopause-schema" type="application/ld+json" strategy="afterInteractive" dangerouslySetInnerHTML={{ __html: JSON.stringify(schemaMarkup) }} />

      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <Calendar className="h-5 w-5" />
            Perimenopause Transition Stage Estimator
          </CardTitle>
          <CardDescription>Estimate perimenopause transition stage, years to menopause, and get symptom management recommendations.</CardDescription>
        </CardHeader>
      </Card>

      <Card>
        <CardHeader>
          <CardTitle>Input your symptoms and cycle data</CardTitle>
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
                        <Input type="number" step="1" placeholder="e.g., 45" value={field.value ?? ''} onChange={(e) => field.onChange(e.target.value === '' ? undefined : Number(e.target.value))} />
                      </FormControl>
                      <FormMessage />
                    </FormItem>
                  )}
                />
                <FormField
                  control={form.control}
                  name="cycleIrregularity"
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel>Cycle irregularity (0-10)</FormLabel>
                      <FormControl>
                        <Input type="number" step="1" placeholder="e.g., 6" value={field.value ?? ''} onChange={(e) => field.onChange(e.target.value === '' ? undefined : Number(e.target.value))} />
                      </FormControl>
                      <FormMessage />
                    </FormItem>
                  )}
                />
                <FormField
                  control={form.control}
                  name="hotFlashFrequency"
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel>Hot flash frequency (0-10)</FormLabel>
                      <FormControl>
                        <Input type="number" step="1" placeholder="e.g., 4" value={field.value ?? ''} onChange={(e) => field.onChange(e.target.value === '' ? undefined : Number(e.target.value))} />
                      </FormControl>
                      <FormMessage />
                    </FormItem>
                  )}
                />
                <FormField
                  control={form.control}
                  name="sleepQuality"
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel>Sleep quality (1-10)</FormLabel>
                      <FormControl>
                        <Input type="number" step="1" placeholder="e.g., 5" value={field.value ?? ''} onChange={(e) => field.onChange(e.target.value === '' ? undefined : Number(e.target.value))} />
                      </FormControl>
                      <FormMessage />
                    </FormItem>
                  )}
                />
                <FormField
                  control={form.control}
                  name="moodChanges"
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel>Mood changes (0-10)</FormLabel>
                      <FormControl>
                        <Input type="number" step="1" placeholder="e.g., 5" value={field.value ?? ''} onChange={(e) => field.onChange(e.target.value === '' ? undefined : Number(e.target.value))} />
                      </FormControl>
                      <FormMessage />
                    </FormItem>
                  )}
                />
                <FormField
                  control={form.control}
                  name="periodChanges"
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel>Period changes</FormLabel>
                      <FormControl>
                        <select
                          value={field.value}
                          onChange={(e) => field.onChange(e.target.value as FormValues['periodChanges'])}
                          className="flex h-10 w-full rounded-md border border-input bg-background px-3 py-2 text-sm ring-offset-background"
                        >
                          <option value="regular">Regular</option>
                          <option value="slightly-irregular">Slightly irregular</option>
                          <option value="very-irregular">Very irregular</option>
                          <option value="missed">Missed periods</option>
                        </select>
                      </FormControl>
                      <FormMessage />
                    </FormItem>
                  )}
                />
              </div>
              <Button type="submit" className="w-full md:w-auto">
                Estimate transition stage
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
            <CardDescription>See transition stage, years to menopause, and recommendations.</CardDescription>
          </CardHeader>
          <CardContent className="space-y-6">
            <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
              <div className="p-4 border rounded">
                <p className="text-sm text-muted-foreground">Transition score</p>
                <p className="text-2xl font-semibold text-primary">{result.transitionScore.toFixed(0)}</p>
                <p className="text-xs text-muted-foreground">Out of 100</p>
              </div>
              <div className="p-4 border rounded">
                <p className="text-sm text-muted-foreground">Stage</p>
                <p className="text-2xl font-semibold text-primary capitalize">{result.stage}</p>
                <p className="text-xs text-muted-foreground">Perimenopause stage</p>
              </div>
              <div className="p-4 border rounded">
                <p className="text-sm text-muted-foreground">Years to menopause</p>
                <p className="text-2xl font-semibold text-primary">{result.yearsToMenopause.toFixed(0)}</p>
                <p className="text-xs text-muted-foreground">Estimated</p>
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
          <p><strong>Transition score</strong> = age factor (5-20) + cycle irregularity (0-25) + hot flash frequency (0-20) + sleep impact (0-15) + mood changes (0-15) + period changes (0-25), max 100.</p>
          <p><strong>Stage determination</strong>: &lt;20 = pre-perimenopause, 20-40 = early, 40-65 = mid, 65-85 = late, &gt;85 = post-menopause.</p>
          <p><strong>Years to menopause</strong>: Estimated based on transition score and stage (0-8 years).</p>
          <p>Higher scores indicate more advanced perimenopause transition with stronger symptoms and irregular cycles.</p>
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
                <p className="text-sm text-muted-foreground">Symptom severity</p>
                <p className="text-xl font-semibold text-primary">
                  {result.transitionScore >= 65 ? 'High' : result.transitionScore >= 40 ? 'Moderate' : 'Mild'}
                </p>
                <p className="text-xs text-muted-foreground">Based on transition score</p>
              </div>
              <div className="p-4 border rounded">
                <p className="text-sm text-muted-foreground">Cycle stability</p>
                <p className="text-xl font-semibold text-primary">
                  {form.getValues().periodChanges === 'regular' ? 'Stable' : form.getValues().periodChanges === 'slightly-irregular' ? 'Mildly unstable' : 'Unstable'}
                </p>
                <p className="text-xs text-muted-foreground">Based on period changes</p>
              </div>
              <div className="p-4 border rounded">
                <p className="text-sm text-muted-foreground">Management priority</p>
                <p className="text-xl font-semibold text-primary">
                  {result.transitionScore >= 65 ? 'High' : result.transitionScore >= 40 ? 'Moderate' : 'Low'}
                </p>
                <p className="text-xs text-muted-foreground">Consider treatment if high</p>
              </div>
            </div>
          ) : (
            <p className="text-sm text-muted-foreground">Enter your symptoms and cycle data to see additional insights.</p>
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
          <p>Perimenopause is the transition period before menopause, typically lasting 4-8 years. Symptoms include irregular periods, hot flashes, sleep issues, and mood changes.</p>
          <p>Use this calculator to estimate your transition stage, years to menopause, and get recommendations for managing symptoms and maintaining health.</p>
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
          <p>This tool estimates perimenopause transition stage, years to menopause, and status from age, cycle irregularity, hot flashes, sleep quality, mood changes, and period changes.</p>
          <p>Outputs include transition score, stage, years to menopause, status, recommendations, an action plan, and supporting metrics.</p>
          <p>Formula, steps, guide content, related tools, and FAQs ensure humans or AI assistants can interpret the methodology instantly.</p>
        </CardContent>
      </Card>
    </div>
  );
}


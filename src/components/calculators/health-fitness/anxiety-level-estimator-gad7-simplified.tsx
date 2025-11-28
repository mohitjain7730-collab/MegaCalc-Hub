'use client';

import { useState } from 'react';
import Script from 'next/script';
import Link from 'next/link';
import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import { z } from 'zod';
import { HeartPulse, Target, Activity, Shield, BookMarked, CalendarHeart } from 'lucide-react';

import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Form, FormControl, FormField, FormItem, FormLabel, FormMessage } from '@/components/ui/form';
import { Input } from '@/components/ui/input';

const formSchema = z.object({
  gadScore: z.number({ invalid_type_error: 'Enter your total GAD-7 score' }).min(0).max(21),
  impairmentDays: z.number({ invalid_type_error: 'Enter days with difficulty' }).min(0).max(21),
  sleepQuality: z.number({ invalid_type_error: 'Enter sleep quality' }).min(1).max(5),
});

type FormValues = z.infer<typeof formSchema>;

type ResultPayload = {
  anxietyIndex: number;
  severity: 'minimal' | 'mild' | 'moderate' | 'severe';
  interpretation: string;
  recommendations: string[];
  plan: { label: string; detail: string }[];
};

const steps = [
  'Complete the GAD-7 questionnaire and add up your total score (0–21).',
  'Count how many days in the last 2 weeks anxiety symptoms made it hard to work, study, or connect (0–14+).',
  'Rate your average sleep quality from 1 (very poor) to 5 (restorative).',
  'Enter the values into the calculator and review your anxiety index and severity band.',
  'Use the recommendations to plan next steps and discuss results with a healthcare professional if needed.',
];

const faqs = [
  {
    question: 'What is the GAD-7?',
    answer:
      'The GAD-7 is a 7-question screening tool for generalized anxiety symptoms, scored from 0 to 21 based on how often symptoms occur.',
  },
  {
    question: 'Is this a diagnosis?',
    answer:
      'No. This calculator is an educational tool that mirrors common cutoffs from the GAD-7 but cannot diagnose anxiety disorders.',
  },
  {
    question: 'Why ask about sleep quality?',
    answer:
      'Sleep strongly influences anxiety intensity and recovery. Including it helps you see how rest may buffer or amplify symptoms.',
  },
  {
    question: 'When should I seek professional help?',
    answer:
      'If your score is in the moderate or severe range—or symptoms disrupt work, relationships, or safety—consider speaking with a licensed mental health professional.',
  },
  {
    question: 'Can my score change over time?',
    answer:
      'Yes. Anxiety levels often fluctuate with stress, life events, and coping strategies. Retesting weekly can help you notice patterns.',
  },
  {
    question: 'Does exercise help with anxiety?',
    answer:
      'Regular movement, especially brisk walking or strength training, can lower baseline stress and support more stable mood.',
  },
  {
    question: 'What about caffeine and anxiety?',
    answer:
      'High caffeine intake can mimic or worsen anxiety symptoms for some people. Tracking and possibly reducing it may help.',
  },
  {
    question: 'Can mindfulness reduce my score?',
    answer:
      'Short daily practices like breath awareness or body scans can improve emotional regulation and may lower anxiety scores over time.',
  },
  {
    question: 'How should I share this with my clinician?',
    answer:
      'Bring your scores and notes on what triggers symptoms, what helps, and how anxiety affects daily function to guide care decisions.',
  },
  {
    question: 'Is it normal for scores to spike after big life changes?',
    answer:
      'Yes, temporary spikes are common after stressors. Persistent high scores over several weeks are a clearer signal to get support.',
  },
];

const relatedCalculators = [
  {
    name: 'Stress Level Self-Assessment Calculator',
    slug: 'stress-level-self-assessment-calculator',
    description: 'Check overall stress patterns alongside your anxiety score.',
  },
  {
    name: 'Meditation Streak Mindfulness Progress Tracker',
    slug: 'meditation-streak-mindfulness-progress-tracker',
    description: 'Build a calming mindfulness streak to support anxiety management.',
  },
  {
    name: 'Sleep Debt Calculator',
    slug: 'sleep-debt-calculator-hf',
    description: 'Estimate how much rest you are missing and its impact on recovery.',
  },
  {
    name: 'Emotional Wellbeing Index Calculator',
    slug: 'emotional-wellbeing-index-calculator',
    description: 'View anxiety in context with mood, energy, and connection.',
  },
];

const baseUrl = 'https://mycalculating.com/category/health-fitness/anxiety-level-estimator-gad7-simplified';

const schemaMarkup = {
  '@context': 'https://schema.org',
  '@graph': [
    {
      '@type': 'BreadcrumbList',
      itemListElement: [
        { '@type': 'ListItem', position: 1, name: 'Home', item: 'https://mycalculating.com' },
        { '@type': 'ListItem', position: 2, name: 'Health & Fitness', item: 'https://mycalculating.com/category/health-fitness' },
        { '@type': 'ListItem', position: 3, name: 'Anxiety Level Estimator (GAD-7 Simplified)', item: baseUrl },
      ],
    },
    {
      '@type': 'SoftwareApplication',
      name: 'Anxiety Level Estimator (GAD-7 Simplified)',
      applicationCategory: 'Calculator',
      operatingSystem: 'Web Browser',
      description: 'Estimate anxiety severity and an indexed score using a simplified GAD-7 approach plus sleep and impairment inputs.',
      url: baseUrl,
      offers: { '@type': 'Offer', price: '0', priceCurrency: 'USD' },
    },
  ],
};

const clamp = (value: number, min: number, max: number) => Math.min(max, Math.max(min, value));

const calculateResult = (values: FormValues): ResultPayload => {
  const baseFromGad = (values.gadScore / 21) * 80;
  const impairmentBoost = clamp(values.impairmentDays * 1.2, 0, 15);
  const sleepBuffer = (values.sleepQuality - 3) * 3; // better sleep lowers index, poor sleep raises it

  const anxietyIndex = clamp(Math.round(baseFromGad + impairmentBoost - sleepBuffer), 0, 100);

  let severity: ResultPayload['severity'] = 'minimal';
  let interpretation = 'Your score suggests minimal anxiety symptoms with good overall coping.';

  if (values.gadScore >= 5 && values.gadScore <= 9) {
    severity = 'mild';
    interpretation = 'Mild anxiety signs are present. Small lifestyle and coping tweaks may help.';
  }
  if (values.gadScore >= 10 && values.gadScore <= 14) {
    severity = 'moderate';
    interpretation = 'Moderate anxiety symptoms—consider structured self-help or talking with a professional.';
  }
  if (values.gadScore >= 15) {
    severity = 'severe';
    interpretation = 'High anxiety levels. Professional support can help you understand options and feel safer.';
  }

  const recommendations = [
    'Use slow diaphragmatic breathing (4–6 breaths per minute) during spikes of anxiety.',
    'Protect a consistent wind-down routine 30–60 minutes before bed to support deeper sleep.',
    'Limit doom-scrolling and news intake close to bedtime to avoid reactivating worry.',
  ];

  if (severity === 'moderate' || severity === 'severe') {
    recommendations.push('Schedule a conversation with a therapist, counselor, or primary care provider about your symptoms.');
  }
  if (values.impairmentDays >= 7) {
    recommendations.push('Note specific situations where anxiety blocks you and brainstorm one tiny step for each.');
  }

  const plan = [
    { label: 'Today', detail: 'Pick one 5-minute calming practice (breathing, walk, journaling) and test it once.' },
    { label: 'This Week', detail: 'Log your GAD-7 again and track sleep quality to see how changes shift your score.' },
    { label: 'This Month', detail: 'If scores stay moderate or severe, explore therapy, coaching, or group support options.' },
  ];

  return { anxietyIndex, severity, interpretation, recommendations, plan };
};

export default function AnxietyLevelEstimatorGAD7Simplified() {
  const [result, setResult] = useState<ResultPayload | null>(null);

  const form = useForm<FormValues>({
    resolver: zodResolver(formSchema),
    defaultValues: {
      gadScore: undefined,
      impairmentDays: undefined,
      sleepQuality: undefined,
    },
  });

  return (
    <div className="space-y-8">
      <Script id="anxiety-gad7-schema" type="application/ld+json" strategy="afterInteractive" dangerouslySetInnerHTML={{ __html: JSON.stringify(schemaMarkup) }} />

      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <HeartPulse className="h-5 w-5" />
            Anxiety Level Estimator (GAD-7 Simplified)
          </CardTitle>
          <CardDescription>Translate your GAD-7 score into an anxiety index, severity band, and next-step guidance.</CardDescription>
        </CardHeader>
      </Card>

      <Card>
        <CardHeader>
          <CardTitle>Input your scores</CardTitle>
        </CardHeader>
        <CardContent>
          <Form {...form}>
            <form onSubmit={form.handleSubmit((values) => setResult(calculateResult(values)))} className="space-y-6">
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <FormField
                  control={form.control}
                  name="gadScore"
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel>Total GAD-7 score (0–21)</FormLabel>
                      <FormControl>
                        <Input
                          type="number"
                          step="1"
                          placeholder="e.g., 9"
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
                  name="impairmentDays"
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel>Days with significant difficulty (past 2 weeks)</FormLabel>
                      <FormControl>
                        <Input
                          type="number"
                          step="1"
                          placeholder="e.g., 5"
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
                  name="sleepQuality"
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel>Average sleep quality (1–5)</FormLabel>
                      <FormControl>
                        <Input
                          type="number"
                          step="1"
                          placeholder="1 = very poor, 5 = excellent"
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
                Calculate anxiety level
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
            <CardDescription>See your anxiety index, severity band, and context in one view.</CardDescription>
          </CardHeader>
          <CardContent className="space-y-6">
            <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
              <div className="p-4 border rounded">
                <p className="text-sm text-muted-foreground">Anxiety index</p>
                <p className="text-2xl font-semibold text-primary">{result.anxietyIndex}</p>
                <p className="text-xs text-muted-foreground">Scaled 0–100</p>
              </div>
              <div className="p-4 border rounded">
                <p className="text-sm text-muted-foreground">Severity band</p>
                <p className="text-2xl font-semibold text-primary capitalize">{result.severity}</p>
                <p className="text-xs text-muted-foreground">Based on GAD-7 cutoffs</p>
              </div>
              <div className="p-4 border rounded">
                <p className="text-sm text-muted-foreground">Summary</p>
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
            <strong>Anxiety index</strong> ≈ roughly{' '}
            <span className="font-mono">
              clamp((GAD7 ÷ 21) × 80 + impairmentDays × 1.2 − (sleepQuality − 3) × 3)
            </span>{' '}
            rescaled to a 0–100 range.
          </p>
          <p>Higher GAD-7 scores and more impaired days raise the index, while better sleep quality slightly reduces it.</p>
          <p>This is a heuristic tool and does not replace personalized assessment from a qualified clinician.</p>
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
                <p className="text-sm text-muted-foreground">GAD-7 utilization</p>
                <p className="text-xl font-semibold text-primary">
                  {((form.getValues().gadScore ?? 0) / 21 * 100).toFixed(1)}%
                </p>
                <p className="text-xs text-muted-foreground">Portion of maximum possible score.</p>
              </div>
              <div className="p-4 border rounded">
                <p className="text-sm text-muted-foreground">Impairment load</p>
                <p className="text-xl font-semibold text-primary">
                  {(form.getValues().impairmentDays ?? 0)} days / 14
                </p>
                <p className="text-xs text-muted-foreground">Days with notable impact in the last 2 weeks.</p>
              </div>
              <div className="p-4 border rounded">
                <p className="text-sm text-muted-foreground">Sleep buffer</p>
                <p className="text-xl font-semibold text-primary">
                  {(form.getValues().sleepQuality ?? 0) >= 3 ? 'Protective' : 'Needs support'}
                </p>
                <p className="text-xs text-muted-foreground">Higher sleep quality can soften anxiety intensity.</p>
              </div>
            </div>
          ) : (
            <p className="text-sm text-muted-foreground">Enter your scores to reveal detailed context metrics.</p>
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
          <p>
            Anxiety is your nervous system’s alarm system—it is helpful in short bursts but draining when stuck “on” all day.
          </p>
          <p>
            Use this estimator as a quick check-in, pair it with healthy coping skills, and always reach out for professional help if
            symptoms feel unmanageable or unsafe.
          </p>
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
          <p>This Anxiety Level Estimator converts your GAD-7 total, impairment days, and sleep quality into a simple 0–100 index.</p>
          <p>It highlights severity bands, gives context-specific recommendations, and outlines a short-term action plan.</p>
          <p>Use it as a conversation starter and tracking tool rather than a standalone diagnostic decision-maker.</p>
        </CardContent>
      </Card>
    </div>
  );
}



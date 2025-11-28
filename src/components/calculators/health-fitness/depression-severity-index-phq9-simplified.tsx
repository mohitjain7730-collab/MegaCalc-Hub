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
  phqScore: z.number({ invalid_type_error: 'Enter your total PHQ-9 score' }).min(0).max(27),
  impairmentDays: z.number({ invalid_type_error: 'Enter days with difficulty' }).min(0).max(21),
  energyScore: z.number({ invalid_type_error: 'Enter energy level' }).min(1).max(5),
});

type FormValues = z.infer<typeof formSchema>;

type ResultPayload = {
  depressionIndex: number;
  severity: 'none' | 'mild' | 'moderate' | 'moderately severe' | 'severe';
  interpretation: string;
  recommendations: string[];
  plan: { label: string; detail: string }[];
};

const steps = [
  'Complete the PHQ-9 questionnaire and calculate your total score (0–27).',
  'Count days in the last 2 weeks when symptoms made it hard to work, care for home, or get along with others.',
  'Rate your average energy from 1 (exhausted) to 5 (energized).',
  'Enter your numbers to see a depression index and severity band based on common PHQ-9 cutoffs.',
  'Use the result as a prompt for self-reflection and professional conversations, not as a standalone diagnosis.',
];

const faqs = [
  {
    question: 'What does the PHQ-9 measure?',
    answer:
      'The PHQ-9 screens for depressive symptoms like low mood, loss of interest, sleep changes, and concentration difficulties over the past 2 weeks.',
  },
  {
    question: 'Is this calculator a medical device?',
    answer:
      'No. It is an educational tool that mirrors standard PHQ-9 thresholds to help you understand patterns and talk with a clinician.',
  },
  {
    question: 'How often should I check my score?',
    answer:
      'Weekly or every few weeks can highlight trends. Rapid, large changes or persistently high scores should prompt professional support.',
  },
  {
    question: 'What if I have thoughts of self-harm?',
    answer:
      'Seek immediate help from emergency services, crisis lines, or trusted professionals. This calculator is not designed for crisis management.',
  },
  {
    question: 'Why include an energy score?',
    answer:
      'Energy often reflects how depression is interacting with sleep, nutrition, physical health, and stress. It adds context to your PHQ-9 total.',
  },
  {
    question: 'Can lifestyle changes lower my index?',
    answer:
      'Consistent sleep, movement, nourishing food, and connection often support mood. Many people pair lifestyle tweaks with therapy or medication.',
  },
  {
    question: 'Should I change medication based on this?',
    answer:
      'No. Any medication decisions should be made with your prescribing clinician, using a full clinical picture rather than a single score.',
  },
  {
    question: 'Does a low score mean I am “fine”?',
    answer:
      'Not necessarily. If you still feel distressed, stuck, or unsafe, reaching out for support is valid regardless of your score.',
  },
  {
    question: 'Can I use this to track therapy progress?',
    answer:
      'Yes—many clinicians track PHQ-9 over time. Bring your scores and notes about what changed between check-ins.',
  },
  {
    question: 'What if my energy is low but PHQ-9 is mild?',
    answer:
      'Consider exploring sleep, physical health, and burnout alongside mood. The index highlights this by blending energy into the score.',
  },
];

const relatedCalculators = [
  {
    name: 'Emotional Wellbeing Index Calculator',
    slug: 'emotional-wellbeing-index-calculator',
    description: 'See how mood, stress, and connection combine into overall wellbeing.',
  },
  {
    name: 'Work Burnout Recovery Time Calculator',
    slug: 'work-burnout-recovery-time-calculator',
    description: 'Estimate decompression time after periods of intense workload.',
  },
  {
    name: 'Meditation Streak Mindfulness Progress Tracker',
    slug: 'meditation-streak-mindfulness-progress-tracker',
    description: 'Layer gentle mindfulness habits alongside professional care.',
  },
  {
    name: 'Sleep Efficiency Calculator',
    slug: 'sleep-efficiency-calculator',
    description: 'Check how much of your time in bed is spent actually sleeping.',
  },
];

const baseUrl = 'https://mycalculating.com/category/health-fitness/depression-severity-index-phq9-simplified';

const schemaMarkup = {
  '@context': 'https://schema.org',
  '@graph': [
    {
      '@type': 'BreadcrumbList',
      itemListElement: [
        { '@type': 'ListItem', position: 1, name: 'Home', item: 'https://mycalculating.com' },
        { '@type': 'ListItem', position: 2, name: 'Health & Fitness', item: 'https://mycalculating.com/category/health-fitness' },
        { '@type': 'ListItem', position: 3, name: 'Depression Severity Index (PHQ-9 Simplified)', item: baseUrl },
      ],
    },
    {
      '@type': 'SoftwareApplication',
      name: 'Depression Severity Index (PHQ-9 Simplified)',
      applicationCategory: 'Calculator',
      operatingSystem: 'Web Browser',
      description: 'Estimate depression severity and an indexed score using a simplified PHQ-9 plus impairment and energy inputs.',
      url: baseUrl,
      offers: { '@type': 'Offer', price: '0', priceCurrency: 'USD' },
    },
  ],
};

const clamp = (value: number, min: number, max: number) => Math.min(max, Math.max(min, value));

const calculateResult = (values: FormValues): ResultPayload => {
  const baseFromPhq = (values.phqScore / 27) * 85;
  const impairmentBoost = clamp(values.impairmentDays * 1.5, 0, 20);
  const energyBuffer = (values.energyScore - 3) * 3;

  const depressionIndex = clamp(Math.round(baseFromPhq + impairmentBoost - energyBuffer), 0, 100);

  let severity: ResultPayload['severity'] = 'none';
  let interpretation = 'Current scores suggest little to no depressive symptom burden.';

  if (values.phqScore >= 5 && values.phqScore <= 9) {
    severity = 'mild';
    interpretation = 'Mild symptoms are present. Lifestyle adjustments and early coping skills may be helpful.';
  }
  if (values.phqScore >= 10 && values.phqScore <= 14) {
    severity = 'moderate';
    interpretation = 'Moderate symptoms—discuss with a clinician and consider structured therapy or guided self-help.';
  }
  if (values.phqScore >= 15 && values.phqScore <= 19) {
    severity = 'moderately severe';
    interpretation =
      'Symptoms are moderately severe. Professional assessment is recommended to explore therapy, medication, or both.';
  }
  if (values.phqScore >= 20) {
    severity = 'severe';
    interpretation =
      'Scores are in the severe range. Prompt professional support is important, especially if safety concerns are present.';
  }

  const recommendations = [
    'Track basic rhythms—wake time, meals, and movement—to rebuild gentle structure.',
    'Schedule at least one small, enjoyable activity daily, even if motivation feels low.',
    'Reach out to a trusted person and share one specific way they could support you this week.',
  ];

  if (severity === 'moderate' || severity === 'moderately severe' || severity === 'severe') {
    recommendations.push('Contact a mental health professional or primary care clinician to review treatment options.');
  }
  if (values.energyScore <= 2) {
    recommendations.push('Ask your clinician about medical causes of low energy (thyroid, anemia, sleep issues) as well as mood.');
  }

  const plan = [
    { label: 'Today', detail: 'Note one small win and one small worry; bring both to your next support conversation.' },
    { label: 'This Week', detail: 'Experiment with a 10–15 minute daily walk or gentle movement block.' },
    {
      label: 'This Month',
      detail: 'Retest your PHQ-9, track trends, and review changes with a professional or support person.',
    },
  ];

  return { depressionIndex, severity, interpretation, recommendations, plan };
};

export default function DepressionSeverityIndexPHQ9Simplified() {
  const [result, setResult] = useState<ResultPayload | null>(null);

  const form = useForm<FormValues>({
    resolver: zodResolver(formSchema),
    defaultValues: {
      phqScore: undefined,
      impairmentDays: undefined,
      energyScore: undefined,
    },
  });

  return (
    <div className="space-y-8">
      <Script id="depression-phq9-schema" type="application/ld+json" strategy="afterInteractive" dangerouslySetInnerHTML={{ __html: JSON.stringify(schemaMarkup) }} />

      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <HeartPulse className="h-5 w-5" />
            Depression Severity Index (PHQ-9 Simplified)
          </CardTitle>
          <CardDescription>Convert your PHQ-9 score into a clear severity index with context and suggestions.</CardDescription>
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
                  name="phqScore"
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel>Total PHQ-9 score (0–27)</FormLabel>
                      <FormControl>
                        <Input
                          type="number"
                          step="1"
                          placeholder="e.g., 11"
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
                          placeholder="e.g., 7"
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
                  name="energyScore"
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel>Average energy (1–5)</FormLabel>
                      <FormControl>
                        <Input
                          type="number"
                          step="1"
                          placeholder="1 = very low, 5 = strong"
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
                Calculate depression index
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
            <CardDescription>Review your index, severity band, and qualitative explanation.</CardDescription>
          </CardHeader>
          <CardContent className="space-y-6">
            <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
              <div className="p-4 border rounded">
                <p className="text-sm text-muted-foreground">Depression index</p>
                <p className="text-2xl font-semibold text-primary">{result.depressionIndex}</p>
                <p className="text-xs text-muted-foreground">Scaled 0–100</p>
              </div>
              <div className="p-4 border rounded">
                <p className="text-sm text-muted-foreground">Severity band</p>
                <p className="text-2xl font-semibold text-primary capitalize">{result.severity}</p>
                <p className="text-xs text-muted-foreground">Based on standard PHQ-9 cutoffs.</p>
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
            <strong>Depression index</strong> ≈ roughly{' '}
            <span className="font-mono">
              clamp((PHQ9 ÷ 27) × 85 + impairmentDays × 1.5 − (energyScore − 3) × 3)
            </span>{' '}
            rescaled to a 0–100 range.
          </p>
          <p>Higher PHQ-9 totals and more impaired days raise the index, while higher energy slightly lowers it.</p>
          <p>The index is a heuristic and should always be interpreted with professional guidance when possible.</p>
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
                <p className="text-sm text-muted-foreground">PHQ-9 utilization</p>
                <p className="text-xl font-semibold text-primary">
                  {((form.getValues().phqScore ?? 0) / 27 * 100).toFixed(1)}%
                </p>
                <p className="text-xs text-muted-foreground">Portion of maximum score used.</p>
              </div>
              <div className="p-4 border rounded">
                <p className="text-sm text-muted-foreground">Impairment load</p>
                <p className="text-xl font-semibold text-primary">
                  {(form.getValues().impairmentDays ?? 0)} days / 14
                </p>
                <p className="text-xs text-muted-foreground">Days where functioning felt clearly affected.</p>
              </div>
              <div className="p-4 border rounded">
                <p className="text-sm text-muted-foreground">Energy buffer</p>
                <p className="text-xl font-semibold text-primary">
                  {(form.getValues().energyScore ?? 0) >= 3 ? 'Some reserve' : 'Fragile'}
                </p>
                <p className="text-xs text-muted-foreground">Lower energy often calls for extra rest and support.</p>
              </div>
            </div>
          ) : (
            <p className="text-sm text-muted-foreground">Enter your snapshot to unlock supporting context metrics.</p>
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
          <p>Depression affects sleep, energy, thinking, and relationships in overlapping ways.</p>
          <p>
            Use this index to notice trends early, pair it with compassionate support, and always seek urgent help if you feel at risk of
            harming yourself or others.
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
          <p>
            This Depression Severity Index blends your PHQ-9 total, functioning impact, and energy into a simple 0–100 scale with clear
            bands.
          </p>
          <p>It provides narrative context, recommendations, and action steps you can bring into care conversations.</p>
          <p>It is a tracking and discussion tool—not a replacement for full clinical assessment or crisis support.</p>
        </CardContent>
      </Card>
    </div>
  );
}



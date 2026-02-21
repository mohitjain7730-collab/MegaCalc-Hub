'use client';

import { useState } from 'react';
import Script from 'next/script';
import Link from 'next/link';
import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import { z } from 'zod';
import { Brain, Zap, Target, Activity, Shield } from 'lucide-react';

import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Form, FormControl, FormField, FormItem, FormLabel, FormMessage } from '@/components/ui/form';
import { Input } from '@/components/ui/input';

const formSchema = z.object({
  positiveThoughts: z.number({ invalid_type_error: 'Enter positive thoughts count' }).min(0).max(1000),
  negativeThoughts: z.number({ invalid_type_error: 'Enter negative thoughts count' }).min(0).max(1000),
  thoughtRatio: z.number({ invalid_type_error: 'Enter thought ratio' }).min(0).max(10).optional(),
  moodLevel: z.number({ invalid_type_error: 'Enter mood level' }).min(1).max(10),
});

type FormValues = z.infer<typeof formSchema>;

type ResultPayload = {
  thoughtRatio: number;
  positivePercentage: number;
  negativePercentage: number;
  ratioScore: number;
  status: 'optimal' | 'good' | 'moderate' | 'low';
  interpretation: string;
  recommendations: string[];
  plan: { label: string; detail: string }[];
};

const steps = [
  'Enter count of positive thoughts per day (from journal or mental note).',
  'Enter count of negative thoughts per day (from journal or mental note).',
  'Optionally enter thought ratio if calculated (positive/negative).',
  'Rate overall mood level (1 = poor, 10 = excellent).',
  'Review thought ratio, percentages, and recommendations.',
];

const faqs = [
  {
    question: 'What is thought ratio?',
    answer:
      'Thought ratio compares positive to negative thoughts. A higher ratio (more positive thoughts) is generally associated with better mental health, mood, and resilience.',
  },
  {
    question: 'What is a healthy thought ratio?',
    answer:
      'Research suggests a ratio of 3:1 or higher (three positive thoughts for every negative thought) is associated with better wellbeing. Some studies recommend 5:1 for optimal mental health.',
  },
  {
    question: 'How do I track my thoughts?',
    answer:
      'Keep a thought journal, use mindfulness apps, or practice cognitive awareness. Note positive and negative thoughts throughout the day to calculate your ratio.',
  },
  {
    question: 'What happens if I have a low ratio?',
    answer:
      'A low ratio (more negative than positive thoughts) can contribute to anxiety, depression, and poor mental health. Cognitive behavioral techniques can help improve the ratio.',
  },
  {
    question: 'How can I increase positive thoughts?',
    answer:
      'Practice gratitude, reframe negative thoughts, engage in positive activities, surround yourself with positive people, and use affirmations to shift your thinking patterns.',
  },
  {
    question: 'Does mood affect thought ratio?',
    answer:
      'Yes. Mood and thought ratio are interconnected. Low mood can increase negative thoughts, while improving thought patterns can enhance mood. Both influence each other.',
  },
  {
    question: 'What about cognitive distortions?',
    answer:
      'Cognitive distortions (all-or-nothing thinking, catastrophizing) can skew thought ratios. Cognitive behavioral therapy helps identify and reframe these patterns.',
  },
  {
    question: 'Can I track thought ratio over time?',
    answer:
      'Yes. Regular tracking helps identify patterns, triggers, and improvements. Many mental health apps and journals can help track thought ratios over weeks or months.',
  },
  {
    question: 'Does meditation affect thought ratio?',
    answer:
      'Yes. Regular meditation and mindfulness practices can increase awareness of thoughts, reduce negative thinking patterns, and promote more balanced or positive thought ratios.',
  },
  {
    question: 'What is the relationship with mental health?',
    answer:
      'Thought ratio is a useful indicator of mental health. Consistently low ratios may indicate depression or anxiety, while improving ratios often correlate with better mental wellbeing.',
  },
];

const relatedCalculators = [
  {
    name: 'Emotional Wellbeing Index Calculator',
    slug: 'emotional-wellbeing-index-calculator',
    description: 'Measure emotional wellbeing alongside thought patterns.',
  },
  {
    name: 'Resilience Score Calculator',
    slug: 'resilience-score-calculator',
    description: 'Assess resilience related to thought patterns.',
  },
  {
    name: 'Meditation Streak Mindfulness Progress Tracker',
    slug: 'meditation-streak-mindfulness-progress-tracker',
    description: 'Build mindfulness to improve thought awareness.',
  },
  {
    name: 'Stress Hormone Balance Calculator (Cortisol vs Melatonin)',
    slug: 'stress-hormone-balance-calculator',
    description: 'Track stress levels that affect thought patterns.',
  },
];

const baseUrl = 'https://mycalculating.com/category/health-fitness/positive-vs-negative-thought-ratio-calculator';

const schemaMarkup = {
  '@context': 'https://schema.org',
  '@graph': [
    {
      '@type': 'BreadcrumbList',
      itemListElement: [
        { '@type': 'ListItem', position: 1, name: 'Home', item: 'https://mycalculating.com' },
        { '@type': 'ListItem', position: 2, name: 'Health & Fitness', item: 'https://mycalculating.com/category/health-fitness' },
        { '@type': 'ListItem', position: 3, name: 'Positive vs Negative Thought Ratio Wellness Calculator', item: baseUrl },
      ],
    },
    {
      '@type': 'SoftwareApplication',
      name: 'Positive vs Negative Thought Ratio Wellness Calculator',
      applicationCategory: 'Calculator',
      operatingSystem: 'Web Browser',
      description: 'Calculate positive vs negative thought ratio from thought counts, ratio, and mood level.',
      url: baseUrl,
      offers: { '@type': 'Offer', price: '0', priceCurrency: 'USD' },
    },
  ],
};

const clamp = (value: number, min: number, max: number) => Math.min(max, Math.max(min, value));

const calculateResult = (values: FormValues): ResultPayload => {
  let thoughtRatio: number;
  
  if (values.thoughtRatio) {
    // Use provided ratio
    thoughtRatio = values.thoughtRatio;
  } else {
    // Calculate from counts
    if (values.negativeThoughts === 0) {
      thoughtRatio = values.positiveThoughts > 0 ? 10 : 0;
    } else {
      thoughtRatio = values.positiveThoughts / values.negativeThoughts;
    }
  }
  
  const totalThoughts = values.positiveThoughts + values.negativeThoughts;
  const positivePercentage = totalThoughts > 0 ? (values.positiveThoughts / totalThoughts) * 100 : 0;
  const negativePercentage = totalThoughts > 0 ? (values.negativeThoughts / totalThoughts) * 100 : 0;
  const ratioScore = clamp(thoughtRatio * 10, 0, 100);

  let status: ResultPayload['status'] = 'optimal';
  let interpretation = 'This suggests a general lifestyle tendency where your thought ratio may appear optimal. You may consider continuing to maintain positive thinking patterns.';

  if (thoughtRatio < 1) {
    status = 'low';
    interpretation = 'This suggests a general lifestyle tendency where your thought ratio may be low (more negative than positive thoughts). You may consider focusing on cognitive reframing and positive thinking techniques.';
  } else if (thoughtRatio < 2) {
    status = 'moderate';
    interpretation = 'This suggests a general lifestyle tendency where your thought ratio may be moderate. You may consider increasing positive thoughts, which may improve mental wellbeing and mood.';
  } else if (thoughtRatio < 3) {
    status = 'good';
    interpretation = 'This suggests a general lifestyle tendency where your thought ratio may be good. Minor improvements may optimize mental health and resilience.';
  }

  const recommendations = [
    'Practice daily gratitude journaling to increase positive thoughts and shift focus to positive aspects of life.',
    'Use cognitive reframing techniques to challenge negative thoughts and find balanced or positive perspectives.',
    'Engage in activities that bring joy and positive emotions to naturally increase positive thought frequency.',
  ];
  if (status === 'low' || status === 'moderate') {
    recommendations.push('You may consider cognitive behavioral therapy (CBT) techniques or professional guidance to address negative thinking patterns. This is a personal insight, not a medical evaluation.');
  }
  if (values.moodLevel < 6) {
    recommendations.push('You may consider addressing mood patterns. Low mood may perpetuate negative thoughts, while improving mood may enhance positive thinking.');
  }

  const plan = [
    { label: 'This Week', detail: 'Track positive and negative thoughts daily using a journal or app. Calculate your baseline thought ratio.' },
    { label: 'This Month', detail: 'Implement positive thinking practices: gratitude, reframing, positive activities, and mindfulness meditation.' },
    { label: 'Ongoing', detail: 'Monitor thought ratio trends. If consistently low, consider professional mental health support to develop cognitive strategies.' },
  ];

  return { thoughtRatio, positivePercentage, negativePercentage, ratioScore, status, interpretation, recommendations, plan };
};

export default function PositiveVsNegativeThoughtRatioCalculator() {
  const [result, setResult] = useState<ResultPayload | null>(null);

  const form = useForm<FormValues>({
    resolver: zodResolver(formSchema),
    defaultValues: {
      positiveThoughts: undefined,
      negativeThoughts: undefined,
      thoughtRatio: undefined,
      moodLevel: undefined,
    },
  });

  return (
    <div className="space-y-8">
      <Script id="thought-ratio-schema" type="application/ld+json" strategy="afterInteractive" dangerouslySetInnerHTML={{ __html: JSON.stringify(schemaMarkup) }} />

      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <Brain className="h-5 w-5" />
            Positive vs Negative Thought Ratio Wellness Calculator
          </CardTitle>
          <CardDescription>Calculate positive vs negative thought ratio from thought counts, ratio, and mood level.</CardDescription>
        </CardHeader>
      </Card>

      <Card>
        <CardHeader>
          <CardTitle>Input your thought data</CardTitle>
        </CardHeader>
        <CardContent>
          <Form {...form}>
            <form onSubmit={form.handleSubmit((values) => setResult(calculateResult(values)))} className="space-y-6">
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <FormField
                  control={form.control}
                  name="positiveThoughts"
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel>Positive thoughts count</FormLabel>
                      <FormControl>
                        <Input type="number" step="1" placeholder="e.g., 30" value={field.value ?? ''} onChange={(e) => field.onChange(e.target.value === '' ? undefined : Number(e.target.value))} />
                      </FormControl>
                      <FormMessage />
                    </FormItem>
                  )}
                />
                <FormField
                  control={form.control}
                  name="negativeThoughts"
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel>Negative thoughts count</FormLabel>
                      <FormControl>
                        <Input type="number" step="1" placeholder="e.g., 10" value={field.value ?? ''} onChange={(e) => field.onChange(e.target.value === '' ? undefined : Number(e.target.value))} />
                      </FormControl>
                      <FormMessage />
                    </FormItem>
                  )}
                />
                <FormField
                  control={form.control}
                  name="thoughtRatio"
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel>Thought ratio (optional)</FormLabel>
                      <FormControl>
                        <Input type="number" step="0.1" placeholder="e.g., 3.0" value={field.value ?? ''} onChange={(e) => field.onChange(e.target.value === '' ? undefined : Number(e.target.value))} />
                      </FormControl>
                      <FormMessage />
                    </FormItem>
                  )}
                />
                <FormField
                  control={form.control}
                  name="moodLevel"
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel>Mood level (1-10)</FormLabel>
                      <FormControl>
                        <Input type="number" step="1" placeholder="e.g., 7" value={field.value ?? ''} onChange={(e) => field.onChange(e.target.value === '' ? undefined : Number(e.target.value))} />
                      </FormControl>
                      <FormMessage />
                    </FormItem>
                  )}
                />
              </div>
              <Button type="submit" className="w-full md:w-auto">
                Calculate thought ratio
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
            <CardDescription>See thought ratio, percentages, and recommendations.</CardDescription>
          </CardHeader>
          <CardContent className="space-y-6">
            <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
              <div className="p-4 border rounded">
                <p className="text-sm text-muted-foreground">Thought ratio</p>
                <p className="text-2xl font-semibold text-primary">{result.thoughtRatio.toFixed(2)}</p>
                <p className="text-xs text-muted-foreground">Positive:Negative</p>
              </div>
              <div className="p-4 border rounded">
                <p className="text-sm text-muted-foreground">Positive percentage</p>
                <p className="text-2xl font-semibold text-primary">{result.positivePercentage.toFixed(1)}%</p>
                <p className="text-xs text-muted-foreground">Of total thoughts</p>
              </div>
              <div className="p-4 border rounded">
                <p className="text-sm text-muted-foreground">Negative percentage</p>
                <p className="text-2xl font-semibold text-primary">{result.negativePercentage.toFixed(1)}%</p>
                <p className="text-xs text-muted-foreground">Of total thoughts</p>
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
            <strong>Thought ratio</strong> = positive thoughts / negative thoughts.
          </p>
          <p>
            <strong>If ratio not provided</strong>: Calculated from positive and negative thought counts.
          </p>
          <p>
            <strong>Target ratio</strong>: 3:1 or higher (three positive thoughts for every negative thought) is associated with better mental health. Optimal ratio is 5:1.
          </p>
          <p>Thought ratio is affected by mood, stress, cognitive patterns, and mental health conditions.</p>
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
                <p className="text-sm text-muted-foreground">Target ratio</p>
                <p className="text-xl font-semibold text-primary">3:1 to 5:1</p>
                <p className="text-xs text-muted-foreground">Recommended range</p>
              </div>
              <div className="p-4 border rounded">
                <p className="text-sm text-muted-foreground">Ratio vs target</p>
                <p className="text-xl font-semibold text-primary">
                  {(() => {
                    const target = 3;
                    const diff = result.thoughtRatio - target;
                    return diff >= 0 ? `+${diff.toFixed(2)}` : `${diff.toFixed(2)}`;
                  })()}
                </p>
                <p className="text-xs text-muted-foreground">Difference from target</p>
              </div>
              <div className="p-4 border rounded">
                <p className="text-sm text-muted-foreground">Ratio score</p>
                <p className="text-xl font-semibold text-primary">{result.ratioScore.toFixed(0)}</p>
                <p className="text-xs text-muted-foreground">Out of 100</p>
              </div>
            </div>
          ) : (
            <p className="text-sm text-muted-foreground">Enter your thought data to see additional insights.</p>
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
          <p>Thought ratio compares positive to negative thoughts and is associated with mental health and wellbeing. A ratio of 3:1 or higher (three positive thoughts for every negative thought) is generally recommended for better mental health.</p>
          <p>Use this calculator to assess positive vs negative thought ratio from thought counts, ratio (if calculated), and mood level.</p>
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
          <p>This tool provides general wellness insights about positive vs negative thought ratio from positive thought count, negative thought count, thought ratio (optional), and mood level. This is a personal lifestyle insight, not a medical evaluation.</p>
          <p>Outputs include thought ratio, positive percentage, negative percentage, ratio score, status, recommendations, an action plan, and supporting metrics.</p>
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


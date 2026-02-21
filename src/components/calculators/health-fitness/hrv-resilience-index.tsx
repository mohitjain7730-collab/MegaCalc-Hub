'use client';

import { useState } from 'react';
import Script from 'next/script';
import Link from 'next/link';
import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import { z } from 'zod';
import { Activity, Zap, Target, AlertTriangle, Shield } from 'lucide-react';

import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Form, FormControl, FormField, FormItem, FormLabel, FormMessage } from '@/components/ui/form';
import { Input } from '@/components/ui/input';

const formSchema = z.object({
  avgRMSSD: z.number({ invalid_type_error: 'Enter RMSSD' }).min(5).max(200),
  hrvTrendChange: z.number({ invalid_type_error: 'Enter trend' }).min(-50).max(50),
  restingHeartRate: z.number({ invalid_type_error: 'Enter RHR' }).min(35).max(110),
  sleepQualityScore: z.number({ invalid_type_error: 'Enter sleep score' }).min(0).max(10),
});

type FormValues = z.infer<typeof formSchema>;

type ResultPayload = {
  avgRMSSD: number;
  hrvTrendChange: number;
  restingHeartRate: number;
  sleepQualityScore: number;
  resilienceIndex: number;
  recoveryReadinessScore: number;
  status: 'optimal' | 'good' | 'moderate' | 'low';
  interpretation: string;
  recommendations: string[];
  plan: { label: string; detail: string }[];
};

const steps = [
  'Enter your average RMSSD HRV value (ms) over the last 7–30 days.',
  'Enter the % change in HRV trend (e.g., +5 or -10) compared to your longer-term baseline.',
  'Enter your current resting heart rate (bpm).',
  'Rate your recent sleep quality on a 0–10 scale.',
  'Review your HRV Resilience Index and recovery readiness score.',
];

const faqs = [
  {
    question: 'What is HRV?',
    answer:
      'Heart rate variability (HRV) measures variation between heartbeats. Higher HRV, especially RMSSD, is often associated with greater parasympathetic (rest-and-digest) activity and resilience.',
  },
  {
    question: 'What is RMSSD?',
    answer:
      'Root Mean Square of Successive Differences (RMSSD) is a common HRV metric that reflects short-term beat-to-beat variability, often used for recovery monitoring.',
  },
  {
    question: 'Does higher HRV always mean healthier?',
    answer:
      'Generally, higher HRV within your personal context is favorable, but extremely high or low values, or sudden changes, can reflect illness, overtraining, or other issues.',
  },
  {
    question: 'Why include trend change and resting heart rate?',
    answer:
      'Trends over time and RHR context help distinguish between temporary dips and more concerning patterns.',
  },
  {
    question: 'Can I compare my HRV to others?',
    answer:
      'HRV is highly individual. It is usually more meaningful to compare your HRV to your own long-term baseline.',
  },
  {
    question: 'What factors influence HRV?',
    answer:
      'Sleep, stress, illness, alcohol, exercise load, breathing patterns, and even time of day all impact HRV.',
  },
  {
    question: 'Is this tool diagnostic?',
    answer:
      'No. It is a self-monitoring aid and cannot diagnose heart or nervous system conditions.',
  },
  {
    question: 'Should I change training solely based on this?',
    answer:
      'Use the index as one signal among many (mood, soreness, performance, clinician advice) when adjusting training.',
  },
  {
    question: 'What if my HRV is chronically low?',
    answer:
      'You may benefit from improving sleep, reducing stress, managing training load, and consulting a healthcare professional.',
  },
  {
    question: 'Can breathwork improve HRV?',
    answer:
      'Slow, diaphragmatic breathing and relaxation practices can acutely increase HRV in many people.',
  },
];

const relatedCalculators = [
  {
    name: 'Mental Energy Drain Predictor',
    slug: 'mental-energy-drain-predictor',
    description: 'Estimate workload-driven mental fatigue alongside HRV.',
  },
  {
    name: 'Sleep Optimization Routine Score',
    slug: 'sleep-optimization-routine-score',
    description: 'Evaluate bedtime habits that influence HRV.',
  },
  {
    name: 'Stress Hormone Balance Calculator',
    slug: 'stress-hormone-balance-calculator',
    description: 'Explore hormonal stress markers in context.',
  },
  {
    name: 'Circadian Rhythm Alignment Score',
    slug: 'circadian-rhythm-alignment-score',
    description: 'Assess how well your schedule matches your body clock.',
  },
];

const baseUrl = 'https://mycalculating.com/category/health-fitness/hrv-resilience-index';

const schemaMarkup = {
  '@context': 'https://schema.org',
  '@graph': [
    {
      '@type': 'BreadcrumbList',
      itemListElement: [
        { '@type': 'ListItem', position: 1, name: 'Home', item: 'https://mycalculating.com' },
        { '@type': 'ListItem', position: 2, name: 'Health & Fitness', item: 'https://mycalculating.com/category/health-fitness' },
        { '@type': 'ListItem', position: 3, name: 'HRV (Heart Rate Variability) Resilience Index', item: baseUrl },
      ],
    },
    {
      '@type': 'SoftwareApplication',
      name: 'HRV Resilience Index',
      applicationCategory: 'Calculator',
      operatingSystem: 'Web Browser',
      description: 'Estimate an HRV resilience index and recovery readiness score from RMSSD, trends, RHR, and sleep quality.',
      url: baseUrl,
      offers: { '@type': 'Offer', price: '0', priceCurrency: 'USD' },
    },
  ],
};

const clamp = (value: number, min: number, max: number) => Math.min(max, Math.max(min, value));

const calculateResult = (values: FormValues): ResultPayload => {
  const { avgRMSSD, hrvTrendChange, restingHeartRate, sleepQualityScore } = values;

  const baselineScore = clamp((avgRMSSD / 80) * 50, 0, 50); // 80ms reference
  const trendScore = clamp((hrvTrendChange / 20) * 20 + 10, 0, 20); // trend from -50 to +50
  const rhrPenalty = clamp((restingHeartRate - 60) / 20 * 15, -10, 25);
  const sleepScore = clamp((sleepQualityScore / 10) * 25, 0, 25);

  const rawResilience = baselineScore + trendScore + sleepScore - rhrPenalty;
  const resilienceIndex = clamp(rawResilience, 0, 100);

  const recoveryReadinessScore = clamp(
    (baselineScore + trendScore + sleepScore * 1.2 - rhrPenalty * 1.2),
    0,
    100,
  );

  let status: ResultPayload['status'] = 'good';
  let interpretation = 'Your HRV pattern suggests reasonable resilience and recovery capacity relative to this heuristic model.';

  if (resilienceIndex >= 80 && hrvTrendChange >= 0) {
    status = 'optimal';
    interpretation = 'You report a strong HRV profile with stable or improving trends and supportive sleep patterns.';
  } else if (resilienceIndex < 50 || hrvTrendChange <= -10) {
    status = 'moderate';
    interpretation = 'HRV resilience appears somewhat reduced, or trends are declining. Consider reducing load and improving recovery fundamentals.';
  } else if (resilienceIndex < 35 || hrvTrendChange <= -20) {
    status = 'low';
    interpretation = 'Your data suggests low resilience or significant HRV decline. Consult a clinician, especially if you feel unwell.';
  }

  const recommendations: string[] = [
    'Prioritize consistent, high-quality sleep and reduce late-night screens where possible.',
    'Balance training and stress: mix hard days with true recovery days.',
    'Use breathing exercises, relaxation, or mindfulness to support parasympathetic activity.',
  ];

  if (hrvTrendChange < 0) {
    recommendations.push('Because your HRV trend is down, consider reducing intensity or volume of training temporarily and monitoring symptoms.');
  }

  if (restingHeartRate > 70) {
    recommendations.push('Discuss persistently elevated resting heart rate with a clinician, especially if combined with low HRV or symptoms.');
  }

  if (sleepQualityScore < 6) {
    recommendations.push('Improve sleep hygiene (dark, cool room, regular schedule) and address caffeine or alcohol timing.');
  }

  const plan = [
    { label: 'This Week', detail: 'Track daily HRV, RHR, and sleep notes to understand how behaviors affect your readings.' },
    { label: 'This Month', detail: 'Adjust training and stress-management practices based on recurring HRV patterns rather than single spikes.' },
    { label: 'Ongoing', detail: 'Reassess resilience before and after intense training blocks, travel, or major life events.' },
  ];

  return {
    avgRMSSD,
    hrvTrendChange,
    restingHeartRate,
    sleepQualityScore,
    resilienceIndex: Number(resilienceIndex.toFixed(1)),
    recoveryReadinessScore: Number(recoveryReadinessScore.toFixed(1)),
    status,
    interpretation,
    recommendations,
    plan,
  };
};

export default function HRVResilienceIndex() {
  const [result, setResult] = useState<ResultPayload | null>(null);

  const form = useForm<FormValues>({
    resolver: zodResolver(formSchema),
    defaultValues: {
      avgRMSSD: undefined,
      hrvTrendChange: undefined,
      restingHeartRate: undefined,
      sleepQualityScore: undefined,
    },
  });

  return (
    <div className="space-y-8">
      <Script id="hrv-resilience-index-schema" type="application/ld+json" strategy="afterInteractive" dangerouslySetInnerHTML={{ __html: JSON.stringify(schemaMarkup) }} />

      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <Activity className="h-5 w-5" />
            HRV (Heart Rate Variability) Resilience Index
          </CardTitle>
          <CardDescription>Estimate nervous-system resilience and recovery readiness from HRV metrics.</CardDescription>
        </CardHeader>
      </Card>

      <Card>
        <CardHeader>
          <CardTitle>Input your HRV data</CardTitle>
        </CardHeader>
        <CardContent>
          <Form {...form}>
            <form onSubmit={form.handleSubmit((values) => setResult(calculateResult(values)))} className="space-y-6">
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <FormField
                  control={form.control}
                  name="avgRMSSD"
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel>Average RMSSD (ms)</FormLabel>
                      <FormControl>
                        <Input type="number" step="1" placeholder="e.g., 60" value={field.value ?? ''} onChange={(e) => field.onChange(e.target.value === '' ? undefined : Number(e.target.value))} />
                      </FormControl>
                      <FormMessage />
                    </FormItem>
                  )}
                />
                <FormField
                  control={form.control}
                  name="hrvTrendChange"
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel>HRV trend change vs baseline (%)</FormLabel>
                      <FormControl>
                        <Input type="number" step="1" placeholder="e.g., 5 or -10" value={field.value ?? ''} onChange={(e) => field.onChange(e.target.value === '' ? undefined : Number(e.target.value))} />
                      </FormControl>
                      <FormMessage />
                    </FormItem>
                  )}
                />
                <FormField
                  control={form.control}
                  name="restingHeartRate"
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel>Resting heart rate (bpm)</FormLabel>
                      <FormControl>
                        <Input type="number" step="1" placeholder="e.g., 58" value={field.value ?? ''} onChange={(e) => field.onChange(e.target.value === '' ? undefined : Number(e.target.value))} />
                      </FormControl>
                      <FormMessage />
                    </FormItem>
                  )}
                />
                <FormField
                  control={form.control}
                  name="sleepQualityScore"
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel>Sleep quality (0–10)</FormLabel>
                      <FormControl>
                        <Input type="number" step="0.5" placeholder="e.g., 7.5" value={field.value ?? ''} onChange={(e) => field.onChange(e.target.value === '' ? undefined : Number(e.target.value))} />
                      </FormControl>
                      <FormMessage />
                    </FormItem>
                  )}
                />
              </div>
              <Button type="submit" className="w-full md:w-auto">
                Calculate HRV resilience index
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
            <CardDescription>See resilience index, recovery readiness, and coaching prompts.</CardDescription>
          </CardHeader>
          <CardContent className="space-y-6">
            <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
              <div className="p-4 border rounded">
                <p className="text-sm text-muted-foreground">Resilience index</p>
                <p className="text-2xl font-semibold text-primary">{result.resilienceIndex}</p>
                <p className="text-xs text-muted-foreground">0–100 scale</p>
              </div>
              <div className="p-4 border rounded">
                <p className="text-sm text-muted-foreground">Recovery readiness</p>
                <p className="text-2xl font-semibold text-primary">{result.recoveryReadinessScore}</p>
                <p className="text-xs text-muted-foreground">Higher = more ready</p>
              </div>
              <div className="p-4 border rounded">
                <p className="text-sm text-muted-foreground">Trend change</p>
                <p className="text-2xl font-semibold text-primary">{result.hrvTrendChange}%</p>
                <p className="text-xs text-muted-foreground">vs. baseline</p>
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
            <strong>Baseline component</strong> scales average RMSSD relative to a reference (around 80 ms) to reflect general parasympathetic tone.
          </p>
          <p>
            <strong>Trend component</strong> rewards improving HRV and penalizes declines, emphasizing direction over time.
          </p>
          <p>
            <strong>RHR penalty</strong> subtracts points when resting heart rate is meaningfully above 60 bpm, which may signal higher stress or lower fitness.
          </p>
          <p>
            <strong>Resilience index</strong> combines all components and clamps them to 0–100 for easy interpretation; the recovery readiness variant slightly boosts sleep and penalizes high RHR.
          </p>
          <p>This model is informational only; it cannot diagnose disease or replace professional HRV interpretation.</p>
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
                <p className="text-sm text-muted-foreground">HRV relative to 80 ms</p>
                <p className="text-xl font-semibold text-primary">
                  {(result.avgRMSSD / 80 * 100).toFixed(0)}%
                </p>
                <p className="text-xs text-muted-foreground">Personal context still matters</p>
              </div>
              <div className="p-4 border rounded">
                <p className="text-sm text-muted-foreground">RHR above 60</p>
                <p className="text-xl font-semibold text-primary">
                  {Math.max(0, result.restingHeartRate - 60).toFixed(1)}
                </p>
                <p className="text-xs text-muted-foreground">Bpm above baseline reference</p>
              </div>
              <div className="p-4 border rounded">
                <p className="text-sm text-muted-foreground">Sleep support</p>
                <p className="text-xl font-semibold text-primary">
                  {(result.sleepQualityScore / 10 * 100).toFixed(0)}%
                </p>
                <p className="text-xs text-muted-foreground">Of maximum score</p>
              </div>
            </div>
          ) : (
            <p className="text-sm text-muted-foreground">Enter your HRV data to see additional metrics.</p>
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

      <section
        className="space-y-6 text-muted-foreground leading-relaxed bg-white p-6 md:p-10 rounded-lg shadow-lg"
        itemScope
        itemType="https://schema.org/MedicalWebPage"
      >
        <meta
          itemProp="name"
          content="HRV Resilience: Interpreting Heart Rate Variability for Recovery and Stress"
        />
        <meta
          itemProp="description"
          content="Learn how HRV reflects nervous-system resilience, how to track it responsibly, and how to combine HRV data with sleep and training decisions."
        />
        <meta
          itemProp="keywords"
          content="HRV resilience index, RMSSD interpretation, heart rate variability recovery, HRV and stress, HRV readiness score"
        />
        <meta itemProp="author" content="[Your Site's Health Team]" />
        <meta itemProp="datePublished" content="2025-12-01" />
        <meta itemProp="url" content="/definitive-hrv-resilience-guide" />

        <h1 className="text-3xl md:text-4xl font-extrabold text-foreground mb-4" itemProp="headline">
          HRV Resilience: Using Heart Rate Variability as One Lens on Stress and Recovery
        </h1>
        <p className="text-lg italic text-gray-700">
          Heart rate variability offers a fascinating window into how your nervous system responds to life. This guide shows you how to use HRV trends thoughtfully rather than obsess over single numbers.
        </p>

        <h2 className="text-2xl font-bold text-foreground mt-8 mb-4">1. What HRV Can—and Cannot—Tell You</h2>
        <p>
          HRV reflects the tug-of-war between sympathetic (fight-or-flight) and parasympathetic (rest-and-digest) branches of the autonomic nervous system. Higher values often mean more flexibility and resilience, but HRV alone
          cannot diagnose heart disease or mental health conditions.
        </p>

        <h2 className="text-2xl font-bold text-foreground mt-8 mb-4">2. Why Personal Baselines Matter More Than Norms</h2>
        <p>
          Two healthy people can have very different absolute HRV values. What matters is how your HRV changes relative to your own baseline when you change sleep, training load, or stressors.
        </p>

        <h2 className="text-2xl font-bold text-foreground mt-8 mb-4">3. Daily Noise vs. Weekly Trends</h2>
        <p>
          HRV jumps around day to day due to small factors like caffeine, meals, or acute stress. Looking at rolling averages or weekly trends gives a more reliable view of whether you are trending toward overload or recovery.
        </p>

        <h2 className="text-2xl font-bold text-foreground mt-8 mb-4">4. Integrating HRV with Sleep, Mood, and Performance</h2>
        <p>
          HRV becomes more powerful when combined with subjective signals: How rested do you feel? Are you excited to train or work? Are you getting sick more often? Use the full picture, not HRV alone, to guide decisions.
        </p>

        <h2 className="text-2xl font-bold text-foreground mt-8 mb-4">5. When to Seek Professional Input</h2>
        <p>
          If HRV drops sharply and stays low, especially with symptoms like palpitations, chest pain, dizziness, or extreme fatigue, consult a healthcare professional. Apps and calculators cannot replace ECGs or clinical exams.
        </p>

        <hr />
        <h2 className="text-2xl font-bold text-foreground pt-8" itemProp="articleSection">
          Conclusion
        </h2>
        <p>
          Used wisely, HRV is a useful feedback tool for your recovery habits and stress levels. The HRV Resilience Index in this calculator is meant to support reflection and conversation, not medical diagnosis.
        </p>
      </section>

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
          <p>This calculator estimates an HRV Resilience Index and recovery readiness score from RMSSD, trends, resting HR, and sleep quality.</p>
          <p>It returns scores, qualitative interpretation, recommendations, an action plan, and additional metrics.</p>
          <p>The expanded guide and FAQs support SEO, E‑E‑A‑T, and responsible interpretation by humans and AI assistants.</p>
        </CardContent>
      </Card>
    </div>
  );
}



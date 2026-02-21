'use client';

import { useState } from 'react';
import Script from 'next/script';
import Link from 'next/link';
import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import { z } from 'zod';
import { Heart, Zap, Target, Shield, TrendingUp } from 'lucide-react';

import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Form, FormControl, FormField, FormItem, FormLabel, FormMessage } from '@/components/ui/form';
import { Input } from '@/components/ui/input';

const formSchema = z.object({
  currentHRV: z.number({ invalid_type_error: 'Enter current HRV' }).min(20).max(200),
  baselineHRV: z.number({ invalid_type_error: 'Enter baseline HRV' }).min(20).max(200),
  rMSSD: z.number({ invalid_type_error: 'Enter rMSSD' }).min(10).max(200).optional(),
  sleepHours: z.number({ invalid_type_error: 'Enter sleep hours' }).min(3).max(12).optional(),
  stressLevel: z.number({ invalid_type_error: 'Enter stress level' }).min(1).max(10).optional(),
  trainingLoad: z.number({ invalid_type_error: 'Enter training load' }).min(1).max(10).optional(),
});

type FormValues = z.infer<typeof formSchema>;

type ResultPayload = {
  recoveryScore: number;
  recoveryStatus: string;
  hrvChange: number;
  status: 'optimal' | 'good' | 'moderate' | 'poor';
  interpretation: string;
  recommendations: string[];
  plan: { label: string; detail: string }[];
};

const steps = [
  'Enter current HRV (Heart Rate Variability) value (ms).',
  'Enter baseline HRV (your typical average HRV).',
  'Optionally enter rMSSD value (root mean square of successive differences).',
  'Optionally enter sleep hours, stress level (1-10), and training load (1-10).',
  'Review recovery optimization score, status, and recommendations.',
];

const faqs = [
  {
    question: 'What is HRV (Heart Rate Variability)?',
    answer:
      'HRV is the variation in time between heartbeats. Higher HRV generally indicates better recovery, adaptability, and readiness for training. Lower HRV suggests fatigue, stress, or overreaching.',
  },
  {
    question: 'How does HRV indicate recovery?',
    answer:
      'HRV reflects autonomic nervous system balance. Higher HRV indicates parasympathetic dominance (rest and recovery), while lower HRV indicates sympathetic dominance (stress, fatigue, overtraining).',
  },
  {
    question: 'What is a good HRV recovery score?',
    answer:
      'Recovery scores vary by individual. Generally: 80-100 = optimal, 60-80 = good, 40-60 = moderate, below 40 = poor. Scores should be compared to your personal baseline.',
  },
  {
    question: 'What affects HRV?',
    answer:
      'Sleep quality and duration, training load, stress (physical, mental, emotional), alcohol, illness, hydration, nutrition, and circadian rhythm all affect HRV values.',
  },
  {
    question: 'How should I use HRV for training decisions?',
    answer:
      'When HRV is above baseline or in optimal range, you\'re ready for high-intensity training. When HRV is below baseline or poor, reduce intensity, take rest, or focus on recovery.',
  },
  {
    question: 'What is rMSSD?',
    answer:
      'rMSSD (root mean square of successive differences) is a time-domain HRV metric. It reflects short-term variation and is sensitive to training load and recovery. Higher rMSSD indicates better recovery.',
  },
  {
    question: 'How often should I measure HRV?',
    answer:
      'Measure HRV consistently, ideally first thing in the morning upon waking (before coffee, exercise, or stress). Daily measurement provides the best trends, though 3-4 times per week can be sufficient.',
  },
  {
    question: 'Can HRV predict illness?',
    answer:
      'Yes. HRV often decreases 1-3 days before illness symptoms appear. A significant drop in HRV may indicate coming illness, allowing you to adjust training accordingly.',
  },
  {
    question: 'How does sleep affect HRV recovery?',
    answer:
      'Sleep is critical for HRV recovery. Poor sleep quality or insufficient duration significantly reduces HRV. Aim for 7-9 hours of quality sleep for optimal HRV recovery.',
  },
  {
    question: 'What if my HRV is consistently low?',
    answer:
      'Consistently low HRV relative to baseline suggests chronic stress, overtraining, poor recovery, or underlying health issues. Reduce training load, prioritize sleep and stress management, and consider medical evaluation if it persists.',
  },
];

const relatedCalculators = [
  {
    name: 'Training Fatigue Wellness Index',
    slug: 'training-fatigue-index-calculator',
    description: 'Get wellness insights about overall training fatigue alongside HRV metrics.',
  },
  {
    name: 'Central Nervous System (CNS) Fatigue Recovery Wellness Guide',
    slug: 'central-nervous-system-cns-fatigue-recovery-calculator',
    description: 'Get wellness insights about CNS recovery time related to HRV recovery.',
  },
  {
    name: 'Training Stress Score Calculator',
    slug: 'running-pace-calculator',
    description: 'Correlate training stress with HRV recovery scores.',
  },
  {
    name: 'Exercise Recovery Score (HRV + Sleep Integration)',
    slug: 'exercise-recovery-score-hrv-sleep-integration',
    description: 'Integrate HRV with sleep for comprehensive recovery assessment.',
  },
];

const baseUrl = 'https://mycalculating.com/category/health-fitness/hrv-recovery-optimization-score-calculator';

const schemaMarkup = {
  '@context': 'https://schema.org',
  '@graph': [
    {
      '@type': 'BreadcrumbList',
      itemListElement: [
        { '@type': 'ListItem', position: 1, name: 'Home', item: 'https://mycalculating.com' },
        { '@type': 'ListItem', position: 2, name: 'Health & Fitness', item: 'https://mycalculating.com/category/health-fitness' },
        { '@type': 'ListItem', position: 3, name: 'HRV Recovery Optimization Wellness Score', item: baseUrl },
      ],
    },
    {
      '@type': 'SoftwareApplication',
      name: 'HRV Recovery Optimization Wellness Score',
      applicationCategory: 'Calculator',
      operatingSystem: 'Web Browser',
      description: 'Get general wellness insights about HRV recovery optimization score based on current HRV, baseline HRV, rMSSD, sleep, stress, and training load. This is a personal lifestyle insight, not a medical evaluation.',
      url: baseUrl,
      offers: { '@type': 'Offer', price: '0', priceCurrency: 'USD' },
    },
  ],
};

const clamp = (value: number, min: number, max: number) => Math.min(max, Math.max(min, value));

const calculateResult = (values: FormValues): ResultPayload => {
  // Calculate HRV change percentage
  const hrvChange = ((values.currentHRV - values.baselineHRV) / values.baselineHRV) * 100;
  
  // Base recovery score from HRV change (0-100 scale)
  let recoveryScore = 50; // Baseline at 50
  
  // HRV change contribution (up to ±50 points)
  if (hrvChange > 0) {
    // Above baseline = better recovery
    recoveryScore += Math.min(hrvChange / 2, 50); // Up to +50 points
  } else {
    // Below baseline = worse recovery
    recoveryScore += Math.max(hrvChange / 1.5, -50); // Down to -50 points
  }
  
  // rMSSD adjustment (if provided)
  if (values.rMSSD) {
    // Normalize rMSSD (typical range 20-100ms, higher is better)
    const rMSSDScore = clamp((values.rMSSD - 20) / 80, 0, 1) * 20; // Up to ±20 points
    recoveryScore += (rMSSDScore - 10); // -10 to +10 adjustment
  }
  
  // Sleep adjustment
  if (values.sleepHours) {
    const sleepAdjustment = ((values.sleepHours - 7) / 2) * 15; // -15 to +15 based on 5-9 hours
    recoveryScore += clamp(sleepAdjustment, -15, 15);
  }
  
  // Stress level adjustment
  if (values.stressLevel) {
    const stressAdjustment = ((values.stressLevel - 5) / 5) * 20; // -20 to +20
    recoveryScore -= stressAdjustment; // Higher stress reduces score
  }
  
  // Training load adjustment
  if (values.trainingLoad) {
    const loadAdjustment = ((values.trainingLoad - 5) / 5) * 15; // -15 to +15
    recoveryScore -= loadAdjustment; // Higher load reduces score
  }
  
  // Clamp to 0-100 scale
  recoveryScore = clamp(recoveryScore, 0, 100);
  
  let status: ResultPayload['status'] = 'optimal';
  let recoveryStatus = 'Optimal';
  let interpretation = 'This suggests a general lifestyle tendency where your HRV recovery optimization score may be optimal. You may appear well-recovered and ready for training.';
  
  if (recoveryScore >= 80) {
    status = 'optimal';
    recoveryStatus = 'Optimal';
  } else if (recoveryScore >= 60) {
    status = 'good';
    recoveryStatus = 'Good';
    interpretation = 'This suggests a general lifestyle tendency where your HRV recovery optimization score is good. You may be recovered and ready for normal training.';
  } else if (recoveryScore >= 40) {
    status = 'moderate';
    recoveryStatus = 'Moderate';
    interpretation = 'This suggests a general lifestyle tendency where your HRV recovery optimization score is moderate. You may consider lighter training or additional recovery.';
  } else {
    status = 'poor';
    recoveryStatus = 'Poor';
    interpretation = 'This suggests a general lifestyle tendency where your HRV recovery optimization score is lower. You may consider focusing on recovery: rest, sleep, stress management. You may consider avoiding high-intensity training.';
  }
  
  const recommendations = [
    'You may consider monitoring HRV trends over time rather than individual readings. Patterns may be more meaningful than single values. This is a personal insight, not a medical evaluation.',
    'You may consider prioritizing sleep: aim for 7-9 hours of quality sleep. Sleep may be a primary driver of HRV recovery.',
    'You may consider managing stress: high stress (physical, mental, emotional) may reduce HRV. Include stress-reduction practices.',
  ];
  if (hrvChange < -10) {
    recommendations.push('HRV may be below baseline. You may consider reducing training load, increasing recovery, and focusing on sleep and stress management.');
  }
  if (values.sleepHours && values.sleepHours < 7) {
    recommendations.push('You may consider improving sleep duration. Inadequate sleep may be a factor reducing HRV and recovery.');
  }
  if (values.stressLevel && values.stressLevel > 7) {
    recommendations.push('You may consider addressing high stress levels. Consider meditation, relaxation, or stress-reduction techniques to support HRV recovery.');
  }
  if (recoveryScore < 40) {
    recommendations.push('Recovery score is lower. You may consider taking rest days, reducing or pausing training, prioritizing sleep, and addressing stressors. Consider discussing with a qualified professional if persistent.');
  }
  
  const plan = [
    { label: 'This Week', detail: 'You may consider measuring HRV consistently (daily or 3-4x/week) at the same time each day (ideally upon waking). Track trends relative to baseline.' },
    { label: 'This Month', detail: 'You may consider using HRV scores to guide training decisions. High scores may indicate readiness for high-intensity training, low scores may indicate recovery needs. Optimize sleep and stress management.' },
    { label: 'Ongoing', detail: 'You may consider continuing to monitor HRV as a recovery metric. Build patterns of what affects your HRV and adjust lifestyle and training accordingly.' },
  ];
  
  return { recoveryScore, recoveryStatus, hrvChange, status, interpretation, recommendations, plan };
};

export default function HRVRecoveryOptimizationScoreCalculator() {
  const [result, setResult] = useState<ResultPayload | null>(null);
  
  const form = useForm<FormValues>({
    resolver: zodResolver(formSchema),
    defaultValues: {
      currentHRV: undefined,
      baselineHRV: undefined,
      rMSSD: undefined,
      sleepHours: undefined,
      stressLevel: undefined,
      trainingLoad: undefined,
    },
  });
  
  return (
    <div className="space-y-8">
      <Script id="hrv-recovery-schema" type="application/ld+json" strategy="afterInteractive" dangerouslySetInnerHTML={{ __html: JSON.stringify(schemaMarkup) }} />
      
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <Heart className="h-5 w-5" />
            HRV Recovery Optimization Wellness Score
          </CardTitle>
          <CardDescription>Get general wellness insights about HRV recovery optimization score based on current HRV, baseline HRV, rMSSD, sleep, stress, and training load. This is a personal lifestyle insight, not a medical evaluation.</CardDescription>
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
                  name="currentHRV"
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel>Current HRV (ms)</FormLabel>
                      <FormControl>
                        <Input type="number" step="1" placeholder="e.g., 45" value={field.value ?? ''} onChange={(e) => field.onChange(e.target.value === '' ? undefined : Number(e.target.value))} />
                      </FormControl>
                      <FormMessage />
                    </FormItem>
                  )}
                />
                <FormField
                  control={form.control}
                  name="baselineHRV"
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel>Baseline HRV (ms)</FormLabel>
                      <FormControl>
                        <Input type="number" step="1" placeholder="e.g., 42" value={field.value ?? ''} onChange={(e) => field.onChange(e.target.value === '' ? undefined : Number(e.target.value))} />
                      </FormControl>
                      <FormMessage />
                    </FormItem>
                  )}
                />
                <FormField
                  control={form.control}
                  name="rMSSD"
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel>rMSSD (ms, optional)</FormLabel>
                      <FormControl>
                        <Input type="number" step="1" placeholder="e.g., 35" value={field.value ?? ''} onChange={(e) => field.onChange(e.target.value === '' ? undefined : Number(e.target.value))} />
                      </FormControl>
                      <FormMessage />
                    </FormItem>
                  )}
                />
                <FormField
                  control={form.control}
                  name="sleepHours"
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel>Sleep hours (optional)</FormLabel>
                      <FormControl>
                        <Input type="number" step="0.5" placeholder="e.g., 7.5" value={field.value ?? ''} onChange={(e) => field.onChange(e.target.value === '' ? undefined : Number(e.target.value))} />
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
                      <FormLabel>Stress level (1-10, optional)</FormLabel>
                      <FormControl>
                        <Input type="number" step="1" placeholder="e.g., 5" value={field.value ?? ''} onChange={(e) => field.onChange(e.target.value === '' ? undefined : Number(e.target.value))} />
                      </FormControl>
                      <FormMessage />
                    </FormItem>
                  )}
                />
                <FormField
                  control={form.control}
                  name="trainingLoad"
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel>Training load (1-10, optional)</FormLabel>
                      <FormControl>
                        <Input type="number" step="1" placeholder="e.g., 7" value={field.value ?? ''} onChange={(e) => field.onChange(e.target.value === '' ? undefined : Number(e.target.value))} />
                      </FormControl>
                      <FormMessage />
                    </FormItem>
                  )}
                />
              </div>
              <Button type="submit" className="w-full md:w-auto">
                Calculate recovery score
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
            <CardDescription>See HRV recovery optimization score, status, and recommendations.</CardDescription>
          </CardHeader>
          <CardContent className="space-y-6">
            <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
              <div className="p-4 border rounded">
                <p className="text-sm text-muted-foreground">Recovery score</p>
                <p className="text-2xl font-semibold text-primary">{result.recoveryScore.toFixed(1)}</p>
                <p className="text-xs text-muted-foreground">Out of 100</p>
              </div>
              <div className="p-4 border rounded">
                <p className="text-sm text-muted-foreground">Recovery status</p>
                <p className="text-2xl font-semibold text-primary">{result.recoveryStatus}</p>
                <p className="text-xs text-muted-foreground">{result.status}</p>
              </div>
              <div className="p-4 border rounded">
                <p className="text-sm text-muted-foreground">HRV change</p>
                <p className="text-2xl font-semibold text-primary">{result.hrvChange >= 0 ? '+' : ''}{result.hrvChange.toFixed(1)}%</p>
                <p className="text-xs text-muted-foreground">From baseline</p>
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
                    <TrendingUp className="h-4 w-4" />
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
            <strong>HRV change</strong> = ((Current HRV - Baseline HRV) / Baseline HRV) × 100%.
          </p>
          <p>
            <strong>Base recovery score</strong> = 50 (baseline).
          </p>
          <p>
            <strong>HRV change contribution</strong> = Up to ±50 points based on HRV change percentage (above baseline = positive, below = negative).
          </p>
          <p>
            <strong>rMSSD adjustment</strong> = ±20 points based on rMSSD value (normalized to 20-100ms range).
          </p>
          <p>
            <strong>Sleep adjustment</strong> = ±15 points based on sleep hours (optimal around 7-9 hours).
          </p>
          <p>
            <strong>Stress adjustment</strong> = -20 to +20 points (higher stress reduces score).
          </p>
          <p>
            <strong>Training load adjustment</strong> = -15 to +15 points (higher load reduces score).
          </p>
          <p>
            <strong>Recovery score</strong> = Base + HRV change + rMSSD + Sleep + Stress + Load (clamped 0-100).
          </p>
          <p>Higher scores (80+) indicate optimal recovery and readiness for high-intensity training. Lower scores suggest need for recovery.</p>
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
          <p>HRV (Heart Rate Variability) reflects autonomic nervous system balance and recovery status. Higher HRV indicates better recovery and readiness for training, while lower HRV suggests fatigue, stress, or overreaching.</p>
          <p>Use this calculator to assess HRV recovery optimization score based on current HRV relative to baseline, rMSSD, sleep, stress, and training load to guide training decisions and optimize recovery.</p>
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
          <p>This tool provides general wellness insights about HRV recovery optimization score based on current HRV, baseline HRV, rMSSD, sleep hours, stress level, and training load. This is a personal lifestyle insight, not a medical evaluation.</p>
          <p>Outputs include recovery score (0-100), recovery status, HRV change percentage, status, recommendations, an action plan, and supporting metrics.</p>
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



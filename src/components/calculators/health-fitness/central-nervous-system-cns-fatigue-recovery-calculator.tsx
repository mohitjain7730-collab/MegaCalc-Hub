'use client';

import { useState } from 'react';
import Script from 'next/script';
import Link from 'next/link';
import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import { z } from 'zod';
import { Brain, Zap, Target, Shield, Clock } from 'lucide-react';

import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Form, FormControl, FormField, FormItem, FormLabel, FormMessage } from '@/components/ui/form';
import { Input } from '@/components/ui/input';

const formSchema = z.object({
  trainingIntensity: z.number({ invalid_type_error: 'Enter training intensity' }).min(1).max(10),
  trainingVolume: z.number({ invalid_type_error: 'Enter training volume' }).min(0).max(1000),
  trainingType: z.enum(['strength', 'power', 'endurance', 'mixed']),
  cnsLoadDays: z.number({ invalid_type_error: 'Enter CNS load days' }).min(1).max(14),
  sleepQuality: z.number({ invalid_type_error: 'Enter sleep quality' }).min(1).max(10).optional(),
  stressLevel: z.number({ invalid_type_error: 'Enter stress level' }).min(1).max(10).optional(),
});

type FormValues = z.infer<typeof formSchema>;

type ResultPayload = {
  recoveryHours: number;
  recoveryDays: number;
  cnsFatigueLevel: string;
  status: 'low' | 'moderate' | 'high' | 'very-high';
  interpretation: string;
  recommendations: string[];
  plan: { label: string; detail: string }[];
};

const steps = [
  'Enter training intensity level (1 = very light, 10 = maximum effort).',
  'Enter training volume (hours or minutes per week).',
  'Select training type (strength, power, endurance, or mixed).',
  'Enter consecutive days of high CNS load training.',
  'Optionally enter sleep quality (1-10) and stress level (1-10).',
  'Review CNS fatigue recovery time, level, and recommendations.',
];

const faqs = [
  {
    question: 'What is CNS (Central Nervous System) fatigue?',
    answer:
      'CNS fatigue is the exhaustion of the central nervous system from high-intensity training. It affects motor unit recruitment, coordination, and maximal strength/power output. CNS fatigue requires longer recovery than muscle fatigue.',
  },
  {
    question: 'What causes CNS fatigue?',
    answer:
      'High-intensity training (heavy weights, max effort, power training), high volume, consecutive intense sessions, insufficient recovery, poor sleep, and high stress. CNS fatigue accumulates with repeated high-intensity work.',
  },
  {
    question: 'How long does CNS fatigue recovery take?',
    answer:
      'Recovery time varies: low CNS load (1-2 days), moderate (2-3 days), high (3-5 days), very high (5-7+ days). Recovery depends on intensity, volume, training type, sleep, stress, and individual factors.',
  },
  {
    question: 'What are signs of CNS fatigue?',
    answer:
      'Decreased maximal strength, reduced power output, poor coordination, slower reaction time, decreased motivation, feeling "flat" despite adequate rest, and difficulty hitting training numbers.',
  },
  {
    question: 'How does training type affect CNS fatigue?',
    answer:
      'Power training (jumps, sprints) causes high CNS fatigue. Heavy strength training causes moderate-high CNS fatigue. Endurance training causes low-moderate CNS fatigue. Mixed training increases cumulative load.',
  },
  {
    question: 'How can I reduce CNS fatigue?',
    answer:
      'Reduce training intensity, increase rest days between intense sessions, prioritize sleep (7-9 hours), manage stress, include deload weeks, avoid consecutive max-effort days, and use active recovery.',
  },
  {
    question: 'Should I train with CNS fatigue?',
    answer:
      'Training with high CNS fatigue is counterproductive. Reduce intensity to 60-70% of max, focus on technique, or take complete rest. Forcing high intensity with CNS fatigue increases injury risk and delays recovery.',
  },
  {
    question: 'How does sleep affect CNS recovery?',
    answer:
      'Sleep is critical for CNS recovery. Poor sleep quality or insufficient duration significantly delays CNS recovery. Aim for 7-9 hours of quality sleep, especially after high-intensity sessions.',
  },
  {
    question: 'What about stress and CNS fatigue?',
    answer:
      'High stress (physical, mental, emotional) increases CNS fatigue and delays recovery. Manage stress through relaxation, meditation, proper nutrition, and adequate sleep to optimize CNS recovery.',
  },
  {
    question: 'How do I prevent excessive CNS fatigue?',
    answer:
      'Periodize training (vary intensity), include rest days between intense sessions, avoid consecutive max-effort days, prioritize sleep and stress management, and listen to your body\'s CNS recovery signals.',
  },
];

const relatedCalculators = [
  {
    name: 'Training Fatigue Wellness Index',
    slug: 'training-fatigue-index-calculator',
    description: 'Get wellness insights about overall training fatigue including CNS fatigue.',
  },
  {
    name: 'HRV Recovery Optimization Wellness Score',
    slug: 'hrv-recovery-optimization-score-calculator',
    description: 'Get wellness insights about recovery readiness including CNS recovery.',
  },
  {
    name: 'Training Stress Score Calculator',
    slug: 'running-pace-calculator',
    description: 'Calculate training stress including CNS load.',
  },
  {
    name: 'Rest Time Between Sets Calculator',
    slug: 'rest-time-between-sets-calculator',
    description: 'Optimize rest periods for CNS recovery between sets.',
  },
];

const baseUrl = 'https://mycalculating.com/category/health-fitness/central-nervous-system-cns-fatigue-recovery-calculator';

const schemaMarkup = {
  '@context': 'https://schema.org',
  '@graph': [
    {
      '@type': 'BreadcrumbList',
      itemListElement: [
        { '@type': 'ListItem', position: 1, name: 'Home', item: 'https://mycalculating.com' },
        { '@type': 'ListItem', position: 2, name: 'Health & Fitness', item: 'https://mycalculating.com/category/health-fitness' },
        { '@type': 'ListItem', position: 3, name: 'Central Nervous System (CNS) Fatigue Recovery Wellness Guide', item: baseUrl },
      ],
    },
    {
      '@type': 'SoftwareApplication',
      name: 'Central Nervous System (CNS) Fatigue Recovery Wellness Guide',
      applicationCategory: 'Calculator',
      operatingSystem: 'Web Browser',
      description: 'Get general wellness insights about CNS fatigue recovery time based on training intensity, volume, type, and consecutive high-load days. This is a personal lifestyle insight, not a medical evaluation.',
      url: baseUrl,
      offers: { '@type': 'Offer', price: '0', priceCurrency: 'USD' },
    },
  ],
};

const clamp = (value: number, min: number, max: number) => Math.min(max, Math.max(min, value));

const calculateResult = (values: FormValues): ResultPayload => {
  // Base recovery by training type
  const typeMultipliers = { strength: 1.2, power: 1.5, endurance: 0.8, mixed: 1.3 };
  const typeMultiplier = typeMultipliers[values.trainingType] ?? 1.0;
  
  // Base recovery hours based on intensity
  const intensityBase = Math.pow(values.trainingIntensity / 10, 1.5) * 48; // Max 48 hours at intensity 10
  
  // Volume adjustment (more volume = longer recovery)
  const volumeAdjustment = (values.trainingVolume / 20) * 12; // Up to 12 hours at 20+ hours/week
  
  // Consecutive days multiplier (more consecutive days = exponentially longer recovery)
  const daysMultiplier = 1 + ((values.cnsLoadDays - 1) / 5) * 0.8; // Up to 1.8x multiplier
  
  let recoveryHours = (intensityBase + volumeAdjustment) * typeMultiplier * daysMultiplier;
  
  // Adjust for sleep quality
  if (values.sleepQuality) {
    const sleepAdjustment = ((values.sleepQuality - 7) / 3) * 0.3; // -30% to +30% based on sleep
    recoveryHours = recoveryHours * (1 - sleepAdjustment);
  }
  
  // Adjust for stress level
  if (values.stressLevel) {
    const stressAdjustment = ((values.stressLevel - 5) / 5) * 0.25; // -25% to +25% based on stress
    recoveryHours = recoveryHours * (1 + stressAdjustment);
  }
  
  // Clamp to reasonable range (6 hours to 7 days)
  recoveryHours = clamp(recoveryHours, 6, 168);
  
  const recoveryDays = recoveryHours / 24;
  
  let status: ResultPayload['status'] = 'low';
  let cnsFatigueLevel = 'Low';
  let interpretation = 'This suggests a general lifestyle tendency where your CNS fatigue level may be low. Recovery time may be relatively short.';
  
  if (recoveryHours < 24) {
    status = 'low';
    cnsFatigueLevel = 'Low';
  } else if (recoveryHours < 48) {
    status = 'moderate';
    cnsFatigueLevel = 'Moderate';
    interpretation = 'This suggests a general lifestyle tendency where your CNS fatigue level is moderate. You may consider allowing adequate recovery before next high-intensity session.';
  } else if (recoveryHours < 72) {
    status = 'high';
    cnsFatigueLevel = 'High';
    interpretation = 'This suggests a general lifestyle tendency where your CNS fatigue level is high. You may consider taking extended rest and reducing intensity in next session.';
  } else {
    status = 'very-high';
    cnsFatigueLevel = 'Very High';
    interpretation = 'This suggests a general lifestyle tendency where your CNS fatigue level is very high. You may consider taking multiple rest days and considering a deload week before returning to high-intensity training.';
  }
  
  const recommendations = [
    'You may consider allowing full recovery time before next high-intensity session. CNS fatigue may require longer recovery than muscle fatigue. This is a personal insight, not a medical evaluation.',
    'You may consider prioritizing sleep: get 7-9 hours of quality sleep. Poor sleep may delay CNS recovery.',
    'You may consider avoiding consecutive high-intensity days. Space intense sessions with at least 48-72 hours between them.',
  ];
  if (values.cnsLoadDays > 3) {
    recommendations.push('You may consider reducing consecutive days of high CNS load. Too many consecutive intense days may lead to excessive CNS fatigue.');
  }
  if (values.sleepQuality && values.sleepQuality < 7) {
    recommendations.push('You may consider improving sleep quality. Poor sleep may be one of the factors delaying CNS recovery.');
  }
  if (values.stressLevel && values.stressLevel > 7) {
    recommendations.push('You may consider managing stress levels. High stress may increase CNS fatigue and delay recovery. Consider relaxation techniques, meditation, or stress-reduction strategies.');
  }
  if (recoveryHours > 72) {
    recommendations.push('You may consider taking extended rest and considering a deload week: reduce intensity by 50-70% and volume by 30-50% to allow CNS recovery.');
  }
  
  const plan = [
    { label: 'This Week', detail: 'You may consider allowing full recovery time calculated. Avoid high-intensity training during recovery period. Focus on light movement or complete rest.' },
    { label: 'This Month', detail: 'You may consider planning training to avoid excessive consecutive high-intensity days. Include rest days between intense sessions and prioritize sleep.' },
    { label: 'Ongoing', detail: 'You may consider monitoring CNS fatigue signals (strength, power, coordination). Adjust training intensity and recovery based on CNS recovery needs.' },
  ];
  
  return { recoveryHours, recoveryDays, cnsFatigueLevel, status, interpretation, recommendations, plan };
};

export default function CentralNervousSystemCNSFatigueRecoveryCalculator() {
  const [result, setResult] = useState<ResultPayload | null>(null);
  
  const form = useForm<FormValues>({
    resolver: zodResolver(formSchema),
    defaultValues: {
      trainingIntensity: undefined,
      trainingVolume: undefined,
      trainingType: undefined,
      cnsLoadDays: undefined,
      sleepQuality: undefined,
      stressLevel: undefined,
    },
  });
  
  return (
    <div className="space-y-8">
      <Script id="cns-fatigue-schema" type="application/ld+json" strategy="afterInteractive" dangerouslySetInnerHTML={{ __html: JSON.stringify(schemaMarkup) }} />
      
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <Brain className="h-5 w-5" />
            Central Nervous System (CNS) Fatigue Recovery Wellness Guide
          </CardTitle>
          <CardDescription>Get general wellness insights about CNS fatigue recovery time based on training intensity, volume, type, and consecutive high-load days. This is a personal lifestyle insight, not a medical evaluation.</CardDescription>
        </CardHeader>
      </Card>
      
      <Card>
        <CardHeader>
          <CardTitle>Input your training data</CardTitle>
        </CardHeader>
        <CardContent>
          <Form {...form}>
            <form onSubmit={form.handleSubmit((values) => setResult(calculateResult(values)))} className="space-y-6">
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <FormField
                  control={form.control}
                  name="trainingIntensity"
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel>Training intensity (1-10)</FormLabel>
                      <FormControl>
                        <Input type="number" step="1" placeholder="e.g., 8" value={field.value ?? ''} onChange={(e) => field.onChange(e.target.value === '' ? undefined : Number(e.target.value))} />
                      </FormControl>
                      <FormMessage />
                    </FormItem>
                  )}
                />
                <FormField
                  control={form.control}
                  name="trainingVolume"
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel>Training volume (hours/week)</FormLabel>
                      <FormControl>
                        <Input type="number" step="0.5" placeholder="e.g., 6" value={field.value ?? ''} onChange={(e) => field.onChange(e.target.value === '' ? undefined : Number(e.target.value))} />
                      </FormControl>
                      <FormMessage />
                    </FormItem>
                  )}
                />
                <FormField
                  control={form.control}
                  name="trainingType"
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel>Training type</FormLabel>
                      <FormControl>
                        <select value={field.value ?? ''} onChange={(e) => field.onChange(e.target.value as FormValues['trainingType'])} className="flex h-10 w-full rounded-md border border-input bg-background px-3 py-2 text-sm">
                          <option value="">Select type</option>
                          <option value="strength">Strength</option>
                          <option value="power">Power</option>
                          <option value="endurance">Endurance</option>
                          <option value="mixed">Mixed</option>
                        </select>
                      </FormControl>
                      <FormMessage />
                    </FormItem>
                  )}
                />
                <FormField
                  control={form.control}
                  name="cnsLoadDays"
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel>Consecutive CNS load days</FormLabel>
                      <FormControl>
                        <Input type="number" step="1" placeholder="e.g., 3" value={field.value ?? ''} onChange={(e) => field.onChange(e.target.value === '' ? undefined : Number(e.target.value))} />
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
                      <FormLabel>Sleep quality (1-10, optional)</FormLabel>
                      <FormControl>
                        <Input type="number" step="1" placeholder="e.g., 8" value={field.value ?? ''} onChange={(e) => field.onChange(e.target.value === '' ? undefined : Number(e.target.value))} />
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
                        <Input type="number" step="1" placeholder="e.g., 4" value={field.value ?? ''} onChange={(e) => field.onChange(e.target.value === '' ? undefined : Number(e.target.value))} />
                      </FormControl>
                      <FormMessage />
                    </FormItem>
                  )}
                />
              </div>
              <Button type="submit" className="w-full md:w-auto">
                Calculate recovery time
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
            <CardDescription>See CNS fatigue recovery time, level, and recommendations.</CardDescription>
          </CardHeader>
          <CardContent className="space-y-6">
            <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
              <div className="p-4 border rounded">
                <p className="text-sm text-muted-foreground">Recovery hours</p>
                <p className="text-2xl font-semibold text-primary">{result.recoveryHours.toFixed(1)} hours</p>
                <p className="text-xs text-muted-foreground">Until next high-intensity</p>
              </div>
              <div className="p-4 border rounded">
                <p className="text-sm text-muted-foreground">Recovery days</p>
                <p className="text-2xl font-semibold text-primary">{result.recoveryDays.toFixed(1)} days</p>
                <p className="text-xs text-muted-foreground">Full recovery</p>
              </div>
              <div className="p-4 border rounded">
                <p className="text-sm text-muted-foreground">CNS fatigue level</p>
                <p className="text-2xl font-semibold text-primary">{result.cnsFatigueLevel}</p>
                <p className="text-xs text-muted-foreground">{result.status}</p>
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
                    <Clock className="h-4 w-4" />
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
            <strong>Intensity base</strong> = (Intensity level / 10)^1.5 × 48 hours (max 48 hours at intensity 10).
          </p>
          <p>
            <strong>Volume adjustment</strong> = (Training volume / 20) × 12 hours.
          </p>
          <p>
            <strong>Training type multiplier</strong> = Strength: 1.2x, Power: 1.5x, Endurance: 0.8x, Mixed: 1.3x.
          </p>
          <p>
            <strong>Days multiplier</strong> = 1 + ((Consecutive days - 1) / 5) × 0.8 (up to 1.8x for many consecutive days).
          </p>
          <p>
            <strong>Sleep adjustment</strong> = Recovery hours × (1 - ((Sleep quality - 7) / 3) × 0.3).
          </p>
          <p>
            <strong>Stress adjustment</strong> = Recovery hours × (1 + ((Stress level - 5) / 5) × 0.25).
          </p>
          <p>
            <strong>Recovery hours</strong> = ((Intensity base + Volume adjustment) × Type multiplier × Days multiplier) + Sleep adjustment + Stress adjustment (clamped 6-168 hours).
          </p>
          <p>CNS fatigue recovery is longer than muscle recovery. High-intensity training, especially power training, requires more CNS recovery time.</p>
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
          <p>CNS (Central Nervous System) fatigue is the exhaustion of the nervous system from high-intensity training. It affects maximal strength, power, and coordination, and requires longer recovery than muscle fatigue.</p>
          <p>Use this calculator to estimate CNS fatigue recovery time based on training intensity, volume, type (strength, power, endurance), consecutive high-load days, sleep quality, and stress levels to optimize training and prevent overtraining.</p>
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
          <p>This tool provides general wellness insights about CNS fatigue recovery time based on training intensity, volume, type, consecutive CNS load days, sleep quality, and stress level. This is a personal lifestyle insight, not a medical evaluation.</p>
          <p>Outputs include recovery hours, recovery days, CNS fatigue level, status, recommendations, an action plan, and supporting metrics.</p>
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



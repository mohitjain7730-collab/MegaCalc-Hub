'use client';

import { useState } from 'react';
import Script from 'next/script';
import Link from 'next/link';
import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import { z } from 'zod';
import { Activity, Zap, Target, Shield, TrendingUp } from 'lucide-react';

import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Form, FormControl, FormField, FormItem, FormLabel, FormMessage } from '@/components/ui/form';
import { Input } from '@/components/ui/input';

const formSchema = z.object({
  trainingVolume: z.number({ invalid_type_error: 'Enter training volume' }).min(0).max(1000),
  trainingFrequency: z.number({ invalid_type_error: 'Enter training frequency' }).min(0).max(14),
  intensityLevel: z.number({ invalid_type_error: 'Enter intensity level' }).min(1).max(10),
  recoveryDays: z.number({ invalid_type_error: 'Enter recovery days' }).min(0).max(7),
  sleepHours: z.number({ invalid_type_error: 'Enter sleep hours' }).min(3).max(12).optional(),
  perceivedExertion: z.number({ invalid_type_error: 'Enter perceived exertion' }).min(1).max(10).optional(),
});

type FormValues = z.infer<typeof formSchema>;

type ResultPayload = {
  fatigueIndex: number;
  fatigueLevel: string;
  status: 'low' | 'moderate' | 'high' | 'very-high';
  interpretation: string;
  recommendations: string[];
  plan: { label: string; detail: string }[];
};

const steps = [
  'Enter weekly training volume (hours or minutes per week).',
  'Enter training frequency (number of sessions per week).',
  'Enter intensity level (1 = very light, 10 = maximum effort).',
  'Enter recovery days per week (rest days).',
  'Optionally enter average sleep hours and perceived exertion (1-10).',
  'Review fatigue index, level, and recommendations.',
];

const faqs = [
  {
    question: 'What is training fatigue?',
    answer:
      'Training fatigue is the cumulative physical and mental exhaustion from training. It includes muscle fatigue, central nervous system fatigue, and metabolic fatigue. Proper management prevents overtraining.',
  },
  {
    question: 'How does fatigue affect performance?',
    answer:
      'Excessive fatigue reduces strength, power, endurance, coordination, and motivation. It increases injury risk and impairs recovery. Moderate fatigue is normal, but chronic high fatigue indicates overreaching or overtraining.',
  },
  {
    question: 'What causes training fatigue?',
    answer:
      'High training volume, high intensity, insufficient recovery, poor sleep, inadequate nutrition, stress, and lack of periodization. Fatigue accumulates when recovery doesn\'t match training load.',
  },
  {
    question: 'How much recovery do I need?',
    answer:
      'Recovery needs vary by individual and training. Generally: 1-2 rest days per week, 48-72 hours between intense sessions, 7-9 hours sleep, and deload weeks every 4-8 weeks.',
  },
  {
    question: 'What is the difference between fatigue and overtraining?',
    answer:
      'Fatigue is temporary and resolves with rest. Overtraining is chronic fatigue that persists despite rest, often with performance decline, mood changes, and physiological imbalances lasting weeks to months.',
  },
  {
    question: 'How can I reduce training fatigue?',
    answer:
      'Reduce volume or intensity, increase rest days, improve sleep quality and duration, optimize nutrition and hydration, manage stress, and include active recovery (light movement, stretching).',
  },
  {
    question: 'Should I train through fatigue?',
    answer:
      'Mild fatigue is normal and trainable. Moderate fatigue may require lighter sessions. High fatigue requires rest. Very high fatigue requires extended recovery. Listen to your body and adjust training accordingly.',
  },
  {
    question: 'How does sleep affect fatigue?',
    answer:
      'Sleep is critical for recovery. Poor sleep increases fatigue, reduces performance, and impairs recovery. Aim for 7-9 hours of quality sleep. Less than 6-7 hours significantly increases fatigue accumulation.',
  },
  {
    question: 'What are signs of excessive fatigue?',
    answer:
      'Persistent soreness, decreased performance, loss of motivation, mood changes, poor sleep quality, increased resting heart rate, frequent illness, and difficulty recovering between sessions.',
  },
  {
    question: 'How do I prevent fatigue?',
    answer:
      'Periodize training (vary volume and intensity), include rest days and deload weeks, prioritize sleep and nutrition, manage stress, listen to your body, and track training load relative to recovery capacity.',
  },
];

const relatedCalculators = [
  {
    name: 'Central Nervous System (CNS) Fatigue Recovery Wellness Guide',
    slug: 'central-nervous-system-cns-fatigue-recovery-calculator',
    description: 'Get wellness insights about CNS fatigue recovery time.',
  },
  {
    name: 'Training Stress Score Calculator',
    slug: 'running-pace-calculator',
    description: 'Assess training load and stress accumulation.',
  },
  {
    name: 'HRV Recovery Optimization Wellness Score',
    slug: 'hrv-recovery-optimization-score-calculator',
    description: 'Get wellness insights about recovery readiness using HRV metrics.',
  },
  {
    name: 'Rest Time Between Sets Calculator',
    slug: 'rest-time-between-sets-calculator',
    description: 'Optimize rest periods for recovery between sets.',
  },
];

const baseUrl = 'https://mycalculating.com/health-fitness/training-fatigue-index-calculator';

const schemaMarkup = {
  '@context': 'https://schema.org',
  '@graph': [
    {
      '@type': 'BreadcrumbList',
      itemListElement: [
        { '@type': 'ListItem', position: 1, name: 'Home', item: 'https://mycalculating.com' },
        { '@type': 'ListItem', position: 2, name: 'Health & Fitness', item: 'https://mycalculating.com/health-fitness' },
        { '@type': 'ListItem', position: 3, name: 'Training Fatigue Wellness Index', item: baseUrl },
      ],
    },
    {
      '@type': 'SoftwareApplication',
      name: 'Training Fatigue Wellness Index',
      applicationCategory: 'Calculator',
      operatingSystem: 'Web Browser',
      description: 'Get general wellness insights about training fatigue based on training volume, frequency, intensity, recovery days, and sleep. This is a personal lifestyle insight, not a medical evaluation.',
      url: baseUrl,
      offers: { '@type': 'Offer', price: '0', priceCurrency: 'USD' },
    },
  ],
};

const clamp = (value: number, min: number, max: number) => Math.min(max, Math.max(min, value));

const calculateResult = (values: FormValues): ResultPayload => {
  // Base fatigue from training volume (normalized)
  const volumeFatigue = (values.trainingVolume / 10) * 20; // Max 100 at 50 hours/week
  
  // Fatigue from frequency (more sessions = more fatigue)
  const frequencyFatigue = (values.trainingFrequency / 7) * 15; // Max 15 at 7+ sessions
  
  // Fatigue from intensity (exponential)
  const intensityFatigue = Math.pow(values.intensityLevel / 10, 1.5) * 30; // Max 30
  
  // Recovery reduces fatigue
  const recoveryReduction = (values.recoveryDays / 3) * 25; // Max 25 reduction at 3+ days
  
  let fatigueIndex = volumeFatigue + frequencyFatigue + intensityFatigue - recoveryReduction;
  
  // Adjust for sleep
  if (values.sleepHours) {
    const sleepAdjustment = (values.sleepHours - 7) / 1; // -4 to +5 based on 3-12 hours
    fatigueIndex = fatigueIndex - (sleepAdjustment * 5); // Better sleep reduces fatigue
  }
  
  // Adjust for perceived exertion
  if (values.perceivedExertion) {
    const exertionAdjustment = ((values.perceivedExertion - 5) / 5) * 15; // -15 to +15
    fatigueIndex = fatigueIndex + exertionAdjustment;
  }
  
  // Clamp to 0-100 scale
  fatigueIndex = clamp(fatigueIndex, 0, 100);
  
  let status: ResultPayload['status'] = 'low';
  let fatigueLevel = 'Low';
  let interpretation = 'This suggests a general lifestyle tendency where your training fatigue index may be low. You may appear well-recovered and ready for training.';
  
  if (fatigueIndex < 30) {
    status = 'low';
    fatigueLevel = 'Low';
  } else if (fatigueIndex < 50) {
    status = 'moderate';
    fatigueLevel = 'Moderate';
    interpretation = 'This suggests a general lifestyle tendency where your training fatigue index is moderate. You may consider monitoring recovery and considering lighter sessions or additional rest if fatigue increases.';
  } else if (fatigueIndex < 70) {
    status = 'high';
    fatigueLevel = 'High';
    interpretation = 'This suggests a general lifestyle tendency where your training fatigue index is high. You may consider reducing training load, increasing recovery, and prioritizing rest to support wellness.';
  } else {
    status = 'very-high';
    fatigueLevel = 'Very High';
    interpretation = 'This suggests a general lifestyle tendency where your training fatigue index is very high. You may consider taking extended rest, reducing or pausing training, and focusing on recovery to support wellness.';
  }
  
  const recommendations = [
    'You may consider ensuring adequate recovery days: aim for at least 1-2 full rest days per week, more if fatigue is high. This is a personal insight, not a medical evaluation.',
    'You may consider prioritizing sleep: get 7-9 hours of quality sleep per night. Poor sleep may increase fatigue accumulation.',
    'You may consider periodizing training: vary volume and intensity week to week. Include deload weeks every 4-8 weeks.',
  ];
  if (values.recoveryDays < 2) {
    recommendations.push('You may consider increasing recovery days. Insufficient rest days may lead to excessive fatigue accumulation.');
  }
  if (values.intensityLevel > 8) {
    recommendations.push('You may consider reducing training intensity or frequency. Very high intensity training may require more recovery time.');
  }
  if (values.sleepHours && values.sleepHours < 7) {
    recommendations.push('You may consider improving sleep duration and quality. Inadequate sleep may impair recovery and increase fatigue.');
  }
  if (fatigueIndex > 50) {
    recommendations.push('You may consider a deload week: reduce volume by 50-70% and intensity by 10-20% to allow recovery.');
  }
  
  const plan = [
    { label: 'This Week', detail: 'You may consider monitoring fatigue levels and recovery. Note any persistent soreness, performance changes, or mood patterns.' },
    { label: 'This Month', detail: 'You may consider adjusting training load based on fatigue index. Add rest days, reduce volume/intensity if needed, and optimize sleep and nutrition.' },
    { label: 'Ongoing', detail: 'You may consider maintaining balanced training with adequate recovery. Use fatigue index to guide training decisions and support wellness.' },
  ];
  
  return { fatigueIndex, fatigueLevel, status, interpretation, recommendations, plan };
};

export default function TrainingFatigueIndexCalculator() {
  const [result, setResult] = useState<ResultPayload | null>(null);
  
  const form = useForm<FormValues>({
    resolver: zodResolver(formSchema),
    defaultValues: {
      trainingVolume: undefined,
      trainingFrequency: undefined,
      intensityLevel: undefined,
      recoveryDays: undefined,
      sleepHours: undefined,
      perceivedExertion: undefined,
    },
  });
  
  return (
    <div className="space-y-8">
      <Script id="training-fatigue-schema" type="application/ld+json" strategy="afterInteractive" dangerouslySetInnerHTML={{ __html: JSON.stringify(schemaMarkup) }} />
      
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <Activity className="h-5 w-5" />
            Training Fatigue Wellness Index
          </CardTitle>
          <CardDescription>Get general wellness insights about training fatigue based on training volume, frequency, intensity, recovery days, and sleep. This is a personal lifestyle insight, not a medical evaluation.</CardDescription>
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
                  name="trainingVolume"
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel>Training volume (hours/week)</FormLabel>
                      <FormControl>
                        <Input type="number" step="0.5" placeholder="e.g., 8" value={field.value ?? ''} onChange={(e) => field.onChange(e.target.value === '' ? undefined : Number(e.target.value))} />
                      </FormControl>
                      <FormMessage />
                    </FormItem>
                  )}
                />
                <FormField
                  control={form.control}
                  name="trainingFrequency"
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel>Training frequency (sessions/week)</FormLabel>
                      <FormControl>
                        <Input type="number" step="1" placeholder="e.g., 4" value={field.value ?? ''} onChange={(e) => field.onChange(e.target.value === '' ? undefined : Number(e.target.value))} />
                      </FormControl>
                      <FormMessage />
                    </FormItem>
                  )}
                />
                <FormField
                  control={form.control}
                  name="intensityLevel"
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel>Intensity level (1-10)</FormLabel>
                      <FormControl>
                        <Input type="number" step="1" placeholder="e.g., 7" value={field.value ?? ''} onChange={(e) => field.onChange(e.target.value === '' ? undefined : Number(e.target.value))} />
                      </FormControl>
                      <FormMessage />
                    </FormItem>
                  )}
                />
                <FormField
                  control={form.control}
                  name="recoveryDays"
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel>Recovery days per week</FormLabel>
                      <FormControl>
                        <Input type="number" step="1" placeholder="e.g., 2" value={field.value ?? ''} onChange={(e) => field.onChange(e.target.value === '' ? undefined : Number(e.target.value))} />
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
                      <FormLabel>Average sleep hours (optional)</FormLabel>
                      <FormControl>
                        <Input type="number" step="0.5" placeholder="e.g., 7.5" value={field.value ?? ''} onChange={(e) => field.onChange(e.target.value === '' ? undefined : Number(e.target.value))} />
                      </FormControl>
                      <FormMessage />
                    </FormItem>
                  )}
                />
                <FormField
                  control={form.control}
                  name="perceivedExertion"
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel>Perceived exertion (1-10, optional)</FormLabel>
                      <FormControl>
                        <Input type="number" step="1" placeholder="e.g., 6" value={field.value ?? ''} onChange={(e) => field.onChange(e.target.value === '' ? undefined : Number(e.target.value))} />
                      </FormControl>
                      <FormMessage />
                    </FormItem>
                  )}
                />
              </div>
              <Button type="submit" className="w-full md:w-auto">
                Calculate fatigue index
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
            <CardDescription>See fatigue index, level, and recommendations.</CardDescription>
          </CardHeader>
          <CardContent className="space-y-6">
            <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
              <div className="p-4 border rounded">
                <p className="text-sm text-muted-foreground">Fatigue index</p>
                <p className="text-2xl font-semibold text-primary">{result.fatigueIndex.toFixed(1)}</p>
                <p className="text-xs text-muted-foreground">Out of 100</p>
              </div>
              <div className="p-4 border rounded">
                <p className="text-sm text-muted-foreground">Fatigue level</p>
                <p className="text-2xl font-semibold text-primary">{result.fatigueLevel}</p>
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
            <strong>Volume fatigue</strong> = (Training volume / 10) Ã— 20 (max 100 at 50+ hours/week).
          </p>
          <p>
            <strong>Frequency fatigue</strong> = (Training frequency / 7) Ã— 15 (max 15 at 7+ sessions/week).
          </p>
          <p>
            <strong>Intensity fatigue</strong> = (Intensity level / 10)^1.5 Ã— 30 (max 30 at intensity 10).
          </p>
          <p>
            <strong>Recovery reduction</strong> = (Recovery days / 3) Ã— 25 (max 25 reduction at 3+ days).
          </p>
          <p>
            <strong>Sleep adjustment</strong> = -((Sleep hours - 7) Ã— 5) (better sleep reduces fatigue).
          </p>
          <p>
            <strong>Perceived exertion adjustment</strong> = ((Perceived exertion - 5) / 5) Ã— 15.
          </p>
          <p>
            <strong>Fatigue index</strong> = Volume fatigue + Frequency fatigue + Intensity fatigue - Recovery reduction + Sleep adjustment + Exertion adjustment (clamped 0-100).
          </p>
          <p>Higher values indicate greater fatigue accumulation. Values above 70 suggest need for extended recovery.</p>
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
          <p>Training fatigue is the cumulative physical and mental exhaustion from training. Proper fatigue management prevents overtraining and optimizes performance and recovery.</p>
          <p>Use this calculator to assess training fatigue index based on training volume, frequency, intensity, recovery days, sleep, and perceived exertion to guide training decisions and prevent overtraining.</p>
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
          <p>This tool provides general wellness insights about training fatigue based on training volume, frequency, intensity level, recovery days, sleep hours, and perceived exertion. This is a personal lifestyle insight, not a medical evaluation.</p>
          <p>Outputs include fatigue index (0-100), fatigue level, status, recommendations, an action plan, and supporting metrics.</p>
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



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
  screenTimeHours: z.number({ invalid_type_error: 'Enter screen time hours' }).min(0).max(24),
  bedtimeScreenTime: z.number({ invalid_type_error: 'Enter bedtime screen time' }).min(0).max(4),
  sleepQuality: z.number({ invalid_type_error: 'Enter sleep quality' }).min(1).max(10),
  blueLightBlocking: z.number({ invalid_type_error: 'Enter blue light blocking usage' }).min(0).max(10).optional(),
});

type FormValues = z.infer<typeof formSchema>;

type ResultPayload = {
  screenImpactScore: number;
  blueLightExposure: number;
  sleepQualityImpact: string;
  recommendedScreenCutoff: string;
  status: 'optimal' | 'good' | 'moderate' | 'low';
  interpretation: string;
  recommendations: string[];
  plan: { label: string; detail: string }[];
};

const steps = [
  'Enter total daily screen time in hours.',
  'Enter hours of screen time in the 2 hours before bedtime.',
  'Rate your overall sleep quality (1 = poor, 10 = excellent).',
  'Optionally rate your blue light blocking usage (0 = none, 10 = always use filters/glasses).',
  'Review screen exposure impact, recommendations, and optimal screen cutoff time.',
];

const faqs = [
  {
    question: 'How does screen time affect sleep?',
    answer:
      'Screen time, especially before bed, exposes you to blue light which suppresses melatonin production, delays sleep onset, and reduces sleep quality. The light and content can also be mentally stimulating.',
  },
  {
    question: 'What is blue light and why is it problematic?',
    answer:
      'Blue light is a high-energy visible light emitted by screens. It suppresses melatonin, the hormone that regulates sleep-wake cycles. Exposure before bedtime can delay sleep by 30-60 minutes or more.',
  },
  {
    question: 'How long before bed should I stop using screens?',
    answer:
      'Ideally, stop using screens 1-2 hours before bedtime. However, even 30-60 minutes can help. The exact time depends on individual sensitivity and whether you use blue light filters.',
  },
  {
    question: 'Do blue light filters or glasses help?',
    answer:
      'Yes, but they don\'t eliminate the problem completely. Blue light filters can reduce melatonin suppression by 50-60%, but the mental stimulation from content and the light itself still affect sleep quality.',
  },
  {
    question: 'Does the type of screen matter?',
    answer:
      'Yes. LED/LCD screens (phones, tablets, TVs) emit more blue light than e-ink or OLED screens. Brightness level also matters - dimmer screens have less impact than bright ones.',
  },
  {
    question: 'Can I use devices with night mode enabled?',
    answer:
      'Night mode (blue light filters) helps but isn\'t a complete solution. While it reduces blue light exposure, the mental stimulation from engaging content can still interfere with sleep quality.',
  },
  {
    question: 'What about audiobooks or podcasts on devices?',
    answer:
      'Audio content is generally better than visual content, but using a screen device still exposes you to light. Consider using a separate audio device or keeping the screen off/turned away.',
  },
  {
    question: 'How does screen time throughout the day affect sleep?',
    answer:
      'Excessive screen time during the day can lead to eye strain, mental fatigue, and disrupted circadian rhythms, all of which can indirectly affect nighttime sleep quality even if you avoid screens before bed.',
  },
  {
    question: 'Are there apps that can help?',
    answer:
      'Yes. Screen time tracking apps can help monitor usage. Blue light filter apps can reduce exposure. Some devices have built-in features like Night Shift (iOS) or Night Light (Windows) that adjust colors.',
  },
  {
    question: 'What are good alternatives to screen time before bed?',
    answer:
      'Good alternatives include reading (physical books or e-ink), gentle stretching, meditation, journaling, listening to calming music, or having a warm bath. These activities help prepare your body for sleep.',
  },
];

const relatedCalculators = [
  {
    name: 'Sleep Cycle Wake-Up Comfort Planner',
    slug: 'sleep-cycle-alarm-time-optimizer',
    description: 'Plan comfortable wake-up times for better rest.',
  },
  {
    name: 'Sleep Quality vs Productivity Correlation Calculator',
    slug: 'sleep-quality-vs-productivity-correlation-calculator',
    description: 'Monitor overall sleep quality and productivity.',
  },
  {
    name: 'Blue Light Exposure Calculator',
    slug: 'blue-light-exposure-calculator',
    description: 'Calculate blue light exposure impact.',
  },
  {
    name: 'Screen Time vs Sleep Impact Calculator',
    slug: 'screen-time-vs-sleep-impact-calculator',
    description: 'Analyze screen time effects on sleep.',
  },
];

const baseUrl = 'https://mycalculating.com/health-fitness/sleep-quality-vs-screen-exposure-analyzer';

const schemaMarkup = {
  '@context': 'https://schema.org',
  '@graph': [
    {
      '@type': 'BreadcrumbList',
      itemListElement: [
        { '@type': 'ListItem', position: 1, name: 'Home', item: 'https://mycalculating.com' },
        { '@type': 'ListItem', position: 2, name: 'Health & Fitness', item: 'https://mycalculating.com/health-fitness' },
        { '@type': 'ListItem', position: 3, name: 'Sleep & Screen Time Wellness Analyzer', item: baseUrl },
      ],
    },
    {
      '@type': 'SoftwareApplication',
      name: 'Sleep & Screen Time Wellness Analyzer',
      applicationCategory: 'Calculator',
      operatingSystem: 'Web Browser',
      description: 'Get general wellness insights about the relationship between screen exposure time and sleep quality. This is a personal lifestyle insight, not a medical evaluation.',
      url: baseUrl,
      offers: { '@type': 'Offer', price: '0', priceCurrency: 'USD' },
    },
  ],
};

const calculateResult = (values: FormValues): ResultPayload => {
  // Calculate blue light exposure score (0-100)
  const blueLightBlocking = values.blueLightBlocking ?? 0;
  const blockingFactor = 1 - (blueLightBlocking / 10) * 0.6; // Max 60% reduction with perfect blocking
  
  const bedtimeBlueLight = values.bedtimeScreenTime * blockingFactor * 100;
  const dailyBlueLight = values.screenTimeHours * blockingFactor * 10;
  const blueLightExposure = Math.min(100, bedtimeBlueLight + dailyBlueLight * 0.2);
  
  // Calculate screen impact score (higher = worse)
  const bedtimeImpact = values.bedtimeScreenTime * 25; // Max 100 for 4 hours
  const dailyImpact = Math.min(30, values.screenTimeHours * 1.5); // Max 30 for daily exposure
  const screenImpactScore = Math.min(100, bedtimeImpact + dailyImpact);
  
  // Determine sleep quality impact
  const expectedSleepQuality = Math.max(1, Math.min(10, 10 - (screenImpactScore / 15)));
  const actualSleepQuality = values.sleepQuality;
  const qualityDifference = actualSleepQuality - expectedSleepQuality;
  
  let sleepQualityImpact: string;
  if (qualityDifference > 2) {
    sleepQualityImpact = 'Your sleep quality rating is better than expected given your screen exposure patterns. This suggests you may have effective habits that support restful sleep.';
  } else if (qualityDifference > 0) {
    sleepQualityImpact = 'Your sleep quality rating is slightly better than expected given your screen exposure level.';
  } else if (qualityDifference > -2) {
    sleepQualityImpact = 'Your sleep quality rating aligns with what might be expected given your screen exposure patterns.';
  } else {
    sleepQualityImpact = 'This suggests your current screen habits may influence how rested you feel. Consider lifestyle adjustments such as reducing evening screen time.';
  }
  
  // Calculate recommended screen cutoff time
  const currentHour = new Date().getHours();
  let recommendedCutoff = currentHour - 2;
  if (recommendedCutoff < 0) recommendedCutoff += 24;
  const recommendedScreenCutoff = `${String(recommendedCutoff).padStart(2, '0')}:00`;
  
  let status: ResultPayload['status'] = 'optimal';
  let interpretation = 'Your estimated screen-sleep wellness score suggests your current screen habits may support restful sleep.';
  
  if (screenImpactScore >= 70 || values.bedtimeScreenTime >= 2) {
    status = 'low';
    interpretation = 'This suggests a general lifestyle tendency where your screen exposure, especially before bedtime, may influence how rested you feel. You may consider lifestyle improvements such as reducing evening screen time.';
  } else if (screenImpactScore >= 50 || values.bedtimeScreenTime >= 1) {
    status = 'moderate';
    interpretation = 'This suggests a general lifestyle tendency where your screen exposure before bedtime may affect sleep quality. You may consider reducing screen time in the hours before sleep.';
  } else if (screenImpactScore >= 30) {
    status = 'good';
    interpretation = 'This suggests a general lifestyle tendency where your screen exposure is manageable, but there may be room for improvement. You may consider setting a screen cutoff time before bed.';
  }
  
  const recommendations = [
    `Stop using screens at least 1-2 hours before bedtime. Set a cutoff time of ${recommendedScreenCutoff} to improve sleep quality.`,
    'Use blue light filters or glasses, especially in the 2 hours before bed, to reduce melatonin suppression.',
    'Keep screens out of the bedroom or use them only with night mode enabled at minimum brightness.',
  ];
  
  if (values.bedtimeScreenTime >= 1.5) {
    recommendations.push('Your bedtime screen time is very high. Try replacing evening screen activities with reading, meditation, or gentle activities.');
  }
  
  if (values.blueLightBlocking === undefined || values.blueLightBlocking < 5) {
    recommendations.push('Consider using blue light blocking glasses or enabling device night mode to reduce blue light exposure.');
  }
  
  if (values.screenTimeHours > 8) {
    recommendations.push('High daily screen time can affect circadian rhythms. Take regular breaks and get natural light exposure during the day.');
  }
  
  const plan = [
    { label: 'This Week', detail: 'Set a screen cutoff time 1-2 hours before bed. Use blue light filters or glasses during evening screen use.' },
    { label: 'This Month', detail: 'Establish a consistent bedtime routine without screens. Replace evening screen activities with reading, stretching, or relaxation.' },
    { label: 'Ongoing', detail: 'Monitor your sleep quality as you reduce screen exposure. Track improvements and adjust your screen habits accordingly.' },
  ];
  
  return { screenImpactScore, blueLightExposure, sleepQualityImpact, recommendedScreenCutoff, status, interpretation, recommendations, plan };
};

export default function SleepQualityVsScreenExposureAnalyzer() {
  const [result, setResult] = useState<ResultPayload | null>(null);

  const form = useForm<FormValues>({
    resolver: zodResolver(formSchema),
    defaultValues: {
      screenTimeHours: undefined,
      bedtimeScreenTime: undefined,
      sleepQuality: undefined,
      blueLightBlocking: undefined,
    },
  });

  return (
    <div className="space-y-8">
      <Script id="screen-exposure-schema" type="application/ld+json" strategy="afterInteractive" dangerouslySetInnerHTML={{ __html: JSON.stringify(schemaMarkup) }} />

      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <Moon className="h-5 w-5" />
            Sleep & Screen Time Wellness Analyzer
          </CardTitle>
          <CardDescription>Get general wellness insights about the relationship between screen exposure time and sleep quality. This is a personal lifestyle insight, not a medical evaluation.</CardDescription>
        </CardHeader>
      </Card>

      <Card>
        <CardHeader>
          <CardTitle>Input your screen exposure data</CardTitle>
        </CardHeader>
        <CardContent>
          <Form {...form}>
            <form onSubmit={form.handleSubmit((values) => setResult(calculateResult(values)))} className="space-y-6">
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <FormField
                  control={form.control}
                  name="screenTimeHours"
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel>Total daily screen time (hours)</FormLabel>
                      <FormControl>
                        <Input type="number" step="0.5" placeholder="e.g., 8" value={field.value ?? ''} onChange={(e) => field.onChange(e.target.value === '' ? undefined : Number(e.target.value))} />
                      </FormControl>
                      <FormMessage />
                    </FormItem>
                  )}
                />
                <FormField
                  control={form.control}
                  name="bedtimeScreenTime"
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel>Screen time 2 hours before bed (hours)</FormLabel>
                      <FormControl>
                        <Input type="number" step="0.25" placeholder="e.g., 1.5" value={field.value ?? ''} onChange={(e) => field.onChange(e.target.value === '' ? undefined : Number(e.target.value))} />
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
                        <Input type="number" step="1" placeholder="e.g., 7" value={field.value ?? ''} onChange={(e) => field.onChange(e.target.value === '' ? undefined : Number(e.target.value))} />
                      </FormControl>
                      <FormMessage />
                    </FormItem>
                  )}
                />
                <FormField
                  control={form.control}
                  name="blueLightBlocking"
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel>Blue light blocking usage (0-10, optional)</FormLabel>
                      <FormControl>
                        <Input type="number" step="1" placeholder="e.g., 5" value={field.value ?? ''} onChange={(e) => field.onChange(e.target.value === '' ? undefined : Number(e.target.value))} />
                      </FormControl>
                      <FormMessage />
                    </FormItem>
                  )}
                />
              </div>
              <Button type="submit" className="w-full md:w-auto">
                Analyze screen exposure impact
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
            <CardDescription>See screen exposure impact, blue light exposure, and recommendations.</CardDescription>
          </CardHeader>
          <CardContent className="space-y-6">
            <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
              <div className="p-4 border rounded">
                <p className="text-sm text-muted-foreground">Screen impact score</p>
                <p className="text-2xl font-semibold text-primary">{result.screenImpactScore.toFixed(0)}/100</p>
                <p className="text-xs text-muted-foreground">Higher = worse</p>
              </div>
              <div className="p-4 border rounded">
                <p className="text-sm text-muted-foreground">Blue light exposure</p>
                <p className="text-2xl font-semibold text-primary">{result.blueLightExposure.toFixed(0)}%</p>
                <p className="text-xs text-muted-foreground">Estimated impact</p>
              </div>
              <div className="p-4 border rounded">
                <p className="text-sm text-muted-foreground">Recommended cutoff</p>
                <p className="text-2xl font-semibold text-primary">{result.recommendedScreenCutoff}</p>
                <p className="text-xs text-muted-foreground">Stop screens by</p>
              </div>
              <div className="p-4 border rounded">
                <p className="text-sm text-muted-foreground">Status</p>
                <p className="text-2xl font-semibold text-primary capitalize">{result.status}</p>
                <p className="text-xs text-muted-foreground">{result.interpretation}</p>
              </div>
            </div>
            <div className="p-4 border rounded">
              <p className="text-sm font-semibold mb-2">Sleep quality impact</p>
              <p className="text-sm text-muted-foreground">{result.sleepQualityImpact}</p>
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
            <strong>Screen impact score</strong> = (Bedtime screen time Ã— 25) + (Daily screen time Ã— 1.5), capped at 100.
          </p>
          <p>
            <strong>Blue light exposure</strong> = (Bedtime screen time Ã— blocking factor Ã— 100) + (Daily screen time Ã— blocking factor Ã— 2).
          </p>
          <p>
            <strong>Blocking factor</strong> = 1 - (Blue light blocking usage / 10) Ã— 0.6 (reduces exposure up to 60%).
          </p>
          <p>Bedtime screen time (within 2 hours of sleep) has a much greater impact than general daily screen time due to melatonin suppression and mental stimulation.</p>
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
                <p className="text-sm text-muted-foreground">Blue light exposure level</p>
                <p className="text-xl font-semibold text-primary">
                  {result.blueLightExposure > 50 ? 'Higher' : result.blueLightExposure > 25 ? 'Moderate' : 'Lower'}
                </p>
                <p className="text-xs text-muted-foreground">Estimated exposure</p>
              </div>
              <div className="p-4 border rounded">
                <p className="text-sm text-muted-foreground">Sleep delay estimate</p>
                <p className="text-xl font-semibold text-primary">
                  {result.blueLightExposure > 50 ? '30-60+ min' : result.blueLightExposure > 25 ? '15-30 min' : '<15 min'}
                </p>
                <p className="text-xs text-muted-foreground">Potential delay</p>
              </div>
              <div className="p-4 border rounded">
                <p className="text-sm text-muted-foreground">Improvement potential</p>
                <p className="text-xl font-semibold text-primary">
                  {result.screenImpactScore > 50 ? 'High' : result.screenImpactScore > 30 ? 'Moderate' : 'Low'}
                </p>
                <p className="text-xs text-muted-foreground">With reduced exposure</p>
              </div>
            </div>
          ) : (
            <p className="text-sm text-muted-foreground">Enter your screen exposure data to see additional insights.</p>
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
                <Link href={`/${calc.slug}`} className="text-primary hover:underline">
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
          <p>Screen exposure, particularly in the hours before bedtime, significantly impacts sleep quality through blue light exposure (which suppresses melatonin) and mental stimulation. Understanding this relationship helps optimize bedtime routines for better rest.</p>
          <p>Use this analyzer to assess how your screen time patterns affect sleep quality and receive personalized recommendations for reducing screen exposure before bed.</p>
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
          <p>This tool provides general wellness insights about the relationship between screen exposure time and sleep quality. This is a personal lifestyle insight, not a medical evaluation.</p>
          <p>Outputs include screen-sleep wellness score, blue light exposure estimate, sleep quality insight, suggested screen cutoff time, status, recommendations, an action plan, and supporting metrics.</p>
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


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
  timeZonesCrossed: z.number({ invalid_type_error: 'Enter time zones crossed' }).min(1).max(12),
  direction: z.enum(['east', 'west'], { invalid_type_error: 'Select direction' }),
  age: z.number({ invalid_type_error: 'Enter age' }).min(18).max(100),
  adjustmentStrategies: z.number({ invalid_type_error: 'Enter adjustment strategies' }).min(0).max(10).optional(),
});

type FormValues = z.infer<typeof formSchema>;

type ResultPayload = {
  recoveryDays: number;
  recoveryHours: number;
  difficultyLevel: string;
  adjustmentRate: number;
  status: 'optimal' | 'good' | 'moderate' | 'low';
  interpretation: string;
  recommendations: string[];
  plan: { label: string; detail: string }[];
};

const steps = [
  'Enter the number of time zones you crossed during travel.',
  'Select travel direction (east or west).',
  'Enter your age (recovery time increases with age).',
  'Optionally rate your use of adjustment strategies (0 = none, 10 = comprehensive).',
  'Review recovery duration, difficulty level, adjustment recommendations, and timeline.',
];

const faqs = [
  {
    question: 'What causes jet lag?',
    answer:
      'Jet lag occurs when your internal circadian rhythm (body clock) is out of sync with the new time zone. Your body needs time to adjust to new light-dark cycles, meal times, and sleep schedules.',
  },
  {
    question: 'Why is eastward travel harder?',
    answer:
      'Eastward travel requires you to advance your body clock (go to bed earlier), which is generally harder than delaying it (westward travel). Your natural circadian rhythm tends to be slightly longer than 24 hours, making delays easier.',
  },
  {
    question: 'How long does jet lag typically last?',
    answer:
      'General rule: recovery takes about 1 day per time zone crossed. Eastward travel may take 1-1.5 days per zone, while westward travel may take 0.5-1 day per zone. Full adjustment can take 3-7 days for significant time differences.',
  },
  {
    question: 'Does age affect jet lag recovery?',
    answer:
      'Yes. Older adults typically experience more severe jet lag and take longer to recover. This is due to changes in circadian rhythms and sleep patterns that occur with aging.',
  },
  {
    question: 'What are effective jet lag strategies?',
    answer:
      'Strategies include: adjusting sleep schedule before travel, exposure to natural light at destination, staying hydrated, avoiding alcohol/caffeine, using melatonin (with medical advice), and gradual adjustment of meal times.',
  },
  {
    question: 'Should I adjust my schedule before traveling?',
    answer:
      'Yes, if possible. Gradually shift your sleep schedule toward the destination time zone 2-3 days before travel. This can reduce the severity and duration of jet lag upon arrival.',
  },
  {
    question: 'How does light exposure help?',
    answer:
      'Light is the primary cue for your circadian rhythm. Get morning light when traveling east (to advance your clock) and evening light when traveling west (to delay your clock). Avoid light at the wrong times.',
  },
  {
    question: 'Can medication help with jet lag?',
    answer:
      'Melatonin supplements may help, especially for eastward travel, but should be used under medical guidance. Some people use short-acting sleep aids temporarily, but these don\'t actually shift your body clock.',
  },
  {
    question: 'What about staying on home time?',
    answer:
      'For very short trips (1-2 days), staying on home time can work. For longer trips, adjusting to local time is usually better. The decision depends on trip duration and purpose.',
  },
  {
    question: 'How can I minimize jet lag symptoms?',
    answer:
      'Stay hydrated, avoid alcohol and caffeine initially, get natural light exposure at appropriate times, maintain healthy sleep habits, consider light therapy, and be patient with the adjustment process.',
  },
];

const relatedCalculators = [
  {
    name: 'Sleep Cycle Wake-Up Comfort Planner',
    slug: 'sleep-cycle-alarm-time-optimizer',
    description: 'Plan comfortable sleep timing during jet lag recovery.',
  },
  {
    name: 'Sleep Debt Recovery Planner',
    slug: 'recovery-sleep-requirement-after-sleep-debt-calculator',
    description: 'Plan recovery sleep after travel-related sleep debt.',
  },
  {
    name: 'Sleep & Screen Time Wellness Analyzer',
    slug: 'sleep-quality-vs-screen-exposure-analyzer',
    description: 'Get wellness insights about light exposure for jet lag adjustment.',
  },
  {
    name: 'Sleep Efficiency Calculator',
    slug: 'sleep-efficiency-calculator',
    description: 'Calculate sleep efficiency during jet lag recovery.',
  },
];

const baseUrl = 'https://mycalculating.com/health-fitness/jet-lag-recovery-duration-calculator';

const schemaMarkup = {
  '@context': 'https://schema.org',
  '@graph': [
    {
      '@type': 'BreadcrumbList',
      itemListElement: [
        { '@type': 'ListItem', position: 1, name: 'Home', item: 'https://mycalculating.com' },
        { '@type': 'ListItem', position: 2, name: 'Health & Fitness', item: 'https://mycalculating.com/health-fitness' },
        { '@type': 'ListItem', position: 3, name: 'Jet Lag Recovery Wellness Estimator', item: baseUrl },
      ],
    },
    {
      '@type': 'SoftwareApplication',
      name: 'Jet Lag Recovery Wellness Estimator',
      applicationCategory: 'Calculator',
      operatingSystem: 'Web Browser',
      description: 'Get general wellness insights about jet lag recovery duration based on time zones crossed, direction of travel, age, and strategies. This is a personal lifestyle insight, not a medical evaluation.',
      url: baseUrl,
      offers: { '@type': 'Offer', price: '0', priceCurrency: 'USD' },
    },
  ],
};

const calculateResult = (values: FormValues): ResultPayload => {
  const timeZones = values.timeZonesCrossed;
  const direction = values.direction;
  const age = values.age;
  const strategies = values.adjustmentStrategies ?? 0;
  
  // Base recovery: eastward is harder (1-1.5 days per zone), westward is easier (0.5-1 day per zone)
  let baseRecoveryDays: number;
  if (direction === 'east') {
    baseRecoveryDays = timeZones * 1.25; // Average 1.25 days per zone eastward
  } else {
    baseRecoveryDays = timeZones * 0.75; // Average 0.75 days per zone westward
  }
  
  // Age adjustment: older adults take longer (add 10% per decade over 40)
  let ageMultiplier = 1.0;
  if (age >= 60) {
    ageMultiplier = 1.3; // 30% longer for 60+
  } else if (age >= 50) {
    ageMultiplier = 1.2; // 20% longer for 50-59
  } else if (age >= 40) {
    ageMultiplier = 1.1; // 10% longer for 40-49
  }
  
  // Strategy adjustment: comprehensive strategies can reduce recovery by up to 40%
  const strategyReduction = (strategies / 10) * 0.4; // Up to 40% reduction
  const strategyMultiplier = 1 - strategyReduction;
  
  // Calculate final recovery days
  let recoveryDays = baseRecoveryDays * ageMultiplier * strategyMultiplier;
  
  // Minimum recovery: at least 0.5 days per zone, maximum 14 days
  recoveryDays = Math.max(timeZones * 0.5, Math.min(14, recoveryDays));
  
  const recoveryHours = recoveryDays * 24;
  const adjustmentRate = timeZones / recoveryDays; // Zones per day
  
  let difficultyLevel: string;
  if (timeZones >= 8 || (direction === 'east' && timeZones >= 6)) {
    difficultyLevel = 'Very High';
  } else if (timeZones >= 6 || (direction === 'east' && timeZones >= 4)) {
    difficultyLevel = 'High';
  } else if (timeZones >= 4) {
    difficultyLevel = 'Moderate';
  } else {
    difficultyLevel = 'Low';
  }
  
  let status: ResultPayload['status'] = 'optimal';
  let interpretation = 'This suggests a general lifestyle tendency where your estimated recovery timeline may support feeling more adjusted after travel.';
  
  if (recoveryDays > 10) {
    status = 'low';
    interpretation = 'This suggests a general lifestyle tendency where recovery may take significant time. You may consider using comprehensive adjustment strategies and planning for gradual adaptation.';
  } else if (recoveryDays > 7) {
    status = 'moderate';
    interpretation = 'This suggests a general lifestyle tendency where recovery may take about a week. You may consider following adjustment strategies consistently to support feeling more adjusted.';
  } else if (recoveryDays > 4) {
    status = 'good';
    interpretation = 'This suggests a general lifestyle tendency where recovery may be manageable within a few days. Consistent use of adjustment strategies may help.';
  }
  
  const recommendations = [
    `Estimated recovery time: ${recoveryDays.toFixed(1)} days (${recoveryHours.toFixed(0)} hours). Adjustment level: ${difficultyLevel}.`,
    direction === 'east'
      ? 'For eastward travel: You may consider getting morning light exposure, going to bed earlier, and avoiding evening light. You may consider discussing melatonin with a qualified professional if appropriate.'
      : 'For westward travel: You may consider getting evening light exposure, staying up later, and avoiding morning light initially. Gradually shifting your schedule later may help.',
    'You may consider adjusting to local time immediately upon arrival. Resisting the urge to nap excessively or stay on home time may support adjustment.',
    'You may consider staying hydrated, avoiding alcohol and caffeine initially, and maintaining regular meal times aligned with local schedule.',
  ];
  
  if (strategies < 5) {
    recommendations.push('You may consider increasing use of adjustment strategies (light exposure, sleep schedule shifts) to support recovery. This is a personal insight, not a medical evaluation.');
  }
  
  if (age >= 50) {
    recommendations.push('Older adults may experience more adjustment time. You may consider allowing extra time for adjustment and being more diligent with light exposure and sleep schedule management.');
  }
  
  if (timeZones >= 6) {
    recommendations.push('For significant time zone differences, you may consider adjusting your sleep schedule 2-3 days before travel to support feeling more adjusted.');
  }
  
  const plan = [
    { label: 'Days 1-2', detail: 'You may consider adjusting to local time immediately. Getting appropriate light exposure (morning for eastward, evening for westward) may help. Maintaining local meal times and avoiding heavy meals and alcohol may support adjustment.' },
    { label: 'Days 3-5', detail: 'You may consider continuing light exposure strategies. Maintaining a consistent sleep schedule may help. You may start feeling more adjusted. Adjusting activity levels as energy returns may be beneficial.' },
    { label: 'Days 6+', detail: 'Full adjustment may be achieved. You may consider monitoring how rested you feel and energy levels. Maintaining a regular schedule may support ongoing wellness.' },
  ];
  
  return { recoveryDays, recoveryHours, difficultyLevel, adjustmentRate, status, interpretation, recommendations, plan };
};

export default function JetLagRecoveryDurationCalculator() {
  const [result, setResult] = useState<ResultPayload | null>(null);

  const form = useForm<FormValues>({
    resolver: zodResolver(formSchema),
    defaultValues: {
      timeZonesCrossed: undefined,
      direction: undefined,
      age: undefined,
      adjustmentStrategies: undefined,
    },
  });

  return (
    <div className="space-y-8">
      <Script id="jet-lag-schema" type="application/ld+json" strategy="afterInteractive" dangerouslySetInnerHTML={{ __html: JSON.stringify(schemaMarkup) }} />

      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <Moon className="h-5 w-5" />
            Jet Lag Recovery Wellness Estimator
          </CardTitle>
          <CardDescription>Get general wellness insights about jet lag recovery duration based on time zones crossed, direction of travel, age, and strategies. This is a personal lifestyle insight, not a medical evaluation.</CardDescription>
        </CardHeader>
      </Card>

      <Card>
        <CardHeader>
          <CardTitle>Input your travel data</CardTitle>
        </CardHeader>
        <CardContent>
          <Form {...form}>
            <form onSubmit={form.handleSubmit((values) => setResult(calculateResult(values)))} className="space-y-6">
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <FormField
                  control={form.control}
                  name="timeZonesCrossed"
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel>Time zones crossed</FormLabel>
                      <FormControl>
                        <Input type="number" step="1" placeholder="e.g., 6" value={field.value ?? ''} onChange={(e) => field.onChange(e.target.value === '' ? undefined : Number(e.target.value))} />
                      </FormControl>
                      <FormMessage />
                    </FormItem>
                  )}
                />
                <FormField
                  control={form.control}
                  name="direction"
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel>Travel direction</FormLabel>
                      <FormControl>
                        <select
                          value={field.value ?? ''}
                          onChange={(e) => field.onChange(e.target.value)}
                          className="flex h-10 w-full rounded-md border border-input bg-background px-3 py-2 text-sm ring-offset-background file:border-0 file:bg-transparent file:text-sm file:font-medium placeholder:text-muted-foreground focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2 disabled:cursor-not-allowed disabled:opacity-50"
                        >
                          <option value="">Select direction</option>
                          <option value="east">East</option>
                          <option value="west">West</option>
                        </select>
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
                <FormField
                  control={form.control}
                  name="adjustmentStrategies"
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel>Adjustment strategies usage (0-10, optional)</FormLabel>
                      <FormControl>
                        <Input type="number" step="1" placeholder="e.g., 7" value={field.value ?? ''} onChange={(e) => field.onChange(e.target.value === '' ? undefined : Number(e.target.value))} />
                      </FormControl>
                      <FormMessage />
                    </FormItem>
                  )}
                />
              </div>
              <Button type="submit" className="w-full md:w-auto">
                Calculate jet lag recovery
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
            <CardDescription>See recovery duration, difficulty level, adjustment rate, and recommendations.</CardDescription>
          </CardHeader>
          <CardContent className="space-y-6">
            <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
              <div className="p-4 border rounded">
                <p className="text-sm text-muted-foreground">Recovery duration</p>
                <p className="text-2xl font-semibold text-primary">{result.recoveryDays.toFixed(1)} days</p>
                <p className="text-xs text-muted-foreground">{result.recoveryHours.toFixed(0)} hours</p>
              </div>
              <div className="p-4 border rounded">
                <p className="text-sm text-muted-foreground">Difficulty level</p>
                <p className="text-2xl font-semibold text-primary">{result.difficultyLevel}</p>
                <p className="text-xs text-muted-foreground">Adjustment challenge</p>
              </div>
              <div className="p-4 border rounded">
                <p className="text-sm text-muted-foreground">Adjustment rate</p>
                <p className="text-2xl font-semibold text-primary">{result.adjustmentRate.toFixed(2)} zones/day</p>
                <p className="text-xs text-muted-foreground">Recovery speed</p>
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
            <strong>Base recovery days</strong> = Time zones Ã— Recovery factor. Eastward: 1.25 days/zone. Westward: 0.75 days/zone.
          </p>
          <p>
            <strong>Age adjustment</strong>: 40-49: +10%, 50-59: +20%, 60+: +30% to recovery time.
          </p>
          <p>
            <strong>Strategy adjustment</strong>: Comprehensive strategies (rating 10) can reduce recovery by up to 40%.
          </p>
          <p>
            <strong>Final recovery</strong> = Base recovery Ã— Age multiplier Ã— Strategy multiplier. Minimum: 0.5 days/zone. Maximum: 14 days.
          </p>
          <p>Eastward travel is generally more difficult because it requires advancing your body clock, which conflicts with your natural circadian tendency to delay.</p>
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
                <p className="text-sm text-muted-foreground">Time per zone</p>
                <p className="text-xl font-semibold text-primary">
                  {(result.recoveryDays / (form.getValues().timeZonesCrossed ?? 1)).toFixed(2)} days
                </p>
                <p className="text-xs text-muted-foreground">Recovery per zone</p>
              </div>
              <div className="p-4 border rounded">
                <p className="text-sm text-muted-foreground">Strategy impact</p>
                <p className="text-xl font-semibold text-primary">
                  {(() => {
                    const strategies = form.getValues().adjustmentStrategies ?? 0;
                    const reduction = (strategies / 10) * 40;
                    return reduction > 0 ? `-${reduction.toFixed(0)}%` : '0%';
                  })()}
                </p>
                <p className="text-xs text-muted-foreground">Recovery reduction</p>
              </div>
              <div className="p-4 border rounded">
                <p className="text-sm text-muted-foreground">Age impact</p>
                <p className="text-xl font-semibold text-primary">
                  {(() => {
                    const age = form.getValues().age ?? 35;
                    if (age >= 60) return '+30%';
                    if (age >= 50) return '+20%';
                    if (age >= 40) return '+10%';
                    return '0%';
                  })()}
                </p>
                <p className="text-xs text-muted-foreground">Recovery increase</p>
              </div>
            </div>
          ) : (
            <p className="text-sm text-muted-foreground">Enter your travel data to see additional insights.</p>
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
          <p>This tool provides general wellness insights about jet lag recovery. When your internal circadian rhythm is out of sync with a new time zone, you may experience adjustment time. Recovery time may depend on the number of time zones crossed, travel direction (eastward is typically more challenging), age, and use of adjustment strategies.</p>
          <p>Use this calculator to get general wellness insights about estimated recovery duration and receive lifestyle suggestions for supporting adjustment to the new time zone.</p>
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
          <p>This tool provides general wellness insights about jet lag recovery duration based on time zones crossed, direction of travel, age, and strategies. This is a personal lifestyle insight, not a medical evaluation.</p>
          <p>Outputs include estimated recovery duration in days and hours, adjustment level, adjustment rate, status, recommendations, an action plan, and supporting metrics.</p>
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


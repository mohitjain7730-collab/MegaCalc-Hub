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
  sleepDebtHours: z.number({ invalid_type_error: 'Enter sleep debt hours' }).min(0).max(100),
  targetSleepHours: z.number({ invalid_type_error: 'Enter target sleep hours' }).min(6).max(10),
  currentSleepHours: z.number({ invalid_type_error: 'Enter current sleep hours' }).min(4).max(12),
  recoveryDays: z.number({ invalid_type_error: 'Enter recovery days' }).min(1).max(30).optional(),
});

type FormValues = z.infer<typeof formSchema>;

type ResultPayload = {
  totalRecoverySleep: number;
  dailyRecoveryHours: number;
  recoveryTimeline: number;
  recoveryDays: number;
  status: 'optimal' | 'good' | 'moderate' | 'low';
  interpretation: string;
  recommendations: string[];
  plan: { label: string; detail: string }[];
};

const steps = [
  'Enter your total sleep debt in hours (difference between target and actual sleep over time).',
  'Enter your target sleep hours per night (ideal sleep duration).',
  'Enter your current average sleep hours per night.',
  'Optionally specify desired recovery timeline in days.',
  'Review recovery sleep requirements, daily sleep needs, timeline, and recommendations.',
];

const faqs = [
  {
    question: 'What is sleep debt?',
    answer:
      'Sleep debt is the cumulative difference between the amount of sleep you need and the amount you actually get. It accumulates over time and requires recovery to restore optimal functioning.',
  },
  {
    question: 'How do you calculate sleep debt?',
    answer:
      'Sleep debt = (Target sleep hours - Actual sleep hours) × Number of days. For example, if you need 8 hours but only get 6 hours for 5 days, you have 10 hours of sleep debt.',
  },
  {
    question: 'Can you fully recover from sleep debt?',
    answer:
      'Yes, but it takes time. While you can recover most of the effects, complete recovery may take several nights of adequate sleep. Some cognitive effects may take longer to fully resolve.',
  },
  {
    question: 'How much extra sleep do you need to recover?',
    answer:
      'You need to repay the sleep debt plus maintain your normal sleep needs. Recovery typically requires 1-2 extra hours per night for several days, rather than trying to "sleep it off" in one night.',
  },
  {
    question: 'Can you recover all sleep debt at once?',
    answer:
      'Not effectively. Sleeping 12-14 hours after significant debt can help, but gradual recovery over several nights is more effective and sustainable than one long sleep session.',
  },
  {
    question: 'How long does recovery take?',
    answer:
      'Recovery time depends on the amount of debt. Small debt (5-10 hours) may take 2-3 nights. Large debt (20+ hours) may take 1-2 weeks of consistent adequate sleep.',
  },
  {
    question: 'Does recovery sleep need to be consecutive?',
    answer:
      'While consecutive nights of good sleep are ideal, recovery can occur with consistent adequate sleep over time. The key is maintaining target sleep duration consistently.',
  },
  {
    question: 'What if I can\'t sleep extra hours?',
    answer:
      'If you can\'t immediately increase sleep time, focus on improving sleep quality first. Then gradually increase sleep duration as possible. Even partial recovery is beneficial.',
  },
  {
    question: 'Are there signs that recovery is working?',
    answer:
      'Signs of recovery include improved alertness during the day, better mood, easier waking, improved cognitive function, and feeling refreshed rather than groggy upon waking.',
  },
  {
    question: 'How do I prevent accumulating sleep debt again?',
    answer:
      'Prioritize sleep, maintain a consistent sleep schedule, avoid accumulating more debt by getting adequate sleep regularly, and address underlying issues that cause insufficient sleep.',
  },
];

const relatedCalculators = [
  {
    name: 'Sleep Debt Calculator',
    slug: 'habit-streak-tracker-calculator',
    description: 'Calculate current sleep debt accumulation.',
  },
  {
    name: 'Sleep Cycle Wake-Up Comfort Planner',
    slug: 'sleep-cycle-alarm-time-optimizer',
    description: 'Plan comfortable sleep timing for better recovery.',
  },
  {
    name: 'Sleep Restriction Adaptation Calculator',
    slug: 'sleep-restriction-adaptation-calculator',
    description: 'Improve sleep efficiency during recovery.',
  },
  {
    name: 'Sleep Quality vs Productivity Correlation Calculator',
    slug: 'sleep-quality-vs-productivity-correlation-calculator',
    description: 'Track recovery progress and productivity.',
  },
];

const baseUrl = 'https://mycalculating.com/category/health-fitness/recovery-sleep-requirement-after-sleep-debt-calculator';

const schemaMarkup = {
  '@context': 'https://schema.org',
  '@graph': [
    {
      '@type': 'BreadcrumbList',
      itemListElement: [
        { '@type': 'ListItem', position: 1, name: 'Home', item: 'https://mycalculating.com' },
        { '@type': 'ListItem', position: 2, name: 'Health & Fitness', item: 'https://mycalculating.com/category/health-fitness' },
        { '@type': 'ListItem', position: 3, name: 'Sleep Debt Recovery Planner', item: baseUrl },
      ],
    },
    {
      '@type': 'SoftwareApplication',
      name: 'Sleep Debt Recovery Planner',
      applicationCategory: 'Calculator',
      operatingSystem: 'Web Browser',
      description: 'Get general wellness insights about recovery sleep planning after sleep debt. This is a personal lifestyle insight, not a medical evaluation.',
      url: baseUrl,
      offers: { '@type': 'Offer', price: '0', priceCurrency: 'USD' },
    },
  ],
};

const calculateResult = (values: FormValues): ResultPayload => {
  const sleepDebt = values.sleepDebtHours;
  const targetSleep = values.targetSleepHours;
  const currentSleep = values.currentSleepHours;
  
  // Calculate daily sleep deficit (how much below target per night)
  const dailyDeficit = Math.max(0, targetSleep - currentSleep);
  
  // Total recovery needed = sleep debt + (daily deficit × recovery days)
  // But if user specified recovery days, calculate based on that
  let recoveryDays: number;
  let dailyRecoveryHours: number;
  let totalRecoverySleep: number;
  
  if (values.recoveryDays) {
    // User specified timeline - calculate daily recovery needed
    recoveryDays = values.recoveryDays;
    // Recovery sleep = debt to repay + normal sleep needs
    totalRecoverySleep = sleepDebt + (targetSleep * recoveryDays);
    dailyRecoveryHours = totalRecoverySleep / recoveryDays;
    
    // Limit daily recovery to reasonable maximum (target + 2 hours)
    if (dailyRecoveryHours > targetSleep + 2) {
      dailyRecoveryHours = targetSleep + 2;
      totalRecoverySleep = dailyRecoveryHours * recoveryDays;
      // Recalculate actual timeline needed
      recoveryDays = Math.ceil(sleepDebt / (dailyRecoveryHours - targetSleep));
    }
  } else {
    // Calculate optimal timeline
    // Can recover 1-2 hours extra per night
    const extraSleepPerNight = Math.min(2, Math.max(1, sleepDebt / 7)); // Aim for 1 week recovery
    dailyRecoveryHours = targetSleep + extraSleepPerNight;
    
    // Calculate days needed
    if (dailyDeficit > 0) {
      // Need to cover deficit + debt
      recoveryDays = Math.ceil(sleepDebt / (extraSleepPerNight - dailyDeficit));
    } else {
      recoveryDays = Math.ceil(sleepDebt / extraSleepPerNight);
    }
    
    // Minimum 2 days, maximum 14 days for reasonable recovery
    recoveryDays = Math.max(2, Math.min(14, recoveryDays));
    totalRecoverySleep = sleepDebt + (targetSleep * recoveryDays);
  }
  
  // Recovery timeline
  const recoveryTimeline = recoveryDays;
  
  let status: ResultPayload['status'] = 'optimal';
  let interpretation = 'This suggests a general lifestyle tendency where your recovery plan may support feeling more rested.';
  
  if (sleepDebt > 30) {
    status = 'low';
    interpretation = 'This suggests a general lifestyle tendency where you may benefit from consistent sleep over 1-2 weeks. You may consider prioritizing sleep and gradual recovery.';
  } else if (sleepDebt > 15) {
    status = 'moderate';
    interpretation = 'This suggests a general lifestyle tendency where consistent adequate sleep over the next week may support feeling more rested.';
  } else if (sleepDebt > 5) {
    status = 'good';
    interpretation = 'This suggests a general lifestyle tendency where a few nights of good sleep may help you feel more rested.';
  }
  
  const recommendations = [
    `You may consider aiming for ${dailyRecoveryHours.toFixed(1)} hours of sleep per night for the next ${recoveryDays} days to support feeling more rested.`,
    'This is a personal insight, not a medical evaluation. Gradual recovery may be more supportive than trying to "sleep it off" in one night. Consistent adequate sleep may help you feel more rested.',
    'You may consider prioritizing sleep quality during recovery. Maintaining a consistent schedule, creating a sleep-conducive environment, and avoiding factors that disrupt sleep may help.',
  ];
  
  if (dailyDeficit > 1) {
    recommendations.push(`This suggests a general lifestyle tendency where your current sleep (${currentSleep.toFixed(1)} hours) is below your target (${targetSleep.toFixed(1)} hours). You may consider reaching your target consistently to support feeling more rested.`);
  }
  
  if (sleepDebt > 20) {
    recommendations.push('You may consider adjusting your schedule to prioritize sleep. This may require lifestyle changes to allow adequate recovery time.');
  }
  
  if (dailyRecoveryHours > targetSleep + 1.5) {
    recommendations.push('This recovery schedule suggests extra sleep may be helpful. You may consider planning your schedule to allow for adequate rest, and avoiding overscheduling during recovery period.');
  }
  
  const plan = [
    { label: 'Week 1', detail: `You may consider sleeping ${dailyRecoveryHours.toFixed(1)} hours per night consistently. Maintaining regular bedtime and wake time may help. Track how rested and energized you feel.` },
    { label: 'Week 2+', detail: 'As you feel more rested, you may consider continuing to get adequate sleep. Once you feel recovered, maintaining target sleep duration may support ongoing wellness.' },
    { label: 'Ongoing', detail: 'You may consider monitoring your sleep patterns. Staying within 1 hour of your target sleep duration may support feeling consistently rested.' },
  ];
  
  return { totalRecoverySleep, dailyRecoveryHours, recoveryTimeline, recoveryDays, status, interpretation, recommendations, plan };
};

export default function RecoverySleepRequirementAfterSleepDebtCalculator() {
  const [result, setResult] = useState<ResultPayload | null>(null);

  const form = useForm<FormValues>({
    resolver: zodResolver(formSchema),
    defaultValues: {
      sleepDebtHours: undefined,
      targetSleepHours: undefined,
      currentSleepHours: undefined,
      recoveryDays: undefined,
    },
  });

  return (
    <div className="space-y-8">
      <Script id="recovery-sleep-schema" type="application/ld+json" strategy="afterInteractive" dangerouslySetInnerHTML={{ __html: JSON.stringify(schemaMarkup) }} />

      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <Moon className="h-5 w-5" />
            Sleep Debt Recovery Planner
          </CardTitle>
          <CardDescription>Get general wellness insights about recovery sleep planning after sleep debt. This is a personal lifestyle insight, not a medical evaluation.</CardDescription>
        </CardHeader>
      </Card>

      <Card>
        <CardHeader>
          <CardTitle>Input your sleep debt data</CardTitle>
        </CardHeader>
        <CardContent>
          <Form {...form}>
            <form onSubmit={form.handleSubmit((values) => setResult(calculateResult(values)))} className="space-y-6">
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <FormField
                  control={form.control}
                  name="sleepDebtHours"
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel>Sleep debt (hours)</FormLabel>
                      <FormControl>
                        <Input type="number" step="0.5" placeholder="e.g., 15" value={field.value ?? ''} onChange={(e) => field.onChange(e.target.value === '' ? undefined : Number(e.target.value))} />
                      </FormControl>
                      <FormMessage />
                    </FormItem>
                  )}
                />
                <FormField
                  control={form.control}
                  name="targetSleepHours"
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel>Target sleep hours</FormLabel>
                      <FormControl>
                        <Input type="number" step="0.5" placeholder="e.g., 8" value={field.value ?? ''} onChange={(e) => field.onChange(e.target.value === '' ? undefined : Number(e.target.value))} />
                      </FormControl>
                      <FormMessage />
                    </FormItem>
                  )}
                />
                <FormField
                  control={form.control}
                  name="currentSleepHours"
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel>Current sleep hours</FormLabel>
                      <FormControl>
                        <Input type="number" step="0.5" placeholder="e.g., 6.5" value={field.value ?? ''} onChange={(e) => field.onChange(e.target.value === '' ? undefined : Number(e.target.value))} />
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
                      <FormLabel>Desired recovery days (optional)</FormLabel>
                      <FormControl>
                        <Input type="number" step="1" placeholder="e.g., 7" value={field.value ?? ''} onChange={(e) => field.onChange(e.target.value === '' ? undefined : Number(e.target.value))} />
                      </FormControl>
                      <FormMessage />
                    </FormItem>
                  )}
                />
              </div>
              <Button type="submit" className="w-full md:w-auto">
                Calculate recovery requirements
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
            <CardDescription>See recovery sleep requirements, daily sleep needs, timeline, and recommendations.</CardDescription>
          </CardHeader>
          <CardContent className="space-y-6">
            <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
              <div className="p-4 border rounded">
                <p className="text-sm text-muted-foreground">Daily recovery sleep</p>
                <p className="text-2xl font-semibold text-primary">{result.dailyRecoveryHours.toFixed(1)} hours</p>
                <p className="text-xs text-muted-foreground">Per night</p>
              </div>
              <div className="p-4 border rounded">
                <p className="text-sm text-muted-foreground">Recovery timeline</p>
                <p className="text-2xl font-semibold text-primary">{result.recoveryDays} days</p>
                <p className="text-xs text-muted-foreground">Estimated</p>
              </div>
              <div className="p-4 border rounded">
                <p className="text-sm text-muted-foreground">Total recovery sleep</p>
                <p className="text-2xl font-semibold text-primary">{result.totalRecoverySleep.toFixed(1)} hours</p>
                <p className="text-xs text-muted-foreground">Total needed</p>
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
            <strong>Total recovery sleep</strong> = Sleep debt + (Target sleep hours × Recovery days).
          </p>
          <p>
            <strong>Daily recovery hours</strong> = Total recovery sleep / Recovery days.
          </p>
          <p>
            <strong>Recovery days</strong> = Sleep debt / (Extra sleep per night - Daily deficit), where extra sleep is typically 1-2 hours above target.
          </p>
          <p>
            <strong>Sleep debt</strong> = (Target sleep - Actual sleep) × Number of days with deficit.
          </p>
          <p>Gradual recovery (1-2 extra hours per night over several days) is more effective than trying to recover all debt in one extended sleep session.</p>
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
                <p className="text-sm text-muted-foreground">Daily sleep deficit</p>
                <p className="text-xl font-semibold text-primary">
                  {(() => {
                    const target = form.getValues().targetSleepHours ?? 8;
                    const current = form.getValues().currentSleepHours ?? 7;
                    const deficit = Math.max(0, target - current);
                    return `${deficit.toFixed(1)} hours`;
                  })()}
                </p>
                <p className="text-xs text-muted-foreground">Below target</p>
              </div>
              <div className="p-4 border rounded">
                <p className="text-sm text-muted-foreground">Extra sleep needed</p>
                <p className="text-xl font-semibold text-primary">
                  {(() => {
                    const target = form.getValues().targetSleepHours ?? 8;
                    const extra = result.dailyRecoveryHours - target;
                    return `${extra.toFixed(1)} hours`;
                  })()}
                </p>
                <p className="text-xs text-muted-foreground">Above target</p>
              </div>
              <div className="p-4 border rounded">
                <p className="text-sm text-muted-foreground">Recovery rate</p>
                <p className="text-xl font-semibold text-primary">
                  {(() => {
                    const debt = form.getValues().sleepDebtHours ?? 15;
                    const rate = debt / result.recoveryDays;
                    return `${rate.toFixed(1)} hours/day`;
                  })()}
                </p>
                <p className="text-xs text-muted-foreground">Debt repayment</p>
              </div>
            </div>
          ) : (
            <p className="text-sm text-muted-foreground">Enter your sleep debt data to see additional insights.</p>
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
          <p>This tool provides general wellness insights about sleep debt recovery planning. When you consistently get less sleep than you need, you may benefit from adequate sleep over time. Gradual recovery (1-2 extra hours per night) may be more supportive than trying to "sleep it off" in one session.</p>
          <p>Use this calculator to get general wellness insights about how much sleep you may consider per night and how long it may take to feel more rested after sleep debt.</p>
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
          <p>This tool provides general wellness insights about recovery sleep planning after sleep debt. This is a personal lifestyle insight, not a medical evaluation.</p>
          <p>Outputs include suggested daily recovery sleep hours, total recovery sleep estimate, recovery timeline, status, recommendations, an action plan, and supporting metrics.</p>
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


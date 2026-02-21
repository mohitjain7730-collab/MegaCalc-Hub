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
  averageSleepTime: z.number({ invalid_type_error: 'Enter average sleep time' }).min(4).max(12),
  sleepEfficiency: z.number({ invalid_type_error: 'Enter sleep efficiency' }).min(50).max(100),
  targetBedtime: z.string({ invalid_type_error: 'Enter target bedtime' }),
  targetWakeTime: z.string({ invalid_type_error: 'Enter target wake time' }),
});

type FormValues = z.infer<typeof formSchema>;

type ResultPayload = {
  restrictedSleepTime: number;
  restrictedSleepHours: number;
  timeInBed: number;
  recommendedBedtime: string;
  recommendedWakeTime: string;
  adaptationWeeks: number;
  status: 'optimal' | 'good' | 'moderate' | 'low';
  interpretation: string;
  recommendations: string[];
  plan: { label: string; detail: string }[];
};

const steps = [
  'Enter your current average sleep time per night (hours).',
  'Enter your current sleep efficiency percentage (time asleep / time in bed × 100).',
  'Enter your target bedtime (when you want to go to bed).',
  'Enter your target wake time (when you want to wake up).',
  'Review restricted sleep schedule, adaptation timeline, and recommendations.',
];

const faqs = [
  {
    question: 'What is sleep restriction therapy?',
    answer:
      'Sleep restriction therapy is a cognitive behavioral therapy (CBT-I) technique that limits time in bed to match actual sleep time, improving sleep efficiency by consolidating sleep and reducing wakefulness in bed.',
  },
  {
    question: 'How does sleep restriction work?',
    answer:
      'By reducing time in bed to match actual sleep duration, you create a sleep debt that increases sleep drive. This consolidates sleep, reduces time spent awake in bed, and improves sleep efficiency over time.',
  },
  {
    question: 'Is sleep restriction safe?',
    answer:
      'Sleep restriction should be supervised by a healthcare provider or sleep specialist, especially for those with medical conditions or who drive/operate machinery. It\'s not recommended for those with certain sleep disorders or mental health conditions.',
  },
  {
    question: 'How long does sleep restriction take to work?',
    answer:
      'Most people see improvements in sleep efficiency within 1-2 weeks. Full adaptation typically takes 4-8 weeks. Sleep time can gradually be increased as efficiency improves.',
  },
  {
    question: 'What if I feel too tired during the day?',
    answer:
      'If daytime fatigue is severe, consider a less restrictive schedule or consult a healthcare provider. The goal is to improve sleep efficiency, not cause excessive daytime sleepiness that affects safety.',
  },
  {
    question: 'Can I nap during sleep restriction?',
    answer:
      'Generally, napping should be avoided during sleep restriction to maintain sleep drive. If napping is necessary, limit to 15-20 minutes early in the day and avoid late afternoon naps.',
  },
  {
    question: 'What sleep efficiency should I target?',
    answer:
      'The goal is to achieve 85% or higher sleep efficiency. This means spending 85% or more of your time in bed actually sleeping. Once achieved, time in bed can gradually be increased.',
  },
  {
    question: 'How do I know when to increase sleep time?',
    answer:
      'When sleep efficiency is consistently 85% or higher for at least a week, you can increase time in bed by 15-30 minutes. If efficiency drops, reduce time in bed again until it improves.',
  },
  {
    question: 'Does this work for shift workers?',
    answer:
      'Sleep restriction can be adapted for shift workers, but it\'s more complex. Work with a sleep specialist who can tailor the approach to your specific schedule and needs.',
  },
  {
    question: 'What if I have trouble staying awake until the new bedtime?',
    answer:
      'If staying awake is difficult, gradually shift your bedtime later by 15-30 minutes every few days rather than making a sudden change. Use bright light exposure and activity to stay alert.',
  },
];

const relatedCalculators = [
  {
    name: 'Sleep Efficiency Calculator',
    slug: 'sleep-efficiency-calculator',
    description: 'Calculate current sleep efficiency to track improvement.',
  },
  {
    name: 'Sleep Cycle Wake-Up Comfort Planner',
    slug: 'sleep-cycle-alarm-time-optimizer',
    description: 'Plan comfortable wake times for better sleep cycles.',
  },
  {
    name: 'Sleep Quality vs Productivity Correlation Calculator',
    slug: 'sleep-quality-vs-productivity-correlation-calculator',
    description: 'Monitor sleep quality improvements.',
  },
  {
    name: 'Sleep Debt Calculator',
    slug: 'habit-streak-tracker-calculator',
    description: 'Track sleep debt during restriction period.',
  },
];

const baseUrl = 'https://mycalculating.com/category/health-fitness/sleep-restriction-adaptation-calculator';

const schemaMarkup = {
  '@context': 'https://schema.org',
  '@graph': [
    {
      '@type': 'BreadcrumbList',
      itemListElement: [
        { '@type': 'ListItem', position: 1, name: 'Home', item: 'https://mycalculating.com' },
        { '@type': 'ListItem', position: 2, name: 'Health & Fitness', item: 'https://mycalculating.com/category/health-fitness' },
        { '@type': 'ListItem', position: 3, name: 'Sleep Schedule Adaptation Planner', item: baseUrl },
      ],
    },
    {
      '@type': 'SoftwareApplication',
      name: 'Sleep Schedule Adaptation Planner',
      applicationCategory: 'Calculator',
      operatingSystem: 'Web Browser',
      description: 'Get general wellness insights about sleep schedule planning to support improved sleep patterns. This is a personal lifestyle insight, not a medical evaluation.',
      url: baseUrl,
      offers: { '@type': 'Offer', price: '0', priceCurrency: 'USD' },
    },
  ],
};

const parseTime = (timeStr: string): number => {
  const [hours, minutes] = timeStr.split(':').map(Number);
  return hours * 60 + minutes;
};

const formatTime = (minutes: number): string => {
  const totalMinutes = minutes % (24 * 60);
  const hours = Math.floor(totalMinutes / 60);
  const mins = totalMinutes % 60;
  return `${String(hours).padStart(2, '0')}:${String(mins).padStart(2, '0')}`;
};

const calculateResult = (values: FormValues): ResultPayload => {
  // Calculate restricted sleep time (initially match average sleep time, but minimum 5.5 hours)
  const averageSleep = values.averageSleepTime;
  const efficiency = values.sleepEfficiency;
  
  // Calculate actual sleep time (average sleep time adjusted for efficiency)
  const actualSleepTime = averageSleep * (efficiency / 100);
  
  // Start with restricted time = actual sleep time, but never less than 5.5 hours
  let restrictedSleepTime = Math.max(5.5, actualSleepTime);
  // Also ensure not less than 85% of average sleep time
  restrictedSleepTime = Math.max(restrictedSleepTime, averageSleep * 0.85);
  
  // Calculate time in bed (slightly more than sleep time for falling asleep)
  const timeInBed = restrictedSleepTime + 0.25; // Add 15 minutes buffer
  
  // Parse target times
  const targetWakeMinutes = parseTime(values.targetWakeTime);
  const targetBedtimeMinutes = parseTime(values.targetBedtime);
  
  // Calculate recommended bedtime (wake time minus time in bed)
  const recommendedWakeTime = formatTime(targetWakeMinutes);
  const recommendedBedtimeMinutes = targetWakeMinutes - (timeInBed * 60);
  const recommendedBedtime = formatTime(recommendedBedtimeMinutes);
  
  // Estimate adaptation weeks based on efficiency gap
  const efficiencyGap = 85 - efficiency;
  let adaptationWeeks: number;
  if (efficiencyGap > 30) {
    adaptationWeeks = 8;
  } else if (efficiencyGap > 20) {
    adaptationWeeks = 6;
  } else if (efficiencyGap > 10) {
    adaptationWeeks = 4;
  } else {
    adaptationWeeks = 2;
  }
  
  let status: ResultPayload['status'] = 'optimal';
  let interpretation = 'This suggests a general lifestyle tendency where your sleep schedule plan may support improved sleep patterns.';
  
  if (restrictedSleepTime < 6) {
    status = 'low';
    interpretation = 'This suggests a general lifestyle tendency where your planned sleep time is quite limited. You may consider monitoring how rested you feel and consulting a qualified professional if needed.';
  } else if (restrictedSleepTime < 6.5) {
    status = 'moderate';
    interpretation = 'This suggests a general lifestyle tendency where this schedule may be moderately restrictive. You may experience some initial adjustment, but sleep patterns may improve over time.';
  } else if (restrictedSleepTime < 7.5) {
    status = 'good';
    interpretation = 'This suggests a general lifestyle tendency where this schedule level may be manageable while supporting improved sleep patterns.';
  }
  
  const recommendations = [
    `You may consider sleeping ${restrictedSleepTime.toFixed(1)} hours per night. Going to bed at ${recommendedBedtime} and waking at ${recommendedWakeTime} consistently may support better sleep patterns.`,
    'You may consider maintaining this schedule even on weekends. Consistency may support improved sleep patterns.',
    'You may consider avoiding napping during the day. If needed, limiting naps to 15-20 minutes before 2 PM may help.',
    'You may consider tracking how rested you feel daily. When you consistently feel more rested for a week, you may gradually increase time in bed by 15-30 minutes.',
  ];
  
  if (efficiency < 75) {
    recommendations.push('This suggests a general lifestyle tendency where you may spend more time awake in bed. Adjusting your sleep schedule may help consolidate your sleep.');
  }
  
  if (restrictedSleepTime < 6.5) {
    recommendations.push('This is a more restrictive schedule. You may consider working with a qualified professional, especially if you drive or operate machinery during the day.');
  }
  
  const plan = [
    { label: 'Weeks 1-2', detail: `You may consider following the schedule: ${recommendedBedtime} to ${recommendedWakeTime}. Track how rested you feel daily. You may experience some adjustment initially.` },
    { label: 'Weeks 3-4', detail: 'You may consider continuing the schedule. Sleep patterns may start improving. Monitor how consistently rested you feel before increasing time in bed.' },
    { label: 'Weeks 5-8', detail: 'Once you consistently feel more rested, you may gradually increase time in bed by 15-30 minutes every week as long as you continue feeling rested.' },
  ];
  
  return { restrictedSleepTime, restrictedSleepHours: restrictedSleepTime, timeInBed, recommendedBedtime, recommendedWakeTime, adaptationWeeks, status, interpretation, recommendations, plan };
};

export default function SleepRestrictionAdaptationCalculator() {
  const [result, setResult] = useState<ResultPayload | null>(null);

  const form = useForm<FormValues>({
    resolver: zodResolver(formSchema),
    defaultValues: {
      averageSleepTime: undefined,
      sleepEfficiency: undefined,
      targetBedtime: undefined,
      targetWakeTime: undefined,
    },
  });

  return (
    <div className="space-y-8">
      <Script id="sleep-restriction-schema" type="application/ld+json" strategy="afterInteractive" dangerouslySetInnerHTML={{ __html: JSON.stringify(schemaMarkup) }} />

      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <Moon className="h-5 w-5" />
            Sleep Schedule Adaptation Planner
          </CardTitle>
          <CardDescription>Get general wellness insights about sleep schedule planning to support improved sleep patterns. This is a personal lifestyle insight, not a medical evaluation.</CardDescription>
        </CardHeader>
      </Card>

      <Card>
        <CardHeader>
          <CardTitle>Input your sleep data</CardTitle>
        </CardHeader>
        <CardContent>
          <Form {...form}>
            <form onSubmit={form.handleSubmit((values) => setResult(calculateResult(values)))} className="space-y-6">
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <FormField
                  control={form.control}
                  name="averageSleepTime"
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel>Average sleep time (hours)</FormLabel>
                      <FormControl>
                        <Input type="number" step="0.5" placeholder="e.g., 6.5" value={field.value ?? ''} onChange={(e) => field.onChange(e.target.value === '' ? undefined : Number(e.target.value))} />
                      </FormControl>
                      <FormMessage />
                    </FormItem>
                  )}
                />
                <FormField
                  control={form.control}
                  name="sleepEfficiency"
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel>Sleep efficiency (%)</FormLabel>
                      <FormControl>
                        <Input type="number" step="1" placeholder="e.g., 70" value={field.value ?? ''} onChange={(e) => field.onChange(e.target.value === '' ? undefined : Number(e.target.value))} />
                      </FormControl>
                      <FormMessage />
                    </FormItem>
                  )}
                />
                <FormField
                  control={form.control}
                  name="targetBedtime"
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel>Target bedtime</FormLabel>
                      <FormControl>
                        <Input type="time" placeholder="e.g., 23:00" value={field.value ?? ''} onChange={(e) => field.onChange(e.target.value)} />
                      </FormControl>
                      <FormMessage />
                    </FormItem>
                  )}
                />
                <FormField
                  control={form.control}
                  name="targetWakeTime"
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel>Target wake time</FormLabel>
                      <FormControl>
                        <Input type="time" placeholder="e.g., 07:00" value={field.value ?? ''} onChange={(e) => field.onChange(e.target.value)} />
                      </FormControl>
                      <FormMessage />
                    </FormItem>
                  )}
                />
              </div>
              <Button type="submit" className="w-full md:w-auto">
                Calculate sleep restriction schedule
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
            <CardDescription>See restricted sleep schedule, adaptation timeline, and recommendations.</CardDescription>
          </CardHeader>
          <CardContent className="space-y-6">
            <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
              <div className="p-4 border rounded">
                <p className="text-sm text-muted-foreground">Restricted sleep time</p>
                <p className="text-2xl font-semibold text-primary">{result.restrictedSleepHours.toFixed(1)} hours</p>
                <p className="text-xs text-muted-foreground">Per night</p>
              </div>
              <div className="p-4 border rounded">
                <p className="text-sm text-muted-foreground">Time in bed</p>
                <p className="text-2xl font-semibold text-primary">{result.timeInBed.toFixed(1)} hours</p>
                <p className="text-xs text-muted-foreground">Including buffer</p>
              </div>
              <div className="p-4 border rounded">
                <p className="text-sm text-muted-foreground">Adaptation timeline</p>
                <p className="text-2xl font-semibold text-primary">{result.adaptationWeeks} weeks</p>
                <p className="text-xs text-muted-foreground">Estimated</p>
              </div>
              <div className="p-4 border rounded">
                <p className="text-sm text-muted-foreground">Status</p>
                <p className="text-2xl font-semibold text-primary capitalize">{result.status}</p>
                <p className="text-xs text-muted-foreground">{result.interpretation}</p>
              </div>
            </div>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div className="p-4 border rounded">
                <p className="text-sm text-muted-foreground">Recommended bedtime</p>
                <p className="text-2xl font-semibold text-primary">{result.recommendedBedtime}</p>
                <p className="text-xs text-muted-foreground">Go to bed at</p>
              </div>
              <div className="p-4 border rounded">
                <p className="text-sm text-muted-foreground">Recommended wake time</p>
                <p className="text-2xl font-semibold text-primary">{result.recommendedWakeTime}</p>
                <p className="text-xs text-muted-foreground">Wake up at</p>
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
            <strong>Restricted sleep time</strong> = Maximum of (average sleep time × 0.85) or (average sleep time × efficiency / 100), with a minimum of 5.5 hours.
          </p>
          <p>
            <strong>Time in bed</strong> = Restricted sleep time + 15 minutes (buffer for falling asleep).
          </p>
          <p>
            <strong>Recommended bedtime</strong> = Target wake time - Time in bed.
          </p>
          <p>
            <strong>Adaptation weeks</strong> = Based on efficiency gap: &lt;10% = 2 weeks, 10-20% = 4 weeks, 20-30% = 6 weeks, &gt;30% = 8 weeks.
          </p>
          <p>This tool provides general wellness insights about sleep schedule planning. Adjusting time in bed to match actual sleep time may support improved sleep patterns by consolidating sleep and reducing wakefulness in bed.</p>
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
                <p className="text-sm text-muted-foreground">Target efficiency</p>
                <p className="text-xl font-semibold text-primary">85%+</p>
                <p className="text-xs text-muted-foreground">Goal to achieve</p>
              </div>
              <div className="p-4 border rounded">
                <p className="text-sm text-muted-foreground">Sleep consolidation</p>
                <p className="text-xl font-semibold text-primary">High</p>
                <p className="text-xs text-muted-foreground">Expected improvement</p>
              </div>
              <div className="p-4 border rounded">
                <p className="text-sm text-muted-foreground">Initial fatigue risk</p>
                <p className="text-xl font-semibold text-primary">
                  {result.restrictedSleepHours < 6.5 ? 'Moderate-High' : 'Low-Moderate'}
                </p>
                <p className="text-xs text-muted-foreground">First 1-2 weeks</p>
              </div>
            </div>
          ) : (
            <p className="text-sm text-muted-foreground">Enter your sleep data to see additional insights.</p>
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
          <p>This tool provides general wellness insights about sleep schedule planning. Adjusting time in bed to match actual sleep duration may support improved sleep patterns by consolidating sleep, reducing time spent awake in bed, and helping establish more consistent sleep habits.</p>
          <p>Use this calculator to get general wellness insights about sleep schedule planning based on your current sleep patterns, with gradual adjustment suggestions as sleep patterns may improve.</p>
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
          <p>This tool provides general wellness insights about sleep schedule planning to support improved sleep patterns. This is a personal lifestyle insight, not a medical evaluation.</p>
          <p>Outputs include suggested sleep time, time in bed, suggested bedtime and wake time, adaptation timeline, status, recommendations, an action plan, and supporting metrics.</p>
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


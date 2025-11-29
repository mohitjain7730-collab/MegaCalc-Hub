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
  chronotype: z.enum(['early', 'intermediate', 'late'], { invalid_type_error: 'Select chronotype' }),
  desiredWakeTime: z.string({ invalid_type_error: 'Enter desired wake time' }),
  targetSleepHours: z.number({ invalid_type_error: 'Enter target sleep hours' }).min(6).max(10),
  age: z.number({ invalid_type_error: 'Enter age' }).min(18).max(100).optional(),
});

type FormValues = z.infer<typeof formSchema>;

type ResultPayload = {
  optimalBedtime: string;
  optimalWakeTime: string;
  sleepDuration: number;
  chronotypeName: string;
  status: 'optimal' | 'good' | 'moderate' | 'low';
  interpretation: string;
  recommendations: string[];
  plan: { label: string; detail: string }[];
};

const steps = [
  'Select your chronotype (early bird, intermediate, or night owl).',
  'Enter your desired wake time (when you need or want to wake up).',
  'Enter your target sleep hours (ideal sleep duration per night).',
  'Optionally enter your age (sleep needs change with age).',
  'Review optimal bedtime, sleep duration, and recommendations aligned with your chronotype.',
];

const faqs = [
  {
    question: 'What is a chronotype?',
    answer:
      'A chronotype is your natural tendency to be awake or asleep at certain times. It\'s determined by your internal circadian rhythm and genetic factors. The three main types are early birds (larks), intermediates, and night owls.',
  },
  {
    question: 'How do I know my chronotype?',
    answer:
      'Consider when you naturally wake up and feel most alert. Early birds wake early (5-7 AM) and are alert in the morning. Night owls prefer late sleep (after 11 PM) and are alert in the evening. Intermediates fall in between.',
  },
  {
    question: 'Can chronotype change?',
    answer:
      'Chronotype naturally shifts with age (teens/young adults tend toward night owl, older adults toward early bird), but your core preference is largely genetic and remains relatively stable throughout adulthood.',
  },
  {
    question: 'Should I fight my chronotype?',
    answer:
      'While some schedule adjustments may be necessary for work/school, fighting your natural chronotype can lead to poor sleep quality, sleep debt, and health issues. Working with your chronotype is generally healthier.',
  },
  {
    question: 'What if my schedule conflicts with my chronotype?',
    answer:
      'Many people face schedule-chronotype conflicts. Strategies include gradual schedule shifts, light therapy, strategic napping, and lifestyle accommodations (flexible hours, remote work) when possible.',
  },
  {
    question: 'Do early birds need less sleep?',
    answer:
      'No. Both early birds and night owls need similar amounts of sleep (typically 7-9 hours). The difference is timing: early birds naturally sleep earlier, while night owls sleep later.',
  },
  {
    question: 'Can night owls become early birds?',
    answer:
      'It\'s possible to shift your schedule with consistent effort, light therapy, and behavioral changes, but you can\'t change your core chronotype. Shifts are usually temporary and require ongoing maintenance.',
  },
  {
    question: 'How does age affect chronotype?',
    answer:
      'Teenagers and young adults naturally shift toward night owl tendencies. After age 20, people gradually shift earlier. Older adults (60+) typically become more early-bird oriented due to circadian rhythm changes.',
  },
  {
    question: 'What is the best sleep schedule for my chronotype?',
    answer:
      'The best schedule aligns with your natural chronotype. Early birds should sleep early (9-10 PM) and wake early (5-7 AM). Night owls should sleep later (12-1 AM) and wake later (8-10 AM) when possible.',
  },
  {
    question: 'Does chronotype affect health?',
    answer:
      'Yes. When you can\'t align your schedule with your chronotype (common for night owls in morning-oriented societies), it can lead to sleep problems, mood issues, and increased health risks. Alignment improves well-being.',
  },
];

const relatedCalculators = [
  {
    name: 'Sleep Phase Delay Syndrome (DSPD) Risk Calculator',
    slug: 'sleep-phase-delay-syndrome-dspd-risk-calculator',
    description: 'Assess risk of delayed sleep phase disorder.',
  },
  {
    name: 'Sleep Cycle Alarm Time Optimizer',
    slug: 'sleep-cycle-alarm-time-optimizer',
    description: 'Optimize sleep timing for better cycles.',
  },
  {
    name: 'Sleep Quality vs Productivity Correlation Calculator',
    slug: 'sleep-quality-vs-productivity-correlation-calculator',
    description: 'Track sleep quality and productivity.',
  },
  {
    name: 'Jet Lag Recovery Duration Calculator',
    slug: 'jet-lag-recovery-duration-calculator',
    description: 'Manage circadian rhythm adjustments.',
  },
];

const baseUrl = 'https://mycalculating.com/category/health-fitness/optimal-bedtime-by-chronotype-calculator';

const schemaMarkup = {
  '@context': 'https://schema.org',
  '@graph': [
    {
      '@type': 'BreadcrumbList',
      itemListElement: [
        { '@type': 'ListItem', position: 1, name: 'Home', item: 'https://mycalculating.com' },
        { '@type': 'ListItem', position: 2, name: 'Health & Fitness', item: 'https://mycalculating.com/category/health-fitness' },
        { '@type': 'ListItem', position: 3, name: 'Optimal Bedtime by Chronotype Calculator', item: baseUrl },
      ],
    },
    {
      '@type': 'SoftwareApplication',
      name: 'Optimal Bedtime by Chronotype Calculator',
      applicationCategory: 'Calculator',
      operatingSystem: 'Web Browser',
      description: 'Calculate optimal bedtime based on your chronotype (early bird, night owl, intermediate) and desired wake time for better sleep quality.',
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
  const desiredWakeTime = parseTime(values.desiredWakeTime);
  const targetSleep = values.targetSleepHours;
  const age = values.age ?? 35;
  
  // Adjust target sleep for age if provided
  let adjustedSleep = targetSleep;
  if (age >= 65) {
    adjustedSleep = Math.min(targetSleep, 8); // Older adults may need slightly less
  }
  
  // Calculate base bedtime from wake time
  let baseBedtime = desiredWakeTime - (adjustedSleep * 60);
  
  // Adjust for chronotype (add delay based on chronotype preference)
  let chronotypeAdjustment = 0;
  let chronotypeName = '';
  
  if (values.chronotype === 'early') {
    chronotypeAdjustment = -30; // Early birds can sleep earlier
    chronotypeName = 'Early Bird (Lark)';
  } else if (values.chronotype === 'late') {
    chronotypeAdjustment = 90; // Night owls prefer later bedtime
    chronotypeName = 'Night Owl';
  } else {
    chronotypeAdjustment = 15; // Intermediate - slight preference for later
    chronotypeName = 'Intermediate';
  }
  
  // Apply chronotype adjustment
  let optimalBedtime = baseBedtime + chronotypeAdjustment;
  
  // Add 15 minutes for sleep latency (time to fall asleep)
  optimalBedtime -= 15;
  
  // Normalize to 24-hour format
  optimalBedtime = optimalBedtime % (24 * 60);
  if (optimalBedtime < 0) optimalBedtime += 24 * 60;
  
  const optimalWakeTime = formatTime(desiredWakeTime);
  const optimalBedtimeStr = formatTime(optimalBedtime);
  const actualSleepDuration = (desiredWakeTime - optimalBedtime + (24 * 60)) % (24 * 60) / 60;
  
  let status: ResultPayload['status'] = 'optimal';
  let interpretation = 'Your bedtime is optimally calculated to align with your chronotype and desired wake time.';
  
  // Check if bedtime is reasonable for chronotype
  const bedtimeHour = Math.floor(optimalBedtime / 60);
  if (values.chronotype === 'early' && bedtimeHour > 23) {
    status = 'moderate';
    interpretation = 'Your bedtime is later than ideal for an early bird chronotype. Consider adjusting your schedule to sleep earlier when possible.';
  } else if (values.chronotype === 'late' && bedtimeHour < 22) {
    status = 'good';
    interpretation = 'Your bedtime may be earlier than ideal for a night owl. If possible, allow for a later bedtime to align with your natural rhythm.';
  }
  
  const recommendations = [
    `As a ${chronotypeName}, your optimal bedtime is ${optimalBedtimeStr} to wake at ${optimalWakeTime} for ${adjustedSleep.toFixed(1)} hours of sleep.`,
    'Maintain consistent bedtimes and wake times, even on weekends, to help regulate your circadian rhythm and improve sleep quality.',
    values.chronotype === 'late' 
      ? 'Night owls benefit from evening light exposure and avoiding morning light initially. Consider a later schedule if work allows.'
      : values.chronotype === 'early'
      ? 'Early birds should maximize morning light exposure and maintain an early evening routine. Avoid late evening activities that delay sleep.'
      : 'Intermediates have flexibility but should maintain consistent schedules. Align sleep with your natural preferences.',
  ];
  
  if (Math.abs(actualSleepDuration - adjustedSleep) > 0.5) {
    recommendations.push('Consider adjusting your wake time slightly to better match your target sleep duration while maintaining your chronotype alignment.');
  }
  
  const plan = [
    { label: 'This Week', detail: `Gradually adjust to bedtime ${optimalBedtimeStr}. Start 15 minutes earlier/later than current and shift toward target over 3-4 days.` },
    { label: 'This Month', detail: 'Maintain consistent schedule. Track sleep quality and daytime alertness. Your chronotype-aligned schedule should improve both.' },
    { label: 'Ongoing', detail: 'Work with your chronotype rather than against it. If schedule conflicts exist, consider lifestyle accommodations (flexible hours) to optimize alignment.' },
  ];
  
  return { optimalBedtime: optimalBedtimeStr, optimalWakeTime, sleepDuration: actualSleepDuration, chronotypeName, status, interpretation, recommendations, plan };
};

export default function OptimalBedtimeByChronotypeCalculator() {
  const [result, setResult] = useState<ResultPayload | null>(null);

  const form = useForm<FormValues>({
    resolver: zodResolver(formSchema),
    defaultValues: {
      chronotype: undefined,
      desiredWakeTime: undefined,
      targetSleepHours: undefined,
      age: undefined,
    },
  });

  return (
    <div className="space-y-8">
      <Script id="chronotype-bedtime-schema" type="application/ld+json" strategy="afterInteractive" dangerouslySetInnerHTML={{ __html: JSON.stringify(schemaMarkup) }} />

      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <Moon className="h-5 w-5" />
            Optimal Bedtime by Chronotype Calculator
          </CardTitle>
          <CardDescription>Calculate optimal bedtime based on your chronotype (early bird, night owl, intermediate) and desired wake time for better sleep quality.</CardDescription>
        </CardHeader>
      </Card>

      <Card>
        <CardHeader>
          <CardTitle>Input your chronotype data</CardTitle>
        </CardHeader>
        <CardContent>
          <Form {...form}>
            <form onSubmit={form.handleSubmit((values) => setResult(calculateResult(values)))} className="space-y-6">
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <FormField
                  control={form.control}
                  name="chronotype"
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel>Chronotype</FormLabel>
                      <FormControl>
                        <select
                          value={field.value ?? ''}
                          onChange={(e) => field.onChange(e.target.value)}
                          className="flex h-10 w-full rounded-md border border-input bg-background px-3 py-2 text-sm ring-offset-background file:border-0 file:bg-transparent file:text-sm file:font-medium placeholder:text-muted-foreground focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2 disabled:cursor-not-allowed disabled:opacity-50"
                        >
                          <option value="">Select chronotype</option>
                          <option value="early">Early Bird (Lark)</option>
                          <option value="intermediate">Intermediate</option>
                          <option value="late">Night Owl</option>
                        </select>
                      </FormControl>
                      <FormMessage />
                    </FormItem>
                  )}
                />
                <FormField
                  control={form.control}
                  name="desiredWakeTime"
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel>Desired wake time</FormLabel>
                      <FormControl>
                        <Input type="time" placeholder="e.g., 07:00" value={field.value ?? ''} onChange={(e) => field.onChange(e.target.value)} />
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
                  name="age"
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel>Age (years, optional)</FormLabel>
                      <FormControl>
                        <Input type="number" step="1" placeholder="e.g., 35" value={field.value ?? ''} onChange={(e) => field.onChange(e.target.value === '' ? undefined : Number(e.target.value))} />
                      </FormControl>
                      <FormMessage />
                    </FormItem>
                  )}
                />
              </div>
              <Button type="submit" className="w-full md:w-auto">
                Calculate optimal bedtime
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
            <CardDescription>See optimal bedtime, wake time, and chronotype-aligned recommendations.</CardDescription>
          </CardHeader>
          <CardContent className="space-y-6">
            <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
              <div className="p-4 border rounded">
                <p className="text-sm text-muted-foreground">Optimal bedtime</p>
                <p className="text-2xl font-semibold text-primary">{result.optimalBedtime}</p>
                <p className="text-xs text-muted-foreground">Chronotype-aligned</p>
              </div>
              <div className="p-4 border rounded">
                <p className="text-sm text-muted-foreground">Wake time</p>
                <p className="text-2xl font-semibold text-primary">{result.optimalWakeTime}</p>
                <p className="text-xs text-muted-foreground">Target</p>
              </div>
              <div className="p-4 border rounded">
                <p className="text-sm text-muted-foreground">Sleep duration</p>
                <p className="text-2xl font-semibold text-primary">{result.sleepDuration.toFixed(1)} hours</p>
                <p className="text-xs text-muted-foreground">Per night</p>
              </div>
              <div className="p-4 border rounded">
                <p className="text-sm text-muted-foreground">Chronotype</p>
                <p className="text-2xl font-semibold text-primary">{result.chronotypeName}</p>
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
            <strong>Base bedtime</strong> = Desired wake time - Target sleep hours - 15 minutes (sleep latency).
          </p>
          <p>
            <strong>Chronotype adjustment</strong>: Early bird: -30 minutes, Intermediate: +15 minutes, Night owl: +90 minutes.
          </p>
          <p>
            <strong>Optimal bedtime</strong> = Base bedtime + Chronotype adjustment.
          </p>
          <p>
            <strong>Age adjustment</strong>: Adults 65+ may need slightly less sleep (capped at 8 hours for calculation).
          </p>
          <p>Chronotype alignment improves sleep quality, daytime alertness, and overall well-being by working with your natural circadian rhythm rather than against it.</p>
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
                <p className="text-sm text-muted-foreground">Chronotype preference</p>
                <p className="text-xl font-semibold text-primary">{result.chronotypeName}</p>
                <p className="text-xs text-muted-foreground">Your type</p>
              </div>
              <div className="p-4 border rounded">
                <p className="text-sm text-muted-foreground">Sleep alignment</p>
                <p className="text-xl font-semibold text-primary">Optimized</p>
                <p className="text-xs text-muted-foreground">For your chronotype</p>
              </div>
              <div className="p-4 border rounded">
                <p className="text-sm text-muted-foreground">Schedule consistency</p>
                <p className="text-xl font-semibold text-primary">Important</p>
                <p className="text-xs text-muted-foreground">Maintain routine</p>
              </div>
            </div>
          ) : (
            <p className="text-sm text-muted-foreground">Enter your chronotype data to see additional insights.</p>
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
          <p>Your chronotype determines your natural sleep-wake preferences. Working with your chronotype (rather than against it) improves sleep quality, daytime alertness, and overall health. Early birds naturally sleep earlier, night owls later, and intermediates fall in between.</p>
          <p>Use this calculator to determine your optimal bedtime based on your chronotype and desired wake time, helping you align your schedule with your natural circadian rhythm.</p>
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
          <p>This tool calculates optimal bedtime based on chronotype (early bird, night owl, intermediate) and desired wake time for better sleep quality.</p>
          <p>Outputs include optimal bedtime, wake time, sleep duration, chronotype name, status, recommendations, an action plan, and supporting metrics.</p>
          <p>Formula, steps, guide content, related tools, and FAQs ensure humans or AI assistants can interpret the methodology instantly.</p>
        </CardContent>
      </Card>
    </div>
  );
}



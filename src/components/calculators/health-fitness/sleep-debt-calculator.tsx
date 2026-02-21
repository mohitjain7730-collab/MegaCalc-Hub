'use client';

import { useState } from 'react';
import Script from 'next/script';
import Link from 'next/link';
import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import { z } from 'zod';
import { Activity, Zap, Target, AlertTriangle, Shield, Moon } from 'lucide-react';

import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Form, FormControl, FormField, FormItem, FormLabel, FormMessage } from '@/components/ui/form';
import { Input } from '@/components/ui/input';

const formSchema = z.object({
  targetPerNight: z.number({ invalid_type_error: 'Enter target sleep hours' }).min(4).max(10),
  mon: z.number({ invalid_type_error: 'Enter Monday hours' }).min(0).max(24),
  tue: z.number({ invalid_type_error: 'Enter Tuesday hours' }).min(0).max(24),
  wed: z.number({ invalid_type_error: 'Enter Wednesday hours' }).min(0).max(24),
  thu: z.number({ invalid_type_error: 'Enter Thursday hours' }).min(0).max(24),
  fri: z.number({ invalid_type_error: 'Enter Friday hours' }).min(0).max(24),
  sat: z.number({ invalid_type_error: 'Enter Saturday hours' }).min(0).max(24),
  sun: z.number({ invalid_type_error: 'Enter Sunday hours' }).min(0).max(24),
});

type FormValues = z.infer<typeof formSchema>;

type ResultPayload = {
  targetPerNight: number;
  totalSlept: number;
  weeklyTarget: number;
  balance: number;
  balancePercent: number;
  status: 'optimal' | 'good' | 'moderate' | 'low';
  interpretation: string;
  recommendations: string[];
  plan: { label: string; detail: string }[];
};

const steps = [
  'Enter your preferred nightly sleep target (hours per night).',
  'Enter the actual hours you slept for each day of the past week (Monday through Sunday).',
  'Review your weekly sleep balance, balance percentage, and status.',
  'Read the interpretation and recommendations for gentle lifestyle adjustments.',
  'Consider the action plan for supporting more restful nights.',
];

const faqs = [
  {
    question: 'What is a good sleep target?',
    answer:
      'Most adults feel best with 7-9 hours of sleep per night, but individual needs vary. Choose a target that feels realistic and leaves you feeling refreshed. This is a personal preference, not a medical recommendation.',
  },
  {
    question: 'How is sleep balance calculated?',
    answer:
      'Sleep balance compares your total weekly sleep (sum of all 7 days) to your weekly target (target per night Ã— 7). A positive balance means you slept more than your target; negative means less. The balance percentage shows how close you were to your target.',
  },
  {
    question: 'What if I slept more than my target?',
    answer:
      'If you slept more than your target and feel refreshed, your current routine may be working well for you. Some people naturally need more sleep, especially during periods of recovery, stress, or illness. Adjust your target if needed.',
  },
  {
    question: 'What if I slept less than my target?',
    answer:
      'If you slept less than your target, consider gentle adjustments like an earlier wind-down routine, dimmer evening lights, a more consistent wake time, or reducing late-day caffeine or screen time. Small, sustainable changes often work better than drastic shifts.',
  },
  {
    question: 'Should I track sleep perfectly every week?',
    answer:
      'This tool is meant for occasional reflection, not daily tracking. Use it when you are curious about patterns or want to check in on your routines. Approximate times are fineâ€”focus on trends rather than perfect accuracy.',
  },
  {
    question: 'What factors affect sleep balance?',
    answer:
      'Sleep balance can be influenced by work schedules, stress, evening routines, caffeine intake, screen time before bed, room temperature, noise, light exposure, exercise timing, meal timing, and overall lifestyle patterns.',
  },
  {
    question: 'Is this a sleep disorder diagnosis?',
    answer:
      'No. This is a personal wellness reflection tool, not a medical evaluation or sleep disorder diagnosis. If you have concerns about your sleep, energy, or overall health, please consult a qualified healthcare professional.',
  },
  {
    question: 'How often should I check my sleep balance?',
    answer:
      'You may find it helpful to check in occasionallyâ€”perhaps weekly or monthlyâ€”to notice patterns. Avoid checking daily, as day-to-day variation is normal and focusing too much on numbers can increase stress.',
  },
  {
    question: 'What if my sleep varies a lot day to day?',
    answer:
      'Some variation is normal, especially with work schedules or life demands. The weekly balance gives you a broader view. If variation feels extreme or concerning, consider speaking with a healthcare provider.',
  },
  {
    question: 'Can I use this for children or teens?',
    answer:
      'This tool is designed for adults. Children and teens have different sleep needs (typically 9-12 hours for school-age children, 8-10 hours for teens). For sleep concerns in younger people, consult a pediatric healthcare provider.',
  },
];

const relatedCalculators = [
  {
    name: 'Sleep Time in Bed Wellness Index',
    slug: 'sleep-efficiency-calculator',
    description: 'Look at how much of your time in bed is spent sleeping.',
  },
  {
    name: 'Daily Stress & Recovery Balance Score',
    slug: 'cortisol-stress-response-estimator',
    description: 'See how sleep, stress, movement, and unwind time may balance out.',
  },
  {
    name: 'Workday Balance & Overload Tendency Score',
    slug: 'burnout-risk-score-calculator',
    description: 'Reflect on how work hours and sleep patterns may influence feelings of overload.',
  },
];

const baseUrl = 'https://mycalculating.com/health-fitness/habit-streak-tracker-calculator';

const schemaMarkup = {
  '@context': 'https://schema.org',
  '@graph': [
    {
      '@type': 'BreadcrumbList',
      itemListElement: [
        { '@type': 'ListItem', position: 1, name: 'Home', item: 'https://mycalculating.com' },
        {
          '@type': 'ListItem',
          position: 2,
          name: 'Health & Fitness',
          item: 'https://mycalculating.com/health-fitness',
        },
        {
          '@type': 'ListItem',
          position: 3,
          name: 'Sleep Balance Check-In',
          item: baseUrl,
        },
      ],
    },
    {
      '@type': 'Article',
      headline: 'Sleep Balance Check-In',
      description: 'Compare your last week of sleep to a simple nightly target and see your overall balance.',
      author: { '@type': 'Organization', name: 'Mycalculating.com' },
      publisher: { '@type': 'Organization', name: 'Mycalculating.com', logo: { '@type': 'ImageObject', url: 'https://mycalculating.com/logo.png' } },
      url: baseUrl,
      mainEntityOfPage: { '@type': 'WebPage', '@id': baseUrl },
      datePublished: '2024-01-01',
      dateModified: new Date().toISOString().split('T')[0],
    },
    {
      '@type': 'SoftwareApplication',
      name: 'Sleep Balance Check-In',
      applicationCategory: 'Calculator',
      operatingSystem: 'Web Browser',
      description:
        'Compare your last week of sleep to a simple nightly target and see your overall balance.',
      url: baseUrl,
      offers: { '@type': 'Offer', price: '0', priceCurrency: 'USD' },
    },
    {
      '@type': 'FAQPage',
      mainEntity: faqs.map((faq) => ({
        '@type': 'Question',
        name: faq.question,
        acceptedAnswer: {
          '@type': 'Answer',
          text: faq.answer,
        },
      })),
    },
    {
      '@type': 'HowTo',
      name: 'How to Use Sleep Balance Check-In Calculator',
      description: 'Step-by-step guide to check sleep balance',
      step: steps.map((step, index) => ({
        '@type': 'HowToStep',
        position: index + 1,
        text: step,
      })),
    },
  ],
};

const clamp = (value: number, min: number, max: number) => Math.min(max, Math.max(min, value));

const calculateResult = (values: FormValues): ResultPayload => {
  const targetPerNight = values.targetPerNight;
  const weeklyTarget = targetPerNight * 7;
  const totalSlept = values.mon + values.tue + values.wed + values.thu + values.fri + values.sat + values.sun;
  const balance = totalSlept - weeklyTarget;
  const balancePercent = weeklyTarget > 0 ? clamp((totalSlept / weeklyTarget) * 100, 0, 200) : 0;

  let status: ResultPayload['status'] = 'optimal';
  let interpretation =
    'This suggests a general lifestyle tendency where your sleep time may be close to your personal target. You may consider continuing to maintain your current sleep routines.';

  if (balance <= -5 || balancePercent < 85) {
    status = 'low';
    interpretation =
      'This suggests a general lifestyle tendency where your sleep time may be noticeably below your target. You may consider experimenting with an earlier wind-down routine, dimmer evening lights, a more consistent wake time, or reducing late-day caffeine or screen time. This is a personal insight, not a medical evaluation.';
  } else if (balance < 0 || balancePercent < 95) {
    status = 'moderate';
    interpretation =
      'This suggests a general lifestyle tendency where your sleep time may be slightly below your target. You may consider small tweaks like a calmer evening routine or steadier wake time to support your rest.';
  } else if (balance >= 5 || balancePercent > 115) {
    status = 'good';
    interpretation =
      'This suggests a general lifestyle tendency where your sleep time may be above your target. If that feels good in your body, you can keep the routine that works for you.';
  } else {
    status = 'optimal';
    interpretation =
      'This suggests a general lifestyle tendency where your sleep time may be close to your personal target. Keep noticing what helps you feel rested.';
  }

  const recommendations = [
    'Maintain a consistent sleep schedule: try to go to bed and wake up at similar times most days, even on weekends, to help regulate your body clock.',
    'Create a calming wind-down routine: spend 30-60 minutes before bed doing relaxing activities like reading, gentle stretching, or quiet breathing exercises.',
    'Optimize your sleep environment: make your bedroom dark, quiet, and cool. Consider blackout curtains, earplugs, or a white noise machine if needed.',
  ];

  if (balance < 0) {
    recommendations.push(
      'Reduce evening screen time: avoid bright screens (phones, tablets, computers) for at least 1 hour before bed, as blue light can interfere with sleep.',
    );
    recommendations.push(
      'Limit late-day caffeine: avoid caffeine after 2-3 PM, as it can stay in your system for several hours and affect sleep quality.',
    );
  }

  if (balance >= 5) {
    recommendations.push(
      'If you consistently sleep more than your target and feel refreshed, consider adjusting your target to match your natural needs.',
    );
  }

  const plan = [
    {
      label: 'This Week',
      detail: `Aim to meet or get closer to your ${targetPerNight}-hour nightly target. Focus on one or two small changes, such as going to bed 15-30 minutes earlier or creating a simple wind-down routine.`,
    },
    {
      label: 'This Month',
      detail:
        'Establish consistent sleep habits: maintain regular bed and wake times, create a relaxing pre-sleep routine, and optimize your sleep environment for darkness, quiet, and comfort.',
    },
    {
      label: 'Ongoing',
      detail:
        'Continue monitoring your sleep patterns and adjust your target or routines as needed. Remember that occasional variation is normal, and focus on overall trends rather than perfect daily consistency.',
    },
  ];

  return {
    targetPerNight,
    totalSlept,
    weeklyTarget,
    balance,
    balancePercent,
    status,
    interpretation,
    recommendations,
    plan,
  };
};

export default function SleepBalanceCheckInCalculator() {
  const [result, setResult] = useState<ResultPayload | null>(null);

  const form = useForm<FormValues>({
    resolver: zodResolver(formSchema),
    defaultValues: {
      targetPerNight: undefined,
      mon: undefined,
      tue: undefined,
      wed: undefined,
      thu: undefined,
      fri: undefined,
      sat: undefined,
      sun: undefined,
    },
  });

  return (
    <div className="space-y-8">
      <Script
        id="sleep-balance-checkin-schema"
        type="application/ld+json"
        strategy="afterInteractive"
        dangerouslySetInnerHTML={{ __html: JSON.stringify(schemaMarkup) }}
      />

      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <Moon className="h-5 w-5" />
            Sleep Balance Check-In
          </CardTitle>
          <CardDescription>
            Get general wellness insights about your weekly sleep balance compared to your personal target. This is a personal
            lifestyle insight, not a medical evaluation.
          </CardDescription>
        </CardHeader>
      </Card>

      <Card>
        <CardHeader>
          <CardTitle>Input your sleep data</CardTitle>
        </CardHeader>
        <CardContent>
          <Form {...form}>
            <form
              onSubmit={form.handleSubmit((values) => setResult(calculateResult(values)))}
              className="space-y-6"
            >
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <FormField
                  control={form.control}
                  name="targetPerNight"
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel>Target sleep per night (hours)</FormLabel>
                      <FormControl>
                        <Input
                          type="number"
                          step="0.1"
                          placeholder="e.g., 7.5"
                          value={field.value ?? ''}
                          onChange={(e) =>
                            field.onChange(e.target.value === '' ? undefined : Number(e.target.value))
                          }
                        />
                      </FormControl>
                      <FormMessage />
                    </FormItem>
                  )}
                />
              </div>
              <div className="grid grid-cols-1 md:grid-cols-7 gap-4">
                <FormField
                  control={form.control}
                  name="mon"
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel>Monday (hours)</FormLabel>
                      <FormControl>
                        <Input
                          type="number"
                          step="0.1"
                          placeholder="e.g., 7"
                          value={field.value ?? ''}
                          onChange={(e) =>
                            field.onChange(e.target.value === '' ? undefined : Number(e.target.value))
                          }
                        />
                      </FormControl>
                      <FormMessage />
                    </FormItem>
                  )}
                />
                <FormField
                  control={form.control}
                  name="tue"
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel>Tuesday (hours)</FormLabel>
                      <FormControl>
                        <Input
                          type="number"
                          step="0.1"
                          placeholder="e.g., 7"
                          value={field.value ?? ''}
                          onChange={(e) =>
                            field.onChange(e.target.value === '' ? undefined : Number(e.target.value))
                          }
                        />
                      </FormControl>
                      <FormMessage />
                    </FormItem>
                  )}
                />
                <FormField
                  control={form.control}
                  name="wed"
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel>Wednesday (hours)</FormLabel>
                      <FormControl>
                        <Input
                          type="number"
                          step="0.1"
                          placeholder="e.g., 7"
                          value={field.value ?? ''}
                          onChange={(e) =>
                            field.onChange(e.target.value === '' ? undefined : Number(e.target.value))
                          }
                        />
                      </FormControl>
                      <FormMessage />
                    </FormItem>
                  )}
                />
                <FormField
                  control={form.control}
                  name="thu"
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel>Thursday (hours)</FormLabel>
                      <FormControl>
                        <Input
                          type="number"
                          step="0.1"
                          placeholder="e.g., 7"
                          value={field.value ?? ''}
                          onChange={(e) =>
                            field.onChange(e.target.value === '' ? undefined : Number(e.target.value))
                          }
                        />
                      </FormControl>
                      <FormMessage />
                    </FormItem>
                  )}
                />
                <FormField
                  control={form.control}
                  name="fri"
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel>Friday (hours)</FormLabel>
                      <FormControl>
                        <Input
                          type="number"
                          step="0.1"
                          placeholder="e.g., 7"
                          value={field.value ?? ''}
                          onChange={(e) =>
                            field.onChange(e.target.value === '' ? undefined : Number(e.target.value))
                          }
                        />
                      </FormControl>
                      <FormMessage />
                    </FormItem>
                  )}
                />
                <FormField
                  control={form.control}
                  name="sat"
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel>Saturday (hours)</FormLabel>
                      <FormControl>
                        <Input
                          type="number"
                          step="0.1"
                          placeholder="e.g., 8"
                          value={field.value ?? ''}
                          onChange={(e) =>
                            field.onChange(e.target.value === '' ? undefined : Number(e.target.value))
                          }
                        />
                      </FormControl>
                      <FormMessage />
                    </FormItem>
                  )}
                />
                <FormField
                  control={form.control}
                  name="sun"
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel>Sunday (hours)</FormLabel>
                      <FormControl>
                        <Input
                          type="number"
                          step="0.1"
                          placeholder="e.g., 8"
                          value={field.value ?? ''}
                          onChange={(e) =>
                            field.onChange(e.target.value === '' ? undefined : Number(e.target.value))
                          }
                        />
                      </FormControl>
                      <FormMessage />
                    </FormItem>
                  )}
                />
              </div>
              <Button type="submit" className="w-full md:w-auto">
                Calculate sleep balance
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
            <CardDescription>See sleep balance, balance percentage, and recommendations.</CardDescription>
          </CardHeader>
          <CardContent className="space-y-6">
            <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
              <div className="p-4 border rounded">
                <p className="text-sm text-muted-foreground">Sleep balance</p>
                <p className="text-2xl font-semibold text-primary">
                  {result.balance > 0 ? '+' : ''}
                  {result.balance.toFixed(1)} hours
                </p>
                <p className="text-xs text-muted-foreground">
                  {result.balance === 0
                    ? 'Right on target'
                    : result.balance > 0
                    ? 'Above target'
                    : 'Below target'}
                </p>
              </div>
              <div className="p-4 border rounded">
                <p className="text-sm text-muted-foreground">Total slept</p>
                <p className="text-2xl font-semibold text-primary">{result.totalSlept.toFixed(1)} hours</p>
                <p className="text-xs text-muted-foreground">This week</p>
              </div>
              <div className="p-4 border rounded">
                <p className="text-sm text-muted-foreground">Balance %</p>
                <p className="text-2xl font-semibold text-primary">{result.balancePercent.toFixed(0)}%</p>
                <p className="text-xs text-muted-foreground">Of target</p>
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
            <strong>Weekly target</strong> = Target sleep per night Ã— 7 days. This represents your ideal total sleep for the
            week.
          </p>
          <p>
            <strong>Total slept</strong> = Sum of sleep hours for Monday + Tuesday + Wednesday + Thursday + Friday + Saturday +
            Sunday.
          </p>
          <p>
            <strong>Sleep balance</strong> = Total slept âˆ’ Weekly target. Positive values indicate you slept more than your
            target; negative values indicate less.
          </p>
          <p>
            <strong>Balance percentage</strong> = (Total slept / Weekly target) Ã— 100, clamped to 0-200% range. Values near 100%
            indicate you met your target; values below 100% indicate a sleep deficit; values above 100% indicate surplus sleep.
          </p>
          <p>
            Sleep balance reflects how your actual sleep compares to your personal target. Individual sleep needs vary, and this
            tool is for gentle reflection on patterns rather than strict adherence to a number.
          </p>
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
                <p className="text-sm text-muted-foreground">Daily average</p>
                <p className="text-xl font-semibold text-primary">
                  {(result.totalSlept / 7).toFixed(1)} hours
                </p>
                <p className="text-xs text-muted-foreground">Per night this week</p>
              </div>
              <div className="p-4 border rounded">
                <p className="text-sm text-muted-foreground">Weekly target</p>
                <p className="text-xl font-semibold text-primary">{result.weeklyTarget.toFixed(1)} hours</p>
                <p className="text-xs text-muted-foreground">Based on your target</p>
              </div>
              <div className="p-4 border rounded">
                <p className="text-sm text-muted-foreground">Balance level</p>
                <p className="text-xl font-semibold text-primary">
                  {result.balancePercent >= 115
                    ? 'Surplus'
                    : result.balancePercent >= 95
                    ? 'On Target'
                    : result.balancePercent >= 85
                    ? 'Slight Deficit'
                    : 'Significant Deficit'}
                </p>
                <p className="text-xs text-muted-foreground">Based on calculation</p>
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

      <section
        className="space-y-6 text-muted-foreground leading-relaxed bg-white p-6 md:p-10 rounded-lg shadow-lg"
        itemType="https://schema.org/MedicalWebPage"
      >
        {/* SEO & SCHEMA METADATA (HIGHLY OPTIMIZED) */}
        <meta itemProp="name" content="The Definitive Guide to Sleep Balance: Understanding Your Weekly Sleep Patterns" />
        <meta
          itemProp="description"
          content="An expert, evidence-based guide on sleep balance, detailing how to compare your weekly sleep to personal targets, understand sleep patterns, and develop strategies to support restful nights."
        />
        <meta
          itemProp="keywords"
          content="sleep balance check in, weekly sleep overview, sleep habits reflection, bedtime routine, gentle sleep insight, sleep patterns"
        />
        <meta itemProp="author" content="[Your Site's Health Team]" />
        <meta itemProp="datePublished" content="2025-12-01" />
        <meta itemProp="url" content="/definitive-sleep-balance-guide" />

        <h1 className="text-3xl md:text-4xl font-extrabold text-foreground mb-4" itemProp="headline">
          The Definitive Guide to Sleep Balance: Understanding Your Weekly Sleep Patterns and Supporting Restful Nights
        </h1>
        <p className="text-lg italic text-gray-700">
          Explore the concept of sleep balance, learn how to compare your weekly sleep to personal targets, understand factors
          affecting sleep patterns, and discover comprehensive strategies to support more restful nights.
        </p>

        {/* TABLE OF CONTENTS (INTERNAL LINKS FOR UX AND SEO) */}
        <h2 className="text-2xl font-bold text-foreground mt-8 mb-4">Table of Contents: Jump to a Section</h2>
        <ul className="list-disc ml-6 space-y-2 text-blue-600">
          <li>
            <a href="#sleep-balance" className="hover:underline">
              Understanding Sleep Balance and Weekly Patterns
            </a>
          </li>
          <li>
            <a href="#sleep-needs" className="hover:underline">
              Individual Sleep Needs and Targets
            </a>
          </li>
          <li>
            <a href="#factors" className="hover:underline">
              Factors Affecting Sleep Balance
            </a>
          </li>
          <li>
            <a href="#strategies" className="hover:underline">
              Comprehensive Strategies for Better Sleep Balance
            </a>
          </li>
        </ul>
        <hr />

        {/* UNDERSTANDING SLEEP BALANCE */}
        <h2 id="sleep-balance" className="text-2xl font-bold text-foreground pt-8" itemProp="articleSection">
          Understanding Sleep Balance and Weekly Patterns
        </h2>
        <p>
          Sleep balance refers to how your actual sleep compares to your personal target over a week. Unlike daily tracking,
          weekly balance provides a broader view that accounts for natural day-to-day variation while highlighting overall
          patterns. This approach recognizes that occasional nights of less or more sleep are normal, but consistent patterns may
          benefit from gentle lifestyle adjustments.
        </p>

        <h3 className="text-xl font-semibold text-foreground mt-6">Why Weekly Balance Matters</h3>
        <p>
          Looking at sleep over a full week helps you see trends beyond single-night fluctuations. A weekly view accounts for
          weekends, work schedules, and life demands that naturally affect sleep. It also helps you notice whether you are
          consistently meeting your needs or building a sleep deficit over time.
        </p>

        <h3 className="text-xl font-semibold text-foreground mt-6">Understanding Balance Percentages</h3>
        <p>
          Balance percentages show how close you came to your target:
        </p>
        <ul>
          <li>
            <b>95-105%:</b> Very close to your target, suggesting your routines are working well for you.
          </li>
          <li>
            <b>85-95%:</b> Slightly below target, indicating small adjustments may help you feel more rested.
          </li>
          <li>
            <b>Below 85%:</b> Noticeably below target, suggesting more significant lifestyle adjustments may be beneficial.
          </li>
          <li>
            <b>Above 105%:</b> Above target, which may be fine if you feel refreshed, or may indicate your target could be
            adjusted.
          </li>
        </ul>

        <hr />

        {/* INDIVIDUAL SLEEP NEEDS */}
        <h2 id="sleep-needs" className="text-2xl font-bold text-foreground pt-8" itemProp="articleSection">
          Individual Sleep Needs and Targets
        </h2>
        <p>
          Sleep needs vary significantly between individuals. While most adults feel best with 7-9 hours per night, some people
          naturally need more or less. Your personal target should reflect what leaves you feeling refreshed, alert, and able to
          function well during the day.
        </p>

        <h3 className="text-xl font-semibold text-foreground mt-6">Finding Your Personal Target</h3>
        <p>
          To find your ideal sleep target, pay attention to how you feel after different amounts of sleep. Consider:
        </p>
        <ul>
          <li>How many hours of sleep leave you feeling refreshed and alert?</li>
          <li>Do you need an alarm clock, or do you wake naturally?</li>
          <li>How do you feel during the dayâ€”energetic or tired?</li>
          <li>Do you need caffeine to function, or can you maintain energy naturally?</li>
        </ul>
        <p>
          Your target may change over time due to age, health, stress, or lifestyle factors. It is okay to adjust your target as
          your needs evolve.
        </p>

        <hr />

        {/* FACTORS AFFECTING SLEEP */}
        <h2 id="factors" className="text-2xl font-bold text-foreground pt-8" itemProp="articleSection">
          Factors Affecting Sleep Balance
        </h2>
        <p>
          Many factors can influence your sleep balance, from lifestyle choices to environmental conditions. Understanding these
          factors can help you identify areas for gentle improvement.
        </p>

        <h3 className="text-xl font-semibold text-foreground mt-6">Lifestyle Factors</h3>
        <ul>
          <li>
            <b>Work schedules:</b> Shift work, long hours, or irregular schedules can disrupt sleep patterns.
          </li>
          <li>
            <b>Stress:</b> High stress levels can make it harder to fall asleep or stay asleep.
          </li>
          <li>
            <b>Caffeine:</b> Consuming caffeine late in the day can interfere with sleep quality and timing.
          </li>
          <li>
            <b>Alcohol:</b> While alcohol may help you fall asleep, it can disrupt sleep quality later in the night.
          </li>
          <li>
            <b>Exercise timing:</b> Regular exercise supports sleep, but intense exercise too close to bedtime may interfere.
          </li>
          <li>
            <b>Meal timing:</b> Large or heavy meals close to bedtime can disrupt sleep.
          </li>
        </ul>

        <h3 className="text-xl font-semibold text-foreground mt-6">Environmental Factors</h3>
        <ul>
          <li>
            <b>Light exposure:</b> Bright lights, especially blue light from screens, can suppress melatonin and delay sleep.
          </li>
          <li>
            <b>Room temperature:</b> Most people sleep best in a cool room (around 65-68Â°F or 18-20Â°C).
          </li>
          <li>
            <b>Noise:</b> Consistent or sudden noises can disrupt sleep, even if you do not fully wake.
          </li>
          <li>
            <b>Bed comfort:</b> An uncomfortable mattress, pillow, or bedding can interfere with restful sleep.
          </li>
        </ul>

        <hr />

        {/* COMPREHENSIVE STRATEGIES */}
        <h2 id="strategies" className="text-2xl font-bold text-foreground pt-8" itemProp="articleSection">
          Comprehensive Strategies for Better Sleep Balance
        </h2>
        <p>
          Improving sleep balance often involves a combination of consistent routines, environmental adjustments, and lifestyle
          choices. Small, sustainable changes tend to work better than drastic shifts.
        </p>

        <h3 className="text-xl font-semibold text-foreground mt-6">1. Establish Consistent Sleep Schedules</h3>
        <ul>
          <li>
            <b>Regular bedtimes:</b> Try to go to bed at roughly the same time most nights, even on weekends.
          </li>
          <li>
            <b>Regular wake times:</b> Wake up at similar times each day to help regulate your body clock.
          </li>
          <li>
            <b>Weekend consistency:</b> Avoid sleeping in more than 1-2 hours on weekends, as large shifts can disrupt your
            rhythm.
          </li>
        </ul>

        <h3 className="text-xl font-semibold text-foreground mt-6">2. Create a Calming Wind-Down Routine</h3>
        <ul>
          <li>
            <b>Start early:</b> Begin winding down 30-60 minutes before your target bedtime.
          </li>
          <li>
            <b>Relaxing activities:</b> Read, listen to calming music, do gentle stretching, or practice breathing exercises.
          </li>
          <li>
            <b>Avoid stimulating activities:</b> Skip intense exercise, work, or stressful conversations close to bedtime.
          </li>
          <li>
            <b>Screen-free time:</b> Avoid bright screens for at least 1 hour before bed, or use blue light filters if you must
            use devices.
          </li>
        </ul>

        <h3 className="text-xl font-semibold text-foreground mt-6">3. Optimize Your Sleep Environment</h3>
        <ul>
          <li>
            <b>Darkness:</b> Use blackout curtains, eye masks, or dim lights to create a dark sleep space.
          </li>
          <li>
            <b>Quiet:</b> Use earplugs, white noise machines, or soundproofing to minimize noise disruptions.
          </li>
          <li>
            <b>Temperature:</b> Keep your bedroom cool and well-ventilated. Consider a fan or air conditioning if needed.
          </li>
          <li>
            <b>Comfort:</b> Invest in a comfortable mattress, supportive pillows, and breathable bedding.
          </li>
        </ul>

        <h3 className="text-xl font-semibold text-foreground mt-6">4. Manage Lifestyle Factors</h3>
        <ul>
          <li>
            <b>Caffeine timing:</b> Avoid caffeine after 2-3 PM, as it can stay in your system for several hours.
          </li>
          <li>
            <b>Alcohol moderation:</b> If you drink alcohol, do so earlier in the evening and in moderation.
          </li>
          <li>
            <b>Exercise regularly:</b> Aim for regular physical activity, but finish intense workouts at least 2-3 hours before
            bedtime.
          </li>
          <li>
            <b>Meal timing:</b> Avoid large meals within 2-3 hours of bedtime.
          </li>
        </ul>

        <h3 className="text-xl font-semibold text-foreground mt-6">5. Address Stress and Mental Health</h3>
        <ul>
          <li>
            <b>Stress management:</b> Practice relaxation techniques like meditation, deep breathing, or progressive muscle
            relaxation.
          </li>
          <li>
            <b>Worry time:</b> Set aside time earlier in the day to address worries, rather than letting them interfere with
            sleep.
          </li>
          <li>
            <b>Professional support:</b> If stress, anxiety, or depression are significantly affecting your sleep, consider
            speaking with a mental health professional.
          </li>
        </ul>

        <hr />

        {/* CONCLUSION */}
        <h2 className="text-2xl font-bold text-foreground pt-8" itemProp="articleSection">Conclusion</h2>
        <p>
          Understanding sleep balance is fundamental to supporting restful nights and overall well-being. The combination of{' '}
          <b>consistent sleep schedules</b>, a <b>calming wind-down routine</b>, an <b>optimized sleep environment</b>, and{' '}
          <b>lifestyle adjustments</b> creates a foundation for better sleep balance. Remember that occasional variation is normal,
          and focus on overall trends rather than perfect daily consistency. If you have persistent concerns about your sleep,
          energy, or overall health, consider consulting a qualified healthcare professional who can provide personalized
          guidance.
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
          <p>
            This tool provides general wellness insights about your weekly sleep balance compared to your personal target. This is
            a personal lifestyle insight, not a medical evaluation.
          </p>
          <p>
            Outputs include target sleep per night, total slept, weekly target, sleep balance, balance percentage, status,
            recommendations, an action plan, and supporting metrics.
          </p>
          <p>
            Formula, steps, guide content, related tools, and FAQs ensure humans or AI assistants can interpret the methodology
            instantly.
          </p>
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
          <p>
            Disclaimer: This tool provides general wellness and lifestyle insights for educational purposes only. It is not a
            medical or psychological diagnosis. For any health concerns, please consult a qualified professional.
          </p>
        </CardContent>
      </Card>
    </div>
  );
}

'use client';

import { useState } from 'react';
import Script from 'next/script';
import Link from 'next/link';
import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import { z } from 'zod';
import { Activity, Zap, Target, AlertTriangle, Shield, BatteryWarning } from 'lucide-react';

import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Form, FormControl, FormField, FormItem, FormLabel, FormMessage } from '@/components/ui/form';
import { Input } from '@/components/ui/input';

const formSchema = z.object({
  highFocusBlocksPerDay: z.number({ invalid_type_error: 'Enter high-focus blocks' }).min(0).max(12),
  averageBlockMinutes: z.number({ invalid_type_error: 'Enter average block length' }).min(15).max(240),
  recoveryMinutesBetweenBlocks: z
    .number({ invalid_type_error: 'Enter recovery time' })
    .min(0)
    .max(240),
  sleepHoursLastNight: z.number({ invalid_type_error: 'Enter sleep hours' }).min(3).max(12),
  baselineStressLevel: z.number({ invalid_type_error: 'Enter stress level' }).min(0).max(10),
});

type FormValues = z.infer<typeof formSchema>;

type ResultPayload = {
  highFocusBlocksPerDay: number;
  averageBlockMinutes: number;
  recoveryMinutesBetweenBlocks: number;
  sleepHoursLastNight: number;
  baselineStressLevel: number;
  fatigueScore: number;
  status: 'optimal' | 'good' | 'moderate' | 'low';
  interpretation: string;
  recommendations: string[];
  plan: { label: string; detail: string }[];
};

const steps = [
  'Enter how many high-focus or cognitively demanding blocks you complete in a typical day.',
  'Enter the average duration (in minutes) of each focus block.',
  'Enter how many minutes of genuine recovery you usually get between blocks (away from demanding tasks).',
  'Enter how many hours you slept last night.',
  'Rate your baseline stress level from 0 (very low) to 10 (very high), then review your mental fatigue accumulation score.',
];

const faqs = [
  {
    question: 'What is mental fatigue accumulation?',
    answer:
      'Mental fatigue accumulation describes how cognitive load builds up across tasks and days when recovery is insufficient. It can lead to slower thinking, reduced focus, mistakes, and a sense of being mentally “drained.”',
  },
  {
    question: 'How is this tracker different from a simple fatigue rating?',
    answer:
      'Instead of a one-time rating, this tracker looks at how your schedule structure—block length, number of blocks, recovery time, sleep, and stress—interact to build or relieve fatigue throughout the day.',
  },
  {
    question: 'Does more deep work always increase mental fatigue?',
    answer:
      'Deep work is demanding and will create fatigue, but with adequate sleep and between-block recovery it can be sustainable and highly productive. Problems arise when high load is paired with chronic sleep restriction and minimal breaks.',
  },
  {
    question: 'Can short breaks really make a difference?',
    answer:
      'Yes. Even 5–10 minute breaks to move, hydrate, or rest your eyes can help reset attention and slow fatigue accumulation, especially when taken regularly between demanding blocks.',
  },
  {
    question: 'How does sleep affect mental fatigue?',
    answer:
      'Sleep is when your brain consolidates learning, clears metabolic byproducts, and resets many systems involved in attention and emotion. Chronically short sleep makes each focus block more taxing and slows recovery.',
  },
  {
    question: 'What role does stress play in mental fatigue?',
    answer:
      'High baseline stress increases background cognitive load, leaving fewer resources for focus and making tasks feel more draining. Managing stress through boundaries, support, and recovery habits is key to sustainable performance.',
  },
  {
    question: 'Is this tracker a medical or psychiatric tool?',
    answer:
      'No. It is an educational planning aid, not a diagnostic instrument. It can highlight patterns that may contribute to feeling mentally worn out but cannot diagnose conditions like depression, anxiety, or chronic fatigue.',
  },
  {
    question: 'When should I seek professional help?',
    answer:
      'If mental fatigue is severe, persistent, and interfering with daily life despite reasonable rest and schedule changes, or if it is accompanied by low mood, anxiety, or physical symptoms, consider speaking with a healthcare professional.',
  },
];

const relatedCalculators = [
  {
    name: 'Daily Mental Energy Budget Calculator',
    slug: 'daily-mental-energy-budget-calculator',
    description: 'Estimate how much focused work you can handle each day.',
  },
  {
    name: 'Work Stress Fatigue Index',
    slug: 'work-stress-fatigue-index',
    description: 'Evaluate how workload and stress are driving fatigue.',
  },
  {
    name: 'Sleep Consistency Score Calculator',
    slug: 'sleep-consistency-score-calculator',
    description: 'Check whether irregular sleep timing is amplifying fatigue.',
  },
  {
    name: 'Digital Burnout Detector',
    slug: 'digital-burnout-detector',
    description: 'Assess whether digital overload is contributing to exhaustion.',
  },
];

const baseUrl =
  'https://mycalculating.com/category/health-fitness/mental-fatigue-accumulation-tracker';

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
          item: 'https://mycalculating.com/category/health-fitness',
        },
        {
          '@type': 'ListItem',
          position: 3,
          name: 'Mental Fatigue Accumulation Wellness Tracker',
          item: baseUrl,
        },
      ],
    },
    {
      '@type': 'SoftwareApplication',
          name: 'Mental Fatigue Accumulation Wellness Tracker',
      applicationCategory: 'Calculator',
      operatingSystem: 'Web Browser',
      description:
        'Track how your daily schedule, break patterns, sleep, and stress interact to build or relieve mental fatigue.',
      url: baseUrl,
      offers: { '@type': 'Offer', price: '0', priceCurrency: 'USD' },
    },
  ],
};

const clamp = (value: number, min: number, max: number) => Math.min(max, Math.max(min, value));

const calculateResult = (values: FormValues): ResultPayload => {
  const {
    highFocusBlocksPerDay,
    averageBlockMinutes,
    recoveryMinutesBetweenBlocks,
    sleepHoursLastNight,
    baselineStressLevel,
  } = values;

  const totalFocusMinutes = highFocusBlocksPerDay * averageBlockMinutes; // daily load
  const loadComponent = clamp(totalFocusMinutes / 480, 0, 1); // relative to 8 hours of heavy focus
  const recoveryComponent = clamp(
    recoveryMinutesBetweenBlocks / 60,
    0,
    1
  ); // 0–60+ minutes between blocks
  const sleepComponent = clamp((8 - sleepHoursLastNight) / 3, 0, 1); // deficit vs 8 hours
  const stressComponent = clamp(baselineStressLevel / 10, 0, 1);

  // Higher load, sleep deficit, and stress raise fatigue; better recovery lowers it
  const raw =
    0.4 * loadComponent +
    0.25 * sleepComponent +
    0.2 * stressComponent +
    0.15 * (1 - recoveryComponent); // 0–1
  const fatigueScore = clamp(raw * 100, 0, 100);

  let status: ResultPayload['status'] = 'optimal';
  let interpretation =
    'This suggests a general lifestyle tendency where your schedule and recovery patterns may suggest relatively low daily mental fatigue accumulation, assuming you maintain similar habits over time.';

  if (fatigueScore >= 75) {
    status = 'low';
    interpretation =
      'This suggests a general lifestyle tendency where your mental fatigue accumulation may appear high. Sustained heavy load with limited recovery and/or sleep debt may be leaving you mentally exhausted by the end of the day. You may consider seeking professional guidance if needed. This is a personal insight, not a medical evaluation.';
  } else if (fatigueScore >= 55) {
    status = 'moderate';
    interpretation =
      'This suggests a general lifestyle tendency where you may show signs of elevated fatigue accumulation. You may consider adjusting block length, breaks, or sleep, which could meaningfully improve how you feel and perform.';
  } else if (fatigueScore >= 35) {
    status = 'good';
    interpretation =
      'This suggests a general lifestyle tendency where your fatigue accumulation may be moderate and likely manageable. A few targeted improvements may keep it in check during busier periods.';
  }

  const recommendations: string[] = [
    'Aim to cap most high-focus blocks at 60–90 minutes, followed by 5–15 minutes of genuine recovery away from demanding tasks.',
    'Protect a consistent sleep window that provides roughly 7–9 hours of sleep opportunity each night.',
    'Mix cognitively heavy tasks with lighter administrative or physical tasks to avoid stacking too much load back-to-back.',
  ];

  if (totalFocusMinutes > 240) {
    recommendations.push(
      'If you regularly exceed 4 hours of intense focus per day, consider whether some tasks can be delegated, automated, or simplified.'
    );
  }

  if (recoveryMinutesBetweenBlocks < 15 && highFocusBlocksPerDay >= 3) {
    recommendations.push(
      'Introduce short, device-light breaks between focus blocks to allow your brain to reset before the next challenge.'
    );
  }

  if (sleepHoursLastNight < 7) {
    recommendations.push(
      'Prioritize sleep for the next few nights—mental fatigue often drops significantly when sleep debt is repaid.'
    );
  }

  const plan = [
    {
      label: 'Today',
      detail:
        'Notice where focus blocks cluster and insert at least one short break before your longest or most demanding block.',
    },
    {
      label: 'This Week',
      detail:
        'Experiment with a schedule that limits you to 3–5 deep work blocks on your heaviest days, each followed by a structured break.',
    },
    {
      label: 'Ongoing',
      detail:
        'Reassess your fatigue score when workload or stress changes, and proactively adjust sleep and recovery rather than waiting until burnout signs appear.',
    },
  ];

  return {
    highFocusBlocksPerDay,
    averageBlockMinutes,
    recoveryMinutesBetweenBlocks,
    sleepHoursLastNight,
    baselineStressLevel,
    fatigueScore,
    status,
    interpretation,
    recommendations,
    plan,
  };
};

export default function MentalFatigueAccumulationTracker() {
  const [result, setResult] = useState<ResultPayload | null>(null);

  const form = useForm<FormValues>({
    resolver: zodResolver(formSchema),
    defaultValues: {
      highFocusBlocksPerDay: undefined,
      averageBlockMinutes: undefined,
      recoveryMinutesBetweenBlocks: undefined,
      sleepHoursLastNight: undefined,
      baselineStressLevel: undefined,
    },
  });

  return (
    <div className="space-y-8">
      <Script
        id="mental-fatigue-accumulation-schema"
        type="application/ld+json"
        strategy="afterInteractive"
        dangerouslySetInnerHTML={{ __html: JSON.stringify(schemaMarkup) }}
      />

      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <BatteryWarning className="h-5 w-5" />
            Mental Fatigue Accumulation Wellness Tracker
          </CardTitle>
          <CardDescription>
            Estimate how your current workload, breaks, sleep, and stress interact to build mental fatigue across the day.
          </CardDescription>
        </CardHeader>
      </Card>

      <Card>
        <CardHeader>
          <CardTitle>Describe your typical day</CardTitle>
        </CardHeader>
        <CardContent>
          <Form {...form}>
            <form onSubmit={form.handleSubmit((values) => setResult(calculateResult(values)))} className="space-y-6">
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <FormField
                  control={form.control}
                  name="highFocusBlocksPerDay"
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel>High-focus blocks per day</FormLabel>
                      <FormControl>
                        <Input
                          type="number"
                          step="1"
                          placeholder="e.g., 4"
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
                  name="averageBlockMinutes"
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel>Average length of each block (minutes)</FormLabel>
                      <FormControl>
                        <Input
                          type="number"
                          step="5"
                          placeholder="e.g., 60"
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
                  name="recoveryMinutesBetweenBlocks"
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel>Recovery time between blocks (minutes)</FormLabel>
                      <FormControl>
                        <Input
                          type="number"
                          step="5"
                          placeholder="e.g., 20"
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
                  name="sleepHoursLastNight"
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel>Sleep last night (hours)</FormLabel>
                      <FormControl>
                        <Input
                          type="number"
                          step="0.5"
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
                <FormField
                  control={form.control}
                  name="baselineStressLevel"
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel>Baseline stress level (0–10)</FormLabel>
                      <FormControl>
                        <Input
                          type="number"
                          step="1"
                          placeholder="e.g., 6"
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
                Track mental fatigue accumulation
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
            <CardDescription>See your fatigue score, status, and key contributors.</CardDescription>
          </CardHeader>
          <CardContent className="space-y-6">
            <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
              <div className="p-4 border rounded">
                <p className="text-sm text-muted-foreground">Fatigue accumulation score</p>
                <p className="text-2xl font-semibold text-primary">{result.fatigueScore.toFixed(1)}</p>
                <p className="text-xs text-muted-foreground">Out of 100</p>
              </div>
              <div className="p-4 border rounded">
                <p className="text-sm text-muted-foreground">Total focus load</p>
                <p className="text-2xl font-semibold text-primary">
                  {(result.highFocusBlocksPerDay * result.averageBlockMinutes).toFixed(0)} min
                </p>
                <p className="text-xs text-muted-foreground">Per day</p>
              </div>
              <div className="p-4 border rounded">
                <p className="text-sm text-muted-foreground">Recovery strength</p>
                <p className="text-2xl font-semibold text-primary">
                  {Math.round(
                    clamp(result.recoveryMinutesBetweenBlocks / 60, 0, 1) * 100
                  )}
                  %
                </p>
                <p className="text-xs text-muted-foreground">Higher = better</p>
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
            <Activity className="h-5 w-5" />
            Formula
          </CardTitle>
        </CardHeader>
        <CardContent className="text-sm text-muted-foreground space-y-2">
          <p>
            The <strong>mental fatigue accumulation score</strong> reflects your daily cognitive load (total focus
            minutes), sleep debt, baseline stress, and the strength of your between-block recovery on a 0–100 scale.
          </p>
          <p>
            Higher scores indicate that mental fatigue is likely to build quickly across the day, while lower scores
            suggest that your workload and recovery are currently well balanced.
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
          <CardTitle>Related calculators</CardTitle>
        </CardHeader>
        <CardContent className="grid grid-cols-1 md:grid-cols-2 gap-4">
          {relatedCalculators.map((calc) => (
            <div key={calc.slug} className="p-4 border rounded">
              <h4 className="font-semibold mb-1">
                <Link
                  href={`/health-fitness/${calc.slug}`}
                  className="text-primary hover:underline"
                >
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
        <meta
          itemProp="name"
          content="Mental Fatigue Accumulation: Balancing Cognitive Load, Sleep, and Recovery"
        />
        <meta
          itemProp="description"
          content="Learn how mental fatigue accumulates across your day, why breaks and sleep matter, and how to design a schedule that supports sustained focus without burning out."
        />
        <meta
          itemProp="keywords"
          content="mental fatigue accumulation tracker, cognitive load, deep work limits, breaks and recovery, sleep and performance"
        />
        <meta itemProp="author" content="[Your Site's Cognitive Performance Team]" />
        <meta itemProp="datePublished" content="2025-12-01" />
        <meta itemProp="url" content="/mental-fatigue-accumulation-guide" />

        <h1
          className="text-3xl md:text-4xl font-extrabold text-foreground mb-4"
          itemProp="headline"
        >
          Mental Fatigue Accumulation: How to Structure Your Day for Sustainable Focus
        </h1>
        <p className="text-lg italic text-gray-700">
          Discover how workload, recovery, sleep, and stress interact to create mental fatigue—and how small structural
          changes to your day can dramatically improve energy and concentration.
        </p>

        <h2 className="text-2xl font-bold text-foreground mt-8 mb-4">
          Table of Contents: Jump to a Section
        </h2>
        <ul className="list-disc ml-6 space-y-2 text-blue-600">
          <li>
            <a href="#what-is-fatigue" className="hover:underline">
              What Is Mental Fatigue?
            </a>
          </li>
          <li>
            <a href="#load-vs-recovery" className="hover:underline">
              Cognitive Load vs. Recovery: The Daily Balance
            </a>
          </li>
          <li>
            <a href="#role-of-sleep" className="hover:underline">
              The Role of Sleep and Stress in Mental Fatigue
            </a>
          </li>
          <li>
            <a href="#designing-day" className="hover:underline">
              Designing a Day That Respects Your Brain’s Limits
            </a>
          </li>
          <li>
            <a href="#when-to-adjust" className="hover:underline">
              When to Adjust Your Plan or Seek Extra Support
            </a>
          </li>
        </ul>

        <hr />

        <h2
          id="what-is-fatigue"
          className="text-2xl font-bold text-foreground pt-8"
          itemProp="articleSection"
        >
          What Is Mental Fatigue?
        </h2>
        <p>
          Mental fatigue is the sense of diminished mental energy and effectiveness that develops after prolonged
          cognitive effort. It shows up as slower thinking, reduced motivation, increased errors, and difficulty focusing,
          even on tasks you usually handle well.
        </p>

        <h2
          id="load-vs-recovery"
          className="text-2xl font-bold text-foreground pt-8"
          itemProp="articleSection"
        >
          Cognitive Load vs. Recovery: The Daily Balance
        </h2>
        <p>
          Every demand you place on your attention adds to cognitive load. Recovery—through breaks, movement, and
          low-demand activities—helps discharge that load. Problems arise when load accumulates faster than recovery, day
          after day, especially under tight deadlines or high stakes.
        </p>

        <h2
          id="role-of-sleep"
          className="text-2xl font-bold text-foreground pt-8"
          itemProp="articleSection"
        >
          The Role of Sleep and Stress in Mental Fatigue
        </h2>
        <p>
          Sleep and stress act as amplifiers. Short or irregular sleep means your brain starts the day with less reserve.
          High stress adds constant background noise, consuming attention even before you begin focused work. Addressing
          both is essential for managing fatigue, not just rearranging tasks.
        </p>

        <h2
          id="designing-day"
          className="text-2xl font-bold text-foreground pt-8"
          itemProp="articleSection"
        >
          Designing a Day That Respects Your Brain’s Limits
        </h2>
        <p>
          Sustainable days usually combine a few high-focus blocks with meaningful breaks, lighter work, and movement.
          Rather than maximizing hours in front of a screen, the goal is to maximize useful output while preserving your
          ability to show up again tomorrow.
        </p>

        <h2
          id="when-to-adjust"
          className="text-2xl font-bold text-foreground pt-8"
          itemProp="articleSection"
        >
          When to Adjust Your Plan or Seek Extra Support
        </h2>

        <p>
          If your fatigue score remains high even after improving sleep and breaks, your workload may simply be too high
          for one person—or physical or mental health factors may be involved. In those cases, discuss options with a
          supervisor, mentor, or healthcare professional rather than assuming you just need more willpower.
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
            This tracker estimates mental fatigue accumulation on a 0–100 scale from workload, breaks, sleep, and stress
            inputs.
          </p>
          <p>
            It provides interpretation, recommendations, an action plan, a supporting guide, related calculators, and FAQs
            so humans or AI assistants can quickly understand and act on the results.
          </p>
          <p>
            The tool is intended for education and planning, not for diagnosis or treatment decisions.
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
          <p>Disclaimer: This tool provides general wellness and lifestyle insights for educational purposes only. It is not a medical or psychological diagnosis. For any health concerns, please consult a qualified professional.</p>
        </CardContent>
      </Card>
    </div>
  );
}



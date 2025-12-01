'use client';

import { useState } from 'react';
import Script from 'next/script';
import Link from 'next/link';
import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import { z } from 'zod';
import { Activity, Zap, Target, AlertTriangle, Shield, Smartphone } from 'lucide-react';

import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Form, FormControl, FormField, FormItem, FormLabel, FormMessage } from '@/components/ui/form';
import { Input } from '@/components/ui/input';

const formSchema = z.object({
  dailyScreenHours: z.number({ invalid_type_error: 'Enter daily screen time' }).min(0).max(18),
  afterWorkHours: z.number({ invalid_type_error: 'Enter after-work/leisure screen hours' }).min(0).max(12),
  notificationBurstsPerDay: z.number({ invalid_type_error: 'Enter notification bursts' }).min(0).max(300),
  breakFrequencyMinutes: z.number({ invalid_type_error: 'Enter break frequency' }).min(5).max(240),
  digitalWorkStress: z.number({ invalid_type_error: 'Enter digital work stress level' }).min(0).max(10),
});

type FormValues = z.infer<typeof formSchema>;

type ResultPayload = {
  dailyScreenHours: number;
  afterWorkHours: number;
  notificationBurstsPerDay: number;
  breakFrequencyMinutes: number;
  digitalWorkStress: number;
  burnoutScore: number;
  status: 'optimal' | 'good' | 'moderate' | 'low';
  interpretation: string;
  recommendations: string[];
  plan: { label: string; detail: string }[];
};

const steps = [
  'Enter your approximate total daily screen time across work and leisure.',
  'Enter how many hours you spend on screens after work or in the evening.',
  'Estimate how many times per day your attention is interrupted by notifications or message bursts.',
  'Enter how often you take real breaks away from screens (in minutes between breaks).',
  'Rate your digital work stress level from 0 (none) to 10 (extreme) and review your burnout risk score.',
];

const faqs = [
  {
    question: 'What is digital burnout?',
    answer:
      'Digital burnout refers to emotional exhaustion, reduced effectiveness, and detachment that arise from prolonged, high-intensity use of digital devices and online platforms, especially without sufficient rest or boundaries.',
  },
  {
    question: 'How is digital burnout different from general burnout?',
    answer:
      'General burnout can stem from any chronic stressor (workload, caregiving, financial strain), while digital burnout focuses on stress specifically driven by screen time, constant connectivity, notifications, and information overload. They often overlap but require slightly different strategies.',
  },
  {
    question: 'Does more screen time always mean higher burnout risk?',
    answer:
      'Not always. Total screen time matters, but the quality of your screen use, level of control, and presence of breaks are just as important. Focused, meaningful work with breaks is less risky than scattered, interrupted multitasking for the same number of hours.',
  },
  {
    question: 'Why do notifications and interruptions matter so much?',
    answer:
      'Frequent notifications fragment attention, increase perceived workload, and prevent deep recovery between tasks. Even small interruptions can accumulate into cognitive fatigue and a sense of being “always on.”',
  },
  {
    question: 'How often should I take breaks from screens?',
    answer:
      'Many ergonomics guidelines suggest looking away or standing briefly every 20–30 minutes, and taking a more substantial break every 60–90 minutes. Short, regular breaks help reset attention and reduce eye strain.',
  },
  {
    question: 'Can this tool diagnose burnout or mental health conditions?',
    answer:
      'No. This calculator is an educational tool to reflect on patterns that may increase burnout risk. It does not provide a diagnosis and should not replace professional assessment or treatment.',
  },
  {
    question: 'What are warning signs that I should seek professional help?',
    answer:
      'Seek help if you feel persistently exhausted, hopeless, or irritable; struggle to function at work or in relationships; have significant sleep disruption; or experience thoughts of self-harm. These signs go beyond digital burnout and warrant professional support.',
  },
  {
    question: 'Can small changes really reduce digital burnout risk?',
    answer:
      'Yes. Even modest steps—batching notifications, adding 2–3 short breaks per day, creating a device-free wind-down period—can noticeably improve energy and mental clarity over a few weeks.',
  },
];

const relatedCalculators = [
  {
    name: 'Daily Screen Time Impact Calculator',
    slug: 'daily-screen-time-impact-calculator',
    description: 'Estimate how total screen time may be influencing your well-being.',
  },
  {
    name: 'Digital Eye Strain Severity Index',
    slug: 'digital-eye-strain-severity-index',
    description: 'Assess eye strain and discomfort from prolonged screen use.',
  },
  {
    name: 'Microbreak Frequency Calculator for Desk Jobs',
    slug: 'microbreak-frequency-calculator-for-desk-jobs',
    description: 'Plan short, regular breaks to reduce fatigue during desk work.',
  },
  {
    name: 'Sleep Quality vs Screen Exposure Analyzer',
    slug: 'sleep-quality-vs-screen-exposure-analyzer',
    description: 'Explore how evening screen habits impact your sleep quality.',
  },
];

const baseUrl = 'https://mycalculating.com/category/health-fitness/digital-burnout-detector';

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
          name: 'Digital Burnout Detector',
          item: baseUrl,
        },
      ],
    },
    {
      '@type': 'SoftwareApplication',
      name: 'Digital Burnout Detector',
      applicationCategory: 'Calculator',
      operatingSystem: 'Web Browser',
      description:
        'Estimate your risk of digital burnout from screen time, interruptions, break frequency, and perceived digital work stress.',
      url: baseUrl,
      offers: { '@type': 'Offer', price: '0', priceCurrency: 'USD' },
    },
  ],
};

const clamp = (value: number, min: number, max: number) => Math.min(max, Math.max(min, value));

const calculateResult = (values: FormValues): ResultPayload => {
  const { dailyScreenHours, afterWorkHours, notificationBurstsPerDay, breakFrequencyMinutes, digitalWorkStress } =
    values;

  const screenLoad = clamp((dailyScreenHours / 12) * 40, 0, 40);
  const eveningLoad = clamp((afterWorkHours / 6) * 20, 0, 20);
  const interruptionLoad = clamp((notificationBurstsPerDay / 100) * 20, 0, 20);
  const breakPenalty = clamp(((breakFrequencyMinutes - 20) / 100) * 10, 0, 10); // infrequent breaks add penalty
  const stressLoad = clamp((digitalWorkStress / 10) * 20, 0, 20);

  let burnoutScore = screenLoad + eveningLoad + interruptionLoad + breakPenalty + stressLoad;
  burnoutScore = clamp(burnoutScore, 0, 100);

  let status: ResultPayload['status'] = 'optimal';
  let interpretation =
    'Your current pattern suggests relatively low digital burnout risk, especially if you maintain healthy breaks and boundaries.';

  if (burnoutScore >= 75) {
    status = 'low';
    interpretation =
      'Your digital burnout risk appears high. Heavy screen use, frequent interruptions, and limited recovery may be significantly straining your energy and focus.';
  } else if (burnoutScore >= 55) {
    status = 'moderate';
    interpretation =
      'You show signs of elevated digital burnout risk. Adjusting breaks, notifications, and evening screen habits could noticeably improve your well-being.';
  } else if (burnoutScore >= 35) {
    status = 'good';
    interpretation =
      'Your risk is moderate but manageable. With a few targeted changes, you can keep burnout risk low even during busy periods.';
  }

  const recommendations: string[] = [
    'Batch non-urgent notifications and messages into specific check-in times instead of responding continuously.',
    'Schedule brief, device-free breaks every 60–90 minutes of screen work to reset attention and posture.',
    'Create a 30–60 minute “digital wind-down” window before bed with minimal screens and lower-stimulation activities.',
  ];

  if (afterWorkHours >= 3) {
    recommendations.push(
      'Reduce evening recreational screen time by replacing at least 30–60 minutes with analog, relaxing activities a few nights per week.'
    );
  }

  if (notificationBurstsPerDay >= 80) {
    recommendations.push(
      'Turn off non-essential notifications and group chat pings during focused work blocks to reduce constant context switching.'
    );
  }

  if (breakFrequencyMinutes > 90) {
    recommendations.push(
      'Aim to stand up, stretch, or step away from screens at least briefly every 60–90 minutes, even during busy days.'
    );
  }

  const plan = [
    {
      label: 'This Week',
      detail:
        'Track your screen time and notification patterns. Experiment with one device-free microbreak in both the morning and afternoon each workday.',
    },
    {
      label: 'This Month',
      detail:
        'Gradually tighten your work and personal screen boundaries—for example, no email in bed, or one social media check-in window daily.',
    },
    {
      label: 'Ongoing',
      detail:
        'Reassess your burnout risk regularly and adjust habits before chronic exhaustion sets in, especially during high-demand seasons.',
    },
  ];

  return {
    dailyScreenHours,
    afterWorkHours,
    notificationBurstsPerDay,
    breakFrequencyMinutes,
    digitalWorkStress,
    burnoutScore,
    status,
    interpretation,
    recommendations,
    plan,
  };
};

export default function DigitalBurnoutDetector() {
  const [result, setResult] = useState<ResultPayload | null>(null);

  const form = useForm<FormValues>({
    resolver: zodResolver(formSchema),
    defaultValues: {
      dailyScreenHours: undefined,
      afterWorkHours: undefined,
      notificationBurstsPerDay: undefined,
      breakFrequencyMinutes: undefined,
      digitalWorkStress: undefined,
    },
  });

  return (
    <div className="space-y-8">
      <Script
        id="digital-burnout-detector-schema"
        type="application/ld+json"
        strategy="afterInteractive"
        dangerouslySetInnerHTML={{ __html: JSON.stringify(schemaMarkup) }}
      />

      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <Smartphone className="h-5 w-5" />
            Digital Burnout Detector
          </CardTitle>
          <CardDescription>
            Estimate your risk of digital burnout from screen load, interruptions, breaks, and perceived stress.
          </CardDescription>
        </CardHeader>
      </Card>

      <Card>
        <CardHeader>
          <CardTitle>Input your digital habits</CardTitle>
        </CardHeader>
        <CardContent>
          <Form {...form}>
            <form onSubmit={form.handleSubmit((values) => setResult(calculateResult(values)))} className="space-y-6">
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <FormField
                  control={form.control}
                  name="dailyScreenHours"
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel>Total daily screen time (hours)</FormLabel>
                      <FormControl>
                        <Input
                          type="number"
                          step="0.5"
                          placeholder="e.g., 9"
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
                  name="afterWorkHours"
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel>Evening/leisure screen time (hours)</FormLabel>
                      <FormControl>
                        <Input
                          type="number"
                          step="0.5"
                          placeholder="e.g., 3"
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
                  name="notificationBurstsPerDay"
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel>Notification bursts per day</FormLabel>
                      <FormControl>
                        <Input
                          type="number"
                          step="5"
                          placeholder="e.g., 80"
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
                  name="breakFrequencyMinutes"
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel>Average time between breaks (minutes)</FormLabel>
                      <FormControl>
                        <Input
                          type="number"
                          step="5"
                          placeholder="e.g., 90"
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
                  name="digitalWorkStress"
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel>Digital work stress (0–10)</FormLabel>
                      <FormControl>
                        <Input
                          type="number"
                          step="1"
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
              </div>
              <Button type="submit" className="w-full md:w-auto">
                Detect digital burnout risk
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
            <CardDescription>See your burnout risk score, status, and interpretation.</CardDescription>
          </CardHeader>
          <CardContent className="space-y-6">
            <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
              <div className="p-4 border rounded">
                <p className="text-sm text-muted-foreground">Burnout risk score</p>
                <p className="text-2xl font-semibold text-primary">{result.burnoutScore.toFixed(1)}</p>
                <p className="text-xs text-muted-foreground">Out of 100</p>
              </div>
              <div className="p-4 border rounded">
                <p className="text-sm text-muted-foreground">Screen load</p>
                <p className="text-2xl font-semibold text-primary">{result.dailyScreenHours.toFixed(1)} h</p>
                <p className="text-xs text-muted-foreground">Per day</p>
              </div>
              <div className="p-4 border rounded">
                <p className="text-sm text-muted-foreground">Notification load</p>
                <p className="text-2xl font-semibold text-primary">
                  {result.notificationBurstsPerDay.toFixed(0)}
                </p>
                <p className="text-xs text-muted-foreground">Bursts per day</p>
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
            The <strong>digital burnout risk score</strong> combines total and evening screen time, notification
            interruptions, break frequency, and perceived digital work stress into a 0–100 index.
          </p>
          <p>
            Higher screen load, more interruptions, fewer breaks, and higher perceived stress increase the score, while
            frequent breaks and reasonable boundaries reduce risk.
          </p>
          <p>
            This index is intended for education and reflection only and does not diagnose medical or mental health
            conditions.
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
                  href={`/category/health-fitness/${calc.slug}`}
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
          content="Digital Burnout: Managing Screen Overload, Notifications, and Always-On Work"
        />
        <meta
          itemProp="description"
          content="A practical guide to recognizing digital burnout, understanding how screen time and notifications contribute to exhaustion, and learning evidence-informed strategies to build healthier tech habits."
        />
        <meta
          itemProp="keywords"
          content="digital burnout detector, screen time fatigue, notification overload, tech boundaries, online work stress"
        />
        <meta itemProp="author" content="[Your Site's Digital Wellbeing Team]" />
        <meta itemProp="datePublished" content="2025-12-01" />
        <meta itemProp="url" content="/digital-burnout-detector-guide" />

        <h1
          className="text-3xl md:text-4xl font-extrabold text-foreground mb-4"
          itemProp="headline"
        >
          Digital Burnout: How to Recognize Screen-Induced Exhaustion and Reclaim Your Energy
        </h1>
        <p className="text-lg italic text-gray-700">
          Learn how high screen loads, constant notifications, and blurred work-life boundaries drain your energy—and how
          to design a more sustainable relationship with your devices.
        </p>

        <h2 className="text-2xl font-bold text-foreground mt-8 mb-4">
          Table of Contents: Jump to a Section
        </h2>
        <ul className="list-disc ml-6 space-y-2 text-blue-600">
          <li>
            <a href="#what-is-digital-burnout" className="hover:underline">
              What Is Digital Burnout?
            </a>
          </li>
          <li>
            <a href="#drivers" className="hover:underline">
              Core Drivers: Screen Time, Interruptions, and Boundaries
            </a>
          </li>
          <li>
            <a href="#signs" className="hover:underline">
              Common Signs and Symptoms
            </a>
          </li>
          <li>
            <a href="#prevention" className="hover:underline">
              Strategies to Prevent or Reverse Digital Burnout
            </a>
          </li>
          <li>
            <a href="#help" className="hover:underline">
              When to Seek Additional Help
            </a>
          </li>
        </ul>

        <hr />

        <h2
          id="what-is-digital-burnout"
          className="text-2xl font-bold text-foreground pt-8"
          itemProp="articleSection"
        >
          What Is Digital Burnout?
        </h2>
        <p>
          Digital burnout develops when constant digital demands outpace your brain and body’s capacity to recover.
          Instead of discrete workdays and rest periods, you feel tethered to screens, checking messages late at night and
          first thing in the morning. Over time, this can erode motivation, creativity, and emotional resilience.
        </p>

        <h2
          id="drivers"
          className="text-2xl font-bold text-foreground pt-8"
          itemProp="articleSection"
        >
          Core Drivers: Screen Time, Interruptions, and Boundaries
        </h2>
        <p>
          Total hours matter, but digital burnout is especially driven by three interacting factors: high cognitive load,
          frequent interruptions, and lack of boundaries. Multitasking across apps, juggling constant notifications, and
          checking work communications off-hours all increase mental fatigue.
        </p>
        <ul className="list-disc ml-6 space-y-1">
          <li>High screen hours with little variation or recovery time.</li>
          <li>Rapid-fire notifications that prevent deep focus and rest.</li>
          <li>Blurred lines between work and leisure, especially when working remotely.</li>
        </ul>

        <h2
          id="signs"
          className="text-2xl font-bold text-foreground pt-8"
          itemProp="articleSection"
        >
          Common Signs and Symptoms
        </h2>
        <p>
          Early signs can be subtle: eye strain, headaches, or a sense that you are “always behind.” As burnout deepens,
          you may feel emotionally numb, irritable, or detached from work and hobbies. Sleep quality often suffers, and it
          may become hard to disconnect even when you want to.
        </p>

        <h2
          id="prevention"
          className="text-2xl font-bold text-foreground pt-8"
          itemProp="articleSection"
        >
          Strategies to Prevent or Reverse Digital Burnout
        </h2>
        <p>
          Prevention focuses on creating sustainable rhythms rather than eliminating technology. Simple changes—like batch
          checking, scheduled breaks, clear “offline” hours, and deliberate leisure that does not involve screens—can
          substantially reduce risk.
        </p>
        <ul className="list-disc ml-6 space-y-1">
          <li>Use do-not-disturb modes and focus filters during deep work or rest.</li>
          <li>Protect at least one daily block of time that is fully offline, even if only 20–30 minutes.</li>
          <li>Mix screen-based hobbies with offline ones (reading, walking, crafts, time in nature).</li>
        </ul>

        <h2
          id="help"
          className="text-2xl font-bold text-foreground pt-8"
          itemProp="articleSection"
        >
          When to Seek Additional Help
        </h2>
        <p>
          If setting boundaries and adjusting habits does not relieve symptoms—or if you experience severe stress,
          persistent low mood, or functional impairment—consider speaking with a mental health professional. Digital
          burnout often overlaps with anxiety, depression, or occupational burnout and may require a broader support plan.
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
            This tool estimates digital burnout risk from screen time, interruptions, break patterns, and perceived stress
            on a 0–100 scale.
          </p>
          <p>
            It provides interpretation, recommendations, an action plan, a supporting guide, related calculators, and FAQs
            to help humans or AI assistants explain the results.
          </p>
          <p>
            The calculator is for education and self-reflection only and is not a substitute for professional care.
          </p>
        </CardContent>
      </Card>
    </div>
  );
}



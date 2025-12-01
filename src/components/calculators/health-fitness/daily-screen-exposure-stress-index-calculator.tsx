'use client';

import { useState } from 'react';
import Script from 'next/script';
import Link from 'next/link';
import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import { z } from 'zod';
import { Smartphone, ActivitySquare, BellRing, Brain, ShieldCheck } from 'lucide-react';

import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Form, FormControl, FormField, FormItem, FormLabel, FormMessage } from '@/components/ui/form';
import { Input } from '@/components/ui/input';

const formSchema = z.object({
  workScreenHours: z.number({ invalid_type_error: 'Enter hours' }).min(0).max(14),
  personalScreenHours: z.number({ invalid_type_error: 'Enter hours' }).min(0).max(10),
  notificationsPerDay: z.number({ invalid_type_error: 'Enter notifications' }).min(0).max(400),
  meetingHours: z.number({ invalid_type_error: 'Enter meeting hours' }).min(0).max(10),
  microBreaksPerHour: z.number({ invalid_type_error: 'Enter breaks' }).min(0).max(12),
});

type FormValues = z.infer<typeof formSchema>;

type ResultPayload = {
  stressIndex: number;
  status: 'steady' | 'strained' | 'overloaded';
  interpretation: string;
  totalScreen: number;
  attentionBudget: number;
  recommendations: string[];
  plan: { label: string; detail: string }[];
};

const steps = [
  'Track your work screen hours for a typical day, including laptop, desktop, and tablets.',
  'Estimate personal/leisure screen hours (streaming, gaming, social apps).',
  'Pull your notification count from Screen Time, Digital Wellbeing, or wearable dashboards.',
  'Log synchronous meeting hours (video calls, webinars, live classes).',
  'Count how many intentional micro-breaks (≥30 seconds) you take per hour, such as stretches or breath resets.',
  'Plug the data into the calculator to benchmark your stress index and choose the easiest lever to adjust.',
];

const faqs = [
  {
    question: 'What is the Daily Screen Exposure Stress Index?',
    answer: 'It combines screen duration, notification load, meeting density, and break cadence into a single 0–100 score that reflects digital overstimulation risk.',
  },
  {
    question: 'How often should I recalculate?',
    answer: 'Weekly is ideal. Update sooner when workload spikes, you start a new project, or your sleep/recovery plummets.',
  },
  {
    question: 'What are micro-breaks?',
    answer: 'Micro-breaks are short, intentional pauses every 20–30 minutes (looking away, standing, breathing). They disrupt continuous focus before stress hormones spike.',
  },
  {
    question: 'Do audio-only calls count as screen time?',
    answer: 'Yes if you stare at a screen during them. If you can walk or glance away, reduce the meeting-hour input accordingly.',
  },
  {
    question: 'How many notifications are too many?',
    answer: 'Most people hit diminishing returns above ~150 pings/day. The calculator highlights the tipping point based on your other habits.',
  },
  {
    question: 'Can I apply this to teens or students?',
    answer: 'Absolutely—swap work hours for study/school hours and meetings for classes to guide healthier digital habits.',
  },
  {
    question: 'What if I work night shifts?',
    answer: 'Enter the same data; the index is time-agnostic. Consider adding natural light breaks to offset circadian strain.',
  },
  {
    question: 'How do I lower the score?',
    answer: 'Bundle notifications, schedule screen-free blocks, turn meetings into async updates, and insert enforced breaks.',
  },
  {
    question: 'Does blue light filtering change the score?',
    answer: 'Filters help eyes but not stress load. Pair them with reduced stimuli for the biggest payoff.',
  },
  {
    question: 'Is 0 stress realistic?',
    answer: 'Not really. The goal is to sit in the “steady” range where stress is productive, not overwhelming.',
  },
];

const relatedCalculators = [
  {
    name: 'Blue Light Exposure Calculator',
    slug: 'blue-light-exposure-calculator',
    description: 'Estimate light dose and melatonin disruption from screens.',
  },
  {
    name: 'Habit Streak Tracker Calculator',
    slug: 'habit-streak-tracker-calculator',
    description: 'Lock in distraction-free streaks with simple chains.',
  },
  {
    name: 'Stress Level Self-Assessment Calculator',
    slug: 'stress-level-self-assessment-calculator',
    description: 'Evaluate overall stress so you can compare it with digital load.',
  },
  {
    name: 'Sleep Efficiency Calculator',
    slug: 'sleep-efficiency-calculator',
    description: 'Confirm that screen detox efforts improve nightly recovery.',
  },
];

const baseUrl = 'https://mycalculating.com/category/health-fitness/daily-screen-exposure-stress-index-calculator';

const schemaMarkup = {
  '@context': 'https://schema.org',
  '@graph': [
    {
      '@type': 'BreadcrumbList',
      itemListElement: [
        { '@type': 'ListItem', position: 1, name: 'Home', item: 'https://mycalculating.com' },
        { '@type': 'ListItem', position: 2, name: 'Health & Fitness', item: 'https://mycalculating.com/category/health-fitness' },
        { '@type': 'ListItem', position: 3, name: 'Daily Screen Exposure Stress Index', item: baseUrl },
      ],
    },
    {
      '@type': 'Article',
      headline: 'Daily Screen Exposure Stress Index',
      description: 'Quantify digital overload from hours, notifications, and breaks. Get instant recommendations.',
      author: { '@type': 'Organization', name: 'Mycalculating.com' },
      publisher: { '@type': 'Organization', name: 'Mycalculating.com' },
      url: baseUrl,
      mainEntityOfPage: baseUrl,
      datePublished: '2024-01-01',
      dateModified: new Date().toISOString().split('T')[0],
    },
    {
      '@type': 'SoftwareApplication',
      name: 'Daily Screen Exposure Stress Index Calculator',
      applicationCategory: 'Calculator',
      operatingSystem: 'Web Browser',
      offers: { '@type': 'Offer', price: '0', priceCurrency: 'USD' },
      featureList: ['Stress index score', 'Attention budget estimate', 'Actionable routines'],
      url: baseUrl,
      description: 'Calculate your stress index by blending screen time, notifications, meetings, and break cadence.',
    },
  ],
};

const clamp = (value: number, min: number, max: number) => Math.min(max, Math.max(min, value));

const calculateResult = (values: FormValues): ResultPayload => {
  const totalScreen = values.workScreenHours + values.personalScreenHours;
  const notificationLoad = values.notificationsPerDay * 0.15;
  const meetingLoad = values.meetingHours * 6;
  const breakRelief = values.microBreaksPerHour * 12;
  const rawIndex = totalScreen * 7 + notificationLoad + meetingLoad - breakRelief;
  const stressIndex = clamp(Math.round(rawIndex), 0, 100);
  const attentionBudget = clamp(480 - totalScreen * 18 - values.notificationsPerDay * 0.4 + values.microBreaksPerHour * 10, 60, 480);

  let status: ResultPayload['status'] = 'steady';
  let interpretation =
    'Your current digital load looks relatively manageable based on these entries. You can keep leaning on the breaks and boundaries that already work for you.';

  if (stressIndex >= 45) {
    status = 'strained';
    interpretation =
      'Your responses point to a fairly full digital day. It may help to gently buffer notifications, batch some tasks, or add a few more small off‑screen pauses.';
  }
  if (stressIndex >= 70) {
    status = 'overloaded';
    interpretation =
      'These numbers suggest your day may feel quite packed with screens and pings. You might experiment with protected off‑screen windows, trimming notifications, or lightening meetings where possible.';
  }

  const recommendations = [
    'Try silencing non‑essential alerts for parts of the day so you can focus or rest more easily.',
    'Group similar tasks together when you can, instead of switching apps and contexts constantly.',
    'Add one or two short, screen‑free breaks in the middle of your day to reset your body and attention.',
  ];
  if (status === 'strained') {
    recommendations.push('Where possible, swap some live meetings for written updates to create more breathing room.');
  }
  if (status === 'overloaded') {
    recommendations.push('On a day that feels safe to do so, try longer stretches with most notifications off and notice how that feels.');
  }

  const plan = [
    { label: 'Morning block', detail: 'If it fits your life, begin the day with a short screen‑lighter period for sunlight, stretching, or planning on paper.' },
    { label: 'Midday reset', detail: 'Aim for at least one walking, stretching, or off‑screen break around the middle of your day.' },
    { label: 'Evening boundary', detail: 'Experiment with a simple “digital sunset” before bed that feels realistic for your schedule.' },
  ];

  return { stressIndex, status, interpretation, totalScreen, attentionBudget, recommendations, plan };
};

export default function DailyScreenExposureStressIndexCalculator() {
  const [result, setResult] = useState<ResultPayload | null>(null);

  const form = useForm<FormValues>({
    resolver: zodResolver(formSchema),
    defaultValues: {
      workScreenHours: undefined,
      personalScreenHours: undefined,
      notificationsPerDay: undefined,
      meetingHours: undefined,
      microBreaksPerHour: undefined,
    },
  });

  return (
    <div className="space-y-8">
      <Script id="screen-stress-schema" type="application/ld+json" strategy="afterInteractive" dangerouslySetInnerHTML={{ __html: JSON.stringify(schemaMarkup) }} />

      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <Smartphone className="h-5 w-5" />
            Daily Screen Exposure Stress Index
          </CardTitle>
          <CardDescription>Blend screen time, notifications, meetings, and breaks into a single stress score.</CardDescription>
        </CardHeader>
      </Card>

      <Card>
        <CardHeader>
          <CardTitle>Input your data</CardTitle>
          <CardDescription>Leave blanks until you’re ready—everything customizes after submit.</CardDescription>
        </CardHeader>
        <CardContent>
          <Form {...form}>
            <form onSubmit={form.handleSubmit((values) => setResult(calculateResult(values)))} className="space-y-6">
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                {[
                  { name: 'workScreenHours', label: 'Work / school screen hours', placeholder: 'e.g., 8.5', step: 0.25 },
                  { name: 'personalScreenHours', label: 'Personal screen hours', placeholder: 'e.g., 3', step: 0.25 },
                  { name: 'notificationsPerDay', label: 'Notifications per day', placeholder: 'e.g., 120', step: 1 },
                  { name: 'meetingHours', label: 'Live meeting hours', placeholder: 'e.g., 4', step: 0.25 },
                  { name: 'microBreaksPerHour', label: 'Micro-breaks each hour', placeholder: 'e.g., 2', step: 1 },
                ].map((fieldConfig) => (
                  <FormField
                    key={fieldConfig.name}
                    // @ts-expect-error dynamic access
                    name={fieldConfig.name}
                    control={form.control}
                    render={({ field }) => (
                      <FormItem>
                        <FormLabel>{fieldConfig.label}</FormLabel>
                        <FormControl>
                          <Input
                            type="number"
                            step={fieldConfig.step}
                            placeholder={fieldConfig.placeholder}
                            value={field.value ?? ''}
                            onChange={(event) => field.onChange(event.target.value === '' ? undefined : Number(event.target.value))}
                          />
                        </FormControl>
                        <FormMessage />
                      </FormItem>
                    )}
                  />
                ))}
              </div>
              <Button type="submit" className="w-full md:w-auto">
                Calculate stress index
              </Button>
            </form>
          </Form>
        </CardContent>
      </Card>

      {result && (
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <ActivitySquare className="h-5 w-5 text-primary" />
              Interactive result & interpretation
            </CardTitle>
            <CardDescription>Review your screen‑time pattern and remaining attention space for the day.</CardDescription>
          </CardHeader>
          <CardContent className="space-y-6">
            <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
              <div className="p-4 border rounded">
                <p className="text-sm text-muted-foreground">Stress index</p>
                <p className="text-2xl font-semibold text-primary">{result.stressIndex}</p>
                <p className="text-xs text-muted-foreground">Rough pattern: 0–34 steady · 35–69 strained · 70+ very full</p>
              </div>
              <div className="p-4 border rounded">
                <p className="text-sm text-muted-foreground">Total screen time</p>
                <p className="text-2xl font-semibold text-primary">{result.totalScreen.toFixed(1)} hrs</p>
                <p className="text-xs text-muted-foreground">Use this number as a reflection point, not a strict target.</p>
              </div>
              <div className="p-4 border rounded">
                <p className="text-sm text-muted-foreground">Attention budget left</p>
                <p className="text-2xl font-semibold text-primary">{result.attentionBudget} min</p>
                <p className="text-xs text-muted-foreground">Reinvest this into recovery rituals.</p>
              </div>
            </div>
            <div className="rounded border p-4 bg-muted/50">
              <p className="text-sm uppercase tracking-wide text-muted-foreground mb-1">Status</p>
              <p className="text-lg font-semibold capitalize">{result.status}</p>
              <p className="text-sm text-muted-foreground">{result.interpretation}</p>
            </div>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div className="p-4 border rounded">
                <h4 className="font-semibold mb-2">Recommendations</h4>
                <ul className="list-disc pl-4 space-y-1 text-sm text-muted-foreground">
                  {result.recommendations.map((item) => (
                    <li key={item}>{item}</li>
                  ))}
                </ul>
              </div>
              <div className="p-4 border rounded">
                <h4 className="font-semibold mb-2">Action plan</h4>
                <ul className="space-y-1 text-sm text-muted-foreground">
                  {result.plan.map((item) => (
                    <li key={item.label}>
                      <span className="font-semibold">{item.label}:</span> {item.detail}
                    </li>
                  ))}
                </ul>
              </div>
            </div>
          </CardContent>
        </Card>
      )}

      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <BellRing className="h-5 w-5" />
            Formula
          </CardTitle>
        </CardHeader>
        <CardContent className="space-y-2 text-sm text-muted-foreground">
          <p>
            <strong>Stress Index</strong> = clamp( workHours + personalHours ) × 7 + notifications × 0.15 + meetings × 6 − micro-breaks × 12
          </p>
          <p>
            <strong>Attention Budget</strong> = 480 − totalScreen × 18 − notifications × 0.4 + micro-breaks × 10
          </p>
          <p>Both metrics are clamped to realistic ranges so you can observe progress as habits evolve.</p>
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
          <CardTitle>Additional calculation</CardTitle>
          <CardDescription>Spot your biggest lever.</CardDescription>
        </CardHeader>
        <CardContent>
          {result ? (
            <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
              <div className="p-4 border rounded">
                <p className="text-sm text-muted-foreground">Digital load ratio</p>
                <p className="text-xl font-semibold text-primary">
                  {(result.totalScreen / 24 * 100).toFixed(0)}%
                </p>
                <p className="text-xs text-muted-foreground">Percent of the day spent in front of screens.</p>
              </div>
              <div className="p-4 border rounded">
                <p className="text-sm text-muted-foreground">Boundary gap</p>
                <p className="text-xl font-semibold text-primary">
                  {(9 - result.totalScreen).toFixed(1)} hrs
                </p>
                <p className="text-xs text-muted-foreground">Hours above/below a 9-hour target.</p>
              </div>
              <div className="p-4 border rounded">
                <p className="text-sm text-muted-foreground">Break coverage</p>
                <p className="text-xl font-semibold text-primary">
                  {(form.getValues().microBreaksPerHour ?? 0) * 5}%
                </p>
                <p className="text-xs text-muted-foreground">Percentage of working hour spent off-screen.</p>
              </div>
            </div>
          ) : (
            <p className="text-sm text-muted-foreground">Run the calculator to see load ratio, boundary gap, and break coverage.</p>
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
          <p>
            Chronic screen overload compounds stress, muscular tension, and sleep disruption. Tracking it with a simple index helps
            you set boundaries proactively instead of reacting to burnout.
          </p>
          <p>
            Start with the easiest lever—notifications, meetings, or break cadence—and iterate each week. Pair the calculator with
            bedtime audits to see how digital hygiene improves recovery.
          </p>
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
            <ShieldCheck className="h-5 w-5" />
            Summary
          </CardTitle>
        </CardHeader>
        <CardContent className="space-y-2 text-sm text-muted-foreground">
          <p>This calculator blends screen time, notifications, meetings, and breaks into a single index so you can reflect on your digital load.</p>
          <p>Use the score and ideas as prompts for gentle experiments, keeping only the changes that truly support your day‑to‑day well‑being.</p>
        </CardContent>
      </Card>

      <p className="mt-6 text-xs text-muted-foreground text-center">
        Disclaimer: This tool provides general wellness and lifestyle insights for educational purposes only. It is not a
        medical or psychological diagnosis. For any health concerns, please consult a qualified professional.
      </p>
    </div>
  );
}



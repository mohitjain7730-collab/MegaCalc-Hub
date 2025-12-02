'use client';

import { useState } from 'react';
import Script from 'next/script';
import Link from 'next/link';
import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import { z } from 'zod';
import { Activity, Zap, Target, AlertTriangle, Shield } from 'lucide-react';

import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Form, FormControl, FormField, FormItem, FormLabel, FormMessage } from '@/components/ui/form';
import { Input } from '@/components/ui/input';

const formSchema = z.object({
  meetingsHours: z.number({ invalid_type_error: 'Enter meeting hours' }).min(0).max(80),
  deepWorkHours: z.number({ invalid_type_error: 'Enter deep work hours' }).min(0).max(80),
  contextSwitchesPerDay: z.number({ invalid_type_error: 'Enter context switches' }).min(0).max(100),
  sleepHours: z.number({ invalid_type_error: 'Enter sleep hours' }).min(3).max(10),
});

type FormValues = z.infer<typeof formSchema>;

type ResultPayload = {
  meetingsHours: number;
  deepWorkHours: number;
  contextSwitchesPerDay: number;
  sleepHours: number;
  predictedDrainScore: number;
  bufferCapacityScore: number;
  status: 'optimal' | 'good' | 'moderate' | 'low';
  interpretation: string;
  recommendations: string[];
  plan: { label: string; detail: string }[];
};

const steps = [
  'Enter total hours of calls/meetings per week.',
  'Enter total hours of deep, focused work per week.',
  'Estimate average context switches per day (Slack pings, app changes, ad-hoc requests).',
  'Enter average nightly sleep hours over the last 1–2 weeks.',
  'Review predicted mental energy drain and buffer capacity.',
];

const faqs = [
  {
    question: 'What is the Mental Energy Drain Predictor?',
    answer:
      'It is a planning tool that estimates how draining your current work setup may be on your mental energy, based on meetings, deep work, context switches, and sleep.',
  },
  {
    question: 'Why are context switches included?',
    answer:
      'Frequent context switching fragments attention and increases cognitive load, making tasks feel more exhausting.',
  },
  {
    question: 'Is deep work draining or energizing?',
    answer:
      'Deep work uses energy but often feels rewarding. In the model it contributes to drain but also to a sense of meaningful progress when balanced with rest.',
  },
  {
    question: 'How does sleep act as a buffer?',
    answer:
      'Sleep restores cognitive and emotional resources. More consistent sleep increases your buffer capacity score, offsetting drain.',
  },
  {
    question: 'How can I use this with managers or teams?',
    answer:
      'You can share the predicted drain and highlight which levers (fewer meetings, better focus blocks) might reduce burnout risk.',
  },
  {
    question: 'Is this a medical fatigue assessment?',
    answer:
      'No. It is a heuristic model for workload reflection, not a medical diagnostic tool.',
  },
  {
    question: 'What is a high drain score?',
    answer:
      'Scores above ~70 suggest your week is likely to feel mentally draining unless buffers are increased or workload is adjusted.',
  },
  {
    question: 'Can I run it for different weeks?',
    answer:
      'Yes. Try a “normal” week, a crunch week, and a lighter week to compare patterns.',
  },
  {
    question: 'Does this account for physical health?',
    answer:
      'No, but you can pair it with other calculators (sleep, burnout, stress) for a fuller picture.',
  },
  {
    question: 'What if my buffer capacity is very low?',
    answer:
      'That suggests your recovery (especially sleep) may not be enough to support your current workload and interruptions.',
  },
];

const relatedCalculators = [
  {
    name: 'Cognitive Load Estimator',
    slug: 'cognitive-load-estimator',
    description: 'Quantify cognitive workload from projects and distractions.',
  },
  {
    name: 'Daily Energy & Mood Synchronization Tracker',
    slug: 'daily-energy-mood-synchronization-tracker',
    description: 'Align demanding tasks with your energy curve.',
  },
  {
    name: 'Work Stress Fatigue Index',
    slug: 'work-stress-fatigue-index',
    description: 'Assess chronic work stress contributing to fatigue.',
  },
  {
    name: 'Emotional Burnout Recovery Calculator',
    slug: 'emotional-burnout-recovery-calculator',
    description: 'Estimate broader burnout and recovery timelines.',
  },
];

const baseUrl = 'https://mycalculating.com/category/health-fitness/mental-energy-drain-predictor';

const schemaMarkup = {
  '@context': 'https://schema.org',
  '@graph': [
    {
      '@type': 'BreadcrumbList',
      itemListElement: [
        { '@type': 'ListItem', position: 1, name: 'Home', item: 'https://mycalculating.com' },
        { '@type': 'ListItem', position: 2, name: 'Health & Fitness', item: 'https://mycalculating.com/category/health-fitness' },
        { '@type': 'ListItem', position: 3, name: 'Mental Energy Drain Wellness Predictor', item: baseUrl },
      ],
    },
    {
      '@type': 'SoftwareApplication',
      name: 'Mental Energy Drain Wellness Predictor',
      applicationCategory: 'Calculator',
      operatingSystem: 'Web Browser',
      description:
        'Get general wellness insights about mental energy patterns from meetings, deep work, context switches, and sleep buffer. This is a personal lifestyle insight, not a medical evaluation.',
      url: baseUrl,
      offers: { '@type': 'Offer', price: '0', priceCurrency: 'USD' },
    },
  ],
};

const clamp = (value: number, min: number, max: number) => Math.min(max, Math.max(min, value));

const calculateResult = (values: FormValues): ResultPayload => {
  const { meetingsHours, deepWorkHours, contextSwitchesPerDay, sleepHours } = values;

  const meetingsDrain = clamp((meetingsHours / 20) * 30, 0, 40); // heavy meetings can be big drain
  const deepWorkDrain = clamp((deepWorkHours / 20) * 15, 0, 25);
  const switchesDrain = clamp((contextSwitchesPerDay / 30) * 30, 0, 40);

  const baseDrain = meetingsDrain + deepWorkDrain + switchesDrain;

  const sleepBuffer = clamp((sleepHours - 6) / 2 * 30, 0, 40); // 8h => ~30 buffer
  const predictedDrainScore = clamp(baseDrain - sleepBuffer, 0, 100);

  const bufferCapacityScore = clamp(sleepBuffer + (20 - deepWorkDrain * 0.5), 0, 100);

  let status: ResultPayload['status'] = 'good';
  let interpretation =
    'This suggests a general lifestyle tendency where your predicted mental energy drain may feel broadly manageable for many people with similar patterns.';

  if (predictedDrainScore >= 75) {
    status = 'low';
    interpretation =
      'This suggests a general lifestyle tendency where your upcoming week may feel quite mentally full or tiring without some adjustments. You may consider gentle changes to meetings, context switching, or sleep to see what feels better. This is a personal insight, not a medical evaluation.';
  } else if (predictedDrainScore >= 55) {
    status = 'moderate';
    interpretation =
      'This suggests a general lifestyle tendency where your schedule may feel somewhat draining at times. Small shifts in focus time, breaks, or bedtime may noticeably change how the week feels.';
  } else if (predictedDrainScore < 30 && bufferCapacityScore >= 60) {
    status = 'optimal';
    interpretation =
      'This suggests a general lifestyle tendency where your workload and recovery may feel reasonably balanced for your mental energy right now.';
  }

  const recommendations: string[] = [
    'Batch meetings into fewer blocks to protect uninterrupted focus time.',
    'Reduce context switching by using do-not-disturb windows and clearer communication norms.',
    'Protect consistent sleep and short restorative breaks throughout the day.',
  ];

  if (meetingsHours > 25) {
    recommendations.push('Audit recurring meetings and decline or shorten those that are low value or duplicative.');
  }

  if (contextSwitchesPerDay > 25) {
    recommendations.push('Use status messages, office hours, or shared docs to reduce ad-hoc interruptions.');
  }

  if (sleepHours < 6.5) {
    recommendations.push('Experiment with moving bedtime earlier by 15–30 minutes and limiting screens close to bed.');
  }

  const plan = [
    { label: 'This Week', detail: 'Protect at least two deep-work blocks with minimized notifications and limit new meetings where possible.' },
    { label: 'This Month', detail: 'Restructure your calendar to cluster meetings and create predictable focus days or half-days.' },
    { label: 'Ongoing', detail: 'Re-run the predictor after big schedule changes or when you notice rising fatigue, and adjust accordingly.' },
  ];

  return {
    meetingsHours,
    deepWorkHours,
    contextSwitchesPerDay,
    sleepHours,
    predictedDrainScore: Number(predictedDrainScore.toFixed(1)),
    bufferCapacityScore: Number(bufferCapacityScore.toFixed(1)),
    status,
    interpretation,
    recommendations,
    plan,
  };
};

export default function MentalEnergyDrainPredictor() {
  const [result, setResult] = useState<ResultPayload | null>(null);

  const form = useForm<FormValues>({
    resolver: zodResolver(formSchema),
    defaultValues: {
      meetingsHours: undefined,
      deepWorkHours: undefined,
      contextSwitchesPerDay: undefined,
      sleepHours: undefined,
    },
  });

  return (
    <div className="space-y-8">
      <Script id="mental-energy-drain-schema" type="application/ld+json" strategy="afterInteractive" dangerouslySetInnerHTML={{ __html: JSON.stringify(schemaMarkup) }} />

      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <Activity className="h-5 w-5" />
            Mental Energy Drain Wellness Predictor
          </CardTitle>
          <CardDescription>
            Get general wellness insights about mental energy drain from your weekly schedule and sleep. This is a
            personal lifestyle insight, not a medical evaluation.
          </CardDescription>
        </CardHeader>
      </Card>

      <Card>
        <CardHeader>
          <CardTitle>Input your workload data</CardTitle>
        </CardHeader>
        <CardContent>
          <Form {...form}>
            <form onSubmit={form.handleSubmit((values) => setResult(calculateResult(values)))} className="space-y-6">
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <FormField
                  control={form.control}
                  name="meetingsHours"
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel>Meeting/call hours per week</FormLabel>
                      <FormControl>
                        <Input type="number" step="0.5" placeholder="e.g., 18" value={field.value ?? ''} onChange={(e) => field.onChange(e.target.value === '' ? undefined : Number(e.target.value))} />
                      </FormControl>
                      <FormMessage />
                    </FormItem>
                  )}
                />
                <FormField
                  control={form.control}
                  name="deepWorkHours"
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel>Deep work hours per week</FormLabel>
                      <FormControl>
                        <Input type="number" step="0.5" placeholder="e.g., 12" value={field.value ?? ''} onChange={(e) => field.onChange(e.target.value === '' ? undefined : Number(e.target.value))} />
                      </FormControl>
                      <FormMessage />
                    </FormItem>
                  )}
                />
                <FormField
                  control={form.control}
                  name="contextSwitchesPerDay"
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel>Context switches per day</FormLabel>
                      <FormControl>
                        <Input type="number" step="1" placeholder="e.g., 20" value={field.value ?? ''} onChange={(e) => field.onChange(e.target.value === '' ? undefined : Number(e.target.value))} />
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
                      <FormLabel>Sleep per night (hours)</FormLabel>
                      <FormControl>
                        <Input type="number" step="0.1" placeholder="e.g., 7.1" value={field.value ?? ''} onChange={(e) => field.onChange(e.target.value === '' ? undefined : Number(e.target.value))} />
                      </FormControl>
                      <FormMessage />
                    </FormItem>
                  )}
                />
              </div>
              <Button type="submit" className="w-full md:w-auto">
                Predict mental energy drain
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
            <CardDescription>See predicted drain, buffer capacity, and strategy suggestions.</CardDescription>
          </CardHeader>
          <CardContent className="space-y-6">
            <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
              <div className="p-4 border rounded">
                <p className="text-sm text-muted-foreground">Predicted drain</p>
                <p className="text-2xl font-semibold text-primary">{result.predictedDrainScore}</p>
                <p className="text-xs text-muted-foreground">0–100 (higher = more drain)</p>
              </div>
              <div className="p-4 border rounded">
                <p className="text-sm text-muted-foreground">Buffer capacity</p>
                <p className="text-2xl font-semibold text-primary">{result.bufferCapacityScore}</p>
                <p className="text-xs text-muted-foreground">Higher = more cushion</p>
              </div>
              <div className="p-4 border rounded">
                <p className="text-sm text-muted-foreground">Meeting load</p>
                <p className="text-2xl font-semibold text-primary">{result.meetingsHours}</p>
                <p className="text-xs text-muted-foreground">Hours/week</p>
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
            <strong>Predicted drain score</strong> combines meeting hours, deep work hours, and context switches and then subtracts a buffer related to sleep quality.
          </p>
          <p>
            <strong>Buffer capacity score</strong> reflects how much sleep and reduced deep-work drain cushion your mental energy across the week.
          </p>
          <p>
            These formulas are heuristics meant for schedule design and conversations, not clinical fatigue diagnosis.
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
                <p className="text-sm text-muted-foreground">Total work hours (approx)</p>
                <p className="text-xl font-semibold text-primary">
                  {result.meetingsHours + result.deepWorkHours}
                </p>
                <p className="text-xs text-muted-foreground">Meetings + deep work</p>
              </div>
              <div className="p-4 border rounded">
                <p className="text-sm text-muted-foreground">Switch stress index</p>
                <p className="text-xl font-semibold text-primary">
                  {(result.contextSwitchesPerDay / 30 * 100).toFixed(0)}%
                </p>
                <p className="text-xs text-muted-foreground">Relative to heavy switching</p>
              </div>
              <div className="p-4 border rounded">
                <p className="text-sm text-muted-foreground">Sleep sufficiency</p>
                <p className="text-xl font-semibold text-primary">
                  {(result.sleepHours / 8 * 100).toFixed(0)}%
                </p>
                <p className="text-xs text-muted-foreground">Relative to ~8 hours</p>
              </div>
            </div>
          ) : (
            <p className="text-sm text-muted-foreground">Enter your workload data to see additional metrics.</p>
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

      <section className="space-y-6 text-muted-foreground leading-relaxed bg-white p-6 md:p-10 rounded-lg shadow-lg" itemScope itemType="https://schema.org/MedicalWebPage">
        <meta itemProp="name" content="Mental Energy Drain: Designing Schedules That Don’t Exhaust You" />
        <meta itemProp="description" content="Estimate how draining your week may feel and learn practical ways to rebalance meetings, deep work, interruptions, and sleep." />
        <meta itemProp="keywords" content="mental energy drain predictor, fatigue, meetings load, deep work, context switching, sleep" />
        <meta itemProp="author" content="[Your Site's Health Team]" />
        <meta itemProp="datePublished" content="2025-12-01" />
        <meta itemProp="url" content="/definitive-mental-energy-drain-guide" />

        <h1 className="text-3xl md:text-4xl font-extrabold text-foreground mb-4" itemProp="headline">
          Mental Energy Drain: How Your Calendar and Sleep Shape Your Brain’s Fuel
        </h1>
        <p className="text-lg italic text-gray-700">
          Learn why some weeks feel surprisingly light and others crushing, and how to redesign your work environment for sustainable focus.
        </p>

        <h2 className="text-2xl font-bold text-foreground mt-8 mb-4">Table of Contents: Jump to a Section</h2>
        <ul className="list-disc ml-6 space-y-2 text-blue-600">
          <li><a href="#attention" className="hover:underline">Attention as a Finite Resource</a></li>
          <li><a href="#meetings" className="hover:underline">Meetings vs. Deep Work</a></li>
          <li><a href="#switching" className="hover:underline">The Hidden Cost of Context Switching</a></li>
          <li><a href="#sleep-and-rest" className="hover:underline">Sleep and Rest as Buffers</a></li>
          <li><a href="#experiments" className="hover:underline">Experiments to Reduce Drain</a></li>
        </ul>
        <hr />

        <h2 id="attention" className="text-2xl font-bold text-foreground pt-8" itemProp="articleSection">
          Attention as a Finite Resource
        </h2>
        <p>
          Your prefrontal cortex can only juggle so much at once. Treating attention as a limited resource encourages intentional use rather than assuming you can “just push harder.”
        </p>

        <h2 id="meetings" className="text-2xl font-bold text-foreground pt-8" itemProp="articleSection">
          Meetings vs. Deep Work
        </h2>
        <p>
          Meetings can be valuable for alignment but fragment the day. Deep work blocks allow you to move big projects forward, but too many without rest can also drain you.
        </p>

        <h2 id="switching" className="text-2xl font-bold text-foreground pt-8" itemProp="articleSection">
          The Hidden Cost of Context Switching
        </h2>
        <p>
          Every switch between tasks or apps carries a small tax as your brain re-orients. Dozens of switches per day compound into significant fatigue and reduced quality.
        </p>

        <h2 id="sleep-and-rest" className="text-2xl font-bold text-foreground pt-8" itemProp="articleSection">
          Sleep and Rest as Buffers
        </h2>
        <p>
          Adequate sleep and micro-rest throughout the day are powerful buffers against mental drain. Without them, even moderate workloads can feel punishing.
        </p>

        <h2 id="experiments" className="text-2xl font-bold text-foreground pt-8" itemProp="articleSection">
          Experiments to Reduce Drain
        </h2>
        <p>
          Try meeting-free mornings, notification batching, or pre-planned shutdown routines and compare your drain scores week to week to see what works for you.
        </p>

        <hr />
        <h2 className="text-2xl font-bold text-foreground pt-8" itemProp="articleSection">
          Conclusion
        </h2>
        <p>
          Mental energy is a key ingredient for productivity, creativity, and wellbeing. This predictor helps you see where it is being spent—and where you can protect it better.
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
            This tool provides general wellness insights about mental energy drain based on meeting load, deep work
            hours, context switching, and sleep. This is a personal lifestyle insight, not a medical evaluation.
          </p>
          <p>It outputs a drain score, buffer capacity score, qualitative status, recommendations, an action plan, and supporting calculations.</p>
          <p>Guide content, formulas, and FAQs make the approach clear for humans and AI assistants working with the data.</p>
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
            Disclaimer: This tool provides general wellness and lifestyle insights for educational purposes only. It is
            not a medical or psychological diagnosis. For any health concerns, please consult a qualified professional.
          </p>
        </CardContent>
      </Card>
    </div>
  );
}



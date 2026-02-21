'use client';

import { useState } from 'react';
import Script from 'next/script';
import Link from 'next/link';
import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import { z } from 'zod';
import { HeartPulse, Target, Activity, Shield, BookMarked, CalendarHeart } from 'lucide-react';

import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Form, FormControl, FormField, FormItem, FormLabel, FormMessage } from '@/components/ui/form';
import { Input } from '@/components/ui/input';

const formSchema = z.object({
  weeklyHours: z.number({ invalid_type_error: 'Enter weekly work hours' }).min(10).max(90),
  stressScore: z.number({ invalid_type_error: 'Enter stress rating' }).min(1).max(10),
  sleepDebtHours: z.number({ invalid_type_error: 'Enter sleep debt hours' }).min(0).max(30),
  daysOffPlanned: z.number({ invalid_type_error: 'Enter upcoming full days off' }).min(0).max(30),
  supportScore: z.number({ invalid_type_error: 'Enter support score' }).min(1).max(10),
});

type FormValues = z.infer<typeof formSchema>;

type ResultPayload = {
  recoveryDays: number;
  burnoutLevel: 'low' | 'moderate' | 'high';
  interpretation: string;
  recommendations: string[];
  plan: { label: string; detail: string }[];
};

const steps = [
  'Estimate your average weekly work hours over the last 1–3 months.',
  'Rate your perceived work stress on a 1–10 scale.',
  'Calculate approximate sleep debt by comparing actual vs ideal sleep over the past week.',
  'Enter how many full days off (with minimal work) you have planned in the next month.',
  'Rate how supported you feel at work and outside (1–10), then review recovery time estimates.',
];

const faqs = [
  {
    question: 'What does “burnout” mean in this tool?',
    answer:
      'Here, burnout refers to sustained emotional exhaustion, cynicism, and reduced sense of effectiveness related to work demands.',
  },
  {
    question: 'Is this a diagnostic burnout scale?',
    answer:
      'No. It is a heuristic estimator that blends workload, stress, sleep, time-off, and support to suggest recovery timelines.',
  },
  {
    question: 'Why focus on days off?',
    answer:
      'Deep recovery requires actual off-duty time where you can rest and replenish, not just shorter evenings after long days.',
  },
  {
    question: 'Can this replace professional advice?',
    answer:
      'No. Use it as a planning and reflection aid. Occupational health or mental health professionals can provide personalized guidance.',
  },
  {
    question: 'What if taking time off is not possible right now?',
    answer:
      'Even micro-breaks, task renegotiation, and stronger boundaries can help while you plan for fuller recovery later.',
  },
  {
    question: 'Does exercise speed up recovery?',
    answer:
      'Gentle, enjoyable movement can help, especially when it supports sleep and mood, but overtraining can backfire if you are already exhausted.',
  },
  {
    question: 'How does support score affect results?',
    answer:
      'Higher emotional and practical support usually shortens recovery time. Lower support extends it in this model.',
  },
  {
    question: 'Can I use this with my manager or HR?',
    answer:
      'Yes. Sharing blunt workload and recovery estimates can spark more realistic planning conversations.',
  },
  {
    question: 'How often should I recalculate?',
    answer:
      'Weekly or at the end of intense project phases works well. Compare trends rather than fixating on a single number.',
  },
  {
    question: 'What if I already feel emotionally numb?',
    answer:
      'That can be a sign of advanced burnout or depression. Consider professional help and urgent workload changes.',
  },
];

const relatedCalculators = [
  {
    name: 'Stress Level Self-Assessment Tool',
    slug: 'daily-activity-points-calculator',
    description: 'Gauge your general stress load alongside recovery planning.',
  },
  {
    name: 'Work-Life Balance Time Allocation Calculator',
    slug: 'work-life-balance-time-allocation-calculator',
    description: 'Visualize how your weekly hours split across work, rest, and play.',
  },
  {
    name: 'Sleep Debt Calculator',
    slug: 'habit-streak-tracker-calculator',
    description: 'Quantify lost sleep contributing to burnout.',
  },
  {
    name: 'Emotional Wellbeing Index Wellness Tracker',
    slug: 'emotional-wellbeing-index-tracker',
    description: 'Check the wider emotional impact of your workload.',
  },
];

const baseUrl = 'https://mycalculating.com/category/health-fitness/work-burnout-recovery-time-estimator';

const schemaMarkup = {
  '@context': 'https://schema.org',
  '@graph': [
    {
      '@type': 'BreadcrumbList',
      itemListElement: [
        { '@type': 'ListItem', position: 1, name: 'Home', item: 'https://mycalculating.com' },
        { '@type': 'ListItem', position: 2, name: 'Health & Fitness', item: 'https://mycalculating.com/category/health-fitness' },
        { '@type': 'ListItem', position: 3, name: 'Work Burnout Recovery Time Wellness Estimator', item: baseUrl },
      ],
    },
    {
      '@type': 'Article',
      headline: 'Work Burnout Recovery Time Wellness Estimator',
      description:
        'Use workload, stress, sleep debt, days off, and support level as inputs to estimate a gentle, non-diagnostic recovery window from work intensity.',
      author: { '@type': 'Organization', name: 'Mycalculating.com' },
      publisher: {
        '@type': 'Organization',
        name: 'Mycalculating.com',
        logo: { '@type': 'ImageObject', url: 'https://mycalculating.com/logo.png' },
      },
      url: baseUrl,
      mainEntityOfPage: { '@type': 'WebPage', '@id': baseUrl },
      datePublished: '2024-01-01',
      dateModified: new Date().toISOString().split('T')[0],
    },
    {
      '@type': 'SoftwareApplication',
      name: 'Work Burnout Recovery Time Wellness Estimator',
      applicationCategory: 'LifestyleApplication',
      operatingSystem: 'Web Browser',
      description:
        'A planning-oriented estimator that turns your current work and rest pattern into an illustrative recovery-time window.',
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
      name: 'How to Use the Work Burnout Recovery Time Wellness Estimator',
      description: 'Step-by-step guide to logging work hours, stress, sleep debt, time off, and support for recovery planning.',
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
  const workloadFactor = (values.weeklyHours - 35) * 0.8;
  const stressFactor = values.stressScore * 2.5;
  const sleepDebtFactor = values.sleepDebtHours * 0.8;
  const timeOffBuffer = values.daysOffPlanned * 1.2;
  const supportBuffer = (values.supportScore - 5) * 1.5;

  const rawRecoveryDays = workloadFactor + stressFactor + sleepDebtFactor - timeOffBuffer - supportBuffer + 7;
  const recoveryDays = Math.max(3, Math.round(clamp(rawRecoveryDays, 3, 60)));

  let burnoutLevel: ResultPayload['burnoutLevel'] = 'low';
  let interpretation =
    'This snapshot suggests your current workload and rest pattern may be more manageable right now, based on the numbers you entered.';

  if (recoveryDays >= 14 && recoveryDays < 30) {
    burnoutLevel = 'moderate';
    interpretation =
      'These entries point to a pretty full stretch of work and not a lot of extra recovery time. Gentle boundary resets and planned breaks may help things feel more manageable for you.';
  }
  if (recoveryDays >= 30) {
    burnoutLevel = 'high';
    interpretation =
      'This pattern suggests your load has likely been very heavy for a while. It may be worth exploring ways to ease demands, add support, and create more space to rest where possible with trusted people or professionals.';
  }

  const recommendations = [
    'Consider protecting at least one small off‑duty block a week where work messages can wait, if that feels realistic.',
    'Short breaks for a drink of water, light movement, or a bit of daylight can make long stretches of focus feel gentler.',
    'You might gently sort tasks into “essential for now” and “can wait” to give yourself a clearer sense of what truly matters today.',
  ];

  if (burnoutLevel !== 'low') {
    recommendations.push('Where it feels safe, you could explore options like shifting timelines, sharing tasks, or simplifying commitments.');
  }
  if (values.sleepDebtHours > 10) {
    recommendations.push('If you notice you are often short on sleep, small tweaks to wind‑down time or bedtime might help your body and mind reset.');
  }

  const plan = [
    { label: 'Next 72 hours', detail: 'If possible, choose one small off‑duty window and one gentle check‑in about workload with someone you trust.' },
    {
      label: 'Next 2 weeks',
      detail: 'Experiment with one or two small boundary changes (like a simple stop time) and notice how they feel over a couple of weeks.',
    },
    {
      label: 'Next 1–3 months',
      detail: 'Over the next few months, you can watch how busy periods affect you and adjust your pacing and workload where you have influence.',
    },
  ];

  return { recoveryDays, burnoutLevel, interpretation, recommendations, plan };
};

export default function WorkBurnoutRecoveryTimeEstimator() {
  const [result, setResult] = useState<ResultPayload | null>(null);

  const form = useForm<FormValues>({
    resolver: zodResolver(formSchema),
    defaultValues: {
      weeklyHours: undefined,
      stressScore: undefined,
      sleepDebtHours: undefined,
      daysOffPlanned: undefined,
      supportScore: undefined,
    },
  });

  return (
    <div className="space-y-8">
      <Script id="work-burnout-recovery-schema" type="application/ld+json" strategy="afterInteractive" dangerouslySetInnerHTML={{ __html: JSON.stringify(schemaMarkup) }} />

      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <HeartPulse className="h-5 w-5" />
            Work Burnout Recovery Time Wellness Estimator
          </CardTitle>
          <CardDescription>
            Estimate a gentle recovery-time window from your current workload and rest pattern in a non-diagnostic way.
          </CardDescription>
        </CardHeader>
      </Card>

      <Card>
        <CardHeader>
          <CardTitle>Input your workload snapshot</CardTitle>
        </CardHeader>
        <CardContent>
          <Form {...form}>
            <form onSubmit={form.handleSubmit((values) => setResult(calculateResult(values)))} className="space-y-6">
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <FormField
                  control={form.control}
                  name="weeklyHours"
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel>Average weekly work hours</FormLabel>
                      <FormControl>
                        <Input
                          type="number"
                          step="1"
                          placeholder="e.g., 50"
                          value={field.value ?? ''}
                          onChange={(e) => field.onChange(e.target.value === '' ? undefined : Number(e.target.value))}
                        />
                      </FormControl>
                      <FormMessage />
                    </FormItem>
                  )}
                />
                <FormField
                  control={form.control}
                  name="stressScore"
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel>Work stress (1–10)</FormLabel>
                      <FormControl>
                        <Input
                          type="number"
                          step="1"
                          placeholder="e.g., 8"
                          value={field.value ?? ''}
                          onChange={(e) => field.onChange(e.target.value === '' ? undefined : Number(e.target.value))}
                        />
                      </FormControl>
                      <FormMessage />
                    </FormItem>
                  )}
                />
                <FormField
                  control={form.control}
                  name="sleepDebtHours"
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel>Sleep debt last 7 days (hours)</FormLabel>
                      <FormControl>
                        <Input
                          type="number"
                          step="0.5"
                          placeholder="e.g., 9"
                          value={field.value ?? ''}
                          onChange={(e) => field.onChange(e.target.value === '' ? undefined : Number(e.target.value))}
                        />
                      </FormControl>
                      <FormMessage />
                    </FormItem>
                  )}
                />
                <FormField
                  control={form.control}
                  name="daysOffPlanned"
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel>Full days off planned (next 30 days)</FormLabel>
                      <FormControl>
                        <Input
                          type="number"
                          step="1"
                          placeholder="e.g., 4"
                          value={field.value ?? ''}
                          onChange={(e) => field.onChange(e.target.value === '' ? undefined : Number(e.target.value))}
                        />
                      </FormControl>
                      <FormMessage />
                    </FormItem>
                  )}
                />
                <FormField
                  control={form.control}
                  name="supportScore"
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel>Support level (1–10)</FormLabel>
                      <FormControl>
                        <Input
                          type="number"
                          step="1"
                          placeholder="e.g., 6"
                          value={field.value ?? ''}
                          onChange={(e) => field.onChange(e.target.value === '' ? undefined : Number(e.target.value))}
                        />
                      </FormControl>
                      <FormMessage />
                    </FormItem>
                  )}
                />
              </div>
              <Button type="submit" className="w-full md:w-auto">
                Estimate recovery window
              </Button>
            </form>
          </Form>
        </CardContent>
      </Card>

      {result && (
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <BookMarked className="h-5 w-5 text-primary" />
              Interactive result & interpretation
            </CardTitle>
            <CardDescription>Translate your workload snapshot into recovery time and burnout level.</CardDescription>
          </CardHeader>
          <CardContent className="space-y-6">
            <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
              <div className="p-4 border rounded">
                <p className="text-sm text-muted-foreground">Estimated recovery time</p>
                <p className="text-2xl font-semibold text-primary">{result.recoveryDays} days</p>
                <p className="text-xs text-muted-foreground">A rough planning window based on your entries, assuming some room for rest and small changes.</p>
              </div>
              <div className="p-4 border rounded">
                <p className="text-sm text-muted-foreground">Burnout level</p>
                <p className="text-2xl font-semibold text-primary capitalize">{result.burnoutLevel}</p>
                <p className="text-xs text-muted-foreground">A simple label for how full your current season of work and recovery may feel.</p>
              </div>
              <div className="p-4 border rounded">
                <p className="text-sm text-muted-foreground">Summary</p>
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
            <strong>Recovery time</strong> ≈ clamp\((weeklyHours − 35) × 0.8 + stress × 2.5 + sleepDebt × 0.8 − daysOff × 1.2 − (support −
            5) × 1.5 + 7\) into a 3–60 day window.
          </p>
          <p>Higher workload, stress, and sleep debt extend the estimated window, while more days off and stronger support shorten it.</p>
          <p>This is an illustrative estimation framework, not a promise—use it for planning and negotiation, not as medical or psychological advice.</p>
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
                <p className="text-sm text-muted-foreground">Hours above 40</p>
                <p className="text-xl font-semibold text-primary">
                  {Math.max(0, (form.getValues().weeklyHours ?? 0) - 40)}
                </p>
                <p className="text-xs text-muted-foreground">Extra weekly load compared to a 40-hour baseline.</p>
              </div>
              <div className="p-4 border rounded">
                <p className="text-sm text-muted-foreground">Sleep debt per day</p>
                <p className="text-xl font-semibold text-primary">
                  {((form.getValues().sleepDebtHours ?? 0) / 7).toFixed(1)} h
                </p>
                <p className="text-xs text-muted-foreground">Average deficit relative to your target sleep.</p>
              </div>
              <div className="p-4 border rounded">
                <p className="text-sm text-muted-foreground">Time-off coverage</p>
                <p className="text-xl font-semibold text-primary">
                  {(form.getValues().daysOffPlanned ?? 0) >= 4 ? 'Reasonable' : 'Tight'}
                </p>
                <p className="text-xs text-muted-foreground">Compare planned days off to the suggested recovery window.</p>
              </div>
            </div>
          ) : (
            <p className="text-sm text-muted-foreground">Fill in your snapshot to see deeper burnout context metrics.</p>
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
        itemType="https://schema.org/Article"
      >
        {/* SEO & SCHEMA METADATA (HIGHLY OPTIMIZED) */}
        <meta
          itemProp="name"
          content="Work Burnout Recovery Time Wellness Estimator: Planning Space to Decompress from Intense Work"
        />
        <meta
          itemProp="description"
          content="Explore how to use workload, stress, sleep debt, days off, and support level to sketch a non-diagnostic recovery-time window and plan kinder work rhythms."
        />
        <meta
          itemProp="keywords"
          content="work burnout recovery estimator, burnout wellness tracker, recovery time after overwork, decompression planning tool, work life balance recovery, non diagnostic burnout support"
        />
        <meta itemProp="author" content="Mycalculating.com" />
        <meta itemProp="datePublished" content="2024-01-01" />
        <meta itemProp="url" content="/health-fitness/work-burnout-recovery-time-estimator" />

        <h1
          className="text-3xl md:text-4xl font-extrabold text-foreground mb-4"
          itemProp="headline"
        >
          Work Burnout Recovery Time Wellness Estimator: Making Space Visible So You Can Plan
        </h1>
        <p className="text-lg italic text-gray-700">
          This guide explains how to use a simple estimator to turn your current work, sleep, and support picture into a
          rough recovery window—so you can advocate for kinder pacing without treating the numbers as a diagnosis.
        </p>

        {/* TABLE OF CONTENTS */}
        <h2 className="text-2xl font-bold text-foreground mt-8 mb-4">Table of Contents</h2>
        <ul className="list-disc ml-6 space-y-2 text-blue-600">
          <li>
            <a href="#burnout-vs-overwork" className="hover:underline">
              Burnout, Overwork, and Why Language Matters
            </a>
          </li>
          <li>
            <a href="#inputs-explained" className="hover:underline">
              Inputs Explained: Hours, Stress, Sleep Debt, Days Off, and Support
            </a>
          </li>
          <li>
            <a href="#reading-window" className="hover:underline">
              Reading the Recovery Window Without Self-Blame
            </a>
          </li>
          <li>
            <a href="#using-estimates" className="hover:underline">
              Using Estimates in Conversations with Managers and Loved Ones
            </a>
          </li>
          <li>
            <a href="#when-to-seek-help" className="hover:underline">
              When to Seek Professional Support
            </a>
          </li>
        </ul>

        <hr />

        <h2 id="burnout-vs-overwork" className="text-2xl font-bold text-foreground pt-6" itemProp="articleSection">
          Burnout, Overwork, and Why Language Matters
        </h2>
        <p>
          People often use “burnout” to describe a range of experiences—from feeling very tired at the end of a busy
          sprint to deep, long-lasting exhaustion and detachment. This estimator does not try to label where you fall on
          that spectrum. Instead, it focuses on workload and recovery space as levers you may be able to influence.
        </p>
        <p>
          Choosing language that feels accurate and kind to you is more important than matching any particular
          definition here. The tool’s role is to support reflection and planning, not to assign a diagnosis.
        </p>

        <h2 id="inputs-explained" className="text-2xl font-bold text-foreground pt-6" itemProp="articleSection">
          Inputs Explained: Hours, Stress, Sleep Debt, Days Off, and Support
        </h2>
        <p>
          The model combines five everyday signals: how many hours you typically work, how intense that work feels, how
          much sleep you have been missing, how many full days off you have coming up, and how supported you feel.
        </p>
        <ul className="list-disc ml-6 space-y-1">
          <li>
            <strong>Weekly hours</strong> – a rough sense of how much time work occupies.
          </li>
          <li>
            <strong>Stress rating</strong> – your own 1–10 impression of how pressured things feel.
          </li>
          <li>
            <strong>Sleep debt</strong> – the gap between how much rest you aim for and what you actually got.
          </li>
          <li>
            <strong>Days off planned</strong> – genuine off-duty days you expect in the next month.
          </li>
          <li>
            <strong>Support score</strong> – how emotionally and practically backed you feel at work and outside of it.
          </li>
        </ul>
        <p>
          None of these are moral judgments; they are simply ingredients the estimator uses to sketch how much time your
          body and mind might appreciate for deeper exhale.
        </p>

        <h2 id="reading-window" className="text-2xl font-bold text-foreground pt-6" itemProp="articleSection">
          Reading the Recovery Window Without Self-Blame
        </h2>
        <p>
          When the tool suggests a longer recovery window, it is reflecting how stretched the inputs appear—not how
          strong or resilient you are as a person. In many cases, systems, expectations, and constraints shape those
          inputs just as much as personal choices do.
        </p>
        <p>
          You can use the results to ask: “Given this estimate, what is realistically possible in the next few weeks?
          Are there tiny changes that could move things in a kinder direction?”
        </p>

        <h2 id="using-estimates" className="text-2xl font-bold text-foreground pt-6" itemProp="articleSection">
          Using Estimates in Conversations with Managers and Loved Ones
        </h2>
        <p>
          A concrete recovery-time estimate can sometimes make invisible strain easier to discuss. You might share a
          summary—without details you prefer to keep private—as part of conversations about timelines, staffing, or
          boundaries with managers and colleagues.
        </p>
        <p>
          With loved ones, the same numbers can help you communicate why you feel the way you do and what kind of rest
          or support might feel most nourishing right now.
        </p>

        <h2 id="when-to-seek-help" className="text-2xl font-bold text-foreground pt-6" itemProp="articleSection">
          When to Seek Professional Support
        </h2>
        <p>
          If you notice persistent exhaustion, feelings of hopelessness, or thoughts of self-harm, this tool is not the
          right resource on its own. Those experiences deserve care from qualified professionals and, if needed, urgent
          support services in your area.
        </p>
        <p>
          You are welcome to bring a screenshot or notes from the estimator into those spaces as one piece of context,
          but your wellbeing is always more important than any number here.
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
            This wellness estimator turns your current work hours, stress, sleep, time off, and support into a simple
            view of how much recovery space you might appreciate.
          </p>
          <p>
            The estimates are starting points for pacing and negotiation—not fixed predictions—so you can combine them
            with your own judgment, context, and professional advice where needed.
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
            Disclaimer: This tool provides general wellness and lifestyle insights for educational purposes only. It is
            not a medical, psychological, or occupational health diagnosis. For personalized guidance or if you are in
            crisis, please contact a qualified professional or local support service.
          </p>
        </CardContent>
      </Card>
    </div>
  );
}



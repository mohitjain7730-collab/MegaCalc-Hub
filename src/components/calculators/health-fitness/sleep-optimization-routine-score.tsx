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
  bedtimeConsistency: z.number({ invalid_type_error: 'Enter consistency score' }).min(0).max(10),
  wakeTimeConsistency: z.number({ invalid_type_error: 'Enter wake-time score' }).min(0).max(10),
  sleepEnvironmentScore: z.number({ invalid_type_error: 'Enter environment score' }).min(0).max(10),
  preSleepWindDownScore: z.number({ invalid_type_error: 'Enter wind-down score' }).min(0).max(10),
});

type FormValues = z.infer<typeof formSchema>;

type ResultPayload = {
  bedtimeConsistency: number;
  wakeTimeConsistency: number;
  sleepEnvironmentScore: number;
  preSleepWindDownScore: number;
  routineScore: number;
  circadianSupportScore: number;
  status: 'optimal' | 'good' | 'moderate' | 'low';
  interpretation: string;
  recommendations: string[];
  plan: { label: string; detail: string }[];
};

const steps = [
  'Rate how consistent your bedtime is on a 0–10 scale (0 = random, 10 = almost exactly the same time every day).',
  'Rate how consistent your wake time is on a 0–10 scale.',
  'Rate your sleep environment (dark, cool, quiet, comfortable) on a 0–10 scale.',
  'Rate your pre-sleep wind-down routine (screens, stimulants, relaxation) on a 0–10 scale.',
  'Review your sleep optimization routine score, circadian support score, and personalized recommendations.',
];

const faqs = [
  {
    question: 'What does the Sleep Optimization Routine Score measure?',
    answer:
      'It summarizes how well your habits, environment, and timing support healthy sleep, not how many hours you sleep or whether you have a formal sleep disorder.',
  },
  {
    question: 'Can this calculator diagnose insomnia or sleep apnea?',
    answer:
      'No. Diagnosing sleep disorders requires clinical evaluation and sometimes sleep studies. This tool is for education and habit reflection only.',
  },
  {
    question: 'Why is consistency so important for sleep?',
    answer:
      'Your internal clock (circadian rhythm) thrives on regularity. Consistent bed and wake times help your brain anticipate sleep, stabilize hormones, and improve sleep depth over time.',
  },
  {
    question: 'How does screen use affect my score?',
    answer:
      'Late screens, bright light, and stimulating content can delay melatonin release and increase arousal. A strong wind-down score usually involves reducing screens and bright light before bed.',
  },
  {
    question: 'Should I change my routine based only on this score?',
    answer:
      'Use the score as a starting point. Simple adjustments—like more consistent timing or a darker room—are generally low-risk, but medical concerns (snoring, gasping, insomnia, restless legs) should be addressed with a clinician.',
  },
  {
    question: 'How quickly can I expect improvement after changing my routine?',
    answer:
      'Many people notice changes within 1–2 weeks, but more durable improvements often require several weeks or months of consistent routines.',
  },
  {
    question: 'What if my routine score is high but I still feel tired?',
    answer:
      'High scores with persistent fatigue may point toward underlying medical issues, mood disorders, medication effects, or sleep disorders that need professional evaluation.',
  },
  {
    question: 'Does caffeine timing really matter for sleep quality?',
    answer:
      'Yes. Caffeine has a half-life of several hours and can reduce deep sleep in sensitive individuals even when consumed in the afternoon.',
  },
  {
    question: 'How often should I recalculate my sleep routine score?',
    answer:
      'Many people check weekly while changing habits, then monthly once routines stabilize as part of a broader health dashboard.',
  },
];

const relatedCalculators = [
  {
    name: 'Sleep Consistency Score Calculator',
    slug: 'sleep-consistency-score-calculator',
    description: 'Quantify how stable your sleep and wake times are across the week.',
  },
  {
    name: 'Daily Energy & Mood Synchronization Tracker',
    slug: 'daily-energy-mood-synchronization-tracker',
    description: 'See how sleep and daytime energy patterns interact.',
  },
  {
    name: 'Circadian Rhythm Alignment Score',
    slug: 'circadian-rhythm-alignment-score',
    description: 'Assess how your schedule aligns with your biological clock.',
  },
  {
    name: 'HRV Resilience Index',
    slug: 'hrv-resilience-index',
    description: 'Track how recovery and autonomic balance respond to better sleep routines.',
  },
];

const baseUrl = 'https://mycalculating.com/category/health-fitness/sleep-optimization-routine-score';

const schemaMarkup = {
  '@context': 'https://schema.org',
  '@graph': [
    {
      '@type': 'BreadcrumbList',
      itemListElement: [
        { '@type': 'ListItem', position: 1, name: 'Home', item: 'https://mycalculating.com' },
        { '@type': 'ListItem', position: 2, name: 'Health & Fitness', item: 'https://mycalculating.com/category/health-fitness' },
        { '@type': 'ListItem', position: 3, name: 'Sleep Optimization Routine Score', item: baseUrl },
      ],
    },
    {
      '@type': 'SoftwareApplication',
      name: 'Sleep Optimization Routine Score',
      applicationCategory: 'Calculator',
      operatingSystem: 'Web Browser',
      description:
        'Estimate how well your sleep timing, environment, and wind-down habits support restorative sleep and circadian alignment.',
      url: baseUrl,
      offers: { '@type': 'Offer', price: '0', priceCurrency: 'USD' },
    },
  ],
};

const clamp = (value: number, min: number, max: number) => Math.min(max, Math.max(min, value));

const calculateResult = (values: FormValues): ResultPayload => {
  const { bedtimeConsistency, wakeTimeConsistency, sleepEnvironmentScore, preSleepWindDownScore } = values;

  const routineScoreRaw =
    (bedtimeConsistency * 0.3 + wakeTimeConsistency * 0.3 + sleepEnvironmentScore * 0.2 + preSleepWindDownScore * 0.2) *
    10;
  const routineScore = clamp(routineScoreRaw, 0, 100);

  const circadianSupportScoreRaw = ((bedtimeConsistency + wakeTimeConsistency) / 20) * 100;
  const circadianSupportScore = clamp(circadianSupportScoreRaw, 0, 100);

  let status: ResultPayload['status'] = 'moderate';
  let interpretation =
    'Your sleep routine has some supportive elements but also clear areas for optimization in timing, environment, or wind-down practices.';

  if (routineScore >= 80 && circadianSupportScore >= 75) {
    status = 'optimal';
    interpretation =
      'Your routine appears highly supportive of restorative sleep and circadian stability for many people. Continue protecting these habits.';
  } else if (routineScore >= 60) {
    status = 'good';
    interpretation =
      'Your routine is generally helpful. Small refinements in consistency or environment could further improve sleep quality.';
  } else if (routineScore < 40 || circadianSupportScore < 40) {
    status = 'low';
    interpretation =
      'Your current routine may be placing meaningful strain on sleep and circadian health. Consider prioritizing changes and, if needed, consulting a sleep-aware clinician.';
  }

  const recommendations: string[] = [
    'Aim for a consistent sleep window, with bedtime and wake time varying by no more than about 1 hour day-to-day.',
    'Make your bedroom darker, cooler, and quieter where possible, and reserve it primarily for sleep and intimacy.',
    'Create a 30–60 minute wind-down routine that reduces screens, bright light, heavy work, and intense conversations.',
  ];

  if (preSleepWindDownScore <= 4) {
    recommendations.push(
      'Consider adding relaxing activities before bed such as reading, light stretching, breathing exercises, or a warm shower.',
    );
  }

  if (sleepEnvironmentScore <= 5) {
    recommendations.push(
      'Blackout curtains, earplugs or white noise, and a slightly cooler room temperature can substantially improve sleep depth for many people.',
    );
  }

  const plan = [
    {
      label: 'This Week',
      detail:
        'Pick one or two simple changes—such as a more consistent bedtime and dimming lights an hour before sleep—and track how you feel.',
    },
    {
      label: 'This Month',
      detail:
        'Layer in additional improvements, like adjusting room temperature or reducing late caffeine, and re-check your routine score.',
    },
    {
      label: 'Ongoing',
      detail:
        'Revisit your routine during life transitions (shift work, travel, stress spikes) and, if sleep remains poor, discuss formal evaluation with a sleep clinician.',
    },
  ];

  return {
    bedtimeConsistency,
    wakeTimeConsistency,
    sleepEnvironmentScore,
    preSleepWindDownScore,
    routineScore: Number(routineScore.toFixed(1)),
    circadianSupportScore: Number(circadianSupportScore.toFixed(1)),
    status,
    interpretation,
    recommendations,
    plan,
  };
};

export default function SleepOptimizationRoutineScore() {
  const [result, setResult] = useState<ResultPayload | null>(null);

  const form = useForm<FormValues>({
    resolver: zodResolver(formSchema),
    defaultValues: {
      bedtimeConsistency: undefined,
      wakeTimeConsistency: undefined,
      sleepEnvironmentScore: undefined,
      preSleepWindDownScore: undefined,
    },
  });

  return (
    <div className="space-y-8">
      <Script
        id="sleep-optimization-routine-schema"
        type="application/ld+json"
        strategy="afterInteractive"
        dangerouslySetInnerHTML={{ __html: JSON.stringify(schemaMarkup) }}
      />

      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <Activity className="h-5 w-5" />
            Sleep Optimization Routine Score
          </CardTitle>
          <CardDescription>
            Estimate how supportive your current sleep habits and environment are for deep, restorative rest.
          </CardDescription>
        </CardHeader>
      </Card>

      <Card>
        <CardHeader>
          <CardTitle>Input your sleep routine</CardTitle>
        </CardHeader>
        <CardContent>
          <Form {...form}>
            <form onSubmit={form.handleSubmit((values) => setResult(calculateResult(values)))} className="space-y-6">
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <FormField
                  control={form.control}
                  name="bedtimeConsistency"
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel>Bedtime consistency (0–10)</FormLabel>
                      <FormControl>
                        <Input
                          type="number"
                          step="0.5"
                          placeholder="e.g., 6.5"
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
                  name="wakeTimeConsistency"
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel>Wake-time consistency (0–10)</FormLabel>
                      <FormControl>
                        <Input
                          type="number"
                          step="0.5"
                          placeholder="e.g., 7"
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
                  name="sleepEnvironmentScore"
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel>Sleep environment (0–10)</FormLabel>
                      <FormControl>
                        <Input
                          type="number"
                          step="0.5"
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
                  name="preSleepWindDownScore"
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel>Pre-sleep wind-down (0–10)</FormLabel>
                      <FormControl>
                        <Input
                          type="number"
                          step="0.5"
                          placeholder="e.g., 5"
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
                Calculate sleep routine score
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
            <CardDescription>See routine strength, circadian support, and suggested next steps.</CardDescription>
          </CardHeader>
          <CardContent className="space-y-6">
            <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
              <div className="p-4 border rounded">
                <p className="text-sm text-muted-foreground">Routine score</p>
                <p className="text-2xl font-semibold text-primary">{result.routineScore}</p>
                <p className="text-xs text-muted-foreground">0–100 scale</p>
              </div>
              <div className="p-4 border rounded">
                <p className="text-sm text-muted-foreground">Circadian support</p>
                <p className="text-2xl font-semibold text-primary">{result.circadianSupportScore}</p>
                <p className="text-xs text-muted-foreground">Higher = more stable clock</p>
              </div>
              <div className="p-4 border rounded">
                <p className="text-sm text-muted-foreground">Environment score</p>
                <p className="text-2xl font-semibold text-primary">{result.sleepEnvironmentScore.toFixed(1)}/10</p>
                <p className="text-xs text-muted-foreground">Dark, quiet, cool, comfortable</p>
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
            <strong>Sleep optimization routine score</strong> weights timing consistency most heavily, then environment
            quality and wind-down practices, and scales the result to a 0–100 range.
          </p>
          <p>
            <strong>Circadian support score</strong> focuses specifically on how stable your bed and wake times are,
            which strongly influence circadian rhythm alignment.
          </p>
          <p>
            The goal is not clinical precision, but a transparent, interpretable index you can use to compare routines
            over time as you experiment with better habits.
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
                <p className="text-sm text-muted-foreground">Bedtime consistency</p>
                <p className="text-xl font-semibold text-primary">{result.bedtimeConsistency.toFixed(1)}/10</p>
                <p className="text-xs text-muted-foreground">Lower variability is better</p>
              </div>
              <div className="p-4 border rounded">
                <p className="text-sm text-muted-foreground">Wake-time consistency</p>
                <p className="text-xl font-semibold text-primary">{result.wakeTimeConsistency.toFixed(1)}/10</p>
                <p className="text-xs text-muted-foreground">Supports strong circadian signal</p>
              </div>
              <div className="p-4 border rounded">
                <p className="text-sm text-muted-foreground">Wind-down quality</p>
                <p className="text-xl font-semibold text-primary">{result.preSleepWindDownScore.toFixed(1)}/10</p>
                <p className="text-xs text-muted-foreground">Screens, stimulants, and calm-down rituals</p>
              </div>
            </div>
          ) : (
            <p className="text-sm text-muted-foreground">
              Enter your routine details to see additional breakdowns and trends.
            </p>
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

      <section
        className="space-y-6 text-muted-foreground leading-relaxed bg-white p-6 md:p-10 rounded-lg shadow-lg"
        itemScope
        itemType="https://schema.org/MedicalWebPage"
      >
        <meta
          itemProp="name"
          content="Sleep Optimization Routine Score: Building a More Restorative Night from the Ground Up"
        />
        <meta
          itemProp="description"
          content="Learn how timing, environment, and pre-sleep habits combine to shape sleep quality, and how to use this routine score with evidence-informed strategies for better rest."
        />
        <meta
          itemProp="keywords"
          content="sleep optimization routine score, sleep hygiene calculator, circadian rhythm, bedtime consistency, sleep environment"
        />
        <meta itemProp="author" content="[Your Site's Health Team]" />
        <meta itemProp="datePublished" content="2025-12-01" />
        <meta itemProp="url" content="/sleep-optimization-routine-score-guide" />

        <h1 className="text-3xl md:text-4xl font-extrabold text-foreground mb-4" itemProp="headline">
          Sleep Optimization Routine Score: A Practical Guide to Stronger Nights and Better Days
        </h1>
        <p className="text-lg italic text-gray-700">
          This guide explains the core levers behind consistent, restorative sleep and shows how to interpret your sleep
          optimization routine score in the context of real-life constraints.
        </p>

        <h2 className="text-2xl font-bold text-foreground mt-8 mb-4">Table of Contents</h2>
        <ul className="list-disc ml-6 space-y-2 text-blue-600">
          <li>
            <a href="#why-sleep-routines" className="hover:underline">
              1. Why Sleep Routines Matter More Than Occasional “Perfect” Nights
            </a>
          </li>
          <li>
            <a href="#timing" className="hover:underline">
              2. The Role of Timing: Bedtime, Wake Time, and Circadian Rhythm
            </a>
          </li>
          <li>
            <a href="#environment" className="hover:underline">
              3. Building a Sleep-Conducive Environment
            </a>
          </li>
          <li>
            <a href="#wind-down" className="hover:underline">
              4. Designing a Wind-Down Routine that Actually Sticks
            </a>
          </li>
          <li>
            <a href="#when-to-seek-help" className="hover:underline">
              5. When to Transition from Self-Optimization to Professional Evaluation
            </a>
          </li>
        </ul>

        <hr />

        <h2 id="why-sleep-routines" className="text-2xl font-bold text-foreground pt-8" itemProp="articleSection">
          1. Why Sleep Routines Matter More Than Occasional “Perfect” Nights
        </h2>
        <p>
          Many people focus on single-night hacks—like taking a supplement or using a sleep app—while ignoring the daily
          patterns that drive long-term sleep quality. Your brain and body respond to patterns, not isolated events.
          When your routine sends consistent signals about when it is time to be alert and when it is time to wind down,
          hormones, core body temperature, and brain activity can anticipate sleep more effectively.
        </p>
        <p>
          The sleep optimization routine score captures how strong and predictable those signals are. Small, repeatable
          changes often matter more than dramatic interventions that you cannot sustain. Over weeks and months, that
          stability can translate into deeper sleep, more consolidated nights, and better daytime performance.
        </p>

        <h2 id="timing" className="text-2xl font-bold text-foreground pt-8" itemProp="articleSection">
          2. The Role of Timing: Bedtime, Wake Time, and Circadian Rhythm
        </h2>
        <p>
          Your circadian rhythm is an internal 24-hour clock that influences sleep-wake cycles, body temperature,
          hormone secretion, and digestion. Going to bed and waking up at wildly different times from day to day can
          confuse this clock. Think of it like constantly changing time zones without giving your body enough time to
          adapt—your physiology is always catching up.
        </p>
        <p>
          In practice, aiming for a consistent 7–9-hour window that shifts by no more than about one hour, even on
          weekends, is a powerful foundation. If your life circumstances make this difficult (shift work, caregiving,
          travel), focusing on the most regular schedule you can manage still helps stabilize your system.
        </p>

        <h2 id="environment" className="text-2xl font-bold text-foreground pt-8" itemProp="articleSection">
          3. Building a Sleep-Conducive Environment
        </h2>
        <p>
          A sleep-friendly environment signals to your nervous system that it is safe to disengage. Research and
          clinical experience consistently highlight three elements: darkness, cool temperature, and quiet or consistent
          background sound. Even small tweaks—like blackout curtains, a fan, or a white-noise app—can have an outsized
          impact for light or noise-sensitive sleepers.
        </p>
        <p>
          Your bed and pillow also matter, particularly for pain or reflux. If you wake with stiffness, numbness, or
          heartburn, addressing ergonomics and medical contributors can improve comfort and reduce awakenings. The
          calculator’s environment score prompts you to review these often-overlooked details systematically.
        </p>

        <h2 id="wind-down" className="text-2xl font-bold text-foreground pt-8" itemProp="articleSection">
          4. Designing a Wind-Down Routine that Actually Sticks
        </h2>
        <p>
          A wind-down routine transitions you from daytime problem-solving into a more relaxed, parasympathetic state.
          That transition rarely happens if you are checking email, arguing online, or consuming intense entertainment
          right up to lights-out. Instead, think of the last 30–60 minutes as a deliberate decompression zone.
        </p>
        <p>
          Effective routines do not have to be elaborate. They might include dimming lights, reading physical books,
          light stretching, breathing exercises, or a warm shower. The key is consistency: your brain begins to
          associate these cues with sleep onset, making it easier to fall and stay asleep over time.
        </p>

        <h2 id="when-to-seek-help" className="text-2xl font-bold text-foreground pt-8" itemProp="articleSection">
          5. When to Transition from Self-Optimization to Professional Evaluation
        </h2>
        <p>
          Self-guided optimization is valuable, but it has limits. If you have persistent insomnia, loud snoring,
          gasping, choking, restless legs, parasomnias (like sleepwalking), or daytime sleep attacks, you should discuss
          these with a healthcare professional regardless of your routine score. These features can signal conditions
          like sleep apnea, restless legs syndrome, or narcolepsy that require targeted evaluation and treatment.
        </p>
        <p>
          Bringing your scores and notes to a visit can still be useful. They show your clinician what you have already
          tried, how stable your schedule is, and how symptoms have evolved. This context can accelerate the path to
          appropriate testing and support.
        </p>

        <hr />
        <h2 className="text-2xl font-bold text-foreground pt-8" itemProp="articleSection">
          Conclusion
        </h2>
        <p>
          Your sleep optimization routine score is a snapshot of how well your habits and environment support the kind
          of sleep your body is built to expect. Use it to guide small, sustainable changes and to know when it is time
          to seek additional help. Over time, the combination of consistent routines and professional guidance can turn
          nights from a struggle into a reliable foundation for health.
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
            This calculator converts simple 0–10 ratings into a sleep optimization routine score and circadian support
            index.
          </p>
          <p>
            It highlights strengths and gaps in your timing, environment, and wind-down habits so you can upgrade your
            nights with evidence-aligned changes.
          </p>
          <p>
            Interpret results as educational guidance, and work with qualified clinicians for persistent or complex
            sleep concerns.
          </p>
        </CardContent>
      </Card>
    </div>
  );
}



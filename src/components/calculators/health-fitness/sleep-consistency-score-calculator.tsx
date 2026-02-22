'use client';

import { useState } from 'react';
import Script from 'next/script';
import Link from 'next/link';
import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import { z } from 'zod';
import { Activity, Zap, Target, AlertTriangle, Shield, MoonStar } from 'lucide-react';

import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Form, FormControl, FormField, FormItem, FormLabel, FormMessage } from '@/components/ui/form';
import { Input } from '@/components/ui/input';

const formSchema = z.object({
  bedtimeVariability: z
    .number({ invalid_type_error: 'Enter bedtime variability' })
    .min(0)
    .max(240),
  wakeTimeVariability: z
    .number({ invalid_type_error: 'Enter wake time variability' })
    .min(0)
    .max(240),
  sleepDurationVariability: z
    .number({ invalid_type_error: 'Enter sleep duration variability' })
    .min(0)
    .max(180),
  consistentNightsPerWeek: z
    .number({ invalid_type_error: 'Enter number of consistent nights' })
    .min(0)
    .max(7),
});

type FormValues = z.infer<typeof formSchema>;

type ResultPayload = {
  bedtimeVariability: number;
  wakeTimeVariability: number;
  sleepDurationVariability: number;
  consistentNightsPerWeek: number;
  consistencyScore: number;
  status: 'optimal' | 'good' | 'moderate' | 'low';
  interpretation: string;
  recommendations: string[];
  plan: { label: string; detail: string }[];
};

const steps = [
  'Enter your average bedtime variability in minutes (difference between the earliest and latest bedtime across the week).',
  'Enter your average wake time variability in minutes.',
  'Enter your average variability in total sleep duration in minutes (night-to-night swings).',
  'Enter how many nights per week you go to bed and wake up within a 30â€“45 minute window.',
  'Review your sleep consistency score, status, and personalized recommendations.',
];

const faqs = [
  {
    question: 'What is sleep consistency?',
    answer:
      'Sleep consistency describes how regular your sleep and wake times are from day to day. High consistency means you go to bed and wake up at roughly the same time every day, which stabilizes your circadian rhythm and improves sleep quality.',
  },
  {
    question: 'Why does bedtime and wake time variability matter?',
    answer:
      'Large swings in bedtime or wake time confuse your internal clock, making it harder to fall asleep, stay asleep, and feel refreshed. Keeping these variations small (ideally under 60 minutes) supports deeper, more restorative sleep.',
  },
  {
    question: 'How many consistent nights per week should I aim for?',
    answer:
      'Most sleep experts recommend aiming for at least 5â€“6 highly consistent nights per week, including weekends. The more regularly you keep your schedule, the easier it becomes for your body to anticipate sleep and wake times.',
  },
  {
    question: 'Does sleep duration consistency matter as much as total hours?',
    answer:
      'Both matter. Getting enough total sleep is essential, but large nightâ€‘toâ€‘night swings in sleep duration (for example, 5 hours one night and 9 hours the next) can still leave you feeling jetâ€‘lagged. Stable, sufficient sleep is ideal.',
  },
  {
    question: 'Can I catch up on sleep on weekends?',
    answer:
      'Weekend â€œcatchâ€‘upâ€ sleep can help if you are temporarily sleep deprived, but chronic weekday restriction followed by weekend oversleeping often worsens social jet lag. A consistent schedule with adequate nightly sleep is more effective long term.',
  },
  {
    question: 'How quickly can I improve my sleep consistency score?',
    answer:
      'You can improve your score within 1â€“2 weeks by choosing a target bedtime and wake time and sticking to them most days. Small, sustainable adjustmentsâ€”15â€“30 minutes at a timeâ€”are easier to maintain than abrupt changes.',
  },
  {
    question: 'What if my work schedule is irregular or I work shifts?',
    answer:
      'If you work rotating or night shifts, perfect consistency may not be realistic. Focus on keeping your schedule as regular as possible within each shift pattern, protecting a fixed sleep window, and using light exposure strategically.',
  },
  {
    question: 'Should I talk to a professional about my sleep?',
    answer:
      'Yes, if you regularly struggle to fall asleep, stay asleep, or feel rested despite consistent scheduling, or if you snore loudly or have witnessed breathing pauses. A healthcare provider or sleep specialist can evaluate for sleep disorders.',
  },
];

const relatedCalculators = [
  {
    name: 'Sleep Quality vs Longevity Correlation Calculator',
    slug: 'sleep-quality-vs-longevity-correlation-calculator',
    description: 'See how sleep duration, quality, and consistency relate to healthy aging.',
  },
  {
    name: 'Sleep Quality vs Screen Exposure Analyzer',
    slug: 'sleep-quality-vs-screen-exposure-analyzer',
    description: 'See how evening screen use may be affecting your sleep.',
  },
  {
    name: 'Daily Screen Time Impact Calculator',
    slug: 'daily-screen-time-impact-calculator',
    description: 'Assess how overall screen time interacts with your recovery and sleep.',
  },
  {
    name: 'Caffeine Cutoff Sleep Impact Calculator',
    slug: 'caffeine-cutoff-sleep-impact-calculator',
    description: 'Identify how lateâ€‘day caffeine might be disrupting your sleep timing.',
  },
];

const baseUrl = 'https://mycalculating.com/health-fitness/sleep-consistency-score-calculator';

const schemaMarkup = {
  '@context': 'https://schema.org',
  '@graph': [
    {
      '@type': 'BreadcrumbList',
      itemListElement: [
        { '@type': 'ListItem', position: 1, name: 'Home', item: 'https://mycalculating.com' },
        { '@type': 'ListItem', position: 2, name: 'Health & Fitness', item: 'https://mycalculating.com/health-fitness' },
        { '@type': 'ListItem', position: 3, name: 'Sleep Consistency Wellness Score Calculator', item: baseUrl },
      ],
    },
    {
      '@type': 'SoftwareApplication',
      name: 'Sleep Consistency Wellness Score Calculator',
      applicationCategory: 'Calculator',
      operatingSystem: 'Web Browser',
      description: 'Score the regularity of your sleep and wake schedule based on timing and duration variability.',
      url: baseUrl,
      offers: { '@type': 'Offer', price: '0', priceCurrency: 'USD' },
    },
  ],
};

const clamp = (value: number, min: number, max: number) => Math.min(max, Math.max(min, value));

const calculateResult = (values: FormValues): ResultPayload => {
  const { bedtimeVariability, wakeTimeVariability, sleepDurationVariability, consistentNightsPerWeek } = values;

  // Normalize each variability metric to a 0â€“100 penalty (higher variability = bigger penalty)
  const bedtimePenalty = clamp((bedtimeVariability / 120) * 30, 0, 30); // 0â€“2 hours â†’ up to 30 points
  const wakePenalty = clamp((wakeTimeVariability / 120) * 30, 0, 30);
  const durationPenalty = clamp((sleepDurationVariability / 90) * 20, 0, 20); // 0â€“1.5 hours â†’ up to 20
  const consistencyBonus = clamp((consistentNightsPerWeek / 7) * 30, 0, 30); // more nights = bonus

  let rawScore = 100 - bedtimePenalty - wakePenalty - durationPenalty + (consistencyBonus - 15);
  rawScore = clamp(rawScore, 0, 100);

  let status: ResultPayload['status'] = 'optimal';
  let interpretation =
    'This suggests a general lifestyle tendency where your sleep schedule may be highly consistent. This level of regularity may strongly support deep, restorative sleep and stable energy.';

  if (rawScore < 40) {
    status = 'low';
    interpretation =
      'This suggests a general lifestyle tendency where your sleep schedule may appear quite irregular. Large swings in timing and duration may impair recovery, mood, and focus. You may consider gradual changes toward a stable schedule, which may significantly improve how you feel. This is a personal insight, not a medical evaluation.';
  } else if (rawScore < 60) {
    status = 'moderate';
    interpretation =
      'This suggests a general lifestyle tendency where your sleep consistency may be mixed. Some nights may be regular, but there may be enough variations to impact how rested you feel. You may consider tightening your sleep window on most days, which may help.';
  } else if (rawScore < 80) {
    status = 'good';
    interpretation =
      'This suggests a general lifestyle tendency where your sleep may be fairly consistent, with room for refinement. You may consider small improvements in bedtime and wake time regularity, which may push you into an optimal range.';
  }

  const recommendations: string[] = [
    'Choose a target bedtime and wake time that you can keep within a 30â€“45 minute window most days of the week.',
    'Limit large weekend schedule shifts (â€œsocial jet lagâ€) by staying within 1 hour of your usual sleep and wake times.',
    'Create a windâ€‘down routine (dim lights, reduce screens, relaxing activity) in the 30â€“60 minutes before bed.',
  ];

  if (consistentNightsPerWeek < 5) {
    recommendations.push(
      'Aim for at least 5 consistent nights per week. Start by picking two or three anchor days (for example, Sunday to Tuesday) and build from there.'
    );
  }

  if (bedtimeVariability > 90 || wakeTimeVariability > 90) {
    recommendations.push(
      'Reduce large swings in bedtime and wake time by adjusting in 15â€“30 minute steps each few nights instead of making sudden, big changes.'
    );
  }

  if (sleepDurationVariability > 60) {
    recommendations.push(
      'Try to keep your total sleep duration within about 45â€“60 minutes of your nightly target by avoiding very short or very long nights when possible.'
    );
  }

  const plan = [
    {
      label: 'This Week',
      detail:
        'Track your actual bed and wake times for 7 days. Choose a realistic target schedule and focus on keeping at least 4â€“5 nights within a 45 minute window.',
    },
    {
      label: 'This Month',
      detail:
        'Gradually tighten the window for both bedtime and wake time, aiming for at least 5â€“6 consistent nights per week. Adjust evening routines so that sleep timing feels natural, not forced.',
    },
    {
      label: 'Ongoing',
      detail:
        'Protect your sleep schedule like an important appointment. Plan late events and early mornings strategically, and return to your baseline schedule as soon as possible after disruptions.',
    },
  ];

  return {
    bedtimeVariability,
    wakeTimeVariability,
    sleepDurationVariability,
    consistentNightsPerWeek,
    consistencyScore: rawScore,
    status,
    interpretation,
    recommendations,
    plan,
  };
};

export default function SleepConsistencyScoreCalculator() {
  const [result, setResult] = useState<ResultPayload | null>(null);

  const form = useForm<FormValues>({
    resolver: zodResolver(formSchema),
    defaultValues: {
      bedtimeVariability: undefined,
      wakeTimeVariability: undefined,
      sleepDurationVariability: undefined,
      consistentNightsPerWeek: undefined,
    },
  });

  return (
    <div className="space-y-8">
      <Script
        id="sleep-consistency-score-schema"
        type="application/ld+json"
        strategy="afterInteractive"
        dangerouslySetInnerHTML={{ __html: JSON.stringify(schemaMarkup) }}
      />

      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <MoonStar className="h-5 w-5" />
            Sleep Consistency Wellness Score Calculator
          </CardTitle>
          <CardDescription>
            Get general wellness insights about sleep schedule regularity based on timing and duration variability across the week. This is a personal lifestyle insight, not a medical evaluation.
          </CardDescription>
        </CardHeader>
      </Card>

      <Card>
        <CardHeader>
          <CardTitle>Input your sleep schedule patterns</CardTitle>
        </CardHeader>
        <CardContent>
          <Form {...form}>
            <form onSubmit={form.handleSubmit((values) => setResult(calculateResult(values)))} className="space-y-6">
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <FormField
                  control={form.control}
                  name="bedtimeVariability"
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel>Bedtime variability (minutes)</FormLabel>
                      <FormControl>
                        <Input
                          type="number"
                          step="5"
                          placeholder="e.g., 45"
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
                  name="wakeTimeVariability"
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel>Wake time variability (minutes)</FormLabel>
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
                  name="sleepDurationVariability"
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel>Sleep duration variability (minutes)</FormLabel>
                      <FormControl>
                        <Input
                          type="number"
                          step="5"
                          placeholder="e.g., 30"
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
                  name="consistentNightsPerWeek"
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel>Consistent nights per week (0â€“7)</FormLabel>
                      <FormControl>
                        <Input
                          type="number"
                          step="1"
                          placeholder="e.g., 5"
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
                Calculate sleep consistency score
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
            <CardDescription>See your consistency score, status, and key interpretation.</CardDescription>
          </CardHeader>
          <CardContent className="space-y-6">
            <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
              <div className="p-4 border rounded">
                <p className="text-sm text-muted-foreground">Consistency score</p>
                <p className="text-2xl font-semibold text-primary">{result.consistencyScore.toFixed(1)}</p>
                <p className="text-xs text-muted-foreground">Out of 100</p>
              </div>
              <div className="p-4 border rounded">
                <p className="text-sm text-muted-foreground">Bedtime variability</p>
                <p className="text-2xl font-semibold text-primary">{result.bedtimeVariability.toFixed(0)} min</p>
                <p className="text-xs text-muted-foreground">Typical range</p>
              </div>
              <div className="p-4 border rounded">
                <p className="text-sm text-muted-foreground">Wake time variability</p>
                <p className="text-2xl font-semibold text-primary">{result.wakeTimeVariability.toFixed(0)} min</p>
                <p className="text-xs text-muted-foreground">Typical range</p>
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
            <strong>Sleep consistency score</strong> is derived from timing and duration variability plus a bonus for regular
            nights. Higher variability reduces the score, while more consistent nights increase it.
          </p>
          <p>
            Bedtime and wake time variability contribute the largest penalties because irregular timing has the strongest
            impact on your circadian rhythm. Sleep duration variability adds an additional penalty when nightâ€‘toâ€‘night swings
            are large.
          </p>
          <p>
            The final score is normalized to a 0â€“100 scale where higher scores indicate a more stable and predictable sleep
            pattern that supports energy, mood, and recovery.
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
                <p className="text-sm text-muted-foreground">Highly consistent nights</p>
                <p className="text-xl font-semibold text-primary">{result.consistentNightsPerWeek.toFixed(0)} nights</p>
                <p className="text-xs text-muted-foreground">Per week</p>
              </div>
              <div className="p-4 border rounded">
                <p className="text-sm text-muted-foreground">Average timing variability</p>
                <p className="text-xl font-semibold text-primary">
                  {Math.round((result.bedtimeVariability + result.wakeTimeVariability) / 2)} min
                </p>
                <p className="text-xs text-muted-foreground">Bed &amp; wake combined</p>
              </div>
              <div className="p-4 border rounded">
                <p className="text-sm text-muted-foreground">Consistency level</p>
                <p className="text-xl font-semibold text-primary">
                  {result.consistencyScore >= 80
                    ? 'Very High'
                    : result.consistencyScore >= 60
                    ? 'High'
                    : result.consistencyScore >= 40
                    ? 'Moderate'
                    : 'Low'}
                </p>
                <p className="text-xs text-muted-foreground">Based on score</p>
              </div>
            </div>
          ) : (
            <p className="text-sm text-muted-foreground">
              Enter your sleep timing data to see additional insights about your schedule stability.
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
                <Link
                  href={`/${calc.slug}`}
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
        {/* SEO & SCHEMA METADATA */}
        <meta
          itemProp="name"
          content="Sleep Consistency Score: How Regular Sleep Schedules Improve Energy, Mood, and Health"
        />
        <meta
          itemProp="description"
          content="A practical, evidenceâ€‘informed guide to understanding sleep consistency, circadian rhythm stability, and how regular bed and wake times improve energy, mood, and longâ€‘term health."
        />
        <meta
          itemProp="keywords"
          content="sleep consistency score, regular sleep schedule, circadian rhythm, sleep timing, social jet lag, sleep hygiene"
        />
        <meta itemProp="author" content="[Your Site's Sleep & Recovery Team]" />
        <meta itemProp="datePublished" content="2025-12-01" />
        <meta itemProp="url" content="/sleep-consistency-score-guide" />

        <h1
          className="text-3xl md:text-4xl font-extrabold text-foreground mb-4"
          itemProp="headline"
        >
          Sleep Consistency Score: Why Regular Bedtimes Supercharge Your Recovery and Daytime Performance
        </h1>
        <p className="text-lg italic text-gray-700">
          Learn how consistent sleep and wake times stabilize your circadian rhythm, deepen your sleep, and improve energy,
          focus, and longâ€‘term healthâ€”and how to gradually fix a chaotic schedule.
        </p>

        <h2 className="text-2xl font-bold text-foreground mt-8 mb-4">
          Table of Contents: Jump to a Section
        </h2>
        <ul className="list-disc ml-6 space-y-2 text-blue-600">
          <li>
            <a href="#what-is-consistency" className="hover:underline">
              What Sleep Consistency Really Means
            </a>
          </li>
          <li>
            <a href="#circadian-rhythm" className="hover:underline">
              Circadian Rhythm and Social Jet Lag
            </a>
          </li>
          <li>
            <a href="#why-it-matters" className="hover:underline">
              Why Consistent Sleep Schedules Matter for Health
            </a>
          </li>
          <li>
            <a href="#improvement-strategies" className="hover:underline">
              Strategies to Improve Your Sleep Consistency Score
            </a>
          </li>
          <li>
            <a href="#when-to-seek-help" className="hover:underline">
              When to Seek Professional Support
            </a>
          </li>
        </ul>

        <hr />

        <h2
          id="what-is-consistency"
          className="text-2xl font-bold text-foreground pt-8"
          itemProp="articleSection"
        >
          What Sleep Consistency Really Means
        </h2>
        <p>
          Sleep consistency is more than hitting a certain number of hours; it is about giving your brain predictable
          timing cues every day. When bedtime and wake time shift dramatically from one day to the next, your internal
          clocks receive conflicting signals about when to promote alertness and when to promote sleep.
        </p>
        <p>
          In practice, a â€œconsistentâ€ schedule typically means keeping bedtime and wake time within about 30â€“60 minutes of
          your target on most days. Occasional disruptions are normal, but chronic irregularity accumulates like a form of
          internal jet lag, even if you never change time zones.
        </p>

        <h2
          id="circadian-rhythm"
          className="text-2xl font-bold text-foreground pt-8"
          itemProp="articleSection"
        >
          Circadian Rhythm, Social Jet Lag, and Your Energy
        </h2>
        <p>
          Your circadian rhythm is a roughly 24â€‘hour cycle that coordinates sleep, hormone release, body temperature, and
          digestion. Light exposure, meal timing, physical activity, and social cues all act as â€œzeitgebersâ€â€”time givers
          that keep your clock aligned with the environment.
        </p>
        <p>
          When you wake up early for work all week but stay up late and sleep in on weekends, you create what researchers
          call <strong>social jet lag</strong>. The mismatch between your workday schedule and your freeâ€‘day schedule can
          leave you feeling like you fly across time zones every week, even if you stay home.
        </p>

        <h2
          id="why-it-matters"
          className="text-2xl font-bold text-foreground pt-8"
          itemProp="articleSection"
        >
          Why Consistent Sleep Schedules Matter for Health
        </h2>
        <p>
          Studies link irregular sleep timing to higher rates of cardiometabolic disease, mood disorders, and impaired
          cognitive performanceâ€”independent of total sleep duration. Even when people get enough hours, inconsistent timing
          leads to lower sleep efficiency and more fragmented sleep.
        </p>
        <ul className="list-disc ml-6 space-y-1">
          <li>More consistent schedules are associated with better insulin sensitivity and metabolic health.</li>
          <li>Regular bed and wake times predict better academic and work performance, especially in adolescents.</li>
          <li>Stable timing supports more stable mood and lower risk of depression and anxiety.</li>
        </ul>

        <h2
          id="improvement-strategies"
          className="text-2xl font-bold text-foreground pt-8"
          itemProp="articleSection"
        >
          Strategies to Improve Your Sleep Consistency Score
        </h2>
        <p>
          You do not need a perfect schedule to benefit. Focus on sustainable, incremental change rather than an abrupt
          overhaul. Pick a wake time you can realistically keep 6â€“7 days per week, then anchor your bedtime to allow for
          enough total sleep.
        </p>
        <ul className="list-disc ml-6 space-y-1">
          <li>Shift your schedule in 15â€“30 minute steps every few nights instead of several hours at once.</li>
          <li>Use morning light exposure and movement to strengthen your wakeâ€‘up signal.</li>
          <li>Wind down with dim light, lowâ€‘stimulation activities, and reduced screens in the hour before bed.</li>
          <li>Keep large weekend sleepâ€‘ins for special occasions rather than every week.</li>
        </ul>

        <h2
          id="when-to-seek-help"
          className="text-2xl font-bold text-foreground pt-8"
          itemProp="articleSection"
        >
          When to Seek Professional Support
        </h2>
        <p>
          If you have made reasonable efforts to stabilize your schedule but still feel persistently unrested, or if you
          snore loudly, gasp during sleep, or have very restless legs, it is worth speaking with a healthcare professional.
          Sleep apnea, insomnia disorder, circadian rhythm disorders, and other conditions often require targeted
          interventions beyond simple schedule changes.
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
            This tool provides general wellness insights about sleep consistency score from timing and duration variability plus the number of regular
            nights you maintain each week. This is a personal lifestyle insight, not a medical evaluation.
          </p>
          <p>
            Outputs include a 0â€“100 score, qualitative status, interpretation, recommendations, and an action plan to help
            you design a more stable sleep routine.
          </p>
          <p>
            Formula, steps, guide content, related tools, and FAQs make it easy for humans or AI assistants to interpret and
            explain the results.
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



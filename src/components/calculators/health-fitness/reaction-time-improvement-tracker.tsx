'use client';

import { useState } from 'react';
import Script from 'next/script';
import Link from 'next/link';
import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import { z } from 'zod';
import { TimerReset, Zap, Target, ActivitySquare, ShieldCheck } from 'lucide-react';

import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Form, FormControl, FormField, FormItem, FormLabel, FormMessage } from '@/components/ui/form';
import { Input } from '@/components/ui/input';

const formSchema = z.object({
  baselineMs: z.number({ invalid_type_error: 'Enter baseline reaction time' }).min(50).max(1000),
  latestMs: z.number({ invalid_type_error: 'Enter latest reaction time' }).min(50).max(1000),
  sessionsPerWeek: z.number({ invalid_type_error: 'Enter sessions per week' }).min(0).max(14),
  sleepHours: z.number({ invalid_type_error: 'Enter average sleep' }).min(4).max(10),
  caffeineCups: z.number({ invalid_type_error: 'Enter cups per day' }).min(0).max(8),
});

type FormValues = z.infer<typeof formSchema>;

type ResultPayload = {
  improvementPct: number;
  consistencyScore: number;
  status: 'on-track' | 'stalled' | 'regressing';
  interpretation: string;
  recommendations: string[];
  plan: { label: string; detail: string }[];
};

const steps = [
  'Record baseline reaction time from a consistent test (same device, lighting, and time of day).',
  'Log your latest average after training or focus cycles.',
  'Count focused reaction-drill sessions you perform each week.',
  'Track average nightly sleep and caffeinated drinks to gauge recovery.',
  'Review the output and adjust drills, recovery, or habits for the next block.',
];

const faqs = [
  { question: 'What counts as a reaction drill?', answer: 'Aim trainers, ball-drop catches, sprint starts, racquet feeds, or light/sound response apps.' },
  { question: 'How often should I retest?', answer: 'Weekly or biweekly provides clean trend data without day-to-day noise.' },
  { question: 'Do I need special hardware?', answer: 'Noâ€”consistency matters more than equipment. Just log which tool you used.' },
  { question: 'How much improvement is realistic?', answer: '5â€“10% faster in 4â€“6 weeks is excellent for most people.' },
  { question: 'Why include sleep and caffeine?', answer: 'Reaction speed is tightly tied to recovery quality and stimulant timing.' },
  { question: 'Can I use this for esports training?', answer: 'Absolutely. Track aim-trainer scores or custom reaction tests the same way athletes track sprints.' },
  { question: 'Should I test dominant and non-dominant sides?', answer: 'If your sport uses both, track the slower side to keep training priorities clear.' },
  { question: 'What if I regress?', answer: 'Take a deload, improve sleep, or switch drill stimuli; the tool will highlight when adjustments are needed.' },
  { question: 'Does hydration matter?', answer: 'Yes. Pair this with a hydration calculator to keep cognitive speed sharp.' },
  { question: 'Can mindfulness help?', answer: 'Definitelyâ€”calmer nervous systems react faster. See the meditation streak tracker for ideas.' },
];

const relatedCalculators = [
  { name: 'Cognitive Focus Efficiency Calculator', slug: 'cognitive-focus-efficiency-calculator', description: 'Check whether your planning habits support deep focus.' },
  { name: 'Mental Fatigue Index Calculator', slug: 'daily-activity-points-calculator', description: 'Monitor cognitive load so fatigue doesnâ€™t slow responses.' },
  { name: 'Meditation Streak Mindfulness Tracker', slug: 'meditation-streak-mindfulness-progress-tracker', description: 'Layer mindfulness for calmer, faster reactions.' },
  { name: 'Stress Hormone Balance Calculator', slug: 'stress-hormone-balance-calculator', description: 'See how cortisol vs melatonin balance affects alertness.' },
];

const baseUrl = 'https://mycalculating.com/health-fitness/reaction-time-improvement-tracker';

const schemaMarkup = {
  '@context': 'https://schema.org',
  '@graph': [
    {
      '@type': 'BreadcrumbList',
      itemListElement: [
        { '@type': 'ListItem', position: 1, name: 'Home', item: 'https://mycalculating.com' },
        { '@type': 'ListItem', position: 2, name: 'Health & Fitness', item: 'https://mycalculating.com/health-fitness' },
        { '@type': 'ListItem', position: 3, name: 'Reaction Time Improvement Wellness Tracker', item: baseUrl },
      ],
    },
    {
      '@type': 'Article',
      headline: 'Reaction Time Improvement Wellness Tracker',
      description:
        'Track reaction time changes, training consistency, and lifestyle patterns to get a general wellness snapshot of your responsiveness over time.',
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
      name: 'Reaction Time Improvement Wellness Tracker',
      applicationCategory: 'LifestyleApplication',
      operatingSystem: 'Web Browser',
      description:
        'A wellness-focused tracker that turns reaction-time entries and daily habits into an easy-to-read improvement and consistency snapshot.',
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
      name: 'How to Use the Reaction Time Improvement Wellness Tracker',
      description: 'Step-by-step guide to logging reaction time tests and interpreting wellness-focused trends.',
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
  const improvementPct = ((values.baselineMs - values.latestMs) / values.baselineMs) * 100;
  const sleepScore = clamp(((values.sleepHours - 6) / 2) * 20, -20, 20);
  const practiceScore = clamp(values.sessionsPerWeek * 5, 0, 40);
  const caffeinePenalty = clamp(values.caffeineCups * 3, 0, 30);
  const consistencyScore = clamp(60 + sleepScore + practiceScore - caffeinePenalty, 0, 100);

  let status: ResultPayload['status'] = 'on-track';
  let interpretation =
    'Your entries point to a generally positive pattern in your reaction practice and everyday habits. You can keep building on what already feels supportive.';

  if (improvementPct < 1) {
    status = 'stalled';
    interpretation =
      'Your numbers look fairly steady right now. You might experiment with small tweaks to drills, sleep, or caffeine timing and see how that feels over time.';
  }
  if (improvementPct < 0) {
    status = 'regressing';
    interpretation =
      'This result suggests your recent test came out a bit slower. It can help to look at things like tiredness, stress, or test setup and gently adjust if you wish.';
  }

  const recommendations = [
    'A brief warmâ€‘up with light movement before you test can make sessions feel smoother and more comfortable.',
    'Noting the testing context (device, time of day, environment) makes it easier to compare sessions in a likeâ€‘forâ€‘like way.',
    'Many people find reaction drills feel better when done at a time of day they naturally feel more alert.',
  ];
  if (status === 'stalled') {
    recommendations.push('You could gently vary your drillsâ€”for example, mixing in different visual or sound cuesâ€”to keep practice interesting.');
  }
  if (status === 'regressing') {
    recommendations.push('If life allows, you might try an easier week, slightly earlier caffeine cutâ€‘offs, or a bit more sleep before your next test.');
  }

  const plan = [
    { label: 'Gentle start', detail: 'A few minutes of breathing, stretching, or easy drills can help you ease into practice days.' },
    { label: 'Midweek checkâ€‘in', detail: 'Glance at how your sleep, stress, and practice times have felt and make small adjustments if youâ€™d like.' },
    { label: 'Weekly reflection', detail: 'Compare your recent tests with your baseline and choose one simple experiment for the next week.' },
  ];

  return { improvementPct, consistencyScore, status, interpretation, recommendations, plan };
};

export default function ReactionTimeImprovementTracker() {
  const [result, setResult] = useState<ResultPayload | null>(null);

  const form = useForm<FormValues>({
    resolver: zodResolver(formSchema),
    defaultValues: {
      baselineMs: undefined,
      latestMs: undefined,
      sessionsPerWeek: undefined,
      sleepHours: undefined,
      caffeineCups: undefined,
    },
  });

  return (
    <div className="space-y-8">
      <Script id="reaction-time-schema" type="application/ld+json" strategy="afterInteractive" dangerouslySetInnerHTML={{ __html: JSON.stringify(schemaMarkup) }} />

      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <TimerReset className="h-5 w-5" />
            Reaction Time Improvement Wellness Tracker
          </CardTitle>
          <CardDescription>
            Track reaction-time changes alongside sleep, practice, and caffeine patterns for a gentle, non-diagnostic wellness snapshot.
          </CardDescription>
        </CardHeader>
      </Card>

      <Card>
        <CardHeader>
          <CardTitle>Input your metrics</CardTitle>
        </CardHeader>
        <CardContent>
          <Form {...form}>
            <form onSubmit={form.handleSubmit((values) => setResult(calculateResult(values)))} className="space-y-6">
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <FormField
                  control={form.control}
                  name="baselineMs"
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel>Baseline reaction time (ms)</FormLabel>
                      <FormControl>
                        <Input type="number" step="1" placeholder="e.g., 320" value={field.value ?? ''} onChange={(e) => field.onChange(e.target.value === '' ? undefined : Number(e.target.value))} />
                      </FormControl>
                      <FormMessage />
                    </FormItem>
                  )}
                />
                <FormField
                  control={form.control}
                  name="latestMs"
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel>Latest reaction time (ms)</FormLabel>
                      <FormControl>
                        <Input type="number" step="1" placeholder="e.g., 285" value={field.value ?? ''} onChange={(e) => field.onChange(e.target.value === '' ? undefined : Number(e.target.value))} />
                      </FormControl>
                      <FormMessage />
                    </FormItem>
                  )}
                />
                <FormField
                  control={form.control}
                  name="sessionsPerWeek"
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel>Reaction sessions per week</FormLabel>
                      <FormControl>
                        <Input type="number" step="1" placeholder="e.g., 4" value={field.value ?? ''} onChange={(e) => field.onChange(e.target.value === '' ? undefined : Number(e.target.value))} />
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
                      <FormLabel>Average sleep per night (hrs)</FormLabel>
                      <FormControl>
                        <Input type="number" step="0.25" placeholder="e.g., 7.2" value={field.value ?? ''} onChange={(e) => field.onChange(e.target.value === '' ? undefined : Number(e.target.value))} />
                      </FormControl>
                      <FormMessage />
                    </FormItem>
                  )}
                />
                <FormField
                  control={form.control}
                  name="caffeineCups"
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel>Caffeinated drinks per day</FormLabel>
                      <FormControl>
                        <Input type="number" step="0.5" placeholder="e.g., 2.5" value={field.value ?? ''} onChange={(e) => field.onChange(e.target.value === '' ? undefined : Number(e.target.value))} />
                      </FormControl>
                      <FormMessage />
                    </FormItem>
                  )}
                />
              </div>
              <Button type="submit" className="w-full md:w-auto">
                Track improvement
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
              Interactive result & interpretation
            </CardTitle>
            <CardDescription>Track progress plus the patterns driving it.</CardDescription>
          </CardHeader>
          <CardContent className="space-y-6">
            <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
              <div className="p-4 border rounded">
                <p className="text-sm text-muted-foreground">Improvement</p>
                <p className="text-2xl font-semibold text-primary">{result.improvementPct.toFixed(1)}%</p>
                <p className="text-xs text-muted-foreground">This compares your latest entry with your starting point for a simple progress snapshot.</p>
              </div>
              <div className="p-4 border rounded">
                <p className="text-sm text-muted-foreground">Consistency score</p>
                <p className="text-2xl font-semibold text-primary">{result.consistencyScore}</p>
                <p className="text-xs text-muted-foreground">A blend of sleep, practice frequency, and caffeine habits, viewed as a general pattern.</p>
              </div>
              <div className="p-4 border rounded">
                <p className="text-sm text-muted-foreground">Status</p>
                <p className="text-2xl font-semibold text-primary capitalize">{result.status.replace('-', ' ')}</p>
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
                    <ActivitySquare className="h-4 w-4" />
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
            <ShieldCheck className="h-5 w-5" />
            Formula
          </CardTitle>
        </CardHeader>
        <CardContent className="text-sm text-muted-foreground space-y-2">
          <p><strong>Improvement %</strong> = ((baseline âˆ’ latest) Ã· baseline) Ã— 100</p>
          <p><strong>Consistency score</strong> = clamp(60 + sleepScore + practiceScore âˆ’ caffeinePenalty)</p>
          <p>sleepScore = ((sleep âˆ’ 6) Ã· 2) Ã— 20 Â· practiceScore = sessions Ã— 5 Â· caffeinePenalty = cups Ã— 3</p>
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
                <p className="text-sm text-muted-foreground">Sessions gap</p>
                <p className="text-xl font-semibold text-primary">
                  {(Math.max(0, 5 - (form.getValues().sessionsPerWeek ?? 0))).toFixed(1)} sessions
                </p>
                <p className="text-xs text-muted-foreground">Aim for ~5 focused sessions weekly.</p>
              </div>
              <div className="p-4 border rounded">
                <p className="text-sm text-muted-foreground">Sleep delta</p>
                <p className="text-xl font-semibold text-primary">
                  {((form.getValues().sleepHours ?? 0) - 7.5).toFixed(1)} hrs
                </p>
                <p className="text-xs text-muted-foreground">Positive = surplus sleep vs 7.5-hr goal.</p>
              </div>
              <div className="p-4 border rounded">
                <p className="text-sm text-muted-foreground">Caffeine load</p>
                <p className="text-xl font-semibold text-primary">
                  {(form.getValues().caffeineCups ?? 0) * 3} penalty pts
                </p>
                <p className="text-xs text-muted-foreground">Keep penalty â‰¤9 pts for best sleep.</p>
              </div>
            </div>
          ) : (
            <p className="text-sm text-muted-foreground">Enter your data to unlock session, sleep, and caffeine insights.</p>
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
                <Link href={`/${calc.slug}`} className="text-primary hover:underline">
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
          content="Reaction Time Improvement Wellness Tracker: How to Monitor Neural Speed and Everyday Readiness"
        />
        <meta
          itemProp="description"
          content="Learn how to track reaction-time trends, structure simple drills, and align sleep, caffeine, and mindfulness habits to support everyday responsiveness in a non-diagnostic, wellness-focused way."
        />
        <meta
          itemProp="keywords"
          content="reaction time tracker, reaction time improvement, neural speed wellness, esports training tracker, sports performance reaction drills, sleep and reaction time, caffeine and alertness, mindfulness for faster reactions"
        />
        <meta itemProp="author" content="Mycalculating.com" />
        <meta itemProp="datePublished" content="2024-01-01" />
        <meta itemProp="url" content="/reaction-time-improvement-tracker" />

        <h1
          className="text-3xl md:text-4xl font-extrabold text-foreground mb-4"
          itemProp="headline"
        >
          Reaction Time Improvement Wellness Tracker: Gentle Ways to Monitor Speed and Readiness
        </h1>
        <p className="text-lg italic text-gray-700">
          This guide explains how to use reaction-time logging as a simple wellness check-inâ€”connecting test results with
          sleep, practice rhythms, and stimulants in a non-diagnostic, supportive way.
        </p>

        {/* TABLE OF CONTENTS */}
        <h2 className="text-2xl font-bold text-foreground mt-8 mb-4">Table of Contents</h2>
        <ul className="list-disc ml-6 space-y-2 text-blue-600">
          <li>
            <a href="#what-is-reaction-time" className="hover:underline">
              What Reaction Time Actually Measures
            </a>
          </li>
          <li>
            <a href="#factors" className="hover:underline">
              Everyday Factors That Influence Reaction Time
            </a>
          </li>
          <li>
            <a href="#how-to-track" className="hover:underline">
              How to Track Reaction Time in a Consistent Way
            </a>
          </li>
          <li>
            <a href="#interpreting-trends" className="hover:underline">
              Interpreting Trends Without Self-Diagnosing
            </a>
          </li>
          <li>
            <a href="#building-routines" className="hover:underline">
              Building Supportive Routines Around the Tracker
            </a>
          </li>
        </ul>

        <hr />

        <h2 id="what-is-reaction-time" className="text-2xl font-bold text-foreground pt-6" itemProp="articleSection">
          What Reaction Time Actually Measures
        </h2>
        <p>
          Reaction time is the short delay between a stimulus (like a light or sound) and your response (such as a key
          press, click, or movement). In this tracker, reaction-time tests are treated as one lens on how rested,
          focused, and coordinated you may feel on a given dayâ€”not as a medical assessment of nervous system health.
        </p>
        <p>
          Because individual baselines vary widely, the most useful signal comes from comparing you with yourself over
          weeks and months. Small, gradual shifts paired with notes about sleep, training, or stress can highlight
          patterns you may want to explore further.
        </p>

        <h2 id="factors" className="text-2xl font-bold text-foreground pt-6" itemProp="articleSection">
          Everyday Factors That Influence Reaction Time
        </h2>
        <p>
          Many everyday variables can nudge reaction speed up or down. The goal of this tool is simply to make those
          influences more visible, so you can experiment with supportive habits:
        </p>
        <ul className="list-disc ml-6 space-y-1">
          <li>
            <strong>Sleep quality and timing</strong> â€“ Short sleep or irregular bedtimes can leave you feeling slower
            or foggier.
          </li>
          <li>
            <strong>Practice frequency</strong> â€“ Short, focused drills often lead to smoother responses over time.
          </li>
          <li>
            <strong>Caffeine and other stimulants</strong> â€“ Helpful for some people in moderation, but too much or
            very late intake can disrupt rest.
          </li>
          <li>
            <strong>Stress load</strong> â€“ Busy or emotionally heavy days may make it harder to settle and react
            cleanly.
          </li>
          <li>
            <strong>Testing setup</strong> â€“ Device, screen, sound, and even posture all introduce natural variation.
          </li>
        </ul>

        <h2 id="how-to-track" className="text-2xl font-bold text-foreground pt-6" itemProp="articleSection">
          How to Track Reaction Time in a Consistent Way
        </h2>
        <p>
          For clearer trends, try to keep your testing conditions as similar as life allows. That might mean using the
          same device, picking a familiar drill, and testing around the same time of day. Logging sleep hours, practice
          sessions, and caffeinated drinks gives extra context for what you see.
        </p>
        <p>
          You do not need perfect data for this to help. Even rough notes such as â€œbusy week,â€ â€œlate-night gaming,â€ or
          â€œextra rest daysâ€ can explain shifts and keep the tracker feeling like a gentle reflection tool instead of a
          rigid performance report.
        </p>

        <h2 id="interpreting-trends" className="text-2xl font-bold text-foreground pt-6" itemProp="articleSection">
          Interpreting Trends Without Self-Diagnosing
        </h2>
        <p>
          The improvement percentages and consistency scores here are meant to be descriptive, not diagnostic. Slower
          days or flatter progress do not automatically mean something is wrong; they can simply be a cue to look at
          rest, stress, or schedule shifts with a bit more curiosity.
        </p>
        <p>
          If you ever have health concerns about coordination, balance, or cognition, it is always best to talk with a
          qualified professional. You can share exported notes or screenshots from this tracker as one small piece of
          context in that conversation.
        </p>

        <h2 id="building-routines" className="text-2xl font-bold text-foreground pt-6" itemProp="articleSection">
          Building Supportive Routines Around the Tracker
        </h2>
        <p>
          Over time, many people find that pairing this tracker with simple routinesâ€”like a consistent bedtime, light
          movement, hydration, or mindfulness streaksâ€”feels more helpful than chasing any single number. The goal is a
          smoother, more sustainable rhythm, not constant maximization.
        </p>
        <p>
          You can revisit the tracker weekly or every few weeks, treat the results as a check-in, and adjust any
          experiments that no longer fit your life, sport, or gaming season.
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
            <ShieldCheck className="h-5 w-5" />
            Summary
          </CardTitle>
        </CardHeader>
        <CardContent className="space-y-2 text-sm text-muted-foreground">
          <p>
            This wellness tracker blends your reaction-time entries with sleep, practice, and caffeine patterns to offer a
            simple, non-diagnostic view of how your current routine feels over time.
          </p>
          <p>
            You can treat the numbers and suggestions as gentle prompts for experimentation, keeping only what fits your
            life, sport, or creative work.
          </p>
        </CardContent>
      </Card>

      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <ShieldCheck className="h-5 w-5" />
            Disclaimer
          </CardTitle>
        </CardHeader>
        <CardContent className="text-sm text-muted-foreground">
          <p>
            Disclaimer: This tool provides general wellness and lifestyle insights for educational purposes only. It is
            not a medical or psychological diagnosis, screening, or treatment plan. For any health concerns, please
            consult a qualified professional who can get to know your specific situation.
          </p>
        </CardContent>
      </Card>
    </div>
  );
}



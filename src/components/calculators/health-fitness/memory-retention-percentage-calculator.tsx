'use client';

import { useState } from 'react';
import Script from 'next/script';
import Link from 'next/link';
import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import { z } from 'zod';
import { BrainCircuit, BookMarked, ChartLine, StickyNote, Shield } from 'lucide-react';

import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Form, FormControl, FormField, FormItem, FormLabel, FormMessage } from '@/components/ui/form';
import { Input } from '@/components/ui/input';

const formSchema = z.object({
  totalItems: z.number({ invalid_type_error: 'Enter total material items' }).min(1).max(1000),
  recalledItems: z.number({ invalid_type_error: 'Enter recalled items' }).min(0).max(1000),
  daysSinceStudy: z.number({ invalid_type_error: 'Enter days since study session' }).min(0).max(60),
  spacedSessions: z.number({ invalid_type_error: 'Enter spaced repetitions' }).min(0).max(30),
  sleepHours: z.number({ invalid_type_error: 'Enter average sleep' }).min(4).max(10),
});

type FormValues = z.infer<typeof formSchema>;

type ResultPayload = {
  retentionPercent: number;
  forgettingPenalty: number;
  reinforcementLevel: 'excellent' | 'reinforce soon' | 'review ASAP';
  interpretation: string;
  recommendations: string[];
  plan: { label: string; detail: string }[];
};

const steps = [
  'Count the distinct info items, flashcards, or concepts you attempted to learn.',
  'Run a quick recall test (written or spoken) and log how many you correctly remembered.',
  'Enter days since your last focused study session and how many spaced repetitions you logged.',
  'Add your average nightly sleep for the past few days to factor in consolidation quality.',
  'Use the output to time your next review block and strengthen weak links.',
];

const faqs = [
  { question: 'What counts as an item?', answer: 'Flashcards, concepts, question stems, or any discrete chunk of information you can answer independently.' },
  { question: 'Why track spaced sessions?', answer: 'Each spaced pass resets some forgetting. Logging them shows whether more repetitions are required.' },
  { question: 'How often should I test retention?', answer: 'Weekly during semester-style study, or within 24 hours when prepping for shorter exams.' },
  { question: 'Does sleep really matter?', answer: 'Yes—sleep drives memory consolidation. Poor sleep increases forgetting penalties.' },
  { question: 'Can I use this for language vocab?', answer: 'Absolutely. Track words attempted vs recalled and plan review sessions.' },
  { question: 'What if I don’t have exact numbers?', answer: 'Estimate using percentages or sample questions—the calculator is meant for quick planning.' },
  { question: 'How can I raise retention fast?', answer: 'Use spaced repetition, mix question types, teach concepts aloud, and sleep 7–9 hours.' },
  { question: 'Should I log recognition or recall?', answer: 'Recall (no cues) gives the clearest signal. Recognition often overestimates true mastery.' },
  { question: 'Can teams or classrooms use this?', answer: 'Yes—log averages for cohorts to schedule group reviews or labs.' },
  { question: 'Does caffeine influence results?', answer: 'Indirectly through sleep. Track caffeine separately if it impacts rest.' },
];

const relatedCalculators = [
  { name: 'Meditation Streak Mindfulness Progress Tracker', slug: 'meditation-streak-mindfulness-progress-tracker', description: 'Use mindfulness streaks to focus longer during study.' },
  { name: 'Cognitive Focus Efficiency Calculator', slug: 'cognitive-focus-efficiency-calculator', description: 'Identify planning gaps that waste study time.' },
  { name: 'Stress Hormone Balance Calculator', slug: 'stress-hormone-balance-calculator', description: 'Balance cortisol/melatonin to improve nightly consolidation.' },
  { name: 'Emotional Wellbeing Index Calculator', slug: 'emotional-wellbeing-index-calculator', description: 'Check mood patterns that affect learning motivation.' },
];

const baseUrl = 'https://mycalculating.com/category/health-fitness/daily-activity-points-calculator';

const schemaMarkup = {
  '@context': 'https://schema.org',
  '@graph': [
    {
      '@type': 'BreadcrumbList',
      itemListElement: [
        { '@type': 'ListItem', position: 1, name: 'Home', item: 'https://mycalculating.com' },
        { '@type': 'ListItem', position: 2, name: 'Health & Fitness', item: 'https://mycalculating.com/category/health-fitness' },
        { '@type': 'ListItem', position: 3, name: 'Memory Retention Percentage Wellness Tracker', item: baseUrl },
      ],
    },
    {
      '@type': 'Article',
      headline: 'Memory Retention Percentage Wellness Tracker',
      description:
        'Track memory retention percentages and study patterns in a wellness-focused, non-diagnostic way to plan gentle review sessions.',
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
      name: 'Memory Retention Percentage Wellness Tracker',
      applicationCategory: 'LifestyleApplication',
      operatingSystem: 'Web Browser',
      description:
        'A gentle learning tracker that turns recall attempts, spacing, and sleep into an easy-to-read retention snapshot for planning reviews.',
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
      name: 'How to Use the Memory Retention Percentage Wellness Tracker',
      description: 'Step-by-step guide to logging recall attempts and planning non-diagnostic review sessions.',
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
  const retentionPercent = clamp((values.recalledItems / values.totalItems) * 100, 0, 100);
  const forgettingPenalty = clamp(values.daysSinceStudy * 2 - values.spacedSessions * 3 - (values.sleepHours - 6) * 2, 0, 40);
  const adjustedRetention = clamp(retentionPercent - forgettingPenalty, 0, 100);

  let reinforcementLevel: ResultPayload['reinforcementLevel'] = 'excellent';
  let interpretation =
    'Your entries suggest that you are remembering a good amount of what you studied. A light review can help you keep that feeling of familiarity.';

  if (adjustedRetention < 80) {
    reinforcementLevel = 'reinforce soon';
    interpretation =
      'It looks like some of the material is starting to fade a bit. A gentle review session sometime soon could help refresh it.';
  }
  if (adjustedRetention < 60) {
    reinforcementLevel = 'review ASAP';
    interpretation =
      'This snapshot shows that quite a bit of the material may not feel as fresh right now. You might find it helpful to spend some focused time revisiting the key pieces you want to remember.';
  }

  const recommendations = [
    'When it feels helpful, try simple recall (like jotting ideas from memory) instead of only re‑reading your notes.',
    'You can turn trickier ideas into small review prompts or cards so they come up again over time.',
    'Easing away from bright screens before bed can make your evenings feel calmer and may support how your studying settles in.',
  ];
  if (reinforcementLevel !== 'excellent') {
    recommendations.push('Some people enjoy short review blocks of around 15–20 minutes with small breaks so studying feels more manageable.');
  }
  if (reinforcementLevel === 'review ASAP') {
    recommendations.push('Explaining ideas out loud—to yourself or someone else—can gently strengthen what you want to remember.');
  }

  const plan = [
    { label: 'Today', detail: 'Spend a little time with the items that felt most wobbly and see which ones you’d like to feel clearer about.' },
    { label: 'This Week', detail: 'If it fits your schedule, add one or two gentle review sessions for this material on different days.' },
    { label: 'Next Block', detail: 'Notice how your studying and sleep routines relate to how confident you feel with new material.' },
  ];

  return { retentionPercent: adjustedRetention, forgettingPenalty, reinforcementLevel, interpretation, recommendations, plan };
};

export default function MemoryRetentionPercentageTracker() {
  const [result, setResult] = useState<ResultPayload | null>(null);

  const form = useForm<FormValues>({
    resolver: zodResolver(formSchema),
    defaultValues: {
      totalItems: undefined,
      recalledItems: undefined,
      daysSinceStudy: undefined,
      spacedSessions: undefined,
      sleepHours: undefined,
    },
  });

  return (
    <div className="space-y-8">
      <Script id="memory-retention-schema" type="application/ld+json" strategy="afterInteractive" dangerouslySetInnerHTML={{ __html: JSON.stringify(schemaMarkup) }} />

      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <BrainCircuit className="h-5 w-5" />
            Memory Retention Percentage Wellness Tracker
          </CardTitle>
          <CardDescription>
            Track current recall percentage, forgetting penalty, and review timing as a gentle learning and wellness snapshot.
          </CardDescription>
        </CardHeader>
      </Card>

      <Card>
        <CardHeader>
          <CardTitle>Input your study snapshot</CardTitle>
        </CardHeader>
        <CardContent>
          <Form {...form}>
            <form onSubmit={form.handleSubmit((values) => setResult(calculateResult(values)))} className="space-y-6">
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <FormField
                  control={form.control}
                  name="totalItems"
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel>Total items studied</FormLabel>
                      <FormControl>
                        <Input type="number" step="1" placeholder="e.g., 80" value={field.value ?? ''} onChange={(e) => field.onChange(e.target.value === '' ? undefined : Number(e.target.value))} />
                      </FormControl>
                      <FormMessage />
                    </FormItem>
                  )}
                />
                <FormField
                  control={form.control}
                  name="recalledItems"
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel>Items recalled correctly</FormLabel>
                      <FormControl>
                        <Input type="number" step="1" placeholder="e.g., 62" value={field.value ?? ''} onChange={(e) => field.onChange(e.target.value === '' ? undefined : Number(e.target.value))} />
                      </FormControl>
                      <FormMessage />
                    </FormItem>
                  )}
                />
                <FormField
                  control={form.control}
                  name="daysSinceStudy"
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel>Days since last focused study</FormLabel>
                      <FormControl>
                        <Input type="number" step="1" placeholder="e.g., 4" value={field.value ?? ''} onChange={(e) => field.onChange(e.target.value === '' ? undefined : Number(e.target.value))} />
                      </FormControl>
                      <FormMessage />
                    </FormItem>
                  )}
                />
                <FormField
                  control={form.control}
                  name="spacedSessions"
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel>Spaced-review sessions logged</FormLabel>
                      <FormControl>
                        <Input type="number" step="1" placeholder="e.g., 2" value={field.value ?? ''} onChange={(e) => field.onChange(e.target.value === '' ? undefined : Number(e.target.value))} />
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
                      <FormLabel>Average sleep (hrs/night)</FormLabel>
                      <FormControl>
                        <Input type="number" step="0.25" placeholder="e.g., 7.3" value={field.value ?? ''} onChange={(e) => field.onChange(e.target.value === '' ? undefined : Number(e.target.value))} />
                      </FormControl>
                      <FormMessage />
                    </FormItem>
                  )}
                />
              </div>
              <Button type="submit" className="w-full md:w-auto">
                Track retention
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
            <CardDescription>Instant breakdown of retention percentage and review priority.</CardDescription>
          </CardHeader>
          <CardContent className="space-y-6">
            <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
              <div className="p-4 border rounded">
                <p className="text-sm text-muted-foreground">Adjusted retention</p>
                <p className="text-2xl font-semibold text-primary">{result.retentionPercent.toFixed(1)}%</p>
                <p className="text-xs text-muted-foreground">A simple percentage view after considering time since study, reviews, and recent sleep.</p>
              </div>
              <div className="p-4 border rounded">
                <p className="text-sm text-muted-foreground">Forgetting penalty</p>
                <p className="text-2xl font-semibold text-primary">{result.forgettingPenalty.toFixed(1)} pts</p>
                <p className="text-xs text-muted-foreground">A rough indicator of how much your pattern might be nudging things to fade.</p>
              </div>
              <div className="p-4 border rounded">
                <p className="text-sm text-muted-foreground">Review urgency</p>
                <p className="text-2xl font-semibold text-primary capitalize">{result.reinforcementLevel.replace('-', ' ')}</p>
                <p className="text-xs text-muted-foreground">{result.interpretation}</p>
              </div>
            </div>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <Card>
                <CardHeader>
                  <CardTitle className="text-base flex items-center gap-2"><ChartLine className="h-4 w-4" />Recommendations</CardTitle>
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
                  <CardTitle className="text-base flex items-center gap-2"><StickyNote className="h-4 w-4" />Action plan</CardTitle>
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
          <p><strong>Retention %</strong> = (Recalled ÷ Total) × 100</p>
          <p><strong>Forgetting penalty</strong> = days × 2 − spacedSessions × 3 − (sleep − 6) × 2</p>
          <p>Adjusted retention = clamp(Retention % − Penalty)</p>
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
        itemType="https://schema.org/Article"
      >
        {/* SEO & SCHEMA METADATA (HIGHLY OPTIMIZED) */}
        <meta
          itemProp="name"
          content="Memory Retention Percentage Wellness Tracker: Plan Gentle, Smarter Study Reviews"
        />
        <meta
          itemProp="description"
          content="Discover how to track memory retention percentages, understand forgetting penalties, and schedule low-stress review sessions using a wellness-focused tracking approach."
        />
        <meta
          itemProp="keywords"
          content="memory retention tracker, study review planner, spaced repetition wellness, forgetting curve estimator, learning progress tracker, recall percentage, active recall habits, exam preparation wellness"
        />
        <meta itemProp="author" content="Mycalculating.com" />
        <meta itemProp="datePublished" content="2024-01-01" />
        <meta itemProp="url" content="/category/health-fitness/daily-activity-points-calculator" />

        <h1
          className="text-3xl md:text-4xl font-extrabold text-foreground mb-4"
          itemProp="headline"
        >
          Memory Retention Percentage Wellness Tracker: A Kind Way to Follow What Sticks
        </h1>
        <p className="text-lg italic text-gray-700">
          Instead of judging results, this guide frames memory tracking as a supportive way to notice what helps ideas
          stay familiar—from spacing and sleep to stress and mindfulness.
        </p>

        {/* TABLE OF CONTENTS */}
        <h2 className="text-2xl font-bold text-foreground mt-8 mb-4">Table of Contents</h2>
        <ul className="list-disc ml-6 space-y-2 text-blue-600">
          <li>
            <a href="#why-track-memory" className="hover:underline">
              Why Track Memory Retention as a Wellness Signal?
            </a>
          </li>
          <li>
            <a href="#inputs" className="hover:underline">
              Key Inputs: Items, Recall Attempts, Time, and Sleep
            </a>
          </li>
          <li>
            <a href="#forgetting-penalty" className="hover:underline">
              Understanding the “Forgetting Penalty” Concept
            </a>
          </li>
          <li>
            <a href="#planning-reviews" className="hover:underline">
              Planning Reviews Without Turning Study Into Pressure
            </a>
          </li>
          <li>
            <a href="#healthy-habits" className="hover:underline">
              Linking Study Habits With Broader Wellbeing
            </a>
          </li>
        </ul>

        <hr />

        <h2 id="why-track-memory" className="text-2xl font-bold text-foreground pt-6" itemProp="articleSection">
          Why Track Memory Retention as a Wellness Signal?
        </h2>
        <p>
          Remembering information is not just about grades or work performance—it also affects how confident and calm
          you feel when facing exams, presentations, or everyday tasks. A simple retention tracker can reduce guesswork
          by showing when material still feels familiar and when it might appreciate a gentle review.
        </p>
        <p>
          In this tool, percentages and labels like “reinforce soon” are descriptive, not diagnostic. They are there to
          help you make choices about review timing and to keep learning feeling more manageable, not to measure your
          worth or abilities.
        </p>

        <h2 id="inputs" className="text-2xl font-bold text-foreground pt-6" itemProp="articleSection">
          Key Inputs: Items, Recall Attempts, Time, and Sleep
        </h2>
        <p>
          The tracker works with just a handful of simple inputs: how many items you tried to learn, how many you can
          currently recall, how long it has been since you last studied them, how many spaced sessions you logged, and
          how you&apos;ve been sleeping lately.
        </p>
        <ul className="list-disc ml-6 space-y-1">
          <li>
            <strong>Total items</strong> – cards, questions, or concepts you aimed to remember.
          </li>
          <li>
            <strong>Recalled items</strong> – how many you could bring back without prompts.
          </li>
          <li>
            <strong>Days since study</strong> – how much time forgetting has had to work.
          </li>
          <li>
            <strong>Spaced sessions</strong> – how many times you revisited the material.
          </li>
          <li>
            <strong>Sleep hours</strong> – a rough sense of consolidation support from rest.
          </li>
        </ul>

        <h2 id="forgetting-penalty" className="text-2xl font-bold text-foreground pt-6" itemProp="articleSection">
          Understanding the “Forgetting Penalty” Concept
        </h2>
        <p>
          The forgetting penalty in this tracker is a simple way of modeling how time, spacing, and sleep might interact
          with your recall percentage. It does not claim clinical accuracy—it simply nudges your raw recall score down
          a little when spacing and rest have been limited.
        </p>
        <p>
          Seeing this penalty alongside your adjusted retention can help you choose where to focus. For example, you may
          decide to add a short review pass, schedule an earlier night, or give yourself extra kindness when a tough
          week naturally lowers your scores.
        </p>

        <h2 id="planning-reviews" className="text-2xl font-bold text-foreground pt-6" itemProp="articleSection">
          Planning Reviews Without Turning Study Into Pressure
        </h2>
        <p>
          Instead of pushing constant study, the tracker encourages short, intentional review blocks. Labels like
          “reinforce soon” or “review ASAP” are invitations to choose what feels realistic—perhaps a 15–20 minute review
          block, a quick practice quiz, or explaining ideas out loud to someone else.
        </p>
        <p>
          You can revisit the tool weekly or around key milestones and use the outputs to protect your energy: studying
          just enough to feel prepared, while still leaving room for rest, hobbies, and connection.
        </p>

        <h2 id="healthy-habits" className="text-2xl font-bold text-foreground pt-6" itemProp="articleSection">
          Linking Study Habits With Broader Wellbeing
        </h2>
        <p>
          Learning rarely happens in isolation. Stress, sleep, food, movement, and relationships all affect how steady
          and motivated you feel. Combining this memory tracker with other wellness tools—like mindfulness streaks or
          emotional wellbeing check-ins—can offer a fuller picture of what supports your learning seasons.
        </p>
        <p>
          If studying ever feels overwhelming or consistently impacts your mood, it can be helpful to talk with a
          trusted person or professional. They can help you adjust expectations and routines so learning becomes more
          sustainable.
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
            This wellness tracker turns your recall attempts, timing, and a few simple study habits into one snapshot of
            how familiar your material feels right now.
          </p>
          <p>
            You can treat the outputs as gentle suggestions for review and routine tweaks, adapting or ignoring anything
            that does not fit your energy, goals, or schedule.
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
            Disclaimer: This tool provides general wellness and learning insights for educational purposes only. It is
            not a medical, psychological, or academic diagnosis. For health or mental health concerns—or for formal
            accommodations—please speak with a qualified professional or relevant support service.
          </p>
        </CardContent>
      </Card>
    </div>
  );
}


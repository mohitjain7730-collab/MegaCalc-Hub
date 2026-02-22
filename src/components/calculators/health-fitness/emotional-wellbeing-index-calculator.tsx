'use client';

import { useState } from 'react';
import Script from 'next/script';
import Link from 'next/link';
import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import { z } from 'zod';
import { HeartPulse, Smile, Users, Target, ShieldCheck } from 'lucide-react';

import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Form, FormControl, FormField, FormItem, FormLabel, FormMessage } from '@/components/ui/form';
import { Input } from '@/components/ui/input';

const formSchema = z.object({
  moodScore: z.number({ invalid_type_error: 'Enter mood score' }).min(1).max(10),
  energyScore: z.number({ invalid_type_error: 'Enter energy score' }).min(1).max(10),
  connectionScore: z.number({ invalid_type_error: 'Enter connection score' }).min(1).max(10),
  purposeScore: z.number({ invalid_type_error: 'Enter purpose score' }).min(1).max(10),
  stressScore: z.number({ invalid_type_error: 'Enter stress score' }).min(1).max(10),
});

type FormValues = z.infer<typeof formSchema>;

type ResultPayload = {
  wellbeingIndex: number;
  resilienceScore: number;
  status: 'flourishing' | 'steady' | 'support needed';
  interpretation: string;
  recommendations: string[];
  plan: { label: string; detail: string }[];
};

const steps = [
  'Assign honest 1â€“10 scores for mood, energy, connection, purpose, and stress.',
  'Keep inputs blank-free so the tool can calculate indices properly.',
  'Submit to see wellbeing vs stress balance plus resilience capacity.',
  'Review recommendations and plan items to boost the lowest levers.',
  'Repeat weekly to watch trends and bring data to therapists or coaches.',
];

const faqs = [
  { question: 'Is this a diagnostic mental health test?', answer: 'No. It is an awareness snapshot to spark reflection and conversations with licensed professionals if needed.' },
  { question: 'How often should I track?', answer: 'Weekly tracking shows patterns. Log more frequently during stressful seasons for tighter feedback.' },
  { question: 'What is a good wellbeing index?', answer: 'Scores â‰¥75 indicate flourishing. 55â€“74 is steady. Below 55 suggests you should prioritize more support.' },
  { question: 'Why include purpose?', answer: 'Purpose buffers stress and fuels motivation. Tracking it highlights when you need more meaningful activities.' },
  { question: 'Can I use this with my therapist?', answer: 'Yesâ€”export or share your scores and notes to guide sessions with objective data.' },
  { question: 'Does stress automatically lower the score?', answer: 'Yes. Higher stress subtracts from wellbeing and resilience so you can see how rest and boundaries help.' },
  { question: 'What if I experience extreme swings?', answer: 'Use the notes area outside this tool to record context, then seek professional care for persistent swings.' },
  { question: 'Can teams use it?', answer: 'Teams can collect anonymized averages to plan wellness initiatives or decompressing rituals.' },
  { question: 'How do I improve the connection score?', answer: 'Schedule intentional touchpoints (calls, co-working, shared meals) and reduce doomscrolling replacements.' },
  { question: 'Does sleep matter?', answer: 'Absolutely. Poor sleep drags energy, mood, and stress. Pair this tool with a sleep tracker for clarity.' },
];

const relatedCalculators = [
  { name: 'Meditation Streak Mindfulness Progress Tracker', slug: 'meditation-streak-mindfulness-progress-tracker', description: 'See how consistency in mindfulness shifts mood and stress.' },
  { name: 'Stress Hormone Balance Calculator', slug: 'stress-hormone-balance-calculator', description: 'Align cortisol vs melatonin to protect calm evenings.' },
  { name: 'Memory Retention Percentage Wellness Tracker', slug: 'daily-activity-points-calculator', description: 'Track learning retention alongside emotional energy.' },
  { name: 'Reaction Time Improvement Wellness Tracker', slug: 'reaction-time-improvement-tracker', description: 'Watch cognitive sharpness trends evolve as wellbeing shifts.' },
];

const baseUrl = 'https://mycalculating.com/health-fitness/emotional-wellbeing-index-tracker';

const schemaMarkup = {
  '@context': 'https://schema.org',
  '@graph': [
    {
      '@type': 'BreadcrumbList',
      itemListElement: [
        { '@type': 'ListItem', position: 1, name: 'Home', item: 'https://mycalculating.com' },
        { '@type': 'ListItem', position: 2, name: 'Health & Fitness', item: 'https://mycalculating.com/health-fitness' },
        { '@type': 'ListItem', position: 3, name: 'Emotional Wellbeing Index Wellness Tracker', item: baseUrl },
      ],
    },
    {
      '@type': 'Article',
      headline: 'Emotional Wellbeing Index Wellness Tracker',
      description:
        'A gentle wellness tracker that blends mood, energy, connection, purpose, and stress check-ins into a simple emotional wellbeing snapshot.',
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
      name: 'Emotional Wellbeing Index Wellness Tracker',
      applicationCategory: 'LifestyleApplication',
      operatingSystem: 'Web Browser',
      description:
        'A non-diagnostic wellness tracker that turns five simple self-ratings into a wellbeing and resilience snapshot for personal reflection.',
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
      name: 'How to Use the Emotional Wellbeing Index Wellness Tracker',
      description: 'Step-by-step guide to logging mood, energy, connection, purpose, and stress check-ins.',
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
  const positiveAverage = (values.moodScore + values.energyScore + values.connectionScore + values.purposeScore) / 4;
  const wellbeingIndex = clamp(positiveAverage * 10 - values.stressScore * 2, 0, 100);
  const resilienceScore = clamp(positiveAverage * 8 - values.stressScore * 3 + 20, 0, 100);

  let status: ResultPayload['status'] = 'flourishing';
  let interpretation =
    'Your snapshot suggests that, overall, things are feeling relatively supportive for you right now. You can keep leaning into the routines and connections that already help.';

  if (wellbeingIndex < 70) {
    status = 'steady';
    interpretation =
      'This pattern looks fairly steady, with a bit of room for extra care. You might gently strengthen one small habit or checkâ€‘in that supports you this week.';
  }
  if (wellbeingIndex < 55) {
    status = 'support needed';
    interpretation =
      'These numbers suggest that, today, stress may be weighing more heavily than some of your supports. It could be a good moment to be extra kind to yourself and consider leaning on people or practices you trust.';
  }

  const recommendations = [
    'Notice and gently celebrate one small thing that went okay or felt meaningful today.',
    'Simple supports like drinking water, eating regularly, and getting a bit of daylight can be kind to your energy.',
    'If it feels right, you might plan a couple of intentional touchpoints with people who feel grounding or kind to be around.',
  ];
  if (status === 'steady') {
    recommendations.push('A few minutes of light reflection or journaling on what matters to you this month can help reconnect you with a sense of direction.');
  }
  if (status === 'support needed') {
    recommendations.push('You might consider reaching out to a trusted person or a professional space where you can talk about whatâ€™s on your mind.');
  }

  const plan = [
    { label: 'Morning checkâ€‘in', detail: 'Gently name one feeling you notice and one small action that could support you today.' },
    { label: 'Midday pause', detail: 'If you remember, take a short moment midâ€‘day to notice your energy and stress, and see whether a brief breath or stretch might feel good.' },
    { label: 'Evening reflection', detail: 'Before bed, you might jot down a few gratitudes, moments, or lessons from the dayâ€”only if it feels helpful, not forced.' },
  ];

  return { wellbeingIndex, resilienceScore, status, interpretation, recommendations, plan };
};

export default function EmotionalWellbeingIndexTracker() {
  const [result, setResult] = useState<ResultPayload | null>(null);

  const form = useForm<FormValues>({
    resolver: zodResolver(formSchema),
    defaultValues: {
      moodScore: undefined,
      energyScore: undefined,
      connectionScore: undefined,
      purposeScore: undefined,
      stressScore: undefined,
    },
  });

  return (
    <div className="space-y-8">
      <Script id="emotional-wellbeing-schema" type="application/ld+json" strategy="afterInteractive" dangerouslySetInnerHTML={{ __html: JSON.stringify(schemaMarkup) }} />

      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <HeartPulse className="h-5 w-5" />
            Emotional Wellbeing Index Wellness Tracker
          </CardTitle>
          <CardDescription>
            A quick, non-diagnostic snapshot of mood, energy, relationships, meaning, and stress for your own reflection.
          </CardDescription>
        </CardHeader>
      </Card>

      <Card>
        <CardHeader>
          <CardTitle>Input your snapshot</CardTitle>
        </CardHeader>
        <CardContent>
          <Form {...form}>
            <form onSubmit={form.handleSubmit((values) => setResult(calculateResult(values)))} className="space-y-6">
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                {[
                  { name: 'moodScore', label: 'Mood (1-10)', placeholder: 'e.g., 7' },
                  { name: 'energyScore', label: 'Energy (1-10)', placeholder: 'e.g., 6' },
                  { name: 'connectionScore', label: 'Connection/support (1-10)', placeholder: 'e.g., 5' },
                  { name: 'purposeScore', label: 'Purpose/meaning (1-10)', placeholder: 'e.g., 8' },
                  { name: 'stressScore', label: 'Stress/overwhelm (1-10)', placeholder: 'e.g., 4' },
                ].map((fieldConfig) => (
                  <FormField
                    key={fieldConfig.name}
                    control={form.control}
                    name={fieldConfig.name as keyof FormValues}
                    render={({ field }) => (
                      <FormItem>
                        <FormLabel>{fieldConfig.label}</FormLabel>
                        <FormControl>
                          <Input type="number" step="1" placeholder={fieldConfig.placeholder} value={field.value ?? ''} onChange={(e) => field.onChange(e.target.value === '' ? undefined : Number(e.target.value))} />
                        </FormControl>
                        <FormMessage />
                      </FormItem>
                    )}
                  />
                ))}
              </div>
              <Button type="submit" className="w-full md:w-auto">
                Track wellbeing
              </Button>
            </form>
          </Form>
        </CardContent>
      </Card>

      {result && (
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <Smile className="h-5 w-5 text-primary" />
              Interactive results
            </CardTitle>
            <CardDescription>See wellbeing and resilience at a glance.</CardDescription>
          </CardHeader>
          <CardContent className="space-y-6">
            <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
              <div className="p-4 border rounded">
                <p className="text-sm text-muted-foreground">Wellbeing index</p>
                <p className="text-2xl font-semibold text-primary">{result.wellbeingIndex.toFixed(0)}</p>
                <p className="text-xs text-muted-foreground">A simple 0â€“100 snapshot based on how todayâ€™s inputs feel to you.</p>
              </div>
              <div className="p-4 border rounded">
                <p className="text-sm text-muted-foreground">Resilience score</p>
                <p className="text-2xl font-semibold text-primary">{result.resilienceScore.toFixed(0)}</p>
                <p className="text-xs text-muted-foreground">An approximate sense of how your current supports and stress balance out today.</p>
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
                    <Users className="h-4 w-4" />
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
          <p><strong>Wellbeing index</strong> = clamp(((mood + energy + connection + purpose)/4 Ã— 10) âˆ’ stress Ã— 2).</p>
          <p><strong>Resilience score</strong> = clamp((positiveAverage Ã— 8) âˆ’ stress Ã— 3 + 20).</p>
          <p>All values are normalized 0â€“100 for easy trend comparisons.</p>
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
                <p className="text-sm text-muted-foreground">Connection gap</p>
                <p className="text-xl font-semibold text-primary">
                  {(8 - (form.getValues().connectionScore ?? 0)).toFixed(1)}
                </p>
                <p className="text-xs text-muted-foreground">Shows how todayâ€™s sense of connection compares with a fuller, more supported day for you.</p>
              </div>
              <div className="p-4 border rounded">
                <p className="text-sm text-muted-foreground">Purpose gap</p>
                <p className="text-xl font-semibold text-primary">
                  {(8 - (form.getValues().purposeScore ?? 0)).toFixed(1)}
                </p>
                <p className="text-xs text-muted-foreground">A rough sense of how close today feels to a more purposeful or aligned day for you.</p>
              </div>
              <div className="p-4 border rounded">
                <p className="text-sm text-muted-foreground">Stress buffer</p>
                <p className="text-xl font-semibold text-primary">
                  {(10 - (form.getValues().stressScore ?? 0)) * 10}%
                </p>
                <p className="text-xs text-muted-foreground">Gives a sense of how much space you feel you have today before things feel overwhelming.</p>
              </div>
            </div>
          ) : (
            <p className="text-sm text-muted-foreground">Enter your snapshot to reveal gaps and buffers.</p>
          )}
        </CardContent>
      </Card>

      <Card>
        <CardHeader>
          <CardTitle>Related tools</CardTitle>
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
          content="Emotional Wellbeing Index Wellness Tracker: A Non-Diagnostic Snapshot of How You Feel"
        />
        <meta
          itemProp="description"
          content="Learn how to track mood, energy, connection, purpose, and stress in a compassionate, non-diagnostic way using an emotional wellbeing wellness tracker."
        />
        <meta
          itemProp="keywords"
          content="emotional wellbeing tracker, mood and energy check in, resilience wellness index, non diagnostic mental health tool, stress and connection tracker, purpose and meaning reflection"
        />
        <meta itemProp="author" content="Mycalculating.com" />
        <meta itemProp="datePublished" content="2024-01-01" />
        <meta itemProp="url" content="/emotional-wellbeing-index-tracker" />

        <h1
          className="text-3xl md:text-4xl font-extrabold text-foreground mb-4"
          itemProp="headline"
        >
          Emotional Wellbeing Index Wellness Tracker: A Gentle Way to Notice How You Are Doing
        </h1>
        <p className="text-lg italic text-gray-700">
          This guide walks through using a simple five-part check-inâ€”mood, energy, connection, purpose, and stressâ€”to
          create a non-diagnostic snapshot of your emotional landscape.
        </p>

        {/* TABLE OF CONTENTS */}
        <h2 className="text-2xl font-bold text-foreground mt-8 mb-4">Table of Contents</h2>
        <ul className="list-disc ml-6 space-y-2 text-blue-600">
          <li>
            <a href="#why-track-emotions" className="hover:underline">
              Why Track Emotional Wellbeing as a Lifestyle Signal?
            </a>
          </li>
          <li>
            <a href="#five-pillars" className="hover:underline">
              The Five Pillars: Mood, Energy, Connection, Purpose, and Stress
            </a>
          </li>
          <li>
            <a href="#status-labels" className="hover:underline">
              Understanding â€œFlourishing,â€ â€œSteady,â€ and â€œSupport Neededâ€
            </a>
          </li>
          <li>
            <a href="#using-results" className="hover:underline">
              How to Use Results for Reflection, Not Self-Judgment
            </a>
          </li>
          <li>
            <a href="#bringing-to-support" className="hover:underline">
              Bringing This Tracker Into Therapy or Support Conversations
            </a>
          </li>
        </ul>

        <hr />

        <h2 id="why-track-emotions" className="text-2xl font-bold text-foreground pt-6" itemProp="articleSection">
          Why Track Emotional Wellbeing as a Lifestyle Signal?
        </h2>
        <p>
          Emotional states naturally ebb and flow. Rather than labeling those shifts as â€œgoodâ€ or â€œbad,â€ a tracker like
          this simply helps you see patterns more clearlyâ€”such as when long days, disrupted sleep, or isolation start to
          stack up.
        </p>
        <p>
          Used kindly, this information can support decisions about rest, boundaries, connection, and professional
          support, without turning your inner life into a scorecard.
        </p>

        <h2 id="five-pillars" className="text-2xl font-bold text-foreground pt-6" itemProp="articleSection">
          The Five Pillars: Mood, Energy, Connection, Purpose, and Stress
        </h2>
        <p>
          The tracker invites you to rate five areas on a simple 1â€“10 scale. None of these numbers are right or wrong;
          they are just one dayâ€™s impression.
        </p>
        <ul className="list-disc ml-6 space-y-1">
          <li>
            <strong>Mood</strong> â€“ how your emotional tone feels overall today.
          </li>
          <li>
            <strong>Energy</strong> â€“ how resourced or depleted your body and mind feel.
          </li>
          <li>
            <strong>Connection</strong> â€“ your sense of being supported, seen, or accompanied.
          </li>
          <li>
            <strong>Purpose</strong> â€“ how connected you feel to things that matter to you.
          </li>
          <li>
            <strong>Stress</strong> â€“ how full or overwhelmed this moment in time feels.
          </li>
        </ul>
        <p>
          Looking at these side by side often reveals which small lever might be easiest to support nextâ€”maybe checking
          in with a friend, lightening a commitment, or revisiting something meaningful to you.
        </p>

        <h2 id="status-labels" className="text-2xl font-bold text-foreground pt-6" itemProp="articleSection">
          Understanding â€œFlourishing,â€ â€œSteady,â€ and â€œSupport Neededâ€
        </h2>
        <p>
          Status labels in this tracker summarize your entries but are not diagnoses. â€œFlourishingâ€ usually means your
          ratings suggest a relatively supportive moment. â€œSteadyâ€ reflects a mixed or middle space. â€œSupport neededâ€
          can be a gentle cue to invite extra care, support, or rest into your week.
        </p>
        <p>
          If you consistently see â€œsupport needed,â€ or if you feel worried about your wellbeing, those patterns can be a
          helpful starting point for conversations with a trusted person or a licensed professional.
        </p>

        <h2 id="using-results" className="text-2xl font-bold text-foreground pt-6" itemProp="articleSection">
          How to Use Results for Reflection, Not Self-Judgment
        </h2>
        <p>
          It can be tempting to treat every number as an evaluation of how well you are â€œcoping.â€ The intention here is
          different: to give you language and structure so you can care for yourself with more information and less
          guesswork.
        </p>
        <p>
          You might use results to choose one tiny experimentâ€”like a wind-down ritual, a walk with a friend, or an
          honest boundaries conversationâ€”rather than trying to overhaul everything at once.
        </p>

        <h2 id="bringing-to-support" className="text-2xl font-bold text-foreground pt-6" itemProp="articleSection">
          Bringing This Tracker Into Therapy or Support Conversations
        </h2>
        <p>
          If you already work with a therapist, coach, or other support, you can share patterns from this tracker to
          ground your conversations in concrete observations. Trends in stress, connection, or purpose scores can help
          you both see where life has been especially heavy or where something positive is emerging.
        </p>
        <p>
          Remember that this tool cannot replace professional care. It simply offers one more way to check in with
          yourself and bring your lived experience into spaces designed to support you.
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
            This wellness tracker turns your mood, energy, connection, purpose, and stress check-ins into one simple
            view of how things feel for you right now.
          </p>
          <p>
            You are always in charge of how you use the insights: they are meant to support small, compassionate
            experiments, not to label or diagnose you.
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
            not a medical, psychological, or crisis assessment. If you are struggling or in distress, please reach out
            to a qualified professional or local support service right away.
          </p>
        </CardContent>
      </Card>
    </div>
  );
}




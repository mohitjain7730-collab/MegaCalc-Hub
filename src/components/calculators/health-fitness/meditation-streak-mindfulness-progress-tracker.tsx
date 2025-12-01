'use client';

import { useState } from 'react';
import Script from 'next/script';
import Link from 'next/link';
import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import { z } from 'zod';
import { Flame, CalendarHeart, HeartPulse, Shield, Target, Activity } from 'lucide-react';

import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Form, FormControl, FormField, FormItem, FormLabel, FormMessage } from '@/components/ui/form';
import { Input } from '@/components/ui/input';

const formSchema = z.object({
  streakDays: z.number({ invalid_type_error: 'Enter streak length' }).min(0).max(365),
  avgMinutes: z.number({ invalid_type_error: 'Enter average minutes' }).min(0).max(240),
  qualityScore: z.number({ invalid_type_error: 'Enter quality score' }).min(1).max(5),
  mindfulMoments: z.number({ invalid_type_error: 'Enter mindful check-ins per day' }).min(0).max(20),
  stressScale: z.number({ invalid_type_error: 'Enter stress rating' }).min(1).max(10),
});

type FormValues = z.infer<typeof formSchema>;

type ResultPayload = {
  momentumScore: number;
  balanceIndex: number;
  status: 'thriving' | 'steady' | 'restart gently';
  interpretation: string;
  recommendations: string[];
  plan: { label: string; detail: string }[];
};

const steps = [
  'Enter your current meditation streak length (0 if restarting).',
  'Log the average minutes per session this week.',
  'Score quality from 1 (mind wandering) to 5 (deep presence).',
  'Count mindful check-ins during the day (breath resets, body scans).',
  'Rate stress on a 1–10 scale; the tracker will show if mindfulness offsets it.',
];

const faqs = [
  { question: 'What counts as a mindful check-in?', answer: '30–90 second pauses to breathe, feel sensations, or label thoughts between tasks.' },
  { question: 'Do I need to meditate daily?', answer: 'A streak helps build identity, but intentional rest days are fine—log zero minutes honestly.' },
  { question: 'How is quality scored?', answer: 'Use subjective feel: 1 = distracted, 3 = mostly present, 5 = deeply aware/compassionate.' },
  { question: 'Can I include yoga nidra or breathwork?', answer: 'Yes, as long as the intention is mindfulness, not just relaxation.' },
  { question: 'What if my streak resets?', answer: 'The tracker will shift to “restart gently” and prioritize shorter sessions + mindful moments.' },
  { question: 'How do I raise the balance index?', answer: 'Pair daily sits with micro-check-ins and supportive sleep so stress drops faster.' },
  { question: 'Is journaling part of this?', answer: 'Journaling after sessions helps integrate insights—log it under mindful moments if helpful.' },
  { question: 'Can teams use this?', answer: 'Yes—collect anonymized scores to support workplace mindfulness challenges.' },
  { question: 'Does caffeine or alcohol affect scores?', answer: 'Track them separately; noticeable spikes in stress will show up in the index.' },
  { question: 'How soon will I notice benefits?', answer: 'Most consistent practitioners feel calmer within 10–14 days of steady streaks.' },
];

const relatedCalculators = [
  { name: 'Reaction Time Improvement Tracker', slug: 'reaction-time-improvement-tracker', description: 'See how mindfulness streaks improve neural sharpness.' },
  { name: 'Stress Hormone Balance Calculator', slug: 'stress-hormone-balance-calculator', description: 'Track cortisol vs melatonin alongside meditation.' },
  { name: 'Emotional Wellbeing Index Calculator', slug: 'emotional-wellbeing-index-calculator', description: 'Check mood trends as your streak grows.' },
  { name: 'Memory Retention Percentage Calculator', slug: 'memory-retention-percentage-calculator', description: 'Mindfulness can boost study retention—monitor both.' },
];

const baseUrl = 'https://mycalculating.com/category/health-fitness/meditation-streak-mindfulness-progress-tracker';

const schemaMarkup = {
  '@context': 'https://schema.org',
  '@graph': [
    {
      '@type': 'BreadcrumbList',
      itemListElement: [
        { '@type': 'ListItem', position: 1, name: 'Home', item: 'https://mycalculating.com' },
        { '@type': 'ListItem', position: 2, name: 'Health & Fitness', item: 'https://mycalculating.com/category/health-fitness' },
        { '@type': 'ListItem', position: 3, name: 'Meditation Streak Mindfulness Progress Tracker', item: baseUrl },
      ],
    },
    {
      '@type': 'SoftwareApplication',
      name: 'Meditation Streak Mindfulness Progress Tracker',
      applicationCategory: 'Calculator',
      operatingSystem: 'Web Browser',
      description: 'Score mindfulness streak momentum, balance index, and stress offset.',
      url: baseUrl,
      offers: { '@type': 'Offer', price: '0', priceCurrency: 'USD' },
    },
  ],
};

const clamp = (value: number, min: number, max: number) => Math.min(max, Math.max(min, value));

const calculateResult = (values: FormValues): ResultPayload => {
  const streakFactor = Math.min(values.streakDays / 30, 1);
  const timeFactor = clamp(values.avgMinutes / 20, 0, 1);
  const qualityFactor = clamp(values.qualityScore / 5, 0, 1);
  const mindfulFactor = clamp(values.mindfulMoments / 6, 0, 1);
  const stressRelief = clamp((10 - values.stressScale) / 10, 0, 1);

  const momentumScore = Math.round((streakFactor * 30 + timeFactor * 25 + qualityFactor * 25 + mindfulFactor * 20));
  const balanceIndex = Math.round((momentumScore / 100) * 70 + stressRelief * 30);

  let status: ResultPayload['status'] = 'thriving';
  let interpretation =
    'Your entries suggest that your current mindfulness rhythm is feeling supportive overall. You can keep honoring the small practices that already help you.';

  if (momentumScore < 65) {
    status = 'steady';
    interpretation =
      'You have a solid base of practice showing up here. On fuller days, a few short, gentle pauses might feel easier to maintain than longer sits.';
  }
  if (momentumScore < 40) {
    status = 'restart gently';
    interpretation =
      'It looks like practice has been lighter or more on‑and‑off lately. You might choose very small, kind moments of mindfulness as a way back in, if and when you feel ready.';
  }

  const recommendations = [
    'If it feels helpful, you can anchor a short pause or sit to something you already do, like morning coffee or winding down at night.',
    'Gentle reminders—digital or on paper—can support you in noticing a few mindful check‑ins across the day.',
    'On busier days, it is completely okay to lean on very short practices instead of trying to fit in a long session.',
  ];
  if (status === 'steady') {
    recommendations.push('You might enjoy occasionally exploring different styles such as a brief body scan or a loving‑kindness practice.');
  }
  if (status === 'restart gently') {
    recommendations.push('Some people like to pair a few mindful breaths with a short, non‑judgmental journaling note to reconnect with the practice.');
  }

  const plan = [
    { label: 'Daily cue', detail: 'Pause for a few slow breaths before opening email or messaging apps, if that feels supportive.' },
    { label: 'Midweek pause', detail: 'On one day midweek, you might explore a slightly longer sit or a quiet walk, depending on your energy.' },
    { label: 'Weekly reflection', detail: 'Once a week, gently notice one small way your practice showed up and one thing you are curious to try next.' },
  ];

  return { momentumScore, balanceIndex, status, interpretation, recommendations, plan };
};

export default function MeditationStreakMindfulnessProgressTracker() {
  const [result, setResult] = useState<ResultPayload | null>(null);

  const form = useForm<FormValues>({
    resolver: zodResolver(formSchema),
    defaultValues: {
      streakDays: undefined,
      avgMinutes: undefined,
      qualityScore: undefined,
      mindfulMoments: undefined,
      stressScale: undefined,
    },
  });

  return (
    <div className="space-y-8">
      <Script id="meditation-streak-schema" type="application/ld+json" strategy="afterInteractive" dangerouslySetInnerHTML={{ __html: JSON.stringify(schemaMarkup) }} />

      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <HeartPulse className="h-5 w-5" />
            Meditation Streak Mindfulness Progress Tracker
          </CardTitle>
          <CardDescription>Understand streak momentum, mindfulness coverage, and stress relief at a glance.</CardDescription>
        </CardHeader>
      </Card>

      <Card>
        <CardHeader>
          <CardTitle>Input your routine</CardTitle>
        </CardHeader>
        <CardContent>
          <Form {...form}>
            <form onSubmit={form.handleSubmit((values) => setResult(calculateResult(values)))} className="space-y-6">
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <FormField
                  control={form.control}
                  name="streakDays"
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel>Current streak (days)</FormLabel>
                      <FormControl>
                        <Input type="number" step="1" placeholder="e.g., 12" value={field.value ?? ''} onChange={(e) => field.onChange(e.target.value === '' ? undefined : Number(e.target.value))} />
                      </FormControl>
                      <FormMessage />
                    </FormItem>
                  )}
                />
                <FormField
                  control={form.control}
                  name="avgMinutes"
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel>Average minutes per session</FormLabel>
                      <FormControl>
                        <Input type="number" step="1" placeholder="e.g., 15" value={field.value ?? ''} onChange={(e) => field.onChange(e.target.value === '' ? undefined : Number(e.target.value))} />
                      </FormControl>
                      <FormMessage />
                    </FormItem>
                  )}
                />
                <FormField
                  control={form.control}
                  name="qualityScore"
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel>Session quality (1-5)</FormLabel>
                      <FormControl>
                        <Input type="number" step="1" placeholder="e.g., 4" value={field.value ?? ''} onChange={(e) => field.onChange(e.target.value === '' ? undefined : Number(e.target.value))} />
                      </FormControl>
                      <FormMessage />
                    </FormItem>
                  )}
                />
                <FormField
                  control={form.control}
                  name="mindfulMoments"
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel>Mindful check-ins per day</FormLabel>
                      <FormControl>
                        <Input type="number" step="1" placeholder="e.g., 3" value={field.value ?? ''} onChange={(e) => field.onChange(e.target.value === '' ? undefined : Number(e.target.value))} />
                      </FormControl>
                      <FormMessage />
                    </FormItem>
                  )}
                />
                <FormField
                  control={form.control}
                  name="stressScale"
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel>Stress level (1-10)</FormLabel>
                      <FormControl>
                        <Input type="number" step="1" placeholder="e.g., 6" value={field.value ?? ''} onChange={(e) => field.onChange(e.target.value === '' ? undefined : Number(e.target.value))} />
                      </FormControl>
                      <FormMessage />
                    </FormItem>
                  )}
                />
              </div>
              <Button type="submit" className="w-full md:w-auto">
                Track mindfulness
              </Button>
            </form>
          </Form>
        </CardContent>
      </Card>

      {result && (
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <Flame className="h-5 w-5 text-primary" />
              Interactive results
            </CardTitle>
            <CardDescription>See streak momentum, balance index, and guidance.</CardDescription>
          </CardHeader>
          <CardContent className="space-y-6">
            <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
              <div className="p-4 border rounded">
                <p className="text-sm text-muted-foreground">Momentum score</p>
                <p className="text-2xl font-semibold text-primary">{result.momentumScore}</p>
                <p className="text-xs text-muted-foreground">A simple sense of how your current streak, minutes, and quality fit together.</p>
              </div>
              <div className="p-4 border rounded">
                <p className="text-sm text-muted-foreground">Balance index</p>
                <p className="text-2xl font-semibold text-primary">{result.balanceIndex}</p>
                <p className="text-xs text-muted-foreground">Shows how your practice pattern and stress rating are lining up right now.</p>
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
                  <CardTitle className="text-base flex items-center gap-2"><Target className="h-4 w-4" />Recommendations</CardTitle>
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
                  <CardTitle className="text-base flex items-center gap-2"><Activity className="h-4 w-4" />Action plan</CardTitle>
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
          <p><strong>Momentum score</strong> = streakFactor×30 + timeFactor×25 + qualityFactor×25 + mindfulFactor×20.</p>
          <p><strong>Balance index</strong> = momentumScore×0.7 + stressRelief×30.</p>
          <p>stressRelief = clamp((10 − stressScale) ÷ 10)</p>
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
          <CardTitle>Additional metrics</CardTitle>
        </CardHeader>
        <CardContent>
          {result ? (
            <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
              <div className="p-4 border rounded">
                <p className="text-sm text-muted-foreground">Streak to 30 days</p>
                <p className="text-xl font-semibold text-primary">{Math.max(0, 30 - (form.getValues().streakDays ?? 0))} days</p>
                <p className="text-xs text-muted-foreground">You can treat 30‑day stretches as gentle milestones if that feels motivating.</p>
              </div>
              <div className="p-4 border rounded">
                <p className="text-sm text-muted-foreground">Daily mindful coverage</p>
                <p className="text-xl font-semibold text-primary">
                  {Math.min(100, ((form.getValues().mindfulMoments ?? 0) / 6) * 100).toFixed(0)}%
                </p>
                <p className="text-xs text-muted-foreground">You can play with how many tiny check‑ins feel natural for you on a typical day.</p>
              </div>
              <div className="p-4 border rounded">
                <p className="text-sm text-muted-foreground">Stress relief gap</p>
                <p className="text-xl font-semibold text-primary">
                  {(form.getValues().stressScale ?? 0) - 3} pts above calm target
                </p>
                <p className="text-xs text-muted-foreground">A rough sense of how your current stress rating compares with a calmer day for you.</p>
              </div>
            </div>
          ) : (
            <p className="text-sm text-muted-foreground">Submit data to see streak gaps, coverage, and stress deltas.</p>
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
          <p>Mindfulness sticks when streaks are forgiving, sessions are flexible, and micro check-ins support you all day.</p>
          <p>Use this tracker to mix long sits with short pauses, celebrate every streak milestone, and nudge stress down gradually.</p>
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
            <Shield className="h-5 w-5" />
            Summary
          </CardTitle>
        </CardHeader>
        <CardContent className="space-y-2 text-sm text-muted-foreground">
          <p>This tracker brings together streak length, session time, check‑ins, and your own stress rating into a single view of how your mindfulness habit feels right now.</p>
          <p>You can use the numbers and suggestions as gentle prompts, adjusting or ignoring anything that doesn’t fit your life or intentions for practice.</p>
        </CardContent>
      </Card>

      <p className="mt-6 text-xs text-muted-foreground text-center">
        Disclaimer: This tool provides general wellness and lifestyle insights for educational purposes only. It is not a
        medical or psychological diagnosis. For any health concerns, please consult a qualified professional.
      </p>

    </div>
  );
}



'use client';

import { useState } from 'react';
import Script from 'next/script';
import Link from 'next/link';
import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import { z } from 'zod';
import { Sunrise, Moon, Activity, Droplets, ShieldCheck } from 'lucide-react';

import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Form, FormControl, FormField, FormItem, FormLabel, FormMessage } from '@/components/ui/form';
import { Input } from '@/components/ui/input';

const formSchema = z.object({
  wakeCortisolScore: z.number({ invalid_type_error: 'Enter wake cortisol score' }).min(1).max(10),
  eveningMelatoninScore: z.number({ invalid_type_error: 'Enter evening melatonin score' }).min(1).max(10),
  bedtimeHour: z.number({ invalid_type_error: 'Enter bedtime (24h)' }).min(18).max(30),
  wakeHour: z.number({ invalid_type_error: 'Enter wake time (24h)' }).min(3).max(12),
  perceivedStress: z.number({ invalid_type_error: 'Enter stress rating' }).min(1).max(10),
});

type FormValues = z.infer<typeof formSchema>;

type ResultPayload = {
  balanceIndex: number;
  circadianScore: number;
  status: 'balanced' | 'monitor' | 'misaligned';
  interpretation: string;
  recommendations: string[];
  plan: { label: string; detail: string }[];
};

const steps = [
  'Rate your wake-up energy (cortisol) from 1 (groggy) to 10 (alert, calm).',
  'Rate evening sleepiness/melatonin from 1 (wired) to 10 (sleepy, relaxed).',
  'Enter typical bedtime/wake-time using 24h clock (use 24â€“30 for post-midnight).',
  'Log perceived stress (1â€“10).',
  'Review the balance index and follow the plan to realign your rhythm.',
];

const faqs = [
  { question: 'Do I need lab tests for this?', answer: 'No. These scores are subjective cues to guide lifestyle tweaks. Use labs under medical supervision when needed.' },
  { question: 'How often should I track?', answer: 'Daily for a week to spot patterns, then weekly when rhythms feel steady.' },
  { question: 'What if Iâ€™m a shift worker?', answer: 'Enter sleep/wake in your actual schedule; focus on consistent light cues after your wake time.' },
  { question: 'Does caffeine matter?', answer: 'Yesâ€”late caffeine lowers melatonin. Track it in your notes to interpret low evening scores.' },
  { question: 'Why include stress?', answer: 'Chronic stress elevates cortisol at night, hurting sleep. Lower stress raises the balance index.' },
  { question: 'Whatâ€™s a good balance score?', answer: '80+ is great. 60â€“79 needs monitoring. Below 60 suggests deeper misalignment.' },
  { question: 'Can exercise timing help?', answer: 'Morning or afternoon workouts support balance. Very late high-intensity sessions may suppress melatonin.' },
  { question: 'Should I use blue-light blockers?', answer: 'They help if you cannot dim screens at night. Combine them with warm lighting.' },
  { question: 'How long until I feel better?', answer: 'Many people notice calmer evenings and easier mornings within 7â€“10 consistent days.' },
  { question: 'Is this medical advice?', answer: 'No. It is an awareness tool onlyâ€”consult healthcare professionals for treatment.' },
];

const relatedCalculators = [
  { name: 'Meditation Streak Mindfulness Tracker', slug: 'meditation-streak-mindfulness-progress-tracker', description: 'Pair meditation streaks with hormone tracking to tame stress.' },
  { name: 'Reaction Time Improvement Tracker', slug: 'reaction-time-improvement-tracker', description: 'See how aligned hormones speed up neural performance.' },
  { name: 'Emotional Wellbeing Index Calculator', slug: 'emotional-wellbeing-index-calculator', description: 'Track mood shifts as your rhythm stabilizes.' },
  { name: 'Memory Retention Percentage Calculator', slug: 'memory-retention-percentage-calculator', description: 'Balanced sleep hormones boost retention.' },
];

const baseUrl = 'https://mycalculating.com/health-fitness/stress-hormone-balance-calculator';

const schemaMarkup = {
  '@context': 'https://schema.org',
  '@graph': [
    {
      '@type': 'BreadcrumbList',
      itemListElement: [
        { '@type': 'ListItem', position: 1, name: 'Home', item: 'https://mycalculating.com' },
        { '@type': 'ListItem', position: 2, name: 'Health & Fitness', item: 'https://mycalculating.com/health-fitness' },
        { '@type': 'ListItem', position: 3, name: 'Stress Hormone Balance Calculator', item: baseUrl },
      ],
    },
    {
      '@type': 'SoftwareApplication',
      name: 'Stress Hormone Balance Calculator',
      applicationCategory: 'Calculator',
      operatingSystem: 'Web Browser',
      description: 'Estimate cortisol vs melatonin alignment and get circadian recommendations.',
      url: baseUrl,
      offers: { '@type': 'Offer', price: '0', priceCurrency: 'USD' },
    },
  ],
};

const normalizeHour = (hour: number) => {
  if (hour >= 24) return hour - 24;
  if (hour < 0) return hour + 24;
  return hour;
};

const clamp = (value: number, min: number, max: number) => Math.min(max, Math.max(min, value));

const calculateResult = (values: FormValues): ResultPayload => {
  const bedtime = normalizeHour(values.bedtimeHour);
  const wake = normalizeHour(values.wakeHour);
  const sleepDuration = wake > bedtime ? wake - bedtime : wake + (24 - bedtime);
  const circadianScore = clamp((values.eveningMelatoninScore * 8 + (10 - Math.abs(22 - bedtime)) * 2 + sleepDuration * 3) / 1.5, 0, 100);
  const balanceIndex = clamp(((values.wakeCortisolScore * 10 + values.eveningMelatoninScore * 12) / 2 - values.perceivedStress * 3) + circadianScore * 0.3, 0, 100);

  let status: ResultPayload['status'] = 'balanced';
  let interpretation =
    'Your entries suggest that, overall, your morning and evening cues are working reasonably well together for you right now.';

  if (balanceIndex < 80) {
    status = 'monitor';
    interpretation =
      'This pattern hints that there may be a bit of drift between your energy, light, and windâ€‘down habits. Gentle tweaks to light, meals, or unwind time might feel supportive.';
  }
  if (balanceIndex < 60) {
    status = 'misaligned';
    interpretation =
      'These entries suggest your days and evenings may currently feel a little out of sync. Small experiments with steadier sleep windows and calmer evenings could be worth trying if youâ€™d like.';
  }

  const recommendations = [
    'When possible, let some natural light reach your eyes not too long after you wake up.',
    'Some people find it helpful to keep stimulating drinks earlier in the day so evenings feel more restful.',
    'Softening lights and screens before bedâ€”with warmer light or lower brightnessâ€”can make nighttime feel gentler.',
  ];
  if (status !== 'balanced') {
    recommendations.push('You might explore calming evening rituals such as gentle stretching, relaxed breathing, or lowâ€‘key journaling.');
  }
  if (status === 'misaligned') {
    recommendations.push('If life allows, you could try keeping a similar sleep and wake window for a little while and see how that feels.');
  }

  const plan = [
    { label: 'Morning anchor', detail: 'Sunlight + 5 minutes of movement prior to checking notifications.' },
    { label: 'Midday check', detail: 'Hydrate, eat protein, and take 3 calming breaths to prevent late cortisol spikes.' },
    { label: 'Evening ritual', detail: 'Create a tech-free buffer with warm light, stretching, and gratitude journaling.' },
  ];

  return { balanceIndex, circadianScore, status, interpretation, recommendations, plan };
};

export default function StressHormoneBalanceCalculator() {
  const [result, setResult] = useState<ResultPayload | null>(null);

  const form = useForm<FormValues>({
    resolver: zodResolver(formSchema),
    defaultValues: {
      wakeCortisolScore: undefined,
      eveningMelatoninScore: undefined,
      bedtimeHour: undefined,
      wakeHour: undefined,
      perceivedStress: undefined,
    },
  });

  return (
    <div className="space-y-8">
      <Script id="stress-hormone-schema" type="application/ld+json" strategy="afterInteractive" dangerouslySetInnerHTML={{ __html: JSON.stringify(schemaMarkup) }} />

      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <Sunrise className="h-5 w-5" />
            Stress Hormone Balance Calculator
          </CardTitle>
          <CardDescription>Compare subjective cortisol vs melatonin cues and tune your circadian rhythm.</CardDescription>
        </CardHeader>
      </Card>

      <Card>
        <CardHeader>
          <CardTitle>Input your cues</CardTitle>
        </CardHeader>
        <CardContent>
          <Form {...form}>
            <form onSubmit={form.handleSubmit((values) => setResult(calculateResult(values)))} className="space-y-6">
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <FormField
                  control={form.control}
                  name="wakeCortisolScore"
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel>Wake energy (1-10)</FormLabel>
                      <FormControl>
                        <Input type="number" step="1" placeholder="e.g., 7" value={field.value ?? ''} onChange={(e) => field.onChange(e.target.value === '' ? undefined : Number(e.target.value))} />
                      </FormControl>
                      <FormMessage />
                    </FormItem>
                  )}
                />
                <FormField
                  control={form.control}
                  name="eveningMelatoninScore"
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel>Evening sleepiness (1-10)</FormLabel>
                      <FormControl>
                        <Input type="number" step="1" placeholder="e.g., 8" value={field.value ?? ''} onChange={(e) => field.onChange(e.target.value === '' ? undefined : Number(e.target.value))} />
                      </FormControl>
                      <FormMessage />
                    </FormItem>
                  )}
                />
                <FormField
                  control={form.control}
                  name="bedtimeHour"
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel>Bedtime (24h, use 24-30 after midnight)</FormLabel>
                      <FormControl>
                        <Input type="number" step="0.5" placeholder="e.g., 23.5" value={field.value ?? ''} onChange={(e) => field.onChange(e.target.value === '' ? undefined : Number(e.target.value))} />
                      </FormControl>
                      <FormMessage />
                    </FormItem>
                  )}
                />
                <FormField
                  control={form.control}
                  name="wakeHour"
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel>Wake time (24h)</FormLabel>
                      <FormControl>
                        <Input type="number" step="0.5" placeholder="e.g., 6.5" value={field.value ?? ''} onChange={(e) => field.onChange(e.target.value === '' ? undefined : Number(e.target.value))} />
                      </FormControl>
                      <FormMessage />
                    </FormItem>
                  )}
                />
                <FormField
                  control={form.control}
                  name="perceivedStress"
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel>Perceived stress (1-10)</FormLabel>
                      <FormControl>
                        <Input type="number" step="1" placeholder="e.g., 5" value={field.value ?? ''} onChange={(e) => field.onChange(e.target.value === '' ? undefined : Number(e.target.value))} />
                      </FormControl>
                      <FormMessage />
                    </FormItem>
                  )}
                />
              </div>
              <Button type="submit" className="w-full md:w-auto">
                Assess balance
              </Button>
            </form>
          </Form>
        </CardContent>
      </Card>

      {result && (
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <Activity className="h-5 w-5 text-primary" />
              Interactive results
            </CardTitle>
            <CardDescription>Hormone balance index, circadian score, and tailored actions.</CardDescription>
          </CardHeader>
          <CardContent className="space-y-6">
            <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
              <div className="p-4 border rounded">
                <p className="text-sm text-muted-foreground">Balance index</p>
                <p className="text-2xl font-semibold text-primary">{result.balanceIndex.toFixed(0)}</p>
                <p className="text-xs text-muted-foreground">A simple combined view of your wake/bed cues, stress rating, and timing pattern.</p>
              </div>
              <div className="p-4 border rounded">
                <p className="text-sm text-muted-foreground">Circadian score</p>
                <p className="text-2xl font-semibold text-primary">{result.circadianScore.toFixed(0)}</p>
                <p className="text-xs text-muted-foreground">Reflects how your usual sleep window and light cues line up with each other.</p>
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
                  <CardTitle className="text-base flex items-center gap-2"><Droplets className="h-4 w-4" />Recommendations</CardTitle>
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
                  <CardTitle className="text-base flex items-center gap-2"><ShieldCheck className="h-4 w-4" />Action plan</CardTitle>
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
          <p><strong>Balance index</strong> â‰ˆ (wakeCortisol Ã— 10 + melatonin Ã— 12)/2 âˆ’ perceivedStress Ã— 3 + circadianScore Ã— 0.3.</p>
          <p><strong>Circadian score</strong> rewards earlier bedtimes, 7â€“9 hour sleep windows, and strong melatonin cues.</p>
          <p>All values are clamped between 0 and 100.</p>
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
                <p className="text-sm text-muted-foreground">Sleep duration</p>
                <p className="text-xl font-semibold text-primary">
                  {(() => {
                    const bedtime = normalizeHour(form.getValues().bedtimeHour ?? 22);
                    const wake = normalizeHour(form.getValues().wakeHour ?? 6);
                    const duration = wake > bedtime ? wake - bedtime : wake + (24 - bedtime);
                    return duration.toFixed(1);
                  })()} hrs
                </p>
                <p className="text-xs text-muted-foreground">Many people feel better with roughly 7â€“9 hours, but your experience matters most.</p>
              </div>
              <div className="p-4 border rounded">
                <p className="text-sm text-muted-foreground">Wake energy gap</p>
                <p className="text-xl font-semibold text-primary">{(8 - (form.getValues().wakeCortisolScore ?? 0)).toFixed(1)}</p>
                <p className="text-xs text-muted-foreground">A rough sense of how your current wake feeling compares with a more energized morning for you.</p>
              </div>
              <div className="p-4 border rounded">
                <p className="text-sm text-muted-foreground">Stress buffer</p>
                <p className="text-xl font-semibold text-primary">{(10 - (form.getValues().perceivedStress ?? 0)) * 10}%</p>
                <p className="text-xs text-muted-foreground">Shows how your stress rating today compares with a calmer day on your own scale.</p>
              </div>
            </div>
          ) : (
            <p	className="text-sm text-muted-foreground">Enter your cues to see sleep, energy, and stress gaps.</p>
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

      <Card>
        <CardHeader>
          <CardTitle>Complete guide snapshot</CardTitle>
        </CardHeader>
        <CardContent className="prose prose-sm dark:prose-invert max-w-none">
          <p>Morning sunlight, consistent meals, mindful pauses, and dark evenings keep cortisol and melatonin in sync.</p>
          <p>Use this tracker nightly to correlate habits with your energy and sleep quality.</p>
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
          <p>This tool blends your own ratings of wake energy, evening sleepiness, sleep timing, and stress into a simple rhythm snapshot.</p>
          <p>You can use the outputs as gentle prompts for experimenting with light, sleep, and unwind habits that feel realistic and kind to you.</p>
        </CardContent>
      </Card>

      <p className="mt-6 text-xs text-muted-foreground text-center">
        Disclaimer: This tool provides general wellness and lifestyle insights for educational purposes only. It is not a
        medical or psychological diagnosis. For any health concerns, please consult a qualified professional.
      </p>
    </div>
  );
}




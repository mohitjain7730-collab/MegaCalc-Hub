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
  'Assign honest 1–10 scores for mood, energy, connection, purpose, and stress.',
  'Keep inputs blank-free so the tool can calculate indices properly.',
  'Submit to see wellbeing vs stress balance plus resilience capacity.',
  'Review recommendations and plan items to boost the lowest levers.',
  'Repeat weekly to watch trends and bring data to therapists or coaches.',
];

const faqs = [
  { question: 'Is this a diagnostic mental health test?', answer: 'No. It is an awareness snapshot to spark reflection and conversations with licensed professionals if needed.' },
  { question: 'How often should I track?', answer: 'Weekly tracking shows patterns. Log more frequently during stressful seasons for tighter feedback.' },
  { question: 'What is a good wellbeing index?', answer: 'Scores ≥75 indicate flourishing. 55–74 is steady. Below 55 suggests you should prioritize more support.' },
  { question: 'Why include purpose?', answer: 'Purpose buffers stress and fuels motivation. Tracking it highlights when you need more meaningful activities.' },
  { question: 'Can I use this with my therapist?', answer: 'Yes—export or share your scores and notes to guide sessions with objective data.' },
  { question: 'Does stress automatically lower the score?', answer: 'Yes. Higher stress subtracts from wellbeing and resilience so you can see how rest and boundaries help.' },
  { question: 'What if I experience extreme swings?', answer: 'Use the notes area outside this tool to record context, then seek professional care for persistent swings.' },
  { question: 'Can teams use it?', answer: 'Teams can collect anonymized averages to plan wellness initiatives or decompressing rituals.' },
  { question: 'How do I improve the connection score?', answer: 'Schedule intentional touchpoints (calls, co-working, shared meals) and reduce doomscrolling replacements.' },
  { question: 'Does sleep matter?', answer: 'Absolutely. Poor sleep drags energy, mood, and stress. Pair this tool with a sleep tracker for clarity.' },
];

const relatedCalculators = [
  { name: 'Meditation Streak Mindfulness Progress Tracker', slug: 'meditation-streak-mindfulness-progress-tracker', description: 'See how consistency in mindfulness shifts mood and stress.' },
  { name: 'Stress Hormone Balance Calculator', slug: 'stress-hormone-balance-calculator', description: 'Align cortisol vs melatonin to protect calm evenings.' },
  { name: 'Memory Retention Percentage Calculator', slug: 'memory-retention-percentage-calculator', description: 'Track learning retention alongside emotional energy.' },
  { name: 'Reaction Time Improvement Tracker', slug: 'reaction-time-improvement-tracker', description: 'Watch cognitive sharpness improve as wellbeing rises.' },
];

const baseUrl = 'https://mycalculating.com/category/health-fitness/emotional-wellbeing-index-calculator';

const schemaMarkup = {
  '@context': 'https://schema.org',
  '@graph': [
    {
      '@type': 'BreadcrumbList',
      itemListElement: [
        { '@type': 'ListItem', position: 1, name: 'Home', item: 'https://mycalculating.com' },
        { '@type': 'ListItem', position: 2, name: 'Health & Fitness', item: 'https://mycalculating.com/category/health-fitness' },
        { '@type': 'ListItem', position: 3, name: 'Emotional Wellbeing Index Calculator', item: baseUrl },
      ],
    },
    {
      '@type': 'SoftwareApplication',
      name: 'Emotional Wellbeing Index Calculator',
      applicationCategory: 'Calculator',
      operatingSystem: 'Web Browser',
      description: 'Blend mood, energy, connection, purpose, and stress inputs into a wellbeing score.',
      url: baseUrl,
      offers: { '@type': 'Offer', price: '0', priceCurrency: 'USD' },
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
      'This pattern looks fairly steady, with a bit of room for extra care. You might gently strengthen one small habit or check‑in that supports you this week.';
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
    recommendations.push('You might consider reaching out to a trusted person or a professional space where you can talk about what’s on your mind.');
  }

  const plan = [
    { label: 'Morning check‑in', detail: 'Gently name one feeling you notice and one small action that could support you today.' },
    { label: 'Midday pause', detail: 'If you remember, take a short moment mid‑day to notice your energy and stress, and see whether a brief breath or stretch might feel good.' },
    { label: 'Evening reflection', detail: 'Before bed, you might jot down a few gratitudes, moments, or lessons from the day—only if it feels helpful, not forced.' },
  ];

  return { wellbeingIndex, resilienceScore, status, interpretation, recommendations, plan };
};

export default function EmotionalWellbeingIndexCalculator() {
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
            Emotional Wellbeing Index Calculator
          </CardTitle>
          <CardDescription>Quick snapshot of mood, energy, relationships, meaning, and stress.</CardDescription>
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
                Calculate wellbeing
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
                <p className="text-xs text-muted-foreground">A simple 0–100 snapshot based on how today’s inputs feel to you.</p>
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
          <p><strong>Wellbeing index</strong> = clamp(((mood + energy + connection + purpose)/4 × 10) − stress × 2).</p>
          <p><strong>Resilience score</strong> = clamp((positiveAverage × 8) − stress × 3 + 20).</p>
          <p>All values are normalized 0–100 for easy trend comparisons.</p>
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
                <p className="text-xs text-muted-foreground">Shows how today’s sense of connection compares with a fuller, more supported day for you.</p>
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
          <p>Emotional wellbeing thrives on predictable rhythms: mindful check-ins, nourishing fuel, honest conversations, and purpose-filled work.</p>
          <p>Use this calculator weekly as the hub for journaling, therapy prep, or digital wellness dashboards.</p>
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
          <p>This tool turns your mood, energy, connection, purpose, and stress check‑ins into a single snapshot of how things feel right now.</p>
          <p>The scores and ideas are there to gently support reflection and small experiments—you can always adjust or ignore anything that doesn’t fit your situation.</p>
        </CardContent>
      </Card>

      <p className="mt-6 text-xs text-muted-foreground text-center">
        Disclaimer: This tool provides general wellness and lifestyle insights for educational purposes only. It is not a
        medical or psychological diagnosis. For any health concerns, please consult a qualified professional.
      </p>
    </div>
  );
}




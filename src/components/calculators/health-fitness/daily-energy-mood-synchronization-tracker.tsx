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
  avgEnergyMorning: z.number({ invalid_type_error: 'Enter morning energy' }).min(0).max(10),
  avgEnergyAfternoon: z.number({ invalid_type_error: 'Enter afternoon energy' }).min(0).max(10),
  avgEnergyEvening: z.number({ invalid_type_error: 'Enter evening energy' }).min(0).max(10),
  avgMoodOverall: z.number({ invalid_type_error: 'Enter overall mood' }).min(0).max(10),
});

type FormValues = z.infer<typeof formSchema>;

type ResultPayload = {
  avgEnergyMorning: number;
  avgEnergyAfternoon: number;
  avgEnergyEvening: number;
  avgMoodOverall: number;
  alignmentScore: number;
  bestWindow: 'morning' | 'afternoon' | 'evening';
  status: 'optimal' | 'good' | 'moderate' | 'low';
  interpretation: string;
  recommendations: string[];
  plan: { label: string; detail: string }[];
};

const steps = [
  'Rate your typical morning energy level (0â€“10) over the last 1â€“2 weeks.',
  'Rate your typical afternoon energy level (0â€“10).',
  'Rate your typical evening energy level (0â€“10).',
  'Rate your overall daily mood (0â€“10), averaging across the day.',
  'Review your alignment score and recommended schedule adjustments.',
];

const faqs = [
  {
    question: 'What does the Daily Energy & Mood Synchronization Tracker measure?',
    answer:
      'It estimates how well your daily mood matches your natural energy curve, helping you align demanding tasks with your best windows and protect low-energy periods.',
  },
  {
    question: 'Why focus on synchronization instead of just mood?',
    answer:
      'Mood often improves when work, rest, and social time match your natural peaks and dips. Misalignmentâ€”such as doing deep work when your energy is lowestâ€”can drag mood down.',
  },
  {
    question: 'How accurate do my ratings need to be?',
    answer:
      'Rough estimates are enough. The tool is designed for pattern spotting rather than clinical diagnosis. You can refine numbers as you observe your days more closely.',
  },
  {
    question: 'Can this help with productivity?',
    answer:
      'Yes. Many people find that shifting deep work to high-energy windows and admin or rest to low-energy windows improves both productivity and emotional stability.',
  },
  {
    question: 'How often should I use the tracker?',
    answer:
      'Weekly or whenever your schedule or sleep patterns change. It is especially useful after travel, new routines, or seasons with more stress.',
  },
  {
    question: 'How is the alignment score calculated?',
    answer:
      'The score rewards good energy spread and strong mood relative to average energy across the day. Large mismatches between energy and mood lower the score.',
  },
  {
    question: 'Can poor synchronization signal burnout risk?',
    answer:
      'If mood is consistently low even when energy is decent, or if energy is depleted across the whole day, it may indicate burnout, sleep debt, or other health issues.',
  },
  {
    question: 'Should I change my schedule immediately based on this?',
    answer:
      'Treat the results as a hypothesis. Make small experiments, observe the impact for 1â€“2 weeks, and adjust. Large changes (like shift work) may require professional guidance.',
  },
  {
    question: 'Can I use this with wearable data?',
    answer:
      'Yes. You can map ratings to objective metrics like HRV, sleep stages, or activity, but the tool itself only requires your subjective experience.',
  },
  {
    question: 'When should I talk to a doctor?',
    answer:
      'If you experience persistent exhaustion, very low mood, or major changes in sleep or appetite, consult a healthcare professional regardless of your alignment score.',
  },
];

const relatedCalculators = [
  {
    name: 'Sleep Consistency Score Calculator',
    slug: 'sleep-consistency-score-calculator',
    description: 'Check whether your sleep timing supports stable energy.',
  },
  {
    name: 'Gratitude & Mood Correlation Tracker',
    slug: 'gratitude-mood-correlation-tracker',
    description: 'See how reflection influences your daily mood curve.',
  },
  {
    name: 'Emotional Burnout Recovery Calculator',
    slug: 'emotional-burnout-recovery-calculator',
    description: 'Estimate burnout severity when energy stays low.',
  },
  {
    name: 'Circadian Rhythm Disruption Risk Calculator',
    slug: 'circadian-rhythm-disruption-risk-calculator',
    description: 'Assess lifestyle factors that disturb your body clock.',
  },
];

const baseUrl = 'https://mycalculating.com/health-fitness/daily-energy-mood-synchronization-tracker';

const schemaMarkup = {
  '@context': 'https://schema.org',
  '@graph': [
    {
      '@type': 'BreadcrumbList',
      itemListElement: [
        { '@type': 'ListItem', position: 1, name: 'Home', item: 'https://mycalculating.com' },
        { '@type': 'ListItem', position: 2, name: 'Health & Fitness', item: 'https://mycalculating.com/health-fitness' },
        { '@type': 'ListItem', position: 3, name: 'Daily Energy & Mood Synchronization Tracker', item: baseUrl },
      ],
    },
    {
      '@type': 'SoftwareApplication',
      name: 'Daily Energy & Mood Synchronization Tracker',
      applicationCategory: 'Calculator',
      operatingSystem: 'Web Browser',
      description: 'Evaluate how well your daily mood aligns with your energy curve across morning, afternoon, and evening.',
      url: baseUrl,
      offers: { '@type': 'Offer', price: '0', priceCurrency: 'USD' },
    },
  ],
};

const clamp = (value: number, min: number, max: number) => Math.min(max, Math.max(min, value));

const calculateResult = (values: FormValues): ResultPayload => {
  const { avgEnergyMorning, avgEnergyAfternoon, avgEnergyEvening, avgMoodOverall } = values;

  const avgEnergy = (avgEnergyMorning + avgEnergyAfternoon + avgEnergyEvening) / 3;
  const moodVsEnergyDiff = Math.abs(avgMoodOverall - avgEnergy);

  const spread = Math.max(avgEnergyMorning, avgEnergyAfternoon, avgEnergyEvening) - Math.min(avgEnergyMorning, avgEnergyAfternoon, avgEnergyEvening);
  const spreadPenalty = clamp(spread / 5, 0, 1); // larger spread = more penalty if mood is flat

  const baseAlignment = clamp(1 - moodVsEnergyDiff / 10, 0, 1); // 0â€“1
  const alignmentScore = clamp((baseAlignment - spreadPenalty * 0.2) * 100, 0, 100);

  const energyArray = [
    { label: 'morning' as const, value: avgEnergyMorning },
    { label: 'afternoon' as const, value: avgEnergyAfternoon },
    { label: 'evening' as const, value: avgEnergyEvening },
  ];
  const bestWindow = energyArray.sort((a, b) => b.value - a.value)[0].label;

  let status: ResultPayload['status'] = 'optimal';
  let interpretation =
    'This suggests a general lifestyle tendency where your mood may feel nicely synchronized with your daily energy pattern. You may find it helpful to keep placing key activities near your natural peaks when that feels supportive.';

  if (alignmentScore < 40) {
    status = 'low';
    interpretation =
      'This suggests a general lifestyle tendency where your mood and energy may sometimes feel a bit out of sync. You might notice pushing during lower-energy windows or finding it harder to enjoy higher-energy times. Gentle schedule experiments may help you notice what feels better. This is a personal insight, not a medical evaluation.';
  } else if (alignmentScore < 60) {
    status = 'moderate';
    interpretation =
      'This suggests a general lifestyle tendency where some parts of your day may feel aligned while others feel flatter or more strained. You may consider trying small shiftsâ€”like moving creative tasks to naturally brighter windows or adding brief breaksâ€”to see what feels best.';
  } else if (alignmentScore < 80) {
    status = 'good';
    interpretation =
      'This suggests a general lifestyle tendency where your day may already feel mostly aligned with your energy. Fine-tuning task placement and short recovery breaks may gently support even smoother days.';
  }

  const recommendations: string[] = [
    'Match deep-focus work to your highest-energy window and reserve low-energy times for admin, rest, or light tasks.',
    'Protect your best window by limiting meetings, notifications, and interruptions where possible.',
    'Use short movement or sunlight breaks to lift energy before important emotional or cognitive tasks.',
  ];

  if (avgEnergyMorning < 4 && avgEnergyEvening > avgEnergyMorning) {
    recommendations.push('If mornings are consistently low, avoid scheduling emotionally heavy conversations or complex problem solving early in the day.');
  }

  if (avgEnergyAfternoon < 4) {
    recommendations.push('Plan a mid-day reset (walk, stretch, light snack) to reduce the afternoon slump before critical tasks.');
  }

  const plan = [
    { label: 'This Week', detail: 'Observe your actual mood and energy at three checkpoints and compare them with your current estimates.' },
    { label: 'This Month', detail: 'Make one schedule adjustmentâ€”such as moving deep work to your best windowâ€”and track changes in mood and output.' },
    { label: 'Ongoing', detail: 'Re-evaluate alignment after major changes (shift work, new job, travel) and adjust routines accordingly.' },
  ];

  return {
    avgEnergyMorning,
    avgEnergyAfternoon,
    avgEnergyEvening,
    avgMoodOverall,
    alignmentScore: Number(alignmentScore.toFixed(1)),
    bestWindow,
    status,
    interpretation,
    recommendations,
    plan,
  };
};

export default function DailyEnergyMoodSynchronizationTracker() {
  const [result, setResult] = useState<ResultPayload | null>(null);

  const form = useForm<FormValues>({
    resolver: zodResolver(formSchema),
    defaultValues: {
      avgEnergyMorning: undefined,
      avgEnergyAfternoon: undefined,
      avgEnergyEvening: undefined,
      avgMoodOverall: undefined,
    },
  });

  return (
    <div className="space-y-8">
      <Script id="daily-energy-mood-sync-schema" type="application/ld+json" strategy="afterInteractive" dangerouslySetInnerHTML={{ __html: JSON.stringify(schemaMarkup) }} />

      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <Activity className="h-5 w-5" />
            Daily Energy & Mood Synchronization Tracker
          </CardTitle>
          <CardDescription>See how well your mood tracks with your morning, afternoon, and evening energy.</CardDescription>
        </CardHeader>
      </Card>

      <Card>
        <CardHeader>
          <CardTitle>Input your daily pattern</CardTitle>
        </CardHeader>
        <CardContent>
          <Form {...form}>
            <form onSubmit={form.handleSubmit((values) => setResult(calculateResult(values)))} className="space-y-6">
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <FormField
                  control={form.control}
                  name="avgEnergyMorning"
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel>Morning energy (0â€“10)</FormLabel>
                      <FormControl>
                        <Input type="number" step="0.5" placeholder="e.g., 4.5" value={field.value ?? ''} onChange={(e) => field.onChange(e.target.value === '' ? undefined : Number(e.target.value))} />
                      </FormControl>
                      <FormMessage />
                    </FormItem>
                  )}
                />
                <FormField
                  control={form.control}
                  name="avgEnergyAfternoon"
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel>Afternoon energy (0â€“10)</FormLabel>
                      <FormControl>
                        <Input type="number" step="0.5" placeholder="e.g., 7" value={field.value ?? ''} onChange={(e) => field.onChange(e.target.value === '' ? undefined : Number(e.target.value))} />
                      </FormControl>
                      <FormMessage />
                    </FormItem>
                  )}
                />
                <FormField
                  control={form.control}
                  name="avgEnergyEvening"
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel>Evening energy (0â€“10)</FormLabel>
                      <FormControl>
                        <Input type="number" step="0.5" placeholder="e.g., 5.5" value={field.value ?? ''} onChange={(e) => field.onChange(e.target.value === '' ? undefined : Number(e.target.value))} />
                      </FormControl>
                      <FormMessage />
                    </FormItem>
                  )}
                />
                <FormField
                  control={form.control}
                  name="avgMoodOverall"
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel>Overall mood (0â€“10)</FormLabel>
                      <FormControl>
                        <Input type="number" step="0.5" placeholder="e.g., 6" value={field.value ?? ''} onChange={(e) => field.onChange(e.target.value === '' ? undefined : Number(e.target.value))} />
                      </FormControl>
                      <FormMessage />
                    </FormItem>
                  )}
                />
              </div>
              <Button type="submit" className="w-full md:w-auto">
                Calculate energyâ€“mood alignment
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
            <CardDescription>See alignment score, best window, and schedule guidance.</CardDescription>
          </CardHeader>
          <CardContent className="space-y-6">
            <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
              <div className="p-4 border rounded">
                <p className="text-sm text-muted-foreground">Alignment score</p>
                <p className="text-2xl font-semibold text-primary">{result.alignmentScore}</p>
                <p className="text-xs text-muted-foreground">0â€“100 scale</p>
              </div>
              <div className="p-4 border rounded">
                <p className="text-sm text-muted-foreground">Best energy window</p>
                <p className="text-2xl font-semibold text-primary capitalize">{result.bestWindow}</p>
                <p className="text-xs text-muted-foreground">Ideal time for demanding tasks</p>
              </div>
              <div className="p-4 border rounded">
                <p className="text-sm text-muted-foreground">Average energy</p>
                <p className="text-2xl font-semibold text-primary">
                  {((result.avgEnergyMorning + result.avgEnergyAfternoon + result.avgEnergyEvening) / 3).toFixed(1)}
                </p>
                <p className="text-xs text-muted-foreground">Across the day</p>
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
            <strong>Average energy</strong> is the mean of morning, afternoon, and evening ratings.
          </p>
          <p>
            <strong>Moodâ€“energy difference</strong> is the absolute gap between overall mood and average energy; larger gaps reduce the alignment score.
          </p>
          <p>
            <strong>Alignment score</strong> scales moodâ€“energy difference and energy spread into a 0â€“100 indicator, where higher values mean better synchronization between how you feel and how much energy you have.
          </p>
          <p>This simplified model is designed for self-reflection and schedule design, not as a medical diagnostic measure.</p>
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
                <p className="text-sm text-muted-foreground">Morning vs evening gap</p>
                <p className="text-xl font-semibold text-primary">
                  {Math.abs(result.avgEnergyMorning - result.avgEnergyEvening).toFixed(1)}
                </p>
                <p className="text-xs text-muted-foreground">Magnitude of shift</p>
              </div>
              <div className="p-4 border rounded">
                <p className="text-sm text-muted-foreground">Highest energy window</p>
                <p className="text-xl font-semibold text-primary capitalize">{result.bestWindow}</p>
                <p className="text-xs text-muted-foreground">Primary deep-work slot</p>
              </div>
              <div className="p-4 border rounded">
                <p className="text-sm text-muted-foreground">Mood vs energy difference</p>
                <p className="text-xl font-semibold text-primary">
                  {Math.abs(
                    result.avgMoodOverall -
                      (result.avgEnergyMorning + result.avgEnergyAfternoon + result.avgEnergyEvening) / 3,
                  ).toFixed(1)}
                </p>
                <p className="text-xs text-muted-foreground">Lower is better</p>
              </div>
            </div>
          ) : (
            <p className="text-sm text-muted-foreground">Fill in your pattern to unlock more metrics.</p>
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

      <section className="space-y-6 text-muted-foreground leading-relaxed bg-white p-6 md:p-10 rounded-lg shadow-lg" itemScope itemType="https://schema.org/MedicalWebPage">
        <meta itemProp="name" content="Daily Energy & Mood Synchronization: Design Your Day Around Your Biology" />
        <meta itemProp="description" content="Learn how to align your schedule with your natural energy and mood rhythms to reduce burnout and increase sustainable focus." />
        <meta itemProp="keywords" content="energy curve, mood tracking, circadian rhythm, chronotype, daily schedule optimization" />
        <meta itemProp="author" content="[Your Site's Health Team]" />
        <meta itemProp="datePublished" content="2025-12-01" />
        <meta itemProp="url" content="/definitive-daily-energy-mood-synchronization-guide" />

        <h1 className="text-3xl md:text-4xl font-extrabold text-foreground mb-4" itemProp="headline">
          Aligning Energy and Mood: A Practical Guide to Designing Your Day
        </h1>
        <p className="text-lg italic text-gray-700">
          Discover why your best ideas rarely happen at 3 PM status meetings and how to reshape your schedule around your real energy and mood rhythms.
        </p>

        <h2 className="text-2xl font-bold text-foreground mt-8 mb-4">Table of Contents: Jump to a Section</h2>
        <ul className="list-disc ml-6 space-y-2 text-blue-600">
          <li><a href="#chronotypes" className="hover:underline">Chronotypes and Individual Differences</a></li>
          <li><a href="#mapping" className="hover:underline">Mapping Your Personal Curve</a></li>
          <li><a href="#scheduling" className="hover:underline">Scheduling Deep Work and Recovery</a></li>
          <li><a href="#micro-adjustments" className="hover:underline">Micro-Adjustments for Real Life</a></li>
          <li><a href="#signals" className="hover:underline">Signals to Revisit Your Plan</a></li>
        </ul>
        <hr />

        <h2 id="chronotypes" className="text-2xl font-bold text-foreground pt-8" itemProp="articleSection">
          Chronotypes and Individual Differences
        </h2>
        <p>
          Some people are naturally earlier or later. Genetics, age, and environment all shape when you feel most alert. Instead of forcing yourself into an idealized routine, start from what your body already tells you.
        </p>

        <h2 id="mapping" className="text-2xl font-bold text-foreground pt-8" itemProp="articleSection">
          Mapping Your Personal Curve
        </h2>
        <p>
          For a week, rate your energy and mood three times per day. Patterns usually emerge quickly: for example, energized mornings but fragile mood after long meetings. Use this data as the baseline for your experiments.
        </p>

        <h2 id="scheduling" className="text-2xl font-bold text-foreground pt-8" itemProp="articleSection">
          Scheduling Deep Work and Recovery
        </h2>
        <p>
          Place high-focus, emotionally demanding, or creative tasks in your best window. Assign admin, email, or routine tasks to lower-energy periods and schedule genuine recovery blocks instead of endless micro-breaks.
        </p>

        <h2 id="micro-adjustments" className="text-2xl font-bold text-foreground pt-8" itemProp="articleSection">
          Micro-Adjustments for Real Life
        </h2>
        <p>
          Not everyone can rebuild their entire calendar. Even then, small changesâ€”moving one meeting, adding a 10-minute walk, shifting bedtime by 20 minutesâ€”can materially change how days feel.
        </p>

        <h2 id="signals" className="text-2xl font-bold text-foreground pt-8" itemProp="articleSection">
          Signals to Revisit Your Plan
        </h2>
        <p>
          Regular exhaustion, irritability, or flat mood are cues to re-check sleep, workload, and alignment. Life seasons change; your schedule should be allowed to evolve with them.
        </p>

        <hr />
        <h2 className="text-2xl font-bold text-foreground pt-8" itemProp="articleSection">
          Conclusion
        </h2>
        <p>
          Aligning energy and mood is less about rigid routines and more about listening, experimenting, and iterating. This tracker helps you translate intuition into a simple, testable plan.
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
            This tool provides general wellness insights about how your daily mood may align with your energy curve. This
            is a personal lifestyle insight, not a medical evaluation.
          </p>
          <p>Outputs include an alignment score, best energy window, status, recommendations, an action plan, and supporting metrics.</p>
          <p>Formula, steps, guide content, related tools, and FAQs make it easy for humans or AI assistants to interpret and act on the results.</p>
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



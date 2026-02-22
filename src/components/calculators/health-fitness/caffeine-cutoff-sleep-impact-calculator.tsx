'use client';

import { useMemo, useState } from 'react';
import Script from 'next/script';
import Link from 'next/link';
import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import { z } from 'zod';
import { Activity, Zap, Target, AlertTriangle, Shield, Coffee, Moon } from 'lucide-react';

import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Form, FormControl, FormField, FormItem, FormLabel, FormMessage } from '@/components/ui/form';
import { Input } from '@/components/ui/input';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';

const sensitivitySchema = z.enum(['low', 'moderate', 'high']);

const formSchema = z.object({
  usualBedtime: z
    .number({ invalid_type_error: 'Enter bedtime as 24-hour clock (e.g., 23.5)' })
    .min(16)
    .max(30),
  lastCaffeineTime: z
    .number({ invalid_type_error: 'Enter time of last caffeine dose' })
    .min(4)
    .max(30),
  totalCaffeineMg: z
    .number({ invalid_type_error: 'Enter total caffeine' })
    .min(0)
    .max(800),
  sensitivity: sensitivitySchema,
  sleepDebtHours: z
    .number({ invalid_type_error: 'Enter current weekly sleep debt' })
    .min(0)
    .max(20),
});

type FormValues = z.infer<typeof formSchema>;

type ResultPayload = {
  recommendedCutoff: number;
  cutoffLabel: string;
  predictedLatency: number;
  windDownStart: number;
  riskLevel: 'low' | 'elevated' | 'high';
  interpretation: string;
  recommendations: string[];
  plan: { label: string; detail: string }[];
};

const steps = [
  'Estimate your usual bedtime using a 24-hour clock (e.g., 22.5 for 10:30 PM).',
  'Log the most recent hour you consumed caffeine (coffee, tea, energy drink, pre-workout).',
  'Add up total caffeine for the dayâ€”include espresso shots, sodas, and supplements.',
  'Enter current sleep debt (hours you are behind your ideal weekly total).',
  'Toggle sensitivity based on how strongly caffeine normally affects your sleep.',
  'Review the cutoff recommendation and adjust your routine for the next few evenings.',
];

const faqs = [
  {
    question: 'Why do I need a caffeine cutoff time?',
    answer: 'Caffeineâ€™s half-life averages 5â€“6 hours. Having a cutoff protects deep sleep and REM cycles by allowing enough metabolic clearance before bedtime.',
  },
  {
    question: 'What if my bedtime is after midnight?',
    answer: 'Use values above 24 (e.g., 25.5 for 1:30 AM). The calculator normalizes times and guides overnight workers or late sleepers.',
  },
  {
    question: 'How does sleep debt change the recommendation?',
    answer: 'Higher sleep debt increases sensitivity to stimulants, so the calculator pushes the cutoff earlier and prioritizes wind-down routines.',
  },
  {
    question: 'Do decaf drinks count?',
    answer: 'Decaf has minimal caffeine but can still add up. Include it if you consume multiple servings or are highly sensitive.',
  },
  {
    question: 'Can I replace afternoon coffee with tea?',
    answer: 'Yesâ€”lower-caffeine beverages plus hydration help you power through without delaying melatonin.',
  },
  {
    question: 'Is it okay to nap instead?',
    answer: 'Short strategic naps (15â€“20 minutes) before 3 PM often work better than late-day double espresso shots.',
  },
  {
    question: 'Does exercise affect caffeine clearance?',
    answer: 'Light movement increases circulation and can modestly speed clearance, but timing still matters more than workout intensity.',
  },
  {
    question: 'How can I track progress?',
    answer: 'Log bedtime, caffeine, and sleep latency for a week. Feed updated numbers back into the calculator to see trends.',
  },
  {
    question: 'What if I work night shifts?',
    answer: 'Treat your planned sleep window as â€œnight.â€ The tool focuses on aligning stimulant timing with when you need to fall asleep.',
  },
  {
    question: 'Should I quit caffeine completely?',
    answer: 'Not necessarily. Dialing in total mg and cutoffs often preserves both alertness and sleep without eliminating caffeine.',
  },
];

const relatedCalculators = [
  {
    name: 'Sleep Debt Calculator',
    slug: 'habit-streak-tracker-calculator',
    description: 'Measure weekly sleep debt to pair with your caffeine changes.',
  },
  {
    name: 'Screen Time vs Sleep Impact Calculator',
    slug: 'screen-time-vs-sleep-impact-calculator',
    description: 'Evaluate how evening scrolling interacts with caffeine timing.',
  },
  {
    name: 'Hydration Needs Calculator',
    slug: 'hydration-needs-calculator',
    description: 'Support caffeine metabolism with proper fluid intake.',
  },
  {
    name: 'Stress Level Self-Assessment Calculator',
    slug: 'daily-activity-points-calculator',
    description: 'Check how stress load influences stimulant cravings.',
  },
];

const baseUrl = 'https://mycalculating.com/health-fitness/caffeine-cutoff-sleep-impact-calculator';

const schemaMarkup = {
  '@context': 'https://schema.org',
  '@graph': [
    {
      '@type': 'BreadcrumbList',
      itemListElement: [
        { '@type': 'ListItem', position: 1, name: 'Home', item: 'https://mycalculating.com' },
        { '@type': 'ListItem', position: 2, name: 'Health & Fitness', item: 'https://mycalculating.com/health-fitness' },
        { '@type': 'ListItem', position: 3, name: 'Caffeine Cutoff Sleep Impact Calculator', item: baseUrl },
      ],
    },
    {
      '@type': 'Article',
      headline: 'Caffeine Cutoff Sleep Impact Calculator',
      description: 'Plan caffeine timing to protect deep sleep, reduce latency, and synchronize wind-down routines.',
      author: { '@type': 'Organization', name: 'Mycalculating.com' },
      publisher: { '@type': 'Organization', name: 'Mycalculating.com', logo: { '@type': 'ImageObject', url: 'https://mycalculating.com/logo.png' } },
      url: baseUrl,
      mainEntityOfPage: { '@type': 'WebPage', '@id': baseUrl },
      datePublished: '2024-01-01',
      dateModified: new Date().toISOString().split('T')[0],
    },
    {
      '@type': 'SoftwareApplication',
      name: 'Caffeine Cutoff Sleep Impact Calculator',
      applicationCategory: 'Calculator',
      operatingSystem: 'Web Browser',
      offers: { '@type': 'Offer', price: '0', priceCurrency: 'USD' },
      featureList: ['Caffeine cutoff planner', 'Sleep latency forecast', 'Wind-down guidance'],
      url: baseUrl,
      description: 'Estimate the optimal time to stop caffeine intake based on bedtime, dose, and sensitivity.',
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
      name: 'How to Use Caffeine Cutoff Sleep Impact Calculator',
      description: 'Step-by-step guide to calculate optimal caffeine cutoff time',
      step: steps.map((step, index) => ({
        '@type': 'HowToStep',
        position: index + 1,
        text: step,
      })),
    },
  ],
};

const sensitivityFactorMap: Record<FormValues['sensitivity'], number> = {
  low: 0.6,
  moderate: 1,
  high: 1.4,
};

const formatClock = (value: number) => {
  const normalized = ((value % 24) + 24) % 24;
  const hours = Math.floor(normalized);
  const minutes = Math.round((normalized - hours) * 60);
  const suffix = hours >= 12 ? 'PM' : 'AM';
  const standardHour = hours % 12 === 0 ? 12 : hours % 12;
  return `${standardHour}:${minutes.toString().padStart(2, '0')} ${suffix}`;
};

const calculateResult = (values: FormValues): ResultPayload => {
  const baseCutoff = values.usualBedtime - 8;
  const demandFactor = (values.totalCaffeineMg / 100) * sensitivityFactorMap[values.sensitivity];
  const sleepDebtPenalty = values.sleepDebtHours * 0.25;
  const adjustedCutoff = baseCutoff - demandFactor - sleepDebtPenalty;
  const latencyPenalty = Math.max(0, values.lastCaffeineTime - adjustedCutoff) * 18 * sensitivityFactorMap[values.sensitivity];
  const predictedLatency = Math.min(120, 15 + latencyPenalty);
  const windDownStart = values.usualBedtime - 1.5 - Math.min(1, values.sleepDebtHours * 0.05);

  let riskLevel: ResultPayload['riskLevel'] = 'low';
  let interpretation =
    'Your current caffeine timing may already be fairly friendly to your evenings. You can keep an eye on how your body feels and gently adjust if your routine changes.';

  if (predictedLatency > 35) {
    riskLevel = 'elevated';
    interpretation =
      'Your entries suggest caffeine might be making it a bit harder to fall asleep. You could experiment with having your last caffeinated drink earlier and see how the next few nights feel.';
  }
  if (predictedLatency > 60) {
    riskLevel = 'high';
    interpretation =
      'Based on these inputs, caffeine may be strongly overlapping with your windâ€‘down time. Gentle options include moving your last dose earlier, choosing smaller amounts, or swapping to nonâ€‘caffeinated drinks in the evening.';
  }

  const recommendations = [
    'Try placing most of your caffeinated drinks earlier in the day so evenings feel calmer.',
    'Pair caffeine with regular hydration and balanced meals to support steadier energy.',
    'If you make a change, notice sleep timing and how rested you feel over a few days rather than just one night.',
  ];

  if (riskLevel === 'elevated') {
    recommendations.push('You might try halfâ€‘caf or lowerâ€‘caffeine options after your chosen cutoff to keep the ritual while softening the effect.');
  }
  if (riskLevel === 'high') {
    recommendations.push(
      'If evenings feel consistently wired, you could take a short break or reduce your daily total and see how your baseline energy responds.'
    );
  }

  const plan = [
    { label: 'Morning', detail: 'Enjoy full-strength coffee within the first 3â€“4 hours of waking.' },
    { label: 'Afternoon', detail: 'Transition to hydration, protein-heavy snacks, or light movement for energy.' },
    { label: 'Evening', detail: 'Start wind-down at least 90 minutes before bed with low light and no stimulants.' },
  ];

  return {
    recommendedCutoff: adjustedCutoff,
    cutoffLabel: formatClock(adjustedCutoff),
    predictedLatency,
    windDownStart,
    riskLevel,
    interpretation,
    recommendations,
    plan,
  };
};

export default function CaffeineCutoffSleepImpactCalculator() {
  const [result, setResult] = useState<ResultPayload | null>(null);

  const form = useForm<FormValues>({
    resolver: zodResolver(formSchema),
    defaultValues: {
      usualBedtime: undefined,
      lastCaffeineTime: undefined,
      totalCaffeineMg: undefined,
      sensitivity: 'moderate',
      sleepDebtHours: undefined,
    },
  });

  const sensitivityHint = useMemo(
    () => 'Select â€œhighâ€ if you feel wired after a small espresso or if caffeine lingers into the evening.',
    [],
  );

  return (
    <div className="space-y-8">
      <Script id="caffeine-cutoff-schema" type="application/ld+json" strategy="afterInteractive" dangerouslySetInnerHTML={{ __html: JSON.stringify(schemaMarkup) }} />

      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <Coffee className="h-5 w-5" />
            Caffeine Cutoff Sleep Impact Calculator
          </CardTitle>
          <CardDescription>Plan your last cup strategically so caffeine supports performance without crowding out deep sleep.</CardDescription>
        </CardHeader>
      </Card>

      <Card>
        <CardHeader>
          <CardTitle>Input your routine</CardTitle>
          <CardDescription>Leave fields blank until you are readyâ€”everything is personalized on submit.</CardDescription>
        </CardHeader>
        <CardContent>
          <Form {...form}>
            <form onSubmit={form.handleSubmit((values) => setResult(calculateResult(values)))} className="space-y-6">
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <FormField
                  control={form.control}
                  name="usualBedtime"
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel>Usual bedtime (24h)</FormLabel>
                      <FormControl>
                        <Input
                          type="number"
                          step="0.25"
                          placeholder="e.g., 23 for 11:00 PM"
                          value={field.value ?? ''}
                          onChange={(event) => field.onChange(event.target.value === '' ? undefined : Number(event.target.value))}
                        />
                      </FormControl>
                      <FormMessage />
                    </FormItem>
                  )}
                />
                <FormField
                  control={form.control}
                  name="lastCaffeineTime"
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel>Time of last caffeine (24h)</FormLabel>
                      <FormControl>
                        <Input
                          type="number"
                          step="0.25"
                          placeholder="e.g., 15.5 for 3:30 PM"
                          value={field.value ?? ''}
                          onChange={(event) => field.onChange(event.target.value === '' ? undefined : Number(event.target.value))}
                        />
                      </FormControl>
                      <FormMessage />
                    </FormItem>
                  )}
                />
                <FormField
                  control={form.control}
                  name="totalCaffeineMg"
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel>Total caffeine (mg)</FormLabel>
                      <FormControl>
                        <Input
                          type="number"
                          step="10"
                          placeholder="e.g., 260"
                          value={field.value ?? ''}
                          onChange={(event) => field.onChange(event.target.value === '' ? undefined : Number(event.target.value))}
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
                      <FormLabel>Sleep debt (hours)</FormLabel>
                      <FormControl>
                        <Input
                          type="number"
                          step="0.5"
                          placeholder="e.g., 6"
                          value={field.value ?? ''}
                          onChange={(event) => field.onChange(event.target.value === '' ? undefined : Number(event.target.value))}
                        />
                      </FormControl>
                      <FormMessage />
                    </FormItem>
                  )}
                />
                <FormField
                  control={form.control}
                  name="sensitivity"
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel>Caffeine sensitivity</FormLabel>
                      <Select onValueChange={field.onChange} value={field.value}>
                        <FormControl>
                          <SelectTrigger>
                            <SelectValue placeholder="Select level" />
                          </SelectTrigger>
                        </FormControl>
                        <SelectContent>
                          <SelectItem value="low">Low</SelectItem>
                          <SelectItem value="moderate">Moderate</SelectItem>
                          <SelectItem value="high">High</SelectItem>
                        </SelectContent>
                      </Select>
                      <p className="text-xs text-muted-foreground">{sensitivityHint}</p>
                      <FormMessage />
                    </FormItem>
                  )}
                />
              </div>
              <Button type="submit" className="w-full md:w-auto">
                Calculate cutoff
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
            <CardDescription>See recommended cutoff time, predicted sleep latency, wind-down timing, and recommendations.</CardDescription>
          </CardHeader>
          <CardContent className="space-y-6">
            <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
              <div className="p-4 border rounded">
                <p className="text-sm text-muted-foreground">Recommended Cutoff</p>
                <p className="text-2xl font-semibold text-primary">{result.cutoffLabel}</p>
                <p className="text-xs text-muted-foreground">Time to stop caffeine</p>
              </div>
              <div className="p-4 border rounded">
                <p className="text-sm text-muted-foreground">Sleep Latency</p>
                <p className="text-2xl font-semibold text-primary">{Math.round(result.predictedLatency)} min</p>
                <p className="text-xs text-muted-foreground">Predicted time to fall asleep</p>
              </div>
              <div className="p-4 border rounded">
                <p className="text-sm text-muted-foreground">Wind-Down Start</p>
                <p className="text-2xl font-semibold text-primary">{formatClock(result.windDownStart)}</p>
                <p className="text-xs text-muted-foreground">Begin relaxation routine</p>
              </div>
              <div className="p-4 border rounded">
                <p className="text-sm text-muted-foreground">Status</p>
                <p className="text-2xl font-semibold text-primary capitalize">{result.riskLevel}</p>
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
            <strong>Cutoff Time</strong> = Bedtime âˆ’ 8 hours âˆ’ (Total caffeine Ã· 100 Ã— Sensitivity factor) âˆ’ (Sleep debt Ã— 0.25).
            Sensitivity factors: Low = 0.5, Moderate = 1.0, High = 1.5.
          </p>
          <p>
            <strong>Predicted Sleep Latency</strong> = 15 min + max(0, Last caffeine âˆ’ Cutoff) Ã— 18 Ã— Sensitivity factor. This
            estimates time to fall asleep based on caffeine clearance.
          </p>
          <p>
            <strong>Wind-Down Start</strong> = Bedtime âˆ’ 90 minutes âˆ’ (Sleep debt Ã— 0.1). This provides time for relaxation
            before sleep.
          </p>
          <p>
            Caffeine has an average half-life of 5-6 hours, meaning half remains in your system after this time. The calculator
            accounts for total dose, individual sensitivity, and sleep debt to recommend optimal cutoff timing.
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
          <CardTitle>Additional calculation</CardTitle>
          <CardDescription>See how your current timing compares with the plan.</CardDescription>
        </CardHeader>
        <CardContent>
          {result ? (
            (() => {
              const { lastCaffeineTime = 0, totalCaffeineMg = 0, sleepDebtHours = 0 } = form.getValues();
              const buffer = result.recommendedCutoff - lastCaffeineTime;
              return (
            <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
              <div className="p-4 border rounded">
                <p className="text-sm text-muted-foreground">Actual vs recommended buffer</p>
                <p className="text-xl font-semibold text-primary">
                  {buffer.toFixed(1)} hrs
                </p>
                <p className="text-xs text-muted-foreground">Positive values mean youâ€™re ahead of schedule.</p>
              </div>
              <div className="p-4 border rounded">
                <p className="text-sm text-muted-foreground">Dose pressure index</p>
                <p className="text-xl font-semibold text-primary">
                  {((totalCaffeineMg / 400) * 100).toFixed(0)}%
                </p>
                <p className="text-xs text-muted-foreground">Keep under 75% most days.</p>
              </div>
              <div className="p-4 border rounded">
                <p className="text-sm text-muted-foreground">Sleep debt drag</p>
                <p className="text-xl font-semibold text-primary">{sleepDebtHours * 15} min</p>
                <p className="text-xs text-muted-foreground">Additional latency from accumulated debt.</p>
              </div>
            </div>
              );
            })()
          ) : (
            <p className="text-sm text-muted-foreground">Run the calculator to unlock custom deltas and dose pressure metrics.</p>
          )}
        </CardContent>
      </Card>

      <Card>
        <CardHeader>
          <CardTitle>Related calculators</CardTitle>
          <CardDescription>Round out your sleep toolkit.</CardDescription>
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
        itemType="https://schema.org/MedicalWebPage"
      >
        {/* SEO & SCHEMA METADATA (HIGHLY OPTIMIZED) */}
        <meta itemProp="name" content="The Definitive Guide to Caffeine and Sleep: Understanding Cutoff Times and Sleep Impact" />
        <meta
          itemProp="description"
          content="An expert, evidence-based guide on caffeine cutoff times, caffeine half-life, sleep latency, and comprehensive strategies to optimize caffeine timing for better sleep quality and daytime alertness."
        />
        <meta
          itemProp="keywords"
          content="caffeine cutoff time, caffeine sleep impact, caffeine half-life, sleep latency, caffeine timing, sleep quality, caffeine sensitivity"
        />
        <meta itemProp="author" content="[Your Site's Health Team]" />
        <meta itemProp="datePublished" content="2025-12-01" />
        <meta itemProp="url" content="/definitive-caffeine-cutoff-guide" />

        <h1 className="text-3xl md:text-4xl font-extrabold text-foreground mb-4" itemProp="headline">
          The Definitive Guide to Caffeine and Sleep: Understanding Cutoff Times, Half-Life, and Sleep Impact
        </h1>
        <p className="text-lg italic text-gray-700">
          Explore the science of caffeine metabolism, learn how caffeine affects sleep, understand optimal cutoff times, and
          discover comprehensive strategies to balance caffeine consumption with quality sleep and daytime alertness.
        </p>

        {/* TABLE OF CONTENTS (INTERNAL LINKS FOR UX AND SEO) */}
        <h2 className="text-2xl font-bold text-foreground mt-8 mb-4">Table of Contents: Jump to a Section</h2>
        <ul className="list-disc ml-6 space-y-2 text-blue-600">
          <li>
            <a href="#understanding-caffeine" className="hover:underline">
              Understanding Caffeine and Its Effects on the Body
            </a>
          </li>
          <li>
            <a href="#caffeine-metabolism" className="hover:underline">
              Caffeine Metabolism and Half-Life
            </a>
          </li>
          <li>
            <a href="#sleep-impact" className="hover:underline">
              How Caffeine Affects Sleep
            </a>
          </li>
          <li>
            <a href="#cutoff-timing" className="hover:underline">
              Determining Optimal Caffeine Cutoff Times
            </a>
          </li>
          <li>
            <a href="#strategies" className="hover:underline">
              Comprehensive Strategies for Caffeine and Sleep Balance
            </a>
          </li>
        </ul>
        <hr />

        {/* UNDERSTANDING CAFFEINE */}
        <h2 id="understanding-caffeine" className="text-2xl font-bold text-foreground pt-8" itemProp="articleSection">
          Understanding Caffeine and Its Effects on the Body
        </h2>
        <p>
          Caffeine is a natural stimulant found in coffee, tea, chocolate, energy drinks, and many other products. It works by
          blocking adenosine receptors in the brain, which prevents drowsiness and increases alertness. While moderate caffeine
          consumption can enhance focus, energy, and performance, timing and amount significantly impact sleep quality.
        </p>

        <h3 className="text-xl font-semibold text-foreground mt-6">How Caffeine Works</h3>
        <p>
          Caffeine's primary mechanism of action:
        </p>
        <ul>
          <li>
            <b>Adenosine blocking:</b> Caffeine binds to adenosine receptors, preventing adenosine (a sleep-promoting chemical)
            from binding and causing drowsiness
          </li>
          <li>
            <b>Increased neurotransmitters:</b> Caffeine increases dopamine and norepinephrine, enhancing alertness and mood
          </li>
          <li>
            <b>Stimulated nervous system:</b> Caffeine activates the sympathetic nervous system, increasing heart rate, blood
            pressure, and energy
          </li>
        </ul>

        <h3 className="text-xl font-semibold text-foreground mt-6">Individual Sensitivity</h3>
        <p>
          Caffeine sensitivity varies widely between individuals due to:
        </p>
        <ul>
          <li>Genetic factors affecting caffeine metabolism enzymes</li>
          <li>Age (metabolism slows with age)</li>
          <li>Body weight and composition</li>
          <li>Regular caffeine consumption (tolerance development)</li>
          <li>Medications and health conditions</li>
        </ul>

        <hr />

        {/* CAFFEINE METABOLISM */}
        <h2 id="caffeine-metabolism" className="text-2xl font-bold text-foreground pt-8" itemProp="articleSection">
          Caffeine Metabolism and Half-Life
        </h2>
        <p>
          Caffeine is metabolized primarily in the liver by enzymes, with an average half-life of 5-6 hours in healthy adults.
          This means that after 5-6 hours, approximately half of the caffeine consumed remains in your system.
        </p>

        <h3 className="text-xl font-semibold text-foreground mt-6">Half-Life Explained</h3>
        <p>
          <b>Half-life:</b> The time it takes for half of the caffeine in your body to be eliminated. For caffeine, this averages
          5-6 hours but can range from 2-12 hours depending on individual factors.
        </p>
        <p>
          <b>Complete elimination:</b> It takes approximately 5 half-lives (25-30 hours) for caffeine to be completely cleared
          from your system, though effects diminish significantly after 2-3 half-lives.
        </p>

        <h3 className="text-xl font-semibold text-foreground mt-6">Factors Affecting Metabolism</h3>
        <ul>
          <li>
            <b>Genetics:</b> Variations in CYP1A2 enzyme activity affect how quickly caffeine is processed
          </li>
          <li>
            <b>Age:</b> Metabolism slows with age, increasing half-life
          </li>
          <li>
            <b>Pregnancy:</b> Half-life increases significantly during pregnancy (up to 15-18 hours)
          </li>
          <li>
            <b>Medications:</b> Some medications (birth control, antibiotics) can slow caffeine metabolism
          </li>
          <li>
            <b>Liver function:</b> Impaired liver function slows metabolism
          </li>
        </ul>

        <hr />

        {/* SLEEP IMPACT */}
        <h2 id="sleep-impact" className="text-2xl font-bold text-foreground pt-8" itemProp="articleSection">
          How Caffeine Affects Sleep
        </h2>
        <p>
          Caffeine can significantly impact sleep quality, sleep latency (time to fall asleep), and sleep architecture (stages of
          sleep).
        </p>

        <h3 className="text-xl font-semibold text-foreground mt-6">Sleep Latency</h3>
        <p>
          Caffeine consumed close to bedtime increases sleep latencyâ€”the time it takes to fall asleep. Even small amounts of
          caffeine can delay sleep onset, especially in sensitive individuals.
        </p>

        <h3 className="text-xl font-semibold text-foreground mt-6">Sleep Quality</h3>
        <p>
          Caffeine can reduce sleep quality by:
        </p>
        <ul>
          <li>Decreasing deep sleep (slow-wave sleep)</li>
          <li>Reducing REM sleep</li>
          <li>Increasing nighttime awakenings</li>
          <li>Reducing total sleep time</li>
        </ul>

        <h3 className="text-xl font-semibold text-foreground mt-6">Circadian Rhythm Disruption</h3>
        <p>
          Evening caffeine can delay circadian rhythms, shifting your natural sleep-wake cycle later. This can create a cycle
          where you need caffeine in the morning due to poor sleep, further disrupting your rhythm.
        </p>

        <hr />

        {/* CUTOFF TIMING */}
        <h2 id="cutoff-timing" className="text-2xl font-bold text-foreground pt-8" itemProp="articleSection">
          Determining Optimal Caffeine Cutoff Times
        </h2>
        <p>
          The optimal caffeine cutoff time depends on your bedtime, caffeine sensitivity, total daily intake, and sleep debt.
        </p>

        <h3 className="text-xl font-semibold text-foreground mt-6">General Guidelines</h3>
        <p>
          <b>Standard recommendation:</b> Stop consuming caffeine 6-8 hours before your planned bedtime. For a 10 PM bedtime, this
          means no caffeine after 2-4 PM.
        </p>
        <p>
          <b>High sensitivity:</b> If you are highly sensitive to caffeine, consider stopping 10-12 hours before bedtime.
        </p>
        <p>
          <b>Low sensitivity:</b> If you have low sensitivity and good sleep, you may tolerate caffeine 4-6 hours before
          bedtime, though this is not recommended for optimal sleep.
        </p>

        <h3 className="text-xl font-semibold text-foreground mt-6">Factors to Consider</h3>
        <ul>
          <li>
            <b>Total daily intake:</b> Higher total caffeine consumption requires earlier cutoff times
          </li>
          <li>
            <b>Sleep debt:</b> When sleep-deprived, you may be more sensitive to caffeine's effects
          </li>
          <li>
            <b>Bedtime consistency:</b> Regular bedtimes make cutoff timing more predictable
          </li>
          <li>
            <b>Individual response:</b> Monitor how caffeine timing affects your sleep and adjust accordingly
          </li>
        </ul>

        <hr />

        {/* STRATEGIES */}
        <h2 id="strategies" className="text-2xl font-bold text-foreground pt-8" itemProp="articleSection">
          Comprehensive Strategies for Caffeine and Sleep Balance
        </h2>
        <p>
          Balancing caffeine consumption with quality sleep requires strategic timing, dose management, and lifestyle adjustments.
        </p>

        <h3 className="text-xl font-semibold text-foreground mt-6">1. Establish a Caffeine Cutoff</h3>
        <ul>
          <li>
            <b>Set a specific time:</b> Choose a cutoff time based on your bedtime and sensitivity
          </li>
          <li>
            <b>Use reminders:</b> Set alarms or notifications to remind you of your cutoff time
          </li>
          <li>
            <b>Gradual adjustment:</b> If your current cutoff is late, gradually move it earlier by 30-60 minutes each week
          </li>
          <li>
            <b>Be consistent:</b> Maintain your cutoff time daily, even on weekends
          </li>
        </ul>

        <h3 className="text-xl font-semibold text-foreground mt-6">2. Manage Total Daily Intake</h3>
        <ul>
          <li>
            <b>Track consumption:</b> Monitor total daily caffeine from all sources (coffee, tea, soda, energy drinks, chocolate)
          </li>
          <li>
            <b>Set limits:</b> Most adults can safely consume up to 400mg per day, but individual tolerance varies
          </li>
          <li>
            <b>Front-load consumption:</b> Consume most caffeine earlier in the day to allow time for clearance
          </li>
          <li>
            <b>Consider alternatives:</b> Replace afternoon caffeine with hydration, movement, or lower-caffeine options
          </li>
        </ul>

        <h3 className="text-xl font-semibold text-foreground mt-6">3. Optimize Morning Routine</h3>
        <ul>
          <li>
            <b>Delay morning caffeine:</b> Wait 60-90 minutes after waking before consuming caffeine to avoid afternoon crashes
          </li>
          <li>
            <b>Pair with food:</b> Consume caffeine with meals to slow absorption and reduce jitters
          </li>
          <li>
            <b>Hydrate first:</b> Start your day with water before reaching for caffeine
          </li>
        </ul>

        <h3 className="text-xl font-semibold text-foreground mt-6">4. Create Evening Wind-Down Routine</h3>
        <ul>
          <li>
            <b>Start wind-down early:</b> Begin relaxation 90 minutes before bedtime
          </li>
          <li>
            <b>Avoid all stimulants:</b> Eliminate caffeine, nicotine, and other stimulants during wind-down
          </li>
          <li>
            <b>Choose calming alternatives:</b> Herbal teas (caffeine-free), warm milk, or decaf beverages
          </li>
          <li>
            <b>Dim lights:</b> Reduce light exposure to support natural melatonin production
          </li>
        </ul>

        <h3 className="text-xl font-semibold text-foreground mt-6">5. Monitor and Adjust</h3>
        <ul>
          <li>
            <b>Track sleep quality:</b> Monitor how caffeine timing affects your sleep latency and quality
          </li>
          <li>
            <b>Experiment:</b> Try different cutoff times and observe results
          </li>
          <li>
            <b>Adjust gradually:</b> Make small changes rather than dramatic shifts
          </li>
          <li>
            <b>Consider breaks:</b> Periodic caffeine breaks can reset tolerance and improve sleep
          </li>
        </ul>

        <hr />

        {/* CONCLUSION */}
        <h2 className="text-2xl font-bold text-foreground pt-8" itemProp="articleSection">Conclusion</h2>
        <p>
          Understanding caffeine metabolism, sleep impact, and optimal cutoff times is essential for balancing daytime alertness
          with quality sleep. By establishing appropriate cutoff times, managing total daily intake, optimizing morning routines,
          and creating effective wind-down practices, you can enjoy caffeine's benefits while protecting your sleep. Remember that
          individual responses vary significantlyâ€”what works for one person may not work for another. Experiment with timing,
          monitor your sleep quality, and adjust based on your personal experience. If you have persistent sleep concerns or
          questions about caffeine and health, consider consulting a healthcare provider who can provide personalized guidance.
          This tool is designed for wellness reflection and is not a substitute for professional medical evaluation or treatment.
        </p>
      </section>

      <Card>
        <CardHeader>
          <CardTitle>FAQs</CardTitle>
          <CardDescription>SEO-friendly answers people search for most.</CardDescription>
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
            This tool offers a caffeine cutoff recommendation from bedtime, caffeine timing, total intake, sensitivity, and sleep
            debt as a gentle, lifestyle-oriented snapshot. It is intended for personal reflection, not for diagnosis or treatment
            decisions.
          </p>
          <p>
            Outputs include recommended cutoff time, predicted sleep latency, wind-down start time, risk level, interpretation
            text, supportive recommendations, an action plan, and contextual information about the inputs and calculation approach.
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
            Disclaimer: This tool provides general wellness and lifestyle insights for educational purposes only. It is not a
            medical or psychological diagnosis, evaluation, or treatment plan. For any health concerns, please consult a qualified
            professional who can review your full situation.
          </p>
        </CardContent>
      </Card>
    </div>
  );
}



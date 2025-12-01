'use client';

import { useMemo, useState } from 'react';
import Script from 'next/script';
import Link from 'next/link';
import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import { z } from 'zod';
import { Coffee, Moon, AlarmClockCheck, ShieldHalf, ClipboardCheck } from 'lucide-react';

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
  'Add up total caffeine for the day—include espresso shots, sodas, and supplements.',
  'Enter current sleep debt (hours you are behind your ideal weekly total).',
  'Toggle sensitivity based on how strongly caffeine normally affects your sleep.',
  'Review the cutoff recommendation and adjust your routine for the next few evenings.',
];

const faqs = [
  {
    question: 'Why do I need a caffeine cutoff time?',
    answer: 'Caffeine’s half-life averages 5–6 hours. Having a cutoff protects deep sleep and REM cycles by allowing enough metabolic clearance before bedtime.',
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
    answer: 'Yes—lower-caffeine beverages plus hydration help you power through without delaying melatonin.',
  },
  {
    question: 'Is it okay to nap instead?',
    answer: 'Short strategic naps (15–20 minutes) before 3 PM often work better than late-day double espresso shots.',
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
    answer: 'Treat your planned sleep window as “night.” The tool focuses on aligning stimulant timing with when you need to fall asleep.',
  },
  {
    question: 'Should I quit caffeine completely?',
    answer: 'Not necessarily. Dialing in total mg and cutoffs often preserves both alertness and sleep without eliminating caffeine.',
  },
];

const relatedCalculators = [
  {
    name: 'Sleep Debt Calculator',
    slug: 'sleep-debt-calculator-hf',
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
    slug: 'stress-level-self-assessment-calculator',
    description: 'Check how stress load influences stimulant cravings.',
  },
];

const baseUrl = 'https://mycalculating.com/category/health-fitness/caffeine-cutoff-sleep-impact-calculator';

const schemaMarkup = {
  '@context': 'https://schema.org',
  '@graph': [
    {
      '@type': 'BreadcrumbList',
      itemListElement: [
        { '@type': 'ListItem', position: 1, name: 'Home', item: 'https://mycalculating.com' },
        { '@type': 'ListItem', position: 2, name: 'Health & Fitness', item: 'https://mycalculating.com/category/health-fitness' },
        { '@type': 'ListItem', position: 3, name: 'Caffeine Cutoff Sleep Impact Calculator', item: baseUrl },
      ],
    },
    {
      '@type': 'Article',
      headline: 'Caffeine Cutoff Sleep Impact Calculator',
      description: 'Plan caffeine timing to protect deep sleep, reduce latency, and synchronize wind-down routines.',
      author: { '@type': 'Organization', name: 'Mycalculating.com' },
      publisher: { '@type': 'Organization', name: 'Mycalculating.com' },
      url: baseUrl,
      mainEntityOfPage: baseUrl,
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
      'Based on these inputs, caffeine may be strongly overlapping with your wind‑down time. Gentle options include moving your last dose earlier, choosing smaller amounts, or swapping to non‑caffeinated drinks in the evening.';
  }

  const recommendations = [
    'Try placing most of your caffeinated drinks earlier in the day so evenings feel calmer.',
    'Pair caffeine with regular hydration and balanced meals to support steadier energy.',
    'If you make a change, notice sleep timing and how rested you feel over a few days rather than just one night.',
  ];

  if (riskLevel === 'elevated') {
    recommendations.push('You might try half‑caf or lower‑caffeine options after your chosen cutoff to keep the ritual while softening the effect.');
  }
  if (riskLevel === 'high') {
    recommendations.push(
      'If evenings feel consistently wired, you could take a short break or reduce your daily total and see how your baseline energy responds.'
    );
  }

  const plan = [
    { label: 'Morning', detail: 'Enjoy full-strength coffee within the first 3–4 hours of waking.' },
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
    () => 'Select “high” if you feel wired after a small espresso or if caffeine lingers into the evening.',
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
          <CardDescription>Leave fields blank until you are ready—everything is personalized on submit.</CardDescription>
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
              <Moon className="h-5 w-5 text-primary" />
              Interactive result & interpretation
            </CardTitle>
            <CardDescription>Caffeine buffer, wind-down timing, and sleep latency forecast tailored to your entries.</CardDescription>
          </CardHeader>
          <CardContent className="space-y-6">
            <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
              <div className="p-4 border rounded">
                <p className="text-sm text-muted-foreground">Recommended cutoff</p>
                <p className="text-2xl font-semibold text-primary">{result.cutoffLabel}</p>
                <p className="text-xs text-muted-foreground">≈ {result.recommendedCutoff.toFixed(1)} on a 24-hour clock</p>
              </div>
              <div className="p-4 border rounded">
                <p className="text-sm text-muted-foreground">Predicted sleep latency</p>
                <p className="text-2xl font-semibold text-primary">{Math.round(result.predictedLatency)} min</p>
                <p className="text-xs text-muted-foreground">Target latency: 15–25 min</p>
              </div>
              <div className="p-4 border rounded">
                <p className="text-sm text-muted-foreground">Wind-down start</p>
                <p className="text-2xl font-semibold text-primary">{formatClock(result.windDownStart)}</p>
                <p className="text-xs text-muted-foreground">Block screens & dim lights at this time.</p>
              </div>
            </div>
            <div className="rounded border p-4 bg-muted/50">
              <p className="text-sm uppercase tracking-wide text-muted-foreground mb-1">Status</p>
              <p className="text-lg font-semibold capitalize">{result.riskLevel} strain pattern</p>
              <p className="text-sm text-muted-foreground">{result.interpretation}</p>
            </div>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div className="p-4 border rounded">
                <h4 className="font-semibold mb-2">Recommendations</h4>
                <ul className="list-disc pl-4 space-y-1 text-sm text-muted-foreground">
                  {result.recommendations.map((item) => (
                    <li key={item}>{item}</li>
                  ))}
                </ul>
              </div>
              <div className="p-4 border rounded">
                <h4 className="font-semibold mb-2">Action plan</h4>
                <ul className="space-y-1 text-sm text-muted-foreground">
                  {result.plan.map((item) => (
                    <li key={item.label}>
                      <span className="font-semibold">{item.label}:</span> {item.detail}
                    </li>
                  ))}
                </ul>
              </div>
            </div>
          </CardContent>
        </Card>
      )}

      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <AlarmClockCheck className="h-5 w-5" />
            Formula
          </CardTitle>
        </CardHeader>
        <CardContent className="space-y-2 text-sm text-muted-foreground">
          <p>
            <strong>Cutoff Time</strong> = Bedtime − 8 hours − (Total caffeine ÷ 100 × Sensitivity factor) − (Sleep debt × 0.25)
          </p>
          <p>
            <strong>Predicted Sleep Latency</strong> = 15 min + max(0, Last caffeine − Cutoff) × 18 × Sensitivity factor
          </p>
          <p>Wind-down start defaults to ~90 minutes before bedtime with a small penalty for large sleep debt.</p>
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
                <p className="text-xs text-muted-foreground">Positive values mean you’re ahead of schedule.</p>
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
          <CardDescription>Use this placeholder copy until you publish a full guide.</CardDescription>
        </CardHeader>
        <CardContent className="prose prose-sm dark:prose-invert max-w-none">
          <p>
            Dialing in caffeine timing is the simplest biohack for better sleep. Most adults thrive when the last meaningful dose
            happens 7–9 hours before lights out, supplemented with hydration and strategic movement for energy.
          </p>
          <p>
            Once you master timing, layer in circadian cues (sunlight, meal timing, consistent wake windows) to reinforce strong sleep
            architecture without ditching coffee entirely.
          </p>
        </CardContent>
      </Card>

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
          <CardTitle className="flex items-center gap-2">
            <ShieldHalf className="h-5 w-5" />
            Summary
          </CardTitle>
        </CardHeader>
        <CardContent className="space-y-2 text-sm text-muted-foreground">
          <p>This tool offers a simple estimate of how your caffeine timing and amount might overlap with your usual sleep time.</p>
          <p>You can use the suggested cutoff and ideas as gentle experiments and then keep the changes that genuinely help you feel more rested.</p>
        </CardContent>
      </Card>

      <p className="mt-6 text-xs text-muted-foreground text-center">
        Disclaimer: This tool provides general wellness and lifestyle insights for educational purposes only. It is not a
        medical or psychological diagnosis. For any health concerns, please consult a qualified professional.
      </p>
    </div>
  );
}



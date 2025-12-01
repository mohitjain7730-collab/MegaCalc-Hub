'use client';

import { useState } from 'react';
import Script from 'next/script';
import Link from 'next/link';
import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import { z } from 'zod';
import { Thermometer, Zap, Target, Activity, Shield } from 'lucide-react';

import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Form, FormControl, FormField, FormItem, FormLabel, FormMessage } from '@/components/ui/form';
import { Input } from '@/components/ui/input';

const formSchema = z.object({
  sessionMinutes: z.number({ invalid_type_error: 'Enter session duration' }).min(5).max(60),
  temperatureC: z.number({ invalid_type_error: 'Enter sauna temperature' }).min(50).max(100),
  sessionsPerWeek: z.number({ invalid_type_error: 'Enter sessions per week' }).min(0).max(14),
  hydrationPre: z.number({ invalid_type_error: 'Enter pre-session hydration' }).min(0).max(1000),
  cooldownMinutes: z.number({ invalid_type_error: 'Enter cooldown time' }).min(0).max(30),
});

type FormValues = z.infer<typeof formSchema>;

type ResultPayload = {
  detoxScore: number;
  sweatEfficiency: number;
  status: 'optimal' | 'moderate' | 'needs-improvement';
  interpretation: string;
  recommendations: string[];
  plan: { label: string; detail: string }[];
};

const steps = [
  'Log your typical sauna session duration and temperature.',
  'Count how many sauna sessions you complete per week.',
  'Estimate how much water you drink before entering (ml).',
  'Note your cooldown time between rounds or after the session.',
  'Review the detox score and recommendations to optimize heat therapy benefits.',
];

const faqs = [
  {
    question: 'What does the detox score measure?',
    answer:
      'It estimates how effectively your sauna routine supports heat-induced sweating, circulation, and metabolic clearance based on session parameters and hydration.',
  },
  {
    question: 'Is higher temperature always better?',
    answer:
      'Not necessarily. 70–90°C (158–194°F) is a common effective range. Higher temps require shorter sessions and better hydration to avoid overheating.',
  },
  {
    question: 'How much should I hydrate before sauna?',
    answer:
      'Aim for 300–500 ml (10–17 oz) of water 15–30 minutes before entering. Avoid overhydration right before to prevent discomfort.',
  },
  {
    question: 'Do cold plunges affect the score?',
    answer:
      'They support recovery and circulation but are tracked separately. The calculator focuses on heat exposure and hydration patterns.',
  },
  {
    question: 'Can I use this for infrared saunas?',
    answer:
      'Yes, but infrared operates at lower ambient temps (45–60°C). Adjust temperature input to reflect the effective heat you feel.',
  },
  {
    question: 'How often should I sauna?',
    answer:
      'Most research suggests 2–4 sessions per week for general benefits. Daily use is fine if you tolerate it and maintain hydration.',
  },
  {
    question: 'What if I feel dizzy or nauseous?',
    answer:
      'Exit immediately, cool down gradually, and hydrate. Reduce session length or temperature next time. Consult a doctor if symptoms persist.',
  },
  {
    question: 'Does sauna help with muscle recovery?',
    answer:
      'Yes—heat therapy can reduce soreness and improve circulation. Pair with proper sleep and nutrition for best results.',
  },
  {
    question: 'Should I eat before sauna?',
    answer:
      'Light meals 1–2 hours before are fine. Avoid heavy meals right before to prevent digestive discomfort during heat exposure.',
  },
  {
    question: 'Can medications affect sauna safety?',
    answer:
      'Some medications (blood pressure, diuretics) can increase heat sensitivity. Consult your doctor before starting regular sauna use.',
  },
];

const relatedCalculators = [
  {
    name: 'Hydration Recovery After Workout Calculator',
    slug: 'hydration-recovery-after-workout-calculator',
    description: 'Track fluid replacement after exercise and heat exposure.',
  },
  {
    name: 'Electrolyte Balance Restoration Calculator',
    slug: 'electrolyte-balance-restoration-calculator',
    description: 'Balance sodium, potassium, and magnesium after sweating.',
  },
  {
    name: 'Intermittent Cold Exposure Calorie Burn Estimator',
    slug: 'intermittent-cold-exposure-calorie-burn-estimator',
    description: 'Estimate thermogenic calorie burn from cold exposure.',
  },
  {
    name: 'Immune Recovery Time Post-Illness Calculator',
    slug: 'immune-recovery-time-post-illness-calculator',
    description: 'Plan recovery timelines after illness or intense training.',
  },
];

const baseUrl = 'https://mycalculating.com/category/health-fitness/sauna-session-detox-score-calculator';

const schemaMarkup = {
  '@context': 'https://schema.org',
  '@graph': [
    {
      '@type': 'BreadcrumbList',
      itemListElement: [
        { '@type': 'ListItem', position: 1, name: 'Home', item: 'https://mycalculating.com' },
        { '@type': 'ListItem', position: 2, name: 'Health & Fitness', item: 'https://mycalculating.com/category/health-fitness' },
        { '@type': 'ListItem', position: 3, name: 'Sauna Session Detox Score Calculator', item: baseUrl },
      ],
    },
    {
      '@type': 'SoftwareApplication',
      name: 'Sauna Session Detox Score Calculator',
      applicationCategory: 'Calculator',
      operatingSystem: 'Web Browser',
      description: 'Estimate detox score, sweat efficiency, and optimize sauna routine for heat therapy benefits.',
      url: baseUrl,
      offers: { '@type': 'Offer', price: '0', priceCurrency: 'USD' },
    },
  ],
};

const clamp = (value: number, min: number, max: number) => Math.min(max, Math.max(min, value));

const calculateResult = (values: FormValues): ResultPayload => {
  const heatLoad = (values.temperatureC - 50) / 50 * 30; // 0-30 points
  const durationScore = clamp(values.sessionMinutes / 20 * 25, 0, 25); // 0-25 points
  const frequencyScore = clamp(values.sessionsPerWeek / 4 * 20, 0, 20); // 0-20 points
  const hydrationScore = clamp(values.hydrationPre / 400 * 15, 0, 15); // 0-15 points
  const cooldownScore = clamp(values.cooldownMinutes / 10 * 10, 0, 10); // 0-10 points
  const detoxScore = clamp(heatLoad + durationScore + frequencyScore + hydrationScore + cooldownScore, 0, 100);
  const sweatEfficiency = clamp((heatLoad + durationScore) * 0.8 + hydrationScore * 0.2, 0, 100);

  let status: ResultPayload['status'] = 'optimal';
  let interpretation =
    'Your entries suggest that, for you, this sauna routine may feel fairly balanced in terms of heat, time, and basic hydration.';

  if (detoxScore < 60) {
    status = 'moderate';
    interpretation =
      'This pattern looks workable, with some room to gently adjust things like timing, temperature, or hydration to better support how you feel.';
  }
  if (detoxScore < 40) {
    status = 'needs-improvement';
    interpretation =
      'Here, your current setup may feel a bit less supportive. You might explore smaller, kinder sessions and more consistent hydration, or pause and reassess if needed.';
  }

  const recommendations = [
    'If you are newer to sauna time, starting with shorter sessions and increasing only as it feels comfortable can be gentler on your body.',
    'Having some water before or between rounds, in amounts that feel good for you, can help you stay hydrated.',
    'Leaving space for a few minutes of cool‑down between rounds can give your body a chance to settle and check in.',
  ];
  if (status === 'moderate') {
    recommendations.push('You might experiment with 2–4 sessions per week if that fits your life and feels supportive, without forcing it.');
  }
  if (status === 'needs-improvement') {
    recommendations.push('If you have questions or health considerations, you could explore guidance from a professional familiar with heat practices.');
  }

  const plan = [
    { label: 'This Week', detail: 'Notice how you currently approach sauna sessions, including time, temperature, and hydration, without judgment.' },
    { label: 'Next 2 Weeks', detail: 'If it feels right, gently adjust one variable—like a slightly different duration or extra water—and see how your body responds.' },
    { label: 'Ongoing', detail: 'Every so often, reflect on whether your sauna habit still feels supportive and adjust or pause as needed.' },
  ];

  return { detoxScore, sweatEfficiency, status, interpretation, recommendations, plan };
};

export default function SaunaSessionDetoxScoreCalculator() {
  const [result, setResult] = useState<ResultPayload | null>(null);

  const form = useForm<FormValues>({
    resolver: zodResolver(formSchema),
    defaultValues: {
      sessionMinutes: undefined,
      temperatureC: undefined,
      sessionsPerWeek: undefined,
      hydrationPre: undefined,
      cooldownMinutes: undefined,
    },
  });

  return (
    <div className="space-y-8">
      <Script id="sauna-detox-schema" type="application/ld+json" strategy="afterInteractive" dangerouslySetInnerHTML={{ __html: JSON.stringify(schemaMarkup) }} />

      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <Thermometer className="h-5 w-5" />
            Sauna Session Detox Score Calculator
          </CardTitle>
          <CardDescription>Estimate detox score, sweat efficiency, and optimize your heat therapy routine.</CardDescription>
        </CardHeader>
      </Card>

      <Card>
        <CardHeader>
          <CardTitle>Input your sauna routine</CardTitle>
        </CardHeader>
        <CardContent>
          <Form {...form}>
            <form onSubmit={form.handleSubmit((values) => setResult(calculateResult(values)))} className="space-y-6">
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <FormField
                  control={form.control}
                  name="sessionMinutes"
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel>Session duration (minutes)</FormLabel>
                      <FormControl>
                        <Input type="number" step="1" placeholder="e.g., 15" value={field.value ?? ''} onChange={(e) => field.onChange(e.target.value === '' ? undefined : Number(e.target.value))} />
                      </FormControl>
                      <FormMessage />
                    </FormItem>
                  )}
                />
                <FormField
                  control={form.control}
                  name="temperatureC"
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel>Sauna temperature (°C)</FormLabel>
                      <FormControl>
                        <Input type="number" step="1" placeholder="e.g., 80" value={field.value ?? ''} onChange={(e) => field.onChange(e.target.value === '' ? undefined : Number(e.target.value))} />
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
                      <FormLabel>Sessions per week</FormLabel>
                      <FormControl>
                        <Input type="number" step="1" placeholder="e.g., 3" value={field.value ?? ''} onChange={(e) => field.onChange(e.target.value === '' ? undefined : Number(e.target.value))} />
                      </FormControl>
                      <FormMessage />
                    </FormItem>
                  )}
                />
                <FormField
                  control={form.control}
                  name="hydrationPre"
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel>Pre-session hydration (ml)</FormLabel>
                      <FormControl>
                        <Input type="number" step="50" placeholder="e.g., 400" value={field.value ?? ''} onChange={(e) => field.onChange(e.target.value === '' ? undefined : Number(e.target.value))} />
                      </FormControl>
                      <FormMessage />
                    </FormItem>
                  )}
                />
                <FormField
                  control={form.control}
                  name="cooldownMinutes"
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel>Cooldown time (minutes)</FormLabel>
                      <FormControl>
                        <Input type="number" step="1" placeholder="e.g., 5" value={field.value ?? ''} onChange={(e) => field.onChange(e.target.value === '' ? undefined : Number(e.target.value))} />
                      </FormControl>
                      <FormMessage />
                    </FormItem>
                  )}
                />
              </div>
              <Button type="submit" className="w-full md:w-auto">
                Calculate detox score
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
            <CardDescription>See detox score, sweat efficiency, and optimization tips.</CardDescription>
          </CardHeader>
          <CardContent className="space-y-6">
            <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
              <div className="p-4 border rounded">
                <p className="text-sm text-muted-foreground">Detox score</p>
                <p className="text-2xl font-semibold text-primary">{result.detoxScore.toFixed(0)}</p>
                <p className="text-xs text-muted-foreground">A 0–100 snapshot of how this sauna routine fits this simple model.</p>
              </div>
              <div className="p-4 border rounded">
                <p className="text-sm text-muted-foreground">Sweat efficiency</p>
                <p className="text-2xl font-semibold text-primary">{result.sweatEfficiency.toFixed(0)}</p>
                <p className="text-xs text-muted-foreground">A rough blend of heat exposure and pre‑session hydration.</p>
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
                    <Activity className="h-4 w-4" />
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
          <p><strong>Detox score</strong> = heatLoad (0-30) + durationScore (0-25) + frequencyScore (0-20) + hydrationScore (0-15) + cooldownScore (0-10), clamped to 0-100.</p>
          <p><strong>Sweat efficiency</strong> = (heatLoad + durationScore) × 0.8 + hydrationScore × 0.2.</p>
          <p>Higher temperatures, longer sessions, regular frequency, and good hydration raise the score.</p>
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
                <p className="text-sm text-muted-foreground">Weekly heat exposure</p>
                <p className="text-xl font-semibold text-primary">
                  {(form.getValues().sessionMinutes ?? 0) * (form.getValues().sessionsPerWeek ?? 0)} min
                </p>
                <p className="text-xs text-muted-foreground">Total minutes per week</p>
              </div>
              <div className="p-4 border rounded">
                <p className="text-sm text-muted-foreground">Heat intensity</p>
                <p className="text-xl font-semibold text-primary">
                  {((form.getValues().temperatureC ?? 0) - 50).toFixed(0)}°C above baseline
                </p>
                <p className="text-xs text-muted-foreground">Relative to 50°C minimum</p>
              </div>
              <div className="p-4 border rounded">
                <p className="text-sm text-muted-foreground">Hydration adequacy</p>
                <p className="text-xl font-semibold text-primary">
                  {((form.getValues().hydrationPre ?? 0) / 400 * 100).toFixed(0)}%
                </p>
                <p className="text-xs text-muted-foreground">Target: 300-500 ml pre-session</p>
              </div>
            </div>
          ) : (
            <p className="text-sm text-muted-foreground">Enter your sauna routine to see additional metrics.</p>
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
          <p>Sauna therapy supports detoxification through heat-induced sweating, improved circulation, and metabolic clearance.</p>
          <p>Use this calculator weekly to track routine effectiveness and adjust session parameters for optimal benefits.</p>
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
          <p>This tool turns your sauna time, temperature, hydration, and cooldown habits into a single snapshot of how your routine looks in this model.</p>
          <p>The scores and ideas are there to gently support reflection and small adjustments, alongside your own comfort and any professional guidance.</p>
        </CardContent>
      </Card>

      <p className="mt-6 text-xs text-muted-foreground text-center">
        Disclaimer: This tool provides general wellness and lifestyle insights for educational purposes only. It is not a
        medical or psychological diagnosis. For any health concerns, please consult a qualified professional.
      </p>
    </div>
  );
}


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
  comfortableHoldSeconds: z.number({ invalid_type_error: 'Enter seconds' }).min(5).max(240),
  strongUrgeHoldSeconds: z.number({ invalid_type_error: 'Enter seconds' }).min(5).max(300),
  breathsPerMinuteAtRest: z.number({ invalid_type_error: 'Enter breaths/min' }).min(6).max(30),
  perceivedAnxietyScore: z.number({ invalid_type_error: 'Enter anxiety score' }).min(0).max(10),
});

type FormValues = z.infer<typeof formSchema>;

type ResultPayload = {
  comfortableHoldSeconds: number;
  strongUrgeHoldSeconds: number;
  breathsPerMinuteAtRest: number;
  perceivedAnxietyScore: number;
  co2ToleranceScore: number;
  breathingEfficiencyScore: number;
  status: 'optimal' | 'good' | 'moderate' | 'low';
  interpretation: string;
  recommendations: string[];
  plan: { label: string; detail: string }[];
};

const steps = [
  'Measure a comfortable breath hold at the end of a normal exhale (seconds).',
  'Measure a longer breath hold until you feel a strong urge to breathe (seconds), stopping before dizziness or distress.',
  'Count your resting breathing rate in breaths per minute (while seated and relaxed).',
  'Rate your perceived breath-related anxiety or air hunger sensitivity (0–10).',
  'Review your CO₂ tolerance and breathing efficiency scores.',
];

const faqs = [
  {
    question: 'What is CO₂ tolerance?',
    answer:
      'CO₂ tolerance reflects how comfortably your body and nervous system handle rising carbon dioxide during breath holding or slower breathing.',
  },
  {
    question: 'Why does CO₂ tolerance matter?',
    answer:
      'Lower tolerance can drive over-breathing, anxiety sensations, and difficulty with breathwork; improving it may support calm and performance.',
  },
  {
    question: 'Is breath holding safe?',
    answer:
      'Short, controlled breath holds are generally safe for healthy individuals, but people with cardiovascular, pulmonary, or seizure disorders should seek medical advice first.',
  },
  {
    question: 'How should I perform the tests?',
    answer:
      'Sit or lie down, take a normal breath in and out, then gently hold your breath. Time the hold until the first clear urge to breathe, without straining.',
  },
  {
    question: 'Should I push to my absolute maximum?',
    answer:
      'No. This tool is about comfort thresholds, not extreme performance. Stop before you feel panicked, dizzy, or unwell.',
  },
  {
    question: 'Can training improve CO₂ tolerance?',
    answer:
      'Yes. Many breath training protocols gradually increase comfortable hold times and reduce resting breathing rates, often improving resilience to CO₂.',
  },
  {
    question: 'Is CO₂ tolerance the same as VO₂max?',
    answer:
      'No. VO₂max measures maximal oxygen consumption. CO₂ tolerance is more about chemosensitivity and breathing patterns.',
  },
  {
    question: 'Should I train alone?',
    answer:
      'Never practice breath holds in water alone or while driving; always prioritize safety and, ideally, work with a trained instructor.',
  },
  {
    question: 'Can I use this with the Oxygen Advantage or freediving protocols?',
    answer:
      'Yes, as a simple progress tracker, but follow protocol-specific guidance from qualified coaches.',
  },
  {
    question: 'Does this replace medical testing?',
    answer:
      'No. It is an educational tool; it cannot diagnose respiratory or cardiovascular conditions.',
  },
];

const relatedCalculators = [
  {
    name: 'Oxygen Advantage Efficiency Score',
    slug: 'oxygen-advantage-efficiency-score',
    description: 'Measure how effectively your breathing supports performance.',
  },
  {
    name: 'HRV (Heart Rate Variability) Resilience Index',
    slug: 'hrv-resilience-index',
    description: 'Relate breathing work to autonomic resilience.',
  },
  {
    name: 'Stress Hormone Balance Calculator',
    slug: 'stress-hormone-balance-calculator',
    description: 'Track stress responses alongside breathwork.',
  },
  {
    name: 'Sleep Optimization Routine Score',
    slug: 'sleep-optimization-routine-score',
    description: 'Assess sleep hygiene that interacts with breathing and CO₂ tolerance.',
  },
];

const baseUrl = 'https://mycalculating.com/category/health-fitness/breath-hold-co2-tolerance-calculator';

const schemaMarkup = {
  '@context': 'https://schema.org',
  '@graph': [
    {
      '@type': 'BreadcrumbList',
      itemListElement: [
        { '@type': 'ListItem', position: 1, name: 'Home', item: 'https://mycalculating.com' },
        { '@type': 'ListItem', position: 2, name: 'Health & Fitness', item: 'https://mycalculating.com/category/health-fitness' },
        { '@type': 'ListItem', position: 3, name: 'Breath-Hold CO₂ Tolerance Calculator', item: baseUrl },
      ],
    },
    {
      '@type': 'SoftwareApplication',
      name: 'Breath-Hold CO₂ Tolerance Calculator',
      applicationCategory: 'Calculator',
      operatingSystem: 'Web Browser',
      description: 'Estimate CO₂ tolerance and breathing efficiency from breath-hold times and resting breathing rate.',
      url: baseUrl,
      offers: { '@type': 'Offer', price: '0', priceCurrency: 'USD' },
    },
  ],
};

const clamp = (value: number, min: number, max: number) => Math.min(max, Math.max(min, value));

const calculateResult = (values: FormValues): ResultPayload => {
  const { comfortableHoldSeconds, strongUrgeHoldSeconds, breathsPerMinuteAtRest, perceivedAnxietyScore } = values;

  const comfortableScore = clamp((comfortableHoldSeconds / 40) * 40, 0, 40); // 40s reference
  const strongScore = clamp((strongUrgeHoldSeconds / 120) * 40, 0, 40); // 2 min reference
  const ratePenalty = clamp((breathsPerMinuteAtRest - 12) / 6 * 20, -10, 30); // >18 bpm penalized
  const anxietyPenalty = clamp(perceivedAnxietyScore / 10 * 20, 0, 20);

  const rawTolerance = comfortableScore + strongScore - ratePenalty - anxietyPenalty;
  const co2ToleranceScore = clamp(rawTolerance, 0, 100);

  const breathingEfficiencyScore = clamp(
    (comfortableScore * 0.4 + strongScore * 0.3 + (20 - ratePenalty) * 1.2 + (20 - anxietyPenalty)) / 2,
    0,
    100,
  );

  let status: ResultPayload['status'] = 'good';
  let interpretation = 'Your CO₂ tolerance and breathing pattern appear reasonably supportive for breathwork and stress resilience.';

  if (co2ToleranceScore >= 75 && breathsPerMinuteAtRest <= 14) {
    status = 'optimal';
    interpretation = 'You show strong CO₂ tolerance and efficient breathing; you may be well positioned for breath training or endurance work.';
  } else if (co2ToleranceScore < 45 || breathsPerMinuteAtRest > 18) {
    status = 'moderate';
    interpretation = 'Your CO₂ tolerance or breathing rate may be limiting comfort under stress; gentle training and lifestyle changes can help.';
  } else if (co2ToleranceScore < 30 && perceivedAnxietyScore >= 6) {
    status = 'low';
    interpretation = 'Low tolerance and high breath-related anxiety suggest that professional guidance and cautious training are advisable.';
  }

  const recommendations: string[] = [
    'Practice light, nasal, diaphragmatic breathing at rest to gradually reduce over-breathing.',
    'Use short, comfortable breath holds (never to extreme discomfort) to gently train CO₂ tolerance.',
    'Pair breathwork with good sleep, hydration, and overall stress management.',
  ];

  if (breathsPerMinuteAtRest > 18) {
    recommendations.push('Aim to gradually lower resting breathing rate towards 10–14 breaths per minute under guidance.');
  }

  if (perceivedAnxietyScore >= 7) {
    recommendations.push('Work with a qualified breath coach or therapist, especially if breath holding reliably triggers panic or distress.');
  }

  const plan = [
    { label: 'This Week', detail: 'Record a few breath-hold tests and resting breathing rates under calm conditions to build a baseline.' },
    { label: 'This Month', detail: 'Introduce 5–10 minutes of gentle breathwork most days, avoiding aggressive protocols without guidance.' },
    { label: 'Ongoing', detail: 'Reassess your scores monthly and adjust training volume in concert with overall stress and recovery.' },
  ];

  return {
    comfortableHoldSeconds,
    strongUrgeHoldSeconds,
    breathsPerMinuteAtRest,
    perceivedAnxietyScore,
    co2ToleranceScore: Number(co2ToleranceScore.toFixed(1)),
    breathingEfficiencyScore: Number(breathingEfficiencyScore.toFixed(1)),
    status,
    interpretation,
    recommendations,
    plan,
  };
};

export default function BreathHoldCo2ToleranceCalculator() {
  const [result, setResult] = useState<ResultPayload | null>(null);

  const form = useForm<FormValues>({
    resolver: zodResolver(formSchema),
    defaultValues: {
      comfortableHoldSeconds: undefined,
      strongUrgeHoldSeconds: undefined,
      breathsPerMinuteAtRest: undefined,
      perceivedAnxietyScore: undefined,
    },
  });

  return (
    <div className="space-y-8">
      <Script id="breath-hold-co2-tolerance-schema" type="application/ld+json" strategy="afterInteractive" dangerouslySetInnerHTML={{ __html: JSON.stringify(schemaMarkup) }} />

      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <Activity className="h-5 w-5" />
            Breath-Hold CO₂ Tolerance Calculator
          </CardTitle>
          <CardDescription>Estimate your comfort with rising CO₂ and breathing efficiency for breathwork and performance.</CardDescription>
        </CardHeader>
      </Card>

      <Card>
        <CardHeader>
          <CardTitle>Input your breath-hold data</CardTitle>
        </CardHeader>
        <CardContent>
          <Form {...form}>
            <form onSubmit={form.handleSubmit((values) => setResult(calculateResult(values)))} className="space-y-6">
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <FormField
                  control={form.control}
                  name="comfortableHoldSeconds"
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel>Comfortable breath hold (s)</FormLabel>
                      <FormControl>
                        <Input type="number" step="1" placeholder="e.g., 25" value={field.value ?? ''} onChange={(e) => field.onChange(e.target.value === '' ? undefined : Number(e.target.value))} />
                      </FormControl>
                      <FormMessage />
                    </FormItem>
                  )}
                />
                <FormField
                  control={form.control}
                  name="strongUrgeHoldSeconds"
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel>Hold until strong urge (s)</FormLabel>
                      <FormControl>
                        <Input type="number" step="1" placeholder="e.g., 60" value={field.value ?? ''} onChange={(e) => field.onChange(e.target.value === '' ? undefined : Number(e.target.value))} />
                      </FormControl>
                      <FormMessage />
                    </FormItem>
                  )}
                />
                <FormField
                  control={form.control}
                  name="breathsPerMinuteAtRest"
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel>Resting breathing rate (breaths/min)</FormLabel>
                      <FormControl>
                        <Input type="number" step="1" placeholder="e.g., 14" value={field.value ?? ''} onChange={(e) => field.onChange(e.target.value === '' ? undefined : Number(e.target.value))} />
                      </FormControl>
                      <FormMessage />
                    </FormItem>
                  )}
                />
                <FormField
                  control={form.control}
                  name="perceivedAnxietyScore"
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel>Breath-related anxiety (0–10)</FormLabel>
                      <FormControl>
                        <Input type="number" step="0.5" placeholder="e.g., 3" value={field.value ?? ''} onChange={(e) => field.onChange(e.target.value === '' ? undefined : Number(e.target.value))} />
                      </FormControl>
                      <FormMessage />
                    </FormItem>
                  )}
                />
              </div>
              <Button type="submit" className="w-full md:w-auto">
                Calculate CO₂ tolerance
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
            <CardDescription>See CO₂ tolerance score, breathing efficiency, and training suggestions.</CardDescription>
          </CardHeader>
          <CardContent className="space-y-6">
            <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
              <div className="p-4 border rounded">
                <p className="text-sm text-muted-foreground">CO₂ tolerance</p>
                <p className="text-2xl font-semibold text-primary">{result.co2ToleranceScore}</p>
                <p className="text-xs text-muted-foreground">0–100 scale</p>
              </div>
              <div className="p-4 border rounded">
                <p className="text-sm text-muted-foreground">Breathing efficiency</p>
                <p className="text-2xl font-semibold text-primary">{result.breathingEfficiencyScore}</p>
                <p className="text-xs text-muted-foreground">Higher = more efficient</p>
              </div>
              <div className="p-4 border rounded">
                <p className="text-sm text-muted-foreground">Resting rate</p>
                <p className="text-2xl font-semibold text-primary">{result.breathsPerMinuteAtRest}</p>
                <p className="text-xs text-muted-foreground">Breaths/min</p>
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
            <strong>Comfortable and strong-hold components</strong> scale your breath-hold times relative to reference values (about 40 s and 120 s) to estimate tolerance capacity.
          </p>
          <p>
            <strong>Rate and anxiety penalties</strong> reduce the score when resting breathing is fast or when breath-related anxiety is high, reflecting real-world comfort and control.
          </p>
          <p>
            <strong>CO₂ tolerance score</strong> is a 0–100 composite, while the breathing efficiency score puts extra weight on slow, relaxed breathing and lower anxiety.
          </p>
          <p>These equations are heuristic and should not be used as medical or performance clearance tools.</p>
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
                <p className="text-sm text-muted-foreground">Comfort vs strong hold ratio</p>
                <p className="text-xl font-semibold text-primary">
                  {(result.strongUrgeHoldSeconds / result.comfortableHoldSeconds).toFixed(2)}
                </p>
                <p className="text-xs text-muted-foreground">Higher = better tolerance</p>
              </div>
              <div className="p-4 border rounded">
                <p className="text-sm text-muted-foreground">Comfortable hold quality</p>
                <p className="text-xl font-semibold text-primary">
                  {(result.comfortableHoldSeconds / 40 * 100).toFixed(0)}%
                </p>
                <p className="text-xs text-muted-foreground">Relative to 40 s</p>
              </div>
              <div className="p-4 border rounded">
                <p className="text-sm text-muted-foreground">Anxiety impact</p>
                <p className="text-xl font-semibold text-primary">
                  {(result.perceivedAnxietyScore / 10 * 100).toFixed(0)}%
                </p>
                <p className="text-xs text-muted-foreground">Higher = more limiting</p>
              </div>
            </div>
          ) : (
            <p className="text-sm text-muted-foreground">Enter your breath-hold data to see additional metrics.</p>
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
                <Link href={`/health-fitness/${calc.slug}`} className="text-primary hover:underline">
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
        itemScope
        itemType="https://schema.org/MedicalWebPage"
      >
        <meta
          itemProp="name"
          content="Breath-Hold CO₂ Tolerance: Safer Approaches to Breathwork and Performance"
        />
        <meta itemProp="description" content="Learn how to measure breath-hold comfort, interpret CO₂ tolerance, and design safe, effective breath training progressions." />
        <meta
          itemProp="keywords"
          content="breath-hold CO2 tolerance calculator, breathwork safety, Oxygen Advantage, Buteyko, freediving preparation"
        />
        <meta itemProp="author" content="[Your Site's Health Team]" />
        <meta itemProp="datePublished" content="2025-12-01" />
        <meta itemProp="url" content="/definitive-breath-hold-co2-tolerance-guide" />

        <h1 className="text-3xl md:text-4xl font-extrabold text-foreground mb=">
          Breath-Hold CO₂ Tolerance: Building Comfort with the Urge to Breathe
        </h1>
        <p className="text-lg italic text-gray-700">
          Breathwork is powerful—but pushing too hard can backfire. This guide explains how to interpret breath-hold numbers and train tolerance without compromising safety.
        </p>

        <h2 className="text-2xl font-bold text-foreground mt-8 mb-4">1. The Physiology Behind the Urge to Breathe</h2>
        <p>
          For most people, the discomfort during a breath hold is driven more by rising CO₂ than falling oxygen. Understanding this helps reframe sensations from “I am suffocating” to “my body is sending a strong but not
          dangerous signal.”
        </p>

        <h2 className="text-2xl font-bold text-foreground mt=">
          2. Why Comfort Matters More Than Max Duration
        </h2>
        <p>
          Elite freedivers can hold their breath for many minutes thanks to specific training and supervision. For everyday health and performance, moderate improvements in comfortable hold times and reduced resting breathing
          rates are usually sufficient.
        </p>

        <h2 className="text-2xl font-bold text-foreground mt-8 mb-4">3. Integrating CO₂ Training with Life and Sport</h2>
        <p>
          Better CO₂ tolerance can support calmer responses to stress, improved endurance, and more efficient breathing. However, it should be balanced with overall training load and not attempted during illness, extreme fatigue,
          or without safety measures.
        </p>

        <h2 className="text-2xl font-bold text-foreground mt-8 mb-4">4. Red Flags and When to Stop</h2>
        <p>
          Dizziness, chest pain, visual changes, or confusion are signs to stop immediately and seek medical advice. Breath-hold work should never be done in water without direct supervision and safety protocols.
        </p>

        <hr />
        <h2 className="text-2xl font-bold text-foreground pt-8" itemProp="articleSection">
          Conclusion
        </h2>
        <p>
          Used thoughtfully, CO₂ tolerance work can be a valuable part of a broader resilience toolkit. This calculator and guide help you track progress and keep your experiments within a safe, sustainable range.
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
          <p>This tool estimates CO₂ tolerance and breathing efficiency using simple breath-hold and breathing-rate inputs.</p>
          <p>It provides scores, interpretation, recommendations, and a detailed guide to support safe, evidence-informed breath training.</p>
          <p>Always pair these insights with professional guidance, especially if you have medical conditions or practice intense breathwork.</p>
        </CardContent>
      </Card>
    </div>
  );
}



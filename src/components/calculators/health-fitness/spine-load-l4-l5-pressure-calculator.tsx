'use client';

import { useState } from 'react';
import Script from 'next/script';
import Link from 'next/link';
import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import { z } from 'zod';
import { HeartPulse, Target, Activity, Shield, BookMarked } from 'lucide-react';

import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Form, FormControl, FormField, FormItem, FormLabel, FormMessage } from '@/components/ui/form';
import { Input } from '@/components/ui/input';

const formSchema = z.object({
  bodyWeightKg: z.number({ invalid_type_error: 'Enter body weight' }).min(30).max(200),
  externalLoadKg: z.number({ invalid_type_error: 'Enter external load' }).min(0).max(80),
  trunkAngleDeg: z.number({ invalid_type_error: 'Enter trunk angle' }).min(0).max(90),
  repsPerHour: z.number({ invalid_type_error: 'Enter repetitions per hour' }).min(0).max(600),
  hoursPerDay: z.number({ invalid_type_error: 'Enter hours per day' }).min(0).max(12),
});

type FormValues = z.infer<typeof formSchema>;

type ResultPayload = {
  peakCompressionNewton: number;
  compressionMultipleBW: number;
  cumulativeLoadIndex: number;
  riskLevel: 'low' | 'moderate' | 'high';
  interpretation: string;
  recommendations: string[];
  plan: { label: string; detail: string }[];
};

const steps = [
  'Enter your approximate body weight in kilograms.',
  'Log how much additional weight you typically lift or hold near your torso (kg).',
  'Estimate your trunk angle relative to upright when lifting or leaning (0Â° = upright, 90Â° = fully forward).',
  'Enter how many times per hour you repeat this posture or lift, and for how many hours per day.',
  'Review peak compression, bodyweight multiple, and cumulative load index for context.',
];

const faqs = [
  {
    question: 'What does the L4â€“L5 spine load estimate represent?',
    answer:
      'It is a rough estimate of compressive force at the L4â€“L5 level during a common lifting or forward-leaning posture.',
  },
  {
    question: 'Is this a precise biomechanical model?',
    answer:
      'No. It uses simplified assumptions from ergonomics research to provide educational ranges, not clinical-grade values.',
  },
  {
    question: 'Why use bodyweight multiples?',
    answer:
      'Many ergonomic guidelines talk about spinal compression as a multiple of bodyweight; this can be easier to interpret.',
  },
  {
    question: 'What trunk angles are most concerning?',
    answer:
      'Larger forward flexion angles (especially beyond ~45Â°) generally increase spinal loading, particularly with added weight.',
  },
  {
    question: 'Do reps and hours matter as much as peak load?',
    answer:
      'Yes. Repeated moderate loads can accumulate strain even if peak loads stay within guidance ranges.',
  },
  {
    question: 'Should I change rehab or lifting plans based on this?',
    answer:
      'No. Always coordinate with physiotherapists, doctors, or strength professionals before changing programs.',
  },
  {
    question: 'Does bracing or belt use change the estimate?',
    answer:
      'Belts and bracing may alter load distribution but are not modeled here. The calculator assumes unassisted lifting.',
  },
  {
    question: 'Is sitting with a forward lean included?',
    answer:
      'You can approximate similar postures by entering a smaller external load and appropriate angle, but it remains an estimate.',
  },
  {
    question: 'What if pain appears during or after these tasks?',
    answer:
      'Stop or modify the task and consult a clinicianâ€”pain is an important signal beyond any single number here.',
  },
  {
    question: 'Can my workplace safety team use this?',
    answer:
      'Yes. Use it to discuss lifting limits, job rotation, mechanical aids, and alternative task designs.',
  },
];

const relatedCalculators = [
  {
    name: 'Workplace Posture Risk Calculator',
    slug: 'workplace-posture-risk-calculator',
    description: 'Evaluate posture-related risk that pairs with spinal loading.',
  },
  {
    name: 'Occupational Sedentary Risk Score Calculator',
    slug: 'occupational-sedentary-risk-score-calculator',
    description: 'Assess overall sedentary load at work.',
  },
  {
    name: 'Injury Recovery Timeline Calculator',
    slug: 'injury-recovery-timeline-calculator',
    description: 'Plan expectations for recovery after musculoskeletal injuries.',
  },
  {
    name: 'Work Burnout Recovery Time Calculator',
    slug: 'work-burnout-recovery-time-calculator',
    description: 'Blend physical load context with mental and emotional recovery needs.',
  },
];

const baseUrl = 'https://mycalculating.com/health-fitness/spine-load-l4-l5-pressure-calculator';

const schemaMarkup = {
  '@context': 'https://schema.org',
  '@graph': [
    {
      '@type': 'BreadcrumbList',
      itemListElement: [
        { '@type': 'ListItem', position: 1, name: 'Home', item: 'https://mycalculating.com' },
        { '@type': 'ListItem', position: 2, name: 'Health & Fitness', item: 'https://mycalculating.com/health-fitness' },
        { '@type': 'ListItem', position: 3, name: 'Spine Load (L4-L5) Pressure Calculator', item: baseUrl },
      ],
    },
    {
      '@type': 'SoftwareApplication',
      name: 'Spine Load (L4-L5) Pressure Calculator',
      applicationCategory: 'Calculator',
      operatingSystem: 'Web Browser',
      description: 'Estimate L4â€“L5 spinal compression and cumulative load from bodyweight, external load, angle, and repetition.',
      url: baseUrl,
      offers: { '@type': 'Offer', price: '0', priceCurrency: 'USD' },
    },
  ],
};

const clamp = (value: number, min: number, max: number) => Math.min(max, Math.max(min, value));

const calculateResult = (values: FormValues): ResultPayload => {
  const g = 9.81;
  const effectiveMass = values.bodyWeightKg * 0.6 + values.externalLoadKg; // simple torso + load
  const angleFactor = 1 + Math.sin((values.trunkAngleDeg * Math.PI) / 180) * 1.5;
  const peakCompressionNewton = effectiveMass * g * angleFactor;
  const compressionMultipleBW = peakCompressionNewton / (values.bodyWeightKg * g);

  const repsTotal = values.repsPerHour * values.hoursPerDay;
  const cumulativeLoadIndex = clamp((peakCompressionNewton / 1000) * (repsTotal / 100), 0, 300);

  let riskLevel: ResultPayload['riskLevel'] = 'low';
  let interpretation = 'Estimated spinal loading appears within commonly cited safe ranges for many healthy adults.';

  if (compressionMultipleBW >= 6 || cumulativeLoadIndex >= 120) {
    riskLevel = 'moderate';
    interpretation = 'Loads approach moderate concern rangesâ€”technique, rotation, and aids become more important.';
  }
  if (compressionMultipleBW >= 8 || cumulativeLoadIndex >= 200) {
    riskLevel = 'high';
    interpretation =
      'High spinal loading relative to bodyweight or repetition count. Professional ergonomic review is recommended.';
  }

  const recommendations = [
    'Keep loads close to the body and avoid twisting while flexed whenever possible.',
    'Use your legs by bending at the hips and knees rather than only rounding your spine.',
    'Where feasible, split tasks, use trolleys, or share loads to reduce peak compression.',
  ];

  if (riskLevel !== 'low') {
    recommendations.push('Discuss engineering controls (hoists, lift tables) with safety teams for high-load tasks.');
  }
  if (values.trunkAngleDeg > 45) {
    recommendations.push('Experiment with task redesign that allows a more upright trunk angle.');
  }

  const plan = [
    { label: 'Next Lift', detail: 'Practice a slower, deliberate lift keeping load close and spine braced.' },
    {
      label: 'This Week',
      detail: 'Audit your heaviest or most frequent tasks and explore one way to reduce load or reps.',
    },
    {
      label: 'This Month',
      detail: 'Re-test after changes and, if pain persists, consult a physiotherapist or ergonomist.',
    },
  ];

  return {
    peakCompressionNewton,
    compressionMultipleBW,
    cumulativeLoadIndex,
    riskLevel,
    interpretation,
    recommendations,
    plan,
  };
};

export default function SpineLoadL4L5PressureCalculator() {
  const [result, setResult] = useState<ResultPayload | null>(null);

  const form = useForm<FormValues>({
    resolver: zodResolver(formSchema),
    defaultValues: {
      bodyWeightKg: undefined,
      externalLoadKg: undefined,
      trunkAngleDeg: undefined,
      repsPerHour: undefined,
      hoursPerDay: undefined,
    },
  });

  return (
    <div className="space-y-8">
      <Script id="spine-load-l4l5-schema" type="application/ld+json" strategy="afterInteractive" dangerouslySetInnerHTML={{ __html: JSON.stringify(schemaMarkup) }} />

      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <HeartPulse className="h-5 w-5" />
            Spine Load (L4â€“L5) Pressure Calculator
          </CardTitle>
          <CardDescription>Estimate spinal compression and cumulative load for a common lifting or leaning posture.</CardDescription>
        </CardHeader>
      </Card>

      <Card>
        <CardHeader>
          <CardTitle>Input your task snapshot</CardTitle>
        </CardHeader>
        <CardContent>
          <Form {...form}>
            <form onSubmit={form.handleSubmit((values) => setResult(calculateResult(values)))} className="space-y-6">
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <FormField
                  control={form.control}
                  name="bodyWeightKg"
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel>Body weight (kg)</FormLabel>
                      <FormControl>
                        <Input
                          type="number"
                          step="1"
                          placeholder="e.g., 75"
                          value={field.value ?? ''}
                          onChange={(e) => field.onChange(e.target.value === '' ? undefined : Number(e.target.value))}
                        />
                      </FormControl>
                      <FormMessage />
                    </FormItem>
                  )}
                />
                <FormField
                  control={form.control}
                  name="externalLoadKg"
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel>External load (kg)</FormLabel>
                      <FormControl>
                        <Input
                          type="number"
                          step="1"
                          placeholder="e.g., 15"
                          value={field.value ?? ''}
                          onChange={(e) => field.onChange(e.target.value === '' ? undefined : Number(e.target.value))}
                        />
                      </FormControl>
                      <FormMessage />
                    </FormItem>
                  )}
                />
                <FormField
                  control={form.control}
                  name="trunkAngleDeg"
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel>Trunk angle from upright (degrees)</FormLabel>
                      <FormControl>
                        <Input
                          type="number"
                          step="5"
                          placeholder="e.g., 40"
                          value={field.value ?? ''}
                          onChange={(e) => field.onChange(e.target.value === '' ? undefined : Number(e.target.value))}
                        />
                      </FormControl>
                      <FormMessage />
                    </FormItem>
                  )}
                />
                <FormField
                  control={form.control}
                  name="repsPerHour"
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel>Repetitions per hour</FormLabel>
                      <FormControl>
                        <Input
                          type="number"
                          step="10"
                          placeholder="e.g., 120"
                          value={field.value ?? ''}
                          onChange={(e) => field.onChange(e.target.value === '' ? undefined : Number(e.target.value))}
                        />
                      </FormControl>
                      <FormMessage />
                    </FormItem>
                  )}
                />
                <FormField
                  control={form.control}
                  name="hoursPerDay"
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel>Hours per day with this pattern</FormLabel>
                      <FormControl>
                        <Input
                          type="number"
                          step="0.25"
                          placeholder="e.g., 4"
                          value={field.value ?? ''}
                          onChange={(e) => field.onChange(e.target.value === '' ? undefined : Number(e.target.value))}
                        />
                      </FormControl>
                      <FormMessage />
                    </FormItem>
                  )}
                />
              </div>
              <Button type="submit" className="w-full md:w-auto">
                Calculate spine load
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
            <CardDescription>See peak compression, bodyweight multiple, and cumulative load index at a glance.</CardDescription>
          </CardHeader>
          <CardContent className="space-y-6">
            <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
              <div className="p-4 border rounded">
                <p className="text-sm text-muted-foreground">Peak compression</p>
                <p className="text-2xl font-semibold text-primary">{result.peakCompressionNewton.toFixed(0)} N</p>
                <p className="text-xs text-muted-foreground">Approximate L4â€“L5 compressive force.</p>
              </div>
              <div className="p-4 border rounded">
                <p className="text-sm text-muted-foreground">Multiple of bodyweight</p>
                <p className="text-2xl font-semibold text-primary">{result.compressionMultipleBW.toFixed(1)}Ã—</p>
                <p className="text-xs text-muted-foreground">Peak load divided by bodyweight force.</p>
              </div>
              <div className="p-4 border rounded">
                <p className="text-sm text-muted-foreground">Cumulative load index</p>
                <p className="text-2xl font-semibold text-primary">{result.cumulativeLoadIndex.toFixed(0)}</p>
                <p className="text-xs text-muted-foreground">Higher values indicate greater repetitive loading.</p>
              </div>
            </div>
            <div className="p-4 border rounded">
              <p className="text-sm text-muted-foreground">Risk level</p>
              <p className="text-xl font-semibold text-primary capitalize">{result.riskLevel}</p>
              <p className="text-xs text-muted-foreground">{result.interpretation}</p>
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
          <p>
            <strong>Peak compression</strong> â‰ˆ \((0.6 Ã— bodyWeight + externalLoad) Ã— g Ã— (1 + sin(angle) Ã— 1.5)\), where \(g â‰ˆ 9.81
            m/sÂ²\).
          </p>
          <p>
            <strong>Cumulative load index</strong> scales peak compression by total repetitions to highlight repetitive stress alongside
            single lifts.
          </p>
          <p>These are educational approximations only and should complement, not replace, professional ergonomic analysis.</p>
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
                <p className="text-sm text-muted-foreground">Total repetitions per day</p>
                <p className="text-xl font-semibold text-primary">
                  {(form.getValues().repsPerHour ?? 0) * (form.getValues().hoursPerDay ?? 0)}
                </p>
                <p className="text-xs text-muted-foreground">Rough estimate of how often the load pattern repeats.</p>
              </div>
              <div className="p-4 border rounded">
                <p className="text-sm text-muted-foreground">Effective mass (torso + load)</p>
                <p className="text-xl font-semibold text-primary">
                  {(0.6 * (form.getValues().bodyWeightKg ?? 0) + (form.getValues().externalLoadKg ?? 0)).toFixed(1)} kg
                </p>
                <p className="text-xs text-muted-foreground">Approximate mass contributing to spinal compression.</p>
              </div>
              <div className="p-4 border rounded">
                <p className="text-sm text-muted-foreground">Angle factor</p>
                <p className="text-xl font-semibold text-primary">
                  {(1 + Math.sin(((form.getValues().trunkAngleDeg ?? 0) * Math.PI) / 180) * 1.5).toFixed(2)}
                </p>
                <p className="text-xs text-muted-foreground">How trunk angle scales spinal loading in this model.</p>
              </div>
            </div>
          ) : (
            <p className="text-sm text-muted-foreground">Enter your scenario to view detailed supporting metrics.</p>
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
          <p>
            Healthy spines like variety: different loads, angles, and movements across the day rather than the same heavy pattern
            repeated endlessly.
          </p>
          <p>
            Use this calculator to visualize load, then pair it with coaching, training, and ergonomic changes to keep your back resilient
            over the long term.
          </p>
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
            The Spine Load (L4â€“L5) Pressure Calculator estimates peak and cumulative spinal compression using simple ergonomic
            assumptions.
          </p>
          <p>It highlights relative risk levels, offers practical adjustments, and surfaces metrics you can share with safety teams.</p>
          <p>Always treat it as an educational companion to, not a replacement for, professional assessment and medical advice.</p>
        </CardContent>
      </Card>
    </div>
  );
}



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
  heightCm: z.number({ invalid_type_error: 'Enter your height' }).min(120).max(210),
  eyeToFloorCm: z.number({ invalid_type_error: 'Enter eye-to-floor height' }).min(80).max(170),
  deskHeightCm: z.number({ invalid_type_error: 'Enter current desk height' }).min(60).max(120),
  chairHeightCm: z.number({ invalid_type_error: 'Enter current chair height' }).min(30).max(70),
  monitorDistanceCm: z.number({ invalid_type_error: 'Enter monitor distance' }).min(30).max(120),
});

type FormValues = z.infer<typeof formSchema>;

type ResultPayload = {
  setupScore: number;
  status: 'well-aligned' | 'tweak-recommended' | 'rebuild-setup';
  interpretation: string;
  recommendations: string[];
  plan: { label: string; detail: string }[];
};

const steps = [
  'Measure your overall height and approximate eye-to-floor height when seated.',
  'Measure your current desk and chair height in centimeters.',
  'Measure the distance from your eyes to the monitor in a typical working position.',
  'Enter these values into the calculator to see alignment mismatches and a setup score.',
  'Use the recommendations to adjust chair, desk, and monitor for neutral posture.',
];

const faqs = [
  {
    question: 'What does the ergonomic desk setup score represent?',
    answer:
      'It is a simple 0â€“100 score estimating how closely your current setup matches common ergonomic guidelines for desk, chair, and monitor.',
  },
  {
    question: 'Do I need professional measurement tools?',
    answer:
      'No. A tape measure or ruler plus approximate eye height measurements are enough to get useful guidance from this tool.',
  },
  {
    question: 'Can this replace a formal ergonomic assessment?',
    answer:
      'No. It is an educational starting point. For persistent pain or complex needs, see an ergonomist, physiotherapist, or clinician.',
  },
  {
    question: 'How often should I recalibrate my setup?',
    answer:
      'Recheck after changing chairs, desks, monitors, or if you switch between sitting and standing work more often.',
  },
  {
    question: 'What if I share a desk with people of different heights?',
    answer:
      'Use adjustable components (chair height, monitor arm, keyboard tray) and save recommended settings for each person.',
  },
  {
    question: 'Does a laptop-only setup score lower?',
    answer:
      'Usually yes, unless you add an external keyboard and raise the laptop to eye level. The tool will highlight likely tension points.',
  },
  {
    question: 'Why is monitor distance important?',
    answer:
      'Screens that are too close or far can strain eyes and neck as you lean forward or squint to see details.',
  },
  {
    question: 'Can I apply this to standing desks?',
    answer:
      'Yesâ€”ideal elbow and monitor heights are similar. Just treat your standing elbow height as the reference instead of seated.',
  },
  {
    question: 'Does this tool consider keyboard and mouse placement?',
    answer:
      'Indirectly via desk and chair height. For best results, keep keyboard and mouse so elbows rest near 90Â° with relaxed shoulders.',
  },
  {
    question: 'What if pain persists even after changes?',
    answer:
      'Seek professional medical and ergonomic support to rule out other causes and design a tailored plan.',
  },
];

const relatedCalculators = [
  {
    name: 'Workplace Posture Risk Calculator',
    slug: 'workplace-posture-risk-calculator',
    description: 'Screen your posture risk alongside desk ergonomics.',
  },
  {
    name: 'Occupational Sedentary Risk Score Calculator',
    slug: 'occupational-sedentary-risk-score-calculator',
    description: 'Assess overall sedentary load from your workday.',
  },
  {
    name: 'Work Burnout Recovery Time Calculator',
    slug: 'work-burnout-recovery-time-calculator',
    description: 'Layer physical setup insights with mental load recovery.',
  },
  {
    name: 'Spine Load (L4-L5) Pressure Calculator',
    slug: 'spine-load-l4-l5-pressure-calculator',
    description: 'Estimate spinal compression for key lifting or leaning tasks.',
  },
];

const baseUrl = 'https://mycalculating.com/health-fitness/ergonomic-desk-setup-calculator';

const schemaMarkup = {
  '@context': 'https://schema.org',
  '@graph': [
    {
      '@type': 'BreadcrumbList',
      itemListElement: [
        { '@type': 'ListItem', position: 1, name: 'Home', item: 'https://mycalculating.com' },
        { '@type': 'ListItem', position: 2, name: 'Health & Fitness', item: 'https://mycalculating.com/health-fitness' },
        { '@type': 'ListItem', position: 3, name: 'Ergonomic Desk Setup Calculator', item: baseUrl },
      ],
    },
    {
      '@type': 'SoftwareApplication',
      name: 'Ergonomic Desk Setup Calculator',
      applicationCategory: 'Calculator',
      operatingSystem: 'Web Browser',
      description: 'Estimate ergonomic desk, chair, and monitor alignment and get practical adjustment tips.',
      url: baseUrl,
      offers: { '@type': 'Offer', price: '0', priceCurrency: 'USD' },
    },
  ],
};

const clamp = (value: number, min: number, max: number) => Math.min(max, Math.max(min, value));

const calculateResult = (values: FormValues): ResultPayload => {
  const idealDesk = values.heightCm * 0.43; // rough seated elbow height
  const idealChair = values.heightCm * 0.25;
  const idealMonitorDistance = 60; // cm sweet spot

  const deskDiff = Math.abs(values.deskHeightCm - idealDesk);
  const chairDiff = Math.abs(values.chairHeightCm - idealChair);
  const monitorDiff = Math.abs(values.monitorDistanceCm - idealMonitorDistance);
  const eyeToDeskDiff = Math.abs(values.eyeToFloorCm - (values.deskHeightCm + 25)); // 25cm approximate screen center above desk

  const rawPenalty = deskDiff * 0.6 + chairDiff * 0.7 + monitorDiff * 0.5 + eyeToDeskDiff * 0.4;
  const setupScore = Math.round(clamp(100 - rawPenalty, 0, 100));

  let status: ResultPayload['status'] = 'well-aligned';
  let interpretation = 'Your current desk, chair, and monitor heights look broadly ergonomic.';

  if (setupScore < 80) {
    status = 'tweak-recommended';
    interpretation = 'Small alignment changes could noticeably reduce neck, shoulder, or back strain.';
  }
  if (setupScore < 60) {
    status = 'rebuild-setup';
    interpretation = 'Multiple mismatches are present. A fuller ergonomic reset is likely worth the effort.';
  }

  const recommendations = [
    'Adjust your chair so your feet rest flat and knees are near 90Â°, then match desk height to relaxed elbows.',
    'Raise your monitor so the top of the screen is at or slightly below eye level without chin jutting.',
    'Keep the monitor roughly an armâ€™s length away to reduce eye strain and neck craning.',
  ];

  if (setupScore < 80) {
    recommendations.push('Experiment with a keyboard tray or laptop stand to fine-tune angles without new furniture.');
  }
  if (setupScore < 60) {
    recommendations.push('Consider an ergonomic consult, especially if you already experience recurring discomfort.');
  }

  const plan = [
    { label: 'Today', detail: 'Change one dimensionâ€”chair or monitor heightâ€”and notice how your body feels by dayâ€™s end.' },
    {
      label: 'This Week',
      detail: 'Iterate on desk, chair, and monitor positions while logging comfort and focus levels.',
    },
    {
      label: 'This Month',
      detail: 'Recalculate your setup score and, if still low, explore equipment upgrades or professional review.',
    },
  ];

  return { setupScore, status, interpretation, recommendations, plan };
};

export default function ErgonomicDeskSetupCalculator() {
  const [result, setResult] = useState<ResultPayload | null>(null);

  const form = useForm<FormValues>({
    resolver: zodResolver(formSchema),
    defaultValues: {
      heightCm: undefined,
      eyeToFloorCm: undefined,
      deskHeightCm: undefined,
      chairHeightCm: undefined,
      monitorDistanceCm: undefined,
    },
  });

  return (
    <div className="space-y-8">
      <Script id="ergonomic-desk-setup-schema" type="application/ld+json" strategy="afterInteractive" dangerouslySetInnerHTML={{ __html: JSON.stringify(schemaMarkup) }} />

      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <HeartPulse className="h-5 w-5" />
            Ergonomic Desk Setup Calculator
          </CardTitle>
          <CardDescription>Check how closely your current desk, chair, and monitor match ergonomic guidelines.</CardDescription>
        </CardHeader>
      </Card>

      <Card>
        <CardHeader>
          <CardTitle>Input your measurements</CardTitle>
        </CardHeader>
        <CardContent>
          <Form {...form}>
            <form onSubmit={form.handleSubmit((values) => setResult(calculateResult(values)))} className="space-y-6">
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <FormField
                  control={form.control}
                  name="heightCm"
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel>Your height (cm)</FormLabel>
                      <FormControl>
                        <Input
                          type="number"
                          step="1"
                          placeholder="e.g., 172"
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
                  name="eyeToFloorCm"
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel>Eye-to-floor height while seated (cm)</FormLabel>
                      <FormControl>
                        <Input
                          type="number"
                          step="1"
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
                  name="deskHeightCm"
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel>Current desk height (cm)</FormLabel>
                      <FormControl>
                        <Input
                          type="number"
                          step="0.5"
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
                  name="chairHeightCm"
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel>Current chair height from floor to seat (cm)</FormLabel>
                      <FormControl>
                        <Input
                          type="number"
                          step="0.5"
                          placeholder="e.g., 43"
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
                  name="monitorDistanceCm"
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel>Monitor distance from eyes (cm)</FormLabel>
                      <FormControl>
                        <Input
                          type="number"
                          step="1"
                          placeholder="e.g., 60"
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
                Calculate setup score
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
            <CardDescription>See your ergonomic score, alignment status, and narrative explanation.</CardDescription>
          </CardHeader>
          <CardContent className="space-y-6">
            <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
              <div className="p-4 border rounded">
                <p className="text-sm text-muted-foreground">Setup score</p>
                <p className="text-2xl font-semibold text-primary">{result.setupScore}</p>
                <p className="text-xs text-muted-foreground">Out of 100</p>
              </div>
              <div className="p-4 border rounded">
                <p className="text-sm text-muted-foreground">Status</p>
                <p className="text-2xl font-semibold text-primary capitalize">{result.status.replace('-', ' ')}</p>
                <p className="text-xs text-muted-foreground">Higher scores indicate better alignment with guidelines.</p>
              </div>
              <div className="p-4 border rounded">
                <p className="text-sm text-muted-foreground">Summary</p>
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
          <p>
            <strong>Setup score</strong> starts at 100 and subtracts weighted penalties for how far desk, chair, monitor distance, and
            eye-to-screen height drift from common ergonomic targets.
          </p>
          <p>Larger mismatches pull the score down, while close alignment keeps it in the 80â€“100 range.</p>
          <p>This is a heuristic model to highlight likely tension points, not a medical-grade measurement.</p>
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
                <p className="text-sm text-muted-foreground">Ideal desk height (approx.)</p>
                <p className="text-xl font-semibold text-primary">
                  {(form.getValues().heightCm ?? 0 ? (form.getValues().heightCm ?? 0) * 0.43 : 0).toFixed(1)} cm
                </p>
                <p className="text-xs text-muted-foreground">Based on typical seated elbow height.</p>
              </div>
              <div className="p-4 border rounded">
                <p className="text-sm text-muted-foreground">Desk mismatch</p>
                <p className="text-xl font-semibold text-primary">
                  {Math.abs(
                    (form.getValues().deskHeightCm ?? 0) - (form.getValues().heightCm ?? 0) * 0.43,
                  ).toFixed(1)}{' '}
                  cm
                </p>
                <p className="text-xs text-muted-foreground">Difference between current and suggested desk height.</p>
              </div>
              <div className="p-4 border rounded">
                <p className="text-sm text-muted-foreground">Monitor distance delta</p>
                <p className="text-xl font-semibold text-primary">
                  {Math.abs((form.getValues().monitorDistanceCm ?? 0) - 60).toFixed(1)} cm
                </p>
                <p className="text-xs text-muted-foreground">Gap from a typical 60 cm target distance.</p>
              </div>
            </div>
          ) : (
            <p className="text-sm text-muted-foreground">Enter your measurements to reveal additional ergonomic metrics.</p>
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

      <Card>
        <CardHeader>
          <CardTitle>Complete guide snapshot</CardTitle>
        </CardHeader>
        <CardContent className="prose prose-sm dark:prose-invert max-w-none">
          <p>Ergonomics is about stacking small advantagesâ€”better angles, smarter distances, and more comfortable support.</p>
          <p>
            Use this calculator as a quick check, then iterate on your setup over days and weeks rather than chasing one â€œperfectâ€ position.
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
            The Ergonomic Desk Setup Calculator turns a handful of simple measurements into a 0â€“100 alignment score and clear
            recommendations.
          </p>
          <p>It helps you see where to tweak desk, chair, and monitor height before discomfort builds up.</p>
          <p>Use it as a practical ergonomics checklist and share outputs with professionals when refining your setup.</p>
        </CardContent>
      </Card>
    </div>
  );
}



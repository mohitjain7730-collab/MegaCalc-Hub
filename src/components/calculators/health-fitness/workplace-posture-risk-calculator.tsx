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
  sittingHours: z.number({ invalid_type_error: 'Enter sitting hours' }).min(0).max(14),
  breakIntervalMinutes: z.number({ invalid_type_error: 'Enter break interval' }).min(5).max(240),
  liftingWeightKg: z.number({ invalid_type_error: 'Enter typical lifting load' }).min(0).max(50),
  workstationFitScore: z.number({ invalid_type_error: 'Enter workstation fit score' }).min(1).max(10),
  painFrequency: z.number({ invalid_type_error: 'Enter pain frequency' }).min(0).max(10),
});

type FormValues = z.infer<typeof formSchema>;

type ResultPayload = {
  postureRiskScore: number;
  status: 'low' | 'moderate' | 'high';
  interpretation: string;
  recommendations: string[];
  plan: { label: string; detail: string }[];
};

const steps = [
  'Estimate your average daily sitting hours at work.',
  'Enter how often you take movement breaks, in minutes between breaks.',
  'Log the heaviest load you regularly lift or carry during work (kg).',
  'Rate how well your workstation fits you (chair, desk, monitor) from 1 (poor) to 10 (excellent).',
  'Rate how often you feel neck, shoulder, or back discomfort during or after work (0–10).',
];

const faqs = [
  {
    question: 'What does the posture risk score represent?',
    answer:
      'It is a heuristic score that combines sitting time, break spacing, lifting loads, workstation fit, and pain frequency into one marker.',
  },
  {
    question: 'Is this a replacement for ergonomic assessment?',
    answer:
      'No. It is a screening and awareness tool. A qualified ergonomist or physiotherapist can provide tailored assessment.',
  },
  {
    question: 'How often should I use this calculator?',
    answer:
      'Recheck when your workstation or job tasks change, or every few months if you are actively improving your setup.',
  },
  {
    question: 'Do standing desks remove all risk?',
    answer:
      'Standing can reduce some sitting-related issues but introduces its own load. Alternating postures and moving often matters most.',
  },
  {
    question: 'Why include pain frequency?',
    answer:
      'Persistent or frequent discomfort is a strong signal that current loads and posture may not be sustainable.',
  },
  {
    question: 'Does strength training help?',
    answer:
      'Stronger and more conditioned muscles can better tolerate loads, but they do not fully offset poor workstation design.',
  },
  {
    question: 'What if I lift rarely but very heavy?',
    answer:
      'Consider entering the weight you handle on a typical day rather than rare extremes, and note extremes separately for planning.',
  },
  {
    question: 'Can my employer use this data?',
    answer:
      'You can share trends and recommendations with safety or HR teams to support ergonomic improvements.',
  },
  {
    question: 'Is pain always posture-related?',
    answer:
      'Not always—medical, stress, and activity factors can contribute. Consult a clinician if pain is persistent, severe, or worsening.',
  },
  {
    question: 'Should I stop sitting altogether?',
    answer:
      'Most guidance suggests mixing sitting, standing, and walking across the day rather than any single static posture.',
  },
];

const relatedCalculators = [
  {
    name: 'Occupational Sedentary Risk Score Calculator',
    slug: 'occupational-sedentary-risk-score-calculator',
    description: 'Assess broader sedentary load alongside posture risk.',
  },
  {
    name: 'Standing vs Sitting Calorie Burn Calculator',
    slug: 'standing-vs-sitting-calorie-burn-calculator',
    description: 'Compare energy use for different desk setups.',
  },
  {
    name: 'Spine Load (L4-L5) Pressure Calculator',
    slug: 'spine-load-l4-l5-pressure-calculator',
    description: 'Estimate spinal compression loads for lifting or posture scenarios.',
  },
  {
    name: 'Work Burnout Recovery Time Calculator',
    slug: 'work-burnout-recovery-time-calculator',
    description: 'Consider how workload and recovery time interact with physical discomfort.',
  },
];

const baseUrl = 'https://mycalculating.com/category/health-fitness/workplace-posture-risk-calculator';

const schemaMarkup = {
  '@context': 'https://schema.org',
  '@graph': [
    {
      '@type': 'BreadcrumbList',
      itemListElement: [
        { '@type': 'ListItem', position: 1, name: 'Home', item: 'https://mycalculating.com' },
        { '@type': 'ListItem', position: 2, name: 'Health & Fitness', item: 'https://mycalculating.com/category/health-fitness' },
        { '@type': 'ListItem', position: 3, name: 'Workplace Posture Risk Calculator', item: baseUrl },
      ],
    },
    {
      '@type': 'SoftwareApplication',
      name: 'Workplace Posture Risk Calculator',
      applicationCategory: 'Calculator',
      operatingSystem: 'Web Browser',
      description: 'Screen for posture-related workplace risk using sitting time, breaks, lifting load, and pain frequency.',
      url: baseUrl,
      offers: { '@type': 'Offer', price: '0', priceCurrency: 'USD' },
    },
  ],
};

const clamp = (value: number, min: number, max: number) => Math.min(max, Math.max(min, value));

const calculateResult = (values: FormValues): ResultPayload => {
  const sittingFactor = values.sittingHours * 4;
  const breakFactor = clamp(90 / values.breakIntervalMinutes, 0.5, 6) * 5;
  const liftingFactor = values.liftingWeightKg * 0.8;
  const workstationBuffer = (values.workstationFitScore - 5) * 3;
  const painFactor = values.painFrequency * 3;

  const rawScore = sittingFactor + breakFactor + liftingFactor + painFactor - workstationBuffer;
  const postureRiskScore = Math.round(clamp(rawScore, 0, 100));

  let status: ResultPayload['status'] = 'low';
  let interpretation = 'Current posture and workload pattern suggest relatively low musculoskeletal risk.';

  if (postureRiskScore >= 35 && postureRiskScore < 70) {
    status = 'moderate';
    interpretation = 'Moderate risk. Target focused ergonomic tweaks and more frequent movement breaks.';
  }
  if (postureRiskScore >= 70) {
    status = 'high';
    interpretation = 'High risk. An ergonomic assessment and medical review are advisable, especially if pain is frequent.';
  }

  const recommendations = [
    'Set a timer to stand, stretch, or walk for 1–3 minutes every 30–60 minutes of sitting.',
    'Adjust chair height so hips are slightly above knees and feet are flat or supported.',
    'Raise your monitor so the top of the screen is at or slightly below eye level.',
  ];

  if (status !== 'low') {
    recommendations.push('Consider a formal ergonomic assessment or physiotherapy consult for personalized advice.');
  }
  if (values.painFrequency >= 5) {
    recommendations.push('Document when and where pain appears to share better detail with healthcare providers.');
  }

  const plan = [
    { label: 'Today', detail: 'Change one workstation element—chair height, monitor position, or keyboard distance.' },
    { label: 'This Week', detail: 'Track sitting hours and break intervals to see how often you truly move.' },
    {
      label: 'This Month',
      detail: 'Recheck your score after tweaks, and escalate to ergonomic or medical review if pain persists.',
    },
  ];

  return { postureRiskScore, status, interpretation, recommendations, plan };
};

export default function WorkplacePostureRiskCalculator() {
  const [result, setResult] = useState<ResultPayload | null>(null);

  const form = useForm<FormValues>({
    resolver: zodResolver(formSchema),
    defaultValues: {
      sittingHours: undefined,
      breakIntervalMinutes: undefined,
      liftingWeightKg: undefined,
      workstationFitScore: undefined,
      painFrequency: undefined,
    },
  });

  return (
    <div className="space-y-8">
      <Script id="workplace-posture-risk-schema" type="application/ld+json" strategy="afterInteractive" dangerouslySetInnerHTML={{ __html: JSON.stringify(schemaMarkup) }} />

      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <HeartPulse className="h-5 w-5" />
            Workplace Posture Risk Calculator
          </CardTitle>
          <CardDescription>Estimate posture-related musculoskeletal risk from your current workstation pattern.</CardDescription>
        </CardHeader>
      </Card>

      <Card>
        <CardHeader>
          <CardTitle>Input your posture snapshot</CardTitle>
        </CardHeader>
        <CardContent>
          <Form {...form}>
            <form onSubmit={form.handleSubmit((values) => setResult(calculateResult(values)))} className="space-y-6">
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <FormField
                  control={form.control}
                  name="sittingHours"
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel>Daily sitting time at work (hours)</FormLabel>
                      <FormControl>
                        <Input
                          type="number"
                          step="0.5"
                          placeholder="e.g., 8"
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
                  name="breakIntervalMinutes"
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel>Minutes between posture breaks</FormLabel>
                      <FormControl>
                        <Input
                          type="number"
                          step="5"
                          placeholder="e.g., 45"
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
                  name="liftingWeightKg"
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel>Typical lifting/carrying load (kg)</FormLabel>
                      <FormControl>
                        <Input
                          type="number"
                          step="1"
                          placeholder="e.g., 10"
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
                  name="workstationFitScore"
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel>Workstation fit (1–10)</FormLabel>
                      <FormControl>
                        <Input
                          type="number"
                          step="1"
                          placeholder="e.g., 6"
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
                  name="painFrequency"
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel>Neck/back pain frequency (0–10)</FormLabel>
                      <FormControl>
                        <Input
                          type="number"
                          step="1"
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
                Calculate posture risk
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
            <CardDescription>View your posture risk score, status band, and qualitative explanation.</CardDescription>
          </CardHeader>
          <CardContent className="space-y-6">
            <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
              <div className="p-4 border rounded">
                <p className="text-sm text-muted-foreground">Posture risk score</p>
                <p className="text-2xl font-semibold text-primary">{result.postureRiskScore}</p>
                <p className="text-xs text-muted-foreground">Scaled 0–100</p>
              </div>
              <div className="p-4 border rounded">
                <p className="text-sm text-muted-foreground">Status</p>
                <p className="text-2xl font-semibold text-primary capitalize">{result.status}</p>
                <p className="text-xs text-muted-foreground">Higher scores indicate greater musculoskeletal load.</p>
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
            <strong>Posture risk score</strong> ≈ clamp\(sittingHours × 4 + breakFactor + lifting × 0.8 + pain × 3 − (fit − 5) × 3\) on a
            0–100 scale, where breakFactor scales long uninterrupted sitting as higher risk.
          </p>
          <p>Scores are a simplification and should guide ergonomic tweaks and professional review, not replace them.</p>
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
                <p className="text-sm text-muted-foreground">Breaks per workday</p>
                <p className="text-xl font-semibold text-primary">
                  {(form.getValues().breakIntervalMinutes ?? 0) > 0
                    ? (Math.round((form.getValues().sittingHours ?? 0) * 60 / (form.getValues().breakIntervalMinutes ?? 1)))
                    : 0}
                </p>
                <p className="text-xs text-muted-foreground">Approximate opportunities to reset posture.</p>
              </div>
              <div className="p-4 border rounded">
                <p className="text-sm text-muted-foreground">Daily load index</p>
                <p className="text-xl font-semibold text-primary">
                  {((form.getValues().sittingHours ?? 0) * (form.getValues().liftingWeightKg ?? 0)).toFixed(1)}
                </p>
                <p className="text-xs text-muted-foreground">Very rough composite of sitting × load.</p>
              </div>
              <div className="p-4 border rounded">
                <p className="text-sm text-muted-foreground">Fit buffer</p>
                <p className="text-xl font-semibold text-primary">
                  {(form.getValues().workstationFitScore ?? 0) >= 7 ? 'Helpful' : 'Needs tuning'}
                </p>
                <p className="text-xs text-muted-foreground">Better fit can offset some load, but not all.</p>
              </div>
            </div>
          ) : (
            <p className="text-sm text-muted-foreground">Enter your snapshot to explore deeper posture metrics.</p>
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
          <p>Good posture is less about “perfect” alignment and more about varied, supported positions throughout the day.</p>
          <p>
            Use this tool to surface posture patterns, then combine it with movement variety, strength work, and professional guidance for
            long-term comfort.
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
          <p>The Workplace Posture Risk Calculator blends sitting time, breaks, lifting, workstation fit, and pain into one risk score.</p>
          <p>It highlights low, moderate, or high posture-related risk and suggests practical ergonomic next steps.</p>
          <p>Pair it with professional ergonomic or clinical support when discomfort is frequent, severe, or worsening.</p>
        </CardContent>
      </Card>
    </div>
  );
}



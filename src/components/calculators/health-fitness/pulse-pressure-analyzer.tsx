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
  systolicPressure: z.number({ invalid_type_error: 'Enter systolic pressure' }).min(80).max(250),
  diastolicPressure: z.number({ invalid_type_error: 'Enter diastolic pressure' }).min(40).max(150),
  pulsePressure: z.number({ invalid_type_error: 'Enter pulse pressure' }).min(20).max(120).optional(),
  age: z.number({ invalid_type_error: 'Enter age' }).min(1).max(100),
});

type FormValues = z.infer<typeof formSchema>;

type ResultPayload = {
  systolicPressure: number;
  diastolicPressure: number;
  pulsePressure: number;
  pulsePressureIndex: number;
  status: 'optimal' | 'good' | 'moderate' | 'low';
  interpretation: string;
  recommendations: string[];
  plan: { label: string; detail: string }[];
};

const steps = [
  'Enter systolic blood pressure (mmHg) from blood pressure measurement.',
  'Enter diastolic blood pressure (mmHg) from blood pressure measurement.',
  'Optionally enter pulse pressure if calculated (mmHg).',
  'Enter your age (pulse pressure can change with age).',
  'Review pulse pressure, cardiovascular status, and recommendations.',
];

const faqs = [
  {
    question: 'What is pulse pressure?',
    answer:
      'Pulse pressure is the difference between systolic and diastolic blood pressure. It reflects the force the heart generates with each heartbeat and provides information about arterial stiffness and cardiovascular health.',
  },
  {
    question: 'How is pulse pressure calculated?',
    answer:
      'Pulse pressure = systolic blood pressure - diastolic blood pressure. For example, if BP is 120/80 mmHg, pulse pressure is 120 - 80 = 40 mmHg.',
  },
  {
    question: 'What are normal pulse pressure values?',
    answer:
      'Normal pulse pressure: 40-60 mmHg. Values below 40 mmHg may indicate low stroke volume or heart problems. Values above 60 mmHg may indicate arterial stiffness or hypertension.',
  },
  {
    question: 'What causes high pulse pressure?',
    answer:
      'High pulse pressure can result from arterial stiffness (aging, atherosclerosis), isolated systolic hypertension, aortic valve regurgitation, hyperthyroidism, or conditions affecting arterial compliance.',
  },
  {
    question: 'What causes low pulse pressure?',
    answer:
      'Low pulse pressure can result from low stroke volume, heart failure, shock, aortic stenosis, pericardial effusion, or conditions reducing cardiac output or increasing peripheral resistance.',
  },
  {
    question: 'Does age affect pulse pressure?',
    answer:
      'Yes. Pulse pressure typically increases with age due to arterial stiffening and reduced arterial compliance. This is a normal part of aging but can indicate increased cardiovascular risk.',
  },
  {
    question: 'What is the relationship with cardiovascular risk?',
    answer:
      'High pulse pressure (especially >60 mmHg) is associated with increased cardiovascular risk, including stroke, heart attack, and heart failure. It reflects arterial stiffness and vascular aging.',
  },
  {
    question: 'Can I track pulse pressure at home?',
    answer:
      'Yes. Pulse pressure can be calculated from home blood pressure measurements. Regular monitoring of both systolic and diastolic pressure allows calculation of pulse pressure trends over time.',
  },
  {
    question: 'What about mean arterial pressure?',
    answer:
      'Mean arterial pressure (MAP) is the average pressure during one cardiac cycle. It is calculated as: MAP = DBP + 1/3(PP), where DBP is diastolic and PP is pulse pressure.',
  },
  {
    question: 'When should I consult a healthcare provider?',
    answer:
      'Consult a healthcare provider if pulse pressure is significantly abnormal (&lt;30 or &gt;60 mmHg), if you have cardiovascular symptoms, or if you have concerns about blood pressure or cardiovascular health.',
  },
];

const relatedCalculators = [
  {
    name: 'Cardiac Output (Q) Calculator',
    slug: 'cardiac-output-q-calculator',
    description: 'Calculate cardiac output alongside pulse pressure.',
  },
  {
    name: 'Peripheral Resistance Index Calculator',
    slug: 'peripheral-resistance-index-calculator',
    description: 'Assess cardiovascular health comprehensively.',
  },
  {
    name: 'Blood Volume Estimator',
    slug: 'blood-volume-estimator',
    description: 'Evaluate complete cardiovascular parameters.',
  },
  {
    name: 'Hemoglobin (Hb) Level Estimator',
    slug: 'hemoglobin-hb-level-estimator',
    description: 'Monitor blood health components.',
  },
];

const baseUrl = 'https://mycalculating.com/health-fitness/pulse-pressure-analyzer';

const schemaMarkup = {
  '@context': 'https://schema.org',
  '@graph': [
    {
      '@type': 'BreadcrumbList',
      itemListElement: [
        { '@type': 'ListItem', position: 1, name: 'Home', item: 'https://mycalculating.com' },
        { '@type': 'ListItem', position: 2, name: 'Health & Fitness', item: 'https://mycalculating.com/health-fitness' },
        { '@type': 'ListItem', position: 3, name: 'Pulse Pressure Analyzer', item: baseUrl },
      ],
    },
    {
      '@type': 'SoftwareApplication',
      name: 'Pulse Pressure Analyzer',
      applicationCategory: 'Calculator',
      operatingSystem: 'Web Browser',
      description: 'Analyze pulse pressure from systolic pressure, diastolic pressure, pulse pressure, and age.',
      url: baseUrl,
      offers: { '@type': 'Offer', price: '0', priceCurrency: 'USD' },
    },
  ],
};

const clamp = (value: number, min: number, max: number) => Math.min(max, Math.max(min, value));

const calculateResult = (values: FormValues): ResultPayload => {
  const systolicPressure = values.systolicPressure;
  const diastolicPressure = values.diastolicPressure;
  
  let pulsePressure: number;
  
  if (values.pulsePressure) {
    // Use provided pulse pressure
    pulsePressure = values.pulsePressure;
  } else {
    // Calculate from systolic and diastolic
    pulsePressure = systolicPressure - diastolicPressure;
  }
  
  // Normal range: 40-60 mmHg
  const minNormal = 40;
  const maxNormal = 60;
  const midNormal = 50;
  
  // Calculate pulse pressure index (0-100)
  let pulsePressureIndex: number;
  if (pulsePressure >= minNormal && pulsePressure <= maxNormal) {
    pulsePressureIndex = 50 + ((pulsePressure - midNormal) / (maxNormal - midNormal)) * 50;
  } else if (pulsePressure < minNormal) {
    pulsePressureIndex = (pulsePressure / minNormal) * 50;
  } else {
    pulsePressureIndex = 50 + ((pulsePressure - maxNormal) / 60) * 50; // Penalize high values
  }
  
  pulsePressureIndex = clamp(pulsePressureIndex, 0, 100);

  let status: ResultPayload['status'] = 'optimal';
  let interpretation = 'Your pulse pressure appears normal. Continue maintaining healthy cardiovascular function.';

  if (pulsePressure < 25 || pulsePressure > 80) {
    status = 'low';
    interpretation = 'Your pulse pressure is significantly abnormal. This may indicate serious cardiovascular issues. Consult a healthcare provider immediately for evaluation.';
  } else if (pulsePressure < 30 || pulsePressure > 60) {
    status = 'moderate';
    interpretation = 'Your pulse pressure is outside normal range. Monitor closely and consult healthcare provider for guidance.';
  } else if (pulsePressureIndex < 70) {
    status = 'good';
    interpretation = 'Your pulse pressure is good. Continue maintaining healthy lifestyle to support cardiovascular function.';
  }

  const recommendations = [
    'Manage blood pressure through lifestyle modifications: maintain healthy weight, regular exercise, reduce sodium intake, and manage stress to support optimal pulse pressure.',
    'Support cardiovascular health through regular physical activity and a heart-healthy diet, which can help maintain arterial compliance and reduce arterial stiffness.',
    'Follow healthcare provider recommendations for blood pressure management, including medications if prescribed, to maintain optimal pulse pressure and reduce cardiovascular risk.',
  ];
  if (status === 'low' || status === 'moderate') {
    recommendations.push('Consult a healthcare provider for comprehensive cardiovascular evaluation, including assessment of arterial stiffness and appropriate management strategies.');
  }
  if (pulsePressure > 60) {
    recommendations.push('Address high pulse pressure promptly. This may indicate arterial stiffness and increased cardiovascular risk. Lifestyle changes and medications may be needed.');
  }
  if (pulsePressure < 30) {
    recommendations.push('Address low pulse pressure promptly. This may indicate reduced stroke volume or heart problems requiring medical evaluation and treatment.');
  }

  const plan = [
    { label: 'This Week', detail: 'Review blood pressure measurements (systolic and diastolic). Calculate pulse pressure and assess cardiovascular status.' },
    { label: 'This Month', detail: 'Implement cardiovascular health improvements: blood pressure management, regular exercise, and follow healthcare provider recommendations.' },
    { label: 'Ongoing', detail: 'Monitor pulse pressure regularly through blood pressure measurements. Address any persistent abnormalities with medical guidance and appropriate treatment.' },
  ];

  return { systolicPressure, diastolicPressure, pulsePressure, pulsePressureIndex, status, interpretation, recommendations, plan };
};

export default function PulsePressureAnalyzer() {
  const [result, setResult] = useState<ResultPayload | null>(null);

  const form = useForm<FormValues>({
    resolver: zodResolver(formSchema),
    defaultValues: {
      systolicPressure: undefined,
      diastolicPressure: undefined,
      pulsePressure: undefined,
      age: undefined,
    },
  });

  return (
    <div className="space-y-8">
      <Script id="pulse-pressure-schema" type="application/ld+json" strategy="afterInteractive" dangerouslySetInnerHTML={{ __html: JSON.stringify(schemaMarkup) }} />

      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <Activity className="h-5 w-5" />
            Pulse Pressure Analyzer
          </CardTitle>
          <CardDescription>Analyze pulse pressure from systolic pressure, diastolic pressure, pulse pressure, and age.</CardDescription>
        </CardHeader>
      </Card>

      <Card>
        <CardHeader>
          <CardTitle>Input your pulse pressure data</CardTitle>
        </CardHeader>
        <CardContent>
          <Form {...form}>
            <form onSubmit={form.handleSubmit((values) => setResult(calculateResult(values)))} className="space-y-6">
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <FormField
                  control={form.control}
                  name="systolicPressure"
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel>Systolic pressure (mmHg)</FormLabel>
                      <FormControl>
                        <Input type="number" step="1" placeholder="e.g., 120" value={field.value ?? ''} onChange={(e) => field.onChange(e.target.value === '' ? undefined : Number(e.target.value))} />
                      </FormControl>
                      <FormMessage />
                    </FormItem>
                  )}
                />
                <FormField
                  control={form.control}
                  name="diastolicPressure"
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel>Diastolic pressure (mmHg)</FormLabel>
                      <FormControl>
                        <Input type="number" step="1" placeholder="e.g., 80" value={field.value ?? ''} onChange={(e) => field.onChange(e.target.value === '' ? undefined : Number(e.target.value))} />
                      </FormControl>
                      <FormMessage />
                    </FormItem>
                  )}
                />
                <FormField
                  control={form.control}
                  name="pulsePressure"
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel>Pulse pressure (mmHg) (optional)</FormLabel>
                      <FormControl>
                        <Input type="number" step="1" placeholder="e.g., 40" value={field.value ?? ''} onChange={(e) => field.onChange(e.target.value === '' ? undefined : Number(e.target.value))} />
                      </FormControl>
                      <FormMessage />
                    </FormItem>
                  )}
                />
                <FormField
                  control={form.control}
                  name="age"
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel>Age (years)</FormLabel>
                      <FormControl>
                        <Input type="number" step="1" placeholder="e.g., 35" value={field.value ?? ''} onChange={(e) => field.onChange(e.target.value === '' ? undefined : Number(e.target.value))} />
                      </FormControl>
                      <FormMessage />
                    </FormItem>
                  )}
                />
              </div>
              <Button type="submit" className="w-full md:w-auto">
                Analyze pulse pressure
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
            <CardDescription>See pulse pressure, cardiovascular status, and recommendations.</CardDescription>
          </CardHeader>
          <CardContent className="space-y-6">
            <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
              <div className="p-4 border rounded">
                <p className="text-sm text-muted-foreground">Systolic pressure</p>
                <p className="text-2xl font-semibold text-primary">{result.systolicPressure.toFixed(0)}</p>
                <p className="text-xs text-muted-foreground">mmHg</p>
              </div>
              <div className="p-4 border rounded">
                <p className="text-sm text-muted-foreground">Diastolic pressure</p>
                <p className="text-2xl font-semibold text-primary">{result.diastolicPressure.toFixed(0)}</p>
                <p className="text-xs text-muted-foreground">mmHg</p>
              </div>
              <div className="p-4 border rounded">
                <p className="text-sm text-muted-foreground">Pulse pressure</p>
                <p className="text-2xl font-semibold text-primary">{result.pulsePressure.toFixed(0)}</p>
                <p className="text-xs text-muted-foreground">mmHg</p>
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
            <strong>Pulse pressure</strong> = systolic blood pressure - diastolic blood pressure.
          </p>
          <p>
            <strong>If pulse pressure not provided</strong>: Calculated from systolic and diastolic blood pressure measurements.
          </p>
          <p>
            <strong>Normal ranges</strong>: 40-60 mmHg. Values below 40 mmHg may indicate low stroke volume. Values above 60 mmHg may indicate arterial stiffness or increased cardiovascular risk.
          </p>
          <p>Pulse pressure reflects arterial stiffness and cardiovascular health. High pulse pressure is associated with increased cardiovascular risk, including stroke and heart failure.</p>
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
                <p className="text-sm text-muted-foreground">Target pulse pressure</p>
                <p className="text-xl font-semibold text-primary">40-60 mmHg</p>
                <p className="text-xs text-muted-foreground">Normal range</p>
              </div>
              <div className="p-4 border rounded">
                <p className="text-sm text-muted-foreground">Mean arterial pressure</p>
                <p className="text-xl font-semibold text-primary">
                  {(result.diastolicPressure + (result.pulsePressure / 3)).toFixed(0)} mmHg
                </p>
                <p className="text-xs text-muted-foreground">MAP = DBP + 1/3(PP)</p>
              </div>
              <div className="p-4 border rounded">
                <p className="text-sm text-muted-foreground">Pulse pressure index</p>
                <p className="text-xl font-semibold text-primary">{result.pulsePressureIndex.toFixed(0)}</p>
                <p className="text-xs text-muted-foreground">Out of 100</p>
              </div>
            </div>
          ) : (
            <p className="text-sm text-muted-foreground">Enter your pulse pressure data to see additional insights.</p>
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
          <p>Pulse pressure is the difference between systolic and diastolic blood pressure, reflecting arterial stiffness and cardiovascular health. Normal range: 40-60 mmHg. High pulse pressure (&gt;60 mmHg) is associated with increased cardiovascular risk.</p>
          <p>Use this calculator to analyze pulse pressure from systolic pressure, diastolic pressure, pulse pressure (optional), and age.</p>
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
          <p>This tool analyzes pulse pressure from systolic pressure, diastolic pressure, pulse pressure (optional), and age.</p>
          <p>Outputs include systolic pressure, diastolic pressure, pulse pressure, pulse pressure index, status, recommendations, an action plan, and supporting metrics.</p>
          <p>Formula, steps, guide content, related tools, and FAQs ensure humans or AI assistants can interpret the methodology instantly.</p>
        </CardContent>
      </Card>
    </div>
  );
}


'use client';

import { useState } from 'react';
import Script from 'next/script';
import Link from 'next/link';
import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import { z } from 'zod';
import { Heart, Zap, Target, Activity, Shield } from 'lucide-react';

import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Form, FormControl, FormField, FormItem, FormLabel, FormMessage } from '@/components/ui/form';
import { Input } from '@/components/ui/input';

const formSchema = z.object({
  heartRate: z.number({ invalid_type_error: 'Enter heart rate' }).min(40).max(200),
  systolicPressure: z.number({ invalid_type_error: 'Enter systolic pressure' }).min(80).max(250),
  ratePressureProduct: z.number({ invalid_type_error: 'Enter rate pressure product' }).min(5000).max(50000).optional(),
  age: z.number({ invalid_type_error: 'Enter age' }).min(1).max(100),
});

type FormValues = z.infer<typeof formSchema>;

type ResultPayload = {
  heartRate: number;
  systolicPressure: number;
  ratePressureProduct: number;
  workloadIndex: number;
  status: 'optimal' | 'good' | 'moderate' | 'low';
  interpretation: string;
  recommendations: string[];
  plan: { label: string; detail: string }[];
};

const steps = [
  'Enter heart rate (beats/min) from pulse measurement.',
  'Enter systolic blood pressure (mmHg) from blood pressure measurement.',
  'Optionally enter rate pressure product if calculated.',
  'Enter your age (heart workload can change with age).',
  'Review rate pressure product, heart workload status, and recommendations.',
];

const faqs = [
  {
    question: 'What is rate pressure product?',
    answer:
      'Rate pressure product (RPP) is a measure of myocardial oxygen demand and heart workload. It is calculated as heart rate Ã— systolic blood pressure. Higher values indicate increased cardiac workload.',
  },
  {
    question: 'How is rate pressure product calculated?',
    answer:
      'Rate pressure product = heart rate (beats/min) Ã— systolic blood pressure (mmHg). For example, if HR is 70 bpm and SBP is 120 mmHg, RPP = 70 Ã— 120 = 8,400.',
  },
  {
    question: 'What are normal rate pressure product values?',
    answer:
      'Normal RPP at rest: approximately 8,000-12,000. During exercise, RPP can increase significantly (20,000-30,000 or higher). Values vary with activity level, fitness, and individual factors.',
  },
  {
    question: 'What does high rate pressure product mean?',
    answer:
      'High RPP indicates increased myocardial oxygen demand and heart workload. This can occur during exercise (normal) or at rest (may indicate stress, hypertension, or cardiovascular issues).',
  },
  {
    question: 'What does low rate pressure product mean?',
    answer:
      'Low RPP at rest may indicate good cardiovascular fitness or low heart rate/blood pressure. Very low values may indicate bradycardia or hypotension requiring medical evaluation.',
  },
  {
    question: 'How does exercise affect rate pressure product?',
    answer:
      'RPP increases significantly during exercise due to increased heart rate and systolic pressure. This is normal and reflects increased cardiac workload to meet oxygen demands. Trained athletes may have lower RPP at given workloads.',
  },
  {
    question: 'Does age affect rate pressure product?',
    answer:
      'Yes. RPP may change with age due to changes in heart rate, blood pressure, and cardiovascular function. Older adults may have different normal ranges and exercise responses.',
  },
  {
    question: 'Can I track rate pressure product at home?',
    answer:
      'Yes. RPP can be calculated from home measurements of heart rate and systolic blood pressure. Regular monitoring helps assess cardiac workload and cardiovascular health.',
  },
  {
    question: 'What about cardiovascular risk?',
    answer:
      'Elevated RPP at rest may indicate increased cardiovascular risk, especially if associated with hypertension or tachycardia. Managing heart rate and blood pressure can help reduce RPP and cardiovascular risk.',
  },
  {
    question: 'When should I consult a healthcare provider?',
    answer:
      'Consult a healthcare provider if RPP is significantly elevated at rest, if you have cardiovascular symptoms, or if you have concerns about heart workload or cardiovascular function.',
  },
];

const relatedCalculators = [
  {
    name: 'Cardiac Output (Q) Calculator',
    slug: 'cardiac-output-q-calculator',
    description: 'Calculate cardiac output alongside heart workload.',
  },
  {
    name: 'Arterial Elasticity Index Calculator',
    slug: 'arterial-elasticity-index-calculator',
    description: 'Assess cardiovascular health comprehensively.',
  },
  {
    name: 'Pulse Pressure Analyzer',
    slug: 'pulse-pressure-analyzer',
    description: 'Evaluate complete cardiovascular parameters.',
  },
  {
    name: 'Oxygen Pulse Efficiency Calculator',
    slug: 'oxygen-pulse-efficiency-calculator',
    description: 'Monitor cardiac efficiency together.',
  },
];

const baseUrl = 'https://mycalculating.com/health-fitness/heart-workload-rate-pressure-product-calculator';

const schemaMarkup = {
  '@context': 'https://schema.org',
  '@graph': [
    {
      '@type': 'BreadcrumbList',
      itemListElement: [
        { '@type': 'ListItem', position: 1, name: 'Home', item: 'https://mycalculating.com' },
        { '@type': 'ListItem', position: 2, name: 'Health & Fitness', item: 'https://mycalculating.com/health-fitness' },
        { '@type': 'ListItem', position: 3, name: 'Heart Workload (Rate Pressure Product) Calculator', item: baseUrl },
      ],
    },
    {
      '@type': 'SoftwareApplication',
      name: 'Heart Workload (Rate Pressure Product) Calculator',
      applicationCategory: 'Calculator',
      operatingSystem: 'Web Browser',
      description: 'Calculate heart workload rate pressure product from heart rate, systolic pressure, rate pressure product, and age.',
      url: baseUrl,
      offers: { '@type': 'Offer', price: '0', priceCurrency: 'USD' },
    },
  ],
};

const clamp = (value: number, min: number, max: number) => Math.min(max, Math.max(min, value));

const calculateResult = (values: FormValues): ResultPayload => {
  const heartRate = values.heartRate;
  const systolicPressure = values.systolicPressure;
  
  let ratePressureProduct: number;
  
  if (values.ratePressureProduct) {
    ratePressureProduct = values.ratePressureProduct;
  } else {
    ratePressureProduct = heartRate * systolicPressure;
  }
  
  // Normal RPP at rest: 8,000-12,000
  // Calculate workload index (0-100)
  let workloadIndex = 50;
  
  if (ratePressureProduct >= 8000 && ratePressureProduct <= 12000) {
    workloadIndex += 30; // Normal range at rest
  } else if (ratePressureProduct >= 6000 && ratePressureProduct <= 15000) {
    workloadIndex += 15; // Slightly outside normal
  } else if (ratePressureProduct > 15000 && ratePressureProduct <= 20000) {
    workloadIndex -= 10; // Elevated
  } else if (ratePressureProduct > 20000) {
    workloadIndex -= 30; // Very high (may be exercise or concerning)
  } else if (ratePressureProduct < 6000) {
    workloadIndex -= 15; // Very low
  }
  
  workloadIndex = clamp(workloadIndex, 0, 100);

  let status: ResultPayload['status'] = 'optimal';
  let interpretation = 'Your heart workload appears normal. Continue maintaining healthy cardiovascular function.';

  if (ratePressureProduct > 20000 && heartRate < 100) {
    status = 'low';
    interpretation = 'Your heart workload is very high at rest. This may indicate hypertension, stress, or cardiovascular issues. Consult a healthcare provider immediately for evaluation.';
  } else if (ratePressureProduct > 15000 && heartRate < 90) {
    status = 'moderate';
    interpretation = 'Your heart workload is elevated at rest. Monitor closely and consult healthcare provider for guidance.';
  } else if (ratePressureProduct < 6000) {
    status = 'moderate';
    interpretation = 'Your heart workload is very low. This may be normal for fit individuals or may indicate bradycardia. Consult healthcare provider if concerns persist.';
  } else if (workloadIndex < 70) {
    status = 'good';
    interpretation = 'Your heart workload is good. Continue maintaining healthy lifestyle to support cardiovascular function.';
  }

  const recommendations = [
    'Manage heart rate and blood pressure through lifestyle modifications: regular exercise, stress management, healthy diet, and weight management to optimize heart workload.',
    'Engage in regular cardiovascular exercise to improve cardiovascular fitness, which can help lower RPP at given workloads and improve heart efficiency.',
    'Follow healthcare provider recommendations for blood pressure and heart rate management, including medications if prescribed, to maintain optimal heart workload.',
  ];
  if (status === 'low' || status === 'moderate') {
    recommendations.push('Consult a healthcare provider for comprehensive cardiovascular evaluation, including assessment of heart workload and appropriate management strategies.');
  }
  if (ratePressureProduct > 15000 && heartRate < 100) {
    recommendations.push('Address elevated heart workload at rest promptly. This may indicate hypertension, stress, or cardiovascular issues requiring medical attention.');
  }

  const plan = [
    { label: 'This Week', detail: 'Review heart rate and systolic blood pressure measurements. Calculate rate pressure product and assess heart workload status.' },
    { label: 'This Month', detail: 'Implement cardiovascular health improvements: regular exercise, blood pressure management, stress reduction, and follow healthcare provider recommendations.' },
    { label: 'Ongoing', detail: 'Monitor heart workload regularly through heart rate and blood pressure measurements. Address any persistent abnormalities with medical guidance and appropriate treatment.' },
  ];

  return { heartRate, systolicPressure, ratePressureProduct, workloadIndex, status, interpretation, recommendations, plan };
};

export default function HeartWorkloadRatePressureProductCalculator() {
  const [result, setResult] = useState<ResultPayload | null>(null);

  const form = useForm<FormValues>({
    resolver: zodResolver(formSchema),
    defaultValues: {
      heartRate: undefined,
      systolicPressure: undefined,
      ratePressureProduct: undefined,
      age: undefined,
    },
  });

  return (
    <div className="space-y-8">
      <Script id="heart-workload-schema" type="application/ld+json" strategy="afterInteractive" dangerouslySetInnerHTML={{ __html: JSON.stringify(schemaMarkup) }} />

      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <Heart className="h-5 w-5" />
            Heart Workload (Rate Pressure Product) Calculator
          </CardTitle>
          <CardDescription>Calculate heart workload rate pressure product from heart rate, systolic pressure, rate pressure product, and age.</CardDescription>
        </CardHeader>
      </Card>

      <Card>
        <CardHeader>
          <CardTitle>Input your heart workload data</CardTitle>
        </CardHeader>
        <CardContent>
          <Form {...form}>
            <form onSubmit={form.handleSubmit((values) => setResult(calculateResult(values)))} className="space-y-6">
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <FormField
                  control={form.control}
                  name="heartRate"
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel>Heart rate (beats/min)</FormLabel>
                      <FormControl>
                        <Input type="number" step="1" placeholder="e.g., 70" value={field.value ?? ''} onChange={(e) => field.onChange(e.target.value === '' ? undefined : Number(e.target.value))} />
                      </FormControl>
                      <FormMessage />
                    </FormItem>
                  )}
                />
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
                  name="ratePressureProduct"
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel>Rate pressure product (optional)</FormLabel>
                      <FormControl>
                        <Input type="number" step="100" placeholder="e.g., 8400" value={field.value ?? ''} onChange={(e) => field.onChange(e.target.value === '' ? undefined : Number(e.target.value))} />
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
                Calculate heart workload
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
            <CardDescription>See rate pressure product, heart workload status, and recommendations.</CardDescription>
          </CardHeader>
          <CardContent className="space-y-6">
            <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
              <div className="p-4 border rounded">
                <p className="text-sm text-muted-foreground">Heart rate</p>
                <p className="text-2xl font-semibold text-primary">{result.heartRate.toFixed(0)}</p>
                <p className="text-xs text-muted-foreground">beats/min</p>
              </div>
              <div className="p-4 border rounded">
                <p className="text-sm text-muted-foreground">Systolic pressure</p>
                <p className="text-2xl font-semibold text-primary">{result.systolicPressure.toFixed(0)}</p>
                <p className="text-xs text-muted-foreground">mmHg</p>
              </div>
              <div className="p-4 border rounded">
                <p className="text-sm text-muted-foreground">Rate pressure product</p>
                <p className="text-2xl font-semibold text-primary">{result.ratePressureProduct.toFixed(0)}</p>
                <p className="text-xs text-muted-foreground">RPP</p>
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
            <strong>Rate pressure product (RPP)</strong> = heart rate (beats/min) Ã— systolic blood pressure (mmHg).
          </p>
          <p>
            <strong>If RPP not provided</strong>: Calculated from heart rate and systolic blood pressure measurements.
          </p>
          <p>
            <strong>Normal ranges</strong>: At rest: 8,000-12,000. During exercise: 20,000-30,000 or higher. Values vary with activity level, fitness, and individual factors.
          </p>
          <p>Rate pressure product reflects myocardial oxygen demand and heart workload. Higher values indicate increased cardiac workload and oxygen consumption.</p>
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
                <p className="text-sm text-muted-foreground">Target RPP (rest)</p>
                <p className="text-xl font-semibold text-primary">8,000-12,000</p>
                <p className="text-xs text-muted-foreground">Normal range</p>
              </div>
              <div className="p-4 border rounded">
                <p className="text-sm text-muted-foreground">Workload index</p>
                <p className="text-xl font-semibold text-primary">{result.workloadIndex.toFixed(0)}</p>
                <p className="text-xs text-muted-foreground">Out of 100</p>
              </div>
              <div className="p-4 border rounded">
                <p className="text-sm text-muted-foreground">RPP status</p>
                <p className="text-xl font-semibold text-primary">
                  {result.ratePressureProduct >= 8000 && result.ratePressureProduct <= 12000 ? 'Normal' : result.ratePressureProduct > 12000 ? 'Elevated' : 'Low'}
                </p>
                <p className="text-xs text-muted-foreground">Based on value</p>
              </div>
            </div>
          ) : (
            <p className="text-sm text-muted-foreground">Enter your heart workload data to see additional insights.</p>
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
          <p>Rate pressure product (RPP) is a measure of myocardial oxygen demand and heart workload, calculated as heart rate Ã— systolic blood pressure. Normal RPP at rest: 8,000-12,000. Higher values indicate increased cardiac workload.</p>
          <p>Use this calculator to assess heart workload from heart rate, systolic pressure, rate pressure product (optional), and age.</p>
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
          <p>This tool calculates heart workload rate pressure product from heart rate, systolic pressure, rate pressure product (optional), and age.</p>
          <p>Outputs include heart rate, systolic pressure, rate pressure product, workload index, status, recommendations, an action plan, and supporting metrics.</p>
          <p>Formula, steps, guide content, related tools, and FAQs ensure humans or AI assistants can interpret the methodology instantly.</p>
        </CardContent>
      </Card>
    </div>
  );
}


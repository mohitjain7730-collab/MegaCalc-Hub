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
  elasticityIndex: number;
  status: 'optimal' | 'good' | 'moderate' | 'low';
  interpretation: string;
  recommendations: string[];
  plan: { label: string; detail: string }[];
};

const steps = [
  'Enter systolic blood pressure (mmHg) from blood pressure measurement.',
  'Enter diastolic blood pressure (mmHg) from blood pressure measurement.',
  'Optionally enter pulse pressure if calculated (mmHg).',
  'Enter your age (arterial elasticity decreases with age).',
  'Review arterial elasticity index, cardiovascular status, and recommendations.',
];

const faqs = [
  {
    question: 'What is arterial elasticity?',
    answer:
      'Arterial elasticity is the ability of arteries to expand and contract with each heartbeat. It reflects arterial health and compliance. Reduced elasticity (arterial stiffness) is associated with cardiovascular disease risk.',
  },
  {
    question: 'How is arterial elasticity measured?',
    answer:
      'Arterial elasticity can be assessed through pulse pressure, pulse wave velocity, or arterial compliance measurements. Pulse pressure is a simple indicator: lower pulse pressure suggests better elasticity.',
  },
  {
    question: 'What affects arterial elasticity?',
    answer:
      'Arterial elasticity is affected by age, blood pressure, atherosclerosis, diabetes, smoking, physical activity, and other factors. It naturally decreases with age and can be improved through lifestyle changes.',
  },
  {
    question: 'What is arterial stiffness?',
    answer:
      'Arterial stiffness is reduced elasticity of arteries, making them less able to expand and contract. It increases with age and is associated with hypertension, cardiovascular disease, and increased cardiovascular risk.',
  },
  {
    question: 'How does pulse pressure relate to elasticity?',
    answer:
      'Pulse pressure reflects arterial elasticity. Lower pulse pressure (40-60 mmHg) suggests better elasticity, while higher pulse pressure (&gt;60 mmHg) suggests increased stiffness and reduced elasticity.',
  },
  {
    question: 'Does age affect arterial elasticity?',
    answer:
      'Yes. Arterial elasticity naturally decreases with age due to changes in arterial wall structure, collagen accumulation, and reduced elastin. This contributes to age-related increases in blood pressure and pulse pressure.',
  },
  {
    question: 'Can I improve arterial elasticity?',
    answer:
      'Yes. Regular exercise, healthy diet, blood pressure management, avoiding smoking, and managing cardiovascular risk factors can help maintain or improve arterial elasticity and reduce arterial stiffness.',
  },
  {
    question: 'What are symptoms of reduced elasticity?',
    answer:
      'Reduced arterial elasticity may not cause direct symptoms but contributes to hypertension, increased pulse pressure, and cardiovascular risk. It is often detected through blood pressure measurements and cardiovascular assessments.',
  },
  {
    question: 'Can I measure arterial elasticity at home?',
    answer:
      'Home measurement is limited. Pulse pressure (calculated from blood pressure) provides an indirect indicator. More accurate measurements (pulse wave velocity) require specialized equipment in clinical settings.',
  },
  {
    question: 'When should I consult a healthcare provider?',
    answer:
      'Consult a healthcare provider if pulse pressure is elevated (&gt;60 mmHg), if you have hypertension, or if you have concerns about arterial health or cardiovascular risk.',
  },
];

const relatedCalculators = [
  {
    name: 'Pulse Pressure Analyzer',
    slug: 'pulse-pressure-analyzer',
    description: 'Analyze pulse pressure alongside arterial elasticity.',
  },
  {
    name: 'Peripheral Resistance Index Calculator',
    slug: 'peripheral-resistance-index-calculator',
    description: 'Assess cardiovascular health comprehensively.',
  },
  {
    name: 'Cardiac Output (Q) Calculator',
    slug: 'cardiac-output-q-calculator',
    description: 'Evaluate complete cardiovascular parameters.',
  },
  {
    name: 'Heart Workload (Rate Pressure Product) Calculator',
    slug: 'heart-workload-rate-pressure-product-calculator',
    description: 'Monitor cardiac function together.',
  },
];

const baseUrl = 'https://mycalculating.com/category/health-fitness/arterial-elasticity-index-calculator';

const schemaMarkup = {
  '@context': 'https://schema.org',
  '@graph': [
    {
      '@type': 'BreadcrumbList',
      itemListElement: [
        { '@type': 'ListItem', position: 1, name: 'Home', item: 'https://mycalculating.com' },
        { '@type': 'ListItem', position: 2, name: 'Health & Fitness', item: 'https://mycalculating.com/category/health-fitness' },
        { '@type': 'ListItem', position: 3, name: 'Arterial Elasticity Index Calculator', item: baseUrl },
      ],
    },
    {
      '@type': 'SoftwareApplication',
      name: 'Arterial Elasticity Index Calculator',
      applicationCategory: 'Calculator',
      operatingSystem: 'Web Browser',
      description: 'Calculate arterial elasticity index from systolic pressure, diastolic pressure, pulse pressure, and age.',
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
    pulsePressure = values.pulsePressure;
  } else {
    pulsePressure = systolicPressure - diastolicPressure;
  }
  
  // Calculate elasticity index (0-100, higher = better elasticity)
  // Lower pulse pressure indicates better elasticity
  // Optimal pulse pressure: 40-50 mmHg
  let elasticityIndex = 50;
  
  // Pulse pressure component
  if (pulsePressure >= 40 && pulsePressure <= 50) {
    elasticityIndex += 30; // Optimal range
  } else if (pulsePressure >= 35 && pulsePressure <= 60) {
    elasticityIndex += 15; // Good range
  } else if (pulsePressure > 60 && pulsePressure <= 70) {
    elasticityIndex -= 10; // Moderate stiffness
  } else if (pulsePressure > 70) {
    elasticityIndex -= 30; // High stiffness
  } else if (pulsePressure < 35) {
    elasticityIndex -= 5; // Very low (may indicate other issues)
  }
  
  // Age adjustment (elasticity decreases with age)
  if (values.age < 40) {
    elasticityIndex += 10; // Younger = better baseline
  } else if (values.age >= 40 && values.age < 60) {
    elasticityIndex += 0; // Middle age
  } else if (values.age >= 60) {
    elasticityIndex -= 15; // Older = reduced elasticity
  }
  
  elasticityIndex = clamp(elasticityIndex, 0, 100);

  let status: ResultPayload['status'] = 'optimal';
  let interpretation = 'Your arterial elasticity appears optimal. Continue maintaining healthy cardiovascular habits.';

  if (pulsePressure > 70 || elasticityIndex < 30) {
    status = 'low';
    interpretation = 'Your arterial elasticity appears reduced (increased stiffness). This may indicate increased cardiovascular risk. Consult a healthcare provider for evaluation and management.';
  } else if (pulsePressure > 60 || elasticityIndex < 50) {
    status = 'moderate';
    interpretation = 'Your arterial elasticity is moderate. Focus on lifestyle improvements to maintain or improve arterial health.';
  } else if (elasticityIndex < 70) {
    status = 'good';
    interpretation = 'Your arterial elasticity is good. Continue maintaining healthy lifestyle to support arterial health.';
  }

  const recommendations = [
    'Engage in regular cardiovascular exercise to improve arterial elasticity and reduce arterial stiffness. Aim for at least 150 minutes per week of moderate-intensity exercise.',
    'Manage blood pressure through lifestyle modifications: maintain healthy weight, reduce sodium intake, manage stress, and follow healthcare provider recommendations.',
    'Follow a heart-healthy diet rich in fruits, vegetables, whole grains, and healthy fats to support arterial health and reduce cardiovascular risk factors.',
  ];
  if (status === 'low' || status === 'moderate') {
    recommendations.push('Consult a healthcare provider for comprehensive cardiovascular evaluation, including assessment of arterial stiffness and appropriate management strategies.');
  }
  if (pulsePressure > 60) {
    recommendations.push('Address elevated pulse pressure promptly. This may indicate arterial stiffness and increased cardiovascular risk. Lifestyle changes and medications may be needed.');
  }

  const plan = [
    { label: 'This Week', detail: 'Review blood pressure measurements (systolic and diastolic). Calculate pulse pressure and assess arterial elasticity index.' },
    { label: 'This Month', detail: 'Implement cardiovascular health improvements: regular exercise, blood pressure management, healthy diet, and follow healthcare provider recommendations.' },
    { label: 'Ongoing', detail: 'Monitor arterial elasticity through blood pressure measurements. Address any persistent abnormalities with medical guidance and appropriate treatment.' },
  ];

  return { systolicPressure, diastolicPressure, pulsePressure, elasticityIndex, status, interpretation, recommendations, plan };
};

export default function ArterialElasticityIndexCalculator() {
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
      <Script id="arterial-elasticity-schema" type="application/ld+json" strategy="afterInteractive" dangerouslySetInnerHTML={{ __html: JSON.stringify(schemaMarkup) }} />

      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <Activity className="h-5 w-5" />
            Arterial Elasticity Index Calculator
          </CardTitle>
          <CardDescription>Calculate arterial elasticity index from systolic pressure, diastolic pressure, pulse pressure, and age.</CardDescription>
        </CardHeader>
      </Card>

      <Card>
        <CardHeader>
          <CardTitle>Input your arterial elasticity data</CardTitle>
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
                Calculate elasticity index
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
            <CardDescription>See arterial elasticity index, cardiovascular status, and recommendations.</CardDescription>
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
            <strong>Pulse pressure</strong> = systolic pressure - diastolic pressure.
          </p>
          <p>
            <strong>Elasticity index</strong> = calculated from pulse pressure (optimal: 40-50 mmHg) and age adjustments. Lower pulse pressure indicates better arterial elasticity.
          </p>
          <p>
            <strong>Normal ranges</strong>: Pulse pressure: 40-60 mmHg. Optimal elasticity is associated with pulse pressure of 40-50 mmHg. Higher pulse pressure suggests increased arterial stiffness.
          </p>
          <p>Arterial elasticity decreases with age and is affected by blood pressure, atherosclerosis, lifestyle factors, and cardiovascular risk factors.</p>
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
                <p className="text-sm text-muted-foreground">Elasticity index</p>
                <p className="text-xl font-semibold text-primary">{result.elasticityIndex.toFixed(0)}</p>
                <p className="text-xs text-muted-foreground">Out of 100</p>
              </div>
              <div className="p-4 border rounded">
                <p className="text-sm text-muted-foreground">Target pulse pressure</p>
                <p className="text-xl font-semibold text-primary">40-50 mmHg</p>
                <p className="text-xs text-muted-foreground">Optimal range</p>
              </div>
              <div className="p-4 border rounded">
                <p className="text-sm text-muted-foreground">Elasticity status</p>
                <p className="text-xl font-semibold text-primary">
                  {result.elasticityIndex >= 70 ? 'Good' : result.elasticityIndex >= 50 ? 'Moderate' : 'Reduced'}
                </p>
                <p className="text-xs text-muted-foreground">Based on index</p>
              </div>
            </div>
          ) : (
            <p className="text-sm text-muted-foreground">Enter your arterial elasticity data to see additional insights.</p>
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
          <p>Arterial elasticity is the ability of arteries to expand and contract with each heartbeat. Reduced elasticity (arterial stiffness) is associated with cardiovascular disease risk. Optimal pulse pressure (40-50 mmHg) suggests good elasticity.</p>
          <p>Use this calculator to assess arterial elasticity index from systolic pressure, diastolic pressure, pulse pressure (optional), and age.</p>
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
          <p>This tool calculates arterial elasticity index from systolic pressure, diastolic pressure, pulse pressure (optional), and age.</p>
          <p>Outputs include systolic pressure, diastolic pressure, pulse pressure, elasticity index, status, recommendations, an action plan, and supporting metrics.</p>
          <p>Formula, steps, guide content, related tools, and FAQs ensure humans or AI assistants can interpret the methodology instantly.</p>
        </CardContent>
      </Card>
    </div>
  );
}


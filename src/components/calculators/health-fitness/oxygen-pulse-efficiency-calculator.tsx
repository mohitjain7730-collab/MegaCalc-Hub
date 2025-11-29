'use client';

import { useState } from 'react';
import Script from 'next/script';
import Link from 'next/link';
import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import { z } from 'zod';
import { Wind, Zap, Target, Activity, Shield } from 'lucide-react';

import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Form, FormControl, FormField, FormItem, FormLabel, FormMessage } from '@/components/ui/form';
import { Input } from '@/components/ui/input';

const formSchema = z.object({
  oxygenUptake: z.number({ invalid_type_error: 'Enter oxygen uptake' }).min(10).max(100),
  heartRate: z.number({ invalid_type_error: 'Enter heart rate' }).min(40).max(200),
  oxygenPulse: z.number({ invalid_type_error: 'Enter oxygen pulse' }).min(5).max(50).optional(),
  age: z.number({ invalid_type_error: 'Enter age' }).min(1).max(100),
});

type FormValues = z.infer<typeof formSchema>;

type ResultPayload = {
  oxygenUptake: number;
  heartRate: number;
  oxygenPulse: number;
  efficiencyIndex: number;
  status: 'optimal' | 'good' | 'moderate' | 'low';
  interpretation: string;
  recommendations: string[];
  plan: { label: string; detail: string }[];
};

const steps = [
  'Enter oxygen uptake (VO2) (mL/kg/min) from exercise test or estimate.',
  'Enter heart rate (beats/min) from pulse measurement.',
  'Optionally enter oxygen pulse if calculated (mL O2/beat).',
  'Enter your age (oxygen pulse efficiency can change with age).',
  'Review oxygen pulse efficiency, cardiovascular status, and recommendations.',
];

const faqs = [
  {
    question: 'What is oxygen pulse?',
    answer:
      'Oxygen pulse is the amount of oxygen consumed per heartbeat, calculated as oxygen uptake (VO2) divided by heart rate. It reflects cardiac efficiency and stroke volume. Higher values indicate better efficiency.',
  },
  {
    question: 'How is oxygen pulse calculated?',
    answer:
      'Oxygen pulse = oxygen uptake (VO2 in mL/min) / heart rate (beats/min). It can also be expressed as mL O2/beat. It reflects the efficiency of oxygen delivery per heartbeat.',
  },
  {
    question: 'What are normal oxygen pulse values?',
    answer:
      'Normal oxygen pulse at rest: approximately 3-5 mL O2/beat. During exercise: 10-20 mL O2/beat or higher in trained individuals. Values vary with fitness level, age, and cardiovascular health.',
  },
  {
    question: 'What affects oxygen pulse?',
    answer:
      'Oxygen pulse is affected by stroke volume, hemoglobin concentration, oxygen extraction, cardiovascular fitness, age, and heart function. Higher stroke volume and fitness increase oxygen pulse.',
  },
  {
    question: 'What does high oxygen pulse mean?',
    answer:
      'High oxygen pulse indicates good cardiac efficiency, with the heart delivering more oxygen per beat. This is associated with better cardiovascular fitness, higher stroke volume, and improved exercise capacity.',
  },
  {
    question: 'What does low oxygen pulse mean?',
    answer:
      'Low oxygen pulse may indicate reduced stroke volume, lower cardiovascular fitness, or less efficient oxygen delivery. It can improve with regular exercise and cardiovascular training.',
  },
  {
    question: 'How does exercise affect oxygen pulse?',
    answer:
      'Oxygen pulse increases during exercise due to increased stroke volume and oxygen extraction. Trained athletes typically have higher oxygen pulse values at given workloads, reflecting better cardiovascular efficiency.',
  },
  {
    question: 'Does age affect oxygen pulse?',
    answer:
      'Yes. Oxygen pulse may decrease with age due to reduced stroke volume, decreased cardiovascular fitness, and age-related changes in heart function. Regular exercise can help maintain oxygen pulse.',
  },
  {
    question: 'Can I measure oxygen pulse at home?',
    answer:
      'Home measurement is limited. Oxygen pulse requires VO2 measurement, typically done during exercise testing. Heart rate and estimated VO2 can provide approximations, but accurate measurement requires specialized equipment.',
  },
  {
    question: 'When should I consult a healthcare provider?',
    answer:
      'Consult a healthcare provider if oxygen pulse is significantly low, if you have cardiovascular symptoms, or if you have concerns about cardiovascular efficiency or exercise capacity.',
  },
];

const relatedCalculators = [
  {
    name: 'Cardiac Output (Q) Calculator',
    slug: 'cardiac-output-q-calculator',
    description: 'Calculate cardiac output alongside oxygen pulse.',
  },
  {
    name: 'VO2 Kinetics Calculator',
    slug: 'vo2-kinetics-calculator',
    description: 'Assess oxygen utilization comprehensively.',
  },
  {
    name: 'Heart Workload (Rate Pressure Product) Calculator',
    slug: 'heart-workload-rate-pressure-product-calculator',
    description: 'Evaluate complete cardiovascular parameters.',
  },
  {
    name: 'Stroke Index (Cardiac Function) Calculator',
    slug: 'stroke-index-cardiac-function-calculator',
    description: 'Monitor cardiac function together.',
  },
];

const baseUrl = 'https://mycalculating.com/category/health-fitness/oxygen-pulse-efficiency-calculator';

const schemaMarkup = {
  '@context': 'https://schema.org',
  '@graph': [
    {
      '@type': 'BreadcrumbList',
      itemListElement: [
        { '@type': 'ListItem', position: 1, name: 'Home', item: 'https://mycalculating.com' },
        { '@type': 'ListItem', position: 2, name: 'Health & Fitness', item: 'https://mycalculating.com/category/health-fitness' },
        { '@type': 'ListItem', position: 3, name: 'Oxygen Pulse Efficiency Calculator', item: baseUrl },
      ],
    },
    {
      '@type': 'SoftwareApplication',
      name: 'Oxygen Pulse Efficiency Calculator',
      applicationCategory: 'Calculator',
      operatingSystem: 'Web Browser',
      description: 'Calculate oxygen pulse efficiency from oxygen uptake, heart rate, oxygen pulse, and age.',
      url: baseUrl,
      offers: { '@type': 'Offer', price: '0', priceCurrency: 'USD' },
    },
  ],
};

const clamp = (value: number, min: number, max: number) => Math.min(max, Math.max(min, value));

const calculateResult = (values: FormValues): ResultPayload => {
  const oxygenUptake = values.oxygenUptake; // mL/kg/min
  const heartRate = values.heartRate;
  
  let oxygenPulse: number;
  
  if (values.oxygenPulse) {
    oxygenPulse = values.oxygenPulse;
  } else {
    // Estimate: assume average weight 70 kg for conversion
    // VO2 in mL/min = VO2 (mL/kg/min) × weight (kg)
    // Oxygen pulse = VO2 (mL/min) / HR
    const estimatedWeight = 70; // kg
    const vo2MlMin = oxygenUptake * estimatedWeight;
    oxygenPulse = vo2MlMin / heartRate;
  }
  
  // Normal oxygen pulse: rest 3-5 mL/beat, exercise 10-20+ mL/beat
  // Calculate efficiency index (0-100)
  let efficiencyIndex = 50;
  
  if (oxygenPulse >= 10 && oxygenPulse <= 20) {
    efficiencyIndex += 30; // Good efficiency
  } else if (oxygenPulse >= 5 && oxygenPulse < 10) {
    efficiencyIndex += 15; // Moderate efficiency
  } else if (oxygenPulse >= 20) {
    efficiencyIndex += 40; // Excellent efficiency
  } else if (oxygenPulse < 5 && oxygenPulse >= 3) {
    efficiencyIndex -= 5; // Low but may be rest
  } else if (oxygenPulse < 3) {
    efficiencyIndex -= 20; // Very low
  }
  
  efficiencyIndex = clamp(efficiencyIndex, 0, 100);

  let status: ResultPayload['status'] = 'optimal';
  let interpretation = 'Your oxygen pulse efficiency appears optimal. Continue maintaining healthy cardiovascular function.';

  if (oxygenPulse < 3 || efficiencyIndex < 30) {
    status = 'low';
    interpretation = 'Your oxygen pulse efficiency is low. This may indicate reduced stroke volume or cardiovascular fitness. Consult a healthcare provider for evaluation and consider cardiovascular training.';
  } else if (oxygenPulse < 5 || efficiencyIndex < 50) {
    status = 'moderate';
    interpretation = 'Your oxygen pulse efficiency is moderate. Regular cardiovascular exercise can help improve efficiency and oxygen pulse.';
  } else if (efficiencyIndex < 70) {
    status = 'good';
    interpretation = 'Your oxygen pulse efficiency is good. Continue maintaining healthy lifestyle and regular exercise to support cardiovascular efficiency.';
  }

  const recommendations = [
    'Engage in regular cardiovascular exercise to improve oxygen pulse efficiency. Aerobic training increases stroke volume and cardiovascular efficiency.',
    'Maintain cardiovascular fitness through consistent exercise, which improves the heart\'s ability to deliver oxygen per beat and increases oxygen pulse.',
    'Support cardiovascular health through healthy lifestyle: regular exercise, proper nutrition, adequate hydration, and management of cardiovascular risk factors.',
  ];
  if (status === 'low' || status === 'moderate') {
    recommendations.push('Consult a healthcare provider for comprehensive cardiovascular evaluation, including exercise testing if needed, to assess oxygen pulse and cardiovascular efficiency.');
  }
  if (oxygenPulse < 5) {
    recommendations.push('Focus on improving cardiovascular fitness through regular aerobic exercise, which can increase stroke volume and improve oxygen pulse efficiency.');
  }

  const plan = [
    { label: 'This Week', detail: 'Review oxygen uptake and heart rate measurements if available. Calculate oxygen pulse and assess cardiovascular efficiency.' },
    { label: 'This Month', detail: 'Implement cardiovascular training: regular aerobic exercise to improve stroke volume, cardiovascular fitness, and oxygen pulse efficiency.' },
    { label: 'Ongoing', detail: 'Monitor oxygen pulse efficiency through regular exercise and cardiovascular assessments. Address any persistent abnormalities with medical guidance and appropriate training.' },
  ];

  return { oxygenUptake, heartRate, oxygenPulse, efficiencyIndex, status, interpretation, recommendations, plan };
};

export default function OxygenPulseEfficiencyCalculator() {
  const [result, setResult] = useState<ResultPayload | null>(null);

  const form = useForm<FormValues>({
    resolver: zodResolver(formSchema),
    defaultValues: {
      oxygenUptake: undefined,
      heartRate: undefined,
      oxygenPulse: undefined,
      age: undefined,
    },
  });

  return (
    <div className="space-y-8">
      <Script id="oxygen-pulse-schema" type="application/ld+json" strategy="afterInteractive" dangerouslySetInnerHTML={{ __html: JSON.stringify(schemaMarkup) }} />

      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <Wind className="h-5 w-5" />
            Oxygen Pulse Efficiency Calculator
          </CardTitle>
          <CardDescription>Calculate oxygen pulse efficiency from oxygen uptake, heart rate, oxygen pulse, and age.</CardDescription>
        </CardHeader>
      </Card>

      <Card>
        <CardHeader>
          <CardTitle>Input your oxygen pulse data</CardTitle>
        </CardHeader>
        <CardContent>
          <Form {...form}>
            <form onSubmit={form.handleSubmit((values) => setResult(calculateResult(values)))} className="space-y-6">
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <FormField
                  control={form.control}
                  name="oxygenUptake"
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel>Oxygen uptake (VO2) (mL/kg/min)</FormLabel>
                      <FormControl>
                        <Input type="number" step="0.1" placeholder="e.g., 35" value={field.value ?? ''} onChange={(e) => field.onChange(e.target.value === '' ? undefined : Number(e.target.value))} />
                      </FormControl>
                      <FormMessage />
                    </FormItem>
                  )}
                />
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
                  name="oxygenPulse"
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel>Oxygen pulse (mL O2/beat) (optional)</FormLabel>
                      <FormControl>
                        <Input type="number" step="0.1" placeholder="e.g., 10" value={field.value ?? ''} onChange={(e) => field.onChange(e.target.value === '' ? undefined : Number(e.target.value))} />
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
                Calculate oxygen pulse efficiency
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
            <CardDescription>See oxygen pulse efficiency, cardiovascular status, and recommendations.</CardDescription>
          </CardHeader>
          <CardContent className="space-y-6">
            <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
              <div className="p-4 border rounded">
                <p className="text-sm text-muted-foreground">Oxygen uptake</p>
                <p className="text-2xl font-semibold text-primary">{result.oxygenUptake.toFixed(1)}</p>
                <p className="text-xs text-muted-foreground">mL/kg/min</p>
              </div>
              <div className="p-4 border rounded">
                <p className="text-sm text-muted-foreground">Heart rate</p>
                <p className="text-2xl font-semibold text-primary">{result.heartRate.toFixed(0)}</p>
                <p className="text-xs text-muted-foreground">beats/min</p>
              </div>
              <div className="p-4 border rounded">
                <p className="text-sm text-muted-foreground">Oxygen pulse</p>
                <p className="text-2xl font-semibold text-primary">{result.oxygenPulse.toFixed(1)}</p>
                <p className="text-xs text-muted-foreground">mL O2/beat</p>
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
            <strong>Oxygen pulse</strong> = oxygen uptake (VO2 in mL/min) / heart rate (beats/min).
          </p>
          <p>
            <strong>If oxygen pulse not provided</strong>: Calculated from oxygen uptake (mL/kg/min) and heart rate, assuming average body weight for conversion.
          </p>
          <p>
            <strong>Normal ranges</strong>: At rest: 3-5 mL O2/beat. During exercise: 10-20 mL O2/beat or higher in trained individuals. Values vary with fitness level and cardiovascular health.
          </p>
          <p>Oxygen pulse reflects cardiac efficiency and stroke volume. Higher values indicate better cardiovascular efficiency and oxygen delivery per heartbeat.</p>
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
                <p className="text-sm text-muted-foreground">Target oxygen pulse (exercise)</p>
                <p className="text-xl font-semibold text-primary">10-20 mL O2/beat</p>
                <p className="text-xs text-muted-foreground">Good efficiency range</p>
              </div>
              <div className="p-4 border rounded">
                <p className="text-sm text-muted-foreground">Efficiency index</p>
                <p className="text-xl font-semibold text-primary">{result.efficiencyIndex.toFixed(0)}</p>
                <p className="text-xs text-muted-foreground">Out of 100</p>
              </div>
              <div className="p-4 border rounded">
                <p className="text-sm text-muted-foreground">Oxygen pulse status</p>
                <p className="text-xl font-semibold text-primary">
                  {result.oxygenPulse >= 10 ? 'Good' : result.oxygenPulse >= 5 ? 'Moderate' : 'Low'}
                </p>
                <p className="text-xs text-muted-foreground">Based on value</p>
              </div>
            </div>
          ) : (
            <p className="text-sm text-muted-foreground">Enter your oxygen pulse data to see additional insights.</p>
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
          <p>Oxygen pulse is the amount of oxygen consumed per heartbeat, reflecting cardiac efficiency and stroke volume. Normal at rest: 3-5 mL O2/beat. During exercise: 10-20 mL O2/beat or higher in trained individuals.</p>
          <p>Use this calculator to assess oxygen pulse efficiency from oxygen uptake, heart rate, oxygen pulse (optional), and age.</p>
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
          <p>This tool calculates oxygen pulse efficiency from oxygen uptake, heart rate, oxygen pulse (optional), and age.</p>
          <p>Outputs include oxygen uptake, heart rate, oxygen pulse, efficiency index, status, recommendations, an action plan, and supporting metrics.</p>
          <p>Formula, steps, guide content, related tools, and FAQs ensure humans or AI assistants can interpret the methodology instantly.</p>
        </CardContent>
      </Card>
    </div>
  );
}


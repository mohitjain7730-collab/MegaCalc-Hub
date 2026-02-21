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
  strokeVolume: z.number({ invalid_type_error: 'Enter stroke volume' }).min(30).max(150).optional(),
  heartRate: z.number({ invalid_type_error: 'Enter heart rate' }).min(40).max(200),
  cardiacOutput: z.number({ invalid_type_error: 'Enter cardiac output' }).min(2).max(30).optional(),
  age: z.number({ invalid_type_error: 'Enter age' }).min(1).max(100),
});

type FormValues = z.infer<typeof formSchema>;

type ResultPayload = {
  strokeVolume: number;
  heartRate: number;
  cardiacOutput: number;
  cardiacIndex: number;
  status: 'optimal' | 'good' | 'moderate' | 'low';
  interpretation: string;
  recommendations: string[];
  plan: { label: string; detail: string }[];
};

const steps = [
  'Enter stroke volume if measured (mL/beat) from cardiac assessment.',
  'Enter heart rate (beats/min) from pulse measurement.',
  'Optionally enter cardiac output if measured (L/min).',
  'Enter your age (cardiac output can change with age).',
  'Review cardiac output, cardiac index, and recommendations.',
];

const faqs = [
  {
    question: 'What is cardiac output?',
    answer:
      'Cardiac output (Q) is the volume of blood the heart pumps per minute. It is calculated as stroke volume × heart rate. Normal range is approximately 4-8 L/min at rest.',
  },
  {
    question: 'How is cardiac output calculated?',
    answer:
      'Cardiac output = stroke volume (mL/beat) × heart rate (beats/min) / 1000. Stroke volume is the amount of blood pumped per heartbeat. Heart rate is beats per minute.',
  },
  {
    question: 'What are normal cardiac output values?',
    answer:
      'Normal cardiac output at rest: 4-8 L/min for adults. Cardiac index (cardiac output per body surface area) is typically 2.5-4.0 L/min/m². Values vary with activity level and individual factors.',
  },
  {
    question: 'What is stroke volume?',
    answer:
      'Stroke volume is the amount of blood pumped by the left ventricle per heartbeat. Normal range is approximately 60-100 mL/beat at rest. It depends on preload, afterload, and contractility.',
  },
  {
    question: 'What affects cardiac output?',
    answer:
      'Cardiac output is affected by heart rate, stroke volume, exercise, stress, medications, heart disease, blood volume, and other factors affecting cardiovascular function.',
  },
  {
    question: 'What is cardiac index?',
    answer:
      'Cardiac index is cardiac output normalized to body surface area (BSA). It accounts for body size differences. Normal range is 2.5-4.0 L/min/m². It is calculated as cardiac output / BSA.',
  },
  {
    question: 'Does age affect cardiac output?',
    answer:
      'Yes. Cardiac output may decrease slightly with age due to changes in heart function, stroke volume, and heart rate. Regular exercise can help maintain cardiac output.',
  },
  {
    question: 'Can I measure cardiac output at home?',
    answer:
      'Home measurement is limited. Cardiac output is typically measured in clinical settings using echocardiography, cardiac catheterization, or other specialized techniques. Heart rate and estimated stroke volume can provide estimates.',
  },
  {
    question: 'What about exercise?',
    answer:
      'Cardiac output increases significantly during exercise (up to 20-30 L/min in trained athletes). This is achieved through increased heart rate and stroke volume to meet increased oxygen demands.',
  },
  {
    question: 'When should I consult a healthcare provider?',
    answer:
      'Consult a healthcare provider if cardiac output is significantly abnormal, if you have symptoms (shortness of breath, fatigue, chest pain), or if you have concerns about cardiovascular function.',
  },
];

const relatedCalculators = [
  {
    name: 'Blood Volume Estimator',
    slug: 'blood-volume-estimator',
    description: 'Estimate blood volume alongside cardiac output.',
  },
  {
    name: 'Pulse Pressure Analyzer',
    slug: 'pulse-pressure-analyzer',
    description: 'Assess cardiovascular health comprehensively.',
  },
  {
    name: 'Peripheral Resistance Index Calculator',
    slug: 'peripheral-resistance-index-calculator',
    description: 'Evaluate complete cardiovascular parameters.',
  },
  {
    name: 'Hemoglobin (Hb) Level Estimator',
    slug: 'hemoglobin-hb-level-estimator',
    description: 'Monitor blood health components.',
  },
];

const baseUrl = 'https://mycalculating.com/category/health-fitness/cardiac-output-q-calculator';

const schemaMarkup = {
  '@context': 'https://schema.org',
  '@graph': [
    {
      '@type': 'BreadcrumbList',
      itemListElement: [
        { '@type': 'ListItem', position: 1, name: 'Home', item: 'https://mycalculating.com' },
        { '@type': 'ListItem', position: 2, name: 'Health & Fitness', item: 'https://mycalculating.com/category/health-fitness' },
        { '@type': 'ListItem', position: 3, name: 'Cardiac Output (Q) Calculator', item: baseUrl },
      ],
    },
    {
      '@type': 'SoftwareApplication',
      name: 'Cardiac Output (Q) Calculator',
      applicationCategory: 'Calculator',
      operatingSystem: 'Web Browser',
      description: 'Calculate cardiac output from stroke volume, heart rate, cardiac output, and age.',
      url: baseUrl,
      offers: { '@type': 'Offer', price: '0', priceCurrency: 'USD' },
    },
  ],
};

const clamp = (value: number, min: number, max: number) => Math.min(max, Math.max(min, value));

const calculateResult = (values: FormValues): ResultPayload => {
  const heartRate = values.heartRate;
  
  let strokeVolume: number;
  let cardiacOutput: number;
  
  if (values.cardiacOutput) {
    // Use provided cardiac output
    cardiacOutput = values.cardiacOutput;
    // Calculate stroke volume
    strokeVolume = (cardiacOutput * 1000) / heartRate;
  } else {
    // Calculate from stroke volume and heart rate
    if (values.strokeVolume) {
      strokeVolume = values.strokeVolume;
    } else {
      // Estimate stroke volume (normal: 60-100 mL/beat)
      strokeVolume = 70; // Average
    }
    cardiacOutput = (strokeVolume * heartRate) / 1000; // Convert to L/min
  }
  
  // Estimate body surface area for cardiac index (simplified: average 1.7 m²)
  const bsa = 1.7; // m²
  const cardiacIndex = cardiacOutput / bsa;

  let status: ResultPayload['status'] = 'optimal';
  let interpretation = 'Your cardiac output appears optimal. Continue maintaining healthy cardiovascular function.';

  if (cardiacOutput < 3 || cardiacIndex < 2.0) {
    status = 'low';
    interpretation = 'Your cardiac output is low. This may indicate heart dysfunction or other cardiovascular issues. Consult a healthcare provider immediately for evaluation.';
  } else if (cardiacOutput < 4 || cardiacIndex < 2.5) {
    status = 'moderate';
    interpretation = 'Your cardiac output is below normal. Monitor closely and consult healthcare provider for guidance.';
  } else if (cardiacOutput > 10 || cardiacIndex > 5.0) {
    status = 'moderate';
    interpretation = 'Your cardiac output is elevated. This may be normal during exercise or stress, but consult healthcare provider if persistent at rest.';
  } else if (cardiacOutput < 5 || cardiacIndex < 3.0) {
    status = 'good';
    interpretation = 'Your cardiac output is good. Continue maintaining healthy lifestyle to support cardiovascular function.';
  }

  const recommendations = [
    'Maintain regular cardiovascular exercise to support healthy cardiac output, stroke volume, and heart function.',
    'Manage blood pressure and other cardiovascular risk factors (cholesterol, diabetes, smoking) that can affect heart function.',
    'Stay well-hydrated and maintain healthy blood volume to support optimal stroke volume and cardiac output.',
  ];
  if (status === 'low' || status === 'moderate') {
    recommendations.push('Consult a healthcare provider for comprehensive cardiovascular evaluation, including echocardiography or other cardiac assessments if needed.');
  }
  if (cardiacOutput < 4) {
    recommendations.push('Address low cardiac output promptly. This may indicate heart failure, valve problems, or other serious cardiovascular conditions requiring medical attention.');
  }

  const plan = [
    { label: 'This Week', detail: 'Review cardiac output if available from cardiac assessment. Assess current heart rate and estimate stroke volume if possible.' },
    { label: 'This Month', detail: 'Implement cardiovascular health improvements: regular exercise, blood pressure management, and follow healthcare provider recommendations.' },
    { label: 'Ongoing', detail: 'Monitor cardiovascular function regularly through healthcare provider. Address any persistent abnormalities with medical guidance and appropriate treatment.' },
  ];

  return { strokeVolume, heartRate, cardiacOutput, cardiacIndex, status, interpretation, recommendations, plan };
};

export default function CardiacOutputQCalculator() {
  const [result, setResult] = useState<ResultPayload | null>(null);

  const form = useForm<FormValues>({
    resolver: zodResolver(formSchema),
    defaultValues: {
      strokeVolume: undefined,
      heartRate: undefined,
      cardiacOutput: undefined,
      age: undefined,
    },
  });

  return (
    <div className="space-y-8">
      <Script id="cardiac-output-schema" type="application/ld+json" strategy="afterInteractive" dangerouslySetInnerHTML={{ __html: JSON.stringify(schemaMarkup) }} />

      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <Heart className="h-5 w-5" />
            Cardiac Output (Q) Calculator
          </CardTitle>
          <CardDescription>Calculate cardiac output from stroke volume, heart rate, cardiac output, and age.</CardDescription>
        </CardHeader>
      </Card>

      <Card>
        <CardHeader>
          <CardTitle>Input your cardiac output data</CardTitle>
        </CardHeader>
        <CardContent>
          <Form {...form}>
            <form onSubmit={form.handleSubmit((values) => setResult(calculateResult(values)))} className="space-y-6">
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <FormField
                  control={form.control}
                  name="strokeVolume"
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel>Stroke volume (mL/beat) (optional)</FormLabel>
                      <FormControl>
                        <Input type="number" step="1" placeholder="e.g., 70" value={field.value ?? ''} onChange={(e) => field.onChange(e.target.value === '' ? undefined : Number(e.target.value))} />
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
                  name="cardiacOutput"
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel>Cardiac output (L/min) (optional)</FormLabel>
                      <FormControl>
                        <Input type="number" step="0.1" placeholder="e.g., 5.0" value={field.value ?? ''} onChange={(e) => field.onChange(e.target.value === '' ? undefined : Number(e.target.value))} />
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
                Calculate cardiac output
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
            <CardDescription>See cardiac output, cardiac index, and recommendations.</CardDescription>
          </CardHeader>
          <CardContent className="space-y-6">
            <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
              <div className="p-4 border rounded">
                <p className="text-sm text-muted-foreground">Stroke volume</p>
                <p className="text-2xl font-semibold text-primary">{result.strokeVolume.toFixed(0)}</p>
                <p className="text-xs text-muted-foreground">mL/beat</p>
              </div>
              <div className="p-4 border rounded">
                <p className="text-sm text-muted-foreground">Heart rate</p>
                <p className="text-2xl font-semibold text-primary">{result.heartRate.toFixed(0)}</p>
                <p className="text-xs text-muted-foreground">beats/min</p>
              </div>
              <div className="p-4 border rounded">
                <p className="text-sm text-muted-foreground">Cardiac output</p>
                <p className="text-2xl font-semibold text-primary">{result.cardiacOutput.toFixed(2)}</p>
                <p className="text-xs text-muted-foreground">L/min</p>
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
            <strong>Cardiac output (Q)</strong> = stroke volume (mL/beat) × heart rate (beats/min) / 1000.
          </p>
          <p>
            <strong>Cardiac index</strong> = cardiac output (L/min) / body surface area (m²). Normal range: 2.5-4.0 L/min/m².
          </p>
          <p>
            <strong>Normal ranges</strong>: Cardiac output at rest: 4-8 L/min. Stroke volume: 60-100 mL/beat. Heart rate: 60-100 beats/min. Values vary with activity and individual factors.
          </p>
          <p>Cardiac output is affected by heart rate, stroke volume, exercise, stress, medications, heart disease, and other factors affecting cardiovascular function.</p>
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
                <p className="text-sm text-muted-foreground">Target cardiac output</p>
                <p className="text-xl font-semibold text-primary">4-8 L/min</p>
                <p className="text-xs text-muted-foreground">Normal range (rest)</p>
              </div>
              <div className="p-4 border rounded">
                <p className="text-sm text-muted-foreground">Cardiac index</p>
                <p className="text-xl font-semibold text-primary">{result.cardiacIndex.toFixed(2)}</p>
                <p className="text-xs text-muted-foreground">L/min/m²</p>
              </div>
              <div className="p-4 border rounded">
                <p className="text-sm text-muted-foreground">Cardiac index status</p>
                <p className="text-xl font-semibold text-primary">
                  {result.cardiacIndex >= 2.5 && result.cardiacIndex <= 4.0 ? 'Normal' : result.cardiacIndex < 2.5 ? 'Low' : 'High'}
                </p>
                <p className="text-xs text-muted-foreground">Based on index</p>
              </div>
            </div>
          ) : (
            <p className="text-sm text-muted-foreground">Enter your cardiac output data to see additional insights.</p>
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
          <p>Cardiac output (Q) is the volume of blood the heart pumps per minute, calculated as stroke volume × heart rate. Normal range at rest is approximately 4-8 L/min. Cardiac index (normalized to body surface area) is typically 2.5-4.0 L/min/m².</p>
          <p>Use this calculator to assess cardiac output from stroke volume (optional), heart rate, cardiac output (optional), and age.</p>
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
          <p>This tool calculates cardiac output from stroke volume (optional), heart rate, cardiac output (optional), and age.</p>
          <p>Outputs include stroke volume, heart rate, cardiac output, cardiac index, status, recommendations, an action plan, and supporting metrics.</p>
          <p>Formula, steps, guide content, related tools, and FAQs ensure humans or AI assistants can interpret the methodology instantly.</p>
        </CardContent>
      </Card>
    </div>
  );
}


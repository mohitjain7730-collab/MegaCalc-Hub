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
  meanArterialPressure: z.number({ invalid_type_error: 'Enter mean arterial pressure' }).min(50).max(150),
  cardiacOutput: z.number({ invalid_type_error: 'Enter cardiac output' }).min(2).max(30),
  peripheralResistance: z.number({ invalid_type_error: 'Enter peripheral resistance' }).min(5).max(50).optional(),
  age: z.number({ invalid_type_error: 'Enter age' }).min(1).max(100),
});

type FormValues = z.infer<typeof formSchema>;

type ResultPayload = {
  meanArterialPressure: number;
  cardiacOutput: number;
  peripheralResistance: number;
  resistanceIndex: number;
  status: 'optimal' | 'good' | 'moderate' | 'low';
  interpretation: string;
  recommendations: string[];
  plan: { label: string; detail: string }[];
};

const steps = [
  'Enter mean arterial pressure (MAP) (mmHg) from blood pressure measurement.',
  'Enter cardiac output (L/min) from cardiac assessment.',
  'Optionally enter peripheral resistance if calculated (mmHgÂ·min/L).',
  'Enter your age (peripheral resistance can change with age).',
  'Review peripheral resistance index, cardiovascular status, and recommendations.',
];

const faqs = [
  {
    question: 'What is peripheral resistance?',
    answer:
      'Peripheral resistance (systemic vascular resistance, SVR) is the resistance to blood flow in the systemic circulation. It is calculated as (MAP - CVP) / CO, where MAP is mean arterial pressure, CVP is central venous pressure, and CO is cardiac output.',
  },
  {
    question: 'How is peripheral resistance calculated?',
    answer:
      'Peripheral resistance = (mean arterial pressure - central venous pressure) / cardiac output. Simplified: SVR â‰ˆ (MAP Ã— 80) / CO (assuming CVP is small). Normal range: 800-1600 dynesÂ·s/cmâµ or 10-20 mmHgÂ·min/L.',
  },
  {
    question: 'What are normal peripheral resistance values?',
    answer:
      'Normal peripheral resistance: 800-1600 dynesÂ·s/cmâµ or approximately 10-20 mmHgÂ·min/L. Values vary with age, fitness, and cardiovascular conditions. Higher resistance indicates increased vascular resistance.',
  },
  {
    question: 'What causes high peripheral resistance?',
    answer:
      'High peripheral resistance can result from vasoconstriction, hypertension, atherosclerosis, aging, stress, medications (vasoconstrictors), or conditions affecting blood vessel function.',
  },
  {
    question: 'What causes low peripheral resistance?',
    answer:
      'Low peripheral resistance can result from vasodilation, sepsis, anaphylaxis, medications (vasodilators), exercise, or conditions causing widespread blood vessel dilation.',
  },
  {
    question: 'What is mean arterial pressure?',
    answer:
      'Mean arterial pressure (MAP) is the average pressure in arteries during one cardiac cycle. It is calculated as: MAP = DBP + 1/3(SBP - DBP), where SBP is systolic and DBP is diastolic blood pressure.',
  },
  {
    question: 'How does peripheral resistance affect blood pressure?',
    answer:
      'Peripheral resistance is a major determinant of blood pressure. Higher resistance increases blood pressure (hypertension), while lower resistance decreases blood pressure. Blood pressure = cardiac output Ã— peripheral resistance.',
  },
  {
    question: 'Does age affect peripheral resistance?',
    answer:
      'Yes. Peripheral resistance typically increases with age due to arterial stiffening, reduced elasticity, and changes in vascular function. This contributes to age-related increases in blood pressure.',
  },
  {
    question: 'Can I measure peripheral resistance at home?',
    answer:
      'Home measurement is limited. Peripheral resistance is typically calculated in clinical settings using blood pressure and cardiac output measurements. Estimation requires specialized equipment.',
  },
  {
    question: 'When should I consult a healthcare provider?',
    answer:
      'Consult a healthcare provider if peripheral resistance is significantly abnormal, if you have hypertension or cardiovascular symptoms, or if you have concerns about cardiovascular function.',
  },
];

const relatedCalculators = [
  {
    name: 'Cardiac Output (Q) Calculator',
    slug: 'cardiac-output-q-calculator',
    description: 'Calculate cardiac output alongside peripheral resistance.',
  },
  {
    name: 'Pulse Pressure Analyzer',
    slug: 'pulse-pressure-analyzer',
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

const baseUrl = 'https://mycalculating.com/health-fitness/peripheral-resistance-index-calculator';

const schemaMarkup = {
  '@context': 'https://schema.org',
  '@graph': [
    {
      '@type': 'BreadcrumbList',
      itemListElement: [
        { '@type': 'ListItem', position: 1, name: 'Home', item: 'https://mycalculating.com' },
        { '@type': 'ListItem', position: 2, name: 'Health & Fitness', item: 'https://mycalculating.com/health-fitness' },
        { '@type': 'ListItem', position: 3, name: 'Peripheral Resistance Index Calculator', item: baseUrl },
      ],
    },
    {
      '@type': 'SoftwareApplication',
      name: 'Peripheral Resistance Index Calculator',
      applicationCategory: 'Calculator',
      operatingSystem: 'Web Browser',
      description: 'Calculate peripheral resistance index from mean arterial pressure, cardiac output, peripheral resistance, and age.',
      url: baseUrl,
      offers: { '@type': 'Offer', price: '0', priceCurrency: 'USD' },
    },
  ],
};

const clamp = (value: number, min: number, max: number) => Math.min(max, Math.max(min, value));

const calculateResult = (values: FormValues): ResultPayload => {
  const meanArterialPressure = values.meanArterialPressure;
  const cardiacOutput = values.cardiacOutput;
  
  let peripheralResistance: number;
  
  if (values.peripheralResistance) {
    // Use provided resistance
    peripheralResistance = values.peripheralResistance;
  } else {
    // Calculate from MAP and CO
    // SVR â‰ˆ (MAP Ã— 80) / CO (simplified, assuming CVP is small)
    peripheralResistance = (meanArterialPressure * 80) / cardiacOutput;
    // Convert to mmHgÂ·min/L (divide by 80)
    peripheralResistance = peripheralResistance / 80;
  }
  
  // Normal range: 10-20 mmHgÂ·min/L
  const minNormal = 10;
  const maxNormal = 20;
  const midNormal = 15;
  
  const resistanceIndex = ((peripheralResistance - minNormal) / (maxNormal - minNormal)) * 100;
  const clampedIndex = clamp(resistanceIndex, 0, 100);

  let status: ResultPayload['status'] = 'optimal';
  let interpretation = 'Your peripheral resistance appears normal. Continue maintaining healthy cardiovascular function.';

  if (peripheralResistance > 25 || peripheralResistance < 5) {
    status = 'low';
    interpretation = 'Your peripheral resistance is significantly abnormal. This may indicate serious cardiovascular issues. Consult a healthcare provider immediately for evaluation.';
  } else if (peripheralResistance > 20 || peripheralResistance < 10) {
    status = 'moderate';
    interpretation = 'Your peripheral resistance is outside normal range. Monitor closely and consult healthcare provider for guidance.';
  } else if (clampedIndex < 70) {
    status = 'good';
    interpretation = 'Your peripheral resistance is good. Continue maintaining healthy lifestyle to support cardiovascular function.';
  }

  const recommendations = [
    'Manage blood pressure through lifestyle modifications: maintain healthy weight, regular exercise, reduce sodium intake, and manage stress.',
    'Support cardiovascular health through regular physical activity, which can help improve vascular function and reduce peripheral resistance.',
    'Follow healthcare provider recommendations for blood pressure management, including medications if prescribed, to maintain optimal peripheral resistance.',
  ];
  if (status === 'low' || status === 'moderate') {
    recommendations.push('Consult a healthcare provider for comprehensive cardiovascular evaluation, including blood pressure monitoring and appropriate management strategies.');
  }
  if (peripheralResistance > 20) {
    recommendations.push('Address high peripheral resistance promptly. This may contribute to hypertension and increase cardiovascular risk. Lifestyle changes and medications may be needed.');
  }

  const plan = [
    { label: 'This Week', detail: 'Review mean arterial pressure and cardiac output measurements. Calculate peripheral resistance and assess cardiovascular status.' },
    { label: 'This Month', detail: 'Implement cardiovascular health improvements: blood pressure management, regular exercise, and follow healthcare provider recommendations.' },
    { label: 'Ongoing', detail: 'Monitor peripheral resistance and cardiovascular function regularly through healthcare provider. Address any persistent abnormalities with medical guidance and appropriate treatment.' },
  ];

  return { meanArterialPressure, cardiacOutput, peripheralResistance, resistanceIndex: clampedIndex, status, interpretation, recommendations, plan };
};

export default function PeripheralResistanceIndexCalculator() {
  const [result, setResult] = useState<ResultPayload | null>(null);

  const form = useForm<FormValues>({
    resolver: zodResolver(formSchema),
    defaultValues: {
      meanArterialPressure: undefined,
      cardiacOutput: undefined,
      peripheralResistance: undefined,
      age: undefined,
    },
  });

  return (
    <div className="space-y-8">
      <Script id="peripheral-resistance-schema" type="application/ld+json" strategy="afterInteractive" dangerouslySetInnerHTML={{ __html: JSON.stringify(schemaMarkup) }} />

      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <Activity className="h-5 w-5" />
            Peripheral Resistance Index Calculator
          </CardTitle>
          <CardDescription>Calculate peripheral resistance index from mean arterial pressure, cardiac output, peripheral resistance, and age.</CardDescription>
        </CardHeader>
      </Card>

      <Card>
        <CardHeader>
          <CardTitle>Input your peripheral resistance data</CardTitle>
        </CardHeader>
        <CardContent>
          <Form {...form}>
            <form onSubmit={form.handleSubmit((values) => setResult(calculateResult(values)))} className="space-y-6">
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <FormField
                  control={form.control}
                  name="meanArterialPressure"
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel>Mean arterial pressure (MAP) (mmHg)</FormLabel>
                      <FormControl>
                        <Input type="number" step="0.1" placeholder="e.g., 93" value={field.value ?? ''} onChange={(e) => field.onChange(e.target.value === '' ? undefined : Number(e.target.value))} />
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
                      <FormLabel>Cardiac output (L/min)</FormLabel>
                      <FormControl>
                        <Input type="number" step="0.1" placeholder="e.g., 5.0" value={field.value ?? ''} onChange={(e) => field.onChange(e.target.value === '' ? undefined : Number(e.target.value))} />
                      </FormControl>
                      <FormMessage />
                    </FormItem>
                  )}
                />
                <FormField
                  control={form.control}
                  name="peripheralResistance"
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel>Peripheral resistance (mmHgÂ·min/L) (optional)</FormLabel>
                      <FormControl>
                        <Input type="number" step="0.1" placeholder="e.g., 15" value={field.value ?? ''} onChange={(e) => field.onChange(e.target.value === '' ? undefined : Number(e.target.value))} />
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
                Calculate peripheral resistance
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
            <CardDescription>See peripheral resistance index, cardiovascular status, and recommendations.</CardDescription>
          </CardHeader>
          <CardContent className="space-y-6">
            <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
              <div className="p-4 border rounded">
                <p className="text-sm text-muted-foreground">Mean arterial pressure</p>
                <p className="text-2xl font-semibold text-primary">{result.meanArterialPressure.toFixed(1)}</p>
                <p className="text-xs text-muted-foreground">mmHg</p>
              </div>
              <div className="p-4 border rounded">
                <p className="text-sm text-muted-foreground">Cardiac output</p>
                <p className="text-2xl font-semibold text-primary">{result.cardiacOutput.toFixed(2)}</p>
                <p className="text-xs text-muted-foreground">L/min</p>
              </div>
              <div className="p-4 border rounded">
                <p className="text-sm text-muted-foreground">Peripheral resistance</p>
                <p className="text-2xl font-semibold text-primary">{result.peripheralResistance.toFixed(1)}</p>
                <p className="text-xs text-muted-foreground">mmHgÂ·min/L</p>
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
            <strong>Peripheral resistance</strong> = (mean arterial pressure Ã— 80) / cardiac output / 80 = MAP / CO (mmHgÂ·min/L).
          </p>
          <p>
            <strong>If resistance not provided</strong>: Calculated from mean arterial pressure and cardiac output. Simplified formula assumes central venous pressure is small.
          </p>
          <p>
            <strong>Normal ranges</strong>: 10-20 mmHgÂ·min/L or 800-1600 dynesÂ·s/cmâµ. Values vary with age, fitness, and cardiovascular conditions.
          </p>
          <p>Peripheral resistance is a major determinant of blood pressure. Higher resistance increases blood pressure, while lower resistance decreases it. Blood pressure = cardiac output Ã— peripheral resistance.</p>
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
                <p className="text-sm text-muted-foreground">Target resistance</p>
                <p className="text-xl font-semibold text-primary">10-20 mmHgÂ·min/L</p>
                <p className="text-xs text-muted-foreground">Normal range</p>
              </div>
              <div className="p-4 border rounded">
                <p className="text-sm text-muted-foreground">Resistance index</p>
                <p className="text-xl font-semibold text-primary">{result.resistanceIndex.toFixed(0)}</p>
                <p className="text-xs text-muted-foreground">Out of 100</p>
              </div>
              <div className="p-4 border rounded">
                <p className="text-sm text-muted-foreground">Resistance status</p>
                <p className="text-xl font-semibold text-primary">
                  {result.peripheralResistance >= 10 && result.peripheralResistance <= 20 ? 'Normal' : result.peripheralResistance > 20 ? 'High' : 'Low'}
                </p>
                <p className="text-xs text-muted-foreground">Based on value</p>
              </div>
            </div>
          ) : (
            <p className="text-sm text-muted-foreground">Enter your peripheral resistance data to see additional insights.</p>
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
          <p>Peripheral resistance (systemic vascular resistance) is the resistance to blood flow in the systemic circulation. Normal range: 10-20 mmHgÂ·min/L. It is a major determinant of blood pressure and is calculated from mean arterial pressure and cardiac output.</p>
          <p>Use this calculator to assess peripheral resistance index from mean arterial pressure, cardiac output, peripheral resistance (optional), and age.</p>
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
          <p>This tool calculates peripheral resistance index from mean arterial pressure, cardiac output, peripheral resistance (optional), and age.</p>
          <p>Outputs include mean arterial pressure, cardiac output, peripheral resistance, resistance index, status, recommendations, an action plan, and supporting metrics.</p>
          <p>Formula, steps, guide content, related tools, and FAQs ensure humans or AI assistants can interpret the methodology instantly.</p>
        </CardContent>
      </Card>
    </div>
  );
}


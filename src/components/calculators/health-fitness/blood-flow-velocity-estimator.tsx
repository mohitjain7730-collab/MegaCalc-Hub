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
  cardiacOutput: z.number({ invalid_type_error: 'Enter cardiac output' }).min(2).max(30),
  vesselDiameter: z.number({ invalid_type_error: 'Enter vessel diameter' }).min(0.1).max(5),
  flowVelocity: z.number({ invalid_type_error: 'Enter flow velocity' }).min(0.1).max(200).optional(),
  age: z.number({ invalid_type_error: 'Enter age' }).min(1).max(100),
});

type FormValues = z.infer<typeof formSchema>;

type ResultPayload = {
  cardiacOutput: number;
  vesselDiameter: number;
  flowVelocity: number;
  velocityIndex: number;
  status: 'optimal' | 'good' | 'moderate' | 'low';
  interpretation: string;
  recommendations: string[];
  plan: { label: string; detail: string }[];
};

const steps = [
  'Enter cardiac output (L/min) from cardiac assessment.',
  'Enter vessel diameter (cm) from vascular assessment or estimate.',
  'Optionally enter flow velocity if measured (cm/s).',
  'Enter your age (blood flow can change with age).',
  'Review blood flow velocity, vascular status, and recommendations.',
];

const faqs = [
  {
    question: 'What is blood flow velocity?',
    answer:
      'Blood flow velocity is the speed at which blood flows through blood vessels. It is affected by cardiac output, vessel diameter, blood viscosity, and vascular resistance. Normal velocities vary by vessel type and location.',
  },
  {
    question: 'How is blood flow velocity calculated?',
    answer:
      'Flow velocity can be estimated using: velocity = (4 Ã— flow rate) / (Ï€ Ã— diameterÂ²). For blood flow: velocity â‰ˆ (cardiac output Ã— 1000) / (cross-sectional area Ã— 60), where area = Ï€ Ã— (diameter/2)Â².',
  },
  {
    question: 'What are normal blood flow velocities?',
    answer:
      'Normal velocities vary by vessel: Aorta: 100-150 cm/s, Large arteries: 50-100 cm/s, Small arteries: 20-50 cm/s, Capillaries: 0.01-0.1 cm/s, Veins: 10-30 cm/s. Values vary with cardiac output and vessel size.',
  },
  {
    question: 'What affects blood flow velocity?',
    answer:
      'Blood flow velocity is affected by cardiac output, vessel diameter, blood viscosity, vascular resistance, exercise, age, and cardiovascular health. Narrower vessels and higher cardiac output increase velocity.',
  },
  {
    question: 'What does high flow velocity mean?',
    answer:
      'High flow velocity may indicate increased cardiac output, narrowed vessels (stenosis), or increased vascular resistance. It can be normal during exercise or may indicate vascular disease requiring evaluation.',
  },
  {
    question: 'What does low flow velocity mean?',
    answer:
      'Low flow velocity may indicate reduced cardiac output, dilated vessels, or decreased vascular resistance. It can be normal at rest or may indicate cardiovascular limitations requiring evaluation.',
  },
  {
    question: 'How does exercise affect flow velocity?',
    answer:
      'Flow velocity increases during exercise due to increased cardiac output and vasodilation in active muscles. This is normal and helps meet increased oxygen and nutrient demands during exercise.',
  },
  {
    question: 'Does age affect blood flow velocity?',
    answer:
      'Yes. Blood flow velocity may change with age due to changes in cardiac output, arterial stiffness, vessel diameter, and cardiovascular function. Age-related changes can affect flow patterns.',
  },
  {
    question: 'Can I measure blood flow velocity at home?',
    answer:
      'Home measurement is limited. Blood flow velocity is typically measured in clinical settings using Doppler ultrasound or other specialized techniques. Estimation requires cardiac output and vessel measurements.',
  },
  {
    question: 'When should I consult a healthcare provider?',
    answer:
      'Consult a healthcare provider if flow velocity is significantly abnormal, if you have cardiovascular symptoms, or if you have concerns about vascular health or blood flow.',
  },
];

const relatedCalculators = [
  {
    name: 'Cardiac Output (Q) Calculator',
    slug: 'cardiac-output-q-calculator',
    description: 'Calculate cardiac output alongside flow velocity.',
  },
  {
    name: 'Peripheral Resistance Index Calculator',
    slug: 'peripheral-resistance-index-calculator',
    description: 'Assess vascular health comprehensively.',
  },
  {
    name: 'Arterial Elasticity Index Calculator',
    slug: 'arterial-elasticity-index-calculator',
    description: 'Evaluate complete cardiovascular parameters.',
  },
  {
    name: 'Pulse Pressure Analyzer',
    slug: 'pulse-pressure-analyzer',
    description: 'Monitor cardiovascular health together.',
  },
];

const baseUrl = 'https://mycalculating.com/health-fitness/blood-flow-velocity-estimator';

const schemaMarkup = {
  '@context': 'https://schema.org',
  '@graph': [
    {
      '@type': 'BreadcrumbList',
      itemListElement: [
        { '@type': 'ListItem', position: 1, name: 'Home', item: 'https://mycalculating.com' },
        { '@type': 'ListItem', position: 2, name: 'Health & Fitness', item: 'https://mycalculating.com/health-fitness' },
        { '@type': 'ListItem', position: 3, name: 'Blood Flow Velocity Estimator', item: baseUrl },
      ],
    },
    {
      '@type': 'SoftwareApplication',
      name: 'Blood Flow Velocity Estimator',
      applicationCategory: 'Calculator',
      operatingSystem: 'Web Browser',
      description: 'Estimate blood flow velocity from cardiac output, vessel diameter, flow velocity, and age.',
      url: baseUrl,
      offers: { '@type': 'Offer', price: '0', priceCurrency: 'USD' },
    },
  ],
};

const clamp = (value: number, min: number, max: number) => Math.min(max, Math.max(min, value));

const calculateResult = (values: FormValues): ResultPayload => {
  const cardiacOutput = values.cardiacOutput; // L/min
  const vesselDiameter = values.vesselDiameter; // cm
  
  let flowVelocity: number;
  
  if (values.flowVelocity) {
    flowVelocity = values.flowVelocity;
  } else {
    // Estimate flow velocity
    // Flow velocity = (4 Ã— flow rate) / (Ï€ Ã— diameterÂ²)
    // For blood: flow rate in mL/s = (cardiac output Ã— 1000) / 60
    const flowRateMlS = (cardiacOutput * 1000) / 60; // mL/s
    const radius = vesselDiameter / 2; // cm
    const crossSectionalArea = Math.PI * radius * radius; // cmÂ²
    flowVelocity = (4 * flowRateMlS) / (Math.PI * vesselDiameter * vesselDiameter);
    // Simplified: velocity â‰ˆ flow rate / area
    flowVelocity = flowRateMlS / crossSectionalArea;
  }
  
  // Normal velocities vary by vessel type
  // For large arteries: 50-100 cm/s
  // Calculate velocity index (0-100)
  let velocityIndex = 50;
  
  if (flowVelocity >= 50 && flowVelocity <= 100) {
    velocityIndex += 30; // Normal for large arteries
  } else if (flowVelocity >= 30 && flowVelocity < 50) {
    velocityIndex += 15; // Moderate
  } else if (flowVelocity >= 100 && flowVelocity <= 150) {
    velocityIndex += 20; // High but may be normal (aorta)
  } else if (flowVelocity > 150) {
    velocityIndex -= 10; // Very high (may indicate stenosis)
  } else if (flowVelocity < 30 && flowVelocity >= 10) {
    velocityIndex -= 5; // Low but may be normal for smaller vessels
  } else if (flowVelocity < 10) {
    velocityIndex -= 20; // Very low
  }
  
  velocityIndex = clamp(velocityIndex, 0, 100);

  let status: ResultPayload['status'] = 'optimal';
  let interpretation = 'Your estimated blood flow velocity appears normal. Continue maintaining healthy cardiovascular function.';

  if (flowVelocity > 200 || flowVelocity < 5 || velocityIndex < 30) {
    status = 'low';
    interpretation = 'Your estimated blood flow velocity is significantly abnormal. This may indicate vascular issues or measurement concerns. Consult a healthcare provider for evaluation.';
  } else if (flowVelocity > 150 || flowVelocity < 10 || velocityIndex < 50) {
    status = 'moderate';
    interpretation = 'Your estimated blood flow velocity is outside typical ranges. Monitor closely and consult healthcare provider for guidance.';
  } else if (velocityIndex < 70) {
    status = 'good';
    interpretation = 'Your estimated blood flow velocity is good. Continue maintaining healthy lifestyle to support cardiovascular function.';
  }

  const recommendations = [
    'Maintain cardiovascular health through regular exercise, which can help optimize cardiac output and blood flow velocity patterns.',
    'Support vascular health through healthy lifestyle: regular exercise, proper nutrition, blood pressure management, and avoidance of smoking.',
    'Follow healthcare provider recommendations for cardiovascular health, including medications if prescribed, to maintain optimal blood flow and vascular function.',
  ];
  if (status === 'low' || status === 'moderate') {
    recommendations.push('Consult a healthcare provider for comprehensive vascular evaluation, including Doppler ultrasound or other assessments if needed.');
  }
  if (flowVelocity > 150) {
    recommendations.push('Address elevated flow velocity. This may indicate vessel narrowing (stenosis) or other vascular issues requiring medical evaluation.');
  }

  const plan = [
    { label: 'This Week', detail: 'Review cardiac output and vessel diameter measurements if available. Estimate blood flow velocity and assess vascular status.' },
    { label: 'This Month', detail: 'Implement cardiovascular health improvements: regular exercise, vascular health management, and follow healthcare provider recommendations.' },
    { label: 'Ongoing', detail: 'Monitor blood flow and vascular function regularly through healthcare provider. Address any persistent abnormalities with medical guidance and appropriate treatment.' },
  ];

  return { cardiacOutput, vesselDiameter, flowVelocity, velocityIndex, status, interpretation, recommendations, plan };
};

export default function BloodFlowVelocityEstimator() {
  const [result, setResult] = useState<ResultPayload | null>(null);

  const form = useForm<FormValues>({
    resolver: zodResolver(formSchema),
    defaultValues: {
      cardiacOutput: undefined,
      vesselDiameter: undefined,
      flowVelocity: undefined,
      age: undefined,
    },
  });

  return (
    <div className="space-y-8">
      <Script id="blood-flow-velocity-schema" type="application/ld+json" strategy="afterInteractive" dangerouslySetInnerHTML={{ __html: JSON.stringify(schemaMarkup) }} />

      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <Wind className="h-5 w-5" />
            Blood Flow Velocity Estimator
          </CardTitle>
          <CardDescription>Estimate blood flow velocity from cardiac output, vessel diameter, flow velocity, and age.</CardDescription>
        </CardHeader>
      </Card>

      <Card>
        <CardHeader>
          <CardTitle>Input your blood flow velocity data</CardTitle>
        </CardHeader>
        <CardContent>
          <Form {...form}>
            <form onSubmit={form.handleSubmit((values) => setResult(calculateResult(values)))} className="space-y-6">
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
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
                  name="vesselDiameter"
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel>Vessel diameter (cm)</FormLabel>
                      <FormControl>
                        <Input type="number" step="0.1" placeholder="e.g., 2.0" value={field.value ?? ''} onChange={(e) => field.onChange(e.target.value === '' ? undefined : Number(e.target.value))} />
                      </FormControl>
                      <FormMessage />
                    </FormItem>
                  )}
                />
                <FormField
                  control={form.control}
                  name="flowVelocity"
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel>Flow velocity (cm/s) (optional)</FormLabel>
                      <FormControl>
                        <Input type="number" step="0.1" placeholder="e.g., 80" value={field.value ?? ''} onChange={(e) => field.onChange(e.target.value === '' ? undefined : Number(e.target.value))} />
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
                Estimate flow velocity
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
            <CardDescription>See blood flow velocity, vascular status, and recommendations.</CardDescription>
          </CardHeader>
          <CardContent className="space-y-6">
            <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
              <div className="p-4 border rounded">
                <p className="text-sm text-muted-foreground">Cardiac output</p>
                <p className="text-2xl font-semibold text-primary">{result.cardiacOutput.toFixed(2)}</p>
                <p className="text-xs text-muted-foreground">L/min</p>
              </div>
              <div className="p-4 border rounded">
                <p className="text-sm text-muted-foreground">Vessel diameter</p>
                <p className="text-2xl font-semibold text-primary">{result.vesselDiameter.toFixed(2)}</p>
                <p className="text-xs text-muted-foreground">cm</p>
              </div>
              <div className="p-4 border rounded">
                <p className="text-sm text-muted-foreground">Flow velocity</p>
                <p className="text-2xl font-semibold text-primary">{result.flowVelocity.toFixed(1)}</p>
                <p className="text-xs text-muted-foreground">cm/s</p>
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
            <strong>Flow velocity</strong> = flow rate (mL/s) / cross-sectional area (cmÂ²).
          </p>
          <p>
            <strong>Flow rate</strong> = (cardiac output Ã— 1000) / 60 (mL/s). Cross-sectional area = Ï€ Ã— (diameter/2)Â².
          </p>
          <p>
            <strong>Normal ranges</strong>: Vary by vessel type. Large arteries: 50-100 cm/s, Aorta: 100-150 cm/s, Small arteries: 20-50 cm/s. Values vary with cardiac output and vessel size.
          </p>
          <p>Blood flow velocity is affected by cardiac output, vessel diameter, blood viscosity, vascular resistance, exercise, and cardiovascular health.</p>
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
                <p className="text-sm text-muted-foreground">Target velocity (large arteries)</p>
                <p className="text-xl font-semibold text-primary">50-100 cm/s</p>
                <p className="text-xs text-muted-foreground">Normal range</p>
              </div>
              <div className="p-4 border rounded">
                <p className="text-sm text-muted-foreground">Velocity index</p>
                <p className="text-xl font-semibold text-primary">{result.velocityIndex.toFixed(0)}</p>
                <p className="text-xs text-muted-foreground">Out of 100</p>
              </div>
              <div className="p-4 border rounded">
                <p className="text-sm text-muted-foreground">Cross-sectional area</p>
                <p className="text-xl font-semibold text-primary">
                  {(Math.PI * (result.vesselDiameter / 2) * (result.vesselDiameter / 2)).toFixed(2)} cmÂ²
                </p>
                <p className="text-xs text-muted-foreground">Vessel area</p>
              </div>
            </div>
          ) : (
            <p className="text-sm text-muted-foreground">Enter your blood flow velocity data to see additional insights.</p>
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
          <p>Blood flow velocity is the speed at which blood flows through vessels, affected by cardiac output and vessel diameter. Normal velocities vary by vessel: large arteries 50-100 cm/s, aorta 100-150 cm/s.</p>
          <p>Use this calculator to estimate blood flow velocity from cardiac output, vessel diameter, flow velocity (optional), and age.</p>
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
          <p>This tool estimates blood flow velocity from cardiac output, vessel diameter, flow velocity (optional), and age.</p>
          <p>Outputs include cardiac output, vessel diameter, flow velocity, velocity index, status, recommendations, an action plan, and supporting metrics.</p>
          <p>Formula, steps, guide content, related tools, and FAQs ensure humans or AI assistants can interpret the methodology instantly.</p>
        </CardContent>
      </Card>
    </div>
  );
}


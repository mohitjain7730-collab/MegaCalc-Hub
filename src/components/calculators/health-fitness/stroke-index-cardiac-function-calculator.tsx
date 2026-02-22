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
  strokeVolume: z.number({ invalid_type_error: 'Enter stroke volume' }).min(30).max(150),
  bodySurfaceArea: z.number({ invalid_type_error: 'Enter body surface area' }).min(1).max(3).optional(),
  weight: z.number({ invalid_type_error: 'Enter weight' }).min(30).max(300),
  height: z.number({ invalid_type_error: 'Enter height' }).min(100).max(250),
});

type FormValues = z.infer<typeof formSchema>;

type ResultPayload = {
  strokeVolume: number;
  bodySurfaceArea: number;
  strokeIndex: number;
  functionIndex: number;
  status: 'optimal' | 'good' | 'moderate' | 'low';
  interpretation: string;
  recommendations: string[];
  plan: { label: string; detail: string }[];
};

const steps = [
  'Enter stroke volume (mL/beat) from cardiac assessment.',
  'Enter weight (kg) for body surface area calculation.',
  'Enter height (cm) for body surface area calculation.',
  'Optionally enter body surface area if calculated (mÂ²).',
  'Review stroke index, cardiac function status, and recommendations.',
];

const faqs = [
  {
    question: 'What is stroke index?',
    answer:
      'Stroke index is stroke volume normalized to body surface area (BSA). It accounts for body size differences and provides a standardized measure of cardiac function. Normal range: 30-65 mL/beat/mÂ².',
  },
  {
    question: 'How is stroke index calculated?',
    answer:
      'Stroke index = stroke volume (mL/beat) / body surface area (mÂ²). BSA can be calculated using formulas like Du Bois: BSA = 0.007184 Ã— weight^0.425 Ã— height^0.725.',
  },
  {
    question: 'What are normal stroke index values?',
    answer:
      'Normal stroke index: 30-65 mL/beat/mÂ². Values below 30 may indicate reduced cardiac function, while values above 65 may indicate excellent cardiac function or specific conditions.',
  },
  {
    question: 'What affects stroke index?',
    answer:
      'Stroke index is affected by stroke volume, body size, cardiovascular fitness, age, heart function, preload, afterload, contractility, and other factors affecting cardiac performance.',
  },
  {
    question: 'What does high stroke index mean?',
    answer:
      'High stroke index indicates good cardiac function with efficient stroke volume relative to body size. This is associated with better cardiovascular fitness and cardiac efficiency.',
  },
  {
    question: 'What does low stroke index mean?',
    answer:
      'Low stroke index may indicate reduced cardiac function, decreased stroke volume, or cardiac limitations. This can improve with cardiovascular training and appropriate medical management.',
  },
  {
    question: 'How does exercise affect stroke index?',
    answer:
      'Stroke index increases during exercise due to increased stroke volume. Trained individuals typically have higher stroke index values, reflecting better cardiovascular fitness and cardiac function.',
  },
  {
    question: 'Does age affect stroke index?',
    answer:
      'Yes. Stroke index may decrease with age due to reduced stroke volume, decreased cardiovascular function, and age-related changes in heart function. Regular exercise can help maintain stroke index.',
  },
  {
    question: 'Can I measure stroke index at home?',
    answer:
      'Home measurement is limited. Stroke index requires stroke volume and body surface area measurements, typically done in clinical settings using echocardiography or other cardiac assessments.',
  },
  {
    question: 'When should I consult a healthcare provider?',
    answer:
      'Consult a healthcare provider if stroke index is significantly low, if you have cardiovascular symptoms, or if you have concerns about cardiac function or cardiovascular health.',
  },
];

const relatedCalculators = [
  {
    name: 'Cardiac Output (Q) Calculator',
    slug: 'cardiac-output-q-calculator',
    description: 'Calculate cardiac output alongside stroke index.',
  },
  {
    name: 'Oxygen Pulse Efficiency Calculator',
    slug: 'oxygen-pulse-efficiency-calculator',
    description: 'Assess cardiac efficiency comprehensively.',
  },
  {
    name: 'Heart Workload (Rate Pressure Product) Calculator',
    slug: 'heart-workload-rate-pressure-product-calculator',
    description: 'Evaluate complete cardiovascular parameters.',
  },
  {
    name: 'Blood Volume Estimator',
    slug: 'blood-volume-estimator',
    description: 'Monitor cardiovascular health together.',
  },
];

const baseUrl = 'https://mycalculating.com/health-fitness/stroke-index-cardiac-function-calculator';

const schemaMarkup = {
  '@context': 'https://schema.org',
  '@graph': [
    {
      '@type': 'BreadcrumbList',
      itemListElement: [
        { '@type': 'ListItem', position: 1, name: 'Home', item: 'https://mycalculating.com' },
        { '@type': 'ListItem', position: 2, name: 'Health & Fitness', item: 'https://mycalculating.com/health-fitness' },
        { '@type': 'ListItem', position: 3, name: 'Stroke Index (Cardiac Function) Calculator', item: baseUrl },
      ],
    },
    {
      '@type': 'SoftwareApplication',
      name: 'Stroke Index (Cardiac Function) Calculator',
      applicationCategory: 'Calculator',
      operatingSystem: 'Web Browser',
      description: 'Calculate stroke index cardiac function from stroke volume, body surface area, weight, and height.',
      url: baseUrl,
      offers: { '@type': 'Offer', price: '0', priceCurrency: 'USD' },
    },
  ],
};

const clamp = (value: number, min: number, max: number) => Math.min(max, Math.max(min, value));

const calculateResult = (values: FormValues): ResultPayload => {
  const strokeVolume = values.strokeVolume;
  
  let bodySurfaceArea: number;
  
  if (values.bodySurfaceArea) {
    bodySurfaceArea = values.bodySurfaceArea;
  } else {
    // Du Bois formula: BSA = 0.007184 Ã— weight^0.425 Ã— height^0.725
    const weightKg = values.weight;
    const heightCm = values.height;
    bodySurfaceArea = 0.007184 * Math.pow(weightKg, 0.425) * Math.pow(heightCm, 0.725);
  }
  
  const strokeIndex = strokeVolume / bodySurfaceArea;
  
  // Normal range: 30-65 mL/beat/mÂ²
  const minNormal = 30;
  const maxNormal = 65;
  const midNormal = 47.5;
  
  // Calculate function index (0-100)
  let functionIndex = 50;
  
  if (strokeIndex >= 40 && strokeIndex <= 60) {
    functionIndex += 30; // Optimal range
  } else if (strokeIndex >= 30 && strokeIndex < 40) {
    functionIndex += 15; // Good range
  } else if (strokeIndex >= 60 && strokeIndex <= 70) {
    functionIndex += 20; // Excellent
  } else if (strokeIndex < 30) {
    functionIndex -= 30; // Low
  } else if (strokeIndex > 70) {
    functionIndex += 10; // Very high (may be normal variation)
  }
  
  functionIndex = clamp(functionIndex, 0, 100);

  let status: ResultPayload['status'] = 'optimal';
  let interpretation = 'Your stroke index appears optimal. Continue maintaining healthy cardiac function.';

  if (strokeIndex < 25 || functionIndex < 30) {
    status = 'low';
    interpretation = 'Your stroke index is low. This may indicate reduced cardiac function. Consult a healthcare provider immediately for evaluation and management.';
  } else if (strokeIndex < 30 || functionIndex < 50) {
    status = 'moderate';
    interpretation = 'Your stroke index is below normal. Monitor closely and consult healthcare provider for guidance.';
  } else if (functionIndex < 70) {
    status = 'good';
    interpretation = 'Your stroke index is good. Continue maintaining healthy lifestyle to support cardiac function.';
  }

  const recommendations = [
    'Engage in regular cardiovascular exercise to improve stroke index and cardiac function. Aerobic training increases stroke volume and cardiovascular fitness.',
    'Maintain cardiovascular health through healthy lifestyle: regular exercise, proper nutrition, adequate hydration, and management of cardiovascular risk factors.',
    'Follow healthcare provider recommendations for cardiac health, including medications if prescribed, to maintain optimal stroke index and cardiac function.',
  ];
  if (status === 'low' || status === 'moderate') {
    recommendations.push('Consult a healthcare provider for comprehensive cardiac evaluation, including echocardiography or other cardiac assessments if needed.');
  }
  if (strokeIndex < 30) {
    recommendations.push('Address low stroke index promptly. This may indicate heart failure, valve problems, or other cardiac conditions requiring medical attention.');
  }

  const plan = [
    { label: 'This Week', detail: 'Review stroke volume and body surface area measurements if available. Calculate stroke index and assess cardiac function status.' },
    { label: 'This Month', detail: 'Implement cardiovascular health improvements: regular exercise, cardiac health management, and follow healthcare provider recommendations.' },
    { label: 'Ongoing', detail: 'Monitor stroke index and cardiac function regularly through healthcare provider. Address any persistent abnormalities with medical guidance and appropriate treatment.' },
  ];

  return { strokeVolume, bodySurfaceArea, strokeIndex, functionIndex, status, interpretation, recommendations, plan };
};

export default function StrokeIndexCardiacFunctionCalculator() {
  const [result, setResult] = useState<ResultPayload | null>(null);

  const form = useForm<FormValues>({
    resolver: zodResolver(formSchema),
    defaultValues: {
      strokeVolume: undefined,
      bodySurfaceArea: undefined,
      weight: undefined,
      height: undefined,
    },
  });

  return (
    <div className="space-y-8">
      <Script id="stroke-index-schema" type="application/ld+json" strategy="afterInteractive" dangerouslySetInnerHTML={{ __html: JSON.stringify(schemaMarkup) }} />

      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <Heart className="h-5 w-5" />
            Stroke Index (Cardiac Function) Calculator
          </CardTitle>
          <CardDescription>Calculate stroke index cardiac function from stroke volume, body surface area, weight, and height.</CardDescription>
        </CardHeader>
      </Card>

      <Card>
        <CardHeader>
          <CardTitle>Input your stroke index data</CardTitle>
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
                      <FormLabel>Stroke volume (mL/beat)</FormLabel>
                      <FormControl>
                        <Input type="number" step="1" placeholder="e.g., 70" value={field.value ?? ''} onChange={(e) => field.onChange(e.target.value === '' ? undefined : Number(e.target.value))} />
                      </FormControl>
                      <FormMessage />
                    </FormItem>
                  )}
                />
                <FormField
                  control={form.control}
                  name="weight"
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel>Weight (kg)</FormLabel>
                      <FormControl>
                        <Input type="number" step="0.1" placeholder="e.g., 70" value={field.value ?? ''} onChange={(e) => field.onChange(e.target.value === '' ? undefined : Number(e.target.value))} />
                      </FormControl>
                      <FormMessage />
                    </FormItem>
                  )}
                />
                <FormField
                  control={form.control}
                  name="height"
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel>Height (cm)</FormLabel>
                      <FormControl>
                        <Input type="number" step="0.1" placeholder="e.g., 175" value={field.value ?? ''} onChange={(e) => field.onChange(e.target.value === '' ? undefined : Number(e.target.value))} />
                      </FormControl>
                      <FormMessage />
                    </FormItem>
                  )}
                />
                <FormField
                  control={form.control}
                  name="bodySurfaceArea"
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel>Body surface area (mÂ²) (optional)</FormLabel>
                      <FormControl>
                        <Input type="number" step="0.01" placeholder="e.g., 1.8" value={field.value ?? ''} onChange={(e) => field.onChange(e.target.value === '' ? undefined : Number(e.target.value))} />
                      </FormControl>
                      <FormMessage />
                    </FormItem>
                  )}
                />
              </div>
              <Button type="submit" className="w-full md:w-auto">
                Calculate stroke index
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
            <CardDescription>See stroke index, cardiac function status, and recommendations.</CardDescription>
          </CardHeader>
          <CardContent className="space-y-6">
            <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
              <div className="p-4 border rounded">
                <p className="text-sm text-muted-foreground">Stroke volume</p>
                <p className="text-2xl font-semibold text-primary">{result.strokeVolume.toFixed(0)}</p>
                <p className="text-xs text-muted-foreground">mL/beat</p>
              </div>
              <div className="p-4 border rounded">
                <p className="text-sm text-muted-foreground">Body surface area</p>
                <p className="text-2xl font-semibold text-primary">{result.bodySurfaceArea.toFixed(2)}</p>
                <p className="text-xs text-muted-foreground">mÂ²</p>
              </div>
              <div className="p-4 border rounded">
                <p className="text-sm text-muted-foreground">Stroke index</p>
                <p className="text-2xl font-semibold text-primary">{result.strokeIndex.toFixed(1)}</p>
                <p className="text-xs text-muted-foreground">mL/beat/mÂ²</p>
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
            <strong>Stroke index</strong> = stroke volume (mL/beat) / body surface area (mÂ²).
          </p>
          <p>
            <strong>Body surface area (Du Bois)</strong> = 0.007184 Ã— weight^0.425 Ã— height^0.725.
          </p>
          <p>
            <strong>Normal ranges</strong>: 30-65 mL/beat/mÂ². Values below 30 may indicate reduced cardiac function. Values above 65 may indicate excellent cardiac function.
          </p>
          <p>Stroke index accounts for body size differences and provides a standardized measure of cardiac function. It is affected by stroke volume, body size, cardiovascular fitness, and cardiac health.</p>
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
                <p className="text-sm text-muted-foreground">Target stroke index</p>
                <p className="text-xl font-semibold text-primary">30-65 mL/beat/mÂ²</p>
                <p className="text-xs text-muted-foreground">Normal range</p>
              </div>
              <div className="p-4 border rounded">
                <p className="text-sm text-muted-foreground">Function index</p>
                <p className="text-xl font-semibold text-primary">{result.functionIndex.toFixed(0)}</p>
                <p className="text-xs text-muted-foreground">Out of 100</p>
              </div>
              <div className="p-4 border rounded">
                <p className="text-sm text-muted-foreground">Index status</p>
                <p className="text-xl font-semibold text-primary">
                  {result.strokeIndex >= 30 && result.strokeIndex <= 65 ? 'Normal' : result.strokeIndex < 30 ? 'Low' : 'High'}
                </p>
                <p className="text-xs text-muted-foreground">Based on value</p>
              </div>
            </div>
          ) : (
            <p className="text-sm text-muted-foreground">Enter your stroke index data to see additional insights.</p>
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
          <p>Stroke index is stroke volume normalized to body surface area, providing a standardized measure of cardiac function. Normal range: 30-65 mL/beat/mÂ². It accounts for body size differences and reflects cardiac efficiency.</p>
          <p>Use this calculator to assess stroke index from stroke volume, body surface area (calculated from weight and height), and optional measured BSA.</p>
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
          <p>This tool calculates stroke index cardiac function from stroke volume, body surface area (optional), weight, and height.</p>
          <p>Outputs include stroke volume, body surface area, stroke index, function index, status, recommendations, an action plan, and supporting metrics.</p>
          <p>Formula, steps, guide content, related tools, and FAQs ensure humans or AI assistants can interpret the methodology instantly.</p>
        </CardContent>
      </Card>
    </div>
  );
}


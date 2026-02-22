'use client';

import { useState } from 'react';
import Script from 'next/script';
import Link from 'next/link';
import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import { z } from 'zod';
import { Droplet, Zap, Target, Activity, Shield } from 'lucide-react';

import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Form, FormControl, FormField, FormItem, FormLabel, FormMessage } from '@/components/ui/form';
import { Input } from '@/components/ui/input';

const formSchema = z.object({
  hemoglobinLevel: z.number({ invalid_type_error: 'Enter hemoglobin level' }).min(5).max(20).optional(),
  age: z.number({ invalid_type_error: 'Enter age' }).min(1).max(100),
  gender: z.enum(['male', 'female'], { invalid_type_error: 'Select gender' }),
  ironIntake: z.number({ invalid_type_error: 'Enter iron intake' }).min(0).max(50),
});

type FormValues = z.infer<typeof formSchema>;

type ResultPayload = {
  hemoglobinLevel: number;
  hemoglobinPercentage: number;
  hemoglobinStatus: number;
  status: 'optimal' | 'good' | 'moderate' | 'low';
  interpretation: string;
  recommendations: string[];
  plan: { label: string; detail: string }[];
};

const steps = [
  'Enter hemoglobin level if measured (g/dL) from blood test.',
  'Enter your age (hemoglobin ranges vary by age).',
  'Select gender (hemoglobin ranges differ for males and females).',
  'Enter daily iron intake (mg) from diet and supplements.',
  'Review hemoglobin level, status, and recommendations.',
];

const faqs = [
  {
    question: 'What is hemoglobin?',
    answer:
      'Hemoglobin is a protein in red blood cells that carries oxygen from the lungs to tissues and returns carbon dioxide from tissues to the lungs. It is essential for oxygen transport.',
  },
  {
    question: 'What are normal hemoglobin levels?',
    answer:
      'Normal ranges vary by age and gender. Adult males: 13.5-17.5 g/dL, adult females: 12.0-15.5 g/dL. Children and older adults may have different ranges.',
  },
  {
    question: 'What causes low hemoglobin?',
    answer:
      'Low hemoglobin (anemia) can result from iron deficiency, blood loss, chronic disease, nutritional deficiencies, or bone marrow problems. Iron deficiency is the most common cause.',
  },
  {
    question: 'What are symptoms of low hemoglobin?',
    answer:
      'Symptoms include fatigue, weakness, shortness of breath, dizziness, pale skin, cold hands and feet, and rapid heartbeat. Severe anemia requires medical attention.',
  },
  {
    question: 'How can I increase hemoglobin?',
    answer:
      'Increase iron intake through diet (red meat, leafy greens, beans, fortified cereals) or supplements, ensure adequate vitamin B12 and folate, and address underlying causes.',
  },
  {
    question: 'Does iron intake affect hemoglobin?',
    answer:
      'Yes. Iron is essential for hemoglobin production. Inadequate iron intake can lead to iron deficiency anemia and low hemoglobin levels. Recommended daily intake: 8-18 mg for adults.',
  },
  {
    question: 'What about high hemoglobin?',
    answer:
      'High hemoglobin (polycythemia) can result from dehydration, lung disease, high altitude, or blood disorders. It may increase risk of blood clots and requires medical evaluation.',
  },
  {
    question: 'Can I track hemoglobin at home?',
    answer:
      'Home hemoglobin tests are available but less accurate than lab tests. Regular blood tests through healthcare providers are recommended for accurate monitoring.',
  },
  {
    question: 'Does age affect hemoglobin?',
    answer:
      'Yes. Hemoglobin levels vary by age. Infants and children have different ranges than adults. Older adults may have slightly lower normal ranges.',
  },
  {
    question: 'What is the relationship with red blood cells?',
    answer:
      'Hemoglobin is contained within red blood cells. Low red blood cell count (anemia) typically corresponds with low hemoglobin. Both are important for oxygen transport.',
  },
];

const relatedCalculators = [
  {
    name: 'Red Blood Cell Count to Oxygen Capacity Calculator',
    slug: 'red-blood-cell-count-to-oxygen-capacity-calculator',
    description: 'Calculate oxygen capacity alongside hemoglobin.',
  },
  {
    name: 'Iron Intake Calculator',
    slug: 'protein-intake-calculator',
    description: 'Track iron intake that affects hemoglobin.',
  },
  {
    name: 'Platelet Count Risk Analyzer',
    slug: 'platelet-count-risk-analyzer',
    description: 'Assess blood health comprehensively.',
  },
];

const baseUrl = 'https://mycalculating.com/health-fitness/hemoglobin-hb-level-estimator';

const schemaMarkup = {
  '@context': 'https://schema.org',
  '@graph': [
    {
      '@type': 'BreadcrumbList',
      itemListElement: [
        { '@type': 'ListItem', position: 1, name: 'Home', item: 'https://mycalculating.com' },
        { '@type': 'ListItem', position: 2, name: 'Health & Fitness', item: 'https://mycalculating.com/health-fitness' },
        { '@type': 'ListItem', position: 3, name: 'Hemoglobin (Hb) Level Wellness Estimator', item: baseUrl },
      ],
    },
    {
      '@type': 'SoftwareApplication',
      name: 'Hemoglobin (Hb) Level Wellness Estimator',
      applicationCategory: 'Calculator',
      operatingSystem: 'Web Browser',
      description: 'Estimate hemoglobin level from hemoglobin level, age, gender, and iron intake.',
      url: baseUrl,
      offers: { '@type': 'Offer', price: '0', priceCurrency: 'USD' },
    },
  ],
};

const clamp = (value: number, min: number, max: number) => Math.min(max, Math.max(min, value));

const calculateResult = (values: FormValues): ResultPayload => {
  let hemoglobinLevel: number;
  
  if (values.hemoglobinLevel) {
    // Use provided hemoglobin level
    hemoglobinLevel = values.hemoglobinLevel;
  } else {
    // Estimate based on age, gender, and iron intake
    let baselineHb: number;
    if (values.gender === 'male') {
      baselineHb = 15.0; // Average for adult males
    } else {
      baselineHb = 13.5; // Average for adult females
    }
    
    // Adjust for age
    if (values.age < 18) {
      baselineHb -= 1.0; // Lower for children/adolescents
    } else if (values.age > 65) {
      baselineHb -= 0.5; // Slightly lower for older adults
    }
    
    // Adjust for iron intake (recommended: 8-18 mg for adults)
    const ironAdjustment = (values.ironIntake - 12) / 10; // -1.2 to +3.8
    hemoglobinLevel = clamp(baselineHb + (ironAdjustment * 1.5), 8, 18);
  }
  
  // Determine normal range based on age and gender
  let minNormal: number;
  let maxNormal: number;
  if (values.gender === 'male') {
    minNormal = 13.5;
    maxNormal = 17.5;
  } else {
    minNormal = 12.0;
    maxNormal = 15.5;
  }
  
  if (values.age < 18) {
    minNormal -= 1.0;
    maxNormal -= 1.0;
  } else if (values.age > 65) {
    minNormal -= 0.5;
    maxNormal -= 0.5;
  }
  
  const hemoglobinPercentage = ((hemoglobinLevel - minNormal) / (maxNormal - minNormal)) * 100;
  const hemoglobinStatus = clamp(hemoglobinPercentage, 0, 100);

  let status: ResultPayload['status'] = 'optimal';
  let interpretation = 'This suggests a general lifestyle tendency where your hemoglobin level may appear optimal. You may consider continuing to maintain adequate iron intake and healthy lifestyle.';

  if (hemoglobinLevel < minNormal - 2) {
    status = 'low';
    interpretation = 'This suggests a general lifestyle tendency where your hemoglobin level may appear low. You may consider focusing on increasing iron intake and seeking professional guidance if needed. This is a personal insight, not a medical evaluation.';
  } else if (hemoglobinLevel < minNormal) {
    status = 'moderate';
    interpretation = 'This suggests a general lifestyle tendency where your hemoglobin level may be slightly below typical ranges. You may consider increasing iron intake and monitoring for improvement.';
  } else if (hemoglobinLevel < minNormal + 1) {
    status = 'good';
    interpretation = 'This suggests a general lifestyle tendency where your hemoglobin level may be good. You may consider continuing to maintain adequate iron intake.';
  } else if (hemoglobinLevel > maxNormal + 1) {
    status = 'moderate';
    interpretation = 'This suggests a general lifestyle tendency where your hemoglobin level may be elevated. You may consider seeking professional guidance if needed. This is a personal insight, not a medical evaluation.';
  }

  const recommendations = [
    'Ensure adequate iron intake through diet (red meat, leafy greens, beans, fortified cereals) or supplements as needed.',
    'Include vitamin C-rich foods with iron sources to enhance iron absorption (citrus fruits, bell peppers, tomatoes).',
    'Avoid consuming calcium-rich foods or tea/coffee with iron-rich meals, as they can inhibit iron absorption.',
  ];
  if (status === 'low' || status === 'moderate') {
    recommendations.push('You may consider seeking professional guidance if hemoglobin patterns remain low despite dietary changes. This is a personal insight, not a medical evaluation.');
  }
  if (values.ironIntake < 8) {
    recommendations.push('Increase daily iron intake. Recommended: 8-18 mg for adults, higher for menstruating women (18 mg) and pregnant women (27 mg).');
  }

  const plan = [
    { label: 'This Week', detail: 'Assess current hemoglobin level if available from recent blood test. Track daily iron intake from diet and supplements.' },
    { label: 'This Month', detail: 'Implement iron-rich diet changes and consider iron supplements if recommended by healthcare provider. Monitor for symptom improvement.' },
    { label: 'Ongoing', detail: 'Maintain adequate iron intake. If hemoglobin remains low, consult healthcare provider for comprehensive evaluation and treatment.' },
  ];

  return { hemoglobinLevel, hemoglobinPercentage, hemoglobinStatus, status, interpretation, recommendations, plan };
};

export default function HemoglobinHbLevelEstimator() {
  const [result, setResult] = useState<ResultPayload | null>(null);

  const form = useForm<FormValues>({
    resolver: zodResolver(formSchema),
    defaultValues: {
      hemoglobinLevel: undefined,
      age: undefined,
      gender: undefined,
      ironIntake: undefined,
    },
  });

  return (
    <div className="space-y-8">
      <Script id="hemoglobin-schema" type="application/ld+json" strategy="afterInteractive" dangerouslySetInnerHTML={{ __html: JSON.stringify(schemaMarkup) }} />

      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <Droplet className="h-5 w-5" />
            Hemoglobin (Hb) Level Wellness Estimator
          </CardTitle>
          <CardDescription>Estimate hemoglobin level from hemoglobin level, age, gender, and iron intake.</CardDescription>
        </CardHeader>
      </Card>

      <Card>
        <CardHeader>
          <CardTitle>Input your hemoglobin data</CardTitle>
        </CardHeader>
        <CardContent>
          <Form {...form}>
            <form onSubmit={form.handleSubmit((values) => setResult(calculateResult(values)))} className="space-y-6">
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <FormField
                  control={form.control}
                  name="hemoglobinLevel"
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel>Hemoglobin level (g/dL) (optional)</FormLabel>
                      <FormControl>
                        <Input type="number" step="0.1" placeholder="e.g., 14.5" value={field.value ?? ''} onChange={(e) => field.onChange(e.target.value === '' ? undefined : Number(e.target.value))} />
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
                <FormField
                  control={form.control}
                  name="gender"
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel>Gender</FormLabel>
                      <FormControl>
                        <select
                          value={field.value ?? ''}
                          onChange={(e) => field.onChange(e.target.value as 'male' | 'female')}
                          className="flex h-10 w-full rounded-md border border-input bg-background px-3 py-2 text-sm ring-offset-background file:border-0 file:bg-transparent file:text-sm file:font-medium placeholder:text-muted-foreground focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2 disabled:cursor-not-allowed disabled:opacity-50"
                        >
                          <option value="">Select gender</option>
                          <option value="male">Male</option>
                          <option value="female">Female</option>
                        </select>
                      </FormControl>
                      <FormMessage />
                    </FormItem>
                  )}
                />
                <FormField
                  control={form.control}
                  name="ironIntake"
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel>Daily iron intake (mg)</FormLabel>
                      <FormControl>
                        <Input type="number" step="0.1" placeholder="e.g., 15" value={field.value ?? ''} onChange={(e) => field.onChange(e.target.value === '' ? undefined : Number(e.target.value))} />
                      </FormControl>
                      <FormMessage />
                    </FormItem>
                  )}
                />
              </div>
              <Button type="submit" className="w-full md:w-auto">
                Estimate hemoglobin level
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
            <CardDescription>See hemoglobin level, status, and recommendations.</CardDescription>
          </CardHeader>
          <CardContent className="space-y-6">
            <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
              <div className="p-4 border rounded">
                <p className="text-sm text-muted-foreground">Hemoglobin level</p>
                <p className="text-2xl font-semibold text-primary">{result.hemoglobinLevel.toFixed(1)} g/dL</p>
                <p className="text-xs text-muted-foreground">Estimated/measured</p>
              </div>
              <div className="p-4 border rounded">
                <p className="text-sm text-muted-foreground">Hemoglobin percentage</p>
                <p className="text-2xl font-semibold text-primary">{result.hemoglobinPercentage.toFixed(1)}%</p>
                <p className="text-xs text-muted-foreground">Of normal range</p>
              </div>
              <div className="p-4 border rounded">
                <p className="text-sm text-muted-foreground">Hemoglobin status</p>
                <p className="text-2xl font-semibold text-primary">{result.hemoglobinStatus.toFixed(0)}</p>
                <p className="text-xs text-muted-foreground">Out of 100</p>
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
            <strong>Hemoglobin level</strong> = measured value (g/dL) or estimated from age, gender, and iron intake.
          </p>
          <p>
            <strong>If level not provided</strong>: Estimated based on gender (males ~15.0 g/dL, females ~13.5 g/dL), age adjustments, and iron intake impact.
          </p>
          <p>
            <strong>Normal ranges</strong>: Adult males: 13.5-17.5 g/dL, adult females: 12.0-15.5 g/dL. Ranges vary by age and individual factors.
          </p>
          <p>Hemoglobin is affected by iron intake, blood loss, chronic disease, nutritional status, and genetic factors.</p>
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
                <p className="text-sm text-muted-foreground">Normal range (gender-based)</p>
                <p className="text-xl font-semibold text-primary">
                  {(() => {
                    const gender = form.getValues().gender;
                    const age = form.getValues().age ?? 30;
                    let min = gender === 'male' ? 13.5 : 12.0;
                    let max = gender === 'male' ? 17.5 : 15.5;
                    if (age < 18) {
                      min -= 1.0;
                      max -= 1.0;
                    } else if (age > 65) {
                      min -= 0.5;
                      max -= 0.5;
                    }
                    return `${min.toFixed(1)}-${max.toFixed(1)} g/dL`;
                  })()}
                </p>
                <p className="text-xs text-muted-foreground">Recommended range</p>
              </div>
              <div className="p-4 border rounded">
                <p className="text-sm text-muted-foreground">Level vs normal</p>
                <p className="text-xl font-semibold text-primary">
                  {(() => {
                    const gender = form.getValues().gender;
                    const age = form.getValues().age ?? 30;
                    let min = gender === 'male' ? 13.5 : 12.0;
                    if (age < 18) {
                      min -= 1.0;
                    } else if (age > 65) {
                      min -= 0.5;
                    }
                    const diff = result.hemoglobinLevel - min;
                    return diff >= 0 ? `+${diff.toFixed(1)} g/dL` : `${diff.toFixed(1)} g/dL`;
                  })()}
                </p>
                <p className="text-xs text-muted-foreground">Difference from minimum</p>
              </div>
              <div className="p-4 border rounded">
                <p className="text-sm text-muted-foreground">Iron intake status</p>
                <p className="text-xl font-semibold text-primary">
                  {(() => {
                    const iron = form.getValues().ironIntake ?? 0;
                    if (iron < 8) return 'Low';
                    if (iron < 15) return 'Adequate';
                    return 'Good';
                  })()}
                </p>
                <p className="text-xs text-muted-foreground">Based on intake</p>
              </div>
            </div>
          ) : (
            <p className="text-sm text-muted-foreground">Enter your hemoglobin data to see additional insights.</p>
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
          <p>Hemoglobin is a protein in red blood cells that carries oxygen throughout the body. Normal ranges vary by age and gender: adult males typically 13.5-17.5 g/dL, adult females 12.0-15.5 g/dL.</p>
          <p>Use this calculator to estimate hemoglobin level from measured value (if available), age, gender, and iron intake.</p>
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
          <p>This tool provides general wellness insights about hemoglobin level from hemoglobin level (optional), age, gender, and iron intake. This is a personal lifestyle insight, not a medical evaluation.</p>
          <p>Outputs include hemoglobin level, hemoglobin percentage, hemoglobin status, status, recommendations, an action plan, and supporting metrics.</p>
          <p>Formula, steps, guide content, related tools, and FAQs ensure humans or AI assistants can interpret the methodology instantly.</p>
        </CardContent>
      </Card>

      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <Shield className="h-5 w-5" />
            Disclaimer
          </CardTitle>
        </CardHeader>
        <CardContent className="text-sm text-muted-foreground">
          <p>Disclaimer: This tool provides general wellness and lifestyle insights for educational purposes only. It is not a medical or psychological diagnosis. For any health concerns, please consult a qualified professional.</p>
        </CardContent>
      </Card>
    </div>
  );
}


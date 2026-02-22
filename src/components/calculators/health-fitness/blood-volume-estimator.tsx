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
  weight: z.number({ invalid_type_error: 'Enter weight' }).min(30).max(300),
  height: z.number({ invalid_type_error: 'Enter height' }).min(100).max(250),
  gender: z.enum(['male', 'female'], { invalid_type_error: 'Select gender' }),
  bloodVolume: z.number({ invalid_type_error: 'Enter blood volume' }).min(2).max(10).optional(),
});

type FormValues = z.infer<typeof formSchema>;

type ResultPayload = {
  weight: number;
  height: number;
  bloodVolume: number;
  bloodVolumePercentage: number;
  bloodVolumeIndex: number;
  status: 'optimal' | 'good' | 'moderate' | 'low';
  interpretation: string;
  recommendations: string[];
  plan: { label: string; detail: string }[];
};

const steps = [
  'Enter weight (kg) for blood volume estimation.',
  'Enter height (cm) for body surface area calculation.',
  'Select gender (blood volume formulas differ for males and females).',
  'Optionally enter blood volume if measured (L).',
  'Review estimated blood volume, percentage, and recommendations.',
];

const faqs = [
  {
    question: 'What is blood volume?',
    answer:
      'Blood volume is the total volume of blood in the circulatory system. It includes plasma and blood cells. Normal blood volume is approximately 7-8% of body weight, or about 5-6 liters for adults.',
  },
  {
    question: 'How is blood volume estimated?',
    answer:
      'Blood volume can be estimated using formulas based on weight, height, and gender. Common formulas: Males: 75 mL/kg, Females: 65 mL/kg. More accurate: Nadler formula using weight, height, and gender.',
  },
  {
    question: 'What are normal blood volume values?',
    answer:
      'Normal blood volume: Males approximately 75 mL/kg (5-6 L for 70 kg male), Females approximately 65 mL/kg (4-5 L for 65 kg female). Values vary with body size, fitness, and individual factors.',
  },
  {
    question: 'What causes low blood volume?',
    answer:
      'Low blood volume (hypovolemia) can result from dehydration, blood loss, burns, severe diarrhea, or other conditions causing fluid loss. It can lead to shock and requires medical attention.',
  },
  {
    question: 'What causes high blood volume?',
    answer:
      'High blood volume (hypervolemia) can result from heart failure, kidney disease, excessive fluid intake, or conditions causing fluid retention. It can cause edema and other complications.',
  },
  {
    question: 'Does gender affect blood volume?',
    answer:
      'Yes. Men typically have higher blood volume per body weight (75 mL/kg) than women (65 mL/kg) due to differences in body composition, muscle mass, and hormonal factors.',
  },
  {
    question: 'Does body size affect blood volume?',
    answer:
      'Yes. Blood volume is proportional to body size. Larger individuals have more blood volume. Formulas account for weight and height to estimate blood volume accurately.',
  },
  {
    question: 'Can I measure blood volume at home?',
    answer:
      'Home measurement is limited. Blood volume is typically measured in clinical settings using specialized techniques (dye dilution, radiolabeled tracers). Estimation formulas provide reasonable approximations.',
  },
  {
    question: 'What about blood donation?',
    answer:
      'Blood donation removes approximately 450-500 mL of blood (about 10% of total volume). The body typically replaces this within 24-48 hours. Regular donors should maintain adequate hydration and iron levels.',
  },
  {
    question: 'When should I consult a healthcare provider?',
    answer:
      'Consult a healthcare provider if you have symptoms of low blood volume (dizziness, rapid heart rate, low blood pressure) or high blood volume (swelling, shortness of breath), or if you have concerns about blood volume.',
  },
];

const relatedCalculators = [
  {
    name: 'Cardiac Output (Q) Calculator',
    slug: 'cardiac-output-q-calculator',
    description: 'Calculate cardiac output alongside blood volume.',
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

const baseUrl = 'https://mycalculating.com/health-fitness/blood-volume-estimator';

const schemaMarkup = {
  '@context': 'https://schema.org',
  '@graph': [
    {
      '@type': 'BreadcrumbList',
      itemListElement: [
        { '@type': 'ListItem', position: 1, name: 'Home', item: 'https://mycalculating.com' },
        { '@type': 'ListItem', position: 2, name: 'Health & Fitness', item: 'https://mycalculating.com/health-fitness' },
        { '@type': 'ListItem', position: 3, name: 'Blood Volume Estimator', item: baseUrl },
      ],
    },
    {
      '@type': 'SoftwareApplication',
      name: 'Blood Volume Estimator',
      applicationCategory: 'Calculator',
      operatingSystem: 'Web Browser',
      description: 'Estimate blood volume from weight, height, gender, and blood volume.',
      url: baseUrl,
      offers: { '@type': 'Offer', price: '0', priceCurrency: 'USD' },
    },
  ],
};

const clamp = (value: number, min: number, max: number) => Math.min(max, Math.max(min, value));

const calculateResult = (values: FormValues): ResultPayload => {
  const weight = values.weight;
  const height = values.height;
  
  let bloodVolume: number;
  
  if (values.bloodVolume) {
    // Use provided blood volume
    bloodVolume = values.bloodVolume;
  } else {
    // Nadler formula for blood volume estimation
    // BV (L) = (0.3669 Ã— HÂ³) + (0.03219 Ã— W) + 0.6041 for males
    // BV (L) = (0.3561 Ã— HÂ³) + (0.03308 Ã— W) + 0.1833 for females
    // Where H = height in meters, W = weight in kg
    const heightM = height / 100;
    const heightM3 = heightM * heightM * heightM;
    
    if (values.gender === 'male') {
      bloodVolume = (0.3669 * heightM3) + (0.03219 * weight) + 0.6041;
    } else {
      bloodVolume = (0.3561 * heightM3) + (0.03308 * weight) + 0.1833;
    }
  }
  
  // Normal blood volume: Males ~75 mL/kg, Females ~65 mL/kg
  const normalPerKg = values.gender === 'male' ? 75 : 65;
  const expectedVolume = (weight * normalPerKg) / 1000; // Convert to liters
  
  const bloodVolumePercentage = (bloodVolume / expectedVolume) * 100;
  const bloodVolumeIndex = clamp(bloodVolumePercentage, 0, 150);

  let status: ResultPayload['status'] = 'optimal';
  let interpretation = 'Your estimated blood volume appears normal. Continue maintaining healthy hydration and blood health.';

  if (bloodVolume < expectedVolume * 0.7 || bloodVolumeIndex < 70) {
    status = 'low';
    interpretation = 'Your estimated blood volume is low. This may indicate dehydration, blood loss, or other conditions. Consult a healthcare provider for evaluation.';
  } else if (bloodVolume < expectedVolume * 0.85 || bloodVolumeIndex < 85) {
    status = 'moderate';
    interpretation = 'Your estimated blood volume is slightly below normal. Ensure adequate hydration and monitor for symptoms.';
  } else if (bloodVolume > expectedVolume * 1.2 || bloodVolumeIndex > 120) {
    status = 'moderate';
    interpretation = 'Your estimated blood volume is elevated. This may be normal variation or indicate fluid retention. Consult healthcare provider if concerns persist.';
  } else if (bloodVolumeIndex < 95) {
    status = 'good';
    interpretation = 'Your estimated blood volume is good. Continue maintaining healthy hydration and blood health.';
  }

  const recommendations = [
    'Maintain adequate hydration to support normal blood volume. Drink water regularly throughout the day, especially during exercise or in hot weather.',
    'Monitor for signs of low blood volume: dizziness, rapid heart rate, low blood pressure, or fatigue. Seek medical attention if symptoms occur.',
    'Maintain healthy blood health through adequate nutrition, especially iron and other nutrients essential for blood cell production.',
  ];
  if (status === 'low' || status === 'moderate') {
    recommendations.push('Consult a healthcare provider for evaluation if blood volume is significantly abnormal or if you have symptoms of hypovolemia or hypervolemia.');
  }
  if (bloodVolume < expectedVolume * 0.85) {
    recommendations.push('Address low blood volume promptly. Ensure adequate fluid intake and seek medical attention if dehydration or blood loss is suspected.');
  }

  const plan = [
    { label: 'This Week', detail: 'Review estimated blood volume based on weight, height, and gender. Assess current hydration status and any symptoms.' },
    { label: 'This Month', detail: 'Implement hydration improvements: maintain adequate fluid intake, monitor for signs of dehydration or fluid retention.' },
    { label: 'Ongoing', detail: 'Monitor blood volume and hydration status. Address any persistent abnormalities with medical guidance and appropriate treatment.' },
  ];

  return { weight, height, bloodVolume, bloodVolumePercentage, bloodVolumeIndex, status, interpretation, recommendations, plan };
};

export default function BloodVolumeEstimator() {
  const [result, setResult] = useState<ResultPayload | null>(null);

  const form = useForm<FormValues>({
    resolver: zodResolver(formSchema),
    defaultValues: {
      weight: undefined,
      height: undefined,
      gender: undefined,
      bloodVolume: undefined,
    },
  });

  return (
    <div className="space-y-8">
      <Script id="blood-volume-schema" type="application/ld+json" strategy="afterInteractive" dangerouslySetInnerHTML={{ __html: JSON.stringify(schemaMarkup) }} />

      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <Droplet className="h-5 w-5" />
            Blood Volume Estimator
          </CardTitle>
          <CardDescription>Estimate blood volume from weight, height, gender, and blood volume.</CardDescription>
        </CardHeader>
      </Card>

      <Card>
        <CardHeader>
          <CardTitle>Input your blood volume data</CardTitle>
        </CardHeader>
        <CardContent>
          <Form {...form}>
            <form onSubmit={form.handleSubmit((values) => setResult(calculateResult(values)))} className="space-y-6">
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
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
                  name="bloodVolume"
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel>Blood volume (L) (optional)</FormLabel>
                      <FormControl>
                        <Input type="number" step="0.1" placeholder="e.g., 5.0" value={field.value ?? ''} onChange={(e) => field.onChange(e.target.value === '' ? undefined : Number(e.target.value))} />
                      </FormControl>
                      <FormMessage />
                    </FormItem>
                  )}
                />
              </div>
              <Button type="submit" className="w-full md:w-auto">
                Estimate blood volume
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
            <CardDescription>See estimated blood volume, percentage, and recommendations.</CardDescription>
          </CardHeader>
          <CardContent className="space-y-6">
            <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
              <div className="p-4 border rounded">
                <p className="text-sm text-muted-foreground">Blood volume</p>
                <p className="text-2xl font-semibold text-primary">{result.bloodVolume.toFixed(2)}</p>
                <p className="text-xs text-muted-foreground">Liters</p>
              </div>
              <div className="p-4 border rounded">
                <p className="text-sm text-muted-foreground">Blood volume %</p>
                <p className="text-2xl font-semibold text-primary">{result.bloodVolumePercentage.toFixed(1)}%</p>
                <p className="text-xs text-muted-foreground">Of expected</p>
              </div>
              <div className="p-4 border rounded">
                <p className="text-sm text-muted-foreground">Volume index</p>
                <p className="text-2xl font-semibold text-primary">{result.bloodVolumeIndex.toFixed(0)}</p>
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
            <strong>Nadler formula (males)</strong>: BV (L) = (0.3669 Ã— HÂ³) + (0.03219 Ã— W) + 0.6041.
          </p>
          <p>
            <strong>Nadler formula (females)</strong>: BV (L) = (0.3561 Ã— HÂ³) + (0.03308 Ã— W) + 0.1833.
          </p>
          <p>
            <strong>Where</strong>: H = height in meters, W = weight in kg.
          </p>
          <p>
            <strong>Normal ranges</strong>: Males ~75 mL/kg (5-6 L for 70 kg), Females ~65 mL/kg (4-5 L for 65 kg). Values vary with body size and individual factors.
          </p>
          <p>Blood volume is affected by body size, gender, hydration status, fitness level, and other factors affecting fluid balance.</p>
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
                <p className="text-sm text-muted-foreground">Expected volume (gender-based)</p>
                <p className="text-xl font-semibold text-primary">
                  {(() => {
                    const normalPerKg = form.getValues().gender === 'male' ? 75 : 65;
                    const expected = (result.weight * normalPerKg) / 1000;
                    return `${expected.toFixed(2)} L`;
                  })()}
                </p>
                <p className="text-xs text-muted-foreground">Based on weight</p>
              </div>
              <div className="p-4 border rounded">
                <p className="text-sm text-muted-foreground">Volume vs expected</p>
                <p className="text-xl font-semibold text-primary">
                  {(() => {
                    const normalPerKg = form.getValues().gender === 'male' ? 75 : 65;
                    const expected = (result.weight * normalPerKg) / 1000;
                    const diff = result.bloodVolume - expected;
                    return diff >= 0 ? `+${diff.toFixed(2)} L` : `${diff.toFixed(2)} L`;
                  })()}
                </p>
                <p className="text-xs text-muted-foreground">Difference</p>
              </div>
              <div className="p-4 border rounded">
                <p className="text-sm text-muted-foreground">Volume per kg</p>
                <p className="text-xl font-semibold text-primary">
                  {((result.bloodVolume * 1000) / result.weight).toFixed(1)} mL/kg
                </p>
                <p className="text-xs text-muted-foreground">Per body weight</p>
              </div>
            </div>
          ) : (
            <p className="text-sm text-muted-foreground">Enter your blood volume data to see additional insights.</p>
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
          <p>Blood volume is the total volume of blood in the circulatory system. Normal blood volume is approximately 7-8% of body weight: Males ~75 mL/kg (5-6 L), Females ~65 mL/kg (4-5 L).</p>
          <p>Use this calculator to estimate blood volume from weight, height, gender, and blood volume (optional) using the Nadler formula.</p>
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
          <p>This tool estimates blood volume from weight, height, gender, and blood volume (optional).</p>
          <p>Outputs include blood volume, blood volume percentage, blood volume index, status, recommendations, an action plan, and supporting metrics.</p>
          <p>Formula, steps, guide content, related tools, and FAQs ensure humans or AI assistants can interpret the methodology instantly.</p>
        </CardContent>
      </Card>
    </div>
  );
}


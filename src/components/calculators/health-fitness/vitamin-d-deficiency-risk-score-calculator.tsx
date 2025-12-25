'use client';

import { useState } from 'react';
import Script from 'next/script';
import Link from 'next/link';
import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import { z } from 'zod';
import { Sun, Zap, Target, Activity, Shield } from 'lucide-react';

import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Form, FormControl, FormField, FormItem, FormLabel, FormMessage } from '@/components/ui/form';
import { Input } from '@/components/ui/input';

const formSchema = z.object({
  vitaminDLevel: z.number({ invalid_type_error: 'Enter vitamin D level' }).min(5).max(150).optional(),
  sunExposure: z.number({ invalid_type_error: 'Enter sun exposure' }).min(0).max(10),
  dietaryIntake: z.number({ invalid_type_error: 'Enter dietary intake' }).min(0).max(50),
  age: z.number({ invalid_type_error: 'Enter age' }).min(1).max(100),
});

type FormValues = z.infer<typeof formSchema>;

type ResultPayload = {
  vitaminDLevel: number;
  riskScore: number;
  riskPercentage: number;
  deficiencyStatus: number;
  status: 'optimal' | 'good' | 'moderate' | 'low';
  interpretation: string;
  recommendations: string[];
  plan: { label: string; detail: string }[];
};

const steps = [
  'Enter vitamin D level if measured (ng/mL) from blood test.',
  'Rate sun exposure (0 = none, 10 = extensive daily exposure).',
  'Enter daily dietary vitamin D intake (IU) from food and supplements.',
  'Enter your age (vitamin D needs can vary by age).',
  'Review vitamin D deficiency risk score, status, and recommendations.',
];

const faqs = [
  {
    question: 'What is vitamin D?',
    answer:
      'Vitamin D is a fat-soluble vitamin essential for bone health, immune function, and calcium absorption. It can be obtained from sun exposure, diet, and supplements.',
  },
  {
    question: 'What are normal vitamin D levels?',
    answer:
      'Normal vitamin D (25-hydroxyvitamin D) levels: 30-100 ng/mL. Levels below 20 ng/mL indicate deficiency, 20-30 ng/mL indicate insufficiency. Optimal levels are typically 40-60 ng/mL.',
  },
  {
    question: 'What causes vitamin D deficiency?',
    answer:
      'Causes include limited sun exposure, dark skin, living at high latitudes, older age, obesity, malabsorption, inadequate dietary intake, and certain medications.',
  },
  {
    question: 'What are symptoms of vitamin D deficiency?',
    answer:
      'Symptoms include fatigue, bone pain, muscle weakness, mood changes, frequent infections, and in severe cases, rickets (children) or osteomalacia (adults).',
  },
  {
    question: 'How much vitamin D do I need?',
    answer:
      'Recommended daily intake: 600-800 IU for adults, up to 2000-4000 IU for deficiency treatment. Higher needs for older adults, dark-skinned individuals, and those with limited sun exposure.',
  },
  {
    question: 'How can I increase vitamin D?',
    answer:
      'Increase sun exposure (10-30 minutes daily), consume vitamin D-rich foods (fatty fish, fortified dairy, egg yolks), and take supplements as recommended by healthcare provider.',
  },
  {
    question: 'Does sun exposure affect vitamin D?',
    answer:
      'Yes. Sun exposure is the primary source of vitamin D. UVB rays convert skin cholesterol to vitamin D. Factors like latitude, season, time of day, and skin color affect production.',
  },
  {
    question: 'What about supplements?',
    answer:
      'Vitamin D supplements (D2 or D3) are effective for deficiency treatment. D3 (cholecalciferol) is generally preferred. Dosage should be determined by healthcare provider based on blood levels.',
  },
  {
    question: 'Can I track vitamin D at home?',
    answer:
      'Home vitamin D tests are available but less accurate than lab tests. Blood tests through healthcare providers (25-hydroxyvitamin D) provide accurate assessment. Regular monitoring is important.',
  },
  {
    question: 'When should I consult a healthcare provider?',
    answer:
      'Consult a healthcare provider if vitamin D is low, if you have symptoms of deficiency, if you have risk factors (limited sun exposure, dark skin, older age), or if you need supplementation guidance.',
  },
];

const relatedCalculators = [
  {
    name: 'Hemoglobin (Hb) Level Estimator',
    slug: 'hemoglobin-hb-level-estimator',
    description: 'Monitor nutritional health components.',
  },
  {
    name: 'Iron Deficiency Anemia Risk Calculator',
    slug: 'iron-deficiency-anemia-risk-calculator',
    description: 'Assess nutritional deficiencies together.',
  },
  {
    name: 'Calcium Intake Calculator',
    slug: 'electrolyte-replacement-calculator',
    description: 'Track calcium that works with vitamin D.',
  },
  {
    name: 'Iron Intake Calculator',
    slug: 'protein-intake-calculator',
    description: 'Monitor complete nutritional profile.',
  },
];

const baseUrl = 'https://mycalculating.com/category/health-fitness/vitamin-d-deficiency-risk-score-calculator';

const schemaMarkup = {
  '@context': 'https://schema.org',
  '@graph': [
    {
      '@type': 'BreadcrumbList',
      itemListElement: [
        { '@type': 'ListItem', position: 1, name: 'Home', item: 'https://mycalculating.com' },
        { '@type': 'ListItem', position: 2, name: 'Health & Fitness', item: 'https://mycalculating.com/category/health-fitness' },
        { '@type': 'ListItem', position: 3, name: 'Vitamin D Deficiency Risk Score Calculator', item: baseUrl },
      ],
    },
    {
      '@type': 'SoftwareApplication',
      name: 'Vitamin D Deficiency Risk Score Calculator',
      applicationCategory: 'Calculator',
      operatingSystem: 'Web Browser',
      description: 'Calculate vitamin D deficiency risk score from vitamin D level, sun exposure, dietary intake, and age.',
      url: baseUrl,
      offers: { '@type': 'Offer', price: '0', priceCurrency: 'USD' },
    },
  ],
};

const clamp = (value: number, min: number, max: number) => Math.min(max, Math.max(min, value));

const calculateResult = (values: FormValues): ResultPayload => {
  let vitaminDLevel: number;
  
  if (values.vitaminDLevel) {
    // Use provided level
    vitaminDLevel = values.vitaminDLevel;
  } else {
    // Estimate based on sun exposure and dietary intake
    // Baseline: 30 ng/mL
    let baseline = 30;
    
    // Sun exposure impact (0-10 scale, each point adds ~3 ng/mL)
    const sunImpact = values.sunExposure * 3;
    
    // Dietary intake impact (600 IU = ~15 ng/mL, so each 100 IU ≈ 2.5 ng/mL)
    const dietaryImpact = (values.dietaryIntake / 100) * 2.5;
    
    // Age adjustment (older adults may have lower levels)
    const ageAdjustment = values.age > 65 ? -5 : 0;
    
    vitaminDLevel = clamp(baseline + sunImpact + dietaryImpact + ageAdjustment, 5, 100);
  }
  
  // Calculate risk score (0-100, higher = lower risk)
  let riskScore = 50;
  
  // Vitamin D level component (0-60 points)
  if (vitaminDLevel >= 40 && vitaminDLevel <= 60) {
    riskScore += 50; // Optimal range
  } else if (vitaminDLevel >= 30 && vitaminDLevel < 40) {
    riskScore += 30; // Normal range
  } else if (vitaminDLevel >= 20 && vitaminDLevel < 30) {
    riskScore += 10; // Insufficient
  } else if (vitaminDLevel < 20) {
    riskScore -= 30; // Deficient
  } else if (vitaminDLevel > 60 && vitaminDLevel <= 100) {
    riskScore += 20; // High but safe
  } else if (vitaminDLevel > 100) {
    riskScore -= 20; // Potentially toxic
  }
  
  // Sun exposure component (0-20 points)
  if (values.sunExposure >= 7) {
    riskScore += 15; // Good exposure
  } else if (values.sunExposure >= 4) {
    riskScore += 5; // Moderate exposure
  } else {
    riskScore -= 10; // Low exposure
  }
  
  // Dietary intake component (0-20 points)
  const recommendedIntake = 600; // IU per day
  if (values.dietaryIntake >= recommendedIntake) {
    riskScore += 15; // Adequate intake
  } else if (values.dietaryIntake >= recommendedIntake * 0.5) {
    riskScore += 5; // Moderate intake
  } else {
    riskScore -= 10; // Low intake
  }
  
  riskScore = clamp(riskScore, 0, 100);
  const riskPercentage = 100 - riskScore; // Invert for risk percentage
  const deficiencyStatus = clamp(riskPercentage, 0, 100);

  let status: ResultPayload['status'] = 'optimal';
  let interpretation = 'Your vitamin D deficiency risk appears low. Continue maintaining adequate sun exposure and dietary intake.';

  if (vitaminDLevel < 20 || riskScore < 30) {
    status = 'low';
    interpretation = 'Your vitamin D deficiency risk is high. Vitamin D level is low and/or intake/exposure is inadequate. Consult a healthcare provider for evaluation and supplementation.';
  } else if (vitaminDLevel < 30 || riskScore < 50) {
    status = 'moderate';
    interpretation = 'Your vitamin D deficiency risk is moderate. Vitamin D level may be insufficient. Increase sun exposure and dietary intake, consider supplements.';
  } else if (riskScore < 70) {
    status = 'good';
    interpretation = 'Your vitamin D deficiency risk is low. Continue maintaining adequate sun exposure and dietary intake.';
  }

  const recommendations = [
    'Increase sun exposure: aim for 10-30 minutes of midday sun exposure several times per week (face, arms, legs) without sunscreen to boost vitamin D production.',
    'Include vitamin D-rich foods in your diet: fatty fish (salmon, mackerel), fortified dairy products, egg yolks, and fortified cereals.',
    'Consider vitamin D supplements if sun exposure and dietary intake are insufficient. D3 (cholecalciferol) is generally preferred. Consult healthcare provider for dosage.',
  ];
  if (status === 'low' || status === 'moderate') {
    recommendations.push('Consult a healthcare provider for vitamin D blood test and appropriate supplementation if deficiency is confirmed or suspected.');
  }
  if (vitaminDLevel < 20) {
    recommendations.push('Address vitamin D deficiency promptly. Severe deficiency can cause bone problems, muscle weakness, and increased infection risk.');
  }
  if (values.sunExposure < 3) {
    recommendations.push('Increase sun exposure or consider supplements, especially if you have limited outdoor time, live at high latitude, or have dark skin.');
  }

  const plan = [
    { label: 'This Week', detail: 'Review vitamin D level if available from blood test. Assess current sun exposure and dietary intake. Calculate deficiency risk.' },
    { label: 'This Month', detail: 'Implement lifestyle changes: increase sun exposure, add vitamin D-rich foods, and consider supplements as recommended by healthcare provider.' },
    { label: 'Ongoing', detail: 'Monitor vitamin D levels regularly through healthcare provider. Maintain adequate sun exposure and dietary intake to prevent deficiency.' },
  ];

  return { vitaminDLevel, riskScore, riskPercentage, deficiencyStatus, status, interpretation, recommendations, plan };
};

export default function VitaminDDeficiencyRiskScoreCalculator() {
  const [result, setResult] = useState<ResultPayload | null>(null);

  const form = useForm<FormValues>({
    resolver: zodResolver(formSchema),
    defaultValues: {
      vitaminDLevel: undefined,
      sunExposure: undefined,
      dietaryIntake: undefined,
      age: undefined,
    },
  });

  return (
    <div className="space-y-8">
      <Script id="vitamin-d-risk-schema" type="application/ld+json" strategy="afterInteractive" dangerouslySetInnerHTML={{ __html: JSON.stringify(schemaMarkup) }} />

      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <Sun className="h-5 w-5" />
            Vitamin D Deficiency Risk Score Calculator
          </CardTitle>
          <CardDescription>Calculate vitamin D deficiency risk score from vitamin D level, sun exposure, dietary intake, and age.</CardDescription>
        </CardHeader>
      </Card>

      <Card>
        <CardHeader>
          <CardTitle>Input your vitamin D data</CardTitle>
        </CardHeader>
        <CardContent>
          <Form {...form}>
            <form onSubmit={form.handleSubmit((values) => setResult(calculateResult(values)))} className="space-y-6">
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <FormField
                  control={form.control}
                  name="vitaminDLevel"
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel>Vitamin D level (ng/mL) (optional)</FormLabel>
                      <FormControl>
                        <Input type="number" step="0.1" placeholder="e.g., 35" value={field.value ?? ''} onChange={(e) => field.onChange(e.target.value === '' ? undefined : Number(e.target.value))} />
                      </FormControl>
                      <FormMessage />
                    </FormItem>
                  )}
                />
                <FormField
                  control={form.control}
                  name="sunExposure"
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel>Sun exposure (0-10)</FormLabel>
                      <FormControl>
                        <Input type="number" step="1" placeholder="e.g., 5" value={field.value ?? ''} onChange={(e) => field.onChange(e.target.value === '' ? undefined : Number(e.target.value))} />
                      </FormControl>
                      <FormMessage />
                    </FormItem>
                  )}
                />
                <FormField
                  control={form.control}
                  name="dietaryIntake"
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel>Daily dietary intake (IU)</FormLabel>
                      <FormControl>
                        <Input type="number" step="10" placeholder="e.g., 600" value={field.value ?? ''} onChange={(e) => field.onChange(e.target.value === '' ? undefined : Number(e.target.value))} />
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
                Calculate deficiency risk
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
            <CardDescription>See vitamin D deficiency risk score, status, and recommendations.</CardDescription>
          </CardHeader>
          <CardContent className="space-y-6">
            <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
              <div className="p-4 border rounded">
                <p className="text-sm text-muted-foreground">Vitamin D level</p>
                <p className="text-2xl font-semibold text-primary">{result.vitaminDLevel.toFixed(1)}</p>
                <p className="text-xs text-muted-foreground">ng/mL</p>
              </div>
              <div className="p-4 border rounded">
                <p className="text-sm text-muted-foreground">Risk score</p>
                <p className="text-2xl font-semibold text-primary">{result.riskScore.toFixed(0)}</p>
                <p className="text-xs text-muted-foreground">Out of 100 (higher = safer)</p>
              </div>
              <div className="p-4 border rounded">
                <p className="text-sm text-muted-foreground">Risk percentage</p>
                <p className="text-2xl font-semibold text-primary">{result.riskPercentage.toFixed(0)}%</p>
                <p className="text-xs text-muted-foreground">Deficiency risk</p>
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
            <strong>Risk score</strong> = calculated from vitamin D level (normal: 30-100 ng/mL, optimal: 40-60 ng/mL), sun exposure (0-10 scale), and dietary intake (recommended: 600-800 IU/day).
          </p>
          <p>
            <strong>If vitamin D level not provided</strong>: Estimated from sun exposure (each point adds ~3 ng/mL), dietary intake (100 IU ≈ 2.5 ng/mL), and age adjustments.
          </p>
          <p>
            <strong>Normal ranges</strong>: 30-100 ng/mL. Levels below 20 ng/mL indicate deficiency, 20-30 ng/mL indicate insufficiency. Optimal levels are typically 40-60 ng/mL.
          </p>
          <p>Vitamin D deficiency risk is affected by blood level, sun exposure, dietary intake, age, skin color, latitude, and other factors affecting vitamin D production and absorption.</p>
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
                <p className="text-sm text-muted-foreground">Target vitamin D</p>
                <p className="text-xl font-semibold text-primary">40-60 ng/mL</p>
                <p className="text-xs text-muted-foreground">Optimal range</p>
              </div>
              <div className="p-4 border rounded">
                <p className="text-sm text-muted-foreground">Deficiency status</p>
                <p className="text-xl font-semibold text-primary">
                  {(() => {
                    if (result.vitaminDLevel < 20) return 'Deficient';
                    if (result.vitaminDLevel < 30) return 'Insufficient';
                    if (result.vitaminDLevel >= 40 && result.vitaminDLevel <= 60) return 'Optimal';
                    return 'Normal';
                  })()}
                </p>
                <p className="text-xs text-muted-foreground">Based on level</p>
              </div>
              <div className="p-4 border rounded">
                <p className="text-sm text-muted-foreground">Recommended intake</p>
                <p className="text-xl font-semibold text-primary">600-800 IU/day</p>
                <p className="text-xs text-muted-foreground">For adults</p>
              </div>
            </div>
          ) : (
            <p className="text-sm text-muted-foreground">Enter your vitamin D data to see additional insights.</p>
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
          <p>Vitamin D is essential for bone health, immune function, and calcium absorption. Normal levels: 30-100 ng/mL, optimal: 40-60 ng/mL. Deficiency (&lt;20 ng/mL) can cause bone problems, muscle weakness, and increased infection risk.</p>
          <p>Use this calculator to assess vitamin D deficiency risk from vitamin D level (optional), sun exposure, dietary intake, and age.</p>
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
          <p>This tool calculates vitamin D deficiency risk score from vitamin D level (optional), sun exposure, dietary intake, and age.</p>
          <p>Outputs include vitamin D level, risk score, risk percentage, deficiency status, status, recommendations, an action plan, and supporting metrics.</p>
          <p>Formula, steps, guide content, related tools, and FAQs ensure humans or AI assistants can interpret the methodology instantly.</p>
        </CardContent>
      </Card>
    </div>
  );
}


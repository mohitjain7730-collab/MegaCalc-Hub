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
  plateletCount: z.number({ invalid_type_error: 'Enter platelet count' }).min(50).max(1000),
  bleedingSymptoms: z.number({ invalid_type_error: 'Enter bleeding symptoms' }).min(0).max(10),
  age: z.number({ invalid_type_error: 'Enter age' }).min(1).max(100),
  recentSurgery: z.boolean().optional(),
});

type FormValues = z.infer<typeof formSchema>;

type ResultPayload = {
  plateletCount: number;
  plateletPercentage: number;
  riskScore: number;
  status: 'optimal' | 'good' | 'moderate' | 'low';
  interpretation: string;
  recommendations: string[];
  plan: { label: string; detail: string }[];
};

const steps = [
  'Enter platelet count (thousand/Î¼L) from blood test.',
  'Rate bleeding symptoms severity (0 = none, 10 = severe).',
  'Enter your age (platelet ranges can vary by age).',
  'Indicate if you have had recent surgery (affects risk assessment).',
  'Review platelet count, risk assessment, and recommendations.',
];

const faqs = [
  {
    question: 'What are platelets?',
    answer:
      'Platelets are small blood cells that help form blood clots to stop bleeding. They are essential for hemostasis and wound healing. Normal count ranges from 150,000 to 450,000 per microliter.',
  },
  {
    question: 'What are normal platelet counts?',
    answer:
      'Normal platelet count ranges from 150,000 to 450,000 platelets/Î¼L (150-450 thousand/Î¼L) for adults. Values outside this range may indicate bleeding or clotting risks.',
  },
  {
    question: 'What causes low platelet count?',
    answer:
      'Low platelet count (thrombocytopenia) can result from decreased production (bone marrow problems), increased destruction (immune disorders), or increased consumption (bleeding, clotting).',
  },
  {
    question: 'What causes high platelet count?',
    answer:
      'High platelet count (thrombocytosis) can result from reactive causes (infection, inflammation, iron deficiency) or primary causes (bone marrow disorders). It may increase clotting risk.',
  },
  {
    question: 'What are symptoms of low platelets?',
    answer:
      'Symptoms include easy bruising, prolonged bleeding, petechiae (small red spots), nosebleeds, bleeding gums, and heavy menstrual periods. Severe cases can cause dangerous bleeding.',
  },
  {
    question: 'What are risks of high platelets?',
    answer:
      'High platelet count can increase risk of blood clots, stroke, heart attack, and thrombosis. It requires medical evaluation to determine cause and appropriate management.',
  },
  {
    question: 'Does age affect platelet count?',
    answer:
      'Platelet counts can vary slightly by age. Infants may have different ranges. Older adults may have slightly lower normal ranges. Age-specific reference ranges are important.',
  },
  {
    question: 'Can I track platelet count at home?',
    answer:
      'Home platelet tests are limited. Complete blood count (CBC) through healthcare providers provides accurate platelet counts. Regular monitoring is important for health conditions.',
  },
  {
    question: 'What about medications?',
    answer:
      'Many medications can affect platelet count or function. Aspirin, blood thinners, chemotherapy, and other drugs may influence platelet levels. Consult healthcare provider about medication effects.',
  },
  {
    question: 'When should I seek medical attention?',
    answer:
      'Seek immediate medical attention if platelet count is very low (&lt;50,000/Î¼L) with bleeding symptoms, or if you experience severe bleeding, bruising, or signs of clotting problems.',
  },
];

const relatedCalculators = [
  {
    name: 'Hemoglobin (Hb) Level Estimator',
    slug: 'hemoglobin-hb-level-estimator',
    description: 'Monitor complete blood count components.',
  },
  {
    name: 'Red Blood Cell Count to Oxygen Capacity Calculator',
    slug: 'red-blood-cell-count-to-oxygen-capacity-calculator',
    description: 'Evaluate complete blood count together.',
  },
  {
    name: 'Iron Intake Calculator',
    slug: 'protein-intake-calculator',
    description: 'Track nutrition that affects blood health.',
  },
];

const baseUrl = 'https://mycalculating.com/health-fitness/platelet-count-risk-analyzer';

const schemaMarkup = {
  '@context': 'https://schema.org',
  '@graph': [
    {
      '@type': 'BreadcrumbList',
      itemListElement: [
        { '@type': 'ListItem', position: 1, name: 'Home', item: 'https://mycalculating.com' },
        { '@type': 'ListItem', position: 2, name: 'Health & Fitness', item: 'https://mycalculating.com/health-fitness' },
        { '@type': 'ListItem', position: 3, name: 'Platelet Count Risk Analyzer', item: baseUrl },
      ],
    },
    {
      '@type': 'SoftwareApplication',
      name: 'Platelet Count Risk Analyzer',
      applicationCategory: 'Calculator',
      operatingSystem: 'Web Browser',
      description: 'Analyze platelet count risk from platelet count, bleeding symptoms, age, and recent surgery.',
      url: baseUrl,
      offers: { '@type': 'Offer', price: '0', priceCurrency: 'USD' },
    },
  ],
};

const clamp = (value: number, min: number, max: number) => Math.min(max, Math.max(min, value));

const calculateResult = (values: FormValues): ResultPayload => {
  const plateletCount = values.plateletCount;
  
  // Normal range: 150-450 thousand/Î¼L
  const minNormal = 150;
  const maxNormal = 450;
  const midNormal = 300;
  
  const plateletPercentage = ((plateletCount - minNormal) / (maxNormal - minNormal)) * 100;
  
  // Calculate risk score (0-100, lower = higher risk)
  let riskScore = 50;
  
  // Platelet count component
  if (plateletCount >= minNormal && plateletCount <= maxNormal) {
    riskScore += 30; // Optimal range
  } else if (plateletCount >= 100 && plateletCount < minNormal) {
    riskScore -= 20; // Low but not critical
  } else if (plateletCount < 100) {
    riskScore -= 40; // Very low, high bleeding risk
  } else if (plateletCount > maxNormal && plateletCount <= 600) {
    riskScore -= 10; // Elevated but not critical
  } else if (plateletCount > 600) {
    riskScore -= 30; // Very high, high clotting risk
  }
  
  // Bleeding symptoms component
  riskScore -= values.bleedingSymptoms * 3; // Each point reduces score by 3
  
  // Recent surgery increases risk
  if (values.recentSurgery) {
    riskScore -= 10;
  }
  
  riskScore = clamp(riskScore, 0, 100);

  let status: ResultPayload['status'] = 'optimal';
  let interpretation = 'Your platelet count appears optimal. Continue monitoring and maintain healthy lifestyle.';

  if (plateletCount < 100 || riskScore < 30) {
    status = 'low';
    interpretation = 'Your platelet count is low or you have significant risk factors. Consult a healthcare provider immediately for evaluation and management.';
  } else if (plateletCount < minNormal || riskScore < 50) {
    status = 'moderate';
    interpretation = 'Your platelet count is below normal or you have moderate risk factors. Monitor closely and consult healthcare provider for guidance.';
  } else if (plateletCount > maxNormal && plateletCount <= 600) {
    status = 'moderate';
    interpretation = 'Your platelet count is elevated. Consult healthcare provider to determine cause and assess clotting risk.';
  } else if (plateletCount > 600) {
    status = 'low';
    interpretation = 'Your platelet count is very high. This requires immediate medical evaluation to assess clotting risk and determine appropriate management.';
  } else if (riskScore < 70) {
    status = 'good';
    interpretation = 'Your platelet count is good but monitor for any changes. Address any bleeding symptoms with healthcare provider.';
  }

  const recommendations = [
    'Avoid activities that increase bleeding risk if platelet count is low: contact sports, rough activities, and medications that affect bleeding (aspirin, NSAIDs).',
    'Monitor for signs of bleeding (bruising, petechiae, nosebleeds, prolonged bleeding) and seek immediate medical attention if symptoms worsen.',
    'Consult healthcare provider for comprehensive evaluation if platelet count is outside normal range or if you have bleeding symptoms.',
  ];
  if (status === 'low') {
    recommendations.push('Seek immediate medical attention if platelet count is very low or if you experience severe bleeding or bruising.');
  }
  if (values.bleedingSymptoms > 5) {
    recommendations.push('Address bleeding symptoms promptly. High symptom scores with low platelets require urgent medical evaluation.');
  }
  if (values.recentSurgery) {
    recommendations.push('Monitor closely after recent surgery. Platelet function is important for wound healing and preventing excessive bleeding.');
  }

  const plan = [
    { label: 'This Week', detail: 'Review blood test results for platelet count. Assess current risk level and any bleeding symptoms.' },
    { label: 'This Month', detail: 'Follow healthcare provider recommendations. Avoid activities that increase bleeding risk if platelets are low.' },
    { label: 'Ongoing', detail: 'Monitor platelet counts regularly through healthcare provider. Address any persistent abnormalities or symptoms with medical guidance.' },
  ];

  return { plateletCount, plateletPercentage, riskScore, status, interpretation, recommendations, plan };
};

export default function PlateletCountRiskAnalyzer() {
  const [result, setResult] = useState<ResultPayload | null>(null);

  const form = useForm<FormValues>({
    resolver: zodResolver(formSchema),
    defaultValues: {
      plateletCount: undefined,
      bleedingSymptoms: undefined,
      age: undefined,
      recentSurgery: undefined,
    },
  });

  return (
    <div className="space-y-8">
      <Script id="platelet-risk-schema" type="application/ld+json" strategy="afterInteractive" dangerouslySetInnerHTML={{ __html: JSON.stringify(schemaMarkup) }} />

      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <Activity className="h-5 w-5" />
            Platelet Count Risk Analyzer
          </CardTitle>
          <CardDescription>Analyze platelet count risk from platelet count, bleeding symptoms, age, and recent surgery.</CardDescription>
        </CardHeader>
      </Card>

      <Card>
        <CardHeader>
          <CardTitle>Input your platelet data</CardTitle>
        </CardHeader>
        <CardContent>
          <Form {...form}>
            <form onSubmit={form.handleSubmit((values) => setResult(calculateResult(values)))} className="space-y-6">
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <FormField
                  control={form.control}
                  name="plateletCount"
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel>Platelet count (thousand/Î¼L)</FormLabel>
                      <FormControl>
                        <Input type="number" step="1" placeholder="e.g., 250" value={field.value ?? ''} onChange={(e) => field.onChange(e.target.value === '' ? undefined : Number(e.target.value))} />
                      </FormControl>
                      <FormMessage />
                    </FormItem>
                  )}
                />
                <FormField
                  control={form.control}
                  name="bleedingSymptoms"
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel>Bleeding symptoms (0-10)</FormLabel>
                      <FormControl>
                        <Input type="number" step="1" placeholder="e.g., 2" value={field.value ?? ''} onChange={(e) => field.onChange(e.target.value === '' ? undefined : Number(e.target.value))} />
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
                  name="recentSurgery"
                  render={({ field }) => (
                    <FormItem className="flex flex-row items-start space-x-3 space-y-0">
                      <FormControl>
                        <input
                          type="checkbox"
                          checked={field.value ?? false}
                          onChange={field.onChange}
                          className="h-4 w-4 rounded border-gray-300"
                        />
                      </FormControl>
                      <div className="space-y-1 leading-none">
                        <FormLabel>Recent surgery</FormLabel>
                      </div>
                    </FormItem>
                  )}
                />
              </div>
              <Button type="submit" className="w-full md:w-auto">
                Analyze platelet risk
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
            <CardDescription>See platelet count, risk assessment, and recommendations.</CardDescription>
          </CardHeader>
          <CardContent className="space-y-6">
            <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
              <div className="p-4 border rounded">
                <p className="text-sm text-muted-foreground">Platelet count</p>
                <p className="text-2xl font-semibold text-primary">{result.plateletCount.toFixed(0)}</p>
                <p className="text-xs text-muted-foreground">Thousand/Î¼L</p>
              </div>
              <div className="p-4 border rounded">
                <p className="text-sm text-muted-foreground">Platelet percentage</p>
                <p className="text-2xl font-semibold text-primary">{result.plateletPercentage.toFixed(1)}%</p>
                <p className="text-xs text-muted-foreground">Of normal range</p>
              </div>
              <div className="p-4 border rounded">
                <p className="text-sm text-muted-foreground">Risk score</p>
                <p className="text-2xl font-semibold text-primary">{result.riskScore.toFixed(0)}</p>
                <p className="text-xs text-muted-foreground">Out of 100 (higher = safer)</p>
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
            <strong>Platelet percentage</strong> = ((platelet count - 150) / (450 - 150)) Ã— 100.
          </p>
          <p>
            <strong>Risk score</strong> = calculated from platelet count (normal range: 150-450 thousand/Î¼L), bleeding symptoms severity, and recent surgery status.
          </p>
          <p>
            <strong>Normal range</strong>: 150,000 to 450,000 platelets/Î¼L (150-450 thousand/Î¼L) for adults. Values outside this range indicate increased bleeding or clotting risk.
          </p>
          <p>Platelet count risk is affected by count level, bleeding symptoms, recent surgery, medications, and underlying health conditions.</p>
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
                <p className="text-sm text-muted-foreground">Target platelet count</p>
                <p className="text-xl font-semibold text-primary">150-450 thousand/Î¼L</p>
                <p className="text-xs text-muted-foreground">Normal range</p>
              </div>
              <div className="p-4 border rounded">
                <p className="text-sm text-muted-foreground">Count vs normal</p>
                <p className="text-xl font-semibold text-primary">
                  {(() => {
                    const min = 150;
                    const diff = result.plateletCount - min;
                    return diff >= 0 ? `+${diff.toFixed(0)}` : `${diff.toFixed(0)}`;
                  })()} thousand/Î¼L
                </p>
                <p className="text-xs text-muted-foreground">Difference from minimum</p>
              </div>
              <div className="p-4 border rounded">
                <p className="text-sm text-muted-foreground">Risk level</p>
                <p className="text-xl font-semibold text-primary">
                  {result.riskScore >= 70 ? 'Low' : result.riskScore >= 50 ? 'Moderate' : 'High'}
                </p>
                <p className="text-xs text-muted-foreground">Based on score</p>
              </div>
            </div>
          ) : (
            <p className="text-sm text-muted-foreground">Enter your platelet data to see additional insights.</p>
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
          <p>Platelets are blood cells essential for clotting and wound healing. Normal platelet count ranges from 150,000 to 450,000 per microliter. Low counts increase bleeding risk, while high counts may increase clotting risk.</p>
          <p>Use this calculator to analyze platelet count risk from platelet count, bleeding symptoms severity, age, and recent surgery status.</p>
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
          <p>This tool analyzes platelet count risk from platelet count, bleeding symptoms severity, age, and recent surgery status.</p>
          <p>Outputs include platelet count, platelet percentage, risk score, status, recommendations, an action plan, and supporting metrics.</p>
          <p>Formula, steps, guide content, related tools, and FAQs ensure humans or AI assistants can interpret the methodology instantly.</p>
        </CardContent>
      </Card>
    </div>
  );
}


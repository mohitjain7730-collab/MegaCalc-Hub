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
  age: z.number({ invalid_type_error: 'Enter age' }).min(1).max(100),
  gender: z.enum(['male', 'female'], {
    invalid_type_error: 'Select gender',
  }),
  chromiumIntake: z.number({ invalid_type_error: 'Enter chromium intake' }).min(0).max(200),
});

type FormValues = z.infer<typeof formSchema>;

type ResultPayload = {
  age: number;
  gender: string;
  chromiumIntake: number;
  dailyNeed: number;
  intakePercent: number;
  status: 'optimal' | 'good' | 'moderate' | 'low';
  interpretation: string;
  recommendations: string[];
  plan: { label: string; detail: string }[];
};

const steps = [
  'Enter your age (years) for age-specific requirements.',
  'Select gender (male or female) for gender-specific requirements.',
  'Enter daily chromium intake (mcg) from food tracking or estimate.',
  'Review daily needs estimate, intake percentage, and recommendations.',
];

const faqs = [
  {
    question: 'What is chromium?',
    answer:
      'Chromium is an essential trace mineral that enhances insulin action and is involved in carbohydrate, fat, and protein metabolism. It is required in very small amounts but may play a role in blood sugar control.',
  },
  {
    question: 'What are chromium requirements?',
    answer:
      'Adequate intake (AI): Men 19-50: 35 mcg/day, Men 51+: 30 mcg/day, Women 19-50: 25 mcg/day, Women 51+: 20 mcg/day. Requirements are based on AI rather than RDA, as requirements vary.',
  },
  {
    question: 'What are sources of chromium?',
    answer:
      'Chromium sources include whole grains, broccoli, green beans, nuts, meat, brewer\'s yeast, and some fruits. Processing can reduce chromium content in foods.',
  },
  {
    question: 'How does age affect chromium needs?',
    answer:
      'Chromium needs decrease slightly with age. Men 19-50 need 35 mcg/day, while men 51+ need 30 mcg/day. Women 19-50 need 25 mcg/day, while women 51+ need 20 mcg/day.',
  },
  {
    question: 'What about chromium deficiency?',
    answer:
      'Chromium deficiency is rare but may contribute to impaired glucose tolerance. Symptoms are not well-defined. Adequate intake from food sources typically prevents deficiency.',
  },
  {
    question: 'What about chromium supplements?',
    answer:
      'Chromium supplements are marketed for blood sugar control, but evidence is mixed. Food sources are generally preferred. Consult healthcare provider before taking chromium supplements, especially if diabetic.',
  },
  {
    question: 'How do I get enough chromium?',
    answer:
      'Get chromium from whole grains, broccoli, green beans, nuts, meat, and brewer\'s yeast. A varied diet with whole foods typically provides adequate chromium.',
  },
  {
    question: 'What about chromium and diabetes?',
    answer:
      'Chromium may enhance insulin action, but evidence for chromium supplementation in diabetes is mixed. Focus on balanced diet and work with healthcare provider for diabetes management.',
  },
  {
    question: 'Can I track chromium at home?',
    answer:
      'Yes. Use food databases to estimate chromium intake. Many tracking apps include chromium content. Focus on whole grains, vegetables, and nuts for chromium sources.',
  },
  {
    question: 'When should I consult a healthcare provider?',
    answer:
      'Consult a healthcare provider if you have diabetes, are considering chromium supplements, have blood sugar concerns, or need personalized guidance on chromium intake.',
  },
];

const relatedCalculators = [
  {
    name: 'Selenium Intake Calculator',
    slug: 'selenium-intake-calculator',
    description: 'Assess selenium alongside chromium.',
  },
  {
    name: 'Manganese Requirement Calculator',
    slug: 'manganese-requirement-calculator',
    description: 'Evaluate trace minerals comprehensively.',
  },
  {
    name: 'Copper Intake Calculator',
    slug: 'copper-intake-calculator',
    description: 'Assess copper alongside chromium.',
  },
  {
    name: 'Insulin Response Estimator',
    slug: 'insulin-response-estimator',
    description: 'Evaluate insulin response that chromium may affect.',
  },
];

const baseUrl = 'https://mycalculating.com/category/health-fitness/chromium-daily-need-estimator';

const schemaMarkup = {
  '@context': 'https://schema.org',
  '@graph': [
    {
      '@type': 'BreadcrumbList',
      itemListElement: [
        { '@type': 'ListItem', position: 1, name: 'Home', item: 'https://mycalculating.com' },
        { '@type': 'ListItem', position: 2, name: 'Health & Fitness', item: 'https://mycalculating.com/category/health-fitness' },
        { '@type': 'ListItem', position: 3, name: 'Chromium Daily Need Estimator', item: baseUrl },
      ],
    },
    {
      '@type': 'SoftwareApplication',
      name: 'Chromium Daily Need Estimator',
      applicationCategory: 'Calculator',
      operatingSystem: 'Web Browser',
      description: 'Estimate chromium daily needs from age, gender, and chromium intake.',
      url: baseUrl,
      offers: { '@type': 'Offer', price: '0', priceCurrency: 'USD' },
    },
  ],
};

const clamp = (value: number, min: number, max: number) => Math.min(max, Math.max(min, value));

const calculateResult = (values: FormValues): ResultPayload => {
  const age = values.age;
  const gender = values.gender;
  const chromiumIntake = values.chromiumIntake;
  
  // Estimate daily need based on age and gender
  let dailyNeed = 25; // Default for women 19-50
  
  if (gender === 'male') {
    if (age >= 51) {
      dailyNeed = 30; // Men 51+
    } else if (age >= 19) {
      dailyNeed = 35; // Men 19-50
    } else if (age >= 14) {
      dailyNeed = 35; // Boys 14-18
    } else if (age >= 9) {
      dailyNeed = 25; // Boys 9-13
    } else {
      dailyNeed = 15; // Boys 4-8
    }
  } else {
    // Female
    if (age >= 51) {
      dailyNeed = 20; // Women 51+
    } else if (age >= 19) {
      dailyNeed = 25; // Women 19-50
    } else if (age >= 14) {
      dailyNeed = 24; // Girls 14-18
    } else if (age >= 9) {
      dailyNeed = 21; // Girls 9-13
    } else {
      dailyNeed = 15; // Girls 4-8
    }
  }
  
  const intakePercent = dailyNeed > 0 ? (chromiumIntake / dailyNeed) * 100 : 0;
  
  let status: ResultPayload['status'] = 'optimal';
  let interpretation = 'Your chromium intake appears adequate. Continue maintaining balanced intake from diverse sources.';

  if (chromiumIntake < dailyNeed * 0.7 || intakePercent < 70) {
    status = 'low';
    interpretation = 'Your chromium intake is below recommended levels. This may increase deficiency risk. Consider increasing intake from whole grains, vegetables, and nuts to meet daily needs.';
  } else if (chromiumIntake < dailyNeed * 0.9 || intakePercent < 90) {
    status = 'moderate';
    interpretation = 'Your chromium intake is slightly below recommended levels. Aim for recommended daily intake to ensure adequate chromium status and prevent deficiency.';
  } else if (intakePercent >= 100 && intakePercent <= 200) {
    status = 'optimal';
    interpretation = 'Your chromium intake is within recommended range. Continue maintaining balanced intake from diverse sources to support optimal chromium status and insulin function.';
  } else {
    status = 'good';
    interpretation = 'Your chromium intake is good. Continue including chromium-rich foods in your diet to maintain adequate intake and support carbohydrate metabolism.';
  }

  const recommendations = [
    'Include chromium-rich foods: consume whole grains, broccoli, green beans, nuts, meat, and brewer\'s yeast to meet recommended daily intake.',
    `Aim for recommended intake: ${dailyNeed} mcg/day for your age and gender. This supports insulin action and carbohydrate metabolism.`,
    'Choose whole foods: processing can reduce chromium content. Focus on whole grains and minimally processed foods to maximize chromium intake.',
  ];
  if (status === 'low' || status === 'moderate') {
    recommendations.push('Increase chromium intake through food sources. Include whole grains, vegetables, and nuts to meet recommended levels and support insulin function.');
  }
  if (chromiumIntake < dailyNeed * 0.8) {
    recommendations.push(`Significantly increase chromium intake. Current intake is below recommended levels (${dailyNeed} mcg/day). Focus on whole grains, broccoli, and nuts.`);
  }

  const plan = [
    { label: 'This Week', detail: `Calculate chromium intake and compare to daily needs (${dailyNeed} mcg/day). Assess current intake and identify opportunities to meet recommended levels.` },
    { label: 'This Month', detail: 'Optimize chromium intake: include whole grains, vegetables, and nuts to ensure adequate intake and support insulin action and carbohydrate metabolism.' },
    { label: 'Ongoing', detail: 'Monitor chromium intake through regular food assessment. Maintain recommended intake levels to prevent deficiency and support optimal health.' },
  ];

  return { age, gender, chromiumIntake, dailyNeed, intakePercent, status, interpretation, recommendations, plan };
};

export default function ChromiumDailyNeedEstimator() {
  const [result, setResult] = useState<ResultPayload | null>(null);

  const form = useForm<FormValues>({
    resolver: zodResolver(formSchema),
    defaultValues: {
      age: undefined,
      gender: undefined,
      chromiumIntake: undefined,
    },
  });

  return (
    <div className="space-y-8">
      <Script id="chromium-needs-schema" type="application/ld+json" strategy="afterInteractive" dangerouslySetInnerHTML={{ __html: JSON.stringify(schemaMarkup) }} />

      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <Activity className="h-5 w-5" />
            Chromium Daily Need Estimator
          </CardTitle>
          <CardDescription>Estimate chromium daily needs from age, gender, and chromium intake.</CardDescription>
        </CardHeader>
      </Card>

      <Card>
        <CardHeader>
          <CardTitle>Input your chromium data</CardTitle>
        </CardHeader>
        <CardContent>
          <Form {...form}>
            <form onSubmit={form.handleSubmit((values) => setResult(calculateResult(values)))} className="space-y-6">
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
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
                          onChange={(e) => field.onChange(e.target.value as FormValues['gender'])}
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
                  name="chromiumIntake"
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel>Chromium intake (mcg)</FormLabel>
                      <FormControl>
                        <Input type="number" step="0.1" placeholder="e.g., 25" value={field.value ?? ''} onChange={(e) => field.onChange(e.target.value === '' ? undefined : Number(e.target.value))} />
                      </FormControl>
                      <FormMessage />
                    </FormItem>
                  )}
                />
              </div>
              <Button type="submit" className="w-full md:w-auto">
                Estimate daily needs
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
            <CardDescription>See daily needs estimate, intake percentage, and recommendations.</CardDescription>
          </CardHeader>
          <CardContent className="space-y-6">
            <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
              <div className="p-4 border rounded">
                <p className="text-sm text-muted-foreground">Daily need</p>
                <p className="text-2xl font-semibold text-primary">{result.dailyNeed.toFixed(0)}</p>
                <p className="text-xs text-muted-foreground">mcg/day</p>
              </div>
              <div className="p-4 border rounded">
                <p className="text-sm text-muted-foreground">Current intake</p>
                <p className="text-2xl font-semibold text-primary">{result.chromiumIntake.toFixed(1)}</p>
                <p className="text-xs text-muted-foreground">mcg/day</p>
              </div>
              <div className="p-4 border rounded">
                <p className="text-sm text-muted-foreground">Intake %</p>
                <p className="text-2xl font-semibold text-primary">{result.intakePercent.toFixed(0)}%</p>
                <p className="text-xs text-muted-foreground">Of daily need</p>
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
            <strong>Daily need</strong> = estimated from age and gender. Men 19-50: 35 mcg/day, Men 51+: 30 mcg/day, Women 19-50: 25 mcg/day, Women 51+: 20 mcg/day.
          </p>
          <p>
            <strong>Intake percentage</strong> = (chromium intake / daily need) × 100. Values ≥100% indicate adequate intake relative to recommendations.
          </p>
          <p>
            <strong>Recommended intake</strong>: Requirements are based on adequate intake (AI) rather than RDA, as requirements vary. Chromium needs decrease slightly with age.
          </p>
          <p>Chromium is an essential trace mineral that enhances insulin action. Adequate intake supports carbohydrate metabolism and blood sugar control. Deficiency is rare with varied diets.</p>
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
                <p className="text-sm text-muted-foreground">Deficit/Surplus</p>
                <p className="text-xl font-semibold text-primary">
                  {result.chromiumIntake >= result.dailyNeed ? '+' : ''}{(result.chromiumIntake - result.dailyNeed).toFixed(1)} mcg
                </p>
                <p className="text-xs text-muted-foreground">Difference from need</p>
              </div>
              <div className="p-4 border rounded">
                <p className="text-sm text-muted-foreground">Intake status</p>
                <p className="text-xl font-semibold text-primary">
                  {result.intakePercent >= 100 ? 'Adequate' : result.intakePercent >= 80 ? 'Near adequate' : result.intakePercent >= 60 ? 'Moderate' : 'Low'}
                </p>
                <p className="text-xs text-muted-foreground">Based on percentage</p>
              </div>
              <div className="p-4 border rounded">
                <p className="text-sm text-muted-foreground">Target intake</p>
                <p className="text-xl font-semibold text-primary">{result.dailyNeed.toFixed(0)} mcg</p>
                <p className="text-xs text-muted-foreground">Recommended daily</p>
              </div>
            </div>
          ) : (
            <p className="text-sm text-muted-foreground">Enter your chromium data to see additional insights.</p>
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
          <p>Chromium is an essential trace mineral that enhances insulin action and is involved in carbohydrate metabolism. Recommended intake: Men 19-50: 35 mcg/day, Men 51+: 30 mcg/day, Women 19-50: 25 mcg/day, Women 51+: 20 mcg/day.</p>
          <p>Use this calculator to estimate chromium daily needs from age, gender, and chromium intake.</p>
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
          <p>This tool estimates chromium daily needs from age, gender, and chromium intake.</p>
          <p>Outputs include age, gender, chromium intake, daily need, intake percentage, status, recommendations, an action plan, and supporting metrics.</p>
          <p>Formula, steps, guide content, related tools, and FAQs ensure humans or AI assistants can interpret the methodology instantly.</p>
        </CardContent>
      </Card>
    </div>
  );
}


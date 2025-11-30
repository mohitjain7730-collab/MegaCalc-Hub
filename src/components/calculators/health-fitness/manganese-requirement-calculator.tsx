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
  manganeseIntake: z.number({ invalid_type_error: 'Enter manganese intake' }).min(0).max(20),
});

type FormValues = z.infer<typeof formSchema>;

type ResultPayload = {
  age: number;
  gender: string;
  manganeseIntake: number;
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
  'Enter daily manganese intake (mg) from food tracking or estimate.',
  'Review daily needs, intake percentage, and recommendations.',
];

const faqs = [
  {
    question: 'What is manganese?',
    answer:
      'Manganese is an essential trace mineral that functions as a cofactor for enzymes involved in metabolism, bone formation, and antioxidant function. It is required in small amounts but is important for health.',
  },
  {
    question: 'What are manganese requirements?',
    answer:
      'Adequate intake (AI): Men 19+: 2.3 mg/day, Women 19+: 1.8 mg/day. Requirements are based on AI rather than RDA, as requirements vary. Upper limit: 11 mg/day for adults.',
  },
  {
    question: 'What are sources of manganese?',
    answer:
      'Manganese sources include whole grains, nuts, seeds, legumes, leafy vegetables, tea, and some fruits. Plant-based foods are generally good sources of manganese.',
  },
  {
    question: 'How does age affect manganese needs?',
    answer:
      'Manganese requirements are relatively stable across adulthood. Men need slightly more (2.3 mg/day) than women (1.8 mg/day). Children and adolescents have lower requirements.',
  },
  {
    question: 'What about manganese deficiency?',
    answer:
      'Manganese deficiency is rare in healthy individuals with varied diets. Symptoms may include impaired growth, skeletal abnormalities, and reproductive issues. Adequate intake from food typically prevents deficiency.',
  },
  {
    question: 'What about manganese toxicity?',
    answer:
      'Excessive manganese intake (upper limit: 11 mg/day) is rare from food but can occur from supplements or contaminated water. Symptoms include neurological issues. Upper limits should not be exceeded.',
  },
  {
    question: 'How do I get enough manganese?',
    answer:
      'Get manganese from whole grains, nuts, seeds, legumes, leafy vegetables, and tea. A varied diet with plant-based foods typically provides adequate manganese.',
  },
  {
    question: 'What about manganese absorption?',
    answer:
      'Manganese absorption is regulated by the body. High iron intake can reduce manganese absorption. Adequate intake from food sources typically ensures sufficient manganese status.',
  },
  {
    question: 'Can I track manganese at home?',
    answer:
      'Yes. Use food databases to estimate manganese intake. Many tracking apps include manganese content. Focus on whole grains, nuts, seeds, and legumes for manganese sources.',
  },
  {
    question: 'When should I consult a healthcare provider?',
    answer:
      'Consult a healthcare provider if you have manganese deficiency concerns, are considering manganese supplements, have neurological symptoms, or need personalized guidance on manganese intake.',
  },
];

const relatedCalculators = [
  {
    name: 'Selenium Intake Calculator',
    slug: 'selenium-intake-calculator',
    description: 'Assess selenium alongside manganese.',
  },
  {
    name: 'Copper Intake Calculator',
    slug: 'copper-intake-calculator',
    description: 'Evaluate trace minerals comprehensively.',
  },
  {
    name: 'Chromium Daily Need Estimator',
    slug: 'chromium-daily-need-estimator',
    description: 'Assess chromium alongside manganese.',
  },
  {
    name: 'Nutrient Density to Calorie Ratio Calculator',
    slug: 'nutrient-density-to-calorie-ratio-calculator',
    description: 'Assess nutritional quality comprehensively.',
  },
];

const baseUrl = 'https://mycalculating.com/category/health-fitness/manganese-requirement-calculator';

const schemaMarkup = {
  '@context': 'https://schema.org',
  '@graph': [
    {
      '@type': 'BreadcrumbList',
      itemListElement: [
        { '@type': 'ListItem', position: 1, name: 'Home', item: 'https://mycalculating.com' },
        { '@type': 'ListItem', position: 2, name: 'Health & Fitness', item: 'https://mycalculating.com/category/health-fitness' },
        { '@type': 'ListItem', position: 3, name: 'Manganese Requirement Calculator', item: baseUrl },
      ],
    },
    {
      '@type': 'SoftwareApplication',
      name: 'Manganese Requirement Calculator',
      applicationCategory: 'Calculator',
      operatingSystem: 'Web Browser',
      description: 'Calculate manganese requirements from age, gender, and manganese intake.',
      url: baseUrl,
      offers: { '@type': 'Offer', price: '0', priceCurrency: 'USD' },
    },
  ],
};

const clamp = (value: number, min: number, max: number) => Math.min(max, Math.max(min, value));

const calculateResult = (values: FormValues): ResultPayload => {
  const age = values.age;
  const gender = values.gender;
  const manganeseIntake = values.manganeseIntake;
  
  // Estimate daily need based on age and gender
  let dailyNeed = 1.8; // Default for women
  
  if (gender === 'male') {
    if (age >= 19) {
      dailyNeed = 2.3; // Men 19+
    } else if (age >= 14) {
      dailyNeed = 2.2; // Boys 14-18
    } else if (age >= 9) {
      dailyNeed = 1.9; // Boys 9-13
    } else {
      dailyNeed = 1.5; // Boys 4-8
    }
  } else {
    // Female
    if (age >= 19) {
      dailyNeed = 1.8; // Women 19+
    } else if (age >= 14) {
      dailyNeed = 1.6; // Girls 14-18
    } else if (age >= 9) {
      dailyNeed = 1.6; // Girls 9-13
    } else {
      dailyNeed = 1.2; // Girls 4-8
    }
  }
  
  const intakePercent = dailyNeed > 0 ? (manganeseIntake / dailyNeed) * 100 : 0;
  
  let status: ResultPayload['status'] = 'optimal';
  let interpretation = 'Your manganese intake appears adequate. Continue maintaining balanced intake from diverse sources.';

  if (manganeseIntake < dailyNeed * 0.7 || intakePercent < 70) {
    status = 'low';
    interpretation = 'Your manganese intake is below recommended levels. This may increase deficiency risk. Consider increasing intake from whole grains, nuts, seeds, and legumes to meet daily needs.';
  } else if (manganeseIntake < dailyNeed * 0.9 || intakePercent < 90) {
    status = 'moderate';
    interpretation = 'Your manganese intake is slightly below recommended levels. Aim for recommended daily intake to ensure adequate manganese status and prevent deficiency.';
  } else if (manganeseIntake > 11) {
    status = 'low';
    interpretation = 'Your manganese intake exceeds the upper limit (11 mg/day). Excessive intake can cause toxicity. Reduce intake, especially if from supplements.';
  } else if (intakePercent >= 100 && intakePercent <= 200) {
    status = 'optimal';
    interpretation = 'Your manganese intake is within recommended range. Continue maintaining balanced intake from diverse sources to support optimal manganese status.';
  } else {
    status = 'good';
    interpretation = 'Your manganese intake is good. Continue including manganese-rich foods in your diet to maintain adequate intake and support metabolism and bone health.';
  }

  const recommendations = [
    'Include manganese-rich foods: consume whole grains, nuts, seeds, legumes, leafy vegetables, and tea to meet recommended daily intake.',
    `Aim for recommended intake: ${dailyNeed.toFixed(1)} mg/day for your age and gender. This supports metabolism, bone formation, and antioxidant function.`,
    'Maintain diverse sources: variety in manganese sources helps ensure adequate intake and prevents both deficiency and excess, supporting optimal manganese status.',
  ];
  if (status === 'low' && manganeseIntake < dailyNeed * 0.9) {
    recommendations.push('Increase manganese intake through food sources. Include whole grains, nuts, seeds, and legumes to meet recommended levels and support health.');
  }
  if (manganeseIntake > 11) {
    recommendations.push('Reduce manganese intake. Excessive intake (upper limit: 11 mg/day) can cause toxicity. If from supplements, consult healthcare provider. Food sources are generally safer.');
  }
  if (manganeseIntake < dailyNeed * 0.8) {
    recommendations.push(`Significantly increase manganese intake. Current intake is below recommended levels (${dailyNeed.toFixed(1)} mg/day). Focus on whole grains, nuts, and seeds.`);
  }

  const plan = [
    { label: 'This Week', detail: `Calculate manganese intake and compare to daily needs (${dailyNeed.toFixed(1)} mg/day). Assess current intake and identify opportunities to meet recommended levels.` },
    { label: 'This Month', detail: 'Optimize manganese intake: include whole grains, nuts, seeds, and legumes to ensure adequate intake while avoiding excess.' },
    { label: 'Ongoing', detail: 'Monitor manganese intake through regular food assessment. Maintain recommended intake levels to prevent deficiency and support optimal health.' },
  ];

  return { age, gender, manganeseIntake, dailyNeed, intakePercent, status, interpretation, recommendations, plan };
};

export default function ManganeseRequirementCalculator() {
  const [result, setResult] = useState<ResultPayload | null>(null);

  const form = useForm<FormValues>({
    resolver: zodResolver(formSchema),
    defaultValues: {
      age: undefined,
      gender: undefined,
      manganeseIntake: undefined,
    },
  });

  return (
    <div className="space-y-8">
      <Script id="manganese-requirement-schema" type="application/ld+json" strategy="afterInteractive" dangerouslySetInnerHTML={{ __html: JSON.stringify(schemaMarkup) }} />

      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <Activity className="h-5 w-5" />
            Manganese Requirement Calculator
          </CardTitle>
          <CardDescription>Calculate manganese requirements from age, gender, and manganese intake.</CardDescription>
        </CardHeader>
      </Card>

      <Card>
        <CardHeader>
          <CardTitle>Input your manganese data</CardTitle>
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
                  name="manganeseIntake"
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel>Manganese intake (mg)</FormLabel>
                      <FormControl>
                        <Input type="number" step="0.1" placeholder="e.g., 2.0" value={field.value ?? ''} onChange={(e) => field.onChange(e.target.value === '' ? undefined : Number(e.target.value))} />
                      </FormControl>
                      <FormMessage />
                    </FormItem>
                  )}
                />
              </div>
              <Button type="submit" className="w-full md:w-auto">
                Calculate requirements
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
            <CardDescription>See daily needs, intake percentage, and recommendations.</CardDescription>
          </CardHeader>
          <CardContent className="space-y-6">
            <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
              <div className="p-4 border rounded">
                <p className="text-sm text-muted-foreground">Daily need</p>
                <p className="text-2xl font-semibold text-primary">{result.dailyNeed.toFixed(1)}</p>
                <p className="text-xs text-muted-foreground">mg/day</p>
              </div>
              <div className="p-4 border rounded">
                <p className="text-sm text-muted-foreground">Current intake</p>
                <p className="text-2xl font-semibold text-primary">{result.manganeseIntake.toFixed(1)}</p>
                <p className="text-xs text-muted-foreground">mg/day</p>
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
            <strong>Daily need</strong> = estimated from age and gender. Men 19+: 2.3 mg/day, Women 19+: 1.8 mg/day. Requirements are based on adequate intake (AI).
          </p>
          <p>
            <strong>Intake percentage</strong> = (manganese intake / daily need) × 100. Values ≥100% indicate adequate intake relative to recommendations.
          </p>
          <p>
            <strong>Recommended intake</strong>: Men 19+: 2.3 mg/day, Women 19+: 1.8 mg/day. Upper limit: 11 mg/day for adults.
          </p>
          <p>Manganese is an essential trace mineral required in small amounts. Adequate intake supports metabolism, bone formation, and antioxidant function. Both deficiency and excess should be avoided.</p>
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
                  {result.manganeseIntake >= result.dailyNeed ? '+' : ''}{(result.manganeseIntake - result.dailyNeed).toFixed(1)} mg
                </p>
                <p className="text-xs text-muted-foreground">Difference from need</p>
              </div>
              <div className="p-4 border rounded">
                <p className="text-sm text-muted-foreground">Upper limit</p>
                <p className="text-xl font-semibold text-primary">11 mg</p>
                <p className="text-xs text-muted-foreground">Maximum safe intake</p>
              </div>
              <div className="p-4 border rounded">
                <p className="text-sm text-muted-foreground">Intake status</p>
                <p className="text-xl font-semibold text-primary">
                  {result.intakePercent >= 100 && result.manganeseIntake <= 11 ? 'Adequate' : result.intakePercent < 80 ? 'Low' : result.manganeseIntake > 11 ? 'Excessive' : 'Good'}
                </p>
                <p className="text-xs text-muted-foreground">Based on intake</p>
              </div>
            </div>
          ) : (
            <p className="text-sm text-muted-foreground">Enter your manganese data to see additional insights.</p>
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
          <p>Manganese is an essential trace mineral that functions as a cofactor for enzymes involved in metabolism, bone formation, and antioxidant function. Recommended intake: Men 19+: 2.3 mg/day, Women 19+: 1.8 mg/day. Upper limit: 11 mg/day.</p>
          <p>Use this calculator to calculate manganese requirements from age, gender, and manganese intake.</p>
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
          <p>This tool calculates manganese requirements from age, gender, and manganese intake.</p>
          <p>Outputs include age, gender, manganese intake, daily need, intake percentage, status, recommendations, an action plan, and supporting metrics.</p>
          <p>Formula, steps, guide content, related tools, and FAQs ensure humans or AI assistants can interpret the methodology instantly.</p>
        </CardContent>
      </Card>
    </div>
  );
}


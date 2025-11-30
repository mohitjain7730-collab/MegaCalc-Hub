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
  phosphorusIntake: z.number({ invalid_type_error: 'Enter phosphorus intake' }).min(0).max(5000),
  age: z.number({ invalid_type_error: 'Enter age' }).min(1).max(100),
  gender: z.enum(['male', 'female'], {
    invalid_type_error: 'Select gender',
  }),
});

type FormValues = z.infer<typeof formSchema>;

type ResultPayload = {
  phosphorusIntake: number;
  age: number;
  gender: string;
  dailyNeed: number;
  intakePercent: number;
  status: 'optimal' | 'good' | 'moderate' | 'low';
  interpretation: string;
  recommendations: string[];
  plan: { label: string; detail: string }[];
};

const steps = [
  'Enter daily phosphorus intake (mg) from food tracking or estimate.',
  'Enter your age (years) for age-specific requirements.',
  'Select gender (male or female) for gender-specific requirements.',
  'Review daily needs, intake percentage, and recommendations.',
];

const faqs = [
  {
    question: 'What is phosphorus?',
    answer:
      'Phosphorus is an essential mineral that is a major component of bones and teeth, and is involved in energy production, DNA/RNA synthesis, and acid-base balance. It is the second most abundant mineral in the body after calcium.',
  },
  {
    question: 'What are phosphorus requirements?',
    answer:
      'Recommended daily intake: Adults: 700 mg/day. Requirements are the same for men and women. Children and adolescents have lower requirements. Upper limit: 4000 mg/day for adults 19-70, 3000 mg/day for adults 71+.',
  },
  {
    question: 'What are sources of phosphorus?',
    answer:
      'Phosphorus sources include dairy products, meat, fish, poultry, eggs, nuts, seeds, legumes, whole grains, and processed foods (phosphates are common additives). Most foods contain some phosphorus.',
  },
  {
    question: 'How does age affect phosphorus needs?',
    answer:
      'Phosphorus requirements are relatively stable across adulthood (700 mg/day). Children and adolescents have lower requirements. Requirements don\'t change significantly with age in adults.',
  },
  {
    question: 'What about phosphorus deficiency?',
    answer:
      'Phosphorus deficiency is rare in healthy individuals with varied diets. Symptoms may include bone weakness, loss of appetite, and fatigue. Adequate intake from food typically prevents deficiency.',
  },
  {
    question: 'What about phosphorus toxicity?',
    answer:
      'Excessive phosphorus intake (upper limit: 4000 mg/day) is rare from food alone but can occur from supplements. High phosphorus relative to calcium may affect bone health. Upper limits should not be exceeded.',
  },
  {
    question: 'How do I get enough phosphorus?',
    answer:
      'Get phosphorus from dairy products, meat, fish, poultry, eggs, nuts, seeds, legumes, and whole grains. A varied diet typically provides adequate phosphorus.',
  },
  {
    question: 'What about phosphorus and calcium?',
    answer:
      'Phosphorus and calcium work together in bone health. The ideal calcium-to-phosphorus ratio is about 1:1 to 2:1. Very high phosphorus relative to calcium may affect bone health.',
  },
  {
    question: 'Can I track phosphorus at home?',
    answer:
      'Yes. Use food databases to estimate phosphorus intake. Many tracking apps include phosphorus content. Most foods contain phosphorus, so varied diets typically meet requirements.',
  },
  {
    question: 'When should I consult a healthcare provider?',
    answer:
      'Consult a healthcare provider if you have kidney disease (phosphorus restriction may be needed), bone health concerns, are considering phosphorus supplements, or need personalized guidance on phosphorus intake.',
  },
];

const relatedCalculators = [
  {
    name: 'Calcium Intake Calculator',
    slug: 'calcium-intake-calculator',
    description: 'Assess calcium alongside phosphorus for bone health.',
  },
  {
    name: 'Selenium Intake Calculator',
    slug: 'selenium-intake-calculator',
    description: 'Evaluate minerals comprehensively.',
  },
  {
    name: 'Manganese Requirement Calculator',
    slug: 'manganese-requirement-calculator',
    description: 'Assess manganese alongside phosphorus.',
  },
  {
    name: 'Nutrient Density to Calorie Ratio Calculator',
    slug: 'nutrient-density-to-calorie-ratio-calculator',
    description: 'Assess nutritional quality comprehensively.',
  },
];

const baseUrl = 'https://mycalculating.com/category/health-fitness/phosphorus-intake-calculator';

const schemaMarkup = {
  '@context': 'https://schema.org',
  '@graph': [
    {
      '@type': 'BreadcrumbList',
      itemListElement: [
        { '@type': 'ListItem', position: 1, name: 'Home', item: 'https://mycalculating.com' },
        { '@type': 'ListItem', position: 2, name: 'Health & Fitness', item: 'https://mycalculating.com/category/health-fitness' },
        { '@type': 'ListItem', position: 3, name: 'Phosphorus Intake Calculator', item: baseUrl },
      ],
    },
    {
      '@type': 'SoftwareApplication',
      name: 'Phosphorus Intake Calculator',
      applicationCategory: 'Calculator',
      operatingSystem: 'Web Browser',
      description: 'Calculate phosphorus intake from phosphorus amount, age, and gender.',
      url: baseUrl,
      offers: { '@type': 'Offer', price: '0', priceCurrency: 'USD' },
    },
  ],
};

const clamp = (value: number, min: number, max: number) => Math.min(max, Math.max(min, value));

const calculateResult = (values: FormValues): ResultPayload => {
  const phosphorusIntake = values.phosphorusIntake;
  const age = values.age;
  const gender = values.gender;
  
  // Estimate daily need (adults: 700 mg/day, same for men and women)
  let dailyNeed = 700; // Adults 19+
  
  if (age < 19) {
    if (age >= 14) {
      dailyNeed = 1250; // Teens 14-18
    } else if (age >= 9) {
      dailyNeed = 1250; // Children 9-13
    } else if (age >= 4) {
      dailyNeed = 500; // Children 4-8
    } else if (age >= 1) {
      dailyNeed = 460; // Children 1-3
    } else {
      dailyNeed = 275; // Infants 7-12 months
    }
  }
  
  const intakePercent = dailyNeed > 0 ? (phosphorusIntake / dailyNeed) * 100 : 0;
  
  let status: ResultPayload['status'] = 'optimal';
  let interpretation = 'Your phosphorus intake appears adequate. Continue maintaining balanced intake from diverse sources.';

  if (phosphorusIntake < dailyNeed * 0.7 || intakePercent < 70) {
    status = 'low';
    interpretation = 'Your phosphorus intake is below recommended levels. This may increase deficiency risk. Consider increasing intake from dairy, meat, nuts, and whole grains to meet daily needs (700 mg/day for adults).';
  } else if (phosphorusIntake < dailyNeed * 0.9 || intakePercent < 90) {
    status = 'moderate';
    interpretation = 'Your phosphorus intake is slightly below recommended levels. Aim for recommended daily intake (700 mg/day for adults) to ensure adequate phosphorus status and prevent deficiency.';
  } else if (phosphorusIntake > 4000 || (age >= 71 && phosphorusIntake > 3000)) {
    status = 'low';
    interpretation = 'Your phosphorus intake exceeds the upper limit. Excessive intake can affect bone health, especially if calcium intake is low. Reduce intake, especially if from supplements.';
  } else if (intakePercent >= 100 && intakePercent <= 200) {
    status = 'optimal';
    interpretation = 'Your phosphorus intake is within recommended range. Continue maintaining balanced intake from diverse sources to support optimal bone health and metabolic function.';
  } else {
    status = 'good';
    interpretation = 'Your phosphorus intake is good. Continue including phosphorus-rich foods in your diet to maintain adequate intake and support bone health and energy production.';
  }

  const recommendations = [
    'Include phosphorus-rich foods: consume dairy products, meat, fish, poultry, eggs, nuts, seeds, legumes, and whole grains to meet recommended daily intake (700 mg/day for adults).',
    'Maintain balanced calcium intake: phosphorus and calcium work together in bone health. Aim for a calcium-to-phosphorus ratio of about 1:1 to 2:1 for optimal bone health.',
    'Avoid excessive intake: phosphorus toxicity is rare from food but can occur from supplements. Stay within recommended intake and avoid exceeding upper limits.',
  ];
  if (status === 'low' && phosphorusIntake < dailyNeed * 0.9) {
    recommendations.push('Increase phosphorus intake through food sources. Include dairy, meat, nuts, and whole grains to meet recommended levels and support bone health and energy production.');
  }
  if (phosphorusIntake > 4000 || (age >= 71 && phosphorusIntake > 3000)) {
    recommendations.push('Reduce phosphorus intake. Excessive intake (upper limit: 4000 mg/day for adults 19-70, 3000 mg/day for 71+) can affect bone health. If from supplements, reduce consumption. Consult healthcare provider if concerns persist.');
  }
  if (phosphorusIntake < dailyNeed * 0.8) {
    recommendations.push(`Significantly increase phosphorus intake. Current intake is below recommended levels (${dailyNeed} mg/day). Focus on dairy, meat, nuts, and whole grains.`);
  }

  const plan = [
    { label: 'This Week', detail: `Calculate phosphorus intake and compare to daily needs (${dailyNeed} mg/day). Assess current intake and identify opportunities to meet recommended levels.` },
    { label: 'This Month', detail: 'Optimize phosphorus intake: include dairy, meat, nuts, and whole grains to ensure adequate intake while maintaining balanced calcium intake for bone health.' },
    { label: 'Ongoing', detail: 'Monitor phosphorus intake through regular food assessment. Maintain recommended intake levels (700 mg/day for adults) to prevent deficiency and support optimal bone health.' },
  ];

  return { phosphorusIntake, age, gender, dailyNeed, intakePercent, status, interpretation, recommendations, plan };
};

export default function PhosphorusIntakeCalculator() {
  const [result, setResult] = useState<ResultPayload | null>(null);

  const form = useForm<FormValues>({
    resolver: zodResolver(formSchema),
    defaultValues: {
      phosphorusIntake: undefined,
      age: undefined,
      gender: undefined,
    },
  });

  return (
    <div className="space-y-8">
      <Script id="phosphorus-intake-schema" type="application/ld+json" strategy="afterInteractive" dangerouslySetInnerHTML={{ __html: JSON.stringify(schemaMarkup) }} />

      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <Activity className="h-5 w-5" />
            Phosphorus Intake Calculator
          </CardTitle>
          <CardDescription>Calculate phosphorus intake from phosphorus amount, age, and gender.</CardDescription>
        </CardHeader>
      </Card>

      <Card>
        <CardHeader>
          <CardTitle>Input your phosphorus data</CardTitle>
        </CardHeader>
        <CardContent>
          <Form {...form}>
            <form onSubmit={form.handleSubmit((values) => setResult(calculateResult(values)))} className="space-y-6">
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <FormField
                  control={form.control}
                  name="phosphorusIntake"
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel>Phosphorus intake (mg)</FormLabel>
                      <FormControl>
                        <Input type="number" step="1" placeholder="e.g., 700" value={field.value ?? ''} onChange={(e) => field.onChange(e.target.value === '' ? undefined : Number(e.target.value))} />
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
              </div>
              <Button type="submit" className="w-full md:w-auto">
                Calculate phosphorus intake
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
                <p className="text-2xl font-semibold text-primary">{result.dailyNeed.toFixed(0)}</p>
                <p className="text-xs text-muted-foreground">mg/day</p>
              </div>
              <div className="p-4 border rounded">
                <p className="text-sm text-muted-foreground">Current intake</p>
                <p className="text-2xl font-semibold text-primary">{result.phosphorusIntake.toFixed(0)}</p>
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
            <strong>Daily need</strong> = estimated from age. Adults 19+: 700 mg/day, same for men and women. Children and adolescents have different requirements.
          </p>
          <p>
            <strong>Intake percentage</strong> = (phosphorus intake / daily need) × 100. Values ≥100% indicate adequate intake relative to recommendations.
          </p>
          <p>
            <strong>Recommended intake</strong>: Adults: 700 mg/day. Upper limit: 4000 mg/day for adults 19-70, 3000 mg/day for adults 71+. Requirements are the same for men and women in adulthood.
          </p>
          <p>Phosphorus is an essential mineral required for bone health, energy production, and DNA/RNA synthesis. Adequate intake supports bone strength and metabolic function. Both deficiency and excess should be avoided.</p>
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
                  {result.phosphorusIntake >= result.dailyNeed ? '+' : ''}{(result.phosphorusIntake - result.dailyNeed).toFixed(0)} mg
                </p>
                <p className="text-xs text-muted-foreground">Difference from need</p>
              </div>
              <div className="p-4 border rounded">
                <p className="text-sm text-muted-foreground">Upper limit</p>
                <p className="text-xl font-semibold text-primary">
                  {result.age >= 71 ? '3000' : '4000'} mg
                </p>
                <p className="text-xs text-muted-foreground">Maximum safe intake</p>
              </div>
              <div className="p-4 border rounded">
                <p className="text-sm text-muted-foreground">Intake status</p>
                <p className="text-xl font-semibold text-primary">
                  {result.intakePercent >= 100 && result.phosphorusIntake <= (result.age >= 71 ? 3000 : 4000) ? 'Adequate' : result.intakePercent < 80 ? 'Low' : result.phosphorusIntake > (result.age >= 71 ? 3000 : 4000) ? 'Excessive' : 'Good'}
                </p>
                <p className="text-xs text-muted-foreground">Based on intake</p>
              </div>
            </div>
          ) : (
            <p className="text-sm text-muted-foreground">Enter your phosphorus data to see additional insights.</p>
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
          <p>Phosphorus is an essential mineral that is a major component of bones and teeth, and is involved in energy production and DNA/RNA synthesis. Recommended intake: 700 mg/day for adults. Upper limit: 4000 mg/day for adults 19-70, 3000 mg/day for adults 71+.</p>
          <p>Use this calculator to calculate phosphorus intake from phosphorus amount, age, and gender.</p>
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
          <p>This tool calculates phosphorus intake from phosphorus amount, age, and gender.</p>
          <p>Outputs include phosphorus intake, age, gender, daily need, intake percentage, status, recommendations, an action plan, and supporting metrics.</p>
          <p>Formula, steps, guide content, related tools, and FAQs ensure humans or AI assistants can interpret the methodology instantly.</p>
        </CardContent>
      </Card>
    </div>
  );
}


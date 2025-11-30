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
  seleniumIntake: z.number({ invalid_type_error: 'Enter selenium intake' }).min(0).max(1000),
  age: z.number({ invalid_type_error: 'Enter age' }).min(1).max(100),
  gender: z.enum(['male', 'female'], {
    invalid_type_error: 'Select gender',
  }),
});

type FormValues = z.infer<typeof formSchema>;

type ResultPayload = {
  seleniumIntake: number;
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
  'Enter daily selenium intake (mcg) from food tracking or estimate.',
  'Enter your age (years) for age-specific requirements.',
  'Select gender (male or female) for gender-specific requirements.',
  'Review daily needs, intake percentage, and recommendations.',
];

const faqs = [
  {
    question: 'What is selenium?',
    answer:
      'Selenium is an essential trace mineral that functions as an antioxidant, supports thyroid function, and plays roles in immune function and DNA synthesis. It is required in small amounts but is important for health.',
  },
  {
    question: 'What are selenium requirements?',
    answer:
      'Recommended daily intake: Adults: 55 mcg/day. Requirements are the same for men and women. Pregnant women: 60 mcg/day, Lactating: 70 mcg/day. Upper limit: 400 mcg/day for adults.',
  },
  {
    question: 'What are sources of selenium?',
    answer:
      'Selenium sources include Brazil nuts (very high), seafood (tuna, sardines, shrimp), meat, poultry, eggs, grains, and dairy. Soil selenium content affects food selenium levels.',
  },
  {
    question: 'How does age affect selenium needs?',
    answer:
      'Selenium requirements are relatively stable across adulthood (55 mcg/day). Children and adolescents have lower requirements. Requirements don\'t change significantly with age in adults.',
  },
  {
    question: 'What about selenium deficiency?',
    answer:
      'Selenium deficiency is rare in most regions but can cause muscle weakness, fatigue, and in severe cases, Keshan disease. Adequate intake from food sources typically prevents deficiency.',
  },
  {
    question: 'What about selenium toxicity?',
    answer:
      'Excessive selenium intake (upper limit: 400 mcg/day) can cause selenosis with symptoms including hair loss, nail brittleness, and gastrointestinal issues. Brazil nuts are very high in selenium and should be consumed in moderation.',
  },
  {
    question: 'How do I get enough selenium?',
    answer:
      'Get selenium from diverse sources: seafood, meat, poultry, eggs, grains, and dairy. Brazil nuts are extremely high (68-91 mcg per nut) and should be limited to 1-2 per day to avoid excess.',
  },
  {
    question: 'What about soil selenium?',
    answer:
      'Soil selenium content varies by region, affecting food selenium levels. Some regions have selenium-deficient soil, while others have adequate or high levels. Dietary variety helps ensure adequate intake.',
  },
  {
    question: 'Can I track selenium at home?',
    answer:
      'Yes. Use food databases to estimate selenium intake. Many tracking apps include selenium content. Be mindful that Brazil nuts are extremely high in selenium and should be consumed in moderation.',
  },
  {
    question: 'When should I consult a healthcare provider?',
    answer:
      'Consult a healthcare provider if you have selenium deficiency concerns, are consuming large amounts of Brazil nuts, are considering selenium supplements, or need personalized guidance on selenium intake.',
  },
];

const relatedCalculators = [
  {
    name: 'Iodine Deficiency Risk Calculator',
    slug: 'iodine-deficiency-risk-calculator',
    description: 'Assess iodine alongside selenium for thyroid health.',
  },
  {
    name: 'Manganese Requirement Calculator',
    slug: 'manganese-requirement-calculator',
    description: 'Evaluate trace minerals comprehensively.',
  },
  {
    name: 'Copper Intake Calculator',
    slug: 'copper-intake-calculator',
    description: 'Assess copper alongside selenium.',
  },
  {
    name: 'Nutrient Density to Calorie Ratio Calculator',
    slug: 'nutrient-density-to-calorie-ratio-calculator',
    description: 'Assess nutritional quality comprehensively.',
  },
];

const baseUrl = 'https://mycalculating.com/category/health-fitness/selenium-intake-calculator';

const schemaMarkup = {
  '@context': 'https://schema.org',
  '@graph': [
    {
      '@type': 'BreadcrumbList',
      itemListElement: [
        { '@type': 'ListItem', position: 1, name: 'Home', item: 'https://mycalculating.com' },
        { '@type': 'ListItem', position: 2, name: 'Health & Fitness', item: 'https://mycalculating.com/category/health-fitness' },
        { '@type': 'ListItem', position: 3, name: 'Selenium Intake Calculator', item: baseUrl },
      ],
    },
    {
      '@type': 'SoftwareApplication',
      name: 'Selenium Intake Calculator',
      applicationCategory: 'Calculator',
      operatingSystem: 'Web Browser',
      description: 'Calculate selenium intake from selenium amount, age, and gender.',
      url: baseUrl,
      offers: { '@type': 'Offer', price: '0', priceCurrency: 'USD' },
    },
  ],
};

const clamp = (value: number, min: number, max: number) => Math.min(max, Math.max(min, value));

const calculateResult = (values: FormValues): ResultPayload => {
  const seleniumIntake = values.seleniumIntake;
  const age = values.age;
  const gender = values.gender;
  
  // Estimate daily need (adults: 55 mcg/day, same for men and women)
  let dailyNeed = 55; // Adults 19+
  
  if (age < 19) {
    if (age >= 14) {
      dailyNeed = 55; // Teens 14-18
    } else if (age >= 9) {
      dailyNeed = 40; // Children 9-13
    } else if (age >= 4) {
      dailyNeed = 30; // Children 4-8
    } else {
      dailyNeed = 20; // Children 1-3
    }
  }
  
  const intakePercent = dailyNeed > 0 ? (seleniumIntake / dailyNeed) * 100 : 0;
  
  let status: ResultPayload['status'] = 'optimal';
  let interpretation = 'Your selenium intake appears adequate. Continue maintaining balanced intake from diverse sources.';

  if (seleniumIntake < dailyNeed * 0.7 || intakePercent < 70) {
    status = 'low';
    interpretation = 'Your selenium intake is below recommended levels. This may increase deficiency risk. Consider increasing intake from seafood, meat, eggs, and grains to meet daily needs (55 mcg/day for adults).';
  } else if (seleniumIntake < dailyNeed * 0.9 || intakePercent < 90) {
    status = 'moderate';
    interpretation = 'Your selenium intake is slightly below recommended levels. Aim for recommended daily intake (55 mcg/day for adults) to ensure adequate selenium status and prevent deficiency.';
  } else if (seleniumIntake > 400) {
    status = 'low';
    interpretation = 'Your selenium intake exceeds the upper limit (400 mcg/day). Excessive intake can cause selenosis. Reduce intake, especially if consuming large amounts of Brazil nuts.';
  } else if (intakePercent >= 100 && intakePercent <= 200) {
    status = 'optimal';
    interpretation = 'Your selenium intake is within recommended range. Continue maintaining balanced intake from diverse sources to support optimal selenium status and antioxidant function.';
  } else {
    status = 'good';
    interpretation = 'Your selenium intake is good. Continue including selenium-rich foods in your diet to maintain adequate intake and support thyroid function and antioxidant protection.';
  }

  const recommendations = [
    'Include selenium-rich foods: consume seafood (tuna, sardines, shrimp), meat, poultry, eggs, grains, and dairy to meet recommended daily intake (55 mcg/day for adults).',
    'Be mindful of Brazil nuts: Brazil nuts are extremely high in selenium (68-91 mcg per nut). Limit to 1-2 nuts per day to avoid exceeding the upper limit (400 mcg/day).',
    'Maintain diverse sources: variety in selenium sources helps ensure adequate intake and prevents both deficiency and excess, supporting optimal selenium status.',
  ];
  if (status === 'low' && seleniumIntake < dailyNeed * 0.9) {
    recommendations.push('Increase selenium intake through food sources. Include seafood, meat, eggs, and grains to meet recommended levels and support thyroid function and antioxidant protection.');
  }
  if (seleniumIntake > 400) {
    recommendations.push('Reduce selenium intake. Excessive intake (upper limit: 400 mcg/day) can cause selenosis. If consuming Brazil nuts, limit to 1-2 per day. Consult healthcare provider if concerns persist.');
  }
  if (seleniumIntake < dailyNeed * 0.8) {
    recommendations.push(`Significantly increase selenium intake. Current intake is below recommended levels (${dailyNeed} mcg/day). Focus on selenium-rich foods like seafood, meat, and eggs.`);
  }

  const plan = [
    { label: 'This Week', detail: `Calculate selenium intake and compare to daily needs (${dailyNeed} mcg/day). Assess current intake and identify opportunities to meet recommended levels.` },
    { label: 'This Month', detail: 'Optimize selenium intake: include seafood, meat, eggs, and grains to ensure adequate intake while avoiding excess, especially from Brazil nuts.' },
    { label: 'Ongoing', detail: 'Monitor selenium intake through regular food assessment. Maintain recommended intake levels (55 mcg/day for adults) to prevent deficiency and support optimal health.' },
  ];

  return { seleniumIntake, age, gender, dailyNeed, intakePercent, status, interpretation, recommendations, plan };
};

export default function SeleniumIntakeCalculator() {
  const [result, setResult] = useState<ResultPayload | null>(null);

  const form = useForm<FormValues>({
    resolver: zodResolver(formSchema),
    defaultValues: {
      seleniumIntake: undefined,
      age: undefined,
      gender: undefined,
    },
  });

  return (
    <div className="space-y-8">
      <Script id="selenium-intake-schema" type="application/ld+json" strategy="afterInteractive" dangerouslySetInnerHTML={{ __html: JSON.stringify(schemaMarkup) }} />

      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <Activity className="h-5 w-5" />
            Selenium Intake Calculator
          </CardTitle>
          <CardDescription>Calculate selenium intake from selenium amount, age, and gender.</CardDescription>
        </CardHeader>
      </Card>

      <Card>
        <CardHeader>
          <CardTitle>Input your selenium data</CardTitle>
        </CardHeader>
        <CardContent>
          <Form {...form}>
            <form onSubmit={form.handleSubmit((values) => setResult(calculateResult(values)))} className="space-y-6">
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <FormField
                  control={form.control}
                  name="seleniumIntake"
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel>Selenium intake (mcg)</FormLabel>
                      <FormControl>
                        <Input type="number" step="0.1" placeholder="e.g., 55" value={field.value ?? ''} onChange={(e) => field.onChange(e.target.value === '' ? undefined : Number(e.target.value))} />
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
                Calculate selenium intake
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
                <p className="text-xs text-muted-foreground">mcg/day</p>
              </div>
              <div className="p-4 border rounded">
                <p className="text-sm text-muted-foreground">Current intake</p>
                <p className="text-2xl font-semibold text-primary">{result.seleniumIntake.toFixed(1)}</p>
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
            <strong>Daily need</strong> = estimated from age. Adults 19+: 55 mcg/day (same for men and women). Children and adolescents have lower requirements.
          </p>
          <p>
            <strong>Intake percentage</strong> = (selenium intake / daily need) × 100. Values ≥100% indicate adequate intake relative to recommendations.
          </p>
          <p>
            <strong>Recommended intake</strong>: Adults: 55 mcg/day. Upper limit: 400 mcg/day. Requirements are the same for men and women in adulthood.
          </p>
          <p>Selenium is an essential trace mineral required in small amounts. Adequate intake supports thyroid function, antioxidant protection, and immune function. Both deficiency and excess should be avoided.</p>
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
                  {result.seleniumIntake >= result.dailyNeed ? '+' : ''}{(result.seleniumIntake - result.dailyNeed).toFixed(1)} mcg
                </p>
                <p className="text-xs text-muted-foreground">Difference from need</p>
              </div>
              <div className="p-4 border rounded">
                <p className="text-sm text-muted-foreground">Upper limit</p>
                <p className="text-xl font-semibold text-primary">400 mcg</p>
                <p className="text-xs text-muted-foreground">Maximum safe intake</p>
              </div>
              <div className="p-4 border rounded">
                <p className="text-sm text-muted-foreground">Intake status</p>
                <p className="text-xl font-semibold text-primary">
                  {result.intakePercent >= 100 && result.seleniumIntake <= 400 ? 'Adequate' : result.intakePercent < 80 ? 'Low' : result.seleniumIntake > 400 ? 'Excessive' : 'Good'}
                </p>
                <p className="text-xs text-muted-foreground">Based on intake</p>
              </div>
            </div>
          ) : (
            <p className="text-sm text-muted-foreground">Enter your selenium data to see additional insights.</p>
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
          <p>Selenium is an essential trace mineral that functions as an antioxidant and supports thyroid function. Recommended daily intake: 55 mcg/day for adults. Upper limit: 400 mcg/day. Sources include seafood, meat, eggs, and Brazil nuts (very high, consume in moderation).</p>
          <p>Use this calculator to calculate selenium intake from selenium amount, age, and gender.</p>
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
          <p>This tool calculates selenium intake from selenium amount, age, and gender.</p>
          <p>Outputs include selenium intake, age, gender, daily need, intake percentage, status, recommendations, an action plan, and supporting metrics.</p>
          <p>Formula, steps, guide content, related tools, and FAQs ensure humans or AI assistants can interpret the methodology instantly.</p>
        </CardContent>
      </Card>
    </div>
  );
}


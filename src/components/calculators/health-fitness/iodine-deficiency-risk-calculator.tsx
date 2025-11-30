'use client';

import { useState } from 'react';
import Script from 'next/script';
import Link from 'next/link';
import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import { z } from 'zod';
import { AlertTriangle, Zap, Target, Activity, Shield } from 'lucide-react';

import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Form, FormControl, FormField, FormItem, FormLabel, FormMessage } from '@/components/ui/form';
import { Input } from '@/components/ui/input';

const formSchema = z.object({
  iodineIntake: z.number({ invalid_type_error: 'Enter iodine intake' }).min(0).max(2000),
  age: z.number({ invalid_type_error: 'Enter age' }).min(1).max(100),
  gender: z.enum(['male', 'female'], {
    invalid_type_error: 'Select gender',
  }),
  isPregnant: z.boolean().optional(),
  isLactating: z.boolean().optional(),
});

type FormValues = z.infer<typeof formSchema>;

type ResultPayload = {
  iodineIntake: number;
  age: number;
  gender: string;
  isPregnant: boolean;
  isLactating: boolean;
  dailyNeed: number;
  intakePercent: number;
  deficiencyRisk: string;
  status: 'optimal' | 'good' | 'moderate' | 'low';
  interpretation: string;
  recommendations: string[];
  plan: { label: string; detail: string }[];
};

const steps = [
  'Enter daily iodine intake (mcg) from food tracking or estimate.',
  'Enter your age (years) for age-specific requirements.',
  'Select gender (male or female) for gender-specific requirements.',
  'Indicate if pregnant (optional) for increased requirements.',
  'Indicate if lactating (optional) for increased requirements.',
  'Review daily needs, deficiency risk, and recommendations.',
];

const faqs = [
  {
    question: 'What is iodine?',
    answer:
      'Iodine is an essential trace mineral required for thyroid hormone production, which regulates metabolism, growth, and development. Iodine deficiency is a major global health concern.',
  },
  {
    question: 'What are iodine requirements?',
    answer:
      'Recommended daily intake: Adults: 150 mcg/day, Pregnant women: 220 mcg/day, Lactating women: 290 mcg/day. Children and adolescents have lower requirements. Upper limit: 1100 mcg/day for adults.',
  },
  {
    question: 'What are sources of iodine?',
    answer:
      'Iodine sources include iodized salt, seafood (fish, seaweed), dairy products, eggs, and some grains. Iodized salt is the primary source in many regions. Seaweed is very high in iodine.',
  },
  {
    question: 'How does pregnancy affect iodine needs?',
    answer:
      'Pregnancy increases iodine requirements (220 mcg/day) to support fetal brain development and maternal thyroid function. Iodine deficiency during pregnancy can cause serious developmental issues.',
  },
  {
    question: 'What about iodine deficiency?',
    answer:
      'Iodine deficiency can cause goiter (enlarged thyroid), hypothyroidism, and in severe cases, cretinism in children. Pregnant women with deficiency risk developmental problems in their children.',
  },
  {
    question: 'What about iodine toxicity?',
    answer:
      'Excessive iodine intake (upper limit: 1100 mcg/day) can cause thyroid dysfunction. Very high intake from supplements or seaweed can be harmful. Stay within recommended ranges.',
  },
  {
    question: 'How do I get enough iodine?',
    answer:
      'Get iodine from iodized salt, seafood, dairy products, and eggs. In regions with iodized salt programs, most people meet requirements. Seaweed is very high and should be consumed in moderation.',
  },
  {
    question: 'What about iodized salt?',
    answer:
      'Iodized salt is a major source of iodine in many regions and has been effective in preventing deficiency. However, excessive salt intake should still be avoided for other health reasons.',
  },
  {
    question: 'Can I track iodine at home?',
    answer:
      'Yes. Use food databases to estimate iodine intake. Many tracking apps include iodine content. Focus on iodized salt, seafood, and dairy products for iodine sources.',
  },
  {
    question: 'When should I consult a healthcare provider?',
    answer:
      'Consult a healthcare provider if you are pregnant or planning pregnancy, have thyroid concerns, live in iodine-deficient regions, are considering iodine supplements, or need personalized guidance on iodine intake.',
  },
];

const relatedCalculators = [
  {
    name: 'Selenium Intake Calculator',
    slug: 'selenium-intake-calculator',
    description: 'Assess selenium alongside iodine for thyroid health.',
  },
  {
    name: 'Fluoride Exposure Calculator',
    slug: 'fluoride-exposure-calculator',
    description: 'Evaluate trace minerals comprehensively.',
  },
  {
    name: 'Manganese Requirement Calculator',
    slug: 'manganese-requirement-calculator',
    description: 'Assess manganese alongside iodine.',
  },
  {
    name: 'Nutrient Density to Calorie Ratio Calculator',
    slug: 'nutrient-density-to-calorie-ratio-calculator',
    description: 'Assess nutritional quality comprehensively.',
  },
];

const baseUrl = 'https://mycalculating.com/category/health-fitness/iodine-deficiency-risk-calculator';

const schemaMarkup = {
  '@context': 'https://schema.org',
  '@graph': [
    {
      '@type': 'BreadcrumbList',
      itemListElement: [
        { '@type': 'ListItem', position: 1, name: 'Home', item: 'https://mycalculating.com' },
        { '@type': 'ListItem', position: 2, name: 'Health & Fitness', item: 'https://mycalculating.com/category/health-fitness' },
        { '@type': 'ListItem', position: 3, name: 'Iodine Deficiency Risk Calculator', item: baseUrl },
      ],
    },
    {
      '@type': 'SoftwareApplication',
      name: 'Iodine Deficiency Risk Calculator',
      applicationCategory: 'Calculator',
      operatingSystem: 'Web Browser',
      description: 'Calculate iodine deficiency risk from iodine intake, age, gender, and pregnancy status.',
      url: baseUrl,
      offers: { '@type': 'Offer', price: '0', priceCurrency: 'USD' },
    },
  ],
};

const clamp = (value: number, min: number, max: number) => Math.min(max, Math.max(min, value));

const calculateResult = (values: FormValues): ResultPayload => {
  const iodineIntake = values.iodineIntake;
  const age = values.age;
  const gender = values.gender;
  const isPregnant = values.isPregnant || false;
  const isLactating = values.isLactating || false;
  
  // Estimate daily need based on age, gender, and pregnancy/lactation status
  let dailyNeed = 150; // Default for adults
  
  if (isLactating) {
    dailyNeed = 290; // Lactating women
  } else if (isPregnant) {
    dailyNeed = 220; // Pregnant women
  } else if (age < 19) {
    if (age >= 14) {
      dailyNeed = 150; // Teens 14-18
    } else if (age >= 9) {
      dailyNeed = 120; // Children 9-13
    } else if (age >= 4) {
      dailyNeed = 90; // Children 4-8
    } else if (age >= 1) {
      dailyNeed = 90; // Children 1-3
    } else {
      dailyNeed = 110; // Infants 7-12 months
    }
  } else {
    dailyNeed = 150; // Adults 19+
  }
  
  const intakePercent = dailyNeed > 0 ? (iodineIntake / dailyNeed) * 100 : 0;
  
  // Determine deficiency risk
  let deficiencyRisk = 'Low';
  if (iodineIntake < dailyNeed * 0.5 || intakePercent < 50) {
    deficiencyRisk = 'High';
  } else if (iodineIntake < dailyNeed * 0.7 || intakePercent < 70) {
    deficiencyRisk = 'Moderate';
  } else if (iodineIntake < dailyNeed * 0.9 || intakePercent < 90) {
    deficiencyRisk = 'Mild';
  }
  
  let status: ResultPayload['status'] = 'optimal';
  let interpretation = 'Your iodine intake appears adequate. This supports thyroid function and prevents deficiency.';

  if (iodineIntake < dailyNeed * 0.7 || intakePercent < 70) {
    status = 'low';
    interpretation = 'Your iodine intake is below recommended levels. This increases deficiency risk, which can cause goiter, hypothyroidism, and in pregnancy, developmental problems. Consider increasing intake from iodized salt, seafood, and dairy products.';
  } else if (iodineIntake < dailyNeed * 0.9 || intakePercent < 90) {
    status = 'moderate';
    interpretation = 'Your iodine intake is slightly below recommended levels. This may increase deficiency risk. Aim for recommended daily intake to ensure adequate iodine status and prevent deficiency.';
  } else if (iodineIntake > 1100) {
    status = 'low';
    interpretation = 'Your iodine intake exceeds the upper limit (1100 mcg/day). Excessive intake can cause thyroid dysfunction. Reduce intake, especially if from supplements or excessive seaweed consumption.';
  } else if (intakePercent >= 100 && intakePercent <= 200) {
    status = 'optimal';
    interpretation = 'Your iodine intake is within recommended range. This supports optimal thyroid function and prevents deficiency without excessive intake.';
  } else {
    status = 'good';
    interpretation = 'Your iodine intake is good. Continue including iodine-rich foods in your diet to maintain adequate intake and support thyroid health.';
  }

  const recommendations = [
    'Use iodized salt: iodized salt is a major source of iodine in many regions and effectively prevents deficiency. Use in moderation as part of a balanced diet.',
    `Aim for recommended intake: ${dailyNeed} mcg/day for your age and status. This supports thyroid function and prevents deficiency.`,
    'Include iodine-rich foods: consume seafood (fish, seaweed), dairy products, and eggs to meet iodine needs. Seaweed is very high in iodine and should be consumed in moderation.',
  ];
  if (status === 'low' && iodineIntake < dailyNeed * 0.9) {
    recommendations.push('Significantly increase iodine intake. Current intake is below recommended levels, increasing deficiency risk. Focus on iodized salt, seafood, and dairy products.');
  }
  if (isPregnant || isLactating) {
    recommendations.push('Ensure adequate iodine intake during pregnancy and lactation. Iodine is critical for fetal brain development and maternal thyroid function. Consider prenatal vitamins with iodine if needed.');
  }
  if (iodineIntake > 1100) {
    recommendations.push('Reduce iodine intake. Excessive intake (upper limit: 1100 mcg/day) can cause thyroid dysfunction. If from supplements or seaweed, reduce consumption. Consult healthcare provider if concerns persist.');
  }
  if (deficiencyRisk === 'High' || deficiencyRisk === 'Moderate') {
    recommendations.push('Address iodine deficiency risk promptly. Iodine deficiency can cause serious health problems, especially during pregnancy. Increase intake from iodized salt and iodine-rich foods.');
  }

  const plan = [
    { label: 'This Week', detail: `Calculate iodine intake and compare to daily needs (${dailyNeed} mcg/day). Assess current intake and identify opportunities to meet recommended levels.` },
    { label: 'This Month', detail: 'Optimize iodine intake: include iodized salt, seafood, and dairy products to ensure adequate intake and support thyroid function, especially if pregnant or lactating.' },
    { label: 'Ongoing', detail: 'Monitor iodine intake through regular food assessment. Maintain recommended intake levels to prevent deficiency and support optimal thyroid health.' },
  ];

  return { iodineIntake, age, gender, isPregnant, isLactating, dailyNeed, intakePercent, deficiencyRisk, status, interpretation, recommendations, plan };
};

export default function IodineDeficiencyRiskCalculator() {
  const [result, setResult] = useState<ResultPayload | null>(null);

  const form = useForm<FormValues>({
    resolver: zodResolver(formSchema),
    defaultValues: {
      iodineIntake: undefined,
      age: undefined,
      gender: undefined,
      isPregnant: undefined,
      isLactating: undefined,
    },
  });

  return (
    <div className="space-y-8">
      <Script id="iodine-deficiency-schema" type="application/ld+json" strategy="afterInteractive" dangerouslySetInnerHTML={{ __html: JSON.stringify(schemaMarkup) }} />

      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <AlertTriangle className="h-5 w-5" />
            Iodine Deficiency Risk Calculator
          </CardTitle>
          <CardDescription>Calculate iodine deficiency risk from iodine intake, age, gender, and pregnancy status.</CardDescription>
        </CardHeader>
      </Card>

      <Card>
        <CardHeader>
          <CardTitle>Input your iodine data</CardTitle>
        </CardHeader>
        <CardContent>
          <Form {...form}>
            <form onSubmit={form.handleSubmit((values) => setResult(calculateResult(values)))} className="space-y-6">
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <FormField
                  control={form.control}
                  name="iodineIntake"
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel>Iodine intake (mcg)</FormLabel>
                      <FormControl>
                        <Input type="number" step="1" placeholder="e.g., 150" value={field.value ?? ''} onChange={(e) => field.onChange(e.target.value === '' ? undefined : Number(e.target.value))} />
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
                <FormField
                  control={form.control}
                  name="isPregnant"
                  render={({ field }) => (
                    <FormItem className="flex items-center space-x-2 space-y-0">
                      <FormControl>
                        <input
                          type="checkbox"
                          checked={field.value || false}
                          onChange={field.onChange}
                          className="h-4 w-4 rounded border-gray-300"
                        />
                      </FormControl>
                      <FormLabel className="!mt-0">Pregnant</FormLabel>
                      <FormMessage />
                    </FormItem>
                  )}
                />
                <FormField
                  control={form.control}
                  name="isLactating"
                  render={({ field }) => (
                    <FormItem className="flex items-center space-x-2 space-y-0">
                      <FormControl>
                        <input
                          type="checkbox"
                          checked={field.value || false}
                          onChange={field.onChange}
                          className="h-4 w-4 rounded border-gray-300"
                        />
                      </FormControl>
                      <FormLabel className="!mt-0">Lactating</FormLabel>
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
            <CardDescription>See daily needs, deficiency risk, and recommendations.</CardDescription>
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
                <p className="text-2xl font-semibold text-primary">{result.iodineIntake.toFixed(0)}</p>
                <p className="text-xs text-muted-foreground">mcg/day</p>
              </div>
              <div className="p-4 border rounded">
                <p className="text-sm text-muted-foreground">Deficiency risk</p>
                <p className="text-2xl font-semibold text-primary">{result.deficiencyRisk}</p>
                <p className="text-xs text-muted-foreground">Based on intake</p>
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
            <strong>Daily need</strong> = estimated from age, gender, and pregnancy/lactation status. Adults: 150 mcg/day, Pregnant: 220 mcg/day, Lactating: 290 mcg/day.
          </p>
          <p>
            <strong>Intake percentage</strong> = (iodine intake / daily need) × 100. Values ≥100% indicate adequate intake relative to recommendations.
          </p>
          <p>
            <strong>Deficiency risk</strong> = determined from intake relative to daily need. High risk: &lt;50% of need, Moderate: 50-70%, Mild: 70-90%, Low: ≥90%.
          </p>
          <p>
            <strong>Recommended intake</strong>: Adults: 150 mcg/day, Pregnant: 220 mcg/day, Lactating: 290 mcg/day. Upper limit: 1100 mcg/day for adults.
          </p>
          <p>Iodine is essential for thyroid hormone production. Adequate intake prevents deficiency, which can cause goiter, hypothyroidism, and developmental problems. Both deficiency and excess should be avoided.</p>
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
                <p className="text-sm text-muted-foreground">Intake %</p>
                <p className="text-xl font-semibold text-primary">{result.intakePercent.toFixed(0)}%</p>
                <p className="text-xs text-muted-foreground">Of daily need</p>
              </div>
              <div className="p-4 border rounded">
                <p className="text-sm text-muted-foreground">Upper limit</p>
                <p className="text-xl font-semibold text-primary">1100 mcg</p>
                <p className="text-xs text-muted-foreground">Maximum safe (adults)</p>
              </div>
              <div className="p-4 border rounded">
                <p className="text-sm text-muted-foreground">Deficit/Surplus</p>
                <p className="text-xl font-semibold text-primary">
                  {result.iodineIntake >= result.dailyNeed ? '+' : ''}{(result.iodineIntake - result.dailyNeed).toFixed(0)} mcg
                </p>
                <p className="text-xs text-muted-foreground">Difference from need</p>
              </div>
            </div>
          ) : (
            <p className="text-sm text-muted-foreground">Enter your iodine data to see additional insights.</p>
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
          <p>Iodine is essential for thyroid hormone production, which regulates metabolism, growth, and development. Recommended intake: Adults: 150 mcg/day, Pregnant: 220 mcg/day, Lactating: 290 mcg/day. Iodine deficiency can cause goiter, hypothyroidism, and developmental problems.</p>
          <p>Use this calculator to calculate iodine deficiency risk from iodine intake, age, gender, and pregnancy status.</p>
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
          <p>This tool calculates iodine deficiency risk from iodine intake, age, gender, and pregnancy status.</p>
          <p>Outputs include iodine intake, age, gender, pregnancy/lactation status, daily need, intake percentage, deficiency risk, status, recommendations, an action plan, and supporting metrics.</p>
          <p>Formula, steps, guide content, related tools, and FAQs ensure humans or AI assistants can interpret the methodology instantly.</p>
        </CardContent>
      </Card>
    </div>
  );
}


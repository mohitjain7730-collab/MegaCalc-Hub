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
  age: z.number({ invalid_type_error: 'Enter age' }).min(1).max(100),
  gender: z.enum(['male', 'female'], {
    invalid_type_error: 'Select gender',
  }),
  vitaminKIntake: z.number({ invalid_type_error: 'Enter vitamin K intake' }).min(0).max(1000),
  isPregnant: z.boolean().optional(),
});

type FormValues = z.infer<typeof formSchema>;

type ResultPayload = {
  age: number;
  gender: string;
  vitaminKIntake: number;
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
  'Enter daily vitamin K intake (mcg) from food tracking or estimate.',
  'Review daily needs estimate, intake percentage, and recommendations.',
];

const faqs = [
  {
    question: 'What is vitamin K?',
    answer:
      'Vitamin K is a fat-soluble vitamin essential for blood clotting and bone health. It exists in two main forms: K1 (phylloquinone) from plants and K2 (menaquinone) from animal sources and fermented foods.',
  },
  {
    question: 'What are vitamin K requirements?',
    answer:
      'Recommended daily intake: Men 19+: 120 mcg, Women 19+: 90 mcg. Requirements are based on adequate intake (AI) rather than RDA, as requirements vary and deficiency is rare.',
  },
  {
    question: 'What are sources of vitamin K?',
    answer:
      'Vitamin K1 sources include leafy greens (spinach, kale, broccoli), vegetable oils, and some fruits. Vitamin K2 sources include fermented foods, animal products, and some cheeses.',
  },
  {
    question: 'How does age affect vitamin K needs?',
    answer:
      'Vitamin K needs are relatively stable across adulthood. Children and adolescents have lower requirements. Older adults may have similar or slightly higher needs, but requirements don\'t change dramatically with age.',
  },
  {
    question: 'How does gender affect vitamin K needs?',
    answer:
      'Men typically need more vitamin K (120 mcg/day) than women (90 mcg/day) due to larger body size. Pregnant and lactating women may have similar or slightly higher needs.',
  },
  {
    question: 'What about vitamin K deficiency?',
    answer:
      'Vitamin K deficiency is rare in healthy adults but can cause bleeding problems. Newborns are at higher risk. Adequate intake from food sources typically prevents deficiency.',
  },
  {
    question: 'What about vitamin K and blood thinners?',
    answer:
      'Vitamin K can interfere with blood-thinning medications (warfarin). People on these medications should maintain consistent vitamin K intake and work with healthcare providers to manage intake.',
  },
  {
    question: 'How do I get enough vitamin K?',
    answer:
      'Get vitamin K from leafy green vegetables (spinach, kale, broccoli), vegetable oils, and fermented foods. A varied diet with vegetables typically provides adequate vitamin K.',
  },
  {
    question: 'Can I track vitamin K at home?',
    answer:
      'Yes. Use food databases to estimate vitamin K intake. Many tracking apps include vitamin K content. Focus on consistent intake if on blood-thinning medications.',
  },
  {
    question: 'When should I consult a healthcare provider?',
    answer:
      'Consult a healthcare provider if you\'re on blood-thinning medications, have bleeding concerns, or need personalized guidance on vitamin K intake for your health situation.',
  },
];

const relatedCalculators = [
  {
    name: 'Vitamin A Retinol Equivalent Calculator',
    slug: 'vitamin-a-retinol-equivalent-calculator',
    description: 'Assess vitamin A alongside vitamin K.',
  },
  {
    name: 'Vitamin E Alpha-Tocopherol Calculator',
    slug: 'vitamin-e-alpha-tocopherol-calculator',
    description: 'Evaluate fat-soluble vitamins comprehensively.',
  },
  {
    name: 'Iodine Deficiency Risk Calculator',
    slug: 'iodine-deficiency-risk-calculator',
    description: 'Assess micronutrient status comprehensively.',
  },
  {
    name: 'Nutrient Density to Calorie Ratio Calculator',
    slug: 'nutrient-density-to-calorie-ratio-calculator',
    description: 'Assess nutritional quality comprehensively.',
  },
];

const baseUrl = 'https://mycalculating.com/category/health-fitness/vitamin-k-daily-needs-estimator';

const schemaMarkup = {
  '@context': 'https://schema.org',
  '@graph': [
    {
      '@type': 'BreadcrumbList',
      itemListElement: [
        { '@type': 'ListItem', position: 1, name: 'Home', item: 'https://mycalculating.com' },
        { '@type': 'ListItem', position: 2, name: 'Health & Fitness', item: 'https://mycalculating.com/category/health-fitness' },
        { '@type': 'ListItem', position: 3, name: 'Vitamin K Daily Needs Estimator', item: baseUrl },
      ],
    },
    {
      '@type': 'SoftwareApplication',
      name: 'Vitamin K Daily Needs Estimator',
      applicationCategory: 'Calculator',
      operatingSystem: 'Web Browser',
      description: 'Estimate vitamin K daily needs from age, gender, vitamin K intake, and pregnancy status.',
      url: baseUrl,
      offers: { '@type': 'Offer', price: '0', priceCurrency: 'USD' },
    },
  ],
};

const clamp = (value: number, min: number, max: number) => Math.min(max, Math.max(min, value));

const calculateResult = (values: FormValues): ResultPayload => {
  const age = values.age;
  const gender = values.gender;
  const vitaminKIntake = values.vitaminKIntake;
  const isPregnant = values.isPregnant || false;
  
  // Estimate daily need based on age and gender
  let dailyNeed = 90; // Default for women
  
  if (gender === 'male') {
    if (age >= 19) {
      dailyNeed = 120; // Men 19+
    } else if (age >= 14) {
      dailyNeed = 75; // Boys 14-18
    } else if (age >= 9) {
      dailyNeed = 60; // Boys 9-13
    } else {
      dailyNeed = 55; // Boys 4-8
    }
  } else {
    // Female
    if (isPregnant) {
      dailyNeed = 90; // Pregnant women
    } else if (age >= 19) {
      dailyNeed = 90; // Women 19+
    } else if (age >= 14) {
      dailyNeed = 75; // Girls 14-18
    } else if (age >= 9) {
      dailyNeed = 60; // Girls 9-13
    } else {
      dailyNeed = 55; // Girls 4-8
    }
  }
  
  const intakePercent = dailyNeed > 0 ? (vitaminKIntake / dailyNeed) * 100 : 0;
  
  let status: ResultPayload['status'] = 'optimal';
  let interpretation = 'Your vitamin K intake appears adequate. Continue maintaining balanced intake from diverse sources.';

  if (vitaminKIntake < dailyNeed * 0.7 || intakePercent < 70) {
    status = 'low';
    interpretation = 'Your vitamin K intake is below recommended levels. This may increase deficiency risk. Consider increasing intake from leafy greens, vegetable oils, and fermented foods to meet daily needs.';
  } else if (vitaminKIntake < dailyNeed * 0.9 || intakePercent < 90) {
    status = 'moderate';
    interpretation = 'Your vitamin K intake is slightly below recommended levels. Aim for recommended daily intake to ensure adequate vitamin K status and prevent deficiency.';
  } else if (intakePercent >= 100 && intakePercent <= 200) {
    status = 'optimal';
    interpretation = 'Your vitamin K intake is within recommended range. Continue maintaining balanced intake from diverse sources to support optimal vitamin K status and health.';
  } else {
    status = 'good';
    interpretation = 'Your vitamin K intake is good. Continue including vitamin K-rich foods in your diet to maintain adequate intake and support blood clotting and bone health.';
  }

  const recommendations = [
    'Include vitamin K-rich foods: consume leafy green vegetables (spinach, kale, broccoli), vegetable oils, and fermented foods to meet recommended daily intake.',
    `Aim for recommended intake: ${dailyNeed} mcg/day for your age and gender. This supports blood clotting function and bone health.`,
    'Maintain consistent intake if on blood-thinning medications: vitamin K can interfere with warfarin. Work with healthcare provider to manage consistent vitamin K intake.',
  ];
  if (status === 'low' || status === 'moderate') {
    recommendations.push('Increase vitamin K intake through food sources. Include more leafy greens, vegetable oils, and fermented foods to meet recommended daily needs and prevent deficiency.');
  }
  if (vitaminKIntake < dailyNeed * 0.8) {
    recommendations.push(`Significantly increase vitamin K intake. Current intake is below recommended levels (${dailyNeed} mcg/day). Focus on leafy green vegetables and other vitamin K-rich foods.`);
  }

  const plan = [
    { label: 'This Week', detail: `Calculate vitamin K intake and compare to daily needs (${dailyNeed} mcg/day). Assess current intake and identify opportunities to meet recommended levels.` },
    { label: 'This Month', detail: 'Optimize vitamin K intake: include leafy greens, vegetable oils, and fermented foods to ensure adequate intake and support blood clotting and bone health.' },
    { label: 'Ongoing', detail: 'Monitor vitamin K intake through regular food assessment. Maintain recommended intake levels to prevent deficiency and support optimal health.' },
  ];

  return { age, gender, vitaminKIntake, dailyNeed, intakePercent, status, interpretation, recommendations, plan };
};

export default function VitaminKDailyNeedsEstimator() {
  const [result, setResult] = useState<ResultPayload | null>(null);

  const form = useForm<FormValues>({
    resolver: zodResolver(formSchema),
    defaultValues: {
      age: undefined,
      gender: undefined,
      vitaminKIntake: undefined,
      isPregnant: undefined,
    },
  });

  return (
    <div className="space-y-8">
      <Script id="vitamin-k-needs-schema" type="application/ld+json" strategy="afterInteractive" dangerouslySetInnerHTML={{ __html: JSON.stringify(schemaMarkup) }} />

      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <Heart className="h-5 w-5" />
            Vitamin K Daily Needs Estimator
          </CardTitle>
          <CardDescription>Estimate vitamin K daily needs from age, gender, vitamin K intake, and pregnancy status.</CardDescription>
        </CardHeader>
      </Card>

      <Card>
        <CardHeader>
          <CardTitle>Input your vitamin K data</CardTitle>
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
                  name="vitaminKIntake"
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel>Vitamin K intake (mcg)</FormLabel>
                      <FormControl>
                        <Input type="number" step="1" placeholder="e.g., 90" value={field.value ?? ''} onChange={(e) => field.onChange(e.target.value === '' ? undefined : Number(e.target.value))} />
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
                <p className="text-2xl font-semibold text-primary">{result.vitaminKIntake.toFixed(0)}</p>
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
            <strong>Daily need</strong> = estimated from age and gender. Men 19+: 120 mcg/day, Women 19+: 90 mcg/day. Children and adolescents have lower requirements.
          </p>
          <p>
            <strong>Intake percentage</strong> = (vitamin K intake / daily need) × 100. Values ≥100% indicate adequate intake relative to recommendations.
          </p>
          <p>
            <strong>Recommended intake</strong>: Men 19+: 120 mcg/day, Women 19+: 90 mcg/day. Requirements are based on adequate intake (AI) rather than RDA, as requirements vary.
          </p>
          <p>Vitamin K requirements are relatively stable across adulthood. Adequate intake supports blood clotting function and bone health. Deficiency is rare in healthy adults with varied diets.</p>
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
                  {result.vitaminKIntake >= result.dailyNeed ? '+' : ''}{(result.vitaminKIntake - result.dailyNeed).toFixed(0)} mcg
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
            <p className="text-sm text-muted-foreground">Enter your vitamin K data to see additional insights.</p>
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
          <p>Vitamin K is essential for blood clotting and bone health. Recommended daily intake: Men 19+: 120 mcg, Women 19+: 90 mcg. Requirements are based on adequate intake (AI) and are relatively stable across adulthood.</p>
          <p>Use this calculator to estimate vitamin K daily needs from age, gender, vitamin K intake, and pregnancy status.</p>
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
          <p>This tool estimates vitamin K daily needs from age, gender, vitamin K intake, and pregnancy status.</p>
          <p>Outputs include age, gender, vitamin K intake, daily need, intake percentage, status, recommendations, an action plan, and supporting metrics.</p>
          <p>Formula, steps, guide content, related tools, and FAQs ensure humans or AI assistants can interpret the methodology instantly.</p>
        </CardContent>
      </Card>
    </div>
  );
}


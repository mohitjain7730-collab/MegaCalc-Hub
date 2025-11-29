'use client';

import { useState } from 'react';
import Script from 'next/script';
import Link from 'next/link';
import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import { z } from 'zod';
import { Moon, Zap, Target, Activity, Shield } from 'lucide-react';

import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Form, FormControl, FormField, FormItem, FormLabel, FormMessage } from '@/components/ui/form';
import { Input } from '@/components/ui/input';

const formSchema = z.object({
  mealGI: z.number({ invalid_type_error: 'Enter meal glycemic index' }).min(0).max(100),
  totalCarbs: z.number({ invalid_type_error: 'Enter total carbohydrates' }).min(0).max(200),
  fiberContent: z.number({ invalid_type_error: 'Enter fiber content' }).min(0).max(50).optional(),
  proteinContent: z.number({ invalid_type_error: 'Enter protein content' }).min(0).max(100).optional(),
  fatContent: z.number({ invalid_type_error: 'Enter fat content' }).min(0).max(100).optional(),
});

type FormValues = z.infer<typeof formSchema>;

type ResultPayload = {
  mealGL: number;
  optimizedGI: number;
  bloodSugarImpact: string;
  mealTiming: string;
  status: 'optimal' | 'good' | 'moderate' | 'low';
  interpretation: string;
  recommendations: string[];
  plan: { label: string; detail: string }[];
};

const steps = [
  'Enter the glycemic index (GI) of your meal (0-100).',
  'Enter total carbohydrates in grams.',
  'Optionally enter fiber content in grams.',
  'Optionally enter protein content in grams.',
  'Optionally enter fat content in grams.',
  'Review meal glycemic load, optimized GI, blood sugar impact, and recommendations.',
];

const faqs = [
  {
    question: 'What is glycemic index (GI)?',
    answer:
      'Glycemic index measures how quickly a food raises blood sugar on a scale of 0-100. Low GI (≤55) causes slow, gradual rises; medium GI (56-69) moderate rises; high GI (≥70) causes rapid spikes.',
  },
  {
    question: 'What is glycemic load (GL)?',
    answer:
      'Glycemic load considers both the GI and the amount of carbohydrates consumed. GL = (GI × Carbohydrates in grams) / 100. It provides a more accurate picture of a meal\'s blood sugar impact than GI alone.',
  },
  {
    question: 'Why does glycemic index matter?',
    answer:
      'Foods with lower GI provide more stable blood sugar, sustained energy, better satiety, and reduced risk of type 2 diabetes. High GI foods cause rapid blood sugar spikes followed by crashes, leading to hunger and energy fluctuations.',
  },
  {
    question: 'How can I lower a meal\'s glycemic index?',
    answer:
      'Add protein, healthy fats, or fiber to meals to slow carbohydrate digestion and absorption. Combining high-GI foods with low-GI foods, or eating them with protein/fat, lowers the overall meal GI.',
  },
  {
    question: 'Does cooking method affect GI?',
    answer:
      'Yes. Longer cooking times, higher temperatures, and more processing generally increase GI. Al dente pasta has lower GI than well-cooked pasta. Cooling cooked starches (like potatoes) can reduce their GI.',
  },
  {
    question: 'What is a good meal glycemic load?',
    answer:
      'Low GL (≤10) is ideal for blood sugar control. Moderate GL (11-19) is acceptable. High GL (≥20) causes significant blood sugar spikes. Aim for meals with GL ≤10 for optimal blood sugar management.',
  },
  {
    question: 'Can I eat high-GI foods?',
    answer:
      'Yes, in moderation and strategically. High-GI foods are fine for post-workout recovery when you want quick energy. Combine them with protein, fat, or fiber, or eat smaller portions to minimize blood sugar impact.',
  },
  {
    question: 'How does fiber affect glycemic response?',
    answer:
      'Fiber slows carbohydrate digestion and absorption, reducing the glycemic impact of a meal. Soluble fiber (oats, beans) is particularly effective at lowering GI. Aim for 5-10g fiber per meal.',
  },
  {
    question: 'Does meal timing matter for glycemic index?',
    answer:
      'Yes. Lower-GI meals are better for general eating. Higher-GI foods may be appropriate post-workout for recovery. Avoid high-GI meals before bed as they can disrupt sleep and cause blood sugar fluctuations.',
  },
  {
    question: 'What are some low-GI food examples?',
    answer:
      'Low-GI foods include most non-starchy vegetables, legumes, whole grains (oats, barley), most fruits, nuts, and dairy. High-GI foods include white bread, white rice, potatoes, sugary drinks, and processed cereals.',
  },
];

const relatedCalculators = [
  {
    name: 'Glycemic Load Calculator',
    slug: 'glycemic-load-calculator',
    description: 'Calculate glycemic load for individual foods.',
  },
  {
    name: 'Meal Glycemic Load Calculator',
    slug: 'meal-glycemic-load-calculator',
    description: 'Calculate glycemic load for complete meals.',
  },
  {
    name: 'Blood Sugar to HbA1c Converter',
    slug: 'blood-sugar-to-hba1c-converter',
    description: 'Convert blood sugar levels to HbA1c.',
  },
  {
    name: 'Diabetes Risk Type 2 Calculator',
    slug: 'diabetes-risk-type2-calculator',
    description: 'Assess diabetes risk and blood sugar management.',
  },
];

const baseUrl = 'https://mycalculating.com/category/health-fitness/glycemic-index-meal-optimizer-calculator';

const schemaMarkup = {
  '@context': 'https://schema.org',
  '@graph': [
    {
      '@type': 'BreadcrumbList',
      itemListElement: [
        { '@type': 'ListItem', position: 1, name: 'Home', item: 'https://mycalculating.com' },
        { '@type': 'ListItem', position: 2, name: 'Health & Fitness', item: 'https://mycalculating.com/category/health-fitness' },
        { '@type': 'ListItem', position: 3, name: 'Glycemic Index Meal Optimizer Calculator', item: baseUrl },
      ],
    },
    {
      '@type': 'SoftwareApplication',
      name: 'Glycemic Index Meal Optimizer Calculator',
      applicationCategory: 'Calculator',
      operatingSystem: 'Web Browser',
      description: 'Calculate optimal glycemic index for meals based on foods, portion sizes, and timing to manage blood sugar and optimize energy levels.',
      url: baseUrl,
      offers: { '@type': 'Offer', price: '0', priceCurrency: 'USD' },
    },
  ],
};

const calculateResult = (values: FormValues): ResultPayload => {
  const mealGI = values.mealGI;
  const totalCarbs = values.totalCarbs;
  const fiberContent = values.fiberContent ?? 0;
  const proteinContent = values.proteinContent ?? 0;
  const fatContent = values.fatContent ?? 0;
  
  // Calculate glycemic load
  const mealGL = (mealGI * totalCarbs) / 100;
  
  // Optimize GI by accounting for protein, fat, and fiber
  let optimizedGI = mealGI;
  
  // Fiber reduces GI (each 5g reduces by ~5 points, up to 15 point reduction)
  const fiberReduction = Math.min(15, (fiberContent / 5) * 5);
  
  // Protein reduces GI (each 10g reduces by ~3 points, up to 10 point reduction)
  const proteinReduction = Math.min(10, (proteinContent / 10) * 3);
  
  // Fat reduces GI (each 10g reduces by ~2 points, up to 8 point reduction)
  const fatReduction = Math.min(8, (fatContent / 10) * 2);
  
  optimizedGI = Math.max(0, mealGI - fiberReduction - proteinReduction - fatReduction);
  
  // Optimized GL
  const optimizedGL = (optimizedGI * totalCarbs) / 100;
  
  // Determine blood sugar impact
  let bloodSugarImpact: string;
  if (optimizedGL <= 10) {
    bloodSugarImpact = 'Low - Gradual, steady rise';
  } else if (optimizedGL <= 19) {
    bloodSugarImpact = 'Moderate - Moderate rise';
  } else {
    bloodSugarImpact = 'High - Rapid spike';
  }
  
  // Meal timing recommendations
  let mealTiming = 'Anytime';
  if (optimizedGL <= 10) {
    mealTiming = 'Ideal for all meals';
  } else if (optimizedGL <= 19) {
    mealTiming = 'Good for most meals, avoid before bed';
  } else {
    mealTiming = 'Best for post-workout, avoid before bed or sedentary periods';
  }
  
  let status: ResultPayload['status'] = 'optimal';
  let interpretation = 'Your meal has an optimal glycemic impact, providing stable blood sugar and sustained energy.';
  
  if (optimizedGL <= 10) {
    status = 'optimal';
    interpretation = 'Your meal has a low glycemic load, providing stable blood sugar and sustained energy. This is ideal for blood sugar management.';
  } else if (optimizedGL <= 19) {
    status = 'good';
    interpretation = 'Your meal has a moderate glycemic load. This is acceptable for most people, though lower would be better for blood sugar control.';
  } else if (optimizedGL <= 30) {
    status = 'moderate';
    interpretation = 'Your meal has a high glycemic load, which may cause significant blood sugar spikes. Consider optimizing with protein, fat, or fiber.';
  } else {
    status = 'low';
    interpretation = 'Your meal has a very high glycemic load, causing rapid blood sugar spikes. Significant optimization is needed to improve blood sugar response.';
  }
  
  const recommendations = [
    `Your meal glycemic load is ${optimizedGL.toFixed(1)} (optimized from ${mealGL.toFixed(1)}). Blood sugar impact: ${bloodSugarImpact}.`,
    optimizedGL > 10
      ? 'To lower glycemic impact: Add protein (10-20g), healthy fats (5-10g), or fiber (5-10g) to slow carbohydrate absorption and reduce blood sugar spikes.'
      : 'Your meal is well-balanced. The combination of carbohydrates with protein, fat, and fiber helps moderate blood sugar response.',
    `Optimal meal timing: ${mealTiming}. Lower-GI meals are better for general eating, while higher-GI meals may be appropriate post-workout.`,
    'Aim for meals with glycemic load ≤10 for optimal blood sugar control. If your meal exceeds this, reduce portion size or add protein/fat/fiber.',
  ];
  
  if (mealGL > optimizedGL && (fiberContent > 0 || proteinContent > 0 || fatContent > 0)) {
    recommendations.push(`By including fiber, protein, and/or fat, you've reduced the effective GI from ${mealGI} to ${optimizedGI.toFixed(0)}, lowering glycemic load by ${(mealGL - optimizedGL).toFixed(1)}.`);
  }
  
  if (optimizedGL > 19) {
    recommendations.push('Consider reducing carbohydrate portion size or choosing lower-GI carbohydrate sources to bring glycemic load below 19 for better blood sugar control.');
  }
  
  const plan = [
    { label: 'This Week', detail: `Aim for meals with glycemic load ≤10. Include protein (10-20g), healthy fats (5-10g), or fiber (5-10g) with carbohydrate-rich meals to optimize blood sugar response.` },
    { label: 'This Month', detail: 'Track meal glycemic loads and blood sugar responses. Build a repertoire of low-GI meals. Monitor energy levels and hunger patterns to see improvements from lower-GI eating.' },
    { label: 'Ongoing', detail: 'Maintain meals with glycemic load ≤10 for stable blood sugar. Use high-GI foods strategically (post-workout recovery) rather than as regular meal components. Continue combining carbs with protein, fat, and fiber.' },
  ];
  
  return { mealGL: optimizedGL, optimizedGI, bloodSugarImpact, mealTiming, status, interpretation, recommendations, plan };
};

export default function GlycemicIndexMealOptimizerCalculator() {
  const [result, setResult] = useState<ResultPayload | null>(null);

  const form = useForm<FormValues>({
    resolver: zodResolver(formSchema),
    defaultValues: {
      mealGI: undefined,
      totalCarbs: undefined,
      fiberContent: undefined,
      proteinContent: undefined,
      fatContent: undefined,
    },
  });

  return (
    <div className="space-y-8">
      <Script id="glycemic-meal-schema" type="application/ld+json" strategy="afterInteractive" dangerouslySetInnerHTML={{ __html: JSON.stringify(schemaMarkup) }} />

      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <Moon className="h-5 w-5" />
            Glycemic Index Meal Optimizer Calculator
          </CardTitle>
          <CardDescription>Calculate optimal glycemic index for meals based on foods, portion sizes, and timing to manage blood sugar and optimize energy levels.</CardDescription>
        </CardHeader>
      </Card>

      <Card>
        <CardHeader>
          <CardTitle>Input your meal data</CardTitle>
        </CardHeader>
        <CardContent>
          <Form {...form}>
            <form onSubmit={form.handleSubmit((values) => setResult(calculateResult(values)))} className="space-y-6">
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <FormField
                  control={form.control}
                  name="mealGI"
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel>Meal glycemic index (0-100)</FormLabel>
                      <FormControl>
                        <Input type="number" step="1" placeholder="e.g., 70" value={field.value ?? ''} onChange={(e) => field.onChange(e.target.value === '' ? undefined : Number(e.target.value))} />
                      </FormControl>
                      <FormMessage />
                    </FormItem>
                  )}
                />
                <FormField
                  control={form.control}
                  name="totalCarbs"
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel>Total carbohydrates (grams)</FormLabel>
                      <FormControl>
                        <Input type="number" step="1" placeholder="e.g., 50" value={field.value ?? ''} onChange={(e) => field.onChange(e.target.value === '' ? undefined : Number(e.target.value))} />
                      </FormControl>
                      <FormMessage />
                    </FormItem>
                  )}
                />
                <FormField
                  control={form.control}
                  name="fiberContent"
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel>Fiber content (grams, optional)</FormLabel>
                      <FormControl>
                        <Input type="number" step="0.5" placeholder="e.g., 5" value={field.value ?? ''} onChange={(e) => field.onChange(e.target.value === '' ? undefined : Number(e.target.value))} />
                      </FormControl>
                      <FormMessage />
                    </FormItem>
                  )}
                />
                <FormField
                  control={form.control}
                  name="proteinContent"
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel>Protein content (grams, optional)</FormLabel>
                      <FormControl>
                        <Input type="number" step="1" placeholder="e.g., 20" value={field.value ?? ''} onChange={(e) => field.onChange(e.target.value === '' ? undefined : Number(e.target.value))} />
                      </FormControl>
                      <FormMessage />
                    </FormItem>
                  )}
                />
                <FormField
                  control={form.control}
                  name="fatContent"
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel>Fat content (grams, optional)</FormLabel>
                      <FormControl>
                        <Input type="number" step="0.5" placeholder="e.g., 10" value={field.value ?? ''} onChange={(e) => field.onChange(e.target.value === '' ? undefined : Number(e.target.value))} />
                      </FormControl>
                      <FormMessage />
                    </FormItem>
                  )}
                />
              </div>
              <Button type="submit" className="w-full md:w-auto">
                Optimize meal glycemic impact
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
            <CardDescription>See optimized glycemic load, blood sugar impact, meal timing, and recommendations.</CardDescription>
          </CardHeader>
          <CardContent className="space-y-6">
            <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
              <div className="p-4 border rounded">
                <p className="text-sm text-muted-foreground">Glycemic load</p>
                <p className="text-2xl font-semibold text-primary">{result.mealGL.toFixed(1)}</p>
                <p className="text-xs text-muted-foreground">Optimized value</p>
              </div>
              <div className="p-4 border rounded">
                <p className="text-sm text-muted-foreground">Optimized GI</p>
                <p className="text-2xl font-semibold text-primary">{result.optimizedGI.toFixed(0)}</p>
                <p className="text-xs text-muted-foreground">With modifiers</p>
              </div>
              <div className="p-4 border rounded">
                <p className="text-sm text-muted-foreground">Blood sugar impact</p>
                <p className="text-2xl font-semibold text-primary">{result.bloodSugarImpact.split(' - ')[0]}</p>
                <p className="text-xs text-muted-foreground">{result.bloodSugarImpact.split(' - ')[1]}</p>
              </div>
              <div className="p-4 border rounded">
                <p className="text-sm text-muted-foreground">Status</p>
                <p className="text-2xl font-semibold text-primary capitalize">{result.status}</p>
                <p className="text-xs text-muted-foreground">{result.interpretation}</p>
              </div>
            </div>
            <div className="p-4 border rounded">
              <p className="text-sm font-semibold mb-2">Optimal meal timing</p>
              <p className="text-sm text-muted-foreground">{result.mealTiming}</p>
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
            <strong>Glycemic Load (GL)</strong> = (Glycemic Index × Total Carbohydrates in grams) / 100.
          </p>
          <p>
            <strong>Optimized GI</strong> = Base GI - Fiber reduction - Protein reduction - Fat reduction.
          </p>
          <p>
            <strong>Fiber reduction</strong>: Each 5g fiber reduces GI by ~5 points (max 15 point reduction). <strong>Protein reduction</strong>: Each 10g protein reduces GI by ~3 points (max 10 point reduction). <strong>Fat reduction</strong>: Each 10g fat reduces GI by ~2 points (max 8 point reduction).
          </p>
          <p>
            <strong>GL classification</strong>: Low (≤10) = gradual rise, Moderate (11-19) = moderate rise, High (≥20) = rapid spike.
          </p>
          <p>Adding protein, fat, or fiber to meals slows carbohydrate digestion and absorption, reducing the effective glycemic index and creating a more stable blood sugar response.</p>
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
                <p className="text-sm text-muted-foreground">Target glycemic load</p>
                <p className="text-xl font-semibold text-primary">≤10</p>
                <p className="text-xs text-muted-foreground">Optimal for blood sugar</p>
              </div>
              <div className="p-4 border rounded">
                <p className="text-sm text-muted-foreground">GI reduction</p>
                <p className="text-xl font-semibold text-primary">
                  {(() => {
                    const baseGI = form.getValues().mealGI ?? 0;
                    const reduction = baseGI - result.optimizedGI;
                    return reduction > 0 ? `-${reduction.toFixed(0)} points` : 'None';
                  })()}
                </p>
                <p className="text-xs text-muted-foreground">From optimization</p>
              </div>
              <div className="p-4 border rounded">
                <p className="text-sm text-muted-foreground">Blood sugar stability</p>
                <p className="text-xl font-semibold text-primary">
                  {result.mealGL <= 10 ? 'High' : result.mealGL <= 19 ? 'Moderate' : 'Low'}
                </p>
                <p className="text-xs text-muted-foreground">Based on GL</p>
              </div>
            </div>
          ) : (
            <p className="text-sm text-muted-foreground">Enter your meal data to see additional insights.</p>
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
          <p>Glycemic index measures how quickly foods raise blood sugar, while glycemic load considers both GI and portion size. Lower-GI meals provide stable blood sugar, sustained energy, and better satiety. Combining carbohydrates with protein, fat, or fiber reduces the effective GI of a meal.</p>
          <p>Use this calculator to optimize meal glycemic impact by calculating glycemic load and determining how protein, fat, and fiber modify the effective glycemic index for better blood sugar management.</p>
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
          <p>This tool calculates optimal glycemic index for meals based on foods, portion sizes, and timing to manage blood sugar and optimize energy levels.</p>
          <p>Outputs include meal glycemic load, optimized GI, blood sugar impact, meal timing recommendations, status, recommendations, an action plan, and supporting metrics.</p>
          <p>Formula, steps, guide content, related tools, and FAQs ensure humans or AI assistants can interpret the methodology instantly.</p>
        </CardContent>
      </Card>
    </div>
  );
}


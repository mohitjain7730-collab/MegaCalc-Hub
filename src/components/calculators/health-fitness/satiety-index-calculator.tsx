'use client';

import { useState } from 'react';
import Script from 'next/script';
import Link from 'next/link';
import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import { z } from 'zod';
import { Utensils, Zap, Target, Activity, Shield } from 'lucide-react';

import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Form, FormControl, FormField, FormItem, FormLabel, FormMessage } from '@/components/ui/form';
import { Input } from '@/components/ui/input';

const formSchema = z.object({
  proteinGrams: z.number({ invalid_type_error: 'Enter protein grams' }).min(0).max(100),
  fiberGrams: z.number({ invalid_type_error: 'Enter fiber grams' }).min(0).max(50),
  calories: z.number({ invalid_type_error: 'Enter calories' }).min(1).max(2000),
  volumeScore: z.number({ invalid_type_error: 'Enter volume score' }).min(1).max(10),
});

type FormValues = z.infer<typeof formSchema>;

type ResultPayload = {
  proteinGrams: number;
  fiberGrams: number;
  calories: number;
  volumeScore: number;
  satietyIndex: number;
  indexScore: number;
  status: 'optimal' | 'good' | 'moderate' | 'low';
  interpretation: string;
  recommendations: string[];
  plan: { label: string; detail: string }[];
};

const steps = [
  'Enter protein content (grams) in the meal from food tracking.',
  'Enter fiber content (grams) in the meal from food tracking.',
  'Enter total calories for the meal from food tracking.',
  'Enter volume score (1 = low volume, 10 = high volume) from meal assessment.',
  'Review satiety index, fullness potential, and recommendations.',
];

const faqs = [
  {
    question: 'What is satiety index?',
    answer:
      'Satiety index measures how filling a food or meal is relative to its calorie content. Higher satiety index foods provide more fullness per calorie, supporting appetite control and weight management.',
  },
  {
    question: 'What affects satiety?',
    answer:
      'Satiety is affected by protein content, fiber content, food volume, calorie density, meal composition, and individual factors. Higher protein, fiber, and volume increase satiety per calorie.',
  },
  {
    question: 'How does protein affect satiety?',
    answer:
      'Protein is highly satiating. It increases feelings of fullness, reduces hunger hormones, and supports appetite control. Meals with adequate protein (20-30g) typically provide better satiety.',
  },
  {
    question: 'How does fiber affect satiety?',
    answer:
      'Fiber increases satiety by adding bulk, slowing digestion, and promoting feelings of fullness. High-fiber foods (vegetables, whole grains, legumes) are typically more satiating per calorie.',
  },
  {
    question: 'How does volume affect satiety?',
    answer:
      'Food volume (physical space food takes up) affects satiety. Larger volume foods (like vegetables) can increase feelings of fullness even with fewer calories, supporting satiety.',
  },
  {
    question: 'What are high satiety foods?',
    answer:
      'High satiety foods include lean proteins (chicken, fish, eggs), high-fiber foods (vegetables, whole grains, legumes), and low-calorie-density foods that provide volume and nutrients.',
  },
  {
    question: 'How can I increase meal satiety?',
    answer:
      'Increase meal satiety by including adequate protein (20-30g), adding fiber-rich foods (vegetables, whole grains), choosing lower-calorie-density options, and including volume in meals.',
  },
  {
    question: 'What about calorie density?',
    answer:
      'Calorie density (calories per gram) affects satiety. Lower-calorie-density foods (vegetables, fruits) provide more volume and satiety per calorie than high-calorie-density foods (oils, nuts).',
  },
  {
    question: 'Can I track satiety at home?',
    answer:
      'Yes. Track satiety by monitoring protein, fiber, calories, and meal volume. Assess how full you feel after meals and adjust meal composition to optimize satiety and appetite control.',
  },
  {
    question: 'When should I consult a healthcare provider?',
    answer:
      'Consult a healthcare provider or registered dietitian if you have appetite concerns, need help with meal planning for satiety, or want personalized guidance on optimizing satiety for weight management.',
  },
];

const relatedCalculators = [
  {
    name: 'Meal Calorie Breakdown Calculator',
    slug: 'meal-calorie-breakdown-calculator',
    description: 'Break down meal calories alongside satiety.',
  },
  {
    name: 'Nutrient Density to Calorie Ratio Calculator',
    slug: 'nutrient-density-to-calorie-ratio-calculator',
    description: 'Assess nutritional quality comprehensively.',
  },
  {
    name: 'Glycemic Index Meal Blender Calculator',
    slug: 'glycemic-index-meal-blender-calculator',
    description: 'Evaluate glycemic impact alongside satiety.',
  },
  {
    name: 'Insulin Response Estimator',
    slug: 'insulin-response-estimator',
    description: 'Assess insulin response affecting satiety.',
  },
];

const baseUrl = 'https://mycalculating.com/category/health-fitness/satiety-index-calculator';

const schemaMarkup = {
  '@context': 'https://schema.org',
  '@graph': [
    {
      '@type': 'BreadcrumbList',
      itemListElement: [
        { '@type': 'ListItem', position: 1, name: 'Home', item: 'https://mycalculating.com' },
        { '@type': 'ListItem', position: 2, name: 'Health & Fitness', item: 'https://mycalculating.com/category/health-fitness' },
        { '@type': 'ListItem', position: 3, name: 'Satiety Index Calculator', item: baseUrl },
      ],
    },
    {
      '@type': 'SoftwareApplication',
      name: 'Satiety Index Calculator',
      applicationCategory: 'Calculator',
      operatingSystem: 'Web Browser',
      description: 'Calculate satiety index for meal planning from protein grams, fiber grams, calories, and volume score.',
      url: baseUrl,
      offers: { '@type': 'Offer', price: '0', priceCurrency: 'USD' },
    },
  ],
};

const clamp = (value: number, min: number, max: number) => Math.min(max, Math.max(min, value));

const calculateResult = (values: FormValues): ResultPayload => {
  const proteinGrams = values.proteinGrams;
  const fiberGrams = values.fiberGrams;
  const calories = values.calories;
  const volumeScore = values.volumeScore;
  
  // Calculate satiety index (0-100, higher = more satiating)
  let satietyIndex = 50;
  
  // Protein component (0-35 points)
  // Optimal: 20-30g per meal
  if (proteinGrams >= 25 && proteinGrams <= 35) {
    satietyIndex += 30; // Optimal range
  } else if (proteinGrams >= 20 && proteinGrams < 25) {
    satietyIndex += 25; // Good
  } else if (proteinGrams >= 15 && proteinGrams < 20) {
    satietyIndex += 15; // Moderate
  } else if (proteinGrams < 10) {
    satietyIndex -= 20; // Low
  } else if (proteinGrams > 35) {
    satietyIndex += 20; // Very high (still beneficial)
  }
  
  // Fiber component (0-30 points)
  // Optimal: 5-10g per meal
  if (fiberGrams >= 8 && fiberGrams <= 15) {
    satietyIndex += 28; // Excellent
  } else if (fiberGrams >= 5 && fiberGrams < 8) {
    satietyIndex += 18; // Good
  } else if (fiberGrams >= 3 && fiberGrams < 5) {
    satietyIndex += 8; // Moderate
  } else if (fiberGrams < 2) {
    satietyIndex -= 15; // Low
  } else if (fiberGrams > 15) {
    satietyIndex += 25; // Very high
  }
  
  // Volume component (0-20 points)
  if (volumeScore >= 8) {
    satietyIndex += 18; // High volume
  } else if (volumeScore >= 6) {
    satietyIndex += 10; // Good volume
  } else if (volumeScore < 4) {
    satietyIndex -= 12; // Low volume
  } else {
    satietyIndex += 3; // Moderate volume
  }
  
  // Calorie density adjustment (0-15 points, inverted)
  // Lower calories for given satiety factors = better
  const calorieDensity = calories / (proteinGrams + fiberGrams + volumeScore * 10);
  if (calorieDensity < 5) {
    satietyIndex += 12; // Very low density
  } else if (calorieDensity < 10) {
    satietyIndex += 6; // Low density
  } else if (calorieDensity > 20) {
    satietyIndex -= 10; // High density
  }
  
  satietyIndex = clamp(satietyIndex, 0, 100);
  const indexScore = satietyIndex; // Same value

  let status: ResultPayload['status'] = 'optimal';
  let interpretation = 'Your meal satiety index appears optimal. Continue including adequate protein, fiber, and volume to support appetite control.';

  if (satietyIndex < 40 || proteinGrams < 10 || fiberGrams < 2) {
    status = 'low';
    interpretation = 'Your meal satiety index is low. This meal may not provide adequate fullness. Increase protein, fiber, and volume to improve satiety and support appetite control.';
  } else if (satietyIndex < 60 || proteinGrams < 15 || fiberGrams < 5) {
    status = 'moderate';
    interpretation = 'Your meal satiety index is moderate. Consider increasing protein, fiber, and volume to enhance satiety and improve appetite control.';
  } else if (satietyIndex < 75) {
    status = 'good';
    interpretation = 'Your meal satiety index is good. Continue including adequate protein, fiber, and volume to maintain optimal satiety and appetite control.';
  }

  const recommendations = [
    'Include adequate protein: aim for 20-30g of protein per meal to maximize satiety. Protein is highly satiating and supports appetite control.',
    'Add fiber-rich foods: include vegetables, whole grains, and legumes to increase fiber content (5-10g per meal) and enhance satiety through bulk and slower digestion.',
    'Increase meal volume: include low-calorie-density foods like vegetables to add volume without many calories, enhancing feelings of fullness.',
  ];
  if (status === 'low' || status === 'moderate') {
    recommendations.push('Optimize meal composition for satiety. Meals with adequate protein, fiber, and volume provide better fullness per calorie, supporting appetite control and weight management.');
  }
  if (proteinGrams < 15) {
    recommendations.push('Increase protein content. Protein is one of the most satiating macronutrients. Aim for at least 20g of protein per meal for optimal satiety.');
  }
  if (fiberGrams < 5) {
    recommendations.push('Add more fiber-rich foods. Fiber increases satiety by adding bulk and slowing digestion. Include vegetables, whole grains, and legumes in meals.');
  }

  const plan = [
    { label: 'This Week', detail: 'Calculate satiety index for your meals. Assess protein, fiber, and volume to identify opportunities to improve satiety and appetite control.' },
    { label: 'This Month', detail: 'Optimize meal composition: increase protein to 20-30g per meal, add fiber-rich foods, and include volume through vegetables to enhance satiety.' },
    { label: 'Ongoing', detail: 'Monitor satiety through regular meal assessment. Maintain meals with adequate protein, fiber, and volume to support optimal satiety and appetite control.' },
  ];

  return { proteinGrams, fiberGrams, calories, volumeScore, satietyIndex, indexScore, status, interpretation, recommendations, plan };
};

export default function SatietyIndexCalculator() {
  const [result, setResult] = useState<ResultPayload | null>(null);

  const form = useForm<FormValues>({
    resolver: zodResolver(formSchema),
    defaultValues: {
      proteinGrams: undefined,
      fiberGrams: undefined,
      calories: undefined,
      volumeScore: undefined,
    },
  });

  return (
    <div className="space-y-8">
      <Script id="satiety-index-schema" type="application/ld+json" strategy="afterInteractive" dangerouslySetInnerHTML={{ __html: JSON.stringify(schemaMarkup) }} />

      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <Utensils className="h-5 w-5" />
            Satiety Index Calculator
          </CardTitle>
          <CardDescription>Calculate satiety index for meal planning from protein grams, fiber grams, calories, and volume score.</CardDescription>
        </CardHeader>
      </Card>

      <Card>
        <CardHeader>
          <CardTitle>Input your meal satiety data</CardTitle>
        </CardHeader>
        <CardContent>
          <Form {...form}>
            <form onSubmit={form.handleSubmit((values) => setResult(calculateResult(values)))} className="space-y-6">
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <FormField
                  control={form.control}
                  name="proteinGrams"
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel>Protein (grams)</FormLabel>
                      <FormControl>
                        <Input type="number" step="1" placeholder="e.g., 25" value={field.value ?? ''} onChange={(e) => field.onChange(e.target.value === '' ? undefined : Number(e.target.value))} />
                      </FormControl>
                      <FormMessage />
                    </FormItem>
                  )}
                />
                <FormField
                  control={form.control}
                  name="fiberGrams"
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel>Fiber (grams)</FormLabel>
                      <FormControl>
                        <Input type="number" step="1" placeholder="e.g., 8" value={field.value ?? ''} onChange={(e) => field.onChange(e.target.value === '' ? undefined : Number(e.target.value))} />
                      </FormControl>
                      <FormMessage />
                    </FormItem>
                  )}
                />
                <FormField
                  control={form.control}
                  name="calories"
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel>Calories</FormLabel>
                      <FormControl>
                        <Input type="number" step="1" placeholder="e.g., 500" value={field.value ?? ''} onChange={(e) => field.onChange(e.target.value === '' ? undefined : Number(e.target.value))} />
                      </FormControl>
                      <FormMessage />
                    </FormItem>
                  )}
                />
                <FormField
                  control={form.control}
                  name="volumeScore"
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel>Volume score (1-10)</FormLabel>
                      <FormControl>
                        <Input type="number" step="1" placeholder="e.g., 7" value={field.value ?? ''} onChange={(e) => field.onChange(e.target.value === '' ? undefined : Number(e.target.value))} />
                      </FormControl>
                      <FormMessage />
                    </FormItem>
                  )}
                />
              </div>
              <Button type="submit" className="w-full md:w-auto">
                Calculate satiety index
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
            <CardDescription>See satiety index, fullness potential, and recommendations.</CardDescription>
          </CardHeader>
          <CardContent className="space-y-6">
            <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
              <div className="p-4 border rounded">
                <p className="text-sm text-muted-foreground">Protein</p>
                <p className="text-2xl font-semibold text-primary">{result.proteinGrams.toFixed(0)}g</p>
                <p className="text-xs text-muted-foreground">Per meal</p>
              </div>
              <div className="p-4 border rounded">
                <p className="text-sm text-muted-foreground">Fiber</p>
                <p className="text-2xl font-semibold text-primary">{result.fiberGrams.toFixed(0)}g</p>
                <p className="text-xs text-muted-foreground">Per meal</p>
              </div>
              <div className="p-4 border rounded">
                <p className="text-sm text-muted-foreground">Satiety index</p>
                <p className="text-2xl font-semibold text-primary">{result.satietyIndex.toFixed(0)}</p>
                <p className="text-xs text-muted-foreground">Out of 100 (higher = better)</p>
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
            <strong>Satiety index</strong> = calculated from protein content (0-35 points, optimal: 20-30g), fiber content (0-30 points, optimal: 5-10g), volume score (0-20 points), and calorie density (0-15 points, inverted).
          </p>
          <p>
            <strong>Components</strong>: Higher protein and fiber increase satiety. Greater volume enhances fullness. Lower calorie density (fewer calories per gram) improves satiety per calorie.
          </p>
          <p>
            <strong>Optimal ranges</strong>: Protein: 20-30g per meal, Fiber: 5-10g per meal, Volume score: 7-10, Satiety index: &gt;75. Higher satiety index indicates better fullness per calorie.
          </p>
          <p>Satiety index reflects how filling a meal is relative to its calories. Meals with adequate protein, fiber, and volume provide better satiety, supporting appetite control and weight management.</p>
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
                <p className="text-sm text-muted-foreground">Target satiety index</p>
                <p className="text-xl font-semibold text-primary">&gt; 75</p>
                <p className="text-xs text-muted-foreground">Optimal range</p>
              </div>
              <div className="p-4 border rounded">
                <p className="text-sm text-muted-foreground">Index score</p>
                <p className="text-xl font-semibold text-primary">{result.indexScore.toFixed(0)}</p>
                <p className="text-xs text-muted-foreground">Out of 100</p>
              </div>
              <div className="p-4 border rounded">
                <p className="text-sm text-muted-foreground">Calorie density</p>
                <p className="text-xl font-semibold text-primary">
                  {(result.calories / (result.proteinGrams + result.fiberGrams + result.volumeScore * 10)).toFixed(1)}
                </p>
                <p className="text-xs text-muted-foreground">Calories per satiety unit</p>
              </div>
            </div>
          ) : (
            <p className="text-sm text-muted-foreground">Enter your meal satiety data to see additional insights.</p>
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
          <p>Satiety index measures how filling a meal is relative to its calorie content. Higher satiety index meals provide more fullness per calorie, supporting appetite control and weight management. Adequate protein (20-30g), fiber (5-10g), and volume enhance satiety.</p>
          <p>Use this calculator to calculate satiety index for meal planning from protein grams, fiber grams, calories, and volume score.</p>
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
          <p>This tool calculates satiety index for meal planning from protein grams, fiber grams, calories, and volume score.</p>
          <p>Outputs include protein grams, fiber grams, calories, volume score, satiety index, index score, status, recommendations, an action plan, and supporting metrics.</p>
          <p>Formula, steps, guide content, related tools, and FAQs ensure humans or AI assistants can interpret the methodology instantly.</p>
        </CardContent>
      </Card>
    </div>
  );
}


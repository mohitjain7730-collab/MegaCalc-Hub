'use client';

import { useState } from 'react';
import Script from 'next/script';
import Link from 'next/link';
import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import { z } from 'zod';
import { UtensilsCrossed, Zap, Target, Activity, Shield } from 'lucide-react';

import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Form, FormControl, FormField, FormItem, FormLabel, FormMessage } from '@/components/ui/form';
import { Input } from '@/components/ui/input';

const formSchema = z.object({
  proteinGrams: z.number({ invalid_type_error: 'Enter protein' }).min(0).max(200),
  carbsGrams: z.number({ invalid_type_error: 'Enter carbs' }).min(0).max(500),
  fatGrams: z.number({ invalid_type_error: 'Enter fat' }).min(0).max(200),
  fiberGrams: z.number({ invalid_type_error: 'Enter fiber' }).min(0).max(100),
  calories: z.number({ invalid_type_error: 'Enter calories' }).min(0).max(3000),
});

type FormValues = z.infer<typeof formSchema>;

type ResultPayload = {
  proteinGrams: number;
  carbsGrams: number;
  fatGrams: number;
  fiberGrams: number;
  calories: number;
  proteinPercent: number;
  carbsPercent: number;
  fatPercent: number;
  balanceScore: number;
  status: 'optimal' | 'good' | 'moderate' | 'low';
  interpretation: string;
  recommendations: string[];
  plan: { label: string; detail: string }[];
};

const steps = [
  'Enter protein (grams) from food label or tracking.',
  'Enter carbohydrates (grams) from food label or tracking.',
  'Enter fat (grams) from food label or tracking.',
  'Enter dietary fiber (grams) from food label or tracking.',
  'Enter total calories from food label or tracking.',
  'Review balanced meal score, macronutrient distribution, and recommendations.',
];

const faqs = [
  {
    question: 'What makes a balanced meal?',
    answer:
      'A balanced meal includes adequate protein, carbohydrates, and fats in appropriate proportions, along with fiber and essential nutrients. Typical recommendations: 20-30% protein, 40-50% carbs, 20-35% fat, with adequate fiber.',
  },
  {
    question: 'How is balanced meal score calculated?',
    answer:
      'Balanced meal score evaluates macronutrient distribution (protein, carbs, fat percentages), fiber content, and calorie appropriateness. Higher scores indicate better balance across all macronutrients and fiber.',
  },
  {
    question: 'What are ideal macronutrient ratios?',
    answer:
      'Ideal ratios vary by goals, but general guidelines: Protein: 20-30% of calories, Carbohydrates: 40-50% of calories, Fat: 20-35% of calories. Individual needs vary based on activity, metabolism, and health goals.',
  },
  {
    question: 'How much fiber should a meal have?',
    answer:
      'Aim for at least 5-10g of fiber per meal, or 25-30g per day. Higher fiber content supports digestive health, blood sugar control, and satiety. Most meals should include fiber-rich foods.',
  },
  {
    question: 'What about meal calories?',
    answer:
      'Meal calories should align with daily calorie needs divided across meals. Typical meals range from 400-800 calories depending on individual needs, activity level, and meal frequency.',
  },
  {
    question: 'How do I balance macronutrients?',
    answer:
      'Balance macronutrients by including protein sources (meat, fish, eggs, legumes), carbohydrate sources (whole grains, vegetables, fruits), healthy fats (nuts, oils, avocados), and fiber-rich foods in each meal.',
  },
  {
    question: 'What about meal timing?',
    answer:
      'While macronutrient balance is important, meal timing also matters. Regular meals with balanced macronutrients support stable blood sugar, energy levels, and metabolic health.',
  },
  {
    question: 'Can I track balanced meals at home?',
    answer:
      'Yes. Use food labels and tracking apps to assess macronutrient distribution. Calculate percentages of calories from each macronutrient and evaluate fiber content to assess meal balance.',
  },
  {
    question: 'What if my meal isn\'t balanced?',
    answer:
      'If a meal isn\'t balanced, adjust future meals to compensate. For example, if one meal is low in protein, ensure other meals include adequate protein. Overall daily balance is also important.',
  },
  {
    question: 'When should I consult a healthcare provider?',
    answer:
      'Consult a healthcare provider or registered dietitian if you need personalized macronutrient guidance, have specific health conditions, or want to optimize meal balance for your individual needs and goals.',
  },
];

const relatedCalculators = [
  {
    name: 'Meal Calorie Breakdown Calculator',
    slug: 'meal-calorie-breakdown-calculator',
    description: 'Break down meal calories alongside balance assessment.',
  },
  {
    name: 'Nutrient Density to Calorie Ratio Calculator',
    slug: 'nutrient-density-to-calorie-ratio-calculator',
    description: 'Assess nutritional quality comprehensively.',
  },
  {
    name: 'Satiety Index Calculator',
    slug: 'satiety-index-calculator',
    description: 'Evaluate satiety alongside meal balance.',
  },
  {
    name: 'Food Diversity Index Calculator',
    slug: 'food-diversity-index-calculator',
    description: 'Assess food variety alongside meal balance.',
  },
];

const baseUrl = 'https://mycalculating.com/category/health-fitness/balanced-meal-score-calculator';

const schemaMarkup = {
  '@context': 'https://schema.org',
  '@graph': [
    {
      '@type': 'BreadcrumbList',
      itemListElement: [
        { '@type': 'ListItem', position: 1, name: 'Home', item: 'https://mycalculating.com' },
        { '@type': 'ListItem', position: 2, name: 'Health & Fitness', item: 'https://mycalculating.com/category/health-fitness' },
        { '@type': 'ListItem', position: 3, name: 'Balanced Meal Score Calculator', item: baseUrl },
      ],
    },
    {
      '@type': 'SoftwareApplication',
      name: 'Balanced Meal Score Calculator',
      applicationCategory: 'Calculator',
      operatingSystem: 'Web Browser',
      description: 'Calculate balanced meal score from protein, carbohydrates, fat, fiber, and calories.',
      url: baseUrl,
      offers: { '@type': 'Offer', price: '0', priceCurrency: 'USD' },
    },
  ],
};

const clamp = (value: number, min: number, max: number) => Math.min(max, Math.max(min, value));

const calculateResult = (values: FormValues): ResultPayload => {
  const proteinGrams = values.proteinGrams;
  const carbsGrams = values.carbsGrams;
  const fatGrams = values.fatGrams;
  const fiberGrams = values.fiberGrams;
  const calories = values.calories;
  
  // Calculate calories from macronutrients
  const proteinCalories = proteinGrams * 4;
  const carbsCalories = carbsGrams * 4;
  const fatCalories = fatGrams * 9;
  const totalMacroCalories = proteinCalories + carbsCalories + fatCalories;
  
  // Calculate percentages
  const proteinPercent = calories > 0 ? (proteinCalories / calories) * 100 : 0;
  const carbsPercent = calories > 0 ? (carbsCalories / calories) * 100 : 0;
  const fatPercent = calories > 0 ? (fatCalories / calories) * 100 : 0;
  
  // Calculate balance score (0-100, higher = better)
  let balanceScore = 50;
  
  // Protein component (0-30 points, optimal: 20-30%)
  if (proteinPercent >= 20 && proteinPercent <= 30) {
    balanceScore += 25;
  } else if (proteinPercent >= 15 && proteinPercent < 20) {
    balanceScore += 15;
  } else if (proteinPercent >= 30 && proteinPercent <= 35) {
    balanceScore += 20;
  } else if (proteinPercent < 10) {
    balanceScore -= 20;
  } else {
    balanceScore += 5;
  }
  
  // Carbs component (0-30 points, optimal: 40-50%)
  if (carbsPercent >= 40 && carbsPercent <= 50) {
    balanceScore += 25;
  } else if (carbsPercent >= 35 && carbsPercent < 40) {
    balanceScore += 15;
  } else if (carbsPercent >= 50 && carbsPercent <= 60) {
    balanceScore += 20;
  } else if (carbsPercent < 25) {
    balanceScore -= 15;
  } else {
    balanceScore += 5;
  }
  
  // Fat component (0-30 points, optimal: 20-35%)
  if (fatPercent >= 20 && fatPercent <= 35) {
    balanceScore += 25;
  } else if (fatPercent >= 15 && fatPercent < 20) {
    balanceScore += 15;
  } else if (fatPercent >= 35 && fatPercent <= 40) {
    balanceScore += 20;
  } else if (fatPercent < 10) {
    balanceScore -= 15;
  } else {
    balanceScore += 5;
  }
  
  // Fiber component (0-10 points, optimal: 5-10g per meal)
  if (fiberGrams >= 5 && fiberGrams <= 10) {
    balanceScore += 8;
  } else if (fiberGrams >= 3 && fiberGrams < 5) {
    balanceScore += 5;
  } else if (fiberGrams > 10) {
    balanceScore += 10;
  } else if (fiberGrams < 2) {
    balanceScore -= 10;
  } else {
    balanceScore += 2;
  }
  
  balanceScore = clamp(balanceScore, 0, 100);

  let status: ResultPayload['status'] = 'optimal';
  let interpretation = 'Your meal is well-balanced with appropriate macronutrient distribution and fiber content. This supports optimal nutrition and metabolic health.';

  if (balanceScore < 40) {
    status = 'low';
    interpretation = 'Your meal balance is poor. The macronutrient distribution or fiber content needs improvement. Consider adjusting proportions to include adequate protein, carbs, fat, and fiber.';
  } else if (balanceScore < 60) {
    status = 'moderate';
    interpretation = 'Your meal balance is moderate. Consider adjusting macronutrient proportions or increasing fiber content to improve meal balance and nutritional quality.';
  } else if (balanceScore < 80) {
    status = 'good';
    interpretation = 'Your meal balance is good. Continue including balanced macronutrients and fiber to maintain optimal meal composition.';
  }

  const recommendations = [
    'Include all macronutrients: ensure each meal contains adequate protein (20-30% of calories), carbohydrates (40-50% of calories), and healthy fats (20-35% of calories) for balanced nutrition.',
    'Add fiber to meals: aim for at least 5-10g of fiber per meal from vegetables, fruits, whole grains, and legumes to support digestive health and blood sugar control.',
    'Balance throughout the day: if one meal isn\'t perfectly balanced, adjust other meals to ensure overall daily macronutrient and fiber intake meets recommendations.',
  ];
  if (status === 'low' || status === 'moderate') {
    recommendations.push('Improve meal balance by adjusting macronutrient proportions. Ensure adequate protein, carbohydrates, and fats, and include fiber-rich foods to enhance nutritional quality.');
  }
  if (proteinPercent < 15) {
    recommendations.push('Increase protein content. Protein should comprise 20-30% of calories. Include lean meats, fish, eggs, legumes, or dairy to improve meal balance.');
  }
  if (fiberGrams < 3) {
    recommendations.push('Increase fiber content. Aim for at least 5-10g of fiber per meal. Include vegetables, fruits, whole grains, and legumes to improve meal balance and nutritional quality.');
  }

  const plan = [
    { label: 'This Week', detail: 'Calculate balanced meal scores for your meals. Assess macronutrient distribution and fiber content, and identify opportunities to improve meal balance.' },
    { label: 'This Month', detail: 'Optimize meal composition: ensure balanced macronutrients (protein, carbs, fat) and adequate fiber in each meal to support optimal nutrition and metabolic health.' },
    { label: 'Ongoing', detail: 'Monitor meal balance through regular assessment. Maintain balanced macronutrient distribution and fiber content to support optimal nutrition and health goals.' },
  ];

  return { proteinGrams, carbsGrams, fatGrams, fiberGrams, calories, proteinPercent, carbsPercent, fatPercent, balanceScore, status, interpretation, recommendations, plan };
};

export default function BalancedMealScoreCalculator() {
  const [result, setResult] = useState<ResultPayload | null>(null);

  const form = useForm<FormValues>({
    resolver: zodResolver(formSchema),
    defaultValues: {
      proteinGrams: undefined,
      carbsGrams: undefined,
      fatGrams: undefined,
      fiberGrams: undefined,
      calories: undefined,
    },
  });

  return (
    <div className="space-y-8">
      <Script id="balanced-meal-schema" type="application/ld+json" strategy="afterInteractive" dangerouslySetInnerHTML={{ __html: JSON.stringify(schemaMarkup) }} />

      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <UtensilsCrossed className="h-5 w-5" />
            Balanced Meal Score Calculator
          </CardTitle>
          <CardDescription>Calculate balanced meal score from protein, carbohydrates, fat, fiber, and calories.</CardDescription>
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
                  name="proteinGrams"
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel>Protein (grams)</FormLabel>
                      <FormControl>
                        <Input type="number" step="0.1" placeholder="e.g., 30" value={field.value ?? ''} onChange={(e) => field.onChange(e.target.value === '' ? undefined : Number(e.target.value))} />
                      </FormControl>
                      <FormMessage />
                    </FormItem>
                  )}
                />
                <FormField
                  control={form.control}
                  name="carbsGrams"
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel>Carbohydrates (grams)</FormLabel>
                      <FormControl>
                        <Input type="number" step="0.1" placeholder="e.g., 50" value={field.value ?? ''} onChange={(e) => field.onChange(e.target.value === '' ? undefined : Number(e.target.value))} />
                      </FormControl>
                      <FormMessage />
                    </FormItem>
                  )}
                />
                <FormField
                  control={form.control}
                  name="fatGrams"
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel>Fat (grams)</FormLabel>
                      <FormControl>
                        <Input type="number" step="0.1" placeholder="e.g., 15" value={field.value ?? ''} onChange={(e) => field.onChange(e.target.value === '' ? undefined : Number(e.target.value))} />
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
                        <Input type="number" step="0.1" placeholder="e.g., 8" value={field.value ?? ''} onChange={(e) => field.onChange(e.target.value === '' ? undefined : Number(e.target.value))} />
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
              </div>
              <Button type="submit" className="w-full md:w-auto">
                Calculate balance score
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
            <CardDescription>See balanced meal score, macronutrient distribution, and recommendations.</CardDescription>
          </CardHeader>
          <CardContent className="space-y-6">
            <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
              <div className="p-4 border rounded">
                <p className="text-sm text-muted-foreground">Balance score</p>
                <p className="text-2xl font-semibold text-primary">{result.balanceScore.toFixed(0)}</p>
                <p className="text-xs text-muted-foreground">Out of 100</p>
              </div>
              <div className="p-4 border rounded">
                <p className="text-sm text-muted-foreground">Protein</p>
                <p className="text-2xl font-semibold text-primary">{result.proteinPercent.toFixed(1)}%</p>
                <p className="text-xs text-muted-foreground">Of calories</p>
              </div>
              <div className="p-4 border rounded">
                <p className="text-sm text-muted-foreground">Carbs</p>
                <p className="text-2xl font-semibold text-primary">{result.carbsPercent.toFixed(1)}%</p>
                <p className="text-xs text-muted-foreground">Of calories</p>
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
            <strong>Macronutrient percentages</strong> = (calories from each macronutrient / total calories) × 100. Protein and carbs: 4 cal/g, Fat: 9 cal/g.
          </p>
          <p>
            <strong>Balance score</strong> = calculated from protein (0-30 points, optimal: 20-30%), carbs (0-30 points, optimal: 40-50%), fat (0-30 points, optimal: 20-35%), and fiber (0-10 points, optimal: 5-10g per meal). Higher scores indicate better balance.
          </p>
          <p>
            <strong>Optimal ranges</strong>: Protein: 20-30% of calories, Carbohydrates: 40-50% of calories, Fat: 20-35% of calories, Fiber: 5-10g per meal.
          </p>
          <p>Balanced meals include adequate protein, carbohydrates, and fats in appropriate proportions, along with fiber. This supports optimal nutrition, blood sugar control, and metabolic health.</p>
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
                <p className="text-sm text-muted-foreground">Fat</p>
                <p className="text-xl font-semibold text-primary">{result.fatPercent.toFixed(1)}%</p>
                <p className="text-xs text-muted-foreground">Of calories</p>
              </div>
              <div className="p-4 border rounded">
                <p className="text-sm text-muted-foreground">Fiber</p>
                <p className="text-xl font-semibold text-primary">{result.fiberGrams.toFixed(1)}g</p>
                <p className="text-xs text-muted-foreground">Per meal</p>
              </div>
              <div className="p-4 border rounded">
                <p className="text-sm text-muted-foreground">Score category</p>
                <p className="text-xl font-semibold text-primary">
                  {result.balanceScore >= 80 ? 'Excellent' : result.balanceScore >= 60 ? 'Good' : result.balanceScore >= 40 ? 'Moderate' : 'Needs Improvement'}
                </p>
                <p className="text-xs text-muted-foreground">Based on score</p>
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
          <p>A balanced meal includes adequate protein (20-30% of calories), carbohydrates (40-50% of calories), and healthy fats (20-35% of calories), along with fiber (5-10g per meal). Balanced meals support optimal nutrition, blood sugar control, and metabolic health.</p>
          <p>Use this calculator to calculate balanced meal score from protein, carbohydrates, fat, fiber, and calories.</p>
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
          <p>This tool calculates balanced meal score from protein, carbohydrates, fat, fiber, and calories.</p>
          <p>Outputs include protein, carbs, fat, fiber, calories, macronutrient percentages, balance score, status, recommendations, an action plan, and supporting metrics.</p>
          <p>Formula, steps, guide content, related tools, and FAQs ensure humans or AI assistants can interpret the methodology instantly.</p>
        </CardContent>
      </Card>
    </div>
  );
}


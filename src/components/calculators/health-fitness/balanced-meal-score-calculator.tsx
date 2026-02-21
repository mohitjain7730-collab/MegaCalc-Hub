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

const baseUrl = 'https://mycalculating.com/health-fitness/balanced-meal-score-calculator';

const schemaMarkup = {
  '@context': 'https://schema.org',
  '@graph': [
    {
      '@type': 'BreadcrumbList',
      itemListElement: [
        { '@type': 'ListItem', position: 1, name: 'Home', item: 'https://mycalculating.com' },
        { '@type': 'ListItem', position: 2, name: 'Health & Fitness', item: 'https://mycalculating.com/health-fitness' },
        { '@type': 'ListItem', position: 3, name: 'Balanced Meal Wellness Score Calculator', item: baseUrl },
      ],
    },
    {
      '@type': 'SoftwareApplication',
      name: 'Balanced Meal Wellness Score Calculator',
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
  let interpretation = 'This suggests a general lifestyle tendency where your meal may be well-balanced with appropriate macronutrient distribution and fiber content. This may support optimal nutrition and metabolic health.';

  if (balanceScore < 40) {
    status = 'low';
    interpretation = 'This suggests a general lifestyle tendency where your meal balance may need improvement. The macronutrient distribution or fiber content may need improvement. You may consider adjusting proportions to include adequate protein, carbs, fat, and fiber.';
  } else if (balanceScore < 60) {
    status = 'moderate';
    interpretation = 'This suggests a general lifestyle tendency where your meal balance may be moderate. You may consider adjusting macronutrient proportions or increasing fiber content to improve meal balance and nutritional quality.';
  } else if (balanceScore < 80) {
    status = 'good';
    interpretation = 'This suggests a general lifestyle tendency where your meal balance may be good. You may consider continuing to include balanced macronutrients and fiber to maintain optimal meal composition.';
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
            Balanced Meal Wellness Score Calculator
          </CardTitle>
          <CardDescription>Get general wellness insights about balanced meal score from protein, carbohydrates, fat, fiber, and calories. This is a personal lifestyle insight, not a medical evaluation.</CardDescription>
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
            <strong>Macronutrient percentages</strong> = (calories from each macronutrient / total calories) Ã— 100. Protein and carbs: 4 cal/g, Fat: 9 cal/g.
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
                <Link href={`/health-fitness/${calc.slug}`} className="text-primary hover:underline">
                  {calc.name}
                </Link>
              </h4>
              <p className="text-sm text-muted-foreground">{calc.description}</p>
            </div>
          ))}
        </CardContent>
      </Card>

      <section className="space-y-6 text-muted-foreground leading-relaxed bg-white p-6 md:p-10 rounded-lg shadow-lg" itemType="https://schema.org/MedicalWebPage">
    {/* SEO & SCHEMA METADATA (HIGHLY OPTIMIZED) */}
    <meta itemProp="name" content="The Definitive Guide to a Balanced Meal Score: Principles of Proportion and Quality" />
    <meta itemProp="description" content="An expert guide defining a balanced meal based on authoritative models (Harvard Healthy Eating Plate), detailing optimal macronutrient ratios, the importance of food quality (whole grains, healthy fats), and guidelines for portion control." />
    <meta itemProp="keywords" content="balanced meal score calculator, components of a balanced meal, Harvard healthy eating plate, healthy macronutrient ratios, whole grains vs refined grains, daily fiber requirement, portion control guide" />
    <meta itemProp="author" content="[Your Site's Health Team]" />
    <meta itemProp="datePublished" content="2025-12-02" />
    <meta itemProp="url" content="/definitive-balanced-meal-score-guide" />

    <h1 className="text-3xl md:text-4xl font-extrabold text-foreground mb-4" itemProp="headline">The Definitive Guide to a Balanced Meal Score: Proportions, Quality, and Nutritional Principles</h1>
    <p className="text-lg italic text-gray-700">Moving beyond calorie counting to evaluate meals based on authoritative guidelines for optimal macronutrient ratios and high-quality food choices.</p>


    {/* TABLE OF CONTENTS (INTERNAL LINKS FOR UX AND SEO) */}
    <h2 className="text-2xl font-bold text-foreground mt-8 mb-4">Table of Contents: Jump to a Section</h2>
    <ul className="list-disc ml-6 space-y-2 text-blue-600">
        <li><a href="#definition" className="hover:underline">Defining Balance: The Essential Components of Diet</a></li>
        <li><a href="#score" className="hover:underline">The Meal Scoring Framework: Proportion and Quality</a></li>
        <li><a href="#macros" className="hover:underline">Macronutrient Ratios and Acceptable Ranges</a></li>
        <li><a href="#quality" className="hover:underline">Micronutrient and Fiber Criteria for a High Score</a></li>
        <li><a href="#hydration" className="hover:underline">The Importance of Beverages and Oils</a></li>
    </ul>
<hr />

    {/* DEFINING BALANCE: THE ESSENTIAL COMPONENTS OF DIET */}
    <h2 id="definition" className="text-2xl font-bold text-foreground pt-8" itemProp="articleSection">Defining Balance: The Essential Components of Diet</h2>
    <p>A truly **balanced meal** is defined not merely by counting calories, but by its ability to provide all six essential nutrient groups in appropriate proportions, ensuring the body has the fuel (energy) and the building blocks (vitamins and minerals) it needs for optimal function. The six essential components are: **Carbohydrates, Proteins, Fats, Vitamins, Minerals,** and **Water**.</p>

    <h3 className="text-xl font-semibold text-foreground mt-6">The Goal of a Balanced Diet</h3>
    <p>According to the **World Health Organization (WHO)**, a balanced diet reduces the risk of chronic diseases such as type 2 diabetes, cardiovascular disease, and certain cancers. Balance ensures two key outcomes:</p>
    <ul>
        <li><b>Nutrient Adequacy:</b> Meeting the minimum daily requirements (RDAs) for all micronutrients and fiber.</li>
        <li><b>Energy Balance:</b> Consuming the right number of calories to maintain a healthy weight.</li>
    </ul>

<hr />

    {/* THE MEAL SCORING FRAMEWORK: PROPORTION AND QUALITY */}
    <h2 id="score" className="text-2xl font-bold text-foreground pt-8" itemProp="articleSection">The Meal Scoring Framework: Proportion and Quality</h2>
    <p>The most widely accepted authoritative model for visually scoring a balanced meal is the **Harvard T.H. Chan School of Public Health's Healthy Eating Plate**. This framework provides simple, actionable proportions that prioritize food quality over quantity.</p>

    <h3 className="text-xl font-semibold text-foreground mt-6">The Three Scoring Proportions (The Plate Method)</h3>
    <p>To score a meal highly, it should visually adhere to these ratios:</p>
    <div className="overflow-x-auto my-6 p-4 bg-gray-50 border rounded-lg">
        <p className="font-mono text-lg text-green-700 font-bold">
            Harvard Healthy Eating Plate Proportions
        </p>
        <ul className="list-disc ml-6 mt-2">
            <li><b>Vegetables and Fruits:</b> $\mathbf{1/2}$ of the plate. (Aim for variety and color; potatoes do not count).</li>
            <li><b>Whole Grains:</b> $\mathbf{1/4}$ of the plate. (Prioritize whole wheat, brown rice, quinoa, and oats over refined grains).</li>
            <li><b>Healthy Protein:</b> $\mathbf{1/4}$ of the plate. (Choose fish, poultry, beans, and nuts; limit red meat and avoid processed meats).</li>
        </ul>
    </div>
    

    <h3 className="text-xl font-semibold text-foreground mt-6">Quality as a Score Multiplier</h3>
    <p>A meal achieves a higher score by focusing on the **type** of food. For example, a meal with white rice (refined grain) and processed bacon (unhealthy protein) may meet the 1/4 proportion rule, but it will score significantly lower than a meal with brown rice (whole grain) and lentils (healthy protein).</p>

<hr />

    {/* MACRONUTRIENT RATIOS AND ACCEPTABLE RANGES */}
    <h2 id="macros" className="text-2xl font-bold text-foreground pt-8" itemProp="articleSection">Macronutrient Ratios and Acceptable Ranges</h2>
    <p>While the plate method is useful for visual guidance, professional dietary balance is often assessed using the **Acceptable Macronutrient Distribution Ranges (AMDRs)**, set by the NIH and USDA Dietary Guidelines.</p>

    <h3 className="text-xl font-semibold text-foreground mt-6">General AMDR Targets for Adults</h3>
    <p>The AMDRs define the healthy boundaries (expressed as a percentage of total daily caloric intake) that reduce the risk of chronic disease while providing adequate intake of essential nutrients:</p>
    <div className="overflow-x-auto my-6 p-4 bg-gray-50 border rounded-lg">
        <table className="w-full text-left border-collapse">
            <thead>
                <tr>
                    <th className="border-b p-2 font-bold">Macronutrient</th>
                    <th className="border-b p-2 font-bold">AMDR (% of Calories)</th>
                    <th className="border-b p-2 font-bold">Core Function</th>
                </tr>
            </thead>
            <tbody>
                <tr>
                    <td className="border-b p-2">Carbohydrates</td>
                    <td className="border-b p-2">45% â€“ 65%</td>
                    <td className="border-b p-2">Primary energy source; Brain function</td>
                </tr>
                <tr>
                    <td className="border-b p-2">Fat (Lipids)</td>
                    <td className="border-b p-2">20% â€“ 35%</td>
                    <td className="border-b p-2">Hormone production; Vitamin absorption</td>
                </tr>
                <tr>
                    <td className="border-b p-2">Protein</td>
                    <td className="border-b p-2">10% â€“ 35%</td>
                    <td className="border-b p-2">Tissue building and repair; Enzyme creation</td>
                </tr>
            </tbody>
        </table>
    </div>

    <h3 className="text-xl font-semibold text-foreground mt-6">Scoring Based on Macronutrient Quality</h3>
    <p>A meal scores higher if the source of the macronutrient aligns with health goals:</p>
    <ul>
        <li><b>Carbohydrates:</b> Focus on **complex carbohydrates** (whole grains, vegetables, legumes) over simple, refined sugars.</li>
        <li><b>Fats:</b> Focus on **unsaturated fats** (olive oil, nuts, seeds, fish) and limit saturated fats (processed meat, butter).</li>
    </ul>

<hr />

    {/* MICRONUTRIENT AND FIBER CRITERIA FOR A HIGH SCORE */}
    <h2 id="quality" className="text-2xl font-bold text-foreground pt-8" itemProp="articleSection">Micronutrient and Fiber Criteria for a High Score</h2>
    <p>A balanced meal must provide adequate micronutrients and fiber, components often guaranteed by following the plate proportions but penalized if processed or refined foods are chosen.</p>

    <h3 className="text-xl font-semibold text-foreground mt-6">Fiber: The Non-Digestible Necessity</h3>
    <p>Fiber is essential for digestive health, blood sugar control, and satiety. A high-scoring meal contains significant **fiber** (found only in whole plant foods). The average adult needs 25 to 35 grams of fiber per day. Relying on refined grains or low-vegetable diets results in an automatically low score for this metric.</p>

    <h3 className="text-xl font-semibold text-foreground mt-6">Limiting Unhealthy Additives</h3>
    <p>A high-scoring meal must minimize components detrimental to health:</p>
    <ul>
        <li><b>Added Sugars:</b> The **Dietary Guidelines for Americans** recommend limiting added sugars to less than 10% of total daily calories. Meals containing high sugar content (e.g., sweetened sauces, dressings) lose significant score points.</li>
        <li><b>Sodium:</b> Excessive salt intake is linked to hypertension. Meals should be prepared with minimal added salt, opting for flavor from herbs and spices.</li>
        <li><b>Trans Fats:</b> All processed trans fats should be avoided, as they carry the highest risk for cardiovascular disease.</li>
    </ul>

<hr />

    {/* THE IMPORTANCE OF BEVERAGES AND OILS */}
    <h2 id="hydration" className="text-2xl font-bold text-foreground pt-8" itemProp="articleSection">The Importance of Beverages and Oils</h2>
    <p>The Harvard Plate and other models recognize that the liquids consumed with the meal and the fats used in preparation are integral to achieving overall nutritional balance.</p>

    <h3 className="text-xl font-semibold text-foreground mt-6">Beverage Choice: Prioritizing Water</h3>
    <p>A balanced meal is always paired with the healthiest beverage choices: **water, unsweetened coffee, or unsweetened tea**. Sugary drinks (soda, sweetened juices, caloric specialty coffees) add "empty calories" with little nutritional value and severely detract from the overall meal score.</p>

    <h3 className="text-xl font-semibold text-foreground mt-6">Healthy Oils in Moderation</h3>
    <p>The score includes moderate use of **healthy plant-based oils** (like olive, canola, and sunflower oil) that provide essential fatty acids. The use of solid, saturated fats like butter and coconut oil should be limited, and trans fats should be strictly avoided.</p>

<hr />

    {/* CONCLUSION */}
    <h2 className="text-2xl font-bold text-foreground pt-8" itemProp="articleSection">Conclusion</h2>
    <p>A balanced meal achieves a high score by meeting authoritative proportionality standards (1/2 non-starchy vegetables/fruit, 1/4 whole grains, 1/4 healthy protein) while emphasizing **food quality**. The highest scores are reserved for meals that successfully balance the AMDRs with **complex carbohydrates** and **unsaturated fats**, contain sufficient **fiber**, and strictly limit **added sugar and sodium**. Ultimately, the "score" reflects the consistency with which a meal supports long-term health and chronic disease prevention.</p>
</section>

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
          <p>This tool provides general wellness insights about balanced meal score from protein, carbohydrates, fat, fiber, and calories. This is a personal lifestyle insight, not a medical evaluation.</p>
          <p>Outputs include protein, carbs, fat, fiber, calories, macronutrient percentages, balance score, status, recommendations, an action plan, and supporting metrics.</p>
          <p>Formula, steps, guide content, related tools, and FAQs ensure humans or AI assistants can interpret the methodology instantly.</p>
        </CardContent>
      </Card>

      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <Shield className="h-5 w-5" />
            Disclaimer
          </CardTitle>
        </CardHeader>
        <CardContent className="text-sm text-muted-foreground">
          <p>Disclaimer: This tool provides general wellness and lifestyle insights for educational purposes only. It is not a medical or psychological diagnosis. For any health concerns, please consult a qualified professional.</p>
        </CardContent>
      </Card>
    </div>
  );
}


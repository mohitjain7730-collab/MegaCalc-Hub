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
  totalCalories: z.number({ invalid_type_error: 'Enter total calories' }).min(1).max(2000),
  proteinPercent: z.number({ invalid_type_error: 'Enter protein percentage' }).min(0).max(100),
  carbPercent: z.number({ invalid_type_error: 'Enter carb percentage' }).min(0).max(100),
  fatPercent: z.number({ invalid_type_error: 'Enter fat percentage' }).min(0).max(100),
});

type FormValues = z.infer<typeof formSchema>;

type ResultPayload = {
  totalCalories: number;
  proteinPercent: number;
  carbPercent: number;
  fatPercent: number;
  proteinCalories: number;
  carbCalories: number;
  fatCalories: number;
  proteinGrams: number;
  carbGrams: number;
  fatGrams: number;
  status: 'optimal' | 'good' | 'moderate' | 'low';
  interpretation: string;
  recommendations: string[];
  plan: { label: string; detail: string }[];
};

const steps = [
  'Enter total calories for the meal from food tracking or calculation.',
  'Enter protein percentage (%) of total calories from meal composition.',
  'Enter carbohydrate percentage (%) of total calories from meal composition.',
  'Enter fat percentage (%) of total calories from meal composition.',
  'Review meal calorie breakdown, macronutrient distribution, and recommendations.',
];

const faqs = [
  {
    question: 'How are macronutrients calculated from percentages?',
    answer:
      'Macronutrient calories = total calories × percentage / 100. Grams are calculated using: protein = 4 cal/g, carbs = 4 cal/g, fat = 9 cal/g. Percentages should sum to approximately 100%.',
  },
  {
    question: 'What are typical macronutrient distributions?',
    answer:
      'Typical distributions vary by goals: Balanced: 30% protein, 40% carbs, 30% fat. High protein: 40% protein, 30% carbs, 30% fat. Low carb: 30% protein, 20% carbs, 50% fat. Individual needs vary.',
  },
  {
    question: 'How do I calculate macronutrient percentages?',
    answer:
      'Calculate percentages from grams: protein % = (protein grams × 4 / total calories) × 100. Carb % = (carb grams × 4 / total calories) × 100. Fat % = (fat grams × 9 / total calories) × 100.',
  },
  {
    question: 'What is a balanced meal breakdown?',
    answer:
      'A balanced meal typically includes adequate protein (20-30%), carbohydrates (40-50%), and fats (25-35%). The exact distribution depends on individual goals, activity level, and dietary preferences.',
  },
  {
    question: 'How does meal breakdown affect health?',
    answer:
      'Meal breakdown affects satiety, energy levels, blood sugar control, muscle maintenance, and overall nutrition. Balanced macronutrient distribution supports optimal health and performance.',
  },
  {
    question: 'What about meal timing?',
    answer:
      'Meal timing can affect how macronutrients are utilized. Protein throughout the day supports muscle maintenance. Carbs around exercise can support performance. Individual needs vary.',
  },
  {
    question: 'Can I track macronutrients at home?',
    answer:
      'Yes. Use food labels, nutrition databases, and tracking apps to calculate macronutrient breakdown. Weighing foods and tracking portions helps ensure accuracy in macronutrient calculations.',
  },
  {
    question: 'What if percentages don\'t add up to 100%?',
    answer:
      'Percentages should sum to approximately 100%. Small variations are normal due to rounding. If significantly off, recalculate to ensure accuracy. Some foods contain fiber or alcohol that affect calculations.',
  },
  {
    question: 'How do I adjust meal breakdown?',
    answer:
      'Adjust meal breakdown by modifying food choices: increase protein by adding lean meats, eggs, or legumes; adjust carbs by changing grain/vegetable portions; modify fats by adjusting oils, nuts, or avocados.',
  },
  {
    question: 'When should I consult a healthcare provider?',
    answer:
      'Consult a healthcare provider or registered dietitian if you need personalized macronutrient guidance, have specific health conditions, or are making significant dietary changes.',
  },
];

const relatedCalculators = [
  {
    name: 'Glycemic Index Meal Blender Calculator',
    slug: 'glycemic-index-meal-blender-calculator',
    description: 'Assess meal glycemic impact alongside calorie breakdown.',
  },
  {
    name: 'Insulin Response Estimator',
    slug: 'insulin-response-estimator',
    description: 'Evaluate insulin response from meal composition.',
  },
  {
    name: 'Satiety Index Calculator',
    slug: 'satiety-index-calculator',
    description: 'Assess satiety alongside macronutrient breakdown.',
  },
  {
    name: 'Nutrient Density to Calorie Ratio Calculator',
    slug: 'nutrient-density-to-calorie-ratio-calculator',
    description: 'Evaluate nutritional quality comprehensively.',
  },
];

const baseUrl = 'https://mycalculating.com/category/health-fitness/meal-calorie-breakdown-calculator';

const schemaMarkup = {
  '@context': 'https://schema.org',
  '@graph': [
    {
      '@type': 'BreadcrumbList',
      itemListElement: [
        { '@type': 'ListItem', position: 1, name: 'Home', item: 'https://mycalculating.com' },
        { '@type': 'ListItem', position: 2, name: 'Health & Fitness', item: 'https://mycalculating.com/category/health-fitness' },
        { '@type': 'ListItem', position: 3, name: 'Meal Calorie Breakdown Calculator', item: baseUrl },
      ],
    },
    {
      '@type': 'SoftwareApplication',
      name: 'Meal Calorie Breakdown Calculator',
      applicationCategory: 'Calculator',
      operatingSystem: 'Web Browser',
      description: 'Calculate meal calorie breakdown by protein, carbohydrate, and fat percentages.',
      url: baseUrl,
      offers: { '@type': 'Offer', price: '0', priceCurrency: 'USD' },
    },
  ],
};

const clamp = (value: number, min: number, max: number) => Math.min(max, Math.max(min, value));

const calculateResult = (values: FormValues): ResultPayload => {
  const totalCalories = values.totalCalories;
  const proteinPercent = values.proteinPercent;
  const carbPercent = values.carbPercent;
  const fatPercent = values.fatPercent;
  
  // Calculate calories from each macronutrient
  const proteinCalories = (totalCalories * proteinPercent) / 100;
  const carbCalories = (totalCalories * carbPercent) / 100;
  const fatCalories = (totalCalories * fatPercent) / 100;
  
  // Calculate grams: protein and carbs = 4 cal/g, fat = 9 cal/g
  const proteinGrams = proteinCalories / 4;
  const carbGrams = carbCalories / 4;
  const fatGrams = fatCalories / 9;
  
  // Assess balance
  const totalPercent = proteinPercent + carbPercent + fatPercent;
  const isBalanced = Math.abs(totalPercent - 100) < 5; // Within 5% of 100
  
  let status: ResultPayload['status'] = 'optimal';
  let interpretation = 'Your meal calorie breakdown appears balanced. Continue maintaining appropriate macronutrient distribution.';

  if (!isBalanced || totalPercent < 80 || totalPercent > 120) {
    status = 'low';
    interpretation = 'Your meal calorie breakdown percentages do not sum correctly. Please recalculate to ensure protein, carb, and fat percentages sum to approximately 100%.';
  } else if (proteinPercent < 10 || carbPercent < 20 || fatPercent < 10) {
    status = 'moderate';
    interpretation = 'Your meal calorie breakdown may be imbalanced. Consider adjusting macronutrient distribution to ensure adequate protein, carbohydrates, and fats.';
  } else if (proteinPercent > 50 || carbPercent > 70 || fatPercent > 50) {
    status = 'moderate';
    interpretation = 'Your meal calorie breakdown is highly skewed toward one macronutrient. Consider a more balanced distribution unless following a specific dietary approach.';
  } else if (proteinPercent >= 20 && proteinPercent <= 35 && carbPercent >= 35 && carbPercent <= 55 && fatPercent >= 20 && fatPercent <= 35) {
    status = 'optimal';
    interpretation = 'Your meal calorie breakdown is well-balanced with appropriate distribution of protein, carbohydrates, and fats.';
  } else {
    status = 'good';
    interpretation = 'Your meal calorie breakdown is reasonable. Consider optimizing distribution based on your goals and dietary needs.';
  }

  const recommendations = [
    'Aim for balanced macronutrient distribution: typically 20-30% protein, 40-50% carbohydrates, and 25-35% fats for most individuals, adjusting based on goals and activity level.',
    'Ensure adequate protein intake: protein supports muscle maintenance, satiety, and metabolic function. Aim for at least 20% of calories from protein.',
    'Include appropriate carbohydrates: carbs provide energy and support physical activity. Include 35-50% of calories from carbohydrates, adjusting based on activity level.',
  ];
  if (!isBalanced) {
    recommendations.push('Recalculate macronutrient percentages to ensure they sum to approximately 100%. Accurate breakdown requires correct percentage calculations.');
  }
  if (proteinPercent < 15) {
    recommendations.push('Increase protein percentage. Adequate protein (typically 20-30% of calories) supports muscle maintenance, satiety, and metabolic health.');
  }
  if (fatPercent < 15) {
    recommendations.push('Include adequate healthy fats. Fats (typically 25-35% of calories) support hormone production, nutrient absorption, and satiety.');
  }

  const plan = [
    { label: 'This Week', detail: 'Calculate meal calorie breakdowns for your meals. Track macronutrient distribution and assess balance across meals.' },
    { label: 'This Month', detail: 'Optimize meal composition: adjust macronutrient percentages to meet your goals, ensure balanced distribution, and support nutritional needs.' },
    { label: 'Ongoing', detail: 'Monitor meal calorie breakdowns through regular tracking. Maintain appropriate macronutrient distribution to support health and performance goals.' },
  ];

  return { totalCalories, proteinPercent, carbPercent, fatPercent, proteinCalories, carbCalories, fatCalories, proteinGrams, carbGrams, fatGrams, status, interpretation, recommendations, plan };
};

export default function MealCalorieBreakdownCalculator() {
  const [result, setResult] = useState<ResultPayload | null>(null);

  const form = useForm<FormValues>({
    resolver: zodResolver(formSchema),
    defaultValues: {
      totalCalories: undefined,
      proteinPercent: undefined,
      carbPercent: undefined,
      fatPercent: undefined,
    },
  });

  return (
    <div className="space-y-8">
      <Script id="meal-breakdown-schema" type="application/ld+json" strategy="afterInteractive" dangerouslySetInnerHTML={{ __html: JSON.stringify(schemaMarkup) }} />

      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <Utensils className="h-5 w-5" />
            Meal Calorie Breakdown Calculator
          </CardTitle>
          <CardDescription>Calculate meal calorie breakdown by protein, carbohydrate, and fat percentages.</CardDescription>
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
                  name="totalCalories"
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel>Total calories</FormLabel>
                      <FormControl>
                        <Input type="number" step="1" placeholder="e.g., 500" value={field.value ?? ''} onChange={(e) => field.onChange(e.target.value === '' ? undefined : Number(e.target.value))} />
                      </FormControl>
                      <FormMessage />
                    </FormItem>
                  )}
                />
                <FormField
                  control={form.control}
                  name="proteinPercent"
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel>Protein percentage (%)</FormLabel>
                      <FormControl>
                        <Input type="number" step="1" placeholder="e.g., 30" value={field.value ?? ''} onChange={(e) => field.onChange(e.target.value === '' ? undefined : Number(e.target.value))} />
                      </FormControl>
                      <FormMessage />
                    </FormItem>
                  )}
                />
                <FormField
                  control={form.control}
                  name="carbPercent"
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel>Carbohydrate percentage (%)</FormLabel>
                      <FormControl>
                        <Input type="number" step="1" placeholder="e.g., 40" value={field.value ?? ''} onChange={(e) => field.onChange(e.target.value === '' ? undefined : Number(e.target.value))} />
                      </FormControl>
                      <FormMessage />
                    </FormItem>
                  )}
                />
                <FormField
                  control={form.control}
                  name="fatPercent"
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel>Fat percentage (%)</FormLabel>
                      <FormControl>
                        <Input type="number" step="1" placeholder="e.g., 30" value={field.value ?? ''} onChange={(e) => field.onChange(e.target.value === '' ? undefined : Number(e.target.value))} />
                      </FormControl>
                      <FormMessage />
                    </FormItem>
                  )}
                />
              </div>
              <Button type="submit" className="w-full md:w-auto">
                Calculate meal breakdown
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
            <CardDescription>See meal calorie breakdown, macronutrient distribution, and recommendations.</CardDescription>
          </CardHeader>
          <CardContent className="space-y-6">
            <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
              <div className="p-4 border rounded">
                <p className="text-sm text-muted-foreground">Protein</p>
                <p className="text-2xl font-semibold text-primary">{result.proteinGrams.toFixed(1)}g</p>
                <p className="text-xs text-muted-foreground">{result.proteinCalories.toFixed(0)} cal ({result.proteinPercent.toFixed(0)}%)</p>
              </div>
              <div className="p-4 border rounded">
                <p className="text-sm text-muted-foreground">Carbohydrates</p>
                <p className="text-2xl font-semibold text-primary">{result.carbGrams.toFixed(1)}g</p>
                <p className="text-xs text-muted-foreground">{result.carbCalories.toFixed(0)} cal ({result.carbPercent.toFixed(0)}%)</p>
              </div>
              <div className="p-4 border rounded">
                <p className="text-sm text-muted-foreground">Fat</p>
                <p className="text-2xl font-semibold text-primary">{result.fatGrams.toFixed(1)}g</p>
                <p className="text-xs text-muted-foreground">{result.fatCalories.toFixed(0)} cal ({result.fatPercent.toFixed(0)}%)</p>
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
            <strong>Macronutrient calories</strong> = total calories × percentage / 100.
          </p>
          <p>
            <strong>Macronutrient grams</strong>: Protein = calories / 4, Carbohydrates = calories / 4, Fat = calories / 9.
          </p>
          <p>
            <strong>Typical distributions</strong>: Balanced: 30% protein, 40% carbs, 30% fat. High protein: 40% protein, 30% carbs, 30% fat. Low carb: 30% protein, 20% carbs, 50% fat. Individual needs vary.
          </p>
          <p>Meal calorie breakdown helps track macronutrient intake and optimize nutrition. Percentages should sum to approximately 100% for accurate breakdown.</p>
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
                <p className="text-sm text-muted-foreground">Total percentage</p>
                <p className="text-xl font-semibold text-primary">
                  {(result.proteinPercent + result.carbPercent + result.fatPercent).toFixed(1)}%
                </p>
                <p className="text-xs text-muted-foreground">Should be ~100%</p>
              </div>
              <div className="p-4 border rounded">
                <p className="text-sm text-muted-foreground">Protein:Fat ratio</p>
                <p className="text-xl font-semibold text-primary">
                  {(result.proteinGrams / result.fatGrams).toFixed(2)}:1
                </p>
                <p className="text-xs text-muted-foreground">Grams ratio</p>
              </div>
              <div className="p-4 border rounded">
                <p className="text-sm text-muted-foreground">Carb:Protein ratio</p>
                <p className="text-xl font-semibold text-primary">
                  {(result.carbGrams / result.proteinGrams).toFixed(2)}:1
                </p>
                <p className="text-xs text-muted-foreground">Grams ratio</p>
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
          <p>Meal calorie breakdown calculates macronutrient distribution (protein, carbohydrates, fats) from total calories and percentages. Typical balanced meal: 30% protein, 40% carbs, 30% fat, though individual needs vary.</p>
          <p>Use this calculator to break down meal calories by protein, carbohydrate, and fat percentages.</p>
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
          <p>This tool calculates meal calorie breakdown by protein, carbohydrate, and fat percentages.</p>
          <p>Outputs include total calories, macronutrient percentages, calories and grams for each macronutrient, status, recommendations, an action plan, and supporting metrics.</p>
          <p>Formula, steps, guide content, related tools, and FAQs ensure humans or AI assistants can interpret the methodology instantly.</p>
        </CardContent>
      </Card>
    </div>
  );
}


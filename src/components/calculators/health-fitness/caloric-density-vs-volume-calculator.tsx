'use client';

import { useState } from 'react';
import Script from 'next/script';
import Link from 'next/link';
import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import { z } from 'zod';
import { Scale, Zap, Target, Activity, Shield } from 'lucide-react';

import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Form, FormControl, FormField, FormItem, FormLabel, FormMessage } from '@/components/ui/form';
import { Input } from '@/components/ui/input';

const formSchema = z.object({
  calories: z.number({ invalid_type_error: 'Enter calories' }).min(1).max(2000),
  weight: z.number({ invalid_type_error: 'Enter weight' }).min(1).max(2000),
  volume: z.number({ invalid_type_error: 'Enter volume' }).min(1).max(2000).optional(),
});

type FormValues = z.infer<typeof formSchema>;

type ResultPayload = {
  calories: number;
  weight: number;
  volume: number;
  caloricDensity: number;
  volumeScore: number;
  status: 'optimal' | 'good' | 'moderate' | 'low';
  interpretation: string;
  recommendations: string[];
  plan: { label: string; detail: string }[];
};

const steps = [
  'Enter total calories for the food or meal from food label or tracking.',
  'Enter weight (grams) of the food or meal from measurement or food label.',
  'Optionally enter volume (mL) if measuring by volume instead of weight.',
  'Review caloric density, volume score, and recommendations for weight management.',
];

const faqs = [
  {
    question: 'What is caloric density?',
    answer:
      'Caloric density is the number of calories per gram (or per mL) of food. Lower caloric density foods provide fewer calories per gram, allowing you to eat larger volumes for fewer calories, which supports satiety and weight management.',
  },
  {
    question: 'How is caloric density calculated?',
    answer:
      'Caloric density = calories / weight (grams) or calories / volume (mL). For example, if a food has 100 calories and weighs 200g, caloric density = 100/200 = 0.5 calories per gram.',
  },
  {
    question: 'What are low caloric density foods?',
    answer:
      'Low caloric density foods (&lt;1.5 cal/g) include most vegetables, fruits, broth-based soups, and lean proteins. These foods provide volume and nutrients with relatively few calories.',
  },
  {
    question: 'What are high caloric density foods?',
    answer:
      'High caloric density foods (&gt;3 cal/g) include oils, nuts, seeds, butter, and processed foods. These foods provide many calories in small volumes and should be consumed in moderation.',
  },
  {
    question: 'How does caloric density affect weight management?',
    answer:
      'Lower caloric density foods allow you to eat larger volumes for fewer calories, increasing satiety and supporting weight management. Higher caloric density foods require smaller portions to control calories.',
  },
  {
    question: 'How does volume affect satiety?',
    answer:
      'Food volume (physical space food takes up) affects satiety. Larger volume foods can increase feelings of fullness even with fewer calories, supporting appetite control and weight management.',
  },
  {
    question: 'Can I lower caloric density?',
    answer:
      'Yes. Lower caloric density by adding vegetables, fruits, and water-rich foods to meals. These additions increase volume without significantly increasing calories, reducing overall caloric density.',
  },
  {
    question: 'What about nutrient density vs caloric density?',
    answer:
      'Nutrient density (nutrients per calorie) and caloric density (calories per gram) are different concepts. Ideally, choose foods that are both nutrient-dense and low in caloric density for optimal nutrition and weight management.',
  },
  {
    question: 'How do I track caloric density?',
    answer:
      'Track caloric density by dividing calories by weight (grams) from food labels or measurements. Lower values indicate lower caloric density, which is generally better for weight management.',
  },
  {
    question: 'When should I consult a healthcare provider?',
    answer:
      'Consult a healthcare provider or registered dietitian if you need personalized guidance on caloric density, weight management, or meal planning strategies.',
  },
];

const relatedCalculators = [
  {
    name: 'Satiety Index Calculator',
    slug: 'satiety-index-calculator',
    description: 'Assess satiety alongside caloric density.',
  },
  {
    name: 'Nutrient Density to Calorie Ratio Calculator',
    slug: 'nutrient-density-to-calorie-ratio-calculator',
    description: 'Evaluate nutritional quality comprehensively.',
  },
  {
    name: 'Meal Calorie Breakdown Calculator',
    slug: 'meal-calorie-breakdown-calculator',
    description: 'Break down meal calories alongside density.',
  },
  {
    name: 'Glycemic Index Meal Blender Calculator',
    slug: 'glycemic-index-meal-blender-calculator',
    description: 'Assess meal quality comprehensively.',
  },
];

const baseUrl = 'https://mycalculating.com/category/health-fitness/caloric-density-vs-volume-calculator';

const schemaMarkup = {
  '@context': 'https://schema.org',
  '@graph': [
    {
      '@type': 'BreadcrumbList',
      itemListElement: [
        { '@type': 'ListItem', position: 1, name: 'Home', item: 'https://mycalculating.com' },
        { '@type': 'ListItem', position: 2, name: 'Health & Fitness', item: 'https://mycalculating.com/category/health-fitness' },
        { '@type': 'ListItem', position: 3, name: 'Caloric Density vs Volume Calculator', item: baseUrl },
      ],
    },
    {
      '@type': 'SoftwareApplication',
      name: 'Caloric Density vs Volume Calculator',
      applicationCategory: 'Calculator',
      operatingSystem: 'Web Browser',
      description: 'Calculate caloric density vs volume from calories, weight, and volume.',
      url: baseUrl,
      offers: { '@type': 'Offer', price: '0', priceCurrency: 'USD' },
    },
  ],
};

const clamp = (value: number, min: number, max: number) => Math.min(max, Math.max(min, value));

const calculateResult = (values: FormValues): ResultPayload => {
  const calories = values.calories;
  const weight = values.weight;
  
  let volume: number;
  if (values.volume) {
    volume = values.volume;
  } else {
    // Estimate volume from weight (assuming density ~1 g/mL for most foods)
    volume = weight;
  }
  
  // Calculate caloric density (calories per gram)
  const caloricDensity = calories / weight;
  
  // Calculate volume score (0-100, higher = better for weight management)
  // Lower caloric density = higher volume score
  let volumeScore = 50;
  
  if (caloricDensity < 1.0) {
    volumeScore += 40; // Very low density (excellent)
  } else if (caloricDensity < 1.5) {
    volumeScore += 30; // Low density (very good)
  } else if (caloricDensity < 2.0) {
    volumeScore += 15; // Moderate-low density (good)
  } else if (caloricDensity < 3.0) {
    volumeScore -= 5; // Moderate density
  } else if (caloricDensity < 4.0) {
    volumeScore -= 20; // High density
  } else {
    volumeScore -= 35; // Very high density
  }
  
  volumeScore = clamp(volumeScore, 0, 100);

  let status: ResultPayload['status'] = 'optimal';
  let interpretation = 'Your caloric density is optimal. This food provides good volume relative to calories, supporting satiety and weight management.';

  if (caloricDensity > 4.0 || volumeScore < 30) {
    status = 'low';
    interpretation = 'Your caloric density is very high. This food provides many calories in a small volume. Consider smaller portions or adding lower-calorie-density foods to increase volume.';
  } else if (caloricDensity > 3.0 || volumeScore < 50) {
    status = 'moderate';
    interpretation = 'Your caloric density is moderate to high. Consider adding vegetables or other low-calorie-density foods to increase volume and reduce overall caloric density.';
  } else if (caloricDensity < 1.5) {
    status = 'optimal';
    interpretation = 'Your caloric density is low. This food provides good volume for relatively few calories, supporting satiety and weight management.';
  } else {
    status = 'good';
    interpretation = 'Your caloric density is reasonable. Continue including low-calorie-density foods in your diet to support satiety and weight management.';
  }

  const recommendations = [
    'Choose lower caloric density foods: prioritize vegetables, fruits, broth-based soups, and lean proteins that provide volume with fewer calories.',
    'Add volume to meals: include vegetables, fruits, and water-rich foods to increase meal volume without significantly increasing calories, reducing overall caloric density.',
    'Be mindful of high caloric density foods: oils, nuts, seeds, and processed foods are calorie-dense. Use smaller portions and balance with lower-calorie-density foods.',
  ];
  if (status === 'low' || status === 'moderate') {
    recommendations.push('Reduce caloric density by adding vegetables, fruits, or water-rich foods to meals. This increases volume and satiety while controlling calories.');
  }
  if (caloricDensity > 3.0) {
    recommendations.push('Significantly reduce portion size or add substantial amounts of low-calorie-density foods (vegetables, fruits) to lower overall caloric density and support weight management.');
  }

  const plan = [
    { label: 'This Week', detail: 'Calculate caloric density for your foods and meals. Assess volume relative to calories and identify opportunities to lower caloric density.' },
    { label: 'This Month', detail: 'Optimize meal composition: add vegetables and fruits to increase volume, reduce overall caloric density, and support satiety and weight management.' },
    { label: 'Ongoing', detail: 'Monitor caloric density through regular food assessment. Maintain a diet rich in low-calorie-density foods to support optimal satiety and weight management.' },
  ];

  return { calories, weight, volume, caloricDensity, volumeScore, status, interpretation, recommendations, plan };
};

export default function CaloricDensityVsVolumeCalculator() {
  const [result, setResult] = useState<ResultPayload | null>(null);

  const form = useForm<FormValues>({
    resolver: zodResolver(formSchema),
    defaultValues: {
      calories: undefined,
      weight: undefined,
      volume: undefined,
    },
  });

  return (
    <div className="space-y-8">
      <Script id="caloric-density-schema" type="application/ld+json" strategy="afterInteractive" dangerouslySetInnerHTML={{ __html: JSON.stringify(schemaMarkup) }} />

      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <Scale className="h-5 w-5" />
            Caloric Density vs Volume Calculator
          </CardTitle>
          <CardDescription>Calculate caloric density vs volume from calories, weight, and volume.</CardDescription>
        </CardHeader>
      </Card>

      <Card>
        <CardHeader>
          <CardTitle>Input your food data</CardTitle>
        </CardHeader>
        <CardContent>
          <Form {...form}>
            <form onSubmit={form.handleSubmit((values) => setResult(calculateResult(values)))} className="space-y-6">
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <FormField
                  control={form.control}
                  name="calories"
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel>Calories</FormLabel>
                      <FormControl>
                        <Input type="number" step="1" placeholder="e.g., 150" value={field.value ?? ''} onChange={(e) => field.onChange(e.target.value === '' ? undefined : Number(e.target.value))} />
                      </FormControl>
                      <FormMessage />
                    </FormItem>
                  )}
                />
                <FormField
                  control={form.control}
                  name="weight"
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel>Weight (grams)</FormLabel>
                      <FormControl>
                        <Input type="number" step="1" placeholder="e.g., 200" value={field.value ?? ''} onChange={(e) => field.onChange(e.target.value === '' ? undefined : Number(e.target.value))} />
                      </FormControl>
                      <FormMessage />
                    </FormItem>
                  )}
                />
                <FormField
                  control={form.control}
                  name="volume"
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel>Volume (mL) (optional)</FormLabel>
                      <FormControl>
                        <Input type="number" step="1" placeholder="e.g., 200" value={field.value ?? ''} onChange={(e) => field.onChange(e.target.value === '' ? undefined : Number(e.target.value))} />
                      </FormControl>
                      <FormMessage />
                    </FormItem>
                  )}
                />
              </div>
              <Button type="submit" className="w-full md:w-auto">
                Calculate caloric density
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
            <CardDescription>See caloric density, volume score, and recommendations.</CardDescription>
          </CardHeader>
          <CardContent className="space-y-6">
            <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
              <div className="p-4 border rounded">
                <p className="text-sm text-muted-foreground">Calories</p>
                <p className="text-2xl font-semibold text-primary">{result.calories.toFixed(0)}</p>
                <p className="text-xs text-muted-foreground">kcal</p>
              </div>
              <div className="p-4 border rounded">
                <p className="text-sm text-muted-foreground">Weight</p>
                <p className="text-2xl font-semibold text-primary">{result.weight.toFixed(0)}g</p>
                <p className="text-xs text-muted-foreground">grams</p>
              </div>
              <div className="p-4 border rounded">
                <p className="text-sm text-muted-foreground">Caloric density</p>
                <p className="text-2xl font-semibold text-primary">{result.caloricDensity.toFixed(2)}</p>
                <p className="text-xs text-muted-foreground">cal/g</p>
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
            <strong>Caloric density</strong> = calories / weight (grams). Lower values indicate fewer calories per gram.
          </p>
          <p>
            <strong>Volume score</strong> = calculated from caloric density. Lower caloric density results in higher volume score, indicating better volume-to-calorie ratio for weight management.
          </p>
          <p>
            <strong>Caloric density ranges</strong>: Very low: &lt;1.0 cal/g, Low: 1.0-1.5 cal/g, Moderate: 1.5-3.0 cal/g, High: 3.0-4.0 cal/g, Very high: &gt;4.0 cal/g.
          </p>
          <p>Caloric density affects satiety and weight management. Lower caloric density foods allow larger volumes for fewer calories, supporting appetite control and weight management goals.</p>
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
                <p className="text-sm text-muted-foreground">Target density</p>
                <p className="text-xl font-semibold text-primary">&lt; 1.5 cal/g</p>
                <p className="text-xs text-muted-foreground">Low density</p>
              </div>
              <div className="p-4 border rounded">
                <p className="text-sm text-muted-foreground">Volume score</p>
                <p className="text-xl font-semibold text-primary">{result.volumeScore.toFixed(0)}</p>
                <p className="text-xs text-muted-foreground">Out of 100</p>
              </div>
              <div className="p-4 border rounded">
                <p className="text-sm text-muted-foreground">Density category</p>
                <p className="text-xl font-semibold text-primary">
                  {result.caloricDensity < 1.0 ? 'Very Low' : result.caloricDensity < 1.5 ? 'Low' : result.caloricDensity < 3.0 ? 'Moderate' : result.caloricDensity < 4.0 ? 'High' : 'Very High'}
                </p>
                <p className="text-xs text-muted-foreground">Based on density</p>
              </div>
            </div>
          ) : (
            <p className="text-sm text-muted-foreground">Enter your food data to see additional insights.</p>
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
          <p>Caloric density is the number of calories per gram of food. Lower caloric density foods (&lt;1.5 cal/g) provide more volume for fewer calories, supporting satiety and weight management. Higher caloric density foods require smaller portions to control calories.</p>
          <p>Use this calculator to calculate caloric density vs volume from calories, weight, and optional volume.</p>
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
          <p>This tool calculates caloric density vs volume from calories, weight, and optional volume.</p>
          <p>Outputs include calories, weight, volume, caloric density, volume score, status, recommendations, an action plan, and supporting metrics.</p>
          <p>Formula, steps, guide content, related tools, and FAQs ensure humans or AI assistants can interpret the methodology instantly.</p>
        </CardContent>
      </Card>
    </div>
  );
}


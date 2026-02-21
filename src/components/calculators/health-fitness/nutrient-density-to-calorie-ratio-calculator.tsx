'use client';

import { useState } from 'react';
import Script from 'next/script';
import Link from 'next/link';
import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import { z } from 'zod';
import { Apple, Zap, Target, Activity, Shield } from 'lucide-react';

import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Form, FormControl, FormField, FormItem, FormLabel, FormMessage } from '@/components/ui/form';
import { Input } from '@/components/ui/input';

const formSchema = z.object({
  nutrientScore: z.number({ invalid_type_error: 'Enter nutrient score' }).min(0).max(100),
  calories: z.number({ invalid_type_error: 'Enter calories' }).min(1).max(2000),
  nutrientDensity: z.number({ invalid_type_error: 'Enter nutrient density' }).min(0).max(100).optional(),
  servingSize: z.number({ invalid_type_error: 'Enter serving size' }).min(1).max(1000),
});

type FormValues = z.infer<typeof formSchema>;

type ResultPayload = {
  nutrientScore: number;
  calories: number;
  servingSize: number;
  nutrientDensity: number;
  densityRatio: number;
  status: 'optimal' | 'good' | 'moderate' | 'low';
  interpretation: string;
  recommendations: string[];
  plan: { label: string; detail: string }[];
};

const steps = [
  'Enter nutrient score (0-100) from nutritional assessment or food database.',
  'Enter calories per serving from food label or database.',
  'Enter serving size (grams) from food label or measurement.',
  'Optionally enter nutrient density if calculated (nutrients per 100g).',
  'Review nutrient density to calorie ratio, nutritional quality status, and recommendations.',
];

const faqs = [
  {
    question: 'What is nutrient density?',
    answer:
      'Nutrient density refers to the amount of essential nutrients (vitamins, minerals, protein, fiber) per calorie in a food. High nutrient density foods provide more nutrients with fewer calories, supporting optimal nutrition.',
  },
  {
    question: 'How is nutrient density calculated?',
    answer:
      'Nutrient density can be calculated as nutrient score divided by calories, or as nutrients per 100g of food. Higher ratios indicate more nutrients per calorie, making foods more nutritionally valuable.',
  },
  {
    question: 'What are high nutrient density foods?',
    answer:
      'High nutrient density foods include leafy greens, vegetables, fruits, lean proteins, whole grains, nuts, and seeds. These provide essential nutrients with relatively few calories compared to processed foods.',
  },
  {
    question: 'What are low nutrient density foods?',
    answer:
      'Low nutrient density foods (often called "empty calories") include highly processed foods, sugary drinks, refined grains, and foods high in added sugars and fats but low in essential nutrients.',
  },
  {
    question: 'Why is nutrient density important?',
    answer:
      'Nutrient density is important for meeting nutritional needs without excess calories, supporting optimal health, preventing nutrient deficiencies, and maintaining healthy weight. High nutrient density supports overall well-being.',
  },
  {
    question: 'How does nutrient density affect health?',
    answer:
      'High nutrient density diets support better health outcomes, including reduced disease risk, improved energy levels, better weight management, and optimal nutrient status. Low nutrient density diets may lead to deficiencies and health issues.',
  },
  {
    question: 'Can I improve nutrient density?',
    answer:
      'Yes. Improve nutrient density by choosing whole, unprocessed foods, increasing fruits and vegetables, selecting lean proteins, choosing whole grains, and reducing processed foods and added sugars.',
  },
  {
    question: 'What about calorie density?',
    answer:
      'Calorie density (calories per gram) is related but different from nutrient density. Low calorie density foods (like vegetables) often have high nutrient density, supporting both nutrition and weight management.',
  },
  {
    question: 'How do I track nutrient density?',
    answer:
      'Track nutrient density by using food databases, nutrition labels, and apps that calculate nutrient scores. Compare nutrient content to calories to assess density. Focus on foods with high nutrient-to-calorie ratios.',
  },
  {
    question: 'When should I consult a healthcare provider?',
    answer:
      'Consult a healthcare provider or registered dietitian if you have concerns about nutrient intake, if you have dietary restrictions, or if you need guidance on optimizing nutrient density in your diet.',
  },
];

const relatedCalculators = [
  {
    name: 'Meal Calorie Breakdown Calculator',
    slug: 'meal-calorie-breakdown-calculator',
    description: 'Break down meal calories alongside nutrient density.',
  },
  {
    name: 'Glycemic Index Meal Blender Calculator',
    slug: 'glycemic-index-meal-blender-calculator',
    description: 'Assess meal quality comprehensively.',
  },
  {
    name: 'Satiety Index Calculator',
    slug: 'satiety-index-calculator',
    description: 'Evaluate satiety alongside nutrient density.',
  },
  {
    name: 'Antioxidant Diversity Index Calculator',
    slug: 'antioxidant-diversity-index-calculator',
    description: 'Track antioxidants that contribute to nutrient density.',
  },
];

const baseUrl = 'https://mycalculating.com/category/health-fitness/nutrient-density-to-calorie-ratio-calculator';

const schemaMarkup = {
  '@context': 'https://schema.org',
  '@graph': [
    {
      '@type': 'BreadcrumbList',
      itemListElement: [
        { '@type': 'ListItem', position: 1, name: 'Home', item: 'https://mycalculating.com' },
        { '@type': 'ListItem', position: 2, name: 'Health & Fitness', item: 'https://mycalculating.com/category/health-fitness' },
        { '@type': 'ListItem', position: 3, name: 'Nutrient Density to Calorie Ratio Calculator', item: baseUrl },
      ],
    },
    {
      '@type': 'SoftwareApplication',
      name: 'Nutrient Density to Calorie Ratio Calculator',
      applicationCategory: 'Calculator',
      operatingSystem: 'Web Browser',
      description: 'Calculate nutrient density to calorie ratio from nutrient score, calories, serving size, and nutrient density.',
      url: baseUrl,
      offers: { '@type': 'Offer', price: '0', priceCurrency: 'USD' },
    },
  ],
};

const clamp = (value: number, min: number, max: number) => Math.min(max, Math.max(min, value));

const calculateResult = (values: FormValues): ResultPayload => {
  const nutrientScore = values.nutrientScore;
  const calories = values.calories;
  const servingSize = values.servingSize;
  
  let nutrientDensity: number;
  
  if (values.nutrientDensity) {
    nutrientDensity = values.nutrientDensity;
  } else {
    // Calculate nutrient density: nutrient score per calorie
    nutrientDensity = (nutrientScore / calories) * 100; // Scale to 0-100
  }
  
  // Calculate density ratio (nutrient density per calorie)
  const densityRatio = nutrientDensity / calories;
  
  // Assess status based on nutrient density
  let status: ResultPayload['status'] = 'optimal';
  let interpretation = 'Your nutrient density to calorie ratio appears optimal. Continue choosing nutrient-dense foods.';

  if (nutrientDensity < 20 || densityRatio < 0.1) {
    status = 'low';
    interpretation = 'Your nutrient density to calorie ratio is low. This food provides few nutrients relative to calories. Consider choosing more nutrient-dense alternatives.';
  } else if (nutrientDensity < 40 || densityRatio < 0.2) {
    status = 'moderate';
    interpretation = 'Your nutrient density to calorie ratio is moderate. Consider increasing nutrient-dense foods in your diet to optimize nutrition.';
  } else if (nutrientDensity < 60) {
    status = 'good';
    interpretation = 'Your nutrient density to calorie ratio is good. Continue including nutrient-dense foods in your diet.';
  }

  const recommendations = [
    'Choose nutrient-dense foods: prioritize whole, unprocessed foods like fruits, vegetables, lean proteins, whole grains, and nuts that provide essential nutrients with fewer calories.',
    'Increase fruits and vegetables: these are among the most nutrient-dense foods, providing vitamins, minerals, fiber, and antioxidants with relatively few calories.',
    'Reduce processed foods: highly processed foods often have low nutrient density, providing calories but few essential nutrients. Limit these in favor of whole foods.',
  ];
  if (status === 'low' || status === 'moderate') {
    recommendations.push('Focus on improving nutrient density by selecting foods with higher nutrient-to-calorie ratios. This supports optimal nutrition and health without excess calories.');
  }
  if (nutrientDensity < 30) {
    recommendations.push('Significantly increase nutrient-dense foods in your diet. Aim for foods that provide substantial nutrients relative to their calorie content to optimize nutritional quality.');
  }

  const plan = [
    { label: 'This Week', detail: 'Assess current nutrient density of foods. Calculate nutrient density to calorie ratios and identify opportunities to increase nutrient-dense food choices.' },
    { label: 'This Month', detail: 'Implement dietary improvements: increase fruits and vegetables, choose whole foods over processed, and prioritize nutrient-dense options to optimize nutrition.' },
    { label: 'Ongoing', detail: 'Monitor nutrient density through regular assessment of food choices. Maintain a diet rich in nutrient-dense foods to support optimal nutrition and health.' },
  ];

  return { nutrientScore, calories, servingSize, nutrientDensity, densityRatio, status, interpretation, recommendations, plan };
};

export default function NutrientDensityToCalorieRatioCalculator() {
  const [result, setResult] = useState<ResultPayload | null>(null);

  const form = useForm<FormValues>({
    resolver: zodResolver(formSchema),
    defaultValues: {
      nutrientScore: undefined,
      calories: undefined,
      servingSize: undefined,
      nutrientDensity: undefined,
    },
  });

  return (
    <div className="space-y-8">
      <Script id="nutrient-density-schema" type="application/ld+json" strategy="afterInteractive" dangerouslySetInnerHTML={{ __html: JSON.stringify(schemaMarkup) }} />

      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <Apple className="h-5 w-5" />
            Nutrient Density to Calorie Ratio Calculator
          </CardTitle>
          <CardDescription>Calculate nutrient density to calorie ratio from nutrient score, calories, serving size, and nutrient density.</CardDescription>
        </CardHeader>
      </Card>

      <Card>
        <CardHeader>
          <CardTitle>Input your nutrient density data</CardTitle>
        </CardHeader>
        <CardContent>
          <Form {...form}>
            <form onSubmit={form.handleSubmit((values) => setResult(calculateResult(values)))} className="space-y-6">
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <FormField
                  control={form.control}
                  name="nutrientScore"
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel>Nutrient score (0-100)</FormLabel>
                      <FormControl>
                        <Input type="number" step="1" placeholder="e.g., 75" value={field.value ?? ''} onChange={(e) => field.onChange(e.target.value === '' ? undefined : Number(e.target.value))} />
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
                      <FormLabel>Calories per serving</FormLabel>
                      <FormControl>
                        <Input type="number" step="1" placeholder="e.g., 150" value={field.value ?? ''} onChange={(e) => field.onChange(e.target.value === '' ? undefined : Number(e.target.value))} />
                      </FormControl>
                      <FormMessage />
                    </FormItem>
                  )}
                />
                <FormField
                  control={form.control}
                  name="servingSize"
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel>Serving size (grams)</FormLabel>
                      <FormControl>
                        <Input type="number" step="1" placeholder="e.g., 100" value={field.value ?? ''} onChange={(e) => field.onChange(e.target.value === '' ? undefined : Number(e.target.value))} />
                      </FormControl>
                      <FormMessage />
                    </FormItem>
                  )}
                />
                <FormField
                  control={form.control}
                  name="nutrientDensity"
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel>Nutrient density (optional)</FormLabel>
                      <FormControl>
                        <Input type="number" step="0.1" placeholder="e.g., 50" value={field.value ?? ''} onChange={(e) => field.onChange(e.target.value === '' ? undefined : Number(e.target.value))} />
                      </FormControl>
                      <FormMessage />
                    </FormItem>
                  )}
                />
              </div>
              <Button type="submit" className="w-full md:w-auto">
                Calculate nutrient density ratio
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
            <CardDescription>See nutrient density to calorie ratio, nutritional quality status, and recommendations.</CardDescription>
          </CardHeader>
          <CardContent className="space-y-6">
            <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
              <div className="p-4 border rounded">
                <p className="text-sm text-muted-foreground">Nutrient score</p>
                <p className="text-2xl font-semibold text-primary">{result.nutrientScore.toFixed(0)}</p>
                <p className="text-xs text-muted-foreground">Out of 100</p>
              </div>
              <div className="p-4 border rounded">
                <p className="text-sm text-muted-foreground">Calories</p>
                <p className="text-2xl font-semibold text-primary">{result.calories.toFixed(0)}</p>
                <p className="text-xs text-muted-foreground">per serving</p>
              </div>
              <div className="p-4 border rounded">
                <p className="text-sm text-muted-foreground">Nutrient density</p>
                <p className="text-2xl font-semibold text-primary">{result.nutrientDensity.toFixed(1)}</p>
                <p className="text-xs text-muted-foreground">Score per calorie</p>
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
            <strong>Nutrient density</strong> = (nutrient score / calories) × 100, or provided directly.
          </p>
          <p>
            <strong>Density ratio</strong> = nutrient density / calories. Higher ratios indicate more nutrients per calorie.
          </p>
          <p>
            <strong>Optimal ranges</strong>: Nutrient density: &gt;60 (high), 40-60 (moderate), &lt;40 (low). Higher nutrient density indicates better nutritional quality relative to calories.
          </p>
          <p>Nutrient density reflects the amount of essential nutrients per calorie. High nutrient density foods support optimal nutrition without excess calories, promoting better health outcomes.</p>
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
                <p className="text-xl font-semibold text-primary">&gt; 60</p>
                <p className="text-xs text-muted-foreground">High density</p>
              </div>
              <div className="p-4 border rounded">
                <p className="text-sm text-muted-foreground">Density ratio</p>
                <p className="text-xl font-semibold text-primary">{result.densityRatio.toFixed(3)}</p>
                <p className="text-xs text-muted-foreground">Per calorie</p>
              </div>
              <div className="p-4 border rounded">
                <p className="text-sm text-muted-foreground">Calories per 100g</p>
                <p className="text-xl font-semibold text-primary">
                  {((result.calories / result.servingSize) * 100).toFixed(0)}
                </p>
                <p className="text-xs text-muted-foreground">kcal/100g</p>
              </div>
            </div>
          ) : (
            <p className="text-sm text-muted-foreground">Enter your nutrient density data to see additional insights.</p>
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

      <Card>
        <CardHeader>
          <CardTitle>Complete guide snapshot</CardTitle>
        </CardHeader>
        <CardContent className="prose prose-sm dark:prose-invert max-w-none">
          <p>Nutrient density refers to the amount of essential nutrients per calorie in a food. High nutrient density foods (fruits, vegetables, lean proteins, whole grains) provide more nutrients with fewer calories, supporting optimal nutrition and health.</p>
          <p>Use this calculator to assess nutrient density to calorie ratio from nutrient score, calories, serving size, and optional nutrient density.</p>
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
          <p>This tool calculates nutrient density to calorie ratio from nutrient score, calories, serving size, and nutrient density (optional).</p>
          <p>Outputs include nutrient score, calories, serving size, nutrient density, density ratio, status, recommendations, an action plan, and supporting metrics.</p>
          <p>Formula, steps, guide content, related tools, and FAQs ensure humans or AI assistants can interpret the methodology instantly.</p>
        </CardContent>
      </Card>
    </div>
  );
}


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

const baseUrl = 'https://mycalculating.com/health-fitness/caloric-density-vs-volume-calculator';

const schemaMarkup = {
  '@context': 'https://schema.org',
  '@graph': [
    {
      '@type': 'BreadcrumbList',
      itemListElement: [
        { '@type': 'ListItem', position: 1, name: 'Home', item: 'https://mycalculating.com' },
        { '@type': 'ListItem', position: 2, name: 'Health & Fitness', item: 'https://mycalculating.com/health-fitness' },
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
                <Link href={`/${calc.slug}`} className="text-primary hover:underline">
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
    <meta itemProp="name" content="The Definitive Guide to Caloric Density vs. Volume: Energy Density and Satiety for Weight Management" />
    <meta itemProp="description" content="An in-depth guide on the concept of Caloric Density (kcal/gram) and its critical relationship with food volume, explaining how choosing low energy-density foods (high in water and fiber) supports satiety and effective weight loss." />
    <meta itemProp="keywords" content="caloric density vs volume calculator, low energy density foods list, high caloric density foods, volumetrics diet principle, satiety and weight management, water and fiber in caloric density" />
    <meta itemProp="author" content="[Your Site's Health Team]" />
    <meta itemProp="datePublished" content="2025-12-03" />
    <meta itemProp="url" content="/definitive-caloric-density-guide" />

    <h1 className="text-3xl md:text-4xl font-extrabold text-foreground mb-4" itemProp="headline">The Definitive Guide to Caloric Density vs. Volume: Key to Satiety and Weight Management</h1>
    <p className="text-lg italic text-gray-700">Understanding how the concentration of calories per unit of food mass fundamentally dictates hunger signals and success in achieving weight loss goals.</p>


    {/* TABLE OF CONTENTS (INTERNAL LINKS FOR UX AND SEO) */}
    <h2 className="text-2xl font-bold text-foreground mt-8 mb-4">Table of Contents: Jump to a Section</h2>
    <ul className="list-disc ml-6 space-y-2 text-blue-600">
        <li><a href="#definition" className="hover:underline">Defining Caloric Density (Energy Density)</a></li>
        <li><a href="#volume" className="hover:underline">The Satiety Principle: Volume vs. Calories</a></li>
        <li><a href="#factors" className="hover:underline">Key Factors Controlling Density: Water and Fiber</a></li>
        <li><a href="#categories" className="hover:underline">Food Categorization by Energy Density</a></li>
        <li><a href="#strategy" className="hover:underline">The Volumetrics Strategy for Weight Management</a></li>
    </ul>
<hr />

    {/* DEFINING CALORIC DENSITY (ENERGY DENSITY) */}
    <h2 id="definition" className="text-2xl font-bold text-foreground pt-8" itemProp="articleSection">Defining Caloric Density (Energy Density)</h2>
    <p><b>Caloric Density</b>, often referred to interchangeably as <b>Energy Density</b>, is a fundamental concept in nutritional science. It is a metric that quantifies the concentration of energy (calories) within a given weight of food. It is expressed in units of **kilocalories per gram (kcal/g)**.</p>

    <h3 className="text-xl font-semibold text-foreground mt-6">The Calculation Basis</h3>
    <p>Since fats contain approximately 9 kcal/g, while carbohydrates and protein contain 4 kcal/g, the proportion of fat in a food is the single strongest determinant of its caloric density. Foods high in fat, such as oils or nuts, naturally have a much higher density than foods high in water, like broth or vegetables.</p>

    <h3 className="text-xl font-semibold text-foreground mt-6">Importance in Dietary Assessment</h3>
    <p>According to the <b>Centers for Disease Control and Prevention (CDC)</b> and numerous studies from the <b>NIH</b>, managing energy density is one of the most effective strategies for long-term weight control. It shifts the focus from simple quantity restriction to strategic food selection.</p>

<hr />

    {/* THE SATIETY PRINCIPLE: VOLUME VS. CALORIES */}
    <h2 id="volume" className="text-2xl font-bold text-foreground pt-8" itemProp="articleSection">The Satiety Principle: Volume vs. Calories</h2>
    <p>Human appetite is powerfully regulated by the **volume** of food consumed. The physical bulk of food, rather than the number of calories, plays the primary role in triggering stretch receptors in the stomach lining, which signal the brain that the body is full (satiety).</p>

    <h3 className="text-xl font-semibold text-foreground mt-6">The Effect on Gastric Stretch</h3>
    <p>When a person consumes a meal high in volume but low in caloric density (e.g., a large salad), the stomach fills quickly. This gastric stretch initiates immediate satiety signals, leading to the cessation of eating. Conversely, consuming a small volume of high-density food (e.g., a small handful of chips or candy) provides many calories but fails to trigger the necessary stretch, leading to continued hunger signals shortly after consumption.</p>

    <h3 className="text-xl font-semibold text-foreground mt-6">Satiety and Energy Compensation</h3>
    <p>Research on the energy density of meals demonstrates that people tend to eat a relatively consistent weight or volume of food each day, regardless of the calorie content. By lowering the average energy density of the diet, an individual naturally consumes fewer calories while still feeling physically full, a process known as **energy compensation**.</p>
    [Image contrasting a large serving of low-density food (vegetables) with a small serving of high-density food (chips) showing equal calories]

<hr />

    {/* KEY FACTORS CONTROLLING DENSITY: WATER AND FIBER */}
    <h2 id="factors" className="text-2xl font-bold text-foreground pt-8" itemProp="articleSection">Key Factors Controlling Density: Water and Fiber</h2>
    <p>The caloric density of a food is primarily controlled by two diluting components: its water content and its fiber content. Both provide physical volume with minimal or zero caloric contribution.</p>

    <h3 className="text-xl font-semibold text-foreground mt-6">The Role of Water</h3>
    <p>Water is the ideal caloric diluent, contributing 0 kcal/g. Foods with very high water content, such as fruits (like melon and berries), most vegetables (like cucumber, lettuce), and broth-based soups, automatically have a very low caloric density. Preparing foods with water (e.g., boiling vegetables, making soups) is an effective way to lower the density of an entire meal.</p>

    <h3 className="text-xl font-semibold text-foreground mt-6">The Role of Fiber</h3>
    <p>Fiber, being indigestible by human enzymes, contributes negligible calories (officially 0 kcal/g in the US). Fiber-rich foodsâ€”whole grains, legumes, and non-starchy vegetablesâ€”are low in density because the fiber provides bulk and slows digestion. This bulk adds volume without adding energy, thus decreasing the overall kcal/g ratio.</p>

<hr />

    {/* FOOD CATEGORIZATION BY ENERGY DENSITY */}
    <h2 id="categories" className="text-2xl font-bold text-foreground pt-8" itemProp="articleSection">Food Categorization by Energy Density</h2>
    <p>Nutritional guidelines typically divide foods into four main categories based on their caloric density, which serves as a guide for strategic eating.</p>

    <h3 className="text-xl font-semibold text-foreground mt-6">Low Energy Density (0.0 â€“ 1.5 kcal/g)</h3>
    <p>These foods should form the foundation of a weight-management diet because they allow for large portions with minimal caloric impact. This category is dominated by water and fiber:</p>
    <ul>
        <li>Non-starchy vegetables (broccoli, leafy greens, peppers)</li>
        <li>Broth-based soups</li>
        <li>Fruits high in water (melons, citrus fruits)</li>
        <li>Skim milk, low-fat yogurt</li>
    </ul>

    <h3 className="text-xl font-semibold text-foreground mt-6">Medium Energy Density (1.5 â€“ 4.0 kcal/g)</h3>
    <p>These foods are nutrient-dense and should be consumed in moderation. They include higher-protein and moderate-fat items:</p>
    <ul>
        <li>Whole grains (oatmeal, brown rice)</li>
        <li>Lean meats and fish (chicken breast, cod)</li>
        <li>Legumes (beans, lentils)</li>
        <li>Starchy vegetables (potatoes, corn)</li>
    </ul>

    <h3 className="text-xl font-semibold text-foreground mt-6">High Energy Density (4.0 kcal/g and higher)</h3>
    <p>These foods are often consumed in small volumes but contribute significantly to total daily calories. They are typically high in fat and low in water/fiber:</p>
    <ul>
        <li>Oils and butter</li>
        <li>Nuts and seeds (high in healthy fats, but dense)</li>
        <li>Sweets, candy, chocolate</li>
        <li>Chips, cookies, and other processed baked goods</li>
    </ul>

<hr />

    {/* THE VOLUMETRICS STRATEGY FOR WEIGHT MANAGEMENT */}
    <h2 id="strategy" className="text-2xl font-bold text-foreground pt-8" itemProp="articleSection">The Volumetrics Strategy for Weight Management</h2>
    <p>The Volumetrics Eating Plan, developed by Dr. Barbara Rolls, is an authoritative approach based entirely on reducing the average caloric density of the diet to promote weight loss without enduring persistent hunger.</p>

    <h3 className="text-xl font-semibold text-foreground mt-6">Core Principles of Volumetrics</h3>
    <p>The strategy focuses on systematic replacement:</p>
    <ul>
        <li><b>Start with Low-Density Foods:</b> Begin meals with a broth-based soup or a large salad (without creamy dressing). This fills the stomach quickly with minimal calories.</li>
        <li><b>Dilute High-Density Meals:</b> Always pair a high-density food (e.g., cheese, meat) with an abundance of low-density foods (e.g., vegetables, mushrooms, beans) to lower the overall density of the plate.</li>
        <li><b>Replace Fat with Water:</b> Choose baked, steamed, or boiled foods over fried foods, and use purees (like blended beans or vegetables) instead of high-fat sauces to provide volume and moisture.</li>
    </ul>

    <h3 className="text-xl font-semibold text-foreground mt-6">Clinical Effectiveness</h3>
    <p>Clinical trials supported by the **National Institute of Diabetes and Digestive and Kidney Diseases (NIDDK)** have shown that individuals who follow a low-energy density diet consume fewer calories daily and achieve greater long-term weight maintenance than those following traditional low-fat or restricted-portion diets.</p>

<hr />

    {/* CONCLUSION */}
    <h2 className="text-2xl font-bold text-foreground pt-8" itemProp="articleSection">Conclusion</h2>
    <p>The concept of **Caloric Density (kcal/g)** is the key determinant of satiety and an effective tool for weight management. Foods low in caloric density are naturally high in <b>water and fiber</b>, allowing individuals to consume larger, more filling portions while simultaneously reducing calorie intake. By systematically applying the **Volumetrics strategy**â€”replacing high-density processed foods with low-density vegetables, fruits, and broth-based mealsâ€”individuals can harness the body's natural satiety signals to achieve sustainable weight loss without feeling deprived.</p>
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
          <p>This tool calculates caloric density vs volume from calories, weight, and optional volume.</p>
          <p>Outputs include calories, weight, volume, caloric density, volume score, status, recommendations, an action plan, and supporting metrics.</p>
          <p>Formula, steps, guide content, related tools, and FAQs ensure humans or AI assistants can interpret the methodology instantly.</p>
        </CardContent>
      </Card>
    </div>
  );
}


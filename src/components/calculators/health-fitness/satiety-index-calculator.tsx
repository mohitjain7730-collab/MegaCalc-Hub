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

      <section className="space-y-6 text-muted-foreground leading-relaxed bg-white p-6 md:p-10 rounded-lg shadow-lg" itemProp itemType="https://schema.org/MedicalWebPage">
    {/* SEO & SCHEMA METADATA (HIGHLY OPTIMIZED) */}
    <meta itemProp="name" content="The Definitive Guide to the Satiety Index: Principles of Fullness and Meal Planning for Weight Loss" />
    <meta itemProp="description" content="An in-depth, authoritative guide on the physiological and nutritional factors that govern satiety (fullness), detailing the critical roles of protein, fiber, and low caloric density foods in effective weight management and hunger control." />
    <meta itemProp="keywords" content="satiety index calculator, principles of satiety in meal planning, best foods for fullness, protein fiber water satiety, hormonal control of hunger PYY, effective weight loss strategies, low energy density foods" />
    <meta itemProp="author" content="[Your Site's Health Team]" />
    <meta itemProp="datePublished" content="2025-12-03" />
    <meta itemProp="url" content="/definitive-satiety-index-guide" />

    <h1 className="text-3xl md:text-4xl font-extrabold text-foreground mb-4" itemProp="headline">The Definitive Guide to Satiety: Principles of Fullness and Effective Meal Planning</h1>
    <p className="text-lg italic text-gray-700">Understanding the key nutritional components—protein, fiber, and volume—that control hunger and sustain fullness for successful weight management.</p>


    {/* TABLE OF CONTENTS (INTERNAL LINKS FOR UX AND SEO) */}
    <h2 className="text-2xl font-bold text-foreground mt-8 mb-4">Table of Contents: Jump to a Section</h2>
    <ul className="list-disc ml-6 space-y-2 text-blue-600">
        <li><a href="#mechanism" className="hover:underline">The Physiological Mechanism of Satiety</a></li>
        <li><a href="#protein" className="hover:underline">Factor 1: Protein's Hormonal Satiety Power</a></li>
        <li><a href="#fiber" className="hover:underline">Factor 2: Fiber and Delayed Gastric Emptying</a></li>
        <li><a href="#volume" className="hover:underline">Factor 3: Volume and Caloric Density</a></li>
        <li><a href="#planning" className="hover:underline">Applying Satiety Principles to Meal Planning</a></li>
    </ul>
<hr />

    {/* THE PHYSIOLOGICAL MECHANISM OF SATIETY */}
    <h2 id="mechanism" className="text-2xl font-bold text-foreground pt-8" itemProp="articleSection">The Physiological Mechanism of Satiety</h2>
    <p><b>Satiety</b> is the feeling of sustained fullness that persists after a meal, suppressing the desire to eat again. This complex response is governed by a precise interplay of mechanical signals (physical stretch of the stomach) and hormonal signals (chemicals released by the digestive tract and fat cells).</p>

    <h3 className="text-xl font-semibold text-foreground mt-6">Hormones Governing Hunger and Fullness</h3>
    <p>The **gut-brain axis** controls satiety through several key hormones:</p>
    <ul>
        <li><b>Ghrelin:</b> Often called the "hunger hormone," ghrelin levels rise before meals and drop after eating. A rapid drop is associated with higher satiety.</li>
        <li><b>Peptide YY (PYY):</b> A hormone released in the ileum and colon in response to food intake, particularly protein. PYY acts on the brain to suppress appetite, promoting long-term satiety.</li>
        <li><b>Leptin:</b> Released by adipose (fat) tissue. Leptin signals the brain about long-term energy stores, adjusting overall appetite and energy expenditure.</li>
    </ul>

    <h3 className="text-xl font-semibold text-foreground mt-6">The Importance of Gastric Stretch</h3>
    <p>Physical signals from the stomach are the body's fastest satiety mechanism. When the stomach is physically stretched by large volumes of food (especially water and fiber), immediate signals are sent to the brain to stop eating. This mechanism emphasizes the importance of food volume over caloric load.</p>

<hr />

    {/* FACTOR 1: PROTEIN'S HORMONAL SATIETY POWER */}
    <h2 id="protein" className="text-2xl font-bold text-foreground pt-8" itemProp="articleSection">Factor 1: Protein's Hormonal Satiety Power</h2>
    <p>Of the three macronutrients, protein consistently demonstrates the **highest satiety index** (fullness per calorie). Its superior effect is largely hormonal, relying on the release of appetite-suppressing gut peptides.</p>

    <h3 className="text-xl font-semibold text-foreground mt-6">Superior Thermic Effect</h3>
    <p>Protein has the highest **Thermic Effect of Food (TEF)**, meaning the body expends more energy (calories) to digest, absorb, and metabolize protein than it does for carbohydrates or fats. This metabolic cost adds to the feeling of satisfaction and reduces the net calories absorbed from the meal.</p>

    <h3 className="text-xl font-semibold text-foreground mt-6">PYY and CCK Release</h3>
    <p>The ingestion of amino acids triggers a robust release of **PYY** and **Cholecystokinin (CCK)**—hormones that act on the hypothalamus to reduce food intake. Research published in the <b>American Journal of Clinical Nutrition</b> consistently shows that diets higher in lean protein are superior for reducing caloric intake and supporting weight loss compared to diets relying on fat or carbohydrates for satiety.</p>

<hr />

    {/* FACTOR 2: FIBER AND DELAYED GASTRIC EMPTYING */}
    <h2 id="fiber" className="text-2xl font-bold text-foreground pt-8" itemProp="articleSection">Factor 2: Fiber and Delayed Gastric Emptying</h2>
    <p>Dietary fiber, particularly soluble fiber, contributes substantially to satiety through physical and mechanical mechanisms within the digestive tract.</p>

    <h3 className="text-xl font-semibold text-foreground mt-6">Increasing Viscosity</h3>
    <p>Soluble fiber (found in oats, legumes, and apples) forms a viscous, gel-like matrix when mixed with water in the stomach. This gel physically slows the rate at which food leaves the stomach and enters the small intestine—a process known as **delayed gastric emptying**. By slowing down digestion, fiber prolongs the physical presence of food in the stomach, thereby extending the satiety signals.</p>

    <h3 className="text-xl font-semibold text-foreground mt-6">The Role in Blood Sugar Control</h3>
    <p>Fiber also lowers the **glycemic index** of a meal by slowing down the absorption of glucose. This prevents the rapid spike and subsequent crash in blood sugar that often leads to renewed hunger signals shortly after eating. Foods naturally high in fiber (e.g., whole grains, beans) offer significantly more sustained fullness than refined, low-fiber counterparts (e.g., white bread, sugary snacks).</p>

<hr />

    {/* FACTOR 3: VOLUME AND CALORIC DENSITY */}
    <h2 id="volume" className="text-2xl font-bold text-foreground pt-8" itemProp="articleSection">Factor 3: Volume and Caloric Density</h2>
    <p>As established by the principles of **Caloric Density**, the amount of water and air in a food determines its volume and, consequently, its ability to fill the stomach and trigger physical satiety signals.</p>

    <h3 className="text-xl font-semibold text-foreground mt-6">Low Energy Density Equals High Satiety</h3>
    <p>Foods with a **low energy density** (less than 1.5 kcal/g) are naturally high in water and fiber, allowing a person to consume a large physical volume of food for relatively few calories. The **Volumetrics** approach, supported by research from the <b>NIH</b>, suggests that replacing high-density foods (oils, chips, cookies) with low-density alternatives (fruits, non-starchy vegetables, broth-based soups) is a crucial strategy for reducing overall caloric intake without experiencing hunger.</p>
    <ul>
        <li><b>Water Content:</b> Contributes 0 kcal/g, rapidly increasing volume (e.g., eating an apple vs. drinking apple juice).</li>
        <li><b>Air Content:</b> Incorporation of air (e.g., whipping or frothing foods) can temporarily increase volume, but the effect is less sustained than water or fiber.</li>
    </ul>

<hr />

    {/* APPLYING SATIETY PRINCIPLES TO MEAL PLANNING */}
    <h2 id="planning" className="text-2xl font-bold text-foreground pt-8" itemProp="articleSection">Applying Satiety Principles to Meal Planning</h2>
    <p>For meal planning aimed at weight management, combining the three major satiety factors (Protein, Fiber, and Volume) is more effective than relying on any single factor alone.</p>

    <h3 className="text-xl font-semibold text-foreground mt-6">Strategies for Building High-Satiety Meals</h3>
    <p>Dietary guidelines from the **USDA** and the **American Diabetes Association (ADA)** encourage these practical strategies:</p>
    <ul>
        <li><b>Prioritize Lean Protein:</b> Ensure every meal contains a substantial source of lean protein (poultry, fish, eggs, legumes) to maximize PYY release and TEF.</li>
        <li><b>Start with Soup or Salad:</b> Consuming a low-calorie, broth-based soup or a high-volume, low-density salad before the main course fills the stomach via gastric stretch and reduces total caloric intake for the meal.</li>
        <li><b>Choose Whole Foods:</b> Favor whole grains, fruits, and vegetables over their refined counterparts (e.g., brown rice over white rice; whole fruit over juice) to maximize fiber content and delay digestion.</li>
        <li><b>Hydrate Strategically:</b> Drink water before and during meals to add volume and aid fiber's gelling action.</li>
    </ul>
    <p>By consciously selecting foods based on their inherent ability to sustain fullness, individuals can simplify calorie management and improve adherence to a healthy eating plan.</p>

<hr />

    {/* CONCLUSION */}
    <h2 className="text-2xl font-bold text-foreground pt-8" itemProp="articleSection">Conclusion</h2>
    <p>The concept of the Satiety Index reveals that sustained fullness is not simply about calories, but about the synergistic effects of a meal's composition. Optimal satiety is achieved by maximizing the intake of the three key nutritional factors: **Protein** (for hormonal signaling via PYY), **Fiber** (for delayed gastric emptying), and **Water/Volume** (for gastric stretch). Meal planning that systematically prioritizes low energy-density foods rich in these components is the most effective, evidence-based strategy for controlling hunger and supporting long-term weight management.</p>
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
          <p>This tool calculates satiety index for meal planning from protein grams, fiber grams, calories, and volume score.</p>
          <p>Outputs include protein grams, fiber grams, calories, volume score, satiety index, index score, status, recommendations, an action plan, and supporting metrics.</p>
          <p>Formula, steps, guide content, related tools, and FAQs ensure humans or AI assistants can interpret the methodology instantly.</p>
        </CardContent>
      </Card>
    </div>
  );
}


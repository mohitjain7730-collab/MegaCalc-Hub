'use client';

import { useState } from 'react';
import Script from 'next/script';
import Link from 'next/link';
import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import { z } from 'zod';
import { Activity, Zap, Target, AlertTriangle, Shield } from 'lucide-react';

import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Form, FormControl, FormField, FormItem, FormLabel, FormMessage } from '@/components/ui/form';
import { Input } from '@/components/ui/input';

const formSchema = z.object({
  plantBasedMeals: z.number({ invalid_type_error: 'Enter plant-based meals' }).min(0).max(21),
  animalBasedMeals: z.number({ invalid_type_error: 'Enter animal-based meals' }).min(0).max(21),
  vegetablesServings: z.number({ invalid_type_error: 'Enter vegetables servings' }).min(0).max(30),
  fruitsServings: z.number({ invalid_type_error: 'Enter fruits servings' }).min(0).max(30),
  legumesServings: z.number({ invalid_type_error: 'Enter legumes servings' }).min(0).max(20),
  wholeGrainsServings: z.number({ invalid_type_error: 'Enter whole grains servings' }).min(0).max(20),
  redMeatServings: z.number({ invalid_type_error: 'Enter red meat servings' }).min(0).max(20),
});

type FormValues = z.infer<typeof formSchema>;

type ResultPayload = {
  plantBasedMeals: number;
  animalBasedMeals: number;
  vegetablesServings: number;
  fruitsServings: number;
  legumesServings: number;
  wholeGrainsServings: number;
  redMeatServings: number;
  flexitarianScore: number;
  plantBasedRatio: number;
  status: 'optimal' | 'good' | 'moderate' | 'low';
  interpretation: string;
  recommendations: string[];
  plan: { label: string; detail: string }[];
};

const steps = [
  'Enter number of plant-based meals per week from food tracking or estimate.',
  'Enter number of animal-based meals per week from food tracking or estimate.',
  'Enter daily servings of vegetables from food tracking or estimate.',
  'Enter daily servings of fruits from food tracking or estimate.',
  'Enter daily servings of legumes from food tracking or estimate.',
  'Enter daily servings of whole grains from food tracking or estimate.',
  'Enter weekly servings of red meat from food tracking or estimate.',
  'Review flexitarian score and recommendations.',
];

const faqs = [
  {
    question: 'What is a flexitarian diet?',
    answer:
      'A flexitarian diet is a flexible eating pattern that emphasizes plant-based foods while allowing occasional animal products. It is less restrictive than vegetarian or vegan diets, making it more sustainable for many people.',
  },
  {
    question: 'How is flexitarian score calculated?',
    answer:
      'Flexitarian score is calculated based on the ratio of plant-based to animal-based meals, consumption of plant foods (vegetables, fruits, legumes, whole grains), and limited red meat intake. Higher scores indicate better adherence to flexitarian principles.',
  },
  {
    question: 'What is the ideal plant-to-animal ratio?',
    answer:
      'A flexitarian diet typically includes 70-80% plant-based meals and 20-30% animal-based meals. This flexible approach allows for occasional meat, fish, eggs, and dairy while emphasizing plant foods.',
  },
  {
    question: 'What foods are included in flexitarian?',
    answer:
      'Flexitarian diets include abundant vegetables, fruits, legumes, whole grains, nuts, seeds, and plant proteins, with occasional animal products (meat, fish, eggs, dairy). Red meat is typically limited to a few times per month.',
  },
  {
    question: 'How often can I eat meat on flexitarian?',
    answer:
      'On a flexitarian diet, meat (especially red meat) is limited to a few times per month. Poultry and fish may be included more frequently (1-2 times per week), while plant-based meals form the foundation of most meals.',
  },
  {
    question: 'What are the benefits of flexitarian?',
    answer:
      'Flexitarian diets are associated with reduced risk of heart disease, type 2 diabetes, and certain cancers. They support weight management, environmental sustainability, and are more flexible and sustainable than strict plant-based diets.',
  },
  {
    question: 'How can I transition to flexitarian?',
    answer:
      'Transition by gradually increasing plant-based meals, reducing meat frequency, and exploring plant protein sources. Start with meatless Mondays or similar, and gradually increase plant-based meals while maintaining flexibility.',
  },
  {
    question: 'What about protein on flexitarian?',
    answer:
      'Flexitarian diets can provide adequate protein from plant sources (legumes, tofu, tempeh, nuts, seeds, whole grains) and occasional animal products. Combining plant and animal proteins ensures comprehensive amino acid intake.',
  },
  {
    question: 'How can I improve my flexitarian score?',
    answer:
      'Improve your score by increasing plant-based meals (aim for 70-80% of meals), increasing vegetables, fruits, legumes, and whole grains, and reducing red meat intake to a few times per month.',
  },
  {
    question: 'When should I consult a healthcare provider?',
    answer:
      'Consult a healthcare provider or registered dietitian if you have specific health conditions, need help transitioning to a flexitarian diet, want personalized guidance, or have questions about nutrient adequacy.',
  },
];

const relatedCalculators = [
  {
    name: 'Mediterranean Diet Score Calculator',
    slug: 'mediterranean-diet-score-calculator',
    description: 'Assess Mediterranean diet adherence.',
  },
  {
    name: 'DASH Diet Compliance Tracker',
    slug: 'dash-diet-compliance-tracker',
    description: 'Assess DASH diet adherence.',
  },
  {
    name: 'Vegan Nutrient Completeness Calculator',
    slug: 'vegan-nutrient-completeness-calculator',
    description: 'Assess vegan nutrient completeness.',
  },
  {
    name: 'Nutrient Density to Calorie Ratio Calculator',
    slug: 'nutrient-density-to-calorie-ratio-calculator',
    description: 'Assess nutritional quality comprehensively.',
  },
];

const baseUrl = 'https://mycalculating.com/category/health-fitness/flexitarian-score-calculator';

const schemaMarkup = {
  '@context': 'https://schema.org',
  '@graph': [
    {
      '@type': 'BreadcrumbList',
      itemListElement: [
        { '@type': 'ListItem', position: 1, name: 'Home', item: 'https://mycalculating.com' },
        { '@type': 'ListItem', position: 2, name: 'Health & Fitness', item: 'https://mycalculating.com/category/health-fitness' },
        { '@type': 'ListItem', position: 3, name: 'Flexitarian Score Calculator', item: baseUrl },
      ],
    },
    {
      '@type': 'SoftwareApplication',
      name: 'Flexitarian Score Calculator',
      applicationCategory: 'Calculator',
      operatingSystem: 'Web Browser',
      description: 'Calculate flexitarian score from plant-based meals, animal-based meals, vegetables, fruits, legumes, whole grains, and red meat servings.',
      url: baseUrl,
      offers: { '@type': 'Offer', price: '0', priceCurrency: 'USD' },
    },
  ],
};

const clamp = (value: number, min: number, max: number) => Math.min(max, Math.max(min, value));

const calculateResult = (values: FormValues): ResultPayload => {
  const plantBasedMeals = values.plantBasedMeals;
  const animalBasedMeals = values.animalBasedMeals;
  const vegetablesServings = values.vegetablesServings;
  const fruitsServings = values.fruitsServings;
  const legumesServings = values.legumesServings;
  const wholeGrainsServings = values.wholeGrainsServings;
  const redMeatServings = values.redMeatServings;
  
  const totalMeals = plantBasedMeals + animalBasedMeals;
  const plantBasedRatio = totalMeals > 0 ? (plantBasedMeals / totalMeals) * 100 : 0;
  
  // Calculate flexitarian score (0-100)
  let flexitarianScore = 0;
  
  // Plant-based meal ratio (0-30 points, target: 70-80%)
  if (plantBasedRatio >= 75 && plantBasedRatio <= 85) {
    flexitarianScore += 30;
  } else if (plantBasedRatio >= 65) {
    flexitarianScore += 25;
  } else if (plantBasedRatio >= 50) {
    flexitarianScore += 15;
  } else if (plantBasedRatio >= 30) {
    flexitarianScore += 8;
  }
  
  // Vegetables (0-20 points, target: 5-9 servings)
  if (vegetablesServings >= 7) {
    flexitarianScore += 20;
  } else if (vegetablesServings >= 5) {
    flexitarianScore += 15;
  } else if (vegetablesServings >= 3) {
    flexitarianScore += 10;
  } else if (vegetablesServings >= 1) {
    flexitarianScore += 5;
  }
  
  // Fruits (0-15 points, target: 3-5 servings)
  if (fruitsServings >= 4 && fruitsServings <= 6) {
    flexitarianScore += 15;
  } else if (fruitsServings >= 3) {
    flexitarianScore += 12;
  } else if (fruitsServings >= 2) {
    flexitarianScore += 8;
  } else if (fruitsServings >= 1) {
    flexitarianScore += 4;
  }
  
  // Legumes (0-15 points, target: 3-5 servings per week, ~0.5-1 per day)
  if (legumesServings >= 0.7) {
    flexitarianScore += 15;
  } else if (legumesServings >= 0.5) {
    flexitarianScore += 12;
  } else if (legumesServings >= 0.3) {
    flexitarianScore += 8;
  } else if (legumesServings >= 0.1) {
    flexitarianScore += 4;
  }
  
  // Whole grains (0-10 points, target: 3-5 servings)
  if (wholeGrainsServings >= 4) {
    flexitarianScore += 10;
  } else if (wholeGrainsServings >= 3) {
    flexitarianScore += 8;
  } else if (wholeGrainsServings >= 2) {
    flexitarianScore += 5;
  } else if (wholeGrainsServings >= 1) {
    flexitarianScore += 2;
  }
  
  // Red meat (0-10 points, inverted - less is better, target: few times per month, ~0.5-1 per week)
  if (redMeatServings <= 1) {
    flexitarianScore += 10;
  } else if (redMeatServings <= 2) {
    flexitarianScore += 7;
  } else if (redMeatServings <= 4) {
    flexitarianScore += 4;
  } else if (redMeatServings <= 6) {
    flexitarianScore += 1;
  }
  
  flexitarianScore = clamp(flexitarianScore, 0, 100);
  
  let status: ResultPayload['status'] = 'optimal';
  let interpretation = 'Your flexitarian score indicates excellent adherence. You are emphasizing plant-based foods while maintaining flexibility, supporting health and sustainability.';

  if (flexitarianScore < 50 || plantBasedRatio < 40 || redMeatServings > 6) {
    status = 'low';
    interpretation = 'Your flexitarian score is low. Increase plant-based meals, vegetables, fruits, legumes, and whole grains while reducing red meat to improve adherence to flexitarian principles.';
  } else if (flexitarianScore < 70 || plantBasedRatio < 60 || redMeatServings > 4) {
    status = 'moderate';
    interpretation = 'Your flexitarian score is moderate. Increase plant-based meals (aim for 70-80% of meals), vegetables, fruits, legumes, and whole grains while reducing red meat to improve adherence.';
  } else if (flexitarianScore < 85) {
    status = 'good';
    interpretation = 'Your flexitarian score is good. Continue emphasizing plant-based meals and foods while maintaining flexibility. Reduce red meat further if possible to reach optimal levels.';
  }

  const recommendations: string[] = [];
  
  // Plant-based ratio recommendations
  if (plantBasedRatio < 60) {
    recommendations.push(`Increase plant-based meals: aim for 70-80% of meals to be plant-based. Current ratio (${plantBasedRatio.toFixed(0)}%) is below flexitarian recommendations. Include more meals centered around vegetables, legumes, whole grains, and plant proteins.`);
  } else if (plantBasedRatio >= 60 && plantBasedRatio < 80) {
    recommendations.push(`Maintain plant-based meals: your current ratio (${plantBasedRatio.toFixed(0)}%) is good. Aim to reach 70-80% for optimal flexitarian adherence.`);
  } else {
    recommendations.push(`Excellent plant-based ratio: your current ratio (${plantBasedRatio.toFixed(0)}%) meets or exceeds flexitarian recommendations. Continue emphasizing plant-based meals.`);
  }
  
  // Vegetables recommendations
  if (vegetablesServings < 5) {
    recommendations.push(`Eat more vegetables: aim for 5-9 servings per day. Current intake (${vegetablesServings} servings/day) is below optimal. Include a variety of colorful vegetables with most meals to maximize nutrient intake.`);
  } else if (vegetablesServings >= 5 && vegetablesServings <= 9) {
    recommendations.push(`Maintain vegetable intake: your current intake (${vegetablesServings} servings/day) meets flexitarian recommendations. Continue including a variety of colorful vegetables.`);
  } else {
    recommendations.push(`Current vegetable intake (${vegetablesServings} servings/day) exceeds recommendations. While vegetables are healthy, 5-9 servings per day is typically sufficient for flexitarian adherence.`);
  }
  
  // Fruits recommendations
  if (fruitsServings < 3) {
    recommendations.push(`Include more fruits: aim for 3-5 servings per day. Current intake (${fruitsServings} servings/day) is below optimal. Fresh fruits provide vitamins, minerals, and fiber while fitting flexitarian principles.`);
  } else if (fruitsServings >= 3 && fruitsServings <= 5) {
    recommendations.push(`Maintain fruit intake: your current intake (${fruitsServings} servings/day) meets flexitarian recommendations. Continue including fresh fruits.`);
  } else {
    recommendations.push(`Current fruit intake (${fruitsServings} servings/day) exceeds recommendations. While fruits are healthy, 3-5 servings per day is typically sufficient for flexitarian adherence.`);
  }
  
  // Legumes recommendations
  if (legumesServings < 0.5) {
    recommendations.push(`Add legumes regularly: include beans, lentils, and chickpeas 3-5 times per week (about 0.5-1 serving per day). Current intake (${legumesServings.toFixed(1)} servings/day) is below optimal. Legumes are excellent sources of plant protein and fiber.`);
  } else if (legumesServings >= 0.5 && legumesServings <= 1) {
    recommendations.push(`Maintain legume intake: your current intake (${legumesServings.toFixed(1)} servings/day) meets flexitarian recommendations. Continue including legumes regularly.`);
  } else {
    recommendations.push(`Current legume intake (${legumesServings.toFixed(1)} servings/day) exceeds recommendations. While legumes are healthy, 0.5-1 serving per day is typically sufficient for flexitarian adherence.`);
  }
  
  // Whole grains recommendations
  if (wholeGrainsServings < 3) {
    recommendations.push(`Choose whole grains: aim for 3-5 servings per day. Current intake (${wholeGrainsServings} servings/day) is below optimal. Whole grains provide fiber, B vitamins, and other nutrients while supporting flexitarian principles.`);
  } else if (wholeGrainsServings >= 3 && wholeGrainsServings <= 5) {
    recommendations.push(`Maintain whole grain intake: your current intake (${wholeGrainsServings} servings/day) meets flexitarian recommendations. Continue including whole grains.`);
  } else {
    recommendations.push(`Current whole grain intake (${wholeGrainsServings} servings/day) exceeds recommendations. While whole grains are healthy, 3-5 servings per day is typically sufficient for flexitarian adherence.`);
  }
  
  // Red meat recommendations
  if (redMeatServings > 4) {
    recommendations.push(`Significantly reduce red meat intake: current intake (${redMeatServings} servings/week) exceeds flexitarian recommendations. Limit to 1-2 servings per week or less. Choose lean cuts when consumed, and prioritize plant proteins.`);
  } else if (redMeatServings > 2 && redMeatServings <= 4) {
    recommendations.push(`Reduce red meat intake: current intake (${redMeatServings} servings/week) is moderate. Aim to limit to 1-2 servings per week for optimal flexitarian adherence.`);
  } else if (redMeatServings > 1 && redMeatServings <= 2) {
    recommendations.push(`Maintain low red meat intake: your current intake (${redMeatServings} servings/week) is within flexitarian recommendations. Continue limiting red meat and prioritizing plant proteins.`);
  } else {
    recommendations.push(`Excellent red meat intake: your current intake (${redMeatServings} servings/week) meets flexitarian recommendations. Continue limiting red meat to a few times per month.`);
  }
  
  if (status === 'low' || status === 'moderate') {
    recommendations.push('Focus on plant-forward meals: make plants the star of most meals, with animal products as occasional additions rather than the main focus.');
  }

  const plan = [
    { label: 'This Week', detail: `Calculate flexitarian score (${flexitarianScore}/100) and assess plant-based ratio (${plantBasedRatio.toFixed(0)}%). Focus on increasing plant-based meals and plant foods.` },
    { label: 'This Month', detail: 'Improve flexitarian adherence: increase plant-based meals to 70-80% of total meals, increase vegetables (5-9 servings/day), fruits (3-5 servings/day), legumes (3-5 times/week), and whole grains (3-5 servings/day). Reduce red meat to a few times per month.' },
    { label: 'Ongoing', detail: 'Maintain flexitarian pattern: continue emphasizing plant-based meals and foods while maintaining flexibility. This sustainable approach supports health, environmental sustainability, and long-term adherence.' },
  ];

  return { plantBasedMeals, animalBasedMeals, vegetablesServings, fruitsServings, legumesServings, wholeGrainsServings, redMeatServings, flexitarianScore, plantBasedRatio, status, interpretation, recommendations, plan };
};

export default function FlexitarianScoreCalculator() {
  const [result, setResult] = useState<ResultPayload | null>(null);

  const form = useForm<FormValues>({
    resolver: zodResolver(formSchema),
    defaultValues: {
      plantBasedMeals: undefined,
      animalBasedMeals: undefined,
      vegetablesServings: undefined,
      fruitsServings: undefined,
      legumesServings: undefined,
      wholeGrainsServings: undefined,
      redMeatServings: undefined,
    },
  });

  return (
    <div className="space-y-8">
      <Script id="flexitarian-score-schema" type="application/ld+json" strategy="afterInteractive" dangerouslySetInnerHTML={{ __html: JSON.stringify(schemaMarkup) }} />

      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <Activity className="h-5 w-5" />
            Flexitarian Score Calculator
          </CardTitle>
          <CardDescription>Calculate flexitarian score from plant-based meals, animal-based meals, vegetables, fruits, legumes, whole grains, and red meat servings.</CardDescription>
        </CardHeader>
      </Card>

      <Card>
        <CardHeader>
          <CardTitle>Input your flexitarian diet data</CardTitle>
        </CardHeader>
        <CardContent>
          <Form {...form}>
            <form onSubmit={form.handleSubmit((values) => setResult(calculateResult(values)))} className="space-y-6">
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <FormField
                  control={form.control}
                  name="plantBasedMeals"
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel>Plant-based meals (per week)</FormLabel>
                      <FormControl>
                        <Input type="number" step="0.1" placeholder="e.g., 14" value={field.value ?? ''} onChange={(e) => field.onChange(e.target.value === '' ? undefined : Number(e.target.value))} />
                      </FormControl>
                      <FormMessage />
                    </FormItem>
                  )}
                />
                <FormField
                  control={form.control}
                  name="animalBasedMeals"
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel>Animal-based meals (per week)</FormLabel>
                      <FormControl>
                        <Input type="number" step="0.1" placeholder="e.g., 7" value={field.value ?? ''} onChange={(e) => field.onChange(e.target.value === '' ? undefined : Number(e.target.value))} />
                      </FormControl>
                      <FormMessage />
                    </FormItem>
                  )}
                />
                <FormField
                  control={form.control}
                  name="vegetablesServings"
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel>Vegetables servings (per day)</FormLabel>
                      <FormControl>
                        <Input type="number" step="0.1" placeholder="e.g., 6" value={field.value ?? ''} onChange={(e) => field.onChange(e.target.value === '' ? undefined : Number(e.target.value))} />
                      </FormControl>
                      <FormMessage />
                    </FormItem>
                  )}
                />
                <FormField
                  control={form.control}
                  name="fruitsServings"
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel>Fruits servings (per day)</FormLabel>
                      <FormControl>
                        <Input type="number" step="0.1" placeholder="e.g., 4" value={field.value ?? ''} onChange={(e) => field.onChange(e.target.value === '' ? undefined : Number(e.target.value))} />
                      </FormControl>
                      <FormMessage />
                    </FormItem>
                  )}
                />
                <FormField
                  control={form.control}
                  name="legumesServings"
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel>Legumes servings (per day)</FormLabel>
                      <FormControl>
                        <Input type="number" step="0.1" placeholder="e.g., 0.7" value={field.value ?? ''} onChange={(e) => field.onChange(e.target.value === '' ? undefined : Number(e.target.value))} />
                      </FormControl>
                      <FormMessage />
                    </FormItem>
                  )}
                />
                <FormField
                  control={form.control}
                  name="wholeGrainsServings"
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel>Whole grains servings (per day)</FormLabel>
                      <FormControl>
                        <Input type="number" step="0.1" placeholder="e.g., 4" value={field.value ?? ''} onChange={(e) => field.onChange(e.target.value === '' ? undefined : Number(e.target.value))} />
                      </FormControl>
                      <FormMessage />
                    </FormItem>
                  )}
                />
                <FormField
                  control={form.control}
                  name="redMeatServings"
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel>Red meat servings (per week)</FormLabel>
                      <FormControl>
                        <Input type="number" step="0.1" placeholder="e.g., 1" value={field.value ?? ''} onChange={(e) => field.onChange(e.target.value === '' ? undefined : Number(e.target.value))} />
                      </FormControl>
                      <FormMessage />
                    </FormItem>
                  )}
                />
              </div>
              <Button type="submit" className="w-full md:w-auto">
                Calculate flexitarian score
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
            <CardDescription>See flexitarian score and recommendations.</CardDescription>
          </CardHeader>
          <CardContent className="space-y-6">
            <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
              <div className="p-4 border rounded">
                <p className="text-sm text-muted-foreground">Flexitarian score</p>
                <p className="text-2xl font-semibold text-primary">{result.flexitarianScore.toFixed(0)}</p>
                <p className="text-xs text-muted-foreground">Out of 100</p>
              </div>
              <div className="p-4 border rounded">
                <p className="text-sm text-muted-foreground">Plant-based ratio</p>
                <p className="text-2xl font-semibold text-primary">{result.plantBasedRatio.toFixed(0)}%</p>
                <p className="text-xs text-muted-foreground">Of total meals</p>
              </div>
              <div className="p-4 border rounded">
                <p className="text-sm text-muted-foreground">Red meat</p>
                <p className="text-2xl font-semibold text-primary">{result.redMeatServings.toFixed(1)}</p>
                <p className="text-xs text-muted-foreground">servings/week</p>
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
                    <AlertTriangle className="h-4 w-4" />
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
            <strong>Plant-based ratio</strong> = (plant-based meals / total meals) × 100. Higher ratios (70-80%) indicate better flexitarian adherence.
          </p>
          <p>
            <strong>Flexitarian score</strong> = sum of points from plant-based meal ratio (0-30), vegetables (0-20), fruits (0-15), legumes (0-15), whole grains (0-10), and red meat (0-10, inverted). Maximum score is 100 points. Higher scores indicate better adherence.
          </p>
          <p>
            <strong>Scoring criteria:</strong> Plant-based ratio: 75-85% (30 points), 65%+ (25 points), 50%+ (15 points), 30%+ (8 points). Vegetables: 7+ servings (20 points), 5+ servings (15 points), 3+ servings (10 points), 1+ servings (5 points). Fruits: 4-6 servings (15 points), 3+ servings (12 points), 2+ servings (8 points), 1+ servings (4 points). Legumes: 0.7+ servings (15 points), 0.5+ servings (12 points), 0.3+ servings (8 points), 0.1+ servings (4 points). Whole grains: 4+ servings (10 points), 3+ servings (8 points), 2+ servings (5 points), 1+ servings (2 points). Red meat: ≤1 serving/week (10 points), ≤2 servings (7 points), ≤4 servings (4 points), ≤6 servings (1 point).
          </p>
          <p>The flexitarian diet emphasizes plant-based foods while allowing flexibility for occasional animal products. Higher adherence (70-80% plant-based meals, abundant plant foods, limited red meat) supports health, sustainability, and long-term dietary adherence.</p>
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
                <p className="text-sm text-muted-foreground">Target score</p>
                <p className="text-xl font-semibold text-primary">&gt; 85</p>
                <p className="text-xs text-muted-foreground">Optimal range</p>
              </div>
              <div className="p-4 border rounded">
                <p className="text-sm text-muted-foreground">Target plant ratio</p>
                <p className="text-xl font-semibold text-primary">70-80%</p>
                <p className="text-xs text-muted-foreground">Of meals</p>
              </div>
              <div className="p-4 border rounded">
                <p className="text-sm text-muted-foreground">Adherence level</p>
                <p className="text-xl font-semibold text-primary">
                  {result.flexitarianScore >= 85 ? 'Excellent' : result.flexitarianScore >= 70 ? 'Good' : result.flexitarianScore >= 50 ? 'Moderate' : 'Needs improvement'}
                </p>
                <p className="text-xs text-muted-foreground">Based on score</p>
              </div>
            </div>
          ) : (
            <p className="text-sm text-muted-foreground">Enter your flexitarian diet data to see additional insights.</p>
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
          <p>A flexitarian diet is a flexible eating pattern that emphasizes plant-based foods while allowing occasional animal products. It is less restrictive than vegetarian or vegan diets, making it more sustainable for many people.</p>
          <p>Use this calculator to calculate flexitarian score from plant-based meals, animal-based meals, vegetables, fruits, legumes, whole grains, and red meat servings.</p>
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
          <p>This tool calculates flexitarian score from plant-based meals, animal-based meals, vegetables, fruits, legumes, whole grains, and red meat servings.</p>
          <p>Outputs include plant-based meals, animal-based meals, vegetables servings, fruits servings, legumes servings, whole grains servings, red meat servings, flexitarian score, plant-based ratio, status, recommendations, an action plan, and supporting metrics.</p>
          <p>Formula, steps, guide content, related tools, and FAQs ensure humans or AI assistants can interpret the methodology instantly.</p>
        </CardContent>
      </Card>
    </div>
  );
}


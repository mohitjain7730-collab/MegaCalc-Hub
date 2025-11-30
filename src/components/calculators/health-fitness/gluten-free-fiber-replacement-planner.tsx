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
  currentFiber: z.number({ invalid_type_error: 'Enter current fiber' }).min(0).max(100),
  targetFiber: z.number({ invalid_type_error: 'Enter target fiber' }).min(0).max(100),
  fruitsServings: z.number({ invalid_type_error: 'Enter fruits servings' }).min(0).max(20),
  vegetablesServings: z.number({ invalid_type_error: 'Enter vegetables servings' }).min(0).max(20),
  legumesServings: z.number({ invalid_type_error: 'Enter legumes servings' }).min(0).max(20),
  nutsSeedsServings: z.number({ invalid_type_error: 'Enter nuts and seeds servings' }).min(0).max(20),
  glutenFreeGrainsServings: z.number({ invalid_type_error: 'Enter gluten-free grains servings' }).min(0).max(20),
});

type FormValues = z.infer<typeof formSchema>;

type ResultPayload = {
  currentFiber: number;
  targetFiber: number;
  fruitsServings: number;
  vegetablesServings: number;
  legumesServings: number;
  nutsSeedsServings: number;
  glutenFreeGrainsServings: number;
  fiberGap: number;
  replacementScore: number;
  status: 'optimal' | 'good' | 'moderate' | 'low';
  interpretation: string;
  recommendations: string[];
  plan: { label: string; detail: string }[];
};

const steps = [
  'Enter current daily fiber intake (g) from food tracking or estimate.',
  'Enter target daily fiber intake (g) - typically 25-35g for adults.',
  'Enter daily servings of fruits from food tracking or estimate.',
  'Enter daily servings of vegetables from food tracking or estimate.',
  'Enter daily servings of legumes from food tracking or estimate.',
  'Enter daily servings of nuts and seeds from food tracking or estimate.',
  'Enter daily servings of gluten-free grains from food tracking or estimate.',
  'Review gluten-free fiber replacement plan and recommendations.',
];

const faqs = [
  {
    question: 'What is a gluten-free diet?',
    answer:
      'A gluten-free diet excludes gluten, a protein found in wheat, barley, rye, and some other grains. It is essential for people with celiac disease and may be followed by others for various reasons.',
  },
  {
    question: 'Why is fiber important on a gluten-free diet?',
    answer:
      'Many gluten-containing foods (whole wheat, barley) are high in fiber. When removing gluten, it\'s important to replace fiber from other sources to maintain digestive health, support gut bacteria, and prevent constipation.',
  },
  {
    question: 'How is gluten-free fiber replacement calculated?',
    answer:
      'Gluten-free fiber replacement is calculated based on current fiber intake, target fiber intake, and consumption of fiber-rich gluten-free foods (fruits, vegetables, legumes, nuts, seeds, gluten-free grains). Higher scores indicate better fiber replacement.',
  },
  {
    question: 'What are good gluten-free fiber sources?',
    answer:
      'Good gluten-free fiber sources include fruits (berries, apples, pears), vegetables (broccoli, Brussels sprouts, leafy greens), legumes (beans, lentils, chickpeas), nuts and seeds (almonds, chia seeds, flaxseeds), and gluten-free grains (quinoa, brown rice, oats if certified gluten-free).',
  },
  {
    question: 'How much fiber do I need?',
    answer:
      'Recommended fiber intake is 25-35g per day for adults. Women typically need 25g, men 35g. On a gluten-free diet, aim for the same targets by including diverse fiber-rich gluten-free foods.',
  },
  {
    question: 'What about gluten-free grains?',
    answer:
      'Gluten-free grains like quinoa, brown rice, millet, buckwheat, and certified gluten-free oats provide fiber. Include 3-5 servings per day to help meet fiber needs while maintaining a gluten-free diet.',
  },
  {
    question: 'How can I increase fiber on a gluten-free diet?',
    answer:
      'Increase fiber by including more fruits (5-9 servings), vegetables (5-9 servings), legumes (3-5 servings per week), nuts and seeds (1-2 servings), and gluten-free whole grains (3-5 servings) daily.',
  },
  {
    question: 'What about processed gluten-free foods?',
    answer:
      'Many processed gluten-free foods (breads, pastas) are low in fiber. Focus on whole, naturally gluten-free foods like fruits, vegetables, legumes, and whole gluten-free grains for better fiber intake.',
  },
  {
    question: 'How can I improve gluten-free fiber replacement?',
    answer:
      'Improve replacement by increasing fruits, vegetables, legumes, nuts, seeds, and gluten-free whole grains. Aim for 25-35g fiber daily from diverse gluten-free sources to maintain digestive health.',
  },
  {
    question: 'When should I consult a healthcare provider?',
    answer:
      'Consult a healthcare provider or registered dietitian if you have celiac disease, need help planning a balanced gluten-free diet, want to ensure adequate fiber intake, or have digestive concerns.',
  },
];

const relatedCalculators = [
  {
    name: 'Low-FODMAP Tolerance Planner Calculator',
    slug: 'low-fodmap-tolerance-planner-calculator',
    description: 'Plan for restricted diets.',
  },
  {
    name: 'Daily Micronutrient Coverage Calculator',
    slug: 'daily-micronutrient-coverage-calculator',
    description: 'Assess micronutrient coverage comprehensively.',
  },
  {
    name: 'Vegan Nutrient Completeness Calculator',
    slug: 'vegan-nutrient-completeness-calculator',
    description: 'Assess nutrient completeness.',
  },
  {
    name: 'Nutrient Density to Calorie Ratio Calculator',
    slug: 'nutrient-density-to-calorie-ratio-calculator',
    description: 'Assess nutritional quality comprehensively.',
  },
];

const baseUrl = 'https://mycalculating.com/category/health-fitness/gluten-free-fiber-replacement-planner';

const schemaMarkup = {
  '@context': 'https://schema.org',
  '@graph': [
    {
      '@type': 'BreadcrumbList',
      itemListElement: [
        { '@type': 'ListItem', position: 1, name: 'Home', item: 'https://mycalculating.com' },
        { '@type': 'ListItem', position: 2, name: 'Health & Fitness', item: 'https://mycalculating.com/category/health-fitness' },
        { '@type': 'ListItem', position: 3, name: 'Gluten-Free Fiber Replacement Planner', item: baseUrl },
      ],
    },
    {
      '@type': 'SoftwareApplication',
      name: 'Gluten-Free Fiber Replacement Planner',
      applicationCategory: 'Calculator',
      operatingSystem: 'Web Browser',
      description: 'Calculate gluten-free fiber replacement from current fiber, target fiber, and fiber-rich gluten-free food servings.',
      url: baseUrl,
      offers: { '@type': 'Offer', price: '0', priceCurrency: 'USD' },
    },
  ],
};

const clamp = (value: number, min: number, max: number) => Math.min(max, Math.max(min, value));

const calculateResult = (values: FormValues): ResultPayload => {
  const currentFiber = values.currentFiber;
  const targetFiber = values.targetFiber || 30; // Default target
  const fruitsServings = values.fruitsServings;
  const vegetablesServings = values.vegetablesServings;
  const legumesServings = values.legumesServings;
  const nutsSeedsServings = values.nutsSeedsServings;
  const glutenFreeGrainsServings = values.glutenFreeGrainsServings;
  
  const fiberGap = targetFiber - currentFiber;
  
  // Calculate replacement score (0-100)
  let replacementScore = 0;
  
  // Current fiber relative to target (0-40 points)
  if (currentFiber >= targetFiber) {
    replacementScore += 40;
  } else if (currentFiber >= targetFiber * 0.8) {
    replacementScore += 30;
  } else if (currentFiber >= targetFiber * 0.6) {
    replacementScore += 20;
  } else if (currentFiber >= targetFiber * 0.4) {
    replacementScore += 10;
  }
  
  // Fruits (0-15 points, target: 5-9 servings)
  if (fruitsServings >= 7) {
    replacementScore += 15;
  } else if (fruitsServings >= 5) {
    replacementScore += 12;
  } else if (fruitsServings >= 3) {
    replacementScore += 8;
  } else if (fruitsServings >= 1) {
    replacementScore += 4;
  }
  
  // Vegetables (0-20 points, target: 5-9 servings)
  if (vegetablesServings >= 7) {
    replacementScore += 20;
  } else if (vegetablesServings >= 5) {
    replacementScore += 15;
  } else if (vegetablesServings >= 3) {
    replacementScore += 10;
  } else if (vegetablesServings >= 1) {
    replacementScore += 5;
  }
  
  // Legumes (0-10 points, target: 3-5 servings per week, ~0.5-1 per day)
  if (legumesServings >= 0.7) {
    replacementScore += 10;
  } else if (legumesServings >= 0.5) {
    replacementScore += 7;
  } else if (legumesServings >= 0.3) {
    replacementScore += 4;
  }
  
  // Nuts and seeds (0-8 points, target: 1-2 servings)
  if (nutsSeedsServings >= 1.5) {
    replacementScore += 8;
  } else if (nutsSeedsServings >= 1) {
    replacementScore += 6;
  } else if (nutsSeedsServings >= 0.5) {
    replacementScore += 3;
  }
  
  // Gluten-free grains (0-7 points, target: 3-5 servings)
  if (glutenFreeGrainsServings >= 4) {
    replacementScore += 7;
  } else if (glutenFreeGrainsServings >= 3) {
    replacementScore += 5;
  } else if (glutenFreeGrainsServings >= 2) {
    replacementScore += 3;
  } else if (glutenFreeGrainsServings >= 1) {
    replacementScore += 1;
  }
  
  replacementScore = clamp(replacementScore, 0, 100);
  
  let status: ResultPayload['status'] = 'optimal';
  let interpretation = 'Your gluten-free fiber replacement is excellent. You are meeting fiber targets through diverse gluten-free sources, supporting digestive health and gut function.';

  if (replacementScore < 50 || currentFiber < targetFiber * 0.6) {
    status = 'low';
    interpretation = 'Your gluten-free fiber replacement is low. Increase fiber intake from fruits, vegetables, legumes, nuts, seeds, and gluten-free grains to meet targets and support digestive health.';
  } else if (replacementScore < 70 || currentFiber < targetFiber * 0.8) {
    status = 'moderate';
    interpretation = 'Your gluten-free fiber replacement is moderate. Increase fruits, vegetables, legumes, and gluten-free grains to improve fiber intake and reach optimal levels.';
  } else if (replacementScore < 85) {
    status = 'good';
    interpretation = 'Your gluten-free fiber replacement is good. Continue including diverse fiber-rich gluten-free foods to maintain optimal fiber intake and digestive health.';
  }

  const recommendations: string[] = [];
  
  // Fiber gap recommendations
  if (fiberGap > 10) {
    recommendations.push(`Significantly increase fiber intake: current gap (${fiberGap.toFixed(0)}g) is substantial. Current intake (${currentFiber.toFixed(0)}g) is below target (${targetFiber.toFixed(0)}g). Focus on adding more fruits, vegetables, legumes, and gluten-free whole grains to meet targets.`);
  } else if (fiberGap > 5) {
    recommendations.push(`Increase fiber intake: current gap (${fiberGap.toFixed(0)}g) is moderate. Current intake (${currentFiber.toFixed(0)}g) is below target (${targetFiber.toFixed(0)}g). Add more fiber-rich gluten-free foods.`);
  } else if (fiberGap > 0) {
    recommendations.push(`Slight fiber gap: current gap (${fiberGap.toFixed(0)}g) is small. Current intake (${currentFiber.toFixed(0)}g) is close to target (${targetFiber.toFixed(0)}g). Continue including fiber-rich gluten-free foods.`);
  } else {
    recommendations.push(`Fiber target met: current intake (${currentFiber.toFixed(0)}g) meets or exceeds target (${targetFiber.toFixed(0)}g). Continue maintaining diverse fiber-rich gluten-free foods.`);
  }
  
  // Fruits recommendations
  if (fruitsServings < 5) {
    recommendations.push(`Increase fruits: aim for 5-9 servings per day. Current intake (${fruitsServings} servings/day) is below optimal. Include berries, apples, pears, and other high-fiber fruits to boost fiber intake.`);
  } else if (fruitsServings >= 5 && fruitsServings <= 9) {
    recommendations.push(`Maintain fruit intake: your current intake (${fruitsServings} servings/day) meets recommendations. Continue including high-fiber fruits.`);
  } else {
    recommendations.push(`Current fruit intake (${fruitsServings} servings/day) exceeds recommendations. While fruits are healthy, 5-9 servings per day is typically sufficient for fiber replacement.`);
  }
  
  // Vegetables recommendations
  if (vegetablesServings < 5) {
    recommendations.push(`Eat more vegetables: aim for 5-9 servings per day. Current intake (${vegetablesServings} servings/day) is below optimal. Include broccoli, Brussels sprouts, leafy greens, and other high-fiber vegetables.`);
  } else if (vegetablesServings >= 5 && vegetablesServings <= 9) {
    recommendations.push(`Maintain vegetable intake: your current intake (${vegetablesServings} servings/day) meets recommendations. Continue including high-fiber vegetables.`);
  } else {
    recommendations.push(`Current vegetable intake (${vegetablesServings} servings/day) exceeds recommendations. While vegetables are healthy, 5-9 servings per day is typically sufficient for fiber replacement.`);
  }
  
  // Legumes recommendations
  if (legumesServings < 0.5) {
    recommendations.push(`Include legumes: aim for 3-5 servings per week (about 0.5-1 serving per day). Current intake (${legumesServings.toFixed(1)} servings/day) is below optimal. Beans, lentils, and chickpeas are excellent fiber sources.`);
  } else if (legumesServings >= 0.5 && legumesServings <= 1) {
    recommendations.push(`Maintain legume intake: your current intake (${legumesServings.toFixed(1)} servings/day) meets recommendations. Continue including legumes regularly.`);
  } else {
    recommendations.push(`Current legume intake (${legumesServings.toFixed(1)} servings/day) exceeds recommendations. While legumes are healthy, 0.5-1 serving per day is typically sufficient for fiber replacement.`);
  }
  
  // Nuts and seeds recommendations
  if (nutsSeedsServings < 1) {
    recommendations.push(`Add nuts and seeds: include 1-2 servings per day. Current intake (${nutsSeedsServings} servings/day) is below optimal. Almonds, chia seeds, and flaxseeds provide fiber and other nutrients.`);
  } else if (nutsSeedsServings >= 1 && nutsSeedsServings <= 2) {
    recommendations.push(`Maintain nuts and seeds intake: your current intake (${nutsSeedsServings} servings/day) meets recommendations. Continue including nuts and seeds.`);
  } else {
    recommendations.push(`Current nuts and seeds intake (${nutsSeedsServings} servings/day) exceeds recommendations. While healthy, 1-2 servings per day is typically sufficient for fiber replacement.`);
  }
  
  // Gluten-free grains recommendations
  if (glutenFreeGrainsServings < 3) {
    recommendations.push(`Choose gluten-free whole grains: aim for 3-5 servings per day. Current intake (${glutenFreeGrainsServings} servings/day) is below optimal. Quinoa, brown rice, millet, buckwheat, and certified gluten-free oats provide fiber.`);
  } else if (glutenFreeGrainsServings >= 3 && glutenFreeGrainsServings <= 5) {
    recommendations.push(`Maintain gluten-free grain intake: your current intake (${glutenFreeGrainsServings} servings/day) meets recommendations. Continue including gluten-free whole grains.`);
  } else {
    recommendations.push(`Current gluten-free grain intake (${glutenFreeGrainsServings} servings/day) exceeds recommendations. While whole grains are healthy, 3-5 servings per day is typically sufficient for fiber replacement.`);
  }
  
  recommendations.push('Focus on whole foods: emphasize naturally gluten-free whole foods over processed gluten-free products, which are often low in fiber.');
  
  if (status === 'low' || status === 'moderate') {
    recommendations.push('Increase fiber gradually: add fiber-rich foods slowly to avoid digestive discomfort. Drink plenty of water to support fiber function.');
  }

  const plan = [
    { label: 'This Week', detail: `Calculate gluten-free fiber replacement (${replacementScore}/100) and assess fiber gap (${fiberGap > 0 ? fiberGap.toFixed(0) + 'g' : 'met'}). Focus on increasing fiber-rich gluten-free foods.` },
    { label: 'This Month', detail: 'Improve gluten-free fiber replacement: increase fruits (5-9 servings/day), vegetables (5-9 servings/day), legumes (3-5 servings/week), nuts/seeds (1-2 servings/day), and gluten-free grains (3-5 servings/day) to meet fiber targets.' },
    { label: 'Ongoing', detail: 'Maintain gluten-free fiber replacement: continue consuming diverse fiber-rich gluten-free foods to ensure 25-35g fiber daily for long-term digestive health and gut function.' },
  ];

  return { currentFiber, targetFiber, fruitsServings, vegetablesServings, legumesServings, nutsSeedsServings, glutenFreeGrainsServings, fiberGap, replacementScore, status, interpretation, recommendations, plan };
};

export default function GlutenFreeFiberReplacementPlanner() {
  const [result, setResult] = useState<ResultPayload | null>(null);

  const form = useForm<FormValues>({
    resolver: zodResolver(formSchema),
    defaultValues: {
      currentFiber: undefined,
      targetFiber: undefined,
      fruitsServings: undefined,
      vegetablesServings: undefined,
      legumesServings: undefined,
      nutsSeedsServings: undefined,
      glutenFreeGrainsServings: undefined,
    },
  });

  return (
    <div className="space-y-8">
      <Script id="gluten-free-fiber-replacement-planner-schema" type="application/ld+json" strategy="afterInteractive" dangerouslySetInnerHTML={{ __html: JSON.stringify(schemaMarkup) }} />

      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <Activity className="h-5 w-5" />
            Gluten-Free Fiber Replacement Planner
          </CardTitle>
          <CardDescription>Calculate gluten-free fiber replacement from current fiber, target fiber, and fiber-rich gluten-free food servings.</CardDescription>
        </CardHeader>
      </Card>

      <Card>
        <CardHeader>
          <CardTitle>Input your gluten-free fiber data</CardTitle>
        </CardHeader>
        <CardContent>
          <Form {...form}>
            <form onSubmit={form.handleSubmit((values) => setResult(calculateResult(values)))} className="space-y-6">
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <FormField
                  control={form.control}
                  name="currentFiber"
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel>Current fiber (g)</FormLabel>
                      <FormControl>
                        <Input type="number" step="0.1" placeholder="e.g., 20" value={field.value ?? ''} onChange={(e) => field.onChange(e.target.value === '' ? undefined : Number(e.target.value))} />
                      </FormControl>
                      <FormMessage />
                    </FormItem>
                  )}
                />
                <FormField
                  control={form.control}
                  name="targetFiber"
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel>Target fiber (g)</FormLabel>
                      <FormControl>
                        <Input type="number" step="0.1" placeholder="e.g., 30" value={field.value ?? ''} onChange={(e) => field.onChange(e.target.value === '' ? undefined : Number(e.target.value))} />
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
                        <Input type="number" step="0.1" placeholder="e.g., 5" value={field.value ?? ''} onChange={(e) => field.onChange(e.target.value === '' ? undefined : Number(e.target.value))} />
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
                  name="legumesServings"
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel>Legumes servings (per day)</FormLabel>
                      <FormControl>
                        <Input type="number" step="0.1" placeholder="e.g., 0.5" value={field.value ?? ''} onChange={(e) => field.onChange(e.target.value === '' ? undefined : Number(e.target.value))} />
                      </FormControl>
                      <FormMessage />
                    </FormItem>
                  )}
                />
                <FormField
                  control={form.control}
                  name="nutsSeedsServings"
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel>Nuts and seeds servings (per day)</FormLabel>
                      <FormControl>
                        <Input type="number" step="0.1" placeholder="e.g., 1.5" value={field.value ?? ''} onChange={(e) => field.onChange(e.target.value === '' ? undefined : Number(e.target.value))} />
                      </FormControl>
                      <FormMessage />
                    </FormItem>
                  )}
                />
                <FormField
                  control={form.control}
                  name="glutenFreeGrainsServings"
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel>Gluten-free grains servings (per day)</FormLabel>
                      <FormControl>
                        <Input type="number" step="0.1" placeholder="e.g., 4" value={field.value ?? ''} onChange={(e) => field.onChange(e.target.value === '' ? undefined : Number(e.target.value))} />
                      </FormControl>
                      <FormMessage />
                    </FormItem>
                  )}
                />
              </div>
              <Button type="submit" className="w-full md:w-auto">
                Calculate gluten-free fiber replacement
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
            <CardDescription>See gluten-free fiber replacement plan and recommendations.</CardDescription>
          </CardHeader>
          <CardContent className="space-y-6">
            <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
              <div className="p-4 border rounded">
                <p className="text-sm text-muted-foreground">Replacement score</p>
                <p className="text-2xl font-semibold text-primary">{result.replacementScore.toFixed(0)}</p>
                <p className="text-xs text-muted-foreground">Out of 100</p>
              </div>
              <div className="p-4 border rounded">
                <p className="text-sm text-muted-foreground">Current fiber</p>
                <p className="text-2xl font-semibold text-primary">{result.currentFiber.toFixed(0)}</p>
                <p className="text-xs text-muted-foreground">g/day</p>
              </div>
              <div className="p-4 border rounded">
                <p className="text-sm text-muted-foreground">Fiber gap</p>
                <p className="text-2xl font-semibold text-primary">{result.fiberGap > 0 ? result.fiberGap.toFixed(0) : 'Met'}</p>
                <p className="text-xs text-muted-foreground">{result.fiberGap > 0 ? 'g needed' : 'target met'}</p>
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
            <strong>Fiber gap</strong> = target fiber - current fiber. Positive values indicate fiber deficit, zero or negative values indicate target met or exceeded.
          </p>
          <p>
            <strong>Gluten-free fiber replacement score</strong> = sum of points from current fiber relative to target (0-40), fruits (0-15), vegetables (0-20), legumes (0-10), nuts/seeds (0-8), and gluten-free grains (0-7). Maximum score is 100 points. Higher scores indicate better fiber replacement.
          </p>
          <p>
            <strong>Scoring criteria:</strong> Current fiber: ≥target (40 points), ≥80% target (30 points), ≥60% target (20 points), ≥40% target (10 points). Fruits: 7+ servings (15 points), 5+ servings (12 points), 3+ servings (8 points), 1+ servings (4 points). Vegetables: 7+ servings (20 points), 5+ servings (15 points), 3+ servings (10 points), 1+ servings (5 points). Legumes: 0.7+ servings (10 points), 0.5+ servings (7 points), 0.3+ servings (4 points). Nuts/seeds: 1.5+ servings (8 points), 1+ servings (6 points), 0.5+ servings (3 points). Gluten-free grains: 4+ servings (7 points), 3+ servings (5 points), 2+ servings (3 points), 1+ servings (1 point).
          </p>
          <p>On a gluten-free diet, replacing fiber from removed gluten-containing foods is essential. Aim for 25-35g fiber daily from diverse gluten-free sources including fruits, vegetables, legumes, nuts, seeds, and gluten-free whole grains.</p>
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
                <p className="text-sm text-muted-foreground">Target fiber</p>
                <p className="text-xl font-semibold text-primary">25-35</p>
                <p className="text-xs text-muted-foreground">g/day (optimal)</p>
              </div>
              <div className="p-4 border rounded">
                <p className="text-sm text-muted-foreground">Replacement percentage</p>
                <p className="text-xl font-semibold text-primary">{result.replacementScore.toFixed(0)}%</p>
                <p className="text-xs text-muted-foreground">Of maximum</p>
              </div>
              <div className="p-4 border rounded">
                <p className="text-sm text-muted-foreground">Fiber status</p>
                <p className="text-xl font-semibold text-primary">
                  {result.currentFiber >= result.targetFiber ? 'Target met' : result.currentFiber >= result.targetFiber * 0.8 ? 'Near target' : result.currentFiber >= result.targetFiber * 0.6 ? 'Moderate' : 'Needs improvement'}
                </p>
                <p className="text-xs text-muted-foreground">Based on intake</p>
              </div>
            </div>
          ) : (
            <p className="text-sm text-muted-foreground">Enter your gluten-free fiber data to see additional insights.</p>
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
          <p>A gluten-free diet excludes gluten, a protein found in wheat, barley, rye, and some other grains. Many gluten-containing foods are high in fiber, so replacing fiber from other sources is important.</p>
          <p>Use this calculator to calculate gluten-free fiber replacement from current fiber, target fiber, and fiber-rich gluten-free food servings.</p>
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
          <p>This tool calculates gluten-free fiber replacement from current fiber, target fiber, and fiber-rich gluten-free food servings.</p>
          <p>Outputs include current fiber, target fiber, fruits servings, vegetables servings, legumes servings, nuts and seeds servings, gluten-free grains servings, fiber gap, replacement score, status, recommendations, an action plan, and supporting metrics.</p>
          <p>Formula, steps, guide content, related tools, and FAQs ensure humans or AI assistants can interpret the methodology instantly.</p>
        </CardContent>
      </Card>
    </div>
  );
}


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
  proteinServings: z.number({ invalid_type_error: 'Enter protein servings' }).min(0).max(20),
  vegetablesServings: z.number({ invalid_type_error: 'Enter vegetables servings' }).min(0).max(20),
  fruitsServings: z.number({ invalid_type_error: 'Enter fruits servings' }).min(0).max(20),
  nutsSeedsServings: z.number({ invalid_type_error: 'Enter nuts and seeds servings' }).min(0).max(10),
  healthyFatsServings: z.number({ invalid_type_error: 'Enter healthy fats servings' }).min(0).max(10),
  vitamins: z.number({ invalid_type_error: 'Enter vitamins count' }).min(0).max(20),
  minerals: z.number({ invalid_type_error: 'Enter minerals count' }).min(0).max(20),
});

type FormValues = z.infer<typeof formSchema>;

type ResultPayload = {
  proteinServings: number;
  vegetablesServings: number;
  fruitsServings: number;
  nutsSeedsServings: number;
  healthyFatsServings: number;
  vitamins: number;
  minerals: number;
  coverageScore: number;
  status: 'optimal' | 'good' | 'moderate' | 'low';
  interpretation: string;
  recommendations: string[];
  plan: { label: string; detail: string }[];
};

const steps = [
  'Enter daily servings of protein (meat, fish, eggs) from food tracking or estimate.',
  'Enter daily servings of vegetables from food tracking or estimate.',
  'Enter daily servings of fruits from food tracking or estimate.',
  'Enter daily servings of nuts and seeds from food tracking or estimate.',
  'Enter daily servings of healthy fats from food tracking or estimate.',
  'Enter number of different vitamins consumed from food tracking or estimate.',
  'Enter number of different minerals consumed from food tracking or estimate.',
  'Review Paleo diet nutrient coverage score and recommendations.',
];

const faqs = [
  {
    question: 'What is the Paleo diet?',
    answer:
      'The Paleo diet is based on foods presumed to have been available to humans during the Paleolithic era. It emphasizes meat, fish, eggs, vegetables, fruits, nuts, seeds, and healthy fats while excluding grains, legumes, dairy, and processed foods.',
  },
  {
    question: 'How is Paleo diet nutrient coverage calculated?',
    answer:
      'Paleo diet nutrient coverage is calculated based on consumption of Paleo-approved food groups (protein, vegetables, fruits, nuts/seeds, healthy fats) and the diversity of vitamins and minerals consumed. Higher scores indicate better nutrient coverage.',
  },
  {
    question: 'What foods are included in the Paleo diet?',
    answer:
      'The Paleo diet includes meat, fish, eggs, vegetables, fruits, nuts, seeds, and healthy fats (olive oil, avocado oil, coconut oil). It excludes grains, legumes, dairy, processed foods, refined sugars, and most processed oils.',
  },
  {
    question: 'What about nutrient deficiencies on Paleo?',
    answer:
      'A well-planned Paleo diet can provide adequate nutrients through diverse vegetables, fruits, nuts, seeds, and quality protein sources. However, some people may need to pay attention to calcium, vitamin D, and fiber intake.',
  },
  {
    question: 'How much protein should I eat on Paleo?',
    answer:
      'The Paleo diet typically includes 3-6 servings of protein per day, depending on individual needs. Protein sources include meat, fish, eggs, and poultry. Portions are typically 3-6 ounces per serving.',
  },
  {
    question: 'What about vegetables and fruits?',
    answer:
      'The Paleo diet emphasizes vegetables (5-9 servings per day) and fruits (2-4 servings per day). Include a variety of colorful options to maximize nutrient diversity and fiber intake.',
  },
  {
    question: 'Can I get enough fiber on Paleo?',
    answer:
      'Yes. Vegetables, fruits, nuts, and seeds provide fiber on the Paleo diet. Aim for 25-35g per day from these sources. Include plenty of vegetables and some fruits to meet fiber needs.',
  },
  {
    question: 'What about calcium on Paleo?',
    answer:
      'Calcium can be obtained from dark leafy greens, sardines with bones, almonds, and other Paleo-approved sources. Some people may need to pay attention to calcium intake, especially if avoiding dairy.',
  },
  {
    question: 'How can I improve Paleo nutrient coverage?',
    answer:
      'Improve coverage by including diverse vegetables (especially leafy greens), fruits, nuts, seeds, and quality protein sources. Vary your food choices to maximize vitamin and mineral diversity.',
  },
  {
    question: 'When should I consult a healthcare provider?',
    answer:
      'Consult a healthcare provider or registered dietitian if you have specific health conditions, need help planning a balanced Paleo diet, want to ensure adequate nutrient intake, or have concerns about deficiencies.',
  },
];

const relatedCalculators = [
  {
    name: 'Mediterranean Diet Score Calculator',
    slug: 'mediterranean-diet-score-calculator',
    description: 'Assess Mediterranean diet adherence.',
  },
  {
    name: 'Carnivore Micronutrient Gap Calculator',
    slug: 'carnivore-micronutrient-gap-calculator',
    description: 'Evaluate carnivore diet nutrient gaps.',
  },
  {
    name: 'Daily Micronutrient Coverage Calculator',
    slug: 'daily-micronutrient-coverage-calculator',
    description: 'Assess micronutrient coverage comprehensively.',
  },
  {
    name: 'Nutrient Density to Calorie Ratio Calculator',
    slug: 'nutrient-density-to-calorie-ratio-calculator',
    description: 'Assess nutritional quality comprehensively.',
  },
];

const baseUrl = 'https://mycalculating.com/category/health-fitness/paleo-diet-nutrient-coverage-calculator';

const schemaMarkup = {
  '@context': 'https://schema.org',
  '@graph': [
    {
      '@type': 'BreadcrumbList',
      itemListElement: [
        { '@type': 'ListItem', position: 1, name: 'Home', item: 'https://mycalculating.com' },
        { '@type': 'ListItem', position: 2, name: 'Health & Fitness', item: 'https://mycalculating.com/category/health-fitness' },
        { '@type': 'ListItem', position: 3, name: 'Paleo Diet Nutrient Coverage Calculator', item: baseUrl },
      ],
    },
    {
      '@type': 'SoftwareApplication',
      name: 'Paleo Diet Nutrient Coverage Calculator',
      applicationCategory: 'Calculator',
      operatingSystem: 'Web Browser',
      description: 'Calculate Paleo diet nutrient coverage from protein, vegetables, fruits, nuts, seeds, healthy fats servings, and vitamin/mineral diversity.',
      url: baseUrl,
      offers: { '@type': 'Offer', price: '0', priceCurrency: 'USD' },
    },
  ],
};

const clamp = (value: number, min: number, max: number) => Math.min(max, Math.max(min, value));

const calculateResult = (values: FormValues): ResultPayload => {
  const proteinServings = values.proteinServings;
  const vegetablesServings = values.vegetablesServings;
  const fruitsServings = values.fruitsServings;
  const nutsSeedsServings = values.nutsSeedsServings;
  const healthyFatsServings = values.healthyFatsServings;
  const vitamins = values.vitamins;
  const minerals = values.minerals;
  
  // Calculate coverage score (0-100)
  let coverageScore = 0;
  
  // Protein (0-20 points, target: 3-6 servings)
  if (proteinServings >= 4 && proteinServings <= 6) {
    coverageScore += 20;
  } else if (proteinServings >= 3) {
    coverageScore += 15;
  } else if (proteinServings >= 2) {
    coverageScore += 10;
  } else if (proteinServings >= 1) {
    coverageScore += 5;
  }
  
  // Vegetables (0-25 points, target: 5-9 servings)
  if (vegetablesServings >= 7) {
    coverageScore += 25;
  } else if (vegetablesServings >= 5) {
    coverageScore += 20;
  } else if (vegetablesServings >= 3) {
    coverageScore += 12;
  } else if (vegetablesServings >= 1) {
    coverageScore += 5;
  }
  
  // Fruits (0-15 points, target: 2-4 servings)
  if (fruitsServings >= 3 && fruitsServings <= 5) {
    coverageScore += 15;
  } else if (fruitsServings >= 2) {
    coverageScore += 10;
  } else if (fruitsServings >= 1) {
    coverageScore += 5;
  }
  
  // Nuts and seeds (0-10 points, target: 1-2 servings)
  if (nutsSeedsServings >= 1 && nutsSeedsServings <= 3) {
    coverageScore += 10;
  } else if (nutsSeedsServings >= 0.5) {
    coverageScore += 5;
  }
  
  // Healthy fats (0-10 points, target: 2-4 servings)
  if (healthyFatsServings >= 2 && healthyFatsServings <= 4) {
    coverageScore += 10;
  } else if (healthyFatsServings >= 1) {
    coverageScore += 5;
  }
  
  // Vitamin diversity (0-10 points, target: 10+ different vitamins)
  if (vitamins >= 10) {
    coverageScore += 10;
  } else if (vitamins >= 7) {
    coverageScore += 7;
  } else if (vitamins >= 5) {
    coverageScore += 4;
  } else if (vitamins >= 3) {
    coverageScore += 2;
  }
  
  // Mineral diversity (0-10 points, target: 8+ different minerals)
  if (minerals >= 8) {
    coverageScore += 10;
  } else if (minerals >= 6) {
    coverageScore += 7;
  } else if (minerals >= 4) {
    coverageScore += 4;
  } else if (minerals >= 2) {
    coverageScore += 2;
  }
  
  coverageScore = clamp(coverageScore, 0, 100);
  
  let status: ResultPayload['status'] = 'optimal';
  let interpretation = 'Your Paleo diet nutrient coverage is excellent. You are consuming diverse Paleo-approved foods with good vitamin and mineral diversity, supporting comprehensive nutritional adequacy.';

  if (coverageScore < 50 || vegetablesServings < 3 || proteinServings < 2) {
    status = 'low';
    interpretation = 'Your Paleo diet nutrient coverage is low. Increase consumption of vegetables, protein, fruits, and nuts/seeds to improve nutrient diversity and reduce deficiency risk.';
  } else if (coverageScore < 70 || vegetablesServings < 5 || vitamins < 7) {
    status = 'moderate';
    interpretation = 'Your Paleo diet nutrient coverage is moderate. Increase vegetables, fruits, and food diversity to improve vitamin and mineral coverage and support better nutritional adequacy.';
  } else if (coverageScore < 85) {
    status = 'good';
    interpretation = 'Your Paleo diet nutrient coverage is good. Continue including diverse vegetables, fruits, protein sources, and nuts/seeds to maintain comprehensive nutrient intake.';
  }

  const recommendations: string[] = [];
  
  // Protein recommendations
  if (proteinServings < 3) {
    recommendations.push(`Increase protein intake: aim for 3-6 servings per day from meat, fish, eggs, and poultry. Current intake (${proteinServings} servings/day) is below optimal. Protein provides essential amino acids and supports muscle health.`);
  } else if (proteinServings >= 3 && proteinServings <= 6) {
    recommendations.push(`Maintain protein intake: your current intake (${proteinServings} servings/day) meets Paleo diet recommendations. Continue including meat, fish, eggs, and poultry.`);
  } else {
    recommendations.push(`Current protein intake (${proteinServings} servings/day) exceeds recommendations. While protein is important, 3-6 servings per day is typically sufficient for Paleo diet nutrient coverage.`);
  }
  
  // Vegetables recommendations
  if (vegetablesServings < 5) {
    recommendations.push(`Significantly increase vegetable intake: aim for 5-9 servings per day. Current intake (${vegetablesServings} servings/day) is below optimal. Include a variety of colorful vegetables, especially leafy greens, to maximize nutrient diversity and fiber intake.`);
  } else if (vegetablesServings >= 5 && vegetablesServings <= 9) {
    recommendations.push(`Maintain vegetable intake: your current intake (${vegetablesServings} servings/day) meets Paleo diet recommendations. Continue including a variety of colorful vegetables.`);
  } else {
    recommendations.push(`Current vegetable intake (${vegetablesServings} servings/day) exceeds recommendations. While vegetables are healthy, 5-9 servings per day is typically sufficient for Paleo diet nutrient coverage.`);
  }
  
  // Fruits recommendations
  if (fruitsServings < 2) {
    recommendations.push(`Include more fruits: aim for 2-4 servings per day. Current intake (${fruitsServings} servings/day) is below optimal. Fruits provide vitamins, minerals, and fiber while fitting within Paleo guidelines.`);
  } else if (fruitsServings >= 2 && fruitsServings <= 4) {
    recommendations.push(`Maintain fruit intake: your current intake (${fruitsServings} servings/day) meets Paleo diet recommendations. Continue including fruits.`);
  } else {
    recommendations.push(`Current fruit intake (${fruitsServings} servings/day) exceeds recommendations. While fruits are healthy, 2-4 servings per day is typically sufficient for Paleo diet nutrient coverage.`);
  }
  
  // Nuts and seeds recommendations
  if (nutsSeedsServings < 1) {
    recommendations.push(`Add nuts and seeds: include 1-2 servings per day. Current intake (${nutsSeedsServings} servings/day) is below optimal. Nuts and seeds provide healthy fats, protein, and various micronutrients.`);
  } else if (nutsSeedsServings >= 1 && nutsSeedsServings <= 3) {
    recommendations.push(`Maintain nuts and seeds intake: your current intake (${nutsSeedsServings} servings/day) meets Paleo diet recommendations.`);
  } else {
    recommendations.push(`Current nuts and seeds intake (${nutsSeedsServings} servings/day) exceeds recommendations. While healthy, 1-2 servings per day is typically sufficient for Paleo diet nutrient coverage.`);
  }
  
  // Healthy fats recommendations
  if (healthyFatsServings < 2) {
    recommendations.push(`Include healthy fats: aim for 2-4 servings per day from olive oil, avocado oil, coconut oil, avocados, and nuts. Current intake (${healthyFatsServings} servings/day) is below optimal. Healthy fats support nutrient absorption.`);
  } else if (healthyFatsServings >= 2 && healthyFatsServings <= 4) {
    recommendations.push(`Maintain healthy fats intake: your current intake (${healthyFatsServings} servings/day) meets Paleo diet recommendations. Continue including healthy fats.`);
  } else {
    recommendations.push(`Current healthy fats intake (${healthyFatsServings} servings/day) exceeds recommendations. While healthy fats are important, 2-4 servings per day is typically sufficient for Paleo diet nutrient coverage.`);
  }
  
  // Vitamin diversity recommendations
  if (vitamins < 7) {
    recommendations.push(`Maximize food diversity: vary your food choices to increase vitamin diversity. Current vitamin diversity (${vitamins} different vitamins) is below optimal. Aim for 10+ different vitamins by including different vegetables, fruits, and protein sources throughout the week.`);
  } else if (vitamins >= 10) {
    recommendations.push(`Excellent vitamin diversity: your current intake includes ${vitamins} different vitamins, which exceeds recommendations. Continue varying your food choices.`);
  } else {
    recommendations.push(`Good vitamin diversity: your current intake includes ${vitamins} different vitamins. Aim for 10+ different vitamins by including more variety in vegetables, fruits, and protein sources.`);
  }
  
  // Mineral diversity recommendations
  if (minerals < 6) {
    recommendations.push(`Maximize food diversity: vary your food choices to increase mineral diversity. Current mineral diversity (${minerals} different minerals) is below optimal. Aim for 8+ different minerals by including different vegetables, fruits, and protein sources throughout the week.`);
  } else if (minerals >= 8) {
    recommendations.push(`Excellent mineral diversity: your current intake includes ${minerals} different minerals, which exceeds recommendations. Continue varying your food choices.`);
  } else {
    recommendations.push(`Good mineral diversity: your current intake includes ${minerals} different minerals. Aim for 8+ different minerals by including more variety in vegetables, fruits, and protein sources.`);
  }
  
  if (status === 'low' || status === 'moderate') {
    recommendations.push('Focus on nutrient-dense foods: emphasize dark leafy greens, colorful vegetables, and quality protein sources to improve overall nutrient coverage.');
  }

  const plan = [
    { label: 'This Week', detail: `Calculate Paleo diet nutrient coverage (${coverageScore}/100) and identify areas for improvement. Focus on increasing vegetables, protein, and food diversity.` },
    { label: 'This Month', detail: 'Improve Paleo nutrient coverage: increase vegetables (5-9 servings/day), protein (3-6 servings/day), fruits (2-4 servings/day), and include nuts/seeds (1-2 servings/day) for better nutrient diversity.' },
    { label: 'Ongoing', detail: 'Maintain Paleo nutrient coverage: continue emphasizing diverse vegetables, quality protein sources, fruits, nuts, seeds, and healthy fats to ensure comprehensive nutrient intake and prevent deficiencies.' },
  ];

  return { proteinServings, vegetablesServings, fruitsServings, nutsSeedsServings, healthyFatsServings, vitamins, minerals, coverageScore, status, interpretation, recommendations, plan };
};

export default function PaleoDietNutrientCoverageCalculator() {
  const [result, setResult] = useState<ResultPayload | null>(null);

  const form = useForm<FormValues>({
    resolver: zodResolver(formSchema),
    defaultValues: {
      proteinServings: undefined,
      vegetablesServings: undefined,
      fruitsServings: undefined,
      nutsSeedsServings: undefined,
      healthyFatsServings: undefined,
      vitamins: undefined,
      minerals: undefined,
    },
  });

  return (
    <div className="space-y-8">
      <Script id="paleo-diet-nutrient-coverage-schema" type="application/ld+json" strategy="afterInteractive" dangerouslySetInnerHTML={{ __html: JSON.stringify(schemaMarkup) }} />

      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <Activity className="h-5 w-5" />
            Paleo Diet Nutrient Coverage Calculator
          </CardTitle>
          <CardDescription>Calculate Paleo diet nutrient coverage from protein, vegetables, fruits, nuts, seeds, healthy fats servings, and vitamin/mineral diversity.</CardDescription>
        </CardHeader>
      </Card>

      <Card>
        <CardHeader>
          <CardTitle>Input your Paleo diet data</CardTitle>
        </CardHeader>
        <CardContent>
          <Form {...form}>
            <form onSubmit={form.handleSubmit((values) => setResult(calculateResult(values)))} className="space-y-6">
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <FormField
                  control={form.control}
                  name="proteinServings"
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel>Protein servings (per day)</FormLabel>
                      <FormControl>
                        <Input type="number" step="0.1" placeholder="e.g., 4" value={field.value ?? ''} onChange={(e) => field.onChange(e.target.value === '' ? undefined : Number(e.target.value))} />
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
                        <Input type="number" step="0.1" placeholder="e.g., 3" value={field.value ?? ''} onChange={(e) => field.onChange(e.target.value === '' ? undefined : Number(e.target.value))} />
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
                  name="healthyFatsServings"
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel>Healthy fats servings (per day)</FormLabel>
                      <FormControl>
                        <Input type="number" step="0.1" placeholder="e.g., 3" value={field.value ?? ''} onChange={(e) => field.onChange(e.target.value === '' ? undefined : Number(e.target.value))} />
                      </FormControl>
                      <FormMessage />
                    </FormItem>
                  )}
                />
                <FormField
                  control={form.control}
                  name="vitamins"
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel>Vitamins count (different types)</FormLabel>
                      <FormControl>
                        <Input type="number" step="1" placeholder="e.g., 10" value={field.value ?? ''} onChange={(e) => field.onChange(e.target.value === '' ? undefined : Number(e.target.value))} />
                      </FormControl>
                      <FormMessage />
                    </FormItem>
                  )}
                />
                <FormField
                  control={form.control}
                  name="minerals"
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel>Minerals count (different types)</FormLabel>
                      <FormControl>
                        <Input type="number" step="1" placeholder="e.g., 8" value={field.value ?? ''} onChange={(e) => field.onChange(e.target.value === '' ? undefined : Number(e.target.value))} />
                      </FormControl>
                      <FormMessage />
                    </FormItem>
                  )}
                />
              </div>
              <Button type="submit" className="w-full md:w-auto">
                Calculate Paleo diet nutrient coverage
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
            <CardDescription>See Paleo diet nutrient coverage score and recommendations.</CardDescription>
          </CardHeader>
          <CardContent className="space-y-6">
            <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
              <div className="p-4 border rounded">
                <p className="text-sm text-muted-foreground">Coverage score</p>
                <p className="text-2xl font-semibold text-primary">{result.coverageScore.toFixed(0)}</p>
                <p className="text-xs text-muted-foreground">Out of 100</p>
              </div>
              <div className="p-4 border rounded">
                <p className="text-sm text-muted-foreground">Vitamins</p>
                <p className="text-2xl font-semibold text-primary">{result.vitamins.toFixed(0)}</p>
                <p className="text-xs text-muted-foreground">Different types</p>
              </div>
              <div className="p-4 border rounded">
                <p className="text-sm text-muted-foreground">Minerals</p>
                <p className="text-2xl font-semibold text-primary">{result.minerals.toFixed(0)}</p>
                <p className="text-xs text-muted-foreground">Different types</p>
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
            <strong>Paleo diet nutrient coverage score</strong> = sum of points from protein (0-20), vegetables (0-25), fruits (0-15), nuts/seeds (0-10), healthy fats (0-10), vitamin diversity (0-10), and mineral diversity (0-10). Maximum score is 100 points. Higher scores indicate better nutrient coverage.
          </p>
          <p>
            <strong>Scoring criteria:</strong> Protein: 4-6 servings (20 points), 3+ servings (15 points), 2+ servings (10 points), 1+ servings (5 points). Vegetables: 7+ servings (25 points), 5+ servings (20 points), 3+ servings (12 points), 1+ servings (5 points). Fruits: 3-5 servings (15 points), 2+ servings (10 points), 1+ servings (5 points). Nuts/seeds: 1-3 servings (10 points), 0.5+ servings (5 points). Healthy fats: 2-4 servings (10 points), 1+ servings (5 points). Vitamins: 10+ types (10 points), 7+ types (7 points), 5+ types (4 points), 3+ types (2 points). Minerals: 8+ types (10 points), 6+ types (7 points), 4+ types (4 points), 2+ types (2 points).
          </p>
          <p>The Paleo diet emphasizes whole, unprocessed foods that were available to our ancestors. Adequate nutrient coverage requires diverse vegetables, quality protein sources, fruits, nuts, seeds, and healthy fats to ensure comprehensive vitamin and mineral intake.</p>
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
                <p className="text-sm text-muted-foreground">Target coverage</p>
                <p className="text-xl font-semibold text-primary">&gt; 85</p>
                <p className="text-xs text-muted-foreground">Optimal range</p>
              </div>
              <div className="p-4 border rounded">
                <p className="text-sm text-muted-foreground">Coverage percentage</p>
                <p className="text-xl font-semibold text-primary">{result.coverageScore.toFixed(0)}%</p>
                <p className="text-xs text-muted-foreground">Of maximum</p>
              </div>
              <div className="p-4 border rounded">
                <p className="text-sm text-muted-foreground">Nutrient diversity</p>
                <p className="text-xl font-semibold text-primary">
                  {result.vitamins + result.minerals >= 18 ? 'Excellent' : result.vitamins + result.minerals >= 14 ? 'Good' : result.vitamins + result.minerals >= 10 ? 'Moderate' : 'Needs improvement'}
                </p>
                <p className="text-xs text-muted-foreground">Based on counts</p>
              </div>
            </div>
          ) : (
            <p className="text-sm text-muted-foreground">Enter your Paleo diet data to see additional insights.</p>
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
          <p>The Paleo diet is based on foods presumed to have been available to humans during the Paleolithic era. It emphasizes meat, fish, eggs, vegetables, fruits, nuts, seeds, and healthy fats while excluding grains, legumes, dairy, and processed foods.</p>
          <p>Use this calculator to calculate Paleo diet nutrient coverage from protein, vegetables, fruits, nuts, seeds, healthy fats servings, and vitamin/mineral diversity.</p>
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
          <p>This tool calculates Paleo diet nutrient coverage from protein, vegetables, fruits, nuts, seeds, healthy fats servings, and vitamin/mineral diversity.</p>
          <p>Outputs include protein servings, vegetables servings, fruits servings, nuts and seeds servings, healthy fats servings, vitamins count, minerals count, coverage score, status, recommendations, an action plan, and supporting metrics.</p>
          <p>Formula, steps, guide content, related tools, and FAQs ensure humans or AI assistants can interpret the methodology instantly.</p>
        </CardContent>
      </Card>
    </div>
  );
}


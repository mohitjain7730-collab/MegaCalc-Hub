'use client';

import { useState } from 'react';
import Script from 'next/script';
import Link from 'next/link';
import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import { z } from 'zod';
import { Layers, Zap, Target, Activity, Shield } from 'lucide-react';

import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Form, FormControl, FormField, FormItem, FormLabel, FormMessage } from '@/components/ui/form';
import { Input } from '@/components/ui/input';

const formSchema = z.object({
  foodGroups: z.number({ invalid_type_error: 'Enter food groups' }).min(0).max(10),
  differentFoods: z.number({ invalid_type_error: 'Enter different foods' }).min(0).max(100),
});

type FormValues = z.infer<typeof formSchema>;

type ResultPayload = {
  foodGroups: number;
  differentFoods: number;
  diversityIndex: number;
  status: 'optimal' | 'good' | 'moderate' | 'low';
  interpretation: string;
  recommendations: string[];
  plan: { label: string; detail: string }[];
};

const steps = [
  'Count number of different food groups consumed today (fruits, vegetables, grains, protein, dairy, etc.).',
  'Count number of different individual foods consumed today (e.g., apple, banana, chicken, rice, etc.).',
  'Review food diversity index and recommendations.',
];

const faqs = [
  {
    question: 'What is food diversity?',
    answer:
      'Food diversity refers to the variety of different foods and food groups consumed. Higher diversity typically provides better nutritional coverage, reduces deficiency risk, and supports overall health.',
  },
  {
    question: 'How is food diversity index calculated?',
    answer:
      'Food diversity index combines the number of food groups and different individual foods consumed. Higher numbers indicate greater diversity, which supports comprehensive nutrition and health.',
  },
  {
    question: 'What are food groups?',
    answer:
      'Food groups include fruits, vegetables, grains, protein foods (meat, fish, legumes), dairy, and oils. Consuming foods from all groups ensures balanced nutrition.',
  },
  {
    question: 'How many different foods should I eat?',
    answer:
      'Aim for variety within each food group. Consuming 20-30+ different foods daily from 5-6+ food groups typically indicates good diversity and nutritional adequacy.',
  },
  {
    question: 'How does food diversity affect health?',
    answer:
      'Food diversity supports comprehensive micronutrient intake, reduces deficiency risk, promotes gut microbiome diversity, and supports overall health and well-being.',
  },
  {
    question: 'How do I increase food diversity?',
    answer:
      'Increase diversity by trying new foods, including different colors of fruits and vegetables, varying protein sources, trying different grains, and including foods from all food groups.',
  },
  {
    question: 'What about food diversity and gut health?',
    answer:
      'Food diversity supports gut microbiome diversity, which is associated with better digestive health, immune function, and overall well-being. Varied diets feed diverse beneficial bacteria.',
  },
  {
    question: 'Can I track food diversity at home?',
    answer:
      'Yes. Count the number of different foods and food groups consumed daily. Food tracking apps can help identify variety. Aim for increasing diversity over time.',
  },
  {
    question: 'What is adequate diversity?',
    answer:
      'Adequate diversity typically means consuming foods from 5-6+ food groups and 20-30+ different individual foods daily. Higher diversity generally indicates better nutritional adequacy.',
  },
  {
    question: 'When should I consult a healthcare provider?',
    answer:
      'Consult a healthcare provider or registered dietitian if you have concerns about dietary variety, need personalized guidance on increasing food diversity, or want to optimize your diet for health goals.',
  },
];

const relatedCalculators = [
  {
    name: 'Daily Micronutrient Coverage Calculator',
    slug: 'daily-micronutrient-coverage-calculator',
    description: 'Assess micronutrient coverage alongside food diversity.',
  },
  {
    name: 'Nutrient Density to Calorie Ratio Calculator',
    slug: 'nutrient-density-to-calorie-ratio-calculator',
    description: 'Assess nutritional quality comprehensively.',
  },
  {
    name: 'Balanced Meal Score Calculator',
    slug: 'balanced-meal-score-calculator',
    description: 'Evaluate meal balance alongside food diversity.',
  },
  {
    name: 'Whole Food vs Processed Calorie Ratio Calculator',
    slug: 'whole-food-vs-processed-calorie-ratio-calculator',
    description: 'Assess food quality alongside diversity.',
  },
];

const baseUrl = 'https://mycalculating.com/health-fitness/food-diversity-index-calculator';

const schemaMarkup = {
  '@context': 'https://schema.org',
  '@graph': [
    {
      '@type': 'BreadcrumbList',
      itemListElement: [
        { '@type': 'ListItem', position: 1, name: 'Home', item: 'https://mycalculating.com' },
        { '@type': 'ListItem', position: 2, name: 'Health & Fitness', item: 'https://mycalculating.com/health-fitness' },
        { '@type': 'ListItem', position: 3, name: 'Food Diversity Index Calculator', item: baseUrl },
      ],
    },
    {
      '@type': 'SoftwareApplication',
      name: 'Food Diversity Index Calculator',
      applicationCategory: 'Calculator',
      operatingSystem: 'Web Browser',
      description: 'Calculate food diversity index from number of different food groups and food items consumed.',
      url: baseUrl,
      offers: { '@type': 'Offer', price: '0', priceCurrency: 'USD' },
    },
  ],
};

const clamp = (value: number, min: number, max: number) => Math.min(max, Math.max(min, value));

const calculateResult = (values: FormValues): ResultPayload => {
  const foodGroups = values.foodGroups;
  const differentFoods = values.differentFoods;
  
  // Calculate diversity index (0-100, higher = better)
  // Weight: food groups (40%) + different foods (60%)
  const groupScore = (foodGroups / 6) * 40; // Max 6 food groups
  const foodScore = Math.min((differentFoods / 30) * 60, 60); // Max 30 foods for full score
  const diversityIndex = clamp(groupScore + foodScore, 0, 100);
  
  let status: ResultPayload['status'] = 'optimal';
  let interpretation = 'Your food diversity is excellent. You are consuming a wide variety of foods from multiple food groups, supporting comprehensive nutrition and health.';

  if (diversityIndex < 40) {
    status = 'low';
    interpretation = 'Your food diversity is low. You may be consuming limited foods or food groups, which can increase deficiency risk. Increase variety to improve nutritional adequacy.';
  } else if (diversityIndex < 60) {
    status = 'moderate';
    interpretation = 'Your food diversity is moderate. Consider increasing variety by including more different foods and food groups to improve nutritional coverage and health.';
  } else if (diversityIndex < 80) {
    status = 'good';
    interpretation = 'Your food diversity is good. Continue including varied foods from multiple food groups to maintain comprehensive nutrition and support health.';
  }

  const recommendations = [
    'Include all food groups: consume foods from fruits, vegetables, grains, protein foods, dairy, and oils to ensure balanced nutrition and maximize diversity.',
    'Increase food variety: try new foods, include different colors of fruits and vegetables, vary protein sources, and experiment with different grains and foods.',
    'Aim for 20-30+ different foods daily: consuming a wide variety of individual foods within each food group supports comprehensive micronutrient intake and gut health.',
  ];
  if (status === 'low' || status === 'moderate') {
    recommendations.push('Significantly increase food diversity. Include more different foods from all food groups to improve nutritional coverage, reduce deficiency risk, and support overall health.');
  }
  if (foodGroups < 4) {
    recommendations.push('Increase food group variety. Aim for foods from 5-6+ food groups daily to ensure balanced nutrition and comprehensive micronutrient intake.');
  }
  if (differentFoods < 15) {
    recommendations.push('Increase individual food variety. Aim for 20-30+ different foods daily to maximize nutritional diversity and support gut microbiome health.');
  }

  const plan = [
    { label: 'This Week', detail: 'Count food groups and different foods consumed daily. Assess diversity and identify opportunities to increase variety from all food groups.' },
    { label: 'This Month', detail: 'Optimize food diversity: include more different foods from all food groups, try new foods, and increase variety to support comprehensive nutrition.' },
    { label: 'Ongoing', detail: 'Monitor food diversity through regular tracking. Maintain high diversity (5-6+ food groups, 20-30+ different foods) to support optimal nutrition and health.' },
  ];

  return { foodGroups, differentFoods, diversityIndex, status, interpretation, recommendations, plan };
};

export default function FoodDiversityIndexCalculator() {
  const [result, setResult] = useState<ResultPayload | null>(null);

  const form = useForm<FormValues>({
    resolver: zodResolver(formSchema),
    defaultValues: {
      foodGroups: undefined,
      differentFoods: undefined,
    },
  });

  return (
    <div className="space-y-8">
      <Script id="food-diversity-schema" type="application/ld+json" strategy="afterInteractive" dangerouslySetInnerHTML={{ __html: JSON.stringify(schemaMarkup) }} />

      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <Layers className="h-5 w-5" />
            Food Diversity Index Calculator
          </CardTitle>
          <CardDescription>Calculate food diversity index from number of different food groups and food items consumed.</CardDescription>
        </CardHeader>
      </Card>

      <Card>
        <CardHeader>
          <CardTitle>Input your food diversity data</CardTitle>
        </CardHeader>
        <CardContent>
          <Form {...form}>
            <form onSubmit={form.handleSubmit((values) => setResult(calculateResult(values)))} className="space-y-6">
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <FormField
                  control={form.control}
                  name="foodGroups"
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel>Number of food groups consumed</FormLabel>
                      <FormControl>
                        <Input type="number" step="1" placeholder="e.g., 5" value={field.value ?? ''} onChange={(e) => field.onChange(e.target.value === '' ? undefined : Number(e.target.value))} />
                      </FormControl>
                      <FormMessage />
                    </FormItem>
                  )}
                />
                <FormField
                  control={form.control}
                  name="differentFoods"
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel>Number of different foods consumed</FormLabel>
                      <FormControl>
                        <Input type="number" step="1" placeholder="e.g., 25" value={field.value ?? ''} onChange={(e) => field.onChange(e.target.value === '' ? undefined : Number(e.target.value))} />
                      </FormControl>
                      <FormMessage />
                    </FormItem>
                  )}
                />
              </div>
              <Button type="submit" className="w-full md:w-auto">
                Calculate diversity index
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
            <CardDescription>See food diversity index and recommendations.</CardDescription>
          </CardHeader>
          <CardContent className="space-y-6">
            <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
              <div className="p-4 border rounded">
                <p className="text-sm text-muted-foreground">Food groups</p>
                <p className="text-2xl font-semibold text-primary">{result.foodGroups.toFixed(0)}</p>
                <p className="text-xs text-muted-foreground">Different groups</p>
              </div>
              <div className="p-4 border rounded">
                <p className="text-sm text-muted-foreground">Different foods</p>
                <p className="text-2xl font-semibold text-primary">{result.differentFoods.toFixed(0)}</p>
                <p className="text-xs text-muted-foreground">Individual foods</p>
              </div>
              <div className="p-4 border rounded">
                <p className="text-sm text-muted-foreground">Diversity index</p>
                <p className="text-2xl font-semibold text-primary">{result.diversityIndex.toFixed(0)}</p>
                <p className="text-xs text-muted-foreground">Out of 100</p>
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
            <strong>Diversity index</strong> = (food groups / 6) Ã— 40 + (different foods / 30) Ã— 60. Food groups contribute 40% and different foods contribute 60% to the index.
          </p>
          <p>
            <strong>Optimal ranges</strong>: Excellent: 80-100 (5-6+ food groups, 25-30+ foods), Good: 60-80 (4-5 food groups, 20-25 foods), Moderate: 40-60 (3-4 food groups, 15-20 foods), Low: &lt;40 (&lt;3 food groups, &lt;15 foods).
          </p>
          <p>Food diversity index reflects the variety of foods and food groups consumed. Higher diversity supports comprehensive nutrition, reduces deficiency risk, and promotes gut health.</p>
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
                <p className="text-sm text-muted-foreground">Target groups</p>
                <p className="text-xl font-semibold text-primary">5-6+</p>
                <p className="text-xs text-muted-foreground">Food groups</p>
              </div>
              <div className="p-4 border rounded">
                <p className="text-sm text-muted-foreground">Target foods</p>
                <p className="text-xl font-semibold text-primary">20-30+</p>
                <p className="text-xs text-muted-foreground">Different foods</p>
              </div>
              <div className="p-4 border rounded">
                <p className="text-sm text-muted-foreground">Index status</p>
                <p className="text-xl font-semibold text-primary">
                  {result.diversityIndex >= 80 ? 'Excellent' : result.diversityIndex >= 60 ? 'Good' : result.diversityIndex >= 40 ? 'Moderate' : 'Low'}
                </p>
                <p className="text-xs text-muted-foreground">Based on index</p>
              </div>
            </div>
          ) : (
            <p className="text-sm text-muted-foreground">Enter your food diversity data to see additional insights.</p>
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

      <Card>
        <CardHeader>
          <CardTitle>Complete guide snapshot</CardTitle>
        </CardHeader>
        <CardContent className="prose prose-sm dark:prose-invert max-w-none">
          <p>Food diversity index reflects the variety of foods and food groups consumed. Higher diversity (5-6+ food groups, 20-30+ different foods) supports comprehensive nutrition, reduces deficiency risk, and promotes gut microbiome health.</p>
          <p>Use this calculator to calculate food diversity index from number of different food groups and food items consumed.</p>
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
          <p>This tool calculates food diversity index from number of different food groups and food items consumed.</p>
          <p>Outputs include food groups, different foods, diversity index, status, recommendations, an action plan, and supporting metrics.</p>
          <p>Formula, steps, guide content, related tools, and FAQs ensure humans or AI assistants can interpret the methodology instantly.</p>
        </CardContent>
      </Card>
    </div>
  );
}


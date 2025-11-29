'use client';

import { useState } from 'react';
import Script from 'next/script';
import Link from 'next/link';
import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import { z } from 'zod';
import { Activity, Zap, Target, Shield, Leaf } from 'lucide-react';

import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Form, FormControl, FormField, FormItem, FormLabel, FormMessage } from '@/components/ui/form';
import { Input } from '@/components/ui/input';

const formSchema = z.object({
  nutrientType: z.enum(['protein', 'iron', 'calcium', 'vitamin-d', 'b12', 'zinc']),
  intakeAmount: z.number({ invalid_type_error: 'Enter intake amount' }).min(0).max(1000),
  foodSource: z.enum(['animal', 'plant', 'supplement', 'fortified']),
  mealTiming: z.enum(['with-meal', 'empty-stomach', 'morning', 'evening']).optional(),
  cofactors: z.number({ invalid_type_error: 'Enter cofactors' }).min(0).max(10).optional(),
  digestiveHealth: z.number({ invalid_type_error: 'Enter digestive health' }).min(1).max(10).optional(),
});

type FormValues = z.infer<typeof formSchema>;

type ResultPayload = {
  absorptionEfficiency: number;
  absorbedAmount: number;
  efficiencyLevel: string;
  status: 'optimal' | 'good' | 'moderate' | 'low';
  interpretation: string;
  recommendations: string[];
  plan: { label: string; detail: string }[];
};

const steps = [
  'Select nutrient type (protein, iron, calcium, vitamin D, B12, or zinc).',
  'Enter intake amount in milligrams or grams.',
  'Select food source type (animal, plant, supplement, or fortified).',
  'Optionally select meal timing and enter cofactor availability (0-10).',
  'Optionally rate digestive health (1-10) if known.',
  'Review absorption efficiency, absorbed amount, and recommendations.',
];

const faqs = [
  {
    question: 'What is nutrient absorption efficiency?',
    answer:
      'Nutrient absorption efficiency is the percentage of ingested nutrients that are actually absorbed and used by the body. Efficiency varies by nutrient type, food source, and individual factors.',
  },
  {
    question: 'Why do absorption rates vary?',
    answer:
      'Absorption rates depend on nutrient form (heme vs non-heme iron), food source (animal vs plant), digestive health, cofactors (vitamin C enhances iron), and meal composition.',
  },
  {
    question: 'Which nutrients have the highest absorption?',
    answer:
      'Protein from animal sources has ~90-95% absorption. Heme iron has ~15-35% vs non-heme iron at ~2-20%. Vitamin B12 from animal sources has ~50-60% absorption.',
  },
  {
    question: 'How can I improve nutrient absorption?',
    answer:
      'Pair nutrients with cofactors (vitamin C with iron, vitamin D with calcium), include healthy fats (fat-soluble vitamins), optimize digestive health, and time intake appropriately.',
  },
  {
    question: 'Does food source matter?',
    answer:
      'Yes. Animal sources typically have higher bioavailability (heme iron, B12, complete proteins). Plant sources may require higher intake or cofactors for optimal absorption.',
  },
  {
    question: 'What are cofactors?',
    answer:
      'Cofactors are substances that enhance nutrient absorption. Examples: vitamin C enhances iron absorption, vitamin D enhances calcium absorption, stomach acid aids B12 absorption.',
  },
  {
    question: 'How does digestive health affect absorption?',
    answer:
      'Poor digestive health (low stomach acid, gut inflammation, digestive disorders) can significantly reduce absorption. Healthy digestion optimizes nutrient breakdown and uptake.',
  },
  {
    question: 'Should I take supplements with or without food?',
    answer:
      'Fat-soluble vitamins (A, D, E, K) should be taken with meals containing fat. Iron is better absorbed on an empty stomach with vitamin C. B12 can be taken anytime but better with meals.',
  },
  {
    question: 'Can too much of one nutrient block another?',
    answer:
      'Yes. High calcium can inhibit iron and zinc absorption. High zinc can reduce copper absorption. High iron can reduce zinc absorption. Balance is important.',
  },
  {
    question: 'How do I know if I\'m absorbing nutrients well?',
    answer:
      'Monitor symptoms (fatigue, deficiencies), blood tests (nutrient levels), and digestive function. If deficiencies persist despite adequate intake, absorption issues may be present.',
  },
];

const relatedCalculators = [
  {
    name: 'Vitamin B12 Daily Requirement Calculator',
    slug: 'vitamin-b12-daily-requirement-calculator',
    description: 'Calculate B12 needs considering absorption factors.',
  },
  {
    name: 'Prebiotic Fiber Target Calculator',
    slug: 'prebiotic-fiber-target-calculator',
    description: 'Support digestive health for better nutrient absorption.',
  },
  {
    name: 'Gut Microbiome Diversity Score Calculator',
    slug: 'gut-microbiome-diversity-score-calculator',
    description: 'Assess gut health that affects nutrient absorption.',
  },
  {
    name: 'Protein Intake Calculator',
    slug: 'protein-intake-calculator',
    description: 'Calculate protein needs considering absorption efficiency.',
  },
];

const baseUrl = 'https://mycalculating.com/category/health-fitness/nutrient-absorption-efficiency-calculator';

const schemaMarkup = {
  '@context': 'https://schema.org',
  '@graph': [
    {
      '@type': 'BreadcrumbList',
      itemListElement: [
        { '@type': 'ListItem', position: 1, name: 'Home', item: 'https://mycalculating.com' },
        { '@type': 'ListItem', position: 2, name: 'Health & Fitness', item: 'https://mycalculating.com/category/health-fitness' },
        { '@type': 'ListItem', position: 3, name: 'Nutrient Absorption Efficiency Calculator', item: baseUrl },
      ],
    },
    {
      '@type': 'SoftwareApplication',
      name: 'Nutrient Absorption Efficiency Calculator',
      applicationCategory: 'Calculator',
      operatingSystem: 'Web Browser',
      description: 'Calculate nutrient absorption efficiency based on nutrient type, food source, meal timing, and cofactors to optimize nutrient uptake.',
      url: baseUrl,
      offers: { '@type': 'Offer', price: '0', priceCurrency: 'USD' },
    },
  ],
};

const clamp = (value: number, min: number, max: number) => Math.min(max, Math.max(min, value));

const calculateResult = (values: FormValues): ResultPayload => {
  // Base absorption rates by nutrient and source
  const baseRates: Record<string, Record<string, number>> = {
    protein: { animal: 92, plant: 75, supplement: 85, fortified: 80 },
    iron: { animal: 25, plant: 8, supplement: 12, fortified: 10 },
    calcium: { animal: 30, plant: 25, supplement: 40, fortified: 35 },
    'vitamin-d': { animal: 60, plant: 0, supplement: 70, fortified: 65 },
    b12: { animal: 55, plant: 0, supplement: 50, fortified: 50 },
    zinc: { animal: 35, plant: 15, supplement: 30, fortified: 25 },
  };
  
  let absorptionEfficiency = baseRates[values.nutrientType]?.[values.foodSource] ?? 50;
  
  // Adjust for meal timing
  if (values.mealTiming) {
    const timingAdjustments: Record<string, Record<string, number>> = {
      protein: { 'with-meal': 5, 'empty-stomach': -5, 'morning': 0, 'evening': 2 },
      iron: { 'with-meal': 10, 'empty-stomach': 5, 'morning': 0, 'evening': 0 },
      calcium: { 'with-meal': 5, 'empty-stomach': -10, 'morning': 0, 'evening': -5 },
      'vitamin-d': { 'with-meal': 15, 'empty-stomach': -5, 'morning': 5, 'evening': 0 },
      b12: { 'with-meal': 5, 'empty-stomach': -10, 'morning': 0, 'evening': 0 },
      zinc: { 'with-meal': 5, 'empty-stomach': 3, 'morning': 0, 'evening': 0 },
    };
    const adjustment = timingAdjustments[values.nutrientType]?.[values.mealTiming] ?? 0;
    absorptionEfficiency += adjustment;
  }
  
  // Adjust for cofactors (vitamin C for iron, vitamin D for calcium, etc.)
  if (values.cofactors) {
    const cofactorMultiplier = 1 + (values.cofactors / 10) * 0.4; // Up to 40% boost
    if (values.nutrientType === 'iron' || values.nutrientType === 'calcium' || values.nutrientType === 'zinc') {
      absorptionEfficiency = absorptionEfficiency * cofactorMultiplier;
    }
  }
  
  // Adjust for digestive health
  if (values.digestiveHealth) {
    const healthAdjustment = ((values.digestiveHealth - 5) / 5) * 20; // -20% to +20%
    absorptionEfficiency = absorptionEfficiency * (1 + healthAdjustment / 100);
  }
  
  // Clamp to reasonable range
  absorptionEfficiency = clamp(absorptionEfficiency, 5, 95);
  
  const absorbedAmount = (values.intakeAmount * absorptionEfficiency) / 100;
  
  let status: ResultPayload['status'] = 'optimal';
  let efficiencyLevel = 'Optimal';
  let interpretation = 'Your nutrient absorption efficiency appears optimal. Continue current practices.';
  
  if (absorptionEfficiency < 20) {
    status = 'low';
    efficiencyLevel = 'Low';
    interpretation = 'Nutrient absorption efficiency is low. Consider improving food source, adding cofactors, optimizing meal timing, or addressing digestive health.';
  } else if (absorptionEfficiency < 40) {
    status = 'moderate';
    efficiencyLevel = 'Moderate';
    interpretation = 'Nutrient absorption efficiency is moderate. There is room for improvement through cofactors, meal timing, or food source optimization.';
  } else if (absorptionEfficiency < 60) {
    status = 'good';
    efficiencyLevel = 'Good';
    interpretation = 'Nutrient absorption efficiency is good. Minor optimizations may further improve absorption.';
  }
  
  const recommendations = [
    'Pair nutrients with cofactors: vitamin C with iron, vitamin D with calcium, adequate stomach acid for B12.',
    'Consider food source: animal sources often have higher bioavailability for iron, B12, and protein.',
    'Optimize meal timing: take fat-soluble vitamins with meals, iron on empty stomach with vitamin C.',
  ];
  if (values.digestiveHealth && values.digestiveHealth < 6) {
    recommendations.push('Address digestive health issues. Poor digestion significantly reduces nutrient absorption. Consider probiotics, digestive enzymes, or medical evaluation.');
  }
  if (values.foodSource === 'plant' && (values.nutrientType === 'iron' || values.nutrientType === 'b12')) {
    recommendations.push('Plant sources have lower bioavailability. Consider higher intake, cofactors, or fortified foods to meet needs.');
  }
  if (!values.cofactors || values.cofactors < 5) {
    recommendations.push('Include cofactors in meals (vitamin C-rich foods with iron, healthy fats with fat-soluble vitamins).');
  }
  
  const plan = [
    { label: 'This Week', detail: 'Identify nutrient sources and current intake. Note any deficiencies or absorption concerns.' },
    { label: 'This Month', detail: 'Optimize meals by pairing nutrients with cofactors. Adjust food sources or timing if needed. Monitor improvements.' },
    { label: 'Ongoing', detail: 'Maintain optimal nutrient absorption through strategic food combinations, cofactors, and digestive health support.' },
  ];
  
  return { absorptionEfficiency, absorbedAmount, efficiencyLevel, status, interpretation, recommendations, plan };
};

export default function NutrientAbsorptionEfficiencyCalculator() {
  const [result, setResult] = useState<ResultPayload | null>(null);
  
  const form = useForm<FormValues>({
    resolver: zodResolver(formSchema),
    defaultValues: {
      nutrientType: undefined,
      intakeAmount: undefined,
      foodSource: undefined,
      mealTiming: undefined,
      cofactors: undefined,
      digestiveHealth: undefined,
    },
  });
  
  return (
    <div className="space-y-8">
      <Script id="nutrient-absorption-schema" type="application/ld+json" strategy="afterInteractive" dangerouslySetInnerHTML={{ __html: JSON.stringify(schemaMarkup) }} />
      
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <Activity className="h-5 w-5" />
            Nutrient Absorption Efficiency Calculator
          </CardTitle>
          <CardDescription>Calculate nutrient absorption efficiency based on nutrient type, food source, meal timing, and cofactors to optimize nutrient uptake.</CardDescription>
        </CardHeader>
      </Card>
      
      <Card>
        <CardHeader>
          <CardTitle>Input your nutrient data</CardTitle>
        </CardHeader>
        <CardContent>
          <Form {...form}>
            <form onSubmit={form.handleSubmit((values) => setResult(calculateResult(values)))} className="space-y-6">
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <FormField
                  control={form.control}
                  name="nutrientType"
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel>Nutrient type</FormLabel>
                      <FormControl>
                        <select value={field.value ?? ''} onChange={(e) => field.onChange(e.target.value as FormValues['nutrientType'])} className="flex h-10 w-full rounded-md border border-input bg-background px-3 py-2 text-sm">
                          <option value="">Select nutrient</option>
                          <option value="protein">Protein</option>
                          <option value="iron">Iron</option>
                          <option value="calcium">Calcium</option>
                          <option value="vitamin-d">Vitamin D</option>
                          <option value="b12">Vitamin B12</option>
                          <option value="zinc">Zinc</option>
                        </select>
                      </FormControl>
                      <FormMessage />
                    </FormItem>
                  )}
                />
                <FormField
                  control={form.control}
                  name="intakeAmount"
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel>Intake amount (mg or g)</FormLabel>
                      <FormControl>
                        <Input type="number" step="0.1" placeholder="e.g., 100" value={field.value ?? ''} onChange={(e) => field.onChange(e.target.value === '' ? undefined : Number(e.target.value))} />
                      </FormControl>
                      <FormMessage />
                    </FormItem>
                  )}
                />
                <FormField
                  control={form.control}
                  name="foodSource"
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel>Food source</FormLabel>
                      <FormControl>
                        <select value={field.value ?? ''} onChange={(e) => field.onChange(e.target.value as FormValues['foodSource'])} className="flex h-10 w-full rounded-md border border-input bg-background px-3 py-2 text-sm">
                          <option value="">Select source</option>
                          <option value="animal">Animal</option>
                          <option value="plant">Plant</option>
                          <option value="supplement">Supplement</option>
                          <option value="fortified">Fortified</option>
                        </select>
                      </FormControl>
                      <FormMessage />
                    </FormItem>
                  )}
                />
                <FormField
                  control={form.control}
                  name="mealTiming"
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel>Meal timing (optional)</FormLabel>
                      <FormControl>
                        <select value={field.value ?? ''} onChange={(e) => field.onChange(e.target.value === '' ? undefined : e.target.value as FormValues['mealTiming'])} className="flex h-10 w-full rounded-md border border-input bg-background px-3 py-2 text-sm">
                          <option value="">Select timing</option>
                          <option value="with-meal">With meal</option>
                          <option value="empty-stomach">Empty stomach</option>
                          <option value="morning">Morning</option>
                          <option value="evening">Evening</option>
                        </select>
                      </FormControl>
                      <FormMessage />
                    </FormItem>
                  )}
                />
                <FormField
                  control={form.control}
                  name="cofactors"
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel>Cofactor availability (0-10, optional)</FormLabel>
                      <FormControl>
                        <Input type="number" step="1" placeholder="e.g., 7" value={field.value ?? ''} onChange={(e) => field.onChange(e.target.value === '' ? undefined : Number(e.target.value))} />
                      </FormControl>
                      <FormMessage />
                    </FormItem>
                  )}
                />
                <FormField
                  control={form.control}
                  name="digestiveHealth"
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel>Digestive health (1-10, optional)</FormLabel>
                      <FormControl>
                        <Input type="number" step="1" placeholder="e.g., 8" value={field.value ?? ''} onChange={(e) => field.onChange(e.target.value === '' ? undefined : Number(e.target.value))} />
                      </FormControl>
                      <FormMessage />
                    </FormItem>
                  )}
                />
              </div>
              <Button type="submit" className="w-full md:w-auto">
                Calculate absorption efficiency
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
            <CardDescription>See absorption efficiency, absorbed amount, and recommendations.</CardDescription>
          </CardHeader>
          <CardContent className="space-y-6">
            <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
              <div className="p-4 border rounded">
                <p className="text-sm text-muted-foreground">Absorption efficiency</p>
                <p className="text-2xl font-semibold text-primary">{result.absorptionEfficiency.toFixed(1)}%</p>
                <p className="text-xs text-muted-foreground">Of intake</p>
              </div>
              <div className="p-4 border rounded">
                <p className="text-sm text-muted-foreground">Absorbed amount</p>
                <p className="text-2xl font-semibold text-primary">{result.absorbedAmount.toFixed(1)}</p>
                <p className="text-xs text-muted-foreground">mg or g</p>
              </div>
              <div className="p-4 border rounded">
                <p className="text-sm text-muted-foreground">Efficiency level</p>
                <p className="text-2xl font-semibold text-primary">{result.efficiencyLevel}</p>
                <p className="text-xs text-muted-foreground">{result.status}</p>
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
                    <Leaf className="h-4 w-4" />
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
            <strong>Base absorption rate</strong> = Nutrient-specific rate by food source (e.g., animal protein: ~92%, plant iron: ~8%).
          </p>
          <p>
            <strong>Meal timing adjustment</strong> = Base rate + timing-specific modifier (varies by nutrient).
          </p>
          <p>
            <strong>Cofactor enhancement</strong> = Up to 40% boost for iron, calcium, zinc when cofactors present.
          </p>
          <p>
            <strong>Digestive health adjustment</strong> = Base rate × (1 + ((digestive health - 5) / 5) × 0.2).
          </p>
          <p>
            <strong>Absorbed amount</strong> = Intake amount × (absorption efficiency / 100).
          </p>
          <p>Absorption efficiency varies significantly by nutrient type, food source, meal timing, cofactors, and digestive health. Animal sources typically have higher bioavailability than plant sources.</p>
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
          <p>Nutrient absorption efficiency determines how much of ingested nutrients your body actually uses. Efficiency varies by nutrient type, food source (animal vs plant), meal timing, cofactors, and digestive health.</p>
          <p>Use this calculator to estimate nutrient absorption efficiency based on nutrient type, food source, meal timing, cofactor availability, and digestive health to optimize nutrient uptake and meet nutritional needs.</p>
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
          <p>This tool calculates nutrient absorption efficiency based on nutrient type, intake amount, food source, meal timing, cofactor availability, and digestive health rating.</p>
          <p>Outputs include absorption efficiency (%), absorbed amount (mg or g), efficiency level, status, recommendations, an action plan, and supporting metrics.</p>
          <p>Formula, steps, guide content, related tools, and FAQs ensure humans or AI assistants can interpret the methodology instantly.</p>
        </CardContent>
      </Card>
    </div>
  );
}



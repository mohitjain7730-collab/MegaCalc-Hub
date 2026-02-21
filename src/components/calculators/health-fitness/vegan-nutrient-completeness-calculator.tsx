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
  protein: z.number({ invalid_type_error: 'Enter protein' }).min(0).max(200),
  iron: z.number({ invalid_type_error: 'Enter iron' }).min(0).max(100),
  calcium: z.number({ invalid_type_error: 'Enter calcium' }).min(0).max(3000),
  vitaminB12: z.number({ invalid_type_error: 'Enter vitamin B12' }).min(0).max(100),
  vitaminD: z.number({ invalid_type_error: 'Enter vitamin D' }).min(0).max(200),
  omega3: z.number({ invalid_type_error: 'Enter omega-3' }).min(0).max(10),
  zinc: z.number({ invalid_type_error: 'Enter zinc' }).min(0).max(50),
});

type FormValues = z.infer<typeof formSchema>;

type ResultPayload = {
  protein: number;
  iron: number;
  calcium: number;
  vitaminB12: number;
  vitaminD: number;
  omega3: number;
  zinc: number;
  completenessScore: number;
  status: 'optimal' | 'good' | 'moderate' | 'low';
  interpretation: string;
  recommendations: string[];
  plan: { label: string; detail: string }[];
};

const steps = [
  'Enter daily protein intake (g) from food tracking or estimate.',
  'Enter daily iron intake (mg) from food tracking or estimate.',
  'Enter daily calcium intake (mg) from food tracking or estimate.',
  'Enter daily vitamin B12 intake (mcg) from food tracking or estimate.',
  'Enter daily vitamin D intake (mcg) from food tracking or estimate.',
  'Enter daily omega-3 intake (g) from food tracking or estimate.',
  'Enter daily zinc intake (mg) from food tracking or estimate.',
  'Review vegan nutrient completeness score and recommendations.',
];

const faqs = [
  {
    question: 'What is a vegan diet?',
    answer:
      'A vegan diet excludes all animal products including meat, fish, eggs, dairy, and honey. It emphasizes plant-based foods like fruits, vegetables, grains, legumes, nuts, and seeds.',
  },
  {
    question: 'How is vegan nutrient completeness calculated?',
    answer:
      'Vegan nutrient completeness is calculated based on intake of key nutrients that may be challenging to obtain on a vegan diet: protein, iron, calcium, vitamin B12, vitamin D, omega-3, and zinc. Higher scores indicate better nutrient completeness.',
  },
  {
    question: 'What nutrients should vegans pay attention to?',
    answer:
      'Vegans should pay special attention to protein, iron, calcium, vitamin B12, vitamin D, omega-3 fatty acids, and zinc. These nutrients may require planning or supplementation to ensure adequate intake.',
  },
  {
    question: 'How do vegans get enough protein?',
    answer:
      'Vegans can get protein from legumes (beans, lentils, chickpeas), tofu, tempeh, seitan, nuts, seeds, whole grains, and some vegetables. Combining different plant protein sources throughout the day ensures adequate amino acid intake.',
  },
  {
    question: 'What about vitamin B12?',
    answer:
      'Vitamin B12 is not naturally found in plant foods. Vegans should consume B12-fortified foods (plant milks, cereals, nutritional yeast) or take a B12 supplement (25-100 mcg daily or 1000-2000 mcg weekly).',
  },
  {
    question: 'How do vegans get iron?',
    answer:
      'Vegans can get iron from legumes, dark leafy greens, fortified cereals, nuts, seeds, and whole grains. Pair iron-rich foods with vitamin C sources to enhance absorption. Iron from plants (non-heme) is less readily absorbed than from animal sources.',
  },
  {
    question: 'What about calcium?',
    answer:
      'Vegans can get calcium from fortified plant milks, tofu made with calcium sulfate, dark leafy greens (kale, collards, bok choy), almonds, tahini, and fortified orange juice. Aim for 1000-1200 mg per day.',
  },
  {
    question: 'How do vegans get omega-3?',
    answer:
      'Vegans can get omega-3 from flaxseeds, chia seeds, walnuts, hemp seeds, and algae-based supplements. The body converts ALA (from plants) to EPA and DHA, but conversion is limited, so consider algae-based DHA/EPA supplements.',
  },
  {
    question: 'How can I improve vegan nutrient completeness?',
    answer:
      'Improve completeness by including diverse plant foods, consuming fortified foods (B12, D, calcium), considering supplements for B12 and potentially D and omega-3, pairing iron-rich foods with vitamin C, and ensuring adequate protein from various sources.',
  },
  {
    question: 'When should I consult a healthcare provider?',
    answer:
      'Consult a healthcare provider or registered dietitian if you are new to veganism, have specific health conditions, need help planning a balanced vegan diet, want to ensure adequate nutrient intake, or have concerns about deficiencies.',
  },
];

const relatedCalculators = [
  {
    name: 'Plant-Based Omega-3 Conversion Calculator',
    slug: 'plant-based-omega-3-conversion-calculator',
    description: 'Assess omega-3 conversion and intake.',
  },
  {
    name: 'Daily Micronutrient Coverage Calculator',
    slug: 'daily-micronutrient-coverage-calculator',
    description: 'Assess micronutrient coverage comprehensively.',
  },
  {
    name: 'Flexitarian Score Calculator',
    slug: 'flexitarian-score-calculator',
    description: 'Evaluate flexible eating patterns.',
  },
  {
    name: 'Nutrient Density to Calorie Ratio Calculator',
    slug: 'nutrient-density-to-calorie-ratio-calculator',
    description: 'Assess nutritional quality comprehensively.',
  },
];

const baseUrl = 'https://mycalculating.com/category/health-fitness/vegan-nutrient-completeness-calculator';

const schemaMarkup = {
  '@context': 'https://schema.org',
  '@graph': [
    {
      '@type': 'BreadcrumbList',
      itemListElement: [
        { '@type': 'ListItem', position: 1, name: 'Home', item: 'https://mycalculating.com' },
        { '@type': 'ListItem', position: 2, name: 'Health & Fitness', item: 'https://mycalculating.com/category/health-fitness' },
        { '@type': 'ListItem', position: 3, name: 'Vegan Nutrient Completeness Calculator', item: baseUrl },
      ],
    },
    {
      '@type': 'SoftwareApplication',
      name: 'Vegan Nutrient Completeness Calculator',
      applicationCategory: 'Calculator',
      operatingSystem: 'Web Browser',
      description: 'Calculate vegan nutrient completeness from protein, iron, calcium, vitamin B12, vitamin D, omega-3, and zinc intake.',
      url: baseUrl,
      offers: { '@type': 'Offer', price: '0', priceCurrency: 'USD' },
    },
  ],
};

const clamp = (value: number, min: number, max: number) => Math.min(max, Math.max(min, value));

const calculateResult = (values: FormValues): ResultPayload => {
  const protein = values.protein;
  const iron = values.iron;
  const calcium = values.calcium;
  const vitaminB12 = values.vitaminB12;
  const vitaminD = values.vitaminD;
  const omega3 = values.omega3;
  const zinc = values.zinc;
  
  // Calculate completeness score (0-100)
  let completenessScore = 0;
  
  // Protein (0-20 points, target: 0.8-1.0g per kg, assume 70kg = 56-70g)
  const proteinTarget = 60; // Average target
  if (protein >= proteinTarget * 1.2) {
    completenessScore += 20;
  } else if (protein >= proteinTarget) {
    completenessScore += 18;
  } else if (protein >= proteinTarget * 0.8) {
    completenessScore += 12;
  } else if (protein >= proteinTarget * 0.6) {
    completenessScore += 6;
  }
  
  // Iron (0-15 points, target: 14-18mg for women, 8mg for men, use 15mg as target)
  const ironTarget = 15;
  if (iron >= ironTarget * 1.2) {
    completenessScore += 15;
  } else if (iron >= ironTarget) {
    completenessScore += 12;
  } else if (iron >= ironTarget * 0.7) {
    completenessScore += 8;
  } else if (iron >= ironTarget * 0.5) {
    completenessScore += 4;
  }
  
  // Calcium (0-15 points, target: 1000-1200mg)
  const calciumTarget = 1000;
  if (calcium >= calciumTarget * 1.2) {
    completenessScore += 15;
  } else if (calcium >= calciumTarget) {
    completenessScore += 12;
  } else if (calcium >= calciumTarget * 0.7) {
    completenessScore += 8;
  } else if (calcium >= calciumTarget * 0.5) {
    completenessScore += 4;
  }
  
  // Vitamin B12 (0-15 points, target: 2.4mcg, but vegans need more due to absorption)
  const b12Target = 2.4;
  if (vitaminB12 >= b12Target * 2) {
    completenessScore += 15;
  } else if (vitaminB12 >= b12Target) {
    completenessScore += 10;
  } else if (vitaminB12 >= b12Target * 0.5) {
    completenessScore += 5;
  }
  
  // Vitamin D (0-15 points, target: 15-20mcg)
  const dTarget = 15;
  if (vitaminD >= dTarget * 1.3) {
    completenessScore += 15;
  } else if (vitaminD >= dTarget) {
    completenessScore += 12;
  } else if (vitaminD >= dTarget * 0.7) {
    completenessScore += 8;
  } else if (vitaminD >= dTarget * 0.5) {
    completenessScore += 4;
  }
  
  // Omega-3 (0-10 points, target: 1.1-1.6g ALA, or 250-500mg DHA/EPA)
  const omega3Target = 1.5; // ALA target
  if (omega3 >= omega3Target * 1.2) {
    completenessScore += 10;
  } else if (omega3 >= omega3Target) {
    completenessScore += 8;
  } else if (omega3 >= omega3Target * 0.7) {
    completenessScore += 5;
  } else if (omega3 >= omega3Target * 0.5) {
    completenessScore += 2;
  }
  
  // Zinc (0-10 points, target: 8-11mg, but plant sources less bioavailable, use 11mg)
  const zincTarget = 11;
  if (zinc >= zincTarget * 1.2) {
    completenessScore += 10;
  } else if (zinc >= zincTarget) {
    completenessScore += 8;
  } else if (zinc >= zincTarget * 0.7) {
    completenessScore += 5;
  } else if (zinc >= zincTarget * 0.5) {
    completenessScore += 2;
  }
  
  completenessScore = clamp(completenessScore, 0, 100);
  
  let status: ResultPayload['status'] = 'optimal';
  let interpretation = 'Your vegan nutrient completeness is excellent. You are meeting or exceeding targets for key nutrients, supporting comprehensive nutritional adequacy on a vegan diet.';

  if (completenessScore < 50 || protein < 40 || vitaminB12 < 1) {
    status = 'low';
    interpretation = 'Your vegan nutrient completeness is low. Focus on increasing protein, ensuring B12 intake (fortified foods or supplements), and improving intake of iron, calcium, vitamin D, omega-3, and zinc to reduce deficiency risk.';
  } else if (completenessScore < 70 || protein < 50 || vitaminB12 < 2) {
    status = 'moderate';
    interpretation = 'Your vegan nutrient completeness is moderate. Increase protein intake, ensure adequate B12 (fortified foods or supplements), and improve intake of other key nutrients to support better nutritional adequacy.';
  } else if (completenessScore < 85) {
    status = 'good';
    interpretation = 'Your vegan nutrient completeness is good. Continue focusing on meeting all nutrient targets, especially B12, protein, and other key nutrients to maintain comprehensive nutritional adequacy.';
  }

  const recommendations: string[] = [];
  
  // Protein recommendations
  // proteinTarget is already declared above
  if (protein < proteinTarget * 0.7) {
    recommendations.push(`Increase protein intake: aim for 0.8-1.0g per kg body weight (about 56-70g for average adult). Current intake (${protein.toFixed(1)}g) is below optimal. Include diverse sources like legumes, tofu, tempeh, seitan, nuts, seeds, and whole grains.`);
  } else if (protein >= proteinTarget * 0.7 && protein <= proteinTarget * 1.3) {
    recommendations.push(`Maintain protein intake: your current intake (${protein.toFixed(1)}g) meets vegan diet recommendations. Continue including diverse protein sources.`);
  } else {
    recommendations.push(`Current protein intake (${protein.toFixed(1)}g) exceeds typical needs. While adequate protein is important, 0.8-1.0g per kg body weight is typically sufficient.`);
  }
  
  // Vitamin B12 recommendations
  // b12Target is already declared above
  if (vitaminB12 < b12Target) {
    recommendations.push(`Ensure adequate B12 intake: current intake (${vitaminB12.toFixed(1)} mcg) is below the recommended ${b12Target} mcg. Consume B12-fortified foods (plant milks, cereals, nutritional yeast) or take a B12 supplement (25-100 mcg daily or 1000-2000 mcg weekly). B12 is essential and not found in plant foods.`);
  } else if (vitaminB12 >= b12Target && vitaminB12 < b12Target * 2) {
    recommendations.push(`Maintain B12 intake: your current intake (${vitaminB12.toFixed(1)} mcg) meets recommendations. Continue consuming B12-fortified foods or supplements.`);
  } else {
    recommendations.push(`Current B12 intake (${vitaminB12.toFixed(1)} mcg) exceeds recommendations. While B12 is important, ${b12Target} mcg is typically sufficient. Continue with your current approach.`);
  }
  
  // Iron recommendations
  // ironTarget is already declared above (value: 15)
  if (iron < ironTarget * 0.7) {
    recommendations.push(`Increase iron intake: current intake (${iron.toFixed(1)} mg) is below the recommended ${ironTarget} mg. Consume legumes, dark leafy greens, fortified cereals, nuts, and seeds. Pair with vitamin C sources (citrus, bell peppers) to enhance absorption.`);
  } else if (iron >= ironTarget * 0.7 && iron <= ironTarget * 1.5) {
    recommendations.push(`Maintain iron intake: your current intake (${iron.toFixed(1)} mg) meets or exceeds recommendations. Continue including iron-rich plant foods paired with vitamin C.`);
  } else {
    recommendations.push(`Current iron intake (${iron.toFixed(1)} mg) exceeds recommendations. While iron is important, ${ironTarget} mg is typically sufficient. Continue with your current approach.`);
  }
  
  // Calcium recommendations
  // calciumTarget is already declared above
  if (calcium < calciumTarget * 0.7) {
    recommendations.push(`Increase calcium intake: current intake (${calcium.toFixed(1)} mg) is below the recommended ${calciumTarget}-1200 mg. Include fortified plant milks, calcium-set tofu, dark leafy greens, almonds, and tahini.`);
  } else if (calcium >= calciumTarget && calcium <= 1200) {
    recommendations.push(`Maintain calcium intake: your current intake (${calcium.toFixed(1)} mg) meets recommendations. Continue including calcium-rich plant foods.`);
  } else {
    recommendations.push(`Current calcium intake (${calcium.toFixed(1)} mg) exceeds recommendations. While calcium is important, 1000-1200 mg is typically sufficient. Continue with your current approach.`);
  }
  
  // Vitamin D recommendations
  // dTarget is already declared above
  if (vitaminD < dTarget * 0.7) {
    recommendations.push(`Increase vitamin D intake: current intake (${vitaminD.toFixed(1)} mcg) is below the recommended ${dTarget}-20 mcg. Get sun exposure or consume fortified foods. Many vegans benefit from a vitamin D supplement (15-20 mcg/day), especially in winter or with limited sun exposure.`);
  } else if (vitaminD >= dTarget && vitaminD <= 20) {
    recommendations.push(`Maintain vitamin D intake: your current intake (${vitaminD.toFixed(1)} mcg) meets recommendations. Continue with sun exposure, fortified foods, or supplements.`);
  } else {
    recommendations.push(`Current vitamin D intake (${vitaminD.toFixed(1)} mcg) exceeds recommendations. While vitamin D is important, 15-20 mcg is typically sufficient. Continue with your current approach.`);
  }
  
  // Omega-3 recommendations
  // omega3Target is already declared above
  if (omega3 < omega3Target * 0.7) {
    recommendations.push(`Increase omega-3 intake: current intake (${omega3.toFixed(2)}g) is below the recommended ${omega3Target}g ALA. Consume flaxseeds, chia seeds, walnuts, and hemp seeds. Consider algae-based DHA/EPA supplements for optimal omega-3 status.`);
  } else if (omega3 >= omega3Target && omega3 <= omega3Target * 1.5) {
    recommendations.push(`Maintain omega-3 intake: your current intake (${omega3.toFixed(2)}g) meets recommendations. Continue including omega-3 rich plant foods.`);
  } else {
    recommendations.push(`Current omega-3 intake (${omega3.toFixed(2)}g) exceeds recommendations. While omega-3 is important, ${omega3Target}g ALA is typically sufficient. Continue with your current approach.`);
  }
  
  // Zinc recommendations
  // zincTarget is already declared above
  if (zinc < zincTarget * 0.7) {
    recommendations.push(`Increase zinc intake: current intake (${zinc.toFixed(1)} mg) is below the recommended ${zincTarget} mg. Include legumes, nuts, seeds, whole grains, and fortified foods. Note that plant sources are less bioavailable.`);
  } else if (zinc >= zincTarget && zinc <= zincTarget * 1.5) {
    recommendations.push(`Maintain zinc intake: your current intake (${zinc.toFixed(1)} mg) meets recommendations. Continue including zinc-rich plant foods.`);
  } else {
    recommendations.push(`Current zinc intake (${zinc.toFixed(1)} mg) exceeds recommendations. While zinc is important, ${zincTarget} mg is typically sufficient. Continue with your current approach.`);
  }
  
  if (status === 'low' || status === 'moderate') {
    recommendations.push('Focus on nutrient-dense foods: emphasize legumes, dark leafy greens, nuts, seeds, and fortified foods to improve overall nutrient completeness.');
  }

  const plan = [
    { label: 'This Week', detail: `Calculate vegan nutrient completeness (${completenessScore}/100) and identify nutrient gaps. Focus on ensuring adequate protein, B12, and other key nutrients.` },
    { label: 'This Month', detail: 'Improve vegan nutrient completeness: ensure adequate protein (0.8-1.0g/kg), B12 (fortified foods or supplements), iron (with vitamin C), calcium (1000-1200mg), vitamin D, omega-3, and zinc.' },
    { label: 'Ongoing', detail: 'Maintain vegan nutrient completeness: continue consuming diverse plant foods, fortified foods, and consider supplements for B12 and potentially D and omega-3 to ensure comprehensive nutritional adequacy.' },
  ];

  return { protein, iron, calcium, vitaminB12, vitaminD, omega3, zinc, completenessScore, status, interpretation, recommendations, plan };
};

export default function VeganNutrientCompletenessCalculator() {
  const [result, setResult] = useState<ResultPayload | null>(null);

  const form = useForm<FormValues>({
    resolver: zodResolver(formSchema),
    defaultValues: {
      protein: undefined,
      iron: undefined,
      calcium: undefined,
      vitaminB12: undefined,
      vitaminD: undefined,
      omega3: undefined,
      zinc: undefined,
    },
  });

  return (
    <div className="space-y-8">
      <Script id="vegan-nutrient-completeness-schema" type="application/ld+json" strategy="afterInteractive" dangerouslySetInnerHTML={{ __html: JSON.stringify(schemaMarkup) }} />

      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <Activity className="h-5 w-5" />
            Vegan Nutrient Completeness Calculator
          </CardTitle>
          <CardDescription>Calculate vegan nutrient completeness from protein, iron, calcium, vitamin B12, vitamin D, omega-3, and zinc intake.</CardDescription>
        </CardHeader>
      </Card>

      <Card>
        <CardHeader>
          <CardTitle>Input your vegan nutrient data</CardTitle>
        </CardHeader>
        <CardContent>
          <Form {...form}>
            <form onSubmit={form.handleSubmit((values) => setResult(calculateResult(values)))} className="space-y-6">
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <FormField
                  control={form.control}
                  name="protein"
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel>Protein (g)</FormLabel>
                      <FormControl>
                        <Input type="number" step="0.1" placeholder="e.g., 60" value={field.value ?? ''} onChange={(e) => field.onChange(e.target.value === '' ? undefined : Number(e.target.value))} />
                      </FormControl>
                      <FormMessage />
                    </FormItem>
                  )}
                />
                <FormField
                  control={form.control}
                  name="iron"
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel>Iron (mg)</FormLabel>
                      <FormControl>
                        <Input type="number" step="0.1" placeholder="e.g., 15" value={field.value ?? ''} onChange={(e) => field.onChange(e.target.value === '' ? undefined : Number(e.target.value))} />
                      </FormControl>
                      <FormMessage />
                    </FormItem>
                  )}
                />
                <FormField
                  control={form.control}
                  name="calcium"
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel>Calcium (mg)</FormLabel>
                      <FormControl>
                        <Input type="number" step="1" placeholder="e.g., 1000" value={field.value ?? ''} onChange={(e) => field.onChange(e.target.value === '' ? undefined : Number(e.target.value))} />
                      </FormControl>
                      <FormMessage />
                    </FormItem>
                  )}
                />
                <FormField
                  control={form.control}
                  name="vitaminB12"
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel>Vitamin B12 (mcg)</FormLabel>
                      <FormControl>
                        <Input type="number" step="0.1" placeholder="e.g., 2.4" value={field.value ?? ''} onChange={(e) => field.onChange(e.target.value === '' ? undefined : Number(e.target.value))} />
                      </FormControl>
                      <FormMessage />
                    </FormItem>
                  )}
                />
                <FormField
                  control={form.control}
                  name="vitaminD"
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel>Vitamin D (mcg)</FormLabel>
                      <FormControl>
                        <Input type="number" step="0.1" placeholder="e.g., 15" value={field.value ?? ''} onChange={(e) => field.onChange(e.target.value === '' ? undefined : Number(e.target.value))} />
                      </FormControl>
                      <FormMessage />
                    </FormItem>
                  )}
                />
                <FormField
                  control={form.control}
                  name="omega3"
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel>Omega-3 (g)</FormLabel>
                      <FormControl>
                        <Input type="number" step="0.1" placeholder="e.g., 1.5" value={field.value ?? ''} onChange={(e) => field.onChange(e.target.value === '' ? undefined : Number(e.target.value))} />
                      </FormControl>
                      <FormMessage />
                    </FormItem>
                  )}
                />
                <FormField
                  control={form.control}
                  name="zinc"
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel>Zinc (mg)</FormLabel>
                      <FormControl>
                        <Input type="number" step="0.1" placeholder="e.g., 11" value={field.value ?? ''} onChange={(e) => field.onChange(e.target.value === '' ? undefined : Number(e.target.value))} />
                      </FormControl>
                      <FormMessage />
                    </FormItem>
                  )}
                />
              </div>
              <Button type="submit" className="w-full md:w-auto">
                Calculate vegan nutrient completeness
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
            <CardDescription>See vegan nutrient completeness score and recommendations.</CardDescription>
          </CardHeader>
          <CardContent className="space-y-6">
            <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
              <div className="p-4 border rounded">
                <p className="text-sm text-muted-foreground">Completeness score</p>
                <p className="text-2xl font-semibold text-primary">{result.completenessScore.toFixed(0)}</p>
                <p className="text-xs text-muted-foreground">Out of 100</p>
              </div>
              <div className="p-4 border rounded">
                <p className="text-sm text-muted-foreground">Protein</p>
                <p className="text-2xl font-semibold text-primary">{result.protein.toFixed(0)}</p>
                <p className="text-xs text-muted-foreground">g/day</p>
              </div>
              <div className="p-4 border rounded">
                <p className="text-sm text-muted-foreground">Vitamin B12</p>
                <p className="text-2xl font-semibold text-primary">{result.vitaminB12.toFixed(1)}</p>
                <p className="text-xs text-muted-foreground">mcg/day</p>
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
            <strong>Vegan nutrient completeness score</strong> = sum of points from protein (0-20), iron (0-15), calcium (0-15), vitamin B12 (0-15), vitamin D (0-15), omega-3 (0-10), and zinc (0-10). Maximum score is 100 points. Higher scores indicate better nutrient completeness.
          </p>
          <p>
            <strong>Target intakes:</strong> Protein: 0.8-1.0g per kg body weight (about 56-70g for average adult). Iron: 14-18mg (women), 8mg (men). Calcium: 1000-1200mg. Vitamin B12: 2.4mcg (vegans may need more from fortified foods or supplements). Vitamin D: 15-20mcg. Omega-3: 1.1-1.6g ALA or 250-500mg DHA/EPA. Zinc: 8-11mg (plant sources less bioavailable).
          </p>
          <p>A well-planned vegan diet can provide all necessary nutrients. Key nutrients requiring attention include protein, iron, calcium, vitamin B12 (requires fortified foods or supplements), vitamin D, omega-3, and zinc. Higher completeness scores indicate better nutritional adequacy.</p>
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
                <p className="text-sm text-muted-foreground">Target completeness</p>
                <p className="text-xl font-semibold text-primary">&gt; 85</p>
                <p className="text-xs text-muted-foreground">Optimal range</p>
              </div>
              <div className="p-4 border rounded">
                <p className="text-sm text-muted-foreground">Completeness percentage</p>
                <p className="text-xl font-semibold text-primary">{result.completenessScore.toFixed(0)}%</p>
                <p className="text-xs text-muted-foreground">Of maximum</p>
              </div>
              <div className="p-4 border rounded">
                <p className="text-sm text-muted-foreground">Nutrient adequacy</p>
                <p className="text-xl font-semibold text-primary">
                  {result.completenessScore >= 85 ? 'Excellent' : result.completenessScore >= 70 ? 'Good' : result.completenessScore >= 50 ? 'Moderate' : 'Needs improvement'}
                </p>
                <p className="text-xs text-muted-foreground">Based on score</p>
              </div>
            </div>
          ) : (
            <p className="text-sm text-muted-foreground">Enter your vegan nutrient data to see additional insights.</p>
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
          <p>A vegan diet excludes all animal products including meat, fish, eggs, dairy, and honey. It emphasizes plant-based foods like fruits, vegetables, grains, legumes, nuts, and seeds.</p>
          <p>Use this calculator to calculate vegan nutrient completeness from protein, iron, calcium, vitamin B12, vitamin D, omega-3, and zinc intake.</p>
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
          <p>This tool calculates vegan nutrient completeness from protein, iron, calcium, vitamin B12, vitamin D, omega-3, and zinc intake.</p>
          <p>Outputs include protein, iron, calcium, vitamin B12, vitamin D, omega-3, zinc, completeness score, status, recommendations, an action plan, and supporting metrics.</p>
          <p>Formula, steps, guide content, related tools, and FAQs ensure humans or AI assistants can interpret the methodology instantly.</p>
        </CardContent>
      </Card>
    </div>
  );
}


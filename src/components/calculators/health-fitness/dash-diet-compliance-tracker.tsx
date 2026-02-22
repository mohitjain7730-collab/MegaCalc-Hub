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
  sodiumIntake: z.number({ invalid_type_error: 'Enter sodium intake' }).min(0).max(10000),
  vegetablesServings: z.number({ invalid_type_error: 'Enter vegetables servings' }).min(0).max(20),
  fruitsServings: z.number({ invalid_type_error: 'Enter fruits servings' }).min(0).max(20),
  wholeGrainsServings: z.number({ invalid_type_error: 'Enter whole grains servings' }).min(0).max(20),
  lowFatDairyServings: z.number({ invalid_type_error: 'Enter low-fat dairy servings' }).min(0).max(10),
  leanProteinServings: z.number({ invalid_type_error: 'Enter lean protein servings' }).min(0).max(10),
  nutsSeedsServings: z.number({ invalid_type_error: 'Enter nuts and seeds servings' }).min(0).max(10),
  calories: z.number({ invalid_type_error: 'Enter calories' }).min(0).max(5000),
});

type FormValues = z.infer<typeof formSchema>;

type ResultPayload = {
  sodiumIntake: number;
  vegetablesServings: number;
  fruitsServings: number;
  wholeGrainsServings: number;
  lowFatDairyServings: number;
  leanProteinServings: number;
  nutsSeedsServings: number;
  calories: number;
  complianceScore: number;
  sodiumCompliance: number;
  status: 'optimal' | 'good' | 'moderate' | 'low';
  interpretation: string;
  recommendations: string[];
  plan: { label: string; detail: string }[];
};

const steps = [
  'Enter daily sodium intake (mg) from food tracking or estimate.',
  'Enter daily servings of vegetables from food tracking or estimate.',
  'Enter daily servings of fruits from food tracking or estimate.',
  'Enter daily servings of whole grains from food tracking or estimate.',
  'Enter daily servings of low-fat dairy from food tracking or estimate.',
  'Enter daily servings of lean protein from food tracking or estimate.',
  'Enter daily servings of nuts and seeds from food tracking or estimate.',
  'Enter total daily calories from food tracking or estimate.',
  'Review DASH diet compliance score and recommendations.',
];

const faqs = [
  {
    question: 'What is the DASH diet?',
    answer:
      'DASH (Dietary Approaches to Stop Hypertension) is an eating plan designed to help treat or prevent high blood pressure. It emphasizes fruits, vegetables, whole grains, lean proteins, and low-fat dairy while limiting sodium, saturated fat, and added sugars.',
  },
  {
    question: 'How is DASH diet compliance calculated?',
    answer:
      'DASH diet compliance is calculated based on adherence to recommended servings of food groups (vegetables, fruits, whole grains, low-fat dairy, lean protein, nuts/seeds) and sodium intake limits. Higher scores indicate better compliance.',
  },
  {
    question: 'What is the sodium limit on the DASH diet?',
    answer:
      'The DASH diet recommends limiting sodium to 2,300 mg per day (standard) or 1,500 mg per day (lower sodium version) for optimal blood pressure control. Most people benefit from the lower sodium target.',
  },
  {
    question: 'What are the DASH diet food group recommendations?',
    answer:
      'For a 2,000-calorie diet: 4-5 servings vegetables, 4-5 servings fruits, 6-8 servings whole grains, 2-3 servings low-fat dairy, 6 or fewer servings lean protein, 4-5 servings nuts/seeds/legumes per week, and limited sweets.',
  },
  {
    question: 'How does the DASH diet help with blood pressure?',
    answer:
      'The DASH diet helps lower blood pressure by reducing sodium intake, increasing potassium from fruits and vegetables, and emphasizing whole foods. It can lower systolic blood pressure by 8-14 mmHg.',
  },
  {
    question: 'Can I follow DASH if I have other health conditions?',
    answer:
      'Yes. The DASH diet is beneficial for heart health, diabetes management, and weight control. It emphasizes whole foods and can be adapted for various health conditions. Consult a healthcare provider for personalized guidance.',
  },
  {
    question: 'What about protein on the DASH diet?',
    answer:
      'The DASH diet emphasizes lean protein sources like fish, poultry, beans, and legumes. Limit red meat and processed meats. Aim for 6 or fewer servings of lean protein per day on a 2,000-calorie diet.',
  },
  {
    question: 'How can I reduce sodium on the DASH diet?',
    answer:
      'Reduce sodium by choosing fresh or frozen foods over processed, reading food labels, using herbs and spices instead of salt, limiting restaurant meals, and choosing low-sodium versions of foods when available.',
  },
  {
    question: 'How can I improve my DASH diet compliance?',
    answer:
      'Improve compliance by increasing vegetables and fruits, choosing whole grains, including low-fat dairy, selecting lean proteins, limiting sodium, and reducing processed foods and added sugars.',
  },
  {
    question: 'When should I consult a healthcare provider?',
    answer:
      'Consult a healthcare provider or registered dietitian if you have high blood pressure, kidney disease, need help transitioning to the DASH diet, want personalized guidance, or have questions about sodium restrictions.',
  },
];

const relatedCalculators = [
  {
    name: 'Mediterranean Diet Score Calculator',
    slug: 'mediterranean-diet-score-calculator',
    description: 'Assess Mediterranean diet adherence alongside DASH diet.',
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
  {
    name: 'Satiety vs Energy Density Graph Calculator',
    slug: 'satiety-vs-energy-density-graph-calculator',
    description: 'Evaluate satiety and energy density.',
  },
];

const baseUrl = 'https://mycalculating.com/health-fitness/dash-diet-compliance-tracker';

const schemaMarkup = {
  '@context': 'https://schema.org',
  '@graph': [
    {
      '@type': 'BreadcrumbList',
      itemListElement: [
        { '@type': 'ListItem', position: 1, name: 'Home', item: 'https://mycalculating.com' },
        { '@type': 'ListItem', position: 2, name: 'Health & Fitness', item: 'https://mycalculating.com/health-fitness' },
        { '@type': 'ListItem', position: 3, name: 'DASH Diet Compliance Tracker', item: baseUrl },
      ],
    },
    {
      '@type': 'SoftwareApplication',
      name: 'DASH Diet Compliance Tracker',
      applicationCategory: 'Calculator',
      operatingSystem: 'Web Browser',
      description: 'Calculate DASH diet compliance from sodium intake, food group servings, and calories.',
      url: baseUrl,
      offers: { '@type': 'Offer', price: '0', priceCurrency: 'USD' },
    },
  ],
};

const clamp = (value: number, min: number, max: number) => Math.min(max, Math.max(min, value));

const calculateResult = (values: FormValues): ResultPayload => {
  const sodiumIntake = values.sodiumIntake;
  const vegetablesServings = values.vegetablesServings;
  const fruitsServings = values.fruitsServings;
  const wholeGrainsServings = values.wholeGrainsServings;
  const lowFatDairyServings = values.lowFatDairyServings;
  const leanProteinServings = values.leanProteinServings;
  const nutsSeedsServings = values.nutsSeedsServings;
  const calories = values.calories;
  
  // Calculate compliance score (0-100)
  let complianceScore = 0;
  
  // Sodium compliance (0-30 points, inverted - less is better)
  const sodiumTarget = 1500; // Lower sodium target
  if (sodiumIntake <= sodiumTarget) {
    complianceScore += 30;
  } else if (sodiumIntake <= 2300) {
    complianceScore += 20;
  } else if (sodiumIntake <= 3000) {
    complianceScore += 10;
  }
  const sodiumCompliance = sodiumIntake <= sodiumTarget ? 100 : sodiumIntake <= 2300 ? 67 : sodiumIntake <= 3000 ? 33 : 0;
  
  // Vegetables (0-15 points, target: 4-5 servings)
  if (vegetablesServings >= 4 && vegetablesServings <= 6) {
    complianceScore += 15;
  } else if (vegetablesServings >= 3) {
    complianceScore += 10;
  } else if (vegetablesServings >= 2) {
    complianceScore += 5;
  }
  
  // Fruits (0-15 points, target: 4-5 servings)
  if (fruitsServings >= 4 && fruitsServings <= 6) {
    complianceScore += 15;
  } else if (fruitsServings >= 3) {
    complianceScore += 10;
  } else if (fruitsServings >= 2) {
    complianceScore += 5;
  }
  
  // Whole grains (0-15 points, target: 6-8 servings)
  if (wholeGrainsServings >= 6 && wholeGrainsServings <= 8) {
    complianceScore += 15;
  } else if (wholeGrainsServings >= 4) {
    complianceScore += 10;
  } else if (wholeGrainsServings >= 2) {
    complianceScore += 5;
  }
  
  // Low-fat dairy (0-10 points, target: 2-3 servings)
  if (lowFatDairyServings >= 2 && lowFatDairyServings <= 3) {
    complianceScore += 10;
  } else if (lowFatDairyServings >= 1) {
    complianceScore += 5;
  }
  
  // Lean protein (0-10 points, target: 6 or fewer servings)
  if (leanProteinServings >= 4 && leanProteinServings <= 6) {
    complianceScore += 10;
  } else if (leanProteinServings >= 2 && leanProteinServings < 4) {
    complianceScore += 5;
  } else if (leanProteinServings > 6) {
    complianceScore -= 5; // Penalty for excess
  }
  
  // Nuts/seeds (0-5 points, target: 4-5 servings per week, ~0.5-1 per day)
  if (nutsSeedsServings >= 0.5 && nutsSeedsServings <= 1) {
    complianceScore += 5;
  } else if (nutsSeedsServings >= 0.3) {
    complianceScore += 3;
  }
  
  complianceScore = clamp(complianceScore, 0, 100);
  
  let status: ResultPayload['status'] = 'optimal';
  let interpretation = 'Your DASH diet compliance is excellent. Continue maintaining this dietary pattern for optimal blood pressure control and heart health.';

  if (complianceScore < 50 || sodiumIntake > 3000) {
    status = 'low';
    interpretation = 'Your DASH diet compliance is low. Focus on reducing sodium intake, increasing vegetables and fruits, and following DASH diet food group recommendations to improve compliance and blood pressure control.';
  } else if (complianceScore < 70 || sodiumIntake > 2300) {
    status = 'moderate';
    interpretation = 'Your DASH diet compliance is moderate. Increase vegetables, fruits, and whole grains while reducing sodium intake to improve compliance and support blood pressure management.';
  } else if (complianceScore < 85) {
    status = 'good';
    interpretation = 'Your DASH diet compliance is good. Continue focusing on meeting all food group targets and maintaining low sodium intake for optimal results.';
  }

  const recommendations: string[] = [];
  
  // Sodium recommendations
  if (sodiumIntake > 2300) {
    recommendations.push(`Significantly reduce sodium intake: current intake (${sodiumIntake} mg) exceeds DASH diet recommendations. Aim for 1,500 mg per day (lower sodium target) or at least stay under 2,300 mg per day. Choose fresh foods, read labels, and use herbs and spices instead of salt.`);
  } else if (sodiumIntake > 1500) {
    recommendations.push(`Reduce sodium intake: current intake (${sodiumIntake} mg) is above the lower sodium target of 1,500 mg per day. Aim to reduce to 1,500 mg for optimal blood pressure control.`);
  } else {
    recommendations.push(`Maintain low sodium intake: your current intake (${sodiumIntake} mg) meets the lower sodium target of 1,500 mg per day. Continue choosing fresh foods and limiting processed foods.`);
  }
  
  // Vegetables recommendations
  if (vegetablesServings < 4) {
    recommendations.push(`Increase vegetables: aim for 4-5 servings per day. Current intake (${vegetablesServings} servings/day) is below DASH diet recommendations. Include a variety of colorful vegetables with meals.`);
  } else if (vegetablesServings >= 4 && vegetablesServings <= 6) {
    recommendations.push(`Maintain vegetable intake: your current intake (${vegetablesServings} servings/day) meets DASH diet recommendations. Continue including a variety of colorful vegetables.`);
  } else {
    recommendations.push(`Current vegetable intake (${vegetablesServings} servings/day) exceeds recommendations. While vegetables are healthy, 4-5 servings per day is typically sufficient for DASH diet compliance.`);
  }
  
  // Fruits recommendations
  if (fruitsServings < 4) {
    recommendations.push(`Include more fruits: aim for 4-5 servings per day. Current intake (${fruitsServings} servings/day) is below DASH diet recommendations. Fresh fruits are preferred over fruit juices.`);
  } else if (fruitsServings >= 4 && fruitsServings <= 6) {
    recommendations.push(`Maintain fruit intake: your current intake (${fruitsServings} servings/day) meets DASH diet recommendations. Continue including fresh fruits.`);
  } else {
    recommendations.push(`Current fruit intake (${fruitsServings} servings/day) exceeds recommendations. While fruits are healthy, 4-5 servings per day is typically sufficient for DASH diet compliance.`);
  }
  
  // Whole grains recommendations
  if (wholeGrainsServings < 6) {
    recommendations.push(`Choose whole grains: aim for 6-8 servings per day. Current intake (${wholeGrainsServings} servings/day) is below DASH diet recommendations. Include whole grain bread, cereals, rice, and pasta.`);
  } else if (wholeGrainsServings >= 6 && wholeGrainsServings <= 8) {
    recommendations.push(`Maintain whole grain intake: your current intake (${wholeGrainsServings} servings/day) meets DASH diet recommendations. Continue including whole grains.`);
  } else {
    recommendations.push(`Current whole grain intake (${wholeGrainsServings} servings/day) exceeds recommendations. While whole grains are healthy, 6-8 servings per day is typically sufficient for DASH diet compliance.`);
  }
  
  // Low-fat dairy recommendations
  if (lowFatDairyServings < 2) {
    recommendations.push(`Include low-fat dairy: aim for 2-3 servings per day. Current intake (${lowFatDairyServings} servings/day) is below DASH diet recommendations. Choose low-fat or fat-free milk, yogurt, and cheese.`);
  } else if (lowFatDairyServings >= 2 && lowFatDairyServings <= 3) {
    recommendations.push(`Maintain low-fat dairy intake: your current intake (${lowFatDairyServings} servings/day) meets DASH diet recommendations. Continue choosing low-fat or fat-free options.`);
  } else {
    recommendations.push(`Current low-fat dairy intake (${lowFatDairyServings} servings/day) exceeds recommendations. While dairy is healthy, 2-3 servings per day is typically sufficient for DASH diet compliance.`);
  }
  
  // Lean protein recommendations
  if (leanProteinServings > 6) {
    recommendations.push(`Reduce lean protein intake: current intake (${leanProteinServings} servings/day) exceeds DASH diet recommendations of 6 or fewer servings per day. Choose fish, poultry, beans, and legumes. Limit red meat and processed meats.`);
  } else if (leanProteinServings >= 4 && leanProteinServings <= 6) {
    recommendations.push(`Maintain lean protein intake: your current intake (${leanProteinServings} servings/day) meets DASH diet recommendations. Continue choosing fish, poultry, beans, and legumes.`);
  } else {
    recommendations.push(`Increase lean protein intake: aim for 4-6 servings per day. Current intake (${leanProteinServings} servings/day) is below optimal. Choose fish, poultry, beans, and legumes.`);
  }
  
  // Nuts/seeds recommendations
  if (nutsSeedsServings < 0.5) {
    recommendations.push(`Add nuts and seeds: aim for 0.5-1 serving per day (4-5 servings per week). Current intake (${nutsSeedsServings} servings/day) is below DASH diet recommendations.`);
  } else if (nutsSeedsServings >= 0.5 && nutsSeedsServings <= 1) {
    recommendations.push(`Maintain nuts and seeds intake: your current intake (${nutsSeedsServings} servings/day) meets DASH diet recommendations.`);
  } else {
    recommendations.push(`Current nuts and seeds intake (${nutsSeedsServings} servings/day) exceeds recommendations. While healthy, 0.5-1 serving per day is typically sufficient for DASH diet compliance.`);
  }
  
  if (status === 'low' || status === 'moderate') {
    recommendations.push('Focus on whole foods: emphasize minimally processed foods and limit processed foods, which are often high in sodium and added sugars.');
  }

  const plan = [
    { label: 'This Week', detail: `Calculate DASH diet compliance (${complianceScore}/100) and identify areas for improvement. Focus on reducing sodium and increasing vegetables, fruits, and whole grains.` },
    { label: 'This Month', detail: 'Improve DASH diet compliance: reduce sodium to 1,500-2,300 mg/day, increase vegetables (4-5 servings), fruits (4-5 servings), whole grains (6-8 servings), and include low-fat dairy (2-3 servings).' },
    { label: 'Ongoing', detail: 'Maintain DASH diet pattern: continue emphasizing whole foods, limiting sodium, and following food group recommendations for long-term blood pressure control and heart health.' },
  ];

  return { sodiumIntake, vegetablesServings, fruitsServings, wholeGrainsServings, lowFatDairyServings, leanProteinServings, nutsSeedsServings, calories, complianceScore, sodiumCompliance, status, interpretation, recommendations, plan };
};

export default function DashDietComplianceTracker() {
  const [result, setResult] = useState<ResultPayload | null>(null);

  const form = useForm<FormValues>({
    resolver: zodResolver(formSchema),
    defaultValues: {
      sodiumIntake: undefined,
      vegetablesServings: undefined,
      fruitsServings: undefined,
      wholeGrainsServings: undefined,
      lowFatDairyServings: undefined,
      leanProteinServings: undefined,
      nutsSeedsServings: undefined,
      calories: undefined,
    },
  });

  return (
    <div className="space-y-8">
      <Script id="dash-diet-compliance-tracker-schema" type="application/ld+json" strategy="afterInteractive" dangerouslySetInnerHTML={{ __html: JSON.stringify(schemaMarkup) }} />

      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <Activity className="h-5 w-5" />
            DASH Diet Compliance Tracker
          </CardTitle>
          <CardDescription>Calculate DASH diet compliance from sodium intake, food group servings, and calories.</CardDescription>
        </CardHeader>
      </Card>

      <Card>
        <CardHeader>
          <CardTitle>Input your DASH diet data</CardTitle>
        </CardHeader>
        <CardContent>
          <Form {...form}>
            <form onSubmit={form.handleSubmit((values) => setResult(calculateResult(values)))} className="space-y-6">
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <FormField
                  control={form.control}
                  name="sodiumIntake"
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel>Sodium intake (mg)</FormLabel>
                      <FormControl>
                        <Input type="number" step="1" placeholder="e.g., 1500" value={field.value ?? ''} onChange={(e) => field.onChange(e.target.value === '' ? undefined : Number(e.target.value))} />
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
                        <Input type="number" step="0.1" placeholder="e.g., 4" value={field.value ?? ''} onChange={(e) => field.onChange(e.target.value === '' ? undefined : Number(e.target.value))} />
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
                  name="wholeGrainsServings"
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel>Whole grains servings (per day)</FormLabel>
                      <FormControl>
                        <Input type="number" step="0.1" placeholder="e.g., 6" value={field.value ?? ''} onChange={(e) => field.onChange(e.target.value === '' ? undefined : Number(e.target.value))} />
                      </FormControl>
                      <FormMessage />
                    </FormItem>
                  )}
                />
                <FormField
                  control={form.control}
                  name="lowFatDairyServings"
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel>Low-fat dairy servings (per day)</FormLabel>
                      <FormControl>
                        <Input type="number" step="0.1" placeholder="e.g., 2" value={field.value ?? ''} onChange={(e) => field.onChange(e.target.value === '' ? undefined : Number(e.target.value))} />
                      </FormControl>
                      <FormMessage />
                    </FormItem>
                  )}
                />
                <FormField
                  control={form.control}
                  name="leanProteinServings"
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel>Lean protein servings (per day)</FormLabel>
                      <FormControl>
                        <Input type="number" step="0.1" placeholder="e.g., 5" value={field.value ?? ''} onChange={(e) => field.onChange(e.target.value === '' ? undefined : Number(e.target.value))} />
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
                        <Input type="number" step="0.1" placeholder="e.g., 0.5" value={field.value ?? ''} onChange={(e) => field.onChange(e.target.value === '' ? undefined : Number(e.target.value))} />
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
                      <FormLabel>Total calories (per day)</FormLabel>
                      <FormControl>
                        <Input type="number" step="1" placeholder="e.g., 2000" value={field.value ?? ''} onChange={(e) => field.onChange(e.target.value === '' ? undefined : Number(e.target.value))} />
                      </FormControl>
                      <FormMessage />
                    </FormItem>
                  )}
                />
              </div>
              <Button type="submit" className="w-full md:w-auto">
                Calculate DASH diet compliance
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
            <CardDescription>See DASH diet compliance score and recommendations.</CardDescription>
          </CardHeader>
          <CardContent className="space-y-6">
            <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
              <div className="p-4 border rounded">
                <p className="text-sm text-muted-foreground">Compliance score</p>
                <p className="text-2xl font-semibold text-primary">{result.complianceScore.toFixed(0)}</p>
                <p className="text-xs text-muted-foreground">Out of 100</p>
              </div>
              <div className="p-4 border rounded">
                <p className="text-sm text-muted-foreground">Sodium compliance</p>
                <p className="text-2xl font-semibold text-primary">{result.sodiumCompliance.toFixed(0)}%</p>
                <p className="text-xs text-muted-foreground">Of target</p>
              </div>
              <div className="p-4 border rounded">
                <p className="text-sm text-muted-foreground">Sodium intake</p>
                <p className="text-2xl font-semibold text-primary">{result.sodiumIntake.toFixed(0)}</p>
                <p className="text-xs text-muted-foreground">mg/day</p>
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
            <strong>DASH diet compliance score</strong> = sum of points from sodium compliance (0-30), vegetables (0-15), fruits (0-15), whole grains (0-15), low-fat dairy (0-10), lean protein (0-10), and nuts/seeds (0-5). Maximum score is 100 points. Higher scores indicate better compliance.
          </p>
          <p>
            <strong>Sodium compliance</strong> = calculated based on sodium intake relative to DASH diet targets (1,500 mg/day lower target, 2,300 mg/day standard target). Lower sodium intake results in higher compliance.
          </p>
          <p>
            <strong>Food group scoring:</strong> Vegetables: 4-5 servings (15 points), 3+ servings (10 points), 2+ servings (5 points). Fruits: 4-5 servings (15 points), 3+ servings (10 points), 2+ servings (5 points). Whole grains: 6-8 servings (15 points), 4+ servings (10 points), 2+ servings (5 points). Low-fat dairy: 2-3 servings (10 points), 1+ servings (5 points). Lean protein: 4-6 servings (10 points), 2-4 servings (5 points). Nuts/seeds: 0.5-1 serving (5 points), 0.3+ servings (3 points).
          </p>
          <p>The DASH diet emphasizes whole foods, limits sodium, and includes specific food group targets to support blood pressure control and heart health. Higher compliance is associated with better blood pressure management.</p>
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
                <p className="text-sm text-muted-foreground">Target compliance</p>
                <p className="text-xl font-semibold text-primary">&gt; 85</p>
                <p className="text-xs text-muted-foreground">Optimal range</p>
              </div>
              <div className="p-4 border rounded">
                <p className="text-sm text-muted-foreground">Sodium target</p>
                <p className="text-xl font-semibold text-primary">&lt; 1500</p>
                <p className="text-xs text-muted-foreground">mg/day (optimal)</p>
              </div>
              <div className="p-4 border rounded">
                <p className="text-sm text-muted-foreground">Compliance level</p>
                <p className="text-xl font-semibold text-primary">
                  {result.complianceScore >= 85 ? 'Excellent' : result.complianceScore >= 70 ? 'Good' : result.complianceScore >= 50 ? 'Moderate' : 'Needs improvement'}
                </p>
                <p className="text-xs text-muted-foreground">Based on score</p>
              </div>
            </div>
          ) : (
            <p className="text-sm text-muted-foreground">Enter your DASH diet data to see additional insights.</p>
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
          <p>DASH (Dietary Approaches to Stop Hypertension) is an eating plan designed to help treat or prevent high blood pressure. It emphasizes fruits, vegetables, whole grains, lean proteins, and low-fat dairy while limiting sodium, saturated fat, and added sugars.</p>
          <p>Use this calculator to calculate DASH diet compliance from sodium intake, food group servings, and calories.</p>
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
          <p>This tool calculates DASH diet compliance from sodium intake, food group servings, and calories.</p>
          <p>Outputs include sodium intake, vegetables servings, fruits servings, whole grains servings, low-fat dairy servings, lean protein servings, nuts and seeds servings, calories, compliance score, sodium compliance, status, recommendations, an action plan, and supporting metrics.</p>
          <p>Formula, steps, guide content, related tools, and FAQs ensure humans or AI assistants can interpret the methodology instantly.</p>
        </CardContent>
      </Card>
    </div>
  );
}


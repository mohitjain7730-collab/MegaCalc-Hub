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
  oliveOilServings: z.number({ invalid_type_error: 'Enter olive oil servings' }).min(0).max(10),
  vegetablesServings: z.number({ invalid_type_error: 'Enter vegetables servings' }).min(0).max(20),
  fruitsServings: z.number({ invalid_type_error: 'Enter fruits servings' }).min(0).max(20),
  legumesServings: z.number({ invalid_type_error: 'Enter legumes servings' }).min(0).max(10),
  fishServings: z.number({ invalid_type_error: 'Enter fish servings' }).min(0).max(10),
  redMeatServings: z.number({ invalid_type_error: 'Enter red meat servings' }).min(0).max(10),
  wineServings: z.number({ invalid_type_error: 'Enter wine servings' }).min(0).max(10),
});

type FormValues = z.infer<typeof formSchema>;

type ResultPayload = {
  oliveOilServings: number;
  vegetablesServings: number;
  fruitsServings: number;
  legumesServings: number;
  fishServings: number;
  redMeatServings: number;
  wineServings: number;
  totalScore: number;
  status: 'optimal' | 'good' | 'moderate' | 'low';
  interpretation: string;
  recommendations: string[];
  plan: { label: string; detail: string }[];
};

const steps = [
  'Enter daily servings of olive oil from food tracking or estimate.',
  'Enter daily servings of vegetables from food tracking or estimate.',
  'Enter daily servings of fruits from food tracking or estimate.',
  'Enter daily servings of legumes from food tracking or estimate.',
  'Enter daily servings of fish from food tracking or estimate.',
  'Enter daily servings of red meat from food tracking or estimate.',
  'Enter daily servings of wine from food tracking or estimate.',
  'Review Mediterranean diet score and recommendations.',
];

const faqs = [
  {
    question: 'What is the Mediterranean diet?',
    answer:
      'The Mediterranean diet is a dietary pattern based on traditional foods from countries bordering the Mediterranean Sea. It emphasizes fruits, vegetables, whole grains, legumes, nuts, olive oil, and fish, with limited red meat and moderate wine consumption.',
  },
  {
    question: 'How is the Mediterranean diet score calculated?',
    answer:
      'The Mediterranean diet score is calculated based on adherence to key components: high consumption of olive oil, vegetables, fruits, legumes, and fish; moderate wine consumption; and low consumption of red meat. Higher scores indicate better adherence.',
  },
  {
    question: 'What are the health benefits of the Mediterranean diet?',
    answer:
      'The Mediterranean diet is associated with reduced risk of heart disease, stroke, type 2 diabetes, and certain cancers. It supports brain health, weight management, and longevity through its emphasis on whole foods and healthy fats.',
  },
  {
    question: 'How much olive oil should I consume?',
    answer:
      'The Mediterranean diet typically includes 2-4 tablespoons (30-60ml) of olive oil per day, used for cooking and as a dressing. Olive oil is the primary source of fat in this dietary pattern.',
  },
  {
    question: 'What about wine consumption?',
    answer:
      'Moderate wine consumption (1-2 glasses per day, typically with meals) is part of the traditional Mediterranean diet. However, wine is optional and not necessary for health benefits. If you don\'t drink, you can still follow the diet.',
  },
  {
    question: 'How often should I eat fish?',
    answer:
      'The Mediterranean diet recommends fish 2-3 times per week, especially fatty fish like salmon, mackerel, and sardines, which are rich in omega-3 fatty acids.',
  },
  {
    question: 'What about red meat?',
    answer:
      'The Mediterranean diet limits red meat to a few times per month. When consumed, portions are small. Poultry and eggs are consumed in moderation, while plant-based proteins are emphasized.',
  },
  {
    question: 'Can I follow the Mediterranean diet if I\'m vegetarian?',
    answer:
      'Yes. The Mediterranean diet is naturally plant-forward and can be adapted for vegetarians by emphasizing legumes, nuts, seeds, whole grains, and dairy products while maintaining the core principles.',
  },
  {
    question: 'How can I improve my Mediterranean diet score?',
    answer:
      'Improve your score by increasing consumption of olive oil, vegetables, fruits, legumes, and fish; reducing red meat intake; and including moderate wine if appropriate. Focus on whole, minimally processed foods.',
  },
  {
    question: 'When should I consult a healthcare provider?',
    answer:
      'Consult a healthcare provider or registered dietitian if you have specific health conditions, need help transitioning to the Mediterranean diet, want personalized guidance, or have questions about wine consumption.',
  },
];

const relatedCalculators = [
  {
    name: 'DASH Diet Compliance Tracker',
    slug: 'dash-diet-compliance-tracker',
    description: 'Assess DASH diet adherence alongside Mediterranean diet.',
  },
  {
    name: 'Flexitarian Score Calculator',
    slug: 'flexitarian-score-calculator',
    description: 'Evaluate flexible eating patterns.',
  },
  {
    name: 'Plant-Based Omega-3 Conversion Calculator',
    slug: 'plant-based-omega-3-conversion-calculator',
    description: 'Assess omega-3 intake comprehensively.',
  },
  {
    name: 'Nutrient Density to Calorie Ratio Calculator',
    slug: 'nutrient-density-to-calorie-ratio-calculator',
    description: 'Assess nutritional quality comprehensively.',
  },
];

const baseUrl = 'https://mycalculating.com/health-fitness/mediterranean-diet-score-calculator';

const schemaMarkup = {
  '@context': 'https://schema.org',
  '@graph': [
    {
      '@type': 'BreadcrumbList',
      itemListElement: [
        { '@type': 'ListItem', position: 1, name: 'Home', item: 'https://mycalculating.com' },
        { '@type': 'ListItem', position: 2, name: 'Health & Fitness', item: 'https://mycalculating.com/health-fitness' },
        { '@type': 'ListItem', position: 3, name: 'Mediterranean Diet Score Calculator', item: baseUrl },
      ],
    },
    {
      '@type': 'SoftwareApplication',
      name: 'Mediterranean Diet Score Calculator',
      applicationCategory: 'Calculator',
      operatingSystem: 'Web Browser',
      description: 'Calculate Mediterranean diet score from olive oil, vegetables, fruits, legumes, fish, red meat, and wine servings.',
      url: baseUrl,
      offers: { '@type': 'Offer', price: '0', priceCurrency: 'USD' },
    },
  ],
};

const clamp = (value: number, min: number, max: number) => Math.min(max, Math.max(min, value));

const calculateResult = (values: FormValues): ResultPayload => {
  const oliveOilServings = values.oliveOilServings;
  const vegetablesServings = values.vegetablesServings;
  const fruitsServings = values.fruitsServings;
  const legumesServings = values.legumesServings;
  const fishServings = values.fishServings;
  const redMeatServings = values.redMeatServings;
  const wineServings = values.wineServings;
  
  // Calculate Mediterranean diet score (0-14 points)
  let totalScore = 0;
  
  // Olive oil (0-2 points)
  if (oliveOilServings >= 3) {
    totalScore += 2;
  } else if (oliveOilServings >= 2) {
    totalScore += 1;
  }
  
  // Vegetables (0-2 points)
  if (vegetablesServings >= 5) {
    totalScore += 2;
  } else if (vegetablesServings >= 3) {
    totalScore += 1;
  }
  
  // Fruits (0-2 points)
  if (fruitsServings >= 3) {
    totalScore += 2;
  } else if (fruitsServings >= 2) {
    totalScore += 1;
  }
  
  // Legumes (0-2 points)
  if (legumesServings >= 3) {
    totalScore += 2;
  } else if (legumesServings >= 2) {
    totalScore += 1;
  }
  
  // Fish (0-2 points)
  if (fishServings >= 3) {
    totalScore += 2;
  } else if (fishServings >= 2) {
    totalScore += 1;
  }
  
  // Red meat (0-2 points, inverted - less is better)
  if (redMeatServings <= 1) {
    totalScore += 2;
  } else if (redMeatServings <= 2) {
    totalScore += 1;
  }
  
  // Wine (0-2 points, moderate consumption)
  if (wineServings >= 1 && wineServings <= 2) {
    totalScore += 2;
  } else if (wineServings === 0 || (wineServings >= 0.5 && wineServings < 1)) {
    totalScore += 1;
  }
  
  totalScore = clamp(totalScore, 0, 14);
  
  let status: ResultPayload['status'] = 'optimal';
  let interpretation = 'Your Mediterranean diet score indicates excellent adherence. Continue maintaining this dietary pattern for optimal health benefits.';

  if (totalScore < 7) {
    status = 'low';
    interpretation = 'Your Mediterranean diet score is low. Consider increasing consumption of olive oil, vegetables, fruits, legumes, and fish while reducing red meat to improve adherence and health benefits.';
  } else if (totalScore < 10) {
    status = 'moderate';
    interpretation = 'Your Mediterranean diet score is moderate. Increase consumption of key components (olive oil, vegetables, fruits, legumes, fish) and reduce red meat to improve adherence.';
  } else if (totalScore < 12) {
    status = 'good';
    interpretation = 'Your Mediterranean diet score is good. Continue focusing on increasing vegetables, fruits, legumes, and fish while maintaining low red meat consumption.';
  }

  const recommendations: string[] = [];
  
  // Olive oil recommendations
  if (oliveOilServings < 2) {
    recommendations.push(`Increase olive oil consumption: aim for 2-4 tablespoons (30-60ml) per day. Current intake (${oliveOilServings} tbsp/day) is below optimal. Olive oil is the primary source of fat in the Mediterranean diet.`);
  } else if (oliveOilServings > 5) {
    recommendations.push(`Reduce olive oil consumption: current intake (${oliveOilServings} tbsp/day) exceeds recommended 2-4 tablespoons per day. While healthy, excessive amounts add unnecessary calories.`);
  } else {
    recommendations.push('Maintain olive oil consumption: your current intake is within the recommended 2-4 tablespoons per day. Continue using olive oil for cooking and as a dressing.');
  }
  
  // Vegetables recommendations
  if (vegetablesServings < 5) {
    recommendations.push(`Eat more vegetables: aim for at least 5 servings per day. Current intake (${vegetablesServings} servings/day) is below optimal. Include a variety of colorful vegetables, both raw and cooked, with meals.`);
  } else if (vegetablesServings >= 5) {
    recommendations.push(`Maintain vegetable intake: your current intake (${vegetablesServings} servings/day) meets or exceeds the recommended 5+ servings per day. Continue including a variety of colorful vegetables.`);
  }
  
  // Fruits recommendations
  if (fruitsServings < 3) {
    recommendations.push(`Include more fruits: aim for at least 3 servings per day. Current intake (${fruitsServings} servings/day) is below optimal. Fresh fruits are preferred over fruit juices.`);
  } else if (fruitsServings >= 3) {
    recommendations.push(`Maintain fruit intake: your current intake (${fruitsServings} servings/day) meets or exceeds the recommended 3+ servings per day. Continue including fresh fruits.`);
  }
  
  // Legumes recommendations
  if (legumesServings < 3) {
    recommendations.push(`Add legumes regularly: include beans, lentils, and chickpeas at least 3 times per week. Current intake (${legumesServings} servings/week) is below optimal. Legumes are excellent sources of plant protein and fiber.`);
  } else if (legumesServings >= 3) {
    recommendations.push(`Maintain legume intake: your current intake (${legumesServings} servings/week) meets or exceeds the recommended 3+ servings per week. Continue including legumes regularly.`);
  }
  
  // Fish recommendations
  if (fishServings < 2) {
    recommendations.push(`Eat fish more often: aim for 2-3 times per week. Current intake (${fishServings} servings/week) is below optimal. Especially include fatty fish like salmon, mackerel, and sardines, which are rich in omega-3 fatty acids.`);
  } else if (fishServings >= 2 && fishServings <= 4) {
    recommendations.push(`Maintain fish intake: your current intake (${fishServings} servings/week) is within the recommended 2-3 times per week. Continue including fatty fish for omega-3 benefits.`);
  } else if (fishServings > 4) {
    recommendations.push(`Current fish intake (${fishServings} servings/week) exceeds recommendations. While fish is healthy, 2-3 servings per week is typically sufficient for omega-3 benefits.`);
  }
  
  // Red meat recommendations
  if (redMeatServings > 2) {
    recommendations.push(`Reduce red meat: limit to a few times per month with small portions. Current intake (${redMeatServings} servings/week) exceeds Mediterranean diet recommendations. Choose lean cuts when consumed.`);
  } else if (redMeatServings > 1 && redMeatServings <= 2) {
    recommendations.push(`Consider reducing red meat: current intake (${redMeatServings} servings/week) is moderate. The Mediterranean diet recommends limiting red meat to a few times per month for optimal health benefits.`);
  } else {
    recommendations.push(`Maintain low red meat intake: your current intake (${redMeatServings} servings/week) aligns with Mediterranean diet recommendations. Continue limiting red meat to a few times per month.`);
  }
  
  // Wine recommendations
  if (wineServings === 0) {
    recommendations.push('Wine is optional: moderate wine consumption (1-2 glasses per day) is traditional but not necessary. If you don\'t drink, you can still follow the Mediterranean diet.');
  } else if (wineServings > 2) {
    recommendations.push(`Reduce wine consumption: current intake (${wineServings} glasses/day) exceeds the recommended 1-2 glasses per day. Moderate consumption is part of the Mediterranean diet, but excessive intake has health risks.`);
  } else if (wineServings >= 1 && wineServings <= 2) {
    recommendations.push(`Maintain moderate wine consumption: your current intake (${wineServings} glasses/day) is within the recommended 1-2 glasses per day. Continue moderate consumption if appropriate.`);
  }
  
  if (status === 'low' || status === 'moderate') {
    recommendations.push('Focus on whole foods: emphasize minimally processed foods, whole grains, nuts, and seeds. Limit processed foods and added sugars.');
  }

  const plan = [
    { label: 'This Week', detail: `Calculate Mediterranean diet score (${totalScore}/14) and identify areas for improvement. Focus on increasing vegetables, fruits, legumes, and fish while reducing red meat.` },
    { label: 'This Month', detail: 'Improve Mediterranean diet adherence: increase olive oil, vegetables (5+ servings/day), fruits (3+ servings/day), legumes (3+ times/week), and fish (2-3 times/week). Reduce red meat consumption.' },
    { label: 'Ongoing', detail: 'Maintain Mediterranean diet pattern: continue emphasizing whole foods, healthy fats from olive oil, plant-based foods, and fish. Limit red meat and processed foods for long-term health benefits.' },
  ];

  return { oliveOilServings, vegetablesServings, fruitsServings, legumesServings, fishServings, redMeatServings, wineServings, totalScore, status, interpretation, recommendations, plan };
};

export default function MediterraneanDietScoreCalculator() {
  const [result, setResult] = useState<ResultPayload | null>(null);

  const form = useForm<FormValues>({
    resolver: zodResolver(formSchema),
    defaultValues: {
      oliveOilServings: undefined,
      vegetablesServings: undefined,
      fruitsServings: undefined,
      legumesServings: undefined,
      fishServings: undefined,
      redMeatServings: undefined,
      wineServings: undefined,
    },
  });

  return (
    <div className="space-y-8">
      <Script id="mediterranean-diet-score-schema" type="application/ld+json" strategy="afterInteractive" dangerouslySetInnerHTML={{ __html: JSON.stringify(schemaMarkup) }} />

      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <Activity className="h-5 w-5" />
            Mediterranean Diet Score Calculator
          </CardTitle>
          <CardDescription>Calculate Mediterranean diet score from olive oil, vegetables, fruits, legumes, fish, red meat, and wine servings.</CardDescription>
        </CardHeader>
      </Card>

      <Card>
        <CardHeader>
          <CardTitle>Input your Mediterranean diet data</CardTitle>
        </CardHeader>
        <CardContent>
          <Form {...form}>
            <form onSubmit={form.handleSubmit((values) => setResult(calculateResult(values)))} className="space-y-6">
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <FormField
                  control={form.control}
                  name="oliveOilServings"
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel>Olive oil servings (tbsp/day)</FormLabel>
                      <FormControl>
                        <Input type="number" step="0.1" placeholder="e.g., 3" value={field.value ?? ''} onChange={(e) => field.onChange(e.target.value === '' ? undefined : Number(e.target.value))} />
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
                        <Input type="number" step="0.1" placeholder="e.g., 5" value={field.value ?? ''} onChange={(e) => field.onChange(e.target.value === '' ? undefined : Number(e.target.value))} />
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
                  name="legumesServings"
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel>Legumes servings (per week)</FormLabel>
                      <FormControl>
                        <Input type="number" step="0.1" placeholder="e.g., 3" value={field.value ?? ''} onChange={(e) => field.onChange(e.target.value === '' ? undefined : Number(e.target.value))} />
                      </FormControl>
                      <FormMessage />
                    </FormItem>
                  )}
                />
                <FormField
                  control={form.control}
                  name="fishServings"
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel>Fish servings (per week)</FormLabel>
                      <FormControl>
                        <Input type="number" step="0.1" placeholder="e.g., 2" value={field.value ?? ''} onChange={(e) => field.onChange(e.target.value === '' ? undefined : Number(e.target.value))} />
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
                <FormField
                  control={form.control}
                  name="wineServings"
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel>Wine servings (glasses/day)</FormLabel>
                      <FormControl>
                        <Input type="number" step="0.1" placeholder="e.g., 1" value={field.value ?? ''} onChange={(e) => field.onChange(e.target.value === '' ? undefined : Number(e.target.value))} />
                      </FormControl>
                      <FormMessage />
                    </FormItem>
                  )}
                />
              </div>
              <Button type="submit" className="w-full md:w-auto">
                Calculate Mediterranean diet score
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
            <CardDescription>See Mediterranean diet score and recommendations.</CardDescription>
          </CardHeader>
          <CardContent className="space-y-6">
            <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
              <div className="p-4 border rounded">
                <p className="text-sm text-muted-foreground">Total score</p>
                <p className="text-2xl font-semibold text-primary">{result.totalScore.toFixed(0)}</p>
                <p className="text-xs text-muted-foreground">Out of 14</p>
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
            <strong>Mediterranean diet score</strong> = sum of points from olive oil (0-2), vegetables (0-2), fruits (0-2), legumes (0-2), fish (0-2), red meat (0-2, inverted), and wine (0-2). Maximum score is 14 points. Higher scores indicate better adherence.
          </p>
          <p>
            <strong>Scoring criteria:</strong> Olive oil: 3+ servings (2 points), 2 servings (1 point). Vegetables: 5+ servings (2 points), 3+ servings (1 point). Fruits: 3+ servings (2 points), 2+ servings (1 point). Legumes: 3+ servings (2 points), 2+ servings (1 point). Fish: 3+ servings (2 points), 2+ servings (1 point). Red meat: â‰¤1 serving (2 points), â‰¤2 servings (1 point). Wine: 1-2 servings (2 points), 0 or 0.5-1 serving (1 point).
          </p>
          <p>The Mediterranean diet emphasizes whole foods, healthy fats from olive oil, plant-based foods, and fish, with limited red meat. Higher adherence is associated with reduced risk of heart disease, stroke, and improved longevity.</p>
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
                <p className="text-xl font-semibold text-primary">&gt; 12</p>
                <p className="text-xs text-muted-foreground">Optimal range</p>
              </div>
              <div className="p-4 border rounded">
                <p className="text-sm text-muted-foreground">Score percentage</p>
                <p className="text-xl font-semibold text-primary">{((result.totalScore / 14) * 100).toFixed(0)}%</p>
                <p className="text-xs text-muted-foreground">Of maximum</p>
              </div>
              <div className="p-4 border rounded">
                <p className="text-sm text-muted-foreground">Adherence level</p>
                <p className="text-xl font-semibold text-primary">
                  {result.totalScore >= 12 ? 'Excellent' : result.totalScore >= 10 ? 'Good' : result.totalScore >= 7 ? 'Moderate' : 'Low'}
                </p>
                <p className="text-xs text-muted-foreground">Based on score</p>
              </div>
            </div>
          ) : (
            <p className="text-sm text-muted-foreground">Enter your Mediterranean diet data to see additional insights.</p>
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
          <p>The Mediterranean diet is a dietary pattern based on traditional foods from countries bordering the Mediterranean Sea. It emphasizes fruits, vegetables, whole grains, legumes, nuts, olive oil, and fish, with limited red meat and moderate wine consumption.</p>
          <p>Use this calculator to calculate Mediterranean diet score from olive oil, vegetables, fruits, legumes, fish, red meat, and wine servings.</p>
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
          <p>This tool calculates Mediterranean diet score from olive oil, vegetables, fruits, legumes, fish, red meat, and wine servings.</p>
          <p>Outputs include olive oil servings, vegetables servings, fruits servings, legumes servings, fish servings, red meat servings, wine servings, total score, status, recommendations, an action plan, and supporting metrics.</p>
          <p>Formula, steps, guide content, related tools, and FAQs ensure humans or AI assistants can interpret the methodology instantly.</p>
        </CardContent>
      </Card>
    </div>
  );
}


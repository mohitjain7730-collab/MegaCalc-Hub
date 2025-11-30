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
  glycemicIndex: z.number({ invalid_type_error: 'Enter glycemic index' }).min(0).max(100),
  totalCarbs: z.number({ invalid_type_error: 'Enter total carbs' }).min(0).max(200),
  proteinGrams: z.number({ invalid_type_error: 'Enter protein grams' }).min(0).max(100),
  fatGrams: z.number({ invalid_type_error: 'Enter fat grams' }).min(0).max(100),
});

type FormValues = z.infer<typeof formSchema>;

type ResultPayload = {
  glycemicIndex: number;
  totalCarbs: number;
  proteinGrams: number;
  fatGrams: number;
  insulinResponse: number;
  responseIndex: number;
  status: 'optimal' | 'good' | 'moderate' | 'low';
  interpretation: string;
  recommendations: string[];
  plan: { label: string; detail: string }[];
};

const steps = [
  'Enter glycemic index (GI) of the meal (0-100) from GI calculation or database.',
  'Enter total carbohydrates (grams) in the meal from food tracking.',
  'Enter protein content (grams) in the meal from food tracking.',
  'Enter fat content (grams) in the meal from food tracking.',
  'Review estimated insulin response, blood sugar impact, and recommendations.',
];

const faqs = [
  {
    question: 'What is insulin response?',
    answer:
      'Insulin response is the amount of insulin the pancreas releases in response to a meal. Higher glycemic index and carbohydrate content typically increase insulin response. Protein and fat can moderate the response.',
  },
  {
    question: 'How is insulin response estimated?',
    answer:
      'Insulin response is estimated from glycemic index, carbohydrate content, and the moderating effects of protein and fat. Higher GI and carbs increase response; protein and fat can reduce the glycemic impact.',
  },
  {
    question: 'What affects insulin response?',
    answer:
      'Insulin response is affected by glycemic index, carbohydrate amount, protein content, fat content, fiber, meal composition, and individual factors. Lower GI and balanced meals typically produce lower responses.',
  },
  {
    question: 'What is a normal insulin response?',
    answer:
      'Normal insulin response varies with meal composition and individual factors. Lower responses (from low-GI, balanced meals) are generally beneficial for blood sugar control and metabolic health.',
  },
  {
    question: 'How does protein affect insulin response?',
    answer:
      'Protein can stimulate insulin release but also slows carbohydrate absorption, potentially moderating overall glycemic response. Including protein in meals can help balance insulin response.',
  },
  {
    question: 'How does fat affect insulin response?',
    answer:
      'Fat slows gastric emptying and carbohydrate absorption, which can reduce glycemic response and moderate insulin release. Healthy fats in meals can help stabilize blood sugar and insulin.',
  },
  {
    question: 'How can I lower insulin response?',
    answer:
      'Lower insulin response by choosing lower-GI foods, reducing refined carbohydrates, including protein and healthy fats in meals, adding fiber, and balancing meal composition.',
  },
  {
    question: 'What about insulin sensitivity?',
    answer:
      'Insulin sensitivity affects how effectively insulin works. Improving sensitivity through exercise, weight management, and diet can help manage insulin response and blood sugar control.',
  },
  {
    question: 'Can I measure insulin response at home?',
    answer:
      'Home measurement is limited. Blood glucose monitoring provides indirect indicators. Insulin response estimation uses meal composition to predict likely insulin release patterns.',
  },
  {
    question: 'When should I consult a healthcare provider?',
    answer:
      'Consult a healthcare provider if you have diabetes, insulin resistance, blood sugar concerns, or need personalized guidance on managing insulin response and meal planning.',
  },
];

const relatedCalculators = [
  {
    name: 'Glycemic Index Meal Blender Calculator',
    slug: 'glycemic-index-meal-blender-calculator',
    description: 'Calculate meal GI alongside insulin response.',
  },
  {
    name: 'Meal Calorie Breakdown Calculator',
    slug: 'meal-calorie-breakdown-calculator',
    description: 'Break down meal composition comprehensively.',
  },
  {
    name: 'Satiety Index Calculator',
    slug: 'satiety-index-calculator',
    description: 'Assess satiety alongside insulin response.',
  },
  {
    name: 'Nutrient Density to Calorie Ratio Calculator',
    slug: 'nutrient-density-to-calorie-ratio-calculator',
    description: 'Evaluate meal quality comprehensively.',
  },
];

const baseUrl = 'https://mycalculating.com/category/health-fitness/insulin-response-estimator';

const schemaMarkup = {
  '@context': 'https://schema.org',
  '@graph': [
    {
      '@type': 'BreadcrumbList',
      itemListElement: [
        { '@type': 'ListItem', position: 1, name: 'Home', item: 'https://mycalculating.com' },
        { '@type': 'ListItem', position: 2, name: 'Health & Fitness', item: 'https://mycalculating.com/category/health-fitness' },
        { '@type': 'ListItem', position: 3, name: 'Insulin Response Estimator', item: baseUrl },
      ],
    },
    {
      '@type': 'SoftwareApplication',
      name: 'Insulin Response Estimator',
      applicationCategory: 'Calculator',
      operatingSystem: 'Web Browser',
      description: 'Estimate insulin response per meal from glycemic index, total carbs, protein grams, and fat grams.',
      url: baseUrl,
      offers: { '@type': 'Offer', price: '0', priceCurrency: 'USD' },
    },
  ],
};

const clamp = (value: number, min: number, max: number) => Math.min(max, Math.max(min, value));

const calculateResult = (values: FormValues): ResultPayload => {
  const glycemicIndex = values.glycemicIndex;
  const totalCarbs = values.totalCarbs;
  const proteinGrams = values.proteinGrams;
  const fatGrams = values.fatGrams;
  
  // Estimate insulin response (0-100, higher = higher response)
  // Base response from GI and carbs
  let insulinResponse = (glycemicIndex / 100) * 50; // GI component (0-50)
  insulinResponse += (totalCarbs / 200) * 40; // Carb component (0-40)
  
  // Protein can stimulate insulin but also moderates glycemic response
  // Net effect: moderate increase
  insulinResponse += (proteinGrams / 100) * 5; // Small protein effect
  
  // Fat moderates response by slowing absorption
  insulinResponse -= (fatGrams / 100) * 10; // Fat reduces response
  
  insulinResponse = clamp(insulinResponse, 0, 100);
  const responseIndex = insulinResponse; // Same value

  let status: ResultPayload['status'] = 'optimal';
  let interpretation = 'Your estimated insulin response appears optimal. Continue choosing balanced, lower-GI meals to support stable blood sugar.';

  if (insulinResponse > 70 || glycemicIndex > 75 || totalCarbs > 100) {
    status = 'low';
    interpretation = 'Your estimated insulin response is high. High-GI meals with many carbs may cause significant insulin release and blood sugar spikes. Consider lowering GI and reducing carbs.';
  } else if (insulinResponse > 60 || glycemicIndex > 60 || totalCarbs > 80) {
    status = 'moderate';
    interpretation = 'Your estimated insulin response is moderate to high. Consider lowering glycemic index, reducing carbohydrates, or adding protein and fat to moderate the response.';
  } else if (insulinResponse < 30) {
    status = 'optimal';
    interpretation = 'Your estimated insulin response is low. Low-GI meals with balanced macronutrients support stable blood sugar and may be beneficial for metabolic health.';
  } else {
    status = 'good';
    interpretation = 'Your estimated insulin response is manageable. Continue including protein and healthy fats to help moderate glycemic response and insulin release.';
  }

  const recommendations = [
    'Choose lower-GI foods: prefer whole grains, legumes, and lower-GI fruits over refined grains and high-GI foods to reduce insulin response.',
    'Balance meals with protein and healthy fats: include lean protein and healthy fats in meals to slow carbohydrate absorption and moderate insulin response.',
    'Moderate carbohydrate intake: while carbs are important, balancing portion size and choosing lower-GI sources can help manage insulin response.',
  ];
  if (status === 'low' || status === 'moderate') {
    recommendations.push('Significantly reduce high-GI foods and refined carbohydrates. Replace with lower-GI alternatives and include more protein and healthy fats to moderate insulin response.');
  }
  if (glycemicIndex > 70) {
    recommendations.push('Lower meal glycemic index. High-GI meals cause rapid blood sugar increases and higher insulin responses. Choose lower-GI carbohydrate sources.');
  }
  if (totalCarbs > 80) {
    recommendations.push('Consider reducing carbohydrate portion size or spreading carbs across meals. Large carb loads can increase insulin response significantly.');
  }

  const plan = [
    { label: 'This Week', detail: 'Estimate insulin response for your meals. Assess glycemic impact and identify opportunities to lower response through meal composition.' },
    { label: 'This Month', detail: 'Optimize meal composition: lower GI, balance macronutrients, include protein and healthy fats to moderate insulin response and support blood sugar control.' },
    { label: 'Ongoing', detail: 'Monitor insulin response through regular meal assessment. Maintain balanced, lower-GI meals to support stable blood sugar and optimal metabolic health.' },
  ];

  return { glycemicIndex, totalCarbs, proteinGrams, fatGrams, insulinResponse, responseIndex, status, interpretation, recommendations, plan };
};

export default function InsulinResponseEstimator() {
  const [result, setResult] = useState<ResultPayload | null>(null);

  const form = useForm<FormValues>({
    resolver: zodResolver(formSchema),
    defaultValues: {
      glycemicIndex: undefined,
      totalCarbs: undefined,
      proteinGrams: undefined,
      fatGrams: undefined,
    },
  });

  return (
    <div className="space-y-8">
      <Script id="insulin-response-schema" type="application/ld+json" strategy="afterInteractive" dangerouslySetInnerHTML={{ __html: JSON.stringify(schemaMarkup) }} />

      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <Activity className="h-5 w-5" />
            Insulin Response Estimator
          </CardTitle>
          <CardDescription>Estimate insulin response per meal from glycemic index, total carbs, protein grams, and fat grams.</CardDescription>
        </CardHeader>
      </Card>

      <Card>
        <CardHeader>
          <CardTitle>Input your meal data</CardTitle>
        </CardHeader>
        <CardContent>
          <Form {...form}>
            <form onSubmit={form.handleSubmit((values) => setResult(calculateResult(values)))} className="space-y-6">
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <FormField
                  control={form.control}
                  name="glycemicIndex"
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel>Glycemic index (0-100)</FormLabel>
                      <FormControl>
                        <Input type="number" step="1" placeholder="e.g., 55" value={field.value ?? ''} onChange={(e) => field.onChange(e.target.value === '' ? undefined : Number(e.target.value))} />
                      </FormControl>
                      <FormMessage />
                    </FormItem>
                  )}
                />
                <FormField
                  control={form.control}
                  name="totalCarbs"
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel>Total carbs (grams)</FormLabel>
                      <FormControl>
                        <Input type="number" step="1" placeholder="e.g., 60" value={field.value ?? ''} onChange={(e) => field.onChange(e.target.value === '' ? undefined : Number(e.target.value))} />
                      </FormControl>
                      <FormMessage />
                    </FormItem>
                  )}
                />
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
                  name="fatGrams"
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel>Fat (grams)</FormLabel>
                      <FormControl>
                        <Input type="number" step="1" placeholder="e.g., 15" value={field.value ?? ''} onChange={(e) => field.onChange(e.target.value === '' ? undefined : Number(e.target.value))} />
                      </FormControl>
                      <FormMessage />
                    </FormItem>
                  )}
                />
              </div>
              <Button type="submit" className="w-full md:w-auto">
                Estimate insulin response
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
            <CardDescription>See estimated insulin response, blood sugar impact, and recommendations.</CardDescription>
          </CardHeader>
          <CardContent className="space-y-6">
            <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
              <div className="p-4 border rounded">
                <p className="text-sm text-muted-foreground">Glycemic index</p>
                <p className="text-2xl font-semibold text-primary">{result.glycemicIndex.toFixed(0)}</p>
                <p className="text-xs text-muted-foreground">
                  {result.glycemicIndex < 55 ? 'Low' : result.glycemicIndex < 70 ? 'Medium' : 'High'}
                </p>
              </div>
              <div className="p-4 border rounded">
                <p className="text-sm text-muted-foreground">Total carbs</p>
                <p className="text-2xl font-semibold text-primary">{result.totalCarbs.toFixed(0)}g</p>
                <p className="text-xs text-muted-foreground">Carbohydrates</p>
              </div>
              <div className="p-4 border rounded">
                <p className="text-sm text-muted-foreground">Insulin response</p>
                <p className="text-2xl font-semibold text-primary">{result.insulinResponse.toFixed(0)}</p>
                <p className="text-xs text-muted-foreground">Out of 100 (lower = better)</p>
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
            <strong>Insulin response</strong> = estimated from glycemic index (0-50 points), total carbs (0-40 points), protein (0-5 points, small increase), and fat (0-10 points reduction, moderates response).
          </p>
          <p>
            <strong>Components</strong>: Higher GI and more carbs increase response. Protein has a small stimulatory effect but also moderates glycemic response. Fat slows absorption and reduces response.
          </p>
          <p>
            <strong>Optimal ranges</strong>: Insulin response &lt;40 indicates low response. Response 40-60 is moderate. Response &gt;60 may indicate high insulin release. Lower responses support better blood sugar control.
          </p>
          <p>Insulin response estimation uses meal composition to predict likely insulin release. Lower-GI meals with balanced macronutrients typically produce lower, more stable insulin responses.</p>
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
                <p className="text-sm text-muted-foreground">Target response</p>
                <p className="text-xl font-semibold text-primary">&lt; 40</p>
                <p className="text-xs text-muted-foreground">Low response</p>
              </div>
              <div className="p-4 border rounded">
                <p className="text-sm text-muted-foreground">Response index</p>
                <p className="text-xl font-semibold text-primary">{result.responseIndex.toFixed(0)}</p>
                <p className="text-xs text-muted-foreground">Out of 100</p>
              </div>
              <div className="p-4 border rounded">
                <p className="text-sm text-muted-foreground">Glycemic load</p>
                <p className="text-xl font-semibold text-primary">
                  {(result.glycemicIndex * result.totalCarbs / 100).toFixed(1)}
                </p>
                <p className="text-xs text-muted-foreground">GL value</p>
              </div>
            </div>
          ) : (
            <p className="text-sm text-muted-foreground">Enter your meal data to see additional insights.</p>
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
          <p>Insulin response is the amount of insulin released in response to a meal. It is affected by glycemic index, carbohydrate content, and the moderating effects of protein and fat. Lower responses support better blood sugar control.</p>
          <p>Use this calculator to estimate insulin response per meal from glycemic index, total carbs, protein grams, and fat grams.</p>
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
          <p>This tool estimates insulin response per meal from glycemic index, total carbs, protein grams, and fat grams.</p>
          <p>Outputs include glycemic index, total carbs, protein grams, fat grams, insulin response, response index, status, recommendations, an action plan, and supporting metrics.</p>
          <p>Formula, steps, guide content, related tools, and FAQs ensure humans or AI assistants can interpret the methodology instantly.</p>
        </CardContent>
      </Card>
    </div>
  );
}


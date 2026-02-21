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
  food1GI: z.number({ invalid_type_error: 'Enter food 1 GI' }).min(0).max(100),
  food1Carbs: z.number({ invalid_type_error: 'Enter food 1 carbs' }).min(0).max(200),
  food2GI: z.number({ invalid_type_error: 'Enter food 2 GI' }).min(0).max(100).optional(),
  food2Carbs: z.number({ invalid_type_error: 'Enter food 2 carbs' }).min(0).max(200).optional(),
});

type FormValues = z.infer<typeof formSchema>;

type ResultPayload = {
  food1GI: number;
  food1Carbs: number;
  food2GI: number;
  food2Carbs: number;
  totalCarbs: number;
  blendedGI: number;
  glycemicLoad: number;
  status: 'optimal' | 'good' | 'moderate' | 'low';
  interpretation: string;
  recommendations: string[];
  plan: { label: string; detail: string }[];
};

const steps = [
  'Enter glycemic index (GI) of first food (0-100) from GI database.',
  'Enter carbohydrate content (grams) of first food from food label or database.',
  'Optionally enter GI of second food if blending multiple foods.',
  'Optionally enter carbohydrate content of second food if blending.',
  'Review blended glycemic index, glycemic load, and recommendations.',
];

const faqs = [
  {
    question: 'What is glycemic index (GI)?',
    answer:
      'Glycemic index measures how quickly a food raises blood sugar compared to pure glucose (GI=100). Low GI (&lt;55) raises blood sugar slowly, high GI (&gt;70) raises it quickly. Medium GI is 55-70.',
  },
  {
    question: 'How is blended GI calculated?',
    answer:
      'Blended GI = Σ(GI × carbs) / Σ(carbs) for all foods in the meal. It\'s a weighted average based on carbohydrate content. Foods with more carbs have greater influence on the blended GI.',
  },
  {
    question: 'What is glycemic load (GL)?',
    answer:
      'Glycemic load = (GI × total carbs) / 100. It accounts for both GI and portion size. GL &lt;10 is low, 10-20 is medium, &gt;20 is high. GL provides a better measure of blood sugar impact than GI alone.',
  },
  {
    question: 'How does blending affect GI?',
    answer:
      'Blending foods with different GIs creates a weighted average. Adding low-GI foods (fiber, protein, fat) to high-GI foods can lower the overall meal GI and reduce blood sugar spikes.',
  },
  {
    question: 'What are low GI foods?',
    answer:
      'Low GI foods (&lt;55) include most vegetables, legumes, whole grains, nuts, and some fruits. These raise blood sugar slowly and support better blood sugar control.',
  },
  {
    question: 'What are high GI foods?',
    answer:
      'High GI foods (&gt;70) include white bread, white rice, potatoes, sugary foods, and refined grains. These raise blood sugar quickly and may cause blood sugar spikes.',
  },
  {
    question: 'How can I lower meal GI?',
    answer:
      'Lower meal GI by adding fiber (vegetables, whole grains), protein (lean meats, legumes), healthy fats (nuts, avocado), and choosing lower-GI carbohydrate sources. Combining foods balances the overall GI.',
  },
  {
    question: 'What about meal timing?',
    answer:
      'Meal timing can affect glycemic response. Eating lower-GI meals throughout the day supports more stable blood sugar. Combining foods strategically can optimize glycemic impact.',
  },
  {
    question: 'Can I track GI at home?',
    answer:
      'Yes. Use GI databases and food labels to estimate GI values. While individual responses vary, GI values provide useful guidance for meal planning and blood sugar management.',
  },
  {
    question: 'When should I consult a healthcare provider?',
    answer:
      'Consult a healthcare provider or registered dietitian if you have diabetes, blood sugar concerns, or need personalized guidance on glycemic index and meal planning for blood sugar control.',
  },
];

const relatedCalculators = [
  {
    name: 'Meal Calorie Breakdown Calculator',
    slug: 'meal-calorie-breakdown-calculator',
    description: 'Break down meal calories alongside glycemic impact.',
  },
  {
    name: 'Insulin Response Estimator',
    slug: 'insulin-response-estimator',
    description: 'Estimate insulin response from meal GI.',
  },
  {
    name: 'Satiety Index Calculator',
    slug: 'satiety-index-calculator',
    description: 'Assess satiety alongside glycemic impact.',
  },
  {
    name: 'Nutrient Density to Calorie Ratio Calculator',
    slug: 'nutrient-density-to-calorie-ratio-calculator',
    description: 'Evaluate meal quality comprehensively.',
  },
];

const baseUrl = 'https://mycalculating.com/category/health-fitness/glycemic-index-meal-blender-calculator';

const schemaMarkup = {
  '@context': 'https://schema.org',
  '@graph': [
    {
      '@type': 'BreadcrumbList',
      itemListElement: [
        { '@type': 'ListItem', position: 1, name: 'Home', item: 'https://mycalculating.com' },
        { '@type': 'ListItem', position: 2, name: 'Health & Fitness', item: 'https://mycalculating.com/category/health-fitness' },
        { '@type': 'ListItem', position: 3, name: 'Glycemic Index Meal Blender Calculator', item: baseUrl },
      ],
    },
    {
      '@type': 'SoftwareApplication',
      name: 'Glycemic Index Meal Blender Calculator',
      applicationCategory: 'Calculator',
      operatingSystem: 'Web Browser',
      description: 'Calculate blended glycemic index from food GI values and carbohydrate content.',
      url: baseUrl,
      offers: { '@type': 'Offer', price: '0', priceCurrency: 'USD' },
    },
  ],
};

const clamp = (value: number, min: number, max: number) => Math.min(max, Math.max(min, value));

const calculateResult = (values: FormValues): ResultPayload => {
  const food1GI = values.food1GI;
  const food1Carbs = values.food1Carbs;
  
  let food2GI: number;
  let food2Carbs: number;
  
  if (values.food2GI && values.food2Carbs) {
    food2GI = values.food2GI;
    food2Carbs = values.food2Carbs;
  } else {
    food2GI = 0;
    food2Carbs = 0;
  }
  
  const totalCarbs = food1Carbs + food2Carbs;
  
  // Calculate blended GI: weighted average based on carbs
  let blendedGI: number;
  if (totalCarbs > 0) {
    blendedGI = ((food1GI * food1Carbs) + (food2GI * food2Carbs)) / totalCarbs;
  } else {
    blendedGI = food1GI; // Single food
  }
  
  // Calculate glycemic load
  const glycemicLoad = (blendedGI * totalCarbs) / 100;
  
  let status: ResultPayload['status'] = 'optimal';
  let interpretation = 'Your blended glycemic index appears optimal. Continue choosing lower-GI foods to support stable blood sugar.';

  if (blendedGI > 70 || glycemicLoad > 20) {
    status = 'low';
    interpretation = 'Your blended glycemic index is high. This may cause rapid blood sugar spikes. Consider adding low-GI foods (fiber, protein, healthy fats) to lower the overall meal GI.';
  } else if (blendedGI > 55 || glycemicLoad > 15) {
    status = 'moderate';
    interpretation = 'Your blended glycemic index is moderate. Consider adding more low-GI foods to further stabilize blood sugar response.';
  } else if (blendedGI < 40) {
    status = 'optimal';
    interpretation = 'Your blended glycemic index is low. This supports stable blood sugar and may be beneficial for blood sugar control.';
  } else {
    status = 'good';
    interpretation = 'Your blended glycemic index is good. Continue including low-GI foods in meals to support optimal blood sugar control.';
  }

  const recommendations = [
    'Combine high-GI foods with low-GI foods: add fiber (vegetables, whole grains), protein (lean meats, legumes), and healthy fats (nuts, avocado) to lower overall meal GI.',
    'Choose lower-GI carbohydrate sources: prefer whole grains, legumes, and lower-GI fruits over refined grains and high-GI foods to support stable blood sugar.',
    'Balance meals strategically: combining foods with different GIs creates a weighted average. More low-GI foods in the meal lower the overall blended GI.',
  ];
  if (status === 'low' || status === 'moderate') {
    recommendations.push('Lower meal GI by adding fiber-rich vegetables, lean protein, and healthy fats. These additions slow carbohydrate absorption and reduce blood sugar spikes.');
  }
  if (blendedGI > 70) {
    recommendations.push('Significantly reduce high-GI foods in the meal. Replace refined grains and sugary foods with lower-GI alternatives to improve blood sugar control.');
  }
  if (glycemicLoad > 20) {
    recommendations.push('Reduce portion size or choose lower-GI alternatives. High glycemic load indicates significant blood sugar impact from the meal.');
  }

  const plan = [
    { label: 'This Week', detail: 'Calculate blended GI for your meals. Assess glycemic impact and identify opportunities to lower meal GI through food combinations.' },
    { label: 'This Month', detail: 'Optimize meal composition: combine foods strategically to lower blended GI, include more low-GI foods, and balance meals for better blood sugar control.' },
    { label: 'Ongoing', detail: 'Monitor meal glycemic impact through regular GI calculations. Maintain meals with appropriate blended GI to support stable blood sugar and overall health.' },
  ];

  return { food1GI, food1Carbs, food2GI, food2Carbs, totalCarbs, blendedGI, glycemicLoad, status, interpretation, recommendations, plan };
};

export default function GlycemicIndexMealBlenderCalculator() {
  const [result, setResult] = useState<ResultPayload | null>(null);

  const form = useForm<FormValues>({
    resolver: zodResolver(formSchema),
    defaultValues: {
      food1GI: undefined,
      food1Carbs: undefined,
      food2GI: undefined,
      food2Carbs: undefined,
    },
  });

  return (
    <div className="space-y-8">
      <Script id="glycemic-blender-schema" type="application/ld+json" strategy="afterInteractive" dangerouslySetInnerHTML={{ __html: JSON.stringify(schemaMarkup) }} />

      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <Utensils className="h-5 w-5" />
            Glycemic Index Meal Blender Calculator
          </CardTitle>
          <CardDescription>Calculate blended glycemic index from food GI values and carbohydrate content.</CardDescription>
        </CardHeader>
      </Card>

      <Card>
        <CardHeader>
          <CardTitle>Input your meal GI data</CardTitle>
        </CardHeader>
        <CardContent>
          <Form {...form}>
            <form onSubmit={form.handleSubmit((values) => setResult(calculateResult(values)))} className="space-y-6">
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <FormField
                  control={form.control}
                  name="food1GI"
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel>Food 1 GI (0-100)</FormLabel>
                      <FormControl>
                        <Input type="number" step="1" placeholder="e.g., 65" value={field.value ?? ''} onChange={(e) => field.onChange(e.target.value === '' ? undefined : Number(e.target.value))} />
                      </FormControl>
                      <FormMessage />
                    </FormItem>
                  )}
                />
                <FormField
                  control={form.control}
                  name="food1Carbs"
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel>Food 1 carbs (grams)</FormLabel>
                      <FormControl>
                        <Input type="number" step="1" placeholder="e.g., 50" value={field.value ?? ''} onChange={(e) => field.onChange(e.target.value === '' ? undefined : Number(e.target.value))} />
                      </FormControl>
                      <FormMessage />
                    </FormItem>
                  )}
                />
                <FormField
                  control={form.control}
                  name="food2GI"
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel>Food 2 GI (0-100) (optional)</FormLabel>
                      <FormControl>
                        <Input type="number" step="1" placeholder="e.g., 30" value={field.value ?? ''} onChange={(e) => field.onChange(e.target.value === '' ? undefined : Number(e.target.value))} />
                      </FormControl>
                      <FormMessage />
                    </FormItem>
                  )}
                />
                <FormField
                  control={form.control}
                  name="food2Carbs"
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel>Food 2 carbs (grams) (optional)</FormLabel>
                      <FormControl>
                        <Input type="number" step="1" placeholder="e.g., 20" value={field.value ?? ''} onChange={(e) => field.onChange(e.target.value === '' ? undefined : Number(e.target.value))} />
                      </FormControl>
                      <FormMessage />
                    </FormItem>
                  )}
                />
              </div>
              <Button type="submit" className="w-full md:w-auto">
                Calculate blended GI
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
            <CardDescription>See blended glycemic index, glycemic load, and recommendations.</CardDescription>
          </CardHeader>
          <CardContent className="space-y-6">
            <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
              <div className="p-4 border rounded">
                <p className="text-sm text-muted-foreground">Total carbs</p>
                <p className="text-2xl font-semibold text-primary">{result.totalCarbs.toFixed(1)}g</p>
                <p className="text-xs text-muted-foreground">Carbohydrates</p>
              </div>
              <div className="p-4 border rounded">
                <p className="text-sm text-muted-foreground">Blended GI</p>
                <p className="text-2xl font-semibold text-primary">{result.blendedGI.toFixed(1)}</p>
                <p className="text-xs text-muted-foreground">
                  {result.blendedGI < 55 ? 'Low' : result.blendedGI < 70 ? 'Medium' : 'High'}
                </p>
              </div>
              <div className="p-4 border rounded">
                <p className="text-sm text-muted-foreground">Glycemic load</p>
                <p className="text-2xl font-semibold text-primary">{result.glycemicLoad.toFixed(1)}</p>
                <p className="text-xs text-muted-foreground">
                  {result.glycemicLoad < 10 ? 'Low' : result.glycemicLoad < 20 ? 'Medium' : 'High'}
                </p>
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
            <strong>Blended GI</strong> = Σ(GI × carbs) / Σ(carbs) for all foods in the meal. Weighted average based on carbohydrate content.
          </p>
          <p>
            <strong>Glycemic load (GL)</strong> = (blended GI × total carbs) / 100. Accounts for both GI and portion size.
          </p>
          <p>
            <strong>GI ranges</strong>: Low: &lt;55, Medium: 55-70, High: &gt;70. GL ranges: Low: &lt;10, Medium: 10-20, High: &gt;20.
          </p>
          <p>Blended GI reflects the overall glycemic impact of a meal. Combining foods with different GIs creates a weighted average. Lower blended GI supports more stable blood sugar.</p>
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
                <p className="text-sm text-muted-foreground">Target blended GI</p>
                <p className="text-xl font-semibold text-primary">&lt; 55</p>
                <p className="text-xs text-muted-foreground">Low GI range</p>
              </div>
              <div className="p-4 border rounded">
                <p className="text-sm text-muted-foreground">Target GL</p>
                <p className="text-xl font-semibold text-primary">&lt; 10</p>
                <p className="text-xs text-muted-foreground">Low GL range</p>
              </div>
              <div className="p-4 border rounded">
                <p className="text-sm text-muted-foreground">GI category</p>
                <p className="text-xl font-semibold text-primary">
                  {result.blendedGI < 55 ? 'Low' : result.blendedGI < 70 ? 'Medium' : 'High'}
                </p>
                <p className="text-xs text-muted-foreground">Based on GI</p>
              </div>
            </div>
          ) : (
            <p className="text-sm text-muted-foreground">Enter your meal GI data to see additional insights.</p>
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
          <p>Glycemic index (GI) measures how quickly foods raise blood sugar. Blended GI calculates the weighted average GI of a meal based on carbohydrate content. Lower blended GI (&lt;55) supports more stable blood sugar.</p>
          <p>Use this calculator to calculate blended glycemic index from food GI values and carbohydrate content.</p>
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
          <p>This tool calculates blended glycemic index from food GI values and carbohydrate content.</p>
          <p>Outputs include food GI values, carbohydrate content, total carbs, blended GI, glycemic load, status, recommendations, an action plan, and supporting metrics.</p>
          <p>Formula, steps, guide content, related tools, and FAQs ensure humans or AI assistants can interpret the methodology instantly.</p>
        </CardContent>
      </Card>
    </div>
  );
}


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
  totalCarbs: z.number({ invalid_type_error: 'Enter total carbs' }).min(0).max(500),
  fiber: z.number({ invalid_type_error: 'Enter fiber' }).min(0).max(100),
  sugarAlcohols: z.number({ invalid_type_error: 'Enter sugar alcohols' }).min(0).max(100).optional(),
});

type FormValues = z.infer<typeof formSchema>;

type ResultPayload = {
  totalCarbs: number;
  fiber: number;
  sugarAlcohols: number;
  netCarbs: number;
  netCarbsPercent: number;
  status: 'optimal' | 'good' | 'moderate' | 'low';
  interpretation: string;
  recommendations: string[];
  plan: { label: string; detail: string }[];
};

const steps = [
  'Enter total carbohydrates (grams) from food label or tracking.',
  'Enter dietary fiber (grams) from food label or tracking.',
  'Optionally enter sugar alcohols (grams) if present in the food.',
  'Review net carbs, net carbs percentage, and recommendations for blood sugar control.',
];

const faqs = [
  {
    question: 'What are net carbs?',
    answer:
      'Net carbs = total carbohydrates - dietary fiber - sugar alcohols (if applicable). Net carbs represent the carbohydrates that significantly impact blood sugar, as fiber and sugar alcohols have minimal blood sugar effects.',
  },
  {
    question: 'How are net carbs calculated?',
    answer:
      'Net carbs = total carbohydrates - dietary fiber - sugar alcohols. Some calculations use 50% of sugar alcohols. Fiber is fully subtracted as it doesn\'t raise blood sugar. Sugar alcohols have variable effects.',
  },
  {
    question: 'Why calculate net carbs?',
    answer:
      'Net carbs provide a better measure of blood sugar impact than total carbs. Foods with high fiber or sugar alcohols may have lower net carbs, making them more suitable for blood sugar management.',
  },
  {
    question: 'What about sugar alcohols?',
    answer:
      'Sugar alcohols (erythritol, xylitol, sorbitol, etc.) have variable effects on blood sugar. Some are fully subtracted, others are partially counted. Check specific sugar alcohol types for accurate calculation.',
  },
  {
    question: 'How do net carbs affect blood sugar?',
    answer:
      'Net carbs better reflect blood sugar impact than total carbs. Lower net carbs typically cause smaller blood sugar increases. This is important for diabetes management and low-carb diets.',
  },
  {
    question: 'What is a good net carbs amount?',
    answer:
      'Net carbs targets vary by diet and goals. Low-carb diets may aim for 20-50g net carbs per day. Moderate approaches may allow 100-150g. Individual needs vary based on activity, metabolism, and health goals.',
  },
  {
    question: 'How does fiber affect net carbs?',
    answer:
      'Fiber is fully subtracted from total carbs to calculate net carbs because it doesn\'t raise blood sugar. Higher fiber content results in lower net carbs, supporting better blood sugar control.',
  },
  {
    question: 'Can I track net carbs at home?',
    answer:
      'Yes. Use food labels to find total carbohydrates and dietary fiber. Subtract fiber (and sugar alcohols if applicable) to calculate net carbs. Many tracking apps calculate this automatically.',
  },
  {
    question: 'What about different sugar alcohols?',
    answer:
      'Different sugar alcohols have different effects. Erythritol is often fully subtracted, while others (maltitol, sorbitol) may be partially counted. Check specific sugar alcohol types for accurate net carb calculation.',
  },
  {
    question: 'When should I consult a healthcare provider?',
    answer:
      'Consult a healthcare provider or registered dietitian if you have diabetes, blood sugar concerns, or need personalized guidance on net carbs and carbohydrate management for your health goals.',
  },
];

const relatedCalculators = [
  {
    name: 'Carb-to-Fiber Ratio Calculator',
    slug: 'carb-to-fiber-ratio-calculator',
    description: 'Assess fiber content alongside net carbs.',
  },
  {
    name: 'Glycemic Index Meal Blender Calculator',
    slug: 'glycemic-index-meal-blender-calculator',
    description: 'Evaluate glycemic impact comprehensively.',
  },
  {
    name: 'Insulin Response Estimator',
    slug: 'insulin-response-estimator',
    description: 'Estimate insulin response from net carbs.',
  },
  {
    name: 'Meal Calorie Breakdown Calculator',
    slug: 'meal-calorie-breakdown-calculator',
    description: 'Break down meal macronutrients comprehensively.',
  },
];

const baseUrl = 'https://mycalculating.com/category/health-fitness/net-carbs-vs-total-carbs-calculator';

const schemaMarkup = {
  '@context': 'https://schema.org',
  '@graph': [
    {
      '@type': 'BreadcrumbList',
      itemListElement: [
        { '@type': 'ListItem', position: 1, name: 'Home', item: 'https://mycalculating.com' },
        { '@type': 'ListItem', position: 2, name: 'Health & Fitness', item: 'https://mycalculating.com/category/health-fitness' },
        { '@type': 'ListItem', position: 3, name: 'Net Carbs vs Total Carbs Calculator', item: baseUrl },
      ],
    },
    {
      '@type': 'SoftwareApplication',
      name: 'Net Carbs vs Total Carbs Calculator',
      applicationCategory: 'Calculator',
      operatingSystem: 'Web Browser',
      description: 'Calculate net carbs vs total carbs from total carbohydrates, dietary fiber, and sugar alcohols.',
      url: baseUrl,
      offers: { '@type': 'Offer', price: '0', priceCurrency: 'USD' },
    },
  ],
};

const clamp = (value: number, min: number, max: number) => Math.min(max, Math.max(min, value));

const calculateResult = (values: FormValues): ResultPayload => {
  const totalCarbs = values.totalCarbs;
  const fiber = values.fiber;
  const sugarAlcohols = values.sugarAlcohols || 0;
  
  // Calculate net carbs
  // Some calculations subtract 50% of sugar alcohols, but we'll subtract all for simplicity
  // Users can adjust if they know specific sugar alcohol types
  const netCarbs = totalCarbs - fiber - sugarAlcohols;
  
  // Calculate net carbs as percentage of total
  const netCarbsPercent = totalCarbs > 0 ? (netCarbs / totalCarbs) * 100 : 0;
  
  let status: ResultPayload['status'] = 'optimal';
  let interpretation = 'Your net carbs calculation is complete. Net carbs provide a better measure of blood sugar impact than total carbs.';

  if (netCarbs < 0) {
    status = 'low';
    interpretation = 'Net carbs calculation resulted in a negative value. Please verify your inputs. Fiber and sugar alcohols should not exceed total carbohydrates.';
  } else if (netCarbsPercent > 90 || fiber < 2) {
    status = 'moderate';
    interpretation = 'Your net carbs are very close to total carbs, indicating low fiber content. Consider choosing foods with more fiber to reduce net carbs and improve blood sugar control.';
  } else if (netCarbsPercent < 50) {
    status = 'optimal';
    interpretation = 'Your net carbs are significantly lower than total carbs due to high fiber or sugar alcohol content. This supports better blood sugar control.';
  } else {
    status = 'good';
    interpretation = 'Your net carbs calculation is reasonable. Continue choosing foods with adequate fiber to support blood sugar management.';
  }

  const recommendations = [
    'Focus on net carbs for blood sugar management: net carbs better reflect blood sugar impact than total carbs, making them useful for diabetes management and low-carb diets.',
    'Choose high-fiber foods: foods with more fiber have lower net carbs, supporting better blood sugar control. Aim for foods with at least 3-5g of fiber per serving.',
    'Be mindful of sugar alcohols: while sugar alcohols reduce net carbs, individual tolerance varies. Monitor your response to sugar alcohols and adjust intake accordingly.',
  ];
  if (status === 'low') {
    recommendations.push('Verify your inputs. Total carbohydrates should be greater than or equal to the sum of fiber and sugar alcohols. Check food labels for accurate values.');
  }
  if (fiber < 3) {
    recommendations.push('Increase fiber intake. Higher fiber content reduces net carbs and supports better blood sugar control. Choose whole grains, vegetables, and legumes.');
  }
  if (netCarbsPercent > 85) {
    recommendations.push('Consider foods with more fiber or sugar alcohols to lower net carbs. This can help improve blood sugar control and support low-carb dietary goals.');
  }

  const plan = [
    { label: 'This Week', detail: 'Calculate net carbs for your foods and meals. Compare net carbs to total carbs and assess fiber content to identify opportunities for improvement.' },
    { label: 'This Month', detail: 'Optimize food choices: select foods with higher fiber content to reduce net carbs, improve blood sugar control, and support dietary goals.' },
    { label: 'Ongoing', detail: 'Monitor net carbs through regular food assessment. Maintain awareness of net carbs vs total carbs to support optimal blood sugar management and health goals.' },
  ];

  return { totalCarbs, fiber, sugarAlcohols, netCarbs, netCarbsPercent, status, interpretation, recommendations, plan };
};

export default function NetCarbsVsTotalCarbsCalculator() {
  const [result, setResult] = useState<ResultPayload | null>(null);

  const form = useForm<FormValues>({
    resolver: zodResolver(formSchema),
    defaultValues: {
      totalCarbs: undefined,
      fiber: undefined,
      sugarAlcohols: undefined,
    },
  });

  return (
    <div className="space-y-8">
      <Script id="net-carbs-schema" type="application/ld+json" strategy="afterInteractive" dangerouslySetInnerHTML={{ __html: JSON.stringify(schemaMarkup) }} />

      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <Activity className="h-5 w-5" />
            Net Carbs vs Total Carbs Calculator
          </CardTitle>
          <CardDescription>Calculate net carbs vs total carbs from total carbohydrates, dietary fiber, and sugar alcohols.</CardDescription>
        </CardHeader>
      </Card>

      <Card>
        <CardHeader>
          <CardTitle>Input your carbohydrate data</CardTitle>
        </CardHeader>
        <CardContent>
          <Form {...form}>
            <form onSubmit={form.handleSubmit((values) => setResult(calculateResult(values)))} className="space-y-6">
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <FormField
                  control={form.control}
                  name="totalCarbs"
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel>Total carbohydrates (grams)</FormLabel>
                      <FormControl>
                        <Input type="number" step="0.1" placeholder="e.g., 30" value={field.value ?? ''} onChange={(e) => field.onChange(e.target.value === '' ? undefined : Number(e.target.value))} />
                      </FormControl>
                      <FormMessage />
                    </FormItem>
                  )}
                />
                <FormField
                  control={form.control}
                  name="fiber"
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel>Dietary fiber (grams)</FormLabel>
                      <FormControl>
                        <Input type="number" step="0.1" placeholder="e.g., 5" value={field.value ?? ''} onChange={(e) => field.onChange(e.target.value === '' ? undefined : Number(e.target.value))} />
                      </FormControl>
                      <FormMessage />
                    </FormItem>
                  )}
                />
                <FormField
                  control={form.control}
                  name="sugarAlcohols"
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel>Sugar alcohols (grams) (optional)</FormLabel>
                      <FormControl>
                        <Input type="number" step="0.1" placeholder="e.g., 3" value={field.value ?? ''} onChange={(e) => field.onChange(e.target.value === '' ? undefined : Number(e.target.value))} />
                      </FormControl>
                      <FormMessage />
                    </FormItem>
                  )}
                />
              </div>
              <Button type="submit" className="w-full md:w-auto">
                Calculate net carbs
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
            <CardDescription>See net carbs, net carbs percentage, and recommendations.</CardDescription>
          </CardHeader>
          <CardContent className="space-y-6">
            <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
              <div className="p-4 border rounded">
                <p className="text-sm text-muted-foreground">Total carbs</p>
                <p className="text-2xl font-semibold text-primary">{result.totalCarbs.toFixed(1)}g</p>
                <p className="text-xs text-muted-foreground">Carbohydrates</p>
              </div>
              <div className="p-4 border rounded">
                <p className="text-sm text-muted-foreground">Net carbs</p>
                <p className="text-2xl font-semibold text-primary">{result.netCarbs.toFixed(1)}g</p>
                <p className="text-xs text-muted-foreground">After fiber & sugar alcohols</p>
              </div>
              <div className="p-4 border rounded">
                <p className="text-sm text-muted-foreground">Net carbs %</p>
                <p className="text-2xl font-semibold text-primary">{result.netCarbsPercent.toFixed(1)}%</p>
                <p className="text-xs text-muted-foreground">Of total carbs</p>
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
            <strong>Net carbs</strong> = total carbohydrates - dietary fiber - sugar alcohols (if applicable).
          </p>
          <p>
            <strong>Net carbs percentage</strong> = (net carbs / total carbs) × 100. Lower percentages indicate more fiber/sugar alcohols relative to total carbs.
          </p>
          <p>
            <strong>Note</strong>: Some calculations subtract 50% of sugar alcohols rather than 100%. Individual sugar alcohols have variable effects on blood sugar. This calculator subtracts all sugar alcohols for simplicity.
          </p>
          <p>Net carbs provide a better measure of blood sugar impact than total carbs, as fiber and sugar alcohols have minimal effects on blood sugar. Lower net carbs support better blood sugar control.</p>
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
                <p className="text-sm text-muted-foreground">Fiber percentage</p>
                <p className="text-xl font-semibold text-primary">
                  {result.totalCarbs > 0 ? ((result.fiber / result.totalCarbs) * 100).toFixed(1) : 0}%
                </p>
                <p className="text-xs text-muted-foreground">Of total carbs</p>
              </div>
              <div className="p-4 border rounded">
                <p className="text-sm text-muted-foreground">Reduction from fiber</p>
                <p className="text-xl font-semibold text-primary">
                  {result.fiber.toFixed(1)}g
                </p>
                <p className="text-xs text-muted-foreground">Subtracted</p>
              </div>
              <div className="p-4 border rounded">
                <p className="text-sm text-muted-foreground">Total reduction</p>
                <p className="text-xl font-semibold text-primary">
                  {(result.fiber + result.sugarAlcohols).toFixed(1)}g
                </p>
                <p className="text-xs text-muted-foreground">Fiber + sugar alcohols</p>
              </div>
            </div>
          ) : (
            <p className="text-sm text-muted-foreground">Enter your carbohydrate data to see additional insights.</p>
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
          <p>Net carbs = total carbohydrates - dietary fiber - sugar alcohols. Net carbs better reflect blood sugar impact than total carbs, as fiber and sugar alcohols have minimal effects on blood sugar. This is useful for diabetes management and low-carb diets.</p>
          <p>Use this calculator to calculate net carbs vs total carbs from total carbohydrates, dietary fiber, and optional sugar alcohols.</p>
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
          <p>This tool calculates net carbs vs total carbs from total carbohydrates, dietary fiber, and optional sugar alcohols.</p>
          <p>Outputs include total carbs, fiber, sugar alcohols, net carbs, net carbs percentage, status, recommendations, an action plan, and supporting metrics.</p>
          <p>Formula, steps, guide content, related tools, and FAQs ensure humans or AI assistants can interpret the methodology instantly.</p>
        </CardContent>
      </Card>
    </div>
  );
}


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
});

type FormValues = z.infer<typeof formSchema>;

type ResultPayload = {
  totalCarbs: number;
  fiber: number;
  netCarbs: number;
  carbToFiberRatio: number;
  fiberPercent: number;
  status: 'optimal' | 'good' | 'moderate' | 'low';
  interpretation: string;
  recommendations: string[];
  plan: { label: string; detail: string }[];
};

const steps = [
  'Enter total carbohydrates (grams) from food label or tracking.',
  'Enter dietary fiber (grams) from food label or tracking.',
  'Review carb-to-fiber ratio, net carbs, and recommendations for blood sugar control.',
];

const faqs = [
  {
    question: 'What is carb-to-fiber ratio?',
    answer:
      'Carb-to-fiber ratio is total carbohydrates divided by dietary fiber. Lower ratios (ideally &lt;10:1) indicate foods with more fiber relative to carbs, which supports better blood sugar control and digestive health.',
  },
  {
    question: 'How is carb-to-fiber ratio calculated?',
    answer:
      'Carb-to-fiber ratio = total carbohydrates (grams) / dietary fiber (grams). For example, if a food has 30g carbs and 5g fiber, the ratio is 30/5 = 6:1.',
  },
  {
    question: 'What is a good carb-to-fiber ratio?',
    answer:
      'A good carb-to-fiber ratio is typically &lt;10:1. Ratios &lt;5:1 are excellent, 5-10:1 are good, 10-15:1 are moderate, and &gt;15:1 may indicate low fiber content relative to carbs.',
  },
  {
    question: 'What are net carbs?',
    answer:
      'Net carbs = total carbohydrates - dietary fiber. Fiber is not digested and doesn\'t significantly raise blood sugar, so net carbs better reflect the blood sugar impact of a food.',
  },
  {
    question: 'How does fiber affect blood sugar?',
    answer:
      'Fiber slows carbohydrate digestion and absorption, reducing blood sugar spikes. Higher fiber content relative to total carbs (lower ratio) supports better blood sugar control.',
  },
  {
    question: 'What foods have good carb-to-fiber ratios?',
    answer:
      'Foods with good ratios (&lt;10:1) include whole grains, legumes, vegetables, and some fruits. Refined grains and processed foods typically have poor ratios (&gt;15:1).',
  },
  {
    question: 'How can I improve carb-to-fiber ratio?',
    answer:
      'Improve ratio by choosing whole grains over refined grains, including more vegetables and legumes, and selecting higher-fiber carbohydrate sources. This increases fiber relative to total carbs.',
  },
  {
    question: 'What about fiber recommendations?',
    answer:
      'Recommended daily fiber intake is 25-30g for adults. Aim for at least 5-10g of fiber per meal to support digestive health and blood sugar control.',
  },
  {
    question: 'Can I track carb-to-fiber ratio at home?',
    answer:
      'Yes. Use food labels to find total carbohydrates and dietary fiber, then calculate the ratio. Many tracking apps also calculate this automatically.',
  },
  {
    question: 'When should I consult a healthcare provider?',
    answer:
      'Consult a healthcare provider or registered dietitian if you have diabetes, blood sugar concerns, or need personalized guidance on carbohydrate and fiber intake for health management.',
  },
];

const relatedCalculators = [
  {
    name: 'Glycemic Index Meal Blender Calculator',
    slug: 'glycemic-index-meal-blender-calculator',
    description: 'Assess glycemic impact alongside carb-to-fiber ratio.',
  },
  {
    name: 'Insulin Response Estimator',
    slug: 'insulin-response-estimator',
    description: 'Evaluate insulin response from meal composition.',
  },
  {
    name: 'Meal Calorie Breakdown Calculator',
    slug: 'meal-calorie-breakdown-calculator',
    description: 'Break down meal macronutrients comprehensively.',
  },
  {
    name: 'Nutrient Density to Calorie Ratio Calculator',
    slug: 'nutrient-density-to-calorie-ratio-calculator',
    description: 'Assess nutritional quality comprehensively.',
  },
];

const baseUrl = 'https://mycalculating.com/category/health-fitness/carb-to-fiber-ratio-calculator';

const schemaMarkup = {
  '@context': 'https://schema.org',
  '@graph': [
    {
      '@type': 'BreadcrumbList',
      itemListElement: [
        { '@type': 'ListItem', position: 1, name: 'Home', item: 'https://mycalculating.com' },
        { '@type': 'ListItem', position: 2, name: 'Health & Fitness', item: 'https://mycalculating.com/category/health-fitness' },
        { '@type': 'ListItem', position: 3, name: 'Carb-to-Fiber Ratio Calculator', item: baseUrl },
      ],
    },
    {
      '@type': 'SoftwareApplication',
      name: 'Carb-to-Fiber Ratio Calculator',
      applicationCategory: 'Calculator',
      operatingSystem: 'Web Browser',
      description: 'Calculate carb-to-fiber ratio from total carbohydrates and dietary fiber.',
      url: baseUrl,
      offers: { '@type': 'Offer', price: '0', priceCurrency: 'USD' },
    },
  ],
};

const clamp = (value: number, min: number, max: number) => Math.min(max, Math.max(min, value));

const calculateResult = (values: FormValues): ResultPayload => {
  const totalCarbs = values.totalCarbs;
  const fiber = values.fiber;
  
  // Calculate net carbs
  const netCarbs = totalCarbs - fiber;
  
  // Calculate carb-to-fiber ratio
  let carbToFiberRatio: number;
  if (fiber > 0) {
    carbToFiberRatio = totalCarbs / fiber;
  } else {
    carbToFiberRatio = totalCarbs; // If no fiber, ratio is effectively infinite
  }
  
  // Calculate fiber percentage
  const fiberPercent = totalCarbs > 0 ? (fiber / totalCarbs) * 100 : 0;
  
  let status: ResultPayload['status'] = 'optimal';
  let interpretation = 'Your carb-to-fiber ratio is optimal. This food provides good fiber content relative to carbohydrates, supporting blood sugar control.';

  if (carbToFiberRatio > 15 || fiber < 2 || fiberPercent < 5) {
    status = 'low';
    interpretation = 'Your carb-to-fiber ratio is poor. This food has low fiber content relative to carbohydrates, which may cause rapid blood sugar increases. Consider higher-fiber alternatives.';
  } else if (carbToFiberRatio > 10 || fiber < 5 || fiberPercent < 10) {
    status = 'moderate';
    interpretation = 'Your carb-to-fiber ratio is moderate. Consider choosing foods with more fiber relative to carbohydrates to improve blood sugar control.';
  } else if (carbToFiberRatio < 5) {
    status = 'optimal';
    interpretation = 'Your carb-to-fiber ratio is excellent. This food provides substantial fiber relative to carbohydrates, supporting optimal blood sugar control and digestive health.';
  } else {
    status = 'good';
    interpretation = 'Your carb-to-fiber ratio is good. Continue choosing foods with adequate fiber content to support blood sugar control and digestive health.';
  }

  const recommendations = [
    'Choose whole grains over refined grains: whole grains provide more fiber relative to carbohydrates, improving carb-to-fiber ratio and blood sugar control.',
    'Include more vegetables and legumes: these foods typically have excellent carb-to-fiber ratios, providing substantial fiber with relatively few net carbs.',
    'Aim for foods with carb-to-fiber ratio &lt;10:1: this indicates good fiber content relative to carbohydrates, supporting better blood sugar control and digestive health.',
  ];
  if (status === 'low' || status === 'moderate') {
    recommendations.push('Significantly increase fiber intake. Choose whole grains, vegetables, legumes, and fruits with higher fiber content to improve carb-to-fiber ratio and blood sugar control.');
  }
  if (fiber < 5) {
    recommendations.push('Increase fiber content. Aim for at least 5-10g of fiber per meal to support digestive health and improve carb-to-fiber ratio.');
  }
  if (carbToFiberRatio > 15) {
    recommendations.push('Replace low-fiber carbohydrate sources with higher-fiber alternatives. This will improve the carb-to-fiber ratio and support better blood sugar control.');
  }

  const plan = [
    { label: 'This Week', detail: 'Calculate carb-to-fiber ratios for your foods and meals. Assess fiber content relative to carbohydrates and identify opportunities to improve ratios.' },
    { label: 'This Month', detail: 'Optimize food choices: select whole grains, increase vegetables and legumes, and choose higher-fiber carbohydrate sources to improve carb-to-fiber ratios.' },
    { label: 'Ongoing', detail: 'Monitor carb-to-fiber ratios through regular food assessment. Maintain a diet rich in high-fiber foods to support optimal blood sugar control and digestive health.' },
  ];

  return { totalCarbs, fiber, netCarbs, carbToFiberRatio, fiberPercent, status, interpretation, recommendations, plan };
};

export default function CarbToFiberRatioCalculator() {
  const [result, setResult] = useState<ResultPayload | null>(null);

  const form = useForm<FormValues>({
    resolver: zodResolver(formSchema),
    defaultValues: {
      totalCarbs: undefined,
      fiber: undefined,
    },
  });

  return (
    <div className="space-y-8">
      <Script id="carb-fiber-ratio-schema" type="application/ld+json" strategy="afterInteractive" dangerouslySetInnerHTML={{ __html: JSON.stringify(schemaMarkup) }} />

      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <Activity className="h-5 w-5" />
            Carb-to-Fiber Ratio Calculator
          </CardTitle>
          <CardDescription>Calculate carb-to-fiber ratio from total carbohydrates and dietary fiber.</CardDescription>
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
                        <Input type="number" step="1" placeholder="e.g., 30" value={field.value ?? ''} onChange={(e) => field.onChange(e.target.value === '' ? undefined : Number(e.target.value))} />
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
                        <Input type="number" step="1" placeholder="e.g., 5" value={field.value ?? ''} onChange={(e) => field.onChange(e.target.value === '' ? undefined : Number(e.target.value))} />
                      </FormControl>
                      <FormMessage />
                    </FormItem>
                  )}
                />
              </div>
              <Button type="submit" className="w-full md:w-auto">
                Calculate ratio
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
            <CardDescription>See carb-to-fiber ratio, net carbs, and recommendations.</CardDescription>
          </CardHeader>
          <CardContent className="space-y-6">
            <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
              <div className="p-4 border rounded">
                <p className="text-sm text-muted-foreground">Total carbs</p>
                <p className="text-2xl font-semibold text-primary">{result.totalCarbs.toFixed(0)}g</p>
                <p className="text-xs text-muted-foreground">Carbohydrates</p>
              </div>
              <div className="p-4 border rounded">
                <p className="text-sm text-muted-foreground">Fiber</p>
                <p className="text-2xl font-semibold text-primary">{result.fiber.toFixed(0)}g</p>
                <p className="text-xs text-muted-foreground">Dietary fiber</p>
              </div>
              <div className="p-4 border rounded">
                <p className="text-sm text-muted-foreground">Carb-to-fiber ratio</p>
                <p className="text-2xl font-semibold text-primary">{result.carbToFiberRatio.toFixed(1)}:1</p>
                <p className="text-xs text-muted-foreground">Lower is better</p>
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
            <strong>Carb-to-fiber ratio</strong> = total carbohydrates (grams) / dietary fiber (grams).
          </p>
          <p>
            <strong>Net carbs</strong> = total carbohydrates - dietary fiber. Fiber is not digested and doesn\'t significantly raise blood sugar.
          </p>
          <p>
            <strong>Fiber percentage</strong> = (fiber / total carbs) × 100. Higher percentages indicate more fiber relative to total carbohydrates.
          </p>
          <p>
            <strong>Optimal ratios</strong>: Excellent: &lt;5:1, Good: 5-10:1, Moderate: 10-15:1, Poor: &gt;15:1. Lower ratios indicate better fiber content relative to carbohydrates.
          </p>
          <p>Carb-to-fiber ratio helps assess the blood sugar impact of foods. Lower ratios indicate more fiber relative to carbs, supporting better blood sugar control and digestive health.</p>
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
                <p className="text-sm text-muted-foreground">Net carbs</p>
                <p className="text-xl font-semibold text-primary">{result.netCarbs.toFixed(0)}g</p>
                <p className="text-xs text-muted-foreground">Total carbs - fiber</p>
              </div>
              <div className="p-4 border rounded">
                <p className="text-sm text-muted-foreground">Fiber percentage</p>
                <p className="text-xl font-semibold text-primary">{result.fiberPercent.toFixed(1)}%</p>
                <p className="text-xs text-muted-foreground">Of total carbs</p>
              </div>
              <div className="p-4 border rounded">
                <p className="text-sm text-muted-foreground">Ratio category</p>
                <p className="text-xl font-semibold text-primary">
                  {result.carbToFiberRatio < 5 ? 'Excellent' : result.carbToFiberRatio < 10 ? 'Good' : result.carbToFiberRatio < 15 ? 'Moderate' : 'Poor'}
                </p>
                <p className="text-xs text-muted-foreground">Based on ratio</p>
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
          <p>Carb-to-fiber ratio is total carbohydrates divided by dietary fiber. Lower ratios (&lt;10:1) indicate foods with more fiber relative to carbs, supporting better blood sugar control. Net carbs = total carbs - fiber.</p>
          <p>Use this calculator to calculate carb-to-fiber ratio from total carbohydrates and dietary fiber.</p>
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
          <p>This tool calculates carb-to-fiber ratio from total carbohydrates and dietary fiber.</p>
          <p>Outputs include total carbs, fiber, net carbs, carb-to-fiber ratio, fiber percentage, status, recommendations, an action plan, and supporting metrics.</p>
          <p>Formula, steps, guide content, related tools, and FAQs ensure humans or AI assistants can interpret the methodology instantly.</p>
        </CardContent>
      </Card>
    </div>
  );
}


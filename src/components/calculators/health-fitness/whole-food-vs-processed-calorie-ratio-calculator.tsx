'use client';

import { useState } from 'react';
import Script from 'next/script';
import Link from 'next/link';
import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import { z } from 'zod';
import { Apple, Zap, Target, Activity, Shield } from 'lucide-react';

import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Form, FormControl, FormField, FormItem, FormLabel, FormMessage } from '@/components/ui/form';
import { Input } from '@/components/ui/input';

const formSchema = z.object({
  wholeFoodCalories: z.number({ invalid_type_error: 'Enter whole food calories' }).min(0).max(5000),
  processedFoodCalories: z.number({ invalid_type_error: 'Enter processed food calories' }).min(0).max(5000),
});

type FormValues = z.infer<typeof formSchema>;

type ResultPayload = {
  wholeFoodCalories: number;
  processedFoodCalories: number;
  totalCalories: number;
  wholeFoodPercent: number;
  processedFoodPercent: number;
  ratio: number;
  status: 'optimal' | 'good' | 'moderate' | 'low';
  interpretation: string;
  recommendations: string[];
  plan: { label: string; detail: string }[];
};

const steps = [
  'Enter calories from whole, minimally processed foods (fruits, vegetables, whole grains, lean meats, etc.).',
  'Enter calories from processed foods (packaged snacks, fast food, refined grains, etc.).',
  'Review whole food vs processed calorie ratio, percentages, and recommendations.',
];

const faqs = [
  {
    question: 'What are whole foods?',
    answer:
      'Whole foods are foods that are minimally processed and close to their natural state. Examples include fresh fruits, vegetables, whole grains, lean meats, fish, eggs, nuts, and seeds. They typically retain more nutrients and fiber.',
  },
  {
    question: 'What are processed foods?',
    answer:
      'Processed foods are foods that have been altered from their natural state through processing, often with added sugars, fats, salt, and preservatives. Examples include packaged snacks, fast food, refined grains, and convenience foods.',
  },
  {
    question: 'What is a good whole food to processed food ratio?',
    answer:
      'Aim for at least 70-80% of calories from whole foods and 20-30% or less from processed foods. Higher whole food ratios typically provide better nutrition, more fiber, and fewer additives.',
  },
  {
    question: 'How does the ratio affect health?',
    answer:
      'Higher whole food ratios support better nutrition, digestive health, blood sugar control, and overall health. Lower processed food intake reduces exposure to added sugars, unhealthy fats, and additives.',
  },
  {
    question: 'Can I eat some processed foods?',
    answer:
      'Yes, processed foods can be part of a balanced diet in moderation. The key is maintaining a ratio where whole foods predominate (70-80%+) while processed foods are limited (20-30% or less).',
  },
  {
    question: 'How do I increase whole food ratio?',
    answer:
      'Increase whole food ratio by prioritizing fresh fruits, vegetables, whole grains, lean proteins, and minimally processed foods. Reduce consumption of packaged snacks, fast food, and highly processed convenience foods.',
  },
  {
    question: 'What about food processing levels?',
    answer:
      'Food processing exists on a spectrum. Minimally processed foods (frozen vegetables, canned beans) are generally acceptable, while ultra-processed foods (chips, cookies, fast food) should be limited.',
  },
  {
    question: 'Can I track the ratio at home?',
    answer:
      'Yes. Track calories from whole foods vs processed foods using food labels and tracking apps. Calculate the ratio and percentages to assess your dietary pattern and identify opportunities for improvement.',
  },
  {
    question: 'What is the impact on nutrition?',
    answer:
      'Whole foods typically provide more vitamins, minerals, fiber, and beneficial compounds with fewer additives. Higher whole food ratios support better nutritional adequacy and health outcomes.',
  },
  {
    question: 'When should I consult a healthcare provider?',
    answer:
      'Consult a healthcare provider or registered dietitian if you need personalized guidance on improving your whole food ratio, have dietary restrictions, or want to optimize your diet for specific health goals.',
  },
];

const relatedCalculators = [
  {
    name: 'Food Diversity Index Calculator',
    slug: 'food-diversity-index-calculator',
    description: 'Assess food variety alongside food quality.',
  },
  {
    name: 'Nutrient Density to Calorie Ratio Calculator',
    slug: 'nutrient-density-to-calorie-ratio-calculator',
    description: 'Assess nutritional quality comprehensively.',
  },
  {
    name: 'Daily Micronutrient Coverage Calculator',
    slug: 'daily-micronutrient-coverage-calculator',
    description: 'Evaluate micronutrient coverage alongside food quality.',
  },
  {
    name: 'Balanced Meal Score Calculator',
    slug: 'balanced-meal-score-calculator',
    description: 'Assess meal balance alongside food quality.',
  },
];

const baseUrl = 'https://mycalculating.com/health-fitness/whole-food-vs-processed-calorie-ratio-calculator';

const schemaMarkup = {
  '@context': 'https://schema.org',
  '@graph': [
    {
      '@type': 'BreadcrumbList',
      itemListElement: [
        { '@type': 'ListItem', position: 1, name: 'Home', item: 'https://mycalculating.com' },
        { '@type': 'ListItem', position: 2, name: 'Health & Fitness', item: 'https://mycalculating.com/health-fitness' },
        { '@type': 'ListItem', position: 3, name: 'Whole Food vs Processed Calorie Ratio Calculator', item: baseUrl },
      ],
    },
    {
      '@type': 'SoftwareApplication',
      name: 'Whole Food vs Processed Calorie Ratio Calculator',
      applicationCategory: 'Calculator',
      operatingSystem: 'Web Browser',
      description: 'Calculate whole food vs processed calorie ratio from whole food calories and processed food calories.',
      url: baseUrl,
      offers: { '@type': 'Offer', price: '0', priceCurrency: 'USD' },
    },
  ],
};

const clamp = (value: number, min: number, max: number) => Math.min(max, Math.max(min, value));

const calculateResult = (values: FormValues): ResultPayload => {
  const wholeFoodCalories = values.wholeFoodCalories;
  const processedFoodCalories = values.processedFoodCalories;
  const totalCalories = wholeFoodCalories + processedFoodCalories;
  
  const wholeFoodPercent = totalCalories > 0 ? (wholeFoodCalories / totalCalories) * 100 : 0;
  const processedFoodPercent = totalCalories > 0 ? (processedFoodCalories / totalCalories) * 100 : 0;
  
  const ratio = processedFoodCalories > 0 ? wholeFoodCalories / processedFoodCalories : wholeFoodCalories;
  
  let status: ResultPayload['status'] = 'optimal';
  let interpretation = 'Your whole food to processed food ratio is excellent. You are consuming predominantly whole foods, supporting optimal nutrition and health.';

  if (wholeFoodPercent < 50 || ratio < 1) {
    status = 'low';
    interpretation = 'Your whole food to processed food ratio is poor. You are consuming more processed foods than whole foods, which may negatively impact nutrition and health. Increase whole food intake significantly.';
  } else if (wholeFoodPercent < 70 || ratio < 2.3) {
    status = 'moderate';
    interpretation = 'Your whole food to processed food ratio is moderate. Consider increasing whole food intake to at least 70-80% of calories to improve nutrition and health outcomes.';
  } else if (wholeFoodPercent < 80) {
    status = 'good';
    interpretation = 'Your whole food to processed food ratio is good. Continue prioritizing whole foods to maintain optimal nutrition and health.';
  }

  const recommendations = [
    'Prioritize whole foods: aim for at least 70-80% of calories from whole, minimally processed foods (fruits, vegetables, whole grains, lean proteins) to support optimal nutrition.',
    'Limit processed foods: keep processed foods to 20-30% or less of total calories. Reduce consumption of packaged snacks, fast food, and ultra-processed convenience foods.',
    'Choose minimally processed options: when processed foods are consumed, choose options with fewer additives, less added sugar, and more whole food ingredients.',
  ];
  if (status === 'low' || status === 'moderate') {
    recommendations.push('Significantly increase whole food intake. Replace processed foods with whole food alternatives to improve the ratio and support better nutrition and health outcomes.');
  }
  if (wholeFoodPercent < 60) {
    recommendations.push('Dramatically increase whole food consumption. Current ratio indicates excessive processed food intake. Focus on fresh fruits, vegetables, whole grains, and lean proteins.');
  }
  if (processedFoodPercent > 40) {
    recommendations.push('Reduce processed food consumption. High processed food intake reduces nutritional quality and increases exposure to additives. Prioritize whole foods for better health.');
  }

  const plan = [
    { label: 'This Week', detail: 'Calculate whole food vs processed food ratio. Assess current intake and identify opportunities to increase whole food consumption and reduce processed foods.' },
    { label: 'This Month', detail: 'Optimize food quality: increase whole food intake to 70-80% of calories, reduce processed foods, and prioritize fresh, minimally processed foods for better nutrition.' },
    { label: 'Ongoing', detail: 'Monitor whole food ratio through regular tracking. Maintain high whole food intake (70-80%+) to support optimal nutrition, digestive health, and overall well-being.' },
  ];

  return { wholeFoodCalories, processedFoodCalories, totalCalories, wholeFoodPercent, processedFoodPercent, ratio, status, interpretation, recommendations, plan };
};

export default function WholeFoodVsProcessedCalorieRatioCalculator() {
  const [result, setResult] = useState<ResultPayload | null>(null);

  const form = useForm<FormValues>({
    resolver: zodResolver(formSchema),
    defaultValues: {
      wholeFoodCalories: undefined,
      processedFoodCalories: undefined,
    },
  });

  return (
    <div className="space-y-8">
      <Script id="whole-food-ratio-schema" type="application/ld+json" strategy="afterInteractive" dangerouslySetInnerHTML={{ __html: JSON.stringify(schemaMarkup) }} />

      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <Apple className="h-5 w-5" />
            Whole Food vs Processed Calorie Ratio Calculator
          </CardTitle>
          <CardDescription>Calculate whole food vs processed calorie ratio from whole food calories and processed food calories.</CardDescription>
        </CardHeader>
      </Card>

      <Card>
        <CardHeader>
          <CardTitle>Input your food quality data</CardTitle>
        </CardHeader>
        <CardContent>
          <Form {...form}>
            <form onSubmit={form.handleSubmit((values) => setResult(calculateResult(values)))} className="space-y-6">
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <FormField
                  control={form.control}
                  name="wholeFoodCalories"
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel>Whole food calories</FormLabel>
                      <FormControl>
                        <Input type="number" step="1" placeholder="e.g., 1400" value={field.value ?? ''} onChange={(e) => field.onChange(e.target.value === '' ? undefined : Number(e.target.value))} />
                      </FormControl>
                      <FormMessage />
                    </FormItem>
                  )}
                />
                <FormField
                  control={form.control}
                  name="processedFoodCalories"
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel>Processed food calories</FormLabel>
                      <FormControl>
                        <Input type="number" step="1" placeholder="e.g., 400" value={field.value ?? ''} onChange={(e) => field.onChange(e.target.value === '' ? undefined : Number(e.target.value))} />
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
            <CardDescription>See whole food vs processed calorie ratio, percentages, and recommendations.</CardDescription>
          </CardHeader>
          <CardContent className="space-y-6">
            <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
              <div className="p-4 border rounded">
                <p className="text-sm text-muted-foreground">Whole food %</p>
                <p className="text-2xl font-semibold text-primary">{result.wholeFoodPercent.toFixed(1)}%</p>
                <p className="text-xs text-muted-foreground">Of total calories</p>
              </div>
              <div className="p-4 border rounded">
                <p className="text-sm text-muted-foreground">Processed %</p>
                <p className="text-2xl font-semibold text-primary">{result.processedFoodPercent.toFixed(1)}%</p>
                <p className="text-xs text-muted-foreground">Of total calories</p>
              </div>
              <div className="p-4 border rounded">
                <p className="text-sm text-muted-foreground">Ratio</p>
                <p className="text-2xl font-semibold text-primary">{result.ratio.toFixed(2)}:1</p>
                <p className="text-xs text-muted-foreground">Whole:Processed</p>
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
            <strong>Whole food percentage</strong> = (whole food calories / total calories) Ã— 100.
          </p>
          <p>
            <strong>Processed food percentage</strong> = (processed food calories / total calories) Ã— 100.
          </p>
          <p>
            <strong>Ratio</strong> = whole food calories / processed food calories. Higher ratios indicate more whole foods relative to processed foods.
          </p>
          <p>
            <strong>Optimal ranges</strong>: Whole foods: 70-80%+ of calories, Processed foods: 20-30% or less of calories, Ratio: 2.3:1 or higher (whole:processed).
          </p>
          <p>Whole food vs processed calorie ratio reflects dietary quality. Higher whole food ratios support better nutrition, more fiber, fewer additives, and improved health outcomes.</p>
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
                <p className="text-sm text-muted-foreground">Total calories</p>
                <p className="text-xl font-semibold text-primary">{result.totalCalories.toFixed(0)}</p>
                <p className="text-xs text-muted-foreground">Daily total</p>
              </div>
              <div className="p-4 border rounded">
                <p className="text-sm text-muted-foreground">Target whole food %</p>
                <p className="text-xl font-semibold text-primary">70-80%+</p>
                <p className="text-xs text-muted-foreground">Recommended</p>
              </div>
              <div className="p-4 border rounded">
                <p className="text-sm text-muted-foreground">Ratio status</p>
                <p className="text-xl font-semibold text-primary">
                  {result.ratio >= 2.3 ? 'Good' : result.ratio >= 1 ? 'Moderate' : 'Needs Improvement'}
                </p>
                <p className="text-xs text-muted-foreground">Based on ratio</p>
              </div>
            </div>
          ) : (
            <p className="text-sm text-muted-foreground">Enter your food quality data to see additional insights.</p>
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
          <p>Whole food vs processed calorie ratio reflects dietary quality. Aim for 70-80%+ of calories from whole, minimally processed foods and 20-30% or less from processed foods. Higher whole food ratios support better nutrition, more fiber, and improved health outcomes.</p>
          <p>Use this calculator to calculate whole food vs processed calorie ratio from whole food calories and processed food calories.</p>
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
          <p>This tool calculates whole food vs processed calorie ratio from whole food calories and processed food calories.</p>
          <p>Outputs include whole food calories, processed food calories, total calories, percentages, ratio, status, recommendations, an action plan, and supporting metrics.</p>
          <p>Formula, steps, guide content, related tools, and FAQs ensure humans or AI assistants can interpret the methodology instantly.</p>
        </CardContent>
      </Card>
    </div>
  );
}


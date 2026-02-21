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
  vitamins: z.number({ invalid_type_error: 'Enter vitamins' }).min(0).max(30),
  minerals: z.number({ invalid_type_error: 'Enter minerals' }).min(0).max(30),
  traceElements: z.number({ invalid_type_error: 'Enter trace elements' }).min(0).max(20),
});

type FormValues = z.infer<typeof formSchema>;

type ResultPayload = {
  vitamins: number;
  minerals: number;
  traceElements: number;
  totalCoverage: number;
  coveragePercent: number;
  status: 'optimal' | 'good' | 'moderate' | 'low';
  interpretation: string;
  recommendations: string[];
  plan: { label: string; detail: string }[];
};

const steps = [
  'Count number of different vitamins consumed today (from food tracking).',
  'Count number of different minerals consumed today (from food tracking).',
  'Count number of different trace elements consumed today (from food tracking).',
  'Review daily micronutrient coverage, coverage percentage, and recommendations.',
];

const faqs = [
  {
    question: 'What are micronutrients?',
    answer:
      'Micronutrients are vitamins, minerals, and trace elements required in small amounts but essential for health. They include vitamins (A, B, C, D, E, K), minerals (calcium, iron, magnesium), and trace elements (zinc, selenium, iodine).',
  },
  {
    question: 'How many micronutrients should I consume daily?',
    answer:
      'Ideally, consume a wide variety of micronutrients daily. Aim for coverage of all essential vitamins (13), major minerals (7-8), and trace elements (8-10). Food diversity is key to achieving comprehensive micronutrient coverage.',
  },
  {
    question: 'How is micronutrient coverage calculated?',
    answer:
      'Micronutrient coverage is calculated by counting the number of different vitamins, minerals, and trace elements consumed. Higher diversity indicates better coverage and reduced risk of deficiencies.',
  },
  {
    question: 'What affects micronutrient coverage?',
    answer:
      'Food diversity, food quality, and dietary patterns affect micronutrient coverage. Varied diets with whole foods typically provide better coverage than limited or processed-food-heavy diets.',
  },
  {
    question: 'How do I improve micronutrient coverage?',
    answer:
      'Improve coverage by eating a diverse diet including fruits, vegetables, whole grains, lean proteins, nuts, seeds, and dairy. Include different food groups and colors to maximize micronutrient variety.',
  },
  {
    question: 'What about micronutrient supplements?',
    answer:
      'While supplements can help fill gaps, food sources are generally preferred as they provide micronutrients with other beneficial compounds. Focus on food diversity first, then consider supplements if needed.',
  },
  {
    question: 'Can I track micronutrient coverage at home?',
    answer:
      'Yes. Use food tracking apps or databases to identify which micronutrients are in your foods. Count the variety of different vitamins, minerals, and trace elements consumed to assess coverage.',
  },
  {
    question: 'What is adequate coverage?',
    answer:
      'Adequate coverage typically means consuming most essential vitamins (10-13), major minerals (6-8), and trace elements (6-8) daily. Higher diversity generally indicates better nutritional adequacy.',
  },
  {
    question: 'What about food processing?',
    answer:
      'Food processing can reduce micronutrient content. Whole, minimally processed foods typically provide better micronutrient coverage than highly processed foods. Prioritize whole foods for optimal coverage.',
  },
  {
    question: 'When should I consult a healthcare provider?',
    answer:
      'Consult a healthcare provider or registered dietitian if you have concerns about micronutrient deficiencies, need personalized guidance on improving coverage, or are considering micronutrient supplements.',
  },
];

const relatedCalculators = [
  {
    name: 'Food Diversity Index Calculator',
    slug: 'food-diversity-index-calculator',
    description: 'Assess food variety alongside micronutrient coverage.',
  },
  {
    name: 'Nutrient Density to Calorie Ratio Calculator',
    slug: 'nutrient-density-to-calorie-ratio-calculator',
    description: 'Assess nutritional quality comprehensively.',
  },
  {
    name: 'Balanced Meal Score Calculator',
    slug: 'balanced-meal-score-calculator',
    description: 'Evaluate meal balance alongside micronutrient coverage.',
  },
  {
    name: 'Whole Food vs Processed Calorie Ratio Calculator',
    slug: 'whole-food-vs-processed-calorie-ratio-calculator',
    description: 'Assess food quality alongside micronutrient coverage.',
  },
];

const baseUrl = 'https://mycalculating.com/category/health-fitness/daily-micronutrient-coverage-calculator';

const schemaMarkup = {
  '@context': 'https://schema.org',
  '@graph': [
    {
      '@type': 'BreadcrumbList',
      itemListElement: [
        { '@type': 'ListItem', position: 1, name: 'Home', item: 'https://mycalculating.com' },
        { '@type': 'ListItem', position: 2, name: 'Health & Fitness', item: 'https://mycalculating.com/category/health-fitness' },
        { '@type': 'ListItem', position: 3, name: 'Daily Micronutrient Coverage Calculator', item: baseUrl },
      ],
    },
    {
      '@type': 'SoftwareApplication',
      name: 'Daily Micronutrient Coverage Calculator',
      applicationCategory: 'Calculator',
      operatingSystem: 'Web Browser',
      description: 'Calculate daily micronutrient coverage from number of vitamins, minerals, and trace elements consumed.',
      url: baseUrl,
      offers: { '@type': 'Offer', price: '0', priceCurrency: 'USD' },
    },
  ],
};

const clamp = (value: number, min: number, max: number) => Math.min(max, Math.max(min, value));

const calculateResult = (values: FormValues): ResultPayload => {
  const vitamins = values.vitamins;
  const minerals = values.minerals;
  const traceElements = values.traceElements;
  
  const totalCoverage = vitamins + minerals + traceElements;
  
  // Maximum possible coverage: ~13 vitamins + ~8 minerals + ~10 trace elements = ~31
  const maxCoverage = 31;
  const coveragePercent = (totalCoverage / maxCoverage) * 100;
  
  let status: ResultPayload['status'] = 'optimal';
  let interpretation = 'Your daily micronutrient coverage is excellent. You are consuming a diverse range of vitamins, minerals, and trace elements, supporting comprehensive nutritional adequacy.';

  if (totalCoverage < 15 || coveragePercent < 50) {
    status = 'low';
    interpretation = 'Your daily micronutrient coverage is low. You may be missing important vitamins, minerals, or trace elements. Increase food diversity to improve coverage and reduce deficiency risk.';
  } else if (totalCoverage < 20 || coveragePercent < 65) {
    status = 'moderate';
    interpretation = 'Your daily micronutrient coverage is moderate. Consider increasing food diversity to include more vitamins, minerals, and trace elements for better nutritional adequacy.';
  } else if (totalCoverage < 25 || coveragePercent < 80) {
    status = 'good';
    interpretation = 'Your daily micronutrient coverage is good. Continue including diverse foods to maintain comprehensive micronutrient intake and prevent deficiencies.';
  }

  const recommendations = [
    'Increase food diversity: include fruits, vegetables, whole grains, lean proteins, nuts, seeds, and dairy to maximize micronutrient variety and coverage.',
    'Include different food groups: each food group contributes different micronutrients. Aim for variety across all food groups to ensure comprehensive coverage.',
    'Prioritize whole foods: whole, minimally processed foods typically provide better micronutrient coverage than highly processed foods. Focus on whole foods for optimal nutrition.',
  ];
  if (status === 'low' || status === 'moderate') {
    recommendations.push('Significantly improve food diversity. Include more fruits, vegetables, whole grains, and varied protein sources to increase micronutrient coverage and reduce deficiency risk.');
  }
  if (vitamins < 8) {
    recommendations.push('Increase vitamin variety. Include more fruits, vegetables, whole grains, and varied foods to obtain a wider range of vitamins and improve coverage.');
  }
  if (minerals < 5) {
    recommendations.push('Increase mineral variety. Include dairy, leafy greens, nuts, seeds, and whole grains to obtain a wider range of minerals and improve coverage.');
  }

  const plan = [
    { label: 'This Week', detail: 'Count micronutrients consumed daily. Assess coverage of vitamins, minerals, and trace elements, and identify opportunities to increase food diversity.' },
    { label: 'This Month', detail: 'Optimize food diversity: include more fruits, vegetables, whole grains, and varied protein sources to increase micronutrient coverage and support comprehensive nutrition.' },
    { label: 'Ongoing', detail: 'Monitor micronutrient coverage through regular food tracking. Maintain diverse food intake to ensure comprehensive micronutrient coverage and prevent deficiencies.' },
  ];

  return { vitamins, minerals, traceElements, totalCoverage, coveragePercent, status, interpretation, recommendations, plan };
};

export default function DailyMicronutrientCoverageCalculator() {
  const [result, setResult] = useState<ResultPayload | null>(null);

  const form = useForm<FormValues>({
    resolver: zodResolver(formSchema),
    defaultValues: {
      vitamins: undefined,
      minerals: undefined,
      traceElements: undefined,
    },
  });

  return (
    <div className="space-y-8">
      <Script id="micronutrient-coverage-schema" type="application/ld+json" strategy="afterInteractive" dangerouslySetInnerHTML={{ __html: JSON.stringify(schemaMarkup) }} />

      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <Apple className="h-5 w-5" />
            Daily Micronutrient Coverage Calculator
          </CardTitle>
          <CardDescription>Calculate daily micronutrient coverage from number of vitamins, minerals, and trace elements consumed.</CardDescription>
        </CardHeader>
      </Card>

      <Card>
        <CardHeader>
          <CardTitle>Input your micronutrient data</CardTitle>
        </CardHeader>
        <CardContent>
          <Form {...form}>
            <form onSubmit={form.handleSubmit((values) => setResult(calculateResult(values)))} className="space-y-6">
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <FormField
                  control={form.control}
                  name="vitamins"
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel>Number of vitamins consumed</FormLabel>
                      <FormControl>
                        <Input type="number" step="1" placeholder="e.g., 10" value={field.value ?? ''} onChange={(e) => field.onChange(e.target.value === '' ? undefined : Number(e.target.value))} />
                      </FormControl>
                      <FormMessage />
                    </FormItem>
                  )}
                />
                <FormField
                  control={form.control}
                  name="minerals"
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel>Number of minerals consumed</FormLabel>
                      <FormControl>
                        <Input type="number" step="1" placeholder="e.g., 6" value={field.value ?? ''} onChange={(e) => field.onChange(e.target.value === '' ? undefined : Number(e.target.value))} />
                      </FormControl>
                      <FormMessage />
                    </FormItem>
                  )}
                />
                <FormField
                  control={form.control}
                  name="traceElements"
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel>Number of trace elements consumed</FormLabel>
                      <FormControl>
                        <Input type="number" step="1" placeholder="e.g., 5" value={field.value ?? ''} onChange={(e) => field.onChange(e.target.value === '' ? undefined : Number(e.target.value))} />
                      </FormControl>
                      <FormMessage />
                    </FormItem>
                  )}
                />
              </div>
              <Button type="submit" className="w-full md:w-auto">
                Calculate coverage
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
            <CardDescription>See daily micronutrient coverage, coverage percentage, and recommendations.</CardDescription>
          </CardHeader>
          <CardContent className="space-y-6">
            <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
              <div className="p-4 border rounded">
                <p className="text-sm text-muted-foreground">Total coverage</p>
                <p className="text-2xl font-semibold text-primary">{result.totalCoverage.toFixed(0)}</p>
                <p className="text-xs text-muted-foreground">Micronutrients</p>
              </div>
              <div className="p-4 border rounded">
                <p className="text-sm text-muted-foreground">Coverage %</p>
                <p className="text-2xl font-semibold text-primary">{result.coveragePercent.toFixed(0)}%</p>
                <p className="text-xs text-muted-foreground">Of maximum</p>
              </div>
              <div className="p-4 border rounded">
                <p className="text-sm text-muted-foreground">Vitamins</p>
                <p className="text-2xl font-semibold text-primary">{result.vitamins.toFixed(0)}</p>
                <p className="text-xs text-muted-foreground">Different types</p>
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
            <strong>Total coverage</strong> = number of vitamins + number of minerals + number of trace elements consumed daily.
          </p>
          <p>
            <strong>Coverage percentage</strong> = (total coverage / maximum possible coverage) × 100. Maximum coverage is approximately 31 (13 vitamins + 8 minerals + 10 trace elements).
          </p>
          <p>
            <strong>Optimal ranges</strong>: Excellent: 25+ micronutrients (80%+ coverage), Good: 20-24 (65-80%), Moderate: 15-19 (50-65%), Low: &lt;15 (&lt;50%).
          </p>
          <p>Daily micronutrient coverage reflects the diversity of vitamins, minerals, and trace elements consumed. Higher coverage indicates better nutritional adequacy and reduced deficiency risk.</p>
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
                <p className="text-sm text-muted-foreground">Minerals</p>
                <p className="text-xl font-semibold text-primary">{result.minerals.toFixed(0)}</p>
                <p className="text-xs text-muted-foreground">Different types</p>
              </div>
              <div className="p-4 border rounded">
                <p className="text-sm text-muted-foreground">Trace elements</p>
                <p className="text-xl font-semibold text-primary">{result.traceElements.toFixed(0)}</p>
                <p className="text-xs text-muted-foreground">Different types</p>
              </div>
              <div className="p-4 border rounded">
                <p className="text-sm text-muted-foreground">Coverage status</p>
                <p className="text-xl font-semibold text-primary">
                  {result.coveragePercent >= 80 ? 'Excellent' : result.coveragePercent >= 65 ? 'Good' : result.coveragePercent >= 50 ? 'Moderate' : 'Low'}
                </p>
                <p className="text-xs text-muted-foreground">Based on percentage</p>
              </div>
            </div>
          ) : (
            <p className="text-sm text-muted-foreground">Enter your micronutrient data to see additional insights.</p>
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
          <p>Daily micronutrient coverage reflects the diversity of vitamins, minerals, and trace elements consumed. Higher coverage (25+ micronutrients, 80%+ coverage) indicates better nutritional adequacy and reduced deficiency risk. Food diversity is key to achieving comprehensive coverage.</p>
          <p>Use this calculator to calculate daily micronutrient coverage from number of vitamins, minerals, and trace elements consumed.</p>
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
          <p>This tool calculates daily micronutrient coverage from number of vitamins, minerals, and trace elements consumed.</p>
          <p>Outputs include vitamins, minerals, trace elements, total coverage, coverage percentage, status, recommendations, an action plan, and supporting metrics.</p>
          <p>Formula, steps, guide content, related tools, and FAQs ensure humans or AI assistants can interpret the methodology instantly.</p>
        </CardContent>
      </Card>
    </div>
  );
}


'use client';

import { useState } from 'react';
import Script from 'next/script';
import Link from 'next/link';
import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import { z } from 'zod';
import { Moon, Zap, Target, Activity, Shield } from 'lucide-react';

import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Form, FormControl, FormField, FormItem, FormLabel, FormMessage } from '@/components/ui/form';
import { Input } from '@/components/ui/input';

const formSchema = z.object({
  omega6Intake: z.number({ invalid_type_error: 'Enter omega-6 intake' }).min(0).max(100),
  omega3Intake: z.number({ invalid_type_error: 'Enter omega-3 intake' }).min(0).max(10),
  processedFoods: z.number({ invalid_type_error: 'Enter processed foods rating' }).min(0).max(10).optional(),
  vegetableOilUsage: z.number({ invalid_type_error: 'Enter vegetable oil usage' }).min(0).max(10).optional(),
});

type FormValues = z.infer<typeof formSchema>;

type ResultPayload = {
  omega6ToOmega3Ratio: number;
  balanceScore: number;
  inflammationRisk: string;
  recommendedOmega6: number;
  recommendedOmega3: number;
  status: 'optimal' | 'good' | 'moderate' | 'low';
  interpretation: string;
  recommendations: string[];
  plan: { label: string; detail: string }[];
};

const steps = [
  'Enter your estimated daily omega-6 intake in grams (from vegetable oils, nuts, seeds, processed foods).',
  'Enter your estimated daily omega-3 intake in grams (from fish, flaxseed, walnuts, supplements).',
  'Optionally rate processed food consumption (0 = none, 10 = very high).',
  'Optionally rate vegetable oil usage in cooking (0 = none, 10 = very high).',
  'Review omega-6 to omega-3 ratio, balance score, inflammation risk, and recommendations.',
];

const faqs = [
  {
    question: 'What is the ideal omega-6 to omega-3 ratio?',
    answer:
      'The ideal ratio is 1:1 to 4:1 (omega-6:omega-3). Modern Western diets often have ratios of 15:1 to 20:1, which promotes inflammation. Lower ratios support better health and reduced inflammation.',
  },
  {
    question: 'Why does the ratio matter?',
    answer:
      'Omega-6 and omega-3 fatty acids compete for the same enzymes. Excessive omega-6 relative to omega-3 promotes inflammation, while balanced ratios support anti-inflammatory processes and better health outcomes.',
  },
  {
    question: 'What foods are high in omega-6?',
    answer:
      'High omega-6 sources include vegetable oils (soybean, corn, sunflower, safflower), processed foods, nuts, seeds, and grain-fed meat. The Western diet is typically very high in omega-6.',
  },
  {
    question: 'What foods are high in omega-3?',
    answer:
      'High omega-3 sources include fatty fish (salmon, mackerel, sardines), flaxseed, chia seeds, walnuts, hemp seeds, and algae. Fish provides EPA and DHA, while plant sources provide ALA.',
  },
  {
    question: 'How do I reduce my omega-6 to omega-3 ratio?',
    answer:
      'Reduce processed foods and vegetable oils (use olive oil, avocado oil, or coconut oil instead). Increase omega-3 intake through fatty fish (2-3 servings/week) or supplements. Choose grass-fed meat over grain-fed.',
  },
  {
    question: 'What are the health risks of high ratios?',
    answer:
      'High omega-6 to omega-3 ratios are associated with increased inflammation, cardiovascular disease, autoimmune conditions, mood disorders, and other chronic diseases. Lower ratios support better health outcomes.',
  },
  {
    question: 'Can I take omega-3 supplements?',
    answer:
      'Yes. Omega-3 supplements (fish oil, algae oil) can help balance the ratio. Typical doses are 1-2 grams of EPA+DHA daily. Choose high-quality supplements with good purity and freshness.',
  },
  {
    question: 'How long does it take to improve the ratio?',
    answer:
      'Improving the ratio takes time as omega-6 can accumulate in body tissues. With consistent dietary changes, you may see improvements in 3-6 months. Focus on reducing omega-6 intake and increasing omega-3.',
  },
  {
    question: 'Do I need to eliminate omega-6 completely?',
    answer:
      'No. Omega-6 fatty acids are essential and needed for health. The goal is balance, not elimination. Reduce excessive omega-6 intake (especially from processed foods and vegetable oils) while increasing omega-3.',
  },
  {
    question: 'What about omega-9 fatty acids?',
    answer:
      'Omega-9 (oleic acid) is non-essential and doesn\'t compete with omega-6 or omega-3. It\'s found in olive oil and avocados. Omega-9 doesn\'t affect the omega-6 to omega-3 ratio calculation.',
  },
];

const relatedCalculators = [
  {
    name: 'Omega3 Daily Requirement Calculator',
    slug: 'omega3-daily-requirement-calculator',
    description: 'Calculate omega-3 requirements.',
  },
  {
    name: 'Vitamin C Wellness Support Score Calculator',
    slug: 'vitamin-c-immunity-boost-score-calculator',
    description: 'Get wellness insights about vitamin C intake.',
  },
  {
    name: 'Inflammation Risk Calculator',
    slug: 'inflammation-risk-calculator',
    description: 'Assess overall inflammation risk.',
  },
  {
    name: 'Fat Intake Calculator',
    slug: 'fat-intake-calculator',
    description: 'Calculate healthy fat intake.',
  },
];

const baseUrl = 'https://mycalculating.com/category/health-fitness/omega-6-to-omega-3-balance-calculator';

const schemaMarkup = {
  '@context': 'https://schema.org',
  '@graph': [
    {
      '@type': 'BreadcrumbList',
      itemListElement: [
        { '@type': 'ListItem', position: 1, name: 'Home', item: 'https://mycalculating.com' },
        { '@type': 'ListItem', position: 2, name: 'Health & Fitness', item: 'https://mycalculating.com/category/health-fitness' },
        { '@type': 'ListItem', position: 3, name: 'Omega-6 to Omega-3 Balance Wellness Calculator', item: baseUrl },
      ],
    },
    {
      '@type': 'SoftwareApplication',
      name: 'Omega-6 to Omega-3 Balance Wellness Calculator',
      applicationCategory: 'Calculator',
      operatingSystem: 'Web Browser',
      description: 'Get general wellness insights about omega-6 to omega-3 ratio in your diet to assess fatty acid balance. This is a personal lifestyle insight, not a medical evaluation.',
      url: baseUrl,
      offers: { '@type': 'Offer', price: '0', priceCurrency: 'USD' },
    },
  ],
};

const calculateResult = (values: FormValues): ResultPayload => {
  const omega6 = values.omega6Intake;
  const omega3 = values.omega3Intake;
  
  // Calculate ratio (avoid division by zero)
  const ratio = omega3 > 0 ? omega6 / omega3 : omega6 > 0 ? 999 : 0;
  
  // Adjust omega-6 estimate based on processed foods and vegetable oils
  let adjustedOmega6 = omega6;
  const processedFoods = values.processedFoods ?? 5;
  const vegetableOil = values.vegetableOilUsage ?? 5;
  
  // Add hidden omega-6 from processed foods and oils (rough estimate)
  if (processedFoods >= 7) {
    adjustedOmega6 += 5; // High processed foods add significant omega-6
  } else if (processedFoods >= 4) {
    adjustedOmega6 += 2.5; // Moderate processed foods
  }
  
  if (vegetableOil >= 7) {
    adjustedOmega6 += 8; // High vegetable oil usage
  } else if (vegetableOil >= 4) {
    adjustedOmega6 += 4; // Moderate vegetable oil usage
  }
  
  // Recalculate ratio with adjusted omega-6
  const adjustedRatio = omega3 > 0 ? adjustedOmega6 / omega3 : adjustedOmega6 > 0 ? 999 : 0;
  
  // Calculate balance score (0-100, lower is better for ratios)
  let balanceScore = 100;
  if (adjustedRatio <= 4) {
    balanceScore = 100; // Optimal
  } else if (adjustedRatio <= 8) {
    balanceScore = 80; // Good
  } else if (adjustedRatio <= 12) {
    balanceScore = 60; // Moderate
  } else if (adjustedRatio <= 20) {
    balanceScore = 40; // Poor
  } else {
    balanceScore = 20; // Very poor
  }
  
  // Determine inflammation tendency
  let inflammationRisk: string;
  let status: ResultPayload['status'] = 'optimal';
  let interpretation = 'This suggests a general lifestyle tendency where your omega-6 to omega-3 ratio may be well-balanced, supporting wellness.';
  
  if (adjustedRatio <= 4) {
    inflammationRisk = 'Very Low';
    status = 'optimal';
    interpretation = 'This suggests a general lifestyle tendency where your omega-6 to omega-3 ratio is excellent (≤4:1), indicating a lower tendency and good fatty acid balance.';
  } else if (adjustedRatio <= 8) {
    inflammationRisk = 'Low';
    status = 'good';
    interpretation = 'This suggests a general lifestyle tendency where your ratio is good (≤8:1) with relatively lower tendency. Minor improvements may support wellness further.';
  } else if (adjustedRatio <= 12) {
    inflammationRisk = 'Moderate';
    status = 'moderate';
    interpretation = 'This suggests a general lifestyle tendency where your ratio is moderate (≤12:1), indicating a moderate tendency. You may consider reducing omega-6 and increasing omega-3.';
  } else if (adjustedRatio <= 20) {
    inflammationRisk = 'Higher';
    status = 'low';
    interpretation = 'This suggests a general lifestyle tendency where your ratio is high (≤20:1), indicating a higher tendency. You may consider reducing omega-6 intake and increasing omega-3.';
  } else {
    inflammationRisk = 'Very High';
    status = 'low';
    interpretation = 'This suggests a general lifestyle tendency where your ratio is very high (>20:1), indicating a very high tendency typical of Western diets. You may consider significant dietary changes to improve balance.';
  }
  
  // Recommended intakes (aim for 4:1 or better)
  const recommendedOmega3 = Math.max(1, omega3 * 1.5); // Increase omega-3
  const recommendedOmega6 = recommendedOmega3 * 4; // Target 4:1 ratio
  
  const recommendations = [
    `Your omega-6 to omega-3 ratio is approximately ${adjustedRatio.toFixed(1)}:1. Inflammation tendency: ${inflammationRisk}. This is a personal insight, not a medical evaluation.`,
    adjustedRatio > 8
      ? 'You may consider reducing omega-6 intake by avoiding processed foods and vegetable oils (soybean, corn, sunflower, safflower). Use olive oil, avocado oil, or coconut oil instead.'
      : 'Your omega-6 intake is relatively balanced. You may consider continuing to limit processed foods and choose healthier cooking oils.',
    adjustedRatio > 8
      ? `You may consider increasing omega-3 intake to at least ${recommendedOmega3.toFixed(1)} grams daily. Eat fatty fish (salmon, mackerel, sardines) 2-3 times per week or discuss omega-3 supplements (1-2g EPA+DHA) with a qualified professional.`
      : 'You may consider maintaining omega-3 intake. Consider including fatty fish regularly or discussing omega-3 supplements with a qualified professional to support balance.',
    'You may consider choosing grass-fed meat over grain-fed when possible, as it has better omega-6 to omega-3 ratios.',
  ];
  
  if (processedFoods >= 7 || vegetableOil >= 7) {
    recommendations.push('Your processed food or vegetable oil usage is high, which may significantly increase omega-6 intake. Reducing these may have a major impact on improving your ratio.');
  }
  
  const plan = [
    { label: 'This Week', detail: `You may consider reducing processed foods and switching from vegetable oils to olive oil, avocado oil, or coconut oil for cooking. Increase omega-3 intake through fatty fish or discuss supplements with a qualified professional.` },
    { label: 'This Month', detail: 'You may consider tracking omega-6 sources in your diet and gradually reducing them. Aim for 2-3 servings of fatty fish per week or discuss daily omega-3 supplements with a qualified professional. Monitor your ratio improvements.' },
    { label: 'Ongoing', detail: 'You may consider maintaining a balanced omega-6 to omega-3 ratio (target 4:1 or lower). Continue choosing whole foods over processed foods, healthy cooking oils, and regular omega-3 intake from food or supplements.' },
  ];
  
  return { 
    omega6ToOmega3Ratio: adjustedRatio, 
    balanceScore, 
    inflammationRisk, 
    recommendedOmega6, 
    recommendedOmega3, 
    status, 
    interpretation, 
    recommendations, 
    plan 
  };
};

export default function Omega6ToOmega3BalanceCalculator() {
  const [result, setResult] = useState<ResultPayload | null>(null);

  const form = useForm<FormValues>({
    resolver: zodResolver(formSchema),
    defaultValues: {
      omega6Intake: undefined,
      omega3Intake: undefined,
      processedFoods: undefined,
      vegetableOilUsage: undefined,
    },
  });

  return (
    <div className="space-y-8">
      <Script id="omega-balance-schema" type="application/ld+json" strategy="afterInteractive" dangerouslySetInnerHTML={{ __html: JSON.stringify(schemaMarkup) }} />

      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <Moon className="h-5 w-5" />
            Omega-6 to Omega-3 Balance Wellness Calculator
          </CardTitle>
          <CardDescription>Get general wellness insights about omega-6 to omega-3 ratio in your diet to assess fatty acid balance. This is a personal lifestyle insight, not a medical evaluation.</CardDescription>
        </CardHeader>
      </Card>

      <Card>
        <CardHeader>
          <CardTitle>Input your fatty acid intake</CardTitle>
        </CardHeader>
        <CardContent>
          <Form {...form}>
            <form onSubmit={form.handleSubmit((values) => setResult(calculateResult(values)))} className="space-y-6">
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <FormField
                  control={form.control}
                  name="omega6Intake"
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel>Omega-6 intake (grams/day)</FormLabel>
                      <FormControl>
                        <Input type="number" step="0.5" placeholder="e.g., 15" value={field.value ?? ''} onChange={(e) => field.onChange(e.target.value === '' ? undefined : Number(e.target.value))} />
                      </FormControl>
                      <FormMessage />
                    </FormItem>
                  )}
                />
                <FormField
                  control={form.control}
                  name="omega3Intake"
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel>Omega-3 intake (grams/day)</FormLabel>
                      <FormControl>
                        <Input type="number" step="0.1" placeholder="e.g., 1.5" value={field.value ?? ''} onChange={(e) => field.onChange(e.target.value === '' ? undefined : Number(e.target.value))} />
                      </FormControl>
                      <FormMessage />
                    </FormItem>
                  )}
                />
                <FormField
                  control={form.control}
                  name="processedFoods"
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel>Processed foods (0-10, optional)</FormLabel>
                      <FormControl>
                        <Input type="number" step="1" placeholder="e.g., 5" value={field.value ?? ''} onChange={(e) => field.onChange(e.target.value === '' ? undefined : Number(e.target.value))} />
                      </FormControl>
                      <FormMessage />
                    </FormItem>
                  )}
                />
                <FormField
                  control={form.control}
                  name="vegetableOilUsage"
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel>Vegetable oil usage (0-10, optional)</FormLabel>
                      <FormControl>
                        <Input type="number" step="1" placeholder="e.g., 5" value={field.value ?? ''} onChange={(e) => field.onChange(e.target.value === '' ? undefined : Number(e.target.value))} />
                      </FormControl>
                      <FormMessage />
                    </FormItem>
                  )}
                />
              </div>
              <Button type="submit" className="w-full md:w-auto">
                Calculate balance ratio
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
            <CardDescription>See omega-6 to omega-3 ratio, balance score, inflammation tendency, and recommendations.</CardDescription>
          </CardHeader>
          <CardContent className="space-y-6">
            <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
              <div className="p-4 border rounded">
                <p className="text-sm text-muted-foreground">Omega-6:Omega-3 ratio</p>
                <p className="text-2xl font-semibold text-primary">{result.omega6ToOmega3Ratio.toFixed(1)}:1</p>
                <p className="text-xs text-muted-foreground">Current ratio</p>
              </div>
              <div className="p-4 border rounded">
                <p className="text-sm text-muted-foreground">Balance score</p>
                <p className="text-2xl font-semibold text-primary">{result.balanceScore}/100</p>
                <p className="text-xs text-muted-foreground">Higher = better</p>
              </div>
              <div className="p-4 border rounded">
                <p className="text-sm text-muted-foreground">Inflammation tendency</p>
                <p className="text-2xl font-semibold text-primary">{result.inflammationRisk}</p>
                <p className="text-xs text-muted-foreground">Tendency level</p>
              </div>
              <div className="p-4 border rounded">
                <p className="text-sm text-muted-foreground">Status</p>
                <p className="text-2xl font-semibold text-primary capitalize">{result.status}</p>
                <p className="text-xs text-muted-foreground">{result.interpretation}</p>
              </div>
            </div>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div className="p-4 border rounded">
                <p className="text-sm text-muted-foreground">Recommended omega-6</p>
                <p className="text-xl font-semibold text-primary">{result.recommendedOmega6.toFixed(1)} g/day</p>
                <p className="text-xs text-muted-foreground">Target intake</p>
              </div>
              <div className="p-4 border rounded">
                <p className="text-sm text-muted-foreground">Recommended omega-3</p>
                <p className="text-xl font-semibold text-primary">{result.recommendedOmega3.toFixed(1)} g/day</p>
                <p className="text-xs text-muted-foreground">Target intake</p>
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
            <strong>Omega-6 to omega-3 ratio</strong> = Omega-6 intake (grams) / Omega-3 intake (grams).
          </p>
          <p>
            <strong>Adjusted omega-6</strong> = Base omega-6 + Hidden omega-6 from processed foods (0-5g) + Hidden omega-6 from vegetable oils (0-8g).
          </p>
          <p>
            <strong>Balance score</strong>: ≤4:1 = 100 points, ≤8:1 = 80 points, ≤12:1 = 60 points, ≤20:1 = 40 points, &gt;20:1 = 20 points.
          </p>
          <p>
            <strong>Target ratio</strong> = 4:1 or lower (ideal is 1:1 to 4:1). Modern Western diets often have 15:1 to 20:1 ratios.
          </p>
          <p>Omega-6 and omega-3 fatty acids compete for the same enzymes. Lower ratios support anti-inflammatory processes, while high ratios promote inflammation and increase chronic disease risk.</p>
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
                <p className="text-sm text-muted-foreground">Ideal ratio target</p>
                <p className="text-xl font-semibold text-primary">≤4:1</p>
                <p className="text-xs text-muted-foreground">Optimal range</p>
              </div>
              <div className="p-4 border rounded">
                <p className="text-sm text-muted-foreground">Ratio improvement</p>
                <p className="text-xl font-semibold text-primary">
                  {result.omega6ToOmega3Ratio > 4 
                    ? `${(result.omega6ToOmega3Ratio - 4).toFixed(1)}:1 excess`
                    : 'Optimal'}
                </p>
                <p className="text-xs text-muted-foreground">vs ideal</p>
              </div>
              <div className="p-4 border rounded">
                <p className="text-sm text-muted-foreground">Reduction needed</p>
                <p className="text-xl font-semibold text-primary">
                  {result.omega6ToOmega3Ratio > 4 
                    ? `${((result.omega6ToOmega3Ratio / 4 - 1) * 100).toFixed(0)}%`
                    : 'None'}
                </p>
                <p className="text-xs text-muted-foreground">To reach ideal</p>
              </div>
            </div>
          ) : (
            <p className="text-sm text-muted-foreground">Enter your fatty acid intake data to see additional insights.</p>
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
          <p>The omega-6 to omega-3 fatty acid ratio is crucial for health. These fatty acids compete for enzymes, and excessive omega-6 relative to omega-3 promotes inflammation. Modern Western diets often have ratios of 15:1 to 20:1, while ideal ratios are 1:1 to 4:1.</p>
          <p>Use this calculator to assess your omega-6 to omega-3 ratio and receive recommendations for optimizing fatty acid balance through dietary changes and omega-3 supplementation.</p>
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
          <p>This tool provides general wellness insights about omega-6 to omega-3 ratio in your diet to assess fatty acid balance. This is a personal lifestyle insight, not a medical evaluation.</p>
          <p>Outputs include omega-6 to omega-3 ratio, balance score, inflammation tendency level, suggested intakes, status, recommendations, an action plan, and supporting metrics.</p>
          <p>Formula, steps, guide content, related tools, and FAQs ensure humans or AI assistants can interpret the methodology instantly.</p>
        </CardContent>
      </Card>

      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <Shield className="h-5 w-5" />
            Disclaimer
          </CardTitle>
        </CardHeader>
        <CardContent className="text-sm text-muted-foreground">
          <p>Disclaimer: This tool provides general wellness and lifestyle insights for educational purposes only. It is not a medical or psychological diagnosis. For any health concerns, please consult a qualified professional.</p>
        </CardContent>
      </Card>
    </div>
  );
}



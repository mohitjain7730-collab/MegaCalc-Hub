'use client';

import { useState } from 'react';
import Script from 'next/script';
import Link from 'next/link';
import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import { z } from 'zod';
import { Heart, Zap, Target, Activity, Shield } from 'lucide-react';

import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Form, FormControl, FormField, FormItem, FormLabel, FormMessage } from '@/components/ui/form';
import { Input } from '@/components/ui/input';

const formSchema = z.object({
  dietQuality: z.number({ invalid_type_error: 'Enter diet quality' }).min(0).max(20),
  exerciseLevel: z.number({ invalid_type_error: 'Enter exercise level' }).min(0).max(10),
  sleepQuality: z.number({ invalid_type_error: 'Enter sleep quality' }).min(1).max(10),
  stressManagement: z.number({ invalid_type_error: 'Enter stress management' }).min(1).max(10),
});

type FormValues = z.infer<typeof formSchema>;

type ResultPayload = {
  dietQuality: number;
  exerciseLevel: number;
  sleepQuality: number;
  stressManagement: number;
  strategyScore: number;
  extensionIndex: number;
  status: 'optimal' | 'good' | 'moderate' | 'low';
  interpretation: string;
  recommendations: string[];
  plan: { label: string; detail: string }[];
};

const steps = [
  'Enter diet quality score (0-20) from dietary assessment.',
  'Enter exercise level (0 = none, 10 = extensive) from activity assessment.',
  'Enter sleep quality (1 = poor, 10 = excellent) from sleep assessment.',
  'Enter stress management score (1 = poor, 10 = excellent) from stress assessment.',
  'Review lifespan extension strategy score, longevity strategy status, and recommendations.',
];

const faqs = [
  {
    question: 'What are lifespan extension strategies?',
    answer:
      'Lifespan extension strategies are evidence-based lifestyle approaches that may promote longevity and healthy aging. These include optimal nutrition, regular exercise, quality sleep, stress management, and other health-promoting behaviors.',
  },
  {
    question: 'How does diet affect lifespan?',
    answer:
      'Diet quality significantly impacts lifespan. Diets rich in fruits, vegetables, whole grains, lean proteins, and healthy fats are associated with longer life expectancy and reduced disease risk compared to poor-quality diets.',
  },
  {
    question: 'How does exercise affect lifespan?',
    answer:
      'Regular exercise is strongly associated with increased lifespan. Moderate to vigorous physical activity reduces mortality risk, supports cardiovascular health, and promotes healthy aging. Both aerobic and strength training are beneficial.',
  },
  {
    question: 'How does sleep affect lifespan?',
    answer:
      'Quality sleep is essential for longevity. Optimal sleep (7-9 hours, high quality) supports cellular repair, immune function, and metabolic health, all associated with increased life expectancy.',
  },
  {
    question: 'How does stress management affect lifespan?',
    answer:
      'Effective stress management supports longevity by reducing chronic inflammation, supporting immune function, and promoting overall health. Chronic stress is associated with increased disease risk and reduced lifespan.',
  },
  {
    question: 'What other factors affect lifespan?',
    answer:
      'Lifespan is also affected by genetics, social connections, healthcare access, avoiding smoking, limiting alcohol, maintaining healthy weight, and other lifestyle factors. Multiple factors work together to influence longevity.',
  },
  {
    question: 'Can lifestyle changes extend lifespan?',
    answer:
      'Yes. Evidence suggests that adopting healthy lifestyle habits (good nutrition, regular exercise, quality sleep, stress management) can significantly impact lifespan and healthy aging, potentially adding years to life expectancy.',
  },
  {
    question: 'What is the optimal strategy score?',
    answer:
      'Higher strategy scores (typically &gt;75) indicate better alignment with evidence-based longevity strategies. Optimal scores reflect comprehensive adoption of health-promoting behaviors across multiple domains.',
  },
  {
    question: 'How do I improve my strategy score?',
    answer:
      'Improve strategy score by enhancing diet quality, increasing regular exercise, optimizing sleep, improving stress management, and adopting other evidence-based longevity-promoting behaviors consistently.',
  },
  {
    question: 'When should I consult a healthcare provider?',
    answer:
      'Consult a healthcare provider for personalized longevity strategies, especially if you have health conditions, are making significant lifestyle changes, or need guidance on evidence-based approaches to healthy aging.',
  },
];

const relatedCalculators = [
  {
    name: 'Sleep Quality vs Longevity Correlation Calculator',
    slug: 'sleep-quality-vs-longevity-correlation-calculator',
    description: 'Assess sleep-longevity relationship alongside strategy score.',
  },
  {
    name: 'Nutrient Density to Calorie Ratio Calculator',
    slug: 'nutrient-density-to-calorie-ratio-calculator',
    description: 'Evaluate diet quality comprehensively.',
  },
  {
    name: 'Biological Stress Load (Allostatic Load) Calculator',
    slug: 'biological-stress-load-allostatic-load-calculator',
    description: 'Monitor stress affecting longevity.',
  },
];

const baseUrl = 'https://mycalculating.com/health-fitness/lifespan-extension-strategy-score-calculator';

const schemaMarkup = {
  '@context': 'https://schema.org',
  '@graph': [
    {
      '@type': 'BreadcrumbList',
      itemListElement: [
        { '@type': 'ListItem', position: 1, name: 'Home', item: 'https://mycalculating.com' },
        { '@type': 'ListItem', position: 2, name: 'Health & Fitness', item: 'https://mycalculating.com/health-fitness' },
        { '@type': 'ListItem', position: 3, name: 'Lifespan Extension Strategy Wellness Score Calculator', item: baseUrl },
      ],
    },
    {
      '@type': 'SoftwareApplication',
      name: 'Lifespan Extension Strategy Wellness Score Calculator',
      applicationCategory: 'Calculator',
      operatingSystem: 'Web Browser',
      description: 'Calculate lifespan extension strategy score from diet quality, exercise level, sleep quality, and stress management.',
      url: baseUrl,
      offers: { '@type': 'Offer', price: '0', priceCurrency: 'USD' },
    },
  ],
};

const clamp = (value: number, min: number, max: number) => Math.min(max, Math.max(min, value));

const calculateResult = (values: FormValues): ResultPayload => {
  const dietQuality = values.dietQuality;
  const exerciseLevel = values.exerciseLevel;
  const sleepQuality = values.sleepQuality;
  const stressManagement = values.stressManagement;
  
  // Calculate strategy score (0-100, higher = better)
  let strategyScore = 50;
  
  // Diet quality component (0-30 points)
  if (dietQuality >= 15) {
    strategyScore += 25; // Excellent
  } else if (dietQuality >= 10) {
    strategyScore += 15; // Good
  } else if (dietQuality < 5) {
    strategyScore -= 20; // Poor
  } else {
    strategyScore -= 5; // Moderate
  }
  
  // Exercise level component (0-25 points)
  // Moderate to high exercise is optimal
  if (exerciseLevel >= 6 && exerciseLevel <= 8) {
    strategyScore += 22; // Optimal
  } else if (exerciseLevel >= 4 && exerciseLevel < 6) {
    strategyScore += 12; // Good
  } else if (exerciseLevel > 8) {
    strategyScore += 15; // Very high (still beneficial)
  } else if (exerciseLevel < 3) {
    strategyScore -= 15; // Too low
  } else {
    strategyScore += 5; // Moderate
  }
  
  // Sleep quality component (0-25 points)
  if (sleepQuality >= 8) {
    strategyScore += 22; // Excellent
  } else if (sleepQuality >= 6) {
    strategyScore += 12; // Good
  } else if (sleepQuality < 4) {
    strategyScore -= 18; // Poor
  } else {
    strategyScore -= 5; // Moderate
  }
  
  // Stress management component (0-20 points)
  if (stressManagement >= 8) {
    strategyScore += 18; // Excellent
  } else if (stressManagement >= 6) {
    strategyScore += 10; // Good
  } else if (stressManagement < 4) {
    strategyScore -= 15; // Poor
  } else {
    strategyScore -= 5; // Moderate
  }
  
  strategyScore = clamp(strategyScore, 0, 100);
  const extensionIndex = strategyScore; // Same value

  let status: ResultPayload['status'] = 'optimal';
  let interpretation = 'This suggests a general lifestyle tendency where your lifespan extension strategy score may be optimal. You may consider continuing to maintain comprehensive health-promoting behaviors that may support longevity.';

  if (strategyScore < 50 || dietQuality < 5 || exerciseLevel < 3 || sleepQuality < 4) {
    status = 'low';
    interpretation = 'This suggests a general lifestyle tendency where your lifespan extension strategy score may be low. You may consider significant improvements in diet, exercise, sleep, and stress management, which may support longevity. You may consider focusing on comprehensive lifestyle changes. This is a personal insight, not a medical evaluation.';
  } else if (strategyScore < 70 || dietQuality < 10 || exerciseLevel < 5 || sleepQuality < 6) {
    status = 'moderate';
    interpretation = 'This suggests a general lifestyle tendency where your lifespan extension strategy score may be moderate. You may consider improving diet quality, exercise, sleep, and stress management, which may enhance longevity prospects and healthy aging.';
  } else if (strategyScore < 85) {
    status = 'good';
    interpretation = 'This suggests a general lifestyle tendency where your lifespan extension strategy score may be good. You may consider continuing to maintain and optimize health-promoting behaviors that may support optimal longevity outcomes.';
  }

  const recommendations = [
    'Optimize diet quality: consume a balanced diet rich in fruits, vegetables, whole grains, lean proteins, and healthy fats. Reduce processed foods, added sugars, and unhealthy fats to support longevity.',
    'Engage in regular exercise: aim for at least 150 minutes of moderate-intensity exercise per week, including both aerobic and strength training, to support cardiovascular health and longevity.',
    'Prioritize quality sleep: aim for 7-9 hours of high-quality sleep per night to support cellular repair, immune function, and metabolic health associated with longevity.',
  ];
  if (status === 'low' || status === 'moderate') {
    recommendations.push('Improve stress management: use effective stress reduction techniques (meditation, exercise, social support) to reduce chronic stress and support longevity-promoting health outcomes.');
  }
  if (dietQuality < 10) {
    recommendations.push('Significantly improve diet quality. A high-quality diet is one of the most important factors for longevity. Focus on whole, nutrient-dense foods and reduce processed foods.');
  }
  if (exerciseLevel < 5) {
    recommendations.push('Increase regular exercise. Physical activity is strongly associated with increased lifespan. Aim for consistent moderate to vigorous exercise to support longevity.');
  }

  const plan = [
    { label: 'This Week', detail: 'Assess current diet quality, exercise level, sleep quality, and stress management. Calculate lifespan extension strategy score and identify areas for improvement.' },
    { label: 'This Month', detail: 'Implement comprehensive lifestyle improvements: enhance diet quality, increase exercise, optimize sleep, and improve stress management to support longevity.' },
    { label: 'Ongoing', detail: 'Monitor lifespan extension strategy through regular assessment of lifestyle factors. Maintain and optimize health-promoting behaviors to support longevity and healthy aging.' },
  ];

  return { dietQuality, exerciseLevel, sleepQuality, stressManagement, strategyScore, extensionIndex, status, interpretation, recommendations, plan };
};

export default function LifespanExtensionStrategyScoreCalculator() {
  const [result, setResult] = useState<ResultPayload | null>(null);

  const form = useForm<FormValues>({
    resolver: zodResolver(formSchema),
    defaultValues: {
      dietQuality: undefined,
      exerciseLevel: undefined,
      sleepQuality: undefined,
      stressManagement: undefined,
    },
  });

  return (
    <div className="space-y-8">
      <Script id="lifespan-strategy-schema" type="application/ld+json" strategy="afterInteractive" dangerouslySetInnerHTML={{ __html: JSON.stringify(schemaMarkup) }} />

      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <Heart className="h-5 w-5" />
            Lifespan Extension Strategy Wellness Score Calculator
          </CardTitle>
          <CardDescription>Get general wellness insights about lifespan extension strategy score from diet quality, exercise level, sleep quality, and stress management. This is a personal lifestyle insight, not a medical evaluation.</CardDescription>
        </CardHeader>
      </Card>

      <Card>
        <CardHeader>
          <CardTitle>Input your longevity strategy data</CardTitle>
        </CardHeader>
        <CardContent>
          <Form {...form}>
            <form onSubmit={form.handleSubmit((values) => setResult(calculateResult(values)))} className="space-y-6">
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <FormField
                  control={form.control}
                  name="dietQuality"
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel>Diet quality score (0-20)</FormLabel>
                      <FormControl>
                        <Input type="number" step="1" placeholder="e.g., 14" value={field.value ?? ''} onChange={(e) => field.onChange(e.target.value === '' ? undefined : Number(e.target.value))} />
                      </FormControl>
                      <FormMessage />
                    </FormItem>
                  )}
                />
                <FormField
                  control={form.control}
                  name="exerciseLevel"
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel>Exercise level (0-10)</FormLabel>
                      <FormControl>
                        <Input type="number" step="1" placeholder="e.g., 6" value={field.value ?? ''} onChange={(e) => field.onChange(e.target.value === '' ? undefined : Number(e.target.value))} />
                      </FormControl>
                      <FormMessage />
                    </FormItem>
                  )}
                />
                <FormField
                  control={form.control}
                  name="sleepQuality"
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel>Sleep quality (1-10)</FormLabel>
                      <FormControl>
                        <Input type="number" step="1" placeholder="e.g., 8" value={field.value ?? ''} onChange={(e) => field.onChange(e.target.value === '' ? undefined : Number(e.target.value))} />
                      </FormControl>
                      <FormMessage />
                    </FormItem>
                  )}
                />
                <FormField
                  control={form.control}
                  name="stressManagement"
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel>Stress management (1-10)</FormLabel>
                      <FormControl>
                        <Input type="number" step="1" placeholder="e.g., 7" value={field.value ?? ''} onChange={(e) => field.onChange(e.target.value === '' ? undefined : Number(e.target.value))} />
                      </FormControl>
                      <FormMessage />
                    </FormItem>
                  )}
                />
              </div>
              <Button type="submit" className="w-full md:w-auto">
                Calculate strategy score
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
            <CardDescription>See lifespan extension strategy score, longevity strategy status, and recommendations.</CardDescription>
          </CardHeader>
          <CardContent className="space-y-6">
            <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
              <div className="p-4 border rounded">
                <p className="text-sm text-muted-foreground">Diet quality</p>
                <p className="text-2xl font-semibold text-primary">{result.dietQuality.toFixed(0)}</p>
                <p className="text-xs text-muted-foreground">Out of 20</p>
              </div>
              <div className="p-4 border rounded">
                <p className="text-sm text-muted-foreground">Exercise level</p>
                <p className="text-2xl font-semibold text-primary">{result.exerciseLevel.toFixed(0)}</p>
                <p className="text-xs text-muted-foreground">Out of 10</p>
              </div>
              <div className="p-4 border rounded">
                <p className="text-sm text-muted-foreground">Strategy score</p>
                <p className="text-2xl font-semibold text-primary">{result.strategyScore.toFixed(0)}</p>
                <p className="text-xs text-muted-foreground">Out of 100</p>
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
            <strong>Lifespan extension strategy score</strong> = calculated from diet quality (0-30 points), exercise level (0-25 points), sleep quality (0-25 points), and stress management (0-20 points).
          </p>
          <p>
            <strong>Components</strong>: Higher scores in each domain contribute to better overall strategy score. Comprehensive adoption of health-promoting behaviors across all domains optimizes longevity prospects.
          </p>
          <p>
            <strong>Optimal ranges</strong>: Diet quality: 15-20, Exercise level: 6-8, Sleep quality: 8-10, Stress management: 8-10. Higher strategy scores (&gt;85) indicate optimal alignment with longevity strategies.
          </p>
          <p>Lifespan extension strategy score reflects comprehensive adoption of evidence-based longevity-promoting behaviors. Multiple lifestyle factors work together to influence lifespan and healthy aging.</p>
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
                <p className="text-sm text-muted-foreground">Target strategy score</p>
                <p className="text-xl font-semibold text-primary">&gt; 85</p>
                <p className="text-xs text-muted-foreground">Optimal range</p>
              </div>
              <div className="p-4 border rounded">
                <p className="text-sm text-muted-foreground">Extension index</p>
                <p className="text-xl font-semibold text-primary">{result.extensionIndex.toFixed(0)}</p>
                <p className="text-xs text-muted-foreground">Out of 100</p>
              </div>
              <div className="p-4 border rounded">
                <p className="text-sm text-muted-foreground">Average domain score</p>
                <p className="text-xl font-semibold text-primary">
                  {((result.dietQuality / 20 * 100 + result.exerciseLevel / 10 * 100 + result.sleepQuality / 10 * 100 + result.stressManagement / 10 * 100) / 4).toFixed(0)}%
                </p>
                <p className="text-xs text-muted-foreground">Across all domains</p>
              </div>
            </div>
          ) : (
            <p className="text-sm text-muted-foreground">Enter your longevity strategy data to see additional insights.</p>
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
          <p>Lifespan extension strategies are evidence-based lifestyle approaches that promote longevity and healthy aging. These include optimal nutrition, regular exercise, quality sleep, stress management, and comprehensive health-promoting behaviors.</p>
          <p>Use this calculator to assess lifespan extension strategy score from diet quality, exercise level, sleep quality, and stress management.</p>
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
          <p>This tool provides general wellness insights about lifespan extension strategy score from diet quality, exercise level, sleep quality, and stress management. This is a personal lifestyle insight, not a medical evaluation.</p>
          <p>Outputs include diet quality, exercise level, sleep quality, stress management, strategy score, extension index, status, recommendations, an action plan, and supporting metrics.</p>
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


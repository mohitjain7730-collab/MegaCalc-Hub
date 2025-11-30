'use client';

import { useState } from 'react';
import Script from 'next/script';
import Link from 'next/link';
import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import { z } from 'zod';
import { Clock, Zap, Target, Activity, Shield } from 'lucide-react';

import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Form, FormControl, FormField, FormItem, FormLabel, FormMessage } from '@/components/ui/form';
import { Input } from '@/components/ui/input';

const formSchema = z.object({
  meal1Time: z.string({ invalid_type_error: 'Enter meal 1 time' }),
  meal2Time: z.string({ invalid_type_error: 'Enter meal 2 time' }),
  meal3Time: z.string({ invalid_type_error: 'Enter meal 3 time' }).optional(),
  meal4Time: z.string({ invalid_type_error: 'Enter meal 4 time' }).optional(),
});

type FormValues = z.infer<typeof formSchema>;

type ResultPayload = {
  meal1Time: string;
  meal2Time: string;
  meal3Time: string;
  meal4Time: string;
  averageSpacing: number;
  minSpacing: number;
  maxSpacing: number;
  spacingQuality: string;
  status: 'optimal' | 'good' | 'moderate' | 'low';
  interpretation: string;
  recommendations: string[];
  plan: { label: string; detail: string }[];
};

const steps = [
  'Enter first meal time (HH:MM) in 24-hour format.',
  'Enter second meal time (HH:MM) in 24-hour format.',
  'Optionally enter third meal time (HH:MM) if you eat 3+ meals.',
  'Optionally enter fourth meal time (HH:MM) if you eat 4+ meals.',
  'Review inter-meal spacing, average spacing, and recommendations.',
];

const faqs = [
  {
    question: 'What is inter-meal spacing?',
    answer:
      'Inter-meal spacing refers to the time between meals. Regular spacing (3-5 hours between meals) supports stable blood sugar, prevents overeating, and maintains metabolic function better than irregular or very short spacing.',
  },
  {
    question: 'What is optimal meal spacing?',
    answer:
      'Optimal meal spacing is typically 3-5 hours between meals. This allows for proper digestion, stable blood sugar, and prevents excessive hunger that can lead to overeating.',
  },
  {
    question: 'How does meal spacing affect metabolism?',
    answer:
      'Regular meal spacing (3-5 hours) supports stable blood sugar, prevents insulin spikes, and maintains metabolic function. Very short spacing (frequent snacking) or very long spacing (extended fasting) can affect metabolism differently.',
  },
  {
    question: 'What about frequent snacking?',
    answer:
      'Frequent snacking (meals less than 2-3 hours apart) may prevent proper digestion, cause constant insulin elevation, and interfere with metabolic processes. Regular meal spacing is generally preferred.',
  },
  {
    question: 'What about extended spacing?',
    answer:
      'Extended spacing (6+ hours between meals) may be appropriate for intermittent fasting patterns but can cause excessive hunger and overeating for some individuals. Balance spacing with individual needs.',
  },
  {
    question: 'How many meals per day?',
    answer:
      'Meal frequency varies by individual. Most people do well with 3-4 meals per day with 3-5 hour spacing. Some prefer 2 larger meals, while others prefer more frequent smaller meals. Individual needs vary.',
  },
  {
    question: 'How do I optimize meal spacing?',
    answer:
      'Optimize meal spacing by eating regular meals 3-5 hours apart, avoiding frequent snacking, and maintaining consistent meal timing. Adjust based on hunger, energy levels, and individual metabolic responses.',
  },
  {
    question: 'What about meal timing consistency?',
    answer:
      'Consistent meal timing supports circadian rhythm and metabolic function. Regular meal spacing at similar times each day helps maintain stable blood sugar and metabolic processes.',
  },
  {
    question: 'Can I track meal spacing at home?',
    answer:
      'Yes. Record meal times and calculate hours between meals. Assess average spacing, minimum spacing, and maximum spacing to evaluate meal timing patterns and identify opportunities for optimization.',
  },
  {
    question: 'When should I consult a healthcare provider?',
    answer:
      'Consult a healthcare provider or registered dietitian if you have blood sugar concerns, need personalized guidance on meal spacing, want to optimize meal timing, or have questions about intermittent fasting patterns.',
  },
];

const relatedCalculators = [
  {
    name: 'Meal Timing and Insulin Response Calculator',
    slug: 'meal-timing-and-insulin-response-calculator',
    description: 'Assess meal timing alongside spacing.',
  },
  {
    name: 'Eating Window Duration Calculator',
    slug: 'eating-window-duration-calculator',
    description: 'Evaluate eating window alongside spacing.',
  },
  {
    name: 'Breakfast Skipping Effect on Metabolism Calculator',
    slug: 'breakfast-skipping-effect-on-metabolism-calculator',
    description: 'Assess breakfast patterns alongside spacing.',
  },
  {
    name: 'Late-Night Eating Impact Score Calculator',
    slug: 'late-night-eating-impact-score-calculator',
    description: 'Evaluate meal timing comprehensively.',
  },
];

const baseUrl = 'https://mycalculating.com/category/health-fitness/inter-meal-spacing-impact-calculator';

const schemaMarkup = {
  '@context': 'https://schema.org',
  '@graph': [
    {
      '@type': 'BreadcrumbList',
      itemListElement: [
        { '@type': 'ListItem', position: 1, name: 'Home', item: 'https://mycalculating.com' },
        { '@type': 'ListItem', position: 2, name: 'Health & Fitness', item: 'https://mycalculating.com/category/health-fitness' },
        { '@type': 'ListItem', position: 3, name: 'Inter-Meal Spacing Impact Calculator', item: baseUrl },
      ],
    },
    {
      '@type': 'SoftwareApplication',
      name: 'Inter-Meal Spacing Impact Calculator',
      applicationCategory: 'Calculator',
      operatingSystem: 'Web Browser',
      description: 'Calculate inter-meal spacing impact from meal times and hours between meals.',
      url: baseUrl,
      offers: { '@type': 'Offer', price: '0', priceCurrency: 'USD' },
    },
  ],
};

const clamp = (value: number, min: number, max: number) => Math.min(max, Math.max(min, value));

const calculateResult = (values: FormValues): ResultPayload => {
  const meal1Time = values.meal1Time;
  const meal2Time = values.meal2Time;
  const meal3Time = values.meal3Time;
  const meal4Time = values.meal4Time;
  
  // Parse meal times
  const parseTime = (time: string) => {
    if (!time) return null;
    const [hours, minutes] = time.split(':').map(Number);
    return hours + minutes / 60;
  };
  
  const times = [parseTime(meal1Time), parseTime(meal2Time), parseTime(meal3Time), parseTime(meal4Time)].filter((t): t is number => t !== null);
  
  // Calculate spacing between consecutive meals
  const spacings: number[] = [];
  for (let i = 0; i < times.length - 1; i++) {
    let spacing = times[i + 1] - times[i];
    if (spacing < 0) spacing += 24; // Handle next day
    spacings.push(spacing);
  }
  
  const averageSpacing = spacings.length > 0 ? spacings.reduce((sum, s) => sum + s, 0) / spacings.length : 0;
  const minSpacing = spacings.length > 0 ? Math.min(...spacings) : 0;
  const maxSpacing = spacings.length > 0 ? Math.max(...spacings) : 0;
  
  // Determine spacing quality
  let spacingQuality = 'Optimal';
  if (averageSpacing >= 3 && averageSpacing <= 5 && minSpacing >= 2.5 && maxSpacing <= 6) {
    spacingQuality = 'Optimal';
  } else if (averageSpacing >= 2.5 && averageSpacing <= 6 && minSpacing >= 2 && maxSpacing <= 7) {
    spacingQuality = 'Good';
  } else if (minSpacing < 2 || maxSpacing > 8) {
    spacingQuality = 'Needs improvement';
  } else {
    spacingQuality = 'Moderate';
  }
  
  let status: ResultPayload['status'] = 'optimal';
  let interpretation = 'Your inter-meal spacing is optimal. Regular spacing (3-5 hours) supports stable blood sugar, proper digestion, and metabolic function.';

  if (minSpacing < 2 || maxSpacing > 8 || averageSpacing < 2 || averageSpacing > 7) {
    status = 'low';
    interpretation = 'Your inter-meal spacing needs improvement. Very short spacing (frequent snacking) or very long spacing may affect blood sugar control and metabolic function. Aim for 3-5 hour spacing between meals.';
  } else if (minSpacing < 2.5 || maxSpacing > 7 || averageSpacing < 2.5 || averageSpacing > 6) {
    status = 'moderate';
    interpretation = 'Your inter-meal spacing is moderate. Consider adjusting to 3-5 hour spacing between meals to support better blood sugar control and metabolic function.';
  } else if (averageSpacing >= 3 && averageSpacing <= 5 && minSpacing >= 2.5 && maxSpacing <= 6) {
    status = 'optimal';
    interpretation = 'Your inter-meal spacing is optimal. Regular 3-5 hour spacing supports stable blood sugar, proper digestion, and optimal metabolic function.';
  } else {
    status = 'good';
    interpretation = 'Your inter-meal spacing is good. Continue maintaining regular spacing between meals to support stable blood sugar and metabolic health.';
  }

  const recommendations = [
    'Maintain 3-5 hour spacing: aim for 3-5 hours between meals to support stable blood sugar, proper digestion, and metabolic function. This prevents excessive hunger and overeating.',
    'Avoid frequent snacking: meals less than 2-3 hours apart may prevent proper digestion and cause constant insulin elevation. Allow adequate time between meals.',
    'Consistent meal timing: maintain regular meal times each day to support circadian rhythm and metabolic function. Consistent spacing helps maintain stable blood sugar.',
  ];
  if (status === 'low' || status === 'moderate') {
    recommendations.push('Improve meal spacing. Adjust meal times to achieve 3-5 hour spacing between meals. This supports better blood sugar control, digestion, and metabolic function.');
  }
  if (minSpacing < 2) {
    recommendations.push('Increase spacing between meals. Very short spacing (less than 2 hours) indicates frequent snacking, which may interfere with digestion and metabolic processes.');
  }
  if (maxSpacing > 8) {
    recommendations.push('Reduce maximum spacing. Very long spacing (more than 8 hours) may cause excessive hunger and overeating. Consider adding a meal or adjusting timing.');
  }

  const plan = [
    { label: 'This Week', detail: 'Track meal times and calculate spacing between meals. Assess average, minimum, and maximum spacing to identify opportunities for optimization.' },
    { label: 'This Month', detail: 'Optimize meal spacing: adjust meal times to achieve 3-5 hour spacing between meals, maintain consistent timing, and avoid frequent snacking to support metabolic health.' },
    { label: 'Ongoing', detail: 'Monitor meal spacing through regular tracking. Maintain 3-5 hour spacing between meals with consistent timing to support stable blood sugar and optimal metabolic function.' },
  ];

  return { meal1Time, meal2Time, meal3Time: meal3Time || '', meal4Time: meal4Time || '', averageSpacing, minSpacing, maxSpacing, spacingQuality, status, interpretation, recommendations, plan };
};

export default function InterMealSpacingImpactCalculator() {
  const [result, setResult] = useState<ResultPayload | null>(null);

  const form = useForm<FormValues>({
    resolver: zodResolver(formSchema),
    defaultValues: {
      meal1Time: undefined,
      meal2Time: undefined,
      meal3Time: undefined,
      meal4Time: undefined,
    },
  });

  return (
    <div className="space-y-8">
      <Script id="inter-meal-spacing-schema" type="application/ld+json" strategy="afterInteractive" dangerouslySetInnerHTML={{ __html: JSON.stringify(schemaMarkup) }} />

      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <Clock className="h-5 w-5" />
            Inter-Meal Spacing Impact Calculator
          </CardTitle>
          <CardDescription>Calculate inter-meal spacing impact from meal times and hours between meals.</CardDescription>
        </CardHeader>
      </Card>

      <Card>
        <CardHeader>
          <CardTitle>Input your meal timing data</CardTitle>
        </CardHeader>
        <CardContent>
          <Form {...form}>
            <form onSubmit={form.handleSubmit((values) => setResult(calculateResult(values)))} className="space-y-6">
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <FormField
                  control={form.control}
                  name="meal1Time"
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel>Meal 1 time (HH:MM)</FormLabel>
                      <FormControl>
                        <Input type="time" placeholder="e.g., 08:00" value={field.value ?? ''} onChange={(e) => field.onChange(e.target.value)} />
                      </FormControl>
                      <FormMessage />
                    </FormItem>
                  )}
                />
                <FormField
                  control={form.control}
                  name="meal2Time"
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel>Meal 2 time (HH:MM)</FormLabel>
                      <FormControl>
                        <Input type="time" placeholder="e.g., 12:00" value={field.value ?? ''} onChange={(e) => field.onChange(e.target.value)} />
                      </FormControl>
                      <FormMessage />
                    </FormItem>
                  )}
                />
                <FormField
                  control={form.control}
                  name="meal3Time"
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel>Meal 3 time (HH:MM) (optional)</FormLabel>
                      <FormControl>
                        <Input type="time" placeholder="e.g., 18:00" value={field.value ?? ''} onChange={(e) => field.onChange(e.target.value)} />
                      </FormControl>
                      <FormMessage />
                    </FormItem>
                  )}
                />
                <FormField
                  control={form.control}
                  name="meal4Time"
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel>Meal 4 time (HH:MM) (optional)</FormLabel>
                      <FormControl>
                        <Input type="time" placeholder="e.g., 21:00" value={field.value ?? ''} onChange={(e) => field.onChange(e.target.value)} />
                      </FormControl>
                      <FormMessage />
                    </FormItem>
                  )}
                />
              </div>
              <Button type="submit" className="w-full md:w-auto">
                Calculate spacing impact
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
            <CardDescription>See inter-meal spacing, average spacing, and recommendations.</CardDescription>
          </CardHeader>
          <CardContent className="space-y-6">
            <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
              <div className="p-4 border rounded">
                <p className="text-sm text-muted-foreground">Average spacing</p>
                <p className="text-2xl font-semibold text-primary">{result.averageSpacing.toFixed(1)}</p>
                <p className="text-xs text-muted-foreground">Hours</p>
              </div>
              <div className="p-4 border rounded">
                <p className="text-sm text-muted-foreground">Min spacing</p>
                <p className="text-2xl font-semibold text-primary">{result.minSpacing.toFixed(1)}</p>
                <p className="text-xs text-muted-foreground">Hours</p>
              </div>
              <div className="p-4 border rounded">
                <p className="text-sm text-muted-foreground">Spacing quality</p>
                <p className="text-2xl font-semibold text-primary">{result.spacingQuality}</p>
                <p className="text-xs text-muted-foreground">Based on spacing</p>
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
            <strong>Spacing between meals</strong> = time difference between consecutive meals (in hours). If next meal is next day, add 24 hours.
          </p>
          <p>
            <strong>Average spacing</strong> = sum of all spacing intervals / number of intervals. Optimal: 3-5 hours.
          </p>
          <p>
            <strong>Minimum spacing</strong> = shortest interval between any two consecutive meals. Optimal: ≥2.5 hours.
          </p>
          <p>
            <strong>Maximum spacing</strong> = longest interval between any two consecutive meals. Optimal: ≤6 hours.
          </p>
          <p>
            <strong>Spacing quality</strong>: Optimal: 3-5 hour average, 2.5-6 hour range. Good: 2.5-6 hour average, 2-7 hour range. Needs improvement: &lt;2 hour min or &gt;8 hour max.
          </p>
          <p>Inter-meal spacing affects blood sugar control, digestion, and metabolic function. Regular 3-5 hour spacing supports stable blood sugar and prevents excessive hunger or overeating.</p>
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
                <p className="text-sm text-muted-foreground">Max spacing</p>
                <p className="text-xl font-semibold text-primary">{result.maxSpacing.toFixed(1)}</p>
                <p className="text-xs text-muted-foreground">Hours</p>
              </div>
              <div className="p-4 border rounded">
                <p className="text-sm text-muted-foreground">Target spacing</p>
                <p className="text-xl font-semibold text-primary">3-5 hours</p>
                <p className="text-xs text-muted-foreground">Recommended</p>
              </div>
              <div className="p-4 border rounded">
                <p className="text-sm text-muted-foreground">Number of meals</p>
                <p className="text-xl font-semibold text-primary">
                  {[result.meal1Time, result.meal2Time, result.meal3Time, result.meal4Time].filter(t => t).length}
                </p>
                <p className="text-xs text-muted-foreground">Tracked</p>
              </div>
            </div>
          ) : (
            <p className="text-sm text-muted-foreground">Enter your meal timing data to see additional insights.</p>
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
          <p>Inter-meal spacing refers to the time between meals. Optimal spacing is 3-5 hours between meals, which supports stable blood sugar, proper digestion, and metabolic function. Regular spacing prevents excessive hunger and overeating.</p>
          <p>Use this calculator to calculate inter-meal spacing impact from meal times and hours between meals.</p>
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
          <p>This tool calculates inter-meal spacing impact from meal times and hours between meals.</p>
          <p>Outputs include meal times, average spacing, minimum spacing, maximum spacing, spacing quality, status, recommendations, an action plan, and supporting metrics.</p>
          <p>Formula, steps, guide content, related tools, and FAQs ensure humans or AI assistants can interpret the methodology instantly.</p>
        </CardContent>
      </Card>
    </div>
  );
}


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
  mealTime: z.string({ invalid_type_error: 'Enter meal time' }),
  carbGrams: z.number({ invalid_type_error: 'Enter carbs' }).min(0).max(500),
  proteinGrams: z.number({ invalid_type_error: 'Enter protein' }).min(0).max(200).optional(),
  fiberGrams: z.number({ invalid_type_error: 'Enter fiber' }).min(0).max(100).optional(),
});

type FormValues = z.infer<typeof formSchema>;

type ResultPayload = {
  mealTime: string;
  carbGrams: number;
  proteinGrams: number;
  fiberGrams: number;
  estimatedInsulinResponse: number;
  timingImpact: string;
  status: 'optimal' | 'good' | 'moderate' | 'low';
  interpretation: string;
  recommendations: string[];
  plan: { label: string; detail: string }[];
};

const steps = [
  'Enter meal time (e.g., 08:00, 12:00, 18:00) in 24-hour format.',
  'Enter carbohydrates (grams) from the meal.',
  'Optionally enter protein (grams) to assess meal composition.',
  'Optionally enter fiber (grams) to assess meal composition.',
  'Review estimated insulin response, timing impact, and recommendations.',
];

const faqs = [
  {
    question: 'How does meal timing affect insulin response?',
    answer:
      'Meal timing affects insulin sensitivity. Morning meals may have better insulin sensitivity, while late-night meals may have reduced sensitivity. Regular meal timing supports stable blood sugar and insulin function.',
  },
  {
    question: 'What affects insulin response?',
    answer:
      'Insulin response is affected by carbohydrate amount, meal composition (protein, fiber, fat), meal timing, circadian rhythm, and individual insulin sensitivity. Lower carbs, higher protein/fiber, and optimal timing reduce insulin response.',
  },
  {
    question: 'What is optimal meal timing?',
    answer:
      'Optimal meal timing aligns with circadian rhythm. Eating during daylight hours (especially earlier in the day) typically supports better insulin sensitivity and metabolic function than late-night eating.',
  },
  {
    question: 'How do protein and fiber affect insulin?',
    answer:
      'Protein and fiber can reduce insulin response by slowing carbohydrate absorption and improving insulin sensitivity. Including protein and fiber with meals helps moderate blood sugar and insulin spikes.',
  },
  {
    question: 'What about late-night eating?',
    answer:
      'Late-night eating (after 8 PM) may reduce insulin sensitivity and increase insulin response. The body\'s circadian rhythm makes it less efficient at processing food later in the day.',
  },
  {
    question: 'How do I reduce insulin response?',
    answer:
      'Reduce insulin response by eating meals earlier in the day, including protein and fiber with meals, moderating carbohydrate intake, and maintaining regular meal timing aligned with circadian rhythm.',
  },
  {
    question: 'What about meal frequency?',
    answer:
      'Meal frequency affects insulin response. Regular meals (3-4 per day) with consistent timing typically support better insulin sensitivity than irregular or frequent snacking patterns.',
  },
  {
    question: 'Can I track meal timing at home?',
    answer:
      'Yes. Record meal times and carbohydrate amounts to assess timing patterns. Note how meal timing and composition affect your energy, hunger, and blood sugar responses.',
  },
  {
    question: 'What is circadian rhythm?',
    answer:
      'Circadian rhythm is the body\'s 24-hour internal clock. It affects insulin sensitivity, with better sensitivity during daylight hours and reduced sensitivity in the evening and night.',
  },
  {
    question: 'When should I consult a healthcare provider?',
    answer:
      'Consult a healthcare provider or registered dietitian if you have diabetes, insulin resistance, blood sugar concerns, or need personalized guidance on meal timing and insulin response management.',
  },
];

const relatedCalculators = [
  {
    name: 'Insulin Response Estimator',
    slug: 'insulin-response-estimator',
    description: 'Estimate insulin response from meal composition.',
  },
  {
    name: 'Late-Night Eating Impact Score Calculator',
    slug: 'late-night-eating-impact-score-calculator',
    description: 'Assess late-night eating alongside meal timing.',
  },
  {
    name: 'Inter-Meal Spacing Impact Calculator',
    slug: 'inter-meal-spacing-impact-calculator',
    description: 'Evaluate meal spacing alongside timing.',
  },
  {
    name: 'Eating Window Duration Calculator',
    slug: 'eating-window-duration-calculator',
    description: 'Assess eating window alongside meal timing.',
  },
];

const baseUrl = 'https://mycalculating.com/health-fitness/meal-timing-and-insulin-response-calculator';

const schemaMarkup = {
  '@context': 'https://schema.org',
  '@graph': [
    {
      '@type': 'BreadcrumbList',
      itemListElement: [
        { '@type': 'ListItem', position: 1, name: 'Home', item: 'https://mycalculating.com' },
        { '@type': 'ListItem', position: 2, name: 'Health & Fitness', item: 'https://mycalculating.com/health-fitness' },
        { '@type': 'ListItem', position: 3, name: 'Meal Timing and Insulin Response Calculator', item: baseUrl },
      ],
    },
    {
      '@type': 'SoftwareApplication',
      name: 'Meal Timing and Insulin Response Calculator',
      applicationCategory: 'Calculator',
      operatingSystem: 'Web Browser',
      description: 'Calculate meal timing and insulin response from meal time, carbohydrate amount, and meal composition.',
      url: baseUrl,
      offers: { '@type': 'Offer', price: '0', priceCurrency: 'USD' },
    },
  ],
};

const clamp = (value: number, min: number, max: number) => Math.min(max, Math.max(min, value));

const calculateResult = (values: FormValues): ResultPayload => {
  const mealTime = values.mealTime;
  const carbGrams = values.carbGrams;
  const proteinGrams = values.proteinGrams || 0;
  const fiberGrams = values.fiberGrams || 0;
  
  // Parse meal time (HH:MM format)
  const [hours, minutes] = mealTime.split(':').map(Number);
  const mealHour = hours + minutes / 60;
  
  // Estimate insulin response (0-100, higher = more insulin needed)
  // Base response from carbs
  let estimatedInsulinResponse = carbGrams * 2; // Base: ~2 units per 10g carbs
  
  // Timing impact: better sensitivity in morning, reduced in evening
  let timingMultiplier = 1.0;
  if (mealHour >= 6 && mealHour < 10) {
    timingMultiplier = 0.85; // Morning: better sensitivity
  } else if (mealHour >= 10 && mealHour < 14) {
    timingMultiplier = 0.90; // Midday: good sensitivity
  } else if (mealHour >= 14 && mealHour < 18) {
    timingMultiplier = 0.95; // Afternoon: moderate sensitivity
  } else if (mealHour >= 18 && mealHour < 22) {
    timingMultiplier = 1.05; // Evening: reduced sensitivity
  } else {
    timingMultiplier = 1.15; // Late night: significantly reduced sensitivity
  }
  
  estimatedInsulinResponse *= timingMultiplier;
  
  // Protein and fiber reduce insulin response
  estimatedInsulinResponse -= (proteinGrams * 0.1); // Protein reduces response
  estimatedInsulinResponse -= (fiberGrams * 0.2); // Fiber reduces response more
  
  estimatedInsulinResponse = clamp(estimatedInsulinResponse, 0, 200);
  
  let timingImpact = 'Optimal';
  if (mealHour >= 18) {
    timingImpact = 'Reduced sensitivity';
  } else if (mealHour >= 6 && mealHour < 10) {
    timingImpact = 'Enhanced sensitivity';
  } else if (mealHour >= 10 && mealHour < 14) {
    timingImpact = 'Good sensitivity';
  } else {
    timingImpact = 'Moderate sensitivity';
  }
  
  let status: ResultPayload['status'] = 'optimal';
  let interpretation = 'Your meal timing and composition support optimal insulin response. Eating during daylight hours with protein and fiber helps moderate insulin response.';

  if (estimatedInsulinResponse > 80 || (mealHour >= 20 && carbGrams > 50)) {
    status = 'low';
    interpretation = 'Your meal timing and composition may cause high insulin response. Late-night eating with high carbs increases insulin response. Consider eating earlier and reducing carbs, or adding protein and fiber.';
  } else if (estimatedInsulinResponse > 60 || mealHour >= 20) {
    status = 'moderate';
    interpretation = 'Your meal timing or composition may increase insulin response. Consider eating earlier in the day, reducing carbohydrates, or adding protein and fiber to moderate insulin response.';
  } else if (estimatedInsulinResponse < 40 && mealHour >= 6 && mealHour < 18) {
    status = 'optimal';
    interpretation = 'Your meal timing and composition support optimal insulin response. Eating during daylight hours with balanced macronutrients helps maintain stable blood sugar and insulin function.';
  } else {
    status = 'good';
    interpretation = 'Your meal timing and composition are good. Continue eating during daylight hours with balanced macronutrients to support optimal insulin response and metabolic health.';
  }

  const recommendations = [
    'Eat meals during daylight hours: meals consumed between 6 AM and 6 PM typically have better insulin sensitivity and lower insulin response than late-night meals.',
    'Include protein and fiber: adding protein and fiber to meals reduces insulin response by slowing carbohydrate absorption and improving insulin sensitivity.',
    'Moderate carbohydrate intake: especially for late meals, reduce carbohydrate amounts to minimize insulin response when sensitivity is naturally reduced.',
  ];
  if (status === 'low' || status === 'moderate') {
    recommendations.push('Optimize meal timing and composition. Eat earlier in the day, reduce carbohydrates for late meals, and include protein and fiber to moderate insulin response and support metabolic health.');
  }
  if (mealHour >= 20) {
    recommendations.push('Avoid late-night eating when possible. If eating late, significantly reduce carbohydrates and include protein and fiber to minimize insulin response during reduced sensitivity periods.');
  }
  if (carbGrams > 60 && proteinGrams < 20) {
    recommendations.push('Add protein to high-carb meals. Protein helps reduce insulin response and supports better blood sugar control, especially important for larger carbohydrate meals.');
  }

  const plan = [
    { label: 'This Week', detail: 'Track meal times and carbohydrate amounts. Assess how meal timing and composition affect insulin response and identify opportunities for optimization.' },
    { label: 'This Month', detail: 'Optimize meal timing: eat meals during daylight hours (6 AM-6 PM), include protein and fiber with meals, and reduce carbohydrates for late meals to support optimal insulin response.' },
    { label: 'Ongoing', detail: 'Monitor meal timing and composition through regular tracking. Maintain meals during daylight hours with balanced macronutrients to support stable insulin function and metabolic health.' },
  ];

  return { mealTime, carbGrams, proteinGrams, fiberGrams, estimatedInsulinResponse, timingImpact, status, interpretation, recommendations, plan };
};

export default function MealTimingAndInsulinResponseCalculator() {
  const [result, setResult] = useState<ResultPayload | null>(null);

  const form = useForm<FormValues>({
    resolver: zodResolver(formSchema),
    defaultValues: {
      mealTime: undefined,
      carbGrams: undefined,
      proteinGrams: undefined,
      fiberGrams: undefined,
    },
  });

  return (
    <div className="space-y-8">
      <Script id="meal-timing-insulin-schema" type="application/ld+json" strategy="afterInteractive" dangerouslySetInnerHTML={{ __html: JSON.stringify(schemaMarkup) }} />

      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <Clock className="h-5 w-5" />
            Meal Timing and Insulin Response Calculator
          </CardTitle>
          <CardDescription>Calculate meal timing and insulin response from meal time, carbohydrate amount, and meal composition.</CardDescription>
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
                  name="mealTime"
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel>Meal time (HH:MM)</FormLabel>
                      <FormControl>
                        <Input type="time" placeholder="e.g., 12:00" value={field.value ?? ''} onChange={(e) => field.onChange(e.target.value)} />
                      </FormControl>
                      <FormMessage />
                    </FormItem>
                  )}
                />
                <FormField
                  control={form.control}
                  name="carbGrams"
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel>Carbohydrates (grams)</FormLabel>
                      <FormControl>
                        <Input type="number" step="0.1" placeholder="e.g., 50" value={field.value ?? ''} onChange={(e) => field.onChange(e.target.value === '' ? undefined : Number(e.target.value))} />
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
                      <FormLabel>Protein (grams) (optional)</FormLabel>
                      <FormControl>
                        <Input type="number" step="0.1" placeholder="e.g., 25" value={field.value ?? ''} onChange={(e) => field.onChange(e.target.value === '' ? undefined : Number(e.target.value))} />
                      </FormControl>
                      <FormMessage />
                    </FormItem>
                  )}
                />
                <FormField
                  control={form.control}
                  name="fiberGrams"
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel>Fiber (grams) (optional)</FormLabel>
                      <FormControl>
                        <Input type="number" step="0.1" placeholder="e.g., 8" value={field.value ?? ''} onChange={(e) => field.onChange(e.target.value === '' ? undefined : Number(e.target.value))} />
                      </FormControl>
                      <FormMessage />
                    </FormItem>
                  )}
                />
              </div>
              <Button type="submit" className="w-full md:w-auto">
                Calculate insulin response
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
            <CardDescription>See estimated insulin response, timing impact, and recommendations.</CardDescription>
          </CardHeader>
          <CardContent className="space-y-6">
            <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
              <div className="p-4 border rounded">
                <p className="text-sm text-muted-foreground">Meal time</p>
                <p className="text-2xl font-semibold text-primary">{result.mealTime}</p>
                <p className="text-xs text-muted-foreground">24-hour format</p>
              </div>
              <div className="p-4 border rounded">
                <p className="text-sm text-muted-foreground">Estimated response</p>
                <p className="text-2xl font-semibold text-primary">{result.estimatedInsulinResponse.toFixed(1)}</p>
                <p className="text-xs text-muted-foreground">Relative units</p>
              </div>
              <div className="p-4 border rounded">
                <p className="text-sm text-muted-foreground">Timing impact</p>
                <p className="text-2xl font-semibold text-primary">{result.timingImpact}</p>
                <p className="text-xs text-muted-foreground">Sensitivity status</p>
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
            <strong>Estimated insulin response</strong> = (carbohydrates Ã— 2) Ã— timing multiplier - (protein Ã— 0.1) - (fiber Ã— 0.2).
          </p>
          <p>
            <strong>Timing multipliers</strong>: Morning (6-10 AM): 0.85 (enhanced sensitivity), Midday (10 AM-2 PM): 0.90, Afternoon (2-6 PM): 0.95, Evening (6-10 PM): 1.05 (reduced sensitivity), Late night (10 PM-6 AM): 1.15 (significantly reduced sensitivity).
          </p>
          <p>
            <strong>Protein and fiber effects</strong>: Protein reduces insulin response by ~0.1 units per gram. Fiber reduces response by ~0.2 units per gram by slowing carbohydrate absorption.
          </p>
          <p>Meal timing affects insulin sensitivity through circadian rhythm. Eating during daylight hours (especially morning) supports better insulin sensitivity and lower insulin response than late-night eating.</p>
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
                <p className="text-sm text-muted-foreground">Carbs</p>
                <p className="text-xl font-semibold text-primary">{result.carbGrams.toFixed(1)}g</p>
                <p className="text-xs text-muted-foreground">In meal</p>
              </div>
              <div className="p-4 border rounded">
                <p className="text-sm text-muted-foreground">Protein</p>
                <p className="text-xl font-semibold text-primary">{result.proteinGrams.toFixed(1)}g</p>
                <p className="text-xs text-muted-foreground">In meal</p>
              </div>
              <div className="p-4 border rounded">
                <p className="text-sm text-muted-foreground">Response category</p>
                <p className="text-xl font-semibold text-primary">
                  {result.estimatedInsulinResponse < 40 ? 'Low' : result.estimatedInsulinResponse < 60 ? 'Moderate' : result.estimatedInsulinResponse < 80 ? 'High' : 'Very High'}
                </p>
                <p className="text-xs text-muted-foreground">Based on estimate</p>
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
          <p>Meal timing affects insulin response through circadian rhythm. Eating during daylight hours (especially 6 AM-6 PM) supports better insulin sensitivity and lower insulin response than late-night eating. Including protein and fiber with meals also reduces insulin response.</p>
          <p>Use this calculator to calculate meal timing and insulin response from meal time, carbohydrate amount, and meal composition.</p>
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
          <p>This tool calculates meal timing and insulin response from meal time, carbohydrate amount, and meal composition.</p>
          <p>Outputs include meal time, carbs, protein, fiber, estimated insulin response, timing impact, status, recommendations, an action plan, and supporting metrics.</p>
          <p>Formula, steps, guide content, related tools, and FAQs ensure humans or AI assistants can interpret the methodology instantly.</p>
        </CardContent>
      </Card>
    </div>
  );
}


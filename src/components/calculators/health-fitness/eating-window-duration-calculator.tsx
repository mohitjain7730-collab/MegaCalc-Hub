'use client';

import { useState } from 'react';
import Script from 'next/script';
import Link from 'next/link';
import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import { z } from 'zod';
import { Timer, Zap, Target, Activity, Shield } from 'lucide-react';

import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Form, FormControl, FormField, FormItem, FormLabel, FormMessage } from '@/components/ui/form';
import { Input } from '@/components/ui/input';

const formSchema = z.object({
  firstMealTime: z.string({ invalid_type_error: 'Enter first meal time' }),
  lastMealTime: z.string({ invalid_type_error: 'Enter last meal time' }),
});

type FormValues = z.infer<typeof formSchema>;

type ResultPayload = {
  firstMealTime: string;
  lastMealTime: string;
  eatingWindowHours: number;
  fastingHours: number;
  windowType: string;
  status: 'optimal' | 'good' | 'moderate' | 'low';
  interpretation: string;
  recommendations: string[];
  plan: { label: string; detail: string }[];
};

const steps = [
  'Enter first meal time (HH:MM) in 24-hour format (when you start eating).',
  'Enter last meal time (HH:MM) in 24-hour format (when you finish eating).',
  'Review eating window duration, fasting hours, and recommendations.',
];

const faqs = [
  {
    question: 'What is an eating window?',
    answer:
      'An eating window is the period during the day when you consume food. It is the time between your first meal and last meal. The rest of the day is the fasting period.',
  },
  {
    question: 'What is intermittent fasting?',
    answer:
      'Intermittent fasting involves cycling between eating and fasting periods. Common patterns include 16:8 (16-hour fast, 8-hour eating window), 18:6, or 20:4. It can support metabolic health when done appropriately.',
  },
  {
    question: 'What is an optimal eating window?',
    answer:
      'Optimal eating window varies by individual and goals. Common patterns include 8-12 hour eating windows (e.g., 10 AM-6 PM or 8 AM-6 PM), which provide adequate time for meals while allowing fasting benefits.',
  },
  {
    question: 'How does eating window affect metabolism?',
    answer:
      'Eating window affects circadian rhythm and metabolic function. Shorter eating windows (8-10 hours) may support better insulin sensitivity, metabolic health, and weight management than longer windows (14+ hours).',
  },
  {
    question: 'What about eating window timing?',
    answer:
      'Eating window timing matters. Eating during daylight hours (e.g., 8 AM-6 PM) typically supports better metabolic function than late-night eating. Aligning eating with circadian rhythm is beneficial.',
  },
  {
    question: 'How long should my eating window be?',
    answer:
      'Eating window length depends on individual needs and goals. Many people do well with 8-12 hour windows. Shorter windows (6-8 hours) may provide more fasting benefits, while longer windows (12-14 hours) may be easier to maintain.',
  },
  {
    question: 'What about meal frequency within the window?',
    answer:
      'Meal frequency within the eating window can vary. Some prefer 2-3 larger meals, while others prefer more frequent smaller meals. Both can work within an appropriate eating window.',
  },
  {
    question: 'Can I track eating window at home?',
    answer:
      'Yes. Record first and last meal times to calculate eating window duration. Track how different window lengths and timings affect your energy, hunger, and metabolic responses.',
  },
  {
    question: 'What is the relationship to circadian rhythm?',
    answer:
      'Eating window timing affects circadian rhythm. Eating during daylight hours (especially earlier in the day) supports circadian rhythm and metabolic function better than late-night eating.',
  },
  {
    question: 'When should I consult a healthcare provider?',
    answer:
      'Consult a healthcare provider or registered dietitian if you have metabolic concerns, want to start intermittent fasting, need personalized guidance on eating window optimization, or have questions about meal timing patterns.',
  },
];

const relatedCalculators = [
  {
    name: 'Meal Timing and Insulin Response Calculator',
    slug: 'meal-timing-and-insulin-response-calculator',
    description: 'Assess meal timing alongside eating window.',
  },
  {
    name: 'Inter-Meal Spacing Impact Calculator',
    slug: 'inter-meal-spacing-impact-calculator',
    description: 'Evaluate meal spacing alongside eating window.',
  },
  {
    name: 'Late-Night Eating Impact Score Calculator',
    slug: 'late-night-eating-impact-score-calculator',
    description: 'Assess late-night eating alongside eating window.',
  },
  {
    name: 'Breakfast Skipping Effect on Metabolism Calculator',
    slug: 'breakfast-skipping-effect-on-metabolism-calculator',
    description: 'Evaluate meal patterns comprehensively.',
  },
];

const baseUrl = 'https://mycalculating.com/category/health-fitness/eating-window-duration-calculator';

const schemaMarkup = {
  '@context': 'https://schema.org',
  '@graph': [
    {
      '@type': 'BreadcrumbList',
      itemListElement: [
        { '@type': 'ListItem', position: 1, name: 'Home', item: 'https://mycalculating.com' },
        { '@type': 'ListItem', position: 2, name: 'Health & Fitness', item: 'https://mycalculating.com/category/health-fitness' },
        { '@type': 'ListItem', position: 3, name: 'Eating Window Duration (Fasting vs Feeding) Calculator', item: baseUrl },
      ],
    },
    {
      '@type': 'SoftwareApplication',
      name: 'Eating Window Duration (Fasting vs Feeding) Calculator',
      applicationCategory: 'Calculator',
      operatingSystem: 'Web Browser',
      description: 'Calculate eating window duration from first meal time and last meal time.',
      url: baseUrl,
      offers: { '@type': 'Offer', price: '0', priceCurrency: 'USD' },
    },
  ],
};

const clamp = (value: number, min: number, max: number) => Math.min(max, Math.max(min, value));

const calculateResult = (values: FormValues): ResultPayload => {
  const firstMealTime = values.firstMealTime;
  const lastMealTime = values.lastMealTime;
  
  // Parse times
  const [firstHours, firstMinutes] = firstMealTime.split(':').map(Number);
  const [lastHours, lastMinutes] = lastMealTime.split(':').map(Number);
  const firstMealHour = firstHours + firstMinutes / 60;
  const lastMealHour = lastHours + lastMinutes / 60;
  
  // Calculate eating window
  let eatingWindowHours = lastMealHour - firstMealHour;
  if (eatingWindowHours < 0) {
    eatingWindowHours += 24; // Handle next day
  }
  
  // Calculate fasting hours
  const fastingHours = 24 - eatingWindowHours;
  
  // Determine window type
  let windowType = 'Standard';
  if (eatingWindowHours <= 8) {
    windowType = 'Intermittent fasting (short)';
  } else if (eatingWindowHours <= 10) {
    windowType = 'Intermittent fasting (moderate)';
  } else if (eatingWindowHours <= 12) {
    windowType = 'Time-restricted eating';
  } else if (eatingWindowHours <= 14) {
    windowType = 'Extended eating window';
  } else {
    windowType = 'Long eating window';
  }
  
  let status: ResultPayload['status'] = 'optimal';
  let interpretation = 'Your eating window is optimal. An 8-12 hour eating window supports metabolic health, allows adequate time for meals, and provides fasting benefits.';

  if (eatingWindowHours > 14 || (firstMealHour >= 20 && eatingWindowHours > 12)) {
    status = 'low';
    interpretation = 'Your eating window is very long. Eating windows longer than 14 hours may reduce fasting benefits and metabolic health. Consider shortening the window, especially if it includes late-night eating.';
  } else if (eatingWindowHours > 12 || firstMealHour >= 20) {
    status = 'moderate';
    interpretation = 'Your eating window is moderate to long. Consider shortening to 8-12 hours and ensuring it aligns with daylight hours to support better metabolic health and circadian rhythm.';
  } else if (eatingWindowHours >= 8 && eatingWindowHours <= 12 && firstMealHour < 20) {
    status = 'optimal';
    interpretation = 'Your eating window is optimal. An 8-12 hour window during daylight hours supports metabolic health, allows adequate time for meals, and provides fasting benefits.';
  } else if (eatingWindowHours < 6) {
    status = 'moderate';
    interpretation = 'Your eating window is very short. While this may provide fasting benefits, ensure you can meet nutritional needs within this window. Very short windows may be challenging to maintain long-term.';
  } else {
    status = 'good';
    interpretation = 'Your eating window is good. Continue maintaining an appropriate eating window that aligns with your needs and supports metabolic health.';
  }

  const recommendations = [
    'Aim for 8-12 hour eating window: this provides adequate time for meals while allowing fasting benefits. Common patterns include 10 AM-6 PM or 8 AM-6 PM.',
    'Align with daylight hours: eating during daylight hours (especially 8 AM-6 PM) supports circadian rhythm and metabolic function better than late-night eating.',
    'Maintain consistency: consistent eating window timing supports circadian rhythm and metabolic function. Try to maintain similar eating windows each day.',
  ];
  if (status === 'low' || status === 'moderate') {
    recommendations.push('Shorten eating window. Aim for 8-12 hours and ensure it aligns with daylight hours to support better metabolic health and circadian rhythm.');
  }
  if (eatingWindowHours > 14) {
    recommendations.push('Significantly shorten eating window. Windows longer than 14 hours reduce fasting benefits. Consider finishing meals earlier and starting later to create an 8-12 hour window.');
  }
  if (firstMealHour >= 20) {
    recommendations.push('Start eating earlier. Very late first meals disrupt circadian rhythm. Aim to start eating by 10-11 AM and finish by 6-8 PM for optimal metabolic health.');
  }
  if (eatingWindowHours < 6) {
    recommendations.push('Consider slightly longer window. Very short windows (less than 6 hours) may make it challenging to meet nutritional needs. An 8-10 hour window may be more sustainable.');
  }

  const plan = [
    { label: 'This Week', detail: 'Track first and last meal times to calculate eating window. Assess current window length and timing, and identify opportunities for optimization.' },
    { label: 'This Month', detail: 'Optimize eating window: aim for 8-12 hour window during daylight hours (e.g., 8 AM-6 PM or 10 AM-6 PM) to support metabolic health and circadian rhythm.' },
    { label: 'Ongoing', detail: 'Monitor eating window through regular tracking. Maintain consistent 8-12 hour eating windows during daylight hours to support optimal metabolic health and fasting benefits.' },
  ];

  return { firstMealTime, lastMealTime, eatingWindowHours, fastingHours, windowType, status, interpretation, recommendations, plan };
};

export default function EatingWindowDurationCalculator() {
  const [result, setResult] = useState<ResultPayload | null>(null);

  const form = useForm<FormValues>({
    resolver: zodResolver(formSchema),
    defaultValues: {
      firstMealTime: undefined,
      lastMealTime: undefined,
    },
  });

  return (
    <div className="space-y-8">
      <Script id="eating-window-schema" type="application/ld+json" strategy="afterInteractive" dangerouslySetInnerHTML={{ __html: JSON.stringify(schemaMarkup) }} />

      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <Timer className="h-5 w-5" />
            Eating Window Duration (Fasting vs Feeding) Calculator
          </CardTitle>
          <CardDescription>Calculate eating window duration from first meal time and last meal time.</CardDescription>
        </CardHeader>
      </Card>

      <Card>
        <CardHeader>
          <CardTitle>Input your eating window data</CardTitle>
        </CardHeader>
        <CardContent>
          <Form {...form}>
            <form onSubmit={form.handleSubmit((values) => setResult(calculateResult(values)))} className="space-y-6">
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <FormField
                  control={form.control}
                  name="firstMealTime"
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel>First meal time (HH:MM)</FormLabel>
                      <FormControl>
                        <Input type="time" placeholder="e.g., 08:00" value={field.value ?? ''} onChange={(e) => field.onChange(e.target.value)} />
                      </FormControl>
                      <FormMessage />
                    </FormItem>
                  )}
                />
                <FormField
                  control={form.control}
                  name="lastMealTime"
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel>Last meal time (HH:MM)</FormLabel>
                      <FormControl>
                        <Input type="time" placeholder="e.g., 18:00" value={field.value ?? ''} onChange={(e) => field.onChange(e.target.value)} />
                      </FormControl>
                      <FormMessage />
                    </FormItem>
                  )}
                />
              </div>
              <Button type="submit" className="w-full md:w-auto">
                Calculate eating window
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
            <CardDescription>See eating window duration, fasting hours, and recommendations.</CardDescription>
          </CardHeader>
          <CardContent className="space-y-6">
            <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
              <div className="p-4 border rounded">
                <p className="text-sm text-muted-foreground">Eating window</p>
                <p className="text-2xl font-semibold text-primary">{result.eatingWindowHours.toFixed(1)}</p>
                <p className="text-xs text-muted-foreground">Hours</p>
              </div>
              <div className="p-4 border rounded">
                <p className="text-sm text-muted-foreground">Fasting hours</p>
                <p className="text-2xl font-semibold text-primary">{result.fastingHours.toFixed(1)}</p>
                <p className="text-xs text-muted-foreground">Hours</p>
              </div>
              <div className="p-4 border rounded">
                <p className="text-sm text-muted-foreground">Window type</p>
                <p className="text-2xl font-semibold text-primary">{result.windowType}</p>
                <p className="text-xs text-muted-foreground">Based on duration</p>
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
            <strong>Eating window</strong> = last meal time - first meal time (in hours). If last meal is next day, add 24 hours.
          </p>
          <p>
            <strong>Fasting hours</strong> = 24 - eating window hours. This is the time spent not eating.
          </p>
          <p>
            <strong>Window types</strong>: ≤8 hours = Intermittent fasting (short), 8-10 hours = Intermittent fasting (moderate), 10-12 hours = Time-restricted eating, 12-14 hours = Extended eating window, &gt;14 hours = Long eating window.
          </p>
          <p>
            <strong>Optimal ranges</strong>: 8-12 hour eating windows during daylight hours (e.g., 8 AM-6 PM or 10 AM-6 PM) typically support best metabolic health and circadian rhythm.
          </p>
          <p>Eating window duration affects metabolic health and circadian rhythm. Shorter windows (8-12 hours) during daylight hours support better insulin sensitivity and metabolic function than longer windows or late-night eating.</p>
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
                <p className="text-sm text-muted-foreground">Target window</p>
                <p className="text-xl font-semibold text-primary">8-12 hours</p>
                <p className="text-xs text-muted-foreground">Recommended</p>
              </div>
              <div className="p-4 border rounded">
                <p className="text-sm text-muted-foreground">Fasting ratio</p>
                <p className="text-xl font-semibold text-primary">
                  {result.fastingHours.toFixed(0)}:{result.eatingWindowHours.toFixed(0)}
                </p>
                <p className="text-xs text-muted-foreground">Fasting:Eating</p>
              </div>
              <div className="p-4 border rounded">
                <p className="text-sm text-muted-foreground">Window status</p>
                <p className="text-xl font-semibold text-primary">
                  {result.eatingWindowHours >= 8 && result.eatingWindowHours <= 12 ? 'Optimal' : result.eatingWindowHours < 8 ? 'Short' : result.eatingWindowHours > 14 ? 'Long' : 'Moderate'}
                </p>
                <p className="text-xs text-muted-foreground">Based on duration</p>
              </div>
            </div>
          ) : (
            <p className="text-sm text-muted-foreground">Enter your eating window data to see additional insights.</p>
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
          <p>Eating window duration is the time between first and last meal. Optimal eating windows are 8-12 hours during daylight hours (e.g., 8 AM-6 PM or 10 AM-6 PM), which support metabolic health, circadian rhythm, and provide fasting benefits.</p>
          <p>Use this calculator to calculate eating window duration from first meal time and last meal time.</p>
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
          <p>This tool calculates eating window duration from first meal time and last meal time.</p>
          <p>Outputs include first meal time, last meal time, eating window hours, fasting hours, window type, status, recommendations, an action plan, and supporting metrics.</p>
          <p>Formula, steps, guide content, related tools, and FAQs ensure humans or AI assistants can interpret the methodology instantly.</p>
        </CardContent>
      </Card>
    </div>
  );
}


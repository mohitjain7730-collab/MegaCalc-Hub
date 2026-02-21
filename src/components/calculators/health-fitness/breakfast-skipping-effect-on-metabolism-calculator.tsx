'use client';

import { useState } from 'react';
import Script from 'next/script';
import Link from 'next/link';
import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import { z } from 'zod';
import { Sunrise, Zap, Target, Activity, Shield } from 'lucide-react';

import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Form, FormControl, FormField, FormItem, FormLabel, FormMessage } from '@/components/ui/form';
import { Input } from '@/components/ui/input';

const formSchema = z.object({
  breakfastFrequency: z.number({ invalid_type_error: 'Enter breakfast frequency' }).min(0).max(7),
  firstMealTime: z.string({ invalid_type_error: 'Enter first meal time' }),
  dailyCalories: z.number({ invalid_type_error: 'Enter daily calories' }).min(0).max(5000),
  breakfastCalories: z.number({ invalid_type_error: 'Enter breakfast calories' }).min(0).max(2000).optional(),
});

type FormValues = z.infer<typeof formSchema>;

type ResultPayload = {
  breakfastFrequency: number;
  firstMealTime: string;
  dailyCalories: number;
  breakfastCalories: number;
  breakfastPercent: number;
  metabolicImpact: string;
  status: 'optimal' | 'good' | 'moderate' | 'low';
  interpretation: string;
  recommendations: string[];
  plan: { label: string; detail: string }[];
};

const steps = [
  'Enter number of days per week you eat breakfast (0-7).',
  'Enter time of first meal (HH:MM) in 24-hour format.',
  'Enter total daily calories consumed.',
  'Enter breakfast calories if you eat breakfast (optional).',
  'Review breakfast skipping effect on metabolism, metabolic impact, and recommendations.',
];

const faqs = [
  {
    question: 'What is breakfast skipping?',
    answer:
      'Breakfast skipping refers to not eating a morning meal or delaying the first meal until later in the day. It can affect metabolism, energy levels, and metabolic health depending on individual patterns and overall calorie distribution.',
  },
  {
    question: 'How does breakfast skipping affect metabolism?',
    answer:
      'Breakfast skipping effects vary by individual. Some research suggests it may affect metabolic rate, insulin sensitivity, and energy levels. However, effects depend on overall calorie intake, meal timing, and individual metabolic responses.',
  },
  {
    question: 'What is the metabolic impact of skipping breakfast?',
    answer:
      'Metabolic impact depends on whether breakfast skipping leads to overeating later, affects insulin sensitivity, or disrupts circadian rhythm. Regular breakfast may support stable blood sugar and metabolic function for some individuals.',
  },
  {
    question: 'Should I eat breakfast?',
    answer:
      'Breakfast benefits vary by individual. Some people benefit from breakfast for energy and metabolic function, while others may do well with intermittent fasting. Consider your hunger, energy levels, and overall calorie distribution.',
  },
  {
    question: 'What about intermittent fasting?',
    answer:
      'Intermittent fasting, which often involves skipping breakfast, can be beneficial for some individuals when done appropriately. Effects depend on overall calorie intake, meal timing, and individual metabolic responses.',
  },
  {
    question: 'How does first meal time affect metabolism?',
    answer:
      'First meal time affects circadian rhythm and metabolic function. Eating earlier in the day (before 10 AM) may support better insulin sensitivity and metabolic function than very late first meals.',
  },
  {
    question: 'What about calorie distribution?',
    answer:
      'Calorie distribution throughout the day matters. Whether you eat breakfast or not, ensuring adequate nutrition and appropriate calorie distribution supports metabolic health. Avoid overcompensating later in the day.',
  },
  {
    question: 'Can I track breakfast skipping at home?',
    answer:
      'Yes. Record breakfast frequency, first meal time, and daily calorie distribution. Assess how breakfast patterns affect your energy, hunger, and metabolic responses to determine what works best for you.',
  },
  {
    question: 'What is optimal breakfast timing?',
    answer:
      'Optimal breakfast timing varies, but eating within 1-2 hours of waking (typically before 10 AM) may support circadian rhythm and metabolic function. Individual needs and preferences vary.',
  },
  {
    question: 'When should I consult a healthcare provider?',
    answer:
      'Consult a healthcare provider or registered dietitian if you have metabolic concerns, need personalized guidance on meal timing, want to optimize breakfast patterns, or have questions about intermittent fasting.',
  },
];

const relatedCalculators = [
  {
    name: 'Meal Timing and Insulin Response Calculator',
    slug: 'meal-timing-and-insulin-response-calculator',
    description: 'Assess meal timing alongside breakfast patterns.',
  },
  {
    name: 'Eating Window Duration Calculator',
    slug: 'eating-window-duration-calculator',
    description: 'Evaluate eating window alongside breakfast skipping.',
  },
  {
    name: 'Inter-Meal Spacing Impact Calculator',
    slug: 'inter-meal-spacing-impact-calculator',
    description: 'Assess meal spacing alongside breakfast patterns.',
  },
  {
    name: 'Late-Night Eating Impact Score Calculator',
    slug: 'late-night-eating-impact-score-calculator',
    description: 'Evaluate meal timing comprehensively.',
  },
];

const baseUrl = 'https://mycalculating.com/category/health-fitness/breakfast-skipping-effect-on-metabolism-calculator';

const schemaMarkup = {
  '@context': 'https://schema.org',
  '@graph': [
    {
      '@type': 'BreadcrumbList',
      itemListElement: [
        { '@type': 'ListItem', position: 1, name: 'Home', item: 'https://mycalculating.com' },
        { '@type': 'ListItem', position: 2, name: 'Health & Fitness', item: 'https://mycalculating.com/category/health-fitness' },
        { '@type': 'ListItem', position: 3, name: 'Breakfast Skipping Effect on Metabolism Calculator', item: baseUrl },
      ],
    },
    {
      '@type': 'SoftwareApplication',
      name: 'Breakfast Skipping Effect on Metabolism Calculator',
      applicationCategory: 'Calculator',
      operatingSystem: 'Web Browser',
      description: 'Calculate breakfast skipping effect from breakfast frequency, meal timing, and daily calorie distribution.',
      url: baseUrl,
      offers: { '@type': 'Offer', price: '0', priceCurrency: 'USD' },
    },
  ],
};

const clamp = (value: number, min: number, max: number) => Math.min(max, Math.max(min, value));

const calculateResult = (values: FormValues): ResultPayload => {
  const breakfastFrequency = values.breakfastFrequency;
  const firstMealTime = values.firstMealTime;
  const dailyCalories = values.dailyCalories;
  const breakfastCalories = values.breakfastCalories || 0;
  
  // Parse first meal time
  const [hours, minutes] = firstMealTime.split(':').map(Number);
  const firstMealHour = hours + minutes / 60;
  
  const breakfastPercent = dailyCalories > 0 ? (breakfastCalories / dailyCalories) * 100 : 0;
  
  // Determine metabolic impact
  let metabolicImpact = 'Neutral';
  
  if (breakfastFrequency >= 6 && firstMealHour < 10) {
    metabolicImpact = 'Positive - Regular early breakfast';
  } else if (breakfastFrequency >= 4 && firstMealHour < 10) {
    metabolicImpact = 'Moderate - Frequent early breakfast';
  } else if (breakfastFrequency < 3 && firstMealHour >= 12) {
    metabolicImpact = 'Potential negative - Frequent skipping, late first meal';
  } else if (breakfastFrequency < 3) {
    metabolicImpact = 'Variable - Frequent skipping';
  } else if (firstMealHour >= 12) {
    metabolicImpact = 'Potential negative - Late first meal';
  }
  
  let status: ResultPayload['status'] = 'optimal';
  let interpretation = 'Your breakfast pattern appears balanced. Regular breakfast or appropriate intermittent fasting can both support metabolic health when done appropriately.';

  if (breakfastFrequency < 2 && firstMealHour >= 12) {
    status = 'low';
    interpretation = 'Your breakfast skipping pattern may negatively affect metabolism. Frequent skipping with very late first meals may reduce insulin sensitivity and disrupt circadian rhythm. Consider eating earlier or having breakfast more frequently.';
  } else if (breakfastFrequency < 3 || firstMealHour >= 11) {
    status = 'moderate';
    interpretation = 'Your breakfast pattern may have variable metabolic effects. Consider eating breakfast more frequently or ensuring your first meal is earlier in the day to support metabolic function.';
  } else if (breakfastFrequency >= 5 && firstMealHour < 10) {
    status = 'optimal';
    interpretation = 'Your breakfast pattern supports metabolic health. Regular breakfast with early timing supports circadian rhythm, insulin sensitivity, and metabolic function.';
  } else {
    status = 'good';
    interpretation = 'Your breakfast pattern is reasonable. Continue monitoring how breakfast frequency and timing affect your energy, hunger, and metabolic responses.';
  }

  const recommendations = [
    'Consider breakfast benefits: regular breakfast (5-7 days/week) with early timing (before 10 AM) may support better insulin sensitivity, metabolic function, and energy levels for many individuals.',
    'If skipping breakfast: ensure first meal is not too late (before 12 PM), maintain adequate nutrition throughout the day, and avoid overcompensating with large meals later.',
    'Monitor individual response: breakfast effects vary by person. Track how breakfast patterns affect your energy, hunger, blood sugar, and metabolic responses to determine what works best for you.',
  ];
  if (status === 'low' || status === 'moderate') {
    recommendations.push('Improve breakfast pattern. Consider eating breakfast more frequently (5-7 days/week) and ensuring first meal is earlier in the day (before 10 AM) to support metabolic health.');
  }
  if (firstMealHour >= 12) {
    recommendations.push('Eat first meal earlier. Very late first meals (after 12 PM) may reduce insulin sensitivity and disrupt circadian rhythm. Aim for first meal before 10-11 AM when possible.');
  }
  if (breakfastFrequency < 3 && breakfastCalories === 0) {
    recommendations.push('Consider adding breakfast. If you frequently skip breakfast, try eating a balanced breakfast 3-5 days per week and assess how it affects your energy and metabolic responses.');
  }

  const plan = [
    { label: 'This Week', detail: 'Track breakfast frequency, first meal time, and daily calorie distribution. Assess how breakfast patterns affect your energy, hunger, and metabolic responses.' },
    { label: 'This Month', detail: 'Optimize breakfast pattern: consider eating breakfast 5-7 days/week with early timing (before 10 AM), or if skipping, ensure first meal is not too late and maintain adequate nutrition.' },
    { label: 'Ongoing', detail: 'Monitor breakfast patterns through regular tracking. Adjust based on individual responses to support optimal metabolic health, energy levels, and overall well-being.' },
  ];

  return { breakfastFrequency, firstMealTime, dailyCalories, breakfastCalories, breakfastPercent, metabolicImpact, status, interpretation, recommendations, plan };
};

export default function BreakfastSkippingEffectOnMetabolismCalculator() {
  const [result, setResult] = useState<ResultPayload | null>(null);

  const form = useForm<FormValues>({
    resolver: zodResolver(formSchema),
    defaultValues: {
      breakfastFrequency: undefined,
      firstMealTime: undefined,
      dailyCalories: undefined,
      breakfastCalories: undefined,
    },
  });

  return (
    <div className="space-y-8">
      <Script id="breakfast-skipping-schema" type="application/ld+json" strategy="afterInteractive" dangerouslySetInnerHTML={{ __html: JSON.stringify(schemaMarkup) }} />

      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <Sunrise className="h-5 w-5" />
            Breakfast Skipping Effect on Metabolism Calculator
          </CardTitle>
          <CardDescription>Calculate breakfast skipping effect from breakfast frequency, meal timing, and daily calorie distribution.</CardDescription>
        </CardHeader>
      </Card>

      <Card>
        <CardHeader>
          <CardTitle>Input your breakfast pattern data</CardTitle>
        </CardHeader>
        <CardContent>
          <Form {...form}>
            <form onSubmit={form.handleSubmit((values) => setResult(calculateResult(values)))} className="space-y-6">
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <FormField
                  control={form.control}
                  name="breakfastFrequency"
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel>Breakfast frequency (days/week)</FormLabel>
                      <FormControl>
                        <Input type="number" step="1" placeholder="e.g., 5" value={field.value ?? ''} onChange={(e) => field.onChange(e.target.value === '' ? undefined : Number(e.target.value))} />
                      </FormControl>
                      <FormMessage />
                    </FormItem>
                  )}
                />
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
                  name="dailyCalories"
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel>Daily calories</FormLabel>
                      <FormControl>
                        <Input type="number" step="1" placeholder="e.g., 2000" value={field.value ?? ''} onChange={(e) => field.onChange(e.target.value === '' ? undefined : Number(e.target.value))} />
                      </FormControl>
                      <FormMessage />
                    </FormItem>
                  )}
                />
                <FormField
                  control={form.control}
                  name="breakfastCalories"
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel>Breakfast calories (optional)</FormLabel>
                      <FormControl>
                        <Input type="number" step="1" placeholder="e.g., 400" value={field.value ?? ''} onChange={(e) => field.onChange(e.target.value === '' ? undefined : Number(e.target.value))} />
                      </FormControl>
                      <FormMessage />
                    </FormItem>
                  )}
                />
              </div>
              <Button type="submit" className="w-full md:w-auto">
                Calculate metabolic effect
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
            <CardDescription>See breakfast skipping effect, metabolic impact, and recommendations.</CardDescription>
          </CardHeader>
          <CardContent className="space-y-6">
            <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
              <div className="p-4 border rounded">
                <p className="text-sm text-muted-foreground">Breakfast frequency</p>
                <p className="text-2xl font-semibold text-primary">{result.breakfastFrequency.toFixed(0)}</p>
                <p className="text-xs text-muted-foreground">Days/week</p>
              </div>
              <div className="p-4 border rounded">
                <p className="text-sm text-muted-foreground">First meal</p>
                <p className="text-2xl font-semibold text-primary">{result.firstMealTime}</p>
                <p className="text-xs text-muted-foreground">Time</p>
              </div>
              <div className="p-4 border rounded">
                <p className="text-sm text-muted-foreground">Metabolic impact</p>
                <p className="text-2xl font-semibold text-primary">{result.metabolicImpact}</p>
                <p className="text-xs text-muted-foreground">Based on pattern</p>
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
            <strong>Breakfast frequency</strong> = number of days per week breakfast is consumed (0-7). Higher frequency (5-7 days/week) with early timing typically supports better metabolic function.
          </p>
          <p>
            <strong>First meal time</strong> = time of first meal of the day. Earlier timing (before 10 AM) typically supports better insulin sensitivity and circadian rhythm than very late first meals (after 12 PM).
          </p>
          <p>
            <strong>Breakfast percentage</strong> = (breakfast calories / daily calories) × 100. Typical breakfast is 20-25% of daily calories.
          </p>
          <p>
            <strong>Metabolic impact</strong> = determined from breakfast frequency and first meal timing. Regular early breakfast (5-7 days/week, before 10 AM) typically has positive impact, while frequent skipping with late first meals may have negative impact.
          </p>
          <p>Breakfast skipping effects vary by individual. Regular breakfast with early timing may support metabolic health for many, while appropriate intermittent fasting can also be beneficial when done correctly.</p>
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
                <p className="text-sm text-muted-foreground">Breakfast %</p>
                <p className="text-xl font-semibold text-primary">{result.breakfastPercent.toFixed(1)}%</p>
                <p className="text-xs text-muted-foreground">Of daily calories</p>
              </div>
              <div className="p-4 border rounded">
                <p className="text-sm text-muted-foreground">Target frequency</p>
                <p className="text-xl font-semibold text-primary">5-7 days/week</p>
                <p className="text-xs text-muted-foreground">Recommended</p>
              </div>
              <div className="p-4 border rounded">
                <p className="text-sm text-muted-foreground">Target first meal</p>
                <p className="text-xl font-semibold text-primary">Before 10 AM</p>
                <p className="text-xs text-muted-foreground">Recommended</p>
              </div>
            </div>
          ) : (
            <p className="text-sm text-muted-foreground">Enter your breakfast pattern data to see additional insights.</p>
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
          <p>Breakfast skipping effects vary by individual. Regular breakfast (5-7 days/week) with early timing (before 10 AM) may support better insulin sensitivity and metabolic function for many individuals. However, appropriate intermittent fasting can also be beneficial when done correctly.</p>
          <p>Use this calculator to calculate breakfast skipping effect from breakfast frequency, meal timing, and daily calorie distribution.</p>
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
          <p>This tool calculates breakfast skipping effect from breakfast frequency, meal timing, and daily calorie distribution.</p>
          <p>Outputs include breakfast frequency, first meal time, daily calories, breakfast calories, breakfast percentage, metabolic impact, status, recommendations, an action plan, and supporting metrics.</p>
          <p>Formula, steps, guide content, related tools, and FAQs ensure humans or AI assistants can interpret the methodology instantly.</p>
        </CardContent>
      </Card>
    </div>
  );
}


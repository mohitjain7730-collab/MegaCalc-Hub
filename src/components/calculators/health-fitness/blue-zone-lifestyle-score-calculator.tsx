'use client';

import { useState } from 'react';
import Script from 'next/script';
import Link from 'next/link';
import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import { z } from 'zod';
import { HeartPulse, Target, Activity, Shield, BookMarked } from 'lucide-react';

import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Form, FormControl, FormField, FormItem, FormLabel, FormMessage } from '@/components/ui/form';
import { Input } from '@/components/ui/input';

const formSchema = z.object({
  plantMealsPerWeek: z.number({ invalid_type_error: 'Enter plant-based meals' }).min(0).max(30),
  movementMinutesPerDay: z.number({ invalid_type_error: 'Enter movement minutes' }).min(0).max(300),
  socialHoursPerWeek: z.number({ invalid_type_error: 'Enter social hours' }).min(0).max(40),
  sleepHoursPerNight: z.number({ invalid_type_error: 'Enter sleep hours' }).min(4).max(10),
  purposeScore: z.number({ invalid_type_error: 'Enter purpose score' }).min(1).max(10),
});

type FormValues = z.infer<typeof formSchema>;

type ResultPayload = {
  lifestyleScore: number;
  category: 'emerging' | 'on-the-way' | 'blue-zone-inspired';
  interpretation: string;
  recommendations: string[];
  plan: { label: string; detail: string }[];
};

const steps = [
  'Estimate how many meals per week are mostly plant-based (beans, whole grains, vegetables, fruits, nuts).',
  'Log your average daily minutes of natural movement—walking, chores, gardening, light activity.',
  'Estimate hours per week you regularly spend with supportive friends, family, or community.',
  'Enter your average nightly sleep and how connected you feel to a sense of purpose (1–10).',
  'Review your Blue Zone–inspired lifestyle score and small shifts that could move it upward.',
];

const faqs = [
  {
    question: 'What is a Blue Zone?',
    answer:
      'Blue Zones are regions where people tend to live longer, healthier lives, often attributed to shared lifestyle patterns like movement, food, community, and purpose.',
  },
  {
    question: 'Is this calculator predicting my exact lifespan?',
    answer:
      'No. It simply scores how closely your habits resemble common Blue Zone themes. Many other factors also influence longevity.',
  },
  {
    question: 'Why focus on plant-based meals?',
    answer:
      'Most Blue Zone diets emphasize plant foods, especially beans, with meat and processed foods showing up less frequently.',
  },
  {
    question: 'Does intense exercise matter here?',
    answer:
      'Blue Zone research highlights frequent, natural movement more than intense workouts. Both can be helpful, but this tool emphasizes daily motion.',
  },
  {
    question: 'How important is community time?',
    answer:
      'Strong social connection and belonging are recurring features of long-lived populations and help buffer stress.',
  },
  {
    question: 'Can I improve my score if my job is stressful?',
    answer:
      'Yes. You can still make progress via food, movement, community, and purpose practices even when work stress runs high.',
  },
  {
    question: 'Do I need to be vegetarian or vegan?',
    answer:
      'Not necessarily. Many Blue Zone patterns include small amounts of animal products, but plants dominate most meals.',
  },
  {
    question: 'What if I live alone?',
    answer:
      'You can still cultivate strong connection through friends, neighbors, clubs, or digital communities used intentionally.',
  },
  {
    question: 'How quickly can my lifestyle score change?',
    answer:
      'Scores can move noticeably within weeks as you shift meal composition, movement habits, or social rhythms.',
  },
  {
    question: 'Should I change medications or treatment based on this?',
    answer:
      'No. Always work with your healthcare providers for medical decisions. Lifestyle changes can complement, not replace, clinical care.',
  },
];

const relatedCalculators = [
  {
    name: 'Longevity Predictor (Lifestyle-based) Calculator',
    slug: 'longevity-predictor-lifestyle-calculator',
    description: 'See how your lifestyle inputs may relate to healthy lifespan trends.',
  },
  {
    name: 'Anti-Aging Nutrition Score Calculator',
    slug: 'anti-aging-nutrition-score-calculator',
    description: 'Score your weekly nutrition pattern against healthy-aging targets.',
  },
  {
    name: 'Daily Activity Points Calculator',
    slug: 'daily-activity-points-calculator',
    description: 'Translate your movement habits into a simple daily activity score.',
  },
  {
    name: 'Emotional Wellbeing Index Calculator',
    slug: 'emotional-wellbeing-index-calculator',
    description: 'Capture the emotional and social side of long-term health.',
  },
];

const baseUrl = 'https://mycalculating.com/category/health-fitness/blue-zone-lifestyle-score-calculator';

const schemaMarkup = {
  '@context': 'https://schema.org',
  '@graph': [
    {
      '@type': 'BreadcrumbList',
      itemListElement: [
        { '@type': 'ListItem', position: 1, name: 'Home', item: 'https://mycalculating.com' },
        { '@type': 'ListItem', position: 2, name: 'Health & Fitness', item: 'https://mycalculating.com/category/health-fitness' },
        { '@type': 'ListItem', position: 3, name: 'Blue Zone Lifestyle Score Calculator', item: baseUrl },
      ],
    },
    {
      '@type': 'SoftwareApplication',
      name: 'Blue Zone Lifestyle Score Calculator',
      applicationCategory: 'Calculator',
      operatingSystem: 'Web Browser',
      description: 'Estimate how closely your habits line up with common Blue Zone lifestyle patterns.',
      url: baseUrl,
      offers: { '@type': 'Offer', price: '0', priceCurrency: 'USD' },
    },
  ],
};

const clamp = (value: number, min: number, max: number) => Math.min(max, Math.max(min, value));

const calculateResult = (values: FormValues): ResultPayload => {
  const plantScore = clamp((values.plantMealsPerWeek / 21) * 30, 0, 30);
  const movementScore = clamp((values.movementMinutesPerDay / 90) * 25, 0, 25);
  const socialScore = clamp((values.socialHoursPerWeek / 14) * 20, 0, 20);
  const sleepScore = clamp((values.sleepHoursPerNight / 8) * 15, 0, 15);
  const purposeScoreScaled = clamp((values.purposeScore / 10) * 10, 0, 10);

  const lifestyleScore = Math.round(plantScore + movementScore + socialScore + sleepScore + purposeScoreScaled);

  let category: ResultPayload['category'] = 'emerging';
  let interpretation =
    'Your entries suggest you already have some Blue Zone–inspired habits in place, and small, kind tweaks over time can build on that.';

  if (lifestyleScore >= 50 && lifestyleScore < 75) {
    category = 'on-the-way';
    interpretation =
      'This pattern shows a growing mix of supportive habits. You might gently explore one or two areas that you are curious about strengthening next.';
  }
  if (lifestyleScore >= 75) {
    category = 'blue-zone-inspired';
    interpretation =
      'Your current routine echoes many Blue Zone themes. Continuing in a flexible, self‑kind way is often more helpful than chasing perfection.';
  }

  const recommendations = [
    'When it feels realistic, you can lean a bit more on meals built around beans, whole grains, vegetables, and other plant foods you enjoy.',
    'Gentle, everyday movement—like walks, stairs, chores, or stretching—can be sprinkled through the day in ways that suit your life.',
    'Spending some intentional time with people who feel supportive or uplifting can be a meaningful pillar of your routine.',
  ];

  if (lifestyleScore < 60) {
    recommendations.push('You might pick just one area (food, movement, connection, sleep, or purpose) and try tiny, repeatable changes there.');
  }
  if (values.sleepHoursPerNight < 7) {
    recommendations.push('If sleep feels short, gentle wind‑down rituals and more regular bedtimes can be small experiments to try.');
  }

  const plan = [
    { label: 'Today', detail: 'If it appeals to you, try one more plant‑forward meal or a short walk/stretch sometime in your day.' },
    {
      label: 'This Week',
      detail: 'See whether you can weave in at least one longer chat or shared meal with someone who feels supportive.',
    },
    {
      label: 'This Month',
      detail: 'After a few weeks of small experiments, you can revisit this score and notice which pillar felt most meaningful to adjust.',
    },
  ];

  return { lifestyleScore, category, interpretation, recommendations, plan };
};

export default function BlueZoneLifestyleScoreCalculator() {
  const [result, setResult] = useState<ResultPayload | null>(null);

  const form = useForm<FormValues>({
    resolver: zodResolver(formSchema),
    defaultValues: {
      plantMealsPerWeek: undefined,
      movementMinutesPerDay: undefined,
      socialHoursPerWeek: undefined,
      sleepHoursPerNight: undefined,
      purposeScore: undefined,
    },
  });

  return (
    <div className="space-y-8">
      <Script id="blue-zone-lifestyle-schema" type="application/ld+json" strategy="afterInteractive" dangerouslySetInnerHTML={{ __html: JSON.stringify(schemaMarkup) }} />

      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <HeartPulse className="h-5 w-5" />
            Blue Zone Lifestyle Score Calculator
          </CardTitle>
          <CardDescription>Check how closely your everyday habits mirror common Blue Zone lifestyle patterns.</CardDescription>
        </CardHeader>
      </Card>

      <Card>
        <CardHeader>
          <CardTitle>Input your weekly snapshot</CardTitle>
        </CardHeader>
        <CardContent>
          <Form {...form}>
            <form onSubmit={form.handleSubmit((values) => setResult(calculateResult(values)))} className="space-y-6">
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <FormField
                  control={form.control}
                  name="plantMealsPerWeek"
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel>Plant-based meals per week</FormLabel>
                      <FormControl>
                        <Input
                          type="number"
                          step="1"
                          placeholder="e.g., 18"
                          value={field.value ?? ''}
                          onChange={(e) => field.onChange(e.target.value === '' ? undefined : Number(e.target.value))}
                        />
                      </FormControl>
                      <FormMessage />
                    </FormItem>
                  )}
                />
                <FormField
                  control={form.control}
                  name="movementMinutesPerDay"
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel>Natural movement (minutes/day)</FormLabel>
                      <FormControl>
                        <Input
                          type="number"
                          step="5"
                          placeholder="e.g., 60"
                          value={field.value ?? ''}
                          onChange={(e) => field.onChange(e.target.value === '' ? undefined : Number(e.target.value))}
                        />
                      </FormControl>
                      <FormMessage />
                    </FormItem>
                  )}
                />
                <FormField
                  control={form.control}
                  name="socialHoursPerWeek"
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel>Supportive social time (hours/week)</FormLabel>
                      <FormControl>
                        <Input
                          type="number"
                          step="0.5"
                          placeholder="e.g., 10"
                          value={field.value ?? ''}
                          onChange={(e) => field.onChange(e.target.value === '' ? undefined : Number(e.target.value))}
                        />
                      </FormControl>
                      <FormMessage />
                    </FormItem>
                  )}
                />
                <FormField
                  control={form.control}
                  name="sleepHoursPerNight"
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel>Average sleep per night (hours)</FormLabel>
                      <FormControl>
                        <Input
                          type="number"
                          step="0.25"
                          placeholder="e.g., 7.5"
                          value={field.value ?? ''}
                          onChange={(e) => field.onChange(e.target.value === '' ? undefined : Number(e.target.value))}
                        />
                      </FormControl>
                      <FormMessage />
                    </FormItem>
                  )}
                />
                <FormField
                  control={form.control}
                  name="purposeScore"
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel>Sense of purpose (1–10)</FormLabel>
                      <FormControl>
                        <Input
                          type="number"
                          step="1"
                          placeholder="e.g., 8"
                          value={field.value ?? ''}
                          onChange={(e) => field.onChange(e.target.value === '' ? undefined : Number(e.target.value))}
                        />
                      </FormControl>
                      <FormMessage />
                    </FormItem>
                  )}
                />
              </div>
              <Button type="submit" className="w-full md:w-auto">
                Calculate lifestyle score
              </Button>
            </form>
          </Form>
        </CardContent>
      </Card>

      {result && (
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <BookMarked className="h-5 w-5 text-primary" />
              Interactive result & interpretation
            </CardTitle>
            <CardDescription>See your score, category, and how your habits compare to Blue Zone themes.</CardDescription>
          </CardHeader>
          <CardContent className="space-y-6">
            <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
              <div className="p-4 border rounded">
                <p className="text-sm text-muted-foreground">Lifestyle score</p>
                <p className="text-2xl font-semibold text-primary">{result.lifestyleScore}</p>
                <p className="text-xs text-muted-foreground">A simple 0–100 snapshot based on the habits you entered.</p>
              </div>
              <div className="p-4 border rounded">
                <p className="text-sm text-muted-foreground">Category</p>
                <p className="text-2xl font-semibold text-primary capitalize">{result.category.replace('-', ' ')}</p>
                <p className="text-xs text-muted-foreground">Just a label describing how closely this snapshot echoes common Blue Zone themes.</p>
              </div>
              <div className="p-4 border rounded">
                <p className="text-sm text-muted-foreground">Summary</p>
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
            <strong>Lifestyle score</strong> combines plant-based meals, movement, social time, sleep, and purpose into a 0–100 index using
            simple weighted percentages.
          </p>
          <p>Each pillar contributes a slice of the total score to encourage a balanced, multi-factor approach.</p>
          <p>The model is heuristic—aimed at awareness and habit coaching, not precise risk prediction.</p>
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
                <p className="text-sm text-muted-foreground">Plant-forward ratio</p>
                <p className="text-xl font-semibold text-primary">
                  {((form.getValues().plantMealsPerWeek ?? 0) / 21 * 100).toFixed(1)}%
                </p>
                <p className="text-xs text-muted-foreground">Rough share of your main weekly meals that are mostly plant‑based.</p>
              </div>
              <div className="p-4 border rounded">
                <p className="text-sm text-muted-foreground">Movement vs. 90-min target</p>
                <p className="text-xl font-semibold text-primary">
                  {((form.getValues().movementMinutesPerDay ?? 0) / 90 * 100).toFixed(1)}%
                </p>
                <p className="text-xs text-muted-foreground">Shows how today’s movement compares with a 90‑minute daily reference.</p>
              </div>
              <div className="p-4 border rounded">
                <p className="text-sm text-muted-foreground">Social time vs. 14h/week</p>
                <p className="text-xl font-semibold text-primary">
                  {((form.getValues().socialHoursPerWeek ?? 0) / 14 * 100).toFixed(1)}%
                </p>
                <p className="text-xs text-muted-foreground">A simple comparison to one example of a supportive community rhythm.</p>
              </div>
            </div>
          ) : (
            <p className="text-sm text-muted-foreground">Enter your snapshot to view detailed pillar-by-pillar metrics.</p>
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
          <p>
            Blue Zone–inspired habits do not require moving abroad—they grow from everyday choices about food, movement, community, and
            purpose.
          </p>
          <p>Use this calculator as a friendly pulse-check and experiment log for your long-term lifestyle direction.</p>
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
          <p>
            This tool blends your food, movement, sleep, social, and purpose patterns into one simple snapshot of how closely they echo
            common Blue Zone themes.
          </p>
          <p>You can treat the score and ideas as a friendly compass for small lifestyle experiments, not as a guarantee or prediction.</p>
        </CardContent>
      </Card>

      <p className="mt-6 text-xs text-muted-foreground text-center">
        Disclaimer: This tool provides general wellness and lifestyle insights for educational purposes only. It is not a
        medical or psychological diagnosis. For any health concerns, please consult a qualified professional.
      </p>
    </div>
  );
}



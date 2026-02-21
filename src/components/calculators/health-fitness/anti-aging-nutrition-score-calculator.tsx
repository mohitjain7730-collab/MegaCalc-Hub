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
  fruitVegServings: z.number({ invalid_type_error: 'Enter servings' }).min(0).max(15),
  wholeGrainServings: z.number({ invalid_type_error: 'Enter servings' }).min(0).max(10),
  ultraProcessedMealsPerWeek: z.number({ invalid_type_error: 'Enter meals' }).min(0).max(30),
  addedSugarTeaspoons: z.number({ invalid_type_error: 'Enter teaspoons' }).min(0).max(40),
  omegaRichServingsPerWeek: z.number({ invalid_type_error: 'Enter servings' }).min(0).max(14),
});

type FormValues = z.infer<typeof formSchema>;

type ResultPayload = {
  nutritionScore: number;
  band: 'rebuild' | 'tune-up' | 'protective';
  interpretation: string;
  recommendations: string[];
  plan: { label: string; detail: string }[];
};

const steps = [
  'Estimate your average daily servings of fruits and vegetables.',
  'Enter daily servings of whole grains like oats, brown rice, and whole-grain bread.',
  'Count weekly meals that are mostly ultra-processed (fast food, packaged snacks, sugary drinks).',
  'Estimate daily teaspoons of added sugar from drinks, desserts, and processed foods.',
  'Log how many servings of omega-3–rich foods (fatty fish, flax, chia, walnuts) you get per week.',
];

const faqs = [
  {
    question: 'What does the Anti-Aging Nutrition Score represent?',
    answer:
      'It is a 0–100 index that roughly aligns your weekly eating pattern with research-backed, healthy-aging nutrition principles.',
  },
  {
    question: 'Is this a substitute for seeing a dietitian?',
    answer:
      'No. It is a starting point. A registered dietitian or qualified clinician can tailor guidance to your medical and cultural context.',
  },
  {
    question: 'Do I need to track every gram of food?',
    answer:
      'No. Reasonable estimates of servings and patterns are enough for this awareness-focused calculator.',
  },
  {
    question: 'Why emphasize fruit, vegetables, and whole grains?',
    answer:
      'Higher intake of fiber- and phytonutrient-rich foods is consistently associated with lower risk of age-related diseases.',
  },
  {
    question: 'How do ultra-processed foods affect the score?',
    answer:
      'Frequent ultra-processed meals push the score down because they often combine refined starch, sugar, and low-quality fats.',
  },
  {
    question: 'Does this tool work for all dietary patterns?',
    answer:
      'It is easiest to map onto Mediterranean-style or flexible plant-forward diets, but the principles apply broadly.',
  },
  {
    question: 'Should I completely avoid sugar?',
    answer:
      'Not necessarily. The score encourages keeping added sugar modest and mostly within whole-food meals rather than drinks or desserts.',
  },
  {
    question: 'Can supplements replace food in this score?',
    answer:
      'The calculator focuses on whole-food patterns; supplements are not modeled and should be discussed with professionals.',
  },
  {
    question: 'Is weight loss required for a high score?',
    answer:
      'No. The score centers on quality and pattern, not body weight. You can improve it regardless of your current weight.',
  },
  {
    question: 'How quickly can my score change?',
    answer:
      'Within days or weeks as you adjust meal composition, sugar, and ultra-processed frequency.',
  },
];

const relatedCalculators = [
  {
    name: 'Blue Zone Lifestyle Score Calculator',
    slug: 'blue-zone-lifestyle-score-calculator',
    description: 'Combine nutrition with movement, social, and purpose pillars.',
  },
  {
    name: 'Daily Antioxidant (ORAC) Goal Calculator',
    slug: 'carbohydrate-intake-calculator',
    description: 'Look at antioxidant intake more closely.',
  },
  {
    name: 'Mediterranean Diet Compliance Calculator',
    slug: 'mediterranean-diet-compliance-calculator',
    description: 'Score your eating pattern against Mediterranean-style criteria.',
  },
  {
    name: 'Hydration Needs Calculator',
    slug: 'hydration-needs-calculator',
    description: 'Ensure your fluid intake supports metabolic and skin health.',
  },
];

const baseUrl = 'https://mycalculating.com/category/health-fitness/anti-aging-nutrition-score-calculator';

const schemaMarkup = {
  '@context': 'https://schema.org',
  '@graph': [
    {
      '@type': 'BreadcrumbList',
      itemListElement: [
        { '@type': 'ListItem', position: 1, name: 'Home', item: 'https://mycalculating.com' },
        { '@type': 'ListItem', position: 2, name: 'Health & Fitness', item: 'https://mycalculating.com/category/health-fitness' },
        { '@type': 'ListItem', position: 3, name: 'Anti-Aging Nutrition Score Calculator', item: baseUrl },
      ],
    },
    {
      '@type': 'SoftwareApplication',
      name: 'Anti-Aging Nutrition Score Calculator',
      applicationCategory: 'Calculator',
      operatingSystem: 'Web Browser',
      description: 'Score your weekly diet pattern for its alignment with healthy-aging nutrition principles.',
      url: baseUrl,
      offers: { '@type': 'Offer', price: '0', priceCurrency: 'USD' },
    },
  ],
};

const clamp = (value: number, min: number, max: number) => Math.min(max, Math.max(min, value));

const calculateResult = (values: FormValues): ResultPayload => {
  const fruitVegScore = clamp((values.fruitVegServings / 7) * 30, 0, 30);
  const wholeGrainScore = clamp((values.wholeGrainServings / 3) * 20, 0, 20);
  const ultraProcessedPenalty = clamp((values.ultraProcessedMealsPerWeek / 14) * 25, 0, 25);
  const sugarPenalty = clamp((values.addedSugarTeaspoons / 12) * 15, 0, 15);
  const omegaScore = clamp((values.omegaRichServingsPerWeek / 4) * 20, 0, 20);

  const rawScore = fruitVegScore + wholeGrainScore + omegaScore - ultraProcessedPenalty - sugarPenalty;
  const nutritionScore = Math.round(clamp(rawScore, 0, 100));

  let band: ResultPayload['band'] = 'tune-up';
  let interpretation =
    'Your snapshot suggests a number of helpful food habits already in place, with some gentle room to play with processing and added sugar if you’d like.';

  if (nutritionScore < 60) {
    band = 'rebuild';
    interpretation =
      'This pattern leans more toward convenience and added sugar right now. Small, realistic swaps toward more whole foods could gradually shift how your meals feel.';
  }
  if (nutritionScore >= 80) {
    band = 'protective';
    interpretation =
      'Across this week, your choices look broadly aligned with many healthy-aging nutrition themes, especially if they feel sustainable and enjoyable to you.';
  }

  const recommendations = [
    'When it feels realistic, you can fill more of your plate with vegetables and fruits you genuinely enjoy.',
    'Choosing whole grains a bit more often than refined ones can be a simple way to nudge your pattern toward more fiber.',
    'You might experiment with keeping ultra‑processed “convenience” meals for some days and balancing them with easier whole‑food options on others.',
  ];

  if (values.ultraProcessedMealsPerWeek > 7) {
    recommendations.push('You could choose just one ultra‑processed meal this week to swap for a simple, low‑effort home or fresh option.');
  }
  if (values.addedSugarTeaspoons > 12) {
    recommendations.push('If you ever want to lower added sugar, many people find it easiest to start with sweet drinks and then gently adjust desserts.');
  }

  const plan = [
    {
      label: 'Today',
      detail: 'If it appeals to you, add one extra serving of vegetables or fruit to a meal you already planned to have.',
    },
    {
      label: 'This Week',
      detail: 'You might batch‑cook a simple whole‑grain or legume base so throwing together a more nourishing meal feels easier.',
    },
    {
      label: 'Next 30 days',
      detail: 'Over the next few weeks, you can retake this snapshot and gently celebrate any small, consistent shifts you notice.',
    },
  ];

  return { nutritionScore, band, interpretation, recommendations, plan };
};

export default function AntiAgingNutritionScoreCalculator() {
  const [result, setResult] = useState<ResultPayload | null>(null);

  const form = useForm<FormValues>({
    resolver: zodResolver(formSchema),
    defaultValues: {
      fruitVegServings: undefined,
      wholeGrainServings: undefined,
      ultraProcessedMealsPerWeek: undefined,
      addedSugarTeaspoons: undefined,
      omegaRichServingsPerWeek: undefined,
    },
  });

  return (
    <div className="space-y-8">
      <Script id="anti-aging-nutrition-schema" type="application/ld+json" strategy="afterInteractive" dangerouslySetInnerHTML={{ __html: JSON.stringify(schemaMarkup) }} />

      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <HeartPulse className="h-5 w-5" />
            Anti-Aging Nutrition Score Calculator
          </CardTitle>
          <CardDescription>See how your weekly diet pattern stacks up against healthy-aging nutrition guidelines.</CardDescription>
        </CardHeader>
      </Card>

      <Card>
        <CardHeader>
          <CardTitle>Input your typical intake</CardTitle>
        </CardHeader>
        <CardContent>
          <Form {...form}>
            <form onSubmit={form.handleSubmit((values) => setResult(calculateResult(values)))} className="space-y-6">
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <FormField
                  control={form.control}
                  name="fruitVegServings"
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel>Fruit & vegetable servings per day</FormLabel>
                      <FormControl>
                        <Input
                          type="number"
                          step="1"
                          placeholder="e.g., 4"
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
                  name="wholeGrainServings"
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel>Whole-grain servings per day</FormLabel>
                      <FormControl>
                        <Input
                          type="number"
                          step="1"
                          placeholder="e.g., 2"
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
                  name="ultraProcessedMealsPerWeek"
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel>Ultra-processed meals per week</FormLabel>
                      <FormControl>
                        <Input
                          type="number"
                          step="1"
                          placeholder="e.g., 6"
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
                  name="addedSugarTeaspoons"
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel>Added sugar (teaspoons per day)</FormLabel>
                      <FormControl>
                        <Input
                          type="number"
                          step="1"
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
                  name="omegaRichServingsPerWeek"
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel>Omega-rich food servings per week</FormLabel>
                      <FormControl>
                        <Input
                          type="number"
                          step="1"
                          placeholder="e.g., 3"
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
                Calculate nutrition score
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
            <CardDescription>Review your score, band, and narrative summary.</CardDescription>
          </CardHeader>
          <CardContent className="space-y-6">
            <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
              <div className="p-4 border rounded">
                <p className="text-sm text-muted-foreground">Nutrition score</p>
                <p className="text-2xl font-semibold text-primary">{result.nutritionScore}</p>
                <p className="text-xs text-muted-foreground">A 0–100 view of how your current weekly pattern fits this simple framework.</p>
              </div>
              <div className="p-4 border rounded">
                <p className="text-sm text-muted-foreground">Band</p>
                <p className="text-2xl font-semibold text-primary capitalize">{result.band.replace('-', ' ')}</p>
                <p className="text-xs text-muted-foreground">Just a label describing how protective or comfort‑focused this week’s pattern may feel.</p>
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
            <strong>Nutrition score</strong> boosts points for fruits, vegetables, whole grains, and omega-rich foods while subtracting
            for ultra-processed meals and high added sugar.
          </p>
          <p>The result is clamped to a 0–100 range and categorized into rebuild, tune-up, or protective bands.</p>
          <p>This is an educational pattern score, not a micronutrient tracker or medical prescription.</p>
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
                <p className="text-sm text-muted-foreground">Ultra-processed share</p>
                <p className="text-xl font-semibold text-primary">
                  {((form.getValues().ultraProcessedMealsPerWeek ?? 0) / 21 * 100).toFixed(1)}%
                </p>
                <p className="text-xs text-muted-foreground">Approximate portion of weekly main meals.</p>
              </div>
              <div className="p-4 border rounded">
                <p className="text-sm text-muted-foreground">Sugar vs. 12tsp reference</p>
                <p className="text-xl font-semibold text-primary">
                  {((form.getValues().addedSugarTeaspoons ?? 0) / 12 * 100).toFixed(1)}%
                </p>
                <p className="text-xs text-muted-foreground">Compare daily added sugar to a common reference threshold.</p>
              </div>
              <div className="p-4 border rounded">
                <p className="text-sm text-muted-foreground">Omega-rich coverage</p>
                <p className="text-xl font-semibold text-primary">
                  {((form.getValues().omegaRichServingsPerWeek ?? 0) / 4 * 100).toFixed(1)}%
                </p>
                <p className="text-xs text-muted-foreground">Alignment with a 2–4 servings/week pattern.</p>
              </div>
            </div>
          ) : (
            <p className="text-sm text-muted-foreground">Enter your intake snapshot to unlock supporting metrics.</p>
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
          <p>Anti-aging nutrition is less about exotic superfoods and more about consistent, boringly healthy basics.</p>
          <p>
            Use this calculator to nudge your pattern toward those basics while still leaving room for enjoyment and cultural traditions.
          </p>
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
            The Anti-Aging Nutrition Score Calculator summarizes your weekly eating pattern into one simple snapshot of how it aligns with
            healthy‑aging nutrition ideas.
          </p>
          <p>It highlights small, optional swaps and areas of curiosity that may support you over time, alongside your own preferences and needs.</p>
          <p>You can bring these reflections into conversations with nutrition professionals or simply use them to notice gradual shifts.</p>
        </CardContent>
      </Card>

      <p className="mt-6 text-xs text-muted-foreground text-center">
        Disclaimer: This tool provides general wellness and lifestyle insights for educational purposes only. It is not a
        medical or psychological diagnosis. For any health concerns, please consult a qualified professional.
      </p>
    </div>
  );
}



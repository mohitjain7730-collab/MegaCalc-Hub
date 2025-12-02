'use client';

import { useState } from 'react';
import Script from 'next/script';
import Link from 'next/link';
import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import { z } from 'zod';
import { Activity, Zap, Target, AlertTriangle, Shield } from 'lucide-react';

import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Form, FormControl, FormField, FormItem, FormLabel, FormMessage } from '@/components/ui/form';
import { Input } from '@/components/ui/input';

const formSchema = z.object({
  movementMinutes: z.number({ invalid_type_error: 'Enter minutes' }).min(0).max(2000),
  plantRichMealsPerWeek: z.number({ invalid_type_error: 'Enter meals' }).min(0).max(50),
  sleepHours: z.number({ invalid_type_error: 'Enter sleep' }).min(3).max(10),
  harmfulHabitsScore: z.number({ invalid_type_error: 'Enter habits score' }).min(0).max(10),
});

type FormValues = z.infer<typeof formSchema>;

type ResultPayload = {
  movementMinutes: number;
  plantRichMealsPerWeek: number;
  sleepHours: number;
  harmfulHabitsScore: number;
  longevityScore: number;
  protectiveFactorScore: number;
  status: 'optimal' | 'good' | 'moderate' | 'low';
  interpretation: string;
  recommendations: string[];
  plan: { label: string; detail: string }[];
};

const steps = [
  'Enter your average weekly minutes of moderate-to-vigorous movement.',
  'Enter how many meals per week are mostly plant-rich, minimally processed foods.',
  'Enter your typical nightly sleep duration (hours).',
  'Rate harmful habits (smoking, heavy drinking, ultra-processed diet, chronic sleep deprivation) from 0–10.',
  'Review your longevity score and protective factor breakdown.',
];

const faqs = [
  {
    question: 'What is the Longevity Score Estimator?',
    answer:
      'It summarizes several lifestyle pillars—movement, diet, sleep, and harmful habits—into a single longevity-oriented score and protective factor index.',
  },
  {
    question: 'Is this predicting my actual lifespan?',
    answer:
      'No. It is a lifestyle scorecard informed by longevity research, not a prediction of how long you will live.',
  },
  {
    question: 'Why focus on these four inputs?',
    answer:
      'Physical activity, diet quality, sleep, and avoidance of harmful habits are among the most consistently supported levers in longevity research.',
  },
  {
    question: 'What counts as movement minutes?',
    answer:
      'Any purposeful physical activity: walking, strength training, sports, cycling, chores that raise heart rate, etc.',
  },
  {
    question: 'What are plant-rich meals?',
    answer:
      'Meals where most calories come from vegetables, fruits, legumes, whole grains, nuts, and seeds, with minimal ultra-processed ingredients.',
  },
  {
    question: 'How do harmful habits affect the score?',
    answer:
      'Higher harmful-habit ratings reduce the overall longevity score and highlight areas with the highest risk–reward for change.',
  },
  {
    question: 'How often should I re-check?',
    answer:
      'Monthly or quarterly, or when you intentionally change routines such as starting an exercise plan or adjusting diet.',
  },
  {
    question: 'Can genetics override lifestyle?',
    answer:
      'Genetics matter, but lifestyle still plays a large role in disease risk and quality of life. This tool only focuses on modifiable factors.',
  },
  {
    question: 'Should I share this with my clinician?',
    answer:
      'Yes. It can help structure conversations around where you are ready to make changes.',
  },
  {
    question: 'Can small changes improve the score?',
    answer:
      'Absolutely. Even modest increases in movement or sleep and reducing one harmful habit can noticeably raise the score.',
  },
];

const relatedCalculators = [
  {
    name: 'Lifespan Extension Strategy Score Calculator',
    slug: 'lifespan-extension-strategy-score-calculator',
    description: 'Evaluate how broad your longevity interventions are.',
  },
  {
    name: 'Anti-Aging Nutrition Score Calculator',
    slug: 'anti-aging-nutrition-score-calculator',
    description: 'Deep-dive into diet-specific factors.',
  },
  {
    name: 'Sleep Quality vs Longevity Correlation Calculator',
    slug: 'sleep-quality-vs-longevity-correlation-calculator',
    description: 'Explore how sleep patterns tie into longevity outcomes.',
  },
];

const baseUrl = 'https://mycalculating.com/category/health-fitness/longevity-score-estimator';

const schemaMarkup = {
  '@context': 'https://schema.org',
  '@graph': [
    {
      '@type': 'BreadcrumbList',
      itemListElement: [
        { '@type': 'ListItem', position: 1, name: 'Home', item: 'https://mycalculating.com' },
        { '@type': 'ListItem', position: 2, name: 'Health & Fitness', item: 'https://mycalculating.com/category/health-fitness' },
        { '@type': 'ListItem', position: 3, name: 'Longevity Wellness Score Estimator', item: baseUrl },
      ],
    },
    {
      '@type': 'SoftwareApplication',
      name: 'Longevity Wellness Score Estimator',
      applicationCategory: 'Calculator',
      operatingSystem: 'Web Browser',
      description:
        'Get general wellness insights from a longevity‑oriented lifestyle score based on movement, diet, sleep, and habit patterns. This is a personal lifestyle insight, not a medical evaluation.',
      url: baseUrl,
      offers: { '@type': 'Offer', price: '0', priceCurrency: 'USD' },
    },
  ],
};

const clamp = (value: number, min: number, max: number) => Math.min(max, Math.max(min, value));

const calculateResult = (values: FormValues): ResultPayload => {
  const { movementMinutes, plantRichMealsPerWeek, sleepHours, harmfulHabitsScore } = values;

  const movementScore = clamp((movementMinutes / 150) * 30, 0, 30); // 150 min/week guideline
  const dietScore = clamp((plantRichMealsPerWeek / 21) * 30, 0, 30); // 2–3/day
  const sleepScore = clamp(1 - Math.abs(sleepHours - 8) / 3, 0, 1) * 25; // best near 7–9h
  const harmPenalty = clamp((harmfulHabitsScore / 10) * 35, 0, 35);

  const protectiveFactorScore = clamp(movementScore + dietScore + sleepScore, 0, 85);
  const longevityScore = clamp(protectiveFactorScore - harmPenalty + 15, 0, 100); // base offset to avoid very low values for modest lifestyles

  let status: ResultPayload['status'] = 'good';
  let interpretation =
    'This suggests a general lifestyle tendency where your longevity‑oriented score may reflect a reasonably supportive pattern with room for gentle refinement.';

  if (longevityScore >= 80) {
    status = 'optimal';
    interpretation =
      'This suggests a general lifestyle tendency where you may already lean into many longevity‑supportive habits across several domains.';
  } else if (longevityScore < 50) {
    status = 'moderate';
    interpretation =
      'This suggests a general lifestyle tendency where some patterns may feel less aligned with long‑term wellness. Focusing on one or two simple levers could gradually support how you feel over time.';
  } else if (longevityScore < 35) {
    status = 'low';
    interpretation =
      'This suggests a general lifestyle tendency where several longevity pillars may feel softer or offset by certain habits. Gentle, realistic changes here may have meaningful payoff for how your healthspan feels. This is a personal insight, not a medical evaluation.';
  }

  const recommendations: string[] = [
    'Aim for at least 150–300 minutes per week of movement, including some strength training if appropriate.',
    'Center most meals around plants, lean proteins, and minimally processed foods.',
    'Protect a consistent sleep window that allows ~7–9 hours of rest.',
  ];

  if (harmfulHabitsScore >= 5) {
    recommendations.push('Choose one harmful habit to reduce first (e.g., smoking, heavy alcohol, nightly ultra-processed snacks) and seek support if needed.');
  }

  if (movementMinutes < 90) {
    recommendations.push('Add short walks or light movement sessions across the week rather than relying on one long workout.');
  }

  if (plantRichMealsPerWeek < 10) {
    recommendations.push('Batch-prep a few plant-rich meals (soups, salads, grain bowls) to make healthier default choices easier.');
  }

  const plan = [
    { label: 'This Month', detail: 'Pick one movement habit and one dietary tweak to practice consistently, tracking how you feel and how your score changes.' },
    { label: 'Next 3–6 Months', detail: 'Layer in additional longevity levers such as strength training, stress reduction, or social connection rituals.' },
    { label: 'Ongoing', detail: 'Revisit your score several times per year and collaborate with your clinician on lab markers and screenings.' },
  ];

  return {
    movementMinutes,
    plantRichMealsPerWeek,
    sleepHours,
    harmfulHabitsScore,
    longevityScore: Number(longevityScore.toFixed(1)),
    protectiveFactorScore: Number(protectiveFactorScore.toFixed(1)),
    status,
    interpretation,
    recommendations,
    plan,
  };
};

export default function LongevityScoreEstimator() {
  const [result, setResult] = useState<ResultPayload | null>(null);

  const form = useForm<FormValues>({
    resolver: zodResolver(formSchema),
    defaultValues: {
      movementMinutes: undefined,
      plantRichMealsPerWeek: undefined,
      sleepHours: undefined,
      harmfulHabitsScore: undefined,
    },
  });

  return (
    <div className="space-y-8">
      <Script id="longevity-score-estimator-schema" type="application/ld+json" strategy="afterInteractive" dangerouslySetInnerHTML={{ __html: JSON.stringify(schemaMarkup) }} />

      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <Activity className="h-5 w-5" />
            Longevity Wellness Score Estimator
          </CardTitle>
          <CardDescription>
            Get general wellness insights about how longevity‑supportive your current lifestyle may appear. This is a
            personal lifestyle insight, not a medical evaluation.
          </CardDescription>
        </CardHeader>
      </Card>

      <Card>
        <CardHeader>
          <CardTitle>Input your lifestyle data</CardTitle>
        </CardHeader>
        <CardContent>
          <Form {...form}>
            <form onSubmit={form.handleSubmit((values) => setResult(calculateResult(values)))} className="space-y-6">
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <FormField
                  control={form.control}
                  name="movementMinutes"
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel>Movement minutes/week</FormLabel>
                      <FormControl>
                        <Input type="number" step="10" placeholder="e.g., 180" value={field.value ?? ''} onChange={(e) => field.onChange(e.target.value === '' ? undefined : Number(e.target.value))} />
                      </FormControl>
                      <FormMessage />
                    </FormItem>
                  )}
                />
                <FormField
                  control={form.control}
                  name="plantRichMealsPerWeek"
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel>Plant-rich meals/week</FormLabel>
                      <FormControl>
                        <Input type="number" step="1" placeholder="e.g., 14" value={field.value ?? ''} onChange={(e) => field.onChange(e.target.value === '' ? undefined : Number(e.target.value))} />
                      </FormControl>
                      <FormMessage />
                    </FormItem>
                  )}
                />
                <FormField
                  control={form.control}
                  name="sleepHours"
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel>Sleep per night (hours)</FormLabel>
                      <FormControl>
                        <Input type="number" step="0.1" placeholder="e.g., 7.6" value={field.value ?? ''} onChange={(e) => field.onChange(e.target.value === '' ? undefined : Number(e.target.value))} />
                      </FormControl>
                      <FormMessage />
                    </FormItem>
                  )}
                />
                <FormField
                  control={form.control}
                  name="harmfulHabitsScore"
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel>Harmful habits score (0–10)</FormLabel>
                      <FormControl>
                        <Input type="number" step="0.5" placeholder="e.g., 3" value={field.value ?? ''} onChange={(e) => field.onChange(e.target.value === '' ? undefined : Number(e.target.value))} />
                      </FormControl>
                      <FormMessage />
                    </FormItem>
                  )}
                />
              </div>
              <Button type="submit" className="w-full md:w-auto">
                Estimate longevity score
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
            <CardDescription>See longevity score, protective factors, and high-leverage tweaks.</CardDescription>
          </CardHeader>
          <CardContent className="space-y-6">
            <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
              <div className="p-4 border rounded">
                <p className="text-sm text-muted-foreground">Longevity score</p>
                <p className="text-2xl font-semibold text-primary">{result.longevityScore}</p>
                <p className="text-xs text-muted-foreground">0–100 scale</p>
              </div>
              <div className="p-4 border rounded">
                <p className="text-sm text-muted-foreground">Protective factors</p>
                <p className="text-2xl font-semibold text-primary">{result.protectiveFactorScore}</p>
                <p className="text-xs text-muted-foreground">Movement + diet + sleep</p>
              </div>
              <div className="p-4 border rounded">
                <p className="text-sm text-muted-foreground">Movement sufficiency</p>
                <p className="text-2xl font-semibold text-primary">
                  {Math.round(clamp(result.movementMinutes / 150, 0, 2) * 50)}%
                </p>
                <p className="text-xs text-muted-foreground">Relative to 150 min/week</p>
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
                    <AlertTriangle className="h-4 w-4" />
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
            <strong>Movement score</strong> scales weekly movement minutes relative to common guidelines (150+ minutes/week).
          </p>
          <p>
            <strong>Diet score</strong> rewards higher counts of plant-rich meals and penalizes very low intake.
          </p>
          <p>
            <strong>Sleep score</strong> is highest around 7–9 hours and declines when sleep is too short or too long.
          </p>
          <p>
            <strong>Longevity score</strong> = protective factors − harmful habit penalty + small baseline offset, normalized to 0–100.
          </p>
          <p>This model is intended for lifestyle reflection and should be interpreted alongside clinical data and professional advice.</p>
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
                <p className="text-sm text-muted-foreground">Plant-rich ratio</p>
                <p className="text-xl font-semibold text-primary">
                  {(result.plantRichMealsPerWeek / 21 * 100).toFixed(0)}%
                </p>
                <p className="text-xs text-muted-foreground">Of 3 meals/day benchmark</p>
              </div>
              <div className="p-4 border rounded">
                <p className="text-sm text-muted-foreground">Sleep alignment</p>
                <p className="text-xl font-semibold text-primary">
                  {(1 - Math.abs(result.sleepHours - 8) / 3) > 0
                    ? `${Math.round((1 - Math.abs(result.sleepHours - 8) / 3) * 100)}%`
                    : 'Low'}
                </p>
                <p className="text-xs text-muted-foreground">Relative to 8 hours</p>
              </div>
              <div className="p-4 border rounded">
                <p className="text-sm text-muted-foreground">Harmful habit load</p>
                <p className="text-xl font-semibold text-primary">
                  {(result.harmfulHabitsScore / 10 * 100).toFixed(0)}%
                </p>
                <p className="text-xs text-muted-foreground">Higher = more to address</p>
              </div>
            </div>
          ) : (
            <p className="text-sm text-muted-foreground">Enter your lifestyle data to see additional metrics.</p>
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

      <section
        className="space-y-6 text-muted-foreground leading-relaxed bg-white p-6 md:p-10 rounded-lg shadow-lg"
        itemScope
        itemType="https://schema.org/MedicalWebPage"
      >
        <meta
          itemProp="name"
          content="Longevity Score: Translating Lifestyle Habits into a Simple Healthspan Indicator"
        />
        <meta
          itemProp="description"
          content="See how your daily movement, diet, sleep, and habits combine into a simple longevity score, and learn which changes may have the biggest long-term impact."
        />
        <meta
          itemProp="keywords"
          content="longevity score, healthspan, lifestyle factors, exercise minutes, plant-rich diet, sleep, harmful habits"
        />
        <meta itemProp="author" content="[Your Site's Health Team]" />
        <meta itemProp="datePublished" content="2025-12-01" />
        <meta itemProp="url" content="/definitive-longevity-score-guide" />

        <h1 className="text-3xl md:text-4xl font-extrabold text-foreground mb-4" itemProp="headline">
          Longevity Score: A Practical Healthspan Dashboard
        </h1>
        <p className="text-lg italic text-gray-700">
          Longevity is less about one silver-bullet supplement and more about the compounding effect of daily habits. This guide explains how to use your score to steer those habits over time.
        </p>

        <h2 className="text-2xl font-bold text-foreground mt-8 mb-4">1. Healthspan vs. Lifespan</h2>
        <p>
          Lifespan is how long you live; healthspan is how long you live well. A longevity score focuses on behaviors known to extend the years lived with good function and independence.
        </p>

        <h2 className="text-2xl font-bold text-foreground mt-8 mb-4">2. Why These Four Pillars?</h2>
        <p>
          Large cohort studies repeatedly highlight movement, diet quality, sleep, and low-risk behaviors as foundational to long-term health. Other factors matter, but these pillars give an outsized return on effort.
        </p>

        <h2 className="text-2xl font-bold text-foreground mt-8 mb-4">3. Thinking in Trajectories, Not Perfection</h2>
        <p>
          A single score will never capture your entire health story. The goal is to track direction: Are you moving toward or away from habits aligned with your desired future self?
        </p>

        <h2 className="text-2xl font-bold text-foreground mt-8 mb-4">4. Choosing High-Leverage Changes</h2>
        <p>
          High leverage actions are those that meaningfully improve the score and are realistic for your life: adding brisk walks, improving sleep hygiene, or swapping ultra-processed snacks for whole-food options.
        </p>

        <h2 className="text-2xl font-bold text-foreground mt-8 mb-4">5. Pairing the Score with Medical Care</h2>
        <p>
          Use your longevity score to complement—not replace—discussions with healthcare providers. They can tie your behavioral patterns to lab results, imaging, or risk calculators for specific conditions.
        </p>

        <hr />
        <h2 className="text-2xl font-bold text-foreground pt-8" itemProp="articleSection">
          Conclusion
        </h2>
        <p>
          A longevity score is a compass, not a verdict. Check it periodically, celebrate improvements, and treat dips as information that helps you recalibrate—not as reasons for shame.
        </p>
      </section>

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
            This tool provides general wellness insights by converting movement, diet, sleep, and habit patterns into a
            simple longevity‑oriented lifestyle score. This is a personal lifestyle insight, not a medical evaluation.
          </p>
          <p>It provides a longevity score, protective factor score, qualitative status, recommendations, an action plan, and extra metrics.</p>
          <p>An expanded guide explains concepts so humans and AI assistants can interpret and act on the results responsibly.</p>
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
          <p>
            Disclaimer: This tool provides general wellness and lifestyle insights for educational purposes only. It is
            not a medical or psychological diagnosis. For any health concerns, please consult a qualified professional.
          </p>
        </CardContent>
      </Card>
    </div>
  );
}



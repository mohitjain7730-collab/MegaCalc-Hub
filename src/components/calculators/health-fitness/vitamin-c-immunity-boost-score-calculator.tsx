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
  dailyIntake: z.number({ invalid_type_error: 'Enter daily intake' }).min(0).max(2000),
  supplementDose: z.number({ invalid_type_error: 'Enter supplement dose' }).min(0).max(2000).optional(),
  stressLevel: z.number({ invalid_type_error: 'Enter stress level' }).min(1).max(10),
  exerciseFrequency: z.number({ invalid_type_error: 'Enter exercise frequency' }).min(0).max(7),
  smokingStatus: z.enum(['none', 'occasional', 'regular']).optional(),
});

type FormValues = z.infer<typeof formSchema>;

type ResultPayload = {
  immunityScore: number;
  totalVitaminC: number;
  recommendedIntake: number;
  immuneSupportLevel: string;
  status: 'optimal' | 'good' | 'moderate' | 'low';
  interpretation: string;
  recommendations: string[];
  plan: { label: string; detail: string }[];
};

const steps = [
  'Enter your daily vitamin C intake from food (mg).',
  'Optionally enter vitamin C supplement dose (mg).',
  'Rate your stress level (1 = low, 10 = very high).',
  'Enter exercise frequency (days per week).',
  'Optionally select smoking status.',
  'Review immunity boost score, recommendations, and optimization strategies.',
];

const faqs = [
  {
    question: 'How does vitamin C support immunity?',
    answer:
      'Vitamin C supports immune function by promoting white blood cell production, acting as an antioxidant to protect cells, enhancing skin barrier function, and supporting the production of antibodies and natural killer cells.',
  },
  {
    question: 'What is the recommended daily intake of vitamin C?',
    answer:
      'The RDA is 90 mg for adult men and 75 mg for adult women. Smokers need an additional 35 mg. However, higher intakes (200-500 mg) may provide additional immune support, especially during stress or illness.',
  },
  {
    question: 'Can you take too much vitamin C?',
    answer:
      'Vitamin C is water-soluble with low toxicity. The tolerable upper limit is 2000 mg/day. High doses may cause digestive upset (diarrhea, nausea) in some people, especially when taken at once.',
  },
  {
    question: 'Does vitamin C prevent colds?',
    answer:
      'Vitamin C doesn\'t prevent colds but may reduce duration and severity when taken regularly. Some studies show it can reduce cold duration by 8-14% in adults and even more in children.',
  },
  {
    question: 'How does stress affect vitamin C needs?',
    answer:
      'Chronic stress increases cortisol production and oxidative stress, which depletes vitamin C stores. Higher stress levels may require additional vitamin C (100-200 mg extra) to support immune function.',
  },
  {
    question: 'Do athletes need more vitamin C?',
    answer:
      'Intense exercise increases oxidative stress and may temporarily suppress immunity. Regular exercisers may benefit from 100-200 mg additional vitamin C, especially around intense training periods.',
  },
  {
    question: 'What foods are rich in vitamin C?',
    answer:
      'Excellent sources include citrus fruits, kiwi, strawberries, bell peppers, broccoli, Brussels sprouts, tomatoes, and leafy greens. Fresh, raw fruits and vegetables provide the most vitamin C.',
  },
  {
    question: 'Is it better to get vitamin C from food or supplements?',
    answer:
      'Food sources are generally preferred as they provide other nutrients and phytochemicals. However, supplements can help meet higher needs during stress, illness, or when dietary intake is insufficient.',
  },
  {
    question: 'How does smoking affect vitamin C needs?',
    answer:
      'Smoking increases oxidative stress and depletes vitamin C. Smokers need an additional 35 mg daily (125 mg total for men, 110 mg for women). Secondhand smoke exposure also increases needs.',
  },
  {
    question: 'When is the best time to take vitamin C?',
    answer:
      'Vitamin C can be taken at any time. Spreading intake throughout the day (with meals) may enhance absorption. Taking it with meals also reduces the risk of stomach upset from high doses.',
  },
];

const relatedCalculators = [
  {
    name: 'Vitamin B12 Daily Requirement Calculator',
    slug: 'vitamin-b12-daily-requirement-calculator',
    description: 'Calculate B12 requirements for overall health.',
  },
  {
    name: 'Omega-6 to Omega-3 Balance Wellness Calculator',
    slug: 'omega-6-to-omega-3-balance-calculator',
    description: 'Get wellness insights about fatty acid balance.',
  },
  {
    name: 'Vitamin Deficiency Risk Estimator',
    slug: 'vitamin-deficiency-risk-estimator',
    description: 'Assess overall vitamin deficiency risk.',
  },
  {
    name: 'Immune Recovery Time Post-Illness Calculator',
    slug: 'immune-recovery-time-post-illness-calculator',
    description: 'Track immune recovery after illness.',
  },
];

const baseUrl = 'https://mycalculating.com/health-fitness/vitamin-c-immunity-boost-score-calculator';

const schemaMarkup = {
  '@context': 'https://schema.org',
  '@graph': [
    {
      '@type': 'BreadcrumbList',
      itemListElement: [
        { '@type': 'ListItem', position: 1, name: 'Home', item: 'https://mycalculating.com' },
        { '@type': 'ListItem', position: 2, name: 'Health & Fitness', item: 'https://mycalculating.com/health-fitness' },
        { '@type': 'ListItem', position: 3, name: 'Vitamin C Wellness Support Score Calculator', item: baseUrl },
      ],
    },
    {
      '@type': 'SoftwareApplication',
      name: 'Vitamin C Wellness Support Score Calculator',
      applicationCategory: 'Calculator',
      operatingSystem: 'Web Browser',
      description: 'Get general wellness insights about vitamin C intake based on daily intake, supplementation, stress levels, and lifestyle factors. This is a personal lifestyle insight, not a medical evaluation.',
      url: baseUrl,
      offers: { '@type': 'Offer', price: '0', priceCurrency: 'USD' },
    },
  ],
};

const calculateResult = (values: FormValues): ResultPayload => {
  const foodIntake = values.dailyIntake;
  const supplementIntake = values.supplementDose ?? 0;
  const totalVitaminC = foodIntake + supplementIntake;
  
  // Base RDA
  const baseRDA = 75; // Using average for men/women
  
  // Calculate recommended intake based on factors
  let recommendedIntake = baseRDA;
  
  // Stress adjustment (high stress increases needs)
  if (values.stressLevel >= 8) {
    recommendedIntake += 150;
  } else if (values.stressLevel >= 5) {
    recommendedIntake += 75;
  } else if (values.stressLevel >= 3) {
    recommendedIntake += 35;
  }
  
  // Exercise adjustment
  if (values.exerciseFrequency >= 5) {
    recommendedIntake += 100; // Very active
  } else if (values.exerciseFrequency >= 3) {
    recommendedIntake += 50; // Moderately active
  } else if (values.exerciseFrequency >= 1) {
    recommendedIntake += 25; // Light activity
  }
  
  // Smoking adjustment
  if (values.smokingStatus === 'regular') {
    recommendedIntake += 50; // Smokers need extra
  } else if (values.smokingStatus === 'occasional') {
    recommendedIntake += 25;
  }
  
  // Calculate immunity score (0-100)
  let immunityScore = 0;
  
  // Base intake score (0-40 points)
  if (totalVitaminC >= recommendedIntake * 1.2) {
    immunityScore += 40; // Excellent
  } else if (totalVitaminC >= recommendedIntake) {
    immunityScore += 35; // Meets recommendation
  } else if (totalVitaminC >= recommendedIntake * 0.75) {
    immunityScore += 25; // Good
  } else if (totalVitaminC >= recommendedIntake * 0.5) {
    immunityScore += 15; // Moderate
  } else if (totalVitaminC >= baseRDA * 0.5) {
    immunityScore += 8; // Low
  }
  
  // Stress management score (0-20 points)
  if (values.stressLevel <= 3) {
    immunityScore += 20; // Low stress
  } else if (values.stressLevel <= 5) {
    immunityScore += 12; // Moderate stress
  } else if (values.stressLevel <= 7) {
    immunityScore += 6; // High stress
  }
  
  // Exercise score (0-20 points)
  if (values.exerciseFrequency >= 5) {
    immunityScore += 20; // Very active
  } else if (values.exerciseFrequency >= 3) {
    immunityScore += 15; // Active
  } else if (values.exerciseFrequency >= 1) {
    immunityScore += 10; // Some activity
  }
  
  // Lifestyle score (0-20 points)
  if (values.smokingStatus === 'none' || !values.smokingStatus) {
    immunityScore += 20; // Non-smoker
  } else if (values.smokingStatus === 'occasional') {
    immunityScore += 10; // Occasional smoker
  }
  
  // Clamp to 0-100
  immunityScore = Math.min(100, Math.max(0, immunityScore));
  
  let immuneSupportLevel: string;
  let status: ResultPayload['status'] = 'optimal';
  let interpretation = 'This suggests a general lifestyle tendency where your vitamin C intake and lifestyle factors may support wellness.';
  
  if (immunityScore >= 80) {
    immuneSupportLevel = 'Excellent';
    status = 'optimal';
    interpretation = 'This suggests a general lifestyle tendency where your vitamin C intake and lifestyle factors may support wellness. You may consider continuing to maintain this level.';
  } else if (immunityScore >= 65) {
    immuneSupportLevel = 'Good';
    status = 'good';
    interpretation = 'This suggests a general lifestyle tendency where your wellness support is good. Minor improvements in intake or lifestyle factors may further support wellness.';
  } else if (immunityScore >= 50) {
    immuneSupportLevel = 'Moderate';
    status = 'moderate';
    interpretation = 'This suggests a general lifestyle tendency where your wellness support is moderate. You may consider increasing vitamin C intake or addressing lifestyle factors (stress, exercise) to support wellness.';
  } else {
    immuneSupportLevel = 'Lower';
    status = 'low';
    interpretation = 'This suggests a general lifestyle tendency where you may consider increasing vitamin C intake and addressing lifestyle factors to support wellness.';
  }
  
  const recommendations = [
    `Suggested daily vitamin C intake: ${recommendedIntake.toFixed(0)} mg. Your current total: ${totalVitaminC.toFixed(0)} mg. This is a personal insight, not a medical evaluation.`,
    totalVitaminC < recommendedIntake
      ? `You may consider increasing vitamin C intake by ${(recommendedIntake - totalVitaminC).toFixed(0)} mg daily. Focus on vitamin C-rich foods (citrus, bell peppers, kiwi, broccoli) or consider discussing supplements with a qualified professional.`
      : 'Your vitamin C intake meets or exceeds suggestions. You may consider continuing to maintain this level through diet and supplements.',
  ];
  
  if (values.stressLevel >= 6) {
    recommendations.push('High stress levels may increase vitamin C needs. You may consider stress management techniques (meditation, exercise, adequate sleep) in addition to increased vitamin C intake.');
  }
  
  if (values.exerciseFrequency >= 5) {
    recommendations.push('Regular intense exercise may increase oxidative stress. You may consider ensuring adequate vitamin C intake (100-200 mg extra) to support recovery and wellness.');
  }
  
  if (values.smokingStatus === 'regular' || values.smokingStatus === 'occasional') {
    recommendations.push('Smoking may increase vitamin C needs due to oxidative stress. You may consider increasing intake by 35-50 mg daily and exploring smoking cessation support if needed.');
  }
  
  if (totalVitaminC > 2000) {
    recommendations.push('Your intake exceeds the suggested upper limit (2000 mg). While generally safe, you may consider monitoring for digestive symptoms. Consider reducing dose if you experience side effects.');
  }
  
  const plan = [
    { label: 'This Week', detail: `You may consider aiming for ${recommendedIntake.toFixed(0)} mg vitamin C daily. Include citrus fruits, bell peppers, kiwi, and leafy greens. You may consider discussing supplements with a qualified professional if dietary intake is insufficient.` },
    { label: 'This Month', detail: 'You may consider tracking vitamin C intake from food and supplements. Monitor how you feel and adjust intake based on stress levels, exercise, and wellness needs.' },
    { label: 'Ongoing', detail: 'You may consider maintaining adequate vitamin C intake for wellness support. During high stress, illness, or intense training, you may temporarily increase intake. Continue stress management and regular exercise.' },
  ];
  
  return { immunityScore, totalVitaminC, recommendedIntake, immuneSupportLevel, status, interpretation, recommendations, plan };
};

export default function VitaminCImmunityBoostScoreCalculator() {
  const [result, setResult] = useState<ResultPayload | null>(null);

  const form = useForm<FormValues>({
    resolver: zodResolver(formSchema),
    defaultValues: {
      dailyIntake: undefined,
      supplementDose: undefined,
      stressLevel: undefined,
      exerciseFrequency: undefined,
      smokingStatus: undefined,
    },
  });

  return (
    <div className="space-y-8">
      <Script id="vitamin-c-immunity-schema" type="application/ld+json" strategy="afterInteractive" dangerouslySetInnerHTML={{ __html: JSON.stringify(schemaMarkup) }} />

      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <Moon className="h-5 w-5" />
            Vitamin C Wellness Support Score Calculator
          </CardTitle>
          <CardDescription>Get general wellness insights about vitamin C intake based on daily intake, supplementation, stress levels, and lifestyle factors. This is a personal lifestyle insight, not a medical evaluation.</CardDescription>
        </CardHeader>
      </Card>

      <Card>
        <CardHeader>
          <CardTitle>Input your vitamin C data</CardTitle>
        </CardHeader>
        <CardContent>
          <Form {...form}>
            <form onSubmit={form.handleSubmit((values) => setResult(calculateResult(values)))} className="space-y-6">
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <FormField
                  control={form.control}
                  name="dailyIntake"
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel>Daily intake from food (mg)</FormLabel>
                      <FormControl>
                        <Input type="number" step="10" placeholder="e.g., 100" value={field.value ?? ''} onChange={(e) => field.onChange(e.target.value === '' ? undefined : Number(e.target.value))} />
                      </FormControl>
                      <FormMessage />
                    </FormItem>
                  )}
                />
                <FormField
                  control={form.control}
                  name="supplementDose"
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel>Supplement dose (mg, optional)</FormLabel>
                      <FormControl>
                        <Input type="number" step="50" placeholder="e.g., 500" value={field.value ?? ''} onChange={(e) => field.onChange(e.target.value === '' ? undefined : Number(e.target.value))} />
                      </FormControl>
                      <FormMessage />
                    </FormItem>
                  )}
                />
                <FormField
                  control={form.control}
                  name="stressLevel"
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel>Stress level (1-10)</FormLabel>
                      <FormControl>
                        <Input type="number" step="1" placeholder="e.g., 5" value={field.value ?? ''} onChange={(e) => field.onChange(e.target.value === '' ? undefined : Number(e.target.value))} />
                      </FormControl>
                      <FormMessage />
                    </FormItem>
                  )}
                />
                <FormField
                  control={form.control}
                  name="exerciseFrequency"
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel>Exercise frequency (days/week)</FormLabel>
                      <FormControl>
                        <Input type="number" step="1" placeholder="e.g., 3" value={field.value ?? ''} onChange={(e) => field.onChange(e.target.value === '' ? undefined : Number(e.target.value))} />
                      </FormControl>
                      <FormMessage />
                    </FormItem>
                  )}
                />
                <FormField
                  control={form.control}
                  name="smokingStatus"
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel>Smoking status (optional)</FormLabel>
                      <FormControl>
                        <select
                          value={field.value ?? ''}
                          onChange={(e) => field.onChange(e.target.value || undefined)}
                          className="flex h-10 w-full rounded-md border border-input bg-background px-3 py-2 text-sm ring-offset-background file:border-0 file:bg-transparent file:text-sm file:font-medium placeholder:text-muted-foreground focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2 disabled:cursor-not-allowed disabled:opacity-50"
                        >
                          <option value="">None</option>
                          <option value="occasional">Occasional</option>
                          <option value="regular">Regular</option>
                        </select>
                      </FormControl>
                      <FormMessage />
                    </FormItem>
                  )}
                />
              </div>
              <Button type="submit" className="w-full md:w-auto">
                Calculate wellness support score
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
            <CardDescription>See wellness support score, vitamin C intake, and recommendations.</CardDescription>
          </CardHeader>
          <CardContent className="space-y-6">
            <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
              <div className="p-4 border rounded">
                <p className="text-sm text-muted-foreground">Wellness support score</p>
                <p className="text-2xl font-semibold text-primary">{result.immunityScore.toFixed(0)}/100</p>
                <p className="text-xs text-muted-foreground">{result.immuneSupportLevel}</p>
              </div>
              <div className="p-4 border rounded">
                <p className="text-sm text-muted-foreground">Total vitamin C</p>
                <p className="text-2xl font-semibold text-primary">{result.totalVitaminC.toFixed(0)} mg</p>
                <p className="text-xs text-muted-foreground">Daily intake</p>
              </div>
              <div className="p-4 border rounded">
                <p className="text-sm text-muted-foreground">Recommended intake</p>
                <p className="text-2xl font-semibold text-primary">{result.recommendedIntake.toFixed(0)} mg</p>
                <p className="text-xs text-muted-foreground">Based on factors</p>
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
            <strong>Total vitamin C</strong> = Daily intake from food + Supplement dose.
          </p>
          <p>
            <strong>Recommended intake</strong> = Base RDA (75 mg) + Stress adjustment (0-150 mg) + Exercise adjustment (0-100 mg) + Smoking adjustment (0-50 mg).
          </p>
          <p>
            <strong>Immunity score</strong> = Intake score (0-40) + Stress score (0-20) + Exercise score (0-20) + Lifestyle score (0-20), capped at 100.
          </p>
          <p>
            <strong>Stress adjustment</strong>: Low (1-2) = 0 mg, Moderate (3-4) = +35 mg, High (5-7) = +75 mg, Very high (8-10) = +150 mg.
          </p>
          <p>Higher vitamin C intake supports immune function, especially during stress, illness, or intense exercise. The score reflects both intake adequacy and lifestyle factors affecting immune health.</p>
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
                <p className="text-sm text-muted-foreground">Intake gap</p>
                <p className="text-xl font-semibold text-primary">
                  {result.totalVitaminC >= result.recommendedIntake 
                    ? 'Met' 
                    : `${(result.recommendedIntake - result.totalVitaminC).toFixed(0)} mg short`}
                </p>
                <p className="text-xs text-muted-foreground">vs recommended</p>
              </div>
              <div className="p-4 border rounded">
                <p className="text-sm text-muted-foreground">Upper limit</p>
                <p className="text-xl font-semibold text-primary">
                  {result.totalVitaminC > 2000 ? 'Exceeded' : 'Safe'}
                </p>
                <p className="text-xs text-muted-foreground">2000 mg/day max</p>
              </div>
              <div className="p-4 border rounded">
                <p className="text-sm text-muted-foreground">Optimization potential</p>
                <p className="text-xl font-semibold text-primary">
                  {result.immunityScore >= 80 ? 'Minimal' : result.immunityScore >= 65 ? 'Moderate' : 'High'}
                </p>
                <p className="text-xs text-muted-foreground">Room for improvement</p>
              </div>
            </div>
          ) : (
            <p className="text-sm text-muted-foreground">Enter your vitamin C data to see additional insights.</p>
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
          <p>Vitamin C is essential for immune function, acting as an antioxidant and supporting white blood cell production. Requirements increase during stress, illness, intense exercise, and smoking. Adequate intake helps reduce infection duration and severity.</p>
          <p>Use this calculator to assess your vitamin C immunity boost score based on intake and lifestyle factors. Higher scores indicate better immune support, while lower scores suggest areas for improvement.</p>
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
          <p>This tool provides general wellness insights about vitamin C intake based on daily intake, supplementation, stress levels, and lifestyle factors. This is a personal lifestyle insight, not a medical evaluation.</p>
          <p>Outputs include wellness support score (0-100), total vitamin C intake, suggested intake, wellness support level, status, recommendations, an action plan, and supporting metrics.</p>
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



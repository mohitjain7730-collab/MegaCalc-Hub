'use client';

import { useState } from 'react';
import Script from 'next/script';
import Link from 'next/link';
import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import { z } from 'zod';
import { Target, Zap, Activity, Shield, TrendingUp } from 'lucide-react';

import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Form, FormControl, FormField, FormItem, FormLabel, FormMessage } from '@/components/ui/form';
import { Input } from '@/components/ui/input';

const formSchema = z.object({
  anteriorCore: z.number({ invalid_type_error: 'Enter anterior core strength' }).min(0).max(10),
  posteriorCore: z.number({ invalid_type_error: 'Enter posterior core strength' }).min(0).max(10),
  lateralCore: z.number({ invalid_type_error: 'Enter lateral core strength' }).min(0).max(10),
  rotationalCore: z.number({ invalid_type_error: 'Enter rotational core strength' }).min(0).max(10),
  stabilityDuration: z.number({ invalid_type_error: 'Enter stability duration' }).min(0).max(600).optional(),
});

type FormValues = z.infer<typeof formSchema>;

type ResultPayload = {
  balanceScore: number;
  balanceRatio: number;
  balanceLevel: string;
  status: 'balanced' | 'good' | 'moderate' | 'imbalanced';
  interpretation: string;
  recommendations: string[];
  plan: { label: string; detail: string }[];
};

const steps = [
  'Rate anterior core strength (0-10, front abs/core).',
  'Rate posterior core strength (0-10, lower back/core).',
  'Rate lateral core strength (0-10, side abs/obliques).',
  'Rate rotational core strength (0-10, rotation ability).',
  'Optionally enter core stability duration (seconds holding plank).',
  'Review core strength balance score, ratio, and recommendations.',
];

const faqs = [
  {
    question: 'What is core strength balance?',
    answer:
      'Core strength balance refers to the proportional strength across all core muscle groups: anterior (front), posterior (back), lateral (sides), and rotational. Balanced core strength prevents imbalances, reduces injury risk, and optimizes performance.',
  },
  {
    question: 'Why is core balance important?',
    answer:
      'Imbalanced core strength can cause poor posture, lower back pain, reduced athletic performance, and increased injury risk. Balanced core strength supports spinal stability, efficient movement, and power transfer.',
  },
  {
    question: 'What is a good core balance ratio?',
    answer:
      'Ideally, all core components should be within 20% of each other. A balance score above 80 indicates good balance. Scores below 60 suggest significant imbalances that need attention.',
  },
  {
    question: 'How do I assess core strength?',
    answer:
      'Assess through exercises: anterior (plank, crunches), posterior (superman, back extensions), lateral (side planks), rotational (Russian twists, wood chops). Rate difficulty/endurance on 0-10 scale or time held.',
  },
  {
    question: 'What causes core imbalances?',
    answer:
      'Common causes include: focusing only on abs/crunches, neglecting posterior chain, sedentary lifestyle, previous injuries, poor posture, and sport-specific movements that overdevelop certain areas.',
  },
  {
    question: 'How can I improve core balance?',
    answer:
      'Include exercises for all four core components in your routine. Focus on weaker areas (usually posterior and lateral). Use compound movements that engage multiple core muscles. Maintain consistent training across all directions.',
  },
  {
    question: 'What about core stability?',
    answer:
      'Core stability (ability to maintain position under load) is as important as strength. Training should include isometric holds (planks), anti-movement exercises (pallof presses), and dynamic stability challenges.',
  },
  {
    question: 'How often should I train core?',
    answer:
      'Core can be trained 3-6 times per week due to high recovery capacity. Include variety: strength work (2-3x/week), stability work (3-4x/week), and integrated core training in compound lifts (always).',
  },
  {
    question: 'Should I do core before or after workouts?',
    answer:
      'Depends on goals. Pre-workout core activation (5-10 min) prepares core for lifts. Post-workout core work (10-15 min) allows dedicated focus. Avoid fatiguing core before heavy lifts requiring core stability.',
  },
  {
    question: 'Can core imbalance cause back pain?',
    answer:
      'Yes. Weak posterior core relative to anterior can cause excessive lumbar curve and lower back pain. Weak lateral core can contribute to lateral imbalances. Balanced core strength supports spinal alignment and reduces pain.',
  },
];

const relatedCalculators = [
  {
    name: 'Training Fatigue Wellness Index',
    slug: 'training-fatigue-index-calculator',
    description: 'Get wellness insights about training load including core work.',
  },
  {
    name: 'Posture Correction Progress Calculator',
    slug: 'posture-correction-progress-calculator',
    description: 'Track posture improvements related to core balance.',
  },
  {
    name: 'Warmup Time Wellness Planner',
    slug: 'injury-prevention-warmup-time-calculator',
    description: 'Get wellness insights about including core activation in warmup routine.',
  },
  {
    name: 'Rest Time Between Sets Calculator',
    slug: 'rest-time-between-sets-calculator',
    description: 'Optimize rest periods for core training.',
  },
];

const baseUrl = 'https://mycalculating.com/category/health-fitness/core-strength-balance-calculator';

const schemaMarkup = {
  '@context': 'https://schema.org',
  '@graph': [
    {
      '@type': 'BreadcrumbList',
      itemListElement: [
        { '@type': 'ListItem', position: 1, name: 'Home', item: 'https://mycalculating.com' },
        { '@type': 'ListItem', position: 2, name: 'Health & Fitness', item: 'https://mycalculating.com/category/health-fitness' },
        { '@type': 'ListItem', position: 3, name: 'Core Strength Balance Wellness Calculator', item: baseUrl },
      ],
    },
    {
      '@type': 'SoftwareApplication',
      name: 'Core Strength Balance Wellness Calculator',
      applicationCategory: 'Calculator',
      operatingSystem: 'Web Browser',
      description: 'Get general wellness insights about core strength balance across anterior, posterior, lateral, and rotational components. This is a personal lifestyle insight, not a medical evaluation.',
      url: baseUrl,
      offers: { '@type': 'Offer', price: '0', priceCurrency: 'USD' },
    },
  ],
};

const clamp = (value: number, min: number, max: number) => Math.min(max, Math.max(min, value));

const calculateResult = (values: FormValues): ResultPayload => {
  const coreValues = [
    values.anteriorCore,
    values.posteriorCore,
    values.lateralCore,
    values.rotationalCore,
  ];
  
  const average = coreValues.reduce((sum, val) => sum + val, 0) / coreValues.length;
  
  // Calculate balance score (100 = perfect balance, lower = more imbalance)
  let balanceScore = 100;
  coreValues.forEach((val) => {
    const deviation = Math.abs(val - average);
    balanceScore -= deviation * 3; // Penalty for deviation
  });
  balanceScore = clamp(balanceScore, 0, 100);
  
  // Calculate balance ratio (ratio of weakest to strongest)
  const minValue = Math.min(...coreValues);
  const maxValue = Math.max(...coreValues);
  const balanceRatio = maxValue > 0 ? (minValue / maxValue) * 100 : 0;
  
  let status: ResultPayload['status'] = 'balanced';
  let balanceLevel = 'Balanced';
  let interpretation = 'This suggests a general lifestyle tendency where your core strength may be well-balanced across all directions. You may consider continuing to maintain balanced training.';
  
  if (balanceScore >= 85) {
    status = 'balanced';
    balanceLevel = 'Balanced';
  } else if (balanceScore >= 70) {
    status = 'good';
    balanceLevel = 'Good';
    interpretation = 'This suggests a general lifestyle tendency where your core strength balance is good with minor imbalances. You may consider continuing to train all core components.';
  } else if (balanceScore >= 50) {
    status = 'moderate';
    balanceLevel = 'Moderate';
    interpretation = 'This suggests a general lifestyle tendency where your core strength has moderate imbalances. You may consider focusing on strengthening weaker areas to improve balance.';
  } else {
    status = 'imbalanced';
    balanceLevel = 'Imbalanced';
    interpretation = 'This suggests a general lifestyle tendency where your core strength has significant imbalances. You may consider prioritizing training weaker areas to support wellness and improve performance.';
  }
  
  // Identify weakest area
  const areas = ['Anterior', 'Posterior', 'Lateral', 'Rotational'];
  const weakestIdx = coreValues.indexOf(minValue);
  const weakestArea = areas[weakestIdx];
  
  const recommendations = [
    'You may consider training all four core components regularly: anterior (crunches, planks), posterior (supermans, back extensions), lateral (side planks), and rotational (Russian twists). This is a personal insight, not a medical evaluation.',
    `You may consider focusing on strengthening the ${weakestArea.toLowerCase()} core, which is currently your weakest area. Include 2-3 dedicated exercises per week.`,
    'You may consider using compound movements (squats, deadlifts, rows) that engage multiple core muscles to build integrated core strength.',
  ];
  if (balanceRatio < 70) {
    recommendations.push(`Your core strength imbalance may be significant (${balanceRatio.toFixed(0)}% ratio). You may consider prioritizing training weaker areas while maintaining stronger areas.`);
  }
  if (values.stabilityDuration && values.stabilityDuration < 60) {
    recommendations.push('You may consider improving core stability through isometric holds (planks, side planks). Aim to hold positions for 60+ seconds with good form.');
  }
  if (values.posteriorCore < values.anteriorCore - 2) {
    recommendations.push('Your posterior core may be weaker than anterior. This is common and may contribute to lower back considerations. You may consider prioritizing posterior core training (superman, back extensions, reverse hyperextensions).');
  }
  
  const plan = [
    { label: 'This Week', detail: 'You may consider assessing core strength in all four directions. Identify weakest areas and current balance score.' },
    { label: 'This Month', detail: 'You may consider including exercises for all core components in routine. Focus 2-3 sessions per week on strengthening weakest area while maintaining others.' },
    { label: 'Ongoing', detail: 'You may consider maintaining balanced core training. Reassess monthly to ensure all core components progress together and imbalances don\'t develop.' },
  ];
  
  return { balanceScore, balanceRatio, balanceLevel, status, interpretation, recommendations, plan };
};

export default function CoreStrengthBalanceCalculator() {
  const [result, setResult] = useState<ResultPayload | null>(null);
  
  const form = useForm<FormValues>({
    resolver: zodResolver(formSchema),
    defaultValues: {
      anteriorCore: undefined,
      posteriorCore: undefined,
      lateralCore: undefined,
      rotationalCore: undefined,
      stabilityDuration: undefined,
    },
  });
  
  return (
    <div className="space-y-8">
      <Script id="core-balance-schema" type="application/ld+json" strategy="afterInteractive" dangerouslySetInnerHTML={{ __html: JSON.stringify(schemaMarkup) }} />
      
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <Target className="h-5 w-5" />
            Core Strength Balance Wellness Calculator
          </CardTitle>
          <CardDescription>Get general wellness insights about core strength balance across anterior, posterior, lateral, and rotational components. This is a personal lifestyle insight, not a medical evaluation.</CardDescription>
        </CardHeader>
      </Card>
      
      <Card>
        <CardHeader>
          <CardTitle>Input your core strength data</CardTitle>
        </CardHeader>
        <CardContent>
          <Form {...form}>
            <form onSubmit={form.handleSubmit((values) => setResult(calculateResult(values)))} className="space-y-6">
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <FormField
                  control={form.control}
                  name="anteriorCore"
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel>Anterior core strength (0-10)</FormLabel>
                      <FormControl>
                        <Input type="number" step="0.5" placeholder="e.g., 7" value={field.value ?? ''} onChange={(e) => field.onChange(e.target.value === '' ? undefined : Number(e.target.value))} />
                      </FormControl>
                      <FormMessage />
                    </FormItem>
                  )}
                />
                <FormField
                  control={form.control}
                  name="posteriorCore"
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel>Posterior core strength (0-10)</FormLabel>
                      <FormControl>
                        <Input type="number" step="0.5" placeholder="e.g., 6" value={field.value ?? ''} onChange={(e) => field.onChange(e.target.value === '' ? undefined : Number(e.target.value))} />
                      </FormControl>
                      <FormMessage />
                    </FormItem>
                  )}
                />
                <FormField
                  control={form.control}
                  name="lateralCore"
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel>Lateral core strength (0-10)</FormLabel>
                      <FormControl>
                        <Input type="number" step="0.5" placeholder="e.g., 7" value={field.value ?? ''} onChange={(e) => field.onChange(e.target.value === '' ? undefined : Number(e.target.value))} />
                      </FormControl>
                      <FormMessage />
                    </FormItem>
                  )}
                />
                <FormField
                  control={form.control}
                  name="rotationalCore"
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel>Rotational core strength (0-10)</FormLabel>
                      <FormControl>
                        <Input type="number" step="0.5" placeholder="e.g., 6.5" value={field.value ?? ''} onChange={(e) => field.onChange(e.target.value === '' ? undefined : Number(e.target.value))} />
                      </FormControl>
                      <FormMessage />
                    </FormItem>
                  )}
                />
                <FormField
                  control={form.control}
                  name="stabilityDuration"
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel>Core stability duration (seconds, optional)</FormLabel>
                      <FormControl>
                        <Input type="number" step="5" placeholder="e.g., 90" value={field.value ?? ''} onChange={(e) => field.onChange(e.target.value === '' ? undefined : Number(e.target.value))} />
                      </FormControl>
                      <FormMessage />
                    </FormItem>
                  )}
                />
              </div>
              <Button type="submit" className="w-full md:w-auto">
                Calculate balance
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
            <CardDescription>See core strength balance score, ratio, and recommendations.</CardDescription>
          </CardHeader>
          <CardContent className="space-y-6">
            <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
              <div className="p-4 border rounded">
                <p className="text-sm text-muted-foreground">Balance score</p>
                <p className="text-2xl font-semibold text-primary">{result.balanceScore.toFixed(1)}</p>
                <p className="text-xs text-muted-foreground">Out of 100</p>
              </div>
              <div className="p-4 border rounded">
                <p className="text-sm text-muted-foreground">Balance ratio</p>
                <p className="text-2xl font-semibold text-primary">{result.balanceRatio.toFixed(0)}%</p>
                <p className="text-xs text-muted-foreground">Weakest to strongest</p>
              </div>
              <div className="p-4 border rounded">
                <p className="text-sm text-muted-foreground">Balance level</p>
                <p className="text-2xl font-semibold text-primary">{result.balanceLevel}</p>
                <p className="text-xs text-muted-foreground">{result.status}</p>
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
                    <TrendingUp className="h-4 w-4" />
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
            <strong>Average core strength</strong> = (Anterior + Posterior + Lateral + Rotational) / 4.
          </p>
          <p>
            <strong>Balance score</strong> = 100 - (Sum of absolute deviations from average × 3), clamped to 0-100.
          </p>
          <p>
            <strong>Balance ratio</strong> = (Weakest core component / Strongest core component) × 100%.
          </p>
          <p>
            <strong>Score interpretation</strong>: 85-100 = Balanced, 70-85 = Good, 50-70 = Moderate, below 50 = Imbalanced.
          </p>
          <p>Balanced core strength means all four components (anterior, posterior, lateral, rotational) are within 20% of each other. Imbalances can cause poor posture, back pain, and reduced performance.</p>
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
          <p>Core strength balance is crucial for optimal performance, injury prevention, and spinal health. Balanced core strength across all directions (anterior, posterior, lateral, rotational) supports efficient movement and reduces injury risk.</p>
          <p>Use this calculator to assess core strength balance by rating strength in all four core components. Identify imbalances and focus training on weaker areas to optimize core function and reduce injury risk.</p>
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
          <p>This tool provides general wellness insights about core strength balance across anterior, posterior, lateral, and rotational components based on strength ratings (0-10 scale). This is a personal lifestyle insight, not a medical evaluation.</p>
          <p>Outputs include balance score (0-100), balance ratio (weakest to strongest %), balance level, status, recommendations, an action plan, and supporting metrics.</p>
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


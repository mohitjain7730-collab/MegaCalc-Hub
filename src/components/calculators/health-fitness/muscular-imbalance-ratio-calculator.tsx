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
  leftSideStrength: z.number({ invalid_type_error: 'Enter left side strength' }).min(0).max(1000),
  rightSideStrength: z.number({ invalid_type_error: 'Enter right side strength' }).min(0).max(1000),
  agonistStrength: z.number({ invalid_type_error: 'Enter agonist strength' }).min(0).max(1000).optional(),
  antagonistStrength: z.number({ invalid_type_error: 'Enter antagonist strength' }).min(0).max(1000).optional(),
  muscleGroup: z.enum(['quadriceps', 'hamstrings', 'chest', 'back', 'shoulders', 'biceps', 'triceps', 'other']).optional(),
});

type FormValues = z.infer<typeof formSchema>;

type ResultPayload = {
  imbalanceRatio: number;
  imbalancePercentage: number;
  imbalanceLevel: string;
  status: 'balanced' | 'minimal' | 'moderate' | 'significant';
  interpretation: string;
  recommendations: string[];
  plan: { label: string; detail: string }[];
};

const steps = [
  'Enter left side strength (weight, force, or score).',
  'Enter right side strength (weight, force, or score).',
  'Optionally enter agonist and antagonist muscle strength.',
  'Optionally select muscle group being assessed.',
  'Review imbalance ratio, percentage, level, and recommendations.',
];

const faqs = [
  {
    question: 'What is muscular imbalance?',
    answer:
      'Muscular imbalance occurs when one side or muscle group is significantly stronger, tighter, or more developed than its counterpart (opposite side or opposing muscle group). Imbalances can cause poor movement patterns, injury risk, and performance limitations.',
  },
  {
    question: 'What causes muscular imbalances?',
    answer:
      'Causes include: dominant side preference (right-handed favoring right side), previous injuries, sport-specific movements (one-sided sports), poor training habits (neglecting certain muscles), postural issues, and compensatory patterns from weaknesses.',
  },
  {
    question: 'What is an acceptable imbalance ratio?',
    answer:
      'Ratios: 90-100% = Balanced (ideal), 80-89% = Minimal (acceptable), 70-79% = Moderate (needs attention), below 70% = Significant (requires correction). Left-right imbalances should be within 10% for optimal function.',
  },
  {
    question: 'How do imbalances affect performance?',
    answer:
      'Imbalances can cause: reduced power output, inefficient movement patterns, compensation leading to overuse injuries, altered biomechanics, decreased stability, and limitations in range of motion. Balanced strength optimizes performance.',
  },
  {
    question: 'How can I correct muscular imbalances?',
    answer:
      'Correct through: unilateral training (single-limb exercises), focusing on weaker side, matching volume and intensity on both sides, addressing agonist-antagonist imbalances, improving mobility in tight muscles, and maintaining balanced training.',
  },
  {
    question: 'What about agonist-antagonist imbalances?',
    answer:
      'Agonist-antagonist balance (e.g., quadriceps-hamstrings, chest-back) is crucial. Typical ratios: hamstrings should be 60-80% of quadriceps strength. Imbalances here increase injury risk (e.g., ACL injuries from weak hamstrings).',
  },
  {
    question: 'Should I train the stronger side less?',
    answer:
      'No. Train both sides equally, but prioritize the weaker side slightly. Start workouts with weaker side exercises. Match volume and intensity. Avoid stopping when stronger side fatiguesâ€”continue with weaker side to create balance.',
  },
  {
    question: 'How long does it take to correct imbalances?',
    answer:
      'Correction time varies: minimal imbalances (4-8 weeks), moderate (8-12 weeks), significant (3-6 months). Consistency and proper programming are key. Regular reassessment helps track progress and adjust programs.',
  },
  {
    question: 'Can imbalances cause pain?',
    answer:
      'Yes. Significant imbalances can cause: joint pain (from altered biomechanics), muscle strains (from compensation), overuse injuries (from dominant side overuse), and postural pain (from muscle tension differences).',
  },
  {
    question: 'How do I prevent future imbalances?',
    answer:
      'Prevent by: balanced training (both sides equally), unilateral exercises in routine, monitoring left-right differences, addressing weaknesses early, avoiding one-sided dominance in training, and maintaining flexibility and mobility balance.',
  },
];

const relatedCalculators = [
  {
    name: 'Functional Movement Wellness Score',
    slug: 'functional-movement-score-calculator',
    description: 'Get wellness insights about movement patterns affected by muscular imbalances.',
  },
  {
    name: 'Core Strength Balance Wellness Calculator',
    slug: 'core-strength-balance-calculator',
    description: 'Get wellness insights about core strength balance related to muscular imbalances.',
  },
  {
    name: 'Posture Progress Wellness Tracker',
    slug: 'posture-correction-progress-calculator',
    description: 'Get wellness insights about posture improvements from addressing imbalances.',
  },
  {
    name: 'Warmup Time Wellness Planner',
    slug: 'injury-prevention-warmup-time-calculator',
    description: 'Get wellness insights about including corrective exercises in warmup routine.',
  },
];

const baseUrl = 'https://mycalculating.com/health-fitness/muscular-imbalance-ratio-calculator';

const schemaMarkup = {
  '@context': 'https://schema.org',
  '@graph': [
    {
      '@type': 'BreadcrumbList',
      itemListElement: [
        { '@type': 'ListItem', position: 1, name: 'Home', item: 'https://mycalculating.com' },
        { '@type': 'ListItem', position: 2, name: 'Health & Fitness', item: 'https://mycalculating.com/health-fitness' },
        { '@type': 'ListItem', position: 3, name: 'Muscular Imbalance Ratio Wellness Calculator', item: baseUrl },
      ],
    },
    {
      '@type': 'SoftwareApplication',
      name: 'Muscular Imbalance Ratio Wellness Calculator',
      applicationCategory: 'Calculator',
      operatingSystem: 'Web Browser',
      description: 'Get general wellness insights about muscular imbalance ratio between left and right sides or agonist and antagonist muscles. This is a personal lifestyle insight, not a medical evaluation.',
      url: baseUrl,
      offers: { '@type': 'Offer', price: '0', priceCurrency: 'USD' },
    },
  ],
};

const clamp = (value: number, min: number, max: number) => Math.min(max, Math.max(min, value));

const calculateResult = (values: FormValues): ResultPayload => {
  // Calculate left-right imbalance
  const maxLR = Math.max(values.leftSideStrength, values.rightSideStrength);
  const minLR = Math.min(values.leftSideStrength, values.rightSideStrength);
  const imbalanceRatio = maxLR > 0 ? (minLR / maxLR) * 100 : 0;
  const imbalancePercentage = 100 - imbalanceRatio;
  
  // If agonist-antagonist provided, calculate that too
  let finalRatio = imbalanceRatio;
  if (values.agonistStrength && values.antagonistStrength) {
    const agonistMax = Math.max(values.agonistStrength, values.antagonistStrength);
    const agonistMin = Math.min(values.agonistStrength, values.antagonistStrength);
    const agonistRatio = agonistMax > 0 ? (agonistMin / agonistMax) * 100 : 0;
    // Average of both ratios
    finalRatio = (imbalanceRatio + agonistRatio) / 2;
  }
  
  let status: ResultPayload['status'] = 'balanced';
  let imbalanceLevel = 'Balanced';
  let interpretation = 'This suggests a general lifestyle tendency where your muscular balance may be good. Left and right sides may be well-balanced.';
  
  if (finalRatio >= 90) {
    status = 'balanced';
    imbalanceLevel = 'Balanced';
  } else if (finalRatio >= 80) {
    status = 'minimal';
    imbalanceLevel = 'Minimal';
    interpretation = 'This suggests a general lifestyle tendency where your muscular imbalance is minimal. Minor differences may exist but are within acceptable range.';
  } else if (finalRatio >= 70) {
    status = 'moderate';
    imbalanceLevel = 'Moderate';
    interpretation = 'This suggests a general lifestyle tendency where your muscular imbalance is moderate. You may consider corrective training to improve balance and support wellness.';
  } else {
    status = 'significant';
    imbalanceLevel = 'Significant';
    interpretation = 'This suggests a general lifestyle tendency where your muscular imbalance is significant. You may consider prioritizing corrective training focusing on the weaker side or muscle group to support wellness.';
  }
  
  const recommendations = [
    'You may consider including unilateral training (single-limb exercises) in your routine: lunges, single-leg deadlifts, single-arm rows, single-leg squats. This is a personal insight, not a medical evaluation.',
    'You may consider prioritizing the weaker side: start workouts with weaker side exercises, match volume and intensity, continue training weaker side even if stronger side fatigues first.',
    'You may consider focusing on weak muscle group: if agonist-antagonist imbalance exists, prioritize strengthening the weaker muscle group while maintaining the stronger one.',
  ];
  if (finalRatio < 80) {
    recommendations.push(`Imbalance ratio of ${finalRatio.toFixed(0)}% may indicate significant difference. You may consider dedicating 2-3 sessions per week specifically to correcting this imbalance through targeted unilateral work.`);
  }
  if (values.antagonistStrength && values.agonistStrength) {
    const ratio = values.antagonistStrength / values.agonistStrength;
    if (ratio < 0.6) {
      recommendations.push('Antagonist strength may be below optimal ratio (should be 60-80% of agonist). You may consider focusing on strengthening antagonist muscles to improve balance and support wellness.');
    }
  }
  
  const plan = [
    { label: 'This Week', detail: 'You may consider assessing strength on both sides using unilateral exercises. Identify which side or muscle group is weaker and quantify the imbalance.' },
    { label: 'This Month', detail: 'You may consider implementing unilateral training program. Start sessions with weaker side exercises. Match sets and reps on both sides, prioritizing weaker side if needed.' },
    { label: 'Ongoing', detail: 'You may consider continuing balanced training with emphasis on weaker areas. Reassess monthly to track progress toward balance. Prevent future imbalances through consistent balanced training.' },
  ];
  
  return { imbalanceRatio: finalRatio, imbalancePercentage: 100 - finalRatio, imbalanceLevel, status, interpretation, recommendations, plan };
};

export default function MuscularImbalanceRatioCalculator() {
  const [result, setResult] = useState<ResultPayload | null>(null);
  
  const form = useForm<FormValues>({
    resolver: zodResolver(formSchema),
    defaultValues: {
      leftSideStrength: undefined,
      rightSideStrength: undefined,
      agonistStrength: undefined,
      antagonistStrength: undefined,
      muscleGroup: undefined,
    },
  });
  
  return (
    <div className="space-y-8">
      <Script id="muscular-imbalance-schema" type="application/ld+json" strategy="afterInteractive" dangerouslySetInnerHTML={{ __html: JSON.stringify(schemaMarkup) }} />
      
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <Target className="h-5 w-5" />
            Muscular Imbalance Ratio Wellness Calculator
          </CardTitle>
          <CardDescription>Get general wellness insights about muscular imbalance ratio between left and right sides or agonist and antagonist muscles. This is a personal lifestyle insight, not a medical evaluation.</CardDescription>
        </CardHeader>
      </Card>
      
      <Card>
        <CardHeader>
          <CardTitle>Input your strength data</CardTitle>
        </CardHeader>
        <CardContent>
          <Form {...form}>
            <form onSubmit={form.handleSubmit((values) => setResult(calculateResult(values)))} className="space-y-6">
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <FormField
                  control={form.control}
                  name="leftSideStrength"
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel>Left side strength</FormLabel>
                      <FormControl>
                        <Input type="number" step="0.1" placeholder="e.g., 100" value={field.value ?? ''} onChange={(e) => field.onChange(e.target.value === '' ? undefined : Number(e.target.value))} />
                      </FormControl>
                      <FormMessage />
                    </FormItem>
                  )}
                />
                <FormField
                  control={form.control}
                  name="rightSideStrength"
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel>Right side strength</FormLabel>
                      <FormControl>
                        <Input type="number" step="0.1" placeholder="e.g., 95" value={field.value ?? ''} onChange={(e) => field.onChange(e.target.value === '' ? undefined : Number(e.target.value))} />
                      </FormControl>
                      <FormMessage />
                    </FormItem>
                  )}
                />
                <FormField
                  control={form.control}
                  name="agonistStrength"
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel>Agonist strength (optional)</FormLabel>
                      <FormControl>
                        <Input type="number" step="0.1" placeholder="e.g., 120" value={field.value ?? ''} onChange={(e) => field.onChange(e.target.value === '' ? undefined : Number(e.target.value))} />
                      </FormControl>
                      <FormMessage />
                    </FormItem>
                  )}
                />
                <FormField
                  control={form.control}
                  name="antagonistStrength"
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel>Antagonist strength (optional)</FormLabel>
                      <FormControl>
                        <Input type="number" step="0.1" placeholder="e.g., 80" value={field.value ?? ''} onChange={(e) => field.onChange(e.target.value === '' ? undefined : Number(e.target.value))} />
                      </FormControl>
                      <FormMessage />
                    </FormItem>
                  )}
                />
                <FormField
                  control={form.control}
                  name="muscleGroup"
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel>Muscle group (optional)</FormLabel>
                      <FormControl>
                        <select value={field.value ?? ''} onChange={(e) => field.onChange(e.target.value === '' ? undefined : e.target.value as FormValues['muscleGroup'])} className="flex h-10 w-full rounded-md border border-input bg-background px-3 py-2 text-sm">
                          <option value="">Select group</option>
                          <option value="quadriceps">Quadriceps</option>
                          <option value="hamstrings">Hamstrings</option>
                          <option value="chest">Chest</option>
                          <option value="back">Back</option>
                          <option value="shoulders">Shoulders</option>
                          <option value="biceps">Biceps</option>
                          <option value="triceps">Triceps</option>
                          <option value="other">Other</option>
                        </select>
                      </FormControl>
                      <FormMessage />
                    </FormItem>
                  )}
                />
              </div>
              <Button type="submit" className="w-full md:w-auto">
                Calculate imbalance ratio
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
            <CardDescription>See imbalance ratio, percentage, level, and recommendations.</CardDescription>
          </CardHeader>
          <CardContent className="space-y-6">
            <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
              <div className="p-4 border rounded">
                <p className="text-sm text-muted-foreground">Imbalance ratio</p>
                <p className="text-2xl font-semibold text-primary">{result.imbalanceRatio.toFixed(1)}%</p>
                <p className="text-xs text-muted-foreground">Weaker to stronger</p>
              </div>
              <div className="p-4 border rounded">
                <p className="text-sm text-muted-foreground">Imbalance percentage</p>
                <p className="text-2xl font-semibold text-primary">{result.imbalancePercentage.toFixed(1)}%</p>
                <p className="text-xs text-muted-foreground">Difference</p>
              </div>
              <div className="p-4 border rounded">
                <p className="text-sm text-muted-foreground">Imbalance level</p>
                <p className="text-2xl font-semibold text-primary">{result.imbalanceLevel}</p>
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
            <strong>Left-right imbalance ratio</strong> = (Weaker side / Stronger side) Ã— 100%.
          </p>
          <p>
            <strong>Agonist-antagonist ratio</strong> = (Weaker muscle group / Stronger muscle group) Ã— 100% (if provided).
          </p>
          <p>
            <strong>Final imbalance ratio</strong> = Average of left-right and agonist-antagonist ratios (if both provided), or left-right ratio alone.
          </p>
          <p>
            <strong>Imbalance percentage</strong> = 100% - Imbalance ratio (represents the difference).
          </p>
          <p>
            <strong>Ratio interpretation</strong>: 90-100% = Balanced, 80-89% = Minimal, 70-79% = Moderate, below 70% = Significant.
          </p>
          <p>Balanced strength between sides and muscle groups optimizes performance and reduces injury risk. Imbalances should be corrected through targeted unilateral training.</p>
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
          <p>Muscular imbalances occur when one side or muscle group is significantly stronger than its counterpart. These imbalances can cause poor movement patterns, increased injury risk, and performance limitations.</p>
          <p>Use this calculator to assess muscular imbalance ratio between left and right sides or agonist and antagonist muscle groups. Identify imbalances and develop corrective training programs to improve balance and reduce injury risk.</p>
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
          <p>This tool provides general wellness insights about muscular imbalance ratio based on left and right side strength, and optionally agonist and antagonist muscle strength. This is a personal lifestyle insight, not a medical evaluation.</p>
          <p>Outputs include imbalance ratio (%), imbalance percentage, imbalance level, status, recommendations, an action plan, and supporting metrics.</p>
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



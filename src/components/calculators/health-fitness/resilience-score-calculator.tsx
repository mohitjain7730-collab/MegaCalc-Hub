'use client';

import { useState } from 'react';
import Script from 'next/script';
import Link from 'next/link';
import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import { z } from 'zod';
import { Shield, Zap, Target, Activity, Heart } from 'lucide-react';

import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Form, FormControl, FormField, FormItem, FormLabel, FormMessage } from '@/components/ui/form';
import { Input } from '@/components/ui/input';

const formSchema = z.object({
  stressLevel: z.number({ invalid_type_error: 'Enter stress level' }).min(1).max(10),
  resilienceScore: z.number({ invalid_type_error: 'Enter resilience score' }).min(0).max(100).optional(),
  age: z.number({ invalid_type_error: 'Enter age' }).min(18).max(100),
  copingAbility: z.number({ invalid_type_error: 'Enter coping ability' }).min(1).max(10),
});

type FormValues = z.infer<typeof formSchema>;

type ResultPayload = {
  resiliencePercentage: number;
  resilienceScore: number;
  resilienceLevel: number;
  status: 'optimal' | 'good' | 'moderate' | 'low';
  interpretation: string;
  recommendations: string[];
  plan: { label: string; detail: string }[];
};

const steps = [
  'Enter stress level (1 = low, 10 = high).',
  'Optionally enter resilience score if measured (0-100).',
  'Enter your age (resilience can change with age).',
  'Rate overall coping ability (1 = poor, 10 = excellent).',
  'Review resilience score, percentage, and recommendations.',
];

const faqs = [
  {
    question: 'What is resilience?',
    answer:
      'Resilience is the ability to adapt, recover, and thrive in the face of adversity, stress, or trauma. It involves emotional, mental, and physical capacity to bounce back from challenges.',
  },
  {
    question: 'How is resilience measured?',
    answer:
      'Resilience can be measured through self-assessment tools, psychological scales, and behavioral indicators. Scores typically range from 0-100, with higher scores indicating greater resilience.',
  },
  {
    question: 'How does age affect resilience?',
    answer:
      'Resilience can vary with age. Young adults may have high energy but less experience, middle-aged adults often have developed coping strategies, and older adults may have wisdom but face different challenges.',
  },
  {
    question: 'What happens if I have low resilience?',
    answer:
      'Low resilience can make it harder to cope with stress, recover from setbacks, and maintain mental health. It may lead to increased anxiety, depression, and difficulty adapting to change.',
  },
  {
    question: 'How can I increase resilience?',
    answer:
      'Build resilience through: maintaining social connections, practicing mindfulness, developing problem-solving skills, staying physically active, getting adequate sleep, and seeking support when needed.',
  },
  {
    question: 'Does stress affect resilience?',
    answer:
      'Yes. Chronic high stress can deplete resilience over time. However, moderate stress can also help build resilience when managed effectively with appropriate coping strategies.',
  },
  {
    question: 'What about mental health conditions?',
    answer:
      'Mental health conditions can impact resilience. If you consistently have low resilience scores or difficulty coping, consult a healthcare provider or mental health professional for support.',
  },
  {
    question: 'Can I track resilience?',
    answer:
      'Yes. Regular self-assessment, journaling, and professional evaluations can help track resilience over time. Many psychological assessments measure resilience components.',
  },
  {
    question: 'Does exercise affect resilience?',
    answer:
      'Regular exercise can significantly improve resilience by reducing stress, improving mood, enhancing physical health, and building mental toughness through consistent challenge and recovery.',
  },
  {
    question: 'What is resilience training?',
    answer:
      'Resilience training involves developing skills and strategies to better handle stress and adversity. This can include cognitive-behavioral techniques, mindfulness, social skills, and stress management.',
  },
];

const relatedCalculators = [
  {
    name: 'Emotional Wellbeing Index Calculator',
    slug: 'emotional-wellbeing-index-calculator',
    description: 'Measure emotional wellbeing and resilience together.',
  },
  {
    name: 'Stress Hormone Balance Calculator (Cortisol vs Melatonin)',
    slug: 'stress-hormone-balance-calculator',
    description: 'Assess stress management alongside resilience.',
  },
  {
    name: 'Exercise Recovery Score (HRV + Sleep Integration)',
    slug: 'exercise-recovery-score-hrv-sleep-integration',
    description: 'Monitor recovery including resilience factors.',
  },
  {
    name: 'Meditation Streak Mindfulness Progress Tracker',
    slug: 'meditation-streak-mindfulness-progress-tracker',
    description: 'Build mindfulness habits that support resilience.',
  },
];

const baseUrl = 'https://mycalculating.com/health-fitness/resilience-score-calculator';

const schemaMarkup = {
  '@context': 'https://schema.org',
  '@graph': [
    {
      '@type': 'BreadcrumbList',
      itemListElement: [
        { '@type': 'ListItem', position: 1, name: 'Home', item: 'https://mycalculating.com' },
        { '@type': 'ListItem', position: 2, name: 'Health & Fitness', item: 'https://mycalculating.com/health-fitness' },
        { '@type': 'ListItem', position: 3, name: 'Resilience Wellness Score Calculator', item: baseUrl },
      ],
    },
    {
      '@type': 'SoftwareApplication',
      name: 'Resilience Wellness Score Calculator',
      applicationCategory: 'Calculator',
      operatingSystem: 'Web Browser',
      description: 'Calculate resilience score and percentage from stress level, resilience score, age, and coping ability.',
      url: baseUrl,
      offers: { '@type': 'Offer', price: '0', priceCurrency: 'USD' },
    },
  ],
};

const clamp = (value: number, min: number, max: number) => Math.min(max, Math.max(min, value));

const calculateResult = (values: FormValues): ResultPayload => {
  let resilienceScore: number;
  let resiliencePercentage: number;
  
  if (values.resilienceScore) {
    // Use provided resilience score
    resilienceScore = values.resilienceScore;
    resiliencePercentage = resilienceScore;
  } else {
    // Estimate resilience based on age, stress, and coping ability
    // Baseline resilience by age
    let baselineResilience: number;
    if (values.age < 30) {
      baselineResilience = 65; // ~65% for young adults
    } else if (values.age < 60) {
      baselineResilience = 70; // ~70% for middle-aged
    } else {
      baselineResilience = 68; // ~68% for older adults
    }
    
    // Adjust for stress level (high stress reduces resilience)
    const stressAdjustment = (10 - values.stressLevel) / 10; // 0 to 0.9
    // Adjust for coping ability (better coping increases resilience)
    const copingAdjustment = (values.copingAbility - 5) / 10; // -0.4 to +0.5
    resiliencePercentage = clamp(baselineResilience + (stressAdjustment * 15) + (copingAdjustment * 10), 20, 95); // Clamp to 20-95%
    resilienceScore = resiliencePercentage;
  }
  
  const resilienceLevel = resiliencePercentage / 10;

  let status: ResultPayload['status'] = 'optimal';
  let interpretation = 'This suggests a general lifestyle tendency where your resilience may appear optimal. You may consider continuing to maintain good coping strategies and stress management.';

  // Age-appropriate targets
  let targetResilience: number;
  if (values.age < 30) {
    targetResilience = 65; // 60-70% target
  } else if (values.age < 60) {
    targetResilience = 70; // 65-75% target
  } else {
    targetResilience = 68; // 63-73% target
  }

  if (resiliencePercentage < targetResilience - 15) {
    status = 'low';
    interpretation = 'This suggests a general lifestyle tendency where your resilience may appear low for your age. You may consider focusing on improving coping strategies, reducing stress, and building support networks.';
  } else if (resiliencePercentage < targetResilience - 5) {
    status = 'moderate';
    interpretation = 'This suggests a general lifestyle tendency where your resilience may be moderate. You may consider minor improvements in stress management and coping skills, which may optimize resilience.';
  } else if (resiliencePercentage < targetResilience + 10) {
    status = 'good';
    interpretation = 'This suggests a general lifestyle tendency where your resilience may be good. You may consider continuing to maintain current coping strategies and stress management practices.';
  }

  const recommendations = [
    'Maintain strong social connections and support networks to enhance resilience during challenging times.',
    'Practice stress management techniques (mindfulness, meditation, deep breathing) to build resilience capacity.',
    'Develop problem-solving skills and adaptive thinking to better handle adversity and setbacks.',
  ];
  if (status === 'low' || status === 'moderate') {
    recommendations.push('You may consider seeking professional guidance to develop resilience-building strategies and coping mechanisms. This is a personal insight, not a medical evaluation.');
  }
  if (values.copingAbility < 6) {
    recommendations.push('Focus on improving coping skills. Poor coping ability can reduce resilience and make stress management more difficult.');
  }

  const plan = [
    { label: 'This Week', detail: 'Assess current resilience using this calculator. Identify areas of strength and areas needing improvement.' },
    { label: 'This Month', detail: 'Implement resilience-building practices: regular exercise, mindfulness, social connection, and stress management techniques.' },
    { label: 'Ongoing', detail: 'Monitor resilience trends. If consistently low, consider consulting a mental health professional to develop personalized resilience strategies.' },
  ];

  return { resiliencePercentage, resilienceScore, resilienceLevel, status, interpretation, recommendations, plan };
};

export default function ResilienceScoreCalculator() {
  const [result, setResult] = useState<ResultPayload | null>(null);

  const form = useForm<FormValues>({
    resolver: zodResolver(formSchema),
    defaultValues: {
      stressLevel: undefined,
      resilienceScore: undefined,
      age: undefined,
      copingAbility: undefined,
    },
  });

  return (
    <div className="space-y-8">
      <Script id="resilience-score-schema" type="application/ld+json" strategy="afterInteractive" dangerouslySetInnerHTML={{ __html: JSON.stringify(schemaMarkup) }} />

      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <Shield className="h-5 w-5" />
            Resilience Score Calculator
          </CardTitle>
          <CardDescription>Get general wellness insights about resilience score and percentage from stress level, resilience score, age, and coping ability. This is a personal lifestyle insight, not a medical evaluation.</CardDescription>
        </CardHeader>
      </Card>

      <Card>
        <CardHeader>
          <CardTitle>Input your resilience data</CardTitle>
        </CardHeader>
        <CardContent>
          <Form {...form}>
            <form onSubmit={form.handleSubmit((values) => setResult(calculateResult(values)))} className="space-y-6">
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
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
                  name="resilienceScore"
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel>Resilience score (optional)</FormLabel>
                      <FormControl>
                        <Input type="number" step="1" placeholder="e.g., 75" value={field.value ?? ''} onChange={(e) => field.onChange(e.target.value === '' ? undefined : Number(e.target.value))} />
                      </FormControl>
                      <FormMessage />
                    </FormItem>
                  )}
                />
                <FormField
                  control={form.control}
                  name="age"
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel>Age (years)</FormLabel>
                      <FormControl>
                        <Input type="number" step="1" placeholder="e.g., 35" value={field.value ?? ''} onChange={(e) => field.onChange(e.target.value === '' ? undefined : Number(e.target.value))} />
                      </FormControl>
                      <FormMessage />
                    </FormItem>
                  )}
                />
                <FormField
                  control={form.control}
                  name="copingAbility"
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel>Coping ability (1-10)</FormLabel>
                      <FormControl>
                        <Input type="number" step="1" placeholder="e.g., 7" value={field.value ?? ''} onChange={(e) => field.onChange(e.target.value === '' ? undefined : Number(e.target.value))} />
                      </FormControl>
                      <FormMessage />
                    </FormItem>
                  )}
                />
              </div>
              <Button type="submit" className="w-full md:w-auto">
                Calculate resilience score
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
            <CardDescription>See resilience score, percentage, and recommendations.</CardDescription>
          </CardHeader>
          <CardContent className="space-y-6">
            <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
              <div className="p-4 border rounded">
                <p className="text-sm text-muted-foreground">Resilience percentage</p>
                <p className="text-2xl font-semibold text-primary">{result.resiliencePercentage.toFixed(1)}%</p>
                <p className="text-xs text-muted-foreground">Of maximum</p>
              </div>
              <div className="p-4 border rounded">
                <p className="text-sm text-muted-foreground">Resilience score</p>
                <p className="text-2xl font-semibold text-primary">{result.resilienceScore.toFixed(0)}</p>
                <p className="text-xs text-muted-foreground">Out of 100</p>
              </div>
              <div className="p-4 border rounded">
                <p className="text-sm text-muted-foreground">Resilience level</p>
                <p className="text-2xl font-semibold text-primary">{result.resilienceLevel.toFixed(1)}</p>
                <p className="text-xs text-muted-foreground">Out of 10</p>
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
            <strong>Resilience percentage</strong> = resilience score (0-100).
          </p>
          <p>
            <strong>If resilience score not provided</strong>: Estimated based on age (young adults ~65%, middle-aged ~70%, older ~68%) adjusted for stress level and coping ability.
          </p>
          <p>
            <strong>Age-appropriate targets</strong>: &lt;30 years: 60-70%, 30-60 years: 65-75%, 60+ years: 63-73%.
          </p>
          <p>Resilience is affected by stress level, coping ability, social support, physical health, and life experiences.</p>
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
                <p className="text-sm text-muted-foreground">Target resilience (age-based)</p>
                <p className="text-xl font-semibold text-primary">
                  {(() => {
                    const age = form.getValues().age ?? 30;
                    if (age < 30) return '60-70%';
                    if (age < 60) return '65-75%';
                    return '63-73%';
                  })()}
                </p>
                <p className="text-xs text-muted-foreground">Recommended range</p>
              </div>
              <div className="p-4 border rounded">
                <p className="text-sm text-muted-foreground">Resilience vs target</p>
                <p className="text-xl font-semibold text-primary">
                  {(() => {
                    const age = form.getValues().age ?? 30;
                    const target = age < 30 ? 65 : age < 60 ? 70 : 68;
                    const diff = result.resiliencePercentage - target;
                    return diff >= 0 ? `+${diff.toFixed(1)}%` : `${diff.toFixed(1)}%`;
                  })()}
                </p>
                <p className="text-xs text-muted-foreground">Difference from target</p>
              </div>
              <div className="p-4 border rounded">
                <p className="text-sm text-muted-foreground">Improvement potential</p>
                <p className="text-xl font-semibold text-primary">
                  {(100 - result.resiliencePercentage).toFixed(1)}%
                </p>
                <p className="text-xs text-muted-foreground">Room for growth</p>
              </div>
            </div>
          ) : (
            <p className="text-sm text-muted-foreground">Enter your resilience data to see additional insights.</p>
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
          <p>Resilience is the ability to adapt, recover, and thrive in the face of adversity, stress, or trauma. It involves emotional, mental, and physical capacity to bounce back from challenges.</p>
          <p>Use this calculator to assess resilience score and percentage from stress level, resilience score (if measured), age, and coping ability.</p>
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
          <p>This tool provides general wellness insights about resilience score and percentage from stress level, resilience score (optional), age, and coping ability. This is a personal lifestyle insight, not a medical evaluation.</p>
          <p>Outputs include resilience percentage, resilience score, resilience level, status, recommendations, an action plan, and supporting metrics.</p>
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


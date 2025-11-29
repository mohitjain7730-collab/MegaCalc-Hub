'use client';

import { useState } from 'react';
import Script from 'next/script';
import Link from 'next/link';
import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import { z } from 'zod';
import { Shield, TrendingUp, Target, Activity, Heart } from 'lucide-react';

import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Form, FormControl, FormField, FormItem, FormLabel, FormMessage } from '@/components/ui/form';
import { Input } from '@/components/ui/input';

const formSchema = z.object({
  moodFluctuation: z.number({ invalid_type_error: 'Enter mood fluctuation' }).min(1).max(10),
  emotionalReactivity: z.number({ invalid_type_error: 'Enter reactivity' }).min(1).max(10),
  stressResilience: z.number({ invalid_type_error: 'Enter stress resilience' }).min(1).max(10),
  emotionalRegulation: z.number({ invalid_type_error: 'Enter regulation' }).min(1).max(10),
  recoverySpeed: z.number({ invalid_type_error: 'Enter recovery speed' }).min(1).max(10),
  emotionalBalance: z.number({ invalid_type_error: 'Enter balance' }).min(1).max(10),
});

type FormValues = z.infer<typeof formSchema>;

type ResultPayload = {
  stabilityIndex: number;
  stabilityLevel: string;
  resilienceScore: number;
  status: 'highly-stable' | 'stable' | 'moderate' | 'unstable';
  interpretation: string;
  recommendations: string[];
  plan: { label: string; detail: string }[];
};

const steps = [
  'Rate mood fluctuation (1-10, 1 = very stable, 10 = highly variable moods).',
  'Rate emotional reactivity (1-10, 1 = calm responses, 10 = strong emotional reactions).',
  'Rate stress resilience (1-10, 10 = very resilient, handles stress well).',
  'Rate emotional regulation ability (1-10, 10 = excellent regulation skills).',
  'Rate recovery speed from emotional upsets (1-10, 10 = very quick recovery).',
  'Rate overall emotional balance (1-10, 10 = very balanced emotions).',
  'Review your emotional stability index and improvement recommendations.',
];

const faqs = [
  {
    question: 'What is emotional stability?',
    answer:
      'Emotional stability refers to the ability to maintain relatively consistent emotional states, regulate emotions effectively, recover from emotional upsets, and handle stress without excessive mood fluctuations or emotional reactivity.',
  },
  {
    question: 'What is a good emotional stability index?',
    answer:
      'Scores above 75 indicate high emotional stability. 60-75 is stable, 45-59 is moderate, and below 45 suggests opportunities to improve emotional regulation and stability.',
  },
  {
    question: 'Is emotional stability the same as suppressing emotions?',
    answer:
      'No. Emotional stability involves healthy emotional regulation—acknowledging, understanding, and managing emotions appropriately. Suppression is unhealthy and different from stability.',
  },
  {
    question: 'Can emotional stability be improved?',
    answer:
      'Yes, through: therapy/counseling, mindfulness and meditation practices, stress management techniques, emotional regulation skills training, self-awareness development, and healthy coping strategies.',
  },
  {
    question: 'What causes low emotional stability?',
    answer:
      'Factors include: chronic stress, trauma, mental health conditions, poor sleep, lack of emotional regulation skills, high emotional reactivity, mood disorders, and insufficient coping strategies.',
  },
  {
    question: 'How does stress affect emotional stability?',
    answer:
      'High stress reduces emotional stability by increasing reactivity, impairing regulation, and making recovery from emotional upsets more difficult. Stress management is crucial for emotional stability.',
  },
  {
    question: 'What are signs of emotional instability?',
    answer:
      'Signs include: frequent mood swings, intense emotional reactions to minor events, difficulty recovering from upsets, emotional outbursts, difficulty regulating emotions, and feeling emotionally overwhelmed.',
  },
  {
    question: 'Can meditation improve emotional stability?',
    answer:
      'Yes, meditation and mindfulness practices improve emotional regulation, reduce reactivity, enhance stress resilience, and support emotional stability through increased self-awareness and regulation skills.',
  },
  {
    question: 'Does sleep affect emotional stability?',
    answer:
      'Yes, poor sleep significantly impairs emotional regulation and stability. Adequate sleep (7-9 hours) is essential for emotional stability and effective emotional regulation.',
  },
  {
    question: 'When should I seek professional help for emotional instability?',
    answer:
      'Seek professional help if emotional instability significantly impacts daily life, relationships, work, or if you experience severe mood swings, emotional outbursts, or difficulty managing emotions despite self-help efforts.',
  },
];

const relatedCalculators = [
  {
    name: 'Emotional Wellbeing Index Calculator',
    slug: 'emotional-wellbeing-index-calculator',
    description: 'Assess overall emotional wellbeing related to stability.',
  },
  {
    name: 'Stress Hormone Balance Calculator',
    slug: 'stress-hormone-balance-calculator',
    description: 'Evaluate stress levels affecting emotional stability.',
  },
  {
    name: 'Meditation Stress Reduction Impact Calculator',
    slug: 'meditation-stress-reduction-impact-calculator',
    description: 'Assess stress reduction supporting emotional stability.',
  },
  {
    name: 'Happiness Index Calculator',
    slug: 'happiness-index-calculator',
    description: 'Evaluate happiness related to emotional stability.',
  },
];

const baseUrl = 'https://mycalculating.com/category/health-fitness/emotional-stability-index-calculator';

const schemaMarkup = {
  '@context': 'https://schema.org',
  '@graph': [
    {
      '@type': 'BreadcrumbList',
      itemListElement: [
        { '@type': 'ListItem', position: 1, name: 'Home', item: 'https://mycalculating.com' },
        { '@type': 'ListItem', position: 2, name: 'Health & Fitness', item: 'https://mycalculating.com/category/health-fitness' },
        { '@type': 'ListItem', position: 3, name: 'Emotional Stability Index Calculator', item: baseUrl },
      ],
    },
    {
      '@type': 'SoftwareApplication',
      name: 'Emotional Stability Index Calculator',
      applicationCategory: 'Calculator',
      operatingSystem: 'Web Browser',
      description: 'Assess emotional stability by evaluating mood fluctuation, emotional reactivity, stress resilience, regulation ability, recovery speed, and emotional balance.',
      url: baseUrl,
      offers: { '@type': 'Offer', price: '0', priceCurrency: 'USD' },
    },
  ],
};

const calculateResult = (values: FormValues): ResultPayload => {
  // Invert fluctuation and reactivity (lower is better for stability)
  const fluctuationScore = ((10 - values.moodFluctuation) / 10) * 20;
  const reactivityScore = ((10 - values.emotionalReactivity) / 10) * 20;
  
  // Positive factors (higher is better)
  const resilienceScore = (values.stressResilience / 10) * 20;
  const regulationScore = (values.emotionalRegulation / 10) * 20;
  const recoveryScore = (values.recoverySpeed / 10) * 10;
  const balanceScore = (values.emotionalBalance / 10) * 10;
  
  // Calculate stability index
  const stabilityIndex = Math.round(fluctuationScore + reactivityScore + resilienceScore + regulationScore + recoveryScore + balanceScore);
  
  // Calculate resilience score (weighted average)
  const resilience = Math.round((values.stressResilience + values.emotionalRegulation + values.recoverySpeed) / 3 * 10);
  
  let stabilityLevel: string;
  let interpretation: string;
  let status: ResultPayload['status'] = 'stable';
  
  if (stabilityIndex >= 75) {
    stabilityLevel = 'Highly Stable';
    interpretation = 'You have high emotional stability with good regulation, resilience, and balance. Excellent emotional health!';
    status = 'highly-stable';
  } else if (stabilityIndex >= 60) {
    stabilityLevel = 'Stable';
    interpretation = 'You have good emotional stability with generally effective regulation and resilience. Continue maintaining healthy emotional practices.';
    status = 'stable';
  } else if (stabilityIndex >= 45) {
    stabilityLevel = 'Moderate';
    interpretation = 'Your emotional stability is moderate. There are opportunities to improve regulation skills, reduce reactivity, and enhance resilience.';
    status = 'moderate';
  } else {
    stabilityLevel = 'Unstable';
    interpretation = 'Your emotional stability needs improvement. Focus on developing emotional regulation skills, stress management, and consider professional support if needed.';
    status = 'unstable';
  }
  
  const recommendations = [
    `Your stability index is ${stabilityIndex}/100. ${stabilityIndex >= 75 ? 'Excellent stability!' : stabilityIndex >= 60 ? 'Good stability with room for growth.' : 'Focus on improving emotional regulation and stability.'}`,
    'Develop emotional regulation skills: Practice identifying, understanding, and managing emotions. Use techniques like cognitive reappraisal, emotion labeling, and emotional acceptance.',
    'Practice mindfulness and meditation: Regular mindfulness practice improves emotional regulation, reduces reactivity, and enhances emotional stability.',
    'Manage stress effectively: High stress impairs emotional stability. Use stress management techniques like exercise, relaxation, and time management.',
    'Improve sleep quality: Adequate sleep (7-9 hours) is essential for emotional regulation and stability. Poor sleep significantly impairs emotional stability.',
    'Develop healthy coping strategies: Build a toolkit of healthy coping strategies for managing difficult emotions (exercise, talking to others, creative activities, etc.).',
    'Seek social support: Strong social connections and support improve emotional stability. Share feelings with trusted friends, family, or professionals.',
    'Practice emotional awareness: Increase awareness of your emotional patterns, triggers, and responses. Journaling can help develop this awareness.',
    'Consider professional support: If emotional instability significantly impacts your life, consider therapy or counseling to develop emotional regulation skills.',
  ];
  
  const plan = [
    { label: 'Daily', detail: 'Practice emotional awareness and regulation techniques. Use mindfulness or breathing exercises when feeling emotionally reactive.' },
    { label: 'Weekly', detail: 'Engage in stress management activities. Reflect on emotional patterns and triggers. Practice healthy coping strategies.' },
    { label: 'Monthly', detail: 'Re-assess emotional stability. Track improvements in regulation and resilience. Consider professional support if needed.' },
  ];
  
  return {
    stabilityIndex,
    stabilityLevel,
    resilienceScore: resilience,
    status,
    interpretation,
    recommendations,
    plan,
  };
};

export default function EmotionalStabilityIndexCalculator() {
  const [result, setResult] = useState<ResultPayload | null>(null);
  
  const form = useForm<FormValues>({
    resolver: zodResolver(formSchema),
    defaultValues: {
      moodFluctuation: undefined,
      emotionalReactivity: undefined,
      stressResilience: undefined,
      emotionalRegulation: undefined,
      recoverySpeed: undefined,
      emotionalBalance: undefined,
    },
  });
  
  return (
    <div className="space-y-8">
      <Script id="esi-schema" type="application/ld+json" strategy="afterInteractive" dangerouslySetInnerHTML={{ __html: JSON.stringify(schemaMarkup) }} />
      
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <Shield className="h-5 w-5" />
            Emotional Stability Index Calculator
          </CardTitle>
          <CardDescription>Assess emotional stability by evaluating mood fluctuation, emotional reactivity, stress resilience, regulation ability, recovery speed, and emotional balance.</CardDescription>
        </CardHeader>
      </Card>
      
      <Card>
        <CardHeader>
          <CardTitle>Input your emotional stability metrics</CardTitle>
        </CardHeader>
        <CardContent>
          <Form {...form}>
            <form onSubmit={form.handleSubmit((values) => setResult(calculateResult(values)))} className="space-y-6">
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <FormField
                  control={form.control}
                  name="moodFluctuation"
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel>Mood fluctuation (1-10, 1 = stable, 10 = highly variable)</FormLabel>
                      <FormControl>
                        <Input type="number" step="1" placeholder="e.g., 4" value={field.value ?? ''} onChange={(e) => field.onChange(e.target.value === '' ? undefined : Number(e.target.value))} />
                      </FormControl>
                      <FormMessage />
                    </FormItem>
                  )}
                />
                <FormField
                  control={form.control}
                  name="emotionalReactivity"
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel>Emotional reactivity (1-10, 1 = calm, 10 = strong reactions)</FormLabel>
                      <FormControl>
                        <Input type="number" step="1" placeholder="e.g., 5" value={field.value ?? ''} onChange={(e) => field.onChange(e.target.value === '' ? undefined : Number(e.target.value))} />
                      </FormControl>
                      <FormMessage />
                    </FormItem>
                  )}
                />
                <FormField
                  control={form.control}
                  name="stressResilience"
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel>Stress resilience (1-10, 10 = very resilient)</FormLabel>
                      <FormControl>
                        <Input type="number" step="1" placeholder="e.g., 7" value={field.value ?? ''} onChange={(e) => field.onChange(e.target.value === '' ? undefined : Number(e.target.value))} />
                      </FormControl>
                      <FormMessage />
                    </FormItem>
                  )}
                />
                <FormField
                  control={form.control}
                  name="emotionalRegulation"
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel>Emotional regulation ability (1-10, 10 = excellent)</FormLabel>
                      <FormControl>
                        <Input type="number" step="1" placeholder="e.g., 7" value={field.value ?? ''} onChange={(e) => field.onChange(e.target.value === '' ? undefined : Number(e.target.value))} />
                      </FormControl>
                      <FormMessage />
                    </FormItem>
                  )}
                />
                <FormField
                  control={form.control}
                  name="recoverySpeed"
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel>Recovery speed from upsets (1-10, 10 = very quick)</FormLabel>
                      <FormControl>
                        <Input type="number" step="1" placeholder="e.g., 6" value={field.value ?? ''} onChange={(e) => field.onChange(e.target.value === '' ? undefined : Number(e.target.value))} />
                      </FormControl>
                      <FormMessage />
                    </FormItem>
                  )}
                />
                <FormField
                  control={form.control}
                  name="emotionalBalance"
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel>Emotional balance (1-10, 10 = very balanced)</FormLabel>
                      <FormControl>
                        <Input type="number" step="1" placeholder="e.g., 7" value={field.value ?? ''} onChange={(e) => field.onChange(e.target.value === '' ? undefined : Number(e.target.value))} />
                      </FormControl>
                      <FormMessage />
                    </FormItem>
                  )}
                />
              </div>
              <Button type="submit" className="w-full md:w-auto">
                Calculate Emotional Stability Index
              </Button>
            </form>
          </Form>
        </CardContent>
      </Card>
      
      {result && (
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <TrendingUp className="h-5 w-5 text-primary" />
              Interactive results
            </CardTitle>
            <CardDescription>See your emotional stability index and improvement recommendations.</CardDescription>
          </CardHeader>
          <CardContent className="space-y-6">
            <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
              <div className="p-4 border rounded">
                <p className="text-sm text-muted-foreground">Stability Index</p>
                <p className="text-2xl font-semibold text-primary">{result.stabilityIndex}</p>
                <p className="text-xs text-muted-foreground">Out of 100</p>
              </div>
              <div className="p-4 border rounded">
                <p className="text-sm text-muted-foreground">Stability Level</p>
                <p className="text-2xl font-semibold text-primary">{result.stabilityLevel}</p>
                <p className="text-xs text-muted-foreground">Current status</p>
              </div>
              <div className="p-4 border rounded">
                <p className="text-sm text-muted-foreground">Resilience Score</p>
                <p className="text-2xl font-semibold text-primary">{result.resilienceScore}</p>
                <p className="text-xs text-muted-foreground">Out of 100</p>
              </div>
              <div className="p-4 border rounded">
                <p className="text-sm text-muted-foreground">Status</p>
                <p className="text-2xl font-semibold text-primary capitalize">{result.status.replace('-', ' ')}</p>
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
                    <Heart className="h-4 w-4" />
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
            <Activity className="h-5 w-5" />
            Formula
          </CardTitle>
        </CardHeader>
        <CardContent className="text-sm text-muted-foreground space-y-2">
          <p>
            <strong>Stability Index</strong> = Fluctuation Score + Reactivity Score + Resilience Score + Regulation Score + Recovery Score + Balance Score
          </p>
          <p>
            <strong>Fluctuation Score</strong> = ((10 - Mood Fluctuation) / 10) × 20
          </p>
          <p>
            <strong>Reactivity Score</strong> = ((10 - Emotional Reactivity) / 10) × 20
          </p>
          <p>
            <strong>Resilience Score</strong> = (Stress Resilience / 10) × 20
          </p>
          <p>
            <strong>Regulation Score</strong> = (Emotional Regulation / 10) × 20
          </p>
          <p>
            <strong>Recovery Score</strong> = (Recovery Speed / 10) × 10
          </p>
          <p>
            <strong>Balance Score</strong> = (Emotional Balance / 10) × 10
          </p>
          <p>
            <strong>Resilience Score</strong> = ((Stress Resilience + Emotional Regulation + Recovery Speed) / 3) × 10
          </p>
          <p>Index ranges from 0-100, with higher scores indicating greater emotional stability.</p>
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
          <p>
            Emotional stability refers to the ability to maintain consistent emotional states, regulate emotions effectively, and handle stress and emotional challenges without excessive mood fluctuations or reactivity. It involves emotional regulation skills, stress resilience, and the ability to recover from emotional upsets.
          </p>
          <p>
            This calculator assesses your emotional stability by evaluating mood fluctuation, emotional reactivity, stress resilience, emotional regulation ability, recovery speed from upsets, and overall emotional balance. Understanding your emotional stability helps you develop strategies to improve regulation skills and enhance emotional health.
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
            <Activity className="h-5 w-5" />
            Summary
          </CardTitle>
        </CardHeader>
        <CardContent className="space-y-2 text-sm text-muted-foreground">
          <p>This tool assesses emotional stability by evaluating mood fluctuation, emotional reactivity, stress resilience, regulation ability, recovery speed, and emotional balance.</p>
          <p>Outputs include an emotional stability index, stability level, resilience score, interpretation, recommendations, and an action plan.</p>
          <p>Formula, steps, guide content, related tools, and FAQs ensure humans or AI assistants can interpret the methodology instantly.</p>
        </CardContent>
      </Card>
    </div>
  );
}

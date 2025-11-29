'use client';

import { useState } from 'react';
import Script from 'next/script';
import Link from 'next/link';
import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import { z } from 'zod';
import { Heart, Wind, Target, Shield, TrendingDown } from 'lucide-react';

import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Form, FormControl, FormField, FormItem, FormLabel, FormMessage } from '@/components/ui/form';
import { Input } from '@/components/ui/input';

const formSchema = z.object({
  baselineStressLevel: z.number({ invalid_type_error: 'Enter baseline stress' }).min(1).max(10),
  currentStressLevel: z.number({ invalid_type_error: 'Enter current stress' }).min(1).max(10),
  meditationFrequency: z.number({ invalid_type_error: 'Enter frequency' }).min(0).max(7),
  averageSessionMinutes: z.number({ invalid_type_error: 'Enter minutes' }).min(0).max(120),
  practiceDurationWeeks: z.number({ invalid_type_error: 'Enter weeks' }).min(0).max(52),
  stressReductionNoticed: z.number({ invalid_type_error: 'Enter reduction level' }).min(1).max(10),
});

type FormValues = z.infer<typeof formSchema>;

type ResultPayload = {
  stressReductionScore: number;
  reductionPercentage: number;
  impactLevel: string;
  status: 'high-impact' | 'moderate-impact' | 'low-impact' | 'no-impact';
  interpretation: string;
  recommendations: string[];
  plan: { label: string; detail: string }[];
};

const steps = [
  'Rate your baseline stress level before starting meditation practice (1-10, 10 = extreme stress).',
  'Rate your current stress level (1-10, 10 = extreme stress).',
  'Enter how many days per week you practice meditation (0-7).',
  'Enter average minutes per meditation session.',
  'Enter number of weeks you\'ve been practicing meditation.',
  'Rate how much stress reduction you\'ve noticed (1-10, 10 = significant reduction).',
  'Review your meditation stress reduction impact score and recommendations.',
];

const faqs = [
  {
    question: 'How does meditation reduce stress?',
    answer:
      'Meditation activates the relaxation response, reduces cortisol levels, calms the nervous system, improves emotional regulation, and enhances resilience. Regular practice rewires the brain to respond more calmly to stressors.',
  },
  {
    question: 'How quickly does meditation reduce stress?',
    answer:
      'Some people notice immediate stress reduction after a single session. Consistent practice over 2-4 weeks typically shows measurable improvements. Maximum benefits develop over 8-12 weeks of regular practice.',
  },
  {
    question: 'What is a good meditation stress reduction impact score?',
    answer:
      'Scores above 75 indicate high impact. 60-75 is moderate impact. 45-59 is low impact. Below 45 suggests minimal impact—consider increasing frequency, duration, or trying different meditation techniques.',
  },
  {
    question: 'How often should I meditate to reduce stress?',
    answer:
      'Research suggests meditating 3-5 times per week provides stress reduction benefits. Daily practice (5-6 days per week) typically yields stronger results. Consistency matters more than duration.',
  },
  {
    question: 'How long should meditation sessions be for stress reduction?',
    answer:
      'Even 5-10 minutes daily can provide stress reduction benefits. 15-20 minutes per session is optimal for most people. Longer sessions (30+ minutes) may provide additional benefits but aren\'t necessary for stress reduction.',
  },
  {
    question: 'What types of meditation are best for stress reduction?',
    answer:
      'Mindfulness meditation, body scan meditation, loving-kindness meditation, and breath-focused meditation are all effective for stress reduction. Choose a style that resonates with you and feels manageable.',
  },
  {
    question: 'Can meditation help with chronic stress?',
    answer:
      'Yes, meditation is particularly effective for chronic stress. Regular practice helps reduce baseline stress levels, improves stress reactivity, and builds resilience. It may take longer to see results with chronic stress, but benefits are significant.',
  },
  {
    question: 'What if meditation doesn\'t seem to reduce my stress?',
    answer:
      'If meditation isn\'t reducing stress, try: increasing frequency or duration, trying different meditation techniques, seeking guidance from a teacher, ensuring you\'re practicing correctly, and being patient—benefits accumulate over time.',
  },
  {
    question: 'Does the time of day matter for stress-reducing meditation?',
    answer:
      'Morning meditation can set a calmer tone for the day. Evening meditation can help process the day\'s stressors. Some people benefit from both. Choose times that work consistently for your schedule.',
  },
  {
    question: 'How does meditation stress reduction compare to other methods?',
    answer:
      'Meditation is one of the most evidence-based stress reduction methods, comparable to or better than exercise, relaxation techniques, and some medications for managing stress. It\'s free, accessible, and has no side effects.',
  },
];

const relatedCalculators = [
  {
    name: 'Meditation Streak Mindfulness Progress Tracker',
    slug: 'meditation-streak-mindfulness-progress-tracker',
    description: 'Track meditation consistency that enhances stress reduction.',
  },
  {
    name: 'Stress Hormone Balance Calculator',
    slug: 'stress-hormone-balance-calculator',
    description: 'Measure stress hormones affected by meditation practice.',
  },
  {
    name: 'Emotional Wellbeing Index Calculator',
    slug: 'emotional-wellbeing-index-calculator',
    description: 'Assess emotional wellbeing improved by stress reduction.',
  },
  {
    name: 'Mindfulness Consistency Score Calculator',
    slug: 'mindfulness-consistency-score-calculator',
    description: 'Evaluate mindfulness consistency supporting stress reduction.',
  },
];

const baseUrl = 'https://mycalculating.com/category/health-fitness/meditation-stress-reduction-impact-calculator';

const schemaMarkup = {
  '@context': 'https://schema.org',
  '@graph': [
    {
      '@type': 'BreadcrumbList',
      itemListElement: [
        { '@type': 'ListItem', position: 1, name: 'Home', item: 'https://mycalculating.com' },
        { '@type': 'ListItem', position: 2, name: 'Health & Fitness', item: 'https://mycalculating.com/category/health-fitness' },
        { '@type': 'ListItem', position: 3, name: 'Meditation Stress Reduction Impact Calculator', item: baseUrl },
      ],
    },
    {
      '@type': 'SoftwareApplication',
      name: 'Meditation Stress Reduction Impact Calculator',
      applicationCategory: 'Calculator',
      operatingSystem: 'Web Browser',
      description: 'Measure the impact of meditation practice on stress reduction by comparing baseline and current stress levels, meditation frequency, duration, and practice length.',
      url: baseUrl,
      offers: { '@type': 'Offer', price: '0', priceCurrency: 'USD' },
    },
  ],
};

const calculateResult = (values: FormValues): ResultPayload => {
  // Calculate stress reduction
  const stressChange = values.baselineStressLevel - values.currentStressLevel;
  const reductionPercentage = Math.round((stressChange / values.baselineStressLevel) * 100);
  
  // Calculate frequency score
  const frequencyScore = (values.meditationFrequency / 7) * 25;
  
  // Calculate duration score
  const durationScore = Math.min((values.averageSessionMinutes / 20) * 25, 25);
  
  // Calculate practice length score
  const practiceLengthScore = Math.min((values.practiceDurationWeeks / 12) * 20, 20);
  
  // Calculate perceived reduction score
  const perceivedScore = (values.stressReductionNoticed / 10) * 20;
  
  // Calculate actual reduction score
  const actualReductionScore = (stressChange / 9) * 10; // Max change is 9 (10 to 1)
  
  // Total stress reduction score
  const stressReductionScore = Math.round(Math.max(0, Math.min(100, frequencyScore + durationScore + practiceLengthScore + perceivedScore + actualReductionScore)));
  
  let impactLevel: string;
  let interpretation: string;
  let status: ResultPayload['status'] = 'moderate-impact';
  
  if (stressReductionScore >= 75) {
    impactLevel = 'High Impact';
    interpretation = 'Meditation is having a strong positive impact on your stress levels. Continue your current practice for sustained benefits.';
    status = 'high-impact';
  } else if (stressReductionScore >= 60) {
    impactLevel = 'Moderate Impact';
    interpretation = 'Meditation is providing moderate stress reduction benefits. Consider increasing frequency or duration for stronger results.';
    status = 'moderate-impact';
  } else if (stressReductionScore >= 45) {
    impactLevel = 'Low Impact';
    interpretation = 'Meditation is showing some stress reduction, but impact is limited. Increase practice frequency, duration, or try different techniques.';
    status = 'low-impact';
  } else {
    impactLevel = 'Minimal Impact';
    interpretation = 'Limited stress reduction impact detected. Review your practice approach, increase consistency, or seek guidance to maximize benefits.';
    status = 'no-impact';
  }
  
  const recommendations = [
    `Your stress reduction is ${reductionPercentage > 0 ? reductionPercentage + '%' : 'minimal'}. ${reductionPercentage > 50 ? 'Excellent progress!' : reductionPercentage > 30 ? 'Good progress. Continue building on this.' : 'Consider strategies to enhance stress reduction.'}`,
    'Increase meditation frequency: Aim for at least 5-6 days per week. Consistency is key for stress reduction benefits.',
    `You're practicing ${values.meditationFrequency} days per week. ${values.meditationFrequency >= 5 ? 'Great frequency!' : 'Consider increasing to 5-6 days for better stress reduction.'}`,
    `Average session duration: ${values.averageSessionMinutes} minutes. ${values.averageSessionMinutes >= 15 ? 'Good duration.' : 'Consider increasing to 15-20 minutes for optimal stress reduction.'}`,
    `Practice duration: ${values.practiceDurationWeeks} weeks. ${values.practiceDurationWeeks >= 8 ? 'Excellent consistency!' : 'Continue practicing—benefits accumulate over time. Most people see significant improvements after 8-12 weeks.'}`,
    'Try different meditation techniques: If current practice isn\'t effective, explore mindfulness meditation, body scan, loving-kindness, or breath-focused meditation.',
    'Practice at consistent times: Establishing a routine helps meditation become a reliable stress-reduction tool.',
    'Combine with other stress-reduction strategies: Exercise, adequate sleep, social support, and healthy coping strategies enhance meditation\'s stress-reduction benefits.',
    'Be patient and consistent: Stress reduction from meditation builds gradually. Regular practice over weeks and months yields cumulative benefits.',
  ];
  
  const plan = [
    { label: 'This Week', detail: 'Aim for 5-6 meditation sessions. Practice 15-20 minutes per session. Track stress levels before and after sessions.' },
    { label: 'This Month', detail: 'Maintain consistent practice schedule. Explore different meditation techniques. Monitor stress reduction improvements.' },
    { label: 'This Quarter', detail: 'Continue regular practice. Assess overall stress reduction impact. Adjust practice as needed for optimal benefits.' },
  ];
  
  return {
    stressReductionScore,
    reductionPercentage: Math.max(0, Math.min(100, reductionPercentage)),
    impactLevel,
    status,
    interpretation,
    recommendations,
    plan,
  };
};

export default function MeditationStressReductionImpactCalculator() {
  const [result, setResult] = useState<ResultPayload | null>(null);
  
  const form = useForm<FormValues>({
    resolver: zodResolver(formSchema),
    defaultValues: {
      baselineStressLevel: undefined,
      currentStressLevel: undefined,
      meditationFrequency: undefined,
      averageSessionMinutes: undefined,
      practiceDurationWeeks: undefined,
      stressReductionNoticed: undefined,
    },
  });
  
  return (
    <div className="space-y-8">
      <Script id="msri-schema" type="application/ld+json" strategy="afterInteractive" dangerouslySetInnerHTML={{ __html: JSON.stringify(schemaMarkup) }} />
      
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <Heart className="h-5 w-5" />
            Meditation Stress Reduction Impact Calculator
          </CardTitle>
          <CardDescription>Measure the impact of meditation practice on stress reduction by comparing baseline and current stress levels, meditation frequency, duration, and practice length.</CardDescription>
        </CardHeader>
      </Card>
      
      <Card>
        <CardHeader>
          <CardTitle>Input your meditation and stress data</CardTitle>
        </CardHeader>
        <CardContent>
          <Form {...form}>
            <form onSubmit={form.handleSubmit((values) => setResult(calculateResult(values)))} className="space-y-6">
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <FormField
                  control={form.control}
                  name="baselineStressLevel"
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel>Baseline stress level before meditation (1-10)</FormLabel>
                      <FormControl>
                        <Input type="number" step="1" placeholder="e.g., 8" value={field.value ?? ''} onChange={(e) => field.onChange(e.target.value === '' ? undefined : Number(e.target.value))} />
                      </FormControl>
                      <FormMessage />
                    </FormItem>
                  )}
                />
                <FormField
                  control={form.control}
                  name="currentStressLevel"
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel>Current stress level (1-10)</FormLabel>
                      <FormControl>
                        <Input type="number" step="1" placeholder="e.g., 5" value={field.value ?? ''} onChange={(e) => field.onChange(e.target.value === '' ? undefined : Number(e.target.value))} />
                      </FormControl>
                      <FormMessage />
                    </FormItem>
                  )}
                />
                <FormField
                  control={form.control}
                  name="meditationFrequency"
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel>Meditation frequency (days per week, 0-7)</FormLabel>
                      <FormControl>
                        <Input type="number" step="1" placeholder="e.g., 5" value={field.value ?? ''} onChange={(e) => field.onChange(e.target.value === '' ? undefined : Number(e.target.value))} />
                      </FormControl>
                      <FormMessage />
                    </FormItem>
                  )}
                />
                <FormField
                  control={form.control}
                  name="averageSessionMinutes"
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel>Average session minutes</FormLabel>
                      <FormControl>
                        <Input type="number" step="1" placeholder="e.g., 20" value={field.value ?? ''} onChange={(e) => field.onChange(e.target.value === '' ? undefined : Number(e.target.value))} />
                      </FormControl>
                      <FormMessage />
                    </FormItem>
                  )}
                />
                <FormField
                  control={form.control}
                  name="practiceDurationWeeks"
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel>Practice duration (weeks)</FormLabel>
                      <FormControl>
                        <Input type="number" step="1" placeholder="e.g., 8" value={field.value ?? ''} onChange={(e) => field.onChange(e.target.value === '' ? undefined : Number(e.target.value))} />
                      </FormControl>
                      <FormMessage />
                    </FormItem>
                  )}
                />
                <FormField
                  control={form.control}
                  name="stressReductionNoticed"
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel>Stress reduction noticed (1-10, 10 = significant)</FormLabel>
                      <FormControl>
                        <Input type="number" step="1" placeholder="e.g., 7" value={field.value ?? ''} onChange={(e) => field.onChange(e.target.value === '' ? undefined : Number(e.target.value))} />
                      </FormControl>
                      <FormMessage />
                    </FormItem>
                  )}
                />
              </div>
              <Button type="submit" className="w-full md:w-auto">
                Calculate Stress Reduction Impact
              </Button>
            </form>
          </Form>
        </CardContent>
      </Card>
      
      {result && (
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <TrendingDown className="h-5 w-5 text-primary" />
              Interactive results
            </CardTitle>
            <CardDescription>See your meditation stress reduction impact score and recommendations.</CardDescription>
          </CardHeader>
          <CardContent className="space-y-6">
            <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
              <div className="p-4 border rounded">
                <p className="text-sm text-muted-foreground">Impact Score</p>
                <p className="text-2xl font-semibold text-primary">{result.stressReductionScore}</p>
                <p className="text-xs text-muted-foreground">Out of 100</p>
              </div>
              <div className="p-4 border rounded">
                <p className="text-sm text-muted-foreground">Reduction %</p>
                <p className="text-2xl font-semibold text-primary">{result.reductionPercentage}%</p>
                <p className="text-xs text-muted-foreground">Stress reduction</p>
              </div>
              <div className="p-4 border rounded">
                <p className="text-sm text-muted-foreground">Impact Level</p>
                <p className="text-2xl font-semibold text-primary">{result.impactLevel}</p>
                <p className="text-xs text-muted-foreground">Current status</p>
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
                    <Wind className="h-4 w-4" />
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
            <strong>Stress Reduction Score</strong> = Frequency Score + Duration Score + Practice Length Score + Perceived Score + Actual Reduction Score
          </p>
          <p>
            <strong>Frequency Score</strong> = (Meditation Frequency / 7) × 25
          </p>
          <p>
            <strong>Duration Score</strong> = Min((Average Session Minutes / 20) × 25, 25)
          </p>
          <p>
            <strong>Practice Length Score</strong> = Min((Practice Duration Weeks / 12) × 20, 20)
          </p>
          <p>
            <strong>Perceived Score</strong> = (Stress Reduction Noticed / 10) × 20
          </p>
          <p>
            <strong>Actual Reduction Score</strong> = (Stress Change / 9) × 10
          </p>
          <p>
            <strong>Reduction Percentage</strong> = ((Baseline Stress - Current Stress) / Baseline Stress) × 100
          </p>
          <p>Score ranges from 0-100, with higher scores indicating greater stress reduction impact from meditation practice.</p>
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
            Meditation is one of the most evidence-based methods for stress reduction. Regular meditation practice activates the relaxation response, reduces stress hormones like cortisol, calms the nervous system, and improves emotional regulation. This calculator measures the impact of your meditation practice on stress reduction by comparing baseline and current stress levels, along with practice frequency, duration, and consistency.
          </p>
          <p>
            Understanding your meditation stress reduction impact helps you optimize your practice for maximum benefits. Whether you\'re just starting or have been practicing for months, tracking your progress and adjusting your approach can enhance the stress-reduction benefits of meditation.
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
          <p>This tool measures the impact of meditation practice on stress reduction by comparing baseline and current stress levels, practice frequency, duration, and length.</p>
          <p>Outputs include a stress reduction impact score, reduction percentage, impact level, interpretation, recommendations, and an action plan.</p>
          <p>Formula, steps, guide content, related tools, and FAQs ensure humans or AI assistants can interpret the methodology instantly.</p>
        </CardContent>
      </Card>
    </div>
  );
}
'use client';

import { useState } from 'react';
import Script from 'next/script';
import Link from 'next/link';
import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import { z } from 'zod';
import { Flower2, Calendar, Target, Shield, TrendingUp } from 'lucide-react';

import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Form, FormControl, FormField, FormItem, FormLabel, FormMessage } from '@/components/ui/form';
import { Input } from '@/components/ui/input';

const formSchema = z.object({
  practiceDaysPerWeek: z.number({ invalid_type_error: 'Enter practice days' }).min(0).max(7),
  averageMinutesPerDay: z.number({ invalid_type_error: 'Enter minutes' }).min(0).max(120),
  formalPracticeSessions: z.number({ invalid_type_error: 'Enter sessions' }).min(0).max(21),
  informalPracticeMoments: z.number({ invalid_type_error: 'Enter moments' }).min(0).max(50),
  consistencyStreak: z.number({ invalid_type_error: 'Enter streak days' }).min(0).max(365),
  practiceQuality: z.number({ invalid_type_error: 'Enter quality' }).min(1).max(10),
});

type FormValues = z.infer<typeof formSchema>;

type ResultPayload = {
  consistencyScore: number;
  practiceLevel: string;
  qualityIndex: number;
  status: 'highly-consistent' | 'consistent' | 'moderate' | 'inconsistent';
  interpretation: string;
  recommendations: string[];
  plan: { label: string; detail: string }[];
};

const steps = [
  'Count number of days per week you practice mindfulness (0-7).',
  'Enter average minutes of mindfulness practice per day.',
  'Count number of formal practice sessions per week (sitting meditation, body scan, etc.).',
  'Count number of informal mindfulness moments per week (mindful breathing, mindful walking, etc.).',
  'Enter your current consistency streak in days (0 if starting).',
  'Rate practice quality (1-10, 10 = high quality, present, and focused).',
  'Review your mindfulness consistency score and recommendations.',
];

const faqs = [
  {
    question: 'What is mindfulness consistency?',
    answer:
      'Mindfulness consistency refers to the regularity and frequency of mindfulness practice. Consistent practice—both formal (meditation sessions) and informal (mindful moments throughout the day)—is key to experiencing the benefits of mindfulness.',
  },
  {
    question: 'What counts as mindfulness practice?',
    answer:
      'Mindfulness practice includes: formal meditation (sitting, walking, body scan), informal practices (mindful breathing, mindful eating, mindful activities), and mindfulness exercises. Both structured sessions and brief mindful moments count.',
  },
  {
    question: 'How often should I practice mindfulness?',
    answer:
      'Research suggests practicing mindfulness 3-5 times per week provides benefits. Daily practice is ideal for maximum benefits. Consistency matters more than duration—even 5-10 minutes daily is more effective than longer, irregular sessions.',
  },
  {
    question: 'What is a good mindfulness consistency score?',
    answer:
      'Scores above 75 indicate highly consistent practice. 60-75 is consistent, 45-59 is moderate, and below 45 suggests opportunities to increase consistency for better mindfulness benefits.',
  },
  {
    question: 'Does practice quality matter?',
    answer:
      'Yes, quality matters. Present-moment awareness, non-judgmental attention, and focused practice enhance benefits. However, consistency is foundational—regular practice, even if imperfect, builds mindfulness skills.',
  },
  {
    question: 'What is the difference between formal and informal practice?',
    answer:
      'Formal practice is dedicated mindfulness sessions (meditation, body scan). Informal practice is bringing mindfulness to daily activities (mindful breathing, mindful walking, mindful tasks). Both are valuable and complementary.',
  },
  {
    question: 'Can I build consistency if I\'m a beginner?',
    answer:
      'Yes, start small: 5-10 minutes daily, use guided meditations, set reminders, link practice to existing habits, and be patient with yourself. Building consistency gradually is more sustainable than attempting long sessions immediately.',
  },
  {
    question: 'What if I miss days or break my streak?',
    answer:
      'Missing days is normal. Don\'t let perfectionism stop you. Return to practice as soon as possible. One missed day doesn\'t erase progress. Focus on long-term consistency rather than perfect streaks.',
  },
  {
    question: 'How does consistency relate to mindfulness benefits?',
    answer:
      'Consistent practice builds mindfulness skills, neural pathways, and habits. Regular practice leads to greater improvements in stress reduction, emotional regulation, attention, and overall wellbeing compared to sporadic practice.',
  },
  {
    question: 'Can informal practice count toward consistency?',
    answer:
      'Yes, informal mindfulness moments throughout the day count and are valuable for building mindfulness skills. Combining formal sessions with informal practice creates a comprehensive mindfulness routine.',
  },
];

const relatedCalculators = [
  {
    name: 'Meditation Streak Mindfulness Progress Tracker',
    slug: 'meditation-streak-mindfulness-progress-tracker',
    description: 'Track meditation streak and mindfulness progress.',
  },
  {
    name: 'Stress Hormone Balance Calculator',
    slug: 'stress-hormone-balance-calculator',
    description: 'Measure stress reduction from consistent mindfulness.',
  },
  {
    name: 'Emotional Wellbeing Index Calculator',
    slug: 'emotional-wellbeing-index-calculator',
    description: 'Assess emotional wellbeing enhanced by mindfulness.',
  },
  {
    name: 'Happiness Index Calculator',
    slug: 'happiness-index-calculator',
    description: 'Evaluate happiness supported by mindfulness practice.',
  },
];

const baseUrl = 'https://mycalculating.com/category/health-fitness/mindfulness-consistency-score-calculator';

const schemaMarkup = {
  '@context': 'https://schema.org',
  '@graph': [
    {
      '@type': 'BreadcrumbList',
      itemListElement: [
        { '@type': 'ListItem', position: 1, name: 'Home', item: 'https://mycalculating.com' },
        { '@type': 'ListItem', position: 2, name: 'Health & Fitness', item: 'https://mycalculating.com/category/health-fitness' },
        { '@type': 'ListItem', position: 3, name: 'Mindfulness Consistency Score Calculator', item: baseUrl },
      ],
    },
    {
      '@type': 'SoftwareApplication',
      name: 'Mindfulness Consistency Score Calculator',
      applicationCategory: 'Calculator',
      operatingSystem: 'Web Browser',
      description: 'Calculate mindfulness practice consistency score based on practice frequency, duration, formal sessions, informal moments, streak, and quality to assess mindfulness habits.',
      url: baseUrl,
      offers: { '@type': 'Offer', price: '0', priceCurrency: 'USD' },
    },
  ],
};

const calculateResult = (values: FormValues): ResultPayload => {
  // Calculate frequency component (days per week)
  const frequencyScore = (values.practiceDaysPerWeek / 7) * 30;
  
  // Calculate duration component (minutes per day)
  const durationScore = Math.min((values.averageMinutesPerDay / 20) * 20, 20);
  
  // Calculate formal practice component
  const formalPracticeScore = Math.min((values.formalPracticeSessions / 7) * 15, 15);
  
  // Calculate informal practice component
  const informalPracticeScore = Math.min((values.informalPracticeMoments / 14) * 15, 15);
  
  // Calculate streak component
  const streakScore = Math.min((values.consistencyStreak / 90) * 10, 10);
  
  // Calculate quality component
  const qualityScore = (values.practiceQuality / 10) * 10;
  
  // Total consistency score
  const consistencyScore = Math.round(frequencyScore + durationScore + formalPracticeScore + informalPracticeScore + streakScore + qualityScore);
  
  // Quality index
  const qualityIndex = Math.round(values.practiceQuality);
  
  let practiceLevel: string;
  let interpretation: string;
  let status: ResultPayload['status'] = 'consistent';
  
  if (consistencyScore >= 75) {
    practiceLevel = 'Highly Consistent';
    interpretation = 'You have highly consistent mindfulness practice with good frequency, duration, and quality. This is supporting your wellbeing effectively.';
    status = 'highly-consistent';
  } else if (consistencyScore >= 60) {
    practiceLevel = 'Consistent';
    interpretation = 'You have consistent mindfulness practice. Continue maintaining your routine and consider building on your current practice.';
    status = 'consistent';
  } else if (consistencyScore >= 45) {
    practiceLevel = 'Moderate';
    interpretation = 'Your mindfulness practice consistency is moderate. Increasing frequency, duration, or both could enhance the benefits you experience.';
    status = 'moderate';
  } else {
    practiceLevel = 'Inconsistent';
    interpretation = 'Your mindfulness practice consistency is low. Increasing practice frequency and establishing a regular routine can significantly improve mindfulness benefits.';
    status = 'inconsistent';
  }
  
  const recommendations = [
    `Your consistency score is ${consistencyScore}/100. ${consistencyScore >= 75 ? 'Excellent consistency!' : consistencyScore >= 60 ? 'Good consistency with room for growth.' : 'Consider increasing practice consistency.'}`,
    'Establish a daily practice routine: Aim for at least 5-10 minutes daily. Consistency matters more than duration—regular short sessions are better than sporadic long ones.',
    'Combine formal and informal practice: Schedule formal meditation sessions (3-5 per week) and practice informal mindfulness throughout the day (mindful breathing, mindful activities).',
    'Build practice gradually: Start with 5-10 minutes daily, then gradually increase duration as practice becomes more consistent and comfortable.',
    'Set reminders and create cues: Use phone reminders, link practice to existing habits (morning coffee, bedtime), and create a dedicated practice space.',
    'Track your streak: Monitoring your consistency streak can motivate continued practice. Don\'t let missed days derail you—return to practice as soon as possible.',
    `Your current streak is ${values.consistencyStreak} days. ${values.consistencyStreak >= 30 ? 'Excellent! Keep it going.' : values.consistencyStreak >= 7 ? 'Good start! Build on this momentum.' : 'Start building your streak today.'}`,
    'Focus on quality: While consistency is foundational, bring present-moment awareness, non-judgmental attention, and kindness to your practice.',
    'Be patient and kind to yourself: Building consistency takes time. Missed days are normal. Focus on long-term consistency rather than perfection.',
  ];
  
  const plan = [
    { label: 'This Week', detail: 'Aim for 3-5 practice days. Start with 5-10 minutes per session. Set reminders and establish a practice routine.' },
    { label: 'This Month', detail: 'Build to daily practice (or 5-6 days per week). Increase duration gradually to 10-20 minutes. Combine formal and informal practice.' },
    { label: 'Ongoing', detail: 'Maintain consistent practice. Track improvements in stress, attention, and wellbeing. Adjust practice based on what works best for you.' },
  ];
  
  return {
    consistencyScore,
    practiceLevel,
    qualityIndex,
    status,
    interpretation,
    recommendations,
    plan,
  };
};

export default function MindfulnessConsistencyScoreCalculator() {
  const [result, setResult] = useState<ResultPayload | null>(null);
  
  const form = useForm<FormValues>({
    resolver: zodResolver(formSchema),
    defaultValues: {
      practiceDaysPerWeek: undefined,
      averageMinutesPerDay: undefined,
      formalPracticeSessions: undefined,
      informalPracticeMoments: undefined,
      consistencyStreak: undefined,
      practiceQuality: undefined,
    },
  });
  
  return (
    <div className="space-y-8">
      <Script id="mcs-schema" type="application/ld+json" strategy="afterInteractive" dangerouslySetInnerHTML={{ __html: JSON.stringify(schemaMarkup) }} />
      
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <Flower2 className="h-5 w-5" />
            Mindfulness Consistency Score Calculator
          </CardTitle>
          <CardDescription>Calculate mindfulness practice consistency score based on practice frequency, duration, formal sessions, informal moments, streak, and quality to assess mindfulness habits.</CardDescription>
        </CardHeader>
      </Card>
      
      <Card>
        <CardHeader>
          <CardTitle>Input your mindfulness practice data</CardTitle>
        </CardHeader>
        <CardContent>
          <Form {...form}>
            <form onSubmit={form.handleSubmit((values) => setResult(calculateResult(values)))} className="space-y-6">
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <FormField
                  control={form.control}
                  name="practiceDaysPerWeek"
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel>Practice days per week (0-7)</FormLabel>
                      <FormControl>
                        <Input type="number" step="1" placeholder="e.g., 5" value={field.value ?? ''} onChange={(e) => field.onChange(e.target.value === '' ? undefined : Number(e.target.value))} />
                      </FormControl>
                      <FormMessage />
                    </FormItem>
                  )}
                />
                <FormField
                  control={form.control}
                  name="averageMinutesPerDay"
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel>Average minutes per day</FormLabel>
                      <FormControl>
                        <Input type="number" step="1" placeholder="e.g., 15" value={field.value ?? ''} onChange={(e) => field.onChange(e.target.value === '' ? undefined : Number(e.target.value))} />
                      </FormControl>
                      <FormMessage />
                    </FormItem>
                  )}
                />
                <FormField
                  control={form.control}
                  name="formalPracticeSessions"
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel>Formal practice sessions per week</FormLabel>
                      <FormControl>
                        <Input type="number" step="1" placeholder="e.g., 4" value={field.value ?? ''} onChange={(e) => field.onChange(e.target.value === '' ? undefined : Number(e.target.value))} />
                      </FormControl>
                      <FormMessage />
                    </FormItem>
                  )}
                />
                <FormField
                  control={form.control}
                  name="informalPracticeMoments"
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel>Informal practice moments per week</FormLabel>
                      <FormControl>
                        <Input type="number" step="1" placeholder="e.g., 10" value={field.value ?? ''} onChange={(e) => field.onChange(e.target.value === '' ? undefined : Number(e.target.value))} />
                      </FormControl>
                      <FormMessage />
                    </FormItem>
                  )}
                />
                <FormField
                  control={form.control}
                  name="consistencyStreak"
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel>Consistency streak (days, 0 if starting)</FormLabel>
                      <FormControl>
                        <Input type="number" step="1" placeholder="e.g., 14" value={field.value ?? ''} onChange={(e) => field.onChange(e.target.value === '' ? undefined : Number(e.target.value))} />
                      </FormControl>
                      <FormMessage />
                    </FormItem>
                  )}
                />
                <FormField
                  control={form.control}
                  name="practiceQuality"
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel>Practice quality (1-10, 10 = high quality)</FormLabel>
                      <FormControl>
                        <Input type="number" step="1" placeholder="e.g., 7" value={field.value ?? ''} onChange={(e) => field.onChange(e.target.value === '' ? undefined : Number(e.target.value))} />
                      </FormControl>
                      <FormMessage />
                    </FormItem>
                  )}
                />
              </div>
              <Button type="submit" className="w-full md:w-auto">
                Calculate Mindfulness Consistency
              </Button>
            </form>
          </Form>
        </CardContent>
      </Card>
      
      {result && (
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <Calendar className="h-5 w-5 text-primary" />
              Interactive results
            </CardTitle>
            <CardDescription>See your mindfulness consistency score and practice recommendations.</CardDescription>
          </CardHeader>
          <CardContent className="space-y-6">
            <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
              <div className="p-4 border rounded">
                <p className="text-sm text-muted-foreground">Consistency Score</p>
                <p className="text-2xl font-semibold text-primary">{result.consistencyScore}</p>
                <p className="text-xs text-muted-foreground">Out of 100</p>
              </div>
              <div className="p-4 border rounded">
                <p className="text-sm text-muted-foreground">Practice Level</p>
                <p className="text-2xl font-semibold text-primary">{result.practiceLevel}</p>
                <p className="text-xs text-muted-foreground">Current status</p>
              </div>
              <div className="p-4 border rounded">
                <p className="text-sm text-muted-foreground">Quality Index</p>
                <p className="text-2xl font-semibold text-primary">{result.qualityIndex}</p>
                <p className="text-xs text-muted-foreground">Out of 10</p>
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
            <strong>Consistency Score</strong> = Frequency Score + Duration Score + Formal Practice Score + Informal Practice Score + Streak Score + Quality Score
          </p>
          <p>
            <strong>Frequency Score</strong> = (Practice Days per Week / 7) × 30
          </p>
          <p>
            <strong>Duration Score</strong> = Min((Average Minutes per Day / 20) × 20, 20)
          </p>
          <p>
            <strong>Formal Practice Score</strong> = Min((Formal Sessions per Week / 7) × 15, 15)
          </p>
          <p>
            <strong>Informal Practice Score</strong> = Min((Informal Moments per Week / 14) × 15, 15)
          </p>
          <p>
            <strong>Streak Score</strong> = Min((Streak Days / 90) × 10, 10)
          </p>
          <p>
            <strong>Quality Score</strong> = (Practice Quality / 10) × 10
          </p>
          <p>
            <strong>Quality Index</strong> = Practice Quality Rating (1-10)
          </p>
          <p>Score ranges from 0-100, with higher scores indicating more consistent, frequent, and high-quality mindfulness practice.</p>
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
            Mindfulness consistency is crucial for experiencing the full benefits of mindfulness practice. Regular, consistent practice—both formal meditation sessions and informal mindful moments—builds mindfulness skills, strengthens neural pathways, and leads to improvements in stress reduction, emotional regulation, attention, and overall wellbeing.
          </p>
          <p>
            This calculator helps you assess the consistency of your mindfulness practice by evaluating frequency, duration, formal and informal practice, consistency streak, and practice quality. Understanding your consistency score helps you identify areas for improvement and develop a sustainable mindfulness routine.
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
          <p>This tool calculates mindfulness consistency score based on practice frequency, duration, formal sessions, informal moments, streak, and quality.</p>
          <p>Outputs include a consistency score, practice level, quality index, interpretation, recommendations, and an action plan.</p>
          <p>Formula, steps, guide content, related tools, and FAQs ensure humans or AI assistants can interpret the methodology instantly.</p>
        </CardContent>
      </Card>
    </div>
  );
}

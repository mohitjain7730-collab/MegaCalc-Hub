'use client';

import { useState } from 'react';
import Script from 'next/script';
import Link from 'next/link';
import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import { z } from 'zod';
import { Heart, Calendar, Target, Shield, TrendingUp } from 'lucide-react';

import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Form, FormControl, FormField, FormItem, FormLabel, FormMessage } from '@/components/ui/form';
import { Input } from '@/components/ui/input';

const formSchema = z.object({
  gratitudePracticesPerWeek: z.number({ invalid_type_error: 'Enter practices per week' }).min(0).max(28),
  gratitudeJournalEntries: z.number({ invalid_type_error: 'Enter journal entries' }).min(0).max(28),
  gratitudeExpressions: z.number({ invalid_type_error: 'Enter expressions' }).min(0).max(50),
  practiceConsistency: z.number({ invalid_type_error: 'Enter consistency' }).min(1).max(10),
  depthOfGratitude: z.number({ invalid_type_error: 'Enter depth' }).min(1).max(10),
});

type FormValues = z.infer<typeof formSchema>;

type ResultPayload = {
  gratitudeScore: number;
  practiceLevel: string;
  consistencyIndex: number;
  status: 'excellent' | 'good' | 'moderate' | 'needs-improvement';
  interpretation: string;
  recommendations: string[];
  plan: { label: string; detail: string }[];
};

const steps = [
  'Count number of gratitude practices per week (journaling, reflection, gratitude exercises).',
  'Count number of gratitude journal entries per week.',
  'Count number of times you express gratitude to others per week.',
  'Rate practice consistency (1-10, 10 = very consistent daily practice).',
  'Rate depth of gratitude (1-10, 10 = deeply felt and meaningful).',
  'Review your gratitude frequency score and recommendations for enhancing gratitude practices.',
];

const faqs = [
  {
    question: 'What is gratitude frequency tracking?',
    answer:
      'Gratitude frequency tracking measures how often you engage in gratitude practices, including journaling, expressions of gratitude, and gratitude exercises. Regular gratitude practice is associated with improved wellbeing, happiness, and mental health.',
  },
  {
    question: 'What counts as a gratitude practice?',
    answer:
      'Gratitude practices include: writing in a gratitude journal, expressing gratitude to others, gratitude meditation or reflection, writing thank-you notes, mentally listing things you\'re grateful for, and gratitude exercises or prompts.',
  },
  {
    question: 'How often should I practice gratitude?',
    answer:
      'Research suggests practicing gratitude 2-3 times per week provides benefits. Daily practice (7 times per week) may offer additional benefits, though consistency is more important than frequency. Find a sustainable routine.',
  },
  {
    question: 'What are the benefits of gratitude practice?',
    answer:
      'Benefits include: increased happiness and life satisfaction, improved relationships, better sleep, reduced stress and anxiety, enhanced resilience, improved physical health, and greater overall wellbeing.',
  },
  {
    question: 'What is a good gratitude frequency score?',
    answer:
      'Scores above 75 indicate excellent gratitude practice. 60-75 is good, 45-59 is moderate, and below 45 suggests opportunities to increase gratitude practices for better wellbeing.',
  },
  {
    question: 'Does depth of gratitude matter?',
    answer:
      'Yes, depth matters. Superficial gratitude (quickly listing things) has benefits, but deeper, more meaningful gratitude practice (reflecting on why you\'re grateful, feeling the emotion) provides greater wellbeing benefits.',
  },
  {
    question: 'Can I practice gratitude if I\'m going through difficult times?',
    answer:
      'Yes, gratitude practice is especially beneficial during difficult times. It helps maintain perspective, find meaning, and cultivate resilience. Even small things to be grateful for can provide comfort and hope.',
  },
  {
    question: 'What\'s the difference between gratitude journaling and expressing gratitude?',
    answer:
      'Gratitude journaling is private reflection and writing about things you\'re grateful for. Expressing gratitude is sharing appreciation with others (thank-you notes, verbal expressions). Both practices offer benefits.',
  },
  {
    question: 'How do I make gratitude practice more meaningful?',
    answer:
      'Make it meaningful by: reflecting on why you\'re grateful (not just what), feeling the emotions associated with gratitude, focusing on people rather than things, being specific, and connecting gratitude to values and meaning.',
  },
  {
    question: 'Can gratitude practice improve relationships?',
    answer:
      'Yes, expressing gratitude to others strengthens relationships, increases relationship satisfaction, and improves social connections. Gratitude helps you notice and appreciate positive aspects of relationships.',
  },
];

const relatedCalculators = [
  {
    name: 'Happiness Index Calculator',
    slug: 'happiness-index-calculator',
    description: 'Assess happiness enhanced by gratitude practices.',
  },
  {
    name: 'Emotional Wellbeing Index Calculator',
    slug: 'emotional-wellbeing-index-calculator',
    description: 'Measure emotional wellbeing supported by gratitude.',
  },
  {
    name: 'Mindfulness Consistency Score Calculator',
    slug: 'mindfulness-consistency-score-calculator',
    description: 'Track mindfulness practices that complement gratitude.',
  },
  {
    name: 'Meditation Streak Mindfulness Progress Tracker',
    slug: 'meditation-streak-mindfulness-progress-tracker',
    description: 'Monitor meditation practices enhancing gratitude.',
  },
];

const baseUrl = 'https://mycalculating.com/category/health-fitness/gratitude-frequency-tracker';

const schemaMarkup = {
  '@context': 'https://schema.org',
  '@graph': [
    {
      '@type': 'BreadcrumbList',
      itemListElement: [
        { '@type': 'ListItem', position: 1, name: 'Home', item: 'https://mycalculating.com' },
        { '@type': 'ListItem', position: 2, name: 'Health & Fitness', item: 'https://mycalculating.com/category/health-fitness' },
        { '@type': 'ListItem', position: 3, name: 'Gratitude Frequency Wellness Tracker', item: baseUrl },
      ],
    },
    {
      '@type': 'SoftwareApplication',
      name: 'Gratitude Frequency Wellness Tracker',
      applicationCategory: 'Calculator',
      operatingSystem: 'Web Browser',
      description: 'Track gratitude practice frequency including journaling, expressions, and consistency to assess gratitude habits and enhance wellbeing.',
      url: baseUrl,
      offers: { '@type': 'Offer', price: '0', priceCurrency: 'USD' },
    },
  ],
};

const calculateResult = (values: FormValues): ResultPayload => {
  // Calculate frequency component (practices per week)
  const frequencyScore = Math.min((values.gratitudePracticesPerWeek / 7) * 40, 40);
  
  // Calculate journaling component
  const journalingScore = Math.min((values.gratitudeJournalEntries / 7) * 20, 20);
  
  // Calculate expressions component
  const expressionsScore = Math.min((values.gratitudeExpressions / 7) * 20, 20);
  
  // Calculate consistency component
  const consistencyScore = (values.practiceConsistency / 10) * 10;
  
  // Calculate depth component
  const depthScore = (values.depthOfGratitude / 10) * 10;
  
  // Total gratitude score
  const gratitudeScore = Math.round(frequencyScore + journalingScore + expressionsScore + consistencyScore + depthScore);
  
  // Consistency index
  const consistencyIndex = Math.round((values.practiceConsistency + values.depthOfGratitude) / 2);
  
  let practiceLevel: string;
  let interpretation: string;
  let status: ResultPayload['status'] = 'good';
  
  if (gratitudeScore >= 75) {
    practiceLevel = 'Excellent';
    interpretation = 'This suggests a general lifestyle tendency where you may have excellent gratitude practices with high frequency, consistency, and depth. This may be supporting your wellbeing effectively.';
    status = 'excellent';
  } else if (gratitudeScore >= 60) {
    practiceLevel = 'Good';
    interpretation = 'This suggests a general lifestyle tendency where you may have good gratitude practices. You may consider continuing to maintain consistency and consider increasing frequency or depth for additional benefits.';
    status = 'good';
  } else if (gratitudeScore >= 45) {
    practiceLevel = 'Moderate';
    interpretation = 'This suggests a general lifestyle tendency where your gratitude practices may be moderate. You may consider increasing frequency, consistency, or depth to enhance wellbeing benefits.';
    status = 'moderate';
  } else {
    practiceLevel = 'Areas for Improvement';
    interpretation = 'This suggests a general lifestyle tendency where your gratitude practice frequency may be low. You may consider increasing gratitude practices, which may improve wellbeing, happiness, and mental health. This is a personal insight, not a medical evaluation.';
    status = 'needs-improvement';
  }
  
  const recommendations = [
    `Your gratitude score is ${gratitudeScore}/100. ${gratitudeScore >= 75 ? 'Excellent practice!' : gratitudeScore >= 60 ? 'Good practice with room for growth.' : 'Consider increasing gratitude practices.'}`,
    'Establish a gratitude journaling routine: Write 3-5 things you\'re grateful for, 3-5 times per week. Be specific and reflect on why you\'re grateful.',
    'Express gratitude to others: Write thank-you notes, verbally express appreciation, or show gratitude through actions. Aim for at least once per week.',
    'Practice gratitude meditation: Spend 5-10 minutes reflecting on things you\'re grateful for, feeling the emotions associated with gratitude.',
    'Increase practice consistency: Set reminders, link gratitude practice to existing habits (morning coffee, bedtime), and make it a regular routine.',
    'Deepen gratitude practice: Instead of quick lists, reflect on why you\'re grateful, how it makes you feel, and what it means to you. Focus on people and experiences, not just things.',
    'Practice gratitude during difficult times: Look for things to be grateful for even during challenges. This builds resilience and perspective.',
    'Be specific: Instead of "I\'m grateful for my family," try "I\'m grateful for how my sister listened when I needed support yesterday."',
    'Connect gratitude to values: Reflect on how what you\'re grateful for aligns with your values and what matters most to you.',
  ];
  
  const plan = [
    { label: 'This Week', detail: 'Start or maintain a gratitude journal. Aim for 3-5 entries. Express gratitude to at least one person.' },
    { label: 'This Month', detail: 'Establish consistent gratitude practice (3-5 times per week). Deepen practice by reflecting on why and how you\'re grateful.' },
    { label: 'Ongoing', detail: 'Maintain gratitude practice. Track improvements in wellbeing and happiness. Adjust practice based on what works best for you.' },
  ];
  
  return {
    gratitudeScore,
    practiceLevel,
    consistencyIndex,
    status,
    interpretation,
    recommendations,
    plan,
  };
};

export default function GratitudeFrequencyTracker() {
  const [result, setResult] = useState<ResultPayload | null>(null);
  
  const form = useForm<FormValues>({
    resolver: zodResolver(formSchema),
    defaultValues: {
      gratitudePracticesPerWeek: undefined,
      gratitudeJournalEntries: undefined,
      gratitudeExpressions: undefined,
      practiceConsistency: undefined,
      depthOfGratitude: undefined,
    },
  });
  
  return (
    <div className="space-y-8">
      <Script id="gft-schema" type="application/ld+json" strategy="afterInteractive" dangerouslySetInnerHTML={{ __html: JSON.stringify(schemaMarkup) }} />
      
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <Heart className="h-5 w-5" />
            Gratitude Frequency Wellness Tracker
          </CardTitle>
          <CardDescription>Get general wellness insights about gratitude practice frequency including journaling, expressions, and consistency. This is a personal lifestyle insight, not a medical evaluation.</CardDescription>
        </CardHeader>
      </Card>
      
      <Card>
        <CardHeader>
          <CardTitle>Input your gratitude practice data</CardTitle>
        </CardHeader>
        <CardContent>
          <Form {...form}>
            <form onSubmit={form.handleSubmit((values) => setResult(calculateResult(values)))} className="space-y-6">
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <FormField
                  control={form.control}
                  name="gratitudePracticesPerWeek"
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel>Gratitude practices per week</FormLabel>
                      <FormControl>
                        <Input type="number" step="1" placeholder="e.g., 5" value={field.value ?? ''} onChange={(e) => field.onChange(e.target.value === '' ? undefined : Number(e.target.value))} />
                      </FormControl>
                      <FormMessage />
                    </FormItem>
                  )}
                />
                <FormField
                  control={form.control}
                  name="gratitudeJournalEntries"
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel>Gratitude journal entries per week</FormLabel>
                      <FormControl>
                        <Input type="number" step="1" placeholder="e.g., 4" value={field.value ?? ''} onChange={(e) => field.onChange(e.target.value === '' ? undefined : Number(e.target.value))} />
                      </FormControl>
                      <FormMessage />
                    </FormItem>
                  )}
                />
                <FormField
                  control={form.control}
                  name="gratitudeExpressions"
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel>Gratitude expressions to others per week</FormLabel>
                      <FormControl>
                        <Input type="number" step="1" placeholder="e.g., 3" value={field.value ?? ''} onChange={(e) => field.onChange(e.target.value === '' ? undefined : Number(e.target.value))} />
                      </FormControl>
                      <FormMessage />
                    </FormItem>
                  )}
                />
                <FormField
                  control={form.control}
                  name="practiceConsistency"
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel>Practice consistency (1-10, 10 = very consistent)</FormLabel>
                      <FormControl>
                        <Input type="number" step="1" placeholder="e.g., 7" value={field.value ?? ''} onChange={(e) => field.onChange(e.target.value === '' ? undefined : Number(e.target.value))} />
                      </FormControl>
                      <FormMessage />
                    </FormItem>
                  )}
                />
                <FormField
                  control={form.control}
                  name="depthOfGratitude"
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel>Depth of gratitude (1-10, 10 = deeply felt)</FormLabel>
                      <FormControl>
                        <Input type="number" step="1" placeholder="e.g., 8" value={field.value ?? ''} onChange={(e) => field.onChange(e.target.value === '' ? undefined : Number(e.target.value))} />
                      </FormControl>
                      <FormMessage />
                    </FormItem>
                  )}
                />
              </div>
              <Button type="submit" className="w-full md:w-auto">
                Calculate Gratitude Frequency
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
            <CardDescription>See your gratitude frequency score and practice recommendations.</CardDescription>
          </CardHeader>
          <CardContent className="space-y-6">
            <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
              <div className="p-4 border rounded">
                <p className="text-sm text-muted-foreground">Gratitude Score</p>
                <p className="text-2xl font-semibold text-primary">{result.gratitudeScore}</p>
                <p className="text-xs text-muted-foreground">Out of 100</p>
              </div>
              <div className="p-4 border rounded">
                <p className="text-sm text-muted-foreground">Practice Level</p>
                <p className="text-2xl font-semibold text-primary">{result.practiceLevel}</p>
                <p className="text-xs text-muted-foreground">Current status</p>
              </div>
              <div className="p-4 border rounded">
                <p className="text-sm text-muted-foreground">Consistency Index</p>
                <p className="text-2xl font-semibold text-primary">{result.consistencyIndex}</p>
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
            <strong>Gratitude Score</strong> = Frequency Score + Journaling Score + Expressions Score + Consistency Score + Depth Score
          </p>
          <p>
            <strong>Frequency Score</strong> = Min((Practices per Week / 7) × 40, 40)
          </p>
          <p>
            <strong>Journaling Score</strong> = Min((Journal Entries per Week / 7) × 20, 20)
          </p>
          <p>
            <strong>Expressions Score</strong> = Min((Expressions per Week / 7) × 20, 20)
          </p>
          <p>
            <strong>Consistency Score</strong> = (Practice Consistency / 10) × 10
          </p>
          <p>
            <strong>Depth Score</strong> = (Depth of Gratitude / 10) × 10
          </p>
          <p>
            <strong>Consistency Index</strong> = (Practice Consistency + Depth of Gratitude) / 2
          </p>
          <p>Score ranges from 0-100, with higher scores indicating more frequent, consistent, and deep gratitude practices.</p>
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
            Gratitude practice is a powerful tool for enhancing wellbeing, happiness, and mental health. Research consistently shows that regular gratitude practices—including journaling, expressing appreciation to others, and gratitude reflection—improve life satisfaction, relationships, and overall happiness.
          </p>
          <p>
            This tracker helps you monitor the frequency and consistency of your gratitude practices. By tracking how often you engage in gratitude activities, the depth of your practice, and consistency, you can optimize your gratitude habits for maximum wellbeing benefits.
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
          <p>This tool provides general wellness insights about gratitude practice frequency including journaling, expressions, consistency, and depth. This is a personal lifestyle insight, not a medical evaluation.</p>
          <p>Outputs include a gratitude score, practice level, consistency index, interpretation, recommendations, and an action plan.</p>
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

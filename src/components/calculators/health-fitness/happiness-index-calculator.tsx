'use client';

import { useState } from 'react';
import Script from 'next/script';
import Link from 'next/link';
import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import { z } from 'zod';
import { Smile, Heart, Target, Shield, TrendingUp } from 'lucide-react';

import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Form, FormControl, FormField, FormItem, FormLabel, FormMessage } from '@/components/ui/form';
import { Input } from '@/components/ui/input';

const formSchema = z.object({
  lifeSatisfaction: z.number({ invalid_type_error: 'Enter satisfaction level' }).min(1).max(10),
  positiveEmotions: z.number({ invalid_type_error: 'Enter positive emotions' }).min(1).max(10),
  senseOfPurpose: z.number({ invalid_type_error: 'Enter sense of purpose' }).min(1).max(10),
  relationships: z.number({ invalid_type_error: 'Enter relationships' }).min(1).max(10),
  autonomy: z.number({ invalid_type_error: 'Enter autonomy' }).min(1).max(10),
  personalGrowth: z.number({ invalid_type_error: 'Enter personal growth' }).min(1).max(10),
  achievement: z.number({ invalid_type_error: 'Enter achievement' }).min(1).max(10),
});

type FormValues = z.infer<typeof formSchema>;

type ResultPayload = {
  happinessIndex: number;
  happinessLevel: string;
  wellbeingScore: number;
  status: 'flourishing' | 'satisfied' | 'moderate' | 'needs-improvement';
  interpretation: string;
  recommendations: string[];
  plan: { label: string; detail: string }[];
};

const steps = [
  'Rate your overall life satisfaction (1-10, 10 = completely satisfied).',
  'Rate frequency of positive emotions like joy, gratitude, contentment (1-10, 10 = very frequent).',
  'Rate your sense of purpose and meaning in life (1-10, 10 = very strong).',
  'Rate quality of your relationships and social connections (1-10, 10 = excellent).',
  'Rate your sense of autonomy and control over your life (1-10, 10 = very high).',
  'Rate your sense of personal growth and development (1-10, 10 = very strong).',
  'Rate your sense of achievement and accomplishment (1-10, 10 = very strong).',
  'Review your happiness index and recommendations for improving wellbeing.',
];

const faqs = [
  {
    question: 'What is the happiness index?',
    answer:
      'The happiness index is a comprehensive measure of subjective wellbeing that combines life satisfaction, positive emotions, sense of purpose, relationships, autonomy, personal growth, and achievement. It reflects overall life happiness and flourishing.',
  },
  {
    question: 'What is a good happiness index score?',
    answer:
      'Scores above 75 indicate flourishing (high wellbeing). 65-75 is satisfied (good wellbeing). 50-64 is moderate. Below 50 suggests areas for improvement in happiness and wellbeing.',
  },
  {
    question: 'Can happiness be measured?',
    answer:
      'Yes, happiness is measurable through self-report scales assessing subjective wellbeing, life satisfaction, positive emotions, and eudaimonic wellbeing (purpose, meaning, personal growth). These measures correlate with objective wellbeing indicators.',
  },
  {
    question: 'What factors influence happiness?',
    answer:
      'Factors include: relationships and social connections, sense of purpose and meaning, autonomy and control, personal growth, achievement, physical health, financial security (up to a point), gratitude practices, and positive mindset.',
  },
  {
    question: 'Can I improve my happiness index?',
    answer:
      'Yes, happiness can be improved through: practicing gratitude, building strong relationships, finding purpose and meaning, engaging in activities that promote personal growth, setting and achieving goals, helping others, physical exercise, and mindfulness practices.',
  },
  {
    question: 'Does money buy happiness?',
    answer:
      'Research shows money increases happiness up to a certain point (meeting basic needs and moderate comfort), but beyond that, additional money has diminishing returns. Relationships, purpose, and personal growth become more important for sustained happiness.',
  },
  {
    question: 'How do relationships affect happiness?',
    answer:
      'Strong, positive relationships are one of the strongest predictors of happiness. Quality social connections, meaningful relationships, and social support significantly contribute to overall wellbeing and life satisfaction.',
  },
  {
    question: 'What is the difference between happiness and pleasure?',
    answer:
      'Happiness is deeper and more sustained than pleasure. Happiness involves life satisfaction, purpose, meaningful relationships, and personal growth. Pleasure is temporary gratification. True happiness comes from eudaimonic wellbeing, not just hedonic pleasure.',
  },
  {
    question: 'Can happiness change over time?',
    answer:
      'Yes, happiness can change significantly over time. Life circumstances, relationships, health, purpose, and personal growth all influence happiness. Positive lifestyle changes and interventions can improve happiness levels.',
  },
  {
    question: 'How does purpose relate to happiness?',
    answer:
      'A sense of purpose and meaning in life is a key component of happiness. People with strong purpose report higher life satisfaction, better wellbeing, and greater resilience. Purpose provides direction and motivation that contributes to happiness.',
  },
];

const relatedCalculators = [
  {
    name: 'Emotional Wellbeing Index Calculator',
    slug: 'emotional-wellbeing-index-calculator',
    description: 'Assess overall emotional wellbeing related to happiness.',
  },
  {
    name: 'Gratitude Frequency Tracker',
    slug: 'gratitude-frequency-tracker',
    description: 'Track gratitude practices that enhance happiness.',
  },
  {
    name: 'Meditation Streak Mindfulness Progress Tracker',
    slug: 'meditation-streak-mindfulness-progress-tracker',
    description: 'Monitor mindfulness practices supporting happiness.',
  },
  {
    name: 'Stress Hormone Balance Calculator',
    slug: 'stress-hormone-balance-calculator',
    description: 'Manage stress that affects happiness and wellbeing.',
  },
];

const baseUrl = 'https://mycalculating.com/category/health-fitness/happiness-index-calculator';

const schemaMarkup = {
  '@context': 'https://schema.org',
  '@graph': [
    {
      '@type': 'BreadcrumbList',
      itemListElement: [
        { '@type': 'ListItem', position: 1, name: 'Home', item: 'https://mycalculating.com' },
        { '@type': 'ListItem', position: 2, name: 'Health & Fitness', item: 'https://mycalculating.com/category/health-fitness' },
        { '@type': 'ListItem', position: 3, name: 'Happiness Index Wellness Calculator', item: baseUrl },
      ],
    },
    {
      '@type': 'SoftwareApplication',
      name: 'Happiness Index Wellness Calculator',
      applicationCategory: 'Calculator',
      operatingSystem: 'Web Browser',
      description: 'Calculate your happiness index based on life satisfaction, positive emotions, purpose, relationships, autonomy, personal growth, and achievement to assess overall wellbeing.',
      url: baseUrl,
      offers: { '@type': 'Offer', price: '0', priceCurrency: 'USD' },
    },
  ],
};

const calculateResult = (values: FormValues): ResultPayload => {
  // Calculate happiness index (average of all components, scaled to 0-100)
  const happinessIndex = Math.round(
    ((values.lifeSatisfaction +
      values.positiveEmotions +
      values.senseOfPurpose +
      values.relationships +
      values.autonomy +
      values.personalGrowth +
      values.achievement) /
      7) *
      10
  );
  
  // Calculate wellbeing score (weighted average with relationships and purpose weighted more)
  const wellbeingScore = Math.round(
    (values.lifeSatisfaction * 15 +
      values.positiveEmotions * 12 +
      values.senseOfPurpose * 15 +
      values.relationships * 15 +
      values.autonomy * 10 +
      values.personalGrowth * 13 +
      values.achievement * 12) /
      10
  );
  
  let happinessLevel: string;
  let interpretation: string;
  let status: ResultPayload['status'] = 'satisfied';
  
  if (happinessIndex >= 75) {
    happinessLevel = 'Flourishing';
    interpretation = 'This suggests a general lifestyle tendency where you may be experiencing high levels of happiness and wellbeing. You may have strong life satisfaction, positive emotions, and a sense of purpose. You may consider continuing to nurture these areas.';
    status = 'flourishing';
  } else if (happinessIndex >= 65) {
    happinessLevel = 'Satisfied';
    interpretation = 'This suggests a general lifestyle tendency where you may have good levels of happiness and wellbeing. Life satisfaction and positive emotions may be present. You may consider continuing to build on your strengths.';
    status = 'satisfied';
  } else if (happinessIndex >= 50) {
    happinessLevel = 'Moderate';
    interpretation = 'This suggests a general lifestyle tendency where your happiness levels may be moderate. There may be opportunities to enhance wellbeing through stronger relationships, purpose, and positive practices.';
    status = 'moderate';
  } else {
    happinessLevel = 'Areas for Improvement';
    interpretation = 'This suggests a general lifestyle tendency where your happiness index may suggest areas for improvement. You may consider focusing on building relationships, finding purpose, practicing gratitude, and engaging in activities that promote personal growth. This is a personal insight, not a medical evaluation.';
    status = 'needs-improvement';
  }
  
  const recommendations = [
    `Your happiness index is ${happinessIndex}/100. ${happinessIndex >= 75 ? 'Excellent wellbeing!' : happinessIndex >= 65 ? 'Good wellbeing with room for growth.' : 'You may consider focusing on happiness-building practices.'}`,
    'You may consider practicing gratitude daily: Keep a gratitude journal, write thank-you notes, or reflect on positive aspects of life. This is a personal insight, not a medical evaluation.',
    'Strengthen relationships: Invest time in meaningful connections, practice active listening, and nurture close relationships.',
    'Find purpose and meaning: Engage in activities aligned with your values, contribute to causes you care about, and set meaningful goals.',
    'Cultivate positive emotions: Engage in activities that bring joy, practice mindfulness, savor positive experiences, and focus on positive aspects of life.',
    'Foster personal growth: Learn new skills, pursue interests, take on challenges, and embrace opportunities for development.',
    'Build autonomy: Make choices aligned with your values, set boundaries, and take control of areas of your life where possible.',
    'Celebrate achievements: Acknowledge accomplishments, set and work toward goals, and recognize progress and growth.',
    'Practice self-care: Maintain physical health, get adequate sleep, manage stress, and engage in activities that recharge you.',
  ];
  
  const plan = [
    { label: 'Daily', detail: 'Practice gratitude (write 3 things you\'re grateful for). Engage in one activity that brings joy. Connect meaningfully with at least one person.' },
    { label: 'Weekly', detail: 'Reflect on purpose and values. Invest time in relationships. Pursue personal growth activities. Celebrate achievements and progress.' },
    { label: 'Monthly', detail: 'Review happiness index trends. Adjust practices based on what\'s working. Set meaningful goals. Strengthen areas needing improvement.' },
  ];
  
  return {
    happinessIndex,
    happinessLevel,
    wellbeingScore,
    status,
    interpretation,
    recommendations,
    plan,
  };
};

export default function HappinessIndexCalculator() {
  const [result, setResult] = useState<ResultPayload | null>(null);
  
  const form = useForm<FormValues>({
    resolver: zodResolver(formSchema),
    defaultValues: {
      lifeSatisfaction: undefined,
      positiveEmotions: undefined,
      senseOfPurpose: undefined,
      relationships: undefined,
      autonomy: undefined,
      personalGrowth: undefined,
      achievement: undefined,
    },
  });
  
  return (
    <div className="space-y-8">
      <Script id="hi-schema" type="application/ld+json" strategy="afterInteractive" dangerouslySetInnerHTML={{ __html: JSON.stringify(schemaMarkup) }} />
      
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <Smile className="h-5 w-5" />
            Happiness Index Wellness Calculator
          </CardTitle>
          <CardDescription>Get general wellness insights about happiness index based on life satisfaction, positive emotions, purpose, relationships, autonomy, personal growth, and achievement. This is a personal lifestyle insight, not a medical evaluation.</CardDescription>
        </CardHeader>
      </Card>
      
      <Card>
        <CardHeader>
          <CardTitle>Input your happiness and wellbeing ratings</CardTitle>
        </CardHeader>
        <CardContent>
          <Form {...form}>
            <form onSubmit={form.handleSubmit((values) => setResult(calculateResult(values)))} className="space-y-6">
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <FormField
                  control={form.control}
                  name="lifeSatisfaction"
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel>Life satisfaction (1-10, 10 = completely satisfied)</FormLabel>
                      <FormControl>
                        <Input type="number" step="1" placeholder="e.g., 7" value={field.value ?? ''} onChange={(e) => field.onChange(e.target.value === '' ? undefined : Number(e.target.value))} />
                      </FormControl>
                      <FormMessage />
                    </FormItem>
                  )}
                />
                <FormField
                  control={form.control}
                  name="positiveEmotions"
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel>Positive emotions frequency (1-10, 10 = very frequent)</FormLabel>
                      <FormControl>
                        <Input type="number" step="1" placeholder="e.g., 8" value={field.value ?? ''} onChange={(e) => field.onChange(e.target.value === '' ? undefined : Number(e.target.value))} />
                      </FormControl>
                      <FormMessage />
                    </FormItem>
                  )}
                />
                <FormField
                  control={form.control}
                  name="senseOfPurpose"
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel>Sense of purpose (1-10, 10 = very strong)</FormLabel>
                      <FormControl>
                        <Input type="number" step="1" placeholder="e.g., 7" value={field.value ?? ''} onChange={(e) => field.onChange(e.target.value === '' ? undefined : Number(e.target.value))} />
                      </FormControl>
                      <FormMessage />
                    </FormItem>
                  )}
                />
                <FormField
                  control={form.control}
                  name="relationships"
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel>Quality of relationships (1-10, 10 = excellent)</FormLabel>
                      <FormControl>
                        <Input type="number" step="1" placeholder="e.g., 8" value={field.value ?? ''} onChange={(e) => field.onChange(e.target.value === '' ? undefined : Number(e.target.value))} />
                      </FormControl>
                      <FormMessage />
                    </FormItem>
                  )}
                />
                <FormField
                  control={form.control}
                  name="autonomy"
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel>Sense of autonomy (1-10, 10 = very high)</FormLabel>
                      <FormControl>
                        <Input type="number" step="1" placeholder="e.g., 7" value={field.value ?? ''} onChange={(e) => field.onChange(e.target.value === '' ? undefined : Number(e.target.value))} />
                      </FormControl>
                      <FormMessage />
                    </FormItem>
                  )}
                />
                <FormField
                  control={form.control}
                  name="personalGrowth"
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel>Personal growth (1-10, 10 = very strong)</FormLabel>
                      <FormControl>
                        <Input type="number" step="1" placeholder="e.g., 7" value={field.value ?? ''} onChange={(e) => field.onChange(e.target.value === '' ? undefined : Number(e.target.value))} />
                      </FormControl>
                      <FormMessage />
                    </FormItem>
                  )}
                />
                <FormField
                  control={form.control}
                  name="achievement"
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel>Sense of achievement (1-10, 10 = very strong)</FormLabel>
                      <FormControl>
                        <Input type="number" step="1" placeholder="e.g., 6" value={field.value ?? ''} onChange={(e) => field.onChange(e.target.value === '' ? undefined : Number(e.target.value))} />
                      </FormControl>
                      <FormMessage />
                    </FormItem>
                  )}
                />
              </div>
              <Button type="submit" className="w-full md:w-auto">
                Calculate Happiness Index
              </Button>
            </form>
          </Form>
        </CardContent>
      </Card>
      
      {result && (
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <Heart className="h-5 w-5 text-primary" />
              Interactive results
            </CardTitle>
            <CardDescription>See your happiness index and wellbeing recommendations.</CardDescription>
          </CardHeader>
          <CardContent className="space-y-6">
            <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
              <div className="p-4 border rounded">
                <p className="text-sm text-muted-foreground">Happiness Index</p>
                <p className="text-2xl font-semibold text-primary">{result.happinessIndex}</p>
                <p className="text-xs text-muted-foreground">Out of 100</p>
              </div>
              <div className="p-4 border rounded">
                <p className="text-sm text-muted-foreground">Happiness Level</p>
                <p className="text-2xl font-semibold text-primary">{result.happinessLevel}</p>
                <p className="text-xs text-muted-foreground">Wellbeing status</p>
              </div>
              <div className="p-4 border rounded">
                <p className="text-sm text-muted-foreground">Wellbeing Score</p>
                <p className="text-2xl font-semibold text-primary">{result.wellbeingScore}</p>
                <p className="text-xs text-muted-foreground">Weighted score</p>
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
            <strong>Happiness Index</strong> = ((Life Satisfaction + Positive Emotions + Sense of Purpose + Relationships + Autonomy + Personal Growth + Achievement) / 7) × 10
          </p>
          <p>
            <strong>Wellbeing Score</strong> = (Life Satisfaction × 15 + Positive Emotions × 12 + Sense of Purpose × 15 + Relationships × 15 + Autonomy × 10 + Personal Growth × 13 + Achievement × 12) / 10
          </p>
          <p>All components are rated on a 1-10 scale, with higher scores indicating greater happiness and wellbeing.</p>
          <p>Happiness Index ranges from 0-100, with scores above 75 indicating flourishing, 65-75 indicating satisfaction, 50-64 moderate, and below 50 indicating areas for improvement.</p>
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
          <p>
            The happiness index is a comprehensive measure of subjective wellbeing that combines multiple dimensions of happiness and life satisfaction. It evaluates both hedonic wellbeing (positive emotions, life satisfaction) and eudaimonic wellbeing (purpose, meaning, personal growth, relationships, autonomy, achievement).
          </p>
          <p>
            Research in positive psychology shows that true happiness comes from a combination of life satisfaction, positive emotions, meaningful relationships, sense of purpose, autonomy, personal growth, and achievement. Understanding your happiness index helps you identify areas of strength and opportunities for enhancing overall wellbeing and life satisfaction.
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
          <p>This tool provides general wellness insights about happiness index based on life satisfaction, positive emotions, purpose, relationships, autonomy, personal growth, and achievement. This is a personal lifestyle insight, not a medical evaluation.</p>
          <p>Outputs include happiness index, happiness level, wellbeing score, interpretation, recommendations, and an action plan.</p>
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

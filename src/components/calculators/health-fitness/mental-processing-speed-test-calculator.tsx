'use client';

import { useState } from 'react';
import Script from 'next/script';
import Link from 'next/link';
import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import { z } from 'zod';
import { Zap, Clock, Target, Shield, TrendingUp } from 'lucide-react';

import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Form, FormControl, FormField, FormItem, FormLabel, FormMessage } from '@/components/ui/form';
import { Input } from '@/components/ui/input';

const formSchema = z.object({
  simpleReactionTime: z.number({ invalid_type_error: 'Enter reaction time' }).min(100).max(1000),
  choiceReactionTime: z.number({ invalid_type_error: 'Enter reaction time' }).min(200).max(2000),
  processingAccuracy: z.number({ invalid_type_error: 'Enter accuracy' }).min(0).max(100),
  taskCompletionTime: z.number({ invalid_type_error: 'Enter completion time' }).min(1).max(300),
  age: z.number({ invalid_type_error: 'Enter age' }).min(18).max(100),
});

type FormValues = z.infer<typeof formSchema>;

type ResultPayload = {
  processingSpeed: number;
  speedCategory: string;
  cognitiveAge: number;
  status: 'excellent' | 'good' | 'average' | 'needs-improvement';
  interpretation: string;
  recommendations: string[];
  plan: { label: string; detail: string }[];
};

const steps = [
  'Measure simple reaction time (respond to a single stimulus like a light or sound) in milliseconds.',
  'Measure choice reaction time (respond to one of multiple stimuli) in milliseconds.',
  'Calculate accuracy percentage from a cognitive task (0-100%).',
  'Record task completion time for a standardized cognitive task in seconds.',
  'Enter your age to adjust benchmarks appropriately.',
  'Review your mental processing speed score, cognitive age estimate, and recommendations.',
];

const faqs = [
  {
    question: 'What is mental processing speed?',
    answer:
      'Mental processing speed refers to how quickly your brain can perceive, process, and respond to information. This tool provides general wellness insights about processing speed, not a medical evaluation.',
  },
  {
    question: 'How is processing speed measured?',
    answer:
      'This tool uses reaction time tests, choice reaction tasks, accuracy on timed cognitive tests, and standardized cognitive task completion times to provide general wellness insights.',
  },
  {
    question: 'What is a good processing speed score?',
    answer:
      'Scores above 75 suggest a general lifestyle tendency where processing speed may be excellent. 60-74 is good, 45-59 is average, and below 45 suggests areas for improvement. This is a personal insight, not a medical evaluation.',
  },
  {
    question: 'Does processing speed decline with age?',
    answer:
      'Processing speed may change gradually with age, starting around age 30. However, mental exercises and physical fitness may help maintain speed. This is general wellness information, not a medical diagnosis.',
  },
  {
    question: 'Can I improve my processing speed?',
    answer:
      'You may consider brain training exercises, physical exercise, adequate sleep, stress management, and challenging cognitive activities like puzzles and games. This is a personal insight, not a medical evaluation.',
  },
  {
    question: 'What affects processing speed?',
    answer:
      'Lifestyle factors that may affect processing speed include age, sleep quality, stress levels, physical fitness, nutrition, mental fatigue, and overall cognitive wellness. This is general wellness information, not a medical diagnosis.',
  },
  {
    question: 'Is there a difference between simple and choice reaction time?',
    answer:
      'Yes. Simple reaction time measures response to a single, predictable stimulus. Choice reaction time involves selecting the correct response from multiple options, which is slower.',
  },
  {
    question: 'How often should I test my processing speed?',
    answer:
      'Test every 2-3 months to track changes. Regular testing helps monitor cognitive health and the effectiveness of brain training programs.',
  },
  {
    question: 'Can medications affect processing speed?',
    answer:
      'Yes, some medications (sedatives, antihistamines, certain antidepressants) can slow processing speed, while stimulants may temporarily enhance it.',
  },
  {
    question: 'What is cognitive age?',
    answer:
      'Cognitive age estimates your brain\'s processing speed relative to chronological age. A lower cognitive age suggests faster-than-average processing for your age group.',
  },
];

const relatedCalculators = [
  {
    name: 'Reaction Time Improvement Tracker',
    slug: 'reaction-time-improvement-tracker',
    description: 'Track improvements in reaction time over time.',
  },
  {
    name: 'Cognitive Focus Efficiency Calculator',
    slug: 'cognitive-focus-efficiency-calculator',
    description: 'Assess overall cognitive efficiency and focus.',
  },
  {
    name: 'Mental Fatigue Index Calculator',
    slug: 'daily-activity-points-calculator',
    description: 'Measure mental fatigue that affects processing speed.',
  },
  {
    name: 'Working Memory Capacity Wellness Estimator',
    slug: 'working-memory-capacity-estimator',
    description: 'Get wellness insights about working memory alongside processing speed.',
  },
];

const baseUrl = 'https://mycalculating.com/health-fitness/mental-processing-speed-test-calculator';

const schemaMarkup = {
  '@context': 'https://schema.org',
  '@graph': [
    {
      '@type': 'BreadcrumbList',
      itemListElement: [
        { '@type': 'ListItem', position: 1, name: 'Home', item: 'https://mycalculating.com' },
        { '@type': 'ListItem', position: 2, name: 'Health & Fitness', item: 'https://mycalculating.com/health-fitness' },
        { '@type': 'ListItem', position: 3, name: 'Mental Processing Speed Wellness Estimator', item: baseUrl },
      ],
    },
    {
      '@type': 'SoftwareApplication',
      name: 'Mental Processing Speed Wellness Estimator',
      applicationCategory: 'Calculator',
      operatingSystem: 'Web Browser',
      description: 'Get general wellness insights about mental processing speed through reaction time, accuracy, and cognitive task performance. This is a personal lifestyle insight, not a medical evaluation.',
      url: baseUrl,
      offers: { '@type': 'Offer', price: '0', priceCurrency: 'USD' },
    },
  ],
};

const calculateResult = (values: FormValues): ResultPayload => {
  // Normalize reaction times (lower is better)
  const simpleReactionNormalized = Math.max(0, Math.min(100, ((800 - values.simpleReactionTime) / 700) * 100));
  const choiceReactionNormalized = Math.max(0, Math.min(100, ((1200 - values.choiceReactionTime) / 1800) * 100));
  
  // Combine factors
  const speedComponent = (simpleReactionNormalized + choiceReactionNormalized) / 2;
  const accuracyComponent = values.processingAccuracy;
  const timeComponent = Math.max(0, Math.min(100, ((120 - values.taskCompletionTime) / 119) * 100));
  
  // Weighted average
  const processingSpeed = Math.round(speedComponent * 0.4 + accuracyComponent * 0.4 + timeComponent * 0.2);
  
  // Estimate cognitive age (adjusted for chronological age)
  const expectedReactionTime = 200 + (values.age - 20) * 2.5;
  const ageAdjustment = ((expectedReactionTime - values.choiceReactionTime) / expectedReactionTime) * 20;
  const cognitiveAge = Math.max(18, Math.min(100, Math.round(values.age - ageAdjustment)));
  
  let speedCategory: string;
  let interpretation: string;
  let status: ResultPayload['status'] = 'excellent';
  
  if (processingSpeed >= 75) {
    speedCategory = 'Excellent';
    interpretation = 'This suggests a general lifestyle tendency where your mental processing speed is excellent for your age group. You may process information quickly and efficiently.';
    status = 'excellent';
  } else if (processingSpeed >= 60) {
    speedCategory = 'Good';
    interpretation = 'This suggests a general lifestyle tendency where your processing speed is good. You may handle cognitive tasks efficiently with room for minor improvements.';
    status = 'good';
  } else if (processingSpeed >= 45) {
    speedCategory = 'Average';
    interpretation = 'This suggests a general lifestyle tendency where your processing speed is within the average range. You may consider focusing on brain training and cognitive health practices.';
    status = 'average';
  } else {
    speedCategory = 'Needs Improvement';
    interpretation = 'This suggests a general lifestyle tendency where your processing speed may benefit from improvement. You may consider brain training, better sleep, and stress reduction.';
    status = 'needs-improvement';
  }
  
  const recommendations = [
    'You may consider engaging in brain training exercises regularly (puzzles, memory games, speed-based cognitive tasks). This is a personal insight, not a medical evaluation.',
    'You may consider maintaining regular physical exercise, which may improve processing speed.',
    'You may consider ensuring 7-9 hours of quality sleep per night to optimize cognitive function.',
    'You may consider practicing reaction time games and cognitive speed drills to improve response times.',
    'You may consider managing stress through meditation, deep breathing, or relaxation techniques.',
    'You may consider a brain-healthy diet rich in omega-3s, antioxidants, and B vitamins.',
  ];
  
  const plan = [
    { label: 'Daily', detail: 'You may consider practicing 10-15 minutes of brain training exercises. Aim for consistent sleep schedule.' },
    { label: 'Weekly', detail: 'You may consider engaging in 150+ minutes of moderate physical activity. Test reaction time weekly to track progress.' },
    { label: 'Monthly', detail: 'You may consider re-assessing processing speed. Adjust training intensity based on improvements.' },
  ];
  
  return {
    processingSpeed,
    speedCategory,
    cognitiveAge,
    status,
    interpretation,
    recommendations,
    plan,
  };
};

export default function MentalProcessingSpeedTestCalculator() {
  const [result, setResult] = useState<ResultPayload | null>(null);
  
  const form = useForm<FormValues>({
    resolver: zodResolver(formSchema),
    defaultValues: {
      simpleReactionTime: undefined,
      choiceReactionTime: undefined,
      processingAccuracy: undefined,
      taskCompletionTime: undefined,
      age: undefined,
    },
  });
  
  return (
    <div className="space-y-8">
      <Script id="mps-schema" type="application/ld+json" strategy="afterInteractive" dangerouslySetInnerHTML={{ __html: JSON.stringify(schemaMarkup) }} />
      
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <Zap className="h-5 w-5" />
            Mental Processing Speed Wellness Estimator
          </CardTitle>
          <CardDescription>Get general wellness insights about mental processing speed through reaction time, accuracy, and cognitive task performance. This is a personal lifestyle insight, not a medical evaluation.</CardDescription>
        </CardHeader>
      </Card>
      
      <Card>
        <CardHeader>
          <CardTitle>Input your test results</CardTitle>
        </CardHeader>
        <CardContent>
          <Form {...form}>
            <form onSubmit={form.handleSubmit((values) => setResult(calculateResult(values)))} className="space-y-6">
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <FormField
                  control={form.control}
                  name="simpleReactionTime"
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel>Simple reaction time (ms)</FormLabel>
                      <FormControl>
                        <Input type="number" step="1" placeholder="e.g., 250" value={field.value ?? ''} onChange={(e) => field.onChange(e.target.value === '' ? undefined : Number(e.target.value))} />
                      </FormControl>
                      <FormMessage />
                    </FormItem>
                  )}
                />
                <FormField
                  control={form.control}
                  name="choiceReactionTime"
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel>Choice reaction time (ms)</FormLabel>
                      <FormControl>
                        <Input type="number" step="1" placeholder="e.g., 450" value={field.value ?? ''} onChange={(e) => field.onChange(e.target.value === '' ? undefined : Number(e.target.value))} />
                      </FormControl>
                      <FormMessage />
                    </FormItem>
                  )}
                />
                <FormField
                  control={form.control}
                  name="processingAccuracy"
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel>Processing accuracy (%)</FormLabel>
                      <FormControl>
                        <Input type="number" step="1" placeholder="e.g., 85" value={field.value ?? ''} onChange={(e) => field.onChange(e.target.value === '' ? undefined : Number(e.target.value))} />
                      </FormControl>
                      <FormMessage />
                    </FormItem>
                  )}
                />
                <FormField
                  control={form.control}
                  name="taskCompletionTime"
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel>Task completion time (seconds)</FormLabel>
                      <FormControl>
                        <Input type="number" step="1" placeholder="e.g., 60" value={field.value ?? ''} onChange={(e) => field.onChange(e.target.value === '' ? undefined : Number(e.target.value))} />
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
                      <FormLabel>Age</FormLabel>
                      <FormControl>
                        <Input type="number" step="1" placeholder="e.g., 35" value={field.value ?? ''} onChange={(e) => field.onChange(e.target.value === '' ? undefined : Number(e.target.value))} />
                      </FormControl>
                      <FormMessage />
                    </FormItem>
                  )}
                />
              </div>
              <Button type="submit" className="w-full md:w-auto">
                Calculate Processing Speed
              </Button>
            </form>
          </Form>
        </CardContent>
      </Card>
      
      {result && (
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <Target className="h-5 w-5 text-primary" />
              Interactive results
            </CardTitle>
            <CardDescription>See your mental processing speed score, cognitive age, and recommendations.</CardDescription>
          </CardHeader>
          <CardContent className="space-y-6">
            <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
              <div className="p-4 border rounded">
                <p className="text-sm text-muted-foreground">Processing Speed Score</p>
                <p className="text-2xl font-semibold text-primary">{result.processingSpeed}</p>
                <p className="text-xs text-muted-foreground">Out of 100</p>
              </div>
              <div className="p-4 border rounded">
                <p className="text-sm text-muted-foreground">Speed Category</p>
                <p className="text-2xl font-semibold text-primary">{result.speedCategory}</p>
                <p className="text-xs text-muted-foreground">Performance level</p>
              </div>
              <div className="p-4 border rounded">
                <p className="text-sm text-muted-foreground">Cognitive Age</p>
                <p className="text-2xl font-semibold text-primary">{result.cognitiveAge}</p>
                <p className="text-xs text-muted-foreground">Estimated</p>
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
                    <TrendingUp className="h-4 w-4" />
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
                    <Clock className="h-4 w-4" />
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
            <strong>Processing Speed Score</strong> = (Reaction Time Component Ã— 0.4) + (Accuracy Component Ã— 0.4) + (Time Component Ã— 0.2)
          </p>
          <p>
            <strong>Reaction Time Component</strong> = Average of normalized simple and choice reaction times (faster = higher score)
          </p>
          <p>
            <strong>Accuracy Component</strong> = Processing accuracy percentage (0-100%)
          </p>
          <p>
            <strong>Time Component</strong> = Normalized task completion time (faster = higher score)
          </p>
          <p>
            <strong>Cognitive Age</strong> = Chronological age adjusted based on reaction time performance relative to age-based expectations
          </p>
          <p>Scores are normalized to 0-100 scale, with higher scores indicating faster processing speed.</p>
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
          <p>
            Mental processing speed is a fundamental cognitive ability that determines how quickly you can perceive, process, and respond to information. It influences reaction time, decision-making efficiency, and overall cognitive performance. This calculator combines multiple measuresâ€”simple and choice reaction times, processing accuracy, and task completion speedâ€”to provide a comprehensive assessment of your mental processing speed.
          </p>
          <p>
            Regular assessment of processing speed helps track cognitive health, monitor the effects of brain training, and identify areas for improvement. Understanding your processing speed relative to your age group provides valuable insights into cognitive aging and the effectiveness of interventions.
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
          <p>This tool provides general wellness insights about mental processing speed through reaction time tests, accuracy, and task completion speed. This is a personal lifestyle insight, not a medical evaluation.</p>
          <p>Outputs include a processing speed score, cognitive age estimate, performance category, interpretation, recommendations, and an action plan.</p>
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

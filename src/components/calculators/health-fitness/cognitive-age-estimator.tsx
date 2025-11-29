'use client';

import { useState } from 'react';
import Script from 'next/script';
import Link from 'next/link';
import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import { z } from 'zod';
import { Brain, Calendar, Target, Shield, TrendingDown } from 'lucide-react';

import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Form, FormControl, FormField, FormItem, FormLabel, FormMessage } from '@/components/ui/form';
import { Input } from '@/components/ui/input';

const formSchema = z.object({
  chronologicalAge: z.number({ invalid_type_error: 'Enter age' }).min(18).max(100),
  processingSpeed: z.number({ invalid_type_error: 'Enter processing speed score' }).min(0).max(100),
  memoryScore: z.number({ invalid_type_error: 'Enter memory score' }).min(0).max(100),
  attentionScore: z.number({ invalid_type_error: 'Enter attention score' }).min(0).max(100),
  executiveFunctionScore: z.number({ invalid_type_error: 'Enter executive function score' }).min(0).max(100),
  sleepQuality: z.number({ invalid_type_error: 'Enter sleep quality' }).min(1).max(10),
  exerciseFrequency: z.number({ invalid_type_error: 'Enter exercise frequency' }).min(0).max(7),
});

type FormValues = z.infer<typeof formSchema>;

type ResultPayload = {
  cognitiveAge: number;
  ageDifference: number;
  cognitiveStatus: string;
  status: 'younger' | 'matched' | 'older';
  interpretation: string;
  recommendations: string[];
  plan: { label: string; detail: string }[];
};

const steps = [
  'Enter your chronological age.',
  'Enter your mental processing speed score (0-100, from processing speed tests).',
  'Enter your memory score (0-100, from memory assessments).',
  'Enter your attention score (0-100, from attention span tests).',
  'Enter your executive function score (0-100, from cognitive assessments).',
  'Rate your sleep quality (1-10, 10 = excellent).',
  'Enter exercise frequency (days per week, 0-7).',
  'Review your estimated cognitive age and brain health recommendations.',
];

const faqs = [
  {
    question: 'What is cognitive age?',
    answer:
      'Cognitive age estimates how old your brain functions compared to your chronological age. A cognitive age lower than your actual age suggests better-than-average brain health, while higher cognitive age may indicate accelerated cognitive aging.',
  },
  {
    question: 'How is cognitive age calculated?',
    answer:
      'Cognitive age is estimated by comparing your cognitive performance (processing speed, memory, attention, executive function) to age-adjusted population norms. Lifestyle factors like sleep and exercise are also considered.',
  },
  {
    question: 'What does it mean if my cognitive age is younger than my actual age?',
    answer:
      'A younger cognitive age indicates your brain is functioning better than average for your age group. This suggests good brain health, maintained cognitive abilities, and effective cognitive aging.',
  },
  {
    question: 'What if my cognitive age is older than my actual age?',
    answer:
      'An older cognitive age suggests your brain may be functioning like someone older than you. This doesn\'t necessarily indicate a problem but may signal a need to improve brain health through exercise, sleep, mental stimulation, and lifestyle factors.',
  },
  {
    question: 'Can I improve my cognitive age?',
    answer:
      'Yes, through: regular physical exercise, adequate sleep, brain training exercises, maintaining social connections, healthy nutrition, stress management, and avoiding harmful substances. Cognitive age can improve with lifestyle changes.',
  },
  {
    question: 'How accurate is cognitive age estimation?',
    answer:
      'Cognitive age provides an estimate based on available cognitive scores. It\'s a useful indicator but not a diagnostic tool. Individual variation exists, and cognitive age should be interpreted alongside other health factors.',
  },
  {
    question: 'What factors influence cognitive age?',
    answer:
      'Factors include: genetics, physical exercise, sleep quality, stress levels, nutrition, mental stimulation, social engagement, chronic health conditions, medications, and lifestyle choices (alcohol, smoking).',
  },
  {
    question: 'Does cognitive age predict dementia risk?',
    answer:
      'While lower cognitive age is associated with better brain health, cognitive age alone cannot predict dementia. However, maintaining a younger cognitive age through healthy lifestyle may reduce dementia risk factors.',
  },
  {
    question: 'How often should I estimate my cognitive age?',
    answer:
      'Estimate cognitive age annually or when you make significant lifestyle changes. Regular tracking helps monitor cognitive health trends and the effectiveness of interventions. Sudden changes should be discussed with healthcare providers.',
  },
  {
    question: 'Can cognitive age change over time?',
    answer:
      'Yes, cognitive age can change. Positive lifestyle changes (exercise, better sleep, mental stimulation) can lower cognitive age, while negative factors (chronic stress, poor sleep, sedentary lifestyle) can increase it.',
  },
];

const relatedCalculators = [
  {
    name: 'Mental Processing Speed Test Calculator',
    slug: 'mental-processing-speed-test-calculator',
    description: 'Assess processing speed used in cognitive age estimation.',
  },
  {
    name: 'Working Memory Capacity Estimator',
    slug: 'working-memory-capacity-estimator',
    description: 'Evaluate memory function affecting cognitive age.',
  },
  {
    name: 'Attention Span Index Calculator',
    slug: 'attention-span-index-calculator',
    description: 'Measure attention capacity influencing cognitive age.',
  },
  {
    name: 'Reaction Time Benchmark Calculator',
    slug: 'reaction-time-benchmark-calculator',
    description: 'Benchmark reaction time related to cognitive age.',
  },
];

const baseUrl = 'https://mycalculating.com/category/health-fitness/cognitive-age-estimator';

const schemaMarkup = {
  '@context': 'https://schema.org',
  '@graph': [
    {
      '@type': 'BreadcrumbList',
      itemListElement: [
        { '@type': 'ListItem', position: 1, name: 'Home', item: 'https://mycalculating.com' },
        { '@type': 'ListItem', position: 2, name: 'Health & Fitness', item: 'https://mycalculating.com/category/health-fitness' },
        { '@type': 'ListItem', position: 3, name: 'Cognitive Age Estimator', item: baseUrl },
      ],
    },
    {
      '@type': 'SoftwareApplication',
      name: 'Cognitive Age Estimator',
      applicationCategory: 'Calculator',
      operatingSystem: 'Web Browser',
      description: 'Estimate your cognitive age based on processing speed, memory, attention, executive function, sleep quality, and exercise to understand brain health relative to chronological age.',
      url: baseUrl,
      offers: { '@type': 'Offer', price: '0', priceCurrency: 'USD' },
    },
  ],
};

const calculateResult = (values: FormValues): ResultPayload => {
  // Calculate average cognitive performance score
  const avgCognitiveScore = (values.processingSpeed + values.memoryScore + values.attentionScore + values.executiveFunctionScore) / 4;
  
  // Expected cognitive score for chronological age (declines with age)
  const expectedScore = 100 - (values.chronologicalAge - 20) * 0.8; // Decline of ~0.8 points per year after 20
  
  // Calculate age difference based on cognitive performance vs expected
  const performanceDifference = avgCognitiveScore - expectedScore;
  const ageDifference = performanceDifference / 0.8; // Convert score difference to age difference
  
  // Lifestyle adjustments
  const sleepAdjustment = (values.sleepQuality - 5) * 0.5; // Sleep quality impact
  const exerciseAdjustment = (values.exerciseFrequency - 3) * 0.8; // Exercise impact (3 days/week = baseline)
  
  // Calculate cognitive age
  let cognitiveAge = values.chronologicalAge - ageDifference - sleepAdjustment - exerciseAdjustment;
  cognitiveAge = Math.max(18, Math.min(100, Math.round(cognitiveAge)));
  
  const ageDiff = cognitiveAge - values.chronologicalAge;
  
  let cognitiveStatus: string;
  let interpretation: string;
  let status: ResultPayload['status'] = 'matched';
  
  if (ageDiff <= -5) {
    cognitiveStatus = 'Significantly Younger';
    interpretation = `Your cognitive age (${cognitiveAge}) is significantly younger than your chronological age (${values.chronologicalAge}). Excellent brain health and cognitive preservation!`;
    status = 'younger';
  } else if (ageDiff < 0) {
    cognitiveStatus = 'Younger';
    interpretation = `Your cognitive age (${cognitiveAge}) is younger than your chronological age (${values.chronologicalAge}). Your brain is functioning better than average for your age.`;
    status = 'younger';
  } else if (ageDiff <= 2) {
    cognitiveStatus = 'Matched';
    interpretation = `Your cognitive age (${cognitiveAge}) closely matches your chronological age (${values.chronologicalAge}). This is within normal range.`;
    status = 'matched';
  } else {
    cognitiveStatus = 'Older';
    interpretation = `Your cognitive age (${cognitiveAge}) is older than your chronological age (${values.chronologicalAge}). Consider lifestyle improvements to support brain health.`;
    status = 'older';
  }
  
  const recommendations = [
    `Your average cognitive score is ${avgCognitiveScore.toFixed(1)}/100. ${avgCognitiveScore >= 80 ? 'Excellent cognitive function!' : avgCognitiveScore >= 70 ? 'Good cognitive function with room for improvement.' : 'Consider focusing on cognitive health improvements.'}`,
    `Cognitive age difference: ${Math.abs(ageDiff)} years ${ageDiff < 0 ? 'younger' : 'older'} than chronological age.`,
    'Engage in regular physical exercise: Aim for 150+ minutes per week. Exercise promotes neuroplasticity and cognitive health.',
    'Optimize sleep quality: Aim for 7-9 hours of quality sleep. Poor sleep accelerates cognitive aging.',
    'Challenge your brain regularly: Puzzles, learning new skills, reading, and brain training exercises maintain cognitive function.',
    'Maintain social connections: Social engagement supports cognitive health and reduces cognitive decline risk.',
    'Manage stress effectively: Chronic stress accelerates cognitive aging. Practice meditation, mindfulness, or relaxation techniques.',
    'Eat a brain-healthy diet: Rich in omega-3s, antioxidants, and whole foods. Avoid processed foods and excessive sugar.',
    'Stay mentally active: Continuous learning, creative activities, and intellectual engagement help maintain cognitive age.',
  ];
  
  const plan = [
    { label: 'This Week', detail: 'Assess current cognitive scores if needed. Begin or maintain exercise routine. Improve sleep hygiene.' },
    { label: 'This Month', detail: 'Establish regular brain training routine. Increase physical activity to 3+ days per week. Optimize sleep schedule.' },
    { label: 'This Year', detail: 'Maintain lifestyle changes. Re-assess cognitive age annually. Monitor improvements and adjust strategies.' },
  ];
  
  return {
    cognitiveAge,
    ageDifference: Math.round(ageDiff),
    cognitiveStatus,
    status,
    interpretation,
    recommendations,
    plan,
  };
};

export default function CognitiveAgeEstimator() {
  const [result, setResult] = useState<ResultPayload | null>(null);
  
  const form = useForm<FormValues>({
    resolver: zodResolver(formSchema),
    defaultValues: {
      chronologicalAge: undefined,
      processingSpeed: undefined,
      memoryScore: undefined,
      attentionScore: undefined,
      executiveFunctionScore: undefined,
      sleepQuality: undefined,
      exerciseFrequency: undefined,
    },
  });
  
  return (
    <div className="space-y-8">
      <Script id="cae-schema" type="application/ld+json" strategy="afterInteractive" dangerouslySetInnerHTML={{ __html: JSON.stringify(schemaMarkup) }} />
      
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <Brain className="h-5 w-5" />
            Cognitive Age Estimator
          </CardTitle>
          <CardDescription>Estimate your cognitive age based on processing speed, memory, attention, executive function, sleep quality, and exercise to understand brain health relative to chronological age.</CardDescription>
        </CardHeader>
      </Card>
      
      <Card>
        <CardHeader>
          <CardTitle>Input your cognitive and lifestyle data</CardTitle>
        </CardHeader>
        <CardContent>
          <Form {...form}>
            <form onSubmit={form.handleSubmit((values) => setResult(calculateResult(values)))} className="space-y-6">
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <FormField
                  control={form.control}
                  name="chronologicalAge"
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel>Chronological age</FormLabel>
                      <FormControl>
                        <Input type="number" step="1" placeholder="e.g., 45" value={field.value ?? ''} onChange={(e) => field.onChange(e.target.value === '' ? undefined : Number(e.target.value))} />
                      </FormControl>
                      <FormMessage />
                    </FormItem>
                  )}
                />
                <FormField
                  control={form.control}
                  name="processingSpeed"
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel>Processing speed score (0-100)</FormLabel>
                      <FormControl>
                        <Input type="number" step="1" placeholder="e.g., 75" value={field.value ?? ''} onChange={(e) => field.onChange(e.target.value === '' ? undefined : Number(e.target.value))} />
                      </FormControl>
                      <FormMessage />
                    </FormItem>
                  )}
                />
                <FormField
                  control={form.control}
                  name="memoryScore"
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel>Memory score (0-100)</FormLabel>
                      <FormControl>
                        <Input type="number" step="1" placeholder="e.g., 70" value={field.value ?? ''} onChange={(e) => field.onChange(e.target.value === '' ? undefined : Number(e.target.value))} />
                      </FormControl>
                      <FormMessage />
                    </FormItem>
                  )}
                />
                <FormField
                  control={form.control}
                  name="attentionScore"
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel>Attention score (0-100)</FormLabel>
                      <FormControl>
                        <Input type="number" step="1" placeholder="e.g., 80" value={field.value ?? ''} onChange={(e) => field.onChange(e.target.value === '' ? undefined : Number(e.target.value))} />
                      </FormControl>
                      <FormMessage />
                    </FormItem>
                  )}
                />
                <FormField
                  control={form.control}
                  name="executiveFunctionScore"
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel>Executive function score (0-100)</FormLabel>
                      <FormControl>
                        <Input type="number" step="1" placeholder="e.g., 72" value={field.value ?? ''} onChange={(e) => field.onChange(e.target.value === '' ? undefined : Number(e.target.value))} />
                      </FormControl>
                      <FormMessage />
                    </FormItem>
                  )}
                />
                <FormField
                  control={form.control}
                  name="sleepQuality"
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel>Sleep quality (1-10, 10 = excellent)</FormLabel>
                      <FormControl>
                        <Input type="number" step="1" placeholder="e.g., 7" value={field.value ?? ''} onChange={(e) => field.onChange(e.target.value === '' ? undefined : Number(e.target.value))} />
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
                      <FormLabel>Exercise frequency (days per week, 0-7)</FormLabel>
                      <FormControl>
                        <Input type="number" step="1" placeholder="e.g., 4" value={field.value ?? ''} onChange={(e) => field.onChange(e.target.value === '' ? undefined : Number(e.target.value))} />
                      </FormControl>
                      <FormMessage />
                    </FormItem>
                  )}
                />
              </div>
              <Button type="submit" className="w-full md:w-auto">
                Estimate Cognitive Age
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
            <CardDescription>See your estimated cognitive age and brain health recommendations.</CardDescription>
          </CardHeader>
          <CardContent className="space-y-6">
            <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
              <div className="p-4 border rounded">
                <p className="text-sm text-muted-foreground">Cognitive Age</p>
                <p className="text-2xl font-semibold text-primary">{result.cognitiveAge}</p>
                <p className="text-xs text-muted-foreground">Years</p>
              </div>
              <div className="p-4 border rounded">
                <p className="text-sm text-muted-foreground">Age Difference</p>
                <p className="text-2xl font-semibold text-primary">{result.ageDifference > 0 ? '+' : ''}{result.ageDifference}</p>
                <p className="text-xs text-muted-foreground">Years</p>
              </div>
              <div className="p-4 border rounded">
                <p className="text-sm text-muted-foreground">Cognitive Status</p>
                <p className="text-2xl font-semibold text-primary">{result.cognitiveStatus}</p>
                <p className="text-xs text-muted-foreground">Compared to age</p>
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
                    <TrendingDown className="h-4 w-4" />
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
            <strong>Average Cognitive Score</strong> = (Processing Speed + Memory + Attention + Executive Function) / 4
          </p>
          <p>
            <strong>Expected Score for Age</strong> = 100 - ((Chronological Age - 20) × 0.8)
          </p>
          <p>
            <strong>Performance Difference</strong> = Average Cognitive Score - Expected Score
          </p>
          <p>
            <strong>Age Difference</strong> = Performance Difference / 0.8
          </p>
          <p>
            <strong>Lifestyle Adjustments</strong> = Sleep Adjustment + Exercise Adjustment
          </p>
          <p>
            <strong>Cognitive Age</strong> = Chronological Age - Age Difference - Lifestyle Adjustments
          </p>
          <p>Cognitive age is estimated by comparing cognitive performance to age-adjusted norms, with lifestyle factors influencing the final estimate.</p>
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
            Cognitive age estimates how old your brain functions compared to your chronological age. It provides insight into brain health and cognitive preservation. A cognitive age younger than your actual age suggests better-than-average brain function, while an older cognitive age may indicate areas for improvement.
          </p>
          <p>
            This estimator combines multiple cognitive measures (processing speed, memory, attention, executive function) with lifestyle factors (sleep, exercise) to provide a comprehensive estimate of cognitive age. Understanding your cognitive age helps you make informed decisions about brain health strategies and monitor the effectiveness of lifestyle interventions.
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
          <p>This tool estimates cognitive age based on processing speed, memory, attention, executive function scores, sleep quality, and exercise frequency.</p>
          <p>Outputs include estimated cognitive age, age difference from chronological age, cognitive status, interpretation, recommendations, and an action plan.</p>
          <p>Formula, steps, guide content, related tools, and FAQs ensure humans or AI assistants can interpret the methodology instantly.</p>
        </CardContent>
      </Card>
    </div>
  );
}

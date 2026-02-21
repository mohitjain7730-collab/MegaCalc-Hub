'use client';

import { useState } from 'react';
import Script from 'next/script';
import Link from 'next/link';
import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import { z } from 'zod';
import { Wind, Activity, Target, Shield, TrendingUp } from 'lucide-react';

import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Form, FormControl, FormField, FormItem, FormLabel, FormMessage } from '@/components/ui/form';
import { Input } from '@/components/ui/input';

const formSchema = z.object({
  breathsPerMinute: z.number({ invalid_type_error: 'Enter breaths per minute' }).min(8).max(30),
  inhalationSeconds: z.number({ invalid_type_error: 'Enter inhalation seconds' }).min(2).max(10),
  exhalationSeconds: z.number({ invalid_type_error: 'Enter exhalation seconds' }).min(2).max(10),
  breathHoldCapacity: z.number({ invalid_type_error: 'Enter breath hold' }).min(10).max(180),
  diaphragmaticBreathing: z.number({ invalid_type_error: 'Enter diaphragmatic rating' }).min(1).max(10),
  breathingRegularity: z.number({ invalid_type_error: 'Enter regularity' }).min(1).max(10),
});

type FormValues = z.infer<typeof formSchema>;

type ResultPayload = {
  efficiencyScore: number;
  efficiencyLevel: string;
  breathingRatio: number;
  status: 'optimal' | 'good' | 'moderate' | 'needs-improvement';
  interpretation: string;
  recommendations: string[];
  plan: { label: string; detail: string }[];
};

const steps = [
  'Count your resting breaths per minute (normal range: 12-20).',
  'Time your inhalation duration in seconds.',
  'Time your exhalation duration in seconds.',
  'Test your breath hold capacity after normal exhalation (seconds).',
  'Rate your diaphragmatic breathing quality (1-10, 10 = excellent deep breathing).',
  'Rate breathing regularity/rhythm (1-10, 10 = very regular and consistent).',
  'Review your breathing pattern efficiency score and optimization recommendations.',
];

const faqs = [
  {
    question: 'What is efficient breathing?',
    answer:
      'Efficient breathing involves optimal respiratory rate (12-20 breaths/min at rest), balanced inhalation-to-exhalation ratio (ideally 1:2), diaphragmatic (belly) breathing, and regular rhythm. Efficient breathing maximizes oxygen uptake and carbon dioxide removal with minimal effort.',
  },
  {
    question: 'What is the optimal breathing rate?',
    answer:
      'The optimal resting breathing rate is 12-20 breaths per minute for most adults. Lower rates (8-12) during relaxation indicate good efficiency. Higher rates (above 20) may indicate stress, poor fitness, or inefficient breathing patterns.',
  },
  {
    question: 'What is the ideal inhalation-to-exhalation ratio?',
    answer:
      'The ideal ratio is 1:2 (exhalation twice as long as inhalation). This promotes relaxation, activates the parasympathetic nervous system, and improves breathing efficiency. Many people have a 1:1 ratio, which is less optimal.',
  },
  {
    question: 'What is diaphragmatic breathing?',
    answer:
      'Diaphragmatic breathing (belly breathing) involves breathing deeply into the diaphragm, causing the abdomen to expand. It\'s more efficient than shallow chest breathing, improves oxygen exchange, and reduces breathing effort.',
  },
  {
    question: 'What is a good breathing efficiency score?',
    answer:
      'Scores above 75 indicate optimal breathing efficiency. 60-75 is good, 45-59 is moderate, and below 45 suggests significant improvements needed in breathing patterns.',
  },
  {
    question: 'How does breathing affect stress and relaxation?',
    answer:
      'Slow, deep, diaphragmatic breathing activates the parasympathetic nervous system, reducing stress and promoting relaxation. Faster, shallow breathing activates the sympathetic system, increasing stress. Breathing directly influences stress response.',
  },
  {
    question: 'Can breathing patterns be improved?',
    answer:
      'Yes, through breathing exercises, breathwork training, mindfulness practices, and physical exercise. With practice, you can develop more efficient breathing patterns that reduce stress, improve energy, and enhance wellbeing.',
  },
  {
    question: 'What is breath hold capacity and why does it matter?',
    answer:
      'Breath hold capacity (apnea time) reflects lung efficiency, oxygen utilization, and carbon dioxide tolerance. Longer breath holds (40+ seconds) typically indicate better respiratory efficiency and fitness.',
  },
  {
    question: 'Does breathing efficiency affect physical performance?',
    answer:
      'Yes, efficient breathing improves athletic performance by optimizing oxygen delivery, reducing breathing effort, improving recovery, and enhancing endurance. Proper breathing is fundamental to physical performance.',
  },
  {
    question: 'How does breathing efficiency relate to sleep?',
    answer:
      'Efficient breathing patterns improve sleep quality. Slower, deeper breathing promotes relaxation and better sleep. Poor breathing patterns (fast, shallow) can disrupt sleep and contribute to sleep disorders.',
  },
];

const relatedCalculators = [
  {
    name: 'Meditation Stress Reduction Impact Calculator',
    slug: 'meditation-stress-reduction-impact-calculator',
    description: 'Measure stress reduction enhanced by efficient breathing.',
  },
  {
    name: 'Stress Hormone Balance Calculator',
    slug: 'stress-hormone-balance-calculator',
    description: 'Assess stress hormones affected by breathing patterns.',
  },
  {
    name: 'Meditation Streak Mindfulness Progress Tracker',
    slug: 'meditation-streak-mindfulness-progress-tracker',
    description: 'Track meditation practices that improve breathing efficiency.',
  },
  {
    name: 'Emotional Stability Index Calculator',
    slug: 'emotional-stability-index-calculator',
    description: 'Evaluate emotional stability supported by efficient breathing.',
  },
];

const baseUrl = 'https://mycalculating.com/health-fitness/breathing-pattern-efficiency-calculator';

const schemaMarkup = {
  '@context': 'https://schema.org',
  '@graph': [
    {
      '@type': 'BreadcrumbList',
      itemListElement: [
        { '@type': 'ListItem', position: 1, name: 'Home', item: 'https://mycalculating.com' },
        { '@type': 'ListItem', position: 2, name: 'Health & Fitness', item: 'https://mycalculating.com/health-fitness' },
        { '@type': 'ListItem', position: 3, name: 'Breathing Pattern Efficiency Wellness Calculator', item: baseUrl },
      ],
    },
    {
      '@type': 'SoftwareApplication',
      name: 'Breathing Pattern Efficiency Wellness Calculator',
      applicationCategory: 'Calculator',
      operatingSystem: 'Web Browser',
      description: 'Assess breathing pattern efficiency by evaluating respiratory rate, inhalation-to-exhalation ratio, diaphragmatic breathing, breath hold capacity, and breathing regularity.',
      url: baseUrl,
      offers: { '@type': 'Offer', price: '0', priceCurrency: 'USD' },
    },
  ],
};

const calculateResult = (values: FormValues): ResultPayload => {
  // Calculate breathing rate score (optimal: 12-16)
  let rateScore = 25;
  if (values.breathsPerMinute < 12 || values.breathsPerMinute > 20) {
    rateScore = 15;
  }
  if (values.breathsPerMinute < 10 || values.breathsPerMinute > 25) {
    rateScore = 10;
  }
  
  // Calculate ratio score (ideal: 1:2)
  const ratio = values.exhalationSeconds / values.inhalationSeconds;
  let ratioScore = 25;
  if (ratio >= 1.8 && ratio <= 2.2) {
    ratioScore = 25; // Optimal
  } else if (ratio >= 1.5 && ratio < 1.8) {
    ratioScore = 20; // Good
  } else if (ratio >= 1.2 && ratio < 1.5) {
    ratioScore = 15; // Moderate
  } else {
    ratioScore = 10; // Needs improvement
  }
  
  // Calculate breath hold score (good: 40+ seconds)
  const holdScore = Math.min((values.breathHoldCapacity / 60) * 20, 20);
  
  // Calculate diaphragmatic breathing score
  const diaphragmaticScore = (values.diaphragmaticBreathing / 10) * 15;
  
  // Calculate regularity score
  const regularityScore = (values.breathingRegularity / 10) * 15;
  
  // Total efficiency score
  const efficiencyScore = Math.round(rateScore + ratioScore + holdScore + diaphragmaticScore + regularityScore);
  
  const breathingRatio = parseFloat(ratio.toFixed(2));
  
  let efficiencyLevel: string;
  let interpretation: string;
  let status: ResultPayload['status'] = 'good';
  
  if (efficiencyScore >= 75) {
    efficiencyLevel = 'Optimal';
    interpretation = 'This suggests a general lifestyle tendency where your breathing pattern may be highly efficient with optimal rate, ratio, and technique. This may support excellent respiratory function and wellbeing.';
    status = 'optimal';
  } else if (efficiencyScore >= 60) {
    efficiencyLevel = 'Good';
    interpretation = 'This suggests a general lifestyle tendency where your breathing pattern may be good with room for minor improvements. You may consider optimizing ratio or diaphragmatic breathing to enhance efficiency further.';
    status = 'good';
  } else if (efficiencyScore >= 45) {
    efficiencyLevel = 'Moderate';
    interpretation = 'This suggests a general lifestyle tendency where your breathing pattern may be moderate. You may consider focusing on improving breathing rate, ratio, or diaphragmatic breathing techniques for better efficiency.';
    status = 'moderate';
  } else {
    efficiencyLevel = 'Areas for Improvement';
    interpretation = 'This suggests a general lifestyle tendency where your breathing pattern may need improvement. You may consider breathing exercises, breathwork training, or seeking professional guidance for optimization. This is a personal insight, not a medical evaluation.';
    status = 'needs-improvement';
  }
  
  const recommendations = [
    `Your breathing rate is ${values.breathsPerMinute} breaths/min. ${values.breathsPerMinute >= 12 && values.breathsPerMinute <= 20 ? 'Optimal range!' : values.breathsPerMinute > 20 ? 'Consider slowing your breathing rate for better efficiency.' : 'Your breathing rate is quite slowâ€”ensure this feels comfortable and natural.'}`,
    `Your inhalation-to-exhalation ratio is 1:${breathingRatio.toFixed(1)}. ${ratio >= 1.8 && ratio <= 2.2 ? 'Optimal ratio!' : 'Aim for a 1:2 ratio (exhalation twice as long as inhalation) for optimal efficiency and relaxation.'}`,
    `Breath hold capacity: ${values.breathHoldCapacity} seconds. ${values.breathHoldCapacity >= 40 ? 'Good capacity!' : 'Practice breath hold exercises to improve lung efficiency and capacity.'}`,
    `Diaphragmatic breathing: ${values.diaphragmaticBreathing}/10. ${values.diaphragmaticBreathing >= 8 ? 'Excellent!' : 'Practice diaphragmatic (belly) breathing to improve efficiency and oxygen exchange.'}`,
    'Practice slow, deep breathing exercises: Aim for 5-6 breaths per minute during practice sessions to improve efficiency.',
    'Work on exhalation length: Extend exhalation to be twice as long as inhalation for optimal relaxation and efficiency.',
    'Practice breath hold exercises: Gradually increase breath hold capacity through safe, progressive training.',
    'Engage in regular breathwork: Structured breathing exercises (box breathing, 4-7-8 breathing) improve pattern efficiency.',
    'Combine with physical exercise: Cardiovascular and respiratory fitness enhance overall breathing efficiency.',
  ];
  
  const plan = [
    { label: 'This Week', detail: 'Practice slow, deep breathing exercises daily. Focus on extending exhalation length. Time your breathing patterns to establish baseline.' },
    { label: 'This Month', detail: 'Continue breathing exercises. Work toward 1:2 inhalation-to-exhalation ratio. Practice diaphragmatic breathing techniques.' },
    { label: 'Ongoing', detail: 'Maintain efficient breathing patterns. Monitor improvements in breathing efficiency, stress levels, and overall wellbeing.' },
  ];
  
  return {
    efficiencyScore,
    efficiencyLevel,
    breathingRatio,
    status,
    interpretation,
    recommendations,
    plan,
  };
};

export default function BreathingPatternEfficiencyCalculator() {
  const [result, setResult] = useState<ResultPayload | null>(null);
  
  const form = useForm<FormValues>({
    resolver: zodResolver(formSchema),
    defaultValues: {
      breathsPerMinute: undefined,
      inhalationSeconds: undefined,
      exhalationSeconds: undefined,
      breathHoldCapacity: undefined,
      diaphragmaticBreathing: undefined,
      breathingRegularity: undefined,
    },
  });
  
  return (
    <div className="space-y-8">
      <Script id="bpe-schema" type="application/ld+json" strategy="afterInteractive" dangerouslySetInnerHTML={{ __html: JSON.stringify(schemaMarkup) }} />
      
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <Wind className="h-5 w-5" />
            Breathing Pattern Efficiency Wellness Calculator
          </CardTitle>
          <CardDescription>Assess breathing pattern efficiency by evaluating respiratory rate, inhalation-to-exhalation ratio, diaphragmatic breathing, breath hold capacity, and breathing regularity.</CardDescription>
        </CardHeader>
      </Card>
      
      <Card>
        <CardHeader>
          <CardTitle>Input your breathing pattern data</CardTitle>
        </CardHeader>
        <CardContent>
          <Form {...form}>
            <form onSubmit={form.handleSubmit((values) => setResult(calculateResult(values)))} className="space-y-6">
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <FormField
                  control={form.control}
                  name="breathsPerMinute"
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel>Breaths per minute (resting)</FormLabel>
                      <FormControl>
                        <Input type="number" step="1" placeholder="e.g., 15" value={field.value ?? ''} onChange={(e) => field.onChange(e.target.value === '' ? undefined : Number(e.target.value))} />
                      </FormControl>
                      <FormMessage />
                    </FormItem>
                  )}
                />
                <FormField
                  control={form.control}
                  name="inhalationSeconds"
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel>Inhalation duration (seconds)</FormLabel>
                      <FormControl>
                        <Input type="number" step="1" placeholder="e.g., 4" value={field.value ?? ''} onChange={(e) => field.onChange(e.target.value === '' ? undefined : Number(e.target.value))} />
                      </FormControl>
                      <FormMessage />
                    </FormItem>
                  )}
                />
                <FormField
                  control={form.control}
                  name="exhalationSeconds"
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel>Exhalation duration (seconds)</FormLabel>
                      <FormControl>
                        <Input type="number" step="1" placeholder="e.g., 8" value={field.value ?? ''} onChange={(e) => field.onChange(e.target.value === '' ? undefined : Number(e.target.value))} />
                      </FormControl>
                      <FormMessage />
                    </FormItem>
                  )}
                />
                <FormField
                  control={form.control}
                  name="breathHoldCapacity"
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel>Breath hold capacity (seconds after normal exhalation)</FormLabel>
                      <FormControl>
                        <Input type="number" step="1" placeholder="e.g., 45" value={field.value ?? ''} onChange={(e) => field.onChange(e.target.value === '' ? undefined : Number(e.target.value))} />
                      </FormControl>
                      <FormMessage />
                    </FormItem>
                  )}
                />
                <FormField
                  control={form.control}
                  name="diaphragmaticBreathing"
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel>Diaphragmatic breathing quality (1-10, 10 = excellent)</FormLabel>
                      <FormControl>
                        <Input type="number" step="1" placeholder="e.g., 7" value={field.value ?? ''} onChange={(e) => field.onChange(e.target.value === '' ? undefined : Number(e.target.value))} />
                      </FormControl>
                      <FormMessage />
                    </FormItem>
                  )}
                />
                <FormField
                  control={form.control}
                  name="breathingRegularity"
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel>Breathing regularity/rhythm (1-10, 10 = very regular)</FormLabel>
                      <FormControl>
                        <Input type="number" step="1" placeholder="e.g., 8" value={field.value ?? ''} onChange={(e) => field.onChange(e.target.value === '' ? undefined : Number(e.target.value))} />
                      </FormControl>
                      <FormMessage />
                    </FormItem>
                  )}
                />
              </div>
              <Button type="submit" className="w-full md:w-auto">
                Calculate Breathing Efficiency
              </Button>
            </form>
          </Form>
        </CardContent>
      </Card>
      
      {result && (
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <Activity className="h-5 w-5 text-primary" />
              Interactive results
            </CardTitle>
            <CardDescription>See your breathing pattern efficiency score and optimization recommendations.</CardDescription>
          </CardHeader>
          <CardContent className="space-y-6">
            <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
              <div className="p-4 border rounded">
                <p className="text-sm text-muted-foreground">Efficiency Score</p>
                <p className="text-2xl font-semibold text-primary">{result.efficiencyScore}</p>
                <p className="text-xs text-muted-foreground">Out of 100</p>
              </div>
              <div className="p-4 border rounded">
                <p className="text-sm text-muted-foreground">Efficiency Level</p>
                <p className="text-2xl font-semibold text-primary">{result.efficiencyLevel}</p>
                <p className="text-xs text-muted-foreground">Performance level</p>
              </div>
              <div className="p-4 border rounded">
                <p className="text-sm text-muted-foreground">Breathing Ratio</p>
                <p className="text-2xl font-semibold text-primary">1:{result.breathingRatio.toFixed(1)}</p>
                <p className="text-xs text-muted-foreground">Exhalation:Inhalation</p>
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
            <strong>Efficiency Score</strong> = Rate Score + Ratio Score + Hold Score + Diaphragmatic Score + Regularity Score
          </p>
          <p>
            <strong>Rate Score</strong> = Based on breaths per minute (optimal: 12-20 = 25 points)
          </p>
          <p>
            <strong>Ratio Score</strong> = Based on exhalation-to-inhalation ratio (optimal 1:2 = 25 points)
          </p>
          <p>
            <strong>Hold Score</strong> = (Breath Hold Capacity / 60) Ã— 20 (max 20 points)
          </p>
          <p>
            <strong>Diaphragmatic Score</strong> = (Diaphragmatic Breathing Rating / 10) Ã— 15
          </p>
          <p>
            <strong>Regularity Score</strong> = (Breathing Regularity Rating / 10) Ã— 15
          </p>
          <p>
            <strong>Breathing Ratio</strong> = Exhalation Seconds / Inhalation Seconds
          </p>
          <p>Score ranges from 0-100, with higher scores indicating more efficient breathing patterns.</p>
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
            Breathing pattern efficiency refers to how effectively your breathing maximizes oxygen uptake and carbon dioxide removal while minimizing effort. Efficient breathing involves optimal respiratory rate, balanced inhalation-to-exhalation ratio, diaphragmatic (belly) breathing, and regular rhythm. Poor breathing patterns can contribute to stress, fatigue, and reduced physical performance.
          </p>
          <p>
            This calculator assesses your breathing pattern efficiency by evaluating multiple factors. Understanding your breathing efficiency helps you optimize your respiratory function, reduce stress, improve energy levels, and enhance overall wellbeing through targeted breathing exercises and techniques.
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
          <p>This tool provides general wellness insights about breathing pattern efficiency by evaluating respiratory rate, inhalation-to-exhalation ratio, diaphragmatic breathing, breath hold capacity, and breathing regularity. This is a personal lifestyle insight, not a medical evaluation.</p>
          <p>Outputs include an efficiency score, efficiency level, breathing ratio, interpretation, recommendations, and an action plan.</p>
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
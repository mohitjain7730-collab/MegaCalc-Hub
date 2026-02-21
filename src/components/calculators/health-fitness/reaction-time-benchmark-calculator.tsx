'use client';

import { useState } from 'react';
import Script from 'next/script';
import Link from 'next/link';
import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import { z } from 'zod';
import { BarChart3, Clock, Target, Shield, TrendingUp } from 'lucide-react';

import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Form, FormControl, FormField, FormItem, FormLabel, FormMessage } from '@/components/ui/form';
import { Input } from '@/components/ui/input';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';

const formSchema = z.object({
  simpleReactionTime: z.number({ invalid_type_error: 'Enter reaction time' }).min(100).max(1000),
  choiceReactionTime: z.number({ invalid_type_error: 'Enter reaction time' }).min(200).max(2000),
  age: z.number({ invalid_type_error: 'Enter age' }).min(18).max(100),
  gender: z.enum(['male', 'female', 'other']),
});

type FormValues = z.infer<typeof formSchema>;

type ResultPayload = {
  simplePercentile: number;
  choicePercentile: number;
  overallBenchmark: string;
  benchmarkLevel: string;
  status: 'elite' | 'above-average' | 'average' | 'below-average';
  interpretation: string;
  recommendations: string[];
  plan: { label: string; detail: string }[];
};

const steps = [
  'Measure simple reaction time (respond to a single stimulus like light/sound) in milliseconds.',
  'Measure choice reaction time (respond to one of multiple stimuli) in milliseconds.',
  'Enter your age to compare against age-adjusted benchmarks.',
  'Select your gender to compare against gender-adjusted benchmarks.',
  'Review your reaction time percentiles, benchmark level, and recommendations.',
];

const faqs = [
  {
    question: 'What is reaction time benchmarking?',
    answer:
      'Reaction time benchmarking compares your reaction times against population norms based on age and gender. It helps you understand how your reaction speed compares to others in your demographic group.',
  },
  {
    question: 'What are typical reaction times?',
    answer:
      'Simple reaction times: Young adults (18-30): 190-250ms, Middle-aged (30-50): 220-280ms, Older adults (50+): 250-350ms. Choice reaction times are typically 50-100ms slower than simple reaction times.',
  },
  {
    question: 'How does age affect reaction time?',
    answer:
      'Reaction time gradually slows with age, starting around age 30. This decline is due to slower neural processing, decreased motor speed, and changes in attention. Regular exercise and brain training can help maintain reaction speed.',
  },
  {
    question: 'Do men and women have different reaction times?',
    answer:
      'On average, men tend to have slightly faster simple reaction times (about 10-20ms faster), while choice reaction times show less gender difference. However, individual variation is much larger than gender differences.',
  },
  {
    question: 'What percentile is considered good?',
    answer:
      'Percentiles above 75th are considered above-average/excellent. 50th-75th is average to good. 25th-50th is below-average. Below 25th may indicate areas for improvement or factors affecting performance.',
  },
  {
    question: 'Can I improve my reaction time?',
    answer:
      'Yes, through: reaction time training exercises, physical exercise (especially high-intensity), adequate sleep, stress management, brain training games, and maintaining overall health.',
  },
  {
    question: 'What factors affect reaction time?',
    answer:
      'Factors include: age, sleep quality and quantity, fatigue, stress, medications, alcohol, caffeine, physical fitness, practice/training, alertness level, and individual neurological differences.',
  },
  {
    question: 'How accurate are reaction time tests?',
    answer:
      'Reaction time can vary significantly based on test conditions, time of day, alertness, and device accuracy. Multiple tests provide more reliable benchmarks. Use consistent test conditions for accurate comparisons.',
  },
  {
    question: 'What is the difference between simple and choice reaction time?',
    answer:
      'Simple reaction time measures response to a single, predictable stimulus. Choice reaction time requires selecting the correct response from multiple options, adding decision-making complexity that slows responses.',
  },
  {
    question: 'When should I be concerned about slow reaction time?',
    answer:
      'If reaction times are significantly slower than expected for your age (below 25th percentile) or if you notice sudden changes, you may consider factors like sleep, stress, medications, or seek professional guidance if concerns persist. This is general wellness information, not a medical diagnosis.',
  },
];

const relatedCalculators = [
  {
    name: 'Mental Processing Speed Wellness Estimator',
    slug: 'mental-processing-speed-test-calculator',
    description: 'Get wellness insights about overall mental processing speed including reaction time.',
  },
  {
    name: 'Reaction Time Improvement Tracker',
    slug: 'reaction-time-improvement-tracker',
    description: 'Track improvements in reaction time over time.',
  },
  {
    name: 'Cognitive Age Wellness Estimator',
    slug: 'cognitive-age-estimator',
    description: 'Get wellness insights about cognitive age based on multiple cognitive measures.',
  },
  {
    name: 'Working Memory Wellness Estimator',
    slug: 'working-memory-capacity-estimator',
    description: 'Get wellness insights about working memory that may affect reaction time.',
  },
];

const baseUrl = 'https://mycalculating.com/category/health-fitness/reaction-time-benchmark-calculator';

const schemaMarkup = {
  '@context': 'https://schema.org',
  '@graph': [
    {
      '@type': 'BreadcrumbList',
      itemListElement: [
        { '@type': 'ListItem', position: 1, name: 'Home', item: 'https://mycalculating.com' },
        { '@type': 'ListItem', position: 2, name: 'Health & Fitness', item: 'https://mycalculating.com/category/health-fitness' },
        { '@type': 'ListItem', position: 3, name: 'Reaction Time Benchmark Wellness Calculator', item: baseUrl },
      ],
    },
    {
      '@type': 'SoftwareApplication',
      name: 'Reaction Time Benchmark Wellness Calculator',
      applicationCategory: 'Calculator',
      operatingSystem: 'Web Browser',
      description: 'Get general wellness insights about reaction times by comparing against age and gender-adjusted population norms. This is a personal lifestyle insight, not a medical evaluation.',
      url: baseUrl,
      offers: { '@type': 'Offer', price: '0', priceCurrency: 'USD' },
    },
  ],
};

// Age and gender-adjusted reaction time norms (milliseconds)
const getExpectedReactionTime = (age: number, gender: string, type: 'simple' | 'choice'): { mean: number; stdDev: number } => {
  let baseMean: number;
  let baseStdDev = 50;
  
  if (type === 'simple') {
    // Simple reaction time norms by age
    if (age < 25) baseMean = 200;
    else if (age < 35) baseMean = 220;
    else if (age < 45) baseMean = 240;
    else if (age < 55) baseMean = 260;
    else if (age < 65) baseMean = 280;
    else baseMean = 300;
    
    // Gender adjustment (males slightly faster)
    if (gender === 'male') baseMean -= 10;
    else if (gender === 'female') baseMean += 5;
  } else {
    // Choice reaction time (typically 50-100ms slower)
    if (age < 25) baseMean = 270;
    else if (age < 35) baseMean = 290;
    else if (age < 45) baseMean = 310;
    else if (age < 55) baseMean = 330;
    else if (age < 65) baseMean = 350;
    else baseMean = 380;
    
    if (gender === 'male') baseMean -= 10;
    else if (gender === 'female') baseMean += 5;
  }
  
  return { mean: baseMean, stdDev: baseStdDev };
};

const calculatePercentile = (value: number, mean: number, stdDev: number): number => {
  // Using normal distribution approximation
  const zScore = (mean - value) / stdDev; // Negative because lower (faster) is better
  // Convert z-score to percentile (using standard normal distribution)
  // Approximate percentile calculation
  let percentile = 50;
  if (zScore > 0) {
    // Faster than average
    if (zScore > 2) percentile = 95;
    else if (zScore > 1.5) percentile = 90;
    else if (zScore > 1) percentile = 85;
    else if (zScore > 0.5) percentile = 70;
    else percentile = 60;
  } else {
    // Slower than average
    if (zScore < -2) percentile = 5;
    else if (zScore < -1.5) percentile = 10;
    else if (zScore < -1) percentile = 15;
    else if (zScore < -0.5) percentile = 30;
    else percentile = 40;
  }
  return Math.round(percentile);
};

const calculateResult = (values: FormValues): ResultPayload => {
  const simpleNorms = getExpectedReactionTime(values.age, values.gender, 'simple');
  const choiceNorms = getExpectedReactionTime(values.age, values.gender, 'choice');
  
  const simplePercentile = calculatePercentile(values.simpleReactionTime, simpleNorms.mean, simpleNorms.stdDev);
  const choicePercentile = calculatePercentile(values.choiceReactionTime, choiceNorms.mean, choiceNorms.stdDev);
  const overallPercentile = Math.round((simplePercentile + choicePercentile) / 2);
  
  let overallBenchmark: string;
  let benchmarkLevel: string;
  let interpretation: string;
  let status: ResultPayload['status'] = 'average';
  
  if (overallPercentile >= 90) {
    overallBenchmark = 'Elite';
    benchmarkLevel = 'Top 10%';
    interpretation = `This suggests a general lifestyle tendency where your reaction times place you in the elite range (${overallPercentile}th percentile) for your age and gender.`;
    status = 'elite';
  } else if (overallPercentile >= 75) {
    overallBenchmark = 'Excellent';
    benchmarkLevel = 'Top 25%';
    interpretation = `This suggests a general lifestyle tendency where your reaction times are excellent (${overallPercentile}th percentile) - significantly faster than average for your age and gender group.`;
    status = 'above-average';
  } else if (overallPercentile >= 50) {
    overallBenchmark = 'Above Average';
    benchmarkLevel = 'Top 50%';
    interpretation = `This suggests a general lifestyle tendency where your reaction times are above average (${overallPercentile}th percentile) - faster than typical for your age and gender.`;
    status = 'above-average';
  } else if (overallPercentile >= 25) {
    overallBenchmark = 'Average';
    benchmarkLevel = 'Typical Range';
    interpretation = `This suggests a general lifestyle tendency where your reaction times are within the average range (${overallPercentile}th percentile) for your age and gender.`;
    status = 'average';
  } else {
    overallBenchmark = 'Below Average';
    benchmarkLevel = 'Areas for Improvement';
    interpretation = `This suggests a general lifestyle tendency where your reaction times are below average (${overallPercentile}th percentile). You may consider reaction time training, improving sleep, managing stress, and overall health optimization. This is a personal insight, not a medical evaluation.`;
    status = 'below-average';
  }
  
  const recommendations = [
    `Your simple reaction time (${values.simpleReactionTime}ms) is in the ${simplePercentile}th percentile. ${simplePercentile >= 75 ? 'Excellent!' : simplePercentile >= 50 ? 'Good, with room for improvement.' : 'You may consider training to improve.'}`,
    `Your choice reaction time (${values.choiceReactionTime}ms) is in the ${choicePercentile}th percentile. ${choicePercentile >= 75 ? 'Excellent!' : choicePercentile >= 50 ? 'Good, with room for improvement.' : 'You may consider training to improve.'}`,
    'You may consider engaging in reaction time training: aim trainers, ball-drop exercises, sprint starts, or reaction-based video games. This is a personal insight, not a medical evaluation.',
    'You may consider maintaining regular physical exercise, especially high-intensity interval training, which may improve neural processing speed.',
    'You may consider ensuring 7-9 hours of quality sleep per night. Poor sleep may slow reaction times.',
    'You may consider managing stress and practicing relaxation techniques. High stress may impair reaction speed.',
    'You may consider staying well-hydrated and maintaining healthy nutrition. Dehydration and poor nutrition may affect cognitive performance.',
    'You may consider avoiding alcohol before tasks requiring fast reactions. Alcohol may slow reaction times.',
    'You may consider practicing regularly with consistent test conditions to track improvements over time.',
  ];
  
  const plan = [
    { label: 'This Week', detail: 'You may consider establishing baseline with multiple tests under consistent conditions. Begin reaction time training exercises.' },
    { label: 'This Month', detail: 'You may consider continuing regular training. Track improvements. Optimize sleep, stress, and overall health factors.' },
    { label: 'Ongoing', detail: 'You may consider maintaining training regimen. Re-benchmark quarterly to track changes and ensure continued improvement.' },
  ];
  
  return {
    simplePercentile,
    choicePercentile,
    overallBenchmark,
    benchmarkLevel,
    status,
    interpretation,
    recommendations,
    plan,
  };
};

export default function ReactionTimeBenchmarkCalculator() {
  const [result, setResult] = useState<ResultPayload | null>(null);
  
  const form = useForm<FormValues>({
    resolver: zodResolver(formSchema),
    defaultValues: {
      simpleReactionTime: undefined,
      choiceReactionTime: undefined,
      age: undefined,
      gender: undefined,
    },
  });
  
  return (
    <div className="space-y-8">
      <Script id="rtb-schema" type="application/ld+json" strategy="afterInteractive" dangerouslySetInnerHTML={{ __html: JSON.stringify(schemaMarkup) }} />
      
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <BarChart3 className="h-5 w-5" />
            Reaction Time Benchmark Wellness Calculator
          </CardTitle>
          <CardDescription>Get general wellness insights about reaction times by comparing against age and gender-adjusted population norms. This is a personal lifestyle insight, not a medical evaluation.</CardDescription>
        </CardHeader>
      </Card>
      
      <Card>
        <CardHeader>
          <CardTitle>Input your reaction time data</CardTitle>
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
                        <Input type="number" step="1" placeholder="e.g., 350" value={field.value ?? ''} onChange={(e) => field.onChange(e.target.value === '' ? undefined : Number(e.target.value))} />
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
                <FormField
                  control={form.control}
                  name="gender"
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel>Gender</FormLabel>
                      <Select onValueChange={field.onChange} value={field.value}>
                        <FormControl>
                          <SelectTrigger>
                            <SelectValue placeholder="Select gender" />
                          </SelectTrigger>
                        </FormControl>
                        <SelectContent>
                          <SelectItem value="male">Male</SelectItem>
                          <SelectItem value="female">Female</SelectItem>
                          <SelectItem value="other">Other</SelectItem>
                        </SelectContent>
                      </Select>
                      <FormMessage />
                    </FormItem>
                  )}
                />
              </div>
              <Button type="submit" className="w-full md:w-auto">
                Calculate Reaction Time Benchmark
              </Button>
            </form>
          </Form>
        </CardContent>
      </Card>
      
      {result && (
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <Clock className="h-5 w-5 text-primary" />
              Interactive results
            </CardTitle>
            <CardDescription>See your reaction time percentiles and benchmark level.</CardDescription>
          </CardHeader>
          <CardContent className="space-y-6">
            <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
              <div className="p-4 border rounded">
                <p className="text-sm text-muted-foreground">Simple RT Percentile</p>
                <p className="text-2xl font-semibold text-primary">{result.simplePercentile}th</p>
                <p className="text-xs text-muted-foreground">Percentile rank</p>
              </div>
              <div className="p-4 border rounded">
                <p className="text-sm text-muted-foreground">Choice RT Percentile</p>
                <p className="text-2xl font-semibold text-primary">{result.choicePercentile}th</p>
                <p className="text-xs text-muted-foreground">Percentile rank</p>
              </div>
              <div className="p-4 border rounded">
                <p className="text-sm text-muted-foreground">Overall Benchmark</p>
                <p className="text-2xl font-semibold text-primary">{result.overallBenchmark}</p>
                <p className="text-xs text-muted-foreground">{result.benchmarkLevel}</p>
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
            <strong>Percentile Calculation</strong> = Based on comparison to age and gender-adjusted population norms
          </p>
          <p>
            <strong>Simple Reaction Time Norms</strong> = Age-adjusted mean reaction times with gender corrections (males typically 10ms faster)
          </p>
          <p>
            <strong>Choice Reaction Time Norms</strong> = Age-adjusted mean reaction times (typically 50-100ms slower than simple RT) with gender corrections
          </p>
          <p>
            <strong>Overall Benchmark</strong> = Average of simple and choice reaction time percentiles
          </p>
          <p>Percentiles are calculated using z-scores based on normal distribution approximations. Lower (faster) reaction times result in higher percentiles.</p>
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
            Reaction time benchmarking may compare your reaction speeds against population norms adjusted for age and gender. This may provide context for understanding whether your reaction times are fast, average, or slow relative to your peers. Reaction time may naturally slow with age due to changes in neural processing speed and motor response. This tool provides general wellness insights, not a medical evaluation.
          </p>
          <p>
            This tool evaluates both simple reaction time (responding to a single stimulus) and choice reaction time (selecting from multiple options). Understanding where you stand relative to benchmarks may help you set realistic goals, track improvements, and identify whether reaction time training may be beneficial for your goals.
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
          <p>This tool provides general wellness insights about reaction times by comparing against age and gender-adjusted population norms. This is a personal lifestyle insight, not a medical evaluation.</p>
          <p>Outputs include simple and choice reaction time percentiles, overall benchmark level, interpretation, recommendations, and an action plan.</p>
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

'use client';

import { useState } from 'react';
import Script from 'next/script';
import Link from 'next/link';
import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import { z } from 'zod';
import { Activity, Zap, Target, AlertTriangle, Shield } from 'lucide-react';

import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Form, FormControl, FormField, FormItem, FormLabel, FormMessage } from '@/components/ui/form';
import { Input } from '@/components/ui/input';

const formSchema = z.object({
  steps: z.number({ invalid_type_error: 'Enter steps' }).min(100).max(50000),
  averageHeartRate: z.number({ invalid_type_error: 'Enter average heart rate' }).min(50).max(220),
  duration: z.number({ invalid_type_error: 'Enter duration' }).min(1).max(480),
  age: z.number({ invalid_type_error: 'Enter age' }).min(10).max(100),
});

type FormValues = z.infer<typeof formSchema>;

type ResultPayload = {
  steps: number;
  averageHeartRate: number;
  duration: number;
  age: number;
  stepsPerMinute: number;
  heartRateReserve: number;
  efficiencyScore: number;
  status: 'optimal' | 'good' | 'moderate' | 'low';
  interpretation: string;
  recommendations: string[];
  plan: { label: string; detail: string }[];
};

const steps = [
  'Enter total steps taken during the activity.',
  'Enter average heart rate (bpm) during the activity.',
  'Enter activity duration (minutes).',
  'Enter your age for heart rate reserve calculation.',
  'Review steps per minute, heart rate reserve, efficiency score, and recommendations.',
];

const faqs = [
  {
    question: 'What is step-to-heart rate efficiency?',
    answer:
      'Step-to-heart rate efficiency measures how effectively your cardiovascular system responds to walking activity. It compares steps taken to heart rate response, indicating fitness level, cardiovascular efficiency, and exercise intensity. Higher efficiency means more steps with lower heart rate response.',
  },
  {
    question: 'How is efficiency score calculated?',
    answer:
      'Efficiency score considers steps per minute, heart rate reserve percentage, and the relationship between them. Higher steps per minute with lower heart rate reserve indicates better efficiency. The score is normalized to a 0-100 scale where higher scores indicate better cardiovascular efficiency.',
  },
  {
    question: 'What is heart rate reserve?',
    answer:
      'Heart rate reserve (HRR) is the difference between maximum heart rate and resting heart rate. It represents your available heart rate range. HRR percentage = ((Exercise HR - Resting HR) / (Max HR - Resting HR)) × 100. It indicates exercise intensity relative to your capacity.',
  },
  {
    question: 'What is a good efficiency score?',
    answer:
      'Efficiency scores above 70 indicate excellent cardiovascular efficiency (high steps with low heart rate). Scores 50-70 indicate good efficiency. Scores 30-50 indicate moderate efficiency, while scores below 30 suggest lower efficiency or higher exercise intensity relative to steps.',
  },
  {
    question: 'How does fitness level affect efficiency?',
    answer:
      'Fitter individuals typically have higher efficiency: they can take more steps with lower heart rate response. As fitness improves, you can maintain higher step rates at lower heart rates. Regular cardiovascular training improves efficiency over time.',
  },
  {
    question: 'What factors affect step-to-heart rate efficiency?',
    answer:
      'Factors include: fitness level (fitter = more efficient), walking speed (faster = higher heart rate), terrain (hills = higher heart rate), body weight (heavier = higher heart rate), age (older = lower max HR), and environmental conditions (heat = higher HR).',
  },
  {
    question: 'How can I improve my efficiency score?',
    answer:
      'Improve efficiency through: regular cardiovascular training (walking, running, cycling), interval training to improve heart rate recovery, weight management (reducing excess weight), consistent activity to build fitness, and proper recovery between sessions.',
  },
  {
    question: 'What does a low efficiency score mean?',
    answer:
      'A low efficiency score may indicate: lower fitness level, higher exercise intensity relative to steps, walking at faster pace, challenging terrain, excess body weight, or need for improved cardiovascular fitness. It doesn\'t necessarily mean poor health—it indicates room for improvement.',
  },
  {
    question: 'Should I aim for high steps or low heart rate?',
    answer:
      'Balance both: aim for adequate steps (7000-10000+ daily) while maintaining moderate heart rate (50-70% HRR for most activities). Very high heart rates with low steps may indicate inefficient movement or high intensity. High steps with moderate heart rate indicates good efficiency.',
  },
  {
    question: 'How often should I measure efficiency?',
    answer:
      'Measure efficiency periodically (monthly) to track fitness improvements. As cardiovascular fitness improves, you should see higher efficiency scores (more steps with lower heart rate). Consistent measurement helps monitor progress and adjust training intensity.',
  },
];

const relatedCalculators = [
  {
    name: 'Step to Calorie Converter',
    slug: 'step-to-calorie-converter',
    description: 'Convert steps to calories burned.',
  },
  {
    name: 'VO2 Max Calculator',
    slug: 'vo2-max-calculator',
    description: 'Assess cardiovascular fitness capacity.',
  },
  {
    name: 'Exercise Calorie Burn Calculator',
    slug: 'mets-calories-burned-calculator',
    description: 'Calculate calories burned during activities.',
  },
  {
    name: 'NEAT Impact Calculator',
    slug: 'neat-impact-calculator',
    description: 'Evaluate non-exercise activity thermogenesis.',
  },
];

const baseUrl = 'https://mycalculating.com/category/health-fitness/step-to-heart-rate-efficiency-calculator';

const schemaMarkup = {
  '@context': 'https://schema.org',
  '@graph': [
    {
      '@type': 'BreadcrumbList',
      itemListElement: [
        { '@type': 'ListItem', position: 1, name: 'Home', item: 'https://mycalculating.com' },
        { '@type': 'ListItem', position: 2, name: 'Health & Fitness', item: 'https://mycalculating.com/category/health-fitness' },
        { '@type': 'ListItem', position: 3, name: 'Step-to-Heart Rate Efficiency Calculator', item: baseUrl },
      ],
    },
    {
      '@type': 'SoftwareApplication',
      name: 'Step-to-Heart Rate Efficiency Calculator',
      applicationCategory: 'Calculator',
      operatingSystem: 'Web Browser',
      description: 'Calculate cardiovascular efficiency by comparing steps to heart rate response during walking activities.',
      url: baseUrl,
      offers: { '@type': 'Offer', price: '0', priceCurrency: 'USD' },
    },
  ],
};

const clamp = (value: number, min: number, max: number) => Math.min(max, Math.max(min, value));

const calculateResult = (values: FormValues): ResultPayload => {
  const steps = values.steps;
  const averageHeartRate = values.averageHeartRate;
  const duration = values.duration;
  const age = values.age;
  
  // Calculate steps per minute
  const stepsPerMinute = duration > 0 ? steps / duration : 0;
  
  // Calculate heart rate reserve
  const maxHeartRate = 220 - age;
  const restingHeartRate = 60; // Estimated, could be made an input
  const heartRateReserve = maxHeartRate - restingHeartRate;
  const hrrPercentage = heartRateReserve > 0 ? ((averageHeartRate - restingHeartRate) / heartRateReserve) * 100 : 0;
  
  // Calculate efficiency score
  // Higher steps per minute with lower HRR percentage = higher efficiency
  // Reference: 100 steps/min at 50% HRR = good efficiency
  const stepsComponent = clamp((stepsPerMinute / 120) * 50, 0, 50); // Steps component (max 50 points)
  const hrrComponent = clamp((1 - hrrPercentage / 100) * 50, 0, 50); // Lower HRR = higher efficiency (max 50 points)
  const efficiencyScore = stepsComponent + hrrComponent;
  
  let status: ResultPayload['status'] = 'optimal';
  let interpretation = 'Your step-to-heart rate efficiency appears excellent. Continue maintaining regular activity and cardiovascular fitness.';

  if (efficiencyScore < 30 || hrrPercentage >= 80) {
    status = 'low';
    interpretation = 'Your efficiency score is low, indicating higher heart rate response relative to steps. This may suggest lower fitness level, high intensity, or need for improved cardiovascular conditioning. Consider regular cardiovascular training to improve efficiency.';
  } else if (efficiencyScore < 50 || hrrPercentage >= 70) {
    status = 'moderate';
    interpretation = 'Your efficiency score is moderate. Heart rate response is somewhat elevated relative to steps. Regular cardiovascular training and consistent activity can help improve efficiency over time.';
  } else if (efficiencyScore < 70) {
    status = 'good';
    interpretation = 'Your efficiency score is good. You\'re maintaining reasonable steps with moderate heart rate response. Continue regular activity to maintain and improve efficiency.';
  } else {
    status = 'optimal';
    interpretation = 'Your efficiency score is excellent. You\'re achieving high steps with low heart rate response, indicating good cardiovascular efficiency. Continue maintaining this level of fitness.';
  }

  const recommendations = [
    `Maintain regular activity: aim for ${stepsPerMinute >= 100 ? 'consistent' : 'increased'} step rates (100+ steps/min) to improve cardiovascular efficiency. Regular walking builds fitness and improves heart rate response.`,
    'Include cardiovascular training: add structured cardio (brisk walking, running, cycling) 3-5 times per week to improve cardiovascular fitness and efficiency. Interval training can be particularly effective.',
  ];
  
  if (hrrPercentage >= 70) {
    recommendations.push('Moderate intensity: your heart rate is in the high-intensity zone. Consider slightly reducing pace or including more moderate-intensity sessions to build aerobic base and improve efficiency.');
  }
  
  if (stepsPerMinute < 80) {
    recommendations.push('Increase step rate: aim for 100+ steps per minute for optimal cardiovascular benefits. Gradually increase walking pace to improve fitness and efficiency.');
  }
  
  if (efficiencyScore < 50) {
    recommendations.push('Build cardiovascular base: focus on consistent, moderate-intensity activity to improve cardiovascular fitness. As fitness improves, efficiency score should increase (more steps with lower heart rate).');
  }

  const plan = [
    { label: 'This Week', detail: `Measure efficiency during typical walking activities. Establish baseline and identify areas for improvement (step rate, heart rate management, or fitness level).` },
    { label: 'This Month', detail: 'Implement regular cardiovascular training to improve fitness. Monitor efficiency scores monthly to track improvements. Aim for gradual increases in efficiency (more steps with lower heart rate).' },
    { label: 'Ongoing', detail: 'Continue monitoring efficiency as fitness improves. Maintain regular activity, include varied intensities, and track progress. Higher efficiency scores indicate improved cardiovascular health and fitness.' },
  ];

  return { steps, averageHeartRate, duration, age, stepsPerMinute, heartRateReserve: hrrPercentage, efficiencyScore, status, interpretation, recommendations, plan };
};

export default function StepToHeartRateEfficiencyCalculator() {
  const [result, setResult] = useState<ResultPayload | null>(null);

  const form = useForm<FormValues>({
    resolver: zodResolver(formSchema),
    defaultValues: {
      steps: undefined,
      averageHeartRate: undefined,
      duration: undefined,
      age: undefined,
    },
  });

  return (
    <div className="space-y-8">
      <Script id="step-heart-rate-efficiency-schema" type="application/ld+json" strategy="afterInteractive" dangerouslySetInnerHTML={{ __html: JSON.stringify(schemaMarkup) }} />

      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <Activity className="h-5 w-5" />
            Step-to-Heart Rate Efficiency Calculator
          </CardTitle>
          <CardDescription>Calculate cardiovascular efficiency by comparing steps to heart rate response during walking activities.</CardDescription>
        </CardHeader>
      </Card>

      <Card>
        <CardHeader>
          <CardTitle>Input your step and heart rate data</CardTitle>
        </CardHeader>
        <CardContent>
          <Form {...form}>
            <form onSubmit={form.handleSubmit((values) => setResult(calculateResult(values)))} className="space-y-6">
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <FormField
                  control={form.control}
                  name="steps"
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel>Total steps</FormLabel>
                      <FormControl>
                        <Input type="number" step="10" placeholder="e.g., 5000" value={field.value ?? ''} onChange={(e) => field.onChange(e.target.value === '' ? undefined : Number(e.target.value))} />
                      </FormControl>
                      <FormMessage />
                    </FormItem>
                  )}
                />
                <FormField
                  control={form.control}
                  name="averageHeartRate"
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel>Average heart rate (bpm)</FormLabel>
                      <FormControl>
                        <Input type="number" step="1" placeholder="e.g., 120" value={field.value ?? ''} onChange={(e) => field.onChange(e.target.value === '' ? undefined : Number(e.target.value))} />
                      </FormControl>
                      <FormMessage />
                    </FormItem>
                  )}
                />
                <FormField
                  control={form.control}
                  name="duration"
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel>Duration (minutes)</FormLabel>
                      <FormControl>
                        <Input type="number" step="1" placeholder="e.g., 30" value={field.value ?? ''} onChange={(e) => field.onChange(e.target.value === '' ? undefined : Number(e.target.value))} />
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
              </div>
              <Button type="submit" className="w-full md:w-auto">
                Calculate efficiency
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
            <CardDescription>See efficiency score, steps per minute, heart rate reserve, and recommendations.</CardDescription>
          </CardHeader>
          <CardContent className="space-y-6">
            <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
              <div className="p-4 border rounded">
                <p className="text-sm text-muted-foreground">Efficiency score</p>
                <p className="text-2xl font-semibold text-primary">{result.efficiencyScore.toFixed(1)}</p>
                <p className="text-xs text-muted-foreground">Out of 100</p>
              </div>
              <div className="p-4 border rounded">
                <p className="text-sm text-muted-foreground">Steps per minute</p>
                <p className="text-2xl font-semibold text-primary">{result.stepsPerMinute.toFixed(1)}</p>
                <p className="text-xs text-muted-foreground">Steps/min</p>
              </div>
              <div className="p-4 border rounded">
                <p className="text-sm text-muted-foreground">Heart rate reserve</p>
                <p className="text-2xl font-semibold text-primary">{result.heartRateReserve.toFixed(0)}%</p>
                <p className="text-xs text-muted-foreground">HRR %</p>
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
                    <AlertTriangle className="h-4 w-4" />
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
            <strong>Steps per minute</strong> = Total Steps / Duration (minutes). This indicates walking pace and activity intensity.
          </p>
          <p>
            <strong>Heart rate reserve (HRR) percentage</strong> = ((Average Heart Rate - Resting HR) / (Max HR - Resting HR)) × 100. Max HR = 220 - Age. HRR indicates exercise intensity relative to capacity.
          </p>
          <p>
            <strong>Efficiency score</strong> = Steps Component + HRR Component. Steps component = (Steps/min / 120) × 50 (max 50 points). HRR component = (1 - HRR% / 100) × 50 (max 50 points). Higher steps with lower HRR = higher efficiency.
          </p>
          <p>Efficiency score indicates cardiovascular efficiency: higher scores mean more steps achieved with lower heart rate response, indicating better fitness and cardiovascular health.</p>
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
                <p className="text-sm text-muted-foreground">Max heart rate</p>
                <p className="text-xl font-semibold text-primary">
                  {220 - result.age} bpm
                </p>
                <p className="text-xs text-muted-foreground">Estimated (220 - age)</p>
              </div>
              <div className="p-4 border rounded">
                <p className="text-sm text-muted-foreground">Exercise intensity</p>
                <p className="text-xl font-semibold text-primary">
                  {result.heartRateReserve >= 80 ? 'Very High' : result.heartRateReserve >= 70 ? 'High' : result.heartRateReserve >= 50 ? 'Moderate' : 'Light'}
                </p>
                <p className="text-xs text-muted-foreground">Based on HRR</p>
              </div>
              <div className="p-4 border rounded">
                <p className="text-sm text-muted-foreground">Efficiency category</p>
                <p className="text-xl font-semibold text-primary">
                  {result.efficiencyScore >= 70 ? 'Excellent' : result.efficiencyScore >= 50 ? 'Good' : result.efficiencyScore >= 30 ? 'Moderate' : 'Low'}
                </p>
                <p className="text-xs text-muted-foreground">Based on score</p>
              </div>
            </div>
          ) : (
            <p className="text-sm text-muted-foreground">Enter your step and heart rate data to see additional insights.</p>
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
                <Link href={`/health-fitness/${calc.slug}`} className="text-primary hover:underline">
                  {calc.name}
                </Link>
              </h4>
              <p className="text-sm text-muted-foreground">{calc.description}</p>
            </div>
          ))}
        </CardContent>
      </Card>

      <section className="space-y-6 text-muted-foreground leading-relaxed bg-white p-6 md:p-10 rounded-lg shadow-lg" itemType="https://schema.org/MedicalWebPage">
    <meta itemProp="name" content="The Definitive Guide to Step-to-Heart Rate Efficiency: Measuring Cardiovascular Fitness" />
    <meta itemProp="description" content="An expert guide on measuring cardiovascular efficiency through step-to-heart rate relationships, understanding fitness levels, and improving cardiovascular health." />
    <meta itemProp="keywords" content="step heart rate efficiency, cardiovascular fitness, walking efficiency, heart rate reserve, fitness assessment" />
    <meta itemProp="author" content="[Your Site's Health Team]" />
    <meta itemProp="datePublished" content="2025-12-01" />
    <meta itemProp="url" content="/definitive-step-heart-rate-efficiency-guide" />

    <h1 className="text-3xl md:text-4xl font-extrabold text-foreground mb-4" itemProp="headline">The Definitive Guide to Step-to-Heart Rate Efficiency: Measuring Cardiovascular Fitness Through Walking</h1>
    <p className="text-lg italic text-gray-700">Explore how to measure cardiovascular efficiency by comparing steps to heart rate response, understand fitness levels, and improve cardiovascular health through regular activity.</p>

    <h2 className="text-2xl font-bold text-foreground mt-8 mb-4">Table of Contents: Jump to a Section</h2>
    <ul className="list-disc ml-6 space-y-2 text-blue-600">
        <li><a href="#what-is-efficiency" className="hover:underline">What Is Step-to-Heart Rate Efficiency</a></li>
        <li><a href="#measuring-efficiency" className="hover:underline">Measuring Efficiency</a></li>
        <li><a href="#understanding-scores" className="hover:underline">Understanding Efficiency Scores</a></li>
        <li><a href="#improving-efficiency" className="hover:underline">Improving Cardiovascular Efficiency</a></li>
        <li><a href="#fitness-indicators" className="hover:underline">Fitness Indicators</a></li>
    </ul>
<hr />

    <h2 id="what-is-efficiency" className="text-2xl font-bold text-foreground pt-8" itemProp="articleSection">What Is Step-to-Heart Rate Efficiency</h2>
    <p>**Step-to-heart rate efficiency** measures how effectively your cardiovascular system responds to walking activity. It compares the number of steps you take to your heart rate response, providing insights into cardiovascular fitness, exercise efficiency, and overall cardiovascular health.</p>

<h3 className="text-xl font-semibold text-foreground mt-6">Why Efficiency Matters</h3>
<p>Understanding your step-to-heart rate efficiency helps you:</p>
<ul>
    <li><b>Assess fitness level:</b> Higher efficiency indicates better cardiovascular fitness</li>
    <li><b>Monitor progress:</b> Track improvements in cardiovascular health over time</li>
    <li><b>Optimize training:</b> Identify appropriate exercise intensities</li>
    <li><b>Prevent overtraining:</b> Recognize when heart rate is too high for activity level</li>
    <li><b>Improve health:</b> Guide cardiovascular training for better health outcomes</li>
</ul>
<p>Fitter individuals can maintain higher step rates with lower heart rate responses, indicating more efficient cardiovascular function.</p>

<h3 className="text-xl font-semibold text-foreground mt-6">Components of Efficiency</h3>
<p>Efficiency is determined by two main components:</p>
<ul>
    <li><b>Steps per minute:</b> Walking pace and activity level</li>
    <li><b>Heart rate response:</b> Cardiovascular response to activity, measured as heart rate reserve percentage</li>
</ul>
<p>Higher steps with lower heart rate = higher efficiency = better cardiovascular fitness.</p>

<hr />

    <h2 id="measuring-efficiency" className="text-2xl font-bold text-foreground pt-8" itemProp="articleSection">Measuring Efficiency</h2>
    <p>Accurate efficiency measurement requires tracking steps and heart rate during walking activities:</p>

    <h3 className="text-xl font-semibold text-foreground mt-6">Measurement Protocol</h3>
    <ol>
        <li>Wear a step counter or use a pedometer/app to track steps</li>
        <li>Wear a heart rate monitor or use a fitness tracker</li>
        <li>Walk at your typical pace for a set duration (15-60 minutes)</li>
        <li>Record total steps, average heart rate, duration, and your age</li>
        <li>Calculate efficiency using this calculator</li>
    </ol>

    <h3 className="text-xl font-semibold text-foreground mt-6">Tips for Accuracy</h3>
    <ul>
        <li>Measure during consistent conditions (similar terrain, pace, temperature)</li>
        <li>Use reliable step and heart rate tracking devices</li>
        <li>Measure during typical walking activities, not maximum effort</li>
        <li>Measure multiple times to establish baseline and track changes</li>
        <li>Account for factors affecting heart rate (caffeine, stress, temperature)</li>
    </ul>

<hr />

    <h2 id="understanding-scores" className="text-2xl font-bold text-foreground pt-8" itemProp="articleSection">Understanding Efficiency Scores</h2>
    <p>Efficiency scores range from 0-100, with higher scores indicating better cardiovascular efficiency:</p>

    <h3 className="text-xl font-semibold text-foreground mt-6">Score Interpretation</h3>
    <ul>
        <li><b>70-100 (Excellent):</b> High steps with low heart rate response. Indicates excellent cardiovascular fitness and efficiency.</li>
        <li><b>50-70 (Good):</b> Moderate-high steps with moderate heart rate. Indicates good cardiovascular fitness.</li>
        <li><b>30-50 (Moderate):</b> Moderate steps with elevated heart rate. Indicates moderate fitness or higher exercise intensity.</li>
        <li><b>0-30 (Low):</b> Low steps with high heart rate, or high steps with very high heart rate. Indicates lower fitness or very high intensity.</li>
    </ul>

    <h3 className="text-xl font-semibold text-foreground mt-6">Factors Affecting Scores</h3>
    <p>Scores are influenced by:</p>
    <ul>
        <li>Fitness level (fitter = higher scores)</li>
        <li>Walking pace (faster = higher heart rate)</li>
        <li>Terrain (hills = higher heart rate)</li>
        <li>Body weight (heavier = higher heart rate)</li>
        <li>Age (affects max heart rate)</li>
        <li>Environmental conditions (heat = higher heart rate)</li>
    </ul>

<hr />

    <h2 id="improving-efficiency" className="text-2xl font-bold text-foreground pt-8" itemProp="articleSection">Improving Cardiovascular Efficiency</h2>
    <p>Improving efficiency requires consistent cardiovascular training:</p>

    <h3 className="text-xl font-semibold text-foreground mt-6">Training Strategies</h3>
    <ul>
        <li><b>Regular cardiovascular exercise:</b> 3-5 times per week, 30+ minutes</li>
        <li><b>Interval training:</b> Alternating high and low intensity improves efficiency</li>
        <li><b>Consistent walking:</b> Regular walking builds cardiovascular base</li>
        <li><b>Progressive overload:</b> Gradually increase duration or intensity</li>
        <li><b>Recovery:</b> Allow adequate recovery between sessions</li>
    </ul>

    <h3 className="text-xl font-semibold text-foreground mt-6">Monitoring Progress</h3>
    <p>Track efficiency monthly to monitor improvements:</p>
    <ul>
        <li>As fitness improves, efficiency scores should increase</li>
        <li>You should be able to maintain higher steps with lower heart rate</li>
        <li>Heart rate recovery should improve (faster return to baseline)</li>
        <li>Overall cardiovascular health indicators should improve</li>
    </ul>

<hr />

    <h2 id="fitness-indicators" className="text-2xl font-bold text-foreground pt-8" itemProp="articleSection">Fitness Indicators</h2>
    <p>Efficiency scores provide insights into cardiovascular fitness:</p>

    <h3 className="text-xl font-semibold text-foreground mt-6">What High Efficiency Indicates</h3>
    <ul>
        <li>Good cardiovascular fitness</li>
        <li>Efficient heart function</li>
        <li>Effective oxygen delivery</li>
        <li>Lower cardiovascular disease risk</li>
        <li>Better exercise capacity</li>
    </ul>

    <h3 className="text-xl font-semibold text-foreground mt-6">What Low Efficiency May Indicate</h3>
    <ul>
        <li>Lower fitness level (most common)</li>
        <li>Need for cardiovascular training</li>
        <li>Higher exercise intensity relative to steps</li>
        <li>Potential for improvement with training</li>
    </ul>
    <p>Low efficiency doesn't necessarily indicate poor health—it indicates room for improvement through regular cardiovascular training.</p>

<hr />

    <h2 className="text-2xl font-bold text-foreground pt-8" itemProp="articleSection">Conclusion</h2>
    <p>Step-to-heart rate efficiency is a valuable metric for assessing cardiovascular fitness and monitoring progress. By measuring efficiency regularly and implementing consistent cardiovascular training, you can improve your fitness, lower your heart rate response to activity, and enhance overall cardiovascular health. Use this calculator to establish your baseline, track improvements, and guide your training for optimal cardiovascular efficiency.</p>
</section>
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
          <p>This tool calculates cardiovascular efficiency by comparing steps to heart rate response during walking activities.</p>
          <p>Outputs include efficiency score, steps per minute, heart rate reserve, status, recommendations, an action plan, and supporting metrics.</p>
          <p>Formula, steps, guide content, related tools, and FAQs ensure humans or AI assistants can interpret the methodology instantly.</p>
        </CardContent>
      </Card>
    </div>
  );
}


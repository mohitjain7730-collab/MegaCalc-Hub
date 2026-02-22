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
  restingRate: z.number({ invalid_type_error: 'Enter resting breathing rate' }).min(8).max(30),
  activityRate: z.number({ invalid_type_error: 'Enter activity breathing rate' }).min(12).max(60),
  recoveryTime: z.number({ invalid_type_error: 'Enter recovery time' }).min(30).max(600),
  breathDepth: z.number({ invalid_type_error: 'Select breath depth' }).min(1).max(5),
  nasalBreathing: z.number({ invalid_type_error: 'Select nasal breathing percentage' }).min(0).max(100),
});

type FormValues = z.infer<typeof formSchema>;

type ResultPayload = {
  restingRate: number;
  activityRate: number;
  recoveryTime: number;
  breathDepth: number;
  nasalBreathing: number;
  efficiencyScore: number;
  efficiencyPercent: number;
  status: 'optimal' | 'good' | 'moderate' | 'low';
  interpretation: string;
  recommendations: string[];
  plan: { label: string; detail: string }[];
};

const steps = [
  'Enter your resting breathing rate (breaths per minute, normal: 12-20).',
  'Enter your breathing rate during moderate activity (breaths per minute).',
  'Enter recovery time to return to resting rate after activity (seconds).',
  'Rate your breath depth (1=shallow, 5=deep diaphragmatic).',
  'Enter percentage of time breathing through nose (0-100%).',
  'Review efficiency score, status, and recommendations.',
];

const faqs = [
  {
    question: 'What is breathing rate efficiency?',
    answer:
      'Breathing rate efficiency measures how effectively your respiratory system functions, considering resting rate, recovery from activity, breath depth, and breathing patterns. Efficient breathing supports optimal oxygen delivery, stress management, and overall health.',
  },
  {
    question: 'What is a normal resting breathing rate?',
    answer:
      'Normal resting breathing rate for adults is 12-20 breaths per minute. Rates below 12 (bradypnea) or above 20 (tachypnea) may indicate health issues. Athletes often have lower resting rates (10-14) due to better cardiovascular efficiency.',
  },
  {
    question: 'How does breathing rate change with activity?',
    answer:
      'Breathing rate increases with activity to meet oxygen demands: light activity 12-16/min, moderate 16-24/min, vigorous 24-40/min. Efficient breathing systems show appropriate increases without excessive rates, and quick recovery to resting rate after activity.',
  },
  {
    question: 'What is recovery time?',
    answer:
      'Recovery time is how long it takes breathing rate to return to resting level after activity. Efficient systems recover in 1-3 minutes. Longer recovery (5+ minutes) may indicate poor cardiovascular fitness, respiratory issues, or inefficient breathing patterns.',
  },
  {
    question: 'Why is breath depth important?',
    answer:
      'Deep diaphragmatic breathing (belly breathing) is more efficient than shallow chest breathing: uses full lung capacity, improves oxygen exchange, activates relaxation response, supports better posture, and reduces stress. Shallow breathing reduces efficiency and can increase anxiety.',
  },
  {
    question: 'Why is nasal breathing important?',
    answer:
      'Nasal breathing is more efficient than mouth breathing: filters and warms air, increases nitric oxide production (improves oxygen uptake), supports better breathing mechanics, reduces risk of hyperventilation, and promotes relaxation. Mouth breathing is less efficient and can increase stress.',
  },
  {
    question: 'What are signs of inefficient breathing?',
    answer:
      'Signs include: high resting rate (20+), slow recovery after activity (5+ minutes), shallow chest breathing, frequent mouth breathing, breathlessness with minimal activity, chest tightness, and difficulty taking deep breaths. These indicate inefficient breathing patterns.',
  },
  {
    question: 'How can I improve breathing efficiency?',
    answer:
      'Improve through: practicing deep diaphragmatic breathing, nasal breathing exercises, cardiovascular exercise to improve fitness, breathing exercises (box breathing, 4-7-8), yoga or meditation, addressing respiratory issues, and maintaining good posture.',
  },
  {
    question: 'What about breathing exercises?',
    answer:
      'Breathing exercises improve efficiency: box breathing (4-4-4-4), 4-7-8 breathing (inhale 4, hold 7, exhale 8), diaphragmatic breathing practice, nasal breathing training, and paced breathing. Regular practice improves breathing mechanics and efficiency over time.',
  },
  {
    question: 'When should I consult a healthcare provider?',
    answer:
      'Consult if you experience persistent breathing difficulties, very high resting rate (25+), very slow rate (8-), breathlessness with minimal activity, chest pain, wheezing, chronic cough, or respiratory symptoms that don\'t improve with breathing exercises. These may indicate underlying health issues.',
  },
];

const relatedCalculators = [
  {
    name: 'Step-to-Heart Rate Efficiency Calculator',
    slug: 'step-to-heart-rate-efficiency-calculator',
    description: 'Calculate cardiovascular efficiency.',
  },
  {
    name: 'Resting Recovery Day Estimator',
    slug: 'resting-recovery-day-estimator',
    description: 'Assess recovery needs and rest requirements.',
  },
  {
    name: 'Work Stress Fatigue Index',
    slug: 'work-stress-fatigue-index',
    description: 'Assess work stress impact on recovery.',
  },
  {
    name: 'Daily Mental Energy Budget Calculator',
    slug: 'daily-mental-energy-budget-calculator',
    description: 'Calculate daily mental energy budget.',
  },
];

const baseUrl = 'https://mycalculating.com/health-fitness/breathing-rate-efficiency-calculator';

const schemaMarkup = {
  '@context': 'https://schema.org',
  '@graph': [
    {
      '@type': 'BreadcrumbList',
      itemListElement: [
        { '@type': 'ListItem', position: 1, name: 'Home', item: 'https://mycalculating.com' },
        { '@type': 'ListItem', position: 2, name: 'Health & Fitness', item: 'https://mycalculating.com/health-fitness' },
        { '@type': 'ListItem', position: 3, name: 'Breathing Rate Efficiency Calculator', item: baseUrl },
      ],
    },
    {
      '@type': 'SoftwareApplication',
      name: 'Breathing Rate Efficiency Calculator',
      applicationCategory: 'Calculator',
      operatingSystem: 'Web Browser',
      description: 'Calculate breathing rate efficiency from resting rate, activity rate, recovery time, breath depth, and nasal breathing percentage.',
      url: baseUrl,
      offers: { '@type': 'Offer', price: '0', priceCurrency: 'USD' },
    },
  ],
};

const clamp = (value: number, min: number, max: number) => Math.min(max, Math.max(min, value));

const calculateResult = (values: FormValues): ResultPayload => {
  const restingRate = values.restingRate;
  const activityRate = values.activityRate;
  const recoveryTime = values.recoveryTime;
  const breathDepth = values.breathDepth;
  const nasalBreathing = values.nasalBreathing;
  
  // Calculate efficiency score: optimal resting rate, appropriate activity increase, fast recovery, deep breathing, nasal breathing
  const restingFactor = restingRate >= 12 && restingRate <= 20 ? 30 : restingRate < 12 ? (restingRate / 12) * 30 : (30 - (restingRate - 20) / 10 * 30); // 0-30 points
  const activityFactor = activityRate <= 30 ? 25 : (30 - (activityRate - 30) / 30 * 15); // 0-25 points (penalty for excessive rates)
  const recoveryFactor = recoveryTime <= 180 ? (180 - recoveryTime) / 180 * 25 : (600 - recoveryTime) / 420 * 10; // 0-25 points (faster recovery = better)
  const depthFactor = (breathDepth / 5) * 10; // 0-10 points
  const nasalFactor = (nasalBreathing / 100) * 10; // 0-10 points
  
  // Calculate efficiency score (0-100 scale, higher = better)
  const efficiencyScore = clamp(restingFactor + activityFactor + recoveryFactor + depthFactor + nasalFactor, 0, 100);
  const efficiencyPercent = efficiencyScore;
  
  let status: ResultPayload['status'] = 'optimal';
  let interpretation = 'Your breathing rate efficiency appears excellent. Optimal resting rate, efficient activity response, fast recovery, deep breathing, and nasal breathing support excellent respiratory function.';

  if (efficiencyScore < 40 || restingRate >= 25 || recoveryTime >= 480 || breathDepth <= 2 || nasalBreathing <= 30) {
    status = 'low';
    interpretation = 'Your breathing rate efficiency is low. High resting rate, slow recovery, shallow breathing, or excessive mouth breathing may indicate inefficient patterns or underlying issues. Focus on breathing exercises, cardiovascular fitness, and consider professional assessment.';
  } else if (efficiencyScore < 60 || restingRate >= 22 || recoveryTime >= 300 || breathDepth <= 3 || nasalBreathing <= 50) {
    status = 'moderate';
    interpretation = 'Your breathing rate efficiency is moderate. Some factors (resting rate, recovery time, breath depth, or breathing pattern) may be suboptimal. Practice breathing exercises, improve cardiovascular fitness, and work on nasal breathing and depth.';
  } else if (efficiencyScore < 75) {
    status = 'good';
    interpretation = 'Your breathing rate efficiency is good but could be optimized. Most factors support efficient breathing, but improving breath depth, nasal breathing percentage, or recovery time may enhance efficiency.';
  } else {
    status = 'optimal';
    interpretation = 'Your breathing rate efficiency is excellent. Optimal resting rate, efficient activity response, fast recovery, deep breathing, and nasal breathing support excellent respiratory function and health.';
  }

  const recommendations = [
    'Practice deep diaphragmatic breathing: place hand on belly, inhale deeply through nose expanding belly, exhale slowly. Practice 5-10 minutes daily. Deep breathing improves oxygen exchange, activates relaxation response, and enhances efficiency.',
    'Increase nasal breathing: nasal breathing filters and warms air, increases nitric oxide production, and supports better breathing mechanics. Aim for 80%+ nasal breathing. Practice nasal breathing exercises and be mindful of mouth breathing habits.',
  ];
  
  if (recoveryTime >= 300) {
    recommendations.push('Improve cardiovascular fitness: slow recovery after activity indicates poor cardiovascular fitness. Regular aerobic exercise (walking, running, cycling) improves heart and lung function, enhances oxygen delivery, and speeds recovery. Aim for 150+ minutes moderate activity weekly.');
  }
  
  if (breathDepth <= 3) {
    recommendations.push('Work on breath depth: shallow breathing reduces efficiency and can increase stress. Practice diaphragmatic breathing exercises, yoga, or meditation. Focus on full inhalations and slow, complete exhalations. Daily practice improves depth over time.');
  }
  
  if (restingRate >= 22) {
    recommendations.push('Address high resting rate: resting rate above 20 may indicate stress, anxiety, poor fitness, or respiratory issues. Practice breathing exercises, stress management, and consider professional assessment if persistent. Lower resting rate improves efficiency.');
  }

  const plan = [
    { label: 'This Week', detail: `Begin practicing deep diaphragmatic breathing 5-10 minutes daily. Increase awareness of breathing patterns (nasal vs mouth). Start tracking resting breathing rate. Begin cardiovascular exercise if sedentary.` },
    { label: 'This Month', detail: 'Establish consistent breathing exercise routine. Work toward 80%+ nasal breathing. Continue cardiovascular fitness improvements. Practice recovery breathing after activities. Monitor recovery time improvements.' },
    { label: 'Ongoing', detail: 'Maintain breathing exercises and nasal breathing habits. Continue cardiovascular fitness routine. Monitor breathing efficiency metrics. Consider professional guidance (respiratory therapist, yoga instructor) for advanced techniques. Consult healthcare provider if experiencing persistent breathing difficulties.' },
  ];

  return { restingRate, activityRate, recoveryTime, breathDepth, nasalBreathing, efficiencyScore, efficiencyPercent, status, interpretation, recommendations, plan };
};

export default function BreathingRateEfficiencyCalculator() {
  const [result, setResult] = useState<ResultPayload | null>(null);

  const form = useForm<FormValues>({
    resolver: zodResolver(formSchema),
    defaultValues: {
      restingRate: undefined,
      activityRate: undefined,
      recoveryTime: undefined,
      breathDepth: undefined,
      nasalBreathing: undefined,
    },
  });

  return (
    <div className="space-y-8">
      <Script id="breathing-rate-efficiency-schema" type="application/ld+json" strategy="afterInteractive" dangerouslySetInnerHTML={{ __html: JSON.stringify(schemaMarkup) }} />

      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <Activity className="h-5 w-5" />
            Breathing Rate Efficiency Calculator
          </CardTitle>
          <CardDescription>Calculate breathing rate efficiency from resting rate, activity rate, recovery time, breath depth, and nasal breathing percentage.</CardDescription>
        </CardHeader>
      </Card>

      <Card>
        <CardHeader>
          <CardTitle>Input your breathing data</CardTitle>
        </CardHeader>
        <CardContent>
          <Form {...form}>
            <form onSubmit={form.handleSubmit((values) => setResult(calculateResult(values)))} className="space-y-6">
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <FormField
                  control={form.control}
                  name="restingRate"
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel>Resting breathing rate (breaths/min, normal: 12-20)</FormLabel>
                      <FormControl>
                        <Input type="number" step="1" placeholder="e.g., 16" value={field.value ?? ''} onChange={(e) => field.onChange(e.target.value === '' ? undefined : Number(e.target.value))} />
                      </FormControl>
                      <FormMessage />
                    </FormItem>
                  )}
                />
                <FormField
                  control={form.control}
                  name="activityRate"
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel>Activity breathing rate (breaths/min)</FormLabel>
                      <FormControl>
                        <Input type="number" step="1" placeholder="e.g., 24" value={field.value ?? ''} onChange={(e) => field.onChange(e.target.value === '' ? undefined : Number(e.target.value))} />
                      </FormControl>
                      <FormMessage />
                    </FormItem>
                  )}
                />
                <FormField
                  control={form.control}
                  name="recoveryTime"
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel>Recovery time to resting rate (seconds)</FormLabel>
                      <FormControl>
                        <Input type="number" step="10" placeholder="e.g., 120" value={field.value ?? ''} onChange={(e) => field.onChange(e.target.value === '' ? undefined : Number(e.target.value))} />
                      </FormControl>
                      <FormMessage />
                    </FormItem>
                  )}
                />
                <FormField
                  control={form.control}
                  name="breathDepth"
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel>Breath depth (1-5: 1=shallow, 5=deep diaphragmatic)</FormLabel>
                      <FormControl>
                        <Input type="number" step="1" min="1" max="5" placeholder="e.g., 3" value={field.value ?? ''} onChange={(e) => field.onChange(e.target.value === '' ? undefined : Number(e.target.value))} />
                      </FormControl>
                      <FormMessage />
                    </FormItem>
                  )}
                />
                <FormField
                  control={form.control}
                  name="nasalBreathing"
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel>Nasal breathing percentage (0-100%)</FormLabel>
                      <FormControl>
                        <Input type="number" step="5" placeholder="e.g., 70" value={field.value ?? ''} onChange={(e) => field.onChange(e.target.value === '' ? undefined : Number(e.target.value))} />
                      </FormControl>
                      <FormMessage />
                    </FormItem>
                  )}
                />
              </div>
              <Button type="submit" className="w-full md:w-auto">
                Calculate efficiency score
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
            <CardDescription>See efficiency score, status, and recommendations.</CardDescription>
          </CardHeader>
          <CardContent className="space-y-6">
            <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
              <div className="p-4 border rounded">
                <p className="text-sm text-muted-foreground">Efficiency score</p>
                <p className="text-2xl font-semibold text-primary">{result.efficiencyScore.toFixed(1)}</p>
                <p className="text-xs text-muted-foreground">Out of 100</p>
              </div>
              <div className="p-4 border rounded">
                <p className="text-sm text-muted-foreground">Resting rate</p>
                <p className="text-2xl font-semibold text-primary">{result.restingRate.toFixed(0)}</p>
                <p className="text-xs text-muted-foreground">Breaths/min</p>
              </div>
              <div className="p-4 border rounded">
                <p className="text-sm text-muted-foreground">Recovery time</p>
                <p className="text-2xl font-semibold text-primary">{result.recoveryTime.toFixed(0)}s</p>
                <p className="text-xs text-muted-foreground">To resting rate</p>
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
            <strong>Resting factor</strong> = 30 if Resting Rate is 12-20 (optimal), else calculated based on deviation. Normal resting rate is 12-20 breaths/min. Rates outside this range reduce efficiency.
          </p>
          <p>
            <strong>Activity factor</strong> = 25 if Activity Rate â‰¤ 30, else penalty for excessive rates. Efficient breathing shows appropriate increases with activity without excessive rates. Rates above 30 may indicate inefficiency.
          </p>
          <p>
            <strong>Recovery factor</strong> = ((180 - Recovery Time) / 180) Ã— 25, if Recovery Time â‰¤ 180, else calculated. Faster recovery (1-3 minutes) indicates better cardiovascular fitness and breathing efficiency. Slower recovery reduces efficiency.
          </p>
          <p>
            <strong>Depth factor</strong> = (Breath Depth / 5) Ã— 10. Contributes 0-10 points. Deep diaphragmatic breathing (5) is more efficient than shallow chest breathing (1-2). Deeper breaths improve oxygen exchange and efficiency.
          </p>
          <p>
            <strong>Nasal factor</strong> = (Nasal Breathing / 100) Ã— 10. Contributes 0-10 points. Nasal breathing is more efficient than mouth breathing: filters air, increases nitric oxide, supports better mechanics. Higher nasal percentage improves efficiency.
          </p>
          <p>
            <strong>Efficiency score</strong> = Resting Factor + Activity Factor + Recovery Factor + Depth Factor + Nasal Factor, normalized to 0-100 scale. Higher scores indicate better breathing efficiency based on optimal rates, fast recovery, deep breathing, and nasal breathing patterns.
          </p>
          <p>Efficient breathing supports optimal oxygen delivery, stress management, and overall health. Deep diaphragmatic breathing, nasal breathing, optimal rates, and fast recovery indicate efficient respiratory function.</p>
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
                <p className="text-sm text-muted-foreground">Activity rate</p>
                <p className="text-xl font-semibold text-primary">
                  {result.activityRate.toFixed(0)}
                </p>
                <p className="text-xs text-muted-foreground">Breaths/min</p>
              </div>
              <div className="p-4 border rounded">
                <p className="text-sm text-muted-foreground">Breath depth</p>
                <p className="text-xl font-semibold text-primary">
                  {result.breathDepth}/5
                </p>
                <p className="text-xs text-muted-foreground">Rating</p>
              </div>
              <div className="p-4 border rounded">
                <p className="text-sm text-muted-foreground">Nasal breathing</p>
                <p className="text-xl font-semibold text-primary">
                  {result.nasalBreathing.toFixed(0)}%
                </p>
                <p className="text-xs text-muted-foreground">Percentage</p>
              </div>
            </div>
          ) : (
            <p className="text-sm text-muted-foreground">Enter your breathing data to see additional insights.</p>
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
                <Link href={`/${calc.slug}`} className="text-primary hover:underline">
                  {calc.name}
                </Link>
              </h4>
              <p className="text-sm text-muted-foreground">{calc.description}</p>
            </div>
          ))}
        </CardContent>
      </Card>

      <section className="space-y-6 text-muted-foreground leading-relaxed bg-white p-6 md:p-10 rounded-lg shadow-lg" itemType="https://schema.org/MedicalWebPage">
    <meta itemProp="name" content="The Definitive Guide to Breathing Rate Efficiency: Understanding and Improving Respiratory Function" />
    <meta itemProp="description" content="An expert guide on breathing rate efficiency, factors affecting respiratory function, and strategies to improve breathing patterns for better health and performance." />
    <meta itemProp="keywords" content="breathing rate efficiency, respiratory efficiency, breathing exercises, diaphragmatic breathing, nasal breathing, breathing rate calculator" />
    <meta itemProp="author" content="[Your Site's Health Team]" />
    <meta itemProp="datePublished" content="2025-12-01" />
    <meta itemProp="url" content="/definitive-breathing-efficiency-guide" />

    <h1 className="text-3xl md:text-4xl font-extrabold text-foreground mb-4" itemProp="headline">The Definitive Guide to Breathing Rate Efficiency: Understanding and Improving Respiratory Function</h1>
    <p className="text-lg italic text-gray-700">Explore breathing rate efficiency, factors affecting respiratory function, and evidence-based strategies to improve breathing patterns for better health, stress management, and performance.</p>

    <h2 className="text-2xl font-bold text-foreground mt-8 mb-4">Table of Contents: Jump to a Section</h2>
    <ul className="list-disc ml-6 space-y-2 text-blue-600">
        <li><a href="#what-is-efficiency" className="hover:underline">What Is Breathing Efficiency</a></li>
        <li><a href="#factors" className="hover:underline">Factors Affecting Efficiency</a></li>
        <li><a href="#breath-depth" className="hover:underline">Breath Depth and Patterns</a></li>
        <li><a href="#nasal-breathing" className="hover:underline">Nasal vs Mouth Breathing</a></li>
        <li><a href="#improvement" className="hover:underline">Improving Efficiency</a></li>
    </ul>
<hr />

    <h2 id="what-is-efficiency" className="text-2xl font-bold text-foreground pt-8" itemProp="articleSection">What Is Breathing Efficiency</h2>
    <p>**Breathing efficiency** measures how effectively your respiratory system functions, considering breathing rate, recovery time, breath depth, and breathing patterns. Efficient breathing supports optimal oxygen delivery, stress management, and overall health.</p>

<h3 className="text-xl font-semibold text-foreground mt-6">Key Components</h3>
<p>Breathing efficiency includes:</p>
<ul>
    <li><b>Resting rate:</b> Normal is 12-20 breaths per minute</li>
    <li><b>Activity response:</b> Appropriate increases with activity</li>
    <li><b>Recovery time:</b> Quick return to resting rate</li>
    <li><b>Breath depth:</b> Deep diaphragmatic breathing</li>
    <li><b>Breathing pattern:</b> Nasal vs mouth breathing</li>
</ul>

<hr />

    <h2 id="factors" className="text-2xl font-bold text-foreground pt-8" itemProp="articleSection">Factors Affecting Efficiency</h2>
    <p>Multiple factors influence breathing efficiency:</p>

    <h3 className="text-xl font-semibold text-foreground mt-6">Resting Rate</h3>
    <ul>
        <li>Normal: 12-20 breaths per minute</li>
        <li>Below 12: bradypnea (may indicate issues)</li>
        <li>Above 20: tachypnea (may indicate stress or issues)</li>
        <li>Athletes often have lower rates (10-14)</li>
    </ul>

    <h3 className="text-xl font-semibold text-foreground mt-6">Recovery Time</h3>
    <ul>
        <li>Efficient: 1-3 minutes to resting rate</li>
        <li>Poor fitness: 5+ minutes</li>
        <li>Indicates cardiovascular health</li>
        <li>Quick recovery = better efficiency</li>
    </ul>

    <h3 className="text-xl font-semibold text-foreground mt-6">Breath Depth</h3>
    <ul>
        <li>Deep diaphragmatic breathing is more efficient</li>
        <li>Uses full lung capacity</li>
        <li>Improves oxygen exchange</li>
        <li>Activates relaxation response</li>
    </ul>

<hr />

    <h2 id="breath-depth" className="text-2xl font-bold text-foreground pt-8" itemProp="articleSection">Breath Depth and Patterns</h2>
    <p>Breath depth significantly affects efficiency:</p>

    <h3 className="text-xl font-semibold text-foreground mt-6">Deep Diaphragmatic Breathing</h3>
    <ul>
        <li>Belly expands on inhalation</li>
        <li>Uses full lung capacity</li>
        <li>Improves oxygen exchange</li>
        <li>Activates parasympathetic nervous system</li>
        <li>Reduces stress and anxiety</li>
    </ul>

    <h3 className="text-xl font-semibold text-foreground mt-6">Shallow Chest Breathing</h3>
    <ul>
        <li>Only upper chest moves</li>
        <li>Reduces lung capacity</li>
        <li>Less efficient oxygen exchange</li>
        <li>Can increase anxiety</li>
        <li>Common with stress</li>
    </ul>

<hr />

    <h2 id="nasal-breathing" className="text-2xl font-bold text-foreground pt-8" itemProp="articleSection">Nasal vs Mouth Breathing</h2>
    <p>Breathing pattern affects efficiency:</p>

    <h3 className="text-xl font-semibold text-foreground mt-6">Nasal Breathing Benefits</h3>
    <ul>
        <li>Filters and warms air</li>
        <li>Increases nitric oxide production</li>
        <li>Improves oxygen uptake</li>
        <li>Supports better breathing mechanics</li>
        <li>Promotes relaxation</li>
    </ul>

    <h3 className="text-xl font-semibold text-foreground mt-6">Mouth Breathing Drawbacks</h3>
    <ul>
        <li>No air filtration</li>
        <li>Reduces nitric oxide</li>
        <li>Can cause hyperventilation</li>
        <li>Less efficient mechanics</li>
        <li>May increase stress</li>
    </ul>

<hr />

    <h2 id="improvement" className="text-2xl font-bold text-foreground pt-8" itemProp="articleSection">Improving Efficiency</h2>
    <p>Strategies to improve breathing efficiency:</p>

    <h3 className="text-xl font-semibold text-foreground mt-6">Breathing Exercises</h3>
    <ul>
        <li>Diaphragmatic breathing practice</li>
        <li>Box breathing (4-4-4-4)</li>
        <li>4-7-8 breathing technique</li>
        <li>Nasal breathing training</li>
        <li>Daily practice improves efficiency</li>
    </ul>

    <h3 className="text-xl font-semibold text-foreground mt-6">Cardiovascular Fitness</h3>
    <ul>
        <li>Regular aerobic exercise</li>
        <li>Improves heart and lung function</li>
        <li>Enhances oxygen delivery</li>
        <li>Speeds recovery time</li>
        <li>150+ minutes moderate activity weekly</li>
    </ul>

    <h3 className="text-xl font-semibold text-foreground mt-6">Stress Management</h3>
    <ul>
        <li>Reduces shallow breathing</li>
        <li>Supports deep breathing patterns</li>
        <li>Meditation and mindfulness</li>
        <li>Yoga practice</li>
        <li>Relaxation techniques</li>
    </ul>

<hr />

    <h2 className="text-2xl font-bold text-foreground pt-8" itemProp="articleSection">Conclusion</h2>
    <p>Breathing efficiency affects oxygen delivery, stress management, and overall health. By practicing deep diaphragmatic breathing, increasing nasal breathing, improving cardiovascular fitness, and managing stress, you can enhance breathing efficiency. Use this calculator to assess your breathing efficiency and identify areas for improvement. Remember: efficient breathing supports better health, reduced stress, and improved performance.</p>
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
          <p>This tool calculates breathing rate efficiency from resting rate, activity rate, recovery time, breath depth, and nasal breathing percentage.</p>
          <p>Outputs include efficiency score, status, recommendations, an action plan, and supporting metrics.</p>
          <p>Formula, steps, guide content, related tools, and FAQs ensure humans or AI assistants can interpret the methodology instantly.</p>
        </CardContent>
      </Card>
    </div>
  );
}



'use client';

import { useState } from 'react';
import Script from 'next/script';
import Link from 'next/link';
import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import { z } from 'zod';
import { Activity, Zap, Target, Shield, TrendingUp } from 'lucide-react';

import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Form, FormControl, FormField, FormItem, FormLabel, FormMessage } from '@/components/ui/form';
import { Input } from '@/components/ui/input';

const formSchema = z.object({
  peakVO2: z.number({ invalid_type_error: 'Enter peak VO2' }).min(20).max(80),
  recoveryVO2: z.number({ invalid_type_error: 'Enter recovery VO2' }).min(20).max(80),
  recoveryTime: z.number({ invalid_type_error: 'Enter recovery time' }).min(0.5).max(30),
  fitnessLevel: z.enum(['beginner', 'intermediate', 'advanced', 'elite']).optional(),
  age: z.number({ invalid_type_error: 'Enter age' }).min(10).max(100).optional(),
});

type FormValues = z.infer<typeof formSchema>;

type ResultPayload = {
  halfTime: number;
  recoveryRate: number;
  recoveryLevel: string;
  status: 'excellent' | 'good' | 'moderate' | 'poor';
  interpretation: string;
  recommendations: string[];
  plan: { label: string; detail: string }[];
};

const steps = [
  'Enter peak VO2 during exercise (ml/kg/min).',
  'Enter recovery VO2 after specified time (ml/kg/min).',
  'Enter recovery time (minutes since stopping exercise).',
  'Optionally select fitness level and enter age.',
  'Review VO2 recovery half-time, recovery rate, and recommendations.',
];

const faqs = [
  {
    question: 'What is VO2 recovery half-time?',
    answer:
      'VO2 recovery half-time is the time it takes for your oxygen consumption to decrease by half from peak exercise levels. Faster recovery (shorter half-time) indicates better cardiovascular fitness and recovery capacity.',
  },
  {
    question: 'Why is VO2 recovery important?',
    answer:
      'Faster VO2 recovery indicates better cardiovascular fitness, improved oxygen delivery and utilization, efficient recovery systems, and better readiness for subsequent exercise bouts. It\'s a key indicator of aerobic fitness.',
  },
  {
    question: 'What is a good VO2 recovery half-time?',
    answer:
      'Recovery half-time varies by fitness: Elite athletes (30-60 seconds), Advanced (60-90 seconds), Intermediate (90-120 seconds), Beginner (120-180+ seconds). Faster is better, indicating superior recovery capacity.',
  },
  {
    question: 'How do I measure VO2 recovery?',
    answer:
      'Measure using: VO2 max testing equipment, fitness trackers with VO2 estimates, heart rate recovery (correlates with VO2 recovery), or estimated from exercise intensity and recovery heart rate changes. Professional testing is most accurate.',
  },
  {
    question: 'What affects VO2 recovery speed?',
    answer:
      'Factors include: fitness level (higher = faster), age (younger = faster), exercise intensity and duration, recovery posture (active vs passive), oxygen debt accumulated, and training adaptations.',
  },
  {
    question: 'How can I improve VO2 recovery?',
    answer:
      'Improve through: consistent aerobic training (running, cycling, swimming), interval training (improves recovery between intervals), proper cool-down, active recovery, improving overall VO2 max, and maintaining fitness consistency.',
  },
  {
    question: 'Does age affect VO2 recovery?',
    answer:
      'Yes. VO2 recovery typically slows with age due to decreased cardiovascular efficiency, slower heart rate recovery, and reduced oxygen delivery. However, training can maintain or improve recovery capacity at any age.',
  },
  {
    question: 'What is the relationship between VO2 max and recovery?',
    answer:
      'Higher VO2 max typically correlates with faster recovery. Athletes with higher VO2 max have more efficient oxygen utilization, better oxygen delivery systems, and faster metabolic recovery processes.',
  },
  {
    question: 'Can recovery half-time predict performance?',
    answer:
      'Yes. Faster VO2 recovery indicates better performance in repeated efforts, interval training, and sports requiring multiple high-intensity bouts. It\'s particularly important for interval-based sports and training.',
  },
  {
    question: 'How does training improve recovery?',
    answer:
      'Training adaptations improve: oxygen delivery (cardiac output, blood volume), oxygen extraction (capillary density), metabolic efficiency, buffer capacity, and recovery enzyme systems. Consistent training significantly improves recovery speed.',
  },
];

const relatedCalculators = [
  {
    name: 'HRV Recovery Optimization Wellness Score',
    slug: 'hrv-recovery-optimization-score-calculator',
    description: 'Get wellness insights about recovery readiness including VO2 recovery factors.',
  },
  {
    name: 'Training Fatigue Wellness Index',
    slug: 'training-fatigue-index-calculator',
    description: 'Get wellness insights about training load that affects VO2 recovery.',
  },
  {
    name: 'Central Nervous System (CNS) Fatigue Recovery Wellness Guide',
    slug: 'central-nervous-system-cns-fatigue-recovery-calculator',
    description: 'Get wellness insights about recovery time including VO2 recovery needs.',
  },
  {
    name: 'Training Stress Score Calculator',
    slug: 'running-pace-calculator',
    description: 'Calculate training stress that affects recovery capacity.',
  },
];

const baseUrl = 'https://mycalculating.com/category/health-fitness/vo2-recovery-half-time-calculator';

const schemaMarkup = {
  '@context': 'https://schema.org',
  '@graph': [
    {
      '@type': 'BreadcrumbList',
      itemListElement: [
        { '@type': 'ListItem', position: 1, name: 'Home', item: 'https://mycalculating.com' },
        { '@type': 'ListItem', position: 2, name: 'Health & Fitness', item: 'https://mycalculating.com/category/health-fitness' },
        { '@type': 'ListItem', position: 3, name: 'VO2 Recovery Half-Time Wellness Estimator', item: baseUrl },
      ],
    },
    {
      '@type': 'SoftwareApplication',
      name: 'VO2 Recovery Half-Time Wellness Estimator',
      applicationCategory: 'Calculator',
      operatingSystem: 'Web Browser',
      description: 'Get general wellness insights about VO2 recovery half-time based on peak VO2, recovery VO2, recovery time, fitness level, and age. This is a personal lifestyle insight, not a medical evaluation.',
      url: baseUrl,
      offers: { '@type': 'Offer', price: '0', priceCurrency: 'USD' },
    },
  ],
};

const clamp = (value: number, min: number, max: number) => Math.min(max, Math.max(min, value));

const calculateResult = (values: FormValues): ResultPayload => {
  // Calculate VO2 drop
  const vo2Drop = values.peakVO2 - values.recoveryVO2;
  const dropPercentage = (vo2Drop / values.peakVO2) * 100;
  
  // Calculate recovery half-time (time to drop to halfway between peak and baseline)
  // Assuming baseline VO2 is approximately 3.5 ml/kg/min at rest
  const baselineVO2 = 3.5;
  const halfwayVO2 = (values.peakVO2 + baselineVO2) / 2;
  const vo2DropToHalfway = values.peakVO2 - halfwayVO2;
  
  // If we've already recovered past halfway, extrapolate
  let halfTime: number;
  if (values.recoveryVO2 <= halfwayVO2) {
    // Already past halfway, estimate based on current rate
    const currentDrop = values.peakVO2 - values.recoveryVO2;
    const dropRate = currentDrop / values.recoveryTime;
    halfTime = vo2DropToHalfway / dropRate;
  } else {
    // Not yet at halfway, extrapolate forward
    const currentDrop = values.peakVO2 - values.recoveryVO2;
    const dropRate = currentDrop / values.recoveryTime;
    const remainingDrop = values.recoveryVO2 - halfwayVO2;
    halfTime = values.recoveryTime + (remainingDrop / dropRate);
  }
  
  // Recovery rate (VO2 drop per minute)
  const recoveryRate = vo2Drop / values.recoveryTime;
  
  // Adjust for fitness level
  const fitnessMultipliers = { beginner: 1.2, intermediate: 1.0, advanced: 0.85, elite: 0.7 };
  const fitnessMultiplier = values.fitnessLevel ? fitnessMultipliers[values.fitnessLevel] : 1.0;
  halfTime = halfTime * fitnessMultiplier;
  
  // Adjust for age (older = slower recovery)
  if (values.age) {
    const ageAdjustment = 1 + ((values.age - 30) / 100); // +1% per year over 30
    halfTime = halfTime * ageAdjustment;
  }
  
  // Clamp to reasonable range (10 seconds to 10 minutes)
  halfTime = clamp(halfTime, 0.17, 10);
  
  let status: ResultPayload['status'] = 'good';
  let recoveryLevel = 'Good';
  let interpretation = 'This suggests a general lifestyle tendency where your VO2 recovery half-time may be good. You may have decent cardiovascular recovery capacity.';
  
  if (halfTime < 1) {
    status = 'excellent';
    recoveryLevel = 'Excellent';
    interpretation = 'This suggests a general lifestyle tendency where your VO2 recovery half-time is excellent. You may have superior cardiovascular recovery capacity, indicating high fitness.';
  } else if (halfTime < 1.5) {
    status = 'good';
    recoveryLevel = 'Good';
  } else if (halfTime < 2.5) {
    status = 'moderate';
    recoveryLevel = 'Moderate';
    interpretation = 'This suggests a general lifestyle tendency where your VO2 recovery half-time is moderate. You may consider improving through consistent aerobic training.';
  } else {
    status = 'poor';
    recoveryLevel = 'Poor';
    interpretation = 'This suggests a general lifestyle tendency where your VO2 recovery half-time may be slower than optimal. You may consider focusing on improving cardiovascular fitness through consistent aerobic training.';
  }
  
  const recommendations = [
    'You may consider improving cardiovascular fitness through consistent aerobic training (running, cycling, swimming) 3-5 times per week. This is a personal insight, not a medical evaluation.',
    'You may consider including interval training: high-intensity intervals may improve VO2 recovery speed and overall cardiovascular capacity.',
    'You may consider implementing proper cool-down: active recovery (light movement) may improve recovery rate compared to complete rest.',
  ];
  if (halfTime > 2) {
    recommendations.push('You may consider focusing on building aerobic base: longer, moderate-intensity sessions may improve cardiovascular efficiency and recovery capacity.');
  }
  if (values.age && values.age > 40) {
    recommendations.push('Age-related recovery changes are normal. Consistent training may maintain or improve recovery capacity at any age.');
  }
  if (recoveryRate < 5) {
    recommendations.push('Recovery rate may be slower than optimal. You may consider increasing training frequency and including more aerobic exercise to support recovery speed.');
  }
  
  const plan = [
    { label: 'This Week', detail: 'You may consider measuring VO2 recovery during training. Note peak VO2, recovery VO2 at specific time points, and calculate recovery half-time.' },
    { label: 'This Month', detail: 'You may consider implementing consistent aerobic training and interval work. Track improvements in VO2 recovery half-time over time.' },
    { label: 'Ongoing', detail: 'You may consider maintaining cardiovascular fitness through regular training. Monitor VO2 recovery as an indicator of fitness improvements and recovery capacity.' },
  ];
  
  return { halfTime, recoveryRate, recoveryLevel, status, interpretation, recommendations, plan };
};

export default function VO2RecoveryHalfTimeCalculator() {
  const [result, setResult] = useState<ResultPayload | null>(null);
  
  const form = useForm<FormValues>({
    resolver: zodResolver(formSchema),
    defaultValues: {
      peakVO2: undefined,
      recoveryVO2: undefined,
      recoveryTime: undefined,
      fitnessLevel: undefined,
      age: undefined,
    },
  });
  
  return (
    <div className="space-y-8">
      <Script id="vo2-recovery-schema" type="application/ld+json" strategy="afterInteractive" dangerouslySetInnerHTML={{ __html: JSON.stringify(schemaMarkup) }} />
      
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <Activity className="h-5 w-5" />
            VO2 Recovery Half-Time Wellness Estimator
          </CardTitle>
          <CardDescription>Get general wellness insights about VO2 recovery half-time based on peak VO2, recovery VO2, recovery time, fitness level, and age. This is a personal lifestyle insight, not a medical evaluation.</CardDescription>
        </CardHeader>
      </Card>
      
      <Card>
        <CardHeader>
          <CardTitle>Input your VO2 recovery data</CardTitle>
        </CardHeader>
        <CardContent>
          <Form {...form}>
            <form onSubmit={form.handleSubmit((values) => setResult(calculateResult(values)))} className="space-y-6">
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <FormField
                  control={form.control}
                  name="peakVO2"
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel>Peak VO2 (ml/kg/min)</FormLabel>
                      <FormControl>
                        <Input type="number" step="0.1" placeholder="e.g., 45" value={field.value ?? ''} onChange={(e) => field.onChange(e.target.value === '' ? undefined : Number(e.target.value))} />
                      </FormControl>
                      <FormMessage />
                    </FormItem>
                  )}
                />
                <FormField
                  control={form.control}
                  name="recoveryVO2"
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel>Recovery VO2 (ml/kg/min)</FormLabel>
                      <FormControl>
                        <Input type="number" step="0.1" placeholder="e.g., 25" value={field.value ?? ''} onChange={(e) => field.onChange(e.target.value === '' ? undefined : Number(e.target.value))} />
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
                      <FormLabel>Recovery time (minutes)</FormLabel>
                      <FormControl>
                        <Input type="number" step="0.5" placeholder="e.g., 2" value={field.value ?? ''} onChange={(e) => field.onChange(e.target.value === '' ? undefined : Number(e.target.value))} />
                      </FormControl>
                      <FormMessage />
                    </FormItem>
                  )}
                />
                <FormField
                  control={form.control}
                  name="fitnessLevel"
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel>Fitness level (optional)</FormLabel>
                      <FormControl>
                        <select value={field.value ?? ''} onChange={(e) => field.onChange(e.target.value === '' ? undefined : e.target.value as FormValues['fitnessLevel'])} className="flex h-10 w-full rounded-md border border-input bg-background px-3 py-2 text-sm">
                          <option value="">Select level</option>
                          <option value="beginner">Beginner</option>
                          <option value="intermediate">Intermediate</option>
                          <option value="advanced">Advanced</option>
                          <option value="elite">Elite</option>
                        </select>
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
                      <FormLabel>Age (years, optional)</FormLabel>
                      <FormControl>
                        <Input type="number" step="1" placeholder="e.g., 35" value={field.value ?? ''} onChange={(e) => field.onChange(e.target.value === '' ? undefined : Number(e.target.value))} />
                      </FormControl>
                      <FormMessage />
                    </FormItem>
                  )}
                />
              </div>
              <Button type="submit" className="w-full md:w-auto">
                Calculate recovery half-time
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
            <CardDescription>See VO2 recovery half-time, recovery rate, and recommendations.</CardDescription>
          </CardHeader>
          <CardContent className="space-y-6">
            <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
              <div className="p-4 border rounded">
                <p className="text-sm text-muted-foreground">Recovery half-time</p>
                <p className="text-2xl font-semibold text-primary">{result.halfTime.toFixed(2)} min</p>
                <p className="text-xs text-muted-foreground">To 50% recovery</p>
              </div>
              <div className="p-4 border rounded">
                <p className="text-sm text-muted-foreground">Recovery rate</p>
                <p className="text-2xl font-semibold text-primary">{result.recoveryRate.toFixed(1)}</p>
                <p className="text-xs text-muted-foreground">ml/kg/min per min</p>
              </div>
              <div className="p-4 border rounded">
                <p className="text-sm text-muted-foreground">Recovery level</p>
                <p className="text-2xl font-semibold text-primary">{result.recoveryLevel}</p>
                <p className="text-xs text-muted-foreground">{result.status}</p>
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
            <strong>VO2 drop</strong> = Peak VO2 - Recovery VO2.
          </p>
          <p>
            <strong>Recovery rate</strong> = VO2 drop / Recovery time (ml/kg/min per minute).
          </p>
          <p>
            <strong>Halfway VO2</strong> = (Peak VO2 + Baseline VO2) / 2, where Baseline ≈ 3.5 ml/kg/min.
          </p>
          <p>
            <strong>Recovery half-time</strong> = Time to reach halfway VO2, calculated from recovery rate and current drop, adjusted for fitness level and age.
          </p>
          <p>
            <strong>Fitness adjustment</strong> = Beginner: ×1.2, Intermediate: ×1.0, Advanced: ×0.85, Elite: ×0.7.
          </p>
          <p>
            <strong>Age adjustment</strong> = ×(1 + (Age - 30) / 100) for ages over 30.
          </p>
          <p>Faster recovery half-time (shorter time) indicates better cardiovascular fitness and recovery capacity. Elite athletes typically recover in 30-60 seconds, while beginners may take 2-3+ minutes.</p>
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
          <p>VO2 recovery half-time measures how quickly your oxygen consumption returns to baseline after exercise. Faster recovery indicates better cardiovascular fitness, efficient oxygen delivery, and superior recovery capacity.</p>
          <p>Use this calculator to estimate VO2 recovery half-time based on peak VO2 during exercise, recovery VO2 after a specified time, recovery duration, fitness level, and age to assess cardiovascular recovery capacity and fitness improvements.</p>
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
          <p>This tool provides general wellness insights about VO2 recovery half-time based on peak VO2, recovery VO2, recovery time, fitness level, and age. This is a personal lifestyle insight, not a medical evaluation.</p>
          <p>Outputs include recovery half-time (minutes), recovery rate (ml/kg/min per minute), recovery level, status, recommendations, an action plan, and supporting metrics.</p>
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


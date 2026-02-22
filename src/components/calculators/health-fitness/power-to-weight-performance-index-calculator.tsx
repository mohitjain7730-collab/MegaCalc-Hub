'use client';

import { useState } from 'react';
import Script from 'next/script';
import Link from 'next/link';
import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import { z } from 'zod';
import { Zap, TrendingUp, Target, Shield, Activity } from 'lucide-react';

import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Form, FormControl, FormField, FormItem, FormLabel, FormMessage } from '@/components/ui/form';
import { Input } from '@/components/ui/input';

const formSchema = z.object({
  powerOutput: z.number({ invalid_type_error: 'Enter power output' }).min(0).max(2000),
  bodyWeight: z.number({ invalid_type_error: 'Enter body weight' }).min(30).max(300),
  powerUnit: z.enum(['watts', 'horsepower']),
  weightUnit: z.enum(['kg', 'lbs']),
  activityType: z.enum(['cycling', 'running', 'sprinting', 'rowing', 'general']).optional(),
});

type FormValues = z.infer<typeof formSchema>;

type ResultPayload = {
  powerToWeightRatio: number;
  performanceIndex: number;
  performanceLevel: string;
  status: 'elite' | 'excellent' | 'good' | 'moderate' | 'improving';
  interpretation: string;
  recommendations: string[];
  plan: { label: string; detail: string }[];
};

const steps = [
  'Enter power output (watts or horsepower).',
  'Enter body weight (kg or lbs).',
  'Select power unit (watts or horsepower).',
  'Select weight unit (kg or lbs).',
  'Optionally select activity type for context.',
  'Review power-to-weight ratio, performance index, and recommendations.',
];

const faqs = [
  {
    question: 'What is power-to-weight ratio?',
    answer:
      'Power-to-weight ratio is power output divided by body weight, expressed as watts per kilogram (W/kg) or similar. It indicates relative strength and performance efficiency. Higher ratios mean better performance per unit of body weight.',
  },
  {
    question: 'Why is power-to-weight ratio important?',
    answer:
      'Power-to-weight ratio is crucial for performance where body weight must be moved (cycling, running, climbing). Higher ratios allow faster speeds, better climbing, and superior performance. It\'s more important than absolute power in weight-bearing activities.',
  },
  {
    question: 'What is a good power-to-weight ratio?',
    answer:
      'Ratios vary by activity: Cycling (elite: 5-6+ W/kg, good: 3-4 W/kg, moderate: 2-3 W/kg), Running (elite: 6-7+ W/kg, good: 4-5 W/kg). Higher is better. Elite athletes typically exceed 5 W/kg in cycling.',
  },
  {
    question: 'How do I improve power-to-weight ratio?',
    answer:
      'Improve by: increasing power output (strength training, intervals, power training), reducing body weight (if excess fat), or both. The most effective approach depends on current power and body composition.',
  },
  {
    question: 'Should I lose weight to improve ratio?',
    answer:
      'Only if you have excess body fat. Losing muscle mass to improve ratio is counterproductive. Focus on increasing power while maintaining or slightly reducing body fat. Optimal body composition balances power and weight.',
  },
  {
    question: 'How does activity type affect power-to-weight?',
    answer:
      'Different activities have different power requirements: cycling (sustained power), running (peak and sustained), sprinting (peak power), rowing (full-body power). Power-to-weight matters more in activities where body weight must be moved against gravity.',
  },
  {
    question: 'Can I measure power without equipment?',
    answer:
      'Estimated power can be calculated from: speed, grade, and weight (cycling), pace and body weight (running), or estimated from perceived exertion and known benchmarks. Professional power meters provide accurate measurements.',
  },
  {
    question: 'What is the relationship between strength and power-to-weight?',
    answer:
      'Strength training improves power output, which increases power-to-weight ratio. However, excessive muscle mass (beyond sport requirements) can reduce ratio if power doesn\'t increase proportionally. Sport-specific strength training optimizes this balance.',
  },
  {
    question: 'How does body composition affect ratio?',
    answer:
      'Lower body fat with maintained or increased muscle mass improves ratio. More muscle (if it generates power) can improve ratio. Excess fat reduces ratio. Optimal composition maximizes power while minimizing unnecessary weight.',
  },
  {
    question: 'Is power-to-weight more important than absolute power?',
    answer:
      'It depends on activity. For weight-bearing activities (cycling, running, climbing), power-to-weight is often more important. For non-weight-bearing activities (swimming, rowing), absolute power may matter more. Many sports benefit from optimizing both.',
  },
];

const relatedCalculators = [
  {
    name: 'Strength to Weight Ratio Calculator',
    slug: 'strength-to-weight-ratio-calculator',
    description: 'Assess strength relative to body weight.',
  },
  {
    name: 'Training Fatigue Wellness Index',
    slug: 'training-fatigue-index-calculator',
    description: 'Get wellness insights about training load to optimize power development.',
  },
  {
    name: 'VO2 Recovery Half-Time Wellness Estimator',
    slug: 'vo2-recovery-half-time-calculator',
    description: 'Get wellness insights about cardiovascular fitness affecting power output.',
  },
  {
    name: 'Training Stress Score Calculator',
    slug: 'running-pace-calculator',
    description: 'Calculate training stress in power-based training.',
  },
];

const baseUrl = 'https://mycalculating.com/health-fitness/power-to-weight-performance-index-calculator';

const schemaMarkup = {
  '@context': 'https://schema.org',
  '@graph': [
    {
      '@type': 'BreadcrumbList',
      itemListElement: [
        { '@type': 'ListItem', position: 1, name: 'Home', item: 'https://mycalculating.com' },
        { '@type': 'ListItem', position: 2, name: 'Health & Fitness', item: 'https://mycalculating.com/health-fitness' },
        { '@type': 'ListItem', position: 3, name: 'Power-to-Weight Performance Wellness Index', item: baseUrl },
      ],
    },
    {
      '@type': 'SoftwareApplication',
      name: 'Power-to-Weight Performance Wellness Index',
      applicationCategory: 'Calculator',
      operatingSystem: 'Web Browser',
      description: 'Get general wellness insights about power-to-weight ratio and performance index based on power output, body weight, units, and activity type. This is a personal lifestyle insight, not a medical evaluation.',
      url: baseUrl,
      offers: { '@type': 'Offer', price: '0', priceCurrency: 'USD' },
    },
  ],
};

const clamp = (value: number, min: number, max: number) => Math.min(max, Math.max(min, value));

const calculateResult = (values: FormValues): ResultPayload => {
  // Convert power to watts if needed
  let powerWatts = values.powerOutput;
  if (values.powerUnit === 'horsepower') {
    powerWatts = values.powerOutput * 745.7; // 1 hp = 745.7 W
  }
  
  // Convert weight to kg if needed
  let weightKg = values.bodyWeight;
  if (values.weightUnit === 'lbs') {
    weightKg = values.bodyWeight * 0.453592; // 1 lb = 0.453592 kg
  }
  
  // Calculate power-to-weight ratio (W/kg)
  const powerToWeightRatio = powerWatts / weightKg;
  
  // Calculate performance index (0-100 scale)
  // Baseline: 2 W/kg = 50, 3 W/kg = 65, 4 W/kg = 80, 5 W/kg = 92, 6+ W/kg = 100
  let performanceIndex: number;
  if (powerToWeightRatio < 2) {
    performanceIndex = (powerToWeightRatio / 2) * 50;
  } else if (powerToWeightRatio < 3) {
    performanceIndex = 50 + ((powerToWeightRatio - 2) / 1) * 15; // 50-65
  } else if (powerToWeightRatio < 4) {
    performanceIndex = 65 + ((powerToWeightRatio - 3) / 1) * 15; // 65-80
  } else if (powerToWeightRatio < 5) {
    performanceIndex = 80 + ((powerToWeightRatio - 4) / 1) * 12; // 80-92
  } else if (powerToWeightRatio < 6) {
    performanceIndex = 92 + ((powerToWeightRatio - 5) / 1) * 8; // 92-100
  } else {
    performanceIndex = 100;
  }
  
  performanceIndex = clamp(performanceIndex, 0, 100);
  
  let status: ResultPayload['status'] = 'good';
  let performanceLevel = 'Good';
  let interpretation = 'This suggests a general lifestyle tendency where your power-to-weight performance index may be good. You may have decent relative power output.';
  
  if (performanceIndex >= 90) {
    status = 'elite';
    performanceLevel = 'Elite';
    interpretation = 'This suggests a general lifestyle tendency where your power-to-weight performance index is elite. You may have exceptional relative power output, comparable to highly trained athletes.';
  } else if (performanceIndex >= 75) {
    status = 'excellent';
    performanceLevel = 'Excellent';
    interpretation = 'This suggests a general lifestyle tendency where your power-to-weight performance index is excellent. You may have strong relative power output.';
  } else if (performanceIndex >= 60) {
    status = 'good';
    performanceLevel = 'Good';
  } else if (performanceIndex >= 40) {
    status = 'moderate';
    performanceLevel = 'Moderate';
    interpretation = 'This suggests a general lifestyle tendency where your power-to-weight performance index is moderate. You may consider improving through training and body composition optimization.';
  } else {
    status = 'improving';
    performanceLevel = 'Improving';
    interpretation = 'This suggests a general lifestyle tendency where your power-to-weight performance index indicates room for improvement. You may consider focusing on increasing power output and optimizing body composition.';
  }
  
  const recommendations = [
    'You may consider increasing power output through: strength training, interval training, power-specific exercises, and progressive overload in training. This is a personal insight, not a medical evaluation.',
    'You may consider optimizing body composition: reduce excess body fat while maintaining or increasing muscle mass that contributes to power output.',
    'You may consider training specifically for your activity: cycling (sustained power), running (peak power), sprinting (explosive power) may require different training approaches.',
  ];
  if (powerToWeightRatio < 3) {
    recommendations.push('You may consider focusing on building power base: include consistent strength training and power development work in your routine. Power-to-weight ratio under 3 W/kg may have significant improvement potential.');
  }
  if (powerToWeightRatio >= 5) {
    recommendations.push('You may consider maintaining elite level: continue high-intensity training and optimal nutrition to maintain exceptional power-to-weight ratio. Monitor for overtraining patterns.');
  }
  
  const plan = [
    { label: 'This Week', detail: 'You may consider measuring current power output and body weight. Calculate baseline power-to-weight ratio and performance index.' },
    { label: 'This Month', detail: 'You may consider implementing training program to increase power output (strength training, intervals) while optimizing body composition. Track improvements in power-to-weight ratio.' },
    { label: 'Ongoing', detail: 'You may consider continuing power development training. Monitor power-to-weight ratio as indicator of performance improvements. Balance power gains with weight management for optimal ratio.' },
  ];
  
  return { powerToWeightRatio, performanceIndex, performanceLevel, status, interpretation, recommendations, plan };
};

export default function PowerToWeightPerformanceIndexCalculator() {
  const [result, setResult] = useState<ResultPayload | null>(null);
  
  const form = useForm<FormValues>({
    resolver: zodResolver(formSchema),
    defaultValues: {
      powerOutput: undefined,
      bodyWeight: undefined,
      powerUnit: undefined,
      weightUnit: undefined,
      activityType: undefined,
    },
  });
  
  return (
    <div className="space-y-8">
      <Script id="power-weight-schema" type="application/ld+json" strategy="afterInteractive" dangerouslySetInnerHTML={{ __html: JSON.stringify(schemaMarkup) }} />
      
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <Zap className="h-5 w-5" />
            Power-to-Weight Performance Wellness Index
          </CardTitle>
          <CardDescription>Get general wellness insights about power-to-weight ratio and performance index based on power output, body weight, units, and activity type. This is a personal lifestyle insight, not a medical evaluation.</CardDescription>
        </CardHeader>
      </Card>
      
      <Card>
        <CardHeader>
          <CardTitle>Input your power and weight data</CardTitle>
        </CardHeader>
        <CardContent>
          <Form {...form}>
            <form onSubmit={form.handleSubmit((values) => setResult(calculateResult(values)))} className="space-y-6">
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <FormField
                  control={form.control}
                  name="powerOutput"
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel>Power output</FormLabel>
                      <FormControl>
                        <Input type="number" step="0.1" placeholder="e.g., 250" value={field.value ?? ''} onChange={(e) => field.onChange(e.target.value === '' ? undefined : Number(e.target.value))} />
                      </FormControl>
                      <FormMessage />
                    </FormItem>
                  )}
                />
                <FormField
                  control={form.control}
                  name="powerUnit"
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel>Power unit</FormLabel>
                      <FormControl>
                        <select value={field.value ?? ''} onChange={(e) => field.onChange(e.target.value as FormValues['powerUnit'])} className="flex h-10 w-full rounded-md border border-input bg-background px-3 py-2 text-sm">
                          <option value="">Select unit</option>
                          <option value="watts">Watts</option>
                          <option value="horsepower">Horsepower</option>
                        </select>
                      </FormControl>
                      <FormMessage />
                    </FormItem>
                  )}
                />
                <FormField
                  control={form.control}
                  name="bodyWeight"
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel>Body weight</FormLabel>
                      <FormControl>
                        <Input type="number" step="0.1" placeholder="e.g., 70" value={field.value ?? ''} onChange={(e) => field.onChange(e.target.value === '' ? undefined : Number(e.target.value))} />
                      </FormControl>
                      <FormMessage />
                    </FormItem>
                  )}
                />
                <FormField
                  control={form.control}
                  name="weightUnit"
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel>Weight unit</FormLabel>
                      <FormControl>
                        <select value={field.value ?? ''} onChange={(e) => field.onChange(e.target.value as FormValues['weightUnit'])} className="flex h-10 w-full rounded-md border border-input bg-background px-3 py-2 text-sm">
                          <option value="">Select unit</option>
                          <option value="kg">Kilograms (kg)</option>
                          <option value="lbs">Pounds (lbs)</option>
                        </select>
                      </FormControl>
                      <FormMessage />
                    </FormItem>
                  )}
                />
                <FormField
                  control={form.control}
                  name="activityType"
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel>Activity type (optional)</FormLabel>
                      <FormControl>
                        <select value={field.value ?? ''} onChange={(e) => field.onChange(e.target.value === '' ? undefined : e.target.value as FormValues['activityType'])} className="flex h-10 w-full rounded-md border border-input bg-background px-3 py-2 text-sm">
                          <option value="">Select type</option>
                          <option value="cycling">Cycling</option>
                          <option value="running">Running</option>
                          <option value="sprinting">Sprinting</option>
                          <option value="rowing">Rowing</option>
                          <option value="general">General</option>
                        </select>
                      </FormControl>
                      <FormMessage />
                    </FormItem>
                  )}
                />
              </div>
              <Button type="submit" className="w-full md:w-auto">
                Calculate performance index
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
            <CardDescription>See power-to-weight ratio, performance index, and recommendations.</CardDescription>
          </CardHeader>
          <CardContent className="space-y-6">
            <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
              <div className="p-4 border rounded">
                <p className="text-sm text-muted-foreground">Power-to-weight</p>
                <p className="text-2xl font-semibold text-primary">{result.powerToWeightRatio.toFixed(2)} W/kg</p>
                <p className="text-xs text-muted-foreground">Watts per kilogram</p>
              </div>
              <div className="p-4 border rounded">
                <p className="text-sm text-muted-foreground">Performance index</p>
                <p className="text-2xl font-semibold text-primary">{result.performanceIndex.toFixed(1)}</p>
                <p className="text-xs text-muted-foreground">Out of 100</p>
              </div>
              <div className="p-4 border rounded">
                <p className="text-sm text-muted-foreground">Performance level</p>
                <p className="text-2xl font-semibold text-primary">{result.performanceLevel}</p>
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
            <strong>Power conversion</strong> = Horsepower Ã— 745.7 = Watts (if needed).
          </p>
          <p>
            <strong>Weight conversion</strong> = Pounds Ã— 0.453592 = Kilograms (if needed).
          </p>
          <p>
            <strong>Power-to-weight ratio</strong> = Power (W) / Body weight (kg) = W/kg.
          </p>
          <p>
            <strong>Performance index</strong> = Scaled 0-100 based on W/kg: &lt;2 = 0-50, 2-3 = 50-65, 3-4 = 65-80, 4-5 = 80-92, 5-6 = 92-100, 6+ = 100.
          </p>
          <p>
            <strong>Index interpretation</strong>: 90-100 = Elite, 75-90 = Excellent, 60-75 = Good, 40-60 = Moderate, &lt;40 = Improving.
          </p>
          <p>Higher power-to-weight ratios indicate better relative performance. Elite athletes typically exceed 5 W/kg in cycling. Improvement comes from increasing power, optimizing body composition, or both.</p>
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
          <p>Power-to-weight ratio is a key performance metric for activities where body weight must be moved. It indicates relative strength and efficiency, with higher ratios enabling better performance in cycling, running, and other weight-bearing activities.</p>
          <p>Use this calculator to determine power-to-weight ratio (W/kg) and performance index based on power output, body weight, measurement units, and activity type to assess relative performance and guide training improvements.</p>
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
          <p>This tool provides general wellness insights about power-to-weight ratio and performance index based on power output, body weight, power unit, weight unit, and optional activity type. This is a personal lifestyle insight, not a medical evaluation.</p>
          <p>Outputs include power-to-weight ratio (W/kg), performance index (0-100), performance level, status, recommendations, an action plan, and supporting metrics.</p>
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


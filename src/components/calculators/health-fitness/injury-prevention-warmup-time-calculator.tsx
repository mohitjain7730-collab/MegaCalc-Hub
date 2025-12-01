'use client';

import { useState } from 'react';
import Script from 'next/script';
import Link from 'next/link';
import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import { z } from 'zod';
import { Shield, Zap, Target, Activity, Clock } from 'lucide-react';

import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Form, FormControl, FormField, FormItem, FormLabel, FormMessage } from '@/components/ui/form';
import { Input } from '@/components/ui/input';

const formSchema = z.object({
  activityType: z.enum(['strength', 'cardio', 'sports', 'flexibility', 'mixed']),
  intensityLevel: z.number({ invalid_type_error: 'Enter intensity level' }).min(1).max(10),
  age: z.number({ invalid_type_error: 'Enter age' }).min(10).max(100),
  environmentalTemp: z.number({ invalid_type_error: 'Enter temperature' }).min(-10).max(110).optional(),
  injuryHistory: z.enum(['none', 'minor', 'moderate', 'severe']).optional(),
});

type FormValues = z.infer<typeof formSchema>;

type ResultPayload = {
  warmupMinutes: number;
  warmupComponents: string[];
  warmupLevel: string;
  status: 'minimal' | 'moderate' | 'extensive' | 'comprehensive';
  interpretation: string;
  recommendations: string[];
  plan: { label: string; detail: string }[];
};

const steps = [
  'Select activity type (strength, cardio, sports, flexibility, or mixed).',
  'Enter intensity level (1 = very light, 10 = maximum effort).',
  'Enter your age (older individuals may need longer warmups).',
  'Optionally enter environmental temperature (°F).',
  'Optionally select injury history level.',
  'Review recommended warmup time, components, and recommendations.',
];

const faqs = [
  {
    question: 'Why is warmup important for injury prevention?',
    answer:
      'Warmup increases blood flow to muscles, raises body temperature, improves joint mobility, enhances neuromuscular activation, and prepares the body for exercise. Proper warmup reduces injury risk by 30-50%.',
  },
  {
    question: 'How long should a warmup be?',
    answer:
      'Warmup duration varies: light activity (5-10 minutes), moderate (10-15 minutes), intense (15-20 minutes), very intense or cold conditions (20-30 minutes). Intensity and environmental factors affect duration.',
  },
  {
    question: 'What should a warmup include?',
    answer:
      'A complete warmup includes: light cardiovascular activity (5-10 min), dynamic stretching (5-10 min), activity-specific movements (5-10 min), and gradual intensity progression. The exact components depend on activity type.',
  },
  {
    question: 'How does age affect warmup needs?',
    answer:
      'Older individuals typically need longer, more gradual warmups due to decreased flexibility, slower blood flow increases, and longer tissue adaptation times. Age 40+ may need 5-10 extra minutes.',
  },
  {
    question: 'Does environmental temperature matter?',
    answer:
      'Yes. Cold conditions require longer, more gradual warmups (add 5-10 minutes). Hot conditions may need shorter warmups but more hydration. Ideal temperature (65-75°F) allows standard warmup duration.',
  },
  {
    question: 'What about injury history?',
    answer:
      'Previous injuries require additional warmup for affected areas. Include targeted mobility work, gentle activation exercises, and gradual loading. Those with injury history may need 5-10 extra minutes.',
  },
  {
    question: 'Can you warmup too much?',
    answer:
      'Excessive warmup can cause fatigue before the main activity. Very long warmups (30+ minutes) may reduce performance. Balance thorough preparation with energy conservation for the main activity.',
  },
  {
    question: 'What is dynamic vs static stretching?',
    answer:
      'Dynamic stretching (movement-based, e.g., leg swings, arm circles) is ideal for warmup as it activates muscles. Static stretching (holding stretches) is better for cooldown. Dynamic warmup reduces injury risk more effectively.',
  },
  {
    question: 'How does activity type affect warmup?',
    answer:
      'Strength training needs activation of working muscles and joints. Cardio needs gradual heart rate elevation. Sports need sport-specific movements and coordination. Flexibility needs joint mobility and muscle activation.',
  },
  {
    question: 'What if I\'m short on time?',
    answer:
      'Even 5 minutes of warmup is better than none. Prioritize: 2-3 minutes light cardio, 2-3 minutes dynamic movements for major joints. However, insufficient warmup increases injury risk, especially for intense activities.',
  },
];

const relatedCalculators = [
  {
    name: 'Training Fatigue Wellness Index',
    slug: 'training-fatigue-index-calculator',
    description: 'Get wellness insights about training load that affects warmup needs.',
  },
  {
    name: 'Rest Time Between Sets Calculator',
    slug: 'rest-time-between-sets-calculator',
    description: 'Optimize rest periods for training sessions.',
  },
  {
    name: 'Central Nervous System (CNS) Fatigue Recovery Wellness Guide',
    slug: 'central-nervous-system-cns-fatigue-recovery-calculator',
    description: 'Get wellness insights about recovery including warmup considerations.',
  },
  {
    name: 'HRV Recovery Optimization Wellness Score',
    slug: 'hrv-recovery-optimization-score-calculator',
    description: 'Get wellness insights about recovery status for warmup intensity.',
  },
];

const baseUrl = 'https://mycalculating.com/category/health-fitness/injury-prevention-warmup-time-calculator';

const schemaMarkup = {
  '@context': 'https://schema.org',
  '@graph': [
    {
      '@type': 'BreadcrumbList',
      itemListElement: [
        { '@type': 'ListItem', position: 1, name: 'Home', item: 'https://mycalculating.com' },
        { '@type': 'ListItem', position: 2, name: 'Health & Fitness', item: 'https://mycalculating.com/category/health-fitness' },
        { '@type': 'ListItem', position: 3, name: 'Warmup Time Wellness Planner', item: baseUrl },
      ],
    },
    {
      '@type': 'SoftwareApplication',
      name: 'Warmup Time Wellness Planner',
      applicationCategory: 'Calculator',
      operatingSystem: 'Web Browser',
      description: 'Get general wellness insights about optimal warmup time based on activity type, intensity, age, environmental temperature, and injury history. This is a personal lifestyle insight, not a medical evaluation.',
      url: baseUrl,
      offers: { '@type': 'Offer', price: '0', priceCurrency: 'USD' },
    },
  ],
};

const clamp = (value: number, min: number, max: number) => Math.min(max, Math.max(min, value));

const calculateResult = (values: FormValues): ResultPayload => {
  // Base warmup time by activity type (minutes)
  const activityBases = { strength: 10, cardio: 8, sports: 12, flexibility: 10, mixed: 12 };
  let warmupMinutes = activityBases[values.activityType] ?? 10;
  
  // Intensity adjustment (higher intensity = longer warmup)
  const intensityAdjustment = ((values.intensityLevel - 5) / 5) * 8; // -8 to +8 minutes
  warmupMinutes += intensityAdjustment;
  
  // Age adjustment (older = longer warmup)
  let ageAdjustment = 0;
  if (values.age >= 50) {
    ageAdjustment = ((values.age - 50) / 10) * 3; // +3 min per decade over 50
  }
  warmupMinutes += ageAdjustment;
  
  // Temperature adjustment
  if (values.environmentalTemp) {
    if (values.environmentalTemp < 50) {
      warmupMinutes += 8; // Cold: add 8 minutes
    } else if (values.environmentalTemp < 60) {
      warmupMinutes += 5; // Cool: add 5 minutes
    } else if (values.environmentalTemp > 85) {
      warmupMinutes += 2; // Hot: add 2 minutes for hydration prep
    }
  }
  
  // Injury history adjustment
  if (values.injuryHistory) {
    const injuryAdjustments = { none: 0, minor: 3, moderate: 6, severe: 10 };
    warmupMinutes += injuryAdjustments[values.injuryHistory] ?? 0;
  }
  
  // Clamp to reasonable range (5-30 minutes)
  warmupMinutes = clamp(warmupMinutes, 5, 30);
  
  // Determine warmup components
  const warmupComponents: string[] = [];
  if (warmupMinutes >= 10) {
    warmupComponents.push('Light cardiovascular activity (5-10 min)');
    warmupComponents.push('Dynamic stretching (5-10 min)');
  } else {
    warmupComponents.push('Light cardiovascular activity (3-5 min)');
    warmupComponents.push('Dynamic movements (2-5 min)');
  }
  if (warmupMinutes >= 15) {
    warmupComponents.push('Activity-specific movements (5-10 min)');
  }
  if (warmupMinutes >= 20) {
    warmupComponents.push('Gradual intensity progression (5-10 min)');
  }
  
  let status: ResultPayload['status'] = 'moderate';
  let warmupLevel = 'Moderate';
  let interpretation = 'This suggests a general lifestyle tendency where your recommended warmup time is moderate. This may provide adequate preparation for your activity level.';
  
  if (warmupMinutes < 10) {
    status = 'minimal';
    warmupLevel = 'Minimal';
    interpretation = 'This suggests a general lifestyle tendency where your recommended warmup time is minimal. You may consider ensuring you include at least basic cardiovascular and dynamic movements.';
  } else if (warmupMinutes < 15) {
    status = 'moderate';
    warmupLevel = 'Moderate';
  } else if (warmupMinutes < 20) {
    status = 'extensive';
    warmupLevel = 'Extensive';
    interpretation = 'This suggests a general lifestyle tendency where your recommended warmup time is extensive. This thorough preparation may be important for your activity and conditions.';
  } else {
    status = 'comprehensive';
    warmupLevel = 'Comprehensive';
    interpretation = 'This suggests a general lifestyle tendency where your recommended warmup time is comprehensive. This extensive preparation may be essential for wellness given your activity and conditions.';
  }
  
  const recommendations = [
    'You may consider always including light cardiovascular activity (walking, jogging, cycling) to increase heart rate and blood flow. This is a personal insight, not a medical evaluation.',
    'You may consider performing dynamic stretching rather than static stretching during warmup. Dynamic movements may activate muscles and prepare joints.',
    'You may consider gradually increasing intensity during warmup. Start at 40-50% effort and build to 70-80% before main activity.',
  ];
  if (warmupMinutes < 10) {
    recommendations.push('You may consider extending warmup time. Inadequate warmup may increase injury tendency, especially for intense activities.');
  }
  if (values.age >= 50) {
    recommendations.push('Older individuals may need longer, more gradual warmups. You may consider allowing extra time for joints and muscles to prepare.');
  }
  if (values.environmentalTemp && values.environmentalTemp < 50) {
    recommendations.push('Cold conditions may require extended warmup. You may consider indoor warmup if possible, or add extra layers initially.');
  }
  if (values.injuryHistory && values.injuryHistory !== 'none') {
    recommendations.push('You may consider including targeted warmup for previously injured areas. Focus on gentle mobility and activation exercises for those areas.');
  }
  
  const plan = [
    { label: 'This Week', detail: 'You may consider implementing recommended warmup time before all training sessions. Note how you feel during and after warmup.' },
    { label: 'This Month', detail: 'You may consider establishing consistent warmup routine. Adjust duration based on activity type, intensity, and how your body responds.' },
    { label: 'Ongoing', detail: 'You may consider maintaining proper warmup habits. Proper warmup may be essential for long-term wellness and performance optimization.' },
  ];
  
  return { warmupMinutes, warmupComponents, warmupLevel, status, interpretation, recommendations, plan };
};

export default function InjuryPreventionWarmupTimeCalculator() {
  const [result, setResult] = useState<ResultPayload | null>(null);
  
  const form = useForm<FormValues>({
    resolver: zodResolver(formSchema),
    defaultValues: {
      activityType: undefined,
      intensityLevel: undefined,
      age: undefined,
      environmentalTemp: undefined,
      injuryHistory: undefined,
    },
  });
  
  return (
    <div className="space-y-8">
      <Script id="warmup-time-schema" type="application/ld+json" strategy="afterInteractive" dangerouslySetInnerHTML={{ __html: JSON.stringify(schemaMarkup) }} />
      
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <Shield className="h-5 w-5" />
            Warmup Time Wellness Planner
          </CardTitle>
          <CardDescription>Get general wellness insights about optimal warmup time based on activity type, intensity, age, environmental temperature, and injury history. This is a personal lifestyle insight, not a medical evaluation.</CardDescription>
        </CardHeader>
      </Card>
      
      <Card>
        <CardHeader>
          <CardTitle>Input your activity data</CardTitle>
        </CardHeader>
        <CardContent>
          <Form {...form}>
            <form onSubmit={form.handleSubmit((values) => setResult(calculateResult(values)))} className="space-y-6">
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <FormField
                  control={form.control}
                  name="activityType"
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel>Activity type</FormLabel>
                      <FormControl>
                        <select value={field.value ?? ''} onChange={(e) => field.onChange(e.target.value as FormValues['activityType'])} className="flex h-10 w-full rounded-md border border-input bg-background px-3 py-2 text-sm">
                          <option value="">Select type</option>
                          <option value="strength">Strength</option>
                          <option value="cardio">Cardio</option>
                          <option value="sports">Sports</option>
                          <option value="flexibility">Flexibility</option>
                          <option value="mixed">Mixed</option>
                        </select>
                      </FormControl>
                      <FormMessage />
                    </FormItem>
                  )}
                />
                <FormField
                  control={form.control}
                  name="intensityLevel"
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel>Intensity level (1-10)</FormLabel>
                      <FormControl>
                        <Input type="number" step="1" placeholder="e.g., 7" value={field.value ?? ''} onChange={(e) => field.onChange(e.target.value === '' ? undefined : Number(e.target.value))} />
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
                <FormField
                  control={form.control}
                  name="environmentalTemp"
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel>Environmental temperature (°F, optional)</FormLabel>
                      <FormControl>
                        <Input type="number" step="1" placeholder="e.g., 65" value={field.value ?? ''} onChange={(e) => field.onChange(e.target.value === '' ? undefined : Number(e.target.value))} />
                      </FormControl>
                      <FormMessage />
                    </FormItem>
                  )}
                />
                <FormField
                  control={form.control}
                  name="injuryHistory"
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel>Injury history (optional)</FormLabel>
                      <FormControl>
                        <select value={field.value ?? ''} onChange={(e) => field.onChange(e.target.value === '' ? undefined : e.target.value as FormValues['injuryHistory'])} className="flex h-10 w-full rounded-md border border-input bg-background px-3 py-2 text-sm">
                          <option value="">Select history</option>
                          <option value="none">None</option>
                          <option value="minor">Minor</option>
                          <option value="moderate">Moderate</option>
                          <option value="severe">Severe</option>
                        </select>
                      </FormControl>
                      <FormMessage />
                    </FormItem>
                  )}
                />
              </div>
              <Button type="submit" className="w-full md:w-auto">
                Calculate warmup time
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
            <CardDescription>See recommended warmup time, components, and recommendations.</CardDescription>
          </CardHeader>
          <CardContent className="space-y-6">
            <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
              <div className="p-4 border rounded">
                <p className="text-sm text-muted-foreground">Warmup time</p>
                <p className="text-2xl font-semibold text-primary">{result.warmupMinutes.toFixed(0)} minutes</p>
                <p className="text-xs text-muted-foreground">Recommended</p>
              </div>
              <div className="p-4 border rounded">
                <p className="text-sm text-muted-foreground">Warmup level</p>
                <p className="text-2xl font-semibold text-primary">{result.warmupLevel}</p>
                <p className="text-xs text-muted-foreground">{result.status}</p>
              </div>
              <div className="p-4 border rounded col-span-2">
                <p className="text-sm text-muted-foreground">Components</p>
                <ul className="text-sm text-muted-foreground list-disc pl-4 mt-1">
                  {result.warmupComponents.map((comp, idx) => (
                    <li key={idx}>{comp}</li>
                  ))}
                </ul>
              </div>
            </div>
            <div className="p-4 border rounded">
              <p className="text-sm text-muted-foreground mb-1">Status</p>
              <p className="font-semibold capitalize">{result.status}</p>
              <p className="text-sm text-muted-foreground mt-1">{result.interpretation}</p>
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
            <strong>Base warmup time</strong> = Activity type baseline (Strength: 10 min, Cardio: 8 min, Sports: 12 min, Flexibility: 10 min, Mixed: 12 min).
          </p>
          <p>
            <strong>Intensity adjustment</strong> = ((Intensity level - 5) / 5) × 8 minutes (-8 to +8 min based on intensity).
          </p>
          <p>
            <strong>Age adjustment</strong> = +3 minutes per decade over age 50.
          </p>
          <p>
            <strong>Temperature adjustment</strong> = Cold (&lt;50°F): +8 min, Cool (50-60°F): +5 min, Hot (&gt;85°F): +2 min.
          </p>
          <p>
            <strong>Injury history adjustment</strong> = None: 0 min, Minor: +3 min, Moderate: +6 min, Severe: +10 min.
          </p>
          <p>
            <strong>Total warmup time</strong> = Base + Intensity + Age + Temperature + Injury (clamped 5-30 minutes).
          </p>
          <p>Proper warmup reduces injury risk by 30-50% and improves performance. Duration should increase with intensity, age, cold conditions, and injury history.</p>
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
          <p>Proper warmup is essential for injury prevention and optimal performance. Warmup increases blood flow, raises body temperature, improves joint mobility, and prepares the neuromuscular system for activity.</p>
          <p>Use this calculator to determine optimal warmup time based on activity type, intensity level, age, environmental temperature, and injury history to reduce injury risk and enhance performance.</p>
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
          <p>This tool provides general wellness insights about optimal warmup time based on activity type, intensity level, age, environmental temperature, and injury history. This is a personal lifestyle insight, not a medical evaluation.</p>
          <p>Outputs include suggested warmup time (minutes), warmup components, warmup level, status, recommendations, an action plan, and supporting metrics.</p>
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


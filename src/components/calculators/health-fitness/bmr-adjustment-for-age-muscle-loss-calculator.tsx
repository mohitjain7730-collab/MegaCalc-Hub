'use client';

import { useState } from 'react';
import Script from 'next/script';
import Link from 'next/link';
import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import { z } from 'zod';
import { Calculator, Zap, Target, Activity, Shield } from 'lucide-react';

import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Form, FormControl, FormField, FormItem, FormLabel, FormMessage } from '@/components/ui/form';
import { Input } from '@/components/ui/input';

const formSchema = z.object({
  age: z.number({ invalid_type_error: 'Enter age' }).min(18).max(100),
  weight: z.number({ invalid_type_error: 'Enter weight' }).min(30).max(300),
  height: z.number({ invalid_type_error: 'Enter height' }).min(100).max(250),
  gender: z.enum(['male', 'female']),
  muscleMassPercentage: z.number({ invalid_type_error: 'Enter muscle mass percentage' }).min(20).max(60).optional(),
  activityLevel: z.enum(['sedentary', 'light', 'moderate', 'active', 'very-active']),
});

type FormValues = z.infer<typeof formSchema>;

type ResultPayload = {
  baseBMR: number;
  adjustedBMR: number;
  ageAdjustment: number;
  muscleLossAdjustment: number;
  status: 'optimal' | 'moderate-decline' | 'significant-decline';
  interpretation: string;
  recommendations: string[];
  plan: { label: string; detail: string }[];
};

const steps = [
  'Enter your age (BMR decreases ~2-3% per decade after 30).',
  'Enter weight in kilograms (or convert from pounds: lbs ÷ 2.2).',
  'Enter height in centimeters (or convert from inches: inches × 2.54).',
  'Select gender (metabolic rates differ by gender).',
  'Optionally enter muscle mass percentage if known (for general wellness estimation only).',
  'Select activity level to estimate total daily energy expenditure (TDEE).',
  'Review base BMR, age-adjusted BMR, muscle loss adjustment, and recommendations.',
];

const faqs = [
  {
    question: 'What is BMR?',
    answer:
      'BMR (Basal Metabolic Rate) is the number of calories your body burns at rest to maintain basic functions (breathing, circulation, cell production).',
  },
  {
    question: 'How does age affect BMR?',
    answer:
      'BMR decreases approximately 2-3% per decade after age 30 due to muscle loss, hormonal changes, and reduced organ function. This is a natural part of aging.',
  },
  {
    question: 'Why does muscle mass matter?',
    answer:
      'Muscle tissue is metabolically active and burns more calories at rest than fat. Losing muscle mass reduces BMR, making it easier to gain weight.',
  },
  {
    question: 'How much muscle do we lose with age?',
    answer:
      'After age 30, adults lose approximately 3-5% of muscle mass per decade. This accelerates after age 60. Resistance training can slow or prevent this loss.',
  },
  {
    question: 'Can I prevent BMR decline?',
    answer:
      'Yes. Resistance training to maintain muscle mass, adequate protein intake, and staying active can slow BMR decline. You cannot completely prevent it, but you can minimize it.',
  },
  {
    question: 'What is a normal BMR?',
    answer:
      'Normal BMR varies by age, gender, weight, and height. Typical ranges: Men 1500-2000 kcal/day, Women 1200-1600 kcal/day. This decreases with age.',
  },
  {
    question: 'How do I calculate TDEE?',
    answer:
      'TDEE (Total Daily Energy Expenditure) = BMR × activity multiplier. Sedentary 1.2, Light 1.375, Moderate 1.55, Active 1.725, Very Active 1.9.',
  },
  {
    question: 'Does diet affect BMR?',
    answer:
      'Yes. Very low-calorie diets can lower BMR (metabolic adaptation). Adequate protein and regular meals help maintain BMR. Extreme restriction is counterproductive.',
  },
  {
    question: 'What about metabolism boosters?',
    answer:
      'Some foods and activities (protein, resistance training, adequate sleep) can slightly boost metabolism, but effects are modest. Building muscle is most effective.',
  },
  {
    question: 'When should I recalculate BMR?',
    answer:
      'Recalculate BMR if you gain/lose significant weight, change activity level, or want to adjust calorie intake. Age-related changes are gradual.',
  },
];

const relatedCalculators = [
  {
    name: 'BMI Calculator',
    slug: 'bmi-calculator',
    description: 'Track body composition changes that affect BMR.',
  },
  {
    name: 'Muscle Recovery Time by Age Calculator',
    slug: 'muscle-recovery-time-by-age-calculator',
    description: 'Plan recovery to maintain muscle mass and BMR.',
  },
  {
    name: 'Body Composition Lifestyle Progress Tracker',
    slug: 'fat-to-muscle-recomposition-tracker',
    description: 'Track body recomposition to maintain or increase BMR.',
  },
  {
    name: 'Hormone Support Lifestyle Score Calculator',
    slug: 'daily-testosterone-boosting-habits-score-calculator',
    description: 'Support hormones that affect muscle mass and BMR.',
  },
];

const baseUrl = 'https://mycalculating.com/category/health-fitness/bmr-adjustment-for-age-muscle-loss-calculator';

const schemaMarkup = {
  '@context': 'https://schema.org',
  '@graph': [
    {
      '@type': 'BreadcrumbList',
      itemListElement: [
        { '@type': 'ListItem', position: 1, name: 'Home', item: 'https://mycalculating.com' },
        { '@type': 'ListItem', position: 2, name: 'Health & Fitness', item: 'https://mycalculating.com/category/health-fitness' },
        { '@type': 'ListItem', position: 3, name: 'Metabolic Wellness Estimator', item: baseUrl },
      ],
    },
    {
      '@type': 'SoftwareApplication',
      name: 'Metabolic Wellness Estimator',
      applicationCategory: 'Calculator',
      operatingSystem: 'Web Browser',
      description: 'Calculate BMR adjusted for age and muscle loss to account for metabolic decline over time.',
      url: baseUrl,
      offers: { '@type': 'Offer', price: '0', priceCurrency: 'USD' },
    },
  ],
};

const clamp = (value: number, min: number, max: number) => Math.min(max, Math.max(min, value));

const calculateResult = (values: FormValues): ResultPayload => {
  // Calculate base BMR using Mifflin-St Jeor equation
  let baseBMR: number;
  if (values.gender === 'male') {
    baseBMR = 10 * values.weight + 6.25 * values.height - 5 * values.age + 5;
  } else {
    baseBMR = 10 * values.weight + 6.25 * values.height - 5 * values.age - 161;
  }
  
  // Age adjustment: BMR decreases ~2-3% per decade after 30
  const decadesOver30 = Math.max(0, (values.age - 30) / 10);
  const ageReductionPercent = decadesOver30 * 2.5; // 2.5% per decade
  const ageAdjustment = (baseBMR * ageReductionPercent) / 100;
  
  // Muscle loss adjustment: if muscle mass % is provided, adjust based on expected vs actual
  // Expected muscle mass: Men ~40-45%, Women ~30-35% (varies by age)
  let muscleLossAdjustment = 0;
  if (values.muscleMassPercentage) {
    const expectedMuscleMass = values.gender === 'male' ? 42 : 32; // Average for healthy adults
    const muscleLossPercent = Math.max(0, expectedMuscleMass - values.muscleMassPercentage);
    // Each 1% muscle loss reduces BMR by ~0.5% (rough estimate)
    muscleLossAdjustment = (baseBMR * muscleLossPercent * 0.5) / 100;
  } else {
    // Estimate muscle loss based on age if not provided
    const estimatedMuscleLoss = decadesOver30 * 3; // ~3% per decade
    muscleLossAdjustment = (baseBMR * estimatedMuscleLoss * 0.5) / 100;
  }
  
  const adjustedBMR = baseBMR - ageAdjustment - muscleLossAdjustment;
  
  // Calculate TDEE for reference
  const activityMultipliers: Record<string, number> = {
    'sedentary': 1.2,
    'light': 1.375,
    'moderate': 1.55,
    'active': 1.725,
    'very-active': 1.9,
  };
  const tdee = adjustedBMR * (activityMultipliers[values.activityLevel] || 1.2);

  let status: ResultPayload['status'] = 'optimal';
  let interpretation = 'Your estimated BMR adjustment suggests a general tendency within typical ranges for your age. This is a personal insight, not a medical evaluation.';

  const totalReduction = ((baseBMR - adjustedBMR) / baseBMR) * 100;
  if (totalReduction >= 15) {
    status = 'significant-decline';
    interpretation = 'Your estimated BMR adjustment suggests a larger change. You may consider resistance training and adequate protein for general wellness support. This is a lifestyle insight, not a medical diagnosis.';
  } else if (totalReduction >= 8) {
    status = 'moderate-decline';
    interpretation = 'Your estimated BMR adjustment suggests a moderate change. You may consider maintaining muscle mass through resistance training and proper nutrition. This is a general wellness insight.';
  }

  const recommendations = [
    'You may consider engaging in resistance training 2-3 times per week for general wellness support.',
    'You may consider ensuring adequate protein intake (1.6-2.2 g/kg body weight) for overall wellness.',
    'You may consider staying active throughout the day. Even light activity may support general wellness.',
  ];
  if (status === 'significant-decline') {
    recommendations.push('For any health concerns, please consult a qualified professional. This is a general wellness insight, not medical advice.');
  }
  if (values.muscleMassPercentage && values.muscleMassPercentage < (values.gender === 'male' ? 35 : 25)) {
    recommendations.push('You may consider prioritizing resistance training and protein intake for general wellness support. This is not medical advice.');
  }

  const plan = [
    { label: 'This Week', detail: 'Start or maintain resistance training routine. Focus on compound movements (squats, deadlifts, presses).' },
    { label: 'This Month', detail: 'Ensure adequate protein intake daily. Track progress and adjust training/nutrition as needed.' },
    { label: 'Ongoing', detail: 'Continue resistance training and proper nutrition long-term. Muscle mass maintenance is key to preserving BMR as you age.' },
  ];

  return { baseBMR, adjustedBMR, ageAdjustment, muscleLossAdjustment, status, interpretation, recommendations, plan };
};

export default function BMRAdjustmentForAgeMuscleLossCalculator() {
  const [result, setResult] = useState<ResultPayload | null>(null);

  const form = useForm<FormValues>({
    resolver: zodResolver(formSchema),
    defaultValues: {
      age: undefined,
      weight: undefined,
      height: undefined,
      gender: 'male',
      muscleMassPercentage: undefined,
      activityLevel: 'moderate',
    },
  });

  return (
    <div className="space-y-8">
      <Script id="bmr-adjustment-schema" type="application/ld+json" strategy="afterInteractive" dangerouslySetInnerHTML={{ __html: JSON.stringify(schemaMarkup) }} />

      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <Calculator className="h-5 w-5" />
            Metabolic Wellness Estimator
          </CardTitle>
          <CardDescription>Estimate BMR adjusted for age and lifestyle factors. This is a general wellness insight, not a medical evaluation.</CardDescription>
        </CardHeader>
      </Card>

      <Card>
        <CardHeader>
          <CardTitle>Input your body metrics</CardTitle>
        </CardHeader>
        <CardContent>
          <Form {...form}>
            <form onSubmit={form.handleSubmit((values) => setResult(calculateResult(values)))} className="space-y-6">
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <FormField
                  control={form.control}
                  name="age"
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel>Age (years)</FormLabel>
                      <FormControl>
                        <Input type="number" step="1" placeholder="e.g., 45" value={field.value ?? ''} onChange={(e) => field.onChange(e.target.value === '' ? undefined : Number(e.target.value))} />
                      </FormControl>
                      <FormMessage />
                    </FormItem>
                  )}
                />
                <FormField
                  control={form.control}
                  name="weight"
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel>Weight (kg)</FormLabel>
                      <FormControl>
                        <Input type="number" step="0.5" placeholder="e.g., 75" value={field.value ?? ''} onChange={(e) => field.onChange(e.target.value === '' ? undefined : Number(e.target.value))} />
                      </FormControl>
                      <FormMessage />
                    </FormItem>
                  )}
                />
                <FormField
                  control={form.control}
                  name="height"
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel>Height (cm)</FormLabel>
                      <FormControl>
                        <Input type="number" step="1" placeholder="e.g., 175" value={field.value ?? ''} onChange={(e) => field.onChange(e.target.value === '' ? undefined : Number(e.target.value))} />
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
                      <FormControl>
                        <select
                          value={field.value}
                          onChange={(e) => field.onChange(e.target.value as 'male' | 'female')}
                          className="flex h-10 w-full rounded-md border border-input bg-background px-3 py-2 text-sm ring-offset-background"
                        >
                          <option value="male">Male</option>
                          <option value="female">Female</option>
                        </select>
                      </FormControl>
                      <FormMessage />
                    </FormItem>
                  )}
                />
                <FormField
                  control={form.control}
                  name="muscleMassPercentage"
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel>Muscle mass % (optional)</FormLabel>
                      <FormControl>
                        <Input type="number" step="1" placeholder="e.g., 38" value={field.value ?? ''} onChange={(e) => field.onChange(e.target.value === '' ? undefined : Number(e.target.value))} />
                      </FormControl>
                      <FormMessage />
                    </FormItem>
                  )}
                />
                <FormField
                  control={form.control}
                  name="activityLevel"
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel>Activity level</FormLabel>
                      <FormControl>
                        <select
                          value={field.value}
                          onChange={(e) => field.onChange(e.target.value as 'sedentary' | 'light' | 'moderate' | 'active' | 'very-active')}
                          className="flex h-10 w-full rounded-md border border-input bg-background px-3 py-2 text-sm ring-offset-background"
                        >
                          <option value="sedentary">Sedentary</option>
                          <option value="light">Light</option>
                          <option value="moderate">Moderate</option>
                          <option value="active">Active</option>
                          <option value="very-active">Very Active</option>
                        </select>
                      </FormControl>
                      <FormMessage />
                    </FormItem>
                  )}
                />
              </div>
              <Button type="submit" className="w-full md:w-auto">
                Calculate adjusted BMR
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
            <CardDescription>See base BMR, adjusted BMR, age adjustment, and muscle loss adjustment.</CardDescription>
          </CardHeader>
          <CardContent className="space-y-6">
            <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
              <div className="p-4 border rounded">
                <p className="text-sm text-muted-foreground">Base BMR</p>
                <p className="text-2xl font-semibold text-primary">{result.baseBMR.toFixed(0)}</p>
                <p className="text-xs text-muted-foreground">kcal/day</p>
              </div>
              <div className="p-4 border rounded">
                <p className="text-sm text-muted-foreground">Adjusted BMR</p>
                <p className="text-2xl font-semibold text-primary">{result.adjustedBMR.toFixed(0)}</p>
                <p className="text-xs text-muted-foreground">kcal/day</p>
              </div>
              <div className="p-4 border rounded">
                <p className="text-sm text-muted-foreground">Age adjustment</p>
                <p className="text-2xl font-semibold text-primary">-{result.ageAdjustment.toFixed(0)}</p>
                <p className="text-xs text-muted-foreground">kcal/day</p>
              </div>
              <div className="p-4 border rounded">
                <p className="text-sm text-muted-foreground">Muscle loss adjustment</p>
                <p className="text-2xl font-semibold text-primary">-{result.muscleLossAdjustment.toFixed(0)}</p>
                <p className="text-xs text-muted-foreground">kcal/day</p>
              </div>
            </div>
            <div className="p-4 border rounded">
              <p className="text-sm text-muted-foreground mb-2">Status</p>
              <p className="text-lg font-semibold text-primary capitalize">{result.status.replace('-', ' ')}</p>
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
                    <Activity className="h-4 w-4" />
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
          <p><strong>Base BMR</strong> (Mifflin-St Jeor): Men = 10 × weight + 6.25 × height − 5 × age + 5; Women = 10 × weight + 6.25 × height − 5 × age − 161.</p>
          <p><strong>Age adjustment</strong> = base BMR × (decades over 30 × 2.5%) / 100. BMR decreases ~2.5% per decade after age 30.</p>
          <p><strong>Muscle loss adjustment</strong> = base BMR × (muscle loss % × 0.5%) / 100. Each 1% muscle loss reduces BMR by ~0.5%.</p>
          <p><strong>Adjusted BMR</strong> = base BMR − age adjustment − muscle loss adjustment.</p>
          <p>Older age and lower muscle mass reduce BMR. Resistance training and adequate protein help maintain muscle and slow decline.</p>
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
                <p className="text-sm text-muted-foreground">Total reduction</p>
                <p className="text-xl font-semibold text-primary">
                  {(((result.baseBMR - result.adjustedBMR) / result.baseBMR) * 100).toFixed(1)}%
                </p>
                <p className="text-xs text-muted-foreground">From base BMR</p>
              </div>
              <div className="p-4 border rounded">
                <p className="text-sm text-muted-foreground">Estimated TDEE</p>
                <p className="text-xl font-semibold text-primary">
                  {(result.adjustedBMR * (form.getValues().activityLevel === 'sedentary' ? 1.2 : form.getValues().activityLevel === 'light' ? 1.375 : form.getValues().activityLevel === 'moderate' ? 1.55 : form.getValues().activityLevel === 'active' ? 1.725 : 1.9)).toFixed(0)} kcal
                </p>
                <p className="text-xs text-muted-foreground">Based on activity level</p>
              </div>
              <div className="p-4 border rounded">
                <p className="text-sm text-muted-foreground">Calorie difference</p>
                <p className="text-xl font-semibold text-primary">
                  {(result.baseBMR - result.adjustedBMR).toFixed(0)} kcal/day
                </p>
                <p className="text-xs text-muted-foreground">Lower than base</p>
              </div>
            </div>
          ) : (
            <p className="text-sm text-muted-foreground">Enter your body metrics to see additional insights.</p>
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

      <Card>
        <CardHeader>
          <CardTitle>Complete guide snapshot</CardTitle>
        </CardHeader>
        <CardContent className="prose prose-sm dark:prose-invert max-w-none">
          <p>BMR (Basal Metabolic Rate) may change with age due to various lifestyle factors. This is a general wellness estimation, not a medical evaluation.</p>
          <p>Use this calculator to estimate BMR adjusted for age and lifestyle factors. This provides general wellness insights only.</p>
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
          <p>This tool estimates BMR adjusted for age and lifestyle factors from age, weight, height, gender, muscle mass percentage (optional), and activity level.</p>
          <p>Outputs include base BMR, adjusted BMR, age adjustment, muscle loss adjustment, status, recommendations, an action plan, and supporting metrics.</p>
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





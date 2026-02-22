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
  dailyWaterIntake: z.number({ invalid_type_error: 'Enter daily water intake' }).min(0).max(10),
  alcoholConsumed: z.number({ invalid_type_error: 'Enter alcohol consumed' }).min(0).max(20),
  bodyWeight: z.number({ invalid_type_error: 'Enter body weight' }).min(30).max(300),
  activityLevel: z.enum(['sedentary', 'light', 'moderate', 'active', 'very-active'], {
    invalid_type_error: 'Select activity level',
  }),
  electrolyteIntake: z.number({ invalid_type_error: 'Enter electrolyte intake' }).min(0).max(10).optional(),
});

type FormValues = z.infer<typeof formSchema>;

type ResultPayload = {
  dailyWaterIntake: number;
  alcoholConsumed: number;
  bodyWeight: number;
  activityLevel: string;
  electrolyteIntake: number | undefined;
  hydrationScore: number;
  hydrationPercent: number;
  status: 'optimal' | 'good' | 'moderate' | 'low';
  interpretation: string;
  recommendations: string[];
  plan: { label: string; detail: string }[];
};

const steps = [
  'Enter daily water intake (liters) you typically consume.',
  'Enter alcohol consumed (standard drinks) in the past 24 hours.',
  'Enter your body weight (kg) for personalized calculations.',
  'Select your activity level (sedentary to very active).',
  'Enter electrolyte intake level if known (optional).',
  'Review hydration score, hydration percentage, and recommendations.',
];

const faqs = [
  {
    question: 'What is hydration balance?',
    answer:
      'Hydration balance refers to maintaining adequate fluid levels in your body. Alcohol is a diuretic that increases urine production, leading to dehydration. Proper hydration requires compensating for alcohol-induced fluid loss with additional water intake.',
  },
  {
    question: 'How does alcohol affect hydration?',
    answer:
      'Alcohol suppresses the antidiuretic hormone (ADH), causing increased urine production and fluid loss. Each standard drink can cause the body to lose 100-200ml of water. This dehydration effect can last several hours after alcohol consumption, making adequate water intake crucial.',
  },
  {
    question: 'What is a standard drink?',
    answer:
      'A standard drink contains approximately 14 grams of pure alcohol. Examples: 12 oz beer (5% ABV), 5 oz wine (12% ABV), 1.5 oz distilled spirits (40% ABV). Different countries may use slightly different definitions, but this is the standard US measurement.',
  },
  {
    question: 'What factors affect hydration needs with alcohol?',
    answer:
      'Hydration needs are influenced by body weight, activity level, alcohol consumption amount, environmental conditions (heat, humidity), electrolyte intake, and individual metabolism. Alcohol increases fluid loss, so additional water is needed to maintain balance.',
  },
  {
    question: 'What are the health risks of dehydration from alcohol?',
    answer:
      'Dehydration from alcohol can cause headaches, fatigue, dizziness, dry mouth, reduced cognitive function, increased hangover severity, and in severe cases, electrolyte imbalances. Chronic dehydration can affect kidney function, skin health, and overall well-being.',
  },
  {
    question: 'How can I maintain hydration while consuming alcohol?',
    answer:
      'Drink water before, during, and after alcohol consumption. Follow the "one-to-one" rule: one glass of water per alcoholic drink. Consume electrolyte-rich foods or drinks. Avoid excessive alcohol intake, and ensure adequate water intake the following day to fully rehydrate.',
  },
  {
    question: 'Is some alcohol consumption safe for hydration?',
    answer:
      'Moderate alcohol consumption (1-2 drinks) can be managed with proper hydration strategies. However, alcohol always has a dehydrating effect, so increased water intake is necessary. Heavy drinking significantly disrupts hydration balance and should be avoided.',
  },
  {
    question: 'How does activity level affect hydration with alcohol?',
    answer:
      'Physical activity increases fluid needs through sweating. When combined with alcohol consumption, the dehydration risk multiplies. Active individuals need significantly more water to compensate for both exercise-related fluid loss and alcohol-induced diuresis.',
  },
  {
    question: 'What about electrolytes and alcohol?',
    answer:
      'Alcohol consumption can disrupt electrolyte balance, particularly sodium and potassium. Adequate electrolyte intake helps maintain proper fluid balance and can reduce hangover symptoms. Consider electrolyte-rich foods or drinks when consuming alcohol.',
  },
  {
    question: 'When should I consult a healthcare provider?',
    answer:
      'Consult a healthcare provider if you experience severe dehydration symptoms, persistent hangovers, signs of alcohol dependence, or if you have medical conditions affecting fluid balance (kidney disease, heart conditions, diabetes). Seek immediate medical attention for severe dehydration or alcohol poisoning.',
  },
];

const relatedCalculators = [
  {
    name: 'Hydration Needs Calculator',
    slug: 'hydration-needs-calculator',
    description: 'Calculate your daily hydration requirements.',
  },
  {
    name: 'Alcohol Metabolism Time Calculator',
    slug: 'alcohol-metabolism-time-calculator',
    description: 'Estimate how long alcohol stays in your system.',
  },
  {
    name: 'Hydration Recovery After Workout Calculator',
    slug: 'hydration-recovery-after-workout-calculator',
    description: 'Assess post-exercise hydration recovery needs.',
  },
  {
    name: 'Electrolyte Balance Restoration Calculator',
    slug: 'electrolyte-balance-restoration-calculator',
    description: 'Calculate electrolyte needs for proper balance.',
  },
];

const baseUrl = 'https://mycalculating.com/health-fitness/hydration-balance-with-alcohol-intake-calculator';

const schemaMarkup = {
  '@context': 'https://schema.org',
  '@graph': [
    {
      '@type': 'BreadcrumbList',
      itemListElement: [
        { '@type': 'ListItem', position: 1, name: 'Home', item: 'https://mycalculating.com' },
        { '@type': 'ListItem', position: 2, name: 'Health & Fitness', item: 'https://mycalculating.com/health-fitness' },
        { '@type': 'ListItem', position: 3, name: 'Hydration Balance with Alcohol Intake Calculator', item: baseUrl },
      ],
    },
    {
      '@type': 'SoftwareApplication',
      name: 'Hydration Balance with Alcohol Intake Calculator',
      applicationCategory: 'Calculator',
      operatingSystem: 'Web Browser',
      description: 'Calculate hydration balance considering daily water intake, alcohol consumption, body weight, and activity level.',
      url: baseUrl,
      offers: { '@type': 'Offer', price: '0', priceCurrency: 'USD' },
    },
  ],
};

const clamp = (value: number, min: number, max: number) => Math.min(max, Math.max(min, value));

// Activity level water needs multipliers
const activityLevelMultipliers: Record<string, number> = {
  sedentary: 1.0,
  light: 1.2,
  moderate: 1.4,
  active: 1.6,
  'very-active': 1.8,
};

// Alcohol dehydration factor (ml of water lost per standard drink)
const alcoholDehydrationFactor = 150; // ml per standard drink

const calculateResult = (values: FormValues): ResultPayload => {
  const dailyWaterIntake = values.dailyWaterIntake;
  const alcoholConsumed = values.alcoholConsumed;
  const bodyWeight = values.bodyWeight;
  const activityLevel = values.activityLevel;
  const electrolyteIntake = values.electrolyteIntake;
  
  // Calculate base water need: 30-35ml per kg body weight
  const baseWaterNeed = bodyWeight * 32.5; // Average of 30-35ml
  
  // Apply activity level multiplier
  const activityMultiplier = activityLevelMultipliers[activityLevel] || 1.0;
  const adjustedWaterNeed = baseWaterNeed * activityMultiplier;
  
  // Calculate alcohol-induced dehydration (ml)
  const alcoholDehydration = alcoholConsumed * alcoholDehydrationFactor;
  
  // Total water need including alcohol compensation
  const totalWaterNeed = adjustedWaterNeed + alcoholDehydration;
  
  // Convert to liters for comparison
  const totalWaterNeedLiters = totalWaterNeed / 1000;
  
  // Calculate hydration score (0-100, higher = better)
  // Reference: 70kg, moderate activity, no alcohol = ~2.5L baseline
  const referenceNeed = (70 * 32.5 * 1.4) / 1000; // ~2.5L
  const hydrationRatio = dailyWaterIntake / totalWaterNeedLiters;
  const hydrationScore = clamp(hydrationRatio * 100, 0, 100);
  
  // Hydration percentage (relative to total need)
  const hydrationPercent = clamp((dailyWaterIntake / totalWaterNeedLiters) * 100, 0, 150);
  
  let status: ResultPayload['status'] = 'optimal';
  let interpretation = 'Your hydration balance appears optimal. Continue maintaining adequate water intake relative to your alcohol consumption.';

  if (hydrationScore < 50 || hydrationPercent < 60) {
    status = 'low';
    interpretation = 'Your hydration balance is concerning. You are significantly dehydrated relative to your needs, especially considering alcohol consumption. Increase water intake immediately and reduce alcohol consumption.';
  } else if (hydrationScore < 70 || hydrationPercent < 80) {
    status = 'moderate';
    interpretation = 'Your hydration balance is below optimal. Increase water intake to compensate for alcohol consumption and meet your body\'s needs based on activity level.';
  } else if (hydrationScore < 90 || hydrationPercent < 100) {
    status = 'good';
    interpretation = 'Your hydration balance is good but could be improved. Ensure you\'re drinking enough water to fully compensate for alcohol-induced dehydration.';
  } else {
    status = 'optimal';
    interpretation = 'Your hydration balance is optimal. You\'re maintaining adequate water intake relative to your alcohol consumption and activity level.';
  }

  const recommendations = [
    'Drink water before, during, and after alcohol consumption: follow the "one-to-one" ruleâ€”one glass of water per alcoholic drink to maintain hydration balance.',
    'Increase daily water intake: aim for 30-35ml per kg body weight, adjusted for activity level, plus additional water to compensate for alcohol-induced dehydration.',
    'Consume electrolyte-rich foods or drinks: alcohol disrupts electrolyte balance, so include sodium, potassium, and magnesium sources when drinking alcohol.',
  ];
  
  if (alcoholConsumed > 3) {
    recommendations.push('Reduce alcohol consumption: high alcohol intake significantly disrupts hydration balance and increases dehydration risk. Consider limiting to 1-2 drinks per day.');
  }
  
  if (!electrolyteIntake || electrolyteIntake < 5) {
    recommendations.push('Increase electrolyte intake: adequate electrolytes (sodium, potassium, magnesium) help maintain proper fluid balance and can reduce hangover symptoms. Consider electrolyte supplements or electrolyte-rich foods.');
  }
  
  if (activityLevel === 'active' || activityLevel === 'very-active') {
    recommendations.push('Extra hydration for active lifestyle: physical activity increases fluid needs. When combined with alcohol, ensure significantly increased water intake to compensate for both exercise-related and alcohol-induced fluid loss.');
  }

  const plan = [
    { label: 'This Week', detail: `Monitor your daily water intake relative to alcohol consumption. Aim to drink at least ${totalWaterNeedLiters.toFixed(1)}L of water daily, adjusting based on your alcohol intake and activity level.` },
    { label: 'This Month', detail: 'Establish consistent hydration habits: drink water throughout the day, not just when thirsty. Create a routine of drinking water before, during, and after any alcohol consumption.' },
    { label: 'Ongoing', detail: 'Maintain long-term hydration balance: understand that alcohol always has a dehydrating effect, so increased water intake is necessary. Consider reducing alcohol consumption if hydration balance becomes difficult to maintain.' },
  ];

  return { dailyWaterIntake, alcoholConsumed, bodyWeight, activityLevel, electrolyteIntake, hydrationScore, hydrationPercent, status, interpretation, recommendations, plan };
};

export default function HydrationBalanceWithAlcoholIntakeCalculator() {
  const [result, setResult] = useState<ResultPayload | null>(null);

  const form = useForm<FormValues>({
    resolver: zodResolver(formSchema),
    defaultValues: {
      dailyWaterIntake: undefined,
      alcoholConsumed: undefined,
      bodyWeight: undefined,
      activityLevel: undefined,
      electrolyteIntake: undefined,
    },
  });

  return (
    <div className="space-y-8">
      <Script id="hydration-balance-alcohol-schema" type="application/ld+json" strategy="afterInteractive" dangerouslySetInnerHTML={{ __html: JSON.stringify(schemaMarkup) }} />

      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <Activity className="h-5 w-5" />
            Hydration Balance with Alcohol Intake Calculator
          </CardTitle>
          <CardDescription>Calculate hydration balance considering daily water intake, alcohol consumption, body weight, and activity level.</CardDescription>
        </CardHeader>
      </Card>

      <Card>
        <CardHeader>
          <CardTitle>Input your hydration and alcohol data</CardTitle>
        </CardHeader>
        <CardContent>
          <Form {...form}>
            <form onSubmit={form.handleSubmit((values) => setResult(calculateResult(values)))} className="space-y-6">
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <FormField
                  control={form.control}
                  name="dailyWaterIntake"
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel>Daily water intake (liters)</FormLabel>
                      <FormControl>
                        <Input type="number" step="0.1" placeholder="e.g., 2.5" value={field.value ?? ''} onChange={(e) => field.onChange(e.target.value === '' ? undefined : Number(e.target.value))} />
                      </FormControl>
                      <FormMessage />
                    </FormItem>
                  )}
                />
                <FormField
                  control={form.control}
                  name="alcoholConsumed"
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel>Alcohol consumed (standard drinks)</FormLabel>
                      <FormControl>
                        <Input type="number" step="0.5" placeholder="e.g., 2" value={field.value ?? ''} onChange={(e) => field.onChange(e.target.value === '' ? undefined : Number(e.target.value))} />
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
                      <FormLabel>Body weight (kg)</FormLabel>
                      <FormControl>
                        <Input type="number" step="0.1" placeholder="e.g., 70" value={field.value ?? ''} onChange={(e) => field.onChange(e.target.value === '' ? undefined : Number(e.target.value))} />
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
                          value={field.value ?? ''}
                          onChange={(e) => field.onChange(e.target.value as FormValues['activityLevel'])}
                          className="flex h-10 w-full rounded-md border border-input bg-background px-3 py-2 text-sm ring-offset-background file:border-0 file:bg-transparent file:text-sm file:font-medium placeholder:text-muted-foreground focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2 disabled:cursor-not-allowed disabled:opacity-50"
                        >
                          <option value="">Select activity level</option>
                          <option value="sedentary">Sedentary - Little to no exercise</option>
                          <option value="light">Light - Light exercise 1-3 days/week</option>
                          <option value="moderate">Moderate - Moderate exercise 3-5 days/week</option>
                          <option value="active">Active - Hard exercise 6-7 days/week</option>
                          <option value="very-active">Very Active - Very hard exercise, physical job</option>
                        </select>
                      </FormControl>
                      <FormMessage />
                    </FormItem>
                  )}
                />
                <FormField
                  control={form.control}
                  name="electrolyteIntake"
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel>Electrolyte intake level (0-10, optional)</FormLabel>
                      <FormControl>
                        <Input type="number" step="0.5" placeholder="e.g., 7 (0 if unknown)" value={field.value ?? ''} onChange={(e) => field.onChange(e.target.value === '' ? undefined : Number(e.target.value))} />
                      </FormControl>
                      <FormMessage />
                    </FormItem>
                  )}
                />
              </div>
              <Button type="submit" className="w-full md:w-auto">
                Calculate hydration balance
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
            <CardDescription>See hydration score, hydration percentage, and recommendations.</CardDescription>
          </CardHeader>
          <CardContent className="space-y-6">
            <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
              <div className="p-4 border rounded">
                <p className="text-sm text-muted-foreground">Hydration score</p>
                <p className="text-2xl font-semibold text-primary">{result.hydrationScore.toFixed(1)}</p>
                <p className="text-xs text-muted-foreground">Out of 100</p>
              </div>
              <div className="p-4 border rounded">
                <p className="text-sm text-muted-foreground">Water intake</p>
                <p className="text-2xl font-semibold text-primary">{result.dailyWaterIntake.toFixed(1)}L</p>
                <p className="text-xs text-muted-foreground">Daily consumption</p>
              </div>
              <div className="p-4 border rounded">
                <p className="text-sm text-muted-foreground">Hydration %</p>
                <p className="text-2xl font-semibold text-primary">{result.hydrationPercent.toFixed(0)}%</p>
                <p className="text-xs text-muted-foreground">Of total need</p>
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
            <strong>Base water need</strong> = Body Weight (kg) Ã— 32.5 ml/kg (average of 30-35ml/kg range). This represents the baseline daily water requirement.
          </p>
          <p>
            <strong>Activity-adjusted need</strong> = Base Water Need Ã— Activity Level Multiplier. Multipliers: Sedentary 1.0, Light 1.2, Moderate 1.4, Active 1.6, Very Active 1.8.
          </p>
          <p>
            <strong>Alcohol dehydration</strong> = Alcohol Consumed (standard drinks) Ã— 150 ml/drink. Each standard drink causes approximately 150ml of additional fluid loss through increased urine production.
          </p>
          <p>
            <strong>Total water need</strong> = Activity-Adjusted Need + Alcohol Dehydration. This represents the total daily water requirement to maintain hydration balance.
          </p>
          <p>
            <strong>Hydration score</strong> = (Daily Water Intake / Total Water Need) Ã— 100, normalized to 0-100 scale. Higher scores indicate better hydration balance relative to needs.
          </p>
          <p>Hydration balance is affected by body weight, activity level, alcohol consumption (which increases fluid loss), and electrolyte intake. Proper hydration requires compensating for alcohol-induced dehydration with additional water intake.</p>
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
                <p className="text-sm text-muted-foreground">Total water need</p>
                <p className="text-xl font-semibold text-primary">
                  {((result.bodyWeight * 32.5 * activityLevelMultipliers[result.activityLevel] || 1.0) + (result.alcoholConsumed * 150)) / 1000}L
                </p>
                <p className="text-xs text-muted-foreground">Including alcohol compensation</p>
              </div>
              <div className="p-4 border rounded">
                <p className="text-sm text-muted-foreground">Alcohol dehydration</p>
                <p className="text-xl font-semibold text-primary">
                  {(result.alcoholConsumed * 150) / 1000}L
                </p>
                <p className="text-xs text-muted-foreground">Additional fluid loss</p>
              </div>
              <div className="p-4 border rounded">
                <p className="text-sm text-muted-foreground">Hydration level</p>
                <p className="text-xl font-semibold text-primary">
                  {result.hydrationScore >= 90 ? 'Optimal' : result.hydrationScore >= 70 ? 'Good' : result.hydrationScore >= 50 ? 'Moderate' : 'Low'}
                </p>
                <p className="text-xs text-muted-foreground">Based on calculation</p>
              </div>
            </div>
          ) : (
            <p className="text-sm text-muted-foreground">Enter your hydration and alcohol data to see additional insights.</p>
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
    {/* SEO & SCHEMA METADATA (HIGHLY OPTIMIZED) */}
    <meta itemProp="name" content="The Definitive Guide to Hydration Balance with Alcohol Intake: Understanding Fluid Balance and Dehydration Prevention" />
    <meta itemProp="description" content="An expert, evidence-based guide on hydration balance when consuming alcohol, detailing alcohol's diuretic effects, fluid loss calculations, electrolyte balance, and comprehensive strategies to maintain proper hydration and prevent dehydration." />
    <meta itemProp="keywords" content="hydration balance alcohol calculator, alcohol dehydration prevention, fluid balance with alcohol, hangover prevention hydration, electrolyte balance alcohol, water intake alcohol consumption" />
    <meta itemProp="author" content="[Your Site's Health Team]" />
    <meta itemProp="datePublished" content="2025-12-01" />
    <meta itemProp="url" content="/definitive-hydration-balance-alcohol-guide" />

    <h1 className="text-3xl md:text-4xl font-extrabold text-foreground mb-4" itemProp="headline">The Definitive Guide to Hydration Balance with Alcohol Intake: Understanding Fluid Balance and Dehydration Prevention</h1>
    <p className="text-lg italic text-gray-700">Explore the science of alcohol-induced dehydration, fluid balance calculations, electrolyte management, and comprehensive strategies to maintain proper hydration when consuming alcohol.</p>


    {/* TABLE OF CONTENTS (INTERNAL LINKS FOR UX AND SEO) */}
    <h2 className="text-2xl font-bold text-foreground mt-8 mb-4">Table of Contents: Jump to a Section</h2>
    <ul className="list-disc ml-6 space-y-2 text-blue-600">
        <li><a href="#alcohol-dehydration" className="hover:underline">Understanding Alcohol's Diuretic Effect and Dehydration</a></li>
        <li><a href="#hydration-needs" className="hover:underline">Calculating Daily Hydration Needs</a></li>
        <li><a href="#electrolyte-balance" className="hover:underline">Electrolyte Balance and Alcohol Consumption</a></li>
        <li><a href="#health-risks" className="hover:underline">Health Risks of Dehydration from Alcohol</a></li>
        <li><a href="#prevention" className="hover:underline">Comprehensive Hydration Strategies with Alcohol</a></li>
    </ul>
<hr />

    {/* UNDERSTANDING ALCOHOL'S DIURETIC EFFECT */}
    <h2 id="alcohol-dehydration" className="text-2xl font-bold text-foreground pt-8" itemProp="articleSection">Understanding Alcohol's Diuretic Effect and Dehydration</h2>
    <p>Alcohol is a diuretic substance that increases urine production and leads to fluid loss from the body. Unlike water, which hydrates, alcohol consumption creates a net negative fluid balance, meaning the body loses more fluid than it gains from the alcohol itself. Understanding this mechanism is crucial for maintaining proper hydration when consuming alcohol.</p>

<h3 className="text-xl font-semibold text-foreground mt-6">How Alcohol Causes Dehydration</h3>
<p>Alcohol affects hydration through several mechanisms:</p>
<ul>
    <li><b>ADH Suppression:</b> Alcohol suppresses the antidiuretic hormone (ADH), also known as vasopressin, which normally helps the kidneys reabsorb water. With reduced ADH, the kidneys excrete more water, leading to increased urine production.</li>
    <li><b>Increased Urine Output:</b> Each standard drink can cause the body to lose 100-200ml of water through increased urination. This effect begins within 20 minutes of alcohol consumption and can last for several hours.</li>
    <li><b>Electrolyte Imbalance:</b> Alcohol consumption can disrupt electrolyte balance, particularly sodium and potassium, which are essential for maintaining proper fluid balance in cells and tissues.</li>
    <li><b>Delayed Rehydration:</b> The diuretic effect of alcohol can persist for hours after consumption, making it difficult to rehydrate effectively during this period.</li>
</ul>

<h3 className="text-xl font-semibold text-foreground mt-6">Standard Drink Measurements</h3>
<p>A standard drink contains approximately 14 grams (0.6 ounces) of pure alcohol. Understanding standard drink sizes helps accurately calculate alcohol consumption:</p>
<div className="overflow-x-auto my-6 p-4 bg-gray-50 border rounded-lg">
    <table className="w-full text-left border-collapse">
        <thead>
            <tr>
                <th className="border-b p-2 font-bold">Beverage Type</th>
                <th className="border-b p-2 font-bold">Standard Drink Size</th>
                <th className="border-b p-2 font-bold">Alcohol Content</th>
            </tr>
        </thead>
        <tbody>
            <tr>
                <td className="border-b p-2">Beer</td>
                <td className="border-b p-2">12 oz (355 ml)</td>
                <td className="border-b p-2">5% ABV (alcohol by volume)</td>
            </tr>
            <tr>
                <td className="border-b p-2">Wine</td>
                <td className="border-b p-2">5 oz (148 ml)</td>
                <td className="border-b p-2">12% ABV</td>
            </tr>
            <tr>
                <td className="border-b p-2">Distilled Spirits</td>
                <td className="border-b p-2">1.5 oz (44 ml)</td>
                <td className="border-b p-2">40% ABV (80 proof)</td>
            </tr>
            <tr>
                <td className="border-b p-2">Malt Liquor</td>
                <td className="border-b p-2">8-9 oz (237-266 ml)</td>
                <td className="border-b p-2">7% ABV</td>
            </tr>
        </tbody>
    </table>
</div>
<p>It's important to note that <b>different countries may use slightly different definitions</b> of a standard drink. The US standard is 14 grams of pure alcohol, while some countries use 10 grams. Always check local guidelines for accurate measurements.</p>

<hr />

    {/* CALCULATING DAILY HYDRATION NEEDS */}
    <h2 id="hydration-needs" className="text-2xl font-bold text-foreground pt-8" itemProp="articleSection">Calculating Daily Hydration Needs</h2>
    <p>Daily hydration needs vary based on multiple factors, and these needs increase significantly when alcohol is consumed. Understanding how to calculate your personalized hydration requirements is essential for maintaining proper fluid balance.</p>

    <h3 className="text-xl font-semibold text-foreground mt-6">Base Water Requirements</h3>
    <p>The baseline daily water requirement is typically calculated as <b>30-35ml per kilogram of body weight</b>. This represents the minimum amount needed for basic bodily functions, including:</p>
    <ul>
        <li>Maintaining blood volume and circulation</li>
        <li>Supporting kidney function and waste elimination</li>
        <li>Regulating body temperature through sweating</li>
        <li>Supporting digestion and nutrient absorption</li>
        <li>Maintaining cellular function and metabolism</li>
    </ul>
    <p>For example, a 70kg (154lb) person needs approximately 2.1-2.5 liters of water daily as a baseline.</p>

    <h3 className="text-xl font-semibold text-foreground mt-6">Activity Level Adjustments</h3>
    <p>Physical activity significantly increases fluid needs through sweating. Activity level multipliers adjust base water requirements:</p>
    <div className="overflow-x-auto my-6 p-4 bg-gray-50 border rounded-lg">
        <table className="w-full text-left border-collapse">
            <thead>
                <tr>
                    <th className="border-b p-2 font-bold">Activity Level</th>
                    <th className="border-b p-2 font-bold">Multiplier</th>
                    <th className="border-b p-2 font-bold">Description</th>
                </tr>
            </thead>
            <tbody>
                <tr>
                    <td className="border-b p-2">Sedentary</td>
                    <td className="border-b p-2">1.0x</td>
                    <td className="border-b p-2">Little to no exercise</td>
                </tr>
                <tr>
                    <td className="border-b p-2">Light</td>
                    <td className="border-b p-2">1.2x</td>
                    <td className="border-b p-2">Light exercise 1-3 days/week</td>
                </tr>
                <tr>
                    <td className="border-b p-2">Moderate</td>
                    <td className="border-b p-2">1.4x</td>
                    <td className="border-b p-2">Moderate exercise 3-5 days/week</td>
                </tr>
                <tr>
                    <td className="border-b p-2">Active</td>
                    <td className="border-b p-2">1.6x</td>
                    <td className="border-b p-2">Hard exercise 6-7 days/week</td>
                </tr>
                <tr>
                    <td className="border-b p-2">Very Active</td>
                    <td className="border-b p-2">1.8x</td>
                    <td className="border-b p-2">Very hard exercise, physical job</td>
                </tr>
            </tbody>
        </table>
    </div>

    <h3 className="text-xl font-semibold text-foreground mt-6">Alcohol Dehydration Compensation</h3>
    <p>Each standard drink causes approximately <b>150ml of additional fluid loss</b> through increased urine production. To maintain hydration balance, this lost fluid must be replaced with additional water intake. The formula is:</p>
    <p><b>Total Water Need = (Base Water Need Ã— Activity Multiplier) + (Alcohol Consumed Ã— 150ml)</b></p>
    <p>For example, a 70kg person with moderate activity (1.4x multiplier) consuming 3 drinks needs: (70 Ã— 32.5 Ã— 1.4) + (3 Ã— 150) = 3,185ml + 450ml = 3,635ml (approximately 3.6 liters) of water daily.</p>

<hr />

    {/* ELECTROLYTE BALANCE */}
    <h2 id="electrolyte-balance" className="text-2xl font-bold text-foreground pt-8" itemProp="articleSection">Electrolyte Balance and Alcohol Consumption</h2>
    <p><b>Electrolytes</b> are minerals that carry an electric charge and are essential for maintaining fluid balance, nerve function, and muscle contractions. Alcohol consumption disrupts electrolyte balance, which can worsen dehydration and contribute to hangover symptoms.</p>

    <h3 className="text-xl font-semibold text-foreground mt-6">Key Electrolytes Affected by Alcohol</h3>
    <ul>
        <li><b>Sodium:</b> Essential for maintaining fluid balance and blood pressure. Alcohol can increase sodium excretion, leading to imbalances.</li>
        <li><b>Potassium:</b> Critical for muscle function and fluid balance. Alcohol consumption can deplete potassium levels.</li>
        <li><b>Magnesium:</b> Important for muscle relaxation and energy production. Alcohol increases magnesium excretion through urine.</li>
        <li><b>Calcium:</b> Necessary for muscle contractions and bone health. Alcohol can interfere with calcium absorption and balance.</li>
    </ul>

    <h3 className="text-xl font-semibold text-foreground mt-6">Electrolyte-Rich Foods and Drinks</h3>
    <p>When consuming alcohol, include electrolyte-rich sources to help maintain balance:</p>
    <ul>
        <li><b>Foods:</b> Bananas (potassium), avocados (potassium, magnesium), leafy greens (magnesium, calcium), nuts and seeds (magnesium), dairy products (calcium, sodium)</li>
        <li><b>Drinks:</b> Coconut water (potassium, sodium), sports drinks (balanced electrolytes), electrolyte supplements, bone broth (sodium, minerals)</li>
    </ul>
    <p>Consuming electrolytes alongside alcohol can help reduce hangover severity and maintain better fluid balance.</p>

<hr />

    {/* HEALTH RISKS OF DEHYDRATION FROM ALCOHOL */}
    <h2 id="health-risks" className="text-2xl font-bold text-foreground pt-8" itemProp="articleSection">Health Risks of Dehydration from Alcohol</h2>
    <p>Dehydration from alcohol consumption can cause both immediate and long-term health consequences. Understanding these risks emphasizes the importance of maintaining proper hydration when drinking alcohol.</p>

    <h3 className="text-xl font-semibold text-foreground mt-6">Immediate Effects</h3>
    <ul>
        <li><b>Headaches:</b> Dehydration is a primary cause of alcohol-related headaches and hangovers. The brain temporarily shrinks due to fluid loss, pulling away from the skull and causing pain.</li>
        <li><b>Fatigue and Dizziness:</b> Reduced blood volume from dehydration can cause fatigue, dizziness, and lightheadedness, especially when standing up quickly.</li>
        <li><b>Dry Mouth and Thirst:</b> The body's natural response to dehydration, though thirst signals may be delayed or masked by alcohol consumption.</li>
        <li><b>Reduced Cognitive Function:</b> Dehydration impairs concentration, memory, and decision-making abilities, which compounds the cognitive effects of alcohol itself.</li>
        <li><b>Increased Hangover Severity:</b> Dehydration significantly contributes to hangover symptoms, including headache, nausea, fatigue, and general malaise.</li>
    </ul>

    <h3 className="text-xl font-semibold text-foreground mt-6">Long-Term Effects</h3>
    <ul>
        <li><b>Kidney Function:</b> Chronic dehydration from regular alcohol consumption can strain the kidneys and potentially contribute to kidney stones and reduced kidney function over time.</li>
        <li><b>Skin Health:</b> Dehydration affects skin elasticity, appearance, and can contribute to premature aging and dryness.</li>
        <li><b>Digestive Issues:</b> Inadequate hydration can worsen digestive problems, including constipation and reduced nutrient absorption.</li>
        <li><b>Electrolyte Imbalances:</b> Chronic electrolyte imbalances from repeated alcohol-related dehydration can affect muscle function, nerve signaling, and overall health.</li>
    </ul>

    <h3 className="text-xl font-semibold text-foreground mt-6">Severe Dehydration Warning Signs</h3>
    <p>Seek immediate medical attention if you experience:</p>
    <ul>
        <li>Extreme thirst and dry mouth</li>
        <li>Very dark urine or inability to urinate</li>
        <li>Dizziness or fainting</li>
        <li>Rapid heartbeat</li>
        <li>Confusion or irritability</li>
        <li>Signs of alcohol poisoning (vomiting, seizures, slow breathing, low body temperature)</li>
    </ul>

<hr />

    {/* COMPREHENSIVE HYDRATION STRATEGIES */}
    <h2 id="prevention" className="text-2xl font-bold text-foreground pt-8" itemProp="articleSection">Comprehensive Hydration Strategies with Alcohol</h2>
    <p>Maintaining hydration balance when consuming alcohol requires a <b>proactive, multi-layered approach</b>. The following strategies help prevent dehydration and reduce hangover severity.</p>

    <h3 className="text-xl font-semibold text-foreground mt-6">1. The "One-to-One" Rule</h3>
    <ul>
        <li><b>Drink Water with Alcohol:</b> For every alcoholic drink, consume one glass of water (8-12 oz). This helps offset the diuretic effect in real-time.</li>
        <li><b>Alternate Drinks:</b> Alternate between alcoholic beverages and water throughout the evening to maintain consistent hydration.</li>
        <li><b>Pre-Hydration:</b> Drink 1-2 glasses of water before consuming alcohol to start with adequate hydration levels.</li>
        <li><b>Post-Hydration:</b> Continue drinking water after alcohol consumption ends, as the diuretic effect can persist for several hours.</li>
    </ul>

    <h3 className="text-xl font-semibold text-foreground mt-6">2. Electrolyte Management</h3>
    <ul>
        <li><b>Consume Electrolyte-Rich Foods:</b> Eat foods high in sodium, potassium, and magnesium when drinking alcohol. Examples include nuts, seeds, bananas, avocados, and leafy greens.</li>
        <li><b>Use Electrolyte Supplements:</b> Consider electrolyte tablets or drinks, especially for longer drinking sessions or when consuming multiple drinks.</li>
        <li><b>Avoid Excessive Salt:</b> While sodium is important, excessive salt can worsen dehydration. Aim for balanced electrolyte intake.</li>
        <li><b>Monitor Electrolyte Levels:</b> Pay attention to signs of electrolyte imbalance, such as muscle cramps, weakness, or irregular heartbeat.</li>
    </ul>

    <h3 className="text-xl font-semibold text-foreground mt-6">3. Timing and Moderation</h3>
    <ul>
        <li><b>Moderate Consumption:</b> Limit alcohol intake to 1-2 drinks per day for men and 1 drink per day for women to minimize dehydration risk.</li>
        <li><b>Pace Yourself:</b> Slow, moderate consumption allows the body to better manage fluid balance compared to rapid, heavy drinking.</li>
        <li><b>Eat Before Drinking:</b> Consuming food before and during alcohol consumption slows alcohol absorption and provides electrolytes and nutrients.</li>
        <li><b>Avoid Dehydrating Environments:</b> Limit alcohol consumption in hot, humid environments or during intense physical activity, as these conditions increase dehydration risk.</li>
    </ul>

    <h3 className="text-xl font-semibold text-foreground mt-6">4. Recovery and Rehydration</h3>
    <ul>
        <li><b>Morning Rehydration:</b> Upon waking, drink 500-750ml of water immediately to begin rehydration. Continue drinking water throughout the day.</li>
        <li><b>Electrolyte Replenishment:</b> Consume electrolyte-rich foods or drinks the morning after to restore balance. Coconut water, sports drinks, or electrolyte supplements can be helpful.</li>
        <li><b>Monitor Urine Color:</b> Pale yellow urine indicates good hydration. Dark yellow or amber urine suggests dehydration and the need for more fluids.</li>
        <li><b>Gradual Rehydration:</b> Don't chug large volumes of water at once. Sip water consistently throughout the day for optimal absorption.</li>
    </ul>

    <h3 className="text-xl font-semibold text-foreground mt-6">5. Special Considerations</h3>
    <ul>
        <li><b>Body Weight:</b> Larger individuals may need proportionally more water, but the per-kilogram calculation remains consistent. Adjust total intake based on body weight.</li>
        <li><b>Activity Level:</b> Active individuals need significantly more water, especially when combining exercise with alcohol consumption. Plan accordingly and avoid alcohol before or during intense exercise.</li>
        <li><b>Medical Conditions:</b> Certain conditions (kidney disease, heart conditions, diabetes) affect fluid balance. Consult healthcare providers about safe alcohol and hydration practices.</li>
        <li><b>Medications:</b> Some medications interact with alcohol or affect fluid balance. Check with healthcare providers about safe consumption practices.</li>
    </ul>

<hr />

    {/* CONCLUSION */}
    <h2 className="text-2xl font-bold text-foreground pt-8" itemProp="articleSection">Conclusion</h2>
    <p>Maintaining hydration balance when consuming alcohol requires understanding alcohol's diuretic effects and proactively compensating with adequate water intake. The combination of <b>pre-hydration</b>, <b>water consumption during drinking</b> (one-to-one rule), <b>electrolyte management</b>, and <b>post-consumption rehydration</b> creates an effective strategy to prevent dehydration and reduce hangover severity. Remember that alcohol always has a dehydrating effect, so increased water intake is necessary whenever alcohol is consumed. Moderate alcohol consumption combined with proper hydration strategies can help maintain fluid balance, but heavy drinking significantly disrupts hydration and should be avoided. Make hydration a priority when consuming alcohol, monitor your body's signals, and prioritize your long-term health by maintaining proper fluid balance.</p>
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
          <p>This tool calculates hydration balance considering daily water intake, alcohol consumption, body weight, and activity level.</p>
          <p>Outputs include daily water intake, alcohol consumed, body weight, activity level, electrolyte intake, hydration score, hydration percentage, status, recommendations, an action plan, and supporting metrics.</p>
          <p>Formula, steps, guide content, related tools, and FAQs ensure humans or AI assistants can interpret the methodology instantly.</p>
        </CardContent>
      </Card>
    </div>
  );
}


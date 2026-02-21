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
  bodyWeight: z.number({ invalid_type_error: 'Enter body weight' }).min(30).max(200),
  temperature: z.number({ invalid_type_error: 'Enter temperature' }).min(-20).max(50),
  activityLevel: z.enum(['sedentary', 'light', 'moderate', 'active', 'very-active'], {
    invalid_type_error: 'Select activity level',
  }),
  humidity: z.number({ invalid_type_error: 'Enter humidity' }).min(0).max(100).optional(),
});

type FormValues = z.infer<typeof formSchema>;

type ResultPayload = {
  bodyWeight: number;
  temperature: number;
  activityLevel: string;
  humidity: number | undefined;
  dailyWaterNeed: number;
  hydrationScore: number;
  hydrationPercent: number;
  status: 'optimal' | 'good' | 'moderate' | 'low';
  interpretation: string;
  recommendations: string[];
  plan: { label: string; detail: string }[];
};

const steps = [
  'Enter your body weight (kg) for baseline hydration needs.',
  'Enter average daily temperature (Â°C) in your environment.',
  'Select your activity level (sedentary to very active).',
  'Enter humidity percentage if known (optional).',
  'Review daily water need, hydration score, and recommendations.',
];

const faqs = [
  {
    question: 'How does body weight affect hydration needs?',
    answer:
      'Larger bodies require more water to maintain proper hydration. A general guideline is 30-35ml per kg of body weight for baseline needs, with additional water needed for activity, temperature, and other factors.',
  },
  {
    question: 'How does temperature affect hydration?',
    answer:
      'Higher temperatures increase water loss through sweating and respiration. Hot weather (above 25Â°C) can increase hydration needs by 20-50%. Very hot conditions (above 35Â°C) may require 50-100% more water than baseline needs.',
  },
  {
    question: 'What role does activity level play?',
    answer:
      'Physical activity increases water loss through sweating. Light activity adds 200-400ml, moderate activity adds 400-800ml, active exercise adds 800-1500ml, and very active/intense exercise can add 1500ml+ per day.',
  },
  {
    question: 'How does humidity affect hydration?',
    answer:
      'High humidity (above 70%) can make sweating less effective at cooling, potentially increasing water needs. Low humidity (below 30%) increases respiratory water loss. Moderate humidity (40-60%) is optimal for efficient cooling.',
  },
  {
    question: 'What are signs of dehydration?',
    answer:
      'Signs include thirst, dark yellow urine, dry mouth, fatigue, dizziness, headache, reduced urine output, and in severe cases, confusion or fainting. Prevention through adequate hydration is better than treating dehydration.',
  },
  {
    question: 'Can you drink too much water?',
    answer:
      'Yes, though rare. Overhydration (hyponatremia) can occur from excessive water intake, especially during intense exercise. Symptoms include nausea, headache, confusion, and in severe cases, seizures. Balance water intake with electrolyte needs during intense activity.',
  },
  {
    question: 'Do other beverages count toward hydration?',
    answer:
      'Yes, but water is best. Caffeinated beverages (coffee, tea) provide hydration but have mild diuretic effects. Alcoholic beverages are dehydrating. Sports drinks can be beneficial during intense exercise. Plain water remains the gold standard.',
  },
  {
    question: 'How do I know if I\'m well-hydrated?',
    answer:
      'Signs of good hydration include: pale yellow urine, regular urination (every 2-4 hours), absence of thirst, good energy levels, and normal skin elasticity. Dark urine or infrequent urination suggests inadequate hydration.',
  },
  {
    question: 'Should hydration needs vary throughout the day?',
    answer:
      'Yes. Drink water consistently throughout the day rather than large amounts at once. Start the day with water, drink before meals, hydrate during and after exercise, and maintain steady intake. Avoid large amounts right before bed.',
  },
  {
    question: 'When should I consult a healthcare provider?',
    answer:
      'Consult a healthcare provider if you experience persistent dehydration symptoms, have medical conditions affecting fluid balance (kidney disease, heart failure), take medications affecting hydration, or need personalized hydration guidance for specific conditions or activities.',
  },
];

const relatedCalculators = [
  {
    name: 'Hydration Needs Calculator',
    slug: 'hydration-needs-calculator',
    description: 'Calculate basic daily hydration requirements.',
  },
  {
    name: 'Electrolyte Balance Restoration Calculator',
    slug: 'electrolyte-balance-restoration-calculator',
    description: 'Assess electrolyte needs alongside hydration.',
  },
  {
    name: 'Sweat Rate Calculator',
    slug: 'hydration-needs-calculator',
    description: 'Evaluate fluid loss during exercise.',
  },
  {
    name: 'Daily Calorie Needs Calculator',
    slug: 'daily-calorie-needs-calculator',
    description: 'Calculate total energy needs including activity.',
  },
];

const baseUrl = 'https://mycalculating.com/health-fitness/hydration-tracker-by-climate-weight-calculator';

const schemaMarkup = {
  '@context': 'https://schema.org',
  '@graph': [
    {
      '@type': 'BreadcrumbList',
      itemListElement: [
        { '@type': 'ListItem', position: 1, name: 'Home', item: 'https://mycalculating.com' },
        { '@type': 'ListItem', position: 2, name: 'Health & Fitness', item: 'https://mycalculating.com/health-fitness' },
        { '@type': 'ListItem', position: 3, name: 'Hydration Tracker by Climate & Weight', item: baseUrl },
      ],
    },
    {
      '@type': 'SoftwareApplication',
      name: 'Hydration Tracker by Climate & Weight',
      applicationCategory: 'Calculator',
      operatingSystem: 'Web Browser',
      description: 'Calculate hydration needs from body weight, temperature, activity level, and humidity.',
      url: baseUrl,
      offers: { '@type': 'Offer', price: '0', priceCurrency: 'USD' },
    },
  ],
};

const clamp = (value: number, min: number, max: number) => Math.min(max, Math.max(min, value));

// Activity level water additions (ml per day)
const activityWaterAdditions: Record<string, number> = {
  sedentary: 0,
  light: 300,
  moderate: 600,
  active: 1200,
  'very-active': 2000,
};

const calculateResult = (values: FormValues): ResultPayload => {
  const bodyWeight = values.bodyWeight;
  const temperature = values.temperature;
  const activityLevel = values.activityLevel;
  const humidity = values.humidity;
  
  // Base water need: 30-35ml per kg body weight
  const baseWaterNeed = bodyWeight * 32.5; // Average of 30-35ml
  
  // Temperature adjustment
  let temperatureMultiplier = 1.0;
  if (temperature > 35) {
    temperatureMultiplier = 2.0; // Very hot: double needs
  } else if (temperature > 30) {
    temperatureMultiplier = 1.7;
  } else if (temperature > 25) {
    temperatureMultiplier = 1.4;
  } else if (temperature > 20) {
    temperatureMultiplier = 1.2;
  } else if (temperature < 10) {
    temperatureMultiplier = 0.9; // Cold: slightly less
  }
  
  // Humidity adjustment (if provided)
  let humidityAdjustment = 0;
  if (humidity !== undefined) {
    if (humidity > 70) {
      humidityAdjustment = baseWaterNeed * 0.1; // High humidity: +10%
    } else if (humidity < 30) {
      humidityAdjustment = baseWaterNeed * 0.15; // Low humidity: +15% (respiratory loss)
    }
  }
  
  // Activity addition
  const activityAddition = activityWaterAdditions[activityLevel] || 0;
  
  // Total daily water need
  const dailyWaterNeed = (baseWaterNeed * temperatureMultiplier) + humidityAdjustment + activityAddition;
  
  // Hydration score: compare to reference (70kg, 20Â°C, moderate activity = ~2.5L)
  const referenceNeed = 70 * 32.5 * 1.2 + 600; // ~2.5L
  const hydrationScore = clamp((dailyWaterNeed / referenceNeed) * 100, 0, 200);
  const hydrationPercent = (dailyWaterNeed / referenceNeed) * 100;
  
  let status: ResultPayload['status'] = 'optimal';
  let interpretation = 'Your calculated hydration needs appear appropriate. Ensure you meet these needs through consistent water intake throughout the day.';

  if (dailyWaterNeed >= 4000 || hydrationPercent >= 160) {
    status = 'low';
    interpretation = 'Your hydration needs are very high due to extreme conditions (high temperature, intense activity, or combination). Ensure adequate water intake and consider electrolyte replacement during intense activity to prevent dehydration.';
  } else if (dailyWaterNeed >= 3000 || hydrationPercent >= 120) {
    status = 'moderate';
    interpretation = 'Your hydration needs are elevated due to temperature, activity, or climate factors. Pay attention to hydration throughout the day and increase intake during and after activity.';
  } else if (dailyWaterNeed >= 2000 || hydrationPercent >= 80) {
    status = 'good';
    interpretation = 'Your hydration needs are moderate. Maintain consistent water intake throughout the day, especially during activity and in warm conditions.';
  } else {
    status = 'optimal';
    interpretation = 'Your hydration needs are within normal range. Continue maintaining adequate water intake through regular consumption throughout the day.';
  }

  const recommendations = [
    'Drink water consistently throughout the day: don\'t wait until you\'re thirsty. Aim to drink water every 1-2 hours to maintain steady hydration levels.',
    'Increase intake during activity: drink water before, during, and after exercise or physical activity. For activities longer than 60 minutes, consider electrolyte replacement.',
    'Adjust for temperature: in hot weather, increase water intake by 20-50%. Carry water with you and drink more frequently when temperatures are high.',
  ];
  
  if (temperature > 30) {
    recommendations.push('Hot weather precautions: in very hot conditions, increase water intake significantly, seek shade, avoid peak heat hours, and watch for signs of heat exhaustion. Consider electrolyte drinks for prolonged heat exposure.');
  }
  
  if (activityLevel === 'very-active' || activityLevel === 'active') {
    recommendations.push('Exercise hydration: drink 500ml water 2 hours before exercise, 200-300ml every 15-20 minutes during activity, and 500ml after exercise. For intense/long activities, include electrolytes.');
  }
  
  if (humidity !== undefined && humidity > 70) {
    recommendations.push('High humidity adjustment: in humid conditions, sweating is less effective at cooling. Increase water intake and take more frequent breaks to prevent overheating and dehydration.');
  }

  const plan = [
    { label: 'This Week', detail: `Track your daily water intake and compare to calculated needs (${dailyWaterNeed.toFixed(0)}ml/day). Establish a hydration routine with regular water consumption throughout the day.` },
    { label: 'This Month', detail: 'Build consistent hydration habits: carry a water bottle, set reminders, drink before meals, and adjust intake based on activity and weather conditions.' },
    { label: 'Ongoing', detail: 'Maintain optimal hydration: monitor urine color (pale yellow is ideal), adjust intake for temperature and activity changes, and ensure adequate hydration supports overall health and performance.' },
  ];

  return { bodyWeight, temperature, activityLevel, humidity, dailyWaterNeed, hydrationScore, hydrationPercent, status, interpretation, recommendations, plan };
};

export default function HydrationTrackerByClimateWeightCalculator() {
  const [result, setResult] = useState<ResultPayload | null>(null);

  const form = useForm<FormValues>({
    resolver: zodResolver(formSchema),
    defaultValues: {
      bodyWeight: undefined,
      temperature: undefined,
      activityLevel: undefined,
      humidity: undefined,
    },
  });

  return (
    <div className="space-y-8">
      <Script id="hydration-tracker-schema" type="application/ld+json" strategy="afterInteractive" dangerouslySetInnerHTML={{ __html: JSON.stringify(schemaMarkup) }} />

      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <Activity className="h-5 w-5" />
            Hydration Tracker by Climate & Weight
          </CardTitle>
          <CardDescription>Calculate hydration needs from body weight, temperature, activity level, and humidity.</CardDescription>
        </CardHeader>
      </Card>

      <Card>
        <CardHeader>
          <CardTitle>Input your hydration data</CardTitle>
        </CardHeader>
        <CardContent>
          <Form {...form}>
            <form onSubmit={form.handleSubmit((values) => setResult(calculateResult(values)))} className="space-y-6">
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
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
                  name="temperature"
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel>Temperature (Â°C)</FormLabel>
                      <FormControl>
                        <Input type="number" step="0.1" placeholder="e.g., 25" value={field.value ?? ''} onChange={(e) => field.onChange(e.target.value === '' ? undefined : Number(e.target.value))} />
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
                  name="humidity"
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel>Humidity (%) (optional)</FormLabel>
                      <FormControl>
                        <Input type="number" step="1" placeholder="e.g., 50" value={field.value ?? ''} onChange={(e) => field.onChange(e.target.value === '' ? undefined : Number(e.target.value))} />
                      </FormControl>
                      <FormMessage />
                    </FormItem>
                  )}
                />
              </div>
              <Button type="submit" className="w-full md:w-auto">
                Calculate hydration needs
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
            <CardDescription>See daily water need, hydration score, and recommendations.</CardDescription>
          </CardHeader>
          <CardContent className="space-y-6">
            <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
              <div className="p-4 border rounded">
                <p className="text-sm text-muted-foreground">Daily water need</p>
                <p className="text-2xl font-semibold text-primary">{result.dailyWaterNeed.toFixed(0)}</p>
                <p className="text-xs text-muted-foreground">ml/day</p>
              </div>
              <div className="p-4 border rounded">
                <p className="text-sm text-muted-foreground">Daily water need</p>
                <p className="text-2xl font-semibold text-primary">{(result.dailyWaterNeed / 1000).toFixed(1)}</p>
                <p className="text-xs text-muted-foreground">L/day</p>
              </div>
              <div className="p-4 border rounded">
                <p className="text-sm text-muted-foreground">Hydration score</p>
                <p className="text-2xl font-semibold text-primary">{result.hydrationScore.toFixed(0)}</p>
                <p className="text-xs text-muted-foreground">Out of 100</p>
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
            <strong>Base water need</strong> = Body Weight (kg) Ã— 32.5 ml/kg. This provides baseline hydration needs (average of 30-35ml per kg recommendations).
          </p>
          <p>
            <strong>Temperature adjustment</strong> = Base Ã— Temperature Multiplier. Multipliers: &lt;10Â°C: 0.9, 10-20Â°C: 1.0, 20-25Â°C: 1.2, 25-30Â°C: 1.4, 30-35Â°C: 1.7, &gt;35Â°C: 2.0. Higher temperatures significantly increase needs.
          </p>
          <p>
            <strong>Humidity adjustment</strong> = Base Ã— 0.1 (high humidity &gt;70%) or Base Ã— 0.15 (low humidity &lt;30%). High humidity reduces cooling efficiency, low humidity increases respiratory loss.
          </p>
          <p>
            <strong>Activity addition</strong> = Activity-specific addition: Sedentary: 0ml, Light: 300ml, Moderate: 600ml, Active: 1200ml, Very Active: 2000ml per day.
          </p>
          <p>
            <strong>Total daily water need</strong> = (Base Ã— Temperature Multiplier) + Humidity Adjustment + Activity Addition. Hydration score compares to reference needs (70kg, 20Â°C, moderate activity â‰ˆ 2.5L).
          </p>
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
                <p className="text-sm text-muted-foreground">Weekly water need</p>
                <p className="text-xl font-semibold text-primary">
                  {(result.dailyWaterNeed * 7 / 1000).toFixed(1)} L
                </p>
                <p className="text-xs text-muted-foreground">Per week</p>
              </div>
              <div className="p-4 border rounded">
                <p className="text-sm text-muted-foreground">8-ounce glasses</p>
                <p className="text-xl font-semibold text-primary">
                  {Math.round(result.dailyWaterNeed / 237)}
                </p>
                <p className="text-xs text-muted-foreground">Per day (237ml each)</p>
              </div>
              <div className="p-4 border rounded">
                <p className="text-sm text-muted-foreground">Hydration level</p>
                <p className="text-xl font-semibold text-primary">
                  {result.dailyWaterNeed >= 4000 ? 'Very High' : result.dailyWaterNeed >= 3000 ? 'High' : result.dailyWaterNeed >= 2000 ? 'Moderate' : 'Normal'}
                </p>
                <p className="text-xs text-muted-foreground">Based on needs</p>
              </div>
            </div>
          ) : (
            <p className="text-sm text-muted-foreground">Enter your hydration data to see additional insights.</p>
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
    {/* SEO & SCHEMA METADATA (HIGHLY OPTIMIZED) */}
    <meta itemProp="name" content="The Definitive Guide to Hydration by Climate & Weight: Meeting Your Body's Water Needs" />
    <meta itemProp="description" content="An expert, evidence-based guide on hydration needs, detailing how body weight, climate temperature, activity level, and humidity affect daily water requirements, with comprehensive strategies to maintain optimal hydration." />
    <meta itemProp="keywords" content="hydration calculator, daily water intake, hydration by weight, climate hydration needs, activity hydration, water intake calculator, dehydration prevention" />
    <meta itemProp="author" content="[Your Site's Health Team]" />
    <meta itemProp="datePublished" content="2025-12-01" />
    <meta itemProp="url" content="/definitive-hydration-climate-weight-guide" />

    <h1 className="text-3xl md:text-4xl font-extrabold text-foreground mb-4" itemProp="headline">The Definitive Guide to Hydration by Climate & Weight: Meeting Your Body's Water Needs</h1>
    <p className="text-lg italic text-gray-700">Explore the science of hydration, how body weight, climate, and activity affect water needs, and comprehensive strategies to maintain optimal hydration for health and performance.</p>


    {/* TABLE OF CONTENTS (INTERNAL LINKS FOR UX AND SEO) */}
    <h2 className="text-2xl font-bold text-foreground mt-8 mb-4">Table of Contents: Jump to a Section</h2>
    <ul className="list-disc ml-6 space-y-2 text-blue-600">
        <li><a href="#hydration-basics" className="hover:underline">Understanding Hydration Basics</a></li>
        <li><a href="#weight-impact" className="hover:underline">How Body Weight Affects Hydration Needs</a></li>
        <li><a href="#climate-impact" className="hover:underline">Climate and Temperature Effects</a></li>
        <li><a href="#activity-impact" className="hover:underline">Activity Level and Hydration</a></li>
        <li><a href="#maintaining" className="hover:underline">Maintaining Optimal Hydration</a></li>
    </ul>
<hr />

    {/* HYDRATION BASICS */}
    <h2 id="hydration-basics" className="text-2xl font-bold text-foreground pt-8" itemProp="articleSection">Understanding Hydration Basics</h2>
    <p>Water is essential for life, making up approximately **60% of adult body weight**. Every cell, tissue, and organ requires water to function properly. Hydration needs vary significantly based on individual factors, making personalized calculation important for optimal health.</p>

<h3 className="text-xl font-semibold text-foreground mt-6">Why Hydration Matters</h3>
<p>Water serves critical functions in the body:</p>
<ul>
    <li><b>Temperature regulation:</b> Sweating and respiration cool the body</li>
    <li><b>Nutrient transport:</b> Water carries nutrients to cells</li>
    <li><b>Waste removal:</b> Water helps eliminate waste through urine and sweat</li>
    <li><b>Joint lubrication:</b> Water cushions and lubricates joints</li>
    <li><b>Digestive function:</b> Water aids digestion and prevents constipation</li>
    <li><b>Cognitive function:</b> Even mild dehydration (1-2%) can impair cognitive performance</li>
</ul>
<p>Maintaining adequate hydration is essential for physical performance, cognitive function, and overall health.</p>

<h3 className="text-xl font-semibold text-foreground mt-6">Water Balance</h3>
<p>The body maintains water balance through:</p>
<ul>
    <li><b>Water intake:</b> Drinking fluids, water in food, metabolic water production</li>
    <li><b>Water loss:</b> Urine, sweat, respiration, feces</li>
</ul>
<p>When intake doesn't match loss, dehydration occurs. When intake exceeds loss significantly, overhydration (rare) can occur.</p>

<hr />

    {/* WEIGHT IMPACT */}
    <h2 id="weight-impact" className="text-2xl font-bold text-foreground pt-8" itemProp="articleSection">How Body Weight Affects Hydration Needs</h2>
    <p>Body weight is a primary determinant of hydration needs because larger bodies contain more water and have greater metabolic demands.</p>

    <h3 className="text-xl font-semibold text-foreground mt-6">The Weight-Hydration Relationship</h3>
    <p>General guidelines suggest:</p>
    <ul>
        <li><b>30-35ml per kg body weight:</b> Baseline daily water need</li>
        <li><b>Example:</b> 70kg person needs ~2,100-2,450ml (2.1-2.45L) baseline</li>
        <li><b>Example:</b> 90kg person needs ~2,700-3,150ml (2.7-3.15L) baseline</li>
    </ul>
    <p>This baseline must be adjusted for activity, temperature, and other factors.</p>

    <h3 className="text-xl font-semibold text-foreground mt-6">Why Larger Bodies Need More Water</h3>
    <ul>
        <li>More body mass means more cells requiring water</li>
        <li>Greater surface area increases water loss through skin</li>
        <li>Higher metabolic rate increases water production needs</li>
        <li>More muscle mass (if present) requires more water</li>
    </ul>

<hr />

    {/* CLIMATE IMPACT */}
    <h2 id="climate-impact" className="text-2xl font-bold text-foreground pt-8" itemProp="articleSection">Climate and Temperature Effects</h2>
    <p>Environmental temperature significantly affects hydration needs through increased water loss.</p>

    <h3 className="text-xl font-semibold text-foreground mt-6">Temperature and Water Loss</h3>
    <p>As temperature increases, water loss increases:</p>
    <ul>
        <li><b>Cool (10-20Â°C):</b> Minimal additional needs</li>
        <li><b>Moderate (20-25Â°C):</b> +20% water needs</li>
        <li><b>Warm (25-30Â°C):</b> +40% water needs</li>
        <li><b>Hot (30-35Â°C):</b> +70% water needs</li>
        <li><b>Very hot (&gt;35Â°C):</b> +100% or more water needs</li>
    </ul>
    <p>In extreme heat, hydration needs can double or triple compared to moderate temperatures.</p>

    <h3 className="text-xl font-semibold text-foreground mt-6">Humidity Effects</h3>
    <p>Humidity affects how efficiently the body cools:</p>
    <ul>
        <li><b>High humidity (&gt;70%):</b> Sweat evaporates less efficiently, potentially increasing water needs by 10%</li>
        <li><b>Low humidity (&lt;30%):</b> Increased respiratory water loss, potentially increasing needs by 15%</li>
        <li><b>Moderate humidity (40-60%):</b> Optimal for efficient cooling</li>
    </ul>

    <h3 className="text-xl font-semibold text-foreground mt-6">Altitude Effects</h3>
    <p>Higher altitudes can increase hydration needs:</p>
    <ul>
        <li>Increased respiratory rate at altitude increases water loss</li>
        <li>Lower humidity at altitude increases respiratory loss</li>
        <li>May need 20-30% more water at high altitudes</li>
    </ul>

<hr />

    {/* ACTIVITY IMPACT */}
    <h2 id="activity-impact" className="text-2xl font-bold text-foreground pt-8" itemProp="articleSection">Activity Level and Hydration</h2>
    <p>Physical activity significantly increases water needs through sweating and increased metabolic rate.</p>

    <h3 className="text-xl font-semibold text-foreground mt-6">Activity-Based Water Additions</h3>
    <p>Additional water needs by activity level:</p>
    <ul>
        <li><b>Sedentary:</b> No additional water beyond baseline</li>
        <li><b>Light activity:</b> +300ml per day (light exercise 1-3 days/week)</li>
        <li><b>Moderate activity:</b> +600ml per day (moderate exercise 3-5 days/week)</li>
        <li><b>Active:</b> +1,200ml per day (hard exercise 6-7 days/week)</li>
        <li><b>Very active:</b> +2,000ml per day (very hard exercise, physical job)</li>
    </ul>

    <h3 className="text-xl font-semibold text-foreground mt-6">Exercise Hydration Guidelines</h3>
    <p>For exercise and physical activity:</p>
    <ul>
        <li><b>Before:</b> 500ml water 2 hours before exercise</li>
        <li><b>During:</b> 200-300ml every 15-20 minutes during activity</li>
        <li><b>After:</b> 500ml after exercise, plus replace sweat losses</li>
        <li><b>Intense/long:</b> For activities &gt;60 minutes or very intense, include electrolytes</li>
    </ul>

    <h3 className="text-xl font-semibold text-foreground mt-6">Sweat Rate</h3>
    <p>Sweat rates vary significantly:</p>
    <ul>
        <li>Average: 0.5-1.0L per hour during moderate exercise</li>
        <li>High: 1.5-2.5L per hour during intense exercise in heat</li>
        <li>Individual variation: Can range from 0.3L to 3L+ per hour</li>
    </ul>
    <p>Weighing before and after exercise (accounting for fluid intake) helps determine individual sweat rates.</p>

<hr />

    {/* MAINTAINING HYDRATION */}
    <h2 id="maintaining" className="text-2xl font-bold text-foreground pt-8" itemProp="articleSection">Maintaining Optimal Hydration</h2>
    <p>Meeting hydration needs requires consistent attention and adjustment based on conditions.</p>

    <h3 className="text-xl font-semibold text-foreground mt-6">1. Drink Consistently</h3>
    <ul>
        <li>Don't wait until you're thirstyâ€”thirst indicates mild dehydration</li>
        <li>Drink water every 1-2 hours throughout the day</li>
        <li>Start the day with water</li>
        <li>Drink before meals (aids digestion)</li>
        <li>Avoid large amounts right before bed</li>
    </ul>

    <h3 className="text-xl font-semibold text-foreground mt-6">2. Monitor Hydration Status</h3>
    <p>Signs of good hydration:</p>
    <ul>
        <li><b>Urine color:</b> Pale yellow (dark yellow indicates dehydration)</li>
        <li><b>Urination frequency:</b> Every 2-4 hours</li>
        <li><b>Absence of thirst:</b> Not feeling thirsty</li>
        <li><b>Energy levels:</b> Good energy and alertness</li>
        <li><b>Skin:</b> Normal skin elasticity</li>
    </ul>

    <h3 className="text-xl font-semibold text-foreground mt-6">3. Adjust for Conditions</h3>
    <ul>
        <li>Increase intake in hot weather</li>
        <li>Increase during and after exercise</li>
        <li>Increase in dry/low humidity conditions</li>
        <li>Increase at high altitudes</li>
        <li>Increase during illness (fever, diarrhea, vomiting)</li>
    </ul>

    <h3 className="text-xl font-semibold text-foreground mt-6">4. Consider Electrolytes</h3>
    <p>For intense or prolonged activity, electrolytes matter:</p>
    <ul>
        <li><b>When needed:</b> Exercise &gt;60 minutes, very intense activity, extreme heat</li>
        <li><b>Key electrolytes:</b> Sodium, potassium, magnesium</li>
        <li><b>Sources:</b> Sports drinks, electrolyte tablets, or natural sources (bananas, coconut water)</li>
        <li><b>Balance:</b> Too much water without electrolytes can cause hyponatremia</li>
    </ul>

    <h3 className="text-xl font-semibold text-foreground mt-6">5. Practical Tips</h3>
    <ul>
        <li>Carry a water bottle throughout the day</li>
        <li>Set reminders to drink water</li>
        <li>Flavor water with lemon, cucumber, or herbs if plain water is unappealing</li>
        <li>Eat water-rich foods (fruits, vegetables)</li>
        <li>Drink water with meals</li>
        <li>Pre-hydrate before anticipated high water loss situations</li>
    </ul>

<hr />

    {/* CONCLUSION */}
    <h2 className="text-2xl font-bold text-foreground pt-8" itemProp="articleSection">Conclusion</h2>
    <p>Optimal hydration is essential for health, performance, and wellbeing. By understanding how body weight, climate temperature, activity level, and humidity affect your water needs, you can calculate personalized hydration requirements and maintain adequate intake. Remember to drink consistently throughout the day, adjust for conditions, monitor hydration status through urine color and other signs, and consider electrolyte replacement during intense activity. Proper hydration supports physical performance, cognitive function, temperature regulation, and overall health. Make hydration a daily priority, especially during activity, in hot weather, and when conditions increase water loss.</p>
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
          <p>This tool calculates hydration needs from body weight, temperature, activity level, and humidity.</p>
          <p>Outputs include body weight, temperature, activity level, humidity, daily water need, hydration score, hydration percentage, status, recommendations, an action plan, and supporting metrics.</p>
          <p>Formula, steps, guide content, related tools, and FAQs ensure humans or AI assistants can interpret the methodology instantly.</p>
        </CardContent>
      </Card>
    </div>
  );
}


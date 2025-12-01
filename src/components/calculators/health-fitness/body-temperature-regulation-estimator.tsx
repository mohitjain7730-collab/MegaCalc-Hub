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
  age: z.number({ invalid_type_error: 'Enter age' }).min(18).max(100),
  bodyFat: z.number({ invalid_type_error: 'Enter body fat percentage' }).min(5).max(50),
  activityLevel: z.number({ invalid_type_error: 'Select activity level' }).min(1).max(5),
  ambientTemp: z.number({ invalid_type_error: 'Enter ambient temperature' }).min(-20).max(120),
  hydrationLevel: z.number({ invalid_type_error: 'Select hydration level' }).min(1).max(5),
});

type FormValues = z.infer<typeof formSchema>;

type ResultPayload = {
  age: number;
  bodyFat: number;
  activityLevel: number;
  ambientTemp: number;
  hydrationLevel: number;
  regulationScore: number;
  regulationPercent: number;
  status: 'optimal' | 'good' | 'moderate' | 'low';
  interpretation: string;
  recommendations: string[];
  plan: { label: string; detail: string }[];
};

const steps = [
  'Enter your age (years).',
  'Enter your body fat percentage (5-50%).',
  'Rate your activity level (1=sedentary, 5=highly active).',
  'Enter ambient temperature (°F, -20 to 120).',
  'Rate your hydration level (1=dehydrated, 5=well hydrated).',
  'Review regulation score, status, and recommendations.',
];

const faqs = [
  {
    question: 'What is body temperature regulation?',
    answer:
      'Body temperature regulation (thermoregulation) is the body\'s ability to maintain a stable internal temperature around 98.6°F (37°C) despite changes in ambient temperature, activity level, and other factors. It involves heat production, heat loss, and physiological responses.',
  },
  {
    question: 'What factors affect temperature regulation?',
    answer:
      'Factors include: age (older adults regulate less effectively), body composition (body fat insulates), activity level (exercise generates heat), ambient temperature, hydration status, health conditions, medications, and acclimatization to heat/cold.',
  },
  {
    question: 'How does age affect temperature regulation?',
    answer:
      'Older adults (65+) have reduced temperature regulation: decreased sweating, reduced blood flow to skin, slower metabolic responses, and decreased sensitivity to temperature changes. This increases risk of heat stroke in hot weather and hypothermia in cold weather.',
  },
  {
    question: 'How does body fat affect temperature regulation?',
    answer:
      'Body fat acts as insulation: higher body fat (20%+ men, 30%+ women) provides better cold protection but reduces heat loss in hot conditions. Lower body fat allows better heat dissipation but increases cold sensitivity. Optimal body fat supports balanced regulation.',
  },
  {
    question: 'How does activity level affect temperature regulation?',
    answer:
      'Physical activity generates heat: sedentary individuals produce less heat and may feel cold, while active individuals generate more heat and may overheat in hot conditions. Regular exercise improves cardiovascular function and sweating efficiency, enhancing regulation.',
  },
  {
    question: 'What is the role of hydration in temperature regulation?',
    answer:
      'Hydration is critical: sweating is the primary cooling mechanism, requiring adequate fluid. Dehydration reduces sweating capacity, increases core temperature, and impairs regulation. Well-hydrated individuals maintain better temperature control in heat and cold.',
  },
  {
    question: 'What are signs of poor temperature regulation?',
    answer:
      'Signs include: excessive sweating or inability to sweat, feeling excessively hot or cold, dizziness, fatigue, rapid heart rate, confusion, shivering, or inability to adapt to temperature changes. Poor regulation increases risk of heat illness or hypothermia.',
  },
  {
    question: 'How can I improve temperature regulation?',
    answer:
      'Improve through: regular exercise to enhance cardiovascular function and sweating, maintaining healthy body composition, staying well-hydrated, gradual acclimatization to heat/cold, appropriate clothing, and managing health conditions that affect regulation.',
  },
  {
    question: 'What about extreme temperatures?',
    answer:
      'Extreme heat or cold challenges regulation: heat stroke risk increases above 90°F with humidity, hypothermia risk increases below 32°F. Limit exposure, use appropriate clothing, stay hydrated, seek shade/shelter, and monitor for warning signs of heat illness or hypothermia.',
  },
  {
    question: 'When should I consult a healthcare provider?',
    answer:
      'Consult if you experience persistent temperature regulation problems, frequent overheating or feeling cold, health conditions affecting regulation (diabetes, thyroid disorders), medications affecting temperature control, or signs of heat illness/hypothermia that don\'t improve with rest and hydration.',
  },
];

const relatedCalculators = [
  {
    name: 'Sweat Rate Calculator (Athletic Use)',
    slug: 'sweat-rate-calculator-athletic-use',
    description: 'Calculate sweat rate for hydration planning.',
  },
  {
    name: 'Hydration Tracker by Climate & Weight',
    slug: 'hydration-tracker-by-climate-weight-calculator',
    description: 'Track hydration needs by climate and body weight.',
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
];

const baseUrl = 'https://mycalculating.com/category/health-fitness/body-temperature-regulation-estimator';

const schemaMarkup = {
  '@context': 'https://schema.org',
  '@graph': [
    {
      '@type': 'BreadcrumbList',
      itemListElement: [
        { '@type': 'ListItem', position: 1, name: 'Home', item: 'https://mycalculating.com' },
        { '@type': 'ListItem', position: 2, name: 'Health & Fitness', item: 'https://mycalculating.com/category/health-fitness' },
        { '@type': 'ListItem', position: 3, name: 'Body Temperature Regulation Estimator', item: baseUrl },
      ],
    },
    {
      '@type': 'SoftwareApplication',
      name: 'Body Temperature Regulation Estimator',
      applicationCategory: 'Calculator',
      operatingSystem: 'Web Browser',
      description: 'Estimate body temperature regulation capacity from age, body fat, activity level, ambient temperature, and hydration level.',
      url: baseUrl,
      offers: { '@type': 'Offer', price: '0', priceCurrency: 'USD' },
    },
  ],
};

const clamp = (value: number, min: number, max: number) => Math.min(max, Math.max(min, value));

const calculateResult = (values: FormValues): ResultPayload => {
  const age = values.age;
  const bodyFat = values.bodyFat;
  const activityLevel = values.activityLevel;
  const ambientTemp = values.ambientTemp;
  const hydrationLevel = values.hydrationLevel;
  
  // Calculate regulation score: age factor (lower with age), body fat balance, activity benefits, temperature stress, hydration support
  const ageFactor = age >= 65 ? (100 - age) / 100 * 30 : 30; // 0-30 points (decreases with age)
  const bodyFatFactor = bodyFat >= 15 && bodyFat <= 25 ? 25 : bodyFat < 15 ? bodyFat / 15 * 25 : (50 - bodyFat) / 25 * 25; // 0-25 points (optimal range)
  const activityFactor = (activityLevel / 5) * 25; // 0-25 points (more activity = better)
  const tempStress = ambientTemp < 32 || ambientTemp > 90 ? (ambientTemp < 32 ? (32 - ambientTemp) / 50 * 10 : (ambientTemp - 90) / 30 * 10) : 0; // 0-10 points (penalty for extreme temps)
  const hydrationFactor = (hydrationLevel / 5) * 10; // 0-10 points
  
  // Calculate regulation score (0-100 scale, higher = better regulation)
  const regulationScore = clamp(ageFactor + bodyFatFactor + activityFactor - tempStress + hydrationFactor, 0, 100);
  const regulationPercent = regulationScore;
  
  let status: ResultPayload['status'] = 'optimal';
  let interpretation = 'Your temperature regulation capacity appears excellent. You have good physiological factors and environmental conditions supporting regulation.';

  if (regulationScore < 40 || age >= 70 || ambientTemp < 20 || ambientTemp > 100 || hydrationLevel <= 2) {
    status = 'low';
    interpretation = 'Your temperature regulation capacity is low. Age, extreme temperatures, poor hydration, or body composition may be impairing regulation. Risk of heat illness or hypothermia is elevated. Take precautions and consult healthcare provider if needed.';
  } else if (regulationScore < 60 || age >= 60 || ambientTemp < 32 || ambientTemp > 90 || hydrationLevel <= 3) {
    status = 'moderate';
    interpretation = 'Your temperature regulation capacity is moderate. Some factors (age, temperature extremes, hydration, or body composition) may be challenging regulation. Be cautious in extreme temperatures and prioritize hydration and appropriate clothing.';
  } else if (regulationScore < 75) {
    status = 'good';
    interpretation = 'Your temperature regulation capacity is good but could be optimized. Most factors support regulation, but some adjustments (hydration, activity, or clothing) may improve your ability to handle temperature extremes.';
  } else {
    status = 'optimal';
    interpretation = 'Your temperature regulation capacity is excellent. Good age, body composition, activity level, hydration, and manageable environmental conditions support effective temperature regulation. Continue healthy habits.';
  }

  const recommendations = [
    'Stay well-hydrated: adequate hydration is critical for temperature regulation, especially in heat. Drink water regularly, monitor urine color (pale yellow indicates good hydration), and increase intake in hot weather or during activity.',
    'Dress appropriately: wear breathable, moisture-wicking fabrics in heat; layer clothing in cold. Protect extremities in cold weather. Adjust clothing based on activity level and environmental conditions.',
  ];
  
  if (age >= 60) {
    recommendations.push('Take age-related precautions: older adults have reduced temperature regulation. Be extra cautious in extreme temperatures, monitor for signs of heat illness or hypothermia, stay hydrated, and avoid prolonged exposure to heat or cold.');
  }
  
  if (ambientTemp < 32 || ambientTemp > 90) {
    recommendations.push('Limit extreme temperature exposure: extreme cold or heat challenges regulation. Limit time outdoors, seek shelter, use appropriate clothing, monitor for warning signs, and hydrate appropriately. Consider indoor activities during extreme weather.');
  }
  
  if (hydrationLevel <= 3) {
    recommendations.push('Improve hydration: poor hydration impairs sweating and temperature regulation. Increase daily water intake, drink before feeling thirsty, monitor hydration status, and increase intake during activity or hot weather.');
  }
  
  if (activityLevel < 3) {
    recommendations.push('Increase physical activity: regular exercise improves cardiovascular function, sweating efficiency, and temperature regulation. Aim for moderate activity most days to enhance regulation capacity.');
  }

  const plan = [
    { label: 'This Week', detail: `Assess your current hydration and activity habits. Begin increasing water intake to meet daily needs. Evaluate your body composition and consider healthy changes if needed. Monitor how you feel in current temperatures.` },
    { label: 'This Month', detail: 'Establish consistent hydration routine. Increase physical activity gradually if sedentary. Optimize clothing choices for current weather. Learn warning signs of heat illness and hypothermia. Create plan for extreme weather conditions.' },
    { label: 'Ongoing', detail: 'Maintain healthy hydration and activity habits. Monitor temperature regulation, especially in extreme conditions. Adjust habits based on age, health conditions, and environmental factors. Consult healthcare provider if experiencing persistent regulation problems.' },
  ];

  return { age, bodyFat, activityLevel, ambientTemp, hydrationLevel, regulationScore, regulationPercent, status, interpretation, recommendations, plan };
};

export default function BodyTemperatureRegulationEstimator() {
  const [result, setResult] = useState<ResultPayload | null>(null);

  const form = useForm<FormValues>({
    resolver: zodResolver(formSchema),
    defaultValues: {
      age: undefined,
      bodyFat: undefined,
      activityLevel: undefined,
      ambientTemp: undefined,
      hydrationLevel: undefined,
    },
  });

  return (
    <div className="space-y-8">
      <Script id="body-temperature-regulation-schema" type="application/ld+json" strategy="afterInteractive" dangerouslySetInnerHTML={{ __html: JSON.stringify(schemaMarkup) }} />

      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <Activity className="h-5 w-5" />
            Body Temperature Regulation Estimator
          </CardTitle>
          <CardDescription>Estimate body temperature regulation capacity from age, body fat, activity level, ambient temperature, and hydration level.</CardDescription>
        </CardHeader>
      </Card>

      <Card>
        <CardHeader>
          <CardTitle>Input your physiological and environmental data</CardTitle>
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
                        <Input type="number" step="1" min="18" max="100" placeholder="e.g., 35" value={field.value ?? ''} onChange={(e) => field.onChange(e.target.value === '' ? undefined : Number(e.target.value))} />
                      </FormControl>
                      <FormMessage />
                    </FormItem>
                  )}
                />
                <FormField
                  control={form.control}
                  name="bodyFat"
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel>Body fat percentage (5-50%)</FormLabel>
                      <FormControl>
                        <Input type="number" step="0.5" placeholder="e.g., 20" value={field.value ?? ''} onChange={(e) => field.onChange(e.target.value === '' ? undefined : Number(e.target.value))} />
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
                      <FormLabel>Activity level (1-5: 1=sedentary, 5=highly active)</FormLabel>
                      <FormControl>
                        <Input type="number" step="1" min="1" max="5" placeholder="e.g., 3" value={field.value ?? ''} onChange={(e) => field.onChange(e.target.value === '' ? undefined : Number(e.target.value))} />
                      </FormControl>
                      <FormMessage />
                    </FormItem>
                  )}
                />
                <FormField
                  control={form.control}
                  name="ambientTemp"
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel>Ambient temperature (°F, -20 to 120)</FormLabel>
                      <FormControl>
                        <Input type="number" step="1" placeholder="e.g., 75" value={field.value ?? ''} onChange={(e) => field.onChange(e.target.value === '' ? undefined : Number(e.target.value))} />
                      </FormControl>
                      <FormMessage />
                    </FormItem>
                  )}
                />
                <FormField
                  control={form.control}
                  name="hydrationLevel"
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel>Hydration level (1-5: 1=dehydrated, 5=well hydrated)</FormLabel>
                      <FormControl>
                        <Input type="number" step="1" min="1" max="5" placeholder="e.g., 4" value={field.value ?? ''} onChange={(e) => field.onChange(e.target.value === '' ? undefined : Number(e.target.value))} />
                      </FormControl>
                      <FormMessage />
                    </FormItem>
                  )}
                />
              </div>
              <Button type="submit" className="w-full md:w-auto">
                Calculate regulation score
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
            <CardDescription>See regulation score, status, and recommendations.</CardDescription>
          </CardHeader>
          <CardContent className="space-y-6">
            <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
              <div className="p-4 border rounded">
                <p className="text-sm text-muted-foreground">Regulation score</p>
                <p className="text-2xl font-semibold text-primary">{result.regulationScore.toFixed(1)}</p>
                <p className="text-xs text-muted-foreground">Out of 100</p>
              </div>
              <div className="p-4 border rounded">
                <p className="text-sm text-muted-foreground">Age</p>
                <p className="text-2xl font-semibold text-primary">{result.age.toFixed(0)}</p>
                <p className="text-xs text-muted-foreground">Years</p>
              </div>
              <div className="p-4 border rounded">
                <p className="text-sm text-muted-foreground">Ambient temp</p>
                <p className="text-2xl font-semibold text-primary">{result.ambientTemp.toFixed(0)}°F</p>
                <p className="text-xs text-muted-foreground">Environment</p>
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
            <strong>Age factor</strong> = (100 - Age) / 100 × 30, if Age ≥ 65, else 30. Contributes 0-30 points, decreasing with age. Older adults have reduced regulation capacity.
          </p>
          <p>
            <strong>Body fat factor</strong> = 25 if Body Fat is 15-25% (optimal range), else calculated based on deviation from optimal. Body fat provides insulation but excessive fat reduces heat loss in heat.
          </p>
          <p>
            <strong>Activity factor</strong> = (Activity Level / 5) × 25. Contributes 0-25 points. Regular exercise improves cardiovascular function and sweating efficiency, enhancing regulation.
          </p>
          <p>
            <strong>Temperature stress</strong> = Penalty for extreme temperatures: (32 - Temp) / 50 × 10 if Temp &lt; 32°F, or (Temp - 90) / 30 × 10 if Temp &gt; 90°F, else 0. Extreme temperatures challenge regulation.
          </p>
          <p>
            <strong>Hydration factor</strong> = (Hydration Level / 5) × 10. Contributes 0-10 points. Adequate hydration is critical for sweating and temperature regulation.
          </p>
          <p>
            <strong>Regulation score</strong> = Age Factor + Body Fat Factor + Activity Factor - Temperature Stress + Hydration Factor, normalized to 0-100 scale. Higher scores indicate better temperature regulation capacity based on physiological factors and environmental conditions.
          </p>
          <p>Temperature regulation maintains core body temperature around 98.6°F. Factors like age, body composition, activity, hydration, and environmental conditions affect regulation capacity. Proper hydration, appropriate clothing, and activity support effective regulation.</p>
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
                <p className="text-sm text-muted-foreground">Body fat</p>
                <p className="text-xl font-semibold text-primary">
                  {result.bodyFat.toFixed(1)}%
                </p>
                <p className="text-xs text-muted-foreground">Body composition</p>
              </div>
              <div className="p-4 border rounded">
                <p className="text-sm text-muted-foreground">Activity level</p>
                <p className="text-xl font-semibold text-primary">
                  {result.activityLevel}/5
                </p>
                <p className="text-xs text-muted-foreground">Rating</p>
              </div>
              <div className="p-4 border rounded">
                <p className="text-sm text-muted-foreground">Hydration</p>
                <p className="text-xl font-semibold text-primary">
                  {result.hydrationLevel}/5
                </p>
                <p className="text-xs text-muted-foreground">Rating</p>
              </div>
            </div>
          ) : (
            <p className="text-sm text-muted-foreground">Enter your physiological and environmental data to see additional insights.</p>
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
                <Link href={`/category/health-fitness/${calc.slug}`} className="text-primary hover:underline">
                  {calc.name}
                </Link>
              </h4>
              <p className="text-sm text-muted-foreground">{calc.description}</p>
            </div>
          ))}
        </CardContent>
      </Card>

      <section className="space-y-6 text-muted-foreground leading-relaxed bg-white p-6 md:p-10 rounded-lg shadow-lg" itemType="https://schema.org/MedicalWebPage">
    <meta itemProp="name" content="The Definitive Guide to Body Temperature Regulation: Understanding Thermoregulation and Maintaining Optimal Body Temperature" />
    <meta itemProp="description" content="An expert guide on body temperature regulation, factors affecting thermoregulation, and strategies to maintain optimal body temperature in various environmental conditions." />
    <meta itemProp="keywords" content="body temperature regulation, thermoregulation, temperature regulation calculator, heat regulation, cold tolerance, hydration, body fat" />
    <meta itemProp="author" content="[Your Site's Health Team]" />
    <meta itemProp="datePublished" content="2025-12-01" />
    <meta itemProp="url" content="/definitive-temperature-regulation-guide" />

    <h1 className="text-3xl md:text-4xl font-extrabold text-foreground mb-4" itemProp="headline">The Definitive Guide to Body Temperature Regulation: Understanding Thermoregulation and Maintaining Optimal Body Temperature</h1>
    <p className="text-lg italic text-gray-700">Explore body temperature regulation, factors affecting thermoregulation, and strategies to maintain optimal body temperature in various environmental conditions and activity levels.</p>

    <h2 className="text-2xl font-bold text-foreground mt-8 mb-4">Table of Contents: Jump to a Section</h2>
    <ul className="list-disc ml-6 space-y-2 text-blue-600">
        <li><a href="#what-is-regulation" className="hover:underline">What Is Temperature Regulation</a></li>
        <li><a href="#factors" className="hover:underline">Factors Affecting Regulation</a></li>
        <li><a href="#age" className="hover:underline">Age and Temperature Regulation</a></li>
        <li><a href="#body-composition" className="hover:underline">Body Composition Impact</a></li>
        <li><a href="#improvement" className="hover:underline">Improving Regulation</a></li>
    </ul>
<hr />

    <h2 id="what-is-regulation" className="text-2xl font-bold text-foreground pt-8" itemProp="articleSection">What Is Temperature Regulation</h2>
    <p>**Body temperature regulation** (thermoregulation) is the body's ability to maintain a stable internal temperature around 98.6°F (37°C) despite changes in ambient temperature, activity level, and other environmental factors.</p>

<h3 className="text-xl font-semibold text-foreground mt-6">Mechanisms of Regulation</h3>
<p>Temperature regulation involves:</p>
<ul>
    <li><b>Heat production:</b> Metabolic processes, shivering, exercise</li>
    <li><b>Heat loss:</b> Sweating, radiation, convection, conduction</li>
    <li><b>Vasodilation:</b> Blood vessels expand to release heat</li>
    <li><b>Vasoconstriction:</b> Blood vessels contract to conserve heat</li>
    <li><b>Sweating:</b> Primary cooling mechanism</li>
    <li><b>Shivering:</b> Heat production through muscle contraction</li>
</ul>

<hr />

    <h2 id="factors" className="text-2xl font-bold text-foreground pt-8" itemProp="articleSection">Factors Affecting Regulation</h2>
    <p>Multiple factors influence temperature regulation:</p>

    <h3 className="text-xl font-semibold text-foreground mt-6">Age</h3>
    <ul>
        <li>Older adults (65+) have reduced regulation</li>
        <li>Decreased sweating and blood flow to skin</li>
        <li>Slower metabolic responses</li>
        <li>Reduced sensitivity to temperature changes</li>
        <li>Increased risk of heat stroke and hypothermia</li>
    </ul>

    <h3 className="text-xl font-semibold text-foreground mt-6">Body Composition</h3>
    <ul>
        <li>Body fat provides insulation</li>
        <li>Higher fat = better cold protection</li>
        <li>Higher fat = reduced heat loss in heat</li>
        <li>Optimal range supports balanced regulation</li>
    </ul>

    <h3 className="text-xl font-semibold text-foreground mt-6">Activity Level</h3>
    <ul>
        <li>Exercise generates heat</li>
        <li>Regular activity improves regulation</li>
        <li>Enhances cardiovascular function</li>
        <li>Improves sweating efficiency</li>
    </ul>

    <h3 className="text-xl font-semibold text-foreground mt-6">Hydration</h3>
    <ul>
        <li>Critical for sweating</li>
        <li>Dehydration impairs cooling</li>
        <li>Increases core temperature</li>
        <li>Well-hydrated individuals regulate better</li>
    </ul>

<hr />

    <h2 id="age" className="text-2xl font-bold text-foreground pt-8" itemProp="articleSection">Age and Temperature Regulation</h2>
    <p>Age significantly affects temperature regulation:</p>

    <h3 className="text-xl font-semibold text-foreground mt-6">Changes with Age</h3>
    <ul>
        <li>Reduced sweating capacity</li>
        <li>Decreased blood flow to skin</li>
        <li>Slower metabolic responses</li>
        <li>Reduced sensitivity to temperature</li>
        <li>Increased risk in extreme conditions</li>
    </ul>

    <h3 className="text-xl font-semibold text-foreground mt-6">Precautions for Older Adults</h3>
    <ul>
        <li>Extra caution in extreme temperatures</li>
        <li>Monitor for heat illness signs</li>
        <li>Stay well-hydrated</li>
        <li>Avoid prolonged exposure</li>
        <li>Use appropriate clothing</li>
    </ul>

<hr />

    <h2 id="body-composition" className="text-2xl font-bold text-foreground pt-8" itemProp="articleSection">Body Composition Impact</h2>
    <p>Body fat affects temperature regulation:</p>

    <h3 className="text-xl font-semibold text-foreground mt-6">Insulation Effect</h3>
    <ul>
        <li>Body fat acts as insulation</li>
        <li>Better cold protection with higher fat</li>
        <li>Reduced heat loss in hot conditions</li>
        <li>Optimal range supports balance</li>
    </ul>

<hr />

    <h2 id="improvement" className="text-2xl font-bold text-foreground pt-8" itemProp="articleSection">Improving Regulation</h2>
    <p>Strategies to improve temperature regulation:</p>

    <h3 className="text-xl font-semibold text-foreground mt-6">Hydration</h3>
    <ul>
        <li>Stay well-hydrated</li>
        <li>Drink before feeling thirsty</li>
        <li>Increase intake in heat</li>
        <li>Monitor urine color (pale yellow)</li>
    </ul>

    <h3 className="text-xl font-semibold text-foreground mt-6">Physical Activity</h3>
    <ul>
        <li>Regular exercise improves regulation</li>
        <li>Enhances cardiovascular function</li>
        <li>Improves sweating efficiency</li>
        <li>Aim for moderate activity most days</li>
    </ul>

    <h3 className="text-xl font-semibold text-foreground mt-6">Appropriate Clothing</h3>
    <ul>
        <li>Breathable fabrics in heat</li>
        <li>Layer clothing in cold</li>
        <li>Protect extremities</li>
        <li>Adjust based on conditions</li>
    </ul>

    <h3 className="text-xl font-semibold text-foreground mt-6">Environmental Management</h3>
    <ul>
        <li>Limit extreme temperature exposure</li>
        <li>Seek shade or shelter</li>
        <li>Gradual acclimatization</li>
        <li>Monitor for warning signs</li>
    </ul>

<hr />

    <h2 className="text-2xl font-bold text-foreground pt-8" itemProp="articleSection">Conclusion</h2>
    <p>Temperature regulation maintains stable body temperature through heat production and loss. Factors like age, body composition, activity, hydration, and environmental conditions affect regulation. By staying hydrated, maintaining regular activity, using appropriate clothing, and managing environmental exposure, you can support effective temperature regulation. Use this calculator to assess your regulation capacity and identify areas for improvement. Remember: proper hydration, activity, and environmental management are key to maintaining optimal body temperature.</p>
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
          <p>This tool estimates body temperature regulation capacity from age, body fat, activity level, ambient temperature, and hydration level.</p>
          <p>Outputs include regulation score, status, recommendations, an action plan, and supporting metrics.</p>
          <p>Formula, steps, guide content, related tools, and FAQs ensure humans or AI assistants can interpret the methodology instantly.</p>
        </CardContent>
      </Card>
    </div>
  );
}



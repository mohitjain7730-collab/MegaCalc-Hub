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
  dailySteps: z.number({ invalid_type_error: 'Enter daily steps' }).min(0).max(50000),
  standingMinutes: z.number({ invalid_type_error: 'Enter standing minutes' }).min(0).max(1440),
  lightActivityMinutes: z.number({ invalid_type_error: 'Enter light activity minutes' }).min(0).max(1440),
});

type FormValues = z.infer<typeof formSchema>;

type ResultPayload = {
  bodyWeight: number;
  dailySteps: number;
  standingMinutes: number;
  lightActivityMinutes: number;
  totalNEAT: number;
  impactScore: number;
  impactPercent: number;
  status: 'optimal' | 'good' | 'moderate' | 'low';
  interpretation: string;
  recommendations: string[];
  plan: { label: string; detail: string }[];
};

const steps = [
  'Enter your body weight (kg) for accurate calorie calculations.',
  'Enter average daily steps from a pedometer or fitness tracker.',
  'Enter daily minutes spent standing (not walking or sitting).',
  'Enter daily minutes of light activity (chores, casual movement).',
  'Review NEAT impact score, total calories, and recommendations.',
];

const faqs = [
  {
    question: 'What is NEAT?',
    answer:
      'NEAT (Non-Exercise Activity Thermogenesis) is the energy expended for everything we do that is not sleeping, eating, or structured exercise. This includes walking, standing, fidgeting, household chores, and daily movements.',
  },
  {
    question: 'How does NEAT impact weight management?',
    answer:
      'NEAT can vary by 200-900 calories per day between individuals with similar body sizes. Higher NEAT levels help burn more calories throughout the day, making it easier to maintain or lose weight without structured exercise.',
  },
  {
    question: 'What activities contribute to NEAT?',
    answer:
      'NEAT includes walking, standing, taking stairs, gardening, housework, cooking, fidgeting, posture adjustments, and any non-exercise movement. The more you move throughout the day, the higher your NEAT.',
  },
  {
    question: 'How many calories does standing burn?',
    answer:
      'Standing burns approximately 1.5-2.0 METs (metabolic equivalents), which is about 50% more than sitting. For a 70kg person, standing burns roughly 1-1.5 calories per minute compared to 0.8-1.0 calories per minute sitting.',
  },
  {
    question: 'Can I increase my NEAT?',
    answer:
      'Yes. Take walking breaks, use stairs instead of elevators, stand during phone calls, park farther away, do light housework, fidget more, use a standing desk, and reduce prolonged sitting time. Small changes add up significantly.',
  },
  {
    question: 'How does NEAT compare to exercise?',
    answer:
      'NEAT burns calories continuously throughout the day, while exercise burns calories during the activity and briefly after. Both are important, but NEAT can contribute 15-50% of total daily energy expenditure, making it a crucial factor for weight management.',
  },
  {
    question: 'What is a good NEAT level?',
    answer:
      'Aim for 150-300 calories per day from NEAT for sedentary individuals, 300-500 calories for moderately active, and 500+ calories for very active individuals. Higher is generally better for weight management and metabolic health.',
  },
  {
    question: 'Does job type affect NEAT?',
    answer:
      'Yes. Desk jobs significantly reduce NEAT compared to active jobs. Office workers may need to make deliberate efforts to increase movement through standing desks, walking meetings, and active commuting to compensate.',
  },
  {
    question: 'How accurate is this calculator?',
    answer:
      'This calculator provides estimates based on standard MET values and body weight. Individual variations in metabolism, muscle mass, and movement efficiency can affect actual calorie expenditure. Use results as a guide, not exact measurements.',
  },
  {
    question: 'When should I consult a healthcare provider?',
    answer:
      'Consult a healthcare provider if you have mobility limitations, chronic conditions affecting movement, need guidance on safe activity levels, or want a comprehensive weight management plan that includes NEAT optimization.',
  },
];

const relatedCalculators = [
  {
    name: 'Daily Calorie Needs Calculator',
    slug: 'daily-calorie-needs-calculator',
    description: 'Calculate total daily energy expenditure including NEAT.',
  },
  {
    name: 'Step to Calorie Converter',
    slug: 'step-to-calorie-converter',
    description: 'Convert steps to calories burned for walking activities.',
  },
  {
    name: 'Exercise Calorie Burn Calculator',
    slug: 'mets-calories-burned-calculator',
    description: 'Assess structured exercise alongside NEAT.',
  },
  {
    name: 'Occupational Sedentary Risk Score Calculator',
    slug: 'occupational-sedentary-risk-score-calculator',
    description: 'Evaluate the health impacts of low activity levels at work.',
  },
];

const baseUrl = 'https://mycalculating.com/category/health-fitness/neat-impact-calculator';

const schemaMarkup = {
  '@context': 'https://schema.org',
  '@graph': [
    {
      '@type': 'BreadcrumbList',
      itemListElement: [
        { '@type': 'ListItem', position: 1, name: 'Home', item: 'https://mycalculating.com' },
        { '@type': 'ListItem', position: 2, name: 'Health & Fitness', item: 'https://mycalculating.com/category/health-fitness' },
        { '@type': 'ListItem', position: 3, name: 'NEAT Impact Calculator', item: baseUrl },
      ],
    },
    {
      '@type': 'SoftwareApplication',
      name: 'NEAT Impact Calculator',
      applicationCategory: 'Calculator',
      operatingSystem: 'Web Browser',
      description: 'Calculate NEAT impact from body weight, daily steps, standing time, and light activity.',
      url: baseUrl,
      offers: { '@type': 'Offer', price: '0', priceCurrency: 'USD' },
    },
  ],
};

const clamp = (value: number, min: number, max: number) => Math.min(max, Math.max(min, value));

const calculateResult = (values: FormValues): ResultPayload => {
  const bodyWeight = values.bodyWeight;
  const dailySteps = values.dailySteps;
  const standingMinutes = values.standingMinutes;
  const lightActivityMinutes = values.lightActivityMinutes;
  
  // Calculate NEAT calories using MET values
  // Steps: ~0.04-0.05 kcal per step per kg body weight
  const stepsCalories = dailySteps * 0.0005 * bodyWeight * 1.036;
  
  // Standing: 1.5 METs = ~0.025 kcal per minute per kg
  const standingCalories = (1.5 * 3.5 * bodyWeight) / 200 * standingMinutes;
  
  // Light activity: 2.5 METs = ~0.044 kcal per minute per kg
  const lightActivityCalories = (2.5 * 3.5 * bodyWeight) / 200 * lightActivityMinutes;
  
  const totalNEAT = stepsCalories + standingCalories + lightActivityCalories;
  
  // Impact score: compare to reference NEAT (250 kcal/day for moderate activity)
  const referenceNEAT = 250;
  const impactScore = clamp((totalNEAT / referenceNEAT) * 100, 0, 200);
  const impactPercent = (totalNEAT / referenceNEAT) * 100;
  
  let status: ResultPayload['status'] = 'optimal';
  let interpretation = 'Your NEAT level appears optimal. Continue maintaining active daily habits to support energy balance and metabolic health.';

  if (totalNEAT < 150 || impactPercent < 60) {
    status = 'low';
    interpretation = 'Your NEAT level is low. This significantly limits daily calorie expenditure and can make weight management challenging. Increase daily movement through walking, standing, and light activities.';
  } else if (totalNEAT < 250 || impactPercent < 100) {
    status = 'moderate';
    interpretation = 'Your NEAT level is moderate. Increasing daily movement can boost calorie expenditure and support better weight management and metabolic health.';
  } else if (totalNEAT < 400 || impactPercent < 160) {
    status = 'good';
    interpretation = 'Your NEAT level is good. Continue maintaining active daily habits to support energy balance and overall health.';
  } else {
    status = 'optimal';
    interpretation = 'Your NEAT level is excellent. High daily activity levels significantly support calorie balance, weight management, and metabolic health.';
  }

  const recommendations = [
    'Increase daily steps: aim for 8,000-12,000 steps per day. Take walking breaks, use stairs, park farther away, and walk during phone calls to boost step count.',
    'Add standing time: use a standing desk, stand during meetings and phone calls, and take standing breaks every hour. Standing burns 50% more calories than sitting.',
    'Incorporate light activities: do household chores, gardening, cooking, and casual movement throughout the day. Every bit of movement adds to NEAT.',
  ];
  
  if (totalNEAT < 200) {
    recommendations.push('Focus on reducing sedentary time: set reminders to move every 30-60 minutes, take brief walking breaks, and avoid prolonged sitting to increase NEAT significantly.');
  }
  
  if (dailySteps < 5000) {
    recommendations.push(`Increase step count gradually: start with adding 1,000-2,000 steps daily, use a pedometer or fitness tracker to monitor progress, and build up to 8,000-10,000 steps for optimal NEAT.`);
  }
  
  if (standingMinutes < 60) {
    recommendations.push('Add more standing: aim for 2-4 hours of standing time daily. Use a standing desk converter, stand during breaks, and stand while watching TV or reading.');
  }

  const plan = [
    { label: 'This Week', detail: `Track your current NEAT levels and identify opportunities to increase daily movement. Set specific goals like adding 1,000 steps or 30 minutes of standing time.` },
    { label: 'This Month', detail: 'Build consistent NEAT habits: establish routines like morning walks, standing desk use, active breaks, and household chores to maintain higher daily activity levels.' },
    { label: 'Ongoing', detail: 'Maintain high NEAT levels long-term: make movement a natural part of daily life. Focus on sustainable habits that increase daily activity without requiring structured exercise time.' },
  ];

  return { bodyWeight, dailySteps, standingMinutes, lightActivityMinutes, totalNEAT, impactScore, impactPercent, status, interpretation, recommendations, plan };
};

export default function NEATImpactCalculator() {
  const [result, setResult] = useState<ResultPayload | null>(null);

  const form = useForm<FormValues>({
    resolver: zodResolver(formSchema),
    defaultValues: {
      bodyWeight: undefined,
      dailySteps: undefined,
      standingMinutes: undefined,
      lightActivityMinutes: undefined,
    },
  });

  return (
    <div className="space-y-8">
      <Script id="neat-impact-schema" type="application/ld+json" strategy="afterInteractive" dangerouslySetInnerHTML={{ __html: JSON.stringify(schemaMarkup) }} />

      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <Activity className="h-5 w-5" />
            NEAT Impact Calculator
          </CardTitle>
          <CardDescription>Calculate NEAT impact from body weight, daily steps, standing time, and light activity.</CardDescription>
        </CardHeader>
      </Card>

      <Card>
        <CardHeader>
          <CardTitle>Input your NEAT data</CardTitle>
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
                  name="dailySteps"
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel>Daily steps</FormLabel>
                      <FormControl>
                        <Input type="number" step="1" placeholder="e.g., 8000" value={field.value ?? ''} onChange={(e) => field.onChange(e.target.value === '' ? undefined : Number(e.target.value))} />
                      </FormControl>
                      <FormMessage />
                    </FormItem>
                  )}
                />
                <FormField
                  control={form.control}
                  name="standingMinutes"
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel>Standing time (minutes/day)</FormLabel>
                      <FormControl>
                        <Input type="number" step="1" placeholder="e.g., 120" value={field.value ?? ''} onChange={(e) => field.onChange(e.target.value === '' ? undefined : Number(e.target.value))} />
                      </FormControl>
                      <FormMessage />
                    </FormItem>
                  )}
                />
                <FormField
                  control={form.control}
                  name="lightActivityMinutes"
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel>Light activity (minutes/day)</FormLabel>
                      <FormControl>
                        <Input type="number" step="1" placeholder="e.g., 60" value={field.value ?? ''} onChange={(e) => field.onChange(e.target.value === '' ? undefined : Number(e.target.value))} />
                      </FormControl>
                      <FormMessage />
                    </FormItem>
                  )}
                />
              </div>
              <Button type="submit" className="w-full md:w-auto">
                Calculate NEAT impact
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
            <CardDescription>See total NEAT, impact score, and recommendations.</CardDescription>
          </CardHeader>
          <CardContent className="space-y-6">
            <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
              <div className="p-4 border rounded">
                <p className="text-sm text-muted-foreground">Total NEAT</p>
                <p className="text-2xl font-semibold text-primary">{result.totalNEAT.toFixed(0)}</p>
                <p className="text-xs text-muted-foreground">kcal/day</p>
              </div>
              <div className="p-4 border rounded">
                <p className="text-sm text-muted-foreground">Impact score</p>
                <p className="text-2xl font-semibold text-primary">{result.impactScore.toFixed(0)}</p>
                <p className="text-xs text-muted-foreground">Out of 100</p>
              </div>
              <div className="p-4 border rounded">
                <p className="text-sm text-muted-foreground">Impact %</p>
                <p className="text-2xl font-semibold text-primary">{result.impactPercent.toFixed(0)}%</p>
                <p className="text-xs text-muted-foreground">Of reference</p>
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
            <strong>Steps calories</strong> = Daily Steps × 0.0005 × Body Weight (kg) × 1.036. Walking steps burn approximately 0.04-0.05 kcal per step per kg body weight.
          </p>
          <p>
            <strong>Standing calories</strong> = (1.5 METs × 3.5 × Body Weight) / 200 × Standing Minutes. Standing uses 1.5 metabolic equivalents, burning about 50% more calories than sitting.
          </p>
          <p>
            <strong>Light activity calories</strong> = (2.5 METs × 3.5 × Body Weight) / 200 × Light Activity Minutes. Light activities like housework use 2.5 METs.
          </p>
          <p>
            <strong>Total NEAT</strong> = Steps Calories + Standing Calories + Light Activity Calories. Impact score compares total NEAT to a reference level of 250 kcal/day for moderate activity.
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
                <p className="text-sm text-muted-foreground">Weekly NEAT</p>
                <p className="text-xl font-semibold text-primary">
                  {(result.totalNEAT * 7).toFixed(0)} kcal
                </p>
                <p className="text-xs text-muted-foreground">Per week</p>
              </div>
              <div className="p-4 border rounded">
                <p className="text-sm text-muted-foreground">Monthly NEAT</p>
                <p className="text-xl font-semibold text-primary">
                  {(result.totalNEAT * 30).toFixed(0)} kcal
                </p>
                <p className="text-xs text-muted-foreground">Per month</p>
              </div>
              <div className="p-4 border rounded">
                <p className="text-sm text-muted-foreground">NEAT level</p>
                <p className="text-xl font-semibold text-primary">
                  {result.totalNEAT < 150 ? 'Low' : result.totalNEAT < 250 ? 'Moderate' : result.totalNEAT < 400 ? 'Good' : 'Excellent'}
                </p>
                <p className="text-xs text-muted-foreground">Based on total</p>
              </div>
            </div>
          ) : (
            <p className="text-sm text-muted-foreground">Enter your NEAT data to see additional insights.</p>
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
    {/* SEO & SCHEMA METADATA (HIGHLY OPTIMIZED) */}
    <meta itemProp="name" content="The Definitive Guide to NEAT Impact: Understanding Non-Exercise Activity Thermogenesis" />
    <meta itemProp="description" content="An expert, evidence-based guide on NEAT (Non-Exercise Activity Thermogenesis), detailing how daily movement affects calorie expenditure, weight management, and metabolic health, with strategies to increase NEAT for better energy balance." />
    <meta itemProp="keywords" content="NEAT impact calculator, non-exercise activity thermogenesis, daily movement calories, weight management NEAT, sedentary lifestyle impact, daily activity level, calorie expenditure without exercise" />
    <meta itemProp="author" content="[Your Site's Health Team]" />
    <meta itemProp="datePublished" content="2025-12-01" />
    <meta itemProp="url" content="/definitive-neat-impact-guide" />

    <h1 className="text-3xl md:text-4xl font-extrabold text-foreground mb-4" itemProp="headline">The Definitive Guide to NEAT Impact: Understanding Non-Exercise Activity Thermogenesis for Weight Management</h1>
    <p className="text-lg italic text-gray-700">Explore the science of NEAT, how daily movement contributes to calorie expenditure, and comprehensive strategies to increase non-exercise activity for better weight management and metabolic health.</p>


    {/* TABLE OF CONTENTS (INTERNAL LINKS FOR UX AND SEO) */}
    <h2 className="text-2xl font-bold text-foreground mt-8 mb-4">Table of Contents: Jump to a Section</h2>
    <ul className="list-disc ml-6 space-y-2 text-blue-600">
        <li><a href="#what-is-neat" className="hover:underline">What is NEAT and Why It Matters</a></li>
        <li><a href="#calorie-impact" className="hover:underline">NEAT's Impact on Daily Calorie Expenditure</a></li>
        <li><a href="#factors" className="hover:underline">Factors Affecting NEAT Levels</a></li>
        <li><a href="#increasing" className="hover:underline">Strategies to Increase NEAT</a></li>
        <li><a href="#health-benefits" className="hover:underline">Health Benefits of Higher NEAT</a></li>
    </ul>
<hr />

    {/* WHAT IS NEAT */}
    <h2 id="what-is-neat" className="text-2xl font-bold text-foreground pt-8" itemProp="articleSection">What is NEAT and Why It Matters</h2>
    <p>**Non-Exercise Activity Thermogenesis (NEAT)** is the energy expended for everything we do that is not sleeping, eating, or structured exercise. This includes all daily movements: walking, standing, fidgeting, household chores, cooking, gardening, and any non-exercise physical activity. NEAT is a crucial component of total daily energy expenditure (TDEE) and can vary dramatically between individuals, making it a significant factor in weight management.</p>

<h3 className="text-xl font-semibold text-foreground mt-6">The Components of Total Daily Energy Expenditure</h3>
<p>Total Daily Energy Expenditure (TDEE) consists of four main components:</p>
<ul>
    <li><b>Basal Metabolic Rate (BMR):</b> Energy needed for basic life functions (60-75% of TDEE)</li>
    <li><b>Thermic Effect of Food (TEF):</b> Energy used for digestion and nutrient processing (10% of TDEE)</li>
    <li><b>Exercise Activity Thermogenesis (EAT):</b> Energy burned during structured exercise (5-15% of TDEE)</li>
    <li><b>NEAT:</b> Energy burned through non-exercise daily activities (15-50% of TDEE)</li>
</ul>
<p>NEAT can vary by **200-900 calories per day** between individuals with similar body sizes, making it a powerful determinant of weight management success.</p>

<h3 className="text-xl font-semibold text-foreground mt-6">Why NEAT Matters for Weight Management</h3>
<p>Research shows that individuals with higher NEAT are better able to maintain or lose weight, even with similar calorie intake. NEAT acts as a natural calorie buffer, burning extra calories throughout the day without requiring dedicated exercise time. This makes it particularly valuable for:</p>
<ul>
    <li>Weight maintenance without strict calorie restriction</li>
    <li>Creating sustainable calorie deficits</li>
    <li>Preventing weight regain after dieting</li>
    <li>Supporting metabolic health without structured workouts</li>
</ul>

<hr />

    {/* NEAT'S IMPACT ON CALORIE EXPENDITURE */}
    <h2 id="calorie-impact" className="text-2xl font-bold text-foreground pt-8" itemProp="articleSection">NEAT's Impact on Daily Calorie Expenditure</h2>
    <p>The impact of NEAT on total calorie burn is substantial and often underestimated. Small daily movements accumulate into significant calorie expenditure over time.</p>

    <h3 className="text-xl font-semibold text-foreground mt-6">Common NEAT Activities and Their Calorie Costs</h3>
    <div className="overflow-x-auto my-6 p-4 bg-gray-50 border rounded-lg">
        <table className="w-full text-left border-collapse">
            <thead>
                <tr>
                    <th className="border-b p-2 font-bold">Activity</th>
                    <th className="border-b p-2 font-bold">METs</th>
                    <th className="border-b p-2 font-bold">Calories/30 min (70kg person)</th>
                </tr>
            </thead>
            <tbody>
                <tr>
                    <td className="border-b p-2">Sitting</td>
                    <td className="border-b p-2">1.0</td>
                    <td className="border-b p-2">~37 kcal</td>
                </tr>
                <tr>
                    <td className="border-b p-2">Standing</td>
                    <td className="border-b p-2">1.5</td>
                    <td className="border-b p-2">~55 kcal</td>
                </tr>
                <tr>
                    <td className="border-b p-2">Walking (casual)</td>
                    <td className="border-b p-2">2.5-3.0</td>
                    <td className="border-b p-2">~90-110 kcal</td>
                </tr>
                <tr>
                    <td className="border-b p-2">Housework (light)</td>
                    <td className="border-b p-2">2.5-3.0</td>
                    <td className="border-b p-2">~90-110 kcal</td>
                </tr>
                <tr>
                    <td className="border-b p-2">Cooking</td>
                    <td className="border-b p-2">2.0-2.5</td>
                    <td className="border-b p-2">~75-90 kcal</td>
                </tr>
                <tr>
                    <td className="border-b p-2">Gardening</td>
                    <td className="border-b p-2">3.5-4.0</td>
                    <td className="border-b p-2">~130-150 kcal</td>
                </tr>
            </tbody>
        </table>
    </div>
    <p>METs (Metabolic Equivalents) represent the energy cost of activities relative to resting. Higher METs mean more calories burned. Standing burns 50% more calories than sitting, and light activities can burn 2-4 times more.</p>

<h3 className="text-xl font-semibold text-foreground mt-6">The Cumulative Effect of NEAT</h3>
<p>What makes NEAT so powerful is its cumulative nature. While individual activities may seem small, they add up throughout the day:</p>
<ul>
    <li><b>Walking 10,000 steps:</b> Burns ~300-400 calories (varies by weight and pace)</li>
    <li><b>Standing 4 hours instead of sitting:</b> Burns ~120 extra calories</li>
    <li><b>30 minutes of light housework:</b> Burns ~90-110 calories</li>
    <li><b>Total daily NEAT:</b> Can easily reach 300-600 calories with consistent movement</li>
</ul>
<p>Over a week, higher NEAT can create a 2,100-4,200 calorie deficit, equivalent to 0.3-0.6 kg (0.7-1.3 lbs) of fat loss per week without any structured exercise.</p>

<hr />

    {/* FACTORS AFFECTING NEAT */}
    <h2 id="factors" className="text-2xl font-bold text-foreground pt-8" itemProp="articleSection">Factors Affecting NEAT Levels</h2>
    <p>Several factors influence an individual's NEAT levels, explaining why some people naturally burn more calories through daily movement than others.</p>

    <h3 className="text-xl font-semibold text-foreground mt-6">Job Type and Occupational Activity</h3>
    <p>Occupation is one of the strongest predictors of NEAT:</p>
    <ul>
        <li><b>Sedentary jobs (office work):</b> 150-300 kcal/day from NEAT</li>
        <li><b>Moderately active jobs (teaching, retail):</b> 300-500 kcal/day from NEAT</li>
        <li><b>Active jobs (construction, nursing):</b> 500-800+ kcal/day from NEAT</li>
    </ul>
    <p>Desk workers need to make deliberate efforts to increase NEAT through standing desks, walking breaks, and active commuting.</p>

    <h3 className="text-xl font-semibold text-foreground mt-6">Individual Differences</h3>
    <p>Even with similar jobs and lifestyles, NEAT can vary significantly due to:</p>
    <ul>
        <li><b>Natural activity level:</b> Some people are naturally more fidgety and restless</li>
        <li><b>Habit patterns:</b> Established routines and movement habits</li>
        <li><b>Conscious choices:</b> Deliberate decisions to be more active</li>
        <li><b>Environment:</b> Walkable neighborhoods, access to stairs, workspace setup</li>
    </ul>

    <h3 className="text-xl font-semibold text-foreground mt-6">Adaptive Responses</h3>
    <p>Interestingly, NEAT can increase or decrease in response to overeating or calorie restriction:</p>
    <ul>
        <li><b>Overeating:</b> Some people naturally increase fidgeting and movement (good NEAT responders)</li>
        <li><b>Calorie restriction:</b> NEAT may decrease as the body tries to conserve energy (adaptive thermogenesis)</li>
    </ul>
    <p>This adaptation explains why some people struggle more with weight loss—their NEAT decreases significantly during dieting.</p>

<hr />

    {/* STRATEGIES TO INCREASE NEAT */}
    <h2 id="increasing" className="text-2xl font-bold text-foreground pt-8" itemProp="articleSection">Strategies to Increase NEAT</h2>
    <p>Increasing NEAT is about making small, sustainable changes that add movement throughout the day. Here are evidence-based strategies:</p>

    <h3 className="text-xl font-semibold text-foreground mt-6">1. Increase Daily Steps</h3>
    <ul>
        <li><b>Target:</b> Aim for 8,000-12,000 steps per day</li>
        <li><b>Strategies:</b> Park farther away, take stairs, walk during phone calls, walk during breaks, walk after meals</li>
        <li><b>Impact:</b> Each 1,000 steps burns ~30-50 calories (varies by weight)</li>
    </ul>

    <h3 className="text-xl font-semibold text-foreground mt-6">2. Stand More</h3>
    <ul>
        <li><b>Target:</b> Stand for 2-4 hours per day</li>
        <li><b>Strategies:</b> Use a standing desk, stand during meetings, stand while reading/watching TV, stand during phone calls</li>
        <li><b>Impact:</b> Standing burns 50% more calories than sitting (~1-1.5 kcal/min vs 0.8-1.0 kcal/min)</li>
    </ul>

    <h3 className="text-xl font-semibold text-foreground mt-6">3. Reduce Prolonged Sitting</h3>
    <ul>
        <li><b>Target:</b> Break up sitting every 30-60 minutes</li>
        <li><b>Strategies:</b> Set reminders, take walking breaks, stretch, do light movements</li>
        <li><b>Impact:</b> Prevents metabolic slowdown and increases overall movement</li>
    </ul>

    <h3 className="text-xl font-semibold text-foreground mt-6">4. Incorporate Light Activities</h3>
    <ul>
        <li><b>Activities:</b> Housework, gardening, cooking, cleaning, organizing</li>
        <li><b>Impact:</b> Light activities burn 2-3 times more calories than sitting</li>
        <li><b>Tip:</b> Do chores yourself instead of automating or delegating when possible</li>
    </ul>

    <h3 className="text-xl font-semibold text-foreground mt-6">5. Make Movement Convenient</h3>
    <ul>
        <li>Use stairs instead of elevators</li>
        <li>Walk or bike for short trips</li>
        <li>Take active commuting options</li>
        <li>Schedule walking meetings</li>
        <li>Use a pedometer or fitness tracker to monitor progress</li>
    </ul>

<hr />

    {/* HEALTH BENEFITS */}
    <h2 id="health-benefits" className="text-2xl font-bold text-foreground pt-8" itemProp="articleSection">Health Benefits of Higher NEAT</h2>
    <p>Beyond calorie burning, higher NEAT provides numerous health benefits that extend beyond weight management.</p>

    <h3 className="text-xl font-semibold text-foreground mt-6">Metabolic Health</h3>
    <ul>
        <li><b>Blood sugar control:</b> Regular movement helps maintain stable blood glucose levels</li>
        <li><b>Insulin sensitivity:</b> Frequent activity improves insulin sensitivity</li>
        <li><b>Lipid profile:</b> Higher activity improves cholesterol and triglyceride levels</li>
    </ul>

    <h3 className="text-xl font-semibold text-foreground mt-6">Cardiovascular Health</h3>
    <ul>
        <li>Reduces risk of heart disease</li>
        <li>Lowers blood pressure</li>
        <li>Improves circulation</li>
        <li>Reduces inflammation markers</li>
    </ul>

    <h3 className="text-xl font-semibold text-foreground mt-6">Musculoskeletal Health</h3>
    <ul>
        <li>Maintains muscle mass and strength</li>
        <li>Supports bone density</li>
        <li>Reduces back pain and stiffness</li>
        <li>Improves posture</li>
    </ul>

    <h3 className="text-xl font-semibold text-foreground mt-6">Mental Health</h3>
    <ul>
        <li>Reduces stress and anxiety</li>
        <li>Improves mood</li>
        <li>Enhances cognitive function</li>
        <li>Better sleep quality</li>
    </ul>

<hr />

    {/* CONCLUSION */}
    <h2 className="text-2xl font-bold text-foreground pt-8" itemProp="articleSection">Conclusion</h2>
    <p>NEAT is a powerful, often overlooked component of weight management and metabolic health. By understanding how daily movement contributes to calorie expenditure and implementing strategies to increase NEAT, you can create sustainable calorie deficits without requiring extensive structured exercise. Focus on making movement a natural part of daily life—walk more, stand more, and incorporate light activities throughout the day. These small changes accumulate into significant health benefits over time. Remember, the best NEAT strategy is one you can maintain long-term, so focus on sustainable habits that fit your lifestyle.</p>
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
          <p>This tool calculates NEAT impact from body weight, daily steps, standing time, and light activity.</p>
          <p>Outputs include body weight, daily steps, standing minutes, light activity minutes, total NEAT, impact score, impact percentage, status, recommendations, an action plan, and supporting metrics.</p>
          <p>Formula, steps, guide content, related tools, and FAQs ensure humans or AI assistants can interpret the methodology instantly.</p>
        </CardContent>
      </Card>
    </div>
  );
}


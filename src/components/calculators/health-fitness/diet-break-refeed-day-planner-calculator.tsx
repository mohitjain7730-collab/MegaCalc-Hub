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
  dailyDeficit: z.number({ invalid_type_error: 'Enter daily deficit' }).min(0).max(2000),
  refeedFrequency: z.number({ invalid_type_error: 'Enter refeed frequency' }).min(1).max(14),
  refeedCalorieIncrease: z.number({ invalid_type_error: 'Enter calorie increase' }).min(0).max(2000).optional(),
  currentWeight: z.number({ invalid_type_error: 'Enter current weight' }).min(30).max(300),
});

type FormValues = z.infer<typeof formSchema>;

type ResultPayload = {
  dailyDeficit: number;
  refeedFrequency: number;
  refeedCalorieIncrease: number | undefined;
  currentWeight: number;
  weeklyDeficit: number;
  refeedCalories: number;
  averageDailyCalories: number;
  status: 'optimal' | 'good' | 'moderate' | 'low';
  interpretation: string;
  recommendations: string[];
  plan: { label: string; detail: string }[];
};

const steps = [
  'Enter your daily calorie deficit (calories below maintenance).',
  'Enter refeed frequency (days between refeed days, e.g., 7 for weekly).',
  'Enter calorie increase for refeed day (optional, defaults to maintenance).',
  'Enter your current weight (kg) for personalized recommendations.',
  'Review weekly deficit, refeed calories, and recommendations.',
];

const faqs = [
  {
    question: 'What is a diet break or refeed day?',
    answer:
      'A diet break is a planned period (typically 1-2 weeks) or a refeed day is a single day where you temporarily increase calories to maintenance or slightly above. This helps prevent metabolic adaptation, restore leptin levels, improve adherence, and provide psychological relief during extended calorie deficits.',
  },
  {
    question: 'Why are refeed days important?',
    answer:
      'Refeed days help prevent adaptive thermogenesis (metabolic slowdown), restore hormone levels (especially leptin), improve training performance, reduce diet fatigue, and can improve long-term adherence to calorie deficits. They\'re particularly important during extended dieting phases.',
  },
  {
    question: 'How often should I have refeed days?',
    answer:
      'Frequency depends on body fat percentage and deficit size. Generally: 10%+ body fat: every 7-14 days; 8-10% body fat: every 5-7 days; below 8%: every 3-5 days. Larger deficits may require more frequent refeeds. This calculator helps determine optimal frequency.',
  },
  {
    question: 'How many calories should I eat on a refeed day?',
    answer:
      'Refeed calories typically range from maintenance to 20-30% above maintenance. For most people, eating at maintenance (TDEE) is sufficient. More aggressive refeeds (20-30% above) may be beneficial for very lean individuals or after extended deficits, but can slow weekly progress.',
  },
  {
    question: 'What should I eat on refeed days?',
    answer:
      'Focus on higher carbohydrate intake to restore glycogen and leptin levels. Include complex carbs (rice, potatoes, oats), some simple carbs (fruits), adequate protein (maintain protein intake), and moderate fats. Don\'t use refeed days as an excuse for junk food binges—prioritize nutrient-dense foods.',
  },
  {
    question: 'Will refeed days slow my weight loss?',
    answer:
      'Refeed days may slightly slow weekly weight loss, but they can improve long-term adherence and metabolic health, leading to better overall results. The temporary pause in deficit is often offset by improved compliance, better training performance, and reduced metabolic adaptation.',
  },
  {
    question: 'What is the difference between a refeed day and a cheat day?',
    answer:
      'A refeed day is a structured, planned increase in calories (typically to maintenance) focused on carbohydrates to restore metabolic hormones. A cheat day is often unplanned, involves unrestricted eating, and may include excessive calories and poor food choices. Refeed days are strategic; cheat days are emotional.',
  },
  {
    question: 'Should I exercise on refeed days?',
    answer:
      'Yes, continue your normal training schedule. Refeed days provide extra energy that can improve workout performance. Some people prefer to schedule refeed days on training days to take advantage of increased energy and glycogen stores.',
  },
  {
    question: 'How do I know if I need a refeed day?',
    answer:
      'Signs you may need a refeed: persistent fatigue, decreased training performance, increased hunger, mood changes, stalled weight loss despite adherence, or feeling "flat" or depleted. If you\'ve been in a deficit for 4+ weeks, a refeed is likely beneficial.',
  },
  {
    question: 'Can refeed days cause water weight gain?',
    answer:
      'Yes, refeed days often cause temporary water weight gain (2-5 lbs) due to increased glycogen storage and sodium intake. This is normal and temporary. Weight typically returns to baseline within 2-3 days. Don\'t let temporary water weight discourage you from strategic refeeds.',
  },
];

const relatedCalculators = [
  {
    name: 'Daily Calorie Needs Calculator',
    slug: 'daily-calorie-needs-calculator',
    description: 'Calculate your maintenance calories for refeed planning.',
  },
  {
    name: 'Cheat Day Impact on Weekly Deficit Calculator',
    slug: 'cheat-day-impact-on-weekly-deficit-calculator',
    description: 'Assess the impact of cheat days on your weekly progress.',
  },
  {
    name: 'Reverse Dieting Calorie Increase Planner',
    slug: 'reverse-dieting-calorie-increase-planner',
    description: 'Plan gradual calorie increases after dieting.',
  },
];

const baseUrl = 'https://mycalculating.com/category/health-fitness/diet-break-refeed-day-planner-calculator';

const schemaMarkup = {
  '@context': 'https://schema.org',
  '@graph': [
    {
      '@type': 'BreadcrumbList',
      itemListElement: [
        { '@type': 'ListItem', position: 1, name: 'Home', item: 'https://mycalculating.com' },
        { '@type': 'ListItem', position: 2, name: 'Health & Fitness', item: 'https://mycalculating.com/category/health-fitness' },
        { '@type': 'ListItem', position: 3, name: 'Diet Break Refeed Day Planner Calculator', item: baseUrl },
      ],
    },
    {
      '@type': 'SoftwareApplication',
      name: 'Diet Break Refeed Day Planner Calculator',
      applicationCategory: 'Calculator',
      operatingSystem: 'Web Browser',
      description: 'Plan strategic refeed days and diet breaks to optimize fat loss while preventing metabolic adaptation.',
      url: baseUrl,
      offers: { '@type': 'Offer', price: '0', priceCurrency: 'USD' },
    },
  ],
};

const clamp = (value: number, min: number, max: number) => Math.min(max, Math.max(min, value));

const calculateResult = (values: FormValues): ResultPayload => {
  const dailyDeficit = values.dailyDeficit;
  const refeedFrequency = values.refeedFrequency;
  const refeedCalorieIncrease = values.refeedCalorieIncrease || 0;
  const currentWeight = values.currentWeight;
  
  // Estimate maintenance calories (rough estimate: weight in kg × 24-26 for sedentary, adjust for activity)
  const estimatedMaintenance = currentWeight * 25; // Simplified estimate
  const refeedCalories = estimatedMaintenance + refeedCalorieIncrease;
  
  // Calculate weekly deficit: (daily deficit × 6 days) - (refeed surplus × 1 day) for weekly refeed
  const daysInCycle = refeedFrequency;
  const deficitDays = daysInCycle - 1;
  const weeklyDeficit = (dailyDeficit * deficitDays) - (refeedCalorieIncrease > 0 ? refeedCalorieIncrease : 0);
  
  // Average daily calories over the cycle
  const totalCycleCalories = (estimatedMaintenance - dailyDeficit) * deficitDays + refeedCalories;
  const averageDailyCalories = totalCycleCalories / daysInCycle;
  
  // Status based on weekly deficit and refeed frequency
  let status: ResultPayload['status'] = 'optimal';
  let interpretation = 'Your refeed plan appears well-structured. Continue monitoring progress and adjusting as needed.';

  const weeklyDeficitPerKg = weeklyDeficit / (currentWeight * 7);
  
  if (weeklyDeficit < 0 || refeedFrequency < 3) {
    status = 'low';
    interpretation = 'Your refeed frequency is too high or calorie increase too large, potentially eliminating your weekly deficit. Reduce refeed frequency or calorie increase to maintain progress.';
  } else if (weeklyDeficitPerKg < 2 || refeedFrequency > 10) {
    status = 'moderate';
    interpretation = 'Your weekly deficit may be too small for optimal progress, or refeed frequency too low. Consider adjusting refeed frequency or increasing daily deficit slightly.';
  } else if (weeklyDeficitPerKg >= 2 && weeklyDeficitPerKg <= 5) {
    status = 'good';
    interpretation = 'Your refeed plan provides a sustainable weekly deficit. Monitor progress and adjust refeed frequency based on body fat percentage and energy levels.';
  } else {
    status = 'optimal';
    interpretation = 'Your refeed plan is well-balanced, providing adequate deficit while preventing metabolic adaptation. This approach supports sustainable fat loss.';
  }

  const recommendations = [
    'Time refeeds strategically: schedule refeed days when you have intense training sessions to take advantage of increased energy and glycogen stores.',
    'Focus on carbohydrates: prioritize complex carbs (rice, potatoes, oats) and some simple carbs (fruits) to restore glycogen and leptin levels. Maintain protein intake, moderate fats.',
  ];
  
  if (refeedFrequency < 5) {
    recommendations.push('Consider less frequent refeeds: if body fat is above 10%, refeeds every 7-14 days may be sufficient. More frequent refeeds are typically needed at lower body fat levels.');
  }
  
  if (refeedCalorieIncrease > estimatedMaintenance * 0.3) {
    recommendations.push('Moderate refeed calories: very large calorie increases may slow weekly progress. Consider refeeding at maintenance or 10-20% above for most situations.');
  }
  
  if (weeklyDeficit < currentWeight * 2) {
    recommendations.push('Increase weekly deficit: consider slightly larger daily deficits or less frequent refeeds to maintain adequate weekly progress while still preventing metabolic adaptation.');
  }

  const plan = [
    { label: 'This Week', detail: `Implement your first refeed day based on calculated frequency. Monitor energy, hunger, and training performance before and after the refeed.` },
    { label: 'This Month', detail: 'Establish a consistent refeed schedule. Track weekly weight loss, body composition changes, and adjust refeed frequency based on progress and body fat percentage.' },
    { label: 'Ongoing', detail: 'Continue strategic refeeds throughout your dieting phase. As body fat decreases, you may need more frequent refeeds. Reassess every 4-6 weeks based on progress and metabolic markers.' },
  ];

  return { dailyDeficit, refeedFrequency, refeedCalorieIncrease, currentWeight, weeklyDeficit, refeedCalories, averageDailyCalories, status, interpretation, recommendations, plan };
};

export default function DietBreakRefeedDayPlannerCalculator() {
  const [result, setResult] = useState<ResultPayload | null>(null);

  const form = useForm<FormValues>({
    resolver: zodResolver(formSchema),
    defaultValues: {
      dailyDeficit: undefined,
      refeedFrequency: undefined,
      refeedCalorieIncrease: undefined,
      currentWeight: undefined,
    },
  });

  return (
    <div className="space-y-8">
      <Script id="diet-break-refeed-day-planner-schema" type="application/ld+json" strategy="afterInteractive" dangerouslySetInnerHTML={{ __html: JSON.stringify(schemaMarkup) }} />

      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <Activity className="h-5 w-5" />
            Diet Break Refeed Day Planner Calculator
          </CardTitle>
          <CardDescription>Plan strategic refeed days and diet breaks to optimize fat loss while preventing metabolic adaptation.</CardDescription>
        </CardHeader>
      </Card>

      <Card>
        <CardHeader>
          <CardTitle>Input your refeed planning data</CardTitle>
        </CardHeader>
        <CardContent>
          <Form {...form}>
            <form onSubmit={form.handleSubmit((values) => setResult(calculateResult(values)))} className="space-y-6">
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <FormField
                  control={form.control}
                  name="dailyDeficit"
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel>Daily calorie deficit (kcal)</FormLabel>
                      <FormControl>
                        <Input type="number" step="50" placeholder="e.g., 500" value={field.value ?? ''} onChange={(e) => field.onChange(e.target.value === '' ? undefined : Number(e.target.value))} />
                      </FormControl>
                      <FormMessage />
                    </FormItem>
                  )}
                />
                <FormField
                  control={form.control}
                  name="refeedFrequency"
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel>Refeed frequency (days)</FormLabel>
                      <FormControl>
                        <Input type="number" step="1" placeholder="e.g., 7 (weekly)" value={field.value ?? ''} onChange={(e) => field.onChange(e.target.value === '' ? undefined : Number(e.target.value))} />
                      </FormControl>
                      <FormMessage />
                    </FormItem>
                  )}
                />
                <FormField
                  control={form.control}
                  name="refeedCalorieIncrease"
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel>Refeed calorie increase (kcal, optional)</FormLabel>
                      <FormControl>
                        <Input type="number" step="50" placeholder="e.g., 0 (maintenance)" value={field.value ?? ''} onChange={(e) => field.onChange(e.target.value === '' ? undefined : Number(e.target.value))} />
                      </FormControl>
                      <FormMessage />
                    </FormItem>
                  )}
                />
                <FormField
                  control={form.control}
                  name="currentWeight"
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel>Current weight (kg)</FormLabel>
                      <FormControl>
                        <Input type="number" step="0.1" placeholder="e.g., 70" value={field.value ?? ''} onChange={(e) => field.onChange(e.target.value === '' ? undefined : Number(e.target.value))} />
                      </FormControl>
                      <FormMessage />
                    </FormItem>
                  )}
                />
              </div>
              <Button type="submit" className="w-full md:w-auto">
                Calculate refeed plan
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
            <CardDescription>See weekly deficit, refeed calories, and recommendations.</CardDescription>
          </CardHeader>
          <CardContent className="space-y-6">
            <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
              <div className="p-4 border rounded">
                <p className="text-sm text-muted-foreground">Weekly deficit</p>
                <p className="text-2xl font-semibold text-primary">{result.weeklyDeficit.toFixed(0)}</p>
                <p className="text-xs text-muted-foreground">kcal per week</p>
              </div>
              <div className="p-4 border rounded">
                <p className="text-sm text-muted-foreground">Refeed calories</p>
                <p className="text-2xl font-semibold text-primary">{result.refeedCalories.toFixed(0)}</p>
                <p className="text-xs text-muted-foreground">kcal on refeed day</p>
              </div>
              <div className="p-4 border rounded">
                <p className="text-sm text-muted-foreground">Avg daily calories</p>
                <p className="text-2xl font-semibold text-primary">{result.averageDailyCalories.toFixed(0)}</p>
                <p className="text-xs text-muted-foreground">Over refeed cycle</p>
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
            <strong>Weekly deficit</strong> = (Daily Deficit × Deficit Days) - Refeed Calorie Increase. Deficit days = Refeed Frequency - 1 (e.g., weekly refeed = 6 deficit days).
          </p>
          <p>
            <strong>Refeed calories</strong> = Estimated Maintenance + Refeed Calorie Increase. Maintenance is estimated as Weight (kg) × 25 for simplified calculation (adjust for activity level).
          </p>
          <p>
            <strong>Average daily calories</strong> = Total Cycle Calories / Refeed Frequency. Total cycle calories = (Maintenance - Daily Deficit) × Deficit Days + Refeed Calories.
          </p>
          <p>Refeed planning balances weekly deficit for fat loss with strategic calorie increases to prevent metabolic adaptation, restore hormones, and improve adherence. Frequency and calorie increases should be adjusted based on body fat percentage and deficit duration.</p>
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
                <p className="text-sm text-muted-foreground">Deficit days per cycle</p>
                <p className="text-xl font-semibold text-primary">
                  {result.refeedFrequency - 1}
                </p>
                <p className="text-xs text-muted-foreground">Days in deficit</p>
              </div>
              <div className="p-4 border rounded">
                <p className="text-sm text-muted-foreground">Weekly weight loss</p>
                <p className="text-xl font-semibold text-primary">
                  {(result.weeklyDeficit / 7700).toFixed(2)} kg
                </p>
                <p className="text-xs text-muted-foreground">Theoretical (7700 kcal/kg)</p>
              </div>
              <div className="p-4 border rounded">
                <p className="text-sm text-muted-foreground">Refeed frequency</p>
                <p className="text-xl font-semibold text-primary">
                  Every {result.refeedFrequency} days
                </p>
                <p className="text-xs text-muted-foreground">Days between refeeds</p>
              </div>
            </div>
          ) : (
            <p className="text-sm text-muted-foreground">Enter your refeed planning data to see additional insights.</p>
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
    <meta itemProp="name" content="The Definitive Guide to Diet Breaks and Refeed Days: Strategic Calorie Management for Fat Loss" />
    <meta itemProp="description" content="An expert guide on planning refeed days and diet breaks to optimize fat loss, prevent metabolic adaptation, restore hormones, and improve long-term diet adherence." />
    <meta itemProp="keywords" content="diet break calculator, refeed day planner, metabolic adaptation prevention, leptin restoration, strategic calorie cycling, fat loss optimization" />
    <meta itemProp="author" content="[Your Site's Health Team]" />
    <meta itemProp="datePublished" content="2025-12-01" />
    <meta itemProp="url" content="/definitive-diet-break-refeed-guide" />

    <h1 className="text-3xl md:text-4xl font-extrabold text-foreground mb-4" itemProp="headline">The Definitive Guide to Diet Breaks and Refeed Days: Strategic Calorie Management for Sustainable Fat Loss</h1>
    <p className="text-lg italic text-gray-700">Explore the science of refeed days and diet breaks, their role in preventing metabolic adaptation, restoring hormones, and optimizing long-term fat loss success.</p>

    <h2 className="text-2xl font-bold text-foreground mt-8 mb-4">Table of Contents: Jump to a Section</h2>
    <ul className="list-disc ml-6 space-y-2 text-blue-600">
        <li><a href="#what-are-refeeds" className="hover:underline">What Are Refeed Days and Diet Breaks</a></li>
        <li><a href="#metabolic-adaptation" className="hover:underline">Understanding Metabolic Adaptation</a></li>
        <li><a href="#hormone-restoration" className="hover:underline">Hormone Restoration and Leptin</a></li>
        <li><a href="#planning-refeeds" className="hover:underline">Planning Strategic Refeed Days</a></li>
        <li><a href="#implementation" className="hover:underline">Implementation and Best Practices</a></li>
    </ul>
<hr />

    <h2 id="what-are-refeeds" className="text-2xl font-bold text-foreground pt-8" itemProp="articleSection">What Are Refeed Days and Diet Breaks</h2>
    <p>**Refeed days** and **diet breaks** are strategic periods where you temporarily increase calorie intake during an extended calorie deficit. While they may seem counterintuitive to fat loss, they play crucial roles in preventing metabolic slowdown, restoring hormone levels, and improving long-term adherence.</p>

<h3 className="text-xl font-semibold text-foreground mt-6">Refeed Days vs. Diet Breaks</h3>
<p><b>Refeed days</b> are single days (typically 1-2 days) where calories are increased to maintenance or slightly above, with emphasis on carbohydrates. They're integrated into an ongoing calorie deficit.</p>
<p><b>Diet breaks</b> are longer periods (typically 1-2 weeks) where you eat at maintenance calories, providing a more extended metabolic reset. They're often used after 8-12 weeks of dieting.</p>
<p>Both strategies serve similar purposes but differ in duration and application. Refeed days are more frequent and shorter; diet breaks are less frequent but longer.</p>

<h3 className="text-xl font-semibold text-foreground mt-6">Why Refeed Days Matter</h3>
<p>Extended calorie deficits trigger several adaptive responses that can slow progress:</p>
<ul>
    <li><b>Metabolic adaptation:</b> Your metabolism slows to conserve energy</li>
    <li><b>Hormone suppression:</b> Leptin, thyroid hormones, and sex hormones decrease</li>
    <li><b>Increased hunger:</b> Ghrelin increases, making adherence difficult</li>
    <li><b>Decreased energy:</b> Training performance and daily energy levels decline</li>
    <li><b>Psychological fatigue:</b> Diet fatigue and mental exhaustion increase</li>
</ul>
<p>Refeed days help counteract these adaptations, making them essential for sustainable fat loss.</p>

<hr />

    <h2 id="metabolic-adaptation" className="text-2xl font-bold text-foreground pt-8" itemProp="articleSection">Understanding Metabolic Adaptation</h2>
    <p>**Metabolic adaptation** (also called adaptive thermogenesis) is your body's natural response to prolonged calorie restriction. It's a survival mechanism that reduces energy expenditure to match reduced energy intake, but it can significantly slow fat loss progress.</p>

    <h3 className="text-xl font-semibold text-foreground mt-6">How Metabolic Adaptation Works</h3>
    <p>When you maintain a calorie deficit, your body adapts by:</p>
    <ul>
        <li><b>Reducing resting metabolic rate (RMR):</b> Your body burns fewer calories at rest</li>
        <li><b>Decreasing non-exercise activity thermogenesis (NEAT):</b> You move less throughout the day</li>
        <li><b>Lowering exercise efficiency:</b> You burn fewer calories during the same workouts</li>
        <li><b>Suppressing hormone production:</b> Thyroid, leptin, and sex hormones decrease</li>
    </ul>
    <p>These adaptations can reduce total daily energy expenditure (TDEE) by 10-20% or more, making continued fat loss increasingly difficult.</p>

    <h3 className="text-xl font-semibold text-foreground mt-6">Preventing Metabolic Adaptation</h3>
    <p>Strategic refeed days help prevent or reverse metabolic adaptation by:</p>
    <ul>
        <li>Temporarily increasing calorie intake, signaling to your body that food is available</li>
        <li>Restoring glycogen stores, which can improve metabolic rate</li>
        <li>Providing psychological relief, improving long-term adherence</li>
        <li>Allowing for better training performance, maintaining muscle mass</li>
    </ul>

<hr />

    <h2 id="hormone-restoration" className="text-2xl font-bold text-foreground pt-8" itemProp="articleSection">Hormone Restoration and Leptin</h2>
    <p>One of the most important benefits of refeed days is **leptin restoration**. Leptin is a hormone produced by fat cells that signals satiety and regulates energy expenditure. During calorie deficits, leptin levels drop, contributing to increased hunger and metabolic slowdown.</p>

    <h3 className="text-xl font-semibold text-foreground mt-6">The Role of Leptin</h3>
    <p>Leptin serves multiple functions:</p>
    <ul>
        <li><b>Satiety signaling:</b> Tells your brain you're full</li>
        <li><b>Metabolic regulation:</b> Influences metabolic rate and energy expenditure</li>
        <li><b>Reproductive function:</b> Low leptin can disrupt menstrual cycles and libido</li>
        <li><b>Immune function:</b> Plays roles in immune system regulation</li>
    </ul>
    <p>During extended deficits, leptin can drop by 50% or more, significantly impacting hunger, energy, and metabolism.</p>

    <h3 className="text-xl font-semibold text-foreground mt-6">Carbohydrates and Leptin</h3>
    <p>Carbohydrate intake, particularly from high-glycemic sources, has a strong effect on leptin levels. This is why refeed days emphasize carbohydrates:</p>
    <ul>
        <li>Carbohydrates restore glycogen stores, which can improve leptin signaling</li>
        <li>Insulin response from carbs can temporarily increase leptin</li>
        <li>Higher calorie intake from carbs provides energy for metabolic processes</li>
    </ul>
    <p>This is why refeed days should focus on carbohydrates rather than just increasing any calories.</p>

<hr />

    <h2 id="planning-refeeds" className="text-2xl font-bold text-foreground pt-8" itemProp="articleSection">Planning Strategic Refeed Days</h2>
    <p>Effective refeed planning requires considering several factors: body fat percentage, deficit size, diet duration, and individual response. This calculator helps determine optimal refeed frequency and calorie increases.</p>

    <h3 className="text-xl font-semibold text-foreground mt-6">Refeed Frequency Guidelines</h3>
    <p>Refeed frequency should be based on body fat percentage:</p>
    <ul>
        <li><b>10%+ body fat (men) / 20%+ (women):</b> Refeed every 7-14 days</li>
        <li><b>8-10% body fat (men) / 18-20% (women):</b> Refeed every 5-7 days</li>
        <li><b>Below 8% (men) / Below 18% (women):</b> Refeed every 3-5 days</li>
    </ul>
    <p>Larger deficits and longer dieting periods may require more frequent refeeds. Listen to your body's signals: persistent fatigue, increased hunger, or decreased performance may indicate the need for a refeed.</p>

    <h3 className="text-xl font-semibold text-foreground mt-6">Refeed Calorie Targets</h3>
    <p>Most refeed days should target maintenance calories (TDEE):</p>
    <ul>
        <li><b>Standard refeed:</b> Eat at maintenance (0% above TDEE)</li>
        <li><b>Aggressive refeed:</b> 20-30% above maintenance (for very lean individuals or extended deficits)</li>
        <li><b>Conservative refeed:</b> 10-15% above maintenance (if concerned about weekly progress)</li>
    </ul>
    <p>For most people, eating at maintenance is sufficient. More aggressive refeeds may be beneficial but can slow weekly progress.</p>

    <h3 className="text-xl font-semibold text-foreground mt-6">Macronutrient Focus</h3>
    <p>Refeed days should emphasize carbohydrates:</p>
    <ul>
        <li><b>Carbohydrates:</b> 60-70% of refeed calories, focusing on complex carbs (rice, potatoes, oats) and some simple carbs (fruits)</li>
        <li><b>Protein:</b> Maintain normal protein intake (1.6-2.2g per kg body weight)</li>
        <li><b>Fats:</b> Moderate fat intake (20-30% of calories)</li>
    </ul>
    <p>The goal is to restore glycogen and leptin, not to binge on junk food. Prioritize nutrient-dense carbohydrate sources.</p>

<hr />

    <h2 id="implementation" className="text-2xl font-bold text-foreground pt-8" itemProp="articleSection">Implementation and Best Practices</h2>
    <p>Successfully implementing refeed days requires planning, structure, and monitoring. Here are evidence-based best practices:</p>

    <h3 className="text-xl font-semibold text-foreground mt-6">1. Schedule Refeeds Strategically</h3>
    <ul>
        <li><b>Training days:</b> Many people prefer refeed days on intense training days to take advantage of increased energy and glycogen</li>
        <li><b>Consistency:</b> Maintain a consistent refeed schedule (e.g., every 7 days) rather than random timing</li>
        <li><b>Social events:</b> If possible, align refeed days with social events or meals out to improve adherence</li>
    </ul>

    <h3 className="text-xl font-semibold text-foreground mt-6">2. Monitor Progress</h3>
    <ul>
        <li><b>Weekly weight:</b> Track weekly average weight, not daily fluctuations (refeed days cause temporary water weight gain)</li>
        <li><b>Body composition:</b> Use body fat measurements, photos, or measurements to assess progress beyond scale weight</li>
        <li><b>Energy and performance:</b> Monitor training performance, energy levels, and hunger signals</li>
    </ul>

    <h3 className="text-xl font-semibold text-foreground mt-6">3. Adjust as Needed</h3>
    <ul>
        <li><b>If progress stalls:</b> Consider longer diet breaks (1-2 weeks at maintenance) or reducing refeed frequency</li>
        <li><b>If energy crashes:</b> Increase refeed frequency or calorie increases</li>
        <li><b>If adherence suffers:</b> More frequent refeeds may improve psychological well-being and long-term compliance</li>
    </ul>

    <h3 className="text-xl font-semibold text-foreground mt-6">4. Common Mistakes to Avoid</h3>
    <ul>
        <li><b>Treating refeeds as cheat days:</b> Refeed days should be structured, not unrestricted binges</li>
        <li><b>Too frequent refeeds:</b> Refeeding too often can eliminate weekly deficit and slow progress</li>
        <li><b>Ignoring refeeds:</b> Extended deficits without refeeds increase metabolic adaptation risk</li>
        <li><b>Worrying about water weight:</b> Temporary water weight gain (2-5 lbs) is normal and temporary</li>
    </ul>

<hr />

    <h2 className="text-2xl font-bold text-foreground pt-8" itemProp="articleSection">Conclusion</h2>
    <p>Strategic refeed days and diet breaks are essential tools for sustainable fat loss. By preventing metabolic adaptation, restoring hormones, and improving adherence, they can actually accelerate long-term progress despite temporarily pausing the calorie deficit. Use this calculator to plan your refeed strategy, monitor your progress, and adjust based on your body's response. Remember: the goal is sustainable fat loss, not rapid short-term results that lead to metabolic damage and rebound weight gain.</p>
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
          <p>This tool calculates refeed day plans based on daily deficit, refeed frequency, calorie increases, and current weight.</p>
          <p>Outputs include weekly deficit, refeed calories, average daily calories, status, recommendations, an action plan, and supporting metrics.</p>
          <p>Formula, steps, guide content, related tools, and FAQs ensure humans or AI assistants can interpret the methodology instantly.</p>
        </CardContent>
      </Card>
    </div>
  );
}


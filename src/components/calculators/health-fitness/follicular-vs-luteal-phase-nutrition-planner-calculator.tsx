'use client';

import { useState } from 'react';
import Script from 'next/script';
import Link from 'next/link';
import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import { z } from 'zod';
import { Apple, Zap, Target, Activity, Shield } from 'lucide-react';

import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Form, FormControl, FormField, FormItem, FormLabel, FormMessage } from '@/components/ui/form';
import { Input } from '@/components/ui/input';

const formSchema = z.object({
  cycleDay: z.number({ invalid_type_error: 'Enter cycle day' }).min(1).max(35),
  phase: z.enum(['follicular', 'luteal']),
  bmr: z.number({ invalid_type_error: 'Enter BMR' }).min(1000).max(3000),
  activityLevel: z.number({ invalid_type_error: 'Enter activity level' }).min(1).max(10),
  goals: z.enum(['maintain', 'lose', 'gain']),
});

type FormValues = z.infer<typeof formSchema>;

type ResultPayload = {
  calorieTarget: number;
  proteinGrams: number;
  carbGrams: number;
  fatGrams: number;
  ironFocus: number;
  status: 'follicular-optimized' | 'luteal-optimized';
  interpretation: string;
  recommendations: string[];
  plan: { label: string; detail: string }[];
};

const steps = [
  'Enter your current cycle day (day 1 = first day of period).',
  'Select your current phase (follicular = days 1-14, luteal = days 15-28+).',
  'Input your BMR (basal metabolic rate) in calories.',
  'Rate your activity level (1 = sedentary, 10 = very active).',
  'Choose your goal: maintain, lose, or gain weight.',
  'Review phase-specific nutrition targets and recommendations.',
];

const faqs = [
  {
    question: 'What is the difference between follicular and luteal phases?',
    answer:
      'Follicular phase (days 1-14): lower progesterone, rising estrogen. Luteal phase (days 15-28+): higher progesterone, different energy needs. Nutrition can be tailored to each phase.',
  },
  {
    question: 'Do calorie needs change during the cycle?',
    answer:
      'Yes. Luteal phase typically requires 100-300 more calories daily due to increased metabolic rate and progesterone. Follicular phase needs are lower.',
  },
  {
    question: 'What nutrients are important in each phase?',
    answer:
      'Follicular: iron (replenish after period), B vitamins. Luteal: magnesium, complex carbs (for mood/energy), protein (for progesterone support).',
  },
  {
    question: 'Can I lose weight during my period?',
    answer:
      'Yes, but be mindful of iron needs. Focus on nutrient-dense foods and avoid severe restriction during menstruation.',
  },
  {
    question: 'How does protein need change?',
    answer:
      'Luteal phase may benefit from slightly higher protein (1.2-1.6 g/kg) to support progesterone and maintain muscle during higher calorie needs.',
  },
  {
    question: 'What about carbs?',
    answer:
      'Luteal phase often benefits from more complex carbs to support serotonin production and energy. Follicular phase can be lower carb.',
  },
  {
    question: 'Should I track macros daily?',
    answer:
      'Tracking can help, but focus on weekly averages. Hormonal fluctuations mean daily needs vary. Aim for phase-appropriate ranges.',
  },
  {
    question: 'Can this help with PMS symptoms?',
    answer:
      'Possibly. Luteal phase nutrition (magnesium, complex carbs, adequate calories) may help reduce PMS symptoms like mood swings and cravings.',
  },
  {
    question: 'What if my cycle is irregular?',
    answer:
      'Use average cycle length or track symptoms. The calculator can still provide guidance, but consult a healthcare provider for irregular cycles.',
  },
  {
    question: 'Do I need supplements?',
    answer:
      'Possibly. Iron (follicular), magnesium (luteal), and B vitamins may be helpful. Consult a healthcare provider before starting supplements.',
  },
];

const relatedCalculators = [
  {
    name: 'Ovulation Window Probability (Advanced) Calculator',
    slug: 'ovulation-window-probability-advanced-calculator',
    description: 'Track ovulation timing to plan nutrition phases.',
  },
  {
    name: 'Menstrual Phase Workout Intensity Planner',
    slug: 'menstrual-phase-workout-intensity-planner',
    description: 'Coordinate nutrition with workout intensity by cycle phase.',
  },
  {
    name: 'BMR Calculator',
    slug: 'bmr-calculator',
    description: 'Calculate your basal metabolic rate for nutrition planning.',
  },
  {
    name: 'Iron Intake Calculator',
    slug: 'protein-intake-calculator',
    description: 'Track iron needs, especially important during follicular phase.',
  },
];

const baseUrl = 'https://mycalculating.com/category/health-fitness/follicular-vs-luteal-phase-nutrition-planner-calculator';

const schemaMarkup = {
  '@context': 'https://schema.org',
  '@graph': [
    {
      '@type': 'BreadcrumbList',
      itemListElement: [
        { '@type': 'ListItem', position: 1, name: 'Home', item: 'https://mycalculating.com' },
        { '@type': 'ListItem', position: 2, name: 'Health & Fitness', item: 'https://mycalculating.com/category/health-fitness' },
        { '@type': 'ListItem', position: 3, name: 'Follicular vs Luteal Phase Nutrition Planner Calculator', item: baseUrl },
      ],
    },
    {
      '@type': 'SoftwareApplication',
      name: 'Follicular vs Luteal Phase Nutrition Planner Calculator',
      applicationCategory: 'Calculator',
      operatingSystem: 'Web Browser',
      description: 'Plan phase-specific nutrition targets for follicular and luteal phases to optimize energy and hormonal health.',
      url: baseUrl,
      offers: { '@type': 'Offer', price: '0', priceCurrency: 'USD' },
    },
  ],
};

const clamp = (value: number, min: number, max: number) => Math.min(max, Math.max(min, value));

const calculateResult = (values: FormValues): ResultPayload => {
  const activityMultiplier = 1.2 + (values.activityLevel - 1) * 0.1; // 1.2 to 2.1
  let baseCalories = values.bmr * activityMultiplier;
  
  // Phase adjustments
  if (values.phase === 'luteal') {
    baseCalories += 150; // Luteal phase needs ~100-300 more calories
  }
  
  // Goal adjustments
  if (values.goals === 'lose') {
    baseCalories -= 300;
  } else if (values.goals === 'gain') {
    baseCalories += 300;
  }
  
  const calorieTarget = clamp(baseCalories, 1200, 3500);
  
  // Macro calculations (phase-specific)
  let proteinGrams, carbGrams, fatGrams;
  if (values.phase === 'follicular') {
    proteinGrams = clamp(calorieTarget * 0.25 / 4, 60, 200); // 25% protein
    carbGrams = clamp(calorieTarget * 0.40 / 4, 100, 400); // 40% carbs
    fatGrams = clamp(calorieTarget * 0.35 / 9, 30, 120); // 35% fat
  } else { // luteal
    proteinGrams = clamp(calorieTarget * 0.28 / 4, 70, 220); // 28% protein (slightly higher)
    carbGrams = clamp(calorieTarget * 0.45 / 4, 120, 450); // 45% carbs (higher for mood/energy)
    fatGrams = clamp(calorieTarget * 0.27 / 9, 30, 110); // 27% fat
  }
  
  const ironFocus = values.phase === 'follicular' ? 18 : 15; // Higher iron focus in follicular (post-period)
  
  let status: ResultPayload['status'] = 'follicular-optimized';
  let interpretation =
    'This pattern is tuned toward the early part of your cycle, with a gentle emphasis on iron‑supportive foods and steady energy.';
  
  if (values.phase === 'luteal') {
    status = 'luteal-optimized';
    interpretation =
      'This pattern is tuned toward the later part of your cycle, with slightly more overall energy and complex carbs for comfort and steadier mood.';
  }

  const recommendations = [
    values.phase === 'follicular'
      ? 'You might lean a bit more on iron‑supportive foods you enjoy (like legumes, leafy greens, or fortified options) after your period.'
      : 'You might find that including more gentle, complex carbs (such as whole grains or root vegetables) feels supportive later in your cycle.',
    values.phase === 'follicular'
      ? 'Balancing carbs with protein and fats that sit well with you can help keep energy steadier through the day.'
      : 'Many people like to add magnesium‑rich foods (nuts, seeds, cocoa, leafy greens) if they notice mood or tension shifts pre‑period.',
    'Staying hydrated across the month can be helpful; some notice they appreciate a bit more fluid in the days before a period.',
  ];
  
  if (values.goals === 'lose') {
    recommendations.push('If your goal involves weight change, a modest, sustainable shift in intake is usually kinder than large or strict changes—especially in the days before your period.');
  }

  const plan = [
    { label: 'This Week', detail: `Notice how eating in this way during your current phase feels in terms of comfort, energy, and mood.` },
    { label: 'Next Phase', detail: 'When your phase shifts, you can gently adjust portions and foods and see what feels most supportive.' },
    { label: 'Ongoing', detail: 'Over time, keep only the phase‑based nutrition habits that genuinely help you feel better in your own body.' },
  ];

  return { calorieTarget, proteinGrams, carbGrams, fatGrams, ironFocus, status, interpretation, recommendations, plan };
};

export default function FollicularVsLutealPhaseNutritionPlannerCalculator() {
  const [result, setResult] = useState<ResultPayload | null>(null);

  const form = useForm<FormValues>({
    resolver: zodResolver(formSchema),
    defaultValues: {
      cycleDay: undefined,
      phase: 'follicular',
      bmr: undefined,
      activityLevel: undefined,
      goals: 'maintain',
    },
  });

  return (
    <div className="space-y-8">
      <Script id="follicular-luteal-nutrition-schema" type="application/ld+json" strategy="afterInteractive" dangerouslySetInnerHTML={{ __html: JSON.stringify(schemaMarkup) }} />

      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <Apple className="h-5 w-5" />
            Follicular vs Luteal Phase Nutrition Planner Calculator
          </CardTitle>
          <CardDescription>Plan phase-specific nutrition targets for follicular and luteal phases to optimize energy and hormonal health.</CardDescription>
        </CardHeader>
      </Card>

      <Card>
        <CardHeader>
          <CardTitle>Input your cycle and goals</CardTitle>
        </CardHeader>
        <CardContent>
          <Form {...form}>
            <form onSubmit={form.handleSubmit((values) => setResult(calculateResult(values)))} className="space-y-6">
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <FormField
                  control={form.control}
                  name="cycleDay"
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel>Cycle day</FormLabel>
                      <FormControl>
                        <Input type="number" step="1" placeholder="e.g., 7" value={field.value ?? ''} onChange={(e) => field.onChange(e.target.value === '' ? undefined : Number(e.target.value))} />
                      </FormControl>
                      <FormMessage />
                    </FormItem>
                  )}
                />
                <FormField
                  control={form.control}
                  name="phase"
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel>Phase</FormLabel>
                      <FormControl>
                        <select
                          value={field.value}
                          onChange={(e) => field.onChange(e.target.value as 'follicular' | 'luteal')}
                          className="flex h-10 w-full rounded-md border border-input bg-background px-3 py-2 text-sm ring-offset-background"
                        >
                          <option value="follicular">Follicular (days 1-14)</option>
                          <option value="luteal">Luteal (days 15-28+)</option>
                        </select>
                      </FormControl>
                      <FormMessage />
                    </FormItem>
                  )}
                />
                <FormField
                  control={form.control}
                  name="bmr"
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel>BMR (calories)</FormLabel>
                      <FormControl>
                        <Input type="number" step="10" placeholder="e.g., 1400" value={field.value ?? ''} onChange={(e) => field.onChange(e.target.value === '' ? undefined : Number(e.target.value))} />
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
                      <FormLabel>Activity level (1-10)</FormLabel>
                      <FormControl>
                        <Input type="number" step="1" placeholder="e.g., 6" value={field.value ?? ''} onChange={(e) => field.onChange(e.target.value === '' ? undefined : Number(e.target.value))} />
                      </FormControl>
                      <FormMessage />
                    </FormItem>
                  )}
                />
                <FormField
                  control={form.control}
                  name="goals"
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel>Goal</FormLabel>
                      <FormControl>
                        <select
                          value={field.value}
                          onChange={(e) => field.onChange(e.target.value as 'maintain' | 'lose' | 'gain')}
                          className="flex h-10 w-full rounded-md border border-input bg-background px-3 py-2 text-sm ring-offset-background"
                        >
                          <option value="maintain">Maintain weight</option>
                          <option value="lose">Lose weight</option>
                          <option value="gain">Gain weight</option>
                        </select>
                      </FormControl>
                      <FormMessage />
                    </FormItem>
                  )}
                />
              </div>
              <Button type="submit" className="w-full md:w-auto">
                Calculate nutrition plan
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
            <CardDescription>See phase-specific nutrition targets and recommendations.</CardDescription>
          </CardHeader>
          <CardContent className="space-y-6">
            <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
              <div className="p-4 border rounded">
                <p className="text-sm text-muted-foreground">Calorie target</p>
                <p className="text-2xl font-semibold text-primary">{result.calorieTarget.toFixed(0)}</p>
                <p className="text-xs text-muted-foreground">Calories/day</p>
              </div>
              <div className="p-4 border rounded">
                <p className="text-sm text-muted-foreground">Protein</p>
                <p className="text-2xl font-semibold text-primary">{result.proteinGrams.toFixed(0)}g</p>
                <p className="text-xs text-muted-foreground">Per day</p>
              </div>
              <div className="p-4 border rounded">
                <p className="text-sm text-muted-foreground">Carbs</p>
                <p className="text-2xl font-semibold text-primary">{result.carbGrams.toFixed(0)}g</p>
                <p className="text-xs text-muted-foreground">Per day</p>
              </div>
              <div className="p-4 border rounded">
                <p className="text-sm text-muted-foreground">Fat</p>
                <p className="text-2xl font-semibold text-primary">{result.fatGrams.toFixed(0)}g</p>
                <p className="text-xs text-muted-foreground">Per day</p>
              </div>
            </div>
            <div className="p-4 border rounded">
              <p className="text-sm text-muted-foreground">Iron focus</p>
              <p className="text-lg font-semibold text-primary">{result.ironFocus} mg/day</p>
                <p className="text-xs text-muted-foreground">{result.interpretation}</p>
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
          <p><strong>Calorie target</strong> = BMR × activity multiplier + phase adjustment (luteal +150 cal) + goal adjustment (±300 cal).</p>
          <p><strong>Follicular macros</strong>: 25% protein, 40% carbs, 35% fat. <strong>Luteal macros</strong>: 28% protein, 45% carbs, 27% fat.</p>
          <p><strong>Iron focus</strong>: Follicular 18 mg/day (post-period), Luteal 15 mg/day.</p>
          <p>Luteal phase requires more calories and carbs to support progesterone and mood stability.</p>
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
                <p className="text-sm text-muted-foreground">Protein per kg</p>
                <p className="text-xl font-semibold text-primary">
                  {(result.proteinGrams / 70).toFixed(1)} g/kg
                </p>
                <p className="text-xs text-muted-foreground">Assuming 70kg body weight</p>
              </div>
              <div className="p-4 border rounded">
                <p className="text-sm text-muted-foreground">Phase calorie difference</p>
                <p className="text-xl font-semibold text-primary">
                  {form.getValues().phase === 'luteal' ? '+150' : '-150'} cal
                </p>
                <p className="text-xs text-muted-foreground">vs opposite phase</p>
              </div>
              <div className="p-4 border rounded">
                <p className="text-sm text-muted-foreground">Macro split</p>
                <p className="text-xl font-semibold text-primary">
                  P:{((result.proteinGrams * 4 / result.calorieTarget) * 100).toFixed(0)}% C:{((result.carbGrams * 4 / result.calorieTarget) * 100).toFixed(0)}% F:{((result.fatGrams * 9 / result.calorieTarget) * 100).toFixed(0)}%
                </p>
                <p className="text-xs text-muted-foreground">Protein / Carbs / Fat</p>
              </div>
            </div>
          ) : (
            <p className="text-sm text-muted-foreground">Enter your cycle and goals to see additional metrics.</p>
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

      <Card>
        <CardHeader>
          <CardTitle>Complete guide snapshot</CardTitle>
        </CardHeader>
        <CardContent className="prose prose-sm dark:prose-invert max-w-none">
          <p>Nutrition needs vary by menstrual cycle phase. Follicular phase benefits from iron-rich foods and moderate carbs, while luteal phase needs more calories, complex carbs, and protein.</p>
          <p>Use this calculator to plan phase-specific nutrition targets and optimize energy, mood, and hormonal health throughout your cycle.</p>
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
          <p>This tool suggests phase‑aware calorie and macro ranges based on your inputs, offering one way to reflect on how food and your cycle interact.</p>
          <p>You can use the outputs as gentle ideas to try—always adjusting for your own comfort, preferences, cultural context, and any guidance from your care team.</p>
        </CardContent>
      </Card>

      <p className="mt-6 text-xs text-muted-foreground text-center">
        Disclaimer: This tool provides general wellness and lifestyle insights for educational purposes only. It is not a
        medical or psychological diagnosis. For any health concerns, please consult a qualified professional.
      </p>
    </div>
  );
}


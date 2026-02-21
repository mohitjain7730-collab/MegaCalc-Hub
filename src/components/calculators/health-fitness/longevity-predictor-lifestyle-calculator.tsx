'use client';

import { useState } from 'react';
import Script from 'next/script';
import Link from 'next/link';
import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import { z } from 'zod';
import { HeartPulse, Target, Activity, Shield, BookMarked } from 'lucide-react';

import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Form, FormControl, FormField, FormItem, FormLabel, FormMessage } from '@/components/ui/form';
import { Input } from '@/components/ui/input';

const formSchema = z.object({
  ageYears: z.number({ invalid_type_error: 'Enter your age' }).min(18).max(90),
  restingHeartRate: z.number({ invalid_type_error: 'Enter resting heart rate' }).min(35).max(110),
  weeklyModerateMinutes: z.number({ invalid_type_error: 'Enter activity minutes' }).min(0).max(900),
  fruitVegServingsPerDay: z.number({ invalid_type_error: 'Enter servings' }).min(0).max(15),
  smokingStatus: z.number({ invalid_type_error: 'Enter 0, 1, or 2' }).min(0).max(2), // 0 = never, 1 = past, 2 = current
});

type FormValues = z.infer<typeof formSchema>;

type ResultPayload = {
  healthyLifeExpectancy: number;
  addedYearsVsBaseline: number;
  band: 'below-average' | 'average' | 'above-average';
  interpretation: string;
  recommendations: string[];
  plan: { label: string; detail: string }[];
};

const steps = [
  'Enter your current age in years.',
  'Measure or estimate your resting heart rate (beats per minute) at rest.',
  'Log total minutes of moderate activity (brisk walking, easy cycling, etc.) you typically accumulate each week.',
  'Estimate average daily fruit and vegetable servings.',
  'Indicate whether you are a never, past, or current smoker (0, 1, or 2).',
];

const faqs = [
  {
    question: 'Is this tool giving an exact prediction of my lifespan?',
    answer:
      'No. It provides a rough, lifestyle-based estimate of healthy-life expectancy based on broad epidemiological patterns, not personal medical data.',
  },
  {
    question: 'Why is resting heart rate included?',
    answer:
      'Lower resting heart rates (within a healthy range) often indicate better cardiovascular fitness, which is linked to longevity.',
  },
  {
    question: 'How does smoking status affect the score?',
    answer:
      'Current smoking heavily reduces the estimated healthy-life expectancy in this model; quitting tends to shift the curve in a better direction over time.',
  },
  {
    question: 'Can I treat this as medical advice?',
    answer:
      'No. It is an educational calculator only. Always discuss prevention and treatment decisions with healthcare professionals.',
  },
  {
    question: 'What counts as moderate activity?',
    answer:
      'Activities that raise your heart rate and breathing but still allow conversation, like brisk walking or light cycling.',
  },
  {
    question: 'What if I have chronic health conditions?',
    answer:
      'Underlying conditions, medications, genetics, and healthcare access all matter but are not modeled here. Use this as a lifestyle lens only.',
  },
  {
    question: 'Can improving my habits change the estimate?',
    answer:
      'Yes. Higher activity, more plant foods, and not smoking usually nudge the prediction upward in this model.',
  },
  {
    question: 'Does high-intensity training count extra?',
    answer:
      'This simple model focuses on total moderate-equivalent minutes rather than detailed intensity splits.',
  },
  {
    question: 'Why are fruit and vegetable servings emphasized?',
    answer:
      'Higher intake is consistently associated with lower risk of many chronic diseases tied to lifespan and healthspan.',
  },
  {
    question: 'Should I ignore genetic risk if my lifestyle score is high?',
    answer:
      'No. Genetics and family history remain important. The tool simply highlights where lifestyle may support better outcomes.',
  },
];

const relatedCalculators = [
  {
    name: 'Blue Zone Lifestyle Score Calculator',
    slug: 'blue-zone-lifestyle-score-calculator',
    description: 'Check how closely your habits match patterns seen in long-lived populations.',
  },
  {
    name: 'Anti-Aging Nutrition Score Calculator',
    slug: 'anti-aging-nutrition-score-calculator',
    description: 'Zoom in on your dietâ€™s alignment with healthy-aging principles.',
  },
  {
    name: 'Cardiometabolic Age Calculator',
    slug: 'cardiometabolic-age-calculator',
    description: 'Estimate how your cardio-metabolic profile compares to your chronological age.',
  },
  {
    name: 'VO2 Max Calculator',
    slug: 'vo2-max-calculator',
    description: 'Assess aerobic fitness, a key piece of longevity research.',
  },
];

const baseUrl = 'https://mycalculating.com/health-fitness/longevity-predictor-lifestyle-calculator';

const schemaMarkup = {
  '@context': 'https://schema.org',
  '@graph': [
    {
      '@type': 'BreadcrumbList',
      itemListElement: [
        { '@type': 'ListItem', position: 1, name: 'Home', item: 'https://mycalculating.com' },
        { '@type': 'ListItem', position: 2, name: 'Health & Fitness', item: 'https://mycalculating.com/health-fitness' },
        { '@type': 'ListItem', position: 3, name: 'Longevity Predictor (Lifestyle-based) Calculator', item: baseUrl },
      ],
    },
    {
      '@type': 'SoftwareApplication',
      name: 'Longevity Predictor (Lifestyle-based) Calculator',
      applicationCategory: 'Calculator',
      operatingSystem: 'Web Browser',
      description: 'Roughly estimate healthy-life expectancy using age, heart rate, movement, diet, and smoking status.',
      url: baseUrl,
      offers: { '@type': 'Offer', price: '0', priceCurrency: 'USD' },
    },
  ],
};

const clamp = (value: number, min: number, max: number) => Math.min(max, Math.max(min, value));

const calculateResult = (values: FormValues): ResultPayload => {
  const baselineLifeExpectancy = 82; // years, generic reference

  const rhrAdjustment = clamp((65 - values.restingHeartRate) / 10, -3, 4);
  const activityAdjustment = clamp((values.weeklyModerateMinutes - 150) / 150 * 3, -3, 4);
  const dietAdjustment = clamp((values.fruitVegServingsPerDay - 3) * 0.5, -2, 3);
  const smokingPenalty = values.smokingStatus === 2 ? -8 : values.smokingStatus === 1 ? -2 : 0;

  const healthyLifeExpectancy = clamp(
    baselineLifeExpectancy + rhrAdjustment + activityAdjustment + dietAdjustment + smokingPenalty,
    55,
    95,
  );

  const addedYearsVsBaseline = healthyLifeExpectancy - baselineLifeExpectancy;

  let band: ResultPayload['band'] = 'average';
  let interpretation =
    'In this simple lifestyle lens, your current pattern looks broadly similar to a generic reference, with room for small experiments if you wish.';

  if (healthyLifeExpectancy < baselineLifeExpectancy - 3) {
    band = 'below-average';
    interpretation =
      'Within this rough model, your snapshot sits a bit below the generic reference. Gentle changes in movement, food, or smoking status could be interesting to explore, if and how it feels right for you.';
  }
  if (healthyLifeExpectancy > baselineLifeExpectancy + 3) {
    band = 'above-average';
    interpretation =
      'Here, your current habits lean in a direction that this model associates with a more supported longâ€‘term pattern. Staying flexible and kind with your routines often matters more than hitting any exact number.';
  }

  const recommendations = [
    'If it feels realistic, you can gently move toward more weekly activity that suits your body and life rhythm.',
    'Adding a bit more color from fruits and vegetables to your meals can be a simple, supportive experiment.',
    'If you currently smoke and ever consider a change, collaborating with healthcare or support resources can make that journey kinder.',
  ];

  if (values.restingHeartRate > 80) {
    recommendations.push('You might note your resting heart rate over time and discuss any concerns with a clinician you trust.');
  }
  if (values.weeklyModerateMinutes < 90) {
    recommendations.push('Short, frequent walks or light activity blocks can be a gentle starting point, building up only as it feels comfortable.');
  }

  const plan = [
    {
      label: 'Next 7 days',
      detail: 'Log your movement, fruit/veg servings, and smoking status honestly to establish a clearer baseline.',
    },
    {
      label: 'Next 30 days',
      detail: 'Play with one sustainable habit experiment (more steps, an extra vegetable serving, or a small shift in smoking patterns) and then see how it feels to you.',
    },
    {
      label: '3â€“6 months',
      detail: 'Over time, you can review your overall pattern with a clinician to weave lifestyle ideas into your broader health picture.',
    },
  ];

  return { healthyLifeExpectancy, addedYearsVsBaseline, band, interpretation, recommendations, plan };
};

export default function LongevityPredictorLifestyleCalculator() {
  const [result, setResult] = useState<ResultPayload | null>(null);

  const form = useForm<FormValues>({
    resolver: zodResolver(formSchema),
    defaultValues: {
      ageYears: undefined,
      restingHeartRate: undefined,
      weeklyModerateMinutes: undefined,
      fruitVegServingsPerDay: undefined,
      smokingStatus: undefined,
    },
  });

  return (
    <div className="space-y-8">
      <Script id="longevity-predictor-lifestyle-schema" type="application/ld+json" strategy="afterInteractive" dangerouslySetInnerHTML={{ __html: JSON.stringify(schemaMarkup) }} />

      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <HeartPulse className="h-5 w-5" />
            Longevity Predictor (Lifestyle-based) Calculator
          </CardTitle>
          <CardDescription>
            See a rough, lifestyle-focused estimate of healthy-life expectancy with simple, adjustable inputs.
          </CardDescription>
        </CardHeader>
      </Card>

      <Card>
        <CardHeader>
          <CardTitle>Input your profile</CardTitle>
        </CardHeader>
        <CardContent>
          <Form {...form}>
            <form onSubmit={form.handleSubmit((values) => setResult(calculateResult(values)))} className="space-y-6">
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <FormField
                  control={form.control}
                  name="ageYears"
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel>Age (years)</FormLabel>
                      <FormControl>
                        <Input
                          type="number"
                          step="1"
                          placeholder="e.g., 42"
                          value={field.value ?? ''}
                          onChange={(e) => field.onChange(e.target.value === '' ? undefined : Number(e.target.value))}
                        />
                      </FormControl>
                      <FormMessage />
                    </FormItem>
                  )}
                />
                <FormField
                  control={form.control}
                  name="restingHeartRate"
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel>Resting heart rate (bpm)</FormLabel>
                      <FormControl>
                        <Input
                          type="number"
                          step="1"
                          placeholder="e.g., 64"
                          value={field.value ?? ''}
                          onChange={(e) => field.onChange(e.target.value === '' ? undefined : Number(e.target.value))}
                        />
                      </FormControl>
                      <FormMessage />
                    </FormItem>
                  )}
                />
                <FormField
                  control={form.control}
                  name="weeklyModerateMinutes"
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel>Moderate activity (minutes/week)</FormLabel>
                      <FormControl>
                        <Input
                          type="number"
                          step="10"
                          placeholder="e.g., 180"
                          value={field.value ?? ''}
                          onChange={(e) => field.onChange(e.target.value === '' ? undefined : Number(e.target.value))}
                        />
                      </FormControl>
                      <FormMessage />
                    </FormItem>
                  )}
                />
                <FormField
                  control={form.control}
                  name="fruitVegServingsPerDay"
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel>Fruit & veg servings per day</FormLabel>
                      <FormControl>
                        <Input
                          type="number"
                          step="1"
                          placeholder="e.g., 5"
                          value={field.value ?? ''}
                          onChange={(e) => field.onChange(e.target.value === '' ? undefined : Number(e.target.value))}
                        />
                      </FormControl>
                      <FormMessage />
                    </FormItem>
                  )}
                />
                <FormField
                  control={form.control}
                  name="smokingStatus"
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel>Smoking status (0 = never, 1 = past, 2 = current)</FormLabel>
                      <FormControl>
                        <Input
                          type="number"
                          step="1"
                          placeholder="e.g., 0"
                          value={field.value ?? ''}
                          onChange={(e) => field.onChange(e.target.value === '' ? undefined : Number(e.target.value))}
                        />
                      </FormControl>
                      <FormMessage />
                    </FormItem>
                  )}
                />
              </div>
              <Button type="submit" className="w-full md:w-auto">
                Estimate healthy-life expectancy
              </Button>
            </form>
          </Form>
        </CardContent>
      </Card>

      {result && (
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <BookMarked className="h-5 w-5 text-primary" />
              Interactive result & interpretation
            </CardTitle>
            <CardDescription>Explore what this simple model suggests about your lifestyle trajectory.</CardDescription>
          </CardHeader>
          <CardContent className="space-y-6">
            <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
              <div className="p-4 border rounded">
                <p className="text-sm text-muted-foreground">Estimated healthy-life expectancy</p>
                <p className="text-2xl font-semibold text-primary">{result.healthyLifeExpectancy.toFixed(1)} years</p>
                <p className="text-xs text-muted-foreground">A rough lifestyle-pattern estimate from this model, not a forecast.</p>
              </div>
              <div className="p-4 border rounded">
                <p className="text-sm text-muted-foreground">Difference vs. 82-year baseline</p>
                <p className="text-2xl font-semibold text-primary">
                  {result.addedYearsVsBaseline >= 0 ? '+' : ''}
                  {result.addedYearsVsBaseline.toFixed(1)} years
                </p>
                <p className="text-xs text-muted-foreground">Shows how this estimate compares with a generic 82â€‘year reference in the model.</p>
              </div>
              <div className="p-4 border rounded">
                <p className="text-sm text-muted-foreground">Band</p>
                <p className="text-2xl font-semibold text-primary capitalize">{result.band.replace('-', ' ')}</p>
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
          <p>
            <strong>Healthy-life expectancy</strong> starts from a generic 82-year baseline and adjusts up or down based on resting heart
            rate, movement, fruit/veg intake, and smoking status.
          </p>
          <p>
            Each factor contributes a small positive or negative shift, then the result is clamped into a 55â€“95 year window for practical
            interpretation.
          </p>
          <p>The equations are simplified and are not calibrated to any specific risk calculator or medical guideline.</p>
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
                <p className="text-sm text-muted-foreground">Activity vs. 150-min target</p>
                <p className="text-xl font-semibold text-primary">
                  {((form.getValues().weeklyModerateMinutes ?? 0) / 150 * 100).toFixed(1)}%
                </p>
                <p className="text-xs text-muted-foreground">Guideline reference for weekly moderate activity.</p>
              </div>
              <div className="p-4 border rounded">
                <p className="text-sm text-muted-foreground">Fruit & veg vs. 5-servings target</p>
                <p className="text-xl font-semibold text-primary">
                  {((form.getValues().fruitVegServingsPerDay ?? 0) / 5 * 100).toFixed(1)}%
                </p>
                <p className="text-xs text-muted-foreground">Benchmark commonly cited in nutrition research.</p>
              </div>
              <div className="p-4 border rounded">
                <p className="text-sm text-muted-foreground">Resting heart rate context</p>
                <p className="text-xl font-semibold text-primary">
                  {(form.getValues().restingHeartRate ?? 0) <= 70 ? 'Favorable' : 'Worth monitoring'}
                </p>
                <p className="text-xs text-muted-foreground">Talk with your clinician about what is right for you.</p>
              </div>
            </div>
          ) : (
            <p className="text-sm text-muted-foreground">Enter your profile to view detailed lifestyle context metrics.</p>
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
          <p>
            Longevity is shaped by many factorsâ€”genes, environment, healthcare, and daily choices all weave together over time.
          </p>
          <p>
            This calculator focuses on the lifestyle threads you can influence, helping you have better conversations with professionals and
            your future self.
          </p>
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
          <p>
            The Longevity Predictor (Lifestyle-based) Calculator offers a rough, lifestyle-focused estimate that reflects how a few everyday
            habits can relate to long-term patterns in this model.
          </p>
          <p>It surfaces where movement, food choices, and smoking status may be nudging your long-term trajectory within this framework.</p>
          <p>Use it for gentle reflection and planning onlyâ€”not as a prediction or substitute for medical judgment.</p>
        </CardContent>
      </Card>

      <p className="mt-6 text-xs text-muted-foreground text-center">
        Disclaimer: This tool provides general wellness and lifestyle insights for educational purposes only. It is not a
        medical or psychological diagnosis. For any health concerns, please consult a qualified professional.
      </p>
    </div>
  );
}



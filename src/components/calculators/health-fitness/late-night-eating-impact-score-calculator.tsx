'use client';

import { useState } from 'react';
import Script from 'next/script';
import Link from 'next/link';
import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import { z } from 'zod';
import { Moon, Zap, Target, Activity, Shield } from 'lucide-react';

import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Form, FormControl, FormField, FormItem, FormLabel, FormMessage } from '@/components/ui/form';
import { Input } from '@/components/ui/input';

const formSchema = z.object({
  dinnerTime: z.string({ invalid_type_error: 'Enter dinner time' }),
  lastMealTime: z.string({ invalid_type_error: 'Enter last meal time' }),
  caloriesAfter8PM: z.number({ invalid_type_error: 'Enter calories after 8 PM' }).min(0).max(2000),
});

type FormValues = z.infer<typeof formSchema>;

type ResultPayload = {
  dinnerTime: string;
  lastMealTime: string;
  caloriesAfter8PM: number;
  hoursAfter8PM: number;
  impactScore: number;
  status: 'optimal' | 'good' | 'moderate' | 'low';
  interpretation: string;
  recommendations: string[];
  plan: { label: string; detail: string }[];
};

const steps = [
  'Enter dinner time (HH:MM) in 24-hour format.',
  'Enter last meal/snack time (HH:MM) in 24-hour format.',
  'Enter total calories consumed after 8:00 PM.',
  'Review late-night eating impact score, hours after 8 PM, and recommendations.',
];

const faqs = [
  {
    question: 'What is late-night eating?',
    answer:
      'Late-night eating refers to consuming food after 8:00 PM or close to bedtime. It can disrupt circadian rhythm, reduce insulin sensitivity, affect sleep quality, and impact metabolic health.',
  },
  {
    question: 'How does late-night eating affect health?',
    answer:
      'Late-night eating can reduce insulin sensitivity, disrupt sleep, affect digestion, and interfere with circadian rhythm. The body\'s metabolic processes are less efficient during evening and night hours.',
  },
  {
    question: 'What is the impact of eating after 8 PM?',
    answer:
      'Eating after 8 PM may reduce insulin sensitivity, increase insulin response, disrupt sleep quality, and interfere with natural metabolic processes that occur during rest periods.',
  },
  {
    question: 'How many calories after 8 PM is acceptable?',
    answer:
      'Ideally, limit calories after 8 PM to less than 200-300 calories, or avoid eating after 8 PM when possible. Larger meals late at night have greater negative metabolic impact.',
  },
  {
    question: 'What about meal timing?',
    answer:
      'Earlier meal timing (finishing dinner by 6-7 PM) supports better metabolic health than late-night eating. Aligning eating with daylight hours supports circadian rhythm and metabolic function.',
  },
  {
    question: 'How do I reduce late-night eating?',
    answer:
      'Reduce late-night eating by eating larger meals earlier in the day, finishing dinner by 6-7 PM, avoiding late snacks, and establishing regular meal timing that aligns with circadian rhythm.',
  },
  {
    question: 'What about sleep and late-night eating?',
    answer:
      'Late-night eating can disrupt sleep by affecting digestion, body temperature, and circadian rhythm. Eating close to bedtime may reduce sleep quality and duration.',
  },
  {
    question: 'Can I track late-night eating at home?',
    answer:
      'Yes. Record meal and snack times, especially those after 8 PM. Track calories consumed after 8 PM and assess how late-night eating affects your sleep, energy, and metabolic health.',
  },
  {
    question: 'What is circadian rhythm?',
    answer:
      'Circadian rhythm is the body\'s 24-hour internal clock. It affects metabolism, insulin sensitivity, and sleep. Eating during daylight hours supports circadian rhythm, while late-night eating disrupts it.',
  },
  {
    question: 'When should I consult a healthcare provider?',
    answer:
      'Consult a healthcare provider or registered dietitian if you have sleep issues, metabolic concerns, need personalized guidance on meal timing, or want to optimize your eating schedule for health goals.',
  },
];

const relatedCalculators = [
  {
    name: 'Meal Timing and Insulin Response Calculator',
    slug: 'meal-timing-and-insulin-response-calculator',
    description: 'Assess meal timing alongside late-night eating.',
  },
  {
    name: 'Eating Window Duration Calculator',
    slug: 'eating-window-duration-calculator',
    description: 'Evaluate eating window alongside late-night eating.',
  },
  {
    name: 'Inter-Meal Spacing Impact Calculator',
    slug: 'inter-meal-spacing-impact-calculator',
    description: 'Assess meal spacing alongside late-night eating.',
  },
  {
    name: 'Breakfast Skipping Effect on Metabolism Calculator',
    slug: 'breakfast-skipping-effect-on-metabolism-calculator',
    description: 'Evaluate meal patterns comprehensively.',
  },
];

const baseUrl = 'https://mycalculating.com/category/health-fitness/late-night-eating-impact-score-calculator';

const schemaMarkup = {
  '@context': 'https://schema.org',
  '@graph': [
    {
      '@type': 'BreadcrumbList',
      itemListElement: [
        { '@type': 'ListItem', position: 1, name: 'Home', item: 'https://mycalculating.com' },
        { '@type': 'ListItem', position: 2, name: 'Health & Fitness', item: 'https://mycalculating.com/category/health-fitness' },
        { '@type': 'ListItem', position: 3, name: 'Late-Night Eating Impact Wellness Score Calculator', item: baseUrl },
      ],
    },
    {
      '@type': 'SoftwareApplication',
      name: 'Late-Night Eating Impact Wellness Score Calculator',
      applicationCategory: 'Calculator',
      operatingSystem: 'Web Browser',
      description: 'Calculate late-night eating impact from dinner time, last meal time, and calories consumed after 8 PM.',
      url: baseUrl,
      offers: { '@type': 'Offer', price: '0', priceCurrency: 'USD' },
    },
  ],
};

const clamp = (value: number, min: number, max: number) => Math.min(max, Math.max(min, value));

const calculateResult = (values: FormValues): ResultPayload => {
  const dinnerTime = values.dinnerTime;
  const lastMealTime = values.lastMealTime;
  const caloriesAfter8PM = values.caloriesAfter8PM;
  
  // Parse times
  const [dinnerHours, dinnerMinutes] = dinnerTime.split(':').map(Number);
  const [lastHours, lastMinutes] = lastMealTime.split(':').map(Number);
  const dinnerHour = dinnerHours + dinnerMinutes / 60;
  const lastMealHour = lastHours + lastMinutes / 60;
  
  // Calculate hours after 8 PM (20:00)
  const hoursAfter8PM = lastMealHour >= 20 ? lastMealHour - 20 : 0;
  
  // Calculate impact score (0-100, higher = worse impact)
  let impactScore = 0;
  
  // Calories component (0-50 points)
  if (caloriesAfter8PM === 0) {
    impactScore = 0; // No late-night eating
  } else if (caloriesAfter8PM < 200) {
    impactScore += 20; // Small amount
  } else if (caloriesAfter8PM < 400) {
    impactScore += 35; // Moderate amount
  } else if (caloriesAfter8PM < 600) {
    impactScore += 45; // Large amount
  } else {
    impactScore += 50; // Very large amount
  }
  
  // Timing component (0-50 points)
  if (lastMealHour < 20) {
    impactScore += 0; // No late-night eating
  } else if (lastMealHour < 21) {
    impactScore += 15; // Early evening
  } else if (lastMealHour < 22) {
    impactScore += 30; // Late evening
  } else if (lastMealHour < 23) {
    impactScore += 40; // Very late
  } else {
    impactScore += 50; // Extremely late
  }
  
  impactScore = clamp(impactScore, 0, 100);
  
  let status: ResultPayload['status'] = 'optimal';
  let interpretation = 'This suggests a general lifestyle tendency where your late-night eating impact may be minimal. You are avoiding eating after 8 PM, which may support optimal metabolic health, sleep quality, and circadian rhythm.';

  if (impactScore > 70 || (caloriesAfter8PM > 500 && lastMealHour >= 21)) {
    status = 'low';
    interpretation = 'This suggests a general lifestyle tendency where your late-night eating impact may be high. Consuming significant calories late at night may disrupt metabolism, reduce insulin sensitivity, and affect sleep quality. You may consider finishing meals earlier and avoiding late-night eating.';
  } else if (impactScore > 50 || caloriesAfter8PM > 300) {
    status = 'moderate';
    interpretation = 'This suggests a general lifestyle tendency where your late-night eating impact may be moderate. You may consider reducing calories after 8 PM and finishing meals earlier to support better metabolic health and sleep quality.';
  } else if (impactScore > 30) {
    status = 'good';
    interpretation = 'This suggests a general lifestyle tendency where your late-night eating impact may be relatively low. You may consider continuing to limit late-night eating to support optimal metabolic health and circadian rhythm.';
  }

  const recommendations = [
    'Finish dinner by 6-7 PM: completing your last meal earlier in the evening supports better metabolic health, insulin sensitivity, and sleep quality than late-night eating.',
    'Limit calories after 8 PM: ideally, consume less than 200-300 calories after 8 PM, or avoid eating after 8 PM when possible to minimize metabolic disruption.',
    'Establish regular meal timing: consistent meal timing that aligns with daylight hours supports circadian rhythm and optimal metabolic function.',
  ];
  if (status === 'low' || status === 'moderate') {
    recommendations.push('Significantly reduce late-night eating. Finish meals earlier, avoid eating after 8 PM when possible, and limit late-night calories to support metabolic health and sleep quality.');
  }
  if (caloriesAfter8PM > 400) {
    recommendations.push('Dramatically reduce calories after 8 PM. Large late-night meals have significant negative metabolic impact. Consider eating larger meals earlier in the day and avoiding late-night eating.');
  }
  if (lastMealHour >= 22) {
    recommendations.push('Avoid eating after 10 PM. Very late eating significantly disrupts circadian rhythm and metabolic processes. Finish all meals and snacks by 8-9 PM for optimal health.');
  }

  const plan = [
    { label: 'This Week', detail: 'Track dinner time, last meal time, and calories after 8 PM. Assess late-night eating patterns and identify opportunities to finish meals earlier.' },
    { label: 'This Month', detail: 'Optimize meal timing: finish dinner by 6-7 PM, limit calories after 8 PM to less than 200-300, and establish regular meal timing to support metabolic health.' },
    { label: 'Ongoing', detail: 'Monitor late-night eating through regular tracking. Maintain early meal completion and minimal late-night eating to support optimal metabolic health, sleep quality, and circadian rhythm.' },
  ];

  return { dinnerTime, lastMealTime, caloriesAfter8PM, hoursAfter8PM, impactScore, status, interpretation, recommendations, plan };
};

export default function LateNightEatingImpactScoreCalculator() {
  const [result, setResult] = useState<ResultPayload | null>(null);

  const form = useForm<FormValues>({
    resolver: zodResolver(formSchema),
    defaultValues: {
      dinnerTime: undefined,
      lastMealTime: undefined,
      caloriesAfter8PM: undefined,
    },
  });

  return (
    <div className="space-y-8">
      <Script id="late-night-eating-schema" type="application/ld+json" strategy="afterInteractive" dangerouslySetInnerHTML={{ __html: JSON.stringify(schemaMarkup) }} />

      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <Moon className="h-5 w-5" />
            Late-Night Eating Impact Wellness Score Calculator
          </CardTitle>
          <CardDescription>Get general wellness insights about late-night eating impact from dinner time, last meal time, and calories consumed after 8 PM. This is a personal lifestyle insight, not a medical evaluation.</CardDescription>
        </CardHeader>
      </Card>

      <Card>
        <CardHeader>
          <CardTitle>Input your late-night eating data</CardTitle>
        </CardHeader>
        <CardContent>
          <Form {...form}>
            <form onSubmit={form.handleSubmit((values) => setResult(calculateResult(values)))} className="space-y-6">
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <FormField
                  control={form.control}
                  name="dinnerTime"
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel>Dinner time (HH:MM)</FormLabel>
                      <FormControl>
                        <Input type="time" placeholder="e.g., 18:00" value={field.value ?? ''} onChange={(e) => field.onChange(e.target.value)} />
                      </FormControl>
                      <FormMessage />
                    </FormItem>
                  )}
                />
                <FormField
                  control={form.control}
                  name="lastMealTime"
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel>Last meal/snack time (HH:MM)</FormLabel>
                      <FormControl>
                        <Input type="time" placeholder="e.g., 20:30" value={field.value ?? ''} onChange={(e) => field.onChange(e.target.value)} />
                      </FormControl>
                      <FormMessage />
                    </FormItem>
                  )}
                />
                <FormField
                  control={form.control}
                  name="caloriesAfter8PM"
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel>Calories after 8:00 PM</FormLabel>
                      <FormControl>
                        <Input type="number" step="1" placeholder="e.g., 300" value={field.value ?? ''} onChange={(e) => field.onChange(e.target.value === '' ? undefined : Number(e.target.value))} />
                      </FormControl>
                      <FormMessage />
                    </FormItem>
                  )}
                />
              </div>
              <Button type="submit" className="w-full md:w-auto">
                Calculate impact score
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
            <CardDescription>See late-night eating impact score, hours after 8 PM, and recommendations.</CardDescription>
          </CardHeader>
          <CardContent className="space-y-6">
            <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
              <div className="p-4 border rounded">
                <p className="text-sm text-muted-foreground">Last meal</p>
                <p className="text-2xl font-semibold text-primary">{result.lastMealTime}</p>
                <p className="text-xs text-muted-foreground">Time</p>
              </div>
              <div className="p-4 border rounded">
                <p className="text-sm text-muted-foreground">Calories after 8 PM</p>
                <p className="text-2xl font-semibold text-primary">{result.caloriesAfter8PM.toFixed(0)}</p>
                <p className="text-xs text-muted-foreground">kcal</p>
              </div>
              <div className="p-4 border rounded">
                <p className="text-sm text-muted-foreground">Impact score</p>
                <p className="text-2xl font-semibold text-primary">{result.impactScore.toFixed(0)}</p>
                <p className="text-xs text-muted-foreground">Out of 100 (lower is better)</p>
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
            <strong>Impact score</strong> = calories component (0-50 points) + timing component (0-50 points). Lower scores indicate less negative impact.
          </p>
          <p>
            <strong>Calories component</strong>: 0 cal = 0 points, &lt;200 cal = 20 points, 200-400 cal = 35 points, 400-600 cal = 45 points, &gt;600 cal = 50 points.
          </p>
          <p>
            <strong>Timing component</strong>: Before 8 PM = 0 points, 8-9 PM = 15 points, 9-10 PM = 30 points, 10-11 PM = 40 points, After 11 PM = 50 points.
          </p>
          <p>
            <strong>Hours after 8 PM</strong> = last meal time - 20:00 (if last meal is after 8 PM).
          </p>
          <p>Late-night eating impact reflects the metabolic disruption from eating after 8 PM. Lower impact (finishing meals earlier, fewer late-night calories) supports better metabolic health, sleep quality, and circadian rhythm.</p>
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
                <p className="text-sm text-muted-foreground">Hours after 8 PM</p>
                <p className="text-xl font-semibold text-primary">{result.hoursAfter8PM.toFixed(1)}</p>
                <p className="text-xs text-muted-foreground">Hours</p>
              </div>
              <div className="p-4 border rounded">
                <p className="text-sm text-muted-foreground">Target calories</p>
                <p className="text-xl font-semibold text-primary">&lt; 200-300</p>
                <p className="text-xs text-muted-foreground">After 8 PM</p>
              </div>
              <div className="p-4 border rounded">
                <p className="text-sm text-muted-foreground">Impact status</p>
                <p className="text-xl font-semibold text-primary">
                  {result.impactScore < 30 ? 'Minimal' : result.impactScore < 50 ? 'Low' : result.impactScore < 70 ? 'Moderate' : 'High'}
                </p>
                <p className="text-xs text-muted-foreground">Based on score</p>
              </div>
            </div>
          ) : (
            <p className="text-sm text-muted-foreground">Enter your late-night eating data to see additional insights.</p>
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
          <p>Late-night eating (after 8 PM) can disrupt circadian rhythm, reduce insulin sensitivity, affect sleep quality, and impact metabolic health. Ideally, finish meals by 6-7 PM and limit calories after 8 PM to less than 200-300.</p>
          <p>Use this calculator to calculate late-night eating impact from dinner time, last meal time, and calories consumed after 8 PM.</p>
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
          <p>This tool provides general wellness insights about late-night eating impact from dinner time, last meal time, and calories consumed after 8 PM. This is a personal lifestyle insight, not a medical evaluation.</p>
          <p>Outputs include dinner time, last meal time, calories after 8 PM, hours after 8 PM, impact score, status, recommendations, an action plan, and supporting metrics.</p>
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


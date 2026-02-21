'use client';

import { useState } from 'react';
import Script from 'next/script';
import Link from 'next/link';
import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import { z } from 'zod';
import { Droplet, Zap, Target, Activity, Shield } from 'lucide-react';

import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Form, FormControl, FormField, FormItem, FormLabel, FormMessage } from '@/components/ui/form';
import { Input } from '@/components/ui/input';

const formSchema = z.object({
  mealType: z.enum(['low-gi', 'medium-gi', 'high-gi', 'mixed']),
  carbohydrateGrams: z.number({ invalid_type_error: 'Enter carbohydrate grams' }).min(0).max(200),
  proteinGrams: z.number({ invalid_type_error: 'Enter protein grams' }).min(0).max(150).optional(),
  fatGrams: z.number({ invalid_type_error: 'Enter fat grams' }).min(0).max(100).optional(),
  fiberGrams: z.number({ invalid_type_error: 'Enter fiber grams' }).min(0).max(50).optional(),
  fastingBloodSugar: z.number({ invalid_type_error: 'Enter fasting blood sugar' }).min(70).max(200).optional(),
});

type FormValues = z.infer<typeof formSchema>;

type ResultPayload = {
  estimatedSpike: number;
  peakBloodSugar: number;
  spikeMagnitude: string;
  status: 'minimal' | 'moderate' | 'high' | 'very-high';
  interpretation: string;
  recommendations: string[];
  plan: { label: string; detail: string }[];
};

const steps = [
  'Select meal type (low-GI, medium-GI, high-GI, or mixed).',
  'Enter carbohydrate grams in the meal.',
  'Optionally enter protein grams, fat grams, and fiber grams for more accurate estimation.',
  'Optionally enter fasting blood sugar level (mg/dL).',
  'Review estimated blood sugar spike, peak level, and recommendations.',
];

const faqs = [
  {
    question: 'What is a blood sugar spike?',
    answer:
      'A blood sugar spike is a rapid increase in blood glucose levels after eating, typically peaking 30-60 minutes after a meal. Large spikes can cause energy crashes and long-term health issues.',
  },
  {
    question: 'How does meal type affect blood sugar?',
    answer:
      'Low-GI meals cause gradual rises, medium-GI cause moderate spikes, and high-GI cause rapid spikes. Mixed meals with protein, fat, and fiber can blunt spikes.',
  },
  {
    question: 'What is considered a high blood sugar spike?',
    answer:
      'A spike over 30-40 mg/dL above baseline is moderate, 40-60 mg/dL is high, and over 60 mg/dL is very high. Normal post-meal levels are typically 140-180 mg/dL.',
  },
  {
    question: 'How can I reduce blood sugar spikes?',
    answer:
      'Include protein, healthy fats, and fiber with meals. Choose lower-GI foods, eat carbs last, avoid sugary drinks, and combine carbs with other macronutrients.',
  },
  {
    question: 'Does timing matter for blood sugar spikes?',
    answer:
      'Yes. Eating carbs alone causes faster spikes. Eating protein and fat first, then carbs, can reduce spike magnitude. Exercise timing also affects spikes.',
  },
  {
    question: 'What about fiber?',
    answer:
      'Fiber slows carbohydrate absorption, reducing spike magnitude. Aim for 10-15g of fiber per meal, especially from vegetables, whole grains, and legumes.',
  },
  {
    question: 'How do protein and fat help?',
    answer:
      'Protein and fat slow gastric emptying and carbohydrate absorption, leading to more gradual blood sugar rises and lower peak levels.',
  },
  {
    question: 'Can I track blood sugar spikes?',
    answer:
      'Yes. Continuous glucose monitors (CGMs) can track real-time spikes. You can also use fingerstick glucose meters before and after meals (at 1-2 hours).',
  },
  {
    question: 'What are normal post-meal blood sugar levels?',
    answer:
      'Normal fasting is 70-100 mg/dL. Post-meal (1-2 hours) should be under 140 mg/dL for non-diabetics. Levels above 180 mg/dL may indicate insulin resistance.',
  },
  {
    question: 'What foods cause the biggest spikes?',
    answer:
      'Refined carbs (white bread, pasta, rice), sugary drinks, sweets, and processed foods cause the largest spikes. Whole foods with fiber cause smaller spikes.',
  },
];

const relatedCalculators = [
  {
    name: 'Glycemic Index Meal Wellness Optimizer',
    slug: 'glycemic-index-meal-optimizer-calculator',
    description: 'Get wellness insights about optimizing meals to reduce energy fluctuations.',
  },
  {
    name: 'Glycemic Load Calculator',
    slug: 'glycemic-load-calculator',
    description: 'Calculate glycemic load of individual foods.',
  },
  {
    name: 'Blood Sugar to HbA1c Converter',
    slug: 'blood-sugar-to-hba1c-converter',
    description: 'Convert blood sugar levels to HbA1c percentage.',
  },
];

const baseUrl = 'https://mycalculating.com/health-fitness/blood-sugar-spike-estimator-by-meal-type';

const schemaMarkup = {
  '@context': 'https://schema.org',
  '@graph': [
    {
      '@type': 'BreadcrumbList',
      itemListElement: [
        { '@type': 'ListItem', position: 1, name: 'Home', item: 'https://mycalculating.com' },
        { '@type': 'ListItem', position: 2, name: 'Health & Fitness', item: 'https://mycalculating.com/health-fitness' },
        { '@type': 'ListItem', position: 3, name: 'Energy Fluctuation Estimator (by meal type)', item: baseUrl },
      ],
    },
    {
      '@type': 'SoftwareApplication',
      name: 'Energy Fluctuation Estimator (by meal type)',
      applicationCategory: 'Calculator',
      operatingSystem: 'Web Browser',
      description: 'Get general wellness insights about energy fluctuation magnitude based on meal type, carbohydrate content, and macronutrient composition. This is a personal lifestyle insight, not a medical evaluation.',
      url: baseUrl,
      offers: { '@type': 'Offer', price: '0', priceCurrency: 'USD' },
    },
  ],
};

const clamp = (value: number, min: number, max: number) => Math.min(max, Math.max(min, value));

const calculateResult = (values: FormValues): ResultPayload => {
  const baseSpike = { 'low-gi': 20, 'medium-gi': 40, 'high-gi': 70, 'mixed': 35 };
  let estimatedSpike = baseSpike[values.mealType];
  
  // Adjust for carbohydrate amount (more carbs = larger spike)
  const carbAdjustment = (values.carbohydrateGrams / 50) - 1; // Baseline at 50g
  estimatedSpike = estimatedSpike * (1 + carbAdjustment * 0.3);
  
  // Reduce spike with protein (protein slows absorption)
  if (values.proteinGrams) {
    const proteinReduction = clamp(values.proteinGrams / 30, 0, 0.4); // Up to 40% reduction
    estimatedSpike = estimatedSpike * (1 - proteinReduction);
  }
  
  // Reduce spike with fat (fat slows absorption)
  if (values.fatGrams) {
    const fatReduction = clamp(values.fatGrams / 20, 0, 0.3); // Up to 30% reduction
    estimatedSpike = estimatedSpike * (1 - fatReduction);
  }
  
  // Reduce spike with fiber (fiber slows absorption)
  if (values.fiberGrams) {
    const fiberReduction = clamp(values.fiberGrams / 10, 0, 0.35); // Up to 35% reduction
    estimatedSpike = estimatedSpike * (1 - fiberReduction);
  }
  
  // Clamp spike to reasonable range
  estimatedSpike = clamp(estimatedSpike, 10, 120);
  
  const baseline = values.fastingBloodSugar ?? 90;
  const peakBloodSugar = baseline + estimatedSpike;
  
  let status: ResultPayload['status'] = 'minimal';
  let spikeMagnitude = 'Minimal';
  let interpretation = 'This suggests a general lifestyle tendency where your estimated energy fluctuation is minimal. This meal may provide steady energy.';
  
  if (estimatedSpike < 30) {
    status = 'minimal';
    spikeMagnitude = 'Minimal';
  } else if (estimatedSpike < 50) {
    status = 'moderate';
    spikeMagnitude = 'Moderate';
    interpretation = 'This suggests a general lifestyle tendency where your estimated energy fluctuation is moderate. You may consider adding protein, fat, or fiber to reduce the fluctuation.';
  } else if (estimatedSpike < 75) {
    status = 'high';
    spikeMagnitude = 'High';
    interpretation = 'This suggests a general lifestyle tendency where your estimated energy fluctuation is high. This may cause energy changes. You may consider modifying meal composition to reduce fluctuation.';
  } else {
    status = 'very-high';
    spikeMagnitude = 'Very High';
    interpretation = 'This suggests a general lifestyle tendency where your estimated energy fluctuation is very high. This meal may cause significant energy fluctuations.';
  }
  
  const recommendations = [
    'You may consider including protein (20-30g) with meals to slow carbohydrate absorption and reduce energy fluctuation magnitude. This is a personal insight, not a medical evaluation.',
    'You may consider adding healthy fats (10-15g) to meals to further slow gastric emptying and reduce energy fluctuations.',
    'You may consider increasing fiber intake (10-15g per meal) from vegetables, whole grains, and legumes to slow carbohydrate absorption.',
  ];
  if (values.mealType === 'high-gi') {
    recommendations.push('You may consider replacing high-GI foods with lower-GI alternatives (e.g., white rice â†’ brown rice, white bread â†’ whole grain).');
  }
  if (values.carbohydrateGrams > 60) {
    recommendations.push('You may consider reducing carbohydrate portion size or splitting into smaller meals throughout the day.');
  }
  if (!values.proteinGrams || values.proteinGrams < 20) {
    recommendations.push('You may consider aiming for at least 20g of protein per meal to help support energy stability.');
  }
  
  const plan = [
    { label: 'This Week', detail: 'You may consider tracking meal composition and noting energy levels after meals. Identify meals that cause energy changes.' },
    { label: 'This Month', detail: 'You may consider modifying high-fluctuation meals by adding protein, healthy fats, and fiber. Test impact on energy if possible.' },
    { label: 'Ongoing', detail: 'You may consider maintaining balanced meals with protein, healthy fats, and fiber to minimize energy fluctuations and support energy levels.' },
  ];
  
  return { estimatedSpike, peakBloodSugar, spikeMagnitude, status, interpretation, recommendations, plan };
};

export default function BloodSugarSpikeEstimatorByMealType() {
  const [result, setResult] = useState<ResultPayload | null>(null);
  
  const form = useForm<FormValues>({
    resolver: zodResolver(formSchema),
    defaultValues: {
      mealType: undefined,
      carbohydrateGrams: undefined,
      proteinGrams: undefined,
      fatGrams: undefined,
      fiberGrams: undefined,
      fastingBloodSugar: undefined,
    },
  });
  
  return (
    <div className="space-y-8">
      <Script id="blood-sugar-spike-schema" type="application/ld+json" strategy="afterInteractive" dangerouslySetInnerHTML={{ __html: JSON.stringify(schemaMarkup) }} />
      
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <Droplet className="h-5 w-5" />
            Energy Fluctuation Estimator (by meal type)
          </CardTitle>
          <CardDescription>Get general wellness insights about energy fluctuation magnitude based on meal type, carbohydrate content, and macronutrient composition. This is a personal lifestyle insight, not a medical evaluation.</CardDescription>
        </CardHeader>
      </Card>
      
      <Card>
        <CardHeader>
          <CardTitle>Input your meal data</CardTitle>
        </CardHeader>
        <CardContent>
          <Form {...form}>
            <form onSubmit={form.handleSubmit((values) => setResult(calculateResult(values)))} className="space-y-6">
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <FormField
                  control={form.control}
                  name="mealType"
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel>Meal type</FormLabel>
                      <FormControl>
                        <select value={field.value ?? ''} onChange={(e) => field.onChange(e.target.value as FormValues['mealType'])} className="flex h-10 w-full rounded-md border border-input bg-background px-3 py-2 text-sm">
                          <option value="">Select meal type</option>
                          <option value="low-gi">Low-GI (gradual rise)</option>
                          <option value="medium-gi">Medium-GI (moderate spike)</option>
                          <option value="high-gi">High-GI (rapid spike)</option>
                          <option value="mixed">Mixed (balanced)</option>
                        </select>
                      </FormControl>
                      <FormMessage />
                    </FormItem>
                  )}
                />
                <FormField
                  control={form.control}
                  name="carbohydrateGrams"
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel>Carbohydrate grams</FormLabel>
                      <FormControl>
                        <Input type="number" step="1" placeholder="e.g., 50" value={field.value ?? ''} onChange={(e) => field.onChange(e.target.value === '' ? undefined : Number(e.target.value))} />
                      </FormControl>
                      <FormMessage />
                    </FormItem>
                  )}
                />
                <FormField
                  control={form.control}
                  name="proteinGrams"
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel>Protein grams (optional)</FormLabel>
                      <FormControl>
                        <Input type="number" step="1" placeholder="e.g., 25" value={field.value ?? ''} onChange={(e) => field.onChange(e.target.value === '' ? undefined : Number(e.target.value))} />
                      </FormControl>
                      <FormMessage />
                    </FormItem>
                  )}
                />
                <FormField
                  control={form.control}
                  name="fatGrams"
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel>Fat grams (optional)</FormLabel>
                      <FormControl>
                        <Input type="number" step="1" placeholder="e.g., 15" value={field.value ?? ''} onChange={(e) => field.onChange(e.target.value === '' ? undefined : Number(e.target.value))} />
                      </FormControl>
                      <FormMessage />
                    </FormItem>
                  )}
                />
                <FormField
                  control={form.control}
                  name="fiberGrams"
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel>Fiber grams (optional)</FormLabel>
                      <FormControl>
                        <Input type="number" step="1" placeholder="e.g., 10" value={field.value ?? ''} onChange={(e) => field.onChange(e.target.value === '' ? undefined : Number(e.target.value))} />
                      </FormControl>
                      <FormMessage />
                    </FormItem>
                  )}
                />
                <FormField
                  control={form.control}
                  name="fastingBloodSugar"
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel>Fasting blood sugar (mg/dL, optional)</FormLabel>
                      <FormControl>
                        <Input type="number" step="1" placeholder="e.g., 90" value={field.value ?? ''} onChange={(e) => field.onChange(e.target.value === '' ? undefined : Number(e.target.value))} />
                      </FormControl>
                      <FormMessage />
                    </FormItem>
                  )}
                />
              </div>
              <Button type="submit" className="w-full md:w-auto">
                Estimate blood sugar spike
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
            <CardDescription>See estimated energy fluctuation, peak level, and recommendations.</CardDescription>
          </CardHeader>
          <CardContent className="space-y-6">
            <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
              <div className="p-4 border rounded">
                <p className="text-sm text-muted-foreground">Estimated fluctuation</p>
                <p className="text-2xl font-semibold text-primary">{result.estimatedSpike.toFixed(0)} mg/dL</p>
                <p className="text-xs text-muted-foreground">Above baseline</p>
              </div>
              <div className="p-4 border rounded">
                <p className="text-sm text-muted-foreground">Peak level</p>
                <p className="text-2xl font-semibold text-primary">{result.peakBloodSugar.toFixed(0)} mg/dL</p>
                <p className="text-xs text-muted-foreground">Estimated peak</p>
              </div>
              <div className="p-4 border rounded">
                <p className="text-sm text-muted-foreground">Spike magnitude</p>
                <p className="text-2xl font-semibold text-primary">{result.spikeMagnitude}</p>
                <p className="text-xs text-muted-foreground">{result.status}</p>
              </div>
              <div className="p-4 border rounded">
                <p className="text-sm text-muted-foreground">Status</p>
                <p className="text-2xl font-semibold text-primary capitalize">{result.status.replace('-', ' ')}</p>
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
            <strong>Base spike</strong> = Meal type baseline (low-GI: ~20 mg/dL, medium-GI: ~40 mg/dL, high-GI: ~70 mg/dL, mixed: ~35 mg/dL).
          </p>
          <p>
            <strong>Carbohydrate adjustment</strong> = Base spike Ã— (1 + ((carb grams / 50) - 1) Ã— 0.3).
          </p>
          <p>
            <strong>Protein reduction</strong> = Up to 40% reduction (protein grams / 30, capped at 0.4).
          </p>
          <p>
            <strong>Fat reduction</strong> = Up to 30% reduction (fat grams / 20, capped at 0.3).
          </p>
          <p>
            <strong>Fiber reduction</strong> = Up to 35% reduction (fiber grams / 10, capped at 0.35).
          </p>
          <p>
            <strong>Peak blood sugar</strong> = Fasting blood sugar (or 90 mg/dL default) + estimated spike.
          </p>
          <p>Protein, fat, and fiber slow carbohydrate absorption, reducing spike magnitude. Meal type determines baseline spike potential.</p>
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
          <p>Blood sugar spikes occur when carbohydrates are rapidly absorbed, causing glucose levels to rise quickly. Large spikes can lead to energy crashes, increased hunger, and long-term metabolic issues.</p>
          <p>Use this calculator to estimate blood sugar spike magnitude based on meal type (GI level), carbohydrate content, and macronutrient composition (protein, fat, fiber) to optimize meal planning for stable blood sugar.</p>
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
          <p>This tool provides general wellness insights about energy fluctuation magnitude based on meal type, carbohydrate grams, protein grams, fat grams, fiber grams, and optional fasting blood sugar level. This is a personal lifestyle insight, not a medical evaluation.</p>
          <p>Outputs include estimated fluctuation (mg/dL), peak level (mg/dL), fluctuation magnitude category, status, recommendations, an action plan, and supporting metrics.</p>
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



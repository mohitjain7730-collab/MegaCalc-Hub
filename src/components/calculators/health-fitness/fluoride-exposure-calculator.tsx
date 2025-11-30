'use client';

import { useState } from 'react';
import Script from 'next/script';
import Link from 'next/link';
import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import { z } from 'zod';
import { Droplet, Zap, Target, AlertTriangle, Shield } from 'lucide-react';

import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Form, FormControl, FormField, FormItem, FormLabel, FormMessage } from '@/components/ui/form';
import { Input } from '@/components/ui/input';

const formSchema = z.object({
  age: z.number({ invalid_type_error: 'Enter age' }).min(1).max(100),
  waterFluoride: z.number({ invalid_type_error: 'Enter water fluoride' }).min(0).max(4),
  waterIntake: z.number({ invalid_type_error: 'Enter water intake' }).min(0).max(5000),
  toothpasteUse: z.boolean().optional(),
  otherSources: z.number({ invalid_type_error: 'Enter other sources' }).min(0).max(5).optional(),
});

type FormValues = z.infer<typeof formSchema>;

type ResultPayload = {
  age: number;
  waterFluoride: number;
  waterIntake: number;
  toothpasteUse: boolean;
  otherSources: number;
  totalExposure: number;
  dailyNeed: number;
  exposureStatus: string;
  status: 'optimal' | 'good' | 'moderate' | 'low';
  interpretation: string;
  recommendations: string[];
  plan: { label: string; detail: string }[];
};

const steps = [
  'Enter your age (years) for age-specific recommendations.',
  'Enter water fluoride level (ppm) from your water source or municipal report.',
  'Enter daily water intake (mL) from drinking water.',
  'Indicate if you use fluoride toothpaste (optional).',
  'Enter fluoride from other sources (mg) if known (optional).',
  'Review total fluoride exposure, daily needs, and recommendations.',
];

const faqs = [
  {
    question: 'What is fluoride?',
    answer:
      'Fluoride is a mineral that helps prevent tooth decay by strengthening tooth enamel. It is added to many public water supplies and is found in toothpaste, some foods, and dental treatments.',
  },
  {
    question: 'What are fluoride recommendations?',
    answer:
      'Adequate intake (AI): Infants 0-6 months: 0.01 mg/day, 7-12 months: 0.5 mg/day, Children 1-3: 0.7 mg/day, 4-8: 1.0 mg/day, Children 9-13: 2.0 mg/day, Teens 14-18: 3.0 mg/day, Adults: 3-4 mg/day (men) and 3 mg/day (women).',
  },
  {
    question: 'What is water fluoridation?',
    answer:
      'Water fluoridation is the addition of fluoride to public water supplies to prevent tooth decay. Optimal level is 0.7-1.2 ppm. This is a safe and effective public health measure.',
  },
  {
    question: 'How does age affect fluoride needs?',
    answer:
      'Fluoride needs increase with age as teeth develop and grow. Children and adolescents need adequate fluoride for developing teeth. Adults need fluoride to maintain tooth enamel strength.',
  },
  {
    question: 'What about fluoride toxicity?',
    answer:
      'Excessive fluoride intake can cause dental fluorosis (white spots on teeth) in children during tooth development, or skeletal fluorosis in severe cases. Upper limits vary by age: Children 1-3: 1.3 mg/day, 4-8: 2.2 mg/day, 9-13: 10 mg/day, 14-18: 10 mg/day, Adults: 10 mg/day.',
  },
  {
    question: 'What are sources of fluoride?',
    answer:
      'Fluoride sources include fluoridated water, fluoride toothpaste, some foods (tea, fish), and dental treatments. Water and toothpaste are the primary sources for most people.',
  },
  {
    question: 'How do I calculate fluoride exposure?',
    answer:
      'Calculate fluoride exposure from water (fluoride ppm × water intake L × 1 mg/L per ppm), plus fluoride from toothpaste (if swallowed), plus other sources. Most toothpaste fluoride is not swallowed.',
  },
  {
    question: 'What about fluoride and children?',
    answer:
      'Children need adequate fluoride for developing teeth but are more susceptible to fluorosis. Use age-appropriate toothpaste amounts, supervise brushing, and ensure appropriate fluoride intake from water and other sources.',
  },
  {
    question: 'Can I track fluoride at home?',
    answer:
      'Yes. Estimate fluoride from water (check municipal reports for ppm), estimate water intake, and consider toothpaste use. Most tracking apps don\'t include fluoride, so manual calculation may be needed.',
  },
  {
    question: 'When should I consult a healthcare provider?',
    answer:
      'Consult a healthcare provider or dentist if you have concerns about fluoride intake, see signs of fluorosis, live in areas with very high natural fluoride, or need personalized guidance on fluoride exposure.',
  },
];

const relatedCalculators = [
  {
    name: 'Iodine Deficiency Risk Calculator',
    slug: 'iodine-deficiency-risk-calculator',
    description: 'Assess iodine alongside fluoride for mineral status.',
  },
  {
    name: 'Selenium Intake Calculator',
    slug: 'selenium-intake-calculator',
    description: 'Evaluate trace minerals comprehensively.',
  },
  {
    name: 'Manganese Requirement Calculator',
    slug: 'manganese-requirement-calculator',
    description: 'Assess manganese alongside fluoride.',
  },
  {
    name: 'Nutrient Density to Calorie Ratio Calculator',
    slug: 'nutrient-density-to-calorie-ratio-calculator',
    description: 'Assess nutritional quality comprehensively.',
  },
];

const baseUrl = 'https://mycalculating.com/category/health-fitness/fluoride-exposure-calculator';

const schemaMarkup = {
  '@context': 'https://schema.org',
  '@graph': [
    {
      '@type': 'BreadcrumbList',
      itemListElement: [
        { '@type': 'ListItem', position: 1, name: 'Home', item: 'https://mycalculating.com' },
        { '@type': 'ListItem', position: 2, name: 'Health & Fitness', item: 'https://mycalculating.com/category/health-fitness' },
        { '@type': 'ListItem', position: 3, name: 'Fluoride Exposure Calculator', item: baseUrl },
      ],
    },
    {
      '@type': 'SoftwareApplication',
      name: 'Fluoride Exposure Calculator',
      applicationCategory: 'Calculator',
      operatingSystem: 'Web Browser',
      description: 'Calculate fluoride exposure from water fluoride level, water intake, age, and other sources.',
      url: baseUrl,
      offers: { '@type': 'Offer', price: '0', priceCurrency: 'USD' },
    },
  ],
};

const clamp = (value: number, min: number, max: number) => Math.min(max, Math.max(min, value));

const calculateResult = (values: FormValues): ResultPayload => {
  const age = values.age;
  const waterFluoride = values.waterFluoride; // ppm
  const waterIntake = values.waterIntake; // mL
  const toothpasteUse = values.toothpasteUse || false;
  const otherSources = values.otherSources || 0;
  
  // Calculate fluoride from water (ppm × L × 1 mg/L per ppm)
  const waterFluorideMg = (waterFluoride * waterIntake / 1000); // Convert mL to L, then multiply by ppm
  
  // Estimate fluoride from toothpaste (if used, assume small amount swallowed: ~0.1-0.2 mg)
  const toothpasteFluoride = toothpasteUse ? 0.15 : 0;
  
  const totalExposure = waterFluorideMg + toothpasteFluoride + otherSources;
  
  // Estimate daily need based on age
  let dailyNeed = 3.0; // Default for adults
  
  if (age < 1) {
    if (age < 0.5) {
      dailyNeed = 0.01; // Infants 0-6 months
    } else {
      dailyNeed = 0.5; // Infants 7-12 months
    }
  } else if (age < 4) {
    dailyNeed = 0.7; // Children 1-3
  } else if (age < 9) {
    dailyNeed = 1.0; // Children 4-8
  } else if (age < 14) {
    dailyNeed = 2.0; // Children 9-13
  } else if (age < 19) {
    dailyNeed = 3.0; // Teens 14-18
  } else {
    dailyNeed = 3.0; // Adults (women), men may need slightly more (3-4 mg)
  }
  
  // Determine exposure status
  let exposureStatus = 'Adequate';
  if (totalExposure < dailyNeed * 0.7) {
    exposureStatus = 'Low';
  } else if (totalExposure > 10) {
    exposureStatus = 'Excessive';
  } else if (totalExposure > dailyNeed * 2) {
    exposureStatus = 'High';
  }
  
  let status: ResultPayload['status'] = 'optimal';
  let interpretation = 'Your fluoride exposure appears adequate. This supports tooth enamel strength and prevents tooth decay.';

  if (totalExposure < dailyNeed * 0.7) {
    status = 'low';
    interpretation = 'Your fluoride exposure is below recommended levels. This may increase tooth decay risk. Consider fluoridated water, fluoride toothpaste, or other sources to meet daily needs.';
  } else if (totalExposure < dailyNeed * 0.9) {
    status = 'moderate';
    interpretation = 'Your fluoride exposure is slightly below recommended levels. Aim for recommended daily intake to ensure adequate fluoride status and prevent tooth decay.';
  } else if (totalExposure > 10) {
    status = 'low';
    interpretation = 'Your fluoride exposure exceeds the upper limit (10 mg/day for adults). Excessive intake can cause fluorosis. Reduce exposure, especially from water or supplements.';
  } else if (totalExposure >= dailyNeed && totalExposure <= dailyNeed * 2) {
    status = 'optimal';
    interpretation = 'Your fluoride exposure is within recommended range. This supports optimal tooth enamel strength and prevents tooth decay without excessive intake.';
  } else {
    status = 'good';
    interpretation = 'Your fluoride exposure is good. Continue maintaining balanced intake to support tooth health and prevent decay.';
  }

  const recommendations = [
    'Use fluoridated water: if your water supply is fluoridated (0.7-1.2 ppm), this provides safe and effective fluoride for tooth decay prevention.',
    `Aim for recommended intake: ${dailyNeed.toFixed(2)} mg/day for your age. This supports tooth enamel strength and prevents tooth decay.`,
    'Use fluoride toothpaste: brushing with fluoride toothpaste provides topical benefits and small amounts of systemic fluoride. Use age-appropriate amounts.',
  ];
  if (status === 'low' && totalExposure < dailyNeed * 0.9) {
    recommendations.push('Increase fluoride exposure through fluoridated water, fluoride toothpaste, or other sources to meet recommended levels and prevent tooth decay.');
  }
  if (totalExposure > 10) {
    recommendations.push('Reduce fluoride exposure. Excessive intake (upper limit: 10 mg/day for adults) can cause fluorosis. If from water, consider alternative sources. Consult healthcare provider if concerns persist.');
  }
  if (waterFluoride > 2.0) {
    recommendations.push('Monitor water fluoride levels. Levels above 2.0 ppm may increase fluorosis risk, especially in children. Consider alternative water sources if levels are very high.');
  }

  const plan = [
    { label: 'This Week', detail: `Calculate fluoride exposure and compare to daily needs (${dailyNeed.toFixed(2)} mg/day). Assess current exposure and identify opportunities to meet recommended levels.` },
    { label: 'This Month', detail: 'Optimize fluoride exposure: ensure access to fluoridated water or appropriate fluoride sources, use fluoride toothpaste appropriately, and maintain balanced intake.' },
    { label: 'Ongoing', detail: 'Monitor fluoride exposure through regular assessment. Maintain recommended intake levels to prevent tooth decay while avoiding excessive exposure that could cause fluorosis.' },
  ];

  return { age, waterFluoride, waterIntake, toothpasteUse, otherSources, totalExposure, dailyNeed, exposureStatus, status, interpretation, recommendations, plan };
};

export default function FluorideExposureCalculator() {
  const [result, setResult] = useState<ResultPayload | null>(null);

  const form = useForm<FormValues>({
    resolver: zodResolver(formSchema),
    defaultValues: {
      age: undefined,
      waterFluoride: undefined,
      waterIntake: undefined,
      toothpasteUse: undefined,
      otherSources: undefined,
    },
  });

  return (
    <div className="space-y-8">
      <Script id="fluoride-exposure-schema" type="application/ld+json" strategy="afterInteractive" dangerouslySetInnerHTML={{ __html: JSON.stringify(schemaMarkup) }} />

      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <Droplet className="h-5 w-5" />
            Fluoride Exposure Calculator
          </CardTitle>
          <CardDescription>Calculate fluoride exposure from water fluoride level, water intake, age, and other sources.</CardDescription>
        </CardHeader>
      </Card>

      <Card>
        <CardHeader>
          <CardTitle>Input your fluoride data</CardTitle>
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
                        <Input type="number" step="0.1" placeholder="e.g., 35" value={field.value ?? ''} onChange={(e) => field.onChange(e.target.value === '' ? undefined : Number(e.target.value))} />
                      </FormControl>
                      <FormMessage />
                    </FormItem>
                  )}
                />
                <FormField
                  control={form.control}
                  name="waterFluoride"
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel>Water fluoride (ppm)</FormLabel>
                      <FormControl>
                        <Input type="number" step="0.1" placeholder="e.g., 0.7" value={field.value ?? ''} onChange={(e) => field.onChange(e.target.value === '' ? undefined : Number(e.target.value))} />
                      </FormControl>
                      <FormMessage />
                    </FormItem>
                  )}
                />
                <FormField
                  control={form.control}
                  name="waterIntake"
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel>Water intake (mL)</FormLabel>
                      <FormControl>
                        <Input type="number" step="10" placeholder="e.g., 2000" value={field.value ?? ''} onChange={(e) => field.onChange(e.target.value === '' ? undefined : Number(e.target.value))} />
                      </FormControl>
                      <FormMessage />
                    </FormItem>
                  )}
                />
                <FormField
                  control={form.control}
                  name="toothpasteUse"
                  render={({ field }) => (
                    <FormItem className="flex items-center space-x-2 space-y-0">
                      <FormControl>
                        <input
                          type="checkbox"
                          checked={field.value || false}
                          onChange={field.onChange}
                          className="h-4 w-4 rounded border-gray-300"
                        />
                      </FormControl>
                      <FormLabel className="!mt-0">Use fluoride toothpaste</FormLabel>
                      <FormMessage />
                    </FormItem>
                  )}
                />
                <FormField
                  control={form.control}
                  name="otherSources"
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel>Other sources (mg) (optional)</FormLabel>
                      <FormControl>
                        <Input type="number" step="0.1" placeholder="e.g., 0.5" value={field.value ?? ''} onChange={(e) => field.onChange(e.target.value === '' ? undefined : Number(e.target.value))} />
                      </FormControl>
                      <FormMessage />
                    </FormItem>
                  )}
                />
              </div>
              <Button type="submit" className="w-full md:w-auto">
                Calculate fluoride exposure
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
            <CardDescription>See total fluoride exposure, daily needs, and recommendations.</CardDescription>
          </CardHeader>
          <CardContent className="space-y-6">
            <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
              <div className="p-4 border rounded">
                <p className="text-sm text-muted-foreground">Total exposure</p>
                <p className="text-2xl font-semibold text-primary">{result.totalExposure.toFixed(2)}</p>
                <p className="text-xs text-muted-foreground">mg/day</p>
              </div>
              <div className="p-4 border rounded">
                <p className="text-sm text-muted-foreground">Daily need</p>
                <p className="text-2xl font-semibold text-primary">{result.dailyNeed.toFixed(2)}</p>
                <p className="text-xs text-muted-foreground">mg/day</p>
              </div>
              <div className="p-4 border rounded">
                <p className="text-sm text-muted-foreground">Exposure status</p>
                <p className="text-2xl font-semibold text-primary">{result.exposureStatus}</p>
                <p className="text-xs text-muted-foreground">Based on intake</p>
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
            <strong>Fluoride from water</strong> = water fluoride (ppm) × water intake (L) × 1 mg/L per ppm. Convert mL to L by dividing by 1000.
          </p>
          <p>
            <strong>Total exposure</strong> = fluoride from water + fluoride from toothpaste (if used, ~0.15 mg) + other sources (mg).
          </p>
          <p>
            <strong>Daily need</strong> = estimated from age. Adults: 3 mg/day (women) or 3-4 mg/day (men). Children have lower requirements.
          </p>
          <p>
            <strong>Upper limits</strong>: Children 1-3: 1.3 mg/day, 4-8: 2.2 mg/day, 9-13: 10 mg/day, 14-18: 10 mg/day, Adults: 10 mg/day.
          </p>
          <p>Fluoride exposure should be adequate to prevent tooth decay but not excessive to avoid fluorosis. Optimal water fluoridation is 0.7-1.2 ppm.</p>
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
                <p className="text-sm text-muted-foreground">Water contribution</p>
                <p className="text-xl font-semibold text-primary">
                  {((result.waterFluoride * result.waterIntake / 1000) / result.totalExposure * 100).toFixed(1)}%
                </p>
                <p className="text-xs text-muted-foreground">Of total exposure</p>
              </div>
              <div className="p-4 border rounded">
                <p className="text-sm text-muted-foreground">Upper limit</p>
                <p className="text-xl font-semibold text-primary">10 mg</p>
                <p className="text-xs text-muted-foreground">Maximum safe (adults)</p>
              </div>
              <div className="p-4 border rounded">
                <p className="text-sm text-muted-foreground">Exposure ratio</p>
                <p className="text-xl font-semibold text-primary">
                  {(result.totalExposure / result.dailyNeed).toFixed(2)}x
                </p>
                <p className="text-xs text-muted-foreground">Of daily need</p>
              </div>
            </div>
          ) : (
            <p className="text-sm text-muted-foreground">Enter your fluoride data to see additional insights.</p>
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
          <p>Fluoride is a mineral that helps prevent tooth decay by strengthening tooth enamel. Recommended intake: Adults: 3 mg/day (women) or 3-4 mg/day (men). Optimal water fluoridation is 0.7-1.2 ppm. Upper limit: 10 mg/day for adults.</p>
          <p>Use this calculator to calculate fluoride exposure from water fluoride level, water intake, age, and other sources.</p>
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
          <p>This tool calculates fluoride exposure from water fluoride level, water intake, age, and other sources.</p>
          <p>Outputs include age, water fluoride, water intake, toothpaste use, other sources, total exposure, daily need, exposure status, status, recommendations, an action plan, and supporting metrics.</p>
          <p>Formula, steps, guide content, related tools, and FAQs ensure humans or AI assistants can interpret the methodology instantly.</p>
        </CardContent>
      </Card>
    </div>
  );
}


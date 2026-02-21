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
  age: z.number({ invalid_type_error: 'Enter age' }).min(1).max(120),
  dietType: z.enum(['omnivore', 'vegetarian', 'vegan'], { invalid_type_error: 'Select diet type' }),
  pregnancyStatus: z.enum(['none', 'pregnant', 'breastfeeding']).optional(),
  absorptionIssues: z.number({ invalid_type_error: 'Enter absorption issues rating' }).min(0).max(10).optional(),
  currentIntake: z.number({ invalid_type_error: 'Enter current intake' }).min(0).max(1000).optional(),
});

type FormValues = z.infer<typeof formSchema>;

type ResultPayload = {
  recommendedIntake: number;
  currentStatus: string;
  deficiencyRisk: string;
  absorptionAdjustment: number;
  status: 'optimal' | 'good' | 'moderate' | 'low';
  interpretation: string;
  recommendations: string[];
  plan: { label: string; detail: string }[];
};

const steps = [
  'Enter your age (requirements vary by age group).',
  'Select your diet type (omnivore, vegetarian, or vegan).',
  'Optionally select pregnancy or breastfeeding status.',
  'Optionally rate absorption issues (0 = none, 10 = severe).',
  'Optionally enter current daily B12 intake in mcg.',
  'Review recommended intake, deficiency risk, and recommendations.',
];

const faqs = [
  {
    question: 'What is vitamin B12 and why is it important?',
    answer:
      'Vitamin B12 (cobalamin) is essential for red blood cell formation, DNA synthesis, and nerve function. Deficiency can cause anemia, fatigue, neurological problems, and cognitive issues.',
  },
  {
    question: 'How much B12 do adults need daily?',
    answer:
      'Adults typically need 2.4 mcg daily. Pregnant women need 2.6 mcg, and breastfeeding women need 2.8 mcg. Higher intakes may be needed for those with absorption issues or restrictive diets.',
  },
  {
    question: 'Why do vegans need B12 supplements?',
    answer:
      'B12 is only naturally found in animal products. Vegans must supplement or consume fortified foods, as plant-based diets don\'t provide adequate B12. Deficiency risk is high without supplementation.',
  },
  {
    question: 'What causes B12 absorption issues?',
    answer:
      'Absorption issues can result from pernicious anemia, gastric surgery, Crohn\'s disease, celiac disease, aging (reduced stomach acid), or medications that reduce stomach acid production.',
  },
  {
    question: 'What are signs of B12 deficiency?',
    answer:
      'Signs include fatigue, weakness, pale skin, shortness of breath, tingling/numbness, balance problems, memory issues, mood changes, and megaloblastic anemia. Neurological symptoms can become permanent if untreated.',
  },
  {
    question: 'How is B12 deficiency diagnosed?',
    answer:
      'Diagnosis involves blood tests measuring B12 levels, methylmalonic acid (MMA), and homocysteine. Low B12 with elevated MMA/homocysteine indicates deficiency even if B12 appears borderline.',
  },
  {
    question: 'Can you get too much B12?',
    answer:
      'B12 is water-soluble with low toxicity. Very high doses (1000+ mcg) are generally safe, as excess is excreted. However, megadoses should be taken under medical supervision, especially if you have kidney issues.',
  },
  {
    question: 'What foods are rich in B12?',
    answer:
      'Animal products: liver, fish, meat, poultry, eggs, dairy. Fortified foods: breakfast cereals, plant milks, nutritional yeast. Vegans should rely on fortified foods or supplements.',
  },
  {
    question: 'How often should vegetarians/vegans check B12?',
    answer:
      'Vegetarians and especially vegans should monitor B12 levels annually. Since B12 stores can last years, deficiency may develop slowly, making regular testing important for early detection.',
  },
  {
    question: 'What about sublingual B12 supplements?',
    answer:
      'Sublingual B12 can be effective for those with absorption issues, as it bypasses the stomach. However, high-dose oral supplements (500-1000 mcg) are usually sufficient even with reduced absorption.',
  },
];

const relatedCalculators = [
  {
    name: 'Vitamin C Immunity Boost Score Calculator',
    slug: 'vitamin-c-immunity-boost-score-calculator',
    description: 'Calculate vitamin C intake for immune support.',
  },
  {
    name: 'Omega-6 to Omega-3 Balance Calculator',
    slug: 'omega-6-to-omega-3-balance-calculator',
    description: 'Balance fatty acids for optimal health.',
  },
  {
    name: 'Omega3 Daily Requirement Calculator',
    slug: 'omega3-daily-requirement-calculator',
    description: 'Calculate omega-3 requirements.',
  },
  {
    name: 'Vitamin Deficiency Risk Estimator',
    slug: 'vitamin-deficiency-risk-estimator',
    description: 'Assess overall vitamin deficiency risk.',
  },
];

const baseUrl = 'https://mycalculating.com/category/health-fitness/vitamin-b12-daily-requirement-calculator';

const schemaMarkup = {
  '@context': 'https://schema.org',
  '@graph': [
    {
      '@type': 'BreadcrumbList',
      itemListElement: [
        { '@type': 'ListItem', position: 1, name: 'Home', item: 'https://mycalculating.com' },
        { '@type': 'ListItem', position: 2, name: 'Health & Fitness', item: 'https://mycalculating.com/category/health-fitness' },
        { '@type': 'ListItem', position: 3, name: 'Vitamin B12 Daily Requirement Calculator', item: baseUrl },
      ],
    },
    {
      '@type': 'SoftwareApplication',
      name: 'Vitamin B12 Daily Requirement Calculator',
      applicationCategory: 'Calculator',
      operatingSystem: 'Web Browser',
      description: 'Calculate daily vitamin B12 requirements based on age, diet type, health conditions, and lifestyle factors to prevent deficiency.',
      url: baseUrl,
      offers: { '@type': 'Offer', price: '0', priceCurrency: 'USD' },
    },
  ],
};

const calculateResult = (values: FormValues): ResultPayload => {
  let baseRequirement = 2.4; // Adult RDA in mcg
  
  // Age adjustments
  if (values.age < 14) {
    baseRequirement = values.age < 9 ? 1.8 : 2.4;
  }
  
  // Pregnancy/breastfeeding
  if (values.pregnancyStatus === 'pregnant') {
    baseRequirement = 2.6;
  } else if (values.pregnancyStatus === 'breastfeeding') {
    baseRequirement = 2.8;
  }
  
  // Diet adjustments
  let dietMultiplier = 1.0;
  if (values.dietType === 'vegan') {
    dietMultiplier = 2.5; // Vegans need more due to no dietary source
  } else if (values.dietType === 'vegetarian') {
    dietMultiplier = 1.5; // Some sources but may be limited
  }
  
  // Absorption issues
  let absorptionMultiplier = 1.0;
  const absorptionRating = values.absorptionIssues ?? 0;
  if (absorptionRating >= 7) {
    absorptionMultiplier = 5.0; // Severe - need much higher doses
  } else if (absorptionRating >= 4) {
    absorptionMultiplier = 2.5; // Moderate
  } else if (absorptionRating > 0) {
    absorptionMultiplier = 1.5; // Mild
  }
  
  let recommendedIntake = baseRequirement * dietMultiplier * absorptionMultiplier;
  
  // Round to practical supplement sizes
  if (recommendedIntake <= 10) {
    recommendedIntake = Math.ceil(recommendedIntake);
  } else if (recommendedIntake <= 100) {
    recommendedIntake = Math.ceil(recommendedIntake / 10) * 10;
  } else {
    recommendedIntake = Math.ceil(recommendedIntake / 50) * 50;
  }
  
  const currentIntake = values.currentIntake ?? 0;
  const intakeGap = recommendedIntake - currentIntake;
  
  let currentStatus = 'Unknown';
  let deficiencyRisk = 'Low';
  let status: ResultPayload['status'] = 'optimal';
  let interpretation = 'Your B12 intake appears adequate based on recommendations.';
  
  if (currentIntake > 0) {
    if (currentIntake >= recommendedIntake * 0.9) {
      currentStatus = 'Adequate';
      deficiencyRisk = 'Low';
      status = 'optimal';
      interpretation = 'Your current B12 intake meets or exceeds recommendations. Continue maintaining this level.';
    } else if (currentIntake >= recommendedIntake * 0.5) {
      currentStatus = 'Suboptimal';
      deficiencyRisk = 'Moderate';
      status = 'moderate';
      interpretation = 'Your current intake is below recommended levels. Consider increasing intake to meet requirements.';
    } else {
      currentStatus = 'Insufficient';
      deficiencyRisk = 'High';
      status = 'low';
      interpretation = 'Your current B12 intake is significantly below recommendations, putting you at risk for deficiency. Increase intake immediately.';
    }
  } else {
    if (values.dietType === 'vegan') {
      deficiencyRisk = 'High';
      status = 'low';
      interpretation = 'Vegans must supplement B12 or consume fortified foods daily to prevent deficiency.';
    } else if (values.dietType === 'vegetarian') {
      deficiencyRisk = 'Moderate-High';
      status = 'moderate';
      interpretation = 'Vegetarians should monitor B12 intake, as some sources may be limited.';
    }
  }
  
  const recommendations = [
    `Recommended daily B12 intake: ${recommendedIntake} mcg.`,
    values.dietType === 'vegan' 
      ? 'Vegans must take B12 supplements (25-100 mcg daily or 1000-2500 mcg weekly) or consume fortified foods regularly.'
      : values.dietType === 'vegetarian'
      ? 'Include B12-rich foods (eggs, dairy) or fortified foods. Consider supplementation if intake is limited.'
      : 'Include animal products (meat, fish, eggs, dairy) regularly. Most omnivores meet needs through diet.',
  ];
  
  if (absorptionRating >= 4) {
    recommendations.push('You have absorption issues. Consider high-dose B12 supplements (500-1000 mcg daily) or sublingual forms, and work with a healthcare provider.');
  }
  
  if (intakeGap > 0) {
    recommendations.push(`You need to increase intake by ${intakeGap.toFixed(1)} mcg daily to meet recommendations.`);
  }
  
  if (recommendedIntake >= 100) {
    recommendations.push('High-dose B12 is recommended. Choose cyanocobalamin or methylcobalamin supplements and monitor levels with healthcare provider.');
  }
  
  const plan = [
    { label: 'This Week', detail: `Start supplementing with ${recommendedIntake} mcg B12 daily (or equivalent weekly dose). Choose cyanocobalamin or methylcobalamin form.` },
    { label: 'This Month', detail: 'If you have absorption issues or are vegan, consider sublingual B12 or higher doses. Track intake from food and supplements.' },
    { label: 'Ongoing', detail: 'Get annual B12 blood tests to monitor levels. Continue supplementation as needed. Maintain intake through diet (if applicable) or fortified foods.' },
  ];
  
  return { 
    recommendedIntake, 
    currentStatus, 
    deficiencyRisk, 
    absorptionAdjustment: absorptionMultiplier, 
    status, 
    interpretation, 
    recommendations, 
    plan 
  };
};

export default function VitaminB12DailyRequirementCalculator() {
  const [result, setResult] = useState<ResultPayload | null>(null);

  const form = useForm<FormValues>({
    resolver: zodResolver(formSchema),
    defaultValues: {
      age: undefined,
      dietType: undefined,
      pregnancyStatus: undefined,
      absorptionIssues: undefined,
      currentIntake: undefined,
    },
  });

  return (
    <div className="space-y-8">
      <Script id="b12-requirement-schema" type="application/ld+json" strategy="afterInteractive" dangerouslySetInnerHTML={{ __html: JSON.stringify(schemaMarkup) }} />

      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <Moon className="h-5 w-5" />
            Vitamin B12 Daily Requirement Calculator
          </CardTitle>
          <CardDescription>Calculate daily vitamin B12 requirements based on age, diet type, health conditions, and lifestyle factors to prevent deficiency.</CardDescription>
        </CardHeader>
      </Card>

      <Card>
        <CardHeader>
          <CardTitle>Input your B12 data</CardTitle>
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
                        <Input type="number" step="1" placeholder="e.g., 35" value={field.value ?? ''} onChange={(e) => field.onChange(e.target.value === '' ? undefined : Number(e.target.value))} />
                      </FormControl>
                      <FormMessage />
                    </FormItem>
                  )}
                />
                <FormField
                  control={form.control}
                  name="dietType"
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel>Diet type</FormLabel>
                      <FormControl>
                        <select
                          value={field.value ?? ''}
                          onChange={(e) => field.onChange(e.target.value)}
                          className="flex h-10 w-full rounded-md border border-input bg-background px-3 py-2 text-sm ring-offset-background file:border-0 file:bg-transparent file:text-sm file:font-medium placeholder:text-muted-foreground focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2 disabled:cursor-not-allowed disabled:opacity-50"
                        >
                          <option value="">Select diet type</option>
                          <option value="omnivore">Omnivore</option>
                          <option value="vegetarian">Vegetarian</option>
                          <option value="vegan">Vegan</option>
                        </select>
                      </FormControl>
                      <FormMessage />
                    </FormItem>
                  )}
                />
                <FormField
                  control={form.control}
                  name="pregnancyStatus"
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel>Pregnancy status (optional)</FormLabel>
                      <FormControl>
                        <select
                          value={field.value ?? ''}
                          onChange={(e) => field.onChange(e.target.value || undefined)}
                          className="flex h-10 w-full rounded-md border border-input bg-background px-3 py-2 text-sm ring-offset-background file:border-0 file:bg-transparent file:text-sm file:font-medium placeholder:text-muted-foreground focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2 disabled:cursor-not-allowed disabled:opacity-50"
                        >
                          <option value="">None</option>
                          <option value="pregnant">Pregnant</option>
                          <option value="breastfeeding">Breastfeeding</option>
                        </select>
                      </FormControl>
                      <FormMessage />
                    </FormItem>
                  )}
                />
                <FormField
                  control={form.control}
                  name="absorptionIssues"
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel>Absorption issues (0-10, optional)</FormLabel>
                      <FormControl>
                        <Input type="number" step="1" placeholder="e.g., 0" value={field.value ?? ''} onChange={(e) => field.onChange(e.target.value === '' ? undefined : Number(e.target.value))} />
                      </FormControl>
                      <FormMessage />
                    </FormItem>
                  )}
                />
                <FormField
                  control={form.control}
                  name="currentIntake"
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel>Current daily intake (mcg, optional)</FormLabel>
                      <FormControl>
                        <Input type="number" step="0.1" placeholder="e.g., 2.4" value={field.value ?? ''} onChange={(e) => field.onChange(e.target.value === '' ? undefined : Number(e.target.value))} />
                      </FormControl>
                      <FormMessage />
                    </FormItem>
                  )}
                />
              </div>
              <Button type="submit" className="w-full md:w-auto">
                Calculate B12 requirements
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
            <CardDescription>See recommended B12 intake, deficiency risk, and recommendations.</CardDescription>
          </CardHeader>
          <CardContent className="space-y-6">
            <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
              <div className="p-4 border rounded">
                <p className="text-sm text-muted-foreground">Recommended intake</p>
                <p className="text-2xl font-semibold text-primary">{result.recommendedIntake} mcg</p>
                <p className="text-xs text-muted-foreground">Per day</p>
              </div>
              <div className="p-4 border rounded">
                <p className="text-sm text-muted-foreground">Current status</p>
                <p className="text-2xl font-semibold text-primary">{result.currentStatus}</p>
                <p className="text-xs text-muted-foreground">Intake assessment</p>
              </div>
              <div className="p-4 border rounded">
                <p className="text-sm text-muted-foreground">Deficiency risk</p>
                <p className="text-2xl font-semibold text-primary">{result.deficiencyRisk}</p>
                <p className="text-xs text-muted-foreground">Risk level</p>
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
            <strong>Base requirement</strong> = 2.4 mcg for adults (1.8-2.4 mcg for children, 2.6 mcg for pregnancy, 2.8 mcg for breastfeeding).
          </p>
          <p>
            <strong>Diet multiplier</strong>: Omnivore = 1.0x, Vegetarian = 1.5x, Vegan = 2.5x (higher due to limited/no dietary sources).
          </p>
          <p>
            <strong>Absorption multiplier</strong>: None (0) = 1.0x, Mild (1-3) = 1.5x, Moderate (4-6) = 2.5x, Severe (7-10) = 5.0x.
          </p>
          <p>
            <strong>Recommended intake</strong> = Base requirement × Diet multiplier × Absorption multiplier (rounded to practical supplement sizes).
          </p>
          <p>Vegans must supplement as B12 is only found in animal products. Those with absorption issues may need high-dose supplements (500-1000+ mcg).</p>
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
                <p className="text-sm text-muted-foreground">Absorption adjustment</p>
                <p className="text-xl font-semibold text-primary">{result.absorptionAdjustment.toFixed(1)}x</p>
                <p className="text-xs text-muted-foreground">Multiplier factor</p>
              </div>
              <div className="p-4 border rounded">
                <p className="text-sm text-muted-foreground">Weekly equivalent</p>
                <p className="text-xl font-semibold text-primary">{(result.recommendedIntake * 7).toFixed(0)} mcg</p>
                <p className="text-xs text-muted-foreground">If taking weekly</p>
              </div>
              <div className="p-4 border rounded">
                <p className="text-sm text-muted-foreground">Monitoring frequency</p>
                <p className="text-xl font-semibold text-primary">Annual</p>
                <p className="text-xs text-muted-foreground">Blood test recommended</p>
              </div>
            </div>
          ) : (
            <p className="text-sm text-muted-foreground">Enter your B12 data to see additional insights.</p>
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
          <p>Vitamin B12 is essential for red blood cell formation, DNA synthesis, and neurological function. Deficiency can cause serious health problems. Requirements vary by age, diet, pregnancy status, and absorption capacity.</p>
          <p>Use this calculator to determine your daily B12 requirements based on your individual factors. Vegans and those with absorption issues typically need higher intakes through supplements or fortified foods.</p>
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
          <p>This tool calculates daily vitamin B12 requirements based on age, diet type, health conditions, and lifestyle factors to prevent deficiency.</p>
          <p>Outputs include recommended intake, current status, deficiency risk, absorption adjustments, status, recommendations, an action plan, and supporting metrics.</p>
          <p>Formula, steps, guide content, related tools, and FAQs ensure humans or AI assistants can interpret the methodology instantly.</p>
        </CardContent>
      </Card>
    </div>
  );
}



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
  healthGoal: z.enum(['maintenance', 'digestive', 'immune', 'antibiotic_recovery'], { invalid_type_error: 'Select health goal' }),
  currentIntake: z.number({ invalid_type_error: 'Enter current intake' }).min(0).max(1000).optional(),
  age: z.number({ invalid_type_error: 'Enter age' }).min(18).max(100).optional(),
  strainDiversity: z.number({ invalid_type_error: 'Enter strain diversity' }).min(1).max(20).optional(),
});

type FormValues = z.infer<typeof formSchema>;

type ResultPayload = {
  recommendedDose: number;
  cfuBillion: number;
  recommendedStrains: number;
  doseFrequency: string;
  status: 'optimal' | 'good' | 'moderate' | 'low';
  interpretation: string;
  recommendations: string[];
  plan: { label: string; detail: string }[];
};

const steps = [
  'Select your primary health goal (maintenance, digestive support, immune support, or antibiotic recovery).',
  'Optionally enter current daily probiotic intake in billion CFU.',
  'Optionally enter your age (probiotic needs may vary with age).',
  'Optionally enter number of probiotic strains in your supplement (1-20).',
  'Review recommended daily dose, CFU, strain recommendations, and dosing frequency.',
];

const faqs = [
  {
    question: 'What are probiotics?',
    answer:
      'Probiotics are live beneficial bacteria that, when consumed in adequate amounts, provide health benefits. They help restore or maintain a healthy balance of gut bacteria, support digestion, and boost immune function.',
  },
  {
    question: 'What is CFU and how much do I need?',
    answer:
      'CFU (Colony Forming Units) measures the number of live bacteria in a probiotic. General maintenance: 1-10 billion CFU. Therapeutic doses: 10-50+ billion CFU. Higher doses are often recommended for specific conditions or after antibiotics.',
  },
  {
    question: 'Do I need multiple probiotic strains?',
    answer:
      'Multi-strain probiotics (5-10+ strains) are generally more effective than single strains because different bacteria perform different functions. A diverse blend can address multiple aspects of gut health simultaneously.',
  },
  {
    question: 'When should I take probiotics?',
    answer:
      'Probiotics are often most effective when taken with meals or 30 minutes before meals, as food helps protect bacteria from stomach acid. Some people prefer taking them in the morning, others with dinner. Consistency is more important than timing.',
  },
  {
    question: 'How long do probiotics take to work?',
    answer:
      'Some people notice digestive improvements within days, but significant benefits typically appear after 2-4 weeks of consistent use. Full effects may take 2-3 months. Continue taking probiotics consistently for best results.',
  },
  {
    question: 'Do I need probiotics if I eat fermented foods?',
    answer:
      'Fermented foods can provide probiotics, but amounts vary widely. If you regularly consume diverse fermented foods (yogurt, kefir, sauerkraut, kimchi), you may need lower supplemental doses. Supplements ensure consistent, measured doses.',
  },
  {
    question: 'What happens if I stop taking probiotics?',
    answer:
      'Probiotic effects are generally temporary if you stop supplementation. However, if you\'ve improved your diet (more fiber, fermented foods) and gut health, some benefits may persist. Many people benefit from ongoing probiotic support.',
  },
  {
    question: 'Can probiotics cause side effects?',
    answer:
      'Some people experience temporary gas, bloating, or digestive changes when starting probiotics, especially at high doses. These usually resolve within 1-2 weeks as your gut adjusts. Start with lower doses and increase gradually.',
  },
  {
    question: 'Should I take probiotics with antibiotics?',
    answer:
      'Yes, but timing matters. Take probiotics at least 2-3 hours after antibiotics to avoid the antibiotic killing the probiotic bacteria. Continue probiotics for 2-4 weeks after finishing antibiotics to restore gut diversity.',
  },
  {
    question: 'Are there different types of probiotics?',
    answer:
      'Yes. Common genera include Lactobacillus, Bifidobacterium, and Saccharomyces. Different strains have different benefits. Lactobacillus acidophilus supports digestion, while Bifidobacterium longum may help with inflammation and immune function.',
  },
];

const relatedCalculators = [
  {
    name: 'Gut Microbiome Diversity Wellness Score',
    slug: 'gut-microbiome-diversity-score-calculator',
    description: 'Get wellness insights about gut microbiome diversity.',
  },
  {
    name: 'Prebiotic Fiber Target Calculator',
    slug: 'prebiotic-fiber-target-calculator',
    description: 'Feed probiotics with prebiotic fiber.',
  },
  {
    name: 'Antioxidant Diversity Wellness Index',
    slug: 'antioxidant-diversity-index-calculator',
    description: 'Get wellness insights about antioxidant diversity.',
  },
  {
    name: 'Fiber Intake Calculator',
    slug: 'carbohydrate-intake-calculator',
    description: 'Calculate fiber to support probiotics.',
  },
];

const baseUrl = 'https://mycalculating.com/category/health-fitness/probiotic-daily-dose-estimator';

const schemaMarkup = {
  '@context': 'https://schema.org',
  '@graph': [
    {
      '@type': 'BreadcrumbList',
      itemListElement: [
        { '@type': 'ListItem', position: 1, name: 'Home', item: 'https://mycalculating.com' },
        { '@type': 'ListItem', position: 2, name: 'Health & Fitness', item: 'https://mycalculating.com/category/health-fitness' },
        { '@type': 'ListItem', position: 3, name: 'Probiotic Daily Dose Wellness Guide', item: baseUrl },
      ],
    },
    {
      '@type': 'SoftwareApplication',
      name: 'Probiotic Daily Dose Wellness Guide',
      applicationCategory: 'Calculator',
      operatingSystem: 'Web Browser',
      description: 'Get general wellness insights about daily probiotic dose based on wellness goals, current intake, and specific probiotic strains. This is a personal lifestyle insight, not a medical evaluation.',
      url: baseUrl,
      offers: { '@type': 'Offer', price: '0', priceCurrency: 'USD' },
    },
  ],
};

const calculateResult = (values: FormValues): ResultPayload => {
  const healthGoal = values.healthGoal;
  const currentIntake = values.currentIntake ?? 0;
  const age = values.age ?? 35;
  const strainDiversity = values.strainDiversity ?? 5;
  
  // Base dose by health goal (in billion CFU)
  let baseDose = 5; // Default maintenance
  if (healthGoal === 'maintenance') {
    baseDose = 5;
  } else if (healthGoal === 'digestive') {
    baseDose = 10;
  } else if (healthGoal === 'immune') {
    baseDose = 15;
  } else if (healthGoal === 'antibiotic_recovery') {
    baseDose = 25; // Higher dose for recovery
  }
  
  // Age adjustment (older adults may need slightly more)
  if (age >= 65) {
    baseDose *= 1.2;
  }
  
  // Strain diversity adjustment (more strains = can use slightly lower total CFU)
  let diversityMultiplier = 1.0;
  if (strainDiversity >= 10) {
    diversityMultiplier = 0.9; // 10% reduction with high diversity
  } else if (strainDiversity >= 5) {
    diversityMultiplier = 0.95;
  }
  
  let recommendedDose = baseDose * diversityMultiplier;
  
  // Round to practical supplement sizes (1, 5, 10, 15, 20, 25, 30, 50 billion CFU)
  if (recommendedDose <= 3) {
    recommendedDose = 5;
  } else if (recommendedDose <= 7.5) {
    recommendedDose = 10;
  } else if (recommendedDose <= 12.5) {
    recommendedDose = 15;
  } else if (recommendedDose <= 17.5) {
    recommendedDose = 20;
  } else if (recommendedDose <= 27.5) {
    recommendedDose = 30;
  } else if (recommendedDose <= 37.5) {
    recommendedDose = 50;
  } else {
    recommendedDose = 50;
  }
  
  const cfuBillion = recommendedDose;
  
  // Recommended strain count
  let recommendedStrains = 5;
  if (healthGoal === 'antibiotic_recovery' || healthGoal === 'immune') {
    recommendedStrains = 10;
  } else if (healthGoal === 'digestive') {
    recommendedStrains = 7;
  }
  
  // Dose frequency
  let doseFrequency = 'Once daily';
  if (recommendedDose >= 30) {
    doseFrequency = 'Once daily or split into 2 doses';
  }
  
  let status: ResultPayload['status'] = 'optimal';
  let interpretation = 'This suggests a general lifestyle tendency where your probiotic dose recommendation may be calculated based on your wellness goals and needs.';
  
  const doseGap = recommendedDose - currentIntake;
  
  if (currentIntake > 0) {
    if (currentIntake >= recommendedDose * 0.8) {
      status = 'optimal';
      interpretation = 'This suggests a general lifestyle tendency where your current probiotic intake may align well with suggestions for your wellness goals.';
    } else if (currentIntake >= recommendedDose * 0.5) {
      status = 'good';
      interpretation = 'This suggests a general lifestyle tendency where your current intake is good but could be increased to meet suggestions.';
    } else if (doseGap > 10) {
      status = 'moderate';
      interpretation = 'This suggests a general lifestyle tendency where your current intake may be below suggested levels. You may consider increasing dose to support your wellness goals.';
    } else {
      status = 'low';
      interpretation = 'This suggests a general lifestyle tendency where your current probiotic intake may be below suggestions. You may consider increasing to support your wellness goals.';
    }
  }
  
  const recommendations = [
    `Suggested daily probiotic dose: ${recommendedDose} billion CFU for ${healthGoal.replace('_', ' ')} support. This is a personal insight, not a medical evaluation.`,
    `You may consider aiming for a supplement with ${recommendedStrains}+ different probiotic strains for comprehensive gut wellness support.`,
    'You may consider taking probiotics with meals or 30 minutes before meals to help protect bacteria from stomach acid and improve survival rates.',
    currentIntake > 0 && doseGap > 0
      ? `Your current intake is ${currentIntake} billion CFU. You may consider increasing by ${doseGap.toFixed(0)} billion CFU to meet suggestions.`
      : 'If starting probiotics, you may consider beginning with a lower dose and gradually increasing to allow your gut to adjust and minimize potential side effects.',
  ];
  
  if (healthGoal === 'antibiotic_recovery') {
    recommendations.push('During antibiotic recovery, you may consider taking probiotics 2-3 hours after antibiotics. Continue probiotics for 2-4 weeks after finishing antibiotics to support gut wellness.');
  }
  
  if (strainDiversity < 5 && recommendedStrains >= 5) {
    recommendations.push(`Your current supplement has ${strainDiversity} strain(s). You may consider switching to a multi-strain probiotic (${recommendedStrains}+ strains) for broader benefits.`);
  }
  
  const plan = [
    { label: 'This Week', detail: `You may consider starting with ${Math.min(recommendedDose, 10)} billion CFU daily to allow your gut to adjust. Take with meals and monitor for any digestive changes.` },
    { label: 'This Month', detail: `You may consider gradually increasing to ${recommendedDose} billion CFU daily if starting lower. Continue consistently. Look for improvements in digestion, energy, and overall well-being.` },
    { label: 'Ongoing', detail: `You may consider maintaining ${recommendedDose} billion CFU daily for your wellness goals. Combine probiotics with prebiotic foods (fiber) to nourish the beneficial bacteria. Consider rotating probiotic supplements periodically to introduce different strains.` },
  ];
  
  return { recommendedDose, cfuBillion, recommendedStrains, doseFrequency, status, interpretation, recommendations, plan };
};

export default function ProbioticDailyDoseEstimator() {
  const [result, setResult] = useState<ResultPayload | null>(null);

  const form = useForm<FormValues>({
    resolver: zodResolver(formSchema),
    defaultValues: {
      healthGoal: undefined,
      currentIntake: undefined,
      age: undefined,
      strainDiversity: undefined,
    },
  });

  return (
    <div className="space-y-8">
      <Script id="probiotic-dose-schema" type="application/ld+json" strategy="afterInteractive" dangerouslySetInnerHTML={{ __html: JSON.stringify(schemaMarkup) }} />

      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <Moon className="h-5 w-5" />
            Probiotic Daily Dose Wellness Guide
          </CardTitle>
          <CardDescription>Get general wellness insights about daily probiotic dose based on wellness goals, current intake, and specific probiotic strains. This is a personal lifestyle insight, not a medical evaluation.</CardDescription>
        </CardHeader>
      </Card>

      <Card>
        <CardHeader>
          <CardTitle>Input your probiotic data</CardTitle>
        </CardHeader>
        <CardContent>
          <Form {...form}>
            <form onSubmit={form.handleSubmit((values) => setResult(calculateResult(values)))} className="space-y-6">
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <FormField
                  control={form.control}
                  name="healthGoal"
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel>Health goal</FormLabel>
                      <FormControl>
                        <select
                          value={field.value ?? ''}
                          onChange={(e) => field.onChange(e.target.value)}
                          className="flex h-10 w-full rounded-md border border-input bg-background px-3 py-2 text-sm ring-offset-background file:border-0 file:bg-transparent file:text-sm file:font-medium placeholder:text-muted-foreground focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2 disabled:cursor-not-allowed disabled:opacity-50"
                        >
                          <option value="">Select health goal</option>
                          <option value="maintenance">General Maintenance</option>
                          <option value="digestive">Digestive Support</option>
                          <option value="immune">Immune Support</option>
                          <option value="antibiotic_recovery">Antibiotic Recovery</option>
                        </select>
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
                      <FormLabel>Current daily intake (billion CFU, optional)</FormLabel>
                      <FormControl>
                        <Input type="number" step="1" placeholder="e.g., 5" value={field.value ?? ''} onChange={(e) => field.onChange(e.target.value === '' ? undefined : Number(e.target.value))} />
                      </FormControl>
                      <FormMessage />
                    </FormItem>
                  )}
                />
                <FormField
                  control={form.control}
                  name="age"
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel>Age (years, optional)</FormLabel>
                      <FormControl>
                        <Input type="number" step="1" placeholder="e.g., 35" value={field.value ?? ''} onChange={(e) => field.onChange(e.target.value === '' ? undefined : Number(e.target.value))} />
                      </FormControl>
                      <FormMessage />
                    </FormItem>
                  )}
                />
                <FormField
                  control={form.control}
                  name="strainDiversity"
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel>Number of strains (optional)</FormLabel>
                      <FormControl>
                        <Input type="number" step="1" placeholder="e.g., 10" value={field.value ?? ''} onChange={(e) => field.onChange(e.target.value === '' ? undefined : Number(e.target.value))} />
                      </FormControl>
                      <FormMessage />
                    </FormItem>
                  )}
                />
              </div>
              <Button type="submit" className="w-full md:w-auto">
                Estimate probiotic dose
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
            <CardDescription>See recommended probiotic dose, CFU, strain recommendations, and dosing frequency.</CardDescription>
          </CardHeader>
          <CardContent className="space-y-6">
            <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
              <div className="p-4 border rounded">
                <p className="text-sm text-muted-foreground">Recommended dose</p>
                <p className="text-2xl font-semibold text-primary">{result.recommendedDose} billion CFU</p>
                <p className="text-xs text-muted-foreground">Per day</p>
              </div>
              <div className="p-4 border rounded">
                <p className="text-sm text-muted-foreground">Recommended strains</p>
                <p className="text-2xl font-semibold text-primary">{result.recommendedStrains}+</p>
                <p className="text-xs text-muted-foreground">Different strains</p>
              </div>
              <div className="p-4 border rounded">
                <p className="text-sm text-muted-foreground">Dosing frequency</p>
                <p className="text-2xl font-semibold text-primary">{result.doseFrequency}</p>
                <p className="text-xs text-muted-foreground">Recommended schedule</p>
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
            <strong>Base dose</strong> (billion CFU): Maintenance = 5, Digestive = 10, Immune = 15, Antibiotic recovery = 25.
          </p>
          <p>
            <strong>Age adjustment</strong>: Adults 65+ receive 20% increase due to potential reduced gut diversity with age.
          </p>
          <p>
            <strong>Strain diversity adjustment</strong>: High diversity (10+ strains) allows 10% dose reduction, moderate (5-9 strains) allows 5% reduction.
          </p>
          <p>
            <strong>Recommended strains</strong>: Maintenance = 5+, Digestive = 7+, Immune = 10+, Antibiotic recovery = 10+.
          </p>
          <p>Higher doses are recommended for therapeutic goals (digestive issues, immune support, antibiotic recovery) compared to general maintenance. Multi-strain probiotics are generally more effective than single strains.</p>
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
                <p className="text-sm text-muted-foreground">Dose adjustment needed</p>
                <p className="text-xl font-semibold text-primary">
                  {(() => {
                    const current = form.getValues().currentIntake ?? 0;
                    const diff = result.recommendedDose - current;
                    return diff > 0 ? `+${diff.toFixed(0)} billion` : diff < 0 ? `${diff.toFixed(0)} billion` : 'None';
                  })()}
                </p>
                <p className="text-xs text-muted-foreground">CFU difference</p>
              </div>
              <div className="p-4 border rounded">
                <p className="text-sm text-muted-foreground">Minimum effective dose</p>
                <p className="text-xl font-semibold text-primary">1 billion CFU</p>
                <p className="text-xs text-muted-foreground">General threshold</p>
              </div>
              <div className="p-4 border rounded">
                <p className="text-sm text-muted-foreground">Therapeutic range</p>
                <p className="text-xl font-semibold text-primary">10-50 billion</p>
                <p className="text-xs text-muted-foreground">For specific goals</p>
              </div>
            </div>
          ) : (
            <p className="text-sm text-muted-foreground">Enter your probiotic data to see additional insights.</p>
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
          <p>Probiotics are live beneficial bacteria that support gut health, digestion, and immune function. The optimal dose depends on your health goals, age, and the specific probiotic strains used. Higher doses and more diverse strains are often recommended for therapeutic purposes.</p>
          <p>Use this calculator to estimate your daily probiotic dose requirements based on your health goals, current intake, and probiotic characteristics to optimize gut health support.</p>
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
          <p>This tool provides general wellness insights about daily probiotic dose based on wellness goals, current intake, and specific probiotic strains. This is a personal lifestyle insight, not a medical evaluation.</p>
          <p>Outputs include suggested dose in billion CFU, suggested number of strains, dosing frequency, status, recommendations, an action plan, and supporting metrics.</p>
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


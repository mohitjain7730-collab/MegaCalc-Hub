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
  fiberIntake: z.number({ invalid_type_error: 'Enter fiber intake' }).min(0).max(100),
  fermentedFoods: z.number({ invalid_type_error: 'Enter fermented foods' }).min(0).max(14).optional(),
  prebioticFoods: z.number({ invalid_type_error: 'Enter prebiotic foods' }).min(0).max(14).optional(),
  antibioticUse: z.number({ invalid_type_error: 'Enter antibiotic use frequency' }).min(0).max(10).optional(),
  stressLevel: z.number({ invalid_type_error: 'Enter stress level' }).min(1).max(10).optional(),
});

type FormValues = z.infer<typeof formSchema>;

type ResultPayload = {
  diversityScore: number;
  gutHealthLevel: string;
  fiberScore: number;
  lifestyleScore: number;
  status: 'optimal' | 'good' | 'moderate' | 'low';
  interpretation: string;
  recommendations: string[];
  plan: { label: string; detail: string }[];
};

const steps = [
  'Enter your daily fiber intake in grams.',
  'Enter servings per week of fermented foods (yogurt, kefir, sauerkraut, kimchi, etc.).',
  'Enter servings per week of prebiotic foods (garlic, onions, bananas, oats, etc.).',
  'Optionally rate antibiotic use frequency (0 = never, 10 = very frequent).',
  'Optionally rate your stress level (1 = low, 10 = very high).',
  'Review gut microbiome diversity score, gut health level, and recommendations.',
];

const faqs = [
  {
    question: 'What is gut microbiome diversity?',
    answer:
      'Gut microbiome diversity refers to the variety of different bacterial species in your gut. Higher diversity is associated with better digestive health, immune function, mental health, and reduced risk of chronic diseases.',
  },
  {
    question: 'Why is microbiome diversity important?',
    answer:
      'A diverse microbiome is more resilient and can better handle disruptions. Diverse bacteria perform different functions (digestion, vitamin production, immune support), and higher diversity correlates with better overall health outcomes.',
  },
  {
    question: 'How does fiber affect gut diversity?',
    answer:
      'Fiber is the primary food source for beneficial gut bacteria. Adequate fiber intake (25-35g daily) feeds diverse bacterial species, promoting their growth and diversity. Low fiber diets reduce diversity and can lead to dysbiosis.',
  },
  {
    question: 'What are prebiotic foods?',
    answer:
      'Prebiotics are non-digestible fibers that feed beneficial gut bacteria. Rich sources include garlic, onions, leeks, asparagus, bananas, oats, barley, and chicory root. They selectively promote the growth of beneficial bacteria.',
  },
  {
    question: 'What are fermented foods?',
    answer:
      'Fermented foods contain live beneficial bacteria (probiotics). Examples include yogurt, kefir, sauerkraut, kimchi, kombucha, miso, and tempeh. Regular consumption introduces diverse bacterial strains to your gut.',
  },
  {
    question: 'How do antibiotics affect gut diversity?',
    answer:
      'Antibiotics can significantly reduce gut microbiome diversity by killing both harmful and beneficial bacteria. Repeated or long-term antibiotic use can permanently alter gut composition. Probiotics and prebiotics help restore diversity after antibiotic use.',
  },
  {
    question: 'How does stress affect the gut microbiome?',
    answer:
      'Chronic stress can reduce gut microbiome diversity through the gut-brain axis. Stress hormones and altered gut motility can negatively impact beneficial bacteria, reducing diversity and potentially contributing to digestive issues.',
  },
  {
    question: 'How long does it take to improve diversity?',
    answer:
      'Microbiome changes begin within days of dietary changes, but significant diversity improvements typically take weeks to months. Consistent dietary and lifestyle changes (high fiber, fermented foods) gradually increase diversity over time.',
  },
  {
    question: 'Can I measure my gut microbiome diversity?',
    answer:
      'Commercial microbiome testing kits can analyze stool samples and provide diversity scores. However, symptoms (regular digestion, stable mood, good energy) often indicate healthy diversity. Focus on dietary habits that support diversity.',
  },
  {
    question: 'What foods harm gut diversity?',
    answer:
      'Highly processed foods, excessive sugar, artificial sweeteners, and low-fiber diets can reduce diversity. Excessive alcohol and chronic stress also negatively impact the microbiome. Focus on whole, fiber-rich, minimally processed foods.',
  },
];

const relatedCalculators = [
  {
    name: 'Prebiotic Fiber Target Calculator',
    slug: 'prebiotic-fiber-target-calculator',
    description: 'Calculate prebiotic fiber targets for gut health.',
  },
  {
    name: 'Probiotic Daily Dose Estimator',
    slug: 'probiotic-daily-dose-estimator',
    description: 'Estimate probiotic needs for microbiome support.',
  },
  {
    name: 'Fiber Intake Calculator',
    slug: 'fiber-intake-calculator',
    description: 'Track total fiber intake for gut health.',
  },
  {
    name: 'Antioxidant Diversity Wellness Index',
    slug: 'antioxidant-diversity-index-calculator',
    description: 'Get wellness insights about antioxidant diversity for gut health.',
  },
];

const baseUrl = 'https://mycalculating.com/category/health-fitness/gut-microbiome-diversity-score-calculator';

const schemaMarkup = {
  '@context': 'https://schema.org',
  '@graph': [
    {
      '@type': 'BreadcrumbList',
      itemListElement: [
        { '@type': 'ListItem', position: 1, name: 'Home', item: 'https://mycalculating.com' },
        { '@type': 'ListItem', position: 2, name: 'Health & Fitness', item: 'https://mycalculating.com/category/health-fitness' },
        { '@type': 'ListItem', position: 3, name: 'Gut Microbiome Diversity Wellness Score', item: baseUrl },
      ],
    },
    {
      '@type': 'SoftwareApplication',
      name: 'Gut Microbiome Diversity Wellness Score',
      applicationCategory: 'Calculator',
      operatingSystem: 'Web Browser',
      description: 'Get general wellness insights about gut microbiome diversity based on dietary fiber intake, fermented foods, and lifestyle factors. This is a personal lifestyle insight, not a medical evaluation.',
      url: baseUrl,
      offers: { '@type': 'Offer', price: '0', priceCurrency: 'USD' },
    },
  ],
};

const calculateResult = (values: FormValues): ResultPayload => {
  const fiberIntake = values.fiberIntake;
  const fermentedFoods = values.fermentedFoods ?? 0;
  const prebioticFoods = values.prebioticFoods ?? 0;
  const antibioticUse = values.antibioticUse ?? 0;
  const stressLevel = values.stressLevel ?? 5;
  
  // Fiber score (0-50 points)
  let fiberScore = 0;
  if (fiberIntake >= 30) {
    fiberScore = 50; // Excellent
  } else if (fiberIntake >= 25) {
    fiberScore = 40; // Good
  } else if (fiberIntake >= 20) {
    fiberScore = 30; // Moderate
  } else if (fiberIntake >= 15) {
    fiberScore = 20; // Low
  } else {
    fiberScore = 10; // Very low
  }
  
  // Fermented foods score (0-20 points)
  const fermentedScore = Math.min(20, (fermentedFoods / 7) * 20); // 7 servings/week = 20 points
  
  // Prebiotic foods score (0-20 points)
  const prebioticScore = Math.min(20, (prebioticFoods / 7) * 20); // 7 servings/week = 20 points
  
  // Lifestyle score (0-10 points) - negative factors
  let lifestyleScore = 10;
  if (antibioticUse >= 7) {
    lifestyleScore -= 5; // High antibiotic use significantly reduces diversity
  } else if (antibioticUse >= 4) {
    lifestyleScore -= 3;
  } else if (antibioticUse > 0) {
    lifestyleScore -= 1;
  }
  
  if (stressLevel >= 8) {
    lifestyleScore -= 3; // Very high stress
  } else if (stressLevel >= 6) {
    lifestyleScore -= 2; // High stress
  } else if (stressLevel <= 3) {
    lifestyleScore += 1; // Low stress is beneficial
  }
  
  lifestyleScore = Math.max(0, lifestyleScore);
  
  // Total diversity score (0-100)
  const diversityScore = fiberScore + fermentedScore + prebioticScore + lifestyleScore;
  
  let gutHealthLevel: string;
  let status: ResultPayload['status'] = 'optimal';
  let interpretation = 'This suggests a general lifestyle tendency where your gut microbiome diversity may be excellent based on dietary and lifestyle factors.';
  
  if (diversityScore >= 80) {
    gutHealthLevel = 'Excellent';
    status = 'optimal';
    interpretation = 'This suggests a general lifestyle tendency where your gut microbiome diversity is excellent. You\'re supporting a diverse microbiome through diet and lifestyle.';
  } else if (diversityScore >= 65) {
    gutHealthLevel = 'Good';
    status = 'good';
    interpretation = 'This suggests a general lifestyle tendency where your gut microbiome diversity is good. Minor improvements in fiber intake or fermented/prebiotic foods may further enhance diversity.';
  } else if (diversityScore >= 50) {
    gutHealthLevel = 'Moderate';
    status = 'moderate';
    interpretation = 'This suggests a general lifestyle tendency where your gut microbiome diversity is moderate. Increasing fiber intake and adding fermented/prebiotic foods may support diversity.';
  } else {
    gutHealthLevel = 'Lower';
    status = 'low';
    interpretation = 'This suggests a general lifestyle tendency where your gut microbiome diversity may be lower. You may consider increasing fiber intake, adding fermented and prebiotic foods, and addressing lifestyle factors that may be reducing diversity.';
  }
  
  const recommendations = [
    `Your gut microbiome diversity score is ${diversityScore.toFixed(0)}/100 (${gutHealthLevel} level). This is a personal insight, not a medical evaluation.`,
    fiberIntake < 25
      ? `You may consider increasing fiber intake to at least 25-35g daily. Current: ${fiberIntake}g. Add more whole grains, fruits, vegetables, legumes, and nuts to reach target.`
      : 'Your fiber intake is good. You may consider continuing to maintain adequate fiber to support diverse gut bacteria.',
    fermentedFoods < 3
      ? 'You may consider adding fermented foods 2-3 times per week (yogurt, kefir, sauerkraut, kimchi, kombucha) to introduce beneficial bacteria to your gut.'
      : 'Good fermented food intake. You may consider continuing to include fermented foods regularly to maintain microbiome diversity.',
    prebioticFoods < 3
      ? 'You may consider including prebiotic foods daily (garlic, onions, bananas, oats, asparagus, leeks) to feed beneficial gut bacteria and support their growth.'
      : 'Excellent prebiotic food intake. You may consider continuing to include prebiotic-rich foods to nourish your gut microbiome.',
  ];
  
  if (antibioticUse >= 4) {
    recommendations.push('Frequent antibiotic use may reduce gut diversity. After antibiotics, you may consider focusing on probiotics and prebiotics to support diversity. Discuss antibiotic alternatives with a qualified professional when appropriate.');
  }
  
  if (stressLevel >= 7) {
    recommendations.push('High stress levels may reduce gut diversity. Stress management techniques (meditation, exercise, adequate sleep) may help support a healthy microbiome.');
  }
  
  const plan = [
    { label: 'This Week', detail: `You may consider aiming for ${Math.max(25, fiberIntake + 5)}g fiber daily. Add 1-2 servings of fermented foods and include prebiotic foods in meals.` },
    { label: 'This Month', detail: 'You may consider building to 25-35g fiber daily consistently. Include fermented foods 2-3 times per week. Incorporate prebiotic foods into daily meals. Monitor how you feel and digestive wellness improvements.' },
    { label: 'Ongoing', detail: 'You may consider maintaining high fiber intake (25-35g daily). Continue regular fermented food consumption. Include diverse prebiotic foods. Minimize antibiotic use when possible and manage stress for optimal gut wellness.' },
  ];
  
  return { diversityScore, gutHealthLevel, fiberScore, lifestyleScore, status, interpretation, recommendations, plan };
};

export default function GutMicrobiomeDiversityScoreCalculator() {
  const [result, setResult] = useState<ResultPayload | null>(null);

  const form = useForm<FormValues>({
    resolver: zodResolver(formSchema),
    defaultValues: {
      fiberIntake: undefined,
      fermentedFoods: undefined,
      prebioticFoods: undefined,
      antibioticUse: undefined,
      stressLevel: undefined,
    },
  });

  return (
    <div className="space-y-8">
      <Script id="gut-microbiome-schema" type="application/ld+json" strategy="afterInteractive" dangerouslySetInnerHTML={{ __html: JSON.stringify(schemaMarkup) }} />

      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <Moon className="h-5 w-5" />
            Gut Microbiome Diversity Wellness Score
          </CardTitle>
          <CardDescription>Get general wellness insights about gut microbiome diversity based on dietary fiber intake, fermented foods, and lifestyle factors. This is a personal lifestyle insight, not a medical evaluation.</CardDescription>
        </CardHeader>
      </Card>

      <Card>
        <CardHeader>
          <CardTitle>Input your gut health data</CardTitle>
        </CardHeader>
        <CardContent>
          <Form {...form}>
            <form onSubmit={form.handleSubmit((values) => setResult(calculateResult(values)))} className="space-y-6">
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <FormField
                  control={form.control}
                  name="fiberIntake"
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel>Daily fiber intake (grams)</FormLabel>
                      <FormControl>
                        <Input type="number" step="1" placeholder="e.g., 25" value={field.value ?? ''} onChange={(e) => field.onChange(e.target.value === '' ? undefined : Number(e.target.value))} />
                      </FormControl>
                      <FormMessage />
                    </FormItem>
                  )}
                />
                <FormField
                  control={form.control}
                  name="fermentedFoods"
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel>Fermented foods (servings/week, optional)</FormLabel>
                      <FormControl>
                        <Input type="number" step="1" placeholder="e.g., 3" value={field.value ?? ''} onChange={(e) => field.onChange(e.target.value === '' ? undefined : Number(e.target.value))} />
                      </FormControl>
                      <FormMessage />
                    </FormItem>
                  )}
                />
                <FormField
                  control={form.control}
                  name="prebioticFoods"
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel>Prebiotic foods (servings/week, optional)</FormLabel>
                      <FormControl>
                        <Input type="number" step="1" placeholder="e.g., 7" value={field.value ?? ''} onChange={(e) => field.onChange(e.target.value === '' ? undefined : Number(e.target.value))} />
                      </FormControl>
                      <FormMessage />
                    </FormItem>
                  )}
                />
                <FormField
                  control={form.control}
                  name="antibioticUse"
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel>Antibiotic use frequency (0-10, optional)</FormLabel>
                      <FormControl>
                        <Input type="number" step="1" placeholder="e.g., 0" value={field.value ?? ''} onChange={(e) => field.onChange(e.target.value === '' ? undefined : Number(e.target.value))} />
                      </FormControl>
                      <FormMessage />
                    </FormItem>
                  )}
                />
                <FormField
                  control={form.control}
                  name="stressLevel"
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel>Stress level (1-10, optional)</FormLabel>
                      <FormControl>
                        <Input type="number" step="1" placeholder="e.g., 5" value={field.value ?? ''} onChange={(e) => field.onChange(e.target.value === '' ? undefined : Number(e.target.value))} />
                      </FormControl>
                      <FormMessage />
                    </FormItem>
                  )}
                />
              </div>
              <Button type="submit" className="w-full md:w-auto">
                Calculate diversity score
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
            <CardDescription>See gut microbiome diversity score, gut wellness level, and recommendations.</CardDescription>
          </CardHeader>
          <CardContent className="space-y-6">
            <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
              <div className="p-4 border rounded">
                <p className="text-sm text-muted-foreground">Diversity score</p>
                <p className="text-2xl font-semibold text-primary">{result.diversityScore.toFixed(0)}/100</p>
                <p className="text-xs text-muted-foreground">{result.gutHealthLevel}</p>
              </div>
              <div className="p-4 border rounded">
                <p className="text-sm text-muted-foreground">Fiber score</p>
                <p className="text-2xl font-semibold text-primary">{result.fiberScore.toFixed(0)}/50</p>
                <p className="text-xs text-muted-foreground">Fiber contribution</p>
              </div>
              <div className="p-4 border rounded">
                <p className="text-sm text-muted-foreground">Lifestyle score</p>
                <p className="text-2xl font-semibold text-primary">{result.lifestyleScore.toFixed(0)}/10</p>
                <p className="text-xs text-muted-foreground">Lifestyle factors</p>
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
            <strong>Diversity Score</strong> = Fiber score (0-50) + Fermented foods score (0-20) + Prebiotic foods score (0-20) + Lifestyle score (0-10).
          </p>
          <p>
            <strong>Fiber score</strong>: ≥30g = 50 points, 25-29g = 40 points, 20-24g = 30 points, 15-19g = 20 points, &lt;15g = 10 points.
          </p>
          <p>
            <strong>Fermented foods score</strong> = (Servings per week / 7) × 20. <strong>Prebiotic foods score</strong> = (Servings per week / 7) × 20.
          </p>
          <p>
            <strong>Lifestyle score</strong>: Starts at 10. Subtracts points for antibiotic use (0-5 points) and high stress (0-3 points). Low stress adds 1 point.
          </p>
          <p>Higher diversity scores indicate a more diverse and resilient gut microbiome. Aim for scores ≥65 for good diversity, ≥80 for excellent diversity.</p>
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
                <p className="text-sm text-muted-foreground">Target fiber intake</p>
                <p className="text-xl font-semibold text-primary">25-35g/day</p>
                <p className="text-xs text-muted-foreground">Recommended range</p>
              </div>
              <div className="p-4 border rounded">
                <p className="text-sm text-muted-foreground">Fermented foods target</p>
                <p className="text-xl font-semibold text-primary">2-3x/week</p>
                <p className="text-xs text-muted-foreground">Optimal frequency</p>
              </div>
              <div className="p-4 border rounded">
                <p className="text-sm text-muted-foreground">Prebiotic foods target</p>
                <p className="text-xl font-semibold text-primary">Daily</p>
                <p className="text-xs text-muted-foreground">Include regularly</p>
              </div>
            </div>
          ) : (
            <p className="text-sm text-muted-foreground">Enter your gut health data to see additional insights.</p>
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
          <p>Gut microbiome diversity refers to the variety of bacterial species in your gut. Higher diversity is associated with better digestive health, immune function, and overall well-being. Diversity is supported by adequate fiber intake, fermented foods, prebiotic foods, and healthy lifestyle habits.</p>
          <p>Use this calculator to assess your gut microbiome diversity score based on dietary fiber intake, fermented foods, prebiotic foods, and lifestyle factors that influence gut health.</p>
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
          <p>This tool provides general wellness insights about gut microbiome diversity based on dietary fiber intake, fermented foods, and lifestyle factors. This is a personal lifestyle insight, not a medical evaluation.</p>
          <p>Outputs include diversity score, gut wellness level, fiber score, lifestyle score, status, recommendations, an action plan, and supporting metrics.</p>
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


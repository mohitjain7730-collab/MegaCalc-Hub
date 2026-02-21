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
  berryIntake: z.number({ invalid_type_error: 'Enter berry intake' }).min(0).max(10).optional(),
  citrusIntake: z.number({ invalid_type_error: 'Enter citrus intake' }).min(0).max(10).optional(),
  leafyGreens: z.number({ invalid_type_error: 'Enter leafy greens' }).min(0).max(10).optional(),
  nutsSeeds: z.number({ invalid_type_error: 'Enter nuts/seeds' }).min(0).max(10).optional(),
  colorfulVegetables: z.number({ invalid_type_error: 'Enter colorful vegetables' }).min(0).max(10).optional(),
  teaCoffee: z.number({ invalid_type_error: 'Enter tea/coffee' }).min(0).max(10).optional(),
  darkChocolate: z.number({ invalid_type_error: 'Enter dark chocolate' }).min(0).max(10).optional(),
});

type FormValues = z.infer<typeof formSchema>;

type ResultPayload = {
  diversityIndex: number;
  antioxidantScore: number;
  categoriesCovered: number;
  protectionLevel: string;
  status: 'optimal' | 'good' | 'moderate' | 'low';
  interpretation: string;
  recommendations: string[];
  plan: { label: string; detail: string }[];
};

const steps = [
  'Enter servings per week of berries (blueberries, strawberries, etc.).',
  'Enter servings per week of citrus fruits (oranges, grapefruit, etc.).',
  'Enter servings per week of leafy greens (spinach, kale, etc.).',
  'Enter servings per week of nuts and seeds.',
  'Enter servings per week of colorful vegetables (bell peppers, tomatoes, etc.).',
  'Enter servings per week of tea or coffee.',
  'Enter servings per week of dark chocolate.',
  'Review antioxidant diversity index, protection level, and recommendations.',
];

const faqs = [
  {
    question: 'What are antioxidants and why is diversity important?',
    answer:
      'Antioxidants are compounds that neutralize free radicals and reduce oxidative stress. Different antioxidants protect different cell types and tissues. A diverse intake provides comprehensive protection against various types of oxidative damage.',
  },
  {
    question: 'What is the antioxidant diversity index?',
    answer:
      'The antioxidant diversity index measures how many different types of antioxidant-rich food categories you consume. Higher diversity means broader protection, as different antioxidants work in different ways and protect different parts of your body.',
  },
  {
    question: 'Which foods are highest in antioxidants?',
    answer:
      'Top antioxidant sources include berries (blueberries, strawberries), dark leafy greens, nuts (especially walnuts), dark chocolate (70%+ cocoa), colorful vegetables (bell peppers, tomatoes), citrus fruits, and tea (especially green tea).',
  },
  {
    question: 'How many antioxidant categories should I aim for?',
    answer:
      'Aim for at least 5-6 different antioxidant categories weekly. This ensures you\'re getting a wide range of antioxidant types (vitamins C and E, flavonoids, carotenoids, polyphenols) for comprehensive protection.',
  },
  {
    question: 'Do supplements count toward diversity?',
    answer:
      'While supplements can provide specific antioxidants, food-based diversity is preferred because foods contain multiple antioxidants, phytochemicals, and other beneficial compounds that work synergistically. Supplements can complement but not replace dietary diversity.',
  },
  {
    question: 'Can I get too many antioxidants?',
    answer:
      'From food sources, it\'s very difficult to get excessive antioxidants. However, very high-dose antioxidant supplements (especially in isolation) may have pro-oxidant effects in some cases. Focus on diverse food sources rather than megadose supplements.',
  },
  {
    question: 'Does cooking affect antioxidant content?',
    answer:
      'Cooking methods vary in their effects. Some antioxidants are heat-stable, while others (like vitamin C) are reduced by cooking. Eating a mix of raw and cooked antioxidant-rich foods helps maximize intake. Light cooking (steaming, sautéing) preserves more than boiling.',
  },
  {
    question: 'How does antioxidant diversity affect aging?',
    answer:
      'Oxidative stress contributes to aging. Diverse antioxidants protect different cellular components (DNA, proteins, lipids) and reduce inflammation. A varied antioxidant diet supports healthy aging and may reduce chronic disease risk.',
  },
  {
    question: 'Are organic foods higher in antioxidants?',
    answer:
      'Some studies suggest organic produce may have slightly higher antioxidant content, but the difference is usually modest. The most important factor is consuming a wide variety of antioxidant-rich foods, regardless of organic status.',
  },
  {
    question: 'How quickly can I improve my antioxidant diversity?',
    answer:
      'You can improve diversity immediately by adding new antioxidant-rich foods. Aim to incorporate 1-2 new antioxidant categories per week. Long-term, consistent diverse intake provides cumulative protective benefits.',
  },
];

const relatedCalculators = [
  {
    name: 'Vitamin C Wellness Support Score Calculator',
    slug: 'vitamin-c-immunity-boost-score-calculator',
    description: 'Get wellness insights about vitamin C intake for antioxidant support.',
  },
  {
    name: 'Daily Antioxidant ORAC Goal Calculator',
    slug: 'carbohydrate-intake-calculator',
    description: 'Track overall antioxidant capacity.',
  },
  {
    name: 'Prebiotic Fiber Target Calculator',
    slug: 'prebiotic-fiber-target-calculator',
    description: 'Include antioxidant-rich fiber sources.',
  },
  {
    name: 'Glycemic Index Meal Optimizer Calculator',
    slug: 'glycemic-index-meal-optimizer-calculator',
    description: 'Optimize meals with antioxidant-rich foods.',
  },
];

const baseUrl = 'https://mycalculating.com/category/health-fitness/antioxidant-diversity-index-calculator';

const schemaMarkup = {
  '@context': 'https://schema.org',
  '@graph': [
    {
      '@type': 'BreadcrumbList',
      itemListElement: [
        { '@type': 'ListItem', position: 1, name: 'Home', item: 'https://mycalculating.com' },
        { '@type': 'ListItem', position: 2, name: 'Health & Fitness', item: 'https://mycalculating.com/category/health-fitness' },
        { '@type': 'ListItem', position: 3, name: 'Antioxidant Diversity Wellness Index', item: baseUrl },
      ],
    },
    {
      '@type': 'SoftwareApplication',
      name: 'Antioxidant Diversity Wellness Index',
      applicationCategory: 'Calculator',
      operatingSystem: 'Web Browser',
      description: 'Get general wellness insights about antioxidant diversity based on intake of various antioxidant-rich foods. This is a personal lifestyle insight, not a medical evaluation.',
      url: baseUrl,
      offers: { '@type': 'Offer', price: '0', priceCurrency: 'USD' },
    },
  ],
};

const calculateResult = (values: FormValues): ResultPayload => {
  const categories = [
    { name: 'Berries', intake: values.berryIntake ?? 0 },
    { name: 'Citrus', intake: values.citrusIntake ?? 0 },
    { name: 'Leafy Greens', intake: values.leafyGreens ?? 0 },
    { name: 'Nuts/Seeds', intake: values.nutsSeeds ?? 0 },
    { name: 'Colorful Vegetables', intake: values.colorfulVegetables ?? 0 },
    { name: 'Tea/Coffee', intake: values.teaCoffee ?? 0 },
    { name: 'Dark Chocolate', intake: values.darkChocolate ?? 0 },
  ];
  
  // Count categories with intake > 0
  const categoriesCovered = categories.filter(c => c.intake > 0).length;
  
  // Calculate average intake across all categories
  const totalIntake = categories.reduce((sum, c) => sum + c.intake, 0);
  const averageIntake = categories.length > 0 ? totalIntake / categories.length : 0;
  
  // Diversity index: balances number of categories and average intake
  // Max score: 7 categories × 10 servings × 2 = 140
  const diversityIndex = Math.min(100, (categoriesCovered / 7) * 50 + (averageIntake / 10) * 50);
  
  // Antioxidant score based on total intake
  const antioxidantScore = Math.min(100, (totalIntake / 35) * 100); // Max ~35 servings/week
  
  let protectionLevel: string;
  let status: ResultPayload['status'] = 'optimal';
  let interpretation = 'This suggests a general lifestyle tendency where your antioxidant diversity may be excellent, supporting wellness.';
  
  if (diversityIndex >= 75 && categoriesCovered >= 5) {
    protectionLevel = 'Excellent';
    status = 'optimal';
    interpretation = 'This suggests a general lifestyle tendency where your antioxidant diversity is excellent. You\'re consuming antioxidants from multiple food categories, which may support wellness.';
  } else if (diversityIndex >= 60 || categoriesCovered >= 4) {
    protectionLevel = 'Good';
    status = 'good';
    interpretation = 'This suggests a general lifestyle tendency where your antioxidant diversity is good. Adding 1-2 more categories may further support wellness.';
  } else if (diversityIndex >= 40 || categoriesCovered >= 3) {
    protectionLevel = 'Moderate';
    status = 'moderate';
    interpretation = 'This suggests a general lifestyle tendency where your antioxidant diversity is moderate. Expanding to more antioxidant categories may support wellness.';
  } else {
    protectionLevel = 'Lower';
    status = 'low';
    interpretation = 'This suggests a general lifestyle tendency where your antioxidant diversity is lower. You may consider incorporating more diverse antioxidant-rich foods from different categories.';
  }
  
  const recommendations = [
    `Your antioxidant diversity index is ${diversityIndex.toFixed(0)}/100. You're consuming from ${categoriesCovered} out of 7 categories. This is a personal insight, not a medical evaluation.`,
    categoriesCovered < 5 
      ? 'You may consider aiming for at least 5 different antioxidant categories weekly for comprehensive wellness support. Add berries, leafy greens, nuts, or colorful vegetables if missing.'
      : 'Excellent diversity! You may consider continuing to maintain variety across antioxidant categories to support long-term wellness.',
    'You may consider including a mix of raw and lightly cooked antioxidant-rich foods. Different preparation methods can preserve different antioxidant compounds.',
    'You may consider aiming for 2-3 servings daily from antioxidant-rich foods. Spreading intake throughout the day may support consistent wellness.',
  ];
  
  if (categoriesCovered < 3) {
    recommendations.push('Your diet may lack antioxidant diversity. You may consider starting by adding one new category per week (e.g., berries, dark leafy greens, nuts) to build variety gradually.');
  }
  
  const plan = [
    { label: 'This Week', detail: `You may consider adding 1-2 new antioxidant categories if you have fewer than 5. Aim for ${Math.max(5, categoriesCovered + 1)} categories total. Include at least one serving daily from antioxidant-rich foods.` },
    { label: 'This Month', detail: 'You may consider building consistency across 5-6 antioxidant categories. Track intake and ensure variety. Experiment with different preparation methods to maximize antioxidant preservation.' },
    { label: 'Ongoing', detail: 'You may consider maintaining diversity across antioxidant categories. Rotate foods within each category to maximize variety. Remember that food synergy (combining different antioxidants) may support wellness compared to isolated sources.' },
  ];
  
  return { diversityIndex, antioxidantScore, categoriesCovered, protectionLevel, status, interpretation, recommendations, plan };
};

export default function AntioxidantDiversityIndexCalculator() {
  const [result, setResult] = useState<ResultPayload | null>(null);

  const form = useForm<FormValues>({
    resolver: zodResolver(formSchema),
    defaultValues: {
      berryIntake: undefined,
      citrusIntake: undefined,
      leafyGreens: undefined,
      nutsSeeds: undefined,
      colorfulVegetables: undefined,
      teaCoffee: undefined,
      darkChocolate: undefined,
    },
  });

  return (
    <div className="space-y-8">
      <Script id="antioxidant-diversity-schema" type="application/ld+json" strategy="afterInteractive" dangerouslySetInnerHTML={{ __html: JSON.stringify(schemaMarkup) }} />

      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <Moon className="h-5 w-5" />
            Antioxidant Diversity Wellness Index
          </CardTitle>
          <CardDescription>Get general wellness insights about antioxidant diversity based on intake of various antioxidant-rich foods. This is a personal lifestyle insight, not a medical evaluation.</CardDescription>
        </CardHeader>
      </Card>

      <Card>
        <CardHeader>
          <CardTitle>Input your antioxidant intake</CardTitle>
        </CardHeader>
        <CardContent>
          <Form {...form}>
            <form onSubmit={form.handleSubmit((values) => setResult(calculateResult(values)))} className="space-y-6">
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <FormField
                  control={form.control}
                  name="berryIntake"
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel>Berries (servings/week, optional)</FormLabel>
                      <FormControl>
                        <Input type="number" step="1" placeholder="e.g., 5" value={field.value ?? ''} onChange={(e) => field.onChange(e.target.value === '' ? undefined : Number(e.target.value))} />
                      </FormControl>
                      <FormMessage />
                    </FormItem>
                  )}
                />
                <FormField
                  control={form.control}
                  name="citrusIntake"
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel>Citrus fruits (servings/week, optional)</FormLabel>
                      <FormControl>
                        <Input type="number" step="1" placeholder="e.g., 3" value={field.value ?? ''} onChange={(e) => field.onChange(e.target.value === '' ? undefined : Number(e.target.value))} />
                      </FormControl>
                      <FormMessage />
                    </FormItem>
                  )}
                />
                <FormField
                  control={form.control}
                  name="leafyGreens"
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel>Leafy greens (servings/week, optional)</FormLabel>
                      <FormControl>
                        <Input type="number" step="1" placeholder="e.g., 7" value={field.value ?? ''} onChange={(e) => field.onChange(e.target.value === '' ? undefined : Number(e.target.value))} />
                      </FormControl>
                      <FormMessage />
                    </FormItem>
                  )}
                />
                <FormField
                  control={form.control}
                  name="nutsSeeds"
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel>Nuts and seeds (servings/week, optional)</FormLabel>
                      <FormControl>
                        <Input type="number" step="1" placeholder="e.g., 4" value={field.value ?? ''} onChange={(e) => field.onChange(e.target.value === '' ? undefined : Number(e.target.value))} />
                      </FormControl>
                      <FormMessage />
                    </FormItem>
                  )}
                />
                <FormField
                  control={form.control}
                  name="colorfulVegetables"
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel>Colorful vegetables (servings/week, optional)</FormLabel>
                      <FormControl>
                        <Input type="number" step="1" placeholder="e.g., 6" value={field.value ?? ''} onChange={(e) => field.onChange(e.target.value === '' ? undefined : Number(e.target.value))} />
                      </FormControl>
                      <FormMessage />
                    </FormItem>
                  )}
                />
                <FormField
                  control={form.control}
                  name="teaCoffee"
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel>Tea or coffee (servings/week, optional)</FormLabel>
                      <FormControl>
                        <Input type="number" step="1" placeholder="e.g., 7" value={field.value ?? ''} onChange={(e) => field.onChange(e.target.value === '' ? undefined : Number(e.target.value))} />
                      </FormControl>
                      <FormMessage />
                    </FormItem>
                  )}
                />
                <FormField
                  control={form.control}
                  name="darkChocolate"
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel>Dark chocolate (servings/week, optional)</FormLabel>
                      <FormControl>
                        <Input type="number" step="0.5" placeholder="e.g., 2" value={field.value ?? ''} onChange={(e) => field.onChange(e.target.value === '' ? undefined : Number(e.target.value))} />
                      </FormControl>
                      <FormMessage />
                    </FormItem>
                  )}
                />
              </div>
              <Button type="submit" className="w-full md:w-auto">
                Calculate diversity index
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
            <CardDescription>See antioxidant diversity index, categories covered, and recommendations.</CardDescription>
          </CardHeader>
          <CardContent className="space-y-6">
            <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
              <div className="p-4 border rounded">
                <p className="text-sm text-muted-foreground">Diversity index</p>
                <p className="text-2xl font-semibold text-primary">{result.diversityIndex.toFixed(0)}/100</p>
                <p className="text-xs text-muted-foreground">Overall score</p>
              </div>
              <div className="p-4 border rounded">
                <p className="text-sm text-muted-foreground">Categories covered</p>
                <p className="text-2xl font-semibold text-primary">{result.categoriesCovered}/7</p>
                <p className="text-xs text-muted-foreground">Different types</p>
              </div>
              <div className="p-4 border rounded">
                <p className="text-sm text-muted-foreground">Protection level</p>
                <p className="text-2xl font-semibold text-primary">{result.protectionLevel}</p>
                <p className="text-xs text-muted-foreground">Antioxidant support</p>
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
            <strong>Diversity Index</strong> = (Categories covered / 7) × 50 + (Average intake / 10) × 50, capped at 100.
          </p>
          <p>
            <strong>Antioxidant Score</strong> = (Total weekly servings / 35) × 100, capped at 100.
          </p>
          <p>
            <strong>Categories Covered</strong> = Count of antioxidant categories with intake &gt; 0 servings/week.
          </p>
          <p>
            <strong>Protection Level</strong>: Excellent (≥75 index, ≥5 categories), Good (≥60 index or ≥4 categories), Moderate (≥40 index or ≥3 categories), Low (&lt;40 index, &lt;3 categories).
          </p>
          <p>Diverse antioxidant intake provides comprehensive protection because different antioxidants protect different cell types and work through different mechanisms. Aim for 5-6 categories weekly for optimal protection.</p>
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
                <p className="text-sm text-muted-foreground">Antioxidant score</p>
                <p className="text-xl font-semibold text-primary">{result.antioxidantScore.toFixed(0)}/100</p>
                <p className="text-xs text-muted-foreground">Based on total intake</p>
              </div>
              <div className="p-4 border rounded">
                <p className="text-sm text-muted-foreground">Target categories</p>
                <p className="text-xl font-semibold text-primary">5-6</p>
                <p className="text-xs text-muted-foreground">Ideal range</p>
              </div>
              <div className="p-4 border rounded">
                <p className="text-sm text-muted-foreground">Improvement needed</p>
                <p className="text-xl font-semibold text-primary">
                  {result.categoriesCovered >= 5 ? 'None' : `${5 - result.categoriesCovered} categories`}
                </p>
                <p className="text-xs text-muted-foreground">To reach target</p>
              </div>
            </div>
          ) : (
            <p className="text-sm text-muted-foreground">Enter your antioxidant intake data to see additional insights.</p>
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
          <p>Antioxidant diversity is crucial for comprehensive protection against oxidative stress. Different antioxidants protect different cell types and work through various mechanisms. Consuming antioxidants from multiple food categories provides superior protection compared to focusing on a single source.</p>
          <p>Use this calculator to assess your antioxidant diversity index based on intake across seven key antioxidant-rich food categories, and receive recommendations for optimizing your antioxidant intake.</p>
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
          <p>This tool provides general wellness insights about antioxidant diversity based on intake of various antioxidant-rich foods. This is a personal lifestyle insight, not a medical evaluation.</p>
          <p>Outputs include diversity index, antioxidant score, categories covered, protection level, status, recommendations, an action plan, and supporting metrics.</p>
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


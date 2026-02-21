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
  restrictiveness: z.number({ invalid_type_error: 'Enter restrictiveness level' }).min(1).max(10),
  variety: z.number({ invalid_type_error: 'Enter variety level' }).min(1).max(10),
  socialFit: z.number({ invalid_type_error: 'Enter social fit level' }).min(1).max(10),
  costAccessibility: z.number({ invalid_type_error: 'Enter cost/accessibility level' }).min(1).max(10),
  flexibility: z.number({ invalid_type_error: 'Enter flexibility level' }).min(1).max(10),
  adherenceMonths: z.number({ invalid_type_error: 'Enter adherence months' }).min(0).max(120),
});

type FormValues = z.infer<typeof formSchema>;

type ResultPayload = {
  restrictiveness: number;
  variety: number;
  socialFit: number;
  costAccessibility: number;
  flexibility: number;
  adherenceMonths: number;
  sustainabilityScore: number;
  sustainabilityPercent: number;
  status: 'optimal' | 'good' | 'moderate' | 'low';
  interpretation: string;
  recommendations: string[];
  plan: { label: string; detail: string }[];
};

const steps = [
  'Rate diet restrictiveness (1=very flexible, 10=very restrictive).',
  'Rate food variety (1=limited, 10=very diverse).',
  'Rate social fit (1=hard to follow socially, 10=easy in social settings).',
  'Rate cost/accessibility (1=expensive/rare, 10=affordable/easy to find).',
  'Rate flexibility (1=rigid rules, 10=adaptable).',
  'Enter months you\'ve maintained this diet (0 if new).',
  'Review sustainability score and recommendations.',
];

const faqs = [
  {
    question: 'What is diet sustainability?',
    answer:
      'Diet sustainability refers to how maintainable and feasible a dietary pattern is over the long term. Sustainable diets are those you can realistically follow for months or years without excessive restriction, social isolation, or financial burden.',
  },
  {
    question: 'Why does sustainability matter?',
    answer:
      'Research shows that most people regain weight after restrictive diets because they\'re not sustainable long-term. A sustainable diet is one you can maintain for life, leading to better health outcomes and lasting results.',
  },
  {
    question: 'What makes a diet unsustainable?',
    answer:
      'Common factors include extreme restriction, elimination of entire food groups, high cost, difficulty finding foods, social isolation, rigid rules, lack of flexibility, and poor variety leading to boredom.',
  },
  {
    question: 'How does restrictiveness affect sustainability?',
    answer:
      'Highly restrictive diets (eliminating many foods) are harder to maintain long-term. Moderate flexibility allows for occasional treats and social eating, making the diet more sustainable while still achieving goals.',
  },
  {
    question: 'What role does variety play?',
    answer:
      'Dietary variety prevents boredom and nutritional deficiencies. Diets with limited food choices become monotonous and are more likely to be abandoned. Variety also ensures better nutrient coverage.',
  },
  {
    question: 'How important is social fit?',
    answer:
      'Diets that isolate you from social eating situations are harder to maintain. Sustainable diets allow participation in social meals, family dinners, and celebrations without feeling excluded or guilty.',
  },
  {
    question: 'What about cost and accessibility?',
    answer:
      'Expensive or hard-to-find foods make diets unsustainable. Sustainable diets use readily available, affordable ingredients that fit your budget and can be found at regular grocery stores.',
  },
  {
    question: 'How does flexibility help?',
    answer:
      'Rigid diets with strict rules are easily broken, leading to guilt and abandonment. Flexible diets that allow for occasional deviations, travel, and special occasions are more maintainable long-term.',
  },
  {
    question: 'Can a restrictive diet be sustainable?',
    answer:
      'Some people can maintain restrictive diets long-term, but they\'re the exception. Most people benefit from moderate restriction with flexibility. Sustainability is highly individual and depends on your lifestyle, preferences, and circumstances.',
  },
  {
    question: 'When should I consult a healthcare provider?',
    answer:
      'Consult a healthcare provider or registered dietitian if you need help designing a sustainable eating plan, have medical conditions requiring specific diets, struggle with disordered eating patterns, or need personalized nutrition guidance.',
  },
];

const relatedCalculators = [
  {
    name: 'Mediterranean Diet Score Calculator',
    slug: 'mediterranean-diet-score-calculator',
    description: 'Assess adherence to a sustainable Mediterranean pattern.',
  },
  {
    name: 'Flexitarian Score Calculator',
    slug: 'flexitarian-score-calculator',
    description: 'Evaluate flexible plant-based eating sustainability.',
  },
  {
    name: 'Nutrient Density to Calorie Ratio Calculator',
    slug: 'nutrient-density-to-calorie-ratio-calculator',
    description: 'Assess nutritional quality of sustainable choices.',
  },
  {
    name: 'Food Diversity Index Calculator',
    slug: 'food-diversity-index-calculator',
    description: 'Evaluate dietary variety for sustainability.',
  },
];

const baseUrl = 'https://mycalculating.com/category/health-fitness/diet-sustainability-score-calculator';

const schemaMarkup = {
  '@context': 'https://schema.org',
  '@graph': [
    {
      '@type': 'BreadcrumbList',
      itemListElement: [
        { '@type': 'ListItem', position: 1, name: 'Home', item: 'https://mycalculating.com' },
        { '@type': 'ListItem', position: 2, name: 'Health & Fitness', item: 'https://mycalculating.com/category/health-fitness' },
        { '@type': 'ListItem', position: 3, name: 'Diet Sustainability Score Calculator', item: baseUrl },
      ],
    },
    {
      '@type': 'SoftwareApplication',
      name: 'Diet Sustainability Score Calculator',
      applicationCategory: 'Calculator',
      operatingSystem: 'Web Browser',
      description: 'Calculate diet sustainability score from restrictiveness, variety, social fit, cost, flexibility, and adherence duration.',
      url: baseUrl,
      offers: { '@type': 'Offer', price: '0', priceCurrency: 'USD' },
    },
  ],
};

const clamp = (value: number, min: number, max: number) => Math.min(max, Math.max(min, value));

const calculateResult = (values: FormValues): ResultPayload => {
  const restrictiveness = values.restrictiveness;
  const variety = values.variety;
  const socialFit = values.socialFit;
  const costAccessibility = values.costAccessibility;
  const flexibility = values.flexibility;
  const adherenceMonths = values.adherenceMonths;
  
  // Calculate sustainability score (0-100)
  // Lower restrictiveness = better (inverted: 10 becomes 1, 1 becomes 10)
  const restrictivenessScore = (11 - restrictiveness) * 8; // Max 80 points
  
  // Higher variety = better
  const varietyScore = variety * 5; // Max 50 points
  
  // Higher social fit = better
  const socialFitScore = socialFit * 4; // Max 40 points
  
  // Higher cost/accessibility = better
  const costScore = costAccessibility * 4; // Max 40 points
  
  // Higher flexibility = better
  const flexibilityScore = flexibility * 5; // Max 50 points
  
  // Adherence bonus: longer adherence = more sustainable (max 30 points)
  const adherenceBonus = Math.min(adherenceMonths * 2, 30);
  
  const sustainabilityScore = clamp(restrictivenessScore + varietyScore + socialFitScore + costScore + flexibilityScore + adherenceBonus, 0, 100);
  const sustainabilityPercent = sustainabilityScore;
  
  let status: ResultPayload['status'] = 'optimal';
  let interpretation = 'Your diet sustainability score is excellent. This dietary pattern appears highly maintainable long-term, supporting lasting health benefits and adherence.';

  if (sustainabilityScore < 40) {
    status = 'low';
    interpretation = 'Your diet sustainability score is low. This dietary pattern may be difficult to maintain long-term due to high restriction, limited variety, poor social fit, or other barriers. Consider modifications to improve sustainability.';
  } else if (sustainabilityScore < 60) {
    status = 'moderate';
    interpretation = 'Your diet sustainability score is moderate. While manageable, there are areas for improvement to enhance long-term adherence. Focus on increasing flexibility, variety, or social fit.';
  } else if (sustainabilityScore < 80) {
    status = 'good';
    interpretation = 'Your diet sustainability score is good. This dietary pattern is reasonably sustainable, with room for minor improvements to optimize long-term adherence and enjoyment.';
  } else {
    status = 'optimal';
    interpretation = 'Your diet sustainability score is excellent. This dietary pattern appears highly maintainable long-term, supporting lasting health benefits and adherence.';
  }

  const recommendations = [
    'Increase dietary flexibility: allow for occasional treats, social meals, and special occasions. Rigid rules are easily broken and lead to diet abandonment.',
    'Enhance food variety: include diverse foods from all food groups to prevent boredom and ensure nutritional adequacy. Variety makes diets more enjoyable and sustainable.',
    'Improve social fit: choose dietary patterns that allow participation in social eating. Diets that isolate you are harder to maintain long-term.',
  ];
  
  if (restrictiveness >= 8) {
    recommendations.push('Reduce restrictiveness: highly restrictive diets are difficult to maintain. Consider moderate flexibility that still achieves your goals while allowing occasional deviations.');
  }
  
  if (variety <= 5) {
    recommendations.push('Increase food variety: limited food choices lead to boredom and nutritional gaps. Expand your food repertoire to include more diverse options while staying within your dietary pattern.');
  }
  
  if (socialFit <= 5) {
    recommendations.push('Improve social compatibility: find ways to adapt your diet for social situations. This might include pre-planning, bringing dishes, or having flexible guidelines for special occasions.');
  }
  
  if (costAccessibility <= 5) {
    recommendations.push('Optimize cost and accessibility: choose foods that fit your budget and are readily available. Sustainable diets use affordable, common ingredients rather than expensive specialty items.');
  }

  const plan = [
    { label: 'This Week', detail: `Assess your current diet's sustainability factors and identify one area for improvement. Make small adjustments to increase flexibility, variety, or social fit.` },
    { label: 'This Month', detail: 'Build sustainable habits: focus on creating a dietary pattern you can maintain long-term. Prioritize enjoyment, flexibility, and realistic expectations over perfection.' },
    { label: 'Ongoing', detail: 'Maintain sustainable eating patterns: remember that the best diet is one you can follow for life. Adjust as needed based on lifestyle changes, preferences, and circumstances.' },
  ];

  return { restrictiveness, variety, socialFit, costAccessibility, flexibility, adherenceMonths, sustainabilityScore, sustainabilityPercent, status, interpretation, recommendations, plan };
};

export default function DietSustainabilityScoreCalculator() {
  const [result, setResult] = useState<ResultPayload | null>(null);

  const form = useForm<FormValues>({
    resolver: zodResolver(formSchema),
    defaultValues: {
      restrictiveness: undefined,
      variety: undefined,
      socialFit: undefined,
      costAccessibility: undefined,
      flexibility: undefined,
      adherenceMonths: undefined,
    },
  });

  return (
    <div className="space-y-8">
      <Script id="diet-sustainability-schema" type="application/ld+json" strategy="afterInteractive" dangerouslySetInnerHTML={{ __html: JSON.stringify(schemaMarkup) }} />

      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <Activity className="h-5 w-5" />
            Diet Sustainability Score Calculator
          </CardTitle>
          <CardDescription>Calculate diet sustainability score from restrictiveness, variety, social fit, cost, flexibility, and adherence duration.</CardDescription>
        </CardHeader>
      </Card>

      <Card>
        <CardHeader>
          <CardTitle>Input your diet sustainability data</CardTitle>
        </CardHeader>
        <CardContent>
          <Form {...form}>
            <form onSubmit={form.handleSubmit((values) => setResult(calculateResult(values)))} className="space-y-6">
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <FormField
                  control={form.control}
                  name="restrictiveness"
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel>Restrictiveness (1-10, 10=very restrictive)</FormLabel>
                      <FormControl>
                        <Input type="number" step="1" placeholder="e.g., 7" value={field.value ?? ''} onChange={(e) => field.onChange(e.target.value === '' ? undefined : Number(e.target.value))} />
                      </FormControl>
                      <FormMessage />
                    </FormItem>
                  )}
                />
                <FormField
                  control={form.control}
                  name="variety"
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel>Food variety (1-10, 10=very diverse)</FormLabel>
                      <FormControl>
                        <Input type="number" step="1" placeholder="e.g., 6" value={field.value ?? ''} onChange={(e) => field.onChange(e.target.value === '' ? undefined : Number(e.target.value))} />
                      </FormControl>
                      <FormMessage />
                    </FormItem>
                  )}
                />
                <FormField
                  control={form.control}
                  name="socialFit"
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel>Social fit (1-10, 10=easy socially)</FormLabel>
                      <FormControl>
                        <Input type="number" step="1" placeholder="e.g., 5" value={field.value ?? ''} onChange={(e) => field.onChange(e.target.value === '' ? undefined : Number(e.target.value))} />
                      </FormControl>
                      <FormMessage />
                    </FormItem>
                  )}
                />
                <FormField
                  control={form.control}
                  name="costAccessibility"
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel>Cost/accessibility (1-10, 10=affordable/easy)</FormLabel>
                      <FormControl>
                        <Input type="number" step="1" placeholder="e.g., 7" value={field.value ?? ''} onChange={(e) => field.onChange(e.target.value === '' ? undefined : Number(e.target.value))} />
                      </FormControl>
                      <FormMessage />
                    </FormItem>
                  )}
                />
                <FormField
                  control={form.control}
                  name="flexibility"
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel>Flexibility (1-10, 10=very flexible)</FormLabel>
                      <FormControl>
                        <Input type="number" step="1" placeholder="e.g., 6" value={field.value ?? ''} onChange={(e) => field.onChange(e.target.value === '' ? undefined : Number(e.target.value))} />
                      </FormControl>
                      <FormMessage />
                    </FormItem>
                  )}
                />
                <FormField
                  control={form.control}
                  name="adherenceMonths"
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel>Months maintained (0 if new)</FormLabel>
                      <FormControl>
                        <Input type="number" step="1" placeholder="e.g., 3" value={field.value ?? ''} onChange={(e) => field.onChange(e.target.value === '' ? undefined : Number(e.target.value))} />
                      </FormControl>
                      <FormMessage />
                    </FormItem>
                  )}
                />
              </div>
              <Button type="submit" className="w-full md:w-auto">
                Calculate sustainability score
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
            <CardDescription>See sustainability score, sustainability percentage, and recommendations.</CardDescription>
          </CardHeader>
          <CardContent className="space-y-6">
            <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
              <div className="p-4 border rounded">
                <p className="text-sm text-muted-foreground">Sustainability score</p>
                <p className="text-2xl font-semibold text-primary">{result.sustainabilityScore.toFixed(0)}</p>
                <p className="text-xs text-muted-foreground">Out of 100</p>
              </div>
              <div className="p-4 border rounded">
                <p className="text-sm text-muted-foreground">Restrictiveness</p>
                <p className="text-2xl font-semibold text-primary">{result.restrictiveness.toFixed(0)}</p>
                <p className="text-xs text-muted-foreground">Lower is better</p>
              </div>
              <div className="p-4 border rounded">
                <p className="text-sm text-muted-foreground">Sustainability %</p>
                <p className="text-2xl font-semibold text-primary">{result.sustainabilityPercent.toFixed(0)}%</p>
                <p className="text-xs text-muted-foreground">Of maximum</p>
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
            <strong>Restrictiveness score</strong> = (11 - Restrictiveness) × 8. Lower restrictiveness scores higher (inverted scale). Maximum 80 points.
          </p>
          <p>
            <strong>Variety score</strong> = Variety × 5. Higher variety scores higher. Maximum 50 points.
          </p>
          <p>
            <strong>Social fit score</strong> = Social Fit × 4. Higher social compatibility scores higher. Maximum 40 points.
          </p>
          <p>
            <strong>Cost/accessibility score</strong> = Cost/Accessibility × 4. Higher affordability scores higher. Maximum 40 points.
          </p>
          <p>
            <strong>Flexibility score</strong> = Flexibility × 5. Higher flexibility scores higher. Maximum 50 points.
          </p>
          <p>
            <strong>Adherence bonus</strong> = Months Maintained × 2 (max 30 points). Longer adherence indicates better sustainability.
          </p>
          <p>
            <strong>Total sustainability score</strong> = Sum of all components, normalized to 0-100. Higher scores indicate more sustainable, maintainable dietary patterns.
          </p>
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
                <p className="text-sm text-muted-foreground">Variety score</p>
                <p className="text-xl font-semibold text-primary">
                  {(result.variety * 5).toFixed(0)}/50
                </p>
                <p className="text-xs text-muted-foreground">Component score</p>
              </div>
              <div className="p-4 border rounded">
                <p className="text-sm text-muted-foreground">Flexibility score</p>
                <p className="text-xl font-semibold text-primary">
                  {(result.flexibility * 5).toFixed(0)}/50
                </p>
                <p className="text-xs text-muted-foreground">Component score</p>
              </div>
              <div className="p-4 border rounded">
                <p className="text-sm text-muted-foreground">Sustainability level</p>
                <p className="text-xl font-semibold text-primary">
                  {result.sustainabilityScore < 40 ? 'Low' : result.sustainabilityScore < 60 ? 'Moderate' : result.sustainabilityScore < 80 ? 'Good' : 'Excellent'}
                </p>
                <p className="text-xs text-muted-foreground">Based on score</p>
              </div>
            </div>
          ) : (
            <p className="text-sm text-muted-foreground">Enter your diet sustainability data to see additional insights.</p>
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

      <section className="space-y-6 text-muted-foreground leading-relaxed bg-white p-6 md:p-10 rounded-lg shadow-lg" itemType="https://schema.org/MedicalWebPage">
    {/* SEO & SCHEMA METADATA (HIGHLY OPTIMIZED) */}
    <meta itemProp="name" content="The Definitive Guide to Diet Sustainability: Building Maintainable Eating Patterns" />
    <meta itemProp="description" content="An expert, evidence-based guide on diet sustainability, detailing factors that affect long-term adherence, strategies to build maintainable eating patterns, and how to create sustainable dietary habits for lasting health benefits." />
    <meta itemProp="keywords" content="diet sustainability calculator, sustainable diet plan, long-term diet adherence, maintainable eating patterns, diet flexibility, dietary variety, sustainable weight loss" />
    <meta itemProp="author" content="[Your Site's Health Team]" />
    <meta itemProp="datePublished" content="2025-12-01" />
    <meta itemProp="url" content="/definitive-diet-sustainability-guide" />

    <h1 className="text-3xl md:text-4xl font-extrabold text-foreground mb-4" itemProp="headline">The Definitive Guide to Diet Sustainability: Building Maintainable Eating Patterns for Long-Term Success</h1>
    <p className="text-lg italic text-gray-700">Explore the science of diet sustainability, factors that affect long-term adherence, and comprehensive strategies to create eating patterns you can maintain for life.</p>


    {/* TABLE OF CONTENTS (INTERNAL LINKS FOR UX AND SEO) */}
    <h2 className="text-2xl font-bold text-foreground mt-8 mb-4">Table of Contents: Jump to a Section</h2>
    <ul className="list-disc ml-6 space-y-2 text-blue-600">
        <li><a href="#what-is-sustainability" className="hover:underline">What is Diet Sustainability and Why It Matters</a></li>
        <li><a href="#factors" className="hover:underline">Key Factors Affecting Diet Sustainability</a></li>
        <li><a href="#restrictiveness" className="hover:underline">The Restrictiveness Paradox</a></li>
        <li><a href="#building" className="hover:underline">Building Sustainable Eating Patterns</a></li>
        <li><a href="#long-term" className="hover:underline">Maintaining Long-Term Adherence</a></li>
    </ul>
<hr />

    {/* WHAT IS SUSTAINABILITY */}
    <h2 id="what-is-sustainability" className="text-2xl font-bold text-foreground pt-8" itemProp="articleSection">What is Diet Sustainability and Why It Matters</h2>
    <p>**Diet sustainability** refers to how maintainable and feasible a dietary pattern is over the long term. A sustainable diet is one you can realistically follow for months, years, or even a lifetime without excessive restriction, social isolation, financial burden, or loss of enjoyment. Unlike short-term "diets," sustainable eating patterns become integrated into your lifestyle.</p>

<h3 className="text-xl font-semibold text-foreground mt-6">The Problem with Unsustainable Diets</h3>
<p>Research consistently shows that most people regain weight after restrictive diets because these patterns aren't sustainable long-term. Studies indicate that:</p>
<ul>
    <li>95% of people who lose weight on restrictive diets regain it within 1-5 years</li>
    <li>Yo-yo dieting (weight cycling) may be more harmful than maintaining a higher stable weight</li>
    <li>Repeated diet failures can damage self-esteem and create negative relationships with food</li>
    <li>Unsustainable diets often lead to binge eating, guilt, and disordered eating patterns</li>
</ul>
<p>The key insight: <b>the best diet is one you can maintain for life</b>, not the one that produces the fastest short-term results.</p>

<h3 className="text-xl font-semibold text-foreground mt-6">Benefits of Sustainable Eating Patterns</h3>
<p>Sustainable diets provide numerous advantages:</p>
<ul>
    <li><b>Lasting results:</b> Weight loss and health improvements that persist long-term</li>
    <li><b>Better mental health:</b> Reduced stress, guilt, and anxiety around food</li>
    <li><b>Improved relationship with food:</b> Food becomes nourishment and enjoyment, not the enemy</li>
    <li><b>Social integration:</b> Ability to participate in social eating without isolation</li>
    <li><b>Financial feasibility:</b> Eating patterns that fit your budget</li>
    <li><b>Nutritional adequacy:</b> Sustainable patterns typically provide better long-term nutrition</li>
</ul>

<hr />

    {/* FACTORS AFFECTING SUSTAINABILITY */}
    <h2 id="factors" className="text-2xl font-bold text-foreground pt-8" itemProp="articleSection">Key Factors Affecting Diet Sustainability</h2>
    <p>Several interconnected factors determine whether a dietary pattern is sustainable. Understanding these helps you evaluate and improve your eating approach.</p>

    <h3 className="text-xl font-semibold text-foreground mt-6">1. Restrictiveness</h3>
    <p><b>Restrictiveness</b> refers to how many foods or food groups are eliminated or severely limited. Highly restrictive diets (eliminating entire food groups, very low calories, extreme macronutrient ratios) are harder to maintain because:</p>
    <ul>
        <li>They require constant willpower and self-denial</li>
        <li>They eliminate foods you enjoy, reducing satisfaction</li>
        <li>They're easily "broken," leading to guilt and abandonment</li>
        <li>They can cause nutritional deficiencies over time</li>
    </ul>
    <p><b>Moderate restriction</b> with flexibility is more sustainable—you can still achieve goals while allowing occasional treats and social eating.</p>

    <h3 className="text-xl font-semibold text-foreground mt-6">2. Dietary Variety</h3>
    <p><b>Variety</b> prevents boredom and ensures nutritional adequacy. Diets with limited food choices become monotonous and are more likely to be abandoned. Benefits of variety include:</p>
    <ul>
        <li>Prevents food boredom and cravings</li>
        <li>Ensures better nutrient coverage</li>
        <li>Allows for cultural and personal food preferences</li>
        <li>Makes meals more enjoyable and satisfying</li>
    </ul>

    <h3 className="text-xl font-semibold text-foreground mt-6">3. Social Fit</h3>
    <p><b>Social fit</b> refers to how well a diet works in social situations. Diets that isolate you from social eating are harder to maintain because:</p>
    <ul>
        <li>Eating is inherently social—many celebrations and connections center around food</li>
        <li>Feeling excluded from social meals creates stress and resentment</li>
        <li>Constantly declining food offers can damage relationships</li>
        <li>Social support is crucial for long-term success</li>
    </ul>
    <p>Sustainable diets allow participation in social meals, family dinners, and celebrations with reasonable flexibility.</p>

    <h3 className="text-xl font-semibold text-foreground mt-6">4. Cost and Accessibility</h3>
    <p><b>Cost and accessibility</b> determine whether you can realistically maintain a diet long-term. Expensive or hard-to-find foods create barriers:</p>
    <ul>
        <li>High cost makes diets financially unsustainable</li>
        <li>Rare ingredients require special shopping trips</li>
        <li>Limited availability makes travel and dining out difficult</li>
        <li>Budget constraints can force abandonment</li>
    </ul>
    <p>Sustainable diets use readily available, affordable ingredients that fit your budget and can be found at regular grocery stores.</p>

    <h3 className="text-xl font-semibold text-foreground mt-6">5. Flexibility</h3>
    <p><b>Flexibility</b> refers to how adaptable a diet is to different situations. Rigid diets with strict rules are easily broken, leading to guilt and abandonment. Flexible diets:</p>
    <ul>
        <li>Allow for occasional deviations without guilt</li>
        <li>Adapt to travel, holidays, and special occasions</li>
        <li>Provide guidelines rather than absolute rules</li>
        <li>Allow for individual preferences and circumstances</li>
    </ul>

<hr />

    {/* RESTRICTIVENESS PARADOX */}
    <h2 id="restrictiveness" className="text-2xl font-bold text-foreground pt-8" itemProp="articleSection">The Restrictiveness Paradox</h2>
    <p>There's a paradox in dieting: <b>more restrictive diets often produce faster short-term results, but less restrictive diets produce better long-term results</b>. Understanding this helps you make sustainable choices.</p>

    <h3 className="text-xl font-semibold text-foreground mt-6">Why Restrictive Diets Fail Long-Term</h3>
    <p>Highly restrictive diets create several problems:</p>
    <ul>
        <li><b>Metabolic adaptation:</b> Extreme restriction slows metabolism, making maintenance harder</li>
        <li><b>Psychological rebellion:</b> Constant restriction leads to cravings and eventual bingeing</li>
        <li><b>Social isolation:</b> Inability to participate in social eating creates stress</li>
        <li><b>Nutritional deficiencies:</b> Eliminating food groups can cause health problems</li>
        <li><b>Loss of food skills:</b> Over-reliance on meal plans prevents learning intuitive eating</li>
    </ul>

    <h3 className="text-xl font-semibold text-foreground mt-6">The Moderate Restriction Approach</h3>
    <p>Moderate restriction with flexibility is more sustainable:</p>
    <ul>
        <li>Creates a manageable calorie deficit without extreme hunger</li>
        <li>Allows for occasional treats, preventing deprivation</li>
        <li>Maintains social eating participation</li>
        <li>Preserves metabolic function</li>
        <li>Builds sustainable habits rather than temporary restrictions</li>
    </ul>
    <p>Think of it as <b>80/20 or 90/10</b>—most of the time you follow your plan, but there's room for flexibility.</p>

<hr />

    {/* BUILDING SUSTAINABLE PATTERNS */}
    <h2 id="building" className="text-2xl font-bold text-foreground pt-8" itemProp="articleSection">Building Sustainable Eating Patterns</h2>
    <p>Creating a sustainable diet requires a shift from short-term thinking to long-term lifestyle design. Here's how to build maintainable eating patterns:</p>

    <h3 className="text-xl font-semibold text-foreground mt-6">1. Start with Your Preferences</h3>
    <p>Build your eating pattern around foods you actually enjoy. Sustainable diets include foods you like, prepared in ways you find satisfying. Don't force yourself to eat foods you hate—you won't maintain it.</p>

    <h3 className="text-xl font-semibold text-foreground mt-6">2. Focus on Addition, Not Just Subtraction</h3>
    <p>Instead of only thinking about what to eliminate, focus on what to add:</p>
    <ul>
        <li>Add more vegetables to meals</li>
        <li>Add protein to increase satiety</li>
        <li>Add whole grains for fiber and nutrients</li>
        <li>Add healthy fats for satisfaction</li>
    </ul>
    <p>This positive framing makes changes feel like improvements rather than restrictions.</p>

    <h3 className="text-xl font-semibold text-foreground mt-6">3. Create Flexible Guidelines</h3>
    <p>Instead of rigid rules, create flexible guidelines:</p>
    <ul>
        <li><b>Instead of:</b> "Never eat carbs after 6pm"</li>
        <li><b>Try:</b> "Most meals include vegetables and protein"</li>
        <li><b>Instead of:</b> "No sugar ever"</li>
        <li><b>Try:</b> "Limit added sugars, but allow occasional treats"</li>
    </ul>
    <p>Flexible guidelines adapt to different situations without creating guilt when "broken."</p>

    <h3 className="text-xl font-semibold text-foreground mt-6">4. Plan for Social Situations</h3>
    <p>Anticipate and plan for social eating:</p>
    <ul>
        <li>Eat a healthy meal before parties if options are limited</li>
        <li>Bring a dish you can enjoy to potlucks</li>
        <li>Have flexible guidelines for special occasions</li>
        <li>Focus on social connection, not perfect eating</li>
    </ul>

    <h3 className="text-xl font-semibold text-foreground mt-6">5. Make It Affordable</h3>
    <p>Choose foods that fit your budget:</p>
    <ul>
        <li>Buy seasonal produce</li>
        <li>Use frozen vegetables and fruits</li>
        <li>Choose affordable protein sources (eggs, legumes, chicken)</li>
        <li>Cook at home more often</li>
        <li>Avoid expensive specialty items unless they're truly necessary</li>
    </ul>

<hr />

    {/* LONG-TERM MAINTENANCE */}
    <h2 id="long-term" className="text-2xl font-bold text-foreground pt-8" itemProp="articleSection">Maintaining Long-Term Adherence</h2>
    <p>Sustainability isn't just about starting—it's about maintaining. Here are strategies for long-term success:</p>

    <h3 className="text-xl font-semibold text-foreground mt-6">1. Expect and Plan for Setbacks</h3>
    <p>Setbacks are normal and expected. Plan for them:</p>
    <ul>
        <li>Don't let one "bad" meal or day derail everything</li>
        <li>Get back on track at the next meal, not "tomorrow" or "Monday"</li>
        <li>View setbacks as learning opportunities, not failures</li>
        <li>Have strategies ready for challenging situations</li>
    </ul>

    <h3 className="text-xl font-semibold text-foreground mt-6">2. Adjust as Needed</h3>
    <p>Your needs and circumstances change. Adjust your eating pattern accordingly:</p>
    <ul>
        <li>Modify for different life stages (pregnancy, aging, activity changes)</li>
        <li>Adapt for travel, holidays, and special occasions</li>
        <li>Adjust based on what you learn about your body and preferences</li>
        <li>Don't be afraid to try new approaches if current ones aren't working</li>
    </ul>

    <h3 className="text-xl font-semibold text-foreground mt-6">3. Focus on Progress, Not Perfection</h3>
    <p>Perfectionism is the enemy of sustainability:</p>
    <ul>
        <li>Aim for 80% adherence, not 100%</li>
        <li>Celebrate small wins and progress</li>
        <li>Don't let perfect be the enemy of good</li>
        <li>Remember that consistency over time matters more than perfection in any moment</li>
    </ul>

    <h3 className="text-xl font-semibold text-foreground mt-6">4. Build Food Skills</h3>
    <p>Develop skills that support sustainable eating:</p>
    <ul>
        <li>Learn to cook simple, healthy meals</li>
        <li>Develop meal planning and prep skills</li>
        <li>Learn to read nutrition labels</li>
        <li>Practice intuitive eating and hunger awareness</li>
        <li>Build a repertoire of go-to healthy meals</li>
    </ul>

<hr />

    {/* CONCLUSION */}
    <h2 className="text-2xl font-bold text-foreground pt-8" itemProp="articleSection">Conclusion</h2>
    <p>Diet sustainability is the foundation of long-term health and weight management success. By focusing on maintainable eating patterns rather than short-term restrictions, you create a lifestyle that supports lasting results. Remember: the best diet is one you can follow for life. Prioritize flexibility, variety, social fit, affordability, and enjoyment. Build eating patterns around your preferences, circumstances, and goals. Expect setbacks and adjust as needed. Most importantly, be patient and kind to yourself—sustainable change takes time, but it's the only change that lasts.</p>
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
          <p>This tool calculates diet sustainability score from restrictiveness, variety, social fit, cost, flexibility, and adherence duration.</p>
          <p>Outputs include restrictiveness, variety, social fit, cost/accessibility, flexibility, adherence months, sustainability score, sustainability percentage, status, recommendations, an action plan, and supporting metrics.</p>
          <p>Formula, steps, guide content, related tools, and FAQs ensure humans or AI assistants can interpret the methodology instantly.</p>
        </CardContent>
      </Card>
    </div>
  );
}


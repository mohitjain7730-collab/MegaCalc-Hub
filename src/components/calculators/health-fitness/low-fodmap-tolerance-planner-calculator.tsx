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
  fructoseServings: z.number({ invalid_type_error: 'Enter fructose servings' }).min(0).max(10),
  lactoseServings: z.number({ invalid_type_error: 'Enter lactose servings' }).min(0).max(10),
  fructansServings: z.number({ invalid_type_error: 'Enter fructans servings' }).min(0).max(10),
  galactansServings: z.number({ invalid_type_error: 'Enter galactans servings' }).min(0).max(10),
  polyolsServings: z.number({ invalid_type_error: 'Enter polyols servings' }).min(0).max(10),
  symptoms: z.number({ invalid_type_error: 'Enter symptoms level' }).min(0).max(10),
});

type FormValues = z.infer<typeof formSchema>;

type ResultPayload = {
  fructoseServings: number;
  lactoseServings: number;
  fructansServings: number;
  galactansServings: number;
  polyolsServings: number;
  symptoms: number;
  toleranceScore: number;
  totalFODMAPLoad: number;
  status: 'optimal' | 'good' | 'moderate' | 'low';
  interpretation: string;
  recommendations: string[];
  plan: { label: string; detail: string }[];
};

const steps = [
  'Enter servings of high-fructose foods from food tracking or estimate.',
  'Enter servings of lactose-containing foods from food tracking or estimate.',
  'Enter servings of fructan-containing foods from food tracking or estimate.',
  'Enter servings of galactan-containing foods from food tracking or estimate.',
  'Enter servings of polyol-containing foods from food tracking or estimate.',
  'Enter current symptoms level (0-10, where 0 is no symptoms and 10 is severe symptoms).',
  'Review low-FODMAP tolerance score and recommendations.',
];

const faqs = [
  {
    question: 'What is the low-FODMAP diet?',
    answer:
      'The low-FODMAP diet is a therapeutic approach for managing irritable bowel syndrome (IBS) and other digestive disorders. FODMAPs are fermentable carbohydrates (fructose, lactose, fructans, galactans, polyols) that can cause digestive symptoms in sensitive individuals.',
  },
  {
    question: 'What are FODMAPs?',
    answer:
      'FODMAPs are fermentable oligosaccharides, disaccharides, monosaccharides, and polyols. They include fructose (excess), lactose, fructans (wheat, onions, garlic), galactans (legumes), and polyols (sweeteners, some fruits).',
  },
  {
    question: 'How is low-FODMAP tolerance calculated?',
    answer:
      'Low-FODMAP tolerance is calculated based on consumption of high-FODMAP foods across different FODMAP categories and current symptom levels. Lower FODMAP intake and fewer symptoms result in higher tolerance scores.',
  },
  {
    question: 'What foods are high in FODMAPs?',
    answer:
      'High-FODMAP foods include: excess fructose (apples, mangoes, honey), lactose (dairy), fructans (wheat, onions, garlic), galactans (legumes), and polyols (stone fruits, sugar alcohols). Many foods contain multiple FODMAP types.',
  },
  {
    question: 'What foods are low in FODMAPs?',
    answer:
      'Low-FODMAP foods include: most meats, fish, eggs, rice, quinoa, oats, many vegetables (carrots, spinach, zucchini), many fruits (bananas, blueberries, oranges), lactose-free dairy, and small portions of nuts.',
  },
  {
    question: 'How long should I follow a low-FODMAP diet?',
    answer:
      'The low-FODMAP diet is typically followed in phases: elimination (2-6 weeks), reintroduction (systematic testing of FODMAP groups), and personalization (long-term diet based on individual tolerance). It should be done under guidance.',
  },
  {
    question: 'What about fiber on low-FODMAP?',
    answer:
      'Fiber intake can be maintained on low-FODMAP by choosing low-FODMAP sources like oats, rice, quinoa, carrots, spinach, and small portions of nuts. Some high-fiber foods are high in FODMAPs and should be limited during elimination.',
  },
  {
    question: 'Can I reintroduce FODMAPs?',
    answer:
      'Yes. After the elimination phase, FODMAPs are systematically reintroduced one group at a time to identify individual tolerance levels. This allows for a more varied diet while managing symptoms.',
  },
  {
    question: 'How can I improve low-FODMAP tolerance?',
    answer:
      'Improve tolerance by following the elimination phase strictly, then systematically reintroducing FODMAPs to identify personal tolerance levels. Work with a dietitian to ensure nutritional adequacy while managing symptoms.',
  },
  {
    question: 'When should I consult a healthcare provider?',
    answer:
      'Consult a healthcare provider or registered dietitian before starting the low-FODMAP diet, if you have digestive symptoms, need help with the elimination and reintroduction phases, or want to ensure nutritional adequacy.',
  },
];

const relatedCalculators = [
  {
    name: 'Gluten-Free Fiber Replacement Planner',
    slug: 'gluten-free-fiber-replacement-planner',
    description: 'Plan fiber intake on restricted diets.',
  },
  {
    name: 'Daily Micronutrient Coverage Calculator',
    slug: 'daily-micronutrient-coverage-calculator',
    description: 'Assess micronutrient coverage comprehensively.',
  },
  {
    name: 'Nutrient Density to Calorie Ratio Calculator',
    slug: 'nutrient-density-to-calorie-ratio-calculator',
    description: 'Assess nutritional quality comprehensively.',
  },
  {
    name: 'Satiety vs Energy Density Graph Calculator',
    slug: 'satiety-vs-energy-density-graph-calculator',
    description: 'Evaluate satiety and energy density.',
  },
];

const baseUrl = 'https://mycalculating.com/category/health-fitness/low-fodmap-tolerance-planner-calculator';

const schemaMarkup = {
  '@context': 'https://schema.org',
  '@graph': [
    {
      '@type': 'BreadcrumbList',
      itemListElement: [
        { '@type': 'ListItem', position: 1, name: 'Home', item: 'https://mycalculating.com' },
        { '@type': 'ListItem', position: 2, name: 'Health & Fitness', item: 'https://mycalculating.com/category/health-fitness' },
        { '@type': 'ListItem', position: 3, name: 'Low-FODMAP Tolerance Planner Calculator', item: baseUrl },
      ],
    },
    {
      '@type': 'SoftwareApplication',
      name: 'Low-FODMAP Tolerance Planner Calculator',
      applicationCategory: 'Calculator',
      operatingSystem: 'Web Browser',
      description: 'Calculate low-FODMAP tolerance from FODMAP category servings and symptoms level.',
      url: baseUrl,
      offers: { '@type': 'Offer', price: '0', priceCurrency: 'USD' },
    },
  ],
};

const clamp = (value: number, min: number, max: number) => Math.min(max, Math.max(min, value));

const calculateResult = (values: FormValues): ResultPayload => {
  const fructoseServings = values.fructoseServings;
  const lactoseServings = values.lactoseServings;
  const fructansServings = values.fructansServings;
  const galactansServings = values.galactansServings;
  const polyolsServings = values.polyolsServings;
  const symptoms = values.symptoms;
  
  // Calculate total FODMAP load
  const totalFODMAPLoad = fructoseServings + lactoseServings + fructansServings + galactansServings + polyolsServings;
  
  // Calculate tolerance score (0-100, higher = better tolerance)
  let toleranceScore = 100;
  
  // Deduct points for FODMAP intake (each serving reduces score)
  toleranceScore -= fructoseServings * 8;
  toleranceScore -= lactoseServings * 8;
  toleranceScore -= fructansServings * 10;
  toleranceScore -= galactansServings * 10;
  toleranceScore -= polyolsServings * 8;
  
  // Deduct points for symptoms (symptoms indicate poor tolerance)
  toleranceScore -= symptoms * 5;
  
  toleranceScore = clamp(toleranceScore, 0, 100);
  
  let status: ResultPayload['status'] = 'optimal';
  let interpretation = 'Your low-FODMAP tolerance is excellent. You are consuming low amounts of FODMAPs with minimal symptoms, indicating good tolerance and effective symptom management.';

  if (toleranceScore < 40 || totalFODMAPLoad > 5 || symptoms > 6) {
    status = 'low';
    interpretation = 'Your low-FODMAP tolerance is low. High FODMAP intake and/or significant symptoms suggest the need for stricter FODMAP restriction. Consider following the elimination phase more closely and working with a dietitian.';
  } else if (toleranceScore < 60 || totalFODMAPLoad > 3 || symptoms > 4) {
    status = 'moderate';
    interpretation = 'Your low-FODMAP tolerance is moderate. Reduce high-FODMAP foods and monitor symptoms. Consider following low-FODMAP guidelines more closely to improve tolerance and symptom management.';
  } else if (toleranceScore < 80) {
    status = 'good';
    interpretation = 'Your low-FODMAP tolerance is good. Continue monitoring FODMAP intake and symptoms. You may be able to gradually reintroduce some FODMAPs to identify personal tolerance levels.';
  }

  const recommendations: string[] = [];
  
  // Fructose recommendations
  if (fructoseServings > 2) {
    recommendations.push(`Reduce fructose intake: current intake (${fructoseServings} servings/day) is high and may cause symptoms. Limit excess fructose from apples, mangoes, honey, and high-fructose fruits. Choose low-FODMAP fruits like bananas, blueberries, and oranges instead.`);
  } else if (fructoseServings > 1) {
    recommendations.push(`Monitor fructose intake: current intake (${fructoseServings} servings/day) is moderate. Be mindful of portion sizes and choose low-FODMAP fruits when possible.`);
  } else {
    recommendations.push(`Fructose intake is low (${fructoseServings} servings/day), which is good for FODMAP tolerance. Continue choosing low-FODMAP fruits.`);
  }
  
  // Lactose recommendations
  if (lactoseServings > 1) {
    recommendations.push(`Reduce lactose intake: current intake (${lactoseServings} servings/day) is high and may cause symptoms. Choose lactose-free dairy alternatives or limit dairy consumption.`);
  } else if (lactoseServings > 0.5) {
    recommendations.push(`Monitor lactose intake: current intake (${lactoseServings} servings/day) is moderate. Consider lactose-free alternatives if symptoms occur.`);
  } else {
    recommendations.push(`Lactose intake is low (${lactoseServings} servings/day), which is good for FODMAP tolerance. Continue with lactose-free dairy or minimal lactose intake.`);
  }
  
  // Fructans recommendations
  if (fructansServings > 2) {
    recommendations.push(`Reduce fructans intake: current intake (${fructansServings} servings/day) is high and may cause symptoms. Limit wheat, onions, garlic, and other high-fructan foods. Choose gluten-free grains like rice, quinoa, and oats instead.`);
  } else if (fructansServings > 1) {
    recommendations.push(`Monitor fructans intake: current intake (${fructansServings} servings/day) is moderate. Be mindful of portion sizes and choose low-FODMAP alternatives when possible.`);
  } else {
    recommendations.push(`Fructans intake is low (${fructansServings} servings/day), which is good for FODMAP tolerance. Continue choosing low-FODMAP grains and vegetables.`);
  }
  
  // Galactans recommendations
  if (galactansServings > 1) {
    recommendations.push(`Reduce galactans intake: current intake (${galactansServings} servings/day) is high and may cause symptoms. Limit legumes and choose low-FODMAP protein sources like meat, fish, eggs, and tofu.`);
  } else if (galactansServings > 0.5) {
    recommendations.push(`Monitor galactans intake: current intake (${galactansServings} servings/day) is moderate. Be mindful of portion sizes and consider low-FODMAP protein alternatives.`);
  } else {
    recommendations.push(`Galactans intake is low (${galactansServings} servings/day), which is good for FODMAP tolerance. Continue choosing low-FODMAP protein sources.`);
  }
  
  // Polyols recommendations
  if (polyolsServings > 1) {
    recommendations.push(`Reduce polyols intake: current intake (${polyolsServings} servings/day) is high and may cause symptoms. Limit stone fruits, sugar alcohols, and other high-polyol foods.`);
  } else if (polyolsServings > 0.5) {
    recommendations.push(`Monitor polyols intake: current intake (${polyolsServings} servings/day) is moderate. Be mindful of portion sizes and choose low-FODMAP alternatives.`);
  } else {
    recommendations.push(`Polyols intake is low (${polyolsServings} servings/day), which is good for FODMAP tolerance. Continue avoiding high-polyol foods.`);
  }
  
  // Symptoms recommendations
  if (symptoms > 7) {
    recommendations.push(`Manage symptoms urgently: current symptom level (${symptoms}/10) is very high. Consider a strict low-FODMAP elimination phase (2-6 weeks), smaller meals, and working with a healthcare provider to address digestive symptoms.`);
  } else if (symptoms > 5) {
    recommendations.push(`Manage symptoms: current symptom level (${symptoms}/10) is high. Consider stricter FODMAP restriction, smaller meals, and working with a healthcare provider to address digestive symptoms.`);
  } else if (symptoms > 3) {
    recommendations.push(`Monitor symptoms: current symptom level (${symptoms}/10) is moderate. Continue tracking FODMAP intake and symptoms to identify patterns.`);
  } else {
    recommendations.push(`Symptoms are low (${symptoms}/10), which indicates good FODMAP tolerance. Continue monitoring and consider gradual reintroduction of FODMAPs to identify personal tolerance levels.`);
  }
  
  // General recommendations
  recommendations.push('Choose low-FODMAP alternatives: select low-FODMAP fruits (bananas, blueberries, oranges), lactose-free dairy, gluten-free grains (rice, quinoa, oats), and FODMAP-friendly vegetables (carrots, spinach, zucchini).');
  recommendations.push('Monitor portion sizes: even low-FODMAP foods can cause symptoms in large amounts. Follow recommended serving sizes and spread FODMAP intake throughout the day.');
  recommendations.push('Keep a food and symptom diary: track FODMAP intake and symptoms to identify patterns and personal triggers.');
  recommendations.push('Work with a dietitian: the low-FODMAP diet should be done under professional guidance to ensure nutritional adequacy and proper reintroduction.');
  
  if (status === 'low' || status === 'moderate') {
    recommendations.push('Consider the elimination phase: if symptoms are significant, follow a strict low-FODMAP elimination phase (2-6 weeks) before reintroducing foods.');
  }

  const plan = [
    { label: 'This Week', detail: `Calculate low-FODMAP tolerance (${toleranceScore}/100) and assess FODMAP intake. Focus on reducing high-FODMAP foods and monitoring symptoms.` },
    { label: 'This Month', detail: 'Improve low-FODMAP tolerance: follow elimination phase if needed, reduce high-FODMAP foods, choose low-FODMAP alternatives, and monitor symptoms. Work with a dietitian for guidance.' },
    { label: 'Ongoing', detail: 'Maintain low-FODMAP tolerance: continue monitoring FODMAP intake and symptoms. After elimination, systematically reintroduce FODMAPs to identify personal tolerance levels for long-term management.' },
  ];

  return { fructoseServings, lactoseServings, fructansServings, galactansServings, polyolsServings, symptoms, toleranceScore, totalFODMAPLoad, status, interpretation, recommendations, plan };
};

export default function LowFodmapTolerancePlannerCalculator() {
  const [result, setResult] = useState<ResultPayload | null>(null);

  const form = useForm<FormValues>({
    resolver: zodResolver(formSchema),
    defaultValues: {
      fructoseServings: undefined,
      lactoseServings: undefined,
      fructansServings: undefined,
      galactansServings: undefined,
      polyolsServings: undefined,
      symptoms: undefined,
    },
  });

  return (
    <div className="space-y-8">
      <Script id="low-fodmap-tolerance-planner-schema" type="application/ld+json" strategy="afterInteractive" dangerouslySetInnerHTML={{ __html: JSON.stringify(schemaMarkup) }} />

      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <Activity className="h-5 w-5" />
            Low-FODMAP Tolerance Planner Calculator
          </CardTitle>
          <CardDescription>Calculate low-FODMAP tolerance from FODMAP category servings and symptoms level.</CardDescription>
        </CardHeader>
      </Card>

      <Card>
        <CardHeader>
          <CardTitle>Input your low-FODMAP data</CardTitle>
        </CardHeader>
        <CardContent>
          <Form {...form}>
            <form onSubmit={form.handleSubmit((values) => setResult(calculateResult(values)))} className="space-y-6">
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <FormField
                  control={form.control}
                  name="fructoseServings"
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel>Fructose servings (high-FODMAP)</FormLabel>
                      <FormControl>
                        <Input type="number" step="0.1" placeholder="e.g., 1" value={field.value ?? ''} onChange={(e) => field.onChange(e.target.value === '' ? undefined : Number(e.target.value))} />
                      </FormControl>
                      <FormMessage />
                    </FormItem>
                  )}
                />
                <FormField
                  control={form.control}
                  name="lactoseServings"
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel>Lactose servings (high-FODMAP)</FormLabel>
                      <FormControl>
                        <Input type="number" step="0.1" placeholder="e.g., 1" value={field.value ?? ''} onChange={(e) => field.onChange(e.target.value === '' ? undefined : Number(e.target.value))} />
                      </FormControl>
                      <FormMessage />
                    </FormItem>
                  )}
                />
                <FormField
                  control={form.control}
                  name="fructansServings"
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel>Fructans servings (high-FODMAP)</FormLabel>
                      <FormControl>
                        <Input type="number" step="0.1" placeholder="e.g., 1" value={field.value ?? ''} onChange={(e) => field.onChange(e.target.value === '' ? undefined : Number(e.target.value))} />
                      </FormControl>
                      <FormMessage />
                    </FormItem>
                  )}
                />
                <FormField
                  control={form.control}
                  name="galactansServings"
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel>Galactans servings (high-FODMAP)</FormLabel>
                      <FormControl>
                        <Input type="number" step="0.1" placeholder="e.g., 0.5" value={field.value ?? ''} onChange={(e) => field.onChange(e.target.value === '' ? undefined : Number(e.target.value))} />
                      </FormControl>
                      <FormMessage />
                    </FormItem>
                  )}
                />
                <FormField
                  control={form.control}
                  name="polyolsServings"
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel>Polyols servings (high-FODMAP)</FormLabel>
                      <FormControl>
                        <Input type="number" step="0.1" placeholder="e.g., 0.5" value={field.value ?? ''} onChange={(e) => field.onChange(e.target.value === '' ? undefined : Number(e.target.value))} />
                      </FormControl>
                      <FormMessage />
                    </FormItem>
                  )}
                />
                <FormField
                  control={form.control}
                  name="symptoms"
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel>Symptoms level (0-10)</FormLabel>
                      <FormControl>
                        <Input type="number" step="0.1" placeholder="e.g., 2" value={field.value ?? ''} onChange={(e) => field.onChange(e.target.value === '' ? undefined : Number(e.target.value))} />
                      </FormControl>
                      <FormMessage />
                    </FormItem>
                  )}
                />
              </div>
              <Button type="submit" className="w-full md:w-auto">
                Calculate low-FODMAP tolerance
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
            <CardDescription>See low-FODMAP tolerance score and recommendations.</CardDescription>
          </CardHeader>
          <CardContent className="space-y-6">
            <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
              <div className="p-4 border rounded">
                <p className="text-sm text-muted-foreground">Tolerance score</p>
                <p className="text-2xl font-semibold text-primary">{result.toleranceScore.toFixed(0)}</p>
                <p className="text-xs text-muted-foreground">Out of 100</p>
              </div>
              <div className="p-4 border rounded">
                <p className="text-sm text-muted-foreground">Total FODMAP load</p>
                <p className="text-2xl font-semibold text-primary">{result.totalFODMAPLoad.toFixed(1)}</p>
                <p className="text-xs text-muted-foreground">Servings</p>
              </div>
              <div className="p-4 border rounded">
                <p className="text-sm text-muted-foreground">Symptoms level</p>
                <p className="text-2xl font-semibold text-primary">{result.symptoms.toFixed(1)}</p>
                <p className="text-xs text-muted-foreground">Out of 10</p>
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
            <strong>Low-FODMAP tolerance score</strong> = 100 minus deductions for FODMAP intake (fructose: 8 points per serving, lactose: 8 points, fructans: 10 points, galactans: 10 points, polyols: 8 points) and symptoms (5 points per symptom level). Higher scores indicate better tolerance.
          </p>
          <p>
            <strong>Total FODMAP load</strong> = sum of servings from all FODMAP categories (fructose + lactose + fructans + galactans + polyols). Lower FODMAP load generally correlates with better tolerance and fewer symptoms.
          </p>
          <p>
            <strong>FODMAP categories:</strong> Fructose (excess): apples, mangoes, honey. Lactose: dairy products. Fructans: wheat, onions, garlic. Galactans: legumes. Polyols: stone fruits, sugar alcohols. Many foods contain multiple FODMAP types.
          </p>
          <p>The low-FODMAP diet is a therapeutic approach for managing IBS and digestive symptoms. Lower FODMAP intake and fewer symptoms indicate better tolerance. The diet should be done under professional guidance with proper elimination and reintroduction phases.</p>
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
                <p className="text-sm text-muted-foreground">Target tolerance</p>
                <p className="text-xl font-semibold text-primary">&gt; 80</p>
                <p className="text-xs text-muted-foreground">Optimal range</p>
              </div>
              <div className="p-4 border rounded">
                <p className="text-sm text-muted-foreground">Target FODMAP load</p>
                <p className="text-xl font-semibold text-primary">&lt; 2</p>
                <p className="text-xs text-muted-foreground">Servings (elimination)</p>
              </div>
              <div className="p-4 border rounded">
                <p className="text-sm text-muted-foreground">Tolerance level</p>
                <p className="text-xl font-semibold text-primary">
                  {result.toleranceScore >= 80 ? 'Excellent' : result.toleranceScore >= 60 ? 'Good' : result.toleranceScore >= 40 ? 'Moderate' : 'Needs improvement'}
                </p>
                <p className="text-xs text-muted-foreground">Based on score</p>
              </div>
            </div>
          ) : (
            <p className="text-sm text-muted-foreground">Enter your low-FODMAP data to see additional insights.</p>
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
          <p>The low-FODMAP diet is a therapeutic approach for managing irritable bowel syndrome (IBS) and other digestive disorders. FODMAPs are fermentable carbohydrates (fructose, lactose, fructans, galactans, polyols) that can cause digestive symptoms in sensitive individuals.</p>
          <p>Use this calculator to calculate low-FODMAP tolerance from FODMAP category servings and symptoms level.</p>
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
          <p>This tool calculates low-FODMAP tolerance from FODMAP category servings and symptoms level.</p>
          <p>Outputs include fructose servings, lactose servings, fructans servings, galactans servings, polyols servings, symptoms level, tolerance score, total FODMAP load, status, recommendations, an action plan, and supporting metrics.</p>
          <p>Formula, steps, guide content, related tools, and FAQs ensure humans or AI assistants can interpret the methodology instantly.</p>
        </CardContent>
      </Card>
    </div>
  );
}


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
  totalCarbs: z.number({ invalid_type_error: 'Enter total carbs' }).min(0).max(500),
  fiber: z.number({ invalid_type_error: 'Enter fiber' }).min(0).max(100),
  sugarAlcohols: z.number({ invalid_type_error: 'Enter sugar alcohols' }).min(0).max(100).optional(),
});

type FormValues = z.infer<typeof formSchema>;

type ResultPayload = {
  totalCarbs: number;
  fiber: number;
  sugarAlcohols: number;
  netCarbs: number;
  netCarbsPercent: number;
  status: 'optimal' | 'good' | 'moderate' | 'low';
  interpretation: string;
  recommendations: string[];
  plan: { label: string; detail: string }[];
};

const steps = [
  'Enter total carbohydrates (grams) from food label or tracking.',
  'Enter dietary fiber (grams) from food label or tracking.',
  'Optionally enter sugar alcohols (grams) if present in the food.',
  'Review net carbs, net carbs percentage, and recommendations for blood sugar control.',
];

const faqs = [
  {
    question: 'What are net carbs?',
    answer:
      'Net carbs = total carbohydrates - dietary fiber - sugar alcohols (if applicable). Net carbs represent the carbohydrates that significantly impact blood sugar, as fiber and sugar alcohols have minimal blood sugar effects.',
  },
  {
    question: 'How are net carbs calculated?',
    answer:
      'Net carbs = total carbohydrates - dietary fiber - sugar alcohols. Some calculations use 50% of sugar alcohols. Fiber is fully subtracted as it doesn\'t raise blood sugar. Sugar alcohols have variable effects.',
  },
  {
    question: 'Why calculate net carbs?',
    answer:
      'Net carbs provide a better measure of blood sugar impact than total carbs. Foods with high fiber or sugar alcohols may have lower net carbs, making them more suitable for blood sugar management.',
  },
  {
    question: 'What about sugar alcohols?',
    answer:
      'Sugar alcohols (erythritol, xylitol, sorbitol, etc.) have variable effects on blood sugar. Some are fully subtracted, others are partially counted. Check specific sugar alcohol types for accurate calculation.',
  },
  {
    question: 'How do net carbs affect blood sugar?',
    answer:
      'Net carbs better reflect blood sugar impact than total carbs. Lower net carbs typically cause smaller blood sugar increases. This is important for diabetes management and low-carb diets.',
  },
  {
    question: 'What is a good net carbs amount?',
    answer:
      'Net carbs targets vary by diet and goals. Low-carb diets may aim for 20-50g net carbs per day. Moderate approaches may allow 100-150g. Individual needs vary based on activity, metabolism, and health goals.',
  },
  {
    question: 'How does fiber affect net carbs?',
    answer:
      'Fiber is fully subtracted from total carbs to calculate net carbs because it doesn\'t raise blood sugar. Higher fiber content results in lower net carbs, supporting better blood sugar control.',
  },
  {
    question: 'Can I track net carbs at home?',
    answer:
      'Yes. Use food labels to find total carbohydrates and dietary fiber. Subtract fiber (and sugar alcohols if applicable) to calculate net carbs. Many tracking apps calculate this automatically.',
  },
  {
    question: 'What about different sugar alcohols?',
    answer:
      'Different sugar alcohols have different effects. Erythritol is often fully subtracted, while others (maltitol, sorbitol) may be partially counted. Check specific sugar alcohol types for accurate net carb calculation.',
  },
  {
    question: 'When should I consult a healthcare provider?',
    answer:
      'Consult a healthcare provider or registered dietitian if you have diabetes, blood sugar concerns, or need personalized guidance on net carbs and carbohydrate management for your health goals.',
  },
];

const relatedCalculators = [
  {
    name: 'Carb-to-Fiber Ratio Calculator',
    slug: 'carb-to-fiber-ratio-calculator',
    description: 'Assess fiber content alongside net carbs.',
  },
  {
    name: 'Glycemic Index Meal Blender Calculator',
    slug: 'glycemic-index-meal-blender-calculator',
    description: 'Evaluate glycemic impact comprehensively.',
  },
  {
    name: 'Insulin Response Estimator',
    slug: 'insulin-response-estimator',
    description: 'Estimate insulin response from net carbs.',
  },
  {
    name: 'Meal Calorie Breakdown Calculator',
    slug: 'meal-calorie-breakdown-calculator',
    description: 'Break down meal macronutrients comprehensively.',
  },
];

const baseUrl = 'https://mycalculating.com/category/health-fitness/net-carbs-vs-total-carbs-calculator';

const schemaMarkup = {
  '@context': 'https://schema.org',
  '@graph': [
    {
      '@type': 'BreadcrumbList',
      itemListElement: [
        { '@type': 'ListItem', position: 1, name: 'Home', item: 'https://mycalculating.com' },
        { '@type': 'ListItem', position: 2, name: 'Health & Fitness', item: 'https://mycalculating.com/category/health-fitness' },
        { '@type': 'ListItem', position: 3, name: 'Net Carbs vs Total Carbs Calculator', item: baseUrl },
      ],
    },
    {
      '@type': 'SoftwareApplication',
      name: 'Net Carbs vs Total Carbs Calculator',
      applicationCategory: 'Calculator',
      operatingSystem: 'Web Browser',
      description: 'Calculate net carbs vs total carbs from total carbohydrates, dietary fiber, and sugar alcohols.',
      url: baseUrl,
      offers: { '@type': 'Offer', price: '0', priceCurrency: 'USD' },
    },
  ],
};

const clamp = (value: number, min: number, max: number) => Math.min(max, Math.max(min, value));

const calculateResult = (values: FormValues): ResultPayload => {
  const totalCarbs = values.totalCarbs;
  const fiber = values.fiber;
  const sugarAlcohols = values.sugarAlcohols || 0;
  
  // Calculate net carbs
  // Some calculations subtract 50% of sugar alcohols, but we'll subtract all for simplicity
  // Users can adjust if they know specific sugar alcohol types
  const netCarbs = totalCarbs - fiber - sugarAlcohols;
  
  // Calculate net carbs as percentage of total
  const netCarbsPercent = totalCarbs > 0 ? (netCarbs / totalCarbs) * 100 : 0;
  
  let status: ResultPayload['status'] = 'optimal';
  let interpretation = 'Your net carbs calculation is complete. Net carbs provide a better measure of blood sugar impact than total carbs.';

  if (netCarbs < 0) {
    status = 'low';
    interpretation = 'Net carbs calculation resulted in a negative value. Please verify your inputs. Fiber and sugar alcohols should not exceed total carbohydrates.';
  } else if (netCarbsPercent > 90 || fiber < 2) {
    status = 'moderate';
    interpretation = 'Your net carbs are very close to total carbs, indicating low fiber content. Consider choosing foods with more fiber to reduce net carbs and improve blood sugar control.';
  } else if (netCarbsPercent < 50) {
    status = 'optimal';
    interpretation = 'Your net carbs are significantly lower than total carbs due to high fiber or sugar alcohol content. This supports better blood sugar control.';
  } else {
    status = 'good';
    interpretation = 'Your net carbs calculation is reasonable. Continue choosing foods with adequate fiber to support blood sugar management.';
  }

  const recommendations = [
    'Focus on net carbs for blood sugar management: net carbs better reflect blood sugar impact than total carbs, making them useful for diabetes management and low-carb diets.',
    'Choose high-fiber foods: foods with more fiber have lower net carbs, supporting better blood sugar control. Aim for foods with at least 3-5g of fiber per serving.',
    'Be mindful of sugar alcohols: while sugar alcohols reduce net carbs, individual tolerance varies. Monitor your response to sugar alcohols and adjust intake accordingly.',
  ];
  if (status === 'low') {
    recommendations.push('Verify your inputs. Total carbohydrates should be greater than or equal to the sum of fiber and sugar alcohols. Check food labels for accurate values.');
  }
  if (fiber < 3) {
    recommendations.push('Increase fiber intake. Higher fiber content reduces net carbs and supports better blood sugar control. Choose whole grains, vegetables, and legumes.');
  }
  if (netCarbsPercent > 85) {
    recommendations.push('Consider foods with more fiber or sugar alcohols to lower net carbs. This can help improve blood sugar control and support low-carb dietary goals.');
  }

  const plan = [
    { label: 'This Week', detail: 'Calculate net carbs for your foods and meals. Compare net carbs to total carbs and assess fiber content to identify opportunities for improvement.' },
    { label: 'This Month', detail: 'Optimize food choices: select foods with higher fiber content to reduce net carbs, improve blood sugar control, and support dietary goals.' },
    { label: 'Ongoing', detail: 'Monitor net carbs through regular food assessment. Maintain awareness of net carbs vs total carbs to support optimal blood sugar management and health goals.' },
  ];

  return { totalCarbs, fiber, sugarAlcohols, netCarbs, netCarbsPercent, status, interpretation, recommendations, plan };
};

export default function NetCarbsVsTotalCarbsCalculator() {
  const [result, setResult] = useState<ResultPayload | null>(null);

  const form = useForm<FormValues>({
    resolver: zodResolver(formSchema),
    defaultValues: {
      totalCarbs: undefined,
      fiber: undefined,
      sugarAlcohols: undefined,
    },
  });

  return (
    <div className="space-y-8">
      <Script id="net-carbs-schema" type="application/ld+json" strategy="afterInteractive" dangerouslySetInnerHTML={{ __html: JSON.stringify(schemaMarkup) }} />

      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <Activity className="h-5 w-5" />
            Net Carbs vs Total Carbs Calculator
          </CardTitle>
          <CardDescription>Calculate net carbs vs total carbs from total carbohydrates, dietary fiber, and sugar alcohols.</CardDescription>
        </CardHeader>
      </Card>

      <Card>
        <CardHeader>
          <CardTitle>Input your carbohydrate data</CardTitle>
        </CardHeader>
        <CardContent>
          <Form {...form}>
            <form onSubmit={form.handleSubmit((values) => setResult(calculateResult(values)))} className="space-y-6">
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <FormField
                  control={form.control}
                  name="totalCarbs"
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel>Total carbohydrates (grams)</FormLabel>
                      <FormControl>
                        <Input type="number" step="0.1" placeholder="e.g., 30" value={field.value ?? ''} onChange={(e) => field.onChange(e.target.value === '' ? undefined : Number(e.target.value))} />
                      </FormControl>
                      <FormMessage />
                    </FormItem>
                  )}
                />
                <FormField
                  control={form.control}
                  name="fiber"
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel>Dietary fiber (grams)</FormLabel>
                      <FormControl>
                        <Input type="number" step="0.1" placeholder="e.g., 5" value={field.value ?? ''} onChange={(e) => field.onChange(e.target.value === '' ? undefined : Number(e.target.value))} />
                      </FormControl>
                      <FormMessage />
                    </FormItem>
                  )}
                />
                <FormField
                  control={form.control}
                  name="sugarAlcohols"
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel>Sugar alcohols (grams) (optional)</FormLabel>
                      <FormControl>
                        <Input type="number" step="0.1" placeholder="e.g., 3" value={field.value ?? ''} onChange={(e) => field.onChange(e.target.value === '' ? undefined : Number(e.target.value))} />
                      </FormControl>
                      <FormMessage />
                    </FormItem>
                  )}
                />
              </div>
              <Button type="submit" className="w-full md:w-auto">
                Calculate net carbs
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
            <CardDescription>See net carbs, net carbs percentage, and recommendations.</CardDescription>
          </CardHeader>
          <CardContent className="space-y-6">
            <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
              <div className="p-4 border rounded">
                <p className="text-sm text-muted-foreground">Total carbs</p>
                <p className="text-2xl font-semibold text-primary">{result.totalCarbs.toFixed(1)}g</p>
                <p className="text-xs text-muted-foreground">Carbohydrates</p>
              </div>
              <div className="p-4 border rounded">
                <p className="text-sm text-muted-foreground">Net carbs</p>
                <p className="text-2xl font-semibold text-primary">{result.netCarbs.toFixed(1)}g</p>
                <p className="text-xs text-muted-foreground">After fiber & sugar alcohols</p>
              </div>
              <div className="p-4 border rounded">
                <p className="text-sm text-muted-foreground">Net carbs %</p>
                <p className="text-2xl font-semibold text-primary">{result.netCarbsPercent.toFixed(1)}%</p>
                <p className="text-xs text-muted-foreground">Of total carbs</p>
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
            <strong>Net carbs</strong> = total carbohydrates - dietary fiber - sugar alcohols (if applicable).
          </p>
          <p>
            <strong>Net carbs percentage</strong> = (net carbs / total carbs) × 100. Lower percentages indicate more fiber/sugar alcohols relative to total carbs.
          </p>
          <p>
            <strong>Note</strong>: Some calculations subtract 50% of sugar alcohols rather than 100%. Individual sugar alcohols have variable effects on blood sugar. This calculator subtracts all sugar alcohols for simplicity.
          </p>
          <p>Net carbs provide a better measure of blood sugar impact than total carbs, as fiber and sugar alcohols have minimal effects on blood sugar. Lower net carbs support better blood sugar control.</p>
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
                <p className="text-sm text-muted-foreground">Fiber percentage</p>
                <p className="text-xl font-semibold text-primary">
                  {result.totalCarbs > 0 ? ((result.fiber / result.totalCarbs) * 100).toFixed(1) : 0}%
                </p>
                <p className="text-xs text-muted-foreground">Of total carbs</p>
              </div>
              <div className="p-4 border rounded">
                <p className="text-sm text-muted-foreground">Reduction from fiber</p>
                <p className="text-xl font-semibold text-primary">
                  {result.fiber.toFixed(1)}g
                </p>
                <p className="text-xs text-muted-foreground">Subtracted</p>
              </div>
              <div className="p-4 border rounded">
                <p className="text-sm text-muted-foreground">Total reduction</p>
                <p className="text-xl font-semibold text-primary">
                  {(result.fiber + result.sugarAlcohols).toFixed(1)}g
                </p>
                <p className="text-xs text-muted-foreground">Fiber + sugar alcohols</p>
              </div>
            </div>
          ) : (
            <p className="text-sm text-muted-foreground">Enter your carbohydrate data to see additional insights.</p>
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

      <section className="space-y-6 text-muted-foreground leading-relaxed bg-white p-6 md:p-10 rounded-lg shadow-lg" itemProp itemType="https://schema.org/MedicalWebPage">
    {/* SEO & SCHEMA METADATA (HIGHLY OPTIMIZED) */}
    <meta itemProp="name" content="The Definitive Guide to Net Carbs vs. Total Carbs: Formula, Fiber, and Glycemic Impact" />
    <meta itemProp="description" content="An in-depth guide clarifying the difference between Total Carbs (FDA standard) and Net Carbs (used in keto/low-carb diets), explaining the formula, the role of dietary fiber and sugar alcohols, and their impact on blood sugar." />
    <meta itemProp="keywords" content="net carbs vs total carbs calculator, how to calculate net carbs, what are net carbs, total carbohydrates definition, dietary fiber impact on blood sugar, sugar alcohols net carb count, low carb diet calculation" />
    <meta itemProp="author" content="[Your Site's Health Team]" />
    <meta itemProp="datePublished" content="2025-12-02" />
    <meta itemProp="url" content="/definitive-net-carbs-total-carbs-guide" />

    <h1 className="text-3xl md:text-4xl font-extrabold text-foreground mb-4" itemProp="headline">The Definitive Guide to Net Carbs vs. Total Carbs: Formula, Fiber, and Glycemic Impact</h1>
    <p className="text-lg italic text-gray-700">Understanding the key difference between digestible and indigestible carbohydrates and how the "Net Carbs" concept is used for managing blood sugar and metabolic health.</p>


    {/* TABLE OF CONTENTS (INTERNAL LINKS FOR UX AND SEO) */}
    <h2 className="text-2xl font-bold text-foreground mt-8 mb-4">Table of Contents: Jump to a Section</h2>
    <ul className="list-disc ml-6 space-y-2 text-blue-600">
        <li><a href="#total" className="hover:underline">Total Carbohydrates: The Official Definition (FDA)</a></li>
        <li><a href="#net" className="hover:underline">Net Carbs Defined: The Indigestible Exclusion</a></li>
        <li><a href="#formula" className="hover:underline">The Net Carb Calculation Formula</a></li>
        <li><a href="#fiber" className="hover:underline">Component 1: Dietary Fiber and Indigestibility</a></li>
        <li><a href="#alcohols" className="hover:underline">Component 2: Sugar Alcohols and Partial Absorption</a></li>
        <li><a href="#diet" className="hover:underline">Importance in Low-Carb and Ketogenic Diets</a></li>
    </ul>
<hr />

    {/* TOTAL CARBOHYDRATES: THE OFFICIAL DEFINITION (FDA) */}
    <h2 id="total" className="text-2xl font-bold text-foreground pt-8" itemProp="articleSection">Total Carbohydrates: The Official Definition (FDA)</h2>
    <p><b>Total Carbohydrates</b> is the official metric provided on the Nutrition Facts panel of all packaged foods, as mandated by the <b>U.S. Food and Drug Administration (FDA)</b> and equivalent international bodies. This number represents the sum of all carbohydrate sources found in a food item, regardless of whether the body can digest or absorb them.</p>

    <h3 className="text-xl font-semibold text-foreground mt-6">Components of Total Carbs</h3>
    <p>The total carbohydrate count includes all of the following:</p>
    <ul>
        <li><b>Starches:</b> Complex carbohydrates (e.g., from grains and potatoes) that are fully digestible and convert rapidly to glucose.</li>
        <li><b>Sugars:</b> Simple carbohydrates (e.g., glucose, fructose, sucrose) that are quickly absorbed and have a high glycemic impact.</li>
        <li><b>Dietary Fiber:</b> Indigestible plant material (e.g., cellulose, pectin) that passes through the digestive tract largely intact.</li>
        <li><b>Sugar Alcohols:</b> Compounds used as sugar substitutes (e.g., erythritol, xylitol) which are partially or wholly indigestible.</li>
    </ul>
    <p>For most of the population, tracking Total Carbs is sufficient for general dietary assessment and calorie counting.</p>

<hr />

    {/* NET CARBS DEFINED: THE INDIGESTIBLE EXCLUSION */}
    <h2 id="net" className="text-2xl font-bold text-foreground pt-8" itemProp="articleSection">Net Carbs Defined: The Indigestible Exclusion</h2>
    <p>The term <b>Net Carbs</b> (also known as "digestible carbs" or "impact carbs") is a non-regulated, informal metric commonly used by individuals managing blood glucose levels, particularly those following **low-carbohydrate** or **ketogenic** diets. It represents the carbohydrates that are fully digested, absorbed, and thus have a significant impact on blood sugar and insulin levels.</p>

    <h3 className="text-xl font-semibold text-foreground mt-6">The Goal of the Net Carb Calculation</h3>
    <p>The core philosophy behind Net Carbs is that components which do not break down into glucose or fructose during digestion should not be counted toward a person's daily carbohydrate limit. The calculation effectively isolates the components that provide energy and affect metabolism, allowing followers of restrictive diets to consume more volume of high-fiber foods.</p>
    

<hr />

    {/* THE NET CARB CALCULATION FORMULA */}
    <h2 id="formula" className="text-2xl font-bold text-foreground pt-8" itemProp="articleSection">The Net Carb Calculation Formula</h2>
    <p>The calculation is straightforward, but the subtraction of sugar alcohols requires knowledge of their individual absorption rates. The basic formula is:</p>
    <div className="overflow-x-auto my-6 p-4 bg-gray-50 border rounded-lg text-center">
        <p className="font-mono text-xl text-blue-700 font-bold">
            Net Carbs = Total Carbs – Fiber – (Absorbed Sugar Alcohols)
        </p>
    </div>
    <p>The two primary components subtracted from the Total Carb count are Dietary Fiber and Sugar Alcohols, each for a different physiological reason.</p>

<hr />

    {/* COMPONENT 1: DIETARY FIBER AND INDIGESTIBILITY */}
    <h2 id="fiber" className="text-2xl font-bold text-foreground pt-8" itemProp="articleSection">Component 1: Dietary Fiber and Indigestibility</h2>
    <p>Dietary fiber is almost always subtracted in full from the Total Carb count because it is largely indigestible by human enzymes. Therefore, it contributes minimal calories and does not cause a rise in blood glucose.</p>

    <h3 className="text-xl font-semibold text-foreground mt-6">Types of Fiber and Their Caloric Impact</h3>
    <p>Fiber is classified into two main types, both of which are subtracted from the Net Carb calculation:</p>
    <ul>
        <li><b>Soluble Fiber:</b> Dissolves in water, forming a gel (e.g., oats, beans). This slows digestion and nutrient absorption, helping to regulate blood sugar.</li>
        <li><b>Insoluble Fiber:</b> Does not dissolve in water (e.g., whole grains, vegetable peels). This provides bulk, aiding bowel regularity.</li>
    </ul>
    <p>The FDA officially assigns 0 calories per gram of fiber, recognizing its negligible caloric impact on the body, which justifies its exclusion from Net Carbs.</p>

<hr />

    {/* COMPONENT 2: SUGAR ALCOHOLS AND PARTIAL ABSORPTION */}
    <h2 id="alcohols" className="text-2xl font-bold text-foreground pt-8" itemProp="articleSection">Component 2: Sugar Alcohols and Partial Absorption</h2>
    <p>Sugar alcohols (polyols) are used as low-calorie sweeteners. They are carbohydrates, but they are generally less sweet and less digestible than sucrose. Their treatment in the Net Carb formula is the most complex step.</p>

    <h3 className="text-xl font-semibold text-foreground mt-6">The Complexity of Sugar Alcohol Subtraction</h3>
    <p>The key is recognizing that different sugar alcohols are absorbed at different rates, meaning they have a highly variable glycemic impact:</p>
    <ul>
        <li><b>Zero or Near-Zero Impact (Fully Subtracted):</b> **Erythritol** is the best example. It is almost completely unabsorbed in the small intestine, providing near-zero calories (0.2 kcal/g) and zero glycemic impact. It is fully subtracted from the Net Carb count.</li>
        <li><b>Partial Impact (Partially Subtracted):</b> **Maltitol, Sorbitol, and Xylitol** are partially absorbed, typically contributing 1.5 to 3.0 calories per gram (compared to 4 kcal/g for sugar). For accurate low-carb tracking, many users only subtract **half** the amount of these sugar alcohols.</li>
    </ul>
    <p>Because there is no universal standard for sugar alcohol absorption, Net Carb calculators must apply these varying fractional subtraction methods, leading to variation in final results.</p>

<hr />

    {/* IMPORTANCE IN LOW-CARB AND KETOGENIC DIETS */}
    <h2 id="diet" className="text-2xl font-bold text-foreground pt-8" itemProp="articleSection">Importance in Low-Carb and Ketogenic Diets</h2>
    <p>For individuals following dietary plans that strictly limit carbohydrate intake (typically 20 to 50 grams per day for ketosis), the Net Carb calculation is essential for staying within their metabolic goals.</p>

    <h3 className="text-xl font-semibold text-foreground mt-6">Maintaining Ketosis</h3>
    <p>The primary goal of the ketogenic diet is to force the body into a metabolic state called **ketosis**, where it burns fat for fuel instead of glucose. This requires limiting glucose intake severely. By subtracting indigestible carbs, dieters can consume high-fiber vegetables (like broccoli, spinach, and avocados) without accidentally kicking their bodies out of ketosis, thereby ensuring they meet their micronutrient and satiety needs.</p>

    <h3 className="text-xl font-semibold text-foreground mt-6">Official Guidance Disclaimer</h3>
    <p>It is important to remember that neither the **FDA** nor the **American Diabetes Association (ADA)** endorses "Net Carbs" as a replacement for Total Carbs. The FDA mandates the Total Carb metric because it allows regulators to standardize nutrition facts. Individuals using the Net Carb formula should consult with a healthcare provider or registered dietitian, especially if managing a condition like diabetes, to ensure their specific absorption factors are accounted for.</p>

<hr />

    {/* CONCLUSION */}
    <h2 className="text-2xl font-bold text-foreground pt-8" itemProp="articleSection">Conclusion</h2>
    <p>The distinction between Net Carbs and Total Carbs rests on the **digestibility** of the carbohydrate components. While <b>Total Carbs</b> is the official regulatory metric, <b>Net Carbs</b> isolates the fraction of carbohydrates that actually impacts blood glucose and provides energy. The calculation involves subtracting **Dietary Fiber** (due to indigestibility) and partially subtracting certain **Sugar Alcohols** (due to incomplete absorption). This calculation is a vital tool for those adhering to ketogenic and low-carb diets, allowing them to maximize nutrient-dense, high-fiber food intake while successfully managing their carbohydrate threshold.</p>
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
          <p>This tool calculates net carbs vs total carbs from total carbohydrates, dietary fiber, and optional sugar alcohols.</p>
          <p>Outputs include total carbs, fiber, sugar alcohols, net carbs, net carbs percentage, status, recommendations, an action plan, and supporting metrics.</p>
          <p>Formula, steps, guide content, related tools, and FAQs ensure humans or AI assistants can interpret the methodology instantly.</p>
        </CardContent>
      </Card>
    </div>
  );
}


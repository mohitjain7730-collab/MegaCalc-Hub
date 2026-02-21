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
  vitaminC: z.number({ invalid_type_error: 'Enter vitamin C' }).min(0).max(500),
  vitaminE: z.number({ invalid_type_error: 'Enter vitamin E' }).min(0).max(100),
  folate: z.number({ invalid_type_error: 'Enter folate' }).min(0).max(2000),
  vitaminK: z.number({ invalid_type_error: 'Enter vitamin K' }).min(0).max(500),
  magnesium: z.number({ invalid_type_error: 'Enter magnesium' }).min(0).max(1000),
  potassium: z.number({ invalid_type_error: 'Enter potassium' }).min(0).max(5000),
  fiber: z.number({ invalid_type_error: 'Enter fiber' }).min(0).max(100),
});

type FormValues = z.infer<typeof formSchema>;

type ResultPayload = {
  vitaminC: number;
  vitaminE: number;
  folate: number;
  vitaminK: number;
  magnesium: number;
  potassium: number;
  fiber: number;
  gapScore: number;
  totalGaps: number;
  status: 'optimal' | 'good' | 'moderate' | 'low';
  interpretation: string;
  recommendations: string[];
  plan: { label: string; detail: string }[];
};

const steps = [
  'Enter daily vitamin C intake (mg) from food tracking or estimate.',
  'Enter daily vitamin E intake (mg) from food tracking or estimate.',
  'Enter daily folate intake (mcg) from food tracking or estimate.',
  'Enter daily vitamin K intake (mcg) from food tracking or estimate.',
  'Enter daily magnesium intake (mg) from food tracking or estimate.',
  'Enter daily potassium intake (mg) from food tracking or estimate.',
  'Enter daily fiber intake (g) from food tracking or estimate.',
  'Review carnivore micronutrient gap results and recommendations.',
];

const faqs = [
  {
    question: 'What is the carnivore diet?',
    answer:
      'The carnivore diet is an eating pattern that consists almost exclusively of animal products (meat, fish, eggs, some dairy). It excludes all plant foods, which can create potential gaps in certain micronutrients typically found in plants.',
  },
  {
    question: 'What micronutrients may be lacking on carnivore?',
    answer:
      'The carnivore diet may be low in vitamin C, vitamin E, folate, vitamin K, magnesium, potassium, and fiber, as these nutrients are primarily found in plant foods. However, organ meats and some animal products can provide some of these nutrients.',
  },
  {
    question: 'How is carnivore micronutrient gap calculated?',
    answer:
      'Carnivore micronutrient gap is calculated by assessing intake of key nutrients that may be challenging to obtain on a carnivore diet (vitamin C, E, folate, K, magnesium, potassium, fiber) relative to recommended intakes. Higher gap scores indicate more significant nutrient gaps.',
  },
  {
    question: 'Can you get enough nutrients on carnivore?',
    answer:
      'The carnivore diet can provide many nutrients from animal sources, especially organ meats, which are nutrient-dense. However, some nutrients (vitamin C, fiber, certain vitamins) may require attention or supplementation depending on individual needs and food choices.',
  },
  {
    question: 'What about organ meats?',
    answer:
      'Organ meats (liver, heart, kidney) are highly nutrient-dense and can provide many vitamins and minerals. Including organ meats regularly can help address some micronutrient gaps on a carnivore diet.',
  },
  {
    question: 'What about vitamin C?',
    answer:
      'Vitamin C is primarily found in fruits and vegetables. On a strict carnivore diet, vitamin C intake may be low. However, some people on carnivore diets report adequate vitamin C status, possibly due to reduced need or small amounts in organ meats and raw meat.',
  },
  {
    question: 'What about fiber?',
    answer:
      'Fiber is only found in plant foods. The carnivore diet provides no fiber. While some people tolerate this well, others may experience digestive changes. Some carnivore dieters include small amounts of low-carb plant foods for fiber.',
  },
  {
    question: 'How can I address micronutrient gaps on carnivore?',
    answer:
      'Address gaps by including organ meats regularly, choosing nutrient-dense animal products, considering targeted supplementation if needed, and monitoring nutrient status through blood tests. Some people include small amounts of specific plant foods for certain nutrients.',
  },
  {
    question: 'What about supplements?',
    answer:
      'Some people on carnivore diets use targeted supplements for nutrients that may be challenging to obtain (vitamin C, magnesium, potassium). However, many aim to meet needs through food alone, especially organ meats.',
  },
  {
    question: 'When should I consult a healthcare provider?',
    answer:
      'Consult a healthcare provider or registered dietitian before starting the carnivore diet, if you have specific health conditions, need help planning a balanced carnivore diet, want to ensure nutritional adequacy, or have concerns about nutrient gaps.',
  },
];

const relatedCalculators = [
  {
    name: 'Paleo Diet Nutrient Coverage Calculator',
    slug: 'paleo-diet-nutrient-coverage-calculator',
    description: 'Assess Paleo diet nutrient coverage.',
  },
  {
    name: 'Ketogenic Net Carb Limit Calculator',
    slug: 'ketogenic-net-carb-limit-calculator',
    description: 'Evaluate ketogenic diet compliance.',
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
];

const baseUrl = 'https://mycalculating.com/category/health-fitness/carnivore-micronutrient-gap-calculator';

const schemaMarkup = {
  '@context': 'https://schema.org',
  '@graph': [
    {
      '@type': 'BreadcrumbList',
      itemListElement: [
        { '@type': 'ListItem', position: 1, name: 'Home', item: 'https://mycalculating.com' },
        { '@type': 'ListItem', position: 2, name: 'Health & Fitness', item: 'https://mycalculating.com/category/health-fitness' },
        { '@type': 'ListItem', position: 3, name: 'Carnivore Micronutrient Gap Calculator', item: baseUrl },
      ],
    },
    {
      '@type': 'SoftwareApplication',
      name: 'Carnivore Micronutrient Gap Calculator',
      applicationCategory: 'Calculator',
      operatingSystem: 'Web Browser',
      description: 'Calculate carnivore micronutrient gaps from vitamin C, vitamin E, folate, vitamin K, magnesium, potassium, and fiber intake.',
      url: baseUrl,
      offers: { '@type': 'Offer', price: '0', priceCurrency: 'USD' },
    },
  ],
};

const clamp = (value: number, min: number, max: number) => Math.min(max, Math.max(min, value));

const calculateResult = (values: FormValues): ResultPayload => {
  const vitaminC = values.vitaminC;
  const vitaminE = values.vitaminE;
  const folate = values.folate;
  const vitaminK = values.vitaminK;
  const magnesium = values.magnesium;
  const potassium = values.potassium;
  const fiber = values.fiber;
  
  // Target intakes
  const targets = {
    vitaminC: 75, // mg (women) to 90mg (men), use 80mg average
    vitaminE: 15, // mg
    folate: 400, // mcg
    vitaminK: 90, // mcg (women) to 120mcg (men), use 100mcg average
    magnesium: 310, // mg (women) to 400mg (men), use 350mg average
    potassium: 2600, // mg (women) to 3400mg (men), use 3000mg average
    fiber: 25, // g (not applicable to strict carnivore, but included for assessment)
  };
  
  // Calculate gaps (0 = no gap, higher = bigger gap)
  const gaps = {
    vitaminC: Math.max(0, targets.vitaminC - vitaminC),
    vitaminE: Math.max(0, targets.vitaminE - vitaminE),
    folate: Math.max(0, targets.folate - folate),
    vitaminK: Math.max(0, targets.vitaminK - vitaminK),
    magnesium: Math.max(0, targets.magnesium - magnesium),
    potassium: Math.max(0, targets.potassium - potassium),
    fiber: fiber, // Fiber is always 0 on strict carnivore
  };
  
  const totalGaps = Object.values(gaps).reduce((sum, gap) => sum + (gap > 0 ? 1 : 0), 0);
  
  // Calculate gap score (0-100, higher = more gaps)
  let gapScore = 0;
  
  // Each nutrient gap contributes to score
  if (gaps.vitaminC > 0) gapScore += 15;
  if (gaps.vitaminE > 0) gapScore += 10;
  if (gaps.folate > 0) gapScore += 15;
  if (gaps.vitaminK > 0) gapScore += 10;
  if (gaps.magnesium > 0) gapScore += 15;
  if (gaps.potassium > 0) gapScore += 20;
  if (gaps.fiber > 0) gapScore += 15; // Fiber gap is expected on carnivore
  
  gapScore = clamp(gapScore, 0, 100);
  
  let status: ResultPayload['status'] = 'optimal';
  let interpretation = 'Your carnivore micronutrient gaps are minimal. You are meeting or exceeding targets for most nutrients, supporting comprehensive nutritional adequacy on a carnivore diet.';

  if (gapScore > 60 || totalGaps > 5) {
    status = 'low';
    interpretation = 'Your carnivore micronutrient gaps are significant. Multiple nutrients are below targets. Consider including organ meats regularly, choosing nutrient-dense animal products, and potentially targeted supplementation to address gaps.';
  } else if (gapScore > 40 || totalGaps > 3) {
    status = 'moderate';
    interpretation = 'Your carnivore micronutrient gaps are moderate. Some nutrients are below targets. Increase organ meat consumption and consider nutrient-dense animal products or targeted supplementation to improve nutrient status.';
  } else if (gapScore > 20) {
    status = 'good';
    interpretation = 'Your carnivore micronutrient gaps are minimal. Most nutrients are adequate. Continue including organ meats and nutrient-dense animal products to maintain optimal nutrient status.';
  }

  const recommendations: string[] = [];
  
  // Vitamin C recommendations
  if (gaps.vitaminC > 30) {
    recommendations.push(`Address vitamin C gap urgently: current intake (${vitaminC.toFixed(0)}mg) is significantly below target (${targets.vitaminC}mg). Gap: ${gaps.vitaminC.toFixed(0)}mg. Consider including organ meats, raw meat (if safe), or targeted supplementation.`);
  } else if (gaps.vitaminC > 0) {
    recommendations.push(`Monitor vitamin C: current intake (${vitaminC.toFixed(0)}mg) is below target (${targets.vitaminC}mg). Gap: ${gaps.vitaminC.toFixed(0)}mg. While some people on carnivore report adequate vitamin C status, consider monitoring levels and potentially including small amounts of vitamin C-rich foods or supplements if needed.`);
  } else {
    recommendations.push(`Vitamin C intake (${vitaminC.toFixed(0)}mg) meets target. Continue with your current approach.`);
  }
  
  // Vitamin E recommendations
  if (gaps.vitaminE > 5) {
    recommendations.push(`Address vitamin E gap: current intake (${vitaminE.toFixed(1)}mg) is below target (${targets.vitaminE}mg). Gap: ${gaps.vitaminE.toFixed(1)}mg. Include organ meats and consider supplementation if needed.`);
  } else if (gaps.vitaminE > 0) {
    recommendations.push(`Monitor vitamin E: current intake (${vitaminE.toFixed(1)}mg) is slightly below target (${targets.vitaminE}mg). Gap: ${gaps.vitaminE.toFixed(1)}mg. Continue including nutrient-dense animal products.`);
  } else {
    recommendations.push(`Vitamin E intake (${vitaminE.toFixed(1)}mg) meets target. Continue with your current approach.`);
  }
  
  // Folate recommendations
  if (gaps.folate > 100) {
    recommendations.push(`Address folate gap: current intake (${folate.toFixed(0)}mcg) is significantly below target (${targets.folate}mcg). Gap: ${gaps.folate.toFixed(0)}mcg. Include organ meats regularly, especially liver, which is rich in folate.`);
  } else if (gaps.folate > 0) {
    recommendations.push(`Monitor folate: current intake (${folate.toFixed(0)}mcg) is below target (${targets.folate}mcg). Gap: ${gaps.folate.toFixed(0)}mcg. Include organ meats to improve folate intake.`);
  } else {
    recommendations.push(`Folate intake (${folate.toFixed(0)}mcg) meets target. Continue with your current approach.`);
  }
  
  // Vitamin K recommendations
  if (gaps.vitaminK > 30) {
    recommendations.push(`Address vitamin K gap: current intake (${vitaminK.toFixed(0)}mcg) is below target (${targets.vitaminK}mcg). Gap: ${gaps.vitaminK.toFixed(0)}mcg. Include organ meats and consider supplementation if needed.`);
  } else if (gaps.vitaminK > 0) {
    recommendations.push(`Monitor vitamin K: current intake (${vitaminK.toFixed(0)}mcg) is slightly below target (${targets.vitaminK}mcg). Gap: ${gaps.vitaminK.toFixed(0)}mcg. Continue including nutrient-dense animal products.`);
  } else {
    recommendations.push(`Vitamin K intake (${vitaminK.toFixed(0)}mcg) meets target. Continue with your current approach.`);
  }
  
  // Magnesium recommendations
  if (gaps.magnesium > 100) {
    recommendations.push(`Address magnesium gap: current intake (${magnesium.toFixed(0)}mg) is significantly below target (${targets.magnesium}mg). Gap: ${gaps.magnesium.toFixed(0)}mg. Include magnesium-rich animal products or consider supplementation, as magnesium may be challenging to obtain in adequate amounts on a strict carnivore diet.`);
  } else if (gaps.magnesium > 0) {
    recommendations.push(`Monitor magnesium: current intake (${magnesium.toFixed(0)}mg) is below target (${targets.magnesium}mg). Gap: ${gaps.magnesium.toFixed(0)}mg. Include magnesium-rich animal products or consider supplementation.`);
  } else {
    recommendations.push(`Magnesium intake (${magnesium.toFixed(0)}mg) meets target. Continue with your current approach.`);
  }
  
  // Potassium recommendations
  if (gaps.potassium > 500) {
    recommendations.push(`Address potassium gap: current intake (${potassium.toFixed(0)}mg) is significantly below target (${targets.potassium}mg). Gap: ${gaps.potassium.toFixed(0)}mg. Ensure adequate potassium from animal sources or consider supplementation, as potassium may be lower on carnivore diets compared to plant-rich diets.`);
  } else if (gaps.potassium > 0) {
    recommendations.push(`Monitor potassium: current intake (${potassium.toFixed(0)}mg) is below target (${targets.potassium}mg). Gap: ${gaps.potassium.toFixed(0)}mg. Include potassium-rich animal sources or consider supplementation.`);
  } else {
    recommendations.push(`Potassium intake (${potassium.toFixed(0)}mg) meets target. Continue with your current approach.`);
  }
  
  // Fiber recommendations (always a gap on strict carnivore)
  if (fiber > 0) {
    recommendations.push(`Note: fiber intake (${fiber.toFixed(0)}g) is present, which is not typical for strict carnivore. If following strict carnivore, fiber is not necessary. If including some plant foods, consider fiber alternatives for digestive health.`);
  } else {
    recommendations.push('Fiber is not found in animal foods, which is expected on a strict carnivore diet. Some people include small amounts of low-carb plant foods for digestive health, or focus on adequate hydration and fat intake.');
  }
  
  // General recommendations
  recommendations.push('Include organ meats regularly: liver, heart, kidney, and other organ meats are highly nutrient-dense and can provide many vitamins and minerals that may be lacking in muscle meat alone.');
  recommendations.push('Choose nutrient-dense animal products: include a variety of animal foods including fish, eggs, and dairy (if tolerated) to maximize nutrient diversity.');
  
  if (status === 'low' || status === 'moderate') {
    recommendations.push('Focus on organ meats: prioritize liver and other organ meats, which are among the most nutrient-dense foods and can help address multiple micronutrient gaps on a carnivore diet.');
  }

  const plan = [
    { label: 'This Week', detail: `Calculate carnivore micronutrient gaps (gap score: ${gapScore}/100, ${totalGaps} gaps identified) and assess nutrient status. Focus on addressing identified gaps through food choices.` },
    { label: 'This Month', detail: 'Address carnivore micronutrient gaps: include organ meats regularly (liver 1-2 times per week), choose nutrient-dense animal products, and consider targeted supplementation for specific nutrients if needed.' },
    { label: 'Ongoing', detail: 'Monitor carnivore micronutrient gaps: continue including organ meats and nutrient-dense animal products, monitor nutrient status through blood tests, and adjust intake or supplementation as needed for long-term nutritional adequacy.' },
  ];

  return { vitaminC, vitaminE, folate, vitaminK, magnesium, potassium, fiber, gapScore, totalGaps, status, interpretation, recommendations, plan };
};

export default function CarnivoreMicronutrientGapCalculator() {
  const [result, setResult] = useState<ResultPayload | null>(null);

  const form = useForm<FormValues>({
    resolver: zodResolver(formSchema),
    defaultValues: {
      vitaminC: undefined,
      vitaminE: undefined,
      folate: undefined,
      vitaminK: undefined,
      magnesium: undefined,
      potassium: undefined,
      fiber: undefined,
    },
  });

  return (
    <div className="space-y-8">
      <Script id="carnivore-micronutrient-gap-schema" type="application/ld+json" strategy="afterInteractive" dangerouslySetInnerHTML={{ __html: JSON.stringify(schemaMarkup) }} />

      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <Activity className="h-5 w-5" />
            Carnivore Micronutrient Gap Calculator
          </CardTitle>
          <CardDescription>Calculate carnivore micronutrient gaps from vitamin C, vitamin E, folate, vitamin K, magnesium, potassium, and fiber intake.</CardDescription>
        </CardHeader>
      </Card>

      <Card>
        <CardHeader>
          <CardTitle>Input your carnivore micronutrient data</CardTitle>
        </CardHeader>
        <CardContent>
          <Form {...form}>
            <form onSubmit={form.handleSubmit((values) => setResult(calculateResult(values)))} className="space-y-6">
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <FormField
                  control={form.control}
                  name="vitaminC"
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel>Vitamin C (mg)</FormLabel>
                      <FormControl>
                        <Input type="number" step="0.1" placeholder="e.g., 10" value={field.value ?? ''} onChange={(e) => field.onChange(e.target.value === '' ? undefined : Number(e.target.value))} />
                      </FormControl>
                      <FormMessage />
                    </FormItem>
                  )}
                />
                <FormField
                  control={form.control}
                  name="vitaminE"
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel>Vitamin E (mg)</FormLabel>
                      <FormControl>
                        <Input type="number" step="0.1" placeholder="e.g., 5" value={field.value ?? ''} onChange={(e) => field.onChange(e.target.value === '' ? undefined : Number(e.target.value))} />
                      </FormControl>
                      <FormMessage />
                    </FormItem>
                  )}
                />
                <FormField
                  control={form.control}
                  name="folate"
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel>Folate (mcg)</FormLabel>
                      <FormControl>
                        <Input type="number" step="0.1" placeholder="e.g., 200" value={field.value ?? ''} onChange={(e) => field.onChange(e.target.value === '' ? undefined : Number(e.target.value))} />
                      </FormControl>
                      <FormMessage />
                    </FormItem>
                  )}
                />
                <FormField
                  control={form.control}
                  name="vitaminK"
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel>Vitamin K (mcg)</FormLabel>
                      <FormControl>
                        <Input type="number" step="0.1" placeholder="e.g., 50" value={field.value ?? ''} onChange={(e) => field.onChange(e.target.value === '' ? undefined : Number(e.target.value))} />
                      </FormControl>
                      <FormMessage />
                    </FormItem>
                  )}
                />
                <FormField
                  control={form.control}
                  name="magnesium"
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel>Magnesium (mg)</FormLabel>
                      <FormControl>
                        <Input type="number" step="0.1" placeholder="e.g., 250" value={field.value ?? ''} onChange={(e) => field.onChange(e.target.value === '' ? undefined : Number(e.target.value))} />
                      </FormControl>
                      <FormMessage />
                    </FormItem>
                  )}
                />
                <FormField
                  control={form.control}
                  name="potassium"
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel>Potassium (mg)</FormLabel>
                      <FormControl>
                        <Input type="number" step="1" placeholder="e.g., 2000" value={field.value ?? ''} onChange={(e) => field.onChange(e.target.value === '' ? undefined : Number(e.target.value))} />
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
                      <FormLabel>Fiber (g)</FormLabel>
                      <FormControl>
                        <Input type="number" step="0.1" placeholder="e.g., 0" value={field.value ?? ''} onChange={(e) => field.onChange(e.target.value === '' ? undefined : Number(e.target.value))} />
                      </FormControl>
                      <FormMessage />
                    </FormItem>
                  )}
                />
              </div>
              <Button type="submit" className="w-full md:w-auto">
                Calculate carnivore micronutrient gaps
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
            <CardDescription>See carnivore micronutrient gap results and recommendations.</CardDescription>
          </CardHeader>
          <CardContent className="space-y-6">
            <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
              <div className="p-4 border rounded">
                <p className="text-sm text-muted-foreground">Gap score</p>
                <p className="text-2xl font-semibold text-primary">{result.gapScore.toFixed(0)}</p>
                <p className="text-xs text-muted-foreground">Out of 100</p>
              </div>
              <div className="p-4 border rounded">
                <p className="text-sm text-muted-foreground">Total gaps</p>
                <p className="text-2xl font-semibold text-primary">{result.totalGaps.toFixed(0)}</p>
                <p className="text-xs text-muted-foreground">Nutrients below target</p>
              </div>
              <div className="p-4 border rounded">
                <p className="text-sm text-muted-foreground">Fiber</p>
                <p className="text-2xl font-semibold text-primary">{result.fiber.toFixed(0)}</p>
                <p className="text-xs text-muted-foreground">g/day (expected: 0)</p>
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
            <strong>Carnivore micronutrient gap score</strong> = sum of points for each nutrient below target (vitamin C: 15 points, vitamin E: 10 points, folate: 15 points, vitamin K: 10 points, magnesium: 15 points, potassium: 20 points, fiber: 15 points). Maximum score is 100 points. Higher scores indicate more significant nutrient gaps.
          </p>
          <p>
            <strong>Target intakes:</strong> Vitamin C: 75-90mg (use 80mg average). Vitamin E: 15mg. Folate: 400mcg. Vitamin K: 90-120mcg (use 100mcg average). Magnesium: 310-400mg (use 350mg average). Potassium: 2600-3400mg (use 3000mg average). Fiber: 25g (not applicable to strict carnivore, but included for assessment).
          </p>
          <p>
            <strong>Gap calculation:</strong> For each nutrient, gap = target - current intake (if positive). Total gaps = number of nutrients below target. The carnivore diet may be low in nutrients typically found in plant foods, but organ meats and nutrient-dense animal products can help address many gaps.
          </p>
          <p>The carnivore diet excludes plant foods, which are primary sources of certain micronutrients. Including organ meats regularly and choosing nutrient-dense animal products can help minimize gaps, though some nutrients may require attention or supplementation.</p>
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
                <p className="text-sm text-muted-foreground">Target gap score</p>
                <p className="text-xl font-semibold text-primary">&lt; 20</p>
                <p className="text-xs text-muted-foreground">Optimal range</p>
              </div>
              <div className="p-4 border rounded">
                <p className="text-sm text-muted-foreground">Gap percentage</p>
                <p className="text-xl font-semibold text-primary">{result.gapScore.toFixed(0)}%</p>
                <p className="text-xs text-muted-foreground">Of maximum</p>
              </div>
              <div className="p-4 border rounded">
                <p className="text-sm text-muted-foreground">Nutrient adequacy</p>
                <p className="text-xl font-semibold text-primary">
                  {result.gapScore < 20 ? 'Excellent' : result.gapScore < 40 ? 'Good' : result.gapScore < 60 ? 'Moderate' : 'Needs attention'}
                </p>
                <p className="text-xs text-muted-foreground">Based on gaps</p>
              </div>
            </div>
          ) : (
            <p className="text-sm text-muted-foreground">Enter your carnivore micronutrient data to see additional insights.</p>
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
          <p>The carnivore diet is an eating pattern that consists almost exclusively of animal products (meat, fish, eggs, some dairy). It excludes all plant foods, which can create potential gaps in certain micronutrients typically found in plants.</p>
          <p>Use this calculator to calculate carnivore micronutrient gaps from vitamin C, vitamin E, folate, vitamin K, magnesium, potassium, and fiber intake.</p>
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
          <p>This tool calculates carnivore micronutrient gaps from vitamin C, vitamin E, folate, vitamin K, magnesium, potassium, and fiber intake.</p>
          <p>Outputs include vitamin C, vitamin E, folate, vitamin K, magnesium, potassium, fiber, gap score, total gaps, status, recommendations, an action plan, and supporting metrics.</p>
          <p>Formula, steps, guide content, related tools, and FAQs ensure humans or AI assistants can interpret the methodology instantly.</p>
        </CardContent>
      </Card>
    </div>
  );
}


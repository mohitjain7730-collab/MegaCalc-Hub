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
  alaIntake: z.number({ invalid_type_error: 'Enter ALA intake' }).min(0).max(50),
  epaIntake: z.number({ invalid_type_error: 'Enter EPA intake' }).min(0).max(5),
  dhaIntake: z.number({ invalid_type_error: 'Enter DHA intake' }).min(0).max(5),
  conversionRate: z.number({ invalid_type_error: 'Enter conversion rate' }).min(0).max(20),
});

type FormValues = z.infer<typeof formSchema>;

type ResultPayload = {
  alaIntake: number;
  epaIntake: number;
  dhaIntake: number;
  conversionRate: number;
  convertedEPA: number;
  convertedDHA: number;
  totalEPA: number;
  totalDHA: number;
  status: 'optimal' | 'good' | 'moderate' | 'low';
  interpretation: string;
  recommendations: string[];
  plan: { label: string; detail: string }[];
};

const steps = [
  'Enter daily ALA (alpha-linolenic acid) intake (g) from plant sources like flaxseeds, chia seeds, walnuts.',
  'Enter daily EPA (eicosapentaenoic acid) intake (g) from algae supplements or fortified foods.',
  'Enter daily DHA (docosahexaenoic acid) intake (g) from algae supplements or fortified foods.',
  'Enter estimated ALA to EPA/DHA conversion rate (%) from food tracking or estimate (typically 5-10% for EPA, 0.5-5% for DHA).',
  'Review plant-based omega-3 conversion results and recommendations.',
];

const faqs = [
  {
    question: 'What are omega-3 fatty acids?',
    answer:
      'Omega-3 fatty acids are essential polyunsaturated fats important for brain health, heart health, and inflammation regulation. The main types are ALA (alpha-linolenic acid), EPA (eicosapentaenoic acid), and DHA (docosahexaenoic acid).',
  },
  {
    question: 'What is ALA conversion?',
    answer:
      'ALA (found in plant foods like flaxseeds, chia seeds, walnuts) can be converted by the body to EPA and DHA, but conversion rates are limited. Typically, only 5-10% of ALA converts to EPA and 0.5-5% converts to DHA.',
  },
  {
    question: 'How is plant-based omega-3 conversion calculated?',
    answer:
      'Plant-based omega-3 conversion calculates the amount of EPA and DHA produced from ALA intake based on conversion rates, plus direct EPA and DHA intake from algae supplements or fortified foods. Total EPA and DHA represent the combined omega-3 status.',
  },
  {
    question: 'What are good plant sources of ALA?',
    answer:
      'Good plant sources of ALA include flaxseeds (ground), chia seeds, walnuts, hemp seeds, and canola oil. Flaxseeds and chia seeds are among the richest sources, providing about 2-3g of ALA per tablespoon.',
  },
  {
    question: 'How much omega-3 do I need?',
    answer:
      'Recommended intake is 1.1-1.6g ALA per day for adults, or 250-500mg combined EPA/DHA. For plant-based diets, aim for 1.5-3g ALA daily, and consider algae-based DHA/EPA supplements (250-500mg) for optimal omega-3 status.',
  },
  {
    question: 'Why is conversion limited?',
    answer:
      'ALA to EPA/DHA conversion is limited due to enzyme competition, genetic factors, and dietary factors (high omega-6 intake can reduce conversion). This is why direct EPA/DHA intake from algae supplements is often recommended for plant-based diets.',
  },
  {
    question: 'What about algae supplements?',
    answer:
      'Algae-based supplements provide direct EPA and DHA without relying on conversion. They are the primary plant-based source of preformed EPA and DHA, making them ideal for vegans and vegetarians seeking optimal omega-3 status.',
  },
  {
    question: 'How can I improve omega-3 conversion?',
    answer:
      'Improve conversion by reducing omega-6 intake (limit processed oils), ensuring adequate intake of ALA (1.5-3g daily), avoiding trans fats, and considering direct EPA/DHA from algae supplements for optimal status.',
  },
  {
    question: 'What about omega-3 to omega-6 ratio?',
    answer:
      'A balanced omega-3 to omega-6 ratio (ideally 1:1 to 1:4) supports better ALA conversion. High omega-6 intake (from processed foods, vegetable oils) can compete with omega-3 conversion pathways.',
  },
  {
    question: 'When should I consult a healthcare provider?',
    answer:
      'Consult a healthcare provider or registered dietitian if you have specific health conditions, need help optimizing omega-3 intake on a plant-based diet, want guidance on supplements, or have concerns about omega-3 status.',
  },
];

const relatedCalculators = [
  {
    name: 'Vegan Nutrient Completeness Calculator',
    slug: 'vegan-nutrient-completeness-calculator',
    description: 'Assess vegan nutrient completeness including omega-3.',
  },
  {
    name: 'Mediterranean Diet Score Calculator',
    slug: 'mediterranean-diet-score-calculator',
    description: 'Assess Mediterranean diet adherence.',
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

const baseUrl = 'https://mycalculating.com/category/health-fitness/plant-based-omega-3-conversion-calculator';

const schemaMarkup = {
  '@context': 'https://schema.org',
  '@graph': [
    {
      '@type': 'BreadcrumbList',
      itemListElement: [
        { '@type': 'ListItem', position: 1, name: 'Home', item: 'https://mycalculating.com' },
        { '@type': 'ListItem', position: 2, name: 'Health & Fitness', item: 'https://mycalculating.com/category/health-fitness' },
        { '@type': 'ListItem', position: 3, name: 'Plant-Based Omega-3 Conversion Calculator', item: baseUrl },
      ],
    },
    {
      '@type': 'SoftwareApplication',
      name: 'Plant-Based Omega-3 Conversion Calculator',
      applicationCategory: 'Calculator',
      operatingSystem: 'Web Browser',
      description: 'Calculate plant-based omega-3 conversion from ALA intake, EPA intake, DHA intake, and conversion rate.',
      url: baseUrl,
      offers: { '@type': 'Offer', price: '0', priceCurrency: 'USD' },
    },
  ],
};

const clamp = (value: number, min: number, max: number) => Math.min(max, Math.max(min, value));

const calculateResult = (values: FormValues): ResultPayload => {
  const alaIntake = values.alaIntake;
  const epaIntake = values.epaIntake;
  const dhaIntake = values.dhaIntake;
  const conversionRate = values.conversionRate;
  
  // Calculate converted EPA and DHA from ALA
  // Typical conversion: 5-10% ALA to EPA, 0.5-5% ALA to DHA
  // Use provided conversion rate as average for both
  const epaConversionRate = conversionRate > 0 ? conversionRate : 7.5; // Default 7.5% for EPA
  const dhaConversionRate = conversionRate > 0 ? conversionRate * 0.1 : 0.5; // Default 0.5% for DHA (much lower)
  
  const convertedEPA = (alaIntake * epaConversionRate) / 100;
  const convertedDHA = (alaIntake * dhaConversionRate) / 100;
  
  // Total EPA and DHA (converted + direct intake)
  const totalEPA = convertedEPA + epaIntake;
  const totalDHA = convertedDHA + dhaIntake;
  
  // Target: 250-500mg combined EPA/DHA (0.25-0.5g)
  const totalOmega3 = totalEPA + totalDHA;
  
  let status: ResultPayload['status'] = 'optimal';
  let interpretation = 'Your plant-based omega-3 status is excellent. You are meeting or exceeding targets for EPA and DHA through ALA conversion and/or direct intake, supporting optimal omega-3 status.';

  if (totalOmega3 < 0.15 || alaIntake < 1) {
    status = 'low';
    interpretation = 'Your plant-based omega-3 status is low. Increase ALA intake from plant sources and consider algae-based EPA/DHA supplements to improve omega-3 status and support health.';
  } else if (totalOmega3 < 0.3 || alaIntake < 1.5) {
    status = 'moderate';
    interpretation = 'Your plant-based omega-3 status is moderate. Increase ALA intake and consider algae-based EPA/DHA supplements to reach optimal omega-3 levels for better health outcomes.';
  } else if (totalOmega3 < 0.4) {
    status = 'good';
    interpretation = 'Your plant-based omega-3 status is good. Continue maintaining adequate ALA intake and consider algae-based supplements if needed to reach optimal levels.';
  }

  const recommendations: string[] = [];
  
  // ALA intake recommendations
  const alaTarget = 1.5;
  if (alaIntake < alaTarget * 0.7) {
    recommendations.push(`Significantly increase ALA intake: current intake (${alaIntake.toFixed(1)}g) is below optimal. Aim for 1.5-3g ALA per day from plant sources like ground flaxseeds (1-2 tbsp), chia seeds (1-2 tbsp), walnuts (1/4 cup), or hemp seeds (2-3 tbsp).`);
  } else if (alaIntake >= alaTarget && alaIntake <= 3) {
    recommendations.push(`Maintain ALA intake: your current intake (${alaIntake.toFixed(1)}g) meets recommendations. Continue including ALA-rich foods daily.`);
  } else {
    recommendations.push(`Current ALA intake (${alaIntake.toFixed(1)}g) exceeds typical needs. While ALA is important, 1.5-3g daily is typically sufficient. Continue with your current approach.`);
  }
  
  // Total EPA/DHA recommendations
  const omega3Target = 0.25; // 250mg minimum
  if (totalOmega3 < omega3Target) {
    recommendations.push(`Increase EPA/DHA intake: current total EPA/DHA (${totalOmega3.toFixed(2)}g) is below the recommended 250-500mg (0.25-0.5g). Consider algae-based EPA/DHA supplements providing 250-500mg combined EPA/DHA daily, especially if ALA conversion is limited.`);
  } else if (totalOmega3 >= omega3Target && totalOmega3 <= 0.5) {
    recommendations.push(`Maintain EPA/DHA intake: your current total EPA/DHA (${totalOmega3.toFixed(2)}g) meets recommendations. Continue with ALA-rich foods and consider algae-based supplements if needed.`);
  } else {
    recommendations.push(`Current total EPA/DHA (${totalOmega3.toFixed(2)}g) exceeds recommendations. While omega-3 is important, 250-500mg daily is typically sufficient. Continue with your current approach.`);
  }
  
  // Conversion rate recommendations
  if (conversionRate < 5) {
    recommendations.push(`Optimize conversion: current conversion rate (${conversionRate.toFixed(1)}%) is low. Reduce omega-6 intake (limit processed oils), avoid trans fats, and maintain a balanced omega-3 to omega-6 ratio to support better ALA conversion.`);
  } else if (conversionRate >= 5 && conversionRate <= 10) {
    recommendations.push(`Conversion rate is within typical range (${conversionRate.toFixed(1)}%). Continue maintaining a balanced omega-3 to omega-6 ratio to support conversion.`);
  } else {
    recommendations.push(`Conversion rate (${conversionRate.toFixed(1)}%) is above typical range. Continue with your current approach, but note that conversion rates can vary.`);
  }
  
  // Direct EPA/DHA recommendations
  if (epaIntake + dhaIntake < 0.1) {
    recommendations.push(`Consider algae-based supplements: for optimal omega-3 status, consider algae-based EPA/DHA supplements providing 250-500mg combined EPA/DHA daily, especially since direct intake (${(epaIntake + dhaIntake).toFixed(2)}g) is low.`);
  } else if (epaIntake + dhaIntake >= 0.1 && epaIntake + dhaIntake <= 0.5) {
    recommendations.push(`Good direct EPA/DHA intake (${(epaIntake + dhaIntake).toFixed(2)}g). Continue with algae-based supplements if needed to reach optimal levels.`);
  } else {
    recommendations.push(`Current direct EPA/DHA intake (${(epaIntake + dhaIntake).toFixed(2)}g) is good. Continue with your current approach.`);
  }
  
  // General recommendations
  recommendations.push('Include ALA-rich foods daily: incorporate ground flaxseeds, chia seeds, walnuts, or hemp seeds into your daily meals to ensure consistent ALA intake.');
  recommendations.push('Monitor omega-3 status: track ALA intake and consider blood testing to assess omega-3 status, especially if relying primarily on ALA conversion.');
  
  if (status === 'low' || status === 'moderate') {
    recommendations.push('Focus on consistent intake: ensure daily consumption of ALA-rich foods and consider algae-based supplements to improve omega-3 status and support health.');
  }

  const plan = [
    { label: 'This Week', detail: `Calculate plant-based omega-3 conversion (total EPA/DHA: ${totalOmega3.toFixed(2)}g) and assess omega-3 status. Focus on increasing ALA intake and considering algae-based supplements if needed.` },
    { label: 'This Month', detail: 'Improve plant-based omega-3 status: increase ALA intake to 1.5-3g daily from ground flaxseeds, chia seeds, walnuts, or hemp seeds. Consider algae-based EPA/DHA supplements (250-500mg) for optimal status.' },
    { label: 'Ongoing', detail: 'Maintain plant-based omega-3 status: continue consuming ALA-rich foods daily and consider algae-based supplements to ensure optimal EPA/DHA levels for long-term health benefits.' },
  ];

  return { alaIntake, epaIntake, dhaIntake, conversionRate, convertedEPA, convertedDHA, totalEPA, totalDHA, status, interpretation, recommendations, plan };
};

export default function PlantBasedOmega3ConversionCalculator() {
  const [result, setResult] = useState<ResultPayload | null>(null);

  const form = useForm<FormValues>({
    resolver: zodResolver(formSchema),
    defaultValues: {
      alaIntake: undefined,
      epaIntake: undefined,
      dhaIntake: undefined,
      conversionRate: undefined,
    },
  });

  return (
    <div className="space-y-8">
      <Script id="plant-based-omega-3-conversion-schema" type="application/ld+json" strategy="afterInteractive" dangerouslySetInnerHTML={{ __html: JSON.stringify(schemaMarkup) }} />

      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <Activity className="h-5 w-5" />
            Plant-Based Omega-3 Conversion Calculator
          </CardTitle>
          <CardDescription>Calculate plant-based omega-3 conversion from ALA intake, EPA intake, DHA intake, and conversion rate.</CardDescription>
        </CardHeader>
      </Card>

      <Card>
        <CardHeader>
          <CardTitle>Input your plant-based omega-3 data</CardTitle>
        </CardHeader>
        <CardContent>
          <Form {...form}>
            <form onSubmit={form.handleSubmit((values) => setResult(calculateResult(values)))} className="space-y-6">
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <FormField
                  control={form.control}
                  name="alaIntake"
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel>ALA intake (g)</FormLabel>
                      <FormControl>
                        <Input type="number" step="0.1" placeholder="e.g., 2" value={field.value ?? ''} onChange={(e) => field.onChange(e.target.value === '' ? undefined : Number(e.target.value))} />
                      </FormControl>
                      <FormMessage />
                    </FormItem>
                  )}
                />
                <FormField
                  control={form.control}
                  name="epaIntake"
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel>EPA intake (g, from algae)</FormLabel>
                      <FormControl>
                        <Input type="number" step="0.01" placeholder="e.g., 0.2" value={field.value ?? ''} onChange={(e) => field.onChange(e.target.value === '' ? undefined : Number(e.target.value))} />
                      </FormControl>
                      <FormMessage />
                    </FormItem>
                  )}
                />
                <FormField
                  control={form.control}
                  name="dhaIntake"
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel>DHA intake (g, from algae)</FormLabel>
                      <FormControl>
                        <Input type="number" step="0.01" placeholder="e.g., 0.3" value={field.value ?? ''} onChange={(e) => field.onChange(e.target.value === '' ? undefined : Number(e.target.value))} />
                      </FormControl>
                      <FormMessage />
                    </FormItem>
                  )}
                />
                <FormField
                  control={form.control}
                  name="conversionRate"
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel>Conversion rate (%)</FormLabel>
                      <FormControl>
                        <Input type="number" step="0.1" placeholder="e.g., 7.5" value={field.value ?? ''} onChange={(e) => field.onChange(e.target.value === '' ? undefined : Number(e.target.value))} />
                      </FormControl>
                      <FormMessage />
                    </FormItem>
                  )}
                />
              </div>
              <Button type="submit" className="w-full md:w-auto">
                Calculate plant-based omega-3 conversion
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
            <CardDescription>See plant-based omega-3 conversion results and recommendations.</CardDescription>
          </CardHeader>
          <CardContent className="space-y-6">
            <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
              <div className="p-4 border rounded">
                <p className="text-sm text-muted-foreground">Total EPA</p>
                <p className="text-2xl font-semibold text-primary">{result.totalEPA.toFixed(2)}</p>
                <p className="text-xs text-muted-foreground">g/day</p>
              </div>
              <div className="p-4 border rounded">
                <p className="text-sm text-muted-foreground">Total DHA</p>
                <p className="text-2xl font-semibold text-primary">{result.totalDHA.toFixed(2)}</p>
                <p className="text-xs text-muted-foreground">g/day</p>
              </div>
              <div className="p-4 border rounded">
                <p className="text-sm text-muted-foreground">Total EPA/DHA</p>
                <p className="text-2xl font-semibold text-primary">{(result.totalEPA + result.totalDHA).toFixed(2)}</p>
                <p className="text-xs text-muted-foreground">g/day</p>
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
            <strong>Converted EPA</strong> = (ALA intake × EPA conversion rate) / 100. Typical EPA conversion rate is 5-10% of ALA intake.
          </p>
          <p>
            <strong>Converted DHA</strong> = (ALA intake × DHA conversion rate) / 100. Typical DHA conversion rate is 0.5-5% of ALA intake (much lower than EPA).
          </p>
          <p>
            <strong>Total EPA</strong> = converted EPA + direct EPA intake (from algae supplements). Total DHA = converted DHA + direct DHA intake (from algae supplements).
          </p>
          <p>
            <strong>Target intake:</strong> Aim for 250-500mg (0.25-0.5g) combined EPA/DHA daily, or 1.5-3g ALA daily for plant-based diets. Higher total EPA/DHA indicates better omega-3 status.
          </p>
          <p>Plant-based omega-3 conversion is limited, so combining ALA-rich foods with algae-based EPA/DHA supplements provides optimal omega-3 status for plant-based diets.</p>
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
                <p className="text-sm text-muted-foreground">Target EPA/DHA</p>
                <p className="text-xl font-semibold text-primary">0.25-0.5</p>
                <p className="text-xs text-muted-foreground">g/day (optimal)</p>
              </div>
              <div className="p-4 border rounded">
                <p className="text-sm text-muted-foreground">Target ALA</p>
                <p className="text-xl font-semibold text-primary">1.5-3</p>
                <p className="text-xs text-muted-foreground">g/day (plant-based)</p>
              </div>
              <div className="p-4 border rounded">
                <p className="text-sm text-muted-foreground">Omega-3 status</p>
                <p className="text-xl font-semibold text-primary">
                  {(result.totalEPA + result.totalDHA) >= 0.4 ? 'Excellent' : (result.totalEPA + result.totalDHA) >= 0.3 ? 'Good' : (result.totalEPA + result.totalDHA) >= 0.15 ? 'Moderate' : 'Needs improvement'}
                </p>
                <p className="text-xs text-muted-foreground">Based on total</p>
              </div>
            </div>
          ) : (
            <p className="text-sm text-muted-foreground">Enter your plant-based omega-3 data to see additional insights.</p>
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
          <p>Omega-3 fatty acids are essential polyunsaturated fats important for brain health, heart health, and inflammation regulation. ALA (from plant foods) can be converted to EPA and DHA, but conversion is limited.</p>
          <p>Use this calculator to calculate plant-based omega-3 conversion from ALA intake, EPA intake, DHA intake, and conversion rate.</p>
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
          <p>This tool calculates plant-based omega-3 conversion from ALA intake, EPA intake, DHA intake, and conversion rate.</p>
          <p>Outputs include ALA intake, EPA intake, DHA intake, conversion rate, converted EPA, converted DHA, total EPA, total DHA, status, recommendations, an action plan, and supporting metrics.</p>
          <p>Formula, steps, guide content, related tools, and FAQs ensure humans or AI assistants can interpret the methodology instantly.</p>
        </CardContent>
      </Card>
    </div>
  );
}


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
  protein: z.number({ invalid_type_error: 'Enter protein' }).min(0).max(200),
  fiber: z.number({ invalid_type_error: 'Enter fiber' }).min(0).max(100),
  volume: z.number({ invalid_type_error: 'Enter volume' }).min(0).max(2000),
  calories: z.number({ invalid_type_error: 'Enter calories' }).min(0).max(5000),
  weight: z.number({ invalid_type_error: 'Enter weight' }).min(0).max(5000),
});

type FormValues = z.infer<typeof formSchema>;

type ResultPayload = {
  protein: number;
  fiber: number;
  volume: number;
  calories: number;
  weight: number;
  satietyValue: number;
  energyDensity: number;
  satietyRatio: number;
  status: 'optimal' | 'good' | 'moderate' | 'low';
  interpretation: string;
  recommendations: string[];
  plan: { label: string; detail: string }[];
};

const steps = [
  'Enter protein content (grams) from food tracking or estimate.',
  'Enter fiber content (grams) from food tracking or estimate.',
  'Enter volume (grams or milliliters) from food tracking or estimate.',
  'Enter total calories from food tracking or estimate.',
  'Enter weight (grams) from food tracking or estimate.',
  'Review satiety value, energy density, and recommendations.',
];

const faqs = [
  {
    question: 'What is satiety?',
    answer:
      'Satiety is the feeling of fullness and satisfaction after eating. Higher satiety foods provide more fullness per calorie, supporting appetite control and weight management. Satiety is influenced by protein, fiber, volume, and meal composition.',
  },
  {
    question: 'What is energy density?',
    answer:
      'Energy density is the number of calories per unit of weight (typically calories per 100g). Lower energy density foods (vegetables, fruits) provide more volume and satiety per calorie than high energy density foods (oils, nuts, processed foods).',
  },
  {
    question: 'How does satiety relate to energy density?',
    answer:
      'Foods with lower energy density typically provide better satiety per calorie. The relationship between satiety and energy density helps identify foods that promote fullness while managing calorie intake. Optimal foods have high satiety and low energy density.',
  },
  {
    question: 'How does protein affect satiety?',
    answer:
      'Protein is highly satiating. It increases feelings of fullness, reduces hunger hormones, and supports appetite control. Meals with adequate protein (20-30g) typically provide better satiety and help manage energy density.',
  },
  {
    question: 'How does fiber affect satiety?',
    answer:
      'Fiber increases satiety by adding bulk, slowing digestion, and promoting feelings of fullness. High-fiber foods (vegetables, whole grains, legumes) are typically more satiating per calorie and have lower energy density.',
  },
  {
    question: 'How does volume affect satiety?',
    answer:
      'Food volume (physical space food takes up) affects satiety. Larger volume foods (like vegetables) can increase feelings of fullness even with fewer calories, supporting satiety and reducing overall energy density.',
  },
  {
    question: 'What are optimal satiety vs energy density foods?',
    answer:
      'Optimal foods have high satiety (adequate protein, fiber, volume) and low energy density (fewer calories per gram). Examples include vegetables, fruits, lean proteins, whole grains, and legumes. These foods support fullness while managing calorie intake.',
  },
  {
    question: 'How can I improve satiety vs energy density?',
    answer:
      'Improve satiety vs energy density by including adequate protein (20-30g per meal), adding fiber-rich foods (vegetables, whole grains), choosing lower-energy-density options, and including volume in meals to enhance fullness per calorie.',
  },
  {
    question: 'Can I track satiety vs energy density at home?',
    answer:
      'Yes. Track satiety by monitoring protein, fiber, volume, calories, and weight. Calculate energy density (calories per 100g) and assess how full you feel after meals. Adjust meal composition to optimize satiety while managing energy density.',
  },
  {
    question: 'When should I consult a healthcare provider?',
    answer:
      'Consult a healthcare provider or registered dietitian if you have appetite concerns, need help with meal planning for satiety and energy density, or want personalized guidance on optimizing satiety for weight management.',
  },
];

const relatedCalculators = [
  {
    name: 'Satiety Index Calculator',
    slug: 'satiety-index-calculator',
    description: 'Assess satiety comprehensively.',
  },
  {
    name: 'Nutrient Density to Calorie Ratio Calculator',
    slug: 'nutrient-density-to-calorie-ratio-calculator',
    description: 'Assess nutritional quality comprehensively.',
  },
  {
    name: 'Caloric Density vs Volume Calculator',
    slug: 'caloric-density-vs-volume-calculator',
    description: 'Evaluate calorie density alongside volume.',
  },
  {
    name: 'Meal Calorie Breakdown Calculator',
    slug: 'meal-calorie-breakdown-calculator',
    description: 'Break down meal calories alongside satiety.',
  },
];

const baseUrl = 'https://mycalculating.com/category/health-fitness/satiety-vs-energy-density-graph-calculator';

const schemaMarkup = {
  '@context': 'https://schema.org',
  '@graph': [
    {
      '@type': 'BreadcrumbList',
      itemListElement: [
        { '@type': 'ListItem', position: 1, name: 'Home', item: 'https://mycalculating.com' },
        { '@type': 'ListItem', position: 2, name: 'Health & Fitness', item: 'https://mycalculating.com/category/health-fitness' },
        { '@type': 'ListItem', position: 3, name: 'Satiety vs Energy Density Graph Calculator', item: baseUrl },
      ],
    },
    {
      '@type': 'SoftwareApplication',
      name: 'Satiety vs Energy Density Graph Calculator',
      applicationCategory: 'Calculator',
      operatingSystem: 'Web Browser',
      description: 'Calculate satiety vs energy density from protein, fiber, volume, calories, and weight.',
      url: baseUrl,
      offers: { '@type': 'Offer', price: '0', priceCurrency: 'USD' },
    },
  ],
};

const clamp = (value: number, min: number, max: number) => Math.min(max, Math.max(min, value));

const calculateResult = (values: FormValues): ResultPayload => {
  const protein = values.protein;
  const fiber = values.fiber;
  const volume = values.volume;
  const calories = values.calories;
  const weight = values.weight;
  
  // Calculate energy density (calories per 100g)
  const energyDensity = weight > 0 ? (calories / weight) * 100 : 0;
  
  // Calculate satiety value (0-100, higher = more satiating)
  // Based on protein, fiber, and volume relative to calories
  let satietyValue = 50;
  
  // Protein component (0-35 points)
  // Optimal: 20-30g per meal
  if (protein >= 25 && protein <= 35) {
    satietyValue += 30; // Optimal range
  } else if (protein >= 20 && protein < 25) {
    satietyValue += 25; // Good
  } else if (protein >= 15 && protein < 20) {
    satietyValue += 15; // Moderate
  } else if (protein < 10) {
    satietyValue -= 20; // Low
  } else if (protein > 35) {
    satietyValue += 20; // Very high (still beneficial)
  }
  
  // Fiber component (0-30 points)
  // Optimal: 5-10g per meal
  if (fiber >= 8 && fiber <= 15) {
    satietyValue += 28; // Excellent
  } else if (fiber >= 5 && fiber < 8) {
    satietyValue += 18; // Good
  } else if (fiber >= 3 && fiber < 5) {
    satietyValue += 8; // Moderate
  } else if (fiber < 2) {
    satietyValue -= 15; // Low
  } else if (fiber > 15) {
    satietyValue += 25; // Very high
  }
  
  // Volume component (0-20 points)
  // Higher volume relative to calories = better
  const volumePerCalorie = calories > 0 ? volume / calories : 0;
  if (volumePerCalorie >= 2) {
    satietyValue += 18; // High volume
  } else if (volumePerCalorie >= 1) {
    satietyValue += 10; // Good volume
  } else if (volumePerCalorie < 0.5) {
    satietyValue -= 12; // Low volume
  } else {
    satietyValue += 3; // Moderate volume
  }
  
  // Energy density adjustment (0-15 points, inverted)
  // Lower energy density = better satiety
  if (energyDensity < 50) {
    satietyValue += 12; // Very low density
  } else if (energyDensity < 100) {
    satietyValue += 6; // Low density
  } else if (energyDensity > 300) {
    satietyValue -= 10; // High density
  }
  
  satietyValue = clamp(satietyValue, 0, 100);
  
  // Calculate satiety ratio (satiety per unit of energy density)
  // Higher ratio = better (more satiety per calorie density)
  const satietyRatio = energyDensity > 0 ? satietyValue / energyDensity : 0;
  
  let status: ResultPayload['status'] = 'optimal';
  let interpretation = 'Your satiety vs energy density relationship appears optimal. Continue including adequate protein, fiber, and volume with lower energy density to support appetite control.';

  if (satietyValue < 40 || energyDensity > 300 || protein < 10 || fiber < 2) {
    status = 'low';
    interpretation = 'Your satiety vs energy density relationship is low. This food may not provide adequate fullness relative to calories. Increase protein, fiber, and volume while reducing energy density to improve satiety and support appetite control.';
  } else if (satietyValue < 60 || energyDensity > 200 || protein < 15 || fiber < 5) {
    status = 'moderate';
    interpretation = 'Your satiety vs energy density relationship is moderate. Consider increasing protein, fiber, and volume while reducing energy density to enhance satiety and improve appetite control.';
  } else if (satietyValue < 75 || energyDensity > 150) {
    status = 'good';
    interpretation = 'Your satiety vs energy density relationship is good. Continue including adequate protein, fiber, and volume with lower energy density to maintain optimal satiety and appetite control.';
  }

  const recommendations: string[] = [];
  
  // Energy density recommendations
  if (energyDensity > 300) {
    recommendations.push(`Significantly reduce energy density: current energy density (${energyDensity.toFixed(0)} cal/100g) is very high. High energy density foods provide less satiety per calorie. Choose lower-energy-density options like vegetables, fruits, and lean proteins to improve satiety.`);
  } else if (energyDensity > 250) {
    recommendations.push(`Reduce energy density: current energy density (${energyDensity.toFixed(0)} cal/100g) is high. Choose foods with lower calories per gram (calories per 100g < 150) to improve satiety per calorie and support appetite control.`);
  } else if (energyDensity > 150) {
    recommendations.push(`Monitor energy density: current energy density (${energyDensity.toFixed(0)} cal/100g) is moderate. Aim for lower energy density (< 150 cal/100g) to improve satiety per calorie.`);
  } else {
    recommendations.push(`Energy density is optimal (${energyDensity.toFixed(0)} cal/100g). Continue choosing foods with lower calories per gram to maintain good satiety per calorie.`);
  }
  
  // Protein recommendations
  if (protein < 10) {
    recommendations.push(`Significantly increase protein: current intake (${protein.toFixed(1)}g) is very low. Aim for 20-30g of protein per meal to maximize satiety. Protein is highly satiating and supports appetite control while helping manage energy density.`);
  } else if (protein < 15) {
    recommendations.push(`Increase protein: current intake (${protein.toFixed(1)}g) is below optimal. Aim for 20-30g of protein per meal to maximize satiety and improve satiety vs energy density relationship.`);
  } else if (protein >= 20 && protein <= 30) {
    recommendations.push(`Protein intake is optimal (${protein.toFixed(1)}g). Continue including adequate protein to maintain satiety.`);
  } else if (protein > 30) {
    recommendations.push(`Protein intake (${protein.toFixed(1)}g) exceeds typical recommendations. While protein is satiating, 20-30g per meal is typically sufficient.`);
  } else {
    recommendations.push(`Protein intake (${protein.toFixed(1)}g) is moderate. Consider increasing to 20-30g per meal for optimal satiety.`);
  }
  
  // Fiber recommendations
  if (fiber < 2) {
    recommendations.push(`Significantly increase fiber: current intake (${fiber.toFixed(1)}g) is very low. Add fiber-rich foods: include vegetables, whole grains, and legumes to increase fiber content (5-10g per meal) and enhance satiety through bulk and slower digestion while reducing energy density.`);
  } else if (fiber < 5) {
    recommendations.push(`Increase fiber: current intake (${fiber.toFixed(1)}g) is below optimal. Aim for 5-10g of fiber per meal to enhance satiety through bulk and slower digestion while reducing energy density.`);
  } else if (fiber >= 5 && fiber <= 10) {
    recommendations.push(`Fiber intake is optimal (${fiber.toFixed(1)}g). Continue including fiber-rich foods to maintain satiety.`);
  } else {
    recommendations.push(`Fiber intake (${fiber.toFixed(1)}g) exceeds typical recommendations. While fiber is beneficial, 5-10g per meal is typically sufficient.`);
  }
  
  // Volume recommendations
  // volumePerCalorie is already calculated above
  if (volumePerCalorie < 0.5) {
    recommendations.push(`Increase volume: current volume per calorie (${volumePerCalorie.toFixed(2)} ml/cal) is low. Include low-energy-density foods like vegetables to add volume without many calories, enhancing feelings of fullness and improving satiety vs energy density ratio.`);
  } else if (volumePerCalorie >= 1) {
    recommendations.push(`Volume is good (${volumePerCalorie.toFixed(2)} ml/cal). Continue including low-energy-density foods to maintain good volume per calorie.`);
  } else {
    recommendations.push(`Volume per calorie (${volumePerCalorie.toFixed(2)} ml/cal) is moderate. Consider increasing volume with low-energy-density foods to improve satiety.`);
  }
  
  // Satiety value recommendations
  if (satietyValue < 40) {
    recommendations.push(`Significantly increase satiety factors: current satiety value (${satietyValue.toFixed(0)}/100) is very low. Focus on protein (20-30g), fiber (5-10g), and volume to enhance fullness and improve satiety vs energy density relationship.`);
  } else if (satietyValue < 60) {
    recommendations.push(`Improve satiety factors: current satiety value (${satietyValue.toFixed(0)}/100) is moderate. Increase protein, fiber, and volume while reducing energy density to enhance satiety.`);
  } else if (satietyValue >= 75) {
    recommendations.push(`Satiety value is excellent (${satietyValue.toFixed(0)}/100). Continue including adequate protein, fiber, and volume with lower energy density.`);
  } else {
    recommendations.push(`Satiety value is good (${satietyValue.toFixed(0)}/100). Continue optimizing meal composition to maintain or improve satiety.`);
  }
  
  // Satiety ratio recommendations
  if (satietyRatio < 0.1) {
    recommendations.push(`Improve satiety ratio: current ratio (${satietyRatio.toFixed(3)}) is low, indicating poor satiety per unit of energy density. Focus on increasing protein, fiber, and volume while reducing energy density.`);
  } else if (satietyRatio >= 0.3) {
    recommendations.push(`Satiety ratio is excellent (${satietyRatio.toFixed(3)}). Continue maintaining this balance of satiety and energy density.`);
  } else {
    recommendations.push(`Satiety ratio is moderate (${satietyRatio.toFixed(3)}). Continue optimizing to improve satiety per unit of energy density.`);
  }
  
  if (status === 'low' || status === 'moderate') {
    recommendations.push('Optimize meal composition: combine adequate protein (20-30g), fiber (5-10g), and volume with lower energy density (< 150 calories per 100g) to maximize satiety and support weight management.');
  }

  const plan = [
    { label: 'This Week', detail: `Calculate satiety vs energy density and assess current values (satiety: ${satietyValue.toFixed(0)}, energy density: ${energyDensity.toFixed(0)} cal/100g). Identify opportunities to improve satiety while reducing energy density.` },
    { label: 'This Month', detail: 'Optimize satiety vs energy density: include adequate protein (20-30g), fiber (5-10g), and volume with lower energy density (< 150 cal/100g) to enhance satiety and support appetite control.' },
    { label: 'Ongoing', detail: 'Monitor satiety vs energy density through regular food assessment. Maintain optimal satiety values (> 75) with lower energy density (< 150 cal/100g) to support fullness and weight management.' },
  ];

  return { protein, fiber, volume, calories, weight, satietyValue, energyDensity, satietyRatio, status, interpretation, recommendations, plan };
};

export default function SatietyVsEnergyDensityGraphCalculator() {
  const [result, setResult] = useState<ResultPayload | null>(null);

  const form = useForm<FormValues>({
    resolver: zodResolver(formSchema),
    defaultValues: {
      protein: undefined,
      fiber: undefined,
      volume: undefined,
      calories: undefined,
      weight: undefined,
    },
  });

  return (
    <div className="space-y-8">
      <Script id="satiety-vs-energy-density-graph-schema" type="application/ld+json" strategy="afterInteractive" dangerouslySetInnerHTML={{ __html: JSON.stringify(schemaMarkup) }} />

      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <Activity className="h-5 w-5" />
            Satiety vs Energy Density Graph Calculator
          </CardTitle>
          <CardDescription>Calculate satiety vs energy density from protein, fiber, volume, calories, and weight.</CardDescription>
        </CardHeader>
      </Card>

      <Card>
        <CardHeader>
          <CardTitle>Input your satiety and energy density data</CardTitle>
        </CardHeader>
        <CardContent>
          <Form {...form}>
            <form onSubmit={form.handleSubmit((values) => setResult(calculateResult(values)))} className="space-y-6">
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <FormField
                  control={form.control}
                  name="protein"
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel>Protein (g)</FormLabel>
                      <FormControl>
                        <Input type="number" step="0.1" placeholder="e.g., 25" value={field.value ?? ''} onChange={(e) => field.onChange(e.target.value === '' ? undefined : Number(e.target.value))} />
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
                        <Input type="number" step="0.1" placeholder="e.g., 8" value={field.value ?? ''} onChange={(e) => field.onChange(e.target.value === '' ? undefined : Number(e.target.value))} />
                      </FormControl>
                      <FormMessage />
                    </FormItem>
                  )}
                />
                <FormField
                  control={form.control}
                  name="volume"
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel>Volume (g or ml)</FormLabel>
                      <FormControl>
                        <Input type="number" step="1" placeholder="e.g., 300" value={field.value ?? ''} onChange={(e) => field.onChange(e.target.value === '' ? undefined : Number(e.target.value))} />
                      </FormControl>
                      <FormMessage />
                    </FormItem>
                  )}
                />
                <FormField
                  control={form.control}
                  name="calories"
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel>Calories</FormLabel>
                      <FormControl>
                        <Input type="number" step="1" placeholder="e.g., 400" value={field.value ?? ''} onChange={(e) => field.onChange(e.target.value === '' ? undefined : Number(e.target.value))} />
                      </FormControl>
                      <FormMessage />
                    </FormItem>
                  )}
                />
                <FormField
                  control={form.control}
                  name="weight"
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel>Weight (g)</FormLabel>
                      <FormControl>
                        <Input type="number" step="1" placeholder="e.g., 250" value={field.value ?? ''} onChange={(e) => field.onChange(e.target.value === '' ? undefined : Number(e.target.value))} />
                      </FormControl>
                      <FormMessage />
                    </FormItem>
                  )}
                />
              </div>
              <Button type="submit" className="w-full md:w-auto">
                Calculate satiety vs energy density
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
            <CardDescription>See satiety value, energy density, and recommendations.</CardDescription>
          </CardHeader>
          <CardContent className="space-y-6">
            <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
              <div className="p-4 border rounded">
                <p className="text-sm text-muted-foreground">Satiety value</p>
                <p className="text-2xl font-semibold text-primary">{result.satietyValue.toFixed(0)}</p>
                <p className="text-xs text-muted-foreground">Out of 100</p>
              </div>
              <div className="p-4 border rounded">
                <p className="text-sm text-muted-foreground">Energy density</p>
                <p className="text-2xl font-semibold text-primary">{result.energyDensity.toFixed(0)}</p>
                <p className="text-xs text-muted-foreground">cal/100g</p>
              </div>
              <div className="p-4 border rounded">
                <p className="text-sm text-muted-foreground">Satiety ratio</p>
                <p className="text-2xl font-semibold text-primary">{result.satietyRatio.toFixed(2)}</p>
                <p className="text-xs text-muted-foreground">Satiety per density</p>
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
            <strong>Energy density</strong> = (calories / weight) × 100. Values represent calories per 100g. Lower energy density (&lt; 150 cal/100g) typically provides better satiety per calorie.
          </p>
          <p>
            <strong>Satiety value</strong> = calculated from protein (0-35 points), fiber (0-30 points), volume (0-20 points), and energy density adjustment (0-15 points). Higher values (≥75) indicate better satiety per calorie.
          </p>
          <p>
            <strong>Satiety ratio</strong> = satiety value / energy density. Higher ratios indicate better satiety per unit of energy density, supporting appetite control and weight management.
          </p>
          <p>Satiety vs energy density relationship helps identify foods that promote fullness while managing calorie intake. Optimal foods have high satiety (adequate protein, fiber, volume) and low energy density (fewer calories per gram).</p>
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
                <p className="text-sm text-muted-foreground">Target satiety value</p>
                <p className="text-xl font-semibold text-primary">&gt; 75</p>
                <p className="text-xs text-muted-foreground">Optimal range</p>
              </div>
              <div className="p-4 border rounded">
                <p className="text-sm text-muted-foreground">Target energy density</p>
                <p className="text-xl font-semibold text-primary">&lt; 150</p>
                <p className="text-xs text-muted-foreground">cal/100g (optimal)</p>
              </div>
              <div className="p-4 border rounded">
                <p className="text-sm text-muted-foreground">Relationship status</p>
                <p className="text-xl font-semibold text-primary">
                  {result.satietyValue >= 75 && result.energyDensity < 150 ? 'Optimal' : result.satietyValue < 50 || result.energyDensity > 250 ? 'Needs improvement' : 'Good'}
                </p>
                <p className="text-xs text-muted-foreground">Based on values</p>
              </div>
            </div>
          ) : (
            <p className="text-sm text-muted-foreground">Enter your satiety and energy density data to see additional insights.</p>
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
          <p>Satiety is the feeling of fullness and satisfaction after eating. Energy density is the number of calories per unit of weight (calories per 100g). The relationship between satiety and energy density helps identify foods that promote fullness while managing calorie intake.</p>
          <p>Use this calculator to calculate satiety vs energy density from protein, fiber, volume, calories, and weight.</p>
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
          <p>This tool calculates satiety vs energy density from protein, fiber, volume, calories, and weight.</p>
          <p>Outputs include protein, fiber, volume, calories, weight, satiety value, energy density, satiety ratio, status, recommendations, an action plan, and supporting metrics.</p>
          <p>Formula, steps, guide content, related tools, and FAQs ensure humans or AI assistants can interpret the methodology instantly.</p>
        </CardContent>
      </Card>
    </div>
  );
}


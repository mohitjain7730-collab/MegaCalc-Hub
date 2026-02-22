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
  preExerciseWeight: z.number({ invalid_type_error: 'Enter pre-exercise weight' }).min(30).max(200),
  postExerciseWeight: z.number({ invalid_type_error: 'Enter post-exercise weight' }).min(30).max(200),
  exerciseDuration: z.number({ invalid_type_error: 'Enter exercise duration' }).min(1).max(480),
  fluidConsumed: z.number({ invalid_type_error: 'Enter fluid consumed' }).min(0).max(5000).optional(),
});

type FormValues = z.infer<typeof formSchema>;

type ResultPayload = {
  preExerciseWeight: number;
  postExerciseWeight: number;
  exerciseDuration: number;
  fluidConsumed: number | undefined;
  sweatLoss: number;
  sweatRate: number;
  hourlySweatRate: number;
  status: 'optimal' | 'good' | 'moderate' | 'low';
  interpretation: string;
  recommendations: string[];
  plan: { label: string; detail: string }[];
};

const steps = [
  'Weigh yourself before exercise (kg, minimal clothing, after using bathroom).',
  'Weigh yourself immediately after exercise (kg, same conditions).',
  'Enter exercise duration (minutes).',
  'Enter fluid consumed during exercise (ml, optional).',
  'Review sweat loss, sweat rate, and hydration recommendations.',
];

const faqs = [
  {
    question: 'What is sweat rate and why is it important?',
    answer:
      'Sweat rate is the amount of fluid you lose through sweating per hour during exercise. Knowing your sweat rate helps you develop personalized hydration strategies to prevent dehydration, maintain performance, and optimize recovery. Individual sweat rates vary widely (0.5-3.0 L/hour).',
  },
  {
    question: 'How do I measure my sweat rate accurately?',
    answer:
      'Weigh yourself before and after exercise (minimal clothing, after using bathroom, before and after). Subtract post-exercise weight from pre-exercise weight, add any fluid consumed, and divide by exercise duration in hours. This gives your sweat rate in liters per hour.',
  },
  {
    question: 'What factors affect sweat rate?',
    answer:
      'Sweat rate is influenced by: exercise intensity (higher intensity = more sweat), environmental temperature (hotter = more sweat), humidity (high humidity reduces evaporative cooling), fitness level (fitter individuals sweat more efficiently), body size (larger individuals sweat more), and genetics.',
  },
  {
    question: 'What is a normal sweat rate?',
    answer:
      'Normal sweat rates range from 0.5-3.0 liters per hour during exercise. Most people sweat 1-2 L/hour during moderate-intensity exercise in moderate temperatures. Rates above 2.5 L/hour are considered high and require aggressive hydration strategies.',
  },
  {
    question: 'How do I use sweat rate to plan hydration?',
    answer:
      'Aim to replace 80-100% of sweat loss during exercise. If your sweat rate is 1.5 L/hour and you exercise for 2 hours, you need 2.4-3.0 L of fluid. Start drinking early (15-20 minutes into exercise) and continue regularly (every 15-20 minutes) rather than large amounts at once.',
  },
  {
    question: 'What happens if I don\'t replace sweat loss?',
    answer:
      'Inadequate fluid replacement leads to dehydration, which impairs performance, increases heart rate, reduces blood volume, decreases sweat rate (making overheating worse), causes muscle cramps, and increases risk of heat illness. Even 2% dehydration (1.4 kg for 70kg person) significantly impairs performance.',
  },
  {
    question: 'Can I drink too much during exercise?',
    answer:
      'Yes. Overhydration (hyponatremia) can occur from excessive water intake, especially during long-duration exercise. Symptoms include nausea, headache, confusion, and in severe cases, seizures. Balance water intake with electrolyte needs and avoid drinking more than your sweat rate.',
  },
  {
    question: 'Should I replace 100% of sweat loss?',
    answer:
      'Aim for 80-100% replacement during exercise. Complete replacement (100%) may be difficult during intense or long exercise. Replacing 80% is often sufficient to maintain performance. Complete remaining replacement post-exercise with meals and fluids.',
  },
  {
    question: 'How does sweat rate change with conditions?',
    answer:
      'Sweat rate increases significantly in hot, humid conditions. You may need to measure sweat rate in different conditions (hot vs. moderate temperatures) to develop appropriate hydration strategies. Hot conditions can increase sweat rate by 50-100% compared to moderate temperatures.',
  },
  {
    question: 'What about electrolytes lost in sweat?',
    answer:
      'Sweat contains sodium (primary electrolyte), potassium, and small amounts of other minerals. For exercise lasting more than 1-2 hours, or in hot conditions, consider electrolyte replacement through sports drinks or electrolyte supplements. Sodium loss varies (200-2000mg per liter of sweat).',
  },
];

const relatedCalculators = [
  {
    name: 'Hydration Sweat Rate Calculator',
    slug: 'hydration-needs-calculator',
    description: 'Calculate sweat rate for general hydration planning.',
  },
  {
    name: 'Hydration Tracker by Climate & Weight',
    slug: 'hydration-tracker-by-climate-weight-calculator',
    description: 'Assess daily hydration needs by climate and weight.',
  },
  {
    name: 'Electrolyte Balance Restoration Calculator',
    slug: 'electrolyte-balance-restoration-calculator',
    description: 'Evaluate electrolyte needs during and after exercise.',
  },
  {
    name: 'Exercise Calorie Burn Calculator',
    slug: 'mets-calories-burned-calculator',
    description: 'Calculate calories burned during athletic activities.',
  },
];

const baseUrl = 'https://mycalculating.com/health-fitness/sweat-rate-calculator-athletic-use';

const schemaMarkup = {
  '@context': 'https://schema.org',
  '@graph': [
    {
      '@type': 'BreadcrumbList',
      itemListElement: [
        { '@type': 'ListItem', position: 1, name: 'Home', item: 'https://mycalculating.com' },
        { '@type': 'ListItem', position: 2, name: 'Health & Fitness', item: 'https://mycalculating.com/health-fitness' },
        { '@type': 'ListItem', position: 3, name: 'Sweat Rate Calculator (Athletic Use)', item: baseUrl },
      ],
    },
    {
      '@type': 'SoftwareApplication',
      name: 'Sweat Rate Calculator (Athletic Use)',
      applicationCategory: 'Calculator',
      operatingSystem: 'Web Browser',
      description: 'Calculate sweat rate during athletic exercise to optimize hydration strategies and prevent dehydration.',
      url: baseUrl,
      offers: { '@type': 'Offer', price: '0', priceCurrency: 'USD' },
    },
  ],
};

const clamp = (value: number, min: number, max: number) => Math.min(max, Math.max(min, value));

const calculateResult = (values: FormValues): ResultPayload => {
  const preExerciseWeight = values.preExerciseWeight;
  const postExerciseWeight = values.postExerciseWeight;
  const exerciseDuration = values.exerciseDuration;
  const fluidConsumed = values.fluidConsumed || 0;
  
  // Calculate sweat loss: weight loss + fluid consumed
  // Weight loss (kg) = pre - post, convert to ml (1 kg = 1000 ml)
  const weightLoss = preExerciseWeight - postExerciseWeight;
  const sweatLoss = (weightLoss * 1000) + fluidConsumed; // ml
  
  // Calculate sweat rate: sweat loss / exercise duration (hours)
  const exerciseHours = exerciseDuration / 60;
  const sweatRate = exerciseHours > 0 ? sweatLoss / exerciseHours : 0; // ml per hour
  const hourlySweatRate = sweatRate / 1000; // L per hour
  
  let status: ResultPayload['status'] = 'optimal';
  let interpretation = 'Your sweat rate appears normal. Continue with appropriate hydration strategies.';

  if (hourlySweatRate >= 2.5) {
    status = 'low';
    interpretation = 'Your sweat rate is very high. This requires aggressive hydration strategies: drink 2-3 L/hour during exercise, start hydrating early, replace electrolytes, and monitor for signs of dehydration. Consider measuring in different conditions.';
  } else if (hourlySweatRate >= 2.0) {
    status = 'moderate';
    interpretation = 'Your sweat rate is high. Ensure adequate fluid intake (2+ L/hour), start drinking early in exercise, and replace electrolytes during long-duration or intense exercise. Monitor hydration status closely.';
  } else if (hourlySweatRate >= 1.0) {
    status = 'good';
    interpretation = 'Your sweat rate is moderate. Maintain regular fluid intake (1-2 L/hour), start drinking 15-20 minutes into exercise, and replace electrolytes for exercise lasting more than 1-2 hours.';
  } else {
    status = 'optimal';
    interpretation = 'Your sweat rate is within normal range. Continue with standard hydration practices: drink 0.5-1 L/hour during exercise, start early, and replace electrolytes for longer sessions.';
  }

  const recommendations = [
    `Hydration target: aim to replace 80-100% of sweat loss during exercise. For your sweat rate of ${hourlySweatRate.toFixed(2)} L/hour, drink approximately ${(hourlySweatRate * 0.9).toFixed(2)}-${hourlySweatRate.toFixed(2)} L per hour of exercise.`,
    'Start drinking early: begin fluid intake 15-20 minutes into exercise and continue regularly (every 15-20 minutes) rather than large amounts at once. This prevents dehydration and maintains performance.',
  ];
  
  if (hourlySweatRate >= 2.0) {
    recommendations.push('High sweat rate strategy: with sweat rates above 2 L/hour, use aggressive hydration. Consider pre-hydration (drink 500ml 1-2 hours before), frequent small sips during exercise, and electrolyte replacement for sessions longer than 1 hour.');
  }
  
  if (exerciseDuration >= 90) {
    recommendations.push('Long-duration exercise: for sessions longer than 90 minutes, replace electrolytes (sodium, potassium) in addition to water. Use sports drinks or electrolyte supplements to prevent hyponatremia.');
  }
  
  if (hourlySweatRate >= 1.5) {
    recommendations.push('Post-exercise rehydration: after high sweat rate sessions, replace 150% of sweat loss over 2-4 hours. Include electrolytes and carbohydrates to restore fluid balance and glycogen stores.');
  }

  const plan = [
    { label: 'This Week', detail: `Measure sweat rate in your typical exercise conditions. Develop a hydration plan based on calculated sweat rate, aiming to replace 80-100% of losses during exercise.` },
    { label: 'This Month', detail: 'Refine hydration strategy based on sweat rate measurements. Test different conditions (hot vs. moderate temperatures) and adjust fluid intake accordingly. Monitor performance and hydration status.' },
    { label: 'Ongoing', detail: 'Continue monitoring sweat rate as fitness and conditions change. Adjust hydration strategies based on exercise intensity, duration, and environmental conditions. Re-measure periodically to account for fitness adaptations.' },
  ];

  return { preExerciseWeight, postExerciseWeight, exerciseDuration, fluidConsumed, sweatLoss, sweatRate, hourlySweatRate, status, interpretation, recommendations, plan };
};

export default function SweatRateCalculatorAthleticUse() {
  const [result, setResult] = useState<ResultPayload | null>(null);

  const form = useForm<FormValues>({
    resolver: zodResolver(formSchema),
    defaultValues: {
      preExerciseWeight: undefined,
      postExerciseWeight: undefined,
      exerciseDuration: undefined,
      fluidConsumed: undefined,
    },
  });

  return (
    <div className="space-y-8">
      <Script id="sweat-rate-athletic-schema" type="application/ld+json" strategy="afterInteractive" dangerouslySetInnerHTML={{ __html: JSON.stringify(schemaMarkup) }} />

      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <Activity className="h-5 w-5" />
            Sweat Rate Calculator (Athletic Use)
          </CardTitle>
          <CardDescription>Calculate sweat rate during athletic exercise to optimize hydration strategies and prevent dehydration.</CardDescription>
        </CardHeader>
      </Card>

      <Card>
        <CardHeader>
          <CardTitle>Input your sweat rate measurement data</CardTitle>
        </CardHeader>
        <CardContent>
          <Form {...form}>
            <form onSubmit={form.handleSubmit((values) => setResult(calculateResult(values)))} className="space-y-6">
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <FormField
                  control={form.control}
                  name="preExerciseWeight"
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel>Pre-exercise weight (kg)</FormLabel>
                      <FormControl>
                        <Input type="number" step="0.1" placeholder="e.g., 70.0" value={field.value ?? ''} onChange={(e) => field.onChange(e.target.value === '' ? undefined : Number(e.target.value))} />
                      </FormControl>
                      <FormMessage />
                    </FormItem>
                  )}
                />
                <FormField
                  control={form.control}
                  name="postExerciseWeight"
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel>Post-exercise weight (kg)</FormLabel>
                      <FormControl>
                        <Input type="number" step="0.1" placeholder="e.g., 69.2" value={field.value ?? ''} onChange={(e) => field.onChange(e.target.value === '' ? undefined : Number(e.target.value))} />
                      </FormControl>
                      <FormMessage />
                    </FormItem>
                  )}
                />
                <FormField
                  control={form.control}
                  name="exerciseDuration"
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel>Exercise duration (minutes)</FormLabel>
                      <FormControl>
                        <Input type="number" step="1" placeholder="e.g., 60" value={field.value ?? ''} onChange={(e) => field.onChange(e.target.value === '' ? undefined : Number(e.target.value))} />
                      </FormControl>
                      <FormMessage />
                    </FormItem>
                  )}
                />
                <FormField
                  control={form.control}
                  name="fluidConsumed"
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel>Fluid consumed during exercise (ml, optional)</FormLabel>
                      <FormControl>
                        <Input type="number" step="50" placeholder="e.g., 500" value={field.value ?? ''} onChange={(e) => field.onChange(e.target.value === '' ? undefined : Number(e.target.value))} />
                      </FormControl>
                      <FormMessage />
                    </FormItem>
                  )}
                />
              </div>
              <Button type="submit" className="w-full md:w-auto">
                Calculate sweat rate
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
            <CardDescription>See sweat loss, sweat rate, and hydration recommendations.</CardDescription>
          </CardHeader>
          <CardContent className="space-y-6">
            <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
              <div className="p-4 border rounded">
                <p className="text-sm text-muted-foreground">Sweat loss</p>
                <p className="text-2xl font-semibold text-primary">{result.sweatLoss.toFixed(0)}</p>
                <p className="text-xs text-muted-foreground">ml total</p>
              </div>
              <div className="p-4 border rounded">
                <p className="text-sm text-muted-foreground">Sweat rate</p>
                <p className="text-2xl font-semibold text-primary">{result.hourlySweatRate.toFixed(2)}</p>
                <p className="text-xs text-muted-foreground">L per hour</p>
              </div>
              <div className="p-4 border rounded">
                <p className="text-sm text-muted-foreground">Hydration target</p>
                <p className="text-2xl font-semibold text-primary">{(result.hourlySweatRate * 0.9).toFixed(2)}</p>
                <p className="text-xs text-muted-foreground">L per hour (90%)</p>
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
            <strong>Sweat loss</strong> = (Pre-Exercise Weight - Post-Exercise Weight) Ã— 1000 + Fluid Consumed. Weight loss in kg is converted to ml (1 kg = 1000 ml), and fluid consumed during exercise is added.
          </p>
          <p>
            <strong>Sweat rate</strong> = Sweat Loss / Exercise Duration (hours). This gives sweat rate in ml per hour. Divide by 1000 to get liters per hour.
          </p>
          <p>
            <strong>Hydration target</strong> = Sweat Rate Ã— 0.8-1.0. Aim to replace 80-100% of sweat loss during exercise to maintain performance and prevent dehydration.
          </p>
          <p>Accurate sweat rate measurement requires weighing before and after exercise under consistent conditions (minimal clothing, after using bathroom). Measure in different conditions (temperature, intensity) to develop comprehensive hydration strategies.</p>
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
                <p className="text-sm text-muted-foreground">Weight loss</p>
                <p className="text-xl font-semibold text-primary">
                  {(result.preExerciseWeight - result.postExerciseWeight).toFixed(2)} kg
                </p>
                <p className="text-xs text-muted-foreground">During exercise</p>
              </div>
              <div className="p-4 border rounded">
                <p className="text-sm text-muted-foreground">Fluid replacement needed</p>
                <p className="text-xl font-semibold text-primary">
                  {(result.sweatLoss * 1.5 / 1000).toFixed(2)} L
                </p>
                <p className="text-xs text-muted-foreground">Post-exercise (150%)</p>
              </div>
              <div className="p-4 border rounded">
                <p className="text-sm text-muted-foreground">Sweat rate category</p>
                <p className="text-xl font-semibold text-primary">
                  {result.hourlySweatRate >= 2.5 ? 'Very High' : result.hourlySweatRate >= 2.0 ? 'High' : result.hourlySweatRate >= 1.0 ? 'Moderate' : 'Normal'}
                </p>
                <p className="text-xs text-muted-foreground">Based on calculation</p>
              </div>
            </div>
          ) : (
            <p className="text-sm text-muted-foreground">Enter your sweat rate measurement data to see additional insights.</p>
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
                <Link href={`/${calc.slug}`} className="text-primary hover:underline">
                  {calc.name}
                </Link>
              </h4>
              <p className="text-sm text-muted-foreground">{calc.description}</p>
            </div>
          ))}
        </CardContent>
      </Card>

      <section className="space-y-6 text-muted-foreground leading-relaxed bg-white p-6 md:p-10 rounded-lg shadow-lg" itemType="https://schema.org/MedicalWebPage">
    <meta itemProp="name" content="The Definitive Guide to Sweat Rate: Optimizing Athletic Hydration Strategies" />
    <meta itemProp="description" content="An expert guide on measuring sweat rate during athletic exercise, developing personalized hydration strategies, and preventing dehydration to maintain performance." />
    <meta itemProp="keywords" content="sweat rate calculator, athletic hydration, exercise dehydration prevention, fluid replacement, sports hydration strategy" />
    <meta itemProp="author" content="[Your Site's Health Team]" />
    <meta itemProp="datePublished" content="2025-12-01" />
    <meta itemProp="url" content="/definitive-sweat-rate-guide" />

    <h1 className="text-3xl md:text-4xl font-extrabold text-foreground mb-4" itemProp="headline">The Definitive Guide to Sweat Rate: Optimizing Athletic Hydration Strategies</h1>
    <p className="text-lg italic text-gray-700">Explore how to measure sweat rate, develop personalized hydration strategies, and prevent dehydration to maintain athletic performance and health.</p>

    <h2 className="text-2xl font-bold text-foreground mt-8 mb-4">Table of Contents: Jump to a Section</h2>
    <ul className="list-disc ml-6 space-y-2 text-blue-600">
        <li><a href="#what-is-sweat-rate" className="hover:underline">What Is Sweat Rate and Why It Matters</a></li>
        <li><a href="#measuring-sweat-rate" className="hover:underline">How to Measure Sweat Rate Accurately</a></li>
        <li><a href="#hydration-strategies" className="hover:underline">Developing Hydration Strategies</a></li>
        <li><a href="#dehydration-prevention" className="hover:underline">Preventing Dehydration</a></li>
        <li><a href="#electrolyte-replacement" className="hover:underline">Electrolyte Replacement</a></li>
    </ul>
<hr />

    <h2 id="what-is-sweat-rate" className="text-2xl font-bold text-foreground pt-8" itemProp="articleSection">What Is Sweat Rate and Why It Matters</h2>
    <p>**Sweat rate** is the amount of fluid you lose through sweating per hour during exercise. Individual sweat rates vary widely (0.5-3.0 L/hour), and knowing your personal sweat rate is crucial for developing effective hydration strategies that maintain performance and prevent dehydration.</p>

<h3 className="text-xl font-semibold text-foreground mt-6">Why Sweat Rate Matters</h3>
<p>Understanding your sweat rate helps you:</p>
<ul>
    <li><b>Prevent dehydration:</b> Replace fluid losses to maintain performance</li>
    <li><b>Optimize performance:</b> Maintain blood volume and thermoregulation</li>
    <li><b>Avoid overhydration:</b> Prevent hyponatremia from excessive fluid intake</li>
    <li><b>Plan hydration:</b> Develop personalized strategies for different conditions</li>
    <li><b>Improve recovery:</b> Optimize post-exercise rehydration</li>
</ul>
<p>Even 2% dehydration (1.4 kg for a 70kg person) can significantly impair performance, making sweat rate knowledge essential for athletes.</p>

<h3 className="text-xl font-semibold text-foreground mt-6">Factors Affecting Sweat Rate</h3>
<p>Sweat rate is influenced by multiple factors:</p>
<ul>
    <li><b>Exercise intensity:</b> Higher intensity increases sweat rate</li>
    <li><b>Environmental temperature:</b> Hotter conditions increase sweat rate</li>
    <li><b>Humidity:</b> High humidity reduces evaporative cooling, increasing perceived heat</li>
    <li><b>Fitness level:</b> Fitter individuals sweat more efficiently and earlier</li>
    <li><b>Body size:</b> Larger individuals typically sweat more</li>
    <li><b>Genetics:</b> Individual variation in sweat gland density and function</li>
    <li><b>Acclimatization:</b> Heat acclimatization increases sweat rate and efficiency</li>
</ul>

<hr />

    <h2 id="measuring-sweat-rate" className="text-2xl font-bold text-foreground pt-8" itemProp="articleSection">How to Measure Sweat Rate Accurately</h2>
    <p>Accurate sweat rate measurement requires careful attention to detail. Follow these steps for reliable results:</p>

    <h3 className="text-xl font-semibold text-foreground mt-6">Measurement Protocol</h3>
    <ol>
        <li><b>Pre-exercise:</b> Weigh yourself in minimal clothing, after using the bathroom, and before exercise. Record weight in kg.</li>
        <li><b>During exercise:</b> Track any fluid consumed (in ml) during the exercise session.</li>
        <li><b>Post-exercise:</b> Immediately after exercise, towel dry and weigh yourself again in the same minimal clothing. Record weight.</li>
        <li><b>Calculate:</b> Sweat Loss = (Pre-Weight - Post-Weight) Ã— 1000 + Fluid Consumed (ml). Sweat Rate = Sweat Loss / Exercise Duration (hours).</li>
    </ol>

    <h3 className="text-xl font-semibold text-foreground mt-6">Tips for Accuracy</h3>
    <ul>
        <li>Use the same scale for both measurements</li>
        <li>Wear minimal, dry clothing (or same clothing for both)</li>
        <li>Measure in similar conditions (temperature, humidity) for consistency</li>
        <li>Measure during typical exercise intensity and duration</li>
        <li>Account for all fluid consumed during exercise</li>
        <li>Measure multiple times in different conditions to develop comprehensive strategies</li>
    </ul>

<hr />

    <h2 id="hydration-strategies" className="text-2xl font-bold text-foreground pt-8" itemProp="articleSection">Developing Hydration Strategies</h2>
    <p>Once you know your sweat rate, you can develop personalized hydration strategies:</p>

    <h3 className="text-xl font-semibold text-foreground mt-6">Fluid Replacement Guidelines</h3>
    <ul>
        <li><b>Target:</b> Replace 80-100% of sweat loss during exercise</li>
        <li><b>Timing:</b> Start drinking 15-20 minutes into exercise, continue every 15-20 minutes</li>
        <li><b>Amount:</b> 150-250ml per 15-20 minutes for most people</li>
        <li><b>Method:</b> Frequent small sips rather than large amounts at once</li>
    </ul>

    <h3 className="text-xl font-semibold text-foreground mt-6">Pre-Exercise Hydration</h3>
    <ul>
        <li>Drink 500ml 1-2 hours before exercise</li>
        <li>Drink 200-300ml 15-20 minutes before exercise</li>
        <li>Ensure you start exercise well-hydrated (pale yellow urine)</li>
    </ul>

    <h3 className="text-xl font-semibold text-foreground mt-6">Post-Exercise Rehydration</h3>
    <ul>
        <li>Replace 150% of sweat loss over 2-4 hours post-exercise</li>
        <li>Include electrolytes (sodium) to enhance fluid retention</li>
        <li>Include carbohydrates to restore glycogen and enhance rehydration</li>
        <li>Monitor urine color as hydration indicator</li>
    </ul>

<hr />

    <h2 id="dehydration-prevention" className="text-2xl font-bold text-foreground pt-8" itemProp="articleSection">Preventing Dehydration</h2>
    <p>Dehydration impairs performance and increases health risks. Prevention is better than treatment:</p>

    <h3 className="text-xl font-semibold text-foreground mt-6">Signs of Dehydration</h3>
    <ul>
        <li>Thirst (though thirst lags behind actual fluid needs)</li>
        <li>Dark yellow urine</li>
        <li>Decreased urine output</li>
        <li>Fatigue and decreased performance</li>
        <li>Increased heart rate</li>
        <li>Dizziness or lightheadedness</li>
        <li>Muscle cramps</li>
    </ul>

    <h3 className="text-xl font-semibold text-foreground mt-6">Performance Impact</h3>
    <p>Dehydration affects performance at various levels:</p>
    <ul>
        <li><b>1% dehydration:</b> Minimal impact</li>
        <li><b>2% dehydration:</b> Noticeable performance decline</li>
        <li><b>3% dehydration:</b> Significant performance impairment</li>
        <li><b>4%+ dehydration:</b> Severe performance decline, increased heat illness risk</li>
    </ul>
    <p>Preventing dehydration through adequate fluid replacement based on sweat rate is essential for optimal performance.</p>

<hr />

    <h2 id="electrolyte-replacement" className="text-2xl font-bold text-foreground pt-8" itemProp="articleSection">Electrolyte Replacement</h2>
    <p>For exercise lasting more than 1-2 hours, or in hot conditions, electrolyte replacement becomes important:</p>

    <h3 className="text-xl font-semibold text-foreground mt-6">Sodium Loss</h3>
    <p>Sweat contains primarily sodium (200-2000mg per liter), with smaller amounts of potassium and other minerals. Sodium loss varies by individual and conditions.</p>

    <h3 className="text-xl font-semibold text-foreground mt-6">When to Replace Electrolytes</h3>
    <ul>
        <li>Exercise lasting more than 1-2 hours</li>
        <li>Hot, humid conditions</li>
        <li>High sweat rates (above 2 L/hour)</li>
        <li>Salty sweaters (visible salt on skin/clothing)</li>
    </ul>

    <h3 className="text-xl font-semibold text-foreground mt-6">Electrolyte Sources</h3>
    <ul>
        <li>Sports drinks (contain sodium, potassium, carbohydrates)</li>
        <li>Electrolyte tablets or powders</li>
        <li>Salty foods post-exercise</li>
        <li>Balanced meals with electrolytes</li>
    </ul>

<hr />

    <h2 className="text-2xl font-bold text-foreground pt-8" itemProp="articleSection">Conclusion</h2>
    <p>Understanding your sweat rate is fundamental to developing effective hydration strategies that maintain performance and prevent dehydration. Measure your sweat rate in different conditions, develop personalized hydration plans, and adjust based on exercise intensity, duration, and environmental factors. Remember: prevention through adequate fluid replacement is always better than treating dehydration. Use this calculator to determine your sweat rate and develop optimal hydration strategies for your athletic activities.</p>
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
          <p>This tool calculates sweat rate during athletic exercise to optimize hydration strategies.</p>
          <p>Outputs include sweat loss, sweat rate, hourly sweat rate, status, recommendations, an action plan, and supporting metrics.</p>
          <p>Formula, steps, guide content, related tools, and FAQs ensure humans or AI assistants can interpret the methodology instantly.</p>
        </CardContent>
      </Card>
    </div>
  );
}


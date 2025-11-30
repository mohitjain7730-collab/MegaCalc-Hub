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
  initialTDEE: z.number({ invalid_type_error: 'Enter initial TDEE' }).min(1000).max(10000),
  currentTDEE: z.number({ invalid_type_error: 'Enter current TDEE' }).min(1000).max(10000),
  weeksInDeficit: z.number({ invalid_type_error: 'Enter weeks in deficit' }).min(1).max(200),
  deficitSize: z.number({ invalid_type_error: 'Enter deficit size' }).min(100).max(3000),
});

type FormValues = z.infer<typeof formSchema>;

type ResultPayload = {
  initialTDEE: number;
  currentTDEE: number;
  weeksInDeficit: number;
  deficitSize: number;
  adaptationRate: number;
  adaptationPercent: number;
  status: 'optimal' | 'good' | 'moderate' | 'low';
  interpretation: string;
  recommendations: string[];
  plan: { label: string; detail: string }[];
};

const steps = [
  'Enter your initial TDEE (Total Daily Energy Expenditure) before starting the diet.',
  'Enter your current TDEE (measured or estimated).',
  'Enter the number of weeks you have been in a calorie deficit.',
  'Enter your daily calorie deficit size (calories below maintenance).',
  'Review metabolic adaptation rate and recommendations.',
];

const faqs = [
  {
    question: 'What is metabolic adaptation?',
    answer:
      'Metabolic adaptation is the body\'s natural response to prolonged calorie restriction, where metabolism slows down to conserve energy. This includes reductions in resting metabolic rate, NEAT (non-exercise activity thermogenesis), and other metabolic processes.',
  },
  {
    question: 'What is a normal metabolic adaptation rate?',
    answer:
      'Metabolic adaptation typically ranges from 5-15% after several weeks of dieting. Rates above 20% indicate significant adaptation that may require diet breaks or reverse dieting. Rates below 5% suggest minimal adaptation.',
  },
  {
    question: 'How does metabolic adaptation affect weight loss?',
    answer:
      'As metabolic adaptation increases, weight loss slows down even with the same calorie deficit. This is why weight loss plateaus occur. Understanding adaptation helps plan diet breaks, refeeds, or reverse dieting strategies.',
  },
  {
    question: 'Can metabolic adaptation be reversed?',
    answer:
      'Yes, metabolic adaptation can be reversed through diet breaks (temporary return to maintenance calories), reverse dieting (gradual calorie increases), or extended maintenance phases. This helps restore metabolic rate.',
  },
  {
    question: 'What factors influence metabolic adaptation?',
    answer:
      'Factors include: duration of deficit, size of deficit, body fat percentage, muscle mass, age, genetics, and activity level. Larger and longer deficits typically cause more adaptation.',
  },
  {
    question: 'When should I take a diet break?',
    answer:
      'Consider diet breaks when adaptation rate exceeds 15-20%, weight loss has stalled for 2+ weeks despite adherence, or you\'ve been dieting for 12+ weeks. Diet breaks of 1-2 weeks at maintenance can help reset metabolism.',
  },
  {
    question: 'What is reverse dieting?',
    answer:
      'Reverse dieting is gradually increasing calories back to maintenance or above after a diet. This helps restore metabolic rate while minimizing fat regain. Typically involves adding 50-150 calories per week.',
  },
  {
    question: 'How do I measure my TDEE?',
    answer:
      'TDEE can be estimated using online calculators, measured through indirect calorimetry, or tracked by monitoring weight changes at different calorie levels. Current TDEE may be lower than initial due to adaptation.',
  },
];

const relatedCalculators = [
  {
    name: 'Reverse Dieting Calorie Increase Planner',
    slug: 'reverse-dieting-calorie-increase-planner',
    description: 'Plan reverse dieting after metabolic adaptation.',
  },
  {
    name: 'Carb Refeed Timing Calculator',
    slug: 'carb-refeed-timing-calculator',
    description: 'Plan carb refeed timing during dieting.',
  },
  {
    name: 'Fat Oxidation Percentage Calculator',
    slug: 'fat-oxidation-percentage-calculator',
    description: 'Understand fuel utilization during exercise.',
  },
  {
    name: 'Glycogen Replenishment Estimator (post-workout)',
    slug: 'glycogen-replenishment-estimator-post-workout',
    description: 'Estimate glycogen needs after training.',
  },
];

const baseUrl = 'https://mycalculating.com/category/health-fitness/metabolic-adaptation-rate-calculator';

const schemaMarkup = {
  '@context': 'https://schema.org',
  '@graph': [
    {
      '@type': 'BreadcrumbList',
      itemListElement: [
        { '@type': 'ListItem', position: 1, name: 'Home', item: 'https://mycalculating.com' },
        { '@type': 'ListItem', position: 2, name: 'Health & Fitness', item: 'https://mycalculating.com/category/health-fitness' },
        { '@type': 'ListItem', position: 3, name: 'Metabolic Adaptation Rate Calculator', item: baseUrl },
      ],
    },
    {
      '@type': 'SoftwareApplication',
      name: 'Metabolic Adaptation Rate Calculator',
      applicationCategory: 'Calculator',
      operatingSystem: 'Web Browser',
      description: 'Calculate metabolic adaptation rate from initial TDEE, current TDEE, weeks in deficit, and deficit size.',
      url: baseUrl,
      offers: { '@type': 'Offer', price: '0', priceCurrency: 'USD' },
    },
  ],
};

const clamp = (value: number, min: number, max: number) => Math.min(max, Math.max(min, value));

const calculateResult = (values: FormValues): ResultPayload => {
  const initialTDEE = values.initialTDEE;
  const currentTDEE = values.currentTDEE;
  const weeksInDeficit = values.weeksInDeficit;
  const deficitSize = values.deficitSize;
  
  // Calculate metabolic adaptation
  // Adaptation = reduction in TDEE beyond what's expected from weight loss
  // Expected reduction from weight loss: ~10-15 calories per pound lost
  // Actual reduction = initialTDEE - currentTDEE
  const tdeeReduction = initialTDEE - currentTDEE;
  
  // Estimate expected reduction from weight loss (assuming ~1-2 lbs/week loss)
  // Rough estimate: 10-15 cal/lb lost, assume 1.5 lbs/week average
  const estimatedWeightLoss = weeksInDeficit * 1.5; // pounds
  const expectedReduction = estimatedWeightLoss * 12; // ~12 cal per pound
  const adaptationAmount = Math.max(0, tdeeReduction - expectedReduction);
  
  // Adaptation rate as percentage of initial TDEE
  const adaptationRate = adaptationAmount;
  const adaptationPercent = initialTDEE > 0 ? (adaptationRate / initialTDEE) * 100 : 0;
  
  let status: ResultPayload['status'] = 'optimal';
  let interpretation = 'Your metabolic adaptation rate is minimal. Your metabolism has adapted well to the calorie deficit, suggesting sustainable dieting practices.';
  
  if (adaptationPercent > 20 || tdeeReduction > initialTDEE * 0.25) {
    status = 'low';
    interpretation = 'Your metabolic adaptation rate is very high. Significant metabolic slowdown has occurred. Consider an immediate diet break or reverse dieting to restore metabolic rate and prevent further adaptation.';
  } else if (adaptationPercent > 15 || tdeeReduction > initialTDEE * 0.2) {
    status = 'moderate';
    interpretation = 'Your metabolic adaptation rate is elevated. Moderate metabolic slowdown has occurred. Consider a diet break or reverse dieting soon to prevent further adaptation and restore metabolic function.';
  } else if (adaptationPercent > 10 || tdeeReduction > initialTDEE * 0.15) {
    status = 'good';
    interpretation = 'Your metabolic adaptation rate is moderate. Some metabolic adaptation has occurred. Monitor closely and consider diet breaks if adaptation continues to increase.';
  } else if (adaptationPercent < 5) {
    status = 'optimal';
    interpretation = 'Your metabolic adaptation rate is minimal. Your metabolism has adapted well, suggesting sustainable dieting practices and good metabolic health.';
  }
  
  const recommendations: string[] = [];
  
  // Adaptation rate recommendations
  if (adaptationPercent > 20) {
    recommendations.push(`Immediate action needed: metabolic adaptation rate (${adaptationPercent.toFixed(1)}%) is very high. Take a 1-2 week diet break at maintenance calories, or begin reverse dieting to restore metabolic rate. This level of adaptation significantly impacts weight loss progress.`);
  } else if (adaptationPercent > 15) {
    recommendations.push(`High adaptation rate (${adaptationPercent.toFixed(1)}%): consider a 1-2 week diet break at maintenance calories or begin reverse dieting. Current TDEE (${currentTDEE} cal) is significantly below initial (${initialTDEE} cal), indicating substantial metabolic slowdown.`);
  } else if (adaptationPercent > 10) {
    recommendations.push(`Moderate adaptation rate (${adaptationPercent.toFixed(1)}%): monitor closely. Consider a diet break if you've been dieting for 12+ weeks or if weight loss has stalled. Current TDEE (${currentTDEE} cal) shows some adaptation from initial (${initialTDEE} cal).`);
  } else if (adaptationPercent > 5) {
    recommendations.push(`Low adaptation rate (${adaptationPercent.toFixed(1)}%): minimal metabolic slowdown. Continue current approach but plan for diet breaks every 12-16 weeks to prevent further adaptation. Current TDEE (${currentTDEE} cal) is close to expected.`);
  } else {
    recommendations.push(`Minimal adaptation rate (${adaptationPercent.toFixed(1)}%): excellent metabolic health. Your metabolism has adapted minimally. Continue current approach with planned diet breaks every 12-16 weeks for sustainability.`);
  }
  
  // Weeks in deficit recommendations
  if (weeksInDeficit > 16) {
    recommendations.push(`Extended dieting period (${weeksInDeficit} weeks): you've been in a deficit for an extended period. Strongly consider a 1-2 week diet break at maintenance to reset metabolism and prevent further adaptation.`);
  } else if (weeksInDeficit > 12) {
    recommendations.push(`Long dieting period (${weeksInDeficit} weeks): consider planning a diet break soon. Extended deficits increase metabolic adaptation risk. A 1-2 week maintenance phase can help reset metabolism.`);
  } else if (weeksInDeficit > 8) {
    recommendations.push(`Moderate dieting period (${weeksInDeficit} weeks): continue monitoring. Plan for a diet break around week 12-16 to prevent excessive adaptation.`);
  } else {
    recommendations.push(`Early dieting phase (${weeksInDeficit} weeks): continue current approach. Plan for diet breaks every 12-16 weeks to maintain metabolic health.`);
  }
  
  // Deficit size recommendations
  if (deficitSize > 1000) {
    recommendations.push(`Large deficit (${deficitSize} cal/day): very aggressive deficits increase metabolic adaptation risk. Consider reducing deficit to 500-750 cal/day to slow adaptation while maintaining progress.`);
  } else if (deficitSize > 750) {
    recommendations.push(`Moderate-large deficit (${deficitSize} cal/day): monitor adaptation closely. Consider reducing to 500-750 cal/day if adaptation continues to increase.`);
  } else if (deficitSize >= 500 && deficitSize <= 750) {
    recommendations.push(`Moderate deficit (${deficitSize} cal/day): good balance between progress and metabolic health. Continue monitoring adaptation rate.`);
  } else {
    recommendations.push(`Small deficit (${deficitSize} cal/day): conservative approach reduces adaptation risk. Progress may be slower but more sustainable long-term.`);
  }
  
  // TDEE comparison recommendations
  if (currentTDEE < initialTDEE * 0.8) {
    recommendations.push(`Significant TDEE reduction: current TDEE (${currentTDEE} cal) is ${((1 - currentTDEE / initialTDEE) * 100).toFixed(1)}% below initial (${initialTDEE} cal). This indicates substantial adaptation. Prioritize diet break or reverse dieting.`);
  } else if (currentTDEE < initialTDEE * 0.9) {
    recommendations.push(`Moderate TDEE reduction: current TDEE (${currentTDEE} cal) is ${((1 - currentTDEE / initialTDEE) * 100).toFixed(1)}% below initial (${initialTDEE} cal). Monitor closely and plan for diet breaks.`);
  } else {
    recommendations.push(`Minimal TDEE reduction: current TDEE (${currentTDEE} cal) is close to initial (${initialTDEE} cal), indicating good metabolic health. Continue current approach.`);
  }
  
  if (status === 'low' || status === 'moderate') {
    recommendations.push('Prioritize metabolic recovery: focus on restoring metabolic rate through diet breaks, reverse dieting, or maintenance phases before continuing aggressive deficits.');
  }
  
  const plan = [
    { label: 'This Week', detail: `Assess metabolic adaptation rate (${adaptationPercent.toFixed(1)}%). If adaptation exceeds 15%, plan immediate diet break or reverse dieting. Monitor TDEE changes and weight loss progress.` },
    { label: 'This Month', detail: `Based on adaptation rate (${adaptationPercent.toFixed(1)}%), implement strategy: diet break if >15%, continue with planned breaks if 10-15%, or maintain current approach if <10%. Track TDEE and adjust as needed.` },
    { label: 'Ongoing', detail: `Maintain metabolic health: plan diet breaks every 12-16 weeks, monitor adaptation rate regularly, and adjust deficit size based on adaptation. Use reverse dieting when needed to restore metabolic rate for long-term success.` },
  ];
  
  return { initialTDEE, currentTDEE, weeksInDeficit, deficitSize, adaptationRate, adaptationPercent, status, interpretation, recommendations, plan };
};

export default function MetabolicAdaptationRateCalculator() {
  const [result, setResult] = useState<ResultPayload | null>(null);
  
  const form = useForm<FormValues>({
    resolver: zodResolver(formSchema),
    defaultValues: {
      initialTDEE: undefined,
      currentTDEE: undefined,
      weeksInDeficit: undefined,
      deficitSize: undefined,
    },
  });
  
  return (
    <div className="space-y-8">
      <Script id="metabolic-adaptation-rate-schema" type="application/ld+json" strategy="afterInteractive" dangerouslySetInnerHTML={{ __html: JSON.stringify(schemaMarkup) }} />
      
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <Activity className="h-5 w-5" />
            Metabolic Adaptation Rate Calculator
          </CardTitle>
          <CardDescription>Calculate metabolic adaptation rate from initial TDEE, current TDEE, weeks in deficit, and deficit size.</CardDescription>
        </CardHeader>
      </Card>
      
      <Card>
        <CardHeader>
          <CardTitle>Input your metabolic data</CardTitle>
        </CardHeader>
        <CardContent>
          <Form {...form}>
            <form onSubmit={form.handleSubmit((values) => setResult(calculateResult(values)))} className="space-y-6">
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <FormField
                  control={form.control}
                  name="initialTDEE"
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel>Initial TDEE (calories/day)</FormLabel>
                      <FormControl>
                        <Input type="number" step="1" placeholder="e.g., 2200" value={field.value ?? ''} onChange={(e) => field.onChange(e.target.value === '' ? undefined : Number(e.target.value))} />
                      </FormControl>
                      <FormMessage />
                    </FormItem>
                  )}
                />
                <FormField
                  control={form.control}
                  name="currentTDEE"
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel>Current TDEE (calories/day)</FormLabel>
                      <FormControl>
                        <Input type="number" step="1" placeholder="e.g., 2000" value={field.value ?? ''} onChange={(e) => field.onChange(e.target.value === '' ? undefined : Number(e.target.value))} />
                      </FormControl>
                      <FormMessage />
                    </FormItem>
                  )}
                />
                <FormField
                  control={form.control}
                  name="weeksInDeficit"
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel>Weeks in deficit</FormLabel>
                      <FormControl>
                        <Input type="number" step="1" placeholder="e.g., 12" value={field.value ?? ''} onChange={(e) => field.onChange(e.target.value === '' ? undefined : Number(e.target.value))} />
                      </FormControl>
                      <FormMessage />
                    </FormItem>
                  )}
                />
                <FormField
                  control={form.control}
                  name="deficitSize"
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel>Daily deficit size (calories)</FormLabel>
                      <FormControl>
                        <Input type="number" step="1" placeholder="e.g., 500" value={field.value ?? ''} onChange={(e) => field.onChange(e.target.value === '' ? undefined : Number(e.target.value))} />
                      </FormControl>
                      <FormMessage />
                    </FormItem>
                  )}
                />
              </div>
              <Button type="submit" className="w-full md:w-auto">
                Calculate metabolic adaptation rate
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
            <CardDescription>See metabolic adaptation rate and recommendations.</CardDescription>
          </CardHeader>
          <CardContent className="space-y-6">
            <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
              <div className="p-4 border rounded">
                <p className="text-sm text-muted-foreground">Adaptation rate</p>
                <p className="text-2xl font-semibold text-primary">{result.adaptationPercent.toFixed(1)}%</p>
                <p className="text-xs text-muted-foreground">Of initial TDEE</p>
              </div>
              <div className="p-4 border rounded">
                <p className="text-sm text-muted-foreground">Adaptation amount</p>
                <p className="text-2xl font-semibold text-primary">{result.adaptationRate.toFixed(0)}</p>
                <p className="text-xs text-muted-foreground">cal/day</p>
              </div>
              <div className="p-4 border rounded">
                <p className="text-sm text-muted-foreground">TDEE reduction</p>
                <p className="text-2xl font-semibold text-primary">{(result.initialTDEE - result.currentTDEE).toFixed(0)}</p>
                <p className="text-xs text-muted-foreground">cal/day</p>
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
            <strong>Metabolic adaptation</strong> = reduction in TDEE beyond what's expected from weight loss. Expected reduction from weight loss: ~10-15 calories per pound lost.
          </p>
          <p>
            <strong>Adaptation amount</strong> = (initial TDEE - current TDEE) - (estimated weight loss × 12 cal/lb). This represents the metabolic slowdown beyond normal weight loss effects.
          </p>
          <p>
            <strong>Adaptation rate</strong> = (adaptation amount / initial TDEE) × 100. Rates above 15-20% indicate significant adaptation requiring diet breaks or reverse dieting.
          </p>
          <p>Metabolic adaptation is the body's natural response to prolonged calorie restriction, where metabolism slows to conserve energy. Understanding adaptation helps plan diet breaks, refeeds, or reverse dieting strategies to restore metabolic rate.</p>
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
                <p className="text-sm text-muted-foreground">Weeks in deficit</p>
                <p className="text-xl font-semibold text-primary">{result.weeksInDeficit}</p>
                <p className="text-xs text-muted-foreground">Diet duration</p>
              </div>
              <div className="p-4 border rounded">
                <p className="text-sm text-muted-foreground">Deficit size</p>
                <p className="text-xl font-semibold text-primary">{result.deficitSize} cal/day</p>
                <p className="text-xs text-muted-foreground">Daily deficit</p>
              </div>
              <div className="p-4 border rounded">
                <p className="text-sm text-muted-foreground">Adaptation status</p>
                <p className="text-xl font-semibold text-primary">
                  {result.adaptationPercent > 20 ? 'Very High' : result.adaptationPercent > 15 ? 'High' : result.adaptationPercent > 10 ? 'Moderate' : result.adaptationPercent > 5 ? 'Low' : 'Minimal'}
                </p>
                <p className="text-xs text-muted-foreground">Based on rate</p>
              </div>
            </div>
          ) : (
            <p className="text-sm text-muted-foreground">Enter your metabolic data to see additional insights.</p>
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

      <section className="space-y-6 text-muted-foreground leading-relaxed bg-white p-6 md:p-10 rounded-lg shadow-lg" itemScope={true} itemType="https://schema.org/MedicalWebPage">
        <meta itemProp="name" content="The Definitive Guide to Metabolic Adaptation: Understanding Metabolic Slowdown During Dieting" />
        <meta itemProp="description" content="An in-depth, authoritative guide on metabolic adaptation during calorie restriction, detailing how the body slows metabolism, factors affecting adaptation, and strategies to minimize and reverse metabolic slowdown." />
        <meta itemProp="keywords" content="metabolic adaptation calculator, metabolic slowdown, adaptive thermogenesis, diet breaks, reverse dieting, TDEE reduction, metabolic rate" />
        <meta itemProp="author" content="[Your Site's Health Team]" />
        <meta itemProp="datePublished" content="2025-12-02" />
        <meta itemProp="url" content="/definitive-metabolic-adaptation-guide" />

        <h1 className="text-3xl md:text-4xl font-extrabold text-foreground mb-4" itemProp="headline">The Definitive Guide to Metabolic Adaptation: Understanding Metabolic Slowdown During Dieting</h1>
        <p className="text-lg italic text-gray-700">Explore how the body adapts to calorie restriction, the mechanisms behind metabolic slowdown, and evidence-based strategies to minimize and reverse adaptation for sustainable weight loss.</p>

        <h2 className="text-2xl font-bold text-foreground mt-8 mb-4">Table of Contents: Jump to a Section</h2>
        <ul className="list-disc ml-6 space-y-2 text-blue-600">
          <li><a href="#what-is" className="hover:underline">What is Metabolic Adaptation?</a></li>
          <li><a href="#mechanisms" className="hover:underline">Mechanisms of Metabolic Adaptation</a></li>
          <li><a href="#factors" className="hover:underline">Factors Affecting Metabolic Adaptation</a></li>
          <li><a href="#prevention" className="hover:underline">Preventing and Minimizing Adaptation</a></li>
          <li><a href="#reversal" className="hover:underline">Reversing Metabolic Adaptation</a></li>
        </ul>
        <hr />

        <h2 id="what-is" className="text-2xl font-bold text-foreground pt-8" itemProp="articleSection">What is Metabolic Adaptation?</h2>
        <p>Metabolic adaptation, also known as adaptive thermogenesis, is the body's natural response to prolonged calorie restriction. When you consistently eat fewer calories than your body needs, your metabolism slows down to conserve energy. This includes reductions in resting metabolic rate (RMR), non-exercise activity thermogenesis (NEAT), and other metabolic processes.</p>

        <h3 className="text-xl font-semibold text-foreground mt-6">Components of Metabolic Adaptation</h3>
        <p>Metabolic adaptation involves several components:</p>
        <ul>
          <li><b>Resting Metabolic Rate (RMR):</b> The calories your body burns at rest decrease, often by 5-15% after extended dieting.</li>
          <li><b>Non-Exercise Activity Thermogenesis (NEAT):</b> Unconscious movements and fidgeting decrease, reducing daily calorie burn by 100-400+ calories.</li>
          <li><b>Thermic Effect of Food (TEF):</b> The energy cost of digesting food decreases slightly with lower food intake.</li>
          <li><b>Exercise Efficiency:</b> The body becomes more efficient at exercise, burning fewer calories for the same work.</li>
        </ul>

        <h2 id="mechanisms" className="text-2xl font-bold text-foreground pt-8" itemProp="articleSection">Mechanisms of Metabolic Adaptation</h2>
        <p>The body adapts to calorie restriction through multiple mechanisms designed to conserve energy and maintain survival during perceived famine conditions.</p>

        <h3 className="text-xl font-semibold text-foreground mt-6">Hormonal Changes</h3>
        <p>Several hormones are affected during dieting:</p>
        <ul>
          <li><b>Leptin:</b> Decreases significantly, signaling energy scarcity and reducing metabolic rate.</li>
          <li><b>Thyroid Hormones:</b> T3 (active thyroid hormone) decreases, slowing metabolism.</li>
          <li><b>Cortisol:</b> May increase, affecting metabolism and body composition.</li>
          <li><b>Insulin:</b> Sensitivity may change, affecting energy utilization.</li>
        </ul>

        <h3 className="text-xl font-semibold text-foreground mt-6">Energy Conservation</h3>
        <p>The body prioritizes energy conservation through reduced movement, lower body temperature, and decreased metabolic processes. This is an evolutionary survival mechanism that helped our ancestors survive periods of food scarcity.</p>

        <h2 id="factors" className="text-2xl font-bold text-foreground pt-8" itemProp="articleSection">Factors Affecting Metabolic Adaptation</h2>
        <p>Several factors influence the degree of metabolic adaptation:</p>
        <ul>
          <li><b>Diet Duration:</b> Longer dieting periods (12+ weeks) increase adaptation risk.</li>
          <li><b>Deficit Size:</b> Larger deficits (1000+ cal/day) cause more adaptation than moderate deficits (500-750 cal/day).</li>
          <li><b>Body Fat Percentage:</b> Lower body fat increases adaptation risk as the body protects remaining fat stores.</li>
          <li><b>Muscle Mass:</b> Higher muscle mass may help maintain metabolic rate.</li>
          <li><b>Age:</b> Older individuals may experience more adaptation.</li>
          <li><b>Genetics:</b> Individual genetic factors influence adaptation rates.</li>
        </ul>

        <h2 id="prevention" className="text-2xl font-bold text-foreground pt-8" itemProp="articleSection">Preventing and Minimizing Adaptation</h2>
        <p>While some adaptation is inevitable, several strategies can minimize its impact:</p>
        <ul>
          <li><b>Moderate Deficits:</b> Use 500-750 calorie deficits instead of 1000+ calorie deficits.</li>
          <li><b>Diet Breaks:</b> Take 1-2 week breaks at maintenance calories every 12-16 weeks.</li>
          <li><b>Refeed Days:</b> Periodic higher-calorie days can help restore leptin and metabolic rate.</li>
          <li><b>Resistance Training:</b> Maintains muscle mass, which supports metabolic rate.</li>
          <li><b>High Protein:</b> Adequate protein (1g/lb bodyweight) preserves muscle and supports metabolism.</li>
          <li><b>Sleep and Stress:</b> Proper sleep and stress management support metabolic health.</li>
        </ul>

        <h2 id="reversal" className="text-2xl font-bold text-foreground pt-8" itemProp="articleSection">Reversing Metabolic Adaptation</h2>
        <p>Metabolic adaptation can be reversed through several approaches:</p>
        <ul>
          <li><b>Diet Breaks:</b> 1-2 weeks at maintenance calories can help reset metabolism.</li>
          <li><b>Reverse Dieting:</b> Gradually increasing calories back to maintenance (50-150 cal/week) helps restore metabolic rate while minimizing fat regain.</li>
          <li><b>Extended Maintenance:</b> Spending time at maintenance calories allows metabolism to recover.</li>
          <li><b>Increased Activity:</b> Building muscle and increasing NEAT can help offset metabolic slowdown.</li>
        </ul>

        <hr />
        <h2 className="text-2xl font-bold text-foreground pt-8" itemProp="articleSection">Conclusion</h2>
        <p>Metabolic adaptation is a natural response to calorie restriction that can significantly impact weight loss progress. Understanding adaptation rates, implementing prevention strategies, and using diet breaks or reverse dieting when needed are essential for sustainable long-term weight management. Monitoring TDEE changes and adaptation rates helps guide when to take breaks or adjust strategies.</p>
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
          <p>This tool calculates metabolic adaptation rate from initial TDEE, current TDEE, weeks in deficit, and deficit size.</p>
          <p>Outputs include adaptation rate, adaptation amount, TDEE reduction, status, recommendations, an action plan, and supporting metrics.</p>
          <p>Formula, steps, guide content, related tools, and FAQs ensure humans or AI assistants can interpret the methodology instantly.</p>
        </CardContent>
      </Card>
    </div>
  );
}

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
  initialTDEE: z.number({ invalid_type_error: 'Enter initial TDEE' }).min(1200).max(5000),
  currentTDEE: z.number({ invalid_type_error: 'Enter current TDEE' }).min(1200).max(5000),
  dietDuration: z.number({ invalid_type_error: 'Enter diet duration' }).min(1).max(52),
  currentDeficit: z.number({ invalid_type_error: 'Enter current deficit' }).min(0).max(2000),
});

type FormValues = z.infer<typeof formSchema>;

type ResultPayload = {
  initialTDEE: number;
  currentTDEE: number;
  dietDuration: number;
  currentDeficit: number;
  metabolicAdaptation: number;
  adaptationPercent: number;
  refeedCalorieOffset: number;
  status: 'optimal' | 'good' | 'moderate' | 'low';
  interpretation: string;
  recommendations: string[];
  plan: { label: string; detail: string }[];
};

const steps = [
  'Enter your initial TDEE (total daily energy expenditure) before dieting.',
  'Enter your current TDEE (measured or estimated).',
  'Enter diet duration (weeks you\'ve been in a deficit).',
  'Enter your current daily calorie deficit.',
  'Review metabolic adaptation, offset needs, and recommendations.',
];

const faqs = [
  {
    question: 'What is adaptive thermogenesis?',
    answer:
      'Adaptive thermogenesis (metabolic adaptation) is your body\'s natural response to prolonged calorie restriction. It reduces energy expenditure through decreased resting metabolic rate, reduced NEAT (non-exercise activity thermogenesis), and improved exercise efficiency. This adaptation can reduce TDEE by 10-20% or more during extended dieting.',
  },
  {
    question: 'How does metabolic adaptation affect fat loss?',
    answer:
      'Metabolic adaptation slows fat loss by reducing the calorie deficit you can maintain. As your TDEE decreases, the same calorie intake creates a smaller deficit, slowing progress. This is why weight loss often plateaus despite continued adherence to a calorie deficit.',
  },
  {
    question: 'How do I measure my current TDEE?',
    answer:
      'Current TDEE can be estimated by tracking weight changes: if you\'re losing 0.5 kg/week on a 2000 kcal diet, your TDEE is approximately 2000 + (0.5 × 7700 / 7) = 2550 kcal. More accurate methods include metabolic testing, but tracking weight changes over 2-4 weeks provides reasonable estimates.',
  },
  {
    question: 'What causes metabolic adaptation?',
    answer:
      'Metabolic adaptation is caused by prolonged calorie deficits, leading to: decreased leptin (affecting hunger and metabolism), reduced thyroid hormones, decreased muscle mass (if protein/strength training inadequate), reduced NEAT (subconscious movement), and improved exercise efficiency (burning fewer calories for same work).',
  },
  {
    question: 'How can I offset metabolic adaptation?',
    answer:
      'Offset metabolic adaptation through: strategic refeed days (restoring leptin and glycogen), diet breaks (1-2 weeks at maintenance), adequate protein intake (preserving muscle mass), strength training (maintaining muscle and metabolic rate), and sufficient sleep (supporting hormone production).',
  },
  {
    question: 'What is a refeed calorie offset?',
    answer:
      'Refeed calorie offset is the additional calories needed during refeed days to partially reverse metabolic adaptation. This calculator estimates how many extra calories above maintenance may help restore metabolic rate, typically 10-30% above maintenance depending on adaptation severity.',
  },
  {
    question: 'How often should I refeed to offset adaptation?',
    answer:
      'Refeed frequency depends on body fat percentage and adaptation severity: 10%+ body fat: every 7-14 days; 8-10%: every 5-7 days; below 8%: every 3-5 days. More severe adaptation or longer dieting periods may require more frequent refeeds or extended diet breaks.',
  },
  {
    question: 'Can metabolic adaptation be reversed?',
    answer:
      'Yes, metabolic adaptation can be partially or fully reversed through: refeed days (short-term restoration), diet breaks (1-2 weeks at maintenance), reverse dieting (gradual calorie increases), and returning to maintenance calories for extended periods. Full reversal may take weeks to months depending on adaptation severity.',
  },
  {
    question: 'What are signs of metabolic adaptation?',
    answer:
      'Signs include: stalled weight loss despite calorie deficit adherence, decreased energy levels, increased hunger, reduced training performance, feeling cold, disrupted sleep, mood changes, and decreased libido. If experiencing multiple signs, metabolic adaptation is likely occurring.',
  },
  {
    question: 'Should I increase calories if I have metabolic adaptation?',
    answer:
      'Yes, but strategically. Consider: refeed days (temporary increases to maintenance or slightly above), diet breaks (1-2 weeks at maintenance), or reverse dieting (gradual increases if body fat is very low). Don\'t immediately return to high calories—gradual increases help prevent rapid weight regain.',
  },
];

const relatedCalculators = [
  {
    name: 'Diet Break Refeed Day Planner Calculator',
    slug: 'diet-break-refeed-day-planner-calculator',
    description: 'Plan strategic refeed days to offset adaptation.',
  },
  {
    name: 'Daily Calorie Needs Calculator',
    slug: 'daily-calorie-needs-calculator',
    description: 'Calculate your current TDEE accurately.',
  },
  {
    name: 'Reverse Dieting Calorie Increase Planner',
    slug: 'reverse-dieting-calorie-increase-planner',
    description: 'Plan gradual calorie increases after dieting.',
  },
  {
    name: 'NEAT Impact Calculator',
    slug: 'neat-impact-calculator',
    description: 'Assess non-exercise activity thermogenesis.',
  },
];

const baseUrl = 'https://mycalculating.com/category/health-fitness/adaptive-thermogenesis-offset-calculator';

const schemaMarkup = {
  '@context': 'https://schema.org',
  '@graph': [
    {
      '@type': 'BreadcrumbList',
      itemListElement: [
        { '@type': 'ListItem', position: 1, name: 'Home', item: 'https://mycalculating.com' },
        { '@type': 'ListItem', position: 2, name: 'Health & Fitness', item: 'https://mycalculating.com/category/health-fitness' },
        { '@type': 'ListItem', position: 3, name: 'Adaptive Thermogenesis Offset Calculator', item: baseUrl },
      ],
    },
    {
      '@type': 'SoftwareApplication',
      name: 'Adaptive Thermogenesis Offset Calculator',
      applicationCategory: 'Calculator',
      operatingSystem: 'Web Browser',
      description: 'Calculate metabolic adaptation and determine refeed calorie offsets to restore metabolic rate.',
      url: baseUrl,
      offers: { '@type': 'Offer', price: '0', priceCurrency: 'USD' },
    },
  ],
};

const clamp = (value: number, min: number, max: number) => Math.min(max, Math.max(min, value));

const calculateResult = (values: FormValues): ResultPayload => {
  const initialTDEE = values.initialTDEE;
  const currentTDEE = values.currentTDEE;
  const dietDuration = values.dietDuration;
  const currentDeficit = values.currentDeficit;
  
  // Calculate metabolic adaptation (TDEE reduction)
  const metabolicAdaptation = initialTDEE - currentTDEE;
  const adaptationPercent = initialTDEE > 0 ? (metabolicAdaptation / initialTDEE) * 100 : 0;
  
  // Estimate refeed calorie offset (10-30% of adaptation, depending on severity)
  // More severe adaptation requires larger refeed offsets
  const refeedOffsetPercent = clamp(adaptationPercent * 0.5, 10, 30); // 50% of adaptation, capped at 30%
  const refeedCalorieOffset = currentTDEE * (refeedOffsetPercent / 100);
  
  let status: ResultPayload['status'] = 'optimal';
  let interpretation = 'Your metabolic adaptation appears minimal. Continue monitoring and implement preventive strategies.';

  if (adaptationPercent >= 20 || metabolicAdaptation >= 400) {
    status = 'low';
    interpretation = 'Your metabolic adaptation is severe. Significant TDEE reduction indicates need for immediate intervention: implement diet break (1-2 weeks at maintenance), increase refeed frequency, or consider reverse dieting if body fat is very low.';
  } else if (adaptationPercent >= 15 || metabolicAdaptation >= 300) {
    status = 'moderate';
    interpretation = 'Your metabolic adaptation is moderate. TDEE reduction is impacting progress. Implement more frequent refeed days (every 5-7 days), consider a short diet break, and ensure adequate protein and strength training to preserve muscle mass.';
  } else if (adaptationPercent >= 10 || metabolicAdaptation >= 200) {
    status = 'good';
    interpretation = 'Your metabolic adaptation is noticeable but manageable. Implement strategic refeed days to prevent further adaptation and restore metabolic hormones. Monitor progress closely.';
  } else {
    status = 'optimal';
    interpretation = 'Your metabolic adaptation is minimal. Continue with current approach, but implement preventive strategies (refeed days, adequate protein, strength training) to maintain metabolic health.';
  }

  const recommendations = [
    'Implement strategic refeed days: schedule refeed days every 5-14 days (depending on body fat) at maintenance or slightly above to restore leptin and metabolic hormones.',
    'Consider a diet break: if adaptation is severe or diet duration exceeds 12 weeks, take a 1-2 week break at maintenance calories to restore metabolic rate.',
  ];
  
  if (adaptationPercent >= 15) {
    recommendations.push('Increase refeed frequency: with moderate-severe adaptation, refeed every 3-7 days may be necessary. More frequent refeeds help restore metabolic hormones more effectively.');
  }
  
  if (dietDuration >= 12) {
    recommendations.push('Plan extended diet break: after 12+ weeks of dieting, a 1-2 week break at maintenance is highly recommended to restore metabolic rate and prevent further adaptation.');
  }
  
  if (metabolicAdaptation >= 300) {
    recommendations.push('Consider reverse dieting: if body fat is very low and adaptation is severe, gradual calorie increases (reverse dieting) may be necessary to restore metabolic health before continuing fat loss.');
  }

  const plan = [
    { label: 'This Week', detail: `Implement refeed days based on calculated offset. Monitor energy, hunger, and training performance. If adaptation is severe, consider starting a diet break.` },
    { label: 'This Month', detail: 'Establish consistent refeed schedule. Track TDEE changes and weight loss progress. Adjust refeed frequency and calories based on metabolic response and adaptation severity.' },
    { label: 'Ongoing', detail: 'Continue monitoring metabolic adaptation. Implement preventive strategies: regular refeed days, adequate protein, strength training, and sufficient sleep. Plan diet breaks every 8-12 weeks if dieting long-term.' },
  ];

  return { initialTDEE, currentTDEE, dietDuration, currentDeficit, metabolicAdaptation, adaptationPercent, refeedCalorieOffset, status, interpretation, recommendations, plan };
};

export default function AdaptiveThermogenesisOffsetCalculator() {
  const [result, setResult] = useState<ResultPayload | null>(null);

  const form = useForm<FormValues>({
    resolver: zodResolver(formSchema),
    defaultValues: {
      initialTDEE: undefined,
      currentTDEE: undefined,
      dietDuration: undefined,
      currentDeficit: undefined,
    },
  });

  return (
    <div className="space-y-8">
      <Script id="adaptive-thermogenesis-offset-schema" type="application/ld+json" strategy="afterInteractive" dangerouslySetInnerHTML={{ __html: JSON.stringify(schemaMarkup) }} />

      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <Activity className="h-5 w-5" />
            Adaptive Thermogenesis Offset Calculator
          </CardTitle>
          <CardDescription>Calculate metabolic adaptation and determine refeed calorie offsets to restore metabolic rate.</CardDescription>
        </CardHeader>
      </Card>

      <Card>
        <CardHeader>
          <CardTitle>Input your metabolic adaptation data</CardTitle>
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
                      <FormLabel>Initial TDEE (kcal/day)</FormLabel>
                      <FormControl>
                        <Input type="number" step="50" placeholder="e.g., 2500" value={field.value ?? ''} onChange={(e) => field.onChange(e.target.value === '' ? undefined : Number(e.target.value))} />
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
                      <FormLabel>Current TDEE (kcal/day)</FormLabel>
                      <FormControl>
                        <Input type="number" step="50" placeholder="e.g., 2200" value={field.value ?? ''} onChange={(e) => field.onChange(e.target.value === '' ? undefined : Number(e.target.value))} />
                      </FormControl>
                      <FormMessage />
                    </FormItem>
                  )}
                />
                <FormField
                  control={form.control}
                  name="dietDuration"
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel>Diet duration (weeks)</FormLabel>
                      <FormControl>
                        <Input type="number" step="1" placeholder="e.g., 8" value={field.value ?? ''} onChange={(e) => field.onChange(e.target.value === '' ? undefined : Number(e.target.value))} />
                      </FormControl>
                      <FormMessage />
                    </FormItem>
                  )}
                />
                <FormField
                  control={form.control}
                  name="currentDeficit"
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel>Current daily deficit (kcal)</FormLabel>
                      <FormControl>
                        <Input type="number" step="50" placeholder="e.g., 500" value={field.value ?? ''} onChange={(e) => field.onChange(e.target.value === '' ? undefined : Number(e.target.value))} />
                      </FormControl>
                      <FormMessage />
                    </FormItem>
                  )}
                />
              </div>
              <Button type="submit" className="w-full md:w-auto">
                Calculate metabolic adaptation
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
            <CardDescription>See metabolic adaptation, offset needs, and recommendations.</CardDescription>
          </CardHeader>
          <CardContent className="space-y-6">
            <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
              <div className="p-4 border rounded">
                <p className="text-sm text-muted-foreground">Metabolic adaptation</p>
                <p className="text-2xl font-semibold text-primary">{result.metabolicAdaptation.toFixed(0)}</p>
                <p className="text-xs text-muted-foreground">kcal/day reduction</p>
              </div>
              <div className="p-4 border rounded">
                <p className="text-sm text-muted-foreground">Adaptation %</p>
                <p className="text-2xl font-semibold text-primary">{result.adaptationPercent.toFixed(1)}%</p>
                <p className="text-xs text-muted-foreground">Of initial TDEE</p>
              </div>
              <div className="p-4 border rounded">
                <p className="text-sm text-muted-foreground">Refeed offset</p>
                <p className="text-2xl font-semibold text-primary">{result.refeedCalorieOffset.toFixed(0)}</p>
                <p className="text-xs text-muted-foreground">kcal above maintenance</p>
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
            <strong>Metabolic adaptation</strong> = Initial TDEE - Current TDEE. This represents the reduction in total daily energy expenditure due to adaptive thermogenesis.
          </p>
          <p>
            <strong>Adaptation percentage</strong> = (Metabolic Adaptation / Initial TDEE) × 100. This shows the percentage reduction in metabolic rate.
          </p>
          <p>
            <strong>Refeed calorie offset</strong> = Current TDEE × (Refeed Offset Percentage / 100). Refeed offset percentage is estimated as 50% of adaptation percentage, capped between 10-30% to provide effective restoration without excessive calories.
          </p>
          <p>Metabolic adaptation increases with longer diet duration and larger deficits. Strategic refeed days and diet breaks help offset adaptation by restoring metabolic hormones and preventing further TDEE reduction.</p>
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
                <p className="text-sm text-muted-foreground">Current effective deficit</p>
                <p className="text-xl font-semibold text-primary">
                  {result.currentDeficit.toFixed(0)} kcal
                </p>
                <p className="text-xs text-muted-foreground">Per day</p>
              </div>
              <div className="p-4 border rounded">
                <p className="text-sm text-muted-foreground">Refeed target calories</p>
                <p className="text-xl font-semibold text-primary">
                  {(result.currentTDEE + result.refeedCalorieOffset).toFixed(0)} kcal
                </p>
                <p className="text-xs text-muted-foreground">On refeed days</p>
              </div>
              <div className="p-4 border rounded">
                <p className="text-sm text-muted-foreground">Adaptation severity</p>
                <p className="text-xl font-semibold text-primary">
                  {result.adaptationPercent >= 20 ? 'Severe' : result.adaptationPercent >= 15 ? 'Moderate' : result.adaptationPercent >= 10 ? 'Mild' : 'Minimal'}
                </p>
                <p className="text-xs text-muted-foreground">Based on percentage</p>
              </div>
            </div>
          ) : (
            <p className="text-sm text-muted-foreground">Enter your metabolic adaptation data to see additional insights.</p>
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

      <section className="space-y-6 text-muted-foreground leading-relaxed bg-white p-6 md:p-10 rounded-lg shadow-lg" itemType="https://schema.org/MedicalWebPage">
    <meta itemProp="name" content="The Definitive Guide to Adaptive Thermogenesis: Understanding and Offsetting Metabolic Adaptation" />
    <meta itemProp="description" content="An expert guide on metabolic adaptation, how it affects fat loss, and strategies to offset adaptive thermogenesis through refeed days, diet breaks, and metabolic restoration." />
    <meta itemProp="keywords" content="adaptive thermogenesis calculator, metabolic adaptation, TDEE reduction, refeed offset, metabolic slowdown, diet break planning" />
    <meta itemProp="author" content="[Your Site's Health Team]" />
    <meta itemProp="datePublished" content="2025-12-01" />
    <meta itemProp="url" content="/definitive-adaptive-thermogenesis-guide" />

    <h1 className="text-3xl md:text-4xl font-extrabold text-foreground mb-4" itemProp="headline">The Definitive Guide to Adaptive Thermogenesis: Understanding and Offsetting Metabolic Adaptation</h1>
    <p className="text-lg italic text-gray-700">Explore the science of metabolic adaptation, how prolonged dieting reduces metabolic rate, and evidence-based strategies to offset adaptive thermogenesis for sustainable fat loss.</p>

    <h2 className="text-2xl font-bold text-foreground mt-8 mb-4">Table of Contents: Jump to a Section</h2>
    <ul className="list-disc ml-6 space-y-2 text-blue-600">
        <li><a href="#what-is-adaptation" className="hover:underline">What Is Adaptive Thermogenesis</a></li>
        <li><a href="#how-it-works" className="hover:underline">How Metabolic Adaptation Works</a></li>
        <li><a href="#measuring-adaptation" className="hover:underline">Measuring Metabolic Adaptation</a></li>
        <li><a href="#offsetting-adaptation" className="hover:underline">Strategies to Offset Adaptation</a></li>
        <li><a href="#refeed-offsets" className="hover:underline">Refeed Calorie Offsets</a></li>
    </ul>
<hr />

    <h2 id="what-is-adaptation" className="text-2xl font-bold text-foreground pt-8" itemProp="articleSection">What Is Adaptive Thermogenesis</h2>
    <p>**Adaptive thermogenesis** (also called metabolic adaptation) is your body's natural survival response to prolonged calorie restriction. It's a complex physiological process that reduces total daily energy expenditure (TDEE) to match reduced energy intake, helping the body conserve energy during perceived "famine" conditions.</p>

<h3 className="text-xl font-semibold text-foreground mt-6">The Survival Mechanism</h3>
<p>When you maintain a calorie deficit, your body doesn't know you're intentionally dieting—it interprets reduced food intake as a potential threat to survival. In response, it activates adaptive mechanisms to:</p>
<ul>
    <li><b>Conserve energy:</b> Reduce metabolic rate to match available energy</li>
    <li><b>Maintain function:</b> Prioritize essential processes over non-essential ones</li>
    <li><b>Preserve stores:</b> Slow fat loss to maintain energy reserves</li>
</ul>
<p>While this adaptation was beneficial for survival in environments with food scarcity, it can significantly slow fat loss progress during intentional dieting.</p>

<h3 className="text-xl font-semibold text-foreground mt-6">Components of Metabolic Adaptation</h3>
<p>Metabolic adaptation occurs through multiple mechanisms:</p>
<ul>
    <li><b>Resting Metabolic Rate (RMR) reduction:</b> Your body burns fewer calories at rest</li>
    <li><b>Non-Exercise Activity Thermogenesis (NEAT) decrease:</b> You subconsciously move less throughout the day</li>
    <li><b>Exercise efficiency improvement:</b> You burn fewer calories for the same exercise</li>
    <li><b>Hormone suppression:</b> Leptin, thyroid hormones, and sex hormones decrease</li>
    <li><b>Muscle mass loss:</b> If protein/strength training inadequate, muscle loss further reduces metabolic rate</li>
</ul>
<p>Together, these adaptations can reduce TDEE by 10-20% or more, making continued fat loss increasingly difficult.</p>

<hr />

    <h2 id="how-it-works" className="text-2xl font-bold text-foreground pt-8" itemProp="articleSection">How Metabolic Adaptation Works</h2>
    <p>Understanding the mechanisms behind metabolic adaptation helps you implement effective strategies to offset it.</p>

    <h3 className="text-xl font-semibold text-foreground mt-6">Hormonal Changes</h3>
    <p>Prolonged calorie restriction triggers significant hormonal changes:</p>
    <ul>
        <li><b>Leptin decrease:</b> Drops by 50% or more, increasing hunger and reducing metabolic rate</li>
        <li><b>Thyroid hormones:</b> T3 (active thyroid hormone) decreases, slowing metabolism</li>
        <li><b>Sex hormones:</b> Testosterone and estrogen decrease, affecting muscle mass and metabolic rate</li>
        <li><b>Cortisol increase:</b> Stress hormone increases, which can promote muscle breakdown</li>
        <li><b>Ghrelin increase:</b> Hunger hormone increases, making adherence difficult</li>
    </ul>

    <h3 className="text-xl font-semibold text-foreground mt-6">Physical Adaptations</h3>
    <p>Your body also adapts physically:</p>
    <ul>
        <li><b>Reduced NEAT:</b> You fidget less, take fewer steps, sit more, and move less throughout the day</li>
        <li><b>Improved exercise efficiency:</b> Your body becomes more efficient at exercise, burning fewer calories for the same work</li>
        <li><b>Muscle loss:</b> If protein intake or strength training is inadequate, muscle loss reduces metabolic rate</li>
        <li><b>Organ size reduction:</b> Some organs may slightly decrease in size, reducing their energy needs</li>
    </ul>

<hr />

    <h2 id="measuring-adaptation" className="text-2xl font-bold text-foreground pt-8" itemProp="articleSection">Measuring Metabolic Adaptation</h2>
    <p>Measuring metabolic adaptation helps you understand its severity and determine appropriate interventions.</p>

    <h3 className="text-xl font-semibold text-foreground mt-6">TDEE Comparison Method</h3>
    <p>The most straightforward method is comparing initial TDEE to current TDEE:</p>
    <ul>
        <li><b>Initial TDEE:</b> Your total daily energy expenditure before starting the diet</li>
        <li><b>Current TDEE:</b> Your current total daily energy expenditure (measured or estimated)</li>
        <li><b>Adaptation:</b> Initial TDEE - Current TDEE = Metabolic Adaptation</li>
    </ul>
    <p>This calculator uses this method to determine adaptation severity and recommend refeed offsets.</p>

    <h3 className="text-xl font-semibold text-foreground mt-6">Estimating Current TDEE</h3>
    <p>Current TDEE can be estimated by tracking weight changes:</p>
    <ul>
        <li>Track weight and calorie intake over 2-4 weeks</li>
        <li>Calculate average weekly weight loss</li>
        <li>Estimate TDEE: Calorie Intake + (Weight Loss kg × 7700 / 7)</li>
        <li>Example: Losing 0.5 kg/week on 2000 kcal diet = TDEE of ~2550 kcal</li>
    </ul>
    <p>More accurate methods include metabolic testing (indirect calorimetry), but tracking provides reasonable estimates for most people.</p>

<hr />

    <h2 id="offsetting-adaptation" className="text-2xl font-bold text-foreground pt-8" itemProp="articleSection">Strategies to Offset Adaptation</h2>
    <p>Several evidence-based strategies can help offset metabolic adaptation and restore metabolic rate:</p>

    <h3 className="text-xl font-semibold text-foreground mt-6">1. Strategic Refeed Days</h3>
    <p>Refeed days temporarily increase calories (typically to maintenance or slightly above) to restore hormones:</p>
    <ul>
        <li>Restore leptin levels through carbohydrate intake</li>
        <li>Improve thyroid function</li>
        <li>Restore glycogen stores</li>
        <li>Provide psychological relief</li>
    </ul>
    <p>Frequency depends on body fat and adaptation severity: every 3-14 days typically.</p>

    <h3 className="text-xl font-semibold text-foreground mt-6">2. Diet Breaks</h3>
    <p>Extended periods (1-2 weeks) at maintenance calories provide more comprehensive metabolic restoration:</p>
    <ul>
        <li>More complete hormone restoration</li>
        <li>Greater metabolic rate recovery</li>
        <li>Psychological reset</li>
        <li>Improved adherence for continued dieting</li>
    </ul>
    <p>Recommended every 8-12 weeks of dieting, or when adaptation becomes severe.</p>

    <h3 className="text-xl font-semibold text-foreground mt-6">3. Adequate Protein and Strength Training</h3>
    <p>Preserving muscle mass is crucial for maintaining metabolic rate:</p>
    <ul>
        <li>Protein: 1.6-2.2g per kg body weight</li>
        <li>Strength training: 2-3 times per week minimum</li>
        <li>Prevents muscle loss that reduces metabolic rate</li>
    </ul>

    <h3 className="text-xl font-semibold text-foreground mt-6">4. Sufficient Sleep</h3>
    <p>Sleep is essential for hormone production and metabolic health:</p>
    <ul>
        <li>Aim for 7-9 hours per night</li>
        <li>Supports leptin, growth hormone, and cortisol regulation</li>
        <li>Poor sleep exacerbates metabolic adaptation</li>
    </ul>

<hr />

    <h2 id="refeed-offsets" className="text-2xl font-bold text-foreground pt-8" itemProp="articleSection">Refeed Calorie Offsets</h2>
    <p>This calculator estimates the calorie offset needed during refeed days to help restore metabolic rate. The offset is based on adaptation severity:</p>

    <h3 className="text-xl font-semibold text-foreground mt-6">How Refeed Offsets Work</h3>
    <p>Refeed calorie offsets are additional calories above maintenance that may help restore metabolic function:</p>
    <ul>
        <li><b>Mild adaptation (5-10%):</b> Refeed at maintenance (0% offset) or 10% above</li>
        <li><b>Moderate adaptation (10-15%):</b> Refeed 10-20% above maintenance</li>
        <li><b>Severe adaptation (15%+):</b> Refeed 20-30% above maintenance, or consider diet break</li>
    </ul>
    <p>The calculator estimates offset as 50% of adaptation percentage, capped at 30% to provide effective restoration without excessive calories.</p>

    <h3 className="text-xl font-semibold text-foreground mt-6">Implementation</h3>
    <p>Use calculated refeed offsets as a starting point:</p>
    <ul>
        <li>Start with calculated offset on refeed days</li>
        <li>Monitor energy, hunger, and training performance</li>
        <li>Adjust based on response and adaptation severity</li>
        <li>If adaptation is severe, consider diet break instead of frequent large refeeds</li>
    </ul>

<hr />

    <h2 className="text-2xl font-bold text-foreground pt-8" itemProp="articleSection">Conclusion</h2>
    <p>Metabolic adaptation is a natural response to prolonged calorie restriction that can significantly slow fat loss progress. Understanding your adaptation level and implementing strategic interventions—refeed days, diet breaks, adequate protein, strength training, and sufficient sleep—can help offset adaptation and restore metabolic health. Use this calculator to assess your adaptation and determine appropriate refeed offsets. Remember: sustainable fat loss requires managing metabolic health, not just maintaining calorie deficits.</p>
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
          <p>This tool calculates metabolic adaptation and determines refeed calorie offsets to restore metabolic rate.</p>
          <p>Outputs include metabolic adaptation, adaptation percentage, refeed calorie offset, status, recommendations, an action plan, and supporting metrics.</p>
          <p>Formula, steps, guide content, related tools, and FAQs ensure humans or AI assistants can interpret the methodology instantly.</p>
        </CardContent>
      </Card>
    </div>
  );
}


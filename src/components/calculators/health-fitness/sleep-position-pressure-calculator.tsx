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
  sleepPosition: z.enum(['back', 'side', 'stomach', 'varied'], {
    invalid_type_error: 'Select sleep position',
  }),
  bodyWeight: z.number({ invalid_type_error: 'Enter body weight' }).min(30).max(300),
  mattressFirmness: z.enum(['soft', 'medium', 'firm'], {
    invalid_type_error: 'Select mattress firmness',
  }),
  pillowHeight: z.enum(['low', 'medium', 'high'], {
    invalid_type_error: 'Select pillow height',
  }),
});

type FormValues = z.infer<typeof formSchema>;

type ResultPayload = {
  sleepPosition: string;
  bodyWeight: number;
  mattressFirmness: string;
  pillowHeight: string;
  pressureScore: number;
  alignmentScore: number;
  status: 'optimal' | 'good' | 'moderate' | 'low';
  interpretation: string;
  recommendations: string[];
  plan: { label: string; detail: string }[];
};

const steps = [
  'Select your primary sleep position (back, side, stomach, or varied).',
  'Enter your body weight (kg) for pressure calculations.',
  'Select your mattress firmness (soft, medium, firm).',
  'Select your pillow height (low, medium, high).',
  'Review pressure score, alignment score, and recommendations.',
];

const faqs = [
  {
    question: 'What is sleep position pressure?',
    answer:
      'Sleep position pressure refers to the pressure points created when your body weight presses against the mattress and pillow during sleep. High pressure points can cause discomfort, pain, poor circulation, and disrupted sleep. Proper sleep position and support help distribute pressure evenly.',
  },
  {
    question: 'Which sleep position is best?',
    answer:
      'Back sleeping is generally considered best for spinal alignment and pressure distribution, but individual preferences and conditions vary. Side sleeping is good for snoring and sleep apnea. Stomach sleeping creates most pressure points and spinal misalignment. The best position is one that maintains neutral spine alignment.',
  },
  {
    question: 'How does body weight affect sleep pressure?',
    answer:
      'Higher body weight increases pressure on contact points (shoulders, hips, back, etc.). Heavier individuals may need firmer mattresses to prevent excessive sinking, while lighter individuals may prefer softer mattresses. Pressure distribution becomes more critical with higher weight.',
  },
  {
    question: 'What mattress firmness is best?',
    answer:
      'Optimal firmness depends on sleep position and body weight: side sleepers often prefer medium-soft, back sleepers prefer medium-firm, stomach sleepers prefer firm. Heavier individuals may need firmer mattresses, while lighter individuals may prefer softer. The goal is proper spinal alignment without pressure points.',
  },
  {
    question: 'How does pillow height affect pressure?',
    answer:
      'Pillow height affects neck alignment and pressure on the cervical spine. Too high or too low pillows create misalignment and pressure. Side sleepers need higher pillows to fill the gap between head and shoulder. Back sleepers need lower pillows. Stomach sleepers need very low or no pillows.',
  },
  {
    question: 'What are common pressure point areas?',
    answer:
      'Common pressure points include: shoulders (side sleeping), hips (side sleeping), lower back (back/stomach sleeping), neck (improper pillow height), and knees (side sleeping without support). These areas can cause pain, numbness, and poor sleep quality.',
  },
  {
    question: 'How can I reduce sleep pressure?',
    answer:
      'Reduce pressure by: using appropriate mattress firmness for your position and weight, choosing correct pillow height, using body pillows or cushions for support, maintaining neutral spine alignment, and changing positions if pressure points develop.',
  },
  {
    question: 'What is spinal alignment in sleep?',
    answer:
      'Spinal alignment means maintaining the natural curves of the spine (cervical, thoracic, lumbar) during sleep. Proper alignment reduces pressure, prevents pain, and supports restful sleep. Misalignment from poor position or support can cause morning stiffness and pain.',
  },
  {
    question: 'Should I change my sleep position?',
    answer:
      'If you experience pain, numbness, or poor sleep quality, consider changing positions. Back sleeping is often recommended for best alignment, but transition gradually. Use pillows for support during transition. Consult healthcare provider if you have specific conditions affecting sleep position.',
  },
  {
    question: 'What about sleep position for specific conditions?',
    answer:
      'Specific conditions may require particular positions: sleep apnea/snoring (side), acid reflux (elevated head/left side), pregnancy (left side), back pain (back with knee support), neck pain (proper pillow height). Consult healthcare provider for personalized recommendations.',
  },
];

const relatedCalculators = [
  {
    name: 'Sleep Debt Calculator',
    slug: 'sleep-debt-calculator-hf',
    description: 'Assess sleep quality and recovery needs.',
  },
  {
    name: 'Circadian Rhythm Disruption Risk Calculator',
    slug: 'circadian-rhythm-disruption-risk-calculator',
    description: 'Evaluate sleep-wake cycle health.',
  },
  {
    name: 'Resting Recovery Day Estimator',
    slug: 'resting-recovery-day-estimator',
    description: 'Assess recovery needs and rest requirements.',
  },
  {
    name: 'Posture Score Calculator',
    slug: 'posture-score-calculator',
    description: 'Evaluate posture and alignment health.',
  },
];

const baseUrl = 'https://mycalculating.com/category/health-fitness/sleep-position-pressure-calculator';

const schemaMarkup = {
  '@context': 'https://schema.org',
  '@graph': [
    {
      '@type': 'BreadcrumbList',
      itemListElement: [
        { '@type': 'ListItem', position: 1, name: 'Home', item: 'https://mycalculating.com' },
        { '@type': 'ListItem', position: 2, name: 'Health & Fitness', item: 'https://mycalculating.com/category/health-fitness' },
        { '@type': 'ListItem', position: 3, name: 'Sleep Position Pressure Calculator', item: baseUrl },
      ],
    },
    {
      '@type': 'SoftwareApplication',
      name: 'Sleep Position Pressure Calculator',
      applicationCategory: 'Calculator',
      operatingSystem: 'Web Browser',
      description: 'Calculate sleep position pressure and spinal alignment to optimize sleep quality and reduce discomfort.',
      url: baseUrl,
      offers: { '@type': 'Offer', price: '0', priceCurrency: 'USD' },
    },
  ],
};

const clamp = (value: number, min: number, max: number) => Math.min(max, Math.max(min, value));

// Position pressure multipliers (lower = less pressure)
const positionPressure: Record<string, number> = {
  back: 0.3, // Best for pressure distribution
  side: 0.5, // Moderate pressure on shoulders/hips
  stomach: 0.8, // Highest pressure, poor alignment
  varied: 0.4, // Varies, but generally better
};

// Alignment scores by position
const positionAlignment: Record<string, number> = {
  back: 90, // Best alignment
  side: 75, // Good with proper support
  stomach: 40, // Poor alignment
  varied: 70, // Varies
};

const calculateResult = (values: FormValues): ResultPayload => {
  const sleepPosition = values.sleepPosition;
  const bodyWeight = values.bodyWeight;
  const mattressFirmness = values.mattressFirmness;
  const pillowHeight = values.pillowHeight;
  
  // Calculate pressure score (0-100, lower is better for pressure, but we'll invert for score)
  const basePressure = positionPressure[sleepPosition] || 0.5;
  const weightFactor = bodyWeight / 100; // Normalize weight
  const firmnessFactor = mattressFirmness === 'soft' ? 1.2 : mattressFirmness === 'firm' ? 0.8 : 1.0;
  
  const pressureValue = basePressure * weightFactor * firmnessFactor;
  const pressureScore = clamp(100 - (pressureValue * 100), 0, 100); // Invert so higher is better
  
  // Calculate alignment score
  let alignmentScore = positionAlignment[sleepPosition] || 70;
  
  // Adjust for pillow height
  if (sleepPosition === 'back') {
    if (pillowHeight === 'low') alignmentScore += 10;
    else if (pillowHeight === 'high') alignmentScore -= 15;
  } else if (sleepPosition === 'side') {
    if (pillowHeight === 'high') alignmentScore += 10;
    else if (pillowHeight === 'low') alignmentScore -= 15;
  } else if (sleepPosition === 'stomach') {
    if (pillowHeight === 'low') alignmentScore += 10;
    else if (pillowHeight === 'high') alignmentScore -= 20;
  }
  
  // Adjust for mattress firmness
  if (sleepPosition === 'back' && mattressFirmness === 'medium') alignmentScore += 5;
  if (sleepPosition === 'side' && mattressFirmness === 'medium') alignmentScore += 5;
  if (sleepPosition === 'stomach' && mattressFirmness === 'firm') alignmentScore += 10;
  
  alignmentScore = clamp(alignmentScore, 0, 100);
  
  // Combined status
  const combinedScore = (pressureScore + alignmentScore) / 2;
  
  let status: ResultPayload['status'] = 'optimal';
  let interpretation = 'Your sleep position and support appear optimal. Continue maintaining good sleep posture and support.';

  if (combinedScore < 40 || sleepPosition === 'stomach') {
    status = 'low';
    interpretation = 'Your sleep position creates high pressure points and/or poor alignment. Stomach sleeping is particularly problematic. Consider transitioning to back or side sleeping with proper support to reduce pressure and improve alignment.';
  } else if (combinedScore < 60) {
    status = 'moderate';
    interpretation = 'Your sleep position has moderate pressure and alignment issues. Consider adjusting pillow height, mattress firmness, or sleep position to improve comfort and spinal alignment.';
  } else if (combinedScore < 80) {
    status = 'good';
    interpretation = 'Your sleep position provides good pressure distribution and alignment. Minor adjustments to pillow or mattress may further optimize your sleep quality.';
  } else {
    status = 'optimal';
    interpretation = 'Your sleep position and support are well-optimized for pressure distribution and spinal alignment. Continue maintaining these practices for optimal sleep quality.';
  }

  const recommendations = [
    'Maintain neutral spine alignment: ensure your head, neck, and spine form a straight line. Use appropriate pillow height for your position—side sleepers need higher pillows, back sleepers need lower pillows.',
    'Distribute pressure evenly: use body pillows or cushions to support pressure points. Side sleepers can place a pillow between knees. Back sleepers can place a pillow under knees.',
  ];
  
  if (sleepPosition === 'stomach') {
    recommendations.push('Consider changing position: stomach sleeping creates the most pressure points and spinal misalignment. Gradually transition to back or side sleeping for better alignment and reduced pressure.');
  }
  
  if (sleepPosition === 'side' && pillowHeight !== 'high') {
    recommendations.push('Increase pillow height for side sleeping: side sleepers need higher pillows to fill the gap between head and shoulder, maintaining proper neck alignment.');
  }
  
  if (sleepPosition === 'back' && pillowHeight === 'high') {
    recommendations.push('Reduce pillow height for back sleeping: back sleepers need lower pillows to maintain neutral neck alignment. High pillows can cause forward head posture and neck strain.');
  }

  const plan = [
    { label: 'This Week', detail: `Assess your current sleep position and support. Monitor for pressure points, morning stiffness, or discomfort. Adjust pillow height and mattress support as needed.` },
    { label: 'This Month', detail: 'Optimize sleep setup: ensure proper pillow height for your position, consider mattress firmness adjustments, and use support pillows (between knees for side sleepers, under knees for back sleepers).' },
    { label: 'Ongoing', detail: 'Maintain optimal sleep position and support. If experiencing persistent pain or discomfort, consider consulting a healthcare provider or sleep specialist. Regularly assess and adjust your sleep setup as needed.' },
  ];

  return { sleepPosition, bodyWeight, mattressFirmness, pillowHeight, pressureScore, alignmentScore, status, interpretation, recommendations, plan };
};

export default function SleepPositionPressureCalculator() {
  const [result, setResult] = useState<ResultPayload | null>(null);

  const form = useForm<FormValues>({
    resolver: zodResolver(formSchema),
    defaultValues: {
      sleepPosition: undefined,
      bodyWeight: undefined,
      mattressFirmness: undefined,
      pillowHeight: undefined,
    },
  });

  return (
    <div className="space-y-8">
      <Script id="sleep-position-pressure-schema" type="application/ld+json" strategy="afterInteractive" dangerouslySetInnerHTML={{ __html: JSON.stringify(schemaMarkup) }} />

      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <Activity className="h-5 w-5" />
            Sleep Position Pressure Calculator
          </CardTitle>
          <CardDescription>Calculate sleep position pressure and spinal alignment to optimize sleep quality and reduce discomfort.</CardDescription>
        </CardHeader>
      </Card>

      <Card>
        <CardHeader>
          <CardTitle>Input your sleep position data</CardTitle>
        </CardHeader>
        <CardContent>
          <Form {...form}>
            <form onSubmit={form.handleSubmit((values) => setResult(calculateResult(values)))} className="space-y-6">
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <FormField
                  control={form.control}
                  name="sleepPosition"
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel>Sleep position</FormLabel>
                      <FormControl>
                        <select
                          value={field.value ?? ''}
                          onChange={(e) => field.onChange(e.target.value as FormValues['sleepPosition'])}
                          className="flex h-10 w-full rounded-md border border-input bg-background px-3 py-2 text-sm ring-offset-background file:border-0 file:bg-transparent file:text-sm file:font-medium placeholder:text-muted-foreground focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2 disabled:cursor-not-allowed disabled:opacity-50"
                        >
                          <option value="">Select position</option>
                          <option value="back">Back</option>
                          <option value="side">Side</option>
                          <option value="stomach">Stomach</option>
                          <option value="varied">Varied</option>
                        </select>
                      </FormControl>
                      <FormMessage />
                    </FormItem>
                  )}
                />
                <FormField
                  control={form.control}
                  name="bodyWeight"
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel>Body weight (kg)</FormLabel>
                      <FormControl>
                        <Input type="number" step="0.1" placeholder="e.g., 70" value={field.value ?? ''} onChange={(e) => field.onChange(e.target.value === '' ? undefined : Number(e.target.value))} />
                      </FormControl>
                      <FormMessage />
                    </FormItem>
                  )}
                />
                <FormField
                  control={form.control}
                  name="mattressFirmness"
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel>Mattress firmness</FormLabel>
                      <FormControl>
                        <select
                          value={field.value ?? ''}
                          onChange={(e) => field.onChange(e.target.value as FormValues['mattressFirmness'])}
                          className="flex h-10 w-full rounded-md border border-input bg-background px-3 py-2 text-sm ring-offset-background file:border-0 file:bg-transparent file:text-sm file:font-medium placeholder:text-muted-foreground focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2 disabled:cursor-not-allowed disabled:opacity-50"
                        >
                          <option value="">Select firmness</option>
                          <option value="soft">Soft</option>
                          <option value="medium">Medium</option>
                          <option value="firm">Firm</option>
                        </select>
                      </FormControl>
                      <FormMessage />
                    </FormItem>
                  )}
                />
                <FormField
                  control={form.control}
                  name="pillowHeight"
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel>Pillow height</FormLabel>
                      <FormControl>
                        <select
                          value={field.value ?? ''}
                          onChange={(e) => field.onChange(e.target.value as FormValues['pillowHeight'])}
                          className="flex h-10 w-full rounded-md border border-input bg-background px-3 py-2 text-sm ring-offset-background file:border-0 file:bg-transparent file:text-sm file:font-medium placeholder:text-muted-foreground focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2 disabled:cursor-not-allowed disabled:opacity-50"
                        >
                          <option value="">Select height</option>
                          <option value="low">Low</option>
                          <option value="medium">Medium</option>
                          <option value="high">High</option>
                        </select>
                      </FormControl>
                      <FormMessage />
                    </FormItem>
                  )}
                />
              </div>
              <Button type="submit" className="w-full md:w-auto">
                Calculate sleep pressure
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
            <CardDescription>See pressure score, alignment score, and recommendations.</CardDescription>
          </CardHeader>
          <CardContent className="space-y-6">
            <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
              <div className="p-4 border rounded">
                <p className="text-sm text-muted-foreground">Pressure score</p>
                <p className="text-2xl font-semibold text-primary">{result.pressureScore.toFixed(1)}</p>
                <p className="text-xs text-muted-foreground">Out of 100</p>
              </div>
              <div className="p-4 border rounded">
                <p className="text-sm text-muted-foreground">Alignment score</p>
                <p className="text-2xl font-semibold text-primary">{result.alignmentScore.toFixed(1)}</p>
                <p className="text-xs text-muted-foreground">Out of 100</p>
              </div>
              <div className="p-4 border rounded">
                <p className="text-sm text-muted-foreground">Combined score</p>
                <p className="text-2xl font-semibold text-primary">{((result.pressureScore + result.alignmentScore) / 2).toFixed(1)}</p>
                <p className="text-xs text-muted-foreground">Average</p>
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
            <strong>Pressure score</strong> = 100 - (Position Pressure × Weight Factor × Firmness Factor × 100). Position pressure: back = 0.3, side = 0.5, stomach = 0.8, varied = 0.4. Lower pressure values indicate better pressure distribution.
          </p>
          <p>
            <strong>Alignment score</strong> = Base Alignment (by position) ± Pillow Adjustments ± Mattress Adjustments. Base alignment: back = 90, side = 75, stomach = 40, varied = 70. Pillow and mattress adjustments optimize for each position.
          </p>
          <p>
            <strong>Combined score</strong> = (Pressure Score + Alignment Score) / 2. This provides overall assessment of sleep position quality, considering both pressure distribution and spinal alignment.
          </p>
          <p>Optimal sleep position minimizes pressure points while maintaining neutral spinal alignment. Back sleeping generally provides best alignment, while side sleeping requires proper pillow height, and stomach sleeping creates most pressure and misalignment.</p>
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
                <p className="text-sm text-muted-foreground">Position quality</p>
                <p className="text-xl font-semibold text-primary">
                  {result.sleepPosition === 'back' ? 'Excellent' : result.sleepPosition === 'side' ? 'Good' : result.sleepPosition === 'varied' ? 'Moderate' : 'Poor'}
                </p>
                <p className="text-xs text-muted-foreground">Based on position</p>
              </div>
              <div className="p-4 border rounded">
                <p className="text-sm text-muted-foreground">Support quality</p>
                <p className="text-xl font-semibold text-primary">
                  {((result.pressureScore + result.alignmentScore) / 2) >= 80 ? 'Optimal' : ((result.pressureScore + result.alignmentScore) / 2) >= 60 ? 'Good' : 'Needs Improvement'}
                </p>
                <p className="text-xs text-muted-foreground">Based on scores</p>
              </div>
              <div className="p-4 border rounded">
                <p className="text-sm text-muted-foreground">Pressure level</p>
                <p className="text-xl font-semibold text-primary">
                  {result.pressureScore >= 80 ? 'Low' : result.pressureScore >= 60 ? 'Moderate' : 'High'}
                </p>
                <p className="text-xs text-muted-foreground">Based on score</p>
              </div>
            </div>
          ) : (
            <p className="text-sm text-muted-foreground">Enter your sleep position data to see additional insights.</p>
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
    <meta itemProp="name" content="The Definitive Guide to Sleep Position Pressure: Optimizing Sleep Quality and Spinal Alignment" />
    <meta itemProp="description" content="An expert guide on sleep position pressure, spinal alignment, and strategies to optimize sleep quality through proper positioning and support." />
    <meta itemProp="keywords" content="sleep position calculator, sleep pressure points, spinal alignment sleep, sleep posture, mattress firmness, pillow height" />
    <meta itemProp="author" content="[Your Site's Health Team]" />
    <meta itemProp="datePublished" content="2025-12-01" />
    <meta itemProp="url" content="/definitive-sleep-position-pressure-guide" />

    <h1 className="text-3xl md:text-4xl font-extrabold text-foreground mb-4" itemProp="headline">The Definitive Guide to Sleep Position Pressure: Optimizing Sleep Quality and Spinal Alignment</h1>
    <p className="text-lg italic text-gray-700">Explore how sleep position affects pressure distribution and spinal alignment, and learn strategies to optimize your sleep setup for better rest and reduced discomfort.</p>

    <h2 className="text-2xl font-bold text-foreground mt-8 mb-4">Table of Contents: Jump to a Section</h2>
    <ul className="list-disc ml-6 space-y-2 text-blue-600">
        <li><a href="#what-is-pressure" className="hover:underline">What Is Sleep Position Pressure</a></li>
        <li><a href="#sleep-positions" className="hover:underline">Understanding Different Sleep Positions</a></li>
        <li><a href="#spinal-alignment" className="hover:underline">Spinal Alignment in Sleep</a></li>
        <li><a href="#mattress-pillow" className="hover:underline">Mattress and Pillow Selection</a></li>
        <li><a href="#optimizing-sleep" className="hover:underline">Optimizing Your Sleep Setup</a></li>
    </ul>
<hr />

    <h2 id="what-is-pressure" className="text-2xl font-bold text-foreground pt-8" itemProp="articleSection">What Is Sleep Position Pressure</h2>
    <p>**Sleep position pressure** refers to the pressure points created when your body weight presses against the mattress and pillow during sleep. These pressure points can cause discomfort, pain, poor circulation, numbness, and disrupted sleep if not properly managed.</p>

<h3 className="text-xl font-semibold text-foreground mt-6">Why Pressure Matters</h3>
<p>High pressure points during sleep can lead to:</p>
<ul>
    <li><b>Discomfort and pain:</b> Pressure on shoulders, hips, or other areas</li>
    <li><b>Poor circulation:</b> Reduced blood flow to compressed areas</li>
    <li><b>Numbness and tingling:</b> Nerve compression from pressure</li>
    <li><b>Disrupted sleep:</b> Waking to change positions due to discomfort</li>
    <li><b>Morning stiffness:</b> Poor alignment and pressure during sleep</li>
    <li><b>Long-term issues:</b> Chronic pain and postural problems</li>
</ul>
<p>Proper sleep position and support help distribute pressure evenly, reducing these issues.</p>

<h3 className="text-xl font-semibold text-foreground mt-6">Common Pressure Points</h3>
<p>Different sleep positions create pressure on different areas:</p>
<ul>
    <li><b>Side sleeping:</b> Shoulders and hips bear most weight</li>
    <li><b>Back sleeping:</b> Lower back and heels may experience pressure</li>
    <li><b>Stomach sleeping:</b> Face, chest, and front of body experience pressure</li>
    <li><b>All positions:</b> Neck alignment depends on pillow height</li>
</ul>

<hr />

    <h2 id="sleep-positions" className="text-2xl font-bold text-foreground pt-8" itemProp="articleSection">Understanding Different Sleep Positions</h2>
    <p>Each sleep position has unique characteristics affecting pressure and alignment:</p>

    <h3 className="text-xl font-semibold text-foreground mt-6">Back Sleeping (Supine)</h3>
    <p><b>Advantages:</b></p>
    <ul>
        <li>Best spinal alignment when properly supported</li>
        <li>Even pressure distribution</li>
        <li>Reduces acid reflux (with head elevation)</li>
        <li>Minimizes wrinkles and skin pressure</li>
    </ul>
    <p><b>Considerations:</b></p>
    <ul>
        <li>May worsen snoring and sleep apnea</li>
        <li>Requires proper pillow height (low to medium)</li>
        <li>Pillow under knees can help lower back</li>
    </ul>

    <h3 className="text-xl font-semibold text-foreground mt-6">Side Sleeping (Lateral)</h3>
    <p><b>Advantages:</b></p>
    <ul>
        <li>Good for snoring and sleep apnea</li>
        <li>Reduces acid reflux (left side preferred)</li>
        <li>Good for pregnancy (left side)</li>
    </ul>
    <p><b>Considerations:</b></p>
    <ul>
        <li>Pressure on shoulders and hips</li>
        <li>Requires higher pillow to fill head-shoulder gap</li>
        <li>Pillow between knees improves alignment</li>
        <li>May cause arm numbness if arm is under head</li>
    </ul>

    <h3 className="text-xl font-semibold text-foreground mt-6">Stomach Sleeping (Prone)</h3>
    <p><b>Advantages:</b></p>
    <ul>
        <li>May reduce snoring</li>
    </ul>
    <p><b>Disadvantages:</b></p>
    <ul>
        <li>Highest pressure points (face, chest)</li>
        <li>Poor spinal alignment (neck twisted, back arched)</li>
        <li>Can cause neck and back pain</li>
        <li>Requires very low or no pillow</li>
        <li>Generally not recommended</li>
    </ul>

<hr />

    <h2 id="spinal-alignment" className="text-2xl font-bold text-foreground pt-8" itemProp="articleSection">Spinal Alignment in Sleep</h2>
    <p>Proper spinal alignment during sleep maintains the natural curves of the spine and reduces pressure:</p>

    <h3 className="text-xl font-semibold text-foreground mt-6">Neutral Spine Position</h3>
    <p>Neutral spine means maintaining natural curves:</p>
    <ul>
        <li><b>Cervical curve:</b> Slight forward curve in neck</li>
        <li><b>Thoracic curve:</b> Slight backward curve in upper back</li>
        <li><b>Lumbar curve:</b> Slight forward curve in lower back</li>
    </ul>
    <p>Proper alignment reduces pressure, prevents pain, and supports restful sleep.</p>

    <h3 className="text-xl font-semibold text-foreground mt-6">Alignment by Position</h3>
    <ul>
        <li><b>Back sleeping:</b> Best alignment when pillow supports natural neck curve</li>
        <li><b>Side sleeping:</b> Good alignment when pillow fills head-shoulder gap and knees are supported</li>
        <li><b>Stomach sleeping:</b> Poor alignment due to neck rotation and back arching</li>
    </ul>

<hr />

    <h2 id="mattress-pillow" className="text-2xl font-bold text-foreground pt-8" itemProp="articleSection">Mattress and Pillow Selection</h2>
    <p>Proper mattress and pillow selection is crucial for pressure distribution and alignment:</p>

    <h3 className="text-xl font-semibold text-foreground mt-6">Mattress Firmness</h3>
    <ul>
        <li><b>Side sleepers:</b> Medium-soft to medium (allows shoulder/hip to sink slightly)</li>
        <li><b>Back sleepers:</b> Medium-firm (supports spine without excessive sinking)</li>
        <li><b>Stomach sleepers:</b> Firm (prevents excessive sinking and arching)</li>
        <li><b>Heavier individuals:</b> May need firmer mattresses</li>
        <li><b>Lighter individuals:</b> May prefer softer mattresses</li>
    </ul>

    <h3 className="text-xl font-semibold text-foreground mt-6">Pillow Height</h3>
    <ul>
        <li><b>Back sleepers:</b> Low to medium height (supports natural neck curve)</li>
        <li><b>Side sleepers:</b> Higher pillow (fills gap between head and shoulder)</li>
        <li><b>Stomach sleepers:</b> Very low or no pillow (minimizes neck rotation)</li>
    </ul>

<hr />

    <h2 id="optimizing-sleep" className="text-2xl font-bold text-foreground pt-8" itemProp="articleSection">Optimizing Your Sleep Setup</h2>
    <p>Optimize your sleep for better pressure distribution and alignment:</p>

    <h3 className="text-xl font-semibold text-foreground mt-6">1. Choose Appropriate Position</h3>
    <p>Back or side sleeping generally provides best pressure distribution and alignment. If you must sleep on stomach, use very low pillow and consider gradual transition to side or back.</p>

    <h3 className="text-xl font-semibold text-foreground mt-6">2. Use Support Pillows</h3>
    <ul>
        <li>Side sleepers: Pillow between knees maintains hip alignment</li>
        <li>Back sleepers: Pillow under knees supports lower back</li>
        <li>Body pillows: Provide additional support and pressure relief</li>
    </ul>

    <h3 className="text-xl font-semibold text-foreground mt-6">3. Adjust Pillow Height</h3>
    <p>Ensure pillow height maintains neutral neck alignment for your position. Too high or too low creates misalignment and pressure.</p>

    <h3 className="text-xl font-semibold text-foreground mt-6">4. Consider Mattress Quality</h3>
    <p>Invest in quality mattress that supports your position and weight. Memory foam, latex, or hybrid mattresses can provide better pressure relief than traditional innerspring.</p>

<hr />

    <h2 className="text-2xl font-bold text-foreground pt-8" itemProp="articleSection">Conclusion</h2>
    <p>Sleep position pressure and spinal alignment significantly affect sleep quality and long-term health. By understanding how your sleep position, mattress firmness, and pillow height affect pressure and alignment, you can optimize your sleep setup for better rest and reduced discomfort. Use this calculator to assess your current setup and make adjustments for optimal sleep quality. Remember: the best sleep position is one that maintains neutral spine alignment while minimizing pressure points.</p>
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
          <p>This tool calculates sleep position pressure and spinal alignment based on sleep position, body weight, mattress firmness, and pillow height.</p>
          <p>Outputs include pressure score, alignment score, status, recommendations, an action plan, and supporting metrics.</p>
          <p>Formula, steps, guide content, related tools, and FAQs ensure humans or AI assistants can interpret the methodology instantly.</p>
        </CardContent>
      </Card>
    </div>
  );
}


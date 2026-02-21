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
  screenTime: z.number({ invalid_type_error: 'Enter screen time' }).min(0).max(16),
  eyeStrainLevel: z.number({ invalid_type_error: 'Select eye strain level' }).min(1).max(5),
  blinkRate: z.number({ invalid_type_error: 'Enter blink rate' }).min(5).max(30),
  lightingConditions: z.number({ invalid_type_error: 'Select lighting conditions' }).min(1).max(5),
  screenDistance: z.number({ invalid_type_error: 'Enter screen distance' }).min(12).max(40),
});

type FormValues = z.infer<typeof formSchema>;

type ResultPayload = {
  screenTime: number;
  eyeStrainLevel: number;
  blinkRate: number;
  lightingConditions: number;
  screenDistance: number;
  strainIndex: number;
  strainPercent: number;
  status: 'optimal' | 'good' | 'moderate' | 'low';
  interpretation: string;
  recommendations: string[];
  plan: { label: string; detail: string }[];
};

const steps = [
  'Enter daily screen time (hours).',
  'Rate your eye strain level (1=no strain, 5=severe strain).',
  'Enter your blink rate per minute (normal: 15-20).',
  'Rate lighting conditions (1=poor, 5=optimal).',
  'Enter screen distance in inches (recommended: 20-26 inches).',
  'Review strain index, status, and recommendations.',
];

const faqs = [
  {
    question: 'What is digital eye strain?',
    answer:
      'Digital eye strain (also called computer vision syndrome) is discomfort from prolonged screen use, including symptoms like eye fatigue, dryness, blurred vision, headaches, and neck/shoulder pain. It affects up to 90% of people who use screens for 2+ hours daily.',
  },
  {
    question: 'What causes digital eye strain?',
    answer:
      'Digital eye strain is caused by: prolonged screen use, reduced blink rate (normally 15-20/min, drops to 5-7/min with screens), glare and poor lighting, improper screen distance, poor screen ergonomics, blue light exposure, and uncorrected vision problems.',
  },
  {
    question: 'How does screen time affect eye strain?',
    answer:
      'More screen time increases eye strain risk: 2-4 hours daily causes mild strain, 4-8 hours moderate, 8+ hours severe. Continuous use without breaks causes cumulative fatigue. The 20-20-20 rule (every 20 minutes, look at something 20 feet away for 20 seconds) helps reduce strain.',
  },
  {
    question: 'What is the normal blink rate?',
    answer:
      'Normal blink rate is 15-20 blinks per minute. Screen use reduces this to 5-7 blinks per minute, causing dry eyes, irritation, and discomfort. Blinking spreads tears across the eye surface, keeping it moist and healthy.',
  },
  {
    question: 'How does screen distance affect eye strain?',
    answer:
      'Optimal screen distance is 20-26 inches (50-65 cm) from eyes. Screens too close cause eye muscle fatigue, screens too far cause squinting and strain. Poor distance forces eyes to work harder to focus, leading to headaches and fatigue.',
  },
  {
    question: 'What are the symptoms of digital eye strain?',
    answer:
      'Symptoms include: eye fatigue, dry or irritated eyes, blurred vision, difficulty focusing, headaches, neck and shoulder pain, sensitivity to light, and difficulty sleeping. Symptoms worsen with longer screen time and poor ergonomics.',
  },
  {
    question: 'How can I reduce digital eye strain?',
    answer:
      'Reduce strain by: following the 20-20-20 rule, ensuring proper screen distance (20-26 inches), optimizing lighting (reduce glare, avoid harsh contrasts), increasing blink rate, using blue light filters, adjusting screen brightness, and taking regular breaks.',
  },
  {
    question: 'What about blue light?',
    answer:
      'Blue light from screens can disrupt sleep and cause eye strain, though research is mixed on direct eye damage. Use blue light filters, night mode settings, or blue light glasses, especially in evening hours. Limit screen use 1-2 hours before bed.',
  },
  {
    question: 'How do lighting conditions affect eye strain?',
    answer:
      'Poor lighting increases strain: harsh overhead lights cause glare, bright backgrounds with dark screens cause contrast issues, dark rooms with bright screens cause eye fatigue. Optimal lighting: ambient light similar to screen brightness, no glare, soft lighting.',
  },
  {
    question: 'When should I see an eye doctor?',
    answer:
      'See an eye doctor if you experience persistent eye strain, blurred vision, headaches, dry eyes that don\'t improve with breaks, need vision correction, or symptoms worsen despite ergonomic improvements. Regular eye exams help detect issues early.',
  },
];

const relatedCalculators = [
  {
    name: 'Daily Screen Time Impact Calculator',
    slug: 'daily-screen-time-impact-calculator',
    description: 'Assess overall screen time impact on health.',
  },
  {
    name: 'Blue Light Exposure Calculator',
    slug: 'blue-light-exposure-calculator',
    description: 'Calculate blue light exposure from screens.',
  },
  {
    name: 'Screen-to-Sleep Time Impact Estimator',
    slug: 'screen-to-sleep-time-impact-estimator',
    description: 'Assess screen use impact on sleep.',
  },
  {
    name: 'Microbreak Frequency Calculator for Desk Jobs',
    slug: 'microbreak-frequency-calculator-for-desk-jobs',
    description: 'Calculate optimal break frequency for desk workers.',
  },
];

const baseUrl = 'https://mycalculating.com/health-fitness/digital-eye-strain-severity-index';

const schemaMarkup = {
  '@context': 'https://schema.org',
  '@graph': [
    {
      '@type': 'BreadcrumbList',
      itemListElement: [
        { '@type': 'ListItem', position: 1, name: 'Home', item: 'https://mycalculating.com' },
        { '@type': 'ListItem', position: 2, name: 'Health & Fitness', item: 'https://mycalculating.com/health-fitness' },
        { '@type': 'ListItem', position: 3, name: 'Digital Eye Strain Severity Index', item: baseUrl },
      ],
    },
    {
      '@type': 'SoftwareApplication',
      name: 'Digital Eye Strain Wellness Index',
      applicationCategory: 'Calculator',
      operatingSystem: 'Web Browser',
      description: 'Calculate digital eye strain severity index from screen time, eye strain level, blink rate, lighting conditions, and screen distance.',
      url: baseUrl,
      offers: { '@type': 'Offer', price: '0', priceCurrency: 'USD' },
    },
  ],
};

const clamp = (value: number, min: number, max: number) => Math.min(max, Math.max(min, value));

const calculateResult = (values: FormValues): ResultPayload => {
  const screenTime = values.screenTime;
  const eyeStrainLevel = values.eyeStrainLevel;
  const blinkRate = values.blinkRate;
  const lightingConditions = values.lightingConditions;
  const screenDistance = values.screenDistance;
  
  // Calculate strain index: combination of screen time, eye strain level, reduced blink rate, poor lighting, and suboptimal distance
  const screenTimeFactor = (screenTime / 16) * 40; // 0-40 points
  const strainLevelFactor = ((eyeStrainLevel - 1) / 4) * 30; // 0-30 points
  const blinkRateFactor = blinkRate < 10 ? ((10 - blinkRate) / 5) * 15 : 0; // 0-15 points (penalty for low blink rate)
  const lightingFactor = ((5 - lightingConditions) / 4) * 10; // 0-10 points (penalty for poor lighting)
  const distanceFactor = screenDistance < 18 || screenDistance > 30 ? 5 : 0; // 0-5 points (penalty for poor distance)
  
  // Calculate strain index (0-100 scale, higher = more strain)
  const strainIndex = clamp(screenTimeFactor + strainLevelFactor + blinkRateFactor + lightingFactor + distanceFactor, 0, 100);
  const strainPercent = strainIndex;
  
  let status: ResultPayload['status'] = 'optimal';
  let interpretation = 'This suggests a general lifestyle tendency where your digital eye strain index may be low. You may have good screen habits and ergonomics.';

  if (strainIndex >= 70 || screenTime >= 12 || eyeStrainLevel >= 4) {
    status = 'low';
    interpretation = 'This suggests a general lifestyle tendency where your digital eye strain index may be high, indicating areas for improvement. Prolonged screen use, reduced blinking, poor lighting, or improper distance may be causing eye fatigue and discomfort. You may consider focusing on improvements in ergonomics, breaks, and screen habits. You may also consider seeking professional guidance if needed. This is a personal insight, not a medical evaluation.';
  } else if (strainIndex >= 50 || screenTime >= 8 || eyeStrainLevel >= 3) {
    status = 'moderate';
    interpretation = 'This suggests a general lifestyle tendency where your digital eye strain index may be moderate. Extended screen use, suboptimal ergonomics, or reduced blinking may be contributing to eye discomfort. You may consider focusing on breaks, proper distance, lighting, and increasing blink rate.';
  } else if (strainIndex >= 30) {
    status = 'good';
    interpretation = 'This suggests a general lifestyle tendency where your digital eye strain index may be acceptable but could be improved. Some screen use habits or ergonomic factors may contribute to occasional eye fatigue. You may consider optimizing lighting, distance, and break frequency.';
  } else {
    status = 'optimal';
    interpretation = 'This suggests a general lifestyle tendency where your digital eye strain index may be low. You may have good screen habits, proper distance, adequate lighting, and regular breaks. You may consider continuing these practices to maintain eye health.';
  }

  const recommendations = [
    'Follow the 20-20-20 rule: every 20 minutes, look at something 20 feet away for 20 seconds. This gives eye muscles a break and reduces fatigue. Set reminders to ensure regular breaks.',
    'Optimize screen ergonomics: position screen 20-26 inches from eyes, top of screen at or slightly below eye level, reduce glare with proper lighting, and adjust screen brightness to match ambient light.',
  ];
  
  if (blinkRate < 12) {
    recommendations.push('Increase blink rate: screen use reduces blinking from 15-20/min to 5-7/min. Consciously blink more frequently, use eye drops if needed, and take breaks to rest eyes and restore normal blinking.');
  }
  
  if (screenTime >= 8) {
    recommendations.push('Reduce screen time: with 8+ hours daily, prioritize breaks, use screen-free activities, and consider task rotation to reduce continuous screen exposure. Consider voice-to-text and other screen alternatives when possible.');
  }
  
  if (lightingConditions < 3) {
    recommendations.push('Improve lighting: reduce glare with proper ambient lighting, use matte screen filters, position screen perpendicular to windows, and ensure screen brightness matches surroundings. Avoid bright overhead lights directly above screen.');
  }
  
  if (screenDistance < 18 || screenDistance > 30) {
    recommendations.push('Adjust screen distance: position screen 20-26 inches from eyes. Too close causes eye muscle fatigue, too far causes squinting. Measure and adjust your setup for optimal distance.');
  }

  const plan = [
    { label: 'This Week', detail: `Assess your current screen habits and ergonomics. Implement the 20-20-20 rule with reminders. Adjust screen distance to 20-26 inches. Optimize lighting to reduce glare. Increase conscious blinking throughout the day.` },
    { label: 'This Month', detail: 'Establish consistent break schedule. Use blue light filters, especially in evening. Adjust screen brightness and contrast for comfort. Consider ergonomic workstation improvements (monitor stand, lighting). Use eye drops if experiencing dryness.' },
    { label: 'Ongoing', detail: 'Maintain healthy screen habits and ergonomics. Take regular breaks and follow 20-20-20 rule. Monitor eye strain symptoms and adjust as needed. Schedule regular eye exams. Limit screen use 1-2 hours before bed for better sleep.' },
  ];

  return { screenTime, eyeStrainLevel, blinkRate, lightingConditions, screenDistance, strainIndex, strainPercent, status, interpretation, recommendations, plan };
};

export default function DigitalEyeStrainSeverityIndex() {
  const [result, setResult] = useState<ResultPayload | null>(null);

  const form = useForm<FormValues>({
    resolver: zodResolver(formSchema),
    defaultValues: {
      screenTime: undefined,
      eyeStrainLevel: undefined,
      blinkRate: undefined,
      lightingConditions: undefined,
      screenDistance: undefined,
    },
  });

  return (
    <div className="space-y-8">
      <Script id="digital-eye-strain-schema" type="application/ld+json" strategy="afterInteractive" dangerouslySetInnerHTML={{ __html: JSON.stringify(schemaMarkup) }} />

      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <Activity className="h-5 w-5" />
            Digital Eye Strain Severity Index
          </CardTitle>
          <CardDescription>Get general wellness insights about digital eye strain index from screen time, eye strain level, blink rate, lighting conditions, and screen distance. This is a personal lifestyle insight, not a medical evaluation.</CardDescription>
        </CardHeader>
      </Card>

      <Card>
        <CardHeader>
          <CardTitle>Input your screen usage data</CardTitle>
        </CardHeader>
        <CardContent>
          <Form {...form}>
            <form onSubmit={form.handleSubmit((values) => setResult(calculateResult(values)))} className="space-y-6">
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <FormField
                  control={form.control}
                  name="screenTime"
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel>Daily screen time (hours)</FormLabel>
                      <FormControl>
                        <Input type="number" step="0.5" placeholder="e.g., 8" value={field.value ?? ''} onChange={(e) => field.onChange(e.target.value === '' ? undefined : Number(e.target.value))} />
                      </FormControl>
                      <FormMessage />
                    </FormItem>
                  )}
                />
                <FormField
                  control={form.control}
                  name="eyeStrainLevel"
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel>Eye strain level (1-5: 1=none, 5=severe)</FormLabel>
                      <FormControl>
                        <Input type="number" step="1" min="1" max="5" placeholder="e.g., 3" value={field.value ?? ''} onChange={(e) => field.onChange(e.target.value === '' ? undefined : Number(e.target.value))} />
                      </FormControl>
                      <FormMessage />
                    </FormItem>
                  )}
                />
                <FormField
                  control={form.control}
                  name="blinkRate"
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel>Blink rate (blinks per minute, normal: 15-20)</FormLabel>
                      <FormControl>
                        <Input type="number" step="1" placeholder="e.g., 12" value={field.value ?? ''} onChange={(e) => field.onChange(e.target.value === '' ? undefined : Number(e.target.value))} />
                      </FormControl>
                      <FormMessage />
                    </FormItem>
                  )}
                />
                <FormField
                  control={form.control}
                  name="lightingConditions"
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel>Lighting conditions (1-5: 1=poor, 5=optimal)</FormLabel>
                      <FormControl>
                        <Input type="number" step="1" min="1" max="5" placeholder="e.g., 3" value={field.value ?? ''} onChange={(e) => field.onChange(e.target.value === '' ? undefined : Number(e.target.value))} />
                      </FormControl>
                      <FormMessage />
                    </FormItem>
                  )}
                />
                <FormField
                  control={form.control}
                  name="screenDistance"
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel>Screen distance (inches, recommended: 20-26)</FormLabel>
                      <FormControl>
                        <Input type="number" step="1" placeholder="e.g., 24" value={field.value ?? ''} onChange={(e) => field.onChange(e.target.value === '' ? undefined : Number(e.target.value))} />
                      </FormControl>
                      <FormMessage />
                    </FormItem>
                  )}
                />
              </div>
              <Button type="submit" className="w-full md:w-auto">
                Calculate strain index
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
            <CardDescription>See strain index, status, and recommendations.</CardDescription>
          </CardHeader>
          <CardContent className="space-y-6">
            <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
              <div className="p-4 border rounded">
                <p className="text-sm text-muted-foreground">Strain index</p>
                <p className="text-2xl font-semibold text-primary">{result.strainIndex.toFixed(1)}</p>
                <p className="text-xs text-muted-foreground">Out of 100</p>
              </div>
              <div className="p-4 border rounded">
                <p className="text-sm text-muted-foreground">Screen time</p>
                <p className="text-2xl font-semibold text-primary">{result.screenTime.toFixed(1)}</p>
                <p className="text-xs text-muted-foreground">Hours per day</p>
              </div>
              <div className="p-4 border rounded">
                <p className="text-sm text-muted-foreground">Blink rate</p>
                <p className="text-2xl font-semibold text-primary">{result.blinkRate.toFixed(0)}</p>
                <p className="text-xs text-muted-foreground">Blinks per minute</p>
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
            <strong>Screen time factor</strong> = (Screen Time / 16) Ã— 40. Contributes 0-40 points based on daily screen hours. More screen time increases strain risk.
          </p>
          <p>
            <strong>Strain level factor</strong> = ((Eye Strain Level - 1) / 4) Ã— 30. Contributes 0-30 points based on self-reported strain (1-5 scale). Higher self-reported strain increases index.
          </p>
          <p>
            <strong>Blink rate factor</strong> = (10 - Blink Rate) / 5 Ã— 15, if Blink Rate &lt; 10, else 0. Penalty of 0-15 points for reduced blinking. Normal blink rate is 15-20/min, screen use reduces this significantly.
          </p>
          <p>
            <strong>Lighting factor</strong> = ((5 - Lighting Conditions) / 4) Ã— 10. Penalty of 0-10 points for poor lighting (1-5 scale). Optimal lighting reduces glare and contrast issues.
          </p>
          <p>
            <strong>Distance factor</strong> = 5 if Screen Distance &lt; 18 or &gt; 30 inches, else 0. Penalty for suboptimal screen distance. Optimal distance is 20-26 inches.
          </p>
          <p>
            <strong>Strain index</strong> = Screen Time Factor + Strain Level Factor + Blink Rate Factor + Lighting Factor + Distance Factor, normalized to 0-100 scale. Higher scores indicate greater eye strain risk from prolonged screen use, reduced blinking, poor ergonomics, or suboptimal lighting.
          </p>
          <p>Digital eye strain affects up to 90% of screen users. The 20-20-20 rule, proper ergonomics, adequate blinking, and optimal lighting are key to reducing strain and maintaining eye health.</p>
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
                <p className="text-sm text-muted-foreground">Eye strain level</p>
                <p className="text-xl font-semibold text-primary">
                  {result.eyeStrainLevel}/5
                </p>
                <p className="text-xs text-muted-foreground">Self-reported</p>
              </div>
              <div className="p-4 border rounded">
                <p className="text-sm text-muted-foreground">Lighting quality</p>
                <p className="text-xl font-semibold text-primary">
                  {result.lightingConditions}/5
                </p>
                <p className="text-xs text-muted-foreground">Rating</p>
              </div>
              <div className="p-4 border rounded">
                <p className="text-sm text-muted-foreground">Screen distance</p>
                <p className="text-xl font-semibold text-primary">
                  {result.screenDistance.toFixed(0)}"
                </p>
                <p className="text-xs text-muted-foreground">From eyes</p>
              </div>
            </div>
          ) : (
            <p className="text-sm text-muted-foreground">Enter your screen usage data to see additional insights.</p>
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
    <meta itemProp="name" content="The Definitive Guide to Digital Eye Strain: Understanding and Preventing Computer Vision Syndrome" />
    <meta itemProp="description" content="An expert guide on digital eye strain, its causes, symptoms, and evidence-based strategies to reduce eye fatigue, improve ergonomics, and maintain eye health with screen use." />
    <meta itemProp="keywords" content="digital eye strain, computer vision syndrome, eye strain calculator, screen time, blink rate, eye ergonomics, blue light" />
    <meta itemProp="author" content="[Your Site's Health Team]" />
    <meta itemProp="datePublished" content="2025-12-01" />
    <meta itemProp="url" content="/definitive-digital-eye-strain-guide" />

    <h1 className="text-3xl md:text-4xl font-extrabold text-foreground mb-4" itemProp="headline">The Definitive Guide to Digital Eye Strain: Understanding and Preventing Computer Vision Syndrome</h1>
    <p className="text-lg italic text-gray-700">Explore digital eye strain, its causes, symptoms, and evidence-based strategies to reduce eye fatigue, improve screen ergonomics, and maintain eye health with prolonged screen use.</p>

    <h2 className="text-2xl font-bold text-foreground mt-8 mb-4">Table of Contents: Jump to a Section</h2>
    <ul className="list-disc ml-6 space-y-2 text-blue-600">
        <li><a href="#what-is-eye-strain" className="hover:underline">What Is Digital Eye Strain</a></li>
        <li><a href="#causes" className="hover:underline">Causes of Digital Eye Strain</a></li>
        <li><a href="#symptoms" className="hover:underline">Symptoms and Impact</a></li>
        <li><a href="#prevention" className="hover:underline">Prevention Strategies</a></li>
        <li><a href="#ergonomics" className="hover:underline">Screen Ergonomics</a></li>
    </ul>
<hr />

    <h2 id="what-is-eye-strain" className="text-2xl font-bold text-foreground pt-8" itemProp="articleSection">What Is Digital Eye Strain</h2>
    <p>**Digital eye strain** (also called computer vision syndrome) is discomfort and vision problems from prolonged use of digital screens. It affects up to 90% of people who use screens for 2+ hours daily, including computers, smartphones, tablets, and TVs.</p>

<h3 className="text-xl font-semibold text-foreground mt-6">Key Characteristics</h3>
<p>Digital eye strain includes:</p>
<ul>
    <li><b>Eye fatigue:</b> Tired, strained eyes from prolonged focus</li>
    <li><b>Dry eyes:</b> Reduced blinking leads to insufficient tear production</li>
    <li><b>Blurred vision:</b> Difficulty maintaining focus</li>
    <li><b>Headaches:</b> Eye strain triggers tension headaches</li>
    <li><b>Neck and shoulder pain:</b> Poor posture from screen positioning</li>
    <li><b>Light sensitivity:</b> Increased sensitivity to bright lights</li>
</ul>

<hr />

    <h2 id="causes" className="text-2xl font-bold text-foreground pt-8" itemProp="articleSection">Causes of Digital Eye Strain</h2>
    <p>Multiple factors contribute to digital eye strain:</p>

    <h3 className="text-xl font-semibold text-foreground mt-6">Reduced Blink Rate</h3>
    <ul>
        <li>Normal blink rate: 15-20 blinks per minute</li>
        <li>Screen use reduces to 5-7 blinks per minute</li>
        <li>Leads to dry eyes, irritation, and discomfort</li>
        <li>Blinking spreads tears and keeps eyes moist</li>
    </ul>

    <h3 className="text-xl font-semibold text-foreground mt-6">Screen Distance and Focus</h3>
    <ul>
        <li>Optimal distance: 20-26 inches (50-65 cm)</li>
        <li>Screens too close cause eye muscle fatigue</li>
        <li>Screens too far cause squinting and strain</li>
        <li>Continuous near-focus work fatigues eye muscles</li>
    </ul>

    <h3 className="text-xl font-semibold text-foreground mt-6">Glare and Lighting</h3>
    <ul>
        <li>Glare from bright overhead lights</li>
        <li>Harsh contrasts between screen and background</li>
        <li>Dark rooms with bright screens cause eye fatigue</li>
        <li>Optimal: ambient light similar to screen brightness</li>
    </ul>

    <h3 className="text-xl font-semibold text-foreground mt-6">Blue Light</h3>
    <ul>
        <li>Blue light from screens can disrupt sleep</li>
        <li>May contribute to eye strain (research mixed)</li>
        <li>Especially problematic in evening hours</li>
        <li>Blue light filters and night mode help</li>
    </ul>

<hr />

    <h2 id="symptoms" className="text-2xl font-bold text-foreground pt-8" itemProp="articleSection">Symptoms and Impact</h2>
    <p>Symptoms worsen with longer screen time and poor ergonomics:</p>

    <h3 className="text-xl font-semibold text-foreground mt-6">Common Symptoms</h3>
    <ul>
        <li>Eye fatigue and tired eyes</li>
        <li>Dry, irritated, or burning eyes</li>
        <li>Blurred or double vision</li>
        <li>Difficulty focusing</li>
        <li>Headaches</li>
        <li>Neck and shoulder pain</li>
        <li>Light sensitivity</li>
        <li>Difficulty sleeping (from evening screen use)</li>
    </ul>

<hr />

    <h2 id="prevention" className="text-2xl font-bold text-foreground pt-8" itemProp="articleSection">Prevention Strategies</h2>
    <p>Key strategies to reduce digital eye strain:</p>

    <h3 className="text-xl font-semibold text-foreground mt-6">20-20-20 Rule</h3>
    <ul>
        <li>Every 20 minutes, look at something 20 feet away for 20 seconds</li>
        <li>Gives eye muscles a break</li>
        <li>Set reminders or use apps</li>
        <li>Reduces cumulative eye fatigue</li>
    </ul>

    <h3 className="text-xl font-semibold text-foreground mt-6">Increase Blink Rate</h3>
    <ul>
        <li>Consciously blink more frequently</li>
        <li>Use artificial tears if needed</li>
        <li>Take breaks to rest eyes</li>
        <li>Restore normal blinking patterns</li>
    </ul>

    <h3 className="text-xl font-semibold text-foreground mt-6">Blue Light Management</h3>
    <ul>
        <li>Use blue light filters or night mode</li>
        <li>Consider blue light glasses</li>
        <li>Limit screen use 1-2 hours before bed</li>
        <li>Especially important in evening hours</li>
    </ul>

<hr />

    <h2 id="ergonomics" className="text-2xl font-bold text-foreground pt-8" itemProp="articleSection">Screen Ergonomics</h2>
    <p>Proper ergonomics reduce eye strain:</p>

    <h3 className="text-xl font-semibold text-foreground mt-6">Screen Position</h3>
    <ul>
        <li>Distance: 20-26 inches from eyes</li>
        <li>Top of screen at or slightly below eye level</li>
        <li>Avoid looking up or down excessively</li>
        <li>Position to minimize neck strain</li>
    </ul>

    <h3 className="text-xl font-semibold text-foreground mt-6">Lighting</h3>
    <ul>
        <li>Reduce glare with proper ambient lighting</li>
        <li>Use matte screen filters</li>
        <li>Position screen perpendicular to windows</li>
        <li>Ensure screen brightness matches surroundings</li>
    </ul>

    <h3 className="text-xl font-semibold text-foreground mt-6">Screen Settings</h3>
    <ul>
        <li>Adjust brightness to match ambient light</li>
        <li>Increase text size if needed</li>
        <li>Use high contrast settings</li>
        <li>Enable night mode in evening</li>
    </ul>

<hr />

    <h2 className="text-2xl font-bold text-foreground pt-8" itemProp="articleSection">Conclusion</h2>
    <p>Digital eye strain is common but preventable. By following the 20-20-20 rule, optimizing screen ergonomics, increasing blink rate, managing lighting, and using blue light filters, you can reduce eye strain and maintain eye health. Use this calculator to assess your eye strain risk and identify areas for improvement. Remember: small changes in screen habits and ergonomics can make a significant difference in eye comfort and health.</p>
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
          <p>This tool provides general wellness insights about digital eye strain index from screen time, eye strain level, blink rate, lighting conditions, and screen distance. This is a personal lifestyle insight, not a medical evaluation.</p>
          <p>Outputs include strain index, status, recommendations, an action plan, and supporting metrics.</p>
          <p>Formula, steps, guide content, related tools, and FAQs ensure humans or AI assistants can interpret the methodology instantly.</p>
        </CardContent>
      </Card>

      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <Shield className="h-5 w-5" />
            Disclaimer
          </CardTitle>
        </CardHeader>
        <CardContent className="text-sm text-muted-foreground">
          <p>Disclaimer: This tool provides general wellness and lifestyle insights for educational purposes only. It is not a medical or psychological diagnosis. For any health concerns, please consult a qualified professional.</p>
        </CardContent>
      </Card>
    </div>
  );
}



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
  headPosition: z.number({ invalid_type_error: 'Select head position' }).min(1).max(5),
  shoulderAlignment: z.number({ invalid_type_error: 'Select shoulder alignment' }).min(1).max(5),
  backPosture: z.number({ invalid_type_error: 'Select back posture' }).min(1).max(5),
  sittingDuration: z.number({ invalid_type_error: 'Enter sitting duration' }).min(0).max(12),
  deskSetup: z.number({ invalid_type_error: 'Select desk setup quality' }).min(1).max(5),
});

type FormValues = z.infer<typeof formSchema>;

type ResultPayload = {
  headPosition: number;
  shoulderAlignment: number;
  backPosture: number;
  sittingDuration: number;
  deskSetup: number;
  postureScore: number;
  posturePercent: number;
  status: 'optimal' | 'good' | 'moderate' | 'low';
  interpretation: string;
  recommendations: string[];
  plan: { label: string; detail: string }[];
};

const steps = [
  'Rate your head position (1=poor forward head, 5=neutral alignment).',
  'Rate your shoulder alignment (1=rounded forward, 5=relaxed and aligned).',
  'Rate your back posture (1=slouched, 5=upright with natural curve).',
  'Enter average daily sitting duration (hours).',
  'Rate your desk setup quality (1=poor ergonomics, 5=optimal ergonomics).',
  'Review posture score, status, and recommendations.',
];

const faqs = [
  {
    question: 'What is good posture?',
    answer:
      'Good posture maintains the natural curves of your spine: head aligned over shoulders (not forward), shoulders relaxed and aligned (not rounded forward), back upright with natural S-curve, hips level, and feet flat. Good posture distributes weight evenly and reduces stress on muscles and joints.',
  },
  {
    question: 'Why is posture important?',
    answer:
      'Good posture prevents musculoskeletal disorders (neck, back, shoulder pain), reduces muscle fatigue, improves breathing and circulation, prevents joint wear, maintains spinal alignment, and supports overall health. Poor posture leads to chronic pain, decreased mobility, and long-term health issues.',
  },
  {
    question: 'How does sitting duration affect posture?',
    answer:
      'Prolonged sitting increases risk of poor posture: muscles fatigue, maintaining good posture becomes difficult, forward head and rounded shoulders develop, back slouches, and pain increases. More than 6-8 hours of daily sitting significantly increases posture-related issues. Regular breaks are essential.',
  },
  {
    question: 'What causes poor posture?',
    answer:
      'Poor posture is caused by: prolonged sitting, poor ergonomic setup, muscle imbalances, weak core muscles, tight muscles (chest, hip flexors), weak back muscles, forward head position from screens, rounded shoulders, and lack of awareness of body position.',
  },
  {
    question: 'How can I improve my posture?',
    answer:
      'Improve posture through: proper ergonomic setup (monitor at eye level, feet flat, back supported), regular breaks from sitting, strengthening exercises (core, back, posterior chain), stretching (chest, hip flexors, neck), posture awareness exercises, and maintaining active lifestyle.',
  },
  {
    question: 'What is forward head posture?',
    answer:
      'Forward head posture occurs when the head protrudes forward from the shoulders, creating strain on neck muscles and upper back. It\'s common with screen use and poor ergonomics. Every inch of forward head adds 10 pounds of extra weight on the neck, leading to pain and dysfunction.',
  },
  {
    question: 'How does desk setup affect posture?',
    answer:
      'Poor desk setup forces poor posture: monitor too low causes forward head, keyboard/mouse too high causes rounded shoulders, chair too low causes slouching, no back support causes back fatigue. Optimal ergonomic setup supports good posture automatically by positioning body correctly.',
  },
  {
    question: 'Can posture be corrected?',
    answer:
      'Yes, posture can be improved with: awareness and correction exercises, ergonomic adjustments, strengthening weak muscles, stretching tight muscles, regular breaks and movement, and consistent practice. Improvement takes weeks to months, but changes are achievable with dedication.',
  },
  {
    question: 'What are signs of poor posture?',
    answer:
      'Signs include: forward head position, rounded shoulders, slouched back, neck pain, back pain, shoulder tension, headaches, reduced flexibility, muscle fatigue, and visible postural deviations. Pain in neck, upper back, or shoulders often indicates postural issues.',
  },
  {
    question: 'When should I consult a healthcare provider?',
    answer:
      'You may consider seeking professional guidance if you experience persistent discomfort, postural patterns, or postural issues affecting daily activities. Physical therapists and chiropractors may help with postural guidance. This is a personal insight, not a medical evaluation.',
  },
];

const relatedCalculators = [
  {
    name: 'Sleep Position Pressure Calculator',
    slug: 'sleep-position-pressure-calculator',
    description: 'Assess sleeping posture and pressure points.',
  },
  {
    name: 'Occupational Sedentary Risk Score Calculator',
    slug: 'occupational-sedentary-risk-score-calculator',
    description: 'Evaluate sedentary work risks.',
  },
  {
    name: 'Microbreak Frequency Calculator for Desk Jobs',
    slug: 'microbreak-frequency-calculator-for-desk-jobs',
    description: 'Calculate optimal break frequency for desk workers.',
  },
  {
    name: 'Resting Recovery Day Estimator',
    slug: 'resting-recovery-day-estimator',
    description: 'Assess recovery needs and rest requirements.',
  },
];

const baseUrl = 'https://mycalculating.com/health-fitness/posture-score-calculator';

const schemaMarkup = {
  '@context': 'https://schema.org',
  '@graph': [
    {
      '@type': 'BreadcrumbList',
      itemListElement: [
        { '@type': 'ListItem', position: 1, name: 'Home', item: 'https://mycalculating.com' },
        { '@type': 'ListItem', position: 2, name: 'Health & Fitness', item: 'https://mycalculating.com/health-fitness' },
        { '@type': 'ListItem', position: 3, name: 'Posture Wellness Score Calculator', item: baseUrl },
      ],
    },
    {
      '@type': 'SoftwareApplication',
      name: 'Posture Wellness Score Calculator',
      applicationCategory: 'Calculator',
      operatingSystem: 'Web Browser',
      description: 'Calculate posture score from head position, shoulder alignment, back posture, sitting duration, and desk setup quality.',
      url: baseUrl,
      offers: { '@type': 'Offer', price: '0', priceCurrency: 'USD' },
    },
  ],
};

const clamp = (value: number, min: number, max: number) => Math.min(max, Math.max(min, value));

const calculateResult = (values: FormValues): ResultPayload => {
  const headPosition = values.headPosition;
  const shoulderAlignment = values.shoulderAlignment;
  const backPosture = values.backPosture;
  const sittingDuration = values.sittingDuration;
  const deskSetup = values.deskSetup;
  
  // Calculate posture score: average of postural factors, adjusted for sitting duration and desk setup
  const posturalAverage = (headPosition + shoulderAlignment + backPosture) / 3; // 1-5 scale
  
  // Adjust for sitting duration (more sitting = penalty)
  const sittingPenalty = sittingDuration >= 10 ? 1.5 : sittingDuration >= 8 ? 1.0 : sittingDuration >= 6 ? 0.5 : 0;
  
  // Desk setup multiplier (better setup = bonus)
  const deskMultiplier = (deskSetup - 3) * 0.1; // -0.2 to +0.2
  
  // Calculate posture score (0-100 scale)
  const postureScore = clamp(((posturalAverage - sittingPenalty + deskMultiplier) / 5) * 100, 0, 100);
  const posturePercent = postureScore;
  
  let status: ResultPayload['status'] = 'optimal';
  let interpretation = 'This suggests a general lifestyle tendency where your posture score may appear excellent. You may consider continuing to maintain good postural habits and ergonomic practices.';

  if (postureScore < 40 || posturalAverage < 2 || sittingDuration >= 10) {
    status = 'low';
    interpretation = 'This suggests a general lifestyle tendency where your posture score may be low, indicating areas for improvement. Forward head, rounded shoulders, slouched back, or excessive sitting may be contributing to discomfort. You may consider focusing on ergonomic improvements, exercises, and seeking professional guidance if needed. This is a personal insight, not a medical evaluation.';
  } else if (postureScore < 60 || posturalAverage < 3 || sittingDuration >= 8) {
    status = 'moderate';
    interpretation = 'This suggests a general lifestyle tendency where your posture score may be moderate. Some postural deviations (forward head, rounded shoulders, or slouching) combined with prolonged sitting may be contributing to discomfort. You may consider focusing on ergonomic improvements, regular breaks, and postural exercises.';
  } else if (postureScore < 75) {
    status = 'good';
    interpretation = 'This suggests a general lifestyle tendency where your posture score may be good but has room for improvement. Minor postural issues or extended sitting may be contributing to occasional discomfort. You may consider continuing ergonomic practices and postural awareness exercises to optimize posture.';
  } else {
    status = 'optimal';
    interpretation = 'This suggests a general lifestyle tendency where your posture score may be excellent. You may be maintaining good postural alignment, reasonable sitting duration, and proper ergonomic setup. You may consider continuing these practices to maintain long-term postural health.';
  }

  const recommendations = [
    'Improve ergonomic setup: ensure monitor is at eye level, keyboard/mouse at elbow height, feet flat on floor, back supported, and chair adjusted for optimal posture. Proper ergonomics support good posture automatically.',
    'Take regular breaks: break up prolonged sitting every 20-30 minutes. Stand up, move, stretch, and reset your posture. Use microbreaks to prevent postural fatigue and maintain alignment throughout the day.',
  ];
  
  if (posturalAverage < 3) {
    recommendations.push('Address postural deviations: if you have forward head, rounded shoulders, or slouched back, focus on specific exercises: strengthen core and back muscles, stretch chest and hip flexors, and practice postural awareness exercises daily.');
  }
  
  if (sittingDuration >= 8) {
    recommendations.push('Reduce sitting time: with 8+ hours of daily sitting, prioritize movement: use standing desk, take walking breaks, have walking meetings, and incorporate movement into your routine to reduce postural stress.');
  }
  
  if (deskSetup < 3) {
    recommendations.push('Optimize desk setup: poor ergonomic setup forces poor posture. Invest in proper chair, monitor stand, keyboard tray, and workstation adjustments. Consider ergonomic assessment for optimal setup.');
  }

  const plan = [
    { label: 'This Week', detail: `Assess your current posture and identify specific issues (forward head, rounded shoulders, slouching). Make basic ergonomic adjustments to your workstation. Start awareness exercises to notice and correct posture throughout the day.` },
    { label: 'This Month', detail: 'Implement comprehensive ergonomic improvements. Establish regular break schedule (every 20-30 minutes). Begin strengthening exercises (core, back) and stretching (chest, hip flexors). Practice postural awareness and correction daily.' },
    { label: 'Ongoing', detail: 'You may consider maintaining ergonomic setup and regular breaks. Continue postural exercises and stretching routine. Monitor posture regularly and adjust as needed. You may consider seeking professional guidance (physical therapist, chiropractor) if patterns persist or worsen. This is a personal insight, not a medical evaluation.' },
  ];

  return { headPosition, shoulderAlignment, backPosture, sittingDuration, deskSetup, postureScore, posturePercent, status, interpretation, recommendations, plan };
};

export default function PostureScoreCalculator() {
  const [result, setResult] = useState<ResultPayload | null>(null);

  const form = useForm<FormValues>({
    resolver: zodResolver(formSchema),
    defaultValues: {
      headPosition: undefined,
      shoulderAlignment: undefined,
      backPosture: undefined,
      sittingDuration: undefined,
      deskSetup: undefined,
    },
  });

  return (
    <div className="space-y-8">
      <Script id="posture-score-schema" type="application/ld+json" strategy="afterInteractive" dangerouslySetInnerHTML={{ __html: JSON.stringify(schemaMarkup) }} />

      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <Activity className="h-5 w-5" />
            Posture Score Calculator
          </CardTitle>
          <CardDescription>Get general wellness insights about posture score from head position, shoulder alignment, back posture, sitting duration, and desk setup quality. This is a personal lifestyle insight, not a medical evaluation.</CardDescription>
        </CardHeader>
      </Card>

      <Card>
        <CardHeader>
          <CardTitle>Input your posture assessment data</CardTitle>
        </CardHeader>
        <CardContent>
          <Form {...form}>
            <form onSubmit={form.handleSubmit((values) => setResult(calculateResult(values)))} className="space-y-6">
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <FormField
                  control={form.control}
                  name="headPosition"
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel>Head position (1-5: 1=poor, 5=excellent)</FormLabel>
                      <FormControl>
                        <Input type="number" step="1" min="1" max="5" placeholder="e.g., 3" value={field.value ?? ''} onChange={(e) => field.onChange(e.target.value === '' ? undefined : Number(e.target.value))} />
                      </FormControl>
                      <FormMessage />
                    </FormItem>
                  )}
                />
                <FormField
                  control={form.control}
                  name="shoulderAlignment"
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel>Shoulder alignment (1-5: 1=poor, 5=excellent)</FormLabel>
                      <FormControl>
                        <Input type="number" step="1" min="1" max="5" placeholder="e.g., 3" value={field.value ?? ''} onChange={(e) => field.onChange(e.target.value === '' ? undefined : Number(e.target.value))} />
                      </FormControl>
                      <FormMessage />
                    </FormItem>
                  )}
                />
                <FormField
                  control={form.control}
                  name="backPosture"
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel>Back posture (1-5: 1=poor, 5=excellent)</FormLabel>
                      <FormControl>
                        <Input type="number" step="1" min="1" max="5" placeholder="e.g., 3" value={field.value ?? ''} onChange={(e) => field.onChange(e.target.value === '' ? undefined : Number(e.target.value))} />
                      </FormControl>
                      <FormMessage />
                    </FormItem>
                  )}
                />
                <FormField
                  control={form.control}
                  name="sittingDuration"
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel>Daily sitting duration (hours)</FormLabel>
                      <FormControl>
                        <Input type="number" step="0.5" placeholder="e.g., 8" value={field.value ?? ''} onChange={(e) => field.onChange(e.target.value === '' ? undefined : Number(e.target.value))} />
                      </FormControl>
                      <FormMessage />
                    </FormItem>
                  )}
                />
                <FormField
                  control={form.control}
                  name="deskSetup"
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel>Desk setup quality (1-5: 1=poor, 5=excellent)</FormLabel>
                      <FormControl>
                        <Input type="number" step="1" min="1" max="5" placeholder="e.g., 3" value={field.value ?? ''} onChange={(e) => field.onChange(e.target.value === '' ? undefined : Number(e.target.value))} />
                      </FormControl>
                      <FormMessage />
                    </FormItem>
                  )}
                />
              </div>
              <Button type="submit" className="w-full md:w-auto">
                Calculate posture score
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
            <CardDescription>See posture score, status, and recommendations.</CardDescription>
          </CardHeader>
          <CardContent className="space-y-6">
            <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
              <div className="p-4 border rounded">
                <p className="text-sm text-muted-foreground">Posture score</p>
                <p className="text-2xl font-semibold text-primary">{result.postureScore.toFixed(1)}</p>
                <p className="text-xs text-muted-foreground">Out of 100</p>
              </div>
              <div className="p-4 border rounded">
                <p className="text-sm text-muted-foreground">Postural average</p>
                <p className="text-2xl font-semibold text-primary">{((result.headPosition + result.shoulderAlignment + result.backPosture) / 3).toFixed(1)}</p>
                <p className="text-xs text-muted-foreground">Out of 5</p>
              </div>
              <div className="p-4 border rounded">
                <p className="text-sm text-muted-foreground">Sitting duration</p>
                <p className="text-2xl font-semibold text-primary">{result.sittingDuration.toFixed(1)}</p>
                <p className="text-xs text-muted-foreground">Hours per day</p>
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
            <strong>Postural average</strong> = (Head Position + Shoulder Alignment + Back Posture) / 3. Each component rated 1-5, where 1=poor and 5=excellent alignment.
          </p>
          <p>
            <strong>Sitting penalty</strong> = 0 for &lt;6 hours, 0.5 for 6-8 hours, 1.0 for 8-10 hours, 1.5 for 10+ hours. Longer sitting increases postural stress.
          </p>
          <p>
            <strong>Desk setup multiplier</strong> = (Desk Setup - 3) Ã— 0.1. Ranges from -0.2 (poor) to +0.2 (excellent), adjusting score based on ergonomic quality.
          </p>
          <p>
            <strong>Posture score</strong> = ((Postural Average - Sitting Penalty + Desk Multiplier) / 5) Ã— 100, normalized to 0-100 scale. Higher scores indicate better posture, proper ergonomics, and reasonable sitting duration.
          </p>
          <p>Good posture maintains natural spinal curves, reduces musculoskeletal stress, and prevents pain. Regular breaks, ergonomic setup, and postural exercises support long-term postural health.</p>
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
                <p className="text-sm text-muted-foreground">Head position</p>
                <p className="text-xl font-semibold text-primary">
                  {result.headPosition}/5
                </p>
                <p className="text-xs text-muted-foreground">Alignment rating</p>
              </div>
              <div className="p-4 border rounded">
                <p className="text-sm text-muted-foreground">Shoulder alignment</p>
                <p className="text-xl font-semibold text-primary">
                  {result.shoulderAlignment}/5
                </p>
                <p className="text-xs text-muted-foreground">Alignment rating</p>
              </div>
              <div className="p-4 border rounded">
                <p className="text-sm text-muted-foreground">Back posture</p>
                <p className="text-xl font-semibold text-primary">
                  {result.backPosture}/5
                </p>
                <p className="text-xs text-muted-foreground">Alignment rating</p>
              </div>
            </div>
          ) : (
            <p className="text-sm text-muted-foreground">Enter your posture assessment data to see additional insights.</p>
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
    <meta itemProp="name" content="The Definitive Guide to Posture: Understanding and Improving Spinal Alignment" />
    <meta itemProp="description" content="An expert guide on posture assessment, the importance of good posture, ergonomic setup, and strategies to improve postural health and prevent musculoskeletal disorders." />
    <meta itemProp="keywords" content="posture score calculator, postural alignment, ergonomics, forward head posture, rounded shoulders, desk setup, spinal health" />
    <meta itemProp="author" content="[Your Site's Health Team]" />
    <meta itemProp="datePublished" content="2025-12-01" />
    <meta itemProp="url" content="/definitive-posture-guide" />

    <h1 className="text-3xl md:text-4xl font-extrabold text-foreground mb-4" itemProp="headline">The Definitive Guide to Posture: Understanding and Improving Spinal Alignment for Long-Term Health</h1>
    <p className="text-lg italic text-gray-700">Explore the importance of good posture, how to assess your posture, ergonomic principles, and evidence-based strategies to improve postural health and prevent musculoskeletal disorders.</p>

    <h2 className="text-2xl font-bold text-foreground mt-8 mb-4">Table of Contents: Jump to a Section</h2>
    <ul className="list-disc ml-6 space-y-2 text-blue-600">
        <li><a href="#what-is-posture" className="hover:underline">What Is Good Posture</a></li>
        <li><a href="#why-posture-matters" className="hover:underline">Why Posture Matters</a></li>
        <li><a href="#common-problems" className="hover:underline">Common Postural Problems</a></li>
        <li><a href="#ergonomics" className="hover:underline">Ergonomic Setup for Good Posture</a></li>
        <li><a href="#improving-posture" className="hover:underline">Improving Your Posture</a></li>
    </ul>
<hr />

    <h2 id="what-is-posture" className="text-2xl font-bold text-foreground pt-8" itemProp="articleSection">What Is Good Posture</h2>
    <p>**Good posture** maintains the natural alignment and curves of your spine while standing, sitting, or moving. It distributes weight evenly, reduces stress on muscles and joints, and supports optimal function of your body's systems.</p>

<h3 className="text-xl font-semibold text-foreground mt-6">Characteristics of Good Posture</h3>
<p>Good posture includes:</p>
<ul>
    <li><b>Head alignment:</b> Head positioned directly over shoulders, not forward</li>
    <li><b>Shoulder position:</b> Shoulders relaxed and aligned, not rounded forward</li>
    <li><b>Spinal curves:</b> Natural S-curve maintained (cervical lordosis, thoracic kyphosis, lumbar lordosis)</li>
    <li><b>Hip alignment:</b> Hips level and balanced</li>
    <li><b>Weight distribution:</b> Weight evenly distributed through feet</li>
    <li><b>Muscle balance:</b> Balanced muscle tension, not excessive tightness or weakness</li>
</ul>

<h3 className="text-xl font-semibold text-foreground mt-6">Posture in Different Positions</h3>
<p><b>Standing:</b> Ears aligned over shoulders, shoulders over hips, hips over ankles, natural spinal curves maintained.</p>
<p><b>Sitting:</b> Feet flat on floor, knees at or slightly below hips, back supported, shoulders relaxed, head aligned over torso.</p>
<p><b>Moving:</b> Maintained alignment while walking, with smooth, balanced movement patterns.</p>

<hr />

    <h2 id="why-posture-matters" className="text-2xl font-bold text-foreground pt-8" itemProp="articleSection">Why Posture Matters</h2>
    <p>Good posture is fundamental to musculoskeletal health, preventing pain and dysfunction while supporting optimal body function.</p>

    <h3 className="text-xl font-semibold text-foreground mt-6">Health Benefits</h3>
    <ul>
        <li><b>Prevents pain:</b> Reduces neck, back, and shoulder pain</li>
        <li><b>Reduces muscle fatigue:</b> Efficient muscle use prevents overwork</li>
        <li><b>Prevents joint wear:</b> Proper alignment reduces abnormal joint stress</li>
        <li><b>Improves breathing:</b> Optimal rib cage position supports lung function</li>
        <li><b>Enhances circulation:</b> Unrestricted blood flow throughout body</li>
        <li><b>Supports organ function:</b> Proper alignment supports internal organ positioning</li>
    </ul>

    <h3 className="text-xl font-semibold text-foreground mt-6">Consequences of Poor Posture</h3>
    <ul>
        <li>Chronic neck and back pain</li>
        <li>Headaches from neck tension</li>
        <li>Reduced flexibility and mobility</li>
        <li>Muscle imbalances and weakness</li>
        <li>Joint dysfunction and wear</li>
        <li>Decreased lung capacity</li>
        <li>Digestive issues from compression</li>
        <li>Increased injury risk</li>
    </ul>

<hr />

    <h2 id="common-problems" className="text-2xl font-bold text-foreground pt-8" itemProp="articleSection">Common Postural Problems</h2>
    <p>Understanding common postural problems helps identify and address issues:</p>

    <h3 className="text-xl font-semibold text-foreground mt-6">Forward Head Posture</h3>
    <p>Head protrudes forward from shoulders, common with screen use:</p>
    <ul>
        <li>Causes: Looking down at screens, poor ergonomics, weak neck muscles</li>
        <li>Effects: Neck pain, upper back tension, headaches</li>
        <li>Correction: Strengthen deep neck flexors, stretch upper traps, improve ergonomics</li>
    </ul>

    <h3 className="text-xl font-semibold text-foreground mt-6">Rounded Shoulders</h3>
    <p>Shoulders roll forward, creating rounded upper back:</p>
    <ul>
        <li>Causes: Prolonged sitting, weak back muscles, tight chest muscles</li>
        <li>Effects: Shoulder pain, upper back discomfort, reduced mobility</li>
        <li>Correction: Strengthen rhomboids and mid-traps, stretch chest muscles, improve alignment</li>
    </ul>

    <h3 className="text-xl font-semibold text-foreground mt-6">Slouched Posture</h3>
    <p>Excessive rounding of upper and lower back:</p>
    <ul>
        <li>Causes: Weak core, prolonged sitting, poor chair support</li>
        <li>Effects: Back pain, reduced lung capacity, fatigue</li>
        <li>Correction: Strengthen core and back muscles, improve chair support, take regular breaks</li>
    </ul>

<hr />

    <h2 id="ergonomics" className="text-2xl font-bold text-foreground pt-8" itemProp="articleSection">Ergonomic Setup for Good Posture</h2>
    <p>Proper ergonomic setup supports good posture automatically:</p>

    <h3 className="text-xl font-semibold text-foreground mt-6">Monitor Setup</h3>
    <ul>
        <li>Top of screen at or slightly below eye level</li>
        <li>20-26 inches from eyes</li>
        <li>Reduce glare and reflections</li>
        <li>Avoid looking down or up</li>
    </ul>

    <h3 className="text-xl font-semibold text-foreground mt-6">Keyboard and Mouse</h3>
    <ul>
        <li>At elbow height or slightly below</li>
        <li>Forearms parallel to floor</li>
        <li>Wrists straight and neutral</li>
        <li>Mouse close to keyboard</li>
    </ul>

    <h3 className="text-xl font-semibold text-foreground mt-6">Chair Setup</h3>
    <ul>
        <li>Feet flat on floor (or footrest)</li>
        <li>Knees at or slightly below hips</li>
        <li>Back supported with lumbar support</li>
        <li>Armrests at elbow height</li>
        <li>Hips back in chair</li>
    </ul>

    <h3 className="text-xl font-semibold text-foreground mt-6">Standing Desk Considerations</h3>
    <ul>
        <li>Alternate between sitting and standing</li>
        <li>Monitor at eye level when standing</li>
        <li>Anti-fatigue mat for standing</li>
        <li>Proper footwear</li>
    </ul>

<hr />

    <h2 id="improving-posture" className="text-2xl font-bold text-foreground pt-8" itemProp="articleSection">Improving Your Posture</h2>
    <p>Improving posture requires a comprehensive approach:</p>

    <h3 className="text-xl font-semibold text-foreground mt-6">1. Awareness and Correction</h3>
    <ul>
        <li>Regularly check and correct posture throughout the day</li>
        <li>Set reminders to assess posture</li>
        <li>Use mirrors or photos to visualize alignment</li>
        <li>Practice postural awareness exercises</li>
    </ul>

    <h3 className="text-xl font-semibold text-foreground mt-6">2. Strengthening Exercises</h3>
    <ul>
        <li><b>Core:</b> Planks, dead bugs, bird dogs</li>
        <li><b>Back:</b> Rows, reverse flyes, scapular retractions</li>
        <li><b>Neck:</b> Deep neck flexor exercises</li>
        <li><b>Posterior chain:</b> Glute bridges, deadlifts, squats</li>
    </ul>

    <h3 className="text-xl font-semibold text-foreground mt-6">3. Stretching</h3>
    <ul>
        <li><b>Chest:</b> Doorway stretches, pec stretches</li>
        <li><b>Hip flexors:</b> Lunges, hip flexor stretches</li>
        <li><b>Neck:</b> Upper trap stretches, neck side bends</li>
        <li><b>Back:</b> Cat-cow, spinal twists</li>
    </ul>

    <h3 className="text-xl font-semibold text-foreground mt-6">4. Regular Breaks</h3>
    <ul>
        <li>Break up prolonged sitting every 20-30 minutes</li>
        <li>Stand up, move, stretch</li>
        <li>Reset posture after breaks</li>
        <li>Incorporate movement throughout the day</li>
    </ul>

<hr />

    <h2 className="text-2xl font-bold text-foreground pt-8" itemProp="articleSection">Conclusion</h2>
    <p>Good posture is essential for long-term musculoskeletal health, preventing pain, and maintaining optimal body function. By assessing your posture, improving ergonomic setup, incorporating strengthening and stretching exercises, and taking regular breaks, you can improve and maintain good posture. Use this calculator to assess your current posture and identify areas for improvement. Remember: good posture is a habit that requires consistent awareness and practice. Invest in your postural health now to prevent problems later.</p>
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
          <p>This tool provides general wellness insights about posture score from head position, shoulder alignment, back posture, sitting duration, and desk setup quality. This is a personal lifestyle insight, not a medical evaluation.</p>
          <p>Outputs include posture score, postural average, status, recommendations, an action plan, and supporting metrics.</p>
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


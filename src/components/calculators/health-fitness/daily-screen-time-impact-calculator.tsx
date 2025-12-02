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
  totalScreenHours: z.number({ invalid_type_error: 'Enter total screen hours' }).min(0).max(18),
  workScreenHours: z.number({ invalid_type_error: 'Enter work screen hours' }).min(0).max(12),
  leisureScreenHours: z.number({ invalid_type_error: 'Enter leisure screen hours' }).min(0).max(12),
  age: z.number({ invalid_type_error: 'Enter age' }).min(1).max(100),
});

type FormValues = z.infer<typeof formSchema>;

type ResultPayload = {
  totalScreenHours: number;
  workScreenHours: number;
  leisureScreenHours: number;
  age: number;
  impactScore: number;
  impactPercent: number;
  status: 'optimal' | 'good' | 'moderate' | 'low';
  interpretation: string;
  recommendations: string[];
  plan: { label: string; detail: string }[];
};

const steps = [
  'Enter total daily screen time (hours) from all devices and activities.',
  'Enter screen time for work/productive activities (hours).',
  'Enter screen time for leisure/entertainment (hours).',
  'Enter your age (years) for age-specific recommendations.',
  'Review impact score, impact percentage, and recommendations.',
];

const faqs = [
  {
    question: 'What is screen time impact?',
    answer:
      'Screen time impact refers to the cumulative effects of prolonged digital device use on physical health, mental wellbeing, sleep, eye health, and social functioning. Both the total amount and how screen time is used affect overall impact.',
  },
  {
    question: 'How much screen time is too much?',
    answer:
      'Recommendations vary by age: Adults: 2-4 hours of leisure screen time daily is reasonable, with work screen time being separate. Children: 1-2 hours for ages 2-5, 2 hours for ages 6-12, and reasonable limits for teens. Total daily screen time exceeding 8-10 hours may indicate excessive use.',
  },
  {
    question: 'What are the health effects of excessive screen time?',
    answer:
      'Excessive screen time can cause eye strain, headaches, neck and back pain, sleep disruption, reduced physical activity, social isolation, anxiety, depression, attention problems, and increased risk of obesity and metabolic issues.',
  },
  {
    question: 'Does work screen time count differently?',
    answer:
      'Work screen time is often necessary and unavoidable, but it still contributes to total exposure. The key is balancing necessary work use with reduced leisure screen time, taking breaks, and using protective measures during work hours.',
  },
  {
    question: 'How does age affect screen time impact?',
    answer:
      'Children and adolescents are more vulnerable to screen time effects due to developing brains, higher need for physical activity, and greater sleep requirements. Older adults may experience more eye strain and physical discomfort. All ages benefit from limits and breaks.',
  },
  {
    question: 'What is the difference between active and passive screen time?',
    answer:
      'Active screen time (learning, creating, video calls) may have different impacts than passive screen time (scrolling, watching). However, both contribute to total exposure and should be balanced with offline activities and breaks.',
  },
  {
    question: 'Can screen time be beneficial?',
    answer:
      'Yes, when used intentionally: educational content, creative activities, social connection, work productivity, and learning can be beneficial. The key is balance, intentionality, and ensuring screen time doesn\'t replace essential activities like sleep, exercise, and face-to-face interaction.',
  },
  {
    question: 'How can I reduce screen time impact?',
    answer:
      'Take regular breaks (20-20-20 rule), set screen time limits, use apps to track usage, create screen-free zones and times, engage in offline activities, prioritize sleep, maintain good posture, and use blue light filters, especially in the evening.',
  },
  {
    question: 'What about screen time for children?',
    answer:
      'Children need stricter limits due to developmental needs. Recommendations: Ages 2-5: 1 hour/day of quality content, Ages 6-12: 2 hours/day, Teens: reasonable limits with emphasis on sleep, physical activity, and social interaction. Parental monitoring and co-viewing are important.',
  },
  {
    question: 'When should I consult a healthcare provider?',
    answer:
      'Consult a healthcare provider if screen time is causing persistent physical symptoms (eye strain, headaches, pain), sleep problems, mood changes, attention difficulties, or if you\'re unable to reduce screen time despite negative impacts on daily functioning.',
  },
];

const relatedCalculators = [
  {
    name: 'Blue Light Exposure Calculator',
    slug: 'blue-light-exposure-calculator',
    description: 'Assess blue light exposure from screens.',
  },
  {
    name: 'Sleep Debt Calculator',
    slug: 'sleep-debt-calculator-hf',
    description: 'Evaluate sleep quality and screen time impact.',
  },
  {
    name: 'Circadian Rhythm Disruption Risk Calculator',
    slug: 'circadian-rhythm-disruption-risk-calculator',
    description: 'Assess sleep-wake cycle health.',
  },
  {
    name: 'Daily Screen Exposure Stress Index Calculator',
    slug: 'daily-screen-exposure-stress-index-calculator',
    description: 'Evaluate eye health and screen use impact.',
  },
];

const baseUrl = 'https://mycalculating.com/category/health-fitness/daily-screen-time-impact-calculator';

const schemaMarkup = {
  '@context': 'https://schema.org',
  '@graph': [
    {
      '@type': 'BreadcrumbList',
      itemListElement: [
        { '@type': 'ListItem', position: 1, name: 'Home', item: 'https://mycalculating.com' },
        { '@type': 'ListItem', position: 2, name: 'Health & Fitness', item: 'https://mycalculating.com/category/health-fitness' },
        { '@type': 'ListItem', position: 3, name: 'Daily Screen Time Impact Wellness Calculator', item: baseUrl },
      ],
    },
    {
      '@type': 'SoftwareApplication',
      name: 'Daily Screen Time Impact Wellness Calculator',
      applicationCategory: 'Calculator',
      operatingSystem: 'Web Browser',
      description: 'Calculate daily screen time impact from total hours, work hours, leisure hours, and age.',
      url: baseUrl,
      offers: { '@type': 'Offer', price: '0', priceCurrency: 'USD' },
    },
  ],
};

const clamp = (value: number, min: number, max: number) => Math.min(max, Math.max(min, value));

const calculateResult = (values: FormValues): ResultPayload => {
  const totalScreenHours = values.totalScreenHours;
  const workScreenHours = values.workScreenHours;
  const leisureScreenHours = values.leisureScreenHours;
  const age = values.age;
  
  // Calculate base impact: Total Hours × Age Factor × Leisure Penalty
  // Age factor: children/adolescents more vulnerable (higher impact)
  let ageFactor = 1.0;
  if (age < 18) {
    ageFactor = 1.5; // Higher impact for children/teens
  } else if (age < 30) {
    ageFactor = 1.2;
  } else if (age >= 65) {
    ageFactor = 1.3; // Higher impact for older adults (eye strain, physical issues)
  }
  
  // Leisure screen time has higher impact (less necessary, more problematic)
  const leisurePenalty = 1 + (leisureScreenHours / totalScreenHours) * 0.3;
  const baseImpact = totalScreenHours * ageFactor * leisurePenalty;
  
  // Impact score (normalized to 0-100 scale)
  // Reference: 8 hours total, adult, 50% leisure = moderate impact
  const referenceImpact = 8 * 1.0 * 1.15;
  const impactScore = clamp((baseImpact / referenceImpact) * 100, 0, 100);
  const impactPercent = impactScore;
  
  let status: ResultPayload['status'] = 'optimal';
  let interpretation = 'This suggests a general lifestyle tendency where your screen time impact may appear manageable. You may consider continuing to maintain balanced screen use with regular breaks and offline activities.';

  if (impactScore >= 70 || totalScreenHours >= 12) {
    status = 'low';
    interpretation = 'This suggests a general lifestyle tendency where your screen time impact may be very high. Excessive screen use may significantly increase tendency of eye strain, sleep problems, physical discomfort, and mental health concerns. You may consider reducing screen time and taking frequent breaks immediately. This is a personal insight, not a medical evaluation.';
  } else if (impactScore >= 50 || totalScreenHours >= 8) {
    status = 'moderate';
    interpretation = 'This suggests a general lifestyle tendency where your screen time impact may be elevated. You may consider reducing leisure screen time, taking more frequent breaks, and ensuring adequate sleep and physical activity to mitigate negative effects.';
  } else if (impactScore >= 30 || totalScreenHours >= 6) {
    status = 'good';
    interpretation = 'This suggests a general lifestyle tendency where your screen time impact may be moderate. You may consider continuing to take regular breaks, using protective measures, and balancing screen time with offline activities to maintain optimal health.';
  } else {
    status = 'optimal';
    interpretation = 'This suggests a general lifestyle tendency where your screen time impact may be well-managed. Your screen use may appear balanced with adequate breaks and offline activities, which may support good health and wellbeing.';
  }

  const recommendations = [
    'Take regular screen breaks: follow the 20-20-20 rule (every 20 minutes, look at something 20 feet away for 20 seconds) and take 5-10 minute breaks every hour to reduce eye strain and physical discomfort.',
    'Set screen time limits: use device settings or apps to track and limit daily screen time, especially leisure use. Aim for 2-4 hours of leisure screen time daily for adults.',
    'Create screen-free times: establish screen-free periods, especially before bedtime (1-2 hours), during meals, and during social activities to improve sleep and relationships.',
  ];
  
  if (leisureScreenHours >= 4) {
    recommendations.push('Reduce leisure screen time: high leisure screen use is particularly problematic. Replace some leisure screen time with offline activities like reading, hobbies, exercise, or social interaction.');
  }
  
  if (totalScreenHours >= 10) {
    recommendations.push('Prioritize breaks and movement: with high total screen time, frequent breaks and physical movement are essential. Stand up, stretch, and move every 30-60 minutes to reduce physical strain.');
  }
  
  if (age < 18) {
    recommendations.push('Stricter limits for children/adolescents: younger individuals need more limits due to developmental needs. Ensure adequate sleep (8-10 hours), physical activity (60 minutes daily), and face-to-face social interaction.');
  }

  const plan = [
    { label: 'This Week', detail: `Track your current screen time and identify opportunities to reduce leisure use. Set specific goals like reducing leisure screen time by 1 hour or taking more frequent breaks.` },
    { label: 'This Month', detail: 'Establish healthy screen habits: create screen-free zones and times, use screen time tracking apps, prioritize sleep and physical activity, and find offline activities you enjoy.' },
    { label: 'Ongoing', detail: 'Maintain balanced screen use: continue monitoring screen time, taking regular breaks, and ensuring screen use doesn\'t replace essential activities like sleep, exercise, and social connection.' },
  ];

  return { totalScreenHours, workScreenHours, leisureScreenHours, age, impactScore, impactPercent, status, interpretation, recommendations, plan };
};

export default function DailyScreenTimeImpactCalculator() {
  const [result, setResult] = useState<ResultPayload | null>(null);

  const form = useForm<FormValues>({
    resolver: zodResolver(formSchema),
    defaultValues: {
      totalScreenHours: undefined,
      workScreenHours: undefined,
      leisureScreenHours: undefined,
      age: undefined,
    },
  });

  return (
    <div className="space-y-8">
      <Script id="daily-screen-time-impact-schema" type="application/ld+json" strategy="afterInteractive" dangerouslySetInnerHTML={{ __html: JSON.stringify(schemaMarkup) }} />

      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <Activity className="h-5 w-5" />
            Daily Screen Time Impact Wellness Calculator
          </CardTitle>
          <CardDescription>Get general wellness insights about daily screen time impact from total hours, work hours, leisure hours, and age. This is a personal lifestyle insight, not a medical evaluation.</CardDescription>
        </CardHeader>
      </Card>

      <Card>
        <CardHeader>
          <CardTitle>Input your screen time data</CardTitle>
        </CardHeader>
        <CardContent>
          <Form {...form}>
            <form onSubmit={form.handleSubmit((values) => setResult(calculateResult(values)))} className="space-y-6">
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <FormField
                  control={form.control}
                  name="totalScreenHours"
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel>Total screen hours (per day)</FormLabel>
                      <FormControl>
                        <Input type="number" step="0.5" placeholder="e.g., 8" value={field.value ?? ''} onChange={(e) => field.onChange(e.target.value === '' ? undefined : Number(e.target.value))} />
                      </FormControl>
                      <FormMessage />
                    </FormItem>
                  )}
                />
                <FormField
                  control={form.control}
                  name="workScreenHours"
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel>Work screen hours</FormLabel>
                      <FormControl>
                        <Input type="number" step="0.5" placeholder="e.g., 6" value={field.value ?? ''} onChange={(e) => field.onChange(e.target.value === '' ? undefined : Number(e.target.value))} />
                      </FormControl>
                      <FormMessage />
                    </FormItem>
                  )}
                />
                <FormField
                  control={form.control}
                  name="leisureScreenHours"
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel>Leisure screen hours</FormLabel>
                      <FormControl>
                        <Input type="number" step="0.5" placeholder="e.g., 2" value={field.value ?? ''} onChange={(e) => field.onChange(e.target.value === '' ? undefined : Number(e.target.value))} />
                      </FormControl>
                      <FormMessage />
                    </FormItem>
                  )}
                />
                <FormField
                  control={form.control}
                  name="age"
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel>Age (years)</FormLabel>
                      <FormControl>
                        <Input type="number" step="1" placeholder="e.g., 35" value={field.value ?? ''} onChange={(e) => field.onChange(e.target.value === '' ? undefined : Number(e.target.value))} />
                      </FormControl>
                      <FormMessage />
                    </FormItem>
                  )}
                />
              </div>
              <Button type="submit" className="w-full md:w-auto">
                Calculate screen time impact
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
            <CardDescription>See impact score, impact percentage, and recommendations.</CardDescription>
          </CardHeader>
          <CardContent className="space-y-6">
            <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
              <div className="p-4 border rounded">
                <p className="text-sm text-muted-foreground">Impact score</p>
                <p className="text-2xl font-semibold text-primary">{result.impactScore.toFixed(1)}</p>
                <p className="text-xs text-muted-foreground">Out of 100</p>
              </div>
              <div className="p-4 border rounded">
                <p className="text-sm text-muted-foreground">Total hours</p>
                <p className="text-2xl font-semibold text-primary">{result.totalScreenHours.toFixed(1)}</p>
                <p className="text-xs text-muted-foreground">Per day</p>
              </div>
              <div className="p-4 border rounded">
                <p className="text-sm text-muted-foreground">Impact %</p>
                <p className="text-2xl font-semibold text-primary">{result.impactPercent.toFixed(0)}%</p>
                <p className="text-xs text-muted-foreground">Of reference</p>
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
            <strong>Age factor</strong> = 1.0 for adults 30-64, 1.5 for children/adolescents (&lt;18), 1.2 for young adults (18-29), 1.3 for older adults (65+). Younger and older individuals are more vulnerable to screen time effects.
          </p>
          <p>
            <strong>Leisure penalty</strong> = 1 + (Leisure Hours / Total Hours) × 0.3. Leisure screen time has higher impact than necessary work use.
          </p>
          <p>
            <strong>Base impact</strong> = Total Screen Hours × Age Factor × Leisure Penalty. Higher total hours, younger/older age, and more leisure use increase impact.
          </p>
          <p>
            <strong>Impact score</strong> = (Base Impact / Reference Impact) × 100, normalized to 0-100 scale where reference is 8 hours total, adult age, 50% leisure.
          </p>
          <p>Screen time impact increases with longer total use, higher proportion of leisure time, and age-related vulnerability. Regular breaks, limits, and offline activities reduce negative effects.</p>
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
                <p className="text-sm text-muted-foreground">Weekly screen time</p>
                <p className="text-xl font-semibold text-primary">
                  {(result.totalScreenHours * 7).toFixed(1)} hrs
                </p>
                <p className="text-xs text-muted-foreground">Per week</p>
              </div>
              <div className="p-4 border rounded">
                <p className="text-sm text-muted-foreground">Leisure ratio</p>
                <p className="text-xl font-semibold text-primary">
                  {result.totalScreenHours > 0 ? ((result.leisureScreenHours / result.totalScreenHours) * 100).toFixed(0) : '0'}%
                </p>
                <p className="text-xs text-muted-foreground">Of total time</p>
              </div>
              <div className="p-4 border rounded">
                <p className="text-sm text-muted-foreground">Impact level</p>
                <p className="text-xl font-semibold text-primary">
                  {result.impactScore >= 70 ? 'Very High' : result.impactScore >= 50 ? 'High' : result.impactScore >= 30 ? 'Moderate' : 'Low'}
                </p>
                <p className="text-xs text-muted-foreground">Based on score</p>
              </div>
            </div>
          ) : (
            <p className="text-sm text-muted-foreground">Enter your screen time data to see additional insights.</p>
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
    {/* SEO & SCHEMA METADATA (HIGHLY OPTIMIZED) */}
    <meta itemProp="name" content="The Definitive Guide to Daily Screen Time Impact: Balancing Digital Life and Health" />
    <meta itemProp="description" content="An expert, evidence-based guide on daily screen time impact, detailing effects on physical health, mental wellbeing, sleep, and eye health, with comprehensive strategies to reduce negative impacts while maintaining digital productivity." />
    <meta itemProp="keywords" content="daily screen time calculator, screen time impact assessment, digital device health effects, screen time limits, eye strain prevention, sleep and screen time, digital wellness" />
    <meta itemProp="author" content="[Your Site's Health Team]" />
    <meta itemProp="datePublished" content="2025-12-01" />
    <meta itemProp="url" content="/definitive-screen-time-impact-guide" />

    <h1 className="text-3xl md:text-4xl font-extrabold text-foreground mb-4" itemProp="headline">The Definitive Guide to Daily Screen Time Impact: Balancing Digital Life and Physical Health</h1>
    <p className="text-lg italic text-gray-700">Explore the science of screen time effects, how digital device use impacts health, and comprehensive strategies to reduce negative impacts while maintaining productivity and connection.</p>


    {/* TABLE OF CONTENTS (INTERNAL LINKS FOR UX AND SEO) */}
    <h2 className="text-2xl font-bold text-foreground mt-8 mb-4">Table of Contents: Jump to a Section</h2>
    <ul className="list-disc ml-6 space-y-2 text-blue-600">
        <li><a href="#screen-time-effects" className="hover:underline">Understanding Screen Time Effects on Health</a></li>
        <li><a href="#physical-health" className="hover:underline">Physical Health Impacts</a></li>
        <li><a href="#mental-health" className="hover:underline">Mental Health and Wellbeing</a></li>
        <li><a href="#reduction" className="hover:underline">Strategies to Reduce Screen Time Impact</a></li>
        <li><a href="#balance" className="hover:underline">Finding Balance in Digital Life</a></li>
    </ul>
<hr />

    {/* SCREEN TIME EFFECTS */}
    <h2 id="screen-time-effects" className="text-2xl font-bold text-foreground pt-8" itemProp="articleSection">Understanding Screen Time Effects on Health</h2>
    <p>In our increasingly digital world, screen time has become a significant part of daily life. While digital devices offer productivity, connection, and entertainment, excessive or poorly managed screen time can negatively impact multiple aspects of health. Understanding these effects helps you make informed decisions about your digital device use.</p>

<h3 className="text-xl font-semibold text-foreground mt-6">The Multifaceted Impact of Screen Time</h3>
<p>Screen time affects health through multiple pathways:</p>
<ul>
    <li><b>Physical effects:</b> Eye strain, musculoskeletal issues, reduced physical activity</li>
    <li><b>Sleep disruption:</b> Blue light exposure, delayed bedtime, reduced sleep quality</li>
    <li><b>Mental health:</b> Anxiety, depression, attention problems, social comparison</li>
    <li><b>Social effects:</b> Reduced face-to-face interaction, relationship impacts</li>
    <li><b>Behavioral:</b> Addictive patterns, reduced attention span, impulse control issues</li>
</ul>
<p>The key is not eliminating screen time (often impossible) but <b>managing it effectively</b> to minimize negative impacts while maximizing benefits.</p>

<h3 className="text-xl font-semibold text-foreground mt-6">Work vs. Leisure Screen Time</h3>
<p>Not all screen time is equal:</p>
<ul>
    <li><b>Work screen time:</b> Often necessary and unavoidable, but still contributes to total exposure. Focus on breaks, ergonomics, and protective measures.</li>
    <li><b>Leisure screen time:</b> More discretionary and often more problematic. This is where reductions can have the biggest impact on health.</li>
</ul>
<p>Balancing necessary work use with reduced leisure use is key to managing overall screen time impact.</p>

<hr />

    {/* PHYSICAL HEALTH */}
    <h2 id="physical-health" className="text-2xl font-bold text-foreground pt-8" itemProp="articleSection">Physical Health Impacts</h2>
    <p>Prolonged screen use can cause various physical health problems, particularly when combined with poor ergonomics and lack of movement.</p>

    <h3 className="text-xl font-semibold text-foreground mt-6">Digital Eye Strain</h3>
    <p>Also known as computer vision syndrome, digital eye strain includes:</p>
    <ul>
        <li><b>Symptoms:</b> Eye fatigue, dry eyes, blurred vision, headaches, light sensitivity</li>
        <li><b>Causes:</b> Prolonged focus, reduced blinking, blue light exposure, glare, poor lighting</li>
        <li><b>Prevention:</b> 20-20-20 rule, regular breaks, proper lighting, blue light filters, adequate blinking</li>
    </ul>

    <h3 className="text-xl font-semibold text-foreground mt-6">Musculoskeletal Issues</h3>
    <p>Poor posture and prolonged static positions cause:</p>
    <ul>
        <li>Neck pain (text neck) from forward head posture</li>
        <li>Back pain from slouching and poor ergonomics</li>
        <li>Shoulder tension from raised arms</li>
        <li>Wrist and hand problems from repetitive use</li>
    </ul>
    <p><b>Solutions:</b> Proper ergonomics, frequent movement, stretching, standing breaks, ergonomic equipment</p>

    <h3 className="text-xl font-semibold text-foreground mt-6">Reduced Physical Activity</h3>
    <p>Excessive screen time often displaces physical activity:</p>
    <ul>
        <li>Sedentary behavior increases risk of obesity, cardiovascular disease, and metabolic issues</li>
        <li>Children and teens need 60 minutes of daily physical activity</li>
        <li>Adults need 150 minutes of moderate activity weekly</li>
        <li>Screen time competes with time for exercise and movement</li>
    </ul>

    <h3 className="text-xl font-semibold text-foreground mt-6">Sleep Disruption</h3>
    <p>Evening screen time disrupts sleep through:</p>
    <ul>
        <li>Blue light suppression of melatonin</li>
        <li>Mental stimulation preventing relaxation</li>
        <li>Delayed bedtime and reduced sleep duration</li>
        <li>Poorer sleep quality and circadian rhythm disruption</li>
    </ul>

<hr />

    {/* MENTAL HEALTH */}
    <h2 id="mental-health" className="text-2xl font-bold text-foreground pt-8" itemProp="articleSection">Mental Health and Wellbeing</h2>
    <p>Screen time, particularly social media and passive consumption, can significantly impact mental health and wellbeing.</p>

    <h3 className="text-xl font-semibold text-foreground mt-6">Anxiety and Depression</h3>
    <p>Research links excessive screen time, especially social media, with:</p>
    <ul>
        <li>Increased anxiety and depression, particularly in adolescents</li>
        <li>Social comparison leading to negative self-perception</li>
        <li>Fear of missing out (FOMO)</li>
        <li>Cyberbullying and online harassment</li>
        <li>Reduced real-world social connection</li>
    </ul>

    <h3 className="text-xl font-semibold text-foreground mt-6">Attention and Focus</h3>
    <p>Excessive screen time can affect attention:</p>
    <ul>
        <li>Reduced attention span and ability to focus</li>
        <li>Difficulty with sustained attention tasks</li>
        <li>Increased distractibility</li>
        <li>Potential contribution to ADHD-like symptoms</li>
    </ul>

    <h3 className="text-xl font-semibold text-foreground mt-6">Addiction and Compulsive Use</h3>
    <p>Screen time can become addictive:</p>
    <ul>
        <li>Dopamine-driven reward cycles from notifications and engagement</li>
        <li>Compulsive checking and scrolling behaviors</li>
        <li>Difficulty reducing use despite negative consequences</li>
        <li>Withdrawal symptoms when screen time is reduced</li>
    </ul>

<hr />

    {/* REDUCTION STRATEGIES */}
    <h2 id="reduction" className="text-2xl font-bold text-foreground pt-8" itemProp="articleSection">Strategies to Reduce Screen Time Impact</h2>
    <p>Reducing screen time impact doesn't mean eliminating devices—it means using them more intentionally and protectively.</p>

    <h3 className="text-xl font-semibold text-foreground mt-6">1. Set Screen Time Limits</h3>
    <ul>
        <li>Use device settings or apps to track daily screen time</li>
        <li>Set specific limits for leisure screen time (2-4 hours for adults)</li>
        <li>Use app timers and reminders to enforce limits</li>
        <li>Create daily or weekly screen time budgets</li>
    </ul>

    <h3 className="text-xl font-semibold text-foreground mt-6">2. Take Regular Breaks</h3>
    <ul>
        <li><b>20-20-20 rule:</b> Every 20 minutes, look at something 20 feet away for 20 seconds</li>
        <li>Take 5-10 minute breaks every hour</li>
        <li>Stand up and move during breaks</li>
        <li>Use break time for stretching, walking, or other activities</li>
    </ul>

    <h3 className="text-xl font-semibold text-foreground mt-6">3. Create Screen-Free Zones and Times</h3>
    <ul>
        <li>Bedroom: Keep screens out of the bedroom, especially before sleep</li>
        <li>Meals: Make meals screen-free for better digestion and connection</li>
        <li>Social activities: Put devices away during face-to-face interactions</li>
        <li>First hour of day: Start the day without screens when possible</li>
    </ul>

    <h3 className="text-xl font-semibold text-foreground mt-6">4. Optimize Screen Use</h3>
    <ul>
        <li>Use blue light filters, especially in the evening</li>
        <li>Reduce screen brightness to comfortable levels</li>
        <li>Maintain proper ergonomics and viewing distance</li>
        <li>Use larger screens when possible to reduce eye strain</li>
        <li>Enable dark mode to reduce brightness</li>
    </ul>

    <h3 className="text-xl font-semibold text-foreground mt-6">5. Replace Screen Time with Offline Activities</h3>
    <ul>
        <li>Physical activity: Exercise, sports, walking</li>
        <li>Hobbies: Reading, crafting, music, art</li>
        <li>Social connection: Face-to-face time with friends and family</li>
        <li>Nature: Outdoor activities and time in nature</li>
        <li>Mindfulness: Meditation, relaxation, reflection</li>
    </ul>

<hr />

    {/* BALANCE */}
    <h2 id="balance" className="text-2xl font-bold text-foreground pt-8" itemProp="articleSection">Finding Balance in Digital Life</h2>
    <p>Complete screen elimination is neither possible nor desirable for most people. The goal is <b>intentional, balanced use</b> that supports rather than detracts from health and wellbeing.</p>

    <h3 className="text-xl font-semibold text-foreground mt-6">Quality Over Quantity</h3>
    <p>Not all screen time is equal. Focus on:</p>
    <ul>
        <li><b>Intentional use:</b> Purposeful screen time (work, learning, connection) vs. mindless scrolling</li>
        <li><b>Active engagement:</b> Creating, learning, connecting vs. passive consumption</li>
        <li><b>Meaningful content:</b> Educational, inspiring, or connecting content vs. time-wasting</li>
    </ul>

    <h3 className="text-xl font-semibold text-foreground mt-6">Age-Appropriate Guidelines</h3>
    <p>Screen time recommendations vary by age:</p>
    <ul>
        <li><b>Ages 0-2:</b> Avoid screen time except video chatting</li>
        <li><b>Ages 2-5:</b> 1 hour/day of high-quality content, co-viewing with parents</li>
        <li><b>Ages 6-12:</b> 2 hours/day of leisure screen time, with emphasis on quality</li>
        <li><b>Teens:</b> Reasonable limits with emphasis on sleep (8-10 hours), physical activity, and social interaction</li>
        <li><b>Adults:</b> 2-4 hours of leisure screen time, with work use being separate</li>
    </ul>

    <h3 className="text-xl font-semibold text-foreground mt-6">The 80/20 Principle</h3>
    <p>Apply the 80/20 principle to screen time:</p>
    <ul>
        <li>80% of screen time should be intentional, productive, or meaningful</li>
        <li>20% can be leisure, entertainment, or relaxation</li>
        <li>This balance allows for both productivity and enjoyment while minimizing negative impacts</li>
    </ul>

<hr />

    {/* CONCLUSION */}
    <h2 className="text-2xl font-bold text-foreground pt-8" itemProp="articleSection">Conclusion</h2>
    <p>Screen time is an integral part of modern life, but excessive or poorly managed use can negatively impact physical health, mental wellbeing, sleep, and relationships. By understanding your screen time patterns, setting appropriate limits, taking regular breaks, and balancing digital activities with offline life, you can reduce negative impacts while maintaining the benefits of digital technology. Remember: the goal isn't perfection but balance. Use screens intentionally, protect your health with breaks and filters, and ensure screen time enhances rather than replaces essential activities like sleep, exercise, and face-to-face connection.</p>
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
          <p>This tool provides general wellness insights about daily screen time impact from total hours, work hours, leisure hours, and age. This is a personal lifestyle insight, not a medical evaluation.</p>
          <p>Outputs include total screen hours, work screen hours, leisure screen hours, age, impact score, impact percentage, status, recommendations, an action plan, and supporting metrics.</p>
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


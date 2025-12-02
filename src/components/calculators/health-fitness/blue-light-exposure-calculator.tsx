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
  screenHours: z.number({ invalid_type_error: 'Enter screen hours' }).min(0).max(18),
  nightHours: z.number({ invalid_type_error: 'Enter night hours' }).min(0).max(12),
  screenBrightness: z.number({ invalid_type_error: 'Enter screen brightness' }).min(10).max(100),
  filterReduction: z.number({ invalid_type_error: 'Enter filter reduction' }).min(0).max(100).optional(),
});

type FormValues = z.infer<typeof formSchema>;

type ResultPayload = {
  screenHours: number;
  nightHours: number;
  screenBrightness: number;
  filterReduction: number | undefined;
  exposureScore: number;
  exposurePercent: number;
  status: 'optimal' | 'good' | 'moderate' | 'low';
  interpretation: string;
  recommendations: string[];
  plan: { label: string; detail: string }[];
};

const steps = [
  'Enter total daily screen time (hours) from all devices.',
  'Enter evening/night screen time (hours after 6pm).',
  'Enter average screen brightness percentage (10-100%).',
  'Enter blue light filter reduction percentage if using filters (optional).',
  'Review exposure score, exposure percentage, and recommendations.',
];

const faqs = [
  {
    question: 'What is blue light?',
    answer:
      'Blue light is a high-energy visible (HEV) light with wavelengths between 400-500 nanometers. It\'s emitted by digital screens, LED lights, and sunlight. While natural blue light during daytime is beneficial, excessive artificial blue light, especially at night, can disrupt sleep and eye health.',
  },
  {
    question: 'How does blue light affect sleep?',
    answer:
      'Blue light suppresses melatonin production, the hormone that regulates sleep. Exposure to blue light in the evening delays sleep onset, reduces sleep quality, and disrupts circadian rhythms. This is why screens before bed can make it harder to fall asleep.',
  },
  {
    question: 'What are the health effects of excessive blue light?',
    answer:
      'Excessive blue light exposure can cause digital eye strain, headaches, dry eyes, blurred vision, sleep disruption, and potentially contribute to long-term eye damage. Nighttime exposure is particularly problematic for circadian rhythm disruption.',
  },
  {
    question: 'How do blue light filters work?',
    answer:
      'Blue light filters (software or physical) reduce the amount of blue light emitted by screens. Software filters reduce blue light by 20-50%, while physical screen protectors can block 30-60%. They work by filtering out blue wavelengths or shifting screen color temperature toward warmer tones.',
  },
  {
    question: 'What is a safe amount of screen time?',
    answer:
      'There\'s no definitive "safe" amount, but recommendations suggest limiting evening screen time (after 6pm) to 1-2 hours, using blue light filters, and avoiding screens 1-2 hours before bedtime. Total daily screen time should be balanced with breaks and outdoor time.',
  },
  {
    question: 'Do blue light glasses work?',
    answer:
      'Blue light blocking glasses can reduce blue light exposure by 20-90% depending on the lens. They may help reduce eye strain and improve sleep when used in the evening. However, evidence for long-term eye health benefits is still emerging.',
  },
  {
    question: 'How does screen brightness affect blue light?',
    answer:
      'Higher screen brightness increases blue light emission. Reducing brightness can decrease blue light exposure by 20-40%. Using lower brightness settings, especially in the evening, can help reduce eye strain and sleep disruption.',
  },
  {
    question: 'What about natural blue light from sunlight?',
    answer:
      'Natural blue light from sunlight during daytime is beneficial—it helps regulate circadian rhythms, boost alertness, and improve mood. The concern is artificial blue light from screens, especially in the evening when it conflicts with natural sleep-wake cycles.',
  },
  {
    question: 'Can I reduce blue light exposure?',
    answer:
      'Yes. Use blue light filters on devices, reduce screen brightness, limit evening screen time, use night mode settings, wear blue light blocking glasses, take regular screen breaks, and avoid screens 1-2 hours before bedtime.',
  },
  {
    question: 'When should I consult a healthcare provider?',
    answer:
      'Consult an eye care professional if you experience persistent eye strain, headaches, dry eyes, vision changes, or sleep problems related to screen use. They can assess your eye health and recommend appropriate interventions.',
  },
];

const relatedCalculators = [
  {
    name: 'UV Exposure Risk Calculator',
    slug: 'uv-exposure-risk-calculator',
    description: 'Assess sun exposure alongside blue light.',
  },
  {
    name: 'Daily Screen Time Impact Calculator',
    slug: 'daily-screen-time-impact-calculator',
    description: 'Evaluate comprehensive screen time effects.',
  },
  {
    name: 'Sleep Debt Calculator',
    slug: 'sleep-debt-calculator-hf',
    description: 'Assess sleep quality and circadian health.',
  },
  {
    name: 'Circadian Rhythm Disruption Risk Calculator',
    slug: 'circadian-rhythm-disruption-risk-calculator',
    description: 'Evaluate sleep-wake cycle health.',
  },
];

const baseUrl = 'https://mycalculating.com/category/health-fitness/blue-light-exposure-calculator';

const schemaMarkup = {
  '@context': 'https://schema.org',
  '@graph': [
    {
      '@type': 'BreadcrumbList',
      itemListElement: [
        { '@type': 'ListItem', position: 1, name: 'Home', item: 'https://mycalculating.com' },
        { '@type': 'ListItem', position: 2, name: 'Health & Fitness', item: 'https://mycalculating.com/category/health-fitness' },
        { '@type': 'ListItem', position: 3, name: 'Blue Light Exposure Wellness Calculator', item: baseUrl },
      ],
    },
    {
      '@type': 'SoftwareApplication',
      name: 'Blue Light Exposure Wellness Calculator',
      applicationCategory: 'Calculator',
      operatingSystem: 'Web Browser',
      description: 'Calculate blue light exposure from screen hours, night hours, brightness, and filter reduction.',
      url: baseUrl,
      offers: { '@type': 'Offer', price: '0', priceCurrency: 'USD' },
    },
  ],
};

const clamp = (value: number, min: number, max: number) => Math.min(max, Math.max(min, value));

const calculateResult = (values: FormValues): ResultPayload => {
  const screenHours = values.screenHours;
  const nightHours = values.nightHours;
  const screenBrightness = values.screenBrightness;
  const filterReduction = values.filterReduction;
  
  // Calculate base exposure: Screen Hours × Brightness Factor × Night Penalty
  const brightnessFactor = screenBrightness / 100; // 0.1 to 1.0
  const nightPenalty = 1 + (nightHours / screenHours) * 0.5; // Night exposure is worse
  const baseExposure = screenHours * brightnessFactor * nightPenalty;
  
  // Apply filter reduction if provided
  const filterFactor = filterReduction ? (1 - filterReduction / 100) : 1.0;
  const effectiveExposure = baseExposure * filterFactor;
  
  // Exposure score (normalized to 0-100 scale)
  // Reference: 8 hours, 80% brightness, 3 night hours, no filter = moderate-high exposure
  const referenceExposure = 8 * 0.8 * (1 + (3/8) * 0.5);
  const exposureScore = clamp((effectiveExposure / referenceExposure) * 100, 0, 100);
  const exposurePercent = exposureScore;
  
  let status: ResultPayload['status'] = 'optimal';
  let interpretation =
    'This suggests a general lifestyle tendency where your current blue‑light pattern may look relatively gentle based on the numbers you entered. You may consider continuing to notice which screen habits feel most supportive for your eyes and sleep.';

  if (exposureScore >= 70 || nightHours >= 4) {
    status = 'low';
    interpretation =
      'This suggests a general lifestyle tendency where your numbers may suggest a relatively heavy screen pattern, especially later in the day. You might like to experiment with gentler evening habits—such as shorter sessions, dimmer screens, or more off‑screen winding‑down time—and see how your eyes and sleep feel. This is a personal insight, not a medical evaluation.';
  } else if (exposureScore >= 50 || nightHours >= 2) {
    status = 'moderate';
    interpretation =
      'This suggests a general lifestyle tendency where your entries may point to a fair amount of screen time, particularly in the evening. Small shifts—like softer brightness, enabling night modes, or bringing screens to an earlier time—may help evenings feel calmer.';
  } else if (exposureScore >= 30) {
    status = 'good';
    interpretation =
      'This suggests a general lifestyle tendency where your blue‑light pattern may look moderate. With a few simple supports (breaks, lower evening brightness, or wind‑down time away from devices), many people find this feels workable.';
  } else {
    status = 'optimal';
    interpretation =
      'This suggests a general lifestyle tendency where your blue‑light pattern may look quite light based on these inputs. You may consider continuing to lean on the habits that already feel good for your eyes and rest.';
  }

  const recommendations = [
    'Try night‑mode or blue‑shifted display settings on your devices in the evening if they feel easier on your eyes.',
    'Notice how it feels to gently shorten late‑evening screen time and add a little more off‑screen wind‑down before bed.',
    'Lowering brightness, especially at night, can make screens feel softer and may ease eye tiredness for some people.',
  ];
  
  if (nightHours >= 2) {
    recommendations.push(
      'If a lot of your screen time happens later in the evening, you might experiment with a simple “screen pause” before bed and swap in calm activities like reading or stretching.'
    );
  }
  
  if (!filterReduction || filterReduction < 30) {
    recommendations.push(
      'If you rarely use filters, you could try enabling built‑in night modes or a light blue‑shift and see whether your eyes feel more comfortable.'
    );
  }
  
  if (screenHours >= 10) {
    recommendations.push(
      'On long screen days, brief movement or “look‑away” breaks can help your eyes and body feel less locked to the screen.'
    );
  }

  const plan = [
    { label: 'This Week', detail: `Assess your current blue light exposure and implement basic protections: enable night mode, reduce evening screen time, and lower brightness settings.` },
    { label: 'This Month', detail: 'Establish healthy screen habits: set screen curfews, use blue light filters consistently, take regular breaks, and create evening routines that don\'t involve screens.' },
    { label: 'Ongoing', detail: 'Maintain blue light protection: continue using filters, limiting evening exposure, and protecting sleep. Monitor eye health and sleep quality, adjusting habits as needed.' },
  ];

  return { screenHours, nightHours, screenBrightness, filterReduction, exposureScore, exposurePercent, status, interpretation, recommendations, plan };
};

export default function BlueLightExposureCalculator() {
  const [result, setResult] = useState<ResultPayload | null>(null);

  const form = useForm<FormValues>({
    resolver: zodResolver(formSchema),
    defaultValues: {
      screenHours: undefined,
      nightHours: undefined,
      screenBrightness: undefined,
      filterReduction: undefined,
    },
  });

  return (
    <div className="space-y-8">
      <Script id="blue-light-exposure-schema" type="application/ld+json" strategy="afterInteractive" dangerouslySetInnerHTML={{ __html: JSON.stringify(schemaMarkup) }} />

      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <Activity className="h-5 w-5" />
            Blue Light Exposure Wellness Calculator
          </CardTitle>
          <CardDescription>Get general wellness insights about blue light exposure from screen hours, night hours, brightness, and filter reduction. This is a personal lifestyle insight, not a medical evaluation.</CardDescription>
        </CardHeader>
      </Card>

      <Card>
        <CardHeader>
          <CardTitle>Input your blue light exposure data</CardTitle>
        </CardHeader>
        <CardContent>
          <Form {...form}>
            <form onSubmit={form.handleSubmit((values) => setResult(calculateResult(values)))} className="space-y-6">
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <FormField
                  control={form.control}
                  name="screenHours"
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel>Screen hours (per day)</FormLabel>
                      <FormControl>
                        <Input type="number" step="0.5" placeholder="e.g., 8" value={field.value ?? ''} onChange={(e) => field.onChange(e.target.value === '' ? undefined : Number(e.target.value))} />
                      </FormControl>
                      <FormMessage />
                    </FormItem>
                  )}
                />
                <FormField
                  control={form.control}
                  name="nightHours"
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel>Night hours (after 6pm)</FormLabel>
                      <FormControl>
                        <Input type="number" step="0.5" placeholder="e.g., 3" value={field.value ?? ''} onChange={(e) => field.onChange(e.target.value === '' ? undefined : Number(e.target.value))} />
                      </FormControl>
                      <FormMessage />
                    </FormItem>
                  )}
                />
                <FormField
                  control={form.control}
                  name="screenBrightness"
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel>Screen brightness (%)</FormLabel>
                      <FormControl>
                        <Input type="number" step="1" placeholder="e.g., 80" value={field.value ?? ''} onChange={(e) => field.onChange(e.target.value === '' ? undefined : Number(e.target.value))} />
                      </FormControl>
                      <FormMessage />
                    </FormItem>
                  )}
                />
                <FormField
                  control={form.control}
                  name="filterReduction"
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel>Filter reduction (%) (optional)</FormLabel>
                      <FormControl>
                        <Input type="number" step="1" placeholder="e.g., 40 (0 if none)" value={field.value ?? ''} onChange={(e) => field.onChange(e.target.value === '' ? undefined : Number(e.target.value))} />
                      </FormControl>
                      <FormMessage />
                    </FormItem>
                  )}
                />
              </div>
              <Button type="submit" className="w-full md:w-auto">
                Calculate blue light exposure
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
            <CardDescription>See exposure score, exposure percentage, and recommendations.</CardDescription>
          </CardHeader>
          <CardContent className="space-y-6">
            <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
              <div className="p-4 border rounded">
                <p className="text-sm text-muted-foreground">Exposure score</p>
                <p className="text-2xl font-semibold text-primary">{result.exposureScore.toFixed(1)}</p>
                <p className="text-xs text-muted-foreground">Out of 100</p>
              </div>
              <div className="p-4 border rounded">
                <p className="text-sm text-muted-foreground">Screen hours</p>
                <p className="text-2xl font-semibold text-primary">{result.screenHours.toFixed(1)}</p>
                <p className="text-xs text-muted-foreground">Per day</p>
              </div>
              <div className="p-4 border rounded">
                <p className="text-sm text-muted-foreground">Exposure %</p>
                <p className="text-2xl font-semibold text-primary">{result.exposurePercent.toFixed(0)}%</p>
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
            <strong>Base exposure</strong> = Screen Hours × (Brightness / 100) × Night Penalty Factor. Night penalty = 1 + (Night Hours / Screen Hours) × 0.5, as evening exposure is more harmful.
          </p>
          <p>
            <strong>Effective exposure</strong> = Base Exposure × (1 - Filter Reduction / 100). Blue light filters reduce exposure by their percentage (e.g., 40% filter = 60% of base exposure).
          </p>
          <p>
            <strong>Exposure score</strong> = (Effective Exposure / Reference Exposure) × 100, normalized to 0-100 scale where reference is 8 hours, 80% brightness, 3 night hours, no filter.
          </p>
          <p>Blue light exposure increases with longer screen time, higher brightness, more evening/night use, and lack of protective filters. Reducing evening exposure and using filters significantly decreases risk.</p>
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
                <p className="text-sm text-muted-foreground">Filter protection</p>
                <p className="text-xl font-semibold text-primary">
                  {result.filterReduction ? result.filterReduction.toFixed(0) : '0'}%
                </p>
                <p className="text-xs text-muted-foreground">Blue light blocked</p>
              </div>
              <div className="p-4 border rounded">
                <p className="text-sm text-muted-foreground">Night exposure</p>
                <p className="text-xl font-semibold text-primary">
                  {result.nightHours.toFixed(1)} hrs
                </p>
                <p className="text-xs text-muted-foreground">After 6pm</p>
              </div>
              <div className="p-4 border rounded">
                <p className="text-sm text-muted-foreground">Exposure level</p>
                <p className="text-xl font-semibold text-primary">
                  {result.exposureScore >= 70 ? 'Very High' : result.exposureScore >= 50 ? 'High' : result.exposureScore >= 30 ? 'Moderate' : 'Low'}
                </p>
                <p className="text-xs text-muted-foreground">Based on calculation</p>
              </div>
            </div>
          ) : (
            <p className="text-sm text-muted-foreground">Enter your blue light exposure data to see additional insights.</p>
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
                <Link href={`/category/wellness/${calc.slug}`} className="text-primary hover:underline">
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
    <meta itemProp="name" content="The Definitive Guide to Blue Light Exposure: Protecting Sleep and Eye Health" />
    <meta itemProp="description" content="An expert, evidence-based guide on blue light exposure from digital screens, detailing its effects on sleep, eye health, and circadian rhythms, with comprehensive strategies to reduce exposure and protect health." />
    <meta itemProp="keywords" content="blue light exposure calculator, blue light sleep disruption, digital eye strain, blue light filter, circadian rhythm health, screen time impact, melatonin suppression" />
    <meta itemProp="author" content="[Your Site's Health Team]" />
    <meta itemProp="datePublished" content="2025-12-01" />
    <meta itemProp="url" content="/definitive-blue-light-exposure-guide" />

    <h1 className="text-3xl md:text-4xl font-extrabold text-foreground mb-4" itemProp="headline">The Definitive Guide to Blue Light Exposure: Protecting Sleep and Eye Health in the Digital Age</h1>
    <p className="text-lg italic text-gray-700">Explore the science of blue light, its effects on sleep and eye health, and comprehensive strategies to reduce exposure from digital screens for better circadian health and visual comfort.</p>


    {/* TABLE OF CONTENTS (INTERNAL LINKS FOR UX AND SEO) */}
    <h2 className="text-2xl font-bold text-foreground mt-8 mb-4">Table of Contents: Jump to a Section</h2>
    <ul className="list-disc ml-6 space-y-2 text-blue-600">
        <li><a href="#what-is-blue-light" className="hover:underline">What is Blue Light and Where Does It Come From</a></li>
        <li><a href="#sleep-effects" className="hover:underline">Blue Light's Impact on Sleep and Circadian Rhythms</a></li>
        <li><a href="#eye-health" className="hover:underline">Effects on Eye Health and Digital Eye Strain</a></li>
        <li><a href="#reduction" className="hover:underline">Strategies to Reduce Blue Light Exposure</a></li>
        <li><a href="#protection" className="hover:underline">Protective Measures and Tools</a></li>
    </ul>
<hr />

    {/* WHAT IS BLUE LIGHT */}
    <h2 id="what-is-blue-light" className="text-2xl font-bold text-foreground pt-8" itemProp="articleSection">What is Blue Light and Where Does It Come From</h2>
    <p>**Blue light** is a high-energy visible (HEV) light with wavelengths between 400-500 nanometers, making it one of the shortest, highest-energy wavelengths in the visible light spectrum. While blue light is naturally present in sunlight and beneficial during daytime, artificial sources—especially digital screens—have raised concerns about excessive exposure, particularly in the evening.</p>

<h3 className="text-xl font-semibold text-foreground mt-6">Natural vs. Artificial Blue Light</h3>
<p>Blue light exists in nature and serves important functions:</p>
<ul>
    <li><b>Sunlight:</b> Contains blue light that helps regulate circadian rhythms, boost alertness, and improve mood during daytime</li>
    <li><b>Daytime benefits:</b> Natural blue light exposure during the day supports healthy sleep-wake cycles and cognitive function</li>
</ul>
<p>However, artificial blue light sources have increased dramatically:</p>
<ul>
    <li><b>Digital screens:</b> Smartphones, tablets, computers, TVs emit significant blue light</li>
    <li><b>LED lighting:</b> Energy-efficient LED bulbs emit more blue light than traditional incandescent bulbs</li>
    <li><b>24/7 exposure:</b> Unlike sunlight, artificial blue light is available at all hours, including evening and night</li>
</ul>

<h3 className="text-xl font-semibold text-foreground mt-6">Why Blue Light Matters</h3>
<p>Blue light's high energy allows it to penetrate deeper into the eye and has stronger effects on biological processes than other wavelengths. This makes it both beneficial (during day) and potentially harmful (at night) depending on timing and amount of exposure.</p>

<hr />

    {/* SLEEP EFFECTS */}
    <h2 id="sleep-effects" className="text-2xl font-bold text-foreground pt-8" itemProp="articleSection">Blue Light's Impact on Sleep and Circadian Rhythms</h2>
    <p>The most well-documented effect of blue light is its impact on sleep through suppression of **melatonin**, the hormone that regulates sleep-wake cycles.</p>

    <h3 className="text-xl font-semibold text-foreground mt-6">Melatonin Suppression</h3>
    <p>Blue light exposure, especially in the evening, suppresses melatonin production:</p>
    <ul>
        <li><b>Mechanism:</b> Blue light is detected by specialized cells in the retina that signal the brain's suprachiasmatic nucleus (SCN), the body's master clock</li>
        <li><b>Effect:</b> SCN signals the pineal gland to stop producing melatonin, keeping you alert</li>
        <li><b>Timing matters:</b> Evening/night exposure is most problematic because it conflicts with natural melatonin rise</li>
        <li><b>Dose-response:</b> Longer exposure and higher brightness increase suppression</li>
    </ul>

    <h3 className="text-xl font-semibold text-foreground mt-6">Sleep Disruption Effects</h3>
    <p>Blue light exposure before bed can cause:</p>
    <ul>
        <li><b>Delayed sleep onset:</b> Taking longer to fall asleep</li>
        <li><b>Reduced sleep quality:</b> Less deep sleep and REM sleep</li>
        <li><b>Circadian misalignment:</b> Shifting sleep-wake cycles later</li>
        <li><b>Morning alertness issues:</b> Difficulty waking up and feeling alert</li>
    </ul>
    <p>Studies show that even 2 hours of evening screen use can delay melatonin onset by 1-2 hours, significantly impacting sleep.</p>

    <h3 className="text-xl font-semibold text-foreground mt-6">Circadian Rhythm Disruption</h3>
    <p>Chronic evening blue light exposure can disrupt circadian rhythms, leading to:</p>
    <ul>
        <li>Irregular sleep patterns</li>
        <li>Difficulty maintaining consistent sleep schedules</li>
        <li>Increased risk of sleep disorders</li>
        <li>Potential long-term health consequences (metabolic issues, mood disorders)</li>
    </ul>

<hr />

    {/* EYE HEALTH */}
    <h2 id="eye-health" className="text-2xl font-bold text-foreground pt-8" itemProp="articleSection">Effects on Eye Health and Digital Eye Strain</h2>
    <p>Beyond sleep, blue light exposure can affect eye health and cause digital eye strain, though research is still evolving on long-term effects.</p>

    <h3 className="text-xl font-semibold text-foreground mt-6">Digital Eye Strain</h3>
    <p>Prolonged screen use can cause digital eye strain (computer vision syndrome) with symptoms including:</p>
    <ul>
        <li><b>Eye fatigue:</b> Tired, sore eyes</li>
        <li><b>Dry eyes:</b> Reduced blinking during screen use</li>
        <li><b>Blurred vision:</b> Difficulty focusing</li>
        <li><b>Headaches:</b> Eye strain-related headaches</li>
        <li><b>Neck and shoulder pain:</b> From poor posture during screen use</li>
    </ul>
    <p>While not solely caused by blue light, blue light's high energy may contribute to eye strain and discomfort.</p>

    <h3 className="text-xl font-semibold text-foreground mt-6">Potential Long-Term Eye Damage</h3>
    <p>Research on long-term blue light damage is ongoing, but concerns include:</p>
    <ul>
        <li><b>Retinal damage:</b> High-energy blue light may contribute to age-related macular degeneration (AMD) risk</li>
        <li><b>Cumulative exposure:</b> Years of screen use may have cumulative effects</li>
        <li><b>Prevention:</b> Using protective measures may reduce long-term risk</li>
    </ul>
    <p>However, evidence for significant long-term damage from typical screen use is still limited. More research is needed.</p>

<hr />

    {/* REDUCTION STRATEGIES */}
    <h2 id="reduction" className="text-2xl font-bold text-foreground pt-8" itemProp="articleSection">Strategies to Reduce Blue Light Exposure</h2>
    <p>Reducing blue light exposure, especially in the evening, is key to protecting sleep and eye health. Here are evidence-based strategies:</p>

    <h3 className="text-xl font-semibold text-foreground mt-6">1. Limit Evening Screen Time</h3>
    <ul>
        <li><b>Screen curfew:</b> Stop using screens 1-2 hours before bedtime</li>
        <li><b>Evening alternatives:</b> Read physical books, listen to podcasts, practice relaxation, or engage in hobbies</li>
        <li><b>Gradual reduction:</b> Start by reducing evening screen time by 30 minutes and gradually increase</li>
    </ul>

    <h3 className="text-xl font-semibold text-foreground mt-6">2. Use Blue Light Filters</h3>
    <ul>
        <li><b>Night mode:</b> Enable night mode or blue light filter settings on all devices</li>
        <li><b>Automatic scheduling:</b> Set filters to activate automatically in the evening (e.g., after 6pm)</li>
        <li><b>Filter strength:</b> Use stronger filters (30-50% reduction) in the evening</li>
        <li><b>All devices:</b> Apply filters to phones, tablets, computers, and TVs</li>
    </ul>

    <h3 className="text-xl font-semibold text-foreground mt-6">3. Reduce Screen Brightness</h3>
    <ul>
        <li><b>Lower settings:</b> Reduce brightness, especially in the evening</li>
        <li><b>Auto-brightness:</b> Use automatic brightness that adapts to ambient light</li>
        <li><b>Dark mode:</b> Use dark mode interfaces when available</li>
        <li><b>Impact:</b> Lower brightness can reduce blue light emission by 20-40%</li>
    </ul>

    <h3 className="text-xl font-semibold text-foreground mt-6">4. Take Regular Breaks</h3>
    <ul>
        <li><b>20-20-20 rule:</b> Every 20 minutes, look at something 20 feet away for 20 seconds</li>
        <li><b>Blink frequently:</b> Remind yourself to blink to prevent dry eyes</li>
        <li><b>Screen breaks:</b> Take 5-10 minute breaks every hour</li>
    </ul>

    <h3 className="text-xl font-semibold text-foreground mt-6">5. Optimize Environment</h3>
    <ul>
        <li><b>Ambient lighting:</b> Ensure adequate room lighting to reduce screen contrast</li>
        <li><b>Screen distance:</b> Maintain proper viewing distance (20-26 inches for computers)</li>
        <li><b>Screen position:</b> Position screens slightly below eye level</li>
        <li><b>Reduce glare:</b> Minimize reflections and glare on screens</li>
    </ul>

<hr />

    {/* PROTECTIVE MEASURES */}
    <h2 id="protection" className="text-2xl font-bold text-foreground pt-8" itemProp="articleSection">Protective Measures and Tools</h2>
    <p>Various tools and technologies can help reduce blue light exposure:</p>

    <h3 className="text-xl font-semibold text-foreground mt-6">Software Solutions</h3>
    <ul>
        <li><b>Night mode:</b> Built-in device settings that reduce blue light (iOS Night Shift, Android Night Light, Windows Night Light)</li>
        <li><b>Third-party apps:</b> Apps like f.lux, Twilight, or Iris that provide customizable blue light filtering</li>
        <li><b>Browser extensions:</b> Extensions that filter blue light on web browsers</li>
        <li><b>Effectiveness:</b> Software filters typically reduce blue light by 20-50%</li>
    </ul>

    <h3 className="text-xl font-semibold text-foreground mt-6">Physical Protection</h3>
    <ul>
        <li><b>Blue light blocking glasses:</b> Glasses with special lenses that filter blue light (20-90% reduction depending on lens)</li>
        <li><b>Screen protectors:</b> Physical filters that attach to screens (30-60% reduction)</li>
        <li><b>When to use:</b> Particularly useful for evening/night use or if you can't reduce screen time</li>
    </ul>

    <h3 className="text-xl font-semibold text-foreground mt-6">Lifestyle Adjustments</h3>
    <ul>
        <li><b>Morning light exposure:</b> Get natural sunlight in the morning to support circadian rhythms</li>
        <li><b>Consistent sleep schedule:</b> Maintain regular sleep-wake times</li>
        <li><b>Bedroom environment:</b> Keep bedroom dark and screen-free</li>
        <li><b>Alternative evening activities:</b> Replace evening screen time with reading, conversation, or relaxation</li>
    </ul>

<hr />

    {/* CONCLUSION */}
    <h2 className="text-2xl font-bold text-foreground pt-8" itemProp="articleSection">Conclusion</h2>
    <p>Blue light exposure from digital screens is a modern health concern, particularly regarding sleep and eye health. While natural blue light during daytime is beneficial, excessive artificial blue light, especially in the evening, can disrupt sleep, suppress melatonin, and contribute to eye strain. By understanding your exposure levels, using protective measures like filters and reduced evening screen time, and implementing healthy screen habits, you can protect your sleep and eye health while still enjoying the benefits of digital technology. Remember: moderation, timing, and protection are key. Limit evening exposure, use filters consistently, and prioritize sleep hygiene for optimal health.</p>
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
          <p>
            This tool gives a simple numerical snapshot of the blue‑tinted screen time you entered so you can reflect on your
            own habits.
          </p>
          <p>
            You can use the score, suggestions, and guide as starting points for small experiments with brightness, timing, and
            breaks, and then keep what genuinely helps you feel better.
          </p>
        </CardContent>
      </Card>

      <p className="mt-6 text-xs text-muted-foreground text-center">
        Disclaimer: This tool provides general wellness and lifestyle insights for educational purposes only. It is not a
        medical or psychological diagnosis. For any health concerns, please consult a qualified professional.
      </p>
    </div>
  );
}

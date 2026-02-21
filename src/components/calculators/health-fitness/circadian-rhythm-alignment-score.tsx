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
  socialJetlagHours: z.number({ invalid_type_error: 'Enter social jetlag' }).min(0).max(6),
  morningLightExposureMinutes: z.number({ invalid_type_error: 'Enter light exposure' }).min(0).max(180),
  eveningScreenExposureMinutes: z.number({ invalid_type_error: 'Enter screen time' }).min(0).max(300),
  scheduleStabilityScore: z.number({ invalid_type_error: 'Enter stability score' }).min(0).max(10),
});

type FormValues = z.infer<typeof formSchema>;

type ResultPayload = {
  socialJetlagHours: number;
  morningLightExposureMinutes: number;
  eveningScreenExposureMinutes: number;
  scheduleStabilityScore: number;
  alignmentScore: number;
  daytimeFunctionScore: number;
  status: 'optimal' | 'good' | 'moderate' | 'low';
  interpretation: string;
  recommendations: string[];
  plan: { label: string; detail: string }[];
};

const steps = [
  'Estimate your average difference in sleep midpoint between workdays and free days (social jetlag) in hours.',
  'Enter your approximate morning outdoor light exposure minutes (within 2–3 hours of waking).',
  'Enter your approximate evening screen exposure minutes in the last 2 hours before bed.',
  'Rate how stable your daily schedule is on a 0–10 scale.',
  'Review your circadian rhythm alignment score, daytime function score, and tailored guidance.',
];

const faqs = [
  {
    question: 'What is circadian rhythm alignment?',
    answer:
      'Circadian alignment describes how well your behaviors and environment line up with your internal 24-hour clock. Better alignment typically supports sleep quality, mood, metabolic health, and daytime performance.',
  },
  {
    question: 'What is social jetlag and why is it important?',
    answer:
      'Social jetlag is the difference between your sleep timing on workdays and free days. Large differences mimic the effects of frequent travel across time zones and are associated with higher risks for metabolic and mood issues.',
  },
  {
    question: 'How does morning light affect circadian rhythm?',
    answer:
      'Bright light in the morning helps anchor your internal clock, promoting earlier melatonin onset in the evening and more stable sleep-wake patterns.',
  },
  {
    question: 'Why does evening screen time matter?',
    answer:
      'Bright, blue-enriched light from screens close to bedtime can delay melatonin release and push your internal clock later, making it harder to fall asleep on time.',
  },
  {
    question: 'Can this tool diagnose circadian rhythm sleep-wake disorders?',
    answer:
      'No. Diagnosing circadian disorders (like delayed sleep-wake phase) requires specialist evaluation. This calculator is meant for lifestyle-oriented reflection and education.',
  },
  {
    question: 'What if I work rotating or night shifts?',
    answer:
      'Shift work places additional strain on circadian systems. You can still use this tool for a given schedule, but personalized guidance from a sleep specialist is recommended.',
  },
  {
    question: 'How quickly can circadian alignment improve after changing habits?',
    answer:
      'Your clock can shift by roughly 15–60 minutes per day depending on light, behavior, and genetics. Gentle, consistent changes tend to be more sustainable than abrupt shifts.',
  },
  {
    question: 'Does chronotype (morning/evening preference) affect my score?',
    answer:
      'This calculator does not explicitly measure chronotype, but people with strong evening preference may experience more social jetlag if schedules force early wake times.',
  },
  {
    question: 'How often should I reassess my circadian alignment?',
    answer:
      'Many people check monthly or during schedule changes (new job, travel, season shifts) to see how alignment shifts over time.',
  },
];

const relatedCalculators = [
  {
    name: 'Sleep Optimization Routine Score',
    slug: 'sleep-optimization-routine-score',
    description: 'Assess how your sleep habits and environment support circadian-friendly rest.',
  },
  {
    name: 'Daily Energy & Mood Synchronization Tracker',
    slug: 'daily-energy-mood-synchronization-tracker',
    description: 'Track when throughout the day you feel most alert or fatigued relative to your schedule.',
  },
  {
    name: 'UV Exposure Risk Calculator',
    slug: 'uv-exposure-risk-calculator',
    description: 'Balance sun exposure habits with skin safety as you seek morning daylight.',
  },
  {
    name: 'HRV Resilience Index',
    slug: 'hrv-resilience-index',
    description: 'See how autonomic resilience may respond to better circadian alignment.',
  },
];

const baseUrl = 'https://mycalculating.com/category/health-fitness/circadian-rhythm-alignment-score';

const schemaMarkup = {
  '@context': 'https://schema.org',
  '@graph': [
    {
      '@type': 'BreadcrumbList',
      itemListElement: [
        { '@type': 'ListItem', position: 1, name: 'Home', item: 'https://mycalculating.com' },
        { '@type': 'ListItem', position: 2, name: 'Health & Fitness', item: 'https://mycalculating.com/category/health-fitness' },
        { '@type': 'ListItem', position: 3, name: 'Circadian Rhythm Alignment Score', item: baseUrl },
      ],
    },
    {
      '@type': 'SoftwareApplication',
      name: 'Circadian Rhythm Alignment Score',
      applicationCategory: 'Calculator',
      operatingSystem: 'Web Browser',
      description:
        'Estimate how well your daily schedule, light exposure, and screen habits align with your circadian rhythm.',
      url: baseUrl,
      offers: { '@type': 'Offer', price: '0', priceCurrency: 'USD' },
    },
  ],
};

const clamp = (value: number, min: number, max: number) => Math.min(max, Math.max(min, value));

const calculateResult = (values: FormValues): ResultPayload => {
  const { socialJetlagHours, morningLightExposureMinutes, eveningScreenExposureMinutes, scheduleStabilityScore } = values;

  const socialJetlagPenalty = clamp((socialJetlagHours / 3) * 40, 0, 40);

  const morningLightBonus = clamp((morningLightExposureMinutes / 60) * 30, 0, 30);
  const eveningScreenPenalty = clamp((eveningScreenExposureMinutes / 120) * 30, 0, 30);

  const stabilityComponent = (scheduleStabilityScore / 10) * 40;

  const baseAlignment = 70 + morningLightBonus + stabilityComponent - socialJetlagPenalty - eveningScreenPenalty;
  const alignmentScore = clamp(baseAlignment, 0, 100);

  const daytimeFunctionScore = clamp(
    (100 - socialJetlagPenalty) * 0.4 + morningLightBonus * 0.3 + (40 - eveningScreenPenalty) * 0.3,
    0,
    100,
  );

  let status: ResultPayload['status'] = 'moderate';
  let interpretation =
    'Your circadian alignment appears mixed. Some elements support your internal clock, while others may be pulling it off-center.';

  if (alignmentScore >= 80 && daytimeFunctionScore >= 75) {
    status = 'optimal';
    interpretation =
      'Your schedule, light exposure, and evening habits look quite supportive of circadian alignment for many people.';
  } else if (alignmentScore >= 60) {
    status = 'good';
    interpretation =
      'Your circadian alignment is reasonably supportive overall. Small tweaks in light timing or schedule stability could improve it further.';
  } else if (alignmentScore < 40 || socialJetlagHours >= 2) {
    status = 'low';
    interpretation =
      'Your current pattern suggests meaningful circadian strain. Large gaps between workday and weekend timing or heavy late-evening screen use may be contributing.';
  }

  const recommendations: string[] = [
    'Aim to keep your sleep and wake times within about 1 hour of each other across the week to reduce social jetlag.',
    'Seek outdoor light or bright window light within 2 hours of waking for at least 10–30 minutes when feasible.',
    'Reduce intense screen use, bright overhead lights, and highly stimulating content in the last 1–2 hours before bed.',
  ];

  if (socialJetlagHours >= 1.5) {
    recommendations.push(
      'Gradually shift your weekend bed and wake times closer to your workday schedule, or discuss options to adjust your work timing if possible.',
    );
  }

  if (eveningScreenExposureMinutes >= 90) {
    recommendations.push(
      'Consider dimming screens, using night-shift modes, or replacing part of evening screen time with lower-light activities.',
    );
  }

  const plan = [
    {
      label: 'This Week',
      detail:
        'Experiment with 10–20 minutes of outdoor light most mornings and reducing bright screens for at least 30 minutes before bed.',
    },
    {
      label: 'This Month',
      detail:
        'Nudge your sleep window to be more consistent across workdays and free days, and revisit your alignment score after a few weeks.',
    },
    {
      label: 'Ongoing',
      detail:
        'Track changes in energy, mood, and sleep as you maintain stronger circadian cues, and seek sleep-focused clinical advice if major problems persist.',
    },
  ];

  return {
    socialJetlagHours,
    morningLightExposureMinutes,
    eveningScreenExposureMinutes,
    scheduleStabilityScore,
    alignmentScore: Number(alignmentScore.toFixed(1)),
    daytimeFunctionScore: Number(daytimeFunctionScore.toFixed(1)),
    status,
    interpretation,
    recommendations,
    plan,
  };
};

export default function CircadianRhythmAlignmentScore() {
  const [result, setResult] = useState<ResultPayload | null>(null);

  const form = useForm<FormValues>({
    resolver: zodResolver(formSchema),
    defaultValues: {
      socialJetlagHours: undefined,
      morningLightExposureMinutes: undefined,
      eveningScreenExposureMinutes: undefined,
      scheduleStabilityScore: undefined,
    },
  });

  return (
    <div className="space-y-8">
      <Script
        id="circadian-rhythm-alignment-schema"
        type="application/ld+json"
        strategy="afterInteractive"
        dangerouslySetInnerHTML={{ __html: JSON.stringify(schemaMarkup) }}
      />

      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <Activity className="h-5 w-5" />
            Circadian Rhythm Alignment Score
          </CardTitle>
          <CardDescription>
            Estimate how aligned your sleep timing, light exposure, and evening habits are with your internal clock.
          </CardDescription>
        </CardHeader>
      </Card>

      <Card>
        <CardHeader>
          <CardTitle>Input your circadian-relevant habits</CardTitle>
        </CardHeader>
        <CardContent>
          <Form {...form}>
            <form onSubmit={form.handleSubmit((values) => setResult(calculateResult(values)))} className="space-y-6">
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <FormField
                  control={form.control}
                  name="socialJetlagHours"
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel>Social jetlag (hours)</FormLabel>
                      <FormControl>
                        <Input
                          type="number"
                          step="0.25"
                          placeholder="e.g., 1.5"
                          value={field.value ?? ''}
                          onChange={(e) => field.onChange(e.target.value === '' ? undefined : Number(e.target.value))}
                        />
                      </FormControl>
                      <FormMessage />
                    </FormItem>
                  )}
                />
                <FormField
                  control={form.control}
                  name="morningLightExposureMinutes"
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel>Morning light exposure (minutes)</FormLabel>
                      <FormControl>
                        <Input
                          type="number"
                          step="5"
                          placeholder="e.g., 20"
                          value={field.value ?? ''}
                          onChange={(e) => field.onChange(e.target.value === '' ? undefined : Number(e.target.value))}
                        />
                      </FormControl>
                      <FormMessage />
                    </FormItem>
                  )}
                />
                <FormField
                  control={form.control}
                  name="eveningScreenExposureMinutes"
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel>Evening screen exposure (last 2 hours before bed, minutes)</FormLabel>
                      <FormControl>
                        <Input
                          type="number"
                          step="5"
                          placeholder="e.g., 90"
                          value={field.value ?? ''}
                          onChange={(e) => field.onChange(e.target.value === '' ? undefined : Number(e.target.value))}
                        />
                      </FormControl>
                      <FormMessage />
                    </FormItem>
                  )}
                />
                <FormField
                  control={form.control}
                  name="scheduleStabilityScore"
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel>Schedule stability (0–10)</FormLabel>
                      <FormControl>
                        <Input
                          type="number"
                          step="0.5"
                          placeholder="e.g., 7.5"
                          value={field.value ?? ''}
                          onChange={(e) => field.onChange(e.target.value === '' ? undefined : Number(e.target.value))}
                        />
                      </FormControl>
                      <FormMessage />
                    </FormItem>
                  )}
                />
              </div>
              <Button type="submit" className="w-full md:w-auto">
                Calculate circadian alignment
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
            <CardDescription>See alignment, daytime function, and suggested next steps.</CardDescription>
          </CardHeader>
          <CardContent className="space-y-6">
            <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
              <div className="p-4 border rounded">
                <p className="text-sm text-muted-foreground">Alignment score</p>
                <p className="text-2xl font-semibold text-primary">{result.alignmentScore}</p>
                <p className="text-xs text-muted-foreground">0–100 scale</p>
              </div>
              <div className="p-4 border rounded">
                <p className="text-sm text-muted-foreground">Daytime function score</p>
                <p className="text-2xl font-semibold text-primary">{result.daytimeFunctionScore}</p>
                <p className="text-xs text-muted-foreground">Higher = better support</p>
              </div>
              <div className="p-4 border rounded">
                <p className="text-sm text-muted-foreground">Social jetlag</p>
                <p className="text-2xl font-semibold text-primary">{result.socialJetlagHours.toFixed(2)} h</p>
                <p className="text-xs text-muted-foreground">Workday vs. free-day shift</p>
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
            <strong>Circadian alignment score</strong> rewards lower social jetlag, more morning light, more stable
            schedules, and penalizes heavy evening screen time, scaled to 0–100.
          </p>
          <p>
            <strong>Daytime function score</strong> emphasizes the aspects most closely tied to how you feel during the
            day: smaller timing shifts, adequate morning signals, and fewer late-evening light disruptions.
          </p>
          <p>
            These indices are not medical diagnostics but clear, interpretable markers you can track as you adjust your
            habits toward more circadian-friendly patterns.
          </p>
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
                <p className="text-sm text-muted-foreground">Morning light</p>
                <p className="text-xl font-semibold text-primary">{result.morningLightExposureMinutes.toFixed(0)} min</p>
                <p className="text-xs text-muted-foreground">Exposure near wake time</p>
              </div>
              <div className="p-4 border rounded">
                <p className="text-sm text-muted-foreground">Evening screens</p>
                <p className="text-xl font-semibold text-primary">
                  {result.eveningScreenExposureMinutes.toFixed(0)} min
                </p>
                <p className="text-xs text-muted-foreground">Last 2 hours pre-bed</p>
              </div>
              <div className="p-4 border rounded">
                <p className="text-sm text-muted-foreground">Schedule stability</p>
                <p className="text-xl font-semibold text-primary">{result.scheduleStabilityScore.toFixed(1)}/10</p>
                <p className="text-xs text-muted-foreground">Higher = more regular rhythm</p>
              </div>
            </div>
          ) : (
            <p className="text-sm text-muted-foreground">
              Enter your circadian-related behaviors to see additional metrics and breakdowns.
            </p>
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

      <section
        className="space-y-6 text-muted-foreground leading-relaxed bg-white p-6 md:p-10 rounded-lg shadow-lg"
        itemScope
        itemType="https://schema.org/MedicalWebPage"
      >
        <meta
          itemProp="name"
          content="Circadian Rhythm Alignment Score: How Well Does Your Life Match Your Internal Clock?"
        />
        <meta
          itemProp="description"
          content="Understand how social jetlag, light exposure, and schedule stability shape circadian alignment, and how to use this score to guide gentle, evidence-informed habit changes."
        />
        <meta
          itemProp="keywords"
          content="circadian rhythm alignment score, social jetlag calculator, morning light exposure, evening screen time, circadian health"
        />
        <meta itemProp="author" content="[Your Site's Health Team]" />
        <meta itemProp="datePublished" content="2025-12-01" />
        <meta itemProp="url" content="/circadian-rhythm-alignment-score-guide" />

        <h1 className="text-3xl md:text-4xl font-extrabold text-foreground mb-4" itemProp="headline">
          Circadian Rhythm Alignment Score: A Practical Framework for Daily Rhythm Hygiene
        </h1>
        <p className="text-lg italic text-gray-700">
          This guide explains why circadian alignment matters, how common habits affect your internal clock, and how to
          interpret your alignment score in a balanced, realistic way.
        </p>

        <h2 className="text-2xl font-bold text-foreground mt-8 mb-4">Table of Contents</h2>
        <ul className="list-disc ml-6 space-y-2 text-blue-600">
          <li>
            <a href="#why-circadian" className="hover:underline">
              1. Why Circadian Alignment Matters for Health and Performance
            </a>
          </li>
          <li>
            <a href="#social-jetlag" className="hover:underline">
              2. Social Jetlag: The Hidden Time-Zone Shift in Your Week
            </a>
          </li>
          <li>
            <a href="#light-cues" className="hover:underline">
              3. Light Cues: Morning Anchors and Evening Disruptors
            </a>
          </li>
          <li>
            <a href="#stability" className="hover:underline">
              4. Schedule Stability and Real-World Constraints
            </a>
          </li>
          <li>
            <a href="#next-steps" className="hover:underline">
              5. Using Your Alignment Score to Choose Gentle Next Steps
            </a>
          </li>
        </ul>

        <hr />

        <h2 id="why-circadian" className="text-2xl font-bold text-foreground pt-8" itemProp="articleSection">
          1. Why Circadian Alignment Matters for Health and Performance
        </h2>
        <p>
          Your circadian system coordinates daily rhythms in hormones, core body temperature, digestion, mood, and
          cognition. When your behaviors—sleep timing, light exposure, meals, and activity—line up with your internal
          clock, those systems can run more smoothly. Misalignment, on the other hand, has been associated in research
          with increased risks for metabolic issues, cardiovascular disease, mood disorders, and performance decrements.
        </p>
        <p>
          The circadian rhythm alignment score organizes several modifiable behaviors into one interpretable index. It
          does not measure your biological clock directly, but it shows how supportive your daily rhythm is likely to
          be, based on broadly evidence-informed principles.
        </p>

        <h2 id="social-jetlag" className="text-2xl font-bold text-foreground pt-8" itemProp="articleSection">
          2. Social Jetlag: The Hidden Time-Zone Shift in Your Week
        </h2>
        <p>
          Many people keep early schedules during the workweek and shift to much later bed and wake times on weekends.
          This pattern is called social jetlag because it mimics repeatedly flying across time zones without leaving
          home. Larger gaps between workday and free-day sleep timing are linked to greater health risks in
          observational studies, even when total sleep duration is similar.
        </p>
        <p>
          Reducing social jetlag does not require perfection. Often, moving free-day bed and wake times 30–60 minutes
          closer to workday timing can significantly reduce strain, while still allowing for social flexibility. The
          alignment score highlights when this gap has grown large enough to warrant attention.
        </p>

        <h2 id="light-cues" className="text-2xl font-bold text-foreground pt-8" itemProp="articleSection">
          3. Light Cues: Morning Anchors and Evening Disruptors
        </h2>
        <p>
          Light is the strongest external cue (zeitgeber) for circadian rhythms. Bright, naturalistic light in the
          morning anchors your clock and supports daytime alertness, while intense light at night pushes your clock
          later. This is why a short outdoor walk within the first few hours after waking and dimming lights in the
          evening can have outsized impact on how easily you fall asleep and wake up.
        </p>
        <p>
          Screens are not inherently “bad,” but using very bright screens close to your face late into the evening
          makes it harder for your brain to recognize that night has arrived. The alignment calculator encourages
          pragmatic steps—slightly less screen time, lower brightness, or warmer color temperature—rather than all-or-
          nothing thinking.
        </p>

        <h2 id="stability" className="text-2xl font-bold text-foreground pt-8" itemProp="articleSection">
          4. Schedule Stability and Real-World Constraints
        </h2>
        <p>
          Life rarely allows perfectly stable schedules. Childcare, shift work, travel, and social obligations all pull
          on your rhythm. The schedule stability rating in this tool acknowledges that reality while still honoring the
          value of routines: even partial regularity can help your body anticipate when to be alert and when to wind
          down.
        </p>
        <p>
          If your schedule feels chaotic, start by stabilizing one anchor—such as wake time or first meal—before trying
          to overhaul everything at once. Over time, these anchors can make it easier to maintain alignment even when
          individual days are unpredictable.
        </p>

        <h2 id="next-steps" className="text-2xl font-bold text-foreground pt-8" itemProp="articleSection">
          5. Using Your Alignment Score to Choose Gentle Next Steps
        </h2>
        <p>
          Your circadian rhythm alignment score is not a judgment; it is a map. Rather than trying to fix everything
          overnight, choose one or two next steps that feel achievable this month—such as adding 10 minutes of morning
          light, turning down screens earlier, or aligning weekend wake times a bit closer to weekdays.
        </p>
        <p>
          Over time, repeated small improvements often beat short-lived perfection. If sleep, mood, or daytime function
          remain significantly impaired despite these efforts, consider working with a sleep or behavioral health
          specialist who can tailor strategies to your medical and life context.
        </p>

        <hr />
        <h2 className="text-2xl font-bold text-foreground pt-8" itemProp="articleSection">
          Conclusion
        </h2>
        <p>
          Circadian alignment is a powerful but often overlooked part of health. By translating social jetlag, light
          exposure, and schedule stability into a single score, this tool gives you a clear picture of where your rhythm
          supports you and where it could use refinement. Use it as a guide for gentle, sustainable changes and as a
          starting point for deeper conversations with your healthcare team.
        </p>
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
            This calculator estimates a circadian rhythm alignment score and daytime function index from social jetlag,
            light exposure, screen habits, and schedule stability.
          </p>
          <p>
            It highlights practical levers you can adjust to bring your daily rhythm closer to what your biology
            expects, while respecting real-world constraints.
          </p>
          <p>
            Always interpret results with context and, when in doubt, seek advice from clinicians experienced in sleep
            and circadian health.
          </p>
        </CardContent>
      </Card>
    </div>
  );
}




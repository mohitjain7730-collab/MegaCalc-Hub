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
  deviceIrradiance: z.number({ invalid_type_error: 'Enter irradiance' }).min(1).max(200),
  distanceCm: z.number({ invalid_type_error: 'Enter distance' }).min(5).max(100),
  targetDose: z.number({ invalid_type_error: 'Enter dose' }).min(1).max(100),
  sessionsPerWeek: z.number({ invalid_type_error: 'Enter sessions' }).min(1).max(14),
});

type FormValues = z.infer<typeof formSchema>;

type ResultPayload = {
  deviceIrradiance: number;
  distanceCm: number;
  targetDose: number;
  sessionsPerWeek: number;
  recommendedMinutes: number;
  weeklyDose: number;
  status: 'optimal' | 'good' | 'moderate' | 'low';
  interpretation: string;
  recommendations: string[];
  plan: { label: string; detail: string }[];
};

const steps = [
  'Enter your deviceâ€™s irradiance at the manufacturerâ€™s reference distance (mW/cmÂ²).',
  'Enter your planned distance from the device in centimeters.',
  'Enter your desired dose per session in J/cmÂ² (often 3â€“10 J/cmÂ² for skin or 10â€“60 J/cmÂ² for deeper tissues in research contexts).',
  'Enter how many sessions per week you plan to do.',
  'Review recommended session minutes, total weekly dose, and usage guidance.',
];

const faqs = [
  {
    question: 'What is irradiance?',
    answer:
      'Irradiance is the power of light delivered per unit area, usually expressed in milliwatts per square centimeter (mW/cmÂ²).',
  },
  {
    question: 'What does J/cmÂ² mean?',
    answer:
      'Joules per square centimeter (J/cmÂ²) is a measure of energy delivered per unit area. Dose = irradiance Ã— time, adjusted for distance.',
  },
  {
    question: 'Is red light therapy safe for everyone?',
    answer:
      'Most healthy adults tolerate it well at reasonable doses, but people with photosensitivity, certain eye/skin conditions, or on photosensitizing medications should consult a clinician first.',
  },
  {
    question: 'Does this replace medical advice?',
    answer:
      'No. It is an educational dose planner. Always follow device instructions and professional guidance.',
  },
  {
    question: 'How accurate is distance adjustment?',
    answer:
      'This calculator uses an approximate inverse-square scaling; real-world devices may deviate due to optics and reflections.',
  },
  {
    question: 'Can more light be harmful?',
    answer:
      'Yes. Photobiomodulation often follows a biphasic dose response: too little may be ineffective, while too much can reduce benefits or cause irritation.',
  },
  {
    question: 'Should I wear eye protection?',
    answer:
      'Eye protection is often recommended, especially with high-intensity devices or if you have eye conditions; follow device and professional guidance.',
  },
  {
    question: 'How often should I treat the same area?',
    answer:
      'Many protocols use several sessions per week per area, with off-days for recovery. Overlapping sites or multiple protocols may require professional input.',
  },
  {
    question: 'Does wavelength matter?',
    answer:
      'Yes. Most therapeutic devices use red (around 630â€“670 nm) and near-infrared (around 810â€“880 nm). This calculator does not distinguish wavelengths but assumes appropriate therapeutic ranges.',
  },
  {
    question: 'Can I use this for whole-body panels?',
    answer:
      'Yes, as a rough planner, but check manufacturer specs and consider body region, skin type, and medical context.',
  },
];

const relatedCalculators = [
  {
    name: 'UV Exposure Risk Calculator',
    slug: 'uv-exposure-risk-calculator',
    description: 'Balance red light sessions with sun safety.',
  },
  {
    name: 'Sauna Session Detox Score Calculator',
    slug: 'sauna-session-detox-score-calculator',
    description: 'Combine heat and light strategies thoughtfully.',
  },
  {
    name: 'Daily Screen Exposure Stress Index Calculator',
    slug: 'daily-screen-exposure-stress-index-calculator',
    description: 'Contrast therapeutic vs. stress-inducing light exposure.',
  },
];

const baseUrl = 'https://mycalculating.com/health-fitness/red-light-therapy-dose-calculator';

const schemaMarkup = {
  '@context': 'https://schema.org',
  '@graph': [
    {
      '@type': 'BreadcrumbList',
      itemListElement: [
        { '@type': 'ListItem', position: 1, name: 'Home', item: 'https://mycalculating.com' },
        { '@type': 'ListItem', position: 2, name: 'Health & Fitness', item: 'https://mycalculating.com/health-fitness' },
        { '@type': 'ListItem', position: 3, name: 'Red Light Therapy Wellness Dose Estimator', item: baseUrl },
      ],
    },
    {
      '@type': 'SoftwareApplication',
      name: 'Red Light Therapy Wellness Dose Estimator',
      applicationCategory: 'Calculator',
      operatingSystem: 'Web Browser',
      description:
        'Get general wellness insights to plan approximate red light therapy doses (J/cmÂ²) per session based on irradiance, distance, and time. This is a personal lifestyle insight, not a medical evaluation.',
      url: baseUrl,
      offers: { '@type': 'Offer', price: '0', priceCurrency: 'USD' },
    },
  ],
};

const clamp = (value: number, min: number, max: number) => Math.min(max, Math.max(min, value));

const calculateResult = (values: FormValues): ResultPayload => {
  const { deviceIrradiance, distanceCm, targetDose, sessionsPerWeek } = values;

  // Simple inverse-square approximation vs. reference distance of 20 cm
  const referenceDistance = 20;
  const distanceFactor = (referenceDistance / distanceCm) ** 2;
  const effectiveIrradiance = deviceIrradiance * clamp(distanceFactor, 0.2, 2); // avoid extremes

  // Dose (J/cmÂ²) = irradiance (mW/cmÂ²) Ã— time (seconds) / 1000
  const secondsNeeded = (targetDose * 1000) / effectiveIrradiance;
  const minutesNeeded = secondsNeeded / 60;

  const weeklyDose = targetDose * sessionsPerWeek;

  let status: ResultPayload['status'] = 'good';
  let interpretation =
    'This suggests a general lifestyle tendency where your planned dose per session may sit within commonly discussed photobiomodulation ranges for many personal goals.';

  if (targetDose < 3) {
    status = 'moderate';
    interpretation =
      'This suggests a general lifestyle tendency where your planned dose may be on the gentler side for many applications, so effects might feel subtle. You may treat this as an experiment and adjust slowly if it feels appropriate.';
  } else if (targetDose > 60 || weeklyDose > 300) {
    status = 'low';
    interpretation =
      'This suggests a general lifestyle tendency where your planned dose may be relatively high compared with many reference protocols. You may consider softening intensity, duration, or frequency and, if you wish, discussing your approach with a professional familiar with lightâ€‘based therapies. This is a personal insight, not a medical evaluation.';
  } else if (targetDose >= 5 && targetDose <= 20 && weeklyDose <= 150) {
    status = 'optimal';
    interpretation =
      'This suggests a general lifestyle tendency where your planned dose and weekly exposure may be broadly similar to many published lightâ€‘therapy ranges in educational examples.';
  }

  const recommendations: string[] = [
    'Confirm your device irradiance values from manufacturer data or independent measurements where possible.',
    'Start with conservative doses and increase gradually only if well tolerated and clinically appropriate.',
    'Avoid shining high-intensity light directly into the eyes and follow device safety guidelines.',
  ];

  if (minutesNeeded > 20) {
    recommendations.push('Long sessions may be impractical; consider reducing target dose or adjusting distance/light intensity.');
  }

  if (sessionsPerWeek > 7) {
    recommendations.push('Treating the same area daily or multiple times per day may require clinical supervision.');
  }

  const plan = [
    { label: 'This Week', detail: 'Test your planned protocol on a small area and monitor skin, sleep, and how you feel.' },
    { label: 'This Month', detail: 'Adjust dose or frequency based on response and any clinician feedback.' },
    { label: 'Ongoing', detail: 'Revisit parameters when changing devices, distances, or target areas.' },
  ];

  return {
    deviceIrradiance,
    distanceCm,
    targetDose,
    sessionsPerWeek,
    recommendedMinutes: Number(minutesNeeded.toFixed(1)),
    weeklyDose: Number(weeklyDose.toFixed(1)),
    status,
    interpretation,
    recommendations,
    plan,
  };
};

export default function RedLightTherapyDoseCalculator() {
  const [result, setResult] = useState<ResultPayload | null>(null);

  const form = useForm<FormValues>({
    resolver: zodResolver(formSchema),
    defaultValues: {
      deviceIrradiance: undefined,
      distanceCm: 20,
      targetDose: undefined,
      sessionsPerWeek: undefined,
    },
  });

  return (
    <div className="space-y-8">
      <Script id="red-light-therapy-dose-schema" type="application/ld+json" strategy="afterInteractive" dangerouslySetInnerHTML={{ __html: JSON.stringify(schemaMarkup) }} />

      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <Activity className="h-5 w-5" />
            Red Light Therapy Wellness Dose Estimator
          </CardTitle>
          <CardDescription>
            Get general wellness insights to plan approximate session durations and weekly doses for red/nearâ€‘infrared
            light therapy. This is a personal lifestyle insight, not a medical evaluation.
          </CardDescription>
        </CardHeader>
      </Card>

      <Card>
        <CardHeader>
          <CardTitle>Input your device and protocol</CardTitle>
        </CardHeader>
        <CardContent>
          <Form {...form}>
            <form onSubmit={form.handleSubmit((values) => setResult(calculateResult(values)))} className="space-y-6">
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <FormField
                  control={form.control}
                  name="deviceIrradiance"
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel>Device irradiance (mW/cmÂ² at 20 cm)</FormLabel>
                      <FormControl>
                        <Input type="number" step="1" placeholder="e.g., 60" value={field.value ?? ''} onChange={(e) => field.onChange(e.target.value === '' ? undefined : Number(e.target.value))} />
                      </FormControl>
                      <FormMessage />
                    </FormItem>
                  )}
                />
                <FormField
                  control={form.control}
                  name="distanceCm"
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel>Distance from device (cm)</FormLabel>
                      <FormControl>
                        <Input type="number" step="1" placeholder="e.g., 20" value={field.value ?? ''} onChange={(e) => field.onChange(e.target.value === '' ? undefined : Number(e.target.value))} />
                      </FormControl>
                      <FormMessage />
                    </FormItem>
                  )}
                />
                <FormField
                  control={form.control}
                  name="targetDose"
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel>Target dose per session (J/cmÂ²)</FormLabel>
                      <FormControl>
                        <Input type="number" step="0.5" placeholder="e.g., 6" value={field.value ?? ''} onChange={(e) => field.onChange(e.target.value === '' ? undefined : Number(e.target.value))} />
                      </FormControl>
                      <FormMessage />
                    </FormItem>
                  )}
                />
                <FormField
                  control={form.control}
                  name="sessionsPerWeek"
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel>Sessions per week</FormLabel>
                      <FormControl>
                        <Input type="number" step="1" placeholder="e.g., 4" value={field.value ?? ''} onChange={(e) => field.onChange(e.target.value === '' ? undefined : Number(e.target.value))} />
                      </FormControl>
                      <FormMessage />
                    </FormItem>
                  )}
                />
              </div>
              <Button type="submit" className="w-full md:w-auto">
                Calculate red light dose
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
            <CardDescription>See recommended minutes per session, weekly dose, and safety notes.</CardDescription>
          </CardHeader>
          <CardContent className="space-y-6">
            <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
              <div className="p-4 border rounded">
                <p className="text-sm text-muted-foreground">Recommended session time</p>
                <p className="text-2xl font-semibold text-primary">{result.recommendedMinutes}</p>
                <p className="text-xs text-muted-foreground">Minutes per session</p>
              </div>
              <div className="p-4 border rounded">
                <p className="text-sm text-muted-foreground">Weekly dose</p>
                <p className="text-2xl font-semibold text-primary">{result.weeklyDose}</p>
                <p className="text-xs text-muted-foreground">J/cmÂ² per area</p>
              </div>
              <div className="p-4 border rounded">
                <p className="text-sm text-muted-foreground">Distance factor</p>
                <p className="text-2xl font-semibold text-primary">
                  {((20 / result.distanceCm) ** 2).toFixed(2)}
                </p>
                <p className="text-xs text-muted-foreground">Relative to 20 cm</p>
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
            <strong>Effective irradiance</strong> is adjusted from the reference value using an approximate inverse-square relationship with distance.
          </p>
          <p>
            <strong>Session time</strong> is computed from Dose = Irradiance Ã— Time, rearranged to Time = Dose Ã— 1000 Ã· Irradiance.
          </p>
          <p>
            <strong>Weekly dose</strong> multiplies per-session dose by planned sessions per week to provide a rough cumulative exposure estimate.
          </p>
          <p>Use these figures as planning aids, and always prioritize manufacturer instructions and medical advice.</p>
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
                <p className="text-sm text-muted-foreground">Effective irradiance</p>
                <p className="text-xl font-semibold text-primary">
                  {(
                    result.deviceIrradiance *
                    clamp((20 / result.distanceCm) ** 2, 0.2, 2)
                  ).toFixed(1)}
                </p>
                <p className="text-xs text-muted-foreground">mW/cmÂ² at chosen distance</p>
              </div>
              <div className="p-4 border rounded">
                <p className="text-sm text-muted-foreground">Dose per minute</p>
                <p className="text-xl font-semibold text-primary">
                  {(
                    (result.deviceIrradiance *
                      clamp((20 / result.distanceCm) ** 2, 0.2, 2) *
                      60) /
                    1000
                  ).toFixed(2)}
                </p>
                <p className="text-xs text-muted-foreground">J/cmÂ² per minute</p>
              </div>
              <div className="p-4 border rounded">
                <p className="text-sm text-muted-foreground">Dose risk flag</p>
                <p className="text-xl font-semibold text-primary">
                  {result.weeklyDose > 300 ? 'High' : result.weeklyDose > 150 ? 'Moderate' : 'Low'}
                </p>
                <p className="text-xs text-muted-foreground">Relative to many protocols</p>
              </div>
            </div>
          ) : (
            <p className="text-sm text-muted-foreground">Enter your device data to unlock more details.</p>
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

      <section
        className="space-y-6 text-muted-foreground leading-relaxed bg-white p-6 md:p-10 rounded-lg shadow-lg"
        itemScope
        itemType="https://schema.org/MedicalWebPage"
      >
        <meta
          itemProp="name"
          content="Red Light Therapy Dosing: From Manufacturer Specs to Real-World Sessions"
        />
        <meta
          itemProp="description"
          content="Learn how to translate device irradiance and distance into approximate red light therapy doses, and how to use those estimates safely."
        />
        <meta
          itemProp="keywords"
          content="red light therapy dose calculator, photobiomodulation, J/cm2, irradiance, treatment time"
        />
        <meta itemProp="author" content="[Your Site's Health Team]" />
        <meta itemProp="datePublished" content="2025-12-01" />
        <meta itemProp="url" content="/definitive-red-light-therapy-dose-guide" />

        <h1 className="text-3xl md:text-4xl font-extrabold text-foreground mb-4" itemProp="headline">
          Red Light Therapy Dosing: Demystifying J/cmÂ² for Everyday Use
        </h1>
        <p className="text-lg italic text-gray-700">
          Device marketing often throws around numbers without context. This guide explains how dose is calculated and how to think about it pragmatically.
        </p>

        <h2 className="text-2xl font-bold text-foreground mt-8 mb-4">1. Understanding Power vs. Energy</h2>
        <p>
          Irradiance (mW/cmÂ²) measures how intense the light is right now; energy (J/cmÂ²) measures how much light has been delivered over time. Both matter when planning sessions.
        </p>

        <h2 className="text-2xl font-bold text-foreground mt-8 mb-4">2. The Inverse-Square Principle</h2>
        <p>
          As you move away from a point-like light source, intensity drops quickly. Panels are more complex, but distance still has a major impact on dose. Treat manufacturer specs as starting points, not absolute truths.
        </p>

        <h2 className="text-2xl font-bold text-foreground mt-8 mb-4">3. Research Ranges and Safety Windows</h2>
        <p>
          Many studies use doses in the single or low double digits of J/cmÂ² per session for skin, and somewhat higher for deeper tissues. Exposures far above typical ranges should be discussed with professionals.
        </p>

        <h2 className="text-2xl font-bold text-foreground mt-8 mb-4">4. Integrating with Broader Protocols</h2>
        <p>
          If you are also using sauna, exercise, or other hormetic stressors, total load matters. Small stresses can help; stacking too many can exhaust recovery capacity.
        </p>

        <h2 className="text-2xl font-bold text-foreground mt-8 mb-4">5. When to Involve a Clinician</h2>
        <p>
          For chronic illness, injuries, or eye/skin conditions, or when using very high-power devices, guidance from a clinician with photobiomodulation experience is strongly recommended.
        </p>

        <hr />
        <h2 className="text-2xl font-bold text-foreground pt-8" itemProp="articleSection">
          Conclusion
        </h2>
        <p>
          Red light therapy holds promise, but thoughtful dosing is crucial. This calculator and guide help you ask better questions and structure experiments, not replace medical care.
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
            This calculator provides general wellness insights by estimating red light therapy session times and weekly
            doses from device specs and user settings. This is a personal lifestyle insight, not a medical evaluation.
          </p>
          <p>It outputs recommended minutes, weekly dose, qualitative status, recommendations, an action plan, and extra technical metrics.</p>
          <p>An extended guide and FAQs clarify how to interpret dose estimates in realâ€‘world use.</p>
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
          <p>
            Disclaimer: This tool provides general wellness and lifestyle insights for educational purposes only. It is
            not a medical or psychological diagnosis. For any health concerns, please consult a qualified professional.
          </p>
        </CardContent>
      </Card>
    </div>
  );
}



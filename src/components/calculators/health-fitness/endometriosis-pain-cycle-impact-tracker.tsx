'use client';

import { useState } from 'react';
import Script from 'next/script';
import Link from 'next/link';
import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import { z } from 'zod';
import { AlertTriangle, Zap, Target, Activity, Shield } from 'lucide-react';

import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Form, FormControl, FormField, FormItem, FormLabel, FormMessage } from '@/components/ui/form';
import { Input } from '@/components/ui/input';

const formSchema = z.object({
  painLevel: z.number({ invalid_type_error: 'Enter pain level' }).min(0).max(10),
  painDuration: z.number({ invalid_type_error: 'Enter pain duration' }).min(0).max(10),
  cycleDay: z.number({ invalid_type_error: 'Enter cycle day' }).min(1).max(35),
  painLocation: z.enum(['pelvic', 'lower-back', 'abdominal', 'multiple']),
  impactOnDailyLife: z.number({ invalid_type_error: 'Enter impact score' }).min(0).max(10),
  bleedingSeverity: z.number({ invalid_type_error: 'Enter bleeding severity' }).min(0).max(10),
});

type FormValues = z.infer<typeof formSchema>;

type ResultPayload = {
  impactScore: number;
  painSeverity: number;
  cycleImpact: number;
  status: 'mild' | 'moderate' | 'severe';
  interpretation: string;
  recommendations: string[];
  plan: { label: string; detail: string }[];
};

const steps = [
  'Rate pain level (0 = none, 10 = severe) and pain duration (0 = brief, 10 = constant).',
  'Enter current cycle day (day 1 = first day of period).',
  'Select primary pain location: pelvic, lower back, abdominal, or multiple areas.',
  'Rate impact on daily life (0 = no impact, 10 = severe impact).',
  'Rate bleeding severity during periods (0 = light, 10 = very heavy).',
  'Review impact score, pain severity, cycle impact, and management recommendations.',
];

const faqs = [
  {
    question: 'What is endometriosis?',
    answer:
      'Endometriosis is a condition where tissue similar to the uterine lining grows outside the uterus, causing pain, inflammation, and sometimes fertility issues. It affects 1 in 10 women.',
  },
  {
    question: 'What are common symptoms?',
    answer:
      'Symptoms include pelvic pain (especially during periods), heavy bleeding, pain during sex, digestive issues, and sometimes infertility. Pain severity varies widely.',
  },
  {
    question: 'How is endometriosis diagnosed?',
    answer:
      'Diagnosis typically requires laparoscopy (surgery) to visualize and biopsy lesions. Imaging (ultrasound, MRI) may help but cannot definitively diagnose.',
  },
  {
    question: 'Is this a medical diagnosis?',
    answer:
      'No. This is an educational tool. Only healthcare providers can diagnose endometriosis through medical evaluation, imaging, and surgery.',
  },
  {
    question: 'Can endometriosis be cured?',
    answer:
      'There is no cure, but symptoms can be managed with medications (pain relievers, hormonal treatments), surgery, and lifestyle changes.',
  },
  {
    question: 'How does it affect fertility?',
    answer:
      'Endometriosis can affect fertility, but many women with endometriosis conceive. Treatment (surgery, IVF) may help. Consult a fertility specialist if concerned.',
  },
  {
    question: 'Does diet help?',
    answer:
      'Some women find relief with anti-inflammatory diets (reducing processed foods, increasing omega-3s). However, evidence is limited. Work with a healthcare provider.',
  },
  {
    question: 'What about exercise?',
    answer:
      'Gentle exercise may help with pain management, but intense workouts during flare-ups may worsen symptoms. Listen to your body and adjust activity accordingly.',
  },
  {
    question: 'When should I see a doctor?',
    answer:
      'See a healthcare provider if you have severe pelvic pain, heavy bleeding, pain during sex, or if symptoms interfere with daily life. Early diagnosis and treatment are important.',
  },
  {
    question: 'Can pain be managed?',
    answer:
      'Yes. Pain management options include NSAIDs, hormonal treatments (birth control, GnRH agonists), surgery, and complementary therapies (acupuncture, physical therapy).',
  },
];

const relatedCalculators = [
  {
    name: 'PCOS Symptom Severity Score Calculator',
    slug: 'pcos-symptom-severity-score-calculator',
    description: 'Assess other hormonal conditions that may cause similar symptoms.',
  },
  {
    name: 'Progesterone-to-Estrogen Ratio Calculator',
    slug: 'progesterone-to-estrogen-ratio-calculator',
    description: 'Track hormone ratios that may affect endometriosis symptoms.',
  },
  {
    name: 'Menstrual Phase Workout Intensity Planner',
    slug: 'menstrual-phase-workout-intensity-planner',
    description: 'Plan workouts around pain and cycle phases.',
  },
  {
    name: 'Stress Hormone Balance Calculator',
    slug: 'stress-hormone-balance-calculator',
    description: 'Monitor stress that can worsen endometriosis pain.',
  },
];

const baseUrl = 'https://mycalculating.com/category/health-fitness/endometriosis-pain-cycle-impact-tracker';

const schemaMarkup = {
  '@context': 'https://schema.org',
  '@graph': [
    {
      '@type': 'BreadcrumbList',
      itemListElement: [
        { '@type': 'ListItem', position: 1, name: 'Home', item: 'https://mycalculating.com' },
        { '@type': 'ListItem', position: 2, name: 'Health & Fitness', item: 'https://mycalculating.com/category/health-fitness' },
        { '@type': 'ListItem', position: 3, name: 'Endometriosis Pain & Cycle Impact Tracker', item: baseUrl },
      ],
    },
    {
      '@type': 'SoftwareApplication',
      name: 'Endometriosis Pain & Cycle Impact Tracker',
      applicationCategory: 'Calculator',
      operatingSystem: 'Web Browser',
      description: 'Track endometriosis pain severity, cycle impact, and daily life disruption to assess condition severity and guide management.',
      url: baseUrl,
      offers: { '@type': 'Offer', price: '0', priceCurrency: 'USD' },
    },
  ],
};

const clamp = (value: number, min: number, max: number) => Math.min(max, Math.max(min, value));

const calculateResult = (values: FormValues): ResultPayload => {
  const painScore = (values.painLevel / 10) * 30; // 0-30 points
  const durationScore = (values.painDuration / 10) * 20; // 0-20 points
  const impactScore = (values.impactOnDailyLife / 10) * 25; // 0-25 points
  const bleedingScore = (values.bleedingSeverity / 10) * 15; // 0-15 points
  
  // Location factor (multiple locations = more severe)
  const locationScores: Record<string, number> = {
    'pelvic': 3,
    'lower-back': 3,
    'abdominal': 3,
    'multiple': 10,
  };
  const locationScore = locationScores[values.painLocation] || 0;
  
  // Cycle day factor (pain during period = more typical)
  const cycleFactor = values.cycleDay <= 7 ? 10 : values.cycleDay <= 14 ? 5 : 0;
  
  const impactScoreTotal = clamp(painScore + durationScore + impactScore + bleedingScore + locationScore + cycleFactor, 0, 100);
  const painSeverity = clamp((values.painLevel + values.painDuration) / 2 * 10, 0, 100);
  const cycleImpact = clamp((impactScoreTotal + cycleFactor) / 1.1, 0, 100);

  let status: ResultPayload['status'] = 'mild';
  let interpretation = 'Endometriosis symptoms appear mild. Continue monitoring and maintain symptom tracking.';

  if (impactScoreTotal >= 60) {
    status = 'severe';
    interpretation = 'Endometriosis symptoms appear severe. Consult a healthcare provider for comprehensive evaluation and treatment plan.';
  } else if (impactScoreTotal >= 40) {
    status = 'moderate';
    interpretation = 'Endometriosis symptoms appear moderate. Consider discussing treatment options with a healthcare provider.';
  }

  const recommendations = [
    'Consult a healthcare provider (gynecologist, endometriosis specialist) for proper diagnosis and treatment plan.',
    'Track pain patterns, cycle days, and triggers to identify patterns and share with your healthcare provider.',
    'Consider pain management strategies: NSAIDs, heat therapy, gentle movement, and stress reduction.',
  ];
  if (status === 'moderate' || status === 'severe') {
    recommendations.push('Discuss hormonal treatments (birth control, GnRH agonists) or surgery options with your healthcare provider if symptoms are severe.');
  }
  if (status === 'severe') {
    recommendations.push('Prioritize medical evaluation. Severe pain and impact on daily life warrant immediate attention and treatment planning.');
  }

  const plan = [
    { label: 'This Week', detail: 'Track pain levels, cycle days, and triggers daily. Document patterns to share with healthcare provider.' },
    { label: 'Next Month', detail: 'Schedule appointment with healthcare provider. Implement pain management strategies while awaiting evaluation.' },
    { label: 'Ongoing', detail: 'Continue tracking symptoms, follow treatment plan, and adjust management strategies based on healthcare provider recommendations.' },
  ];

  return { impactScore: impactScoreTotal, painSeverity, cycleImpact, status, interpretation, recommendations, plan };
};

export default function EndometriosisPainCycleImpactTracker() {
  const [result, setResult] = useState<ResultPayload | null>(null);

  const form = useForm<FormValues>({
    resolver: zodResolver(formSchema),
    defaultValues: {
      painLevel: undefined,
      painDuration: undefined,
      cycleDay: undefined,
      painLocation: 'pelvic',
      impactOnDailyLife: undefined,
      bleedingSeverity: undefined,
    },
  });

  return (
    <div className="space-y-8">
      <Script id="endometriosis-tracker-schema" type="application/ld+json" strategy="afterInteractive" dangerouslySetInnerHTML={{ __html: JSON.stringify(schemaMarkup) }} />

      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <AlertTriangle className="h-5 w-5" />
            Endometriosis Pain & Cycle Impact Tracker
          </CardTitle>
          <CardDescription>Track endometriosis pain severity, cycle impact, and daily life disruption to assess condition severity and guide management.</CardDescription>
        </CardHeader>
      </Card>

      <Card>
        <CardHeader>
          <CardTitle>Input your pain and cycle data</CardTitle>
        </CardHeader>
        <CardContent>
          <Form {...form}>
            <form onSubmit={form.handleSubmit((values) => setResult(calculateResult(values)))} className="space-y-6">
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <FormField
                  control={form.control}
                  name="painLevel"
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel>Pain level (0-10)</FormLabel>
                      <FormControl>
                        <Input type="number" step="1" placeholder="e.g., 7" value={field.value ?? ''} onChange={(e) => field.onChange(e.target.value === '' ? undefined : Number(e.target.value))} />
                      </FormControl>
                      <FormMessage />
                    </FormItem>
                  )}
                />
                <FormField
                  control={form.control}
                  name="painDuration"
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel>Pain duration (0-10)</FormLabel>
                      <FormControl>
                        <Input type="number" step="1" placeholder="e.g., 6" value={field.value ?? ''} onChange={(e) => field.onChange(e.target.value === '' ? undefined : Number(e.target.value))} />
                      </FormControl>
                      <FormMessage />
                    </FormItem>
                  )}
                />
                <FormField
                  control={form.control}
                  name="cycleDay"
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel>Cycle day</FormLabel>
                      <FormControl>
                        <Input type="number" step="1" placeholder="e.g., 3" value={field.value ?? ''} onChange={(e) => field.onChange(e.target.value === '' ? undefined : Number(e.target.value))} />
                      </FormControl>
                      <FormMessage />
                    </FormItem>
                  )}
                />
                <FormField
                  control={form.control}
                  name="painLocation"
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel>Pain location</FormLabel>
                      <FormControl>
                        <select
                          value={field.value}
                          onChange={(e) => field.onChange(e.target.value as FormValues['painLocation'])}
                          className="flex h-10 w-full rounded-md border border-input bg-background px-3 py-2 text-sm ring-offset-background"
                        >
                          <option value="pelvic">Pelvic</option>
                          <option value="lower-back">Lower back</option>
                          <option value="abdominal">Abdominal</option>
                          <option value="multiple">Multiple areas</option>
                        </select>
                      </FormControl>
                      <FormMessage />
                    </FormItem>
                  )}
                />
                <FormField
                  control={form.control}
                  name="impactOnDailyLife"
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel>Impact on daily life (0-10)</FormLabel>
                      <FormControl>
                        <Input type="number" step="1" placeholder="e.g., 6" value={field.value ?? ''} onChange={(e) => field.onChange(e.target.value === '' ? undefined : Number(e.target.value))} />
                      </FormControl>
                      <FormMessage />
                    </FormItem>
                  )}
                />
                <FormField
                  control={form.control}
                  name="bleedingSeverity"
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel>Bleeding severity (0-10)</FormLabel>
                      <FormControl>
                        <Input type="number" step="1" placeholder="e.g., 7" value={field.value ?? ''} onChange={(e) => field.onChange(e.target.value === '' ? undefined : Number(e.target.value))} />
                      </FormControl>
                      <FormMessage />
                    </FormItem>
                  )}
                />
              </div>
              <Button type="submit" className="w-full md:w-auto">
                Calculate impact score
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
            <CardDescription>See impact score, pain severity, cycle impact, and management recommendations.</CardDescription>
          </CardHeader>
          <CardContent className="space-y-6">
            <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
              <div className="p-4 border rounded">
                <p className="text-sm text-muted-foreground">Impact score</p>
                <p className="text-2xl font-semibold text-primary">{result.impactScore.toFixed(0)}</p>
                <p className="text-xs text-muted-foreground">Out of 100</p>
              </div>
              <div className="p-4 border rounded">
                <p className="text-sm text-muted-foreground">Pain severity</p>
                <p className="text-2xl font-semibold text-primary">{result.painSeverity.toFixed(0)}</p>
                <p className="text-xs text-muted-foreground">Out of 100</p>
              </div>
              <div className="p-4 border rounded">
                <p className="text-sm text-muted-foreground">Cycle impact</p>
                <p className="text-2xl font-semibold text-primary">{result.cycleImpact.toFixed(0)}</p>
                <p className="text-xs text-muted-foreground">Out of 100</p>
              </div>
            </div>
            <div className="p-4 border rounded">
              <p className="text-sm text-muted-foreground">Status</p>
              <p className="text-lg font-semibold text-primary capitalize">{result.status}</p>
              <p className="text-xs text-muted-foreground">{result.interpretation}</p>
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
                    <Activity className="h-4 w-4" />
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
          <p><strong>Impact score</strong> = pain level (0-30) + pain duration (0-20) + daily life impact (0-25) + bleeding severity (0-15) + location factor (0-10) + cycle factor (0-10), max 100.</p>
          <p><strong>Pain severity</strong> = (pain level + pain duration) / 2 × 10, clamped to 0-100.</p>
          <p><strong>Cycle impact</strong> = (impact score + cycle factor) / 1.1, clamped to 0-100.</p>
          <p>Higher pain, longer duration, greater daily impact, heavier bleeding, multiple locations, and pain during periods increase impact score.</p>
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
                <p className="text-sm text-muted-foreground">Pain pattern</p>
                <p className="text-xl font-semibold text-primary">
                  {form.getValues().cycleDay <= 7 ? 'Period-related' : form.getValues().cycleDay <= 14 ? 'Mid-cycle' : 'Non-period'}
                </p>
                <p className="text-xs text-muted-foreground">Based on cycle day</p>
              </div>
              <div className="p-4 border rounded">
                <p className="text-sm text-muted-foreground">Location severity</p>
                <p className="text-xl font-semibold text-primary">
                  {form.getValues().painLocation === 'multiple' ? 'High' : 'Moderate'}
                </p>
                <p className="text-xs text-muted-foreground">Multiple areas = more severe</p>
              </div>
              <div className="p-4 border rounded">
                <p className="text-sm text-muted-foreground">Management priority</p>
                <p className="text-xl font-semibold text-primary">
                  {result.impactScore >= 60 ? 'High' : result.impactScore >= 40 ? 'Moderate' : 'Low'}
                </p>
                <p className="text-xs text-muted-foreground">Based on impact score</p>
              </div>
            </div>
          ) : (
            <p className="text-sm text-muted-foreground">Enter your pain and cycle data to see additional insights.</p>
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

      <Card>
        <CardHeader>
          <CardTitle>Complete guide snapshot</CardTitle>
        </CardHeader>
        <CardContent className="prose prose-sm dark:prose-invert max-w-none">
          <p>Endometriosis is a condition where tissue similar to the uterine lining grows outside the uterus, causing pain, inflammation, and sometimes fertility issues.</p>
          <p>Use this calculator to track pain severity, cycle impact, and daily life disruption to assess condition severity and guide treatment planning.</p>
        </CardContent>
      </Card>

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
          <p>This tool calculates endometriosis impact score, pain severity, and cycle impact from pain level, duration, cycle day, location, daily life impact, and bleeding severity.</p>
          <p>Outputs include impact score, pain severity, cycle impact, status, recommendations, an action plan, and supporting metrics.</p>
          <p>Formula, steps, guide content, related tools, and FAQs ensure humans or AI assistants can interpret the methodology instantly.</p>
        </CardContent>
      </Card>
    </div>
  );
}


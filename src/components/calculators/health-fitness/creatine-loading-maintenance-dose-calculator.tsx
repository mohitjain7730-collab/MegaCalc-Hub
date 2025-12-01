'use client';

import { useState } from 'react';
import Script from 'next/script';
import Link from 'next/link';
import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import { z } from 'zod';
import { Pill, Zap, Target, Activity, Shield } from 'lucide-react';

import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Form, FormControl, FormField, FormItem, FormLabel, FormMessage } from '@/components/ui/form';
import { Input } from '@/components/ui/input';

const formSchema = z.object({
  bodyWeight: z.number({ invalid_type_error: 'Enter body weight' }).min(40).max(200),
  goal: z.enum(['loading', 'maintenance']),
  creatineForm: z.enum(['monohydrate', 'hcl', 'other']),
  trainingFrequency: z.number({ invalid_type_error: 'Enter training frequency' }).min(1).max(7),
});

type FormValues = z.infer<typeof formSchema>;

type ResultPayload = {
  loadingDose: number;
  maintenanceDose: number;
  loadingDays: number;
  dailyDose: number;
  status: 'loading' | 'maintenance';
  interpretation: string;
  recommendations: string[];
  plan: { label: string; detail: string }[];
};

const steps = [
  'Enter your body weight in kilograms (or convert from pounds: lbs ÷ 2.2).',
  'Select goal: loading (saturate muscles quickly) or maintenance (sustain levels).',
  'Select creatine form: monohydrate (standard), HCL (more concentrated), or other.',
  'Enter training frequency (days per week) to adjust dosing if needed.',
  'Review loading dose, maintenance dose, and dosing schedule.',
];

const faqs = [
  {
    question: 'What is creatine loading?',
    answer:
      'Loading is taking higher doses (20-25g/day) for 5-7 days to quickly saturate muscle creatine stores, then switching to maintenance (3-5g/day).',
  },
  {
    question: 'Do I need to load?',
    answer:
      'No. Loading is optional. You can start with maintenance dose (3-5g/day) and reach saturation in 3-4 weeks. Loading just speeds it up.',
  },
  {
    question: 'What is the standard dose?',
    answer:
      'Standard maintenance dose is 3-5g/day of creatine monohydrate. Loading dose is typically 20-25g/day (split into 4-5 doses) for 5-7 days.',
  },
  {
    question: 'How do I take creatine?',
    answer:
      'Mix with water, juice, or a shake. Timing (pre/post workout) is less important than consistency. Take daily, preferably with food.',
  },
  {
    question: 'Does creatine cause water retention?',
    answer:
      'Yes, initially. Creatine draws water into muscles, which can cause 1-3 lbs weight gain. This is normal and indicates creatine is working.',
  },
  {
    question: 'What about cycling?',
    answer:
      'Cycling (taking breaks) is not necessary. You can take creatine continuously. Some people cycle, but research doesn\'t show it\'s needed.',
  },
  {
    question: 'Can I take it with caffeine?',
    answer:
      'Yes. Older research suggested caffeine might interfere, but recent studies show no significant negative interaction. You can take them together.',
  },
  {
    question: 'What are the benefits?',
    answer:
      'Creatine improves strength, power, muscle mass, and exercise performance. It may also support brain health and recovery.',
  },
  {
    question: 'Are there side effects?',
    answer:
      'Most people tolerate creatine well. Some experience mild stomach upset if taken on empty stomach. Stay hydrated to minimize any issues.',
  },
  {
    question: 'Who should not take creatine?',
    answer:
      'If you have medical conditions or take medications, consult a qualified professional before starting creatine supplementation. This is not medical advice.',
  },
];

const relatedCalculators = [
  {
    name: 'Muscle Recovery Time by Age Calculator',
    slug: 'muscle-recovery-time-by-age-calculator',
    description: 'Plan recovery to optimize creatine benefits.',
  },
  {
    name: 'Exercise Recovery Score (HRV + Sleep Integration)',
    slug: 'exercise-recovery-score-hrv-sleep-integration',
    description: 'Track overall recovery alongside creatine supplementation.',
  },
  {
    name: 'BMI Calculator',
    slug: 'bmi-calculator',
    description: 'Track body composition changes with creatine use.',
  },
  {
    name: 'Protein Intake Calculator',
    slug: 'protein-intake-calculator',
    description: 'Coordinate protein intake with creatine for muscle building.',
  },
];

const baseUrl = 'https://mycalculating.com/category/health-fitness/creatine-loading-maintenance-dose-calculator';

const schemaMarkup = {
  '@context': 'https://schema.org',
  '@graph': [
    {
      '@type': 'BreadcrumbList',
      itemListElement: [
        { '@type': 'ListItem', position: 1, name: 'Home', item: 'https://mycalculating.com' },
        { '@type': 'ListItem', position: 2, name: 'Health & Fitness', item: 'https://mycalculating.com/category/health-fitness' },
        { '@type': 'ListItem', position: 3, name: 'Creatine Supplementation Guide', item: baseUrl },
      ],
    },
    {
      '@type': 'SoftwareApplication',
      name: 'Creatine Supplementation Guide',
      applicationCategory: 'Calculator',
      operatingSystem: 'Web Browser',
      description: 'Calculate creatine loading and maintenance doses based on body weight, goal, form, and training frequency.',
      url: baseUrl,
      offers: { '@type': 'Offer', price: '0', priceCurrency: 'USD' },
    },
  ],
};

const clamp = (value: number, min: number, max: number) => Math.min(max, Math.max(min, value));

const calculateResult = (values: FormValues): ResultPayload => {
  // Standard dosing: 0.3g/kg loading, 0.03g/kg maintenance (for monohydrate)
  // HCL is more concentrated, so lower doses needed
  const formMultipliers: Record<string, number> = {
    'monohydrate': 1.0,
    'hcl': 0.7, // HCL is more concentrated
    'other': 1.0,
  };
  const multiplier = formMultipliers[values.creatineForm] || 1.0;
  
  // Loading dose: 0.3g/kg body weight (standard for monohydrate)
  const loadingDose = clamp(values.bodyWeight * 0.3 * multiplier, 15, 30); // 15-30g/day
  
  // Maintenance dose: 0.03g/kg body weight (standard for monohydrate)
  const maintenanceDose = clamp(values.bodyWeight * 0.03 * multiplier, 3, 10); // 3-10g/day
  
  // Loading period: typically 5-7 days
  const loadingDays = 7;
  
  // Current daily dose based on goal
  const dailyDose = values.goal === 'loading' ? loadingDose : maintenanceDose;
  
  // Adjust for training frequency (more training = slightly higher maintenance)
  let adjustedMaintenance = maintenanceDose;
  if (values.trainingFrequency >= 5) {
    adjustedMaintenance *= 1.1; // 10% higher for very frequent training
  }

  let status: ResultPayload['status'] = values.goal === 'loading' ? 'loading' : 'maintenance';
  let interpretation = values.goal === 'loading'
    ? `Loading phase: Take ${loadingDose.toFixed(1)}g/day for ${loadingDays} days, then switch to maintenance.`
    : `Maintenance phase: Take ${adjustedMaintenance.toFixed(1)}g/day to sustain muscle creatine levels.`;

  const recommendations = [
    'Take creatine consistently daily. Timing (pre/post workout) is less important than consistency.',
    'Mix with water, juice, or a shake. Taking with food may reduce stomach upset.',
    'Stay well hydrated (drink plenty of water) to support creatine uptake and minimize any side effects.',
  ];
  if (values.goal === 'loading') {
    recommendations.push(`Split loading dose (${loadingDose.toFixed(1)}g) into 4-5 smaller doses throughout the day to minimize stomach upset.`);
  }
  if (values.creatineForm === 'hcl') {
    recommendations.push('HCL (creatine hydrochloride) is more concentrated, so you need lower doses than monohydrate.');
  }

  const plan = [
    { label: 'This Week', detail: values.goal === 'loading' ? `Take ${loadingDose.toFixed(1)}g/day for ${loadingDays} days (loading phase).` : `Start maintenance: ${adjustedMaintenance.toFixed(1)}g/day.` },
    { label: 'Next Week', detail: values.goal === 'loading' ? `Switch to maintenance: ${adjustedMaintenance.toFixed(1)}g/day.` : `Continue maintenance: ${adjustedMaintenance.toFixed(1)}g/day.` },
    { label: 'Ongoing', detail: `Maintain daily dose of ${adjustedMaintenance.toFixed(1)}g. Consistency is key for optimal results.` },
  ];

  return { loadingDose, maintenanceDose: adjustedMaintenance, loadingDays, dailyDose, status, interpretation, recommendations, plan };
};

export default function CreatineLoadingMaintenanceDoseCalculator() {
  const [result, setResult] = useState<ResultPayload | null>(null);

  const form = useForm<FormValues>({
    resolver: zodResolver(formSchema),
    defaultValues: {
      bodyWeight: undefined,
      goal: 'maintenance',
      creatineForm: 'monohydrate',
      trainingFrequency: undefined,
    },
  });

  return (
    <div className="space-y-8">
      <Script id="creatine-dose-schema" type="application/ld+json" strategy="afterInteractive" dangerouslySetInnerHTML={{ __html: JSON.stringify(schemaMarkup) }} />

      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <Pill className="h-5 w-5" />
            Creatine Supplementation Guide
          </CardTitle>
          <CardDescription>Estimate creatine loading and maintenance doses based on body weight, goal, form, and training frequency. This is for informational purposes only, not medical advice.</CardDescription>
        </CardHeader>
      </Card>

      <Card>
        <CardHeader>
          <CardTitle>Input your body weight and goals</CardTitle>
        </CardHeader>
        <CardContent>
          <Form {...form}>
            <form onSubmit={form.handleSubmit((values) => setResult(calculateResult(values)))} className="space-y-6">
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <FormField
                  control={form.control}
                  name="bodyWeight"
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel>Body weight (kg)</FormLabel>
                      <FormControl>
                        <Input type="number" step="0.5" placeholder="e.g., 75" value={field.value ?? ''} onChange={(e) => field.onChange(e.target.value === '' ? undefined : Number(e.target.value))} />
                      </FormControl>
                      <FormMessage />
                    </FormItem>
                  )}
                />
                <FormField
                  control={form.control}
                  name="goal"
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel>Goal</FormLabel>
                      <FormControl>
                        <select
                          value={field.value}
                          onChange={(e) => field.onChange(e.target.value as 'loading' | 'maintenance')}
                          className="flex h-10 w-full rounded-md border border-input bg-background px-3 py-2 text-sm ring-offset-background"
                        >
                          <option value="loading">Loading (quick saturation)</option>
                          <option value="maintenance">Maintenance (sustain levels)</option>
                        </select>
                      </FormControl>
                      <FormMessage />
                    </FormItem>
                  )}
                />
                <FormField
                  control={form.control}
                  name="creatineForm"
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel>Creatine form</FormLabel>
                      <FormControl>
                        <select
                          value={field.value}
                          onChange={(e) => field.onChange(e.target.value as 'monohydrate' | 'hcl' | 'other')}
                          className="flex h-10 w-full rounded-md border border-input bg-background px-3 py-2 text-sm ring-offset-background"
                        >
                          <option value="monohydrate">Monohydrate (standard)</option>
                          <option value="hcl">HCL (hydrochloride)</option>
                          <option value="other">Other</option>
                        </select>
                      </FormControl>
                      <FormMessage />
                    </FormItem>
                  )}
                />
                <FormField
                  control={form.control}
                  name="trainingFrequency"
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel>Training frequency (days/week)</FormLabel>
                      <FormControl>
                        <Input type="number" step="1" placeholder="e.g., 4" value={field.value ?? ''} onChange={(e) => field.onChange(e.target.value === '' ? undefined : Number(e.target.value))} />
                      </FormControl>
                      <FormMessage />
                    </FormItem>
                  )}
                />
              </div>
              <Button type="submit" className="w-full md:w-auto">
                Calculate dose
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
            <CardDescription>See loading dose, maintenance dose, and dosing schedule.</CardDescription>
          </CardHeader>
          <CardContent className="space-y-6">
            <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
              <div className="p-4 border rounded">
                <p className="text-sm text-muted-foreground">Loading dose</p>
                <p className="text-2xl font-semibold text-primary">{result.loadingDose.toFixed(1)}g</p>
                <p className="text-xs text-muted-foreground">Per day (5-7 days)</p>
              </div>
              <div className="p-4 border rounded">
                <p className="text-sm text-muted-foreground">Maintenance dose</p>
                <p className="text-2xl font-semibold text-primary">{result.maintenanceDose.toFixed(1)}g</p>
                <p className="text-xs text-muted-foreground">Per day</p>
              </div>
              <div className="p-4 border rounded">
                <p className="text-sm text-muted-foreground">Current daily dose</p>
                <p className="text-2xl font-semibold text-primary">{result.dailyDose.toFixed(1)}g</p>
                <p className="text-xs text-muted-foreground">Based on goal</p>
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
          <p><strong>Loading dose</strong> = body weight (kg) × 0.3 × form multiplier, clamped to 15-30g/day.</p>
          <p><strong>Maintenance dose</strong> = body weight (kg) × 0.03 × form multiplier × training factor, clamped to 3-10g/day.</p>
          <p><strong>Form multipliers</strong>: Monohydrate 1.0, HCL 0.7 (more concentrated), Other 1.0.</p>
          <p><strong>Training factor</strong>: 5+ days/week = 1.1×, otherwise 1.0×.</p>
          <p>Loading phase: 5-7 days. Maintenance: ongoing daily dose.</p>
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
                <p className="text-sm text-muted-foreground">Monthly maintenance</p>
                <p className="text-xl font-semibold text-primary">
                  {(result.maintenanceDose * 30).toFixed(0)}g
                </p>
                <p className="text-xs text-muted-foreground">For 30 days</p>
              </div>
              <div className="p-4 border rounded">
                <p className="text-sm text-muted-foreground">Loading total</p>
                <p className="text-xl font-semibold text-primary">
                  {(result.loadingDose * result.loadingDays).toFixed(0)}g
                </p>
                <p className="text-xs text-muted-foreground">For {result.loadingDays} days</p>
              </div>
              <div className="p-4 border rounded">
                <p className="text-sm text-muted-foreground">Dose per kg</p>
                <p className="text-xl font-semibold text-primary">
                  {(result.maintenanceDose / (form.getValues().bodyWeight ?? 1)).toFixed(3)}g/kg
                </p>
                <p className="text-xs text-muted-foreground">Maintenance dose</p>
              </div>
            </div>
          ) : (
            <p className="text-sm text-muted-foreground">Enter your body weight and goals to see additional insights.</p>
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
          <p>Creatine loading (20-25g/day for 5-7 days) quickly saturates muscle creatine stores, then switch to maintenance (3-5g/day). Loading is optional—you can start with maintenance and reach saturation in 3-4 weeks.</p>
          <p>Use this calculator to determine appropriate loading and maintenance doses based on body weight, creatine form, and training frequency.</p>
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
          <p>This tool calculates creatine loading and maintenance doses from body weight, goal (loading/maintenance), creatine form (monohydrate/HCL/other), and training frequency.</p>
          <p>Outputs include loading dose, maintenance dose, loading days, current daily dose, status, recommendations, an action plan, and supporting metrics.</p>
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


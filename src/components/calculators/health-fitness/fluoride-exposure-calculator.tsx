'use client';

import { useState } from 'react';
import Script from 'next/script';
import Link from 'next/link';
import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import { z } from 'zod';
import { Droplet, Zap, Target, AlertTriangle, Shield } from 'lucide-react';

import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Form, FormControl, FormField, FormItem, FormLabel, FormMessage } from '@/components/ui/form';
import { Input } from '@/components/ui/input';

const formSchema = z.object({
  age: z.number({ invalid_type_error: 'Enter age' }).min(1).max(100),
  waterFluoride: z.number({ invalid_type_error: 'Enter water fluoride' }).min(0).max(4),
  waterIntake: z.number({ invalid_type_error: 'Enter water intake' }).min(0).max(5000),
  toothpasteUse: z.boolean().optional(),
  otherSources: z.number({ invalid_type_error: 'Enter other sources' }).min(0).max(5).optional(),
});

type FormValues = z.infer<typeof formSchema>;

type ResultPayload = {
  age: number;
  waterFluoride: number;
  waterIntake: number;
  toothpasteUse: boolean;
  otherSources: number;
  totalExposure: number;
  dailyNeed: number;
  exposureStatus: string;
  status: 'optimal' | 'good' | 'moderate' | 'low';
  interpretation: string;
  recommendations: string[];
  plan: { label: string; detail: string }[];
};

const steps = [
  'Enter your age (years) for age-specific recommendations.',
  'Enter water fluoride level (ppm) from your water source or municipal report.',
  'Enter daily water intake (mL) from drinking water.',
  'Indicate if you use fluoride toothpaste (optional).',
  'Enter fluoride from other sources (mg) if known (optional).',
  'Review total fluoride exposure, daily needs, and recommendations.',
];

const faqs = [
  {
    question: 'What is fluoride?',
    answer:
      'Fluoride is a mineral that helps prevent tooth decay by strengthening tooth enamel. It is added to many public water supplies and is found in toothpaste, some foods, and dental treatments.',
  },
  {
    question: 'What are fluoride recommendations?',
    answer:
      'Adequate intake (AI): Infants 0-6 months: 0.01 mg/day, 7-12 months: 0.5 mg/day, Children 1-3: 0.7 mg/day, 4-8: 1.0 mg/day, Children 9-13: 2.0 mg/day, Teens 14-18: 3.0 mg/day, Adults: 3-4 mg/day (men) and 3 mg/day (women).',
  },
  {
    question: 'What is water fluoridation?',
    answer:
      'Water fluoridation is the addition of fluoride to public water supplies to prevent tooth decay. Optimal level is 0.7-1.2 ppm. This is a safe and effective public health measure.',
  },
  {
    question: 'How does age affect fluoride needs?',
    answer:
      'Fluoride needs increase with age as teeth develop and grow. Children and adolescents need adequate fluoride for developing teeth. Adults need fluoride to maintain tooth enamel strength.',
  },
  {
    question: 'What about fluoride toxicity?',
    answer:
      'Excessive fluoride intake can cause dental fluorosis (white spots on teeth) in children during tooth development, or skeletal fluorosis in severe cases. Upper limits vary by age: Children 1-3: 1.3 mg/day, 4-8: 2.2 mg/day, 9-13: 10 mg/day, 14-18: 10 mg/day, Adults: 10 mg/day.',
  },
  {
    question: 'What are sources of fluoride?',
    answer:
      'Fluoride sources include fluoridated water, fluoride toothpaste, some foods (tea, fish), and dental treatments. Water and toothpaste are the primary sources for most people.',
  },
  {
    question: 'How do I calculate fluoride exposure?',
    answer:
      'Calculate fluoride exposure from water (fluoride ppm × water intake L × 1 mg/L per ppm), plus fluoride from toothpaste (if swallowed), plus other sources. Most toothpaste fluoride is not swallowed.',
  },
  {
    question: 'What about fluoride and children?',
    answer:
      'Children need adequate fluoride for developing teeth but are more susceptible to fluorosis. Use age-appropriate toothpaste amounts, supervise brushing, and ensure appropriate fluoride intake from water and other sources.',
  },
  {
    question: 'Can I track fluoride at home?',
    answer:
      'Yes. Estimate fluoride from water (check municipal reports for ppm), estimate water intake, and consider toothpaste use. Most tracking apps don\'t include fluoride, so manual calculation may be needed.',
  },
  {
    question: 'When should I consult a healthcare provider?',
    answer:
      'Consult a healthcare provider or dentist if you have concerns about fluoride intake, see signs of fluorosis, live in areas with very high natural fluoride, or need personalized guidance on fluoride exposure.',
  },
];

const relatedCalculators = [
  {
    name: 'Iodine Deficiency Risk Calculator',
    slug: 'iodine-deficiency-risk-calculator',
    description: 'Assess iodine alongside fluoride for mineral status.',
  },
  {
    name: 'Selenium Intake Calculator',
    slug: 'selenium-intake-calculator',
    description: 'Evaluate trace minerals comprehensively.',
  },
  {
    name: 'Manganese Requirement Calculator',
    slug: 'manganese-requirement-calculator',
    description: 'Assess manganese alongside fluoride.',
  },
  {
    name: 'Nutrient Density to Calorie Ratio Calculator',
    slug: 'nutrient-density-to-calorie-ratio-calculator',
    description: 'Assess nutritional quality comprehensively.',
  },
];

const baseUrl = 'https://mycalculating.com/category/health-fitness/fluoride-exposure-calculator';

const schemaMarkup = {
  '@context': 'https://schema.org',
  '@graph': [
    {
      '@type': 'BreadcrumbList',
      itemListElement: [
        { '@type': 'ListItem', position: 1, name: 'Home', item: 'https://mycalculating.com' },
        { '@type': 'ListItem', position: 2, name: 'Health & Fitness', item: 'https://mycalculating.com/category/health-fitness' },
        { '@type': 'ListItem', position: 3, name: 'Fluoride Exposure Calculator', item: baseUrl },
      ],
    },
    {
      '@type': 'SoftwareApplication',
      name: 'Fluoride Exposure Calculator',
      applicationCategory: 'Calculator',
      operatingSystem: 'Web Browser',
      description: 'Calculate fluoride exposure from water fluoride level, water intake, age, and other sources.',
      url: baseUrl,
      offers: { '@type': 'Offer', price: '0', priceCurrency: 'USD' },
    },
  ],
};

const clamp = (value: number, min: number, max: number) => Math.min(max, Math.max(min, value));

const calculateResult = (values: FormValues): ResultPayload => {
  const age = values.age;
  const waterFluoride = values.waterFluoride; // ppm
  const waterIntake = values.waterIntake; // mL
  const toothpasteUse = values.toothpasteUse || false;
  const otherSources = values.otherSources || 0;
  
  // Calculate fluoride from water (ppm × L × 1 mg/L per ppm)
  const waterFluorideMg = (waterFluoride * waterIntake / 1000); // Convert mL to L, then multiply by ppm
  
  // Estimate fluoride from toothpaste (if used, assume small amount swallowed: ~0.1-0.2 mg)
  const toothpasteFluoride = toothpasteUse ? 0.15 : 0;
  
  const totalExposure = waterFluorideMg + toothpasteFluoride + otherSources;
  
  // Estimate daily need based on age
  let dailyNeed = 3.0; // Default for adults
  
  if (age < 1) {
    if (age < 0.5) {
      dailyNeed = 0.01; // Infants 0-6 months
    } else {
      dailyNeed = 0.5; // Infants 7-12 months
    }
  } else if (age < 4) {
    dailyNeed = 0.7; // Children 1-3
  } else if (age < 9) {
    dailyNeed = 1.0; // Children 4-8
  } else if (age < 14) {
    dailyNeed = 2.0; // Children 9-13
  } else if (age < 19) {
    dailyNeed = 3.0; // Teens 14-18
  } else {
    dailyNeed = 3.0; // Adults (women), men may need slightly more (3-4 mg)
  }
  
  // Determine exposure status
  let exposureStatus = 'Adequate';
  if (totalExposure < dailyNeed * 0.7) {
    exposureStatus = 'Low';
  } else if (totalExposure > 10) {
    exposureStatus = 'Excessive';
  } else if (totalExposure > dailyNeed * 2) {
    exposureStatus = 'High';
  }
  
  let status: ResultPayload['status'] = 'optimal';
  let interpretation = 'Your fluoride exposure appears adequate. This supports tooth enamel strength and prevents tooth decay.';

  if (totalExposure < dailyNeed * 0.7) {
    status = 'low';
    interpretation = 'Your fluoride exposure is below recommended levels. This may increase tooth decay risk. Consider fluoridated water, fluoride toothpaste, or other sources to meet daily needs.';
  } else if (totalExposure < dailyNeed * 0.9) {
    status = 'moderate';
    interpretation = 'Your fluoride exposure is slightly below recommended levels. Aim for recommended daily intake to ensure adequate fluoride status and prevent tooth decay.';
  } else if (totalExposure > 10) {
    status = 'low';
    interpretation = 'Your fluoride exposure exceeds the upper limit (10 mg/day for adults). Excessive intake can cause fluorosis. Reduce exposure, especially from water or supplements.';
  } else if (totalExposure >= dailyNeed && totalExposure <= dailyNeed * 2) {
    status = 'optimal';
    interpretation = 'Your fluoride exposure is within recommended range. This supports optimal tooth enamel strength and prevents tooth decay without excessive intake.';
  } else {
    status = 'good';
    interpretation = 'Your fluoride exposure is good. Continue maintaining balanced intake to support tooth health and prevent decay.';
  }

  const recommendations = [
    'Use fluoridated water: if your water supply is fluoridated (0.7-1.2 ppm), this provides safe and effective fluoride for tooth decay prevention.',
    `Aim for recommended intake: ${dailyNeed.toFixed(2)} mg/day for your age. This supports tooth enamel strength and prevents tooth decay.`,
    'Use fluoride toothpaste: brushing with fluoride toothpaste provides topical benefits and small amounts of systemic fluoride. Use age-appropriate amounts.',
  ];
  if (status === 'low' && totalExposure < dailyNeed * 0.9) {
    recommendations.push('Increase fluoride exposure through fluoridated water, fluoride toothpaste, or other sources to meet recommended levels and prevent tooth decay.');
  }
  if (totalExposure > 10) {
    recommendations.push('Reduce fluoride exposure. Excessive intake (upper limit: 10 mg/day for adults) can cause fluorosis. If from water, consider alternative sources. Consult healthcare provider if concerns persist.');
  }
  if (waterFluoride > 2.0) {
    recommendations.push('Monitor water fluoride levels. Levels above 2.0 ppm may increase fluorosis risk, especially in children. Consider alternative water sources if levels are very high.');
  }

  const plan = [
    { label: 'This Week', detail: `Calculate fluoride exposure and compare to daily needs (${dailyNeed.toFixed(2)} mg/day). Assess current exposure and identify opportunities to meet recommended levels.` },
    { label: 'This Month', detail: 'Optimize fluoride exposure: ensure access to fluoridated water or appropriate fluoride sources, use fluoride toothpaste appropriately, and maintain balanced intake.' },
    { label: 'Ongoing', detail: 'Monitor fluoride exposure through regular assessment. Maintain recommended intake levels to prevent tooth decay while avoiding excessive exposure that could cause fluorosis.' },
  ];

  return { age, waterFluoride, waterIntake, toothpasteUse, otherSources, totalExposure, dailyNeed, exposureStatus, status, interpretation, recommendations, plan };
};

export default function FluorideExposureCalculator() {
  const [result, setResult] = useState<ResultPayload | null>(null);

  const form = useForm<FormValues>({
    resolver: zodResolver(formSchema),
    defaultValues: {
      age: undefined,
      waterFluoride: undefined,
      waterIntake: undefined,
      toothpasteUse: undefined,
      otherSources: undefined,
    },
  });

  return (
    <div className="space-y-8">
      <Script id="fluoride-exposure-schema" type="application/ld+json" strategy="afterInteractive" dangerouslySetInnerHTML={{ __html: JSON.stringify(schemaMarkup) }} />

      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <Droplet className="h-5 w-5" />
            Fluoride Exposure Calculator
          </CardTitle>
          <CardDescription>Calculate fluoride exposure from water fluoride level, water intake, age, and other sources.</CardDescription>
        </CardHeader>
      </Card>

      <Card>
        <CardHeader>
          <CardTitle>Input your fluoride data</CardTitle>
        </CardHeader>
        <CardContent>
          <Form {...form}>
            <form onSubmit={form.handleSubmit((values) => setResult(calculateResult(values)))} className="space-y-6">
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <FormField
                  control={form.control}
                  name="age"
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel>Age (years)</FormLabel>
                      <FormControl>
                        <Input type="number" step="0.1" placeholder="e.g., 35" value={field.value ?? ''} onChange={(e) => field.onChange(e.target.value === '' ? undefined : Number(e.target.value))} />
                      </FormControl>
                      <FormMessage />
                    </FormItem>
                  )}
                />
                <FormField
                  control={form.control}
                  name="waterFluoride"
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel>Water fluoride (ppm)</FormLabel>
                      <FormControl>
                        <Input type="number" step="0.1" placeholder="e.g., 0.7" value={field.value ?? ''} onChange={(e) => field.onChange(e.target.value === '' ? undefined : Number(e.target.value))} />
                      </FormControl>
                      <FormMessage />
                    </FormItem>
                  )}
                />
                <FormField
                  control={form.control}
                  name="waterIntake"
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel>Water intake (mL)</FormLabel>
                      <FormControl>
                        <Input type="number" step="10" placeholder="e.g., 2000" value={field.value ?? ''} onChange={(e) => field.onChange(e.target.value === '' ? undefined : Number(e.target.value))} />
                      </FormControl>
                      <FormMessage />
                    </FormItem>
                  )}
                />
                <FormField
                  control={form.control}
                  name="toothpasteUse"
                  render={({ field }) => (
                    <FormItem className="flex items-center space-x-2 space-y-0">
                      <FormControl>
                        <input
                          type="checkbox"
                          checked={field.value || false}
                          onChange={field.onChange}
                          className="h-4 w-4 rounded border-gray-300"
                        />
                      </FormControl>
                      <FormLabel className="!mt-0">Use fluoride toothpaste</FormLabel>
                      <FormMessage />
                    </FormItem>
                  )}
                />
                <FormField
                  control={form.control}
                  name="otherSources"
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel>Other sources (mg) (optional)</FormLabel>
                      <FormControl>
                        <Input type="number" step="0.1" placeholder="e.g., 0.5" value={field.value ?? ''} onChange={(e) => field.onChange(e.target.value === '' ? undefined : Number(e.target.value))} />
                      </FormControl>
                      <FormMessage />
                    </FormItem>
                  )}
                />
              </div>
              <Button type="submit" className="w-full md:w-auto">
                Calculate fluoride exposure
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
            <CardDescription>See total fluoride exposure, daily needs, and recommendations.</CardDescription>
          </CardHeader>
          <CardContent className="space-y-6">
            <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
              <div className="p-4 border rounded">
                <p className="text-sm text-muted-foreground">Total exposure</p>
                <p className="text-2xl font-semibold text-primary">{result.totalExposure.toFixed(2)}</p>
                <p className="text-xs text-muted-foreground">mg/day</p>
              </div>
              <div className="p-4 border rounded">
                <p className="text-sm text-muted-foreground">Daily need</p>
                <p className="text-2xl font-semibold text-primary">{result.dailyNeed.toFixed(2)}</p>
                <p className="text-xs text-muted-foreground">mg/day</p>
              </div>
              <div className="p-4 border rounded">
                <p className="text-sm text-muted-foreground">Exposure status</p>
                <p className="text-2xl font-semibold text-primary">{result.exposureStatus}</p>
                <p className="text-xs text-muted-foreground">Based on intake</p>
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
            <strong>Fluoride from water</strong> = water fluoride (ppm) × water intake (L) × 1 mg/L per ppm. Convert mL to L by dividing by 1000.
          </p>
          <p>
            <strong>Total exposure</strong> = fluoride from water + fluoride from toothpaste (if used, ~0.15 mg) + other sources (mg).
          </p>
          <p>
            <strong>Daily need</strong> = estimated from age. Adults: 3 mg/day (women) or 3-4 mg/day (men). Children have lower requirements.
          </p>
          <p>
            <strong>Upper limits</strong>: Children 1-3: 1.3 mg/day, 4-8: 2.2 mg/day, 9-13: 10 mg/day, 14-18: 10 mg/day, Adults: 10 mg/day.
          </p>
          <p>Fluoride exposure should be adequate to prevent tooth decay but not excessive to avoid fluorosis. Optimal water fluoridation is 0.7-1.2 ppm.</p>
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
                <p className="text-sm text-muted-foreground">Water contribution</p>
                <p className="text-xl font-semibold text-primary">
                  {((result.waterFluoride * result.waterIntake / 1000) / result.totalExposure * 100).toFixed(1)}%
                </p>
                <p className="text-xs text-muted-foreground">Of total exposure</p>
              </div>
              <div className="p-4 border rounded">
                <p className="text-sm text-muted-foreground">Upper limit</p>
                <p className="text-xl font-semibold text-primary">10 mg</p>
                <p className="text-xs text-muted-foreground">Maximum safe (adults)</p>
              </div>
              <div className="p-4 border rounded">
                <p className="text-sm text-muted-foreground">Exposure ratio</p>
                <p className="text-xl font-semibold text-primary">
                  {(result.totalExposure / result.dailyNeed).toFixed(2)}x
                </p>
                <p className="text-xs text-muted-foreground">Of daily need</p>
              </div>
            </div>
          ) : (
            <p className="text-sm text-muted-foreground">Enter your fluoride data to see additional insights.</p>
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
    <meta itemProp="name" content="The Definitive Guide to Fluoride Exposure: Sources, Risk Assessment, and Safe Levels" />
    <meta itemProp="description" content="An expert guide detailing fluoride exposure sources, the critical risks of excessive intake (dental and skeletal fluorosis), and official safe concentration standards from the CDC, EPA, and ADA." />
    <meta itemProp="keywords" content="fluoride exposure risk, dental fluorosis causes, safe drinking water fluoride levels, skeletal fluorosis symptoms, fluoride ingestion in children, CDC fluoridation standards" />
    <meta itemProp="author" content="[Your Site's Health Team]" />
    <meta itemProp="datePublished" content="2025-12-01" />
    <meta itemProp="url" content="/definitive-fluoride-exposure-guide" />

    <h1 className="text-3xl md:text-4xl font-extrabold text-foreground mb-4" itemProp="headline">The Definitive Guide to Fluoride Exposure: Sources, Risks, and Safe Levels</h1>
    <p className="text-lg italic text-gray-700">A detailed examination of how fluoride works to protect teeth, how human exposure is measured, and the potential risks of excessive intake.</p>


    {/* TABLE OF CONTENTS (INTERNAL LINKS FOR UX AND SEO) */}
    <h2 className="text-2xl font-bold text-foreground mt-8 mb-4">Table of Contents: Jump to a Section</h2>
    <ul className="list-disc ml-6 space-y-2 text-blue-600">
        <li><a href="#role" className="hover:underline">The Dual Role of Fluoride: Benefit and Risk</a></li>
        <li><a href="#sources" className="hover:underline">Primary Sources of Fluoride Exposure</a></li>
        <li><a href="#risk" className="hover:underline">Consequences of Excessive Fluoride Ingestion</a></li>
        <li><a href="#standards" className="hover:underline">Official Safety Standards and Recommended Levels (CDC, EPA, ADA)</a></li>
        <li><a href="#management" className="hover:underline">Risk Management for High-Exposure Groups</a></li>
    </ul>
<hr />

    {/* THE DUAL ROLE OF FLUORIDE: BENEFIT AND RISK */}
    <h2 id="role" className="text-2xl font-bold text-foreground pt-8" itemProp="articleSection">The Dual Role of Fluoride: Benefit and Risk</h2>
    <p>Fluoride is a naturally occurring mineral that has been instrumental in public health, primarily through its ability to prevent tooth decay. However, like all essential micronutrients, excessive exposure can lead to adverse health outcomes, necessitating strict regulatory control over its use and concentration.</p>

    <h3 className="text-xl font-semibold text-foreground mt-6">Mechanism of Dental Protection</h3>
    <p>Fluoride primarily protects teeth through two mechanisms, known as <b>remineralization</b>. First, when topically applied (e.g., via toothpaste), it concentrates in the dental plaque and saliva, inhibiting the demineralization of sound enamel. Second, when ingested and incorporated into developing tooth structure, it replaces the hydroxyl ion in hydroxyapatite to form <b>fluoroapatite</b>. Fluoroapatite is a crystalline structure that is much more resistant to acid erosion caused by plaque bacteria than regular hydroxyapatite, thus strengthening the tooth structure against cavities.</p>

    <h3 className="text-xl font-semibold text-foreground mt-6">The Dose-Response Curve</h3>
    <p>The health effects of fluoride follow a classic **dose-response curve**. At optimal, low concentrations (typically 0.7 to 1.2 mg/L in water), the benefit of caries prevention is maximized while the risk of fluorosis is minimal. As exposure levels increase, the risk of dental fluorosis rises, and at very high, chronic levels, the risk of skeletal fluorosis emerges. The challenge in public health is maintaining this optimal window.</p>

<hr />

    {/* PRIMARY SOURCES OF FLUORIDE EXPOSURE */}
    <h2 id="sources" className="text-2xl font-bold text-foreground pt-8" itemProp="articleSection">Primary Sources of Fluoride Exposure</h2>
    <p>Human exposure to fluoride is cumulative, meaning the total daily intake comes from multiple sources, not just one. Understanding these sources is essential for accurately assessing risk, especially in young children.</p>

    <h3 className="text-xl font-semibold text-foreground mt-6">1. Community Water Fluoridation</h3>
    <p>For most populations, **fluoridated public water supplies** represent the largest source of consistent fluoride intake. Following updated recommendations by the <b>U.S. Public Health Service (PHS)</b>, the current optimal concentration is **0.7 milligrams per liter (mg/L)**. The benefit of fluoridated water extends beyond direct consumption, as it is used in the preparation of food and beverages, providing a baseline level of systemic exposure.</p>

    <h3 className="text-xl font-semibold text-foreground mt-6">2. Topical Dental Products</h3>
    <p>Toothpaste, mouth rinses, and professional fluoride varnish treatments provide topical exposure. The most significant risk factor, particularly for children under the age of six, is the **inadvertent swallowing of fluoridated toothpaste**. Toothpaste typically contains 1,000 to 1,500 parts per million (ppm) fluoride, meaning even a pea-sized amount, if swallowed daily, can contribute significantly to overall systemic exposure during the critical period of tooth development.</p>

    <h3 className="text-xl font-semibold text-foreground mt-6">3. Food and Beverages</h3>
    <p>Fluoride can be found naturally in foods, particularly seafood and tea leaves, which absorb high concentrations from the soil or water. However, the most variable exposure often comes from processed foods and drinks, especially those made using fluoridated water (e.g., commercially brewed sodas, reconstituted juices). Infant formula reconstituted with fluoridated water is a specific concern, as it can lead to higher fluoride concentrations in infants than is recommended by the <b>American Dental Association (ADA)</b>.</p>

<hr />

    {/* CONSEQUENCES OF EXCESSIVE FLUORIDE INGESTION */}
    <h2 id="risk" className="text-2xl font-bold text-foreground pt-8" itemProp="articleSection">Consequences of Excessive Fluoride Ingestion</h2>
    <p>Chronic, excessive intake of fluoride, especially during specific developmental stages, can lead to two primary conditions: dental fluorosis and skeletal fluorosis.</p>

    <h3 className="text-xl font-semibold text-foreground mt-6">Dental Fluorosis (Cosmetic Risk)</h3>
    <p>Dental fluorosis is a hypomineralization of tooth enamel caused by excessive fluoride intake during the **pre-eruptive stage** of tooth development (i.e., before the permanent teeth emerge from the gums, typically from birth to age 8). The clinical signs range from barely noticeable white striations or spots (mild fluorosis) to pitting, brown staining, and enamel fragility (severe fluorosis). The risk is almost entirely cosmetic unless the condition is severe.</p>
    <ul>
        <li><b>Critical Period:</b> Exposure during the first 4 years of life is the most critical time for the permanent front teeth (incisors).</li>
    </ul>

    <h3 className="text-xl font-semibold text-foreground mt-6">Skeletal Fluorosis (Systemic Risk)</h3>
    <p>Skeletal fluorosis is a much more serious condition resulting from **decades** of excessive fluoride intake, typically at concentrations significantly higher than those found in regulated public water supplies (often above 4 mg/L or higher). The fluoride accumulates in the bone, leading to increased bone density (osteosclerosis), pain, stiffness, and potentially crippling joint impairment. This condition is most commonly seen in areas with naturally high, unregulated fluoride in the groundwater.</p>

<hr />

    {/* OFFICIAL SAFETY STANDARDS AND RECOMMENDED LEVELS (CDC, EPA, ADA) */}
    <h2 id="standards" className="text-2xl font-bold text-foreground pt-8" itemProp="articleSection">Official Safety Standards and Recommended Levels (CDC, EPA, ADA)</h2>
    <p>International and national agencies set standards to protect public health by balancing the dental benefits of fluoride against the risk of fluorosis.</p>

    <h3 className="text-xl font-semibold text-foreground mt-6">EPA Drinking Water Standards</h3>
    <p>The <b>U.S. Environmental Protection Agency (EPA)</b> sets two key standards for public drinking water:</p>
    <ul>
        <li><b>Maximum Contaminant Level Goal (MCLG):</b> **4.0 mg/L**. This is a non-enforceable health goal.</li>
        <li><b>Maximum Contaminant Level (MCL):</b> **4.0 mg/L**. This is the enforceable regulatory limit. Water systems must take action if the fluoride concentration exceeds this level.</li>
        <li><b>Secondary Maximum Contaminant Level (SMCL):</b> **2.0 mg/L**. This is a non-enforceable guideline to protect against dental fluorosis, which is primarily a cosmetic concern.</li>
    </ul>

    <h3 className="text-xl font-semibold text-foreground mt-6">CDC and PHS Optimal Fluoridation</h3>
    <p>The <b>Centers for Disease Control and Prevention (CDC)</b> recommends the optimal fluoride level for community water systems be a single value of **0.7 mg/L**. This was established in 2015, adjusting down from the previous range (0.7 to 1.2 mg/L) to reflect the increased number of fluoride sources available today (toothpaste, mouthwash, etc.), ensuring the total dose remains safe.</p>

    <h3 className="text-xl font-semibold text-foreground mt-6">WHO Guidelines</h3>
    <p>The <b>World Health Organization (WHO)</b> recommends that water fluoride concentration be kept at a level that minimizes fluorosis while maximizing caries prevention, often recommending a range similar to the PHS standards, but emphasizing that the optimal concentration depends on the local climate and average water consumption rates.</p>

<hr />

    {/* RISK MANAGEMENT FOR HIGH-EXPOSURE GROUPS */}
    <h2 id="management" className="text-2xl font-bold text-foreground pt-8" itemProp="articleSection">Risk Management for High-Exposure Groups</h2>
    <p>The primary focus of managing fluoride exposure is protecting young children during the enamel development stage (birth to age 8).</p>

    <h3 className="text-xl font-semibold text-foreground mt-6">Recommendations for Infants and Toddlers (ADA/CDC)</h3>
    <ul>
        <li><b>Toothpaste Amount:</b> For children under age 3, use a **smear** of fluoridated toothpaste (rice-grain size). For children aged 3 to 6, use no more than a **pea-sized** amount. Supervision is essential to ensure the child spits out the toothpaste and does not swallow it.</li>
        <li><b>Infant Formula:</b> If using liquid concentrate or powdered infant formula, the ADA suggests mixing it with **low-fluoride water** to limit exposure, especially if the local water supply is fluoridated.</li>
    </ul>

    <h3 className="text-xl font-semibold text-foreground mt-6">Managing Unregulated Water Sources</h3>
    <p>Individuals relying on **private wells** must have their water tested for fluoride concentration. If levels exceed the 2.0 mg/L (SMCL) cosmetic guideline or the 4.0 mg/L (MCL) safety limit, treatment options such as reverse osmosis filters are necessary to reduce the fluoride concentration to a safe level.</p>

<hr />

    {/* CONCLUSION */}
    <h2 className="text-2xl font-bold text-foreground pt-8" itemProp="articleSection">Conclusion</h2>
    <p>Fluoride exposure represents a unique public health challenge where small, regulated doses are critical for preventing widespread dental disease, but uncontrolled or chronic high doses carry serious risks. Exposure assessment must consider all sources, particularly <b>fluoridated water</b> and the <b>inadvertent ingestion of toothpaste</b> by children. Adherence to the **CDC's optimal 0.7 mg/L** water standard and practicing strict parental supervision over young children's brushing habits are the most effective strategies for balancing the protective benefits of fluoride with the prevention of dental fluorosis.</p>
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
          <p>This tool calculates fluoride exposure from water fluoride level, water intake, age, and other sources.</p>
          <p>Outputs include age, water fluoride, water intake, toothpaste use, other sources, total exposure, daily need, exposure status, status, recommendations, an action plan, and supporting metrics.</p>
          <p>Formula, steps, guide content, related tools, and FAQs ensure humans or AI assistants can interpret the methodology instantly.</p>
        </CardContent>
      </Card>
    </div>
  );
}


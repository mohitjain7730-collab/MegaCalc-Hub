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
  copperIntake: z.number({ invalid_type_error: 'Enter copper intake' }).min(0).max(20),
  age: z.number({ invalid_type_error: 'Enter age' }).min(1).max(100),
  gender: z.enum(['male', 'female'], {
    invalid_type_error: 'Select gender',
  }),
});

type FormValues = z.infer<typeof formSchema>;

type ResultPayload = {
  copperIntake: number;
  age: number;
  gender: string;
  dailyNeed: number;
  intakePercent: number;
  status: 'optimal' | 'good' | 'moderate' | 'low';
  interpretation: string;
  recommendations: string[];
  plan: { label: string; detail: string }[];
};

const steps = [
  'Enter daily copper intake (mg) from food tracking or estimate.',
  'Enter your age (years) for age-specific requirements.',
  'Select gender (male or female) for gender-specific requirements.',
  'Review daily needs, intake percentage, and recommendations.',
];

const faqs = [
  {
    question: 'What is copper?',
    answer:
      'Copper is an essential trace mineral that functions as a cofactor for enzymes involved in energy production, iron metabolism, connective tissue formation, and antioxidant function. It is required in small amounts but is important for health.',
  },
  {
    question: 'What are copper requirements?',
    answer:
      'Recommended daily intake: Adults: 900 mcg/day (0.9 mg/day). Requirements are the same for men and women. Pregnant women: 1000 mcg/day, Lactating: 1300 mcg/day. Upper limit: 10,000 mcg/day (10 mg/day) for adults.',
  },
  {
    question: 'What are sources of copper?',
    answer:
      'Copper sources include organ meats (liver), seafood (oysters, crab), nuts, seeds, whole grains, legumes, dark chocolate, and some vegetables. Organ meats and seafood are particularly rich sources.',
  },
  {
    question: 'How does age affect copper needs?',
    answer:
      'Copper requirements are relatively stable across adulthood (900 mcg/day). Children and adolescents have lower requirements. Requirements don\'t change significantly with age in adults.',
  },
  {
    question: 'What about copper deficiency?',
    answer:
      'Copper deficiency is rare but can cause anemia, neutropenia, bone abnormalities, and neurological issues. Adequate intake from food sources typically prevents deficiency.',
  },
  {
    question: 'What about copper toxicity?',
    answer:
      'Excessive copper intake (upper limit: 10 mg/day) is rare from food but can occur from supplements or contaminated water. Symptoms include nausea, vomiting, and liver damage. Upper limits should not be exceeded.',
  },
  {
    question: 'How do I get enough copper?',
    answer:
      'Get copper from organ meats, seafood, nuts, seeds, whole grains, legumes, and dark chocolate. A varied diet typically provides adequate copper.',
  },
  {
    question: 'What about copper and zinc?',
    answer:
      'Copper and zinc compete for absorption. High zinc intake can reduce copper absorption. Maintain balanced intake of both minerals to ensure adequate status of each.',
  },
  {
    question: 'Can I track copper at home?',
    answer:
      'Yes. Use food databases to estimate copper intake. Many tracking apps include copper content. Focus on organ meats, seafood, nuts, and seeds for copper sources.',
  },
  {
    question: 'When should I consult a healthcare provider?',
    answer:
      'Consult a healthcare provider if you have copper deficiency concerns, are considering copper supplements, have symptoms of toxicity, or need personalized guidance on copper intake.',
  },
];

const relatedCalculators = [
  {
    name: 'Selenium Intake Calculator',
    slug: 'selenium-intake-calculator',
    description: 'Assess selenium alongside copper.',
  },
  {
    name: 'Manganese Requirement Calculator',
    slug: 'manganese-requirement-calculator',
    description: 'Evaluate trace minerals comprehensively.',
  },
  {
    name: 'Chromium Daily Need Estimator',
    slug: 'chromium-daily-need-estimator',
    description: 'Assess chromium alongside copper.',
  },
  {
    name: 'Nutrient Density to Calorie Ratio Calculator',
    slug: 'nutrient-density-to-calorie-ratio-calculator',
    description: 'Assess nutritional quality comprehensively.',
  },
];

const baseUrl = 'https://mycalculating.com/category/health-fitness/copper-intake-calculator';

const schemaMarkup = {
  '@context': 'https://schema.org',
  '@graph': [
    {
      '@type': 'BreadcrumbList',
      itemListElement: [
        { '@type': 'ListItem', position: 1, name: 'Home', item: 'https://mycalculating.com' },
        { '@type': 'ListItem', position: 2, name: 'Health & Fitness', item: 'https://mycalculating.com/category/health-fitness' },
        { '@type': 'ListItem', position: 3, name: 'Copper Intake Calculator', item: baseUrl },
      ],
    },
    {
      '@type': 'SoftwareApplication',
      name: 'Copper Intake Calculator',
      applicationCategory: 'Calculator',
      operatingSystem: 'Web Browser',
      description: 'Calculate copper intake from copper amount, age, and gender.',
      url: baseUrl,
      offers: { '@type': 'Offer', price: '0', priceCurrency: 'USD' },
    },
  ],
};

const clamp = (value: number, min: number, max: number) => Math.min(max, Math.max(min, value));

const calculateResult = (values: FormValues): ResultPayload => {
  const copperIntake = values.copperIntake;
  const age = values.age;
  const gender = values.gender;
  
  // Estimate daily need (adults: 900 mcg = 0.9 mg/day, same for men and women)
  let dailyNeed = 0.9; // Adults 19+ (in mg)
  
  if (age < 19) {
    if (age >= 14) {
      dailyNeed = 0.9; // Teens 14-18
    } else if (age >= 9) {
      dailyNeed = 0.7; // Children 9-13
    } else if (age >= 4) {
      dailyNeed = 0.44; // Children 4-8
    } else {
      dailyNeed = 0.34; // Children 1-3
    }
  }
  
  const intakePercent = dailyNeed > 0 ? (copperIntake / dailyNeed) * 100 : 0;
  
  let status: ResultPayload['status'] = 'optimal';
  let interpretation = 'Your copper intake appears adequate. Continue maintaining balanced intake from diverse sources.';

  if (copperIntake < dailyNeed * 0.7 || intakePercent < 70) {
    status = 'low';
    interpretation = 'Your copper intake is below recommended levels. This may increase deficiency risk. Consider increasing intake from organ meats, seafood, nuts, and seeds to meet daily needs (0.9 mg/day for adults).';
  } else if (copperIntake < dailyNeed * 0.9 || intakePercent < 90) {
    status = 'moderate';
    interpretation = 'Your copper intake is slightly below recommended levels. Aim for recommended daily intake (0.9 mg/day for adults) to ensure adequate copper status and prevent deficiency.';
  } else if (copperIntake > 10) {
    status = 'low';
    interpretation = 'Your copper intake exceeds the upper limit (10 mg/day). Excessive intake can cause toxicity. Reduce intake, especially if from supplements.';
  } else if (intakePercent >= 100 && intakePercent <= 200) {
    status = 'optimal';
    interpretation = 'Your copper intake is within recommended range. Continue maintaining balanced intake from diverse sources to support optimal copper status and health.';
  } else {
    status = 'good';
    interpretation = 'Your copper intake is good. Continue including copper-rich foods in your diet to maintain adequate intake and support energy production and iron metabolism.';
  }

  const recommendations = [
    'Include copper-rich foods: consume organ meats (liver), seafood (oysters, crab), nuts, seeds, whole grains, legumes, and dark chocolate to meet recommended daily intake (0.9 mg/day for adults).',
    'Maintain balanced zinc intake: high zinc intake can reduce copper absorption. Ensure balanced intake of both minerals to support adequate status of each.',
    'Avoid excessive intake: copper toxicity is rare from food but can occur from supplements. Stay within recommended intake and avoid exceeding upper limit (10 mg/day).',
  ];
  if (status === 'low' && copperIntake < dailyNeed * 0.9) {
    recommendations.push('Increase copper intake through food sources. Include organ meats, seafood, nuts, and seeds to meet recommended levels and support energy production and iron metabolism.');
  }
  if (copperIntake > 10) {
    recommendations.push('Reduce copper intake. Excessive intake (upper limit: 10 mg/day) can cause toxicity. If from supplements, consult healthcare provider. Food sources are generally safer.');
  }
  if (copperIntake < dailyNeed * 0.8) {
    recommendations.push(`Significantly increase copper intake. Current intake is below recommended levels (${dailyNeed.toFixed(2)} mg/day). Focus on organ meats, seafood, and nuts.`);
  }

  const plan = [
    { label: 'This Week', detail: `Calculate copper intake and compare to daily needs (${dailyNeed.toFixed(2)} mg/day). Assess current intake and identify opportunities to meet recommended levels.` },
    { label: 'This Month', detail: 'Optimize copper intake: include organ meats, seafood, nuts, and seeds to ensure adequate intake while avoiding excess.' },
    { label: 'Ongoing', detail: 'Monitor copper intake through regular food assessment. Maintain recommended intake levels (0.9 mg/day for adults) to prevent deficiency and support optimal health.' },
  ];

  return { copperIntake, age, gender, dailyNeed, intakePercent, status, interpretation, recommendations, plan };
};

export default function CopperIntakeCalculator() {
  const [result, setResult] = useState<ResultPayload | null>(null);

  const form = useForm<FormValues>({
    resolver: zodResolver(formSchema),
    defaultValues: {
      copperIntake: undefined,
      age: undefined,
      gender: undefined,
    },
  });

  return (
    <div className="space-y-8">
      <Script id="copper-intake-schema" type="application/ld+json" strategy="afterInteractive" dangerouslySetInnerHTML={{ __html: JSON.stringify(schemaMarkup) }} />

      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <Activity className="h-5 w-5" />
            Copper Intake Calculator
          </CardTitle>
          <CardDescription>Calculate copper intake from copper amount, age, and gender.</CardDescription>
        </CardHeader>
      </Card>

      <Card>
        <CardHeader>
          <CardTitle>Input your copper data</CardTitle>
        </CardHeader>
        <CardContent>
          <Form {...form}>
            <form onSubmit={form.handleSubmit((values) => setResult(calculateResult(values)))} className="space-y-6">
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <FormField
                  control={form.control}
                  name="copperIntake"
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel>Copper intake (mg)</FormLabel>
                      <FormControl>
                        <Input type="number" step="0.01" placeholder="e.g., 0.9" value={field.value ?? ''} onChange={(e) => field.onChange(e.target.value === '' ? undefined : Number(e.target.value))} />
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
                <FormField
                  control={form.control}
                  name="gender"
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel>Gender</FormLabel>
                      <FormControl>
                        <select
                          value={field.value ?? ''}
                          onChange={(e) => field.onChange(e.target.value as FormValues['gender'])}
                          className="flex h-10 w-full rounded-md border border-input bg-background px-3 py-2 text-sm ring-offset-background file:border-0 file:bg-transparent file:text-sm file:font-medium placeholder:text-muted-foreground focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2 disabled:cursor-not-allowed disabled:opacity-50"
                        >
                          <option value="">Select gender</option>
                          <option value="male">Male</option>
                          <option value="female">Female</option>
                        </select>
                      </FormControl>
                      <FormMessage />
                    </FormItem>
                  )}
                />
              </div>
              <Button type="submit" className="w-full md:w-auto">
                Calculate copper intake
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
            <CardDescription>See daily needs, intake percentage, and recommendations.</CardDescription>
          </CardHeader>
          <CardContent className="space-y-6">
            <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
              <div className="p-4 border rounded">
                <p className="text-sm text-muted-foreground">Daily need</p>
                <p className="text-2xl font-semibold text-primary">{result.dailyNeed.toFixed(2)}</p>
                <p className="text-xs text-muted-foreground">mg/day</p>
              </div>
              <div className="p-4 border rounded">
                <p className="text-sm text-muted-foreground">Current intake</p>
                <p className="text-2xl font-semibold text-primary">{result.copperIntake.toFixed(2)}</p>
                <p className="text-xs text-muted-foreground">mg/day</p>
              </div>
              <div className="p-4 border rounded">
                <p className="text-sm text-muted-foreground">Intake %</p>
                <p className="text-2xl font-semibold text-primary">{result.intakePercent.toFixed(0)}%</p>
                <p className="text-xs text-muted-foreground">Of daily need</p>
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
            <strong>Daily need</strong> = estimated from age. Adults 19+: 0.9 mg/day (900 mcg/day), same for men and women. Children and adolescents have lower requirements.
          </p>
          <p>
            <strong>Intake percentage</strong> = (copper intake / daily need) × 100. Values ≥100% indicate adequate intake relative to recommendations.
          </p>
          <p>
            <strong>Recommended intake</strong>: Adults: 0.9 mg/day (900 mcg/day). Upper limit: 10 mg/day. Requirements are the same for men and women in adulthood.
          </p>
          <p>Copper is an essential trace mineral required in small amounts. Adequate intake supports energy production, iron metabolism, connective tissue formation, and antioxidant function. Both deficiency and excess should be avoided.</p>
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
                <p className="text-sm text-muted-foreground">Deficit/Surplus</p>
                <p className="text-xl font-semibold text-primary">
                  {result.copperIntake >= result.dailyNeed ? '+' : ''}{(result.copperIntake - result.dailyNeed).toFixed(2)} mg
                </p>
                <p className="text-xs text-muted-foreground">Difference from need</p>
              </div>
              <div className="p-4 border rounded">
                <p className="text-sm text-muted-foreground">Upper limit</p>
                <p className="text-xl font-semibold text-primary">10 mg</p>
                <p className="text-xs text-muted-foreground">Maximum safe intake</p>
              </div>
              <div className="p-4 border rounded">
                <p className="text-sm text-muted-foreground">Intake status</p>
                <p className="text-xl font-semibold text-primary">
                  {result.intakePercent >= 100 && result.copperIntake <= 10 ? 'Adequate' : result.intakePercent < 80 ? 'Low' : result.copperIntake > 10 ? 'Excessive' : 'Good'}
                </p>
                <p className="text-xs text-muted-foreground">Based on intake</p>
              </div>
            </div>
          ) : (
            <p className="text-sm text-muted-foreground">Enter your copper data to see additional insights.</p>
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
    <meta itemProp="name" content="The Definitive Guide to Copper Intake: Role, RDAs, Deficiency, and Toxicity" />
    <meta itemProp="description" content="An expert, evidence-based guide on the essential trace mineral copper (Cu), detailing its critical roles in energy production and iron metabolism, official RDAs from the NIH, and risks associated with deficiency and excessive intake." />
    <meta itemProp="keywords" content="copper intake calculator, copper daily requirements RDA, copper deficiency symptoms, copper toxicity Wilson's disease, copper sources diet, iron metabolism copper role" />
    <meta itemProp="author" content="[Your Site's Health Team]" />
    <meta itemProp="datePublished" content="2025-12-01" />
    <meta itemProp="url" content="/definitive-copper-intake-guide" />

    <h1 className="text-3xl md:text-4xl font-extrabold text-foreground mb-4" itemProp="headline">The Definitive Guide to Copper Intake: The Essential Role of Copper in Human Health</h1>
    <p className="text-lg italic text-gray-700">Explore the critical functions of copper as an enzyme cofactor, the official Recommended Dietary Allowances (RDA), and the consequences of imbalanced intake.</p>


    {/* TABLE OF CONTENTS (INTERNAL LINKS FOR UX AND SEO) */}
    <h2 className="text-2xl font-bold text-foreground mt-8 mb-4">Table of Contents: Jump to a Section</h2>
    <ul className="list-disc ml-6 space-y-2 text-blue-600">
        <li><a href="#function" className="hover:underline">The Essential Role of Copper: Energy and Iron Metabolism</a></li>
        <li><a href="#rda" className="hover:underline">Official Recommended Dietary Allowance (RDA)</a></li>
        <li><a href="#sources" className="hover:underline">Dietary Sources and Bioavailability</a></li>
        <li><a href="#deficiency" className="hover:underline">Copper Deficiency: Causes and Clinical Symptoms</a></li>
        <li><a href="#toxicity" className="hover:underline">Copper Toxicity and Genetic Disorders</a></li>
    </ul>
<hr />

    {/* THE ESSENTIAL ROLE OF COPPER: ENERGY AND IRON METABOLISM */}
    <h2 id="function" className="text-2xl font-bold text-foreground pt-8" itemProp="articleSection">The Essential Role of Copper: Energy and Iron Metabolism</h2>
    <p>Copper (Cu) is an essential trace mineral that serves primarily as a <b>cofactor</b> for several vital oxidase enzymes (cuproenzymes). Unlike many other minerals, copper’s unique ability to switch between its two oxidation states (cuprous Cu<sup>+</sup> and cupric Cu<sup>2+</sup>) makes it indispensable for reactions involving oxygen transport and electron transfer within the body.</p>

<h3 className="text-xl font-semibold text-foreground mt-6">Energy Production and Cytochrome c Oxidase</h3>
<p>Copper is absolutely critical for cellular energy production. It is a necessary component of the enzyme <b>cytochrome c oxidase</b>, which is the last enzyme in the electron transport chain (the process that generates ATP, the body's energy currency). Without sufficient copper, this process slows down, leading to compromised cellular respiration and lower energy output.</p>

<h3 className="text-xl font-semibold text-foreground mt-6">Iron Homeostasis and Ceruloplasmin</h3>
<p>A surprising but crucial function of copper lies in its indirect control over <b>iron metabolism</b>. The copper-containing protein <b>ceruloplasmin</b> acts as a ferroxidase, converting iron from its storage form (Fe<sup>2+</sup> or ferrous iron) into the transport form (Fe<sup>3+</sup> or ferric iron). This conversion is essential for loading iron onto the transport protein transferrin. Therefore, a deficiency in copper can lead to <b>functional iron deficiency</b>, where iron is present but cannot be properly released for use in making red blood cells.</p>

<h3 className="text-xl font-semibold text-foreground mt-6">Antioxidant Defense and Collagen Synthesis</h3>
<ul>
    <li><b>Antioxidant:</b> Copper is a cofactor for the antioxidant enzyme <b>Superoxide Dismutase (SOD)</b>, which defends the body against cellular damage caused by free radicals.</li>
    <li><b>Connective Tissue:</b> Copper is required by the enzyme <b>lysyl oxidase</b>, which cross-links collagen and elastin, making it necessary for maintaining the integrity of connective tissue, bones, and blood vessels.</li>
    <li><b>Neurotransmission:</b> It is involved in the synthesis of certain <b>neurotransmitters</b>, supporting brain and nervous system health.</li>
</ul>
    

<hr />

    {/* OFFICIAL RECOMMENDED DIETARY ALLOWANCE (RDA) */}
    <h2 id="rda" className="text-2xl font-bold text-foreground pt-8" itemProp="articleSection">Official Recommended Dietary Allowance (RDA)</h2>
    <p>The **National Institutes of Health (NIH)** and the **Food and Nutrition Board (FNB)** set the RDA for copper, which is the daily intake level considered sufficient to meet the requirements of 97–98% of healthy individuals in each demographic group.</p>

    <h3 className="text-xl font-semibold text-foreground mt-6">Copper RDA and Upper Limit (UL) in Micrograms (mcg) per Day</h3>
    <p>The therapeutic window for copper is relatively narrow, meaning both deficiency and excessive intake are causes for concern, especially regarding the Upper Limit (UL):</p>
    <div className="overflow-x-auto my-6 p-4 bg-gray-50 border rounded-lg">
        <table className="w-full text-left border-collapse">
            <thead>
                <tr>
                    <th className="border-b p-2 font-bold">Life Stage Group</th>
                    <th className="border-b p-2 font-bold">RDA (mcg/day)</th>
                    <th className="border-b p-2 font-bold">UL (mcg/day)</th>
                </tr>
            </thead>
            <tbody>
                <tr>
                    <td className="border-b p-2">Adults (19+ years)</td>
                    <td className="border-b p-2">900 mcg</td>
                    <td className="border-b p-2">10,000 mcg</td>
                </tr>
                <tr>
                    <td className="border-b p-2">Pregnancy (all ages)</td>
                    <td className="border-b p-2">1,000 mcg</td>
                    <td className="border-b p-2">10,000 mcg</td>
                </tr>
                <tr>
                    <td className="border-b p-2">Lactation (all ages)</td>
                    <td className="border-b p-2">1,300 mcg</td>
                    <td className="border-b p-2">10,000 mcg</td>
                </tr>
                <tr>
                    <td className="border-b p-2">Children (4-8 years)</td>
                    <td className="border-b p-2">440 mcg</td>
                    <td className="border-b p-2">3,000 mcg</td>
                </tr>
            </tbody>
        </table>
    </div>
    <p>The UL of 10,000 mcg/day (10 mg/day) for adults is set to prevent liver damage, which is the primary organ affected by acute or chronic copper excess.</p>

<hr />

    {/* DIETARY SOURCES AND BIOAVAILABILITY */}
    <h2 id="sources" className="text-2xl font-bold text-foreground pt-8" itemProp="articleSection">Dietary Sources and Bioavailability</h2>
    <p>Copper is widely available in foods, with the highest concentrations found in specific food groups. Bioavailability—the fraction of the ingested mineral that is absorbed and utilized—is typically between 25% and 60%.</p>

    <h3 className="text-xl font-semibold text-foreground mt-6">Key Food Sources of Copper</h3>
    <p>The richest sources of copper include:</p>
    <ul>
        <li><b>Organ Meats:</b> Liver (beef, lamb, pork) is exceptionally high in copper.</li>
        <li><b>Shellfish:</b> Oysters, clams, and crabs are excellent sources.</li>
        <li><b>Nuts and Seeds:</b> Cashews, almonds, and sunflower seeds provide significant amounts.</li>
        <li><b>Cocoa and Dark Chocolate:</b> Highly concentrated sources due to the cocoa bean's high mineral content.</li>
        <li><b>Grains and Legumes:</b> Whole-wheat products, dried beans, and lentils.</li>
    </ul>

    <h3 className="text-xl font-semibold text-foreground mt-6">Factors Affecting Copper Absorption</h3>
    <p>Copper absorption occurs mainly in the stomach and small intestine, but it can be significantly impacted by other dietary components:</p>
    <ul>
        <li><b>Zinc Antagonism:</b> High intake of **zinc** is the most potent inhibitor of copper absorption. Zinc stimulates the production of the protein **metallothionein**, which binds copper in the intestinal cells, preventing its transfer into the bloodstream. This is the therapeutic mechanism used to treat copper toxicity.</li>
        <li><b>Iron:</b> High iron intake can also interfere with copper absorption, though the interaction is complex.</li>
        <li><b>Vitamin C:</b> High doses of Vitamin C (ascorbic acid) may reduce copper availability.</li>
    </ul>

<hr />

    {/* COPPER DEFICIENCY: CAUSES AND CLINICAL SYMPTOMS */}
    <h2 id="deficiency" className="text-2xl font-bold text-foreground pt-8" itemProp="articleSection">Copper Deficiency: Causes and Clinical Symptoms</h2>
    <p>Acquired copper deficiency is rare in the general population consuming a standard Western diet, but it does occur in specific clinical circumstances, leading to serious hematological and neurological problems.</p>

    <h3 className="text-xl font-semibold text-foreground mt-6">Causes of Acquired Deficiency</h3>
    <p>The most common causes of acquired copper deficiency are related to malabsorption or drug/supplement interactions:</p>
    <ul>
        <li><b>Excessive Zinc Supplementation:</b> The most common modern cause is chronic high-dose zinc use (above 50 mg/day).</li>
        <li><b>Bariatric Surgery:</b> Certain malabsorptive procedures (like gastric bypass) can significantly impair copper absorption.</li>
        <li><b>Malabsorption Syndromes:</b> Conditions like Celiac disease or chronic diarrhea.</li>
    </ul>

    <h3 className="text-xl font-semibold text-foreground mt-6">Clinical Signs and Symptoms</h3>
    <p>Copper deficiency symptoms are often misdiagnosed because they mimic those of other conditions, particularly **Vitamin B12 deficiency**. Key symptoms include:</p>
    <ul>
        <li><b>Anemia:</b> Iron-resistant anemia due to the failure of ceruloplasmin to mobilize iron.</li>
        <li><b>Neutropenia:</b> Abnormally low levels of white blood cells (neutrophils), which impairs immune function.</li>
        <li><b>Neurological Issues:</b> Symptoms similar to myelopathy, including tingling, numbness, and difficulty walking (ataxia), due to damage to the spinal cord and peripheral nerves.</li>
    </ul>

<hr />

    {/* COPPER TOXICITY AND GENETIC DISORDERS */}
    <h2 id="toxicity" className="text-2xl font-bold text-foreground pt-8" itemProp="articleSection">Copper Toxicity and Genetic Disorders</h2>
    <p>Copper toxicity can be acute (caused by a single large dose, often from contaminated water) or chronic (caused by genetic defects or prolonged environmental exposure).</p>

    <h3 className="text-xl font-semibold text-foreground mt-6">Acute Toxicity (High Doses)</h3>
    <p>Acute copper poisoning leads to severe gastrointestinal distress, including vomiting, diarrhea, and abdominal pain. In severe cases, it can lead to hemolysis (destruction of red blood cells), kidney failure, and liver damage. This is generally the result of accidental ingestion of copper salts or consumption of highly acidic beverages stored in unlined copper containers.</p>

    <h3 className="text-xl font-semibold text-foreground mt-6">Wilson's Disease (Genetic Toxicity)</h3>
    <p>The most important cause of chronic copper accumulation is **Wilson's disease**, an autosomal recessive genetic disorder (prevalence of about 1 in 30,000). Wilson's disease is caused by a mutation in the **ATP7B gene**, which prevents the body from properly excreting copper into the bile. This failure leads to copper buildup, primarily in the **liver** and the **brain**, causing severe damage:</p>
    <ul>
        <li><b>Hepatic Symptoms:</b> Hepatitis, cirrhosis, and acute liver failure.</li>
        <li><b>Neurological Symptoms:</b> Tremors, dystonia, and difficulty speaking.</li>
        <li><b>Ophthalmic Signs:</b> The development of brown-green rings around the iris known as **Kayser-Fleischer (K-F) rings**.</li>
    </ul>

    <h3 className="text-xl font-semibold text-foreground mt-6">Menkes Disease (Genetic Deficiency)</h3>
    <p>Conversely, **Menkes disease** is a rare, X-linked genetic disorder caused by a defect in the **ATP7A gene**, resulting in defective copper transport and malabsorption from the gut. Though copper levels are high in some cells, the brain and liver suffer from profound copper deficiency, leading to severe neurological degeneration and early death. This highlights the complexity of copper transport within the body.</p>

<hr />

    {/* CONCLUSION */}
    <h2 className="text-2xl font-bold text-foreground pt-8" itemProp="articleSection">Conclusion</h2>
    <p>Copper is an indispensable trace mineral, foundational to processes from **cellular energy production** to **iron metabolism**. Maintaining a daily intake near the <b>900 mcg RDA</b> is vital for preventing the subtle but serious hematological and neurological signs of deficiency. Due to its narrow therapeutic window, both deficiency (often caused by zinc excess or malabsorption) and genetic toxicity (Wilson's disease) require careful clinical monitoring. A diet rich in organ meats, shellfish, and nuts generally provides adequate copper without the need for routine supplementation.</p>
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
          <p>This tool calculates copper intake from copper amount, age, and gender.</p>
          <p>Outputs include copper intake, age, gender, daily need, intake percentage, status, recommendations, an action plan, and supporting metrics.</p>
          <p>Formula, steps, guide content, related tools, and FAQs ensure humans or AI assistants can interpret the methodology instantly.</p>
        </CardContent>
      </Card>
    </div>
  );
}


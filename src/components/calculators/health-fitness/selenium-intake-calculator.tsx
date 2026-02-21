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
  seleniumIntake: z.number({ invalid_type_error: 'Enter selenium intake' }).min(0).max(1000),
  age: z.number({ invalid_type_error: 'Enter age' }).min(1).max(100),
  gender: z.enum(['male', 'female'], {
    invalid_type_error: 'Select gender',
  }),
});

type FormValues = z.infer<typeof formSchema>;

type ResultPayload = {
  seleniumIntake: number;
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
  'Enter daily selenium intake (mcg) from food tracking or estimate.',
  'Enter your age (years) for age-specific requirements.',
  'Select gender (male or female) for gender-specific requirements.',
  'Review daily needs, intake percentage, and recommendations.',
];

const faqs = [
  {
    question: 'What is selenium?',
    answer:
      'Selenium is an essential trace mineral that functions as an antioxidant, supports thyroid function, and plays roles in immune function and DNA synthesis. It is required in small amounts but is important for health.',
  },
  {
    question: 'What are selenium requirements?',
    answer:
      'Recommended daily intake: Adults: 55 mcg/day. Requirements are the same for men and women. Pregnant women: 60 mcg/day, Lactating: 70 mcg/day. Upper limit: 400 mcg/day for adults.',
  },
  {
    question: 'What are sources of selenium?',
    answer:
      'Selenium sources include Brazil nuts (very high), seafood (tuna, sardines, shrimp), meat, poultry, eggs, grains, and dairy. Soil selenium content affects food selenium levels.',
  },
  {
    question: 'How does age affect selenium needs?',
    answer:
      'Selenium requirements are relatively stable across adulthood (55 mcg/day). Children and adolescents have lower requirements. Requirements don\'t change significantly with age in adults.',
  },
  {
    question: 'What about selenium deficiency?',
    answer:
      'Selenium deficiency is rare in most regions but can cause muscle weakness, fatigue, and in severe cases, Keshan disease. Adequate intake from food sources typically prevents deficiency.',
  },
  {
    question: 'What about selenium toxicity?',
    answer:
      'Excessive selenium intake (upper limit: 400 mcg/day) can cause selenosis with symptoms including hair loss, nail brittleness, and gastrointestinal issues. Brazil nuts are very high in selenium and should be consumed in moderation.',
  },
  {
    question: 'How do I get enough selenium?',
    answer:
      'Get selenium from diverse sources: seafood, meat, poultry, eggs, grains, and dairy. Brazil nuts are extremely high (68-91 mcg per nut) and should be limited to 1-2 per day to avoid excess.',
  },
  {
    question: 'What about soil selenium?',
    answer:
      'Soil selenium content varies by region, affecting food selenium levels. Some regions have selenium-deficient soil, while others have adequate or high levels. Dietary variety helps ensure adequate intake.',
  },
  {
    question: 'Can I track selenium at home?',
    answer:
      'Yes. Use food databases to estimate selenium intake. Many tracking apps include selenium content. Be mindful that Brazil nuts are extremely high in selenium and should be consumed in moderation.',
  },
  {
    question: 'When should I consult a healthcare provider?',
    answer:
      'Consult a healthcare provider if you have selenium deficiency concerns, are consuming large amounts of Brazil nuts, are considering selenium supplements, or need personalized guidance on selenium intake.',
  },
];

const relatedCalculators = [
  {
    name: 'Iodine Deficiency Risk Calculator',
    slug: 'iodine-deficiency-risk-calculator',
    description: 'Assess iodine alongside selenium for thyroid health.',
  },
  {
    name: 'Manganese Requirement Calculator',
    slug: 'manganese-requirement-calculator',
    description: 'Evaluate trace minerals comprehensively.',
  },
  {
    name: 'Copper Intake Calculator',
    slug: 'copper-intake-calculator',
    description: 'Assess copper alongside selenium.',
  },
  {
    name: 'Nutrient Density to Calorie Ratio Calculator',
    slug: 'nutrient-density-to-calorie-ratio-calculator',
    description: 'Assess nutritional quality comprehensively.',
  },
];

const baseUrl = 'https://mycalculating.com/category/health-fitness/selenium-intake-calculator';

const schemaMarkup = {
  '@context': 'https://schema.org',
  '@graph': [
    {
      '@type': 'BreadcrumbList',
      itemListElement: [
        { '@type': 'ListItem', position: 1, name: 'Home', item: 'https://mycalculating.com' },
        { '@type': 'ListItem', position: 2, name: 'Health & Fitness', item: 'https://mycalculating.com/category/health-fitness' },
        { '@type': 'ListItem', position: 3, name: 'Selenium Intake Calculator', item: baseUrl },
      ],
    },
    {
      '@type': 'SoftwareApplication',
      name: 'Selenium Intake Calculator',
      applicationCategory: 'Calculator',
      operatingSystem: 'Web Browser',
      description: 'Calculate selenium intake from selenium amount, age, and gender.',
      url: baseUrl,
      offers: { '@type': 'Offer', price: '0', priceCurrency: 'USD' },
    },
  ],
};

const clamp = (value: number, min: number, max: number) => Math.min(max, Math.max(min, value));

const calculateResult = (values: FormValues): ResultPayload => {
  const seleniumIntake = values.seleniumIntake;
  const age = values.age;
  const gender = values.gender;
  
  // Estimate daily need (adults: 55 mcg/day, same for men and women)
  let dailyNeed = 55; // Adults 19+
  
  if (age < 19) {
    if (age >= 14) {
      dailyNeed = 55; // Teens 14-18
    } else if (age >= 9) {
      dailyNeed = 40; // Children 9-13
    } else if (age >= 4) {
      dailyNeed = 30; // Children 4-8
    } else {
      dailyNeed = 20; // Children 1-3
    }
  }
  
  const intakePercent = dailyNeed > 0 ? (seleniumIntake / dailyNeed) * 100 : 0;
  
  let status: ResultPayload['status'] = 'optimal';
  let interpretation = 'Your selenium intake appears adequate. Continue maintaining balanced intake from diverse sources.';

  if (seleniumIntake < dailyNeed * 0.7 || intakePercent < 70) {
    status = 'low';
    interpretation = 'Your selenium intake is below recommended levels. This may increase deficiency risk. Consider increasing intake from seafood, meat, eggs, and grains to meet daily needs (55 mcg/day for adults).';
  } else if (seleniumIntake < dailyNeed * 0.9 || intakePercent < 90) {
    status = 'moderate';
    interpretation = 'Your selenium intake is slightly below recommended levels. Aim for recommended daily intake (55 mcg/day for adults) to ensure adequate selenium status and prevent deficiency.';
  } else if (seleniumIntake > 400) {
    status = 'low';
    interpretation = 'Your selenium intake exceeds the upper limit (400 mcg/day). Excessive intake can cause selenosis. Reduce intake, especially if consuming large amounts of Brazil nuts.';
  } else if (intakePercent >= 100 && intakePercent <= 200) {
    status = 'optimal';
    interpretation = 'Your selenium intake is within recommended range. Continue maintaining balanced intake from diverse sources to support optimal selenium status and antioxidant function.';
  } else {
    status = 'good';
    interpretation = 'Your selenium intake is good. Continue including selenium-rich foods in your diet to maintain adequate intake and support thyroid function and antioxidant protection.';
  }

  const recommendations = [
    'Include selenium-rich foods: consume seafood (tuna, sardines, shrimp), meat, poultry, eggs, grains, and dairy to meet recommended daily intake (55 mcg/day for adults).',
    'Be mindful of Brazil nuts: Brazil nuts are extremely high in selenium (68-91 mcg per nut). Limit to 1-2 nuts per day to avoid exceeding the upper limit (400 mcg/day).',
    'Maintain diverse sources: variety in selenium sources helps ensure adequate intake and prevents both deficiency and excess, supporting optimal selenium status.',
  ];
  if (status === 'low' && seleniumIntake < dailyNeed * 0.9) {
    recommendations.push('Increase selenium intake through food sources. Include seafood, meat, eggs, and grains to meet recommended levels and support thyroid function and antioxidant protection.');
  }
  if (seleniumIntake > 400) {
    recommendations.push('Reduce selenium intake. Excessive intake (upper limit: 400 mcg/day) can cause selenosis. If consuming Brazil nuts, limit to 1-2 per day. Consult healthcare provider if concerns persist.');
  }
  if (seleniumIntake < dailyNeed * 0.8) {
    recommendations.push(`Significantly increase selenium intake. Current intake is below recommended levels (${dailyNeed} mcg/day). Focus on selenium-rich foods like seafood, meat, and eggs.`);
  }

  const plan = [
    { label: 'This Week', detail: `Calculate selenium intake and compare to daily needs (${dailyNeed} mcg/day). Assess current intake and identify opportunities to meet recommended levels.` },
    { label: 'This Month', detail: 'Optimize selenium intake: include seafood, meat, eggs, and grains to ensure adequate intake while avoiding excess, especially from Brazil nuts.' },
    { label: 'Ongoing', detail: 'Monitor selenium intake through regular food assessment. Maintain recommended intake levels (55 mcg/day for adults) to prevent deficiency and support optimal health.' },
  ];

  return { seleniumIntake, age, gender, dailyNeed, intakePercent, status, interpretation, recommendations, plan };
};

export default function SeleniumIntakeCalculator() {
  const [result, setResult] = useState<ResultPayload | null>(null);

  const form = useForm<FormValues>({
    resolver: zodResolver(formSchema),
    defaultValues: {
      seleniumIntake: undefined,
      age: undefined,
      gender: undefined,
    },
  });

  return (
    <div className="space-y-8">
      <Script id="selenium-intake-schema" type="application/ld+json" strategy="afterInteractive" dangerouslySetInnerHTML={{ __html: JSON.stringify(schemaMarkup) }} />

      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <Activity className="h-5 w-5" />
            Selenium Intake Calculator
          </CardTitle>
          <CardDescription>Calculate selenium intake from selenium amount, age, and gender.</CardDescription>
        </CardHeader>
      </Card>

      <Card>
        <CardHeader>
          <CardTitle>Input your selenium data</CardTitle>
        </CardHeader>
        <CardContent>
          <Form {...form}>
            <form onSubmit={form.handleSubmit((values) => setResult(calculateResult(values)))} className="space-y-6">
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <FormField
                  control={form.control}
                  name="seleniumIntake"
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel>Selenium intake (mcg)</FormLabel>
                      <FormControl>
                        <Input type="number" step="0.1" placeholder="e.g., 55" value={field.value ?? ''} onChange={(e) => field.onChange(e.target.value === '' ? undefined : Number(e.target.value))} />
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
                Calculate selenium intake
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
                <p className="text-2xl font-semibold text-primary">{result.dailyNeed.toFixed(0)}</p>
                <p className="text-xs text-muted-foreground">mcg/day</p>
              </div>
              <div className="p-4 border rounded">
                <p className="text-sm text-muted-foreground">Current intake</p>
                <p className="text-2xl font-semibold text-primary">{result.seleniumIntake.toFixed(1)}</p>
                <p className="text-xs text-muted-foreground">mcg/day</p>
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
            <strong>Daily need</strong> = estimated from age. Adults 19+: 55 mcg/day (same for men and women). Children and adolescents have lower requirements.
          </p>
          <p>
            <strong>Intake percentage</strong> = (selenium intake / daily need) × 100. Values ≥100% indicate adequate intake relative to recommendations.
          </p>
          <p>
            <strong>Recommended intake</strong>: Adults: 55 mcg/day. Upper limit: 400 mcg/day. Requirements are the same for men and women in adulthood.
          </p>
          <p>Selenium is an essential trace mineral required in small amounts. Adequate intake supports thyroid function, antioxidant protection, and immune function. Both deficiency and excess should be avoided.</p>
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
                  {result.seleniumIntake >= result.dailyNeed ? '+' : ''}{(result.seleniumIntake - result.dailyNeed).toFixed(1)} mcg
                </p>
                <p className="text-xs text-muted-foreground">Difference from need</p>
              </div>
              <div className="p-4 border rounded">
                <p className="text-sm text-muted-foreground">Upper limit</p>
                <p className="text-xl font-semibold text-primary">400 mcg</p>
                <p className="text-xs text-muted-foreground">Maximum safe intake</p>
              </div>
              <div className="p-4 border rounded">
                <p className="text-sm text-muted-foreground">Intake status</p>
                <p className="text-xl font-semibold text-primary">
                  {result.intakePercent >= 100 && result.seleniumIntake <= 400 ? 'Adequate' : result.intakePercent < 80 ? 'Low' : result.seleniumIntake > 400 ? 'Excessive' : 'Good'}
                </p>
                <p className="text-xs text-muted-foreground">Based on intake</p>
              </div>
            </div>
          ) : (
            <p className="text-sm text-muted-foreground">Enter your selenium data to see additional insights.</p>
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
    {/* SEO & SCHEMA METADATA (HIGHLY OPTIMIZED) */}
    <meta itemProp="name" content="The Definitive Guide to Selenium Intake: RDAs, Antioxidant Role, and Deficiency Risks" />
    <meta itemProp="description" content="An in-depth, authoritative guide on the essential trace element Selenium (Se), detailing its critical function in selenoproteins like Glutathione Peroxidase, official RDAs, and the dangers of deficiency (Keshan disease) and toxicity (Selenosis)." />
    <meta itemProp="keywords" content="selenium intake calculator, selenium RDA NIH, selenium antioxidant role, selenoproteins function, Keshan disease risk, selenium toxicity symptoms, selenium sources Brazil nuts" />
    <meta itemProp="author" content="[Your Site's Health Team]" />
    <meta itemProp="datePublished" content="2025-12-02" />
    <meta itemProp="url" content="/definitive-selenium-intake-guide" />

    <h1 className="text-3xl md:text-4xl font-extrabold text-foreground mb-4" itemProp="headline">The Definitive Guide to Selenium Intake: Essential Role, RDAs, and Deficiency Risks</h1>
    <p className="text-lg italic text-gray-700">A detailed exploration of the essential trace element selenium (Se), its antioxidant and immune functions, and the required intake levels established by health authorities.</p>


    {/* TABLE OF CONTENTS (INTERNAL LINKS FOR UX AND SEO) */}
    <h2 className="text-2xl font-bold text-foreground mt-8 mb-4">Table of Contents: Jump to a Section</h2>
    <ul className="list-disc ml-6 space-y-2 text-blue-600">
        <li><a href="#function" className="hover:underline">The Core Role of Selenium: Selenoproteins and Antioxidants</a></li>
        <li><a href="#rda" className="hover:underline">Official Recommended Dietary Allowance (RDA)</a></li>
        <li><a href="#sources" className="hover:underline">Dietary Sources and Geographic Variability</a></li>
        <li><a href="#deficiency" className="hover:underline">Selenium Deficiency: Diseases and Risk Factors</a></li>
        <li><a href="#toxicity" className="hover:underline">Selenium Toxicity (Selenosis) and Upper Limit (UL)</a></li>
    </ul>
<hr />

    {/* THE CORE ROLE OF SELENIUM: SELENOPROTEINS AND ANTIOXIDANTS */}
    <h2 id="function" className="text-2xl font-bold text-foreground pt-8" itemProp="articleSection">The Core Role of Selenium: Selenoproteins and Antioxidants</h2>
    <p>Selenium (Se) is an essential trace element that is incorporated into the body's proteins in the form of **selenocysteine**, often called the "21st amino acid." The proteins that contain selenocysteine are known as **selenoproteins**, and they are responsible for mediating all of selenium's major biological functions.</p>

    <h3 className="text-xl font-semibold text-foreground mt-6">Glutathione Peroxidase (GPX) and Antioxidant Defense</h3>
    <p>The most well-known function of selenium is its role as a cofactor in the enzyme **Glutathione Peroxidase (GPX)**. GPX is a critical component of the body’s primary antioxidant defense system. It works to neutralize harmful reactive oxygen species (free radicals), particularly by converting toxic hydrogen peroxide into water. By protecting cells from oxidative stress, selenium supports the health of all tissues, including the heart and immune system.</p>
    

    <h3 className="text-xl font-semibold text-foreground mt-6">Thyroid Hormone Metabolism</h3>
    <p>Selenium is vital for regulating thyroid hormone levels. The enzyme <b>iodothyronine deiodinase</b>, a type of selenoprotein, catalyzes the conversion of the inactive thyroid hormone T4 (thyroxine) into the active hormone T3 (triiodothyronine). Therefore, selenium deficiency can impair the activation of thyroid hormones, exacerbating the effects of iodine deficiency.</p>

    <h3 className="text-xl font-semibold text-foreground mt-6">Immune and Reproductive Functions</h3>
    <p>Selenium also plays key roles in:</p>
    <ul>
        <li><b>Immune Response:</b> It enhances the proliferation of immune cells (T-cells) and the production of antibodies, contributing to a robust antiviral and antibacterial defense.</li>
        <li><b>DNA Repair:</b> Certain selenoproteins are involved in DNA repair, potentially offering protection against certain types of cancer and cellular aging.</li>
        <li><b>Reproduction:</b> Selenium is required for sperm motility and is essential for the healthy development of the fetus.</li>
    </ul>

<hr />

    {/* OFFICIAL RECOMMENDED DIETARY ALLOWANCE (RDA) */}
    <h2 id="rda" className="text-2xl font-bold text-foreground pt-8" itemProp="articleSection">Official Recommended Dietary Allowance (RDA)</h2>
    <p>The <b>National Institutes of Health (NIH)</b> and the <b>Food and Nutrition Board (FNB)</b> set the RDA for selenium based on the amount needed to maximize the activity of the major selenoprotein, Glutathione Peroxidase, in the plasma.</p>

    <h3 className="text-xl font-semibold text-foreground mt-6">Selenium RDA and Upper Limit (UL) in Micrograms (mcg) per Day</h3>
    <p>Unlike some minerals, selenium's RDA is relatively low, and the difference between the RDA and the Tolerable Upper Intake Level (UL) is narrow, highlighting the potential for toxicity at higher doses:</p>
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
                    <td className="border-b p-2">55 mcg</td>
                    <td className="border-b p-2">400 mcg</td>
                </tr>
                <tr>
                    <td className="border-b p-2">Pregnancy (all ages)</td>
                    <td className="border-b p-2">60 mcg</td>
                    <td className="border-b p-2">400 mcg</td>
                </tr>
                <tr>
                    <td className="border-b p-2">Lactation (all ages)</td>
                    <td className="border-b p-2">70 mcg</td>
                    <td className="border-b p-2">400 mcg</td>
                </tr>
                <tr>
                    <td className="border-b p-2">Children (4-8 years)</td>
                    <td className="border-b p-2">30 mcg</td>
                    <td className="border-b p-2">150 mcg</td>
                </tr>
            </tbody>
        </table>
    </div>
    <p>The UL of 400 mcg/day for adults is set primarily to prevent the signs of chronic selenium toxicity, known as selenosis.</p>

<hr />

    {/* DIETARY SOURCES AND GEOGRAPHIC VARIABILITY */}
    <h2 id="sources" className="text-2xl font-bold text-foreground pt-8" itemProp="articleSection">Dietary Sources and Geographic Variability</h2>
    <p>Unlike minerals sourced primarily from the body (e.g., calcium), the selenium content of plant foods is highly dependent on the **selenium concentration in the soil** where they were grown. This leads to vast geographic variability in dietary intake.</p>

    <h3 className="text-xl font-semibold text-foreground mt-6">Key Food Sources of Selenium</h3>
    <p>Foods sourced from selenium-rich soils provide high concentrations. Reliable sources include:</p>
    <ul>
        <li><b>Brazil Nuts:</b> Widely considered the single richest dietary source; a single Brazil nut can contain well over the adult RDA (50 to 100 mcg or more).</li>
        <li><b>Seafood:</b> Fish (tuna, cod, halibut) and shellfish are excellent and consistent sources.</li>
        <li><b>Organ Meats:</b> Kidney and liver are highly concentrated sources.</li>
        <li><b>Meat and Poultry:</b> Beef, turkey, and chicken provide significant amounts.</li>
        <li><b>Grains:</b> Cereals and bread are important sources in high-selenium regions.</li>
    </ul>

    <h3 className="text-xl font-semibold text-foreground mt-6">Risk Factors for Low Intake</h3>
    <p>Populations living in regions with **selenium-poor soils** (e.g., parts of China, Finland, and some areas of the U.S. Pacific Northwest) may have lower-than-optimal dietary intake. Furthermore, relying heavily on locally grown produce in these areas increases the risk of marginal deficiency, even in developed countries.</p>

<hr />

    {/* SELENIUM DEFICIENCY: DISEASES AND RISK FACTORS */}
    <h2 id="deficiency" className="text-2xl font-bold text-foreground pt-8" itemProp="articleSection">Selenium Deficiency: Diseases and Risk Factors</h2>
    <p>While marginal deficiency is common in certain geographic areas, severe, clinical deficiency is rare and often linked to profound health crises, primarily affecting the heart and joints.</p>

    <h3 className="text-xl font-semibold text-foreground mt-6">Endemic Deficiency Diseases</h3>
    <p>Severe deficiency is the primary cause of two distinct, endemic diseases historically found in low-selenium regions of China:</p>
    <ul>
        <li><b>Keshan Disease:</b> A cardiomyopathy (disease of the heart muscle) that causes heart enlargement, poor heart function, and ultimately, heart failure. The severity of the disease is often linked to the presence of a co-occurring viral infection, suggesting a compromised immune system due to low selenium status.</li>
        <li><b>Kashin-Beck Disease:</b> A chronic, debilitating joint and bone disease that primarily affects children and adolescents, leading to joint deformation and stunted growth.</li>
    </ul>

    <h3 className="text-xl font-semibold text-foreground mt-6">Other Deficiency Risk Groups</h3>
    <ul>
        <li><b>Patients on TPN:</b> Individuals receiving long-term intravenous feeding (TPN) without selenium supplementation are at risk.</li>
        <li><b>HIV/AIDS Patients:</b> Chronic illnesses that cause persistent oxidative stress and malabsorption often lead to lower selenium levels.</li>
        <li><b>Severe Malabsorption:</b> Conditions like Crohn's disease or chronic diarrhea can inhibit absorption.</li>
    </ul>

<hr />

    {/* SELENIUM TOXICITY (SELENOSIS) AND UPPER LIMIT (UL) */}
    <h2 id="toxicity" className="text-2xl font-bold text-foreground pt-8" itemProp="articleSection">Selenium Toxicity (Selenosis) and Upper Limit (UL)</h2>
    <p>Due to the narrow window between the RDA (55 mcg) and the UL (400 mcg), chronic excessive intake—known as **selenosis**—is a real risk, typically caused by overuse of supplements or, less commonly, consumption of extremely high-selenium foods.</p>

    <h3 className="text-xl font-semibold text-foreground mt-6">Symptoms of Selenosis</h3>
    <p>Chronic consumption of selenium above the UL can lead to:</p>
    <ul>
        <li><b>Garlic Odor (Breath/Sweat):</b> Caused by the excretion of volatile selenium compounds like dimethyl selenide. This is often the earliest sign of toxicity.</li>
        <li><b>Hair and Nail Changes:</b> Brittleness, loss of hair (alopecia), and discoloration or loss of fingernails.</li>
        <li><b>Systemic Effects:</b> Fatigue, nausea, diarrhea, and in severe cases, neurological symptoms and liver damage.</li>
    </ul>

    <h3 className="text-xl font-semibold text-foreground mt-6">Supplement Risk Management</h3>
    <p>The greatest risk for exceeding the UL comes from concentrated sources like **Brazil nuts** (which vary widely but can contain 50-100 mcg per nut) and **dietary supplements**. Consumers must be aware that taking high-dose selenium supplements (often 200 mcg or more) in combination with a selenium-rich diet can easily push daily intake into the toxic range.</p>

<hr />

    {/* CONCLUSION */}
    <h2 className="text-2xl font-bold text-foreground pt-8" itemProp="articleSection">Conclusion</h2>
    <p>Selenium is a vital trace element whose primary role is performed by **selenoproteins**, essential for powerful **antioxidant defense** (GPX) and **thyroid hormone activation**. The adult **RDA is 55 mcg/day**, an amount easily achieved through a balanced diet including seafood, meat, and nuts. While severe deficiency leads to devastating diseases like **Keshan disease**, the narrow therapeutic window means chronic intake above the **400 mcg UL** can cause toxicity (selenosis), emphasizing the need for caution with supplementation and high-dose foods like Brazil nuts.</p>
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
          <p>This tool calculates selenium intake from selenium amount, age, and gender.</p>
          <p>Outputs include selenium intake, age, gender, daily need, intake percentage, status, recommendations, an action plan, and supporting metrics.</p>
          <p>Formula, steps, guide content, related tools, and FAQs ensure humans or AI assistants can interpret the methodology instantly.</p>
        </CardContent>
      </Card>
    </div>
  );
}


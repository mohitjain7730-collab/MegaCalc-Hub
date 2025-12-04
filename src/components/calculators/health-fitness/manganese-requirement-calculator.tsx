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
  age: z.number({ invalid_type_error: 'Enter age' }).min(1).max(100),
  gender: z.enum(['male', 'female'], {
    invalid_type_error: 'Select gender',
  }),
  manganeseIntake: z.number({ invalid_type_error: 'Enter manganese intake' }).min(0).max(20),
});

type FormValues = z.infer<typeof formSchema>;

type ResultPayload = {
  age: number;
  gender: string;
  manganeseIntake: number;
  dailyNeed: number;
  intakePercent: number;
  status: 'optimal' | 'good' | 'moderate' | 'low';
  interpretation: string;
  recommendations: string[];
  plan: { label: string; detail: string }[];
};

const steps = [
  'Enter your age (years) for age-specific requirements.',
  'Select gender (male or female) for gender-specific requirements.',
  'Enter daily manganese intake (mg) from food tracking or estimate.',
  'Review daily needs, intake percentage, and recommendations.',
];

const faqs = [
  {
    question: 'What is manganese?',
    answer:
      'Manganese is an essential trace mineral that functions as a cofactor for enzymes involved in metabolism, bone formation, and antioxidant function. It is required in small amounts but is important for health.',
  },
  {
    question: 'What are manganese requirements?',
    answer:
      'Adequate intake (AI): Men 19+: 2.3 mg/day, Women 19+: 1.8 mg/day. Requirements are based on AI rather than RDA, as requirements vary. Upper limit: 11 mg/day for adults.',
  },
  {
    question: 'What are sources of manganese?',
    answer:
      'Manganese sources include whole grains, nuts, seeds, legumes, leafy vegetables, tea, and some fruits. Plant-based foods are generally good sources of manganese.',
  },
  {
    question: 'How does age affect manganese needs?',
    answer:
      'Manganese requirements are relatively stable across adulthood. Men need slightly more (2.3 mg/day) than women (1.8 mg/day). Children and adolescents have lower requirements.',
  },
  {
    question: 'What about manganese deficiency?',
    answer:
      'Manganese deficiency is rare in healthy individuals with varied diets. Symptoms may include impaired growth, skeletal abnormalities, and reproductive issues. Adequate intake from food typically prevents deficiency.',
  },
  {
    question: 'What about manganese toxicity?',
    answer:
      'Excessive manganese intake (upper limit: 11 mg/day) is rare from food but can occur from supplements or contaminated water. Symptoms include neurological issues. Upper limits should not be exceeded.',
  },
  {
    question: 'How do I get enough manganese?',
    answer:
      'Get manganese from whole grains, nuts, seeds, legumes, leafy vegetables, and tea. A varied diet with plant-based foods typically provides adequate manganese.',
  },
  {
    question: 'What about manganese absorption?',
    answer:
      'Manganese absorption is regulated by the body. High iron intake can reduce manganese absorption. Adequate intake from food sources typically ensures sufficient manganese status.',
  },
  {
    question: 'Can I track manganese at home?',
    answer:
      'Yes. Use food databases to estimate manganese intake. Many tracking apps include manganese content. Focus on whole grains, nuts, seeds, and legumes for manganese sources.',
  },
  {
    question: 'When should I consult a healthcare provider?',
    answer:
      'Consult a healthcare provider if you have manganese deficiency concerns, are considering manganese supplements, have neurological symptoms, or need personalized guidance on manganese intake.',
  },
];

const relatedCalculators = [
  {
    name: 'Selenium Intake Calculator',
    slug: 'selenium-intake-calculator',
    description: 'Assess selenium alongside manganese.',
  },
  {
    name: 'Copper Intake Calculator',
    slug: 'copper-intake-calculator',
    description: 'Evaluate trace minerals comprehensively.',
  },
  {
    name: 'Chromium Daily Need Estimator',
    slug: 'chromium-daily-need-estimator',
    description: 'Assess chromium alongside manganese.',
  },
  {
    name: 'Nutrient Density to Calorie Ratio Calculator',
    slug: 'nutrient-density-to-calorie-ratio-calculator',
    description: 'Assess nutritional quality comprehensively.',
  },
];

const baseUrl = 'https://mycalculating.com/category/health-fitness/manganese-requirement-calculator';

const schemaMarkup = {
  '@context': 'https://schema.org',
  '@graph': [
    {
      '@type': 'BreadcrumbList',
      itemListElement: [
        { '@type': 'ListItem', position: 1, name: 'Home', item: 'https://mycalculating.com' },
        { '@type': 'ListItem', position: 2, name: 'Health & Fitness', item: 'https://mycalculating.com/category/health-fitness' },
        { '@type': 'ListItem', position: 3, name: 'Manganese Requirement Calculator', item: baseUrl },
      ],
    },
    {
      '@type': 'SoftwareApplication',
      name: 'Manganese Requirement Calculator',
      applicationCategory: 'Calculator',
      operatingSystem: 'Web Browser',
      description: 'Calculate manganese requirements from age, gender, and manganese intake.',
      url: baseUrl,
      offers: { '@type': 'Offer', price: '0', priceCurrency: 'USD' },
    },
  ],
};

const clamp = (value: number, min: number, max: number) => Math.min(max, Math.max(min, value));

const calculateResult = (values: FormValues): ResultPayload => {
  const age = values.age;
  const gender = values.gender;
  const manganeseIntake = values.manganeseIntake;
  
  // Estimate daily need based on age and gender
  let dailyNeed = 1.8; // Default for women
  
  if (gender === 'male') {
    if (age >= 19) {
      dailyNeed = 2.3; // Men 19+
    } else if (age >= 14) {
      dailyNeed = 2.2; // Boys 14-18
    } else if (age >= 9) {
      dailyNeed = 1.9; // Boys 9-13
    } else {
      dailyNeed = 1.5; // Boys 4-8
    }
  } else {
    // Female
    if (age >= 19) {
      dailyNeed = 1.8; // Women 19+
    } else if (age >= 14) {
      dailyNeed = 1.6; // Girls 14-18
    } else if (age >= 9) {
      dailyNeed = 1.6; // Girls 9-13
    } else {
      dailyNeed = 1.2; // Girls 4-8
    }
  }
  
  const intakePercent = dailyNeed > 0 ? (manganeseIntake / dailyNeed) * 100 : 0;
  
  let status: ResultPayload['status'] = 'optimal';
  let interpretation = 'Your manganese intake appears adequate. Continue maintaining balanced intake from diverse sources.';

  if (manganeseIntake < dailyNeed * 0.7 || intakePercent < 70) {
    status = 'low';
    interpretation = 'Your manganese intake is below recommended levels. This may increase deficiency risk. Consider increasing intake from whole grains, nuts, seeds, and legumes to meet daily needs.';
  } else if (manganeseIntake < dailyNeed * 0.9 || intakePercent < 90) {
    status = 'moderate';
    interpretation = 'Your manganese intake is slightly below recommended levels. Aim for recommended daily intake to ensure adequate manganese status and prevent deficiency.';
  } else if (manganeseIntake > 11) {
    status = 'low';
    interpretation = 'Your manganese intake exceeds the upper limit (11 mg/day). Excessive intake can cause toxicity. Reduce intake, especially if from supplements.';
  } else if (intakePercent >= 100 && intakePercent <= 200) {
    status = 'optimal';
    interpretation = 'Your manganese intake is within recommended range. Continue maintaining balanced intake from diverse sources to support optimal manganese status.';
  } else {
    status = 'good';
    interpretation = 'Your manganese intake is good. Continue including manganese-rich foods in your diet to maintain adequate intake and support metabolism and bone health.';
  }

  const recommendations = [
    'Include manganese-rich foods: consume whole grains, nuts, seeds, legumes, leafy vegetables, and tea to meet recommended daily intake.',
    `Aim for recommended intake: ${dailyNeed.toFixed(1)} mg/day for your age and gender. This supports metabolism, bone formation, and antioxidant function.`,
    'Maintain diverse sources: variety in manganese sources helps ensure adequate intake and prevents both deficiency and excess, supporting optimal manganese status.',
  ];
  if (status === 'low' && manganeseIntake < dailyNeed * 0.9) {
    recommendations.push('Increase manganese intake through food sources. Include whole grains, nuts, seeds, and legumes to meet recommended levels and support health.');
  }
  if (manganeseIntake > 11) {
    recommendations.push('Reduce manganese intake. Excessive intake (upper limit: 11 mg/day) can cause toxicity. If from supplements, consult healthcare provider. Food sources are generally safer.');
  }
  if (manganeseIntake < dailyNeed * 0.8) {
    recommendations.push(`Significantly increase manganese intake. Current intake is below recommended levels (${dailyNeed.toFixed(1)} mg/day). Focus on whole grains, nuts, and seeds.`);
  }

  const plan = [
    { label: 'This Week', detail: `Calculate manganese intake and compare to daily needs (${dailyNeed.toFixed(1)} mg/day). Assess current intake and identify opportunities to meet recommended levels.` },
    { label: 'This Month', detail: 'Optimize manganese intake: include whole grains, nuts, seeds, and legumes to ensure adequate intake while avoiding excess.' },
    { label: 'Ongoing', detail: 'Monitor manganese intake through regular food assessment. Maintain recommended intake levels to prevent deficiency and support optimal health.' },
  ];

  return { age, gender, manganeseIntake, dailyNeed, intakePercent, status, interpretation, recommendations, plan };
};

export default function ManganeseRequirementCalculator() {
  const [result, setResult] = useState<ResultPayload | null>(null);

  const form = useForm<FormValues>({
    resolver: zodResolver(formSchema),
    defaultValues: {
      age: undefined,
      gender: undefined,
      manganeseIntake: undefined,
    },
  });

  return (
    <div className="space-y-8">
      <Script id="manganese-requirement-schema" type="application/ld+json" strategy="afterInteractive" dangerouslySetInnerHTML={{ __html: JSON.stringify(schemaMarkup) }} />

      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <Activity className="h-5 w-5" />
            Manganese Requirement Calculator
          </CardTitle>
          <CardDescription>Calculate manganese requirements from age, gender, and manganese intake.</CardDescription>
        </CardHeader>
      </Card>

      <Card>
        <CardHeader>
          <CardTitle>Input your manganese data</CardTitle>
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
                <FormField
                  control={form.control}
                  name="manganeseIntake"
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel>Manganese intake (mg)</FormLabel>
                      <FormControl>
                        <Input type="number" step="0.1" placeholder="e.g., 2.0" value={field.value ?? ''} onChange={(e) => field.onChange(e.target.value === '' ? undefined : Number(e.target.value))} />
                      </FormControl>
                      <FormMessage />
                    </FormItem>
                  )}
                />
              </div>
              <Button type="submit" className="w-full md:w-auto">
                Calculate requirements
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
                <p className="text-2xl font-semibold text-primary">{result.dailyNeed.toFixed(1)}</p>
                <p className="text-xs text-muted-foreground">mg/day</p>
              </div>
              <div className="p-4 border rounded">
                <p className="text-sm text-muted-foreground">Current intake</p>
                <p className="text-2xl font-semibold text-primary">{result.manganeseIntake.toFixed(1)}</p>
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
            <strong>Daily need</strong> = estimated from age and gender. Men 19+: 2.3 mg/day, Women 19+: 1.8 mg/day. Requirements are based on adequate intake (AI).
          </p>
          <p>
            <strong>Intake percentage</strong> = (manganese intake / daily need) × 100. Values ≥100% indicate adequate intake relative to recommendations.
          </p>
          <p>
            <strong>Recommended intake</strong>: Men 19+: 2.3 mg/day, Women 19+: 1.8 mg/day. Upper limit: 11 mg/day for adults.
          </p>
          <p>Manganese is an essential trace mineral required in small amounts. Adequate intake supports metabolism, bone formation, and antioxidant function. Both deficiency and excess should be avoided.</p>
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
                  {result.manganeseIntake >= result.dailyNeed ? '+' : ''}{(result.manganeseIntake - result.dailyNeed).toFixed(1)} mg
                </p>
                <p className="text-xs text-muted-foreground">Difference from need</p>
              </div>
              <div className="p-4 border rounded">
                <p className="text-sm text-muted-foreground">Upper limit</p>
                <p className="text-xl font-semibold text-primary">11 mg</p>
                <p className="text-xs text-muted-foreground">Maximum safe intake</p>
              </div>
              <div className="p-4 border rounded">
                <p className="text-sm text-muted-foreground">Intake status</p>
                <p className="text-xl font-semibold text-primary">
                  {result.intakePercent >= 100 && result.manganeseIntake <= 11 ? 'Adequate' : result.intakePercent < 80 ? 'Low' : result.manganeseIntake > 11 ? 'Excessive' : 'Good'}
                </p>
                <p className="text-xs text-muted-foreground">Based on intake</p>
              </div>
            </div>
          ) : (
            <p className="text-sm text-muted-foreground">Enter your manganese data to see additional insights.</p>
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
    <meta itemProp="name" content="The Definitive Guide to Manganese: Daily Requirements, Role in Metabolism, and Toxicity" />
    <meta itemProp="description" content="An in-depth, authoritative guide on the essential trace mineral Manganese (Mn), detailing its function as an enzyme cofactor, official Adequate Intake (AI) levels, and the risks of deficiency and neurological toxicity (Manganism)." />
    <meta itemProp="keywords" content="manganese requirement calculator, manganese Adequate Intake AI, manganese role in metabolism, manganese superoxide dismutase, manganese deficiency symptoms, Manganism toxicity, manganese sources tea" />
    <meta itemProp="author" content="[Your Site's Health Team]" />
    <meta itemProp="datePublished" content="2025-12-01" />
    <meta itemProp="url" content="/definitive-manganese-requirement-guide" />

    <h1 className="text-3xl md:text-4xl font-extrabold text-foreground mb-4" itemProp="headline">The Definitive Guide to Manganese: Daily Requirements, Function, and Toxicity Risk</h1>
    <p className="text-lg italic text-gray-700">A detailed look at the essential trace mineral manganese (Mn), its critical role as an enzyme cofactor, and the necessary intake to avoid deficiency or neurological harm.</p>


    {/* TABLE OF CONTENTS (INTERNAL LINKS FOR UX AND SEO) */}
    <h2 className="text-2xl font-bold text-foreground mt-8 mb-4">Table of Contents: Jump to a Section</h2>
    <ul className="list-disc ml-6 space-y-2 text-blue-600">
        <li><a href="#function" className="hover:underline">The Essential Role of Manganese as an Enzyme Cofactor</a></li>
        <li><a href="#ai" className="hover:underline">Official Adequate Intake (AI) Levels</a></li>
        <li><a href="#sources" className="hover:underline">Dietary Sources and Bioavailability</a></li>
        <li><a href="#deficiency" className="hover:underline">Manganese Deficiency: Symptoms and Risk</a></li>
        <li><a href="#toxicity" className="hover:underline">Manganese Toxicity: Neurological Risk (Manganism)</a></li>
    </ul>
<hr />

    {/* THE ESSENTIAL ROLE OF MANGANESE AS AN ENZYME COFACTOR */}
    <h2 id="function" className="text-2xl font-bold text-foreground pt-8" itemProp="articleSection">The Essential Role of Manganese as an Enzyme Cofactor</h2>
    <p>Manganese (Mn) is a vital trace element that is not synthesized by the body and must be obtained through diet. Its primary function is to serve as an <b>essential cofactor</b>, meaning it is required by various enzymes to catalyze crucial metabolic reactions.</p>

    <h3 className="text-xl font-semibold text-foreground mt-6">Antioxidant Defense (Mn-SOD)</h3>
    <p>One of the most important roles of manganese is its function as a central component of the enzyme **Manganese Superoxide Dismutase (Mn-SOD)**. This enzyme is primarily found in the mitochondria (the cell's powerhouses) and is the most powerful antioxidant defense mechanism against highly reactive oxygen species (free radicals) generated during energy production (oxidative phosphorylation). Mn-SOD converts the superoxide radical into less damaging compounds, thereby protecting cellular integrity.</p>
    

    <h3 className="text-xl font-semibold text-foreground mt-6">Metabolism and Bone Formation</h3>
    <p>Manganese-dependent enzymes are also central to the metabolism of all three macronutrients and the development of connective tissue:</p>
    <ul>
        <li><b>Carbohydrate Metabolism:</b> Manganese is required for <b>pyruvate carboxylase</b>, an enzyme critical in gluconeogenesis (the creation of glucose from non-carbohydrate sources), which is essential for maintaining stable blood sugar.</li>
        <li><b>Amino Acid Metabolism:</b> It is a cofactor for <b>arginase</b>, which is necessary for the proper functioning of the urea cycle, removing toxic ammonia from the body.</li>
        <li><b>Bone and Cartilage:</b> Manganese is essential for enzymes involved in the formation of **cartilage and bone matrix**. A deficiency can lead to improper bone growth and density.</li>
    </ul>

<hr />

    {/* OFFICIAL ADEQUATE INTAKE (AI) LEVELS */}
    <h2 id="ai" className="text-2xl font-bold text-foreground pt-8" itemProp="articleSection">Official Adequate Intake (AI) Levels</h2>
    <p>The <b>Food and Nutrition Board (FNB)</b> of the <b>National Academies of Sciences, Engineering, and Medicine (NASEM)</b> established **Adequate Intake (AI)** levels for manganese, rather than a Recommended Dietary Allowance (RDA). This is due to insufficient data to establish an Estimated Average Requirement (EAR).</p>

    <h3 className="text-xl font-semibold text-foreground mt-6">Manganese AI and Upper Limit (UL) in Milligrams (mg) per Day</h3>
    <p>The AI is set based on observed average manganese intake in healthy populations. The Upper Limit (UL) is based on the prevention of neurological effects (Manganism) observed from chronic high intake:</p>
    <div className="overflow-x-auto my-6 p-4 bg-gray-50 border rounded-lg">
        <table className="w-full text-left border-collapse">
            <thead>
                <tr>
                    <th className="border-b p-2 font-bold">Life Stage Group</th>
                    <th className="border-b p-2 font-bold">AI (mg/day)</th>
                    <th className="border-b p-2 font-bold">UL (mg/day)</th>
                </tr>
            </thead>
            <tbody>
                <tr>
                    <td className="border-b p-2">Adult Men (19+ years)</td>
                    <td className="border-b p-2">2.3 mg</td>
                    <td className="border-b p-2">11 mg</td>
                </tr>
                <tr>
                    <td className="border-b p-2">Adult Women (19+ years)</td>
                    <td className="border-b p-2">1.8 mg</td>
                    <td className="border-b p-2">11 mg</td>
                </tr>
                <tr>
                    <td className="border-b p-2">Pregnancy (all ages)</td>
                    <td className="border-b p-2">2.0 mg</td>
                    <td className="border-b p-2">11 mg</td>
                </tr>
                <tr>
                    <td className="border-b p-2">Lactation (all ages)</td>
                    <td className="border-b p-2">2.6 mg</td>
                    <td className="border-b p-2">11 mg</td>
                </tr>
            </tbody>
        </table>
    </div>

<hr />

    {/* DIETARY SOURCES AND BIOAVAILABILITY */}
    <h2 id="sources" className="text-2xl font-bold text-foreground pt-8" itemProp="articleSection">Dietary Sources and Bioavailability</h2>
    <p>Manganese intake varies widely based on dietary habits, as the mineral is concentrated in plant-based foods, particularly those with high fiber content. The absorption rate is relatively low and tightly regulated.</p>

    <h3 className="text-xl font-semibold text-foreground mt-6">Key Food Sources of Manganese</h3>
    <p>The highest dietary concentrations of manganese are found in:</p>
    <ul>
        <li><b>Whole Grains:</b> Brown rice, oatmeal, and whole-wheat bread.</li>
        <li><b>Nuts and Seeds:</b> Pecans, almonds, hazelnuts, and macadamia nuts.</li>
        <li><b>Legumes:</b> Lentils and chickpeas.</li>
        <li><b>Beverages:</b> **Tea** (black and green) is a surprisingly rich source, as manganese is readily absorbed from tea leaves into the hot water.</li>
        <li><b>Spices:</b> Ground cloves, turmeric, and cardamom.</li>
    </ul>

    <h3 className="text-xl font-semibold text-foreground mt-6">Absorption and Interactions</h3>
    <p>Manganese absorption in the gut is generally poor, typically ranging from 3% to 10% of intake, and decreases as intake increases. Absorption is competitively inhibited by other divalent cations:</p>
    <ul>
        <li><b>Iron:</b> High-dose iron supplementation can decrease manganese absorption, and vice versa.</li>
        <li><b>Calcium and Phosphorus:</b> High intake of these minerals may also slightly reduce manganese absorption.</li>
    </ul>
    <p>Infants often have higher absorption rates, which, combined with underdeveloped excretion mechanisms, puts them at a greater risk of toxicity from highly concentrated formula.</p>

<hr />

    {/* MANGANESE DEFICIENCY: SYMPTOMS AND RISK */}
    <h2 id="deficiency" className="text-2xl font-bold text-foreground pt-8" itemProp="articleSection">Manganese Deficiency: Symptoms and Risk</h2>
    <p>Clinical manganese deficiency is extremely rare in humans, as the body maintains tightly controlled homeostatic mechanisms and the mineral is widely distributed in plant foods. Most cases of deficiency have been experimentally induced or occurred in highly restrictive clinical settings.</p>

    <h3 className="text-xl font-semibold text-foreground mt-6">Observed Clinical Symptoms</h3>
    <p>Symptoms observed in controlled or clinical deficiency cases include:</p>
    <ul>
        <li><b>Impaired Growth:</b> Seen in experimental deficiency in young children.</li>
        <li><b>Dermatological Issues:</b> A transient skin rash and discoloration.</li>
        <li><b>Biochemical Changes:</b> Low levels of serum cholesterol and altered carbohydrate metabolism.</li>
        <li><b>Impaired Fertility:</b> Due to disrupted hormone production.</li>
    </ul>

    <h3 className="text-xl font-semibold text-foreground mt-6">High-Risk Groups</h3>
    <p>While general risk is low, individuals who rely on **Total Parenteral Nutrition (TPN)** that lacks manganese, or those consuming diets severely limited in whole grains, nuts, and vegetables, may be at risk for marginal deficiency.</p>

<hr />

    {/* MANGANESE TOXICITY: NEUROLOGICAL RISK (MANGANISM) */}
    <h2 id="toxicity" className="text-2xl font-bold text-foreground pt-8" itemProp="articleSection">Manganese Toxicity: Neurological Risk (Manganism)</h2>
    <p>Manganese toxicity is a much greater concern than deficiency. The body is highly efficient at regulating manganese through excretion in the bile, but exposure to excessive amounts—especially inhalation—can overwhelm these mechanisms, leading to severe, irreversible neurological damage.</p>

    <h3 className="text-xl font-semibold text-foreground mt-6">Manganism: Occupational Exposure</h3>
    <p>The most common and dangerous form of toxicity is **Manganism**, which is typically seen in occupational settings, such as welders, miners, and smelters who inhale high concentrations of manganese dust over long periods. Inhaled manganese bypasses the tight regulatory control of the digestive system and is transported directly to the brain.</p>

    <h3 className="text-xl font-semibold text-foreground mt-6">Symptoms of Manganism</h3>
    <p>Manganism leads to a syndrome with symptoms closely mimicking **Parkinson's disease** and other neurodegenerative disorders:</p>
    <ul>
        <li><b>Psychiatric Symptoms:</b> Irritability, aggression, and psychotic behavior (sometimes termed "manganese madness").</li>
        <li><b>Movement Disorders:</b> Tremors, muscle rigidity, slow movements (bradykinesia), and difficulty walking (ataxia).</li>
    </ul>

    <h3 className="text-xl font-semibold text-foreground mt-6">Non-Occupational Toxicity Risk</h3>
    <p>Toxicity from dietary or water sources is rare but can occur in two primary situations:</p>
    <ul>
        <li><b>Contaminated Well Water:</b> Chronic consumption of well water with very high, unregulated manganese concentrations.</li>
        <li><b>Liver Dysfunction:</b> Since manganese is excreted primarily via bile, individuals with chronic liver disease (cirrhosis) have impaired excretion and are at a significantly higher risk of accumulating manganese in the brain.</li>
    </ul>

<hr />

    {/* CONCLUSION */}
    <h2 className="text-2xl font-bold text-foreground pt-8" itemProp="articleSection">Conclusion</h2>
    <p>Manganese is an essential trace element crucial for **antioxidant defense (Mn-SOD)**, bone health, and metabolic function, with an **Adequate Intake (AI)** for adults set at 1.8 to 2.3 mg/day. While deficiency is uncommon, toxicity poses a significant neurological risk, particularly from occupational inhalation exposure, leading to **Manganism**. Consumption of a diverse diet rich in whole grains and nuts generally ensures adequate intake, while adherence to the **11 mg/day Upper Limit** is critical for preventing adverse health effects.</p>
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
          <p>This tool calculates manganese requirements from age, gender, and manganese intake.</p>
          <p>Outputs include age, gender, manganese intake, daily need, intake percentage, status, recommendations, an action plan, and supporting metrics.</p>
          <p>Formula, steps, guide content, related tools, and FAQs ensure humans or AI assistants can interpret the methodology instantly.</p>
        </CardContent>
      </Card>
    </div>
  );
}


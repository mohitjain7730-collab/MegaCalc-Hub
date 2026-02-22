'use client';

import { useState } from 'react';
import Script from 'next/script';
import Link from 'next/link';
import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import { z } from 'zod';
import { Heart, Zap, Target, Activity, Shield } from 'lucide-react';

import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Form, FormControl, FormField, FormItem, FormLabel, FormMessage } from '@/components/ui/form';
import { Input } from '@/components/ui/input';

const formSchema = z.object({
  age: z.number({ invalid_type_error: 'Enter age' }).min(1).max(100),
  gender: z.enum(['male', 'female'], {
    invalid_type_error: 'Select gender',
  }),
  vitaminKIntake: z.number({ invalid_type_error: 'Enter vitamin K intake' }).min(0).max(1000),
  isPregnant: z.boolean().optional(),
});

type FormValues = z.infer<typeof formSchema>;

type ResultPayload = {
  age: number;
  gender: string;
  vitaminKIntake: number;
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
  'Enter daily vitamin K intake (mcg) from food tracking or estimate.',
  'Review daily needs estimate, intake percentage, and recommendations.',
];

const faqs = [
  {
    question: 'What is vitamin K?',
    answer:
      'Vitamin K is a fat-soluble vitamin essential for blood clotting and bone health. It exists in two main forms: K1 (phylloquinone) from plants and K2 (menaquinone) from animal sources and fermented foods.',
  },
  {
    question: 'What are vitamin K requirements?',
    answer:
      'Recommended daily intake: Men 19+: 120 mcg, Women 19+: 90 mcg. Requirements are based on adequate intake (AI) rather than RDA, as requirements vary and deficiency is rare.',
  },
  {
    question: 'What are sources of vitamin K?',
    answer:
      'Vitamin K1 sources include leafy greens (spinach, kale, broccoli), vegetable oils, and some fruits. Vitamin K2 sources include fermented foods, animal products, and some cheeses.',
  },
  {
    question: 'How does age affect vitamin K needs?',
    answer:
      'Vitamin K needs are relatively stable across adulthood. Children and adolescents have lower requirements. Older adults may have similar or slightly higher needs, but requirements don\'t change dramatically with age.',
  },
  {
    question: 'How does gender affect vitamin K needs?',
    answer:
      'Men typically need more vitamin K (120 mcg/day) than women (90 mcg/day) due to larger body size. Pregnant and lactating women may have similar or slightly higher needs.',
  },
  {
    question: 'What about vitamin K deficiency?',
    answer:
      'Vitamin K deficiency is rare in healthy adults but can cause bleeding problems. Newborns are at higher risk. Adequate intake from food sources typically prevents deficiency.',
  },
  {
    question: 'What about vitamin K and blood thinners?',
    answer:
      'Vitamin K can interfere with blood-thinning medications (warfarin). People on these medications should maintain consistent vitamin K intake and work with healthcare providers to manage intake.',
  },
  {
    question: 'How do I get enough vitamin K?',
    answer:
      'Get vitamin K from leafy green vegetables (spinach, kale, broccoli), vegetable oils, and fermented foods. A varied diet with vegetables typically provides adequate vitamin K.',
  },
  {
    question: 'Can I track vitamin K at home?',
    answer:
      'Yes. Use food databases to estimate vitamin K intake. Many tracking apps include vitamin K content. Focus on consistent intake if on blood-thinning medications.',
  },
  {
    question: 'When should I consult a healthcare provider?',
    answer:
      'Consult a healthcare provider if you\'re on blood-thinning medications, have bleeding concerns, or need personalized guidance on vitamin K intake for your health situation.',
  },
];

const relatedCalculators = [
  {
    name: 'Vitamin A Retinol Equivalent Calculator',
    slug: 'vitamin-a-retinol-equivalent-calculator',
    description: 'Assess vitamin A alongside vitamin K.',
  },
  {
    name: 'Vitamin E Alpha-Tocopherol Calculator',
    slug: 'vitamin-e-alpha-tocopherol-calculator',
    description: 'Evaluate fat-soluble vitamins comprehensively.',
  },
  {
    name: 'Iodine Deficiency Risk Calculator',
    slug: 'iodine-deficiency-risk-calculator',
    description: 'Assess micronutrient status comprehensively.',
  },
  {
    name: 'Nutrient Density to Calorie Ratio Calculator',
    slug: 'nutrient-density-to-calorie-ratio-calculator',
    description: 'Assess nutritional quality comprehensively.',
  },
];

const baseUrl = 'https://mycalculating.com/health-fitness/vitamin-k-daily-needs-estimator';

const schemaMarkup = {
  '@context': 'https://schema.org',
  '@graph': [
    {
      '@type': 'BreadcrumbList',
      itemListElement: [
        { '@type': 'ListItem', position: 1, name: 'Home', item: 'https://mycalculating.com' },
        { '@type': 'ListItem', position: 2, name: 'Health & Fitness', item: 'https://mycalculating.com/health-fitness' },
        { '@type': 'ListItem', position: 3, name: 'Vitamin K Daily Needs Estimator', item: baseUrl },
      ],
    },
    {
      '@type': 'SoftwareApplication',
      name: 'Vitamin K Daily Needs Estimator',
      applicationCategory: 'Calculator',
      operatingSystem: 'Web Browser',
      description: 'Estimate vitamin K daily needs from age, gender, vitamin K intake, and pregnancy status.',
      url: baseUrl,
      offers: { '@type': 'Offer', price: '0', priceCurrency: 'USD' },
    },
  ],
};

const clamp = (value: number, min: number, max: number) => Math.min(max, Math.max(min, value));

const calculateResult = (values: FormValues): ResultPayload => {
  const age = values.age;
  const gender = values.gender;
  const vitaminKIntake = values.vitaminKIntake;
  const isPregnant = values.isPregnant || false;
  
  // Estimate daily need based on age and gender
  let dailyNeed = 90; // Default for women
  
  if (gender === 'male') {
    if (age >= 19) {
      dailyNeed = 120; // Men 19+
    } else if (age >= 14) {
      dailyNeed = 75; // Boys 14-18
    } else if (age >= 9) {
      dailyNeed = 60; // Boys 9-13
    } else {
      dailyNeed = 55; // Boys 4-8
    }
  } else {
    // Female
    if (isPregnant) {
      dailyNeed = 90; // Pregnant women
    } else if (age >= 19) {
      dailyNeed = 90; // Women 19+
    } else if (age >= 14) {
      dailyNeed = 75; // Girls 14-18
    } else if (age >= 9) {
      dailyNeed = 60; // Girls 9-13
    } else {
      dailyNeed = 55; // Girls 4-8
    }
  }
  
  const intakePercent = dailyNeed > 0 ? (vitaminKIntake / dailyNeed) * 100 : 0;
  
  let status: ResultPayload['status'] = 'optimal';
  let interpretation = 'Your vitamin K intake appears adequate. Continue maintaining balanced intake from diverse sources.';

  if (vitaminKIntake < dailyNeed * 0.7 || intakePercent < 70) {
    status = 'low';
    interpretation = 'Your vitamin K intake is below recommended levels. This may increase deficiency risk. Consider increasing intake from leafy greens, vegetable oils, and fermented foods to meet daily needs.';
  } else if (vitaminKIntake < dailyNeed * 0.9 || intakePercent < 90) {
    status = 'moderate';
    interpretation = 'Your vitamin K intake is slightly below recommended levels. Aim for recommended daily intake to ensure adequate vitamin K status and prevent deficiency.';
  } else if (intakePercent >= 100 && intakePercent <= 200) {
    status = 'optimal';
    interpretation = 'Your vitamin K intake is within recommended range. Continue maintaining balanced intake from diverse sources to support optimal vitamin K status and health.';
  } else {
    status = 'good';
    interpretation = 'Your vitamin K intake is good. Continue including vitamin K-rich foods in your diet to maintain adequate intake and support blood clotting and bone health.';
  }

  const recommendations = [
    'Include vitamin K-rich foods: consume leafy green vegetables (spinach, kale, broccoli), vegetable oils, and fermented foods to meet recommended daily intake.',
    `Aim for recommended intake: ${dailyNeed} mcg/day for your age and gender. This supports blood clotting function and bone health.`,
    'Maintain consistent intake if on blood-thinning medications: vitamin K can interfere with warfarin. Work with healthcare provider to manage consistent vitamin K intake.',
  ];
  if (status === 'low' || status === 'moderate') {
    recommendations.push('Increase vitamin K intake through food sources. Include more leafy greens, vegetable oils, and fermented foods to meet recommended daily needs and prevent deficiency.');
  }
  if (vitaminKIntake < dailyNeed * 0.8) {
    recommendations.push(`Significantly increase vitamin K intake. Current intake is below recommended levels (${dailyNeed} mcg/day). Focus on leafy green vegetables and other vitamin K-rich foods.`);
  }

  const plan = [
    { label: 'This Week', detail: `Calculate vitamin K intake and compare to daily needs (${dailyNeed} mcg/day). Assess current intake and identify opportunities to meet recommended levels.` },
    { label: 'This Month', detail: 'Optimize vitamin K intake: include leafy greens, vegetable oils, and fermented foods to ensure adequate intake and support blood clotting and bone health.' },
    { label: 'Ongoing', detail: 'Monitor vitamin K intake through regular food assessment. Maintain recommended intake levels to prevent deficiency and support optimal health.' },
  ];

  return { age, gender, vitaminKIntake, dailyNeed, intakePercent, status, interpretation, recommendations, plan };
};

export default function VitaminKDailyNeedsEstimator() {
  const [result, setResult] = useState<ResultPayload | null>(null);

  const form = useForm<FormValues>({
    resolver: zodResolver(formSchema),
    defaultValues: {
      age: undefined,
      gender: undefined,
      vitaminKIntake: undefined,
      isPregnant: undefined,
    },
  });

  return (
    <div className="space-y-8">
      <Script id="vitamin-k-needs-schema" type="application/ld+json" strategy="afterInteractive" dangerouslySetInnerHTML={{ __html: JSON.stringify(schemaMarkup) }} />

      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <Heart className="h-5 w-5" />
            Vitamin K Daily Needs Estimator
          </CardTitle>
          <CardDescription>Estimate vitamin K daily needs from age, gender, vitamin K intake, and pregnancy status.</CardDescription>
        </CardHeader>
      </Card>

      <Card>
        <CardHeader>
          <CardTitle>Input your vitamin K data</CardTitle>
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
                  name="vitaminKIntake"
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel>Vitamin K intake (mcg)</FormLabel>
                      <FormControl>
                        <Input type="number" step="1" placeholder="e.g., 90" value={field.value ?? ''} onChange={(e) => field.onChange(e.target.value === '' ? undefined : Number(e.target.value))} />
                      </FormControl>
                      <FormMessage />
                    </FormItem>
                  )}
                />
                <FormField
                  control={form.control}
                  name="isPregnant"
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
                      <FormLabel className="!mt-0">Pregnant</FormLabel>
                      <FormMessage />
                    </FormItem>
                  )}
                />
              </div>
              <Button type="submit" className="w-full md:w-auto">
                Estimate daily needs
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
            <CardDescription>See daily needs estimate, intake percentage, and recommendations.</CardDescription>
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
                <p className="text-2xl font-semibold text-primary">{result.vitaminKIntake.toFixed(0)}</p>
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
          <p>
            <strong>Daily need</strong> = estimated from age and gender. Men 19+: 120 mcg/day, Women 19+: 90 mcg/day. Children and adolescents have lower requirements.
          </p>
          <p>
            <strong>Intake percentage</strong> = (vitamin K intake / daily need) Ã— 100. Values â‰¥100% indicate adequate intake relative to recommendations.
          </p>
          <p>
            <strong>Recommended intake</strong>: Men 19+: 120 mcg/day, Women 19+: 90 mcg/day. Requirements are based on adequate intake (AI) rather than RDA, as requirements vary.
          </p>
          <p>Vitamin K requirements are relatively stable across adulthood. Adequate intake supports blood clotting function and bone health. Deficiency is rare in healthy adults with varied diets.</p>
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
                  {result.vitaminKIntake >= result.dailyNeed ? '+' : ''}{(result.vitaminKIntake - result.dailyNeed).toFixed(0)} mcg
                </p>
                <p className="text-xs text-muted-foreground">Difference from need</p>
              </div>
              <div className="p-4 border rounded">
                <p className="text-sm text-muted-foreground">Intake status</p>
                <p className="text-xl font-semibold text-primary">
                  {result.intakePercent >= 100 ? 'Adequate' : result.intakePercent >= 80 ? 'Near adequate' : result.intakePercent >= 60 ? 'Moderate' : 'Low'}
                </p>
                <p className="text-xs text-muted-foreground">Based on percentage</p>
              </div>
              <div className="p-4 border rounded">
                <p className="text-sm text-muted-foreground">Target intake</p>
                <p className="text-xl font-semibold text-primary">{result.dailyNeed.toFixed(0)} mcg</p>
                <p className="text-xs text-muted-foreground">Recommended daily</p>
              </div>
            </div>
          ) : (
            <p className="text-sm text-muted-foreground">Enter your vitamin K data to see additional insights.</p>
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
    {/* SEO & SCHEMA METADATA (HIGHLY OPTIMIZED) */}
    <meta itemProp="name" content="The Definitive Guide to Vitamin K: RDAs, Blood Clotting, and Bone Health" />
    <meta itemProp="description" content="An in-depth guide on the essential fat-soluble Vitamin K (K1, K2), detailing its critical function in synthesizing blood coagulation and bone proteins, official Adequate Intake (AI) levels, and the serious risk of deficiency in newborns (VKDB)." />
    <meta itemProp="keywords" content="vitamin k daily needs, vitamin k RDA NIH, vitamin k function blood clotting, vitamin K1 vs K2, vitamin K deficiency bleeding VKDB, vitamin k bone health, coumadin interaction" />
    <meta itemProp="author" content="[Your Site's Health Team]" />
    <meta itemProp="datePublished" content="2025-12-02" />
    <meta itemProp="url" content="/definitive-vitamin-k-daily-needs-guide" />

    <h1 className="text-3xl md:text-4xl font-extrabold text-foreground mb-4" itemProp="headline">The Definitive Guide to Vitamin K: Daily Needs, Blood Clotting, and Bone Health</h1>
    <p className="text-lg italic text-gray-700">A detailed look at the essential fat-soluble vitamin K, its forms (K1 and K2), and the critical intake required for coagulation and skeletal health.</p>


    {/* TABLE OF CONTENTS (INTERNAL LINKS FOR UX AND SEO) */}
    <h2 className="text-2xl font-bold text-foreground mt-8 mb-4">Table of Contents: Jump to a Section</h2>
    <ul className="list-disc ml-6 space-y-2 text-blue-600">
        <li><a href="#function" className="hover:underline">Vitamin K's Core Function: The Carboxylation Cycle</a></li>
        <li><a href="#forms" className="hover:underline">Forms of Vitamin K: K1 (Phylloquinone) and K2 (Menaquinones)</a></li>
        <li><a href="#ai" className="hover:underline">Official Adequate Intake (AI) Levels</a></li>
        <li><a href="#deficiency" className="hover:underline">Vitamin K Deficiency Bleeding (VKDB) in Newborns</a></li>
        <li><a href="#sources" className="hover:underline">Dietary Sources and Absorption</a></li>
        <li><a href="#interactions" className="hover:underline">Drug Interactions (Warfarin) and Safety</a></li>
    </ul>
<hr />

    {/* VITAMIN K'S CORE FUNCTION: THE CARBOXYLATION CYCLE */}
    <h2 id="function" className="text-2xl font-bold text-foreground pt-8" itemProp="articleSection">Vitamin K's Core Function: The Carboxylation Cycle</h2>
    <p>Vitamin K is a fat-soluble vitamin essential for regulating several vital proteins in the body. Its key function is serving as a cofactor for the enzyme <b>gamma-glutamyl carboxylase</b> in the carboxylation cycle.</p>

    <h3 className="text-xl font-semibold text-foreground mt-6">The Role in Blood Coagulation</h3>
    <p>The original discovery of Vitamin K (derived from "Koagulation" in Danish) centered on its role in hemostasis (blood clotting). It is required for the post-translational modification of specific glutamic acid residues into <b>gamma-carboxyglutamic acid (Gla)</b> in a limited number of proteins. These <b>Vitamin K-Dependent Proteins (VKDPs)</b> include four key plasma procoagulants: Factors II (Prothrombin), VII, IX, and X. Without vitamin K, these proteins cannot bind to calcium, rendering them inactive and leading to a failure of the blood clotting cascade.</p>
    

    <h3 className="text-xl font-semibold text-foreground mt-6">Beyond Clotting: Bone and Cardiovascular Health</h3>
    <p>Vitamin K's function extends far beyond coagulation. It activates other VKDPs critical for tissue health:</p>
    <ul>
        <li><b>Osteocalcin:</b> This protein is synthesized by bone cells (osteoblasts) and requires vitamin K activation to bind calcium and successfully incorporate it into the bone matrix, supporting bone mineralization and strength.</li>
        <li><b>Matrix Gla Protein (MGP):</b> This protein is the most potent inhibitor of soft-tissue calcification. Vitamin K activates MGP, which helps prevent the deposition of calcium in artery walls and other soft tissues, a process linked to coronary heart disease risk.</li>
    </ul>

<hr />

    {/* FORMS OF VITAMIN K: K1 (PHYLLOQUINONE) AND K2 (MENAQUINONES) */}
    <h2 id="forms" className="text-2xl font-bold text-foreground pt-8" itemProp="articleSection">Forms of Vitamin K: K1 (Phylloquinone) and K2 (Menaquinones)</h2>
    <p>Vitamin K is a group of compounds divided into two main naturally occurring forms, each with different primary dietary sources and distinct biological activities:</p>

    <h3 className="text-xl font-semibold text-foreground mt-6">Vitamin K1 (Phylloquinone)</h3>
    <p><b>K1 (Phylloquinone)</b> is the predominant form in the human diet, accounting for 75% to 90% of total intake. It is synthesized by plants and is highly concentrated in green leafy vegetables. K1 is primarily directed by the liver to regulate the synthesis of the blood clotting factors (coagulation). However, K1 is tightly bound to plant chloroplasts, resulting in <b>low bioavailability</b> (only 10%â€“15% is typically absorbed).</p>

    <h3 className="text-xl font-semibold text-foreground mt-6">Vitamin K2 (Menaquinones - MK-4 to MK-13)</h3>
    <p><b>K2 (Menaquinones)</b> are synthesized by bacteria (in the human gut and in fermented foods) and are found in animal products. Menaquinones, particularly the long-chain forms (like MK-7 found in Natto), have <b>higher bioavailability</b> and longer half-lives in the blood than K1. K2 is thought to be more effective at activating VKDPs outside the liver, specifically MGP and osteocalcin, linking it strongly to bone and cardiovascular health.</p>

<hr />

    {/* OFFICIAL ADEQUATE INTAKE (AI) LEVELS */}
    <h2 id="ai" className="text-2xl font-bold text-foreground pt-8" itemProp="articleSection">Official Adequate Intake (AI) Levels</h2>
    <p>Due to the lack of sufficient data to establish a Recommended Dietary Allowance (RDA), the <b>U.S. National Academy of Medicine (NAM)</b> set the <b>Adequate Intake (AI)</b> for Vitamin K based on observed intake levels necessary to maintain normal coagulation factors.</p>

    <h3 className="text-xl font-semibold text-foreground mt-6">Vitamin K AI in Micrograms (mcg) per Day</h3>
    <p>The AI is measured in micrograms (mcg) of phylloquinone (K1), as this is the most studied form. No Tolerable Upper Intake Level (UL) has been set for Vitamin K1 or K2 due to the low potential for toxicity from food or supplements:</p>
    <div className="overflow-x-auto my-6 p-4 bg-gray-50 border rounded-lg">
        <table className="w-full text-left border-collapse">
            <thead>
                <tr>
                    <th className="border-b p-2 font-bold">Life Stage Group</th>
                    <th className="border-b p-2 font-bold">AI (mcg/day)</th>
                </tr>
            </thead>
            <tbody>
                <tr>
                    <td className="border-b p-2">Adult Men (19+ years)</td>
                    <td className="border-b p-2">120 mcg</td>
                </tr>
                <tr>
                    <td className="border-b p-2">Adult Women (19+ years)</td>
                    <td className="border-b p-2">90 mcg</td>
                </tr>
                <tr>
                    <td className="border-b p-2">Pregnant or Lactating Women</td>
                    <td className="border-b p-2">90 mcg</td>
                </tr>
                <tr>
                    <td className="border-b p-2">Adolescents (14â€“18 years)</td>
                    <td className="border-b p-2">75 mcg</td>
                </tr>
            </tbody>
        </table>
    </div>

<hr />

    {/* VITAMIN K DEFICIENCY BLEEDING (VKDB) IN NEWBORNS */}
    <h2 id="deficiency" className="text-2xl font-bold text-foreground pt-8" itemProp="articleSection">Vitamin K Deficiency Bleeding (VKDB) in Newborns</h2>
    <p>While vitamin K deficiency is rare in healthy adults, newborns are inherently prone to deficiency and require mandatory supplementation at birth, a protocol endorsed globally by the <b>CDC</b> and the <b>American Academy of Pediatrics (AAP)</b>.</p>

    <h3 className="text-xl font-semibold text-foreground mt-6">Reasons for Newborn Deficiency</h3>
    <p>Infants are at high risk for <b>Vitamin K Deficiency Bleeding (VKDB)</b>, previously known as hemorrhagic disease of the newborn, for several reasons:</p>
    <ul>
        <li><b>Poor Placental Transfer:</b> Only small amounts of Vitamin K cross the placenta during pregnancy.</li>
        <li><b>Low Breast Milk Content:</b> Breast milk contains low levels of Vitamin K (median 2.5 mcg/L).</li>
        <li><b>Sterile Gut:</b> Newborns do not yet have the intestinal bacteria required to synthesize Vitamin K2.</li>
        <li><b>Immature Liver:</b> The newborn liver cannot efficiently synthesize the clotting factors.</li>
    </ul>

    <h3 className="text-xl font-semibold text-foreground mt-6">Prevention of VKDB</h3>
    <p>VKDB is easily preventable but can be life-threatening if it causes <b>intracranial hemorrhage</b> (bleeding in the brain). To prevent this, a single intramuscular injection of Vitamin K is administered shortly after birth to all newborns in most developed countries.</p>

<hr />

    {/* DIETARY SOURCES AND ABSORPTION */}
    <h2 id="sources" className="text-2xl font-bold text-foreground pt-8" itemProp="articleSection">Dietary Sources and Absorption</h2>
    <p>The bioavailability of Vitamin K is highly dependent on its form and the co-ingestion of fat, as it is a fat-soluble vitamin.</p>

    <h3 className="text-xl font-semibold text-foreground mt-6">Key Food Sources</h3>
    <p>To meet the AI, focus on these sources:</p>
    <ul>
        <li><b>Vitamin K1:</b> Dark green leafy vegetables (kale, spinach, collard greens, turnip greens, broccoli, Brussels sprouts). Soybean and canola oil are also strong sources.</li>
        <li><b>Vitamin K2:</b> Fermented foods (especially <b>Natto</b>, a fermented soybean product, which is exceptionally rich in MK-7), high-fat dairy from grass-fed animals (e.g., butter, certain cheeses), egg yolks, and organ meats.</li>
    </ul>

    <h3 className="text-xl font-semibold text-foreground mt-6">Enhancing Absorption</h3>
    <p>Since Vitamin K is fat-soluble, its absorption is significantly enhanced when consumed with dietary fat. For example, eating a spinach salad dressed with oil or kale cooked with butter or olive oil vastly improves the amount of Vitamin K1 the body can utilize.</p>

<hr />

    {/* DRUG INTERACTIONS (WARFARIN) AND SAFETY */}
    <h2 id="interactions" className="text-2xl font-bold text-foreground pt-8" itemProp="articleSection">Drug Interactions (Warfarin) and Safety</h2>
    <p>Vitamin K is one of the few vitamins with a critical and potentially dangerous drug interaction, making dietary consistency vital for certain patients.</p>

    <h3 className="text-xl font-semibold text-foreground mt-6">Interaction with Warfarin</h3>
    <p>Anticoagulants like <b>warfarin (Coumadin)</b> work by inhibiting the enzyme that recycles Vitamin K back to its active form (the Vitamin K epoxide reductase). This prevents the synthesis of active clotting factors. Patients taking warfarin must maintain a <b>consistent</b> daily intake of Vitamin K. A sudden high intake can counteract the drug's effect, leading to clotting, while a sudden low intake can potentiate the drug's effect, leading to dangerous bleeding.</p>

    <h3 className="text-xl font-semibold text-foreground mt-6">Toxicity and Supplements</h3>
    <p>No adverse effects have been reported for high intakes of Vitamin K1 or K2 from food or supplements, hence there is no established UL. However, certain medications (e.g., broad-spectrum antibiotics, bile acid sequestrants like Cholestyramine) can impair the absorption of Vitamin K, increasing the risk of deficiency.</p>

<hr />

    {/* CONCLUSION */}
    <h2 className="text-2xl font-bold text-foreground pt-8" itemProp="articleSection">Conclusion</h2>
    <p>Vitamin K is an essential fat-soluble vitamin crucial for the activation of <b>coagulation proteins</b> (clotting) and <b>bone health proteins</b> (osteocalcin, MGP). The adult <b>AI is 90-120 mcg/day</b>, easily met through green leafy vegetables (K1) and certain fermented and animal foods (K2). While deficiency is rare in adults, it is a life-threatening risk for newborns (<b>VKDB</b>), necessitating routine administration at birth. Patients on anticoagulants like warfarin must strictly manage their daily Vitamin K intake to ensure the medication remains effective and safe.</p>
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
          <p>This tool estimates vitamin K daily needs from age, gender, vitamin K intake, and pregnancy status.</p>
          <p>Outputs include age, gender, vitamin K intake, daily need, intake percentage, status, recommendations, an action plan, and supporting metrics.</p>
          <p>Formula, steps, guide content, related tools, and FAQs ensure humans or AI assistants can interpret the methodology instantly.</p>
        </CardContent>
      </Card>
    </div>
  );
}


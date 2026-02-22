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
  phosphorusIntake: z.number({ invalid_type_error: 'Enter phosphorus intake' }).min(0).max(5000),
  age: z.number({ invalid_type_error: 'Enter age' }).min(1).max(100),
  gender: z.enum(['male', 'female'], {
    invalid_type_error: 'Select gender',
  }),
});

type FormValues = z.infer<typeof formSchema>;

type ResultPayload = {
  phosphorusIntake: number;
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
  'Enter daily phosphorus intake (mg) from food tracking or estimate.',
  'Enter your age (years) for age-specific requirements.',
  'Select gender (male or female) for gender-specific requirements.',
  'Review daily needs, intake percentage, and recommendations.',
];

const faqs = [
  {
    question: 'What is phosphorus?',
    answer:
      'Phosphorus is an essential mineral that is a major component of bones and teeth, and is involved in energy production, DNA/RNA synthesis, and acid-base balance. It is the second most abundant mineral in the body after calcium.',
  },
  {
    question: 'What are phosphorus requirements?',
    answer:
      'Recommended daily intake: Adults: 700 mg/day. Requirements are the same for men and women. Children and adolescents have lower requirements. Upper limit: 4000 mg/day for adults 19-70, 3000 mg/day for adults 71+.',
  },
  {
    question: 'What are sources of phosphorus?',
    answer:
      'Phosphorus sources include dairy products, meat, fish, poultry, eggs, nuts, seeds, legumes, whole grains, and processed foods (phosphates are common additives). Most foods contain some phosphorus.',
  },
  {
    question: 'How does age affect phosphorus needs?',
    answer:
      'Phosphorus requirements are relatively stable across adulthood (700 mg/day). Children and adolescents have lower requirements. Requirements don\'t change significantly with age in adults.',
  },
  {
    question: 'What about phosphorus deficiency?',
    answer:
      'Phosphorus deficiency is rare in healthy individuals with varied diets. Symptoms may include bone weakness, loss of appetite, and fatigue. Adequate intake from food typically prevents deficiency.',
  },
  {
    question: 'What about phosphorus toxicity?',
    answer:
      'Excessive phosphorus intake (upper limit: 4000 mg/day) is rare from food alone but can occur from supplements. High phosphorus relative to calcium may affect bone health. Upper limits should not be exceeded.',
  },
  {
    question: 'How do I get enough phosphorus?',
    answer:
      'Get phosphorus from dairy products, meat, fish, poultry, eggs, nuts, seeds, legumes, and whole grains. A varied diet typically provides adequate phosphorus.',
  },
  {
    question: 'What about phosphorus and calcium?',
    answer:
      'Phosphorus and calcium work together in bone health. The ideal calcium-to-phosphorus ratio is about 1:1 to 2:1. Very high phosphorus relative to calcium may affect bone health.',
  },
  {
    question: 'Can I track phosphorus at home?',
    answer:
      'Yes. Use food databases to estimate phosphorus intake. Many tracking apps include phosphorus content. Most foods contain phosphorus, so varied diets typically meet requirements.',
  },
  {
    question: 'When should I consult a healthcare provider?',
    answer:
      'Consult a healthcare provider if you have kidney disease (phosphorus restriction may be needed), bone health concerns, are considering phosphorus supplements, or need personalized guidance on phosphorus intake.',
  },
];

const relatedCalculators = [
  {
    name: 'Calcium Intake Calculator',
    slug: 'electrolyte-replacement-calculator',
    description: 'Assess calcium alongside phosphorus for bone health.',
  },
  {
    name: 'Selenium Intake Calculator',
    slug: 'selenium-intake-calculator',
    description: 'Evaluate minerals comprehensively.',
  },
  {
    name: 'Manganese Requirement Calculator',
    slug: 'manganese-requirement-calculator',
    description: 'Assess manganese alongside phosphorus.',
  },
  {
    name: 'Nutrient Density to Calorie Ratio Calculator',
    slug: 'nutrient-density-to-calorie-ratio-calculator',
    description: 'Assess nutritional quality comprehensively.',
  },
];

const baseUrl = 'https://mycalculating.com/health-fitness/phosphorus-intake-calculator';

const schemaMarkup = {
  '@context': 'https://schema.org',
  '@graph': [
    {
      '@type': 'BreadcrumbList',
      itemListElement: [
        { '@type': 'ListItem', position: 1, name: 'Home', item: 'https://mycalculating.com' },
        { '@type': 'ListItem', position: 2, name: 'Health & Fitness', item: 'https://mycalculating.com/health-fitness' },
        { '@type': 'ListItem', position: 3, name: 'Phosphorus Intake Calculator', item: baseUrl },
      ],
    },
    {
      '@type': 'SoftwareApplication',
      name: 'Phosphorus Intake Calculator',
      applicationCategory: 'Calculator',
      operatingSystem: 'Web Browser',
      description: 'Calculate phosphorus intake from phosphorus amount, age, and gender.',
      url: baseUrl,
      offers: { '@type': 'Offer', price: '0', priceCurrency: 'USD' },
    },
  ],
};

const clamp = (value: number, min: number, max: number) => Math.min(max, Math.max(min, value));

const calculateResult = (values: FormValues): ResultPayload => {
  const phosphorusIntake = values.phosphorusIntake;
  const age = values.age;
  const gender = values.gender;
  
  // Estimate daily need (adults: 700 mg/day, same for men and women)
  let dailyNeed = 700; // Adults 19+
  
  if (age < 19) {
    if (age >= 14) {
      dailyNeed = 1250; // Teens 14-18
    } else if (age >= 9) {
      dailyNeed = 1250; // Children 9-13
    } else if (age >= 4) {
      dailyNeed = 500; // Children 4-8
    } else if (age >= 1) {
      dailyNeed = 460; // Children 1-3
    } else {
      dailyNeed = 275; // Infants 7-12 months
    }
  }
  
  const intakePercent = dailyNeed > 0 ? (phosphorusIntake / dailyNeed) * 100 : 0;
  
  let status: ResultPayload['status'] = 'optimal';
  let interpretation = 'Your phosphorus intake appears adequate. Continue maintaining balanced intake from diverse sources.';

  if (phosphorusIntake < dailyNeed * 0.7 || intakePercent < 70) {
    status = 'low';
    interpretation = 'Your phosphorus intake is below recommended levels. This may increase deficiency risk. Consider increasing intake from dairy, meat, nuts, and whole grains to meet daily needs (700 mg/day for adults).';
  } else if (phosphorusIntake < dailyNeed * 0.9 || intakePercent < 90) {
    status = 'moderate';
    interpretation = 'Your phosphorus intake is slightly below recommended levels. Aim for recommended daily intake (700 mg/day for adults) to ensure adequate phosphorus status and prevent deficiency.';
  } else if (phosphorusIntake > 4000 || (age >= 71 && phosphorusIntake > 3000)) {
    status = 'low';
    interpretation = 'Your phosphorus intake exceeds the upper limit. Excessive intake can affect bone health, especially if calcium intake is low. Reduce intake, especially if from supplements.';
  } else if (intakePercent >= 100 && intakePercent <= 200) {
    status = 'optimal';
    interpretation = 'Your phosphorus intake is within recommended range. Continue maintaining balanced intake from diverse sources to support optimal bone health and metabolic function.';
  } else {
    status = 'good';
    interpretation = 'Your phosphorus intake is good. Continue including phosphorus-rich foods in your diet to maintain adequate intake and support bone health and energy production.';
  }

  const recommendations = [
    'Include phosphorus-rich foods: consume dairy products, meat, fish, poultry, eggs, nuts, seeds, legumes, and whole grains to meet recommended daily intake (700 mg/day for adults).',
    'Maintain balanced calcium intake: phosphorus and calcium work together in bone health. Aim for a calcium-to-phosphorus ratio of about 1:1 to 2:1 for optimal bone health.',
    'Avoid excessive intake: phosphorus toxicity is rare from food but can occur from supplements. Stay within recommended intake and avoid exceeding upper limits.',
  ];
  if (status === 'low' && phosphorusIntake < dailyNeed * 0.9) {
    recommendations.push('Increase phosphorus intake through food sources. Include dairy, meat, nuts, and whole grains to meet recommended levels and support bone health and energy production.');
  }
  if (phosphorusIntake > 4000 || (age >= 71 && phosphorusIntake > 3000)) {
    recommendations.push('Reduce phosphorus intake. Excessive intake (upper limit: 4000 mg/day for adults 19-70, 3000 mg/day for 71+) can affect bone health. If from supplements, reduce consumption. Consult healthcare provider if concerns persist.');
  }
  if (phosphorusIntake < dailyNeed * 0.8) {
    recommendations.push(`Significantly increase phosphorus intake. Current intake is below recommended levels (${dailyNeed} mg/day). Focus on dairy, meat, nuts, and whole grains.`);
  }

  const plan = [
    { label: 'This Week', detail: `Calculate phosphorus intake and compare to daily needs (${dailyNeed} mg/day). Assess current intake and identify opportunities to meet recommended levels.` },
    { label: 'This Month', detail: 'Optimize phosphorus intake: include dairy, meat, nuts, and whole grains to ensure adequate intake while maintaining balanced calcium intake for bone health.' },
    { label: 'Ongoing', detail: 'Monitor phosphorus intake through regular food assessment. Maintain recommended intake levels (700 mg/day for adults) to prevent deficiency and support optimal bone health.' },
  ];

  return { phosphorusIntake, age, gender, dailyNeed, intakePercent, status, interpretation, recommendations, plan };
};

export default function PhosphorusIntakeCalculator() {
  const [result, setResult] = useState<ResultPayload | null>(null);

  const form = useForm<FormValues>({
    resolver: zodResolver(formSchema),
    defaultValues: {
      phosphorusIntake: undefined,
      age: undefined,
      gender: undefined,
    },
  });

  return (
    <div className="space-y-8">
      <Script id="phosphorus-intake-schema" type="application/ld+json" strategy="afterInteractive" dangerouslySetInnerHTML={{ __html: JSON.stringify(schemaMarkup) }} />

      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <Activity className="h-5 w-5" />
            Phosphorus Intake Calculator
          </CardTitle>
          <CardDescription>Calculate phosphorus intake from phosphorus amount, age, and gender.</CardDescription>
        </CardHeader>
      </Card>

      <Card>
        <CardHeader>
          <CardTitle>Input your phosphorus data</CardTitle>
        </CardHeader>
        <CardContent>
          <Form {...form}>
            <form onSubmit={form.handleSubmit((values) => setResult(calculateResult(values)))} className="space-y-6">
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <FormField
                  control={form.control}
                  name="phosphorusIntake"
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel>Phosphorus intake (mg)</FormLabel>
                      <FormControl>
                        <Input type="number" step="1" placeholder="e.g., 700" value={field.value ?? ''} onChange={(e) => field.onChange(e.target.value === '' ? undefined : Number(e.target.value))} />
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
                Calculate phosphorus intake
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
                <p className="text-xs text-muted-foreground">mg/day</p>
              </div>
              <div className="p-4 border rounded">
                <p className="text-sm text-muted-foreground">Current intake</p>
                <p className="text-2xl font-semibold text-primary">{result.phosphorusIntake.toFixed(0)}</p>
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
            <strong>Daily need</strong> = estimated from age. Adults 19+: 700 mg/day, same for men and women. Children and adolescents have different requirements.
          </p>
          <p>
            <strong>Intake percentage</strong> = (phosphorus intake / daily need) Ã— 100. Values â‰¥100% indicate adequate intake relative to recommendations.
          </p>
          <p>
            <strong>Recommended intake</strong>: Adults: 700 mg/day. Upper limit: 4000 mg/day for adults 19-70, 3000 mg/day for adults 71+. Requirements are the same for men and women in adulthood.
          </p>
          <p>Phosphorus is an essential mineral required for bone health, energy production, and DNA/RNA synthesis. Adequate intake supports bone strength and metabolic function. Both deficiency and excess should be avoided.</p>
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
                  {result.phosphorusIntake >= result.dailyNeed ? '+' : ''}{(result.phosphorusIntake - result.dailyNeed).toFixed(0)} mg
                </p>
                <p className="text-xs text-muted-foreground">Difference from need</p>
              </div>
              <div className="p-4 border rounded">
                <p className="text-sm text-muted-foreground">Upper limit</p>
                <p className="text-xl font-semibold text-primary">
                  {result.age >= 71 ? '3000' : '4000'} mg
                </p>
                <p className="text-xs text-muted-foreground">Maximum safe intake</p>
              </div>
              <div className="p-4 border rounded">
                <p className="text-sm text-muted-foreground">Intake status</p>
                <p className="text-xl font-semibold text-primary">
                  {result.intakePercent >= 100 && result.phosphorusIntake <= (result.age >= 71 ? 3000 : 4000) ? 'Adequate' : result.intakePercent < 80 ? 'Low' : result.phosphorusIntake > (result.age >= 71 ? 3000 : 4000) ? 'Excessive' : 'Good'}
                </p>
                <p className="text-xs text-muted-foreground">Based on intake</p>
              </div>
            </div>
          ) : (
            <p className="text-sm text-muted-foreground">Enter your phosphorus data to see additional insights.</p>
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
    <meta itemProp="name" content="The Definitive Guide to Phosphorus Intake: RDA, Bone Health, and Kidney Disease Risk" />
    <meta itemProp="description" content="An in-depth, authoritative guide on the essential macro-mineral Phosphorus (P), detailing its critical roles in DNA structure, ATP energy production, bone mineralization, official RDAs, and the specific risks of hyperphosphatemia in kidney disease." />
    <meta itemProp="keywords" content="phosphorus intake calculator, phosphorus RDA NIH, phosphorus function ATP DNA, hypophosphatemia symptoms, hyperphosphatemia kidney disease, phosphorus food sources, calcium-phosphorus balance" />
    <meta itemProp="author" content="[Your Site's Health Team]" />
    <meta itemProp="datePublished" content="2025-12-02" />
    <meta itemProp="url" content="/definitive-phosphorus-intake-guide" />

    <h1 className="text-3xl md:text-4xl font-extrabold text-foreground mb-4" itemProp="headline">The Definitive Guide to Phosphorus Intake: Roles in Energy, DNA, and Bone Health</h1>
    <p className="text-lg italic text-gray-700">Explore the foundational macro-mineral phosphorus (P), its indispensable roles in human biochemistry, and the dietary management required to maintain health, especially kidney function.</p>


    {/* TABLE OF CONTENTS (INTERNAL LINKS FOR UX AND SEO) */}
    <h2 className="text-2xl font-bold text-foreground mt-8 mb-4">Table of Contents: Jump to a Section</h2>
    <ul className="list-disc ml-6 space-y-2 text-blue-600">
        <li><a href="#function" className="hover:underline">Phosphorus's Foundational Biochemical Roles</a></li>
        <li><a href="#rda" className="hover:underline">Official Recommended Dietary Allowance (RDA)</a></li>
        <li><a href="#sources" className="hover:underline">Dietary Sources and Absorption (Organic vs. Inorganic)</a></li>
        <li><a href="#deficiency" className="hover:underline">Phosphorus Deficiency (Hypophosphatemia)</a></li>
        <li><a href="#toxicity" className="hover:underline">Phosphorus Toxicity (Hyperphosphatemia) and Kidney Risk</a></li>
    </ul>
<hr />

    {/* PHOSPHORUS'S FOUNDATIONAL BIOCHEMICAL ROLES */}
    <h2 id="function" className="text-2xl font-bold text-foreground pt-8" itemProp="articleSection">Phosphorus's Foundational Biochemical Roles</h2>
    <p>Phosphorus (P) is the second most abundant mineral in the human body, second only to calcium. Approximately 85% of the body's phosphorus is found combined with calcium in the **bones and teeth**. The remaining 15% is indispensable for cellular function, participating in almost every major metabolic process.</p>

    <h3 className="text-xl font-semibold text-foreground mt-6">Energy, Genetic Material, and Structure</h3>
    <p>In its active form, phosphate (PO4 3-), the mineral serves critical non-structural roles:</p>
    <ul>
        <li><b>Energy (ATP):</b> Phosphate groups are the "currency" of cellular energy. **Adenosine Triphosphate (ATP)** is the primary molecule used to store and transfer energy, and it requires three phosphate groups.</li>
        <li><b>Genetic Material:</b> Phosphate groups form the **sugar-phosphate backbone** of DNA and RNA, giving genetic material its structure.</li>
        <li><b>Cell Membranes:</b> Phosphate is a key component of **phospholipids**, which make up the structural bilayer of all cell membranes.</li>
    </ul>

    <h3 className="text-xl font-semibold text-foreground mt-6">Bone Mineralization and Acid-Base Balance</h3>
    <p>The vast majority of phosphorus forms **calcium phosphate**, or hydroxyapatite, which provides the rigidity and structural integrity of the skeletal system. Furthermore, phosphate ions act as an important buffer system, helping the body maintain a normal pH balance in the blood, which is crucial for enzyme function and overall homeostasis.</p>

<hr />

    {/* OFFICIAL RECOMMENDED DIETARY ALLOWANCE (RDA) */}
    <h2 id="rda" className="text-2xl font-bold text-foreground pt-8" itemProp="articleSection">Official Recommended Dietary Allowance (RDA)</h2>
    <p>The <b>National Institutes of Health (NIH)</b> and the <b>Food and Nutrition Board (FNB)</b> set the RDA for phosphorus. Requirements are highest during adolescence when bone growth is most rapid.</p>

    <h3 className="text-xl font-semibold text-foreground mt-6">Phosphorus RDA and Upper Limit (UL) in Milligrams (mg) per Day</h3>
    <p>Phosphorus intake is tightly regulated by the kidneys and hormones (parathyroid hormone and Vitamin D). The UL is set primarily to prevent metastatic soft tissue calcification associated with high phosphate levels, especially in those with impaired renal function:</p>
    <div className="overflow-x-auto my-6 p-4 bg-gray-50 border rounded-lg">
        <table className="w-full text-left border-collapse">
            <thead>
                <tr>
                    <th className="border-b p-2 font-bold">Life Stage Group</th>
                    <th className="border-b p-2 font-bold">RDA (mg/day)</th>
                    <th className="border-b p-2 font-bold">UL (mg/day)</th>
                </tr>
            </thead>
            <tbody>
                <tr>
                    <td className="border-b p-2">Adults (19+ years)</td>
                    <td className="border-b p-2">700 mg</td>
                    <td className="border-b p-2">4,000 mg</td>
                </tr>
                <tr>
                    <td className="border-b p-2">Adolescents (9â€“18 years)</td>
                    <td className="border-b p-2">1,250 mg</td>
                    <td className="border-b p-2">4,000 mg</td>
                </tr>
                <tr>
                    <td className="border-b p-2">Pregnancy and Lactation</td>
                    <td className="border-b p-2">700 mg</td>
                    <td className="border-b p-2">3,500 mg</td>
                </tr>
            </tbody>
        </table>
    </div>

<hr />

    {/* DIETARY SOURCES AND ABSORPTION (ORGANIC VS. INORGANIC) */}
    <h2 id="sources" className="text-2xl font-bold text-foreground pt-8" itemProp="articleSection">Dietary Sources and Absorption (Organic vs. Inorganic)</h2>
    <p>Phosphorus is abundant in the diet, making deficiency rare. However, the source of the phosphorus significantly impacts how much the body absorbs.</p>

    <h3 className="text-xl font-semibold text-foreground mt-6">Key Food Sources</h3>
    <p>Phosphorus is found in nearly all foods because it is essential to every living cell. The best sources include:</p>
    <ul>
        <li><b>Dairy Products:</b> Milk, cheese, and yogurt are rich sources.</li>
        <li><b>Protein Foods:</b> Meat, poultry, fish, eggs, and nuts.</li>
        <li><b>Grains:</b> Whole grains contain phosphorus in the form of **phytate** (phytic acid).</li>
    </ul>

    <h3 className="text-xl font-semibold text-foreground mt-6">The Importance of Inorganic Phosphate Additives</h3>
    <p>A critical modern source of phosphorus comes from **inorganic phosphate food additives** (e.g., phosphoric acid in sodas, phosphate salts used as leavening agents or preservatives). Absorption rates vary by source:</p>
    <ul>
        <li><b>Organic Phosphorus (Meat, Dairy):</b> Approximately 40%â€“60% absorbed.</li>
        <li><b>Plant Phosphorus (Phytate):</b> Only 10%â€“50% absorbed by humans due to the lack of the enzyme phytase.</li>
        <li><b>Inorganic Phosphorus (Additives):</b> **90%â€“100% absorbed**, as it requires no digestion. This highly absorbed form is a major concern for individuals with kidney disease.</li>
    </ul>
    

[Image of the chemical structure of Adenosine Triphosphate (ATP) highlighting the three phosphate groups]


<hr />

    {/* PHOSPHORUS DEFICIENCY (HYPOPHOSPHATEMIA) */}
    <h2 id="deficiency" className="text-2xl font-bold text-foreground pt-8" itemProp="articleSection">Phosphorus Deficiency (Hypophosphatemia)</h2>
    <p>Deficiency, known as **hypophosphatemia**, is uncommon from diet alone. It is usually secondary to underlying diseases or conditions that severely impair absorption or increase renal excretion.</p>

    <h3 className="text-xl font-semibold text-foreground mt-6">Causes and Risk Factors</h3>
    <p>The most common clinical causes are:</p>
    <ul>
        <li><b>Refeeding Syndrome:</b> When severely malnourished patients are rapidly re-fed, the sudden rush of glucose causes a massive shift of phosphate into the cells, dropping serum levels dangerously low.</li>
        <li><b>Alcoholism:</b> Chronic heavy alcohol use severely impairs nutrient absorption and increases urinary phosphate excretion.</li>
        <li><b>Vitamin D Deficiency:</b> Impairs intestinal absorption of phosphate.</li>
        <li><b>Certain Medications:</b> Long-term use of aluminum-containing antacids can bind phosphate in the gut, preventing its absorption.</li>
    </ul>

    <h3 className="text-xl font-semibold text-foreground mt-6">Clinical Manifestations</h3>
    <p>Severe hypophosphatemia affects systems reliant on ATP and membrane integrity:</p>
    <ul>
        <li><b>Neurological:</b> Confusion, seizures, and coma.</li>
        <li><b>Muscular:</b> Muscle weakness, pain, and rhabdomyolysis (breakdown of muscle tissue).</li>
        <li><b>Hematological:</b> Breakdown of red blood cells (hemolysis) and impaired immune function.</li>
    </ul>

<hr />

    {/* PHOSPHORUS TOXICITY (HYPERPHOSPHATEMIA) AND KIDNEY RISK */}
    <h2 id="toxicity" className="text-2xl font-bold text-foreground pt-8" itemProp="articleSection">Phosphorus Toxicity (Hyperphosphatemia) and Kidney Risk</h2>
    <p>High blood phosphorus levels, known as **hyperphosphatemia**, pose a significant public health risk, especially given the widespread use of highly absorbable inorganic phosphate additives in processed foods.</p>

    <h3 className="text-xl font-semibold text-foreground mt-6">The Primary Cause: Chronic Kidney Disease (CKD)</h3>
    <p>For most healthy people, consuming excess phosphorus is not a major issue because the kidneys are highly efficient at excreting the surplus. However, in patients with **Chronic Kidney Disease (CKD)**, the kidneys lose the ability to excrete phosphate, leading to accumulation (hyperphosphatemia).</p>

    <h3 className="text-xl font-semibold text-foreground mt-6">Consequences of Chronic Hyperphosphatemia</h3>
    <p>High blood phosphate levels disrupt the delicate **calcium-phosphorus balance**. The body attempts to correct this imbalance by drawing calcium out of the bones, leading to bone fragility and fracture risk. Furthermore, high calcium and phosphorus levels combine to form crystals that deposit in soft tissues:</p>
    <ul>
        <li><b>Soft Tissue Calcification:</b> Calcification in joints, skin, and, most dangerously, the walls of blood vessels.</li>
        <li><b>Cardiovascular Disease:</b> Arterial calcification is a major contributor to the high rate of cardiovascular disease and death among CKD patients.</li>
    </ul>

    <h3 className="text-xl font-semibold text-foreground mt-6">Dietary Management for CKD Patients</h3>
    <p>For patients with CKD, strict phosphorus management is mandatory. This involves:</p>
    <ul>
        <li>Restricting high-phosphate foods (especially processed foods containing inorganic phosphate additives).</li>
        <li>Taking **phosphate binders** (medications that attach to phosphate in the gut to prevent its absorption) with every meal.</li>
    </ul>

<hr />

    {/* CONCLUSION */}
    <h2 className="text-2xl font-bold text-foreground pt-8" itemProp="articleSection">Conclusion</h2>
    <p>Phosphorus is a fundamental macro-mineral essential for **ATP energy transfer**, **DNA structure**, and **bone mineralization**. The adult **RDA is 700 mg/day**, easily met through a diet rich in protein and dairy. While dietary deficiency is rare, the most critical risk is **hyperphosphatemia**, caused by the inability of diseased kidneys to excrete phosphate. Given the near-100% absorption rate of inorganic phosphate additives in processed foods, managing these sources is vital for protecting the skeletal and cardiovascular health of patients with **Chronic Kidney Disease**.</p>
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
          <p>This tool calculates phosphorus intake from phosphorus amount, age, and gender.</p>
          <p>Outputs include phosphorus intake, age, gender, daily need, intake percentage, status, recommendations, an action plan, and supporting metrics.</p>
          <p>Formula, steps, guide content, related tools, and FAQs ensure humans or AI assistants can interpret the methodology instantly.</p>
        </CardContent>
      </Card>
    </div>
  );
}


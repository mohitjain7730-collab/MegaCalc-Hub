'use client';

import { useState } from 'react';
import Script from 'next/script';
import Link from 'next/link';
import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import { z } from 'zod';
import { Shield as ShieldIcon, Zap, Target, Activity, Shield } from 'lucide-react';

import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Form, FormControl, FormField, FormItem, FormLabel, FormMessage } from '@/components/ui/form';
import { Input } from '@/components/ui/input';

const formSchema = z.object({
  alphaTocopherol: z.number({ invalid_type_error: 'Enter alpha-tocopherol' }).min(0).max(1000),
  gammaTocopherol: z.number({ invalid_type_error: 'Enter gamma-tocopherol' }).min(0).max(1000).optional(),
  otherTocopherols: z.number({ invalid_type_error: 'Enter other tocopherols' }).min(0).max(1000).optional(),
});

type FormValues = z.infer<typeof formSchema>;

type ResultPayload = {
  alphaTocopherol: number;
  gammaTocopherol: number;
  otherTocopherols: number;
  totalAlphaTocopherol: number;
  totalIU: number;
  status: 'optimal' | 'good' | 'moderate' | 'low';
  interpretation: string;
  recommendations: string[];
  plan: { label: string; detail: string }[];
};

const steps = [
  'Enter alpha-tocopherol (mg) from food label or tracking.',
  'Optionally enter gamma-tocopherol (mg) if known.',
  'Optionally enter other tocopherols (mg) if known.',
  'Review total alpha-tocopherol equivalent, total IU, and recommendations.',
];

const faqs = [
  {
    question: 'What is alpha-tocopherol?',
    answer:
      'Alpha-tocopherol is the most biologically active form of vitamin E and the form used to establish vitamin E requirements. It has the highest vitamin E activity and is the primary form found in supplements.',
  },
  {
    question: 'What are tocopherols?',
    answer:
      'Tocopherols are forms of vitamin E: alpha, beta, gamma, and delta. Alpha-tocopherol has the highest biological activity. Natural alpha-tocopherol (d-alpha) is more active than synthetic (dl-alpha).',
  },
  {
    question: 'How is alpha-tocopherol equivalent calculated?',
    answer:
      'Alpha-tocopherol equivalent = alpha-tocopherol (mg) + gamma-tocopherol (mg) Ã— 0.1 + other tocopherols (mg) Ã— 0.05. Only alpha-tocopherol is fully counted; other forms have lower activity.',
  },
  {
    question: 'What are vitamin E requirements?',
    answer:
      'Recommended daily intake: Adults: 15 mg alpha-tocopherol (22.4 IU natural, 33.3 IU synthetic). Requirements are based on alpha-tocopherol equivalents. Individual needs may vary.',
  },
  {
    question: 'What are sources of vitamin E?',
    answer:
      'Vitamin E sources include nuts (almonds, hazelnuts), seeds (sunflower seeds), vegetable oils (wheat germ, sunflower), leafy greens, and fortified foods. Alpha-tocopherol is the primary active form.',
  },
  {
    question: 'What is the difference between natural and synthetic?',
    answer:
      'Natural alpha-tocopherol (d-alpha) has higher biological activity than synthetic (dl-alpha). 1 mg natural = 1.49 IU, 1 mg synthetic = 1.0 IU. Natural forms are generally preferred.',
  },
  {
    question: 'What about vitamin E deficiency?',
    answer:
      'Vitamin E deficiency is rare but can cause neurological problems, muscle weakness, and vision issues. Adequate intake from food sources typically prevents deficiency.',
  },
  {
    question: 'What about vitamin E supplements?',
    answer:
      'Vitamin E supplements may be beneficial for some, but excessive intake (upper limit: 1000 mg/day) can increase bleeding risk. Food sources are generally preferred. Consult healthcare provider before high-dose supplements.',
  },
  {
    question: 'Can I track alpha-tocopherol at home?',
    answer:
      'Yes. Use food databases to find alpha-tocopherol content. Many foods list vitamin E in IU or mg. Convert to alpha-tocopherol equivalents for accurate tracking.',
  },
  {
    question: 'When should I consult a healthcare provider?',
    answer:
      'Consult a healthcare provider if you have vitamin E deficiency concerns, are considering high-dose supplements, have bleeding disorders, or need personalized guidance on vitamin E intake.',
  },
];

const relatedCalculators = [
  {
    name: 'Vitamin A Retinol Equivalent Calculator',
    slug: 'vitamin-a-retinol-equivalent-calculator',
    description: 'Assess vitamin A alongside vitamin E.',
  },
  {
    name: 'Vitamin K Daily Needs Estimator',
    slug: 'vitamin-k-daily-needs-estimator',
    description: 'Evaluate fat-soluble vitamins comprehensively.',
  },
  {
    name: 'Oxidative Stress Index Calculator',
    slug: 'oxidative-stress-index-calculator',
    description: 'Assess oxidative stress that vitamin E addresses.',
  },
  {
    name: 'Nutrient Density to Calorie Ratio Calculator',
    slug: 'nutrient-density-to-calorie-ratio-calculator',
    description: 'Assess nutritional quality comprehensively.',
  },
];

const baseUrl = 'https://mycalculating.com/health-fitness/vitamin-e-alpha-tocopherol-calculator';

const schemaMarkup = {
  '@context': 'https://schema.org',
  '@graph': [
    {
      '@type': 'BreadcrumbList',
      itemListElement: [
        { '@type': 'ListItem', position: 1, name: 'Home', item: 'https://mycalculating.com' },
        { '@type': 'ListItem', position: 2, name: 'Health & Fitness', item: 'https://mycalculating.com/health-fitness' },
        { '@type': 'ListItem', position: 3, name: 'Vitamin E Alpha-Tocopherol Calculator', item: baseUrl },
      ],
    },
    {
      '@type': 'SoftwareApplication',
      name: 'Vitamin E Alpha-Tocopherol Calculator',
      applicationCategory: 'Calculator',
      operatingSystem: 'Web Browser',
      description: 'Calculate vitamin E alpha-tocopherol equivalent from alpha-tocopherol, gamma-tocopherol, and other tocopherols.',
      url: baseUrl,
      offers: { '@type': 'Offer', price: '0', priceCurrency: 'USD' },
    },
  ],
};

const clamp = (value: number, min: number, max: number) => Math.min(max, Math.max(min, value));

const calculateResult = (values: FormValues): ResultPayload => {
  const alphaTocopherol = values.alphaTocopherol;
  const gammaTocopherol = values.gammaTocopherol || 0;
  const otherTocopherols = values.otherTocopherols || 0;
  
  // Calculate total alpha-tocopherol equivalent
  // Alpha-tocopherol is fully counted, gamma has ~10% activity, others have ~5%
  const totalAlphaTocopherol = alphaTocopherol + (gammaTocopherol * 0.1) + (otherTocopherols * 0.05);
  
  // Calculate total IU (assuming natural alpha-tocopherol: 1 mg = 1.49 IU)
  const totalIU = alphaTocopherol * 1.49 + gammaTocopherol * 0.15 + otherTocopherols * 0.075;
  
  let status: ResultPayload['status'] = 'optimal';
  let interpretation = 'Your vitamin E intake appears adequate. Continue maintaining balanced intake from diverse sources.';

  if (totalAlphaTocopherol < 8) {
    status = 'low';
    interpretation = 'Your vitamin E intake is low. This may increase deficiency risk. Consider increasing intake from nuts, seeds, vegetable oils, and leafy greens to meet recommended levels (15 mg/day).';
  } else if (totalAlphaTocopherol < 12) {
    status = 'moderate';
    interpretation = 'Your vitamin E intake is moderate. Aim for recommended daily intake (15 mg alpha-tocopherol/day for adults) to ensure adequate vitamin E status and prevent deficiency.';
  } else if (totalAlphaTocopherol > 1000) {
    status = 'low';
    interpretation = 'Your vitamin E intake exceeds the upper limit (1000 mg/day). Excessive intake can increase bleeding risk. Consult a healthcare provider if taking high-dose supplements.';
  } else if (totalAlphaTocopherol >= 12 && totalAlphaTocopherol <= 20) {
    status = 'optimal';
    interpretation = 'Your vitamin E intake is within recommended range. Continue maintaining balanced intake from diverse sources to support optimal vitamin E status and antioxidant function.';
  } else {
    status = 'good';
    interpretation = 'Your vitamin E intake is good. Continue including vitamin E-rich foods in your diet to maintain adequate intake and support antioxidant protection.';
  }

  const recommendations = [
    'Include vitamin E-rich foods: consume nuts (almonds, hazelnuts), seeds (sunflower seeds), vegetable oils (wheat germ, sunflower), and leafy greens to meet recommended intake (15 mg alpha-tocopherol/day).',
    'Choose natural sources: vitamin E from food sources is generally preferred over supplements. Natural alpha-tocopherol has higher biological activity than synthetic forms.',
    'Balance intake: aim for recommended daily intake (15 mg alpha-tocopherol for adults) to support antioxidant function and prevent deficiency without exceeding upper limits.',
  ];
  if (status === 'low' && totalAlphaTocopherol < 12) {
    recommendations.push('Increase vitamin E intake through food sources. Include nuts, seeds, vegetable oils, and leafy greens to meet recommended levels and support antioxidant protection.');
  }
  if (totalAlphaTocopherol > 1000) {
    recommendations.push('Reduce vitamin E intake if from supplements. Excessive intake (upper limit: 1000 mg/day) can increase bleeding risk. Food sources are generally safer. Consult healthcare provider before high-dose supplements.');
  }
  if (alphaTocopherol === 0) {
    recommendations.push('Include alpha-tocopherol sources in your diet. Alpha-tocopherol is the most biologically active form of vitamin E and is essential for meeting vitamin E requirements.');
  }

  const plan = [
    { label: 'This Week', detail: 'Calculate vitamin E alpha-tocopherol equivalent for your foods. Assess intake and compare to recommended daily intake (15 mg alpha-tocopherol/day).' },
    { label: 'This Month', detail: 'Optimize vitamin E intake: include nuts, seeds, vegetable oils, and leafy greens to ensure adequate alpha-tocopherol intake and support antioxidant function.' },
    { label: 'Ongoing', detail: 'Monitor vitamin E intake through regular food assessment. Maintain recommended intake levels to prevent deficiency and support optimal antioxidant protection.' },
  ];

  return { alphaTocopherol, gammaTocopherol, otherTocopherols, totalAlphaTocopherol, totalIU, status, interpretation, recommendations, plan };
};

export default function VitaminEAlphaTocopherolCalculator() {
  const [result, setResult] = useState<ResultPayload | null>(null);

  const form = useForm<FormValues>({
    resolver: zodResolver(formSchema),
    defaultValues: {
      alphaTocopherol: undefined,
      gammaTocopherol: undefined,
      otherTocopherols: undefined,
    },
  });

  return (
    <div className="space-y-8">
      <Script id="vitamin-e-schema" type="application/ld+json" strategy="afterInteractive" dangerouslySetInnerHTML={{ __html: JSON.stringify(schemaMarkup) }} />

      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <ShieldIcon className="h-5 w-5" />
            Vitamin E Alpha-Tocopherol Calculator
          </CardTitle>
          <CardDescription>Calculate vitamin E alpha-tocopherol equivalent from alpha-tocopherol, gamma-tocopherol, and other tocopherols.</CardDescription>
        </CardHeader>
      </Card>

      <Card>
        <CardHeader>
          <CardTitle>Input your vitamin E data</CardTitle>
        </CardHeader>
        <CardContent>
          <Form {...form}>
            <form onSubmit={form.handleSubmit((values) => setResult(calculateResult(values)))} className="space-y-6">
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <FormField
                  control={form.control}
                  name="alphaTocopherol"
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel>Alpha-tocopherol (mg)</FormLabel>
                      <FormControl>
                        <Input type="number" step="0.1" placeholder="e.g., 15" value={field.value ?? ''} onChange={(e) => field.onChange(e.target.value === '' ? undefined : Number(e.target.value))} />
                      </FormControl>
                      <FormMessage />
                    </FormItem>
                  )}
                />
                <FormField
                  control={form.control}
                  name="gammaTocopherol"
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel>Gamma-tocopherol (mg) (optional)</FormLabel>
                      <FormControl>
                        <Input type="number" step="0.1" placeholder="e.g., 5" value={field.value ?? ''} onChange={(e) => field.onChange(e.target.value === '' ? undefined : Number(e.target.value))} />
                      </FormControl>
                      <FormMessage />
                    </FormItem>
                  )}
                />
                <FormField
                  control={form.control}
                  name="otherTocopherols"
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel>Other tocopherols (mg) (optional)</FormLabel>
                      <FormControl>
                        <Input type="number" step="0.1" placeholder="e.g., 2" value={field.value ?? ''} onChange={(e) => field.onChange(e.target.value === '' ? undefined : Number(e.target.value))} />
                      </FormControl>
                      <FormMessage />
                    </FormItem>
                  )}
                />
              </div>
              <Button type="submit" className="w-full md:w-auto">
                Calculate alpha-tocopherol equivalent
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
            <CardDescription>See total alpha-tocopherol equivalent, total IU, and recommendations.</CardDescription>
          </CardHeader>
          <CardContent className="space-y-6">
            <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
              <div className="p-4 border rounded">
                <p className="text-sm text-muted-foreground">Alpha-tocopherol</p>
                <p className="text-2xl font-semibold text-primary">{result.alphaTocopherol.toFixed(1)}</p>
                <p className="text-xs text-muted-foreground">mg</p>
              </div>
              <div className="p-4 border rounded">
                <p className="text-sm text-muted-foreground">Total equivalent</p>
                <p className="text-2xl font-semibold text-primary">{result.totalAlphaTocopherol.toFixed(1)}</p>
                <p className="text-xs text-muted-foreground">mg alpha-tocopherol</p>
              </div>
              <div className="p-4 border rounded">
                <p className="text-sm text-muted-foreground">Total IU</p>
                <p className="text-2xl font-semibold text-primary">{result.totalIU.toFixed(0)}</p>
                <p className="text-xs text-muted-foreground">International Units</p>
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
            <strong>Alpha-tocopherol equivalent</strong> = alpha-tocopherol (mg) + gamma-tocopherol (mg) Ã— 0.1 + other tocopherols (mg) Ã— 0.05.
          </p>
          <p>
            <strong>Conversion factors</strong>: Alpha-tocopherol is fully counted (100% activity). Gamma-tocopherol has ~10% activity. Other tocopherols have ~5% activity. Only alpha-tocopherol meets vitamin E requirements.
          </p>
          <p>
            <strong>IU conversion</strong>: Natural alpha-tocopherol: 1 mg = 1.49 IU. Synthetic: 1 mg = 1.0 IU. This calculator assumes natural forms.
          </p>
          <p>
            <strong>Recommended intake</strong>: Adults: 15 mg alpha-tocopherol/day (22.4 IU natural). Upper limit: 1000 mg/day. Requirements are based on alpha-tocopherol equivalents.
          </p>
          <p>Alpha-tocopherol is the most biologically active form of vitamin E. Other tocopherols contribute minimally to vitamin E activity. Adequate alpha-tocopherol intake supports antioxidant function and prevents deficiency.</p>
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
                <p className="text-sm text-muted-foreground">Target intake</p>
                <p className="text-xl font-semibold text-primary">15 mg</p>
                <p className="text-xs text-muted-foreground">Alpha-tocopherol/day</p>
              </div>
              <div className="p-4 border rounded">
                <p className="text-sm text-muted-foreground">Other forms contribution</p>
                <p className="text-xl font-semibold text-primary">
                  {((result.gammaTocopherol * 0.1 + result.otherTocopherols * 0.05) / result.totalAlphaTocopherol * 100).toFixed(1)}%
                </p>
                <p className="text-xs text-muted-foreground">Of total equivalent</p>
              </div>
              <div className="p-4 border rounded">
                <p className="text-sm text-muted-foreground">Intake status</p>
                <p className="text-xl font-semibold text-primary">
                  {result.totalAlphaTocopherol >= 12 && result.totalAlphaTocopherol <= 20 ? 'Adequate' : result.totalAlphaTocopherol < 12 ? 'Low' : result.totalAlphaTocopherol > 1000 ? 'Excessive' : 'Good'}
                </p>
                <p className="text-xs text-muted-foreground">Based on intake</p>
              </div>
            </div>
          ) : (
            <p className="text-sm text-muted-foreground">Enter your vitamin E data to see additional insights.</p>
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
    <meta itemProp="name" content="The Definitive Guide to Vitamin E Alpha-Tocopherol: RDA, Antioxidant Role, and Deficiency" />
    <meta itemProp="description" content="An expert guide on Vitamin E, focusing on the highly bioavailable form alpha-tocopherol, detailing its role as the primary fat-soluble antioxidant, official RDAs from the NIH, and risks of deficiency and excessive intake (bleeding)." />
    <meta itemProp="keywords" content="vitamin e alpha-tocopherol calculator, vitamin e RDA NIH, alpha-tocopherol function, vitamin E antioxidant protection, vitamin E deficiency symptoms, vitamin e food sources, vitamin e upper limit" />
    <meta itemProp="author" content="[Your Site's Health Team]" />
    <meta itemProp="datePublished" content="2025-12-02" />
    <meta itemProp="url" content="/definitive-vitamin-e-alpha-tocopherol-guide" />

    <h1 className="text-3xl md:text-4xl font-extrabold text-foreground mb-4" itemProp="headline">The Definitive Guide to Vitamin E (Alpha-Tocopherol): Daily Needs and Antioxidant Power</h1>
    <p className="text-lg italic text-gray-700">A detailed look at the fat-soluble Vitamin E, its potent antioxidant capabilities, and the specific daily requirements based solely on the highly bioavailable alpha-tocopherol form.</p>


    {/* TABLE OF CONTENTS (INTERNAL LINKS FOR UX AND SEO) */}
    <h2 className="text-2xl font-bold text-foreground mt-8 mb-4">Table of Contents: Jump to a Section</h2>
    <ul className="list-disc ml-6 space-y-2 text-blue-600">
        <li><a href="#function" className="hover:underline">Vitamin E's Core Function: The Fat-Soluble Antioxidant</a></li>
        <li><a href="#forms" className="hover:underline">Forms of Vitamin E: Focus on Alpha-Tocopherol</a></li>
        <li><a href="#rda" className="hover:underline">Official Recommended Dietary Allowance (RDA)</a></li>
        <li><a href="#sources" className="hover:underline">Dietary Sources and Bioavailability</a></li>
        <li><a href="#deficiency" className="hover:underline">Vitamin E Deficiency: Symptoms and Risk Factors</a></li>
        <li><a href="#safety" className="hover:underline">Safety, Upper Limit (UL), and Drug Interactions</a></li>
    </ul>
<hr />

    {/* VITAMIN E'S CORE FUNCTION: THE FAT-SOLUBLE ANTIOXIDANT */}
    <h2 id="function" className="text-2xl font-bold text-foreground pt-8" itemProp="articleSection">Vitamin E's Core Function: The Fat-Soluble Antioxidant</h2>
    <p>Vitamin E is a group of eight fat-soluble compounds that are vital for human health. Its single most important biological role is acting as the body's **primary fat-soluble antioxidant**, protecting crucial cellular components from damage.</p>

    <h3 className="text-xl font-semibold text-foreground mt-6">Protecting Cell Membranes</h3>
    <p>Vitamin E is integrated directly into the lipid layer of cell membranes (including the membranes of the lungs, eyes, and blood vessels). Within the membrane, it donates a hydrogen atom to free radicals, thereby terminating the chain reaction of lipid peroxidationâ€”the destructive process where free radicals steal electrons from lipids, leading to cellular damage. By protecting the fatty acids in the cell membrane, Vitamin E helps maintain the integrity and function of the entire cell.</p>

    <h3 className="text-xl font-semibold text-foreground mt-6">Cardiovascular and Immune Roles</h3>
    <ul>
        <li><b>LDL Protection:</b> Vitamin E is crucial for protecting low-density lipoprotein (LDL) cholesterol from oxidation. Oxidized LDL is a major component in the formation of arterial plaque, suggesting Vitamin E plays a protective role against atherosclerosis.</li>
        <li><b>Immune Function:</b> It supports immune health, particularly in the elderly, by enhancing T-cell function and proliferation.</li>
        <li><b>Red Blood Cells:</b> It helps prevent the oxidative damage of red blood cell membranes, protecting against hemolytic anemia.</li>
    </ul>

<hr />

    {/* FORMS OF VITAMIN E: FOCUS ON ALPHA-TOCOPHEROL */}
    <h2 id="forms" className="text-2xl font-bold text-foreground pt-8" itemProp="articleSection">Forms of Vitamin E: Focus on Alpha-Tocopherol</h2>
    <p>The Vitamin E group is comprised of four **tocopherols** ($\alpha$, $\beta$, $\gamma$, $\delta$) and four **tocotrienols** ($\alpha$, $\beta$, $\gamma$, $\delta$). While all possess antioxidant activity, only one form is recognized to meet human nutritional requirements.</p>

    <h3 className="text-xl font-semibold text-foreground mt-6">Alpha-Tocopherol is the Standard</h3>
    <p>The **Recommended Dietary Allowance (RDA) is based exclusively on alpha-tocopherol**. This is because the human liver contains a specific proteinâ€”**alpha-tocopherol transfer protein ($\alpha$-TTP)**â€”which preferentially binds only alpha-tocopherol and transfers it into the circulatory system. All other forms of Vitamin E are metabolized quickly and largely excreted, meaning they are much less bioavailable to the body's tissues.</p>

    <h3 className="text-xl font-semibold text-foreground mt-6">Natural vs. Synthetic Forms</h3>
    <p>It is important to distinguish between natural and synthetic alpha-tocopherol, which are labeled differently:</p>
    <ul>
        <li><b>Natural:</b> Labeled as RRR-alpha-tocopherol or $d$-alpha-tocopherol.</li>
        <li><b>Synthetic:</b> Labeled as $all$-rac-alpha-tocopherol or $dl$-alpha-tocopherol.</li>
    </ul>
    <p>The natural form is generally considered to be twice as biologically potent as the synthetic form, a fact that must be considered when reading supplement labels.</p>

<hr />

    {/* OFFICIAL RECOMMENDED DIETARY ALLOWANCE (RDA) */}
    <h2 id="rda" className="text-2xl font-bold text-foreground pt-8" itemProp="articleSection">Official Recommended Dietary Allowance (RDA)</h2>
    <p>The <b>National Institutes of Health (NIH)</b> and the <b>Food and Nutrition Board (FNB)</b> set the RDA for Vitamin E based on the amount of alpha-tocopherol required to prevent hemolytic anemia in infants and maintain normal plasma alpha-tocopherol concentrations in adults.</p>

    <h3 className="text-xl font-semibold text-foreground mt-6">Vitamin E RDA and Upper Limit (UL) in Milligrams (mg) per Day</h3>
    <p>The RDA is expressed in milligrams (mg) of alpha-tocopherol. Note that the UL is significantly high, reflecting the relative safety of the vitamin compared to trace minerals, but it is based on synthetic doses:</p>
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
                    <td className="border-b p-2">15 mg</td>
                    <td className="border-b p-2">1,000 mg</td>
                </tr>
                <tr>
                    <td className="border-b p-2">Pregnancy (all ages)</td>
                    <td className="border-b p-2">15 mg</td>
                    <td className="border-b p-2">1,000 mg</td>
                </tr>
                <tr>
                    <td className="border-b p-2">Lactation (all ages)</td>
                    <td className="border-b p-2">19 mg</td>
                    <td className="border-b p-2">1,000 mg</td>
                </tr>
                <tr>
                    <td className="border-b p-2">Children (9â€“13 years)</td>
                    <td className="border-b p-2">11 mg</td>
                    <td className="border-b p-2">600 mg</td>
                </tr>
            </tbody>
        </table>
    </div>

<hr />

    {/* DIETARY SOURCES AND BIOAVAILABILITY */}
    <h2 id="sources" className="text-2xl font-bold text-foreground pt-8" itemProp="articleSection">Dietary Sources and Bioavailability</h2>
    <p>Vitamin E is widely distributed in the food supply, particularly in plant-based sources rich in fat. However, the form of tocopherol varies greatly between foods.</p>

    <h3 className="text-xl font-semibold text-foreground mt-6">Key Food Sources of Alpha-Tocopherol</h3>
    <p>The most bioavailable source of alpha-tocopherol in the American diet is **oils** and **nuts**, not always leafy greens (which contain mostly gamma-tocopherol):</p>
    <ul>
        <li><b>Vegetable Oils:</b> Wheat germ oil, sunflower oil, safflower oil, and canola oil.</li>
        <li><b>Nuts and Seeds:</b> Sunflower seeds, almonds, hazelnuts, and peanuts.</li>
        <li><b>Leafy Greens:</b> Spinach and broccoli are good sources, but primarily contain gamma-tocopherol, which is less potent under the RDA standard.</li>
        <li><b>Fortified Foods:</b> Many breakfast cereals are fortified with Vitamin E to ensure adequate intake.</li>
    </ul>

    <h3 className="text-xl font-semibold text-foreground mt-6">Absorption Factors</h3>
    <p>As a fat-soluble vitamin, Vitamin E requires the presence of dietary fat and functional fat absorption (bile and pancreatic enzymes) for effective uptake. Consumption of Vitamin E-rich foods in conjunction with healthy fats (e.g., salad with oil dressing) maximizes absorption.</p>

<hr />

    {/* VITAMIN E DEFICIENCY: SYMPTOMS AND RISK FACTORS */}
    <h2 id="deficiency" className="text-2xl font-bold text-foreground pt-8" itemProp="articleSection">Vitamin E Deficiency: Symptoms and Risk Factors</h2>
    <p>Clinical deficiency in Vitamin E is extremely rare in the general population consuming a standard diet. Deficiency symptoms are primarily neurological and only occur after years of inadequate intake or due to underlying health conditions.</p>

    <h3 className="text-xl font-semibold text-foreground mt-6">Clinical Manifestations</h3>
    <p>The most common and definitive symptoms of severe deficiency involve the nervous system, as neurons are highly susceptible to oxidative stress:</p>
    <ul>
        <li><b>Peripheral Neuropathy:</b> Numbness, tingling, and nerve damage in the extremities.</li>
        <li><b>Ataxia:</b> Impaired balance and coordination due to damage to the spinal cord neurons.</li>
        <li><b>Myopathy:</b> Muscle weakness.</li>
        <li><b>Hemolytic Anemia:</b> Fragile red blood cells rupture, leading to anemia (most commonly seen in premature infants).</li>
    </ul>

    <h3 className="text-xl font-semibold text-foreground mt-6">High-Risk Groups (Malabsorption)</h3>
    <p>Risk for deficiency is overwhelmingly confined to individuals with disorders that impair fat absorption:</p>
    <ul>
        <li><b>Genetic Disorders:</b> Individuals with **abetalipoproteinemia** or **ataxia with Vitamin E deficiency (AVED)** cannot properly transport Vitamin E, leading to severe deficiency despite high intake.</li>
        <li><b>Gastrointestinal Diseases:</b> Chronic malabsorptive conditions like Crohn's disease, cystic fibrosis, and liver diseases (which affect bile production).</li>
        <li><b>Bariatric Surgery Patients:</b> Those who have undergone malabsorptive weight-loss surgeries are at chronic risk.</li>
    </ul>

<hr />

    {/* SAFETY, UPPER LIMIT (UL), AND DRUG INTERACTIONS */}
    <h2 id="safety" className="text-2xl font-bold text-foreground pt-8" itemProp="articleSection">Safety, Upper Limit (UL), and Drug Interactions</h2>
    <p>While Vitamin E is generally considered safe, high-dose supplementation can carry risks, particularly related to its effect on blood coagulation.</p>

    <h3 className="text-xl font-semibold text-foreground mt-6">Bleeding Risk at High Doses</h3>
    <p>The **1,000 mg/day UL** for adults is set primarily due to the potential for high doses of Vitamin E (alpha-tocopherol) to act as an anticoagulant and interfere with the body's ability to clot blood. This bleeding risk is a major concern, especially in conjunction with certain medications.</p>

    <h3 className="text-xl font-semibold text-foreground mt-6">Drug Interactions</h3>
    <p>High-dose Vitamin E supplementation can be dangerous for patients taking:</p>
    <ul>
        <li><b>Anticoagulants:</b> Drugs like warfarin (Coumadin) or heparin, as the combination significantly increases the risk of serious bleeding (hemorrhage).</li>
        <li><b>Statins:</b> While controversial, some studies suggest that high doses of antioxidant vitamins (including E and C) may blunt the protective effects of statin drugs on cardiovascular health.</li>
    </ul>

<hr />

    {/* CONCLUSION */}
    <h2 className="text-2xl font-bold text-foreground pt-8" itemProp="articleSection">Conclusion</h2>
    <p>Vitamin E's primary function is its essential role as the body's **fat-soluble antioxidant**, protecting cell integrity against oxidative damage. Nutritional requirements are based exclusively on **alpha-tocopherol** (RDA of 15 mg/day) due to the liver's selective retention mechanism. Deficiency is rare and linked mainly to fat malabsorption disorders. While safe at dietary levels, chronic high-dose supplementation near the **1,000 mg UL** is strongly cautioned against, particularly for individuals on blood-thinning medication, due to the increased risk of hemorrhage.</p>
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
          <p>This tool calculates vitamin E alpha-tocopherol equivalent from alpha-tocopherol, gamma-tocopherol, and other tocopherols.</p>
          <p>Outputs include alpha-tocopherol, gamma-tocopherol, other tocopherols, total alpha-tocopherol equivalent, total IU, status, recommendations, an action plan, and supporting metrics.</p>
          <p>Formula, steps, guide content, related tools, and FAQs ensure humans or AI assistants can interpret the methodology instantly.</p>
        </CardContent>
      </Card>
    </div>
  );
}


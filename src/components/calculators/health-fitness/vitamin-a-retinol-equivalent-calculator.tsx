'use client';

import { useState } from 'react';
import Script from 'next/script';
import Link from 'next/link';
import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import { z } from 'zod';
import { Eye, Zap, Target, Activity, Shield } from 'lucide-react';

import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Form, FormControl, FormField, FormItem, FormLabel, FormMessage } from '@/components/ui/form';
import { Input } from '@/components/ui/input';

const formSchema = z.object({
  retinol: z.number({ invalid_type_error: 'Enter retinol' }).min(0).max(10000).optional(),
  betaCarotene: z.number({ invalid_type_error: 'Enter beta-carotene' }).min(0).max(50000).optional(),
  alphaCarotene: z.number({ invalid_type_error: 'Enter alpha-carotene' }).min(0).max(50000).optional(),
  otherCarotenoids: z.number({ invalid_type_error: 'Enter other carotenoids' }).min(0).max(50000).optional(),
});

type FormValues = z.infer<typeof formSchema>;

type ResultPayload = {
  retinol: number;
  betaCarotene: number;
  alphaCarotene: number;
  otherCarotenoids: number;
  totalRAE: number;
  totalIU: number;
  status: 'optimal' | 'good' | 'moderate' | 'low';
  interpretation: string;
  recommendations: string[];
  plan: { label: string; detail: string }[];
};

const steps = [
  'Enter retinol (mcg) from food label or tracking (if from animal sources).',
  'Enter beta-carotene (mcg) from food label or tracking (if from plant sources).',
  'Optionally enter alpha-carotene (mcg) if known.',
  'Optionally enter other carotenoids (mcg) if known.',
  'Review retinol activity equivalent (RAE), total IU, and recommendations.',
];

const faqs = [
  {
    question: 'What is retinol activity equivalent (RAE)?',
    answer:
      'RAE is a standardized unit for vitamin A that accounts for different sources. 1 mcg RAE = 1 mcg retinol = 12 mcg beta-carotene = 24 mcg alpha-carotene. RAE provides a consistent measure across different vitamin A sources.',
  },
  {
    question: 'What are sources of vitamin A?',
    answer:
      'Vitamin A sources include: preformed vitamin A (retinol) from animal sources (liver, fish, dairy, eggs) and provitamin A carotenoids (beta-carotene, alpha-carotene) from plant sources (carrots, sweet potatoes, leafy greens).',
  },
  {
    question: 'How is RAE calculated?',
    answer:
      'RAE = retinol (mcg) + beta-carotene (mcg) / 12 + alpha-carotene (mcg) / 24 + other carotenoids (mcg) / 24. This converts all forms to retinol equivalents based on conversion efficiency.',
  },
  {
    question: 'What is the difference between RAE and IU?',
    answer:
      'RAE (retinol activity equivalent) is the current standard, while IU (international units) is older. 1 mcg RAE = 3.33 IU from retinol or 20 IU from beta-carotene. RAE provides more accurate measurement.',
  },
  {
    question: 'What are vitamin A requirements?',
    answer:
      'Recommended daily intake: Men: 900 mcg RAE, Women: 700 mcg RAE. Requirements increase during pregnancy (770-1300 mcg RAE) and lactation (1300 mcg RAE). Individual needs vary.',
  },
  {
    question: 'What are symptoms of vitamin A deficiency?',
    answer:
      'Deficiency symptoms include night blindness, dry eyes, skin problems, increased infection risk, and in severe cases, xerophthalmia. Adequate intake prevents deficiency.',
  },
  {
    question: 'What about vitamin A toxicity?',
    answer:
      'Excessive preformed vitamin A (retinol) can cause toxicity. Upper limit: 3000 mcg RAE/day for adults. Beta-carotene from food is safer as conversion is regulated. Consult healthcare provider before high-dose supplements.',
  },
  {
    question: 'How do I get vitamin A from food?',
    answer:
      'Get vitamin A from animal sources (liver, fish, dairy, eggs) for preformed vitamin A, and plant sources (carrots, sweet potatoes, leafy greens, orange/yellow vegetables) for provitamin A carotenoids.',
  },
  {
    question: 'Can I track RAE at home?',
    answer:
      'Yes. Use food databases to find retinol and carotenoid content, then calculate RAE using conversion factors. Many tracking apps calculate RAE automatically from food entries.',
  },
  {
    question: 'When should I consult a healthcare provider?',
    answer:
      'Consult a healthcare provider if you have vitamin A deficiency symptoms, are considering high-dose supplements, are pregnant or breastfeeding, or need personalized guidance on vitamin A intake.',
  },
];

const relatedCalculators = [
  {
    name: 'Nutrient Density to Calorie Ratio Calculator',
    slug: 'nutrient-density-to-calorie-ratio-calculator',
    description: 'Assess nutritional quality comprehensively.',
  },
  {
    name: 'Meal Calorie Breakdown Calculator',
    slug: 'meal-calorie-breakdown-calculator',
    description: 'Break down meal nutrients alongside vitamin A.',
  },
  {
    name: 'Vitamin K Daily Needs Estimator',
    slug: 'vitamin-k-daily-needs-estimator',
    description: 'Assess vitamin K alongside vitamin A.',
  },
  {
    name: 'Iodine Deficiency Risk Calculator',
    slug: 'iodine-deficiency-risk-calculator',
    description: 'Evaluate micronutrient status comprehensively.',
  },
];

const baseUrl = 'https://mycalculating.com/category/health-fitness/vitamin-a-retinol-equivalent-calculator';

const schemaMarkup = {
  '@context': 'https://schema.org',
  '@graph': [
    {
      '@type': 'BreadcrumbList',
      itemListElement: [
        { '@type': 'ListItem', position: 1, name: 'Home', item: 'https://mycalculating.com' },
        { '@type': 'ListItem', position: 2, name: 'Health & Fitness', item: 'https://mycalculating.com/category/health-fitness' },
        { '@type': 'ListItem', position: 3, name: 'Vitamin A Retinol Equivalent Calculator', item: baseUrl },
      ],
    },
    {
      '@type': 'SoftwareApplication',
      name: 'Vitamin A Retinol Equivalent Calculator',
      applicationCategory: 'Calculator',
      operatingSystem: 'Web Browser',
      description: 'Calculate vitamin A retinol activity equivalent from retinol, beta-carotene, alpha-carotene, and other carotenoids.',
      url: baseUrl,
      offers: { '@type': 'Offer', price: '0', priceCurrency: 'USD' },
    },
  ],
};

const clamp = (value: number, min: number, max: number) => Math.min(max, Math.max(min, value));

const calculateResult = (values: FormValues): ResultPayload => {
  const retinol = values.retinol || 0;
  const betaCarotene = values.betaCarotene || 0;
  const alphaCarotene = values.alphaCarotene || 0;
  const otherCarotenoids = values.otherCarotenoids || 0;
  
  // Calculate RAE (Retinol Activity Equivalent)
  // 1 mcg RAE = 1 mcg retinol = 12 mcg beta-carotene = 24 mcg alpha-carotene = 24 mcg other carotenoids
  const totalRAE = retinol + (betaCarotene / 12) + (alphaCarotene / 24) + (otherCarotenoids / 24);
  
  // Calculate total IU (International Units)
  // 1 mcg RAE = 3.33 IU from retinol, or approximately 20 IU from beta-carotene
  // Simplified: 1 mcg RAE ≈ 3.33 IU (for retinol) or use weighted average
  const totalIU = retinol * 3.33 + betaCarotene * 0.167 + alphaCarotene * 0.083 + otherCarotenoids * 0.083;
  
  let status: ResultPayload['status'] = 'optimal';
  let interpretation = 'Your vitamin A intake appears adequate. Continue maintaining balanced intake from diverse sources.';

  if (totalRAE < 400) {
    status = 'low';
    interpretation = 'Your vitamin A intake is low. This may increase deficiency risk. Consider increasing intake from animal sources (retinol) or plant sources (carotenoids) to meet recommended levels.';
  } else if (totalRAE < 600) {
    status = 'moderate';
    interpretation = 'Your vitamin A intake is moderate. Aim for recommended daily intake (700-900 mcg RAE for adults) to ensure adequate vitamin A status and prevent deficiency.';
  } else if (totalRAE > 3000) {
    status = 'low';
    interpretation = 'Your vitamin A intake exceeds the upper limit (3000 mcg RAE/day). Excessive preformed vitamin A can cause toxicity. Consult a healthcare provider if taking supplements.';
  } else if (totalRAE >= 700 && totalRAE <= 1200) {
    status = 'optimal';
    interpretation = 'Your vitamin A intake is within recommended range. Continue maintaining balanced intake from diverse sources to support optimal vitamin A status.';
  } else {
    status = 'good';
    interpretation = 'Your vitamin A intake is good. Continue including vitamin A-rich foods in your diet to maintain adequate intake.';
  }

  const recommendations = [
    'Include diverse vitamin A sources: consume both animal sources (liver, fish, dairy, eggs) for preformed vitamin A and plant sources (carrots, sweet potatoes, leafy greens) for carotenoids.',
    'Aim for recommended intake: 700-900 mcg RAE per day for adults. Pregnant and lactating women need higher amounts (770-1300 mcg RAE).',
    'Balance retinol and carotenoids: preformed vitamin A (retinol) is more bioavailable, while carotenoids from food are safer as conversion is regulated.',
  ];
  if (status === 'low' && totalRAE < 600) {
    recommendations.push('Increase vitamin A intake through food sources. Include liver, fish, dairy, eggs, carrots, sweet potatoes, and leafy greens to meet recommended levels.');
  }
  if (totalRAE > 3000) {
    recommendations.push('Reduce vitamin A intake if from supplements. Excessive preformed vitamin A can cause toxicity. Food sources are generally safer. Consult healthcare provider before high-dose supplements.');
  }
  if (retinol === 0 && betaCarotene === 0) {
    recommendations.push('Include vitamin A sources in your diet. Both animal sources (retinol) and plant sources (carotenoids) contribute to vitamin A intake and support health.');
  }

  const plan = [
    { label: 'This Week', detail: 'Calculate vitamin A RAE for your foods. Assess intake from retinol and carotenoids, and compare to recommended daily intake.' },
    { label: 'This Month', detail: 'Optimize vitamin A intake: include diverse sources (animal and plant), ensure adequate intake, and maintain balanced consumption to support optimal vitamin A status.' },
    { label: 'Ongoing', detail: 'Monitor vitamin A intake through regular food assessment. Maintain recommended intake levels to prevent deficiency and support optimal health.' },
  ];

  return { retinol, betaCarotene, alphaCarotene, otherCarotenoids, totalRAE, totalIU, status, interpretation, recommendations, plan };
};

export default function VitaminARetinolEquivalentCalculator() {
  const [result, setResult] = useState<ResultPayload | null>(null);

  const form = useForm<FormValues>({
    resolver: zodResolver(formSchema),
    defaultValues: {
      retinol: undefined,
      betaCarotene: undefined,
      alphaCarotene: undefined,
      otherCarotenoids: undefined,
    },
  });

  return (
    <div className="space-y-8">
      <Script id="vitamin-a-rae-schema" type="application/ld+json" strategy="afterInteractive" dangerouslySetInnerHTML={{ __html: JSON.stringify(schemaMarkup) }} />

      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <Eye className="h-5 w-5" />
            Vitamin A Retinol Equivalent Calculator
          </CardTitle>
          <CardDescription>Calculate vitamin A retinol activity equivalent from retinol, beta-carotene, alpha-carotene, and other carotenoids.</CardDescription>
        </CardHeader>
      </Card>

      <Card>
        <CardHeader>
          <CardTitle>Input your vitamin A data</CardTitle>
        </CardHeader>
        <CardContent>
          <Form {...form}>
            <form onSubmit={form.handleSubmit((values) => setResult(calculateResult(values)))} className="space-y-6">
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <FormField
                  control={form.control}
                  name="retinol"
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel>Retinol (mcg) (optional)</FormLabel>
                      <FormControl>
                        <Input type="number" step="0.1" placeholder="e.g., 500" value={field.value ?? ''} onChange={(e) => field.onChange(e.target.value === '' ? undefined : Number(e.target.value))} />
                      </FormControl>
                      <FormMessage />
                    </FormItem>
                  )}
                />
                <FormField
                  control={form.control}
                  name="betaCarotene"
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel>Beta-carotene (mcg) (optional)</FormLabel>
                      <FormControl>
                        <Input type="number" step="0.1" placeholder="e.g., 3000" value={field.value ?? ''} onChange={(e) => field.onChange(e.target.value === '' ? undefined : Number(e.target.value))} />
                      </FormControl>
                      <FormMessage />
                    </FormItem>
                  )}
                />
                <FormField
                  control={form.control}
                  name="alphaCarotene"
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel>Alpha-carotene (mcg) (optional)</FormLabel>
                      <FormControl>
                        <Input type="number" step="0.1" placeholder="e.g., 500" value={field.value ?? ''} onChange={(e) => field.onChange(e.target.value === '' ? undefined : Number(e.target.value))} />
                      </FormControl>
                      <FormMessage />
                    </FormItem>
                  )}
                />
                <FormField
                  control={form.control}
                  name="otherCarotenoids"
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel>Other carotenoids (mcg) (optional)</FormLabel>
                      <FormControl>
                        <Input type="number" step="0.1" placeholder="e.g., 200" value={field.value ?? ''} onChange={(e) => field.onChange(e.target.value === '' ? undefined : Number(e.target.value))} />
                      </FormControl>
                      <FormMessage />
                    </FormItem>
                  )}
                />
              </div>
              <Button type="submit" className="w-full md:w-auto">
                Calculate RAE
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
            <CardDescription>See retinol activity equivalent (RAE), total IU, and recommendations.</CardDescription>
          </CardHeader>
          <CardContent className="space-y-6">
            <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
              <div className="p-4 border rounded">
                <p className="text-sm text-muted-foreground">Total RAE</p>
                <p className="text-2xl font-semibold text-primary">{result.totalRAE.toFixed(1)}</p>
                <p className="text-xs text-muted-foreground">mcg RAE</p>
              </div>
              <div className="p-4 border rounded">
                <p className="text-sm text-muted-foreground">Total IU</p>
                <p className="text-2xl font-semibold text-primary">{result.totalIU.toFixed(0)}</p>
                <p className="text-xs text-muted-foreground">International Units</p>
              </div>
              <div className="p-4 border rounded">
                <p className="text-sm text-muted-foreground">Retinol</p>
                <p className="text-2xl font-semibold text-primary">{result.retinol.toFixed(1)}</p>
                <p className="text-xs text-muted-foreground">mcg</p>
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
            <strong>RAE (Retinol Activity Equivalent)</strong> = retinol (mcg) + beta-carotene (mcg) / 12 + alpha-carotene (mcg) / 24 + other carotenoids (mcg) / 24.
          </p>
          <p>
            <strong>Conversion factors</strong>: 1 mcg RAE = 1 mcg retinol = 12 mcg beta-carotene = 24 mcg alpha-carotene = 24 mcg other carotenoids. These reflect conversion efficiency from provitamin A to retinol.
          </p>
          <p>
            <strong>Recommended intake</strong>: Adults: 700-900 mcg RAE/day. Pregnant: 770-1300 mcg RAE/day. Lactating: 1300 mcg RAE/day. Upper limit: 3000 mcg RAE/day for adults.
          </p>
          <p>RAE provides a standardized measure of vitamin A from different sources. Preformed vitamin A (retinol) is more bioavailable, while carotenoids from food are safer as conversion is regulated.</p>
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
                <p className="text-sm text-muted-foreground">Target RAE (adults)</p>
                <p className="text-xl font-semibold text-primary">700-900 mcg</p>
                <p className="text-xs text-muted-foreground">Recommended range</p>
              </div>
              <div className="p-4 border rounded">
                <p className="text-sm text-muted-foreground">Carotenoid contribution</p>
                <p className="text-xl font-semibold text-primary">
                  {((result.betaCarotene / 12 + result.alphaCarotene / 24 + result.otherCarotenoids / 24) / result.totalRAE * 100).toFixed(1)}%
                </p>
                <p className="text-xs text-muted-foreground">Of total RAE</p>
              </div>
              <div className="p-4 border rounded">
                <p className="text-sm text-muted-foreground">RAE status</p>
                <p className="text-xl font-semibold text-primary">
                  {result.totalRAE >= 700 && result.totalRAE <= 1200 ? 'Adequate' : result.totalRAE < 600 ? 'Low' : result.totalRAE > 3000 ? 'Excessive' : 'Good'}
                </p>
                <p className="text-xs text-muted-foreground">Based on intake</p>
              </div>
            </div>
          ) : (
            <p className="text-sm text-muted-foreground">Enter your vitamin A data to see additional insights.</p>
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

      <section
        className="space-y-6 text-muted-foreground leading-relaxed bg-white p-6 md:p-10 rounded-lg shadow-lg"
        itemScope
        itemType="https://schema.org/MedicalWebPage"
      >
    {/* SEO & SCHEMA METADATA (HIGHLY OPTIMIZED) */}
    <meta itemProp="name" content="The Definitive Guide to Vitamin A Retinol Equivalents: RDA, Vision, and Immune Function" />
    <meta itemProp="description" content="An in-depth guide on Vitamin A, explaining the critical difference between preformed retinol and provitamin A carotenoids, official RDAs expressed in Retinol Activity Equivalents (RAE), and the serious risks of deficiency (night blindness)." />
    <meta itemProp="keywords" content="vitamin a retinol equivalent calculator, vitamin a RDA NIH, retinol activity equivalents RAE, preformed vitamin a vs carotenoids, night blindness xerophthalmia, vitamin a toxicity hypervitaminosis A" />
    <meta itemProp="author" content="[Your Site's Health Team]" />
    <meta itemProp="datePublished" content="2025-12-02" />
    <meta itemProp="url" content="/definitive-vitamin-a-retinol-equivalent-guide" />

    <h1 className="text-3xl md:text-4xl font-extrabold text-foreground mb-4" itemProp="headline">The Definitive Guide to Vitamin A: Retinol Equivalents, Vision, and Immune Function</h1>
    <p className="text-lg italic text-gray-700">A detailed look at the fat-soluble Vitamin A, its forms, the conversion unit Retinol Activity Equivalent (RAE), and its indispensable roles in gene expression and global health.</p>


    {/* TABLE OF CONTENTS (INTERNAL LINKS FOR UX AND SEO) */}
    <h2 className="text-2xl font-bold text-foreground mt-8 mb-4">Table of Contents: Jump to a Section</h2>
    <ul className="list-disc ml-6 space-y-2 text-blue-600">
        <li><a href="#forms" className="hover:underline">Forms of Vitamin A and the RAE Conversion System</a></li>
        <li><a href="#function" className="hover:underline">The Essential Roles of Vitamin A: Vision and Cell Differentiation</a></li>
        <li><a href="#rda" className="hover:underline">Official Recommended Dietary Allowance (RDA)</a></li>
        <li><a href="#sources" className="hover:underline">Dietary Sources: Animal vs. Plant</a></li>
        <li><a href="#deficiency" className="hover:underline">Vitamin A Deficiency: Night Blindness and Xerophthalmia</a></li>
        <li><a href="#toxicity" className="hover:underline">Toxicity Risk: Hypervitaminosis A and Birth Defects</a></li>
    </ul>
<hr />

    {/* FORMS OF VITAMIN A AND THE RAE CONVERSION SYSTEM */}
    <h2 id="forms" className="text-2xl font-bold text-foreground pt-8" itemProp="articleSection">Forms of Vitamin A and the RAE Conversion System</h2>
    <p>Vitamin A is a term that refers to a group of fat-soluble compounds called **retinoids** and **carotenoids**. Because these various forms have different biological activities and absorption rates, a standardized measurement unit is required for nutritional assessment.</p>

    <h3 className="text-xl font-semibold text-foreground mt-6">Preformed Vitamin A (Retinoids)</h3>
    <p>This form is found exclusively in animal products (liver, fish oil, dairy, eggs). It includes **retinol** (the alcohol form), retinal (the aldehyde form), and retinoic acid. It is immediately active upon absorption and is highly bioavailable.</p>

    <h3 className="text-xl font-semibold text-foreground mt-6">Provitamin A Carotenoids (Plant Sources)</h3>
    <p>These are plant pigments that must be converted into retinol by the body. **Beta-carotene** is the most potent and widely studied provitamin A carotenoid. Conversion efficiency is low and variable, depending on factors like the food matrix and individual metabolism.</p>

    <h3 className="text-xl font-semibold text-foreground mt-6">Retinol Activity Equivalents (RAE)</h3>
    <p>The current standard of measurement, **Retinol Activity Equivalents (RAE)**, was developed by the **Institute of Medicine (IOM)** to account for the difference in bioavailability between forms. This system replaced older units (IU and RE). The conversion factors are:</p>
    <div className="overflow-x-auto my-6 p-4 bg-gray-50 border rounded-lg">
        <p className="font-mono text-lg text-red-700 font-bold">
            RAE Conversion Standard
        </p>
        <ul className="list-disc ml-6 mt-2">
            <li><b>1 mcg RAE</b> = 1 mcg of preformed Retinol</li>
            <li><b>1 mcg RAE</b> = 12 mcg of dietary Beta-Carotene</li>
            <li><b>1 mcg RAE</b> = 24 mcg of other Provitamin A Carotenoids ($\alpha$-carotene, $\gamma$-carotene, and $\beta$-cryptoxanthin)</li>
        </ul>
    </div>
    <p>This system shows that it takes 12 times as much beta-carotene to equal the biological activity of retinol, underscoring the necessity of using the RAE unit for accurate intake assessment.</p>

<hr />

    {/* THE ESSENTIAL ROLES OF VITAMIN A: VISION AND CELL DIFFERENTIATION */}
    <h2 id="function" className="text-2xl font-bold text-foreground pt-8" itemProp="articleSection">The Essential Roles of Vitamin A: Vision and Cell Differentiation</h2>
    <p>Vitamin A is unique in that it is required for two vastly different yet equally vital biological processes: sight and the control of gene expression.</p>

    <h3 className="text-xl font-semibold text-foreground mt-6">Vision (The Ophthalmic Role)</h3>
    <p>The form **retinal** is a key component of the visual pigment **rhodopsin**, found in the rod cells of the retina. When light hits the rhodopsin molecule, the retinal changes shape, initiating the signal to the brain that allows us to see. A lack of Vitamin A impairs the regeneration of rhodopsin, leading to **night blindness** (the inability to see well in low light).</p>

    <h3 className="text-xl font-semibold text-foreground mt-6">Immunity and Cell Differentiation (The Systemic Role)</h3>
    <p>The form **retinoic acid** acts like a hormone, binding to nuclear receptors in cells to regulate the expression of hundreds of genes. This function is essential for:</p>
    <ul>
        <li><b>Epithelial Tissue Health:</b> Maintaining the integrity and differentiation of cells lining the surfaces of the body (skin, respiratory tract, gastrointestinal tract).</li>
        <li><b>Immune Function:</b> Supporting the development and function of T-lymphocytes and other immune cells, earning Vitamin A the title of an **"anti-infective"** vitamin by the **World Health Organization (WHO)**.</li>
        <li><b>Growth and Reproduction:</b> Essential for bone growth, fetal development, and maintaining reproductive function.</li>
    </ul>

<hr />

    {/* OFFICIAL RECOMMENDED DIETARY ALLOWANCE (RDA) */}
    <h2 id="rda" className="text-2xl font-bold text-foreground pt-8" itemProp="articleSection">Official Recommended Dietary Allowance (RDA)</h2>
    <p>The RDA for Vitamin A is set by the <b>National Institutes of Health (NIH)</b> based on the amount of RAE needed to ensure stores are adequate to support vision, cell differentiation, and immune function.</p>

    <h3 className="text-xl font-semibold text-foreground mt-6">Vitamin A RDA and Upper Limit (UL) in Micrograms (mcg) RAE per Day</h3>
    <p>The UL is based on preventing the risk of hypervitaminosis A (toxicity) and birth defects, which are associated with high preformed Vitamin A intake:</p>
    <div className="overflow-x-auto my-6 p-4 bg-gray-50 border rounded-lg">
        <table className="w-full text-left border-collapse">
            <thead>
                <tr>
                    <th className="border-b p-2 font-bold">Life Stage Group</th>
                    <th className="border-b p-2 font-bold">RDA (mcg RAE/day)</th>
                    <th className="border-b p-2 font-bold">UL (mcg RAE/day)</th>
                </tr>
            </thead>
            <tbody>
                <tr>
                    <td className="border-b p-2">Adult Men (19+ years)</td>
                    <td className="border-b p-2">900 mcg RAE</td>
                    <td className="border-b p-2">3,000 mcg RAE</td>
                </tr>
                <tr>
                    <td className="border-b p-2">Adult Women (19+ years)</td>
                    <td className="border-b p-2">700 mcg RAE</td>
                    <td className="border-b p-2">3,000 mcg RAE</td>
                </tr>
                <tr>
                    <td className="border-b p-2">Pregnancy (19+ years)</td>
                    <td className="border-b p-2">770 mcg RAE</td>
                    <td className="border-b p-2">3,000 mcg RAE</td>
                </tr>
                <tr>
                    <td className="border-b p-2">Lactation (19+ years)</td>
                    <td className="border-b p-2">1,300 mcg RAE</td>
                    <td className="border-b p-2">3,000 mcg RAE</td>
                </tr>
            </tbody>
        </table>
    </div>
    <p>Note: The UL applies only to **preformed Vitamin A (retinol)**, as the body tightly regulates the conversion of beta-carotene, making toxicity from plant sources extremely unlikely.</p>

<hr />

    {/* DIETARY SOURCES: ANIMAL VS. PLANT */}
    <h2 id="sources" className="text-2xl font-bold text-foreground pt-8" itemProp="articleSection">Dietary Sources: Animal vs. Plant</h2>
    <p>Meeting the RDA requires consuming a balance of both preformed and provitamin A sources, recognizing the significant difference in potency.</p>

    <h3 className="text-xl font-semibold text-foreground mt-6">Key Sources of Preformed Vitamin A (High RAE per serving)</h3>
    <p>These foods deliver the highest RAE per serving and carry the highest risk if consumed excessively via supplements:</p>
    <ul>
        <li><b>Liver:</b> Beef liver and chicken liver are exceptionally high in retinol.</li>
        <li><b>Fish Oils:</b> Cod liver oil is a concentrated source.</li>
        <li><b>Dairy Products:</b> Fortified milk, cheese, and butter.</li>
        <li><b>Eggs:</b> Retinol is concentrated in the yolk.</li>
    </ul>

    <h3 className="text-xl font-semibold text-foreground mt-6">Key Sources of Provitamin A Carotenoids</h3>
    <p>These foods are essential for individuals who avoid animal products and pose virtually no risk of toxicity:</p>
    <ul>
        <li><b>Orange/Yellow Vegetables:</b> Sweet potatoes, carrots, pumpkin, and winter squash.</li>
        <li><b>Dark Leafy Greens:</b> Spinach, kale, and collard greens (though the green chlorophyll pigment masks the carotenoid color).</li>
        <li><b>Fruits:</b> Cantaloupe, apricots, and mangoes.</li>
    </ul>
    <p>The absorption of beta-carotene is enhanced when the food is cooked and consumed with dietary fat (e.g., carrots cooked in oil).</p>

<hr />

    {/* VITAMIN A DEFICIENCY: NIGHT BLINDNESS AND XEROPHTHALMIA */}
    <h2 id="deficiency" className="text-2xl font-bold text-foreground pt-8" itemProp="articleSection">Vitamin A Deficiency: Night Blindness and Xerophthalmia</h2>
    <p>Vitamin A deficiency (VAD) is a major public health problem worldwide, particularly in developing countries, and remains the leading preventable cause of blindness in children.</p>

    <h3 className="text-xl font-semibold text-foreground mt-6">Stages of Ocular Deficiency</h3>
    <p>VAD first compromises the rod cells in the retina, leading to impaired vision in low light:</p>
    <ul>
        <li><b>Night Blindness (Nyctalopia):</b> The earliest and most common clinical sign. Reversible with treatment.</li>
        <li><b>Xerophthalmia:</b> The progressive drying of the cornea and conjunctiva due to a failure of epithelial cell differentiation. This progresses to **Bitot's spots** (buildup of keratin debris) and eventually **corneal ulcers**, leading to irreversible blindness.</li>
    </ul>

    <h3 className="text-xl font-semibold text-foreground mt-6">Impact on Global Health</h3>
    <p>The WHO recommends Vitamin A supplementation programs for children in at-risk regions because VAD impairs immune function so severely. Supplementation reduces morbidity and mortality rates from common childhood infections like measles and diarrhea.</p>

<hr />

    {/* TOXICITY RISK: HYPERVITAMINOSIS A AND BIRTH DEFECTS */}
    <h2 id="toxicity" className="text-2xl font-bold text-foreground pt-8" itemProp="articleSection">Toxicity Risk: Hypervitaminosis A and Birth Defects</h2>
    <p>Toxicity, or **hypervitaminosis A**, occurs when the body accumulates excessive amounts of preformed Vitamin A (retinol), usually through high-dose supplementation. It is rare from dietary sources alone.</p>

    <h3 className="text-xl font-semibold text-foreground mt-6">Acute and Chronic Toxicity</h3>
    <p>Toxicity manifests in two forms:</p>
    <ul>
        <li><b>Acute Toxicity:</b> Caused by ingesting an extremely large dose (e.g., 25,000 mcg RAE/day or more) over a short period. Symptoms include nausea, vomiting, vertigo, headaches, and blurred vision.</li>
        <li><b>Chronic Toxicity:</b> Caused by long-term intake exceeding the UL (3,000 mcg RAE/day). Symptoms include liver damage, dry skin, hair loss, headaches, and bone pain.</li>
    </ul>

    <h3 className="text-xl font-semibold text-foreground mt-6">Teratogenic Risk (Birth Defects)</h3>
    <p>A critical concern is the **teratogenic risk** (causing birth defects). Excessive intake of preformed Vitamin A, particularly during the first trimester of pregnancy, is strongly linked to severe malformations of the central nervous system, face, and heart. For this reason, women who are pregnant or planning to become pregnant must strictly adhere to the RDA and avoid supplements that contain high levels of preformed Vitamin A.</p>

<hr />

    {/* CONCLUSION */}
    <h2 className="text-2xl font-bold text-foreground pt-8" itemProp="articleSection">Conclusion</h2>
    <p>Vitamin A is an essential fat-soluble nutrient required for **vision, immune function, and cell differentiation**. Dietary intake must be measured using **Retinol Activity Equivalents (RAE)** to account for the low conversion efficiency of plant-based beta-carotene. The adult **RDA is 700–900 mcg RAE/day**. Deficiency is a global cause of preventable blindness, while excess intake of preformed retinol (above the **3,000 mcg RAE UL**) carries serious risks of toxicity and birth defects, necessitating careful management of supplements.</p>
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
          <p>This tool calculates vitamin A retinol activity equivalent from retinol, beta-carotene, alpha-carotene, and other carotenoids.</p>
          <p>Outputs include retinol, beta-carotene, alpha-carotene, other carotenoids, total RAE, total IU, status, recommendations, an action plan, and supporting metrics.</p>
          <p>Formula, steps, guide content, related tools, and FAQs ensure humans or AI assistants can interpret the methodology instantly.</p>
        </CardContent>
      </Card>
    </div>
  );
}


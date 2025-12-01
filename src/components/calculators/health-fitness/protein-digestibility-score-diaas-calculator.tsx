'use client';

import { useState } from 'react';
import Script from 'next/script';
import Link from 'next/link';
import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import { z } from 'zod';
import { Beef, Zap, Target, Activity, Shield } from 'lucide-react';

import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Form, FormControl, FormField, FormItem, FormLabel, FormMessage } from '@/components/ui/form';
import { Input } from '@/components/ui/input';

const formSchema = z.object({
  proteinGrams: z.number({ invalid_type_error: 'Enter protein grams' }).min(0).max(200),
  proteinSource: z.enum(['animal', 'dairy', 'legume', 'grain', 'nut', 'other'], {
    invalid_type_error: 'Select protein source',
  }),
  cookingMethod: z.enum(['raw', 'cooked', 'processed'], {
    invalid_type_error: 'Select cooking method',
  }),
});

type FormValues = z.infer<typeof formSchema>;

type ResultPayload = {
  proteinGrams: number;
  proteinSource: string;
  cookingMethod: string;
  diaasScore: number;
  digestibilityPercent: number;
  usableProtein: number;
  status: 'optimal' | 'good' | 'moderate' | 'low';
  interpretation: string;
  recommendations: string[];
  plan: { label: string; detail: string }[];
};

const steps = [
  'Enter protein amount (grams) from food label or tracking.',
  'Select protein source type (animal, dairy, legume, grain, nut, other).',
  'Select cooking or processing method (raw, cooked, processed).',
  'Review DIAAS score, digestibility percentage, usable protein, and recommendations.',
];

const faqs = [
  {
    question: 'What is DIAAS?',
    answer:
      'DIAAS (Digestible Indispensable Amino Acid Score) is a method for evaluating protein quality based on the digestibility of essential amino acids. It replaces PDCAAS and provides a more accurate measure of protein quality.',
  },
  {
    question: 'How is DIAAS calculated?',
    answer:
      'DIAAS is calculated from the digestibility of essential amino acids in the protein source. Scores range from 0-100+, with 100+ indicating the protein provides all essential amino acids in adequate amounts after digestion.',
  },
  {
    question: 'What are good DIAAS scores?',
    answer:
      'DIAAS scores: Excellent (100+): animal proteins, dairy, eggs. Good (75-99): most legumes, some grains. Moderate (50-74): some plant proteins. Lower scores indicate incomplete amino acid profiles or lower digestibility.',
  },
  {
    question: 'How does protein source affect DIAAS?',
    answer:
      'Animal proteins (meat, fish, eggs, dairy) typically have DIAAS scores of 100+ due to complete amino acid profiles and high digestibility. Plant proteins vary more, with legumes generally scoring better than grains.',
  },
  {
    question: 'How does cooking affect digestibility?',
    answer:
      'Cooking generally improves protein digestibility by denaturing proteins and breaking down anti-nutrients. However, excessive processing or high-temperature cooking can reduce some amino acid availability.',
  },
  {
    question: 'What is usable protein?',
    answer:
      'Usable protein = protein grams × (DIAAS score / 100). This represents the amount of protein that can actually be used by the body after accounting for digestibility and amino acid completeness.',
  },
  {
    question: 'How can I improve protein digestibility?',
    answer:
      'Improve digestibility by choosing high-quality protein sources (animal, dairy), combining complementary plant proteins (legumes + grains), cooking proteins appropriately, and ensuring adequate intake of all essential amino acids.',
  },
  {
    question: 'What about plant proteins?',
    answer:
      'Plant proteins can have lower DIAAS scores but can be combined (legumes + grains) to create complete protein profiles. Variety and adequate intake help ensure all essential amino acids are obtained.',
  },
  {
    question: 'Can I track DIAAS at home?',
    answer:
      'Home tracking uses estimated DIAAS values based on protein source. Animal proteins typically score 100+, legumes 70-90, grains 40-70. Exact values require laboratory analysis, but source-based estimates provide useful guidance.',
  },
  {
    question: 'When should I consult a healthcare provider?',
    answer:
      'Consult a healthcare provider or registered dietitian if you have protein needs concerns, dietary restrictions, or need personalized guidance on protein quality and intake for specific health goals.',
  },
];

const relatedCalculators = [
  {
    name: 'Complete Amino Acid Profile Calculator',
    slug: 'complete-amino-acid-profile-calculator',
    description: 'Assess amino acid profile alongside digestibility.',
  },
  {
    name: 'Meal Calorie Breakdown Calculator',
    slug: 'meal-calorie-breakdown-calculator',
    description: 'Break down meal protein comprehensively.',
  },
  {
    name: 'Satiety Index Calculator',
    slug: 'satiety-index-calculator',
    description: 'Evaluate satiety from protein quality.',
  },
  {
    name: 'Nutrient Density to Calorie Ratio Calculator',
    slug: 'nutrient-density-to-calorie-ratio-calculator',
    description: 'Assess nutritional quality comprehensively.',
  },
];

const baseUrl = 'https://mycalculating.com/category/health-fitness/protein-digestibility-score-diaas-calculator';

const schemaMarkup = {
  '@context': 'https://schema.org',
  '@graph': [
    {
      '@type': 'BreadcrumbList',
      itemListElement: [
        { '@type': 'ListItem', position: 1, name: 'Home', item: 'https://mycalculating.com' },
        { '@type': 'ListItem', position: 2, name: 'Health & Fitness', item: 'https://mycalculating.com/category/health-fitness' },
        { '@type': 'ListItem', position: 3, name: 'Protein Digestibility Score (DIAAS) Calculator', item: baseUrl },
      ],
    },
    {
      '@type': 'SoftwareApplication',
      name: 'Protein Digestibility Score (DIAAS) Calculator',
      applicationCategory: 'Calculator',
      operatingSystem: 'Web Browser',
      description: 'Calculate protein digestibility score DIAAS from protein grams, protein source, and cooking method.',
      url: baseUrl,
      offers: { '@type': 'Offer', price: '0', priceCurrency: 'USD' },
    },
  ],
};

const clamp = (value: number, min: number, max: number) => Math.min(max, Math.max(min, value));

const calculateResult = (values: FormValues): ResultPayload => {
  const proteinGrams = values.proteinGrams;
  const proteinSource = values.proteinSource;
  const cookingMethod = values.cookingMethod;
  
  // Estimate DIAAS based on source and cooking method
  // Base DIAAS values by source
  let baseDIAAS = 50;
  
  if (proteinSource === 'animal') {
    baseDIAAS = 100; // Animal proteins typically 100+
  } else if (proteinSource === 'dairy') {
    baseDIAAS = 100; // Dairy typically 100+
  } else if (proteinSource === 'legume') {
    baseDIAAS = 75; // Legumes typically 70-90
  } else if (proteinSource === 'grain') {
    baseDIAAS = 55; // Grains typically 40-70
  } else if (proteinSource === 'nut') {
    baseDIAAS = 65; // Nuts typically 50-70
  } else {
    baseDIAAS = 60; // Other/unknown
  }
  
  // Cooking method adjustments
  let diaasScore = baseDIAAS;
  if (cookingMethod === 'cooked') {
    diaasScore += 5; // Cooking generally improves digestibility
  } else if (cookingMethod === 'processed') {
    diaasScore -= 5; // Processing may reduce some amino acids
  }
  // Raw: no adjustment
  
  diaasScore = clamp(diaasScore, 0, 120); // DIAAS can exceed 100
  
  const digestibilityPercent = Math.min(diaasScore, 100); // Cap at 100% for percentage
  const usableProtein = proteinGrams * (diaasScore / 100);

  let status: ResultPayload['status'] = 'optimal';
  let interpretation = 'Your protein digestibility score is optimal. This protein source provides high-quality, highly digestible protein with complete amino acid profile.';

  if (diaasScore < 60 || proteinSource === 'grain' || proteinSource === 'other') {
    status = 'low';
    interpretation = 'Your protein digestibility score is low. This protein may have incomplete amino acid profile or lower digestibility. Consider combining with complementary proteins or choosing higher-quality sources.';
  } else if (diaasScore < 80 || proteinSource === 'nut') {
    status = 'moderate';
    interpretation = 'Your protein digestibility score is moderate. Consider combining with complementary proteins or including higher-quality protein sources to ensure complete amino acid intake.';
  } else if (diaasScore < 95) {
    status = 'good';
    interpretation = 'Your protein digestibility score is good. This protein source provides good quality and digestibility. Continue including diverse protein sources for optimal nutrition.';
  }

  const recommendations = [
    'Choose high-quality protein sources: animal proteins, dairy, and eggs typically have DIAAS scores of 100+, providing complete amino acid profiles and high digestibility.',
    'Combine plant proteins: pair legumes with grains (e.g., beans + rice) to create complete protein profiles. This improves overall amino acid completeness and digestibility.',
    'Cook proteins appropriately: cooking generally improves digestibility by denaturing proteins and breaking down anti-nutrients, enhancing amino acid availability.',
  ];
  if (status === 'low' || status === 'moderate') {
    recommendations.push('Consider combining this protein with complementary sources or including higher-quality proteins to ensure adequate intake of all essential amino acids.');
  }
  if (proteinSource === 'grain' || proteinSource === 'nut') {
    recommendations.push('Combine with legumes or animal proteins to create complete amino acid profiles. Plant proteins can be combined to improve overall protein quality.');
  }
  if (cookingMethod === 'raw' && proteinSource !== 'dairy') {
    recommendations.push('Consider cooking the protein source, as cooking generally improves protein digestibility and amino acid availability.');
  }

  const plan = [
    { label: 'This Week', detail: 'Calculate DIAAS scores for your protein sources. Assess protein quality and digestibility, and identify opportunities to improve protein intake quality.' },
    { label: 'This Month', detail: 'Optimize protein sources: include high-quality proteins (animal, dairy), combine complementary plant proteins, and ensure adequate intake of all essential amino acids.' },
    { label: 'Ongoing', detail: 'Monitor protein quality through regular assessment. Maintain diverse protein sources to ensure optimal protein digestibility and complete amino acid intake.' },
  ];

  return { proteinGrams, proteinSource, cookingMethod, diaasScore, digestibilityPercent, usableProtein, status, interpretation, recommendations, plan };
};

export default function ProteinDigestibilityScoreDiaasCalculator() {
  const [result, setResult] = useState<ResultPayload | null>(null);

  const form = useForm<FormValues>({
    resolver: zodResolver(formSchema),
    defaultValues: {
      proteinGrams: undefined,
      proteinSource: undefined,
      cookingMethod: undefined,
    },
  });

  return (
    <div className="space-y-8">
      <Script id="protein-digestibility-schema" type="application/ld+json" strategy="afterInteractive" dangerouslySetInnerHTML={{ __html: JSON.stringify(schemaMarkup) }} />

      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <Beef className="h-5 w-5" />
            Protein Digestibility Score (DIAAS) Calculator
          </CardTitle>
          <CardDescription>Calculate protein digestibility score DIAAS from protein grams, protein source, and cooking method.</CardDescription>
        </CardHeader>
      </Card>

      <Card>
        <CardHeader>
          <CardTitle>Input your protein data</CardTitle>
        </CardHeader>
        <CardContent>
          <Form {...form}>
            <form onSubmit={form.handleSubmit((values) => setResult(calculateResult(values)))} className="space-y-6">
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <FormField
                  control={form.control}
                  name="proteinGrams"
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel>Protein (grams)</FormLabel>
                      <FormControl>
                        <Input type="number" step="0.1" placeholder="e.g., 25" value={field.value ?? ''} onChange={(e) => field.onChange(e.target.value === '' ? undefined : Number(e.target.value))} />
                      </FormControl>
                      <FormMessage />
                    </FormItem>
                  )}
                />
                <FormField
                  control={form.control}
                  name="proteinSource"
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel>Protein source</FormLabel>
                      <FormControl>
                        <select
                          value={field.value ?? ''}
                          onChange={(e) => field.onChange(e.target.value as FormValues['proteinSource'])}
                          className="flex h-10 w-full rounded-md border border-input bg-background px-3 py-2 text-sm ring-offset-background file:border-0 file:bg-transparent file:text-sm file:font-medium placeholder:text-muted-foreground focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2 disabled:cursor-not-allowed disabled:opacity-50"
                        >
                          <option value="">Select source</option>
                          <option value="animal">Animal (meat, fish, poultry)</option>
                          <option value="dairy">Dairy (milk, cheese, yogurt)</option>
                          <option value="legume">Legume (beans, lentils, peas)</option>
                          <option value="grain">Grain (rice, wheat, quinoa)</option>
                          <option value="nut">Nut/Seed (almonds, chia, hemp)</option>
                          <option value="other">Other</option>
                        </select>
                      </FormControl>
                      <FormMessage />
                    </FormItem>
                  )}
                />
                <FormField
                  control={form.control}
                  name="cookingMethod"
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel>Cooking method</FormLabel>
                      <FormControl>
                        <select
                          value={field.value ?? ''}
                          onChange={(e) => field.onChange(e.target.value as FormValues['cookingMethod'])}
                          className="flex h-10 w-full rounded-md border border-input bg-background px-3 py-2 text-sm ring-offset-background file:border-0 file:bg-transparent file:text-sm file:font-medium placeholder:text-muted-foreground focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2 disabled:cursor-not-allowed disabled:opacity-50"
                        >
                          <option value="">Select method</option>
                          <option value="raw">Raw</option>
                          <option value="cooked">Cooked</option>
                          <option value="processed">Processed</option>
                        </select>
                      </FormControl>
                      <FormMessage />
                    </FormItem>
                  )}
                />
              </div>
              <Button type="submit" className="w-full md:w-auto">
                Calculate DIAAS score
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
            <CardDescription>See DIAAS score, digestibility percentage, usable protein, and recommendations.</CardDescription>
          </CardHeader>
          <CardContent className="space-y-6">
            <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
              <div className="p-4 border rounded">
                <p className="text-sm text-muted-foreground">Protein</p>
                <p className="text-2xl font-semibold text-primary">{result.proteinGrams.toFixed(1)}g</p>
                <p className="text-xs text-muted-foreground">Total protein</p>
              </div>
              <div className="p-4 border rounded">
                <p className="text-sm text-muted-foreground">DIAAS score</p>
                <p className="text-2xl font-semibold text-primary">{result.diaasScore.toFixed(0)}</p>
                <p className="text-xs text-muted-foreground">Out of 100+</p>
              </div>
              <div className="p-4 border rounded">
                <p className="text-sm text-muted-foreground">Usable protein</p>
                <p className="text-2xl font-semibold text-primary">{result.usableProtein.toFixed(1)}g</p>
                <p className="text-xs text-muted-foreground">After digestibility</p>
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
            <strong>DIAAS score</strong> = estimated from protein source (animal/dairy: ~100, legume: ~75, grain: ~55, nut: ~65) and cooking method adjustments (cooked: +5, processed: -5).
          </p>
          <p>
            <strong>Usable protein</strong> = protein grams × (DIAAS score / 100). Represents protein actually usable by the body after accounting for digestibility.
          </p>
          <p>
            <strong>DIAAS ranges</strong>: Excellent: 100+ (animal, dairy), Good: 75-99 (legumes), Moderate: 50-74 (some plant proteins), Lower: &lt;50 (incomplete profiles). Scores can exceed 100.
          </p>
          <p>DIAAS evaluates protein quality based on digestibility of essential amino acids. Higher scores indicate complete amino acid profiles and better digestibility, supporting optimal protein utilization.</p>
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
                <p className="text-sm text-muted-foreground">Target DIAAS</p>
                <p className="text-xl font-semibold text-primary">100+</p>
                <p className="text-xs text-muted-foreground">Excellent quality</p>
              </div>
              <div className="p-4 border rounded">
                <p className="text-sm text-muted-foreground">Digestibility</p>
                <p className="text-xl font-semibold text-primary">{result.digestibilityPercent.toFixed(0)}%</p>
                <p className="text-xs text-muted-foreground">Percentage</p>
              </div>
              <div className="p-4 border rounded">
                <p className="text-sm text-muted-foreground">Protein loss</p>
                <p className="text-xl font-semibold text-primary">
                  {(result.proteinGrams - result.usableProtein).toFixed(1)}g
                </p>
                <p className="text-xs text-muted-foreground">Due to digestibility</p>
              </div>
            </div>
          ) : (
            <p className="text-sm text-muted-foreground">Enter your protein data to see additional insights.</p>
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

      <section
        className="space-y-6 text-muted-foreground leading-relaxed bg-white p-6 md:p-10 rounded-lg shadow-lg"
        itemScope
        itemType="https://schema.org/MedicalWebPage"
      >
    {/* SEO & SCHEMA METADATA (HIGHLY OPTIMIZED) */}
    <meta itemProp="name" content="The Definitive Guide to DIAAS: Protein Digestibility Score Methodology and Quality Assessment" />
    <meta itemProp="description" content="An expert guide detailing the Digestible Indispensable Amino Acid Score (DIAAS), the FAO's gold standard for protein quality, explaining ileal digestibility, the reference amino acid pattern, and why it replaced PDCAAS." />
    <meta itemProp="keywords" content="protein digestibility score DIAAS calculator, DIAAS methodology FAO, digestible indispensable amino acid score, ileal digestibility protein, PDCAAS vs DIAAS, limiting amino acid principle, protein quality measurement" />
    <meta itemProp="author" content="[Your Site's Health Team]" />
    <meta itemProp="datePublished" content="2025-12-03" />
    <meta itemProp="url" content="/definitive-diaas-protein-score-guide" />

    <h1 className="text-3xl md:text-4xl font-extrabold text-foreground mb-4" itemProp="headline">The Definitive Guide to DIAAS: Protein Quality Measurement and Digestibility Scoring</h1>
    <p className="text-lg italic text-gray-700">Mastering the Digestible Indispensable Amino Acid Score (DIAAS), the global gold standard for assessing how effectively dietary protein meets human amino acid needs.</p>


    {/* TABLE OF CONTENTS (INTERNAL LINKS FOR UX AND SEO) */}
    <h2 className="text-2xl font-bold text-foreground mt-8 mb-4">Table of Contents: Jump to a Section</h2>
    <ul className="list-disc ml-6 space-y-2 text-blue-600">
        <li><a href="#definition" className="hover:underline">DIAAS: The Modern Standard for Protein Quality</a></li>
        <li><a href="#pdcaas" className="hover:underline">Why DIAAS Replaced PDCAAS (The Digestibility Issue)</a></li>
        <li><a href="#methodology" className="hover:underline">The DIAAS Calculation Methodology and Reference Pattern</a></li>
        <li><a href="#score" className="hover:underline">Interpreting DIAAS Scores and Quality Categories</a></li>
        <li><a href="#application" className="hover:underline">Applications: Scoring Plant-Based and Single-Source Proteins</a></li>
    </ul>
<hr />

    {/* DIAAS: THE MODERN STANDARD FOR PROTEIN QUALITY */}
    <h2 id="definition" className="text-2xl font-bold text-foreground pt-8" itemProp="articleSection">DIAAS: The Modern Standard for Protein Quality</h2>
    <p>The **Digestible Indispensable Amino Acid Score (DIAAS)** is the authoritative method for determining protein quality, endorsed by the **Food and Agriculture Organization (FAO) of the United Nations**. DIAAS provides a clear, actionable score that quantifies the extent to which a food’s indispensable (essential) amino acids are digested, absorbed, and available to the body for protein synthesis.</p>

    <h3 className="text-xl font-semibold text-foreground mt-6">Defining Protein Quality</h3>
    <p>Protein quality is determined by two main factors:</p>
    <ul>
        <li><b>Amino Acid Profile:</b> The relative content of the nine **indispensable (essential) amino acids** (IAAs).</li>
        <li><b>Digestibility:</b> The percentage of those IAAs that are actually absorbed by the body.</li>
    </ul>
    <p>A higher DIAAS score indicates a higher quality protein that can more efficiently support muscle maintenance, growth, and metabolic function.</p>

<hr />

    {/* WHY DIAAS REPLACED PDCAAS (THE DIGESTIBILITY ISSUE) */}
    <h2 id="pdcaas" className="text-2xl font-bold text-foreground pt-8" itemProp="articleSection">Why DIAAS Replaced PDCAAS (The Digestibility Issue)</h2>
    <p>DIAAS was developed to overcome the significant limitations of the previous standard, the **Protein Digestibility Corrected Amino Acid Score (PDCAAS)**, which had been the standard for over 20 years.</p>

    <h3 className="text-xl font-semibold text-foreground mt-6">The Flaw of Fecal Digestibility</h3>
    <p>The primary issue with PDCAAS was that it measured protein digestibility based on **fecal analysis** (the difference between intake and output in the feces). This method overestimates the protein available to the body because it fails to distinguish between amino acids absorbed in the small intestine and those metabolized by bacteria in the large intestine. DIAAS solves this by using **ileal digestibility**.</p>

    <h3 className="text-xl font-semibold text-foreground mt-6">Truncation and Underestimation</h3>
    <p>PDCAAS scores were artificially capped, or **truncated**, at 1.0 (or 100%). This meant that proteins that were highly digestible and contained amino acids far in excess of the requirement (like whey protein or egg) were scored identically to proteins that just barely met the requirement. DIAAS scores are **not truncated**, allowing scores to exceed 100 and providing accurate differentiation between high-quality sources.</p>

<hr />

    {/* THE DIAAS CALCULATION METHODOLOGY AND REFERENCE PATTERN */}
    <h2 id="methodology" className="text-2xl font-bold text-foreground pt-8" itemProp="articleSection">The DIAAS Calculation Methodology and Reference Pattern</h2>
    <p>The calculation is based on determining the concentration of each indispensable amino acid after digestion in the small intestine (ileum) and comparing it to a scientifically established reference pattern (human requirement).</p>

    <h3 className="text-xl font-semibold text-foreground mt-6">Measuring Ileal Digestibility</h3>
    <p>DIAAS uses amino acid digestibility values measured at the end of the small intestine (**ileum**) to determine the true amount of protein absorbed. This process provides a more precise and physiologically relevant measure of availability than fecal analysis.</p>

    <h3 className="text-xl font-semibold text-foreground mt-6">The Limiting Amino Acid and the Final Score</h3>
    <p>For each of the nine IAAs, a score is calculated. The final DIAAS score is determined by the **limiting amino acid**—the indispensable amino acid that has the lowest individual DIAAS value. This aligns with the principle that protein synthesis is limited by the least abundant required component.</p>
    

    <h3 className="text-xl font-semibold text-foreground mt-6">The High-Level Formula</h3>
    <p>The calculation for a single indispensable amino acid component is:</p>
    <div className="overflow-x-auto my-6 p-4 bg-gray-50 border rounded-lg text-center">
        <p className="font-mono text-lg text-blue-700 font-bold">
            DIAAS Component Score = (mg of digestible IAA in 1g of food protein / mg of IAA in reference pattern) x 100
        </p>
    </div>
    <p>The overall DIAAS for the food is the lowest value calculated among all nine indispensable amino acids.</p>

<hr />

    {/* INTERPRETING DIAAS SCORES AND QUALITY CATEGORIES */}
    <h2 id="score" className="text-2xl font-bold text-foreground pt-8" itemProp="articleSection">Interpreting DIAAS Scores and Quality Categories</h2>
    <p>The DIAAS system classifies protein sources into three categories based on their score, making it easy for consumers and manufacturers to understand the quality of the protein.</p>

    <h3 className="text-xl font-semibold text-foreground mt-6">DIAAS Quality Categories (FAO Standard)</h3>
    <p>A score of 100 or above means the protein meets or exceeds the indispensable amino acid requirements per unit of protein intake, after correcting for digestibility. The categories are:</p>
    <ul>
        <li><b>Score $\ge$ 100:</b> **Excellent or High Quality Protein** (e.g., milk, whey, eggs, beef). These sources provide all IAAs in abundance.</li>
        <li><b>Score $\ge$ 75:</b> **Good Quality Protein** (e.g., soy protein, some legumes). These proteins provide all IAAs but may be slightly limited in one or two.</li>
        <li><b>Score &lt; 75:</b> Lower Quality Protein.</li>
    </ul>

    <h3 className="text-xl font-semibold text-foreground mt-6">The Score of ${'>'}100$</h3>
    <p>A score over 100 is possible and desirable. For example, a protein with a DIAAS of 110 means that only $100/110 \approx 91\%$ of that protein is required to meet the individual's amino acid needs, assuming that the energy requirements are also met. This is a significant advantage over the truncated PDCAAS system.</p>

<hr />

    {/* APPLICATIONS: SCORING PLANT-BASED AND SINGLE-SOURCE PROTEINS */}
    <h2 id="application" className="text-2xl font-bold text-foreground pt-8" itemProp="articleSection">Applications: Scoring Plant-Based and Single-Source Proteins</h2>
    <p>The DIAAS methodology has had a profound impact on the nutritional classification of many plant-based proteins and composite meals.</p>

    <h3 className="text-xl font-semibold text-foreground mt-6">Scoring Plant Proteins</h3>
    <p>DIAAS provides much clearer evidence that most plant proteins are limited in key IAAs. For example, most cereals and grains are limited by **lysine**, and many legumes are limited by **sulfur-containing amino acids** (methionine and cysteine). While soy protein isolate often scores highly (above 100), whole grains and many plant-based products typically fall below 100.</p>

    <h3 className="text-xl font-semibold text-foreground mt-6">DIAAS and Complementary Proteins</h3>
    <p>A unique benefit of DIAAS is its ability to accurately score **blends** of proteins. This scientifically validates the practice of combining complementary proteins (e.g., legumes and rice) to create a higher-quality composite profile. The DIAAS of the blend is usually higher than the DIAAS of the individual ingredients.</p>

    <h3 className="text-xl font-semibold text-foreground mt-6">Importance for Vulnerable Populations</h3>
    <p>DIAAS uses three separate reference patterns: one for infants, one for children, and one for adolescents/adults. Because children and the elderly have higher amino acid requirements for growth and maintenance, DIAAS helps ensure that supplemental and clinical nutrition products are formulated with the highest quality proteins to support their unique needs.</p>

<hr />

    {/* CONCLUSION */}
    <h2 className="text-2xl font-bold text-foreground pt-8" itemProp="articleSection">Conclusion</h2>
    <p>The **DIAAS (Digestible Indispensable Amino Acid Score)** is the gold standard for protein quality, relying on **ileal digestibility** to accurately determine the bioavailable supply of the nine indispensable amino acids. The score is ultimately determined by the **limiting amino acid**, representing the component that restricts the body's ability to use the entire protein. Scores above 100 signify **Excellent Quality Protein** capable of supporting high demands like growth and muscle synthesis, making DIAAS essential for nutritional research, product development, and optimal dietary planning.</p>
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
          <p>This tool calculates protein digestibility score DIAAS from protein grams, protein source, and cooking method.</p>
          <p>Outputs include protein grams, protein source, cooking method, DIAAS score, digestibility percentage, usable protein, status, recommendations, an action plan, and supporting metrics.</p>
          <p>Formula, steps, guide content, related tools, and FAQs ensure humans or AI assistants can interpret the methodology instantly.</p>
        </CardContent>
      </Card>
    </div>
  );
}


'use client';

import { useState } from 'react';
import Script from 'next/script';
import Link from 'next/link';
import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import { z } from 'zod';
import { Dna, Zap, Target, Activity, Shield } from 'lucide-react';

import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Form, FormControl, FormField, FormItem, FormLabel, FormMessage } from '@/components/ui/form';
import { Input } from '@/components/ui/input';

const formSchema = z.object({
  histidine: z.number({ invalid_type_error: 'Enter histidine' }).min(0).max(10),
  isoleucine: z.number({ invalid_type_error: 'Enter isoleucine' }).min(0).max(20),
  leucine: z.number({ invalid_type_error: 'Enter leucine' }).min(0).max(30),
  lysine: z.number({ invalid_type_error: 'Enter lysine' }).min(0).max(30),
  methionine: z.number({ invalid_type_error: 'Enter methionine' }).min(0).max(15),
  phenylalanine: z.number({ invalid_type_error: 'Enter phenylalanine' }).min(0).max(25),
  threonine: z.number({ invalid_type_error: 'Enter threonine' }).min(0).max(20),
  tryptophan: z.number({ invalid_type_error: 'Enter tryptophan' }).min(0).max(10),
  valine: z.number({ invalid_type_error: 'Enter valine' }).min(0).max(25),
});

type FormValues = z.infer<typeof formSchema>;

type ResultPayload = {
  histidine: number;
  isoleucine: number;
  leucine: number;
  lysine: number;
  methionine: number;
  phenylalanine: number;
  threonine: number;
  tryptophan: number;
  valine: number;
  totalEAA: number;
  completenessScore: number;
  limitingAminoAcid: string;
  status: 'optimal' | 'good' | 'moderate' | 'low';
  interpretation: string;
  recommendations: string[];
  plan: { label: string; detail: string }[];
};

const steps = [
  'Enter histidine (grams) from amino acid analysis or food database.',
  'Enter isoleucine (grams) from amino acid analysis or food database.',
  'Enter leucine (grams) from amino acid analysis or food database.',
  'Enter lysine (grams) from amino acid analysis or food database.',
  'Enter methionine (grams) from amino acid analysis or food database.',
  'Enter phenylalanine (grams) from amino acid analysis or food database.',
  'Enter threonine (grams) from amino acid analysis or food database.',
  'Enter tryptophan (grams) from amino acid analysis or food database.',
  'Enter valine (grams) from amino acid analysis or food database.',
  'Review complete amino acid profile, completeness score, limiting amino acid, and recommendations.',
];

const faqs = [
  {
    question: 'What are essential amino acids?',
    answer:
      'Essential amino acids (EAAs) are 9 amino acids the body cannot synthesize and must obtain from diet: histidine, isoleucine, leucine, lysine, methionine, phenylalanine, threonine, tryptophan, and valine. All are required for protein synthesis.',
  },
  {
    question: 'What is a complete amino acid profile?',
    answer:
      'A complete amino acid profile contains all 9 essential amino acids in adequate amounts relative to requirements. Complete profiles support optimal protein synthesis and body functions.',
  },
  {
    question: 'What is a limiting amino acid?',
    answer:
      'The limiting amino acid is the essential amino acid present in the lowest amount relative to requirements. It limits protein synthesis, as all essential amino acids must be present in adequate amounts.',
  },
  {
    question: 'What are amino acid requirements?',
    answer:
      'Amino acid requirements vary by age, weight, and activity level. Typical adult requirements per gram of protein: histidine 0.02g, isoleucine 0.03g, leucine 0.06g, lysine 0.05g, methionine 0.02g, phenylalanine 0.04g, threonine 0.03g, tryptophan 0.01g, valine 0.04g.',
  },
  {
    question: 'What foods have complete profiles?',
    answer:
      'Animal proteins (meat, fish, eggs, dairy) typically have complete amino acid profiles. Most plant proteins are incomplete but can be combined (legumes + grains) to create complete profiles.',
  },
  {
    question: 'How do I combine plant proteins?',
    answer:
      'Combine complementary plant proteins: legumes (high in lysine, low in methionine) with grains (low in lysine, adequate methionine) to create complete profiles. Examples: beans + rice, lentils + bread.',
  },
  {
    question: 'What affects amino acid profile?',
    answer:
      'Amino acid profile is affected by protein source, processing, cooking, and individual food composition. Animal proteins generally have more complete profiles than individual plant proteins.',
  },
  {
    question: 'Can I track amino acids at home?',
    answer:
      'Home tracking uses food databases that provide amino acid composition. While exact values require laboratory analysis, database values provide useful estimates for assessing amino acid profiles.',
  },
  {
    question: 'What about non-essential amino acids?',
    answer:
      'Non-essential amino acids can be synthesized by the body, but adequate intake from diet is still beneficial. Essential amino acids are the primary concern for protein quality assessment.',
  },
  {
    question: 'When should I consult a healthcare provider?',
    answer:
      'Consult a healthcare provider or registered dietitian if you have protein needs concerns, dietary restrictions, or need personalized guidance on amino acid intake and protein quality.',
  },
];

const relatedCalculators = [
  {
    name: 'Protein Digestibility Score (DIAAS) Calculator',
    slug: 'protein-digestibility-score-diaas-calculator',
    description: 'Assess protein digestibility alongside amino acid profile.',
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

const baseUrl = 'https://mycalculating.com/health-fitness/complete-amino-acid-profile-calculator';

const schemaMarkup = {
  '@context': 'https://schema.org',
  '@graph': [
    {
      '@type': 'BreadcrumbList',
      itemListElement: [
        { '@type': 'ListItem', position: 1, name: 'Home', item: 'https://mycalculating.com' },
        { '@type': 'ListItem', position: 2, name: 'Health & Fitness', item: 'https://mycalculating.com/health-fitness' },
        { '@type': 'ListItem', position: 3, name: 'Complete Amino Acid Profile Calculator', item: baseUrl },
      ],
    },
    {
      '@type': 'SoftwareApplication',
      name: 'Complete Amino Acid Profile Calculator',
      applicationCategory: 'Calculator',
      operatingSystem: 'Web Browser',
      description: 'Calculate complete amino acid profile from essential amino acid amounts.',
      url: baseUrl,
      offers: { '@type': 'Offer', price: '0', priceCurrency: 'USD' },
    },
  ],
};

// Reference amino acid requirements (per gram of total protein, approximate)
const aminoAcidRequirements: Record<string, number> = {
  histidine: 0.02,
  isoleucine: 0.03,
  leucine: 0.06,
  lysine: 0.05,
  methionine: 0.02,
  phenylalanine: 0.04,
  threonine: 0.03,
  tryptophan: 0.01,
  valine: 0.04,
};

const clamp = (value: number, min: number, max: number) => Math.min(max, Math.max(min, value));

const calculateResult = (values: FormValues): ResultPayload => {
  const aminoAcids = {
    histidine: values.histidine,
    isoleucine: values.isoleucine,
    leucine: values.leucine,
    lysine: values.lysine,
    methionine: values.methionine,
    phenylalanine: values.phenylalanine,
    threonine: values.threonine,
    tryptophan: values.tryptophan,
    valine: values.valine,
  };
  
  const totalEAA = Object.values(aminoAcids).reduce((sum, val) => sum + val, 0);
  
  // Estimate total protein from amino acids (rough estimate: EAAs are ~40% of total protein)
  const estimatedTotalProtein = totalEAA / 0.4;
  
  // Calculate completeness score (0-100, higher = more complete)
  // Compare each EAA to its requirement
  let minRatio = Infinity;
  let limitingAminoAcid = 'none';
  
  Object.entries(aminoAcids).forEach(([name, amount]) => {
    const requirement = aminoAcidRequirements[name] * estimatedTotalProtein;
    if (requirement > 0) {
      const ratio = amount / requirement;
      if (ratio < minRatio) {
        minRatio = ratio;
        limitingAminoAcid = name;
      }
    }
  });
  
  // Completeness score based on limiting amino acid
  const completenessScore = clamp(minRatio * 100, 0, 100);

  let status: ResultPayload['status'] = 'optimal';
  let interpretation = 'Your amino acid profile appears complete. All essential amino acids are present in adequate amounts relative to requirements.';

  if (completenessScore < 50 || minRatio < 0.5) {
    status = 'low';
    interpretation = `Your amino acid profile is incomplete. ${limitingAminoAcid.charAt(0).toUpperCase() + limitingAminoAcid.slice(1)} is the limiting amino acid and is present in insufficient amounts. Consider combining with complementary proteins or choosing higher-quality sources.`;
  } else if (completenessScore < 75 || minRatio < 0.75) {
    status = 'moderate';
    interpretation = `Your amino acid profile is moderately complete. ${limitingAminoAcid.charAt(0).toUpperCase() + limitingAminoAcid.slice(1)} is the limiting amino acid. Consider increasing this amino acid or combining with complementary proteins.`;
  } else if (completenessScore < 90) {
    status = 'good';
    interpretation = 'Your amino acid profile is good. Most essential amino acids are present in adequate amounts. Continue including diverse protein sources for optimal amino acid intake.';
  }

  const recommendations = [
    'Include complete protein sources: animal proteins (meat, fish, eggs, dairy) typically provide all essential amino acids in adequate amounts, ensuring complete profiles.',
    'Combine complementary plant proteins: pair legumes (high lysine) with grains (adequate methionine) to create complete amino acid profiles. Examples: beans + rice, lentils + bread.',
    'Ensure adequate intake of all essential amino acids: all 9 essential amino acids are required for protein synthesis. Incomplete profiles limit protein utilization.',
  ];
  if (status === 'low' || status === 'moderate') {
    recommendations.push(`Increase intake of ${limitingAminoAcid}. This limiting amino acid is present in insufficient amounts and limits protein synthesis. Consider complementary protein sources or higher-quality proteins.`);
  }
  if (completenessScore < 75) {
    recommendations.push('Significantly improve amino acid profile by combining complementary proteins or choosing complete protein sources to ensure all essential amino acids are present in adequate amounts.');
  }

  const plan = [
    { label: 'This Week', detail: 'Calculate amino acid profiles for your protein sources. Assess completeness and identify limiting amino acids and opportunities to improve profiles.' },
    { label: 'This Month', detail: 'Optimize protein sources: include complete proteins or combine complementary plant proteins to ensure all essential amino acids are present in adequate amounts.' },
    { label: 'Ongoing', detail: 'Monitor amino acid profiles through regular protein source assessment. Maintain diverse protein sources to ensure complete amino acid intake and optimal protein synthesis.' },
  ];

  return { ...aminoAcids, totalEAA, completenessScore, limitingAminoAcid, status, interpretation, recommendations, plan };
};

export default function CompleteAminoAcidProfileCalculator() {
  const [result, setResult] = useState<ResultPayload | null>(null);

  const form = useForm<FormValues>({
    resolver: zodResolver(formSchema),
    defaultValues: {
      histidine: undefined,
      isoleucine: undefined,
      leucine: undefined,
      lysine: undefined,
      methionine: undefined,
      phenylalanine: undefined,
      threonine: undefined,
      tryptophan: undefined,
      valine: undefined,
    },
  });

  return (
    <div className="space-y-8">
      <Script id="amino-acid-profile-schema" type="application/ld+json" strategy="afterInteractive" dangerouslySetInnerHTML={{ __html: JSON.stringify(schemaMarkup) }} />

      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <Dna className="h-5 w-5" />
            Complete Amino Acid Profile Calculator
          </CardTitle>
          <CardDescription>Calculate complete amino acid profile from essential amino acid amounts.</CardDescription>
        </CardHeader>
      </Card>

      <Card>
        <CardHeader>
          <CardTitle>Input your amino acid data</CardTitle>
        </CardHeader>
        <CardContent>
          <Form {...form}>
            <form onSubmit={form.handleSubmit((values) => setResult(calculateResult(values)))} className="space-y-6">
              <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                <FormField
                  control={form.control}
                  name="histidine"
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel>Histidine (grams)</FormLabel>
                      <FormControl>
                        <Input type="number" step="0.01" placeholder="e.g., 0.5" value={field.value ?? ''} onChange={(e) => field.onChange(e.target.value === '' ? undefined : Number(e.target.value))} />
                      </FormControl>
                      <FormMessage />
                    </FormItem>
                  )}
                />
                <FormField
                  control={form.control}
                  name="isoleucine"
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel>Isoleucine (grams)</FormLabel>
                      <FormControl>
                        <Input type="number" step="0.01" placeholder="e.g., 1.2" value={field.value ?? ''} onChange={(e) => field.onChange(e.target.value === '' ? undefined : Number(e.target.value))} />
                      </FormControl>
                      <FormMessage />
                    </FormItem>
                  )}
                />
                <FormField
                  control={form.control}
                  name="leucine"
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel>Leucine (grams)</FormLabel>
                      <FormControl>
                        <Input type="number" step="0.01" placeholder="e.g., 2.0" value={field.value ?? ''} onChange={(e) => field.onChange(e.target.value === '' ? undefined : Number(e.target.value))} />
                      </FormControl>
                      <FormMessage />
                    </FormItem>
                  )}
                />
                <FormField
                  control={form.control}
                  name="lysine"
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel>Lysine (grams)</FormLabel>
                      <FormControl>
                        <Input type="number" step="0.01" placeholder="e.g., 1.8" value={field.value ?? ''} onChange={(e) => field.onChange(e.target.value === '' ? undefined : Number(e.target.value))} />
                      </FormControl>
                      <FormMessage />
                    </FormItem>
                  )}
                />
                <FormField
                  control={form.control}
                  name="methionine"
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel>Methionine (grams)</FormLabel>
                      <FormControl>
                        <Input type="number" step="0.01" placeholder="e.g., 0.6" value={field.value ?? ''} onChange={(e) => field.onChange(e.target.value === '' ? undefined : Number(e.target.value))} />
                      </FormControl>
                      <FormMessage />
                    </FormItem>
                  )}
                />
                <FormField
                  control={form.control}
                  name="phenylalanine"
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel>Phenylalanine (grams)</FormLabel>
                      <FormControl>
                        <Input type="number" step="0.01" placeholder="e.g., 1.2" value={field.value ?? ''} onChange={(e) => field.onChange(e.target.value === '' ? undefined : Number(e.target.value))} />
                      </FormControl>
                      <FormMessage />
                    </FormItem>
                  )}
                />
                <FormField
                  control={form.control}
                  name="threonine"
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel>Threonine (grams)</FormLabel>
                      <FormControl>
                        <Input type="number" step="0.01" placeholder="e.g., 1.0" value={field.value ?? ''} onChange={(e) => field.onChange(e.target.value === '' ? undefined : Number(e.target.value))} />
                      </FormControl>
                      <FormMessage />
                    </FormItem>
                  )}
                />
                <FormField
                  control={form.control}
                  name="tryptophan"
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel>Tryptophan (grams)</FormLabel>
                      <FormControl>
                        <Input type="number" step="0.01" placeholder="e.g., 0.3" value={field.value ?? ''} onChange={(e) => field.onChange(e.target.value === '' ? undefined : Number(e.target.value))} />
                      </FormControl>
                      <FormMessage />
                    </FormItem>
                  )}
                />
                <FormField
                  control={form.control}
                  name="valine"
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel>Valine (grams)</FormLabel>
                      <FormControl>
                        <Input type="number" step="0.01" placeholder="e.g., 1.4" value={field.value ?? ''} onChange={(e) => field.onChange(e.target.value === '' ? undefined : Number(e.target.value))} />
                      </FormControl>
                      <FormMessage />
                    </FormItem>
                  )}
                />
              </div>
              <Button type="submit" className="w-full md:w-auto">
                Calculate amino acid profile
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
            <CardDescription>See complete amino acid profile, completeness score, limiting amino acid, and recommendations.</CardDescription>
          </CardHeader>
          <CardContent className="space-y-6">
            <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
              <div className="p-4 border rounded">
                <p className="text-sm text-muted-foreground">Total EAAs</p>
                <p className="text-2xl font-semibold text-primary">{result.totalEAA.toFixed(2)}g</p>
                <p className="text-xs text-muted-foreground">Essential amino acids</p>
              </div>
              <div className="p-4 border rounded">
                <p className="text-sm text-muted-foreground">Completeness score</p>
                <p className="text-2xl font-semibold text-primary">{result.completenessScore.toFixed(0)}</p>
                <p className="text-xs text-muted-foreground">Out of 100</p>
              </div>
              <div className="p-4 border rounded">
                <p className="text-sm text-muted-foreground">Limiting amino acid</p>
                <p className="text-2xl font-semibold text-primary capitalize">{result.limitingAminoAcid}</p>
                <p className="text-xs text-muted-foreground">Lowest relative to need</p>
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
            <strong>Completeness score</strong> = calculated from the ratio of each essential amino acid to its requirement. The lowest ratio determines the limiting amino acid and overall completeness.
          </p>
          <p>
            <strong>Limiting amino acid</strong> = the essential amino acid present in the lowest amount relative to its requirement. It limits protein synthesis as all EAAs must be present in adequate amounts.
          </p>
          <p>
            <strong>Total EAAs</strong> = sum of all 9 essential amino acids (histidine, isoleucine, leucine, lysine, methionine, phenylalanine, threonine, tryptophan, valine).
          </p>
          <p>
            <strong>Optimal ranges</strong>: Completeness score &gt;90 indicates complete profile. Score 75-90 is good, 50-75 is moderate, &lt;50 is incomplete. All 9 essential amino acids are required for protein synthesis.
          </p>
          <p>Complete amino acid profiles contain all 9 essential amino acids in adequate amounts. Incomplete profiles limit protein synthesis, as the limiting amino acid determines overall protein utilization.</p>
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
                <p className="text-sm text-muted-foreground">Target completeness</p>
                <p className="text-xl font-semibold text-primary">&gt; 90</p>
                <p className="text-xs text-muted-foreground">Complete profile</p>
              </div>
              <div className="p-4 border rounded">
                <p className="text-sm text-muted-foreground">Estimated total protein</p>
                <p className="text-xl font-semibold text-primary">
                  {(result.totalEAA / 0.4).toFixed(1)}g
                </p>
                <p className="text-xs text-muted-foreground">From EAAs</p>
              </div>
              <div className="p-4 border rounded">
                <p className="text-sm text-muted-foreground">Profile status</p>
                <p className="text-xl font-semibold text-primary">
                  {result.completenessScore >= 90 ? 'Complete' : result.completenessScore >= 75 ? 'Good' : result.completenessScore >= 50 ? 'Moderate' : 'Incomplete'}
                </p>
                <p className="text-xs text-muted-foreground">Based on score</p>
              </div>
            </div>
          ) : (
            <p className="text-sm text-muted-foreground">Enter your amino acid data to see additional insights.</p>
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
    <meta itemProp="name" content="The Definitive Guide to a Complete Amino Acid Profile: Essentiality, Quality, and Protein Scoring" />
    <meta itemProp="description" content="An in-depth, authoritative guide on amino acid profiles, detailing the nine essential amino acids, the concept of a 'complete' protein, the limiting amino acid principle, and modern protein quality scoring methods (DIAAS)." />
    <meta itemProp="keywords" content="complete amino acid profile calculator, essential amino acids list, limiting amino acid concept, protein quality scoring DIAAS, biological value protein, complementary proteins vegetarian, BCAA function" />
    <meta itemProp="author" content="[Your Site's Health Team]" />
    <meta itemProp="datePublished" content="2025-12-03" />
    <meta itemProp="url" content="/definitive-amino-acid-profile-guide" />

    <h1 className="text-3xl md:text-4xl font-extrabold text-foreground mb-4" itemProp="headline">The Definitive Guide to a Complete Amino Acid Profile: Essentiality and Protein Quality</h1>
    <p className="text-lg italic text-gray-700">A detailed look at the building blocks of protein, the critical difference between essential and non-essential amino acids, and the official standards for measuring protein quality.</p>


    {/* TABLE OF CONTENTS (INTERNAL LINKS FOR UX AND SEO) */}
    <h2 className="text-2xl font-bold text-foreground mt-8 mb-4">Table of Contents: Jump to a Section</h2>
    <ul className="list-disc ml-6 space-y-2 text-blue-600">
        <li><a href="#definition" className="hover:underline">Amino Acids: The Building Blocks of Life</a></li>
        <li><a href="#essentiality" className="hover:underline">The Three Categories of Amino Acids (Essential, Non-Essential)</a></li>
        <li><a href="#complete" className="hover:underline">The Concept of a 'Complete' Protein</a></li>
        <li><a href="#scoring" className="hover:underline">Measuring Protein Quality: DIAAS and Limiting Amino Acids</a></li>
        <li><a href="#needs" className="hover:underline">Protein Requirements and Complementary Sources</a></li>
    </ul>
<hr />

    {/* AMINO ACIDS: THE BUILDING BLOCKS OF LIFE */}
    <h2 id="definition" className="text-2xl font-bold text-foreground pt-8" itemProp="articleSection">Amino Acids: The Building Blocks of Life</h2>
    <p>Amino acids (AAs) are organic compounds that link together in long chains, known as polypeptides, to form proteins. Proteins are vast and complex molecules, serving structural (collagen, keratin), functional (enzymes, antibodies), and hormonal (insulin) roles. The specific sequence and type of amino acids determine the final proteinâ€™s three-dimensional shape and function.</p>

    <h3 className="text-xl font-semibold text-foreground mt-6">Structural Diversity</h3>
    <p>While thousands of amino acids exist in nature, only **20 standard amino acids** are encoded by the human genetic code to build the bodyâ€™s proteins. The unique side chain (R-group) of each amino acid dictates its chemical propertiesâ€”such as polarity, charge, and sizeâ€”which are crucial for protein folding and biological activity.</p>
    

[Image of the basic chemical structure of an amino acid showing the amino group, carboxyl group, and R-group]


<hr />

    {/* THE THREE CATEGORIES OF AMINO ACIDS (ESSENTIAL, NON-ESSENTIAL) */}
    <h2 id="essentiality" className="text-2xl font-bold text-foreground pt-8" itemProp="articleSection">The Three Categories of Amino Acids: Essential, Non-Essential, and Conditionally Essential</h2>
    <p>Amino acids are categorized based on whether the human body can synthesize them internally or if they must be obtained through the diet.</p>

    <h3 className="text-xl font-semibold text-foreground mt-6">1. Essential Amino Acids (Indispensable)</h3>
    <p>There are **nine essential amino acids** that the human body cannot synthesize from other compounds, or cannot synthesize in sufficient quantities to meet physiological needs. These must be consumed daily through the diet to support growth, tissue repair, and metabolism. The nine essential amino acids are:</p>
    <ul>
        <li>Histidine</li>
        <li>Isoleucine</li>
        <li>Leucine</li>
        <li>Lysine</li>
        <li>Methionine</li>
        <li>Phenylalanine</li>
        <li>Threonine</li>
        <li>Tryptophan</li>
        <li>Valine</li>
    </ul>

    <h3 className="text-xl font-semibold text-foreground mt-6">Branch Chain Amino Acids (BCAAs)</h3>
    <p>Three essential amino acidsâ€”**Leucine, Isoleucine, and Valine**â€”are collectively known as the Branch Chain Amino Acids (BCAAs). They are metabolized primarily in the muscle rather than the liver, making them particularly important for muscle protein synthesis, energy during exercise, and muscle recovery. Leucine is often cited as the key initiator of muscle synthesis pathways.</p>

    <h3 className="text-xl font-semibold text-foreground mt-6">2. Non-Essential and 3. Conditionally Essential Amino Acids</h3>
    <ul>
        <li><b>Non-Essential (4):</b> These can be synthesized by the body from other amino acids or precursors (e.g., Alanine, Asparagine, Aspartic Acid, Glutamic Acid).</li>
        <li><b>Conditionally Essential (7):</b> These are typically synthesized by the body, but production may become insufficient during periods of high stress, rapid growth, disease, or severe illness (e.g., Arginine, Cysteine, Glutamine, Glycine, Proline, Serine, Tyrosine). In these states, dietary intake becomes critical.</li>
    </ul>

<hr />

    {/* THE CONCEPT OF A 'COMPLETE' PROTEIN */}
    <h2 id="complete" className="text-2xl font-bold text-foreground pt-8" itemProp="articleSection">The Concept of a 'Complete' Protein</h2>
    <p>The term <b>complete protein</b> is used to describe a food source that contains all nine essential amino acids in roughly the proportions needed by the human body. This concept is fundamental to evaluating the nutritional quality of dietary protein.</p>

    <h3 className="text-xl font-semibold text-foreground mt-6">Complete Sources (High Quality)</h3>
    <p>Most **animal proteins** (meat, poultry, fish, eggs, dairy) are considered complete because their amino acid profiles closely match human requirements. However, some plant foods also qualify as complete proteins:</p>
    <ul>
        <li>Soy and Soy Products (Tofu, Edamame)</li>
        <li>Quinoa</li>
        <li>Buckwheat</li>
    </ul>

    <h3 className="text-xl font-semibold text-foreground mt-6">Incomplete Sources and Complementary Proteins</h3>
    <p>Most **plant proteins** (grains, legumes, nuts) are considered incomplete because they lack sufficient quantities of one or two essential amino acids. However, a complete profile can be achieved through **complementary proteins**â€”combining two or more incomplete sources within the same day that mutually supply the missing essential AAs. Classic examples include:</p>
    <ul>
        <li>Grains (low in Lysine) + Legumes (low in Methionine) = Rice and Beans</li>
        <li>Nuts/Seeds (low in Lysine/Threonine) + Legumes</li>
    </ul>

<hr />

    {/* MEASURING PROTEIN QUALITY: DIAAS AND LIMITING AMINO ACIDS */}
    <h2 id="scoring" className="text-2xl font-bold text-foreground pt-8" itemProp="articleSection">Measuring Protein Quality: DIAAS and Limiting Amino Acids</h2>
    <p>To move beyond the simple "complete vs. incomplete" classification, scientific bodies use sophisticated scoring systems to quantify protein quality based on digestibility and the presence of the most critical nutrients.</p>

    <h3 className="text-xl font-semibold text-foreground mt-6">The Limiting Amino Acid Principle</h3>
    <p>A protein's value is determined by its **limiting amino acid**â€”the essential amino acid present in the food in the lowest quantity relative to human need. Just as a chain is only as strong as its weakest link, the body can only utilize protein for synthesis until it runs out of the least abundant essential amino acid. </p>

    <h3 className="text-xl font-semibold text-foreground mt-6">Official Scoring: DIAAS (Digestible Indispensable Amino Acid Score)</h3>
    <p>The standard for measuring protein quality has evolved over time, shifting from PDCAAS (Protein Digestibility Corrected Amino Acid Score) to the more accurate **DIAAS** (Digestible Indispensable Amino Acid Score), which is endorsed by the **Food and Agriculture Organization (FAO) of the United Nations**. DIAAS measures the digestibility of individual essential amino acids in the **ileum** (the final part of the small intestine), giving a much more accurate score of the true amount the body can use.</p>
    <p>Protein quality scores are crucial for public health, as they inform recommendations for vulnerable populations like children and the elderly, who have higher requirements for muscle protein synthesis.</p>

<hr />

    {/* PROTEIN REQUIREMENTS AND COMPLEMENTARY SOURCES */}
    <h2 id="needs" className="text-2xl font-bold text-foreground pt-8" itemProp="articleSection">Protein Requirements and Complementary Sources</h2>
    <p>The requirement for amino acids is generally expressed through the overall Recommended Dietary Allowance (RDA) for protein, though individual needs vary greatly based on activity level, age, and health status.</p>

    <h3 className="text-xl font-semibold text-foreground mt-6">General Protein RDA</h3>
    <p>The baseline RDA for protein for a sedentary adult is generally **0.8 grams per kilogram (g/kg)** of body weight per day. This amount is sufficient to prevent deficiency, but it is often considered the minimum, not the optimum.</p>
    <p>Requirements increase substantially for:</p>
    <ul>
        <li><b>Athletes/Active Adults:</b> Often recommended 1.2 to 2.0 g/kg body weight to support muscle repair and hypertrophy.</li>
        <li><b>Older Adults (Sarcopenia Risk):</b> May require 1.0 to 1.2 g/kg body weight to counteract age-related muscle loss (sarcopenia).</li>
    </ul>

    <h3 className="text-xl font-semibold text-foreground mt-6">Nutritional Strategy for Plant-Based Diets</h3>
    <p>Individuals relying on plant-based protein should employ the complementary protein strategy across the day. While traditional pairing (like rice and beans) is helpful, a more effective strategy is simply to consume a wide variety of plant foods (legumes, grains, nuts, and vegetables) over the course of the day to ensure all essential amino acids are eventually received.</p>

<hr />

    {/* CONCLUSION */}
    <h2 className="text-2xl font-bold text-foreground pt-8" itemProp="articleSection">Conclusion</h2>
    <p>A complete amino acid profile is one that supplies all **nine essential amino acids** in sufficient quantity, a criteria most easily met by animal proteins and select plant sources like soy and quinoa. The quality of any protein is limited by the scarcest essential amino acid (the **limiting amino acid**). For precise nutritional assessment, the **DIAAS** method (Digestible Indispensable Amino Acid Score) is the authoritative standard. Whether through complete sources or by combining complementary plant proteins, ensuring adequate intake of all essential amino acids is fundamental to maintaining tissue structure, metabolic function, and muscle health.</p>
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
          <p>This tool calculates complete amino acid profile from essential amino acid amounts.</p>
          <p>Outputs include all 9 essential amino acids, total EAAs, completeness score, limiting amino acid, status, recommendations, an action plan, and supporting metrics.</p>
          <p>Formula, steps, guide content, related tools, and FAQs ensure humans or AI assistants can interpret the methodology instantly.</p>
        </CardContent>
      </Card>
    </div>
  );
}


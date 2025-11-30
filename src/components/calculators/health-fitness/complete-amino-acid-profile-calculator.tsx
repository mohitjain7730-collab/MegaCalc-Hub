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

const baseUrl = 'https://mycalculating.com/category/health-fitness/complete-amino-acid-profile-calculator';

const schemaMarkup = {
  '@context': 'https://schema.org',
  '@graph': [
    {
      '@type': 'BreadcrumbList',
      itemListElement: [
        { '@type': 'ListItem', position: 1, name: 'Home', item: 'https://mycalculating.com' },
        { '@type': 'ListItem', position: 2, name: 'Health & Fitness', item: 'https://mycalculating.com/category/health-fitness' },
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
                <Link href={`/category/health-fitness/${calc.slug}`} className="text-primary hover:underline">
                  {calc.name}
                </Link>
              </h4>
              <p className="text-sm text-muted-foreground">{calc.description}</p>
            </div>
          ))}
        </CardContent>
      </Card>

      <Card>
        <CardHeader>
          <CardTitle>Complete guide snapshot</CardTitle>
        </CardHeader>
        <CardContent className="prose prose-sm dark:prose-invert max-w-none">
          <p>Complete amino acid profiles contain all 9 essential amino acids (histidine, isoleucine, leucine, lysine, methionine, phenylalanine, threonine, tryptophan, valine) in adequate amounts. The limiting amino acid (lowest relative to requirement) determines overall profile completeness and protein synthesis capacity.</p>
          <p>Use this calculator to calculate complete amino acid profile from essential amino acid amounts.</p>
        </CardContent>
      </Card>

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


'use client';

import { useState } from 'react';
import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import { z } from 'zod';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Form, FormControl, FormField, FormItem, FormLabel, FormMessage } from '@/components/ui/form';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import Link from 'next/link';
import { Utensils, Activity, Calendar, AlertTriangle } from 'lucide-react';

const formSchema = z.object({
  proteinName: z.string().trim().max(80).optional(),
  aminoAcidScore: z
    .number({ invalid_type_error: 'Enter a value between 0 and 1' })
    .min(0, 'Score cannot be negative')
    .max(2, 'Score should reflect the ratio to reference protein'),
  trueDigestibility: z
    .number({ invalid_type_error: 'Enter a value between 0 and 1' })
    .min(0, 'Digestibility cannot be negative')
    .max(1.2, 'Digestibility rarely exceeds 1.0'),
  servingProteinGrams: z
    .number({ invalid_type_error: 'Enter protein grams per serving' })
    .min(0, 'Protein grams cannot be negative')
    .max(120, 'Enter a realistic serving size')
    .optional(),
});

type FormValues = z.infer<typeof formSchema>;

type ResultPayload = {
  proteinName: string;
  pdcaas: number;
  truncatedPdcaas: number;
  digestibleProtein: number | null;
  classification: 'excellent' | 'high' | 'moderate' | 'low';
  interpretation: string;
  recommendations: string[];
  warningSigns: string[];
  plan: { week: number; focus: string }[];
};

const understandingInputs = [
  {
    label: 'Amino Acid Score',
    description: 'Ratio of the limiting essential amino acid (mg) in 1 g of test protein to the reference amino acid requirement pattern.',
  },
  {
    label: 'True Digestibility',
    description: 'Fraction of protein absorbed and utilized. Values typically range 0.6–1.0 depending on food and processing.',
  },
  {
    label: 'Protein Name (optional)',
    description: 'Identify the protein source (e.g., whey isolate, lentils, pea protein) for contextual recommendations.',
  },
  {
    label: 'Protein per Serving (optional)',
    description: 'Enter grams of protein per portion to estimate digestible protein delivered after PDCAAS adjustment.',
  },
];

const faqs: [string, string][] = [
  ['What does PDCAAS measure?', 'PDCAAS evaluates protein quality by combining the amino acid profile with digestibility, indicating how well a protein supplies essential amino acids for human needs.'],
  ['How do I calculate amino acid score?', 'Identify the limiting amino acid (lowest ratio relative to human requirements) by comparing mg of each essential amino acid to the FAO/WHO reference pattern.'],
  ['What is a good PDCAAS value?', 'Scores ≥ 0.90 indicate high-quality proteins; 1.00 means the protein meets or exceeds all essential amino acid requirements when digestibility is considered.'],
  ['Why are scores truncated at 1.0?', 'The PDCAAS methodology caps values at 1.0 for labeling purposes, even if a protein exceeds requirements. This prevents inflated claims.'],
  ['How does PDCAAS differ from DIAAS?', 'DIAAS measures digestibility for each amino acid at the ileal level and does not truncate values above 1.0, providing a more precise view of protein quality.'],
  ['Can plant proteins reach a PDCAAS of 1.0?', 'Yes. Soy isolate and certain blends (e.g., pea + rice) can reach 1.0 by complementing limiting amino acids and high digestibility.'],
  ['How can I improve PDCAAS in plant-based diets?', 'Combine grains and legumes, add small amounts of animal protein, or use fortified plant protein blends to cover amino acid gaps.'],
  ['Does cooking affect PDCAAS?', 'Heat can reduce digestibility or alter amino acids. Gentle cooking preserves quality, while excessive heat or processing may lower PDCAAS.'],
  ['Should athletes rely on PDCAAS?', 'PDCAAS helps ensure each serving of protein delivers essential amino acids. Combine with total protein intake and timing strategies for recovery.'],
  ['How often should I evaluate protein sources?', 'Reassess when changing diets, introducing new protein powders, or planning formulations for clinical or sports nutrition.'],
];

const plan = (): { week: number; focus: string }[] => [
  { week: 1, focus: 'Audit current protein sources and note their PDCAAS or amino acid profiles.' },
  { week: 2, focus: 'Combine complementary plant proteins (grains + legumes) in at least three meals.' },
  { week: 3, focus: 'Improve digestibility via soaking, sprouting, fermenting, or selecting high-quality isolates.' },
  { week: 4, focus: 'Adjust portion sizes to deliver 20–40 g of high-PDCAAS protein post-workout or in main meals.' },
  { week: 5, focus: 'Track energy, recovery, and muscle soreness to gauge protein effectiveness.' },
  { week: 6, focus: 'Refine recipes or formulations to raise limiting amino acids using fortified ingredients if necessary.' },
  { week: 7, focus: 'Evaluate micronutrients that support amino acid utilization (vitamin B6, zinc, magnesium).'},
  { week: 8, focus: 'Recalculate PDCAAS for updated blends and plan long-term sourcing strategies.' },
];

const warningSigns = () => [
  'Chronic low-quality protein intake can impair muscle repair, immunity, and growth—monitor total protein quality, not just grams.',
  'Individuals with kidney or liver disease should adjust protein under medical supervision.',
  'Relying solely on a single low-PDCAAS protein may increase risk of essential amino acid deficiencies.',
];

const classifyPdcaas = (score: number): ResultPayload['classification'] => {
  if (score >= 0.9) return 'excellent';
  if (score >= 0.75) return 'high';
  if (score >= 0.55) return 'moderate';
  return 'low';
};

const interpretPdcaas = (score: number, truncated: number, proteinName: string) => {
  const name = proteinName || 'This protein';
  if (truncated >= 1) {
    return `${name} achieves a PDCAAS of 1.0, meaning it supplies all essential amino acids in adequate amounts when digestibility is considered.`;
  }
  if (score >= 0.9) {
    return `${name} ranks as a high-quality source. Pair with diverse foods to maintain amino acid balance.`;
  }
  if (score >= 0.75) {
    return `${name} provides most essential amino acids but may benefit from complementary sources to fill minor gaps.`;
  }
  if (score >= 0.55) {
    return `${name} has moderate protein quality. Combine with higher-lysine or higher-methionine foods depending on the limiting amino acid.`;
  }
  return `${name} presents a low PDCAAS; integrate complementary proteins or fortified products to enhance amino acid coverage.`;
};

const recommendations = (classification: ResultPayload['classification'], proteinName: string) => {
  const base = [
    'Verify serving sizes deliver sufficient protein (20–30 g) once PDCAAS is applied.',
    'Monitor total daily protein distribution—aim for evenly spaced servings across meals.',
    'If using protein supplements, select third-party tested products to ensure label accuracy.',
  ];
  if (classification === 'excellent') {
    return [
      ...base,
      'Continue using this protein as a primary source—pair with carbohydrate and healthy fats for balanced meals.',
      'Rotate with other high-quality proteins to diversify micronutrients and flavor.',
    ];
  }
  if (classification === 'high') {
    return [
      ...base,
      'Mix with small amounts of complete proteins (e.g., dairy, eggs) or targeted amino supplements during intense training.',
      'Evaluate processing methods—fermentation or enzymatic treatment can lift digestibility further.',
    ];
  }
  if (classification === 'moderate') {
    return [
      ...base,
      'Combine with complementary proteins; for example, pair legumes with grains or nuts with seeds.',
      'Consider fortifying recipes with limiting amino acids (lysine, methionine) or using blended protein powders.',
    ];
  }
  return [
    ...base,
    'Use this protein as part of a blend rather than the sole source to avoid amino acid deficiencies.',
    'Work with a dietitian or formulation expert to enhance quality through processing or ingredient pairing.',
  ];
};

const calculatePdcaas = (values: FormValues): ResultPayload => {
  const proteinName = values.proteinName && values.proteinName.trim() !== '' ? values.proteinName.trim() : 'This protein';
  const pdcaasRaw = values.aminoAcidScore * values.trueDigestibility;
  const truncated = Math.min(1, pdcaasRaw);
  const digestibleProtein = values.servingProteinGrams !== undefined ? Number((values.servingProteinGrams * truncated).toFixed(2)) : null;
  const classification = classifyPdcaas(truncated);
  return {
    proteinName,
    pdcaas: Number(pdcaasRaw.toFixed(3)),
    truncatedPdcaas: Number(truncated.toFixed(3)),
    digestibleProtein,
    classification,
    interpretation: interpretPdcaas(pdcaasRaw, truncated, proteinName),
    recommendations: recommendations(classification, proteinName),
    warningSigns: warningSigns(),
    plan: plan(),
  };
};

export default function PdcaasCalculator() {
  const [result, setResult] = useState<ResultPayload | null>(null);

  const form = useForm<FormValues>({
    resolver: zodResolver(formSchema),
    defaultValues: {
      proteinName: '',
      aminoAcidScore: undefined,
      trueDigestibility: undefined,
      servingProteinGrams: undefined,
    },
  });

  const onSubmit = (values: FormValues) => {
    setResult(calculatePdcaas(values));
  };

  return (
    <div className="space-y-8">
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2"><Utensils className="h-5 w-5" /> PDCAAS Calculator</CardTitle>
          <CardDescription>Evaluate protein quality by combining amino acid adequacy with true digestibility.</CardDescription>
        </CardHeader>
        <CardContent>
          <Form {...form}>
            <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-6">
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <FormField control={form.control} name="proteinName" render={({ field }) => (
                  <FormItem>
                    <FormLabel>Protein Source (optional)</FormLabel>
                    <FormControl>
                      <Input placeholder="e.g., Pea protein isolate" {...field} />
                    </FormControl>
                    <FormMessage />
                  </FormItem>
                )} />
                <FormField control={form.control} name="servingProteinGrams" render={({ field }) => (
                  <FormItem>
                    <FormLabel>Protein per Serving (g)</FormLabel>
                    <FormControl>
                      <Input
                        type="number"
                        step="0.5"
                        placeholder="Optional, e.g., 25"
                        value={field.value ?? ''}
                        onChange={(event) => field.onChange(event.target.value === '' ? undefined : Number(event.target.value))}
                      />
                    </FormControl>
                    <FormMessage />
                  </FormItem>
                )} />
                <FormField control={form.control} name="aminoAcidScore" render={({ field }) => (
                  <FormItem>
                    <FormLabel>Amino Acid Score (0–2)</FormLabel>
                    <FormControl>
                      <Input
                        type="number"
                        step="0.01"
                        placeholder="e.g., 0.95"
                        value={field.value ?? ''}
                        onChange={(event) => field.onChange(event.target.value === '' ? undefined : Number(event.target.value))}
                      />
                    </FormControl>
                    <FormMessage />
                  </FormItem>
                )} />
                <FormField control={form.control} name="trueDigestibility" render={({ field }) => (
                  <FormItem>
                    <FormLabel>True Digestibility (0–1.0)</FormLabel>
                    <FormControl>
                      <Input
                        type="number"
                        step="0.01"
                        placeholder="e.g., 0.92"
                        value={field.value ?? ''}
                        onChange={(event) => field.onChange(event.target.value === '' ? undefined : Number(event.target.value))}
                      />
                    </FormControl>
                    <FormMessage />
                  </FormItem>
                )} />
              </div>
              <Button type="submit" className="w-full md:w-auto">Calculate PDCAAS</Button>
            </form>
          </Form>
        </CardContent>
      </Card>

      {result && (
        <div className="space-y-6">
          <Card>
            <CardHeader>
              <div className="flex items-center gap-4"><Activity className="h-8 w-8 text-primary" /><CardTitle>Protein Quality Summary</CardTitle></div>
              <CardDescription>{result.proteinName}</CardDescription>
            </CardHeader>
            <CardContent className="space-y-4">
              <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
                <div className="p-4 border rounded">
                  <h4 className="text-sm font-semibold text-muted-foreground">PDCAAS (raw)</h4>
                  <p className="text-2xl font-bold text-primary">{result.pdcaas.toFixed(2)}</p>
                </div>
                <div className="p-4 border rounded">
                  <h4 className="text-sm font-semibold text-muted-foreground">PDCAAS (truncated)</h4>
                  <p className="text-2xl font-bold text-primary">{result.truncatedPdcaas.toFixed(2)}</p>
                </div>
                <div className="p-4 border rounded">
                  <h4 className="text-sm font-semibold text-muted-foreground">Classification</h4>
                  <p className="text-lg font-bold text-primary">
                    {result.classification === 'excellent' && 'Excellent'}
                    {result.classification === 'high' && 'High'}
                    {result.classification === 'moderate' && 'Moderate'}
                    {result.classification === 'low' && 'Low'}
                  </p>
                </div>
                <div className="p-4 border rounded">
                  <h4 className="text-sm font-semibold text-muted-foreground">Digestible Protein</h4>
                  <p className="text-lg font-bold text-primary">
                    {result.digestibleProtein !== null ? `${result.digestibleProtein} g` : '—'}
                  </p>
                </div>
              </div>
              <p className="text-sm text-muted-foreground">{result.interpretation}</p>
            </CardContent>
          </Card>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            <Card>
              <CardHeader>
                <CardTitle>Recommendations</CardTitle>
              </CardHeader>
              <CardContent>
                <ul className="space-y-2">
                  {result.recommendations.map((item, index) => (
                    <li key={index} className="text-sm text-muted-foreground">{item}</li>
                  ))}
                </ul>
              </CardContent>
            </Card>
            <Card>
              <CardHeader>
                <CardTitle className="flex items-center gap-2"><AlertTriangle className="h-4 w-4" /> Warning Signs & Precautions</CardTitle>
              </CardHeader>
              <CardContent>
                <ul className="space-y-2">
                  {result.warningSigns.map((item, index) => (
                    <li key={index} className="text-sm text-muted-foreground">{item}</li>
                  ))}
                </ul>
              </CardContent>
            </Card>
          </div>

          <Card>
            <CardHeader>
              <CardTitle className="flex items-center gap-2"><Calendar className="h-5 w-5" /> 8‑Week Protein Optimization Plan</CardTitle>
            </CardHeader>
            <CardContent>
              <div className="overflow-x-auto">
                <table className="w-full text-sm">
                  <thead>
                    <tr className="border-b">
                      <th className="text-left p-2">Week</th>
                      <th className="text-left p-2">Focus</th>
                    </tr>
                  </thead>
                  <tbody>
                    {result.plan.map(({ week, focus }) => (
                      <tr key={week} className="border-b">
                        <td className="p-2">{week}</td>
                        <td className="p-2">{focus}</td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            </CardContent>
          </Card>
        </div>
      )}

      <Card>
        <CardHeader>
          <CardTitle>Understanding the Inputs</CardTitle>
          <CardDescription>Collect accurate data for meaningful PDCAAS results</CardDescription>
        </CardHeader>
        <CardContent>
          <ul className="space-y-2">
            {understandingInputs.map((item, index) => (
              <li key={index}>
                <span className="font-semibold text-foreground">{item.label}:</span>
                <span className="text-sm text-muted-foreground"> {item.description}</span>
              </li>
            ))}
          </ul>
        </CardContent>
      </Card>

      <Card>
        <CardHeader>
          <CardTitle>Related Calculators</CardTitle>
          <CardDescription>Design a comprehensive performance nutrition stack</CardDescription>
        </CardHeader>
        <CardContent>
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div className="p-4 border rounded">
              <h4 className="font-semibold mb-1">
                <Link href="/category/health-fitness/protein-intake-calculator" className="text-primary hover:underline">
                  Protein Intake Calculator
                </Link>
              </h4>
              <p className="text-sm text-muted-foreground">Align total daily protein grams with high-quality sources.</p>
            </div>
            <div className="p-4 border rounded">
              <h4 className="font-semibold mb-1">
                <Link href="/category/health-fitness/amino-acid-blend-optimizer-calculator" className="text-primary hover:underline">
                  Amino Acid Blend Optimizer
                </Link>
              </h4>
              <p className="text-sm text-muted-foreground">Fine-tune limiting amino acids for plant-based formulations.</p>
            </div>
            <div className="p-4 border rounded">
              <h4 className="font-semibold mb-1">
                <Link href="/category/health-fitness/power-to-heart-rate-efficiency-calculator" className="text-primary hover:underline">
                  Power-to-HR Efficiency Calculator
                </Link>
              </h4>
              <p className="text-sm text-muted-foreground">Track performance alongside protein quality improvements.</p>
            </div>
            <div className="p-4 border rounded">
              <h4 className="font-semibold mb-1">
                <Link href="/category/health-fitness/daily-antioxidant-orac-goal-calculator" className="text-primary hover:underline">
                  Antioxidant (ORAC) Goal Calculator
                </Link>
              </h4>
              <p className="text-sm text-muted-foreground">Pair high-quality proteins with antioxidant support for recovery.</p>
            </div>
          </div>
        </CardContent>
      </Card>

      <Card>
        <CardHeader>
          <CardTitle>Complete Guide: Leveraging PDCAAS in Meal Planning</CardTitle>
          <CardDescription>Practical insights for clinicians, athletes, and formulators</CardDescription>
        </CardHeader>
        <CardContent className="prose prose-sm dark:prose-invert max-w-none">
          <p>
            PDCAAS helps ensure protein sources deliver the essential amino acids your body needs. Use it to evaluate supplements, plan vegan or vegetarian diets, and design clinical or sports nutrition protocols. Combine PDCAAS insights with total protein targets, spacing across meals, and supportive nutrients like vitamin B6, zinc, and magnesium to optimize amino acid utilization.
          </p>
          <p>
            When formulating plant-based blends, pair complementary proteins or enrich with targeted amino acids. Monitor digestibility through preparation methods—soaking, sprouting, and fermentation can raise overall scores. Reassess regularly as ingredient quality and processing changes.
          </p>
        </CardContent>
      </Card>

      <Card>
        <CardHeader>
          <CardTitle>Frequently Asked Questions</CardTitle>
          <CardDescription>Protein quality fundamentals and troubleshooting tips</CardDescription>
        </CardHeader>
        <CardContent className="space-y-4">
          {faqs.map(([question, answer], index) => (
            <div key={index}>
              <h4 className="font-semibold mb-1">{question}</h4>
              <p className="text-sm text-muted-foreground">{answer}</p>
            </div>
          ))}
        </CardContent>
      </Card>
    </div>
  );
}

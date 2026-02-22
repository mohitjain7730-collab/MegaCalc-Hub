'use client';

import { useState } from 'react';
import Script from 'next/script';
import Link from 'next/link';
import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import { z } from 'zod';
import { Droplet, Zap, Target, Activity, Shield } from 'lucide-react';

import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Form, FormControl, FormField, FormItem, FormLabel, FormMessage } from '@/components/ui/form';
import { Input } from '@/components/ui/input';

const formSchema = z.object({
  saturatedFat: z.number({ invalid_type_error: 'Enter saturated fat' }).min(0).max(100),
  monounsaturatedFat: z.number({ invalid_type_error: 'Enter monounsaturated fat' }).min(0).max(100),
  polyunsaturatedFat: z.number({ invalid_type_error: 'Enter polyunsaturated fat' }).min(0).max(100),
});

type FormValues = z.infer<typeof formSchema>;

type ResultPayload = {
  saturatedFat: number;
  monounsaturatedFat: number;
  polyunsaturatedFat: number;
  totalFat: number;
  sfaPercent: number;
  mufaPercent: number;
  pufaPercent: number;
  qualityScore: number;
  status: 'optimal' | 'good' | 'moderate' | 'low';
  interpretation: string;
  recommendations: string[];
  plan: { label: string; detail: string }[];
};

const steps = [
  'Enter saturated fat (grams) from food label or tracking.',
  'Enter monounsaturated fat (grams) from food label or tracking.',
  'Enter polyunsaturated fat (grams) from food label or tracking.',
  'Review fat quality score, SFA/MUFA/PUFA ratios, and recommendations.',
];

const faqs = [
  {
    question: 'What are the different types of fat?',
    answer:
      'Fats are classified as saturated (SFA), monounsaturated (MUFA), and polyunsaturated (PUFA). Each type has different health effects. A balanced intake of MUFA and PUFA with limited SFA is generally recommended.',
  },
  {
    question: 'What is saturated fat?',
    answer:
      'Saturated fat (SFA) is found in animal products, tropical oils, and some processed foods. High intake is associated with increased cardiovascular risk. Recommendations suggest limiting SFA to &lt;10% of total calories.',
  },
  {
    question: 'What is monounsaturated fat?',
    answer:
      'Monounsaturated fat (MUFA) is found in olive oil, avocados, nuts, and seeds. MUFA is associated with cardiovascular benefits and is considered a healthy fat. It should be a primary fat source.',
  },
  {
    question: 'What is polyunsaturated fat?',
    answer:
      'Polyunsaturated fat (PUFA) includes omega-3 and omega-6 fatty acids found in fish, nuts, seeds, and vegetable oils. PUFA is essential and associated with cardiovascular and brain health benefits.',
  },
  {
    question: 'What is a good fat quality score?',
    answer:
      'A good fat quality score reflects higher proportions of MUFA and PUFA relative to SFA. Optimal distribution: SFA &lt;30%, MUFA 40-50%, PUFA 20-30% of total fat. Higher scores indicate better fat quality.',
  },
  {
    question: 'How does fat quality affect health?',
    answer:
      'Fat quality significantly affects cardiovascular health, inflammation, and overall well-being. Higher MUFA and PUFA intake with limited SFA supports better cardiovascular outcomes and metabolic health.',
  },
  {
    question: 'What are sources of healthy fats?',
    answer:
      'Healthy fat sources (high MUFA/PUFA) include olive oil, avocados, nuts, seeds, fatty fish, and vegetable oils. Limit sources high in SFA like red meat, butter, and processed foods.',
  },
  {
    question: 'How can I improve fat quality?',
    answer:
      'Improve fat quality by choosing MUFA and PUFA sources (olive oil, nuts, fish) over high-SFA sources (butter, red meat, processed foods). Aim for a balanced fat profile with limited SFA.',
  },
  {
    question: 'What about trans fats?',
    answer:
      'Trans fats should be avoided entirely. They are associated with increased cardiovascular risk. Check labels and avoid partially hydrogenated oils, which contain trans fats.',
  },
  {
    question: 'When should I consult a healthcare provider?',
    answer:
      'Consult a healthcare provider or registered dietitian if you have cardiovascular concerns, need personalized fat intake guidance, or want to optimize your fat quality for specific health goals.',
  },
];

const relatedCalculators = [
  {
    name: 'Meal Calorie Breakdown Calculator',
    slug: 'meal-calorie-breakdown-calculator',
    description: 'Break down meal fats alongside quality assessment.',
  },
  {
    name: 'Nutrient Density to Calorie Ratio Calculator',
    slug: 'nutrient-density-to-calorie-ratio-calculator',
    description: 'Assess nutritional quality comprehensively.',
  },
  {
    name: 'Satiety Index Calculator',
    slug: 'satiety-index-calculator',
    description: 'Evaluate satiety alongside fat quality.',
  },
  {
    name: 'Caloric Density vs Volume Calculator',
    slug: 'caloric-density-vs-volume-calculator',
    description: 'Assess caloric density of fat sources.',
  },
];

const baseUrl = 'https://mycalculating.com/health-fitness/fat-quality-score-sfa-mufa-pufa-ratio-calculator';

const schemaMarkup = {
  '@context': 'https://schema.org',
  '@graph': [
    {
      '@type': 'BreadcrumbList',
      itemListElement: [
        { '@type': 'ListItem', position: 1, name: 'Home', item: 'https://mycalculating.com' },
        { '@type': 'ListItem', position: 2, name: 'Health & Fitness', item: 'https://mycalculating.com/health-fitness' },
        { '@type': 'ListItem', position: 3, name: 'Fat Quality Score (SFA/MUFA/PUFA ratio) Calculator', item: baseUrl },
      ],
    },
    {
      '@type': 'SoftwareApplication',
      name: 'Fat Quality Score (SFA/MUFA/PUFA ratio) Calculator',
      applicationCategory: 'Calculator',
      operatingSystem: 'Web Browser',
      description: 'Calculate fat quality score from saturated fat, monounsaturated fat, and polyunsaturated fat.',
      url: baseUrl,
      offers: { '@type': 'Offer', price: '0', priceCurrency: 'USD' },
    },
  ],
};

const clamp = (value: number, min: number, max: number) => Math.min(max, Math.max(min, value));

const calculateResult = (values: FormValues): ResultPayload => {
  const saturatedFat = values.saturatedFat;
  const monounsaturatedFat = values.monounsaturatedFat;
  const polyunsaturatedFat = values.polyunsaturatedFat;
  
  const totalFat = saturatedFat + monounsaturatedFat + polyunsaturatedFat;
  
  // Calculate percentages
  const sfaPercent = totalFat > 0 ? (saturatedFat / totalFat) * 100 : 0;
  const mufaPercent = totalFat > 0 ? (monounsaturatedFat / totalFat) * 100 : 0;
  const pufaPercent = totalFat > 0 ? (polyunsaturatedFat / totalFat) * 100 : 0;
  
  // Calculate quality score (0-100, higher = better)
  // Optimal: SFA <30%, MUFA 40-50%, PUFA 20-30%
  let qualityScore = 50;
  
  // SFA component (0-30 points, inverted)
  if (sfaPercent < 20) {
    qualityScore += 25; // Very low SFA (excellent)
  } else if (sfaPercent < 30) {
    qualityScore += 15; // Low SFA (good)
  } else if (sfaPercent < 40) {
    qualityScore -= 5; // Moderate SFA
  } else if (sfaPercent < 50) {
    qualityScore -= 20; // High SFA
  } else {
    qualityScore -= 35; // Very high SFA
  }
  
  // MUFA component (0-35 points)
  if (mufaPercent >= 40 && mufaPercent <= 55) {
    qualityScore += 30; // Optimal range
  } else if (mufaPercent >= 30 && mufaPercent < 40) {
    qualityScore += 20; // Good range
  } else if (mufaPercent >= 55 && mufaPercent <= 65) {
    qualityScore += 25; // High but acceptable
  } else if (mufaPercent < 20) {
    qualityScore -= 20; // Too low
  } else {
    qualityScore += 10; // Moderate
  }
  
  // PUFA component (0-35 points)
  if (pufaPercent >= 20 && pufaPercent <= 35) {
    qualityScore += 30; // Optimal range
  } else if (pufaPercent >= 15 && pufaPercent < 20) {
    qualityScore += 20; // Good range
  } else if (pufaPercent >= 35 && pufaPercent <= 45) {
    qualityScore += 25; // High but acceptable
  } else if (pufaPercent < 10) {
    qualityScore -= 15; // Too low
  } else {
    qualityScore += 10; // Moderate
  }
  
  qualityScore = clamp(qualityScore, 0, 100);

  let status: ResultPayload['status'] = 'optimal';
  let interpretation = 'Your fat quality score is optimal. This fat profile has good balance of MUFA and PUFA with limited SFA, supporting cardiovascular health.';

  if (qualityScore < 40 || sfaPercent > 50 || mufaPercent < 15 || pufaPercent < 10) {
    status = 'low';
    interpretation = 'Your fat quality score is low. This fat profile has high SFA or low MUFA/PUFA, which may negatively impact cardiovascular health. Consider choosing healthier fat sources.';
  } else if (qualityScore < 60 || sfaPercent > 40 || mufaPercent < 25 || pufaPercent < 15) {
    status = 'moderate';
    interpretation = 'Your fat quality score is moderate. Consider increasing MUFA and PUFA while reducing SFA to improve fat quality and support cardiovascular health.';
  } else if (qualityScore < 80) {
    status = 'good';
    interpretation = 'Your fat quality score is good. Continue choosing fat sources with good MUFA and PUFA content to maintain optimal fat quality.';
  }

  const recommendations = [
    'Choose MUFA-rich sources: include olive oil, avocados, nuts, and seeds as primary fat sources. These provide monounsaturated fats associated with cardiovascular benefits.',
    'Include PUFA sources: consume fatty fish, nuts, seeds, and vegetable oils to provide essential polyunsaturated fats (omega-3 and omega-6) for cardiovascular and brain health.',
    'Limit SFA intake: reduce saturated fat from red meat, butter, and processed foods. Aim for SFA to be less than 30% of total fat intake.',
  ];
  if (status === 'low' || status === 'moderate') {
    recommendations.push('Significantly improve fat quality by replacing high-SFA sources with MUFA and PUFA sources. This supports better cardiovascular health and metabolic outcomes.');
  }
  if (sfaPercent > 40) {
    recommendations.push('Reduce saturated fat intake. High SFA is associated with increased cardiovascular risk. Replace with MUFA and PUFA sources like olive oil, nuts, and fish.');
  }
  if (mufaPercent < 25 || pufaPercent < 15) {
    recommendations.push('Increase MUFA and PUFA intake. These healthy fats support cardiovascular health. Include olive oil, avocados, nuts, seeds, and fatty fish in your diet.');
  }

  const plan = [
    { label: 'This Week', detail: 'Calculate fat quality scores for your foods and meals. Assess SFA/MUFA/PUFA ratios and identify opportunities to improve fat quality.' },
    { label: 'This Month', detail: 'Optimize fat sources: increase MUFA and PUFA intake (olive oil, nuts, fish), reduce SFA sources (red meat, butter), and improve overall fat quality.' },
    { label: 'Ongoing', detail: 'Monitor fat quality through regular food assessment. Maintain a diet with balanced MUFA and PUFA and limited SFA to support optimal cardiovascular health.' },
  ];

  return { saturatedFat, monounsaturatedFat, polyunsaturatedFat, totalFat, sfaPercent, mufaPercent, pufaPercent, qualityScore, status, interpretation, recommendations, plan };
};

export default function FatQualityScoreSfaMufaPufaRatioCalculator() {
  const [result, setResult] = useState<ResultPayload | null>(null);

  const form = useForm<FormValues>({
    resolver: zodResolver(formSchema),
    defaultValues: {
      saturatedFat: undefined,
      monounsaturatedFat: undefined,
      polyunsaturatedFat: undefined,
    },
  });

  return (
    <div className="space-y-8">
      <Script id="fat-quality-schema" type="application/ld+json" strategy="afterInteractive" dangerouslySetInnerHTML={{ __html: JSON.stringify(schemaMarkup) }} />

      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <Droplet className="h-5 w-5" />
            Fat Quality Score (SFA/MUFA/PUFA ratio) Calculator
          </CardTitle>
          <CardDescription>Calculate fat quality score from saturated fat, monounsaturated fat, and polyunsaturated fat.</CardDescription>
        </CardHeader>
      </Card>

      <Card>
        <CardHeader>
          <CardTitle>Input your fat data</CardTitle>
        </CardHeader>
        <CardContent>
          <Form {...form}>
            <form onSubmit={form.handleSubmit((values) => setResult(calculateResult(values)))} className="space-y-6">
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <FormField
                  control={form.control}
                  name="saturatedFat"
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel>Saturated fat (grams)</FormLabel>
                      <FormControl>
                        <Input type="number" step="0.1" placeholder="e.g., 5" value={field.value ?? ''} onChange={(e) => field.onChange(e.target.value === '' ? undefined : Number(e.target.value))} />
                      </FormControl>
                      <FormMessage />
                    </FormItem>
                  )}
                />
                <FormField
                  control={form.control}
                  name="monounsaturatedFat"
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel>Monounsaturated fat (grams)</FormLabel>
                      <FormControl>
                        <Input type="number" step="0.1" placeholder="e.g., 8" value={field.value ?? ''} onChange={(e) => field.onChange(e.target.value === '' ? undefined : Number(e.target.value))} />
                      </FormControl>
                      <FormMessage />
                    </FormItem>
                  )}
                />
                <FormField
                  control={form.control}
                  name="polyunsaturatedFat"
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel>Polyunsaturated fat (grams)</FormLabel>
                      <FormControl>
                        <Input type="number" step="0.1" placeholder="e.g., 4" value={field.value ?? ''} onChange={(e) => field.onChange(e.target.value === '' ? undefined : Number(e.target.value))} />
                      </FormControl>
                      <FormMessage />
                    </FormItem>
                  )}
                />
              </div>
              <Button type="submit" className="w-full md:w-auto">
                Calculate fat quality score
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
            <CardDescription>See fat quality score, SFA/MUFA/PUFA ratios, and recommendations.</CardDescription>
          </CardHeader>
          <CardContent className="space-y-6">
            <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
              <div className="p-4 border rounded">
                <p className="text-sm text-muted-foreground">Total fat</p>
                <p className="text-2xl font-semibold text-primary">{result.totalFat.toFixed(1)}g</p>
                <p className="text-xs text-muted-foreground">All types</p>
              </div>
              <div className="p-4 border rounded">
                <p className="text-sm text-muted-foreground">SFA</p>
                <p className="text-2xl font-semibold text-primary">{result.sfaPercent.toFixed(1)}%</p>
                <p className="text-xs text-muted-foreground">Saturated</p>
              </div>
              <div className="p-4 border rounded">
                <p className="text-sm text-muted-foreground">MUFA</p>
                <p className="text-2xl font-semibold text-primary">{result.mufaPercent.toFixed(1)}%</p>
                <p className="text-xs text-muted-foreground">Monounsaturated</p>
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
            <strong>Total fat</strong> = saturated fat + monounsaturated fat + polyunsaturated fat (grams).
          </p>
          <p>
            <strong>Fat percentages</strong> = (each fat type / total fat) Ã— 100. Optimal: SFA &lt;30%, MUFA 40-50%, PUFA 20-30%.
          </p>
          <p>
            <strong>Quality score</strong> = calculated from SFA (0-30 points, inverted), MUFA (0-35 points), and PUFA (0-35 points). Higher scores indicate better fat quality.
          </p>
          <p>Fat quality score reflects the balance of fat types. Higher MUFA and PUFA with limited SFA supports better cardiovascular health and metabolic outcomes.</p>
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
                <p className="text-sm text-muted-foreground">Quality score</p>
                <p className="text-xl font-semibold text-primary">{result.qualityScore.toFixed(0)}</p>
                <p className="text-xs text-muted-foreground">Out of 100</p>
              </div>
              <div className="p-4 border rounded">
                <p className="text-sm text-muted-foreground">PUFA</p>
                <p className="text-xl font-semibold text-primary">{result.pufaPercent.toFixed(1)}%</p>
                <p className="text-xs text-muted-foreground">Polyunsaturated</p>
              </div>
              <div className="p-4 border rounded">
                <p className="text-sm text-muted-foreground">MUFA:PUFA ratio</p>
                <p className="text-xl font-semibold text-primary">
                  {result.pufaPercent > 0 ? (result.mufaPercent / result.pufaPercent).toFixed(2) : 'N/A'}:1
                </p>
                <p className="text-xs text-muted-foreground">Ratio</p>
              </div>
            </div>
          ) : (
            <p className="text-sm text-muted-foreground">Enter your fat data to see additional insights.</p>
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
    <meta itemProp="name" content="The Definitive Guide to Fat Quality: Understanding SFA, MUFA, and PUFA Ratios for Cardiovascular Health" />
    <meta itemProp="description" content="An in-depth guide detailing the three main types of dietary fats (Saturated, Monounsaturated, Polyunsaturated), their chemical structures, food sources, and the evidence-based recommendation to shift the intake ratio for improved cardiovascular health." />
    <meta itemProp="keywords" content="fat quality SFA MUFA PUFA ratio, saturated fatty acids health effects, monounsaturated fat sources, polyunsaturated fatty acids omega 3, ideal fat intake ratio, dietary guidelines for saturated fat, healthy eating fat types" />
    <meta itemProp="author" content="[Your Site's Health Team]" />
    <meta itemProp="datePublished" content="2025-12-03" />
    <meta itemProp="url" content="/definitive-fat-quality-guide" />

    <h1 className="text-3xl md:text-4xl font-extrabold text-foreground mb-4" itemProp="headline">The Definitive Guide to Dietary Fat Quality: Saturated, Mono- and Polyunsaturated Fatty Acids</h1>
    <p className="text-lg italic text-gray-700">Understanding the core differences between the major types of dietary fats, their impact on cholesterol, and the authoritative guidelines for optimizing intake ratios.</p>


    {/* TABLE OF CONTENTS (INTERNAL LINKS FOR UX AND SEO) */}
    <h2 className="text-2xl font-bold text-foreground mt-8 mb-4">Table of Contents: Jump to a Section</h2>
    <ul className="list-disc ml-6 space-y-2 text-blue-600">
        <li><a href="#structure" className="hover:underline">The Chemical Basis of Fat Quality</a></li>
        <li><a href="#sfa" className="hover:underline">Saturated Fatty Acids (SFA): Structure and Sources</a></li>
        <li><a href="#mufa" className="hover:underline">Monounsaturated Fatty Acids (MUFA): Health Benefits and Sources</a></li>
        <li><a href="#pufa" className="hover:underline">Polyunsaturated Fatty Acids (PUFA): Essential Omegas</a></li>
        <li><a href="#ratio" className="hover:underline">Optimizing the Ratio: Replacing SFA with MUFA/PUFA</a></li>
        <li><a href="#guidelines" className="hover:underline">Official Intake Guidelines (AHA, USDA)</a></li>
    </ul>
<hr />

    {/* THE CHEMICAL BASIS OF FAT QUALITY */}
    <h2 id="structure" className="text-2xl font-bold text-foreground pt-8" itemProp="articleSection">The Chemical Basis of Fat Quality</h2>
    <p>Dietary fats are composed of triglyceridesâ€”three fatty acid chains attached to a glycerol backbone. The health effect of the fat is determined almost entirely by the <b>saturation</b> of these fatty acid chainsâ€”specifically, the number of double bonds present along the carbon chain.</p>

    <h3 className="text-xl font-semibold text-foreground mt-6">Saturation and Physical State</h3>
    <p>The degree of saturation dictates the fat's physical state at room temperature:</p>
    <ul>
        <li><b>Saturated Fats (SFA):</b> No double bonds, resulting in straight, tightly packed chains. They are typically <b>solid</b> at room temperature (e.g., butter, lard).</li>
        <li><b>Unsaturated Fats (MUFA/PUFA):</b> Contain one or more double bonds, which creates "kinks" in the chain, preventing tight packing. They are typically <b>liquid</b> at room temperature (e.g., olive oil, soybean oil).</li>
    </ul>
    

<hr />

    {/* SATURATED FATTY ACIDS (SFA): STRUCTURE AND SOURCES */}
    <h2 id="sfa" className="text-2xl font-bold text-foreground pt-8" itemProp="articleSection">Saturated Fatty Acids (SFA): Structure and Sources</h2>
    <p>Saturated fatty acids contain zero carbon-carbon double bonds, meaning they are "saturated" with hydrogen atoms. While individual SFAs vary in their metabolic impact (e.g., stearic acid vs. palmitic acid), the authoritative consensus focuses on limiting SFA intake due to the overall effect on cholesterol.</p>

    <h3 className="text-xl font-semibold text-foreground mt-6">Primary Sources and Health Impact</h3>
    <p>SFA is primarily found in animal products and tropical oils:</p>
    <ul>
        <li><b>Animal Sources:</b> Fatty cuts of meat, poultry skin, high-fat dairy (butter, cream, cheese).</li>
        <li><b>Tropical Oils:</b> Coconut oil, palm oil, and palm kernel oil.</li>
    </ul>
    <p>The primary concern with high SFA intake is its established effect of raising <b>LDL cholesterol</b> (the "bad" cholesterol) in the bloodstream, which is a major risk factor for atherosclerosis and heart disease.</p>

<hr />

    {/* MONOUNSATURATED FATTY ACIDS (MUFA): HEALTH BENEFITS AND SOURCES */}
    <h2 id="mufa" className="text-2xl font-bold text-foreground pt-8" itemProp="articleSection">Monounsaturated Fatty Acids (MUFA): Health Benefits and Sources</h2>
    <p>Monounsaturated fatty acids contain exactly <b>one</b> carbon-carbon double bond. They are considered highly beneficial for cardiovascular health and are the cornerstone of the Mediterranean diet.</p>

    <h3 className="text-xl font-semibold text-foreground mt-6">Primary Sources and Health Impact</h3>
    <p>The most common and abundant MUFA is <b>oleic acid</b>, found in:</p>
    <ul>
        <li><b>Olive Oil:</b> Especially extra virgin olive oil.</li>
        <li><b>Avocados and Avocado Oil.</b></li>
        <li><b>Nuts:</b> Almonds, cashews, and pecans.</li>
    </ul>
    <p>Substituting SFA with MUFA can help <b>lower LDL cholesterol levels</b> while potentially maintaining or increasing <b>HDL cholesterol</b> (the "good" cholesterol), contributing to better overall lipid profiles and reduced cardiovascular risk.</p>

<hr />

    {/* POLYUNSATURATED FATTY ACIDS (PUFA): ESSENTIAL OMEGAS */}
    <h2 id="pufa" className="text-2xl font-bold text-foreground pt-8" itemProp="articleSection">Polyunsaturated Fatty Acids (PUFA): Essential Omegas</h2>
    <p>Polyunsaturated fatty acids contain <b>two or more</b> carbon-carbon double bonds. This group includes the essential fatty acids that the human body cannot synthesize and must obtain from the diet.</p>

    <h3 className="text-xl font-semibold text-foreground mt-6">Omega-3 (Alpha-Linolenic Acid)</h3>
    <p>Omega-3 fatty acids are known for their powerful anti-inflammatory effects. The essential Omega-3 is <b>alpha-linolenic acid (ALA)</b>, found in flaxseed, walnuts, and chia seeds. ALA can be converted (inefficiently) in the body to the long-chain Omega-3s: <b>EPA</b> (eicosapentaenoic acid) and <b>DHA</b> (docosahexaenoic acid), which are critical for brain function, eye health, and reducing inflammation. EPA and DHA are sourced directly from fatty fish and fish oil.</p>

    <h3 className="text-xl font-semibold text-foreground mt-6">Omega-6 (Linoleic Acid)</h3>
    <p>Omega-6 fatty acids are also essential. The essential Omega-6 is <b>linoleic acid (LA)</b>, which is abundant in most common vegetable oils (soybean, corn, sunflower) and is readily available in the typical Western diet. Omega-6s are necessary for cell structure and energy, but excessive intake relative to Omega-3s can promote inflammation.</p>

<hr />

    {/* OPTIMIZING THE RATIO: REPLACING SFA WITH MUFA/PUFA */}
    <h2 id="ratio" className="text-2xl font-bold text-foreground pt-8" itemProp="articleSection">Optimizing the Ratio: Replacing SFA with MUFA/PUFA</h2>
    <p>Current authoritative nutritional advice has shifted from focusing on total fat restriction to emphasizing <b>fat substitution</b>â€”that is, replacing SFA and trans fats with MUFA and PUFA. This substitution is the foundation of fat quality assessment.</p>

    <h3 className="text-xl font-semibold text-foreground mt-6">The Importance of Substitution</h3>
    <p>A high-quality fat ratio is achieved not by eliminating SFA entirely, but by ensuring that when SFA is consumed, it is balanced by unsaturated fats, and when SFA is reduced, it is replaced by an unsaturated fat source. Strong evidence from the **NIH** and **AHA** shows that replacing SFA with PUFA significantly lowers the risk of coronary heart disease.</p>

    <h3 className="text-xl font-semibold text-foreground mt-6">Omega-6 to Omega-3 Balance</h3>
    <p>While there is no single official recommendation for the Omega-6 to Omega-3 ratio, the goal is often to reduce the typically high Western ratio (often 10:1 to 20:1) to a ratio closer to <b>4:1 or lower</b>. This shift helps to leverage the anti-inflammatory benefits of Omega-3s and restore a healthier physiological balance.</p>

<hr />

    {/* OFFICIAL INTAKE GUIDELINES (AHA, USDA) */}
    <h2 id="guidelines" className="text-2xl font-bold text-foreground pt-8" itemProp="articleSection">Official Intake Guidelines (AHA, USDA)</h2>
    <p>Major health organizations provide clear, quantifiable limits for saturated fat intake to guide consumers toward healthier ratios as part of an overall heart-healthy dietary pattern.</p>

    <h3 className="text-xl font-semibold text-foreground mt-6">USDA and AHA Saturated Fat Limits</h3>
    <ul>
        <li><b>Dietary Guidelines for Americans (USDA):</b> Limit Saturated Fat intake to <b>less than 10%</b> of total daily calories.</li>
        <li><b>American Heart Association (AHA):</b> Recommends limiting Saturated Fat intake further, ideally to <b>5% to 6%</b> of total daily calories, especially for individuals with cardiovascular risk factors.</li>
    </ul>

    <h3 className="text-xl font-semibold text-foreground mt-6">Trans Fat Policy</h3>
    <p>Both the USDA and the AHA recommend that intake of **trans fats** (partially hydrogenated oils) be kept as <b>low as possible</b> (ideally 0%). This is based on conclusive evidence that trans fats raise LDL and lower HDL, posing a dual and significant threat to heart health.</p>

<hr />

    {/* CONCLUSION */}
    <h2 className="text-2xl font-bold text-foreground pt-8" itemProp="articleSection">Conclusion</h2>
    <p>Optimizing dietary fat quality is achieved by understanding the distinct metabolic effects of <b>Saturated Fatty Acids (SFA)</b>, <b>Monounsaturated Fatty Acids (MUFA)</b>, and <b>Polyunsaturated Fatty Acids (PUFA)</b>. The goal is to adhere to the official recommendation of keeping SFA below 10% of total calories while actively <b>substituting</b> those calories with MUFA (from olive oil and avocados) and PUFA (essential Omega-3s from fish and seeds). This substitution is the most effective dietary strategy for improving lipid profiles and supporting long-term cardiovascular health.</p>
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
          <p>This tool calculates fat quality score from saturated fat, monounsaturated fat, and polyunsaturated fat.</p>
          <p>Outputs include saturated fat, monounsaturated fat, polyunsaturated fat, total fat, percentages, quality score, status, recommendations, an action plan, and supporting metrics.</p>
          <p>Formula, steps, guide content, related tools, and FAQs ensure humans or AI assistants can interpret the methodology instantly.</p>
        </CardContent>
      </Card>
    </div>
  );
}


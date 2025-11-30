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
  uvIndex: z.number({ invalid_type_error: 'Enter UV index' }).min(0).max(15),
  exposureTime: z.number({ invalid_type_error: 'Enter exposure time' }).min(1).max(120),
  skinType: z.enum(['type1', 'type2', 'type3', 'type4', 'type5', 'type6'], {
    invalid_type_error: 'Select skin type',
  }),
  skinExposed: z.number({ invalid_type_error: 'Enter skin exposed' }).min(5).max(100),
  latitude: z.number({ invalid_type_error: 'Enter latitude' }).min(-90).max(90).optional(),
});

type FormValues = z.infer<typeof formSchema>;

type ResultPayload = {
  uvIndex: number;
  exposureTime: number;
  skinType: string;
  skinExposed: number;
  latitude: number | undefined;
  vitaminDSynthesized: number;
  synthesisScore: number;
  status: 'optimal' | 'good' | 'moderate' | 'low';
  interpretation: string;
  recommendations: string[];
  plan: { label: string; detail: string }[];
};

const steps = [
  'Enter UV index (0-15) from weather forecast or UV meter.',
  'Enter sun exposure time (minutes) without sunscreen.',
  'Select your skin type (I-VI) based on Fitzpatrick classification.',
  'Enter percentage of skin exposed (face, arms, legs, etc.).',
  'Enter latitude if known (optional, affects synthesis efficiency).',
  'Review vitamin D synthesized, synthesis score, and recommendations.',
];

const faqs = [
  {
    question: 'How does the body synthesize vitamin D from sunlight?',
    answer:
      'When UVB rays from sunlight hit the skin, they convert 7-dehydrocholesterol (a compound in skin) into previtamin D3, which then converts to vitamin D3 (cholecalciferol). This process occurs in the skin and requires direct UVB exposure without sunscreen blocking the rays.',
  },
  {
    question: 'What factors affect vitamin D synthesis?',
    answer:
      'Factors include: UV index (higher = more synthesis), exposure time, skin type (darker skin needs longer exposure), percentage of skin exposed, latitude (higher latitude = less efficient), time of day (10am-3pm most effective), season, age (older adults synthesize less), and sunscreen use (blocks UVB).',
  },
  {
    question: 'How much sun exposure is needed for vitamin D?',
    answer:
      'For most people, 10-30 minutes of sun exposure 2-3 times per week to face, arms, and legs (without sunscreen) is sufficient. Darker skin types may need 30-60 minutes. The exact time depends on UV index, skin type, and amount of skin exposed.',
  },
  {
    question: 'What is the recommended daily vitamin D intake?',
    answer:
      'Recommended daily intake: 600-800 IU (15-20 mcg) for adults, 400 IU (10 mcg) for infants, and 800-1000 IU (20-25 mcg) for older adults. However, individual needs vary, and many people may need more, especially with limited sun exposure.',
  },
  {
    question: 'Can I get too much vitamin D from sun exposure?',
    answer:
      'No, the body regulates vitamin D production from sunlight. After sufficient synthesis, further UVB exposure degrades excess previtamin D3, preventing toxicity. However, excessive sun exposure increases skin cancer risk, so balance is important.',
  },
  {
    question: 'How does skin type affect vitamin D synthesis?',
    answer:
      'Darker skin contains more melanin, which reduces UVB penetration and vitamin D synthesis. Type I (pale) skin synthesizes vitamin D most efficiently, while Type VI (dark) skin needs 3-6 times longer exposure for the same amount of synthesis.',
  },
  {
    question: 'What time of day is best for vitamin D synthesis?',
    answer:
      'Midday (10am-3pm) is most effective because UVB rays are strongest when the sun is high. Early morning and late afternoon have less UVB, requiring longer exposure. However, midday sun also has highest UV index, so balance synthesis needs with sun protection.',
  },
  {
    question: 'Does sunscreen prevent vitamin D synthesis?',
    answer:
      'Yes, sunscreen blocks UVB rays needed for vitamin D synthesis. SPF 15 blocks about 93% of UVB, SPF 30 blocks about 97%. For vitamin D synthesis, expose skin without sunscreen for recommended time, then apply sunscreen for longer exposure.',
  },
  {
    question: 'What about vitamin D in winter or high latitudes?',
    answer:
      'At latitudes above 35° (north or south), UVB rays are too weak for vitamin D synthesis during winter months (November-February in northern hemisphere). During this time, vitamin D supplements or dietary sources are necessary.',
  },
  {
    question: 'Should I rely solely on sun exposure for vitamin D?',
    answer:
      'While sun exposure is a natural source, many factors limit synthesis (latitude, season, skin type, lifestyle). Consider combining moderate sun exposure with dietary sources (fatty fish, fortified foods) and supplements if needed. Blood testing can determine your vitamin D status.',
  },
];

const relatedCalculators = [
  {
    name: 'UV Exposure Risk Calculator',
    slug: 'uv-exposure-risk-calculator',
    description: 'Assess UV exposure risk alongside vitamin D synthesis.',
  },
  {
    name: 'Vitamin D Sun Exposure Calculator',
    slug: 'vitamin-d-sun-exposure-calculator',
    description: 'Evaluate safe sun exposure for vitamin D synthesis.',
  },
  {
    name: 'Daily Calorie Needs Calculator',
    slug: 'daily-calorie-needs-calculator',
    description: 'Calculate nutritional needs including vitamin D.',
  },
  {
    name: 'Cancer Risk Lifestyle Calculator',
    slug: 'cancer-risk-lifestyle-calculator',
    description: 'Assess comprehensive lifestyle factors and health risks.',
  },
];

const baseUrl = 'https://mycalculating.com/category/health-fitness/vitamin-d-synthesis-from-sunlight-estimator';

const schemaMarkup = {
  '@context': 'https://schema.org',
  '@graph': [
    {
      '@type': 'BreadcrumbList',
      itemListElement: [
        { '@type': 'ListItem', position: 1, name: 'Home', item: 'https://mycalculating.com' },
        { '@type': 'ListItem', position: 2, name: 'Health & Fitness', item: 'https://mycalculating.com/category/health-fitness' },
        { '@type': 'ListItem', position: 3, name: 'Vitamin D Synthesis from Sunlight Estimator', item: baseUrl },
      ],
    },
    {
      '@type': 'SoftwareApplication',
      name: 'Vitamin D Synthesis from Sunlight Estimator',
      applicationCategory: 'Calculator',
      operatingSystem: 'Web Browser',
      description: 'Estimate vitamin D synthesis from sunlight exposure based on UV index, exposure time, skin type, and skin area exposed.',
      url: baseUrl,
      offers: { '@type': 'Offer', price: '0', priceCurrency: 'USD' },
    },
  ],
};

const clamp = (value: number, min: number, max: number) => Math.min(max, Math.max(min, value));

// Skin type synthesis efficiency (darker skin = less efficient)
const skinTypeEfficiency: Record<string, number> = {
  type1: 1.0, // Most efficient
  type2: 0.9,
  type3: 0.7,
  type4: 0.5,
  type5: 0.35,
  type6: 0.25, // Least efficient
};

const calculateResult = (values: FormValues): ResultPayload => {
  const uvIndex = values.uvIndex;
  const exposureTime = values.exposureTime;
  const skinType = values.skinType;
  const skinExposed = values.skinExposed;
  const latitude = values.latitude;
  
  // Base synthesis: UV Index × Exposure Time × Skin Efficiency × Skin Area
  const skinEfficiency = skinTypeEfficiency[skinType] || 1.0;
  const skinAreaFactor = skinExposed / 100; // Percentage to factor
  
  // Latitude adjustment (higher latitude = less efficient, especially in winter)
  let latitudeFactor = 1.0;
  if (latitude !== undefined) {
    if (Math.abs(latitude) > 50) {
      latitudeFactor = 0.5; // High latitude, reduced efficiency
    } else if (Math.abs(latitude) > 35) {
      latitudeFactor = 0.75; // Moderate latitude
    }
  }
  
  // Calculate vitamin D synthesized (IU)
  // Reference: UV Index 6, 15 minutes, Type III skin, 25% exposed = ~1000 IU
  const baseSynthesis = uvIndex * exposureTime * skinEfficiency * skinAreaFactor * latitudeFactor;
  const vitaminDSynthesized = baseSynthesis * 6.67; // Scale to approximate IU (rough estimate)
  
  // Synthesis score (0-100, normalized)
  // Target: 1000-2000 IU per session is good
  const targetSynthesis = 1500; // IU
  const synthesisScore = clamp((vitaminDSynthesized / targetSynthesis) * 100, 0, 100);
  
  let status: ResultPayload['status'] = 'optimal';
  let interpretation = 'Your sun exposure appears adequate for vitamin D synthesis. Continue moderate, regular exposure.';

  if (synthesisScore < 30 || vitaminDSynthesized < 500) {
    status = 'low';
    interpretation = 'Your sun exposure may be insufficient for adequate vitamin D synthesis. Consider increasing exposure time (if safe), exposing more skin area, or supplementing with dietary sources or supplements.';
  } else if (synthesisScore < 50 || vitaminDSynthesized < 1000) {
    status = 'moderate';
    interpretation = 'Your sun exposure provides moderate vitamin D synthesis. Consider slightly increasing exposure time or skin area exposed, or ensure you get regular exposure 2-3 times per week.';
  } else if (synthesisScore < 80) {
    status = 'good';
    interpretation = 'Your sun exposure provides good vitamin D synthesis. Maintain regular exposure 2-3 times per week for optimal vitamin D levels.';
  } else {
    status = 'optimal';
    interpretation = 'Your sun exposure provides excellent vitamin D synthesis. Continue regular, moderate exposure while maintaining sun safety practices.';
  }

  const recommendations = [
    'Balance sun exposure: aim for 10-30 minutes of sun exposure 2-3 times per week to face, arms, and legs (without sunscreen) during peak UVB hours (10am-3pm) for optimal vitamin D synthesis.',
    'Protect after synthesis: after getting adequate sun exposure for vitamin D, apply sunscreen and seek shade to prevent skin damage. Don\'t use vitamin D needs as excuse for excessive unprotected exposure.',
  ];
  
  if (skinType === 'type5' || skinType === 'type6') {
    recommendations.push('Darker skin needs longer exposure: with darker skin types, you may need 30-60 minutes of exposure for adequate synthesis. Consider exposing larger skin areas or supplementing with dietary sources if exposure is limited.');
  }
  
  if (latitude !== undefined && Math.abs(latitude) > 35) {
    recommendations.push('High latitude considerations: at higher latitudes, UVB rays are weaker, especially in winter. During winter months (November-February in northern hemisphere), consider vitamin D supplements as sun exposure may be insufficient.');
  }
  
  if (synthesisScore < 50) {
    recommendations.push('Increase exposure or supplement: if sun exposure is limited, consider dietary sources (fatty fish, fortified foods) or vitamin D supplements. Blood testing can determine your vitamin D status and supplementation needs.');
  }

  const plan = [
    { label: 'This Week', detail: `Schedule regular sun exposure sessions (2-3 times per week) during peak UVB hours. Expose face, arms, and legs for recommended time, then apply sunscreen for longer activities.` },
    { label: 'This Month', detail: 'Establish consistent sun exposure routine. Monitor vitamin D levels if possible through blood testing. Adjust exposure time based on season, latitude, and skin type. Consider supplements if exposure is consistently limited.' },
    { label: 'Ongoing', detail: 'Maintain balance between vitamin D synthesis and sun protection. Get regular moderate sun exposure while protecting skin from excessive UV. Consider annual vitamin D blood testing to monitor levels, especially if you have limited sun exposure.' },
  ];

  return { uvIndex, exposureTime, skinType, skinExposed, latitude, vitaminDSynthesized, synthesisScore, status, interpretation, recommendations, plan };
};

export default function VitaminDSynthesisFromSunlightEstimator() {
  const [result, setResult] = useState<ResultPayload | null>(null);

  const form = useForm<FormValues>({
    resolver: zodResolver(formSchema),
    defaultValues: {
      uvIndex: undefined,
      exposureTime: undefined,
      skinType: undefined,
      skinExposed: undefined,
      latitude: undefined,
    },
  });

  return (
    <div className="space-y-8">
      <Script id="vitamin-d-synthesis-schema" type="application/ld+json" strategy="afterInteractive" dangerouslySetInnerHTML={{ __html: JSON.stringify(schemaMarkup) }} />

      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <Activity className="h-5 w-5" />
            Vitamin D Synthesis from Sunlight Estimator
          </CardTitle>
          <CardDescription>Estimate vitamin D synthesis from sunlight exposure based on UV index, exposure time, skin type, and skin area exposed.</CardDescription>
        </CardHeader>
      </Card>

      <Card>
        <CardHeader>
          <CardTitle>Input your sun exposure data</CardTitle>
        </CardHeader>
        <CardContent>
          <Form {...form}>
            <form onSubmit={form.handleSubmit((values) => setResult(calculateResult(values)))} className="space-y-6">
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <FormField
                  control={form.control}
                  name="uvIndex"
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel>UV Index (0-15)</FormLabel>
                      <FormControl>
                        <Input type="number" step="0.1" placeholder="e.g., 6.5" value={field.value ?? ''} onChange={(e) => field.onChange(e.target.value === '' ? undefined : Number(e.target.value))} />
                      </FormControl>
                      <FormMessage />
                    </FormItem>
                  )}
                />
                <FormField
                  control={form.control}
                  name="exposureTime"
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel>Exposure time (minutes, no sunscreen)</FormLabel>
                      <FormControl>
                        <Input type="number" step="1" placeholder="e.g., 15" value={field.value ?? ''} onChange={(e) => field.onChange(e.target.value === '' ? undefined : Number(e.target.value))} />
                      </FormControl>
                      <FormMessage />
                    </FormItem>
                  )}
                />
                <FormField
                  control={form.control}
                  name="skinType"
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel>Skin type</FormLabel>
                      <FormControl>
                        <select
                          value={field.value ?? ''}
                          onChange={(e) => field.onChange(e.target.value as FormValues['skinType'])}
                          className="flex h-10 w-full rounded-md border border-input bg-background px-3 py-2 text-sm ring-offset-background file:border-0 file:bg-transparent file:text-sm file:font-medium placeholder:text-muted-foreground focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2 disabled:cursor-not-allowed disabled:opacity-50"
                        >
                          <option value="">Select skin type</option>
                          <option value="type1">Type I - Always burns, never tans</option>
                          <option value="type2">Type II - Burns easily, tans minimally</option>
                          <option value="type3">Type III - Sometimes burns, gradually tans</option>
                          <option value="type4">Type IV - Burns minimally, tans easily</option>
                          <option value="type5">Type V - Very rarely burns, tans profusely</option>
                          <option value="type6">Type VI - Never burns, deeply pigmented</option>
                        </select>
                      </FormControl>
                      <FormMessage />
                    </FormItem>
                  )}
                />
                <FormField
                  control={form.control}
                  name="skinExposed"
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel>Skin exposed (%)</FormLabel>
                      <FormControl>
                        <Input type="number" step="5" placeholder="e.g., 25 (face, arms)" value={field.value ?? ''} onChange={(e) => field.onChange(e.target.value === '' ? undefined : Number(e.target.value))} />
                      </FormControl>
                      <FormMessage />
                    </FormItem>
                  )}
                />
                <FormField
                  control={form.control}
                  name="latitude"
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel>Latitude (optional)</FormLabel>
                      <FormControl>
                        <Input type="number" step="1" placeholder="e.g., 40 (north)" value={field.value ?? ''} onChange={(e) => field.onChange(e.target.value === '' ? undefined : Number(e.target.value))} />
                      </FormControl>
                      <FormMessage />
                    </FormItem>
                  )}
                />
              </div>
              <Button type="submit" className="w-full md:w-auto">
                Estimate vitamin D synthesis
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
            <CardDescription>See vitamin D synthesized, synthesis score, and recommendations.</CardDescription>
          </CardHeader>
          <CardContent className="space-y-6">
            <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
              <div className="p-4 border rounded">
                <p className="text-sm text-muted-foreground">Vitamin D synthesized</p>
                <p className="text-2xl font-semibold text-primary">{result.vitaminDSynthesized.toFixed(0)}</p>
                <p className="text-xs text-muted-foreground">IU (estimated)</p>
              </div>
              <div className="p-4 border rounded">
                <p className="text-sm text-muted-foreground">Synthesis score</p>
                <p className="text-2xl font-semibold text-primary">{result.synthesisScore.toFixed(1)}</p>
                <p className="text-xs text-muted-foreground">Out of 100</p>
              </div>
              <div className="p-4 border rounded">
                <p className="text-sm text-muted-foreground">UV Index</p>
                <p className="text-2xl font-semibold text-primary">{result.uvIndex.toFixed(1)}</p>
                <p className="text-xs text-muted-foreground">Current level</p>
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
            <strong>Vitamin D synthesis</strong> = UV Index × Exposure Time × Skin Efficiency × Skin Area Factor × Latitude Factor × Scale Factor. Skin efficiency varies by skin type (Type I: 100%, Type VI: 25%). Skin area factor = Percentage Exposed / 100.
          </p>
          <p>
            <strong>Latitude factor</strong> adjusts for UVB availability: latitudes above 50° = 0.5, 35-50° = 0.75, below 35° = 1.0. Higher latitudes have weaker UVB, especially in winter.
          </p>
          <p>
            <strong>Synthesis score</strong> = (Vitamin D Synthesized / Target Synthesis) × 100, normalized to 0-100 scale where target is 1500 IU per session.
          </p>
          <p>Vitamin D synthesis requires direct UVB exposure without sunscreen. Balance synthesis needs with sun protection—get adequate exposure for vitamin D, then protect skin from excessive UV damage.</p>
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
                <p className="text-sm text-muted-foreground">Weekly synthesis</p>
                <p className="text-xl font-semibold text-primary">
                  {(result.vitaminDSynthesized * 3).toFixed(0)} IU
                </p>
                <p className="text-xs text-muted-foreground">3x per week</p>
              </div>
              <div className="p-4 border rounded">
                <p className="text-sm text-muted-foreground">Skin efficiency</p>
                <p className="text-xl font-semibold text-primary">
                  {(skinTypeEfficiency[result.skinType] || 1.0) * 100}%
                </p>
                <p className="text-xs text-muted-foreground">Based on skin type</p>
              </div>
              <div className="p-4 border rounded">
                <p className="text-sm text-muted-foreground">Synthesis level</p>
                <p className="text-xl font-semibold text-primary">
                  {result.synthesisScore >= 80 ? 'Excellent' : result.synthesisScore >= 50 ? 'Good' : result.synthesisScore >= 30 ? 'Moderate' : 'Low'}
                </p>
                <p className="text-xs text-muted-foreground">Based on score</p>
              </div>
            </div>
          ) : (
            <p className="text-sm text-muted-foreground">Enter your sun exposure data to see additional insights.</p>
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
    <meta itemProp="name" content="The Definitive Guide to Vitamin D Synthesis from Sunlight: Optimizing Natural Production" />
    <meta itemProp="description" content="An expert guide on how the body synthesizes vitamin D from sunlight, factors affecting synthesis, and strategies to optimize natural production while maintaining sun safety." />
    <meta itemProp="keywords" content="vitamin D synthesis calculator, sunlight vitamin D, UVB vitamin D production, vitamin D from sun, skin type vitamin D" />
    <meta itemProp="author" content="[Your Site's Health Team]" />
    <meta itemProp="datePublished" content="2025-12-01" />
    <meta itemProp="url" content="/definitive-vitamin-d-synthesis-guide" />

    <h1 className="text-3xl md:text-4xl font-extrabold text-foreground mb-4" itemProp="headline">The Definitive Guide to Vitamin D Synthesis from Sunlight: Optimizing Natural Production</h1>
    <p className="text-lg italic text-gray-700">Explore how the body synthesizes vitamin D from sunlight, understand factors affecting production, and learn to balance vitamin D needs with sun protection.</p>

    <h2 className="text-2xl font-bold text-foreground mt-8 mb-4">Table of Contents: Jump to a Section</h2>
    <ul className="list-disc ml-6 space-y-2 text-blue-600">
        <li><a href="#how-synthesis-works" className="hover:underline">How Vitamin D Synthesis Works</a></li>
        <li><a href="#factors-affecting" className="hover:underline">Factors Affecting Synthesis</a></li>
        <li><a href="#optimal-exposure" className="hover:underline">Optimal Sun Exposure for Vitamin D</a></li>
        <li><a href="#skin-type-differences" className="hover:underline">Skin Type and Vitamin D Synthesis</a></li>
        <li><a href="#latitude-season" className="hover:underline">Latitude and Seasonal Considerations</a></li>
    </ul>
<hr />

    <h2 id="how-synthesis-works" className="text-2xl font-bold text-foreground pt-8" itemProp="articleSection">How Vitamin D Synthesis Works</h2>
    <p>**Vitamin D synthesis** is a natural process where the body produces vitamin D3 (cholecalciferol) when skin is exposed to UVB rays from sunlight. This process is essential for bone health, immune function, and numerous other physiological processes.</p>

<h3 className="text-xl font-semibold text-foreground mt-6">The Synthesis Process</h3>
<p>When UVB rays (wavelengths 290-315 nm) hit the skin:</p>
<ol>
    <li><b>UVB absorption:</b> UVB rays penetrate the epidermis (outer skin layer)</li>
    <li><b>7-dehydrocholesterol conversion:</b> UVB converts 7-dehydrocholesterol (a compound naturally present in skin) into previtamin D3</li>
    <li><b>Thermal conversion:</b> Previtamin D3 spontaneously converts to vitamin D3 (cholecalciferol) through body heat</li>
    <li><b>Transport:</b> Vitamin D3 enters the bloodstream and is transported to the liver</li>
    <li><b>Activation:</b> Liver converts D3 to 25-hydroxyvitamin D (calcidiol), then kidneys convert it to active 1,25-dihydroxyvitamin D (calcitriol)</li>
</ol>
<p>This entire process occurs naturally when skin is exposed to UVB rays without sunscreen blocking them.</p>

<h3 className="text-xl font-semibold text-foreground mt-6">Why UVB Specifically</h3>
<p>Only UVB rays (not UVA) can initiate vitamin D synthesis because:</p>
<ul>
    <li>UVB has the right wavelength (290-315 nm) to convert 7-dehydrocholesterol</li>
    <li>UVA rays (315-400 nm) don't have sufficient energy for this conversion</li>
    <li>UVB is strongest when the sun is high (10am-3pm)</li>
    <li>UVB is blocked by glass, so indoor sunlight doesn't work</li>
</ul>

<hr />

    <h2 id="factors-affecting" className="text-2xl font-bold text-foreground pt-8" itemProp="articleSection">Factors Affecting Vitamin D Synthesis</h2>
    <p>Multiple factors influence how much vitamin D your body synthesizes from sun exposure:</p>

    <h3 className="text-xl font-semibold text-foreground mt-6">1. UV Index</h3>
    <p>Higher UV index means stronger UVB rays and more efficient synthesis. UV index 3-5 provides moderate synthesis, 6-7 provides good synthesis, and 8+ provides excellent synthesis (but also higher skin cancer risk).</p>

    <h3 className="text-xl font-semibold text-foreground mt-6">2. Exposure Time</h3>
    <p>Longer exposure increases synthesis, but there's a limit. After sufficient synthesis (typically 10-30 minutes for light skin), further exposure degrades excess previtamin D3, preventing toxicity but also limiting additional production.</p>

    <h3 className="text-xl font-semibold text-foreground mt-6">3. Skin Type</h3>
    <p>Darker skin contains more melanin, which reduces UVB penetration. Type I (pale) skin synthesizes vitamin D most efficiently, while Type VI (dark) skin needs 3-6 times longer exposure for the same amount.</p>

    <h3 className="text-xl font-semibold text-foreground mt-6">4. Skin Area Exposed</h3>
    <p>More skin exposed = more synthesis. Exposing face, arms, and legs (about 25% of body) is typically sufficient. Exposing more area allows shorter exposure time.</p>

    <h3 className="text-xl font-semibold text-foreground mt-6">5. Latitude</h3>
    <p>At higher latitudes (above 35°), UVB rays are weaker, especially in winter. During winter months at high latitudes, UVB may be insufficient for synthesis, requiring supplements.</p>

    <h3 className="text-xl font-semibold text-foreground mt-6">6. Time of Day</h3>
    <p>Midday (10am-3pm) has strongest UVB. Early morning and late afternoon have less UVB, requiring longer exposure for the same synthesis.</p>

    <h3 className="text-xl font-semibold text-foreground mt-6">7. Season</h3>
    <p>Summer has strongest UVB. Winter has weaker UVB, especially at higher latitudes. Some regions may have insufficient UVB for synthesis during winter.</p>

    <h3 className="text-xl font-semibold text-foreground mt-6">8. Age</h3>
    <p>Older adults (70+) have reduced 7-dehydrocholesterol in skin and may synthesize 75% less vitamin D than younger adults, requiring longer exposure or supplements.</p>

    <h3 className="text-xl font-semibold text-foreground mt-6">9. Sunscreen</h3>
    <p>Sunscreen blocks UVB rays needed for synthesis. SPF 15 blocks ~93%, SPF 30 blocks ~97%. For synthesis, expose skin without sunscreen for recommended time, then apply sunscreen.</p>

<hr />

    <h2 id="optimal-exposure" className="text-2xl font-bold text-foreground pt-8" itemProp="articleSection">Optimal Sun Exposure for Vitamin D</h2>
    <p>Balancing vitamin D synthesis with sun protection requires understanding optimal exposure:</p>

    <h3 className="text-xl font-semibold text-foreground mt-6">General Guidelines</h3>
    <ul>
        <li><b>Light skin (Types I-III):</b> 10-15 minutes, 2-3 times per week, face/arms/legs exposed</li>
        <li><b>Medium skin (Types IV-V):</b> 20-30 minutes, 2-3 times per week</li>
        <li><b>Dark skin (Type VI):</b> 30-60 minutes, 2-3 times per week</li>
    </ul>
    <p>These times are for midday sun (10am-3pm) with moderate UV index (3-7). Adjust for UV index and time of day.</p>

    <h3 className="text-xl font-semibold text-foreground mt-6">The Balance</h3>
    <p>Key principles for balancing synthesis and protection:</p>
    <ul>
        <li>Get adequate exposure for vitamin D (10-30 minutes without sunscreen)</li>
        <li>Then apply sunscreen and seek shade for longer activities</li>
        <li>Don't use vitamin D needs as excuse for excessive unprotected exposure</li>
        <li>Consider supplements if sun exposure is consistently limited</li>
    </ul>

<hr />

    <h2 id="skin-type-differences" className="text-2xl font-bold text-foreground pt-8" itemProp="articleSection">Skin Type and Vitamin D Synthesis</h2>
    <p>Skin type significantly affects vitamin D synthesis efficiency:</p>

    <h3 className="text-xl font-semibold text-foreground mt-6">Why Skin Type Matters</h3>
    <p>Melanin (skin pigment) absorbs UVB rays, reducing their penetration to the deeper skin layers where 7-dehydrocholesterol is located. More melanin = less UVB penetration = less efficient synthesis.</p>

    <h3 className="text-xl font-semibold text-foreground mt-6">Synthesis Efficiency by Skin Type</h3>
    <ul>
        <li><b>Type I (pale):</b> 100% efficiency - synthesizes vitamin D most quickly</li>
        <li><b>Type II (fair):</b> 90% efficiency</li>
        <li><b>Type III (medium):</b> 70% efficiency</li>
        <li><b>Type IV (olive):</b> 50% efficiency</li>
        <li><b>Type V (brown):</b> 35% efficiency</li>
        <li><b>Type VI (dark):</b> 25% efficiency - needs 3-4x longer exposure</li>
    </ul>
    <p>This is why darker-skinned individuals may need 30-60 minutes of exposure for adequate synthesis, while lighter-skinned individuals may only need 10-15 minutes.</p>

<hr />

    <h2 id="latitude-season" className="text-2xl font-bold text-foreground pt-8" itemProp="articleSection">Latitude and Seasonal Considerations</h2>
    <p>Geographic location and season dramatically affect UVB availability:</p>

    <h3 className="text-xl font-semibold text-foreground mt-6">Latitude Effects</h3>
    <p>At higher latitudes, the sun's angle is lower, and UVB rays must travel through more atmosphere, reducing their strength:</p>
    <ul>
        <li><b>Below 35° latitude:</b> UVB available year-round, efficient synthesis</li>
        <li><b>35-50° latitude:</b> UVB available most of year, reduced in winter</li>
        <li><b>Above 50° latitude:</b> UVB very weak in winter, may be insufficient for synthesis</li>
    </ul>

    <h3 className="text-xl font-semibold text-foreground mt-6">Winter Considerations</h3>
    <p>During winter months (November-February in northern hemisphere, May-August in southern hemisphere) at latitudes above 35°:</p>
    <ul>
        <li>UVB rays are too weak for significant vitamin D synthesis</li>
        <li>Even extended sun exposure may be insufficient</li>
        <li>Vitamin D supplements or dietary sources become necessary</li>
        <li>Body relies on stored vitamin D from summer months</li>
    </ul>
    <p>This is why many people in northern climates develop vitamin D deficiency in winter.</p>

<hr />

    <h2 className="text-2xl font-bold text-foreground pt-8" itemProp="articleSection">Conclusion</h2>
    <p>Vitamin D synthesis from sunlight is a natural, efficient process when conditions are right. Understanding factors like UV index, skin type, latitude, and season helps you optimize synthesis while maintaining sun safety. Use this calculator to estimate your vitamin D production, and remember to balance synthesis needs with skin protection. For many people, especially those at higher latitudes or with limited sun exposure, vitamin D supplements may be necessary to maintain adequate levels year-round.</p>
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
          <p>This tool estimates vitamin D synthesis from sunlight exposure based on UV index, exposure time, skin type, skin area exposed, and latitude.</p>
          <p>Outputs include vitamin D synthesized (IU), synthesis score, status, recommendations, an action plan, and supporting metrics.</p>
          <p>Formula, steps, guide content, related tools, and FAQs ensure humans or AI assistants can interpret the methodology instantly.</p>
        </CardContent>
      </Card>
    </div>
  );
}


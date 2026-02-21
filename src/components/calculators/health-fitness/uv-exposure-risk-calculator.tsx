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
  exposureTime: z.number({ invalid_type_error: 'Enter exposure time' }).min(1).max(480),
  skinType: z.enum(['type1', 'type2', 'type3', 'type4', 'type5', 'type6'], {
    invalid_type_error: 'Select skin type',
  }),
  spf: z.number({ invalid_type_error: 'Enter SPF' }).min(0).max(100).optional(),
});

type FormValues = z.infer<typeof formSchema>;

type ResultPayload = {
  uvIndex: number;
  exposureTime: number;
  skinType: string;
  spf: number | undefined;
  riskScore: number;
  riskPercent: number;
  status: 'optimal' | 'good' | 'moderate' | 'low';
  interpretation: string;
  recommendations: string[];
  plan: { label: string; detail: string }[];
};

const steps = [
  'Enter UV index (0-15) from weather forecast or UV meter.',
  'Enter exposure time (minutes) you plan to spend in the sun.',
  'Select your skin type (I-VI) based on Fitzpatrick classification.',
  'Enter sunscreen SPF if using protection (optional).',
  'Review risk score, risk percentage, and recommendations.',
];

const faqs = [
  {
    question: 'What is UV index?',
    answer:
      'UV Index is a scale from 0-15 that measures the strength of ultraviolet (UV) radiation from the sun. Higher values indicate greater risk of skin damage. Values 0-2 are low, 3-5 moderate, 6-7 high, 8-10 very high, and 11+ extreme.',
  },
  {
    question: 'How do I determine my skin type?',
    answer:
      'Skin types are classified using the Fitzpatrick scale: Type I (pale, always burns), Type II (fair, burns easily), Type III (medium, sometimes burns), Type IV (olive, rarely burns), Type V (brown, very rarely burns), Type VI (dark, never burns).',
  },
  {
    question: 'What is SPF and how does it work?',
    answer:
      'SPF (Sun Protection Factor) measures how long sunscreen protects against UVB rays. SPF 30 blocks about 97% of UVB rays, SPF 50 blocks about 98%. Reapply every 2 hours and after swimming or sweating.',
  },
  {
    question: 'What factors affect UV exposure risk?',
    answer:
      'UV exposure risk is influenced by UV index, exposure duration, skin type sensitivity, time of day (peak hours 10am-4pm), altitude, latitude, cloud cover, and surface reflection (snow, sand, water reflect UV).',
  },
  {
    question: 'What are the health risks of excessive UV exposure?',
    answer:
      'Excessive UV exposure increases risk of sunburn, premature skin aging, eye damage (cataracts), suppression of immune system, and most importantly, skin cancer including melanoma, basal cell carcinoma, and squamous cell carcinoma.',
  },
  {
    question: 'How can I reduce UV exposure risk?',
    answer:
      'Reduce risk by seeking shade during peak hours (10am-4pm), wearing protective clothing, using broad-spectrum sunscreen (SPF 30+), wearing UV-blocking sunglasses and wide-brimmed hats, and avoiding tanning beds.',
  },
  {
    question: 'Is some sun exposure beneficial?',
    answer:
      'Yes, moderate sun exposure (10-30 minutes, 2-3 times per week) helps produce vitamin D. However, balance is key. Use sun protection and consider vitamin D supplements if you limit sun exposure significantly.',
  },
  {
    question: 'How does age affect UV risk?',
    answer:
      'Children have more sensitive skin and higher lifetime cancer risk from early sunburns. Older adults may have accumulated damage. Everyone should protect their skin regardless of age, but children need extra protection.',
  },
  {
    question: 'What about vitamin D and sun exposure?',
    answer:
      'Vitamin D is produced when skin is exposed to UVB rays. However, only 5-30 minutes of sun exposure 2-3 times per week to face, arms, and legs is typically sufficient. Prolonged unprotected exposure increases skin cancer risk without additional benefit.',
  },
  {
    question: 'When should I consult a healthcare provider?',
    answer:
      'Consult a healthcare provider if you have a history of skin cancer, unusual moles or skin changes, severe sunburns, photosensitivity conditions, or need personalized sun protection guidance based on your skin type and medical history.',
  },
];

const relatedCalculators = [
  {
    name: 'Blue Light Exposure Calculator',
    slug: 'blue-light-exposure-calculator',
    description: 'Assess digital screen exposure alongside UV risk.',
  },
  {
    name: 'Vitamin D Sun Exposure Calculator',
    slug: 'electrolyte-replacement-calculator',
    description: 'Evaluate safe sun exposure for vitamin D synthesis.',
  },
  {
    name: 'Daily Antioxidant (ORAC) Goal Calculator',
    slug: 'carbohydrate-intake-calculator',
    description: 'Support skin health with antioxidant protection.',
  },
];

const baseUrl = 'https://mycalculating.com/category/health-fitness/uv-exposure-risk-calculator';

const schemaMarkup = {
  '@context': 'https://schema.org',
  '@graph': [
    {
      '@type': 'BreadcrumbList',
      itemListElement: [
        { '@type': 'ListItem', position: 1, name: 'Home', item: 'https://mycalculating.com' },
        { '@type': 'ListItem', position: 2, name: 'Health & Fitness', item: 'https://mycalculating.com/category/health-fitness' },
        { '@type': 'ListItem', position: 3, name: 'UV Exposure Risk Calculator', item: baseUrl },
      ],
    },
    {
      '@type': 'Article',
      headline: 'UV Exposure Tendency Wellness Calculator',
      description: 'Calculate UV exposure risk from UV index, exposure time, skin type, and SPF protection.',
      author: { '@type': 'Organization', name: 'Mycalculating.com' },
      publisher: { '@type': 'Organization', name: 'Mycalculating.com', logo: { '@type': 'ImageObject', url: 'https://mycalculating.com/logo.png' } },
      url: baseUrl,
      mainEntityOfPage: { '@type': 'WebPage', '@id': baseUrl },
      datePublished: '2024-01-01',
      dateModified: new Date().toISOString().split('T')[0],
    },
    {
      '@type': 'SoftwareApplication',
      name: 'UV Exposure Tendency Wellness Calculator',
      applicationCategory: 'Calculator',
      operatingSystem: 'Web Browser',
      description: 'Calculate UV exposure risk from UV index, exposure time, skin type, and SPF protection.',
      url: baseUrl,
      offers: { '@type': 'Offer', price: '0', priceCurrency: 'USD' },
    },
    {
      '@type': 'FAQPage',
      mainEntity: faqs.map((faq) => ({
        '@type': 'Question',
        name: faq.question,
        acceptedAnswer: {
          '@type': 'Answer',
          text: faq.answer,
        },
      })),
    },
    {
      '@type': 'HowTo',
      name: 'How to Use UV Exposure Tendency Wellness Calculator',
      description: 'Step-by-step guide to calculate UV exposure risk',
      step: steps.map((step, index) => ({
        '@type': 'HowToStep',
        position: index + 1,
        text: step,
      })),
    },
  ],
};

const clamp = (value: number, min: number, max: number) => Math.min(max, Math.max(min, value));

// Skin type sensitivity multipliers (lower number = more sensitive)
const skinTypeSensitivity: Record<string, number> = {
  type1: 1.0, // Most sensitive, always burns
  type2: 0.85,
  type3: 0.7,
  type4: 0.55,
  type5: 0.4,
  type6: 0.25, // Least sensitive, never burns
};

// SPF protection factor (as percentage blocked)
const getSPFProtection = (spf: number | undefined): number => {
  if (!spf || spf === 0) return 0;
  // SPF protection percentage: SPF 15 = 93%, SPF 30 = 97%, SPF 50 = 98%
  return Math.min(99, (spf - 1) / spf * 100);
};

const calculateResult = (values: FormValues): ResultPayload => {
  const uvIndex = values.uvIndex;
  const exposureTime = values.exposureTime;
  const skinType = values.skinType;
  const spf = values.spf;
  
  // Calculate base risk: UV Index × Exposure Time × Skin Sensitivity
  const skinSensitivity = skinTypeSensitivity[skinType] || 1.0;
  const baseRisk = uvIndex * exposureTime * skinSensitivity;
  
  // Apply SPF protection if provided
  const spfProtection = getSPFProtection(spf);
  const effectiveRisk = baseRisk * (1 - spfProtection / 100);
  
  // Risk score (normalized to 0-100 scale)
  // Reference: UV Index 6, 60 minutes, Type I skin, no SPF = high risk baseline
  const referenceRisk = 6 * 60 * 1.0; // UV 6 × 60 min × Type I sensitivity
  const riskScore = clamp((effectiveRisk / referenceRisk) * 100, 0, 100);
  
  // Risk percentage (relative to safe exposure)
  const safeExposureMinutes = uvIndex > 0 ? (skinSensitivity * 100) / uvIndex : 60; // Baseline safe time
  const riskPercent = exposureTime > 0 ? (exposureTime / safeExposureMinutes) * 100 : 0;
  
  let status: ResultPayload['status'] = 'optimal';
  let interpretation = 'This suggests a general lifestyle tendency where your UV exposure may appear safe. You may consider continuing to use appropriate sun protection measures.';

  if (riskScore >= 70 || riskPercent >= 150) {
    status = 'low';
    interpretation = 'This suggests a general lifestyle tendency where your UV exposure tendency may be very high. This level of exposure may significantly increase tendency of sunburn, skin damage, and skin concerns. You may consider seeking shade immediately, using high SPF sunscreen, and limiting exposure time. This is a personal insight, not a medical evaluation.';
  } else if (riskScore >= 50 || riskPercent >= 120) {
    status = 'moderate';
    interpretation = 'This suggests a general lifestyle tendency where your UV exposure tendency may be elevated. You may consider taking extra precautions: seek shade frequently, reapply sunscreen every 2 hours, wear protective clothing, and limit time in direct sun.';
  } else if (riskScore >= 30 || riskPercent >= 90) {
    status = 'good';
    interpretation = 'This suggests a general lifestyle tendency where your UV exposure tendency may be moderate. You may consider continuing to use sun protection and monitoring your skin for any signs of redness or burning.';
  } else {
    status = 'optimal';
    interpretation = 'This suggests a general lifestyle tendency where your UV exposure tendency may be low. Your protection measures and exposure time may be appropriate. You may consider continuing to maintain good sun protection habits.';
  }

  const recommendations = [
    'Use broad-spectrum sunscreen: apply SPF 30+ sunscreen 15-30 minutes before sun exposure, and reapply every 2 hours or after swimming or sweating.',
    'Seek shade during peak hours: limit direct sun exposure between 10am-4pm when UV rays are strongest. Use umbrellas, trees, or covered areas.',
    'Wear protective clothing: use long-sleeved shirts, pants, wide-brimmed hats, and UV-blocking sunglasses to reduce skin exposure.',
  ];
  
  if (riskScore >= 50) {
    recommendations.push('Reduce exposure time: limit time in direct sunlight, especially during peak UV hours. Break up outdoor activities into shorter periods with shade breaks.');
  }
  
  if (!spf || spf < 15) {
    recommendations.push('Use adequate sunscreen protection: apply SPF 15-30 at minimum. For prolonged exposure or sensitive skin, use SPF 30-50 or higher. Don\'t forget often-missed areas like ears, back of neck, and tops of feet.');
  }
  
  if (uvIndex >= 8) {
    recommendations.push('Extreme UV conditions: with UV index 8 or higher, extra protection is critical. Minimize outdoor exposure, use maximum SPF protection, and cover all exposed skin.');
  }

  const plan = [
    { label: 'This Week', detail: `Assess your daily UV exposure and adjust activities based on UV index forecasts. Plan outdoor activities during lower UV hours when possible.` },
    { label: 'This Month', detail: 'Establish consistent sun protection habits: apply sunscreen daily, wear protective clothing, and monitor your skin for any changes or unusual spots.' },
    { label: 'Ongoing', detail: 'Maintain long-term sun safety: schedule annual skin cancer screenings with a dermatologist, continue daily sun protection, and teach children about sun safety from an early age.' },
  ];

  return { uvIndex, exposureTime, skinType, spf, riskScore, riskPercent, status, interpretation, recommendations, plan };
};

export default function UVExposureRiskCalculator() {
  const [result, setResult] = useState<ResultPayload | null>(null);

  const form = useForm<FormValues>({
    resolver: zodResolver(formSchema),
    defaultValues: {
      uvIndex: undefined,
      exposureTime: undefined,
      skinType: undefined,
      spf: undefined,
    },
  });

  return (
    <div className="space-y-8">
      <Script id="uv-exposure-risk-schema" type="application/ld+json" strategy="afterInteractive" dangerouslySetInnerHTML={{ __html: JSON.stringify(schemaMarkup) }} />

      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <Activity className="h-5 w-5" />
            UV Exposure Tendency Wellness Calculator
          </CardTitle>
          <CardDescription>Get general wellness insights about UV exposure tendency from UV index, exposure time, skin type, and SPF protection. This is a personal lifestyle insight, not a medical evaluation.</CardDescription>
        </CardHeader>
      </Card>

      <Card>
        <CardHeader>
          <CardTitle>Input your UV exposure data</CardTitle>
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
                      <FormLabel>Exposure time (minutes)</FormLabel>
                      <FormControl>
                        <Input type="number" step="1" placeholder="e.g., 60" value={field.value ?? ''} onChange={(e) => field.onChange(e.target.value === '' ? undefined : Number(e.target.value))} />
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
                  name="spf"
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel>Sunscreen SPF (optional)</FormLabel>
                      <FormControl>
                        <Input type="number" step="1" placeholder="e.g., 30 (0 if none)" value={field.value ?? ''} onChange={(e) => field.onChange(e.target.value === '' ? undefined : Number(e.target.value))} />
                      </FormControl>
                      <FormMessage />
                    </FormItem>
                  )}
                />
              </div>
              <Button type="submit" className="w-full md:w-auto">
                Calculate UV exposure risk
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
            <CardDescription>See risk score, risk percentage, and recommendations.</CardDescription>
          </CardHeader>
          <CardContent className="space-y-6">
            <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
              <div className="p-4 border rounded">
                <p className="text-sm text-muted-foreground">Risk score</p>
                <p className="text-2xl font-semibold text-primary">{result.riskScore.toFixed(1)}</p>
                <p className="text-xs text-muted-foreground">Out of 100</p>
              </div>
              <div className="p-4 border rounded">
                <p className="text-sm text-muted-foreground">UV Index</p>
                <p className="text-2xl font-semibold text-primary">{result.uvIndex.toFixed(1)}</p>
                <p className="text-xs text-muted-foreground">Current level</p>
              </div>
              <div className="p-4 border rounded">
                <p className="text-sm text-muted-foreground">Risk %</p>
                <p className="text-2xl font-semibold text-primary">{result.riskPercent.toFixed(0)}%</p>
                <p className="text-xs text-muted-foreground">Of safe exposure</p>
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
            <strong>Base risk</strong> = UV Index × Exposure Time (minutes) × Skin Type Sensitivity Factor. Skin types I-VI have sensitivity factors from 1.0 (most sensitive) to 0.25 (least sensitive).
          </p>
          <p>
            <strong>Effective risk</strong> = Base Risk × (1 - SPF Protection Percentage / 100). SPF protection: SPF 15 blocks ~93%, SPF 30 blocks ~97%, SPF 50 blocks ~98% of UVB rays.
          </p>
          <p>
            <strong>Risk score</strong> = (Effective Risk / Reference Risk) × 100, normalized to 0-100 scale where reference is UV Index 6, 60 minutes, Type I skin, no SPF.
          </p>
          <p>UV exposure risk increases with higher UV index, longer exposure time, more sensitive skin types, and insufficient sun protection. Proper sunscreen use, protective clothing, and timing outdoor activities can significantly reduce risk.</p>
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
                <p className="text-sm text-muted-foreground">Safe exposure time</p>
                <p className="text-xl font-semibold text-primary">
                  {result.uvIndex > 0 ? Math.round((skinTypeSensitivity[result.skinType] || 1.0) * 100 / result.uvIndex) : 0} min
                </p>
                <p className="text-xs text-muted-foreground">Without protection</p>
              </div>
              <div className="p-4 border rounded">
                <p className="text-sm text-muted-foreground">SPF protection</p>
                <p className="text-xl font-semibold text-primary">
                  {result.spf ? getSPFProtection(result.spf).toFixed(1) : '0'}%
                </p>
                <p className="text-xs text-muted-foreground">UVB rays blocked</p>
              </div>
              <div className="p-4 border rounded">
                <p className="text-sm text-muted-foreground">Risk level</p>
                <p className="text-xl font-semibold text-primary">
                  {result.riskScore >= 70 ? 'Very High' : result.riskScore >= 50 ? 'High' : result.riskScore >= 30 ? 'Moderate' : 'Low'}
                </p>
                <p className="text-xs text-muted-foreground">Based on calculation</p>
              </div>
            </div>
          ) : (
            <p className="text-sm text-muted-foreground">Enter your UV exposure data to see additional insights.</p>
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

      <section className="space-y-6 text-muted-foreground leading-relaxed bg-white p-6 md:p-10 rounded-lg shadow-lg" itemType="https://schema.org/MedicalWebPage">
    {/* SEO & SCHEMA METADATA (HIGHLY OPTIMIZED) */}
    <meta itemProp="name" content="The Definitive Guide to UV Exposure Risk: Understanding Sun Safety and Skin Protection" />
    <meta itemProp="description" content="An expert, evidence-based guide on ultraviolet (UV) radiation exposure, detailing UV index interpretation, skin type classification, SPF effectiveness, and comprehensive strategies to reduce skin cancer risk and premature aging." />
    <meta itemProp="keywords" content="UV exposure risk calculator, UV index sun safety, SPF sunscreen protection, skin cancer prevention, Fitzpatrick skin type, sunburn risk assessment, melanoma prevention" />
    <meta itemProp="author" content="[Your Site's Health Team]" />
    <meta itemProp="datePublished" content="2025-12-01" />
    <meta itemProp="url" content="/definitive-uv-exposure-risk-guide" />

    <h1 className="text-3xl md:text-4xl font-extrabold text-foreground mb-4" itemProp="headline">The Definitive Guide to UV Exposure Risk: Understanding Sun Safety and Skin Cancer Prevention</h1>
    <p className="text-lg italic text-gray-700">Explore the science of ultraviolet radiation, the UV index scale, skin type classification, SPF effectiveness, and comprehensive strategies to protect your skin from sun damage and reduce cancer risk.</p>


    {/* TABLE OF CONTENTS (INTERNAL LINKS FOR UX AND SEO) */}
    <h2 className="text-2xl font-bold text-foreground mt-8 mb-4">Table of Contents: Jump to a Section</h2>
    <ul className="list-disc ml-6 space-y-2 text-blue-600">
        <li><a href="#uv-radiation" className="hover:underline">Understanding Ultraviolet Radiation and UV Index</a></li>
        <li><a href="#skin-types" className="hover:underline">Fitzpatrick Skin Type Classification</a></li>
        <li><a href="#spf-protection" className="hover:underline">SPF Sunscreen: How Protection Really Works</a></li>
        <li><a href="#health-risks" className="hover:underline">Health Risks of Excessive UV Exposure</a></li>
        <li><a href="#prevention" className="hover:underline">Comprehensive Sun Protection Strategies</a></li>
    </ul>
<hr />

    {/* UNDERSTANDING ULTRAVIOLET RADIATION */}
    <h2 id="uv-radiation" className="text-2xl font-bold text-foreground pt-8" itemProp="articleSection">Understanding Ultraviolet Radiation and UV Index</h2>
    <p>Ultraviolet (UV) radiation is a form of electromagnetic radiation emitted by the sun that reaches Earth's surface. Unlike visible light, UV radiation is invisible to the human eye but can cause significant biological damage to skin and eyes. The **UV Index** is an international standard measurement (0-15+) that quantifies the strength of UV radiation at a specific location and time, helping individuals make informed decisions about sun protection.</p>

<h3 className="text-xl font-semibold text-foreground mt-6">Types of UV Radiation</h3>
<p>UV radiation is categorized into three types based on wavelength:</p>
<ul>
    <li><b>UVA (320-400 nm):</b> Long-wave UV rays that penetrate deep into the skin, causing premature aging, wrinkles, and contributing to skin cancer. UVA is present with relatively equal intensity during all daylight hours and can penetrate clouds and glass.</li>
    <li><b>UVB (280-320 nm):</b> Medium-wave UV rays that cause sunburn and play a significant role in developing skin cancer. UVB intensity varies by season, location, and time of day, with peak intensity during midday hours.</li>
    <li><b>UVC (100-280 nm):</b> Short-wave UV rays that are completely absorbed by Earth's atmosphere and do not reach the surface, so they pose no risk.</li>
</ul>

<h3 className="text-xl font-semibold text-foreground mt-6">The UV Index Scale</h3>
<p>The UV Index scale provides a standardized measurement of UV intensity:</p>
<div className="overflow-x-auto my-6 p-4 bg-gray-50 border rounded-lg">
    <table className="w-full text-left border-collapse">
        <thead>
            <tr>
                <th className="border-b p-2 font-bold">UV Index</th>
                <th className="border-b p-2 font-bold">Risk Level</th>
                <th className="border-b p-2 font-bold">Protection Required</th>
            </tr>
        </thead>
        <tbody>
            <tr>
                <td className="border-b p-2">0-2</td>
                <td className="border-b p-2">Low</td>
                <td className="border-b p-2">Minimal protection needed. Safe to be outside.</td>
            </tr>
            <tr>
                <td className="border-b p-2">3-5</td>
                <td className="border-b p-2">Moderate</td>
                <td className="border-b p-2">Some protection required. Seek shade during midday hours.</td>
            </tr>
            <tr>
                <td className="border-b p-2">6-7</td>
                <td className="border-b p-2">High</td>
                <td className="border-b p-2">Protection essential. Limit sun exposure during midday (10am-4pm).</td>
            </tr>
            <tr>
                <td className="border-b p-2">8-10</td>
                <td className="border-b p-2">Very High</td>
                <td className="border-b p-2">Extra protection critical. Avoid sun during midday hours.</td>
            </tr>
            <tr>
                <td className="border-b p-2">11+</td>
                <td className="border-b p-2">Extreme</td>
                <td className="border-b p-2">Take all precautions. Minimize sun exposure, especially during peak hours.</td>
            </tr>
        </tbody>
    </table>
</div>
<p>Factors affecting UV Index include <b>latitude</b> (higher UV near equator), <b>altitude</b> (UV increases ~4% per 1000 ft elevation), <b>time of day</b> (peak 10am-4pm), <b>season</b> (higher in summer), <b>cloud cover</b> (reduces but doesn't eliminate UV), and <b>surface reflection</b> (snow reflects 80%, sand 15%, water 10%).</p>

<hr />

    {/* FITZPATRICK SKIN TYPE CLASSIFICATION */}
    <h2 id="skin-types" className="text-2xl font-bold text-foreground pt-8" itemProp="articleSection">Fitzpatrick Skin Type Classification</h2>
    <p>The **Fitzpatrick Skin Phototype Classification** is a numerical system (I-VI) that categorizes skin based on its response to UV radiation. Developed by dermatologist Thomas B. Fitzpatrick in 1975, this classification helps predict sunburn and tanning response, which correlates with skin cancer risk.</p>

    <h3 className="text-xl font-semibold text-foreground mt-6">The Six Skin Types</h3>
    <div className="overflow-x-auto my-6 p-4 bg-gray-50 border rounded-lg">
        <table className="w-full text-left border-collapse">
            <thead>
                <tr>
                    <th className="border-b p-2 font-bold">Type</th>
                    <th className="border-b p-2 font-bold">Characteristics</th>
                    <th className="border-b p-2 font-bold">Sunburn/Tan Response</th>
                    <th className="border-b p-2 font-bold">Cancer Risk</th>
                </tr>
            </thead>
            <tbody>
                <tr>
                    <td className="border-b p-2">Type I</td>
                    <td className="border-b p-2">Very pale, freckles, blue/green eyes, red/blonde hair</td>
                    <td className="border-b p-2">Always burns, never tans</td>
                    <td className="border-b p-2">Highest risk</td>
                </tr>
                <tr>
                    <td className="border-b p-2">Type II</td>
                    <td className="border-b p-2">Fair skin, blue/green/hazel eyes, blonde/brown hair</td>
                    <td className="border-b p-2">Burns easily, tans minimally</td>
                    <td className="border-b p-2">Very high risk</td>
                </tr>
                <tr>
                    <td className="border-b p-2">Type III</td>
                    <td className="border-b p-2">Medium/beige skin, any eye/hair color</td>
                    <td className="border-b p-2">Sometimes burns, gradually tans</td>
                    <td className="border-b p-2">Moderate-high risk</td>
                </tr>
                <tr>
                    <td className="border-b p-2">Type IV</td>
                    <td className="border-b p-2">Olive/brown skin, dark hair/eyes</td>
                    <td className="border-b p-2">Burns minimally, tans easily</td>
                    <td className="border-b p-2">Moderate risk</td>
                </tr>
                <tr>
                    <td className="border-b p-2">Type V</td>
                    <td className="border-b p-2">Brown skin, dark hair/eyes</td>
                    <td className="border-b p-2">Very rarely burns, tans profusely</td>
                    <td className="border-b p-2">Lower risk (but still at risk)</td>
                </tr>
                <tr>
                    <td className="border-b p-2">Type VI</td>
                    <td className="border-b p-2">Dark brown/black skin, dark hair/eyes</td>
                    <td className="border-b p-2">Never burns, deeply pigmented</td>
                    <td className="border-b p-2">Lowest risk (but still possible)</td>
                </tr>
            </tbody>
        </table>
    </div>
    <p>It's important to note that <b>all skin types can develop skin cancer</b>, though the risk is significantly higher for lighter skin types (I-III). People with darker skin (Types V-VI) often have delayed diagnosis because they may not notice early warning signs, making regular skin checks important for everyone.</p>

<hr />

    {/* SPF SUNSCREEN PROTECTION */}
    <h2 id="spf-protection" className="text-2xl font-bold text-foreground pt-8" itemProp="articleSection">SPF Sunscreen: How Protection Really Works</h2>
    <p><b>Sun Protection Factor (SPF)</b> is a measure of how well a sunscreen protects against UVB rays (the primary cause of sunburn). The SPF number indicates how much longer you can stay in the sun without burning compared to unprotected skin. However, SPF is more complex than it appears, and understanding its limitations is crucial for effective protection.</p>

    <h3 className="text-xl font-semibold text-foreground mt-6">How SPF Is Calculated</h3>
    <p>SPF is determined in laboratory settings using controlled UV exposure. If it takes 10 minutes for unprotected skin to redden, SPF 30 theoretically allows 300 minutes (5 hours) of protection. However, this calculation assumes:</p>
    <ul>
        <li>Proper application (most people apply only 25-50% of recommended amount)</li>
        <li>No sweating or water exposure</li>
        <li>No rubbing or removal</li>
        <li>Ideal laboratory conditions</li>
    </ul>
    <p>In reality, <b>sunscreen effectiveness is significantly reduced</b> by these factors, which is why reapplication every 2 hours is recommended.</p>

    <h3 className="text-xl font-semibold text-foreground mt-6">SPF Protection Levels</h3>
    <p>The relationship between SPF and UVB protection is logarithmic, not linear:</p>
    <ul>
        <li><b>SPF 15:</b> Blocks approximately 93% of UVB rays</li>
        <li><b>SPF 30:</b> Blocks approximately 97% of UVB rays</li>
        <li><b>SPF 50:</b> Blocks approximately 98% of UVB rays</li>
        <li><b>SPF 100:</b> Blocks approximately 99% of UVB rays</li>
    </ul>
    <p>Notice that SPF 50 doesn't provide double the protection of SPF 25. The difference between SPF 30 and SPF 100 is only about 2% in terms of UVB blocking. <b>SPF 30-50 is generally considered optimal</b> for most people, as higher SPF provides minimal additional benefit and may give false sense of security.</p>

    <h3 className="text-xl font-semibold text-foreground mt-6">Broad-Spectrum Protection</h3>
    <p>SPF only measures protection against <b>UVB rays</b>. For comprehensive protection, choose <b>broad-spectrum</b> sunscreens that protect against both UVA and UVB. Look for active ingredients like zinc oxide, titanium dioxide, avobenzone, or ecamsule (Mexoryl SX) for UVA protection.</p>

    <h3 className="text-xl font-semibold text-foreground mt-6">Proper Sunscreen Application</h3>
    <p>Most people apply sunscreen incorrectly, dramatically reducing its effectiveness:</p>
    <ul>
        <li><b>Amount:</b> Use about 1 ounce (shot glass full) for full body coverage. For face alone, use about 1/4 teaspoon.</li>
        <li><b>Timing:</b> Apply 15-30 minutes before sun exposure to allow it to bind to skin.</li>
        <li><b>Reapplication:</b> Reapply every 2 hours, and immediately after swimming, sweating, or towel-drying.</li>
        <li><b>Coverage:</b> Don't forget ears, back of neck, tops of feet, and backs of hands.</li>
        <li><b>Expiration:</b> Check expiration dates—sunscreen loses effectiveness over time, especially if stored in heat or sunlight.</li>
    </ul>

<hr />

    {/* HEALTH RISKS OF EXCESSIVE UV EXPOSURE */}
    <h2 id="health-risks" className="text-2xl font-bold text-foreground pt-8" itemProp="articleSection">Health Risks of Excessive UV Exposure</h2>
    <p>While moderate sun exposure provides essential <b>vitamin D</b>, excessive UV radiation causes cumulative damage that leads to both immediate and long-term health consequences. Understanding these risks emphasizes the importance of consistent sun protection throughout life.</p>

    <h3 className="text-xl font-semibold text-foreground mt-6">Immediate Effects</h3>
    <ul>
        <li><b>Sunburn:</b> Red, painful, swollen skin caused by UVB damage to skin cells. Severe sunburns can cause blistering, fever, and require medical attention. Even one blistering sunburn in childhood or adolescence doubles the risk of melanoma later in life.</li>
        <li><b>Eye Damage:</b> UV exposure can cause photokeratitis (snow blindness), pterygium (growth on the eye), and contributes to cataracts. Always wear UV-blocking sunglasses with 99-100% UVA and UVB protection.</li>
        <li><b>Immune Suppression:</b> UV radiation can suppress the immune system, making the body more vulnerable to infections and reducing the body's ability to fight skin cancer.</li>
    </ul>

    <h3 className="text-xl font-semibold text-foreground mt-6">Long-Term Effects</h3>
    <ul>
        <li><b>Premature Aging (Photoaging):</b> UVA rays penetrate deep into the skin, breaking down collagen and elastin fibers, leading to wrinkles, fine lines, age spots, leathery texture, and loss of skin elasticity. Up to 90% of visible skin aging is caused by sun exposure, not chronological age.</li>
        <li><b>Actinic Keratosis:</b> Precancerous rough, scaly patches on sun-exposed skin that can develop into squamous cell carcinoma if untreated.</li>
        <li><b>Skin Cancer:</b> The most serious consequence of UV exposure. Three main types:
            <ul>
                <li><b>Basal Cell Carcinoma (BCC):</b> Most common, rarely spreads but can be disfiguring if not treated early.</li>
                <li><b>Squamous Cell Carcinoma (SCC):</b> Second most common, can spread if not treated promptly.</li>
                <li><b>Melanoma:</b> Least common but most dangerous, responsible for the majority of skin cancer deaths. Early detection is critical—melanoma is highly curable when caught early.</li>
            </ul>
        </li>
    </ul>

    <h3 className="text-xl font-semibold text-foreground mt-6">Cumulative Damage</h3>
    <p>UV damage is <b>cumulative</b>, meaning that every exposure adds to the total lifetime damage. DNA mutations from UV exposure accumulate over years, which is why consistent protection from childhood through adulthood is essential. Damage that occurs in childhood and adolescence is particularly significant, as cells divide more rapidly during growth periods.</p>

<hr />

    {/* COMPREHENSIVE SUN PROTECTION STRATEGIES */}
    <h2 id="prevention" className="text-2xl font-bold text-foreground pt-8" itemProp="articleSection">Comprehensive Sun Protection Strategies</h2>
    <p>Effective sun protection requires a <b>multi-layered approach</b> rather than relying on sunscreen alone. The American Academy of Dermatology and Skin Cancer Foundation recommend combining multiple protection methods for optimal skin safety.</p>

    <h3 className="text-xl font-semibold text-foreground mt-6">1. Timing and Shade</h3>
    <ul>
        <li><b>Avoid Peak Hours:</b> Limit direct sun exposure between 10am-4pm when UV rays are strongest, especially during summer months.</li>
        <li><b>Seek Shade:</b> Use umbrellas, trees, awnings, or covered areas. Remember that shade reduces but doesn't eliminate UV exposure—reflected UV from surfaces still reaches you.</li>
        <li><b>Check UV Index:</b> Check daily UV forecasts and plan outdoor activities accordingly. Many weather apps and websites provide hourly UV Index predictions.</li>
    </ul>

    <h3 className="text-xl font-semibold text-foreground mt-6">2. Protective Clothing</h3>
    <ul>
        <li><b>Coverage:</b> Wear long-sleeved shirts, long pants, and skirts when possible. Dark, tightly woven fabrics provide better protection than light, loosely woven fabrics.</li>
        <li><b>UPF Clothing:</b> Look for clothing labeled with UPF (Ultraviolet Protection Factor). UPF 30-50+ blocks 97-98% of UV rays. Regular clothing typically provides UPF 5-15.</li>
        <li><b>Hats:</b> Wear wide-brimmed hats (at least 3 inches) that shade face, ears, and back of neck. Baseball caps don't protect ears or neck.</li>
        <li><b>Sunglasses:</b> Choose sunglasses that block 99-100% of UVA and UVB rays. Large frames provide better coverage. Wraparound styles protect eyes from side exposure.</li>
    </ul>

    <h3 className="text-xl font-semibold text-foreground mt-6">3. Sunscreen Best Practices</h3>
    <ul>
        <li><b>Choose Wisely:</b> Select broad-spectrum, water-resistant sunscreen with SPF 30-50. Higher SPF provides minimal additional benefit and may encourage longer exposure.</li>
        <li><b>Apply Correctly:</b> Use enough sunscreen (1 oz for full body), apply 15-30 minutes before exposure, and reapply every 2 hours or after water/sweat.</li>
        <li><b>Daily Use:</b> Apply sunscreen to exposed skin daily, even on cloudy days (clouds block only 20-40% of UV) and in winter. UV exposure occurs year-round.</li>
        <li><b>Don't Rely Solely:</b> Sunscreen is just one tool—combine with shade, clothing, and timing for best protection.</li>
    </ul>

    <h3 className="text-xl font-semibold text-foreground mt-6">4. Special Considerations</h3>
    <ul>
        <li><b>Children:</b> Infants under 6 months should avoid direct sun. Use physical sunscreens (zinc oxide, titanium dioxide) for children, protective clothing, and teach sun safety habits early.</li>
        <li><b>Medications:</b> Some medications increase photosensitivity (antibiotics, diuretics, certain antidepressants). Check medication labels and take extra precautions.</li>
        <li><b>Reflective Surfaces:</b> Water, snow, sand, and concrete reflect UV, increasing exposure. Use extra protection near these surfaces.</li>
        <li><b>Altitude:</b> UV increases ~4% per 1,000 feet elevation. Use stronger protection at higher altitudes.</li>
    </ul>

    <h3 className="text-xl font-semibold text-foreground mt-6">5. Regular Skin Monitoring</h3>
    <p>Perform monthly <b>self-examinations</b> and schedule annual <b>professional skin checks</b> with a dermatologist. Learn the ABCDE rule for melanoma detection:</p>
    <ul>
        <li><b>A - Asymmetry:</b> One half doesn't match the other</li>
        <li><b>B - Border:</b> Irregular, blurred, or ragged edges</li>
        <li><b>C - Color:</b> Varies in shades of brown, black, pink, red, white, or blue</li>
        <li><b>D - Diameter:</b> Larger than 6mm (size of a pencil eraser)</li>
        <li><b>E - Evolving:</b> Changes in size, shape, color, or elevation</li>
    </ul>

<hr />

    {/* CONCLUSION */}
    <h2 className="text-2xl font-bold text-foreground pt-8" itemProp="articleSection">Conclusion</h2>
    <p>Understanding UV exposure risk is fundamental to maintaining skin health and preventing skin cancer. The combination of <b>UV Index awareness</b>, knowledge of your <b>skin type</b>, proper <b>SPF usage</b>, and comprehensive <b>sun protection strategies</b> creates an effective defense against both immediate sunburn and long-term cumulative damage. Remember that protection is needed year-round, not just during summer beach days. While moderate sun exposure supports vitamin D production, consistent protection from excessive UV radiation is one of the most important investments you can make in your long-term health. Make sun safety a daily habit, teach children proper protection from an early age, and schedule regular skin cancer screenings to catch any issues early when they're most treatable.</p>
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
          <p>This tool provides general wellness insights about UV exposure tendency from UV index, exposure time, skin type, and SPF protection. This is a personal lifestyle insight, not a medical evaluation.</p>
          <p>Outputs include UV index, exposure time, skin type, SPF, tendency score, tendency percentage, status, recommendations, an action plan, and supporting metrics.</p>
          <p>Formula, steps, guide content, related tools, and FAQs ensure humans or AI assistants can interpret the methodology instantly.</p>
        </CardContent>
      </Card>

      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <Shield className="h-5 w-5" />
            Disclaimer
          </CardTitle>
        </CardHeader>
        <CardContent className="text-sm text-muted-foreground">
          <p>Disclaimer: This tool provides general wellness and lifestyle insights for educational purposes only. It is not a medical or psychological diagnosis. For any health concerns, please consult a qualified professional.</p>
        </CardContent>
      </Card>
    </div>
  );
}


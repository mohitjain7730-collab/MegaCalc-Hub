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
  measuredOsmolality: z.number({ invalid_type_error: 'Enter measured osmolality' }).min(250).max(400),
  sodium: z.number({ invalid_type_error: 'Enter sodium' }).min(100).max(200),
  glucose: z.number({ invalid_type_error: 'Enter glucose' }).min(0).max(1000).optional(),
  bun: z.number({ invalid_type_error: 'Enter BUN' }).min(0).max(200).optional(),
});

type FormValues = z.infer<typeof formSchema>;

type ResultPayload = {
  measuredOsmolality: number;
  sodium: number;
  glucose: number | undefined;
  bun: number | undefined;
  calculatedOsmolality: number;
  osmolarGap: number;
  status: 'optimal' | 'good' | 'moderate' | 'low';
  interpretation: string;
  recommendations: string[];
  plan: { label: string; detail: string }[];
};

const steps = [
  'Enter measured osmolality (mOsm/kg) from your lab results.',
  'Enter serum sodium (mEq/L) from your lab results.',
  'Enter serum glucose (mg/dL) if available (optional).',
  'Enter BUN (mg/dL) if available (optional).',
  'Review osmolar gap, status, and recommendations.',
];

const faqs = [
  {
    question: 'What is serum osmolar gap?',
    answer:
      'Osmolar gap is the difference between measured osmolality and calculated osmolality. It helps detect the presence of unmeasured osmotically active substances like alcohols, toxins, or other solutes that contribute to osmolality but aren\'t included in the calculation.',
  },
  {
    question: 'Why is osmolar gap important?',
    answer:
      'Osmolar gap is crucial for detecting toxic alcohol ingestion (methanol, ethylene glycol, isopropanol), diabetic ketoacidosis, and other conditions with unmeasured osmoles. An elevated gap suggests the presence of substances not accounted for in the calculated osmolality.',
  },
  {
    question: 'What are normal osmolar gap values?',
    answer:
      'Normal osmolar gap is typically less than 10 mOsm/kg. Values 10-20 mOsm/kg may be mildly elevated. Values greater than 20 mOsm/kg are significantly elevated and suggest the presence of unmeasured osmoles, often requiring medical attention.',
  },
  {
    question: 'What causes elevated osmolar gap?',
    answer:
      'Elevated osmolar gap can result from toxic alcohol ingestion (methanol, ethylene glycol, isopropanol), diabetic ketoacidosis, lactic acidosis, mannitol administration, or other unmeasured osmotically active substances.',
  },
  {
    question: 'How is osmolar gap calculated?',
    answer:
      'Osmolar gap = Measured Osmolality - Calculated Osmolality. Calculated osmolality = 2 × Na + (Glucose/18) + (BUN/2.8), where Na is in mEq/L, Glucose and BUN are in mg/dL.',
  },
  {
    question: 'What is the clinical significance of osmolar gap?',
    answer:
      'Osmolar gap is particularly important in emergency medicine for detecting toxic alcohol ingestion. An elevated gap in the setting of suspected poisoning can guide treatment decisions, including the need for alcohol dehydrogenase inhibitors or dialysis.',
  },
  {
    question: 'Can osmolar gap be normal in poisoning?',
    answer:
      'Yes, osmolar gap may be normal or only mildly elevated in some cases of toxic alcohol ingestion, especially if measured hours after ingestion when alcohols have been metabolized. Clinical suspicion and other tests are important.',
  },
  {
    question: 'What other conditions affect osmolar gap?',
    answer:
      'Besides toxic alcohols, elevated osmolar gap can occur in diabetic ketoacidosis (ketones), lactic acidosis, mannitol use, or other conditions with unmeasured osmoles. The gap should be interpreted in clinical context.',
  },
  {
    question: 'How accurate is calculated osmolality?',
    answer:
      'Calculated osmolality is an estimate based on major osmoles (sodium, glucose, BUN). It may not account for all osmotically active substances. Direct measurement of osmolality is more accurate and accounts for all osmoles.',
  },
  {
    question: 'When should I consult a healthcare provider?',
    answer:
      'Consult a healthcare provider immediately if osmolar gap is significantly elevated (especially >20 mOsm/kg), if you suspect toxic ingestion, if you have symptoms of poisoning or metabolic disturbance, or if you need interpretation of lab results in context of your health.',
  },
];

const relatedCalculators = [
  {
    name: 'Blood Urea Nitrogen (BUN) Ratio Calculator',
    slug: 'blood-urea-nitrogen-bun-ratio-calculator',
    description: 'Evaluate kidney function with BUN levels.',
  },
  {
    name: 'Kidney Function eGFR Calculator',
    slug: 'kidney-function-egfr-calculator',
    description: 'Assess kidney function affecting fluid balance.',
  },
  {
    name: 'Electrolyte Balance Restoration Calculator',
    slug: 'electrolyte-balance-restoration-calculator',
    description: 'Calculate electrolyte needs for proper balance.',
  },
  {
    name: 'Diabetes Risk Calculator',
    slug: 'diabetes-risk-calculator',
    description: 'Assess your risk for developing diabetes.',
  },
];

const baseUrl = 'https://mycalculating.com/category/health-fitness/serum-osmolar-gap-calculator';

const schemaMarkup = {
  '@context': 'https://schema.org',
  '@graph': [
    {
      '@type': 'BreadcrumbList',
      itemListElement: [
        { '@type': 'ListItem', position: 1, name: 'Home', item: 'https://mycalculating.com' },
        { '@type': 'ListItem', position: 2, name: 'Health & Fitness', item: 'https://mycalculating.com/category/health-fitness' },
        { '@type': 'ListItem', position: 3, name: 'Serum Osmolar Gap Calculator', item: baseUrl },
      ],
    },
    {
      '@type': 'SoftwareApplication',
      name: 'Serum Osmolar Gap Calculator',
      applicationCategory: 'Calculator',
      operatingSystem: 'Web Browser',
      description: 'Calculate serum osmolar gap from measured osmolality, sodium, glucose, and BUN to detect unmeasured osmoles and assess metabolic status.',
      url: baseUrl,
      offers: { '@type': 'Offer', price: '0', priceCurrency: 'USD' },
    },
  ],
};

const clamp = (value: number, min: number, max: number) => Math.min(max, Math.max(min, value));

const calculateResult = (values: FormValues): ResultPayload => {
  const measuredOsmolality = values.measuredOsmolality; // mOsm/kg
  const sodium = values.sodium; // mEq/L
  const glucose = values.glucose || 100; // mg/dL, default to 100 if not provided
  const bun = values.bun || 15; // mg/dL, default to 15 if not provided
  
  // Calculate osmolality: 2 × Na + (Glucose/18) + (BUN/2.8)
  const calculatedOsmolality = 2 * sodium + (glucose / 18) + (bun / 2.8);
  
  // Calculate osmolar gap
  const osmolarGap = measuredOsmolality - calculatedOsmolality;
  
  let status: ResultPayload['status'] = 'optimal';
  let interpretation = 'Your osmolar gap is within normal range. No significant unmeasured osmoles detected.';

  if (osmolarGap > 25) {
    status = 'low';
    interpretation = 'Your osmolar gap is significantly elevated. This strongly suggests the presence of unmeasured osmoles, possibly toxic alcohols (methanol, ethylene glycol), diabetic ketoacidosis, or other substances. Immediate medical evaluation is required.';
  } else if (osmolarGap > 20) {
    status = 'moderate';
    interpretation = 'Your osmolar gap is elevated. This suggests the presence of unmeasured osmoles and requires medical evaluation to determine the cause, which may include toxic ingestion, metabolic disorders, or other conditions.';
  } else if (osmolarGap > 10) {
    status = 'good';
    interpretation = 'Your osmolar gap is mildly elevated. This may be normal variation or suggest minor presence of unmeasured osmoles. Monitor and discuss with healthcare provider if clinically indicated.';
  } else {
    status = 'optimal';
    interpretation = 'Your osmolar gap is within normal range (<10 mOsm/kg). No significant unmeasured osmoles detected. Continue maintaining healthy metabolic status.';
  }

  const recommendations = [
    'Consult healthcare provider: Elevated osmolar gap requires medical evaluation, especially if significantly elevated (>20 mOsm/kg) or if toxic ingestion is suspected. This is particularly important in emergency situations.',
    'Clinical context matters: Osmolar gap should be interpreted in context of symptoms, history, and other lab values. Elevated gap may indicate toxic alcohol ingestion, diabetic ketoacidosis, or other conditions.',
    'Emergency evaluation: If osmolar gap is significantly elevated (>20 mOsm/kg) and toxic ingestion is suspected, seek immediate medical attention. Treatment may include alcohol dehydrogenase inhibitors or dialysis.',
  ];
  
  if (osmolarGap > 20) {
    recommendations.push('Toxic ingestion consideration: Significantly elevated osmolar gap may indicate toxic alcohol ingestion (methanol, ethylene glycol, isopropanol). Immediate medical evaluation and treatment are critical.');
    recommendations.push('Metabolic evaluation: Elevated gap may also indicate diabetic ketoacidosis, lactic acidosis, or other metabolic conditions. Comprehensive metabolic evaluation is needed.');
  }

  const plan = [
    { label: 'This Week', detail: `If osmolar gap is significantly elevated (>20 mOsm/kg), seek immediate medical evaluation, especially if toxic ingestion is suspected or symptoms are present.` },
    { label: 'This Month', detail: 'Follow up with healthcare provider as recommended. Address any underlying metabolic conditions, ensure proper diabetes management if applicable, and avoid toxic substances.' },
    { label: 'Ongoing', detail: 'Maintain regular monitoring of metabolic status as recommended by your healthcare provider. Continue healthy lifestyle, proper diabetes management if applicable, and avoid exposure to toxic substances.' },
  ];

  return { measuredOsmolality, sodium, glucose, bun, calculatedOsmolality, osmolarGap, status, interpretation, recommendations, plan };
};

export default function SerumOsmolarGapCalculator() {
  const [result, setResult] = useState<ResultPayload | null>(null);

  const form = useForm<FormValues>({
    resolver: zodResolver(formSchema),
    defaultValues: {
      measuredOsmolality: undefined,
      sodium: undefined,
      glucose: undefined,
      bun: undefined,
    },
  });

  return (
    <div className="space-y-8">
      <Script id="osmolar-gap-schema" type="application/ld+json" strategy="afterInteractive" dangerouslySetInnerHTML={{ __html: JSON.stringify(schemaMarkup) }} />

      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <Activity className="h-5 w-5" />
            Serum Osmolar Gap Calculator
          </CardTitle>
          <CardDescription>Calculate serum osmolar gap from measured osmolality, sodium, glucose, and BUN to detect unmeasured osmoles and assess metabolic status.</CardDescription>
        </CardHeader>
      </Card>

      <Card>
        <CardHeader>
          <CardTitle>Input your lab values</CardTitle>
        </CardHeader>
        <CardContent>
          <Form {...form}>
            <form onSubmit={form.handleSubmit((values) => setResult(calculateResult(values)))} className="space-y-6">
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <FormField
                  control={form.control}
                  name="measuredOsmolality"
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel>Measured Osmolality (mOsm/kg)</FormLabel>
                      <FormControl>
                        <Input type="number" step="0.1" placeholder="e.g., 290" value={field.value ?? ''} onChange={(e) => field.onChange(e.target.value === '' ? undefined : Number(e.target.value))} />
                      </FormControl>
                      <FormMessage />
                    </FormItem>
                  )}
                />
                <FormField
                  control={form.control}
                  name="sodium"
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel>Serum Sodium (mEq/L)</FormLabel>
                      <FormControl>
                        <Input type="number" step="0.1" placeholder="e.g., 140" value={field.value ?? ''} onChange={(e) => field.onChange(e.target.value === '' ? undefined : Number(e.target.value))} />
                      </FormControl>
                      <FormMessage />
                    </FormItem>
                  )}
                />
                <FormField
                  control={form.control}
                  name="glucose"
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel>Serum Glucose (mg/dL, optional)</FormLabel>
                      <FormControl>
                        <Input type="number" step="0.1" placeholder="e.g., 100" value={field.value ?? ''} onChange={(e) => field.onChange(e.target.value === '' ? undefined : Number(e.target.value))} />
                      </FormControl>
                      <FormMessage />
                    </FormItem>
                  )}
                />
                <FormField
                  control={form.control}
                  name="bun"
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel>BUN (mg/dL, optional)</FormLabel>
                      <FormControl>
                        <Input type="number" step="0.1" placeholder="e.g., 15" value={field.value ?? ''} onChange={(e) => field.onChange(e.target.value === '' ? undefined : Number(e.target.value))} />
                      </FormControl>
                      <FormMessage />
                    </FormItem>
                  )}
                />
              </div>
              <Button type="submit" className="w-full md:w-auto">
                Calculate osmolar gap
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
            <CardDescription>See osmolar gap, status, and recommendations.</CardDescription>
          </CardHeader>
          <CardContent className="space-y-6">
            <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
              <div className="p-4 border rounded">
                <p className="text-sm text-muted-foreground">Osmolar Gap</p>
                <p className="text-2xl font-semibold text-primary">{result.osmolarGap.toFixed(1)} mOsm/kg</p>
                <p className="text-xs text-muted-foreground">Gap value</p>
              </div>
              <div className="p-4 border rounded">
                <p className="text-sm text-muted-foreground">Measured Osmolality</p>
                <p className="text-2xl font-semibold text-primary">{result.measuredOsmolality.toFixed(1)} mOsm/kg</p>
                <p className="text-xs text-muted-foreground">From lab results</p>
              </div>
              <div className="p-4 border rounded">
                <p className="text-sm text-muted-foreground">Calculated Osmolality</p>
                <p className="text-2xl font-semibold text-primary">{result.calculatedOsmolality.toFixed(1)} mOsm/kg</p>
                <p className="text-xs text-muted-foreground">Estimated value</p>
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
            <strong>Calculated Osmolality (mOsm/kg)</strong> = 2 × Sodium (mEq/L) + (Glucose (mg/dL) / 18) + (BUN (mg/dL) / 2.8)
          </p>
          <p>
            <strong>Osmolar Gap (mOsm/kg)</strong> = Measured Osmolality - Calculated Osmolality
          </p>
          <p>
            The osmolar gap detects unmeasured osmotically active substances. Normal gap is &lt;10 mOsm/kg. Elevated gap (&gt;20 mOsm/kg) suggests toxic alcohols, diabetic ketoacidosis, or other unmeasured osmoles. This is particularly important in emergency medicine for detecting toxic ingestion.
          </p>
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
                <p className="text-sm text-muted-foreground">Gap Category</p>
                <p className="text-xl font-semibold text-primary">
                  {result.osmolarGap < 10 ? 'Normal' : result.osmolarGap < 20 ? 'Mildly Elevated' : 'Significantly Elevated'}
                </p>
                <p className="text-xs text-muted-foreground">Based on gap value</p>
              </div>
              <div className="p-4 border rounded">
                <p className="text-sm text-muted-foreground">Sodium</p>
                <p className="text-xl font-semibold text-primary">
                  {result.sodium.toFixed(1)} mEq/L
                </p>
                <p className="text-xs text-muted-foreground">From lab results</p>
              </div>
              <div className="p-4 border rounded">
                <p className="text-sm text-muted-foreground">Metabolic Status</p>
                <p className="text-xl font-semibold text-primary">
                  {result.osmolarGap < 10 ? 'Normal' : 'Requires Evaluation'}
                </p>
                <p className="text-xs text-muted-foreground">Based on calculation</p>
              </div>
            </div>
          ) : (
            <p className="text-sm text-muted-foreground">Enter your lab values to see additional insights.</p>
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
    <meta itemProp="name" content="The Definitive Guide to Serum Osmolar Gap: Understanding Unmeasured Osmoles and Metabolic Assessment" />
    <meta itemProp="description" content="An expert, evidence-based guide on serum osmolar gap, detailing osmolality calculation, unmeasured osmoles detection, and comprehensive strategies to assess metabolic status and detect toxic ingestion." />
    <meta itemProp="keywords" content="osmolar gap calculator, serum osmolality, toxic alcohol ingestion, unmeasured osmoles, metabolic assessment, diabetic ketoacidosis" />
    <meta itemProp="author" content="[Your Site's Health Team]" />
    <meta itemProp="datePublished" content="2025-12-01" />
    <meta itemProp="url" content="/definitive-osmolar-gap-guide" />

    <h1 className="text-3xl md:text-4xl font-extrabold text-foreground mb-4" itemProp="headline">The Definitive Guide to Serum Osmolar Gap: Understanding Unmeasured Osmoles and Metabolic Assessment</h1>
    <p className="text-lg italic text-gray-700">Explore the science of serum osmolar gap, osmolality calculation, unmeasured osmoles detection, and comprehensive strategies to assess metabolic status and detect toxic ingestion.</p>

    <h2 className="text-2xl font-bold text-foreground mt-8 mb-4">Table of Contents: Jump to a Section</h2>
    <ul className="list-disc ml-6 space-y-2 text-blue-600">
        <li><a href="#osmolality-basics" className="hover:underline">Understanding Osmolality and Osmolar Gap</a></li>
        <li><a href="#calculation" className="hover:underline">Osmolality Calculation and Gap Determination</a></li>
        <li><a href="#toxic-ingestion" className="hover:underline">Toxic Alcohol Ingestion and Osmolar Gap</a></li>
        <li><a href="#metabolic-conditions" className="hover:underline">Metabolic Conditions and Elevated Gap</a></li>
        <li><a href="#clinical-significance" className="hover:underline">Clinical Significance and Management</a></li>
    </ul>
<hr />

    <h2 id="osmolality-basics" className="text-2xl font-bold text-foreground pt-8" itemProp="articleSection">Understanding Osmolality and Osmolar Gap</h2>
    <p><b>Osmolality</b> measures the concentration of osmotically active particles in a solution. In blood, osmolality is determined by all osmotically active substances, including electrolytes, glucose, urea, and other solutes. The <b>osmolar gap</b> is the difference between measured osmolality and calculated osmolality, helping detect unmeasured osmoles.</p>

<h3 className="text-xl font-semibold text-foreground mt-6">Osmolar Gap Reference Ranges</h3>
<div className="overflow-x-auto my-6 p-4 bg-gray-50 border rounded-lg">
    <table className="w-full text-left border-collapse">
        <thead>
            <tr>
                <th className="border-b p-2 font-bold">Osmolar Gap (mOsm/kg)</th>
                <th className="border-b p-2 font-bold">Interpretation</th>
                <th className="border-b p-2 font-bold">Clinical Significance</th>
            </tr>
        </thead>
        <tbody>
            <tr>
                <td className="border-b p-2">&lt;10</td>
                <td className="border-b p-2">Normal</td>
                <td className="border-b p-2">No significant unmeasured osmoles</td>
            </tr>
            <tr>
                <td className="border-b p-2">10-20</td>
                <td className="border-b p-2">Mildly Elevated</td>
                <td className="border-b p-2">May be normal variation or minor unmeasured osmoles</td>
            </tr>
            <tr>
                <td className="border-b p-2">&gt;20</td>
                <td className="border-b p-2">Significantly Elevated</td>
                <td className="border-b p-2">Suggests unmeasured osmoles, requires evaluation</td>
            </tr>
        </tbody>
    </table>
</div>

<hr />

    <h2 id="calculation" className="text-2xl font-bold text-foreground pt-8" itemProp="articleSection">Osmolality Calculation and Gap Determination</h2>
    <p>Calculated osmolality estimates osmolality based on major osmoles, while measured osmolality accounts for all osmotically active substances.</p>

<h3 className="text-xl font-semibold text-foreground mt-6">Calculated Osmolality Formula</h3>
<p><b>Calculated Osmolality = 2 × Na + (Glucose/18) + (BUN/2.8)</b></p>
<p>Where:</p>
<ul>
    <li>Na is serum sodium in mEq/L</li>
    <li>Glucose is serum glucose in mg/dL</li>
    <li>BUN is blood urea nitrogen in mg/dL</li>
</ul>

<h3 className="text-xl font-semibold text-foreground mt-6">Osmolar Gap Calculation</h3>
<p><b>Osmolar Gap = Measured Osmolality - Calculated Osmolality</b></p>
<p>The gap represents unmeasured osmotically active substances not included in the calculation.</p>

<hr />

    <h2 id="toxic-ingestion" className="text-2xl font-bold text-foreground pt-8" itemProp="articleSection">Toxic Alcohol Ingestion and Osmolar Gap</h2>
    <p>Elevated osmolar gap is particularly important for detecting toxic alcohol ingestion, a medical emergency.</p>

<h3 className="text-xl font-semibold text-foreground mt-6">Toxic Alcohols</h3>
<ul>
    <li><b>Methanol:</b> Found in windshield washer fluid, antifreeze. Causes severe metabolic acidosis, blindness, death.</li>
    <li><b>Ethylene Glycol:</b> Found in antifreeze. Causes severe metabolic acidosis, kidney failure, death.</li>
    <li><b>Isopropanol:</b> Found in rubbing alcohol. Less toxic but can cause significant illness.</li>
</ul>

<h3 className="text-xl font-semibold text-foreground mt-6">Clinical Presentation</h3>
<p>Symptoms of toxic alcohol ingestion include:</p>
<ul>
    <li>Altered mental status</li>
    <li>Metabolic acidosis</li>
    <li>Elevated osmolar gap</li>
    <li>Visual disturbances (methanol)</li>
    <li>Kidney failure (ethylene glycol)</li>
</ul>

<hr />

    <h2 id="metabolic-conditions" className="text-2xl font-bold text-foreground pt-8" itemProp="articleSection">Metabolic Conditions and Elevated Gap</h2>
    <p>Elevated osmolar gap can occur in various metabolic conditions beyond toxic ingestion.</p>

<h3 className="text-xl font-semibold text-foreground mt-6">Other Causes of Elevated Gap</h3>
<ul>
    <li><b>Diabetic Ketoacidosis:</b> Ketones contribute to osmolality</li>
    <li><b>Lactic Acidosis:</b> Lactate contributes to osmolality</li>
    <li><b>Mannitol Administration:</b> Medical use of mannitol</li>
    <li><b>Chronic Kidney Disease:</b> Accumulation of unmeasured solutes</li>
</ul>

<hr />

    <h2 id="clinical-significance" className="text-2xl font-bold text-foreground pt-8" itemProp="articleSection">Clinical Significance and Management</h2>
    <p>Osmolar gap interpretation requires clinical context and appropriate management.</p>

<h3 className="text-xl font-semibold text-foreground mt-6">Emergency Evaluation</h3>
<ul>
    <li>Significantly elevated gap (>20 mOsm/kg) requires immediate medical evaluation</li>
    <li>Suspected toxic ingestion requires emergency treatment</li>
    <li>Treatment may include alcohol dehydrogenase inhibitors (fomepizole, ethanol)</li>
    <li>Dialysis may be needed for severe cases</li>
</ul>

<h3 className="text-xl font-semibold text-foreground mt-6">Interpretation Considerations</h3>
<ul>
    <li>Gap should be interpreted in context of symptoms and history</li>
    <li>Normal gap doesn\'t rule out toxic ingestion if measured hours after ingestion</li>
    <li>Clinical suspicion is important even with normal gap</li>
    <li>Other diagnostic tests may be needed</li>
</ul>

<hr />

    <h2 className="text-2xl font-bold text-foreground pt-8" itemProp="articleSection">Conclusion</h2>
    <p>Serum osmolar gap is a valuable tool for detecting unmeasured osmoles, particularly in emergency medicine for identifying toxic alcohol ingestion. Understanding osmolar gap calculation, interpretation, and clinical significance is essential for appropriate diagnosis and treatment. Elevated gap requires immediate medical evaluation, especially if toxic ingestion is suspected. The gap should always be interpreted in clinical context, and normal gap doesn\'t rule out serious conditions if measured at the wrong time.</p>
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
          <p>This tool calculates serum osmolar gap from measured osmolality, sodium, glucose, and BUN to detect unmeasured osmoles and assess metabolic status.</p>
          <p>Outputs include measured osmolality, sodium, glucose, BUN, calculated osmolality, osmolar gap, status, recommendations, an action plan, and supporting metrics.</p>
          <p>Formula, steps, guide content, related tools, and FAQs ensure humans or AI assistants can interpret the methodology instantly.</p>
        </CardContent>
      </Card>
    </div>
  );
}



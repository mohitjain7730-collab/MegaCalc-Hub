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
  totalCalcium: z.number({ invalid_type_error: 'Enter total calcium' }).min(0).max(20),
  albumin: z.number({ invalid_type_error: 'Enter albumin' }).min(0).max(10),
});

type FormValues = z.infer<typeof formSchema>;

type ResultPayload = {
  totalCalcium: number;
  albumin: number;
  correctedCalcium: number;
  status: 'optimal' | 'good' | 'moderate' | 'low';
  interpretation: string;
  recommendations: string[];
  plan: { label: string; detail: string }[];
};

const steps = [
  'Enter total calcium level (mg/dL) from your lab results.',
  'Enter serum albumin level (g/dL) from your lab results.',
  'Review corrected calcium, status, and recommendations.',
];

const faqs = [
  {
    question: 'What is corrected calcium?',
    answer:
      'Corrected calcium adjusts total calcium levels for albumin concentration. Since about 40-50% of blood calcium is bound to albumin, low or high albumin levels can make total calcium appear falsely low or high. Corrected calcium provides a more accurate assessment of ionized (free) calcium levels.',
  },
  {
    question: 'Why is calcium correction important?',
    answer:
      'Calcium correction is essential because albumin-bound calcium is inactive. Only ionized (free) calcium is physiologically active. When albumin is abnormal, total calcium doesn\'t reflect true calcium status. Corrected calcium better estimates ionized calcium levels.',
  },
  {
    question: 'What are normal corrected calcium values?',
    answer:
      'Normal corrected calcium is typically 8.5-10.5 mg/dL (2.1-2.6 mmol/L). Values below 8.5 mg/dL indicate hypocalcemia, while values above 10.5 mg/dL indicate hypercalcemia. These ranges may vary slightly by laboratory.',
  },
  {
    question: 'When is calcium correction needed?',
    answer:
      'Calcium correction is particularly important when albumin levels are abnormal (low or high). It\'s commonly used in patients with liver disease, malnutrition, chronic illness, or conditions affecting protein levels. However, direct measurement of ionized calcium is most accurate.',
  },
  {
    question: 'What causes hypocalcemia?',
    answer:
      'Hypocalcemia can result from vitamin D deficiency, hypoparathyroidism, chronic kidney disease, low magnesium, pancreatitis, or certain medications. Symptoms include muscle cramps, tingling, seizures, and cardiac arrhythmias.',
  },
  {
    question: 'What causes hypercalcemia?',
    answer:
      'Hypercalcemia commonly results from hyperparathyroidism, cancer, excessive vitamin D, certain medications, or immobilization. Symptoms include fatigue, nausea, constipation, kidney stones, and in severe cases, cardiac arrhythmias.',
  },
  {
    question: 'How accurate is corrected calcium?',
    answer:
      'Corrected calcium is a useful estimate but not as accurate as direct measurement of ionized calcium. For critical decisions, especially in hospitalized patients or those with acid-base disorders, ionized calcium measurement is preferred.',
  },
  {
    question: 'What is the correction formula?',
    answer:
      'The most common formula is: Corrected Calcium = Total Calcium + 0.8 × (4 - Albumin), where albumin is in g/dL. This assumes normal albumin is 4 g/dL and adjusts for deviations from this value.',
  },
  {
    question: 'Can corrected calcium be used in all situations?',
    answer:
      'Corrected calcium is most reliable when albumin is between 2-5 g/dL. It may be less accurate in severe hypoalbuminemia, acid-base disorders, or when ionized calcium measurement is available. Always interpret in clinical context.',
  },
  {
    question: 'When should I consult a healthcare provider?',
    answer:
      'Consult a healthcare provider if corrected calcium is abnormal, if you have symptoms of calcium imbalance (muscle cramps, fatigue, nausea), if you have conditions affecting calcium metabolism, or if you need interpretation of lab results in context of your health.',
  },
];

const relatedCalculators = [
  {
    name: 'Vitamin D Deficiency Risk Score Calculator',
    slug: 'vitamin-d-deficiency-risk-score-calculator',
    description: 'Assess your risk for vitamin D deficiency.',
  },
  {
    name: 'Calcium Intake Calculator',
    slug: 'electrolyte-replacement-calculator',
    description: 'Calculate your daily calcium requirements.',
  },
  {
    name: 'Kidney Function eGFR Calculator',
    slug: 'kidney-function-egfr-calculator',
    description: 'Evaluate kidney function affecting calcium balance.',
  },
  {
    name: 'Bone Health Calculator',
    slug: 'bone-health-calculator',
    description: 'Assess bone health and calcium needs.',
  },
];

const baseUrl = 'https://mycalculating.com/category/health-fitness/calcium-correction-for-albumin-calculator';

const schemaMarkup = {
  '@context': 'https://schema.org',
  '@graph': [
    {
      '@type': 'BreadcrumbList',
      itemListElement: [
        { '@type': 'ListItem', position: 1, name: 'Home', item: 'https://mycalculating.com' },
        { '@type': 'ListItem', position: 2, name: 'Health & Fitness', item: 'https://mycalculating.com/category/health-fitness' },
        { '@type': 'ListItem', position: 3, name: 'Calcium Correction for Albumin Calculator', item: baseUrl },
      ],
    },
    {
      '@type': 'SoftwareApplication',
      name: 'Calcium Correction for Albumin Calculator',
      applicationCategory: 'Calculator',
      operatingSystem: 'Web Browser',
      description: 'Calculate corrected calcium level adjusting for serum albumin concentration to assess true calcium status.',
      url: baseUrl,
      offers: { '@type': 'Offer', price: '0', priceCurrency: 'USD' },
    },
  ],
};

const clamp = (value: number, min: number, max: number) => Math.min(max, Math.max(min, value));

const calculateResult = (values: FormValues): ResultPayload => {
  const totalCalcium = values.totalCalcium; // mg/dL
  const albumin = values.albumin; // g/dL
  
  // Calculate corrected calcium: Total Calcium + 0.8 × (4 - Albumin)
  // Assumes normal albumin is 4 g/dL
  const correctedCalcium = totalCalcium + 0.8 * (4 - albumin);
  
  let status: ResultPayload['status'] = 'optimal';
  let interpretation = 'Your corrected calcium is within normal range. Continue maintaining adequate calcium intake and vitamin D levels.';

  if (correctedCalcium < 7.5) {
    status = 'low';
    interpretation = 'Your corrected calcium indicates severe hypocalcemia. This requires immediate medical attention as it can cause serious complications including seizures and cardiac arrhythmias.';
  } else if (correctedCalcium < 8.5) {
    status = 'moderate';
    interpretation = 'Your corrected calcium indicates hypocalcemia (low calcium). This requires medical evaluation to determine the cause and appropriate treatment.';
  } else if (correctedCalcium > 12.5) {
    status = 'low';
    interpretation = 'Your corrected calcium indicates severe hypercalcemia. This requires immediate medical attention as it can cause serious complications including kidney damage and cardiac arrhythmias.';
  } else if (correctedCalcium > 10.5) {
    status = 'moderate';
    interpretation = 'Your corrected calcium indicates hypercalcemia (high calcium). This requires medical evaluation to determine the cause and appropriate treatment.';
  } else if (correctedCalcium >= 8.5 && correctedCalcium <= 10.5) {
    status = 'optimal';
    interpretation = 'Your corrected calcium is within normal range (8.5-10.5 mg/dL). Continue maintaining adequate calcium intake, vitamin D levels, and overall health.';
  } else {
    status = 'good';
    interpretation = 'Your corrected calcium is near normal range. Monitor regularly and maintain healthy lifestyle habits to support calcium balance.';
  }

  const recommendations = [
    'Consult healthcare provider: Abnormal corrected calcium requires medical evaluation. Your healthcare provider can determine the underlying cause and appropriate treatment, which may include addressing vitamin D deficiency, parathyroid disorders, or kidney function.',
    'Maintain adequate vitamin D: Vitamin D is essential for calcium absorption. Ensure adequate sun exposure or vitamin D supplementation as recommended by your healthcare provider.',
    'Balanced diet: Include calcium-rich foods (dairy, leafy greens, fortified foods) and maintain adequate protein intake to support albumin levels.',
  ];
  
  if (correctedCalcium < 8.5) {
    recommendations.push('Address hypocalcemia: Work with your healthcare provider to identify and treat the underlying cause. This may involve calcium supplements, vitamin D, or treatment of underlying conditions.');
  }
  
  if (correctedCalcium > 10.5) {
    recommendations.push('Address hypercalcemia: Work with your healthcare provider to identify and treat the underlying cause. This may involve hydration, medications, or treatment of underlying conditions like hyperparathyroidism.');
  }

  const plan = [
    { label: 'This Week', detail: `If corrected calcium is abnormal, schedule an appointment with your healthcare provider for evaluation. Monitor for symptoms of calcium imbalance (muscle cramps, fatigue, nausea).` },
    { label: 'This Month', detail: 'Follow up with healthcare provider as recommended. Implement dietary changes if advised, ensure adequate vitamin D, and address any underlying conditions affecting calcium metabolism.' },
    { label: 'Ongoing', detail: 'Maintain regular monitoring of calcium and albumin levels as recommended by your healthcare provider. Continue balanced nutrition, adequate vitamin D, and follow treatment plan to maintain normal calcium levels.' },
  ];

  return { totalCalcium, albumin, correctedCalcium, status, interpretation, recommendations, plan };
};

export default function CalciumCorrectionForAlbuminCalculator() {
  const [result, setResult] = useState<ResultPayload | null>(null);

  const form = useForm<FormValues>({
    resolver: zodResolver(formSchema),
    defaultValues: {
      totalCalcium: undefined,
      albumin: undefined,
    },
  });

  return (
    <div className="space-y-8">
      <Script id="calcium-correction-schema" type="application/ld+json" strategy="afterInteractive" dangerouslySetInnerHTML={{ __html: JSON.stringify(schemaMarkup) }} />

      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <Activity className="h-5 w-5" />
            Calcium Correction for Albumin Calculator
          </CardTitle>
          <CardDescription>Calculate corrected calcium level adjusting for serum albumin concentration to assess true calcium status.</CardDescription>
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
                  name="totalCalcium"
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel>Total Calcium (mg/dL)</FormLabel>
                      <FormControl>
                        <Input type="number" step="0.1" placeholder="e.g., 9.5" value={field.value ?? ''} onChange={(e) => field.onChange(e.target.value === '' ? undefined : Number(e.target.value))} />
                      </FormControl>
                      <FormMessage />
                    </FormItem>
                  )}
                />
                <FormField
                  control={form.control}
                  name="albumin"
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel>Serum Albumin (g/dL)</FormLabel>
                      <FormControl>
                        <Input type="number" step="0.1" placeholder="e.g., 4.0" value={field.value ?? ''} onChange={(e) => field.onChange(e.target.value === '' ? undefined : Number(e.target.value))} />
                      </FormControl>
                      <FormMessage />
                    </FormItem>
                  )}
                />
              </div>
              <Button type="submit" className="w-full md:w-auto">
                Calculate corrected calcium
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
            <CardDescription>See corrected calcium, status, and recommendations.</CardDescription>
          </CardHeader>
          <CardContent className="space-y-6">
            <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
              <div className="p-4 border rounded">
                <p className="text-sm text-muted-foreground">Corrected Calcium</p>
                <p className="text-2xl font-semibold text-primary">{result.correctedCalcium.toFixed(2)} mg/dL</p>
                <p className="text-xs text-muted-foreground">Adjusted for albumin</p>
              </div>
              <div className="p-4 border rounded">
                <p className="text-sm text-muted-foreground">Total Calcium</p>
                <p className="text-2xl font-semibold text-primary">{result.totalCalcium.toFixed(1)} mg/dL</p>
                <p className="text-xs text-muted-foreground">From lab results</p>
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
            <strong>Corrected Calcium (mg/dL)</strong> = Total Calcium (mg/dL) + 0.8 × (4 - Albumin (g/dL))
          </p>
          <p>
            This formula adjusts total calcium for albumin concentration. Since approximately 40-50% of blood calcium is bound to albumin, abnormal albumin levels can make total calcium appear falsely low or high. The correction assumes normal albumin is 4 g/dL.
          </p>
          <p>
            <strong>Reference range:</strong> Normal corrected calcium is 8.5-10.5 mg/dL (2.1-2.6 mmol/L). Values below 8.5 mg/dL indicate hypocalcemia, while values above 10.5 mg/dL indicate hypercalcemia. Note that direct measurement of ionized calcium is most accurate for critical decisions.
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
                <p className="text-sm text-muted-foreground">Calcium Status</p>
                <p className="text-xl font-semibold text-primary">
                  {result.correctedCalcium < 8.5 ? 'Hypocalcemia' : result.correctedCalcium > 10.5 ? 'Hypercalcemia' : 'Normal'}
                </p>
                <p className="text-xs text-muted-foreground">Based on corrected value</p>
              </div>
              <div className="p-4 border rounded">
                <p className="text-sm text-muted-foreground">Albumin</p>
                <p className="text-xl font-semibold text-primary">
                  {result.albumin.toFixed(1)} g/dL
                </p>
                <p className="text-xs text-muted-foreground">From lab results</p>
              </div>
              <div className="p-4 border rounded">
                <p className="text-sm text-muted-foreground">Correction Factor</p>
                <p className="text-xl font-semibold text-primary">
                  {(0.8 * (4 - result.albumin)).toFixed(2)} mg/dL
                </p>
                <p className="text-xs text-muted-foreground">Adjustment applied</p>
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
    <meta itemProp="name" content="The Definitive Guide to Calcium Correction for Albumin: Understanding True Calcium Status" />
    <meta itemProp="description" content="An expert, evidence-based guide on calcium correction for albumin, detailing calcium metabolism, albumin binding, and comprehensive strategies to assess and maintain proper calcium balance." />
    <meta itemProp="keywords" content="calcium correction albumin calculator, corrected calcium, hypocalcemia hypercalcemia, calcium metabolism, ionized calcium, albumin binding" />
    <meta itemProp="author" content="[Your Site's Health Team]" />
    <meta itemProp="datePublished" content="2025-12-01" />
    <meta itemProp="url" content="/definitive-calcium-correction-guide" />

    <h1 className="text-3xl md:text-4xl font-extrabold text-foreground mb-4" itemProp="headline">The Definitive Guide to Calcium Correction for Albumin: Understanding True Calcium Status</h1>
    <p className="text-lg italic text-gray-700">Explore the science of calcium correction for albumin, calcium metabolism, albumin binding, and comprehensive strategies to assess and maintain proper calcium balance.</p>

    <h2 className="text-2xl font-bold text-foreground mt-8 mb-4">Table of Contents: Jump to a Section</h2>
    <ul className="list-disc ml-6 space-y-2 text-blue-600">
        <li><a href="#calcium-metabolism" className="hover:underline">Understanding Calcium Metabolism and Albumin Binding</a></li>
        <li><a href="#calcium-correction" className="hover:underline">Calcium Correction Formula and Calculation</a></li>
        <li><a href="#calcium-disorders" className="hover:underline">Hypocalcemia and Hypercalcemia</a></li>
        <li><a href="#health-risks" className="hover:underline">Health Risks of Calcium Imbalance</a></li>
        <li><a href="#prevention" className="hover:underline">Comprehensive Calcium Balance Strategies</a></li>
    </ul>
<hr />

    <h2 id="calcium-metabolism" className="text-2xl font-bold text-foreground pt-8" itemProp="articleSection">Understanding Calcium Metabolism and Albumin Binding</h2>
    <p>Calcium is essential for numerous physiological functions including bone health, muscle contraction, nerve function, and blood clotting. In the blood, calcium exists in three forms: <b>ionized (free) calcium</b>, <b>protein-bound calcium</b> (primarily to albumin), and <b>complexed calcium</b> (bound to anions like phosphate).</p>

<h3 className="text-xl font-semibold text-foreground mt-6">Calcium Distribution in Blood</h3>
<ul>
    <li><b>Ionized Calcium (50%):</b> The physiologically active form, not bound to proteins. This is the form that affects cellular function.</li>
    <li><b>Protein-Bound Calcium (40-45%):</b> Primarily bound to albumin. This form is inactive and serves as a reservoir.</li>
    <li><b>Complexed Calcium (5-10%):</b> Bound to anions like phosphate, citrate, or bicarbonate.</li>
</ul>

<h3 className="text-xl font-semibold text-foreground mt-6">Why Correction is Needed</h3>
<p>Total calcium measurement includes all three forms. However, only <b>ionized calcium</b> is physiologically active. When albumin levels are abnormal (low or high), the protein-bound fraction changes, making total calcium an unreliable indicator of true calcium status. <b>Corrected calcium</b> adjusts for albumin concentration to better estimate ionized calcium levels.</p>

<hr />

    <h2 id="calcium-correction" className="text-2xl font-bold text-foreground pt-8" itemProp="articleSection">Calcium Correction Formula and Calculation</h2>
    <p>The most commonly used formula for calcium correction is:</p>
    <p><b>Corrected Calcium = Total Calcium + 0.8 × (4 - Albumin)</b></p>
    <p>This formula assumes normal albumin is 4 g/dL and adjusts calcium by 0.8 mg/dL for each 1 g/dL deviation from normal albumin.</p>

<h3 className="text-xl font-semibold text-foreground mt-6">When to Use Corrected Calcium</h3>
<ul>
    <li>When albumin is abnormal (low or high)</li>
    <li>In patients with liver disease, malnutrition, or chronic illness</li>
    <li>When direct ionized calcium measurement is not available</li>
    <li>For screening and monitoring purposes</li>
</ul>

<h3 className="text-xl font-semibold text-foreground mt-6">Limitations of Corrected Calcium</h3>
<ul>
    <li>Corrected calcium is an <b>estimate</b>, not as accurate as direct ionized calcium measurement</li>
    <li>May be less reliable in severe hypoalbuminemia or acid-base disorders</li>
    <li>For critical decisions, especially in hospitalized patients, direct ionized calcium measurement is preferred</li>
    <li>Different laboratories may use slightly different correction formulas</li>
</ul>

<hr />

    <h2 id="calcium-disorders" className="text-2xl font-bold text-foreground pt-8" itemProp="articleSection">Hypocalcemia and Hypercalcemia</h2>
    <p>Abnormal corrected calcium levels indicate calcium imbalance that requires medical attention.</p>

<h3 className="text-xl font-semibold text-foreground mt-6">Hypocalcemia (Low Calcium)</h3>
<p>Hypocalcemia is defined as corrected calcium &lt;8.5 mg/dL. Causes include:</p>
<ul>
    <li>Vitamin D deficiency</li>
    <li>Hypoparathyroidism</li>
    <li>Chronic kidney disease</li>
    <li>Low magnesium</li>
    <li>Pancreatitis</li>
    <li>Certain medications</li>
</ul>
<p><b>Symptoms:</b> Muscle cramps, tingling, numbness, seizures, cardiac arrhythmias, tetany</p>

<h3 className="text-xl font-semibold text-foreground mt-6">Hypercalcemia (High Calcium)</h3>
<p>Hypercalcemia is defined as corrected calcium &gt;10.5 mg/dL. Causes include:</p>
<ul>
    <li>Hyperparathyroidism (most common)</li>
    <li>Cancer (bone metastases, PTH-related protein)</li>
    <li>Excessive vitamin D</li>
    <li>Certain medications</li>
    <li>Immobilization</li>
</ul>
<p><b>Symptoms:</b> Fatigue, weakness, nausea, constipation, kidney stones, cardiac arrhythmias</p>

<hr />

    <h2 id="health-risks" className="text-2xl font-bold text-foreground pt-8" itemProp="articleSection">Health Risks of Calcium Imbalance</h2>
    <p>Both hypocalcemia and hypercalcemia can cause serious health complications if not addressed.</p>

<h3 className="text-xl font-semibold text-foreground mt-6">Hypocalcemia Risks</h3>
<ul>
    <li>Muscle spasms and tetany</li>
    <li>Seizures</li>
    <li>Cardiac arrhythmias</li>
    <li>Bone demineralization</li>
    <li>Neurological symptoms</li>
</ul>

<h3 className="text-xl font-semibold text-foreground mt-6">Hypercalcemia Risks</h3>
<ul>
    <li>Kidney stones</li>
    <li>Kidney damage</li>
    <li>Cardiac arrhythmias</li>
    <li>Bone pain and fractures</li>
    <li>Gastrointestinal symptoms</li>
</ul>

<hr />

    <h2 id="prevention" className="text-2xl font-bold text-foreground pt-8" itemProp="articleSection">Comprehensive Calcium Balance Strategies</h2>
    <p>Maintaining proper calcium balance requires adequate intake, vitamin D, and addressing underlying conditions.</p>

<h3 className="text-xl font-semibold text-foreground mt-6">Dietary Calcium</h3>
<ul>
    <li>Include calcium-rich foods: dairy products, leafy greens, fortified foods, sardines</li>
    <li>Recommended daily intake: 1000-1200 mg for adults</li>
    <li>Distribute intake throughout the day for better absorption</li>
</ul>

<h3 className="text-xl font-semibold text-foreground mt-6">Vitamin D</h3>
<ul>
    <li>Essential for calcium absorption</li>
    <li>Get adequate sun exposure or take supplements as recommended</li>
    <li>Recommended daily intake: 600-800 IU for adults</li>
</ul>

<h3 className="text-xl font-semibold text-foreground mt-6">Medical Management</h3>
<ul>
    <li>Address underlying causes (vitamin D deficiency, parathyroid disorders, kidney disease)</li>
    <li>Calcium supplements if needed (under medical supervision)</li>
    <li>Medications to lower calcium if hypercalcemic</li>
    <li>Regular monitoring of calcium and albumin levels</li>
</ul>

<hr />

    <h2 className="text-2xl font-bold text-foreground pt-8" itemProp="articleSection">Conclusion</h2>
    <p>Calcium correction for albumin is a valuable tool for assessing true calcium status when albumin levels are abnormal. Understanding corrected calcium values, their significance, and appropriate management strategies is essential for maintaining proper calcium balance and preventing complications. While corrected calcium is useful for screening and monitoring, direct measurement of ionized calcium is most accurate for critical decisions. Regular monitoring, adequate dietary calcium and vitamin D, and addressing underlying conditions are key to maintaining optimal calcium balance.</p>
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
          <p>This tool calculates corrected calcium level adjusting for serum albumin concentration to assess true calcium status.</p>
          <p>Outputs include total calcium, albumin, corrected calcium, status, recommendations, an action plan, and supporting metrics.</p>
          <p>Formula, steps, guide content, related tools, and FAQs ensure humans or AI assistants can interpret the methodology instantly.</p>
        </CardContent>
      </Card>
    </div>
  );
}



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
  urineAlbumin: z.number({ invalid_type_error: 'Enter urine albumin' }).min(0).max(1000),
  urineCreatinine: z.number({ invalid_type_error: 'Enter urine creatinine' }).min(0).max(500),
});

type FormValues = z.infer<typeof formSchema>;

type ResultPayload = {
  urineAlbumin: number;
  urineCreatinine: number;
  acr: number;
  status: 'optimal' | 'good' | 'moderate' | 'low';
  interpretation: string;
  recommendations: string[];
  plan: { label: string; detail: string }[];
};

const steps = [
  'Enter urine albumin level (mg/dL) from your lab results.',
  'Enter urine creatinine level (mg/dL) from your lab results.',
  'Review ACR ratio, status, and recommendations.',
];

const faqs = [
  {
    question: 'What is Albumin-to-Creatinine Ratio (ACR)?',
    answer:
      'ACR is a test used to detect kidney damage, particularly early kidney disease. It measures the ratio of albumin (a protein) to creatinine in urine. Normal ACR is less than 30 mg/g. Elevated ACR indicates proteinuria and potential kidney dysfunction.',
  },
  {
    question: 'What are normal ACR values?',
    answer:
      'Normal ACR is less than 30 mg/g (or 3 mg/mmol). ACR 30-300 mg/g indicates microalbuminuria (early kidney damage). ACR greater than 300 mg/g indicates macroalbuminuria (significant kidney damage).',
  },
  {
    question: 'Why is ACR important?',
    answer:
      'ACR is a sensitive marker for kidney disease, especially in people with diabetes or hypertension. Early detection allows for timely intervention to prevent or slow kidney disease progression. It\'s more reliable than 24-hour urine collection.',
  },
  {
    question: 'What factors affect ACR?',
    answer:
      'ACR can be elevated by diabetes, hypertension, kidney disease, urinary tract infections, exercise, fever, and certain medications. It should be measured in a first-morning urine sample for most accurate results.',
  },
  {
    question: 'What are the health risks of elevated ACR?',
    answer:
      'Elevated ACR indicates increased risk of chronic kidney disease progression, cardiovascular disease, and end-stage renal disease. It\'s a strong predictor of kidney and cardiovascular outcomes, especially in diabetic patients.',
  },
  {
    question: 'How can I lower my ACR?',
    answer:
      'Lower ACR by controlling blood pressure (target <130/80 mmHg), managing blood sugar if diabetic (HbA1c <7%), reducing protein intake if recommended, taking ACE inhibitors or ARBs as prescribed, and maintaining a healthy lifestyle with regular exercise.',
  },
  {
    question: 'How often should ACR be tested?',
    answer:
      'For people with diabetes, ACR should be tested annually. For those with hypertension or known kidney disease, testing frequency depends on individual risk factors and should be determined by a healthcare provider.',
  },
  {
    question: 'What is the difference between ACR and proteinuria?',
    answer:
      'ACR is a more specific and sensitive test than total proteinuria. It corrects for urine concentration using creatinine, making it more reliable. ACR is the preferred method for detecting early kidney damage, especially in diabetic patients.',
  },
  {
    question: 'Can ACR be temporarily elevated?',
    answer:
      'Yes, ACR can be temporarily elevated due to exercise, fever, urinary tract infections, or recent illness. For accurate assessment, ACR should be measured in a first-morning urine sample when possible, and elevated results should be confirmed with repeat testing.',
  },
  {
    question: 'When should I consult a healthcare provider?',
    answer:
      'Consult a healthcare provider if your ACR is elevated (â‰¥30 mg/g), if you have diabetes or hypertension with elevated ACR, if ACR is increasing over time, or if you have symptoms of kidney disease (swelling, fatigue, changes in urination).',
  },
];

const relatedCalculators = [
  {
    name: 'Kidney Function Creatinine Clearance (CrCl) Calculator',
    slug: 'kidney-function-creatinine-clearance-crcl-calculator',
    description: 'Assess kidney function using creatinine clearance.',
  },
  {
    name: 'Blood Urea Nitrogen (BUN) Ratio Calculator',
    slug: 'blood-urea-nitrogen-bun-ratio-calculator',
    description: 'Evaluate kidney function with BUN levels.',
  },
  {
    name: 'Glomerular Filtration Rate (GFR) Calculator',
    slug: 'kidney-function-egfr-calculator',
    description: 'Calculate estimated GFR for kidney health assessment.',
  },
  {
    name: 'Diabetes Risk Calculator',
    slug: 'diabetes-risk-calculator',
    description: 'Assess your risk for developing diabetes.',
  },
];

const baseUrl = 'https://mycalculating.com/health-fitness/albumin-to-creatinine-ratio-calculator';

const schemaMarkup = {
  '@context': 'https://schema.org',
  '@graph': [
    {
      '@type': 'BreadcrumbList',
      itemListElement: [
        { '@type': 'ListItem', position: 1, name: 'Home', item: 'https://mycalculating.com' },
        { '@type': 'ListItem', position: 2, name: 'Health & Fitness', item: 'https://mycalculating.com/health-fitness' },
        { '@type': 'ListItem', position: 3, name: 'Albumin-to-Creatinine Ratio Calculator', item: baseUrl },
      ],
    },
    {
      '@type': 'SoftwareApplication',
      name: 'Albumin-to-Creatinine Ratio Calculator',
      applicationCategory: 'Calculator',
      operatingSystem: 'Web Browser',
      description: 'Calculate albumin-to-creatinine ratio (ACR) from urine albumin and creatinine levels to assess kidney function.',
      url: baseUrl,
      offers: { '@type': 'Offer', price: '0', priceCurrency: 'USD' },
    },
  ],
};

const clamp = (value: number, min: number, max: number) => Math.min(max, Math.max(min, value));

const calculateResult = (values: FormValues): ResultPayload => {
  const urineAlbumin = values.urineAlbumin; // mg/dL
  const urineCreatinine = values.urineCreatinine; // mg/dL
  
  // Calculate ACR: (Urine Albumin / Urine Creatinine) Ã— 1000 (converts to mg/g)
  const acr = urineCreatinine > 0 ? (urineAlbumin / urineCreatinine) * 1000 : 0;
  
  let status: ResultPayload['status'] = 'optimal';
  let interpretation = 'Your ACR is within normal range. Continue maintaining healthy kidney function through proper diet and lifestyle.';

  if (acr >= 300) {
    status = 'low';
    interpretation = 'Your ACR indicates macroalbuminuria (significant proteinuria). This suggests substantial kidney damage and requires immediate medical attention and management.';
  } else if (acr >= 30) {
    status = 'moderate';
    interpretation = 'Your ACR indicates microalbuminuria (early kidney damage). This requires medical evaluation and intervention to prevent further kidney disease progression.';
  } else if (acr >= 20) {
    status = 'good';
    interpretation = 'Your ACR is slightly elevated but still within acceptable range. Monitor regularly and maintain healthy lifestyle habits to support kidney health.';
  } else {
    status = 'optimal';
    interpretation = 'Your ACR is within normal range (<30 mg/g). Continue maintaining healthy kidney function through proper diet, hydration, and lifestyle.';
  }

  const recommendations = [
    'Consult healthcare provider: Elevated ACR requires medical evaluation. Your healthcare provider can determine appropriate treatment, which may include blood pressure control, diabetes management, or medications like ACE inhibitors or ARBs.',
    'Control blood pressure: Maintain blood pressure below 130/80 mmHg if you have kidney disease or diabetes. High blood pressure accelerates kidney damage.',
    'Manage blood sugar: If you have diabetes, maintain tight glycemic control (HbA1c <7%) to prevent or slow kidney disease progression.',
  ];
  
  if (acr >= 30) {
    recommendations.push('Reduce protein intake: If recommended by your healthcare provider, moderate protein intake may help reduce proteinuria. Consult a dietitian for personalized guidance.');
    recommendations.push('Take prescribed medications: ACE inhibitors or ARBs are often prescribed to reduce proteinuria and protect kidney function. Take medications as directed.');
  }
  
  if (acr < 30) {
    recommendations.push('Maintain healthy lifestyle: Continue regular exercise, maintain healthy weight, stay hydrated, and avoid excessive salt intake to support kidney health.');
  }

  const plan = [
    { label: 'This Week', detail: `If ACR is elevated (â‰¥30 mg/g), schedule an appointment with your healthcare provider for evaluation and treatment planning. Monitor blood pressure and blood sugar if applicable.` },
    { label: 'This Month', detail: 'Follow up with healthcare provider as recommended. Implement lifestyle changes including diet modifications, regular exercise, and medication adherence if prescribed.' },
    { label: 'Ongoing', detail: 'Maintain regular ACR monitoring as recommended by your healthcare provider (typically annually for diabetes, or more frequently if elevated). Continue managing underlying conditions (diabetes, hypertension) and follow treatment plan to preserve kidney function.' },
  ];

  return { urineAlbumin, urineCreatinine, acr, status, interpretation, recommendations, plan };
};

export default function AlbuminToCreatinineRatioCalculator() {
  const [result, setResult] = useState<ResultPayload | null>(null);

  const form = useForm<FormValues>({
    resolver: zodResolver(formSchema),
    defaultValues: {
      urineAlbumin: undefined,
      urineCreatinine: undefined,
    },
  });

  return (
    <div className="space-y-8">
      <Script id="albumin-creatinine-ratio-schema" type="application/ld+json" strategy="afterInteractive" dangerouslySetInnerHTML={{ __html: JSON.stringify(schemaMarkup) }} />

      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <Activity className="h-5 w-5" />
            Albumin-to-Creatinine Ratio Calculator
          </CardTitle>
          <CardDescription>Calculate albumin-to-creatinine ratio (ACR) from urine albumin and creatinine levels to assess kidney function.</CardDescription>
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
                  name="urineAlbumin"
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel>Urine Albumin (mg/dL)</FormLabel>
                      <FormControl>
                        <Input type="number" step="0.1" placeholder="e.g., 15" value={field.value ?? ''} onChange={(e) => field.onChange(e.target.value === '' ? undefined : Number(e.target.value))} />
                      </FormControl>
                      <FormMessage />
                    </FormItem>
                  )}
                />
                <FormField
                  control={form.control}
                  name="urineCreatinine"
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel>Urine Creatinine (mg/dL)</FormLabel>
                      <FormControl>
                        <Input type="number" step="0.1" placeholder="e.g., 100" value={field.value ?? ''} onChange={(e) => field.onChange(e.target.value === '' ? undefined : Number(e.target.value))} />
                      </FormControl>
                      <FormMessage />
                    </FormItem>
                  )}
                />
              </div>
              <Button type="submit" className="w-full md:w-auto">
                Calculate ACR
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
            <CardDescription>See ACR ratio, status, and recommendations.</CardDescription>
          </CardHeader>
          <CardContent className="space-y-6">
            <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
              <div className="p-4 border rounded">
                <p className="text-sm text-muted-foreground">ACR Ratio</p>
                <p className="text-2xl font-semibold text-primary">{result.acr.toFixed(1)} mg/g</p>
                <p className="text-xs text-muted-foreground">Albumin-to-Creatinine</p>
              </div>
              <div className="p-4 border rounded">
                <p className="text-sm text-muted-foreground">Urine Albumin</p>
                <p className="text-2xl font-semibold text-primary">{result.urineAlbumin.toFixed(1)} mg/dL</p>
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
            <strong>ACR (mg/g)</strong> = (Urine Albumin (mg/dL) / Urine Creatinine (mg/dL)) Ã— 1000
          </p>
          <p>
            The ACR normalizes urine albumin concentration by urine creatinine, accounting for urine concentration variations. This makes ACR more reliable than measuring albumin alone.
          </p>
          <p>
            <strong>Reference ranges:</strong> Normal &lt;30 mg/g, Microalbuminuria 30-300 mg/g, Macroalbuminuria &gt;300 mg/g. ACR is a key marker for early kidney disease detection, especially in diabetic and hypertensive patients.
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
                <p className="text-sm text-muted-foreground">ACR Category</p>
                <p className="text-xl font-semibold text-primary">
                  {result.acr < 30 ? 'Normal' : result.acr < 300 ? 'Microalbuminuria' : 'Macroalbuminuria'}
                </p>
                <p className="text-xs text-muted-foreground">Based on ACR value</p>
              </div>
              <div className="p-4 border rounded">
                <p className="text-sm text-muted-foreground">Urine Creatinine</p>
                <p className="text-xl font-semibold text-primary">
                  {result.urineCreatinine.toFixed(1)} mg/dL
                </p>
                <p className="text-xs text-muted-foreground">From lab results</p>
              </div>
              <div className="p-4 border rounded">
                <p className="text-sm text-muted-foreground">Kidney Health</p>
                <p className="text-xl font-semibold text-primary">
                  {result.acr < 30 ? 'Normal' : 'Requires Attention'}
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
                <Link href={`/${calc.slug}`} className="text-primary hover:underline">
                  {calc.name}
                </Link>
              </h4>
              <p className="text-sm text-muted-foreground">{calc.description}</p>
            </div>
          ))}
        </CardContent>
      </Card>

      <section className="space-y-6 text-muted-foreground leading-relaxed bg-white p-6 md:p-10 rounded-lg shadow-lg" itemType="https://schema.org/MedicalWebPage">
    <meta itemProp="name" content="The Definitive Guide to Albumin-to-Creatinine Ratio: Understanding Kidney Function and Early Disease Detection" />
    <meta itemProp="description" content="An expert, evidence-based guide on albumin-to-creatinine ratio (ACR), detailing kidney function assessment, proteinuria detection, and comprehensive strategies to prevent and manage kidney disease." />
    <meta itemProp="keywords" content="albumin creatinine ratio calculator, ACR kidney function, proteinuria detection, kidney disease screening, microalbuminuria, macroalbuminuria, diabetic nephropathy" />
    <meta itemProp="author" content="[Your Site's Health Team]" />
    <meta itemProp="datePublished" content="2025-12-01" />
    <meta itemProp="url" content="/definitive-acr-guide" />

    <h1 className="text-3xl md:text-4xl font-extrabold text-foreground mb-4" itemProp="headline">The Definitive Guide to Albumin-to-Creatinine Ratio: Understanding Kidney Function and Early Disease Detection</h1>
    <p className="text-lg italic text-gray-700">Explore the science of albumin-to-creatinine ratio (ACR), kidney function assessment, proteinuria detection, and comprehensive strategies to prevent and manage kidney disease.</p>

    <h2 className="text-2xl font-bold text-foreground mt-8 mb-4">Table of Contents: Jump to a Section</h2>
    <ul className="list-disc ml-6 space-y-2 text-blue-600">
        <li><a href="#acr-basics" className="hover:underline">Understanding Albumin-to-Creatinine Ratio (ACR)</a></li>
        <li><a href="#kidney-function" className="hover:underline">ACR and Kidney Function Assessment</a></li>
        <li><a href="#proteinuria" className="hover:underline">Proteinuria and Kidney Disease</a></li>
        <li><a href="#health-risks" className="hover:underline">Health Risks of Elevated ACR</a></li>
        <li><a href="#prevention" className="hover:underline">Comprehensive Kidney Health Strategies</a></li>
    </ul>
<hr />

    <h2 id="acr-basics" className="text-2xl font-bold text-foreground pt-8" itemProp="articleSection">Understanding Albumin-to-Creatinine Ratio (ACR)</h2>
    <p>The <b>Albumin-to-Creatinine Ratio (ACR)</b> is a critical laboratory test used to detect early kidney damage, particularly in individuals with diabetes or hypertension. ACR measures the ratio of albumin (a protein) to creatinine in a urine sample, providing a reliable indicator of kidney function that corrects for variations in urine concentration.</p>

<h3 className="text-xl font-semibold text-foreground mt-6">What is ACR?</h3>
<p>ACR is calculated by dividing urine albumin concentration by urine creatinine concentration and multiplying by 1000 to express the result in mg/g. This ratio normalizes albumin levels for urine concentration, making it more reliable than measuring albumin alone.</p>

<h3 className="text-xl font-semibold text-foreground mt-6">ACR Reference Ranges</h3>
<div className="overflow-x-auto my-6 p-4 bg-gray-50 border rounded-lg">
    <table className="w-full text-left border-collapse">
        <thead>
            <tr>
                <th className="border-b p-2 font-bold">ACR Value (mg/g)</th>
                <th className="border-b p-2 font-bold">Category</th>
                <th className="border-b p-2 font-bold">Interpretation</th>
            </tr>
        </thead>
        <tbody>
            <tr>
                <td className="border-b p-2">&lt;30</td>
                <td className="border-b p-2">Normal</td>
                <td className="border-b p-2">No significant proteinuria</td>
            </tr>
            <tr>
                <td className="border-b p-2">30-300</td>
                <td className="border-b p-2">Microalbuminuria</td>
                <td className="border-b p-2">Early kidney damage</td>
            </tr>
            <tr>
                <td className="border-b p-2">&gt;300</td>
                <td className="border-b p-2">Macroalbuminuria</td>
                <td className="border-b p-2">Significant kidney damage</td>
            </tr>
        </tbody>
    </table>
</div>

<hr />

    <h2 id="kidney-function" className="text-2xl font-bold text-foreground pt-8" itemProp="articleSection">ACR and Kidney Function Assessment</h2>
    <p>ACR is a sensitive marker for early kidney disease, especially in high-risk populations. It provides valuable information about kidney health and helps guide treatment decisions.</p>

<h3 className="text-xl font-semibold text-foreground mt-6">Why ACR is Important</h3>
<ul>
    <li><b>Early Detection:</b> ACR can detect kidney damage before significant symptoms appear, allowing for early intervention.</li>
    <li><b>Diabetes Monitoring:</b> For people with diabetes, ACR is a key screening tool for diabetic nephropathy (kidney disease).</li>
    <li><b>Hypertension Assessment:</b> Elevated ACR in hypertensive patients indicates kidney involvement and guides treatment.</li>
    <li><b>Cardiovascular Risk:</b> Elevated ACR is associated with increased cardiovascular disease risk.</li>
</ul>

<hr />

    <h2 id="proteinuria" className="text-2xl font-bold text-foreground pt-8" itemProp="articleSection">Proteinuria and Kidney Disease</h2>
    <p>Proteinuria (protein in urine) is a sign of kidney damage. ACR specifically measures albuminuria, which is the most clinically significant form of proteinuria.</p>

<h3 className="text-xl font-semibold text-foreground mt-6">Causes of Elevated ACR</h3>
<ul>
    <li><b>Diabetes:</b> Diabetic nephropathy is a leading cause of elevated ACR.</li>
    <li><b>Hypertension:</b> High blood pressure can damage kidney filters, leading to proteinuria.</li>
    <li><b>Kidney Disease:</b> Various forms of kidney disease can cause elevated ACR.</li>
    <li><b>Infections:</b> Urinary tract infections can temporarily elevate ACR.</li>
    <li><b>Exercise:</b> Strenuous exercise can cause temporary proteinuria.</li>
</ul>

<hr />

    <h2 id="health-risks" className="text-2xl font-bold text-foreground pt-8" itemProp="articleSection">Health Risks of Elevated ACR</h2>
    <p>Elevated ACR is associated with increased risks of kidney disease progression and cardiovascular complications.</p>

<h3 className="text-xl font-semibold text-foreground mt-6">Kidney Disease Progression</h3>
<p>Elevated ACR indicates increased risk of:</p>
<ul>
    <li>Chronic kidney disease progression</li>
    <li>End-stage renal disease</li>
    <li>Need for dialysis or kidney transplant</li>
</ul>

<h3 className="text-xl font-semibold text-foreground mt-6">Cardiovascular Risk</h3>
<p>Elevated ACR is a strong predictor of:</p>
<ul>
    <li>Cardiovascular events (heart attack, stroke)</li>
    <li>Increased mortality risk</li>
    <li>Hypertension complications</li>
</ul>

<hr />

    <h2 id="prevention" className="text-2xl font-bold text-foreground pt-8" itemProp="articleSection">Comprehensive Kidney Health Strategies</h2>
    <p>Managing elevated ACR requires a comprehensive approach including medical treatment, lifestyle modifications, and regular monitoring.</p>

<h3 className="text-xl font-semibold text-foreground mt-6">Medical Management</h3>
<ul>
    <li><b>Blood Pressure Control:</b> Maintain BP &lt;130/80 mmHg with ACE inhibitors or ARBs, which also reduce proteinuria.</li>
    <li><b>Diabetes Management:</b> Tight glycemic control (HbA1c &lt;7%) slows kidney disease progression.</li>
    <li><b>Medications:</b> ACE inhibitors and ARBs are first-line treatments for proteinuria.</li>
</ul>

<h3 className="text-xl font-semibold text-foreground mt-6">Lifestyle Modifications</h3>
<ul>
    <li><b>Diet:</b> Reduce sodium intake, moderate protein if recommended, maintain healthy weight.</li>
    <li><b>Exercise:</b> Regular physical activity supports cardiovascular and kidney health.</li>
    <li><b>Hydration:</b> Adequate fluid intake supports kidney function.</li>
    <li><b>Avoid Nephrotoxins:</b> Limit NSAIDs and other medications that can harm kidneys.</li>
</ul>

<h3 className="text-xl font-semibold text-foreground mt-6">Regular Monitoring</h3>
<p>For people with diabetes or elevated ACR, regular monitoring is essential:</p>
<ul>
    <li>Annual ACR testing for diabetics</li>
    <li>More frequent testing if ACR is elevated</li>
    <li>Regular blood pressure and blood sugar monitoring</li>
    <li>Annual comprehensive metabolic panel</li>
</ul>

<hr />

    <h2 className="text-2xl font-bold text-foreground pt-8" itemProp="articleSection">Conclusion</h2>
    <p>Albumin-to-Creatinine Ratio (ACR) is a critical tool for early kidney disease detection, especially in people with diabetes or hypertension. Understanding ACR values, their significance, and appropriate management strategies is essential for preserving kidney function and reducing cardiovascular risk. Regular ACR monitoring, combined with blood pressure control, diabetes management, and lifestyle modifications, can significantly slow kidney disease progression and improve long-term health outcomes.</p>
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
          <p>This tool calculates albumin-to-creatinine ratio (ACR) from urine albumin and creatinine levels to assess kidney function.</p>
          <p>Outputs include urine albumin, urine creatinine, ACR ratio, status, recommendations, an action plan, and supporting metrics.</p>
          <p>Formula, steps, guide content, related tools, and FAQs ensure humans or AI assistants can interpret the methodology instantly.</p>
        </CardContent>
      </Card>
    </div>
  );
}



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
  hematocrit: z.number({ invalid_type_error: 'Enter hematocrit' }).min(0).max(100),
  redBloodCellCount: z.number({ invalid_type_error: 'Enter red blood cell count' }).min(0).max(10),
});

type FormValues = z.infer<typeof formSchema>;

type ResultPayload = {
  hematocrit: number;
  redBloodCellCount: number;
  mcv: number;
  status: 'optimal' | 'good' | 'moderate' | 'low';
  interpretation: string;
  recommendations: string[];
  plan: { label: string; detail: string }[];
};

const steps = [
  'Enter hematocrit (%) from your complete blood count (CBC) results.',
  'Enter red blood cell count (million cells/μL) from your CBC results.',
  'Review MCV, status, and recommendations.',
];

const faqs = [
  {
    question: 'What is Mean Corpuscular Volume (MCV)?',
    answer:
      'MCV measures the average size of red blood cells. It helps classify anemias as microcytic (small cells), normocytic (normal size), or macrocytic (large cells). MCV is calculated from hematocrit and red blood cell count.',
  },
  {
    question: 'What are normal MCV values?',
    answer:
      'Normal MCV is typically 80-100 fL (femtoliters). Values below 80 fL indicate microcytic anemia (small cells), while values above 100 fL indicate macrocytic anemia (large cells). Values 80-100 fL are considered normocytic (normal size).',
  },
  {
    question: 'What causes low MCV (microcytic anemia)?',
    answer:
      'Low MCV is most commonly caused by iron deficiency anemia. Other causes include thalassemia, anemia of chronic disease, sideroblastic anemia, or lead poisoning. Iron deficiency is the most common cause worldwide.',
  },
  {
    question: 'What causes high MCV (macrocytic anemia)?',
    answer:
      'High MCV is commonly caused by vitamin B12 deficiency, folate deficiency, liver disease, hypothyroidism, alcohol use, or certain medications. Megaloblastic anemia (B12/folate deficiency) is a common cause.',
  },
  {
    question: 'Why is MCV important?',
    answer:
      'MCV helps classify anemia and guides diagnosis. Different types of anemia have different causes and treatments. MCV, along with other red blood cell indices, helps healthcare providers determine the underlying cause of anemia.',
  },
  {
    question: 'How is MCV used in diagnosis?',
    answer:
      'MCV is used with other red blood cell indices (MCH, MCHC) and clinical findings to diagnose anemia types. Microcytic anemia suggests iron deficiency or thalassemia. Macrocytic anemia suggests B12/folate deficiency or other causes.',
  },
  {
    question: 'Can MCV be normal in anemia?',
    answer:
      'Yes, normocytic anemia (normal MCV) can occur in conditions like acute blood loss, hemolytic anemia, bone marrow disorders, or chronic disease. MCV alone doesn\'t diagnose anemia; it must be interpreted with hemoglobin and other indices.',
  },
  {
    question: 'What other red blood cell indices are important?',
    answer:
      'Along with MCV, Mean Corpuscular Hemoglobin (MCH) and Mean Corpuscular Hemoglobin Concentration (MCHC) provide additional information about red blood cells. These indices help classify and diagnose different types of anemia.',
  },
  {
    question: 'How is MCV affected by age?',
    answer:
      'MCV can vary slightly with age. Newborns have higher MCV (100-120 fL) that decreases to adult values by 6 months. Elderly individuals may have slightly higher MCV. Always interpret MCV in context of age and clinical findings.',
  },
  {
    question: 'When should I consult a healthcare provider?',
    answer:
      'Consult a healthcare provider if MCV is abnormal, if you have symptoms of anemia (fatigue, weakness, shortness of breath), if you have a family history of blood disorders, or if you need interpretation of CBC results in context of your health.',
  },
];

const relatedCalculators = [
  {
    name: 'Iron Deficiency Anemia Risk Calculator',
    slug: 'iron-deficiency-anemia-risk-calculator',
    description: 'Assess your risk for iron deficiency anemia.',
  },
  {
    name: 'Hemoglobin (Hb) Level Estimator',
    slug: 'hemoglobin-hb-level-estimator',
    description: 'Evaluate hemoglobin levels and anemia.',
  },
  {
    name: 'Red Blood Cell Count to Oxygen Capacity Calculator',
    slug: 'red-blood-cell-count-to-oxygen-capacity-calculator',
    description: 'Assess oxygen-carrying capacity of blood.',
  },
  {
    name: 'Iron Intake Calculator',
    slug: 'protein-intake-calculator',
    description: 'Calculate your daily iron requirements.',
  },
];

const baseUrl = 'https://mycalculating.com/category/health-fitness/mean-corpuscular-volume-mcv-calculator';

const schemaMarkup = {
  '@context': 'https://schema.org',
  '@graph': [
    {
      '@type': 'BreadcrumbList',
      itemListElement: [
        { '@type': 'ListItem', position: 1, name: 'Home', item: 'https://mycalculating.com' },
        { '@type': 'ListItem', position: 2, name: 'Health & Fitness', item: 'https://mycalculating.com/category/health-fitness' },
        { '@type': 'ListItem', position: 3, name: 'Mean Corpuscular Volume (MCV) Calculator', item: baseUrl },
      ],
    },
    {
      '@type': 'SoftwareApplication',
      name: 'Mean Corpuscular Volume (MCV) Calculator',
      applicationCategory: 'Calculator',
      operatingSystem: 'Web Browser',
      description: 'Calculate mean corpuscular volume (MCV) from hematocrit and red blood cell count to assess red blood cell size and classify anemia.',
      url: baseUrl,
      offers: { '@type': 'Offer', price: '0', priceCurrency: 'USD' },
    },
  ],
};

const clamp = (value: number, min: number, max: number) => Math.min(max, Math.max(min, value));

const calculateResult = (values: FormValues): ResultPayload => {
  const hematocrit = values.hematocrit; // %
  const redBloodCellCount = values.redBloodCellCount; // million cells/μL
  
  // Calculate MCV: (Hematocrit / Red Blood Cell Count) × 10
  // Result in fL (femtoliters)
  const mcv = redBloodCellCount > 0 ? (hematocrit / redBloodCellCount) * 10 : 0;
  
  let status: ResultPayload['status'] = 'optimal';
  let interpretation = 'Your MCV is within normal range. Continue maintaining adequate nutrition and overall health.';

  if (mcv < 60) {
    status = 'low';
    interpretation = 'Your MCV indicates severe microcytic anemia (very small red blood cells). This requires immediate medical attention to identify and treat the underlying cause, most commonly severe iron deficiency.';
  } else if (mcv < 80) {
    status = 'moderate';
    interpretation = 'Your MCV indicates microcytic anemia (small red blood cells). This suggests iron deficiency, thalassemia, or other causes requiring medical evaluation and treatment.';
  } else if (mcv > 120) {
    status = 'low';
    interpretation = 'Your MCV indicates severe macrocytic anemia (very large red blood cells). This requires immediate medical attention to identify and treat the underlying cause, such as B12 or folate deficiency.';
  } else if (mcv > 100) {
    status = 'moderate';
    interpretation = 'Your MCV indicates macrocytic anemia (large red blood cells). This suggests vitamin B12 or folate deficiency, liver disease, or other causes requiring medical evaluation.';
  } else if (mcv >= 80 && mcv <= 100) {
    status = 'optimal';
    interpretation = 'Your MCV is within normal range (80-100 fL), indicating normocytic red blood cells. Continue maintaining adequate nutrition and overall health.';
  } else {
    status = 'good';
    interpretation = 'Your MCV is near normal range. Monitor regularly and maintain healthy lifestyle habits to support red blood cell health.';
  }

  const recommendations = [
    'Consult healthcare provider: Abnormal MCV requires medical evaluation. Your healthcare provider can determine the underlying cause and appropriate treatment, which may include iron supplementation, B12/folate supplementation, or treatment of underlying conditions.',
    'Complete blood count interpretation: MCV should be interpreted along with hemoglobin, hematocrit, and other red blood cell indices (MCH, MCHC) for accurate diagnosis.',
    'Address underlying cause: Treatment depends on the cause. Iron deficiency requires iron supplementation, B12/folate deficiency requires vitamin supplementation, and other causes require specific treatments.',
  ];
  
  if (mcv < 80) {
    recommendations.push('Evaluate for iron deficiency: Low MCV most commonly indicates iron deficiency anemia. Consider iron-rich foods, iron supplements if recommended, and evaluation for causes of iron deficiency (dietary, blood loss, malabsorption).');
  }
  
  if (mcv > 100) {
    recommendations.push('Evaluate for B12/folate deficiency: High MCV may indicate vitamin B12 or folate deficiency. Consider B12/folate-rich foods, supplements if recommended, and evaluation for causes of deficiency (dietary, malabsorption, pernicious anemia).');
  }

  const plan = [
    { label: 'This Week', detail: `If MCV is abnormal, schedule an appointment with your healthcare provider for evaluation. Review complete blood count results and discuss symptoms of anemia if present.` },
    { label: 'This Month', detail: 'Follow up with healthcare provider as recommended. Implement dietary changes if advised (iron-rich foods for low MCV, B12/folate-rich foods for high MCV), and take supplements if prescribed.' },
    { label: 'Ongoing', detail: 'Maintain regular monitoring of complete blood count as recommended by your healthcare provider. Continue balanced nutrition, address underlying conditions, and follow treatment plan to maintain normal MCV and red blood cell health.' },
  ];

  return { hematocrit, redBloodCellCount, mcv, status, interpretation, recommendations, plan };
};

export default function MeanCorpuscularVolumeMCVCalculator() {
  const [result, setResult] = useState<ResultPayload | null>(null);

  const form = useForm<FormValues>({
    resolver: zodResolver(formSchema),
    defaultValues: {
      hematocrit: undefined,
      redBloodCellCount: undefined,
    },
  });

  return (
    <div className="space-y-8">
      <Script id="mcv-schema" type="application/ld+json" strategy="afterInteractive" dangerouslySetInnerHTML={{ __html: JSON.stringify(schemaMarkup) }} />

      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <Activity className="h-5 w-5" />
            Mean Corpuscular Volume (MCV) Calculator
          </CardTitle>
          <CardDescription>Calculate mean corpuscular volume (MCV) from hematocrit and red blood cell count to assess red blood cell size and classify anemia.</CardDescription>
        </CardHeader>
      </Card>

      <Card>
        <CardHeader>
          <CardTitle>Input your CBC values</CardTitle>
        </CardHeader>
        <CardContent>
          <Form {...form}>
            <form onSubmit={form.handleSubmit((values) => setResult(calculateResult(values)))} className="space-y-6">
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <FormField
                  control={form.control}
                  name="hematocrit"
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel>Hematocrit (%)</FormLabel>
                      <FormControl>
                        <Input type="number" step="0.1" placeholder="e.g., 45" value={field.value ?? ''} onChange={(e) => field.onChange(e.target.value === '' ? undefined : Number(e.target.value))} />
                      </FormControl>
                      <FormMessage />
                    </FormItem>
                  )}
                />
                <FormField
                  control={form.control}
                  name="redBloodCellCount"
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel>Red Blood Cell Count (million cells/μL)</FormLabel>
                      <FormControl>
                        <Input type="number" step="0.01" placeholder="e.g., 4.5" value={field.value ?? ''} onChange={(e) => field.onChange(e.target.value === '' ? undefined : Number(e.target.value))} />
                      </FormControl>
                      <FormMessage />
                    </FormItem>
                  )}
                />
              </div>
              <Button type="submit" className="w-full md:w-auto">
                Calculate MCV
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
            <CardDescription>See MCV, status, and recommendations.</CardDescription>
          </CardHeader>
          <CardContent className="space-y-6">
            <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
              <div className="p-4 border rounded">
                <p className="text-sm text-muted-foreground">MCV</p>
                <p className="text-2xl font-semibold text-primary">{result.mcv.toFixed(1)} fL</p>
                <p className="text-xs text-muted-foreground">Mean Corpuscular Volume</p>
              </div>
              <div className="p-4 border rounded">
                <p className="text-sm text-muted-foreground">Hematocrit</p>
                <p className="text-2xl font-semibold text-primary">{result.hematocrit.toFixed(1)}%</p>
                <p className="text-xs text-muted-foreground">From CBC results</p>
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
            <strong>MCV (fL)</strong> = (Hematocrit (%) / Red Blood Cell Count (million cells/μL)) × 10
          </p>
          <p>
            MCV measures the average size of red blood cells. It helps classify anemia: microcytic (MCV &lt;80 fL, small cells), normocytic (MCV 80-100 fL, normal size), or macrocytic (MCV &gt;100 fL, large cells).
          </p>
          <p>
            <strong>Reference range:</strong> Normal MCV is 80-100 fL. Low MCV suggests iron deficiency or thalassemia. High MCV suggests B12/folate deficiency or other causes. MCV should be interpreted with hemoglobin and other red blood cell indices for accurate diagnosis.
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
                <p className="text-sm text-muted-foreground">Anemia Classification</p>
                <p className="text-xl font-semibold text-primary">
                  {result.mcv < 80 ? 'Microcytic' : result.mcv > 100 ? 'Macrocytic' : 'Normocytic'}
                </p>
                <p className="text-xs text-muted-foreground">Based on MCV value</p>
              </div>
              <div className="p-4 border rounded">
                <p className="text-sm text-muted-foreground">Red Blood Cell Count</p>
                <p className="text-xl font-semibold text-primary">
                  {result.redBloodCellCount.toFixed(2)} million/μL
                </p>
                <p className="text-xs text-muted-foreground">From CBC results</p>
              </div>
              <div className="p-4 border rounded">
                <p className="text-sm text-muted-foreground">Red Blood Cell Health</p>
                <p className="text-xl font-semibold text-primary">
                  {result.mcv >= 80 && result.mcv <= 100 ? 'Normal' : 'Requires Attention'}
                </p>
                <p className="text-xs text-muted-foreground">Based on calculation</p>
              </div>
            </div>
          ) : (
            <p className="text-sm text-muted-foreground">Enter your CBC values to see additional insights.</p>
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
    <meta itemProp="name" content="The Definitive Guide to Mean Corpuscular Volume (MCV): Understanding Red Blood Cell Size and Anemia Classification" />
    <meta itemProp="description" content="An expert, evidence-based guide on mean corpuscular volume (MCV), detailing red blood cell size, anemia classification, and comprehensive strategies to assess and treat different types of anemia." />
    <meta itemProp="keywords" content="MCV calculator, mean corpuscular volume, microcytic macrocytic anemia, red blood cell size, anemia classification, iron deficiency, B12 deficiency" />
    <meta itemProp="author" content="[Your Site's Health Team]" />
    <meta itemProp="datePublished" content="2025-12-01" />
    <meta itemProp="url" content="/definitive-mcv-guide" />

    <h1 className="text-3xl md:text-4xl font-extrabold text-foreground mb-4" itemProp="headline">The Definitive Guide to Mean Corpuscular Volume (MCV): Understanding Red Blood Cell Size and Anemia Classification</h1>
    <p className="text-lg italic text-gray-700">Explore the science of mean corpuscular volume (MCV), red blood cell size, anemia classification, and comprehensive strategies to assess and treat different types of anemia.</p>

    <h2 className="text-2xl font-bold text-foreground mt-8 mb-4">Table of Contents: Jump to a Section</h2>
    <ul className="list-disc ml-6 space-y-2 text-blue-600">
        <li><a href="#mcv-basics" className="hover:underline">Understanding Mean Corpuscular Volume (MCV)</a></li>
        <li><a href="#anemia-classification" className="hover:underline">Anemia Classification by MCV</a></li>
        <li><a href="#microcytic-anemia" className="hover:underline">Microcytic Anemia (Low MCV)</a></li>
        <li><a href="#macrocytic-anemia" className="hover:underline">Macrocytic Anemia (High MCV)</a></li>
        <li><a href="#prevention" className="hover:underline">Comprehensive Anemia Management Strategies</a></li>
    </ul>
<hr />

    <h2 id="mcv-basics" className="text-2xl font-bold text-foreground pt-8" itemProp="articleSection">Understanding Mean Corpuscular Volume (MCV)</h2>
    <p><b>Mean Corpuscular Volume (MCV)</b> is a red blood cell index that measures the average size of red blood cells. It is calculated from hematocrit and red blood cell count and is expressed in femtoliters (fL). MCV is a key parameter in classifying anemia and guiding diagnosis.</p>

<h3 className="text-xl font-semibold text-foreground mt-6">MCV Reference Ranges</h3>
<div className="overflow-x-auto my-6 p-4 bg-gray-50 border rounded-lg">
    <table className="w-full text-left border-collapse">
        <thead>
            <tr>
                <th className="border-b p-2 font-bold">MCV Value (fL)</th>
                <th className="border-b p-2 font-bold">Classification</th>
                <th className="border-b p-2 font-bold">Interpretation</th>
            </tr>
        </thead>
        <tbody>
            <tr>
                <td className="border-b p-2">&lt;80</td>
                <td className="border-b p-2">Microcytic</td>
                <td className="border-b p-2">Small red blood cells</td>
            </tr>
            <tr>
                <td className="border-b p-2">80-100</td>
                <td className="border-b p-2">Normocytic</td>
                <td className="border-b p-2">Normal-sized red blood cells</td>
            </tr>
            <tr>
                <td className="border-b p-2">&gt;100</td>
                <td className="border-b p-2">Macrocytic</td>
                <td className="border-b p-2">Large red blood cells</td>
            </tr>
        </tbody>
    </table>
</div>

<hr />

    <h2 id="anemia-classification" className="text-2xl font-bold text-foreground pt-8" itemProp="articleSection">Anemia Classification by MCV</h2>
    <p>MCV helps classify anemia into three main categories, each with different causes and treatments.</p>

<h3 className="text-xl font-semibold text-foreground mt-6">Why MCV Classification Matters</h3>
<ul>
    <li><b>Guides Diagnosis:</b> Different MCV values point to different underlying causes</li>
    <li><b>Directs Treatment:</b> Treatment depends on the type of anemia</li>
    <li><b>Monitors Response:</b> MCV changes can indicate treatment effectiveness</li>
    <li><b>Prevents Complications:</b> Early identification allows timely intervention</li>
</ul>

<hr />

    <h2 id="microcytic-anemia" className="text-2xl font-bold text-foreground pt-8" itemProp="articleSection">Microcytic Anemia (Low MCV)</h2>
    <p>Microcytic anemia (MCV &lt;80 fL) is characterized by small red blood cells. The most common cause is <b>iron deficiency anemia</b>.</p>

<h3 className="text-xl font-semibold text-foreground mt-6">Causes of Microcytic Anemia</h3>
<ul>
    <li><b>Iron Deficiency:</b> Most common cause worldwide. Results from inadequate intake, blood loss, or malabsorption.</li>
    <li><b>Thalassemia:</b> Genetic disorder affecting hemoglobin production.</li>
    <li><b>Anemia of Chronic Disease:</b> Associated with chronic inflammation or illness.</li>
    <li><b>Sideroblastic Anemia:</b> Defect in iron utilization within red blood cell precursors.</li>
    <li><b>Lead Poisoning:</b> Can cause microcytic anemia.</li>
</ul>

<h3 className="text-xl font-semibold text-foreground mt-6">Treatment of Microcytic Anemia</h3>
<ul>
    <li>Iron supplementation for iron deficiency</li>
    <li>Address underlying cause (blood loss, malabsorption)</li>
    <li>Iron-rich diet</li>
    <li>Treatment of thalassemia or other specific causes</li>
</ul>

<hr />

    <h2 id="macrocytic-anemia" className="text-2xl font-bold text-foreground pt-8" itemProp="articleSection">Macrocytic Anemia (High MCV)</h2>
    <p>Macrocytic anemia (MCV &gt;100 fL) is characterized by large red blood cells. Common causes include <b>vitamin B12 deficiency</b> and <b>folate deficiency</b>.</p>

<h3 className="text-xl font-semibold text-foreground mt-6">Causes of Macrocytic Anemia</h3>
<ul>
    <li><b>Vitamin B12 Deficiency:</b> Can result from dietary deficiency, pernicious anemia, or malabsorption.</li>
    <li><b>Folate Deficiency:</b> Often due to inadequate dietary intake or increased requirements.</li>
    <li><b>Liver Disease:</b> Can cause macrocytosis.</li>
    <li><b>Hypothyroidism:</b> Associated with macrocytic changes.</li>
    <li><b>Alcohol Use:</b> Can cause macrocytosis.</li>
    <li><b>Medications:</b> Certain medications can cause macrocytosis.</li>
</ul>

<h3 className="text-xl font-semibold text-foreground mt-6">Treatment of Macrocytic Anemia</h3>
<ul>
    <li>B12 or folate supplementation for deficiencies</li>
    <li>Address underlying cause (dietary, malabsorption, pernicious anemia)</li>
    <li>B12/folate-rich diet</li>
    <li>Treatment of liver disease or other specific causes</li>
</ul>

<hr />

    <h2 id="prevention" className="text-2xl font-bold text-foreground pt-8" itemProp="articleSection">Comprehensive Anemia Management Strategies</h2>
    <p>Managing anemia requires identifying the cause, appropriate treatment, and ongoing monitoring.</p>

<h3 className="text-xl font-semibold text-foreground mt-6">Diagnostic Approach</h3>
<ul>
    <li>Complete blood count (CBC) with red blood cell indices</li>
    <li>Iron studies (ferritin, TIBC, transferrin saturation) for microcytic anemia</li>
    <li>B12 and folate levels for macrocytic anemia</li>
    <li>Additional tests based on clinical findings</li>
</ul>

<h3 className="text-xl font-semibold text-foreground mt-6">Nutritional Support</h3>
<ul>
    <li><b>Iron-Rich Foods:</b> Red meat, poultry, fish, beans, leafy greens, fortified cereals</li>
    <li><b>B12-Rich Foods:</b> Animal products, fortified foods</li>
    <li><b>Folate-Rich Foods:</b> Leafy greens, legumes, fortified grains</li>
    <li><b>Vitamin C:</b> Enhances iron absorption</li>
</ul>

<h3 className="text-xl font-semibold text-foreground mt-6">Medical Management</h3>
<ul>
    <li>Supplementation as recommended by healthcare provider</li>
    <li>Treatment of underlying conditions</li>
    <li>Regular monitoring of CBC and red blood cell indices</li>
    <li>Follow-up to ensure treatment response</li>
</ul>

<hr />

    <h2 className="text-2xl font-bold text-foreground pt-8" itemProp="articleSection">Conclusion</h2>
    <p>Mean Corpuscular Volume (MCV) is a valuable tool for classifying anemia and guiding diagnosis and treatment. Understanding MCV values, their significance, and appropriate management strategies is essential for effectively treating anemia and preventing complications. MCV should be interpreted along with hemoglobin, hematocrit, and other red blood cell indices for accurate diagnosis. Regular monitoring, appropriate supplementation, and addressing underlying causes are key to maintaining optimal red blood cell health and preventing anemia-related complications.</p>
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
          <p>This tool calculates mean corpuscular volume (MCV) from hematocrit and red blood cell count to assess red blood cell size and classify anemia.</p>
          <p>Outputs include hematocrit, red blood cell count, MCV, status, recommendations, an action plan, and supporting metrics.</p>
          <p>Formula, steps, guide content, related tools, and FAQs ensure humans or AI assistants can interpret the methodology instantly.</p>
        </CardContent>
      </Card>
    </div>
  );
}



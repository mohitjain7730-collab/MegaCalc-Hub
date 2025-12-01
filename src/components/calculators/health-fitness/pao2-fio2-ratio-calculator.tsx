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
  pao2: z.number({ invalid_type_error: 'Enter PaO2' }).min(10).max(600),
  fio2Percent: z.number({ invalid_type_error: 'Enter FiO2' }).min(21).max(100),
});

type FormValues = z.infer<typeof formSchema>;

type ResultPayload = {
  pao2: number;
  fio2Percent: number;
  pfRatio: number;
  category: 'normal' | 'mild' | 'moderate' | 'severe';
  interpretation: string;
  recommendations: string[];
};

const steps = [
  'Enter arterial oxygen tension (PaO2) in mmHg from an arterial blood gas (ABG) result.',
  'Enter inspired oxygen fraction (FiO2) as a percentage (e.g., 21 for room air, 40 for 40% oxygen).',
  'Review the calculated PaO2/FiO2 (P/F) ratio and severity category.',
  'Use the interpretation and recommendations to contextualize oxygenation status.',
];

const faqs = [
  {
    question: 'What is the PaO2/FiO2 (P/F) ratio?',
    answer:
      'The PaO2/FiO2 ratio is a measure of how well oxygen is transferred from the lungs to the blood. It is calculated by dividing arterial oxygen tension (PaO2 in mmHg) by the fraction of inspired oxygen (FiO2 as a decimal). Lower values indicate impaired oxygenation.',
  },
  {
    question: 'How is FiO2 entered in this calculator?',
    answer:
      'Enter FiO2 as a percentage (for example, 21 for room air, 40 for 40% oxygen via Venturi mask, or 60 for high-flow oxygen). The calculator automatically converts this percentage to a decimal fraction for the calculation.',
  },
  {
    question: 'How is the P/F ratio used in ARDS classification?',
    answer:
      'The Berlin ARDS definition uses the P/F ratio to grade severity: mild ARDS is 200–300, moderate ARDS is 100–200, and severe ARDS is below 100, all with PEEP or CPAP ≥ 5 cm H₂O.',
  },
  {
    question: 'Is this calculator a substitute for clinical judgment?',
    answer:
      'No. The P/F ratio is one part of respiratory assessment. Clinical decisions should always involve a qualified clinician and consider the full clinical picture, ventilator settings, imaging, and comorbidities.',
  },
];

const relatedCalculators = [
  {
    name: 'Oxygen Pulse Efficiency Calculator',
    slug: 'oxygen-pulse-efficiency-calculator',
    description: 'Estimate oxygen delivery efficiency per heartbeat.',
  },
  {
    name: 'Cardiac Output (Q) Calculator',
    slug: 'cardiac-output-q-calculator',
    description: 'Evaluate cardiac output based on stroke volume and heart rate.',
  },
  {
    name: 'Breathing Rate Efficiency Calculator',
    slug: 'breathing-rate-efficiency-calculator',
    description: 'Assess respiratory efficiency from rate, depth, and recovery.',
  },
  {
    name: 'Serum Osmolar Gap Calculator',
    slug: 'serum-osmolar-gap-calculator',
    description: 'Evaluate metabolic disturbances that may accompany critical illness.',
  },
];

const baseUrl = 'https://mycalculating.com/category/health-fitness/pao2-fio2-ratio-calculator';

const schemaMarkup = {
  '@context': 'https://schema.org',
  '@graph': [
    {
      '@type': 'BreadcrumbList',
      itemListElement: [
        { '@type': 'ListItem', position: 1, name: 'Home', item: 'https://mycalculating.com' },
        { '@type': 'ListItem', position: 2, name: 'Health & Fitness', item: 'https://mycalculating.com/category/health-fitness' },
        { '@type': 'ListItem', position: 3, name: 'PaO2/FiO2 Ratio Calculator', item: baseUrl },
      ],
    },
    {
      '@type': 'SoftwareApplication',
      name: 'PaO2/FiO2 Ratio Calculator',
      applicationCategory: 'Calculator',
      operatingSystem: 'Web Browser',
      description:
        'Calculate the PaO2/FiO2 (P/F) ratio from arterial oxygen tension and inspired oxygen fraction to assess oxygenation and ARDS severity.',
      url: baseUrl,
      offers: { '@type': 'Offer', price: '0', priceCurrency: 'USD' },
    },
  ],
};

const calculateResult = (values: FormValues): ResultPayload => {
  const { pao2, fio2Percent } = values;
  const fio2 = fio2Percent / 100;
  const pfRatio = fio2 > 0 ? pao2 / fio2 : 0;

  let category: ResultPayload['category'] = 'normal';
  let interpretation =
    'Oxygenation appears within the normal range. Continue routine monitoring and supportive care as clinically indicated.';

  if (pfRatio < 100) {
    category = 'severe';
    interpretation =
      'Severely impaired oxygenation consistent with severe ARDS. This typically reflects critical respiratory failure and requires urgent specialist management.';
  } else if (pfRatio < 200) {
    category = 'moderate';
    interpretation =
      'Moderately impaired oxygenation consistent with moderate ARDS. Escalated respiratory support and close monitoring are usually required.';
  } else if (pfRatio < 300) {
    category = 'mild';
    interpretation =
      'Mildly impaired oxygenation. This may correspond to mild ARDS or early respiratory compromise depending on the clinical context.';
  } else {
    category = 'normal';
    interpretation =
      'Oxygenation is within the expected range on the current FiO2. Continue monitoring and supportive care.';
  }

  const recommendations: string[] = [
    'Review ventilator or oxygen delivery settings alongside the P/F ratio; interpretation always depends on clinical context.',
    'Correlate with chest imaging, work of breathing, hemodynamic status, and laboratory data.',
    'Reassess the P/F ratio after any major change in FiO2, PEEP, or patient condition.',
  ];

  if (pfRatio < 200) {
    recommendations.push(
      'In moderate or severe impairment, discuss management with critical care or respiratory specialists and consider evidence-based ARDS ventilation strategies.'
    );
  }

  return { pao2, fio2Percent, pfRatio, category, interpretation, recommendations };
};

export default function PaO2FiO2RatioCalculator() {
  const [result, setResult] = useState<ResultPayload | null>(null);

  const form = useForm<FormValues>({
    resolver: zodResolver(formSchema),
    defaultValues: {
      pao2: undefined,
      fio2Percent: undefined,
    },
  });

  return (
    <div className="space-y-8">
      <Script
        id="pao2-fio2-ratio-schema"
        type="application/ld+json"
        strategy="afterInteractive"
        dangerouslySetInnerHTML={{ __html: JSON.stringify(schemaMarkup) }}
      />

      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <Activity className="h-5 w-5" />
            PaO2/FiO2 Ratio Calculator
          </CardTitle>
          <CardDescription>
            Calculate the PaO2/FiO2 (P/F) ratio from arterial oxygen tension and inspired oxygen fraction to assess oxygenation and ARDS
            severity.
          </CardDescription>
        </CardHeader>
      </Card>

      <Card>
        <CardHeader>
          <CardTitle>Input respiratory parameters</CardTitle>
        </CardHeader>
        <CardContent>
          <Form {...form}>
            <form onSubmit={form.handleSubmit((values) => setResult(calculateResult(values)))} className="space-y-6">
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <FormField
                  control={form.control}
                  name="pao2"
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel>PaO2 (mmHg)</FormLabel>
                      <FormControl>
                        <Input
                          type="number"
                          step="1"
                          placeholder="e.g., 80"
                          value={field.value ?? ''}
                          onChange={(e) => field.onChange(e.target.value === '' ? undefined : Number(e.target.value))}
                        />
                      </FormControl>
                      <FormMessage />
                    </FormItem>
                  )}
                />
                <FormField
                  control={form.control}
                  name="fio2Percent"
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel>FiO2 (%)</FormLabel>
                      <FormControl>
                        <Input
                          type="number"
                          step="1"
                          placeholder="e.g., 21 for room air, 40 for 40%"
                          value={field.value ?? ''}
                          onChange={(e) => field.onChange(e.target.value === '' ? undefined : Number(e.target.value))}
                        />
                      </FormControl>
                      <FormMessage />
                    </FormItem>
                  )}
                />
              </div>
              <Button type="submit" className="w-full md:w-auto">
                Calculate P/F ratio
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
              Results
            </CardTitle>
            <CardDescription>Review the calculated P/F ratio and severity classification.</CardDescription>
          </CardHeader>
          <CardContent className="space-y-6">
            <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
              <div className="p-4 border rounded">
                <p className="text-sm text-muted-foreground">PaO2</p>
                <p className="text-2xl font-semibold text-primary">{result.pao2.toFixed(0)} mmHg</p>
              </div>
              <div className="p-4 border rounded">
                <p className="text-sm text-muted-foreground">FiO2</p>
                <p className="text-2xl font-semibold text-primary">{result.fio2Percent.toFixed(0)}%</p>
              </div>
              <div className="p-4 border rounded">
                <p className="text-sm text-muted-foreground">P/F ratio</p>
                <p className="text-2xl font-semibold text-primary">{result.pfRatio.toFixed(0)}</p>
              </div>
              <div className="p-4 border rounded">
                <p className="text-sm text-muted-foreground">Category</p>
                <p className="text-2xl font-semibold text-primary capitalize">{result.category}</p>
              </div>
            </div>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <Card>
                <CardHeader>
                  <CardTitle className="text-base flex items-center gap-2">
                    <Target className="h-4 w-4" />
                    Interpretation
                  </CardTitle>
                </CardHeader>
                <CardContent>
                  <p className="text-sm text-muted-foreground">{result.interpretation}</p>
                </CardContent>
              </Card>
              <Card>
                <CardHeader>
                  <CardTitle className="text-base flex items-center gap-2">
                    <AlertTriangle className="h-4 w-4" />
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
            <strong>FiO2 (fraction)</strong> = FiO2 (%) ÷ 100
          </p>
          <p>
            <strong>P/F ratio</strong> = PaO2 (mmHg) ÷ FiO2 (fraction)
          </p>
          <p>
            Severity bands often used in ARDS classification:
            <br />
            Normal &gt; 300, Mild 200–300, Moderate 100–200, Severe &lt; 100.
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
                <p className="text-sm text-muted-foreground">P/F per 10% FiO2</p>
                <p className="text-xl font-semibold text-primary">
                  {((result.pfRatio * (result.fio2Percent / 10)) / result.fio2Percent).toFixed(0)}
                </p>
                <p className="text-xs text-muted-foreground">Approximate scaling for FiO2 changes</p>
              </div>
              <div className="p-4 border rounded">
                <p className="text-sm text-muted-foreground">Relative to 300</p>
                <p className="text-xl font-semibold text-primary">
                  {(result.pfRatio / 300 * 100).toFixed(0)}%
                </p>
                <p className="text-xs text-muted-foreground">Of normal ARDS threshold</p>
              </div>
              <div className="p-4 border rounded">
                <p className="text-sm text-muted-foreground">Room-air equivalent</p>
                <p className="text-xl font-semibold text-primary">
                  {(result.pfRatio * 0.21).toFixed(0)} mmHg
                </p>
                <p className="text-xs text-muted-foreground">Approximate PaO2 if FiO2 were 21%</p>
              </div>
            </div>
          ) : (
            <p className="text-sm text-muted-foreground">Enter PaO2 and FiO2 to see additional insights.</p>
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

      <section
        className="space-y-6 text-muted-foreground leading-relaxed bg-white p-6 md:p-10 rounded-lg shadow-lg"
        itemType="https://schema.org/MedicalWebPage"
      >
        <meta
          itemProp="name"
          content="PaO2/FiO2 Ratio (P/F Ratio) Guide: Understanding Oxygenation and ARDS Severity"
        />
        <meta
          itemProp="description"
          content="An evidence-based guide to the PaO2/FiO2 (P/F) ratio, explaining how it is calculated, how it relates to oxygenation, and how it is used in ARDS severity assessment and critical care."
        />
        <meta
          itemProp="keywords"
          content="pao2 fio2 ratio calculator, PF ratio, ARDS severity, oxygenation index, mechanical ventilation, critical care, respiratory failure"
        />
        <meta itemProp="author" content="[Your Site's Health Team]" />
        <meta itemProp="datePublished" content="2025-12-01" />
        <meta itemProp="url" content="/pao2-fio2-ratio-guide" />

        <h1
          className="text-3xl md:text-4xl font-extrabold text-foreground mb-4"
          itemProp="headline"
        >
          PaO2/FiO2 Ratio (P/F Ratio) Guide: Interpreting Oxygenation and ARDS Severity
        </h1>
        <p className="text-lg italic text-gray-700">
          Learn how the PaO2/FiO2 ratio is calculated, what typical thresholds mean, and how clinicians use it to
          assess respiratory failure and acute respiratory distress syndrome (ARDS).
        </p>

        <h2 className="text-2xl font-bold text-foreground mt-8 mb-4">
          Table of Contents: Jump to a Section
        </h2>
        <ul className="list-disc ml-6 space-y-2 text-blue-600">
          <li>
            <a href="#pf-basics" className="hover:underline">
              What Is the PaO2/FiO2 (P/F) Ratio?
            </a>
          </li>
          <li>
            <a href="#pf-calculation" className="hover:underline">
              How to Calculate the P/F Ratio
            </a>
          </li>
          <li>
            <a href="#pf-ards" className="hover:underline">
              P/F Ratio and ARDS Severity Classification
            </a>
          </li>
          <li>
            <a href="#pf-limitations" className="hover:underline">
              Limitations and Factors That Affect the P/F Ratio
            </a>
          </li>
        </ul>
        <hr />

        <h2
          id="pf-basics"
          className="text-2xl font-bold text-foreground pt-8"
          itemProp="articleSection"
        >
          What Is the PaO2/FiO2 (P/F) Ratio?
        </h2>
        <p>
          The PaO2/FiO2 ratio, often abbreviated as the P/F ratio, is a simple index that compares the amount of
          oxygen in arterial blood (PaO2) to the fraction of oxygen being delivered (FiO2). It gives a quick picture
          of how efficiently the lungs are transferring oxygen from the air into the bloodstream. A high P/F ratio
          suggests good oxygenation, while a low ratio indicates impaired gas exchange.
        </p>

        <h3 className="text-xl font-semibold text-foreground mt-6">
          Components of the P/F Ratio
        </h3>
        <ul className="list-disc ml-6 space-y-1">
          <li>
            <strong>PaO2:</strong> Arterial oxygen tension, measured in mmHg from an arterial blood gas (ABG).
          </li>
          <li>
            <strong>FiO2:</strong> Fraction of inspired oxygen, typically expressed as a percentage (21% for room air,
            40% for 40% oxygen) but converted to a decimal for calculations.
          </li>
        </ul>

        <h2
          id="pf-calculation"
          className="text-2xl font-bold text-foreground pt-8"
          itemProp="articleSection"
        >
          How to Calculate the PaO2/FiO2 Ratio
        </h2>
        <p>
          To calculate the P/F ratio, convert the FiO2 percentage to a fraction by dividing by 100, then divide PaO2 by
          this fraction. For example, if PaO2 is 80 mmHg and FiO2 is 40% (0.40), the P/F ratio is 80 ÷ 0.40 = 200.
        </p>
        <div className="overflow-x-auto my-6 p-4 bg-gray-50 border rounded-lg">
          <table className="w-full text-left border-collapse">
            <thead>
              <tr>
                <th className="border-b p-2 font-bold">PaO2 (mmHg)</th>
                <th className="border-b p-2 font-bold">FiO2 (%)</th>
                <th className="border-b p-2 font-bold">FiO2 (fraction)</th>
                <th className="border-b p-2 font-bold">P/F Ratio</th>
              </tr>
            </thead>
            <tbody>
              <tr>
                <td className="border-b p-2">80</td>
                <td className="border-b p-2">21</td>
                <td className="border-b p-2">0.21</td>
                <td className="border-b p-2">381</td>
              </tr>
              <tr>
                <td className="border-b p-2">80</td>
                <td className="border-b p-2">40</td>
                <td className="border-b p-2">0.40</td>
                <td className="border-b p-2">200</td>
              </tr>
              <tr>
                <td className="border-b p-2">60</td>
                <td className="border-b p-2">60</td>
                <td className="border-b p-2">0.60</td>
                <td className="border-b p-2">100</td>
              </tr>
            </tbody>
          </table>
        </div>

        <h2
          id="pf-ards"
          className="text-2xl font-bold text-foreground pt-8"
          itemProp="articleSection"
        >
          P/F Ratio and ARDS Severity Classification
        </h2>
        <p>
          The Berlin definition of acute respiratory distress syndrome (ARDS) uses the P/F ratio, measured with
          positive end-expiratory pressure (PEEP) or CPAP ≥ 5 cm H₂O, to grade severity. While the full ARDS
          definition also requires timing, imaging, and origin of edema criteria, the P/F ratio is a core numerical
          component.
        </p>
        <div className="overflow-x-auto my-6 p-4 bg-gray-50 border rounded-lg">
          <table className="w-full text-left border-collapse">
            <thead>
              <tr>
                <th className="border-b p-2 font-bold">P/F Ratio</th>
                <th className="border-b p-2 font-bold">Severity</th>
                <th className="border-b p-2 font-bold">Typical Interpretation</th>
              </tr>
            </thead>
            <tbody>
              <tr>
                <td className="border-b p-2">&gt; 300</td>
                <td className="border-b p-2">Normal / No ARDS</td>
                <td className="border-b p-2">Oxygenation usually adequate on given FiO2.</td>
              </tr>
              <tr>
                <td className="border-b p-2">200–300</td>
                <td className="border-b p-2">Mild ARDS</td>
                <td className="border-b p-2">Mild gas exchange impairment; close monitoring is important.</td>
              </tr>
              <tr>
                <td className="border-b p-2">100–200</td>
                <td className="border-b p-2">Moderate ARDS</td>
                <td className="border-b p-2">Significant impairment; often requires advanced ventilatory support.</td>
              </tr>
              <tr>
                <td className="border-b p-2">&lt; 100</td>
                <td className="border-b p-2">Severe ARDS</td>
                <td className="border-b p-2">Severe hypoxemia with high mortality risk.</td>
              </tr>
            </tbody>
          </table>
        </div>

        <h2
          id="pf-limitations"
          className="text-2xl font-bold text-foreground pt-8"
          itemProp="articleSection"
        >
          Limitations and Factors That Affect the P/F Ratio
        </h2>
        <p>
          Although widely used, the P/F ratio has important limitations. It does not directly account for mean airway
          pressure, PEEP level, or ventilation-perfusion mismatch, and can change quickly with small adjustments in
          FiO2 or ventilator settings. It is best interpreted alongside other indices and the overall clinical picture.
        </p>
        <ul className="list-disc ml-6 space-y-1">
          <li>Changes in PEEP or recruitment can alter PaO2 without changing underlying lung injury immediately.</li>
          <li>High FiO2 can partially mask poor oxygenation and inflate the P/F ratio.</li>
          <li>Hemodynamic instability, shunt, and diffusion defects also influence PaO2.</li>
        </ul>
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
          <p>This tool calculates the PaO2/FiO2 (P/F) ratio from PaO2 and FiO2 percentage.</p>
          <p>Outputs include the P/F ratio, severity category, interpretation, and practical recommendations for contextual use.</p>
          <p>Formula, steps, guide content, related tools, and FAQs mirror the structure of other advanced health calculators for easy interpretation.</p>
        </CardContent>
      </Card>
    </div>
  );
}



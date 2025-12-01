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
  fio2Percent: z.number({ invalid_type_error: 'Enter FiO2' }).min(21).max(100),
  pao2: z.number({ invalid_type_error: 'Enter PaO2' }).min(10).max(600),
  paco2: z.number({ invalid_type_error: 'Enter PaCO2' }).min(10).max(120),
  barometricPressure: z.number({ invalid_type_error: 'Enter barometric pressure' }).min(500).max(800),
  respiratoryQuotient: z.number({ invalid_type_error: 'Enter respiratory quotient' }).min(0.5).max(1.0),
});

type FormValues = z.infer<typeof formSchema>;

type ResultPayload = {
  fio2Percent: number;
  pao2: number;
  paco2: number;
  barometricPressure: number;
  respiratoryQuotient: number;
  alveolarO2: number;
  gradient: number;
  category: 'normal' | 'elevated';
  interpretation: string;
  recommendations: string[];
};

const steps = [
  'Enter the fraction of inspired oxygen (FiO2) as a percentage.',
  'Enter arterial oxygen tension (PaO2) and carbon dioxide tension (PaCO2) from an arterial blood gas.',
  'Confirm barometric pressure and respiratory quotient (default R ≈ 0.8 at sea level).',
  'Review the calculated alveolar oxygen (PAO2), A–a gradient, and interpretation.',
];

const faqs = [
  {
    question: 'What is the alveolar–arterial (A–a) oxygen gradient?',
    answer:
      'The A–a gradient compares the oxygen content in the alveoli (PAO2) and arterial blood (PaO2). It reflects how effectively oxygen is transferred across the alveolar–capillary membrane. A widened gradient suggests impaired gas exchange.',
  },
  {
    question: 'What formula is used to estimate alveolar oxygen (PAO2)?',
    answer:
      'This calculator uses the alveolar gas equation: PAO2 = FiO2 × (PB − 47) − PaCO2 / R, where PB is barometric pressure and R is the respiratory quotient.',
  },
  {
    question: 'What is a normal A–a gradient?',
    answer:
      'A rough estimate for a normal A–a gradient is less than (age/4 + 4). Normal ranges depend on age, FiO2, and altitude, but values significantly above expected suggest diffusion impairment, V/Q mismatch, or shunt.',
  },
  {
    question: 'Is this tool suitable for diagnosis?',
    answer:
      'No. It is an educational tool. Clinical decisions must be made by qualified clinicians using the full clinical context, imaging, and other diagnostics.',
  },
];

const relatedCalculators = [
  {
    name: 'PaO2/FiO2 Ratio Calculator',
    slug: 'pao2-fio2-ratio-calculator',
    description: 'Assess global oxygenation efficiency using the P/F ratio.',
  },
  {
    name: 'Respiratory Quotient (RQ) Calculator',
    slug: 'respiratory-quotient-calculator',
    description: 'Estimate respiratory quotient from gas exchange or substrate use.',
  },
  {
    name: 'Breathing Rate Efficiency Calculator',
    slug: 'breathing-rate-efficiency-calculator',
    description: 'Evaluate breathing rate patterns and efficiency.',
  },
  {
    name: 'Cardiac Output (Q) Calculator',
    slug: 'cardiac-output-q-calculator',
    description: 'Relate oxygenation measures to cardiac output and perfusion.',
  },
];

const baseUrl =
  'https://mycalculating.com/category/health-fitness/alveolar-oxygen-gradient-calculator';

const schemaMarkup = {
  '@context': 'https://schema.org',
  '@graph': [
    {
      '@type': 'BreadcrumbList',
      itemListElement: [
        { '@type': 'ListItem', position: 1, name: 'Home', item: 'https://mycalculating.com' },
        {
          '@type': 'ListItem',
          position: 2,
          name: 'Health & Fitness',
          item: 'https://mycalculating.com/category/health-fitness',
        },
        {
          '@type': 'ListItem',
          position: 3,
          name: 'Alveolar Oxygen Gradient Calculator',
          item: baseUrl,
        },
      ],
    },
    {
      '@type': 'SoftwareApplication',
      name: 'Alveolar Oxygen Gradient Calculator',
      applicationCategory: 'Calculator',
      operatingSystem: 'Web Browser',
      description:
        'Calculate alveolar oxygen (PAO2) and the alveolar–arterial (A–a) oxygen gradient using the alveolar gas equation.',
      url: baseUrl,
      offers: { '@type': 'Offer', price: '0', priceCurrency: 'USD' },
    },
  ],
};

const calculateResult = (values: FormValues): ResultPayload => {
  const { fio2Percent, pao2, paco2, barometricPressure, respiratoryQuotient } = values;
  const fio2 = fio2Percent / 100;
  const alveolarO2 = fio2 * (barometricPressure - 47) - paco2 / respiratoryQuotient;
  const gradient = alveolarO2 - pao2;

  let category: ResultPayload['category'] = 'normal';
  let interpretation =
    'The A–a gradient is within a range that may be compatible with normal age-adjusted oxygen transfer. Always interpret in clinical context.';

  if (gradient > 20) {
    category = 'elevated';
    interpretation =
      'The A–a gradient appears widened, suggesting possible V/Q mismatch, diffusion impairment, or shunt physiology. Correlate with imaging and clinical status.';
  }

  const recommendations: string[] = [
    'Compare the gradient against age-adjusted expectations (roughly age/4 + 4 at sea level).',
    'Interpret alongside P/F ratio, imaging findings, and clinical presentation.',
  ];

  if (gradient > 20) {
    recommendations.push(
      'If the gradient is significantly elevated, consider evaluation for pneumonia, pulmonary embolism, interstitial lung disease, or other causes of impaired gas exchange.',
    );
  }

  return {
    fio2Percent,
    pao2,
    paco2,
    barometricPressure,
    respiratoryQuotient,
    alveolarO2,
    gradient,
    category,
    interpretation,
    recommendations,
  };
};

export default function AlveolarOxygenGradientCalculator() {
  const [result, setResult] = useState<ResultPayload | null>(null);

  const form = useForm<FormValues>({
    resolver: zodResolver(formSchema),
    defaultValues: {
      fio2Percent: undefined,
      pao2: undefined,
      paco2: undefined,
      barometricPressure: undefined,
      respiratoryQuotient: undefined,
    },
  });

  return (
    <div className="space-y-8">
      <Script
        id="alveolar-oxygen-gradient-schema"
        type="application/ld+json"
        strategy="afterInteractive"
        dangerouslySetInnerHTML={{ __html: JSON.stringify(schemaMarkup) }}
      />

      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <Activity className="h-5 w-5" />
            Alveolar Oxygen Gradient Calculator
          </CardTitle>
          <CardDescription>
            Calculate alveolar oxygen (PAO2) and the alveolar–arterial (A–a) oxygen gradient using the alveolar gas
            equation.
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
              <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
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
                          placeholder="e.g., 21"
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
                  name="paco2"
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel>PaCO2 (mmHg)</FormLabel>
                      <FormControl>
                        <Input
                          type="number"
                          step="1"
                          placeholder="e.g., 40"
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
                  name="barometricPressure"
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel>Barometric pressure (mmHg)</FormLabel>
                      <FormControl>
                        <Input
                          type="number"
                          step="1"
                          placeholder="e.g., 760"
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
                  name="respiratoryQuotient"
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel>Respiratory quotient (R)</FormLabel>
                      <FormControl>
                        <Input
                          type="number"
                          step="0.05"
                          placeholder="e.g., 0.8"
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
                Calculate A–a gradient
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
            <CardDescription>Review alveolar oxygen, A–a gradient, and interpretation.</CardDescription>
          </CardHeader>
          <CardContent className="space-y-6">
            <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
              <div className="p-4 border rounded">
                <p className="text-sm text-muted-foreground">FiO2</p>
                <p className="text-2xl font-semibold text-primary">{result.fio2Percent.toFixed(0)}%</p>
              </div>
              <div className="p-4 border rounded">
                <p className="text-sm text-muted-foreground">Alveolar oxygen (PAO2)</p>
                <p className="text-2xl font-semibold text-primary">{result.alveolarO2.toFixed(0)} mmHg</p>
              </div>
              <div className="p-4 border rounded">
                <p className="text-sm text-muted-foreground">A–a gradient</p>
                <p className="text-2xl font-semibold text-primary">{result.gradient.toFixed(0)} mmHg</p>
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
            <strong>Alveolar gas equation:</strong> PAO2 = FiO2 × (PB − 47) − PaCO2 / R
          </p>
          <p>
            <strong>A–a gradient:</strong> A–a = PAO2 − PaO2
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
                <p className="text-sm text-muted-foreground">Expected PAO2 on room air</p>
                <p className="text-xl font-semibold text-primary">
                  {(0.21 * (result.barometricPressure - 47) - result.paco2 / result.respiratoryQuotient).toFixed(0)} mmHg
                </p>
              </div>
              <div className="p-4 border rounded">
                <p className="text-sm text-muted-foreground">Ratio PaO2/PAO2</p>
                <p className="text-xl font-semibold text-primary">
                  {(result.pao2 / result.alveolarO2 * 100).toFixed(0)}%
                </p>
              </div>
              <div className="p-4 border rounded">
                <p className="text-sm text-muted-foreground">Gradient relative to 20 mmHg</p>
                <p className="text-xl font-semibold text-primary">
                  {(result.gradient / 20 * 100).toFixed(0)}%
                </p>
              </div>
            </div>
          ) : (
            <p className="text-sm text-muted-foreground">
              Enter respiratory parameters to see additional A–a gradient insights.
            </p>
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
          content="Alveolar–Arterial (A–a) Oxygen Gradient: Guide to the Alveolar Gas Equation"
        />
        <meta
          itemProp="description"
          content="Understand how to calculate alveolar oxygen (PAO2) and the alveolar–arterial (A–a) oxygen gradient, and how to interpret these values in respiratory physiology and critical care."
        />
        <meta
          itemProp="keywords"
          content="alveolar gas equation, A–a gradient calculator, PAO2, PaO2, oxygenation, respiratory physiology, V/Q mismatch, shunt"
        />
        <meta itemProp="author" content="[Your Site's Health Team]" />
        <meta itemProp="datePublished" content="2025-12-01" />
        <meta itemProp="url" content="/alveolar-oxygen-gradient-guide" />

        <h1
          className="text-3xl md:text-4xl font-extrabold text-foreground mb-4"
          itemProp="headline"
        >
          Alveolar–Arterial (A–a) Oxygen Gradient: Using the Alveolar Gas Equation
        </h1>
        <p className="text-lg italic text-gray-700">
          Learn how the alveolar gas equation relates inspired oxygen, barometric pressure, and carbon dioxide to
          alveolar oxygen, and how the A–a gradient helps distinguish causes of hypoxemia.
        </p>

        <h2 className="text-2xl font-bold text-foreground mt-8 mb-4">
          Table of Contents: Jump to a Section
        </h2>
        <ul className="list-disc ml-6 space-y-2 text-blue-600">
          <li>
            <a href="#aa-basics" className="hover:underline">
              What Is the A–a Oxygen Gradient?
            </a>
          </li>
          <li>
            <a href="#alveolar-gas-equation" className="hover:underline">
              The Alveolar Gas Equation Explained
            </a>
          </li>
          <li>
            <a href="#aa-interpretation" className="hover:underline">
              Interpreting a High vs Normal A–a Gradient
            </a>
          </li>
          <li>
            <a href="#aa-limitations" className="hover:underline">
              Limitations and Practical Considerations
            </a>
          </li>
        </ul>
        <hr />

        <h2
          id="aa-basics"
          className="text-2xl font-bold text-foreground pt-8"
          itemProp="articleSection"
        >
          What Is the A–a Oxygen Gradient?
        </h2>
        <p>
          The A–a oxygen gradient quantifies the difference between alveolar oxygen (PAO2) and arterial oxygen (PaO2).
          Because some drop in oxygen tension occurs as blood moves from the alveoli into systemic circulation, a small
          gradient is expected. A larger-than-expected gradient indicates that oxygen is not moving efficiently across
          the alveolar–capillary interface.
        </p>

        <h2
          id="alveolar-gas-equation"
          className="text-2xl font-bold text-foreground pt-8"
          itemProp="articleSection"
        >
          The Alveolar Gas Equation Explained
        </h2>
        <p>
          The alveolar gas equation estimates the partial pressure of oxygen in the alveoli by accounting for inspired
          oxygen, barometric pressure, water vapor, and the effect of carbon dioxide. At sea level with room air and a
          normal respiratory quotient (R ≈ 0.8), PAO2 is typically around 100 mmHg.
        </p>

        <h2
          id="aa-interpretation"
          className="text-2xl font-bold text-foreground pt-8"
          itemProp="articleSection"
        >
          Interpreting a High vs Normal A–a Gradient
        </h2>
        <p>
          A normal A–a gradient with low PaO2 suggests global hypoventilation or low inspired oxygen (for example,
          high altitude). A widened A–a gradient indicates problems at the level of the lungs, such as pneumonia,
          pulmonary embolism, or interstitial lung disease, where ventilation and perfusion are mismatched or diffusion
          is impaired.
        </p>

        <h2
          id="aa-limitations"
          className="text-2xl font-bold text-foreground pt-8"
          itemProp="articleSection"
        >
          Limitations and Practical Considerations
        </h2>
        <p>
          The A–a gradient should be interpreted in the context of patient age, FiO2, altitude, and hemodynamic
          status. Small errors in measurement, assumptions about R, or rapid changes in FiO2 can influence calculated
          values. As with any single index, it should not be used in isolation for diagnosis or management decisions.
        </p>
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
          <p>This tool calculates alveolar oxygen and the A–a oxygen gradient using the alveolar gas equation.</p>
          <p>Outputs include PAO2, A–a gradient, category, interpretation, and practical recommendations.</p>
          <p>Formula, steps, guide content, related tools, and FAQs follow the same rich structure as other advanced respiratory calculators.</p>
        </CardContent>
      </Card>
    </div>
  );
}




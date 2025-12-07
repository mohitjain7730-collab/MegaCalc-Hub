'use client';

import { useState } from 'react';
import Script from 'next/script';
import Link from 'next/link';
import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import { z } from 'zod';
import { Heart, Zap, Target, Activity, Shield } from 'lucide-react';

import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Form, FormControl, FormField, FormItem, FormLabel, FormMessage } from '@/components/ui/form';
import { Input } from '@/components/ui/input';

const formSchema = z.object({
  numberOfClaims: z.number({ invalid_type_error: 'Enter number of claims' }).min(0),
  numberOfExposures: z.number({ invalid_type_error: 'Enter number of exposures' }).min(1),
  totalLosses: z.number({ invalid_type_error: 'Enter total losses' }).min(0),
});

type FormValues = z.infer<typeof formSchema>;

type ResultPayload = {
  numberOfClaims: number;
  numberOfExposures: number;
  totalLosses: number;
  lossFrequency: number;
  lossSeverity: number;
  expectedLoss: number;
  status: 'optimal' | 'good' | 'moderate' | 'low';
  interpretation: string;
  recommendations: string[];
  plan: { label: string; detail: string }[];
};

const steps = [
  'Enter number of claims observed over the period.',
  'Enter number of exposures (insured units or policies).',
  'Enter total losses (sum of all claim amounts).',
  'Review loss frequency, loss severity, expected loss, and recommendations.',
];

const faqs = [
  {
    question: 'What is loss frequency?',
    answer:
      'Loss frequency is the number of claims expected per exposure unit. It is calculated as Number of Claims / Number of Exposures. Higher frequency indicates more frequent claims occurrence.',
  },
  {
    question: 'What is loss severity?',
    answer:
      'Loss severity is the average cost per claim. It is calculated as Total Losses / Number of Claims. Higher severity indicates larger average claim amounts.',
  },
  {
    question: 'What is expected loss?',
    answer:
      'Expected loss is the expected cost per exposure unit, calculated as Loss Frequency × Loss Severity. It represents the average loss cost that should be covered by premiums.',
  },
  {
    question: 'How are these metrics used in insurance?',
    answer:
      'Loss frequency and severity are fundamental metrics for pricing insurance, setting premiums, evaluating underwriting performance, and assessing risk. Expected loss helps determine premium adequacy.',
  },
  {
    question: 'What is a good loss frequency?',
    answer:
      'Loss frequency varies by line of business and risk characteristics. Lower frequency generally indicates better underwriting, but acceptable levels depend on the specific insurance product and market conditions.',
  },
  {
    question: 'What is a good loss severity?',
    answer:
      'Loss severity depends on the type of coverage and claims. Lower severity indicates smaller average claims, which is generally favorable. However, acceptable levels vary significantly by insurance line.',
  },
  {
    question: 'How does expected loss relate to premiums?',
    answer:
      'Premiums should exceed expected loss to cover expenses, profit, and provide a safety margin. Premium adequacy is assessed by comparing premiums to expected loss plus expenses and desired profit margin.',
  },
  {
    question: 'What are limitations of these calculations?',
    answer:
      'These calculations use historical data and assume stability. Real-world losses may vary due to trends, seasonality, catastrophic events, and changes in exposure or risk characteristics. Use as part of comprehensive analysis.',
  },
  {
    question: 'How can I reduce loss frequency?',
    answer:
      'Reduce loss frequency through: better risk selection and underwriting, loss prevention programs, safety training, risk management controls, and avoiding high-risk exposures.',
  },
  {
    question: 'How can I reduce loss severity?',
    answer:
      'Reduce loss severity through: effective claims management, fraud detection, subrogation, deductibles, policy limits, and risk mitigation measures that reduce claim amounts.',
  },
];

const relatedCalculators = [
  {
    name: 'Expected Loss (Insurance Risk) Calculator',
    slug: 'expected-loss-insurance-risk-calculator',
    description: 'Calculate expected loss from insurance risk based on probability and severity.',
  },
  {
    name: 'Loss Ratio Calculator',
    slug: 'loss-ratio-calculator',
    description: 'Calculate insurance loss ratio to evaluate underwriting performance.',
  },
  {
    name: 'Probability of Claim Impact Calculator',
    slug: 'probability-of-claim-impact-calculator',
    description: 'Calculate probability of claim impact using single loss expectancy and annual loss expectancy.',
  },
  {
    name: 'Insurance Reserve Requirement Calculator',
    slug: 'insurance-reserve-requirement-calculator',
    description: 'Calculate insurance reserve requirements for financial stability.',
  },
];

const baseUrl = 'https://mycalculating.com/category/finance/expected-loss-frequency-severity-calculator';

const schemaMarkup = {
  '@context': 'https://schema.org',
  '@graph': [
    {
      '@type': 'BreadcrumbList',
      itemListElement: [
        { '@type': 'ListItem', position: 1, name: 'Home', item: 'https://mycalculating.com' },
        { '@type': 'ListItem', position: 2, name: 'Finance', item: 'https://mycalculating.com/category/finance' },
        { '@type': 'ListItem', position: 3, name: 'Expected Loss Frequency/Severity Calculator', item: baseUrl },
      ],
    },
    {
      '@type': 'SoftwareApplication',
      name: 'Expected Loss Frequency/Severity Calculator',
      applicationCategory: 'Calculator',
      operatingSystem: 'Web Browser',
      description: 'Calculate loss frequency, loss severity, and expected loss based on number of claims, exposures, and total losses.',
      url: baseUrl,
      offers: { '@type': 'Offer', price: '0', priceCurrency: 'USD' },
    },
  ],
};

const calculateResult = (values: FormValues): ResultPayload => {
  const numberOfClaims = values.numberOfClaims;
  const numberOfExposures = values.numberOfExposures;
  const totalLosses = values.totalLosses;

  // Calculate loss frequency (claims per exposure)
  const lossFrequency = numberOfExposures > 0 ? numberOfClaims / numberOfExposures : 0;

  // Calculate loss severity (average cost per claim)
  const lossSeverity = numberOfClaims > 0 ? totalLosses / numberOfClaims : 0;

  // Calculate expected loss (expected cost per exposure)
  const expectedLoss = lossFrequency * lossSeverity;

  let status: ResultPayload['status'] = 'optimal';
  let interpretation = 'Loss frequency, severity, and expected loss calculated. These metrics help assess underwriting performance and premium adequacy.';

  if (lossFrequency > 0.5 || lossSeverity > 10000 || expectedLoss > 5000) {
    status = 'low';
    interpretation = 'High loss frequency, severity, or expected loss indicates elevated risk. Review underwriting practices, risk selection, and premium adequacy. Consider increasing premiums or reducing risk exposure.';
  } else if (lossFrequency > 0.2 || lossSeverity > 5000 || expectedLoss > 2000) {
    status = 'moderate';
    interpretation = 'Moderate loss frequency, severity, or expected loss indicates manageable risk. Monitor trends, maintain underwriting discipline, and ensure premiums adequately cover expected losses plus expenses.';
  } else if (lossFrequency > 0.1 || lossSeverity > 2000 || expectedLoss > 1000) {
    status = 'good';
    interpretation = 'Acceptable loss frequency, severity, and expected loss. Continue maintaining underwriting discipline, effective claims management, and premium adequacy to sustain favorable performance.';
  } else {
    status = 'optimal';
    interpretation = 'Low loss frequency, severity, and expected loss indicate strong underwriting performance. Continue maintaining effective risk selection, claims management, and premium adequacy.';
  }

  const recommendations = [
    `Loss frequency: ${lossFrequency.toFixed(4)} claims per exposure. This represents how often claims occur relative to the number of insured units.`,
    `Loss severity: $${lossSeverity.toLocaleString(undefined, { maximumFractionDigits: 2 })} per claim. This represents the average cost per claim.`,
    `Expected loss: $${expectedLoss.toLocaleString(undefined, { maximumFractionDigits: 2 })} per exposure. This is the expected cost that should be covered by premiums (premiums should exceed this to cover expenses and profit).`,
  ];
  if (expectedLoss > 2000) {
    recommendations.push('High expected loss requires premium rates that adequately cover expected losses plus expenses and profit margin. Review pricing to ensure premium adequacy and financial viability.');
  } else if (expectedLoss > 1000) {
    recommendations.push('Moderate expected loss should be monitored. Ensure premiums exceed expected loss to cover expenses, profit, and provide safety margin. Review pricing regularly.');
  } else {
    recommendations.push('Low expected loss indicates favorable risk profile. Maintain underwriting discipline and premium adequacy to sustain favorable performance and profitability.');
  }
  if (lossFrequency > 0.3) {
    recommendations.push('High loss frequency suggests frequent claims. Review underwriting practices, risk selection criteria, and loss prevention programs to reduce claim frequency.');
  }
  if (lossSeverity > 5000) {
    recommendations.push('High loss severity suggests large average claims. Implement effective claims management, fraud detection, and risk mitigation to reduce claim severity.');
  }

  const plan = [
    { label: 'This Week', detail: `Review loss frequency: ${lossFrequency.toFixed(4)}, severity: $${lossSeverity.toLocaleString(undefined, { maximumFractionDigits: 2 })}, and expected loss: $${expectedLoss.toLocaleString(undefined, { maximumFractionDigits: 2 })} per exposure. Assess premium adequacy relative to expected loss.` },
    { label: 'This Month', detail: 'If metrics indicate elevated risk, take action: review underwriting practices, improve risk selection, enhance claims management, adjust premium rates, or reduce risk exposure to improve performance.' },
    { label: 'Ongoing', detail: 'Continuously monitor loss frequency, severity, and expected loss trends. Maintain underwriting discipline, effective claims management, and premium adequacy to ensure favorable performance and profitability.' },
  ];

  return {
    numberOfClaims,
    numberOfExposures,
    totalLosses,
    lossFrequency,
    lossSeverity,
    expectedLoss,
    status,
    interpretation,
    recommendations,
    plan,
  };
};

export default function ExpectedLossFrequencySeverityCalculator() {
  const [result, setResult] = useState<ResultPayload | null>(null);

  const form = useForm<FormValues>({
    resolver: zodResolver(formSchema),
    defaultValues: {
      numberOfClaims: undefined,
      numberOfExposures: undefined,
      totalLosses: undefined,
    },
  });

  return (
    <div className="space-y-8">
      <Script id="expected-loss-frequency-severity-schema" type="application/ld+json" strategy="afterInteractive" dangerouslySetInnerHTML={{ __html: JSON.stringify(schemaMarkup) }} />

      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <Heart className="h-5 w-5" />
            Expected Loss Frequency/Severity Calculator
          </CardTitle>
          <CardDescription>Calculate loss frequency, loss severity, and expected loss based on number of claims, exposures, and total losses.</CardDescription>
        </CardHeader>
      </Card>

      <Card>
        <CardHeader>
          <CardTitle>Input your information</CardTitle>
        </CardHeader>
        <CardContent>
          <Form {...form}>
            <form onSubmit={form.handleSubmit((values) => {
              try {
                setResult(calculateResult(values));
              } catch (error) {
                console.error('Error calculating result:', error);
                alert('An error occurred while calculating. Please check the console for details.');
              }
            }, (errors) => {
              console.log('Form validation errors:', errors);
            })} className="space-y-6">
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <FormField
                  control={form.control}
                  name="numberOfClaims"
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel>Number of Claims</FormLabel>
                      <FormControl>
                        <Input type="number" step="1" placeholder="e.g., 100" value={field.value ?? ''} onChange={(e) => field.onChange(e.target.value === '' ? undefined : Number(e.target.value))} />
                      </FormControl>
                      <FormMessage />
                    </FormItem>
                  )}
                />
                <FormField
                  control={form.control}
                  name="numberOfExposures"
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel>Number of Exposures</FormLabel>
                      <FormControl>
                        <Input type="number" step="1" placeholder="e.g., 1000" value={field.value ?? ''} onChange={(e) => field.onChange(e.target.value === '' ? undefined : Number(e.target.value))} />
                      </FormControl>
                      <FormMessage />
                    </FormItem>
                  )}
                />
                <FormField
                  control={form.control}
                  name="totalLosses"
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel>Total Losses ($)</FormLabel>
                      <FormControl>
                        <Input type="number" step="0.01" placeholder="e.g., 500000" value={field.value ?? ''} onChange={(e) => field.onChange(e.target.value === '' ? undefined : Number(e.target.value))} />
                      </FormControl>
                      <FormMessage />
                    </FormItem>
                  )}
                />
              </div>
              <Button type="submit" className="w-full md:w-auto">
                Calculate loss metrics
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
            <CardDescription>See loss frequency, severity, expected loss, and recommendations.</CardDescription>
          </CardHeader>
          <CardContent className="space-y-6">
            <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
              <div className="p-4 border rounded">
                <p className="text-sm text-muted-foreground">Loss Frequency</p>
                <p className="text-2xl font-semibold text-primary">{result.lossFrequency.toFixed(4)}</p>
                <p className="text-xs text-muted-foreground">Claims per exposure</p>
              </div>
              <div className="p-4 border rounded">
                <p className="text-sm text-muted-foreground">Loss Severity</p>
                <p className="text-2xl font-semibold text-primary">${result.lossSeverity.toLocaleString(undefined, { maximumFractionDigits: 2 })}</p>
                <p className="text-xs text-muted-foreground">Per claim</p>
              </div>
              <div className="p-4 border rounded">
                <p className="text-sm text-muted-foreground">Expected Loss</p>
                <p className="text-2xl font-semibold text-primary">${result.expectedLoss.toLocaleString(undefined, { maximumFractionDigits: 2 })}</p>
                <p className="text-xs text-muted-foreground">Per exposure</p>
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
            <strong>Loss Frequency</strong> = Number of Claims / Number of Exposures. The number of claims expected per exposure unit, representing how often claims occur.
          </p>
          <p>
            <strong>Loss Severity</strong> = Total Losses / Number of Claims. The average cost per claim, representing the average claim amount.
          </p>
          <p>
            <strong>Expected Loss</strong> = Loss Frequency × Loss Severity. The expected cost per exposure unit, representing the average loss cost that should be covered by premiums.
          </p>
          <p>Premiums should exceed expected loss to cover expenses, profit margin, and provide a safety buffer. These metrics are fundamental for insurance pricing, underwriting evaluation, and risk assessment.</p>
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
                <p className="text-sm text-muted-foreground">Total Expected Loss</p>
                <p className="text-xl font-semibold text-primary">
                  ${(result.expectedLoss * result.numberOfExposures).toLocaleString(undefined, { maximumFractionDigits: 2 })}
                </p>
                <p className="text-xs text-muted-foreground">For all exposures</p>
              </div>
              <div className="p-4 border rounded">
                <p className="text-sm text-muted-foreground">Claims Rate</p>
                <p className="text-xl font-semibold text-primary">
                  {(result.lossFrequency * 100).toFixed(2)}%
                </p>
                <p className="text-xs text-muted-foreground">% of exposures</p>
              </div>
              <div className="p-4 border rounded">
                <p className="text-sm text-muted-foreground">Status</p>
                <p className="text-xl font-semibold text-primary capitalize">{result.status}</p>
                <p className="text-xs text-muted-foreground">{result.interpretation}</p>
              </div>
            </div>
          ) : (
            <p className="text-sm text-muted-foreground">Enter your information to see additional insights.</p>
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
                <Link href={`/category/finance/${calc.slug}`} className="text-primary hover:underline">
                  {calc.name}
                </Link>
              </h4>
              <p className="text-sm text-muted-foreground">{calc.description}</p>
            </div>
          ))}
        </CardContent>
      </Card>

      <section
        className="space-y-6 text-muted-foreground leading-relaxed bg-card p-6 md:p-10 rounded-lg shadow-lg"
        itemScope
        itemType="https://schema.org/FinancialProduct"
      >
    <meta itemProp="name" content="The Definitive Guide to Expected Loss Frequency and Severity: Fundamental Insurance Metrics" />
    <meta itemProp="description" content="A comprehensive guide to calculating and understanding loss frequency, loss severity, and expected loss, fundamental metrics for insurance pricing and risk assessment." />
    <meta itemProp="keywords" content="loss frequency, loss severity, expected loss, insurance pricing, underwriting metrics, claims analysis" />
    <meta itemProp="author" content="[Your Site's Finance Team]" />
    <meta itemProp="datePublished" content="2025-01-02" />
    <meta itemProp="url" content="/definitive-loss-frequency-severity-guide" />

    <h1 className="text-3xl md:text-4xl font-extrabold text-foreground mb-4" itemProp="headline">The Definitive Guide to Expected Loss Frequency and Severity: Fundamental Insurance Metrics</h1>
    <p className="text-lg italic text-muted-foreground">A comprehensive guide to understanding and calculating loss frequency, loss severity, and expected loss, fundamental metrics for insurance pricing, underwriting evaluation, and risk assessment.</p>

    <h2 className="text-2xl font-bold text-foreground mt-8 mb-4">Table of Contents</h2>
    <ul className="list-disc ml-6 space-y-2 text-primary">
        <li><a href="#overview" className="hover:underline">Overview: Loss Frequency and Severity</a></li>
        <li><a href="#frequency" className="hover:underline">Loss Frequency Calculation</a></li>
        <li><a href="#severity" className="hover:underline">Loss Severity Calculation</a></li>
        <li><a href="#expected" className="hover:underline">Expected Loss Calculation</a></li>
    </ul>
<hr />

    <h2 id="overview" className="text-2xl font-bold text-foreground pt-8" itemProp="articleSection">Overview: Loss Frequency and Severity</h2>
    <p><b>Loss frequency</b> and <b>loss severity</b> are fundamental metrics in insurance that help assess risk, set premiums, and evaluate underwriting performance. Together, they determine expected loss, which is critical for pricing and financial planning.</p>

    <h3 className="text-xl font-semibold text-foreground mt-6">Key Concepts</h3>
    <ul>
        <li><b>Loss Frequency:</b> Number of claims per exposure unit, representing how often claims occur</li>
        <li><b>Loss Severity:</b> Average cost per claim, representing the average claim amount</li>
        <li><b>Expected Loss:</b> Expected cost per exposure unit, calculated as frequency × severity</li>
        <li><b>Exposures:</b> Insured units or policies that generate potential claims</li>
    </ul>

<hr />

    <h2 id="frequency" className="text-2xl font-bold text-foreground pt-8" itemProp="articleSection">Loss Frequency Calculation</h2>
    
    <h3 className="text-xl font-semibold text-foreground mt-6">Formula</h3>
    <p><b>Loss Frequency = Number of Claims / Number of Exposures</b></p>

    <h3 className="text-xl font-semibold text-foreground mt-6">Example</h3>
    <p>If 100 claims occur from 1,000 insured units:</p>
    <ul>
        <li>Loss Frequency = 100 / 1,000 = 0.1 claims per exposure</li>
        <li>This means 10% of exposures generate claims</li>
    </ul>
    <p>Lower frequency generally indicates better underwriting and risk selection.</p>

<hr />

    <h2 id="severity" className="text-2xl font-bold text-foreground pt-8" itemProp="articleSection">Loss Severity Calculation</h2>
    
    <h3 className="text-xl font-semibold text-foreground mt-6">Formula</h3>
    <p><b>Loss Severity = Total Losses / Number of Claims</b></p>

    <h3 className="text-xl font-semibold text-foreground mt-6">Example</h3>
    <p>If total losses are $500,000 from 100 claims:</p>
    <ul>
        <li>Loss Severity = $500,000 / 100 = $5,000 per claim</li>
        <li>This represents the average claim amount</li>
    </ul>
    <p>Lower severity indicates smaller average claims, which is generally favorable.</p>

<hr />

    <h2 id="expected" className="text-2xl font-bold text-foreground pt-8" itemProp="articleSection">Expected Loss Calculation</h2>
    
    <h3 className="text-xl font-semibold text-foreground mt-6">Formula</h3>
    <p><b>Expected Loss = Loss Frequency × Loss Severity</b></p>

    <h3 className="text-xl font-semibold text-foreground mt-6">Example</h3>
    <p>If loss frequency is 0.1 and loss severity is $5,000:</p>
    <ul>
        <li>Expected Loss = 0.1 × $5,000 = $500 per exposure</li>
        <li>This means the insurer expects to pay $500 in claims per insured unit</li>
    </ul>
    <p>Premiums should exceed expected loss to cover expenses, profit margin, and provide a safety buffer.</p>

<hr />

    <h2 className="text-2xl font-bold text-foreground pt-8" itemProp="articleSection">Conclusion</h2>
    <p><b>Loss frequency</b> and <b>loss severity</b> are fundamental metrics for insurance pricing and risk assessment. Expected loss (frequency × severity) represents the cost that should be covered by premiums. Monitor these metrics regularly and ensure premiums adequately cover expected losses plus expenses and profit.</p>
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
          <p>This tool calculates loss frequency, loss severity, and expected loss based on number of claims, exposures, and total losses.</p>
          <p>Outputs include loss frequency, loss severity, expected loss, status, recommendations, an action plan, and supporting metrics.</p>
          <p>Formula, steps, guide content, related tools, and FAQs ensure humans or AI assistants can interpret the methodology instantly.</p>
        </CardContent>
      </Card>
    </div>
  );
}

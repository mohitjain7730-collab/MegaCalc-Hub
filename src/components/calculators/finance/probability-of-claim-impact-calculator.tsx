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
  assetValue: z.number({ invalid_type_error: 'Enter asset value' }).min(0),
  exposureFactor: z.number({ invalid_type_error: 'Enter exposure factor' }).min(0).max(100),
  annualRateOfOccurrence: z.number({ invalid_type_error: 'Enter annual rate of occurrence' }).min(0).max(100),
});

type FormValues = z.infer<typeof formSchema>;

type ResultPayload = {
  assetValue: number;
  exposureFactor: number;
  annualRateOfOccurrence: number;
  singleLossExpectancy: number;
  annualLossExpectancy: number;
  riskScore: number;
  status: 'optimal' | 'good' | 'moderate' | 'low';
  interpretation: string;
  recommendations: string[];
  plan: { label: string; detail: string }[];
};

const steps = [
  'Enter asset value (total value of asset at risk).',
  'Enter exposure factor (percentage of asset value that would be lost if risk materializes).',
  'Enter annual rate of occurrence (probability of event occurring in a year, as percentage).',
  'Review single loss expectancy, annual loss expectancy, and risk assessment.',
];

const faqs = [
  {
    question: 'What is single loss expectancy (SLE)?',
    answer:
      'Single loss expectancy (SLE) is the expected financial loss from a single incident. Formula: SLE = Asset Value Ã— Exposure Factor. It represents the monetary impact if the risk materializes once.',
  },
  {
    question: 'What is annual loss expectancy (ALE)?',
    answer:
      'Annual loss expectancy (ALE) is the expected annual financial loss from a risk. Formula: ALE = SLE Ã— Annual Rate of Occurrence (ARO). It incorporates both the impact (SLE) and probability (ARO) of the risk.',
  },
  {
    question: 'What is exposure factor?',
    answer:
      'Exposure factor is the percentage of asset value that would be lost if the risk materializes. For example, if a $100,000 asset has 5% exposure factor, $5,000 would be lost. Exposure factor ranges from 0% to 100%.',
  },
  {
    question: 'What is annual rate of occurrence (ARO)?',
    answer:
      'Annual rate of occurrence (ARO) is the estimated frequency of the event occurring within a year, expressed as a percentage. For example, 10% ARO means a 10% chance (0.1 probability) of occurrence in a year.',
  },
  {
    question: 'How is risk score calculated?',
    answer:
      'Risk score is calculated as: Risk Score = (ALE / Asset Value) Ã— 100. It represents the annual expected loss as a percentage of asset value. Higher risk scores indicate higher risk relative to asset value.',
  },
  {
    question: 'What is a high risk score?',
    answer:
      'Risk scores above 5% are considered high, indicating significant expected annual losses relative to asset value. Risk scores above 10% are very high and may require immediate risk mitigation measures.',
  },
  {
    question: 'How do I use this for insurance decisions?',
    answer:
      'Use ALE to determine appropriate insurance coverage limits and premiums. If ALE is $500/year, consider insurance with premiums under $500/year if the coverage provides adequate protection. Compare ALE to insurance costs.',
  },
  {
    question: 'What about risk mitigation?',
    answer:
      'Risk mitigation can reduce exposure factor or ARO, lowering ALE. For example, security measures may reduce theft probability (ARO), while backups may reduce data loss impact (exposure factor). Compare mitigation costs to ALE reduction.',
  },
  {
    question: 'How accurate are these estimates?',
    answer:
      'Estimates are based on assumptions about asset value, exposure factor, and ARO. Accuracy depends on data quality and risk assessment expertise. Review and update estimates regularly as conditions change.',
  },
  {
    question: 'What about multiple risks?',
    answer:
      'For multiple risks, calculate ALE for each risk separately and sum them for total expected annual loss. Consider correlation between risks: if risks are correlated, total ALE may be higher than the sum of individual ALEs.',
  },
];

const relatedCalculators = [
  {
    name: 'Expected Loss (Insurance Risk) Calculator',
    slug: 'expected-loss-insurance-risk-calculator',
    description: 'Calculate expected loss from insurance risk.',
  },
  {
    name: 'Insurance Reserve Requirement Calculator',
    slug: 'insurance-reserve-requirement-calculator',
    description: 'Calculate insurance reserve requirements.',
  },
  {
    name: 'Car Insurance Coverage Needs Calculator',
    slug: 'car-insurance-coverage-needs-calculator',
    description: 'Calculate car insurance coverage needs.',
  },
  {
    name: 'Homeowners Insurance Coverage Estimator',
    slug: 'homeowners-insurance-coverage-estimator',
    description: 'Calculate homeowners insurance coverage needs.',
  },
];

const baseUrl = 'https://mycalculating.com/finance/probability-of-claim-impact-calculator';

const schemaMarkup = {
  '@context': 'https://schema.org',
  '@graph': [
    {
      '@type': 'BreadcrumbList',
      itemListElement: [
        { '@type': 'ListItem', position: 1, name: 'Home', item: 'https://mycalculating.com' },
        { '@type': 'ListItem', position: 2, name: 'Finance', item: 'https://mycalculating.com/finance' },
        { '@type': 'ListItem', position: 3, name: 'Probability of Claim Impact Calculator', item: baseUrl },
      ],
    },
    {
      '@type': 'SoftwareApplication',
      name: 'Probability of Claim Impact Calculator',
      applicationCategory: 'Calculator',
      operatingSystem: 'Web Browser',
      description: 'Calculate probability of claim impact using single loss expectancy (SLE) and annual loss expectancy (ALE) based on asset value, exposure factor, and annual rate of occurrence.',
      url: baseUrl,
      offers: { '@type': 'Offer', price: '0', priceCurrency: 'USD' },
    },
  ],
};

const calculateResult = (values: FormValues): ResultPayload => {
  const assetValue = values.assetValue;
  const exposureFactor = values.exposureFactor; // percentage
  const annualRateOfOccurrence = values.annualRateOfOccurrence; // percentage

  // Single Loss Expectancy (SLE) = Asset Value Ã— Exposure Factor
  // Exposure factor is in percentage, so divide by 100
  const singleLossExpectancy = assetValue * (exposureFactor / 100);

  // Annual Loss Expectancy (ALE) = SLE Ã— Annual Rate of Occurrence
  // ARO is in percentage, so divide by 100
  const annualLossExpectancy = singleLossExpectancy * (annualRateOfOccurrence / 100);

  // Risk Score = (ALE / Asset Value) Ã— 100
  // Represents annual expected loss as percentage of asset value
  const riskScore = assetValue > 0 ? (annualLossExpectancy / assetValue) * 100 : 0;

  let status: ResultPayload['status'] = 'optimal';
  let interpretation = 'Risk assessment calculated. Single loss expectancy and annual loss expectancy provide insights into potential financial impact and expected annual losses.';

  if (riskScore > 10) {
    status = 'low';
    interpretation = 'Very high risk score (over 10%) indicates significant expected annual losses relative to asset value. Immediate risk mitigation or insurance coverage is recommended to protect against substantial financial impact.';
  } else if (riskScore > 5) {
    status = 'moderate';
    interpretation = 'High risk score (5-10%) indicates notable expected annual losses. Consider risk mitigation measures or insurance coverage to reduce financial exposure and protect against losses.';
  } else if (riskScore > 1) {
    status = 'good';
    interpretation = 'Moderate risk score (1-5%) indicates manageable expected annual losses. Monitor risk and consider insurance or mitigation if risk increases or financial impact becomes significant.';
  } else {
    status = 'optimal';
    interpretation = 'Low risk score (under 1%) indicates minimal expected annual losses relative to asset value. Risk is manageable, but continue monitoring and maintain appropriate insurance coverage.';
  }

  const recommendations = [
    `Single Loss Expectancy (SLE): $${singleLossExpectancy.toLocaleString(undefined, { maximumFractionDigits: 2 })}. This is the expected financial loss from a single incident if the risk materializes.`,
    `Annual Loss Expectancy (ALE): $${annualLossExpectancy.toLocaleString(undefined, { maximumFractionDigits: 2 })}. This is the expected annual financial loss, incorporating both impact (SLE) and probability (${annualRateOfOccurrence}% annual rate of occurrence).`,
    `Risk Score: ${riskScore.toFixed(2)}%. This represents annual expected loss as a percentage of asset value. ${riskScore > 5 ? 'High risk score suggests significant financial exposure.' : riskScore > 1 ? 'Moderate risk score suggests manageable but notable financial exposure.' : 'Low risk score suggests minimal financial exposure.'}`,
  ];
  if (riskScore > 5) {
    recommendations.push('High risk score requires attention. Consider: risk mitigation measures to reduce exposure factor or ARO, insurance coverage to transfer risk, or risk acceptance if mitigation/insurance costs exceed ALE.');
  } else {
    recommendations.push('Moderate to low risk score. Monitor risk regularly and maintain appropriate insurance coverage. Consider risk mitigation if costs are reasonable relative to ALE reduction.');
  }
  if (annualLossExpectancy > 0) {
    recommendations.push(`Compare ALE ($${annualLossExpectancy.toLocaleString(undefined, { maximumFractionDigits: 2 })}/year) to insurance premiums. If insurance premiums are significantly lower than ALE, insurance may be cost-effective.`);
  }

  const plan = [
    { label: 'This Week', detail: `Review risk assessment: SLE $${singleLossExpectancy.toLocaleString(undefined, { maximumFractionDigits: 2 })}, ALE $${annualLossExpectancy.toLocaleString(undefined, { maximumFractionDigits: 2 })}/year, Risk Score ${riskScore.toFixed(2)}%. Assess current insurance coverage and risk mitigation measures.` },
    { label: 'This Month', detail: 'Evaluate risk mitigation options: security measures, backups, safety protocols. Compare mitigation costs to ALE reduction. Consider insurance if premiums are reasonable relative to ALE.' },
    { label: 'Ongoing', detail: 'Monitor risk regularly. Update estimates as asset values change, exposure factors change, or ARO changes. Review insurance coverage annually to ensure it matches current risk levels.' },
  ];

  return {
    assetValue,
    exposureFactor,
    annualRateOfOccurrence,
    singleLossExpectancy,
    annualLossExpectancy,
    riskScore,
    status,
    interpretation,
    recommendations,
    plan,
  };
};

export default function ProbabilityOfClaimImpactCalculator() {
  const [result, setResult] = useState<ResultPayload | null>(null);

  const form = useForm<FormValues>({
    resolver: zodResolver(formSchema),
    defaultValues: {
      assetValue: undefined,
      exposureFactor: undefined,
      annualRateOfOccurrence: undefined,
    },
  });

  return (
    <div className="space-y-8">
      <Script id="probability-claim-impact-schema" type="application/ld+json" strategy="afterInteractive" dangerouslySetInnerHTML={{ __html: JSON.stringify(schemaMarkup) }} />

      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <Heart className="h-5 w-5" />
            Probability of Claim Impact Calculator
          </CardTitle>
          <CardDescription>Calculate probability of claim impact using single loss expectancy (SLE) and annual loss expectancy (ALE) based on asset value, exposure factor, and annual rate of occurrence.</CardDescription>
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
                  name="assetValue"
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel>Asset Value ($)</FormLabel>
                      <FormControl>
                        <Input type="number" step="0.01" placeholder="e.g., 100000" value={field.value ?? ''} onChange={(e) => field.onChange(e.target.value === '' ? undefined : Number(e.target.value))} />
                      </FormControl>
                      <FormMessage />
                    </FormItem>
                  )}
                />
                <FormField
                  control={form.control}
                  name="exposureFactor"
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel>Exposure Factor (%)</FormLabel>
                      <FormControl>
                        <Input type="number" step="0.01" placeholder="e.g., 5" value={field.value ?? ''} onChange={(e) => field.onChange(e.target.value === '' ? undefined : Number(e.target.value))} />
                      </FormControl>
                      <FormMessage />
                    </FormItem>
                  )}
                />
                <FormField
                  control={form.control}
                  name="annualRateOfOccurrence"
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel>Annual Rate of Occurrence (%)</FormLabel>
                      <FormControl>
                        <Input type="number" step="0.01" placeholder="e.g., 10" value={field.value ?? ''} onChange={(e) => field.onChange(e.target.value === '' ? undefined : Number(e.target.value))} />
                      </FormControl>
                      <FormMessage />
                    </FormItem>
                  )}
                />
              </div>
              <Button type="submit" className="w-full md:w-auto">
                Calculate risk impact
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
            <CardDescription>See single loss expectancy, annual loss expectancy, risk score, and risk assessment.</CardDescription>
          </CardHeader>
          <CardContent className="space-y-6">
            <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
              <div className="p-4 border rounded">
                <p className="text-sm text-muted-foreground">Single Loss Expectancy</p>
                <p className="text-2xl font-semibold text-primary">{result.singleLossExpectancy.toLocaleString(undefined, { maximumFractionDigits: 2 })}</p>
                <p className="text-xs text-muted-foreground">$</p>
              </div>
              <div className="p-4 border rounded">
                <p className="text-sm text-muted-foreground">Annual Loss Expectancy</p>
                <p className="text-2xl font-semibold text-primary">{result.annualLossExpectancy.toLocaleString(undefined, { maximumFractionDigits: 2 })}</p>
                <p className="text-xs text-muted-foreground">$/year</p>
              </div>
              <div className="p-4 border rounded">
                <p className="text-sm text-muted-foreground">Risk Score</p>
                <p className="text-2xl font-semibold text-primary">{result.riskScore.toFixed(2)}%</p>
                <p className="text-xs text-muted-foreground">Of asset value</p>
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
            <strong>Single Loss Expectancy (SLE)</strong> = Asset Value Ã— (Exposure Factor / 100). The expected financial loss from a single incident if the risk materializes.
          </p>
          <p>
            <strong>Annual Loss Expectancy (ALE)</strong> = SLE Ã— (Annual Rate of Occurrence / 100). The expected annual financial loss, incorporating both impact (SLE) and probability (ARO).
          </p>
          <p>
            <strong>Risk Score</strong> = (ALE / Asset Value) Ã— 100. The annual expected loss as a percentage of asset value. Higher scores indicate higher risk relative to asset value.
          </p>
          <p>
            <strong>Exposure Factor</strong> = Percentage of asset value that would be lost if risk materializes (0-100%). For example, 5% exposure factor means 5% of asset value would be lost.
          </p>
          <p>
            <strong>Annual Rate of Occurrence (ARO)</strong> = Probability of event occurring in a year, expressed as percentage (0-100%). For example, 10% ARO means 10% chance (0.1 probability) of occurrence per year.
          </p>
          <p>SLE and ALE are fundamental risk assessment metrics. SLE quantifies impact, while ALE quantifies expected annual loss. Use ALE to compare to insurance premiums and evaluate risk mitigation cost-effectiveness.</p>
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
                <p className="text-sm text-muted-foreground">Exposure Amount</p>
                <p className="text-xl font-semibold text-primary">
                  ${(result.assetValue * (result.exposureFactor / 100)).toLocaleString(undefined, { maximumFractionDigits: 2 })}
                </p>
                <p className="text-xs text-muted-foreground">Potential loss</p>
              </div>
              <div className="p-4 border rounded">
                <p className="text-sm text-muted-foreground">Probability</p>
                <p className="text-xl font-semibold text-primary">
                  {result.annualRateOfOccurrence.toFixed(2)}%
                </p>
                <p className="text-xs text-muted-foreground">Annual occurrence</p>
              </div>
              <div className="p-4 border rounded">
                <p className="text-sm text-muted-foreground">ALE per $1,000 Asset</p>
                <p className="text-xl font-semibold text-primary">
                  ${result.assetValue > 0 ? ((result.annualLossExpectancy / result.assetValue) * 1000).toFixed(2) : '0.00'}
                </p>
                <p className="text-xs text-muted-foreground">Per $1,000 value</p>
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
        className="space-y-6 text-muted-foreground leading-relaxed bg-card p-6 md:p-10 rounded-lg shadow-lg"
        itemScope
        itemType="https://schema.org/FinancialProduct"
      >
    <meta itemProp="name" content="The Definitive Guide to Probability of Claim Impact: Risk Assessment Using SLE and ALE" />
    <meta itemProp="description" content="A comprehensive guide to calculating probability of claim impact using single loss expectancy (SLE) and annual loss expectancy (ALE) for risk assessment." />
    <meta itemProp="keywords" content="probability of claim impact, single loss expectancy, SLE, annual loss expectancy, ALE, risk assessment, insurance risk" />
    <meta itemProp="author" content="[Your Site's Finance Team]" />
    <meta itemProp="datePublished" content="2025-01-02" />
    <meta itemProp="url" content="/definitive-probability-claim-impact-guide" />

    <h1 className="text-3xl md:text-4xl font-extrabold text-foreground mb-4" itemProp="headline">The Definitive Guide to Probability of Claim Impact: Risk Assessment Using SLE and ALE</h1>
    <p className="text-lg italic text-muted-foreground">A comprehensive guide to understanding and calculating probability of claim impact for insurance risk assessment.</p>

    <h2 className="text-2xl font-bold text-foreground mt-8 mb-4">Table of Contents</h2>
    <ul className="list-disc ml-6 space-y-2 text-primary">
        <li><a href="#overview" className="hover:underline">Overview: Risk Assessment Metrics</a></li>
        <li><a href="#sle" className="hover:underline">Single Loss Expectancy (SLE)</a></li>
        <li><a href="#ale" className="hover:underline">Annual Loss Expectancy (ALE)</a></li>
        <li><a href="#application" className="hover:underline">Application to Insurance</a></li>
    </ul>
<hr />

    <h2 id="overview" className="text-2xl font-bold text-foreground pt-8" itemProp="articleSection">Overview: Risk Assessment Metrics</h2>
    <p><b>Probability of claim impact</b> assessment uses quantitative metrics to evaluate financial risk. Single Loss Expectancy (SLE) and Annual Loss Expectancy (ALE) are fundamental risk assessment tools.</p>

    <h3 className="text-xl font-semibold text-foreground mt-6">Key Metrics</h3>
    <ul>
        <li><b>Single Loss Expectancy (SLE):</b> Expected financial loss from a single incident</li>
        <li><b>Annual Loss Expectancy (ALE):</b> Expected annual financial loss, incorporating impact and probability</li>
        <li><b>Risk Score:</b> Annual expected loss as percentage of asset value</li>
    </ul>

<hr />

    <h2 id="sle" className="text-2xl font-bold text-foreground pt-8" itemProp="articleSection">Single Loss Expectancy (SLE)</h2>
    
    <h3 className="text-xl font-semibold text-foreground mt-6">SLE Formula</h3>
    <p>Single Loss Expectancy is calculated as: <b>SLE = Asset Value Ã— Exposure Factor</b></p>

    <h3 className="text-xl font-semibold text-foreground mt-6">Example Calculation</h3>
    <p>If an asset worth $100,000 has a 5% exposure factor:</p>
    <ul>
        <li>SLE = $100,000 Ã— 5% = $5,000</li>
    </ul>
    <p>This means the expected loss from a single incident is $5,000.</p>

<hr />

    <h2 id="ale" className="text-2xl font-bold text-foreground pt-8" itemProp="articleSection">Annual Loss Expectancy (ALE)</h2>
    
    <h3 className="text-xl font-semibold text-foreground mt-6">ALE Formula</h3>
    <p>Annual Loss Expectancy is calculated as: <b>ALE = SLE Ã— Annual Rate of Occurrence (ARO)</b></p>

    <h3 className="text-xl font-semibold text-foreground mt-6">Example Calculation</h3>
    <p>If SLE is $5,000 and ARO is 10% (0.1 probability per year):</p>
    <ul>
        <li>ALE = $5,000 Ã— 0.1 = $500</li>
    </ul>
    <p>This suggests an expected annual loss of $500 due to the risk.</p>

<hr />

    <h2 id="application" className="text-2xl font-bold text-foreground pt-8" itemProp="articleSection">Application to Insurance</h2>
    
    <h3 className="text-xl font-semibold text-foreground mt-6">Insurance Decision Making</h3>
    <p>Use ALE to evaluate insurance cost-effectiveness. If ALE is $500/year, consider insurance with premiums under $500/year if coverage provides adequate protection. Compare ALE to insurance premiums and deductibles.</p>

    <h3 className="text-xl font-semibold text-foreground mt-6">Risk Mitigation</h3>
    <p>Risk mitigation can reduce exposure factor or ARO, lowering ALE. Compare mitigation costs to ALE reduction. If mitigation costs $200/year and reduces ALE by $400/year, mitigation is cost-effective.</p>

<hr />

    <h2 className="text-2xl font-bold text-foreground pt-8" itemProp="articleSection">Conclusion</h2>
    <p><b>Probability of claim impact</b> assessment uses SLE and ALE to quantify financial risk. SLE measures impact, while ALE measures expected annual loss. Use ALE to compare to insurance premiums and evaluate risk mitigation cost-effectiveness. Higher risk scores require attention and may justify insurance or mitigation measures.</p>
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
          <p>This tool calculates probability of claim impact using single loss expectancy (SLE) and annual loss expectancy (ALE) based on asset value, exposure factor, and annual rate of occurrence.</p>
          <p>Outputs include single loss expectancy, annual loss expectancy, risk score, status, recommendations, an action plan, and supporting metrics.</p>
          <p>Formula, steps, guide content, related tools, and FAQs ensure humans or AI assistants can interpret the methodology instantly.</p>
        </CardContent>
      </Card>
    </div>
  );
}

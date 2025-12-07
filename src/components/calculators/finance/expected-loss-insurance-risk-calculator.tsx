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
  probabilityOfLoss: z.number({ invalid_type_error: 'Enter probability of loss' }).min(0).max(100),
  lossSeverity: z.number({ invalid_type_error: 'Enter loss severity' }).min(0),
});

type FormValues = z.infer<typeof formSchema>;

type ResultPayload = {
  probabilityOfLoss: number;
  lossSeverity: number;
  expectedLoss: number;
  riskLevel: string;
  status: 'optimal' | 'good' | 'moderate' | 'low';
  interpretation: string;
  recommendations: string[];
  plan: { label: string; detail: string }[];
};

const steps = [
  'Enter probability of loss event (likelihood of loss occurring, as percentage).',
  'Enter loss severity (average monetary amount of loss if event occurs).',
  'Review expected loss calculation and risk assessment.',
  'Use expected loss to evaluate insurance needs and premium affordability.',
];

const faqs = [
  {
    question: 'What is expected loss?',
    answer:
      'Expected loss is the anticipated financial loss from potential claims, calculated by multiplying the probability of a loss event by the severity of the loss. Formula: Expected Loss = Probability of Loss Event × Loss Severity.',
  },
  {
    question: 'What is probability of loss?',
    answer:
      'Probability of loss is the likelihood that a loss will occur, expressed as a decimal between 0 and 1 (or percentage 0-100%). For example, 5% probability means a 5% chance (0.05 probability) of loss occurring.',
  },
  {
    question: 'What is loss severity?',
    answer:
      'Loss severity is the average monetary amount of the loss if the event occurs. For example, if average claim amount is $10,000, loss severity is $10,000. Severity represents the financial impact of a single loss event.',
  },
  {
    question: 'How is expected loss used in insurance?',
    answer:
      'Expected loss helps insurers set premiums, reserving funds, and managing risk. Premiums should exceed expected loss to cover expenses and profit. Policyholders can use expected loss to evaluate insurance affordability and coverage needs.',
  },
  {
    question: 'What is a reasonable expected loss?',
    answer:
      'Expected loss varies by risk type and individual circumstances. Higher probability or severity increases expected loss. Compare expected loss to insurance premiums: if premiums are significantly higher than expected loss, consider self-insurance or higher deductibles.',
  },
  {
    question: 'How does probability affect expected loss?',
    answer:
      'Higher probability increases expected loss proportionally. A 10% probability with $10,000 severity = $1,000 expected loss. A 20% probability with $10,000 severity = $2,000 expected loss. Probability is a key driver of expected loss.',
  },
  {
    question: 'How does severity affect expected loss?',
    answer:
      'Higher severity increases expected loss proportionally. A 5% probability with $10,000 severity = $500 expected loss. A 5% probability with $20,000 severity = $1,000 expected loss. Severity is equally important as probability.',
  },
  {
    question: 'What about multiple loss events?',
    answer:
      'For multiple independent loss events, calculate expected loss for each event separately and sum them for total expected loss. For correlated events, total expected loss may be higher due to correlation effects.',
  },
  {
    question: 'How do I estimate probability and severity?',
    answer:
      'Estimate probability using historical data, industry benchmarks, or expert judgment. Estimate severity using historical claim amounts, replacement costs, or expert estimates. Review and update estimates regularly as conditions change.',
  },
  {
    question: 'How often should I review expected loss?',
    answer:
      'Review expected loss annually or when: risk factors change significantly, loss history changes, or market conditions change. Update probability and severity estimates based on actual experience and changing conditions.',
  },
];

const relatedCalculators = [
  {
    name: 'Probability of Claim Impact Calculator',
    slug: 'probability-of-claim-impact-calculator',
    description: 'Calculate probability of claim impact.',
  },
  {
    name: 'Insurance Reserve Requirement Calculator',
    slug: 'insurance-reserve-requirement-calculator',
    description: 'Calculate insurance reserve requirements.',
  },
  {
    name: 'Credit Risk Expected Loss Calculator',
    slug: 'credit-risk-expected-loss-calculator',
    description: 'Calculate credit risk expected loss.',
  },
  {
    name: 'Conditional Value at Risk Calculator',
    slug: 'conditional-value-at-risk-calculator',
    description: 'Calculate conditional value at risk.',
  },
];

const baseUrl = 'https://mycalculating.com/category/finance/expected-loss-insurance-risk-calculator';

const schemaMarkup = {
  '@context': 'https://schema.org',
  '@graph': [
    {
      '@type': 'BreadcrumbList',
      itemListElement: [
        { '@type': 'ListItem', position: 1, name: 'Home', item: 'https://mycalculating.com' },
        { '@type': 'ListItem', position: 2, name: 'Finance', item: 'https://mycalculating.com/category/finance' },
        { '@type': 'ListItem', position: 3, name: 'Expected Loss (Insurance Risk) Calculator', item: baseUrl },
      ],
    },
    {
      '@type': 'SoftwareApplication',
      name: 'Expected Loss (Insurance Risk) Calculator',
      applicationCategory: 'Calculator',
      operatingSystem: 'Web Browser',
      description: 'Calculate expected loss from insurance risk based on probability of loss event and loss severity.',
      url: baseUrl,
      offers: { '@type': 'Offer', price: '0', priceCurrency: 'USD' },
    },
  ],
};

const calculateResult = (values: FormValues): ResultPayload => {
  const probabilityOfLoss = values.probabilityOfLoss; // percentage
  const lossSeverity = values.lossSeverity;

  // Expected Loss = Probability of Loss Event × Loss Severity
  // Probability is in percentage, so divide by 100
  const expectedLoss = (probabilityOfLoss / 100) * lossSeverity;

  // Determine risk level based on expected loss and severity
  let riskLevel = 'Low';
  if (expectedLoss > 10000 || lossSeverity > 100000) {
    riskLevel = 'Very High';
  } else if (expectedLoss > 5000 || lossSeverity > 50000) {
    riskLevel = 'High';
  } else if (expectedLoss > 1000 || lossSeverity > 10000) {
    riskLevel = 'Moderate';
  } else if (expectedLoss > 100 || lossSeverity > 1000) {
    riskLevel = 'Low';
  } else {
    riskLevel = 'Very Low';
  }

  let status: ResultPayload['status'] = 'optimal';
  let interpretation = 'Expected loss calculated. Use expected loss to evaluate insurance needs, premium affordability, and risk management strategies.';

  if (expectedLoss > 10000) {
    status = 'low';
    interpretation = 'Very high expected loss (over $10,000) indicates significant financial risk. Insurance coverage is strongly recommended to protect against substantial financial impact. Consider comprehensive coverage with appropriate limits.';
  } else if (expectedLoss > 5000) {
    status = 'moderate';
    interpretation = 'High expected loss ($5,000-$10,000) indicates notable financial risk. Insurance coverage is recommended to protect against significant financial impact. Evaluate coverage options and premium affordability.';
  } else if (expectedLoss > 1000) {
    status = 'good';
    interpretation = 'Moderate expected loss ($1,000-$5,000) indicates manageable but notable financial risk. Consider insurance coverage if premiums are reasonable relative to expected loss. Evaluate self-insurance vs. insurance.';
  } else {
    status = 'optimal';
    interpretation = 'Low expected loss (under $1,000) indicates minimal financial risk. Risk may be manageable through self-insurance or higher deductibles. Continue monitoring risk and maintain appropriate coverage.';
  }

  const recommendations = [
    `Expected Loss: $${expectedLoss.toLocaleString(undefined, { maximumFractionDigits: 2 })}. This is the anticipated annual financial loss, calculated as probability (${probabilityOfLoss}%) × severity ($${lossSeverity.toLocaleString(undefined, { maximumFractionDigits: 2 })}).`,
    `Risk Level: ${riskLevel}. ${riskLevel === 'Very High' || riskLevel === 'High' ? 'High risk requires insurance coverage to protect against substantial financial impact.' : riskLevel === 'Moderate' ? 'Moderate risk may benefit from insurance coverage if premiums are reasonable.' : 'Low risk may be manageable through self-insurance or higher deductibles.'}`,
    `Compare expected loss to insurance premiums. If expected loss is $${expectedLoss.toLocaleString(undefined, { maximumFractionDigits: 2 })}/year, consider insurance if premiums are reasonable relative to expected loss. If premiums significantly exceed expected loss, consider self-insurance or higher deductibles.`,
  ];
  if (expectedLoss > 5000) {
    recommendations.push('High expected loss suggests insurance coverage is cost-effective. Evaluate comprehensive coverage options with appropriate limits to protect against substantial financial impact.');
  } else if (expectedLoss > 1000) {
    recommendations.push('Moderate expected loss suggests insurance may be beneficial if premiums are reasonable. Compare insurance costs to expected loss and evaluate self-insurance vs. insurance options.');
  } else {
    recommendations.push('Low expected loss suggests risk may be manageable through self-insurance or higher deductibles. Maintain appropriate coverage but consider cost-effectiveness of insurance vs. self-insurance.');
  }
  if (probabilityOfLoss > 50) {
    recommendations.push(`High probability (${probabilityOfLoss}%) increases expected loss significantly. Consider risk mitigation measures to reduce probability, or ensure adequate insurance coverage to protect against frequent losses.`);
  }

  const plan = [
    { label: 'This Week', detail: `Review expected loss: $${expectedLoss.toLocaleString(undefined, { maximumFractionDigits: 2 })}/year. Assess current insurance coverage and compare premiums to expected loss. Evaluate if insurance is cost-effective relative to expected loss.` },
    { label: 'This Month', detail: `Evaluate insurance options: compare premiums to expected loss ($${expectedLoss.toLocaleString(undefined, { maximumFractionDigits: 2 })}/year). If premiums are reasonable relative to expected loss, consider insurance. If premiums significantly exceed expected loss, consider self-insurance or higher deductibles.` },
    { label: 'Ongoing', detail: 'Monitor expected loss regularly. Update probability and severity estimates based on actual experience and changing conditions. Review insurance coverage annually to ensure it matches current risk levels and remains cost-effective.' },
  ];

  return {
    probabilityOfLoss,
    lossSeverity,
    expectedLoss,
    riskLevel,
    status,
    interpretation,
    recommendations,
    plan,
  };
};

export default function ExpectedLossInsuranceRiskCalculator() {
  const [result, setResult] = useState<ResultPayload | null>(null);

  const form = useForm<FormValues>({
    resolver: zodResolver(formSchema),
    defaultValues: {
      probabilityOfLoss: undefined,
      lossSeverity: undefined,
    },
  });

  return (
    <div className="space-y-8">
      <Script id="expected-loss-insurance-risk-schema" type="application/ld+json" strategy="afterInteractive" dangerouslySetInnerHTML={{ __html: JSON.stringify(schemaMarkup) }} />

      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <Heart className="h-5 w-5" />
            Expected Loss (Insurance Risk) Calculator
          </CardTitle>
          <CardDescription>Calculate expected loss from insurance risk based on probability of loss event and loss severity.</CardDescription>
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
                  name="probabilityOfLoss"
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel>Probability of Loss Event (%)</FormLabel>
                      <FormControl>
                        <Input type="number" step="0.01" placeholder="e.g., 5" value={field.value ?? ''} onChange={(e) => field.onChange(e.target.value === '' ? undefined : Number(e.target.value))} />
                      </FormControl>
                      <FormMessage />
                    </FormItem>
                  )}
                />
                <FormField
                  control={form.control}
                  name="lossSeverity"
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel>Loss Severity ($)</FormLabel>
                      <FormControl>
                        <Input type="number" step="0.01" placeholder="e.g., 10000" value={field.value ?? ''} onChange={(e) => field.onChange(e.target.value === '' ? undefined : Number(e.target.value))} />
                      </FormControl>
                      <FormMessage />
                    </FormItem>
                  )}
                />
              </div>
              <Button type="submit" className="w-full md:w-auto">
                Calculate expected loss
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
            <CardDescription>See expected loss calculation, risk level assessment, and insurance recommendations.</CardDescription>
          </CardHeader>
          <CardContent className="space-y-6">
            <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
              <div className="p-4 border rounded">
                <p className="text-sm text-muted-foreground">Expected Loss</p>
                <p className="text-2xl font-semibold text-primary">{result.expectedLoss.toLocaleString(undefined, { maximumFractionDigits: 2 })}</p>
                <p className="text-xs text-muted-foreground">$/year</p>
              </div>
              <div className="p-4 border rounded">
                <p className="text-sm text-muted-foreground">Probability</p>
                <p className="text-2xl font-semibold text-primary">{result.probabilityOfLoss.toFixed(2)}%</p>
                <p className="text-xs text-muted-foreground">Of loss event</p>
              </div>
              <div className="p-4 border rounded">
                <p className="text-sm text-muted-foreground">Loss Severity</p>
                <p className="text-2xl font-semibold text-primary">{result.lossSeverity.toLocaleString(undefined, { maximumFractionDigits: 2 })}</p>
                <p className="text-xs text-muted-foreground">$</p>
              </div>
              <div className="p-4 border rounded">
                <p className="text-sm text-muted-foreground">Risk Level</p>
                <p className="text-2xl font-semibold text-primary">{result.riskLevel}</p>
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
            <strong>Expected Loss</strong> = (Probability of Loss Event / 100) × Loss Severity. The anticipated financial loss from potential claims, calculated by multiplying probability by severity.
          </p>
          <p>
            <strong>Probability of Loss Event</strong> = Likelihood that a loss will occur, expressed as percentage (0-100%). For example, 5% probability means 5% chance (0.05 probability) of loss occurring.
          </p>
          <p>
            <strong>Loss Severity</strong> = Average monetary amount of the loss if the event occurs. For example, if average claim amount is $10,000, loss severity is $10,000. Severity represents the financial impact of a single loss event.
          </p>
          <p>
            <strong>Risk Level</strong> = Categorized based on expected loss and severity. Very High: expected loss &gt; $10,000 or severity &gt; $100,000. High: expected loss $5,000-$10,000 or severity $50,000-$100,000. Moderate: expected loss $1,000-$5,000 or severity $10,000-$50,000. Low: expected loss $100-$1,000 or severity $1,000-$10,000. Very Low: expected loss &lt; $100 or severity &lt; $1,000.
          </p>
          <p>Expected loss is fundamental in insurance for setting premiums, reserving funds, and managing risk. Higher probability or severity increases expected loss. Compare expected loss to insurance premiums to evaluate cost-effectiveness.</p>
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
                <p className="text-sm text-muted-foreground">Expected Loss per $1,000 Severity</p>
                <p className="text-xl font-semibold text-primary">
                  ${((result.expectedLoss / result.lossSeverity) * 1000).toFixed(2)}
                </p>
                <p className="text-xs text-muted-foreground">Per $1,000 severity</p>
              </div>
              <div className="p-4 border rounded">
                <p className="text-sm text-muted-foreground">Probability as Decimal</p>
                <p className="text-xl font-semibold text-primary">
                  {(result.probabilityOfLoss / 100).toFixed(4)}
                </p>
                <p className="text-xs text-muted-foreground">0-1 scale</p>
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
    <meta itemProp="name" content="The Definitive Guide to Expected Loss: Insurance Risk Assessment" />
    <meta itemProp="description" content="A comprehensive guide to calculating expected loss from insurance risk based on probability of loss event and loss severity." />
    <meta itemProp="keywords" content="expected loss, insurance risk, probability of loss, loss severity, risk assessment, insurance premium" />
    <meta itemProp="author" content="[Your Site's Finance Team]" />
    <meta itemProp="datePublished" content="2025-01-02" />
    <meta itemProp="url" content="/definitive-expected-loss-guide" />

    <h1 className="text-3xl md:text-4xl font-extrabold text-foreground mb-4" itemProp="headline">The Definitive Guide to Expected Loss: Insurance Risk Assessment</h1>
    <p className="text-lg italic text-muted-foreground">A comprehensive guide to understanding and calculating expected loss for insurance risk assessment.</p>

    <h2 className="text-2xl font-bold text-foreground mt-8 mb-4">Table of Contents</h2>
    <ul className="list-disc ml-6 space-y-2 text-primary">
        <li><a href="#overview" className="hover:underline">Overview: Expected Loss in Insurance</a></li>
        <li><a href="#formula" className="hover:underline">Expected Loss Formula</a></li>
        <li><a href="#probability" className="hover:underline">Probability of Loss</a></li>
        <li><a href="#severity" className="hover:underline">Loss Severity</a></li>
        <li><a href="#application" className="hover:underline">Application to Insurance</a></li>
    </ul>
<hr />

    <h2 id="overview" className="text-2xl font-bold text-foreground pt-8" itemProp="articleSection">Overview: Expected Loss in Insurance</h2>
    <p><b>Expected loss</b> quantifies the anticipated financial loss from potential claims. It is calculated by multiplying the probability of a loss event by the severity of the loss, providing a foundation for insurance pricing and risk management.</p>

    <h3 className="text-xl font-semibold text-foreground mt-6">Key Concepts</h3>
    <ul>
        <li><b>Expected Loss:</b> Anticipated financial loss = Probability × Severity</li>
        <li><b>Probability of Loss:</b> Likelihood that a loss will occur (0-100%)</li>
        <li><b>Loss Severity:</b> Average monetary amount of loss if event occurs</li>
    </ul>

<hr />

    <h2 id="formula" className="text-2xl font-bold text-foreground pt-8" itemProp="articleSection">Expected Loss Formula</h2>
    
    <h3 className="text-xl font-semibold text-foreground mt-6">Basic Formula</h3>
    <p>Expected loss is calculated as: <b>Expected Loss = Probability of Loss Event × Loss Severity</b></p>

    <h3 className="text-xl font-semibold text-foreground mt-6">Example Calculation</h3>
    <p>If there's a 5% chance (0.05 probability) of a loss event, and the average loss amount is $10,000:</p>
    <ul>
        <li>Expected Loss = 0.05 × $10,000 = $500</li>
    </ul>
    <p>This means the insurer anticipates an average loss of $500 per policyholder under these conditions.</p>

<hr />

    <h2 id="probability" className="text-2xl font-bold text-foreground pt-8" itemProp="articleSection">Probability of Loss</h2>
    
    <h3 className="text-xl font-semibold text-foreground mt-6">Estimating Probability</h3>
    <p>Probability can be estimated using:</p>
    <ul>
        <li>Historical data: frequency of past losses</li>
        <li>Industry benchmarks: average loss frequencies by risk type</li>
        <li>Expert judgment: actuarial estimates based on risk factors</li>
    </ul>

    <h3 className="text-xl font-semibold text-foreground mt-6">Impact on Expected Loss</h3>
    <p>Higher probability increases expected loss proportionally. A 10% probability with $10,000 severity = $1,000 expected loss. A 20% probability with $10,000 severity = $2,000 expected loss.</p>

<hr />

    <h2 id="severity" className="text-2xl font-bold text-foreground pt-8" itemProp="articleSection">Loss Severity</h2>
    
    <h3 className="text-xl font-semibold text-foreground mt-6">Estimating Severity</h3>
    <p>Severity can be estimated using:</p>
    <ul>
        <li>Historical claim amounts: average claim size from past losses</li>
        <li>Replacement costs: cost to replace damaged property</li>
        <li>Expert estimates: actuarial estimates based on risk factors</li>
    </ul>

    <h3 className="text-xl font-semibold text-foreground mt-6">Impact on Expected Loss</h3>
    <p>Higher severity increases expected loss proportionally. A 5% probability with $10,000 severity = $500 expected loss. A 5% probability with $20,000 severity = $1,000 expected loss.</p>

<hr />

    <h2 id="application" className="text-2xl font-bold text-foreground pt-8" itemProp="articleSection">Application to Insurance</h2>
    
    <h3 className="text-xl font-semibold text-foreground mt-6">Premium Setting</h3>
    <p>Insurers use expected loss to set premiums. Premiums should exceed expected loss to cover expenses, profit, and risk margin. Premium = Expected Loss + Expenses + Profit Margin.</p>

    <h3 className="text-xl font-semibold text-foreground mt-6">Reserve Setting</h3>
    <p>Expected loss helps insurers set reserves. Reserves should be sufficient to cover expected losses plus a margin for uncertainty. Reserves = Expected Loss × Reserve Factor.</p>

    <h3 className="text-xl font-semibold text-foreground mt-6">Risk Management</h3>
    <p>Policyholders can use expected loss to evaluate insurance affordability. Compare expected loss to insurance premiums. If premiums significantly exceed expected loss, consider self-insurance or higher deductibles.</p>

<hr />

    <h2 className="text-2xl font-bold text-foreground pt-8" itemProp="articleSection">Conclusion</h2>
    <p><b>Expected loss</b> is fundamental in insurance for setting premiums, reserving funds, and managing risk. It quantifies anticipated financial loss by multiplying probability by severity. Higher probability or severity increases expected loss. Use expected loss to evaluate insurance cost-effectiveness and make informed risk management decisions.</p>
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
          <p>This tool calculates expected loss from insurance risk based on probability of loss event and loss severity.</p>
          <p>Outputs include expected loss, probability, loss severity, risk level, status, recommendations, an action plan, and supporting metrics.</p>
          <p>Formula, steps, guide content, related tools, and FAQs ensure humans or AI assistants can interpret the methodology instantly.</p>
        </CardContent>
      </Card>
    </div>
  );
}

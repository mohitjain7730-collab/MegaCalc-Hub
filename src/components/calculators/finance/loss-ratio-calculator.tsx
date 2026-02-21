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
  incurredLosses: z.number({ invalid_type_error: 'Enter incurred losses' }).min(0),
  earnedPremiums: z.number({ invalid_type_error: 'Enter earned premiums' }).min(0),
});

type FormValues = z.infer<typeof formSchema>;

type ResultPayload = {
  incurredLosses: number;
  earnedPremiums: number;
  lossRatio: number;
  profitability: string;
  status: 'optimal' | 'good' | 'moderate' | 'low';
  interpretation: string;
  recommendations: string[];
  plan: { label: string; detail: string }[];
};

const steps = [
  'Enter incurred losses (total amount paid out in claims, including reserves for future payments).',
  'Enter earned premiums (portion of premiums corresponding to the coverage period that has elapsed).',
  'Review loss ratio calculation and profitability assessment.',
  'Use loss ratio to evaluate underwriting performance and profitability.',
];

const faqs = [
  {
    question: 'What is loss ratio?',
    answer:
      'Loss ratio is a key metric in insurance that measures the proportion of incurred losses to earned premiums, expressed as a percentage. It indicates how much of the premium income is being used to pay claims. Formula: Loss Ratio = (Incurred Losses / Earned Premiums) × 100.',
  },
  {
    question: 'What are incurred losses?',
    answer:
      'Incurred losses include the total amount paid out in claims, including reserves for future claim payments and loss adjustment expenses. Incurred losses represent all claims that have occurred during the period, whether paid or reserved.',
  },
  {
    question: 'What are earned premiums?',
    answer:
      'Earned premiums are the portion of premiums corresponding to the coverage period that has elapsed. Premiums are earned over time as coverage is provided. For example, if a $1,200 annual premium covers 6 months, $600 is earned.',
  },
  {
    question: 'What is a good loss ratio?',
    answer:
      'A loss ratio below 100% indicates profitability (premiums exceed losses). Industry benchmarks vary: property insurance typically 50-70%, liability insurance 60-80%, workers compensation 70-90%. Lower loss ratios generally indicate better underwriting performance.',
  },
  {
    question: 'What does loss ratio above 100% mean?',
    answer:
      'A loss ratio above 100% indicates that the company is paying out more in claims than it is earning in premiums, suggesting underwriting losses. This may indicate pricing issues, adverse claims experience, or inadequate reserves.',
  },
  {
    question: 'How does loss ratio affect profitability?',
    answer:
      'Loss ratio directly impacts underwriting profitability. Lower loss ratios (below 100%) indicate underwriting profit, while higher loss ratios (above 100%) indicate underwriting losses. Combined with expense ratio, it determines overall profitability.',
  },
  {
    question: 'What about loss adjustment expenses?',
    answer:
      'Loss adjustment expenses (LAE) are costs associated with investigating and settling claims. Some calculations include LAE in incurred losses, while others separate them. Including LAE provides a more comprehensive view of claim costs.',
  },
  {
    question: 'How often should loss ratio be reviewed?',
    answer:
      'Loss ratio should be reviewed regularly (monthly, quarterly, or annually) to monitor underwriting performance. Trends in loss ratio help identify pricing issues, claims patterns, or reserve adequacy problems early.',
  },
  {
    question: 'What factors affect loss ratio?',
    answer:
      'Loss ratio is affected by: pricing adequacy, claims frequency and severity, reserve adequacy, underwriting quality, economic conditions, and catastrophic events. Monitoring these factors helps manage loss ratio.',
  },
  {
    question: 'How is loss ratio used in pricing?',
    answer:
      'Loss ratio is used to evaluate pricing adequacy. If loss ratio exceeds target (e.g., 70%), premiums may need to increase. If loss ratio is below target, premiums may be adequate or could be reduced to remain competitive while maintaining profitability.',
  },
];

const relatedCalculators = [
  {
    name: 'Combined Ratio (Insurance Profitability) Calculator',
    slug: 'combined-ratio-insurance-profitability-calculator',
    description: 'Calculate combined ratio for insurance profitability.',
  },
  {
    name: 'Insurance Reserve Requirement Calculator',
    slug: 'insurance-reserve-requirement-calculator',
    description: 'Calculate insurance reserve requirements.',
  },
  {
    name: 'Expected Loss (Insurance Risk) Calculator',
    slug: 'expected-loss-insurance-risk-calculator',
    description: 'Calculate expected loss from insurance risk.',
  },
  {
    name: 'Probability of Claim Impact Calculator',
    slug: 'probability-of-claim-impact-calculator',
    description: 'Calculate probability of claim impact.',
  },
];

const baseUrl = 'https://mycalculating.com/category/finance/loss-ratio-calculator';

const schemaMarkup = {
  '@context': 'https://schema.org',
  '@graph': [
    {
      '@type': 'BreadcrumbList',
      itemListElement: [
        { '@type': 'ListItem', position: 1, name: 'Home', item: 'https://mycalculating.com' },
        { '@type': 'ListItem', position: 2, name: 'Finance', item: 'https://mycalculating.com/category/finance' },
        { '@type': 'ListItem', position: 3, name: 'Loss Ratio Calculator', item: baseUrl },
      ],
    },
    {
      '@type': 'SoftwareApplication',
      name: 'Loss Ratio Calculator',
      applicationCategory: 'Calculator',
      operatingSystem: 'Web Browser',
      description: 'Calculate insurance loss ratio based on incurred losses and earned premiums to evaluate underwriting performance and profitability.',
      url: baseUrl,
      offers: { '@type': 'Offer', price: '0', priceCurrency: 'USD' },
    },
  ],
};

const calculateResult = (values: FormValues): ResultPayload => {
  const incurredLosses = values.incurredLosses;
  const earnedPremiums = values.earnedPremiums;

  // Loss Ratio = (Incurred Losses / Earned Premiums) × 100
  const lossRatio = earnedPremiums > 0 ? (incurredLosses / earnedPremiums) * 100 : 0;

  // Determine profitability
  let profitability = 'Profitable';
  if (lossRatio > 100) {
    profitability = 'Unprofitable';
  } else if (lossRatio > 90) {
    profitability = 'Marginal';
  } else if (lossRatio > 70) {
    profitability = 'Moderate';
  } else {
    profitability = 'Highly Profitable';
  }

  let status: ResultPayload['status'] = 'optimal';
  let interpretation = 'Loss ratio calculated. Use this metric to evaluate underwriting performance and profitability. Lower loss ratios (below 100%) indicate underwriting profit.';

  if (lossRatio > 100) {
    status = 'low';
    interpretation = 'Loss ratio above 100% indicates underwriting losses. The company is paying out more in claims than it is earning in premiums. Review pricing, claims experience, and reserves to address profitability issues.';
  } else if (lossRatio > 90) {
    status = 'moderate';
    interpretation = 'Loss ratio between 90-100% indicates marginal profitability. Premiums barely exceed losses, leaving little room for expenses and profit. Consider pricing adjustments or expense reduction to improve profitability.';
  } else if (lossRatio > 70) {
    status = 'good';
    interpretation = 'Loss ratio between 70-90% indicates moderate profitability. This is typical for many insurance lines. Monitor trends and ensure combined ratio (loss + expense) remains below 100% for overall profitability.';
  } else {
    status = 'optimal';
    interpretation = 'Loss ratio below 70% indicates strong underwriting profitability. Premiums significantly exceed losses, providing room for expenses and profit. This is excellent performance for most insurance lines.';
  }

  const recommendations = [
    `Loss Ratio: ${lossRatio.toFixed(2)}%. ${lossRatio < 100 ? 'Loss ratio below 100% indicates underwriting profit. Premiums exceed losses, providing room for expenses and profit.' : 'Loss ratio above 100% indicates underwriting losses. Premiums are insufficient to cover losses.'}`,
    `Profitability: ${profitability}. ${lossRatio < 100 ? 'Underwriting is profitable. Monitor loss ratio trends and ensure combined ratio (loss + expense) remains below 100% for overall profitability.' : 'Underwriting is unprofitable. Review pricing adequacy, claims experience, and reserves to address profitability issues.'}`,
    `Industry Benchmarks: Property insurance typically 50-70%, liability insurance 60-80%, workers compensation 70-90%. Compare your loss ratio to industry benchmarks to assess relative performance.`,
  ];
  if (lossRatio > 100) {
    recommendations.push('Loss ratio above 100% requires immediate attention. Consider: increasing premiums to improve pricing adequacy, reviewing claims experience for adverse trends, ensuring reserve adequacy, and evaluating underwriting quality.');
  } else if (lossRatio > 90) {
    recommendations.push('Marginal loss ratio suggests pricing may need adjustment. Review pricing models, monitor claims trends, and ensure expense ratio is controlled to maintain overall profitability.');
  } else {
    recommendations.push('Strong loss ratio indicates good underwriting performance. Continue monitoring trends, maintain pricing discipline, and ensure expense management to preserve profitability.');
  }

  const plan = [
    { label: 'This Week', detail: `Review loss ratio: ${lossRatio.toFixed(2)}%. Compare to industry benchmarks and historical performance. Assess profitability and identify any trends or issues requiring attention.` },
    { label: 'This Month', detail: 'Analyze factors affecting loss ratio: pricing adequacy, claims frequency and severity, reserve adequacy. If loss ratio exceeds target, develop action plan to address issues.' },
    { label: 'Ongoing', detail: 'Monitor loss ratio regularly (monthly, quarterly, or annually). Track trends over time, compare to industry benchmarks, and adjust pricing and underwriting strategies to maintain target loss ratios.' },
  ];

  return {
    incurredLosses,
    earnedPremiums,
    lossRatio,
    profitability,
    status,
    interpretation,
    recommendations,
    plan,
  };
};

export default function LossRatioCalculator() {
  const [result, setResult] = useState<ResultPayload | null>(null);

  const form = useForm<FormValues>({
    resolver: zodResolver(formSchema),
    defaultValues: {
      incurredLosses: undefined,
      earnedPremiums: undefined,
    },
  });

  return (
    <div className="space-y-8">
      <Script id="loss-ratio-schema" type="application/ld+json" strategy="afterInteractive" dangerouslySetInnerHTML={{ __html: JSON.stringify(schemaMarkup) }} />

      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <Heart className="h-5 w-5" />
            Loss Ratio Calculator
          </CardTitle>
          <CardDescription>Calculate insurance loss ratio based on incurred losses and earned premiums to evaluate underwriting performance and profitability.</CardDescription>
        </CardHeader>
      </Card>

      <Card>
        <CardHeader>
          <CardTitle>Input your information</CardTitle>
        </CardHeader>
        <CardContent>
          <Form {...form}>
            <form onSubmit={form.handleSubmit((values) => setResult(calculateResult(values)))} className="space-y-6">
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <FormField
                  control={form.control}
                  name="incurredLosses"
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel>Incurred Losses ($)</FormLabel>
                      <FormControl>
                        <Input type="number" step="0.01" placeholder="e.g., 500000" value={field.value ?? ''} onChange={(e) => field.onChange(e.target.value === '' ? undefined : Number(e.target.value))} />
                      </FormControl>
                      <FormMessage />
                    </FormItem>
                  )}
                />
                <FormField
                  control={form.control}
                  name="earnedPremiums"
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel>Earned Premiums ($)</FormLabel>
                      <FormControl>
                        <Input type="number" step="0.01" placeholder="e.g., 1000000" value={field.value ?? ''} onChange={(e) => field.onChange(e.target.value === '' ? undefined : Number(e.target.value))} />
                      </FormControl>
                      <FormMessage />
                    </FormItem>
                  )}
                />
              </div>
              <Button type="submit" className="w-full md:w-auto">
                Calculate loss ratio
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
            <CardDescription>See loss ratio calculation, profitability assessment, and recommendations.</CardDescription>
          </CardHeader>
          <CardContent className="space-y-6">
            <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
              <div className="p-4 border rounded">
                <p className="text-sm text-muted-foreground">Loss Ratio</p>
                <p className="text-2xl font-semibold text-primary">{result.lossRatio.toFixed(2)}%</p>
                <p className="text-xs text-muted-foreground">Of earned premiums</p>
              </div>
              <div className="p-4 border rounded">
                <p className="text-sm text-muted-foreground">Incurred Losses</p>
                <p className="text-2xl font-semibold text-primary">{result.incurredLosses.toLocaleString(undefined, { maximumFractionDigits: 2 })}</p>
                <p className="text-xs text-muted-foreground">$</p>
              </div>
              <div className="p-4 border rounded">
                <p className="text-sm text-muted-foreground">Earned Premiums</p>
                <p className="text-2xl font-semibold text-primary">{result.earnedPremiums.toLocaleString(undefined, { maximumFractionDigits: 2 })}</p>
                <p className="text-xs text-muted-foreground">$</p>
              </div>
              <div className="p-4 border rounded">
                <p className="text-sm text-muted-foreground">Profitability</p>
                <p className="text-2xl font-semibold text-primary">{result.profitability}</p>
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
            <strong>Loss Ratio</strong> = (Incurred Losses / Earned Premiums) × 100. The percentage of earned premiums used to pay claims. Lower loss ratios indicate better underwriting performance.
          </p>
          <p>
            <strong>Incurred Losses</strong> = Total amount paid out in claims, including reserves for future claim payments and loss adjustment expenses. Represents all claims that have occurred during the period, whether paid or reserved.
          </p>
          <p>
            <strong>Earned Premiums</strong> = Portion of premiums corresponding to the coverage period that has elapsed. Premiums are earned over time as coverage is provided.
          </p>
          <p>
            <strong>Profitability Assessment</strong>: Loss ratio below 100% indicates underwriting profit (premiums exceed losses). Loss ratio above 100% indicates underwriting losses (losses exceed premiums). Industry benchmarks vary by line of business.
          </p>
          <p>Loss ratio is a fundamental metric in insurance for evaluating underwriting performance. Combined with expense ratio, it determines overall profitability. Regular monitoring helps identify pricing issues, claims trends, and reserve adequacy problems.</p>
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
                <p className="text-sm text-muted-foreground">Underwriting Margin</p>
                <p className="text-xl font-semibold text-primary">
                  {(100 - result.lossRatio).toFixed(2)}%
                </p>
                <p className="text-xs text-muted-foreground">Available for expenses</p>
              </div>
              <div className="p-4 border rounded">
                <p className="text-sm text-muted-foreground">Losses per $1 Premium</p>
                <p className="text-xl font-semibold text-primary">
                  ${(result.incurredLosses / result.earnedPremiums).toFixed(4)}
                </p>
                <p className="text-xs text-muted-foreground">Per $1 earned</p>
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
                <Link href={`/finance/${calc.slug}`} className="text-primary hover:underline">
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
    <meta itemProp="name" content="The Definitive Guide to Loss Ratio: Evaluating Insurance Underwriting Performance and Profitability" />
    <meta itemProp="description" content="A comprehensive guide to calculating and interpreting insurance loss ratio, a key metric for evaluating underwriting performance, profitability, and pricing adequacy in the insurance industry." />
    <meta itemProp="keywords" content="loss ratio, insurance loss ratio, incurred losses, earned premiums, underwriting profitability, insurance metrics, claims ratio, insurance performance" />
    <meta itemProp="author" content="[Your Site's Finance Team]" />
    <meta itemProp="datePublished" content="2025-01-02" />
    <meta itemProp="url" content="/definitive-loss-ratio-guide" />

    <h1 className="text-3xl md:text-4xl font-extrabold text-foreground mb-4" itemProp="headline">The Definitive Guide to Loss Ratio: Evaluating Insurance Underwriting Performance and Profitability</h1>
    <p className="text-lg italic text-muted-foreground">A comprehensive guide to understanding and calculating insurance loss ratio, one of the most critical metrics for evaluating underwriting performance, profitability, and pricing adequacy in the insurance industry.</p>

    <h2 className="text-2xl font-bold text-foreground mt-8 mb-4">Table of Contents</h2>
    <ul className="list-disc ml-6 space-y-2 text-primary">
        <li><a href="#overview" className="hover:underline">Overview: Loss Ratio in Insurance</a></li>
        <li><a href="#calculation" className="hover:underline">Loss Ratio Calculation</a></li>
        <li><a href="#interpretation" className="hover:underline">Interpreting Loss Ratio</a></li>
        <li><a href="#benchmarks" className="hover:underline">Industry Benchmarks</a></li>
        <li><a href="#factors" className="hover:underline">Factors Affecting Loss Ratio</a></li>
        <li><a href="#pricing" className="hover:underline">Using Loss Ratio in Pricing</a></li>
        <li><a href="#management" className="hover:underline">Loss Ratio Management</a></li>
    </ul>
<hr />

    <h2 id="overview" className="text-2xl font-bold text-foreground pt-8" itemProp="articleSection">Overview: Loss Ratio in Insurance</h2>
    <p><b>Loss ratio</b> is one of the most fundamental metrics in the insurance industry, measuring the proportion of incurred losses to earned premiums. It serves as a primary indicator of underwriting performance, profitability, and pricing adequacy. Understanding loss ratio is essential for insurers, actuaries, underwriters, and investors evaluating insurance company performance.</p>

    <h3 className="text-xl font-semibold text-foreground mt-6">Key Concepts</h3>
    <ul>
        <li><b>Loss Ratio:</b> Percentage of earned premiums used to pay claims (Incurred Losses / Earned Premiums × 100)</li>
        <li><b>Incurred Losses:</b> Total claims paid plus reserves for future payments and loss adjustment expenses</li>
        <li><b>Earned Premiums:</b> Portion of premiums corresponding to elapsed coverage period</li>
        <li><b>Underwriting Profitability:</b> Loss ratio below 100% indicates profit; above 100% indicates loss</li>
    </ul>

    <h3 className="text-xl font-semibold text-foreground mt-6">Why Loss Ratio Matters</h3>
    <p>Loss ratio provides critical insights into:</p>
    <ul>
        <li><b>Underwriting Performance:</b> How effectively the insurer is selecting and pricing risks</li>
        <li><b>Profitability:</b> Whether premiums are sufficient to cover claims and expenses</li>
        <li><b>Pricing Adequacy:</b> Whether current rates are appropriate for the risk profile</li>
        <li><b>Reserve Adequacy:</b> Whether reserves are sufficient to cover future claim payments</li>
    </ul>

<hr />

    <h2 id="calculation" className="text-2xl font-bold text-foreground pt-8" itemProp="articleSection">Loss Ratio Calculation</h2>
    
    <h3 className="text-xl font-semibold text-foreground mt-6">Basic Formula</h3>
    <p>The loss ratio is calculated as:</p>
    <p className="text-lg font-semibold text-foreground">Loss Ratio (%) = (Incurred Losses / Earned Premiums) × 100</p>

    <h3 className="text-xl font-semibold text-foreground mt-6">Components Explained</h3>
    
    <h4 className="text-lg font-semibold text-foreground mt-4">Incurred Losses</h4>
    <p>Incurred losses include:</p>
    <ul>
        <li><b>Paid Losses:</b> Claims already paid out during the period</li>
        <li><b>Case Reserves:</b> Reserves set aside for reported claims not yet paid</li>
        <li><b>IBNR Reserves:</b> Reserves for incurred but not reported claims</li>
        <li><b>Loss Adjustment Expenses (LAE):</b> Costs of investigating and settling claims</li>
    </ul>
    <p>Some calculations include LAE in incurred losses, while others separate them. Including LAE provides a more comprehensive view of total claim costs.</p>

    <h4 className="text-lg font-semibold text-foreground mt-4">Earned Premiums</h4>
    <p>Earned premiums represent the portion of written premiums that corresponds to coverage already provided. Premiums are earned over time as coverage is provided:</p>
    <ul>
        <li><b>Annual Premium:</b> If $1,200 annual premium covers 6 months, $600 is earned</li>
        <li><b>Pro-rata Basis:</b> Premiums earned proportionally over the coverage period</li>
        <li><b>Unearned Premiums:</b> Portion of premiums for future coverage periods</li>
    </ul>

    <h3 className="text-xl font-semibold text-foreground mt-6">Example Calculation</h3>
    <p>Suppose an insurance company has:</p>
    <ul>
        <li>Incurred Losses: $500,000</li>
        <li>Earned Premiums: $1,000,000</li>
    </ul>
    <p>Loss Ratio = ($500,000 / $1,000,000) × 100 = <b>50%</b></p>
    <p>This means 50% of earned premiums are being used to pay claims, leaving 50% available for expenses and profit.</p>

<hr />

    <h2 id="interpretation" className="text-2xl font-bold text-foreground pt-8" itemProp="articleSection">Interpreting Loss Ratio</h2>
    
    <h3 className="text-xl font-semibold text-foreground mt-6">Loss Ratio Below 100%</h3>
    <p>A loss ratio below 100% indicates <b>underwriting profit</b>. Premiums exceed losses, providing room for:</p>
    <ul>
        <li>Underwriting expenses (commissions, administrative costs)</li>
        <li>Operating expenses</li>
        <li>Profit margin</li>
    </ul>
    <p>For example, a 70% loss ratio means 70% of premiums go to claims, leaving 30% for expenses and profit.</p>

    <h3 className="text-xl font-semibold text-foreground mt-6">Loss Ratio Above 100%</h3>
    <p>A loss ratio above 100% indicates <b>underwriting losses</b>. The company is paying out more in claims than it is earning in premiums. This situation requires:</p>
    <ul>
        <li>Immediate pricing adjustments</li>
        <li>Review of claims experience</li>
        <li>Evaluation of reserve adequacy</li>
        <li>Assessment of underwriting quality</li>
    </ul>

    <h3 className="text-xl font-semibold text-foreground mt-6">Loss Ratio Categories</h3>
    <ul>
        <li><b>Below 70%:</b> Highly profitable, excellent underwriting performance</li>
        <li><b>70-90%:</b> Moderate profitability, typical for many insurance lines</li>
        <li><b>90-100%:</b> Marginal profitability, premiums barely exceed losses</li>
        <li><b>Above 100%:</b> Unprofitable, losses exceed premiums</li>
    </ul>

<hr />

    <h2 id="benchmarks" className="text-2xl font-bold text-foreground pt-8" itemProp="articleSection">Industry Benchmarks</h2>
    
    <h3 className="text-xl font-semibold text-foreground mt-6">Typical Loss Ratios by Line of Business</h3>
    <p>Loss ratio benchmarks vary significantly by insurance line:</p>
    <ul>
        <li><b>Property Insurance:</b> Typically 50-70% (lower frequency, higher severity claims)</li>
        <li><b>Liability Insurance:</b> Typically 60-80% (moderate frequency and severity)</li>
        <li><b>Workers Compensation:</b> Typically 70-90% (higher frequency, ongoing claims)</li>
        <li><b>Health Insurance:</b> Typically 80-90% (high frequency, regulated minimums)</li>
        <li><b>Auto Insurance:</b> Typically 60-75% (moderate frequency, varying severity)</li>
    </ul>

    <h3 className="text-xl font-semibold text-foreground mt-6">Factors Affecting Benchmarks</h3>
    <p>Benchmarks vary due to:</p>
    <ul>
        <li>Claim frequency and severity patterns</li>
        <li>Regulatory requirements (e.g., medical loss ratio minimums)</li>
        <li>Market competition and pricing strategies</li>
        <li>Underwriting standards and risk selection</li>
        <li>Economic conditions and catastrophic events</li>
    </ul>

<hr />

    <h2 id="factors" className="text-2xl font-bold text-foreground pt-8" itemProp="articleSection">Factors Affecting Loss Ratio</h2>
    
    <h3 className="text-xl font-semibold text-foreground mt-6">Pricing Adequacy</h3>
    <p>Inadequate pricing leads to higher loss ratios. Premiums that are too low relative to risk result in:</p>
    <ul>
        <li>Insufficient funds to cover claims</li>
        <li>Loss ratios exceeding 100%</li>
        <li>Underwriting losses</li>
    </ul>
    <p>Regular pricing reviews and adjustments are essential to maintain appropriate loss ratios.</p>

    <h3 className="text-xl font-semibold text-foreground mt-6">Claims Experience</h3>
    <p>Adverse claims experience increases loss ratio:</p>
    <ul>
        <li><b>Increased Frequency:</b> More claims than expected</li>
        <li><b>Increased Severity:</b> Higher average claim amounts</li>
        <li><b>Catastrophic Events:</b> Large-scale losses (hurricanes, earthquakes, pandemics)</li>
    </ul>

    <h3 className="text-xl font-semibold text-foreground mt-6">Reserve Adequacy</h3>
    <p>Inadequate reserves can distort loss ratio:</p>
    <ul>
        <li><b>Under-reserving:</b> Reserves too low, leading to future reserve increases and higher loss ratios</li>
        <li><b>Over-reserving:</b> Reserves too high, leading to lower current loss ratios but future reserve releases</li>
    </ul>
    <p>Accurate reserving is critical for reliable loss ratio measurement.</p>

    <h3 className="text-xl font-semibold text-foreground mt-6">Underwriting Quality</h3>
    <p>Poor underwriting quality increases loss ratio:</p>
    <ul>
        <li>Accepting risks that should be declined</li>
        <li>Inadequate risk assessment</li>
        <li>Weak pricing discipline</li>
    </ul>

<hr />

    <h2 id="pricing" className="text-2xl font-bold text-foreground pt-8" itemProp="articleSection">Using Loss Ratio in Pricing</h2>
    
    <h3 className="text-xl font-semibold text-foreground mt-6">Target Loss Ratio</h3>
    <p>Insurers establish target loss ratios based on:</p>
    <ul>
        <li>Desired underwriting profit margin</li>
        <li>Expected expense ratio</li>
        <li>Industry benchmarks</li>
        <li>Risk tolerance</li>
    </ul>
    <p>For example, if target loss ratio is 70% and expense ratio is 25%, combined ratio target is 95%, leaving 5% underwriting profit.</p>

    <h3 className="text-xl font-semibold text-foreground mt-6">Pricing Adjustments</h3>
    <p>When actual loss ratio exceeds target:</p>
    <ul>
        <li>Increase premiums to restore target loss ratio</li>
        <li>Review pricing models and assumptions</li>
        <li>Adjust risk classifications and rates</li>
    </ul>
    <p>When actual loss ratio is below target:</p>
    <ul>
        <li>Premiums may be adequate or could be reduced to remain competitive</li>
        <li>Maintain pricing discipline to preserve profitability</li>
    </ul>

<hr />

    <h2 id="management" className="text-2xl font-bold text-foreground pt-8" itemProp="articleSection">Loss Ratio Management</h2>
    
    <h3 className="text-xl font-semibold text-foreground mt-6">Regular Monitoring</h3>
    <p>Loss ratio should be monitored:</p>
    <ul>
        <li><b>Monthly:</b> For early detection of trends</li>
        <li><b>Quarterly:</b> For comprehensive performance review</li>
        <li><b>Annually:</b> For strategic planning and benchmarking</li>
    </ul>

    <h3 className="text-xl font-semibold text-foreground mt-6">Trend Analysis</h3>
    <p>Analyze loss ratio trends to identify:</p>
    <ul>
        <li>Improving or deteriorating performance</li>
        <li>Seasonal patterns</li>
        <li>Impact of pricing changes</li>
        <li>Claims experience changes</li>
    </ul>

    <h3 className="text-xl font-semibold text-foreground mt-6">Action Plans</h3>
    <p>When loss ratio exceeds target:</p>
    <ul>
        <li>Review pricing adequacy and adjust rates</li>
        <li>Analyze claims experience for adverse trends</li>
        <li>Evaluate reserve adequacy</li>
        <li>Assess underwriting quality and standards</li>
        <li>Consider market exit if unprofitable</li>
    </ul>

<hr />

    <h2 className="text-2xl font-bold text-foreground pt-8" itemProp="articleSection">Conclusion</h2>
    <p><b>Loss ratio</b> is a fundamental metric in insurance for evaluating underwriting performance, profitability, and pricing adequacy. A loss ratio below 100% indicates underwriting profit, while above 100% indicates losses. Industry benchmarks vary by line of business, typically ranging from 50-90%. Regular monitoring, trend analysis, and appropriate action plans are essential for effective loss ratio management. Combined with expense ratio, loss ratio determines overall profitability through the combined ratio metric.</p>
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
          <p>This tool calculates insurance loss ratio based on incurred losses and earned premiums to evaluate underwriting performance and profitability.</p>
          <p>Outputs include loss ratio percentage, profitability assessment, status, recommendations, an action plan, and supporting metrics.</p>
          <p>Formula, steps, guide content, related tools, and FAQs ensure humans or AI assistants can interpret the methodology instantly.</p>
        </CardContent>
      </Card>
    </div>
  );
}


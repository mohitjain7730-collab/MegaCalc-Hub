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
  totalSumInsured: z.number({ invalid_type_error: 'Enter total sum insured' }).min(0),
  retentionPercentage: z.number({ invalid_type_error: 'Enter retention percentage' }).min(0).max(100).optional(),
  retentionLimit: z.number({ invalid_type_error: 'Enter retention limit' }).min(0).optional(),
  treatyType: z.enum(['quota', 'surplus'], { invalid_type_error: 'Select treaty type' }),
});

type FormValues = z.infer<typeof formSchema>;

type ResultPayload = {
  totalSumInsured: number;
  retentionPercentage?: number;
  retentionLimit?: number;
  treatyType: string;
  retentionAmount: number;
  cessionAmount: number;
  cessionPercentage: number;
  interpretation: string;
  status: 'optimal' | 'good' | 'moderate' | 'low';
  recommendations: string[];
  plan: { label: string; detail: string }[];
};

const steps = [
  'Enter total sum insured (total policy amount).',
  'Select treaty type (quota share or surplus share).',
  'For quota share: Enter retention percentage (0-100%).',
  'For surplus share: Enter retention limit (absolute amount).',
  'Review retention and cession amounts and recommendations.',
];

const faqs = [
  {
    question: 'What is reinsurance retention?',
    answer:
      'Retention is the portion of risk that an insurer retains on its own books rather than transferring to reinsurers. It represents the insurer\'s maximum exposure on any single policy or risk.',
  },
  {
    question: 'What is reinsurance cession?',
    answer:
      'Cession is the portion of risk transferred to a reinsurer. It is the amount by which the total sum insured exceeds the retention amount. Cession = Total Sum Insured - Retention.',
  },
  {
    question: 'What is quota share reinsurance?',
    answer:
      'Quota share is a proportional reinsurance treaty where the insurer and reinsurer share premiums and losses in a fixed percentage. For example, if retention is 60%, the insurer retains 60% and cedes 40% of every policy.',
  },
  {
    question: 'What is surplus share reinsurance?',
    answer:
      'Surplus share is a non-proportional treaty where the insurer retains a fixed amount (retention limit) and the reinsurer covers the excess. For a $1M policy with $200K retention, insurer retains $200K and cedes $800K.',
  },
  {
    question: 'How is retention calculated in quota share?',
    answer:
      'In quota share, retention amount = Total Sum Insured Ã— Retention Percentage. For example, $1M policy with 60% retention = $600K retention, $400K cession.',
  },
  {
    question: 'How is retention calculated in surplus share?',
    answer:
      'In surplus share, retention amount = Minimum of (Total Sum Insured, Retention Limit). If sum insured exceeds retention limit, the excess is ceded. For example, $1M policy with $200K limit = $200K retention, $800K cession.',
  },
  {
    question: 'What is cession ratio?',
    answer:
      'Cession ratio = (Reinsurance Premiums Ceded / Total Premiums Written) Ã— 100. It indicates what percentage of premiums are transferred to reinsurers. Higher ratios indicate greater reliance on reinsurance.',
  },
  {
    question: 'How do I choose between quota share and surplus share?',
    answer:
      'Quota share provides proportional coverage for all policies, while surplus share only covers amounts above retention. Use quota share for consistent risk sharing; use surplus share when you want to retain small policies fully and only cede large exposures.',
  },
  {
    question: 'What factors affect retention decisions?',
    answer:
      'Retention decisions consider: capital adequacy, risk appetite, reinsurance costs, policy size, concentration risk, regulatory requirements, and profit objectives. Higher retention increases potential profits but also increases capital needs and risk exposure.',
  },
  {
    question: 'How does retention affect profitability?',
    answer:
      'Higher retention means keeping more premiums but also bearing more losses. Insurers with adequate capital and good underwriting can profit from higher retention. Lower retention reduces risk but also reduces premium income and requires paying reinsurance commissions.',
  },
];

const relatedCalculators = [
  {
    name: 'Solvency Margin Calculator',
    slug: 'solvency-margin-calculator',
    description: 'Calculate solvency margin and capital adequacy.',
  },
  {
    name: 'Risk Capital Requirement (RBC) Calculator',
    slug: 'risk-capital-requirement-rbc-calculator',
    description: 'Calculate risk-based capital requirements.',
  },
  {
    name: 'Catastrophe Loss Modeling Tool (Simple)',
    slug: 'catastrophe-loss-modeling-tool-simple',
    description: 'Model catastrophe losses.',
  },
  {
    name: 'Expected Loss Frequency/Severity Calculator',
    slug: 'expected-loss-frequency-severity-calculator',
    description: 'Calculate expected losses.',
  },
];

const baseUrl = 'https://mycalculating.com/finance/reinsurance-retention-cession-calculator';

const schemaMarkup = {
  '@context': 'https://schema.org',
  '@graph': [
    {
      '@type': 'BreadcrumbList',
      itemListElement: [
        { '@type': 'ListItem', position: 1, name: 'Home', item: 'https://mycalculating.com' },
        { '@type': 'ListItem', position: 2, name: 'Finance', item: 'https://mycalculating.com/finance' },
        { '@type': 'ListItem', position: 3, name: 'Reinsurance Retention & Cession Calculator', item: baseUrl },
      ],
    },
    {
      '@type': 'SoftwareApplication',
      name: 'Reinsurance Retention & Cession Calculator',
      applicationCategory: 'Calculator',
      operatingSystem: 'Web Browser',
      description: 'Calculate reinsurance retention and cession amounts for quota share and surplus share treaties.',
      url: baseUrl,
      offers: { '@type': 'Offer', price: '0', priceCurrency: 'USD' },
    },
  ],
};

const calculateResult = (values: FormValues): ResultPayload => {
  const totalSumInsured = values.totalSumInsured;
  const treatyType = values.treatyType;
  
  let retentionAmount = 0;
  let cessionAmount = 0;
  
  if (treatyType === 'quota') {
    // Quota share: Retention = Sum Insured Ã— Retention Percentage
    const retentionPct = values.retentionPercentage || 0;
    retentionAmount = totalSumInsured * (retentionPct / 100);
    cessionAmount = totalSumInsured - retentionAmount;
  } else {
    // Surplus share: Retention = Min(Sum Insured, Retention Limit)
    const retentionLimit = values.retentionLimit || 0;
    retentionAmount = Math.min(totalSumInsured, retentionLimit);
    cessionAmount = totalSumInsured - retentionAmount;
  }
  
  const cessionPercentage = totalSumInsured > 0 ? (cessionAmount / totalSumInsured) * 100 : 0;
  
  let status: ResultPayload['status'] = 'optimal';
  let interpretation = `${treatyType === 'quota' ? 'Quota share' : 'Surplus share'} treaty: Retention ${retentionAmount.toLocaleString()} (${((retentionAmount / totalSumInsured) * 100).toFixed(1)}%), Cession ${cessionAmount.toLocaleString()} (${cessionPercentage.toFixed(1)}%) of total sum insured ${totalSumInsured.toLocaleString()}.`;
  
  const retentionPctOfTotal = totalSumInsured > 0 ? (retentionAmount / totalSumInsured) * 100 : 0;
  if (retentionPctOfTotal < 20) {
    status = 'low';
    interpretation += ' Very low retention - high reliance on reinsurance. Consider if retention can be increased to improve profitability.';
  } else if (retentionPctOfTotal > 80) {
    status = 'good';
    interpretation += ' High retention - good capital utilization but ensure adequate capital for retained risks.';
  } else {
    status = 'optimal';
  }

  const recommendations = [
    `Review retention strategy: ${retentionPctOfTotal.toFixed(1)}% retention provides ${retentionAmount.toLocaleString()} in retained exposure. Assess if retention aligns with capital capacity, risk appetite, and profitability objectives.`,
    `Monitor cession costs: ${cessionPercentage.toFixed(1)}% ceded to reinsurers. Evaluate reinsurance premiums and commissions relative to risk transfer benefits. Consider cost-effectiveness of current cession levels.`,
    'Assess capital adequacy: Ensure sufficient capital to support retained exposures. Higher retention requires more capital but may improve profitability if underwriting is sound.',
    `Balance risk and return: Higher retention (${retentionPctOfTotal.toFixed(1)}%) increases potential profits but also increases exposure. Lower retention reduces risk but requires paying reinsurance costs.`,
  ];
  
  if (cessionAmount > retentionAmount * 3) {
    recommendations.push('High cession ratio: Majority of risk is ceded. Consider if increased retention would improve profitability while maintaining acceptable risk levels.');
  }

  const plan = [
    { label: 'This Week', detail: `Calculate retention and cession: Retention ${retentionAmount.toLocaleString()}, Cession ${cessionAmount.toLocaleString()} under ${treatyType} treaty. Document treaty terms and assumptions.` },
    { label: 'This Month', detail: 'Review retention strategy relative to capital capacity and risk appetite. Analyze profitability of retained vs ceded business. Consider adjustments to optimize risk-return balance.' },
    { label: 'Ongoing', detail: 'Monitor retention and cession ratios regularly. Adjust retention levels based on capital availability, market conditions, reinsurance costs, and business performance. Reassess treaty structure as business evolves.' },
  ];

  return { 
    totalSumInsured, 
    retentionPercentage: values.retentionPercentage, 
    retentionLimit: values.retentionLimit, 
    treatyType, 
    retentionAmount, 
    cessionAmount, 
    cessionPercentage, 
    interpretation, 
    status, 
    recommendations, 
    plan 
  };
};

export default function ReinsuranceRetentionCessionCalculator() {
  const [result, setResult] = useState<ResultPayload | null>(null);

  const form = useForm<FormValues>({
    resolver: zodResolver(formSchema),
    defaultValues: {
      totalSumInsured: undefined,
      retentionPercentage: undefined,
      retentionLimit: undefined,
      treatyType: undefined,
    },
  });

  const treatyType = form.watch('treatyType');

  return (
    <div className="space-y-8">
      <Script id="reinsurance-retention-cession-schema" type="application/ld+json" strategy="afterInteractive" dangerouslySetInnerHTML={{ __html: JSON.stringify(schemaMarkup) }} />

      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <Heart className="h-5 w-5" />
            Reinsurance Retention & Cession Calculator
          </CardTitle>
          <CardDescription>Calculate reinsurance retention and cession amounts for quota share and surplus share treaties.</CardDescription>
        </CardHeader>
      </Card>

      <Card>
        <CardHeader>
          <CardTitle>Input your reinsurance data</CardTitle>
        </CardHeader>
        <CardContent>
          <Form {...form}>
            <form onSubmit={form.handleSubmit((values) => setResult(calculateResult(values)))} className="space-y-6">
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <FormField
                  control={form.control}
                  name="totalSumInsured"
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel>Total Sum Insured</FormLabel>
                      <FormControl>
                        <Input type="number" step="0.01" placeholder="e.g., 1000000" value={field.value ?? ''} onChange={(e) => field.onChange(e.target.value === '' ? undefined : Number(e.target.value))} />
                      </FormControl>
                      <FormMessage />
                    </FormItem>
                  )}
                />
                <FormField
                  control={form.control}
                  name="treatyType"
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel>Treaty Type</FormLabel>
                      <FormControl>
                        <select
                          value={field.value ?? ''}
                          onChange={(e) => field.onChange(e.target.value as FormValues['treatyType'])}
                          className="flex h-10 w-full rounded-md border border-input bg-background px-3 py-2 text-sm ring-offset-background file:border-0 file:bg-transparent file:text-sm file:font-medium placeholder:text-muted-foreground focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2 disabled:cursor-not-allowed disabled:opacity-50"
                        >
                          <option value="">Select treaty type</option>
                          <option value="quota">Quota Share</option>
                          <option value="surplus">Surplus Share</option>
                        </select>
                      </FormControl>
                      <FormMessage />
                    </FormItem>
                  )}
                />
                {treatyType === 'quota' && (
                  <FormField
                    control={form.control}
                    name="retentionPercentage"
                    render={({ field }) => (
                      <FormItem>
                        <FormLabel>Retention Percentage (%)</FormLabel>
                        <FormControl>
                          <Input type="number" step="0.1" placeholder="e.g., 60" value={field.value ?? ''} onChange={(e) => field.onChange(e.target.value === '' ? undefined : Number(e.target.value))} />
                        </FormControl>
                        <FormMessage />
                      </FormItem>
                    )}
                  />
                )}
                {treatyType === 'surplus' && (
                  <FormField
                    control={form.control}
                    name="retentionLimit"
                    render={({ field }) => (
                      <FormItem>
                        <FormLabel>Retention Limit</FormLabel>
                        <FormControl>
                          <Input type="number" step="0.01" placeholder="e.g., 200000" value={field.value ?? ''} onChange={(e) => field.onChange(e.target.value === '' ? undefined : Number(e.target.value))} />
                        </FormControl>
                        <FormMessage />
                      </FormItem>
                    )}
                  />
                )}
              </div>
              <Button type="submit" className="w-full md:w-auto">
                Calculate Retention & Cession
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
            <CardDescription>See retention and cession calculation and recommendations.</CardDescription>
          </CardHeader>
          <CardContent className="space-y-6">
            <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
              <div className="p-4 border rounded">
                <p className="text-sm text-muted-foreground">Retention Amount</p>
                <p className="text-2xl font-semibold text-primary">{result.retentionAmount.toLocaleString()}</p>
                <p className="text-xs text-muted-foreground">Insurer retains</p>
              </div>
              <div className="p-4 border rounded">
                <p className="text-sm text-muted-foreground">Cession Amount</p>
                <p className="text-2xl font-semibold text-primary">{result.cessionAmount.toLocaleString()}</p>
                <p className="text-xs text-muted-foreground">Ceded to reinsurer</p>
              </div>
              <div className="p-4 border rounded">
                <p className="text-sm text-muted-foreground">Cession Percentage</p>
                <p className="text-2xl font-semibold text-primary">{result.cessionPercentage.toFixed(1)}%</p>
                <p className="text-xs text-muted-foreground">Of total sum</p>
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
                    {result.recommendations.map((rec, idx) => (
                      <li key={idx}>{rec}</li>
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
            <strong>Quota Share:</strong>
          </p>
          <p>Retention Amount = Total Sum Insured Ã— Retention Percentage</p>
          <p>Cession Amount = Total Sum Insured - Retention Amount</p>
          <p>
            <strong>Surplus Share:</strong>
          </p>
          <p>Retention Amount = Minimum of (Total Sum Insured, Retention Limit)</p>
          <p>Cession Amount = Total Sum Insured - Retention Amount</p>
          <p>
            <strong>Cession Percentage</strong> = (Cession Amount / Total Sum Insured) Ã— 100
          </p>
          <p>Retention is the portion of risk kept by the insurer; cession is the portion transferred to reinsurers. Quota share uses proportional percentages; surplus share uses fixed retention limits with excess ceded.</p>
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
                <p className="text-sm text-muted-foreground">Retention Percentage</p>
                <p className="text-xl font-semibold text-primary">
                  {((result.retentionAmount / result.totalSumInsured) * 100).toFixed(1)}%
                </p>
                <p className="text-xs text-muted-foreground">Of total sum</p>
              </div>
              <div className="p-4 border rounded">
                <p className="text-sm text-muted-foreground">Treaty Type</p>
                <p className="text-xl font-semibold text-primary capitalize">{result.treatyType}</p>
                <p className="text-xs text-muted-foreground">Reinsurance type</p>
              </div>
              <div className="p-4 border rounded">
                <p className="text-sm text-muted-foreground">Risk Split</p>
                <p className="text-xl font-semibold text-primary">
                  {((result.retentionAmount / result.totalSumInsured) * 100).toFixed(0)}% / {result.cessionPercentage.toFixed(0)}%
                </p>
                <p className="text-xs text-muted-foreground">Retention / Cession</p>
              </div>
            </div>
          ) : (
            <p className="text-sm text-muted-foreground">Enter your reinsurance data to see additional insights.</p>
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
        className="space-y-6 text-muted-foreground leading-relaxed bg-white dark:bg-gray-900 p-6 md:p-10 rounded-lg shadow-lg"
        itemScope
        itemType="https://schema.org/Article"
      >
    <meta itemProp="name" content="The Complete Guide to Reinsurance Retention and Cession: Risk Transfer Strategies" />
    <meta itemProp="description" content="An in-depth guide on reinsurance retention and cession calculations, quota share vs surplus share treaties, and reinsurance strategy optimization." />
    <meta itemProp="keywords" content="reinsurance retention, reinsurance cession, quota share, surplus share, risk transfer, reinsurance strategy" />
    <meta itemProp="author" content="[Your Site's Finance Team]" />
    <meta itemProp="datePublished" content="2025-12-02" />
    <meta itemProp="url" content="/reinsurance-retention-cession-calculator" />

    <h1 className="text-3xl md:text-4xl font-extrabold text-foreground mb-4" itemProp="headline">The Complete Guide to Reinsurance Retention and Cession: Risk Transfer Strategies</h1>
    <p className="text-lg italic text-gray-700 dark:text-gray-300">A comprehensive look at reinsurance retention and cession, treaty types, and strategies for optimizing risk transfer and capital efficiency.</p>

    <h2 className="text-2xl font-bold text-foreground mt-8 mb-4">Table of Contents: Jump to a Section</h2>
    <ul className="list-disc ml-6 space-y-2 text-blue-600 dark:text-blue-400">
        <li><a href="#basics" className="hover:underline">Fundamentals of Retention and Cession</a></li>
        <li><a href="#quota" className="hover:underline">Quota Share Reinsurance</a></li>
        <li><a href="#surplus" className="hover:underline">Surplus Share Reinsurance</a></li>
        <li><a href="#calculation" className="hover:underline">Calculation Methods</a></li>
        <li><a href="#strategy" className="hover:underline">Retention Strategy Optimization</a></li>
        <li><a href="#considerations" className="hover:underline">Key Considerations</a></li>
    </ul>
<hr className="my-6" />

    <h2 id="basics" className="text-2xl font-bold text-foreground pt-8" itemProp="articleSection">Fundamentals of Retention and Cession</h2>
    <p>Reinsurance retention and cession are fundamental concepts in insurance risk management, representing how insurers balance risk retention with risk transfer.</p>

    <h3 className="text-xl font-semibold text-foreground mt-6">What is Retention?</h3>
    <p><b>Retention</b> is the portion of risk that an insurer keeps on its own books rather than transferring to reinsurers. It represents the maximum exposure the insurer accepts for any policy or risk. Higher retention means the insurer bears more risk but also keeps more premium income.</p>

    <h3 className="text-xl font-semibold text-foreground mt-6">What is Cession?</h3>
    <p><b>Cession</b> is the portion of risk transferred to reinsurers. It is calculated as the difference between total sum insured and retention. Insurers pay reinsurance premiums (ceded premiums) to reinsurers in exchange for this risk transfer. Cession reduces the insurer's exposure but also reduces premium income and requires paying reinsurance costs.</p>

    <h3 className="text-xl font-semibold text-foreground mt-6">The Balance</h3>
    <p>The retention vs cession decision involves balancing:</p>
    <ul className="list-disc ml-6 space-y-1">
        <li><b>Risk Exposure:</b> Higher retention = higher risk, lower retention = lower risk</li>
        <li><b>Capital Requirements:</b> Higher retention requires more capital</li>
        <li><b>Profitability:</b> Higher retention keeps more premiums but bears more losses</li>
        <li><b>Reinsurance Costs:</b> Higher cession requires paying more reinsurance premiums</li>
    </ul>

<hr className="my-6" />

    <h2 id="quota" className="text-2xl font-bold text-foreground pt-8" itemProp="articleSection">Quota Share Reinsurance</h2>
    <p>Quota share is a proportional reinsurance treaty where the insurer and reinsurer share premiums and losses in fixed percentages.</p>

    <h3 className="text-xl font-semibold text-foreground mt-6">How Quota Share Works</h3>
    <p>In a quota share treaty:</p>
    <ul className="list-disc ml-6 space-y-1">
        <li>Insurer and reinsurer agree on a percentage split (e.g., 60% retention, 40% cession)</li>
        <li>This percentage applies to ALL policies covered by the treaty</li>
        <li>Both premiums and losses are shared in the same proportion</li>
        <li>If the insurer writes a $1M policy with 60% retention, it keeps $600K and cedes $400K</li>
    </ul>

    <h3 className="text-xl font-semibold text-foreground mt-6">Advantages of Quota Share</h3>
    <ul className="list-disc ml-6 space-y-1">
        <li>Simple and predictable - same percentage for all policies</li>
        <li>Provides proportional coverage automatically</li>
        <li>Helps manage overall portfolio risk</li>
        <li>Reinsurer shares in all business, including smaller policies</li>
    </ul>

    <h3 className="text-xl font-semibold text-foreground mt-6">Disadvantages of Quota Share</h3>
    <ul className="list-disc ml-6 space-y-1">
        <li>Must cede even small policies where retention would be safe</li>
        <li>Less flexibility - same percentage applies to all sizes</li>
        <li>May cede more than necessary on smaller risks</li>
    </ul>

<hr className="my-6" />

    <h2 id="surplus" className="text-2xl font-bold text-foreground pt-8" itemProp="articleSection">Surplus Share Reinsurance</h2>
    <p>Surplus share is a non-proportional treaty where the insurer retains a fixed amount (retention limit) and the reinsurer covers the excess above that limit.</p>

    <h3 className="text-xl font-semibold text-foreground mt-6">How Surplus Share Works</h3>
    <p>In a surplus share treaty:</p>
    <ul className="list-disc ml-6 space-y-1">
        <li>Insurer sets a retention limit (e.g., $200K)</li>
        <li>For policies below the limit, insurer retains 100%</li>
        <li>For policies above the limit, insurer retains the limit amount and cedes the excess</li>
        <li>Example: $1M policy with $200K limit = $200K retention, $800K cession</li>
    </ul>

    <h3 className="text-xl font-semibold text-foreground mt-6">Advantages of Surplus Share</h3>
    <ul className="list-disc ml-6 space-y-1">
        <li>Flexibility - retain small policies fully, only cede large exposures</li>
        <li>More efficient - don't pay reinsurance on risks you can comfortably retain</li>
        <li>Better capital utilization - keep premiums on smaller policies</li>
        <li>Reinsurer only participates in larger risks</li>
    </ul>

    <h3 className="text-xl font-semibold text-foreground mt-6">Disadvantages of Surplus Share</h3>
    <ul className="list-disc ml-6 space-y-1">
        <li>More complex to administer - different retention for different policy sizes</li>
        <li>Reinsurer may have less incentive if only covering tail risks</li>
        <li>Requires careful limit setting based on capital capacity</li>
    </ul>

<hr className="my-6" />

    <h2 id="calculation" className="text-2xl font-bold text-foreground pt-8" itemProp="articleSection">Calculation Methods</h2>
    
    <h3 className="text-xl font-semibold text-foreground mt-6">Quota Share Calculation</h3>
    <div className="bg-gray-100 dark:bg-gray-800 p-4 rounded-lg my-4">
        <p className="font-mono"><strong>Retention Amount = Total Sum Insured Ã— Retention Percentage</strong></p>
        <p className="font-mono"><strong>Cession Amount = Total Sum Insured - Retention Amount</strong></p>
    </div>
    <p>Example: $1,000,000 policy with 60% retention</p>
    <p>Retention = $1,000,000 Ã— 60% = $600,000</p>
    <p>Cession = $1,000,000 - $600,000 = $400,000</p>

    <h3 className="text-xl font-semibold text-foreground mt-6">Surplus Share Calculation</h3>
    <div className="bg-gray-100 dark:bg-gray-800 p-4 rounded-lg my-4">
        <p className="font-mono"><strong>Retention Amount = Minimum of (Total Sum Insured, Retention Limit)</strong></p>
        <p className="font-mono"><strong>Cession Amount = Total Sum Insured - Retention Amount</strong></p>
    </div>
    <p>Example: $1,000,000 policy with $200,000 retention limit</p>
    <p>Retention = Minimum($1,000,000, $200,000) = $200,000</p>
    <p>Cession = $1,000,000 - $200,000 = $800,000</p>

    <h3 className="text-xl font-semibold text-foreground mt-6">Cession Ratio</h3>
    <div className="bg-gray-100 dark:bg-gray-800 p-4 rounded-lg my-4">
        <p className="font-mono"><strong>Cession Ratio = (Reinsurance Premiums Ceded / Total Premiums Written) Ã— 100</strong></p>
    </div>
    <p>This ratio indicates what percentage of total premiums are transferred to reinsurers.</p>

<hr className="my-6" />

    <h2 id="strategy" className="text-2xl font-bold text-foreground pt-8" itemProp="articleSection">Retention Strategy Optimization</h2>
    <p>Optimal retention levels balance risk, capital, profitability, and reinsurance costs.</p>

    <h3 className="text-xl font-semibold text-foreground mt-6">Factors Influencing Retention Decisions</h3>
    <ul className="list-disc ml-6 space-y-1">
        <li><b>Capital Adequacy:</b> Insurers with more capital can retain more risk</li>
        <li><b>Risk Appetite:</b> Conservative insurers may prefer lower retention</li>
        <li><b>Underwriting Quality:</b> Better underwriting supports higher retention</li>
        <li><b>Reinsurance Costs:</b> High reinsurance premiums favor higher retention</li>
        <li><b>Policy Size:</b> Small policies can often be fully retained</li>
        <li><b>Concentration Risk:</b> Geographic or industry concentration may require lower retention</li>
    </ul>

    <h3 className="text-xl font-semibold text-foreground mt-6">Optimizing Retention</h3>
    <p>To optimize retention:</p>
    <ul className="list-disc ml-6 space-y-1">
        <li>Analyze historical loss experience at different retention levels</li>
        <li>Compare reinsurance costs vs retained risk costs</li>
        <li>Ensure adequate capital for retained exposures</li>
        <li>Consider using surplus share to retain small policies fully</li>
        <li>Review retention levels regularly as business and capital change</li>
    </ul>

<hr className="my-6" />

    <h2 id="considerations" className="text-2xl font-bold text-foreground pt-8" itemProp="articleSection">Key Considerations</h2>
    
    <h3 className="text-xl font-semibold text-foreground mt-6">Capital Requirements</h3>
    <p>Higher retention requires more capital to support the retained exposures. Insurers must ensure sufficient capital is available to absorb potential losses on retained risks while maintaining solvency ratios and regulatory compliance.</p>

    <h3 className="text-xl font-semibold text-foreground mt-6">Profitability Impact</h3>
    <p>Higher retention keeps more premiums but also exposes the insurer to more losses. The profitability impact depends on:</p>
    <ul className="list-disc ml-6 space-y-1">
        <li>Quality of underwriting and risk selection</li>
        <li>Actual loss experience vs expected</li>
        <li>Reinsurance premiums saved by higher retention</li>
        <li>Capital costs of retained exposures</li>
    </ul>

    <h3 className="text-xl font-semibold text-foreground mt-6">Reinsurance Market Conditions</h3>
    <p>Reinsurance pricing and availability affect retention decisions. In hard markets (high reinsurance premiums, limited capacity), insurers may increase retention. In soft markets (lower premiums, ample capacity), insurers may decrease retention to reduce risk.</p>

<hr className="my-6" />

    <h2 className="text-2xl font-bold text-foreground pt-8" itemProp="articleSection">Conclusion</h2>
    <p>Reinsurance retention and cession calculations are fundamental to insurance risk management. Understanding quota share and surplus share treaties, calculation methods, and strategic considerations enables insurers to optimize their reinsurance programs. The optimal balance between retention and cession depends on capital capacity, risk appetite, underwriting quality, and market conditions. Regular review and adjustment of retention strategies ensures effective risk management and capital efficiency.</p>
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
          <p>This tool calculates reinsurance retention and cession amounts for quota share and surplus share treaties.</p>
          <p>Outputs include retention amount, cession amount, cession percentage, interpretation, recommendations, an action plan, and supporting metrics.</p>
          <p>Formula, steps, guide content, related tools, and FAQs ensure humans or AI assistants can interpret the methodology instantly.</p>
        </CardContent>
      </Card>
    </div>
  );
}

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
  earnedPremium: z.number({ invalid_type_error: 'Enter earned premium' }).min(0),
  expectedLossRatio: z.number({ invalid_type_error: 'Enter expected loss ratio' }).min(0).max(100),
  paidLosses: z.number({ invalid_type_error: 'Enter paid losses' }).min(0),
  caseReserve: z.number({ invalid_type_error: 'Enter case reserve' }).min(0),
});

type FormValues = z.infer<typeof formSchema>;

type ResultPayload = {
  earnedPremium: number;
  expectedLossRatio: number;
  paidLosses: number;
  caseReserve: number;
  ultimateLosses: number;
  totalReserve: number;
  ibnrReserve: number;
  reserveAdequacy: number;
  status: 'optimal' | 'good' | 'moderate' | 'low';
  interpretation: string;
  recommendations: string[];
  plan: { label: string; detail: string }[];
};

const steps = [
  'Enter earned premium (premiums earned during the period).',
  'Enter expected loss ratio (percentage of premiums expected to be paid as losses).',
  'Enter paid losses (losses already paid out).',
  'Enter case reserve (reserves set aside for reported claims).',
  'Review ultimate losses, total reserve, IBNR reserve, and reserve adequacy.',
];

const faqs = [
  {
    question: 'What is an insurance reserve?',
    answer:
      'Insurance reserves are funds set aside by insurers to pay future claims. Reserves ensure insurers have sufficient funds to cover claims that have been incurred but not yet paid, including reported claims (case reserves) and unreported claims (IBNR reserves).',
  },
  {
    question: 'What is IBNR reserve?',
    answer:
      'IBNR (Incurred But Not Reported) reserve is the reserve for claims that have occurred but have not yet been reported to the insurer. IBNR reserves are estimated using actuarial methods based on historical claim development patterns.',
  },
  {
    question: 'What is case reserve?',
    answer:
      'Case reserve is the reserve set aside for claims that have been reported but not yet paid. Case reserves are set by claims adjusters based on estimated claim amounts. Total reserves = Case Reserves + IBNR Reserves.',
  },
  {
    question: 'What is expected loss ratio?',
    answer:
      'Expected loss ratio is the percentage of earned premiums expected to be paid as losses. For example, 60% expected loss ratio means 60% of premiums are expected to be paid as losses. Expected loss ratios vary by line of business and risk profile.',
  },
  {
    question: 'How is ultimate losses calculated?',
    answer:
      'Ultimate losses are calculated as: Ultimate Losses = Earned Premium × Expected Loss Ratio. This represents the total expected losses for the period, including paid losses and future losses.',
  },
  {
    question: 'How is total reserve calculated?',
    answer:
      'Total reserve is calculated as: Total Reserve = Ultimate Losses - Paid Losses. This represents the total amount needed to pay all future claims, including both case reserves and IBNR reserves.',
  },
  {
    question: 'How is IBNR reserve calculated?',
    answer:
      'IBNR reserve is calculated as: IBNR Reserve = Total Reserve - Case Reserve. This represents the reserve needed for claims that have been incurred but not yet reported to the insurer.',
  },
  {
    question: 'What is reserve adequacy?',
    answer:
      'Reserve adequacy is the ratio of total reserves to ultimate losses, expressed as a percentage. Adequacy above 100% indicates reserves exceed expected losses, while adequacy below 100% indicates potential reserve deficiency.',
  },
  {
    question: 'Why are reserves important?',
    answer:
      'Reserves ensure insurers maintain financial stability and can meet future claim obligations. Inadequate reserves can lead to insolvency, while excessive reserves reduce profitability. Actuaries regularly review and adjust reserves based on claim development.',
  },
  {
    question: 'How often are reserves reviewed?',
    answer:
      'Reserves are reviewed regularly by actuaries, typically quarterly or annually. Reserves are adjusted based on actual claim development, changes in expected loss ratios, and changes in claim frequency or severity. Reserve reviews ensure adequacy and accuracy.',
  },
];

const relatedCalculators = [
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

const baseUrl = 'https://mycalculating.com/category/finance/insurance-reserve-requirement-calculator';

const schemaMarkup = {
  '@context': 'https://schema.org',
  '@graph': [
    {
      '@type': 'BreadcrumbList',
      itemListElement: [
        { '@type': 'ListItem', position: 1, name: 'Home', item: 'https://mycalculating.com' },
        { '@type': 'ListItem', position: 2, name: 'Finance', item: 'https://mycalculating.com/category/finance' },
        { '@type': 'ListItem', position: 3, name: 'Insurance Reserve Requirement Calculator', item: baseUrl },
      ],
    },
    {
      '@type': 'SoftwareApplication',
      name: 'Insurance Reserve Requirement Calculator',
      applicationCategory: 'Calculator',
      operatingSystem: 'Web Browser',
      description: 'Calculate insurance reserve requirements including ultimate losses, total reserves, and IBNR reserves using expected loss ratio method.',
      url: baseUrl,
      offers: { '@type': 'Offer', price: '0', priceCurrency: 'USD' },
    },
  ],
};

const calculateResult = (values: FormValues): ResultPayload => {
  const earnedPremium = values.earnedPremium;
  const expectedLossRatio = values.expectedLossRatio; // percentage
  const paidLosses = values.paidLosses;
  const caseReserve = values.caseReserve;

  // Ultimate Losses = Earned Premium × Expected Loss Ratio
  // Expected loss ratio is in percentage, so divide by 100
  const ultimateLosses = earnedPremium * (expectedLossRatio / 100);

  // Total Reserve = Ultimate Losses - Paid Losses
  const totalReserve = ultimateLosses - paidLosses;

  // IBNR Reserve = Total Reserve - Case Reserve
  const ibnrReserve = totalReserve - caseReserve;

  // Reserve Adequacy = (Total Reserve / Ultimate Losses) × 100
  // Represents reserve adequacy as percentage of ultimate losses
  const reserveAdequacy = ultimateLosses > 0 ? (totalReserve / ultimateLosses) * 100 : 0;

  let status: ResultPayload['status'] = 'optimal';
  let interpretation = 'Reserve requirements calculated. Total reserves, IBNR reserves, and reserve adequacy provide insights into reserve sufficiency and financial stability.';

  if (totalReserve < 0) {
    status = 'low';
    interpretation = 'Negative total reserve indicates paid losses exceed ultimate losses. This may indicate: expected loss ratio is too low, paid losses are overstated, or reserves are inadequate. Review assumptions and actual loss experience.';
  } else if (ibnrReserve < 0) {
    status = 'moderate';
    interpretation = 'Negative IBNR reserve indicates case reserves exceed total reserves. This may indicate: case reserves are overstated, IBNR is negative (unlikely), or reserves need adjustment. Review case reserve adequacy.';
  } else if (reserveAdequacy < 80) {
    status = 'moderate';
    interpretation = 'Reserve adequacy below 80% suggests potential reserve deficiency. Reserves may be insufficient to cover future claims. Consider increasing reserves or reviewing expected loss ratio assumptions.';
  } else if (reserveAdequacy > 120) {
    status = 'good';
    interpretation = 'Reserve adequacy above 120% suggests reserves may be excessive. While conservative, excessive reserves reduce profitability. Review reserve assumptions and consider releasing excess reserves if justified.';
  } else {
    status = 'optimal';
    interpretation = 'Reserve adequacy between 80-120% suggests reserves are reasonable. Reserves appear sufficient to cover future claims while maintaining appropriate profitability. Continue monitoring reserve development.';
  }

  const recommendations = [
    `Ultimate Losses: $${ultimateLosses.toLocaleString(undefined, { maximumFractionDigits: 2 })}. This is the total expected losses for the period, calculated as earned premium × expected loss ratio (${expectedLossRatio}%).`,
    `Total Reserve: $${totalReserve.toLocaleString(undefined, { maximumFractionDigits: 2 })}. This is the total amount needed to pay all future claims, calculated as ultimate losses minus paid losses.`,
    `IBNR Reserve: $${ibnrReserve.toLocaleString(undefined, { maximumFractionDigits: 2 })}. This is the reserve for claims that have been incurred but not yet reported, calculated as total reserve minus case reserve.`,
  ];
  if (reserveAdequacy < 100) {
    recommendations.push(`Reserve adequacy: ${reserveAdequacy.toFixed(1)}%. Reserves are below ultimate losses, suggesting potential reserve deficiency. Consider increasing reserves or reviewing expected loss ratio assumptions.`);
  } else if (reserveAdequacy > 100) {
    recommendations.push(`Reserve adequacy: ${reserveAdequacy.toFixed(1)}%. Reserves exceed ultimate losses, providing a margin of safety. Monitor reserve development and adjust if reserves become excessive.`);
  } else {
    recommendations.push(`Reserve adequacy: ${reserveAdequacy.toFixed(1)}%. Reserves match ultimate losses, indicating appropriate reserve levels. Continue monitoring reserve development.`);
  }
  if (ibnrReserve < 0) {
    recommendations.push('Negative IBNR reserve indicates case reserves may be overstated or total reserves are insufficient. Review case reserve adequacy and expected loss ratio assumptions.');
  }

  const plan = [
    { label: 'This Week', detail: `Review reserve requirements: Ultimate Losses $${ultimateLosses.toLocaleString(undefined, { maximumFractionDigits: 2 })}, Total Reserve $${totalReserve.toLocaleString(undefined, { maximumFractionDigits: 2 })}, IBNR Reserve $${ibnrReserve.toLocaleString(undefined, { maximumFractionDigits: 2 })}. Assess reserve adequacy (${reserveAdequacy.toFixed(1)}%).` },
    { label: 'This Month', detail: 'Compare calculated reserves to actual reserves. If significant differences exist, review expected loss ratio assumptions, paid losses, and case reserves. Adjust reserves as needed based on actual claim development.' },
    { label: 'Ongoing', detail: 'Monitor reserve development regularly (quarterly or annually). Update reserves based on actual claim experience, changes in expected loss ratios, and changes in claim frequency or severity. Ensure reserves remain adequate and accurate.' },
  ];

  return {
    earnedPremium,
    expectedLossRatio,
    paidLosses,
    caseReserve,
    ultimateLosses,
    totalReserve,
    ibnrReserve,
    reserveAdequacy,
    status,
    interpretation,
    recommendations,
    plan,
  };
};

export default function InsuranceReserveRequirementCalculator() {
  const [result, setResult] = useState<ResultPayload | null>(null);

  const form = useForm<FormValues>({
    resolver: zodResolver(formSchema),
    defaultValues: {
      earnedPremium: undefined,
      expectedLossRatio: undefined,
      paidLosses: undefined,
      caseReserve: undefined,
    },
  });

  return (
    <div className="space-y-8">
      <Script id="insurance-reserve-requirement-schema" type="application/ld+json" strategy="afterInteractive" dangerouslySetInnerHTML={{ __html: JSON.stringify(schemaMarkup) }} />

      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <Heart className="h-5 w-5" />
            Insurance Reserve Requirement Calculator
          </CardTitle>
          <CardDescription>Calculate insurance reserve requirements including ultimate losses, total reserves, and IBNR reserves using expected loss ratio method.</CardDescription>
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
                  name="earnedPremium"
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel>Earned Premium ($)</FormLabel>
                      <FormControl>
                        <Input type="number" step="0.01" placeholder="e.g., 10000000" value={field.value ?? ''} onChange={(e) => field.onChange(e.target.value === '' ? undefined : Number(e.target.value))} />
                      </FormControl>
                      <FormMessage />
                    </FormItem>
                  )}
                />
                <FormField
                  control={form.control}
                  name="expectedLossRatio"
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel>Expected Loss Ratio (%)</FormLabel>
                      <FormControl>
                        <Input type="number" step="0.01" placeholder="e.g., 60" value={field.value ?? ''} onChange={(e) => field.onChange(e.target.value === '' ? undefined : Number(e.target.value))} />
                      </FormControl>
                      <FormMessage />
                    </FormItem>
                  )}
                />
                <FormField
                  control={form.control}
                  name="paidLosses"
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel>Paid Losses ($)</FormLabel>
                      <FormControl>
                        <Input type="number" step="0.01" placeholder="e.g., 750000" value={field.value ?? ''} onChange={(e) => field.onChange(e.target.value === '' ? undefined : Number(e.target.value))} />
                      </FormControl>
                      <FormMessage />
                    </FormItem>
                  )}
                />
                <FormField
                  control={form.control}
                  name="caseReserve"
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel>Case Reserve ($)</FormLabel>
                      <FormControl>
                        <Input type="number" step="0.01" placeholder="e.g., 900000" value={field.value ?? ''} onChange={(e) => field.onChange(e.target.value === '' ? undefined : Number(e.target.value))} />
                      </FormControl>
                      <FormMessage />
                    </FormItem>
                  )}
                />
              </div>
              <Button type="submit" className="w-full md:w-auto">
                Calculate reserves
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
            <CardDescription>See ultimate losses, total reserves, IBNR reserves, and reserve adequacy assessment.</CardDescription>
          </CardHeader>
          <CardContent className="space-y-6">
            <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
              <div className="p-4 border rounded">
                <p className="text-sm text-muted-foreground">Ultimate Losses</p>
                <p className="text-2xl font-semibold text-primary">{result.ultimateLosses.toLocaleString(undefined, { maximumFractionDigits: 2 })}</p>
                <p className="text-xs text-muted-foreground">$</p>
              </div>
              <div className="p-4 border rounded">
                <p className="text-sm text-muted-foreground">Total Reserve</p>
                <p className="text-2xl font-semibold text-primary">{result.totalReserve.toLocaleString(undefined, { maximumFractionDigits: 2 })}</p>
                <p className="text-xs text-muted-foreground">$</p>
              </div>
              <div className="p-4 border rounded">
                <p className="text-sm text-muted-foreground">IBNR Reserve</p>
                <p className="text-2xl font-semibold text-primary">{result.ibnrReserve.toLocaleString(undefined, { maximumFractionDigits: 2 })}</p>
                <p className="text-xs text-muted-foreground">$</p>
              </div>
              <div className="p-4 border rounded">
                <p className="text-sm text-muted-foreground">Reserve Adequacy</p>
                <p className="text-2xl font-semibold text-primary">{result.reserveAdequacy.toFixed(1)}%</p>
                <p className="text-xs text-muted-foreground">Of ultimate losses</p>
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
            <strong>Ultimate Losses</strong> = Earned Premium × (Expected Loss Ratio / 100). The total expected losses for the period, including paid losses and future losses.
          </p>
          <p>
            <strong>Total Reserve</strong> = Ultimate Losses - Paid Losses. The total amount needed to pay all future claims, including both case reserves and IBNR reserves.
          </p>
          <p>
            <strong>IBNR Reserve</strong> = Total Reserve - Case Reserve. The reserve for claims that have been incurred but not yet reported to the insurer.
          </p>
          <p>
            <strong>Reserve Adequacy</strong> = (Total Reserve / Ultimate Losses) × 100. The reserve adequacy as a percentage of ultimate losses. Values above 100% indicate reserves exceed expected losses, while values below 100% indicate potential reserve deficiency.
          </p>
          <p>
            <strong>Expected Loss Ratio</strong> = Percentage of earned premiums expected to be paid as losses (0-100%). Varies by line of business and risk profile. Typical ranges: 50-70% for property, 60-80% for liability, 70-90% for workers compensation.
          </p>
          <p>The Expected Loss Ratio (ELR) method estimates reserves based on expected loss ratio and earned premiums. This method is commonly used in actuarial reserving and provides a framework for estimating total reserves and IBNR reserves.</p>
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
                <p className="text-sm text-muted-foreground">Unpaid Losses</p>
                <p className="text-xl font-semibold text-primary">
                  ${(result.ultimateLosses - result.paidLosses).toLocaleString(undefined, { maximumFractionDigits: 2 })}
                </p>
                <p className="text-xs text-muted-foreground">Future claims</p>
              </div>
              <div className="p-4 border rounded">
                <p className="text-sm text-muted-foreground">Case Reserve %</p>
                <p className="text-xl font-semibold text-primary">
                  {result.totalReserve > 0 ? ((result.caseReserve / result.totalReserve) * 100).toFixed(1) : '0'}%
                </p>
                <p className="text-xs text-muted-foreground">Of total reserve</p>
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
    <meta itemProp="name" content="The Definitive Guide to Insurance Reserve Requirements: Calculating Loss Reserves" />
    <meta itemProp="description" content="A comprehensive guide to calculating insurance reserve requirements including ultimate losses, total reserves, and IBNR reserves." />
    <meta itemProp="keywords" content="insurance reserve, loss reserve, IBNR reserve, case reserve, expected loss ratio, actuarial reserving" />
    <meta itemProp="author" content="[Your Site's Finance Team]" />
    <meta itemProp="datePublished" content="2025-01-02" />
    <meta itemProp="url" content="/definitive-insurance-reserve-requirement-guide" />

    <h1 className="text-3xl md:text-4xl font-extrabold text-foreground mb-4" itemProp="headline">The Definitive Guide to Insurance Reserve Requirements: Calculating Loss Reserves</h1>
    <p className="text-lg italic text-gray-700">A comprehensive guide to understanding and calculating insurance reserve requirements for financial stability.</p>

    <h2 className="text-2xl font-bold text-foreground mt-8 mb-4">Table of Contents</h2>
    <ul className="list-disc ml-6 space-y-2 text-blue-600">
        <li><a href="#overview" className="hover:underline">Overview: Insurance Reserves</a></li>
        <li><a href="#methods" className="hover:underline">Reserve Calculation Methods</a></li>
        <li><a href="#elr" className="hover:underline">Expected Loss Ratio (ELR) Method</a></li>
        <li><a href="#adequacy" className="hover:underline">Reserve Adequacy</a></li>
    </ul>
<hr />

    <h2 id="overview" className="text-2xl font-bold text-foreground pt-8" itemProp="articleSection">Overview: Insurance Reserves</h2>
    <p><b>Insurance reserves</b> are funds set aside by insurers to pay future claims. Reserves ensure insurers maintain financial stability and can meet future claim obligations, including reported claims (case reserves) and unreported claims (IBNR reserves).</p>

    <h3 className="text-xl font-semibold text-foreground mt-6">Key Concepts</h3>
    <ul>
        <li><b>Case Reserve:</b> Reserve for reported claims not yet paid</li>
        <li><b>IBNR Reserve:</b> Reserve for incurred but not reported claims</li>
        <li><b>Total Reserve:</b> Sum of case reserves and IBNR reserves</li>
        <li><b>Ultimate Losses:</b> Total expected losses for the period</li>
    </ul>

<hr />

    <h2 id="methods" className="text-2xl font-bold text-foreground pt-8" itemProp="articleSection">Reserve Calculation Methods</h2>
    
    <h3 className="text-xl font-semibold text-foreground mt-6">Common Methods</h3>
    <ul>
        <li><b>Expected Loss Ratio (ELR) Method:</b> Estimates reserves based on expected loss ratio and earned premiums</li>
        <li><b>Bornhuetter-Ferguson Method:</b> Combines past loss data with expected losses</li>
        <li><b>Chain Ladder Method:</b> Uses historical claim development patterns</li>
        <li><b>Incurred Development Method:</b> Estimates reserves using paid losses and case reserves</li>
    </ul>

<hr />

    <h2 id="elr" className="text-2xl font-bold text-foreground pt-8" itemProp="articleSection">Expected Loss Ratio (ELR) Method</h2>
    
    <h3 className="text-xl font-semibold text-foreground mt-6">ELR Method Steps</h3>
    <p>The ELR method estimates reserves as follows:</p>
    <ol>
        <li><b>Calculate Ultimate Losses:</b> Ultimate Losses = Earned Premium × Expected Loss Ratio</li>
        <li><b>Determine Total Reserve:</b> Total Reserve = Ultimate Losses - Paid Losses</li>
        <li><b>Compute IBNR Reserve:</b> IBNR Reserve = Total Reserve - Case Reserve</li>
    </ol>

    <h3 className="text-xl font-semibold text-foreground mt-6">Example Calculation</h3>
    <p>If earned premium is $10,000,000, expected loss ratio is 60%, paid losses are $750,000, and case reserves are $900,000:</p>
    <ul>
        <li>Ultimate Losses: $10,000,000 × 60% = $6,000,000</li>
        <li>Total Reserve: $6,000,000 - $750,000 = $5,250,000</li>
        <li>IBNR Reserve: $5,250,000 - $900,000 = $4,350,000</li>
    </ul>

<hr />

    <h2 id="adequacy" className="text-2xl font-bold text-foreground pt-8" itemProp="articleSection">Reserve Adequacy</h2>
    
    <h3 className="text-xl font-semibold text-foreground mt-6">Adequacy Assessment</h3>
    <p>Reserve adequacy is calculated as: <b>Reserve Adequacy = (Total Reserve / Ultimate Losses) × 100</b></p>

    <h3 className="text-xl font-semibold text-foreground mt-6">Adequacy Levels</h3>
    <ul>
        <li><b>Below 80%:</b> Potential reserve deficiency, may require reserve increases</li>
        <li><b>80-120%:</b> Reasonable reserve levels, adequate for most scenarios</li>
        <li><b>Above 120%:</b> Reserves may be excessive, consider releasing excess reserves</li>
    </ul>

<hr />

    <h2 className="text-2xl font-bold text-foreground pt-8" itemProp="articleSection">Conclusion</h2>
    <p><b>Insurance reserve requirements</b> ensure insurers maintain financial stability and can meet future claim obligations. The ELR method provides a framework for estimating reserves based on expected loss ratios and earned premiums. Regular reserve reviews ensure adequacy and accuracy. Inadequate reserves risk insolvency, while excessive reserves reduce profitability.</p>
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
          <p>This tool calculates insurance reserve requirements including ultimate losses, total reserves, and IBNR reserves using expected loss ratio method.</p>
          <p>Outputs include ultimate losses, total reserve, IBNR reserve, reserve adequacy, status, recommendations, an action plan, and supporting metrics.</p>
          <p>Formula, steps, guide content, related tools, and FAQs ensure humans or AI assistants can interpret the methodology instantly.</p>
        </CardContent>
      </Card>
    </div>
  );
}

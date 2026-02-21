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
  totalAssets: z.number({ invalid_type_error: 'Enter total assets' }).min(0),
  totalLiabilities: z.number({ invalid_type_error: 'Enter total liabilities' }).min(0),
  requiredSolvencyMargin: z.number({ invalid_type_error: 'Enter required solvency margin' }).min(0),
});

type FormValues = z.infer<typeof formSchema>;

type ResultPayload = {
  totalAssets: number;
  totalLiabilities: number;
  requiredSolvencyMargin: number;
  availableSolvencyMargin: number;
  solvencyRatio: number;
  interpretation: string;
  status: 'optimal' | 'good' | 'moderate' | 'low';
  recommendations: string[];
  plan: { label: string; detail: string }[];
};

const steps = [
  'Enter total admissible assets (total assets of the insurer).',
  'Enter total liabilities (insurance reserves and other obligations).',
  'Enter required solvency margin (minimum capital required by regulations).',
  'Review solvency margin, solvency ratio, and recommendations.',
];

const faqs = [
  {
    question: 'What is solvency margin?',
    answer:
      'Solvency margin is the excess of an insurer\'s assets over its liabilities, representing the capital buffer available to meet obligations. It ensures insurers maintain sufficient capital to remain solvent under adverse conditions.',
  },
  {
    question: 'What is available solvency margin (ASM)?',
    answer:
      'Available Solvency Margin is the excess of total admissible assets over total liabilities. It represents the actual capital available to the insurer after accounting for all obligations.',
  },
  {
    question: 'What is required solvency margin (RSM)?',
    answer:
      'Required Solvency Margin is the minimum capital that regulators require an insurer to hold, calculated based on regulatory formulas. It varies by jurisdiction and is typically based on premiums, claims, or a combination of factors.',
  },
  {
    question: 'What is solvency ratio?',
    answer:
      'Solvency ratio = (Available Solvency Margin / Required Solvency Margin) Ã— 100. It measures how many times the available capital exceeds the minimum required. Ratios above 100% indicate compliance, with higher ratios providing greater safety margins.',
  },
  {
    question: 'What is a good solvency ratio?',
    answer:
      'Regulatory requirements vary by jurisdiction. Generally, ratios above 150% are considered good, 100-150% indicate adequate capital, and below 100% triggers regulatory action. Many jurisdictions require minimum ratios of 150% or 200%.',
  },
  {
    question: 'How is required solvency margin calculated?',
    answer:
      'Required solvency margin calculation varies by jurisdiction. Common methods include: (1) Premium-based: percentage of gross or net premiums (e.g., 20% of premiums), (2) Claims-based: percentage of gross or net incurred claims (e.g., 30% of claims), or (3) Higher of premium-based and claims-based.',
  },
  {
    question: 'What happens if solvency ratio is below 100%?',
    answer:
      'Ratios below 100% indicate insufficient capital and trigger regulatory action. Insurers must submit corrective plans, may face restrictions on operations, and regulators may take control if ratios fall below critical thresholds (e.g., 70%).',
  },
  {
    question: 'How do I improve solvency margin?',
    answer:
      'Improve solvency margin by increasing capital (capital injections, retained earnings), reducing liabilities (run-off, reinsurance), optimizing asset allocation, improving underwriting profitability, or reducing expenses. May require regulatory approval.',
  },
  {
    question: 'What are regulatory action levels?',
    answer:
      'Regulators define action levels based on solvency ratio: (1) Company Action Level (150-200%): submit financial plan, (2) Regulatory Action Level (100-150%): enhanced oversight, (3) Authorized Control Level (70-100%): regulator may take control, (4) Mandatory Control Level (&lt;70%): regulator must take control.',
  },
  {
    question: 'Why is solvency margin important?',
    answer:
      'Solvency margin protects policyholders by ensuring insurers can meet obligations even under adverse conditions. It provides financial stability, supports market confidence, and meets regulatory requirements. Insufficient margin threatens insurer solvency and policyholder protection.',
  },
];

const relatedCalculators = [
  {
    name: 'Risk Capital Requirement (RBC) Calculator',
    slug: 'risk-capital-requirement-rbc-calculator',
    description: 'Calculate risk-based capital requirements.',
  },
  {
    name: 'Insurance Reserve Requirement Calculator',
    slug: 'insurance-reserve-requirement-calculator',
    description: 'Calculate insurance reserve requirements.',
  },
  {
    name: 'Probability of Ruin Calculator',
    slug: 'probability-of-ruin-calculator',
    description: 'Calculate probability of ruin for insurers.',
  },
  {
    name: 'Combined Ratio (Insurance Profitability) Calculator',
    slug: 'combined-ratio-insurance-profitability-calculator',
    description: 'Calculate combined ratio for profitability.',
  },
];

const baseUrl = 'https://mycalculating.com/finance/solvency-margin-calculator';

const schemaMarkup = {
  '@context': 'https://schema.org',
  '@graph': [
    {
      '@type': 'BreadcrumbList',
      itemListElement: [
        { '@type': 'ListItem', position: 1, name: 'Home', item: 'https://mycalculating.com' },
        { '@type': 'ListItem', position: 2, name: 'Finance', item: 'https://mycalculating.com/finance' },
        { '@type': 'ListItem', position: 3, name: 'Solvency Margin Calculator', item: baseUrl },
      ],
    },
    {
      '@type': 'SoftwareApplication',
      name: 'Solvency Margin Calculator',
      applicationCategory: 'Calculator',
      operatingSystem: 'Web Browser',
      description: 'Calculate solvency margin, available solvency margin, and solvency ratio for insurance companies.',
      url: baseUrl,
      offers: { '@type': 'Offer', price: '0', priceCurrency: 'USD' },
    },
  ],
};

const calculateResult = (values: FormValues): ResultPayload => {
  const totalAssets = values.totalAssets;
  const totalLiabilities = values.totalLiabilities;
  const requiredSolvencyMargin = values.requiredSolvencyMargin;
  
  // Available Solvency Margin = Total Assets - Total Liabilities
  const availableSolvencyMargin = totalAssets - totalLiabilities;
  
  // Solvency Ratio = (Available Solvency Margin / Required Solvency Margin) Ã— 100
  const solvencyRatio = requiredSolvencyMargin > 0 ? (availableSolvencyMargin / requiredSolvencyMargin) * 100 : 0;
  
  let status: ResultPayload['status'] = 'optimal';
  let interpretation = `Solvency ratio of ${solvencyRatio.toFixed(2)}% indicates ${availableSolvencyMargin.toLocaleString()} in available capital relative to ${requiredSolvencyMargin.toLocaleString()} required.`;
  
  if (solvencyRatio < 100) {
    status = 'low';
    interpretation += ' Insufficient capital - regulatory action required. Immediate capital injection or liability reduction needed.';
  } else if (solvencyRatio < 150) {
    status = 'moderate';
    interpretation += ' Adequate capital but near minimum requirements. Monitor closely and plan for capital strengthening.';
  } else if (solvencyRatio < 200) {
    status = 'good';
    interpretation += ' Good solvency position with comfortable margin above minimum requirements. Maintain prudent capital management.';
  } else {
    status = 'optimal';
    interpretation += ' Strong solvency position with substantial capital buffer. Continue monitoring to maintain healthy capital levels.';
  }

  const recommendations = [
    `Monitor solvency ratio: Track ratio regularly and ensure it remains above regulatory minimums. Target maintaining ratio above 150% for safety margin.`,
    `Assess capital adequacy: ${solvencyRatio.toFixed(2)}% solvency ratio. If below 150%, develop capital strengthening plan. If above 200%, consider optimal capital allocation.`,
    'Review asset quality: Ensure assets are admissible and properly valued. Illiquid or overvalued assets may reduce available solvency margin under stress.',
    'Monitor liability reserves: Verify reserves are adequate and properly calculated. Inadequate reserves reduce available solvency margin and threaten solvency.',
  ];
  
  if (solvencyRatio < 150) {
    recommendations.push('Capital strengthening needed: Consider capital injection, retained earnings retention, expense reduction, or liability management to improve solvency ratio.');
  }
  if (availableSolvencyMargin < 0) {
    recommendations.push('Negative solvency margin detected: Insurer is technically insolvent. Immediate regulatory action and capital restructuring required.');
  }

  const plan = [
    { label: 'This Week', detail: `Calculate solvency margin: Available ${availableSolvencyMargin.toLocaleString()}, Required ${requiredSolvencyMargin.toLocaleString()}, Ratio ${solvencyRatio.toFixed(2)}%. Document all inputs and regulatory framework.` },
    { label: 'This Month', detail: 'Review asset valuation and liability reserves. Assess capital adequacy relative to business plans and risk profile. Develop capital management strategy based on solvency ratio.' },
    { label: 'Ongoing', detail: 'Monitor solvency ratio regularly and compare to regulatory requirements. Adjust capital levels, asset allocation, and liability management to maintain healthy solvency margins. Report to regulators as required.' },
  ];

  return { totalAssets, totalLiabilities, requiredSolvencyMargin, availableSolvencyMargin, solvencyRatio, interpretation, status, recommendations, plan };
};

export default function SolvencyMarginCalculator() {
  const [result, setResult] = useState<ResultPayload | null>(null);

  const form = useForm<FormValues>({
    resolver: zodResolver(formSchema),
    defaultValues: {
      totalAssets: undefined,
      totalLiabilities: undefined,
      requiredSolvencyMargin: undefined,
    },
  });

  return (
    <div className="space-y-8">
      <Script id="solvency-margin-schema" type="application/ld+json" strategy="afterInteractive" dangerouslySetInnerHTML={{ __html: JSON.stringify(schemaMarkup) }} />

      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <Heart className="h-5 w-5" />
            Solvency Margin Calculator
          </CardTitle>
          <CardDescription>Calculate solvency margin, available solvency margin, and solvency ratio for insurance companies.</CardDescription>
        </CardHeader>
      </Card>

      <Card>
        <CardHeader>
          <CardTitle>Input your financial data</CardTitle>
        </CardHeader>
        <CardContent>
          <Form {...form}>
            <form onSubmit={form.handleSubmit((values) => setResult(calculateResult(values)))} className="space-y-6">
              <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                <FormField
                  control={form.control}
                  name="totalAssets"
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel>Total Assets</FormLabel>
                      <FormControl>
                        <Input type="number" step="0.01" placeholder="e.g., 100000000" value={field.value ?? ''} onChange={(e) => field.onChange(e.target.value === '' ? undefined : Number(e.target.value))} />
                      </FormControl>
                      <FormMessage />
                    </FormItem>
                  )}
                />
                <FormField
                  control={form.control}
                  name="totalLiabilities"
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel>Total Liabilities</FormLabel>
                      <FormControl>
                        <Input type="number" step="0.01" placeholder="e.g., 80000000" value={field.value ?? ''} onChange={(e) => field.onChange(e.target.value === '' ? undefined : Number(e.target.value))} />
                      </FormControl>
                      <FormMessage />
                    </FormItem>
                  )}
                />
                <FormField
                  control={form.control}
                  name="requiredSolvencyMargin"
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel>Required Solvency Margin</FormLabel>
                      <FormControl>
                        <Input type="number" step="0.01" placeholder="e.g., 15000000" value={field.value ?? ''} onChange={(e) => field.onChange(e.target.value === '' ? undefined : Number(e.target.value))} />
                      </FormControl>
                      <FormMessage />
                    </FormItem>
                  )}
                />
              </div>
              <Button type="submit" className="w-full md:w-auto">
                Calculate Solvency Margin
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
            <CardDescription>See solvency margin calculation and recommendations.</CardDescription>
          </CardHeader>
          <CardContent className="space-y-6">
            <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
              <div className="p-4 border rounded">
                <p className="text-sm text-muted-foreground">Available Solvency Margin</p>
                <p className="text-2xl font-semibold text-primary">{result.availableSolvencyMargin.toLocaleString()}</p>
                <p className="text-xs text-muted-foreground">Assets - Liabilities</p>
              </div>
              <div className="p-4 border rounded">
                <p className="text-sm text-muted-foreground">Required Solvency Margin</p>
                <p className="text-2xl font-semibold text-primary">{result.requiredSolvencyMargin.toLocaleString()}</p>
                <p className="text-xs text-muted-foreground">Regulatory minimum</p>
              </div>
              <div className="p-4 border rounded">
                <p className="text-sm text-muted-foreground">Solvency Ratio</p>
                <p className="text-2xl font-semibold text-primary">{result.solvencyRatio.toFixed(2)}%</p>
                <p className="text-xs text-muted-foreground">ASM / RSM Ã— 100</p>
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
            <strong>Available Solvency Margin (ASM)</strong> = Total Assets - Total Liabilities
          </p>
          <p>
            <strong>Solvency Ratio</strong> = (Available Solvency Margin / Required Solvency Margin) Ã— 100
          </p>
          <p>
            <strong>Required Solvency Margin (RSM)</strong> = Minimum capital required by regulations, typically calculated as the higher of premium-based (e.g., 20% of premiums) or claims-based (e.g., 30% of claims) formulas.
          </p>
          <p>Solvency margin ensures insurers maintain sufficient capital to meet obligations under adverse conditions. Regulatory requirements vary by jurisdiction, with many requiring minimum solvency ratios of 150% or 200%. Ratios below 100% indicate insufficient capital and trigger regulatory action.</p>
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
                <p className="text-sm text-muted-foreground">Excess Capital</p>
                <p className="text-xl font-semibold text-primary">
                  {(result.availableSolvencyMargin - result.requiredSolvencyMargin).toLocaleString()}
                </p>
                <p className="text-xs text-muted-foreground">Above required</p>
              </div>
              <div className="p-4 border rounded">
                <p className="text-sm text-muted-foreground">Capital Adequacy</p>
                <p className="text-xl font-semibold text-primary">
                  {result.solvencyRatio >= 150 ? 'Strong' : result.solvencyRatio >= 100 ? 'Adequate' : 'Insufficient'}
                </p>
                <p className="text-xs text-muted-foreground">Based on ratio</p>
              </div>
              <div className="p-4 border rounded">
                <p className="text-sm text-muted-foreground">Net Worth</p>
                <p className="text-xl font-semibold text-primary">{result.availableSolvencyMargin.toLocaleString()}</p>
                <p className="text-xs text-muted-foreground">Equity position</p>
              </div>
            </div>
          ) : (
            <p className="text-sm text-muted-foreground">Enter your financial data to see additional insights.</p>
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
        className="space-y-6 text-muted-foreground leading-relaxed bg-white dark:bg-gray-900 p-6 md:p-10 rounded-lg shadow-lg"
        itemScope
        itemType="https://schema.org/Article"
      >
    <meta itemProp="name" content="The Complete Guide to Solvency Margin: Insurance Capital Requirements and Ratios" />
    <meta itemProp="description" content="An in-depth guide on solvency margin calculation, solvency ratios, regulatory requirements, and capital management for insurance companies." />
    <meta itemProp="keywords" content="solvency margin, solvency ratio, insurance capital, available solvency margin, required solvency margin, insurance regulation" />
    <meta itemProp="author" content="[Your Site's Finance Team]" />
    <meta itemProp="datePublished" content="2025-12-02" />
    <meta itemProp="url" content="/finance/solvency-margin-calculator" />

    <h1 className="text-3xl md:text-4xl font-extrabold text-foreground mb-4" itemProp="headline">The Complete Guide to Solvency Margin: Insurance Capital Requirements and Ratios</h1>
    <p className="text-lg italic text-gray-700 dark:text-gray-300">A comprehensive look at solvency margin, regulatory capital requirements, and capital management strategies for insurance companies.</p>

    <h2 className="text-2xl font-bold text-foreground mt-8 mb-4">Table of Contents: Jump to a Section</h2>
    <ul className="list-disc ml-6 space-y-2 text-blue-600 dark:text-blue-400">
        <li><a href="#basics" className="hover:underline">Fundamentals of Solvency Margin</a></li>
        <li><a href="#calculation" className="hover:underline">Calculation Methods</a></li>
        <li><a href="#requirements" className="hover:underline">Regulatory Requirements</a></li>
        <li><a href="#ratios" className="hover:underline">Solvency Ratios and Action Levels</a></li>
        <li><a href="#management" className="hover:underline">Capital Management Strategies</a></li>
        <li><a href="#regions" className="hover:underline">Regional Variations</a></li>
    </ul>
<hr className="my-6" />

    <h2 id="basics" className="text-2xl font-bold text-foreground pt-8" itemProp="articleSection">Fundamentals of Solvency Margin</h2>
    <p>Solvency margin is a critical measure in insurance regulation, representing the excess of an insurer's assets over its liabilities. This margin ensures that insurers maintain sufficient capital to meet their obligations, even under adverse conditions.</p>

    <h3 className="text-xl font-semibold text-foreground mt-6">What is Solvency Margin?</h3>
    <p>Solvency margin represents the capital buffer that protects policyholders by ensuring insurers can pay claims and meet obligations even when facing unexpected losses or adverse market conditions. It is the difference between total admissible assets and total liabilities.</p>

    <h3 className="text-xl font-semibold text-foreground mt-6">Components of Solvency Margin</h3>
    <p><b>Available Solvency Margin (ASM):</b> The actual capital available to the insurer, calculated as:</p>
    <div className="bg-gray-100 dark:bg-gray-800 p-4 rounded-lg my-4">
        <p className="font-mono"><strong>ASM = Total Admissible Assets - Total Liabilities</strong></p>
    </div>
    <p><b>Required Solvency Margin (RSM):</b> The minimum capital that regulators require insurers to hold, calculated using regulatory formulas based on premiums, claims, or risk exposures.</p>

<hr className="my-6" />

    <h2 id="calculation" className="text-2xl font-bold text-foreground pt-8" itemProp="articleSection">Calculation Methods</h2>
    <p>Solvency margin calculations vary by jurisdiction, but common methodologies include premium-based and claims-based approaches.</p>

    <h3 className="text-xl font-semibold text-foreground mt-6">Premium-Based Method</h3>
    <p>RSM is calculated as a percentage of premiums written or earned:</p>
    <div className="bg-gray-100 dark:bg-gray-800 p-4 rounded-lg my-4">
        <p className="font-mono"><strong>RSM = Percentage Ã— Gross (or Net) Premiums</strong></p>
    </div>
    <p>Common percentages range from 16% to 20% of premiums, with adjustments for discount factors and retention levels.</p>

    <h3 className="text-xl font-semibold text-foreground mt-6">Claims-Based Method</h3>
    <p>RSM is calculated as a percentage of claims incurred:</p>
    <div className="bg-gray-100 dark:bg-gray-800 p-4 rounded-lg my-4">
        <p className="font-mono"><strong>RSM = Percentage Ã— Gross (or Net) Incurred Claims</strong></p>
    </div>
    <p>Common percentages range from 26% to 30% of claims, with similar adjustments as premium-based methods.</p>

    <h3 className="text-xl font-semibold text-foreground mt-6">Higher of Both Methods</h3>
    <p>Many jurisdictions require insurers to calculate RSM using both methods and adopt the higher result, ensuring adequate capital regardless of whether premiums or claims drive the requirement.</p>

<hr className="my-6" />

    <h2 id="requirements" className="text-2xl font-bold text-foreground pt-8" itemProp="articleSection">Regulatory Requirements</h2>
    <p>Regulators establish minimum solvency margin requirements to protect policyholders and ensure insurer financial stability.</p>

    <h3 className="text-xl font-semibold text-foreground mt-6">Minimum Solvency Ratios</h3>
    <p>Most jurisdictions require minimum solvency ratios (ASM/RSM) of:</p>
    <ul className="list-disc ml-6 space-y-1">
        <li><b>100%:</b> Absolute minimum for operation (may trigger action)</li>
        <li><b>150%:</b> Common regulatory minimum for healthy operation</li>
        <li><b>200%:</b> Required in some jurisdictions (e.g., Japan)</li>
    </ul>

    <h3 className="text-xl font-semibold text-foreground mt-6">Admissible Assets</h3>
    <p>Not all assets count toward solvency margin. Regulators define "admissible assets" that can be included:</p>
    <ul className="list-disc ml-6 space-y-1">
        <li>Cash and equivalents</li>
        <li>Investment-grade bonds</li>
        <li>Equity investments (with haircuts)</li>
        <li>Real estate (with valuation limits)</li>
        <li>Other approved assets</li>
    </ul>
    <p>Assets must be readily realizable, properly valued, and not encumbered by liens or restrictions.</p>

<hr className="my-6" />

    <h2 id="ratios" className="text-2xl font-bold text-foreground pt-8" itemProp="articleSection">Solvency Ratios and Action Levels</h2>
    <p>Regulators establish action levels based on solvency ratios to intervene before insurers become insolvent.</p>

    <h3 className="text-xl font-semibold text-foreground mt-6">Regulatory Action Levels</h3>
    <div className="overflow-x-auto my-6 p-4 bg-gray-50 dark:bg-gray-800 border rounded-lg">
        <table className="w-full text-left border-collapse">
            <thead>
                <tr>
                    <th className="border-b p-2 font-bold">Action Level</th>
                    <th className="border-b p-2 font-bold">Solvency Ratio</th>
                    <th className="border-b p-2 font-bold">Regulatory Response</th>
                </tr>
            </thead>
            <tbody>
                <tr>
                    <td className="border-b p-2">Company Action Level</td>
                    <td className="border-b p-2">150-200%</td>
                    <td className="border-b p-2">Submit comprehensive financial plan</td>
                </tr>
                <tr>
                    <td className="border-b p-2">Regulatory Action Level</td>
                    <td className="border-b p-2">100-150%</td>
                    <td className="border-b p-2">Enhanced oversight, corrective actions</td>
                </tr>
                <tr>
                    <td className="border-b p-2">Authorized Control Level</td>
                    <td className="border-b p-2">70-100%</td>
                    <td className="border-b p-2">Regulator may take control</td>
                </tr>
                <tr>
                    <td className="border-b p-2">Mandatory Control Level</td>
                    <td className="border-b p-2">&lt; 70%</td>
                    <td className="border-b p-2">Regulator must take control</td>
                </tr>
            </tbody>
        </table>
    </div>

<hr className="my-6" />

    <h2 id="management" className="text-2xl font-bold text-foreground pt-8" itemProp="articleSection">Capital Management Strategies</h2>
    <p>Effective capital management ensures insurers maintain adequate solvency margins while optimizing capital efficiency.</p>

    <h3 className="text-xl font-semibold text-foreground mt-6">Improving Solvency Margin</h3>
    <ul className="list-disc ml-6 space-y-1">
        <li><b>Capital Injection:</b> Raise additional capital from shareholders or investors</li>
        <li><b>Retained Earnings:</b> Retain profits instead of distributing dividends</li>
        <li><b>Asset Optimization:</b> Improve asset quality and liquidity</li>
        <li><b>Liability Management:</b> Reduce liabilities through run-off or reinsurance</li>
        <li><b>Profitability Improvement:</b> Enhance underwriting and investment performance</li>
    </ul>

    <h3 className="text-xl font-semibold text-foreground mt-6">Monitoring and Reporting</h3>
    <p>Insurers must:</p>
    <ul className="list-disc ml-6 space-y-1">
        <li>Calculate solvency margin regularly (quarterly or annually)</li>
        <li>Report to regulators on a timely basis</li>
        <li>Maintain detailed records of calculations</li>
        <li>Undergo regular regulatory examinations</li>
    </ul>

<hr className="my-6" />

    <h2 id="regions" className="text-2xl font-bold text-foreground pt-8" itemProp="articleSection">Regional Variations</h2>
    <p>Solvency margin requirements vary significantly by jurisdiction.</p>

    <h3 className="text-xl font-semibold text-foreground mt-6">European Union (Solvency II)</h3>
    <p>Solvency II uses a risk-based approach with Solvency Capital Requirement (SCR) calculated using standard formulas or internal models. Insurers must maintain capital above SCR (100% minimum, with intervention at 100%).</p>

    <h3 className="text-xl font-semibold text-foreground mt-6">United States (RBC)</h3>
    <p>Risk-Based Capital (RBC) system calculates capital requirements based on asset risk, insurance risk, interest rate risk, and business risk. Multiple action levels trigger regulatory responses.</p>

    <h3 className="text-xl font-semibold text-foreground mt-6">Asia-Pacific</h3>
    <p>Many jurisdictions use premium-based or claims-based formulas with minimum solvency ratios ranging from 150% to 200%. Japan requires minimum 200% solvency margin ratio.</p>

<hr className="my-6" />

    <h2 className="text-2xl font-bold text-foreground pt-8" itemProp="articleSection">Conclusion</h2>
    <p>Solvency margin is fundamental to insurance regulation and policyholder protection. Understanding available and required solvency margins, calculating solvency ratios, and managing capital effectively ensures insurers meet regulatory requirements while maintaining financial stability. Regular monitoring, prudent capital management, and timely regulatory reporting are essential for healthy insurer operation and continued market participation.</p>
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
          <p>This tool calculates solvency margin, available solvency margin, and solvency ratio for insurance companies.</p>
          <p>Outputs include available solvency margin, required solvency margin, solvency ratio, interpretation, recommendations, an action plan, and supporting metrics.</p>
          <p>Formula, steps, guide content, related tools, and FAQs ensure humans or AI assistants can interpret the methodology instantly.</p>
        </CardContent>
      </Card>
    </div>
  );
}


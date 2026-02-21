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
  assetRisk: z.number({ invalid_type_error: 'Enter asset risk' }).min(0),
  insuranceRisk: z.number({ invalid_type_error: 'Enter insurance risk' }).min(0),
  interestRateRisk: z.number({ invalid_type_error: 'Enter interest rate risk' }).min(0),
  businessRisk: z.number({ invalid_type_error: 'Enter business risk' }).min(0),
});

type FormValues = z.infer<typeof formSchema>;

type ResultPayload = {
  assetRisk: number;
  insuranceRisk: number;
  interestRateRisk: number;
  businessRisk: number;
  rbcRequirement: number;
  interpretation: string;
  status: 'optimal' | 'good' | 'moderate' | 'low';
  recommendations: string[];
  plan: { label: string; detail: string }[];
};

const steps = [
  'Enter asset risk (C-1) - risk from investments and asset defaults.',
  'Enter insurance risk (C-2) - risk from mortality, morbidity, or policyholder behavior.',
  'Enter interest rate risk (C-3) - risk from interest rate changes.',
  'Enter business risk (C-4) - operational and general business risks.',
  'Review RBC requirement calculation and recommendations.',
];

const faqs = [
  {
    question: 'What is Risk-Based Capital (RBC)?',
    answer:
      'Risk-Based Capital (RBC) is a regulatory framework that determines the minimum capital an insurance company must hold based on its size and risk profile. It ensures insurers maintain adequate capital to meet obligations and avoid insolvency.',
  },
  {
    question: 'What are the RBC risk categories?',
    answer:
      'RBC includes four main risk categories: C-1 (Asset Risk - investment defaults and fluctuations), C-2 (Insurance Risk - mortality, morbidity, policyholder behavior), C-3 (Interest Rate Risk - adverse interest rate movements), and C-4 (Business Risk - operational and management risks).',
  },
  {
    question: 'How is RBC requirement calculated?',
    answer:
      'For life insurers: RBC = C-4 + âˆš[(C-1 + C-3)Â² + C-2Â²]. The square root formula incorporates covariance adjustments, recognizing that not all risks occur simultaneously. Each risk category is calculated using specific factors and formulas.',
  },
  {
    question: 'What are RBC action levels?',
    answer:
      'RBC action levels trigger regulatory responses: Company Action Level (150-200% of authorized control level RBC), Regulatory Action Level (100-150%), Authorized Control Level (70-100%), and Mandatory Control Level (&lt;70%). Lower ratios trigger more severe regulatory action.',
  },
  {
    question: 'How does RBC differ from solvency margin?',
    answer:
      'RBC is a risk-based approach that calculates capital requirements based on specific risk categories and their interrelationships. Traditional solvency margin uses premium-based or claims-based formulas. RBC provides more sophisticated risk assessment.',
  },
  {
    question: 'What is the authorized control level RBC?',
    answer:
      'Authorized Control Level (ACL) RBC is typically 50% of the RBC requirement calculated using the standard formula. Regulatory action levels are expressed as percentages of ACL RBC (e.g., Company Action Level = 200% of ACL = 100% of RBC requirement).',
  },
  {
    question: 'How do I reduce RBC requirement?',
    answer:
      'Reduce RBC by lowering risk exposures: reduce asset risk (safer investments), insurance risk (better underwriting, reinsurance), interest rate risk (asset-liability matching), or business risk (operational improvements). Diversification and risk management can also reduce overall RBC.',
  },
  {
    question: 'What happens if RBC ratio is low?',
    answer:
      'Low RBC ratios trigger regulatory action. Insurers must submit financial plans, face enhanced oversight, restrictions on operations, or regulator takeover if ratios fall below critical thresholds. Maintaining adequate RBC is essential for continued operation.',
  },
  {
    question: 'How often is RBC calculated?',
    answer:
      'Insurers calculate RBC annually as part of statutory financial reporting, but may calculate it more frequently for internal risk management. Regulators review RBC ratios and may require quarterly reporting if ratios are near action levels.',
  },
  {
    question: 'Can I use internal models for RBC?',
    answer:
      'Some jurisdictions allow sophisticated insurers to use internal models for RBC calculation, subject to regulatory approval and validation. Internal models may better reflect insurer-specific risk profiles but require robust risk management infrastructure.',
  },
];

const relatedCalculators = [
  {
    name: 'Solvency Margin Calculator',
    slug: 'solvency-margin-calculator',
    description: 'Calculate solvency margin and ratios.',
  },
  {
    name: 'Insurance Reserve Requirement Calculator',
    slug: 'insurance-reserve-requirement-calculator',
    description: 'Calculate insurance reserve requirements.',
  },
  {
    name: 'Probability of Ruin Calculator',
    slug: 'probability-of-ruin-calculator',
    description: 'Calculate probability of ruin.',
  },
  {
    name: 'Asset-Liability Matching Calculator',
    slug: 'asset-liability-matching-calculator',
    description: 'Match assets and liabilities.',
  },
];

const baseUrl = 'https://mycalculating.com/finance/risk-capital-requirement-rbc-calculator';

const schemaMarkup = {
  '@context': 'https://schema.org',
  '@graph': [
    {
      '@type': 'BreadcrumbList',
      itemListElement: [
        { '@type': 'ListItem', position: 1, name: 'Home', item: 'https://mycalculating.com' },
        { '@type': 'ListItem', position: 2, name: 'Finance', item: 'https://mycalculating.com/finance' },
        { '@type': 'ListItem', position: 3, name: 'Risk Capital Requirement (RBC) Calculator', item: baseUrl },
      ],
    },
    {
      '@type': 'SoftwareApplication',
      name: 'Risk Capital Requirement (RBC) Calculator',
      applicationCategory: 'Calculator',
      operatingSystem: 'Web Browser',
      description: 'Calculate Risk-Based Capital (RBC) requirement for insurance companies based on asset risk, insurance risk, interest rate risk, and business risk.',
      url: baseUrl,
      offers: { '@type': 'Offer', price: '0', priceCurrency: 'USD' },
    },
  ],
};

const calculateResult = (values: FormValues): ResultPayload => {
  const c1 = values.assetRisk;
  const c2 = values.insuranceRisk;
  const c3 = values.interestRateRisk;
  const c4 = values.businessRisk;
  
  // RBC Requirement = C-4 + âˆš[(C-1 + C-3)Â² + C-2Â²]
  const rbcRequirement = c4 + Math.sqrt(Math.pow(c1 + c3, 2) + Math.pow(c2, 2));
  
  let status: ResultPayload['status'] = 'optimal';
  const totalRiskCapital = c1 + c2 + c3 + c4;
  const rbcEfficiency = totalRiskCapital > 0 ? ((rbcRequirement / totalRiskCapital) * 100) : 0;
  
  let interpretation = `RBC requirement of ${rbcRequirement.toLocaleString()} based on asset risk (${c1.toLocaleString()}), insurance risk (${c2.toLocaleString()}), interest rate risk (${c3.toLocaleString()}), and business risk (${c4.toLocaleString()}). Covariance adjustment reduces capital requirement compared to simple sum.`;
  
  if (c2 > c1 + c3) {
    status = 'good';
    interpretation += ' Insurance risk dominates. Focus on underwriting quality, reinsurance, and policyholder behavior management.';
  } else {
    status = 'optimal';
  }

  const recommendations = [
    `Monitor RBC ratio: Track actual capital against RBC requirement. Maintain capital above authorized control level (typically 200% of ACL = 100% of RBC) to avoid regulatory action.`,
    `Assess risk composition: ${((c1 + c3) / rbcRequirement * 100).toFixed(1)}% from asset/interest rate risks, ${(c2 / rbcRequirement * 100).toFixed(1)}% from insurance risk, ${(c4 / rbcRequirement * 100).toFixed(1)}% from business risk. Focus risk management on largest components.`,
    'Optimize asset allocation: Reduce asset risk through diversification, credit quality improvement, or asset-liability matching to lower C-1 and C-3 components.',
    'Manage insurance risk: Use reinsurance, improved underwriting, or policyholder behavior management to reduce C-2 component.',
  ];
  
  if (c4 > c1 + c2 + c3) {
    recommendations.push('Business risk dominates: Review operational risks, management controls, and business processes. Operational improvements can significantly reduce RBC requirement.');
  }

  const plan = [
    { label: 'This Week', detail: `Calculate RBC requirement: ${rbcRequirement.toLocaleString()} from risk categories C-1 (${c1.toLocaleString()}), C-2 (${c2.toLocaleString()}), C-3 (${c3.toLocaleString()}), C-4 (${c4.toLocaleString()}). Document all assumptions.` },
    { label: 'This Month', detail: 'Compare actual capital to RBC requirement. Assess which risk categories drive RBC and develop strategies to reduce highest-risk components. Review asset allocation and insurance risk management.' },
    { label: 'Ongoing', detail: 'Monitor RBC regularly and compare to regulatory thresholds. Adjust risk exposures, capital levels, and risk management strategies to maintain healthy RBC ratios and avoid regulatory action.' },
  ];

  return { assetRisk: c1, insuranceRisk: c2, interestRateRisk: c3, businessRisk: c4, rbcRequirement, interpretation, status, recommendations, plan };
};

export default function RiskCapitalRequirementRBCCalculator() {
  const [result, setResult] = useState<ResultPayload | null>(null);

  const form = useForm<FormValues>({
    resolver: zodResolver(formSchema),
    defaultValues: {
      assetRisk: undefined,
      insuranceRisk: undefined,
      interestRateRisk: undefined,
      businessRisk: undefined,
    },
  });

  return (
    <div className="space-y-8">
      <Script id="rbc-schema" type="application/ld+json" strategy="afterInteractive" dangerouslySetInnerHTML={{ __html: JSON.stringify(schemaMarkup) }} />

      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <Heart className="h-5 w-5" />
            Risk Capital Requirement (RBC) Calculator
          </CardTitle>
          <CardDescription>Calculate Risk-Based Capital (RBC) requirement for insurance companies based on asset risk, insurance risk, interest rate risk, and business risk.</CardDescription>
        </CardHeader>
      </Card>

      <Card>
        <CardHeader>
          <CardTitle>Input your risk capital data</CardTitle>
        </CardHeader>
        <CardContent>
          <Form {...form}>
            <form onSubmit={form.handleSubmit((values) => setResult(calculateResult(values)))} className="space-y-6">
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <FormField
                  control={form.control}
                  name="assetRisk"
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel>Asset Risk (C-1)</FormLabel>
                      <FormControl>
                        <Input type="number" step="0.01" placeholder="e.g., 5000000" value={field.value ?? ''} onChange={(e) => field.onChange(e.target.value === '' ? undefined : Number(e.target.value))} />
                      </FormControl>
                      <FormMessage />
                    </FormItem>
                  )}
                />
                <FormField
                  control={form.control}
                  name="insuranceRisk"
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel>Insurance Risk (C-2)</FormLabel>
                      <FormControl>
                        <Input type="number" step="0.01" placeholder="e.g., 8000000" value={field.value ?? ''} onChange={(e) => field.onChange(e.target.value === '' ? undefined : Number(e.target.value))} />
                      </FormControl>
                      <FormMessage />
                    </FormItem>
                  )}
                />
                <FormField
                  control={form.control}
                  name="interestRateRisk"
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel>Interest Rate Risk (C-3)</FormLabel>
                      <FormControl>
                        <Input type="number" step="0.01" placeholder="e.g., 3000000" value={field.value ?? ''} onChange={(e) => field.onChange(e.target.value === '' ? undefined : Number(e.target.value))} />
                      </FormControl>
                      <FormMessage />
                    </FormItem>
                  )}
                />
                <FormField
                  control={form.control}
                  name="businessRisk"
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel>Business Risk (C-4)</FormLabel>
                      <FormControl>
                        <Input type="number" step="0.01" placeholder="e.g., 2000000" value={field.value ?? ''} onChange={(e) => field.onChange(e.target.value === '' ? undefined : Number(e.target.value))} />
                      </FormControl>
                      <FormMessage />
                    </FormItem>
                  )}
                />
              </div>
              <Button type="submit" className="w-full md:w-auto">
                Calculate RBC Requirement
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
            <CardDescription>See RBC requirement calculation and recommendations.</CardDescription>
          </CardHeader>
          <CardContent className="space-y-6">
            <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
              <div className="p-4 border rounded">
                <p className="text-sm text-muted-foreground">RBC Requirement</p>
                <p className="text-2xl font-semibold text-primary">{result.rbcRequirement.toLocaleString()}</p>
                <p className="text-xs text-muted-foreground">Total required capital</p>
              </div>
              <div className="p-4 border rounded">
                <p className="text-sm text-muted-foreground">Total Risk Capital</p>
                <p className="text-2xl font-semibold text-primary">{(result.assetRisk + result.insuranceRisk + result.interestRateRisk + result.businessRisk).toLocaleString()}</p>
                <p className="text-xs text-muted-foreground">Sum of all risks</p>
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
            <strong>RBC Requirement</strong> = C-4 + âˆš[(C-1 + C-3)Â² + C-2Â²]
          </p>
          <p>
            <strong>C-1 (Asset Risk):</strong> Risk from investment defaults and asset value fluctuations
          </p>
          <p>
            <strong>C-2 (Insurance Risk):</strong> Risk from mortality, morbidity, or policyholder behavior assumptions
          </p>
          <p>
            <strong>C-3 (Interest Rate Risk):</strong> Risk from adverse interest rate movements affecting assets and liabilities
          </p>
          <p>
            <strong>C-4 (Business Risk):</strong> Operational and general business risks
          </p>
          <p>The square root formula incorporates covariance adjustments, recognizing that not all risks occur simultaneously. This reduces the RBC requirement compared to a simple sum of all risk categories. Each risk category is calculated using specific regulatory formulas and factors based on the insurer's exposures.</p>
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
            <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
              <div className="p-4 border rounded">
                <p className="text-sm text-muted-foreground">Asset Risk %</p>
                <p className="text-xl font-semibold text-primary">
                  {((result.assetRisk / result.rbcRequirement) * 100).toFixed(1)}%
                </p>
                <p className="text-xs text-muted-foreground">Of RBC</p>
              </div>
              <div className="p-4 border rounded">
                <p className="text-sm text-muted-foreground">Insurance Risk %</p>
                <p className="text-xl font-semibold text-primary">
                  {((result.insuranceRisk / result.rbcRequirement) * 100).toFixed(1)}%
                </p>
                <p className="text-xs text-muted-foreground">Of RBC</p>
              </div>
              <div className="p-4 border rounded">
                <p className="text-sm text-muted-foreground">Interest Rate Risk %</p>
                <p className="text-xl font-semibold text-primary">
                  {((result.interestRateRisk / result.rbcRequirement) * 100).toFixed(1)}%
                </p>
                <p className="text-xs text-muted-foreground">Of RBC</p>
              </div>
              <div className="p-4 border rounded">
                <p className="text-sm text-muted-foreground">Business Risk %</p>
                <p className="text-xl font-semibold text-primary">
                  {((result.businessRisk / result.rbcRequirement) * 100).toFixed(1)}%
                </p>
                <p className="text-xs text-muted-foreground">Of RBC</p>
              </div>
            </div>
          ) : (
            <p className="text-sm text-muted-foreground">Enter your risk capital data to see additional insights.</p>
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
    <meta itemProp="name" content="The Complete Guide to Risk-Based Capital (RBC): Insurance Capital Requirements" />
    <meta itemProp="description" content="An in-depth guide on Risk-Based Capital (RBC) calculation, risk categories, regulatory requirements, and capital management for insurance companies." />
    <meta itemProp="keywords" content="risk based capital RBC, insurance capital, C-1 C-2 C-3 C-4 risk categories, insurance regulation, capital adequacy" />
    <meta itemProp="author" content="[Your Site's Finance Team]" />
    <meta itemProp="datePublished" content="2025-12-02" />
    <meta itemProp="url" content="/finance/risk-capital-requirement-rbc-calculator" />

    <h1 className="text-3xl md:text-4xl font-extrabold text-foreground mb-4" itemProp="headline">The Complete Guide to Risk-Based Capital (RBC): Insurance Capital Requirements</h1>
    <p className="text-lg italic text-gray-700 dark:text-gray-300">A comprehensive look at Risk-Based Capital (RBC) calculation, risk categories, and capital management for insurance companies.</p>

    <h2 className="text-2xl font-bold text-foreground mt-8 mb-4">Table of Contents: Jump to a Section</h2>
    <ul className="list-disc ml-6 space-y-2 text-blue-600 dark:text-blue-400">
        <li><a href="#overview" className="hover:underline">Overview of Risk-Based Capital</a></li>
        <li><a href="#categories" className="hover:underline">RBC Risk Categories</a></li>
        <li><a href="#calculation" className="hover:underline">RBC Calculation Formula</a></li>
        <li><a href="#levels" className="hover:underline">Regulatory Action Levels</a></li>
        <li><a href="#management" className="hover:underline">RBC Management Strategies</a></li>
        <li><a href="#comparison" className="hover:underline">RBC vs Other Capital Measures</a></li>
    </ul>
<hr className="my-6" />

    <h2 id="overview" className="text-2xl font-bold text-foreground pt-8" itemProp="articleSection">Overview of Risk-Based Capital</h2>
    <p>Risk-Based Capital (RBC) is a regulatory framework that determines the minimum capital an insurance company must hold based on its size and risk profile. Unlike fixed capital requirements, RBC adjusts capital needs based on actual risk exposures.</p>

    <h3 className="text-xl font-semibold text-foreground mt-6">Purpose of RBC</h3>
    <p>RBC ensures insurers maintain adequate capital to:</p>
    <ul className="list-disc ml-6 space-y-1">
        <li>Meet obligations to policyholders under adverse conditions</li>
        <li>Absorb unexpected losses from various risk sources</li>
        <li>Avoid insolvency and protect policyholders</li>
        <li>Provide early warning of financial distress</li>
    </ul>

    <h3 className="text-xl font-semibold text-foreground mt-6">Advantages of RBC</h3>
    <ul className="list-disc ml-6 space-y-1">
        <li><b>Risk Sensitivity:</b> Capital requirements reflect actual risk exposures</li>
        <li><b>Fairness:</b> Higher-risk insurers hold more capital than lower-risk insurers</li>
        <li><b>Flexibility:</b> Allows diversification benefits through covariance adjustments</li>
        <li><b>Early Warning:</b> Declining ratios signal financial stress before insolvency</li>
    </ul>

<hr className="my-6" />

    <h2 id="categories" className="text-2xl font-bold text-foreground pt-8" itemProp="articleSection">RBC Risk Categories</h2>
    <p>RBC quantifies capital needs across four main risk categories for life insurers.</p>

    <h3 className="text-xl font-semibold text-foreground mt-6">C-1: Asset Risk</h3>
    <p>Risk from investment defaults and asset value fluctuations. Includes:</p>
    <ul className="list-disc ml-6 space-y-1">
        <li>Bond default risk (credit quality, concentration)</li>
        <li>Equity investment risk</li>
        <li>Real estate investment risk</li>
        <li>Other asset risks</li>
    </ul>
    <p>Calculated using asset-specific risk factors based on credit ratings, asset types, and concentrations.</p>

    <h3 className="text-xl font-semibold text-foreground mt-6">C-2: Insurance Risk</h3>
    <p>Risk from incorrect assumptions about:</p>
    <ul className="list-disc ml-6 space-y-1">
        <li>Mortality (death rates)</li>
        <li>Morbidity (sickness rates)</li>
        <li>Policyholder behavior (lapses, withdrawals)</li>
        <li>Longevity (life expectancy)</li>
    </ul>
    <p>Calculated based on policy reserves, premium volumes, and risk characteristics.</p>

    <h3 className="text-xl font-semibold text-foreground mt-6">C-3: Interest Rate Risk</h3>
    <p>Risk from adverse interest rate movements affecting:</p>
    <ul className="list-disc ml-6 space-y-1">
        <li>Asset values (bond prices)</li>
        <li>Liability values (policy reserves)</li>
        <li>Asset-liability matching</li>
        <li>Reinvestment risk</li>
    </ul>
    <p>Assessed through scenario testing and duration mismatch analysis.</p>

    <h3 className="text-xl font-semibold text-foreground mt-6">C-4: Business Risk</h3>
    <p>Operational and general business risks including:</p>
    <ul className="list-disc ml-6 space-y-1">
        <li>Management and operational risks</li>
        <li>Legal and regulatory risks</li>
        <li>Reinsurance credit risk</li>
        <li>Other general business risks</li>
    </ul>
    <p>Often calculated as a percentage of premiums or assets.</p>

<hr className="my-6" />

    <h2 id="calculation" className="text-2xl font-bold text-foreground pt-8" itemProp="articleSection">RBC Calculation Formula</h2>
    <p>The RBC formula for life insurers incorporates covariance adjustments:</p>
    
    <div className="bg-gray-100 dark:bg-gray-800 p-4 rounded-lg my-4">
        <p className="font-mono text-lg"><strong>RBC = C-4 + âˆš[(C-1 + C-3)Â² + C-2Â²]</strong></p>
    </div>
    
    <h3 className="text-xl font-semibold text-foreground mt-6">Covariance Adjustment</h3>
    <p>The square root formula recognizes that:</p>
    <ul className="list-disc ml-6 space-y-1">
        <li>Not all risks occur simultaneously</li>
        <li>Asset/interest rate risks (C-1, C-3) are somewhat correlated</li>
        <li>Insurance risk (C-2) is less correlated with asset risks</li>
        <li>This reduces RBC compared to simple sum (C-1 + C-2 + C-3 + C-4)</li>
    </ul>

    <h3 className="text-xl font-semibold text-foreground mt-6">Property & Casualty RBC</h3>
    <p>P&C insurers use different risk categories (R0-R5) with different formulas:</p>
    <ul className="list-disc ml-6 space-y-1">
        <li>R0: Asset Risk - Affiliated Insurers</li>
        <li>R1: Asset Risk - Fixed Income</li>
        <li>R2: Asset Risk - Equity</li>
        <li>R3: Credit/Reinsurance Risk</li>
        <li>R4: Underwriting Risk - Reserves</li>
        <li>R5: Underwriting Risk - Premiums</li>
    </ul>

<hr className="my-6" />

    <h2 id="levels" className="text-2xl font-bold text-foreground pt-8" itemProp="articleSection">Regulatory Action Levels</h2>
    <p>RBC ratios determine regulatory action levels, with Authorized Control Level (ACL) RBC typically set at 50% of the calculated RBC requirement.</p>

    <div className="overflow-x-auto my-6 p-4 bg-gray-50 dark:bg-gray-800 border rounded-lg">
        <table className="w-full text-left border-collapse">
            <thead>
                <tr>
                    <th className="border-b p-2 font-bold">Action Level</th>
                    <th className="border-b p-2 font-bold">Ratio (of ACL RBC)</th>
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

    <h2 id="management" className="text-2xl font-bold text-foreground pt-8" itemProp="articleSection">RBC Management Strategies</h2>
    <p>Effective RBC management balances adequate capital with efficient capital usage.</p>

    <h3 className="text-xl font-semibold text-foreground mt-6">Reducing RBC Requirement</h3>
    <ul className="list-disc ml-6 space-y-1">
        <li><b>Asset Risk (C-1):</b> Improve credit quality, diversify investments, reduce concentrations</li>
        <li><b>Insurance Risk (C-2):</b> Better underwriting, reinsurance, policy design</li>
        <li><b>Interest Rate Risk (C-3):</b> Asset-liability matching, duration management</li>
        <li><b>Business Risk (C-4):</b> Operational improvements, risk controls</li>
    </ul>

    <h3 className="text-xl font-semibold text-foreground mt-6">Maintaining Adequate Capital</h3>
    <ul className="list-disc ml-6 space-y-1">
        <li>Regular RBC monitoring and reporting</li>
        <li>Capital planning and stress testing</li>
        <li>Maintain capital above action level thresholds</li>
        <li>Prepare contingency plans for capital shortfalls</li>
    </ul>

<hr className="my-6" />

    <h2 id="comparison" className="text-2xl font-bold text-foreground pt-8" itemProp="articleSection">RBC vs Other Capital Measures</h2>
    <p>RBC differs from other capital adequacy measures:</p>

    <h3 className="text-xl font-semibold text-foreground mt-6">RBC vs Solvency Margin</h3>
    <ul className="list-disc ml-6 space-y-1">
        <li><b>RBC:</b> Risk-based, reflects actual risk exposures, uses covariance adjustments</li>
        <li><b>Solvency Margin:</b> Formula-based (premiums/claims), simpler calculation, less risk-sensitive</li>
    </ul>

    <h3 className="text-xl font-semibold text-foreground mt-6">RBC vs Solvency II</h3>
    <ul className="list-disc ml-6 space-y-1">
        <li><b>RBC:</b> US system, formula-based with some flexibility</li>
        <li><b>Solvency II:</b> EU system, allows internal models, more sophisticated</li>
    </ul>

<hr className="my-6" />

    <h2 className="text-2xl font-bold text-foreground pt-8" itemProp="articleSection">Conclusion</h2>
    <p>Risk-Based Capital (RBC) provides a sophisticated framework for determining insurance capital requirements based on actual risk exposures. Understanding the four risk categories (C-1 through C-4), the calculation formula with covariance adjustments, and regulatory action levels enables effective capital management. Insurers must balance maintaining adequate capital to meet RBC requirements while optimizing capital efficiency through risk management strategies.</p>
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
          <p>This tool calculates Risk-Based Capital (RBC) requirement for insurance companies based on asset risk, insurance risk, interest rate risk, and business risk.</p>
          <p>Outputs include RBC requirement, risk category breakdowns, interpretation, recommendations, an action plan, and supporting metrics.</p>
          <p>Formula, steps, guide content, related tools, and FAQs ensure humans or AI assistants can interpret the methodology instantly.</p>
        </CardContent>
      </Card>
    </div>
  );
}


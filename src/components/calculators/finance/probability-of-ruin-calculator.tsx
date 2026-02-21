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
  initialSurplus: z.number({ invalid_type_error: 'Enter initial surplus' }).min(0),
  premiumRate: z.number({ invalid_type_error: 'Enter premium rate' }).min(0),
  claimArrivalRate: z.number({ invalid_type_error: 'Enter claim arrival rate' }).min(0),
  averageClaimSize: z.number({ invalid_type_error: 'Enter average claim size' }).min(0),
});

type FormValues = z.infer<typeof formSchema>;

type ResultPayload = {
  initialSurplus: number;
  premiumRate: number;
  claimArrivalRate: number;
  averageClaimSize: number;
  probabilityOfRuin: number;
  safetyLoading: number;
  status: 'optimal' | 'good' | 'moderate' | 'low';
  interpretation: string;
  recommendations: string[];
  plan: { label: string; detail: string }[];
};

const steps = [
  'Enter initial surplus (starting capital or reserves).',
  'Enter premium rate (premiums collected per unit time).',
  'Enter claim arrival rate (expected number of claims per unit time).',
  'Enter average claim size (mean claim amount).',
  'Review probability of ruin, safety loading, and recommendations.',
];

const faqs = [
  {
    question: 'What is probability of ruin?',
    answer:
      'Probability of ruin is the likelihood that an insurer\'s reserves will be depleted to zero or below, leading to insolvency. It quantifies the risk of financial failure based on claims, premiums, and initial capital.',
  },
  {
    question: 'How is probability of ruin calculated?',
    answer:
      'Probability of ruin is calculated using the CramÃ©r-Lundberg model approximation: Ïˆ(u) â‰ˆ (Î»Î¼/c)^(u/Î¼), where u is initial surplus, Î» is claim arrival rate, Î¼ is average claim size, and c is premium rate. This assumes positive safety loading (c > Î»Î¼).',
  },
  {
    question: 'What is safety loading?',
    answer:
      'Safety loading is the excess of premium rate over expected claims cost (c - Î»Î¼). Positive safety loading ensures premiums exceed expected claims, providing a buffer against ruin. Higher safety loading reduces probability of ruin.',
  },
  {
    question: 'What is a good probability of ruin?',
    answer:
      'Lower probability of ruin indicates better financial stability. Generally, probability of ruin below 1% is considered very good, 1-5% is acceptable, 5-10% is moderate risk, and above 10% indicates high risk of insolvency.',
  },
  {
    question: 'How does initial surplus affect probability of ruin?',
    answer:
      'Higher initial surplus (capital/reserves) significantly reduces probability of ruin. Each unit increase in surplus provides exponential reduction in ruin probability, making adequate capitalization critical for financial stability.',
  },
  {
    question: 'How does premium rate affect probability of ruin?',
    answer:
      'Higher premium rates (relative to expected claims) reduce probability of ruin by increasing safety loading. However, excessively high premiums may reduce competitiveness. Balance premium adequacy with market pricing.',
  },
  {
    question: 'What are limitations of this calculation?',
    answer:
      'This calculation uses simplified approximations. Real-world ruin probability depends on claim distribution, correlation, reinsurance, investment returns, and operational risks. Use as a screening tool, not definitive assessment.',
  },
  {
    question: 'How can I reduce probability of ruin?',
    answer:
      'Reduce probability of ruin by: increasing initial surplus/capital, maintaining positive safety loading in premiums, purchasing reinsurance, diversifying risk exposure, and implementing effective risk management controls.',
  },
  {
    question: 'What is the CramÃ©r-Lundberg model?',
    answer:
      'The CramÃ©r-Lundberg model is a classical actuarial model for insurance risk. It assumes claims arrive according to a Poisson process with known arrival rate, claim sizes are independent and identically distributed, and premiums are collected at a constant rate.',
  },
  {
    question: 'When should I consult an actuary?',
    answer:
      'Consult an actuary for complex risk assessments, regulatory compliance, reinsurance decisions, and comprehensive financial modeling. Professional actuarial analysis provides detailed ruin probability calculations and risk management recommendations.',
  },
];

const relatedCalculators = [
  {
    name: 'Expected Loss (Insurance Risk) Calculator',
    slug: 'expected-loss-insurance-risk-calculator',
    description: 'Calculate expected loss from insurance risk based on probability and severity.',
  },
  {
    name: 'Insurance Reserve Requirement Calculator',
    slug: 'insurance-reserve-requirement-calculator',
    description: 'Calculate insurance reserve requirements for financial stability.',
  },
  {
    name: 'Loss Ratio Calculator',
    slug: 'loss-ratio-calculator',
    description: 'Calculate insurance loss ratio to evaluate underwriting performance.',
  },
  {
    name: 'Solvency Margin Calculator',
    slug: 'solvency-margin-calculator',
    description: 'Calculate solvency margin to assess financial stability and regulatory compliance.',
  },
];

const baseUrl = 'https://mycalculating.com/finance/probability-of-ruin-calculator';

const schemaMarkup = {
  '@context': 'https://schema.org',
  '@graph': [
    {
      '@type': 'BreadcrumbList',
      itemListElement: [
        { '@type': 'ListItem', position: 1, name: 'Home', item: 'https://mycalculating.com' },
        { '@type': 'ListItem', position: 2, name: 'Finance', item: 'https://mycalculating.com/finance' },
        { '@type': 'ListItem', position: 3, name: 'Probability of Ruin Calculator', item: baseUrl },
      ],
    },
    {
      '@type': 'SoftwareApplication',
      name: 'Probability of Ruin Calculator',
      applicationCategory: 'Calculator',
      operatingSystem: 'Web Browser',
      description: 'Calculate probability of ruin for insurance companies based on initial surplus, premium rate, claim arrival rate, and average claim size.',
      url: baseUrl,
      offers: { '@type': 'Offer', price: '0', priceCurrency: 'USD' },
    },
  ],
};

const calculateResult = (values: FormValues): ResultPayload => {
  const initialSurplus = values.initialSurplus;
  const premiumRate = values.premiumRate;
  const claimArrivalRate = values.claimArrivalRate;
  const averageClaimSize = values.averageClaimSize;

  // Calculate expected claims cost per unit time
  const expectedClaimsCost = claimArrivalRate * averageClaimSize;

  // Calculate safety loading (premium rate - expected claims cost)
  const safetyLoading = premiumRate - expectedClaimsCost;

  // Calculate probability of ruin using CramÃ©r-Lundberg approximation
  // Ïˆ(u) â‰ˆ (Î»Î¼/c)^(u/Î¼) where u is initial surplus, Î» is claim arrival rate, Î¼ is average claim size, c is premium rate
  // This approximation requires positive safety loading (c > Î»Î¼)
  let probabilityOfRuin = 0;
  if (premiumRate > expectedClaimsCost && averageClaimSize > 0) {
    const ratio = expectedClaimsCost / premiumRate;
    const exponent = initialSurplus / averageClaimSize;
    probabilityOfRuin = Math.pow(ratio, exponent);
    // Cap at 100%
    probabilityOfRuin = Math.min(100, probabilityOfRuin * 100);
  } else if (premiumRate <= expectedClaimsCost) {
    // If safety loading is negative or zero, ruin is certain over long term
    probabilityOfRuin = 100;
  }

  let status: ResultPayload['status'] = 'optimal';
  let interpretation = 'Probability of ruin calculated. Lower values indicate better financial stability and lower risk of insolvency.';

  if (probabilityOfRuin >= 10) {
    status = 'low';
    interpretation = 'High probability of ruin (10% or higher) indicates significant risk of insolvency. Immediate action required: increase capital, improve premium adequacy, or reduce risk exposure to ensure financial stability.';
  } else if (probabilityOfRuin >= 5) {
    status = 'moderate';
    interpretation = 'Moderate probability of ruin (5-10%) indicates elevated risk. Consider increasing capital reserves, improving premium rates, or purchasing reinsurance to reduce ruin probability and enhance financial stability.';
  } else if (probabilityOfRuin >= 1) {
    status = 'good';
    interpretation = 'Acceptable probability of ruin (1-5%) indicates manageable risk. Monitor regularly and maintain adequate capital reserves and positive safety loading to sustain financial stability.';
  } else {
    status = 'optimal';
    interpretation = 'Low probability of ruin (below 1%) indicates strong financial stability. Continue maintaining adequate capital, positive safety loading, and effective risk management to sustain low ruin risk.';
  }

  const recommendations = [
    `Probability of ruin: ${probabilityOfRuin.toFixed(2)}%. This represents the likelihood that reserves will be depleted to zero, leading to insolvency.`,
    `Safety loading: ${safetyLoading >= 0 ? `$${safetyLoading.toLocaleString(undefined, { maximumFractionDigits: 2 })} per unit time (positive)` : `$${Math.abs(safetyLoading).toLocaleString(undefined, { maximumFractionDigits: 2 })} per unit time (negative - premiums insufficient)`}. Positive safety loading is essential for financial stability.`,
    `Expected claims cost: $${expectedClaimsCost.toLocaleString(undefined, { maximumFractionDigits: 2 })} per unit time. Premium rate of $${premiumRate.toLocaleString(undefined, { maximumFractionDigits: 2 })} should exceed this to ensure positive safety loading.`,
  ];
  if (safetyLoading < 0) {
    recommendations.push('CRITICAL: Negative safety loading means premiums are insufficient to cover expected claims. Increase premium rates immediately to ensure financial viability and prevent certain ruin.');
  }
  if (probabilityOfRuin > 5) {
    recommendations.push('High ruin probability requires immediate action. Increase initial surplus/capital, improve premium adequacy, purchase reinsurance, or reduce risk exposure to lower ruin probability below 5%.');
  } else if (probabilityOfRuin > 1) {
    recommendations.push('Moderate ruin probability should be monitored. Consider increasing capital reserves, maintaining positive safety loading, and implementing risk management controls to reduce ruin probability.');
  } else {
    recommendations.push('Low ruin probability indicates good financial stability. Continue maintaining adequate capital, positive safety loading, and effective risk management practices to sustain low ruin risk.');
  }

  const plan = [
    { label: 'This Week', detail: `Review probability of ruin: ${probabilityOfRuin.toFixed(2)}% and safety loading: ${safetyLoading >= 0 ? `$${safetyLoading.toLocaleString(undefined, { maximumFractionDigits: 2 })}` : `-$${Math.abs(safetyLoading).toLocaleString(undefined, { maximumFractionDigits: 2 })}`}. Assess capital adequacy and premium rates to ensure financial stability.` },
    { label: 'This Month', detail: 'If ruin probability exceeds 5%, take immediate action: increase capital reserves, improve premium rates to ensure positive safety loading, purchase reinsurance, or reduce risk exposure. Monitor regularly.' },
    { label: 'Ongoing', detail: 'Continuously monitor probability of ruin, safety loading, and capital adequacy. Maintain adequate reserves, positive safety loading in premiums, and effective risk management to sustain financial stability and low ruin risk.' },
  ];

  return {
    initialSurplus,
    premiumRate,
    claimArrivalRate,
    averageClaimSize,
    probabilityOfRuin,
    safetyLoading,
    status,
    interpretation,
    recommendations,
    plan,
  };
};

export default function ProbabilityOfRuinCalculator() {
  const [result, setResult] = useState<ResultPayload | null>(null);

  const form = useForm<FormValues>({
    resolver: zodResolver(formSchema),
    defaultValues: {
      initialSurplus: undefined,
      premiumRate: undefined,
      claimArrivalRate: undefined,
      averageClaimSize: undefined,
    },
  });

  return (
    <div className="space-y-8">
      <Script id="probability-of-ruin-schema" type="application/ld+json" strategy="afterInteractive" dangerouslySetInnerHTML={{ __html: JSON.stringify(schemaMarkup) }} />

      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <Heart className="h-5 w-5" />
            Probability of Ruin Calculator
          </CardTitle>
          <CardDescription>Calculate probability of ruin for insurance companies based on initial surplus, premium rate, claim arrival rate, and average claim size.</CardDescription>
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
                  name="initialSurplus"
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel>Initial Surplus ($)</FormLabel>
                      <FormControl>
                        <Input type="number" step="0.01" placeholder="e.g., 1000000" value={field.value ?? ''} onChange={(e) => field.onChange(e.target.value === '' ? undefined : Number(e.target.value))} />
                      </FormControl>
                      <FormMessage />
                    </FormItem>
                  )}
                />
                <FormField
                  control={form.control}
                  name="premiumRate"
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel>Premium Rate ($/unit time)</FormLabel>
                      <FormControl>
                        <Input type="number" step="0.01" placeholder="e.g., 50000" value={field.value ?? ''} onChange={(e) => field.onChange(e.target.value === '' ? undefined : Number(e.target.value))} />
                      </FormControl>
                      <FormMessage />
                    </FormItem>
                  )}
                />
                <FormField
                  control={form.control}
                  name="claimArrivalRate"
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel>Claim Arrival Rate (claims/unit time)</FormLabel>
                      <FormControl>
                        <Input type="number" step="0.01" placeholder="e.g., 10" value={field.value ?? ''} onChange={(e) => field.onChange(e.target.value === '' ? undefined : Number(e.target.value))} />
                      </FormControl>
                      <FormMessage />
                    </FormItem>
                  )}
                />
                <FormField
                  control={form.control}
                  name="averageClaimSize"
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel>Average Claim Size ($)</FormLabel>
                      <FormControl>
                        <Input type="number" step="0.01" placeholder="e.g., 5000" value={field.value ?? ''} onChange={(e) => field.onChange(e.target.value === '' ? undefined : Number(e.target.value))} />
                      </FormControl>
                      <FormMessage />
                    </FormItem>
                  )}
                />
              </div>
              <Button type="submit" className="w-full md:w-auto">
                Calculate probability of ruin
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
            <CardDescription>See probability of ruin, safety loading, and financial stability recommendations.</CardDescription>
          </CardHeader>
          <CardContent className="space-y-6">
            <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
              <div className="p-4 border rounded">
                <p className="text-sm text-muted-foreground">Probability of Ruin</p>
                <p className="text-2xl font-semibold text-primary">{result.probabilityOfRuin.toFixed(2)}%</p>
                <p className="text-xs text-muted-foreground">Risk of insolvency</p>
              </div>
              <div className="p-4 border rounded">
                <p className="text-sm text-muted-foreground">Safety Loading</p>
                <p className="text-2xl font-semibold text-primary">${result.safetyLoading.toLocaleString(undefined, { maximumFractionDigits: 2 })}</p>
                <p className="text-xs text-muted-foreground">Per unit time</p>
              </div>
              <div className="p-4 border rounded">
                <p className="text-sm text-muted-foreground">Expected Claims</p>
                <p className="text-2xl font-semibold text-primary">${(result.claimArrivalRate * result.averageClaimSize).toLocaleString(undefined, { maximumFractionDigits: 2 })}</p>
                <p className="text-xs text-muted-foreground">Per unit time</p>
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
            <strong>Expected Claims Cost</strong> = Claim Arrival Rate Ã— Average Claim Size. The expected cost of claims per unit time.
          </p>
          <p>
            <strong>Safety Loading</strong> = Premium Rate - Expected Claims Cost. The excess of premiums over expected claims, providing a buffer against ruin.
          </p>
          <p>
            <strong>Probability of Ruin</strong> â‰ˆ (Expected Claims Cost / Premium Rate)^(Initial Surplus / Average Claim Size). This is the CramÃ©r-Lundberg approximation, valid when Premium Rate &gt; Expected Claims Cost (positive safety loading).
          </p>
          <p>
            <strong>Condition:</strong> If Premium Rate â‰¤ Expected Claims Cost, ruin is certain over the long term (probability = 100%).
          </p>
          <p>The CramÃ©r-Lundberg model assumes claims arrive according to a Poisson process, claim sizes are independent and identically distributed, and premiums are collected at a constant rate. Higher initial surplus and positive safety loading reduce probability of ruin.</p>
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
                <p className="text-sm text-muted-foreground">Safety Loading Ratio</p>
                <p className="text-xl font-semibold text-primary">
                  {result.premiumRate > 0 ? ((result.safetyLoading / result.premiumRate) * 100).toFixed(2) : '0.00'}%
                </p>
                <p className="text-xs text-muted-foreground">% of premium rate</p>
              </div>
              <div className="p-4 border rounded">
                <p className="text-sm text-muted-foreground">Surplus to Average Claim</p>
                <p className="text-xl font-semibold text-primary">
                  {result.averageClaimSize > 0 ? (result.initialSurplus / result.averageClaimSize).toFixed(1) : '0.0'}x
                </p>
                <p className="text-xs text-muted-foreground">Multiplier</p>
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
    <meta itemProp="name" content="The Definitive Guide to Probability of Ruin: Assessing Insurance Financial Stability" />
    <meta itemProp="description" content="A comprehensive guide to calculating and understanding probability of ruin for insurance companies, a critical metric for assessing financial stability and risk of insolvency." />
    <meta itemProp="keywords" content="probability of ruin, insurance solvency, CramÃ©r-Lundberg model, financial stability, actuarial risk, insurance capital" />
    <meta itemProp="author" content="[Your Site's Finance Team]" />
    <meta itemProp="datePublished" content="2025-01-02" />
    <meta itemProp="url" content="/definitive-probability-of-ruin-guide" />

    <h1 className="text-3xl md:text-4xl font-extrabold text-foreground mb-4" itemProp="headline">The Definitive Guide to Probability of Ruin: Assessing Insurance Financial Stability</h1>
    <p className="text-lg italic text-muted-foreground">A comprehensive guide to understanding and calculating probability of ruin, a critical metric for assessing insurance company financial stability and risk of insolvency.</p>

    <h2 className="text-2xl font-bold text-foreground mt-8 mb-4">Table of Contents</h2>
    <ul className="list-disc ml-6 space-y-2 text-primary">
        <li><a href="#overview" className="hover:underline">Overview: Probability of Ruin in Insurance</a></li>
        <li><a href="#calculation" className="hover:underline">Calculation Methods</a></li>
        <li><a href="#factors" className="hover:underline">Key Factors</a></li>
        <li><a href="#interpretation" className="hover:underline">Interpretation and Risk Levels</a></li>
    </ul>
<hr />

    <h2 id="overview" className="text-2xl font-bold text-foreground pt-8" itemProp="articleSection">Overview: Probability of Ruin in Insurance</h2>
    <p><b>Probability of ruin</b> quantifies the likelihood that an insurer's reserves will be depleted to zero or below, leading to insolvency. It is a fundamental metric in actuarial science for assessing financial stability.</p>

    <h3 className="text-xl font-semibold text-foreground mt-6">Key Concepts</h3>
    <ul>
        <li><b>Initial Surplus:</b> Starting capital or reserves available to absorb losses</li>
        <li><b>Premium Rate:</b> Premiums collected per unit time, providing income to cover claims</li>
        <li><b>Claim Arrival Rate:</b> Expected number of claims per unit time (Poisson process parameter)</li>
        <li><b>Average Claim Size:</b> Mean claim amount, representing expected severity</li>
        <li><b>Safety Loading:</b> Excess of premium rate over expected claims cost, providing buffer against ruin</li>
    </ul>

<hr />

    <h2 id="calculation" className="text-2xl font-bold text-foreground pt-8" itemProp="articleSection">Calculation Methods</h2>
    
    <h3 className="text-xl font-semibold text-foreground mt-6">CramÃ©r-Lundberg Model</h3>
    <p>The CramÃ©r-Lundberg model is a classical actuarial model for insurance risk. It assumes:</p>
    <ul>
        <li>Claims arrive according to a Poisson process with rate Î»</li>
        <li>Claim sizes are independent and identically distributed with mean Î¼</li>
        <li>Premiums are collected at constant rate c</li>
    </ul>

    <h3 className="text-xl font-semibold text-foreground mt-6">Approximation Formula</h3>
    <p>For practical purposes, probability of ruin is approximated as:</p>
    <p><b>Ïˆ(u) â‰ˆ (Î»Î¼/c)^(u/Î¼)</b></p>
    <p>Where:</p>
    <ul>
        <li>Ïˆ(u) = Probability of ruin</li>
        <li>u = Initial surplus</li>
        <li>Î» = Claim arrival rate</li>
        <li>Î¼ = Average claim size</li>
        <li>c = Premium rate</li>
    </ul>
    <p>This approximation requires positive safety loading (c &gt; Î»Î¼). If c â‰¤ Î»Î¼, ruin is certain over the long term.</p>

<hr />

    <h2 id="factors" className="text-2xl font-bold text-foreground pt-8" itemProp="articleSection">Key Factors</h2>
    
    <h3 className="text-xl font-semibold text-foreground mt-6">Initial Surplus</h3>
    <p>Higher initial surplus (capital/reserves) exponentially reduces probability of ruin. Each unit increase in surplus provides significant reduction in ruin probability, making adequate capitalization critical.</p>

    <h3 className="text-xl font-semibold text-foreground mt-6">Safety Loading</h3>
    <p>Positive safety loading (premium rate &gt; expected claims cost) is essential for financial stability. Higher safety loading reduces probability of ruin by providing buffer against unexpected losses.</p>

    <h3 className="text-xl font-semibold text-foreground mt-6">Claim Characteristics</h3>
    <p>Higher claim arrival rates and larger average claim sizes increase probability of ruin. Effective underwriting, risk selection, and claims management reduce these factors and improve financial stability.</p>

<hr />

    <h2 id="interpretation" className="text-2xl font-bold text-foreground pt-8" itemProp="articleSection">Interpretation and Risk Levels</h2>
    
    <h3 className="text-xl font-semibold text-foreground mt-6">Risk Levels</h3>
    <ul>
        <li><b>Below 1%:</b> Very low risk, strong financial stability</li>
        <li><b>1-5%:</b> Acceptable risk, manageable with adequate capital</li>
        <li><b>5-10%:</b> Moderate risk, requires attention and risk mitigation</li>
        <li><b>Above 10%:</b> High risk, immediate action required</li>
    </ul>

    <h3 className="text-xl font-semibold text-foreground mt-6">Risk Mitigation</h3>
    <p>Reduce probability of ruin by: increasing initial surplus/capital, maintaining positive safety loading in premiums, purchasing reinsurance, diversifying risk exposure, and implementing effective risk management controls.</p>

<hr />

    <h2 className="text-2xl font-bold text-foreground pt-8" itemProp="articleSection">Conclusion</h2>
    <p><b>Probability of ruin</b> is a critical metric for assessing insurance financial stability. Lower values indicate better financial health and lower risk of insolvency. Maintain adequate capital, positive safety loading, and effective risk management to ensure low ruin probability and long-term financial stability.</p>
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
          <p>This tool calculates probability of ruin for insurance companies based on initial surplus, premium rate, claim arrival rate, and average claim size.</p>
          <p>Outputs include probability of ruin, safety loading, expected claims cost, status, recommendations, an action plan, and supporting metrics.</p>
          <p>Formula, steps, guide content, related tools, and FAQs ensure humans or AI assistants can interpret the methodology instantly.</p>
        </CardContent>
      </Card>
    </div>
  );
}

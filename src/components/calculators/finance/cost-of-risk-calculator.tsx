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
  insurancePremiums: z.number({ invalid_type_error: 'Enter insurance premiums' }).min(0),
  retainedLosses: z.number({ invalid_type_error: 'Enter retained losses' }).min(0),
  riskControlCosts: z.number({ invalid_type_error: 'Enter risk control costs' }).min(0),
  administrativeCosts: z.number({ invalid_type_error: 'Enter administrative costs' }).min(0),
  indirectCosts: z.number({ invalid_type_error: 'Enter indirect costs' }).min(0).optional(),
});

type FormValues = z.infer<typeof formSchema>;

type ResultPayload = {
  insurancePremiums: number;
  retainedLosses: number;
  riskControlCosts: number;
  administrativeCosts: number;
  indirectCosts: number;
  totalCostOfRisk: number;
  status: 'optimal' | 'good' | 'moderate' | 'low';
  interpretation: string;
  recommendations: string[];
  plan: { label: string; detail: string }[];
};

const steps = [
  'Enter insurance premiums (costs paid to transfer risk to insurers).',
  'Enter retained losses (self-insured losses, deductibles).',
  'Enter risk control costs (loss prevention, safety programs).',
  'Enter administrative costs (risk management program expenses).',
  'Enter indirect costs (business interruption, reputational damage) - optional.',
  'Review total cost of risk and recommendations.',
];

const faqs = [
  {
    question: 'What is Total Cost of Risk (TCOR)?',
    answer:
      'Total Cost of Risk (TCOR) is a comprehensive metric that quantifies all costs associated with an organization\'s risk management activities, including insurance premiums, retained losses, risk control costs, administrative costs, and indirect costs.',
  },
  {
    question: 'What are insurance premiums?',
    answer:
      'Insurance premiums are the costs paid to transfer risk to insurance carriers. This includes premiums for property, liability, workers\' compensation, and other insurance policies purchased to cover potential losses.',
  },
  {
    question: 'What are retained losses?',
    answer:
      'Retained losses are expenses from losses that the organization chooses to self-insure, including deductibles, self-insured retention, and losses below insurance thresholds. These represent risks the organization bears directly.',
  },
  {
    question: 'What are risk control costs?',
    answer:
      'Risk control costs are investments in measures to prevent or mitigate losses, such as safety programs, training, security systems, loss prevention initiatives, and risk management controls designed to reduce risk exposure.',
  },
  {
    question: 'What are administrative costs?',
    answer:
      'Administrative costs are internal and external expenses related to managing the risk management program, including salaries, consulting fees, legal services, claims administration, and risk management department overhead.',
  },
  {
    question: 'What are indirect costs?',
    answer:
      'Indirect costs are harder-to-quantify expenses resulting from losses, such as business interruption, reputational damage, loss of productivity, customer impact, and other consequences that extend beyond direct loss amounts.',
  },
  {
    question: 'How is TCOR calculated?',
    answer:
      'TCOR = Insurance Premiums + Retained Losses + Risk Control Costs + Administrative Costs + Indirect Costs. This provides a comprehensive view of all risk-related expenses.',
  },
  {
    question: 'What is a good TCOR?',
    answer:
      'TCOR acceptability depends on industry, organization size, and risk profile. Lower TCOR relative to revenue or assets generally indicates more efficient risk management. Compare to industry benchmarks and historical trends.',
  },
  {
    question: 'How can I reduce TCOR?',
    answer:
      'Reduce TCOR by: improving risk control to reduce losses, optimizing insurance coverage and premiums, reducing administrative costs through efficiency, minimizing retained losses through better risk management, and quantifying and managing indirect costs.',
  },
  {
    question: 'When should I consult a risk manager?',
    answer:
      'Consult a risk manager for comprehensive TCOR analysis, risk management optimization, insurance program review, loss prevention strategies, and strategic risk management planning. Professional analysis provides detailed recommendations for reducing TCOR.',
  },
];

const relatedCalculators = [
  {
    name: 'Expected Loss Frequency/Severity Calculator',
    slug: 'expected-loss-frequency-severity-calculator',
    description: 'Calculate loss frequency, severity, and expected loss for risk assessment.',
  },
  {
    name: 'Loss Ratio Calculator',
    slug: 'loss-ratio-calculator',
    description: 'Calculate insurance loss ratio to evaluate underwriting performance.',
  },
  {
    name: 'Insurance Reserve Requirement Calculator',
    slug: 'insurance-reserve-requirement-calculator',
    description: 'Calculate insurance reserve requirements for financial stability.',
  },
  {
    name: 'Probability of Ruin Calculator',
    slug: 'probability-of-ruin-calculator',
    description: 'Calculate probability of ruin for insurance financial stability assessment.',
  },
];

const baseUrl = 'https://mycalculating.com/finance/cost-of-risk-calculator';

const schemaMarkup = {
  '@context': 'https://schema.org',
  '@graph': [
    {
      '@type': 'BreadcrumbList',
      itemListElement: [
        { '@type': 'ListItem', position: 1, name: 'Home', item: 'https://mycalculating.com' },
        { '@type': 'ListItem', position: 2, name: 'Finance', item: 'https://mycalculating.com/finance' },
        { '@type': 'ListItem', position: 3, name: 'Cost of Risk Calculator', item: baseUrl },
      ],
    },
    {
      '@type': 'SoftwareApplication',
      name: 'Cost of Risk Calculator',
      applicationCategory: 'Calculator',
      operatingSystem: 'Web Browser',
      description: 'Calculate Total Cost of Risk (TCOR) including insurance premiums, retained losses, risk control costs, administrative costs, and indirect costs.',
      url: baseUrl,
      offers: { '@type': 'Offer', price: '0', priceCurrency: 'USD' },
    },
  ],
};

const calculateResult = (values: FormValues): ResultPayload => {
  const insurancePremiums = values.insurancePremiums;
  const retainedLosses = values.retainedLosses;
  const riskControlCosts = values.riskControlCosts;
  const administrativeCosts = values.administrativeCosts;
  const indirectCosts = values.indirectCosts || 0;

  // Calculate Total Cost of Risk
  const totalCostOfRisk = insurancePremiums + retainedLosses + riskControlCosts + administrativeCosts + indirectCosts;

  let status: ResultPayload['status'] = 'optimal';
  let interpretation = 'Total Cost of Risk calculated. TCOR represents all costs associated with risk management activities, providing a comprehensive view of risk-related expenses.';

  // Assess TCOR based on component analysis
  const premiumRatio = totalCostOfRisk > 0 ? (insurancePremiums / totalCostOfRisk) * 100 : 0;
  const lossRatio = totalCostOfRisk > 0 ? ((retainedLosses + indirectCosts) / totalCostOfRisk) * 100 : 0;

  if (lossRatio > 60 || premiumRatio > 80) {
    status = 'low';
    interpretation = 'High TCOR with significant losses or premiums indicates elevated risk costs. Review risk management strategies, improve loss prevention, optimize insurance coverage, and reduce retained losses to lower TCOR.';
  } else if (lossRatio > 40 || premiumRatio > 60) {
    status = 'moderate';
    interpretation = 'Moderate TCOR indicates manageable risk costs. Continue optimizing risk management, improving loss prevention, and reviewing insurance coverage to maintain or reduce TCOR.';
  } else if (lossRatio > 20 || premiumRatio > 40) {
    status = 'good';
    interpretation = 'Acceptable TCOR indicates reasonable risk costs. Maintain effective risk management, loss prevention, and insurance optimization to sustain favorable TCOR levels.';
  } else {
    status = 'optimal';
    interpretation = 'Low TCOR indicates efficient risk management. Continue maintaining effective risk controls, loss prevention, and insurance optimization to sustain low risk costs.';
  }

  const recommendations = [
    `Total Cost of Risk (TCOR): $${totalCostOfRisk.toLocaleString(undefined, { maximumFractionDigits: 2 })}. This represents all costs associated with risk management activities.`,
    `Insurance Premiums: $${insurancePremiums.toLocaleString(undefined, { maximumFractionDigits: 2 })} (${premiumRatio.toFixed(1)}% of TCOR). Review coverage adequacy and premium optimization opportunities.`,
    `Retained Losses: $${retainedLosses.toLocaleString(undefined, { maximumFractionDigits: 2 })}. Consider loss prevention strategies and risk control improvements to reduce retained losses.`,
    `Risk Control Costs: $${riskControlCosts.toLocaleString(undefined, { maximumFractionDigits: 2 })}. These investments in loss prevention should reduce overall TCOR by preventing losses.`,
    `Administrative Costs: $${administrativeCosts.toLocaleString(undefined, { maximumFractionDigits: 2 })}. Optimize risk management program efficiency to reduce administrative overhead.`,
  ];
  if (indirectCosts > 0) {
    recommendations.push(`Indirect Costs: $${indirectCosts.toLocaleString(undefined, { maximumFractionDigits: 2 })}. Quantify and manage indirect costs to reduce overall TCOR.`);
  }
  if (lossRatio > 50) {
    recommendations.push('High loss ratio indicates significant retained and indirect losses. Improve loss prevention, risk controls, and claims management to reduce losses and lower TCOR.');
  }
  if (premiumRatio > 70) {
    recommendations.push('High premium ratio suggests significant insurance costs. Review coverage needs, shop for competitive premiums, and optimize insurance program to reduce TCOR.');
  }

  const plan = [
    { label: 'This Week', detail: `Review TCOR: $${totalCostOfRisk.toLocaleString(undefined, { maximumFractionDigits: 2 })} and component breakdown. Assess each component to identify optimization opportunities and cost reduction strategies.` },
    { label: 'This Month', detail: 'If TCOR is high, take action: improve loss prevention and risk controls, optimize insurance coverage and premiums, reduce administrative costs, and quantify indirect costs to lower overall TCOR.' },
    { label: 'Ongoing', detail: 'Continuously monitor TCOR and component trends. Maintain effective risk management, loss prevention, insurance optimization, and cost control to ensure TCOR remains within acceptable levels and supports organizational objectives.' },
  ];

  return {
    insurancePremiums,
    retainedLosses,
    riskControlCosts,
    administrativeCosts,
    indirectCosts,
    totalCostOfRisk,
    status,
    interpretation,
    recommendations,
    plan,
  };
};

export default function CostOfRiskCalculator() {
  const [result, setResult] = useState<ResultPayload | null>(null);

  const form = useForm<FormValues>({
    resolver: zodResolver(formSchema),
    defaultValues: {
      insurancePremiums: undefined,
      retainedLosses: undefined,
      riskControlCosts: undefined,
      administrativeCosts: undefined,
      indirectCosts: undefined,
    },
  });

  return (
    <div className="space-y-8">
      <Script id="cost-of-risk-schema" type="application/ld+json" strategy="afterInteractive" dangerouslySetInnerHTML={{ __html: JSON.stringify(schemaMarkup) }} />

      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <Heart className="h-5 w-5" />
            Cost of Risk Calculator
          </CardTitle>
          <CardDescription>Calculate Total Cost of Risk (TCOR) including insurance premiums, retained losses, risk control costs, administrative costs, and indirect costs.</CardDescription>
        </CardHeader>
      </Card>

      <Card>
        <CardHeader>
          <CardTitle>Input your information</CardTitle>
        </CardHeader>
        <CardContent>
          <Form {...form}>
            <form onSubmit={(e) => {
              e.preventDefault();
              e.stopPropagation();
              try {
                form.handleSubmit((values) => {
                  try {
                    setResult(calculateResult(values));
                  } catch (error) {
                    console.error('Error calculating result:', error);
                    alert('An error occurred while calculating. Please check the console for details.');
                  }
                }, (errors) => {
                  console.log('Form validation errors:', errors);
                })(e);
              } catch (error) {
                console.error('Error in form submission:', error);
                e.preventDefault();
                e.stopPropagation();
              }
              return false;
            }} className="space-y-6">
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <FormField
                  control={form.control}
                  name="insurancePremiums"
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel>Insurance Premiums ($)</FormLabel>
                      <FormControl>
                        <Input type="number" step="0.01" placeholder="e.g., 1000000" value={field.value ?? ''} onChange={(e) => field.onChange(e.target.value === '' ? undefined : Number(e.target.value))} />
                      </FormControl>
                      <FormMessage />
                    </FormItem>
                  )}
                />
                <FormField
                  control={form.control}
                  name="retainedLosses"
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel>Retained Losses ($)</FormLabel>
                      <FormControl>
                        <Input type="number" step="0.01" placeholder="e.g., 500000" value={field.value ?? ''} onChange={(e) => field.onChange(e.target.value === '' ? undefined : Number(e.target.value))} />
                      </FormControl>
                      <FormMessage />
                    </FormItem>
                  )}
                />
                <FormField
                  control={form.control}
                  name="riskControlCosts"
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel>Risk Control Costs ($)</FormLabel>
                      <FormControl>
                        <Input type="number" step="0.01" placeholder="e.g., 200000" value={field.value ?? ''} onChange={(e) => field.onChange(e.target.value === '' ? undefined : Number(e.target.value))} />
                      </FormControl>
                      <FormMessage />
                    </FormItem>
                  )}
                />
                <FormField
                  control={form.control}
                  name="administrativeCosts"
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel>Administrative Costs ($)</FormLabel>
                      <FormControl>
                        <Input type="number" step="0.01" placeholder="e.g., 100000" value={field.value ?? ''} onChange={(e) => field.onChange(e.target.value === '' ? undefined : Number(e.target.value))} />
                      </FormControl>
                      <FormMessage />
                    </FormItem>
                  )}
                />
                <FormField
                  control={form.control}
                  name="indirectCosts"
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel>Indirect Costs ($) - Optional</FormLabel>
                      <FormControl>
                        <Input type="number" step="0.01" placeholder="e.g., 50000" value={field.value ?? ''} onChange={(e) => field.onChange(e.target.value === '' ? undefined : Number(e.target.value))} />
                      </FormControl>
                      <FormMessage />
                    </FormItem>
                  )}
                />
              </div>
              <Button 
                type="button" 
                className="w-full md:w-auto"
                onClick={(e) => {
                  e.preventDefault();
                  e.stopPropagation();
                  form.handleSubmit((values) => {
                    try {
                      setResult(calculateResult(values));
                    } catch (error) {
                      console.error('Error calculating result:', error);
                      alert('An error occurred while calculating. Please check the console for details.');
                    }
                  }, (errors) => {
                    console.log('Form validation errors:', errors);
                  })();
                }}
              >
                Calculate cost of risk
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
            <CardDescription>See Total Cost of Risk (TCOR), component breakdown, and recommendations.</CardDescription>
          </CardHeader>
          <CardContent className="space-y-6">
            <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
              <div className="p-4 border rounded">
                <p className="text-sm text-muted-foreground">Total Cost of Risk</p>
                <p className="text-2xl font-semibold text-primary">${result.totalCostOfRisk.toLocaleString(undefined, { maximumFractionDigits: 2 })}</p>
                <p className="text-xs text-muted-foreground">TCOR</p>
              </div>
              <div className="p-4 border rounded">
                <p className="text-sm text-muted-foreground">Insurance Premiums</p>
                <p className="text-2xl font-semibold text-primary">${result.insurancePremiums.toLocaleString(undefined, { maximumFractionDigits: 2 })}</p>
                <p className="text-xs text-muted-foreground">{result.totalCostOfRisk > 0 ? ((result.insurancePremiums / result.totalCostOfRisk) * 100).toFixed(1) : '0'}% of TCOR</p>
              </div>
              <div className="p-4 border rounded">
                <p className="text-sm text-muted-foreground">Retained Losses</p>
                <p className="text-2xl font-semibold text-primary">${result.retainedLosses.toLocaleString(undefined, { maximumFractionDigits: 2 })}</p>
                <p className="text-xs text-muted-foreground">{result.totalCostOfRisk > 0 ? ((result.retainedLosses / result.totalCostOfRisk) * 100).toFixed(1) : '0'}% of TCOR</p>
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
            <strong>Total Cost of Risk (TCOR)</strong> = Insurance Premiums + Retained Losses + Risk Control Costs + Administrative Costs + Indirect Costs.
          </p>
          <p>
            <strong>Insurance Premiums:</strong> Costs paid to transfer risk to insurance carriers.
          </p>
          <p>
            <strong>Retained Losses:</strong> Self-insured losses, deductibles, and losses below insurance thresholds.
          </p>
          <p>
            <strong>Risk Control Costs:</strong> Investments in loss prevention, safety programs, and risk management controls.
          </p>
          <p>
            <strong>Administrative Costs:</strong> Internal and external expenses for managing the risk management program.
          </p>
          <p>
            <strong>Indirect Costs:</strong> Business interruption, reputational damage, and other consequences of losses.
          </p>
          <p>TCOR provides a comprehensive view of all risk-related expenses, helping organizations evaluate and optimize risk management strategies to reduce overall costs.</p>
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
                <p className="text-sm text-muted-foreground">Risk Control Costs</p>
                <p className="text-xl font-semibold text-primary">
                  ${result.riskControlCosts.toLocaleString(undefined, { maximumFractionDigits: 2 })}
                </p>
                <p className="text-xs text-muted-foreground">{result.totalCostOfRisk > 0 ? ((result.riskControlCosts / result.totalCostOfRisk) * 100).toFixed(1) : '0'}% of TCOR</p>
              </div>
              <div className="p-4 border rounded">
                <p className="text-sm text-muted-foreground">Administrative Costs</p>
                <p className="text-xl font-semibold text-primary">
                  ${result.administrativeCosts.toLocaleString(undefined, { maximumFractionDigits: 2 })}
                </p>
                <p className="text-xs text-muted-foreground">{result.totalCostOfRisk > 0 ? ((result.administrativeCosts / result.totalCostOfRisk) * 100).toFixed(1) : '0'}% of TCOR</p>
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
    <meta itemProp="name" content="The Definitive Guide to Total Cost of Risk: Comprehensive Risk Management Cost Analysis" />
    <meta itemProp="description" content="A comprehensive guide to calculating and understanding Total Cost of Risk (TCOR), a critical metric for evaluating and optimizing risk management strategies." />
    <meta itemProp="keywords" content="total cost of risk, TCOR, risk management costs, insurance premiums, retained losses, risk control" />
    <meta itemProp="author" content="[Your Site's Finance Team]" />
    <meta itemProp="datePublished" content="2025-01-02" />
    <meta itemProp="url" content="/definitive-cost-of-risk-guide" />

    <h1 className="text-3xl md:text-4xl font-extrabold text-foreground mb-4" itemProp="headline">The Definitive Guide to Total Cost of Risk: Comprehensive Risk Management Cost Analysis</h1>
    <p className="text-lg italic text-muted-foreground">A comprehensive guide to understanding and calculating Total Cost of Risk (TCOR), a critical metric for evaluating and optimizing risk management strategies and reducing overall risk-related expenses.</p>

    <h2 className="text-2xl font-bold text-foreground mt-8 mb-4">Table of Contents</h2>
    <ul className="list-disc ml-6 space-y-2 text-primary">
        <li><a href="#overview" className="hover:underline">Overview: Total Cost of Risk</a></li>
        <li><a href="#components" className="hover:underline">TCOR Components</a></li>
        <li><a href="#calculation" className="hover:underline">TCOR Calculation</a></li>
        <li><a href="#optimization" className="hover:underline">TCOR Optimization</a></li>
    </ul>
<hr />

    <h2 id="overview" className="text-2xl font-bold text-foreground pt-8" itemProp="articleSection">Overview: Total Cost of Risk</h2>
    <p><b>Total Cost of Risk (TCOR)</b> is a comprehensive metric that quantifies all costs associated with an organization's risk management activities. It provides a holistic view of risk-related expenses, enabling informed decision-making and optimization.</p>

    <h3 className="text-xl font-semibold text-foreground mt-6">Key Concepts</h3>
    <ul>
        <li><b>Insurance Premiums:</b> Costs paid to transfer risk to insurance carriers</li>
        <li><b>Retained Losses:</b> Self-insured losses, deductibles, and losses below insurance thresholds</li>
        <li><b>Risk Control Costs:</b> Investments in loss prevention, safety programs, and risk management controls</li>
        <li><b>Administrative Costs:</b> Internal and external expenses for managing the risk management program</li>
        <li><b>Indirect Costs:</b> Business interruption, reputational damage, and other consequences of losses</li>
    </ul>

<hr />

    <h2 id="components" className="text-2xl font-bold text-foreground pt-8" itemProp="articleSection">TCOR Components</h2>
    
    <h3 className="text-xl font-semibold text-foreground mt-6">Insurance Premiums</h3>
    <p>Insurance premiums represent the costs paid to transfer risk to insurance carriers. This includes premiums for property, liability, workers' compensation, and other insurance policies. Review coverage adequacy and premium optimization opportunities.</p>

    <h3 className="text-xl font-semibold text-foreground mt-6">Retained Losses</h3>
    <p>Retained losses are expenses from losses that the organization chooses to self-insure, including deductibles, self-insured retention, and losses below insurance thresholds. Consider loss prevention strategies and risk control improvements to reduce retained losses.</p>

    <h3 className="text-xl font-semibold text-foreground mt-6">Risk Control Costs</h3>
    <p>Risk control costs are investments in measures to prevent or mitigate losses, such as safety programs, training, security systems, and loss prevention initiatives. These investments should reduce overall TCOR by preventing losses.</p>

<hr />

    <h2 id="calculation" className="text-2xl font-bold text-foreground pt-8" itemProp="articleSection">TCOR Calculation</h2>
    
    <h3 className="text-xl font-semibold text-foreground mt-6">Formula</h3>
    <p><b>TCOR = Insurance Premiums + Retained Losses + Risk Control Costs + Administrative Costs + Indirect Costs</b></p>

    <h3 className="text-xl font-semibold text-foreground mt-6">Example</h3>
    <p>For an organization with:</p>
    <ul>
        <li>Insurance Premiums: $1,000,000</li>
        <li>Retained Losses: $500,000</li>
        <li>Risk Control Costs: $200,000</li>
        <li>Administrative Costs: $100,000</li>
        <li>Indirect Costs: $50,000</li>
    </ul>
    <p>TCOR = $1,000,000 + $500,000 + $200,000 + $100,000 + $50,000 = $1,850,000</p>

<hr />

    <h2 id="optimization" className="text-2xl font-bold text-foreground pt-8" itemProp="articleSection">TCOR Optimization</h2>
    
    <h3 className="text-xl font-semibold text-foreground mt-6">Reducing TCOR</h3>
    <p>Reduce TCOR by: improving risk control to reduce losses, optimizing insurance coverage and premiums, reducing administrative costs through efficiency, minimizing retained losses through better risk management, and quantifying and managing indirect costs.</p>

    <h3 className="text-xl font-semibold text-foreground mt-6">Best Practices</h3>
    <p>Best practices include: comprehensive risk assessment, effective loss prevention programs, insurance program optimization, efficient risk management administration, and continuous monitoring and improvement of TCOR components.</p>

<hr />

    <h2 className="text-2xl font-bold text-foreground pt-8" itemProp="articleSection">Conclusion</h2>
    <p><b>Total Cost of Risk (TCOR)</b> provides a comprehensive view of all risk-related expenses. Monitor TCOR regularly, optimize each component, and implement effective risk management strategies to reduce overall costs and improve organizational efficiency.</p>
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
          <p>This tool calculates Total Cost of Risk (TCOR) including insurance premiums, retained losses, risk control costs, administrative costs, and indirect costs.</p>
          <p>Outputs include TCOR, component breakdown, status, recommendations, an action plan, and supporting metrics.</p>
          <p>Formula, steps, guide content, related tools, and FAQs ensure humans or AI assistants can interpret the methodology instantly.</p>
        </CardContent>
      </Card>
    </div>
  );
}

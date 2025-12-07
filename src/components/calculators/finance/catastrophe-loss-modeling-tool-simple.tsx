'use client';

import React, { useState } from 'react';
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
  catastrophicLosses: z.number({ invalid_type_error: 'Enter catastrophic losses' }).min(0),
  netPremiumsEarned: z.number({ invalid_type_error: 'Enter net premiums earned' }).min(0),
});

type FormValues = z.infer<typeof formSchema>;

type ResultPayload = {
  catastrophicLosses: number;
  netPremiumsEarned: number;
  catastropheRatio: number;
  status: 'optimal' | 'good' | 'moderate' | 'low';
  interpretation: string;
  recommendations: string[];
  plan: { label: string; detail: string }[];
};

const steps = [
  'Enter catastrophic losses (claims and loss adjustment expenses from natural disasters and catastrophic events).',
  'Enter net premiums earned (premium income after deducting reinsurance premiums ceded).',
  'Review catastrophe ratio, exposure assessment, and recommendations.',
];

const faqs = [
  {
    question: 'What is catastrophe loss modeling?',
    answer:
      'Catastrophe loss modeling estimates potential losses from catastrophic events like hurricanes, earthquakes, floods, and wildfires. It helps insurers assess exposure, set premiums, determine reinsurance needs, and ensure financial stability.',
  },
  {
    question: 'What is catastrophe ratio?',
    answer:
      'Catastrophe ratio is the proportion of catastrophic losses relative to net premiums earned, calculated as (Catastrophic Losses / Net Premiums Earned) × 100. It measures exposure to catastrophic events as a percentage of premium income.',
  },
  {
    question: 'What are catastrophic losses?',
    answer:
      'Catastrophic losses are claims and loss adjustment expenses related to natural disasters and other catastrophic events, such as hurricanes, earthquakes, floods, wildfires, tornadoes, and other extreme events that cause widespread damage.',
  },
  {
    question: 'What are net premiums earned?',
    answer:
      'Net premiums earned are premium income after deducting reinsurance premiums ceded to other insurers. This represents the net premium income retained by the insurer after reinsurance costs.',
  },
  {
    question: 'What is a good catastrophe ratio?',
    answer:
      'Lower catastrophe ratio indicates lower exposure to catastrophic events. Generally, ratios below 5% are favorable, 5-10% is moderate, 10-20% is high, and above 20% indicates very high catastrophic exposure requiring attention.',
  },
  {
    question: 'How can I reduce catastrophe exposure?',
    answer:
      'Reduce catastrophe exposure by: purchasing reinsurance, diversifying geographic exposure, avoiding high-risk areas, implementing risk mitigation measures, and maintaining adequate capital reserves for catastrophic events.',
  },
  {
    question: 'What are limitations of simple catastrophe modeling?',
    answer:
      'Simple catastrophe modeling provides basic exposure assessment. Comprehensive models consider geographic exposure, building characteristics, historical loss data, and event probabilities. Use simple models for screening, comprehensive models for detailed analysis.',
  },
  {
    question: 'How does catastrophe ratio relate to reinsurance?',
    answer:
      'High catastrophe ratio may indicate need for reinsurance to transfer catastrophic risk. Reinsurance helps protect against extreme losses from catastrophic events, reducing financial impact and ensuring solvency.',
  },
  {
    question: 'What is the difference between simple and comprehensive catastrophe models?',
    answer:
      'Simple models use basic ratios and historical data. Comprehensive models consider geographic exposure, building characteristics, event probabilities, correlation, and detailed loss scenarios. Use comprehensive models for detailed risk assessment.',
  },
  {
    question: 'When should I consult a catastrophe modeler?',
    answer:
      'Consult a catastrophe modeler for comprehensive risk assessment, reinsurance decisions, pricing, capital requirements, and regulatory compliance. Professional catastrophe modeling provides detailed exposure analysis and risk management recommendations.',
  },
];

const relatedCalculators = [
  {
    name: 'Insurance Portfolio Loss Distribution Calculator',
    slug: 'insurance-portfolio-loss-distribution-calculator',
    description: 'Calculate insurance portfolio loss distribution for risk assessment.',
  },
  {
    name: 'Expected Loss Frequency/Severity Calculator',
    slug: 'expected-loss-frequency-severity-calculator',
    description: 'Calculate loss frequency, severity, and expected loss.',
  },
  {
    name: 'Insurance Reserve Requirement Calculator',
    slug: 'insurance-reserve-requirement-calculator',
    description: 'Calculate insurance reserve requirements for financial stability.',
  },
  {
    name: 'Solvency Margin Calculator',
    slug: 'solvency-margin-calculator',
    description: 'Calculate solvency margin to assess financial stability.',
  },
];

const baseUrl = 'https://mycalculating.com/category/finance/catastrophe-loss-modeling-tool-simple';

const schemaMarkup = {
  '@context': 'https://schema.org',
  '@graph': [
    {
      '@type': 'BreadcrumbList',
      itemListElement: [
        { '@type': 'ListItem', position: 1, name: 'Home', item: 'https://mycalculating.com' },
        { '@type': 'ListItem', position: 2, name: 'Finance', item: 'https://mycalculating.com/category/finance' },
        { '@type': 'ListItem', position: 3, name: 'Catastrophe Loss Modeling Tool (Simple)', item: baseUrl },
      ],
    },
    {
      '@type': 'SoftwareApplication',
      name: 'Catastrophe Loss Modeling Tool (Simple)',
      applicationCategory: 'Calculator',
      operatingSystem: 'Web Browser',
      description: 'Calculate catastrophe ratio and assess catastrophic loss exposure based on catastrophic losses and net premiums earned.',
      url: baseUrl,
      offers: { '@type': 'Offer', price: '0', priceCurrency: 'USD' },
    },
  ],
};

const calculateResult = (values: FormValues): ResultPayload => {
  const catastrophicLosses = values.catastrophicLosses;
  const netPremiumsEarned = values.netPremiumsEarned;

  // Calculate catastrophe ratio
  const catastropheRatio = netPremiumsEarned > 0 ? (catastrophicLosses / netPremiumsEarned) * 100 : 0;

  let status: ResultPayload['status'] = 'optimal';
  let interpretation = 'Catastrophe ratio calculated. This metric helps assess exposure to catastrophic events and evaluate reinsurance needs and financial stability.';

  if (catastropheRatio >= 20) {
    status = 'low';
    interpretation = 'Very high catastrophe ratio (≥20%) indicates extremely high exposure to catastrophic events. Immediate action required: purchase reinsurance, reduce geographic exposure, or increase capital reserves to manage catastrophic risk and ensure financial stability.';
  } else if (catastropheRatio >= 10) {
    status = 'moderate';
    interpretation = 'High catastrophe ratio (10-20%) indicates elevated exposure to catastrophic events. Consider purchasing reinsurance, diversifying geographic exposure, or implementing risk mitigation measures to reduce catastrophic exposure.';
  } else if (catastropheRatio >= 5) {
    status = 'good';
    interpretation = 'Moderate catastrophe ratio (5-10%) indicates manageable exposure. Monitor regularly, maintain adequate reinsurance, and ensure capital reserves can cover potential catastrophic losses.';
  } else {
    status = 'optimal';
    interpretation = 'Low catastrophe ratio (<5%) indicates favorable exposure to catastrophic events. Continue maintaining appropriate reinsurance, geographic diversification, and capital reserves to sustain low catastrophic exposure.';
  }

  const recommendations = [
    `Catastrophe Ratio: ${catastropheRatio.toFixed(2)}%. This represents the proportion of catastrophic losses relative to net premiums earned, measuring exposure to catastrophic events.`,
    `Catastrophic Losses: $${catastrophicLosses.toLocaleString(undefined, { maximumFractionDigits: 2 })}. These losses from natural disasters and catastrophic events impact financial stability and require adequate reserves and reinsurance.`,
    `Net Premiums Earned: $${netPremiumsEarned.toLocaleString(undefined, { maximumFractionDigits: 2 })}. This represents premium income after reinsurance costs, providing the base for calculating catastrophe exposure.`,
  ];
  if (catastropheRatio >= 10) {
    recommendations.push('High catastrophe ratio requires immediate attention. Purchase reinsurance to transfer catastrophic risk, reduce geographic exposure in high-risk areas, or increase capital reserves to manage catastrophic exposure and ensure financial stability.');
  } else if (catastropheRatio >= 5) {
    recommendations.push('Moderate catastrophe ratio should be monitored. Maintain adequate reinsurance coverage, diversify geographic exposure, and ensure capital reserves can cover potential catastrophic losses to manage exposure effectively.');
  } else {
    recommendations.push('Low catastrophe ratio indicates favorable exposure. Continue maintaining appropriate reinsurance, geographic diversification, and capital reserves to sustain low catastrophic exposure and financial stability.');
  }
  if (catastrophicLosses > netPremiumsEarned * 0.1) {
    recommendations.push('Catastrophic losses exceeding 10% of net premiums indicate significant exposure. Review reinsurance program, geographic exposure, and risk mitigation strategies to reduce catastrophic risk.');
  }

  const plan = [
    { label: 'This Week', detail: `Review catastrophe ratio: ${catastropheRatio.toFixed(2)}% and catastrophic losses: $${catastrophicLosses.toLocaleString(undefined, { maximumFractionDigits: 2 })}. Assess exposure to catastrophic events and evaluate reinsurance needs.` },
    { label: 'This Month', detail: 'If catastrophe ratio exceeds 10%, take immediate action: purchase reinsurance to transfer catastrophic risk, reduce geographic exposure in high-risk areas, or increase capital reserves to manage catastrophic exposure effectively.' },
    { label: 'Ongoing', detail: 'Continuously monitor catastrophe ratio and catastrophic losses. Maintain adequate reinsurance, diversify geographic exposure, and ensure capital reserves can cover potential catastrophic losses to ensure financial stability and manage catastrophic risk effectively.' },
  ];

  return {
    catastrophicLosses,
    netPremiumsEarned,
    catastropheRatio,
    status,
    interpretation,
    recommendations,
    plan,
  };
};

export default function CatastropheLossModelingToolSimple() {
  const [result, setResult] = useState<ResultPayload | null>(null);

  const form = useForm<FormValues>({
    resolver: zodResolver(formSchema),
    defaultValues: {
      catastrophicLosses: undefined,
      netPremiumsEarned: undefined,
    },
  });

  return (
    <div className="space-y-8">
      <Script id="catastrophe-loss-schema" type="application/ld+json" strategy="afterInteractive" dangerouslySetInnerHTML={{ __html: JSON.stringify(schemaMarkup) }} />

      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <Heart className="h-5 w-5" />
            Catastrophe Loss Modeling Tool (Simple)
          </CardTitle>
          <CardDescription>Calculate catastrophe ratio and assess catastrophic loss exposure based on catastrophic losses and net premiums earned.</CardDescription>
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
                  name="catastrophicLosses"
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel>Catastrophic Losses ($)</FormLabel>
                      <FormControl>
                        <Input type="number" step="0.01" placeholder="e.g., 1000000" value={field.value ?? ''} onChange={(e) => field.onChange(e.target.value === '' ? undefined : Number(e.target.value))} />
                      </FormControl>
                      <FormMessage />
                    </FormItem>
                  )}
                />
                <FormField
                  control={form.control}
                  name="netPremiumsEarned"
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel>Net Premiums Earned ($)</FormLabel>
                      <FormControl>
                        <Input type="number" step="0.01" placeholder="e.g., 20000000" value={field.value ?? ''} onChange={(e) => field.onChange(e.target.value === '' ? undefined : Number(e.target.value))} />
                      </FormControl>
                      <FormMessage />
                    </FormItem>
                  )}
                />
              </div>
              <Button type="submit" className="w-full md:w-auto">
                Calculate catastrophe exposure
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
            <CardDescription>See catastrophe ratio, exposure assessment, and recommendations.</CardDescription>
          </CardHeader>
          <CardContent className="space-y-6">
            <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
              <div className="p-4 border rounded">
                <p className="text-sm text-muted-foreground">Catastrophe Ratio</p>
                <p className="text-2xl font-semibold text-primary">{result.catastropheRatio.toFixed(2)}%</p>
                <p className="text-xs text-muted-foreground">% of premiums</p>
              </div>
              <div className="p-4 border rounded">
                <p className="text-sm text-muted-foreground">Catastrophic Losses</p>
                <p className="text-2xl font-semibold text-primary">${result.catastrophicLosses.toLocaleString(undefined, { maximumFractionDigits: 2 })}</p>
                <p className="text-xs text-muted-foreground">Total losses</p>
              </div>
              <div className="p-4 border rounded">
                <p className="text-sm text-muted-foreground">Net Premiums</p>
                <p className="text-2xl font-semibold text-primary">${result.netPremiumsEarned.toLocaleString(undefined, { maximumFractionDigits: 2 })}</p>
                <p className="text-xs text-muted-foreground">Earned</p>
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
            <strong>Catastrophe Ratio</strong> = (Catastrophic Losses / Net Premiums Earned) × 100. This metric measures the proportion of catastrophic losses relative to net premiums earned, indicating exposure to catastrophic events.
          </p>
          <p>
            <strong>Catastrophic Losses:</strong> Claims and loss adjustment expenses related to natural disasters and catastrophic events, such as hurricanes, earthquakes, floods, and wildfires.
          </p>
          <p>
            <strong>Net Premiums Earned:</strong> Premium income after deducting reinsurance premiums ceded to other insurers, representing net premium income retained by the insurer.
          </p>
          <p>This simple catastrophe modeling tool provides basic exposure assessment. Comprehensive catastrophe models consider geographic exposure, building characteristics, historical loss data, and event probabilities for detailed risk analysis.</p>
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
                <p className="text-sm text-muted-foreground">Loss to Premium Ratio</p>
                <p className="text-xl font-semibold text-primary">
                  {result.catastropheRatio.toFixed(2)}%
                </p>
                <p className="text-xs text-muted-foreground">Exposure measure</p>
              </div>
              <div className="p-4 border rounded">
                <p className="text-sm text-muted-foreground">Remaining Premiums</p>
                <p className="text-xl font-semibold text-primary">
                  ${(result.netPremiumsEarned - result.catastrophicLosses).toLocaleString(undefined, { maximumFractionDigits: 2 })}
                </p>
                <p className="text-xs text-muted-foreground">After losses</p>
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
    <meta itemProp="name" content="The Definitive Guide to Catastrophe Loss Modeling: Assessing Exposure to Natural Disasters" />
    <meta itemProp="description" content="A comprehensive guide to calculating and understanding catastrophe loss modeling, a critical tool for assessing exposure to catastrophic events and ensuring financial stability." />
    <meta itemProp="keywords" content="catastrophe loss modeling, catastrophe ratio, natural disasters, reinsurance, catastrophic exposure, risk assessment" />
    <meta itemProp="author" content="[Your Site's Finance Team]" />
    <meta itemProp="datePublished" content="2025-01-02" />
    <meta itemProp="url" content="/definitive-catastrophe-loss-guide" />

    <h1 className="text-3xl md:text-4xl font-extrabold text-foreground mb-4" itemProp="headline">The Definitive Guide to Catastrophe Loss Modeling: Assessing Exposure to Natural Disasters</h1>
    <p className="text-lg italic text-muted-foreground">A comprehensive guide to understanding and calculating catastrophe loss modeling, a critical tool for assessing exposure to catastrophic events like hurricanes, earthquakes, and floods.</p>

    <h2 className="text-2xl font-bold text-foreground mt-8 mb-4">Table of Contents</h2>
    <ul className="list-disc ml-6 space-y-2 text-primary">
        <li><a href="#overview" className="hover:underline">Overview: Catastrophe Loss Modeling</a></li>
        <li><a href="#ratio" className="hover:underline">Catastrophe Ratio</a></li>
        <li><a href="#exposure" className="hover:underline">Exposure Assessment</a></li>
        <li><a href="#management" className="hover:underline">Risk Management</a></li>
    </ul>
<hr />

    <h2 id="overview" className="text-2xl font-bold text-foreground pt-8" itemProp="articleSection">Overview: Catastrophe Loss Modeling</h2>
    <p><b>Catastrophe loss modeling</b> estimates potential losses from catastrophic events like hurricanes, earthquakes, floods, and wildfires. It helps insurers assess exposure, set premiums, determine reinsurance needs, and ensure financial stability.</p>

    <h3 className="text-xl font-semibold text-foreground mt-6">Key Concepts</h3>
    <ul>
        <li><b>Catastrophic Losses:</b> Claims and loss adjustment expenses from natural disasters and catastrophic events</li>
        <li><b>Net Premiums Earned:</b> Premium income after deducting reinsurance premiums ceded</li>
        <li><b>Catastrophe Ratio:</b> Proportion of catastrophic losses relative to net premiums earned</li>
        <li><b>Geographic Exposure:</b> Concentration of insured properties in high-risk areas</li>
    </ul>

<hr />

    <h2 id="ratio" className="text-2xl font-bold text-foreground pt-8" itemProp="articleSection">Catastrophe Ratio</h2>
    
    <h3 className="text-xl font-semibold text-foreground mt-6">Formula</h3>
    <p><b>Catastrophe Ratio = (Catastrophic Losses / Net Premiums Earned) × 100</b></p>

    <h3 className="text-xl font-semibold text-foreground mt-6">Example</h3>
    <p>If catastrophic losses are $1,000,000 and net premiums earned are $20,000,000:</p>
    <ul>
        <li>Catastrophe Ratio = ($1,000,000 / $20,000,000) × 100 = 5%</li>
        <li>This means 5% of earned premiums were used to cover catastrophic losses</li>
    </ul>
    <p>Lower ratios indicate lower exposure to catastrophic events.</p>

<hr />

    <h2 id="exposure" className="text-2xl font-bold text-foreground pt-8" itemProp="articleSection">Exposure Assessment</h2>
    
    <h3 className="text-xl font-semibold text-foreground mt-6">Risk Levels</h3>
    <ul>
        <li><b>Ratio < 5%:</b> Low exposure, favorable risk profile</li>
        <li><b>Ratio 5-10%:</b> Moderate exposure, manageable with monitoring</li>
        <li><b>Ratio 10-20%:</b> High exposure, requires attention and risk mitigation</li>
        <li><b>Ratio ≥ 20%:</b> Very high exposure, immediate action required</li>
    </ul>

    <h3 className="text-xl font-semibold text-foreground mt-6">Comprehensive Modeling</h3>
    <p>Comprehensive catastrophe models consider: geographic exposure, building characteristics, historical loss data, event probabilities, correlation between events, and detailed loss scenarios. Use comprehensive models for detailed risk assessment.</p>

<hr />

    <h2 id="management" className="text-2xl font-bold text-foreground pt-8" itemProp="articleSection">Risk Management</h2>
    
    <h3 className="text-xl font-semibold text-foreground mt-6">Reducing Catastrophic Exposure</h3>
    <p>Reduce catastrophic exposure by: purchasing reinsurance to transfer risk, diversifying geographic exposure, avoiding high-risk areas, implementing risk mitigation measures, and maintaining adequate capital reserves for catastrophic events.</p>

    <h3 className="text-xl font-semibold text-foreground mt-6">Reinsurance</h3>
    <p>Reinsurance helps protect against extreme losses from catastrophic events, reducing financial impact and ensuring solvency. High catastrophe ratios may indicate need for reinsurance to transfer catastrophic risk.</p>

<hr />

    <h2 className="text-2xl font-bold text-foreground pt-8" itemProp="articleSection">Conclusion</h2>
    <p><b>Catastrophe loss modeling</b> is critical for assessing exposure to catastrophic events. Monitor catastrophe ratio regularly, maintain adequate reinsurance, diversify geographic exposure, and ensure capital reserves can cover potential catastrophic losses to ensure financial stability and manage catastrophic risk effectively.</p>
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
          <p>This tool calculates catastrophe ratio and assesses catastrophic loss exposure based on catastrophic losses and net premiums earned.</p>
          <p>Outputs include catastrophe ratio, exposure assessment, status, recommendations, an action plan, and supporting metrics.</p>
          <p>Formula, steps, guide content, related tools, and FAQs ensure humans or AI assistants can interpret the methodology instantly.</p>
        </CardContent>
      </Card>
    </div>
  );
}

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
  catastrophicLosses: z.number({ invalid_type_error: 'Enter catastrophic losses' }).min(0),
  netPremiumsEarned: z.number({ invalid_type_error: 'Enter net premiums earned' }).min(0),
});

type FormValues = z.infer<typeof formSchema>;

type ResultPayload = {
  catastrophicLosses: number;
  netPremiumsEarned: number;
  catastropheRatio: number;
  averageAnnualLoss: number;
  interpretation: string;
  status: 'optimal' | 'good' | 'moderate' | 'low';
  recommendations: string[];
  plan: { label: string; detail: string }[];
};

const steps = [
  'Enter catastrophic losses (claims and loss adjustment expenses from natural disasters).',
  'Enter net premiums earned (premium income after deducting reinsurance premiums ceded).',
  'Review catastrophe ratio, average annual loss, and recommendations.',
];

const faqs = [
  {
    question: 'What is catastrophe loss modeling?',
    answer:
      'Catastrophe loss modeling estimates potential losses from catastrophic events such as hurricanes, earthquakes, floods, and other natural disasters. It helps insurers assess financial exposure and prepare for extreme events.',
  },
  {
    question: 'What is the catastrophe ratio?',
    answer:
      'Catastrophe ratio measures the proportion of earned premiums consumed by catastrophic losses. Formula: (Catastrophic Losses / Net Premiums Earned) × 100. Lower ratios indicate better catastrophe risk management.',
  },
  {
    question: 'What are catastrophic losses?',
    answer:
      'Catastrophic losses include claims and loss adjustment expenses related to natural disasters and catastrophic events. Examples include hurricane damage, earthquake claims, flood losses, and wildfire damages.',
  },
  {
    question: 'What is net premiums earned?',
    answer:
      'Net premiums earned is premium income after deducting reinsurance premiums ceded to other insurers. It represents the net premium retained by the insurer for providing coverage.',
  },
  {
    question: 'What is average annual loss (AAL)?',
    answer:
      'Average Annual Loss is the expected loss per year averaged over a long period. It represents the annualized expected catastrophe loss, useful for premium pricing and reserve setting.',
  },
  {
    question: 'What is a good catastrophe ratio?',
    answer:
      'Catastrophe ratios vary by region and line of business. Generally, ratios below 10% are considered good, 10-20% are moderate, and above 20% indicate high catastrophe exposure. Ratios can spike significantly in catastrophe years.',
  },
  {
    question: 'How do insurers manage catastrophe risk?',
    answer:
      'Insurers manage catastrophe risk through reinsurance (transferring risk), geographic diversification, policy limits and exclusions, catastrophe bonds, and maintaining adequate reserves and capital for extreme events.',
  },
  {
    question: 'How does reinsurance affect catastrophe ratio?',
    answer:
      'Reinsurance reduces net catastrophe losses and therefore lowers the catastrophe ratio. Premiums ceded to reinsurers are deducted from gross premiums earned to calculate net premiums earned.',
  },
  {
    question: 'What are limitations of simple catastrophe modeling?',
    answer:
      'Simple models don\'t account for event frequency, severity distributions, geographic concentration, correlation between perils, or climate change trends. Comprehensive models use historical data, scientific research, and probabilistic methods.',
  },
  {
    question: 'How do I use catastrophe ratio for pricing?',
    answer:
      'Catastrophe ratio helps assess if premiums adequately cover catastrophe exposure. If ratios are consistently high, insurers may need higher premiums, better reinsurance, or reduced catastrophe exposure through underwriting changes.',
  },
];

const relatedCalculators = [
  {
    name: 'Insurance Portfolio Loss Distribution Calculator',
    slug: 'insurance-portfolio-loss-distribution-calculator',
    description: 'Calculate portfolio loss distributions.',
  },
  {
    name: 'Expected Loss Frequency/Severity Calculator',
    slug: 'expected-loss-frequency-severity-calculator',
    description: 'Calculate expected loss from frequency and severity.',
  },
  {
    name: 'Reinsurance Retention & Cession Calculator',
    slug: 'reinsurance-retention-cession-calculator',
    description: 'Calculate reinsurance retention and cession.',
  },
  {
    name: 'Probability of Ruin Calculator',
    slug: 'probability-of-ruin-calculator',
    description: 'Calculate probability of ruin for insurers.',
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
      description: 'Calculate catastrophe ratio and average annual loss for catastrophic event risk assessment.',
      url: baseUrl,
      offers: { '@type': 'Offer', price: '0', priceCurrency: 'USD' },
    },
  ],
};

const calculateResult = (values: FormValues): ResultPayload => {
  const catastrophicLosses = values.catastrophicLosses;
  const netPremiumsEarned = values.netPremiumsEarned;
  
  // Catastrophe Ratio = (Catastrophic Losses / Net Premiums Earned) × 100
  const catastropheRatio = netPremiumsEarned > 0 ? (catastrophicLosses / netPremiumsEarned) * 100 : 0;
  
  // Average Annual Loss (assuming annual period)
  const averageAnnualLoss = catastrophicLosses;
  
  let status: ResultPayload['status'] = 'optimal';
  let interpretation = `Catastrophe ratio of ${catastropheRatio.toFixed(2)}% indicates ${catastrophicLosses.toLocaleString()} in catastrophic losses relative to ${netPremiumsEarned.toLocaleString()} in net premiums earned.`;
  
  if (catastropheRatio > 20) {
    status = 'low';
    interpretation += ' High catastrophe exposure detected. Consider reinsurance, geographic diversification, or premium adjustments.';
  } else if (catastropheRatio > 10) {
    status = 'moderate';
    interpretation += ' Moderate catastrophe exposure. Monitor trends and ensure adequate reinsurance coverage.';
  } else if (catastropheRatio > 5) {
    status = 'good';
    interpretation += ' Acceptable catastrophe exposure. Continue monitoring and maintain reinsurance programs.';
  } else {
    status = 'optimal';
    interpretation += ' Low catastrophe exposure. Maintain current risk management strategies.';
  }

  const recommendations = [
    `Monitor catastrophe trends: Track catastrophe ratio over time. Spikes in catastrophe years are normal, but consistently high ratios may require premium or reinsurance adjustments.`,
    `Assess reinsurance adequacy: Ensure reinsurance coverage protects against extreme catastrophe losses. Evaluate retention levels and reinsurance limits relative to exposure.`,
    'Geographic diversification: Spread exposure across regions to reduce concentration risk. Avoid over-concentration in high-catastrophe-risk areas.',
    `Review pricing adequacy: ${catastropheRatio.toFixed(2)}% catastrophe ratio. Ensure premiums adequately cover expected catastrophe losses plus expenses and profit margin.`,
  ];
  
  if (catastropheRatio > 15) {
    recommendations.push('High catastrophe exposure: Consider increasing premiums, improving reinsurance coverage, reducing exposure in high-risk areas, or adjusting policy terms and limits.');
  }
  if (catastrophicLosses > netPremiumsEarned) {
    recommendations.push('Catastrophe losses exceed premiums: Immediate action required. Review reinsurance programs, pricing strategy, and exposure management to restore profitability.');
  }

  const plan = [
    { label: 'This Week', detail: `Calculate catastrophe ratio: ${catastropheRatio.toFixed(2)}% based on ${catastrophicLosses.toLocaleString()} in losses and ${netPremiumsEarned.toLocaleString()} in net premiums. Document assumptions and time period.` },
    { label: 'This Month', detail: 'Review catastrophe exposure trends over multiple years. Assess reinsurance adequacy, geographic concentration, and pricing relative to catastrophe risk. Update catastrophe reserves and capital planning as needed.' },
    { label: 'Ongoing', detail: 'Monitor catastrophe ratio and average annual loss regularly. Adjust reinsurance programs, pricing, and exposure management based on experience, climate trends, and catastrophe model updates.' },
  ];

  return { catastrophicLosses, netPremiumsEarned, catastropheRatio, averageAnnualLoss, interpretation, status, recommendations, plan };
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
      <Script id="catastrophe-modeling-schema" type="application/ld+json" strategy="afterInteractive" dangerouslySetInnerHTML={{ __html: JSON.stringify(schemaMarkup) }} />

      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <Heart className="h-5 w-5" />
            Catastrophe Loss Modeling Tool (Simple)
          </CardTitle>
          <CardDescription>Calculate catastrophe ratio and average annual loss for catastrophic event risk assessment.</CardDescription>
        </CardHeader>
      </Card>

      <Card>
        <CardHeader>
          <CardTitle>Input your catastrophe data</CardTitle>
        </CardHeader>
        <CardContent>
          <Form {...form}>
            <form onSubmit={form.handleSubmit((values) => setResult(calculateResult(values)))} className="space-y-6">
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <FormField
                  control={form.control}
                  name="catastrophicLosses"
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel>Catastrophic Losses</FormLabel>
                      <FormControl>
                        <Input type="number" step="0.01" placeholder="e.g., 5000000" value={field.value ?? ''} onChange={(e) => field.onChange(e.target.value === '' ? undefined : Number(e.target.value))} />
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
                      <FormLabel>Net Premiums Earned</FormLabel>
                      <FormControl>
                        <Input type="number" step="0.01" placeholder="e.g., 50000000" value={field.value ?? ''} onChange={(e) => field.onChange(e.target.value === '' ? undefined : Number(e.target.value))} />
                      </FormControl>
                      <FormMessage />
                    </FormItem>
                  )}
                />
              </div>
              <Button type="submit" className="w-full md:w-auto">
                Calculate Catastrophe Ratio
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
            <CardDescription>See catastrophe ratio calculation and recommendations.</CardDescription>
          </CardHeader>
          <CardContent className="space-y-6">
            <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
              <div className="p-4 border rounded">
                <p className="text-sm text-muted-foreground">Catastrophe Ratio</p>
                <p className="text-2xl font-semibold text-primary">{result.catastropheRatio.toFixed(2)}%</p>
                <p className="text-xs text-muted-foreground">Of net premiums</p>
              </div>
              <div className="p-4 border rounded">
                <p className="text-sm text-muted-foreground">Average Annual Loss</p>
                <p className="text-2xl font-semibold text-primary">{result.averageAnnualLoss.toLocaleString()}</p>
                <p className="text-xs text-muted-foreground">Per year</p>
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
            <strong>Catastrophe Ratio</strong> = (Catastrophic Losses / Net Premiums Earned) × 100
          </p>
          <p>
            <strong>Average Annual Loss (AAL)</strong> = Expected catastrophe loss per year (for the period analyzed)
          </p>
          <p>
            <strong>Catastrophic Losses</strong> = Claims and loss adjustment expenses from natural disasters and catastrophic events.
          </p>
          <p>
            <strong>Net Premiums Earned</strong> = Premium income after deducting reinsurance premiums ceded to other insurers.
          </p>
          <p>The catastrophe ratio measures the proportion of earned premiums consumed by catastrophic losses. Lower ratios indicate better catastrophe risk management. This simple model provides a basic assessment; comprehensive catastrophe models use probabilistic methods, historical data, and scientific research to estimate loss distributions and exceedance probabilities.</p>
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
                <p className="text-sm text-muted-foreground">Loss Ratio</p>
                <p className="text-xl font-semibold text-primary">{result.catastropheRatio.toFixed(2)}%</p>
                <p className="text-xs text-muted-foreground">Catastrophe losses / Premiums</p>
              </div>
              <div className="p-4 border rounded">
                <p className="text-sm text-muted-foreground">Net Premiums</p>
                <p className="text-xl font-semibold text-primary">{result.netPremiumsEarned.toLocaleString()}</p>
                <p className="text-xs text-muted-foreground">After reinsurance</p>
              </div>
              <div className="p-4 border rounded">
                <p className="text-sm text-muted-foreground">Catastrophe Losses</p>
                <p className="text-xl font-semibold text-primary">{result.catastrophicLosses.toLocaleString()}</p>
                <p className="text-xs text-muted-foreground">Total losses</p>
              </div>
            </div>
          ) : (
            <p className="text-sm text-muted-foreground">Enter your catastrophe data to see additional insights.</p>
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
    <meta itemProp="name" content="The Complete Guide to Catastrophe Loss Modeling: Risk Assessment and Management" />
    <meta itemProp="description" content="An in-depth guide on catastrophe loss modeling, catastrophe ratios, and managing catastrophic event risk for insurers and risk managers." />
    <meta itemProp="keywords" content="catastrophe loss modeling, catastrophe ratio, natural disaster risk, average annual loss, insurance catastrophe, reinsurance" />
    <meta itemProp="author" content="[Your Site's Finance Team]" />
    <meta itemProp="datePublished" content="2025-12-02" />
    <meta itemProp="url" content="/finance/catastrophe-loss-modeling-tool-simple" />

    <h1 className="text-3xl md:text-4xl font-extrabold text-foreground mb-4" itemProp="headline">The Complete Guide to Catastrophe Loss Modeling: Risk Assessment and Management</h1>
    <p className="text-lg italic text-gray-700 dark:text-gray-300">A comprehensive look at catastrophe loss modeling, catastrophe ratios, and strategies for managing catastrophic event risk in insurance.</p>

    <h2 className="text-2xl font-bold text-foreground mt-8 mb-4">Table of Contents: Jump to a Section</h2>
    <ul className="list-disc ml-6 space-y-2 text-blue-600 dark:text-blue-400">
        <li><a href="#overview" className="hover:underline">Overview of Catastrophe Risk</a></li>
        <li><a href="#ratio" className="hover:underline">Catastrophe Ratio Calculation</a></li>
        <li><a href="#aal" className="hover:underline">Average Annual Loss (AAL)</a></li>
        <li><a href="#management" className="hover:underline">Catastrophe Risk Management</a></li>
        <li><a href="#reinsurance" className="hover:underline">Reinsurance and Catastrophe Risk</a></li>
        <li><a href="#models" className="hover:underline">Catastrophe Modeling Methods</a></li>
    </ul>
<hr className="my-6" />

    <h2 id="overview" className="text-2xl font-bold text-foreground pt-8" itemProp="articleSection">Overview of Catastrophe Risk</h2>
    <p>Catastrophe risk represents the threat of large-scale losses from natural disasters and catastrophic events. Unlike routine claims, catastrophes can cause massive, correlated losses that threaten insurer solvency.</p>

    <h3 className="text-xl font-semibold text-foreground mt-6">Types of Catastrophic Events</h3>
    <p>Common catastrophic perils include:</p>
    <ul className="list-disc ml-6 space-y-1">
        <li><b>Natural Disasters:</b> Hurricanes, earthquakes, floods, tornadoes, wildfires, tsunamis</li>
        <li><b>Weather Events:</b> Severe storms, hailstorms, extreme temperature events</li>
        <li><b>Geological Events:</b> Earthquakes, volcanic eruptions, landslides</li>
        <li><b>Man-Made Catastrophes:</b> Terrorism, cyber attacks, industrial accidents (often excluded or separately covered)</li>
    </ul>

    <h3 className="text-xl font-semibold text-foreground mt-6">Characteristics of Catastrophe Risk</h3>
    <p>Catastrophe risk differs from routine insurance risk:</p>
    <ul className="list-disc ml-6 space-y-1">
        <li><b>Low Frequency, High Severity:</b> Rare but extremely costly events</li>
        <li><b>Correlation:</b> Many policies affected simultaneously</li>
        <li><b>Geographic Concentration:</b> Risk concentrated in specific regions</li>
        <li><b>Unpredictability:</b> Timing and magnitude difficult to predict</li>
    </ul>

<hr className="my-6" />

    <h2 id="ratio" className="text-2xl font-bold text-foreground pt-8" itemProp="articleSection">Catastrophe Ratio Calculation</h2>
    <p>The catastrophe ratio is a key metric for assessing catastrophe exposure relative to premium income.</p>

    <h3 className="text-xl font-semibold text-foreground mt-6">Formula</h3>
    <div className="bg-gray-100 dark:bg-gray-800 p-4 rounded-lg my-4">
        <p className="font-mono text-lg"><strong>Catastrophe Ratio = (Catastrophic Losses / Net Premiums Earned) × 100</strong></p>
    </div>

    <h3 className="text-xl font-semibold text-foreground mt-6">Interpreting Catastrophe Ratios</h3>
    <p>Catastrophe ratios vary by:</p>
    <ul className="list-disc ml-6 space-y-1">
        <li><b>Geographic Region:</b> High-risk areas (e.g., hurricane zones) have higher ratios</li>
        <li><b>Line of Business:</b> Property insurance has higher ratios than liability</li>
        <li><b>Time Period:</b> Ratios spike in catastrophe years, drop in quiet years</li>
    </ul>
    <p>General guidelines:</p>
    <ul className="list-disc ml-6 space-y-1">
        <li><b>&lt; 5%:</b> Low catastrophe exposure</li>
        <li><b>5-10%:</b> Moderate exposure</li>
        <li><b>10-20%:</b> High exposure (may require action)</li>
        <li><b>&gt; 20%:</b> Very high exposure (immediate review needed)</li>
    </ul>

<hr className="my-6" />

    <h2 id="aal" className="text-2xl font-bold text-foreground pt-8" itemProp="articleSection">Average Annual Loss (AAL)</h2>
    <p>Average Annual Loss represents the expected catastrophe loss per year, averaged over a long period. It accounts for both the frequency and severity of catastrophic events.</p>

    <h3 className="text-xl font-semibold text-foreground mt-6">Uses of AAL</h3>
    <ul className="list-disc ml-6 space-y-1">
        <li><b>Premium Pricing:</b> Ensure premiums cover expected catastrophe losses</li>
        <li><b>Reserve Setting:</b> Allocate reserves for expected catastrophe costs</li>
        <li><b>Capital Planning:</b> Determine capital needed for catastrophe risk</li>
        <li><b>Reinsurance Purchasing:</b> Guide reinsurance program design</li>
    </ul>

    <h3 className="text-xl font-semibold text-foreground mt-6">Limitations</h3>
    <p>AAL provides an average but doesn't indicate:</p>
    <ul className="list-disc ml-6 space-y-1">
        <li>Variability around the average (some years much higher/lower)</li>
        <li>Maximum possible loss (worst-case scenarios)</li>
        <li>Frequency of exceedances</li>
    </ul>

<hr className="my-6" />

    <h2 id="management" className="text-2xl font-bold text-foreground pt-8" itemProp="articleSection">Catastrophe Risk Management</h2>
    <p>Effective catastrophe risk management requires multiple strategies working together.</p>

    <h3 className="text-xl font-semibold text-foreground mt-6">Risk Reduction Strategies</h3>
    <ul className="list-disc ml-6 space-y-1">
        <li><b>Geographic Diversification:</b> Spread exposure across regions to reduce concentration</li>
        <li><b>Exposure Limits:</b> Cap exposure in high-risk areas</li>
        <li><b>Underwriting Standards:</b> Require mitigation measures (e.g., hurricane shutters, elevation)</li>
        <li><b>Policy Terms:</b> Deductibles, coverage limits, exclusions</li>
    </ul>

    <h3 className="text-xl font-semibold text-foreground mt-6">Risk Transfer Strategies</h3>
    <ul className="list-disc ml-6 space-y-1">
        <li><b>Reinsurance:</b> Transfer catastrophe risk to reinsurers</li>
        <li><b>Catastrophe Bonds:</b> Transfer risk to capital markets</li>
        <li><b>Industry Pools:</b> Share risk with other insurers</li>
    </ul>

    <h3 className="text-xl font-semibold text-foreground mt-6">Financial Preparedness</h3>
    <ul className="list-disc ml-6 space-y-1">
        <li><b>Reserves:</b> Maintain reserves for expected catastrophe losses</li>
        <li><b>Capital:</b> Hold sufficient capital for extreme events</li>
        <li><b>Liquidity:</b> Ensure access to funds for large claim payments</li>
    </ul>

<hr className="my-6" />

    <h2 id="reinsurance" className="text-2xl font-bold text-foreground pt-8" itemProp="articleSection">Reinsurance and Catastrophe Risk</h2>
    <p>Reinsurance is a critical tool for managing catastrophe risk.</p>

    <h3 className="text-xl font-semibold text-foreground mt-6">Types of Catastrophe Reinsurance</h3>
    <ul className="list-disc ml-6 space-y-1">
        <li><b>Excess of Loss:</b> Covers losses above retention level</li>
        <li><b>Catastrophe Treaties:</b> Specific coverage for catastrophic events</li>
        <li><b>Aggregate Covers:</b> Limit total catastrophe losses over a period</li>
    </ul>

    <h3 className="text-xl font-semibold text-foreground mt-6">Reinsurance Impact on Catastrophe Ratio</h3>
    <p>Reinsurance reduces net catastrophe losses by transferring a portion of risk to reinsurers. This lowers the catastrophe ratio but also reduces net premiums earned (due to reinsurance premiums ceded).</p>

<hr className="my-6" />

    <h2 id="models" className="text-2xl font-bold text-foreground pt-8" itemProp="articleSection">Catastrophe Modeling Methods</h2>
    <p>Simple ratio calculations provide basic insights, but comprehensive catastrophe models offer more sophisticated analysis.</p>

    <h3 className="text-xl font-semibold text-foreground mt-6">Simple Models</h3>
    <p>Basic ratio analysis and historical loss trends provide starting points but have limitations:</p>
    <ul className="list-disc ml-6 space-y-1">
        <li>Don't account for event frequency and severity distributions</li>
        <li>May not reflect climate change trends</li>
        <li>Don't consider geographic concentration</li>
    </ul>

    <h3 className="text-xl font-semibold text-foreground mt-6">Advanced Models</h3>
    <p>Professional catastrophe models (e.g., from RMS, AIR, CoreLogic) use:</p>
    <ul className="list-disc ml-6 space-y-1">
        <li><b>Probabilistic Methods:</b> Generate thousands of simulated events</li>
        <li><b>Scientific Data:</b> Meteorology, seismology, hydrology</li>
        <li><b>Exposure Data:</b> Detailed property locations and characteristics</li>
        <li><b>Vulnerability Functions:</b> How damage relates to event intensity</li>
    </ul>
    <p>These models provide:</p>
    <ul className="list-disc ml-6 space-y-1">
        <li>Loss probability distributions</li>
        <li>Exceedance probability curves</li>
        <li>Return period analysis</li>
        <li>Geographic risk maps</li>
    </ul>

<hr className="my-6" />

    <h2 className="text-2xl font-bold text-foreground pt-8" itemProp="articleSection">Conclusion</h2>
    <p>Catastrophe loss modeling is essential for insurers to assess, price, and manage catastrophic event risk. The catastrophe ratio provides a simple metric for monitoring exposure, while average annual loss helps with pricing and reserving. Effective catastrophe risk management combines geographic diversification, reinsurance, adequate capital, and comprehensive modeling. As climate change increases catastrophe frequency and severity, robust catastrophe risk management becomes even more critical for insurer financial stability.</p>
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
          <p>This tool calculates catastrophe ratio and average annual loss for catastrophic event risk assessment.</p>
          <p>Outputs include catastrophe ratio, average annual loss, interpretation, recommendations, an action plan, and supporting metrics.</p>
          <p>Formula, steps, guide content, related tools, and FAQs ensure humans or AI assistants can interpret the methodology instantly.</p>
        </CardContent>
      </Card>
    </div>
  );
}


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
  lossFrequency: z.number({ invalid_type_error: 'Enter loss frequency' }).min(0),
  averageSeverity: z.number({ invalid_type_error: 'Enter average severity' }).min(0),
});

type FormValues = z.infer<typeof formSchema>;

type ResultPayload = {
  lossFrequency: number;
  averageSeverity: number;
  expectedLoss: number;
  interpretation: string;
  status: 'optimal' | 'good' | 'moderate' | 'low';
  recommendations: string[];
  plan: { label: string; detail: string }[];
};

const steps = [
  'Enter expected loss frequency (number of loss events per period).',
  'Enter average loss severity (average monetary value per loss event).',
  'Review expected loss calculation, interpretation, and recommendations.',
];

const faqs = [
  {
    question: 'What is expected loss frequency?',
    answer:
      'Expected loss frequency is the anticipated number of loss events occurring within a given timeframe. It is often expressed as the number of claims per unit of exposure, such as per policy, per insured unit, or per period.',
  },
  {
    question: 'What is expected loss severity?',
    answer:
      'Expected loss severity is the average monetary value of each loss event. It is calculated by dividing the total amount of losses by the number of claims. Severity represents how costly each loss event is on average.',
  },
  {
    question: 'How is expected loss calculated?',
    answer:
      'Expected loss = Expected Loss Frequency × Expected Loss Severity. This formula multiplies the number of expected loss events by the average cost per event to estimate total expected losses over a period.',
  },
  {
    question: 'Why analyze frequency and severity separately?',
    answer:
      'Analyzing frequency and severity separately provides better insights into risk drivers. High frequency with low severity requires different management than low frequency with high severity. This enables targeted risk control strategies.',
  },
  {
    question: 'How do I estimate loss frequency?',
    answer:
      'Estimate loss frequency from historical claim data, industry benchmarks, exposure units (number of policies, insured items), and actuarial models. Frequency is typically expressed as claims per 100 policies or claims per year.',
  },
  {
    question: 'How do I estimate loss severity?',
    answer:
      'Estimate loss severity by analyzing historical claim amounts, calculating mean or median claim values, considering inflation trends, and adjusting for large losses. Severity can vary significantly by loss type and coverage.',
  },
  {
    question: 'What affects loss frequency?',
    answer:
      'Loss frequency is affected by exposure volume, risk control measures, policyholder behavior, external factors (weather, economy), policy terms (deductibles, coverage limits), and industry trends. Better risk controls reduce frequency.',
  },
  {
    question: 'What affects loss severity?',
    answer:
      'Loss severity is affected by claim types, asset values, medical costs, legal trends, inflation, coverage limits, deductibles, and catastrophic events. Severity tends to increase over time due to inflation and litigation.',
  },
  {
    question: 'How do I use expected loss for pricing?',
    answer:
      'Expected loss is a key component of premium calculation. Premiums must exceed expected loss plus expenses and profit margin. Higher expected loss requires higher premiums or better risk selection to maintain profitability.',
  },
  {
    question: 'How do I reduce expected loss?',
    answer:
      'Reduce expected loss by decreasing frequency (better underwriting, risk controls, safety measures) or severity (limits, deductibles, loss prevention), or both. Effective risk management programs target both components of expected loss.',
  },
];

const relatedCalculators = [
  {
    name: 'Credit Risk Expected Loss Calculator',
    slug: 'credit-risk-expected-loss-calculator',
    description: 'Calculate expected credit loss from PD and LGD.',
  },
  {
    name: 'Expected Loss Insurance Risk Calculator',
    slug: 'expected-loss-insurance-risk-calculator',
    description: 'Calculate expected insurance losses.',
  },
  {
    name: 'Value-at-Risk (Historical Simulation) Calculator',
    slug: 'value-at-risk-historical-simulation-calculator',
    description: 'Calculate portfolio Value-at-Risk.',
  },
  {
    name: 'Conditional Value at Risk Calculator',
    slug: 'conditional-value-at-risk-calculator',
    description: 'Calculate tail risk and expected shortfall.',
  },
];

const baseUrl = 'https://mycalculating.com/category/finance/expected-loss-frequency-severity-calculator';

const schemaMarkup = {
  '@context': 'https://schema.org',
  '@graph': [
    {
      '@type': 'BreadcrumbList',
      itemListElement: [
        { '@type': 'ListItem', position: 1, name: 'Home', item: 'https://mycalculating.com' },
        { '@type': 'ListItem', position: 2, name: 'Finance', item: 'https://mycalculating.com/category/finance' },
        { '@type': 'ListItem', position: 3, name: 'Expected Loss Frequency/Severity Calculator', item: baseUrl },
      ],
    },
    {
      '@type': 'SoftwareApplication',
      name: 'Expected Loss Frequency/Severity Calculator',
      applicationCategory: 'Calculator',
      operatingSystem: 'Web Browser',
      description: 'Calculate expected loss from loss frequency and average severity for insurance and risk management.',
      url: baseUrl,
      offers: { '@type': 'Offer', price: '0', priceCurrency: 'USD' },
    },
  ],
};

const calculateResult = (values: FormValues): ResultPayload => {
  const lossFrequency = values.lossFrequency;
  const averageSeverity = values.averageSeverity;
  
  // Expected loss = Frequency × Severity
  const expectedLoss = lossFrequency * averageSeverity;
  
  let status: ResultPayload['status'] = 'optimal';
  let interpretation = 'Expected loss calculation complete. Use this as a baseline for pricing, reserving, and risk management decisions.';
  
  if (expectedLoss === 0) {
    status = 'optimal';
    interpretation = 'No expected losses based on zero frequency or severity. Verify assumptions are realistic for the risk exposure.';
  } else if (lossFrequency > 0 && averageSeverity > 0) {
    status = 'optimal';
    interpretation = `Expected loss of ${expectedLoss.toLocaleString()} based on ${lossFrequency} loss events per period with average severity of ${averageSeverity.toLocaleString()}. Monitor both frequency and severity trends.`;
  }

  const recommendations = [
    `Monitor loss frequency trends: Track actual frequency against expected ${lossFrequency} to identify emerging risk patterns or effectiveness of risk controls.`,
    `Monitor loss severity trends: Compare actual severity against expected ${averageSeverity.toLocaleString()} to assess if large losses or claim inflation are affecting results.`,
    'Use for pricing: Expected loss is a key component of premium calculation. Ensure premiums exceed expected loss plus expenses and profit margin.',
    'Review periodically: Update frequency and severity estimates based on recent experience, industry trends, and changes in exposure or risk profile.',
  ];
  
  if (lossFrequency > 10) {
    recommendations.push('High frequency detected: Consider risk control measures, deductibles, or policy terms to reduce frequency and improve profitability.');
  }
  if (averageSeverity > 50000) {
    recommendations.push('High severity detected: Consider coverage limits, reinsurance, or loss prevention programs to manage severity risk.');
  }

  const plan = [
    { label: 'This Week', detail: `Calculate expected loss: ${expectedLoss.toLocaleString()} based on frequency ${lossFrequency} and severity ${averageSeverity.toLocaleString()}. Document assumptions and data sources.` },
    { label: 'This Month', detail: 'Monitor actual losses against expected loss. Analyze frequency and severity separately to identify trends and risk drivers affecting each component.' },
    { label: 'Ongoing', detail: 'Update expected loss estimates regularly based on experience, industry data, and risk changes. Use for pricing, reserving, and capital planning.' },
  ];

  return { lossFrequency, averageSeverity, expectedLoss, interpretation, status, recommendations, plan };
};

export default function ExpectedLossFrequencySeverityCalculator() {
  const [result, setResult] = useState<ResultPayload | null>(null);

  const form = useForm<FormValues>({
    resolver: zodResolver(formSchema),
    defaultValues: {
      lossFrequency: undefined,
      averageSeverity: undefined,
    },
  });

  return (
    <div className="space-y-8">
      <Script id="expected-loss-freq-sev-schema" type="application/ld+json" strategy="afterInteractive" dangerouslySetInnerHTML={{ __html: JSON.stringify(schemaMarkup) }} />

      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <Heart className="h-5 w-5" />
            Expected Loss Frequency/Severity Calculator
          </CardTitle>
          <CardDescription>Calculate expected loss from loss frequency and average severity for insurance and risk management.</CardDescription>
        </CardHeader>
      </Card>

      <Card>
        <CardHeader>
          <CardTitle>Input your loss data</CardTitle>
        </CardHeader>
        <CardContent>
          <Form {...form}>
            <form onSubmit={form.handleSubmit((values) => setResult(calculateResult(values)))} className="space-y-6">
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <FormField
                  control={form.control}
                  name="lossFrequency"
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel>Loss Frequency</FormLabel>
                      <FormControl>
                        <Input type="number" step="0.01" placeholder="e.g., 5.5" value={field.value ?? ''} onChange={(e) => field.onChange(e.target.value === '' ? undefined : Number(e.target.value))} />
                      </FormControl>
                      <FormMessage />
                    </FormItem>
                  )}
                />
                <FormField
                  control={form.control}
                  name="averageSeverity"
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel>Average Severity</FormLabel>
                      <FormControl>
                        <Input type="number" step="0.01" placeholder="e.g., 10000" value={field.value ?? ''} onChange={(e) => field.onChange(e.target.value === '' ? undefined : Number(e.target.value))} />
                      </FormControl>
                      <FormMessage />
                    </FormItem>
                  )}
                />
              </div>
              <Button type="submit" className="w-full md:w-auto">
                Calculate Expected Loss
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
            <CardDescription>See expected loss calculation and recommendations.</CardDescription>
          </CardHeader>
          <CardContent className="space-y-6">
            <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
              <div className="p-4 border rounded">
                <p className="text-sm text-muted-foreground">Expected Loss</p>
                <p className="text-2xl font-semibold text-primary">{result.expectedLoss.toLocaleString()}</p>
                <p className="text-xs text-muted-foreground">Frequency × Severity</p>
              </div>
              <div className="p-4 border rounded">
                <p className="text-sm text-muted-foreground">Loss Frequency</p>
                <p className="text-2xl font-semibold text-primary">{result.lossFrequency.toLocaleString()}</p>
                <p className="text-xs text-muted-foreground">Events per period</p>
              </div>
              <div className="p-4 border rounded">
                <p className="text-sm text-muted-foreground">Average Severity</p>
                <p className="text-2xl font-semibold text-primary">{result.averageSeverity.toLocaleString()}</p>
                <p className="text-xs text-muted-foreground">Per event</p>
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
            <strong>Expected Loss</strong> = Loss Frequency × Average Severity
          </p>
          <p>
            <strong>Loss Frequency</strong> = Expected number of loss events per period (e.g., claims per year, claims per 100 policies).
          </p>
          <p>
            <strong>Average Severity</strong> = Average monetary value per loss event (total losses / number of claims).
          </p>
          <p>Expected loss represents the anticipated total loss amount over a period. It is a fundamental metric for insurance pricing, reserving, and risk management. Analyzing frequency and severity separately provides better insights into risk drivers and enables targeted risk control strategies.</p>
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
                <p className="text-sm text-muted-foreground">Loss per Unit Exposure</p>
                <p className="text-xl font-semibold text-primary">
                  {(result.expectedLoss / (result.lossFrequency || 1)).toLocaleString()}
                </p>
                <p className="text-xs text-muted-foreground">Per loss event</p>
              </div>
              <div className="p-4 border rounded">
                <p className="text-sm text-muted-foreground">Frequency Rate</p>
                <p className="text-xl font-semibold text-primary">{result.lossFrequency.toFixed(2)}</p>
                <p className="text-xs text-muted-foreground">Events per period</p>
              </div>
              <div className="p-4 border rounded">
                <p className="text-sm text-muted-foreground">Severity Index</p>
                <p className="text-xl font-semibold text-primary">{result.averageSeverity.toLocaleString()}</p>
                <p className="text-xs text-muted-foreground">Average per event</p>
              </div>
            </div>
          ) : (
            <p className="text-sm text-muted-foreground">Enter your loss data to see additional insights.</p>
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
    <meta itemProp="name" content="The Complete Guide to Expected Loss: Frequency, Severity, and Risk Management" />
    <meta itemProp="description" content="An in-depth guide on calculating expected loss from frequency and severity, its role in insurance pricing and risk management, and best practices for estimation and monitoring." />
    <meta itemProp="keywords" content="expected loss frequency severity, insurance risk management, actuarial pricing, loss ratio, claim frequency, claim severity, premium calculation" />
    <meta itemProp="author" content="[Your Site's Finance Team]" />
    <meta itemProp="datePublished" content="2025-12-02" />
    <meta itemProp="url" content="/finance/expected-loss-frequency-severity-calculator" />

    <h1 className="text-3xl md:text-4xl font-extrabold text-foreground mb-4" itemProp="headline">The Complete Guide to Expected Loss: Frequency, Severity, and Risk Management</h1>
    <p className="text-lg italic text-gray-700 dark:text-gray-300">A comprehensive look at expected loss calculation, its components (frequency and severity), and its critical role in insurance pricing, reserving, and risk management.</p>

    <h2 className="text-2xl font-bold text-foreground mt-8 mb-4">Table of Contents: Jump to a Section</h2>
    <ul className="list-disc ml-6 space-y-2 text-blue-600 dark:text-blue-400">
        <li><a href="#basics" className="hover:underline">Fundamentals of Expected Loss</a></li>
        <li><a href="#frequency" className="hover:underline">Loss Frequency: Understanding Claim Rates</a></li>
        <li><a href="#severity" className="hover:underline">Loss Severity: Measuring Claim Costs</a></li>
        <li><a href="#calculation" className="hover:underline">Expected Loss Calculation and Applications</a></li>
        <li><a href="#pricing" className="hover:underline">Expected Loss in Premium Pricing</a></li>
        <li><a href="#management" className="hover:underline">Risk Management Strategies</a></li>
    </ul>
<hr className="my-6" />

    <h2 id="basics" className="text-2xl font-bold text-foreground pt-8" itemProp="articleSection">Fundamentals of Expected Loss</h2>
    <p>Expected loss is a fundamental metric in insurance and risk management that quantifies the anticipated financial losses over a specific period. It is calculated by multiplying two key components: <b>loss frequency</b> and <b>loss severity</b>.</p>

    <h3 className="text-xl font-semibold text-foreground mt-6">What is Expected Loss?</h3>
    <p>Expected loss represents the average total loss amount that an insurer or risk manager anticipates over a given timeframe. Unlike actual losses, which are unpredictable, expected loss provides a statistical estimate based on historical data, actuarial models, and risk analysis.</p>
    <p>Expected loss is essential for:</p>
    <ul className="list-disc ml-6 space-y-1">
        <li><b>Premium Pricing:</b> Ensuring premiums cover expected losses plus expenses and profit margin</li>
        <li><b>Reserving:</b> Setting aside adequate funds to pay future claims</li>
        <li><b>Capital Planning:</b> Determining required capital to support risk exposures</li>
        <li><b>Risk Management:</b> Identifying and prioritizing risk mitigation strategies</li>
    </ul>

    <h3 className="text-xl font-semibold text-foreground mt-6">The Formula</h3>
    <p>The expected loss formula is straightforward:</p>
    <div className="bg-gray-100 dark:bg-gray-800 p-4 rounded-lg my-4">
        <p className="font-mono text-lg"><strong>Expected Loss = Loss Frequency × Average Severity</strong></p>
    </div>
    <p>Where:</p>
    <ul className="list-disc ml-6 space-y-1">
        <li><b>Loss Frequency:</b> Expected number of loss events per period</li>
        <li><b>Average Severity:</b> Average monetary value per loss event</li>
    </ul>

<hr className="my-6" />

    <h2 id="frequency" className="text-2xl font-bold text-foreground pt-8" itemProp="articleSection">Loss Frequency: Understanding Claim Rates</h2>
    <p>Loss frequency measures how often loss events occur. It is expressed as the number of claims or losses per unit of exposure or per time period.</p>

    <h3 className="text-xl font-semibold text-foreground mt-6">Measuring Loss Frequency</h3>
    <p>Frequency can be measured in various ways:</p>
    <ul className="list-disc ml-6 space-y-1">
        <li><b>Claims per 100 policies:</b> Common in property and casualty insurance</li>
        <li><b>Claims per year:</b> Absolute frequency over time</li>
        <li><b>Claims per exposure unit:</b> Normalized by exposure (e.g., per vehicle, per square foot)</li>
        <li><b>Annual frequency rate:</b> Frequency standardized to annual basis</li>
    </ul>

    <h3 className="text-xl font-semibold text-foreground mt-6">Factors Affecting Frequency</h3>
    <p>Loss frequency is influenced by:</p>
    <ul className="list-disc ml-6 space-y-1">
        <li><b>Exposure Volume:</b> More policies or items increase total claims</li>
        <li><b>Risk Controls:</b> Safety measures, training, and loss prevention reduce frequency</li>
        <li><b>Policy Terms:</b> Higher deductibles may reduce reported frequency</li>
        <li><b>External Factors:</b> Weather, economy, legal environment</li>
        <li><b>Underwriting Quality:</b> Better risk selection reduces frequency</li>
    </ul>

<hr className="my-6" />

    <h2 id="severity" className="text-2xl font-bold text-foreground pt-8" itemProp="articleSection">Loss Severity: Measuring Claim Costs</h2>
    <p>Loss severity measures the average cost of each loss event. It represents the financial impact per claim and is calculated as total losses divided by number of claims.</p>

    <h3 className="text-xl font-semibold text-foreground mt-6">Calculating Average Severity</h3>
    <div className="bg-gray-100 dark:bg-gray-800 p-4 rounded-lg my-4">
        <p className="font-mono"><strong>Average Severity = Total Losses / Number of Claims</strong></p>
    </div>
    <p>For example, if 100 claims total $1,000,000, average severity = $10,000 per claim.</p>

    <h3 className="text-xl font-semibold text-foreground mt-6">Factors Affecting Severity</h3>
    <p>Loss severity is influenced by:</p>
    <ul className="list-disc ml-6 space-y-1">
        <li><b>Asset Values:</b> Higher insured values increase potential losses</li>
        <li><b>Medical Costs:</b> Healthcare inflation affects injury claims</li>
        <li><b>Legal Trends:</b> Jury verdicts, litigation costs, regulatory changes</li>
        <li><b>Inflation:</b> General price inflation increases repair and replacement costs</li>
        <li><b>Coverage Limits:</b> Higher limits allow larger claims</li>
        <li><b>Catastrophic Events:</b> Natural disasters cause extreme severity</li>
    </ul>

<hr className="my-6" />

    <h2 id="calculation" className="text-2xl font-bold text-foreground pt-8" itemProp="articleSection">Expected Loss Calculation and Applications</h2>
    <p>Expected loss calculation is straightforward once frequency and severity are estimated. However, the quality of inputs determines the accuracy of results.</p>

    <h3 className="text-xl font-semibold text-foreground mt-6">Example Calculation</h3>
    <p>Suppose an insurer expects:</p>
    <ul className="list-disc ml-6 space-y-1">
        <li>Loss frequency: 5 claims per 100 policies per year</li>
        <li>Average severity: $10,000 per claim</li>
    </ul>
    <p>Expected loss per 100 policies = 5 × $10,000 = $50,000 per year.</p>
    <p>For pricing, if the insurer has 1,000 policies, expected loss = $500,000 per year. Premiums must exceed this plus expenses and profit margin.</p>

    <h3 className="text-xl font-semibold text-foreground mt-6">Why Separate Frequency and Severity?</h3>
    <p>Analyzing frequency and severity separately provides better insights:</p>
    <ul className="list-disc ml-6 space-y-1">
        <li><b>High Frequency, Low Severity:</b> Requires frequency-focused controls (safety training, preventive maintenance)</li>
        <li><b>Low Frequency, High Severity:</b> Requires severity-focused controls (coverage limits, reinsurance, catastrophe planning)</li>
        <li><b>Risk Prioritization:</b> Helps allocate resources to most impactful risk reduction strategies</li>
    </ul>

<hr className="my-6" />

    <h2 id="pricing" className="text-2xl font-bold text-foreground pt-8" itemProp="articleSection">Expected Loss in Premium Pricing</h2>
    <p>Expected loss is a fundamental component of insurance premium calculation. Premiums must cover expected losses, operating expenses, and provide a profit margin.</p>

    <h3 className="text-xl font-semibold text-foreground mt-6">Premium Structure</h3>
    <div className="bg-gray-100 dark:bg-gray-800 p-4 rounded-lg my-4">
        <p className="font-mono"><strong>Premium = Expected Loss + Expenses + Profit Margin</strong></p>
    </div>
    <p>If expected loss is too high relative to market rates, the insurer must improve underwriting, implement risk controls, or adjust policy terms to remain competitive.</p>

    <h3 className="text-xl font-semibold text-foreground mt-6">Monitoring and Adjustment</h3>
    <p>Insurers continuously monitor actual losses against expected losses:</p>
    <ul className="list-disc ml-6 space-y-1">
        <li><b>Favorable Experience:</b> Actual losses below expected may indicate overpricing or effective risk management</li>
        <li><b>Adverse Experience:</b> Actual losses above expected require premium adjustments, underwriting changes, or risk control improvements</li>
    </ul>

<hr className="my-6" />

    <h2 id="management" className="text-2xl font-bold text-foreground pt-8" itemProp="articleSection">Risk Management Strategies</h2>
    <p>Effective risk management targets both frequency and severity to reduce expected loss and improve profitability.</p>

    <h3 className="text-xl font-semibold text-foreground mt-6">Reducing Frequency</h3>
    <ul className="list-disc ml-6 space-y-1">
        <li><b>Risk Selection:</b> Underwrite to avoid high-risk exposures</li>
        <li><b>Loss Prevention:</b> Safety programs, training, inspections</li>
        <li><b>Policy Terms:</b> Deductibles, coverage limits, exclusions</li>
        <li><b>Monitoring:</b> Early identification and intervention</li>
    </ul>

    <h3 className="text-xl font-semibold text-foreground mt-6">Reducing Severity</h3>
    <ul className="list-disc ml-6 space-y-1">
        <li><b>Coverage Limits:</b> Cap maximum losses per claim</li>
        <li><b>Reinsurance:</b> Transfer large loss exposure</li>
        <li><b>Claims Management:</b> Effective investigation, defense, settlement</li>
        <li><b>Catastrophe Planning:</b> Prepare for extreme events</li>
    </ul>

<hr className="my-6" />

    <h2 className="text-2xl font-bold text-foreground pt-8" itemProp="articleSection">Conclusion</h2>
    <p>Expected loss calculation from frequency and severity is fundamental to insurance pricing, reserving, and risk management. By analyzing frequency and severity separately, insurers can develop targeted strategies to reduce risk, improve profitability, and ensure adequate pricing. Regular monitoring and adjustment of expected loss estimates based on actual experience ensures accurate risk assessment and financial stability.</p>
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
          <p>This tool calculates expected loss from loss frequency and average severity for insurance and risk management.</p>
          <p>Outputs include expected loss, frequency, severity, interpretation, recommendations, an action plan, and supporting metrics.</p>
          <p>Formula, steps, guide content, related tools, and FAQs ensure humans or AI assistants can interpret the methodology instantly.</p>
        </CardContent>
      </Card>
    </div>
  );
}


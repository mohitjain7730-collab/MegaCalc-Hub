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
  expectedLosses: z.number({ invalid_type_error: 'Enter expected losses' }).min(0),
  expenseLoad: z.number({ invalid_type_error: 'Enter expense load' }).min(0),
  profitMargin: z.number({ invalid_type_error: 'Enter profit margin' }).min(0).max(100),
  riskLoadingFactor: z.number({ invalid_type_error: 'Enter risk loading factor' }).min(0).max(100),
});

type FormValues = z.infer<typeof formSchema>;

type ResultPayload = {
  expectedLosses: number;
  expenseLoad: number;
  profitMargin: number;
  riskLoadingFactor: number;
  profitAmount: number;
  basePremium: number;
  totalPremium: number;
  loadingFactor: number;
  interpretation: string;
  status: 'optimal' | 'good' | 'moderate' | 'low';
  recommendations: string[];
  plan: { label: string; detail: string }[];
};

const steps = [
  'Enter expected losses (anticipated claims costs from actuarial data).',
  'Enter expense load (operating expenses allocated to this policy).',
  'Enter profit margin as a percentage (e.g., 10 for 10%).',
  'Enter risk loading factor as a percentage (e.g., 5 for 5%).',
  'Review total premium calculation, loading factors, and recommendations.',
];

const faqs = [
  {
    question: 'What is premium loading factor?',
    answer:
      'Premium loading factor is an additional charge applied to base premium to cover various costs and contingencies, including administrative expenses, profit margins, and the insurer\'s risk exposure. It ensures the insurer can meet obligations and maintain profitability.',
  },
  {
    question: 'What are expected losses?',
    answer:
      'Expected losses are the anticipated claims costs based on actuarial data, historical loss experience, and statistical models. They represent the average amount the insurer expects to pay in claims for a given exposure.',
  },
  {
    question: 'What is expense load?',
    answer:
      'Expense load is the portion of premium allocated to cover the insurer\'s operating expenses, including underwriting, policy administration, claims processing, commissions, and general overhead costs.',
  },
  {
    question: 'What is profit margin?',
    answer:
      'Profit margin is the desired profit expressed as a percentage of the sum of expected losses and expenses. It represents the insurer\'s target return on the policy and compensates shareholders for providing capital.',
  },
  {
    question: 'What is risk loading factor?',
    answer:
      'Risk loading factor is an additional percentage added to account for the insurer\'s risk tolerance and potential variability in claims. It provides a buffer for uncertainty and adverse deviations from expected losses.',
  },
  {
    question: 'How is total premium calculated?',
    answer:
      'Total Premium = (Expected Losses + Expense Load + Profit Margin) Ã— (1 + Risk Loading Factor). The profit margin is calculated as a percentage of (Expected Losses + Expense Load).',
  },
  {
    question: 'What is a reasonable profit margin?',
    answer:
      'Profit margins vary by line of business and market conditions. Typical ranges are 5-15% for property/casualty insurance, with higher margins for riskier lines. Margins must balance profitability with market competitiveness.',
  },
  {
    question: 'What is a reasonable risk loading factor?',
    answer:
      'Risk loading factors typically range from 0% to 10%, depending on the volatility of the risk, the insurer\'s risk tolerance, and regulatory requirements. Higher volatility or uncertainty warrants higher risk loading.',
  },
  {
    question: 'How does loading factor affect premiums?',
    answer:
      'Higher loading factors increase premiums, making policies more expensive. Loading factors must balance the need for profitability and safety margins with market competitiveness. Excessive loading may make premiums uncompetitive.',
  },
  {
    question: 'Can loading factors be negative?',
    answer:
      'Loading factors are typically positive, representing additional charges. However, in competitive markets or for loss-leader strategies, insurers may price below cost (negative effective loading), expecting to make profits through investment income or cross-selling.',
  },
];

const relatedCalculators = [
  {
    name: 'Expected Loss Frequency/Severity Calculator',
    slug: 'expected-loss-frequency-severity-calculator',
    description: 'Calculate expected losses from frequency and severity.',
  },
  {
    name: 'Loss Ratio Calculator',
    slug: 'loss-ratio-calculator',
    description: 'Calculate loss ratios for profitability.',
  },
  {
    name: 'Combined Ratio (Insurance Profitability) Calculator',
    slug: 'combined-ratio-insurance-profitability-calculator',
    description: 'Calculate combined ratio for profitability.',
  },
  {
    name: 'Expected Loss Insurance Risk Calculator',
    slug: 'expected-loss-insurance-risk-calculator',
    description: 'Calculate expected insurance losses.',
  },
];

const baseUrl = 'https://mycalculating.com/finance/premium-loading-factor-calculator';

const schemaMarkup = {
  '@context': 'https://schema.org',
  '@graph': [
    {
      '@type': 'BreadcrumbList',
      itemListElement: [
        { '@type': 'ListItem', position: 1, name: 'Home', item: 'https://mycalculating.com' },
        { '@type': 'ListItem', position: 2, name: 'Finance', item: 'https://mycalculating.com/finance' },
        { '@type': 'ListItem', position: 3, name: 'Premium Loading Factor Calculator', item: baseUrl },
      ],
    },
    {
      '@type': 'SoftwareApplication',
      name: 'Premium Loading Factor Calculator',
      applicationCategory: 'Calculator',
      operatingSystem: 'Web Browser',
      description: 'Calculate insurance premium including expected losses, expenses, profit margin, and risk loading factor.',
      url: baseUrl,
      offers: { '@type': 'Offer', price: '0', priceCurrency: 'USD' },
    },
  ],
};

const calculateResult = (values: FormValues): ResultPayload => {
  const expectedLosses = values.expectedLosses;
  const expenseLoad = values.expenseLoad;
  const profitMarginPct = values.profitMargin / 100;
  const riskLoadingFactorPct = values.riskLoadingFactor / 100;
  
  // Profit Amount = (Expected Losses + Expense Load) Ã— Profit Margin
  const profitAmount = (expectedLosses + expenseLoad) * profitMarginPct;
  
  // Base Premium = Expected Losses + Expense Load + Profit Amount
  const basePremium = expectedLosses + expenseLoad + profitAmount;
  
  // Total Premium = Base Premium Ã— (1 + Risk Loading Factor)
  const totalPremium = basePremium * (1 + riskLoadingFactorPct);
  
  // Overall Loading Factor = (Total Premium - Expected Losses) / Expected Losses
  const loadingFactor = expectedLosses > 0 ? ((totalPremium - expectedLosses) / expectedLosses) * 100 : 0;
  
  let status: ResultPayload['status'] = 'optimal';
  let interpretation = `Total premium of ${totalPremium.toLocaleString()} includes expected losses (${expectedLosses.toLocaleString()}), expenses (${expenseLoad.toLocaleString()}), profit margin ${values.profitMargin}%, and risk loading ${values.riskLoadingFactor}%. Overall loading factor: ${loadingFactor.toFixed(1)}%.`;
  
  if (loadingFactor > 50) {
    status = 'good';
    interpretation += ' High loading factor indicates substantial margin for expenses, profit, and risk. Ensure premiums remain competitive.';
  } else if (loadingFactor < 20) {
    status = 'moderate';
    interpretation += ' Low loading factor may provide limited margin for adverse experience. Review pricing adequacy.';
  } else {
    status = 'optimal';
  }

  const recommendations = [
    `Monitor actual results: Compare actual losses and expenses to expected values. If actuals exceed expectations, premiums may need adjustment or loading factors may need increase.`,
    `Assess competitiveness: ${loadingFactor.toFixed(1)}% loading factor. Compare to market rates. If premiums are uncompetitive, consider optimizing expense efficiency or accepting lower margins.`,
    'Review expense allocation: Ensure expense loads accurately reflect actual operating costs. Over-allocation reduces competitiveness; under-allocation threatens profitability.',
    `Balance risk and return: ${values.riskLoadingFactor}% risk loading provides buffer for uncertainty. Adjust based on risk volatility, historical variability, and risk tolerance.`,
  ];
  
  if (totalPremium < expectedLosses + expenseLoad) {
    recommendations.push('Premium below cost: Total premium is less than expected losses plus expenses. This is unsustainable and will result in losses unless offset by investment income or other factors.');
  }

  const plan = [
    { label: 'This Week', detail: `Calculate total premium: ${totalPremium.toLocaleString()} with ${loadingFactor.toFixed(1)}% loading factor. Document assumptions including expected losses, expenses, profit margin, and risk loading.` },
    { label: 'This Month', detail: 'Review premium adequacy by comparing to actual experience. Adjust loading factors if actual losses or expenses differ significantly from expectations. Benchmark premiums against market rates.' },
    { label: 'Ongoing', detail: 'Continuously monitor actual results against expected values. Update premium calculations based on experience, market conditions, and business objectives. Optimize loading factors to balance profitability and competitiveness.' },
  ];

  return { expectedLosses, expenseLoad, profitMargin: values.profitMargin, riskLoadingFactor: values.riskLoadingFactor, profitAmount, basePremium, totalPremium, loadingFactor, interpretation, status, recommendations, plan };
};

export default function PremiumLoadingFactorCalculator() {
  const [result, setResult] = useState<ResultPayload | null>(null);

  const form = useForm<FormValues>({
    resolver: zodResolver(formSchema),
    defaultValues: {
      expectedLosses: undefined,
      expenseLoad: undefined,
      profitMargin: undefined,
      riskLoadingFactor: undefined,
    },
  });

  return (
    <div className="space-y-8">
      <Script id="premium-loading-schema" type="application/ld+json" strategy="afterInteractive" dangerouslySetInnerHTML={{ __html: JSON.stringify(schemaMarkup) }} />

      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <Heart className="h-5 w-5" />
            Premium Loading Factor Calculator
          </CardTitle>
          <CardDescription>Calculate insurance premium including expected losses, expenses, profit margin, and risk loading factor.</CardDescription>
        </CardHeader>
      </Card>

      <Card>
        <CardHeader>
          <CardTitle>Input your premium data</CardTitle>
        </CardHeader>
        <CardContent>
          <Form {...form}>
            <form onSubmit={form.handleSubmit((values) => setResult(calculateResult(values)))} className="space-y-6">
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <FormField
                  control={form.control}
                  name="expectedLosses"
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel>Expected Losses</FormLabel>
                      <FormControl>
                        <Input type="number" step="0.01" placeholder="e.g., 500" value={field.value ?? ''} onChange={(e) => field.onChange(e.target.value === '' ? undefined : Number(e.target.value))} />
                      </FormControl>
                      <FormMessage />
                    </FormItem>
                  )}
                />
                <FormField
                  control={form.control}
                  name="expenseLoad"
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel>Expense Load</FormLabel>
                      <FormControl>
                        <Input type="number" step="0.01" placeholder="e.g., 100" value={field.value ?? ''} onChange={(e) => field.onChange(e.target.value === '' ? undefined : Number(e.target.value))} />
                      </FormControl>
                      <FormMessage />
                    </FormItem>
                  )}
                />
                <FormField
                  control={form.control}
                  name="profitMargin"
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel>Profit Margin (%)</FormLabel>
                      <FormControl>
                        <Input type="number" step="0.1" placeholder="e.g., 10" value={field.value ?? ''} onChange={(e) => field.onChange(e.target.value === '' ? undefined : Number(e.target.value))} />
                      </FormControl>
                      <FormMessage />
                    </FormItem>
                  )}
                />
                <FormField
                  control={form.control}
                  name="riskLoadingFactor"
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel>Risk Loading Factor (%)</FormLabel>
                      <FormControl>
                        <Input type="number" step="0.1" placeholder="e.g., 5" value={field.value ?? ''} onChange={(e) => field.onChange(e.target.value === '' ? undefined : Number(e.target.value))} />
                      </FormControl>
                      <FormMessage />
                    </FormItem>
                  )}
                />
              </div>
              <Button type="submit" className="w-full md:w-auto">
                Calculate Total Premium
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
            <CardDescription>See premium calculation and recommendations.</CardDescription>
          </CardHeader>
          <CardContent className="space-y-6">
            <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
              <div className="p-4 border rounded">
                <p className="text-sm text-muted-foreground">Total Premium</p>
                <p className="text-2xl font-semibold text-primary">{result.totalPremium.toLocaleString()}</p>
                <p className="text-xs text-muted-foreground">Final premium</p>
              </div>
              <div className="p-4 border rounded">
                <p className="text-sm text-muted-foreground">Base Premium</p>
                <p className="text-2xl font-semibold text-primary">{result.basePremium.toLocaleString()}</p>
                <p className="text-xs text-muted-foreground">Before risk loading</p>
              </div>
              <div className="p-4 border rounded">
                <p className="text-sm text-muted-foreground">Loading Factor</p>
                <p className="text-2xl font-semibold text-primary">{result.loadingFactor.toFixed(1)}%</p>
                <p className="text-xs text-muted-foreground">Overall loading</p>
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
            <strong>Profit Amount</strong> = (Expected Losses + Expense Load) Ã— Profit Margin
          </p>
          <p>
            <strong>Base Premium</strong> = Expected Losses + Expense Load + Profit Amount
          </p>
          <p>
            <strong>Total Premium</strong> = Base Premium Ã— (1 + Risk Loading Factor)
          </p>
          <p>
            <strong>Loading Factor</strong> = [(Total Premium - Expected Losses) / Expected Losses] Ã— 100
          </p>
          <p>The premium loading factor calculation ensures premiums cover expected losses, operating expenses, profit margin, and provide a buffer for risk and uncertainty. This comprehensive approach ensures insurers can meet obligations while maintaining profitability.</p>
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
                <p className="text-sm text-muted-foreground">Profit Amount</p>
                <p className="text-xl font-semibold text-primary">{result.profitAmount.toLocaleString()}</p>
                <p className="text-xs text-muted-foreground">Profit component</p>
              </div>
              <div className="p-4 border rounded">
                <p className="text-sm text-muted-foreground">Expected Losses</p>
                <p className="text-xl font-semibold text-primary">{result.expectedLosses.toLocaleString()}</p>
                <p className="text-xs text-muted-foreground">Claims component</p>
              </div>
              <div className="p-4 border rounded">
                <p className="text-sm text-muted-foreground">Expense Load</p>
                <p className="text-xl font-semibold text-primary">{result.expenseLoad.toLocaleString()}</p>
                <p className="text-xs text-muted-foreground">Expense component</p>
              </div>
              <div className="p-4 border rounded">
                <p className="text-sm text-muted-foreground">Risk Loading</p>
                <p className="text-xl font-semibold text-primary">{result.riskLoadingFactor.toFixed(1)}%</p>
                <p className="text-xs text-muted-foreground">Risk buffer</p>
              </div>
            </div>
          ) : (
            <p className="text-sm text-muted-foreground">Enter your premium data to see additional insights.</p>
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
    <meta itemProp="name" content="The Complete Guide to Premium Loading Factor: Insurance Pricing and Profitability" />
    <meta itemProp="description" content="An in-depth guide on premium loading factors, insurance pricing components, and calculating premiums that ensure profitability and adequate risk coverage." />
    <meta itemProp="keywords" content="premium loading factor, insurance pricing, expected losses, expense load, profit margin, risk loading, insurance premium calculation" />
    <meta itemProp="author" content="[Your Site's Finance Team]" />
    <meta itemProp="datePublished" content="2025-12-02" />
    <meta itemProp="url" content="/premium-loading-factor-calculator" />

    <h1 className="text-3xl md:text-4xl font-extrabold text-foreground mb-4" itemProp="headline">The Complete Guide to Premium Loading Factor: Insurance Pricing and Profitability</h1>
    <p className="text-lg italic text-gray-700 dark:text-gray-300">A comprehensive look at premium loading factors, insurance pricing components, and strategies for ensuring profitable and sustainable premium rates.</p>

    <h2 className="text-2xl font-bold text-foreground mt-8 mb-4">Table of Contents: Jump to a Section</h2>
    <ul className="list-disc ml-6 space-y-2 text-blue-600 dark:text-blue-400">
        <li><a href="#components" className="hover:underline">Premium Components</a></li>
        <li><a href="#calculation" className="hover:underline">Premium Calculation</a></li>
        <li><a href="#loading" className="hover:underline">Loading Factors Explained</a></li>
        <li><a href="#pricing" className="hover:underline">Pricing Strategy</a></li>
        <li><a href="#optimization" className="hover:underline">Optimizing Premiums</a></li>
        <li><a href="#considerations" className="hover:underline">Key Considerations</a></li>
    </ul>
<hr className="my-6" />

    <h2 id="components" className="text-2xl font-bold text-foreground pt-8" itemProp="articleSection">Premium Components</h2>
    <p>Insurance premiums are composed of several components that together ensure the insurer can cover losses, expenses, and generate profits.</p>

    <h3 className="text-xl font-semibold text-foreground mt-6">Expected Losses</h3>
    <p><b>Expected Losses</b> represent the anticipated claims costs based on actuarial analysis, historical data, and statistical models. This is the pure premium or loss cost component. Expected losses vary by:</p>
    <ul className="list-disc ml-6 space-y-1">
        <li>Type of coverage (property, liability, health, etc.)</li>
        <li>Risk characteristics (location, age, value, etc.)</li>
        <li>Policy terms (deductibles, limits, exclusions)</li>
        <li>Loss trends and inflation</li>
    </ul>

    <h3 className="text-xl font-semibold text-foreground mt-6">Expense Load</h3>
    <p><b>Expense Load</b> covers the insurer's operating costs, including:</p>
    <ul className="list-disc ml-6 space-y-1">
        <li>Underwriting and policy issuance</li>
        <li>Policy administration and servicing</li>
        <li>Claims processing and adjustment</li>
        <li>Agent and broker commissions</li>
        <li>Marketing and acquisition costs</li>
        <li>General overhead and administrative expenses</li>
    </ul>

    <h3 className="text-xl font-semibold text-foreground mt-6">Profit Margin</h3>
    <p><b>Profit Margin</b> is the desired return on the policy, typically expressed as a percentage of the sum of expected losses and expenses. It compensates shareholders for providing capital and assumes risk. Profit margins vary by:</p>
    <ul className="list-disc ml-6 space-y-1">
        <li>Line of business and risk level</li>
        <li>Market conditions and competition</li>
        <li>Regulatory requirements</li>
        <li>Company objectives and strategy</li>
    </ul>

    <h3 className="text-xl font-semibold text-foreground mt-6">Risk Loading Factor</h3>
    <p><b>Risk Loading Factor</b> is an additional percentage added to account for uncertainty, volatility, and adverse deviations from expected outcomes. It provides a safety buffer for:</p>
    <ul className="list-disc ml-6 space-y-1">
        <li>Model uncertainty and parameter estimation errors</li>
        <li>Adverse selection and moral hazard</li>
        <li>Catastrophic events and tail risks</li>
        <li>Economic and market volatility</li>
    </ul>

<hr className="my-6" />

    <h2 id="calculation" className="text-2xl font-bold text-foreground pt-8" itemProp="articleSection">Premium Calculation</h2>
    <p>The total premium calculation follows a structured approach:</p>

    <h3 className="text-xl font-semibold text-foreground mt-6">Step 1: Calculate Profit Amount</h3>
    <div className="bg-gray-100 dark:bg-gray-800 p-4 rounded-lg my-4">
        <p className="font-mono"><strong>Profit Amount = (Expected Losses + Expense Load) Ã— Profit Margin</strong></p>
    </div>
    <p>Example: Expected losses $500, expenses $100, profit margin 10%</p>
    <p>Profit Amount = ($500 + $100) Ã— 10% = $60</p>

    <h3 className="text-xl font-semibold text-foreground mt-6">Step 2: Calculate Base Premium</h3>
    <div className="bg-gray-100 dark:bg-gray-800 p-4 rounded-lg my-4">
        <p className="font-mono"><strong>Base Premium = Expected Losses + Expense Load + Profit Amount</strong></p>
    </div>
    <p>Base Premium = $500 + $100 + $60 = $660</p>

    <h3 className="text-xl font-semibold text-foreground mt-6">Step 3: Apply Risk Loading</h3>
    <div className="bg-gray-100 dark:bg-gray-800 p-4 rounded-lg my-4">
        <p className="font-mono"><strong>Total Premium = Base Premium Ã— (1 + Risk Loading Factor)</strong></p>
    </div>
    <p>If risk loading factor is 5%: Total Premium = $660 Ã— 1.05 = $693</p>

    <h3 className="text-xl font-semibold text-foreground mt-6">Overall Loading Factor</h3>
    <div className="bg-gray-100 dark:bg-gray-800 p-4 rounded-lg my-4">
        <p className="font-mono"><strong>Loading Factor = [(Total Premium - Expected Losses) / Expected Losses] Ã— 100</strong></p>
    </div>
    <p>Loading Factor = [($693 - $500) / $500] Ã— 100 = 38.6%</p>
    <p>This indicates the premium is 38.6% higher than expected losses, covering expenses, profit, and risk.</p>

<hr className="my-6" />

    <h2 id="loading" className="text-2xl font-bold text-foreground pt-8" itemProp="articleSection">Loading Factors Explained</h2>
    <p>Loading factors vary significantly by line of business and market conditions.</p>

    <h3 className="text-xl font-semibold text-foreground mt-6">Typical Loading Factors</h3>
    <div className="overflow-x-auto my-6 p-4 bg-gray-50 dark:bg-gray-800 border rounded-lg">
        <table className="w-full text-left border-collapse">
            <thead>
                <tr>
                    <th className="border-b p-2 font-bold">Line of Business</th>
                    <th className="border-b p-2 font-bold">Typical Loading</th>
                    <th className="border-b p-2 font-bold">Notes</th>
                </tr>
            </thead>
            <tbody>
                <tr>
                    <td className="border-b p-2">Personal Auto</td>
                    <td className="border-b p-2">25-40%</td>
                    <td className="border-b p-2">Competitive market, high frequency</td>
                </tr>
                <tr>
                    <td className="border-b p-2">Homeowners</td>
                    <td className="border-b p-2">30-45%</td>
                    <td className="border-b p-2">Moderate volatility</td>
                </tr>
                <tr>
                    <td className="border-b p-2">Commercial Property</td>
                    <td className="border-b p-2">35-50%</td>
                    <td className="border-b p-2">Higher risk, larger exposures</td>
                </tr>
                <tr>
                    <td className="border-b p-2">Liability</td>
                    <td className="border-b p-2">40-60%</td>
                    <td className="border-b p-2">High severity, long tail</td>
                </tr>
            </tbody>
        </table>
    </div>

<hr className="my-6" />

    <h2 id="pricing" className="text-2xl font-bold text-foreground pt-8" itemProp="articleSection">Pricing Strategy</h2>
    <p>Effective premium pricing balances multiple objectives.</p>

    <h3 className="text-xl font-semibold text-foreground mt-6">Objectives</h3>
    <ul className="list-disc ml-6 space-y-1">
        <li><b>Profitability:</b> Generate adequate returns for shareholders</li>
        <li><b>Competitiveness:</b> Remain competitive in the market</li>
        <li><b>Adequacy:</b> Cover all costs including adverse experience</li>
        <li><b>Equity:</b> Price fairly based on risk</li>
    </ul>

    <h3 className="text-xl font-semibold text-foreground mt-6">Market Conditions</h3>
    <p>Premium pricing responds to insurance market cycles:</p>
    <ul className="list-disc ml-6 space-y-1">
        <li><b>Hard Market:</b> High demand, limited capacity, higher premiums and loading factors</li>
        <li><b>Soft Market:</b> Excess capacity, intense competition, lower premiums and loading factors</li>
        <li><b>Stable Market:</b> Balanced supply and demand, moderate loading factors</li>
    </ul>

<hr className="my-6" />

    <h2 id="optimization" className="text-2xl font-bold text-foreground pt-8" itemProp="articleSection">Optimizing Premiums</h2>
    <p>Optimizing premiums involves improving each component.</p>

    <h3 className="text-xl font-semibold text-foreground mt-6">Reducing Expected Losses</h3>
    <ul className="list-disc ml-6 space-y-1">
        <li>Better risk selection and underwriting</li>
        <li>Loss prevention and risk control programs</li>
        <li>Appropriate deductibles and policy terms</li>
        <li>Actuarial model improvements</li>
    </ul>

    <h3 className="text-xl font-semibold text-foreground mt-6">Controlling Expenses</h3>
    <ul className="list-disc ml-6 space-y-1">
        <li>Operational efficiency improvements</li>
        <li>Technology and automation</li>
        <li>Streamlined processes</li>
        <li>Expense allocation optimization</li>
    </ul>

    <h3 className="text-xl font-semibold text-foreground mt-6">Optimizing Loading Factors</h3>
    <ul className="list-disc ml-6 space-y-1">
        <li>Reduce risk loading through better modeling</li>
        <li>Optimize profit margins based on market conditions</li>
        <li>Balance profitability with competitiveness</li>
    </ul>

<hr className="my-6" />

    <h2 id="considerations" className="text-2xl font-bold text-foreground pt-8" itemProp="articleSection">Key Considerations</h2>
    
    <h3 className="text-xl font-semibold text-foreground mt-6">Regulatory Requirements</h3>
    <p>Regulators may require premiums to be adequate, not excessive, and not unfairly discriminatory. Insurers must justify premium levels and loading factors.</p>

    <h3 className="text-xl font-semibold text-foreground mt-6">Competitive Position</h3>
    <p>Premiums must be competitive to attract and retain customers while maintaining profitability. Market benchmarking is essential.</p>

    <h3 className="text-xl font-semibold text-foreground mt-6">Long-term Sustainability</h3>
    <p>Premiums must be sustainable over time. Underpricing may lead to losses and insolvency, while overpricing may lose market share.</p>

<hr className="my-6" />

    <h2 className="text-2xl font-bold text-foreground pt-8" itemProp="articleSection">Conclusion</h2>
    <p>Premium loading factors are essential components of insurance pricing, ensuring premiums cover expected losses, expenses, profit, and risk. Understanding each component, calculation methods, and optimization strategies enables insurers to price effectively while maintaining profitability and competitiveness. Regular monitoring and adjustment of loading factors based on experience and market conditions ensures sustainable pricing.</p>
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
          <p>This tool calculates insurance premium including expected losses, expenses, profit margin, and risk loading factor.</p>
          <p>Outputs include total premium, base premium, loading factor, interpretation, recommendations, an action plan, and supporting metrics.</p>
          <p>Formula, steps, guide content, related tools, and FAQs ensure humans or AI assistants can interpret the methodology instantly.</p>
        </CardContent>
      </Card>
    </div>
  );
}

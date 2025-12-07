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
  expectedPayoff: z.number({ invalid_type_error: 'Enter expected payoff' }).min(0),
  riskPremium: z.number({ invalid_type_error: 'Enter risk premium' }).min(0).max(100),
});

type FormValues = z.infer<typeof formSchema>;

type ResultPayload = {
  expectedPayoff: number;
  riskPremium: number;
  certaintyEquivalent: number;
  riskPremiumAmount: number;
  interpretation: string;
  status: 'optimal' | 'good' | 'moderate' | 'low';
  recommendations: string[];
  plan: { label: string; detail: string }[];
};

const steps = [
  'Enter expected payoff (expected value of the risky investment or prospect).',
  'Enter risk premium as a percentage (e.g., 5 for 5%).',
  'Review certainty equivalent calculation and recommendations.',
];

const faqs = [
  {
    question: 'What is certainty equivalent?',
    answer:
      'Certainty equivalent is the guaranteed amount an individual considers equally desirable as a risky investment with a higher, uncertain return. It represents the minimum certain amount the individual would accept instead of taking the risky prospect.',
  },
  {
    question: 'What is risk premium?',
    answer:
      'Risk premium is the additional return required to compensate an investor for choosing a risky asset over a risk-free one. It is the extra return demanded for bearing uncertainty and is expressed as a percentage of the expected payoff.',
  },
  {
    question: 'How is certainty equivalent calculated?',
    answer:
      'Certainty Equivalent = Expected Payoff / (1 + Risk Premium). The risk premium is expressed as a decimal (e.g., 0.05 for 5%). This formula adjusts the expected payoff downward to account for risk.',
  },
  {
    question: 'What does certainty equivalent tell you?',
    answer:
      'Certainty equivalent shows the certain amount that provides the same utility as the risky prospect. If certainty equivalent is less than expected payoff, the individual is risk-averse and requires compensation for bearing risk. Lower certainty equivalent indicates higher risk aversion.',
  },
  {
    question: 'How is risk premium related to risk aversion?',
    answer:
      'Higher risk premium indicates higher risk aversion. Risk-averse individuals require larger risk premiums to accept risky prospects. Risk-neutral individuals have zero risk premium (certainty equivalent equals expected payoff). Risk-seeking individuals have negative risk premiums.',
  },
  {
    question: 'What is a reasonable risk premium?',
    answer:
      'Risk premiums vary by individual, asset class, and market conditions. Typical equity risk premiums range from 3% to 8% annually. Higher volatility or uncertainty warrants higher risk premiums. Risk premiums reflect compensation for systematic risk and uncertainty.',
  },
  {
    question: 'How do I use certainty equivalent for decision-making?',
    answer:
      'Compare certainty equivalent to available certain alternatives. If certainty equivalent exceeds the certain alternative, accept the risky prospect. If certainty equivalent is less than the certain alternative, prefer the certain option. This helps evaluate whether risks are adequately compensated.',
  },
  {
    question: 'What is the relationship between certainty equivalent and expected utility?',
    answer:
      'Certainty equivalent equals the wealth level where utility equals expected utility: U(CE) = E[U(W)]. For risk-averse individuals, certainty equivalent is less than expected value. The difference (risk premium amount) represents the cost of risk-bearing.',
  },
  {
    question: 'Can certainty equivalent be calculated from expected utility?',
    answer:
      'Yes. If you know the utility function and expected utility, certainty equivalent is the wealth level where U(CE) = E[U(W)]. This requires solving for CE in the utility function given the expected utility value.',
  },
  {
    question: 'How does wealth level affect certainty equivalent?',
    answer:
      'Wealth level affects risk aversion and thus certainty equivalent. Decreasing absolute risk aversion means risk premium decreases with wealth (certainty equivalent increases relative to expected payoff). Constant relative risk aversion means risk premium as percentage of wealth remains constant.',
  },
];

const relatedCalculators = [
  {
    name: 'Expected Utility of Wealth Calculator',
    slug: 'expected-utility-of-wealth-calculator',
    description: 'Calculate expected utility for decisions.',
  },
  {
    name: 'Risk Aversion Coefficient Calculator',
    slug: 'risk-aversion-coefficient-calculator',
    description: 'Calculate risk aversion coefficients.',
  },
  {
    name: 'Risk/Reward Ratio Calculator',
    slug: 'risk-reward-ratio-calculator',
    description: 'Calculate risk/reward ratios.',
  },
  {
    name: 'Position Sizing Calculator',
    slug: 'position-sizing-calculator',
    description: 'Calculate optimal position sizes.',
  },
];

const baseUrl = 'https://mycalculating.com/category/finance/certainty-equivalent-calculator';

const schemaMarkup = {
  '@context': 'https://schema.org',
  '@graph': [
    {
      '@type': 'BreadcrumbList',
      itemListElement: [
        { '@type': 'ListItem', position: 1, name: 'Home', item: 'https://mycalculating.com' },
        { '@type': 'ListItem', position: 2, name: 'Finance', item: 'https://mycalculating.com/category/finance' },
        { '@type': 'ListItem', position: 3, name: 'Certainty Equivalent Calculator', item: baseUrl },
      ],
    },
    {
      '@type': 'SoftwareApplication',
      name: 'Certainty Equivalent Calculator',
      applicationCategory: 'Calculator',
      operatingSystem: 'Web Browser',
      description: 'Calculate certainty equivalent and risk premium for evaluating risky investments and prospects.',
      url: baseUrl,
      offers: { '@type': 'Offer', price: '0', priceCurrency: 'USD' },
    },
  ],
};

const calculateResult = (values: FormValues): ResultPayload => {
  const expectedPayoff = values.expectedPayoff;
  const riskPremiumPct = values.riskPremium / 100;
  
  // Certainty Equivalent = Expected Payoff / (1 + Risk Premium)
  const certaintyEquivalent = expectedPayoff / (1 + riskPremiumPct);
  
  // Risk Premium Amount = Expected Payoff - Certainty Equivalent
  const riskPremiumAmount = expectedPayoff - certaintyEquivalent;
  
  let status: ResultPayload['status'] = 'optimal';
  const cePercentOfExpected = (certaintyEquivalent / expectedPayoff) * 100;
  
  let interpretation = `Certainty equivalent of ${certaintyEquivalent.toLocaleString()} represents the certain amount equally preferred to the risky prospect with expected payoff ${expectedPayoff.toLocaleString()}. Risk premium of ${values.riskPremium}% results in ${riskPremiumAmount.toLocaleString()} reduction from expected payoff.`;
  
  if (cePercentOfExpected < 70) {
    status = 'low';
    interpretation += ' Very low certainty equivalent indicates high risk aversion. Large risk premium required to accept this level of uncertainty.';
  } else if (cePercentOfExpected < 85) {
    status = 'moderate';
    interpretation += ' Moderate risk aversion. Risk premium appropriately compensates for uncertainty.';
  } else {
    status = 'optimal';
    interpretation += ' Low risk premium indicates relatively low risk aversion for this prospect.';
  }

  const recommendations = [
    `Evaluate risk compensation: ${values.riskPremium}% risk premium reduces certainty equivalent by ${riskPremiumAmount.toLocaleString()}. Assess if this risk premium adequately compensates for the uncertainty in the risky prospect.`,
    `Compare to alternatives: Certainty equivalent of ${certaintyEquivalent.toLocaleString()} can be compared to certain investment alternatives. If certain alternatives offer more, prefer certainty. If risky prospect's certainty equivalent is higher, the risk may be worth taking.`,
    'Assess risk aversion: The difference between expected payoff and certainty equivalent reflects your risk aversion. If the gap is large, you are highly risk-averse and require substantial compensation for uncertainty.',
    `Review risk-return tradeoff: Expected payoff ${expectedPayoff.toLocaleString()} with ${values.riskPremium}% risk premium yields certainty equivalent ${certaintyEquivalent.toLocaleString()}. Evaluate if the expected return justifies the risk premium required.`,
  ];
  
  if (riskPremiumAmount > expectedPayoff * 0.3) {
    recommendations.push('High risk premium: The risk premium exceeds 30% of expected payoff, indicating very high risk aversion or high uncertainty. Consider whether the risky prospect is appropriate for your risk tolerance.');
  }

  const plan = [
    { label: 'This Week', detail: `Calculate certainty equivalent: ${certaintyEquivalent.toLocaleString()} for expected payoff ${expectedPayoff.toLocaleString()} with ${values.riskPremium}% risk premium. Document assumptions and risk assessment.` },
    { label: 'This Month', detail: 'Compare certainty equivalent to available certain investment alternatives. Evaluate whether risky prospects offer adequate compensation for risk. Adjust risk premiums based on experience and changing risk tolerance.' },
    { label: 'Ongoing', detail: 'Use certainty equivalent framework for investment and business decision-making. Regularly reassess risk premiums based on market conditions, experience, and evolving risk preferences. Balance expected returns with risk tolerance.' },
  ];

  return { expectedPayoff, riskPremium: values.riskPremium, certaintyEquivalent, riskPremiumAmount, interpretation, status, recommendations, plan };
};

export default function CertaintyEquivalentCalculator() {
  const [result, setResult] = useState<ResultPayload | null>(null);

  const form = useForm<FormValues>({
    resolver: zodResolver(formSchema),
    defaultValues: {
      expectedPayoff: undefined,
      riskPremium: undefined,
    },
  });

  return (
    <div className="space-y-8">
      <Script id="certainty-equivalent-schema" type="application/ld+json" strategy="afterInteractive" dangerouslySetInnerHTML={{ __html: JSON.stringify(schemaMarkup) }} />

      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <Heart className="h-5 w-5" />
            Certainty Equivalent Calculator
          </CardTitle>
          <CardDescription>Calculate certainty equivalent and risk premium for evaluating risky investments and prospects.</CardDescription>
        </CardHeader>
      </Card>

      <Card>
        <CardHeader>
          <CardTitle>Input your prospect data</CardTitle>
        </CardHeader>
        <CardContent>
          <Form {...form}>
            <form onSubmit={form.handleSubmit((values) => setResult(calculateResult(values)))} className="space-y-6">
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <FormField
                  control={form.control}
                  name="expectedPayoff"
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel>Expected Payoff</FormLabel>
                      <FormControl>
                        <Input type="number" step="0.01" placeholder="e.g., 100000" value={field.value ?? ''} onChange={(e) => field.onChange(e.target.value === '' ? undefined : Number(e.target.value))} />
                      </FormControl>
                      <FormMessage />
                    </FormItem>
                  )}
                />
                <FormField
                  control={form.control}
                  name="riskPremium"
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel>Risk Premium (%)</FormLabel>
                      <FormControl>
                        <Input type="number" step="0.1" placeholder="e.g., 5" value={field.value ?? ''} onChange={(e) => field.onChange(e.target.value === '' ? undefined : Number(e.target.value))} />
                      </FormControl>
                      <FormMessage />
                    </FormItem>
                  )}
                />
              </div>
              <Button type="submit" className="w-full md:w-auto">
                Calculate Certainty Equivalent
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
            <CardDescription>See certainty equivalent calculation and recommendations.</CardDescription>
          </CardHeader>
          <CardContent className="space-y-6">
            <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
              <div className="p-4 border rounded">
                <p className="text-sm text-muted-foreground">Certainty Equivalent</p>
                <p className="text-2xl font-semibold text-primary">{result.certaintyEquivalent.toLocaleString()}</p>
                <p className="text-xs text-muted-foreground">Certain amount</p>
              </div>
              <div className="p-4 border rounded">
                <p className="text-sm text-muted-foreground">Expected Payoff</p>
                <p className="text-2xl font-semibold text-primary">{result.expectedPayoff.toLocaleString()}</p>
                <p className="text-xs text-muted-foreground">Risky prospect</p>
              </div>
              <div className="p-4 border rounded">
                <p className="text-sm text-muted-foreground">Risk Premium Amount</p>
                <p className="text-2xl font-semibold text-primary">{result.riskPremiumAmount.toLocaleString()}</p>
                <p className="text-xs text-muted-foreground">Premium amount</p>
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
            <strong>Certainty Equivalent</strong> = Expected Payoff / (1 + Risk Premium)
          </p>
          <p>
            <strong>Risk Premium Amount</strong> = Expected Payoff - Certainty Equivalent
          </p>
          <p>
            <strong>Risk Premium</strong> = (Expected Payoff / Certainty Equivalent) - 1
          </p>
          <p>The certainty equivalent is the guaranteed amount that provides the same utility as the risky prospect. Risk-averse individuals have certainty equivalent less than expected payoff. The difference represents the cost of bearing risk. Higher risk premiums indicate higher risk aversion or greater uncertainty.</p>
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
                <p className="text-sm text-muted-foreground">CE as % of Expected</p>
                <p className="text-xl font-semibold text-primary">
                  {((result.certaintyEquivalent / result.expectedPayoff) * 100).toFixed(1)}%
                </p>
                <p className="text-xs text-muted-foreground">Certainty ratio</p>
              </div>
              <div className="p-4 border rounded">
                <p className="text-sm text-muted-foreground">Risk Premium</p>
                <p className="text-xl font-semibold text-primary">{result.riskPremium.toFixed(1)}%</p>
                <p className="text-xs text-muted-foreground">Required premium</p>
              </div>
              <div className="p-4 border rounded">
                <p className="text-sm text-muted-foreground">Risk Reduction</p>
                <p className="text-xl font-semibold text-primary">{result.riskPremiumAmount.toLocaleString()}</p>
                <p className="text-xs text-muted-foreground">Amount sacrificed</p>
              </div>
            </div>
          ) : (
            <p className="text-sm text-muted-foreground">Enter your prospect data to see additional insights.</p>
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
        className="space-y-6 text-muted-foreground leading-relaxed bg-white dark:bg-gray-900 p-6 md:p-10 rounded-lg shadow-lg"
        itemScope
        itemType="https://schema.org/Article"
      >
    <meta itemProp="name" content="The Complete Guide to Certainty Equivalent: Risk Premium and Decision-Making" />
    <meta itemProp="description" content="An in-depth guide on certainty equivalent, risk premium, and using these concepts for evaluating risky investments and prospects in economics and finance." />
    <meta itemProp="keywords" content="certainty equivalent, risk premium, risk aversion, expected utility, decision making, investment evaluation" />
    <meta itemProp="author" content="[Your Site's Finance Team]" />
    <meta itemProp="datePublished" content="2025-12-02" />
    <meta itemProp="url" content="/category/finance/certainty-equivalent-calculator" />

    <h1 className="text-3xl md:text-4xl font-extrabold text-foreground mb-4" itemProp="headline">The Complete Guide to Certainty Equivalent: Risk Premium and Decision-Making</h1>
    <p className="text-lg italic text-gray-700 dark:text-gray-300">A comprehensive look at certainty equivalent, risk premium, and how to use these concepts for evaluating risky investments and prospects.</p>

    <h2 className="text-2xl font-bold text-foreground mt-8 mb-4">Table of Contents: Jump to a Section</h2>
    <ul className="list-disc ml-6 space-y-2 text-blue-600 dark:text-blue-400">
        <li><a href="#basics" className="hover:underline">Fundamentals of Certainty Equivalent</a></li>
        <li><a href="#premium" className="hover:underline">Risk Premium Explained</a></li>
        <li><a href="#calculation" className="hover:underline">Calculation Methods</a></li>
        <li><a href="#interpretation" className="hover:underline">Interpreting Results</a></li>
        <li><a href="#applications" className="hover:underline">Applications</a></li>
        <li><a href="#relationship" className="hover:underline">Relationship to Expected Utility</a></li>
    </ul>
<hr className="my-6" />

    <h2 id="basics" className="text-2xl font-bold text-foreground pt-8" itemProp="articleSection">Fundamentals of Certainty Equivalent</h2>
    <p>The certainty equivalent is a fundamental concept in decision theory and economics that helps evaluate risky prospects by finding the certain amount equally preferred.</p>

    <h3 className="text-xl font-semibold text-foreground mt-6">What is Certainty Equivalent?</h3>
    <p><b>Certainty Equivalent (CE)</b> is the guaranteed amount an individual considers equally desirable as a risky investment with a higher, uncertain return. It answers the question: "What certain amount would you accept instead of this risky prospect?"</p>

    <h3 className="text-xl font-semibold text-foreground mt-6">Key Characteristics</h3>
    <ul className="list-disc ml-6 space-y-1">
        <li><b>Risk-Neutral:</b> CE = Expected Payoff (no risk premium required)</li>
        <li><b>Risk-Averse:</b> CE &lt; Expected Payoff (risk premium required)</li>
        <li><b>Risk-Seeking:</b> CE &gt; Expected Payoff (willing to pay premium for risk)</li>
    </ul>

    <h3 className="text-xl font-semibold text-foreground mt-6">Why It Matters</h3>
    <p>Certainty equivalent enables comparison between risky and certain alternatives, helping decision-makers evaluate whether risks are adequately compensated. It quantifies risk aversion and guides investment and business decisions.</p>

<hr className="my-6" />

    <h2 id="premium" className="text-2xl font-bold text-foreground pt-8" itemProp="articleSection">Risk Premium Explained</h2>
    <p>Risk premium is the additional return required to compensate for bearing uncertainty.</p>

    <h3 className="text-xl font-semibold text-foreground mt-6">Definition</h3>
    <p><b>Risk Premium</b> is the extra return (expressed as a percentage) that an investor requires to choose a risky asset over a risk-free alternative. It compensates for:</p>
    <ul className="list-disc ml-6 space-y-1">
        <li>Uncertainty and volatility</li>
        <li>Potential for losses</li>
        <li>Risk aversion</li>
        <li>Systematic risk (market risk)</li>
    </ul>

    <h3 className="text-xl font-semibold text-foreground mt-6">Risk Premium and Certainty Equivalent</h3>
    <p>The risk premium determines how much the certainty equivalent differs from expected payoff:</p>
    <div className="bg-gray-100 dark:bg-gray-800 p-4 rounded-lg my-4">
        <p className="font-mono"><strong>Risk Premium Amount = Expected Payoff - Certainty Equivalent</strong></p>
    </div>
    <p>Higher risk premiums result in lower certainty equivalents, indicating higher risk aversion or greater uncertainty.</p>

<hr className="my-6" />

    <h2 id="calculation" className="text-2xl font-bold text-foreground pt-8" itemProp="articleSection">Calculation Methods</h2>
    
    <h3 className="text-xl font-semibold text-foreground mt-6">Basic Formula</h3>
    <div className="bg-gray-100 dark:bg-gray-800 p-4 rounded-lg my-4">
        <p className="font-mono text-lg"><strong>Certainty Equivalent = Expected Payoff / (1 + Risk Premium)</strong></p>
    </div>
    
    <h3 className="text-xl font-semibold text-foreground mt-6">Example Calculation</h3>
    <p>Risky investment:</p>
    <ul className="list-disc ml-6 space-y-1">
        <li>50% chance of $100,000</li>
        <li>50% chance of $0</li>
        <li>Expected Payoff = $50,000</li>
        <li>Risk Premium = 5%</li>
    </ul>
    <p>Certainty Equivalent = $50,000 / (1 + 0.05) = $47,619.05</p>
    <p>This means the individual is indifferent between receiving $47,619.05 with certainty and taking the risky investment with an expected payoff of $50,000.</p>

    <h3 className="text-xl font-semibold text-foreground mt-6">From Expected Utility</h3>
    <p>If you know expected utility and the utility function, certainty equivalent is found by solving:</p>
    <div className="bg-gray-100 dark:bg-gray-800 p-4 rounded-lg my-4">
        <p className="font-mono"><strong>U(CE) = E[U(W)]</strong></p>
    </div>
    <p>For square-root utility: CE = [E[U(W)]]²</p>
    <p>For logarithmic utility: CE = e^E[U(W)]</p>

<hr className="my-6" />

    <h2 id="interpretation" className="text-2xl font-bold text-foreground pt-8" itemProp="articleSection">Interpreting Results</h2>
    <p>Understanding certainty equivalent results helps evaluate risky prospects.</p>

    <h3 className="text-xl font-semibold text-foreground mt-6">Comparing to Alternatives</h3>
    <p>Compare certainty equivalent to available certain alternatives:</p>
    <ul className="list-disc ml-6 space-y-1">
        <li><b>CE &gt; Certain Alternative:</b> Prefer risky prospect</li>
        <li><b>CE &lt; Certain Alternative:</b> Prefer certain alternative</li>
        <li><b>CE = Certain Alternative:</b> Indifferent</li>
    </ul>

    <h3 className="text-xl font-semibold text-foreground mt-6">Risk Aversion Assessment</h3>
    <p>The gap between expected payoff and certainty equivalent indicates risk aversion:</p>
    <ul className="list-disc ml-6 space-y-1">
        <li><b>Large Gap:</b> High risk aversion, requires substantial risk premium</li>
        <li><b>Small Gap:</b> Low risk aversion, requires small risk premium</li>
        <li><b>No Gap:</b> Risk neutral, no risk premium required</li>
    </ul>

<hr className="my-6" />

    <h2 id="applications" className="text-2xl font-bold text-foreground pt-8" itemProp="articleSection">Applications</h2>
    <p>Certainty equivalent has wide applications in finance and decision-making.</p>

    <h3 className="text-xl font-semibold text-foreground mt-6">Investment Evaluation</h3>
    <p>Evaluate risky investments by comparing certainty equivalent to risk-free alternatives. If certainty equivalent exceeds risk-free rate returns, the risky investment may be worthwhile given risk tolerance.</p>

    <h3 className="text-xl font-semibold text-foreground mt-6">Project Valuation</h3>
    <p>Business projects with uncertain cash flows can be evaluated using certainty equivalents. Convert risky cash flows to certain equivalents and discount at risk-free rate, or discount expected cash flows at risk-adjusted rates.</p>

    <h3 className="text-xl font-semibold text-foreground mt-6">Insurance Decisions</h3>
    <p>Insurance converts uncertain losses into certain (premium) payments. Compare the certainty equivalent of uninsured losses to insurance premiums to evaluate insurance purchases.</p>

<hr className="my-6" />

    <h2 id="relationship" className="text-2xl font-bold text-foreground pt-8" itemProp="articleSection">Relationship to Expected Utility</h2>
    <p>Certainty equivalent is closely related to expected utility theory.</p>

    <h3 className="text-xl font-semibold text-foreground mt-6">The Connection</h3>
    <p>Certainty equivalent is the wealth level where utility equals expected utility:</p>
    <div className="bg-gray-100 dark:bg-gray-800 p-4 rounded-lg my-4">
        <p className="font-mono"><strong>U(CE) = E[U(W)]</strong></p>
    </div>
    <p>This means certainty equivalent provides the same utility as the risky prospect, making the decision-maker indifferent.</p>

    <h3 className="text-xl font-semibold text-foreground mt-6">Risk Premium Formula</h3>
    <p>Risk premium can be derived from expected utility:</p>
    <div className="bg-gray-100 dark:bg-gray-800 p-4 rounded-lg my-4">
        <p className="font-mono"><strong>Risk Premium = (Expected Payoff / Certainty Equivalent) - 1</strong></p>
    </div>
    <p>Or: Risk Premium = (E[W] - CE) / CE</p>

<hr className="my-6" />

    <h2 className="text-2xl font-bold text-foreground pt-8" itemProp="articleSection">Conclusion</h2>
    <p>Certainty equivalent is a powerful tool for evaluating risky prospects by converting them to equivalent certain amounts. Understanding risk premium, calculation methods, and interpretation enables informed decision-making under uncertainty. By comparing certainty equivalents to alternatives, individuals and businesses can systematically evaluate whether risks are adequately compensated, guiding investment, project, and insurance decisions effectively.</p>
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
          <p>This tool calculates certainty equivalent and risk premium for evaluating risky investments and prospects.</p>
          <p>Outputs include certainty equivalent, expected payoff, risk premium amount, interpretation, recommendations, an action plan, and supporting metrics.</p>
          <p>Formula, steps, guide content, related tools, and FAQs ensure humans or AI assistants can interpret the methodology instantly.</p>
        </CardContent>
      </Card>
    </div>
  );
}

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
  currentWealth: z.number({ invalid_type_error: 'Enter current wealth' }).min(0),
  outcome1Wealth: z.number({ invalid_type_error: 'Enter outcome 1 wealth' }).optional(),
  outcome1Probability: z.number({ invalid_type_error: 'Enter outcome 1 probability' }).min(0).max(100).optional(),
  outcome2Wealth: z.number({ invalid_type_error: 'Enter outcome 2 wealth' }).optional(),
  outcome2Probability: z.number({ invalid_type_error: 'Enter outcome 2 probability' }).min(0).max(100).optional(),
  utilityFunction: z.enum(['square-root', 'logarithmic', 'linear', 'quadratic'], { invalid_type_error: 'Select utility function' }),
});

type FormValues = z.infer<typeof formSchema>;

type ResultPayload = {
  currentWealth: number;
  outcome1Wealth?: number;
  outcome1Probability?: number;
  outcome2Wealth?: number;
  outcome2Probability?: number;
  utilityFunction: string;
  expectedWealth: number;
  expectedUtility: number;
  currentUtility: number;
  interpretation: string;
  status: 'optimal' | 'good' | 'moderate' | 'low';
  recommendations: string[];
  plan: { label: string; detail: string }[];
};

const steps = [
  'Enter current wealth level.',
  'Select utility function type (square-root, logarithmic, linear, or quadratic).',
  'For risky prospect: Enter wealth outcomes and their probabilities.',
  'Review expected utility calculation and compare to current utility.',
];

const faqs = [
  {
    question: 'What is expected utility of wealth?',
    answer:
      'Expected utility is a concept in economics that quantifies the satisfaction or value an individual derives from different possible outcomes, each weighted by its probability. It helps evaluate decisions under uncertainty by comparing the expected utility of risky prospects to certain outcomes.',
  },
  {
    question: 'What is a utility function?',
    answer:
      'A utility function represents an individual\'s preferences over different wealth levels. It maps wealth to a utility value indicating satisfaction. Common forms include square-root (risk-averse), logarithmic (risk-averse), linear (risk-neutral), and quadratic (risk-seeking).',
  },
  {
    question: 'How is expected utility calculated?',
    answer:
      'Expected Utility = Î£ [Probability(Outcome) Ã— Utility(Outcome)]. For two outcomes: EU = P1 Ã— U(W1) + P2 Ã— U(W2). Each outcome\'s utility is calculated using the chosen utility function, then weighted by probability.',
  },
  {
    question: 'What does risk-averse mean?',
    answer:
      'Risk-averse individuals have concave utility functions (square-root, logarithmic) indicating diminishing marginal utility of wealth. They prefer certain outcomes over gambles with the same expected value. They will reject fair gambles and require a premium to accept risk.',
  },
  {
    question: 'What does risk-neutral mean?',
    answer:
      'Risk-neutral individuals have linear utility functions, valuing all increments of wealth equally. They make decisions based solely on expected value, being indifferent between certain outcomes and gambles with the same expected value.',
  },
  {
    question: 'What does risk-seeking mean?',
    answer:
      'Risk-seeking individuals have convex utility functions (quadratic) indicating increasing marginal utility of wealth. They prefer gambles over certain outcomes with the same expected value and may accept unfair gambles.',
  },
  {
    question: 'How do I interpret expected utility?',
    answer:
      'Compare expected utility to the utility of current wealth. If expected utility > current utility, the risky prospect is preferred. If expected utility < current utility, maintaining current wealth is preferred. The difference indicates the strength of preference.',
  },
  {
    question: 'What are common utility functions?',
    answer:
      'Square-root: U(W) = âˆšW (moderate risk aversion). Logarithmic: U(W) = ln(W) (constant relative risk aversion). Linear: U(W) = W (risk neutral). Quadratic: U(W) = WÂ² (risk seeking). Each reflects different risk preferences.',
  },
  {
    question: 'When should I accept a risky prospect?',
    answer:
      'Accept if expected utility exceeds the utility of current wealth. For risk-averse individuals, this typically requires the risky prospect to have higher expected value (risk premium) to compensate for uncertainty. The required premium depends on degree of risk aversion.',
  },
  {
    question: 'How does wealth level affect risk preferences?',
    answer:
      'Risk preferences may change with wealth. Decreasing absolute risk aversion (DARA) means willingness to take absolute risk increases with wealth. Constant relative risk aversion (CRRA) means willingness to risk a percentage of wealth remains constant. Wealth affects utility calculations.',
  },
];

const relatedCalculators = [
  {
    name: 'Certainty Equivalent Calculator',
    slug: 'certainty-equivalent-calculator',
    description: 'Calculate certainty equivalent for risky prospects.',
  },
  {
    name: 'Risk Aversion Coefficient Calculator',
    slug: 'risk-aversion-coefficient-calculator',
    description: 'Calculate risk aversion coefficients.',
  },
  {
    name: 'Expected Loss Frequency/Severity Calculator',
    slug: 'expected-loss-frequency-severity-calculator',
    description: 'Calculate expected losses.',
  },
  {
    name: 'Value-at-Risk (Historical Simulation) Calculator',
    slug: 'value-at-risk-historical-simulation-calculator',
    description: 'Calculate portfolio Value-at-Risk.',
  },
];

const baseUrl = 'https://mycalculating.com/finance/expected-utility-of-wealth-calculator';

const schemaMarkup = {
  '@context': 'https://schema.org',
  '@graph': [
    {
      '@type': 'BreadcrumbList',
      itemListElement: [
        { '@type': 'ListItem', position: 1, name: 'Home', item: 'https://mycalculating.com' },
        { '@type': 'ListItem', position: 2, name: 'Finance', item: 'https://mycalculating.com/finance' },
        { '@type': 'ListItem', position: 3, name: 'Expected Utility of Wealth Calculator', item: baseUrl },
      ],
    },
    {
      '@type': 'SoftwareApplication',
      name: 'Expected Utility of Wealth Calculator',
      applicationCategory: 'Calculator',
      operatingSystem: 'Web Browser',
      description: 'Calculate expected utility of wealth for decision-making under uncertainty using different utility functions.',
      url: baseUrl,
      offers: { '@type': 'Offer', price: '0', priceCurrency: 'USD' },
    },
  ],
};

// Utility functions
const calculateUtility = (wealth: number, utilityFunction: string): number => {
  if (wealth <= 0) return 0;
  switch (utilityFunction) {
    case 'square-root':
      return Math.sqrt(wealth);
    case 'logarithmic':
      return Math.log(wealth);
    case 'linear':
      return wealth;
    case 'quadratic':
      return wealth * wealth;
    default:
      return wealth;
  }
};

const calculateResult = (values: FormValues): ResultPayload => {
  const currentWealth = values.currentWealth;
  const utilityFunction = values.utilityFunction;
  
  const currentUtility = calculateUtility(currentWealth, utilityFunction);
  
  let expectedWealth = currentWealth;
  let expectedUtility = currentUtility;
  
  // Calculate expected utility if outcomes are provided
  if (values.outcome1Wealth !== undefined && values.outcome1Probability !== undefined) {
    const p1 = values.outcome1Probability / 100;
    const u1 = calculateUtility(values.outcome1Wealth, utilityFunction);
    
    let p2 = 0;
    let u2 = 0;
    if (values.outcome2Wealth !== undefined && values.outcome2Probability !== undefined) {
      p2 = values.outcome2Probability / 100;
      u2 = calculateUtility(values.outcome2Wealth, utilityFunction);
    } else {
      // If only one outcome, assume it's a certain outcome
      p2 = 1 - p1;
      u2 = currentUtility; // Use current utility as second outcome
    }
    
    expectedWealth = (values.outcome1Wealth * p1) + ((values.outcome2Wealth ?? currentWealth) * p2);
    expectedUtility = (u1 * p1) + (u2 * p2);
  }
  
  let status: ResultPayload['status'] = 'optimal';
  const utilityDiff = expectedUtility - currentUtility;
  
  let interpretation = `Current utility: ${currentUtility.toFixed(4)}, Expected utility: ${expectedUtility.toFixed(4)}. `;
  
  if (utilityDiff > 0.001) {
    status = 'good';
    interpretation += `Expected utility exceeds current utility by ${utilityDiff.toFixed(4)}. The risky prospect is preferred.`;
  } else if (utilityDiff < -0.001) {
    status = 'moderate';
    interpretation += `Expected utility is below current utility by ${Math.abs(utilityDiff).toFixed(4)}. Maintaining current wealth is preferred.`;
  } else {
    status = 'optimal';
    interpretation += `Expected utility equals current utility. Indifferent between risky prospect and current wealth.`;
  }

  const recommendations = [
    `Compare utilities: Expected utility (${expectedUtility.toFixed(4)}) vs current utility (${currentUtility.toFixed(4)}). If expected utility is higher, the risky prospect is preferred given your risk preferences.`,
    `Assess risk preferences: The ${utilityFunction} utility function indicates ${utilityFunction === 'linear' ? 'risk-neutral' : utilityFunction === 'quadratic' ? 'risk-seeking' : 'risk-averse'} preferences. Adjust utility function if it doesn't match your actual risk tolerance.`,
    'Consider expected value: Compare expected wealth to current wealth. Risk-averse individuals may prefer certain outcomes even if expected value is higher, requiring a risk premium.',
    `Review decision framework: Expected utility theory assumes rational preferences. Ensure outcomes and probabilities are accurately assessed. Consider behavioral biases that may affect decisions.`,
  ];
  
  if (expectedWealth < currentWealth && expectedUtility > currentUtility) {
    recommendations.push('Lower expected value but higher utility: Risk-seeking behavior detected. The gamble is preferred despite lower expected wealth.');
  }

  const plan = [
    { label: 'This Week', detail: `Calculate expected utility: ${expectedUtility.toFixed(4)} using ${utilityFunction} utility function. Compare to current utility (${currentUtility.toFixed(4)}) to evaluate the risky prospect.` },
    { label: 'This Month', detail: 'Review risk preferences and utility function choice. Validate that the selected utility function accurately reflects your risk tolerance. Test different scenarios and probabilities.' },
    { label: 'Ongoing', detail: 'Use expected utility framework for decision-making under uncertainty. Regularly reassess risk preferences and utility functions as wealth and circumstances change. Combine with other decision criteria as appropriate.' },
  ];

  return { 
    currentWealth, 
    outcome1Wealth: values.outcome1Wealth, 
    outcome1Probability: values.outcome1Probability, 
    outcome2Wealth: values.outcome2Wealth, 
    outcome2Probability: values.outcome2Probability, 
    utilityFunction, 
    expectedWealth, 
    expectedUtility, 
    currentUtility, 
    interpretation, 
    status, 
    recommendations, 
    plan 
  };
};

export default function ExpectedUtilityOfWealthCalculator() {
  const [result, setResult] = useState<ResultPayload | null>(null);

  const form = useForm<FormValues>({
    resolver: zodResolver(formSchema),
    defaultValues: {
      currentWealth: undefined,
      outcome1Wealth: undefined,
      outcome1Probability: undefined,
      outcome2Wealth: undefined,
      outcome2Probability: undefined,
      utilityFunction: undefined,
    },
  });

  return (
    <div className="space-y-8">
      <Script id="expected-utility-schema" type="application/ld+json" strategy="afterInteractive" dangerouslySetInnerHTML={{ __html: JSON.stringify(schemaMarkup) }} />

      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <Heart className="h-5 w-5" />
            Expected Utility of Wealth Calculator
          </CardTitle>
          <CardDescription>Calculate expected utility of wealth for decision-making under uncertainty using different utility functions.</CardDescription>
        </CardHeader>
      </Card>

      <Card>
        <CardHeader>
          <CardTitle>Input your wealth and prospects</CardTitle>
        </CardHeader>
        <CardContent>
          <Form {...form}>
            <form onSubmit={form.handleSubmit((values) => setResult(calculateResult(values)))} className="space-y-6">
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <FormField
                  control={form.control}
                  name="currentWealth"
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel>Current Wealth</FormLabel>
                      <FormControl>
                        <Input type="number" step="0.01" placeholder="e.g., 100000" value={field.value ?? ''} onChange={(e) => field.onChange(e.target.value === '' ? undefined : Number(e.target.value))} />
                      </FormControl>
                      <FormMessage />
                    </FormItem>
                  )}
                />
                <FormField
                  control={form.control}
                  name="utilityFunction"
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel>Utility Function</FormLabel>
                      <FormControl>
                        <select
                          value={field.value ?? ''}
                          onChange={(e) => field.onChange(e.target.value as FormValues['utilityFunction'])}
                          className="flex h-10 w-full rounded-md border border-input bg-background px-3 py-2 text-sm ring-offset-background file:border-0 file:bg-transparent file:text-sm file:font-medium placeholder:text-muted-foreground focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2 disabled:cursor-not-allowed disabled:opacity-50"
                        >
                          <option value="">Select utility function</option>
                          <option value="square-root">Square-Root (Risk-Averse)</option>
                          <option value="logarithmic">Logarithmic (Risk-Averse)</option>
                          <option value="linear">Linear (Risk-Neutral)</option>
                          <option value="quadratic">Quadratic (Risk-Seeking)</option>
                        </select>
                      </FormControl>
                      <FormMessage />
                    </FormItem>
                  )}
                />
                <FormField
                  control={form.control}
                  name="outcome1Wealth"
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel>Outcome 1 Wealth (optional)</FormLabel>
                      <FormControl>
                        <Input type="number" step="0.01" placeholder="e.g., 200000" value={field.value ?? ''} onChange={(e) => field.onChange(e.target.value === '' ? undefined : Number(e.target.value))} />
                      </FormControl>
                      <FormMessage />
                    </FormItem>
                  )}
                />
                <FormField
                  control={form.control}
                  name="outcome1Probability"
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel>Outcome 1 Probability (%) (optional)</FormLabel>
                      <FormControl>
                        <Input type="number" step="0.1" placeholder="e.g., 50" value={field.value ?? ''} onChange={(e) => field.onChange(e.target.value === '' ? undefined : Number(e.target.value))} />
                      </FormControl>
                      <FormMessage />
                    </FormItem>
                  )}
                />
                <FormField
                  control={form.control}
                  name="outcome2Wealth"
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel>Outcome 2 Wealth (optional)</FormLabel>
                      <FormControl>
                        <Input type="number" step="0.01" placeholder="e.g., 50000" value={field.value ?? ''} onChange={(e) => field.onChange(e.target.value === '' ? undefined : Number(e.target.value))} />
                      </FormControl>
                      <FormMessage />
                    </FormItem>
                  )}
                />
                <FormField
                  control={form.control}
                  name="outcome2Probability"
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel>Outcome 2 Probability (%) (optional)</FormLabel>
                      <FormControl>
                        <Input type="number" step="0.1" placeholder="e.g., 50" value={field.value ?? ''} onChange={(e) => field.onChange(e.target.value === '' ? undefined : Number(e.target.value))} />
                      </FormControl>
                      <FormMessage />
                    </FormItem>
                  )}
                />
              </div>
              <Button type="submit" className="w-full md:w-auto">
                Calculate Expected Utility
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
            <CardDescription>See expected utility calculation and recommendations.</CardDescription>
          </CardHeader>
          <CardContent className="space-y-6">
            <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
              <div className="p-4 border rounded">
                <p className="text-sm text-muted-foreground">Expected Utility</p>
                <p className="text-2xl font-semibold text-primary">{result.expectedUtility.toFixed(4)}</p>
                <p className="text-xs text-muted-foreground">Weighted utility</p>
              </div>
              <div className="p-4 border rounded">
                <p className="text-sm text-muted-foreground">Current Utility</p>
                <p className="text-2xl font-semibold text-primary">{result.currentUtility.toFixed(4)}</p>
                <p className="text-xs text-muted-foreground">Certain utility</p>
              </div>
              <div className="p-4 border rounded">
                <p className="text-sm text-muted-foreground">Expected Wealth</p>
                <p className="text-2xl font-semibold text-primary">{result.expectedWealth.toLocaleString()}</p>
                <p className="text-xs text-muted-foreground">Weighted wealth</p>
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
            <strong>Expected Utility</strong> = Î£ [Probability(Outcome) Ã— Utility(Outcome)]
          </p>
          <p>For two outcomes: EU = Pâ‚ Ã— U(Wâ‚) + Pâ‚‚ Ã— U(Wâ‚‚)</p>
          <p>
            <strong>Utility Functions:</strong>
          </p>
          <p>Square-Root: U(W) = âˆšW (risk-averse, DARA)</p>
          <p>Logarithmic: U(W) = ln(W) (risk-averse, CRRA)</p>
          <p>Linear: U(W) = W (risk-neutral)</p>
          <p>Quadratic: U(W) = WÂ² (risk-seeking)</p>
          <p>Expected utility theory evaluates decisions under uncertainty by comparing the weighted average utility of outcomes to the utility of a certain alternative. Risk preferences are reflected in the shape of the utility function.</p>
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
                <p className="text-sm text-muted-foreground">Utility Difference</p>
                <p className="text-xl font-semibold text-primary">
                  {(result.expectedUtility - result.currentUtility).toFixed(4)}
                </p>
                <p className="text-xs text-muted-foreground">EU - Current U</p>
              </div>
              <div className="p-4 border rounded">
                <p className="text-sm text-muted-foreground">Wealth Difference</p>
                <p className="text-xl font-semibold text-primary">
                  {(result.expectedWealth - result.currentWealth).toLocaleString()}
                </p>
                <p className="text-xs text-muted-foreground">Expected - Current</p>
              </div>
              <div className="p-4 border rounded">
                <p className="text-sm text-muted-foreground">Utility Function</p>
                <p className="text-xl font-semibold text-primary capitalize">{result.utilityFunction.replace('-', ' ')}</p>
                <p className="text-xs text-muted-foreground">Risk preference</p>
              </div>
            </div>
          ) : (
            <p className="text-sm text-muted-foreground">Enter your wealth and prospect data to see additional insights.</p>
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
    <meta itemProp="name" content="The Complete Guide to Expected Utility of Wealth: Decision-Making Under Uncertainty" />
    <meta itemProp="description" content="An in-depth guide on expected utility theory, utility functions, and using expected utility for decision-making under uncertainty in economics and finance." />
    <meta itemProp="keywords" content="expected utility, utility function, risk aversion, decision making under uncertainty, expected utility theory, wealth utility" />
    <meta itemProp="author" content="[Your Site's Finance Team]" />
    <meta itemProp="datePublished" content="2025-12-02" />
    <meta itemProp="url" content="/finance/expected-utility-of-wealth-calculator" />

    <h1 className="text-3xl md:text-4xl font-extrabold text-foreground mb-4" itemProp="headline">The Complete Guide to Expected Utility of Wealth: Decision-Making Under Uncertainty</h1>
    <p className="text-lg italic text-gray-700 dark:text-gray-300">A comprehensive look at expected utility theory, utility functions, and how to use expected utility for evaluating decisions under uncertainty.</p>

    <h2 className="text-2xl font-bold text-foreground mt-8 mb-4">Table of Contents: Jump to a Section</h2>
    <ul className="list-disc ml-6 space-y-2 text-blue-600 dark:text-blue-400">
        <li><a href="#theory" className="hover:underline">Expected Utility Theory</a></li>
        <li><a href="#functions" className="hover:underline">Utility Functions</a></li>
        <li><a href="#calculation" className="hover:underline">Calculation Methods</a></li>
        <li><a href="#preferences" className="hover:underline">Risk Preferences</a></li>
        <li><a href="#applications" className="hover:underline">Applications</a></li>
        <li><a href="#limitations" className="hover:underline">Limitations and Criticisms</a></li>
    </ul>
<hr className="my-6" />

    <h2 id="theory" className="text-2xl font-bold text-foreground pt-8" itemProp="articleSection">Expected Utility Theory</h2>
    <p>Expected utility theory is a foundational framework in economics and decision theory for evaluating choices under uncertainty. It provides a systematic way to compare risky prospects and certain outcomes.</p>

    <h3 className="text-xl font-semibold text-foreground mt-6">Core Principle</h3>
    <p>Expected utility theory states that individuals make decisions by comparing the expected utility of different options. The option with the highest expected utility is preferred. This allows rational comparison of risky and certain alternatives.</p>

    <h3 className="text-xl font-semibold text-foreground mt-6">The Formula</h3>
    <div className="bg-gray-100 dark:bg-gray-800 p-4 rounded-lg my-4">
        <p className="font-mono text-lg"><strong>E[U(W)] = Î£ P(xáµ¢) Ã— U(xáµ¢)</strong></p>
    </div>
    <p>Where:</p>
    <ul className="list-disc ml-6 space-y-1">
        <li>E[U(W)] = Expected utility</li>
        <li>P(xáµ¢) = Probability of outcome i</li>
        <li>U(xáµ¢) = Utility of outcome i</li>
    </ul>

<hr className="my-6" />

    <h2 id="functions" className="text-2xl font-bold text-foreground pt-8" itemProp="articleSection">Utility Functions</h2>
    <p>Utility functions map wealth levels to utility values, reflecting an individual's preferences and risk attitudes.</p>

    <h3 className="text-xl font-semibold text-foreground mt-6">Square-Root Utility: U(W) = âˆšW</h3>
    <p>This function exhibits <b>decreasing absolute risk aversion (DARA)</b>. Risk aversion decreases as wealth increases, meaning individuals become more willing to take absolute risks as they become wealthier. Commonly used for moderate risk aversion.</p>

    <h3 className="text-xl font-semibold text-foreground mt-6">Logarithmic Utility: U(W) = ln(W)</h3>
    <p>This function exhibits <b>constant relative risk aversion (CRRA)</b>. The proportion of wealth an individual is willing to risk remains constant regardless of wealth level. Widely used in financial economics for its mathematical properties.</p>

    <h3 className="text-xl font-semibold text-foreground mt-6">Linear Utility: U(W) = W</h3>
    <p>This function represents <b>risk neutrality</b>. Individuals value all increments of wealth equally and make decisions based solely on expected value. They are indifferent between certain outcomes and gambles with the same expected value.</p>

    <h3 className="text-xl font-semibold text-foreground mt-6">Quadratic Utility: U(W) = WÂ²</h3>
    <p>This function represents <b>risk-seeking</b> behavior. Individuals have increasing marginal utility of wealth and prefer gambles over certain outcomes with the same expected value. Less commonly observed in practice.</p>

<hr className="my-6" />

    <h2 id="calculation" className="text-2xl font-bold text-foreground pt-8" itemProp="articleSection">Calculation Methods</h2>
    <p>Calculating expected utility involves determining utilities for each outcome and weighting by probabilities.</p>

    <h3 className="text-xl font-semibold text-foreground mt-6">Example Calculation</h3>
    <p>Consider a gamble with:</p>
    <ul className="list-disc ml-6 space-y-1">
        <li>50% chance of $200,000 wealth</li>
        <li>50% chance of $50,000 wealth</li>
        <li>Current wealth: $100,000</li>
        <li>Utility function: Square-root</li>
    </ul>
    <p>Utilities:</p>
    <ul className="list-disc ml-6 space-y-1">
        <li>U($200,000) = âˆš200,000 = 447.21</li>
        <li>U($50,000) = âˆš50,000 = 223.61</li>
        <li>U($100,000) = âˆš100,000 = 316.23</li>
    </ul>
    <p>Expected Utility = 0.5 Ã— 447.21 + 0.5 Ã— 223.61 = 335.41</p>
    <p>Since expected utility (335.41) &gt; current utility (316.23), the gamble is preferred for a risk-averse individual with square-root utility.</p>

<hr className="my-6" />

    <h2 id="preferences" className="text-2xl font-bold text-foreground pt-8" itemProp="articleSection">Risk Preferences</h2>
    <p>Risk preferences determine how individuals respond to uncertainty.</p>

    <h3 className="text-xl font-semibold text-foreground mt-6">Risk Aversion</h3>
    <p>Risk-averse individuals have concave utility functions and prefer certain outcomes over gambles with the same expected value. They require a risk premium (expected value above the certain outcome) to accept risk. Most individuals are risk-averse, especially for significant amounts.</p>

    <h3 className="text-xl font-semibold text-foreground mt-6">Risk Neutrality</h3>
    <p>Risk-neutral individuals have linear utility functions and make decisions based solely on expected value. They are indifferent between certain outcomes and gambles with the same expected value. Firms or individuals with very large wealth may approximate risk neutrality for small risks.</p>

    <h3 className="text-xl font-semibold text-foreground mt-6">Risk Seeking</h3>
    <p>Risk-seeking individuals have convex utility functions and prefer gambles over certain outcomes with the same expected value. They may accept unfair gambles. This behavior is less common but may occur for small amounts or in specific contexts (lotteries, entrepreneurship).</p>

<hr className="my-6" />

    <h2 id="applications" className="text-2xl font-bold text-foreground pt-8" itemProp="articleSection">Applications</h2>
    <p>Expected utility theory has wide applications in economics and finance.</p>

    <h3 className="text-xl font-semibold text-foreground mt-6">Insurance Decisions</h3>
    <p>Risk-averse individuals buy insurance because the utility of certain (premium) loss exceeds the expected utility of uncertain (claim) losses. Insurance converts uncertain losses into certain, smaller losses.</p>

    <h3 className="text-xl font-semibold text-foreground mt-6">Investment Decisions</h3>
    <p>Investors evaluate portfolios based on expected utility, balancing expected return (higher wealth) with risk (volatility). Risk-averse investors accept lower expected returns for lower risk.</p>

    <h3 className="text-xl font-semibold text-foreground mt-6">Career and Business Choices</h3>
    <p>Expected utility helps evaluate career paths, business ventures, and other life decisions involving uncertainty. Individuals compare expected utilities of different options.</p>

<hr className="my-6" />

    <h2 id="limitations" className="text-2xl font-bold text-foreground pt-8" itemProp="articleSection">Limitations and Criticisms</h2>
    <p>Expected utility theory has limitations that have led to alternative theories.</p>

    <h3 className="text-xl font-semibold text-foreground mt-6">Behavioral Criticisms</h3>
    <ul className="list-disc ml-6 space-y-1">
        <li><b>Allais Paradox:</b> People violate expected utility in certain choice scenarios</li>
        <li><b>Framing Effects:</b> Decisions depend on how options are presented</li>
        <li><b>Loss Aversion:</b> People weight losses more heavily than gains (prospect theory)</li>
        <li><b>Probability Weighting:</b> People don't use probabilities linearly</li>
    </ul>

    <h3 className="text-xl font-semibold text-foreground mt-6">Practical Limitations</h3>
    <ul className="list-disc ml-6 space-y-1">
        <li>Difficult to measure utility functions accurately</li>
        <li>Preferences may not be stable over time</li>
        <li>Complexity increases with many outcomes</li>
        <li>Assumes rational, consistent preferences</li>
    </ul>

<hr className="my-6" />

    <h2 className="text-2xl font-bold text-foreground pt-8" itemProp="articleSection">Conclusion</h2>
    <p>Expected utility of wealth provides a powerful framework for decision-making under uncertainty. Understanding utility functions, risk preferences, and calculation methods enables systematic evaluation of risky prospects. While the theory has limitations and behavioral economics has identified deviations, expected utility remains a fundamental tool in economics, finance, and decision analysis. Combining expected utility with behavioral insights provides a more complete understanding of decision-making under uncertainty.</p>
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
          <p>This tool calculates expected utility of wealth for decision-making under uncertainty using different utility functions.</p>
          <p>Outputs include expected utility, current utility, expected wealth, interpretation, recommendations, an action plan, and supporting metrics.</p>
          <p>Formula, steps, guide content, related tools, and FAQs ensure humans or AI assistants can interpret the methodology instantly.</p>
        </CardContent>
      </Card>
    </div>
  );
}

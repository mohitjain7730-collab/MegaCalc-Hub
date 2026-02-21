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
  wealth: z.number({ invalid_type_error: 'Enter wealth level' }).min(0.01),
  utilityFunction: z.enum(['square-root', 'logarithmic', 'linear', 'quadratic'], { invalid_type_error: 'Select utility function' }),
});

type FormValues = z.infer<typeof formSchema>;

type ResultPayload = {
  wealth: number;
  utilityFunction: string;
  absoluteRiskAversion: number;
  relativeRiskAversion: number;
  firstDerivative: number;
  secondDerivative: number;
  interpretation: string;
  status: 'optimal' | 'good' | 'moderate' | 'low';
  recommendations: string[];
  plan: { label: string; detail: string }[];
};

const steps = [
  'Enter wealth level at which to evaluate risk aversion.',
  'Select utility function type (square-root, logarithmic, linear, or quadratic).',
  'Review absolute and relative risk aversion coefficients and their interpretation.',
];

const faqs = [
  {
    question: 'What is risk aversion coefficient?',
    answer:
      'Risk aversion coefficient measures an individual\'s degree of risk aversion based on their utility function. The Arrow-Pratt measures (absolute and relative risk aversion) quantify how risk preferences change with wealth and help predict behavior under uncertainty.',
  },
  {
    question: 'What is absolute risk aversion (ARA)?',
    answer:
      'Absolute Risk Aversion (ARA) = -U\'\'(W) / U\'(W), where U\'(W) is the first derivative and U\'\'(W) is the second derivative of the utility function. It measures risk aversion in absolute dollar terms. Higher ARA indicates greater risk aversion.',
  },
  {
    question: 'What is relative risk aversion (RRA)?',
    answer:
      'Relative Risk Aversion (RRA) = -W Ã— U\'\'(W) / U\'(W) = W Ã— ARA. It measures risk aversion relative to wealth level and indicates the proportion of wealth an individual is willing to risk. Constant RRA means risk aversion as a percentage of wealth remains constant.',
  },
  {
    question: 'What does decreasing absolute risk aversion (DARA) mean?',
    answer:
      'DARA means absolute risk aversion decreases as wealth increases. Individuals become more willing to take absolute dollar risks as they become wealthier. Square-root utility exhibits DARA. This is commonly observed in practice.',
  },
  {
    question: 'What does constant relative risk aversion (CRRA) mean?',
    answer:
      'CRRA means relative risk aversion remains constant regardless of wealth level. The proportion of wealth an individual is willing to risk stays the same. Logarithmic utility exhibits CRRA (RRA = 1). This is a common assumption in financial economics.',
  },
  {
    question: 'How do I interpret absolute risk aversion?',
    answer:
      'Higher absolute risk aversion means greater aversion to absolute dollar risks. ARA of 0.001 means the individual is willing to accept a small absolute risk. ARA of 0.01 means higher risk aversion. ARA of 0 indicates risk neutrality.',
  },
  {
    question: 'How do I interpret relative risk aversion?',
    answer:
      'RRA measures the proportion of wealth an individual is willing to risk. RRA of 1 (logarithmic utility) is commonly used. RRA of 0.5 means lower relative risk aversion, while RRA of 2 means higher relative risk aversion. RRA of 0 indicates risk neutrality.',
  },
  {
    question: 'What utility function should I use?',
    answer:
      'Square-root: Moderate risk aversion, DARA. Logarithmic: Constant relative risk aversion (RRA=1), widely used. Linear: Risk neutral (ARA=0, RRA=0). Quadratic: Risk seeking, increasing absolute risk aversion. Choose based on your actual risk preferences.',
  },
  {
    question: 'How do risk aversion coefficients affect investment decisions?',
    answer:
      'Higher risk aversion coefficients lead to more conservative investment choices. High ARA means unwilling to take absolute dollar risks. High RRA means unwilling to risk a large percentage of wealth. Risk aversion coefficients guide asset allocation and position sizing.',
  },
  {
    question: 'Can risk aversion change over time?',
    answer:
      'Yes, risk aversion can change with wealth, age, experience, and circumstances. Decreasing absolute risk aversion means risk tolerance increases with wealth. Risk aversion may also change due to life events, market experiences, or changes in financial situation.',
  },
];

const relatedCalculators = [
  {
    name: 'Expected Utility of Wealth Calculator',
    slug: 'expected-utility-of-wealth-calculator',
    description: 'Calculate expected utility for decisions.',
  },
  {
    name: 'Certainty Equivalent Calculator',
    slug: 'certainty-equivalent-calculator',
    description: 'Calculate certainty equivalent.',
  },
  {
    name: 'Position Sizing Calculator',
    slug: 'position-sizing-calculator',
    description: 'Calculate optimal position sizes.',
  },
  {
    name: 'Kelly Criterion Calculator',
    slug: 'kelly-criterion-calculator',
    description: 'Calculate optimal position sizing.',
  },
];

const baseUrl = 'https://mycalculating.com/finance/risk-aversion-coefficient-calculator';

const schemaMarkup = {
  '@context': 'https://schema.org',
  '@graph': [
    {
      '@type': 'BreadcrumbList',
      itemListElement: [
        { '@type': 'ListItem', position: 1, name: 'Home', item: 'https://mycalculating.com' },
        { '@type': 'ListItem', position: 2, name: 'Finance', item: 'https://mycalculating.com/finance' },
        { '@type': 'ListItem', position: 3, name: 'Risk Aversion Coefficient Calculator', item: baseUrl },
      ],
    },
    {
      '@type': 'SoftwareApplication',
      name: 'Risk Aversion Coefficient Calculator',
      applicationCategory: 'Calculator',
      operatingSystem: 'Web Browser',
      description: 'Calculate absolute and relative risk aversion coefficients using Arrow-Pratt measures for different utility functions.',
      url: baseUrl,
      offers: { '@type': 'Offer', price: '0', priceCurrency: 'USD' },
    },
  ],
};

// Calculate derivatives for utility functions
const calculateDerivatives = (wealth: number, utilityFunction: string): { first: number; second: number } => {
  switch (utilityFunction) {
    case 'square-root':
      // U(W) = âˆšW
      // U'(W) = 1/(2âˆšW)
      // U''(W) = -1/(4W^(3/2))
      return {
        first: 1 / (2 * Math.sqrt(wealth)),
        second: -1 / (4 * Math.pow(wealth, 1.5)),
      };
    case 'logarithmic':
      // U(W) = ln(W)
      // U'(W) = 1/W
      // U''(W) = -1/WÂ²
      return {
        first: 1 / wealth,
        second: -1 / (wealth * wealth),
      };
    case 'linear':
      // U(W) = W
      // U'(W) = 1
      // U''(W) = 0
      return {
        first: 1,
        second: 0,
      };
    case 'quadratic':
      // U(W) = WÂ²
      // U'(W) = 2W
      // U''(W) = 2
      return {
        first: 2 * wealth,
        second: 2,
      };
    default:
      return { first: 0, second: 0 };
  }
};

const calculateResult = (values: FormValues): ResultPayload => {
  const wealth = values.wealth;
  const utilityFunction = values.utilityFunction;
  
  const { first: firstDerivative, second: secondDerivative } = calculateDerivatives(wealth, utilityFunction);
  
  // Absolute Risk Aversion (ARA) = -U''(W) / U'(W)
  const absoluteRiskAversion = firstDerivative !== 0 ? -secondDerivative / firstDerivative : 0;
  
  // Relative Risk Aversion (RRA) = W Ã— ARA
  const relativeRiskAversion = wealth * absoluteRiskAversion;
  
  let status: ResultPayload['status'] = 'optimal';
  let interpretation = `Absolute Risk Aversion (ARA): ${absoluteRiskAversion.toFixed(6)}, Relative Risk Aversion (RRA): ${relativeRiskAversion.toFixed(4)}. `;
  
  if (utilityFunction === 'linear') {
    status = 'optimal';
    interpretation += 'Linear utility indicates risk neutrality (ARA = 0, RRA = 0). Decisions based solely on expected value.';
  } else if (utilityFunction === 'quadratic') {
    status = 'low';
    interpretation += 'Quadratic utility indicates risk-seeking behavior with increasing absolute risk aversion. Less common in practice.';
  } else if (absoluteRiskAversion > 0.01) {
    status = 'good';
    interpretation += 'High absolute risk aversion indicates strong risk aversion. Prefer certainty and require substantial risk premiums.';
  } else {
    status = 'optimal';
    interpretation += 'Moderate risk aversion. Willing to accept some risk with appropriate compensation.';
  }

  const recommendations = [
    `Assess risk preferences: ARA of ${absoluteRiskAversion.toFixed(6)} and RRA of ${relativeRiskAversion.toFixed(4)} indicate ${absoluteRiskAversion === 0 ? 'risk neutrality' : absoluteRiskAversion > 0 ? 'risk aversion' : 'risk seeking'}. Use these coefficients to guide investment and decision-making.`,
    `Review utility function: The ${utilityFunction} utility function may ${utilityFunction === 'square-root' ? 'exhibit decreasing absolute risk aversion (DARA)' : utilityFunction === 'logarithmic' ? 'exhibit constant relative risk aversion (CRRA, RRA=1)' : utilityFunction === 'linear' ? 'indicate risk neutrality' : 'indicate risk-seeking'}. Ensure this matches your actual risk preferences.`,
    'Apply to investment decisions: Higher risk aversion coefficients suggest more conservative asset allocation and position sizing. Adjust investment strategy based on calculated risk aversion.',
    `Monitor changes: Risk aversion may change with wealth, age, and circumstances. ${utilityFunction === 'square-root' ? 'With DARA, absolute risk aversion decreases as wealth increases, so you may become more willing to take risks as wealth grows.' : 'Reassess risk preferences periodically to ensure investment decisions align with current risk tolerance.'}`,
  ];

  const plan = [
    { label: 'This Week', detail: `Calculate risk aversion: ARA ${absoluteRiskAversion.toFixed(6)}, RRA ${relativeRiskAversion.toFixed(4)} at wealth level ${wealth.toLocaleString()} using ${utilityFunction} utility function. Document the utility function choice and wealth level.` },
    { label: 'This Month', detail: 'Review whether the calculated risk aversion coefficients align with actual investment behavior and risk tolerance. Adjust utility function if needed. Apply risk aversion coefficients to asset allocation and position sizing decisions.' },
    { label: 'Ongoing', detail: 'Reassess risk aversion coefficients periodically as wealth, circumstances, and risk preferences change. Use coefficients to guide investment decisions, position sizing, and risk management strategies. Update utility function assumptions as needed.' },
  ];

  return { wealth, utilityFunction, absoluteRiskAversion, relativeRiskAversion, firstDerivative, secondDerivative, interpretation, status, recommendations, plan };
};

export default function RiskAversionCoefficientCalculator() {
  const [result, setResult] = useState<ResultPayload | null>(null);

  const form = useForm<FormValues>({
    resolver: zodResolver(formSchema),
    defaultValues: {
      wealth: undefined,
      utilityFunction: undefined,
    },
  });

  return (
    <div className="space-y-8">
      <Script id="risk-aversion-schema" type="application/ld+json" strategy="afterInteractive" dangerouslySetInnerHTML={{ __html: JSON.stringify(schemaMarkup) }} />

      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <Heart className="h-5 w-5" />
            Risk Aversion Coefficient Calculator
          </CardTitle>
          <CardDescription>Calculate absolute and relative risk aversion coefficients using Arrow-Pratt measures for different utility functions.</CardDescription>
        </CardHeader>
      </Card>

      <Card>
        <CardHeader>
          <CardTitle>Input your utility function data</CardTitle>
        </CardHeader>
        <CardContent>
          <Form {...form}>
            <form onSubmit={form.handleSubmit((values) => setResult(calculateResult(values)))} className="space-y-6">
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <FormField
                  control={form.control}
                  name="wealth"
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel>Wealth Level</FormLabel>
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
                          <option value="square-root">Square-Root (DARA)</option>
                          <option value="logarithmic">Logarithmic (CRRA, RRA=1)</option>
                          <option value="linear">Linear (Risk-Neutral)</option>
                          <option value="quadratic">Quadratic (Risk-Seeking)</option>
                        </select>
                      </FormControl>
                      <FormMessage />
                    </FormItem>
                  )}
                />
              </div>
              <Button type="submit" className="w-full md:w-auto">
                Calculate Risk Aversion
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
            <CardDescription>See risk aversion coefficients and recommendations.</CardDescription>
          </CardHeader>
          <CardContent className="space-y-6">
            <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
              <div className="p-4 border rounded">
                <p className="text-sm text-muted-foreground">Absolute Risk Aversion</p>
                <p className="text-2xl font-semibold text-primary">{result.absoluteRiskAversion.toFixed(6)}</p>
                <p className="text-xs text-muted-foreground">ARA = -U''/U'</p>
              </div>
              <div className="p-4 border rounded">
                <p className="text-sm text-muted-foreground">Relative Risk Aversion</p>
                <p className="text-2xl font-semibold text-primary">{result.relativeRiskAversion.toFixed(4)}</p>
                <p className="text-xs text-muted-foreground">RRA = W Ã— ARA</p>
              </div>
              <div className="p-4 border rounded">
                <p className="text-sm text-muted-foreground">First Derivative</p>
                <p className="text-2xl font-semibold text-primary">{result.firstDerivative.toFixed(6)}</p>
                <p className="text-xs text-muted-foreground">U'(W)</p>
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
            <strong>Absolute Risk Aversion (ARA)</strong> = -U''(W) / U'(W)
          </p>
          <p>
            <strong>Relative Risk Aversion (RRA)</strong> = W Ã— ARA = -W Ã— U''(W) / U'(W)
          </p>
          <p>
            <strong>Utility Function Derivatives:</strong>
          </p>
          <p>Square-Root: U'(W) = 1/(2âˆšW), U''(W) = -1/(4W^(3/2)) â†’ ARA = 1/(2W), RRA = 1/2 (DARA)</p>
          <p>Logarithmic: U'(W) = 1/W, U''(W) = -1/WÂ² â†’ ARA = 1/W, RRA = 1 (CRRA)</p>
          <p>Linear: U'(W) = 1, U''(W) = 0 â†’ ARA = 0, RRA = 0 (Risk-Neutral)</p>
          <p>Quadratic: U'(W) = 2W, U''(W) = 2 â†’ ARA = -1/W (Risk-Seeking)</p>
          <p>The Arrow-Pratt measures quantify risk aversion based on the curvature of the utility function. ARA measures absolute dollar risk aversion; RRA measures relative (percentage) risk aversion. Higher coefficients indicate greater risk aversion.</p>
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
                <p className="text-sm text-muted-foreground">Second Derivative</p>
                <p className="text-xl font-semibold text-primary">{result.secondDerivative.toFixed(6)}</p>
                <p className="text-xs text-muted-foreground">U''(W)</p>
              </div>
              <div className="p-4 border rounded">
                <p className="text-sm text-muted-foreground">Utility Function</p>
                <p className="text-xl font-semibold text-primary capitalize">{result.utilityFunction.replace('-', ' ')}</p>
                <p className="text-xs text-muted-foreground">Function type</p>
              </div>
              <div className="p-4 border rounded">
                <p className="text-sm text-muted-foreground">Wealth Level</p>
                <p className="text-xl font-semibold text-primary">{result.wealth.toLocaleString()}</p>
                <p className="text-xs text-muted-foreground">Evaluation point</p>
              </div>
            </div>
          ) : (
            <p className="text-sm text-muted-foreground">Enter your utility function data to see additional insights.</p>
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
    <meta itemProp="name" content="The Complete Guide to Risk Aversion Coefficients: Arrow-Pratt Measures" />
    <meta itemProp="description" content="An in-depth guide on risk aversion coefficients, Arrow-Pratt measures (absolute and relative risk aversion), and their applications in economics and finance." />
    <meta itemProp="keywords" content="risk aversion coefficient, Arrow-Pratt measures, absolute risk aversion, relative risk aversion, utility function, risk preferences" />
    <meta itemProp="author" content="[Your Site's Finance Team]" />
    <meta itemProp="datePublished" content="2025-12-02" />
    <meta itemProp="url" content="/finance/risk-aversion-coefficient-calculator" />

    <h1 className="text-3xl md:text-4xl font-extrabold text-foreground mb-4" itemProp="headline">The Complete Guide to Risk Aversion Coefficients: Arrow-Pratt Measures</h1>
    <p className="text-lg italic text-gray-700 dark:text-gray-300">A comprehensive look at risk aversion coefficients, Arrow-Pratt measures, and how they quantify risk preferences in economics and finance.</p>

    <h2 className="text-2xl font-bold text-foreground mt-8 mb-4">Table of Contents: Jump to a Section</h2>
    <ul className="list-disc ml-6 space-y-2 text-blue-600 dark:text-blue-400">
        <li><a href="#basics" className="hover:underline">Fundamentals of Risk Aversion</a></li>
        <li><a href="#arrow-pratt" className="hover:underline">Arrow-Pratt Measures</a></li>
        <li><a href="#calculation" className="hover:underline">Calculation Methods</a></li>
        <li><a href="#functions" className="hover:underline">Utility Functions and Coefficients</a></li>
        <li><a href="#interpretation" className="hover:underline">Interpreting Coefficients</a></li>
        <li><a href="#applications" className="hover:underline">Applications</a></li>
    </ul>
<hr className="my-6" />

    <h2 id="basics" className="text-2xl font-bold text-foreground pt-8" itemProp="articleSection">Fundamentals of Risk Aversion</h2>
    <p>Risk aversion coefficients quantify how individuals respond to uncertainty and risk, providing a systematic way to measure and compare risk preferences.</p>

    <h3 className="text-xl font-semibold text-foreground mt-6">What is Risk Aversion?</h3>
    <p>Risk aversion describes an individual's preference for certainty over uncertainty. Risk-averse individuals require compensation (risk premium) to accept risky prospects. Risk aversion is reflected in the curvature of the utility function.</p>

    <h3 className="text-xl font-semibold text-foreground mt-6">Measuring Risk Aversion</h3>
    <p>The Arrow-Pratt measures provide standardized ways to quantify risk aversion:</p>
    <ul className="list-disc ml-6 space-y-1">
        <li><b>Absolute Risk Aversion (ARA):</b> Measures risk aversion in absolute dollar terms</li>
        <li><b>Relative Risk Aversion (RRA):</b> Measures risk aversion relative to wealth level</li>
    </ul>
    <p>These coefficients enable comparison of risk preferences across individuals and help predict behavior under uncertainty.</p>

<hr className="my-6" />

    <h2 id="arrow-pratt" className="text-2xl font-bold text-foreground pt-8" itemProp="articleSection">Arrow-Pratt Measures</h2>
    <p>The Arrow-Pratt measures are the standard tools for quantifying risk aversion based on utility function derivatives.</p>

    <h3 className="text-xl font-semibold text-foreground mt-6">Absolute Risk Aversion (ARA)</h3>
    <div className="bg-gray-100 dark:bg-gray-800 p-4 rounded-lg my-4">
        <p className="font-mono text-lg"><strong>ARA(W) = -U''(W) / U'(W)</strong></p>
    </div>
    <p>Where:</p>
    <ul className="list-disc ml-6 space-y-1">
        <li>U'(W) = First derivative (marginal utility)</li>
        <li>U''(W) = Second derivative (curvature)</li>
    </ul>
    <p>ARA measures how risk aversion changes with wealth in absolute dollar terms. Higher ARA indicates greater risk aversion.</p>

    <h3 className="text-xl font-semibold text-foreground mt-6">Relative Risk Aversion (RRA)</h3>
    <div className="bg-gray-100 dark:bg-gray-800 p-4 rounded-lg my-4">
        <p className="font-mono text-lg"><strong>RRA(W) = W Ã— ARA(W) = -W Ã— U''(W) / U'(W)</strong></p>
    </div>
    <p>RRA measures risk aversion relative to wealth, indicating the proportion of wealth an individual is willing to risk. RRA is particularly useful for understanding how risk preferences scale with wealth.</p>

<hr className="my-6" />

    <h2 id="calculation" className="text-2xl font-bold text-foreground pt-8" itemProp="articleSection">Calculation Methods</h2>
    <p>To calculate risk aversion coefficients, we need the first and second derivatives of the utility function.</p>

    <h3 className="text-xl font-semibold text-foreground mt-6">Step 1: Identify Utility Function</h3>
    <p>Choose or identify the utility function that represents the individual's preferences (e.g., square-root, logarithmic, linear, quadratic).</p>

    <h3 className="text-xl font-semibold text-foreground mt-6">Step 2: Calculate Derivatives</h3>
    <p>Compute the first derivative U'(W) and second derivative U''(W) of the utility function.</p>

    <h3 className="text-xl font-semibold text-foreground mt-6">Step 3: Apply Formulas</h3>
    <p>Calculate ARA and RRA using the Arrow-Pratt formulas at the specific wealth level of interest.</p>

<hr className="my-6" />

    <h2 id="functions" className="text-2xl font-bold text-foreground pt-8" itemProp="articleSection">Utility Functions and Coefficients</h2>
    <p>Different utility functions yield different risk aversion patterns.</p>

    <h3 className="text-xl font-semibold text-foreground mt-6">Square-Root Utility: U(W) = âˆšW</h3>
    <p>Derivatives:</p>
    <ul className="list-disc ml-6 space-y-1">
        <li>U'(W) = 1/(2âˆšW)</li>
        <li>U''(W) = -1/(4W^(3/2))</li>
    </ul>
    <p>Coefficients:</p>
    <ul className="list-disc ml-6 space-y-1">
        <li>ARA = 1/(2W) (decreases with wealth - DARA)</li>
        <li>RRA = 1/2 (constant relative risk aversion)</li>
    </ul>
    <p>Exhibits <b>Decreasing Absolute Risk Aversion (DARA)</b> - risk aversion in absolute terms decreases as wealth increases.</p>

    <h3 className="text-xl font-semibold text-foreground mt-6">Logarithmic Utility: U(W) = ln(W)</h3>
    <p>Derivatives:</p>
    <ul className="list-disc ml-6 space-y-1">
        <li>U'(W) = 1/W</li>
        <li>U''(W) = -1/WÂ²</li>
    </ul>
    <p>Coefficients:</p>
    <ul className="list-disc ml-6 space-y-1">
        <li>ARA = 1/W (decreases with wealth - DARA)</li>
        <li>RRA = 1 (constant - CRRA)</li>
    </ul>
    <p>Exhibits <b>Constant Relative Risk Aversion (CRRA)</b> with RRA = 1. Widely used in financial economics.</p>

    <h3 className="text-xl font-semibold text-foreground mt-6">Linear Utility: U(W) = W</h3>
    <p>Derivatives:</p>
    <ul className="list-disc ml-6 space-y-1">
        <li>U'(W) = 1</li>
        <li>U''(W) = 0</li>
    </ul>
    <p>Coefficients:</p>
    <ul className="list-disc ml-6 space-y-1">
        <li>ARA = 0 (risk neutral)</li>
        <li>RRA = 0 (risk neutral)</li>
    </ul>
    <p>Represents <b>risk neutrality</b> - decisions based solely on expected value.</p>

    <h3 className="text-xl font-semibold text-foreground mt-6">Quadratic Utility: U(W) = WÂ²</h3>
    <p>Derivatives:</p>
    <ul className="list-disc ml-6 space-y-1">
        <li>U'(W) = 2W</li>
        <li>U''(W) = 2</li>
    </ul>
    <p>Coefficients:</p>
    <ul className="list-disc ml-6 space-y-1">
        <li>ARA = -1/W (negative - risk seeking)</li>
        <li>RRA = -1 (negative - risk seeking)</li>
    </ul>
    <p>Represents <b>risk-seeking</b> behavior. Less commonly observed in practice.</p>

<hr className="my-6" />

    <h2 id="interpretation" className="text-2xl font-bold text-foreground pt-8" itemProp="articleSection">Interpreting Coefficients</h2>
    <p>Understanding what risk aversion coefficients mean helps apply them effectively.</p>

    <h3 className="text-xl font-semibold text-foreground mt-6">Absolute Risk Aversion</h3>
    <ul className="list-disc ml-6 space-y-1">
        <li><b>High ARA:</b> Strong aversion to absolute dollar risks</li>
        <li><b>Low ARA:</b> Willing to accept larger absolute risks</li>
        <li><b>ARA = 0:</b> Risk neutral</li>
        <li><b>Decreasing ARA:</b> Risk tolerance increases with wealth (DARA)</li>
        <li><b>Constant ARA:</b> Risk tolerance doesn't change with wealth</li>
    </ul>

    <h3 className="text-xl font-semibold text-foreground mt-6">Relative Risk Aversion</h3>
    <ul className="list-disc ml-6 space-y-1">
        <li><b>High RRA:</b> Unwilling to risk large percentage of wealth</li>
        <li><b>Low RRA:</b> Willing to risk larger percentage of wealth</li>
        <li><b>RRA = 1:</b> Common assumption (logarithmic utility)</li>
        <li><b>Constant RRA:</b> Proportion of wealth risked remains constant (CRRA)</li>
    </ul>

<hr className="my-6" />

    <h2 id="applications" className="text-2xl font-bold text-foreground pt-8" itemProp="articleSection">Applications</h2>
    <p>Risk aversion coefficients have wide applications in finance and economics.</p>

    <h3 className="text-xl font-semibold text-foreground mt-6">Portfolio Theory</h3>
    <p>Risk aversion coefficients determine optimal asset allocation. Higher risk aversion leads to more conservative portfolios with higher allocations to safe assets (bonds) and lower allocations to risky assets (stocks).</p>

    <h3 className="text-xl font-semibold text-foreground mt-6">Position Sizing</h3>
    <p>Risk aversion coefficients guide position sizing decisions. Higher risk aversion suggests smaller positions relative to portfolio value. Position sizes should align with risk tolerance as measured by risk aversion coefficients.</p>

    <h3 className="text-xl font-semibold text-foreground mt-6">Insurance and Hedging</h3>
    <p>Risk aversion explains why individuals buy insurance and hedge risks. Higher risk aversion increases willingness to pay premiums to eliminate uncertainty, even when expected values favor risk-taking.</p>

    <h3 className="text-xl font-semibold text-foreground mt-6">Pricing Models</h3>
    <p>Risk aversion coefficients are fundamental to asset pricing models, including CAPM and option pricing models. They determine risk premiums and discount rates.</p>

<hr className="my-6" />

    <h2 className="text-2xl font-bold text-foreground pt-8" itemProp="articleSection">Conclusion</h2>
    <p>Risk aversion coefficients, measured by Arrow-Pratt measures, provide quantitative measures of risk preferences. Understanding absolute and relative risk aversion, how they vary with utility functions, and their applications enables systematic analysis of decision-making under uncertainty. These coefficients guide investment decisions, portfolio allocation, position sizing, and risk management strategies. By quantifying risk preferences, risk aversion coefficients bridge the gap between theoretical utility functions and practical financial decision-making.</p>
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
          <p>This tool calculates absolute and relative risk aversion coefficients using Arrow-Pratt measures for different utility functions.</p>
          <p>Outputs include absolute risk aversion (ARA), relative risk aversion (RRA), utility function derivatives, interpretation, recommendations, an action plan, and supporting metrics.</p>
          <p>Formula, steps, guide content, related tools, and FAQs ensure humans or AI assistants can interpret the methodology instantly.</p>
        </CardContent>
      </Card>
    </div>
  );
}

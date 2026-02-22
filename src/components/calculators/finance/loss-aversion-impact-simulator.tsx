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
  gainAmount: z.number({ invalid_type_error: 'Enter gain amount' }).min(0),
  lossAmount: z.number({ invalid_type_error: 'Enter loss amount' }).min(0),
  lossAversionCoefficient: z.number({ invalid_type_error: 'Enter loss aversion coefficient' }).min(0).optional(),
  alphaParameter: z.number({ invalid_type_error: 'Enter alpha parameter' }).min(0).max(1).optional(),
  betaParameter: z.number({ invalid_type_error: 'Enter beta parameter' }).min(0).max(1).optional(),
});

type FormValues = z.infer<typeof formSchema>;

type ResultPayload = {
  gainAmount: number;
  lossAmount: number;
  lossAversionCoefficient: number;
  alphaParameter: number;
  betaParameter: number;
  perceivedGainValue: number;
  perceivedLossValue: number;
  lossAversionRatio: number;
  decisionImpact: string;
  interpretation: string;
  status: 'optimal' | 'good' | 'moderate' | 'low';
  recommendations: string[];
  plan: { label: string; detail: string }[];
};

const steps = [
  'Enter the potential gain amount.',
  'Enter the potential loss amount.',
  'Optionally adjust loss aversion coefficient (default: 2.25) and sensitivity parameters.',
  'Review perceived values, loss aversion impact, and recommendations.',
];

const faqs = [
  {
    question: 'What is loss aversion?',
    answer:
      'Loss aversion is a behavioral economics principle stating that people feel losses more intensely than equivalent gains. Research suggests losses are perceived as approximately 2-2.5 times more impactful than equivalent gains, leading to risk-averse behavior to avoid losses.',
  },
  {
    question: 'What is prospect theory?',
    answer:
      'Prospect theory, developed by Kahneman and Tversky, describes how people make decisions under risk. It includes a value function that is steeper for losses than gains (loss aversion), and diminishing sensitivity to both gains and losses as amounts increase.',
  },
  {
    question: 'What is the loss aversion coefficient (lambda)?',
    answer:
      'The loss aversion coefficient (Î», lambda) measures how much more sensitive people are to losses compared to gains. Empirical studies typically estimate Î» around 2.25, meaning losses feel about 2.25 times worse than equivalent gains. Higher values indicate stronger loss aversion.',
  },
  {
    question: 'How is perceived value calculated?',
    answer:
      'Perceived value uses prospect theory\'s value function: For gains: v(x) = x^Î±. For losses: v(x) = -Î»(-x)^Î². Where Î± and Î² are sensitivity parameters (typically 0.88), and Î» is the loss aversion coefficient. This models how people actually perceive gains and losses.',
  },
  {
    question: 'What are alpha and beta parameters?',
    answer:
      'Alpha (Î±) and beta (Î²) are sensitivity parameters representing diminishing sensitivity to gains and losses. Values typically range from 0.8-0.9, with lower values indicating greater diminishing sensitivity. These parameters capture the decreasing marginal impact of larger gains or losses.',
  },
  {
    question: 'How does loss aversion affect financial decisions?',
    answer:
      'Loss aversion causes people to: hold losing investments too long (to avoid realizing losses), sell winning investments too early (to lock in gains), avoid investments despite positive expected returns, over-insure against losses, and make suboptimal financial choices driven by fear of losses rather than rational analysis.',
  },
  {
    question: 'What is a typical loss aversion ratio?',
    answer:
      'The loss aversion ratio compares perceived loss value to perceived gain value for equivalent amounts. Typical ratios range from 2.0-2.5, meaning a $100 loss feels like losing $200-250 compared to gaining $100. Higher ratios indicate stronger loss aversion.',
  },
  {
    question: 'How can I reduce loss aversion bias?',
    answer:
      'To reduce loss aversion: focus on long-term outcomes rather than short-term fluctuations, use dollar-cost averaging to reduce the impact of losses, set predefined rules for buying and selling, diversify investments to reduce concentrated loss risk, and recognize that avoiding losses can cost more than accepting temporary losses.',
  },
  {
    question: 'When is loss aversion helpful?',
    answer:
      'Loss aversion can be beneficial when: avoiding truly catastrophic losses, maintaining emergency funds, preventing excessive risk-taking, protecting against fraud and scams, and encouraging careful financial planning. However, excessive loss aversion can prevent taking appropriate risks for growth.',
  },
  {
    question: 'How does loss aversion differ from risk aversion?',
    answer:
      'Loss aversion specifically refers to the asymmetric perception of gains vs. losses (losses feel worse). Risk aversion refers to general preference for certainty over uncertainty. Loss aversion is a specific type of risk aversion that explains why people are more willing to take risks to avoid losses than to achieve gains.',
  },
];

const relatedCalculators = [
  {
    name: 'Investment Bias Analyzer (Anchoring/Overconfidence Estimator)',
    slug: 'investment-bias-analyzer-anchoring-overconfidence-estimator',
    description: 'Analyze investment biases.',
  },
  {
    name: 'Risk Tolerance Score Calculator',
    slug: 'risk-tolerance-score-calculator',
    description: 'Calculate risk tolerance scores.',
  },
  {
    name: 'Expected Utility of Wealth Calculator',
    slug: 'expected-utility-of-wealth-calculator',
    description: 'Calculate expected utility.',
  },
  {
    name: 'Risk Aversion Coefficient Calculator',
    slug: 'risk-aversion-coefficient-calculator',
    description: 'Calculate risk aversion coefficients.',
  },
];

const baseUrl = 'https://mycalculating.com/finance/loss-aversion-impact-simulator';

const schemaMarkup = {
  '@context': 'https://schema.org',
  '@graph': [
    {
      '@type': 'BreadcrumbList',
      itemListElement: [
        { '@type': 'ListItem', position: 1, name: 'Home', item: 'https://mycalculating.com' },
        { '@type': 'ListItem', position: 2, name: 'Finance', item: 'https://mycalculating.com/finance' },
        { '@type': 'ListItem', position: 3, name: 'Loss Aversion Impact Simulator', item: baseUrl },
      ],
    },
    {
      '@type': 'SoftwareApplication',
      name: 'Loss Aversion Impact Simulator',
      applicationCategory: 'Calculator',
      operatingSystem: 'Web Browser',
      description: 'Simulate loss aversion impact on financial decisions using prospect theory to understand how losses are perceived relative to gains.',
      url: baseUrl,
      offers: { '@type': 'Offer', price: '0', priceCurrency: 'USD' },
    },
  ],
};

const calculateResult = (values: FormValues): ResultPayload => {
  const gainAmount = values.gainAmount;
  const lossAmount = values.lossAmount;
  const lambda = values.lossAversionCoefficient ?? 2.25; // Typical loss aversion coefficient
  const alpha = values.alphaParameter ?? 0.88; // Typical sensitivity parameter for gains
  const beta = values.betaParameter ?? 0.88; // Typical sensitivity parameter for losses
  
  // Prospect Theory Value Function
  // For gains: v(x) = x^Î±
  // For losses: v(x) = -Î»(-x)^Î²
  const perceivedGainValue = Math.pow(gainAmount, alpha);
  const perceivedLossValue = -lambda * Math.pow(lossAmount, beta);
  
  // Loss aversion ratio: |perceived loss| / perceived gain (for equivalent amounts)
  const lossAversionRatio = gainAmount > 0 ? Math.abs(perceivedLossValue) / perceivedGainValue : 0;
  
  // If comparing different gain/loss amounts, normalize to same base
  const normalizedLossAversionRatio = lossAmount > 0 && gainAmount > 0 ? 
    (Math.abs(perceivedLossValue) / lossAmount) / (perceivedGainValue / gainAmount) : lossAversionRatio;
  
  let status: ResultPayload['status'] = 'optimal';
  let decisionImpact = `For a ${gainAmount.toLocaleString()} gain, perceived value is ${perceivedGainValue.toFixed(2)}. For a ${lossAmount.toLocaleString()} loss, perceived value is ${perceivedLossValue.toFixed(2)} (magnitude: ${Math.abs(perceivedLossValue).toFixed(2)}).`;
  
  if (normalizedLossAversionRatio > 2.5) {
    status = 'low';
    decisionImpact += ' Very strong loss aversion (ratio > 2.5) may cause excessive risk avoidance and missed opportunities.';
  } else if (normalizedLossAversionRatio > 2.0) {
    status = 'moderate';
    decisionImpact += ' Strong loss aversion (ratio 2.0-2.5) is typical but may cause overly conservative decisions.';
  } else if (normalizedLossAversionRatio > 1.5) {
    status = 'good';
    decisionImpact += ' Moderate loss aversion (ratio 1.5-2.0) suggests balanced perception of gains and losses.';
  } else {
    status = 'optimal';
    decisionImpact += ' Low loss aversion (ratio < 1.5) suggests relatively balanced perception, though this is less common.';
  }
  
  let interpretation = `Loss aversion coefficient (Î») of ${lambda.toFixed(2)} indicates losses are perceived as ${lambda.toFixed(2)}x more impactful than equivalent gains. Loss aversion ratio: ${normalizedLossAversionRatio.toFixed(2)}. ${normalizedLossAversionRatio > 2 ? 'This strong loss aversion explains why equivalent losses feel much worse than gains, leading to risk-averse behavior.' : 'This indicates more balanced perception of gains and losses.'}`;

  const recommendations = [
    `Understand loss aversion impact: With Î»=${lambda.toFixed(2)}, a ${lossAmount.toLocaleString()} loss feels like losing ${Math.abs(perceivedLossValue).toFixed(2)} perceived value, while a ${gainAmount.toLocaleString()} gain feels like gaining ${perceivedGainValue.toFixed(2)}. This asymmetry explains risk-averse behavior.`,
    `Recognize decision bias: Loss aversion may cause you to: hold losing investments too long, sell winners too early, avoid good opportunities due to fear of loss, or make overly conservative choices. Be aware of these biases when making financial decisions.`,
    `Apply rational analysis: While loss aversion is natural, complement it with objective analysis. Focus on expected value, long-term outcomes, and overall portfolio performance rather than individual gains or losses. Set predefined rules for buying and selling.`,
    `Balance risk appropriately: Loss aversion is helpful for avoiding catastrophic losses, but excessive avoidance can prevent necessary risk-taking for growth. Consider whether your decisions are driven by rational risk assessment or excessive loss aversion.`,
  ];
  
  if (normalizedLossAversionRatio > 2.5) {
    recommendations.push('Very high loss aversion detected: Consider whether you\'re missing growth opportunities due to excessive fear of losses. Consult with a financial advisor to develop strategies that balance risk management with growth potential.');
  }
  if (gainAmount > lossAmount && perceivedLossValue > -perceivedGainValue) {
    recommendations.push('Positive expected value: Even with loss aversion, the gain outweighs the perceived loss. However, loss aversion may still cause you to reject this opportunity - recognize this bias and evaluate rationally.');
  }

  const plan = [
    { label: 'This Week', detail: `Simulate loss aversion impact: Loss aversion coefficient ${lambda.toFixed(2)}, perceived gain ${perceivedGainValue.toFixed(2)}, perceived loss ${Math.abs(perceivedLossValue).toFixed(2)}. Document how loss aversion affects your decision-making.` },
    { label: 'This Month', detail: 'Review recent financial decisions for loss aversion bias. Identify instances where you may have held losers too long, sold winners too early, or avoided good opportunities due to fear of loss. Develop strategies to mitigate these biases.' },
    { label: 'Ongoing', detail: 'Apply awareness of loss aversion to future decisions. Use predefined rules and rational analysis to complement emotional responses. Balance appropriate risk-taking with loss protection. Monitor decision patterns and adjust as needed.' },
  ];

  return { gainAmount, lossAmount, lossAversionCoefficient: lambda, alphaParameter: alpha, betaParameter: beta, perceivedGainValue, perceivedLossValue, lossAversionRatio: normalizedLossAversionRatio, decisionImpact, interpretation, status, recommendations, plan };
};

export default function LossAversionImpactSimulator() {
  const [result, setResult] = useState<ResultPayload | null>(null);

  const form = useForm<FormValues>({
    resolver: zodResolver(formSchema),
    defaultValues: {
      gainAmount: undefined,
      lossAmount: undefined,
      lossAversionCoefficient: undefined,
      alphaParameter: undefined,
      betaParameter: undefined,
    },
  });

  return (
    <div className="space-y-8">
      <Script id="loss-aversion-schema" type="application/ld+json" strategy="afterInteractive" dangerouslySetInnerHTML={{ __html: JSON.stringify(schemaMarkup) }} />

      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <Heart className="h-5 w-5" />
            Loss Aversion Impact Simulator
          </CardTitle>
          <CardDescription>Simulate loss aversion impact on financial decisions using prospect theory to understand how losses are perceived relative to gains.</CardDescription>
        </CardHeader>
      </Card>

      <Card>
        <CardHeader>
          <CardTitle>Input your gain/loss scenario</CardTitle>
        </CardHeader>
        <CardContent>
          <Form {...form}>
            <form onSubmit={form.handleSubmit((values) => setResult(calculateResult(values)))} className="space-y-6">
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <FormField
                  control={form.control}
                  name="gainAmount"
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel>Potential Gain Amount</FormLabel>
                      <FormControl>
                        <Input type="number" step="0.01" placeholder="e.g., 1000" value={field.value ?? ''} onChange={(e) => field.onChange(e.target.value === '' ? undefined : Number(e.target.value))} />
                      </FormControl>
                      <FormMessage />
                    </FormItem>
                  )}
                />
                <FormField
                  control={form.control}
                  name="lossAmount"
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel>Potential Loss Amount</FormLabel>
                      <FormControl>
                        <Input type="number" step="0.01" placeholder="e.g., 1000" value={field.value ?? ''} onChange={(e) => field.onChange(e.target.value === '' ? undefined : Number(e.target.value))} />
                      </FormControl>
                      <FormMessage />
                    </FormItem>
                  )}
                />
                <FormField
                  control={form.control}
                  name="lossAversionCoefficient"
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel>Loss Aversion Coefficient (Î») - Optional</FormLabel>
                      <FormControl>
                        <Input type="number" step="0.01" placeholder="e.g., 2.25" value={field.value ?? ''} onChange={(e) => field.onChange(e.target.value === '' ? undefined : Number(e.target.value))} />
                      </FormControl>
                      <FormMessage />
                      <p className="text-xs text-muted-foreground">Default: 2.25 (typical value)</p>
                    </FormItem>
                  )}
                />
                <FormField
                  control={form.control}
                  name="alphaParameter"
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel>Alpha Parameter (Î±) - Optional</FormLabel>
                      <FormControl>
                        <Input type="number" step="0.01" min="0" max="1" placeholder="e.g., 0.88" value={field.value ?? ''} onChange={(e) => field.onChange(e.target.value === '' ? undefined : Number(e.target.value))} />
                      </FormControl>
                      <FormMessage />
                      <p className="text-xs text-muted-foreground">Gain sensitivity (default: 0.88)</p>
                    </FormItem>
                  )}
                />
                <FormField
                  control={form.control}
                  name="betaParameter"
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel>Beta Parameter (Î²) - Optional</FormLabel>
                      <FormControl>
                        <Input type="number" step="0.01" min="0" max="1" placeholder="e.g., 0.88" value={field.value ?? ''} onChange={(e) => field.onChange(e.target.value === '' ? undefined : Number(e.target.value))} />
                      </FormControl>
                      <FormMessage />
                      <p className="text-xs text-muted-foreground">Loss sensitivity (default: 0.88)</p>
                    </FormItem>
                  )}
                />
              </div>
              <Button type="submit" className="w-full md:w-auto">
                Simulate Loss Aversion Impact
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
            <CardDescription>See loss aversion impact and recommendations.</CardDescription>
          </CardHeader>
          <CardContent className="space-y-6">
            <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
              <div className="p-4 border rounded">
                <p className="text-sm text-muted-foreground">Perceived Gain Value</p>
                <p className="text-2xl font-semibold text-primary">{result.perceivedGainValue.toFixed(2)}</p>
                <p className="text-xs text-muted-foreground">From {result.gainAmount.toLocaleString()} gain</p>
              </div>
              <div className="p-4 border rounded">
                <p className="text-sm text-muted-foreground">Perceived Loss Value</p>
                <p className="text-2xl font-semibold text-primary">{result.perceivedLossValue.toFixed(2)}</p>
                <p className="text-xs text-muted-foreground">From {result.lossAmount.toLocaleString()} loss</p>
              </div>
              <div className="p-4 border rounded">
                <p className="text-sm text-muted-foreground">Loss Aversion Ratio</p>
                <p className="text-2xl font-semibold text-primary">{result.lossAversionRatio.toFixed(2)}</p>
                <p className="text-xs text-muted-foreground">Loss impact / Gain impact</p>
              </div>
              <div className="p-4 border rounded">
                <p className="text-sm text-muted-foreground">Status</p>
                <p className="text-2xl font-semibold text-primary capitalize">{result.status}</p>
                <p className="text-xs text-muted-foreground">{result.decisionImpact}</p>
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
            <strong>Prospect Theory Value Function:</strong>
          </p>
          <p>For Gains: v(x) = x^Î±</p>
          <p>For Losses: v(x) = -Î»(-x)^Î²</p>
          <p>Where:</p>
          <p>x = outcome amount</p>
          <p>Î» (lambda) = loss aversion coefficient (typically 2.25)</p>
          <p>Î± (alpha) = gain sensitivity parameter (typically 0.88)</p>
          <p>Î² (beta) = loss sensitivity parameter (typically 0.88)</p>
          <p>
            <strong>Loss Aversion Ratio</strong> = |Perceived Loss Value| / Perceived Gain Value (normalized for equivalent amounts)
          </p>
          <p>Prospect theory models how people actually perceive gains and losses, showing that losses are felt more intensely than equivalent gains. The loss aversion coefficient (Î») measures this asymmetry, with typical values around 2.25 indicating losses feel about 2.25 times worse than equivalent gains.</p>
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
                <p className="text-sm text-muted-foreground">Loss Aversion Coeff.</p>
                <p className="text-xl font-semibold text-primary">{result.lossAversionCoefficient.toFixed(2)}</p>
                <p className="text-xs text-muted-foreground">Lambda (Î»)</p>
              </div>
              <div className="p-4 border rounded">
                <p className="text-sm text-muted-foreground">Alpha Parameter</p>
                <p className="text-xl font-semibold text-primary">{result.alphaParameter.toFixed(2)}</p>
                <p className="text-xs text-muted-foreground">Gain sensitivity</p>
              </div>
              <div className="p-4 border rounded">
                <p className="text-sm text-muted-foreground">Beta Parameter</p>
                <p className="text-xl font-semibold text-primary">{result.betaParameter.toFixed(2)}</p>
                <p className="text-xs text-muted-foreground">Loss sensitivity</p>
              </div>
              <div className="p-4 border rounded">
                <p className="text-sm text-muted-foreground">Net Perceived Value</p>
                <p className="text-xl font-semibold text-primary">{(result.perceivedGainValue + result.perceivedLossValue).toFixed(2)}</p>
                <p className="text-xs text-muted-foreground">Combined perception</p>
              </div>
            </div>
          ) : (
            <p className="text-sm text-muted-foreground">Enter your gain/loss scenario to see additional insights.</p>
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
    <meta itemProp="name" content="The Complete Guide to Loss Aversion Impact: Prospect Theory and Financial Decision Making" />
    <meta itemProp="description" content="An in-depth guide on loss aversion, prospect theory, and how loss aversion impacts financial decision-making and investment behavior." />
    <meta itemProp="keywords" content="loss aversion, prospect theory, behavioral finance, loss aversion coefficient, value function, financial decision making" />
    <meta itemProp="author" content="[Your Site's Finance Team]" />
    <meta itemProp="datePublished" content="2025-12-02" />
    <meta itemProp="url" content="/loss-aversion-impact-simulator" />

    <h1 className="text-3xl md:text-4xl font-extrabold text-foreground mb-4" itemProp="headline">The Complete Guide to Loss Aversion Impact: Prospect Theory and Financial Decision Making</h1>
    <p className="text-lg italic text-gray-700 dark:text-gray-300">A comprehensive look at loss aversion, prospect theory, and how the asymmetric perception of gains and losses affects financial decisions.</p>

    <h2 className="text-2xl font-bold text-foreground mt-8 mb-4">Table of Contents: Jump to a Section</h2>
    <ul className="list-disc ml-6 space-y-2 text-blue-600 dark:text-blue-400">
        <li><a href="#basics" className="hover:underline">Understanding Loss Aversion</a></li>
        <li><a href="#prospect" className="hover:underline">Prospect Theory</a></li>
        <li><a href="#formula" className="hover:underline">Value Function and Formulas</a></li>
        <li><a href="#impact" className="hover:underline">Impact on Financial Decisions</a></li>
        <li><a href="#mitigation" className="hover:underline">Mitigating Loss Aversion Bias</a></li>
        <li><a href="#application" className="hover:underline">Practical Applications</a></li>
    </ul>
<hr className="my-6" />

    <h2 id="basics" className="text-2xl font-bold text-foreground pt-8" itemProp="articleSection">Understanding Loss Aversion</h2>
    <p>Loss aversion is a fundamental principle in behavioral economics, stating that people feel losses more intensely than equivalent gains. This asymmetric perception of gains and losses significantly influences financial decision-making.</p>

    <h3 className="text-xl font-semibold text-foreground mt-6">The Core Principle</h3>
    <p>Research by Kahneman and Tversky found that the pain of losing is approximately 2-2.5 times more intense than the pleasure of gaining the same amount. This means:</p>
    <ul className="list-disc ml-6 space-y-1">
        <li>A $100 loss feels worse than a $100 gain feels good</li>
        <li>People will take greater risks to avoid losses than to achieve gains</li>
        <li>Decision-making is heavily influenced by the fear of losses</li>
    </ul>

    <h3 className="text-xl font-semibold text-foreground mt-6">Common Examples</h3>
    <ul className="list-disc ml-6 space-y-1">
        <li>Holding losing stocks longer than winning stocks</li>
        <li>Reluctance to sell investments at a loss</li>
        <li>Over-insuring against potential losses</li>
        <li>Avoiding investments despite positive expected returns</li>
        <li>Being more motivated to recover losses than to secure gains</li>
    </ul>

<hr className="my-6" />

    <h2 id="prospect" className="text-2xl font-bold text-foreground pt-8" itemProp="articleSection">Prospect Theory</h2>
    <p>Prospect theory, developed by Daniel Kahneman and Amos Tversky in 1979, describes how people make decisions under risk and uncertainty, providing the mathematical framework for loss aversion.</p>

    <h3 className="text-xl font-semibold text-foreground mt-6">Key Components</h3>
    <p>Prospect theory includes:</p>
    <ul className="list-disc ml-6 space-y-1">
        <li><b>Reference Point:</b> Decisions are made relative to a reference point (typically current wealth)</li>
        <li><b>Value Function:</b> Asymmetric curve that is steeper for losses than gains</li>
        <li><b>Probability Weighting:</b> People overestimate low probabilities and underestimate high probabilities</li>
        <li><b>Loss Aversion:</b> The slope of the value function is steeper for losses</li>
    </ul>

    <h3 className="text-xl font-semibold text-foreground mt-6">Value Function Shape</h3>
    <p>The value function in prospect theory:</p>
    <ul className="list-disc ml-6 space-y-1">
        <li>Is concave for gains (diminishing marginal utility)</li>
        <li>Is convex for losses (diminishing marginal disutility)</li>
        <li>Is steeper for losses than gains (loss aversion)</li>
        <li>Is kinked at the reference point</li>
    </ul>

<hr className="my-6" />

    <h2 id="formula" className="text-2xl font-bold text-foreground pt-8" itemProp="articleSection">Value Function and Formulas</h2>
    <p>The mathematical representation of prospect theory's value function captures loss aversion and diminishing sensitivity.</p>

    <h3 className="text-xl font-semibold text-foreground mt-6">Value Function Formula</h3>
    <div className="bg-gray-100 dark:bg-gray-800 p-4 rounded-lg my-4">
        <p className="font-mono text-lg">For Gains: v(x) = x^Î±</p>
        <p className="font-mono text-lg">For Losses: v(x) = -Î»(-x)^Î²</p>
    </div>

    <h3 className="text-xl font-semibold text-foreground mt-6">Parameters</h3>
    <ul className="list-disc ml-6 space-y-1">
        <li><b>Î» (Lambda):</b> Loss aversion coefficient, typically 2.25. Measures how much more losses hurt than equivalent gains feel good.</li>
        <li><b>Î± (Alpha):</b> Gain sensitivity parameter, typically 0.88. Lower values indicate greater diminishing sensitivity to larger gains.</li>
        <li><b>Î² (Beta):</b> Loss sensitivity parameter, typically 0.88. Lower values indicate greater diminishing sensitivity to larger losses.</li>
    </ul>

    <h3 className="text-xl font-semibold text-foreground mt-6">Loss Aversion Ratio</h3>
    <p>The loss aversion ratio compares the perceived impact of losses to gains:</p>
    <div className="bg-gray-100 dark:bg-gray-800 p-4 rounded-lg my-4">
        <p className="font-mono">Loss Aversion Ratio = |Perceived Loss Value| / Perceived Gain Value</p>
    </div>
    <p>Typical ratios range from 2.0-2.5, meaning losses feel 2-2.5 times worse than equivalent gains.</p>

<hr className="my-6" />

    <h2 id="impact" className="text-2xl font-bold text-foreground pt-8" itemProp="articleSection">Impact on Financial Decisions</h2>
    <p>Loss aversion significantly affects investment behavior and financial choices.</p>

    <h3 className="text-xl font-semibold text-foreground mt-6">Investment Behavior</h3>
    <ul className="list-disc ml-6 space-y-1">
        <li><b>Disposition Effect:</b> Tendency to hold losing investments too long and sell winners too early</li>
        <li><b>Risk Avoidance:</b> Avoiding investments with positive expected returns due to fear of losses</li>
        <li><b>Over-Insurance:</b> Paying too much for insurance to avoid potential losses</li>
        <li><b>Anchoring to Purchase Price:</b> Evaluating investments relative to purchase price rather than current value</li>
    </ul>

    <h3 className="text-xl font-semibold text-foreground mt-6">Decision Making</h3>
    <ul className="list-disc ml-6 space-y-1">
        <li>Focusing on avoiding losses rather than maximizing gains</li>
        <li>Making decisions based on fear rather than rational analysis</li>
        <li>Being overly conservative despite growth opportunities</li>
        <li>Experiencing stress and anxiety over potential losses</li>
    </ul>

<hr className="my-6" />

    <h2 id="mitigation" className="text-2xl font-bold text-foreground pt-8" itemProp="articleSection">Mitigating Loss Aversion Bias</h2>
    <p>While loss aversion is natural, awareness and strategies can help mitigate its negative impact.</p>

    <h3 className="text-xl font-semibold text-foreground mt-6">Strategies</h3>
    <ul className="list-disc ml-6 space-y-1">
        <li><b>Long-Term Focus:</b> Consider long-term outcomes rather than short-term fluctuations</li>
        <li><b>Dollar-Cost Averaging:</b> Reduce impact of individual losses through systematic investing</li>
        <li><b>Predefined Rules:</b> Set buy/sell rules in advance to avoid emotional decisions</li>
        <li><b>Diversification:</b> Spread risk to reduce impact of individual losses</li>
        <li><b>Rational Analysis:</b> Focus on expected value and overall portfolio performance</li>
        <li><b>Rebalancing:</b> Systematic rebalancing helps avoid emotional decision-making</li>
    </ul>

    <h3 className="text-xl font-semibold text-foreground mt-6">When Loss Aversion is Helpful</h3>
    <p>Loss aversion can be beneficial when:</p>
    <ul className="list-disc ml-6 space-y-1">
        <li>Avoiding truly catastrophic losses</li>
        <li>Maintaining adequate emergency funds</li>
        <li>Preventing excessive risk-taking</li>
        <li>Protecting against fraud and scams</li>
        <li>Encouraging careful financial planning</li>
    </ul>

<hr className="my-6" />

    <h2 id="application" className="text-2xl font-bold text-foreground pt-8" itemProp="articleSection">Practical Applications</h2>
    <p>Understanding loss aversion helps improve financial decision-making.</p>

    <h3 className="text-xl font-semibold text-foreground mt-6">Investment Decisions</h3>
    <p>Recognize when loss aversion is causing you to:</p>
    <ul className="list-disc ml-6 space-y-1">
        <li>Hold losing positions too long</li>
        <li>Sell winners prematurely</li>
        <li>Avoid good opportunities</li>
        <li>Make overly conservative choices</li>
    </ul>

    <h3 className="text-xl font-semibold text-foreground mt-6">Financial Planning</h3>
    <p>Use loss aversion awareness to:</p>
    <ul className="list-disc ml-6 space-y-1">
        <li>Balance risk appropriately</li>
        <li>Set realistic expectations</li>
        <li>Develop systematic investment strategies</li>
        <li>Make rational rather than emotional decisions</li>
    </ul>

<hr className="my-6" />

    <h2 className="text-2xl font-bold text-foreground pt-8" itemProp="articleSection">Conclusion</h2>
    <p>Loss aversion is a fundamental aspect of human psychology that significantly impacts financial decision-making. Prospect theory provides the mathematical framework to understand how losses are perceived more intensely than equivalent gains. By recognizing loss aversion, understanding its impact, and applying mitigation strategies, individuals can make more rational financial decisions that balance appropriate risk-taking with loss protection, ultimately improving investment outcomes and financial well-being.</p>
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
          <p>This tool simulates loss aversion impact on financial decisions using prospect theory to understand how losses are perceived relative to gains.</p>
          <p>Outputs include perceived gain value, perceived loss value, loss aversion ratio, decision impact, interpretation, recommendations, an action plan, and supporting metrics.</p>
          <p>Formula, steps, guide content, related tools, and FAQs ensure humans or AI assistants can interpret the methodology instantly.</p>
        </CardContent>
      </Card>
    </div>
  );
}



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
  anchorPrice: z.number({ invalid_type_error: 'Enter anchor price' }).min(0),
  currentPrice: z.number({ invalid_type_error: 'Enter current price' }).min(0),
  actualValue: z.number({ invalid_type_error: 'Enter actual value' }).min(0).optional(),
  predictionConfidence: z.number({ invalid_type_error: 'Enter prediction confidence' }).min(0).max(100).optional(),
  actualOutcome: z.number({ invalid_type_error: 'Enter actual outcome' }).min(0).optional(),
  tradingFrequency: z.number({ invalid_type_error: 'Enter trading frequency' }).min(0).optional(),
});

type FormValues = z.infer<typeof formSchema>;

type ResultPayload = {
  anchorPrice: number;
  currentPrice: number;
  actualValue?: number;
  predictionConfidence?: number;
  actualOutcome?: number;
  tradingFrequency?: number;
  anchoringBias: number;
  overconfidenceBias: number;
  combinedBiasScore: number;
  interpretation: string;
  status: 'optimal' | 'good' | 'moderate' | 'low';
  recommendations: string[];
  plan: { label: string; detail: string }[];
};

const steps = [
  'Enter anchor price (initial reference point or purchase price).',
  'Enter current price (current market price).',
  'Optionally enter actual value, prediction confidence, actual outcome, and trading frequency.',
  'Review anchoring bias, overconfidence bias, combined bias score, and recommendations.',
];

const faqs = [
  {
    question: 'What is anchoring bias?',
    answer:
      'Anchoring bias occurs when investors rely too heavily on an initial piece of information (the anchor) when making decisions. For example, fixating on purchase price when evaluating current investment value, even when market conditions have changed significantly.',
  },
  {
    question: 'What is overconfidence bias?',
    answer:
      'Overconfidence bias refers to investors overestimating their knowledge, abilities, or predictive skills regarding market outcomes. This leads to excessive trading, underestimating risks, and suboptimal investment performance.',
  },
  {
    question: 'How is anchoring bias measured?',
    answer:
      'Anchoring bias can be measured as the deviation between current price and anchor price relative to actual value. High anchoring bias indicates decisions overly influenced by the anchor rather than current market realities.',
  },
  {
    question: 'How is overconfidence bias measured?',
    answer:
      'Overconfidence can be measured by comparing prediction confidence to actual accuracy, or by analyzing trading frequency relative to performance. High confidence with low accuracy or excessive trading indicates overconfidence bias.',
  },
  {
    question: 'What causes anchoring bias?',
    answer:
      'Anchoring occurs because the first piece of information serves as a reference point that influences subsequent judgments. Common anchors include purchase prices, historical highs/lows, analyst price targets, or recent market prices.',
  },
  {
    question: 'What causes overconfidence bias?',
    answer:
      'Overconfidence stems from illusion of knowledge (thinking we know more than we do), illusion of control (overestimating ability to influence outcomes), and self-attribution bias (attributing success to skill, failure to luck).',
  },
  {
    question: 'How do biases affect investment decisions?',
    answer:
      'Anchoring bias can cause: holding losers too long, selling winners too early, mispricing assets, ignoring new information. Overconfidence can cause: excessive trading, insufficient diversification, underestimating risks, ignoring contradictory information.',
  },
  {
    question: 'How can I reduce anchoring bias?',
    answer:
      'Reduce anchoring by: using multiple valuation methods, considering a range of scenarios, seeking objective perspectives, ignoring purchase prices when evaluating, focusing on current fundamentals, and setting predefined decision criteria.',
  },
  {
    question: 'How can I reduce overconfidence bias?',
    answer:
      'Reduce overconfidence by: tracking prediction accuracy, reviewing past mistakes, seeking diverse perspectives, following systematic investment processes, maintaining humility, diversifying investments, and acknowledging uncertainty.',
  },
  {
    question: 'Why is bias awareness important?',
    answer:
      'Behavioral biases lead to suboptimal investment decisions and underperformance. Awareness of biases helps investors recognize and mitigate their influence, leading to more rational, systematic, and profitable investment decisions.',
  },
];

const relatedCalculators = [
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
    name: 'Position Sizing Calculator',
    slug: 'position-sizing-calculator',
    description: 'Calculate optimal position sizes.',
  },
  {
    name: 'Portfolio Rebalancing Planner',
    slug: 'portfolio-rebalancing-planner',
    description: 'Plan portfolio rebalancing.',
  },
];

const baseUrl = 'https://mycalculating.com/finance/investment-bias-analyzer-anchoring-overconfidence-estimator';

const schemaMarkup = {
  '@context': 'https://schema.org',
  '@graph': [
    {
      '@type': 'BreadcrumbList',
      itemListElement: [
        { '@type': 'ListItem', position: 1, name: 'Home', item: 'https://mycalculating.com' },
        { '@type': 'ListItem', position: 2, name: 'Finance', item: 'https://mycalculating.com/finance' },
        { '@type': 'ListItem', position: 3, name: 'Investment Bias Analyzer (Anchoring/Overconfidence Estimator)', item: baseUrl },
      ],
    },
    {
      '@type': 'SoftwareApplication',
      name: 'Investment Bias Analyzer (Anchoring/Overconfidence Estimator)',
      applicationCategory: 'Calculator',
      operatingSystem: 'Web Browser',
      description: 'Analyze investment biases including anchoring and overconfidence to improve investment decision-making.',
      url: baseUrl,
      offers: { '@type': 'Offer', price: '0', priceCurrency: 'USD' },
    },
  ],
};

const calculateResult = (values: FormValues): ResultPayload => {
  const anchorPrice = values.anchorPrice;
  const currentPrice = values.currentPrice;
  const actualValue = values.actualValue;
  const predictionConfidence = values.predictionConfidence;
  const actualOutcome = values.actualOutcome;
  const tradingFrequency = values.tradingFrequency;
  
  // Anchoring Bias: Deviation from anchor relative to actual value or current market
  // Higher deviation indicates stronger anchoring
  let anchoringBias = 0;
  if (actualValue && actualValue > 0) {
    const anchorDeviation = Math.abs(currentPrice - anchorPrice);
    const valueDeviation = Math.abs(currentPrice - actualValue);
    anchoringBias = anchorPrice > 0 ? (anchorDeviation / anchorPrice) * 100 : 0;
  } else {
    // If no actual value, measure deviation from anchor as percentage
    anchoringBias = anchorPrice > 0 ? (Math.abs(currentPrice - anchorPrice) / anchorPrice) * 100 : 0;
  }
  
  // Overconfidence Bias: Compare confidence to accuracy or trading frequency
  let overconfidenceBias = 0;
  if (predictionConfidence !== undefined && actualOutcome !== undefined) {
    // If both provided, measure confidence-accuracy gap
    const predictionError = Math.abs(currentPrice - (actualOutcome || currentPrice));
    const errorPercent = currentPrice > 0 ? (predictionError / currentPrice) * 100 : 0;
    // Overconfidence = high confidence with high error
    overconfidenceBias = predictionConfidence > errorPercent ? (predictionConfidence - errorPercent) : 0;
  } else if (tradingFrequency !== undefined) {
    // High trading frequency may indicate overconfidence
    overconfidenceBias = Math.min(tradingFrequency / 10, 10); // Scale trading frequency
  } else {
    overconfidenceBias = 0;
  }
  
  // Combined Bias Score: Average of both biases (scale 0-10)
  const combinedBiasScore = (Math.min(anchoringBias / 10, 10) + Math.min(overconfidenceBias, 10)) / 2;
  
  let status: ResultPayload['status'] = 'optimal';
  let interpretation = `Anchoring bias score: ${anchoringBias.toFixed(2)}%, Overconfidence bias score: ${overconfidenceBias.toFixed(2)}. Combined bias score: ${combinedBiasScore.toFixed(2)}/10.`;
  
  if (combinedBiasScore > 7) {
    status = 'low';
    interpretation += ' High bias scores indicate significant behavioral biases affecting investment decisions. Take steps to mitigate biases.';
  } else if (combinedBiasScore > 5) {
    status = 'moderate';
    interpretation += ' Moderate bias scores suggest some behavioral biases may be influencing decisions. Awareness and mitigation strategies recommended.';
  } else if (combinedBiasScore > 3) {
    status = 'good';
    interpretation += ' Relatively low bias scores indicate reasonable decision-making processes, though some bias may still exist.';
  } else {
    status = 'optimal';
    interpretation += ' Low bias scores suggest decisions are relatively free from significant anchoring or overconfidence biases.';
  }

  const recommendations = [
    `Mitigate anchoring bias: Score ${anchoringBias.toFixed(2)}%. ${anchoringBias > 20 ? 'High anchoring detected - decisions overly influenced by anchor price. Use multiple valuation methods, ignore purchase prices when evaluating, focus on current fundamentals.' : 'Consider whether decisions are influenced by anchor prices. Use objective analysis rather than reference points.'}`,
    `Reduce overconfidence: Score ${overconfidenceBias.toFixed(2)}. ${overconfidenceBias > 5 ? 'High overconfidence detected - may be overestimating abilities. Track prediction accuracy, seek diverse perspectives, follow systematic processes, acknowledge uncertainty.' : 'Maintain awareness of overconfidence risks. Regularly review decision quality and outcomes.'}`,
    'Use systematic processes: Establish predefined decision criteria and investment processes. Avoid making decisions based on emotions, anchors, or overconfidence. Use checklists and quantitative analysis.',
    'Seek objective perspectives: Consult with financial advisors, use multiple valuation methods, and consider contrarian viewpoints. External perspectives help identify and correct biases.',
  ];
  
  if (anchoringBias > 30) {
    recommendations.push('Very high anchoring bias: Decisions are heavily influenced by anchor prices. Implement strict processes that ignore purchase prices when evaluating investments. Focus on current value and future prospects.');
  }
  if (overconfidenceBias > 7) {
    recommendations.push('Very high overconfidence: Significant overconfidence may lead to excessive risk-taking and trading. Reduce trading frequency, increase diversification, and maintain humility about market predictions.');
  }

  const plan = [
    { label: 'This Week', detail: `Analyze investment biases: Anchoring ${anchoringBias.toFixed(2)}%, Overconfidence ${overconfidenceBias.toFixed(2)}, Combined ${combinedBiasScore.toFixed(2)}/10. Identify specific decisions influenced by biases.` },
    { label: 'This Month', detail: 'Implement bias mitigation strategies: Use systematic decision processes, track prediction accuracy, seek objective perspectives, and review decisions to identify bias patterns. Monitor trading frequency and decision quality.' },
    { label: 'Ongoing', detail: 'Maintain bias awareness and continue using systematic processes. Regularly reassess biases, review decision outcomes, and adjust processes to reduce bias influence. Consider behavioral coaching or automated investment systems to reduce bias.' },
  ];

  return { anchorPrice, currentPrice, actualValue, predictionConfidence, actualOutcome, tradingFrequency, anchoringBias, overconfidenceBias, combinedBiasScore, interpretation, status, recommendations, plan };
};

export default function InvestmentBiasAnalyzerAnchoringOverconfidenceEstimator() {
  const [result, setResult] = useState<ResultPayload | null>(null);

  const form = useForm<FormValues>({
    resolver: zodResolver(formSchema),
    defaultValues: {
      anchorPrice: undefined,
      currentPrice: undefined,
      actualValue: undefined,
      predictionConfidence: undefined,
      actualOutcome: undefined,
      tradingFrequency: undefined,
    },
  });

  return (
    <div className="space-y-8">
      <Script id="investment-bias-schema" type="application/ld+json" strategy="afterInteractive" dangerouslySetInnerHTML={{ __html: JSON.stringify(schemaMarkup) }} />

      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <Heart className="h-5 w-5" />
            Investment Bias Analyzer (Anchoring/Overconfidence Estimator)
          </CardTitle>
          <CardDescription>Analyze investment biases including anchoring and overconfidence to improve investment decision-making.</CardDescription>
        </CardHeader>
      </Card>

      <Card>
        <CardHeader>
          <CardTitle>Input your bias analysis data</CardTitle>
        </CardHeader>
        <CardContent>
          <Form {...form}>
            <form onSubmit={form.handleSubmit((values) => setResult(calculateResult(values)))} className="space-y-6">
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <FormField
                  control={form.control}
                  name="anchorPrice"
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel>Anchor Price</FormLabel>
                      <FormControl>
                        <Input type="number" step="0.01" placeholder="e.g., 100" value={field.value ?? ''} onChange={(e) => field.onChange(e.target.value === '' ? undefined : Number(e.target.value))} />
                      </FormControl>
                      <FormMessage />
                      <p className="text-xs text-muted-foreground">Initial reference point or purchase price</p>
                    </FormItem>
                  )}
                />
                <FormField
                  control={form.control}
                  name="currentPrice"
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel>Current Price</FormLabel>
                      <FormControl>
                        <Input type="number" step="0.01" placeholder="e.g., 80" value={field.value ?? ''} onChange={(e) => field.onChange(e.target.value === '' ? undefined : Number(e.target.value))} />
                      </FormControl>
                      <FormMessage />
                      <p className="text-xs text-muted-foreground">Current market price</p>
                    </FormItem>
                  )}
                />
                <FormField
                  control={form.control}
                  name="actualValue"
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel>Actual Value (Optional)</FormLabel>
                      <FormControl>
                        <Input type="number" step="0.01" placeholder="e.g., 75" value={field.value ?? ''} onChange={(e) => field.onChange(e.target.value === '' ? undefined : Number(e.target.value))} />
                      </FormControl>
                      <FormMessage />
                      <p className="text-xs text-muted-foreground">True or fair value</p>
                    </FormItem>
                  )}
                />
                <FormField
                  control={form.control}
                  name="predictionConfidence"
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel>Prediction Confidence (%) - Optional</FormLabel>
                      <FormControl>
                        <Input type="number" step="0.1" min="0" max="100" placeholder="e.g., 85" value={field.value ?? ''} onChange={(e) => field.onChange(e.target.value === '' ? undefined : Number(e.target.value))} />
                      </FormControl>
                      <FormMessage />
                      <p className="text-xs text-muted-foreground">Your confidence level in predictions</p>
                    </FormItem>
                  )}
                />
                <FormField
                  control={form.control}
                  name="actualOutcome"
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel>Actual Outcome (Optional)</FormLabel>
                      <FormControl>
                        <Input type="number" step="0.01" placeholder="e.g., 70" value={field.value ?? ''} onChange={(e) => field.onChange(e.target.value === '' ? undefined : Number(e.target.value))} />
                      </FormControl>
                      <FormMessage />
                      <p className="text-xs text-muted-foreground">What actually happened</p>
                    </FormItem>
                  )}
                />
                <FormField
                  control={form.control}
                  name="tradingFrequency"
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel>Trading Frequency (Optional)</FormLabel>
                      <FormControl>
                        <Input type="number" step="0.1" placeholder="e.g., 20" value={field.value ?? ''} onChange={(e) => field.onChange(e.target.value === '' ? undefined : Number(e.target.value))} />
                      </FormControl>
                      <FormMessage />
                      <p className="text-xs text-muted-foreground">Number of trades per period</p>
                    </FormItem>
                  )}
                />
              </div>
              <Button type="submit" className="w-full md:w-auto">
                Analyze Investment Biases
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
            <CardDescription>See bias analysis and recommendations.</CardDescription>
          </CardHeader>
          <CardContent className="space-y-6">
            <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
              <div className="p-4 border rounded">
                <p className="text-sm text-muted-foreground">Anchoring Bias</p>
                <p className="text-2xl font-semibold text-primary">{result.anchoringBias.toFixed(2)}%</p>
                <p className="text-xs text-muted-foreground">Bias score</p>
              </div>
              <div className="p-4 border rounded">
                <p className="text-sm text-muted-foreground">Overconfidence Bias</p>
                <p className="text-2xl font-semibold text-primary">{result.overconfidenceBias.toFixed(2)}</p>
                <p className="text-xs text-muted-foreground">Bias score</p>
              </div>
              <div className="p-4 border rounded">
                <p className="text-sm text-muted-foreground">Combined Bias Score</p>
                <p className="text-2xl font-semibold text-primary">{result.combinedBiasScore.toFixed(2)}</p>
                <p className="text-xs text-muted-foreground">Out of 10</p>
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
            <strong>Anchoring Bias</strong> = |Current Price - Anchor Price| / Anchor Price Ã— 100 (when actual value available: measures deviation from anchor relative to anchor)
          </p>
          <p>
            <strong>Overconfidence Bias</strong> = Prediction Confidence - Prediction Error (when confidence and outcome provided), or Trading Frequency (scaled, when frequency provided)
          </p>
          <p>
            <strong>Combined Bias Score</strong> = (Anchoring Bias / 10 + Overconfidence Bias) / 2 (scaled to 0-10)
          </p>
          <p>Anchoring bias measures how much decisions are influenced by an initial reference point (anchor price) rather than current market realities. Overconfidence bias measures the gap between perceived abilities and actual performance. Higher scores indicate stronger biases that may lead to suboptimal investment decisions.</p>
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
                <p className="text-sm text-muted-foreground">Price Deviation</p>
                <p className="text-xl font-semibold text-primary">
                  {Math.abs(result.currentPrice - result.anchorPrice).toLocaleString()}
                </p>
                <p className="text-xs text-muted-foreground">From anchor</p>
              </div>
              <div className="p-4 border rounded">
                <p className="text-sm text-muted-foreground">Deviation %</p>
                <p className="text-xl font-semibold text-primary">
                  {result.anchorPrice > 0 ? ((Math.abs(result.currentPrice - result.anchorPrice) / result.anchorPrice) * 100).toFixed(1) : 0}%
                </p>
                <p className="text-xs text-muted-foreground">Percentage change</p>
              </div>
              <div className="p-4 border rounded">
                <p className="text-sm text-muted-foreground">Bias Level</p>
                <p className="text-xl font-semibold text-primary">
                  {result.combinedBiasScore > 7 ? 'High' : result.combinedBiasScore > 5 ? 'Moderate' : result.combinedBiasScore > 3 ? 'Low' : 'Very Low'}
                </p>
                <p className="text-xs text-muted-foreground">Overall bias</p>
              </div>
            </div>
          ) : (
            <p className="text-sm text-muted-foreground">Enter your bias analysis data to see additional insights.</p>
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
    <meta itemProp="name" content="The Complete Guide to Investment Bias Analysis: Anchoring and Overconfidence" />
    <meta itemProp="description" content="An in-depth guide on analyzing investment biases including anchoring and overconfidence, understanding their impact, and strategies for bias mitigation." />
    <meta itemProp="keywords" content="investment bias, anchoring bias, overconfidence bias, behavioral finance, cognitive bias, investment decision making" />
    <meta itemProp="author" content="[Your Site's Finance Team]" />
    <meta itemProp="datePublished" content="2025-12-02" />
    <meta itemProp="url" content="/finance/investment-bias-analyzer-anchoring-overconfidence-estimator" />

    <h1 className="text-3xl md:text-4xl font-extrabold text-foreground mb-4" itemProp="headline">The Complete Guide to Investment Bias Analysis: Anchoring and Overconfidence</h1>
    <p className="text-lg italic text-gray-700 dark:text-gray-300">A comprehensive look at investment biases, particularly anchoring and overconfidence, and how to identify and mitigate their influence on investment decisions.</p>

    <h2 className="text-2xl font-bold text-foreground mt-8 mb-4">Table of Contents: Jump to a Section</h2>
    <ul className="list-disc ml-6 space-y-2 text-blue-600 dark:text-blue-400">
        <li><a href="#anchoring" className="hover:underline">Understanding Anchoring Bias</a></li>
        <li><a href="#overconfidence" className="hover:underline">Understanding Overconfidence Bias</a></li>
        <li><a href="#measurement" className="hover:underline">Measuring Investment Biases</a></li>
        <li><a href="#impact" className="hover:underline">Impact on Investment Decisions</a></li>
        <li><a href="#mitigation" className="hover:underline">Bias Mitigation Strategies</a></li>
        <li><a href="#awareness" className="hover:underline">Building Bias Awareness</a></li>
    </ul>
<hr className="my-6" />

    <h2 id="anchoring" className="text-2xl font-bold text-foreground pt-8" itemProp="articleSection">Understanding Anchoring Bias</h2>
    <p>Anchoring bias is a cognitive bias where individuals rely too heavily on an initial piece of information (the anchor) when making decisions, even when that information may be irrelevant or outdated.</p>

    <h3 className="text-xl font-semibold text-foreground mt-6">How Anchoring Works in Investing</h3>
    <p>Common anchoring scenarios in investing:</p>
    <ul className="list-disc ml-6 space-y-1">
        <li><b>Purchase Price Anchoring:</b> Evaluating investments based on purchase price rather than current value</li>
        <li><b>Historical High/Low Anchoring:</b> Using past price extremes as reference points</li>
        <li><b>Analyst Target Anchoring:</b> Relying on price targets as anchors</li>
        <li><b>Recent Price Anchoring:</b> Using recent market prices as anchors</li>
    </ul>

    <h3 className="text-xl font-semibold text-foreground mt-6">Consequences of Anchoring</h3>
    <ul className="list-disc ml-6 space-y-1">
        <li>Holding losing investments too long (waiting for price to return to anchor)</li>
        <li>Selling winning investments too early (when price reaches anchor)</li>
        <li>Ignoring new information that contradicts anchor</li>
        <li>Mispricing assets relative to current fundamentals</li>
        <li>Missing buying opportunities at current prices</li>
    </ul>

<hr className="my-6" />

    <h2 id="overconfidence" className="text-2xl font-bold text-foreground pt-8" itemProp="articleSection">Understanding Overconfidence Bias</h2>
    <p>Overconfidence bias occurs when investors overestimate their knowledge, abilities, or predictive skills regarding market outcomes.</p>

    <h3 className="text-xl font-semibold text-foreground mt-6">Types of Overconfidence</h3>
    <ul className="list-disc ml-6 space-y-1">
        <li><b>Illusion of Knowledge:</b> Thinking you know more than you actually do</li>
        <li><b>Illusion of Control:</b> Overestimating ability to influence outcomes</li>
        <li><b>Prediction Overconfidence:</b> Overestimating accuracy of predictions</li>
        <li><b>Calibration Errors:</b> Confidence levels exceeding actual accuracy</li>
    </ul>

    <h3 className="text-xl font-semibold text-foreground mt-6">Consequences of Overconfidence</h3>
    <ul className="list-disc ml-6 space-y-1">
        <li>Excessive trading (overtrading)</li>
        <li>Underestimating risks</li>
        <li>Insufficient diversification</li>
        <li>Ignoring contradictory information</li>
        <li>Lower investment returns due to transaction costs and poor timing</li>
    </ul>

<hr className="my-6" />

    <h2 id="measurement" className="text-2xl font-bold text-foreground pt-8" itemProp="articleSection">Measuring Investment Biases</h2>
    <p>Quantifying biases helps identify their influence and track mitigation efforts.</p>

    <h3 className="text-xl font-semibold text-foreground mt-6">Anchoring Bias Measurement</h3>
    <p>Anchoring bias can be measured by:</p>
    <ul className="list-disc ml-6 space-y-1">
        <li>Deviation between current decisions and anchor prices</li>
        <li>Reluctance to adjust views when anchor becomes irrelevant</li>
        <li>Comparison of valuations to anchor vs. current fundamentals</li>
        <li>Frequency of decisions influenced by purchase prices</li>
    </ul>

    <h3 className="text-xl font-semibold text-foreground mt-6">Overconfidence Bias Measurement</h3>
    <p>Overconfidence can be measured by:</p>
    <ul className="list-disc ml-6 space-y-1">
        <li>Gap between prediction confidence and actual accuracy</li>
        <li>Trading frequency relative to performance</li>
        <li>Self-assessment vs. actual outcomes</li>
        <li>Willingness to accept challenging tasks</li>
    </ul>

<hr className="my-6" />

    <h2 id="impact" className="text-2xl font-bold text-foreground pt-8" itemProp="articleSection">Impact on Investment Decisions</h2>
    <p>Biases significantly impact investment performance and decision quality.</p>

    <h3 className="text-xl font-semibold text-foreground mt-6">Performance Impact</h3>
    <ul className="list-disc ml-6 space-y-1">
        <li><b>Anchoring:</b> Suboptimal entry/exit timing, missed opportunities</li>
        <li><b>Overconfidence:</b> Lower returns due to excessive trading, poor timing, insufficient diversification</li>
        <li><b>Combined:</b> Cumulative negative impact on portfolio performance</li>
    </ul>

    <h3 className="text-xl font-semibold text-foreground mt-6">Decision Quality Impact</h3>
    <ul className="list-disc ml-6 space-y-1">
        <li>Decisions based on emotions and biases rather than analysis</li>
        <li>Failure to adapt to changing market conditions</li>
        <li>Ignoring contradictory information</li>
        <li>Repeating past mistakes</li>
    </ul>

<hr className="my-6" />

    <h2 id="mitigation" className="text-2xl font-bold text-foreground pt-8" itemProp="articleSection">Bias Mitigation Strategies</h2>
    <p>Several strategies can help reduce bias influence.</p>

    <h3 className="text-xl font-semibold text-foreground mt-6">Anchoring Bias Mitigation</h3>
    <ul className="list-disc ml-6 space-y-1">
        <li>Ignore purchase prices when evaluating current holdings</li>
        <li>Use multiple valuation methods</li>
        <li>Consider a range of scenarios, not just anchor-based</li>
        <li>Focus on current fundamentals and future prospects</li>
        <li>Set predefined decision criteria</li>
        <li>Seek objective, external perspectives</li>
    </ul>

    <h3 className="text-xl font-semibold text-foreground mt-6">Overconfidence Bias Mitigation</h3>
    <ul className="list-disc ml-6 space-y-1">
        <li>Track prediction accuracy over time</li>
        <li>Review and learn from past mistakes</li>
        <li>Seek diverse perspectives and contrarian views</li>
        <li>Follow systematic investment processes</li>
        <li>Maintain humility about market predictions</li>
        <li>Reduce trading frequency</li>
        <li>Acknowledge uncertainty and market randomness</li>
    </ul>

    <h3 className="text-xl font-semibold text-foreground mt-6">General Bias Reduction</h3>
    <ul className="list-disc ml-6 space-y-1">
        <li>Use checklists and systematic processes</li>
        <li>Implement decision delays for major choices</li>
        <li>Consider automated investment systems</li>
        <li>Diversify investments</li>
        <li>Regular bias awareness training</li>
    </ul>

<hr className="my-6" />

    <h2 id="awareness" className="text-2xl font-bold text-foreground pt-8" itemProp="articleSection">Building Bias Awareness</h2>
    <p>Regular bias assessment and awareness building improve decision-making.</p>

    <h3 className="text-xl font-semibold text-foreground mt-6">Self-Assessment</h3>
    <ul className="list-disc ml-6 space-y-1">
        <li>Regularly review investment decisions for bias patterns</li>
        <li>Track prediction accuracy and compare to confidence levels</li>
        <li>Analyze trading frequency and performance</li>
        <li>Document decisions and outcomes</li>
    </ul>

    <h3 className="text-xl font-semibold text-foreground mt-6">External Feedback</h3>
    <ul className="list-disc ml-6 space-y-1">
        <li>Consult with financial advisors</li>
        <li>Seek peer review of investment decisions</li>
        <li>Use quantitative analysis tools</li>
        <li>Consider behavioral coaching</li>
    </ul>

<hr className="my-6" />

    <h2 className="text-2xl font-bold text-foreground pt-8" itemProp="articleSection">Conclusion</h2>
    <p>Investment biases, particularly anchoring and overconfidence, significantly impact investment decisions and performance. Understanding these biases, measuring their influence, and implementing mitigation strategies leads to more rational, systematic, and profitable investment decisions. Regular bias awareness and assessment, combined with systematic processes and external perspectives, helps reduce bias influence and improve investment outcomes.</p>
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
          <p>This tool analyzes investment biases including anchoring and overconfidence to improve investment decision-making.</p>
          <p>Outputs include anchoring bias score, overconfidence bias score, combined bias score, interpretation, recommendations, an action plan, and supporting metrics.</p>
          <p>Formula, steps, guide content, related tools, and FAQs ensure humans or AI assistants can interpret the methodology instantly.</p>
        </CardContent>
      </Card>
    </div>
  );
}

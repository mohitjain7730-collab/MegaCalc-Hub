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
  offerPricePerTargetShare: z.number({ invalid_type_error: 'Enter offer price per target share' }).min(0),
  acquirerSharePrice: z.number({ invalid_type_error: 'Enter acquirer share price' }).min(0),
});

type FormValues = z.infer<typeof formSchema>;

type ResultPayload = {
  offerPricePerTargetShare: number;
  acquirerSharePrice: number;
  exchangeRatio: number;
  interpretation: string;
  status: 'optimal' | 'good' | 'moderate' | 'low';
  recommendations: string[];
  plan: { label: string; detail: string }[];
};

const steps = [
  'Enter offer price per target share (the price offered for each share of the target company).',
  'Enter acquirer share price (current market price of acquirer\'s shares).',
  'Review exchange ratio calculation and interpretation.',
];

const faqs = [
  {
    question: 'What is an exchange ratio in M&A?',
    answer:
      'The exchange ratio determines how many shares of the acquiring company will be issued for each share of the target company in a stock-for-stock transaction. It is calculated as: Exchange Ratio = Offer Price per Target Share / Acquirer Share Price.',
  },
  {
    question: 'How is the exchange ratio calculated?',
    answer:
      'Exchange Ratio = Offer Price per Target Share / Acquirer Share Price. For example, if the offer price is $21.63 per target share and the acquirer\'s share price is $11.75, the exchange ratio is 1.84, meaning 1.84 acquirer shares for each target share.',
  },
  {
    question: 'What factors affect the exchange ratio?',
    answer:
      'Factors include: relative valuations of both companies, negotiated offer price, market prices at deal announcement, synergies expected from the merger, and relative earnings per share (EPS) of both companies.',
  },
  {
    question: 'How does exchange ratio affect ownership?',
    answer:
      'The exchange ratio directly determines ownership distribution in the combined entity. A higher exchange ratio means target shareholders receive more acquirer shares, resulting in greater ownership percentage in the combined company.',
  },
  {
    question: 'What is EPS-based exchange ratio?',
    answer:
      'EPS-based exchange ratio = Target\'s EPS / Acquirer\'s EPS. This method ensures earnings neutrality, where the combined EPS equals the acquirer\'s pre-merger EPS, preventing dilution.',
  },
  {
    question: 'How do synergies affect exchange ratio?',
    answer:
      'Expected synergies can justify a higher exchange ratio (more acquirer shares per target share) because synergies increase the combined company\'s value, making the premium more acceptable to acquirer shareholders.',
  },
  {
    question: 'What is a collar provision?',
    answer:
      'A collar provision sets minimum and maximum exchange ratios based on acquirer share price movements. If acquirer stock price falls, target shareholders receive more shares (up to maximum). If it rises, they receive fewer shares (down to minimum).',
  },
  {
    question: 'How do I validate an exchange ratio?',
    answer:
      'Validate by: comparing to similar transactions, assessing relative valuations (P/E ratios, market caps), checking if ratio maintains EPS neutrality, reviewing market reaction to deal announcement, and ensuring fairness for both parties.',
  },
  {
    question: 'What happens if acquirer stock price changes?',
    answer:
      'In fixed exchange ratio deals, target shareholders bear the risk of acquirer stock price movements. If acquirer stock falls before closing, target shareholders receive less value. Collar provisions protect against this risk.',
  },
  {
    question: 'How does exchange ratio compare to cash offers?',
    answer:
      'Exchange ratios create stock-for-stock transactions, while cash offers provide immediate liquidity. Stock offers allow target shareholders to participate in combined company upside but expose them to acquirer stock price risk.',
  },
];

const relatedCalculators = [
  {
    name: 'Accretion/Dilution (EPS Impact) Calculator',
    slug: 'accretion-dilution-eps-impact-calculator',
    description: 'Calculate EPS impact from M&A transactions.',
  },
  {
    name: 'Synergy Value Calculator (M&A Synergy Estimator)',
    slug: 'synergy-value-calculator-ma-synergy-estimator',
    description: 'Estimate synergy value in M&A transactions.',
  },
  {
    name: 'Deal Value vs Enterprise Value Bridge Calculator',
    slug: 'deal-value-vs-enterprise-value-bridge-calculator',
    description: 'Calculate deal value bridge.',
  },
  {
    name: 'Precedent Transaction Valuation Calculator',
    slug: 'precedent-transaction-valuation-calculator',
    description: 'Calculate precedent transaction valuation.',
  },
];

const baseUrl = 'https://mycalculating.com/finance/merger-exchange-ratio-calculator';

const schemaMarkup = {
  '@context': 'https://schema.org',
  '@graph': [
    {
      '@type': 'BreadcrumbList',
      itemListElement: [
        { '@type': 'ListItem', position: 1, name: 'Home', item: 'https://mycalculating.com' },
        { '@type': 'ListItem', position: 2, name: 'Finance', item: 'https://mycalculating.com/finance' },
        { '@type': 'ListItem', position: 3, name: 'Merger Exchange Ratio Calculator', item: baseUrl },
      ],
    },
    {
      '@type': 'SoftwareApplication',
      name: 'Merger Exchange Ratio Calculator',
      applicationCategory: 'Calculator',
      operatingSystem: 'Web Browser',
      description: 'Calculate exchange ratio in stock-for-stock M&A transactions by dividing offer price per target share by acquirer share price.',
      url: baseUrl,
      offers: { '@type': 'Offer', price: '0', priceCurrency: 'USD' },
    },
  ],
};

const calculateResult = (values: FormValues): ResultPayload => {
  const offerPricePerTargetShare = values.offerPricePerTargetShare;
  const acquirerSharePrice = values.acquirerSharePrice;
  
  // Exchange Ratio = Offer Price per Target Share / Acquirer Share Price
  const exchangeRatio = acquirerSharePrice > 0 ? offerPricePerTargetShare / acquirerSharePrice : 0;
  
  let status: ResultPayload['status'] = 'optimal';
  let interpretation = '';
  
  if (exchangeRatio <= 0) {
    status = 'low';
    interpretation = 'Invalid exchange ratio. Ensure both prices are positive.';
  } else if (exchangeRatio < 0.5) {
    status = 'low';
    interpretation = 'Low exchange ratio indicates target shareholders receive less than 0.5 acquirer shares per target share. This may suggest undervaluation or a low premium offer.';
  } else if (exchangeRatio < 1.0) {
    status = 'moderate';
    interpretation = 'Exchange ratio below 1.0 means target shareholders receive less than one acquirer share per target share. This is common when acquirer stock trades at a premium to target stock.';
  } else if (exchangeRatio <= 2.0) {
    status = 'good';
    interpretation = 'Exchange ratio between 1.0 and 2.0 is typical for most M&A transactions. Target shareholders receive 1-2 acquirer shares per target share.';
  } else {
    status = 'optimal';
    interpretation = 'High exchange ratio indicates target shareholders receive more than 2 acquirer shares per target share. This suggests a significant premium or acquirer stock trades at a discount.';
  }

  const recommendations = [
    `Exchange ratio: ${exchangeRatio.toFixed(4)} means ${exchangeRatio.toFixed(4)} acquirer shares will be issued for each target share. This ratio determines ownership distribution in the combined entity.`,
    `Offer price: ${offerPricePerTargetShare.toLocaleString()} per target share represents the value offered to target shareholders. Compare this to target\'s current market price to assess premium.`,
    `Acquirer share price: ${acquirerSharePrice.toLocaleString()} is the current market price of acquirer\'s shares. Changes in this price before deal closing affect the value target shareholders receive.`,
  ];
  
  if (exchangeRatio < 1.0) {
    recommendations.push('Consider: Exchange ratio below 1.0 may indicate target is being acquired at a discount or acquirer stock trades at a premium. Review relative valuations and market conditions.');
  }
  
  if (exchangeRatio > 2.0) {
    recommendations.push('Consider: High exchange ratio may indicate significant premium or acquirer stock trades at a discount. Validate that synergies justify the premium and assess market reaction.');
  }
  
  recommendations.push('Validation: Compare exchange ratio to similar transactions, assess relative valuations (P/E ratios, market caps), check EPS impact, and ensure fairness for both parties. Consider collar provisions to protect against acquirer stock price movements.');

  const plan = [
    { label: 'This Week', detail: `Calculate exchange ratio: ${exchangeRatio.toFixed(4)} (${offerPricePerTargetShare.toLocaleString()} / ${acquirerSharePrice.toLocaleString()}). Assess premium offered and compare to target\'s current market price.` },
    { label: 'This Month', detail: 'Validate exchange ratio by comparing to similar transactions and assessing relative valuations. Review EPS impact and ownership distribution. Consider collar provisions if needed.' },
    { label: 'Ongoing', detail: 'Monitor acquirer stock price movements before deal closing. Track market reaction to deal announcement. Update exchange ratio analysis based on market conditions and deal progress.' },
  ];

  return { offerPricePerTargetShare, acquirerSharePrice, exchangeRatio, interpretation, status, recommendations, plan };
};

export default function MergerExchangeRatioCalculator() {
  const [result, setResult] = useState<ResultPayload | null>(null);

  const form = useForm<FormValues>({
    resolver: zodResolver(formSchema),
    defaultValues: {
      offerPricePerTargetShare: undefined,
      acquirerSharePrice: undefined,
    },
  });

  return (
    <div className="space-y-8">
      <Script id="merger-exchange-ratio-schema" type="application/ld+json" strategy="afterInteractive" dangerouslySetInnerHTML={{ __html: JSON.stringify(schemaMarkup) }} />

      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <Heart className="h-5 w-5" />
            Merger Exchange Ratio Calculator
          </CardTitle>
          <CardDescription>Calculate exchange ratio in stock-for-stock M&A transactions by dividing offer price per target share by acquirer share price.</CardDescription>
        </CardHeader>
      </Card>

      <Card>
        <CardHeader>
          <CardTitle>Input your M&A transaction parameters</CardTitle>
        </CardHeader>
        <CardContent>
          <Form {...form}>
            <form onSubmit={form.handleSubmit((values) => setResult(calculateResult(values)))} className="space-y-6">
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <FormField
                  control={form.control}
                  name="offerPricePerTargetShare"
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel>Offer Price per Target Share</FormLabel>
                      <FormControl>
                        <Input type="number" step="0.01" placeholder="e.g., 21.63" value={field.value ?? ''} onChange={(e) => field.onChange(e.target.value === '' ? undefined : Number(e.target.value))} />
                      </FormControl>
                      <FormMessage />
                    </FormItem>
                  )}
                />
                <FormField
                  control={form.control}
                  name="acquirerSharePrice"
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel>Acquirer Share Price</FormLabel>
                      <FormControl>
                        <Input type="number" step="0.01" placeholder="e.g., 11.75" value={field.value ?? ''} onChange={(e) => field.onChange(e.target.value === '' ? undefined : Number(e.target.value))} />
                      </FormControl>
                      <FormMessage />
                    </FormItem>
                  )}
                />
              </div>
              <Button type="submit" className="w-full md:w-auto">
                Calculate Exchange Ratio
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
            <CardDescription>See exchange ratio calculation and interpretation.</CardDescription>
          </CardHeader>
          <CardContent className="space-y-6">
            <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
              <div className="p-4 border rounded">
                <p className="text-sm text-muted-foreground">Exchange Ratio</p>
                <p className="text-2xl font-semibold text-primary">{result.exchangeRatio.toFixed(4)}</p>
                <p className="text-xs text-muted-foreground">Acquirer shares per target share</p>
              </div>
              <div className="p-4 border rounded">
                <p className="text-sm text-muted-foreground">Offer Price</p>
                <p className="text-2xl font-semibold text-primary">${result.offerPricePerTargetShare.toLocaleString()}</p>
                <p className="text-xs text-muted-foreground">Per target share</p>
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
            <strong>Exchange Ratio</strong> = Offer Price per Target Share / Acquirer Share Price
          </p>
          <p>
            The exchange ratio determines how many shares of the acquiring company will be issued for each share of the target company in a stock-for-stock transaction.
          </p>
          <p>
            <strong>Alternative: EPS-Based Exchange Ratio</strong> = Target's EPS / Acquirer's EPS
          </p>
          <p>This method ensures earnings neutrality, where the combined EPS equals the acquirer's pre-merger EPS.</p>
          <p>The exchange ratio directly affects ownership distribution in the combined entity and should be validated against similar transactions and relative valuations.</p>
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
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div className="p-4 border rounded">
                <p className="text-sm text-muted-foreground">Acquirer Share Price</p>
                <p className="text-xl font-semibold text-primary">${result.acquirerSharePrice.toLocaleString()}</p>
                <p className="text-xs text-muted-foreground">Current market price</p>
              </div>
              <div className="p-4 border rounded">
                <p className="text-sm text-muted-foreground">Shares per Target Share</p>
                <p className="text-xl font-semibold text-primary">{result.exchangeRatio.toFixed(4)}</p>
                <p className="text-xs text-muted-foreground">Exchange ratio</p>
              </div>
            </div>
          ) : (
            <p className="text-sm text-muted-foreground">Enter your M&A transaction parameters to see additional insights.</p>
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
        <meta itemProp="name" content="The Complete Guide to Merger Exchange Ratio: Stock-for-Stock M&A Transactions" />
        <meta itemProp="description" content="An in-depth guide on calculating exchange ratios in stock-for-stock M&A transactions, determining ownership distribution, and validating exchange ratios." />
        <meta itemProp="keywords" content="merger exchange ratio, stock for stock merger, M&A exchange ratio, acquisition exchange ratio, ownership distribution" />
        <meta itemProp="author" content="[Your Site's Finance Team]" />
        <meta itemProp="datePublished" content="2025-12-02" />
        <meta itemProp="url" content="/finance/merger-exchange-ratio-calculator" />

        <h1 className="text-3xl md:text-4xl font-extrabold text-foreground mb-4" itemProp="headline">The Complete Guide to Merger Exchange Ratio: Stock-for-Stock M&A Transactions</h1>
        <p className="text-lg italic text-gray-700 dark:text-gray-300">A deep dive into how exchange ratios are set, how they drive ownership, and how to validate fairness for both buyer and seller.</p>

        <h2 className="text-2xl font-bold text-foreground mt-8 mb-4">Table of Contents: Jump to a Section</h2>
        <ul className="list-disc ml-6 space-y-2 text-blue-600 dark:text-blue-400">
          <li><a href="#basics" className="hover:underline">Exchange Ratio Basics and Why It Matters</a></li>
          <li><a href="#formulas" className="hover:underline">Core Formulas: Price-Based and EPS-Based</a></li>
          <li><a href="#drivers" className="hover:underline">Drivers: Premiums, Synergies, and Market Conditions</a></li>
          <li><a href="#ownership" className="hover:underline">Ownership and Control After the Deal</a></li>
          <li><a href="#risk" className="hover:underline">Risk Mitigations: Collars and Walk-Aways</a></li>
          <li><a href="#validation" className="hover:underline">Validation Checklist and Benchmarks</a></li>
          <li><a href="#playbook" className="hover:underline">Execution Playbook</a></li>
        </ul>
        <hr className="my-6" />

        <h2 id="basics" className="text-2xl font-bold text-foreground pt-8" itemProp="articleSection">Exchange Ratio Basics and Why It Matters</h2>
        <p>The exchange ratio dictates how many acquirer shares a target shareholder receives. It directly sets post-deal ownership, EPS impact, and perceived fairness. A small change in the ratio can swing who controls the combined company.</p>

        <h2 id="formulas" className="text-2xl font-bold text-foreground pt-8" itemProp="articleSection">Core Formulas: Price-Based and EPS-Based</h2>
        <div className="bg-gray-100 dark:bg-gray-800 p-4 rounded-lg my-4">
          <p className="font-mono text-lg"><strong>Price Exchange Ratio = Offer Price per Target Share / Acquirer Share Price</strong></p>
          <p className="font-mono text-lg"><strong>EPS-Neutral Ratio = Target EPS / Acquirer EPS</strong></p>
        </div>
        <p>Price-based ratios anchor on market prices and premiums; EPS-based ratios aim to keep combined EPS flat to avoid dilution. Bankers often evaluate both to balance market optics and accretion/dilution.</p>

        <h2 id="drivers" className="text-2xl font-bold text-foreground pt-8" itemProp="articleSection">Drivers: Premiums, Synergies, and Market Conditions</h2>
        <ul className="list-disc ml-6 space-y-2">
          <li><strong>Offer Premium:</strong> Higher premiums push the ratio up in favor of target holders.</li>
          <li><strong>Synergies:</strong> Strong cost/revenue synergies justify richer ratios if value will be shared.</li>
          <li><strong>Relative Valuation:</strong> P/E, EV/EBITDA, and growth differentials inform fairness.</li>
          <li><strong>Volatility:</strong> High acquirer volatility increases pressure for collars to stabilize value.</li>
        </ul>

        <h2 id="ownership" className="text-2xl font-bold text-foreground pt-8" itemProp="articleSection">Ownership and Control After the Deal</h2>
        <div className="bg-gray-100 dark:bg-gray-800 p-4 rounded-lg my-4">
          <p className="font-mono text-lg"><strong>Target Ownership % = (Ratio Ã— Target Shares) / (Acquirer Shares + Ratio Ã— Target Shares)</strong></p>
        </div>
        <p>Run scenarios to see how the ratio shifts combined voting power, board seats, and governance. Slight ratio changes can flip majority control.</p>

        <h2 id="risk" className="text-2xl font-bold text-foreground pt-8" itemProp="articleSection">Risk Mitigations: Collars and Walk-Aways</h2>
        <p>Collars bound the effective price if the acquirerâ€™s stock moves. Fixed-share deals without collars transfer market risk to the target; fixed-value deals do the opposite. Walk-away clauses protect if prices move outside agreed bands.</p>

        <h2 id="validation" className="text-2xl font-bold text-foreground pt-8" itemProp="articleSection">Validation Checklist and Benchmarks</h2>
        <ul className="list-disc ml-6 space-y-2">
          <li>Benchmark against precedent transactions (sector, size, premium).</li>
          <li>Test EPS accretion/dilution and pro forma leverage.</li>
          <li>Model sensitivity to acquirer price Â±10â€“20% and to synergy delivery.</li>
          <li>Review fairness opinions and market reaction at announcement.</li>
        </ul>

        <h2 id="playbook" className="text-2xl font-bold text-foreground pt-8" itemProp="articleSection">Execution Playbook</h2>
        <ol className="list-decimal ml-6 space-y-2">
          <li>Set valuation ranges and target premium bands.</li>
          <li>Compute price and EPS-neutral ratios; compare outcomes.</li>
          <li>Draft collar terms if volatility is high; align on walk-aways.</li>
          <li>Run ownership, EPS, and synergy-sharing scenarios.</li>
          <li>Validate vs. comps and precedents; negotiate final ratio.</li>
        </ol>

        <h2 className="text-2xl font-bold text-foreground pt-8" itemProp="articleSection">Conclusion</h2>
        <p>The exchange ratio is the fulcrum of stock-for-stock M&A. Anchor it with market prices, test EPS neutrality, protect with collars when volatility is high, and validate against comps and accretion/dilution. Small tweaks materially shift value and controlâ€”model thoroughly before signing.</p>
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
          <p>This tool calculates exchange ratio in stock-for-stock M&A transactions by dividing offer price per target share by acquirer share price.</p>
          <p>Outputs include exchange ratio, interpretation, recommendations, an action plan, and supporting metrics.</p>
          <p>Formula, steps, guide content, related tools, and FAQs ensure humans or AI assistants can interpret the methodology instantly.</p>
        </CardContent>
      </Card>
    </div>
  );
}


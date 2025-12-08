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
  preMoneyValuation: z.number({ invalid_type_error: 'Enter pre-money valuation' }).min(0),
  investmentAmount: z.number({ invalid_type_error: 'Enter investment amount' }).min(0),
});

type FormValues = z.infer<typeof formSchema>;

type ResultPayload = {
  preMoneyValuation: number;
  investmentAmount: number;
  postMoneyValuation: number;
  investorOwnership: number;
  founderOwnership: number;
  interpretation: string;
  status: 'optimal' | 'good' | 'moderate' | 'low';
  recommendations: string[];
  plan: { label: string; detail: string }[];
};

const steps = [
  'Enter pre-money valuation (company value before new investment).',
  'Enter investment amount (new capital raised).',
  'Review post-money valuation and ownership percentages.',
];

const faqs = [
  {
    question: 'What is pre-money valuation?',
    answer: 'Pre-money valuation is the value of the company immediately before receiving new investment. It excludes the new capital being raised.',
  },
  {
    question: 'What is post-money valuation?',
    answer: 'Post-money valuation = Pre-money valuation + Investment amount. It reflects the company value immediately after the new capital is added.',
  },
  {
    question: 'How is investor ownership calculated?',
    answer: 'Investor ownership % = Investment amount / Post-money valuation. This is the percentage of the company the new investor receives.',
  },
  {
    question: 'How is founder ownership affected?',
    answer: 'Founder ownership after the round = 1 - Investor ownership (ignoring option pool changes). Raising new capital dilutes existing shareholders.',
  },
  {
    question: 'What is a typical dilution range?',
    answer: 'Typical dilution per round: Seed 10-25%, Series A 15-25%, Series B 10-20%. Actual percentages vary by market and traction.',
  },
  {
    question: 'How do option pools affect ownership?',
    answer: 'If an option pool is created/expanded pre-money, founders are diluted further. This calculator assumes no option pool changes; add pool dilution separately if needed.',
  },
  {
    question: 'How do convertible notes/SAFEs affect ownership?',
    answer: 'Convertible instruments convert into equity at the round, increasing the fully diluted share count and diluting founders. Include these in a full cap table for accuracy.',
  },
  {
    question: 'How to validate valuations?',
    answer: 'Compare to market comps, revenue multiples, growth rate, and round benchmarks. Ensure the raise amount aligns with runway and milestones.',
  },
];

const relatedCalculators = [
  { name: 'Founder Dilution Calculator (by Funding Round)', slug: 'founder-dilution-calculator', description: 'Model founder dilution across rounds.' },
  { name: 'SAFE / Convertible Note Conversion Calculator', slug: 'safe-convertible-note-conversion-calculator', description: 'Model SAFE/note conversion to equity.' },
  { name: 'Equity Cap Table Generator', slug: 'equity-cap-table-generator', description: 'Build cap tables with ownership splits.' },
  { name: 'LBO (Leveraged Buyout) Return Calculator', slug: 'lbo-leveraged-buyout-return-calculator', description: 'Compute MOIC and IRR for LBOs.' },
];

const baseUrl = 'https://mycalculating.com/category/finance/startup-valuation-post-money-pre-money-calculator';

const schemaMarkup = {
  '@context': 'https://schema.org',
  '@graph': [
    {
      '@type': 'BreadcrumbList',
      itemListElement: [
        { '@type': 'ListItem', position: 1, name: 'Home', item: 'https://mycalculating.com' },
        { '@type': 'ListItem', position: 2, name: 'Finance', item: 'https://mycalculating.com/category/finance' },
        { '@type': 'ListItem', position: 3, name: 'Startup Valuation (Post-Money / Pre-Money) Calculator', item: baseUrl },
      ],
    },
    {
      '@type': 'SoftwareApplication',
      name: 'Startup Valuation (Post-Money / Pre-Money) Calculator',
      applicationCategory: 'Calculator',
      operatingSystem: 'Web Browser',
      description: 'Calculate pre-money and post-money valuation and resulting ownership percentages for startup funding rounds.',
      url: baseUrl,
      offers: { '@type': 'Offer', price: '0', priceCurrency: 'USD' },
    },
  ],
};

const calculateResult = (values: FormValues): ResultPayload => {
  const preMoneyValuation = values.preMoneyValuation;
  const investmentAmount = values.investmentAmount;
  const postMoneyValuation = preMoneyValuation + investmentAmount;

  const investorOwnership = postMoneyValuation > 0 ? investmentAmount / postMoneyValuation : 0;
  const founderOwnership = 1 - investorOwnership;

  let status: ResultPayload['status'] = 'optimal';
  let interpretation = '';

  if (investorOwnership <= 0) {
    status = 'low';
    interpretation = 'No ownership allocated to investor. Check inputs.';
  } else if (investorOwnership < 0.1) {
    status = 'moderate';
    interpretation = 'Investor ownership below 10% is low; ensure raise size meets needs.';
  } else if (investorOwnership <= 0.25) {
    status = 'good';
    interpretation = 'Investor ownership 10-25% is typical for many seed/Series A rounds.';
  } else {
    status = 'optimal';
    interpretation = 'Investor ownership above 25% suggests significant dilution; acceptable if capital and terms justify it.';
  }

  const recommendations = [
    `Post-money valuation: ${postMoneyValuation.toLocaleString()}. Investor ownership: ${(investorOwnership * 100).toFixed(1)}%. Founder ownership: ${(founderOwnership * 100).toFixed(1)}%.`,
    'Validate raise size vs. runway and milestones. Ensure dilution aligns with founder goals and future rounds.',
    'If option pool expansion is required pre-money, account for additional dilution separately.',
    'Consider SAFE/note conversions when building the full cap table; this calculator assumes only new equity for the raise.',
  ];

  const plan = [
    { label: 'This Week', detail: `Compute post-money ${postMoneyValuation.toLocaleString()} and ownership splits. Confirm raise size vs. runway.` },
    { label: 'This Month', detail: 'Model option pool expansion and SAFE/note conversions in a full cap table. Compare dilution to benchmarks.' },
    { label: 'Ongoing', detail: 'Update valuations and dilution scenarios as terms evolve. Track cumulative dilution across rounds.' },
  ];

  return { preMoneyValuation, investmentAmount, postMoneyValuation, investorOwnership, founderOwnership, interpretation, status, recommendations, plan };
};

export default function StartupValuationPostMoneyPreMoneyCalculator() {
  const [result, setResult] = useState<ResultPayload | null>(null);

  const form = useForm<FormValues>({
    resolver: zodResolver(formSchema),
    defaultValues: {
      preMoneyValuation: undefined,
      investmentAmount: undefined,
    },
  });

  return (
    <div className="space-y-8">
      <Script id="startup-valuation-schema" type="application/ld+json" strategy="afterInteractive" dangerouslySetInnerHTML={{ __html: JSON.stringify(schemaMarkup) }} />

      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <Heart className="h-5 w-5" />
            Startup Valuation (Post-Money / Pre-Money) Calculator
          </CardTitle>
          <CardDescription>Calculate post-money valuation and ownership percentages from pre-money valuation and new investment.</CardDescription>
        </CardHeader>
      </Card>

      <Card>
        <CardHeader>
          <CardTitle>Input your round details</CardTitle>
        </CardHeader>
        <CardContent>
          <Form {...form}>
            <form onSubmit={form.handleSubmit((values) => setResult(calculateResult(values)))} className="space-y-6">
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <FormField
                  control={form.control}
                  name="preMoneyValuation"
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel>Pre-Money Valuation</FormLabel>
                      <FormControl>
                        <Input type="number" step="0.01" placeholder="e.g., 5000000" value={field.value ?? ''} onChange={(e) => field.onChange(e.target.value === '' ? undefined : Number(e.target.value))} />
                      </FormControl>
                      <FormMessage />
                    </FormItem>
                  )}
                />
                <FormField
                  control={form.control}
                  name="investmentAmount"
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel>Investment Amount</FormLabel>
                      <FormControl>
                        <Input type="number" step="0.01" placeholder="e.g., 1000000" value={field.value ?? ''} onChange={(e) => field.onChange(e.target.value === '' ? undefined : Number(e.target.value))} />
                      </FormControl>
                      <FormMessage />
                    </FormItem>
                  )}
                />
              </div>
              <Button type="submit" className="w-full md:w-auto">
                Calculate Valuation
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
            <CardDescription>See post-money valuation and ownership percentages.</CardDescription>
          </CardHeader>
          <CardContent className="space-y-6">
            <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
              <div className="p-4 border rounded">
                <p className="text-sm text-muted-foreground">Post-Money Valuation</p>
                <p className="text-2xl font-semibold text-primary">${result.postMoneyValuation.toLocaleString()}</p>
                <p className="text-xs text-muted-foreground">Value after investment</p>
              </div>
              <div className="p-4 border rounded">
                <p className="text-sm text-muted-foreground">Investor Ownership</p>
                <p className="text-2xl font-semibold text-primary">{(result.investorOwnership * 100).toFixed(1)}%</p>
                <p className="text-xs text-muted-foreground">Based on investment</p>
              </div>
              <div className="p-4 border rounded">
                <p className="text-sm text-muted-foreground">Founder Ownership</p>
                <p className="text-2xl font-semibold text-primary">{(result.founderOwnership * 100).toFixed(1)}%</p>
                <p className="text-xs text-muted-foreground">After this round</p>
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
          <p><strong>Post-Money Valuation</strong> = Pre-Money Valuation + Investment Amount</p>
          <p><strong>Investor Ownership %</strong> = Investment Amount / Post-Money Valuation</p>
          <p><strong>Founder Ownership %</strong> = 1 - Investor Ownership %</p>
          <p>This calculator assumes no option pool changes and no convertible instruments; include those separately for full dilution modeling.</p>
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

      <section className="space-y-6 text-muted-foreground leading-relaxed bg-white dark:bg-gray-900 p-6 md:p-10 rounded-lg shadow-lg" itemScope itemType="https://schema.org/Article">
        <meta itemProp="name" content="The Complete Guide to Startup Valuation: Pre-Money, Post-Money, and Ownership" />
        <meta itemProp="description" content="Calculate pre-money and post-money valuation and resulting ownership percentages for startup funding rounds." />
        <meta itemProp="keywords" content="startup valuation, pre-money, post-money, ownership, dilution" />
        <meta itemProp="author" content="[Your Site's Finance Team]" />
        <meta itemProp="datePublished" content="2025-12-02" />
        <meta itemProp="url" content="/category/finance/startup-valuation-post-money-pre-money-calculator" />

        <h1 className="text-3xl md:text-4xl font-extrabold text-foreground mb-4" itemProp="headline">The Complete Guide to Startup Valuation: Pre-Money, Post-Money, and Ownership</h1>
        <p className="text-lg italic text-gray-700 dark:text-gray-300">How to turn round size and valuation into clear ownership outcomes, dilution expectations, and negotiation guardrails.</p>

        <h2 className="text-2xl font-bold text-foreground mt-8 mb-4">Table of Contents: Jump to a Section</h2>
        <ul className="list-disc ml-6 space-y-2 text-blue-600 dark:text-blue-400">
          <li><a href="#definitions" className="hover:underline">Definitions: Pre, Post, and Ownership</a></li>
          <li><a href="#math" className="hover:underline">Core Math and Quick Sense Checks</a></li>
          <li><a href="#dilution" className="hover:underline">Dilution Ranges by Round</a></li>
          <li><a href="#pool" className="hover:underline">Option Pool Placement</a></li>
          <li><a href="#convertibles" className="hover:underline">SAFE/Note and Convertible Impact</a></li>
          <li><a href="#validation" className="hover:underline">Validation and Negotiation Tips</a></li>
          <li><a href="#playbook" className="hover:underline">Execution Playbook</a></li>
        </ul>
        <hr className="my-6" />

        <h2 id="definitions" className="text-2xl font-bold text-foreground pt-8" itemProp="articleSection">Definitions: Pre, Post, and Ownership</h2>
        <p><strong>Pre-money</strong> is value before new cash; <strong>Post-money</strong> = Pre + Raise. <strong>Investor %</strong> = Raise / Post. <strong>Founder %</strong> = 1 - Investor % (before pool/convertibles).</p>

        <h2 id="math" className="text-2xl font-bold text-foreground pt-8" itemProp="articleSection">Core Math and Quick Sense Checks</h2>
        <div className="bg-gray-100 dark:bg-gray-800 p-4 rounded-lg my-4">
          <p className="font-mono text-lg"><strong>Post = Pre + Investment</strong></p>
          <p className="font-mono text-lg"><strong>Investor % = Investment / Post</strong></p>
        </div>
        <p>Check: If investment is 20% of pre, post = 1.2× pre and investor ownership ~16.7%.</p>

        <h2 id="dilution" className="text-2xl font-bold text-foreground pt-8" itemProp="articleSection">Dilution Ranges by Round</h2>
        <p>Typical ranges: Seed 10–25%, Series A 15–25%, Series B 10–20%. Outliers can be justified by large raises or strategic capital—ensure milestones warrant the dilution.</p>

        <h2 id="pool" className="text-2xl font-bold text-foreground pt-8" itemProp="articleSection">Option Pool Placement</h2>
        <p>Pre-money pools dilute founders and effectively reduce pre-money valuation. Negotiate whether the refresh is pre- or post-money, and model the true ownership impact.</p>

        <h2 id="convertibles" className="text-2xl font-bold text-foreground pt-8" itemProp="articleSection">SAFE/Note and Convertible Impact</h2>
        <p>SAFEs/notes convert at the priced round using caps/discounts, adding shares before calculating ownership. Include them—and any accrued interest—in a full cap table to avoid surprise dilution.</p>

        <h2 id="validation" className="text-2xl font-bold text-foreground pt-8" itemProp="articleSection">Validation and Negotiation Tips</h2>
        <ul className="list-disc ml-6 space-y-2">
          <li>Benchmark valuation to comps and stage-appropriate revenue multiples.</li>
          <li>Size the round for 18–24 months runway and milestone delivery.</li>
          <li>Check cumulative dilution across planned rounds; avoid over-diluting early.</li>
          <li>Clarify who bears pool dilution and how convertibles slot in.</li>
        </ul>

        <h2 id="playbook" className="text-2xl font-bold text-foreground pt-8" itemProp="articleSection">Execution Playbook</h2>
        <ol className="list-decimal ml-6 space-y-2">
          <li>Input pre and raise; compute post and investor %.</li>
          <li>Overlay pool (pre/post) and convertibles in a cap table.</li>
          <li>Run alternative raise sizes vs. dilution and runway.</li>
          <li>Benchmark to stage norms; adjust valuation/ask.</li>
          <li>Negotiate pool placement and convertible treatment explicitly.</li>
        </ol>

        <h2 className="text-2xl font-bold text-foreground pt-8" itemProp="articleSection">Conclusion</h2>
        <p>Pre/post math is the backbone of fundraising. Model pools and convertibles, test dilution vs. runway, and negotiate with clarity on who bears which dilution.</p>
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
          <p>This tool calculates post-money valuation and ownership percentages from pre-money valuation and investment amount.</p>
          <p>Outputs include post-money valuation, investor and founder ownership, interpretation, recommendations, and an action plan.</p>
          <p>Formula, steps, guide content, related tools, and FAQs ensure humans or AI assistants can interpret the methodology instantly.</p>
        </CardContent>
      </Card>
    </div>
  );
}


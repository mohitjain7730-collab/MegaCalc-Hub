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
  currentFounderOwnershipPercent: z.number({ invalid_type_error: 'Enter founder ownership %' }).min(0).max(100),
  preMoneyValuation: z.number({ invalid_type_error: 'Enter pre-money valuation' }).min(0),
  investmentAmount: z.number({ invalid_type_error: 'Enter investment amount' }).min(0),
});

type FormValues = z.infer<typeof formSchema>;

type ResultPayload = {
  currentFounderOwnershipPercent: number;
  preMoneyValuation: number;
  investmentAmount: number;
  postMoneyValuation: number;
  dilutionPercent: number;
  newFounderOwnershipPercent: number;
  investorOwnershipPercent: number;
  interpretation: string;
  status: 'optimal' | 'good' | 'moderate' | 'low';
  recommendations: string[];
  plan: { label: string; detail: string }[];
};

const steps = [
  'Enter current founder ownership percentage (fully diluted).',
  'Enter pre-money valuation for the upcoming round.',
  'Enter investment amount for the round.',
  'Review dilution, new founder ownership, and investor ownership.',
];

const faqs = [
  {
    question: 'How is dilution calculated?',
    answer:
      'Dilution = Investment / Post-Money Valuation. New founder ownership = Current founder ownership Ã— (1 - Dilution). Investor ownership = Dilution percentage.',
  },
  {
    question: 'What is post-money valuation?',
    answer:
      'Post-money valuation = Pre-money valuation + Investment. Ownership percentages are calculated on a post-money basis.',
  },
  {
    question: 'How do multiple rounds affect dilution?',
    answer:
      'Each round dilutes existing holders. Track cumulative dilution across rounds to understand how founder ownership changes over time.',
  },
  {
    question: 'What is a typical dilution range per round?',
    answer:
      'Typical ranges: Seed 10â€“25%, Series A 20â€“25%, Series B 15â€“20%, later rounds 10â€“15%. Actual dilution depends on capital needs and valuation.',
  },
  {
    question: 'How does option pool expansion affect dilution?',
    answer:
      'Option pool expansions dilute existing holders. If expanded pre-money, founders bear more dilution; if post-money, dilution is shared. This calculator assumes no new pool expansion; include it in the dilution if applicable.',
  },
  {
    question: 'How do I model multiple rounds?',
    answer:
      'Run this calculator sequentially for each round, updating founder ownership after each step. Track cumulative dilution across rounds.',
  },
  {
    question: 'What if founder ownership is already low?',
    answer:
      'Founders may negotiate higher valuations, smaller rounds, or staged tranches to preserve ownership. Consider hiring plans and option pool needs when balancing dilution.',
  },
  {
    question: 'How do I validate assumptions?',
    answer:
      'Validate valuations against market comps, revenue multiples, and growth metrics. Ensure round size meets capital needs while keeping ownership targets realistic.',
  },
  {
    question: 'What is fully diluted ownership?',
    answer:
      'Fully diluted ownership includes all outstanding shares plus options, warrants, and convertibles. Use fully diluted percentages for accurate dilution modeling.',
  },
  {
    question: 'How do I include SAFEs/notes?',
    answer:
      'This simple model excludes convertibles. Use the SAFE/Convertible Note Conversion Calculator to estimate converted shares and include them before dilution.',
  },
];

const relatedCalculators = [
  {
    name: 'Startup Valuation (Post-Money / Pre-Money) Calculator',
    slug: 'startup-valuation-post-money-pre-money-calculator',
    description: 'Calculate valuation and ownership splits.',
  },
  {
    name: 'SAFE / Convertible Note Conversion Calculator',
    slug: 'safe-convertible-note-conversion-calculator',
    description: 'Convert SAFEs/notes into equity at a priced round.',
  },
  {
    name: 'Equity Cap Table Generator',
    slug: 'equity-cap-table-generator',
    description: 'Build a simple cap table.',
  },
  {
    name: 'LBO (Leveraged Buyout) Return Calculator',
    slug: 'lbo-leveraged-buyout-return-calculator',
    description: 'Calculate MOIC and IRR for buyouts.',
  },
];

const baseUrl = 'https://mycalculating.com/finance/founder-dilution-calculator-by-funding-round';

const schemaMarkup = {
  '@context': 'https://schema.org',
  '@graph': [
    {
      '@type': 'BreadcrumbList',
      itemListElement: [
        { '@type': 'ListItem', position: 1, name: 'Home', item: 'https://mycalculating.com' },
        { '@type': 'ListItem', position: 2, name: 'Finance', item: 'https://mycalculating.com/finance' },
        { '@type': 'ListItem', position: 3, name: 'Founder Dilution Calculator (by Funding Round)', item: baseUrl },
      ],
    },
    {
      '@type': 'SoftwareApplication',
      name: 'Founder Dilution Calculator (by Funding Round)',
      applicationCategory: 'Calculator',
      operatingSystem: 'Web Browser',
      description: 'Model founder dilution per funding round using pre-money valuation and investment amount.',
      url: baseUrl,
      offers: { '@type': 'Offer', price: '0', priceCurrency: 'USD' },
    },
  ],
};

const calculateResult = (values: FormValues): ResultPayload => {
  const preMoneyValuation = values.preMoneyValuation;
  const investmentAmount = values.investmentAmount;
  const postMoneyValuation = preMoneyValuation + investmentAmount;

  const dilutionPercent = postMoneyValuation > 0 ? investmentAmount / postMoneyValuation : 0;
  const newFounderOwnershipPercent = (values.currentFounderOwnershipPercent / 100) * (1 - dilutionPercent) * 100;
  const investorOwnershipPercent = dilutionPercent * 100;

  let status: ResultPayload['status'] = 'optimal';
  let interpretation = '';

  if (dilutionPercent <= 0) {
    status = 'low';
    interpretation = 'No dilution calculated. Ensure investment and valuation inputs are positive.';
  } else if (investorOwnershipPercent > 30) {
    status = 'moderate';
    interpretation = 'Dilution above 30% in a single round is high. Negotiate valuation or stage funding to reduce dilution.';
  } else if (investorOwnershipPercent < 10) {
    status = 'moderate';
    interpretation = 'Dilution below 10% may indicate a small round or high valuation. Ensure capital raised meets runway needs.';
  } else {
    status = 'optimal';
    interpretation = 'Dilution within common ranges for many early-stage rounds (10â€“30%).';
  }

  const recommendations = [
    `Post-money valuation: ${postMoneyValuation.toLocaleString()}. Investor ownership: ${investorOwnershipPercent.toFixed(2)}%. Founder ownership after round: ${newFounderOwnershipPercent.toFixed(2)}% (from ${values.currentFounderOwnershipPercent.toFixed(2)}%).`,
    'Track cumulative dilution across rounds. Use this calculator sequentially as you raise additional capital.',
    'If a pool refresh is required pre-money, founders will bear more dilution; model that separately if applicable.',
  ];

  if (investorOwnershipPercent > 30) {
    recommendations.push('Consider increasing valuation or reducing round size to keep dilution manageable.');
  }

  const plan = [
    { label: 'This Week', detail: `Compute dilution: ${investorOwnershipPercent.toFixed(2)}% investor, ${newFounderOwnershipPercent.toFixed(2)}% founder after round. Align expectations with investors.` },
    { label: 'This Month', detail: 'Validate valuation vs. market comps and milestones. Plan for option pool needs and potential refresh before closing the round.' },
    { label: 'Ongoing', detail: 'Update dilution modeling for future rounds. Track cumulative impact on founder ownership and key hires via the option pool.' },
  ];

  return { currentFounderOwnershipPercent: values.currentFounderOwnershipPercent, preMoneyValuation, investmentAmount, postMoneyValuation, dilutionPercent, newFounderOwnershipPercent, investorOwnershipPercent, interpretation, status, recommendations, plan };
};

export default function FounderDilutionCalculatorByFundingRound() {
  const [result, setResult] = useState<ResultPayload | null>(null);

  const form = useForm<FormValues>({
    resolver: zodResolver(formSchema),
    defaultValues: {
      currentFounderOwnershipPercent: undefined,
      preMoneyValuation: undefined,
      investmentAmount: undefined,
    },
  });

  return (
    <div className="space-y-8">
      <Script id="founder-dilution-schema" type="application/ld+json" strategy="afterInteractive" dangerouslySetInnerHTML={{ __html: JSON.stringify(schemaMarkup) }} />

      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <Heart className="h-5 w-5" />
            Founder Dilution Calculator (by Funding Round)
          </CardTitle>
          <CardDescription>Model founder dilution per round using pre-money valuation and investment amount.</CardDescription>
        </CardHeader>
      </Card>

      <Card>
        <CardHeader>
          <CardTitle>Input your round parameters</CardTitle>
        </CardHeader>
        <CardContent>
          <Form {...form}>
            <form onSubmit={form.handleSubmit((values) => setResult(calculateResult(values)))} className="space-y-6">
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <FormField
                  control={form.control}
                  name="currentFounderOwnershipPercent"
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel>Current Founder Ownership (%)</FormLabel>
                      <FormControl>
                        <Input type="number" step="0.1" placeholder="e.g., 70" value={field.value ?? ''} onChange={(e) => field.onChange(e.target.value === '' ? undefined : Number(e.target.value))} />
                      </FormControl>
                      <FormMessage />
                    </FormItem>
                  )}
                />
                <FormField
                  control={form.control}
                  name="preMoneyValuation"
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel>Pre-Money Valuation</FormLabel>
                      <FormControl>
                        <Input type="number" step="0.01" placeholder="e.g., 8000000" value={field.value ?? ''} onChange={(e) => field.onChange(e.target.value === '' ? undefined : Number(e.target.value))} />
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
                        <Input type="number" step="0.01" placeholder="e.g., 2000000" value={field.value ?? ''} onChange={(e) => field.onChange(e.target.value === '' ? undefined : Number(e.target.value))} />
                      </FormControl>
                      <FormMessage />
                    </FormItem>
                  )}
                />
              </div>
              <Button type="submit" className="w-full md:w-auto">
                Calculate Dilution
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
            <CardDescription>See dilution and new ownership percentages.</CardDescription>
          </CardHeader>
          <CardContent className="space-y-6">
            <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
              <div className="p-4 border rounded">
                <p className="text-sm text-muted-foreground">Post-Money Valuation</p>
                <p className="text-2xl font-semibold text-primary">${result.postMoneyValuation.toLocaleString()}</p>
                <p className="text-xs text-muted-foreground">Pre + investment</p>
              </div>
              <div className="p-4 border rounded">
                <p className="text-sm text-muted-foreground">Investor Ownership</p>
                <p className="text-2xl font-semibold text-primary">{result.investorOwnershipPercent.toFixed(2)}%</p>
                <p className="text-xs text-muted-foreground">Dilution this round</p>
              </div>
              <div className="p-4 border rounded">
                <p className="text-sm text-muted-foreground">Founder Ownership</p>
                <p className="text-2xl font-semibold text-primary">{result.newFounderOwnershipPercent.toFixed(2)}%</p>
                <p className="text-xs text-muted-foreground">After this round</p>
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
          <p><strong>Post-Money</strong> = Pre-Money + Investment</p>
          <p><strong>Dilution</strong> = Investment / Post-Money</p>
          <p><strong>New Founder Ownership %</strong> = Current Founder % Ã— (1 - Dilution)</p>
          <p><strong>Investor Ownership %</strong> = Dilution Ã— 100</p>
          <p>Ownership percentages are on a fully diluted, post-money basis.</p>
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
        <meta itemProp="name" content="The Complete Guide to Founder Dilution by Funding Round" />
        <meta itemProp="description" content="Model founder dilution per funding round using pre-money valuation and investment amount, and track post-round ownership." />
        <meta itemProp="keywords" content="founder dilution, startup dilution, funding round dilution, post-money ownership" />
        <meta itemProp="author" content="[Your Site's Finance Team]" />
        <meta itemProp="datePublished" content="2025-12-02" />
        <meta itemProp="url" content="/founder-dilution-calculator-by-funding-round" />

        <h1 className="text-3xl md:text-4xl font-extrabold text-foreground mb-4" itemProp="headline">The Complete Guide to Founder Dilution by Funding Round</h1>
        <p className="text-lg italic text-gray-700 dark:text-gray-300">Understand how each funding round dilutes founder ownership using pre-money valuation and investment amount.</p>

        <h2 className="text-2xl font-bold text-foreground mt-8 mb-4">Table of Contents: Jump to a Section</h2>
        <ul className="list-disc ml-6 space-y-2 text-blue-600 dark:text-blue-400">
          <li><a href="#basics" className="hover:underline">Dilution Basics</a></li>
          <li><a href="#calculation" className="hover:underline">Dilution Calculation</a></li>
          <li><a href="#ranges" className="hover:underline">Typical Dilution Ranges</a></li>
          <li><a href="#pool" className="hover:underline">Option Pool Impact</a></li>
          <li><a href="#validation" className="hover:underline">Validation and Best Practices</a></li>
        </ul>
        <hr className="my-6" />

        <h2 id="basics" className="text-2xl font-bold text-foreground pt-8" itemProp="articleSection">Dilution Basics</h2>
        <p>Dilution reflects how new investment reduces existing holders' ownership. It is driven by the investment relative to post-money valuation.</p>

        <hr className="my-6" />

        <h2 id="calculation" className="text-2xl font-bold text-foreground pt-8" itemProp="articleSection">Dilution Calculation</h2>
        <p>Post-money = Pre-money + Investment. Dilution = Investment / Post-money. New founder ownership = Current founder % Ã— (1 - Dilution).</p>

        <hr className="my-6" />

        <h2 id="ranges" className="text-2xl font-bold text-foreground pt-8" itemProp="articleSection">Typical Dilution Ranges</h2>
        <p>Seed 10â€“25%, Series A 20â€“25%, Series B 15â€“20%, later rounds 10â€“15%. Actual ranges vary by capital needs and valuation.</p>

        <hr className="my-6" />

        <h2 id="pool" className="text-2xl font-bold text-foreground pt-8" itemProp="articleSection">Option Pool Impact</h2>
        <p>Pool expansions dilute existing holders. If expanded pre-money, founders bear more dilution; post-money expansions share dilution. Model pool changes alongside investment.</p>

        <hr className="my-6" />

        <h2 id="validation" className="text-2xl font-bold text-foreground pt-8" itemProp="articleSection">Validation and Best Practices</h2>
        <p>Validate valuation with comps and milestones; track cumulative dilution; and include convertibles (SAFEs/notes) by converting them before modeling dilution.</p>

        <hr className="my-6" />

        <h2 className="text-2xl font-bold text-foreground pt-8" itemProp="articleSection">Conclusion</h2>
        <p>Model each roundâ€™s dilution to preserve clarity on ownership. Align valuation, round size, and option pool needs to keep founder and investor interests balanced.</p>
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
          <p>This tool models founder dilution per round using pre-money valuation and investment amount.</p>
          <p>Outputs include dilution, investor ownership, new founder ownership, interpretation, recommendations, an action plan, and supporting metrics.</p>
          <p>Formula, steps, guide content, related tools, and FAQs ensure humans or AI assistants can interpret the methodology instantly.</p>
        </CardContent>
      </Card>
    </div>
  );
}

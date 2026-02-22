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
  preRoundOwnership: z.number({ invalid_type_error: 'Enter founder ownership %' }).min(0).max(100),
  preMoneyValuation: z.number({ invalid_type_error: 'Enter pre-money valuation' }).min(0),
  investmentAmount: z.number({ invalid_type_error: 'Enter investment amount' }).min(0),
});

type FormValues = z.infer<typeof formSchema>;

type ResultPayload = {
  preRoundOwnership: number;
  preMoneyValuation: number;
  investmentAmount: number;
  postMoneyValuation: number;
  investorOwnership: number;
  founderOwnershipPost: number;
  dilution: number;
  interpretation: string;
  status: 'optimal' | 'good' | 'moderate' | 'low';
  recommendations: string[];
  plan: { label: string; detail: string }[];
};

const steps = [
  'Enter current founder ownership % before the round.',
  'Enter pre-money valuation.',
  'Enter investment amount.',
  'Review post-money ownership and dilution.',
];

const faqs = [
  { question: 'What is dilution?', answer: 'Dilution is the reduction in an existing ownerâ€™s percentage ownership when new shares are issued.' },
  { question: 'How is dilution calculated?', answer: 'Dilution % = (Pre-round ownership - Post-round ownership) / Pre-round ownership.' },
  { question: 'What are typical dilution ranges?', answer: 'Seed 10-25%, Series A 15-25%, Series B 10-20%. Varies by market and traction.' },
  { question: 'How do option pools affect dilution?', answer: 'A pre-money pool expansion dilutes founders further. This calculator assumes no new pool; add separately if needed.' },
  { question: 'How do SAFEs/notes affect dilution?', answer: 'They convert into equity at the round, increasing share count and dilution. Model in a full cap table for precision.' },
  { question: 'How to limit dilution?', answer: 'Raise only the capital needed, negotiate valuation, stage capital, and plan option pool timing.' },
];

const relatedCalculators = [
  { name: 'Startup Valuation (Post-Money / Pre-Money) Calculator', slug: 'startup-valuation-post-money-pre-money-calculator', description: 'Compute post-money valuation and ownership.' },
  { name: 'SAFE / Convertible Note Conversion Calculator', slug: 'safe-convertible-note-conversion-calculator', description: 'Model SAFE/note conversion to equity.' },
  { name: 'Equity Cap Table Generator', slug: 'equity-cap-table-generator', description: 'Build cap tables with ownership splits.' },
  { name: 'LBO (Leveraged Buyout) Return Calculator', slug: 'lbo-leveraged-buyout-return-calculator', description: 'Compute MOIC and IRR for LBOs.' },
];

const baseUrl = 'https://mycalculating.com/finance/founder-dilution-calculator';

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
      description: 'Estimate founder dilution from a funding round using pre-money valuation, investment amount, and current ownership.',
      url: baseUrl,
      offers: { '@type': 'Offer', price: '0', priceCurrency: 'USD' },
    },
  ],
};

const calculateResult = (values: FormValues): ResultPayload => {
  const preRoundOwnershipPct = values.preRoundOwnership / 100;
  const preMoneyValuation = values.preMoneyValuation;
  const investmentAmount = values.investmentAmount;
  const postMoneyValuation = preMoneyValuation + investmentAmount;

  const investorOwnership = postMoneyValuation > 0 ? investmentAmount / postMoneyValuation : 0;
  const founderOwnershipPost = preRoundOwnershipPct * (1 - investorOwnership);
  const dilution = preRoundOwnershipPct > 0 ? (preRoundOwnershipPct - founderOwnershipPost) / preRoundOwnershipPct : 0;

  let status: ResultPayload['status'] = 'optimal';
  let interpretation = '';

  if (investorOwnership <= 0) {
    status = 'low';
    interpretation = 'No ownership allocated to investor. Check inputs.';
  } else if (dilution < 0.1) {
    status = 'good';
    interpretation = 'Dilution below 10% is modest; aligns with small rounds.';
  } else if (dilution <= 0.25) {
    status = 'good';
    interpretation = 'Dilution 10-25% is typical for many rounds.';
  } else {
    status = 'moderate';
    interpretation = 'Dilution above 25% is high; ensure capital and terms justify it.';
  }

  const recommendations = [
    `Post-money valuation: ${postMoneyValuation.toLocaleString()}. Investor ownership: ${(investorOwnership * 100).toFixed(1)}%. Founder ownership after round: ${(founderOwnershipPost * 100).toFixed(1)}%. Dilution: ${(dilution * 100).toFixed(1)}%.`,
    'Validate raise size vs. runway and milestones. High dilution may limit future flexibility.',
    'If an option pool is added pre-money, expect additional dilution. Model in a full cap table.',
    'Include SAFEs/notes in a full model; they convert and dilute founders at the priced round.',
  ];

  const plan = [
    { label: 'This Week', detail: `Calculate dilution ${(dilution * 100).toFixed(1)}% and post-round ownership. Confirm raise size vs. milestones.` },
    { label: 'This Month', detail: 'Model option pool and SAFEs/notes in a full cap table. Compare dilution to benchmarks and negotiate terms if needed.' },
    { label: 'Ongoing', detail: 'Track cumulative dilution across rounds. Update scenarios as valuations and round sizes evolve.' },
  ];

  return {
    preRoundOwnership: values.preRoundOwnership,
    preMoneyValuation,
    investmentAmount,
    postMoneyValuation,
    investorOwnership,
    founderOwnershipPost,
    dilution,
    interpretation,
    status,
    recommendations,
    plan,
  };
};

export default function FounderDilutionCalculator() {
  const [result, setResult] = useState<ResultPayload | null>(null);

  const form = useForm<FormValues>({
    resolver: zodResolver(formSchema),
    defaultValues: {
      preRoundOwnership: undefined,
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
          <CardDescription>Estimate founder dilution from a funding round using pre-money valuation, investment amount, and current ownership.</CardDescription>
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
                  name="preRoundOwnership"
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel>Founder Ownership Before Round (%)</FormLabel>
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
                        <Input type="number" step="0.01" placeholder="e.g., 10000000" value={field.value ?? ''} onChange={(e) => field.onChange(e.target.value === '' ? undefined : Number(e.target.value))} />
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
                        <Input type="number" step="0.01" placeholder="e.g., 3000000" value={field.value ?? ''} onChange={(e) => field.onChange(e.target.value === '' ? undefined : Number(e.target.value))} />
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
            <CardDescription>See post-round ownership and dilution.</CardDescription>
          </CardHeader>
          <CardContent className="space-y-6">
            <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
              <div className="p-4 border rounded">
                <p className="text-sm text-muted-foreground">Investor Ownership</p>
                <p className="text-2xl font-semibold text-primary">{(result.investorOwnership * 100).toFixed(1)}%</p>
                <p className="text-xs text-muted-foreground">Based on raise</p>
              </div>
              <div className="p-4 border rounded">
                <p className="text-sm text-muted-foreground">Founder Ownership After</p>
                <p className="text-2xl font-semibold text-primary">{(result.founderOwnershipPost * 100).toFixed(1)}%</p>
                <p className="text-xs text-muted-foreground">Post-round</p>
              </div>
              <div className="p-4 border rounded">
                <p className="text-sm text-muted-foreground">Dilution</p>
                <p className="text-2xl font-semibold text-primary">{(result.dilution * 100).toFixed(1)}%</p>
                <p className="text-xs text-muted-foreground">Relative to pre-round</p>
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
          <p><strong>Investor Ownership %</strong> = Investment / Post-Money</p>
          <p><strong>Founder Ownership After</strong> = Pre-Round Founder % Ã— (1 - Investor %)</p>
          <p><strong>Dilution %</strong> = (Founder Before - Founder After) / Founder Before</p>
          <p>Assumes no option pool changes or convertibles; include those for full dilution modeling.</p>
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

      <section className="space-y-6 text-muted-foreground leading-relaxed bg-white dark:bg-gray-900 p-6 md:p-10 rounded-lg shadow-lg" itemScope itemType="https://schema.org/Article">
        <meta itemProp="name" content="The Complete Guide to Founder Dilution by Funding Round" />
        <meta itemProp="description" content="Estimate founder dilution from a funding round using pre-money valuation, investment amount, and current ownership." />
        <meta itemProp="keywords" content="founder dilution, startup dilution, funding round dilution" />
        <meta itemProp="author" content="[Your Site's Finance Team]" />
        <meta itemProp="datePublished" content="2025-12-02" />
        <meta itemProp="url" content="/founder-dilution-calculator" />

        <h1 className="text-3xl md:text-4xl font-extrabold text-foreground mb-4" itemProp="headline">The Complete Guide to Founder Dilution by Funding Round</h1>
        <p className="text-lg italic text-gray-700 dark:text-gray-300">Understand how new capital impacts founder ownership and dilution in each round.</p>

        <h2 className="text-2xl font-bold text-foreground mt-8 mb-4">Table of Contents: Jump to a Section</h2>
        <ul className="list-disc ml-6 space-y-2 text-blue-600 dark:text-blue-400">
          <li><a href="#basics" className="hover:underline">Dilution Basics</a></li>
          <li><a href="#math" className="hover:underline">Dilution Math</a></li>
          <li><a href="#benchmarks" className="hover:underline">Typical Dilution Ranges</a></li>
          <li><a href="#pool" className="hover:underline">Option Pool Impact</a></li>
          <li><a href="#notes" className="hover:underline">SAFEs/Notes Impact</a></li>
        </ul>
        <hr className="my-6" />

        <h2 id="basics" className="text-2xl font-bold text-foreground pt-8" itemProp="articleSection">Dilution Basics</h2>
        <p>Dilution reduces existing ownership when new shares are issued. It is inevitable in fundraising but should be planned.</p>

        <h2 id="math" className="text-2xl font-bold text-foreground pt-8" itemProp="articleSection">Dilution Math</h2>
        <p>Investor % = Investment / Post-money. Founder After = Founder Before Ã— (1 - Investor %). Dilution = (Before - After) / Before.</p>

        <h2 id="benchmarks" className="text-2xl font-bold text-foreground pt-8" itemProp="articleSection">Typical Dilution Ranges</h2>
        <p>Seed 10-25%, Series A 15-25%, Series B 10-20%. High dilution should be justified by capital and terms.</p>

        <h2 id="pool" className="text-2xl font-bold text-foreground pt-8" itemProp="articleSection">Option Pool Impact</h2>
        <p>Pre-money option pool expansions dilute founders. Include pool changes in a full cap table for precise modeling.</p>

        <h2 id="notes" className="text-2xl font-bold text-foreground pt-8" itemProp="articleSection">SAFEs/Notes Impact</h2>
        <p>SAFEs/notes convert at the priced round, adding shares and dilution. Model conversions alongside the round.</p>

        <h2 className="text-2xl font-bold text-foreground pt-8" itemProp="articleSection">Conclusion</h2>
        <p>Plan dilution across rounds to maintain founder control and align capital raised with milestones. Use full cap tables for precision.</p>
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
          <p>This tool estimates founder dilution from a funding round using pre-money valuation, investment amount, and current ownership.</p>
          <p>Outputs include investor ownership, founder ownership after the round, dilution %, interpretation, recommendations, and an action plan.</p>
          <p>Formula, steps, guide content, related tools, and FAQs ensure humans or AI assistants can interpret the methodology instantly.</p>
        </CardContent>
      </Card>
    </div>
  );
}


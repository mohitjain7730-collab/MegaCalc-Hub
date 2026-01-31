'use client';

import { useState } from 'react';
import Script from 'next/script';
import Link from 'next/link';
import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import { z } from 'zod';
import { Users, Percent, TrendingDown, Target, Zap, Info, FunctionSquare, Calculator, DollarSign, CheckCircle2, AlertCircle, Briefcase, AlertTriangle, Landmark, Shield } from 'lucide-react';

import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Form, FormControl, FormField, FormItem, FormLabel, FormMessage } from '@/components/ui/form';
import { Input } from '@/components/ui/input';
import { Badge } from '@/components/ui/badge';
import { Alert, AlertDescription } from '@/components/ui/alert';

const formSchema = z.object({
  preMoneyValuation: z.number({ invalid_type_error: 'Enter pre-money valuation' }).min(0),
  investmentAmount: z.number({ invalid_type_error: 'Enter investment amount' }).min(0),
  founderOwnershipBeforePct: z.number({ invalid_type_error: 'Enter founder %' }).min(0).max(100),
  optionPoolPreMoneyPct: z.number({ invalid_type_error: 'Enter option pool %' }).min(0).max(50).optional(),
});

type FormValues = z.infer<typeof formSchema>;

type ResultPayload = {
  postMoneyValuation: number;
  investorOwnershipPct: number;
  founderOwnershipAfterPct: number;
  optionPoolPct: number;
  founderDilutionPct: number;
  interpretation: string;
  recommendation: string;
  status: 'low' | 'moderate' | 'typical' | 'high';
  recommendations: string[];
  insights: string[];
  considerations: string[];
};

const steps = [
  'Enter pre-money valuation for the round.',
  'Enter investment amount (new capital).',
  'Enter founder ownership % before the round (rest = other existing holders).',
  'Optionally enter option pool % allocated pre-money (dilutes founders).',
  'See post-money valuation, investor %, founder % after, and founder dilution.',
];

const faqs = [
  {
    question: 'What is founder dilution after funding?',
    answer: 'Founder dilution is the drop in founder ownership % after a round. New shares go to investors (and optionally an option pool), so founders own a smaller slice of a larger company.',
  },
  {
    question: 'How is post-money valuation used?',
    answer: 'Post-money = pre-money + investment. Investor % = investment / post-money. Founder % after = founder % before × (1 − investor %), then reduced again if option pool is taken pre-money.',
  },
  {
    question: 'Why include option pool pre-money?',
    answer: 'Many rounds add or top up an option pool before the round (pre-money), which dilutes founders. This calculator applies that pool so you see true founder % after the round.',
  },
  {
    question: 'What dilution is typical per round?',
    answer: 'Seed often 10–25%, Series A 15–25%, Series B 10–20%. Higher dilution in one round can limit flexibility in later rounds; model multiple rounds in a cap table for full picture.',
  },
  {
    question: 'How does this differ from Founder Dilution Calculator (by Funding Round)?',
    answer: 'This calculator is focused on the single round outcome: post-funding founder %, optional pre-money option pool, and explicit dilution %. The other is a simpler pre/post ownership view.',
  },
];

const relatedCalculators = [
  { name: 'Founder Dilution Calculator (by Funding Round)', slug: 'founder-dilution-calculator', description: 'Pre/post ownership from one round.' },
  { name: 'Post-Funding Runway Extension Calculator', slug: 'post-funding-runway-extension-calculator', description: 'Runway after the same round.' },
  { name: 'Option Pool Allocation Calculator', slug: 'option-pool-allocation-calculator', description: 'Size option pool and see dilution.' },
  { name: 'Pre-Money / Post-Money Valuation Calculator', slug: 'startup-valuation-post-money-pre-money-calculator', description: 'Valuation and ownership basics.' },
];

const baseUrl = 'https://mycalculating.com/category/finance/founder-dilution-after-funding-calculator';

const schemaMarkup = {
  '@context': 'https://schema.org',
  '@graph': [
    {
      '@type': 'BreadcrumbList',
      itemListElement: [
        { '@type': 'ListItem', position: 1, name: 'Home', item: 'https://mycalculating.com' },
        { '@type': 'ListItem', position: 2, name: 'Finance', item: 'https://mycalculating.com/category/finance' },
        { '@type': 'ListItem', position: 3, name: 'Founder Dilution After Funding Calculator', item: baseUrl },
      ],
    },
    {
      '@type': 'SoftwareApplication',
      name: 'Founder Dilution After Funding Calculator',
      applicationCategory: 'Calculator',
      operatingSystem: 'Web Browser',
      description: 'Calculate founder ownership and dilution after a single funding round, including optional pre-money option pool.',
      url: baseUrl,
      offers: { '@type': 'Offer', price: '0', priceCurrency: 'USD' },
    },
  ],
};

const calculateResult = (values: FormValues): ResultPayload => {
  const preMoney = values.preMoneyValuation;
  const investment = values.investmentAmount;
  const founderBeforePct = values.founderOwnershipBeforePct / 100;
  const optionPoolPct = (values.optionPoolPreMoneyPct ?? 0) / 100;

  const postMoney = preMoney + investment;
  const investorPct = postMoney > 0 ? investment / postMoney : 0;

  // Post-money: investor % = investment / postMoney. Pre-money holders keep same shares; founder % after = founderBeforePct * (1 - investorPct). Option pool (pre-money) = optionPoolPct * (1 - investorPct) of company post-money.
  const founderAfterPct = founderBeforePct * (1 - investorPct);
  const poolSharePct = optionPoolPct * (1 - investorPct);

  const dilutionPct = founderBeforePct > 0 ? ((founderBeforePct - founderAfterPct) / founderBeforePct) * 100 : 0;

  let status: ResultPayload['status'] = 'typical';
  let interpretation = 'Dilution is in a typical range for a single round. Compare to benchmarks for your stage.';

  if (dilutionPct < 5) {
    status = 'low';
    interpretation = 'Very low dilution; small round or high pre-money.';
  } else if (dilutionPct <= 20) {
    status = 'typical';
    interpretation = 'Dilution is typical for many seed/Series A rounds.';
  } else if (dilutionPct <= 30) {
    status = 'moderate';
    interpretation = 'Moderate dilution; ensure round size and use of capital justify it.';
  } else {
    status = 'high';
    interpretation = 'High dilution in one round; model future rounds to avoid over-dilution.';
  }

  let recommendation = 'Validate raise size vs. milestones; model option pool and SAFEs in a full cap table.';
  if (status === 'high') recommendation = 'High dilution in one round; model future rounds to avoid over-dilution.';
  else if (status === 'typical') recommendation = 'Dilution is typical; ensure round size and use of capital justify it.';
  else if (status === 'low') recommendation = 'Low dilution; small round or high pre-money.';

  const recommendations: string[] = [
    `Post-money: $${postMoney.toLocaleString(undefined, { maximumFractionDigits: 0 })}. Investor: ${(investorPct * 100).toFixed(1)}%. Founder after: ${(founderAfterPct * 100).toFixed(1)}%. Dilution: ${dilutionPct.toFixed(1)}%.`,
    optionPoolPct > 0
      ? `Option pool (pre-money) ${(optionPoolPct * 100).toFixed(1)}% → ${(poolSharePct * 100).toFixed(1)}% of post-money. Founders diluted by both investor and pool.`
      : 'Add optional pool % to see impact of pre-money option pool on founder ownership.',
    'For multiple rounds, use a cap table or multi-round dilution tool to track cumulative founder %.',
  ];

  const insights: string[] = [];
  if (status === 'low') {
    insights.push('Very low dilution; small round or high pre-money');
    insights.push('Founder ownership remains strong after round');
  } else if (status === 'typical') {
    insights.push('Dilution in typical range for seed/Series A');
    insights.push('Compare to benchmarks for your stage');
    insights.push('Model option pool and SAFEs for full picture');
  } else if (status === 'moderate') {
    insights.push('Moderate dilution; ensure round size justifies it');
    insights.push('Track cumulative dilution across rounds');
  } else {
    insights.push('High dilution in one round');
    insights.push('Model future rounds to avoid over-dilution');
    insights.push('Consider raising in stages if possible');
  }

  const considerations: string[] = [
    'Option pool pre-money dilutes founders; add it to see true founder % after.',
    'SAFEs and convertible notes convert at the round and dilute; model in a full cap table.',
    'Dilution benchmarks vary by stage and market; compare to peers.',
    'Multiple rounds compound dilution; use a cap table for cumulative view.',
  ];

  return {
    postMoneyValuation: postMoney,
    investorOwnershipPct: investorPct * 100,
    founderOwnershipAfterPct: founderAfterPct * 100,
    optionPoolPct: poolSharePct * 100,
    founderDilutionPct: dilutionPct,
    interpretation,
    recommendation,
    status,
    recommendations,
    insights,
    considerations,
  };
};

export default function FounderDilutionAfterFundingCalculator() {
  const [result, setResult] = useState<ResultPayload | null>(null);

  const form = useForm<FormValues>({
    resolver: zodResolver(formSchema),
    defaultValues: {
      preMoneyValuation: undefined,
      investmentAmount: undefined,
      founderOwnershipBeforePct: undefined,
      optionPoolPreMoneyPct: undefined,
    },
  });

  return (
    <div className="space-y-8">
      <Script id="founder-dilution-after-funding-schema" type="application/ld+json" strategy="afterInteractive" dangerouslySetInnerHTML={{ __html: JSON.stringify(schemaMarkup) }} />

      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <Users className="h-5 w-5" />
            Founder Dilution After Funding Calculator
          </CardTitle>
          <CardDescription>
            See founder ownership and dilution after a single funding round. Optional pre-money option pool. Startup-specific.
          </CardDescription>
        </CardHeader>
      </Card>

      <Card>
        <CardHeader>
          <CardTitle>Round assumptions</CardTitle>
          <CardDescription>Pre-money valuation, investment, founder % before round, optional option pool.</CardDescription>
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
                      <FormLabel>Pre-money valuation ($)</FormLabel>
                      <FormControl>
                        <Input type="number" step="1" placeholder="e.g. 10000000" value={field.value ?? ''} onChange={(e) => field.onChange(e.target.value === '' ? undefined : Number(e.target.value))} />
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
                      <FormLabel>Investment amount ($)</FormLabel>
                      <FormControl>
                        <Input type="number" step="1" placeholder="e.g. 3000000" value={field.value ?? ''} onChange={(e) => field.onChange(e.target.value === '' ? undefined : Number(e.target.value))} />
                      </FormControl>
                      <FormMessage />
                    </FormItem>
                  )}
                />
                <FormField
                  control={form.control}
                  name="founderOwnershipBeforePct"
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel>Founder ownership before round (%)</FormLabel>
                      <FormControl>
                        <Input type="number" step="0.1" placeholder="e.g. 70" value={field.value ?? ''} onChange={(e) => field.onChange(e.target.value === '' ? undefined : Number(e.target.value))} />
                      </FormControl>
                      <FormMessage />
                    </FormItem>
                  )}
                />
                <FormField
                  control={form.control}
                  name="optionPoolPreMoneyPct"
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel>Option pool pre-money (%) — optional</FormLabel>
                      <FormControl>
                        <Input type="number" step="0.5" placeholder="e.g. 10" value={field.value ?? ''} onChange={(e) => field.onChange(e.target.value === '' ? undefined : Number(e.target.value))} />
                      </FormControl>
                      <FormMessage />
                    </FormItem>
                  )}
                />
              </div>
              <Button type="submit" className="w-full">
                <Calculator className="mr-2 h-4 w-4" />
                Calculate Founder Dilution
              </Button>
            </form>
          </Form>
        </CardContent>
      </Card>

      {result && (
        <div className="space-y-6">
          <Card>
            <CardHeader>
              <div className="flex items-center gap-4">
                <Zap className="h-8 w-8 text-primary" />
                <div>
                  <CardTitle>Founder Dilution After Funding</CardTitle>
                  <CardDescription>Post-money valuation, ownership, and founder dilution</CardDescription>
                </div>
              </div>
            </CardHeader>
            <CardContent className="space-y-6">
              <div className="text-center">
                <p className="text-4xl font-bold text-primary">{result.founderDilutionPct.toFixed(1)}%</p>
                <p className="text-lg text-muted-foreground mt-2">Founder dilution</p>
                <p className="text-sm text-muted-foreground mt-1">{result.interpretation}</p>
              </div>
              <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                <div className="text-center p-4 bg-muted/50 rounded-lg">
                  <p className="font-semibold">Post-money</p>
                  <p className="text-xl font-bold text-primary">${result.postMoneyValuation.toLocaleString(undefined, { maximumFractionDigits: 0 })}</p>
                </div>
                <div className="text-center p-4 bg-muted/50 rounded-lg">
                  <p className="font-semibold">Status</p>
                  <Badge variant={result.status === 'low' ? 'default' : result.status === 'typical' ? 'secondary' : result.status === 'moderate' ? 'outline' : 'destructive'}>
                    {result.status.charAt(0).toUpperCase() + result.status.slice(1)}
                  </Badge>
                </div>
                <div className="text-center p-4 bg-muted/50 rounded-lg">
                  <p className="font-semibold">Founder after</p>
                  <p className="text-xl font-bold text-primary">{result.founderOwnershipAfterPct.toFixed(1)}%</p>
                </div>
              </div>
              <Alert>
                <Info className="h-4 w-4" />
                <AlertDescription>
                  <strong>Recommendation:</strong> {result.recommendation}
                </AlertDescription>
              </Alert>
            </CardContent>
          </Card>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            <Card className="h-full">
              <CardHeader>
                <CardTitle className="flex items-center gap-2 text-xl text-primary">
                  <Target className="h-6 w-6" />
                  Strategic Insights
                </CardTitle>
                <CardDescription>Ownership and dilution insights</CardDescription>
              </CardHeader>
              <CardContent className="space-y-4">
                {result.insights.map((insight, index) => (
                  <div key={index} className="flex items-start gap-3 p-3 bg-primary/5 rounded-lg border border-primary/10">
                    <CheckCircle2 className="h-5 w-5 text-primary mt-0.5 shrink-0" />
                    <span className="text-sm font-medium">{insight}</span>
                  </div>
                ))}
              </CardContent>
            </Card>
            <Card className="h-full border-red-100 bg-red-50/10 dark:border-red-900/20 dark:bg-red-900/5">
              <CardHeader>
                <CardTitle className="flex items-center gap-2 text-xl text-red-600 dark:text-red-400">
                  <AlertCircle className="h-6 w-6" />
                  Risk & Considerations
                </CardTitle>
                <CardDescription>Factors to monitor</CardDescription>
              </CardHeader>
              <CardContent className="space-y-4">
                {result.considerations.map((consideration, index) => (
                  <div key={index} className="flex items-start gap-3 p-3 bg-red-50 dark:bg-red-900/10 rounded-lg border border-red-100 dark:border-red-900/20">
                    <AlertCircle className="h-5 w-5 text-red-600 dark:text-red-400 mt-0.5 shrink-0" />
                    <span className="text-sm font-medium text-red-800 dark:text-red-300">{consideration}</span>
                  </div>
                ))}
              </CardContent>
            </Card>
          </div>
        </div>
      )}

      {/* Understanding the Inputs */}
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <Info className="h-5 w-5" />
            Understanding the Inputs
          </CardTitle>
          <CardDescription>Key components for founder dilution after funding</CardDescription>
        </CardHeader>
        <CardContent>
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div className="p-4 bg-blue-50 dark:bg-blue-900/10 rounded-lg border border-blue-100 dark:border-blue-900/20">
              <h4 className="font-semibold mb-2 flex items-center gap-2 text-blue-700 dark:text-blue-300">
                <DollarSign className="h-4 w-4" />
                Valuation & Investment
              </h4>
              <p className="text-sm text-muted-foreground mb-3">
                Pre-money valuation and investment amount. Post-money = pre-money + investment. Investor % = investment / post-money.
              </p>
              <ul className="space-y-2">
                <li className="flex items-start gap-2 text-sm text-muted-foreground">
                  <CheckCircle2 className="h-4 w-4 text-blue-500 mt-0.5 shrink-0" />
                  <span>Pre-money valuation ($)</span>
                </li>
                <li className="flex items-start gap-2 text-sm text-muted-foreground">
                  <CheckCircle2 className="h-4 w-4 text-blue-500 mt-0.5 shrink-0" />
                  <span>Investment amount ($)</span>
                </li>
              </ul>
            </div>
            <div className="p-4 bg-amber-50 dark:bg-amber-900/10 rounded-lg border border-amber-100 dark:border-amber-900/20">
              <h4 className="font-semibold mb-2 flex items-center gap-2 text-amber-700 dark:text-amber-300">
                <Users className="h-4 w-4" />
                Founder & Option Pool
              </h4>
              <p className="text-sm text-muted-foreground mb-3">
                Founder ownership % before the round. Optional option pool % (pre-money) dilutes founders; enter to see true founder % after.
              </p>
              <ul className="space-y-2">
                <li className="flex items-start gap-2 text-sm text-muted-foreground">
                  <CheckCircle2 className="h-4 w-4 text-amber-500 mt-0.5 shrink-0" />
                  <span>Founder ownership before round (%)</span>
                </li>
                <li className="flex items-start gap-2 text-sm text-muted-foreground">
                  <CheckCircle2 className="h-4 w-4 text-amber-500 mt-0.5 shrink-0" />
                  <span>Option pool pre-money (%) — optional</span>
                </li>
              </ul>
            </div>
          </div>
        </CardContent>
      </Card>

      {/* Formula Used */}
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <FunctionSquare className="h-5 w-5" />
            Formula Used
          </CardTitle>
        </CardHeader>
        <CardContent className="space-y-4">
          <div className="p-4 bg-muted rounded-lg overflow-x-auto">
            <p className="font-mono text-sm text-center">
              Post-money = Pre-money + Investment
            </p>
            <p className="font-mono text-sm text-center mt-2">
              Investor % = Investment / Post-money
            </p>
            <p className="font-mono text-sm text-center mt-2">
              Founder % after = Founder % before × (1 − Investor %)
            </p>
            <p className="font-mono text-sm text-center mt-2">
              Dilution % = (Founder % before − Founder % after) / Founder % before × 100
            </p>
          </div>
          <p className="text-sm text-muted-foreground mt-2">
            Option pool (pre-money) is a % of the pre-money cap; post-money it becomes optionPoolPct × (1 − Investor %) of the company.
          </p>
        </CardContent>
      </Card>

      {/* Related Calculators */}
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <Calculator className="h-5 w-5" />
            Related Financial Calculators
          </CardTitle>
          <CardDescription>Explore other valuation and startup finance tools</CardDescription>
        </CardHeader>
        <CardContent>
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
            {relatedCalculators.map((calc) => (
              <Link key={calc.slug} href={`/category/finance/${calc.slug}`} className="block">
                <Card className="hover:shadow-md transition-shadow cursor-pointer">
                  <CardContent className="p-4">
                    <div className="flex items-center gap-3">
                      <Users className="h-5 w-5 text-primary" />
                      <div>
                        <p className="font-medium">{calc.name}</p>
                        <p className="text-sm text-muted-foreground">{calc.description}</p>
                      </div>
                    </div>
                  </CardContent>
                </Card>
              </Link>
            ))}
          </div>
        </CardContent>
      </Card>

      {/* Complete Guide Section */}
      <section className="space-y-6 text-muted-foreground leading-relaxed bg-card p-6 md:p-10 rounded-lg shadow-lg" itemScope itemType="https://schema.org/Article">
        <meta itemProp="name" content="Founder Dilution After Funding: Post-Round Ownership and Dilution" />
        <meta itemProp="description" content="Expert guide to founder ownership and dilution after a single funding round, including optional pre-money option pool." />
        <meta itemProp="keywords" content="founder dilution, post-money valuation, option pool, startup funding, ownership after round" />
        <meta itemProp="url" content="/category/finance/founder-dilution-after-funding-calculator" />
        <h1 className="text-3xl md:text-4xl font-extrabold text-foreground mb-4" itemProp="headline">Founder Dilution After Funding: Post-Round Ownership</h1>
        <p className="text-lg italic text-muted-foreground">See founder ownership and dilution after a single funding round. Optional pre-money option pool. Startup-specific.</p>
        <h2 className="text-2xl font-bold text-foreground mt-8 mb-4">Table of Contents</h2>
        <ul className="list-disc ml-6 space-y-2 text-primary">
          <li><a href="#fd-definition" className="hover:underline">What Is Founder Dilution After Funding?</a></li>
          <li><a href="#fd-formula" className="hover:underline">Formulas and Components</a></li>
          <li><a href="#fd-interpretation" className="hover:underline">Interpreting Results</a></li>
          <li><a href="#fd-conclusion" className="hover:underline">Conclusion</a></li>
        </ul>
        <hr />
        <h2 id="fd-definition" className="text-2xl font-bold text-foreground pt-8" itemProp="articleSection">What Is Founder Dilution After Funding?</h2>
        <p>Founder dilution is the drop in founder ownership % after a round. New shares go to investors (and optionally an option pool), so founders own a smaller slice of a larger company. This calculator models a single round: pre-money valuation, investment, founder % before, and optional pre-money option pool.</p>
        <h3 className="text-xl font-semibold text-foreground mt-6">Why Option Pool Pre-Money Matters</h3>
        <p>Many rounds add or top up an option pool before the round (pre-money), which dilutes founders. Enter the pool % to see true founder % after the round.</p>
        <hr />
        <h2 id="fd-formula" className="text-2xl font-bold text-foreground pt-8" itemProp="articleSection">Formulas and Components</h2>
        <p>Post-money = Pre-money + Investment. Investor % = Investment / Post-money. Founder % after = Founder % before × (1 − Investor %). Dilution % = (Founder % before − Founder % after) / Founder % before × 100.</p>
        <hr />
        <h2 id="fd-interpretation" className="text-2xl font-bold text-foreground pt-8" itemProp="articleSection">Interpreting Results</h2>
        <p>Seed often 10–25% dilution, Series A 15–25%, Series B 10–20%. Higher dilution in one round can limit flexibility in later rounds; model multiple rounds in a cap table for full picture.</p>
        <hr />
        <h2 id="fd-conclusion" className="text-2xl font-bold text-foreground pt-8" itemProp="articleSection">Conclusion</h2>
        <p>Use this calculator to see founder ownership and dilution after a single funding round, including optional pre-money option pool. Pair with a post-funding runway calculator to plan both runway and ownership impact of the round.</p>
      </section>

      {/* FAQ Section */}
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <Info className="h-5 w-5" />
            Frequently Asked Questions
          </CardTitle>
          <CardDescription>Common questions about founder dilution after funding</CardDescription>
        </CardHeader>
        <CardContent>
          <div className="space-y-6">
            {faqs.map((faq, i) => (
              <div key={i}>
                <h4 className="font-semibold text-lg mb-3">{faq.question}</h4>
                <p className="text-muted-foreground">{faq.answer}</p>
              </div>
            ))}
          </div>
        </CardContent>
      </Card>

      {/* Usage of this Calculator */}
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <Briefcase className="h-5 w-5" />
            Usage of this Calculator
          </CardTitle>
          <CardDescription>Practical applications and context</CardDescription>
        </CardHeader>
        <CardContent className="space-y-6">
          <div>
            <h4 className="flex items-center gap-2 font-semibold text-lg mb-3">
              <Users className="h-5 w-5 text-blue-600" />
              Who Should Use This Calculator?
            </h4>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div className="p-3 bg-muted/50 rounded-lg border border-border/50">
                <strong className="block text-primary mb-1">Founders</strong>
                <span className="text-sm text-muted-foreground">To see post-round ownership and dilution before or after a term sheet, including option pool impact.</span>
              </div>
              <div className="p-3 bg-muted/50 rounded-lg border border-border/50">
                <strong className="block text-primary mb-1">Investors & Advisors</strong>
                <span className="text-sm text-muted-foreground">To model founder dilution and option pool for a single round.</span>
              </div>
            </div>
          </div>
          <hr className="border-border/50" />
          <div>
            <h4 className="flex items-center gap-2 font-semibold text-lg mb-3">
              <AlertTriangle className="h-5 w-5 text-amber-600" />
              Limitations & Accuracy
            </h4>
            <ul className="space-y-2 text-sm text-muted-foreground">
              <li className="flex gap-2">
                <CheckCircle2 className="h-4 w-4 text-amber-500 shrink-0 mt-0.5" />
                <span><strong>Single round:</strong> For multiple rounds, use a cap table to track cumulative dilution.</span>
              </li>
              <li className="flex gap-2">
                <CheckCircle2 className="h-4 w-4 text-amber-500 shrink-0 mt-0.5" />
                <span><strong>SAFEs/notes:</strong> They convert at the round and dilute; model in a full cap table.</span>
              </li>
            </ul>
          </div>
          <hr className="border-border/50" />
          <div>
            <h4 className="flex items-center gap-2 font-semibold text-lg mb-3">
              <Landmark className="h-5 w-5 text-green-600" />
              Example
            </h4>
            <div className="p-4 rounded-lg bg-green-50 dark:bg-green-900/10 border border-green-100 dark:border-green-900/20">
              <p className="text-sm text-muted-foreground">
                $10M pre-money, $3M investment, 70% founder before, no pool. Post-money = $13M. Investor = 23.1%. Founder after = 70% × (1 − 0.231) ≈ 53.8%. Dilution ≈ 23.1%. With 10% option pool pre-money, founder % after is still 53.8% (pool dilutes proportionally with other pre-money holders in this simplified model).
              </p>
            </div>
          </div>
        </CardContent>
      </Card>

      {/* Summary */}
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <Shield className="h-5 w-5" />
            Summary
          </CardTitle>
        </CardHeader>
        <CardContent className="space-y-2 text-sm text-muted-foreground">
          <p>The Founder Dilution After Funding Calculator shows post-money valuation, investor %, founder % after, and founder dilution for a single round.</p>
          <p>Enter pre-money valuation, investment, founder % before, and optional option pool % (pre-money) to see post-funding ownership and dilution.</p>
        </CardContent>
      </Card>
    </div>
  );
}
